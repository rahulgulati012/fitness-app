import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { buildVariedQuotes, buildVariedSplit } from '../data/workoutEngine';
import type {
  BodyMeasurementEntry,
  DailyBioLog,
  DailyTrendPoint,
  Gender,
  MotivationVibe,
  PhysiqueGoal,
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
  gender: Gender;
  height: number;
  weight: number;
  goal: PhysiqueGoal;
  workout_time: string;
  bed_time: string;
  streak: number;
  squad_ids?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

interface UserPlanRow {
  user_id: string;
  workout_json: WorkoutDay[];
  quotes_json: string[];
  updated_at?: string;
}

interface DailyLogRow {
  user_id: string;
  log_date?: string;
  workout_completed: boolean;
  water_ml: number;
  steps_count: number;
  sleep_hours: number;
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

function mapSupabaseRowsToUserProfile(
  profile: ProfileRow,
  plan: UserPlanRow | null,
  logs: DailyLogRow[]
): UserProfile {
  const existingLocal = db.getUsers().find((u) => u.id === profile.id);

  const gender: Gender = profile.gender === 'male' ? 'male' : 'female';
  const allowedGoals = gender === 'female' ? FEMALE_GOALS : MALE_GOALS;
  const goal: PhysiqueGoal = allowedGoals.some((g) => g.title === profile.goal)
    ? profile.goal
    : allowedGoals[0].title;

  const displayName = (profile.display_name || existingLocal?.name || 'Athlete').trim();
  const weightKg = Number(profile.weight) || existingLocal?.metrics.weightKg || (gender === 'female' ? 58 : 80);
  const heightCm = Number(profile.height) || existingLocal?.metrics.heightCm || (gender === 'female' ? 167 : 181);
  const age = existingLocal?.metrics.age || 26;
  const planVersion = existingLocal?.planVersion ?? 1;

  const split =
    Array.isArray(plan?.workout_json) && plan.workout_json.length === 7
      ? plan.workout_json
      : existingLocal?.split?.length === 7
        ? existingLocal.split
        : buildVariedSplit(gender, goal, weightKg, Math.max(0, planVersion - 1));

  const vibe: MotivationVibe = existingLocal?.schedule.vibe || 'Confident & Indulging';
  const quotes =
    Array.isArray(plan?.quotes_json) && plan.quotes_json.length > 0
      ? plan.quotes_json
      : existingLocal?.quotes?.length
        ? existingLocal.quotes
        : buildVariedQuotes(displayName, vibe, Math.max(0, planVersion - 1));

  const today = getTodayDateKey();
  const logByDate = new Map(logs.filter((l) => l.log_date).map((l) => [l.log_date as string, l]));
  const todayRow = logByDate.get(today) ?? (logs.length === 1 && !logs[0].log_date ? logs[0] : undefined);

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
    completedAt: existingLocal?.dailyLog.completedAt,
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

  const avatarUrl = existingLocal?.avatarUrl || AVATAR_OPTIONS[gender][0];

  const defaultMeasurements: BodyMeasurementEntry[] = [
    {
      id: `bm-${profile.id}`,
      dateLabel: 'Today',
      weightKg,
      waistCm: gender === 'female' ? 65 : 81,
      hipCm: gender === 'female' ? 95 : 98,
      chestCm: gender === 'female' ? 87 : 104,
    },
  ];

  const squadIds = Array.isArray(profile.squad_ids)
    ? profile.squad_ids
    : existingLocal?.squadIds ?? [];

  return {
    id: profile.id,
    username: existingLocal?.username || makeUsernameFromName(displayName),
    name: displayName,
    email: profile.email || existingLocal?.email || '',
    avatarUrl,
    gender,
    goal,
    metrics: { heightCm, weightKg, age },
    schedule: {
      workoutTime: profile.workout_time || existingLocal?.schedule.workoutTime || '18:00',
      wakeTime: existingLocal?.schedule.wakeTime || '06:30',
      bedTime: profile.bed_time || existingLocal?.schedule.bedTime || '22:30',
      vibe,
    },
    streakDays: Number(profile.streak) || existingLocal?.streakDays || 1,
    hypeReceived: existingLocal?.hypeReceived ?? 0,
    squadIds,
    split,
    quotes,
    dailyLog,
    weeklyHistory,
    bodyMeasurements: existingLocal?.bodyMeasurements?.length
      ? existingLocal.bodyMeasurements
      : defaultMeasurements,
    recentWorkouts: existingLocal?.recentWorkouts ?? [],
    reminders: existingLocal?.reminders ?? {
      workoutAlert: true,
      hydrationAndStepsPing: true,
      bedtimeWindDown: true,
    },
    notifications: existingLocal?.notifications ?? [],
    blueprintSource: existingLocal?.blueprintSource ?? 'kinetix-engine',
    planVersion,
    createdAt: profile.created_at || existingLocal?.createdAt || new Date().toISOString(),
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
  };
}

function toDailyLogPayload(user: UserProfile) {
  return {
    user_id: user.id,
    log_date: user.dailyLog.dateKey || getTodayDateKey(),
    workout_completed: user.dailyLog.workoutCompleted,
    water_ml: user.dailyLog.waterMl,
    steps_count: user.dailyLog.steps,
    sleep_hours: user.dailyLog.sleepHours,
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

async function fetchHydratedSupabaseUser(userId: string): Promise<UserProfile | null> {
  if (!supabase || !isUuid(userId)) return null;

  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileErr || !profileData) return null;

  const [planRes, logsResInitial] = await Promise.all([
    supabase.from('user_plans').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(14),
  ]);

  const logsData = logsResInitial.error
    ? (await supabase.from('daily_logs').select('*').eq('user_id', userId).limit(14)).data
    : logsResInitial.data;

  return mapSupabaseRowsToUserProfile(
    profileData as ProfileRow,
    (planRes.data as UserPlanRow | null) ?? null,
    ((logsData as DailyLogRow[] | null) ?? [])
  );
}

export async function restoreSupabaseSession(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return null;

    const hydrated = await fetchHydratedSupabaseUser(data.session.user.id);
    if (!hydrated) return null;

    return db.upsertSyncedUser(hydrated, true);
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

    const authUser = data.user;
    if (!authUser) {
      return db.signInWithEmail(cleanEmail, password);
    }

    const remoteProfile = await fetchHydratedSupabaseUser(authUser.id);
    if (remoteProfile) {
      const saved = db.upsertSyncedUser(remoteProfile, true);
      return { user: saved };
    }

    const localMatch = db
      .getUsers()
      .find((u) => u.email.toLowerCase() === cleanEmail);
    if (localMatch) {
      const migrated: UserProfile = { ...localMatch, id: authUser.id };
      const saved = db.upsertSyncedUser(migrated, true);
      void syncAllUserTablesToSupabase(saved);
      return { user: saved };
    }

    const fallbackName =
      (authUser.user_metadata?.display_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      cleanEmail.split('@')[0] ||
      'Athlete';
    const created = db.createUserProfile({
      id: authUser.id,
      name: fallbackName,
      email: cleanEmail,
      password,
      gender: 'female',
      goal: 'Hourglass & Glute Sculpt',
      metrics: { heightCm: 168, weightKg: 58, age: 26 },
      schedule: {
        workoutTime: '18:00',
        wakeTime: '06:30',
        bedTime: '22:30',
        vibe: 'Confident & Indulging',
      },
      split: buildVariedSplit('female', 'Hourglass & Glute Sculpt', 58, 0),
      quotes: buildVariedQuotes(fallbackName, 'Confident & Indulging', 0),
      blueprintSource: 'kinetix-engine',
    });
    void syncAllUserTablesToSupabase(created);
    return { user: created };
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
  if (!isSupabaseConfigured() || !supabase || !isUuid(user.id)) return false;
  try {
    const corePayload = toCoreProfilePayload(user);
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...corePayload, squad_ids: user.squadIds }, { onConflict: 'id' });

    if (!error) return true;

    // Fallback cleanly if remote profiles table does not include optional squad_ids column
    const { error: coreError } = await supabase
      .from('profiles')
      .upsert(corePayload, { onConflict: 'id' });
    return !coreError;
  } catch {
    return false;
  }
}

export async function syncUserPlanToSupabase(user: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase || !isUuid(user.id)) return false;
  try {
    const { error } = await supabase
      .from('user_plans')
      .upsert(toUserPlanPayload(user), { onConflict: 'user_id' });
    return !error;
  } catch {
    return false;
  }
}

export async function syncDailyLogToSupabase(user: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase || !isUuid(user.id)) return false;
  try {
    const payload = toDailyLogPayload(user);
    const { error } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id,log_date' });
    if (!error) return true;

    // Fallback if remote daily_logs table uses user_id as sole conflict key without log_date
    const { error: fallbackErr } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id' });
    return !fallbackErr;
  } catch {
    return false;
  }
}

