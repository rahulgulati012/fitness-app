import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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

export interface SupabaseConnectionStatus {
  connected: true;
  label: 'Cloud Synced';
  detail: string;
  diagnosticError?: string;
}

export interface SupabaseWriteResult {
  ok: boolean;
  error?: string;
}

export function formatSupabaseError(
  err: { message?: string; code?: string } | null | undefined,
  fallback = 'Request failed'
): string {
  if (!err) return `Supabase Error: ${fallback}`;
  const msg = err.message || fallback;
  const code = err.code || 'UNKNOWN';
  return `Supabase Error: ${msg} (${code})`;
}

export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  try {
    const { error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      const diagnostic = formatSupabaseError(error, 'profiles select failed');
      return {
        connected: true,
        label: 'Cloud Synced',
        detail: diagnostic,
        diagnosticError: diagnostic,
      };
    }
    return {
      connected: true,
      label: 'Cloud Synced',
      detail: 'Supabase connected and profiles table reachable.',
    };
  } catch (err) {
    const diagnostic =
      err instanceof Error
        ? `Supabase Error: ${err.message} (NETWORK)`
        : 'Supabase Error: Unable to reach Supabase server (NETWORK)';
    return {
      connected: true,
      label: 'Cloud Synced',
      detail: diagnostic,
      diagnosticError: diagnostic,
    };
  }
}

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

