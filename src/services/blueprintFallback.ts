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
    const mappedExercises: ExercisePlan[] = (Array.isArray(d.exercises) ? d.exercises : []).map(
      (e, idx): ExercisePlan => {
        const exId = `d${d.dayIndex}-v${variationSeed}-e${idx}`;
        return {
          id: exId,
          name: e.name,
          muscle: e.muscle,
          cue: e.cue,
          tempo: e.tempo || '2-0-1-0',
          restSeconds: typeof e.restSeconds === 'number' ? e.restSeconds : 60,
          sets: makeSets(
            Math.max(1, Math.round(e.setsCount || 3)),
            Math.max(0, Number(e.suggestedWeightKg) || 0),
            Math.max(1, Math.round(e.targetReps || 10)),
            exId
          ),
        };
      }
    );

    const finalExercises =
      mappedExercises.length > 0
        ? mappedExercises
        : (fallbackDay?.exercises ?? []).slice(0, d.isRestDay ? 1 : 6);

    return {
      dayIndex: typeof d.dayIndex === 'number' ? d.dayIndex : mapIdx,
      dayLabel: d.dayLabel || fallbackDay?.dayLabel || `Day ${mapIdx + 1}`,
      title: d.title || fallbackDay?.title || `Day ${mapIdx + 1}`,
      targetMuscle: d.targetMuscle || fallbackDay?.targetMuscle || 'Full Body',
      durationMin: typeof d.durationMin === 'number' ? d.durationMin : 50,
      isRestDay: Boolean(d.isRestDay),
      warmupTitle: d.warmupTitle || fallbackDay?.warmupTitle || '5-Min Activation Warm-Up',
      warmupDrills: (Array.isArray(d.warmupDrills) ? d.warmupDrills : []).map(
        (w, idx): WarmupDrill => ({
          id: `d${d.dayIndex}-v${variationSeed}-w${idx}`,
          name: w.name,
          prescription: w.prescription,
          completed: false,
        })
      ),
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
  customInstruction?: string;
}

export async function generateAthleteBlueprint(
  input: BlueprintGenerationInput
): Promise<{
  split: WorkoutDay[];
  quotes: string[];
  source: 'gemini-2.5-flash' | 'kinetix-engine';
}> {
  const seed = input.variationSeed ?? 0;
  const customInstruction = input.customInstruction?.trim() || undefined;
  const deterministicSplit = buildVariedSplit(
    input.gender,
    input.goal,
    input.metrics.weightKg,
    seed,
    customInstruction
  );
  const avoidExercises = (input.previousSplit ?? [])
    .flatMap((d) => d.exercises.map((e) => e.name))
    .slice(0, 16);
  const currentSplitSummary = (input.previousSplit ?? []).map((d) => ({
    dayIndex: d.dayIndex,
    dayLabel: d.dayLabel,
    title: d.title,
    exercises: d.exercises.map((e) => e.name),
  }));

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);

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
        avoidExercises: customInstruction ? [] : avoidExercises,
        currentSplitSummary: customInstruction ? currentSplitSummary : undefined,
        customInstruction,
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
        if (customInstruction || seed === 0) {
          return {
            split: hydrated,
            quotes: data.blueprint.quotes as string[],
            source: 'gemini-2.5-flash',
          };
        }

        const prevSig = (input.previousSplit ?? [])
          .map((d) => d.exercises.map((e) => e.name).join('|'))
          .join('::');
        const nextSig = hydrated
          .map((d) => d.exercises.map((e) => e.name).join('|'))
          .join('::');
        if (!prevSig || prevSig !== nextSig) {
          return {
            split: hydrated,
            quotes: data.blueprint.quotes as string[],
            source: 'gemini-2.5-flash',
          };
        }
      }
    }
  } catch {
    // Static hosts or offline: fall back cleanly to local adaptive engine
  }

  return {
    split: deterministicSplit,
    quotes: buildVariedQuotes(input.name, input.schedule.vibe, seed),
    source: 'kinetix-engine',
  };
}
