import type {
  BioSchedule,
  BodyMeasurementEntry,
  BodyMetrics,
  DailyTrendPoint,
  Gender,
  PhysiqueGoal,
  RecentWorkoutEntry,
  ReminderSettings,
  UserProfile,
  WorkoutDay,
} from '../types/kinetix';
import { buildVariedQuotes, buildVariedSplit } from '../data/workoutEngine';

const STORAGE_KEY = 'kinetix_db_v1';

export const FEMALE_GOALS: {
  title: PhysiqueGoal;
  subtitle: string;
  focus: string;
}[] = [
  {
    title: 'Hourglass & Glute Sculpt',
    subtitle: 'Upper/lower glutes, side delts for waist illusion & TVA vacuum core.',
    focus: 'Zero bulky oblique work · Peak-pause hip thrusts & lateral delt caps',
  },
  {
    title: 'Athletic & Toned',
    subtitle: 'Lean metabolic conditioning and functional sculpting without bulk.',
    focus: 'High-density compound sets · Crisp upper/lower symmetry',
  },
  {
    title: 'Lean & Petite Sculpt',
    subtitle: 'Calorie-torching circuits, posture alignment & daily step emphasis.',
    focus: '10.5k step floor · Deep core cinching & metabolic intervals',
  },
];

export const MALE_GOALS: {
  title: PhysiqueGoal;
  subtitle: string;
  focus: string;
}[] = [
  {
    title: 'V-Taper Aesthetic',
    subtitle: 'Wide lats, capped 3D side delts, upper chest shelf & tight waist ratio.',
    focus: 'Clavicular press · Iliac lat sweeps & behind-back cable laterals',
  },
  {
    title: 'Hypertrophy & Mass',
    subtitle: 'Progressive overload compound lifts, mechanical tension & dense volume.',
    focus: 'Controlled eccentrics · High-output barbell & machine progression',
  },
  {
    title: 'Athletic Shred',
    subtitle: 'Explosive strength paired with high-output conditioning & core definition.',
    focus: '10.5k step floor · Power complexes & metabolic density',
  },
];

export const AVATAR_OPTIONS: Record<Gender, string[]> = {
  female: [
    '/src/assets/images/avatar_female_hourglass_1794780228195.jpg',
    '/src/assets/images/avatar_female_athletic_1794780228574.jpg',
  ],
  male: [
    '/src/assets/images/avatar_male_vtaper_1794780228623.jpg',
    '/src/assets/images/avatar_male_shred_1794780229470.jpg',
  ],
};

