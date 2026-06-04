import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Colors } from '../../constants/colors';
import { IS_DEMO } from '../../lib/demo';
import { auth } from '../../lib/firebase';
import { useUserStore } from '../../store/useUser';
import DemoBanner from '../../components/DemoBanner';

export default function SettingsScreen() {
  const router = useRouter();
  const { displayName, email, subscriptionTier, signOut: clearUser } = useUserStore();
  const [restoring, setRestoring] = useState(false);

  async function handleSignOut() {
    if (IS_DEMO) {
      clearUser();
      return;
    }
    try {
      await signOut(auth!);
      clearUser();
    } catch (e) {
      Alert.alert('Error', 'Could not sign out. Try again.');
    }
  }

  async function handleRestore() {
    if (IS_DEMO) {
      Alert.alert('Demo mode', 'Restore purchases is not available in demo mode.');
      return;
    }
    setRestoring(true);
    try {
      const { restorePurchases } = await import('../../lib/revenuecat');
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Restored!', 'Your premium subscription has been restored.');
      } else {
        Alert.alert('No subscription found', 'We could not find an active subscription to restore.');
      }
    } catch {
      Alert.alert('Error', 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Settings</Text>
        {IS_DEMO && <DemoBanner />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{displayName ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{email ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tax Year</Text>
              <Text style={styles.rowValue}>2025</Text>
            </View>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Plan</Text>
              <View style={[styles.badge, subscriptionTier === 'premium' && styles.badgePremium]}>
                <Text style={[styles.badgeText, subscriptionTier === 'premium' && styles.badgePremiumText]}>
                  {subscriptionTier === 'premium' ? '⭐ Premium' : 'Free'}
                </Text>
              </View>
            </View>
            {subscriptionTier === 'free' && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/paywall')}>
                  <Text style={styles.upgradeBtnText}>Upgrade to Premium →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Manage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/tax-report')}>
              <Text style={styles.rowLabel}>📋 Tax Report</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={handleRestore} disabled={restoring}>
              <Text style={styles.rowLabel}>{restoring ? 'Restoring...' : 'Restore Purchases'}</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>IRS Mileage Rate</Text>
              <Text style={styles.rowValue}>$0.70/mile (2025)</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  scroll: { padding: 20, paddingBottom: 60, gap: 20 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowLabel: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  rowValue: { fontSize: 15, color: Colors.textSecondary },
  arrow: { fontSize: 16, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border },
  badge: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgePremium: { backgroundColor: 'rgba(102,187,106,0.15)' },
  badgeText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  badgePremiumText: { color: Colors.primaryLight },
  upgradeBtn: { padding: 16 },
  upgradeBtnText: { color: Colors.primaryLight, fontWeight: '700', fontSize: 15 },
  signOutBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  signOutText: { color: Colors.danger, fontWeight: '700', fontSize: 16 },
});
