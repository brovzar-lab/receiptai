import { create } from 'zustand';

interface UserState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  subscriptionTier: 'free' | 'premium';
  receiptCount: number;
  isAuthenticated: boolean;

  setUser: (user: Partial<UserState>) => void;
  signOut: () => void;
  incrementReceiptCount: () => void;
}

const initialState: Omit<UserState, 'setUser' | 'signOut' | 'incrementReceiptCount'> = {
  uid: null,
  email: null,
  displayName: null,
  subscriptionTier: 'free',
  receiptCount: 0,
  isAuthenticated: false,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setUser: (user) => set((s) => ({ ...s, ...user })),
  signOut: () => set(initialState),
  incrementReceiptCount: () => set((s) => ({ receiptCount: s.receiptCount + 1 })),
}));
