import type { Gender, ThemeTokens } from '../types/kinetix';

export const UNIVERSAL_THEME: ThemeTokens = {
  mode: 'universal',
  primary: '#FF2E63',
  secondary: '#FF8C42',
  glow: 'rgba(255, 46, 99, 0.28)',
  softBg: 'rgba(255, 46, 99, 0.12)',
  borderAccent: 'rgba(255, 140, 66, 0.35)',
  gradientCss: 'linear-gradient(135deg, #FF2E63 0%, #FF8C42 100%)',
  badgeText: '#FF8C42',
};

export const FEMALE_THEME: ThemeTokens = {
  mode: 'female',
  primary: '#F43F5E',
  secondary: '#FB7185',
  glow: 'rgba(244, 63, 94, 0.25)',
  softBg: 'rgba(244, 63, 94, 0.14)',
  borderAccent: 'rgba(251, 113, 133, 0.35)',
  gradientCss: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
  badgeText: '#FB7185',
};

export const MALE_THEME: ThemeTokens = {
  mode: 'male',
  primary: '#F97316',
  secondary: '#EAB308',
  glow: 'rgba(249, 115, 22, 0.25)',
  softBg: 'rgba(249, 115, 22, 0.14)',
  borderAccent: 'rgba(234, 179, 8, 0.35)',
  gradientCss: 'linear-gradient(135deg, #F97316 0%, #EAB308 100%)',
  badgeText: '#EAB308',
};

export function resolveTheme(gender?: Gender | null): ThemeTokens {
  if (gender === 'female') return FEMALE_THEME;
  if (gender === 'male') return MALE_THEME;
  return UNIVERSAL_THEME;
}

export function applyThemeCssVars(theme: ThemeTokens): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--k-primary', theme.primary);
  root.style.setProperty('--k-secondary', theme.secondary);
  root.style.setProperty('--k-glow', theme.glow);
}

export function getShortGoalLabel(goal: string): string {
  switch (goal) {
    case 'Hourglass & Glute Sculpt':
      return 'Hourglass Sculpt';
    case 'Athletic & Toned':
      return 'Athletic Toned';
    case 'Lean & Petite Sculpt':
      return 'Petite Sculpt';
    case 'V-Taper Aesthetic':
      return 'V-Taper';
    case 'Hypertrophy & Mass':
      return 'Mass & Volume';
    case 'Athletic Shred':
      return 'Athletic Shred';
    default:
      return goal;
  }
}

export function calculateWaterTargetMl(weightKg: number): number {
  return Math.round(weightKg * 35 + 500);
}

export function calculateStepTarget(goal: string): number {
  if (goal === 'Lean & Petite Sculpt' || goal === 'Athletic Shred') return 10500;
  if (goal === 'V-Taper Aesthetic' || goal === 'Athletic & Toned') return 9500;
  return 9500;
}

export function calculateSleepTargetHours(gender: Gender): number {
  return gender === 'female' ? 8.5 : 8.0;
}

export function calculateBmi(heightCm: number, weightKg: number): number {
  if (heightCm <= 0) return 0;
  const m = heightCm / 100;
  return Number((weightKg / (m * m)).toFixed(1));
}
