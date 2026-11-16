import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { ThemeTokens, UserProfile } from '../types/kinetix';
import {
  calculateSleepTargetHours,
  calculateStepTarget,
  calculateWaterTargetMl,
  getShortGoalLabel,
  resolveTheme,
} from '../services/theme';
import { getTodaySplitDayIndex } from '../services/db';
import {
  fetchDiscoverableSupabaseAthletes,
  refreshSquadLiveStatuses,
  searchSupabaseAthletes,
} from '../services/supabaseSync';
import { AthleteAvatar } from './AthleteAvatar';

interface SquadTabProps {
  activeUser: UserProfile;
  allUsers: UserProfile[];
  theme: ThemeTokens;
  onSendHype: (targetUserId: string) => void;
  onToggleSquadMember: (friendId: string) => void;
  onSyncRemoteUsers?: (users: UserProfile[]) => void;
  onSupabaseError?: (error: string | null) => void;
}

export function SquadTab({
  activeUser,
  allUsers,
  theme,
  onSendHype,
  onToggleSquadMember,
  onSyncRemoteUsers,
  onSupabaseError,
}: SquadTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [searchingCloud, setSearchingCloud] = useState(false);
  const [remoteSearchResults, setRemoteSearchResults] = useState<UserProfile[] | null>(null);
  const [discoverableCloudUsers, setDiscoverableCloudUsers] = useState<UserProfile[]>([]);

  const todayIdx = getTodaySplitDayIndex();
  const [loadingDiscover, setLoadingDiscover] = useState<boolean>(true);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const loadLiveDirectory = () => {
    setLoadingDiscover(true);
    setCloudError(null);

    fetchDiscoverableSupabaseAthletes(activeUser.id)
      .then(({ results, error }) => {
        if (error) {
          setCloudError(error);
          onSupabaseError?.(error);
        } else {
          onSupabaseError?.(null);
        }
        setDiscoverableCloudUsers(results);
        if (results.length > 0) {
          onSyncRemoteUsers?.(results);
        }
      })
      .finally(() => {
        setLoadingDiscover(false);
      });
  };

  // Fetch live Supabase profiles & today's daily_logs on mount and refresh Squad members
  useEffect(() => {
    let cancelled = false;
    setLoadingDiscover(true);
    setCloudError(null);

    fetchDiscoverableSupabaseAthletes(activeUser.id)
      .then(({ results, error }) => {
        if (cancelled) return;
        if (error) {
          setCloudError(error);
          onSupabaseError?.(error);
        } else {
          onSupabaseError?.(null);
        }
        setDiscoverableCloudUsers(results);
        if (results.length > 0) {
          onSyncRemoteUsers?.(results);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDiscover(false);
      });

    if (activeUser.squadIds.length > 0) {
      refreshSquadLiveStatuses(activeUser.squadIds).then(({ users, error }) => {
        if (cancelled) return;
        if (error) {
          setCloudError(error);
          onSupabaseError?.(error);
        }
        if (users.length > 0) {
          onSyncRemoteUsers?.(users);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [activeUser.id, activeUser.squadIds.join(',')]);

  // Query Supabase profiles + daily_logs live when user types in search bar
  useEffect(() => {
    const clean = searchQuery.trim();
    if (!clean) {
      setRemoteSearchResults(null);
      setSearchingCloud(false);
      return;
    }

    let cancelled = false;
    setSearchingCloud(true);
    setCloudError(null);

    const timer = setTimeout(async () => {
      const { results, error } = await searchSupabaseAthletes(clean, activeUser.id);
      if (!cancelled) {
        if (error) {
          setCloudError(error);
          onSupabaseError?.(error);
        } else {
          onSupabaseError?.(null);
        }
        setRemoteSearchResults(results);
        setSearchingCloud(false);
        if (results.length > 0) {
          onSyncRemoteUsers?.(results);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeUser.id]);

  // Strictly exclude local demo-* profiles so only real Supabase database rows appear
  const cloudUsers = allUsers.filter((u) => !u.id.startsWith('demo-'));

  // Personal Squad Members
  const squadMembers = cloudUsers.filter((u) => activeUser.squadIds.includes(u.id));

  const cleanQuery = searchQuery.trim().toLowerCase();
  const searchResults = remoteSearchResults ?? [];

  const discoverSuggestions = discoverableCloudUsers.filter(
    (u) => !activeUser.squadIds.includes(u.id)
  );

  const rankedSquad = [...squadMembers].sort((a, b) => {
    if (a.dailyLog.workoutCompleted !== b.dailyLog.workoutCompleted) {
      return a.dailyLog.workoutCompleted ? -1 : 1;
    }
    return b.streakDays - a.streakDays;
  });

  const squadCompletedCount =
    squadMembers.filter((u) => u.dailyLog.workoutCompleted).length +
    (activeUser.dailyLog.workoutCompleted ? 1 : 0);
  const totalCircleCount = squadMembers.length + 1;

  const inspectedFriend =
    selectedFriendId && activeUser.squadIds.includes(selectedFriendId)
      ? allUsers.find((u) => u.id === selectedFriendId) ?? null
      : null;

  const getTodaySplitBadge = (athlete: UserProfile) => {
    const dayObj = athlete.split[todayIdx] ?? athlete.split[0];
    if (!dayObj) return 'Today: Training Session';
    if (dayObj.isRestDay) return 'Today: Active Recovery';
    const cleanTitle = dayObj.title.replace(/^Day\s+\d+:\s*/i, '');
    return `Today: ${cleanTitle}`;
  };

  return (
    <div className="px-4 pt-4 pb-36 space-y-4">
      {/* Top Summary Banner */}
      <section
        className="rounded-3xl p-5 bg-[#12141C]/90 backdrop-blur-xl border border-white/[0.1] shadow-lg space-y-2.5"
        style={{ boxShadow: `0 10px 28px ${theme.glow}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/65">
            <Users className="w-4 h-4" style={{ color: theme.secondary }} />
            <span>Your Squad Circle</span>
          </div>
          <span className="text-xs font-mono-tabular text-white/60">
            {squadMembers.length} Friends · You
          </span>
        </div>
        <h1 className="text-lg font-bold text-white leading-snug text-balance">
          {squadCompletedCount} of {totalCircleCount} in Your Squad Crushed Today&apos;s Session
        </h1>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.round((squadCompletedCount / totalCircleCount) * 100)}%`,
              background: theme.gradientCss,
            }}
          />
        </div>
      </section>

      {/* Add Friends Search & Discovery */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" style={{ color: theme.primary }} />
            <h2 className="text-xs font-bold text-white">Add Friends</h2>
          </div>
          <span className="text-[10px] text-white/50">Search by name or @username</span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athletes by name, @username, or ID..."
            aria-label="Add Friends search"
            className="w-full min-h-[46px] pl-10 pr-9 bg-[#1A1D28] border border-white/10 rounded-2xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/25"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear athlete search"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {cleanQuery && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-white/55">
                Search Results ({searchResults.length})
              </p>
              {searchingCloud && (
                <span className="inline-flex items-center gap-1 text-[10px] text-white/50">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </span>
              )}
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-white/50 py-2">
                {searchingCloud
                  ? 'Searching registered athletes...'
                  : `No registered athlete matched "${searchQuery}".`}
              </p>
            ) : (
              searchResults.map((candidate) => {
                const isAdded = activeUser.squadIds.includes(candidate.id);
                const cTheme = resolveTheme(candidate.gender);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => {
                      if (isAdded) setSelectedFriendId(candidate.id);
                    }}
                    className={`p-2.5 rounded-2xl bg-[#1A1D28]/90 border border-white/[0.08] flex items-center justify-between gap-2.5 transition-colors ${
                      isAdded ? 'hover:border-white/20 cursor-pointer' : ''
                    }`}
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
                          {isAdded && (
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap"
                              style={
                                candidate.dailyLog.workoutCompleted
                                  ? { backgroundColor: cTheme.softBg, color: cTheme.secondary }
                                  : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)' }
                              }
                            >
                              {candidate.dailyLog.workoutCompleted ? 'Crushed It' : 'In Progress'}
                            </span>
                          )}
                        </div>
                        {isAdded ? (
                          <>
                            <p className="text-[10px] text-white/55 truncate mt-0.5">
                              <span style={{ color: cTheme.secondary }}>
                                {getShortGoalLabel(candidate.goal)}
                              </span>{' '}
                              · {getTodaySplitBadge(candidate)}
                            </p>
                            <p className="text-[10px] text-white/45 truncate font-mono-tabular">
                              {candidate.dailyLog.waterMl}ml · {candidate.dailyLog.steps.toLocaleString()} steps ·{' '}
                              {candidate.dailyLog.sleepHours.toFixed(1)}h sleep
                            </p>
                          </>
                        ) : (
                          <p className="text-[10px] text-white/50 truncate mt-0.5">
                            Add as a friend to view workout progress
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSquadMember(candidate.id);
                      }}
                      className="min-h-[38px] px-3 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                      style={
                        isAdded
                          ? {
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.8)',
                              border: '1px solid rgba(255,255,255,0.12)',
                            }
                          : {
                              background: theme.gradientCss,
                              color: '#FFFFFF',
                            }
                      }
                    >
                      {isAdded ? (
                        <>
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Remove</span>
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
              })
            )}
          </div>
        )}

        {/* Cloud Query Error Notice */}
        {cloudError && (
          <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-200 flex items-center justify-between gap-2">
            <span className="truncate">Cloud query issue: {cloudError}</span>
            <button
              type="button"
              onClick={loadLiveDirectory}
              className="text-[10px] font-semibold underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Registered Athletes Available to Add (auto-loaded from Supabase when search is empty) */}
        {!cleanQuery && loadingDiscover && discoverSuggestions.length === 0 && (
          <div className="pt-1 flex items-center gap-2 text-xs text-white/55">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading registered athletes...</span>
          </div>
        )}

        {!cleanQuery && discoverSuggestions.length > 0 && (
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-white/55">
                Registered Athletes ({discoverSuggestions.length})
              </p>
              <button
                type="button"
                onClick={loadLiveDirectory}
                className="text-[10px] font-semibold text-white/55 hover:text-white transition-colors"
              >
                Refresh Live
              </button>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-0.5">
              {discoverSuggestions.map((candidate) => {
                const cTheme = resolveTheme(candidate.gender);
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
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{candidate.name}</p>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap"
                            style={{ backgroundColor: cTheme.softBg, color: cTheme.secondary }}
                          >
                            {candidate.gender === 'female' ? 'Female' : 'Male'}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 truncate mt-0.5">
                          Add as a friend to view workout progress
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSquadMember(candidate.id);
                      }}
                      className="min-h-[36px] px-3 rounded-xl text-[11px] font-semibold text-white flex items-center gap-1 shrink-0 transition-all active:scale-95"
                      style={{ background: theme.gradientCss }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Friend</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Personal Squad Friends List */}
      {rankedSquad.length === 0 ? (
        <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-white">Your Squad List is Empty</p>
          <p className="text-xs text-white/60 leading-relaxed">
            Search athletes above by name or @username to add training partners to your personal
            Squad.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {rankedSquad.map((athlete) => {
            const athleteTheme = resolveTheme(athlete.gender);

            const waterTarget = calculateWaterTargetMl(athlete.metrics.weightKg);
            const waterPct = Math.min(100, Math.round((athlete.dailyLog.waterMl / waterTarget) * 100));

            const stepTarget = calculateStepTarget(athlete.goal);
            const stepsPct = Math.min(100, Math.round((athlete.dailyLog.steps / stepTarget) * 100));

            const sleepTarget = calculateSleepTargetHours(athlete.gender);
            const sleepPct = Math.min(100, Math.round((athlete.dailyLog.sleepHours / sleepTarget) * 100));

            return (
              <div
                key={athlete.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFriendId(athlete.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFriendId(athlete.id);
                  }
                }}
                className="w-full text-left bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 rounded-3xl p-4 shadow-lg space-y-3 transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* Row 1: Avatar, Name, Streak, Physique Goal Badge & Status */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <AthleteAvatar
                      name={athlete.name}
                      avatarUrl={athlete.avatarUrl}
                      gender={athlete.gender}
                      sizeClass="w-11 h-11"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white truncate">
                          {athlete.name}
                        </h2>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold font-mono-tabular text-white shrink-0">
                          <Flame className="w-3.5 h-3.5" style={{ color: athleteTheme.primary }} />
                          {athlete.streakDays}d
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap"
                          style={{
                            backgroundColor: athleteTheme.softBg,
                            color: athleteTheme.secondary,
                            border: `1px solid ${athleteTheme.borderAccent}`,
                          }}
                        >
                          {getShortGoalLabel(athlete.goal)}
                        </span>
                        <span className="text-[10px] text-white/45 truncate">
                          {athlete.username}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completion Status Badge */}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold whitespace-nowrap shrink-0"
                    style={
                      athlete.dailyLog.workoutCompleted
                        ? {
                            background: athleteTheme.gradientCss,
                            color: '#FFFFFF',
                            boxShadow: `0 0 12px ${athleteTheme.glow}`,
                          }
                        : {
                            backgroundColor: 'rgba(255,255,255,0.07)',
                            color: 'rgba(255,255,255,0.75)',
                          }
                    }
                  >
                    {athlete.dailyLog.workoutCompleted ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Crushed It</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" style={{ color: athleteTheme.secondary }} />
                        <span>In Progress</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Row 2: Current Training Split Day Badge */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#1A1D28]/90 border border-white/[0.06]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Dumbbell className="w-3.5 h-3.5 shrink-0" style={{ color: athleteTheme.secondary }} />
                    <span className="text-[11px] font-medium text-white/90 truncate">
                      {getTodaySplitBadge(athlete)}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                </div>

                {/* Row 3: Mini Progress Bars for Water, Steps, Sleep */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/55">Water</span>
                      <span className="font-mono-tabular font-semibold text-white/85">{waterPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${waterPct}%`, backgroundColor: athleteTheme.primary }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/55">Steps</span>
                      <span className="font-mono-tabular font-semibold text-white/85">{stepsPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${stepsPct}%`, backgroundColor: athleteTheme.secondary }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/55">Sleep</span>
                      <span className="font-mono-tabular font-semibold text-white/85">{sleepPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${sleepPct}%`, background: athleteTheme.gradientCss }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Hype & Tap Hint */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] text-white/50 font-mono-tabular">
                    {athlete.hypeReceived} hype · Tap card for full profile
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendHype(athlete.id);
                    }}
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-semibold text-white flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" style={{ color: athleteTheme.secondary }} />
                    <span>Send Hype</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Friend Athlete Profile & Progress Drawer / Modal */}
      <AnimatePresence>
        {inspectedFriend && (() => {
          const fTheme = resolveTheme(inspectedFriend.gender);
          const plannedTraining = inspectedFriend.weeklyHistory.filter((d) => !d.isRestDay);
          const completedTraining = plannedTraining.filter((d) => d.workoutCompleted).length;
          const consistencyRate =
            plannedTraining.length > 0
              ? Math.round((completedTraining / plannedTraining.length) * 100)
              : 100;

          const firstMeasure = inspectedFriend.bodyMeasurements[0];
          const latestMeasure =
            inspectedFriend.bodyMeasurements[inspectedFriend.bodyMeasurements.length - 1];
          const weightDelta =
            firstMeasure && latestMeasure
              ? Number((latestMeasure.weightKg - firstMeasure.weightKg).toFixed(1))
              : 0;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
              role="dialog"
              aria-modal="true"
              onClick={() => setSelectedFriendId(null)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[406px] bg-[#12141C] border border-white/12 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[86vh]"
              >
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AthleteAvatar
                      name={inspectedFriend.name}
                      avatarUrl={inspectedFriend.avatarUrl}
                      gender={inspectedFriend.gender}
                      sizeClass="w-12 h-12"
                    />
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-white truncate">
                        {inspectedFriend.name}
                      </h2>
                      <p className="text-xs text-white/60 truncate">
                        {inspectedFriend.username} ·{' '}
                        <span style={{ color: fTheme.secondary }}>
                          {inspectedFriend.goal}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFriendId(null)}
                    aria-label="Close athlete profile"
                    className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-5 overflow-y-auto space-y-5">
                  {/* KPI Row: Weekly Consistency, Streak, Weight & Goal Progress */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#1A1D28] border border-white/[0.08]">
                      <p className="text-[10px] text-white/55">Consistency</p>
                      <p
                        className="text-lg font-bold font-mono-tabular mt-0.5"
                        style={{ color: fTheme.secondary }}
                      >
                        {consistencyRate}%
                      </p>
                      <p className="text-[10px] text-white/45">
                        {completedTraining}/{plannedTraining.length} sessions
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#1A1D28] border border-white/[0.08]">
                      <p className="text-[10px] text-white/55">Current Streak</p>
                      <p className="text-lg font-bold font-mono-tabular text-white mt-0.5">
                        {inspectedFriend.streakDays}d
                      </p>
                      <p className="text-[10px] text-white/45">Active run</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#1A1D28] border border-white/[0.08]">
                      <p className="text-[10px] text-white/55">Weight Shift</p>
                      <p className="text-lg font-bold font-mono-tabular text-white mt-0.5">
                        {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
                      </p>
                      <p className="text-[10px] text-white/45">
                        Now {inspectedFriend.metrics.weightKg} kg
                      </p>
                    </div>
                  </div>

                  {/* Weight / Goal Progress Summary */}
                  <div className="p-4 rounded-2xl bg-[#1A1D28]/70 border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: fTheme.primary }} />
                      <h3 className="text-xs font-bold text-white">Physique & Goal Progress</h3>
                    </div>
                    <p className="text-xs text-white/75 leading-relaxed">
                      Training on <span className="text-white font-semibold">{inspectedFriend.goal}</span> at{' '}
                      <span className="font-mono-tabular text-white">
                        {inspectedFriend.metrics.weightKg} kg
                      </span>{' '}
                      ({inspectedFriend.metrics.heightCm} cm).{' '}
                      {weightDelta !== 0
                        ? `Logged ${weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg net shift across the last month.`
                        : 'Maintaining baseline body composition.'}
                    </p>
                  </div>

                  {/* Current 7-Day Training Split */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: fTheme.secondary }} />
                      <h3 className="text-xs font-bold text-white">Current 7-Day Training Split</h3>
                    </div>
                    <div className="space-y-1.5">
                      {inspectedFriend.split.map((day) => {
                        const isToday = day.dayIndex === todayIdx;
                        return (
                          <div
                            key={day.dayIndex}
                            className="px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs border"
                            style={
                              isToday
                                ? {
                                    backgroundColor: fTheme.softBg,
                                    borderColor: fTheme.borderAccent,
                                  }
                                : {
                                    backgroundColor: 'rgba(26, 29, 40, 0.55)',
                                    borderColor: 'rgba(255, 255, 255, 0.06)',
                                  }
                            }
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white mr-2">{day.dayLabel}</span>
                              <span className="text-white/80 truncate">
                                {day.title.replace(/^Day\s+\d+:\s*/i, '')}
                              </span>
                            </div>
                            {isToday && (
                              <span
                                className="text-[10px] font-bold whitespace-nowrap"
                                style={{ color: fTheme.secondary }}
                              >
                                Today
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Completed Workouts */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" style={{ color: fTheme.primary }} />
                      <h3 className="text-xs font-bold text-white">Recent Completed Workouts</h3>
                    </div>
                    {inspectedFriend.recentWorkouts.length === 0 ? (
                      <p className="text-xs text-white/50">No recent workouts logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {inspectedFriend.recentWorkouts.map((rw) => (
                          <div
                            key={rw.id}
                            className="p-3 rounded-2xl bg-[#1A1D28]/80 border border-white/[0.06] flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{rw.title}</p>
                              <p className="text-[11px] text-white/55">
                                {rw.dateLabel} · {rw.durationMin} min · {rw.setsCompleted} sets
                              </p>
                            </div>
                            <Check className="w-4 h-4 shrink-0" style={{ color: fTheme.secondary }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="px-5 py-4 border-t border-white/[0.08] flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSendHype(inspectedFriend.id);
                    }}
                    className="flex-1 min-h-[46px] rounded-2xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                    style={{
                      background: fTheme.gradientCss,
                      boxShadow: `0 6px 20px ${fTheme.glow}`,
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Send Hype</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleSquadMember(inspectedFriend.id);
                      setSelectedFriendId(null);
                    }}
                    className="min-h-[46px] px-4 rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-semibold text-white/75 hover:text-white flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
