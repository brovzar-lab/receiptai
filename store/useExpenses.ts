import { create } from 'zustand';
import type { ExpenseCategory } from '../constants/categories';

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  deductibleAmount: number;
  date: string;
  category: ExpenseCategory;
  scheduleCLine: string;
  imageUrl: string | null;
  isManual: boolean;
  createdAt: string;
}

export interface MileageLog {
  id: string;
  date: string;
  miles: number;
  purpose: string;
  deductibleAmount: number;
  createdAt: string;
}

interface ExpenseState {
  expenses: Expense[];
  mileage: MileageLog[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  setMileage: (logs: MileageLog[]) => void;
  addMileageLog: (log: MileageLog) => void;
  removeMileageLog: (id: string) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  mileage: [],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((s) => ({ expenses: [expense, ...s.expenses] })),
  removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
  setMileage: (mileage) => set({ mileage }),
  addMileageLog: (log) => set((s) => ({ mileage: [log, ...s.mileage] })),
  removeMileageLog: (id) => set((s) => ({ mileage: s.mileage.filter((m) => m.id !== id) })),
}));
