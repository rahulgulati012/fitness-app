import type {
  ExercisePlan,
  Gender,
  MotivationVibe,
  PhysiqueGoal,
  SetLog,
  WarmupDrill,
  WorkoutDay,
} from '../types/kinetix';

interface ExerciseVariant {
  name: string;
  muscle: string;
  cue: string;
  tempo: string;
  restSeconds: number;
  setsCount: number;
  targetReps: number;
  baseWeightKg: number;
}

interface DayBlueprint {
  dayIndex: number;
  dayLabel: string;
  titleVariants: [string, string, string];
  targetMuscle: string;
  durationMin: number;
  isRestDay: boolean;
  warmupTitleVariants: [string, string, string];
  warmupPools: [
    { name: string; prescription: string }[],
    { name: string; prescription: string }[],
    { name: string; prescription: string }[],
  ];
  exerciseSlots: [ExerciseVariant, ExerciseVariant, ExerciseVariant][];
}

function roundWeight(val: number): number {
  if (val <= 0) return 0;
  return Math.max(2.5, Math.round(val / 2.5) * 2.5);
}

function makeSets(
  setsCount: number,
  weightKg: number,
  reps: number,
  prefix: string
): SetLog[] {
  return Array.from({ length: setsCount }, (_, i) => ({
    id: `${prefix}-s${i + 1}`,
    setNumber: i + 1,
    weightKg,
    reps,
    completed: false,
  }));
}

function ex(
  name: string,
  muscle: string,
  cue: string,
  tempo: string,
  restSeconds: number,
  setsCount: number,
  targetReps: number,
  baseWeightKg: number
): ExerciseVariant {
  return {
    name,
    muscle,
    cue,
    tempo,
    restSeconds,
    setsCount,
    targetReps,
    baseWeightKg,
  };
}

// ============================================================================
// FEMALE SPLITS: 5-DAY UPPER / LOWER HYPERTROPHY SPLITS (+ 2 RECOVERY DAYS)
// Heavily biased toward glute hypertrophy & hamstring development;
// Upper days emphasize back & shoulder toning without excessive chest volume.
// Every day includes TVA engagement + Stomach Vacuum work & progressive overload cues.
// ============================================================================