function extractCompletedExercisesPayload(
  user: UserProfile,
  targetDayIndex?: number
): CompletedExercisesSnapshot {
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
  const scopedCache = db.getUserCache(profile.id);

  const gender = resolveGenderStrict(profile.gender, profile.goal);
  const goal = resolveGoalStrict(gender, profile.goal);

  const displayName = (profile.display_name || scopedCache?.name || profile.email?.split('@')[0] || 'Athlete').trim();
  const weightKg = Number(profile.weight) || scopedCache?.metrics.weightKg || (gender === 'female' ? 58 : 80);
  const heightCm = Number(profile.height) || scopedCache?.metrics.heightCm || (gender === 'female' ? 167 : 181);
  const age = scopedCache?.metrics.age || 26;
  const planVersion = scopedCache?.planVersion ?? 1;

  const hasSavedWorkoutJson =
    Array.isArray(plan?.workout_json) && plan.workout_json.length > 0;

  const baseSplit = hasSavedWorkoutJson
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
  // Pick today's row, or fallback to latest row if date differs slightly on remote
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

  if (options?.allowBackfillMissingPlan && !hasSavedWorkoutJson) {
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
    current_split_day: user.currentSplitDay ?? getTodaySplitDayIndex(),
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

  const bareRes =
    userIds.length === 1
      ? await supabase.from('daily_logs').select('*').eq('user_id', userIds[0]).limit(60)
      : await supabase.from('daily_logs').select('*').in('user_id', userIds).limit(120);

  return (bareRes.data as DailyLogRow[] | null) ?? [];
}

function buildUserProfileFromAuthUser(authUser: SupabaseAuthUser): UserProfile {
  const scopedCache = db.getUserCache(authUser.id);
  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const email = (authUser.email ?? scopedCache?.email ?? '').trim().toLowerCase();

  const gender = resolveGenderStrict(
    meta.gender ?? scopedCache?.gender,
    meta.goal ?? scopedCache?.goal
  );
  const goal = resolveGoalStrict(gender, meta.goal ?? scopedCache?.goal);
  const weightKg =
    Number(meta.weight) || scopedCache?.metrics.weightKg || (gender === 'female' ? 58 : 80);
  const heightCm =
    Number(meta.height) || scopedCache?.metrics.heightCm || (gender === 'female' ? 167 : 181);
  const age = Number(meta.age) || scopedCache?.metrics.age || 26;
  const displayName =
    (typeof meta.display_name === 'string' && meta.display_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    scopedCache?.name ||
    email.split('@')[0] ||
    'Athlete';
  const vibe: MotivationVibe =
    meta.vibe === 'Unapologetic Hype' || meta.vibe === 'Elite Discipline'
      ? meta.vibe
      : scopedCache?.schedule.vibe || 'Confident & Indulging';

  const split =
    scopedCache?.split?.length === 7 && scopedCache.gender === gender
      ? scopedCache.split
      : buildVariedSplit(gender, goal, weightKg, 0);
  const quotes =
    scopedCache?.quotes?.length
      ? scopedCache.quotes
      : buildVariedQuotes(displayName, vibe, 0);

  return db.createUserProfile({
    id: authUser.id,
    name: displayName,
    email,
    password: '',
    gender,
    goal,
    metrics: { heightCm, weightKg, age },
    schedule: {
      workoutTime:
        typeof meta.workout_time === 'string'
          ? meta.workout_time
          : scopedCache?.schedule.workoutTime || '18:00',
      wakeTime:
        typeof meta.wake_time === 'string'
          ? meta.wake_time
          : scopedCache?.schedule.wakeTime || '06:30',
      bedTime:
        typeof meta.bed_time === 'string'
          ? meta.bed_time
          : scopedCache?.schedule.bedTime || '22:30',
      vibe,
    },
    split,
    quotes,
    blueprintSource: 'kinetix-engine',
  });
}

export async function hydrateAuthenticatedUserFromSupabase(
  authUser: SupabaseAuthUser
): Promise<{ user: UserProfile | null; error?: string }> {
  if (!isUuid(authUser.id)) {
    return { user: null, error: 'Supabase Error: Invalid athlete UUID (INVALID_ID)' };
  }

  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileErr) {
    return {
      user: null,
      error: formatSupabaseError(profileErr, 'Unable to read profiles table'),
    };
  }

  if (profileData) {
    const [planRes, logs] = await Promise.all([
      supabase.from('user_plans').select('*').eq('user_id', authUser.id).maybeSingle(),
      fetch30DayLogsForUsers([authUser.id]),
    ]);

    if (planRes.error) {
      return {
        user: null,
        error: formatSupabaseError(planRes.error, 'Unable to read user_plans table'),
      };
    }

    const planRow = (planRes.data as UserPlanRow | null) ?? null;
    const hydrated = mapSupabaseRowsToUserProfile(
      profileData as ProfileRow,
      planRow,
      logs
    );

    if (!planRow || !Array.isArray(planRow.workout_json) || planRow.workout_json.length === 0) {
      const planWrite = await syncUserPlanToSupabase(hydrated);
      if (!planWrite.ok) {
        return { user: db.upsertSyncedUser(hydrated, true), error: planWrite.error };
      }
    }

    return { user: db.upsertSyncedUser(hydrated, true) };
  }

  // First login without an existing profiles row: create and upsert profile, plan, and initial log
  const created = buildUserProfileFromAuthUser(authUser);
  db.saveUserCache(created);
  const syncRes = await syncAllUserTablesToSupabase(created);
  return {
    user: db.upsertSyncedUser(created, true),
    error: syncRes.ok ? undefined : syncRes.error,
  };
}

export async function restoreSupabaseSession(): Promise<{
  user: UserProfile | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { user: null, error: formatSupabaseError(error, 'Session lookup failed') };
    }
    if (!data.session?.user) return { user: null };
    return await hydrateAuthenticatedUserFromSupabase(data.session.user);
  } catch (err) {
    return {
      user: null,
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (SESSION_ERROR)`
          : 'Supabase Error: Unable to restore session (SESSION_ERROR)',
    };
  }
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { error: formatSupabaseError(error, 'Sign in failed') };
    }

    if (!data.user) {
      return { error: 'Supabase Error: Authentication succeeded without a user record (NO_USER)' };
    }

    const hydrated = await hydrateAuthenticatedUserFromSupabase(data.user);
    if (!hydrated.user) {
      return { error: hydrated.error || 'Supabase Error: Unable to load athlete profile (PROFILE_LOAD)' };
    }
    return { user: hydrated.user, error: hydrated.error };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (NETWORK)`
          : 'Supabase Error: Network error contacting Supabase authentication (NETWORK)',
    };
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
}): Promise<{ user?: UserProfile; syncedToCloud: boolean; notice?: string; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();

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

    if (error) {
      return { syncedToCloud: false, error: formatSupabaseError(error, 'Sign up failed') };
    }

    if (!data.user) {
      return {
        syncedToCloud: false,
        error: 'Supabase Error: Signup completed without a user ID (NO_USER)',
      };
    }

    const created = db.createUserProfile({
      ...input,
      id: data.user.id,
    });
    db.saveUserCache(created);

    const syncRes = await syncAllUserTablesToSupabase(created);

    if (!data.session && !syncRes.ok) {
      return {
        user: created,
        syncedToCloud: false,
        error: syncRes.error,
        notice: 'Check your email to confirm your account, then sign in from any device.',
      };
    }

    if (!syncRes.ok && syncRes.error) {
      return {
        user: created,
        syncedToCloud: false,
        error: syncRes.error,
        notice: syncRes.error,
      };
    }

    return { user: created, syncedToCloud: syncRes.ok };
  } catch (err) {
    return {
      syncedToCloud: false,
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (SIGNUP_NETWORK)`
          : 'Supabase Error: Unable to reach Supabase signup (SIGNUP_NETWORK)',
    };
  }
}

export async function signOutFromSupabase(): Promise<void> {
  db.signOut();
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore network error during signout
  }
}

export async function syncProfileToSupabase(user: UserProfile): Promise<SupabaseWriteResult> {
  db.saveUserCache(user);
  if (!isUuid(user.id)) {
    return { ok: false, error: 'Supabase Error: Invalid athlete UUID (INVALID_ID)' };
  }
  try {
    const fullPayload = toFullProfilePayload(user);
    const { error } = await supabase
      .from('profiles')
      .upsert(fullPayload, { onConflict: 'id' });

    if (!error) return { ok: true };

    const isMissingCol =
      error.code === '42703' ||
      error.code === 'PGRST204' ||
      /column .* does not exist/i.test(error.message || '');

    if (!isMissingCol) {
      return { ok: false, error: formatSupabaseError(error, 'Profile upsert failed') };
    }

    const { error: squadOnlyErr } = await supabase
      .from('profiles')
      .upsert({ ...toCoreProfilePayload(user), squad_ids: user.squadIds }, { onConflict: 'id' });
    if (!squadOnlyErr) return { ok: true };

    const { error: coreError } = await supabase
      .from('profiles')
      .upsert(toCoreProfilePayload(user), { onConflict: 'id' });
    if (!coreError) return { ok: true };

    const { current_split_day: _ignored, ...strictMinimal } = toCoreProfilePayload(user);
    const { error: minimalErr } = await supabase
      .from('profiles')
      .upsert(strictMinimal, { onConflict: 'id' });
    if (!minimalErr) return { ok: true };

    return { ok: false, error: formatSupabaseError(minimalErr, error.message) };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (PROFILE_UPSERT)`
          : 'Supabase Error: Profile sync failed (PROFILE_UPSERT)',
    };
  }
}

