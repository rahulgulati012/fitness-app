import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { buildVariedQuotes, buildVariedSplit } from '../data/workoutEngine';
import type {
  BodyMeasurementEntry,
  DailyBioLog,
  DailyTrendPoint,
  Gender,
  MotivationVibe,
  PhysiqueGoal,
  RecentWorkoutEntry,
  UserProfile,
  WorkoutDay,
} from '../types/kinetix';
import {
  AVATAR_OPTIONS,
  FEMALE_GOALS,
  MALE_GOALS,
  db,
  getTodayDateKey,
  getTodaySplitDayIndex,
} from './db';

interface ProfileRow {
  id: string;
  email: string;
  display_name: string;
  gender: Gender | string;
  height: number;
  weight: number;
  goal: PhysiqueGoal | string;
  workout_time: string;
  bed_time: string;
  streak: number;
  measurements_json?: BodyMeasurementEntry[] | null;
  squad_ids?: string[] | null;
  current_split_day?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface UserPlanRow {
  user_id: string;
  workout_json: WorkoutDay[] | null;
  quotes_json: string[] | null;
  updated_at?: string;
}

interface CompletedExercisesSnapshot {
  dayIndex?: number;
  completedSetIds?: string[];
  completedWarmupIds?: string[];
  setValues?: Record<string, { weightKg: number; reps: number }>;
}

interface DailyLogRow {
  user_id: string;
  date?: string;
  log_date?: string;
  workout_completed: boolean;
  completed_exercises?: CompletedExercisesSnapshot | string[] | null;
  water_ml: number;
  steps_count: number;
  sleep_hours: number;
  body_weight?: number | null;
  split_name?: string | null;
  updated_at?: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(val: string | undefined | null): boolean {
  return Boolean(val && UUID_REGEX.test(val));
}

function makeUsernameFromName(name: string): string {
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

function getDateKeyOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatShortDateLabel(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMondayOfCurrentWeekDateKeys(): { dayIndex: number; dayLabel: string; dateKey: string }[] {
  const now = new Date();
  const todayIdx = getTodaySplitDayIndex();
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return labels.map((dayLabel, dayIndex) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (todayIdx - dayIndex));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { dayIndex, dayLabel, dateKey: `${y}-${m}-${day}` };
  });
}

function resolveGenderStrict(rawGender: unknown, rawGoal?: unknown): Gender {
  const normalized = typeof rawGender === 'string' ? rawGender.trim().toLowerCase() : '';
  if (normalized === 'male') return 'male';
  if (normalized === 'female') return 'female';
  if (typeof rawGoal === 'string' && MALE_GOALS.some((g) => g.title === rawGoal)) {
    return 'male';
  }
  return 'female';
}

function resolveGoalStrict(gender: Gender, rawGoal: unknown): PhysiqueGoal {
  const allowedGoals = gender === 'female' ? FEMALE_GOALS : MALE_GOALS;
  const match = allowedGoals.find((g) => g.title === rawGoal);
  return match ? match.title : allowedGoals[0].title;
}

function extractCompletedExercisesPayload(user: UserProfile, targetDayIndex?: number): CompletedExercisesSnapshot {
  const dayIdx =
    typeof targetDayIndex === 'number'
      ? targetDayIndex
      : typeof user.currentSplitDay === 'number'
        ? user.currentSplitDay
        : getTodaySplitDayIndex();
  const day = user.split[dayIdx] ?? user.split[getTodaySplitDayIndex()] ?? user.split[0];
  if (!day) return { dayIndex: dayIdx, completedSetIds: [], completedWarmupIds: [], setValues: {} };

  const completedWarmupIds = day.warmupDrills.filter((w) => w.completed).map((w) => w.id);
  const completedSetIds: string[] = [];
  const setValues: Record<string, { weightKg: number; reps: number }> = {};

  for (const ex of day.exercises) {
    for (const s of ex.sets) {
      if (s.completed) completedSetIds.push(s.id);
      setValues[s.id] = { weightKg: s.weightKg, reps: s.reps };
    }
  }

  return {
    dayIndex: day.dayIndex,
    completedSetIds,
    completedWarmupIds,
    setValues,
  };
}

function applyTodayCompletedExercises(
  split: WorkoutDay[],
  todayRow: DailyLogRow | undefined
): WorkoutDay[] {
  if (!todayRow) return split;
  const todayIdx = getTodaySplitDayIndex();
  const snap = todayRow.completed_exercises;

  const isObj = snap && !Array.isArray(snap) && typeof snap === 'object';
  const targetIdx = isObj && typeof snap.dayIndex === 'number' ? snap.dayIndex : todayIdx;
  const completedSetSet = new Set<string>(
    isObj && Array.isArray(snap.completedSetIds)
      ? snap.completedSetIds
      : Array.isArray(snap)
        ? snap
        : []
  );
  const completedWarmupSet = new Set<string>(
    isObj && Array.isArray(snap.completedWarmupIds) ? snap.completedWarmupIds : []
  );
  const setValues = isObj && snap.setValues ? snap.setValues : {};

  return split.map((day) => {
    const isTarget = day.dayIndex === targetIdx;
    const isToday = day.dayIndex === todayIdx;
    if (!isTarget && !isToday) return day;

    return {
      ...day,
      completedToday: isToday && todayRow.workout_completed ? true : day.completedToday,
      warmupDrills: isTarget
        ? day.warmupDrills.map((w) => ({
            ...w,
            completed: completedWarmupSet.has(w.id) ? true : w.completed,
          }))
        : day.warmupDrills,
      exercises: isTarget
        ? day.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => {
              const savedVal = setValues[s.id];
              return {
                ...s,
                weightKg: savedVal ? savedVal.weightKg : s.weightKg,
                reps: savedVal ? savedVal.reps : s.reps,
                completed: completedSetSet.has(s.id) ? true : s.completed,
              };
            }),
          }))
        : day.exercises,
    };
  });
}

