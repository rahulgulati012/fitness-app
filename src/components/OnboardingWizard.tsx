import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Flame, Sparkles } from 'lucide-react';
import type {
  BioSchedule,
  BodyMetrics,
  Gender,
  MotivationVibe,
  PhysiqueGoal,
  UserProfile,
} from '../types/kinetix';
import {
  calculateBmi,
  calculateWaterTargetMl,
  resolveTheme,
} from '../services/theme';
import { FEMALE_GOALS, MALE_GOALS } from '../services/db';
import { generateAthleteBlueprint } from '../services/blueprintFallback';

interface OnboardingWizardProps {
  initialEmail?: string;
  initialPassword?: string;
  onCancel: () => void;
  onComplete: (profileData: {
    name: string;
    email: string;
    password: string;
    gender: Gender;
    goal: PhysiqueGoal;
    metrics: BodyMetrics;
    schedule: BioSchedule;
    split: UserProfile['split'];
    quotes: string[];
    blueprintSource: 'gemini-2.5-flash' | 'kinetix-engine';
  }) => Promise<string | undefined | void> | void;
}

const VIBES: { title: MotivationVibe; preview: string }[] = [
  {
    title: 'Confident & Indulging',
    preview: 'Poised, magnetic, luxury self-mastery.',
  },
  {
    title: 'Unapologetic Hype',
    preview: 'High-voltage momentum and fierce energy.',
  },
  {
    title: 'Elite Discipline',
    preview: 'Clinical precision, tempo, and daily execution.',
  },
];

