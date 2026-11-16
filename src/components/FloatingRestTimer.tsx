import { CheckCircle2, Pause, Play, Timer, X } from 'lucide-react';
import type { ThemeTokens } from '../types/kinetix';

export interface GlobalRestTimerState {
  active: boolean;
  running: boolean;
  exerciseName: string;
  totalSeconds: number;
  secondsLeft: number;
  endTimeMs: number | null;
  completed: boolean;
}

export function playTimerChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Ignore audio context restrictions
  }
}

export function formatRestCountdown(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface FloatingRestTimerProps {
  timer: GlobalRestTimerState;
  theme: ThemeTokens;
  onTogglePause: () => void;
  onAdjustSeconds: (delta: number) => void;
  onDismiss: () => void;
}

export function FloatingRestTimer({
  timer,
  theme,
  onTogglePause,
  onAdjustSeconds,
  onDismiss,
}: FloatingRestTimerProps) {
  if (!timer.active) return null;

  const total = Math.max(1, timer.totalSeconds);
  const pct = timer.completed
    ? 100
    : Math.min(100, Math.max(0, Math.round(((total - timer.secondsLeft) / total) * 100)));

  return (
    <div
      role="region"
      aria-label="Global active rest timer"
      className="fixed left-3 right-3 z-[9998] max-w-[406px] mx-auto"
      style={{
        bottom: 'calc(7.6rem + env(safe-area-inset-bottom))',
      }}
    >
      <div
        className={`rounded-2xl bg-[#12141C]/95 backdrop-blur-xl border px-3.5 py-2.5 shadow-2xl space-y-2 transition-all ${
          timer.completed ? 'border-amber-400/70' : 'border-white/15'
        }`}
        style={{
          boxShadow: timer.completed
            ? `0 12px 32px rgba(0, 0, 0, 0.72), 0 0 24px ${theme.glow}`
            : '0 12px 32px rgba(0, 0, 0, 0.72)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left: Countdown + Exercise Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white"
              style={{
                background: timer.completed
                  ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
                  : theme.gradientCss,
              }}
            >
              {timer.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Timer className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-sm font-bold font-mono-tabular ${
                    timer.completed ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {formatRestCountdown(timer.secondsLeft)}
                </span>
                <span className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">
                  {timer.completed ? 'Rest Done' : timer.running ? 'Resting' : 'Paused'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-white/75 truncate max-w-[140px]">
                {timer.exerciseName}
              </p>
            </div>
          </div>

          {/* Right: -15s, Pause/Resume, +15s, Dismiss */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onAdjustSeconds(-15)}
              aria-label="Subtract 15 seconds"
              className="min-h-[34px] px-2 rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-[11px] font-semibold font-mono-tabular text-white/85 hover:text-white active:scale-95 transition-transform"
            >
              -15s
            </button>

            <button
              type="button"
              onClick={onTogglePause}
              aria-label={timer.running ? 'Pause rest timer' : 'Resume rest timer'}
              className="min-w-[34px] min-h-[34px] rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform"
              style={{ background: theme.gradientCss }}
            >
              {timer.running ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onAdjustSeconds(15)}
              aria-label="Add 15 seconds"
              className="min-h-[34px] px-2 rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-[11px] font-semibold font-mono-tabular text-white/85 hover:text-white active:scale-95 transition-transform"
            >
              +15s
            </button>

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss rest timer"
              className="min-w-[30px] min-h-[34px] rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: timer.completed
                ? 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)'
                : theme.gradientCss,
            }}
          />
        </div>
      </div>
    </div>
  );
}
