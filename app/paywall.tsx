import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { IS_DEMO } from '../lib/demo';
import { useUserStore } from '../store/useUser';

const PERKS = [
  { emoji: '📸', text: 'Unlimited receipt scans' },
  { emoji: '✨', text: 'AI categorization — always on' },
  { emoji: '🚗', text: 'Mileage tracker' },
  { emoji: '📊', text: 'Tax report + CSV export' },
  { emoji: '📋', text: 'Schedule C breakdown' },
  { emoji: '⚡', text: 'Priority support' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [packages, setPackages] = useState<Array<{ identifier: string; packageType: string; priceString: string; _native: unknown }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(!IS_DEMO);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (IS_DEMO) {
      setPackages([
        { identifier: '$rc_monthly', packageType: 'MONTHLY', priceString: '$4.99/mo', _native: null },
        { identifier: '$rc_annual', packageType: 'ANNUAL', priceString: '$44.99/yr', _native: null },
      ]);
      setSelected('$rc_annual');
      return;
    }
    import('../lib/revenuecat').then(({ getOfferings }) =>
      getOfferings().then((pkgs) => {
        setPackages(pkgs);
        if (pkgs.length > 0) setSelected(pkgs.find((p) => p.packageType === 'ANNUAL')?.identifier ?? pkgs[0].identifier);
        setLoading(false);
      })
    );
  }, []);

  async function handlePurchase() {
    if (IS_DEMO) {
      setUser({ subscriptionTier: 'premium' });
      Alert.alert('Demo mode', 'Premium unlocked in demo! In the live app this would charge your card.');
      router.back();
      return;
    }
    const pkg = packages.find((p) => p.identifier === selected);
    if (!pkg) return;
    setPurchasing(true);
    try {
      const { purchasePackage } = await import('../lib/revenuecat');
      const success = await purchasePackage(pkg);
      if (success) {
        setUser({ subscriptionTier: 'premium' });
        Alert.alert('Welcome to Premium! 🎉', 'Unlimited receipts and all features are now unlocked.');
        router.back();
      }
    } catch (e) {
      Alert.alert('Purchase failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setPurchasing(false);
    }
  }

  const selectedPkg = packages.find((p) => p.identifier === selected);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.badge}>⭐ ReceiptAI Premium</Text>
        <Text style={styles.headline}>Deduct everything.{'\n'}Keep more of your money.</Text>
        <Text style={styles.subhead}>Gig workers who track every deduction save an average of $2,400/year.</Text>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.text} style={styles.perkRow}>
              <Text style={styles.perkEmoji}>{p.emoji}</Text>
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>

        {/* Package selection */}
        {loading ? (
          <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.packageRow}>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.pkgCard, selected === pkg.identifier && styles.pkgCardSelected]}
                onPress={() => setSelected(pkg.identifier)}
              >
                {pkg.packageType === 'ANNUAL' && (
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Best Value</Text>
                  </View>
                )}
                <Text style={styles.pkgType}>
                  {pkg.packageType === 'ANNUAL' ? 'Annual' : 'Monthly'}
                </Text>
                <Text style={styles.pkgPrice}>{pkg.priceString}</Text>
                {pkg.packageType === 'ANNUAL' && (
                  <Text style={styles.pkgSavings}>Save 25%</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.cta, purchasing && styles.disabled]}
          onPress={handlePurchase}
          disabled={purchasing || loading}
        >
          <Text style={styles.ctaText}>
            {purchasing ? 'Processing...' : `Start Premium${selectedPkg ? ` — ${selectedPkg.priceString}` : ''}`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Cancel anytime. Billed through the App Store. By purchasing you agree to our Terms of Service.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 8 },
  closeText: { fontSize: 20, color: Colors.textSecondary },
  scroll: { padding: 24, paddingTop: 48, paddingBottom: 60 },
  badge: { color: Colors.primaryLight, fontWeight: '700', fontSize: 14, marginBottom: 12 },
  headline: { fontSize: 32, fontWeight: '900', color: Colors.text, lineHeight: 38, marginBottom: 12 },
  subhead: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  perks: { gap: 12, marginBottom: 28 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkEmoji: { fontSize: 20, width: 28 },
  perkText: { fontSize: 15, color: Colors.text },
  packageRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  pkgCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  pkgCardSelected: { borderColor: Colors.primaryLight },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  bestValueText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  pkgType: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', marginBottom: 6 },
  pkgPrice: { fontSize: 20, fontWeight: '900', color: Colors.text },
  pkgSavings: { fontSize: 12, color: Colors.primaryLight, fontWeight: '700', marginTop: 4 },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: { color: Colors.white, fontWeight: '900', fontSize: 17 },
  disabled: { opacity: 0.5 },
  legal: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
