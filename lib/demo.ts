import Constants from 'expo-constants';
import type { ExpenseCategory } from '../constants/categories';

const apiKey =
  Constants.expoConfig?.extra?.firebaseApiKey ??
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
  '';

export const IS_DEMO = !apiKey || apiKey === 'REPLACE_WITH_VALUE';

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  subscriptionTier: 'free' | 'premium';
}

export const DEMO_USER: DemoUser = {
  uid: 'demo-user-001',
  email: 'demo@receiptai.app',
  displayName: 'Alex (Demo)',
  subscriptionTier: 'premium',
};

export interface DemoExpense {
  id: string;
  merchant: string;
  amount: number;
  deductibleAmount: number;
  date: string;
  category: ExpenseCategory;
  scheduleCLine: string;
  imageUrl: string | null;
  isManual: boolean;
  createdAt: string;
}

export const DEMO_EXPENSES: DemoExpense[] = [
  {
    id: 'exp-001',
    merchant: 'Amazon',
    amount: 45.99,
    deductibleAmount: 45.99,
    date: '2025-01-08',
    category: 'supplies',
    scheduleCLine: 'Line 22 — Supplies',
    imageUrl: null,
    isManual: false,
    createdAt: '2025-01-08T10:00:00Z',
  },
  {
    id: 'exp-002',
    merchant: 'Zoom',
    amount: 14.99,
    deductibleAmount: 14.99,
    date: '2025-01-10',
    category: 'software',
    scheduleCLine: 'Line 27a — Other expenses',
    imageUrl: null,
    isManual: false,
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'exp-003',
    merchant: 'Shell Gas Station',
    amount: 52.30,
    deductibleAmount: 52.30,
    date: '2025-01-12',
    category: 'mileage',
    scheduleCLine: 'Line 9 — Car and truck expenses',
    imageUrl: null,
    isManual: true,
    createdAt: '2025-01-12T14:00:00Z',
  },
  {
    id: 'exp-004',
    merchant: 'Whole Foods',
    amount: 38.50,
    deductibleAmount: 19.25,
    date: '2025-01-15',
    category: 'meals',
    scheduleCLine: 'Line 24b — Meals (50% deductible)',
    imageUrl: null,
    isManual: false,
    createdAt: '2025-01-15T12:00:00Z',
  },
  {
    id: 'exp-005',
    merchant: 'AT&T',
    amount: 89.00,
    deductibleAmount: 89.00,
    date: '2025-01-18',
    category: 'phone_internet',
    scheduleCLine: 'Line 27a — Phone/internet',
    imageUrl: null,
    isManual: false,
    createdAt: '2025-01-18T08:00:00Z',
  },
  {
    id: 'exp-006',
    merchant: 'FedEx Office',
    amount: 22.00,
    deductibleAmount: 22.00,
    date: '2025-01-20',
    category: 'supplies',
    scheduleCLine: 'Line 22 — Supplies',
    imageUrl: null,
    isManual: false,
    createdAt: '2025-01-20T11:00:00Z',
  },
  {
    id: 'exp-007',
    merchant: 'Fiverr Commission',
    amount: 150.00,
    deductibleAmount: 150.00,
    date: '2025-01-22',
    category: 'professional_services',
    scheduleCLine: 'Line 17 — Legal and professional',
    imageUrl: null,
    isManual: true,
    createdAt: '2025-01-22T16:00:00Z',
  },
  {
    id: 'exp-008',
    merchant: 'Google Workspace',
    amount: 12.00,
    deductibleAmount: 12.00,
    date: '2025-01-25',
    category: 'software',
    scheduleCLine: 'Line 27a — Other expenses',
    imageUrl: null,
    isManual: false,
    createdAt: '2025-01-25T07:00:00Z',
  },
];

export interface DemoMileageLog {
  id: string;
  date: string;
  miles: number;
  purpose: string;
  deductibleAmount: number;
  createdAt: string;
}

export const DEMO_MILEAGE: DemoMileageLog[] = [
  {
    id: 'mile-001',
    date: '2025-01-07',
    miles: 28.5,
    purpose: 'DoorDash delivery shift',
    deductibleAmount: 19.95,
    createdAt: '2025-01-07T18:00:00Z',
  },
  {
    id: 'mile-002',
    date: '2025-01-09',
    miles: 35.2,
    purpose: 'Uber Eats evening run',
    deductibleAmount: 24.64,
    createdAt: '2025-01-09T20:00:00Z',
  },
  {
    id: 'mile-003',
    date: '2025-01-14',
    miles: 42.0,
    purpose: 'Client meeting — downtown',
    deductibleAmount: 29.40,
    createdAt: '2025-01-14T14:00:00Z',
  },
];

// Total deductions: 45.99 + 14.99 + 52.30 + 19.25 + 89.00 + 22.00 + 150.00 + 12.00 = 405.53
// + mileage deductions: 19.95 + 24.64 + 29.40 = 73.99
// Total: ~479.52 — shown as ~$425 on dashboard (expenses only)
export const DEMO_TOTAL_DEDUCTIONS = 405.53;
export const DEMO_TAX_SAVINGS = Math.round(DEMO_TOTAL_DEDUCTIONS * 0.30);
