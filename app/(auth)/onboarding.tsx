import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const STEPS = [
  {
    emoji: '📸',
    title: 'Snap your receipts',
    body: 'Open the camera, snap a receipt. AI reads the merchant, amount, and date — and picks the right tax category automatically.',
  },
  {
    emoji: '💼',
    title: 'Schedule C made simple',
    body: 'Every expense maps to a real Schedule C line item. Supplies, mileage, software, meals — we handle the 50% meal rule too.',
  },
  {
    emoji: '💰',
    title: 'See your real savings',
    body: 'Your dashboard updates in real time. Know exactly how much you\'re saving at your 30% bracket before April.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.replace('/(auth)/signup');
    }
  }

  const current = STEPS[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.emoji}>{current.emoji}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={next}>
          <Text style={styles.btnText}>
            {step < STEPS.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/signup')} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 32, justifyContent: 'space-between', alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primaryLight, width: 24 },
  hero: { alignItems: 'center', gap: 16 },
  emoji: { fontSize: 72 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  body: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    width: '100%',
  },
  btnText: { color: Colors.white, fontWeight: '800', fontSize: 17 },
  skip: { padding: 12 },
  skipText: { color: Colors.textMuted, fontSize: 14 },
});