export function OnboardingWizard({
  initialEmail = '',
  initialPassword = '',
  onCancel,
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword || '');
  const [gender, setGender] = useState<Gender>('female');
  const [heightCm, setHeightCm] = useState(168);
  const [weightKg, setWeightKg] = useState(58);
  const [age, setAge] = useState(26);
  const [goal, setGoal] = useState<PhysiqueGoal>('Hourglass & Glute Sculpt');
  const [workoutTime, setWorkoutTime] = useState('18:00');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [bedTime, setBedTime] = useState('22:30');
  const [vibe, setVibe] = useState<MotivationVibe>('Confident & Indulging');
  const [isGenerating, setIsGenerating] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const theme = resolveTheme(gender);
  const goalCards = gender === 'female' ? FEMALE_GOALS : MALE_GOALS;
  const bmi = calculateBmi(heightCm, weightKg);
  const waterTarget = calculateWaterTargetMl(weightKg);

  const handleGenderChange = (nextGender: Gender) => {
    setGender(nextGender);
    if (nextGender === 'female') {
      setHeightCm(167);
      setWeightKg(58);
      setGoal('Hourglass & Glute Sculpt');
    } else {
      setHeightCm(181);
      setWeightKg(80);
      setGoal('V-Taper Aesthetic');
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onCancel();
    } else {
      setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleNext = () => {
    setSignupError(null);
    if (step === 1) {
      if (!name.trim()) {
        setSignupError('Please enter your display name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setSignupError('Enter a valid email address for your athlete account.');
        return;
      }
      if (password.trim().length < 6) {
        setSignupError('Password must be at least 6 characters.');
        return;
      }
    }
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleGenerate = async () => {
    const cleanName = name.trim() || 'Athlete';
    const cleanEmail =
      email.trim() ||
      `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@kinetix.fit`;

    setSignupError(null);
    setIsGenerating(true);
    const metrics: BodyMetrics = { heightCm, weightKg, age };
    const schedule: BioSchedule = { workoutTime, wakeTime, bedTime, vibe };

    const result = await generateAthleteBlueprint({
      name: cleanName,
      gender,
      goal,
      metrics,
      schedule,
    });

    try {
      const err = await onComplete({
        name: cleanName,
        email: cleanEmail,
        password: password.trim().length >= 6 ? password.trim() : 'kinetix123',
        gender,
        goal,
        metrics,
        schedule,
        split: result.split,
        quotes: result.quotes,
        blueprintSource: result.source,
      });
      if (typeof err === 'string' && err) {
        setSignupError(err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-6 pb-8 relative overflow-hidden">
      {/* Live Gender-Adaptive Aura */}
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full blur-[95px] pointer-events-none transition-all duration-500"
        style={{ background: theme.glow }}
      />

      <div className="relative z-10 space-y-6">
        {/* Top Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-xl flex items-center gap-1.5 text-sm font-medium text-white/75 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-xs font-semibold text-white/65 tabular-nums">
              Step {step} of 4
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: theme.gradientCss }}
            />
          </div>
        </div>

        {/* STEP 1: Identity & Gender */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white text-balance">
                Build your athlete profile
              </h1>
              <p className="text-sm text-white/65 mt-1">
                Your physiology calibrates your training split, theme, and recovery targets.
              </p>
            </div>

            <div className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-lg">
              <div className="space-y-2">
                <label htmlFor="athlete-name" className="text-xs font-semibold text-white/80 block">
                  Display Name
                </label>
                <input
                  id="athlete-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jordan Vance"
                  className="w-full min-h-[50px] px-4 bg-[#1A1D28] border border-white/10 rounded-2xl text-base font-medium text-white placeholder:text-white/35 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="athlete-email" className="text-xs font-semibold text-white/80 block">
                    Email (used for cloud sync &amp; sign-in)
                  </label>
                  <input
                    id="athlete-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@kinetix.fit"
                    autoComplete="email"
                    className="w-full min-h-[46px] px-4 bg-[#1A1D28] border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="athlete-password" className="text-xs font-semibold text-white/80 block">
                    Password (min 6 characters)
                  </label>
                  <input
                    id="athlete-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    autoComplete="new-password"
                    className="w-full min-h-[46px] px-4 bg-[#1A1D28] border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-semibold text-white/80 block">
                  Physiological Profile & Theme
                </span>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`w-full min-h-[72px] p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      gender === 'female'
                        ? 'bg-[#1A1D28] border-rose-500/70'
                        : 'bg-[#1A1D28]/60 border-white/10 hover:border-white/20'
                    }`}
                    style={
                      gender === 'female'
                        ? { boxShadow: '0 0 24px rgba(244, 63, 94, 0.25)' }
                        : undefined
                    }
                  >
                    <div>
                      <p className="text-base font-semibold text-white">Female</p>
                      <p className="text-xs text-white/60 mt-0.5">
                        Hot Magenta · 8.5h hormonal recovery · Glute & taper splits
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        gender === 'female' ? 'bg-rose-500 text-white' : 'border border-white/25'
                      }`}
                    >
                      {gender === 'female' && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`w-full min-h-[72px] p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      gender === 'male'
                        ? 'bg-[#1A1D28] border-orange-500/70'
                        : 'bg-[#1A1D28]/60 border-white/10 hover:border-white/20'
                    }`}
                    style={
                      gender === 'male'
                        ? { boxShadow: '0 0 24px rgba(249, 115, 22, 0.25)' }
                        : undefined
                    }
                  >
                    <div>
                      <p className="text-base font-semibold text-white">Male</p>
                      <p className="text-xs text-white/60 mt-0.5">
                        Blaze Orange · 8.0h CNS recovery · V-Taper & hypertrophy splits
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        gender === 'male' ? 'bg-orange-500 text-white' : 'border border-white/25'
                      }`}
                    >
                      {gender === 'male' && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Body Metrics */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white text-balance">
                Calibrate your metrics
              </h1>
              <p className="text-sm text-white/65 mt-1">
                Used to compute starter training loads and baseline hydration targets.
              </p>
            </div>

            <div className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 space-y-6 shadow-lg">
              {/* Height */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="slider-height" className="text-sm font-medium text-white/85">
                    Height
                  </label>
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-semibold font-mono-tabular text-white bg-[#1A1D28] border border-white/10"
                    style={{ color: theme.secondary }}
                  >
                    {heightCm} cm
                  </span>
                </div>
                <input
                  id="slider-height"
                  type="range"
                  min={140}
                  max={210}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="kinetix-slider"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="slider-weight" className="text-sm font-medium text-white/85">
                    Weight
                  </label>
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-semibold font-mono-tabular text-white bg-[#1A1D28] border border-white/10"
                    style={{ color: theme.secondary }}
                  >
                    {weightKg} kg
                  </span>
                </div>
                <input
                  id="slider-weight"
                  type="range"
                  min={40}
                  max={140}
                  step={0.5}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="kinetix-slider"
                />
              </div>

              {/* Age */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="slider-age" className="text-sm font-medium text-white/85">
                    Age
                  </label>
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-semibold font-mono-tabular text-white bg-[#1A1D28] border border-white/10"
                    style={{ color: theme.secondary }}
                  >
                    {age} yrs
                  </span>
                </div>
                <input
                  id="slider-age"
                  type="range"
                  min={18}
                  max={70}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="kinetix-slider"
                />
              </div>

              {/* Live Calculation Footer */}
              <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/55">Calculated BMI</p>
                  <p className="text-xl font-bold font-mono-tabular text-white mt-0.5">{bmi}</p>
                </div>
                <div>
                  <p className="text-xs text-white/55">Hydration Baseline</p>
                  <p
                    className="text-xl font-bold font-mono-tabular mt-0.5"
                    style={{ color: theme.secondary }}
                  >
                    {waterTarget.toLocaleString()} ml
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Gender-Specific Physique Goal Cards */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white text-balance">
                Select your physique target
              </h1>
              <p className="text-sm text-white/65 mt-1">
                {gender === 'female'
                  ? 'Tailored female silhouettes & hormone-aligned volume.'
                  : 'Tailored male proportions & progressive overload mechanics.'}
              </p>
            </div>

            <div className="space-y-3">
              {goalCards.map((card) => {
                const selected = goal === card.title;
                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => setGoal(card.title)}
                    className={`w-full p-4 rounded-3xl text-left border transition-all ${
                      selected
                        ? 'bg-[#12141C] border-white/25'
                        : 'bg-[#12141C]/70 border-white/[0.08] hover:border-white/20'
                    }`}
                    style={
                      selected
                        ? {
                            borderColor: theme.primary,
                            boxShadow: `0 8px 28px ${theme.glow}`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <h3 className="text-base font-semibold text-white">{card.title}</h3>
                        <p className="text-xs text-white/75 leading-relaxed">{card.subtitle}</p>
                        <p className="text-[11px] font-medium pt-0.5" style={{ color: theme.secondary }}>
                          {card.focus}
                        </p>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                        style={
                          selected
                            ? { background: theme.gradientCss, color: '#fff' }
                            : { border: '1px solid rgba(255,255,255,0.25)' }
                        }
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Bio-Rhythm & Daily Schedule */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white text-balance">
                Align your bio-rhythm
              </h1>
              <p className="text-sm text-white/65 mt-1">
                Schedule smart nudges and choose your coaching voice.
              </p>
            </div>

            <div className="bg-[#12141C]/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 space-y-5 shadow-lg">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1.5">
                  <label htmlFor="time-workout" className="text-[11px] font-medium text-white/65 block">
                    Workout
                  </label>
                  <input
                    id="time-workout"
                    type="time"
                    value={workoutTime}
                    onChange={(e) => setWorkoutTime(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 bg-[#1A1D28] border border-white/10 rounded-2xl text-xs font-mono-tabular text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="time-wake" className="text-[11px] font-medium text-white/65 block">
                    Wake-Up
                  </label>
                  <input
                    id="time-wake"
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 bg-[#1A1D28] border border-white/10 rounded-2xl text-xs font-mono-tabular text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="time-bed" className="text-[11px] font-medium text-white/65 block">
                    Bedtime
                  </label>
                  <input
                    id="time-bed"
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 bg-[#1A1D28] border border-white/10 rounded-2xl text-xs font-mono-tabular text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
                <span className="text-xs font-semibold text-white/80 block">
                  Motivation Vibe
                </span>
                <div className="space-y-2">
                  {VIBES.map((item) => {
                    const active = vibe === item.title;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setVibe(item.title)}
                        className={`w-full min-h-[54px] px-4 py-2.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                          active
                            ? 'bg-[#1A1D28] border-white/25'
                            : 'bg-[#1A1D28]/50 border-white/10 hover:border-white/20'
                        }`}
                        style={active ? { borderColor: theme.primary } : undefined}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="text-xs text-white/55">{item.preview}</p>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                          style={
                            active
                              ? { background: theme.gradientCss, color: '#fff' }
                              : { border: '1px solid rgba(255,255,255,0.25)' }
                          }
                        >
                          {active && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action CTA */}
      <div className="relative z-10 pt-6 space-y-2.5">
        {signupError && (
          <p className="text-xs text-rose-400 leading-relaxed px-1 text-center">
            {signupError}
          </p>
        )}
        {step < 4 ? (
          <button
            type="button"
            disabled={step === 1 && !name.trim()}
            onClick={handleNext}
            className="w-full min-h-[52px] rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: theme.gradientCss,
              boxShadow: `0 8px 24px ${theme.glow}`,
            }}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full min-h-[52px] rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
            style={{
              background: theme.gradientCss,
              boxShadow: `0 8px 28px ${theme.glow}`,
            }}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Architecting 7-Day Blueprint...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>Generate My Blueprint</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
