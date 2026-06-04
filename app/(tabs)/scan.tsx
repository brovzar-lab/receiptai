import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { CATEGORIES, type ExpenseCategory } from '../../constants/categories';
import { IS_DEMO } from '../../lib/demo';
import { useUserStore } from '../../store/useUser';
import { useExpenseStore } from '../../store/useExpenses';
import DemoBanner from '../../components/DemoBanner';

const FREE_TIER_LIMIT = 10;

interface AnalysisResult {
  merchant: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  scheduleCLine: string;
  confidence: number;
}

function mockAnalyze(imageUri: string): Promise<AnalysisResult> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        merchant: 'Office Depot',
        amount: 34.99,
        date: new Date().toISOString().split('T')[0],
        category: 'supplies',
        scheduleCLine: 'Line 22 — Supplies',
        confidence: 0.94,
      });
    }, 1500)
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const subscriptionTier = useUserStore((s) => s.subscriptionTier);
  const receiptCount = useUserStore((s) => s.receiptCount);
  const incrementReceiptCount = useUserStore((s) => s.incrementReceiptCount);
  const addExpense = useExpenseStore((s) => s.addExpense);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editMerchant, setEditMerchant] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('supplies');
  const [saving, setSaving] = useState(false);

  const atLimit = subscriptionTier === 'free' && receiptCount >= FREE_TIER_LIMIT;

  async function pickImage() {
    if (atLimit) {
      router.push('/paywall');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      await analyzeReceipt(res.assets[0].uri);
    }
  }

  async function takePhoto() {
    if (atLimit) {
      router.push('/paywall');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera access required', 'Enable camera access in Settings to scan receipts.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled && res.assets[0]) {
      await analyzeReceipt(res.assets[0].uri);
    }
  }

  async function analyzeReceipt(uri: string) {
    setImageUri(uri);
    setAnalyzing(true);
    setResult(null);
    try {
      const analysis = IS_DEMO
        ? await mockAnalyze(uri)
        : await mockAnalyze(uri); // TODO: call Firebase Cloud Function analyzeReceipt
      setResult(analysis);
      setEditMerchant(analysis.merchant);
      setEditAmount(String(analysis.amount));
      setEditCategory(analysis.category);
    } catch (e) {
      Alert.alert('Analysis failed', IS_DEMO ? 'Demo mode — using mock data' : 'Could not analyze receipt. Try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveExpense() {
    if (!result) return;
    setSaving(true);

    const cat = CATEGORIES[editCategory];
    const rawAmount = parseFloat(editAmount) || result.amount;
    const deductibleAmount = editCategory === 'meals' ? rawAmount * 0.5 : rawAmount;

    const expense = {
      id: `exp-${Date.now()}`,
      merchant: editMerchant || result.merchant,
      amount: rawAmount,
      deductibleAmount,
      date: result.date,
      category: editCategory,
      scheduleCLine: cat.scheduleCLine,
      imageUrl: imageUri,
      isManual: false,
      createdAt: new Date().toISOString(),
    };

    if (IS_DEMO) {
      addExpense(expense);
      incrementReceiptCount();
      setSaving(false);
      Alert.alert('Demo mode — not saved', 'In the live app this would save to Firestore.');
      reset();
      return;
    }

    // TODO: save to Firestore
    addExpense(expense);
    incrementReceiptCount();
    setSaving(false);
    Alert.alert('Saved!', `$${deductibleAmount.toFixed(2)} deduction added.`);
    reset();
  }

  function reset() {
    setImageUri(null);
    setResult(null);
    setEditMerchant('');
    setEditAmount('');
  }

  if (atLimit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.limitView}>
          <Text style={styles.limitEmoji}>🔒</Text>
          <Text style={styles.limitTitle}>Free limit reached</Text>
          <Text style={styles.limitSub}>You've scanned {receiptCount} receipts. Upgrade for unlimited scans + AI categorization.</Text>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/paywall')}>
            <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Scan Receipt</Text>
          {IS_DEMO && <DemoBanner />}
        </View>

        {!result && !analyzing && (
          <View style={styles.scanArea}>
            <View style={styles.cameraFrame}>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraHint}>Point camera at your receipt</Text>
              <Text style={styles.cameraSubHint}>AI will extract merchant, amount & category</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.scanBtn} onPress={takePhoto}>
                <Text style={styles.scanBtnText}>📷 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.scanBtn, styles.scanBtnSecondary]} onPress={pickImage}>
                <Text style={styles.scanBtnSecondaryText}>🖼️ Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {analyzing && (
          <View style={styles.analyzingView}>
            <ActivityIndicator size="large" color={Colors.primaryLight} />
            <Text style={styles.analyzingText}>Analyzing receipt...</Text>
            <Text style={styles.analyzingSubText}>AI is extracting your expense details</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Receipt Analyzed ✨</Text>
              <Text style={styles.confidenceBadge}>{Math.round(result.confidence * 100)}% confident</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Merchant</Text>
              <TextInput
                style={styles.fieldInput}
                value={editMerchant}
                onChangeText={setEditMerchant}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Amount ($)</Text>
              <TextInput
                style={styles.fieldInput}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Category</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catChips}>
              {Object.entries(CATEGORIES).map(([key, meta]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.catChip, editCategory === key && styles.catChipActive]}
                  onPress={() => setEditCategory(key as ExpenseCategory)}
                >
                  <Text style={[styles.catChipText, editCategory === key && styles.catChipTextActive]}>
                    {meta.emoji} {meta.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {editCategory === 'meals' && (
              <Text style={styles.mealNote}>🍽️ Meals are 50% deductible under Schedule C</Text>
            )}

            <Text style={styles.scheduleLine}>{CATEGORIES[editCategory].scheduleCLine}</Text>

            <View style={styles.saveRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={reset}>
                <Text style={styles.cancelBtnText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabled]}
                onPress={saveExpense}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Expense'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  scanArea: { gap: 20 },
  cameraFrame: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: 48,
    alignItems: 'center',
    gap: 8,
  },
  cameraIcon: { fontSize: 56 },
  cameraHint: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cameraSubHint: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  scanBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  scanBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  scanBtnSecondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  scanBtnSecondaryText: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  analyzingView: { alignItems: 'center', paddingTop: 60, gap: 16 },
  analyzingText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  analyzingSubText: { fontSize: 14, color: Colors.textSecondary },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  confidenceBadge: {
    backgroundColor: 'rgba(102,187,106,0.15)',
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  fieldRow: { gap: 6 },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  fieldInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catScroll: { flexGrow: 0 },
  catChips: { gap: 8 },
  catChip: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: Colors.white },
  mealNote: { fontSize: 13, color: Colors.warning, fontWeight: '600' },
  scheduleLine: { fontSize: 12, color: Colors.textMuted },
  saveRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.5 },
  limitView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  limitEmoji: { fontSize: 64 },
  limitTitle: { fontSize: 24, fontWeight: '900', color: Colors.text },
  limitSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  upgradeBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 18, width: '100%', alignItems: 'center' },
  upgradeBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