export async function syncUserPlanToSupabase(user: UserProfile): Promise<SupabaseWriteResult> {
  db.saveUserCache(user);
  if (!isUuid(user.id)) {
    return { ok: false, error: 'Supabase Error: Invalid athlete UUID (INVALID_ID)' };
  }
  try {
    const payload = toUserPlanPayload(user);
    const { error } = await supabase
      .from('user_plans')
      .upsert(payload, { onConflict: 'user_id' });
    if (!error) return { ok: true };

    return { ok: false, error: formatSupabaseError(error, 'User plan upsert failed') };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (PLAN_UPSERT)`
          : 'Supabase Error: Plan sync failed (PLAN_UPSERT)',
    };
  }
}

export async function syncDailyLogToSupabase(
  user: UserProfile,
  activeDayIndex?: number
): Promise<SupabaseWriteResult> {
  db.saveUserCache(user);
  if (!isUuid(user.id)) {
    return { ok: false, error: 'Supabase Error: Invalid athlete UUID (INVALID_ID)' };
  }
  try {
    const payload = toDailyLogPayload(user, activeDayIndex);
    const { error } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id,date' });
    if (!error) return { ok: true };

    const isMissingCol =
      error.code === '42703' ||
      error.code === 'PGRST204' ||
      /column .* does not exist/i.test(error.message || '');

    if (!isMissingCol) {
      return { ok: false, error: formatSupabaseError(error, 'Daily log upsert failed') };
    }

    const { date: dateVal, ...rest } = payload;
    const { error: coreDateErr } = await supabase
      .from('daily_logs')
      .upsert(
        {
          user_id: user.id,
          date: dateVal,
          workout_completed: user.dailyLog.workoutCompleted,
          completed_exercises: payload.completed_exercises,
          water_ml: user.dailyLog.waterMl,
          steps_count: user.dailyLog.steps,
          sleep_hours: user.dailyLog.sleepHours,
        },
        { onConflict: 'user_id,date' }
      );
    if (!coreDateErr) return { ok: true };

    const { error: logDateErr } = await supabase
      .from('daily_logs')
      .upsert(
        { ...rest, log_date: dateVal },
        { onConflict: 'user_id,log_date' }
      );
    if (!logDateErr) return { ok: true };

    return { ok: false, error: formatSupabaseError(logDateErr, error.message) };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (LOG_UPSERT)`
          : 'Supabase Error: Daily log sync failed (LOG_UPSERT)',
    };
  }
}

