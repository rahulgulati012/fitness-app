import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Database, Lock, Mail, UserPlus } from 'lucide-react';
import type { UserProfile } from '../types/kinetix';
import { getShortGoalLabel, UNIVERSAL_THEME } from '../services/theme';
import { AthleteAvatar } from './AthleteAvatar';
import { PWAInstallButton } from './PWAInstallButton';

interface AuthScreenProps {
  users: UserProfile[];
  onQuickSwitch: (userId: string) => void;
  onEmailSignIn: (email: string, password: string) => Promise<string | undefined>;
  onStartOnboarding: (prefill?: { email?: string; password?: string }) => void;
  onOpenCloudModal: () => void;
}

export function AuthScreen({
  users,
  onQuickSwitch,
  onEmailSignIn,
  onStartOnboarding,
  onOpenCloudModal,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const theme = UNIVERSAL_THEME;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'create') {
      onStartOnboarding({
        email: email.trim() || undefined,
        password: password || undefined,
      });
      return;
    }

    if (!email.trim()) {
      setError('Enter your athlete email or tap a profile chip above.');
      return;
    }

    setSubmitting(true);
    try {
      const err = await onEmailSignIn(email, password);
      if (err) setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-8 pb-8 relative overflow-hidden">
      {/* Animated Ambient Aura */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.32, 0.48, 0.32], scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-28 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full blur-[95px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,46,99,0.45) 0%, rgba(255,140,66,0.22) 60%, transparent 100%)',
        }}
      />

      <div className="relative z-10 space-y-6">
        {/* Hero Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(255,46,99,0.2) 0%, rgba(255,140,66,0.2) 100%)',
              boxShadow: `0 0 32px ${theme.glow}`,
            }}
          >
            <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="kinetix-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF2E63" />
                  <stop offset="100%" stopColor="#FF8C42" />
                </linearGradient>
              </defs>
              <path
                d="M7 5V27M13 16L24 5M13 16L25 27"
                stroke="url(#kinetix-mark)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">KINETIX</h1>
          <p className="text-sm text-white/75 mt-1.5 font-medium max-w-[280px] text-balance">
            Sculpted By Science. Driven By You.
          </p>
        </div>

        {/* Instant Account Switcher Bar */}
        <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-white/80">Instant Athlete Switcher</h2>
            <span className="text-[11px] text-white/50 tabular-nums">{users.length} profiles</span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {users.map((user) => {
              const firstName = user.name.split(/\s+/)[0];
              const isFemale = user.gender === 'female';
              const chipAccent = isFemale ? '#F43F5E' : '#F97316';
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onQuickSwitch(user.id)}
                  className="shrink-0 min-h-[44px] flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-2xl bg-[#1A1D28] border border-white/10 hover:border-white/25 transition-all active:scale-[0.97] text-left"
                >
                  <AthleteAvatar
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    gender={user.gender}
                    sizeClass="w-8 h-8"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white whitespace-nowrap leading-tight">
                      {firstName}
                    </p>
                    <p
                      className="text-[10px] font-medium whitespace-nowrap leading-tight mt-0.5"
                      style={{ color: chipAccent }}
                    >
                      {getShortGoalLabel(user.goal)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Sign In / Create Account Card */}
        <section className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#090A0F] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`min-h-[40px] rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                mode === 'signin'
                  ? 'bg-[#1A1D28] text-white shadow-sm border border-white/10'
                  : 'text-white/55 hover:text-white/80'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('create');
                setError(null);
              }}
              className={`min-h-[40px] rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                mode === 'create'
                  ? 'bg-[#1A1D28] text-white shadow-sm border border-white/10'
                  : 'text-white/55 hover:text-white/80'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signin' ? 'elena@kinetix.fit' : 'athlete@domain.com'}
                autoComplete="email"
                className="w-full min-h-[46px] pl-10 pr-4 bg-[#1A1D28] border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-rose-500/60"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (demo: demo)"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full min-h-[46px] pl-10 pr-4 bg-[#1A1D28] border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-rose-500/60"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 leading-relaxed px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-65"
              style={{
                background: theme.gradientCss,
                boxShadow: `0 8px 24px ${theme.glow}`,
              }}
            >
              <span>
                {submitting
                  ? 'Signing In...'
                  : mode === 'signin'
                    ? 'Enter Command Center'
                    : 'Continue to Athlete Setup'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => onStartOnboarding()}
              className="w-full min-h-[46px] rounded-2xl bg-[#1A1D28] border border-white/10 hover:border-white/20 text-xs font-semibold text-white/90 flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span>Create New Athlete Profile</span>
            </button>
          </div>
        </section>
      </div>

      {/* Footer PWA Install + Cloud Setup */}
      <div className="relative z-10 pt-6 flex flex-col items-center gap-2.5">
        <PWAInstallButton theme={theme} compact />
        <button
          type="button"
          onClick={onOpenCloudModal}
          className="min-h-[40px] px-4 rounded-2xl text-xs font-medium text-white/55 hover:text-white flex items-center gap-2 transition-colors"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Cloud & Supabase Setup</span>
        </button>
      </div>
    </div>
  );
}
