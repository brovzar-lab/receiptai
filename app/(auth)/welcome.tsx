import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { IS_DEMO, DEMO_USER } from '../../lib/demo';
import { useUserStore } from '../../store/useUser';
import DemoBanner from '../../components/DemoBanner';

export default function WelcomeScreen() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  function enterDemo() {
    setUser({
      uid: DEMO_USER.uid,
      email: DEMO_USER.email,
      displayName: DEMO_USER.displayName,
      subscriptionTier: DEMO_USER.subscriptionTier,
      isAuthenticated: true,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          {IS_DEMO && <DemoBanner />}
        </View>

        <View style={styles.hero}>
          <Text style={styles.icon}>🧾</Text>
          <Text style={styles.appName}>ReceiptAI</Text>
          <Text style={styles.tagline}>Every receipt. Every deduction.</Text>
          <Text style={styles.sub}>
            Built for DoorDash, Uber, and Upwork gig workers. AI categorizes every expense for your 1099 taxes automatically.
          </Text>
        </View>

        <View style={styles.features}>
          {[
            { emoji: '📸', text: 'Snap receipts — AI does the rest' },
            { emoji: '💸', text: 'Track Schedule C deductions' },
            { emoji: '📊', text: 'Dashboard shows your tax savings' },
            { emoji: '🚗', text: 'Mileage log at IRS rate' },
          ].map((f) => (
            <View key={f.text} style={styles.feature}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          {IS_DEMO ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={enterDemo}>
              <Text style={styles.primaryBtnText}>Continue as Demo User</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.primaryBtnText}>Get Started — Free</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.secondaryBtnText}>I already have an account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  topRow: { alignItems: 'center', paddingTop: 8 },
  hero: { alignItems: 'center', paddingVertical: 24 },
  icon: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 40, fontWeight: '900', color: Colors.text, marginBottom: 6 },
  tagline: { fontSize: 16, fontWeight: '600', color: Colors.primaryLight, marginBottom: 12 },
  sub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  features: { gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureEmoji: { fontSize: 22, width: 32 },
  featureText: { fontSize: 15, color: Colors.text, flex: 1 },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  primaryBtnText: { color: Colors.white, fontWeight: '800', fontSize: 17 },
  secondaryBtn: { padding: 14, alignItems: 'center' },
  secondaryBtnText: { color: Colors.primaryLight, fontWeight: '600', fontSize: 15 },
});