export const SUPABASE_SCHEMA_SQL = `-- KINETIX Multi-User Physique & Bio-Recovery Schema (Supabase / PostgreSQL)
-- Run in Supabase SQL Editor to enable real-time cloud sync & Squad leaderboards

create extension if not exists "uuid-ossp";

create table if not exists public.athletes (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  email text unique not null,
  avatar_url text,
  gender text check (gender in ('female', 'male')) not null,
  physique_goal text not null,
  height_cm integer not null default 170,
  weight_kg numeric(5,2) not null default 65.0,
  age integer not null default 26,
  workout_time text not null default '18:00',
  wake_time text not null default '06:30',
  bed_time text not null default '22:30',
  motivation_vibe text not null default 'Confident & Indulging',
  streak_days integer not null default 0,
  hype_received integer not null default 0,
  training_split jsonb not null default '[]'::jsonb,
  personalized_quotes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.squad_connections (
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  friend_id uuid references public.athletes(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (athlete_id, friend_id)
);

create table if not exists public.daily_bio_logs (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  log_date date not null default current_date,
  water_ml integer not null default 0,
  steps integer not null default 0,
  sleep_hours numeric(3,1) not null default 0.0,
  workout_completed boolean not null default false,
  completed_at timestamptz,
  unique (athlete_id, log_date)
);

create table if not exists public.body_measurements (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  recorded_at date not null default current_date,
  weight_kg numeric(5,2) not null,
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  chest_cm numeric(5,1)
);

create table if not exists public.workout_set_logs (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  log_date date not null default current_date,
  day_index integer not null,
  exercise_name text not null,
  set_number integer not null,
  weight_kg numeric(6,2) not null default 0,
  reps integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_hype_events (
  id uuid primary key default uuid_generate_v4(),
  from_athlete_id uuid references public.athletes(id) on delete cascade not null,
  to_athlete_id uuid references public.athletes(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

-- Row Level Security Policies
alter table public.athletes enable row level security;
alter table public.squad_connections enable row level security;
alter table public.daily_bio_logs enable row level security;
alter table public.body_measurements enable row level security;
alter table public.workout_set_logs enable row level security;
alter table public.squad_hype_events enable row level security;

create policy "Athletes readable by squad" on public.athletes for select using (true);
create policy "Athletes update own profile" on public.athletes for update using (auth.uid() = auth_user_id);
create policy "Bio logs readable by squad" on public.daily_bio_logs for select using (true);
create policy "Bio logs mutable by owner" on public.daily_bio_logs for all using (
  athlete_id in (select id from public.athletes where auth_user_id = auth.uid())
);`;

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodaySplitDayIndex(): number {
  const jsDay = new Date().getDay(); // 0 Sun .. 6 Sat
  return jsDay === 0 ? 6 : jsDay - 1; // 0 Mon .. 6 Sun
}

function makeUsername(name: string): string {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join('.');
  return `@${clean || 'athlete'}`;
}

function buildSeedWeeklyHistory(
  gender: Gender,
  weightKg: number,
  todayWater: number,
  todaySteps: number,
  todaySleep: number,
  todayCompleted: boolean,
  split: WorkoutDay[],
  seedVariance = 0
): DailyTrendPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = getTodaySplitDayIndex();
  const baseWater = Math.round(weightKg * 35 + 500);
  const baseSteps = gender === 'female' ? 9200 : 9600;
  const baseSleep = gender === 'female' ? 8.3 : 7.9;

  const waterMultipliers = [0.94, 1.02, 0.88, 0.96, 1.05, 0.91, 0.97];
  const stepOffsets = [-650, 800, -1100, 420, 1250, -300, 500];
  const sleepOffsets = [0.2, -0.3, 0.4, -0.1, 0.2, 0.5, -0.2];

  return days.map((dayLabel, idx) => {
    const isRest = split[idx]?.isRestDay ?? (idx === 3 || idx === 6);
    if (idx === todayIdx) {
      return {
        dayIndex: idx,
        dayLabel,
        waterMl: todayWater,
        steps: todaySteps,
        sleepHours: todaySleep,
        workoutCompleted: todayCompleted,
        isRestDay: isRest,
      };
    }

    const shift = (idx + seedVariance) % 7;
    return {
      dayIndex: idx,
      dayLabel,
      waterMl: Math.round((baseWater * waterMultipliers[shift]) / 50) * 50,
      steps: Math.max(4500, baseSteps + stepOffsets[shift] + seedVariance * 180),
      sleepHours: Number(Math.max(6.5, Math.min(9.5, baseSleep + sleepOffsets[shift])).toFixed(1)),
      workoutCompleted: !isRest && (idx !== 5 || seedVariance % 2 === 0),
      isRestDay: isRest,
    };
  });
}

