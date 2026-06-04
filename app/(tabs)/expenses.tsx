import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CATEGORIES, type ExpenseCategory } from '../../constants/categories';
import { useExpenseStore } from '../../store/useExpenses';
import DemoBanner from '../../components/DemoBanner';
import { IS_DEMO } from '../../lib/demo';

const ALL = 'all';

export default function ExpensesScreen() {
  const expenses = useExpenseStore((s) => s.expenses);
  const [filter, setFilter] = useState<string>(ALL);
  const [search, setSearch] = useState('');

  const filtered = expenses.filter((e) => {
    const matchCat = filter === ALL || e.category === filter;
    const matchSearch = !search || e.merchant.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const ytdTotal = filtered.reduce((sum, e) => sum + e.deductibleAmount, 0);

  const usedCategories = [...new Set(expenses.map((e) => e.category))];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Expenses</Text>
        {IS_DEMO && <DemoBanner />}
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search merchant..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, filter === ALL && styles.chipActive]}
          onPress={() => setFilter(ALL)}
        >
          <Text style={[styles.chipText, filter === ALL && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {usedCategories.map((cat) => {
          const meta = CATEGORIES[cat as ExpenseCategory];
          if (!meta) return null;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, filter === cat && styles.chipActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>
                {meta.emoji} {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* YTD total */}
      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>YTD Deductions</Text>
        <Text style={styles.totalAmount}>${ytdTotal.toFixed(2)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧾</Text>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySub}>Scan a receipt to get started</Text>
          </View>
        ) : (
          filtered.map((expense) => {
            const meta = CATEGORIES[expense.category as ExpenseCategory];
            return (
              <View key={expense.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardEmoji}>{meta?.emoji ?? '📄'}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardMerchant}>{expense.merchant}</Text>
                    <Text style={styles.cardCategory}>{meta?.label ?? expense.category}</Text>
                    <Text style={styles.cardDate}>{expense.date}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardAmount}>${expense.deductibleAmount.toFixed(2)}</Text>
                  {expense.amount !== expense.deductibleAmount && (
                    <Text style={styles.cardOriginal}>${expense.amount.toFixed(2)} (50%)</Text>
                  )}
                  {!expense.isManual && (
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>✨ AI</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  searchRow: { paddingHorizontal: 20, marginBottom: 8 },
  search: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipScroll: { flexGrow: 0 },
  chips: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  chip: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  totalAmount: { fontSize: 18, fontWeight: '900', color: Colors.primaryLight },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardMerchant: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardCategory: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  cardDate: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  cardRight: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 16, fontWeight: '900', color: Colors.primaryLight },
  cardOriginal: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  aiBadge: { backgroundColor: 'rgba(102,187,106,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  aiBadgeText: { fontSize: 10, color: Colors.primaryLight, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary },
});