function mapSupabaseRowsToUserProfile(
  profile: ProfileRow,
  plan: UserPlanRow | null,
  logs: DailyLogRow[],
  options?: { allowBackfillMissingPlan?: boolean }
): UserProfile {
  // Strictly scope local auxiliary cache to THIS exact profile.id (never bleed across users)
  const scopedCache = db.getUserCache(profile.id);

  const gender = resolveGenderStrict(profile.gender, profile.goal);
  const goal = resolveGoalStrict(gender, profile.goal);

  const displayName = (profile.display_name || scopedCache?.name || 'Athlete').trim();
  const weightKg = Number(profile.weight) || scopedCache?.metrics.weightKg || (gender === 'female' ? 58 : 80);
  const heightCm = Number(profile.height) || scopedCache?.metrics.heightCm || (gender === 'female' ? 167 : 181);
  const age = scopedCache?.metrics.age || 26;
  const planVersion = scopedCache?.planVersion ?? 1;

  const hasValidPlanSplit =
    Array.isArray(plan?.workout_json) &&
    plan.workout_json.length === 7 &&
    !plan.workout_json.some(
      (d) => !d.isRestDay && (!Array.isArray(d.exercises) || d.exercises.length < 6)
    );

  const baseSplit = hasValidPlanSplit
    ? (plan!.workout_json as WorkoutDay[])
    : buildVariedSplit(gender, goal, weightKg, Math.max(0, planVersion - 1));

  const vibe: MotivationVibe = scopedCache?.schedule.vibe || 'Confident & Indulging';
  const quotes =
    Array.isArray(plan?.quotes_json) && plan.quotes_json.length > 0
      ? plan.quotes_json
      : buildVariedQuotes(displayName, vibe, Math.max(0, planVersion - 1));

  const today = getTodayDateKey();
  const getLogDate = (l: DailyLogRow) => (l.date || l.log_date || '').slice(0, 10);
  const logByDate = new Map(
    logs
      .filter((l) => Boolean(getLogDate(l)))
      .map((l) => [getLogDate(l), l])
  );
  const todayRow = logByDate.get(today);

  const split = applyTodayCompletedExercises(baseSplit, todayRow);

  const dailyLog: DailyBioLog = {
    dateKey: today,
    waterMl: todayRow ? Number(todayRow.water_ml) || 0 : 0,
    steps: todayRow ? Number(todayRow.steps_count) || 0 : 0,
    sleepHours: todayRow
      ? Number(todayRow.sleep_hours) || 0
      : gender === 'female'
        ? 8.0
        : 7.5,
    workoutCompleted: Boolean(todayRow?.workout_completed),
    completedAt: scopedCache?.dailyLog.completedAt,
  };

  const weekDates = getMondayOfCurrentWeekDateKeys();
  const weeklyHistory: DailyTrendPoint[] = weekDates.map(({ dayIndex, dayLabel, dateKey }) => {
    const row = logByDate.get(dateKey);
    const isRestDay = split[dayIndex]?.isRestDay ?? (dayIndex === 3 || dayIndex === 6);
    if (dateKey === today) {
      return {
        dayIndex,
        dayLabel,
        waterMl: dailyLog.waterMl,
        steps: dailyLog.steps,
        sleepHours: dailyLog.sleepHours,
        workoutCompleted: dailyLog.workoutCompleted,
        isRestDay,
      };
    }
    return {
      dayIndex,
      dayLabel,
      waterMl: row ? Number(row.water_ml) || 0 : 0,
      steps: row ? Number(row.steps_count) || 0 : 0,
      sleepHours: row ? Number(row.sleep_hours) || 0 : 0,
      workoutCompleted: Boolean(row?.workout_completed),
      isRestDay,
    };
  });

  // Merge measurements_json from profiles with any 30-day body_weight entries from daily_logs
  const cloudMeasurements = Array.isArray(profile.measurements_json)
    ? profile.measurements_json
    : [];
  const baseMeasurements: BodyMeasurementEntry[] =
    cloudMeasurements.length > 0
      ? [...cloudMeasurements]
      : scopedCache?.bodyMeasurements?.length
        ? [...scopedCache.bodyMeasurements]
        : [
            {
              id: `bm-${profile.id}`,
              dateLabel: 'Today',
              weightKg,
              waistCm: gender === 'female' ? 65 : 81,
              hipCm: gender === 'female' ? 95 : 98,
              chestCm: gender === 'female' ? 87 : 104,
            },
          ];

  const existingLabels = new Set(baseMeasurements.map((m) => m.dateLabel));
  const sortedLogs = [...logs].sort((a, b) => getLogDate(a).localeCompare(getLogDate(b)));
  for (const row of sortedLogs) {
    const dKey = getLogDate(row);
    const w = Number(row.body_weight);
    if (!dKey || !w || w <= 0) continue;
    const label = dKey === today ? 'Today' : formatShortDateLabel(dKey);
    if (!existingLabels.has(label) && !existingLabels.has(dKey)) {
      const last = baseMeasurements[baseMeasurements.length - 1];
      baseMeasurements.push({
        id: `bm-log-${dKey}`,
        dateLabel: label,
        weightKg: Number(w.toFixed(1)),
        waistCm: last?.waistCm ?? (gender === 'female' ? 65 : 81),
        hipCm: last?.hipCm ?? (gender === 'female' ? 95 : 98),
        chestCm: last?.chestCm ?? (gender === 'female' ? 87 : 104),
      });
      existingLabels.add(label);
    }
  }

  // Derive recent workouts from 30-day daily_logs if not locally populated
  const derivedRecentWorkouts: RecentWorkoutEntry[] = sortedLogs
    .filter((r) => r.workout_completed)
    .reverse()
    .slice(0, 6)
    .map((r, i) => {
      const dKey = getLogDate(r);
      return {
        id: `rw-log-${dKey}-${i}`,
        title: r.split_name || `${goal} Session`,
        targetMuscle: goal,
        dateLabel: dKey === today ? 'Today' : formatShortDateLabel(dKey),
        durationMin: 45,
        setsCompleted: 18,
      };
    });

  const avatarUrl =
    scopedCache?.avatarUrl && AVATAR_OPTIONS[gender].includes(scopedCache.avatarUrl)
      ? scopedCache.avatarUrl
      : AVATAR_OPTIONS[gender][0];

  const squadIds = Array.isArray(profile.squad_ids)
    ? profile.squad_ids
    : scopedCache?.squadIds ?? [];

  const currentSplitDay =
    typeof profile.current_split_day === 'number'
      ? Math.max(0, Math.min(6, profile.current_split_day))
      : scopedCache?.currentSplitDay ?? getTodaySplitDayIndex();

  const mapped: UserProfile = {
    id: profile.id,
    username: scopedCache?.username || makeUsernameFromName(displayName),
    name: displayName,
    email: profile.email || scopedCache?.email || '',
    avatarUrl,
    gender,
    goal,
    metrics: { heightCm, weightKg, age },
    schedule: {
      workoutTime: profile.workout_time || scopedCache?.schedule.workoutTime || '18:00',
      wakeTime: scopedCache?.schedule.wakeTime || '06:30',
      bedTime: profile.bed_time || scopedCache?.schedule.bedTime || '22:30',
      vibe,
    },
    streakDays: Number(profile.streak) || scopedCache?.streakDays || 1,
    hypeReceived: scopedCache?.hypeReceived ?? 0,
    squadIds,
    split,
    quotes,
    dailyLog,
    weeklyHistory,
    bodyMeasurements: baseMeasurements,
    recentWorkouts:
      scopedCache?.recentWorkouts && scopedCache.recentWorkouts.length > 0
        ? scopedCache.recentWorkouts
        : derivedRecentWorkouts,
    reminders: scopedCache?.reminders ?? {
      workoutAlert: true,
      hydrationAndStepsPing: true,
      bedtimeWindDown: true,
    },
    notifications: scopedCache?.notifications ?? [],
    blueprintSource: scopedCache?.blueprintSource ?? 'kinetix-engine',
    planVersion,
    currentSplitDay,
    createdAt: profile.created_at || scopedCache?.createdAt || new Date().toISOString(),
  };

  // If user_plans was missing for this authenticated user, immediately backfill it with their gender+goal split
  if (options?.allowBackfillMissingPlan && !hasValidPlanSplit) {
    void syncUserPlanToSupabase(mapped);
  }

  return mapped;
}

