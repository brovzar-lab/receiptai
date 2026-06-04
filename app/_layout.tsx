import React, { useEffect, useState, type ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { Colors } from '../constants/colors';
import { IS_DEMO, DEMO_USER, DEMO_EXPENSES, DEMO_MILEAGE } from '../lib/demo';
import { auth } from '../lib/firebase';
import { configurePurchases, loginPurchases } from '../lib/revenuecat';
import { useUserStore } from '../store/useUser';
import { useExpenseStore } from '../store/useExpenses';

function AuthGate({ children }: { children: ReactNode }) {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [initializing, setInitializing] = useState(!IS_DEMO);
  const setUser = useUserStore((s) => s.setUser);
  const setExpenses = useExpenseStore((s) => s.setExpenses);
  const setMileage = useExpenseStore((s) => s.setMileage);

  useEffect(() => {
    if (IS_DEMO) {
      setExpenses(DEMO_EXPENSES);
      setMileage(DEMO_MILEAGE);
    }
  }, []);

  useEffect(() => {
    if (!IS_DEMO) {
      configurePurchases();
    }
  }, []);

  useEffect(() => {
    if (IS_DEMO) return;
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isAuthenticated: true,
        });
        loginPurchases(user.uid).catch(console.error);
      } else {
        setUser({ uid: null, email: null, isAuthenticated: false });
      }
      setInitializing(false);
    });

    return unsub;
  }, []);

  if (initializing) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthGate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="tax-report" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </AuthGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