function buildSeedMeasurements(
  gender: Gender,
  currentWeightKg: number
): BodyMeasurementEntry[] {
  const isFemale = gender === 'female';
  const weightDeltas = isFemale ? [1.8, 1.3, 0.9, 0.5, 0.2, 0] : [-2.2, -1.6, -1.1, -0.7, -0.3, 0];
  const dates = ['Oct 12', 'Oct 19', 'Oct 26', 'Nov 02', 'Nov 09', 'Today'];

  const baseWaist = isFemale ? 64.5 : 81.0;
  const baseHip = isFemale ? 94.5 : 98.0;
  const baseChest = isFemale ? 86.5 : 104.5;

  return dates.map((dateLabel, idx) => {
    const progressRatio = idx / (dates.length - 1);
    return {
      id: `bm-seed-${idx}`,
      dateLabel,
      weightKg: Number((currentWeightKg + weightDeltas[idx]).toFixed(1)),
      waistCm: Number((baseWaist + (isFemale ? (1 - progressRatio) * 2.2 : (1 - progressRatio) * 1.8)).toFixed(1)),
      hipCm: Number((baseHip + (isFemale ? progressRatio * 1.9 : 0.2 * progressRatio)).toFixed(1)),
      chestCm: Number((baseChest + (isFemale ? 0.3 * progressRatio : progressRatio * 2.4)).toFixed(1)),
    };
  });
}

function buildSeedRecentWorkouts(split: WorkoutDay[]): RecentWorkoutEntry[] {
  const labels = ['Yesterday', '2 days ago', '4 days ago'];
  const trainingDays = split.filter((d) => !d.isRestDay);
  return trainingDays.slice(0, 3).map((d, idx) => ({
    id: `rw-seed-${d.dayIndex}-${idx}`,
    title: d.title,
    targetMuscle: d.targetMuscle,
    dateLabel: labels[idx],
    durationMin: d.durationMin,
    setsCompleted: d.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
  }));
}

interface KinetixDbState {
  users: UserProfile[];
  activeUserId: string | null;
}