function toFullProfilePayload(user: UserProfile) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.name,
    gender: user.gender,
    height: user.metrics.heightCm,
    weight: user.metrics.weightKg,
    goal: user.goal,
    workout_time: user.schedule.workoutTime,
    bed_time: user.schedule.bedTime,
    streak: user.streakDays,
    measurements_json: user.bodyMeasurements,
    squad_ids: user.squadIds,
    current_split_day: user.currentSplitDay ?? getTodaySplitDayIndex(),
    updated_at: new Date().toISOString(),
  };
}

function toCoreProfilePayload(user: UserProfile) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.name,
    gender: user.gender,
    height: user.metrics.heightCm,
    weight: user.metrics.weightKg,
    goal: user.goal,
    workout_time: user.schedule.workoutTime,
    bed_time: user.schedule.bedTime,
    streak: user.streakDays,
  };
}

function toUserPlanPayload(user: UserProfile) {
  return {
    user_id: user.id,
    workout_json: user.split,
    quotes_json: user.quotes,
    updated_at: new Date().toISOString(),
  };
}

function toDailyLogPayload(user: UserProfile, activeDayIndex?: number) {
  const dayIdx =
    typeof activeDayIndex === 'number'
      ? activeDayIndex
      : typeof user.currentSplitDay === 'number'
        ? user.currentSplitDay
        : getTodaySplitDayIndex();
  const activeDay = user.split[dayIdx] ?? user.split[getTodaySplitDayIndex()] ?? user.split[0];

  return {
    user_id: user.id,
    date: user.dailyLog.dateKey || getTodayDateKey(),
    workout_completed: user.dailyLog.workoutCompleted,
    completed_exercises: extractCompletedExercisesPayload(user, dayIdx),
    water_ml: user.dailyLog.waterMl,
    steps_count: user.dailyLog.steps,
    sleep_hours: user.dailyLog.sleepHours,
    body_weight: user.metrics.weightKg,
    split_name: activeDay?.title ?? `${user.goal} Session`,
    updated_at: new Date().toISOString(),
  };
}

