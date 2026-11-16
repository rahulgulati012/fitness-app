import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  Trophy,
} from 'lucide-react';
import type { ThemeTokens, UserProfile } from '../types/kinetix';
import {
  formatRestCountdown,
  type GlobalRestTimerState,
} from './FloatingRestTimer';

interface WorkoutTabProps {
  user: UserProfile;
  theme: ThemeTokens;
  selectedDayIndex: number;
  restTimer: GlobalRestTimerState;
  onStartRestTimer: (durationSeconds: number, exerciseName?: string) => void;
  onToggleRestTimer: () => void;
  onAdjustRestTimer: (deltaSeconds: number) => void;
  onResetRestTimer: (durationSeconds?: number) => void;
  onSelectDay: (dayIndex: number) => void;
  onToggleWarmupDrill: (dayIndex: number, drillId: string) => void;
  onUpdateSet: (
    dayIndex: number,
    exerciseId: string,
    setId: string,
    patch: { weightKg?: number; reps?: number; completed?: boolean }
  ) => void;
  onFinishWorkout: (dayIndex: number) => void;
}

export function WorkoutTab({
  user,
  theme,
  selectedDayIndex,
  restTimer,
  onStartRestTimer,
  onToggleRestTimer,
  onAdjustRestTimer,
  onResetRestTimer,
  onSelectDay,
  onToggleWarmupDrill,
  onUpdateSet,
  onFinishWorkout,
}: WorkoutTabProps) {
  const currentDay = user.split[selectedDayIndex] ?? user.split[0];

  const [warmupExpanded, setWarmupExpanded] = useState(true);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const prevWarmupCompleteRef = useRef(false);

  const warmupTotal = currentDay.warmupDrills.length;
  const warmupDone = currentDay.warmupDrills.filter((d) => d.completed).length;
  const allWarmupsDone = warmupTotal > 0 && warmupDone === warmupTotal;

  // Collapse smoothly when user finishes checking the final warm-up drill
  useEffect(() => {
    if (allWarmupsDone && !prevWarmupCompleteRef.current) {
      const t = setTimeout(() => setWarmupExpanded(false), 320);
      prevWarmupCompleteRef.current = true;
      return () => clearTimeout(t);
    }
    if (!allWarmupsDone) {
      prevWarmupCompleteRef.current = false;
      setWarmupExpanded(true);
    }
  }, [allWarmupsDone, selectedDayIndex]);

  // Overall completion percentage
  const totalSets = currentDay.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = currentDay.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalUnits = warmupTotal + totalSets;
  const completedUnits = warmupDone + completedSets;
  const completionPct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const timerDisplay = restTimer.active ? restTimer.secondsLeft : 90;
  const timerCompleted = restTimer.active && restTimer.completed;
  const timerRunning = restTimer.active && restTimer.running;

  const handleFinish = () => {
    onFinishWorkout(currentDay.dayIndex);
    setCelebrationOpen(true);
  };

  return (
    <div className="pb-44 space-y-4">
      {/* 1. Horizontal 7-Day Split Selector (Gender-Filtered) */}
      <div className="px-4 pt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-white/60">
            {user.gender === 'female' ? 'Female Split' : 'Male Split'} · {user.goal}
          </span>
          <span className="font-mono-tabular text-white/45">
            Plan v{user.planVersion ?? 1}
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {user.split.map((day) => {
            const active = day.dayIndex === currentDay.dayIndex;
            return (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => onSelectDay(day.dayIndex)}
                className={`shrink-0 min-h-[54px] px-3.5 py-2 rounded-2xl border text-left transition-all ${
                  active
                    ? 'bg-[#12141C] text-white'
                    : 'bg-[#12141C]/60 border-white/[0.08] text-white/65 hover:text-white'
                }`}
                style={
                  active
                    ? {
                        borderColor: theme.primary,
                        boxShadow: `0 4px 18px ${theme.glow}`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold whitespace-nowrap">
                    {day.dayLabel} · Day {day.dayIndex + 1}
                  </span>
                  {day.completedToday && (
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: theme.secondary }} />
                  )}
                </div>
                <p className="text-[10px] text-white/55 truncate max-w-[115px] mt-0.5">
                  {day.isRestDay ? 'Active Recovery' : day.targetMuscle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sticky Workout Progress Header & Live Rest Timer Bar */}
      <div className="sticky top-[57px] z-30 px-4">
        <div
          className={`bg-[#12141C]/95 backdrop-blur-xl border rounded-2xl p-3.5 shadow-xl space-y-2.5 transition-all ${
            timerCompleted ? 'border-amber-400' : 'border-white/10'
          }`}
          style={
            timerCompleted
              ? { boxShadow: `0 0 24px ${theme.glow}` }
              : undefined
          }
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentDay.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${completionPct}%`, background: theme.gradientCss }}
                  />
                </div>
                <span className="text-[11px] font-semibold font-mono-tabular text-white/75">
                  {completionPct}% Done
                </span>
              </div>
            </div>

            {/* Rest Timer Readout & Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="px-2.5 py-1.5 rounded-xl bg-[#1A1D28] border border-white/10 flex items-center gap-1.5">
                <Timer
                  className="w-3.5 h-3.5"
                  style={{ color: timerCompleted ? '#EAB308' : theme.secondary }}
                />
                <span
                  className={`text-xs font-bold font-mono-tabular ${
                    timerCompleted ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {timerCompleted ? 'GO!' : formatRestCountdown(timerDisplay)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!restTimer.active || restTimer.secondsLeft === 0) {
                    onStartRestTimer(restTimer.totalSeconds || 90, currentDay.title);
                  } else {
                    onToggleRestTimer();
                  }
                }}
                aria-label={timerRunning ? 'Pause rest timer' : 'Start rest timer'}
                className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-white transition-transform active:scale-95"
                style={{ background: theme.gradientCss }}
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!restTimer.active) {
                    onStartRestTimer(105, currentDay.title);
                  } else {
                    onAdjustRestTimer(15);
                  }
                }}
                className="min-h-[36px] px-2 rounded-xl bg-[#1A1D28] border border-white/10 text-[11px] font-semibold font-mono-tabular text-white/80 hover:text-white"
              >
                +15s
              </button>
            </div>
          </div>

          {/* Quick Rest Presets */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
            <span className="text-[10px] text-white/50">Rest Preset</span>
            <div className="flex items-center gap-1.5">
              {[60, 90, 120].map((sec) => {
                const isSelected = restTimer.totalSeconds === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onStartRestTimer(sec, currentDay.title)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold font-mono-tabular transition-colors ${
                      isSelected
                        ? 'text-white border border-white/20 bg-white/10'
                        : 'text-white/55 hover:text-white bg-[#1A1D28]/60'
                    }`}
                  >
                    {sec}s
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => onResetRestTimer(restTimer.totalSeconds || 90)}
                aria-label="Reset rest timer"
                className="p-1 rounded-lg text-white/45 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mandatory Muscle-Specific Warm-Up Accordion */}
      <div className="px-4">
        <section
          className="rounded-3xl bg-[#12141C]/90 backdrop-blur-xl overflow-hidden transition-all"
          style={{
            border: `1px solid ${allWarmupsDone ? theme.borderAccent : 'rgba(255, 140, 66, 0.5)'}`,
            boxShadow: allWarmupsDone
              ? `0 6px 22px ${theme.glow}`
              : '0 8px 28px rgba(255, 140, 66, 0.16)',
          }}
        >
          <button
            type="button"
            onClick={() => setWarmupExpanded((e) => !e)}
            className="w-full min-h-[58px] px-4 py-3.5 flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white"
                style={{
                  background: allWarmupsDone
                    ? theme.gradientCss
                    : 'linear-gradient(135deg, #FF8C42 0%, #FB7185 100%)',
                }}
              >
                {allWarmupsDone ? <Check className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {allWarmupsDone
                    ? 'Warm-Up Primed'
                    : `5-Min ${currentDay.targetMuscle} Activation Warm-Up`}
                </p>
                <p className="text-[11px] text-white/60 truncate">
                  {allWarmupsDone
                    ? `${warmupTotal} drills completed · Joints & CNS ready`
                    : `${warmupDone} of ${warmupTotal} mobility drills checked`}
                </p>
              </div>
            </div>
            <div className="text-white/60 shrink-0">
              {warmupExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {warmupExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-white/[0.06]"
              >
                <div className="p-3 space-y-2">
                  {currentDay.warmupDrills.map((drill) => (
                    <button
                      key={drill.id}
                      type="button"
                      onClick={() => onToggleWarmupDrill(currentDay.dayIndex, drill.id)}
                      className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${
                        drill.completed
                          ? 'bg-[#1A1D28]/90 border-white/15'
                          : 'bg-[#1A1D28]/45 border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            drill.completed ? 'text-white/55 line-through' : 'text-white'
                          }`}
                        >
                          {drill.name}
                        </p>
                        <p className="text-[11px] text-white/50 mt-0.5">{drill.prescription}</p>
                      </div>
                      <div
                        className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center transition-all"
                        style={
                          drill.completed
                            ? { background: theme.gradientCss, color: '#fff' }
                            : { border: '1.5px solid rgba(255,255,255,0.25)' }
                        }
                      >
                        {drill.completed && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* 4. Exercise Stack & Set Logger */}
      <div className="px-4 space-y-3">
        {currentDay.exercises.map((exercise, exIdx) => (
          <section
            key={exercise.id}
            className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg space-y-3.5"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-medium text-white/50">
                    0{exIdx + 1} · {exercise.muscle}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {exercise.name}
                  </h3>
                </div>
                <span className="text-[11px] font-mono-tabular text-white/60 whitespace-nowrap shrink-0">
                  {exercise.tempo} · {exercise.restSeconds}s rest
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{exercise.cue}</p>
            </div>

            {/* Set Table Header */}
            <div className="grid grid-cols-[44px_1fr_1fr_48px] gap-2 text-[10px] font-semibold text-white/45 px-1">
              <span>Set</span>
              <span>Weight (kg)</span>
              <span>{currentDay.isRestDay ? 'Mins / Reps' : 'Reps'}</span>
              <span className="text-center">Done</span>
            </div>

            {/* Set Rows */}
            <div className="space-y-2">
              {exercise.sets.map((setRow) => (
                <div
                  key={setRow.id}
                  className={`grid grid-cols-[44px_1fr_1fr_48px] gap-2 items-center p-1.5 rounded-2xl border transition-colors ${
                    setRow.completed
                      ? 'bg-[#1A1D28]/90 border-white/15'
                      : 'bg-[#090A0F]/60 border-white/[0.06]'
                  }`}
                >
                  <span className="text-xs font-bold font-mono-tabular text-white/75 text-center">
                    {setRow.setNumber}
                  </span>

                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    aria-label={`${exercise.name} set ${setRow.setNumber} weight kg`}
                    value={setRow.weightKg}
                    onChange={(e) =>
                      onUpdateSet(currentDay.dayIndex, exercise.id, setRow.id, {
                        weightKg: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#1A1D28] border border-white/10 text-center text-sm font-semibold font-mono-tabular text-white focus:outline-none focus:border-white/30"
                  />

                  <input
                    type="number"
                    min={0}
                    step={1}
                    aria-label={`${exercise.name} set ${setRow.setNumber} reps`}
                    value={setRow.reps}
                    onChange={(e) =>
                      onUpdateSet(currentDay.dayIndex, exercise.id, setRow.id, {
                        reps: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#1A1D28] border border-white/10 text-center text-sm font-semibold font-mono-tabular text-white focus:outline-none focus:border-white/30"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const nextDone = !setRow.completed;
                      onUpdateSet(currentDay.dayIndex, exercise.id, setRow.id, {
                        completed: nextDone,
                      });
                      if (nextDone) {
                        onStartRestTimer(exercise.restSeconds || 90, exercise.name);
                      }
                    }}
                    aria-label={`Mark set ${setRow.setNumber} complete`}
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={
                      setRow.completed
                        ? {
                            background: theme.gradientCss,
                            color: '#FFFFFF',
                            boxShadow: `0 0 16px ${theme.glow}`,
                          }
                        : {
                            backgroundColor: '#1A1D28',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.5)',
                          }
                    }
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* 5. Finish Workout CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full min-h-[54px] rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            style={{
              background: theme.gradientCss,
              boxShadow: `0 10px 28px ${theme.glow}`,
            }}
          >
            <Trophy className="w-4 h-4" />
            <span>
              {currentDay.completedToday ? 'Log Session Again' : 'Finish Workout & Sync Squad'}
            </span>
          </button>
        </div>
      </div>

      {/* Completion Celebration Modal (Zero Green) */}
      <AnimatePresence>
        {celebrationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-5"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden"
              style={{ boxShadow: `0 18px 48px rgba(0,0,0,0.7), 0 0 40px ${theme.glow}` }}
            >
              {/* Animated neon particle burst */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={{ scale: [0.9, 1.08, 1] }}
                  transition={{ duration: 0.45 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                  style={{
                    background: theme.gradientCss,
                    boxShadow: `0 0 30px ${theme.glow}`,
                  }}
                >
                  <Trophy className="w-8 h-8" />
                </motion.div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white">Session Locked In</h2>
                <p className="text-xs text-white/75 leading-relaxed">
                  {user.name.split(/\s+/)[0]}, {currentDay.title} is logged. Your streak is now{' '}
                  <span className="font-bold text-white">{user.streakDays} days</span> and your Squad
                  feed has been updated.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-[#1A1D28] border border-white/10">
                  <p className="text-[10px] text-white/55">Sets Logged</p>
                  <p className="text-base font-bold font-mono-tabular text-white mt-0.5">
                    {completedSets}/{totalSets}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#1A1D28] border border-white/10">
                  <p className="text-[10px] text-white/55">Active Streak</p>
                  <p
                    className="text-base font-bold font-mono-tabular mt-0.5"
                    style={{ color: theme.secondary }}
                  >
                    {user.streakDays} Days
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCelebrationOpen(false)}
                className="w-full min-h-[48px] rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-1.5"
                style={{ background: theme.gradientCss }}
              >
                <Plus className="w-4 h-4 rotate-45 hidden" />
                <span>Back to Command</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