const FEMALE_HOURGLASS_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Lower A: Heavy Hip Thrusts & Glute Hypertrophy',
      'Lower A: Posterior Chain & Glute Max Focus',
      'Lower A: Glute Bridge Power & Hamstrings',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 55,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Glute Activation',
      '5-Min Deep Core & Posterior Primer',
      '5-Min Hip Mobility & TVA Brace',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s full-exhale holds' },
        { name: 'Banded Lateral Monster Walks', prescription: '2 x 16 steps each side' },
        { name: 'Bodyweight Frog Pumps', prescription: '2 x 20 controlled reps' },
        { name: '90/90 Hip Internal Rotations', prescription: '8 slow switches per side' },
      ],
      [
        { name: 'Quadruped TVA Draw-In & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Banded Clamshell Hold + Pulse', prescription: '2 x 20 per side' },
        { name: 'Single-Leg Glute Bridge March', prescription: '2 x 12 per leg' },
        { name: 'World Greatest Stretch', prescription: '6 reps per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Seated Banded Hip Abductions', prescription: '2 x 25 rapid reps' },
        { name: 'Quadruped Fire Hydrants', prescription: '2 x 15 per side' },
        { name: 'Knee-to-Wall Ankle Rocks', prescription: '10 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Hip Thrusts', 'Glute Max', 'Drive through heels, hold 1.5s lockout. Increase weight by 2.5kg when you hit max reps.', '2-1-1-1', 120, 4, 10, 75),
        ex('Smith Machine Kas Glute Bridge', 'Glute Max Isolation', 'Vertical shins, controlled top pause. Add 2.5kg once all sets hit 12 clean reps.', '2-2-1-0', 90, 4, 12, 70),
        ex('Single-Leg Barbell Hip Thrust', 'Unilateral Glutes', 'Keep pelvis level at lockout. Increase load by 2.5kg when hitting top target reps.', '2-1-1-1', 90, 3, 10, 40),
      ],
      [
        ex('Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Push hips straight back on 3s eccentric. Increase weight by 2.5kg when you hit max reps.', '3-1-1-0', 90, 4, 10, 50),
        ex('Dumbbell Romanian Deadlift (RDLs)', 'Hamstrings & Glute Tie-In', 'Shave legs smoothly to mid-shin. Add 2.5kg per hand once all sets hit 12 reps.', '3-1-1-0', 90, 4, 12, 16),
        ex('B-Stance Barbell RDL', 'Upper Glute Tie-In', '85% load on front heel. Increase weight by 2.5kg when target reps are mastered.', '3-1-1-0', 90, 3, 10, 45),
      ],
      [
        ex('Bulgarian Split Squats (Glute Bias)', 'Glutes & Quads', 'Long stride with 15° torso lean. Increase dumbbell weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 3, 10, 12.5),
        ex('Deficit Reverse Dumbbell Lunge', 'Glute Stretch & Quads', 'Step off 2-inch plate through heel. Add 2.5kg once all 3 sets hit 10 crisp reps.', '3-1-1-0', 75, 3, 10, 10),
        ex('Wide-Stance Smith Split Squat', 'Glutes & Adductors', 'Sink deeply into lead hip. Increase weight by 2.5kg when you reach max reps.', '3-1-1-0', 75, 3, 10, 35),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Control 3s eccentric return without lifting hips. Increase pin by 2.5kg at top reps.', '3-1-1-0', 60, 3, 12, 30),
        ex('Lying Hamstring Curl', 'Hamstrings', 'Keep hips pressed into pad with 1s peak squeeze. Add 2.5kg when hitting 12 reps.', '3-1-1-1', 60, 3, 12, 25),
        ex('45° Glute-Biased Back Extension', 'Upper Glutes & Hamstrings', 'Tuck chin, round upper back slightly, squeeze glutes. Progress by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('Seated Hip Abduction (Forward Lean)', 'Glute Medius', 'Hold peak stretch outward for 1s every rep. Add 2.5kg when all sets reach 18 reps.', '2-1-2-0', 60, 4, 18, 45),
        ex('Cable Glute Kickback (30° Outward)', 'Upper Glute Shelf', 'Sweep diagonally to match glute fibers. Progress load by 2.5kg once hitting 15 reps.', '2-1-1-1', 60, 3, 15, 12.5),
        ex('Cable Standing Hip Abduction', 'Glute Medius', 'Keep torso upright with smooth outward sweep. Add 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 15, 7.5),
      ],
      [
        ex('Standing Calf Raise', 'Calves & Ankle Stability', 'Full 2s bottom stretch, crisp top lockout. Increase weight by 2.5kg at 15 clean reps.', '2-2-1-1', 45, 3, 15, 25),
        ex('Dead Bug TVA Brace + Stomach Vacuum', 'Transverse Abdominis', 'Press lumbar spine flat and exhale completely; zero oblique bulk. Extend hold by 5s weekly.', '3-1-2-0', 45, 3, 12, 0),
        ex('Weighted Dumbbell Frog Pump', 'Glute Medius & Max', 'Soles together, 1s peak squeeze. Add 2.5kg once 22 unbroken reps feel controlled.', '1-1-1-0', 45, 3, 22, 16),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Upper A: Back Width, Delts & Posture',
      'Upper A: Lat Sweep & Capped Shoulders',
      'Upper A: Upper Back Tone & TVA Core',
    ],
    targetMuscle: 'Upper Body · Back, Shoulders & Arms',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Thoracic Prep',
      '5-Min Scapular & Stomach Vacuum Primer',
      '5-Min Shoulder Mobility & Deep Core',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s full-exhale holds' },
        { name: 'Open-Book Thoracic Rotations', prescription: '8 per side' },
        { name: 'Scapular Lat Pull-Downs', prescription: '2 x 12 slow holds' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Wall Angel Shoulder Slides', prescription: '2 x 12 reps' },
        { name: 'Band External Rotations', prescription: '12 per arm' },
        { name: 'Dead Bug Core Bracing', prescription: '12 controlled reps' },
      ],
      [
        { name: 'Seated Stomach Vacuum & Breath Brace', prescription: '3 x 20s holds' },
        { name: 'Foam Roller Thoracic Extension', prescription: '10 slow glides' },
        { name: 'Straight-Arm Band Pulldowns', prescription: '2 x 15 light reps' },
        { name: 'Arm Circles + Cuff Warm-Up', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Wide-Grip Lat Pulldown', 'Latissimus Dorsi', 'Drive elbows toward hips to frame waist taper. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 12, 35),
        ex('Assisted Wide-Grip Pull-Up', 'Upper Lat Width', 'Pull collarbone toward bar without shrugging. Reduce assistance by 2.5kg at top reps.', '3-1-1-0', 90, 4, 10, 25),
        ex('Single-Arm Kneeling Lat Pulldown', 'Outer Lat Sweep', 'Keep torso stacked tall and drive elbow to hip. Add 2.5kg when all sets reach 12 reps.', '2-1-2-0', 60, 3, 12, 17.5),
      ],
      [
        ex('Chest-Supported Cable Row', 'Mid-Back & Posture', 'Pinch shoulder blades cleanly for 1s peak hold. Increase load by 2.5kg at 14 clean reps.', '2-1-1-1', 60, 4, 14, 27.5),
        ex('Seated Neutral-Grip Cable Row', 'Mid-Back Tone', 'Keep ribcage tall; pull handles to lower ribs. Add 2.5kg once hitting max reps.', '2-1-1-1', 60, 4, 12, 27.5),
        ex('Single-Arm Dumbbell Row', 'Lats & Mid-Back', 'Sweep elbow back toward hip pocket. Increase dumbbell by 2.5kg when hitting 12 reps.', '2-1-1-0', 60, 3, 12, 12.5),
      ],
      [
        ex('Seated Dumbbell Shoulder Press', 'Deltoids', 'Keep elbows 30° forward; zero lumbar arch. Increase weight by 2.5kg when hitting max reps.', '2-1-1-0', 90, 3, 12, 10),
        ex('Arnold Dumbbell Press', '3D Shoulders', 'Smooth rotation overhead keeping traps relaxed. Add 2.5kg once all sets hit 12 reps.', '2-1-1-0', 90, 3, 12, 8),
        ex('Machine Shoulder Press', 'Deltoid Tone', 'Controlled 3s lowering phase. Increase stack by 2.5kg when reaching 12 clean reps.', '3-1-1-0', 75, 3, 12, 20),
      ],
      [
        ex('Behind-the-Back Cable Lateral Raise', 'Side Deltoids', 'Sweep outward in scapular plane to tone shoulders. Add 2.5kg when reaching 15 clean reps.', '2-1-2-0', 60, 4, 15, 5),
        ex('Seated Dumbbell Lateral Raise', 'Side Delts', 'Pause 1s at shoulder height without shrugging. Increase weight once 15 reps are effortless.', '2-1-1-1', 60, 4, 15, 6),
        ex('Machine Lateral Raise', 'Medial Delts', 'Control 3s descent every rep. Increase stack by 2.5kg when hitting max reps.', '3-1-1-0', 60, 4, 15, 17.5),
      ],
      [
        ex('Rope Face Pull (Thumbs Back)', 'Rear Delts & Posture', 'Pull rope beside ears with external rotation. Add 2.5kg when hitting 15 controlled reps.', '2-1-1-1', 60, 3, 15, 15),
        ex('Reverse Pec-Deck Rear Delt Fly', 'Posterior Delts', 'Sweep wide keeping shoulders depressed. Increase weight by 2.5kg at top target reps.', '2-1-1-1', 60, 3, 15, 22.5),
        ex('Straight-Arm Cable Pulldown', 'Lats & Upper Posture', 'Sweep bar smoothly to thighs with ribs tucked. Add 2.5kg once 14 reps are solid.', '2-1-1-1', 60, 3, 14, 20),
      ],
      [
        ex('Rope Tricep Pushdown + Incline Curl', 'Toned Arms', 'Pin elbows beside ribs; full contraction. Increase weight by 2.5kg at max reps.', '2-1-1-1', 45, 3, 14, 15),
        ex('Overhead Cable Tricep Extension', 'Tricep Long Head', 'Deep overhead stretch without flaring ribs. Add 2.5kg when hitting 14 clean reps.', '2-1-1-0', 45, 3, 14, 15),
        ex('Dead Bug + Stomach Vacuum Hold', 'TVA Waistline', 'Draw navel inward without oblique bulk; increase vacuum duration by 5s weekly.', '3-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Active Recovery: TVA Vacuum & Step Flow',
      'Active Recovery: Posture Walk & Deep Core',
      'Active Recovery: Hip Mobility & Lymphatic Reset',
    ],
    targetMuscle: 'Active Recovery & TVA',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Spinal Release',
      '5-Min Hip & Thoracic Unwind',
      '5-Min Breath & Posture Reset',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Series', prescription: '4 x 20s full-exhale holds' },
        { name: 'Cat-Cow Spinal Wave', prescription: '10 slow breaths' },
        { name: 'Couch Hip Flexor Stretch', prescription: '45s per side' },
      ],
      [
        { name: 'Quadruped TVA Engagement Holds', prescription: '4 x 20s holds' },
        { name: 'Pigeon Glute Release', prescription: '60s per side' },
        { name: 'Thoracic Foam Roll', prescription: '90s gentle glide' },
      ],
      [
        { name: 'Seated TVA Rib-Tuck Vacuums', prescription: '4 x 20s holds' },
        { name: 'Child Pose Lat Reach', prescription: '45s each side' },
        { name: 'Box Breathing Reset', prescription: '4 cycles' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Treadmill Recovery Walk', 'Aerobic Recovery', '5–6% incline, upright posture; increase pace slightly week over week without CNS fatigue.', 'Steady', 60, 1, 25, 0),
        ex('Outdoor Daylight Step Walk', 'NEAT Conditioning', 'Keep strides smooth to clear lower-body soreness and lock in daily step goal.', 'Steady', 60, 1, 30, 0),
        ex('Zone-2 Stair Climber (Easy)', 'Glute Blood Flow', 'Light steady step cadence keeping heart rate conversational.', 'Steady', 60, 1, 20, 0),
      ],
      [
        ex('Supine TVA Stomach Vacuum + Dead Bug', 'Transverse Abdominis', 'Exhale fully, draw navel inward toward spine; increase hold by 5s weekly.', '20s Hold', 45, 4, 1, 0),
        ex('Bird-Dog Anti-Rotation Hold', 'Deep Core Stability', 'Extend opposite arm and leg keeping pelvis dead square.', '3s Hold', 45, 3, 10, 0),
        ex('Hollow-Body Breath Hold', 'Deep Core Control', 'Tuck ribs downward with calm nasal breathing.', '25s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Lower B: RDLs, Split Squats & Posterior Chain',
      'Lower B: Unilateral Glutes & Hamstring Density',
      'Lower B: Glute Medius & Hinge Strength',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 55,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Unilateral Hip Prep',
      '5-Min Glute Stabilizer & Stomach Vacuum',
      '5-Min Hinge & Knee Mobility Primer',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s full-exhale holds' },
        { name: 'Banded Seated Hip Abductions', prescription: '2 x 25 pulses' },
        { name: 'Single-Leg Romanian Hinge Reach', prescription: '8 per side' },
        { name: 'Knee-to-Wall Ankle Rocks', prescription: '10 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Side-Lying Leg Raises', prescription: '2 x 15 per side' },
        { name: 'Split Squat Isometric Hold', prescription: '20s each leg' },
        { name: 'Cossack Squat Shifts', prescription: '10 slow transitions' },
      ],
      [
        { name: 'Quadruped TVA Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Banded Standing Kickbacks', prescription: '2 x 15 per leg' },
        { name: 'Goblet Squat Bottom Pry', prescription: '30s stretch' },
        { name: 'Glute Bridge Single-Leg Hold', prescription: '20s per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Bulgarian Split Squats', 'Glutes & Quads', 'Long stance, slight forward lean, drive through heel. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 10, 12.5),
        ex('Deficit Dumbbell Step-Up', 'Upper Glute Max', 'Zero push-off from trailing foot. Add 2.5kg once all sets reach 10 controlled reps.', '2-1-1-0', 90, 3, 10, 10),
        ex('Glute-Biased Walking Lunge', 'Glutes & Legs', 'Long stride pushing through front heel. Increase dumbbell load by 2.5kg at top reps.', '2-0-1-0', 90, 3, 12, 10),
      ],
      [
        ex('Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Hinge until hips stop traveling back; 3s descent. Increase weight by 2.5kg at max reps.', '3-1-1-0', 90, 4, 10, 50),
        ex('B-Stance Dumbbell RDL', 'Hamstring Tie-In & Glutes', 'Load front hamstring cleanly. Increase weight by 2.5kg once 12 clean reps are hit.', '3-1-1-0', 90, 3, 12, 14),
        ex('Cable Glute Pull-Through', 'Glutes & Hamstrings', 'Long arms, snap hips tall into glute squeeze. Add 2.5kg when hitting 15 reps.', '2-1-1-1', 60, 4, 15, 25),
      ],
      [
        ex('45° High-Foot Leg Press', 'Glutes & Hamstrings', 'Feet high and shoulder-width; keep heels pinned. Add 5kg when all sets hit 12 reps.', '3-1-1-0', 90, 4, 12, 85),
        ex('Sumo Smith Machine Squat', 'Inner Thighs & Glutes', 'Wide stance, knees track over toes. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 12, 50),
        ex('Dumbbell Sumo Squat on Blocks', 'Glutes & Adductors', 'Deep stretch between blocks with upright torso. Add 2.5kg at top target reps.', '3-1-1-0', 90, 4, 12, 22),
      ],
      [
        ex('45° Glute-Biased Back Extension', 'Upper Glutes & Hamstrings', 'Round upper back subtly, flare toes 30°. Increase plate by 2.5kg when hitting 15 reps.', '2-1-1-1', 60, 3, 15, 10),
        ex('Lying Hamstring Curl', 'Hamstrings', 'Glue hips down; 3s controlled lowering. Increase pin by 2.5kg at top reps.', '3-1-1-0', 60, 3, 12, 25),
        ex('Seated Leg Curl', 'Hamstrings', 'Full stretch at top, 1s squeeze at bottom. Add 2.5kg once all sets hit 12 reps.', '3-1-1-1', 60, 3, 12, 30),
      ],
      [
        ex('Seated Hip Abduction Machine', 'Glute Medius Shelf', 'Control 2s return without slamming stack. Increase weight by 2.5kg at 18 clean reps.', '2-1-2-0', 60, 4, 18, 45),
        ex('Cable Glute Kickback', 'Upper Glute Shelf', 'Keep standing leg soft and pelvis square. Add 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 15, 12.5),
        ex('Hip Adductor Machine', 'Inner Thigh Sculpt', 'Full controlled stretch open and strong squeeze. Increase load by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 35),
      ],
      [
        ex('Standing Single-Leg Calf Raise', 'Calves & Balance', 'Full 2s bottom stretch every rep. Increase weight by 2.5kg when hitting 15 reps.', '2-2-1-1', 45, 3, 15, 10),
        ex('Pilates Leg Lowering + TVA Vacuum', 'Deep Lower Abs', 'Glue lower spine to mat on every descent; maintain TVA vacuum tension.', '3-1-1-0', 45, 3, 14, 0),
        ex('Hollow-Body Breath Hold', 'Transverse Abdominis', 'Draw ribs down cleanly; progress hold time by 5s each week.', '30s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Upper B: Sculpted Back, Rear Delts & Arms',
      'Upper B: Shoulder Toning & Upper Back Density',
      'Upper B: Posture Taper & Capped Delts',
    ],
    targetMuscle: 'Upper Body · Back, Shoulders & Arms',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Primer',
      '5-Min Scapular Flow & Stomach Vacuum',
      '5-Min Upper Posture & Cuff Activation',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s full-exhale holds' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Thread-the-Needle Rotations', prescription: '8 per side' },
        { name: 'Light Y-T Shoulder Raises', prescription: '2 x 10 reps' },
      ],
      [
        { name: 'Quadruped TVA Engagement & Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band External Rotations', prescription: '15 per arm' },
        { name: 'Thoracic Wall Extensions', prescription: '10 reps' },
        { name: 'Inverted Body Rows (Easy)', prescription: '12 primer reps' },
      ],
      [
        { name: 'Supine Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Light Band Dislocates', prescription: '12 slow passes' },
        { name: 'Face Pulls (Light Band)', prescription: '15 reps' },
        { name: 'Wall Angel Slides', prescription: '12 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Assisted Pull-Up / Neutral Pulldown', 'Lat Width & Posture', 'Full overhead stretch, pull chest cleanly to bar. Progress by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 10, 32.5),
        ex('Underhand Chin-Up / Reverse Pulldown', 'Lats & Biceps', 'Drive elbows smoothly downward toward ribs. Increase weight by 2.5kg at top reps.', '3-1-1-0', 90, 4, 10, 32.5),
        ex('TRX / Inverted Body Row', 'Upper Back & Core', 'Keep torso rigid; elevate feet or add vest when 14 reps feel easy.', '2-1-1-1', 60, 4, 12, 0),
      ],
      [
        ex('Chest-Supported Dumbbell Row', 'Upper Back & Traps', 'Pull elbows toward hips and hold 1s squeeze. Add 2.5kg when all sets hit 12 reps.', '2-1-1-1', 60, 4, 12, 12.5),
        ex('Seated Wide-Handle Cable Row', 'Mid-Back & Rear Delts', 'Draw elbows wide to align shoulder posture. Increase stack by 2.5kg at max reps.', '2-1-1-1', 60, 3, 14, 25),
        ex('Straight-Arm Cable Pulldown', 'Outer Lats & Serratus', 'Keep arms long and sweep to thighs. Add 2.5kg once 15 clean reps are met.', '2-1-1-1', 60, 3, 15, 20),
      ],
      [
        ex('Cable Lateral Raise', 'Side Deltoids', 'Sweep outward smoothly without shrugging traps. Increase weight when hitting 15 clean reps.', '2-1-1-0', 60, 4, 15, 5),
        ex('Dumbbell Lateral Raise (1.5 Reps)', 'Side Delts', 'Raise to shoulder height, dip halfway, raise again. Progress load when 12 reps feel crisp.', '2-1-1-0', 60, 4, 12, 5),
        ex('Dumbbell Upright Row (Wide)', 'Side & Rear Delts', 'Lead with elbows to sternum height. Add 2.5kg once hitting 14 controlled reps.', '2-1-1-0', 60, 3, 14, 8),
      ],
      [
        ex('Incline Dumbbell Y-Raise', 'Rear Delts & Lower Traps', 'Chest on 30° bench, lift thumbs into Y posture. Progress load slowly once 14 reps are smooth.', '2-1-1-1', 60, 3, 14, 4),
        ex('Cable Rear Delt Cross-Pull', 'Posterior Delts', 'Pull diagonally downward across body. Increase weight by 2.5kg when hitting 15 reps.', '2-1-1-1', 60, 3, 15, 5),
        ex('Cable Face Pulls', 'Rear Delts & Rotator Cuff', 'Spread rope beside ears for balanced shoulder line. Add 2.5kg at top target reps.', '2-1-1-1', 60, 3, 15, 15),
      ],
      [
        ex('Kneeling Single-Arm Landmine Press', 'Shoulders & Core', 'Ribs stacked over hips; press smoothly overhead. Add 2.5kg when hitting 12 clean reps.', '2-1-1-0', 60, 3, 12, 15),
        ex('Seated Dumbbell Shoulder Press', 'Deltoids', 'Smooth overhead lockout without arching lower back. Increase weight by 2.5kg at max reps.', '2-1-1-0', 75, 3, 12, 9),
        ex('Incline Push-Up (Posture Control)', 'Chest & Serratus Support', 'Light posture work only; 3s eccentric keeping core tight. Lower incline as reps hit 15.', '3-1-1-0', 60, 3, 12, 0),
      ],
      [
        ex('Dumbbell Hammer Curl + Rope Pushdown', 'Toned Arms Superset', 'Keep upper arms pinned motionless. Increase weight by 2.5kg when hitting max reps.', '2-1-1-1', 45, 3, 14, 8),
        ex('Incline Dumbbell Curl', 'Biceps', 'Full stretch behind torso without swinging. Progress dumbbell weight once hitting 14 reps.', '2-1-1-0', 45, 3, 14, 7),
        ex('Pallof Anti-Rotation Press + Vacuum', 'TVA Core Tightness', 'Press straight out resisting rotation; zero oblique hypertrophy. Add 2.5kg at 12 reps.', '2-2-2-0', 45, 3, 12, 10),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Lower C: Hip Thrusts, RDLs & Glute Shelf',
      'Lower C: High-Volume Glutes & Hamstring Sculpt',
      'Lower C: Posterior Sweep & Unilateral Glutes',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Glute Firing',
      '5-Min Hip Capsule & Stomach Vacuum Prep',
      '5-Min Posterior Chain Activation',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s full-exhale holds' },
        { name: 'Banded Frog Bridges', prescription: '2 x 20 reps' },
        { name: 'Banded Good Mornings', prescription: '2 x 15 reps' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
        { name: 'Bodyweight Split Squats', prescription: '10 per leg' },
        { name: 'Ankle Dorsiflexion Rocks', prescription: '10 per side' },
      ],
      [
        { name: 'Quadruped Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Banded Clamshells', prescription: '2 x 20 per side' },
        { name: 'Single-Leg Hinge Reach', prescription: '8 per leg' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Smith Machine Hip Thrusts (1.5 Reps)', 'Glute Max', 'Full thrust, drop halfway, lock back out. Increase weight by 2.5kg when hitting max reps.', '2-1-1-1', 120, 4, 10, 65),
        ex('Barbell Glute Bridge (Feet Close)', 'Glute Max & Tie-In', 'Hover bar above floor without resting between reps. Add 2.5kg once hitting 12 clean reps.', '2-1-1-1', 90, 4, 12, 70),
        ex('Barbell Hip Thrusts', 'Glute Max', 'Tuck chin, drive heels hard, pause 1s at top. Increase weight by 2.5kg at top reps.', '2-1-1-1', 120, 4, 10, 75),
      ],
      [
        ex('Dumbbell Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Glide dumbbells down shins; stop when hips stop hinging. Add 2.5kg at max reps.', '3-1-1-0', 90, 4, 12, 16),
        ex('Barbell Good Morning (Controlled)', 'Hamstrings & Glutes', 'Push hips far back with soft knees. Increase bar weight by 2.5kg at 12 clean reps.', '3-1-1-0', 90, 3, 12, 30),
        ex('Single-Leg Landmine / DB RDL', 'Unilateral Glutes & Hamstrings', 'Square hips toward floor; drive through heel. Add 2.5kg when hitting 10 reps per leg.', '3-1-1-0', 90, 3, 10, 14),
      ],
      [
        ex('Bulgarian Split Squats (Tempo)', 'Glutes & Quads', '3s slow lowering, crisp drive through front heel. Increase weight by 2.5kg at max reps.', '3-1-1-0', 75, 3, 10, 12.5),
        ex('Elevated Kettlebell Sumo Squat', 'Glutes & Inner Thighs', 'Deep stretch between platforms. Add 2kg–2.5kg once all sets hit 14 reps cleanly.', '3-1-1-0', 75, 4, 14, 20),
        ex('Curtsy Lunge (Slow Eccentric)', 'Glute Medius & Quads', 'Control 3s descent keeping hips facing forward. Increase weight by 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 10),
      ],
      [
        ex('Seated Single-Leg Curl', 'Hamstrings', 'Full top stretch, strong 1s squeeze at bottom. Increase load by 2.5kg at 12 reps.', '2-1-1-1', 60, 3, 12, 20),
        ex('Cable Glute Pull-Through (High Rep)', 'Glutes & Hamstrings', 'Deep hip hinge and strong glute lockout. Add 2.5kg when hitting 16 reps cleanly.', '2-1-1-1', 60, 3, 16, 22.5),
        ex('45° Hyperextension (Glute Focus)', 'Upper Glutes', 'Round upper back subtly and drive via glutes. Progress plate by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('Cable Glute Kickback (Straight Back)', 'Glute Shelf', 'Soft standing knee, square pelvis. Increase stack by 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 15, 12.5),
        ex('Machine Seated Hip Abduction', 'Glute Medius', '15 upright + 15 forward-lean controlled reps. Add 2.5kg once 20 reps feel steady.', '1-1-1-0', 45, 3, 20, 45),
        ex('Banded Dumbbell Frog Pump', 'Glute Pump Finisher', 'Soles pressed together, crisp 1s lockout. Increase dumbbell by 2.5kg at 25 reps.', '1-1-1-0', 45, 3, 25, 15),
      ],
      [
        ex('Standing Calf & Tibialis Raise', 'Calves & Ankle Balance', 'Full bottom stretch, 1s top pause. Increase weight by 2.5kg when hitting 16 reps.', '2-1-1-1', 45, 3, 16, 20),
        ex('Dead Bug Transverse Brace', 'TVA Waistline', 'Exhale ribs downward completely; progress slow tempo control each week.', '3-1-1-0', 45, 3, 14, 0),
        ex('Supine TVA Stomach Vacuum Hold', 'Transverse Abdominis', 'Full exhale drawing navel to spine; extend hold by 5s when 20s feels easy.', '20s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Complete CNS Reset & Hydration',
      'Day 7: Restorative Mobility & Sleep Bank',
      'Day 7: Recovery Walk & Stretch Flow',
    ],
    targetMuscle: 'Rest & Recovery',
    durationMin: 25,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Breath & Lymphatic Flow',
      '5-Min Full-Body Stretch Sequence',
      '5-Min Deep Recovery Breathwork',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Breath', prescription: '3 x 20s gentle holds' },
        { name: 'Pigeon Glute Release', prescription: '60s per side' },
        { name: 'Thoracic Foam Roller Extension', prescription: '90s gentle glide' },
      ],
      [
        { name: 'Seated Stomach Vacuum & Nasal Breath', prescription: '3 x 20s holds' },
        { name: 'Supine Spinal Twist', prescription: '45s per side' },
        { name: 'Hamstring Strap Stretch', prescription: '45s per leg' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Child Pose Lat Reach', prescription: '60s' },
        { name: 'Hip Flexor Kneeling Stretch', prescription: '45s per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor Daylight Recovery Walk', 'Metabolic Baseline', 'Relaxed nasal breathing while hitting daily step target.', 'Easy Pace', 60, 1, 30, 0),
        ex('Evening Zone-2 Stroll', 'Active Recovery', 'Unplug from screens and prepare for 8.5h restorative sleep.', 'Easy Pace', 60, 1, 25, 0),
        ex('Mobility Flow & Light Walk', 'Circulation', 'Gentle 20-minute movement to flush lower-body stiffness.', 'Easy Pace', 60, 1, 20, 0),
      ],
    ],
  },
];

const FEMALE_ATHLETIC_TONED_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Lower A: Hip Thrusts, Squats & Glute Power',
      'Lower A: Athletic Lower Body & Hamstrings',
      'Lower A: Squat Strength & Posterior Sculpt',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Athletic Hip Primer',
      '5-Min Stomach Vacuum & Dynamic Lower Prep',
      '5-Min Mobility & Glute Activation',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
        { name: 'Glute Bridge Pulses', prescription: '2 x 20 reps' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Cossack Squat Shifts', prescription: '10 controlled reps' },
        { name: 'Ankle Dorsiflexion Rocks', prescription: '10 per ankle' },
        { name: 'Low-Impact Pogo Hops', prescription: '2 x 20s' },
      ],
      [
        { name: 'Quadruped Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Inchworm to Plank', prescription: '8 slow reps' },
        { name: 'Bodyweight Split Squats', prescription: '10 per leg' },
        { name: 'Single-Leg Glute Bridges', prescription: '12 per leg' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Hip Thrusts', 'Glute Max', 'Explosive hip lockout, chin tucked. Increase weight by 2.5kg when you hit max reps.', '2-1-1-1', 90, 4, 10, 65),
        ex('Dumbbell Hip Thrust', 'Glutes', 'Pause 1s at full extension. Add 2.5kg once all 4 sets hit 15 controlled reps.', '2-1-1-1', 60, 4, 15, 26),
        ex('Kettlebell Swing', 'Posterior Chain Power', 'Snap hips forcefully with braced core. Step up bell weight when 18 reps feel crisp.', 'Explosive', 60, 4, 18, 16),
      ],
      [
        ex('Heel-Elevated Goblet Squat', 'Quads & Glutes', 'Upright chest, deep knee travel. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 12, 18),
        ex('Barbell Front Squat', 'Quads, Glutes & Core', 'Elbows high, brace core hard. Add 2.5kg once all sets hit 8 clean reps.', '3-1-1-0', 120, 4, 8, 40),
        ex('Hack Squat (Athletic Stance)', 'Quads & Glutes', '3s controlled lowering to full depth. Increase plates by 2.5kg at top reps.', '3-1-1-0', 90, 4, 10, 60),
      ],
      [
        ex('Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Shave legs with bar; drive hips forward. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 10, 45),
        ex('Single-Leg Dumbbell RDL', 'Hamstrings & Balance', 'Square pelvis toward floor. Add 2.5kg once hitting 10 reps per leg cleanly.', '3-1-1-0', 75, 3, 10, 12.5),
        ex('Lying Leg Curl', 'Hamstrings', 'Keep hips glued flat; 3s return. Increase stack by 2.5kg at 12 clean reps.', '3-1-1-0', 60, 3, 12, 25),
      ],
      [
        ex('Bulgarian Split Squats', 'Glutes & Legs', '3s eccentric, drive through front heel. Increase weight by 2.5kg at max reps.', '3-1-1-0', 90, 3, 10, 12.5),
        ex('Dumbbell Box Step-Up', 'Glutes & Quads', 'Control descent for 2 full seconds. Add 2.5kg once hitting 10 reps per side.', '2-1-2-0', 60, 3, 10, 10),
        ex('Alternating Reverse Lunge', 'Unilateral Legs', 'Drop back knee softly; drive through front foot. Increase weight by 2.5kg at max reps.', '2-1-1-0', 60, 3, 12, 10),
      ],
      [
        ex('Seated Hip Abduction', 'Glute Medius', 'Hold peak outward pause for 1s. Increase load by 2.5kg when hitting 16 reps.', '2-1-1-1', 45, 3, 16, 40),
        ex('Cable Glute Kickback', 'Upper Glutes', 'Smooth leg sweep with braced hips. Add 2.5kg once 15 clean reps are met.', '2-1-1-1', 45, 3, 15, 10),
        ex('Seated Leg Curl', 'Hamstrings', 'Control 3s return every rep. Increase pin by 2.5kg when hitting max reps.', '3-1-1-0', 60, 3, 12, 30),
      ],
      [
        ex('Standing Single-Leg Calf Raise', 'Calves & Ankle Power', 'Full bottom stretch; crisp drive. Increase weight by 2.5kg at 15 clean reps.', '2-2-1-1', 45, 3, 15, 10),
        ex('Ab-Wheel Rollout + TVA Brace', 'Anti-Extension Core', 'Keep ribs tucked tight without lumbar sag; add 2 reps each session.', '3-1-1-0', 60, 3, 12, 0),
        ex('Farmer Dumbbell Walk', 'Grip & Core Stability', 'Walk tall with packed shoulders. Increase weight by 2.5kg once 30s feels light.', '30s Walk', 45, 3, 1, 14),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Upper A: Athletic Back, Delts & Arms',
      'Upper A: Shoulder Toning & Pull Density',
      'Upper A: Defined Upper Back & Core',
    ],
    targetMuscle: 'Upper Body · Back, Shoulders & Arms',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Prep',
      '5-Min Scapular & Stomach Vacuum Activation',
      '5-Min Upper Joint Mobility & TVA Brace',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Scapular Pulls', prescription: '2 x 12 reps' },
        { name: 'Thread-the-Needle Rotations', prescription: '8 per side' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band External Rotations', prescription: '15 per arm' },
        { name: 'Inverted Body Rows (Easy)', prescription: '12 primer reps' },
        { name: 'Thoracic Wall Extensions', prescription: '10 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Light Band Dislocates', prescription: '12 slow passes' },
        { name: 'Face Pulls (Light)', prescription: '15 reps' },
        { name: 'Wall Slides', prescription: '12 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Cable Lat Pulldown (Medium Grip)', 'Back & Posture', 'Pull smoothly to collarbone with proud chest. Increase weight by 2.5kg when hitting max reps.', '2-1-1-0', 60, 4, 12, 32.5),
        ex('TRX / Inverted Body Row', 'Mid-Back & Arms', 'Keep body rigid like steel. Lower body angle or add vest when hitting 14 reps.', '2-1-1-0', 60, 4, 12, 0),
        ex('Chest-Supported Dumbbell Row', 'Upper Back', 'Pull elbows toward hips and hold 1s squeeze. Add 2.5kg at 12 clean reps.', '2-1-1-1', 60, 4, 12, 12.5),
      ],
      [
        ex('Arnold Dumbbell Press', 'Shoulders', 'Rotate smoothly through press without shrugging. Increase weight by 2.5kg at max reps.', '2-1-1-0', 60, 4, 12, 9),
        ex('Seated Dumbbell Shoulder Press', 'Deltoids', 'Control elbows 30° forward; zero back arch. Add 2.5kg when hitting 12 clean reps.', '2-1-1-0', 60, 4, 12, 10),
        ex('Single-Arm Landmine Press', 'Shoulders & Core', 'Brace ribs down and press upward cleanly. Increase bar load by 2.5kg at top reps.', '2-1-1-0', 60, 3, 12, 15),
      ],
      [
        ex('Dumbbell Lateral Raise', 'Side Delts', 'Soft elbow bend, lead with outer wrist. Increase weight when hitting 15 clean reps.', '2-1-1-0', 60, 3, 15, 6),
        ex('Cable Lateral Raise', 'Side Deltoids', 'Constant tension sweeping outward. Add 2.5kg when hitting max reps cleanly.', '2-1-1-0', 60, 3, 15, 5),
        ex('Cable Face Pulls', 'Rear Delts', 'Spread rope beside ears for strong posture. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 15),
      ],
      [
        ex('Seated Cable Row (Wide Handle)', 'Upper Back & Rear Delts', 'Pull smoothly without leaning back. Increase weight by 2.5kg at 14 clean reps.', '2-1-1-1', 60, 3, 14, 27.5),
        ex('Straight-Arm Cable Pulldown', 'Lats & Serratus', 'Sweep down to thighs keeping core tight. Add 2.5kg once hitting 14 reps.', '2-1-1-1', 60, 3, 14, 20),
        ex('Incline Dumbbell Rear Delt Raise', 'Posterior Delts', 'Sweep arms wide at 45° angle. Increase weight when 15 reps feel steady.', '2-1-1-0', 60, 3, 15, 5),
      ],
      [
        ex('Rope Tricep Pushdown + Hammer Curl', 'Arms Superset', 'Zero elbow drift; full contraction. Increase weight by 2.5kg when hitting max reps.', '2-1-1-0', 60, 3, 14, 15),
        ex('Overhead Cable Tricep Extension', 'Triceps', 'Deep stretch behind head; smooth lockout. Add 2.5kg at 12 clean reps.', '3-1-1-0', 60, 3, 12, 15),
        ex('Alternating Dumbbell Bicep Curl', 'Biceps', 'Control 2s descent every rep. Increase dumbbell by 2.5kg once 12 reps are solid.', '2-1-2-0', 60, 3, 12, 8),
      ],
      [
        ex('Pallof Anti-Rotation Press', 'Athletic TVA Core', 'Press straight out resisting twist. Increase weight by 2.5kg when hitting max reps.', '2-2-2-0', 45, 3, 12, 12.5),
        ex('Dead Bug Extended Hold', 'Deep Core Stability', 'Press lumbar spine flat into mat; extend hold duration each week.', '2-1-1-0', 45, 3, 14, 0),
        ex('Hollow-Body Stomach Vacuum Hold', 'TVA Core', 'Tuck ribs downward cleanly; add 5s per week.', '30s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Active Recovery: Zone-2 Walk & TVA Core',
      'Active Recovery: Mobility Flow & Vacuum Holds',
      'Active Recovery: Joint Reset & Step Floor',
    ],
    targetMuscle: 'Active Recovery & TVA',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Mobility Reset',
      '5-Min Hip & Shoulder Unwind',
      '5-Min Breath & Posture Flow',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Series', prescription: '4 x 20s holds' },
        { name: 'Hip 90/90 Flow', prescription: '8 transitions' },
        { name: 'Doorway Chest Opener', prescription: '45s' },
      ],
      [
        { name: 'Quadruped TVA Engagement Holds', prescription: '4 x 20s holds' },
        { name: 'Cat-Cow Spine Wave', prescription: '10 reps' },
        { name: 'Calf & Ankle Stretch', prescription: '45s per side' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Pigeon Stretch', prescription: '60s per side' },
        { name: 'Thoracic Rotation', prescription: '8 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Brisk Outdoor Step Session', 'NEAT & Recovery', 'Rhythmic arm swing and tall posture to maintain daily step floor.', 'Steady', 60, 1, 30, 0),
        ex('Zone-2 Stationary Bike Spin', 'Active Flush', '85–95 RPM easy cadence to flush lower-body fatigue.', 'Steady', 60, 1, 25, 0),
        ex('Incline Treadmill Recovery Walk', 'Aerobic Base', '4–5% incline keeping heart rate relaxed.', 'Steady', 60, 1, 25, 0),
      ],
      [
        ex('Supine Stomach Vacuum + Dead Bug', 'Transverse Abdominis', 'Draw navel toward spine without holding breath; extend holds by 5s weekly.', '20s Hold', 45, 4, 1, 0),
        ex('Plank Shoulder Taps', 'Core Stability', 'Keep hips level while alternating hand taps.', 'Controlled', 45, 3, 16, 0),
        ex('Bird-Dog Anti-Rotation Hold', 'Deep Core', 'Pause 3s extended without shifting pelvis.', '3s Hold', 45, 3, 10, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Lower B: RDLs, Bulgarian Splits & Glutes',
      'Lower B: Posterior Chain Strength & Symmetry',
      'Lower B: Hamstring Hinge & Unilateral Power',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Hinge Activation',
      '5-Min Hamstring & Stomach Vacuum Prep',
      '5-Min Posterior Chain Primer',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Single-Leg Glute Bridge', prescription: '2 x 12 per leg' },
        { name: 'Banded Clamshells', prescription: '2 x 18 per side' },
        { name: 'Bodyweight Good Mornings', prescription: '15 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Banded Pull-Throughs', prescription: '2 x 15 reps' },
        { name: 'Inchworm Hamstring Walk', prescription: '8 reps' },
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
      ],
      [
        { name: 'Quadruped Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Frog Pumps', prescription: '2 x 20 reps' },
        { name: 'Single-Leg Hinge Reach', prescription: '8 per leg' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Hinge hips back slowly; stop when hips stop moving. Increase weight by 2.5kg at max reps.', '3-1-1-0', 90, 4, 10, 50),
        ex('Trap Bar / Sumo Deadlift', 'Full Posterior Chain', 'Push floor away with flat braced back. Add 2.5kg–5kg once hitting 8 clean reps.', '2-1-1-0', 120, 4, 8, 65),
        ex('Single-Leg Landmine / DB RDL', 'Glutes & Balance', 'Square hips to floor; drive through heel. Increase load by 2.5kg at max reps.', '3-1-1-0', 90, 3, 10, 14),
      ],
      [
        ex('Bulgarian Split Squats', 'Glutes & Legs', 'Control 3s descent; explode cleanly upward. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 10, 12.5),
        ex('Walking Dumbbell Lunge', 'Glutes & Quads', 'Long athletic stride with upright torso. Add 2.5kg once hitting 12 steps per side.', '2-0-1-0', 90, 3, 12, 10),
        ex('Curtsy to Reverse Lunge', 'Glute Medius & Quads', 'Keep front knee tracking over middle toe. Increase load by 2.5kg at max reps.', '2-1-1-0', 60, 3, 12, 8),
      ],
      [
        ex('Barbell Hip Thrusts', 'Glute Max', 'Drive through heels cleanly with tucked chin. Increase weight by 2.5kg when hitting max reps.', '2-1-1-1', 90, 4, 10, 65),
        ex('Cable Glute Pull-Through', 'Glutes & Hinge', 'Deep hip hinge; stand tall and squeeze. Add 2.5kg once 15 clean reps are met.', '2-1-1-1', 60, 3, 15, 22.5),
        ex('45° Back Extension (Glute Bias)', 'Upper Glutes', 'Round upper back subtly and squeeze glutes. Progress plate by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Lock lap pad firm; resist return for 3s. Increase pin by 2.5kg when hitting max reps.', '3-1-1-0', 60, 3, 12, 30),
        ex('Nordic / Eccentric Hamstring Lower', 'Hamstring Armor', 'Control forward descent as slowly as possible; increase range weekly.', '4-0-1-0', 60, 3, 8, 0),
        ex('Glute-Ham Raise / Lying Curl', 'Hamstrings', 'Full stretch and strong 1s contraction. Add 2.5kg at top target reps.', '2-1-1-1', 60, 3, 12, 25),
      ],
      [
        ex('Seated Hip Abduction', 'Glute Medius', 'Hold peak 1s squeeze outward every rep. Increase weight by 2.5kg at 18 reps.', '2-1-2-0', 45, 3, 18, 42.5),
        ex('Cable Glute Kickback', 'Glute Shelf', 'Smooth controlled leg sweep back. Add 2.5kg once hitting 15 clean reps.', '2-1-1-1', 45, 3, 15, 10),
        ex('Banded Frog Pumps', 'Glute Finisher', 'High-rep burn keeping soles pressed together. Progress band resistance weekly.', '1-1-1-0', 45, 3, 25, 0),
      ],
      [
        ex('Standing Calf Raise', 'Calves', '2s bottom stretch; explosive calf raise. Increase weight by 2.5kg at max reps.', '2-2-1-1', 45, 3, 15, 30),
        ex('Hanging Knee Raise', 'Lower Abs', 'Controlled pelvic tilt without swinging; progress tempo control each week.', '2-1-2-0', 45, 3, 12, 0),
        ex('Forearm Plank + TVA Vacuum', 'Deep Core Endurance', 'Brace glutes and draw navel upward cleanly; add 10s hold each week.', '45s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Upper B: Back Taper, Rear Delts & Conditioning',
      'Upper B: Upper Back Sculpt & Shoulder Symmetry',
      'Upper B: Pull Power, Shoulders & Core',
    ],
    targetMuscle: 'Upper Body · Back, Shoulders & Core',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Flow',
      '5-Min Upper Mobility & Stomach Vacuum',
      '5-Min Scapular Brace & Core Primer',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Wall Slides', prescription: '2 x 12 reps' },
        { name: 'Bird-Dog Reach', prescription: '10 per side' },
        { name: 'Band External Rotations', prescription: '15 per arm' },
      ],
      [
        { name: 'Supine TVA Engagement & Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
        { name: 'Scapular Push-Ups', prescription: '12 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Arm Circles', prescription: '30 seconds' },
        { name: 'Plank Walkouts', prescription: '8 reps' },
        { name: 'Light Band Rows', prescription: '20 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Chin-Up / Underhand Lat Pulldown', 'Lats & Biceps', 'Pull collarbone to bar with controlled eccentric. Increase weight by 2.5kg at max reps.', '3-1-1-0', 75, 4, 10, 32.5),
        ex('Wide-Grip Lat Pulldown', 'Lat Width', 'Lead with elbows downward to frame back line. Add 2.5kg once hitting 12 reps.', '2-1-1-0', 75, 4, 12, 32.5),
        ex('Single-Arm Dumbbell Row', 'Back & Posture', 'Pull elbow smoothly past ribcage. Increase dumbbell by 2.5kg at 12 clean reps.', '2-1-1-0', 60, 4, 12, 12.5),
      ],
      [
        ex('Seated Narrow Cable Row', 'Mid-Back & Posture', 'Stay tall; pull handles to lower sternum. Add 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 14, 27.5),
        ex('Straight-Arm Cable Pulldown', 'Lats & Core', 'Keep arms long and sweep bar to thighs. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 20),
        ex('Chest-Supported Row', 'Upper Back', 'Squeeze shoulder blades cleanly for 1s. Add 2.5kg once all sets hit 12 reps.', '2-1-1-1', 60, 3, 12, 25),
      ],
      [
        ex('Dumbbell Push Press', 'Shoulders & Power', 'Short crisp knee dip driving weights overhead. Increase load by 2.5kg at max reps.', 'Explosive', 60, 3, 10, 10),
        ex('Machine Shoulder Press', 'Deltoids', 'Control 3s lowering keeping traps relaxed. Add 2.5kg when hitting 12 clean reps.', '3-1-1-0', 60, 3, 12, 20),
        ex('Kneeling Landmine Single-Arm Press', 'Shoulders & Core', 'Brace abs tight; press smoothly upward at 45°. Increase bar load by 2.5kg at max reps.', '2-1-1-0', 60, 3, 12, 15),
      ],
      [
        ex('Cable Lateral Raise', 'Side Delts', 'Sweep smoothly out in scapular plane. Increase stack when hitting 15 controlled reps.', '2-1-1-0', 45, 4, 15, 5),
        ex('Behind-Back Cable Lateral Raise', 'Side Deltoids', 'Continuous tension sweeping outward. Progress load once all sets hit 15 reps.', '2-1-1-0', 45, 4, 15, 5),
        ex('Face Pulls (Rope)', 'Rear Delts & Posture', 'Spread rope beside ears for strong posture. Increase weight by 2.5kg at max reps.', '2-1-1-1', 45, 4, 15, 15),
      ],
      [
        ex('Hammer Curl + Overhead Rope Extension', 'Toned Arms', 'Controlled tempo superset without swinging. Increase weight by 2.5kg at 14 reps.', '2-1-1-0', 45, 3, 14, 8),
        ex('Cable Curl + Tricep Pushdown', 'Arms Density', 'Lock elbows beside ribs cleanly. Add 2.5kg once hitting 15 unbroken reps.', '2-1-1-1', 45, 3, 15, 15),
        ex('Incline Dumbbell Bicep Curl', 'Biceps', 'Full stretch behind torso; crisp curl. Increase dumbbell load at top reps.', '2-1-1-0', 45, 3, 12, 7),
      ],
      [
        ex('Dead Bug + TVA Stomach Vacuum', 'Core Cincher', 'Lock ribs downward and breathe deeply; increase vacuum duration by 5s weekly.', '3-1-2-0', 45, 3, 12, 0),
        ex('Pilates Leg Lowering', 'Lower Abs', 'Anchor lower spine flat into mat on every rep; add 2 reps weekly.', '3-1-1-0', 45, 3, 14, 0),
        ex('Side Plank Hip Dip (Light)', 'Core Stability', 'Stack shoulders cleanly over elbow; progress clean reps per side.', '2-1-1-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Lower C: Hip Thrusts, RDLs & Athletic Finish',
      'Lower C: Posterior Chain & Conditioning',
      'Lower C: Glutes, Hamstrings & Step Burn',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 50,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Lower Conditioning',
      '5-Min Glute & Hip Primer',
      '5-Min Dynamic Lower & Core Brace',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Banded Lateral Walks', prescription: '2 x 15 per side' },
        { name: 'Bodyweight Good Mornings', prescription: '15 reps' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Frog Pumps', prescription: '2 x 20 reps' },
        { name: 'Goblet Squat Hold', prescription: '2 x 20s' },
        { name: 'Ankle Rocks', prescription: '10 per side' },
      ],
      [
        { name: 'Quadruped Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Single-Leg Glute Bridge', prescription: '12 per leg' },
        { name: 'Inchworms', prescription: '6 slow reps' },
        { name: 'Cossack Shifts', prescription: '10 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Hip Thrusts', 'Glute Max', 'Drive through heels cleanly; 1s pause at top. Increase weight by 2.5kg when hitting max reps.', '2-1-1-1', 90, 4, 12, 65),
        ex('Single-Leg Hip Thrust', 'Unilateral Glutes', 'Keep pelvis level at lockout. Add 2.5kg once hitting 12 reps per side.', '2-1-1-1', 75, 3, 12, 15),
        ex('Kettlebell Swing', 'Posterior Power', 'Snap hips crisply into tall standing plank. Step up bell weight when 18 reps feel light.', 'Explosive', 60, 4, 18, 16),
      ],
      [
        ex('Dumbbell Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Hinge hips back smoothly; keep dumbbells close. Increase load by 2.5kg at max reps.', '3-1-1-0', 90, 4, 12, 16),
        ex('B-Stance Barbell RDL', 'Glute-Hamstring Tie-In', 'Keep 85% tension on front heel. Add 2.5kg when hitting 10 reps cleanly.', '3-1-1-0', 90, 3, 10, 40),
        ex('Cable Glute Pull-Through', 'Glutes & Hinge', 'Deep hip stretch and tall lockout. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 60, 4, 15, 22.5),
      ],
      [
        ex('Alternating Reverse Lunge', 'Legs & Glutes', 'Smooth step back keeping front knee stable. Increase weight by 2.5kg at max reps.', '2-0-1-0', 60, 3, 12, 10),
        ex('Dumbbell Sumo Squat', 'Inner Thighs & Glutes', 'Wide stance; knees track over toes. Add 2.5kg once hitting 14 controlled reps.', '3-1-1-0', 60, 3, 14, 18),
        ex('Bulgarian Split Squat', 'Glutes & Quads', 'Slight forward lean to load lead glute. Increase weight by 2.5kg at max reps.', '3-1-1-0', 75, 3, 10, 12.5),
      ],
      [
        ex('Lying Leg Curl', 'Hamstrings', '3s controlled return every rep. Increase pin by 2.5kg when hitting 12 reps.', '3-1-1-0', 60, 3, 12, 25),
        ex('Seated Leg Curl', 'Hamstrings', 'Full stretch at top, 1s squeeze at bottom. Add 2.5kg at top target reps.', '2-1-1-1', 60, 3, 12, 27.5),
        ex('45° Back Extension (Glute Focus)', 'Upper Glutes', 'Tuck chin and squeeze glutes to parallel. Add 2.5kg when hitting 15 reps.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('Seated Hip Abduction', 'Glute Medius', 'Pause 1s outward on each rep. Increase weight by 2.5kg when hitting 18 reps.', '2-1-2-0', 45, 3, 18, 42.5),
        ex('Cable Glute Kickback', 'Glute Shelf', 'Controlled leg sweep keeping torso tall. Add 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 10),
        ex('Farmer Dumbbell Carry', 'Core & Leg Stability', 'Walk tall 30s without swaying. Increase dumbbell weight by 2.5kg weekly.', '30s Walk', 45, 3, 1, 16),
      ],
      [
        ex('Incline Power Walk Finisher', 'Metabolic Conditioning', '8 mins crisp 7% incline output; increase speed slightly every week.', '8 Mins', 60, 1, 8, 0),
        ex('Step-Up Knee Drive', 'Glutes & Conditioning', 'Fast drive onto box, controlled step down; increase pace cleanly.', 'Athletic', 45, 3, 14, 0),
        ex('V-Up / Tuck Crunch + TVA Brace', 'Core Definition', 'Reach smoothly toward shins with controlled descent; add 2 reps weekly.', '2-1-2-0', 45, 3, 15, 0),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Full Recovery & Sleep Bank',
      'Day 7: Mobility Unwind & Hydration',
      'Day 7: Rest Day & Step Maintenance',
    ],
    targetMuscle: 'Rest & Mobility',
    durationMin: 20,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Breath & Restorative Stretch',
      '5-Min Spinal Decompression',
      '5-Min Calm Recovery Breathwork',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Breath', prescription: '3 x 20s gentle holds' },
        { name: 'Child Pose Lat Reach', prescription: '60s' },
        { name: 'Supine Spinal Twist', prescription: '45s per side' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Pigeon Glute Release', prescription: '60s per side' },
        { name: 'Seated Forward Fold', prescription: '60s' },
      ],
      [
        { name: 'Seated Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Couch Quad Stretch', prescription: '45s per side' },
        { name: 'Chest Doorway Opener', prescription: '45s' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Evening Decompression Walk', 'Active Rest', 'Easy pace outdoors; prepare CNS for 8.5h deep sleep.', 'Easy', 60, 1, 20, 0),
        ex('Light Morning Mobility Walk', 'Recovery', 'Relaxed stride to hit baseline step goal effortlessly.', 'Easy', 60, 1, 25, 0),
        ex('Gentle Stretch & Walk', 'Restoration', 'Keep heart rate low and hydrate consistently.', 'Easy', 60, 1, 20, 0),
      ],
    ],
  },
];

const FEMALE_LEAN_PETITE_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Lower A: Glute Sculpt & Hamstrings',
      'Lower A: High-Rep Thrusts & Leg Tone',
      'Lower A: Glutes, RDLs & Step Burn',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 45,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Hip Opener',
      '5-Min Lower-Body & Core Activation',
      '5-Min Posture, TVA & Knee Prep',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Bodyweight Squat-to-Calf Raise', prescription: '2 x 12 reps' },
        { name: 'Glute Bridge March', prescription: '20 alternating' },
        { name: 'Ankle & Hip Circles', prescription: '10 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
        { name: 'Reverse Lunge Reach', prescription: '8 per leg' },
        { name: 'Inchworm Walkouts', prescription: '6 slow reps' },
      ],
      [
        { name: 'Quadruped Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Light High-Knee March', prescription: '45 seconds' },
        { name: '90/90 Hip Switches', prescription: '8 switches' },
        { name: 'Clamshell Pulses', prescription: '20 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell / Dumbbell Hip Thrusts', 'Glute Max', 'Drive through heels; 1s peak pause. Increase weight by 2.5kg when hitting max reps.', '2-1-1-1', 60, 4, 15, 45),
        ex('Elevated Glute Bridge (High Rep)', 'Glutes', 'Feet on step for deeper range. Add 2.5kg once hitting 20 clean reps.', '2-1-1-1', 45, 4, 20, 15),
        ex('Single-Leg Hip Thrust', 'Unilateral Glutes', 'Keep pelvis level at top. Increase dumbbell by 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 12, 12.5),
      ],
      [
        ex('Dumbbell Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Soft knees; glide dumbbells smoothly down shins. Add 2.5kg at 14 clean reps.', '3-1-1-0', 60, 4, 14, 12),
        ex('B-Stance Dumbbell RDL', 'Glute-Hamstring Tie-In', 'Focus tension on front hamstring. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 60, 3, 12, 12.5),
        ex('Cable Glute Pull-Through', 'Glutes & Hamstrings', 'Stretch far back and snap hips tall. Add 2.5kg once 16 clean reps are met.', '2-1-1-1', 60, 4, 16, 20),
      ],
      [
        ex('Bulgarian Split Squats', 'Glutes & Legs', 'Slight forward lean; drive through heel. Increase weight by 2.5kg at max reps.', '3-1-1-0', 60, 3, 12, 10),
        ex('Dumbbell Sumo Pulse Squat', 'Inner Thighs & Glutes', 'Deep squat with 1 pulse at bottom. Add 2.5kg when hitting 16 clean reps.', '2-1-1-0', 45, 4, 16, 12),
        ex('Alternating Curtsy Lunge', 'Glutes & Quads', 'Step diagonally back keeping knee stable. Increase load by 2.5kg at top reps.', '2-0-1-0', 45, 3, 16, 8),
      ],
      [
        ex('Lying Leg Curl', 'Hamstrings', 'Control 3s lowering phase on every rep. Increase stack by 2.5kg at 15 reps.', '3-1-1-0', 45, 3, 15, 22.5),
        ex('Seated Leg Curl', 'Hamstrings', 'Smooth 3s return to full knee extension. Add 2.5kg when hitting max reps.', '3-1-1-0', 45, 3, 15, 25),
        ex('Seated Leg Extension', 'Quad Definition', 'Light-moderate load with crisp 1s pause. Increase weight by 2.5kg at 15 reps.', '2-1-1-1', 45, 3, 15, 25),
      ],
      [
        ex('Seated Hip Abduction', 'Glute Medius', 'Continuous controlled outward sweep. Increase weight by 2.5kg at 20 clean reps.', '1-1-1-0', 45, 3, 20, 40),
        ex('Cable Glute Kickback', 'Upper Glutes', 'Zero back arch; crisp 1s squeeze. Add 2.5kg once hitting 18 reps per side.', '2-1-1-1', 45, 3, 18, 10),
        ex('Hip Adductor Squeeze', 'Inner Thighs', 'Smooth full range without momentum. Increase stack by 2.5kg at 16 reps.', '2-1-1-1', 45, 3, 16, 30),
      ],
      [
        ex('Incline Power Walk Finisher', 'Calorie Output', '8% incline, brisk pace, swinging arms; increase speed slightly every week.', '12 Mins', 60, 1, 12, 0),
        ex('Dead Bug Stomach Vacuum', 'TVA Cincher', 'Full exhale keeping waist narrow; extend hold duration by 5s weekly.', '3-1-2-0', 45, 3, 12, 0),
        ex('Standing Calf Raise', 'Calves', 'Full bottom stretch; crisp top pause. Increase weight by 2.5kg at 18 reps.', '2-2-1-1', 45, 3, 18, 20),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Upper A: Sleek Shoulders, Back & Posture',
      'Upper A: Back Alignment & Shoulder Toning',
      'Upper A: Sculpted Upper Back & Arms',
    ],
    targetMuscle: 'Upper Body · Back, Shoulders & Arms',
    durationMin: 42,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Posture Prep',
      '5-Min Thoracic Alignment & Vacuum',
      '5-Min Arm, Cuff & TVA Primer',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Wall Angel Slides', prescription: '2 x 12 reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Arm Circles', prescription: '30s each way' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Light Band Rows', prescription: '20 reps' },
        { name: 'Band External Rotations', prescription: '12 per arm' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Y-T-W Prone Raises', prescription: '10 each' },
        { name: 'Scapular Pulls', prescription: '12 reps' },
        { name: 'Wrist & Elbow Circles', prescription: '20 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Cable Lat Pulldown (Light-Moderate)', 'Posture & Back', 'Pull down smoothly; open collarbones wide. Increase weight by 2.5kg at max reps.', '2-1-1-0', 60, 4, 15, 25),
        ex('Assisted Chin-Up / Pulldown', 'Back & Arms', 'Full stretch overhead; smooth pull. Reduce assistance by 2.5kg when hitting 12 reps.', '2-1-1-0', 60, 3, 12, 25),
        ex('Straight-Arm Cable Pulldown', 'Lats & Posture', 'Sweep bar to thighs keeping ribs tucked. Add 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 17.5),
      ],
      [
        ex('Seated Cable Row (Wide Handle)', 'Upper Back', 'Draw elbows back to align shoulders. Increase stack by 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 15, 22.5),
        ex('Single-Arm Dumbbell Row', 'Mid-Back Sculpt', 'Keep shoulders square and pull elbow to hip. Add 2.5kg at 14 clean reps.', '2-1-1-0', 45, 3, 14, 10),
        ex('Single-Arm Cable Row', 'Back & Posture', 'Pull smoothly toward ribcage without twisting. Increase load by 2.5kg at max reps.', '2-1-1-0', 45, 3, 14, 12.5),
      ],
      [
        ex('Seated Dumbbell Lateral + Front Raise', 'Sculpted Shoulders', 'Light weight, pure form, soft elbow bend. Step up weight once 16 reps are smooth.', '2-1-1-0', 45, 4, 16, 4),
        ex('Kneeling Overhead Dumbbell Press', 'Shoulders & Core', 'Ribs stacked down; clean overhead lockout. Increase weight by 2.5kg at max reps.', '2-1-1-0', 60, 3, 15, 7),
        ex('Cable Lateral Sweeps', 'Side Delts', 'Continuous tension without trapping neck. Add weight when hitting 16 clean reps.', '2-1-1-0', 45, 4, 16, 4),
      ],
      [
        ex('Face Pulls (Posture Focus)', 'Rear Delts', 'Pause 1s with thumbs pointing backward. Increase stack by 2.5kg at max reps.', '2-1-1-1', 45, 4, 16, 12.5),
        ex('Incline Dumbbell Rear Delt Raise', 'Posterior Delts', 'Sweep arms wide at 45° angle. Step up weight once 16 reps feel steady.', '2-1-1-1', 45, 3, 16, 4),
        ex('Bent-Over Dumbbell Fly', 'Rear Delts & Posture', 'Keep spine flat and sweep arms wide. Increase load when hitting 15 clean reps.', '2-1-1-1', 45, 3, 15, 4),
      ],
      [
        ex('Rope Pushdown + Hammer Curl', 'Arms Superset', 'High-rep burn with clean full extension. Increase weight by 2.5kg at 16 reps.', '2-1-1-0', 45, 3, 16, 12.5),
        ex('Overhead Cable Tricep Extension', 'Triceps', 'Smooth stretch overhead without flaring ribs. Add 2.5kg when hitting max reps.', '2-1-1-0', 45, 3, 15, 12.5),
        ex('Dumbbell Tricep Kickback + Bicep Curl', 'Toned Arms', 'Keep upper arms locked motionless beside ribs. Increase dumbbell weight at 15 reps.', '2-1-1-0', 45, 3, 15, 5),
      ],
      [
        ex('Hollow-Body Breath Hold', 'Transverse Abdominis', 'Draw ribs down cleanly with calm breaths; extend hold by 5s weekly.', '25s Hold', 45, 3, 1, 0),
        ex('Pallof Press Hold', 'Core Stability', 'Resist cable twist for crisp posture. Increase load by 2.5kg at 12 clean holds.', '2-2-2-0', 45, 3, 12, 10),
        ex('Forearm Plank + Knee Taps', 'Core Cincher', 'Keep hips level while tapping knees; add 4 reps weekly.', 'Controlled', 45, 3, 16, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Active Recovery: TVA Vacuum & Step Floor',
      'Active Recovery: Posture Walk & Deep Core',
      'Active Recovery: Hip Release & Conditioning Walk',
    ],
    targetMuscle: 'Active Recovery & TVA',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Posture Decompression',
      '5-Min Hip & Calf Release',
      '5-Min Breathing Reset',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Series', prescription: '4 x 20s holds' },
        { name: 'Wall Chest Stretch', prescription: '45s per side' },
        { name: 'Calf Stretch on Step', prescription: '45s per leg' },
      ],
      [
        { name: 'Quadruped TVA Engagement Holds', prescription: '4 x 20s holds' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Thoracic Foam Roll', prescription: '60s' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Child Pose', prescription: '60s' },
        { name: 'Cat-Cow', prescription: '10 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor 3,500-Step Power Walk', 'NEAT Conditioning', 'Keep posture tall and arms swinging comfortably to hit 10.5k step floor.', '30 Mins', 60, 1, 30, 0),
        ex('Treadmill Gentle Incline Walk', 'Active Recovery', '3–4% incline, conversational pace; nudge incline 1% weekly.', '25 Mins', 60, 1, 25, 0),
        ex('Light Cycle + Mobility Walk', 'Circulation', 'Flush soreness while progressing daily step goal.', '25 Mins', 60, 1, 25, 0),
      ],
      [
        ex('Supine Stomach Vacuum Series', 'Waistline Cincher', 'Full exhale, draw navel inward, hold 20s; extend by 5s weekly.', '20s Hold', 45, 4, 1, 0),
        ex('Dead Bug Extended Hold', 'TVA Cincher', 'Hold bottom reach for 2s per side with lumbar glued flat.', '2-2-1-0', 45, 3, 14, 0),
        ex('Bird-Dog Anti-Rotation Hold', 'Deep Core', 'Pause 2s extended each side without shifting hips.', '2-2-1-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Lower B: RDLs, Lunges & Glute Lift',
      'Lower B: High-Rep Posterior Chain',
      'Lower B: Glute Contour & Hamstrings',
    ],
    targetMuscle: 'Lower Body · Glutes & Hamstrings',
    durationMin: 45,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Hinge Prep',
      '5-Min Hip Capsule & Core Mobility',
      '5-Min Posterior Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Banded Frog Pumps', prescription: '2 x 20 reps' },
        { name: 'Bodyweight Good Mornings', prescription: '15 reps' },
        { name: 'Side-Lying Leg Lifts', prescription: '15 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Banded Lateral Walks', prescription: '2 x 16 per side' },
        { name: 'Single-Leg Glute Bridge', prescription: '12 per leg' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
      ],
      [
        { name: 'Quadruped Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Fire Hydrant Pulses', prescription: '2 x 15 per side' },
        { name: 'Inchworm Hamstring Stretch', prescription: '8 reps' },
        { name: 'Ankle Rocks', prescription: '10 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Dumbbell Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Keep dumbbells close to thighs; squeeze glutes tall. Increase load by 2.5kg at max reps.', '3-1-1-0', 60, 4, 14, 12.5),
        ex('B-Stance Dumbbell RDL', 'Glute Tie-In', 'Focus tension on front hamstring and lower glute. Add 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 12.5),
        ex('Cable Pull-Through (High Rep)', 'Glutes & Hamstrings', 'Stretch far back and snap hips tall. Increase stack by 2.5kg at 16 reps.', '2-1-1-1', 60, 4, 16, 20),
      ],
      [
        ex('Barbell / Dumbbell Hip Thrusts', 'Glute Max', 'Drive through heels; 1s peak pause. Increase weight by 2.5kg when hitting max reps.', '2-1-1-1', 60, 4, 15, 45),
        ex('Elevated Sumo Squat', 'Glutes & Adductors', 'Sink deeply between blocks with proud chest. Add 2.5kg at 15 clean reps.', '3-1-1-0', 60, 3, 15, 16),
        ex('Step-Up (Low Box Tempo)', 'Glutes & Balance', 'Control 3s lowering phase down. Increase dumbbell weight by 2.5kg at 14 reps.', '3-1-1-0', 45, 3, 14, 8),
      ],
      [
        ex('Bulgarian Split Squats', 'Glutes & Quads', 'Stay balanced over front midfoot. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 60, 3, 12, 10),
        ex('Reverse Lunge to Knee Drive', 'Glutes & Conditioning', 'Smooth rhythmic flow without slamming knee. Add 2.5kg at 14 clean reps.', '2-0-1-0', 60, 3, 14, 8),
        ex('Smith Machine Glute Lunge', 'Glute Max', 'Slight forward lean to load lead glute. Increase weight by 2.5kg at max reps.', '3-1-1-0', 60, 3, 12, 30),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Smooth 3s return to full knee extension. Increase pin by 2.5kg at 15 clean reps.', '3-1-1-0', 45, 3, 15, 25),
        ex('Lying Leg Curl', 'Hamstrings', 'Keep hips pressed into pad cleanly. Add 2.5kg once hitting 15 reps.', '3-1-1-0', 45, 3, 15, 22.5),
        ex('Kettlebell Swing', 'Posterior Conditioning', 'Crisp hip snap with tall standing plank. Step up bell weight at 20 clean reps.', 'Explosive', 45, 4, 20, 12),
      ],
      [
        ex('Seated Hip Abduction', 'Side Glutes', 'High-rep controlled burn; 1s pause wide. Increase stack by 2.5kg at 20 reps.', '1-1-2-0', 45, 4, 20, 40),
        ex('45° Back Extension (Glute Focus)', 'Upper Glutes', 'Tuck chin; squeeze glutes to parallel. Add 2.5kg once 16 reps are steady.', '2-1-1-1', 45, 3, 16, 5),
        ex('Cable Glute Kickback', 'Glute Shelf', 'Controlled leg sweep back with square hips. Increase stack by 2.5kg at max reps.', '2-1-1-1', 45, 3, 16, 10),
      ],
      [
        ex('Standing Calf Raise', 'Calves & Ankle Tone', 'Full stretch at bottom step. Increase weight by 2.5kg when hitting 18 reps.', '2-2-1-1', 45, 3, 18, 20),
        ex('Dead Bug Slow March + Vacuum', 'Deep Core', 'Glue lower spine flat to floor; extend hold time by 5s weekly.', '3-1-1-0', 45, 3, 14, 0),
        ex('Incline Brisk Walk (8 Mins)', 'Step & Calorie Burn', 'Upright posture; swing arms briskly and nudge speed weekly.', '8 Mins', 60, 1, 8, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Upper B: High-Rep Back, Delts & Arms',
      'Upper B: Posture Sculpt & Shoulder Tone',
      'Upper B: Sleek Upper Body & TVA Core',
    ],
    targetMuscle: 'Upper Body · Back, Shoulders & Arms',
    durationMin: 42,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Wake-Up',
      '5-Min Upper Mobility & Vacuum Prep',
      '5-Min Posture Alignment & Core Brace',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Plank Shoulder Taps', prescription: '16 taps' },
        { name: 'Wall Slides', prescription: '12 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Arm Circles', prescription: '30s' },
        { name: 'Bird-Dog Reach', prescription: '10 per side' },
        { name: 'Light Band Rows', prescription: '15 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Thread-the-Needle', prescription: '8 per side' },
        { name: 'Band External Rotations', prescription: '12 per arm' },
        { name: 'Box Breathing', prescription: '3 cycles' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Single-Arm Cable Row', 'Back & Posture', 'Pull smoothly toward ribcage without twisting. Increase load by 2.5kg at 14 reps.', '2-1-1-0', 45, 4, 14, 12.5),
        ex('Assisted Chin-Up / Pulldown', 'Back & Arms', 'Full stretch overhead; smooth pull. Reduce assistance by 2.5kg at 12 reps.', '2-1-1-0', 60, 4, 12, 25),
        ex('Seated Wide Cable Row', 'Upper Back', 'Draw shoulder blades down and back. Increase stack by 2.5kg at max reps.', '2-1-1-1', 45, 4, 15, 22.5),
      ],
      [
        ex('Seated Dumbbell Shoulder Press', 'Shoulders', 'Control elbows slightly forward; smooth press. Add 2.5kg when hitting 14 reps.', '2-1-1-0', 45, 3, 14, 8),
        ex('Arnold Dumbbell Press', '3D Shoulders', 'Smooth rotation keeping traps down. Increase weight by 2.5kg at max reps.', '2-1-1-0', 45, 3, 14, 7),
        ex('Band Pull-Apart Walk', 'Upper Posture', 'Walk 20 steps pulsing band apart; step up band tension weekly.', '20 Steps', 45, 3, 20, 0),
      ],
      [
        ex('Cable Lateral Raise', 'Side Delts', 'Continuous tension sweeping outward. Increase weight once 16 clean reps are met.', '2-1-1-0', 45, 4, 16, 4),
        ex('Seated Dumbbell Lateral Raise', 'Side Delts', 'Soft elbow bend, lead with outer wrist. Step up dumbbell weight at 16 reps.', '2-1-1-0', 45, 4, 16, 4),
        ex('Rope Face Pulls', 'Rear Delts & Posture', 'Pull rope beside ears with 1s squeeze. Increase stack by 2.5kg at 16 reps.', '2-1-1-1', 45, 4, 16, 12.5),
      ],
      [
        ex('Bent-Over Dumbbell Fly', 'Rear Delts & Posture', 'Keep spine flat and sweep arms wide. Increase weight once 15 reps are controlled.', '2-1-1-1', 45, 3, 15, 4),
        ex('Incline Dumbbell Rear Delt Raise', 'Posterior Delts', 'Sweep arms wide at 45° angle. Step up weight at 16 clean reps.', '2-1-1-1', 45, 3, 16, 4),
        ex('Straight-Arm Cable Pulldown', 'Lats & Posture', 'Sweep bar to thighs keeping ribs tucked. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 45, 3, 15, 17.5),
      ],
      [
        ex('Dumbbell Hammer Curl', 'Arms', 'Keep elbows pinned quietly beside ribs. Increase dumbbell weight at 14 clean reps.', '2-1-1-0', 45, 3, 14, 6),
        ex('Rope Tricep Pushdown', 'Triceps', 'Spread rope apart smoothly at full extension. Add 2.5kg when hitting 15 reps.', '2-1-1-1', 45, 3, 15, 12.5),
        ex('Overhead Dumbbell Tricep Extension', 'Tricep Long Head', 'Controlled stretch behind head. Increase weight by 2.5kg at 14 reps.', '2-1-1-0', 45, 3, 14, 10),
      ],
      [
        ex('Supine Stomach Vacuum + Leg Lowering', 'TVA & Lower Abs', 'Glue lower spine flat; extend vacuum holds by 5s weekly.', '3-1-1-0', 45, 3, 14, 0),
        ex('Hollow Hold + Leg Flutter', 'Lower Abs', 'Small crisp kicks keeping lumbar flat; add 5s work weekly.', '25s Work', 45, 3, 1, 0),
        ex('Plank Saw (Controlled)', 'Full Core', 'Shift body 2 inches forward and back cleanly; add 2 reps weekly.', 'Controlled', 45, 3, 14, 0),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Lower C: High-Rep Glutes & Step Finisher',
      'Lower C: Posterior Sculpt & Stair Burn',
      'Lower C: Glute Pump & Metabolic Conditioning',
    ],
    targetMuscle: 'Lower Body · Glutes & Conditioning',
    durationMin: 45,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Glute Primer',
      '5-Min Hip & Mobility Prep',
      '5-Min Lower Conditioning Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Banded Frog Pumps', prescription: '2 x 20 reps' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'High-Knee March', prescription: '45 seconds' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
        { name: 'Bodyweight Squat + Calf Raise', prescription: '15 reps' },
        { name: 'Ankle Circles', prescription: '10 per side' },
      ],
      [
        { name: 'Quadruped Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Clamshell Pulses', prescription: '20 per side' },
        { name: 'Inchworms', prescription: '6 reps' },
        { name: 'Glute Bridge March', prescription: '20 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Hip Thrusts', 'Glute Max', 'Drive through heels cleanly with 1s top pause. Increase weight by 2.5kg at max reps.', '2-1-1-1', 60, 4, 15, 45),
        ex('Elevated Glute Bridge (High Rep)', 'Glutes', 'Deep stretch and strong peak squeeze. Add 2.5kg when hitting 20 reps.', '2-1-1-1', 45, 4, 20, 15),
        ex('Banded Frog Pumps', 'Glute Pump', 'Soles together, high-rep squeeze. Progress band tension weekly.', '1-1-1-0', 45, 3, 25, 0),
      ],
      [
        ex('Dumbbell Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Slow 3s hip hinge keeping bells close. Increase weight by 2.5kg at 14 reps.', '3-1-1-0', 60, 3, 14, 12.5),
        ex('Single-Leg Landmine / DB RDL', 'Glute-Hamstring Tie-In', 'Keep pelvis square toward floor. Add 2.5kg once 12 reps per side feel solid.', '3-1-1-0', 60, 3, 12, 10),
        ex('Cable Glute Pull-Through', 'Glutes & Hamstrings', 'Deep hinge and tall lockout. Increase stack by 2.5kg at 16 reps.', '2-1-1-1', 60, 3, 16, 20),
      ],
      [
        ex('Bulgarian Split Squats', 'Glutes & Quads', 'Control 3s descent, drive through heel. Increase weight by 2.5kg at max reps.', '3-1-1-0', 60, 3, 12, 10),
        ex('Walking Lunge (Light)', 'Leg Conditioning', 'Smooth continuous strides keeping torso tall. Add 2.5kg at 16 reps.', '2-0-1-0', 45, 3, 16, 8),
        ex('Kettlebell Goblet Squat', 'Legs & Glutes', 'High-rep clean depth keeping chest tall. Increase bell weight at 16 reps.', '2-0-1-0', 45, 3, 16, 12),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Smooth 3s return without swinging. Increase stack by 2.5kg at 15 reps.', '3-1-1-0', 45, 3, 15, 25),
        ex('Seated Hip Abduction', 'Glute Medius', 'Pause 1s outward on each rep. Increase weight by 2.5kg at 20 clean reps.', '1-1-1-0', 45, 3, 20, 40),
        ex('Cable Glute Kickback', 'Upper Glutes', 'Controlled sweep keeping pelvis locked. Add 2.5kg when hitting 16 reps.', '2-1-1-1', 45, 3, 16, 10),
      ],
      [
        ex('Reverse Crunch (Slow Eccentric)', 'Lower Abs', 'Lift tailbone cleanly off mat; progress eccentric tempo weekly.', '3-1-1-0', 45, 3, 15, 0),
        ex('Supine Stomach Vacuum Series', 'TVA Cincher', 'Full exhale, draw navel inward; extend holds by 5s weekly.', '20s Hold', 45, 4, 1, 0),
        ex('Standing Calf Raise', 'Calves', '2s bottom stretch; crisp top pause. Increase weight by 2.5kg at 18 reps.', '2-2-1-1', 45, 3, 18, 20),
      ],
      [
        ex('Stair Climber / Incline Finisher', 'Step & Calorie Floor', '10 mins smooth pace to lock in daily step goal; increase level weekly.', '10 Mins', 60, 1, 10, 0),
        ex('Shadowboxing + Step Interval', 'Metabolic Burn', '45s crisp combinations / 15s active march; increase work intensity weekly.', '45s Work', 45, 4, 1, 0),
        ex('Incline Speed Walk (Intervals)', 'Metabolic Finish', '1 min brisk / 1 min moderate for 12 mins; nudge incline 1% weekly.', '12 Mins', 60, 1, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Restorative Flow & Step Floor',
      'Day 7: Complete CNS Reset & Stretch',
      'Day 7: Gentle Walk & Sleep Recovery',
    ],
    targetMuscle: 'Rest & Mobility',
    durationMin: 20,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Breath & Restorative Stretch',
      '5-Min Calm Mobility Flow',
      '5-Min Lymphatic Reset',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Breath', prescription: '3 x 20s gentle holds' },
        { name: 'Supine Twist', prescription: '45s per side' },
        { name: 'Hamstring Stretch', prescription: '45s per leg' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Child Pose', prescription: '60s' },
        { name: 'Pigeon Release', prescription: '45s per side' },
      ],
      [
        { name: 'Seated Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Cat-Cow', prescription: '10 breaths' },
        { name: 'Ankle & Hip Circles', prescription: '30s' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Relaxed Outdoor Step Walk', 'Active Rest', 'Easy pace to hit step floor and unwind.', 'Easy', 60, 1, 25, 0),
        ex('Evening Stretch & Walk', 'Recovery', 'Prioritize hydration and 8.5h sleep tonight.', 'Easy', 60, 1, 20, 0),
        ex('Daylight Recovery Stroll', 'NEAT', 'Gentle movement to refresh joints for Monday.', 'Easy', 60, 1, 25, 0),
      ],
    ],
  },
];

// ============================================================================
// MALE SPLITS: 6-DAY PUSH / PULL / LEGS (PPL) HYPERTROPHY SPLITS (+ DAY 7 REST)
// Focused on lat width, upper chest density, shoulder capping, and key compounds.
// Every day includes TVA engagement + Stomach Vacuum work & progressive overload cues.
// ============================================================================

const MALE_VTAPER_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Push A: Upper Chest Density & Capped Delts',
      'Push A: Clavicular Press & 3D Shoulders',
      'Push A: Incline Density & Side Delt Width',
    ],
    targetMuscle: 'Push · Upper Chest, Delts & Triceps',
    durationMin: 56,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Cuff Primer',
      '5-Min Clavicular Press & Core Brace',
      '5-Min Scapular Mobility & Stomach Vacuum',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s full-exhale holds' },
        { name: 'Cable External Rotations', prescription: '2 x 12 per arm' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Scapular Push-Ups', prescription: '2 x 12 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band Shoulder Dislocates', prescription: '12 controlled passes' },
        { name: 'Thoracic Wall Slides', prescription: '12 reps' },
        { name: 'Light Lateral Raises', prescription: '15 primer reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Incline Push-Up Tempo Reps', prescription: '10 controlled reps' },
        { name: 'Light Rope Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Arm & Wrist Circles', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Dumbbell Press (30°)', 'Upper Chest', 'Tuck elbows 45°, 3s lowering to chest shelf. Increase weight by 2.5kg when you hit max reps.', '3-1-1-0', 120, 4, 10, 32.5),
        ex('Incline Barbell Bench Press', 'Clavicular Pecs', 'Touch upper chest cleanly and drive straight up. Add 2.5kg when all sets hit 8 clean reps.', '3-1-1-0', 120, 4, 8, 72.5),
        ex('Incline Smith Machine Press', 'Upper Chest Shelf', 'Fixed path for maximum upper-pec mechanical tension. Increase load by 2.5kg at max reps.', '3-1-1-0', 120, 4, 10, 67.5),
      ],
      [
        ex('Seated Overhead Dumbbell Press', 'Anterior & Side Delts', 'Brace abs tight, control elbows 30° forward. Increase weight by 2.5kg at top reps.', '2-1-1-0', 90, 4, 10, 24),
        ex('Machine Shoulder Press', 'Deltoid Cap', 'Smooth full range without flaring ribcage. Add 2.5kg when all sets hit 10 clean reps.', '3-1-1-0', 90, 3, 10, 50),
        ex('Arnold Dumbbell Press', '3D Shoulders', 'Controlled rotation keeping traps down. Increase dumbbell by 2.5kg at 12 reps.', '2-1-1-0', 90, 3, 12, 20),
      ],
      [
        ex('Low-to-High Cable Chest Fly', 'Upper Pecs', 'Sweep handles upward toward collarbone line. Increase stack by 2.5kg at 14 clean reps.', '2-1-1-1', 60, 3, 14, 15),
        ex('Weighted Bar Dips (Chest Lean)', 'Lower Chest & Triceps', 'Lean torso 20° forward; drive strongly to lockout. Add 2.5kg when hitting max reps.', '3-1-1-0', 90, 3, 10, 15),
        ex('Flat Dumbbell Bench Press', 'Mid Chest', 'Deep controlled stretch at bottom. Increase weight by 2.5kg once hitting 10 reps.', '3-1-1-0', 90, 3, 10, 32.5),
      ],
      [
        ex('Behind-the-Back Cable Lateral Raise', 'Side Delts', 'Sweep outward in scapular plane for wide shoulder cap. Add 2.5kg at 15 clean reps.', '2-1-2-0', 60, 4, 15, 10),
        ex('Seated Dumbbell Lateral Raise (1.5 Reps)', 'Side Delts', 'Raise to shoulder height, dip halfway, raise again. Increase load at 12 clean reps.', '2-1-1-0', 60, 4, 12, 12.5),
        ex('Machine Lateral Raise', 'Medial Delts', 'Keep traps relaxed; 3s lowering phase. Increase stack by 2.5kg at max reps.', '3-1-1-0', 60, 4, 15, 35),
      ],
      [
        ex('Overhead Rope Tricep Extension', 'Tricep Long Head', 'Deep overhead stretch without flaring ribs. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 60, 3, 12, 27.5),
        ex('EZ-Bar Skullcrusher', 'Triceps', 'Lower smoothly behind forehead for full long-head stretch. Add 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 30),
        ex('Single-Arm Crossbody Cable Extension', 'Triceps', 'Align elbow cleanly with cable path. Increase stack by 2.5kg at top target reps.', '2-1-1-1', 45, 3, 12, 12.5),
      ],
      [
        ex('Rope Tricep Pushdown (Finisher)', 'Tricep Lateral Head', 'Pin elbows beside ribs and flare rope at bottom. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 45, 3, 15, 30),
        ex('Pec-Deck Chest Fly', 'Chest Density', 'Hold 1s peak contraction across sternum. Add 2.5kg when hitting 14 clean reps.', '2-1-1-1', 60, 3, 14, 52.5),
        ex('Dead Bug TVA Brace + Stomach Vacuum', 'Core Taper', 'Glue lumbar spine flat with full exhale; progress vacuum hold by 5s weekly.', '3-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Pull A: Wide Lats, Iliac Sweep & Rear Delts',
      'Pull A: Pull-Ups, Rows & V-Taper Width',
      'Pull A: Lat Flare & Upper Back Density',
    ],
    targetMuscle: 'Pull · Wide Lats, Mid-Back & Biceps',
    durationMin: 56,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Lat Activation',
      '5-Min Scapular Pull & Stomach Vacuum',
      '5-Min Thoracic & Grip Primer',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s full-exhale holds' },
        { name: 'Dead Hang Scapular Pull-Ups', prescription: '2 x 10 slow holds' },
        { name: 'Straight-Arm Band Pulldowns', prescription: '2 x 15 light reps' },
        { name: 'Thoracic Open-Book Rotations', prescription: '8 per side' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Single-Arm Band Row', prescription: '15 per side' },
        { name: 'Wrist & Forearm Mobility', prescription: '30 seconds' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Inverted Body Rows', prescription: '10 primer reps' },
        { name: 'Foam Roller Thoracic Glide', prescription: '10 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Weighted Wide-Grip Pull-Ups', 'Upper Lat Width', 'Pull chest cleanly to bar, 3s eccentric. Increase added load by 2.5kg when hitting max reps.', '3-1-1-0', 120, 4, 8, 10),
        ex('Wide-Grip Lat Pulldown', 'Latissimus Dorsi', 'Drive elbows wide and down; keep chest proud. Add 2.5kg when all sets reach 10 reps.', '3-1-1-0', 90, 4, 10, 67.5),
        ex('Neutral-Grip Pull-Ups', 'Lats & Teres Major', 'Full dead-hang stretch each rep. Increase weight by 2.5kg once hitting max reps.', '3-1-1-0', 120, 4, 8, 10),
      ],
      [
        ex('Chest-Supported T-Bar Row', 'Mid-Back & Rear Delts', 'Pull elbows wide and squeeze upper back 1s. Increase load by 2.5kg at 10 clean reps.', '2-1-1-1', 90, 4, 10, 47.5),
        ex('Barbell Bent-Over Row', 'Full Back Density', 'Hinge 45° with braced core; row bar to navel. Add 2.5kg when hitting 8 clean reps.', '2-1-1-0', 120, 4, 8, 72.5),
        ex('Single-Arm Dumbbell Row', 'Lower Lats', 'Sweep dumbbell back in arc toward hip pocket. Increase weight by 2.5kg at max reps.', '2-1-1-0', 75, 3, 10, 34),
      ],
      [
        ex('Single-Arm Iliac Lat Pulldown', 'Lower Lat Sweep', 'Lean slightly and drive elbow into hip pocket. Add 2.5kg when hitting 12 clean reps.', '2-1-2-0', 60, 3, 12, 32.5),
        ex('Straight-Arm Cable Pulldown', 'Outer Lats & Serratus', 'Keep arms nearly straight and sweep to thighs. Increase stack by 2.5kg at 14 reps.', '2-1-1-1', 60, 3, 14, 27.5),
        ex('Seated Close-Grip Cable Row', 'Lower Lats & Mid-Back', 'Stay upright; pull handle cleanly to lower abs. Add 2.5kg at top target reps.', '2-1-1-1', 75, 3, 12, 62.5),
      ],
      [
        ex('Reverse Pec-Deck Rear Delt Fly', 'Rear Delts', 'Push handles wide keeping traps depressed. Increase weight by 2.5kg when hitting 15 reps.', '2-1-1-1', 60, 4, 15, 42.5),
        ex('Cable Face Pulls (External Rotate)', 'Rear Delts & Rotator Cuff', 'Pull rope beside ears with thumbs back. Add 2.5kg once 15 clean reps are met.', '2-1-1-1', 60, 4, 15, 22.5),
        ex('Incline Chest-Supported Rear Delt Fly', 'Posterior Delts', 'Sweep dumbbells out wide at 45°. Increase dumbbell load when hitting max reps.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('Incline Dumbbell Bicep Curl', 'Bicep Long Head', 'Let arms hang behind torso for deep stretch. Increase weight by 2.5kg at 12 clean reps.', '3-1-1-0', 60, 3, 12, 14),
        ex('EZ-Bar Preacher Curl', 'Bicep Peak', 'Full elbow extension at bottom without bouncing. Add 2.5kg when hitting 10 reps.', '3-1-1-0', 60, 3, 10, 30),
        ex('Bayesian Behind-Back Cable Curl', 'Bicep Stretch', 'Step forward of pulley for peak stretch. Increase stack by 2.5kg at max reps.', '2-1-1-1', 60, 3, 12, 15),
      ],
      [
        ex('Dumbbell Hammer Curl', 'Brachialis & Forearms', 'Lock upper arms at sides; crisp squeeze. Increase weight by 2.5kg when hitting 12 reps.', '2-1-1-0', 45, 3, 12, 16),
        ex('Cross-Body Pinwheel Curl', 'Brachioradialis', 'Curl smoothly across chest toward opposite shoulder. Add 2.5kg at top target reps.', '2-1-1-0', 45, 3, 12, 16),
        ex('Hanging Knee Raise + TVA Brace', 'Lower Abs', 'Curl pelvis upward without swinging; add 2 reps every session.', '2-1-2-0', 45, 3, 14, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Legs A: Barbell Squats & Quad Foundation',
      'Legs A: Squat Strength, RDLs & Calves',
      'Legs A: Lower-Body Compound Drive',
    ],
    targetMuscle: 'Legs · Quads, Hamstrings & Calves',
    durationMin: 58,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Squat Mobility',
      '5-Min Hip, Ankle & Stomach Vacuum Prep',
      '5-Min Lower-Body Compound Brace',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s full-exhale holds' },
        { name: '90/90 Hip Switches', prescription: '10 slow transitions' },
        { name: 'Knee-to-Wall Ankle Rocks', prescription: '10 per ankle' },
        { name: 'Bodyweight Goblet Pry', prescription: '30s bottom hold' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Glute Bridges', prescription: '2 x 15 reps' },
        { name: 'Cossack Squat Shifts', prescription: '10 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Banded Lateral Walks', prescription: '15 per side' },
        { name: 'Bodyweight Lunges', prescription: '10 per leg' },
        { name: 'Standing Calf Raises', prescription: '15 primer reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Back Squats', 'Quads & Glutes', 'Brace 360° around waist, sink below parallel. Increase weight by 2.5kg when you hit max reps.', '3-1-1-0', 150, 4, 8, 95),
        ex('Hack Squat Machine', 'Quads', 'Feet low-mid; 3s controlled descent. Add 5kg when all 4 sets reach 10 clean reps.', '3-1-1-0', 120, 4, 10, 100),
        ex('Barbell Front Squat', 'Quads & Upper Back', 'Elbows high, torso upright throughout. Increase weight by 2.5kg at top target reps.', '3-1-1-0', 150, 4, 8, 75),
      ],
      [
        ex('Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Push hips back on 3s eccentric keeping bar on shins. Increase weight by 2.5kg at max reps.', '3-1-1-0', 120, 3, 10, 85),
        ex('45° Leg Press', 'Quads & Glutes', 'Full knee flexion without lifting tailbone. Add 5kg once all sets hit 12 clean reps.', '3-1-1-0', 90, 3, 12, 160),
        ex('Bulgarian Split Squat', 'Quads & Glutes', '3s slow eccentric with upright chest. Increase dumbbell by 2.5kg when hitting max reps.', '3-1-1-0', 90, 3, 10, 20),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Lock lap pad down and resist 3s return. Increase pin by 2.5kg when hitting 12 reps.', '3-1-1-0', 60, 3, 12, 50),
        ex('Lying Leg Curl', 'Hamstrings', 'Glue pelvis into bench; 1s top squeeze. Add 2.5kg once all sets hit 12 reps.', '3-1-1-1', 60, 3, 12, 42.5),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings', 'Controlled stretch down to mid-shin. Increase dumbbell by 2.5kg at 10 clean reps.', '3-1-1-0', 90, 3, 10, 28),
      ],
      [
        ex('Seated Leg Extension', 'Quad Sweep', 'Pause 1s at peak lockout for teardrop definition. Add 2.5kg when hitting 15 reps.', '2-1-1-1', 60, 3, 15, 55),
        ex('Walking Dumbbell Lunge', 'Quads & Glutes', 'Smooth upright strides; push through midfoot. Increase weight by 2.5kg at 12 steps.', '2-0-1-0', 75, 3, 12, 18),
        ex('Hip Adductor Machine', 'Inner Thighs & Squat Stability', 'Full controlled stretch and crisp squeeze. Add 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 14, 52.5),
      ],
      [
        ex('Standing Calf Raise', 'Gastrocnemius', '2s stretch at bottom, explosive raise, 1s pause. Increase weight by 2.5kg at 15 reps.', '2-2-1-1', 60, 4, 15, 65),
        ex('Leg-Press Calf Press', 'Calves', 'Full ankle flexion without bending knees. Add 5kg when all sets reach 16 reps.', '2-2-1-1', 60, 4, 16, 110),
        ex('Seated Calf Raise', 'Soleus', 'Slow full range without bouncing out of bottom. Increase weight by 2.5kg at max reps.', '2-2-1-1', 45, 4, 16, 45),
      ],
      [
        ex('Hanging Straight-Leg Raise', 'Lower Abs & TVA', 'Curl pelvis upward without swinging; add 1–2 controlled reps weekly.', '2-1-2-0', 45, 3, 12, 0),
        ex('Weighted Cable Crunch', 'Rectus Abdominis', 'Flex spine downward with strong exhale. Increase stack by 2.5kg at 15 reps.', '2-1-2-0', 45, 3, 15, 35),
        ex('Ab-Wheel Rollout + TVA Brace', 'Anti-Extension Core', 'Keep ribs locked downward; zero oblique bloat. Add 2 reps weekly.', '3-1-1-0', 60, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Push B: Capped Shoulders & Upper Chest',
      'Push B: Overhead Press & Clavicular Width',
      'Push B: 3D Delts, Dips & Triceps',
    ],
    targetMuscle: 'Push · Shoulders, Upper Chest & Triceps',
    durationMin: 54,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Primer',
      '5-Min Cuff Activation & Stomach Vacuum',
      '5-Min Overhead Press & Core Brace',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Cable External Rotations', prescription: '2 x 12 per arm' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Light Lateral Raises', prescription: '15 primer reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band Dislocates', prescription: '12 passes' },
        { name: 'Wall Slides', prescription: '12 reps' },
        { name: 'Scapular Push-Ups', prescription: '12 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Light Rope Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Kettlebell Halos', prescription: '8 each direction' },
        { name: 'Push-Ups', prescription: '10 primer reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Standing Overhead Barbell Press', 'Shoulders & Core', 'Squeeze glutes and brace TVA tight; press straight up. Increase weight by 2.5kg at max reps.', '2-1-1-0', 120, 4, 8, 52.5),
        ex('Seated Dumbbell Shoulder Press', 'Deltoids', 'Control elbows 30° forward; deep shoulder stretch. Add 2.5kg when hitting 10 reps.', '2-1-1-0', 90, 4, 10, 24),
        ex('Smith Machine Overhead Press', 'Deltoid Width', 'Lower cleanly to chin height; drive straight up. Increase load by 2.5kg at max reps.', '3-1-1-0', 90, 4, 10, 52.5),
      ],
      [
        ex('Incline Dumbbell Press (30°)', 'Upper Chest Density', 'Full 3s eccentric stretch across upper pecs. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 10, 30),
        ex('Weighted Bar Dips', 'Chest & Triceps', 'Control deep stretch without rolling shoulders. Add 2.5kg when hitting 10 clean reps.', '3-1-1-0', 90, 4, 10, 15),
        ex('Incline Barbell Bench Press', 'Clavicular Chest', 'Pause lightly above upper chest and press smoothly. Increase by 2.5kg at max reps.', '3-1-1-0', 120, 4, 8, 70),
      ],
      [
        ex('Cable Lateral Raise (Cuff/Handle)', 'Side Delts', 'Sweep outward in scapular plane; 2s eccentric. Increase weight when hitting 15 reps.', '2-1-2-0', 60, 4, 15, 10),
        ex('Dumbbell Lateral Raise (Drop Set)', 'Side Delts', 'Clean form to failure; step up starting dumbbell by 2.5kg at top reps.', '2-0-1-0', 60, 4, 14, 12.5),
        ex('Machine Lateral Raise', 'Side Delt Cap', 'Keep neck relaxed and pause 1s at shoulder height. Add 2.5kg at 15 clean reps.', '2-1-1-1', 60, 4, 15, 35),
      ],
      [
        ex('Pec-Deck Chest Fly', 'Chest Density', 'Open chest wide with soft elbows; 1s inner squeeze. Increase weight by 2.5kg at 14 reps.', '2-1-1-1', 60, 3, 14, 52.5),
        ex('High-to-Low Cable Fly', 'Lower Chest Line', 'Sweep arms down cleanly toward hips. Add 2.5kg once hitting 15 clean reps.', '2-1-1-1', 60, 3, 15, 17.5),
        ex('Low-to-High Cable Fly', 'Upper Chest Shelf', 'Drive hands upward toward collarbones. Increase stack by 2.5kg at max reps.', '2-1-1-1', 60, 3, 14, 15),
      ],
      [
        ex('Cable Rope Face Pulls', 'Rear Delts & Shoulder Health', 'Pull rope beside temples to balance pushing volume. Add 2.5kg at 15 clean reps.', '2-1-1-1', 60, 3, 15, 22.5),
        ex('Overhead Rope Tricep Extension', 'Tricep Long Head', 'Full stretch behind head; smooth lockout. Increase stack by 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 27.5),
        ex('Close-Grip Barbell Bench Press', 'Triceps & Inner Chest', 'Keep elbows tucked 30°; crisp press. Add 2.5kg when hitting 10 clean reps.', '3-1-1-0', 90, 3, 10, 65),
      ],
      [
        ex('Straight-Bar Tricep Pushdown', 'Triceps', 'Lock upper arms beside ribs and press to full lockout. Add 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 32.5),
        ex('Single-Arm Reverse Tricep Pushdown', 'Triceps', 'Keep wrist neutral and squeeze cleanly at bottom. Increase load by 2.5kg at max reps.', '2-1-1-1', 45, 3, 14, 12.5),
        ex('Vacuum Hold + Hanging Knee Raise', 'TVA Waist Control', 'Combine 20s stomach vacuum holds with controlled pelvic lifts.', '2-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Pull B: Back Thickness, Lat Sweep & Arms',
      'Pull B: Bent Rows, Pulldowns & Rear Delts',
      'Pull B: Posterior Width & Bicep Hypertrophy',
    ],
    targetMuscle: 'Pull · Back, Rear Delts & Biceps',
    durationMin: 54,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Pull Primer',
      '5-Min Lat Sweep & Stomach Vacuum',
      '5-Min Thoracic & Scapular Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Dead Hang Scapular Pulls', prescription: '2 x 10 reps' },
        { name: 'Straight-Arm Band Pulldowns', prescription: '2 x 15 reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
        { name: 'Light Band Curls', prescription: '15 primer reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Inverted Body Rows', prescription: '10 primer reps' },
        { name: 'Cat-Cow Flow', prescription: '10 breaths' },
        { name: 'Arm Circles', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Bent-Over Row', 'Mid-Back & Lats', 'Flat spine at 45°, drive bar to lower abs. Increase weight by 2.5kg when hitting max reps.', '2-1-1-0', 120, 4, 8, 75),
        ex('Weighted Pull-Ups', 'Upper Lat Width', 'Dead hang to chest-to-bar pull. Add 2.5kg belt load when hitting 8 clean reps.', '3-1-1-0', 120, 4, 8, 10),
        ex('Chest-Supported Dumbbell Row', 'Upper Back Thickness', 'Pull elbows toward hips and hold 1s peak. Increase dumbbells by 2.5kg at 10 reps.', '2-1-1-1', 90, 4, 10, 30),
      ],
      [
        ex('Neutral-Grip Lat Pulldown', 'Lat Sweep & Width', 'Drive elbows straight down toward hips. Increase stack by 2.5kg at 12 clean reps.', '3-1-1-0', 90, 4, 12, 65),
        ex('Seated Cable Row (Wide Grip)', 'Upper Back & Rhomboids', 'Pull wide bar to lower sternum with 1s pause. Add 2.5kg when hitting max reps.', '2-1-1-1', 75, 4, 12, 62.5),
        ex('Single-Arm Cable Lat Pulldown', 'Outer Lats', 'Stretch arm high overhead, pull elbow to hip. Increase load by 2.5kg at 12 reps.', '2-1-2-0', 60, 3, 12, 30),
      ],
      [
        ex('Straight-Arm Cable Pulldown', 'Lat Isolation & Serratus', 'Keep core braced and press bar cleanly to thighs. Add 2.5kg at 14 clean reps.', '2-1-1-1', 60, 3, 14, 27.5),
        ex('Dumbbell Pullover', 'Lats & Ribcage Expansion', 'Deep overhead stretch with soft elbows. Increase dumbbell by 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 26),
        ex('Meadows Landmine Row', 'Lat Thickness', 'Pull elbow high toward ceiling with controlled lower. Add 2.5kg at max reps.', '2-1-1-0', 75, 3, 10, 35),
      ],
      [
        ex('Cable Face Pulls', 'Rear Delts & Posture', 'Pull rope beside ears with external rotation. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 60, 4, 15, 22.5),
        ex('Reverse Pec-Deck Fly', 'Rear Delts', 'Sweep handles back without shrugging traps. Add 2.5kg when hitting 15 clean reps.', '2-1-1-1', 60, 4, 15, 42.5),
        ex('Cable Cross-Pull Rear Delt Fly', 'Posterior Delts', 'Pull cables diagonally down across body. Increase weight by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('EZ-Bar Bicep Curl', 'Biceps', 'Zero torso swing; 3s controlled eccentric. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 60, 3, 12, 32.5),
        ex('Incline Dumbbell Curl', 'Bicep Long Head', 'Keep elbows pinned behind ribcage. Add 2.5kg when all sets reach 12 clean reps.', '3-1-1-0', 60, 3, 12, 14),
        ex('Seated Concentration Curl', 'Bicep Peak', 'Brace tricep inside thigh for pure bicep isolation. Increase weight by 2.5kg at 12 reps.', '2-1-1-1', 45, 3, 12, 14),
      ],
      [
        ex('Cable Rope Hammer Curl', 'Brachialis & Forearms', 'Keep elbows locked beside ribs and squeeze hard. Add 2.5kg at 14 clean reps.', '2-1-1-1', 45, 3, 14, 25),
        ex('Dumbbell Shrug (2s Hold)', 'Upper Traps', 'Elevate shoulders cleanly with 2s peak hold. Increase load by 2.5kg at 12 reps.', '2-2-1-0', 60, 3, 12, 32),
        ex('Pallof Press + TVA Stomach Vacuum', 'Anti-Rotation Core', 'Resist cable twist while maintaining tight waist brace. Add 2.5kg at 12 reps.', '2-2-2-0', 45, 3, 12, 15),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Legs B: Posterior Chain, RDLs & Split Squats',
      'Legs B: Hack Squat, Hamstrings & Calves',
      'Legs B: Unilateral Leg Power & Posterior Density',
    ],
    targetMuscle: 'Legs · Hamstrings, Quads & Calves',
    durationMin: 56,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Posterior Prep',
      '5-Min Hip Capsule & Stomach Vacuum',
      '5-Min Hamstring & Knee Mobility',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Single-Leg Hinge Reach', prescription: '8 per leg' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Bodyweight Split Squats', prescription: '10 per leg' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Ankle Rocks', prescription: '10 per side' },
        { name: 'Glute Bridges', prescription: '20 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Banded Good Mornings', prescription: '15 reps' },
        { name: 'Cossack Shifts', prescription: '10 reps' },
        { name: 'Standing Calf Stretch', prescription: '30s per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Romanian Deadlift (RDL)', 'Hamstrings & Glutes', 'Hinge hips far back with flat braced back. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 120, 4, 8, 90),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', '3s controlled descent; drive hips tall. Add 2.5kg per hand at 10 clean reps.', '3-1-1-0', 90, 4, 10, 30),
        ex('Trap Bar Deadlift', 'Full Posterior & Quads', 'Wedge hips in and push floor away. Increase load by 5kg when hitting 8 crisp reps.', '2-1-1-0', 150, 4, 8, 110),
      ],
      [
        ex('Bulgarian Split Squat', 'Quads & Glutes', '3s lowering, explosive drive up through midfoot. Increase weight by 2.5kg at max reps.', '3-1-1-0', 90, 3, 10, 20),
        ex('Hack Squat', 'Quads & Glutes', 'Deep controlled knee flexion; smooth lockout. Add 5kg when all sets hit 10 reps.', '3-1-1-0', 120, 4, 10, 100),
        ex('45° Leg Press', 'Quads & Glutes', 'Full range keeping lower back flat on pad. Increase plates by 5kg at 12 reps.', '3-1-1-0', 90, 4, 12, 165),
      ],
      [
        ex('Lying Leg Curl', 'Hamstrings', 'Glue hips flat; 3s controlled negative. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 60, 4, 12, 42.5),
        ex('Seated Leg Curl', 'Hamstrings', 'Full top stretch, 1s contraction. Add 2.5kg once all sets hit 12 clean reps.', '3-1-1-1', 60, 4, 12, 50),
        ex('45° Hyperextension (Weighted)', 'Posterior Chain', 'Drive from hamstrings and glutes cleanly. Increase plate by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 15),
      ],
      [
        ex('Seated Leg Extension', 'Quads', 'Controlled 2s lower and 1s peak pause. Increase stack by 2.5kg at 15 clean reps.', '2-1-1-1', 60, 3, 15, 55),
        ex('Pendulum / Goblet Heel-Elevated Squat', 'Teardrop Quads', 'Stay tall and sink calves onto hamstrings. Add 2.5kg when hitting 12 reps.', '3-1-1-0', 90, 3, 12, 30),
        ex('Hip Adductor Machine', 'Inner Thighs', 'Full range controlled squeeze. Increase weight by 2.5kg at max reps.', '2-1-1-1', 60, 3, 14, 52.5),
      ],
      [
        ex('Seated Calf Raise', 'Soleus & Ankles', '2s bottom pause to kill stretch reflex. Increase weight by 2.5kg at 16 clean reps.', '2-2-1-1', 45, 4, 16, 45),
        ex('Standing Calf Raise', 'Gastrocnemius', 'Full bottom stretch, explosive raise. Add 2.5kg when hitting 15 reps.', '2-2-1-1', 60, 4, 15, 65),
        ex('Leg-Press Calf Press', 'Calves', 'Smooth full ankle travel. Increase stack by 5kg at top target reps.', '2-2-1-1', 60, 4, 16, 110),
      ],
      [
        ex('Hanging Leg Raise + TVA Brace', 'Lower Abs', 'Curl pelvis upward without swinging; add 1–2 reps weekly.', '2-1-2-0', 45, 3, 12, 0),
        ex('Ab-Wheel Rollout', 'Deep Core', 'Keep ribs tucked tight without sagging hips; progress reps cleanly.', '3-1-1-0', 60, 3, 12, 0),
        ex('Weighted Cable Crunch', 'Abs', 'Curl ribs toward pelvis with full exhale. Add 2.5kg when hitting 15 reps.', '2-1-2-0', 45, 3, 15, 35),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Complete CNS Reset & Sleep Bank',
      'Day 7: Restorative Mobility & Step Floor',
      'Day 7: Active Recovery Walk',
    ],
    targetMuscle: 'Rest & Recovery',
    durationMin: 25,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Breath & Joint Decompression',
      '5-Min Thoracic & Hip Release',
      '5-Min Recovery Breathing',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Breath', prescription: '3 x 20s gentle holds' },
        { name: 'Couch Quad & Hip Stretch', prescription: '45s per side' },
        { name: 'Doorway Chest Opener', prescription: '45s' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Pigeon Stretch', prescription: '60s per side' },
        { name: 'Thoracic Foam Roll', prescription: '60s' },
      ],
      [
        { name: 'Seated Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Dead Hang Decompression', prescription: '2 x 30s' },
        { name: 'Calf Stretch', prescription: '45s per leg' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor Daylight Recovery Walk', 'NEAT & Recovery', 'Relaxed nasal breathing to hit step goal and refresh CNS for Monday.', 'Easy Pace', 60, 1, 30, 0),
        ex('Evening Zone-2 Stroll', 'Active Recovery', 'Unplug from screens and lock in 8+ hrs sleep.', 'Easy Pace', 60, 1, 25, 0),
        ex('Mobility Flow & Light Walk', 'Circulation', 'Gentle 20-minute flush for hips and shoulders.', 'Easy Pace', 60, 1, 20, 0),
      ],
    ],
  },
];

const MALE_HYPERTROPHY_MASS_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Push A: Heavy Incline Press & Chest Mass',
      'Push A: Upper Chest Density & Tricep Power',
      'Push A: Compound Pressing & Delt Overload',
    ],
    targetMuscle: 'Push · Chest, Shoulders & Triceps',
    durationMin: 60,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Heavy Push Primer',
      '5-Min Shoulder Cuff & Stomach Vacuum',
      '5-Min Thoracic & Brace Preparation',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Cable External Rotations', prescription: '12 per arm' },
        { name: 'Scapular Push-Ups', prescription: '12 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band Shoulder Dislocates', prescription: '12 passes' },
        { name: 'Incline Push-Ups', prescription: '12 primer reps' },
        { name: 'Wall Slides', prescription: '12 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Light Lateral Raises', prescription: '15 reps' },
        { name: 'Thoracic Foam Roll', prescription: '60s' },
        { name: 'Arm Circles', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Dumbbell Press', 'Upper Chest', 'Full 3s eccentric stretch across upper chest. Increase weight by 2.5kg when you hit max reps.', '3-1-1-0', 150, 4, 8, 36),
        ex('Barbell Bench Press', 'Full Chest Mass', 'Arch upper back, drive feet into floor. Add 2.5kg when all 4 sets hit 6 clean reps.', '3-1-1-0', 150, 4, 6, 85),
        ex('Incline Barbell Bench Press', 'Clavicular Chest', 'Pause 1s above upper chest and press smoothly. Increase bar by 2.5kg at max reps.', '3-1-1-0', 150, 4, 8, 75),
      ],
      [
        ex('Machine Chest Press (Plate-Loaded)', 'Mid Chest Mass', '3s controlled lowering to deep pec stretch. Add 2.5kg when hitting 10 clean reps.', '3-1-1-0', 120, 4, 10, 75),
        ex('Weighted Bar Dips', 'Lower Chest & Triceps', 'Deep stretch, strong lockout every rep. Add 2.5kg belt weight at 10 clean reps.', '3-1-1-0', 120, 3, 10, 17.5),
        ex('Flat Dumbbell Press', 'Chest Hypertrophy', 'Smooth arc keeping elbows 45°. Increase dumbbells by 2.5kg when hitting max reps.', '3-1-1-0', 120, 4, 8, 36),
      ],
      [
        ex('Seated Overhead Dumbbell Press', 'Shoulders', 'Brace core hard; lower to ear level. Increase weight by 2.5kg when hitting 10 reps.', '2-1-1-0', 120, 4, 10, 26),
        ex('Standing Overhead Barbell Press', 'Delts & Core', 'Lock glutes and TVA tight; press straight up. Add 2.5kg at 8 clean reps.', '2-1-1-0', 120, 4, 8, 55),
        ex('Machine Shoulder Press', 'Deltoid Cap', 'Smooth full range without shrugging traps. Increase stack by 2.5kg at max reps.', '3-1-1-0', 90, 4, 10, 55),
      ],
      [
        ex('Dumbbell Lateral Raise', 'Side Delts', 'Lead with elbows; 2s controlled negative. Increase weight when hitting 14 clean reps.', '2-1-2-0', 60, 4, 14, 12.5),
        ex('Cable Lateral Raise', 'Side Deltoids', 'Sweep outward smoothly across body. Add 2.5kg once all sets hit 15 reps.', '2-1-1-0', 60, 4, 15, 10),
        ex('Pec-Deck Chest Fly', 'Chest Isolation', 'Pause 1s at peak contraction across chest. Increase stack by 2.5kg at 12 reps.', '2-1-1-1', 60, 3, 12, 57.5),
      ],
      [
        ex('Close-Grip Barbell Bench Press', 'Triceps Mass', 'Keep elbows tucked 30°; explosive drive up. Increase weight by 2.5kg at 8 reps.', '3-1-1-0', 90, 3, 8, 70),
        ex('EZ-Bar Skullcrusher', 'Tricep Long Head', 'Lower bar smoothly behind head for deep stretch. Add 2.5kg at 10 clean reps.', '3-1-1-0', 75, 3, 10, 32.5),
        ex('Overhead Rope Tricep Extension', 'Triceps', 'Stretch deeply overhead; zero rib flare. Increase stack by 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 30),
      ],
      [
        ex('Straight-Bar Tricep Pushdown', 'Triceps Lateral Head', 'Pin elbows quietly at sides; full lockout. Increase load by 2.5kg at 14 reps.', '2-1-1-1', 60, 3, 14, 35),
        ex('Rope Tricep Pushdown', 'Triceps', 'Spread rope handles wide at bottom. Add 2.5kg when all sets reach 15 reps.', '2-1-1-1', 45, 3, 15, 30),
        ex('Dead Bug TVA Brace + Stomach Vacuum', 'Core Stability', 'Keep lumbar spine pinned flat; progress vacuum hold duration by 5s weekly.', '3-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Pull A: Heavy Pull-Ups, Rows & Lat Width',
      'Pull A: Back Mass & Posterior Thickness',
      'Pull A: Weighted Pulls & Bicep Overload',
    ],
    targetMuscle: 'Pull · Lats, Mid-Back & Biceps',
    durationMin: 60,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Pull Primer',
      '5-Min Lat Engagement & Stomach Vacuum',
      '5-Min Scapular & Thoracic Prep',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Dead Hang Scapular Pull-Ups', prescription: '2 x 10 reps' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Light Band Rows', prescription: '15 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Straight-Arm Band Pulldowns', prescription: '2 x 15 reps' },
        { name: 'Thoracic Open-Books', prescription: '8 per side' },
        { name: 'Wrist Circles', prescription: '30 seconds' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Inverted Body Rows', prescription: '10 primer reps' },
        { name: 'Cat-Cow Flow', prescription: '10 breaths' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Weighted Pull-Ups', 'Lats & Upper Back', 'Full dead-hang stretch; pull chest to bar. Increase belt weight by 2.5kg when hitting max reps.', '3-1-1-0', 120, 4, 8, 12.5),
        ex('Wide-Grip Lat Pulldown', 'Lat Width', 'Drive elbows smoothly toward hips. Add 2.5kg when all sets reach 10 clean reps.', '3-1-1-0', 90, 4, 10, 72.5),
        ex('Pendlay Barbell Row', 'Explosive Back Mass', 'Reset bar dead on floor each rep; pull to lower chest. Increase by 2.5kg at 8 reps.', '2-0-X-1', 120, 4, 8, 77.5),
      ],
      [
        ex('Barbell Bent-Over Row', 'Full Back Thickness', 'Brace abs tight at 45°; pull to navel. Increase weight by 2.5kg when hitting max reps.', '2-1-1-0', 120, 4, 8, 82.5),
        ex('Chest-Supported T-Bar Row', 'Mid-Back & Traps', '1s squeeze at top, 3s lowering stretch. Add 2.5kg once hitting 10 clean reps.', '3-1-1-1', 90, 4, 10, 52.5),
        ex('Single-Arm Dumbbell Row', 'Lower Lats', 'Brace on bench; pull dumbbell toward hip pocket. Increase by 2.5kg at 10 reps.', '2-1-1-0', 75, 4, 10, 36),
      ],
      [
        ex('Seated Close-Grip Cable Row', 'Lower Lats & Mid-Back', 'Stay upright; pull cleanly to lower sternum. Increase stack by 2.5kg at max reps.', '2-1-1-1', 90, 3, 12, 67.5),
        ex('Neutral-Grip Lat Pulldown', 'Lats & Teres Major', 'Pull elbows vertically down beside ribs. Add 2.5kg when hitting 12 clean reps.', '3-1-1-0', 75, 3, 12, 67.5),
        ex('Straight-Arm Cable Pulldown', 'Lats & Serratus', 'Keep core braced and press bar down to thighs. Increase weight by 2.5kg at 14 reps.', '2-1-1-1', 60, 3, 14, 30),
      ],
      [
        ex('Reverse Pec-Deck Rear Delt Fly', 'Posterior Delts', 'Sweep handles wide without shrugging traps. Increase load by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 45),
        ex('Cable Face Pulls', 'Rear Delts & Posture', 'Pull rope beside temples with 1s squeeze. Add 2.5kg when hitting max reps.', '2-1-1-1', 60, 3, 15, 25),
        ex('Dumbbell Shrug (Heavy Controlled)', 'Upper Traps', '2s pause at peak contraction; no rolling. Increase dumbbells by 2.5kg at 12 reps.', '2-2-1-0', 60, 3, 12, 34),
      ],
      [
        ex('EZ-Bar Bicep Curl', 'Biceps Mass', 'Strict elbows at sides; 3s controlled negative. Increase weight by 2.5kg at 10 reps.', '3-1-1-0', 75, 4, 10, 35),
        ex('Barbell Straight-Bar Curl', 'Biceps', 'Full bottom stretch; zero lower-back swing. Add 2.5kg when hitting 8 clean reps.', '3-1-1-0', 75, 4, 8, 35),
        ex('Incline Dumbbell Curl', 'Bicep Long Head', 'Arms behind torso for maximum stretch. Increase dumbbells by 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 16),
      ],
      [
        ex('Dumbbell Hammer Curl', 'Brachialis & Forearms', 'Keep elbows quiet; strong top squeeze. Increase weight by 2.5kg at 12 clean reps.', '2-1-1-0', 60, 3, 12, 18),
        ex('EZ-Bar Preacher Curl', 'Bicep Peak', 'Full smooth extension at bottom. Add 2.5kg once all sets reach 10 clean reps.', '3-1-1-0', 60, 3, 10, 32.5),
        ex('Hanging Straight-Leg Raise', 'Lower Abs & Grip', 'Lift toes smoothly without swinging; add 1–2 controlled reps weekly.', '2-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Legs A: Heavy Barbell Squats & Leg Mass',
      'Legs A: Squat Overload, Leg Press & RDLs',
      'Legs A: Quad Density & Hamstring Power',
    ],
    targetMuscle: 'Legs · Quads, Hamstrings & Calves',
    durationMin: 60,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Heavy Squat Prep',
      '5-Min Hip, Knee & Stomach Vacuum',
      '5-Min Lower Compound Brace',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Knee-to-Wall Ankle Rocks', prescription: '10 per leg' },
        { name: 'Bodyweight Squat Hold', prescription: '2 x 20s' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Glute Bridges', prescription: '2 x 15 reps' },
        { name: 'Cossack Squat Shifts', prescription: '10 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Leg Swings (Front & Lateral)', prescription: '12 each way' },
        { name: 'Walking Lunges', prescription: '10 per leg' },
        { name: 'Standing Calf Stretch', prescription: '30s per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Back Squats', 'Quads & Glutes', 'Brace 360° around waist, full depth every rep. Increase weight by 2.5kg when you hit max reps.', '3-1-1-0', 180, 4, 6, 105),
        ex('Hack Squat Machine', 'Quad Mass', 'Feet low; 3s descent until calves meet hamstrings. Add 5kg when hitting 10 clean reps.', '3-1-1-0', 150, 4, 10, 110),
        ex('Barbell Front Squat', 'Quads & Core', 'Elbows high, upright torso throughout. Increase bar by 2.5kg at 8 clean reps.', '3-1-1-0', 150, 4, 8, 80),
      ],
      [
        ex('45° Leg Press', 'Quads & Glutes', 'Control lowering deep without lifting tailbone. Increase plates by 5kg at 12 clean reps.', '3-1-1-0', 120, 4, 12, 180),
        ex('Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Slow 3s hip hinge keeping bar tight to legs. Add 2.5kg when hitting 8 clean reps.', '3-1-1-0', 120, 4, 8, 95),
        ex('Bulgarian Split Squat', 'Quads & Glutes', 'Deep controlled lunge driving through midfoot. Increase dumbbells by 2.5kg at 10 reps.', '3-1-1-0', 90, 3, 10, 22),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Lock lap pad tight; 3s eccentric return. Increase pin by 2.5kg when hitting 12 reps.', '3-1-1-0', 60, 4, 12, 55),
        ex('Lying Leg Curl', 'Hamstrings', 'Glue hips flat into bench; 1s top pause. Add 2.5kg at top target reps.', '3-1-1-1', 60, 4, 12, 47.5),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings', 'Control deep stretch with flat braced back. Increase load by 2.5kg at 10 reps.', '3-1-1-0', 90, 3, 10, 32),
      ],
      [
        ex('Seated Leg Extension', 'Quads', 'Controlled 2s lower and 1s peak pause. Increase stack by 2.5kg when hitting 15 reps.', '2-1-1-1', 60, 3, 15, 60),
        ex('Walking Dumbbell Lunge', 'Quads & Glutes', 'Long strides with upright braced torso. Add 2.5kg once hitting 12 steps per side.', '2-0-1-0', 75, 3, 12, 20),
        ex('Hip Adductor Machine', 'Inner Thighs', 'Full range controlled squeeze. Increase weight by 2.5kg at 14 clean reps.', '2-1-1-1', 60, 3, 14, 57.5),
      ],
      [
        ex('Standing Calf Raise', 'Gastrocnemius', '2s bottom pause, explosive drive upward. Increase weight by 2.5kg at 15 reps.', '2-2-1-1', 60, 4, 15, 70),
        ex('Leg-Press Calf Press', 'Calves', 'Full ankle flexion without knee bounce. Add 5kg when all sets reach 16 reps.', '2-2-1-1', 60, 4, 16, 120),
        ex('Seated Calf Raise', 'Soleus', 'Slow full range with 2s bottom hold. Increase load by 2.5kg at max reps.', '2-2-1-1', 45, 4, 16, 50),
      ],
      [
        ex('Weighted Cable Crunch', 'Rectus Abdominis', 'Curl ribs toward pelvis on exhale. Increase stack by 2.5kg when hitting 15 reps.', '2-1-2-0', 45, 3, 15, 37.5),
        ex('Ab-Wheel Rollout + TVA Brace', 'Core Mass & Stability', 'Keep ribs tucked tight without lumbar arch; add 2 reps every week.', '3-1-1-0', 60, 3, 12, 0),
        ex('Hanging Knee Raise', 'Lower Abs', 'Controlled pelvic curl without swinging; progress reps weekly.', '2-1-2-0', 45, 3, 14, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Push B: Overhead Press & Shoulder Capping',
      'Push B: Upper Chest, 3D Delts & Tricep Mass',
      'Push B: Heavy Pressing & Lateral Density',
    ],
    targetMuscle: 'Push · Shoulders, Upper Chest & Triceps',
    durationMin: 56,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Primer',
      '5-Min Cuff Prep & Stomach Vacuum',
      '5-Min Overhead Mobility & Brace',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Cable External Rotations', prescription: '2 x 12 per arm' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Light Lateral Raises', prescription: '15 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Band Dislocates', prescription: '12 passes' },
        { name: 'Wall Slides', prescription: '12 reps' },
        { name: 'Scapular Push-Ups', prescription: '12 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Light Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Kettlebell Halos', prescription: '8 each side' },
        { name: 'Arm Circles', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Standing Overhead Barbell Press', 'Shoulders & Core', 'Brace glutes & TVA hard; drive straight up. Increase weight by 2.5kg when hitting max reps.', '2-1-1-0', 120, 4, 8, 55),
        ex('Seated Dumbbell Shoulder Press', 'Deltoids', 'Full controlled range without arching back. Add 2.5kg when hitting 10 clean reps.', '2-1-1-0', 120, 4, 10, 26),
        ex('Smith Machine Overhead Press', 'Deltoid Mass', 'Lower to chin height cleanly. Increase weight by 2.5kg when all sets reach 10 reps.', '3-1-1-0', 90, 4, 10, 55),
      ],
      [
        ex('Incline Dumbbell Press (30°)', 'Upper Chest', '3s slow lowering to deep pec stretch. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 120, 4, 10, 34),
        ex('Incline Barbell Bench Press', 'Clavicular Chest', 'Control bar to upper chest and press smoothly. Add 2.5kg at 8 clean reps.', '3-1-1-0', 120, 4, 8, 75),
        ex('Weighted Bar Dips', 'Chest & Triceps', 'Deep stretch and strong lockout. Increase added load by 2.5kg when hitting 10 reps.', '3-1-1-0', 90, 4, 10, 17.5),
      ],
      [
        ex('Seated Dumbbell Lateral Raise', 'Side Delts', 'Control 2s descent; zero trap shrug. Increase weight when hitting 15 clean reps.', '2-1-2-0', 60, 4, 15, 12.5),
        ex('Behind-Back Cable Lateral Raise', 'Side Delts', 'Sweep outward in scapular plane. Add 2.5kg once hitting 15 clean reps.', '2-1-2-0', 60, 4, 15, 10),
        ex('Machine Lateral Raise', '3D Shoulder Cap', '1s top squeeze without swinging torso. Increase stack by 2.5kg at max reps.', '2-1-1-1', 60, 4, 15, 37.5),
      ],
      [
        ex('Low-to-High Cable Fly', 'Upper Chest Density', 'Sweep upward toward collarbones. Increase load by 2.5kg when hitting 14 reps.', '2-1-1-1', 60, 3, 14, 17.5),
        ex('Pec-Deck Chest Fly', 'Mid Chest', '1s peak squeeze across sternum. Add 2.5kg when all sets reach 12 clean reps.', '2-1-1-1', 60, 3, 12, 57.5),
        ex('Cable Face Pulls', 'Rear Delts & Rotator Cuff', 'Pull rope beside ears with thumbs back. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 60, 3, 15, 25),
      ],
      [
        ex('EZ-Bar Skullcrusher', 'Tricep Long Head', 'Lower cleanly behind head for deep stretch. Increase weight by 2.5kg at 10 reps.', '3-1-1-0', 75, 3, 10, 32.5),
        ex('Overhead Rope Tricep Extension', 'Triceps', 'Full overhead stretch; crisp lockout. Add 2.5kg when hitting 12 clean reps.', '3-1-1-0', 60, 3, 12, 30),
        ex('Close-Grip Smith Press', 'Triceps Mass', 'Keep elbows close; smooth lockout. Increase load by 2.5kg at max reps.', '3-1-1-0', 90, 3, 10, 67.5),
      ],
      [
        ex('Straight-Bar Tricep Pushdown', 'Triceps', 'Lock upper arms beside ribs. Increase stack by 2.5kg when hitting 14 reps.', '2-1-1-1', 45, 3, 14, 35),
        ex('Rope Tricep Pushdown', 'Triceps', 'Flare rope cleanly at full extension. Add 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 30),
        ex('TVA Stomach Vacuum + Hanging Knee Raise', 'Deep Core', 'Pair 20s vacuum holds with strict pelvic curls.', '2-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Pull B: Bent Rows, Lat Width & Arms',
      'Pull B: Posterior Density & Rear Delts',
      'Pull B: Back Overload & Bicep Peak',
    ],
    targetMuscle: 'Pull · Back, Rear Delts & Biceps',
    durationMin: 58,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Back Activation',
      '5-Min Scapular & Stomach Vacuum Prep',
      '5-Min Thoracic & Grip Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Dead Hang Scapular Pulls', prescription: '2 x 10 reps' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Light Band Curls', prescription: '15 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Straight-Arm Band Pulldowns', prescription: '2 x 15 reps' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Inverted Body Rows', prescription: '10 primer reps' },
        { name: 'Cat-Cow Flow', prescription: '10 breaths' },
        { name: 'Wrist Circles', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Bent-Over Row', 'Mid-Back & Lats', 'Flat back at 45°; pull bar to navel cleanly. Increase weight by 2.5kg at max reps.', '2-1-1-0', 120, 4, 8, 82.5),
        ex('Weighted Pull-Ups', 'Upper Lat Width', 'Dead hang to chest-to-bar pull. Add 2.5kg when all sets reach 8 clean reps.', '3-1-1-0', 120, 4, 8, 12.5),
        ex('Chest-Supported T-Bar Row', 'Mid-Back Thickness', '1s top squeeze, 3s eccentric stretch. Increase load by 2.5kg at 10 reps.', '3-1-1-1', 90, 4, 10, 52.5),
      ],
      [
        ex('Neutral-Grip Lat Pulldown', 'Lat Sweep & Width', 'Drive elbows straight down toward hips. Increase stack by 2.5kg at 12 reps.', '3-1-1-0', 90, 4, 12, 67.5),
        ex('Single-Arm Dumbbell Row', 'Lower Lats', 'Sweep elbow back toward hip pocket. Add 2.5kg once hitting 10 clean reps.', '2-1-1-0', 75, 4, 10, 36),
        ex('Seated Wide-Grip Cable Row', 'Upper Back', 'Pull wide bar to sternum with 1s squeeze. Increase stack by 2.5kg at max reps.', '2-1-1-1', 90, 4, 12, 65),
      ],
      [
        ex('Straight-Arm Cable Pulldown', 'Lat Isolation', 'Keep core braced and press bar down to thighs. Add 2.5kg at 14 clean reps.', '2-1-1-1', 60, 3, 14, 30),
        ex('Dumbbell Pullover', 'Lats & Serratus', 'Deep overhead stretch with soft elbows. Increase dumbbell by 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 28),
        ex('Single-Arm Iliac Pulldown', 'Lower Lats', 'Drive elbow cleanly down into hip pocket. Add 2.5kg when hitting 12 reps.', '2-1-2-0', 60, 3, 12, 32.5),
      ],
      [
        ex('Reverse Pec-Deck Fly', 'Rear Delts', 'Sweep wide keeping traps relaxed. Increase stack by 2.5kg at 15 clean reps.', '2-1-1-1', 60, 4, 15, 45),
        ex('Cable Face Pulls', 'Rear Delts & Rotator Cuff', 'Pull rope beside temples with external rotation. Add 2.5kg at max reps.', '2-1-1-1', 60, 4, 15, 25),
        ex('Dumbbell Shrug (2s Pause)', 'Upper Traps', 'Elevate vertically without rolling shoulders. Increase dumbbells by 2.5kg at 12 reps.', '2-2-1-0', 60, 3, 12, 34),
      ],
      [
        ex('Incline Dumbbell Bicep Curl', 'Bicep Long Head', 'Full stretch behind torso; crisp curl. Increase dumbbells by 2.5kg at 12 reps.', '3-1-1-0', 60, 3, 12, 16),
        ex('EZ-Bar Preacher Curl', 'Bicep Peak', 'Full bottom stretch without bouncing. Add 2.5kg when hitting 10 clean reps.', '3-1-1-0', 60, 3, 10, 32.5),
        ex('Barbell Bicep Curl', 'Biceps Mass', 'Lock elbows at sides; 3s descent. Increase bar by 2.5kg at 8 clean reps.', '3-1-1-0', 75, 3, 8, 35),
      ],
      [
        ex('Dumbbell Hammer Curl', 'Brachialis & Forearms', 'Keep elbows pinned quietly at sides. Increase weight by 2.5kg at 12 reps.', '2-1-1-0', 45, 3, 12, 18),
        ex('Cable Rope Hammer Curl', 'Brachialis', 'Smooth controlled curl with 1s top squeeze. Add 2.5kg at 14 clean reps.', '2-1-1-1', 45, 3, 14, 27.5),
        ex('Pallof Press + TVA Stomach Vacuum', 'Core Stability', 'Resist cable twist while maintaining waist tension. Add 2.5kg at 12 reps.', '2-2-2-0', 45, 3, 12, 15),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Legs B: Heavy RDLs, Hack Squats & Calves',
      'Legs B: Posterior Chain & Quad Mass',
      'Legs B: Trap Bar, Split Squats & Hamstrings',
    ],
    targetMuscle: 'Legs · Hamstrings, Quads & Calves',
    durationMin: 58,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Posterior Prep',
      '5-Min Hip Hinge & Stomach Vacuum',
      '5-Min Lower-Body Mobility & Brace',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Single-Leg Hinge Reach', prescription: '8 per leg' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Bodyweight Split Squats', prescription: '10 per leg' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Glute Bridges', prescription: '2 x 15 reps' },
        { name: 'Ankle Rocks', prescription: '10 per leg' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Banded Good Mornings', prescription: '15 reps' },
        { name: 'Cossack Shifts', prescription: '10 reps' },
        { name: 'Standing Calf Stretch', prescription: '30s per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Romanian Deadlift (RDL)', 'Hamstrings & Glutes', 'Slow 3s hip hinge keeping bar on thighs. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 150, 4, 8, 100),
        ex('Trap Bar Deadlift', 'Posterior Chain & Quads', 'Wedge hips cleanly; drive floor away. Add 5kg when all sets hit 6 clean reps.', '2-1-1-0', 150, 4, 6, 125),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', 'Deep hamstring stretch with flat back. Increase dumbbells by 2.5kg at 10 reps.', '3-1-1-0', 90, 4, 10, 32),
      ],
      [
        ex('Hack Squat Machine', 'Quads & Glutes', 'Deep controlled knee flexion to calves. Increase weight by 5kg when hitting 10 reps.', '3-1-1-0', 120, 4, 10, 110),
        ex('Bulgarian Split Squat', 'Quads & Glutes', '3s controlled descent; drive through midfoot. Add 2.5kg at 10 clean reps.', '3-1-1-0', 90, 3, 10, 22),
        ex('Barbell Back Squat (Tempo)', 'Legs Mass', '3s eccentric into bottom pause. Increase bar by 2.5kg when hitting max reps.', '3-1-1-0', 150, 4, 8, 95),
      ],
      [
        ex('Lying Leg Curl', 'Hamstrings', 'Keep hips pressed down; 3s eccentric. Increase stack by 2.5kg at 12 clean reps.', '3-1-1-0', 60, 4, 12, 47.5),
        ex('Seated Leg Curl', 'Hamstrings', 'Full stretch at top, 1s squeeze at bottom. Add 2.5kg when hitting 12 reps.', '3-1-1-1', 60, 4, 12, 55),
        ex('45° Hyperextension (Weighted)', 'Posterior Chain', 'Drive smoothly via glutes and hamstrings. Add 2.5kg plate at 15 reps.', '2-1-1-1', 60, 3, 15, 15),
      ],
      [
        ex('Seated Leg Extension', 'Quads', 'Pause 1s at peak contraction. Increase stack by 2.5kg when hitting 15 clean reps.', '2-1-1-1', 60, 3, 15, 60),
        ex('45° Leg Press', 'Leg Mass', 'Continuous controlled reps without locking knees violently. Add 5kg at 12 reps.', '3-1-1-0', 90, 3, 12, 180),
        ex('Hip Adductor Machine', 'Inner Thighs', 'Full range controlled squeeze. Increase weight by 2.5kg at 14 reps.', '2-1-1-1', 60, 3, 14, 57.5),
      ],
      [
        ex('Seated Calf Raise', 'Soleus', '2s bottom pause to eliminate bounce. Increase weight by 2.5kg at 16 clean reps.', '2-2-1-1', 45, 4, 16, 50),
        ex('Standing Calf Raise', 'Gastrocnemius', 'Full stretch, explosive raise. Add 2.5kg when hitting 15 reps.', '2-2-1-1', 60, 4, 15, 70),
        ex('Leg-Press Calf Press', 'Calves', 'Full ankle flexion and extension. Increase plates by 5kg at 16 reps.', '2-2-1-1', 60, 4, 16, 120),
      ],
      [
        ex('Hanging Leg Raise + TVA Brace', 'Lower Abs', 'Curl pelvis upward without swinging; add 1–2 controlled reps weekly.', '2-1-2-0', 45, 3, 12, 0),
        ex('Ab-Wheel Rollout', 'Core Mass & Stability', 'Keep ribs tucked tight without sagging hips; progress reps cleanly.', '3-1-1-0', 60, 3, 12, 0),
        ex('Weighted Cable Crunch', 'Abs', 'Curl ribs toward pelvis on exhale. Add 2.5kg when hitting 15 reps.', '2-1-2-0', 45, 3, 15, 37.5),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Complete CNS Recovery & Sleep Bank',
      'Day 7: Mobility Reset & Step Floor',
      'Day 7: Active Rest Walk',
    ],
    targetMuscle: 'Rest & Recovery',
    durationMin: 25,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Breath & Joint Decompression',
      '5-Min Soft Tissue & Stretch',
      '5-Min Recovery Breathing',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Breath', prescription: '3 x 20s holds' },
        { name: 'Couch Quad & Hip Stretch', prescription: '45s per side' },
        { name: 'Doorway Chest Opener', prescription: '45s' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Pigeon Stretch', prescription: '60s per side' },
        { name: 'Thoracic Foam Roll', prescription: '60s' },
      ],
      [
        { name: 'Seated Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Dead Hang Decompression', prescription: '2 x 30s' },
        { name: 'Calf Stretch', prescription: '45s per leg' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor Daylight Recovery Walk', 'NEAT & Recovery', 'Maintain daily step baseline and refresh CNS for Monday.', 'Easy Pace', 60, 1, 30, 0),
        ex('Evening Zone-2 Stroll', 'Active Recovery', 'Unplug and prepare for 8+ hours deep sleep.', 'Easy Pace', 60, 1, 25, 0),
        ex('Mobility Flow & Light Walk', 'Circulation', 'Gentle 20-minute flush for joints.', 'Easy Pace', 60, 1, 20, 0),
      ],
    ],
  },
];

const MALE_ATHLETIC_SHRED_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Push A: Upper Chest Density & Shred Power',
      'Push A: Explosive Pressing & 3D Delts',
      'Push A: Clavicular Push & Metabolic Finish',
    ],
    targetMuscle: 'Push · Chest, Shoulders & Conditioning',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Dynamic Push Primer',
      '5-Min Plyo Push, Cuff & Stomach Vacuum',
      '5-Min Athletic Shoulder Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Explosive Incline Push-Ups', prescription: '2 x 8 crisp reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Cable External Rotations', prescription: '12 per arm' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Inchworm to Push-Up', prescription: '6 reps' },
        { name: 'Jumping Jacks', prescription: '45 seconds' },
        { name: 'Band Dislocates', prescription: '12 passes' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Scapular Push-Ups', prescription: '2 x 12 reps' },
        { name: 'Light Kettlebell Halos', prescription: '8 each direction' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Dumbbell Press', 'Upper Chest', '2s controlled lower, crisp drive upward. Increase weight by 2.5kg when you hit max reps.', '2-1-X-0', 90, 4, 10, 28),
        ex('Explosive Barbell Bench Press', 'Chest & Power', 'Controlled 2s descent, fast bar speed up. Add 2.5kg at 8 crisp reps.', '2-1-X-0', 90, 4, 8, 72.5),
        ex('Weighted Bar Dips', 'Chest & Triceps', 'Strong athletic lockout every rep. Add 2.5kg belt load at 12 clean reps.', '2-1-1-0', 75, 4, 12, 12.5),
      ],
      [
        ex('Dumbbell Push Press', 'Explosive Shoulders', 'Short athletic knee dip; drive weights overhead. Increase weight by 2.5kg at 10 reps.', 'Explosive', 75, 4, 10, 20),
        ex('Standing Overhead Barbell Press', 'Shoulders & Core', 'Brace glutes & TVA hard; press straight up. Add 2.5kg at 8 clean reps.', '2-1-1-0', 90, 4, 8, 50),
        ex('Landmine Single-Arm Press', 'Shoulders & Core', 'Drive from rear foot through braced core. Increase load by 2.5kg at max reps.', '2-1-X-0', 60, 3, 10, 22.5),
      ],
      [
        ex('Low-to-High Cable Chest Fly', 'Upper Chest Shred', 'Keep chest tall; short 45s rest. Increase stack by 2.5kg when hitting 15 reps.', '2-1-1-1', 45, 3, 15, 15),
        ex('Pec-Deck Chest Squeeze', 'Pecs', 'Strong 1s hold at peak contraction. Add 2.5kg once hitting 14 clean reps.', '2-1-1-1', 45, 3, 14, 45),
        ex('Decline Explosive Push-Up', 'Chest & Speed', 'Drive hands briskly off floor or bench; add 2 reps weekly.', 'Explosive', 45, 3, 12, 0),
      ],
      [
        ex('Cable Lateral Raise (High Density)', 'Side Delts', 'Short 45s rest for metabolic shoulder cap. Increase stack by 2.5kg at 15 reps.', '2-0-1-0', 45, 4, 15, 7.5),
        ex('Dumbbell Lateral Raise', 'Side Delts', 'Control lowering with soft elbows. Increase dumbbells when hitting 15 clean reps.', '2-1-1-0', 45, 4, 15, 10),
        ex('Behind-Back Cable Lateral Raise', 'Side Delts', 'Continuous tension sweeping outward. Add 2.5kg at 15 clean reps.', '2-1-1-0', 45, 4, 15, 7.5),
      ],
      [
        ex('Overhead Rope Tricep Extension', 'Triceps & Conditioning', 'Full stretch overhead; snappy lockout. Increase stack by 2.5kg at 15 reps.', '2-1-1-0', 45, 3, 15, 22.5),
        ex('Rope Tricep Pushdown', 'Triceps', 'Split rope cleanly at bottom. Add 2.5kg when all sets hit 15 clean reps.', '2-1-1-1', 45, 3, 15, 25),
        ex('Close-Grip Push-Ups (Weighted/Tempo)', 'Triceps Density', '3s lowering, crisp lockout; increase reps weekly.', '3-0-1-0', 45, 3, 15, 0),
      ],
      [
        ex('Assault Bike 20/40 Intervals', 'Metabolic Shred', '20s all-out sprint, 40s steady spin; increase peak wattage weekly.', '20s Sprint', 60, 5, 1, 0),
        ex('Battle Rope / Sled Push Circuit', 'Metabolic Output', '30s maximal sprint / 30s active march; increase sled load weekly.', '30s Sprint', 60, 4, 1, 0),
        ex('Hanging Knee Raise + TVA Vacuum', 'Core Shred', 'Curl pelvis upward without swinging; add 2 reps every week.', '2-1-2-0', 45, 3, 14, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Pull A: Pull-Ups, Rows & Conditioning',
      'Pull A: Wide Lats & Explosive Back Density',
      'Pull A: Athletic Pull & Grip Power',
    ],
    targetMuscle: 'Pull · Lats, Back, Biceps & Conditioning',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Lat Wake-Up',
      '5-Min Dynamic Pull & Stomach Vacuum',
      '5-Min Posterior & Thoracic Prep',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Dead Hang Scapular Pulls', prescription: '2 x 10 reps' },
        { name: 'Kettlebell Swings (Light)', prescription: '2 x 15 reps' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Rowing Erg Warm-Up', prescription: '2 minutes easy' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Inverted Body Rows', prescription: '10 primer reps' },
        { name: 'Arm Circles', prescription: '30 seconds' },
        { name: 'Inchworms', prescription: '6 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Weighted / Explosive Pull-Ups', 'Lats & Power', 'Accelerate chest cleanly toward bar; 2s lower. Increase weight by 2.5kg at max reps.', '2-0-X-1', 90, 4, 10, 7.5),
        ex('Wide-Grip Lat Pulldown', 'Lat Width', 'Pull elbows smoothly toward hips. Add 2.5kg when all sets reach 12 clean reps.', '2-1-1-0', 75, 4, 12, 62.5),
        ex('Pendlay Row (From Floor)', 'Back Power', 'Reset bar cleanly on floor each rep. Increase weight by 2.5kg at 8 clean reps.', 'Explosive', 90, 4, 8, 67.5),
      ],
      [
        ex('Single-Arm Kettlebell Gorilla Row', 'Back & Core Stability', 'Wide athletic stance; alternate powerful rows. Increase bell weight at 10 reps.', '2-1-X-0', 60, 4, 10, 24),
        ex('Seated Cable Row (Fast Tempo)', 'Mid-Back Density', '45–60s rest to keep heart rate high. Add 2.5kg when hitting 12 clean reps.', '2-0-1-1', 60, 4, 12, 55),
        ex('Renegade Dumbbell Row', 'Back & Anti-Rotation', 'Lock hips completely square while rowing. Increase dumbbells by 2.5kg at 12 reps.', '2-1-1-0', 60, 3, 12, 16),
      ],
      [
        ex('Straight-Arm Cable Pulldown', 'Lats & Serratus', 'Keep core braced and press bar down to thighs. Add 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 25),
        ex('Neutral-Grip Lat Pulldown', 'Lats', 'Pull elbows vertically downward cleanly. Increase stack by 2.5kg at 12 reps.', '2-1-1-0', 60, 3, 12, 57.5),
        ex('Band-Assisted Strict Pull-Up', 'Back Endurance', 'High-rep strict dead-hang pulls; reduce band tension weekly.', '2-1-1-0', 60, 3, 12, 0),
      ],
      [
        ex('Cable Face Pulls', 'Rear Delts & Posture', 'Pull rope wide beside temples. Increase stack by 2.5kg when hitting 15 reps.', '2-1-1-1', 45, 3, 15, 20),
        ex('Chest-Supported Rear Delt Fly', 'Posterior Delts', 'High-density sets with strict form. Add 2.5kg when hitting 15 clean reps.', '2-1-1-1', 45, 3, 15, 10),
        ex('Reverse Pec-Deck Fly', 'Rear Delts', 'Sweep handles back without shrugging. Increase stack by 2.5kg at max reps.', '2-1-1-1', 45, 3, 15, 37.5),
      ],
      [
        ex('Alternating Dumbbell Hammer Curl', 'Biceps & Forearms', 'Keep upper arms pinned; crisp tempo. Increase dumbbells by 2.5kg at 14 reps.', '2-1-1-0', 45, 3, 14, 16),
        ex('EZ-Bar Bicep Curl', 'Biceps', 'Controlled 3s eccentric on every rep. Add 2.5kg when all sets reach 12 reps.', '3-1-1-0', 45, 3, 12, 30),
        ex('Incline Dumbbell Bicep Curl', 'Bicep Long Head', 'Full stretch behind torso. Increase weight by 2.5kg at 12 clean reps.', '3-1-1-0', 45, 3, 12, 12.5),
      ],
      [
        ex('500m Rowing Ergometer Sprints', 'Pull Conditioning', 'Drive hard with legs, finish with crisp row; beat split pace weekly.', '500m', 75, 3, 1, 0),
        ex('Heavy Farmer Dumbbell Carry', 'Grip, Traps & Core', '40m fast stride with tall braced posture. Increase load by 2.5kg weekly.', '40m Walk', 60, 4, 1, 28),
        ex('Hollow-Body Hold + TVA Vacuum', 'Core Shred', 'Keep lower spine pinned flat; extend hold by 5s every week.', '30s Work', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Legs A: Barbell Squats & Sprint Power',
      'Legs A: Power Squats & Plyo Conditioning',
      'Legs A: Lower-Body Drive & Posterior Burn',
    ],
    targetMuscle: 'Legs · Quads, Hamstrings & Explosive Power',
    durationMin: 54,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Squat Mobility',
      '5-Min Hip, Knee & Stomach Vacuum Prep',
      '5-Min Athletic Lower Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'A-Skip March', prescription: '30 seconds' },
        { name: 'Cossack Squat Shifts', prescription: '10 reps' },
        { name: 'Box Jump / Pogo Hops', prescription: '2 x 8 soft landings' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Walking Lunges + Twist', prescription: '12 steps' },
        { name: 'Ankle Rocks', prescription: '10 per side' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Glute Bridges', prescription: '20 reps' },
        { name: 'Bodyweight Squat Jumps', prescription: '8 crisp reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Back Squats', 'Legs & Power', 'Control down 2s; drive upward fast. Increase weight by 2.5kg when you hit max reps.', '2-1-X-0', 120, 4, 8, 90),
        ex('Trap Bar Speed Pull', 'Explosive Lower Body', 'Fast leg drive through floor. Add 5kg when all sets hit 6 crisp reps.', 'Explosive', 90, 4, 6, 85),
        ex('Bulgarian Split Squat (Explosive)', 'Unilateral Power', '3s lower; crisp powerful drive up. Increase dumbbells by 2.5kg at 10 reps.', '3-0-X-0', 75, 3, 10, 18),
      ],
      [
        ex('Romanian Deadlifts (RDLs)', 'Hamstrings & Glutes', 'Controlled 3s hinge; crisp lockout. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 3, 10, 75),
        ex('Heavy Kettlebell Swing', 'Posterior Chain', 'Snap hips forcefully; keep abs locked tight. Step up bell weight at 20 clean reps.', 'Explosive', 60, 4, 20, 24),
        ex('Walking Dumbbell Lunge', 'Leg Conditioning', '20 unbroken steps keeping torso tall. Increase dumbbells by 2.5kg at 16 steps.', 'Athletic', 60, 3, 16, 16),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Fast pull; 3s controlled return. Increase stack by 2.5kg when hitting 12 reps.', '3-1-1-0', 60, 3, 12, 47.5),
        ex('Leg Extension (Metabolic Burn)', 'Quads', 'Short 45s rest for crisp quad separation. Add 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 50),
        ex('Leg Press (High Cadence)', 'Leg Density', '20 unbroken controlled reps. Increase plates by 5kg at max reps.', '2-0-1-0', 60, 3, 16, 130),
      ],
      [
        ex('Standing Calf Raise', 'Calves', '2s bottom stretch; explosive drive. Increase weight by 2.5kg at 16 clean reps.', '2-2-1-1', 45, 3, 16, 55),
        ex('Seated Calf Raise', 'Soleus', 'Full ankle range without bouncing. Add 2.5kg when hitting 16 reps.', '2-2-1-1', 45, 3, 16, 42.5),
        ex('Jump Rope / Pogo Calf Conditioning', 'Ankle Elasticity', '60s crisp rhythmic jumps; add 10s work weekly.', '60s Work', 45, 3, 1, 0),
      ],
      [
        ex('Weighted Cable Crunch', 'Abs', 'Curl ribs toward pelvis with strong exhale. Increase stack by 2.5kg at 15 reps.', '2-1-2-0', 45, 3, 15, 35),
        ex('Reverse Crunch', 'Lower Abs', 'Control 3s lower back to bench; add 2 reps weekly.', '3-1-1-0', 45, 3, 15, 0),
        ex('Side Plank + TVA Brace', 'Lateral Core', 'Keep body straight as an arrow; extend hold by 5s weekly.', '30s Hold', 45, 3, 1, 0),
      ],
      [
        ex('Sled Push / Incline Treadmill Sprints', 'Lower Shred', '20s hard drive / 40s walk recovery; increase incline or sled weight weekly.', '20s Sprint', 60, 5, 1, 0),
        ex('Box Jumps / Step-Up Explosive', 'Athletic Power', 'Land softly in quarter-squat every jump; progress box height carefully.', 'Explosive', 60, 3, 10, 0),
        ex('Assault Bike Leg Flush', 'Conditioning', '4 minutes steady high-cadence burn; beat total calories weekly.', '4 Mins', 60, 1, 4, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Push B: Shoulders, Incline Density & Core',
      'Push B: Capped Delts & Upper Chest Shred',
      'Push B: Overhead Power & Push Conditioning',
    ],
    targetMuscle: 'Push · Shoulders, Upper Chest & Triceps',
    durationMin: 50,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Shoulder Primer',
      '5-Min Cuff Activation & Stomach Vacuum',
      '5-Min Thoracic Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Plank Walkouts', prescription: '8 reps' },
        { name: 'Push-Ups', prescription: '12 primer reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'External Rotations', prescription: '12 per arm' },
        { name: 'Light Lateral Raises', prescription: '15 reps' },
        { name: 'Wall Slides', prescription: '12 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Kettlebell Halos', prescription: '8 each side' },
        { name: 'Scapular Push-Ups', prescription: '12 reps' },
        { name: 'Torso Rotations', prescription: '20 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Arnold Press (Standing)', 'Shoulders & Core', 'Brace glutes & TVA tight throughout press. Increase weight by 2.5kg at max reps.', '2-1-1-0', 60, 4, 12, 18),
        ex('Seated Dumbbell Shoulder Press', 'Deltoids', 'Control 3s eccentric; zero back arch. Add 2.5kg when hitting 10 clean reps.', '3-1-1-0', 75, 4, 10, 22),
        ex('Landmine Single-Arm Press', 'Shoulders & Core', 'Drive upward at 45° with stacked ribs. Increase load by 2.5kg at 12 reps.', '2-1-X-0', 60, 4, 12, 22.5),
      ],
      [
        ex('Incline Dumbbell Press (30°)', 'Upper Chest Density', 'Full stretch across upper pecs; crisp drive up. Increase weight by 2.5kg at max reps.', '2-1-X-0', 75, 4, 10, 26),
        ex('Incline Cable Press', 'Upper Chest', 'Keep tempo crisp and heart rate elevated. Add 2.5kg at 12 clean reps.', '2-1-1-0', 60, 4, 12, 22.5),
        ex('Weighted Ring / Bar Dips', 'Chest & Triceps', 'Lean slightly forward; full lockout. Add 2.5kg belt load at 12 reps.', '2-1-1-0', 75, 4, 12, 12.5),
      ],
      [
        ex('Dumbbell Lateral Raise (High Density)', '3D Shoulder Cap', 'Short 45s rest; increase weight when 15 crisp reps are met.', '2-0-1-0', 45, 4, 15, 10),
        ex('Behind-Back Cable Lateral Raise', 'Side Delts', 'Continuous tension sweeping outward. Add 2.5kg at 15 clean reps.', '2-1-1-0', 45, 4, 15, 7.5),
        ex('Upright Cable Row (Wide Grip)', 'Side & Rear Delts', 'Lead with elbows to sternum height. Increase stack by 2.5kg at 14 reps.', '2-1-1-0', 60, 3, 14, 27.5),
      ],
      [
        ex('Cable Chest Cross-Over', 'Pec Definition', 'Sweep hands cleanly together with proud chest. Add 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 15),
        ex('Low-to-High Cable Fly', 'Upper Chest', 'Sweep upward toward collarbones cleanly. Increase load by 2.5kg at 14 reps.', '2-1-1-1', 45, 3, 14, 15),
        ex('Push-Up + Mountain Climbers', 'Chest & Cardio', '12 crisp push-ups straight into 20 climbers; add 2 push-ups weekly.', 'Athletic', 45, 3, 12, 0),
      ],
      [
        ex('Rope Tricep Pushdown', 'Triceps', 'Spread rope apart smoothly at bottom. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 45, 3, 15, 25),
        ex('Overhead Rope Tricep Extension', 'Tricep Long Head', 'Deep overhead stretch; strong lockout. Add 2.5kg at 14 clean reps.', '2-1-1-0', 45, 3, 14, 22.5),
        ex('Bench / Bar Dip Finisher', 'Triceps', 'Crisp controlled reps to metabolic burn; add 2 reps weekly.', '2-0-1-0', 45, 3, 15, 0),
      ],
      [
        ex('Incline Treadmill Sprint Intervals', 'Shred Finisher', '30s fast run / 30s recover at 6% incline; nudge speed weekly.', '30s Sprint', 45, 4, 1, 0),
        ex('Battle Rope Alternating Waves', 'Conditioning', '30s maximal rhythm / 30s rest; add 1 round weekly.', '30s Work', 45, 4, 1, 0),
        ex('TVA Stomach Vacuum + Hanging Knee Raise', 'Core Shred', 'Pair 20s vacuum holds with strict lower-ab curls.', '2-1-2-0', 45, 3, 14, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Pull B: Lat Width, Rows & Conditioning',
      'Pull B: Back Density, Rear Delts & Abs',
      'Pull B: Pull-Up Power & Athletic Arms',
    ],
    targetMuscle: 'Pull · Back, Rear Delts & Conditioning',
    durationMin: 50,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Pull Density Prep',
      '5-Min Lat & Stomach Vacuum Activation',
      '5-Min Thoracic Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Scapular Pulls', prescription: '10 reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Torso Rotations', prescription: '20 reps' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Light Band Rows', prescription: '20 reps' },
        { name: 'Kettlebell Swings (Light)', prescription: '15 reps' },
        { name: 'Arm Circles', prescription: '30 seconds' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'Inverted Body Rows', prescription: '10 primer reps' },
        { name: 'Inchworms', prescription: '6 reps' },
        { name: 'High-Knee March', prescription: '45 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Weighted Pull-Up / Lat Pulldown', 'Back Width', 'Full overhead stretch; pull chest to bar. Increase weight by 2.5kg at max reps.', '2-1-1-0', 75, 4, 10, 60),
        ex('Barbell Bent-Over Row', 'Back Thickness', 'Flat back at 45°, explosive pull to navel. Add 2.5kg when hitting 8 clean reps.', '2-0-X-0', 90, 4, 8, 70),
        ex('Chest-Supported Dumbbell Row', 'Upper Back', 'Drive elbows high toward hips with 1s squeeze. Increase dumbbells by 2.5kg at 12 reps.', '2-1-1-1', 60, 4, 12, 24),
      ],
      [
        ex('Single-Arm Kettlebell Row', 'Back & Core', 'Brace hips square while rowing smoothly. Increase bell weight at 12 clean reps.', '2-1-1-0', 60, 3, 12, 22),
        ex('Neutral-Grip Lat Pulldown', 'Lower Lats', 'Drive elbows vertically downward cleanly. Add 2.5kg when hitting 12 reps.', '2-1-1-0', 60, 3, 12, 57.5),
        ex('Straight-Arm Pulldown', 'Lats & Core', 'Sweep bar cleanly down to thighs. Increase stack by 2.5kg at 15 clean reps.', '2-1-1-1', 45, 3, 15, 25),
      ],
      [
        ex('Rope Face Pulls', 'Rear Delts', 'Pull rope beside ears with external rotation. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 45, 4, 15, 20),
        ex('Reverse Pec-Deck Fly', 'Posterior Delts', 'Sweep handles wide without shrugging. Add 2.5kg when hitting 15 reps.', '2-1-1-1', 45, 4, 15, 37.5),
        ex('Dumbbell Shrug + Carry', 'Traps & Conditioning', '12 strict shrugs then 25m brisk carry. Increase weight by 2.5kg weekly.', 'Combo', 60, 3, 12, 26),
      ],
      [
        ex('Hammer Curl + EZ-Bar Curl', 'Athletic Arms', 'Short 45s rest for crisp arm definition. Increase weight by 2.5kg at 12 reps.', '2-1-1-0', 45, 3, 12, 16),
        ex('Alternating Dumbbell Curl', 'Biceps', 'Control 2s descent without swaying torso. Add 2.5kg when hitting 14 clean reps.', '2-1-1-0', 45, 3, 14, 14),
        ex('Cable Curl', 'Biceps', 'Full bottom stretch and 1s peak squeeze. Increase stack by 2.5kg at 14 reps.', '2-1-1-1', 45, 3, 14, 22.5),
      ],
      [
        ex('Hanging Windshield Wiper / Leg Raise', 'Shredded Core', 'Control rotation smoothly without swinging; add 2 reps weekly.', '2-1-2-0', 45, 4, 12, 0),
        ex('Cable Woodchop + Plank Hold', 'Rotational Core', 'Explosive pull across body; slow return. Increase stack by 2.5kg at 12 reps.', '2-1-2-0', 45, 3, 12, 20),
        ex('Hollow-Body Flutter Kicks + TVA', 'Lower Abs', 'Keep lumbar spine glued flat to mat; add 5s work weekly.', '30s Work', 45, 4, 1, 0),
      ],
      [
        ex('Rowing Machine 250m Sprints', 'Metabolic Finish', 'Explosive leg drive every stroke; lower 250m split weekly.', '250m', 45, 3, 1, 0),
        ex('SkiErg / Battle Rope Finisher', 'Upper Conditioning', '30s hard pull / 30s recover; beat stroke output weekly.', '30s Work', 60, 4, 1, 0),
        ex('Farmer Walk + Plank Superset', 'Core & Grip', '40m heavy walk into 30s hard plank. Increase dumbbell weight by 2.5kg weekly.', 'Combo', 45, 3, 1, 26),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Legs B: RDLs, Split Squats & Conditioning',
      'Legs B: Posterior Power & Athletic Engine',
      'Legs B: Hamstrings, Lunges & Shred Finish',
    ],
    targetMuscle: 'Legs · Hamstrings, Quads & Conditioning',
    durationMin: 50,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min TVA Vacuum & Lower Complex Primer',
      '5-Min Dynamic Mobility & Stomach Vacuum',
      '5-Min Kettlebell & Hip Warm-Up',
    ],
    warmupPools: [
      [
        { name: 'TVA Rib-Tuck & Stomach Vacuum Hold', prescription: '3 x 20s holds' },
        { name: 'Kettlebell Halos', prescription: '8 each side' },
        { name: 'Goblet Squat Pry', prescription: '30s' },
        { name: 'Inchworms', prescription: '6 reps' },
      ],
      [
        { name: 'Supine TVA Engagement & Stomach Vacuum', prescription: '3 x 20s holds' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Single-Leg Hinge Reach', prescription: '8 per side' },
        { name: 'High-Knee March', prescription: '45 seconds' },
      ],
      [
        { name: 'Dead Bug TVA Brace + Stomach Vacuum', prescription: '12 reps + 2 x 20s vacuum' },
        { name: 'Jumping Jacks', prescription: '45 seconds' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Ankle Rocks', prescription: '10 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Romanian Deadlift (RDL)', 'Hamstrings & Glutes', 'Slow 3s hip hinge; crisp lockout. Increase weight by 2.5kg when hitting max reps.', '3-1-1-0', 90, 4, 8, 85),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', 'Keep dumbbells gliding close to shins. Add 2.5kg at 10 clean reps.', '3-1-1-0', 75, 4, 10, 28),
        ex('Kettlebell Swing', 'Posterior Power', 'Snap hips crisply; keep ribs down. Step up bell weight when 20 reps feel easy.', 'Explosive', 45, 4, 20, 22),
      ],
      [
        ex('Bulgarian Split Squat', 'Quads & Glutes', '3s controlled lower; drive hard through front heel. Increase by 2.5kg at max reps.', '3-1-1-0', 75, 3, 10, 18),
        ex('Walking Dumbbell Lunge', 'Leg Conditioning', 'Smooth upright torso step by step. Add 2.5kg when hitting 14 clean steps.', '2-0-1-0', 60, 3, 14, 14),
        ex('Barbell Front Squat / Goblet Squat', 'Quads & Core', 'Stay upright; full depth cleanly. Increase weight by 2.5kg at 10 reps.', '3-1-1-0', 90, 4, 10, 70),
      ],
      [
        ex('Lying Leg Curl', 'Hamstrings', '3s controlled descent; 1s squeeze. Increase pin by 2.5kg at 12 clean reps.', '3-1-1-0', 60, 3, 12, 42.5),
        ex('Seated Leg Curl', 'Hamstrings', 'Full top stretch; smooth return. Add 2.5kg when hitting 12 clean reps.', '3-1-1-1', 60, 3, 12, 47.5),
        ex('Leg Extension', 'Quad Separation', 'Short 45s rest; 1s top lockout. Increase stack by 2.5kg at 15 reps.', '2-1-1-1', 45, 3, 15, 50),
      ],
      [
        ex('Standing Calf Raise', 'Calves', 'Full bottom stretch, crisp pause. Increase weight by 2.5kg at 16 clean reps.', '2-2-1-1', 45, 3, 16, 55),
        ex('Seated Calf Raise', 'Soleus', '2s bottom stretch without bouncing. Add 2.5kg at 16 clean reps.', '2-2-1-1', 45, 3, 16, 42.5),
        ex('Jump Rope Conditioning', 'Ankle Power & Shred', '60s crisp rhythmic jumps; add 10s work weekly.', '60s Work', 45, 3, 1, 0),
      ],
      [
        ex('Mountain Climber Sprints', 'Conditioning & Abs', '30s fast drive keeping shoulders stacked; add 5s work weekly.', '30s Work', 45, 4, 1, 0),
        ex('V-Up + Plank Finisher', 'Core Definition', '15 crisp V-ups straight into 30s plank; add 2 V-ups weekly.', 'Controlled', 45, 3, 15, 0),
        ex('TVA Stomach Vacuum + Dead Bug', 'Waistline Control', 'Full exhale drawing navel inward; extend hold by 5s weekly.', '3-1-2-0', 45, 3, 12, 0),
      ],
      [
        ex('Assault Bike 10-Min Tempo Finish', 'Aerobic Shred', 'Keep steady high wattage throughout finish; beat calorie target weekly.', '10 Mins', 60, 1, 10, 0),
        ex('Barbell / Dumbbell Thruster', 'Legs, Delts & Engine', 'Use squat drive directly into overhead lockout. Add 2.5kg at 10 clean reps.', 'Athletic', 75, 4, 10, 40),
        ex('Incline Treadmill Power Walk', 'Step & Calorie Floor', '10 mins at 8% incline; nudge pace upward every week.', '10 Mins', 60, 1, 10, 0),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Active Recovery & Step Floor',
      'Day 7: Complete CNS Reset',
      'Day 7: Outdoor Recovery Walk',
    ],
    targetMuscle: 'Rest & Mobility',
    durationMin: 25,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min TVA Breath & Recovery Stretch',
      '5-Min Joint Decompression',
      '5-Min Calm Breathwork',
    ],
    warmupPools: [
      [
        { name: 'Supine TVA Stomach Vacuum Breath', prescription: '3 x 20s holds' },
        { name: 'Pigeon Hip Opener', prescription: '60s per side' },
        { name: 'Chest Doorway Stretch', prescription: '45s' },
      ],
      [
        { name: 'Box Breathing + TVA Draw-In', prescription: '4 cycles' },
        { name: 'Thoracic Foam Roll', prescription: '60s' },
        { name: 'Hamstring Stretch', prescription: '45s per leg' },
      ],
      [
        { name: 'Seated Stomach Vacuum Holds', prescription: '3 x 20s holds' },
        { name: 'Dead Hang', prescription: '30s' },
        { name: 'Quad Stretch', prescription: '45s per leg' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor Daylight Walk', 'Active Rest', 'Hit 10.5k step floor easily and sleep 8.0+ hrs.', 'Easy', 60, 1, 25, 0),
        ex('Evening Mobility Walk', 'CNS Reset', 'Unplug and recharge for Monday Push A.', 'Easy', 60, 1, 25, 0),
        ex('Light Stretch & Walk', 'Recovery', 'Gentle movement to refresh joints.', 'Easy', 60, 1, 20, 0),
      ],
    ],
  },
];

function getBlueprintForGoal(gender: Gender, goal: PhysiqueGoal): DayBlueprint[] {
  if (gender === 'female') {
    if (goal === 'Athletic & Toned') return FEMALE_ATHLETIC_TONED_SPLIT;
    if (goal === 'Lean & Petite Sculpt') return FEMALE_LEAN_PETITE_SPLIT;
    return FEMALE_HOURGLASS_SPLIT;
  }

  if (goal === 'Hypertrophy & Mass') return MALE_HYPERTROPHY_MASS_SPLIT;
  if (goal === 'Athletic Shred') return MALE_ATHLETIC_SHRED_SPLIT;
  return MALE_VTAPER_SPLIT;
}

function adaptExerciseForInstruction(
  item: ExercisePlan,
  instructionLower: string,
  gender: Gender,
  scale: number
): ExercisePlan {
  const nameLower = item.name.toLowerCase();

  const replaceWith = (
    name: string,
    muscle: string,
    cue: string,
    baseKg: number
  ): ExercisePlan => {
    const scaled = roundWeight(baseKg * scale);
    return {
      ...item,
      name,
      muscle,
      cue,
      sets: item.sets.map((s) => ({ ...s, weightKg: scaled })),
    };
  };

  if (
    (instructionLower.includes('replace barbell squat') ||
      instructionLower.includes('no barbell squat') ||
      instructionLower.includes('no squat') ||
      instructionLower.includes('replace squat')) &&
    nameLower.includes('squat')
  ) {
    if (nameLower.includes('barbell') || nameLower.includes('back squat') || nameLower.includes('front squat')) {
      return replaceWith(
        'Pendulum / Hack Squat Machine',
        'Quads & Glutes',
        '3s deep eccentric keeping knees tracking toes cleanly. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 40 : 75
      );
    }
  }

  if (
    instructionLower.includes('dumbbell') &&
    (instructionLower.includes('only') || instructionLower.includes('just'))
  ) {
    if (nameLower.includes('hip thrust') || nameLower.includes('glute bridge')) {
      return replaceWith(
        'Single-Leg / Heavy Dumbbell Hip Thrust',
        item.muscle,
        'Brace TVA, pause 1.5s at lockout with heavy dumbbell on hips. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 28 : 34
      );
    }
    if (nameLower.includes('bench') || nameLower.includes('chest press') || nameLower.includes('dip')) {
      return replaceWith(
        'Incline Dumbbell Chest Press',
        'Upper Chest & Front Delts',
        '30° bench angle, 3s lowering phase to deep stretch. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 12.5 : 28
      );
    }
    if (nameLower.includes('pulldown') || nameLower.includes('pull-up') || nameLower.includes('row')) {
      return replaceWith(
        'Chest-Supported Dual Dumbbell Row',
        'Lats & Mid-Back',
        'Sweep elbows back toward hip pockets cleanly. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 12.5 : 24
      );
    }
    if (nameLower.includes('squat') && !nameLower.includes('goblet') && !nameLower.includes('bulgarian')) {
      return replaceWith(
        'Heels-Elevated Dumbbell Goblet Squat',
        item.muscle,
        '3s controlled descent with ribs stacked over pelvis. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 18 : 30
      );
    }
    if (nameLower.includes('leg curl') || nameLower.includes('rdl') || nameLower.includes('deadlift')) {
      return replaceWith(
        'Dumbbell Romanian Deadlift (RDLs)',
        'Hamstrings & Glutes',
        'Hinge hips back keeping dumbbells against thighs. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 16 : 28
      );
    }
    if (nameLower.includes('cable') && nameLower.includes('lateral')) {
      return replaceWith(
        'Seated Dumbbell Lateral Raise',
        'Medial Deltoids',
        'Control 3s eccentric in scapular plane without shrugging. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 6 : 10
      );
    }
    if (nameLower.includes('cable') || nameLower.includes('machine') || nameLower.includes('pec-deck')) {
      return replaceWith(
        'Bent-Over Dumbbell Rear Delt Fly',
        item.muscle,
        'Sweep dumbbells wide with soft elbows and 1s top pause. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 5 : 9
      );
    }
  }

  if (instructionLower.includes('upper chest') && gender === 'male') {
    if (nameLower.includes('flat') || nameLower.includes('pec-deck') || nameLower.includes('dip')) {
      return replaceWith(
        'Low-to-High Upper Chest Cable Fly',
        'Clavicular Upper Chest',
        'Drive elbows upward and inward across upper chest. Increase weight by 2.5kg when you hit max reps.',
        17.5
      );
    }
  }

  if (instructionLower.includes('glute') && gender === 'female') {
    if (nameLower.includes('calf')) {
      return replaceWith(
        'Cable Glute Kickback (30° Outward)',
        'Upper Glute Shelf',
        'Sweep leg back 30° outward with 1s peak squeeze. Increase weight by 2.5kg when you hit max reps.',
        12.5
      );
    }
  }

  if (instructionLower.includes('shoulder') || instructionLower.includes('delt')) {
    if (nameLower.includes('curl') || nameLower.includes('pushdown')) {
      return replaceWith(
        'Behind-the-Back Cable Lateral Raise',
        'Capped Medial Delts',
        'Lead with elbow in scapular plane for continuous tension. Increase weight by 2.5kg when you hit max reps.',
        gender === 'female' ? 5 : 10
      );
    }
  }

  return item;
}

export function buildVariedSplit(
  gender: Gender,
  goal: PhysiqueGoal,
  weightKg: number,
  variationSeed = 0,
  customInstruction?: string
): WorkoutDay[] {
  const blueprint = getBlueprintForGoal(gender, goal);
  const scale =
    gender === 'female' ? Math.max(0.75, weightKg / 60) : Math.max(0.8, weightKg / 80);
  const seed = Math.abs(Math.floor(variationSeed));
  const cleanInstruction = customInstruction?.trim().toLowerCase() ?? '';

  return blueprint.map((day) => {
    const dayVariantIdx = (seed + day.dayIndex) % 3;
    const warmupPool = day.warmupPools[dayVariantIdx] ?? day.warmupPools[0];
    const warmupTitle = day.warmupTitleVariants[dayVariantIdx] ?? day.warmupTitleVariants[0];
    const title = day.titleVariants[dayVariantIdx] ?? day.titleVariants[0];

    const warmupDrills: WarmupDrill[] = warmupPool.map((w, idx) => ({
      id: `d${day.dayIndex}-v${seed}-w${idx}`,
      name: w.name,
      prescription: w.prescription,
      completed: false,
    }));

    const exercises: ExercisePlan[] = day.exerciseSlots.map((slot, slotIdx) => {
      const pickIdx = (seed + slotIdx) % slot.length;
      const chosen = slot[pickIdx];
      const scaledWeight = roundWeight(chosen.baseWeightKg * scale);
      const repDelta = seed % 3 === 1 ? 2 : seed % 3 === 2 && chosen.targetReps > 8 ? -1 : 0;
      const reps = Math.max(1, chosen.targetReps + repDelta);

      const exId = `d${day.dayIndex}-v${seed}-e${slotIdx}`;
      const baseExercise: ExercisePlan = {
        id: exId,
        name: chosen.name,
        muscle: chosen.muscle,
        cue: chosen.cue,
        tempo: chosen.tempo,
        restSeconds: chosen.restSeconds,
        sets: makeSets(chosen.setsCount, scaledWeight, reps, exId),
      };

      return cleanInstruction && !day.isRestDay
        ? adaptExerciseForInstruction(baseExercise, cleanInstruction, gender, scale)
        : baseExercise;
    });

    return {
      dayIndex: day.dayIndex,
      dayLabel: day.dayLabel,
      title,
      targetMuscle: day.targetMuscle,
      durationMin: day.durationMin,
      isRestDay: day.isRestDay,
      warmupTitle,
      warmupDrills,
      exercises,
      completedToday: false,
    };
  });
}

export function buildVariedQuotes(
  _name: string,
  vibe: MotivationVibe,
  variationSeed = 0
): string[] {
  let base: string[];

  if (vibe === 'Unapologetic Hype') {
    base = [
      'Nobody builds an elite silhouette by negotiating with comfort.',
      'Clock in with focus. Every heavy rep today compounds into tomorrow.',
      'The standard kept in private shows up in every room entered.',
      'Zero shortcuts. Own the eccentric tempo, own the pause, own the finish.',
      'Energy follows execution. Step onto the floor and set the pace.',
      'Hydrate with intent, train with precision, recover like a pro.',
      'True physique progression is forged in the final two controlled reps.',
      'Consistency looks effortless only to people who missed the early mornings.',
      'Outwork yesterday’s baseline. Today’s training block is waiting.',
      'Precision beats intensity without direction. Hit every coaching cue clean.',
      'Progressive overload rewards patience. Earn the next 2.5kg jump.',
      'Sweat is proof that structured hypertrophy is turning physical.',
      'Lock the grip, brace the core, and dominate every working set.',
      'Consistency across months speaks louder than any single session.',
      'Every liter of water and every clean rep compounds in your favor.',
      'Make this training block the standard-setter for the entire week.',
      'Leave zero doubt on the gym floor—log every set accurately.',
      'Chase mechanical tension on the target muscle, never random fatigue.',
      'Strong posture, full range of motion, relentless execution.',
      'Finish every set with clean mechanics when the rest clock hits zero.',
    ];
  } else if (vibe === 'Elite Discipline') {
    base = [
      'Precision in the warm-up dictates output in the working sets.',
      'Control the eccentric. Gravity is free resistance that must be earned.',
      'Track every kilogram, log every liter, and protect every hour of sleep.',
      'Physique architecture is a series of deliberate, objective decisions.',
      'Neural recovery drives hypertrophy. Protect the nightly sleep window.',
      'Execute the training block cleanly, even when motivation stays quiet.',
      'Three seconds down, one second pause—that is where shape is built.',
      'Small daily adherence habits create massive quarterly results.',
      'Hydration fuels contraction velocity. Keep daily intake on schedule.',
      'Master the core biomechanics and physique symmetry follows naturally.',
      'Tension on the target muscle always outranks ego weight on the bar.',
      'Honor the rest timer. High-threshold output requires full recovery.',
      'Align the spine, engage the TVA, and keep every line clean.',
      'Training metrics do not lie. Let logged reps guide the next weight jump.',
      'Ninety days of steady progression beats nine days of random intensity.',
      'Daily step count is silent conditioning. Hit the floor before midnight.',
      'Treat warm-up mobility and stomach vacuums as non-negotiable armor.',
      'Every set logged today becomes the benchmark to beat next week.',
      'Deep sleep is anabolic architecture. Wind down on schedule.',
      'Calm focus, clinical execution, measurable progressive overload.',
    ];
  } else {
    base = [
      'Every controlled repetition refines strength, posture, and athletic presence.',
      'Everything fits better when strength is built through structured training.',
      'Take full ownership of the pause. Quality physiques are built with patience.',
      'Hydrate, move with poise, and watch daily discipline reshape the frame.',
      'The mirror is simply catching up to the consistency already in motion.',
      'Treat today’s hypertrophy session like a non-negotiable appointment.',
      'Balanced development, strong posterior chain, calm focus—an unfair edge.',
      'Every warm-up drill primes joints for safer, heavier progressive overload.',
      'Protect eight hours of restorative sleep to lock in training adaptations.',
      'Move with intention. Clean tempo transforms every working set.',
      'Grace and control under heavy load is the ultimate athletic signature.',
      'Hit the hydration target, bank the daily steps, and own the floor.',
      'Physique symmetry responds directly to consistent weekly volume.',
      'Slow eccentric, deep mind-muscle connection, unapologetic standards.',
      'Nothing matches the confidence of earning every kilogram on the logbook.',
      'Let the warm-up activate deep stability before loading the first compound.',
      'Respect recovery days as high-value performance maintenance.',
      'Built by biomechanics, refined by progressive overload, sustained by habit.',
      'Notice how effortless structure feels once training becomes identity.',
      'Step onto the floor composed and leave knowing the benchmark moved up.',
    ];
  }

  const offset = (variationSeed * 5) % base.length;
  return [...base.slice(offset), ...base.slice(0, offset)];
}