function isNetworkOrOfflineError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err ?? '');
  return /fetch|network|offline|timeout|abort|enotfound|econnrefused/i.test(msg);
}

async function fetch30DayLogsForUsers(userIds: string[]): Promise<DailyLogRow[]> {
  if (!supabase || userIds.length === 0) return [];
  const thirtyDaysAgoISO = getDateKeyOffset(29);

  const primaryRes =
    userIds.length === 1
      ? await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', userIds[0])
          .gte('date', thirtyDaysAgoISO)
          .order('date', { ascending: true })
      : await supabase
          .from('daily_logs')
          .select('*')
          .in('user_id', userIds)
          .gte('date', thirtyDaysAgoISO)
          .order('date', { ascending: true });

  if (!primaryRes.error && primaryRes.data) {
    return primaryRes.data as DailyLogRow[];
  }

  // Graceful fallback if table uses `log_date` instead of `date`
  const fallbackDateCol =
    userIds.length === 1
      ? await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', userIds[0])
          .gte('log_date', thirtyDaysAgoISO)
          .order('log_date', { ascending: true })
      : await supabase
          .from('daily_logs')
          .select('*')
          .in('user_id', userIds)
          .gte('log_date', thirtyDaysAgoISO)
          .order('log_date', { ascending: true });

  if (!fallbackDateCol.error && fallbackDateCol.data) {
    return fallbackDateCol.data as DailyLogRow[];
  }

  // Final unordered fallback
  const bareRes =
    userIds.length === 1
      ? await supabase.from('daily_logs').select('*').eq('user_id', userIds[0]).limit(60)
      : await supabase.from('daily_logs').select('*').in('user_id', userIds).limit(120);

  return (bareRes.data as DailyLogRow[] | null) ?? [];
}

