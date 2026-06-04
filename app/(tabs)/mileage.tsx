import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { IRS_MILEAGE_RATE } from '../../constants/categories';
import { IS_DEMO } from '../../lib/demo';
import { useExpenseStore } from '../../store/useExpenses';
import DemoBanner from '../../components/DemoBanner';

export default function MileageScreen() {
  const mileage = useExpenseStore((s) => s.mileage);
  const addMileageLog = useExpenseStore((s) => s.addMileageLog);
  const [showModal, setShowModal] = useState(false);
  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const totalMiles = mileage.reduce((sum, m) => sum + m.miles, 0);
  const totalDeductions = mileage.reduce((sum, m) => sum + m.deductibleAmount, 0);

  async function handleSave() {
    const milesNum = parseFloat(miles);
    if (!milesNum || milesNum <= 0) {
      Alert.alert('Invalid miles', 'Enter a valid mileage amount.');
      return;
    }
    if (!purpose.trim()) {
      Alert.alert('Purpose required', 'Describe the business purpose of this trip.');
      return;
    }
    setSaving(true);
    const deductibleAmount = Math.round(milesNum * IRS_MILEAGE_RATE * 100) / 100;
    const log = {
      id: `mile-${Date.now()}`,
      date,
      miles: milesNum,
      purpose: purpose.trim(),
      deductibleAmount,
      createdAt: new Date().toISOString(),
    };

    if (IS_DEMO) {
      addMileageLog(log);
      setSaving(false);
      Alert.alert('Demo mode — not saved', 'In the live app this would save to Firestore.');
    } else {
      // TODO: save to Firestore
      addMileageLog(log);
      setSaving(false);
    }

    setMiles('');
    setPurpose('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowModal(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mileage</Text>
        <View style={styles.headerRight}>
          {IS_DEMO && <DemoBanner />}
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ Log</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalMiles.toFixed(1)}</Text>
          <Text style={styles.summaryLabel}>Total Miles</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${totalDeductions.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Deduction</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${IRS_MILEAGE_RATE}/mi</Text>
          <Text style={styles.summaryLabel}>IRS Rate</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {mileage.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🚗</Text>
            <Text style={styles.emptyTitle}>No mileage logged</Text>
            <Text style={styles.emptySub}>Track every business mile at $0.70/mile</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>Log First Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          mileage.map((log) => (
            <View key={log.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardEmoji}>🚗</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardPurpose}>{log.purpose}</Text>
                  <Text style={styles.cardMeta}>{log.miles} miles · {log.date}</Text>
                </View>
              </View>
              <Text style={styles.cardDeduction}>${log.deductibleAmount.toFixed(2)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Log Mileage</Text>
            <Text style={styles.modalSub}>IRS rate: ${IRS_MILEAGE_RATE}/mile for 2025</Text>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View>
                <Text style={styles.label}>Miles</Text>
                <TextInput
                  style={styles.input}
                  value={miles}
                  onChangeText={setMiles}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              {miles && parseFloat(miles) > 0 && (
                <View style={styles.calcRow}>
                  <Text style={styles.calcText}>
                    Deduction: ${(parseFloat(miles) * IRS_MILEAGE_RATE).toFixed(2)}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.label}>Business Purpose</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={purpose}
                  onChangeText={setPurpose}
                  placeholder="e.g. DoorDash delivery shift, client meeting..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
              </View>
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: { fontSize: 17, fontWeight: '900', color: Colors.primaryLight },
  summaryLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, fontWeight: '600' },
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
  cardPurpose: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardDeduction: { fontSize: 16, fontWeight: '900', color: Colors.primaryLight },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  modalSub: { fontSize: 13, color: Colors.textSecondary, marginTop: -8 },
  form: { gap: 12 },
  label: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  calcRow: { backgroundColor: 'rgba(102,187,106,0.1)', borderRadius: 10, padding: 10 },
  calcText: { color: Colors.primaryLight, fontWeight: '700', fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.5 },
});
