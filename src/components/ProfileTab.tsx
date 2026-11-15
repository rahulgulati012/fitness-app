import { useState } from 'react';
import {
  Bell,
  Database,
  LogOut,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
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
} from '../services/theme';
import { FEMALE_GOALS, MALE_GOALS } from '../services/db';
import { generateAthleteBlueprint } from '../services/blueprintFallback';
import { AthleteAvatar } from './AthleteAvatar';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileTabProps {
  user: UserProfile;
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
  }) => void;
  onUpdateReminders: (reminders: ReminderSettings) => void;
  onTestReminder: (kind: 'workout' | 'hydration' | 'bedtime') => void;
  onOpenCloudModal: () => void;
  onSignOut: () => void;
  onResetDemoData: () => void;
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
  theme,
  onUpdateProfileAndPlan,
  onUpdateReminders,
  onTestReminder,
  onOpenCloudModal,
  onSignOut,
  onResetDemoData,
}: ProfileTabProps) {
  const [gender, setGender] = useState<Gender>(user.gender);
  const [weightKg, setWeightKg] = useState(user.metrics.weightKg);
  const [heightCm, setHeightCm] = useState(user.metrics.heightCm);
  const [age, setAge] = useState(user.metrics.age);
  const [goal, setGoal] = useState<PhysiqueGoal>(user.goal);
  const [workoutTime, setWorkoutTime] = useState(user.schedule.workoutTime);
  const [bedTime, setBedTime] = useState(user.schedule.bedTime);
  const [regenerating, setRegenerating] = useState(false);

  const goalOptions = gender === 'female' ? FEMALE_GOALS : MALE_GOALS;
  const bmi = calculateBmi(heightCm, weightKg);
  const waterTarget = calculateWaterTargetMl(weightKg);
  const sleepTarget = calculateSleepTargetHours(gender);

  const handleGenderSwitch = (nextGender: Gender) => {
    setGender(nextGender);
    const matchingGoals = nextGender === 'female' ? FEMALE_GOALS : MALE_GOALS;
    if (!matchingGoals.some((g) => g.title === goal)) {
      setGoal(matchingGoals[0].title);
    }
  };

  const handleSaveAndRegenerate = async () => {
    setRegenerating(true);
    const nextPlanVersion = (user.planVersion ?? 0) + 1;
    const nextMetrics = { heightCm, weightKg, age };
    const nextSchedule = { ...user.schedule, workoutTime, bedTime };

    const result = await generateAthleteBlueprint({
      name: user.name,
      gender,
      goal,
      metrics: nextMetrics,
      schedule: nextSchedule,
      variationSeed: nextPlanVersion,
      previousSplit: user.split,
    });

    setRegenerating(false);
    onUpdateProfileAndPlan({
      gender,
      metrics: nextMetrics,
      goal,
      schedule: nextSchedule,
      split: result.split,
      quotes: result.quotes,
      blueprintSource: result.source,
      planVersion: nextPlanVersion,
    });
  };

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
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

      {/* Body Metrics & Goal Editor */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: theme.primary }} />
            <h2 className="text-sm font-bold text-white">Personalize Routine</h2>
          </div>
          <span className="text-[10px] text-white/50 font-mono-tabular">
            Plan v{user.planVersion ?? 1}
          </span>
        </div>

        {/* Physiological Gender Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#090A0F] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => handleGenderSwitch('female')}
            className={`min-h-[38px] rounded-xl text-xs font-semibold transition-all ${
              gender === 'female'
                ? 'bg-[#1A1D28] text-white border border-rose-500/40'
                : 'text-white/55 hover:text-white'
            }`}
          >
            Female Splits
          </button>
          <button
            type="button"
            onClick={() => handleGenderSwitch('male')}
            className={`min-h-[38px] rounded-xl text-xs font-semibold transition-all ${
              gender === 'male'
                ? 'bg-[#1A1D28] text-white border border-orange-500/40'
                : 'text-white/55 hover:text-white'
            }`}
          >
            Male Splits
          </button>
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

        <button
          type="button"
          disabled={regenerating}
          onClick={handleSaveAndRegenerate}
          className="w-full min-h-[46px] rounded-2xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-65"
          style={{
            background: theme.gradientCss,
            boxShadow: `0 6px 20px ${theme.glow}`,
          }}
        >
          {regenerating ? (
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

      {/* PWA Install + Cloud Export + Account Controls */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-2.5">
        <PWAInstallButton theme={theme} />

        <button
          type="button"
          onClick={onOpenCloudModal}
          className="w-full min-h-[46px] rounded-2xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
        >
          <Database className="w-4 h-4" style={{ color: theme.secondary }} />
          <span>Cloud &amp; Supabase SQL Drawer</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onSignOut}
            className="min-h-[44px] rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch / Exit</span>
          </button>
          <button
            type="button"
            onClick={onResetDemoData}
            className="min-h-[44px] rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-semibold text-white/65 hover:text-white flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </section>
    </div>
  );
}
