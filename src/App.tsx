import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import type {
  PhysiqueGoal,
  ReminderSettings,
  TabKey,
  ToastMessage,
  UserProfile,
} from './types/kinetix';
import { supabase } from './lib/supabase';
import { db, getTodaySplitDayIndex } from './services/db';
import {
  checkSupabaseConnection,
  hydrateAuthenticatedUserFromSupabase,
  restoreSupabaseSession,
  signInWithSupabase,
  signOutFromSupabase,
  signUpWithSupabase,
  syncDailyLogToSupabase,
  syncProfileToSupabase,
  syncUserPlanToSupabase,
  type SupabaseConnectionStatus,
  type SupabaseWriteResult,
} from './services/supabaseSync';
import {
  applyThemeCssVars,
  calculateSleepTargetHours,
  resolveTheme,
} from './services/theme';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { WorkoutTab } from './components/WorkoutTab';
import { ProgressTab } from './components/ProgressTab';
import { SquadTab } from './components/SquadTab';
import { ProfileTab } from './components/ProfileTab';
import { CloudModal } from './components/CloudModal';
import { ToastOverlay } from './components/ToastOverlay';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => db.getUsers());
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'auth' | 'onboarding' | 'app'>('auth');
  const [onboardingPrefill, setOnboardingPrefill] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<number>(() =>
    getTodaySplitDayIndex()
  );
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [supabaseErrorBanner, setSupabaseErrorBanner] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus>({
    connected: true,
    label: 'Cloud Synced',
    detail: 'Supabase client active (https://jjiiqxflepnsaybotsdx.supabase.co).',
  });
  const manualAuthInFlightRef = useRef(false);

  // Never compute gender theme while auth is loading; wait for profile row
  const theme = resolveTheme(
    !isAuthLoading && viewMode === 'app' && activeUser ? activeUser.gender : null
  );

  useEffect(() => {
    applyThemeCssVars(theme);
  }, [theme]);

  // Boot session restoration & real-time Supabase onAuthStateChange listener
  useEffect(() => {
    let cancelled = false;

    const applyHydratedUser = (cloudUser: UserProfile) => {
      setUsers(db.getUsers());
      setActiveUser(cloudUser);
      setSelectedWorkoutDay(
        typeof cloudUser.currentSplitDay === 'number'
          ? cloudUser.currentSplitDay
          : getTodaySplitDayIndex()
      );
      setViewMode('app');
    };

    const verifyCloud = async () => {
      const status = await checkSupabaseConnection();
      if (cancelled) return;
      setConnectionStatus(status);
      if (status.diagnosticError) {
        setSupabaseErrorBanner(status.diagnosticError);
      }
    };
    void verifyCloud();

    restoreSupabaseSession()
      .then((res) => {
        if (cancelled) return;
        if (res.error) {
          setSupabaseErrorBanner(res.error);
        }
        if (res.user) {
          applyHydratedUser(res.user);
        } else {
          db.signOut();
          setActiveUser(null);
          setViewMode('auth');
        }
      })
      .finally(() => {
        if (!cancelled) setIsAuthLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (event === 'SIGNED_OUT') {
        db.signOut();
        setActiveUser(null);
        setViewMode('auth');
        setIsAuthLoading(false);
        return;
      }

      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
        session?.user &&
        !manualAuthInFlightRef.current
      ) {
        setIsAuthLoading(true);
        hydrateAuthenticatedUserFromSupabase(session.user)
          .then((res) => {
            if (cancelled) return;
            if (res.error) {
              setSupabaseErrorBanner(res.error);
            }
            if (res.user) {
              applyHydratedUser(res.user);
            }
          })
          .finally(() => {
            if (!cancelled) setIsAuthLoading(false);
          });
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const cleanInjected = () => {
      document
        .querySelectorAll(
          'iframe[src*="netlify" i], [class*="netlify" i], [id*="netlify" i], [data-netlify], a[href*="netlify.com"]'
        )
        .forEach((el) => {
          if (el.id !== 'root') el.remove();
        });
      document.querySelectorAll('div, aside, footer, section, a, span').forEach((el) => {
        if (el.id === 'root' || (el.closest('#root') && el.children.length > 3)) return;
        const txt = (el.textContent ?? '').trim();
        if (/powered\s+by\s+netlify/i.test(txt) && txt.length < 120) {
          const target = el.closest('[style*="fixed"], [style*="sticky"], footer, aside') ?? el;
          if (target.id !== 'root') target.remove();
        }
      });
    };

    cleanInjected();
    const observer = new MutationObserver(() => cleanInjected());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const pushToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [{ ...toast, id }, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const syncUsers = (updatedActive: UserProfile | null) => {
    setUsers(db.getUsers());
    setActiveUser(updatedActive);
  };

  const trackWriteResult = (res: SupabaseWriteResult, contextLabel: string) => {
    if (res.ok) {
      setSupabaseErrorBanner(null);
      setConnectionStatus({
        connected: true,
        label: 'Cloud Synced',
        detail: `Last synced ${contextLabel} at ${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}.`,
      });
    } else if (res.error) {
      setSupabaseErrorBanner(res.error);
      setConnectionStatus({
        connected: true,
        label: 'Cloud Synced',
        detail: res.error,
        diagnosticError: res.error,
      });
      pushToast({
        title: 'Supabase Sync Error',
        body: res.error,
        category: 'alert',
      });
    }
  };

  const handleEmailSignIn = async (
    email: string,
    password: string
  ): Promise<string | undefined> => {
    manualAuthInFlightRef.current = true;
    setIsAuthLoading(true);
    setSupabaseErrorBanner(null);
    try {
      const res = await signInWithSupabase(email, password);
      if (res.error && !res.user) {
        setSupabaseErrorBanner(res.error);
        return res.error;
      }
      if (!res.user) {
        return 'Supabase Error: Unable to sign in.';
      }
      if (res.error) {
        setSupabaseErrorBanner(res.error);
      }
      syncUsers(res.user);
      setSelectedWorkoutDay(
        typeof res.user.currentSplitDay === 'number'
          ? res.user.currentSplitDay
          : getTodaySplitDayIndex()
      );
      setActiveTab('home');
      setViewMode('app');
      void checkSupabaseConnection().then((status) => {
        setConnectionStatus(status);
        if (status.diagnosticError) setSupabaseErrorBanner(status.diagnosticError);
      });
      return undefined;
    } finally {
      manualAuthInFlightRef.current = false;
      setIsAuthLoading(false);
    }
  };

  const handleStartOnboarding = (prefill?: { email?: string; password?: string }) => {
    setOnboardingPrefill(prefill ?? {});
    setViewMode('onboarding');
  };

  const handleOnboardingComplete = async (data: {
    name: string;
    email: string;
    password: string;
    gender: UserProfile['gender'];
    goal: PhysiqueGoal;
    metrics: UserProfile['metrics'];
    schedule: UserProfile['schedule'];
    split: UserProfile['split'];
    quotes: string[];
    blueprintSource: 'gemini-2.5-flash' | 'kinetix-engine';
  }): Promise<string | undefined> => {
    manualAuthInFlightRef.current = true;
    setSupabaseErrorBanner(null);
    try {
      const res = await signUpWithSupabase(data);
      if (res.error && !res.user) {
        setSupabaseErrorBanner(res.error);
        return res.error;
      }
      if (!res.user) {
        return 'Supabase Error: Unable to create athlete account.';
      }
      if (res.error) {
        setSupabaseErrorBanner(res.error);
      }
      const created = res.user;
      syncUsers(created);
      setSelectedWorkoutDay(getTodaySplitDayIndex());
      setActiveTab('home');
      setViewMode('app');
      void checkSupabaseConnection().then((status) => {
        setConnectionStatus(status);
        if (status.diagnosticError) setSupabaseErrorBanner(status.diagnosticError);
      });
      pushToast({
        title: 'Custom Blueprint Ready',
        body: res.notice
          ? `${created.name.split(/\s+/)[0]}, ${res.notice}`
          : `${created.name.split(/\s+/)[0]}, your 7-day ${created.goal} routine is active.`,
        category: 'success',
      });
      return undefined;
    } finally {
      manualAuthInFlightRef.current = false;
    }
  };

  const handleSignOut = () => {
    void signOutFromSupabase();
    setActiveUser(null);
    setViewMode('auth');
  };

  const handleTestReminder = async (kind: 'workout' | 'hydration' | 'bedtime') => {
    if (!activeUser) return;
    const first = activeUser.name.trim().split(/\s+/)[0] || activeUser.name;
    const sleepTarget = calculateSleepTargetHours(activeUser.gender);
    const todaySplit = activeUser.split[getTodaySplitDayIndex()] ?? activeUser.split[0];

    let title = '';
    let body = '';

    if (kind === 'workout') {
      title = `KINETIX · ${activeUser.schedule.workoutTime} Session Alert`;
      body = `${first}, it's time for ${todaySplit.title}. ${activeUser.quotes[0] ?? ''}`;
    } else if (kind === 'hydration') {
      title = 'KINETIX · Hydration & Step Ping';
      body = `Drink 300ml water and take 1,000 steps right now, ${first}.`;
    } else {
      title = 'KINETIX · Bedtime Wind-Down';
      body = `Recovery builds the physique, ${first}. ${sleepTarget.toFixed(1)} hours starts soon.`;
    }

    pushToast({ title, body, category: 'alert' });

    const updated = db.updateUser(activeUser.id, (u) => ({
      ...u,
      notifications: [
        {
          id: `n-test-${Date.now()}`,
          title,
          body,
          timestamp: 'Just now',
          read: false,
          category: kind === 'bedtime' ? 'sleep' : kind === 'hydration' ? 'hydration' : 'workout',
        },
        ...u.notifications.slice(0, 14),
      ],
    }));
    syncUsers(updated);
    if (updated) {
      const writeRes = await syncProfileToSupabase(updated);
      trackWriteResult(writeRes, 'profile');
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        }
      } catch {
        // Toast preview already shown above
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="max-w-[430px] mx-auto min-h-screen bg-[#090A0F] text-white relative overflow-x-hidden shadow-2xl border-x border-white/5">
        {supabaseErrorBanner && (
          <div
            role="alert"
            className="sticky top-0 z-50 px-3 py-2.5 bg-rose-950/95 border-b border-rose-500/50 text-xs text-rose-100 flex items-start justify-between gap-2 backdrop-blur-md"
          >
            <div className="flex items-start gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug break-words">{supabaseErrorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSupabaseErrorBanner(null)}
              aria-label="Dismiss Supabase error banner"
              className="text-rose-200/70 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <ToastOverlay
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
          theme={theme}
        />

        {isAuthLoading ? (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/15 bg-[#12141C]"
              style={{ boxShadow: `0 0 28px ${theme.glow}` }}
            >
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.primary }} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Syncing Athlete Profile</p>
              <p className="text-xs text-white/55">
                Loading your routine, theme &amp; 30-day progress logs...
              </p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'auth' && (
              <AuthScreen
                onEmailSignIn={handleEmailSignIn}
                onStartOnboarding={handleStartOnboarding}
                onOpenCloudModal={() => setCloudModalOpen(true)}
              />
            )}

            {viewMode === 'onboarding' && (
              <OnboardingWizard
                initialEmail={onboardingPrefill.email}
                initialPassword={onboardingPrefill.password}
                onCancel={() => setViewMode(activeUser ? 'app' : 'auth')}
                onComplete={handleOnboardingComplete}
              />
            )}

            {viewMode === 'app' && activeUser && (
          <>
            <TopBar
              activeUser={activeUser}
              theme={theme}
              connectionStatus={connectionStatus}
              onMarkNotificationsRead={async () => {
                const updated = db.markNotificationsRead(activeUser.id);
                syncUsers(updated);
                if (updated) {
                  const res = await syncProfileToSupabase(updated);
                  trackWriteResult(res, 'notifications');
                }
              }}
            />

            <main>
              {activeTab === 'home' && (
                <DashboardTab
                  user={activeUser}
                  theme={theme}
                  onUpdateWater={async (delta, reset) => {
                    const updated = db.updateWater(activeUser.id, delta, reset);
                    syncUsers(updated);
                    if (updated) {
                      const res = await syncDailyLogToSupabase(updated);
                      trackWriteResult(res, 'water intake');
                    }
                  }}
                  onUpdateSteps={async (delta) => {
                    const updated = db.updateSteps(activeUser.id, delta);
                    syncUsers(updated);
                    if (updated) {
                      const res = await syncDailyLogToSupabase(updated);
                      trackWriteResult(res, 'steps');
                    }
                  }}
                  onUpdateSleep={async (delta) => {
                    const updated = db.updateSleep(activeUser.id, delta);
                    syncUsers(updated);
                    if (updated) {
                      const res = await syncDailyLogToSupabase(updated);
                      trackWriteResult(res, 'sleep hours');
                    }
                  }}
                  onStartSession={async (dayIdx) => {
                    setSelectedWorkoutDay(dayIdx);
                    const updated = db.updateUser(activeUser.id, (u) => ({
                      ...u,
                      currentSplitDay: dayIdx,
                    }));
                    syncUsers(updated);
                    setActiveTab('workout');
                    if (updated) {
                      const res = await syncProfileToSupabase(updated);
                      trackWriteResult(res, 'split selection');
                    }
                  }}
                />
              )}

              {activeTab === 'workout' && (
                <WorkoutTab
                  user={activeUser}
                  theme={theme}
                  selectedDayIndex={selectedWorkoutDay}
                  onSelectDay={async (dayIdx) => {
                    setSelectedWorkoutDay(dayIdx);
                    const updated = db.updateUser(activeUser.id, (u) => ({
                      ...u,
                      currentSplitDay: dayIdx,
                    }));
                    syncUsers(updated);
                    if (updated) {
                      const res = await syncProfileToSupabase(updated);
                      trackWriteResult(res, 'split selection');
                    }
                  }}
                  onToggleWarmupDrill={async (dayIdx, drillId) => {
                    const updated = db.toggleWarmupDrill(activeUser.id, dayIdx, drillId);
                    syncUsers(updated);
                    if (updated) {
                      const [planRes, logRes] = await Promise.all([
                        syncUserPlanToSupabase(updated),
                        syncDailyLogToSupabase(updated, dayIdx),
                      ]);
                      trackWriteResult(planRes.ok ? logRes : planRes, 'warmup checklist');
                    }
                  }}
                  onUpdateSet={async (dayIdx, exId, setId, patch) => {
                    const updated = db.updateExerciseSet(
                      activeUser.id,
                      dayIdx,
                      exId,
                      setId,
                      patch
                    );
                    syncUsers(updated);
                    if (updated) {
                      const [planRes, logRes] = await Promise.all([
                        syncUserPlanToSupabase(updated),
                        syncDailyLogToSupabase(updated, dayIdx),
                      ]);
                      trackWriteResult(planRes.ok ? logRes : planRes, 'exercise set');
                    }
                  }}
                  onFinishWorkout={async (dayIdx) => {
                    const updated = db.completeWorkoutDay(activeUser.id, dayIdx);
                    syncUsers(updated);
                    if (updated) {
                      const [logRes, planRes, profRes] = await Promise.all([
                        syncDailyLogToSupabase(updated, dayIdx),
                        syncUserPlanToSupabase(updated),
                        syncProfileToSupabase(updated),
                      ]);
                      const failed = [logRes, planRes, profRes].find((r) => !r.ok);
                      trackWriteResult(failed ?? logRes, 'workout completion');
                    }
                  }}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressTab
                  user={activeUser}
                  theme={theme}
                  onLogMeasurements={async (entry) => {
                    const updated = db.logBodyMeasurement(activeUser.id, entry);
                    syncUsers(updated);
                    pushToast({
                      title: 'Measurements Logged',
                      body: `Updated body weight to ${entry.weightKg} kg and synced physique graph.`,
                      category: 'success',
                    });
                    if (updated) {
                      const [profRes, logRes] = await Promise.all([
                        syncProfileToSupabase(updated),
                        syncDailyLogToSupabase(updated),
                      ]);
                      trackWriteResult(profRes.ok ? logRes : profRes, 'body measurements');
                    }
                  }}
                />
              )}

              {activeTab === 'squad' && (
                <SquadTab
                  activeUser={activeUser}
                  allUsers={users}
                  theme={theme}
                  onSupabaseError={(err) => setSupabaseErrorBanner(err)}
                  onSyncRemoteUsers={(remoteUsers) => {
                    const merged = db.mergeRemoteUsers(remoteUsers);
                    setUsers(merged);
                  }}
                  onToggleSquadMember={async (friendId) => {
                    const res = db.toggleSquadMember(activeUser.id, friendId);
                    syncUsers(res.user);
                    pushToast({
                      title: res.added ? 'Added to Squad' : 'Removed from Squad',
                      body: res.added
                        ? `${res.friendName} is now in your personal Squad circle.`
                        : `${res.friendName} was removed from your Squad list.`,
                      category: 'info',
                    });
                    if (res.user) {
                      const writeRes = await syncProfileToSupabase(res.user);
                      trackWriteResult(writeRes, 'squad circle');
                    }
                  }}
                  onSendHype={(targetId) => {
                    const res = db.sendHype(activeUser.id, targetId);
                    setUsers(res.users);
                    const refreshedActive =
                      res.users.find((u) => u.id === activeUser.id) ?? activeUser;
                    setActiveUser(refreshedActive);
                    pushToast({
                      title: 'Hype Surge Delivered',
                      body: `You sent an energy boost to ${res.targetName}.`,
                      category: 'hype',
                    });
                  }}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  key={activeUser.id}
                  user={activeUser}
                  theme={theme}
                  onUpdateProfileAndPlan={async (patch) => {
                    const updated = db.updateUser(activeUser.id, (u) => ({
                      ...u,
                      gender: u.gender,
                      metrics: patch.metrics,
                      goal: patch.goal,
                      schedule: patch.schedule,
                      split: patch.split,
                      quotes: patch.quotes,
                      blueprintSource: patch.blueprintSource,
                      planVersion: patch.planVersion,
                    }));
                    syncUsers(updated);
                    if (updated) {
                      const [profRes, planRes] = await Promise.all([
                        syncProfileToSupabase(updated),
                        syncUserPlanToSupabase(updated),
                      ]);
                      trackWriteResult(profRes.ok ? planRes : profRes, 'routine blueprint');
                    }
                    pushToast({
                      title: 'Custom Blueprint Updated',
                      body: `New split active (${patch.goal}): ${patch.split[0]?.title ?? 'Day 1'}`,
                      category: 'success',
                    });
                  }}
                  onUpdateReminders={async (reminders: ReminderSettings) => {
                    const updated = db.updateReminders(activeUser.id, reminders);
                    syncUsers(updated);
                    if (updated) {
                      const writeRes = await syncProfileToSupabase(updated);
                      trackWriteResult(writeRes, 'reminder preferences');
                    }
                  }}
                  onTestReminder={handleTestReminder}
                  onOpenCloudModal={() => setCloudModalOpen(true)}
                  onSignOut={handleSignOut}
                  onResetDemoData={() => {
                    const reset = db.resetDemoData();
                    setUsers(reset.users);
                    setActiveUser(null);
                    setViewMode('auth');
                    pushToast({
                      title: 'Demo Profiles Restored',
                      body: 'All squad profiles and logs reset to clean baseline.',
                      category: 'info',
                    });
                  }}
                />
              )}
            </main>

            <BottomNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              theme={theme}
            />
          </>
        )}
          </>
        )}

        <CloudModal
          isOpen={cloudModalOpen}
          onClose={() => setCloudModalOpen(false)}
          theme={theme}
        />
      </div>
    </div>
  );
}
