import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

admin.initializeApp();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RECEIPT_CATEGORIES = [
  'mileage', 'supplies', 'software', 'meals', 'home_office',
  'phone_internet', 'marketing', 'professional_services', 'equipment', 'other',
] as const;

const SCHEDULE_C_LINES: Record<string, string> = {
  mileage: 'Line 9 — Car and truck expenses',
  supplies: 'Line 22 — Supplies',
  software: 'Line 27a — Other expenses',
  meals: 'Line 24b — Meals (50% deductible)',
  home_office: 'Line 30 — Home office',
  phone_internet: 'Line 27a — Phone/internet',
  marketing: 'Line 8 — Advertising',
  professional_services: 'Line 17 — Legal and professional',
  equipment: 'Line 13 — Depreciation',
  other: 'Line 27a — Other expenses',
};

export interface ReceiptAnalysis {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  scheduleCLine: string;
  confidence: number;
}

export const analyzeReceipt = functions.https.onCall(
  async (data: { imageUrl: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { imageUrl } = data;
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'imageUrl is required.');
    }

    const prompt = `You are a tax assistant for US gig workers (DoorDash, Uber, Upwork, freelancers).
Analyze this receipt image and extract:
1. Merchant name
2. Total amount (number, USD)
3. Date (YYYY-MM-DD format)
4. Best-fit Schedule C expense category from this list: ${RECEIPT_CATEGORIES.join(', ')}

Respond ONLY with a JSON object in this exact format:
{
  "merchant": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "category": "one of the categories above",
  "confidence": number between 0 and 1
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
            ],
          },
        ],
      });

      const raw = response.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as {
        merchant: string;
        amount: number;
        date: string;
        category: string;
        confidence: number;
      };

      const category = RECEIPT_CATEGORIES.includes(parsed.category as typeof RECEIPT_CATEGORIES[number])
        ? parsed.category
        : 'other';

      const result: ReceiptAnalysis = {
        merchant: String(parsed.merchant ?? 'Unknown'),
        amount: Number(parsed.amount ?? 0),
        date: String(parsed.date ?? new Date().toISOString().split('T')[0]),
        category,
        scheduleCLine: SCHEDULE_C_LINES[category] ?? SCHEDULE_C_LINES.other,
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.8))),
      };

      return result;
    } catch (e) {
      console.error('[analyzeReceipt] error:', e);
      throw new functions.https.HttpsError('internal', 'Receipt analysis failed.');
    }
  }
);