export async function hydrateAuthenticatedUserFromSupabase(
  authUser: SupabaseAuthUser
): Promise<UserProfile | null> {
  if (!supabase || !isUuid(authUser.id)) return null;

  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  // If query itself failed (network/RLS error), do NOT overwrite remote data with defaults;
  // return per-user scoped cache if present so offline mode stays intact.
  if (profileErr) {
    return db.getUserCache(authUser.id);
  }

  if (profileData) {
    const [planRes, logs] = await Promise.all([
      supabase.from('user_plans').select('*').eq('user_id', authUser.id).maybeSingle(),
      fetch30DayLogsForUsers([authUser.id]),
    ]);

    const hydrated = mapSupabaseRowsToUserProfile(
      profileData as ProfileRow,
      (planRes.data as UserPlanRow | null) ?? null,
      logs,
      { allowBackfillMissingPlan: true }
    );

    return db.upsertSyncedUser(hydrated, true);
  }

  // Truly no `profiles` row yet (e.g., email-confirmed signup logging in for the very first time).
  // Recover from per-user cache or authUser.user_metadata — NEVER assume 'female' if metadata/cache says 'male'.
  const scopedCache = db.getUserCache(authUser.id);
  if (scopedCache) {
    const synced = db.upsertSyncedUser(scopedCache, true);
    void syncAllUserTablesToSupabase(synced);
    return synced;
  }

  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const email = (authUser.email ?? '').trim().toLowerCase();
  const metaGender = resolveGenderStrict(meta.gender, meta.goal);
  const metaGoal = resolveGoalStrict(metaGender, meta.goal);
  const metaWeight =
    Number(meta.weight) || (metaGender === 'female' ? 58 : 80);
  const metaHeight =
    Number(meta.height) || (metaGender === 'female' ? 167 : 181);
  const metaAge = Number(meta.age) || 26;
  const metaName =
    (typeof meta.display_name === 'string' && meta.display_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    email.split('@')[0] ||
    'Athlete';
  const metaVibe: MotivationVibe =
    meta.vibe === 'Unapologetic Hype' || meta.vibe === 'Elite Discipline'
      ? meta.vibe
      : 'Confident & Indulging';

  const created = db.createUserProfile({
    id: authUser.id,
    name: metaName,
    email,
    password: '',
    gender: metaGender,
    goal: metaGoal,
    metrics: { heightCm: metaHeight, weightKg: metaWeight, age: metaAge },
    schedule: {
      workoutTime: typeof meta.workout_time === 'string' ? meta.workout_time : '18:00',
      wakeTime: typeof meta.wake_time === 'string' ? meta.wake_time : '06:30',
      bedTime: typeof meta.bed_time === 'string' ? meta.bed_time : '22:30',
      vibe: metaVibe,
    },
    split: buildVariedSplit(metaGender, metaGoal, metaWeight, 0),
    quotes: buildVariedQuotes(metaName, metaVibe, 0),
    blueprintSource: 'kinetix-engine',
  });

  db.saveUserCache(created);
  void syncAllUserTablesToSupabase(created);
  return created;
}

export async function restoreSupabaseSession(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return null;
    return await hydrateAuthenticatedUserFromSupabase(data.session.user);
  } catch {
    return null;
  }
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!isSupabaseConfigured() || !supabase) {
    return db.signInWithEmail(cleanEmail, password);
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (isNetworkOrOfflineError(error)) {
        return db.signInWithEmail(cleanEmail, password);
      }
      const localAttempt = db.signInWithEmail(cleanEmail, password);
      if (localAttempt.user) {
        return localAttempt;
      }
      return { error: error.message };
    }

    if (!data.user) {
      return db.signInWithEmail(cleanEmail, password);
    }

    const hydrated = await hydrateAuthenticatedUserFromSupabase(data.user);
    if (hydrated) {
      return { user: hydrated };
    }

    return { error: 'Unable to load athlete profile from database.' };
  } catch (err) {
    if (isNetworkOrOfflineError(err)) {
      return db.signInWithEmail(cleanEmail, password);
    }
    return db.signInWithEmail(cleanEmail, password);
  }
}

