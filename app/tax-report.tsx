import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { CATEGORIES, TAX_BRACKET_RATE, type ExpenseCategory } from '../constants/categories';
import { IS_DEMO } from '../lib/demo';
import { useUserStore } from '../store/useUser';
import { useExpenseStore } from '../store/useExpenses';

const MISSED_DEDUCTIONS = [
  { emoji: '🏠', title: 'Home office deduction', body: 'If you work from home, you may qualify for a home office deduction. Track your dedicated workspace.' },
  { emoji: '📱', title: 'Phone / internet', body: 'A portion of your phone and internet bill is deductible if used for business.' },
  { emoji: '📚', title: 'Education & courses', body: 'Online courses and books related to your gig work are deductible under Other expenses.' },
];

export default function TaxReportScreen() {
  const router = useRouter();
  const subscriptionTier = useUserStore((s) => s.subscriptionTier);
  const expenses = useExpenseStore((s) => s.expenses);
  const mileage = useExpenseStore((s) => s.mileage);

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.deductibleAmount;
    return acc;
  }, {});

  const totalExpenses = Object.values(byCategory).reduce((s, v) => s + v, 0);
  const totalMileage = mileage.reduce((s, m) => s + m.deductibleAmount, 0);
  const totalMiles = mileage.reduce((s, m) => s + m.miles, 0);
  const grandTotal = totalExpenses + totalMileage;
  const projectedSavings = Math.round(grandTotal * TAX_BRACKET_RATE);

  function handleExport() {
    if (!IS_DEMO && subscriptionTier !== 'premium') {
      router.push('/paywall');
      return;
    }
    // Generate CSV in demo
    const rows = [
      ['Date', 'Merchant', 'Amount', 'Deductible', 'Category', 'Schedule C Line'],
      ...expenses.map((e) => [
        e.date, e.merchant, e.amount, e.deductibleAmount, e.category, e.scheduleCLine,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    Alert.alert('CSV Export', IS_DEMO ? 'Demo mode — CSV would download here.\n\nSample:\n' + csv.split('\n').slice(0, 3).join('\n') : 'Exported!');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.close}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Tax Report</Text>
        <TouchableOpacity onPress={handleExport}>
          <Text style={styles.exportText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>2025 Schedule C Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${grandTotal.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Total Deductions</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${projectedSavings}</Text>
              <Text style={styles.summaryLabel}>Tax Savings (30%)</Text>
            </View>
          </View>
        </View>

        {/* Schedule C breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule C Breakdown</Text>
          {Object.entries(byCategory).map(([cat, amount]) => {
            const meta = CATEGORIES[cat as ExpenseCategory];
            if (!meta) return null;
            return (
              <View key={cat} style={styles.lineItem}>
                <Text style={styles.lineEmoji}>{meta.emoji}</Text>
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>{meta.label}</Text>
                  <Text style={styles.lineCode}>{meta.scheduleCLine}</Text>
                </View>
                <Text style={styles.lineAmount}>${amount.toFixed(2)}</Text>
              </View>
            );
          })}
          {/* Mileage line */}
          {totalMileage > 0 && (
            <View style={styles.lineItem}>
              <Text style={styles.lineEmoji}>🚗</Text>
              <View style={styles.lineInfo}>
                <Text style={styles.lineName}>Mileage ({totalMiles.toFixed(1)} mi)</Text>
                <Text style={styles.lineCode}>Line 9 — Car and truck expenses</Text>
              </View>
              <Text style={styles.lineAmount}>${totalMileage.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Missed deductions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Possible Missed Deductions</Text>
          {MISSED_DEDUCTIONS.map((d) => (
            <View key={d.title} style={styles.missedCard}>
              <Text style={styles.missedEmoji}>{d.emoji}</Text>
              <View style={styles.missedInfo}>
                <Text style={styles.missedTitle}>{d.title}</Text>
                <Text style={styles.missedBody}>{d.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Premium upsell for export */}
        {subscriptionTier === 'free' && !IS_DEMO && (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push('/paywall')}>
            <Text style={styles.premiumEmoji}>⭐</Text>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Export to CSV — Premium</Text>
              <Text style={styles.premiumSub}>Send your tax report directly to your accountant</Text>
            </View>
            <Text style={styles.premiumArrow}>→</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  close: { color: Colors.textSecondary, fontSize: 15 },
  navTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  exportText: { color: Colors.primaryLight, fontWeight: '700', fontSize: 15 },
  scroll: { padding: 20, paddingBottom: 60, gap: 20 },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
  },
  summaryTitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 28, fontWeight: '900', color: Colors.white },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lineEmoji: { fontSize: 22, width: 28 },
  lineInfo: { flex: 1 },
  lineName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  lineCode: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  lineAmount: { fontSize: 15, fontWeight: '900', color: Colors.primaryLight },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: Colors.text },
  totalAmount: { fontSize: 20, fontWeight: '900', color: Colors.primaryLight },
  missedCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,167,38,0.08)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,167,38,0.2)',
  },
  missedEmoji: { fontSize: 24, width: 32 },
  missedInfo: { flex: 1 },
  missedTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  missedBody: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  premiumEmoji: { fontSize: 24 },
  premiumInfo: { flex: 1 },
  premiumTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  premiumSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  premiumArrow: { fontSize: 18, color: Colors.textMuted },
});
