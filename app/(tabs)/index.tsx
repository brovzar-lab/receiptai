import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CATEGORIES, TAX_BRACKET_RATE, type ExpenseCategory } from '../../constants/categories';
import { IS_DEMO } from '../../lib/demo';
import { useUserStore } from '../../store/useUser';
import { useExpenseStore } from '../../store/useExpenses';
import DemoBanner from '../../components/DemoBanner';

export default function DashboardScreen() {
  const router = useRouter();
  const displayName = useUserStore((s) => s.displayName);
  const expenses = useExpenseStore((s) => s.expenses);
  const mileage = useExpenseStore((s) => s.mileage);

  const totalDeductions = expenses.reduce((sum, e) => sum + e.deductibleAmount, 0);
  const mileageDeductions = mileage.reduce((sum, m) => sum + m.deductibleAmount, 0);
  const grandTotal = totalDeductions + mileageDeductions;
  const projectedSavings = Math.round(grandTotal * TAX_BRACKET_RATE);

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.deductibleAmount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxAmount = sortedCategories[0]?.[1] ?? 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {displayName?.split(' ')[0] ?? 'there'} 👋</Text>
            <Text style={styles.year}>2025 Tax Year</Text>
          </View>
          {IS_DEMO && <DemoBanner />}
        </View>

        {/* Hero stat */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>You have saved</Text>
          <Text style={styles.heroAmount}>${grandTotal.toFixed(2)}</Text>
          <Text style={styles.heroSub}>in deductions this year</Text>
          <View style={styles.savingsRow}>
            <View style={styles.savingsPill}>
              <Text style={styles.savingsEmoji}>💸</Text>
              <Text style={styles.savingsText}>
                Projected tax savings:{' '}
                <Text style={styles.savingsAmount}>${projectedSavings}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{expenses.length}</Text>
            <Text style={styles.statLabel}>Receipts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalDeductions.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${mileageDeductions.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Mileage</Text>
          </View>
        </View>

        {/* Category breakdown */}
        {sortedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By Category</Text>
            {sortedCategories.map(([cat, amount]) => {
              const meta = CATEGORIES[cat as ExpenseCategory];
              if (!meta) return null;
              const pct = amount / maxAmount;
              return (
                <View key={cat} style={styles.categoryRow}>
                  <Text style={styles.catEmoji}>{meta.emoji}</Text>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={styles.catLabel}>{meta.label}</Text>
                      <Text style={styles.catAmount}>${amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Tax report CTA */}
        <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/tax-report')}>
          <Text style={styles.reportBtnText}>📋 View Tax Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text },
  year: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  heroAmount: { fontSize: 52, fontWeight: '900', color: Colors.white, marginVertical: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  savingsRow: { width: '100%' },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  savingsEmoji: { fontSize: 18 },
  savingsText: { fontSize: 13, color: Colors.white, flex: 1 },
  savingsAmount: { fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  catEmoji: { fontSize: 22, width: 32 },
  catInfo: { flex: 1 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catLabel: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  catAmount: { fontSize: 14, color: Colors.primaryLight, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  barFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  reportBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportBtnText: { color: Colors.text, fontWeight: '700', fontSize: 15 },
});