export async function signUpWithSupabase(input: {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  goal: PhysiqueGoal;
  metrics: UserProfile['metrics'];
  schedule: UserProfile['schedule'];
  split: WorkoutDay[];
  quotes: string[];
  blueprintSource: 'gemini-2.5-flash' | 'kinetix-engine';
}): Promise<{ user: UserProfile; syncedToCloud: boolean; notice?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();

  if (!isSupabaseConfigured() || !supabase) {
    const localUser = db.createUserProfile(input);
    return { user: localUser, syncedToCloud: false };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: input.password,
      options: {
        data: {
          display_name: input.name.trim(),
          name: input.name.trim(),
          gender: input.gender,
          goal: input.goal,
          height: input.metrics.heightCm,
          weight: input.metrics.weightKg,
          age: input.metrics.age,
          workout_time: input.schedule.workoutTime,
          wake_time: input.schedule.wakeTime,
          bed_time: input.schedule.bedTime,
          vibe: input.schedule.vibe,
        },
      },
    });

    if (error || !data.user) {
      const localUser = db.createUserProfile(input);
      return {
        user: localUser,
        syncedToCloud: false,
        notice: error?.message,
      };
    }

    const created = db.createUserProfile({
      ...input,
      id: data.user.id,
    });
    db.saveUserCache(created);

    if (data.session) {
      const ok = await syncAllUserTablesToSupabase(created);
      return { user: created, syncedToCloud: ok };
    }

    return {
      user: created,
      syncedToCloud: false,
      notice: 'Account created. Check your email to confirm cloud sync.',
    };
  } catch {
    const localUser = db.createUserProfile(input);
    return { user: localUser, syncedToCloud: false };
  }
}