function createSeedUsers(): UserProfile[] {
  const today = getTodayDateKey();

  const elenaSplit = buildVariedSplit('female', 'Hourglass & Glute Sculpt', 54.3, 0);
  const marcusSplit = buildVariedSplit('male', 'V-Taper Aesthetic', 82.5, 0);
  const siennaSplit = buildVariedSplit('female', 'Athletic & Toned', 60, 0);
  const devonSplit = buildVariedSplit('male', 'Athletic Shred', 78, 0);

  return [
    {
      id: 'demo-elena',
      username: '@elena.vance',
      name: 'Elena Vance',
      email: 'elena@kinetix.fit',
      password: 'demo',
      avatarUrl: '/src/assets/images/avatar_female_hourglass_1794780228195.jpg',
      gender: 'female',
      goal: 'Hourglass & Glute Sculpt',
      metrics: { heightCm: 168, weightKg: 54.3, age: 25 },
      schedule: {
        workoutTime: '18:00',
        wakeTime: '06:30',
        bedTime: '22:00',
        vibe: 'Confident & Indulging',
      },
      streakDays: 6,
      hypeReceived: 14,
      squadIds: ['demo-marcus', 'demo-sienna'],
      split: elenaSplit,
      quotes: buildVariedQuotes('Elena', 'Confident & Indulging', 0),
      planVersion: 1,
      dailyLog: {
        dateKey: today,
        waterMl: 1750,
        steps: 6500,
        sleepHours: 8.0,
        workoutCompleted: false,
      },
      weeklyHistory: buildSeedWeeklyHistory('female', 54.3, 1750, 6500, 8.0, false, elenaSplit, 1),
      bodyMeasurements: buildSeedMeasurements('female', 54.3),
      recentWorkouts: buildSeedRecentWorkouts(elenaSplit),
      reminders: {
        workoutAlert: true,
        hydrationAndStepsPing: true,
        bedtimeWindDown: true,
      },
      notifications: [
        {
          id: 'n-e1',
          title: 'Squad Hype from Marcus',
          body: 'Marcus sent you a surge before your evening Glute & Delt session.',
          timestamp: '18m ago',
          read: false,
          category: 'hype',
        },
        {
          id: 'n-e2',
          title: 'Hydration Checkpoint',
          body: '650 ml remaining to lock in your 2,400 ml daily target, Elena.',
          timestamp: '2h ago',
          read: true,
          category: 'hydration',
        },
      ],
      blueprintSource: 'kinetix-engine',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'demo-marcus',
      username: '@marcus.cole',
      name: 'Marcus Cole',
      email: 'marcus@kinetix.fit',
      password: 'demo',
      avatarUrl: '/src/assets/images/avatar_male_vtaper_1794780228623.jpg',
      gender: 'male',
      goal: 'V-Taper Aesthetic',
      metrics: { heightCm: 183, weightKg: 82.5, age: 28 },
      schedule: {
        workoutTime: '07:00',
        wakeTime: '06:00',
        bedTime: '22:30',
        vibe: 'Elite Discipline',
      },
      streakDays: 11,
      hypeReceived: 22,
      squadIds: ['demo-elena', 'demo-devon'],
      split: marcusSplit,
      quotes: buildVariedQuotes('Marcus', 'Elite Discipline', 0),
      planVersion: 1,
      dailyLog: {
        dateKey: today,
        waterMl: 2850,
        steps: 9100,
        sleepHours: 8.0,
        workoutCompleted: true,
        completedAt: '08:12',
      },
      weeklyHistory: buildSeedWeeklyHistory('male', 82.5, 2850, 9100, 8.0, true, marcusSplit, 2),
      bodyMeasurements: buildSeedMeasurements('male', 82.5),
      recentWorkouts: buildSeedRecentWorkouts(marcusSplit),
      reminders: {
        workoutAlert: true,
        hydrationAndStepsPing: true,
        bedtimeWindDown: true,
      },
      notifications: [
        {
          id: 'n-m1',
          title: 'Session Logged',
          body: 'Day 1 Upper Chest & Wide Lats banked. Streak extended to 11 days.',
          timestamp: '4h ago',
          read: false,
          category: 'workout',
        },
      ],
      blueprintSource: 'kinetix-engine',
      createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    },
    {
      id: 'demo-sienna',
      username: '@sienna.brooks',
      name: 'Sienna Brooks',
      email: 'sienna@kinetix.fit',
      password: 'demo',
      avatarUrl: '/src/assets/images/avatar_female_athletic_1794780228574.jpg',
      gender: 'female',
      goal: 'Athletic & Toned',
      metrics: { heightCm: 171, weightKg: 60, age: 27 },
      schedule: {
        workoutTime: '17:30',
        wakeTime: '06:15',
        bedTime: '22:15',
        vibe: 'Unapologetic Hype',
      },
      streakDays: 9,
      hypeReceived: 19,
      squadIds: ['demo-elena'],
      split: siennaSplit,
      quotes: buildVariedQuotes('Sienna', 'Unapologetic Hype', 0),
      planVersion: 1,
      dailyLog: {
        dateKey: today,
        waterMl: 2350,
        steps: 8900,
        sleepHours: 8.5,
        workoutCompleted: true,
        completedAt: '12:40',
      },
      weeklyHistory: buildSeedWeeklyHistory('female', 60, 2350, 8900, 8.5, true, siennaSplit, 3),
      bodyMeasurements: buildSeedMeasurements('female', 60),
      recentWorkouts: buildSeedRecentWorkouts(siennaSplit),
      reminders: {
        workoutAlert: true,
        hydrationAndStepsPing: true,
        bedtimeWindDown: true,
      },
      notifications: [],
      blueprintSource: 'kinetix-engine',
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
    {
      id: 'demo-devon',
      username: '@devon.sterling',
      name: 'Devon Sterling',
      email: 'devon@kinetix.fit',
      password: 'demo',
      avatarUrl: '/src/assets/images/avatar_male_shred_1794780229470.jpg',
      gender: 'male',
      goal: 'Athletic Shred',
      metrics: { heightCm: 179, weightKg: 78, age: 29 },
      schedule: {
        workoutTime: '18:30',
        wakeTime: '06:45',
        bedTime: '22:45',
        vibe: 'Unapologetic Hype',
      },
      streakDays: 5,
      hypeReceived: 11,
      squadIds: ['demo-marcus'],
      split: devonSplit,
      quotes: buildVariedQuotes('Devon', 'Unapologetic Hype', 0),
      planVersion: 1,
      dailyLog: {
        dateKey: today,
        waterMl: 2700,
        steps: 9800,
        sleepHours: 7.5,
        workoutCompleted: true,
        completedAt: '10:05',
      },
      weeklyHistory: buildSeedWeeklyHistory('male', 78, 2700, 9800, 7.5, true, devonSplit, 4),
      bodyMeasurements: buildSeedMeasurements('male', 78),
      recentWorkouts: buildSeedRecentWorkouts(devonSplit),
      reminders: {
        workoutAlert: true,
        hydrationAndStepsPing: false,
        bedtimeWindDown: true,
      },
      notifications: [],
      blueprintSource: 'kinetix-engine',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];
}

function hydrateLegacyUser(u: UserProfile): { user: UserProfile; changed: boolean } {
  let changed = false;
  const next = { ...u };

  if (!next.username) {
    next.username = makeUsername(next.name);
    changed = true;
  }
  if (!Array.isArray(next.squadIds)) {
    next.squadIds = next.id === 'demo-elena' ? ['demo-marcus', 'demo-sienna'] : ['demo-elena'];
    changed = true;
  }
  if (!Array.isArray(next.weeklyHistory) || next.weeklyHistory.length !== 7) {
    next.weeklyHistory = buildSeedWeeklyHistory(
      next.gender,
      next.metrics.weightKg,
      next.dailyLog.waterMl,
      next.dailyLog.steps,
      next.dailyLog.sleepHours,
      next.dailyLog.workoutCompleted,
      next.split,
      1
    );
    changed = true;
  }
  if (!Array.isArray(next.bodyMeasurements) || next.bodyMeasurements.length === 0) {
    next.bodyMeasurements = buildSeedMeasurements(next.gender, next.metrics.weightKg);
    changed = true;
  }
  if (!Array.isArray(next.recentWorkouts) || next.recentWorkouts.length === 0) {
    next.recentWorkouts = buildSeedRecentWorkouts(next.split);
    changed = true;
  }
  if (typeof next.planVersion !== 'number') {
    next.planVersion = 1;
    changed = true;
  }

  return { user: next, changed };
}

function syncTodayIntoWeeklyHistory(user: UserProfile): DailyTrendPoint[] {
  const todayIdx = getTodaySplitDayIndex();
  return user.weeklyHistory.map((pt) =>
    pt.dayIndex === todayIdx
      ? {
          ...pt,
          waterMl: user.dailyLog.waterMl,
          steps: user.dailyLog.steps,
          sleepHours: user.dailyLog.sleepHours,
          workoutCompleted: user.dailyLog.workoutCompleted,
        }
      : pt
  );
}

function loadState(): KinetixDbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded: KinetixDbState = { users: createSeedUsers(), activeUserId: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as KinetixDbState;
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      const seeded: KinetixDbState = { users: createSeedUsers(), activeUserId: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const today = getTodayDateKey();
    let changed = false;
    parsed.users = parsed.users.map((rawUser) => {
      const hydrated = hydrateLegacyUser(rawUser);
      if (hydrated.changed) changed = true;
      let u = hydrated.user;
      if (!u.dailyLog || u.dailyLog.dateKey !== today) {
        changed = true;
        const freshLog = {
          dateKey: today,
          waterMl: 0,
          steps: 0,
          sleepHours: u.gender === 'female' ? 8.0 : 7.5,
          workoutCompleted: false,
        };
        u = {
          ...u,
          dailyLog: freshLog,
        };
        u.weeklyHistory = syncTodayIntoWeeklyHistory(u);
      }
      return u;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return { users: createSeedUsers(), activeUserId: null };
  }
}

function saveState(state: KinetixDbState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

export const db = {
  getState(): KinetixDbState {
    return loadState();
  },

  getUsers(): UserProfile[] {
    return loadState().users;
  },

  getActiveUser(): UserProfile | null {
    const state = loadState();
    if (!state.activeUserId) return null;
    return state.users.find((u) => u.id === state.activeUserId) ?? null;
  },

  switchUser(userId: string): UserProfile | null {
    const state = loadState();
    const target = state.users.find((u) => u.id === userId) ?? null;
    if (!target) return null;
    state.activeUserId = userId;
    saveState(state);
    return target;
  },

  signOut(): void {
    const state = loadState();
    state.activeUserId = null;
    saveState(state);
  },

  signInWithEmail(email: string, password: string): { user?: UserProfile; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const state = loadState();
    const found = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { error: 'No athlete profile matches that email. Try creating a new profile or tapping a demo chip above.' };
    }
    if (found.password && found.password !== password) {
      return { error: 'Incorrect password for this athlete profile.' };
    }
    state.activeUserId = found.id;
    saveState(state);
    return { user: found };
  },

  createUserProfile(input: {
    name: string;
    email: string;
    password: string;
    gender: Gender;
    goal: PhysiqueGoal;
    metrics: BodyMetrics;
    schedule: BioSchedule;
    split: WorkoutDay[];
    quotes: string[];
    blueprintSource: 'gemini-2.5-flash' | 'kinetix-engine';
  }): UserProfile {
    const state = loadState();
    const avatarList = AVATAR_OPTIONS[input.gender];
    const avatarUrl = avatarList[state.users.length % avatarList.length];
    const today = getTodayDateKey();
    const initWater = 500;
    const initSteps = 1200;
    const initSleep = input.gender === 'female' ? 8.5 : 8.0;

    const newUser: UserProfile = {
      id: `athlete-${Date.now()}`,
      username: makeUsername(input.name),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      avatarUrl,
      gender: input.gender,
      goal: input.goal,
      metrics: input.metrics,
      schedule: input.schedule,
      streakDays: 1,
      hypeReceived: 0,
      squadIds: [],
      split: input.split,
      quotes: input.quotes,
      planVersion: 1,
      dailyLog: {
        dateKey: today,
        waterMl: initWater,
        steps: initSteps,
        sleepHours: initSleep,
        workoutCompleted: false,
      },
      weeklyHistory: buildSeedWeeklyHistory(
        input.gender,
        input.metrics.weightKg,
        initWater,
        initSteps,
        initSleep,
        false,
        input.split,
        0
      ),
      bodyMeasurements: [
        {
          id: `bm-init-${Date.now()}`,
          dateLabel: 'Today',
          weightKg: input.metrics.weightKg,
          waistCm: input.gender === 'female' ? 66 : 82,
          hipCm: input.gender === 'female' ? 95 : 98,
          chestCm: input.gender === 'female' ? 87 : 104,
        },
      ],
      recentWorkouts: [],
      reminders: {
        workoutAlert: true,
        hydrationAndStepsPing: true,
        bedtimeWindDown: true,
      },
      notifications: [
        {
          id: `n-welcome-${Date.now()}`,
          title: 'Blueprint Activated',
          body: `Your 7-day ${input.goal} protocol is live, ${input.name.trim().split(/\s+/)[0]}.`,
          timestamp: 'Just now',
          read: false,
          category: 'workout',
        },
      ],
      blueprintSource: input.blueprintSource,
      createdAt: new Date().toISOString(),
    };

    const existingIdx = state.users.findIndex((u) => u.email.toLowerCase() === newUser.email);
    if (existingIdx >= 0) {
      state.users[existingIdx] = newUser;
    } else {
      state.users = [newUser, ...state.users];
    }
    state.activeUserId = newUser.id;
    saveState(state);
    return newUser;
  },

  updateUser(userId: string, updater: (user: UserProfile) => UserProfile): UserProfile | null {
    const state = loadState();
    const idx = state.users.findIndex((u) => u.id === userId);
    if (idx < 0) return null;
    const updated = updater(state.users[idx]);
    state.users[idx] = updated;
    saveState(state);
    return updated;
  },

  updateWater(userId: string, deltaMl: number, reset = false): UserProfile | null {
    return this.updateUser(userId, (u) => {
      const nextUser: UserProfile = {
        ...u,
        dailyLog: {
          ...u.dailyLog,
          waterMl: reset ? 0 : Math.max(0, Math.min(6000, u.dailyLog.waterMl + deltaMl)),
        },
      };
      nextUser.weeklyHistory = syncTodayIntoWeeklyHistory(nextUser);
      return nextUser;
    });
  },

  updateSteps(userId: string, deltaSteps: number): UserProfile | null {
    return this.updateUser(userId, (u) => {
      const nextUser: UserProfile = {
        ...u,
        dailyLog: {
          ...u.dailyLog,
          steps: Math.max(0, Math.min(40000, u.dailyLog.steps + deltaSteps)),
        },
      };
      nextUser.weeklyHistory = syncTodayIntoWeeklyHistory(nextUser);
      return nextUser;
    });
  },

  updateSleep(userId: string, deltaHours: number): UserProfile | null {
    return this.updateUser(userId, (u) => {
      const nextUser: UserProfile = {
        ...u,
        dailyLog: {
          ...u.dailyLog,
          sleepHours: Number(Math.max(0, Math.min(14, u.dailyLog.sleepHours + deltaHours)).toFixed(1)),
        },
      };
      nextUser.weeklyHistory = syncTodayIntoWeeklyHistory(nextUser);
      return nextUser;
    });
  },

  toggleWarmupDrill(userId: string, dayIndex: number, drillId: string): UserProfile | null {
    return this.updateUser(userId, (u) => ({
      ...u,
      split: u.split.map((day) =>
        day.dayIndex !== dayIndex
          ? day
          : {
              ...day,
              warmupDrills: day.warmupDrills.map((d) =>
                d.id === drillId ? { ...d, completed: !d.completed } : d
              ),
            }
      ),
    }));
  },

  updateExerciseSet(
    userId: string,
    dayIndex: number,
    exerciseId: string,
    setId: string,
    patch: { weightKg?: number; reps?: number; completed?: boolean }
  ): UserProfile | null {
    return this.updateUser(userId, (u) => ({
      ...u,
      split: u.split.map((day) =>
        day.dayIndex !== dayIndex
          ? day
          : {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id !== exerciseId
                  ? ex
                  : {
                      ...ex,
                      sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
                    }
              ),
            }
      ),
    }));
  },

  completeWorkoutDay(userId: string, dayIndex: number): UserProfile | null {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return this.updateUser(userId, (u) => {
      const alreadyDoneToday = u.dailyLog.workoutCompleted;
      const dayObj = u.split.find((d) => d.dayIndex === dayIndex);
      const setsCompleted = dayObj
        ? dayObj.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length || ex.sets.length, 0)
        : 12;

      const recentEntry: RecentWorkoutEntry | null = dayObj
        ? {
            id: `rw-${Date.now()}`,
            title: dayObj.title,
            targetMuscle: dayObj.targetMuscle,
            dateLabel: `Today · ${nowTime}`,
            durationMin: dayObj.durationMin,
            setsCompleted,
          }
        : null;

      const nextUser: UserProfile = {
        ...u,
        streakDays: alreadyDoneToday ? u.streakDays : u.streakDays + 1,
        split: u.split.map((day) =>
          day.dayIndex === dayIndex ? { ...day, completedToday: true } : day
        ),
        dailyLog: {
          ...u.dailyLog,
          workoutCompleted: true,
          completedAt: nowTime,
        },
        recentWorkouts: recentEntry
          ? [recentEntry, ...u.recentWorkouts.slice(0, 7)]
          : u.recentWorkouts,
        notifications: [
          {
            id: `n-done-${Date.now()}`,
            title: 'Session Logged',
            body: `Day ${dayIndex + 1} completed at ${nowTime}. Squad feed updated.`,
            timestamp: 'Just now',
            read: false,
            category: 'workout',
          },
          ...u.notifications.slice(0, 14),
        ],
      };
      nextUser.weeklyHistory = syncTodayIntoWeeklyHistory(nextUser);
      return nextUser;
    });
  },

  toggleSquadMember(userId: string, friendId: string): { user: UserProfile | null; added: boolean; friendName: string } {
    const state = loadState();
    const targetFriend = state.users.find((u) => u.id === friendId);
    const friendName = targetFriend ? targetFriend.name.split(/\s+/)[0] : 'Athlete';
    let added = false;

    const updated = this.updateUser(userId, (u) => {
      const exists = u.squadIds.includes(friendId);
      added = !exists;
      return {
        ...u,
        squadIds: exists
          ? u.squadIds.filter((id) => id !== friendId)
          : [friendId, ...u.squadIds],
      };
    });

    return { user: updated, added, friendName };
  },

  logBodyMeasurement(
    userId: string,
    entry: { weightKg: number; waistCm: number; hipCm: number; chestCm: number }
  ): UserProfile | null {
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return this.updateUser(userId, (u) => {
      const filtered = u.bodyMeasurements.filter(
        (m) => m.dateLabel !== 'Today' && m.dateLabel !== todayLabel
      );
      const nextEntry: BodyMeasurementEntry = {
        id: `bm-${Date.now()}`,
        dateLabel: todayLabel,
        weightKg: Number(entry.weightKg.toFixed(1)),
        waistCm: Number(entry.waistCm.toFixed(1)),
        hipCm: Number(entry.hipCm.toFixed(1)),
        chestCm: Number(entry.chestCm.toFixed(1)),
      };
      return {
        ...u,
        metrics: {
          ...u.metrics,
          weightKg: Number(entry.weightKg.toFixed(1)),
        },
        bodyMeasurements: [...filtered, nextEntry],
      };
    });
  },

  sendHype(fromUserId: string, toUserId: string): { users: UserProfile[]; targetName: string } {
    const state = loadState();
    const sender = state.users.find((u) => u.id === fromUserId);
    const senderFirst = sender ? sender.name.split(/\s+/)[0] : 'Squadmate';
    let targetName = 'Athlete';

    state.users = state.users.map((u) => {
      if (u.id !== toUserId) return u;
      targetName = u.name.split(/\s+/)[0];
      return {
        ...u,
        hypeReceived: u.hypeReceived + 1,
        notifications: [
          {
            id: `n-hype-${Date.now()}`,
            title: `Hype Surge from ${senderFirst}`,
            body: `${senderFirst} sent you an energy surge. Keep dominating today's protocol.`,
            timestamp: 'Just now',
            read: false,
            category: 'hype',
          },
          ...u.notifications.slice(0, 14),
        ],
      };
    });

    saveState(state);
    return { users: state.users, targetName };
  },

  updateReminders(userId: string, reminders: ReminderSettings): UserProfile | null {
    return this.updateUser(userId, (u) => ({ ...u, reminders }));
  },

  markNotificationsRead(userId: string): UserProfile | null {
    return this.updateUser(userId, (u) => ({
      ...u,
      notifications: u.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  resetDemoData(): KinetixDbState {
    const seeded: KinetixDbState = { users: createSeedUsers(), activeUserId: null };
    saveState(seeded);
    return seeded;
  },
};