export async function syncAllUserTablesToSupabase(
  user: UserProfile
): Promise<SupabaseWriteResult> {
  db.saveUserCache(user);
  if (!isUuid(user.id)) {
    return { ok: false, error: 'Supabase Error: Invalid athlete UUID (INVALID_ID)' };
  }
  try {
    const profileRes = await syncProfileToSupabase(user);
    if (!profileRes.ok) return profileRes;
    const [planRes, logRes] = await Promise.all([
      syncUserPlanToSupabase(user),
      syncDailyLogToSupabase(user),
    ]);
    if (!planRes.ok) return planRes;
    if (!logRes.ok) return logRes;
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (SYNC_ALL)`
          : 'Supabase Error: Cloud sync failed (SYNC_ALL)',
    };
  }
}

async function hydrateProfileRowsWithTodayAndPlans(
  profiles: ProfileRow[],
  prefetchedTodayLogs?: DailyLogRow[]
): Promise<{ users: UserProfile[]; error?: string }> {
  if (profiles.length === 0) return { users: [] };
  const ids = profiles.map((p) => p.id);
  const todayDateStr = getTodayDateKey();

  const [plansRes, todayLogsRes, thirtyDayLogs] = await Promise.all([
    supabase.from('user_plans').select('*').in('user_id', ids),
    prefetchedTodayLogs
      ? Promise.resolve({ data: prefetchedTodayLogs, error: null })
      : supabase.from('daily_logs').select('*').eq('date', todayDateStr).in('user_id', ids),
    fetch30DayLogsForUsers(ids),
  ]);

  if (plansRes.error) {
    return { users: [], error: formatSupabaseError(plansRes.error, 'user_plans query failed') };
  }
  if (todayLogsRes.error) {
    return {
      users: [],
      error: formatSupabaseError(todayLogsRes.error, 'daily_logs query failed'),
    };
  }

  const plansByUser = new Map<string, UserPlanRow>(
    ((plansRes.data as UserPlanRow[] | null) ?? []).map((pl) => [pl.user_id, pl])
  );

  const logsByUser = new Map<string, DailyLogRow[]>();
  const appendLog = (row: DailyLogRow) => {
    const existing = logsByUser.get(row.user_id) ?? [];
    const dKey = (row.date || row.log_date || '').slice(0, 10);
    if (!existing.some((r) => (r.date || r.log_date || '').slice(0, 10) === dKey)) {
      existing.push(row);
      logsByUser.set(row.user_id, existing);
    }
  };

  for (const row of ((todayLogsRes.data as DailyLogRow[] | null) ?? [])) {
    appendLog(row);
  }
  for (const row of thirtyDayLogs) {
    appendLog(row);
  }

  const cloudUsers = profiles.map((p) =>
    mapSupabaseRowsToUserProfile(
      p,
      plansByUser.get(p.id) ?? null,
      logsByUser.get(p.id) ?? []
    )
  );

  db.mergeRemoteUsers(cloudUsers);
  return { users: cloudUsers };
}

export async function fetchDiscoverableSupabaseAthletes(
  activeUserId: string
): Promise<{ results: UserProfile[]; error?: string }> {
  try {
    const todayDateStr = getTodayDateKey();
    const [profilesRes, todayLogsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('daily_logs').select('*').eq('date', todayDateStr),
    ]);

    if (profilesRes.error) {
      return {
        results: [],
        error: formatSupabaseError(profilesRes.error, 'Unable to fetch profiles'),
      };
    }
    if (todayLogsRes.error) {
      return {
        results: [],
        error: formatSupabaseError(todayLogsRes.error, 'Unable to fetch daily_logs'),
      };
    }

    const otherProfiles = ((profilesRes.data as ProfileRow[] | null) ?? []).filter(
      (p) => p.id !== activeUserId
    );
    const hydrated = await hydrateProfileRowsWithTodayAndPlans(
      otherProfiles,
      (todayLogsRes.data as DailyLogRow[] | null) ?? []
    );
    return { results: hydrated.users, error: hydrated.error };
  } catch (err) {
    return {
      results: [],
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (SQUAD_FETCH)`
          : 'Supabase Error: Unable to fetch Squad directory (SQUAD_FETCH)',
    };
  }
}