export async function signOutFromSupabase(): Promise<void> {
  db.signOut();
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore offline signout error
  }
}

export async function syncProfileToSupabase(user: UserProfile): Promise<boolean> {
  db.saveUserCache(user);
  if (!isSupabaseConfigured() || !supabase || !isUuid(user.id)) return false;
  try {
    const fullPayload = toFullProfilePayload(user);
    const { error } = await supabase
      .from('profiles')
      .upsert(fullPayload, { onConflict: 'id' });

    if (!error) return true;

    // Fallback smoothly if an existing table lacks optional extended JSON/int columns
    const { error: squadOnlyErr } = await supabase
      .from('profiles')
      .upsert({ ...toCoreProfilePayload(user), squad_ids: user.squadIds }, { onConflict: 'id' });
    if (!squadOnlyErr) return true;

    const { error: coreError } = await supabase
      .from('profiles')
      .upsert(toCoreProfilePayload(user), { onConflict: 'id' });
    return !coreError;
  } catch {
    return false;
  }
}

export async function syncUserPlanToSupabase(user: UserProfile): Promise<boolean> {
  db.saveUserCache(user);
  if (!isSupabaseConfigured() || !supabase || !isUuid(user.id)) return false;
  try {
    const payload = toUserPlanPayload(user);
    const { error } = await supabase
      .from('user_plans')
      .upsert(payload, { onConflict: 'user_id' });
    if (!error) return true;

    const { error: bareErr } = await supabase
      .from('user_plans')
      .upsert(
        { user_id: user.id, workout_json: user.split, quotes_json: user.quotes },
        { onConflict: 'user_id' }
      );
    return !bareErr;
  } catch {
    return false;
  }
}

export async function syncDailyLogToSupabase(
  user: UserProfile,
  activeDayIndex?: number
): Promise<boolean> {
  db.saveUserCache(user);
  if (!isSupabaseConfigured() || !supabase || !isUuid(user.id)) return false;
  try {
    const payload = toDailyLogPayload(user, activeDayIndex);
    const { error } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id,date' });
    if (!error) return true;

    // Fallback if remote table uses `log_date` or fewer optional columns
    const { date: dateVal, ...rest } = payload;
    const { error: coreDateErr } = await supabase
      .from('daily_logs')
      .upsert(
        {
          user_id: user.id,
          date: dateVal,
          workout_completed: user.dailyLog.workoutCompleted,
          water_ml: user.dailyLog.waterMl,
          steps_count: user.dailyLog.steps,
          sleep_hours: user.dailyLog.sleepHours,
        },
        { onConflict: 'user_id,date' }
      );
    if (!coreDateErr) return true;

    const { error: logDateErr } = await supabase
      .from('daily_logs')
      .upsert(
        { ...rest, log_date: dateVal },
        { onConflict: 'user_id,log_date' }
      );
    return !logDateErr;
  } catch {
    return false;
  }
}

