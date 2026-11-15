import { useState } from 'react';
import {
  ArrowRight,
  Droplets,
  Flame,
  Footprints,
  Moon,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import type { ThemeTokens, UserProfile } from '../types/kinetix';
import {
  calculateSleepTargetHours,
  calculateStepTarget,
  calculateWaterTargetMl,
} from '../services/theme';
import { getTodaySplitDayIndex } from '../services/db';

interface DashboardTabProps {
  user: UserProfile;
  theme: ThemeTokens;
  onUpdateWater: (deltaMl: number, reset?: boolean) => void;
  onUpdateSteps: (deltaSteps: number) => void;
  onUpdateSleep: (deltaHours: number) => void;
  onStartSession: (dayIndex: number) => void;
}

function CircularRing({
  percent,
  size = 82,
  strokeWidth = 7,
  primaryColor,
  secondaryColor,
  label,
  subLabel,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  primaryColor: string;
  secondaryColor: string;
  label: string;
  subLabel?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const gradId = `ring-${label.replace(/[^a-zA-Z0-9]/g, '')}-${size}`;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold font-mono-tabular text-white leading-none">{label}</span>
        {subLabel && (
          <span className="text-[10px] text-white/55 font-medium mt-0.5 leading-none">{subLabel}</span>
        )}
      </div>
    </div>
  );
}

export function DashboardTab({
  user,
  theme,
  onUpdateWater,
  onUpdateSteps,
  onUpdateSleep,
  onStartSession,
}: DashboardTabProps) {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const quotes = user.quotes.length > 0 ? user.quotes : [`Own today's standard, ${user.name}.`];
  const activeQuote = quotes[quoteIdx % quotes.length];

  const todayIdx = getTodaySplitDayIndex();
  const todayWorkout = user.split[todayIdx] ?? user.split[0];
  const warmupDoneCount = todayWorkout.warmupDrills.filter((d) => d.completed).length;
  const warmupTotal = todayWorkout.warmupDrills.length;
  const warmupPrimed = warmupTotal > 0 && warmupDoneCount === warmupTotal;

  const waterTarget = calculateWaterTargetMl(user.metrics.weightKg);
  const waterPct = Math.round((user.dailyLog.waterMl / waterTarget) * 100);

  const stepTarget = calculateStepTarget(user.goal);
  const stepPct = Math.round((user.dailyLog.steps / stepTarget) * 100);
  const stepCalories = Math.round(user.dailyLog.steps * 0.042);

  const sleepTarget = calculateSleepTargetHours(user.gender);
  const sleepPct = Math.round((user.dailyLog.sleepHours / sleepTarget) * 100);

  // Readiness weighted from sleep (55%), hydration (25%), and steps (20%)
  const readiness = Math.min(
    99,
    Math.max(
      52,
      Math.round(
        Math.min(100, sleepPct) * 0.55 +
          Math.min(100, waterPct) * 0.25 +
          Math.min(100, stepPct) * 0.2
      )
    )
  );
  const readinessLabel = readiness >= 85 ? 'Optimal' : readiness >= 70 ? 'Primed' : 'Recovering';

  return (
    <div className="px-4 pt-4 pb-36 space-y-4">
      {/* 1. Hero Quote Card (Gradient-bordered glass card) */}
      <section
        className="p-[1px] rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}66 0%, ${theme.secondary}44 50%, rgba(255,255,255,0.08) 100%)`,
          boxShadow: `0 10px 30px ${theme.glow}`,
        }}
      >
        <div className="bg-[#12141C]/95 backdrop-blur-xl rounded-[23px] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-white/60">
              {user.schedule.vibe}
            </span>
            <button
              type="button"
              onClick={() => setQuoteIdx((i) => (i + 1) % quotes.length)}
              className="min-h-[34px] px-3 rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-[11px] font-semibold text-white/85 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Next Quote</span>
              <RefreshCw className="w-3 h-3" style={{ color: theme.secondary }} />
            </button>
          </div>
          <p className="text-base font-medium leading-relaxed text-white">
            &ldquo;{activeQuote}&rdquo;
          </p>
        </div>
      </section>

      {/* 2. Today's Training Preview Card */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>{todayWorkout.dayLabel} Protocol</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">{todayWorkout.durationMin} min</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {todayWorkout.title}
            </h2>
            <p className="text-xs text-white/65">
              Focus: {todayWorkout.targetMuscle}
            </p>
          </div>

          <span
            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0"
            style={{
              backgroundColor: theme.softBg,
              color: warmupPrimed || user.dailyLog.workoutCompleted ? '#FFFFFF' : theme.secondary,
              border: `1px solid ${theme.borderAccent}`,
            }}
          >
            {user.dailyLog.workoutCompleted
              ? 'Session Complete'
              : warmupPrimed
                ? 'Warm-Up Primed'
                : `Warm-Up ${warmupDoneCount}/${warmupTotal}`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onStartSession(todayWorkout.dayIndex)}
          className="w-full min-h-[48px] rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          style={{
            background: theme.gradientCss,
            boxShadow: `0 8px 24px ${theme.glow}`,
          }}
        >
          <span>{user.dailyLog.workoutCompleted ? 'Review Session' : 'Start Session'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 3. Daily Bio-Recovery Bento Grid */}
      <div className="space-y-3">
        {/* Hydration Card (Full-width Bento) */}
        <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4" style={{ color: theme.primary }} />
                <h3 className="text-sm font-semibold text-white">Daily Hydration</h3>
              </div>
              <p className="text-xl font-bold font-mono-tabular text-white">
                {user.dailyLog.waterMl.toLocaleString()}{' '}
                <span className="text-xs font-normal text-white/55">
                  / {waterTarget.toLocaleString()} ml
                </span>
              </p>
              <p className="text-[11px] text-white/55">
                {user.metrics.weightKg} kg × 35 ml + 500 ml training bonus
              </p>
            </div>

            <CircularRing
              percent={waterPct}
              size={84}
              strokeWidth={7}
              primaryColor={theme.primary}
              secondaryColor={theme.secondary}
              label={`${Math.min(100, waterPct)}%`}
              subLabel="Hydrated"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateWater(250)}
              className="flex-1 min-h-[44px] rounded-2xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-semibold text-white transition-colors active:scale-[0.97]"
            >
              +250ml Glass
            </button>
            <button
              type="button"
              onClick={() => onUpdateWater(500)}
              className="flex-1 min-h-[44px] rounded-2xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-semibold text-white transition-colors active:scale-[0.97]"
            >
              +500ml Bottle
            </button>
            <button
              type="button"
              onClick={() => onUpdateWater(0, true)}
              aria-label="Reset hydration"
              className="min-w-[44px] min-h-[44px] rounded-2xl bg-[#1A1D28] border border-white/10 hover:border-white/25 flex items-center justify-center text-white/65 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Bottom 2-Column Bento: Steps + Sleep & Recovery */}
        <div className="grid grid-cols-2 gap-3">
          {/* Step Counter Card */}
          <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4" style={{ color: theme.secondary }} />
                <h3 className="text-xs font-semibold text-white">Daily Steps</h3>
              </div>
              <span className="text-[11px] font-mono-tabular text-white/55">
                {stepCalories} kcal
              </span>
            </div>

            <div className="flex items-center justify-center py-1">
              <CircularRing
                percent={stepPct}
                size={80}
                strokeWidth={6.5}
                primaryColor={theme.secondary}
                secondaryColor={theme.primary}
                label={user.dailyLog.steps.toLocaleString()}
                subLabel={`/ ${(stepTarget / 1000).toFixed(1)}k`}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateSteps(1000)}
                className="min-h-[40px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-[11px] font-semibold font-mono-tabular text-white active:scale-[0.97]"
              >
                +1,000
              </button>
              <button
                type="button"
                onClick={() => onUpdateSteps(2500)}
                className="min-h-[40px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-[11px] font-semibold font-mono-tabular text-white active:scale-[0.97]"
              >
                +2,500
              </button>
            </div>
          </section>

          {/* Sleep & Recovery Card */}
          <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <Moon className="w-4 h-4" style={{ color: theme.primary }} />
                <h3 className="text-xs font-semibold text-white">Recovery</h3>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap"
                style={{ backgroundColor: theme.softBg, color: theme.secondary }}
              >
                {readiness}% {readinessLabel}
              </span>
            </div>

            <div className="text-center py-2 space-y-0.5">
              <p className="text-2xl font-bold font-mono-tabular text-white">
                {user.dailyLog.sleepHours.toFixed(1)}
                <span className="text-xs font-normal text-white/60 ml-1">hrs</span>
              </p>
              <p className="text-[11px] text-white/55 leading-tight">
                Target: {sleepTarget.toFixed(1)}h{' '}
                {user.gender === 'female' ? 'Hormonal' : 'CNS'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateSleep(-0.5)}
                className="min-h-[40px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-[11px] font-semibold font-mono-tabular text-white/85 active:scale-[0.97]"
              >
                - 0.5h
              </button>
              <button
                type="button"
                onClick={() => onUpdateSleep(0.5)}
                className="min-h-[40px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-[11px] font-semibold font-mono-tabular text-white active:scale-[0.97]"
              >
                + 0.5h
              </button>
            </div>
          </section>
        </div>

        {/* Recovery Readiness Strip */}
        <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4" style={{ color: theme.secondary }} />
            <span className="text-xs font-medium text-white/80">
              {user.gender === 'female'
                ? 'Hormonal Recovery Readiness'
                : 'CNS Recovery Readiness'}
            </span>
          </div>
          <span
            className="text-xs font-bold font-mono-tabular"
            style={{ color: theme.secondary }}
          >
            {readiness}% {readinessLabel}
          </span>
        </section>
      </div>
    </div>
  );
}
