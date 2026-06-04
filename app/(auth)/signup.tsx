import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Colors } from '../../constants/colors';
import { auth, db } from '../../lib/firebase';
import { useUserStore } from '../../store/useUser';

export default function SignUpScreen() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!auth || !db || !name.trim() || !email.trim() || !password) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        displayName: name.trim(),
        email: email.trim(),
        taxYear: new Date().getFullYear(),
        subscriptionTier: 'free',
        receiptCount: 0,
        createdAt: new Date().toISOString(),
      });
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name.trim(),
        isAuthenticated: true,
      });
      router.replace('/(auth)/onboarding');
    } catch (e) {
      Alert.alert('Sign up failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.sub}>Start tracking deductions for free</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </Text>

          <TouchableOpacity style={styles.switchBtn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 16 },
  back: { marginBottom: 24 },
  backText: { color: Colors.primaryLight, fontWeight: '600', fontSize: 15 },
  title: { fontSize: 32, fontWeight: '900', color: Colors.text, marginBottom: 6 },
  sub: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28 },
  form: { gap: 12, marginBottom: 20 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabled: { opacity: 0.5 },
  primaryBtnText: { color: Colors.white, fontWeight: '800', fontSize: 17 },
  legal: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 18 },
  switchBtn: { padding: 8, alignItems: 'center' },
  switchText: { fontSize: 14, color: Colors.textSecondary },
  switchLink: { color: Colors.primaryLight, fontWeight: '700' },
});