export async function syncAllUserTablesToSupabase(user: UserProfile): Promise<boolean> {
  db.saveUserCache(user);
  if (!isSupabaseConfigured() || !supabase || !isUuid(user.id)) return false;
  try {
    const profileOk = await syncProfileToSupabase(user);
    if (!profileOk) return false;
    const [planOk, logOk] = await Promise.all([
      syncUserPlanToSupabase(user),
      syncDailyLogToSupabase(user),
    ]);
    return planOk && logOk;
  } catch {
    return false;
  }
}

export async function searchSupabaseAthletes(
  query: string,
  activeUserId: string
): Promise<{ results: UserProfile[]; fromCloud: boolean }> {
  const clean = query.trim();
  const localMatches = db.getUsers().filter((u) => {
    if (u.id === activeUserId) return false;
    if (!clean) return false;
    const q = clean.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.goal.toLowerCase().includes(q)
    );
  });

  if (!clean || !isSupabaseConfigured() || !supabase) {
    return { results: localMatches, fromCloud: false };
  }

  try {
    const { data: profileRows, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('display_name', `%${clean}%`)
      .neq('id', activeUserId)
      .limit(20);

    if (error || !profileRows) {
      return { results: localMatches, fromCloud: false };
    }

    const profiles = profileRows as ProfileRow[];
    if (profiles.length === 0) {
      return { results: localMatches, fromCloud: true };
    }

    const ids = profiles.map((p) => p.id);
    const [plansRes, logs] = await Promise.all([
      supabase.from('user_plans').select('*').in('user_id', ids),
      fetch30DayLogsForUsers(ids),
    ]);

    const plansByUser = new Map<string, UserPlanRow>(
      ((plansRes.data as UserPlanRow[] | null) ?? []).map((pl) => [pl.user_id, pl])
    );

    const logsByUser = new Map<string, DailyLogRow[]>();
    for (const row of logs) {
      const existing = logsByUser.get(row.user_id) ?? [];
      existing.push(row);
      logsByUser.set(row.user_id, existing);
    }

    const cloudUsers = profiles.map((p) =>
      mapSupabaseRowsToUserProfile(
        p,
        plansByUser.get(p.id) ?? null,
        logsByUser.get(p.id) ?? []
      )
    );

    db.mergeRemoteUsers(cloudUsers);

    const seenIds = new Set(cloudUsers.map((u) => u.id));
    const mergedResults = [
      ...cloudUsers,
      ...localMatches.filter((u) => !seenIds.has(u.id)),
    ];

    return { results: mergedResults, fromCloud: true };
  } catch {
    return { results: localMatches, fromCloud: false };
  }
}

export async function refreshSquadLiveStatuses(
  squadIds: string[]
): Promise<UserProfile[]> {
  const validIds = squadIds.filter(isUuid);
  if (validIds.length === 0 || !isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const [profilesRes, plansRes, logs] = await Promise.all([
      supabase.from('profiles').select('*').in('id', validIds),
      supabase.from('user_plans').select('*').in('user_id', validIds),
      fetch30DayLogsForUsers(validIds),
    ]);

    if (profilesRes.error || !profilesRes.data) return [];

    const plansByUser = new Map<string, UserPlanRow>(
      ((plansRes.data as UserPlanRow[] | null) ?? []).map((pl) => [pl.user_id, pl])
    );
    const logsByUser = new Map<string, DailyLogRow[]>();
    for (const row of logs) {
      const existing = logsByUser.get(row.user_id) ?? [];
      existing.push(row);
      logsByUser.set(row.user_id, existing);
    }

    const refreshed = (profilesRes.data as ProfileRow[]).map((p) =>
      mapSupabaseRowsToUserProfile(
        p,
        plansByUser.get(p.id) ?? null,
        logsByUser.get(p.id) ?? []
      )
    );

    if (refreshed.length > 0) {
      db.mergeRemoteUsers(refreshed);
    }
    return refreshed;
  } catch {
    return [];
  }
}
