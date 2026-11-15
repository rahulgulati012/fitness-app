import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  Droplets,
  Dumbbell,
  Footprints,
  Moon,
  Plus,
  Ruler,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import type { ThemeTokens, UserProfile } from '../types/kinetix';
import {
  calculateSleepTargetHours,
  calculateStepTarget,
  calculateWaterTargetMl,
} from '../services/theme';

interface ProgressTabProps {
  user: UserProfile;
  theme: ThemeTokens;
  onLogMeasurements: (entry: {
    weightKg: number;
    waistCm: number;
    hipCm: number;
    chestCm: number;
  }) => void;
}

type PhysiqueMetricKey = 'weightKg' | 'waistCm' | 'hipCm' | 'chestCm';

const METRIC_META: Record<
  PhysiqueMetricKey,
  { label: string; unit: string; shortLabel: string }
> = {
  weightKg: { label: 'Body Weight', unit: 'kg', shortLabel: 'Weight' },
  waistCm: { label: 'Waist', unit: 'cm', shortLabel: 'Waist' },
  hipCm: { label: 'Glutes / Hip', unit: 'cm', shortLabel: 'Hips' },
  chestCm: { label: 'Chest / Shoulders', unit: 'cm', shortLabel: 'Chest' },
};

export function ProgressTab({
  user,
  theme,
  onLogMeasurements,
}: ProgressTabProps) {
  const [activeMetric, setActiveMetric] = useState<PhysiqueMetricKey>('weightKg');
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const latestMeasurement =
    user.bodyMeasurements[user.bodyMeasurements.length - 1] ?? {
      weightKg: user.metrics.weightKg,
      waistCm: user.gender === 'female' ? 65 : 81,
      hipCm: user.gender === 'female' ? 95 : 98,
      chestCm: user.gender === 'female' ? 87 : 105,
    };

  const [formWeight, setFormWeight] = useState(latestMeasurement.weightKg);
  const [formWaist, setFormWaist] = useState(latestMeasurement.waistCm);
  const [formHip, setFormHip] = useState(latestMeasurement.hipCm);
  const [formChest, setFormChest] = useState(latestMeasurement.chestCm);

  // 1. Weekly Averages Summary Calculations (last 7 days)
  const history = user.weeklyHistory;
  const avgSteps = Math.round(
    history.reduce((s, d) => s + d.steps, 0) / Math.max(1, history.length)
  );
  const avgWater = Math.round(
    history.reduce((s, d) => s + d.waterMl, 0) / Math.max(1, history.length)
  );
  const avgSleep = Number(
    (history.reduce((s, d) => s + d.sleepHours, 0) / Math.max(1, history.length)).toFixed(1)
  );
  const plannedWorkouts = history.filter((d) => !d.isRestDay).length;
  const completedWorkouts = history.filter((d) => !d.isRestDay && d.workoutCompleted).length;

  const stepTarget = calculateStepTarget(user.goal);
  const waterTarget = calculateWaterTargetMl(user.metrics.weightKg);
  const sleepTarget = calculateSleepTargetHours(user.gender);

  // 2. Body Weight & Physique SVG Chart Math
  const points = user.bodyMeasurements;
  const values = points.map((p) => p[activeMetric]);
  const firstVal = values[0] ?? 0;
  const lastVal = values[values.length - 1] ?? 0;
  const netDelta = Number((lastVal - firstVal).toFixed(1));

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max(0.8, (maxVal - minVal) * 0.25);
  const yMin = minVal - padding;
  const yMax = maxVal + padding;

  const svgWidth = 340;
  const svgHeight = 148;
  const padX = 18;
  const padY = 18;
  const plotW = svgWidth - padX * 2;
  const plotH = svgHeight - padY * 2;

  const coords = points.map((pt, idx) => {
    const x =
      points.length === 1
        ? padX + plotW / 2
        : padX + (idx / (points.length - 1)) * plotW;
    const ratio = yMax === yMin ? 0.5 : (pt[activeMetric] - yMin) / (yMax - yMin);
    const y = padY + plotH - ratio * plotH;
    return { x, y, val: pt[activeMetric], dateLabel: pt.dateLabel };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padY + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padY + plotH).toFixed(1)} Z`
      : '';

  const inspectedIdx =
    selectedPointIdx !== null && coords[selectedPointIdx]
      ? selectedPointIdx
      : coords.length - 1;
  const activeCoord = coords[inspectedIdx];

  const handleLogSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogMeasurements({
      weightKg: formWeight,
      waistCm: formWaist,
      hipCm: formHip,
      chestCm: formChest,
    });
    setSelectedPointIdx(null);
    setLogModalOpen(false);
  };

  const openLogModal = () => {
    setFormWeight(latestMeasurement.weightKg);
    setFormWaist(latestMeasurement.waistCm);
    setFormHip(latestMeasurement.hipCm);
    setFormChest(latestMeasurement.chestCm);
    setLogModalOpen(true);
  };

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Progress & Analytics</h1>
          <p className="text-xs text-white/60 mt-0.5">
            7-day recovery trends & physique composition
          </p>
        </div>
        <span
          className="px-2.5 py-1 rounded-xl text-[11px] font-semibold font-mono-tabular"
          style={{
            backgroundColor: theme.softBg,
            color: theme.secondary,
            border: `1px solid ${theme.borderAccent}`,
          }}
        >
          {user.streakDays}d Streak
        </span>
      </div>

      {/* A. Weekly Averages Summary Strip (4 Clean Stat Cards) */}
      <section className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/60">Avg Daily Steps</span>
            <Footprints className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
          </div>
          <p className="text-xl font-bold font-mono-tabular text-white">
            {avgSteps.toLocaleString()}
          </p>
          <p className="text-[10px] text-white/45">
            Target {(stepTarget / 1000).toFixed(1)}k / day
          </p>
        </div>

        <div className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/60">Avg Water Intake</span>
            <Droplets className="w-3.5 h-3.5" style={{ color: theme.primary }} />
          </div>
          <p className="text-xl font-bold font-mono-tabular text-white">
            {avgWater.toLocaleString()} <span className="text-xs font-normal text-white/60">ml</span>
          </p>
          <p className="text-[10px] text-white/45">
            Target {waterTarget.toLocaleString()} ml
          </p>
        </div>

        <div className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/60">Avg Sleep</span>
            <Moon className="w-3.5 h-3.5" style={{ color: theme.primary }} />
          </div>
          <p className="text-xl font-bold font-mono-tabular text-white">
            {avgSleep.toFixed(1)} <span className="text-xs font-normal text-white/60">hrs</span>
          </p>
          <p className="text-[10px] text-white/45">
            Target {sleepTarget.toFixed(1)} hrs
          </p>
        </div>

        <div className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/60">Workouts Done</span>
            <Dumbbell className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
          </div>
          <p className="text-xl font-bold font-mono-tabular text-white">
            {completedWorkouts} / {plannedWorkouts}{' '}
            <span className="text-xs font-normal text-white/60">Days</span>
          </p>
          <p className="text-[10px] text-white/45">
            {plannedWorkouts > 0
              ? `${Math.round((completedWorkouts / plannedWorkouts) * 100)}% adherence`
              : 'Active week'}
          </p>
        </div>
      </section>

      {/* B. Body Weight & Physique Change Graph */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4" style={{ color: theme.primary }} />
              <h2 className="text-sm font-bold text-white">Body Weight & Physique</h2>
            </div>
            {activeCoord && (
              <p className="text-xs text-white/60 mt-1">
                {activeCoord.dateLabel}:{' '}
                <span className="font-mono-tabular font-bold text-white">
                  {activeCoord.val} {METRIC_META[activeMetric].unit}
                </span>
              </p>
            )}
          </div>

          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono-tabular whitespace-nowrap shrink-0"
            style={{
              backgroundColor: theme.softBg,
              color: theme.secondary,
              border: `1px solid ${theme.borderAccent}`,
            }}
          >
            {netDelta <= 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            <span>
              {netDelta > 0 ? `+${netDelta}` : netDelta} {METRIC_META[activeMetric].unit} this month
            </span>
          </span>
        </div>

        {/* Metric Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#090A0F] border border-white/[0.06]">
          {(Object.keys(METRIC_META) as PhysiqueMetricKey[]).map((key) => {
            const active = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveMetric(key);
                  setSelectedPointIdx(null);
                }}
                className={`min-h-[34px] rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap ${
                  active ? 'text-white shadow-sm' : 'text-white/50 hover:text-white/80'
                }`}
                style={
                  active
                    ? {
                        backgroundColor: '#1A1D28',
                        border: `1px solid ${theme.borderAccent}`,
                      }
                    : undefined
                }
              >
                {METRIC_META[key].shortLabel}
              </button>
            );
          })}
        </div>

        {/* Interactive SVG Area / Line Chart */}
        <div className="relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-[155px] overflow-visible"
            role="img"
            aria-label={`${METRIC_META[activeMetric].label} progression chart`}
          >
            <defs>
              <linearGradient id="physique-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.primary} stopOpacity="0.42" />
                <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="physique-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={theme.primary} />
                <stop offset="100%" stopColor={theme.secondary} />
              </linearGradient>
            </defs>

            {/* Subtle horizontal reference lines */}
            {[0.25, 0.5, 0.75].map((t) => {
              const y = padY + plotH * t;
              return (
                <line
                  key={t}
                  x1={padX}
                  x2={svgWidth - padX}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {areaPath && <path d={areaPath} fill="url(#physique-area-grad)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#physique-line-grad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {coords.map((pt, idx) => {
              const isSelected = idx === inspectedIdx;
              return (
                <g
                  key={pt.dateLabel + idx}
                  className="cursor-pointer"
                  onClick={() => setSelectedPointIdx(idx)}
                >
                  <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="8"
                      fill={theme.glow}
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 5 : 3.8}
                    fill={isSelected ? '#FFFFFF' : theme.secondary}
                    stroke={theme.primary}
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - 2}
                    textAnchor="middle"
                    className="fill-white/45 text-[9px] font-medium"
                  >
                    {pt.dateLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Latest Measurement Snapshot + CTA */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06] text-center">
          <div>
            <p className="text-[10px] text-white/50">Waist</p>
            <p className="text-xs font-bold font-mono-tabular text-white">
              {latestMeasurement.waistCm} cm
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/50">Hips</p>
            <p className="text-xs font-bold font-mono-tabular text-white">
              {latestMeasurement.hipCm} cm
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/50">Chest</p>
            <p className="text-xs font-bold font-mono-tabular text-white">
              {latestMeasurement.chestCm} cm
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openLogModal}
          className="w-full min-h-[46px] rounded-2xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
          style={{
            background: theme.gradientCss,
            boxShadow: `0 6px 20px ${theme.glow}`,
          }}
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Today&apos;s Weight &amp; Measurements</span>
        </button>
      </section>

      {/* C. Weekly Recovery & Activity Trend Charts (Mon–Sun vs Target) */}
      <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: theme.secondary }} />
            <h2 className="text-sm font-bold text-white">Weekly Recovery &amp; Activity</h2>
          </div>
          <span className="text-[11px] text-white/50">Mon–Sun vs Target</span>
        </div>

        {/* 1. Daily Steps Trend */}
        <WeeklyBarTrend
          title="Daily Steps"
          unit=""
          target={stepTarget}
          targetLabel={`Target ${stepTarget.toLocaleString()}`}
          data={history.map((d) => ({ label: d.dayLabel, value: d.steps }))}
          maxScale={Math.max(stepTarget * 1.25, ...history.map((d) => d.steps), 1000)}
          barColor={theme.secondary}
          secondaryColor={theme.primary}
          formatVal={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
        />

        {/* 2. Daily Water Intake Trend */}
        <WeeklyBarTrend
          title="Water Intake"
          unit="ml"
          target={waterTarget}
          targetLabel={`Target ${waterTarget.toLocaleString()} ml`}
          data={history.map((d) => ({ label: d.dayLabel, value: d.waterMl }))}
          maxScale={Math.max(waterTarget * 1.2, ...history.map((d) => d.waterMl), 500)}
          barColor={theme.primary}
          secondaryColor={theme.secondary}
          formatVal={(v) => `${(v / 1000).toFixed(1)}L`}
        />

        {/* 3. Daily Sleep Trend */}
        <WeeklyBarTrend
          title="Sleep Duration"
          unit="h"
          target={sleepTarget}
          targetLabel={`Target ${sleepTarget.toFixed(1)} hrs`}
          data={history.map((d) => ({ label: d.dayLabel, value: d.sleepHours }))}
          maxScale={10}
          barColor={theme.secondary}
          secondaryColor={theme.primary}
          formatVal={(v) => `${v.toFixed(1)}h`}
        />
      </section>

      {/* Log Weight & Measurements Modal */}
      <AnimatePresence>
        {logModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
            role="dialog"
            aria-modal="true"
            onClick={() => setLogModalOpen(false)}
          >
            <motion.div
              initial={{ y: 36, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 36, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[398px] bg-[#12141C] border border-white/12 rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Log Today&apos;s Check-In</h3>
                  <p className="text-xs text-white/55">Updates your chart and hydration baseline</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  aria-label="Close measurement modal"
                  className="min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="log-weight" className="text-[11px] text-white/65 block">
                      Body Weight (kg)
                    </label>
                    <input
                      id="log-weight"
                      type="number"
                      step={0.1}
                      min={35}
                      max={200}
                      value={formWeight}
                      onChange={(e) => setFormWeight(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="log-waist" className="text-[11px] text-white/65 block">
                      Waist (cm)
                    </label>
                    <input
                      id="log-waist"
                      type="number"
                      step={0.1}
                      min={40}
                      max={160}
                      value={formWaist}
                      onChange={(e) => setFormWaist(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="log-hip" className="text-[11px] text-white/65 block">
                      Glutes / Hips (cm)
                    </label>
                    <input
                      id="log-hip"
                      type="number"
                      step={0.1}
                      min={50}
                      max={180}
                      value={formHip}
                      onChange={(e) => setFormHip(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="log-chest" className="text-[11px] text-white/65 block">
                      Chest / Shoulders (cm)
                    </label>
                    <input
                      id="log-chest"
                      type="number"
                      step={0.1}
                      min={50}
                      max={180}
                      value={formChest}
                      onChange={(e) => setFormChest(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                  style={{
                    background: theme.gradientCss,
                    boxShadow: `0 6px 20px ${theme.glow}`,
                  }}
                >
                  <span>Save Measurements</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeeklyBarTrend({
  title,
  target,
  targetLabel,
  data,
  maxScale,
  barColor,
  secondaryColor,
  formatVal,
}: {
  title: string;
  unit: string;
  target: number;
  targetLabel: string;
  data: { label: string; value: number }[];
  maxScale: number;
  barColor: string;
  secondaryColor: string;
  formatVal: (v: number) => string;
}) {
  const targetPct = Math.min(95, Math.max(10, (target / maxScale) * 100));

  return (
    <div className="space-y-2 pt-2 border-t border-white/[0.06] first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-white/90">{title}</span>
        <span className="text-[11px] font-mono-tabular text-white/50">{targetLabel}</span>
      </div>

      <div className="relative h-24 pt-3 flex items-end justify-between gap-2">
        {/* Dashed Target Line */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 border-t border-dashed border-white/25 pointer-events-none z-10"
          style={{ bottom: `calc(${targetPct}% * 0.72 + 18px)` }}
        />

        {data.map((d) => {
          const heightPct = Math.min(100, Math.max(6, (d.value / maxScale) * 100));
          const hitTarget = d.value >= target;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[9px] font-mono-tabular text-white/55 leading-none">
                {formatVal(d.value)}
              </span>
              <div className="w-full h-[64px] rounded-xl bg-white/[0.04] flex items-end p-0.5 overflow-hidden">
                <div
                  className="w-full rounded-lg transition-all duration-500"
                  style={{
                    height: `${heightPct}%`,
                    background: hitTarget
                      ? `linear-gradient(180deg, ${secondaryColor} 0%, ${barColor} 100%)`
                      : `${barColor}66`,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-white/55 leading-none">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
