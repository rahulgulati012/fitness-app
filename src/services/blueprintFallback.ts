import type {
  BioSchedule,
  BodyMetrics,
  ExercisePlan,
  Gender,
  MotivationVibe,
  PhysiqueGoal,
  SetLog,
  WarmupDrill,
  WorkoutDay,
} from '../types/kinetix';
import { buildVariedQuotes, buildVariedSplit } from '../data/workoutEngine';

interface RawDayTemplate {
  dayIndex: number;
  dayLabel: string;
  title: string;
  targetMuscle: string;
  durationMin: number;
  isRestDay: boolean;
  warmupTitle: string;
  warmupDrills: { name: string; prescription: string }[];
  exercises: {
    name: string;
    muscle: string;
    cue: string;
    tempo: string;
    restSeconds: number;
    setsCount: number;
    targetReps: number;
    suggestedWeightKg: number;
  }[];
}

function makeSets(setsCount: number, weightKg: number, reps: number, prefix: string): SetLog[] {
  return Array.from({ length: setsCount }, (_, i) => ({
    id: `${prefix}-s${i + 1}`,
    setNumber: i + 1,
    weightKg,
    reps,
    completed: false,
  }));
}

function hydrateSplit(rawDays: RawDayTemplate[], variationSeed = 0): WorkoutDay[] {
  return rawDays.map((d) => ({
    dayIndex: d.dayIndex,
    dayLabel: d.dayLabel,
    title: d.title,
    targetMuscle: d.targetMuscle,
    durationMin: d.durationMin,
    isRestDay: d.isRestDay,
    warmupTitle: d.warmupTitle,
    warmupDrills: d.warmupDrills.map((w, idx): WarmupDrill => ({
      id: `d${d.dayIndex}-v${variationSeed}-w${idx}`,
      name: w.name,
      prescription: w.prescription,
      completed: false,
    })),
    exercises: d.exercises.map((e, idx): ExercisePlan => {
      const exId = `d${d.dayIndex}-v${variationSeed}-e${idx}`;
      return {
        id: exId,
        name: e.name,
        muscle: e.muscle,
        cue: e.cue,
        tempo: e.tempo,
        restSeconds: e.restSeconds,
        sets: makeSets(e.setsCount, e.suggestedWeightKg, e.targetReps, exId),
      };
    }),
  }));
}

export function buildFallbackQuotes(
  name: string,
  vibe: MotivationVibe,
  variationSeed = 0
): string[] {
  return buildVariedQuotes(name, vibe, variationSeed);
}

export function buildFallbackSplit(
  gender: Gender,
  goal: PhysiqueGoal,
  weightKg: number,
  variationSeed = 0
): WorkoutDay[] {
  return buildVariedSplit(gender, goal, weightKg, variationSeed);
}

export interface BlueprintGenerationInput {
  name: string;
  gender: Gender;
  goal: PhysiqueGoal;
  metrics: BodyMetrics;
  schedule: BioSchedule;
  variationSeed?: number;
  previousSplit?: WorkoutDay[];
}

export async function generateAthleteBlueprint(
  input: BlueprintGenerationInput
): Promise<{
  split: WorkoutDay[];
  quotes: string[];
  source: 'gemini-2.5-flash' | 'kinetix-engine';
}> {
  const seed = input.variationSeed ?? 0;
  const avoidExercises = (input.previousSplit ?? [])
    .flatMap((d) => d.exercises.map((e) => e.name))
    .slice(0, 16);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);

    const response = await fetch('/api/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        gender: input.gender,
        goal: input.goal,
        metrics: input.metrics,
        schedule: input.schedule,
        variationSeed: seed,
        avoidExercises,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (
        data?.ok &&
        data?.blueprint &&
        Array.isArray(data.blueprint.split) &&
        data.blueprint.split.length === 7 &&
        Array.isArray(data.blueprint.quotes) &&
        data.blueprint.quotes.length > 0
      ) {
        const hydrated = hydrateSplit(data.blueprint.split as RawDayTemplate[], seed);
        // Guarantee distinctness from previousSplit if regenerating
        const prevFirst = input.previousSplit?.[0]?.exercises?.[0]?.name;
        const nextFirst = hydrated[0]?.exercises?.[0]?.name;
        if (!prevFirst || prevFirst !== nextFirst || seed === 0) {
          return {
            split: hydrated,
            quotes: data.blueprint.quotes as string[],
            source: 'gemini-2.5-flash',
          };
        }
      }
    }
  } catch {
    // Static hosts (Netlify) or offline: check optional Vite key or use rich multi-split engine
  }

  // Optional static-host support if deployer sets VITE_GEMINI_API_KEY
  try {
    const viteKey =
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env
        ?.VITE_GEMINI_API_KEY;
    if (viteKey && viteKey !== 'MY_GEMINI_API_KEY' && viteKey.trim() !== '') {
      const firstName = input.name.trim().split(/\s+/)[0] || input.name.trim();
      const avoidLine =
        avoidExercises.length > 0
          ? ` Avoid repeating these previous exercises: ${avoidExercises.join(', ')}.`
          : '';
      const prompt = `Return ONLY valid JSON with keys "split" (7 objects dayIndex 0..6, dayLabel Mon..Sun, title, targetMuscle, durationMin, isRestDay, warmupTitle, warmupDrills[{name,prescription}], exercises[{name,muscle,cue,tempo,restSeconds,setsCount,targetReps,suggestedWeightKg}]) and "quotes" (20 strings addressing ${firstName}). Profile: gender=${input.gender}, goal=${input.goal}, height=${input.metrics.heightCm}cm, weight=${input.metrics.weightKg}kg, age=${input.metrics.age}, variationSeed=${seed}.${avoidLine}`;

      const restRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          viteKey.trim()
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (restRes.ok) {
        const restJson = await restRes.json();
        const text = restJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text === 'string' && text.trim()) {
          const parsed = JSON.parse(text.trim());
          if (
            Array.isArray(parsed.split) &&
            parsed.split.length === 7 &&
            Array.isArray(parsed.quotes) &&
            parsed.quotes.length > 0
          ) {
            const hydrated = hydrateSplit(parsed.split as RawDayTemplate[], seed);
            const prevFirst = input.previousSplit?.[0]?.exercises?.[0]?.name;
            const nextFirst = hydrated[0]?.exercises?.[0]?.name;
            if (!prevFirst || prevFirst !== nextFirst || seed === 0) {
              return {
                split: hydrated,
                quotes: parsed.quotes as string[],
                source: 'gemini-2.5-flash',
              };
            }
          }
        }
      }
    }
  } catch {
    // Smoothly proceed to rich deterministic engine below
  }

  return {
    split: buildVariedSplit(input.gender, input.goal, input.metrics.weightKg, seed),
    quotes: buildVariedQuotes(input.name, input.schedule.vibe, seed),
    source: 'kinetix-engine',
  };
}
