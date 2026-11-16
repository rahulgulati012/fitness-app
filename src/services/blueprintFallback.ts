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

function hydrateSplit(
  rawDays: RawDayTemplate[],
  fallbackSplit: WorkoutDay[],
  variationSeed = 0
): WorkoutDay[] {
  return rawDays.map((d, mapIdx) => {
    const fallbackDay = fallbackSplit[d.dayIndex] ?? fallbackSplit[mapIdx] ?? fallbackSplit[0];
    const mappedExercises: ExercisePlan[] = d.exercises.map((e, idx): ExercisePlan => {
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
    });

    let finalExercises = mappedExercises;
    if (!d.isRestDay) {
      if (finalExercises.length < 6 && fallbackDay) {
        const usedNames = new Set(finalExercises.map((ex) => ex.name.toLowerCase()));
        const extras = fallbackDay.exercises.filter(
          (ex) => !usedNames.has(ex.name.toLowerCase())
        );
        finalExercises = [...finalExercises, ...extras].slice(0, 6);
        while (finalExercises.length < 6 && fallbackDay.exercises.length > 0) {
          const nextEx = fallbackDay.exercises[finalExercises.length % fallbackDay.exercises.length];
          finalExercises.push({
            ...nextEx,
            id: `d${d.dayIndex}-v${variationSeed}-pad-${finalExercises.length}`,
          });
        }
      } else if (finalExercises.length > 6) {
        finalExercises = finalExercises.slice(0, 6);
      }
    }

    return {
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
      exercises: finalExercises,
    };
  });
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
  const deterministicSplit = buildVariedSplit(
    input.gender,
    input.goal,
    input.metrics.weightKg,
    seed
  );
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
        const hydrated = hydrateSplit(
          data.blueprint.split as RawDayTemplate[],
          deterministicSplit,
          seed
        );
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
    // Static hosts or offline: check optional Vite key or use rich multi-split engine
  }

  return {
    split: deterministicSplit,
    quotes: buildVariedQuotes(input.name, input.schedule.vibe, seed),
    source: 'kinetix-engine',
  };
}
