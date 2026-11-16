import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  Gender,
  PhysiqueGoal,
  ReminderSettings,
  ThemeTokens,
  UserProfile,
} from '../types/kinetix';
import {
  calculateBmi,
  calculateSleepTargetHours,
  calculateWaterTargetMl,
  getShortGoalLabel,
  resolveTheme,
} from '../services/theme';
import { FEMALE_GOALS, getTodaySplitDayIndex, MALE_GOALS } from '../services/db';
import { generateAthleteBlueprint } from '../services/blueprintFallback';
import {
  fetchDiscoverableSupabaseAthletes,
  searchSupabaseAthletes,
} from '../services/supabaseSync';
import { AthleteAvatar } from './AthleteAvatar';
import { PWAInstallButton } from './PWAInstallButton';

interface RegenLimitState {
  count: number;
  lockUntil: number | null;
}

const MAX_DAILY_REGENS = 3;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

function getRegenStorageKey(userId: string): string {
  return `gymfreak_regen_limit_${userId}`;
}

function readRegenLimit(userId: string): RegenLimitState {
  try {
    const raw = localStorage.getItem(getRegenStorageKey(userId));
    if (!raw) return { count: 0, lockUntil: null };
    const parsed = JSON.parse(raw) as Partial<RegenLimitState>;
    const count = typeof parsed.count === 'number' && parsed.count >= 0 ? parsed.count : 0;
    const lockUntil = typeof parsed.lockUntil === 'number' ? parsed.lockUntil : null;

    if (lockUntil !== null && Date.now() >= lockUntil) {
      const resetState: RegenLimitState = { count: 0, lockUntil: null };
      localStorage.setItem(getRegenStorageKey(userId), JSON.stringify(resetState));
      return resetState;
    }

    return { count, lockUntil };
  } catch {
    return { count: 0, lockUntil: null };
  }
}

