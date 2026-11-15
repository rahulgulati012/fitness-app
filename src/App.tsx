import { useEffect, useState } from 'react';
import type {
  PhysiqueGoal,
  ReminderSettings,
  TabKey,
  ToastMessage,
  UserProfile,
} from './types/kinetix';
import { db, getTodaySplitDayIndex } from './services/db';
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
  const [activeUser, setActiveUser] = useState<UserProfile | null>(() => db.getActiveUser());
  const [viewMode, setViewMode] = useState<'auth' | 'onboarding' | 'app'>(() =>
    db.getActiveUser() ? 'app' : 'auth'
  );
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

  const theme = resolveTheme(
    viewMode === 'app' && activeUser ? activeUser.gender : null
  );

  useEffect(() => {
    applyThemeCssVars(theme);
  }, [theme]);

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

  const handleQuickSwitch = (userId: string) => {
    const switched = db.switchUser(userId);
    if (!switched) return;
    syncUsers(switched);
    setSelectedWorkoutDay(getTodaySplitDayIndex());
    setActiveTab('home');
    setViewMode('app');
  };

  const handleEmailSignIn = (email: string, password: string): string | undefined => {
    const res = db.signInWithEmail(email, password);
    if (res.error || !res.user) {
      return res.error ?? 'Unable to sign in.';
    }
    syncUsers(res.user);
    setSelectedWorkoutDay(getTodaySplitDayIndex());
    setActiveTab('home');
    setViewMode('app');
    return undefined;
  };

  const handleStartOnboarding = (prefill?: { email?: string; password?: string }) => {
    setOnboardingPrefill(prefill ?? {});
    setViewMode('onboarding');
  };

  const handleOnboardingComplete = (data: {
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
  }) => {
    const created = db.createUserProfile(data);
    syncUsers(created);
    setSelectedWorkoutDay(getTodaySplitDayIndex());
    setActiveTab('home');
    setViewMode('app');
    pushToast({
      title: 'Custom Blueprint Ready',
      body: `${created.name.split(/\s+/)[0]}, your 7-day ${created.goal} routine is active.`,
      category: 'success',
    });
  };

  const handleSignOut = () => {
    db.signOut();
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
        <ToastOverlay
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
          theme={theme}
        />

        {viewMode === 'auth' && (
          <AuthScreen
            users={users}
            onQuickSwitch={handleQuickSwitch}
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
              allUsers={users}
              theme={theme}
              onSwitchUser={handleQuickSwitch}
              onAddNewAthlete={() => handleStartOnboarding()}
              onSignOut={handleSignOut}
              onMarkNotificationsRead={() => {
                const updated = db.markNotificationsRead(activeUser.id);
                syncUsers(updated);
              }}
            />

            <main>
              {activeTab === 'home' && (
                <DashboardTab
                  user={activeUser}
                  theme={theme}
                  onUpdateWater={(delta, reset) => {
                    const updated = db.updateWater(activeUser.id, delta, reset);
                    syncUsers(updated);
                  }}
                  onUpdateSteps={(delta) => {
                    const updated = db.updateSteps(activeUser.id, delta);
                    syncUsers(updated);
                  }}
                  onUpdateSleep={(delta) => {
                    const updated = db.updateSleep(activeUser.id, delta);
                    syncUsers(updated);
                  }}
                  onStartSession={(dayIdx) => {
                    setSelectedWorkoutDay(dayIdx);
                    setActiveTab('workout');
                  }}
                />
              )}

              {activeTab === 'workout' && (
                <WorkoutTab
                  user={activeUser}
                  theme={theme}
                  selectedDayIndex={selectedWorkoutDay}
                  onSelectDay={setSelectedWorkoutDay}
                  onToggleWarmupDrill={(dayIdx, drillId) => {
                    const updated = db.toggleWarmupDrill(activeUser.id, dayIdx, drillId);
                    syncUsers(updated);
                  }}
                  onUpdateSet={(dayIdx, exId, setId, patch) => {
                    const updated = db.updateExerciseSet(
                      activeUser.id,
                      dayIdx,
                      exId,
                      setId,
                      patch
                    );
                    syncUsers(updated);
                  }}
                  onFinishWorkout={(dayIdx) => {
                    const updated = db.completeWorkoutDay(activeUser.id, dayIdx);
                    syncUsers(updated);
                  }}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressTab
                  user={activeUser}
                  theme={theme}
                  onLogMeasurements={(entry) => {
                    const updated = db.logBodyMeasurement(activeUser.id, entry);
                    syncUsers(updated);
                    pushToast({
                      title: 'Measurements Logged',
                      body: `Updated body weight to ${entry.weightKg} kg and synced physique graph.`,
                      category: 'success',
                    });
                  }}
                />
              )}

              {activeTab === 'squad' && (
                <SquadTab
                  activeUser={activeUser}
                  allUsers={users}
                  theme={theme}
                  onToggleSquadMember={(friendId) => {
                    const res = db.toggleSquadMember(activeUser.id, friendId);
                    syncUsers(res.user);
                    pushToast({
                      title: res.added ? 'Added to Squad' : 'Removed from Squad',
                      body: res.added
                        ? `${res.friendName} is now in your personal Squad circle.`
                        : `${res.friendName} was removed from your Squad list.`,
                      category: 'info',
                    });
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
                  onUpdateProfileAndPlan={(patch) => {
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
                    pushToast({
                      title: 'Custom Blueprint Updated',
                      body: `New split active (${patch.goal}): ${patch.split[0]?.title ?? 'Day 1'}`,
                      category: 'success',
                    });
                  }}
                  onUpdateReminders={(reminders: ReminderSettings) => {
                    const updated = db.updateReminders(activeUser.id, reminders);
                    syncUsers(updated);
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

        <CloudModal
          isOpen={cloudModalOpen}
          onClose={() => setCloudModalOpen(false)}
          theme={theme}
        />
      </div>
    </div>
  );
}
