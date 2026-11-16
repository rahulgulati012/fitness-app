export type Gender = 'female' | 'male';

export type FemaleGoal =
  | 'Hourglass & Glute Sculpt'
  | 'Athletic & Toned'
  | 'Lean & Petite Sculpt';

export type MaleGoal =
  | 'V-Taper Aesthetic'
  | 'Hypertrophy & Mass'
  | 'Athletic Shred';

export type PhysiqueGoal = FemaleGoal | MaleGoal;

export type MotivationVibe =
  | 'Confident & Indulging'
  | 'Unapologetic Hype'
  | 'Elite Discipline';

export type TabKey = 'home' | 'workout' | 'progress' | 'squad' | 'profile';

export interface BodyMetrics {
  heightCm: number;
  weightKg: number;
  age: number;
}

export interface BioSchedule {
  workoutTime: string;
  wakeTime: string;
  bedTime: string;
  vibe: MotivationVibe;
}

export interface WarmupDrill {
  id: string;
  name: string;
  prescription: string;
  completed: boolean;
}

export interface SetLog {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ExercisePlan {
  id: string;
  name: string;
  muscle: string;
  cue: string;
  tempo: string;
  restSeconds: number;
  sets: SetLog[];
}

export interface WorkoutDay {
  dayIndex: number;
  dayLabel: string;
  title: string;
  targetMuscle: string;
  durationMin: number;
  isRestDay: boolean;
  warmupTitle: string;
  warmupDrills: WarmupDrill[];
  exercises: ExercisePlan[];
  completedToday?: boolean;
}

export interface DailyBioLog {
  dateKey: string;
  waterMl: number;
  steps: number;
  sleepHours: number;
  workoutCompleted: boolean;
  completedAt?: string;
}

export interface DailyTrendPoint {
  dayIndex: number;
  dayLabel: string;
  waterMl: number;
  steps: number;
  sleepHours: number;
  workoutCompleted: boolean;
  isRestDay: boolean;
}

export interface BodyMeasurementEntry {
  id: string;
  dateLabel: string;
  weightKg: number;
  waistCm: number;
  hipCm: number;
  chestCm: number;
}

export interface RecentWorkoutEntry {
  id: string;
  title: string;
  targetMuscle: string;
  dateLabel: string;
  durationMin: number;
  setsCompleted: number;
}

export interface ReminderSettings {
  workoutAlert: boolean;
  hydrationAndStepsPing: boolean;
  bedtimeWindDown: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  category: 'workout' | 'hydration' | 'sleep' | 'hype';
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  gender: Gender;
  goal: PhysiqueGoal;
  metrics: BodyMetrics;
  schedule: BioSchedule;
  streakDays: number;
  hypeReceived: number;
  squadIds: string[];
  split: WorkoutDay[];
  quotes: string[];
  dailyLog: DailyBioLog;
  weeklyHistory: DailyTrendPoint[];
  bodyMeasurements: BodyMeasurementEntry[];
  recentWorkouts: RecentWorkoutEntry[];
  reminders: ReminderSettings;
  notifications: NotificationItem[];
  blueprintSource: 'gemini-2.5-flash' | 'kinetix-engine';
  planVersion?: number;
  currentSplitDay?: number;
  createdAt: string;
}

export interface ThemeTokens {
  mode: 'universal' | 'female' | 'male';
  primary: string;
  secondary: string;
  glow: string;
  softBg: string;
  borderAccent: string;
  gradientCss: string;
  badgeText: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  category: 'info' | 'hype' | 'alert' | 'success';
}