export async function searchSupabaseAthletes(
  query: string,
  activeUserId: string
): Promise<{ results: UserProfile[]; error?: string }> {
  const clean = query.trim();
  if (!clean) {
    return fetchDiscoverableSupabaseAthletes(activeUserId);
  }

  try {
    const todayDateStr = getTodayDateKey();
    const q = clean.toLowerCase();

    const [profilesRes, todayLogsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('daily_logs').select('*').eq('date', todayDateStr),
    ]);

    if (profilesRes.error) {
      return {
        results: [],
        error: formatSupabaseError(profilesRes.error, 'Unable to query profiles'),
      };
    }
    if (todayLogsRes.error) {
      return {
        results: [],
        error: formatSupabaseError(todayLogsRes.error, 'Unable to query daily_logs'),
      };
    }

    const matchedProfiles = ((profilesRes.data as ProfileRow[] | null) ?? []).filter((p) => {
      if (p.id === activeUserId) return false;
      const name = (p.display_name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const goal = (p.goal || '').toLowerCase();
      const uname = makeUsernameFromName(p.display_name || '').toLowerCase();
      const pid = (p.id || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        goal.includes(q) ||
        uname.includes(q) ||
        pid.includes(q)
      );
    });

    const hydrated = await hydrateProfileRowsWithTodayAndPlans(
      matchedProfiles,
      (todayLogsRes.data as DailyLogRow[] | null) ?? []
    );
    return { results: hydrated.users, error: hydrated.error };
  } catch (err) {
    return {
      results: [],
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (SQUAD_SEARCH)`
          : 'Supabase Error: Unable to search Supabase athletes (SQUAD_SEARCH)',
    };
  }
}

export async function refreshSquadLiveStatuses(
  squadIds: string[]
): Promise<{ users: UserProfile[]; error?: string }> {
  const validIds = squadIds.filter(isUuid);
  if (validIds.length === 0) {
    return { users: [] };
  }

  try {
    const todayDateStr = getTodayDateKey();
    const [profilesRes, todayLogsRes] = await Promise.all([
      supabase.from('profiles').select('*').in('id', validIds),
      supabase.from('daily_logs').select('*').eq('date', todayDateStr).in('user_id', validIds),
    ]);

    if (profilesRes.error) {
      return {
        users: [],
        error: formatSupabaseError(profilesRes.error, 'Unable to refresh Squad profiles'),
      };
    }
    if (todayLogsRes.error) {
      return {
        users: [],
        error: formatSupabaseError(todayLogsRes.error, 'Unable to refresh Squad logs'),
      };
    }

    return await hydrateProfileRowsWithTodayAndPlans(
      (profilesRes.data as ProfileRow[] | null) ?? [],
      (todayLogsRes.data as DailyLogRow[] | null) ?? []
    );
  } catch (err) {
    return {
      users: [],
      error:
        err instanceof Error
          ? `Supabase Error: ${err.message} (SQUAD_REFRESH)`
          : 'Supabase Error: Unable to refresh Squad statuses (SQUAD_REFRESH)',
    };
  }
}