export async function syncAllUserTablesToSupabase(user: UserProfile): Promise<boolean> {
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
    const weekStart = getMondayOfCurrentWeekDateKeys()[0]?.dateKey ?? getTodayDateKey();

    const [plansRes, logsResInitial] = await Promise.all([
      supabase.from('user_plans').select('*').in('user_id', ids),
      supabase
        .from('daily_logs')
        .select('*')
        .in('user_id', ids)
        .gte('log_date', weekStart)
        .order('log_date', { ascending: false }),
    ]);

    const logsData = logsResInitial.error
      ? (await supabase.from('daily_logs').select('*').in('user_id', ids)).data
      : logsResInitial.data;

    const plansByUser = new Map<string, UserPlanRow>(
      ((plansRes.data as UserPlanRow[] | null) ?? []).map((pl) => [pl.user_id, pl])
    );

    const logsByUser = new Map<string, DailyLogRow[]>();
    for (const row of (logsData as DailyLogRow[] | null) ?? []) {
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
    const weekStart = getMondayOfCurrentWeekDateKeys()[0]?.dateKey ?? getTodayDateKey();
    const [profilesRes, plansRes, logsResInitial] = await Promise.all([
      supabase.from('profiles').select('*').in('id', validIds),
      supabase.from('user_plans').select('*').in('user_id', validIds),
      supabase
        .from('daily_logs')
        .select('*')
        .in('user_id', validIds)
        .gte('log_date', weekStart),
    ]);

    if (profilesRes.error || !profilesRes.data) return [];

    const logsData = logsResInitial.error
      ? (await supabase.from('daily_logs').select('*').in('user_id', validIds)).data
      : logsResInitial.data;

    const plansByUser = new Map<string, UserPlanRow>(
      ((plansRes.data as UserPlanRow[] | null) ?? []).map((pl) => [pl.user_id, pl])
    );
    const logsByUser = new Map<string, DailyLogRow[]>();
    for (const row of (logsData as DailyLogRow[] | null) ?? []) {
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
