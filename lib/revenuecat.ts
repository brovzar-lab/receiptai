import { Platform } from 'react-native';

export interface RCPackage {
  identifier: string;
  packageType: string;
  priceString: string;
  _native: unknown;
}

function getPurchases() {
  // react-native-purchases requires custom dev client / EAS build
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-purchases').default;
}

export function configurePurchases(): void {
  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

  if (!apiKey || apiKey === 'REPLACE_WITH_VALUE') return;

  try {
    getPurchases().configure({ apiKey });
  } catch (e) {
    console.warn('[RevenueCat] configure failed:', e);
  }
}

export async function loginPurchases(uid: string): Promise<void> {
  try {
    await getPurchases().logIn(uid);
  } catch (e) {
    console.warn('[RevenueCat] logIn failed:', e);
  }
}

export async function getOfferings(): Promise<RCPackage[]> {
  try {
    const offerings = await getPurchases().getOfferings();
    const available = offerings.current?.availablePackages ?? [];
    return available.map((pkg: { identifier: string; packageType: string; product: { priceString: string } }) => ({
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      priceString: pkg.product.priceString,
      _native: pkg,
    }));
  } catch (e) {
    console.warn('[RevenueCat] getOfferings failed:', e);
    return [];
  }
}

export async function purchasePackage(pkg: RCPackage): Promise<boolean> {
  const { customerInfo } = await getPurchases().purchasePackage(pkg._native);
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export async function restorePurchases(): Promise<boolean> {
  const { customerInfo } = await getPurchases().restorePurchases();
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await getPurchases().getCustomerInfo();
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch {
    return false;
  }
}