function writeRegenLimit(userId: string, state: RegenLimitState): void {
  try {
    localStorage.setItem(getRegenStorageKey(userId), JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

function formatLockCountdown(msRemaining: number): string {
  const safeMs = Math.max(0, msRemaining);
  const totalMinutes = Math.ceil(safeMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
}

interface ProfileTabProps {
  user: UserProfile;
  allUsers: UserProfile[];
  theme: ThemeTokens;
  onUpdateProfileAndPlan: (updated: {
    gender: Gender;
    metrics: UserProfile['metrics'];
    goal: PhysiqueGoal;
    schedule: UserProfile['schedule'];
    split: UserProfile['split'];
    quotes: string[];
    blueprintSource: 'gemini-2.5-flash' | 'kinetix-engine';
    planVersion: number;
  }) => Promise<void> | void;
  onUpdateReminders: (reminders: ReminderSettings) => void;
  onTestReminder: (kind: 'workout' | 'hydration' | 'bedtime') => void;
  onToggleSquadMember: (friendId: string) => Promise<void> | void;
  onSyncRemoteUsers?: (users: UserProfile[]) => void;
  onSupabaseError?: (error: string | null) => void;
  onSignOut: () => void;
}

function ToggleSwitch({
  checked,
  onToggle,
  theme,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  theme: ThemeTokens;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className="w-12 h-7 rounded-full p-1 transition-colors shrink-0 flex items-center"
      style={{
        background: checked ? theme.gradientCss : 'rgba(255,255,255,0.14)',
        justifyContent: checked ? 'flex-end' : 'flex-start',
      }}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
    </button>
  );
}

export function ProfileTab({
  user,
  allUsers,
  theme,
  onUpdateProfileAndPlan,
  onUpdateReminders,
  onTestReminder,
  onToggleSquadMember,
  onSyncRemoteUsers,
  onSupabaseError,
  onSignOut,
}: ProfileTabProps) {
  const goalOptions = user.gender === 'female' ? FEMALE_GOALS : MALE_GOALS;
  const [weightKg, setWeightKg] = useState(user.metrics.weightKg);
  const [heightCm, setHeightCm] = useState(user.metrics.heightCm);
  const [age, setAge] = useState(user.metrics.age);
  const [goal, setGoal] = useState<PhysiqueGoal>(() =>
    goalOptions.some((g) => g.title === user.goal) ? user.goal : goalOptions[0].title
  );
  const [workoutTime, setWorkoutTime] = useState(user.schedule.workoutTime);
  const [bedTime, setBedTime] = useState(user.schedule.bedTime);
  const [customInstruction, setCustomInstruction] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // 3-Attempt / 24h lock state per user
  const [regenLimit, setRegenLimit] = useState<RegenLimitState>(() =>
    readRegenLimit(user.id)
  );
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Add Friends search state
  const [friendQuery, setFriendQuery] = useState('');
  const [searchingFriends, setSearchingFriends] = useState(false);
  const [friendSearchResults, setFriendSearchResults] = useState<UserProfile[] | null>(null);
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  // Refresh lock countdown while locked
  useEffect(() => {
    const fresh = readRegenLimit(user.id);
    setRegenLimit(fresh);
  }, [user.id]);

  const isLocked =
    regenLimit.count >= MAX_DAILY_REGENS &&
    regenLimit.lockUntil !== null &&
    nowMs < regenLimit.lockUntil;

  useEffect(() => {
    if (regenLimit.lockUntil === null) return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      if (regenLimit.lockUntil !== null && current >= regenLimit.lockUntil) {
        const cleared: RegenLimitState = { count: 0, lockUntil: null };
        writeRegenLimit(user.id, cleared);
        setRegenLimit(cleared);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [regenLimit.lockUntil, user.id]);

  // Load discoverable athletes for Profile "Add Friends" card
  useEffect(() => {
    let cancelled = false;
    setLoadingDiscover(true);
    fetchDiscoverableSupabaseAthletes(user.id)
      .then(({ results, error }) => {
        if (cancelled) return;
        if (error) {
          onSupabaseError?.(error);
        }
        setDiscoverUsers(results);
        if (results.length > 0) {
          onSyncRemoteUsers?.(results);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDiscover(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  // Live Supabase search in Profile "Add Friends"
  useEffect(() => {
    const clean = friendQuery.trim();
    if (!clean) {
      setFriendSearchResults(null);
      setSearchingFriends(false);
      return;
    }

    let cancelled = false;
    setSearchingFriends(true);
    const timer = setTimeout(async () => {
      const { results, error } = await searchSupabaseAthletes(clean, user.id);
      if (!cancelled) {
        if (error) {
          onSupabaseError?.(error);
        }
        setFriendSearchResults(results);
        setSearchingFriends(false);
        if (results.length > 0) {
          onSyncRemoteUsers?.(results);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [friendQuery, user.id]);

  const bmi = calculateBmi(heightCm, weightKg);
  const waterTarget = calculateWaterTargetMl(weightKg);
  const sleepTarget = calculateSleepTargetHours(user.gender);
  const todayIdx = getTodaySplitDayIndex();

  const attemptsRemaining = Math.max(0, MAX_DAILY_REGENS - regenLimit.count);
  const lockCountdownLabel =
    isLocked && regenLimit.lockUntil !== null
      ? `Locked for ${formatLockCountdown(regenLimit.lockUntil - nowMs)} (3/3 Daily Limit Reached)`
      : '';

  const handleSaveAndRegenerate = async () => {
    const currentLimit = readRegenLimit(user.id);
    if (
      currentLimit.count >= MAX_DAILY_REGENS &&
      currentLimit.lockUntil !== null &&
      Date.now() < currentLimit.lockUntil
    ) {
      setRegenLimit(currentLimit);
      setNowMs(Date.now());
      return;
    }

    const nextCount = Math.min(MAX_DAILY_REGENS, currentLimit.count + 1);
    const nextLockUntil =
      nextCount >= MAX_DAILY_REGENS ? Date.now() + LOCK_DURATION_MS : null;
    const updatedLimit: RegenLimitState = {
      count: nextCount,
      lockUntil: nextLockUntil,
    };
    writeRegenLimit(user.id, updatedLimit);
    setRegenLimit(updatedLimit);
    setNowMs(Date.now());

    setRegenerating(true);
    const nextPlanVersion = (user.planVersion ?? 0) + 1;
    const nextMetrics = { heightCm, weightKg, age };
    const nextSchedule = { ...user.schedule, workoutTime, bedTime };
    const safeGoal = goalOptions.some((g) => g.title === goal) ? goal : goalOptions[0].title;

    try {
      const result = await generateAthleteBlueprint({
        name: user.name,
        gender: user.gender,
        goal: safeGoal,
        metrics: nextMetrics,
        schedule: nextSchedule,
        variationSeed: nextPlanVersion,
        previousSplit: user.split,
        customInstruction: customInstruction.trim() || undefined,
      });

      await onUpdateProfileAndPlan({
        gender: user.gender,
        metrics: nextMetrics,
        goal: safeGoal,
        schedule: nextSchedule,
        split: result.split,
        quotes: result.quotes,
        blueprintSource: result.source,
        planVersion: nextPlanVersion,
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Candidates to render in Add Friends card (search results or discoverable non-friends + friends)
  const cleanFriendQuery = friendQuery.trim();
  const visibleFriendCandidates = cleanFriendQuery
    ? friendSearchResults ?? []
    : discoverUsers.filter((u) => !user.squadIds.includes(u.id)).slice(0, 6);

  const addedFriends = allUsers.filter(
    (u) => !u.id.startsWith('demo-') && user.squadIds.includes(u.id)
  );

  return (
    <div className="px-4 pt-4 pb-36 space-y-4">
      {/* Athlete Summary Card */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg flex items-center gap-4">
        <AthleteAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          gender={user.gender}
          sizeClass="w-14 h-14"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-white truncate">{user.name}</h1>
          <p className="text-xs text-white/60 truncate">
            {user.username} · {user.email}
          </p>
          <p className="text-[11px] font-semibold mt-1" style={{ color: theme.secondary }}>
            {user.goal} · BMI {bmi} · {waterTarget.toLocaleString()} ml/day
          </p>
        </div>
      </section>

      {/* Add Friends & Friend-Only Privacy Card */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: theme.secondary }} />
            <h2 className="text-sm font-bold text-white">Add Friends</h2>
          </div>
          <span className="text-[11px] font-mono-tabular text-white/55">
            {user.squadIds.length} Added
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={friendQuery}
            onChange={(e) => setFriendQuery(e.target.value)}
            placeholder="Search registered athletes by name or @username..."
            aria-label="Search friends by name or username"
            className="w-full min-h-[44px] pl-10 pr-9 bg-[#1A1D28] border border-white/10 rounded-2xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/25"
          />
          {friendQuery && (
            <button
              type="button"
              onClick={() => setFriendQuery('')}
              aria-label="Clear friend search"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[30px] min-h-[30px] flex items-center justify-center text-white/50 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results or Discover List */}
        <div className="space-y-2">
          {cleanFriendQuery && (
            <div className="flex items-center justify-between text-[11px] text-white/55">
              <span>Search Results ({visibleFriendCandidates.length})</span>
              {searchingFriends && (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Searching...</span>
                </span>
              )}
            </div>
          )}

          {!cleanFriendQuery && loadingDiscover && visibleFriendCandidates.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-white/55 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Finding registered athletes...</span>
            </div>
          )}

          {cleanFriendQuery && !searchingFriends && visibleFriendCandidates.length === 0 && (
            <p className="text-xs text-white/50 py-1">
              No registered athlete matched &quot;{friendQuery}&quot;.
            </p>
          )}

          {visibleFriendCandidates.map((candidate) => {
            const isFriend = user.squadIds.includes(candidate.id);
            const cTheme = resolveTheme(candidate.gender);
            const splitTitle = (candidate.split[todayIdx] ?? candidate.split[0])?.title.replace(
              /^Day\s+\d+:\s*/i,
              ''
            );

            return (
              <div
                key={candidate.id}
                className="p-2.5 rounded-2xl bg-[#1A1D28]/90 border border-white/[0.08] flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AthleteAvatar
                    name={candidate.name}
                    avatarUrl={candidate.avatarUrl}
                    gender={candidate.gender}
                    sizeClass="w-9 h-9"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-white truncate">{candidate.name}</p>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap"
                        style={{ backgroundColor: cTheme.softBg, color: cTheme.secondary }}
                      >
                        {candidate.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                    </div>

                    {isFriend ? (
                      <p className="text-[10px] text-white/60 truncate mt-0.5">
                        {getShortGoalLabel(candidate.goal)} · {splitTitle ?? 'Active'} ·{' '}
                        {candidate.dailyLog.workoutCompleted ? 'Crushed It' : 'In Progress'}
                      </p>
                    ) : (
                      <p className="text-[10px] text-white/50 truncate mt-0.5">
                        Add as a friend to view workout progress
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSquadMember(candidate.id)}
                  className="min-h-[36px] px-3 rounded-xl text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-all active:scale-95"
                  style={
                    isFriend
                      ? {
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.85)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }
                      : {
                          background: theme.gradientCss,
                          color: '#FFFFFF',
                        }
                  }
                >
                  {isFriend ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Friend</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Added Friends Quick List (when not actively filtering) */}
        {!cleanFriendQuery && addedFriends.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <p className="text-[11px] font-semibold text-white/55">
              Your Friends ({addedFriends.length})
            </p>
            <div className="space-y-1.5">
              {addedFriends.map((friend) => {
                const fTheme = resolveTheme(friend.gender);
                return (
                  <div
                    key={friend.id}
                    className="p-2 rounded-2xl bg-[#090A0F]/70 border border-white/[0.06] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AthleteAvatar
                        name={friend.name}
                        avatarUrl={friend.avatarUrl}
                        gender={friend.gender}
                        sizeClass="w-8 h-8"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white truncate">
                            {friend.name}
                          </span>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ backgroundColor: fTheme.softBg, color: fTheme.secondary }}
                          >
                            {friend.gender === 'female' ? 'Female' : 'Male'}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/55 truncate">
                          {friend.streakDays}d streak · {friend.dailyLog.waterMl}ml ·{' '}
                          {friend.dailyLog.steps.toLocaleString()} steps
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSquadMember(friend.id)}
                      aria-label={`Remove ${friend.name} from friends`}
                      className="min-h-[32px] px-2.5 rounded-xl bg-[#1A1D28] border border-white/10 text-[10px] font-semibold text-white/75 hover:text-white flex items-center gap-1 shrink-0"
                    >
                      <UserMinus className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Body Metrics & Goal Editor (Strictly Gender-Filtered) */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: theme.primary }} />
            <h2 className="text-sm font-bold text-white">Personalize Routine</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
              style={{
                backgroundColor: theme.softBg,
                color: theme.secondary,
                border: `1px solid ${theme.borderAccent}`,
              }}
            >
              {user.gender === 'female' ? 'Female Protocol' : 'Male Protocol'}
            </span>
            <span className="text-[10px] text-white/50 font-mono-tabular">
              v{user.planVersion ?? 1}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <label htmlFor="edit-weight" className="text-[11px] text-white/60 block">
              Weight (kg)
            </label>
            <input
              id="edit-weight"
              type="number"
              step={0.5}
              min={35}
              max={180}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value) || 55)}
              className="w-full min-h-[42px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-height" className="text-[11px] text-white/60 block">
              Height (cm)
            </label>
            <input
              id="edit-height"
              type="number"
              min={130}
              max={220}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value) || 168)}
              className="w-full min-h-[42px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-age" className="text-[11px] text-white/60 block">
              Age
            </label>
            <input
              id="edit-age"
              type="number"
              min={16}
              max={85}
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 26)}
              className="w-full min-h-[42px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-goal" className="text-[11px] text-white/60 block">
            Active Physique Goal
          </label>
          <select
            id="edit-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value as PhysiqueGoal)}
            className="w-full min-h-[44px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-white/30"
          >
            {goalOptions.map((g) => (
              <option key={g.title} value={g.title} className="bg-[#12141C] text-white">
                {g.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label htmlFor="edit-workout-time" className="text-[11px] text-white/60 block">
              Workout Alert Time
            </label>
            <input
              id="edit-workout-time"
              type="time"
              value={workoutTime}
              onChange={(e) => setWorkoutTime(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-mono-tabular text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-bed-time" className="text-[11px] text-white/60 block">
              Target Bedtime
            </label>
            <input
              id="edit-bed-time"
              type="time"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-mono-tabular text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="px-3 py-2.5 rounded-2xl bg-[#090A0F]/70 border border-white/[0.06] text-[11px] text-white/70 space-y-0.5">
          <p className="text-white/50">Active Split Lead</p>
          <p className="font-semibold text-white truncate">
            {user.split[0]?.title} · {user.split[0]?.exercises[0]?.name}
          </p>
        </div>

        {/* Custom Plan Instruction Input + Daily Attempt Limit */}
        <div className="space-y-1.5">
          <label htmlFor="custom-plan-prompt" className="text-[11px] font-medium text-white/75 block">
            Customize Plan Instructions (Optional)
          </label>
          <textarea
            id="custom-plan-prompt"
            rows={3}
            disabled={isLocked || regenerating}
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder="Want something specific? (e.g., focus more on upper chest, replace barbell squats, dumbbells only...)"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1A1D28] border border-white/10 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-white/30 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-[11px] text-amber-300/90 leading-snug">
            ⚠️ You can customize or regenerate your plan up to 3 times per day ({attemptsRemaining}/3 left).
          </p>
        </div>

        <button
          type="button"
          disabled={isLocked || regenerating}
          onClick={handleSaveAndRegenerate}
          className="w-full min-h-[46px] rounded-2xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed"
          style={{
            background: isLocked ? '#1A1D28' : theme.gradientCss,
            border: isLocked ? '1px solid rgba(255,255,255,0.14)' : undefined,
            boxShadow: isLocked ? undefined : `0 6px 20px ${theme.glow}`,
          }}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-mono-tabular">{lockCountdownLabel}</span>
            </>
          ) : regenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Updating Custom Blueprint...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Save Metrics &amp; Regenerate Plan</span>
            </>
          )}
        </button>
      </section>

      {/* Smart Push Notification & Reminder Center */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: theme.secondary }} />
          <h2 className="text-sm font-bold text-white">Smart Reminder Center</h2>
        </div>

        <div className="space-y-3 divide-y divide-white/[0.06]">
          <div className="pt-1 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">Workout Time Alert</p>
                <p className="text-[11px] text-white/55">
                  Personalized quote nudge at {workoutTime}
                </p>
              </div>
              <ToggleSwitch
                checked={user.reminders.workoutAlert}
                label="Toggle Workout Time Alert"
                theme={theme}
                onToggle={() =>
                  onUpdateReminders({
                    ...user.reminders,
                    workoutAlert: !user.reminders.workoutAlert,
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => onTestReminder('workout')}
              className="w-full min-h-[40px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-medium text-white/85 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span>Test Notification Now</span>
            </button>
          </div>

          <div className="pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">Hydration &amp; Step Pings</p>
                <p className="text-[11px] text-white/55">
                  Every 3h: 300ml water + 1,000 step prompt
                </p>
              </div>
              <ToggleSwitch
                checked={user.reminders.hydrationAndStepsPing}
                label="Toggle Hydration and Step Pings"
                theme={theme}
                onToggle={() =>
                  onUpdateReminders({
                    ...user.reminders,
                    hydrationAndStepsPing: !user.reminders.hydrationAndStepsPing,
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => onTestReminder('hydration')}
              className="w-full min-h-[40px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-medium text-white/85 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
              <span>Test Hydration &amp; Step Ping</span>
            </button>
          </div>

          <div className="pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">Bedtime Wind-Down Alert</p>
                <p className="text-[11px] text-white/55">
                  30m before {bedTime} for {sleepTarget.toFixed(1)}h recovery
                </p>
              </div>
              <ToggleSwitch
                checked={user.reminders.bedtimeWindDown}
                label="Toggle Bedtime Wind-Down Alert"
                theme={theme}
                onToggle={() =>
                  onUpdateReminders({
                    ...user.reminders,
                    bedtimeWindDown: !user.reminders.bedtimeWindDown,
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => onTestReminder('bedtime')}
              className="w-full min-h-[40px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-medium text-white/85 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span>Test Bedtime Alert Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* PWA Install + Account Controls */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-2.5">
        <PWAInstallButton theme={theme} />

        <button
          type="button"
          onClick={onSignOut}
          className="w-full min-h-[46px] rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-semibold text-white/85 hover:text-white flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </section>
    </div>
  );
}
