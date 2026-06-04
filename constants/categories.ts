export type ExpenseCategory =
  | 'mileage'
  | 'supplies'
  | 'software'
  | 'meals'
  | 'home_office'
  | 'phone_internet'
  | 'marketing'
  | 'professional_services'
  | 'equipment'
  | 'other';

export interface CategoryMeta {
  label: string;
  emoji: string;
  scheduleCLine: string;
  deductiblePercent: number;
}

export const CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  mileage: {
    label: 'Mileage',
    emoji: '🚗',
    scheduleCLine: 'Line 9 — Car and truck expenses',
    deductiblePercent: 100,
  },
  supplies: {
    label: 'Supplies',
    emoji: '📦',
    scheduleCLine: 'Line 22 — Supplies',
    deductiblePercent: 100,
  },
  software: {
    label: 'Software',
    emoji: '💻',
    scheduleCLine: 'Line 27a — Other expenses',
    deductiblePercent: 100,
  },
  meals: {
    label: 'Meals',
    emoji: '🍽️',
    scheduleCLine: 'Line 24b — Meals (50% deductible)',
    deductiblePercent: 50,
  },
  home_office: {
    label: 'Home Office',
    emoji: '🏠',
    scheduleCLine: 'Line 30 — Home office',
    deductiblePercent: 100,
  },
  phone_internet: {
    label: 'Phone/Internet',
    emoji: '📱',
    scheduleCLine: 'Line 27a — Phone/internet',
    deductiblePercent: 100,
  },
  marketing: {
    label: 'Marketing',
    emoji: '📢',
    scheduleCLine: 'Line 8 — Advertising',
    deductiblePercent: 100,
  },
  professional_services: {
    label: 'Professional Services',
    emoji: '🤝',
    scheduleCLine: 'Line 17 — Legal and professional',
    deductiblePercent: 100,
  },
  equipment: {
    label: 'Equipment',
    emoji: '🔧',
    scheduleCLine: 'Line 13 — Depreciation',
    deductiblePercent: 100,
  },
  other: {
    label: 'Other',
    emoji: '📄',
    scheduleCLine: 'Line 27a — Other expenses',
    deductiblePercent: 100,
  },
};

export const IRS_MILEAGE_RATE = 0.70;
export const TAX_BRACKET_RATE = 0.30;
