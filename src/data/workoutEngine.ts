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
// 6 COMPLETELY DISTINCT 6-DAY TRAINING SPLITS (+ DAY 7 RECOVERY) WITH VARIATION POOLS
// ============================================================================

const FEMALE_HOURGLASS_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Day 1: Heavy Glute Max & Side Delts',
      'Day 1: Glute Bridge Power & Shoulder Caps',
      'Day 1: Posterior Shelf & Lateral Delts',
    ],
    targetMuscle: 'Glute Max & Side Delts',
    durationMin: 55,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Glute & Hip Capsule Activation',
      '5-Min Posterior Chain & Delt Primer',
      '5-Min Hip Mobility & Glute Firing',
    ],
    warmupPools: [
      [
        { name: 'Banded Lateral Monster Walks', prescription: '2 x 16 steps each side' },
        { name: 'Bodyweight Frog Pumps', prescription: '2 x 20 controlled reps' },
        { name: '90/90 Hip Internal Rotations', prescription: '8 slow switches per side' },
        { name: 'Light Band Pull-Aparts', prescription: '2 x 15 reps' },
      ],
      [
        { name: 'Banded Clamshell Hold + Pulse', prescription: '2 x 20 per side' },
        { name: 'Single-Leg Glute Bridge March', prescription: '2 x 12 per leg' },
        { name: 'Standing Hip Circles', prescription: '10 forward/back per leg' },
        { name: 'Scapular Wall Slides', prescription: '2 x 12 reps' },
      ],
      [
        { name: 'Seated Banded Hip Abductions', prescription: '2 x 25 rapid reps' },
        { name: 'Quadruped Fire Hydrants', prescription: '2 x 15 per side' },
        { name: 'World Greatest Stretch', prescription: '6 reps per side' },
        { name: 'Light Dumbbell Lateral Sweeps', prescription: '15 primer reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Hip Thrust (Peak Pause)', 'Glute Max', 'Drive through heels, tuck ribs, hold 1.5s lockout.', '2-1-1-1', 120, 4, 10, 75),
        ex('Smith Machine Kas Glute Bridge', 'Glute Max Isolation', 'Short controlled range; shins stay vertical throughout.', '2-2-1-0', 90, 4, 12, 70),
        ex('Single-Leg Barbell Hip Thrust', 'Unilateral Glutes', 'Keep pelvis dead level; explosive drive through heel.', '2-1-1-1', 90, 3, 10, 40),
      ],
      [
        ex('Dumbbell Romanian Deadlift', 'Glutes & Hamstrings', 'Hinge hips straight back until hamstrings reach full stretch.', '3-1-1-0', 90, 3, 12, 16),
        ex('B-Stance Barbell RDL', 'Upper Glute Tie-In', '85% weight on front heel; back toe acts as kickstand.', '3-1-1-0', 90, 3, 10, 45),
        ex('Cable Glute Pull-Through', 'Glute Max', 'Keep arms long and drive hips forward into lockout.', '2-1-1-1', 60, 4, 15, 25),
      ],
      [
        ex('Cable Lateral Raise (Ankle Cuff)', 'Side Deltoids', 'Sweep outward in scapular plane to widen shoulder line.', '2-1-1-0', 60, 4, 15, 5),
        ex('Seated Dumbbell Lateral Raise (1.5 Reps)', 'Side Deltoids', 'Raise to shoulder height, dip halfway, raise again.', '2-1-1-0', 60, 4, 12, 6),
        ex('Machine Lateral Raise (Slow Eccentric)', '3D Shoulder Cap', 'Keep traps relaxed; 3s lowering phase every rep.', '3-1-1-0', 60, 4, 15, 17.5),
      ],
      [
        ex('45° Glute-Biased Back Extension', 'Upper Glutes', 'Round upper back slightly, flare toes 30°, squeeze glutes.', '2-1-1-0', 60, 3, 15, 10),
        ex('Cable Glute Kickback (30° Outward)', 'Upper Glute Shelf', 'Kick slightly diagonal to align with glute max fibers.', '2-1-1-1', 60, 3, 15, 12.5),
        ex('Seated Hip Abduction (Lean Forward)', 'Glute Medius', 'Hold peak stretch outward for 1s every single rep.', '2-1-2-0', 60, 4, 18, 45),
      ],
      [
        ex('Reverse Deficit Dumbbell Lunge', 'Glute Stretch & Quads', 'Step off 2-inch plate; drive cleanly through front heel.', '3-1-1-0', 75, 3, 10, 10),
        ex('Wide-Stance Smith Split Squat', 'Glutes & Inner Thighs', 'Long stride with slight forward torso lean.', '3-1-1-0', 75, 3, 10, 35),
        ex('Heel-Elevated Sumo Goblet Squat', 'Lower Glutes & Adductors', 'Sink hips straight between knees with proud chest.', '3-1-1-0', 75, 3, 12, 18),
      ],
      [
        ex('Seated Calf Raise + Ankle Pump', 'Calves & Symmetry', 'Full 2s stretch at bottom; crisp lockout at top.', '2-2-1-1', 45, 3, 15, 25),
        ex('Cable Side-Lying Hip Abduction', 'Glute Medius Cap', 'Keep top hip stacked forward without rolling back.', '2-1-1-1', 45, 3, 16, 7.5),
        ex('Supine TVA Stomach Vacuum Hold', 'Deep Waist Cincher', 'Full exhale drawing navel to spine without oblique strain.', '20s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Day 2: Upper Back Taper & TVA Vacuum',
      'Day 2: Lat Width, Delts & Deep Waist Cincher',
      'Day 2: Scapular Posture & Hourglass Upper',
    ],
    targetMuscle: 'Lats, Delts & TVA Core',
    durationMin: 50,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Thoracic & Scapular Priming',
      '5-Min Shoulder & Ribcage Mobility',
      '5-Min Upper Taper & Breath Brace',
    ],
    warmupPools: [
      [
        { name: 'Open-Book Thoracic Rotations', prescription: '8 per side' },
        { name: 'Scapular Lat Pull-Downs', prescription: '2 x 12 slow holds' },
        { name: 'Diaphragmatic Vacuum Breaths', prescription: '3 x 20s holds' },
      ],
      [
        { name: 'Foam Roller Thoracic Extension', prescription: '10 slow glides' },
        { name: 'Band External Rotations', prescription: '2 x 12 per arm' },
        { name: 'Dead Bug Core Bracing', prescription: '12 controlled reps' },
      ],
      [
        { name: 'Wall Angel Shoulder Slides', prescription: '2 x 12 reps' },
        { name: 'Straight-Arm Band Pulldowns', prescription: '2 x 15 light reps' },
        { name: 'Supine TVA Draw-In', prescription: '3 x 20s holds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Wide-Grip Neutral Lat Pulldown', 'Latissimus Dorsi', 'Drive elbows toward hips to accentuate waist contrast.', '3-1-1-0', 90, 4, 12, 35),
        ex('Assisted Wide Pull-Up', 'Upper Lat Width', 'Pull chest toward bar; avoid upper-trap shrugging.', '3-1-1-0', 90, 4, 10, 25),
        ex('Single-Arm Kneeling Cable Pulldown', 'Outer Lat Sweep', 'Keep torso upright and pull elbow cleanly to hip.', '2-1-2-0', 60, 3, 12, 17.5),
      ],
      [
        ex('Seated Dumbbell Shoulder Press', 'Deltoids', 'Keep elbows 30° forward; zero lower-back arch.', '2-1-1-0', 90, 3, 12, 10),
        ex('Incline Dumbbell Press (30°)', 'Upper Chest & Posture', 'Control 3s descent for balanced upper-body frame.', '3-1-1-0', 90, 3, 12, 10),
        ex('Arnold Dumbbell Press', '3D Shoulders', 'Smooth rotation overhead; pause 1s at bottom.', '2-1-1-0', 90, 3, 12, 8),
      ],
      [
        ex('Chest-Supported Cable Row', 'Mid-Back & Rear Delts', 'Pinch shoulder blades cleanly for 1s at peak.', '2-1-1-0', 60, 3, 14, 27.5),
        ex('Cable Face Pull (Thumbs Back)', 'Rear Delts & Posture', 'Pull rope toward forehead; external rotate at finish.', '2-1-1-1', 60, 3, 15, 15),
        ex('Reverse Pec-Deck Fly', 'Posterior Delts', 'Sweep arms wide without shrugging traps.', '2-1-1-1', 60, 4, 15, 22.5),
      ],
      [
        ex('Dead Bug + Stomach Vacuum', 'Transverse Abdominis', 'Zero bulky oblique work; glue lumbar spine to mat.', '3-1-2-0', 60, 3, 12, 0),
        ex('Hollow-Body Breath Hold', 'Deep Core Cincher', 'Exhale ribs downward; maintain tight flat waist.', '30s Hold', 60, 3, 1, 0),
        ex('Quadruped Stomach Vacuum', 'TVA Waist Control', 'Draw navel toward spine for 20s isometric holds.', '20s Hold', 45, 4, 1, 0),
      ],
      [
        ex('Behind-the-Back Cable Lateral Raise', 'Side Delts', 'Sweep outward smoothly to sharpen shoulder-to-waist ratio.', '2-1-2-0', 60, 3, 15, 5),
        ex('Dumbbell Lateral Raise (Seated)', 'Medial Delts', 'Pause lightly at shoulder height without shrugging.', '2-1-1-1', 60, 3, 15, 6),
        ex('Straight-Arm Cable Pulldown', 'Outer Lats & Posture', 'Sweep bar to thighs keeping ribcage tall.', '2-1-1-1', 60, 3, 14, 20),
      ],
      [
        ex('Rope Tricep Pushdown (High Rep)', 'Toned Triceps', 'Pin elbows beside ribs; spread rope cleanly at bottom.', '2-1-1-1', 45, 3, 15, 15),
        ex('Incline Dumbbell Bicep Curl', 'Sculpted Arms', 'Full stretch behind torso; crisp controlled curl.', '2-1-1-0', 45, 3, 14, 7),
        ex('Overhead Cable Tricep Extension', 'Tricep Long Head', 'Deep stretch overhead to refine upper-arm line.', '2-1-1-0', 45, 3, 14, 15),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Day 3: Glute Medius & Unilateral Legs',
      'Day 3: Split Squats & Hamstring Tie-In',
      'Day 3: Single-Leg Symmetry & Abduction',
    ],
    targetMuscle: 'Glute Medius & Unilateral Quads',
    durationMin: 55,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Single-Leg & Ankle Mobility Prep',
      '5-Min Hip Stabilizer & Knee Activation',
      '5-Min Unilateral Balance & Glute Prep',
    ],
    warmupPools: [
      [
        { name: 'Banded Seated Hip Abductions', prescription: '2 x 25 pulses' },
        { name: 'Knee-to-Wall Ankle Rocks', prescription: '10 per side' },
        { name: 'Split Squat Isometric Hold', prescription: '20s each leg' },
      ],
      [
        { name: 'Single-Leg Romanian Hinge Reach', prescription: '8 per side' },
        { name: 'Side-Lying Leg Raises', prescription: '2 x 15 per side' },
        { name: 'Cossack Squat Shifts', prescription: '10 slow transitions' },
      ],
      [
        { name: 'Banded Standing Kickbacks', prescription: '2 x 15 per leg' },
        { name: 'Goblet Squat Bottom Pry', prescription: '30s stretch' },
        { name: 'Glute Bridge Single-Leg Hold', prescription: '20s per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Glute-Biased Bulgarian Split Squat', 'Glutes & Quads', 'Slight forward torso lean, long stance, drive through heel.', '3-1-1-0', 90, 3, 10, 12.5),
        ex('Deficit Dumbbell Step-Up', 'Upper Glute Max', 'Zero push-off from bottom foot; pull via lead glute.', '2-1-1-0', 90, 3, 10, 10),
        ex('Glute-Biased Walking Lunge', 'Glutes & Quads', 'Long stride with slight forward hinge; push through front heel.', '2-0-1-0', 90, 3, 12, 10),
      ],
      [
        ex('45° High-Foot Leg Press', 'Glutes & Hamstrings', 'Place feet high and shoulder-width; keep heels planted.', '3-1-1-0', 90, 4, 12, 85),
        ex('Sumo Smith Squat', 'Inner Thighs & Glutes', 'Wide stance, knees track over toes, deep controlled bottom.', '3-1-1-0', 90, 4, 12, 50),
        ex('Heel-Elevated Dumbbell Goblet Squat', 'Quads & Glutes', 'Sink hips straight down; keep chest proud.', '3-1-1-0', 90, 4, 12, 18),
      ],
      [
        ex('Seated Hip Abduction Machine', 'Glute Medius Shelf', 'Control return for 2s; avoid snapping weight stack.', '2-1-2-0', 60, 4, 18, 45),
        ex('Cable Standing Hip Abduction', 'Upper Side Glutes', 'Sweep leg outward smoothly without leaning torso.', '2-1-1-1', 60, 3, 15, 7.5),
        ex('45° Side-Lying Banded Abduction', 'Glute Medius', 'Keep top hip stacked forward; high-tension pulses.', '1-1-1-0', 45, 3, 25, 0),
      ],
      [
        ex('Lying Hamstring Curl', 'Hamstrings', 'Glue hips flat into bench; 1s squeeze at peak flexion.', '3-1-1-0', 60, 3, 12, 25),
        ex('Seated Leg Curl', 'Hamstrings', 'Drive heels fast; control return for 3 full seconds.', '3-1-1-0', 60, 3, 12, 30),
        ex('Swiss Ball Hamstring Curl', 'Posterior Chain', 'Keep hips bridged high throughout every curl.', '2-1-1-0', 60, 3, 15, 0),
      ],
      [
        ex('Weighted Dumbbell Frog Pump', 'Glute Pump & Tie-In', 'Soles together, knees wide, pause 1s at peak contraction.', '1-1-1-0', 45, 3, 22, 16),
        ex('Hip Adductor Machine (Controlled)', 'Inner Thigh Sculpt', 'Smooth 2s open stretch; strong squeeze inward.', '2-1-1-1', 60, 3, 15, 35),
        ex('Cable Standing Glute Kickback', 'Upper Glute Max', 'Keep standing leg soft and pelvis square.', '2-1-1-1', 45, 3, 15, 10),
      ],
      [
        ex('Leg Extension (Controlled Finisher)', 'Quad Line', 'Light-moderate weight for teardrop quad definition.', '2-1-1-1', 45, 3, 15, 30),
        ex('Standing Single-Leg Calf Raise', 'Lower-Leg Balance', 'Full 2s stretch at bottom step.', '2-2-1-1', 45, 3, 15, 10),
        ex('Pilates Leg Lowering + Core Brace', 'Deep Lower Abs', 'Lower legs smoothly without arching lower back.', '3-1-1-0', 45, 3, 14, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Day 4: Waistline & Posture Flow (Recovery)',
      'Day 4: Active Mobility & Incline Walk',
      'Day 4: Deep Core & Lymphatic Reset',
    ],
    targetMuscle: 'Active Recovery & TVA',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Fascial Decompression',
      '5-Min Hip & Thoracic Release',
      '5-Min Posture & Breath Reset',
    ],
    warmupPools: [
      [
        { name: 'Cat-Cow Spinal Wave', prescription: '10 slow breaths' },
        { name: 'Couch Hip Flexor Stretch', prescription: '45s per side' },
        { name: 'Wall Angel Slides', prescription: '2 x 10 reps' },
      ],
      [
        { name: 'Pigeon Glute Release', prescription: '60s per side' },
        { name: 'Thoracic Foam Roll', prescription: '90s gentle glide' },
        { name: 'Box Breathing Reset', prescription: '4 cycles' },
      ],
      [
        { name: 'Child Pose Lat Reach', prescription: '45s each side' },
        { name: 'Frog Groin Opener', prescription: '60s gentle rock' },
        { name: 'Diaphragmatic Nasal Breath', prescription: '2 minutes' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Treadmill Glute Walk', 'Aerobic Recovery', '6% incline, brisk pace, upright ribcage without CNS fatigue.', 'Steady', 60, 1, 25, 0),
        ex('Outdoor Daylight Step Walk', 'NEAT Conditioning', 'Keep strides smooth and relaxed to clear lower-body soreness.', 'Steady', 60, 1, 30, 0),
        ex('Zone-2 Stair Climber (Easy)', 'Glute Blood Flow', 'Light steady step cadence keeping heart rate conversational.', 'Steady', 60, 1, 20, 0),
      ],
      [
        ex('Supine TVA Vacuum Series', 'Deep Core Cincher', 'Exhale fully, draw navel toward spine, hold 20s.', '20s Hold', 60, 4, 1, 0),
        ex('Bird-Dog Anti-Rotation Hold', 'Deep Core Stability', 'Extend opposite arm/leg without shifting pelvis.', '3s Hold', 45, 3, 10, 0),
        ex('Seated Posture Vacuum + Rib Tuck', 'Transverse Abdominis', 'Practice keeping waist tight with calm nasal breathing.', '20s Hold', 45, 4, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Day 5: Glute Shelf & Capped Shoulders',
      'Day 5: Hyperextensions, Thrusts & Delts',
      'Day 5: Upper Glute Density & Shoulder Taper',
    ],
    targetMuscle: 'Upper Glutes & Shoulders',
    durationMin: 55,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Posterior & Delt Activation',
      '5-Min Glute Medius & Cuff Primer',
      '5-Min Hinge & Lateral Raise Prep',
    ],
    warmupPools: [
      [
        { name: 'Banded Frog Bridges', prescription: '2 x 20 reps' },
        { name: 'Banded Good Mornings', prescription: '2 x 15 reps' },
        { name: 'Light Y-T Shoulder Raises', prescription: '2 x 10 reps' },
      ],
      [
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
        { name: 'Single-Leg Hip Hinge', prescription: '8 per leg' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
      ],
      [
        { name: 'Banded Clamshells', prescription: '2 x 20 per side' },
        { name: 'Bodyweight Split Squats', prescription: '10 per leg' },
        { name: 'Arm Circles + External Rotations', prescription: '15 each' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Smith Machine Hip Thrust (1.5 Reps)', 'Glute Max', 'Full thrust, drop halfway, lock back out for max tension.', '2-1-1-1', 120, 4, 10, 65),
        ex('Barbell Glute Bridge (Feet Close)', 'Lower & Mid Glutes', 'Control lowering just above floor without resting bar.', '2-1-1-1', 90, 4, 12, 70),
        ex('Dumbbell Sumo Squat on Blocks', 'Glutes & Inner Thigh', 'Deep stretch between blocks; drive knees out.', '3-1-1-0', 90, 4, 12, 24),
      ],
      [
        ex('Cable Glute Kickback (Straight Back)', 'Glute Max', 'Slight knee bend; lock pelvis square.', '2-1-1-1', 60, 3, 15, 12.5),
        ex('45° Hyperextension (Rounded Upper Back)', 'Upper Glutes', 'Keep chin tucked and initiate lift from glutes.', '2-1-1-1', 60, 3, 15, 10),
        ex('Banded Dumbbell Frog Pump', 'Glute Pump Finisher', 'Soles together, knees flared, rapid controlled lockouts.', '1-1-1-0', 60, 3, 25, 15),
      ],
      [
        ex('Dumbbell Lateral Raise (Drop Set)', 'Side Deltoids', 'Lead with elbows; keep shoulders down away from ears.', '2-1-1-0', 60, 4, 15, 6),
        ex('Upright Cable Row (Wide Grip)', 'Side & Rear Delts', 'Pull rope/bar just to sternum height with wide elbows.', '2-1-1-0', 60, 3, 14, 17.5),
        ex('Seated Cable Lateral Raise', 'Side Deltoids', 'Constant cable tension through bottom third of lift.', '2-1-1-0', 60, 4, 15, 5),
      ],
      [
        ex('Rear Delt Cable Cross-Pull', 'Posterior Delts', 'Pull diagonally downward across body for crisp rear cap.', '2-1-1-1', 60, 3, 15, 5),
        ex('Incline Dumbbell Y-Raise', 'Lower Traps & Rear Delts', 'Chest on 30° bench, lift thumbs up into Y shape.', '2-1-1-1', 60, 3, 14, 4),
        ex('Rope Face Pull (High Pulley)', 'Rear Delts & Posture', 'Spread rope wide beside ears and pause 1s.', '2-1-1-1', 60, 3, 15, 15),
      ],
      [
        ex('Single-Leg Hip Thrust (Bodyweight/DB)', 'Glute Symmetry', 'Lock level pelvis; 1s squeeze at top.', '2-1-1-1', 60, 3, 12, 12.5),
        ex('B-Stance Glute-Biased RDL', 'Glute-Hamstring Tie-In', 'Keep 85% tension on front heel.', '3-1-1-0', 75, 3, 12, 14),
        ex('Curtsy Lunge (Slow Tempo)', 'Glute Medius & Quads', 'Control descent 3s keeping hips square forward.', '3-1-1-0', 60, 3, 12, 10),
      ],
      [
        ex('Machine Seated Hip Abduction', 'Glute Medius Burnout', '15 upright + 15 forward-lean pulses.', '1-1-1-0', 45, 3, 20, 45),
        ex('Seated Dumbbell Arnold Press', 'Shoulder Cap Finisher', 'Smooth rotation keeping traps relaxed.', '2-1-1-0', 60, 3, 12, 8),
        ex('Dead Bug Transverse Brace', 'TVA Waistline', 'Exhale ribs downward; protect slim waist line.', '3-1-1-0', 45, 3, 14, 0),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Day 6: Posterior Sweep & Sculpt Circuit',
      'Day 6: Glute Pump, Back & Posture',
      'Day 6: Hourglass Density & Core Cincher',
    ],
    targetMuscle: 'Glutes, Back & TVA',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Dynamic Rhythm Prep',
      '5-Min Full-Body Mobility Flow',
      '5-Min Posterior & Shoulder Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Banded Clamshells', prescription: '2 x 20 per side' },
        { name: 'Scapular Sweeps', prescription: '15 reps' },
      ],
      [
        { name: 'Inchworm Walkouts', prescription: '8 reps' },
        { name: 'Bodyweight Good Mornings', prescription: '15 reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
      ],
      [
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Glute Bridge Pulses', prescription: '2 x 20 reps' },
        { name: 'Thoracic Openers', prescription: '8 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Sumo Kettlebell Squat', 'Glutes & Adductors', 'Wide stance, knees out, deep pause at bottom.', '3-1-1-0', 60, 4, 15, 20),
        ex('Barbell Good Morning (Light/Controlled)', 'Hamstrings & Glutes', 'Push hips far back with soft knees and flat spine.', '3-1-1-0', 90, 3, 12, 30),
        ex('Seated Single-Leg Curl', 'Hamstrings', 'Full stretch at top, strong 1s squeeze at bottom.', '2-1-1-1', 60, 3, 12, 20),
      ],
      [
        ex('Single-Arm Dumbbell Row', 'Lats & Mid-Back', 'Sweep elbow back toward hip pocket for lat sweep.', '2-1-1-0', 60, 3, 12, 12.5),
        ex('Straight-Arm Cable Pulldown', 'Lat Width', 'Keep arms nearly straight and press bar down to thighs.', '2-1-1-1', 60, 3, 15, 20),
        ex('Seated Narrow Cable Row', 'Posture & Mid-Back', 'Stay tall; pull handles smoothly to lower sternum.', '2-1-1-0', 60, 3, 14, 27.5),
      ],
      [
        ex('Machine Shoulder Press', 'Deltoids', 'Smooth controlled tempo keeping shoulder caps round.', '2-1-1-0', 60, 3, 12, 20),
        ex('Dumbbell Upright Row', 'Lateral Delts', 'Pull dumbbells upward along ribs leading with elbows.', '2-1-1-0', 60, 3, 14, 8),
        ex('Cable Front-to-Lateral Raise', 'Full Shoulder Cap', 'Alternate one front, one lateral sweep per rep.', '2-1-1-0', 60, 3, 12, 5),
      ],
      [
        ex('Pilates Leg Lowering + Vacuum', 'Deep Lower Abs', 'Lower legs only as far as lumbar spine stays pinned.', '3-1-1-0', 60, 3, 14, 0),
        ex('Pallof Anti-Rotation Press', 'Core Tightness', 'Press cable straight out resisting rotation; zero oblique bulk.', '2-2-2-0', 45, 3, 12, 10),
        ex('Dead Bug Slow March', 'Transverse Abdominis', 'Exhale completely on each leg reach.', '3-1-1-0', 45, 3, 14, 0),
      ],
      [
        ex('Wide-Grip Assisted Pull-Up / Pulldown', 'Upper Back Taper', 'Draw elbows wide and down toward hips.', '3-1-1-0', 60, 3, 12, 32.5),
        ex('Incline Dumbbell Chest Press', 'Upper Chest Posture', 'Moderate weight for clean clavicle-line support.', '3-1-1-0', 60, 3, 12, 10),
        ex('Chest-Supported Row', 'Upper Back & Posture', 'Squeeze shoulder blades cleanly for 1s.', '2-1-1-1', 60, 3, 14, 25),
      ],
      [
        ex('Cable Glute Pull-Through (Finisher)', 'Glute Squeeze', 'Full hip hinge back and tall upright squeeze.', '2-1-1-1', 45, 3, 18, 22.5),
        ex('Standing Calf & Tibialis Raise', 'Ankle & Leg Aesthetics', 'Slow controlled reps with 1s top pause.', '2-1-1-1', 45, 3, 16, 20),
        ex('Banded Clamshell + Abduction Burnout', 'Glute Medius', 'Continuous high tension until glute shelf burns.', '1-1-1-0', 45, 3, 25, 0),
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
      '5-Min Morning Lymphatic Flow',
      '5-Min Full-Body Stretch Sequence',
      '5-Min Deep Recovery Breathwork',
    ],
    warmupPools: [
      [
        { name: 'Pigeon Glute Release', prescription: '60s per side' },
        { name: 'Thoracic Foam Roller Extension', prescription: '90s gentle glide' },
        { name: 'Box Breathing Reset', prescription: '4 cycles' },
      ],
      [
        { name: 'Supine Spinal Twist', prescription: '45s per side' },
        { name: 'Hamstring Strap Stretch', prescription: '45s per leg' },
        { name: 'Slow Nasal Recovery Breath', prescription: '3 minutes' },
      ],
      [
        { name: 'Child Pose Lat Reach', prescription: '60s' },
        { name: 'Hip Flexor Kneeling Stretch', prescription: '45s per side' },
        { name: 'Shoulder Sleeper Stretch', prescription: '30s per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor Daylight Recovery Walk', 'Metabolic Baseline', 'Relaxed nasal breathing while banking daily step goal.', 'Easy Pace', 60, 1, 30, 0),
        ex('Evening Zone-2 Stroll', 'Active Recovery', 'Unplug from screens and prepare for 8.5h deep sleep.', 'Easy Pace', 60, 1, 25, 0),
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
      'Day 1: Lower Power & Conditioning',
      'Day 1: Squat Strength & Athletic Drive',
      'Day 1: Explosive Legs & Core Stability',
    ],
    targetMuscle: 'Quads, Glutes & Conditioning',
    durationMin: 50,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Hip & Knee Athletic Primer',
      '5-Min Dynamic Lower Activation',
      '5-Min Plyo & Mobility Prep',
    ],
    warmupPools: [
      [
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
        { name: 'Glute Bridge Pulses', prescription: '2 x 20 reps' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
      ],
      [
        { name: 'Cossack Squat Shifts', prescription: '10 controlled reps' },
        { name: 'Ankle Dorsiflexion Rocks', prescription: '10 per ankle' },
        { name: 'Low-Impact Pogo Hops', prescription: '2 x 20s' },
      ],
      [
        { name: 'Inchworm to Plank', prescription: '8 slow reps' },
        { name: 'Bodyweight Split Squats', prescription: '10 per leg' },
        { name: 'Single-Leg Glute Bridges', prescription: '12 per leg' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Heel-Elevated Goblet Squat', 'Quads & Glutes', 'Stay upright through chest; sink knees smoothly forward.', '3-1-1-0', 90, 4, 12, 18),
        ex('Barbell Front Squat', 'Quads & Core', 'Elbows high, brace core hard, drive up explosively.', '3-1-1-0', 120, 4, 8, 40),
        ex('Hack Squat (Athletic Stance)', 'Quads & Glutes', 'Controlled 3s lowering to full knee flexion.', '3-1-1-0', 90, 4, 10, 60),
      ],
      [
        ex('Dumbbell Hip Thrust', 'Glutes', 'Chin tucked, pause 1s at full hip extension.', '2-1-1-1', 60, 4, 15, 26),
        ex('Kettlebell Swing', 'Posterior Chain Power', 'Snap hips forcefully; keep ribs locked over pelvis.', 'Explosive', 60, 4, 18, 16),
        ex('Barbell Romanian Deadlift', 'Hamstrings & Glutes', 'Shave legs with bar; drive hips straight forward.', '3-1-1-0', 90, 3, 10, 45),
      ],
      [
        ex('Alternating Reverse Lunge', 'Unilateral Legs', 'Drop back knee softly; drive through front foot.', '2-1-1-0', 60, 3, 12, 10),
        ex('Dumbbell Box Step-Up', 'Glutes & Quads', 'Control descent for 2 full seconds every rep.', '2-1-2-0', 60, 3, 10, 10),
        ex('Split Squat Jump / Pulse', 'Athletic Conditioning', 'Crisp soft landings with knees aligned over toes.', 'Explosive', 60, 3, 12, 0),
      ],
      [
        ex('Forearm Plank Shoulder Taps', 'Core Stability', 'Keep hips motionless while alternating hand taps.', 'Controlled', 60, 3, 16, 0),
        ex('Hanging Knee Raise', 'Lower Abs & Grip', 'Curl pelvis up cleanly with zero swinging.', '2-1-2-0', 60, 3, 12, 0),
        ex('Ab-Wheel / Stability Ball Rollout', 'Anti-Extension Core', 'Reach forward keeping ribs tucked tight.', '3-1-1-0', 60, 3, 12, 0),
      ],
      [
        ex('Leg Press (Shoulder-Width)', 'Quads & Glutes', 'Control lowering until calves touch hamstrings.', '3-1-1-0', 75, 3, 12, 85),
        ex('Lying Leg Curl', 'Hamstrings', 'Keep hips pinned down and curl heels cleanly.', '3-1-1-0', 60, 3, 12, 25),
        ex('Seated Hip Abduction', 'Glute Medius', 'Pause 1s outward on each repetition.', '2-1-1-1', 45, 3, 16, 40),
      ],
      [
        ex('Standing Single-Leg Calf Raise', 'Calves & Ankle Power', 'Full bottom stretch, crisp athletic bounce-free drive.', '2-2-1-1', 45, 3, 15, 10),
        ex('Sled Push / Incline Treadmill Walk', 'Athletic Conditioning', '6–8% incline brisk finish to elevate output.', '10 Mins', 60, 1, 10, 0),
        ex('Farmer Dumbbell Walk', 'Grip & Core Stability', 'Walk tall keeping shoulders packed down.', '30s Walk', 45, 3, 1, 14),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Day 2: Upper Push/Pull Symmetry',
      'Day 2: Defined Arms, Shoulders & Back',
      'Day 2: Athletic Upper Body Sculpt',
    ],
    targetMuscle: 'Shoulders, Back & Arms',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Shoulder & Thoracic Prep',
      '5-Min Scapular & Cuff Activation',
      '5-Min Upper Joint Mobility',
    ],
    warmupPools: [
      [
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Scapular Push-Ups', prescription: '2 x 12 reps' },
        { name: 'Thread-the-Needle Rotations', prescription: '8 per side' },
      ],
      [
        { name: 'Band External Rotations', prescription: '15 per arm' },
        { name: 'Inverted Body Rows (Easy)', prescription: '12 primer reps' },
        { name: 'Thoracic Wall Extensions', prescription: '10 reps' },
      ],
      [
        { name: 'Push-Up Plus', prescription: '2 x 12 reps' },
        { name: 'Light Band Dislocates', prescription: '12 slow passes' },
        { name: 'Face Pulls (Light)', prescription: '15 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Arnold Dumbbell Press', 'Shoulders', 'Rotate smoothly through press without shrugging.', '2-1-1-0', 60, 4, 12, 9),
        ex('Push-Up to Down-Dog Flow', 'Chest, Delts & Core', 'Full depth chest push-up into overhead shoulder stretch.', '2-1-1-0', 60, 3, 12, 0),
        ex('Incline Dumbbell Chest Press', 'Upper Chest & Triceps', '30° bench angle; smooth controlled path.', '3-1-1-0', 90, 4, 10, 12.5),
      ],
      [
        ex('Cable Lat Pulldown (Medium Grip)', 'Back & Posture', 'Pull smoothly to collarbone with proud chest.', '2-1-1-0', 60, 4, 12, 32.5),
        ex('TRX / Inverted Body Row', 'Mid-Back & Arms', 'Keep body rigid like a steel plank.', '2-1-1-0', 60, 4, 12, 0),
        ex('Chest-Supported Dumbbell Row', 'Upper Back', 'Pull elbows toward hips and hold 1s squeeze.', '2-1-1-1', 60, 4, 12, 12.5),
      ],
      [
        ex('Dumbbell Lateral Raise', 'Side Delts', 'Soft elbow bend, lead with outer wrist.', '2-1-1-0', 60, 3, 15, 6),
        ex('Cable Face Pulls', 'Rear Delts', 'Spread rope beside ears for strong shoulder posture.', '2-1-1-1', 60, 3, 15, 15),
        ex('Incline Dumbbell Rear Delt Raise', 'Posterior Delts', 'Sweep arms out wide at 45° angle.', '2-1-1-0', 60, 3, 15, 5),
      ],
      [
        ex('Rope Tricep Pushdown + Hammer Curl', 'Arms Superset', 'Zero elbow drift; full contraction on both arms.', '2-1-1-0', 60, 3, 14, 15),
        ex('Overhead Cable Tricep Extension', 'Triceps', 'Deep stretch behind head; smooth lockout.', '3-1-1-0', 60, 3, 12, 15),
        ex('Alternating Dumbbell Bicep Curl', 'Biceps', 'Control 2s descent on every repetition.', '2-1-2-0', 60, 3, 12, 8),
      ],
      [
        ex('Single-Arm Landmine Press', 'Shoulders & Core', 'Press smoothly upward keeping ribcage stacked.', '2-1-1-0', 60, 3, 12, 15),
        ex('Machine Pec-Deck Fly', 'Chest & Posture', 'Control stretch without rolling shoulders forward.', '2-1-1-1', 60, 3, 14, 22.5),
        ex('Straight-Arm Cable Pulldown', 'Lats & Serratus', 'Keep arms long and sweep down to thighs.', '2-1-1-1', 60, 3, 14, 20),
      ],
      [
        ex('Pallof Anti-Rotation Press', 'Athletic Core', 'Press cable straight out resisting rotation.', '2-2-2-0', 45, 3, 12, 12.5),
        ex('Dead Bug Extended Hold', 'Core Stability', 'Press lumbar spine flat into mat.', '2-1-1-0', 45, 3, 14, 0),
        ex('Hollow-Body Hold', 'Deep Core', 'Hold clean banana shape without neck strain.', '30s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Day 3: Functional Core & Metabolic Circuit',
      'Day 3: High-Output Conditioning & Abs',
      'Day 3: Athletic Engine & Core Density',
    ],
    targetMuscle: 'Full-Body Conditioning & Core',
    durationMin: 44,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Pulse & Mobility Primer',
      '5-Min Dynamic Core Wake-Up',
      '5-Min Cardio & Joint Prep',
    ],
    warmupPools: [
      [
        { name: 'Inchworm Walkouts', prescription: '8 reps' },
        { name: 'Bodyweight Squat-to-Reach', prescription: '12 reps' },
        { name: 'High-Knee March', prescription: '45 seconds' },
      ],
      [
        { name: 'Jumping Jacks', prescription: '45 seconds' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Dead Bug Brace', prescription: '12 reps' },
      ],
      [
        { name: 'Mountain Climbers (Slow)', prescription: '20 total' },
        { name: 'Bodyweight Reverse Lunges', prescription: '10 per side' },
        { name: 'Arm Circles', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Dumbbell Thruster', 'Full-Body Conditioning', 'Use leg drive smoothly into overhead press.', 'Athletic', 60, 4, 12, 8),
        ex('Dumbbell Devil Press (Controlled)', 'Total-Body Engine', 'Clean dumbbells cleanly overhead with braced core.', 'Athletic', 75, 3, 10, 8),
        ex('Kettlebell Clean & Press', 'Power & Shoulders', 'Keep bell close to center line; crisp lockout.', 'Athletic', 60, 4, 10, 12),
      ],
      [
        ex('Renegade Dumbbell Row', 'Back & Anti-Rotation', 'Wide feet for stable base; pull without twisting hips.', '2-1-1-0', 60, 3, 12, 10),
        ex('Farmer Dumbbell Carry', 'Grip, Posture & Core', '40m brisk walk keeping ribcage stacked tall.', '30s Walk', 60, 3, 1, 16),
        ex('Single-Arm Kettlebell Rack Carry', 'Core Bracing', 'Walk tall resisting side lean for 30s per arm.', '30s Walk', 60, 3, 1, 14),
      ],
      [
        ex('Battle Rope / High-Output Intervals', 'Metabolic Conditioning', '30s crisp waves / 30s nasal recovery.', '30s Work', 60, 4, 1, 0),
        ex('Rowing Ergometer Sprints', 'Aerobic Power', '250m strong drive with legs first, then arms.', '250m', 60, 4, 1, 0),
        ex('Assault Bike / Sled Push', 'Anaerobic Tone', '20s fast output; 40s controlled recovery.', '20s Sprint', 60, 4, 1, 0),
      ],
      [
        ex('Hollow-Body Rock / Hold', 'Core Definition', 'Keep lower spine pressed firmly into mat.', '30s Hold', 45, 3, 1, 0),
        ex('Cable Woodchop (Controlled)', 'Athletic Core', 'Rotate from thoracic spine keeping hips quiet.', '2-1-1-0', 45, 3, 12, 12.5),
        ex('Reverse Crunch (Slow Lower)', 'Lower Abs', 'Curl hips off floor without momentum.', '3-1-1-0', 45, 3, 15, 0),
      ],
      [
        ex('Lateral Med-Ball / Cable Slam', 'Athletic Power', 'Drive slam cleanly using full core brace.', 'Explosive', 45, 3, 12, 8),
        ex('Goblet Jump Squat (Soft Landing)', 'Conditioning Power', 'Light load; land silently in quarter-squat.', 'Athletic', 60, 3, 10, 8),
        ex('Step-Up Knee Drive', 'Conditioning & Glutes', 'Fast drive onto box; controlled step down.', 'Athletic', 45, 3, 14, 0),
      ],
      [
        ex('Mountain Climber Tempo', 'Metabolic Core', 'Drive knees briskly keeping shoulders over wrists.', '30s Work', 45, 3, 1, 0),
        ex('Plank Up-Downs', 'Shoulders & Core', 'Minimal hip sway alternating forearm to palm.', 'Controlled', 45, 3, 12, 0),
        ex('Dead Bug Breath Finisher', 'Core Recovery', 'Slow controlled exhales locking ribs down.', '3-1-1-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Day 4: Active Mobility & Zone-2 Walk',
      'Day 4: Joint Recovery & Step Banking',
      'Day 4: Aerobic Flush & Stretch',
    ],
    targetMuscle: 'Active Recovery',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Mobility Reset',
      '5-Min Hip & Shoulder Unwind',
      '5-Min Breath & Posture Flow',
    ],
    warmupPools: [
      [
        { name: 'Hip 90/90 Flow', prescription: '8 transitions' },
        { name: 'Doorway Chest Stretch', prescription: '45s' },
        { name: 'Deep Nasal Breathing', prescription: '2 minutes' },
      ],
      [
        { name: 'Cat-Cow Spine Wave', prescription: '10 reps' },
        { name: 'Calf & Ankle Stretch', prescription: '45s per side' },
        { name: 'Thoracic Rotation', prescription: '8 per side' },
      ],
      [
        { name: 'Pigeon Stretch', prescription: '60s per side' },
        { name: 'Neck & Trap Release', prescription: '45s' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Brisk Outdoor Step Session', 'NEAT & Recovery', 'Rhythmic arm swing and relaxed upright posture.', 'Steady', 60, 1, 30, 0),
        ex('Zone-2 Stationary Bike Spin', 'Active Flush', '85–95 RPM easy cadence to flush leg fatigue.', 'Steady', 60, 1, 25, 0),
        ex('Incline Treadmill Recovery Walk', 'Aerobic Base', '4–5% incline keeping heart rate relaxed.', 'Steady', 60, 1, 25, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Day 5: Athletic Glutes & Hamstrings',
      'Day 5: Posterior Chain Strength',
      'Day 5: Deadlift & Unilateral Hinge',
    ],
    targetMuscle: 'Glutes & Hamstrings',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Hinge & Glute Activation',
      '5-Min Hamstring & Hip Prep',
      '5-Min Posterior Chain Primer',
    ],
    warmupPools: [
      [
        { name: 'Single-Leg Glute Bridge', prescription: '2 x 12 per leg' },
        { name: 'Banded Clamshells', prescription: '2 x 18 per side' },
        { name: 'Bodyweight Good Mornings', prescription: '15 reps' },
      ],
      [
        { name: 'Banded Pull-Throughs', prescription: '2 x 15 reps' },
        { name: 'Inchworm Hamstring Walk', prescription: '8 reps' },
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
      ],
      [
        { name: 'Frog Pumps', prescription: '2 x 20 reps' },
        { name: 'Single-Leg Hinge Reach', prescription: '8 per leg' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Romanian Deadlift (Dumbbell/Barbell)', 'Hamstrings & Glutes', 'Hinge hips back slowly; stop when hips stop moving back.', '3-1-1-0', 90, 4, 10, 50),
        ex('Trap Bar / Sumo Deadlift', 'Full Posterior Chain', 'Push floor away cleanly with flat braced back.', '2-1-1-0', 120, 4, 8, 65),
        ex('Single-Leg Landmine / DB RDL', 'Glutes & Balance', 'Square hips to floor; drive cleanly through heel.', '3-1-1-0', 90, 3, 10, 14),
      ],
      [
        ex('Walking Dumbbell Lunge', 'Glutes & Quads', 'Long athletic stride; upright torso throughout.', '2-0-1-0', 90, 3, 12, 10),
        ex('Bulgarian Split Squat', 'Glutes & Legs', 'Control 3s descent; explode cleanly upward.', '3-1-1-0', 90, 3, 10, 12.5),
        ex('Curtsy to Reverse Lunge', 'Glute Medius & Quads', 'Keep front knee tracking safely over middle toe.', '2-1-1-0', 60, 3, 12, 8),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Lock lap pad firm; resist return for 3s.', '3-1-1-0', 60, 3, 12, 30),
        ex('Nordic / Eccentric Hamstring Lower', 'Hamstring Armor', 'Control forward descent as slow as possible.', '4-0-1-0', 60, 3, 8, 0),
        ex('Glute-Ham Raise / Back Extension', 'Posterior Chain', 'Squeeze glutes at top without over-arching back.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('Barbell Hip Thrust', 'Glute Max', 'Drive through heels cleanly with tucked chin.', '2-1-1-1', 90, 4, 10, 65),
        ex('Cable Glute Pull-Through', 'Glutes & Hinge', 'Deep hip hinge; stand tall and squeeze.', '2-1-1-1', 60, 3, 15, 22.5),
        ex('45° Back Extension', 'Upper Glutes', 'Round upper back subtly and squeeze glutes.', '2-1-1-1', 60, 3, 15, 10),
      ],
      [
        ex('Seated Hip Abduction', 'Glute Medius', 'Hold peak 1s squeeze outward every rep.', '2-1-2-0', 45, 3, 18, 42.5),
        ex('Cable Glute Kickback', 'Glute Shelf', 'Smooth controlled leg sweep back.', '2-1-1-1', 45, 3, 15, 10),
        ex('Banded Frog Pumps', 'Glute Finisher', 'High-rep burn keeping soles pressed together.', '1-1-1-0', 45, 3, 25, 0),
      ],
      [
        ex('Standing Calf Raise', 'Calves', '2s bottom stretch; explosive calf raise.', '2-2-1-1', 45, 3, 15, 30),
        ex('Hanging Knee Raise', 'Lower Abs', 'Controlled pelvic tilt without swinging.', '2-1-2-0', 45, 3, 12, 0),
        ex('Forearm Plank (45s)', 'Core Endurance', 'Brace glutes and abs hard together.', '45s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Day 6: Full-Body Barbell & Kettlebell Flow',
      'Day 6: Athletic Upper/Lower Complex',
      'Day 6: Total-Body Tone & Core',
    ],
    targetMuscle: 'Full-Body Athletic Tone',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Dynamic Shoulder & Hip Flow',
      '5-Min Total-Body Athletic Prep',
      '5-Min Mobility & Brace Sequence',
    ],
    warmupPools: [
      [
        { name: 'Wall Slides', prescription: '2 x 12 reps' },
        { name: 'Bird-Dog Reach', prescription: '10 per side' },
        { name: 'Band External Rotations', prescription: '15 per arm' },
      ],
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Goblet Squat Hold', prescription: '2 x 20s' },
        { name: 'Scapular Push-Ups', prescription: '12 reps' },
      ],
      [
        { name: 'Banded Lateral Walks', prescription: '15 per side' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Plank Walkouts', prescription: '8 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Kettlebell Goblet Squat + Curl', 'Legs & Biceps', 'Deep squat, bicep curl at bottom, stand tall.', '2-1-1-0', 60, 3, 12, 14),
        ex('Landmine Single-Arm Press', 'Shoulders & Core', 'Brace abs tight; press smoothly upward at 45°.', '2-1-1-0', 60, 3, 12, 15),
        ex('Dumbbell Romanian Deadlift to Row', 'Back & Hamstrings', 'Hinge down, perform clean row, stand tall.', '2-1-1-0', 60, 3, 10, 12.5),
      ],
      [
        ex('Single-Arm Dumbbell Row', 'Back & Posture', 'Pull elbow smoothly past ribcage.', '2-1-1-0', 60, 3, 12, 12.5),
        ex('Incline Push-Up / Bench Press', 'Chest & Arms', 'Elbows 45°; control lowering cleanly.', '3-1-1-0', 60, 3, 12, 10),
        ex('Chin-Up / Underhand Lat Pulldown', 'Lats & Biceps', 'Pull collarbone to bar with controlled eccentric.', '3-1-1-0', 60, 3, 10, 32.5),
      ],
      [
        ex('Pilates-Style Leg Lowering', 'Lower Abs', 'Anchor lower spine flat into mat on every rep.', '3-1-1-0', 60, 3, 14, 0),
        ex('Side Plank Hip Dip (Light)', 'Core Stability', 'Stack shoulders cleanly over elbow.', '2-1-1-0', 45, 3, 12, 0),
        ex('V-Up / Tuck Crunch', 'Upper & Lower Abs', 'Reach smoothly toward shins with controlled descent.', '2-1-2-0', 45, 3, 15, 0),
      ],
      [
        ex('Dumbbell Push Press', 'Shoulders & Power', 'Short crisp knee dip driving weights cleanly overhead.', 'Explosive', 60, 3, 10, 10),
        ex('Cable Lateral Raise', 'Side Delts', 'Sweep smoothly out in scapular plane.', '2-1-1-0', 45, 3, 15, 5),
        ex('Face Pulls (Rope)', 'Rear Delts & Posture', 'Spread rope beside ears for strong shoulder posture.', '2-1-1-1', 45, 3, 15, 15),
      ],
      [
        ex('Alternating Reverse Lunge', 'Legs & Balance', 'Smooth step back keeping knee softly cushioned.', '2-0-1-0', 60, 3, 12, 10),
        ex('Dumbbell Sumo Squat', 'Inner Thighs & Glutes', 'Wide stance; knees track over toes.', '3-1-1-0', 60, 3, 14, 18),
        ex('Kettlebell Swing', 'Posterior Power', 'Snap hips crisply into tall standing posture.', 'Explosive', 60, 3, 18, 16),
      ],
      [
        ex('Incline Power Walk / Rowing Finisher', 'Metabolic Conditioning', '8 mins crisp steady output to finish session.', '8 Mins', 60, 1, 8, 0),
        ex('Hammer Curl + Overhead Rope Extension', 'Toned Arms', 'Controlled tempo superset without swinging.', '2-1-1-0', 45, 3, 14, 8),
        ex('Dead Bug + Vacuum Breath', 'Core Cincher', 'Lock ribs downward and breathe deeply.', '3-1-1-0', 45, 3, 12, 0),
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
      '5-Min Restorative Stretch',
      '5-Min Spinal Decompression',
      '5-Min Calm Recovery Breathwork',
    ],
    warmupPools: [
      [
        { name: 'Child Pose Lat Reach', prescription: '60s' },
        { name: 'Supine Spinal Twist', prescription: '45s per side' },
        { name: 'Slow Nasal Breathing', prescription: '3 minutes' },
      ],
      [
        { name: 'Pigeon Glute Release', prescription: '60s per side' },
        { name: 'Seated Forward Fold', prescription: '60s' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: 'Couch Quad Stretch', prescription: '45s per side' },
        { name: 'Chest Doorway Opener', prescription: '45s' },
        { name: 'Shoulder Circles', prescription: '30s' },
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
      'Day 1: Calorie-Torch Lower Circuit',
      'Day 1: Sculpted Legs & High-Step Primer',
      'Day 1: Lean Lower Tone & Posture',
    ],
    targetMuscle: 'Legs, Glutes & Cardio Output',
    durationMin: 42,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Pulse & Hip Opener',
      '5-Min Lower-Body Activation',
      '5-Min Posture & Knee Prep',
    ],
    warmupPools: [
      [
        { name: 'Bodyweight Squat-to-Calf Raise', prescription: '2 x 12 reps' },
        { name: 'Glute Bridge March', prescription: '20 alternating' },
        { name: 'Ankle & Hip Circles', prescription: '10 per side' },
      ],
      [
        { name: 'Lateral Band Walks', prescription: '2 x 15 per side' },
        { name: 'Reverse Lunge Reach', prescription: '8 per leg' },
        { name: 'Inchworm Walkouts', prescription: '6 slow reps' },
      ],
      [
        { name: 'Light High-Knee March', prescription: '45 seconds' },
        { name: '90/90 Hip Switches', prescription: '8 switches' },
        { name: 'Clamshell Pulses', prescription: '20 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Dumbbell Sumo Pulse Squat', 'Inner Thighs & Glutes', 'Drop deep, add 1 pulse at bottom, drive tall.', '2-1-1-0', 45, 4, 16, 12),
        ex('Alternating Curtsy Lunge', 'Glutes & Quads', 'Step diagonally back keeping front knee stable.', '2-0-1-0', 45, 3, 16, 8),
        ex('High-Rep Goblet Squat', 'Legs & Conditioning', 'Crisp unbroken reps with smooth breathing rhythm.', '2-0-1-0', 45, 4, 18, 12),
      ],
      [
        ex('Elevated Glute Bridge (High Rep)', 'Glutes', 'Feet on bench/step for deeper range of motion.', '2-1-1-1', 45, 4, 20, 15),
        ex('Single-Leg Step-Up (Tempo)', 'Glutes & Posture', 'Light tap at bottom; keep torso tall.', '2-0-1-0', 45, 3, 14, 8),
        ex('Cable / Banded Kickback', 'Upper Glutes', 'Zero back arch; crisp 1s squeeze.', '2-1-1-1', 45, 3, 18, 10),
      ],
      [
        ex('Incline Power Walk Finisher', 'Calorie Output', '8% incline, brisk pace, swinging arms actively.', '12 Mins', 60, 1, 12, 0),
        ex('Stair Stepper Tempo Climb', 'Glute & Cardio Burn', 'Upright posture without leaning heavily on rails.', '10 Mins', 60, 1, 10, 0),
        ex('Shadowboxing + Step Interval', 'Metabolic Burn', '60s crisp punches / 30s march recovery.', '60s Work', 45, 4, 1, 0),
      ],
      [
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', 'Soft knees; glide dumbbells smoothly down shins.', '3-1-1-0', 60, 3, 14, 12),
        ex('Lying Leg Curl', 'Hamstrings', 'Control 3s lowering phase on every rep.', '3-1-1-0', 45, 3, 15, 22.5),
        ex('Seated Leg Extension', 'Quad Definition', 'Light-moderate load with crisp 1s top pause.', '2-1-1-1', 45, 3, 15, 25),
      ],
      [
        ex('Seated Hip Abduction', 'Glute Medius', 'Continuous controlled outward pulse.', '1-1-1-0', 45, 3, 20, 40),
        ex('Hip Adductor Squeeze', 'Inner Thighs', 'Smooth full range without momentum.', '2-1-1-1', 45, 3, 16, 30),
        ex('Walking Lunge (Light)', 'Leg Conditioning', '20 smooth continuous steps.', '2-0-1-0', 45, 3, 16, 8),
      ],
      [
        ex('Standing Calf Raise', 'Calves', 'Full bottom stretch; crisp top pause.', '2-2-1-1', 45, 3, 18, 20),
        ex('Supine Leg Lowering', 'Deep Core', 'Keep lower back glued flat to mat.', '3-1-1-0', 45, 3, 14, 0),
        ex('Dead Bug Stomach Vacuum', 'TVA Cincher', 'Full exhale keeping waist narrow.', '3-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Day 2: Sleek Shoulders, Arms & Posture',
      'Day 2: Upper Definition & Back Alignment',
      'Day 2: Sculpted Arms & Clavicle Line',
    ],
    targetMuscle: 'Shoulders, Arms & Upper Back',
    durationMin: 40,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Posture & Shoulder Prep',
      '5-Min Thoracic Alignment Flow',
      '5-Min Arm & Cuff Primer',
    ],
    warmupPools: [
      [
        { name: 'Wall Angel Slides', prescription: '2 x 12 reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Arm Circles', prescription: '30s each way' },
      ],
      [
        { name: 'Scapular Push-Ups', prescription: '2 x 12 reps' },
        { name: 'Chest Doorway Opener', prescription: '40s' },
        { name: 'Light Band Rows', prescription: '20 reps' },
      ],
      [
        { name: 'Thoracic Rotations', prescription: '8 per side' },
        { name: 'Y-T-W Prone Raises', prescription: '10 each' },
        { name: 'Wrist & Elbow Circles', prescription: '20 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Seated Dumbbell Lateral + Front Raise', 'Sculpted Shoulders', 'Light weight, pure form, soft elbow bend.', '2-1-1-0', 45, 4, 16, 4),
        ex('Kneeling Overhead Dumbbell Press', 'Shoulders & Core', 'Ribs stacked down; clean overhead lockout.', '2-1-1-0', 60, 3, 15, 7),
        ex('Cable Lateral Sweeps', 'Side Delts', 'Continuous tension without trapping neck.', '2-1-1-0', 45, 4, 16, 4),
      ],
      [
        ex('Cable Lat Pulldown (Light-Moderate)', 'Posture & Back', 'Pull down smoothly; open collarbones wide.', '2-1-1-0', 60, 4, 15, 25),
        ex('Seated Cable Row (Wide Handle)', 'Upper Back', 'Draw elbows back to align rounded shoulders.', '2-1-1-1', 60, 3, 15, 22.5),
        ex('Face Pulls (Posture Focus)', 'Rear Delts', 'Pause 1s with thumbs pointing backward.', '2-1-1-1', 45, 4, 16, 12.5),
      ],
      [
        ex('Dumbbell Tricep Kickback + Bicep Curl', 'Toned Arms', 'Keep upper arms locked motionless beside ribs.', '2-1-1-0', 45, 3, 15, 5),
        ex('Rope Pushdown + Hammer Curl', 'Arms Superset', 'High-rep burn with clean full extension.', '2-1-1-0', 45, 3, 16, 12.5),
        ex('Bench Dip + Alternating Curl', 'Triceps & Biceps', 'Keep back close to bench edge on dips.', '2-1-1-0', 45, 3, 15, 0),
      ],
      [
        ex('Incline Push-Up / Chest Press', 'Upper Chest Posture', '3s slow lowering; open chest smoothly.', '3-1-1-0', 45, 3, 14, 8),
        ex('Single-Arm Dumbbell Row', 'Mid-Back Sculpt', 'Keep shoulders square and pull elbow to hip.', '2-1-1-0', 45, 3, 14, 10),
        ex('Straight-Arm Cable Pulldown', 'Lats & Posture', 'Sweep bar to thighs keeping ribs tucked.', '2-1-1-1', 45, 3, 15, 17.5),
      ],
      [
        ex('Incline Dumbbell Rear Delt Raise', 'Posterior Delts', 'Sweep arms wide at 45° angle.', '2-1-1-1', 45, 3, 16, 4),
        ex('Pec-Deck Chest Fly', 'Chest & Posture', 'Controlled arc with 1s squeeze.', '2-1-1-1', 45, 3, 15, 20),
        ex('Overhead Cable Tricep Extension', 'Triceps', 'Smooth stretch overhead without flaring ribs.', '2-1-1-0', 45, 3, 15, 12.5),
      ],
      [
        ex('Forearm Plank + Knee Taps', 'Core Cincher', 'Keep hips level while tapping alternating knees.', 'Controlled', 45, 3, 16, 0),
        ex('Hollow-Body Breath Hold', 'Transverse Abdominis', 'Draw ribs down cleanly with calm breaths.', '25s Hold', 45, 3, 1, 0),
        ex('Pallof Press Hold', 'Core Stability', 'Resist cable twist for crisp posture.', '2-2-2-0', 45, 3, 12, 10),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Day 3: Deep Core Cincher & Conditioning',
      'Day 3: Pilates Core & Cardio Intervals',
      'Day 3: Waistline Stability & Step Circuit',
    ],
    targetMuscle: 'Deep Core & Conditioning',
    durationMin: 40,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Breath & Pelvis Alignment',
      '5-Min Core & Spine Wake-Up',
      '5-Min Dynamic Conditioning Prep',
    ],
    warmupPools: [
      [
        { name: 'Pelvic Tilts', prescription: '15 slow reps' },
        { name: 'Cat-Cow Flow', prescription: '10 breaths' },
        { name: 'Jumping Jacks (Low Impact)', prescription: '45 seconds' },
      ],
      [
        { name: 'Dead Bug Breath Prep', prescription: '12 reps' },
        { name: 'Bird-Dog Reach', prescription: '10 per side' },
        { name: 'High-Knee March', prescription: '45 seconds' },
      ],
      [
        { name: 'Supine Vacuum Holds', prescription: '3 x 20s' },
        { name: 'Inchworms', prescription: '6 reps' },
        { name: 'Torso Rotations', prescription: '20 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Pilates Hundred + Scissor Kicks', 'Deep Core', 'Keep lower spine glued flat; calm rhythmic breathing.', 'Controlled', 45, 3, 20, 0),
        ex('Dead Bug Extended Hold', 'TVA Cincher', 'Hold bottom reach for 2s per side.', '2-2-1-0', 45, 4, 14, 0),
        ex('Forearm Plank + Knee Taps', 'Core Endurance', 'Tap knees lightly without sagging hips.', 'Controlled', 45, 3, 20, 0),
      ],
      [
        ex('Kettlebell Swing (Light/Snappy)', 'Cardio & Glutes', 'Crisp hip snap with tall standing plank.', 'Explosive', 45, 4, 20, 12),
        ex('Step-Up Knee Drive', 'Conditioning & Glutes', 'Fast drive up onto box/bench, controlled step down.', 'Athletic', 45, 3, 16, 0),
        ex('Dumbbell Squat-to-Press', 'Full-Body Burn', 'Smooth unbroken flow from bottom squat overhead.', 'Athletic', 45, 3, 15, 6),
      ],
      [
        ex('Incline Speed Walk (Intervals)', 'Metabolic Finish', '1 min brisk / 1 min moderate for 12 mins.', '12 Mins', 60, 1, 12, 0),
        ex('Rowing Machine Steady Burn', 'Full-Body Cardio', 'Smooth 24 strokes/min rhythmic pull.', '10 Mins', 60, 1, 10, 0),
        ex('Brisk Step Banking Circuit', 'NEAT Boost', 'Add 1,500 crisp steps inside gym or outdoors.', '15 Mins', 60, 1, 15, 0),
      ],
      [
        ex('Mountain Climbers (Crisp Tempo)', 'Cardio Core', 'Keep shoulders stacked over hands.', '30s Work', 45, 3, 1, 0),
        ex('Reverse Crunch (Slow Eccentric)', 'Lower Abs', 'Lift tailbone cleanly off mat.', '3-1-1-0', 45, 3, 15, 0),
        ex('Bird-Dog Anti-Rotation Hold', 'Deep Core', 'Pause 2s extended each side.', '2-2-1-0', 45, 3, 12, 0),
      ],
      [
        ex('Single-Arm Dumbbell Farmer Carry', 'Posture & Core', 'Walk briskly 30m keeping torso upright.', '30s Walk', 45, 3, 1, 12),
        ex('Bodyweight Squat + Calf Raise', 'Lower Tone', 'Continuous flow keeping glutes engaged.', '2-0-1-0', 45, 3, 20, 0),
        ex('Band Pull-Apart Walk', 'Upper Posture', 'Walk 20 steps while pulsing band apart.', '20 Steps', 45, 3, 20, 0),
      ],
      [
        ex('Supine Stomach Vacuum Series', 'Waistline Cincher', 'Full exhale, draw navel inward, hold 20s.', '20s Hold', 45, 4, 1, 0),
        ex('Glute Bridge March (High Rep)', 'Glutes & Core', 'Keep hips pinned high while alternating legs.', 'Controlled', 45, 3, 20, 0),
        ex('Cat-Cow Mobility Finish', 'Spine & Breath', 'Reset nervous system before cooldown.', '8 Breaths', 45, 2, 8, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Day 4: Step-Floor Active Recovery',
      'Day 4: Posture Walk & Mobility',
      'Day 4: 10.5k Step & Stretch Day',
    ],
    targetMuscle: 'Steps & Posture',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Posture Decompression',
      '5-Min Hip & Calf Release',
      '5-Min Breathing Reset',
    ],
    warmupPools: [
      [
        { name: 'Wall Chest Stretch', prescription: '45s per side' },
        { name: 'Calf Stretch on Step', prescription: '45s per leg' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Neck Side Stretch', prescription: '30s per side' },
        { name: 'Thoracic Foam Roll', prescription: '60s' },
      ],
      [
        { name: 'Child Pose', prescription: '60s' },
        { name: 'Cat-Cow', prescription: '10 reps' },
        { name: 'Ankle Rolls', prescription: '20 each' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor 3,500-Step Power Walk', 'NEAT Conditioning', 'Keep posture tall and arms swinging comfortably.', '30 Mins', 60, 1, 30, 0),
        ex('Treadmill Gentle Incline Walk', 'Active Recovery', '3% incline, conversational pace.', '25 Mins', 60, 1, 25, 0),
        ex('Light Cycle + Mobility Walk', 'Circulation', 'Flush soreness while progressing step goal.', '25 Mins', 60, 1, 25, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Day 5: Sculpted Legs & Glute Lift',
      'Day 5: High-Rep Posterior Chain',
      'Day 5: Glute Contour & Hamstrings',
    ],
    targetMuscle: 'Glutes & Hamstrings',
    durationMin: 45,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Glute Firing & Hinge Prep',
      '5-Min Hip Capsule Mobility',
      '5-Min Posterior Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'Banded Frog Pumps', prescription: '2 x 20 reps' },
        { name: 'Bodyweight Good Mornings', prescription: '15 reps' },
        { name: 'Side-Lying Leg Lifts', prescription: '15 per side' },
      ],
      [
        { name: 'Banded Lateral Walks', prescription: '2 x 16 per side' },
        { name: 'Single-Leg Glute Bridge', prescription: '12 per leg' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
      ],
      [
        { name: 'Fire Hydrant Pulses', prescription: '2 x 15 per side' },
        { name: 'Inchworm Hamstring Stretch', prescription: '8 reps' },
        { name: 'Ankle Rocks', prescription: '10 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', 'Keep dumbbells gliding close to thighs; squeeze glutes tall.', '3-1-1-0', 60, 4, 14, 12.5),
        ex('B-Stance Dumbbell RDL', 'Glute Tie-In', 'Focus tension on front hamstring and lower glute.', '3-1-1-0', 60, 3, 12, 12.5),
        ex('Cable Pull-Through (High Rep)', 'Glutes & Hamstrings', 'Stretch far between legs and snap hips tall.', '2-1-1-1', 60, 4, 16, 20),
      ],
      [
        ex('Reverse Lunge to Knee Drive', 'Glutes & Conditioning', 'Smooth rhythmic flow without slamming back knee.', '2-0-1-0', 60, 3, 14, 8),
        ex('Dumbbell Split Squat', 'Quads & Glutes', 'Stay balanced over front midfoot.', '3-1-1-0', 60, 3, 12, 10),
        ex('Smith Machine Glute Lunge', 'Glute Max', 'Slight forward lean to load lead glute.', '3-1-1-0', 60, 3, 12, 30),
      ],
      [
        ex('Seated Hip Abduction', 'Side Glutes', 'High-rep controlled burn; 1s pause wide.', '1-1-2-0', 45, 4, 20, 40),
        ex('45° Back Extension (Glute Focus)', 'Upper Glutes', 'Tuck chin; squeeze glutes to parallel.', '2-1-1-1', 45, 3, 16, 5),
        ex('Cable Glute Kickback', 'Glute Shelf', 'Controlled leg sweep back with square hips.', '2-1-1-1', 45, 3, 16, 10),
      ],
      [
        ex('Barbell / Dumbbell Hip Thrust', 'Glute Max', 'Drive through heels; 1s peak pause.', '2-1-1-1', 60, 4, 15, 45),
        ex('Elevated Sumo Squat', 'Glutes & Adductors', 'Sink deeply between blocks with proud chest.', '3-1-1-0', 60, 3, 15, 16),
        ex('Step-Up (Low Box Tempo)', 'Glutes & Balance', 'Control 3s lowering phase down.', '3-1-1-0', 45, 3, 14, 8),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Smooth 3s return to full knee extension.', '3-1-1-0', 45, 3, 15, 25),
        ex('Banded Frog Pumps', 'Glute Pump', 'Soles together; high-rep squeeze.', '1-1-1-0', 45, 3, 25, 0),
        ex('Side-Lying Banded Clamshell', 'Glute Medius', 'Keep hips stacked vertically.', '1-1-1-0', 45, 3, 20, 0),
      ],
      [
        ex('Standing Calf Raise', 'Calves & Ankle Tone', 'Full stretch at bottom step.', '2-2-1-1', 45, 3, 18, 20),
        ex('Dead Bug Slow March', 'Deep Core', 'Glue lower spine flat to floor.', '3-1-1-0', 45, 3, 14, 0),
        ex('Incline Brisk Walk (8 Mins)', 'Step & Calorie Burn', 'Upright posture; swing arms briskly.', '8 Mins', 60, 1, 8, 0),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Day 6: High-Rep Upper & Metabolic Finisher',
      'Day 6: Posture Sculpt & Cardio Burn',
      'Day 6: Sleek Upper Body & Core Flow',
    ],
    targetMuscle: 'Upper Body & Core',
    durationMin: 42,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Shoulder & Core Wake-Up',
      '5-Min Upper Mobility Prep',
      '5-Min Posture Alignment',
    ],
    warmupPools: [
      [
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Plank Shoulder Taps', prescription: '16 taps' },
        { name: 'Wall Slides', prescription: '12 reps' },
      ],
      [
        { name: 'Arm Circles', prescription: '30s' },
        { name: 'Bird-Dog Reach', prescription: '10 per side' },
        { name: 'Light Band Rows', prescription: '15 reps' },
      ],
      [
        { name: 'Thread-the-Needle', prescription: '8 per side' },
        { name: 'Incline Push-Ups', prescription: '10 primer reps' },
        { name: 'Box Breathing', prescription: '3 cycles' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Push-Up / Chest Press', 'Upper Chest & Arms', 'Control 3s lowering; keep core tight.', '3-1-1-0', 45, 3, 14, 8),
        ex('Dumbbell Floor Press', 'Chest & Triceps', 'Pause elbows lightly on mat before driving up.', '2-1-1-0', 45, 3, 14, 9),
        ex('Machine Chest Fly (Light)', 'Pectorals & Posture', 'Gentle arc keeping chest proud.', '2-1-1-1', 45, 3, 15, 17.5),
      ],
      [
        ex('Single-Arm Cable Row', 'Back & Posture', 'Pull smoothly toward ribcage without twisting waist.', '2-1-1-0', 45, 3, 14, 12.5),
        ex('Assisted Chin-Up / Pulldown', 'Back & Arms', 'Full stretch overhead; smooth pull.', '2-1-1-0', 60, 3, 12, 25),
        ex('Bent-Over Dumbbell Fly', 'Rear Delts & Posture', 'Keep spine flat and sweep arms wide.', '2-1-1-1', 45, 3, 15, 4),
      ],
      [
        ex('Slow Bicycle / Toe-Tap Crunch', 'Deep Core', 'Zero neck pulling; focus on rib-to-pelvis connection.', '2-1-2-0', 45, 3, 18, 0),
        ex('Hollow Hold + Leg Flutter', 'Lower Abs', 'Small crisp kicks keeping lumbar flat.', '25s Work', 45, 3, 1, 0),
        ex('Plank Saw (Controlled)', 'Full Core', 'Shift body 2 inches forward/back cleanly.', 'Controlled', 45, 3, 14, 0),
      ],
      [
        ex('Seated Dumbbell Shoulder Press', 'Shoulders', 'Control elbows slightly forward; smooth press.', '2-1-1-0', 45, 3, 14, 8),
        ex('Cable Lateral Raise', 'Side Delts', 'Continuous tension sweeping outward.', '2-1-1-0', 45, 3, 16, 4),
        ex('Rope Face Pulls', 'Rear Delts & Posture', 'Pull rope beside ears with 1s squeeze.', '2-1-1-1', 45, 3, 16, 12.5),
      ],
      [
        ex('Dumbbell Hammer Curl', 'Arms', 'Keep elbows pinned quietly beside ribs.', '2-1-1-0', 45, 3, 14, 6),
        ex('Rope Tricep Pushdown', 'Triceps', 'Spread rope apart smoothly at full extension.', '2-1-1-1', 45, 3, 15, 12.5),
        ex('Overhead Dumbbell Tricep Extension', 'Tricep Long Head', 'Controlled stretch behind head.', '2-1-1-0', 45, 3, 14, 10),
      ],
      [
        ex('Kettlebell Goblet Squat (Burnout)', 'Full-Body Flush', 'High-rep clean depth keeping chest tall.', '2-0-1-0', 45, 3, 16, 12),
        ex('Shadowboxing Tempo Intervals', 'Calorie Torch', '45s snappy punches / 15s reset.', '45s Work', 45, 3, 1, 0),
        ex('Stair Climber / Incline Finisher', 'Step & Calorie Floor', '10 mins smooth pace to top off step count.', '10 Mins', 60, 1, 10, 0),
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
      '5-Min Restorative Stretch',
      '5-Min Calm Mobility Flow',
      '5-Min Lymphatic Reset',
    ],
    warmupPools: [
      [
        { name: 'Supine Twist', prescription: '45s per side' },
        { name: 'Hamstring Stretch', prescription: '45s per leg' },
        { name: 'Nasal Breathing', prescription: '3 mins' },
      ],
      [
        { name: 'Child Pose', prescription: '60s' },
        { name: 'Pigeon Release', prescription: '45s per side' },
        { name: 'Shoulder Opener', prescription: '45s' },
      ],
      [
        { name: 'Cat-Cow', prescription: '10 breaths' },
        { name: 'Ankle & Hip Circles', prescription: '30s' },
        { name: 'Box Breathing', prescription: '4 cycles' },
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
// MALE SPLITS (3 COMPLETELY DISTINCT 6-DAY ROUTINES)
// ============================================================================

const MALE_VTAPER_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Day 1: Upper Chest Shelf & Wide Lats',
      'Day 1: Clavicular Press & Lat Flare',
      'Day 1: V-Taper Width & Upper Pec Focus',
    ],
    targetMuscle: 'Upper Chest & Wide Lats',
    durationMin: 60,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Thoracic & Cuff Activation',
      '5-Min Scapular & Pressing Joint Prep',
      '5-Min Upper Shelf Mobility Primer',
    ],
    warmupPools: [
      [
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Cable External Rotations', prescription: '2 x 12 per arm' },
        { name: 'Thoracic Bench Extensions', prescription: '10 slow reps' },
        { name: 'Scapular Pull-Ups', prescription: '2 x 10 reps' },
      ],
      [
        { name: 'Dead Hang Lat Stretch', prescription: '2 x 25s' },
        { name: 'Push-Up Plus', prescription: '2 x 12 reps' },
        { name: 'Band Dislocates', prescription: '12 slow passes' },
        { name: 'Light Straight-Arm Pulldowns', prescription: '15 reps' },
      ],
      [
        { name: 'Foam Roller Thoracic Opener', prescription: '60s glide' },
        { name: 'Light Dumbbell Y-T Raises', prescription: '2 x 10 each' },
        { name: 'Scapular Lat Pulls', prescription: '2 x 12 reps' },
        { name: 'Incline Tempo Push-Ups', prescription: '10 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Dumbbell Press (30°)', 'Upper Chest Shelf', 'Control 3s descent to deep pec stretch; drive elbows slightly in.', '3-1-1-0', 120, 4, 10, 30),
        ex('Incline Smith Barbell Press', 'Clavicular Pectorals', 'Touch bar cleanly to upper sternum; explode straight up.', '3-1-1-0', 120, 4, 9, 70),
        ex('Low-Incline Converging Chest Press', 'Upper Chest', 'Press upward and inward for crisp upper shelf fullness.', '3-1-1-1', 90, 4, 10, 65),
      ],
      [
        ex('Wide-Grip Weighted Pull-Up', 'Outer Lat Width', 'Depress shoulders first; drive chest toward bar for V-taper flare.', '2-1-1-1', 90, 4, 10, 65),
        ex('Wide Overhand Lat Pulldown', 'Latissimus Dorsi', 'Pull elbows wide and downward toward hip line.', '3-1-1-0', 90, 4, 11, 65),
        ex('Neutral-Grip Mag Pulldown', 'Outer & Lower Lats', 'Lean back 10°; pull smoothly to upper chest.', '3-1-1-0', 90, 4, 12, 65),
      ],
      [
        ex('Single-Arm Iliac Cable Pulldown', 'Lower Lat Sweep', 'Sit tall; drive elbow straight down into hip pocket.', '2-1-2-0', 60, 3, 12, 30),
        ex('Straight-Arm Rope Pullover', 'Lat Width Isolation', 'Keep slight elbow bend; sweep rope down to thighs.', '2-1-1-1', 60, 3, 14, 25),
        ex('Machine Pullover', 'Lats & Serratus', 'Full overhead stretch; drive elbows cleanly down.', '3-1-1-1', 60, 3, 12, 55),
      ],
      [
        ex('Low-to-High Cable Chest Fly', 'Upper Pecs', 'Sweep hands upward toward collarbone and squeeze 1s.', '2-1-1-1', 60, 3, 14, 15),
        ex('Incline Dumbbell Fly (Partial Stretch)', 'Clavicular Chest', 'Deep controlled stretch without dropping shoulders forward.', '3-1-1-0', 60, 3, 12, 14),
        ex('Pec-Deck Chest Fly (High Seat)', 'Inner & Upper Chest', 'Lower seat slightly to bias upper pec fibers.', '2-1-1-1', 60, 3, 14, 45),
      ],
      [
        ex('Chest-Supported Upper Back Row', 'Mid-Back & Rear Delts', 'Pull elbows high at 45° to frame upper-back shelf.', '2-1-1-1', 75, 3, 12, 50),
        ex('Wide-Grip Seated Cable Row', 'Rhomboids & Rear Delts', 'Keep chest tall and squeeze shoulder blades cleanly.', '2-1-1-1', 75, 3, 12, 55),
        ex('Meadows Single-Arm Landmine Row', 'Outer Lats', 'Hinge firmly and drive elbow past ribcage.', '2-1-1-0', 75, 3, 10, 30),
      ],
      [
        ex('Cable Face Pull (External Rotate)', 'Rear Delts & Posture', 'Pull rope beside ears to lock shoulder girdle back.', '2-1-1-1', 45, 3, 15, 20),
        ex('Weighted Hanging Knee Raise', 'Lower Abs & Tight Waist', 'Curl pelvis up cleanly keeping waist slim.', '2-1-2-0', 45, 3, 12, 0),
        ex('Supine Stomach Vacuum Holds', 'TVA Waistline Control', 'Full exhale drawing navel inward without oblique bulk.', '20s Hold', 45, 4, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Day 2: 3D Capped Delts & Arms',
      'Day 2: Lateral Delt Width & Arm Peak',
      'Day 2: Boulder Shoulders & Tricep Sweep',
    ],
    targetMuscle: 'Side Delts, Rear Delts & Arms',
    durationMin: 55,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Shoulder Capsule & Elbow Prep',
      '5-Min Rotator Cuff & Delt Blood Flow',
      '5-Min Overhead Mobility Primer',
    ],
    warmupPools: [
      [
        { name: 'Light Band Dislocates', prescription: '2 x 12 reps' },
        { name: 'Prone Y-T-W Raises', prescription: '2 x 10 each' },
        { name: 'Light Rope Pressdowns', prescription: '2 x 15 pump reps' },
      ],
      [
        { name: 'Cable Internal/External Rotations', prescription: '12 per arm' },
        { name: 'Light Dumbbell Lateral Sweeps', prescription: '2 x 15 reps' },
        { name: 'Band Hammer Curls', prescription: '20 light reps' },
      ],
      [
        { name: 'Wall Shoulder Slides', prescription: '2 x 12 reps' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Overhead Tricep Stretch', prescription: '30s each arm' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Seated Overhead Dumbbell Press', 'Anterior & Medial Delts', 'Stack wrists over elbows; stop shy of lockout for constant tension.', '2-1-1-0', 90, 4, 10, 24),
        ex('Machine Shoulder Press (Neutral)', 'Deltoids', 'Explosive push, 3s controlled descent.', '3-1-1-0', 90, 4, 10, 50),
        ex('Standing Barbell Military Press', 'Full Shoulder Girdle', 'Squeeze glutes & brace abs hard to protect waist line.', '2-1-1-0', 120, 4, 8, 50),
      ],
      [
        ex('Behind-the-Back Cable Lateral Raise', '3D Side Deltoids', 'Pulley at wrist height; sweep outward for stretched tension.', '2-1-2-0', 60, 4, 15, 7.5),
        ex('Seated Dumbbell Lateral Raise', 'Lateral Delts', 'Zero body swing; lead outward with pinky level.', '2-1-2-0', 60, 4, 15, 12.5),
        ex('Egyptian Cable Lateral Raise', 'Side Delt Cap', 'Hold upright post and lean out slightly for full range.', '2-1-1-1', 60, 4, 15, 7.5),
      ],
      [
        ex('Reverse Pec-Deck Rear Delt Fly', 'Posterior Delts', 'Push handles outward toward walls rather than pinching traps.', '2-1-1-1', 60, 3, 15, 40),
        ex('Chest-Supported Rear Delt Row', 'Rear Delts', 'Elbows flared 60°; pull smoothly toward upper back.', '2-1-1-1', 60, 3, 14, 14),
        ex('Bent-Over Cable Rear Delt Fly', 'Posterior Delts', 'Cross cables cleanly and sweep outward.', '2-1-1-1', 60, 3, 15, 5),
      ],
      [
        ex('Incline Dumbbell Curl + Rope Pushdown', 'Biceps & Triceps', 'Upper arms pinned motionless behind torso on curls.', '3-1-1-0', 60, 3, 12, 14),
        ex('EZ-Bar Preacher Curl + Overhead Rope', 'Arm Thickness', 'Deep stretch at bottom of both movements.', '3-1-1-0', 60, 3, 12, 30),
        ex('Cable Bayesian Curl + Single-Arm Pushdown', 'Biceps Long Head & Triceps', 'Step forward of cable stack for loaded bicep stretch.', '2-1-2-0', 60, 3, 12, 12.5),
      ],
      [
        ex('Arnold Dumbbell Press (Controlled)', 'Front & Side Delts', 'Smooth rotation keeping traps depressed.', '2-1-1-0', 75, 3, 12, 18),
        ex('Wide-Grip Upright Cable Row', 'Side & Rear Delts', 'Pull bar cleanly to sternum height leading with elbows.', '2-1-1-0', 60, 3, 14, 27.5),
        ex('Seated Incline Dumbbell Y-Raise', 'Lower Traps & Rear Cap', 'Lift thumbs cleanly into Y shape without neck tension.', '2-1-1-1', 60, 3, 14, 7),
      ],
      [
        ex('Hammer Dumbbell Curl (Finisher)', 'Brachialis & Forearms', 'Keep elbows locked beside ribs; zero body sway.', '2-1-2-0', 45, 3, 14, 16),
        ex('Cross-Body Cable Tricep Extension', 'Lateral & Long Head', 'Extend arm cleanly down and slightly behind hip.', '2-1-1-1', 45, 3, 15, 12.5),
        ex('Cable Face Pulls (High Pulley)', 'Posterior Delts', 'Pinch rear shoulder heads cleanly for 1s.', '2-1-1-1', 45, 3, 15, 22.5),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Day 3: Quad Sweep & Tight Core',
      'Day 3: Lower Aesthetics & Vacuum Control',
      'Day 3: Leg Sweep, Calves & Lower Abs',
    ],
    targetMuscle: 'Quads, Hamstrings & Tight Core',
    durationMin: 56,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Knee, Hip & Ankle Mobility',
      '5-Min Lower-Body Joint Warm-Up',
      '5-Min Squat Depth & Brace Prep',
    ],
    warmupPools: [
      [
        { name: '90/90 Hip Switches', prescription: '10 controlled reps' },
        { name: 'Ankle Dorsiflexion Rocks', prescription: '12 per side' },
        { name: 'Bodyweight Tempo Squats', prescription: '2 x 10 with 3s pause' },
      ],
      [
        { name: 'Cossack Squat Shifts', prescription: '10 reps' },
        { name: 'Leg Swings (Front & Lateral)', prescription: '12 each leg' },
        { name: 'Light Leg Extensions', prescription: '2 x 15 pump reps' },
      ],
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Goblet Squat Pry', prescription: '30s bottom hold' },
        { name: 'Glute Bridges', prescription: '20 primer reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Hack Squat (Heels Low)', 'Quadriceps Sweep', 'Drive knees forward cleanly; 3s descent without bounce.', '3-1-1-0', 120, 4, 10, 90),
        ex('Pendulum / Heel-Elevated Squat', 'Outer Quad Sweep', 'Full knee flexion with upright torso.', '3-1-1-0', 120, 4, 10, 80),
        ex('Close-Stance Leg Press', 'Quads', 'Keep lower back glued flat into seat pad.', '3-1-1-0', 90, 4, 12, 150),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Lock lap pad tight; resist return for 3s.', '3-1-1-0', 90, 3, 12, 50),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', 'Hinge hips backward keeping lats tight.', '3-1-1-0', 90, 3, 10, 30),
        ex('Lying Leg Curl', 'Hamstrings', 'Keep hips pressed flat against bench.', '3-1-1-0', 90, 3, 12, 42.5),
      ],
      [
        ex('Standing Calf Raise (2s Stretch)', 'Calves', 'Full 2s pause at bottom stretch; zero bouncing.', '2-2-1-1', 60, 4, 15, 60),
        ex('Leg Press Calf Raise', 'Calves', 'Lock knees gently and drive through big toe mound.', '2-2-1-1', 60, 4, 16, 110),
        ex('Seated Calf Raise', 'Soleus', 'Full slow range for lower-leg thickness.', '2-2-1-1', 60, 4, 15, 45),
      ],
      [
        ex('Hanging Leg Raise (Controlled)', 'Lower Abs (Tight Waist)', 'Curl pelvis up toward ribs; zero oblique thickening.', '2-1-2-0', 60, 3, 12, 0),
        ex('Cable Crunch + Vacuum Finisher', 'Abdominal Wall', 'Flex ribs to pelvis without hip hinging.', '2-1-2-0', 60, 3, 15, 35),
        ex('Decline Reverse Crunch', 'Lower Abs', 'Slow 3s lowering back onto bench.', '3-1-1-0', 60, 3, 14, 0),
      ],
      [
        ex('Bulgarian Split Squat', 'Quads & Glute Sweep', 'Deep controlled descent; drive smoothly upward.', '3-1-1-0', 90, 3, 10, 18),
        ex('Walking Dumbbell Lunge', 'Quad & Glute Separation', 'Crisp unbroken steps keeping torso stacked tall.', '2-0-1-0', 75, 3, 12, 16),
        ex('Sissy / Heel-Elevated Goblet Squat', 'Teardrop Quad Sweep', 'Drive knees forward cleanly for peak quad stretch.', '3-1-1-0', 75, 3, 12, 24),
      ],
      [
        ex('Leg Extension (Peak Hold Finisher)', 'Rectus Femoris', 'Hold 1s hard contraction at top of every rep.', '2-1-1-1', 45, 3, 15, 55),
        ex('Hip Adductor Machine', 'Inner Thigh Sweep', 'Control open stretch cleanly; squeeze inward.', '2-1-1-1', 45, 3, 15, 50),
        ex('Seated Tibialis & Calf Raise', 'Lower-Leg Proportion', 'Full dorsiflexion and plantarflexion range.', '2-1-1-1', 45, 3, 16, 40),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Day 4: CNS Recovery & Zone-2 Conditioning',
      'Day 4: Active Flush & Lat Decompression',
      'Day 4: Aerobic Recovery & Mobility',
    ],
    targetMuscle: 'CNS & Active Recovery',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Thoracic & Hip Decompression',
      '5-Min Joint & Fascial Release',
      '5-Min Recovery Mobility',
    ],
    warmupPools: [
      [
        { name: 'Dead Hang Lat Stretch', prescription: '2 x 30s' },
        { name: 'Couch Quad/Hip Stretch', prescription: '45s per side' },
        { name: 'Thoracic Foam Roll', prescription: '90 seconds' },
      ],
      [
        { name: 'Pigeon Stretch', prescription: '60s per side' },
        { name: 'Doorway Pec Stretch', prescription: '45s' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Calf & Achilles Stretch', prescription: '45s per side' },
        { name: 'Nasal Breathing Reset', prescription: '3 minutes' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Zone-2 Conditioning Walk', 'Aerobic Base', '125–135 bpm steady pace to accelerate glycogen recovery.', 'Steady', 60, 1, 30, 0),
        ex('Zone-2 Assault / Stationary Bike', 'Lower-Body Flush', 'Easy steady cadence keeping nasal breathing smooth.', 'Steady', 60, 1, 25, 0),
        ex('Outdoor Daylight Step Walk', 'NEAT & Recovery', 'Hit daily step floor while decompressing CNS.', 'Steady', 60, 1, 30, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Day 5: Lat Width, Mid-Back & Lateral Delts',
      'Day 5: Back Detail & Side Delt Isolation',
      'Day 5: V-Taper Pull & Rear Delt Armor',
    ],
    targetMuscle: 'Lats, Mid-Back & Side Delts',
    durationMin: 58,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Scapular & Lat Activation',
      '5-Min Upper Back & Delt Primer',
      '5-Min Pulling Joint Warm-Up',
    ],
    warmupPools: [
      [
        { name: 'Straight-Arm Cable Pulldown', prescription: '2 x 15 light reps' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Cat-Cow Thoracic Mobilizer', prescription: '10 reps' },
      ],
      [
        { name: 'Dead Hang Scapular Pulls', prescription: '2 x 10 reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Light Cable Rows', prescription: '15 primer reps' },
      ],
      [
        { name: 'Thoracic Bench Openers', prescription: '10 reps' },
        { name: 'External Rotations', prescription: '12 per arm' },
        { name: 'Lat Stretch Hang', prescription: '30 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Chest-Supported T-Bar Row', 'Mid-Back & Traps', 'Let scapulae protract cleanly at bottom; drive elbows hard.', '2-1-1-1', 90, 4, 10, 55),
        ex('Seated Cable Row (Wide Grip)', 'Upper Back & Rear Delts', 'Pull toward lower sternum with proud upright chest.', '2-1-1-1', 90, 4, 11, 60),
        ex('Single-Arm Dumbbell Row', 'Lats & Thickness', 'Pull dumbbell in smooth arc toward hip pocket.', '2-1-1-0', 90, 4, 10, 32.5),
      ],
      [
        ex('Neutral-Grip Lat Pulldown', 'Outer & Lower Lats', 'Pull elbows vertically down into sides.', '3-1-1-0', 90, 3, 12, 60),
        ex('Underhand Close Pulldown', 'Lower Lats & Biceps', 'Drive elbows smoothly past ribs with 1s squeeze.', '3-1-1-1', 90, 3, 12, 60),
        ex('Rack Chins / Assisted Pull-Ups', 'Lat Width', 'Control 3s lowering to full overhead stretch.', '3-1-1-0', 90, 3, 10, 65),
      ],
      [
        ex('Dumbbell Lateral Raise (Heavy + Partials)', 'Side Delts', '12 strict reps followed by 8 bottom-half partials.', '2-1-1-0', 60, 4, 15, 12.5),
        ex('Cable Lateral Raise (Cuff)', '3D Side Delts', 'Pure continuous tension from bottom stretch.', '2-1-1-0', 60, 4, 15, 7.5),
        ex('Lean-Away Dumbbell Lateral Raise', 'Medial Delts', 'Grip upright post and lean out 15° for peak stretch.', '2-1-1-0', 60, 4, 14, 10),
      ],
      [
        ex('Cable Face Pulls (External Rotate)', 'Rear Delts & Rotators', 'Pull toward bridge of nose; hold external rotation 1s.', '2-1-1-1', 60, 3, 15, 22.5),
        ex('Seated Bent-Over Rear Delt Fly', 'Posterior Delts', 'Chest on thighs; sweep pinkies outward wide.', '2-1-1-1', 60, 3, 15, 10),
        ex('High-Pulley Rear Delt Cross-Pull', 'Rear Delts', 'Keep arms straight and pull diagonally down.', '2-1-1-1', 60, 3, 15, 7.5),
      ],
      [
        ex('Straight-Arm Cable Pulldown', 'Outer Lat Flare', 'Sweep bar smoothly to thighs keeping torso tall.', '2-1-1-1', 60, 3, 14, 27.5),
        ex('Dumbbell Pullover (Bench)', 'Lats & Ribcage Expansion', 'Deep overhead stretch with soft elbow bend.', '3-1-1-0', 60, 3, 12, 24),
        ex('Single-Arm Kneeling Lat Pulldown', 'Lower Lat Sweep', 'Drive elbow cleanly down to hip line.', '2-1-2-0', 60, 3, 12, 25),
      ],
      [
        ex('Alternating Dumbbell Curl', 'Biceps', 'Supinate cleanly while keeping upper arm anchored.', '2-1-2-0', 45, 3, 12, 16),
        ex('Cable Hammer Rope Curl', 'Brachialis & Forearms', 'Pull rope evenly toward shoulders without swaying.', '2-1-1-1', 45, 3, 14, 25),
        ex('Dumbbell Shrug (Strict 2s Pause)', 'Upper Back Frame', 'Pause cleanly at top without rolling shoulders.', '2-2-1-0', 45, 3, 14, 28),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Day 6: Upper Shelf, Arms & Vacuum Core',
      'Day 6: Clavicular Pec & Arm Specialization',
      'Day 6: Upper Chest, Bicep Peak & Triceps',
    ],
    targetMuscle: 'Upper Chest, Arms & Core',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Press & Elbow Primer',
      '5-Min Arm & Upper Chest Warm-Up',
      '5-Min Joint & Cuff Prep',
    ],
    warmupPools: [
      [
        { name: 'Band External Rotations', prescription: '2 x 12 per arm' },
        { name: 'Scapular Push-Ups', prescription: '2 x 12 reps' },
        { name: 'Light Hammer Curls', prescription: '15 primer reps' },
      ],
      [
        { name: 'Light Rope Pushdowns', prescription: '2 x 15 reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Shoulder Dislocates', prescription: '12 passes' },
      ],
      [
        { name: 'Incline Push-Ups', prescription: '12 slow reps' },
        { name: 'Wrist & Forearm Mobility', prescription: '30s' },
        { name: 'Dead Hang', prescription: '25 seconds' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Incline Smith Bench Press', 'Upper Chest Shelf', 'Touch bar cleanly to upper chest; drive straight up.', '3-1-1-0', 90, 4, 10, 65),
        ex('Incline Dumbbell Press (45°)', 'Upper Chest & Front Delts', 'High incline bias to build upper-torso fullness.', '3-1-1-0', 90, 4, 10, 26),
        ex('Weighted Chest Dips (Forward Lean)', 'Lower & Outer Pecs', 'Deep stretch; keep shoulders depressed down.', '3-1-1-0', 90, 4, 10, 15),
      ],
      [
        ex('EZ-Bar Preacher Curl', 'Biceps Peak', 'Full elbow extension without snapping joint at bottom.', '3-1-1-0', 60, 3, 12, 30),
        ex('Cross-Body Hammer Curl', 'Brachialis & Forearms', 'Drive dumbbell cleanly across chest without shoulder swing.', '2-1-1-0', 60, 3, 12, 16),
        ex('Spider / Chest-Supported EZ Curl', 'Short-Head Biceps', 'Vertical upper arms; 1s squeeze at top.', '2-1-1-1', 60, 3, 12, 27.5),
      ],
      [
        ex('Overhead Cable Tricep Extension', 'Tricep Long Head', 'Deep stretch behind head every single repetition.', '3-1-1-0', 60, 3, 12, 25),
        ex('EZ-Bar Skullcrusher (Behind Head)', 'Triceps', 'Lower bar past crown of head for full long-head stretch.', '3-1-1-0', 60, 3, 12, 30),
        ex('Single-Arm Cross-Body Tricep Pushdown', 'Lateral & Long Head', 'Pin upper arm; drive smoothly down to full lockout.', '2-1-1-1', 60, 3, 14, 12.5),
      ],
      [
        ex('Cable Crunch + Vacuum Set', 'Abdominal Wall', 'Flex thoracic spine downward without hip hinging.', '2-1-2-0', 60, 3, 15, 35),
        ex('Ab-Wheel Rollout', 'Core Bracing', 'Zero lower-back sag; keep ribs tucked.', '3-1-1-0', 60, 3, 12, 0),
        ex('Hanging Straight-Leg Raise', 'Lower Abs', 'Control lowering phase for 2s to avoid swing.', '2-1-2-0', 60, 3, 10, 0),
      ],
      [
        ex('Low-to-High Cable Fly (Upper Shelf)', 'Clavicular Pectorals', 'Sweep handles upward to collarbone height.', '2-1-1-1', 60, 3, 14, 15),
        ex('Pec-Deck Chest Fly', 'Chest Fullness', 'Keep chest tall and pause 1s at center.', '2-1-1-1', 60, 3, 14, 45),
        ex('Machine Chest Press', 'Pectorals', 'Smooth 3s negative; explosive drive.', '3-1-1-0', 60, 3, 12, 65),
      ],
      [
        ex('Cable Lateral Raise (Burnout)', 'Side Delt Cap', 'Final shoulder sweep pump to sharpen V-taper width.', '2-0-1-0', 45, 3, 16, 7.5),
        ex('Seated Dumbbell Concentration Curl', 'Bicep Peak', 'Slow 3s lowering to full extension.', '3-1-1-1', 45, 3, 12, 14),
        ex('Straight-Bar Tricep Pushdown', 'Tricep Sweep', 'Keep elbows pinned tightly beside ribs.', '2-1-1-1', 45, 3, 15, 27.5),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Complete CNS Recovery',
      'Day 7: Sleep Bank & Mobility Walk',
      'Day 7: Rest Day & Step Maintenance',
    ],
    targetMuscle: 'Rest & Sleep',
    durationMin: 25,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Full-Body Mobility Reset',
      '5-Min Fascial Stretch',
      '5-Min Recovery Breathing',
    ],
    warmupPools: [
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Pec Doorway Stretch', prescription: '45s per side' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: 'Dead Hang Decompression', prescription: '2 x 25s' },
        { name: 'Hip Flexor Stretch', prescription: '45s per side' },
        { name: 'Slow Nasal Breath', prescription: '3 minutes' },
      ],
      [
        { name: 'Thoracic Foam Roll', prescription: '60s' },
        { name: 'Hamstring Stretch', prescription: '45s per leg' },
        { name: 'Shoulder Dislocates', prescription: '12 slow passes' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Sunlight Step Walk', 'Recovery & Circulation', 'Hit step floor effortlessly and lock in 8.0h deep sleep.', 'Easy', 60, 1, 25, 0),
        ex('Evening Recovery Stroll', 'CNS Reset', 'Easy outdoor walk to clear metabolic fatigue.', 'Easy', 60, 1, 25, 0),
        ex('Light Mobility & Walk', 'Restoration', 'Keep pace relaxed and prioritize hydration.', 'Easy', 60, 1, 20, 0),
      ],
    ],
  },
];

const MALE_HYPERTROPHY_MASS_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Day 1: Heavy Barbell Chest & Triceps',
      'Day 1: Mechanical Tension Push',
      'Day 1: Dense Chest & Tricep Overload',
    ],
    targetMuscle: 'Chest, Front Delts & Triceps',
    durationMin: 62,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Pressing Joint & Cuff Primer',
      '5-Min Bench & Scapular Activation',
      '5-Min Pec & Tricep Blood Flow',
    ],
    warmupPools: [
      [
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Scapular Push-Ups', prescription: '2 x 12 reps' },
        { name: 'Cable External Rotations', prescription: '12 per arm' },
      ],
      [
        { name: 'Light Dumbbell Press Pump', prescription: '2 x 15 reps' },
        { name: 'Shoulder Dislocates', prescription: '12 passes' },
        { name: 'Thoracic Extensions', prescription: '10 slow reps' },
      ],
      [
        { name: 'Push-Up Plus', prescription: '2 x 12 reps' },
        { name: 'Rope Tricep Warm-Up', prescription: '2 x 15 reps' },
        { name: 'Doorway Pec Opener', prescription: '30s each side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Flat Bench Press', 'Chest Mass', 'Plant feet hard, retract scapulae, 3s lowering to mid-sternum.', '3-1-1-0', 120, 4, 8, 80),
        ex('Flat Dumbbell Heavy Press', 'Pectorals', 'Deep stretched bottom pause; drive straight through wrists.', '3-1-1-0', 120, 4, 9, 34),
        ex('Machine Chest Press (Heavy)', 'Chest & Front Delts', 'Full controlled eccentric; explosive concentric drive.', '3-1-1-0', 120, 4, 8, 85),
      ],
      [
        ex('Incline Dumbbell Press', 'Upper Chest', 'Deep stretch at bottom; avoid flaring elbows past 45°.', '3-1-1-0', 90, 3, 10, 28),
        ex('Incline Barbell Press', 'Clavicular Chest', 'Controlled descent to upper chest; drive hard.', '3-1-1-0', 90, 4, 8, 65),
        ex('Decline / Weighted Dip', 'Lower Chest Mass', 'Lean forward 20°; control deep bottom stretch.', '3-1-1-0', 90, 3, 10, 15),
      ],
      [
        ex('Cable Chest Fly (Mid Pulley)', 'Pec Isolation', 'Hug wide arc and squeeze 1s at center.', '2-1-1-1', 60, 3, 14, 17.5),
        ex('Pec-Deck Machine Fly', 'Chest Density', 'Keep shoulders pinned back into pad.', '2-1-1-1', 60, 3, 12, 55),
        ex('Dumbbell Flat Fly', 'Stretched Pecs', 'Soft elbow bend; pause 1s in stretched bottom.', '3-1-1-0', 60, 3, 12, 16),
      ],
      [
        ex('Weighted Dips / Close-Grip Bench', 'Tricep Mass', 'Keep elbows tucked close beside ribs.', '3-1-1-0', 90, 3, 10, 60),
        ex('Straight-Bar Tricep Pushdown', 'Triceps', 'Full lockout with zero shoulder roll forward.', '2-1-1-1', 60, 3, 12, 32.5),
        ex('Overhead EZ-Bar Extension', 'Tricep Long Head', 'Deep controlled stretch behind head.', '3-1-1-0', 60, 3, 12, 30),
      ],
      [
        ex('Seated Dumbbell Shoulder Press', 'Anterior & Medial Delts', 'Controlled descent to ear level; drive up.', '3-1-1-0', 90, 3, 10, 24),
        ex('Cable Lateral Raise', 'Side Delts', 'Sweep smoothly out in scapular plane.', '2-1-1-0', 60, 3, 14, 7.5),
        ex('Dumbbell Lateral Raise', 'Lateral Delts', 'Strict form; pause slightly at top.', '2-1-1-1', 60, 3, 15, 12.5),
      ],
      [
        ex('Rope Overhead Tricep Extension', 'Tricep Long Head Finisher', 'Full stretch behind head; crisp lockout.', '2-1-1-0', 45, 3, 14, 25),
        ex('Single-Arm Cable Tricep Pushdown', 'Triceps', 'Control return without elbow flare.', '2-1-1-1', 45, 3, 15, 12.5),
        ex('Hanging Leg Raise', 'Core Density', 'Curl pelvis cleanly upward without swinging.', '2-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Day 2: Dense Back & Biceps Volume',
      'Day 2: Heavy Barbell Rows & Pulls',
      'Day 2: Posterior Thickness & Biceps',
    ],
    targetMuscle: 'Back Thickness, Lats & Biceps',
    durationMin: 60,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Lat & Rear Delt Activation',
      '5-Min Upper Back & Grip Primer',
      '5-Min Pulling Mobility Prep',
    ],
    warmupPools: [
      [
        { name: 'Dead Hang Scapular Pulls', prescription: '2 x 10 reps' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
        { name: 'Thoracic Openers', prescription: '8 per side' },
      ],
      [
        { name: 'Straight-Arm Band Pulldowns', prescription: '2 x 15 reps' },
        { name: 'Cat-Cow Spine Wave', prescription: '10 reps' },
        { name: 'Light Dumbbell Rows', prescription: '12 per arm' },
      ],
      [
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Barbell Hip Hinge (Empty Bar)', prescription: '12 reps' },
        { name: 'Wrist Flexor Stretch', prescription: '30s' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Pendlay / Barbell Bent Row', 'Back Thickness', 'Brace core hard; pull bar cleanly to lower ribcage.', '2-1-1-0', 120, 4, 8, 75),
        ex('T-Bar Row (Heavy Plate-Loaded)', 'Mid-Back & Lats', 'Full scapular stretch at bottom; explosive pull.', '2-1-1-1', 120, 4, 9, 65),
        ex('Chest-Supported Machine Row', 'Upper Back Mass', 'Drive elbows far behind torso; hold 1s squeeze.', '2-1-1-1', 90, 4, 10, 70),
      ],
      [
        ex('Wide-Grip Lat Pulldown', 'Lat Width', 'Control 3s eccentric back to full overhead stretch.', '3-1-1-0', 90, 3, 12, 62.5),
        ex('Weighted Chin-Up', 'Lats & Biceps', 'Pull collarbones cleanly to bar.', '3-1-1-0', 90, 4, 8, 70),
        ex('Seated Close-Grip Cable Row', 'Lower Lats & Rhomboids', 'Pull handles to naval without leaning excessively back.', '2-1-1-1', 90, 3, 12, 60),
      ],
      [
        ex('Dumbbell Shrug (2s Pause)', 'Upper Traps', 'Elevate straight upward toward ears; hold 2s peak.', '2-2-1-0', 60, 3, 12, 32),
        ex('Rear Delt Cable Cross-Pull', 'Posterior Delts', 'Sweep arms wide with minimal elbow bend.', '2-1-1-1', 60, 3, 15, 7.5),
        ex('Face Pulls (Heavy Rope)', 'Rear Delts & Traps', 'Pull toward forehead with external rotation.', '2-1-1-1', 60, 3, 15, 25),
      ],
      [
        ex('Barbell Bicep Curl', 'Biceps Mass', 'Keep elbows anchored beside ribs; zero lower-back heave.', '2-1-2-0', 60, 3, 10, 32.5),
        ex('Seated Incline Dumbbell Curl', 'Bicep Long Head', 'Full stretch behind torso every repetition.', '3-1-1-0', 60, 3, 12, 14),
        ex('Hammer Dumbbell Curl', 'Brachialis & Forearms', 'Controlled neutral grip up and down.', '2-1-2-0', 60, 3, 12, 18),
      ],
      [
        ex('Single-Arm Dumbbell Row', 'Lat Thickness', 'Pull dumbbell straight toward hip pocket.', '2-1-1-0', 75, 3, 10, 34),
        ex('Chest-Supported Dumbbell Row', 'Mid-Back Density', 'Retract shoulder blades cleanly for 1s pause.', '2-1-1-1', 75, 3, 12, 26),
        ex('Straight-Arm Cable Pullover', 'Lats & Serratus', 'Keep arms long and sweep down to thighs.', '2-1-1-1', 60, 3, 14, 27.5),
      ],
      [
        ex('EZ-Bar Preacher Curl (Drop Finisher)', 'Biceps Peak', 'Controlled 3s lowering all the way down.', '3-1-1-0', 45, 3, 12, 30),
        ex('Reverse Barbell Forearm Curl', 'Forearms & Grip', 'Keep wrists straight and lower slowly.', '2-1-2-0', 45, 3, 15, 22.5),
        ex('Farmer Dumbbell Hold / Walk', 'Grip & Upper Traps', 'Brace tall and hold heavy dumbbells 40m.', '35m Walk', 60, 3, 1, 32),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Day 3: Heavy Quads & Posterior Mass',
      'Day 3: Squat & Leg Press Overload',
      'Day 3: Lower-Body Strength & Volume',
    ],
    targetMuscle: 'Quads, Hamstrings & Glutes',
    durationMin: 62,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Lower-Body Mobility & Brace',
      '5-Min Squat Depth & Hip Opener',
      '5-Min Knee & Hamstring Activation',
    ],
    warmupPools: [
      [
        { name: '90/90 Hip Capsule Flow', prescription: '8 switches' },
        { name: 'Cossack Squat Shifts', prescription: '10 total' },
        { name: 'Goblet Squat Bottom Hold', prescription: '2 x 20s' },
      ],
      [
        { name: 'Ankle Dorsiflexion Rocks', prescription: '12 per side' },
        { name: 'Bodyweight Walking Lunges', prescription: '16 steps' },
        { name: 'Light Leg Curls', prescription: '2 x 15 primer reps' },
      ],
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Glute Bridges', prescription: '20 reps' },
        { name: 'Empty Bar Tempo Squat', prescription: '10 slow reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Back Squat', 'Quads & Glutes', '360° diaphragmatic brace, knees track toes, explosive ascent.', '3-1-1-0', 120, 4, 8, 100),
        ex('Hack Squat (Deep Flexion)', 'Quad Mass', 'Control 3s lowering all the way down; drive hard.', '3-1-1-0', 120, 4, 10, 100),
        ex('Barbell Front Squat', 'Quads & Upper Back', 'Elbows high; sink deep between hips.', '3-1-1-0', 120, 4, 8, 75),
      ],
      [
        ex('Barbell Romanian Deadlift', 'Hamstrings & Glutes', 'Shave thighs with bar; push hips straight back.', '3-1-1-0', 90, 3, 10, 85),
        ex('Lying Leg Curl', 'Hamstrings', 'Keep hips pressed down; 1s squeeze at top.', '3-1-1-0', 90, 4, 12, 45),
        ex('Seated Leg Curl', 'Hamstrings', 'Fast concentric pull, 3s controlled return.', '3-1-1-0', 90, 4, 12, 55),
      ],
      [
        ex('Leg Press (Heavy Controlled)', 'Quads', 'Full knee flexion without lower back peeling off pad.', '3-1-1-0', 90, 3, 12, 165),
        ex('Bulgarian Split Squat', 'Quads & Glutes', 'Deep stable descent; drive through front foot.', '3-1-1-0', 90, 3, 10, 20),
        ex('Leg Extension (Peak Hold)', 'Quad Density', '1s hard squeeze at top of every repetition.', '2-1-2-1', 60, 4, 14, 65),
      ],
      [
        ex('Standing Calf Raise', 'Calves', 'Full 2s stretch at bottom of every repetition.', '2-2-1-1', 60, 4, 15, 65),
        ex('Seated Calf Raise', 'Soleus', 'Pause 2s in deep ankle dorsiflexion.', '2-2-1-1', 60, 4, 15, 50),
        ex('Leg Press Calf Raise', 'Calves', 'Controlled push through ball of foot.', '2-2-1-1', 60, 4, 16, 120),
      ],
      [
        ex('Walking Dumbbell Lunge', 'Quads & Glutes', 'Long controlled stride; drive forcefully through front foot.', '2-0-1-0', 75, 3, 12, 20),
        ex('45° Weighted Back Extension', 'Hamstrings & Glutes', 'Full hinge; brace glutes hard at top.', '2-1-1-1', 60, 3, 12, 20),
        ex('Hip Adductor Machine (Heavy)', 'Inner Thigh Mass', 'Control 2s stretch; squeeze inward.', '2-1-1-1', 60, 3, 12, 60),
      ],
      [
        ex('Leg Extension (Single-Leg Burnout)', 'Quad Isolation', 'Lock 1s peak contraction at top.', '2-1-1-1', 45, 3, 15, 45),
        ex('Weighted Cable Crunch', 'Abdominal Wall', 'Curl sternum toward pelvis with strict tempo.', '2-1-2-0', 45, 3, 15, 37.5),
        ex('Hanging Leg Raise', 'Lower Abs & Hip Flexors', 'Slow controlled reps with zero momentum.', '2-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Day 4: Joint Decompression & Recovery',
      'Day 4: Active Flush & Zone-2 Walk',
      'Day 4: CNS Rest & Mobility Flow',
    ],
    targetMuscle: 'CNS & Joint Recovery',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Full-Body Release',
      '5-Min Hip & Thoracic Mobility',
      '5-Min Recovery Breathing',
    ],
    warmupPools: [
      [
        { name: 'Thoracic Extensions', prescription: '12 reps' },
        { name: 'Hip Flexor Stretch', prescription: '45s per side' },
        { name: 'Nasal Breathing Reset', prescription: '3 minutes' },
      ],
      [
        { name: 'Dead Hang Lat Stretch', prescription: '2 x 30s' },
        { name: 'Pigeon Stretch', prescription: '60s per side' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Pec Stretch', prescription: '45s per side' },
        { name: 'Ankle Mobility', prescription: '10 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Zone-2 Incline Walk / Bike', 'Cardiovascular Recovery', 'Conversational pace to drive nutrient blood flow.', 'Steady', 60, 1, 25, 0),
        ex('Light Outdoor Step Walk', 'Active Recovery', 'Clear lower-body soreness before Friday upper volume.', 'Steady', 60, 1, 30, 0),
        ex('Easy Rowing / Cycle Flush', 'Circulation', '20 mins light Zone-2 flush without straining joints.', 'Steady', 60, 1, 20, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Day 5: Overhead Shoulders & Upper Chest',
      'Day 5: Pressing Power & Medial Delts',
      'Day 5: Shoulder Armor & Upper Volume',
    ],
    targetMuscle: 'Shoulders, Upper Chest & Traps',
    durationMin: 58,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Upper Joint & Cuff Prep',
      '5-Min Overhead Mobility Primer',
      '5-Min Shoulder Capsule Warm-Up',
    ],
    warmupPools: [
      [
        { name: 'Band Pull-Aparts', prescription: '2 x 15' },
        { name: 'Shoulder Dislocates', prescription: '12 reps' },
        { name: 'Push-Up Plus', prescription: '12 reps' },
      ],
      [
        { name: 'Cable External Rotations', prescription: '15 per arm' },
        { name: 'Light Dumbbell Overhead Press', prescription: '15 reps' },
        { name: 'Wall Slides', prescription: '12 reps' },
      ],
      [
        { name: 'Y-T-W Prone Raises', prescription: '10 each' },
        { name: 'Thoracic Bench Extension', prescription: '10 reps' },
        { name: 'Light Lateral Raises', prescription: '15 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Overhead Barbell Military Press', 'Shoulders & Triceps', 'Squeeze glutes & abs; press straight vertical path.', '2-1-1-0', 120, 4, 8, 52.5),
        ex('Seated Dumbbell Overhead Press', 'Deltoids', 'Deep controlled descent to ear height.', '3-1-1-0', 90, 4, 10, 26),
        ex('Machine Shoulder Press', 'Deltoids', 'Controlled 3s lowering; explosive press.', '3-1-1-0', 90, 4, 10, 55),
      ],
      [
        ex('Weighted Chin-Up / Lat Pulldown', 'Upper Back Balance', 'Balance pressing volume with full lat stretch.', '3-1-1-0', 90, 3, 10, 65),
        ex('Incline Dumbbell Press (30°)', 'Upper Chest', 'Smooth 3s lowering for upper pec density.', '3-1-1-0', 90, 3, 10, 28),
        ex('Low-to-High Cable Fly', 'Clavicular Pecs', 'Hold 1s contraction at collarbone height.', '2-1-1-1', 60, 3, 14, 15),
      ],
      [
        ex('Dumbbell Lateral Raise', 'Side Delts', 'Strict control; avoid swinging torso.', '2-1-2-0', 60, 4, 15, 12.5),
        ex('Cable Lateral Raise', 'Lateral Delts', 'Steady resistance through full sweep.', '2-1-1-0', 60, 4, 15, 7.5),
        ex('Machine Lateral Raise', 'Side Deltoids', 'Pause 1s at horizontal every rep.', '2-1-1-1', 60, 4, 15, 30),
      ],
      [
        ex('Reverse Pec-Deck Fly', 'Rear Delts', 'Sweep handles wide cleanly.', '2-1-1-1', 60, 3, 15, 45),
        ex('Dumbbell Shrug', 'Traps', 'Controlled 2s peak hold.', '2-2-1-0', 60, 3, 12, 32),
        ex('Cable Face Pulls', 'Rear Delts & Rotators', 'Pull rope wide beside temples.', '2-1-1-1', 60, 3, 15, 22.5),
      ],
      [
        ex('Smith Machine Chest Press (Incline)', 'Upper Chest Mass', 'Smooth 3s negative to upper sternum.', '3-1-1-0', 90, 3, 10, 70),
        ex('Pec-Deck Chest Fly', 'Chest Density', 'Squeeze inner chest hard for 1s.', '2-1-1-1', 60, 3, 12, 55),
        ex('Cable Chest Cross-Over', 'Pec Finish', 'Full stretch open; strong center squeeze.', '2-1-1-1', 60, 3, 14, 17.5),
      ],
      [
        ex('Rope Tricep Pushdown', 'Triceps', 'Keep elbows tucked beside ribs; full lockout.', '2-1-1-1', 45, 3, 14, 27.5),
        ex('EZ-Bar Curl', 'Biceps', 'Controlled tempo up and down without swinging.', '2-1-2-0', 45, 3, 12, 30),
        ex('Standing Barbell Shrug', 'Traps & Yoke', 'Hold top squeeze 2s cleanly.', '2-2-1-0', 45, 3, 12, 80),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Day 6: Posterior Chain & Arm Overload',
      'Day 6: Deadlift, Biceps & Triceps Mass',
      'Day 6: Heavy Hinge & Full Arm Pump',
    ],
    targetMuscle: 'Posterior Chain, Arms & Core',
    durationMin: 56,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Hinge, Elbow & Core Primer',
      '5-Min Posterior & Arm Warm-Up',
      '5-Min Grip & Brace Activation',
    ],
    warmupPools: [
      [
        { name: 'Dead Bug Brace', prescription: '12 slow reps' },
        { name: 'Light Band Curls & Pressdowns', prescription: '2 x 15' },
        { name: 'World Greatest Stretch', prescription: '6 per side' },
      ],
      [
        { name: 'Bodyweight Good Mornings', prescription: '15 reps' },
        { name: 'Rope Pushdowns', prescription: '2 x 15 light reps' },
        { name: 'Glute Bridges', prescription: '20 reps' },
      ],
      [
        { name: 'Band Pull-Aparts', prescription: '15 reps' },
        { name: 'Light Dumbbell Curls', prescription: '15 reps' },
        { name: '90/90 Hip Switches', prescription: '10 switches' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Trap Bar / Conventional Deadlift', 'Posterior Chain Mass', 'Pull slack out of bar; push floor away with braced spine.', '2-1-1-0', 120, 3, 6, 110),
        ex('Stiff-Legged Dumbbell Deadlift', 'Hamstrings & Glutes', 'Deep slow hamstring stretch; strong hip lock.', '3-1-1-0', 90, 3, 10, 32),
        ex('45° Weighted Back Extension', 'Lower Back & Hamstrings', 'Smooth hinged movement; brace glutes hard at top.', '2-1-1-1', 60, 3, 12, 20),
      ],
      [
        ex('Hammer Dumbbell Curl', 'Brachialis & Forearms', 'Keep elbows pinned; strong forearm squeeze.', '2-1-2-0', 60, 4, 12, 18),
        ex('EZ-Bar Preacher Curl', 'Biceps', 'Controlled lowering to full stretch.', '3-1-1-0', 60, 4, 10, 32.5),
        ex('Alternating Supinating DB Curl', 'Biceps Mass', 'Rotate palm upward cleanly as you curl.', '2-1-2-0', 60, 4, 10, 16),
      ],
      [
        ex('EZ-Bar Skullcrusher', 'Tricep Mass', 'Keep elbows pointed straight forward throughout descent.', '3-1-1-0', 60, 3, 12, 32.5),
        ex('Rope Tricep Pushdown', 'Triceps', 'Split rope wide at bottom with 1s squeeze.', '2-1-1-1', 60, 3, 14, 27.5),
        ex('Close-Grip Smith Press', 'Triceps & Inner Chest', 'Explode up smoothly keeping elbows tucked.', '3-1-1-0', 90, 3, 10, 65),
      ],
      [
        ex('Ab-Wheel / Hanging Knee Raise', 'Core Mass & Stability', 'Keep ribs tucked toward pelvis; never sag spine.', '2-1-2-0', 60, 3, 12, 0),
        ex('Weighted Cable Crunch', 'Abdominal Wall', 'Curl sternum toward pelvis with strict tempo.', '2-1-2-0', 60, 3, 15, 40),
        ex('Decline Weighted Sit-Up', 'Core Strength', '3s controlled descent on every rep.', '3-1-1-0', 60, 3, 12, 10),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Full knee stretch; pull heels fast and control return.', '3-1-1-0', 60, 3, 12, 50),
        ex('Barbell Hip Thrust', 'Glutes & Lockout Power', 'Drive hips violently into lockout.', '2-1-1-1', 90, 3, 10, 95),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', 'Shave legs cleanly keeping lats packed.', '3-1-1-0', 75, 3, 10, 32),
      ],
      [
        ex('Bayesian Cable Curl', 'Bicep Long Head', 'Face away from stack for deep bicep stretch.', '2-1-2-0', 45, 3, 12, 15),
        ex('Overhead Rope Tricep Extension', 'Tricep Long Head', 'Full stretch behind head; crisp lockout.', '2-1-1-0', 45, 3, 14, 27.5),
        ex('Standing Calf Raise', 'Calves', 'Full 2s stretch at bottom step.', '2-2-1-1', 45, 3, 15, 60),
      ],
    ],
  },
  {
    dayIndex: 6,
    dayLabel: 'Sun',
    titleVariants: [
      'Day 7: Complete CNS Rest & Recovery',
      'Day 7: Growth Day & Step Floor',
      'Day 7: Deep Recovery & Sleep Bank',
    ],
    targetMuscle: 'Rest & Sleep',
    durationMin: 20,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Mobility Wind-Down',
      '5-Min Stretch & Decompress',
      '5-Min Calm Breathwork',
    ],
    warmupPools: [
      [
        { name: 'Pigeon Hip Opener', prescription: '60s per side' },
        { name: 'Wall Chest Stretch', prescription: '45s per side' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: 'Dead Hang', prescription: '2 x 30s' },
        { name: 'Hamstring Stretch', prescription: '45s per leg' },
        { name: 'Slow Nasal Breathing', prescription: '3 minutes' },
      ],
      [
        { name: 'Thoracic Foam Roll', prescription: '60s' },
        { name: 'Quad Couch Stretch', prescription: '45s per side' },
        { name: 'Neck Release', prescription: '30s' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Easy Recovery Walk', 'Active Rest', 'Easy outdoor steps to clear fatigue before Monday.', 'Easy', 60, 1, 25, 0),
        ex('Evening Step Stroll', 'Recovery', 'Relaxed pace; lock in 8.0h deep sleep.', 'Easy', 60, 1, 20, 0),
        ex('Light Daylight Walk', 'NEAT', 'Flush joints gently while staying rested.', 'Easy', 60, 1, 25, 0),
      ],
    ],
  },
];

const MALE_ATHLETIC_SHRED_SPLIT: DayBlueprint[] = [
  {
    dayIndex: 0,
    dayLabel: 'Mon',
    titleVariants: [
      'Day 1: Explosive Push & MetCon',
      'Day 1: Power Chest, Delts & Conditioning',
      'Day 1: Speed-Strength Push Density',
    ],
    targetMuscle: 'Chest, Shoulders & Conditioning',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Dynamic Push & Pulse Primer',
      '5-Min Plyo Push & Cuff Prep',
      '5-Min Athletic Shoulder Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'Explosive Incline Push-Ups', prescription: '2 x 8 crisp reps' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Cable External Rotations', prescription: '12 per arm' },
      ],
      [
        { name: 'Inchworm to Push-Up', prescription: '6 reps' },
        { name: 'Jumping Jacks', prescription: '45 seconds' },
        { name: 'Band Dislocates', prescription: '12 passes' },
      ],
      [
        { name: 'Scapular Push-Ups', prescription: '2 x 12 reps' },
        { name: 'Light Kettlebell Halos', prescription: '8 each direction' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Explosive Barbell Bench Press', 'Chest & Speed Power', 'Controlled 2s lower, explosive bar speed up.', '2-1-X-0', 90, 4, 8, 72.5),
        ex('Incline Dumbbell Speed Press', 'Upper Chest & Delts', 'Alternating or simultaneous crisp drive.', '2-1-X-0', 75, 4, 10, 26),
        ex('Weighted Ring / Bar Dips', 'Chest & Triceps', 'Strong athletic lockout every rep.', '2-1-1-0', 75, 4, 12, 12.5),
      ],
      [
        ex('Dumbbell Push Press', 'Explosive Shoulders', 'Short athletic knee dip; drive weights forcefully overhead.', 'Explosive', 75, 4, 10, 20),
        ex('Landmine Single-Arm Press', 'Shoulders & Core', 'Drive from rear foot through braced core.', '2-1-X-0', 60, 3, 10, 22.5),
        ex('Dumbbell Lateral Raise (High Density)', 'Side Delts', 'Short 45s rest for metabolic shoulder pump.', '2-0-1-0', 45, 4, 15, 10),
      ],
      [
        ex('Battle Rope / Sled Push Circuit', 'Metabolic Output', '30s maximal sprint / 30s active march.', '30s Sprint', 60, 4, 1, 0),
        ex('Kettlebell Burpee + Press', 'Athletic Shred', 'Crisp transitions with braced core.', '40s Work', 45, 4, 10, 12),
        ex('Assault Bike 20/40 Intervals', 'Anaerobic Shred', '20s all-out sprint, 40s steady spin.', '20s Sprint', 60, 5, 1, 0),
      ],
      [
        ex('Cable Chest Fly (Tempo)', 'Chest Shred', 'Keep chest tall; short 45s rest.', '2-1-1-1', 45, 3, 15, 15),
        ex('Pec-Deck Chest Squeeze', 'Pecs', 'Strong 1s hold at peak contraction.', '2-1-1-1', 45, 3, 14, 45),
        ex('Decline Explosive Push-Up', 'Chest & Speed', 'Drive hands briskly off floor/bench.', 'Explosive', 45, 3, 12, 0),
      ],
      [
        ex('Overhead Rope Tricep Extension', 'Triceps & Conditioning', 'Full stretch overhead; snappy lockout.', '2-1-1-0', 45, 3, 15, 22.5),
        ex('Behind-Back Cable Lateral Raise', 'Side Delts', 'Continuous tension sweeping outward.', '2-1-1-0', 45, 3, 15, 7.5),
        ex('Rope Tricep Pushdown', 'Triceps', 'Split rope cleanly at bottom.', '2-1-1-1', 45, 3, 15, 25),
      ],
      [
        ex('Ab-Wheel / Hanging Knee Raise', 'Core Shred', 'Curl pelvis upward without swinging.', '2-1-2-0', 45, 3, 14, 0),
        ex('Plank Shoulder Taps', 'Core Stability', 'Keep hips motionless while alternating hands.', 'Controlled', 45, 3, 20, 0),
        ex('Mountain Climber Sprints', 'Cardio Core', '30s crisp rapid drive.', '30s Work', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 1,
    dayLabel: 'Tue',
    titleVariants: [
      'Day 2: Pull Power & Row Conditioning',
      'Day 2: Explosive Back & Grip Density',
      'Day 2: Athletic Pull & Posterior Drive',
    ],
    targetMuscle: 'Back, Biceps & Conditioning',
    durationMin: 52,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Lat & Grip Wake-Up',
      '5-Min Dynamic Pull Primer',
      '5-Min Posterior & Thoracic Prep',
    ],
    warmupPools: [
      [
        { name: 'Dead Hang Scapular Pulls', prescription: '2 x 10 reps' },
        { name: 'Kettlebell Swings (Light)', prescription: '2 x 15 reps' },
        { name: 'Band Face Pulls', prescription: '2 x 15 reps' },
      ],
      [
        { name: 'Rowing Erg Warm-Up', prescription: '2 minutes easy' },
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Thoracic Rotations', prescription: '8 per side' },
      ],
      [
        { name: 'Inverted Body Rows', prescription: '10 primer reps' },
        { name: 'Arm Circles', prescription: '30 seconds' },
        { name: 'Inchworms', prescription: '6 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Explosive Pull-Up / Lat Pulldown', 'Lats & Power', 'Accelerate chest cleanly toward bar; 2s controlled lower.', '2-0-X-1', 90, 4, 10, 62.5),
        ex('Pendlay Row (From Floor)', 'Back Power', 'Reset bar cleanly on floor each rep; explosive pull.', 'Explosive', 90, 4, 8, 67.5),
        ex('Single-Arm Kettlebell Gorilla Row', 'Back & Core Stability', 'Wide athletic stance; alternate powerful rows.', '2-1-X-0', 60, 4, 10, 24),
      ],
      [
        ex('Renegade Dumbbell Row', 'Back & Anti-Rotation', 'Lock hips completely square while rowing.', '2-1-1-0', 60, 3, 12, 16),
        ex('Seated Cable Row (Fast Tempo)', 'Mid-Back Density', '45–60s rest to keep heart rate elevated.', '2-0-1-1', 60, 4, 12, 55),
        ex('Chest-Supported Rear Delt Fly', 'Posterior Delts', 'High-density sets with strict form.', '2-1-1-1', 45, 3, 15, 10),
      ],
      [
        ex('500m Rowing Ergometer Sprints', 'Pull Conditioning', 'Drive hard with legs, finish with crisp row.', '500m', 75, 3, 1, 0),
        ex('Heavy Farmer Dumbbell Carry', 'Grip, Traps & Core', '40m fast stride with tall braced posture.', '40m Walk', 60, 4, 1, 28),
        ex('SkiErg / Battle Rope Finisher', 'Upper-Body Conditioning', '30s hard pull / 30s recover.', '30s Work', 60, 4, 1, 0),
      ],
      [
        ex('Straight-Arm Cable Pulldown', 'Lats & Serratus', 'Keep core braced and press bar down to thighs.', '2-1-1-1', 45, 3, 15, 25),
        ex('Neutral-Grip Lat Pulldown', 'Lats', 'Pull elbows vertically downward cleanly.', '2-1-1-0', 60, 3, 12, 57.5),
        ex('Band-Assisted Strict Pull-Up', 'Back Endurance', 'High-rep strict dead-hang pulls.', '2-1-1-0', 60, 3, 12, 0),
      ],
      [
        ex('Cable Face Pulls', 'Rear Delts & Posture', 'Pull rope wide beside temples.', '2-1-1-1', 45, 3, 15, 20),
        ex('Alternating Dumbbell Hammer Curl', 'Biceps & Forearms', 'Keep upper arms pinned; crisp tempo.', '2-1-1-0', 45, 3, 14, 16),
        ex('EZ-Bar Bicep Curl', 'Biceps', 'Controlled 3s eccentric on every rep.', '3-1-1-0', 45, 3, 12, 30),
      ],
      [
        ex('Hollow-Body Hold / Flutter Kicks', 'Core Shred', 'Keep lower spine pinned flat into floor.', '30s Work', 45, 3, 1, 0),
        ex('Cable Woodchop (Fast Pull)', 'Rotational Core', 'Rotate cleanly from thoracic spine.', '2-1-X-0', 45, 3, 12, 17.5),
        ex('Hanging Straight-Leg Raise', 'Lower Abs', 'Lift toes smoothly without swinging.', '2-1-2-0', 45, 3, 12, 0),
      ],
    ],
  },
  {
    dayIndex: 2,
    dayLabel: 'Wed',
    titleVariants: [
      'Day 3: Athletic Legs & Sprint Prep',
      'Day 3: Power Squats & Plyo Conditioning',
      'Day 3: Lower-Body Drive & Posterior Burn',
    ],
    targetMuscle: 'Quads, Hamstrings & Explosive Power',
    durationMin: 54,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Sprint & Squat Mobility',
      '5-Min Hip, Knee & Ankle Primer',
      '5-Min Athletic Lower Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'A-Skip March', prescription: '30 seconds' },
        { name: 'Cossack Squat Shifts', prescription: '10 reps' },
        { name: 'Box Jump / Pogo Hops', prescription: '2 x 8 soft landings' },
      ],
      [
        { name: '90/90 Hip Switches', prescription: '10 switches' },
        { name: 'Walking Lunges + Twist', prescription: '12 steps' },
        { name: 'Ankle Rocks', prescription: '10 per side' },
      ],
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Glute Bridges', prescription: '20 reps' },
        { name: 'Bodyweight Squat Jumps', prescription: '8 crisp reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Barbell Back Squat (Athletic Speed)', 'Legs & Power', 'Control down 2s; drive upward as fast as possible.', '2-1-X-0', 120, 4, 8, 90),
        ex('Trap Bar Jump / Speed Pull', 'Explosive Lower Body', 'Fast violent leg drive through floor.', 'Explosive', 90, 4, 6, 85),
        ex('Bulgarian Split Squat (Explosive)', 'Unilateral Power', '3s lower; crisp powerful drive up.', '3-0-X-0', 75, 3, 10, 18),
      ],
      [
        ex('Heavy Kettlebell Swing', 'Posterior Chain', 'Snap hips forcefully; keep abs locked tight.', 'Explosive', 60, 4, 20, 24),
        ex('Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', 'Controlled 3s hinge; crisp lockout.', '3-1-1-0', 75, 3, 10, 28),
        ex('Walking Dumbbell Lunge', 'Leg Conditioning', '20 unbroken steps keeping torso tall.', 'Athletic', 60, 3, 16, 16),
      ],
      [
        ex('Sled Push / Incline Treadmill Sprints', 'Lower Shred', '20s hard drive / 40s walk recovery.', '20s Sprint', 60, 5, 1, 0),
        ex('Box Jumps / Step-Up Explosive', 'Athletic Power', 'Land softly in quarter-squat every jump.', 'Explosive', 60, 3, 10, 0),
        ex('Assault Bike Leg Flush', 'Conditioning', '4 minutes steady high-cadence burn.', '4 Mins', 60, 1, 4, 0),
      ],
      [
        ex('Seated Leg Curl', 'Hamstrings', 'Fast pull; 3s controlled return.', '3-1-1-0', 60, 3, 12, 47.5),
        ex('Leg Extension (Metabolic Burn)', 'Quads', 'Short 45s rest for crisp quad separation.', '2-1-1-1', 45, 3, 15, 50),
        ex('Leg Press (High Cadence)', 'Leg Density', '20 unbroken controlled repetitions.', '2-0-1-0', 60, 3, 16, 130),
      ],
      [
        ex('Standing Calf Raise', 'Calves', '2s bottom stretch; explosive drive.', '2-2-1-1', 45, 3, 16, 55),
        ex('Seated Calf Raise', 'Soleus', 'Full ankle range without bouncing.', '2-2-1-1', 45, 3, 16, 42.5),
        ex('Jump Rope / Pogo Calf Conditioning', 'Ankle Elasticity', '60s crisp rhythmic jumps.', '60s Work', 45, 3, 1, 0),
      ],
      [
        ex('Weighted Cable Crunch', 'Abs', 'Curl ribs toward pelvis with strong exhale.', '2-1-2-0', 45, 3, 15, 35),
        ex('Reverse Crunch', 'Lower Abs', 'Control 3s lower back to bench.', '3-1-1-0', 45, 3, 15, 0),
        ex('Side Plank + Hip Lift', 'Lateral Core', 'Keep body straight as an arrow.', '30s Hold', 45, 3, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 3,
    dayLabel: 'Thu',
    titleVariants: [
      'Day 4: Zone-2 Aerobic & Mobility',
      'Day 4: Active Step Day & Joint Reset',
      'Day 4: Cardiovascular Base & Stretch',
    ],
    targetMuscle: 'Aerobic Recovery',
    durationMin: 30,
    isRestDay: true,
    warmupTitleVariants: [
      '5-Min Mobility Reset',
      '5-Min Hip & Thoracic Unwind',
      '5-Min Recovery Breathing',
    ],
    warmupPools: [
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Hip Flexor Stretch', prescription: '45s per side' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: 'Thoracic Foam Roll', prescription: '60s' },
        { name: 'Pigeon Stretch', prescription: '60s per side' },
        { name: 'Nasal Breath Reset', prescription: '3 minutes' },
      ],
      [
        { name: 'Dead Hang', prescription: '2 x 30s' },
        { name: 'Calf Stretch', prescription: '45s per side' },
        { name: 'Shoulder Dislocates', prescription: '12 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Zone-2 Outdoor Run / Brisk Walk', 'Aerobic Conditioning', 'Maintain steady conversational nasal breathing for 30 mins.', '30 Mins', 60, 1, 30, 0),
        ex('Incline Treadmill Walk (10.5k Push)', 'NEAT & Shred', '6% incline brisk pace to lock in daily step goal.', '30 Mins', 60, 1, 30, 0),
        ex('Stationary Bike Zone-2 Spin', 'Active Recovery', 'Steady 90 RPM flush without taxing CNS.', '25 Mins', 60, 1, 25, 0),
      ],
    ],
  },
  {
    dayIndex: 4,
    dayLabel: 'Fri',
    titleVariants: [
      'Day 5: Upper Density & Core Shred',
      'Day 5: Push-Pull Superset & Abs',
      'Day 5: Upper Conditioning & Waistline',
    ],
    targetMuscle: 'Chest, Back & Core',
    durationMin: 50,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Upper Density Primer',
      '5-Min Shoulder & Core Activation',
      '5-Min Thoracic Wake-Up',
    ],
    warmupPools: [
      [
        { name: 'Band Pull-Aparts', prescription: '2 x 15 reps' },
        { name: 'Plank Walkouts', prescription: '8 reps' },
        { name: 'Push-Ups', prescription: '12 primer reps' },
      ],
      [
        { name: 'Dead Bug Brace', prescription: '12 reps' },
        { name: 'Light Band Rows', prescription: '20 reps' },
        { name: 'External Rotations', prescription: '12 per arm' },
      ],
      [
        { name: 'Scapular Pulls', prescription: '10 reps' },
        { name: 'Wall Slides', prescription: '12 reps' },
        { name: 'Torso Rotations', prescription: '20 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Dumbbell Floor Press + Bent Row', 'Upper Superset', 'Alternate push and pull with minimal rest.', '2-1-1-0', 60, 4, 12, 24),
        ex('Incline Cable Press + Face Pull', 'Chest & Posture', 'Keep tempo crisp and heart rate high.', '2-1-1-0', 60, 4, 12, 22.5),
        ex('Push-Up + TRX Inverted Row', 'Bodyweight Density', 'Max crisp reps keeping torso rigid like steel.', '2-0-1-0', 60, 4, 15, 0),
      ],
      [
        ex('Arnold Press (Standing)', 'Shoulders & Core', 'Brace glutes & abs tight throughout overhead press.', '2-1-1-0', 60, 3, 12, 18),
        ex('Upright Barbell / Cable Row', 'Delts & Traps', 'Lead with elbows to sternum height.', '2-1-1-0', 60, 3, 14, 30),
        ex('Lateral Raise + Front Raise Dropset', '3D Shoulders', 'Controlled burn across all shoulder heads.', '2-0-1-0', 45, 3, 14, 10),
      ],
      [
        ex('Hanging Windshield Wiper / Leg Raise', 'Shredded Core', 'Control rotation smoothly without swinging.', '2-1-2-0', 45, 4, 12, 0),
        ex('Cable Woodchop + Plank Hold', 'Rotational Core', 'Explosive pull across body; slow return.', '2-1-2-0', 45, 3, 12, 20),
        ex('Hollow-Body Flutter Kicks', 'Lower Abs', 'Keep lumbar spine glued flat to mat.', '30s Work', 45, 4, 1, 0),
      ],
      [
        ex('Chest-Supported Dumbbell Row', 'Upper Back', 'Drive elbows high toward hips with 1s squeeze.', '2-1-1-1', 60, 3, 12, 24),
        ex('Cable Chest Cross-Over', 'Pec Definition', 'Sweep hands cleanly together with proud chest.', '2-1-1-1', 45, 3, 15, 15),
        ex('Straight-Arm Pulldown', 'Lats & Core', 'Sweep bar cleanly down to thighs.', '2-1-1-1', 45, 3, 15, 25),
      ],
      [
        ex('Rope Face Pulls', 'Rear Delts', 'Pull rope beside ears with external rotation.', '2-1-1-1', 45, 3, 15, 20),
        ex('Alternating Bicep Curl + Pushdown', 'Arms Density', 'Minimal rest between biceps and triceps.', '2-1-1-0', 45, 3, 14, 14),
        ex('Dumbbell Shrug + Carry', 'Traps & Conditioning', '12 strict shrugs then 25m brisk carry.', 'Combo', 60, 3, 12, 26),
      ],
      [
        ex('Incline Treadmill Sprint Intervals', 'Shred Finisher', '30s fast run / 30s recover at 6% incline.', '30s Sprint', 45, 4, 1, 0),
        ex('Rowing Machine 250m Sprints', 'Metabolic Finish', 'Explosive leg drive every stroke.', '250m', 45, 3, 1, 0),
        ex('Battle Rope Alternating Waves', 'Conditioning', '30s maximal rhythm / 30s rest.', '30s Work', 45, 4, 1, 0),
      ],
    ],
  },
  {
    dayIndex: 5,
    dayLabel: 'Sat',
    titleVariants: [
      'Day 6: Full-Body Kettlebell & Barbell Complex',
      'Day 6: Total-Body Athletic Finisher',
      'Day 6: Complex Conditioning & Arms',
    ],
    targetMuscle: 'Full Body & Core',
    durationMin: 48,
    isRestDay: false,
    warmupTitleVariants: [
      '5-Min Total-Body Complex Primer',
      '5-Min Dynamic Mobility & Brace',
      '5-Min Kettlebell Warm-Up',
    ],
    warmupPools: [
      [
        { name: 'Kettlebell Halos', prescription: '8 each side' },
        { name: 'Goblet Squat Pry', prescription: '30s' },
        { name: 'Inchworms', prescription: '6 reps' },
      ],
      [
        { name: 'World Greatest Stretch', prescription: '6 per side' },
        { name: 'Band Pull-Aparts', prescription: '15 reps' },
        { name: 'High-Knee March', prescription: '45 seconds' },
      ],
      [
        { name: 'Jumping Jacks', prescription: '45 seconds' },
        { name: 'Scapular Push-Ups', prescription: '12 reps' },
        { name: 'Dead Bug Brace', prescription: '12 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Kettlebell Complex (Clean + Press + Squat)', 'Full-Body Power', 'Complete all reps before setting bells down.', 'Athletic', 75, 4, 8, 16),
        ex('Barbell Thruster', 'Legs, Delts & Engine', 'Use squat drive directly into overhead lockout.', 'Athletic', 75, 4, 10, 40),
        ex('Dumbbell Man-Makers', 'Total-Body Shred', 'Row left, row right, push-up, clean, and press.', 'Athletic', 75, 4, 8, 14),
      ],
      [
        ex('Hammer Curl + Overhead Rope Extension', 'Athletic Arms', 'Short 45s rest for crisp arm definition.', '2-1-1-0', 45, 3, 12, 16),
        ex('EZ-Bar Curl + Dip Superset', 'Biceps & Triceps', 'Keep tempo clean even under fatigue.', '2-1-1-0', 45, 3, 12, 30),
        ex('Cable Curl + Straight-Bar Pushdown', 'Arms Pump', 'Full range squeeze on both sides.', '2-1-1-1', 45, 3, 14, 22.5),
      ],
      [
        ex('Russian Twist / Med-Ball Slam', 'Core Power', 'Drive slams through hips and abs.', 'Explosive', 45, 3, 15, 10),
        ex('Mountain Climber Sprints', 'Conditioning & Abs', '30s fast drive keeping shoulders stacked over wrists.', '30s Work', 45, 4, 1, 0),
        ex('V-Up + Plank Finisher', 'Core Definition', '15 crisp V-ups straight into 30s plank.', 'Controlled', 45, 3, 15, 0),
      ],
      [
        ex('Weighted Pull-Up / Lat Pulldown', 'Back Width', 'Full overhead stretch; pull chest cleanly to bar.', '2-1-1-0', 60, 3, 10, 60),
        ex('Weighted Dips / Push-Ups', 'Chest & Triceps', 'Crisp lockout at top of every repetition.', '2-1-1-0', 60, 3, 12, 12.5),
        ex('Single-Arm Kettlebell Row', 'Back & Core', 'Brace hips square while rowing smoothly.', '2-1-1-0', 60, 3, 12, 22),
      ],
      [
        ex('Dumbbell Lateral Raise (High Rep)', 'Side Delts', 'Control lowering cleanly with soft elbows.', '2-1-1-0', 45, 3, 16, 10),
        ex('Kettlebell Swing', 'Posterior Power', 'Snap hips crisply; keep ribs down.', 'Explosive', 45, 3, 20, 20),
        ex('Walking Dumbbell Lunge', 'Leg Conditioning', 'Smooth upright torso step by step.', '2-0-1-0', 60, 3, 14, 14),
      ],
      [
        ex('Assault Bike 10-Min Tempo Finish', 'Aerobic Shred', 'Keep steady high wattage throughout finish.', '10 Mins', 60, 1, 10, 0),
        ex('Farmer Walk + Plank Superset', 'Core & Grip', '40m heavy walk into 30s hard plank.', 'Combo', 45, 3, 1, 26),
        ex('Shadowboxing + Burpee Finisher', 'Metabolic Shred', '45s high-tempo combos / 15s recover.', '45s Work', 45, 3, 1, 0),
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
      '5-Min Recovery Stretch',
      '5-Min Joint Decompression',
      '5-Min Calm Breathwork',
    ],
    warmupPools: [
      [
        { name: 'Pigeon Hip Opener', prescription: '60s per side' },
        { name: 'Chest Doorway Stretch', prescription: '45s' },
        { name: 'Box Breathing', prescription: '4 cycles' },
      ],
      [
        { name: 'Thoracic Foam Roll', prescription: '60s' },
        { name: 'Hamstring Stretch', prescription: '45s per leg' },
        { name: 'Nasal Breathing', prescription: '3 minutes' },
      ],
      [
        { name: 'Dead Hang', prescription: '30s' },
        { name: 'Quad Stretch', prescription: '45s per leg' },
        { name: 'Cat-Cow', prescription: '10 reps' },
      ],
    ],
    exerciseSlots: [
      [
        ex('Outdoor Daylight Walk', 'Active Rest', 'Hit 10.5k step floor easily and sleep 8.0+ hrs.', 'Easy', 60, 1, 25, 0),
        ex('Evening Mobility Walk', 'CNS Reset', 'Unplug and recharge for Monday explosive push.', 'Easy', 60, 1, 25, 0),
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

export function buildVariedSplit(
  gender: Gender,
  goal: PhysiqueGoal,
  weightKg: number,
  variationSeed = 0
): WorkoutDay[] {
  const blueprint = getBlueprintForGoal(gender, goal);
  const scale =
    gender === 'female' ? Math.max(0.75, weightKg / 60) : Math.max(0.8, weightKg / 80);
  const seed = Math.abs(Math.floor(variationSeed));

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
      // Rotate exercise choice per slot using seed + slotIdx so each regeneration produces genuinely new workouts
      const pickIdx = (seed + slotIdx) % slot.length;
      const chosen = slot[pickIdx];
      const scaledWeight = roundWeight(chosen.baseWeightKg * scale);
      // Subtle rep/set micro-periodization per variation seed
      const repDelta = seed % 3 === 1 ? 2 : seed % 3 === 2 && chosen.targetReps > 8 ? -1 : 0;
      const reps = Math.max(1, chosen.targetReps + repDelta);

      const exId = `d${day.dayIndex}-v${seed}-e${slotIdx}`;
      return {
        id: exId,
        name: chosen.name,
        muscle: chosen.muscle,
        cue: chosen.cue,
        tempo: chosen.tempo,
        restSeconds: chosen.restSeconds,
        sets: makeSets(chosen.setsCount, scaledWeight, reps, exId),
      };
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
  name: string,
  vibe: MotivationVibe,
  variationSeed = 0
): string[] {
  const first = name.trim().split(/\s+/)[0] || 'Athlete';
  let base: string[];

  if (vibe === 'Unapologetic Hype') {
    base = [
      `${first}, nobody builds a signature silhouette by negotiating with comfort.`,
      `Clock in, ${first}. Every heavy rep today writes tomorrow's presence.`,
      `${first}, the standard you tolerate in private shows up in every room you enter.`,
      `Zero shortcuts, ${first}. Own the tempo, own the pause, own the finish.`,
      `Energy follows execution, ${first}. Pick up the iron and set the tone.`,
      `${first}, hydrate like an athlete, lift like a contender, recover like royalty.`,
      `Your future physique is watching how you handle the last two reps, ${first}.`,
      `${first}, discipline looks effortless only to people who never saw your 6 AM.`,
      `Outwork yesterday's excuses, ${first}. Today's split is waiting.`,
      `${first}, precision beats intensity without direction. Hit every cue clean.`,
      `You didn't come this far to stay average, ${first}. Push the needle.`,
      `${first}, sweat is just proof your blueprint is turning physical.`,
      `Lock the grip, breathe through the brace, and dominate the set, ${first}.`,
      `${first}, consistency is louder than any announcement.`,
      `Every liter of water and every clean rep compounds in your favor, ${first}.`,
      `${first}, make this session the hardest part of everyone else's week.`,
      `Your squad sees the work, ${first}. Leave zero doubt on the floor.`,
      `${first}, chase mechanical tension, not random fatigue.`,
      `Stand tall, ${first}. You earned the right to take up space.`,
      `${first}, finish what you started when the clock hits zero.`,
    ];
  } else if (vibe === 'Elite Discipline') {
    base = [
      `${first}, precision in the warm-up dictates power in the working sets.`,
      `Control the eccentric, ${first}. Gravity is free resistance you must earn.`,
      `${first}, track every kilogram, log every liter, respect every hour of sleep.`,
      `Physique architecture is a series of deliberate, unemotional decisions, ${first}.`,
      `${first}, neural recovery is half the stimulus. Protect your bedtime window.`,
      `Execute the plan, ${first}, especially on the days motivation stays quiet.`,
      `${first}, three seconds down, one second pause. That is where shape is forged.`,
      `Small daily deviations create massive quarterly results, ${first}.`,
      `${first}, hydration fuels contraction velocity. Keep your glass moving.`,
      `Master the boring fundamentals, ${first}, and the aesthetic takes care of itself.`,
      `${first}, tension on the target muscle matters more than ego on the bar.`,
      `Honor the rest timer, ${first}. Quality output requires full ATP recovery.`,
      `${first}, align your posture, brace your core, and keep the line clean.`,
      `Your metrics do not lie, ${first}. Let the numbers guide your next progression.`,
      `${first}, consistency across 90 days beats intensity for 9 days.`,
      `Step count is silent conditioning, ${first}. Hit your floor before midnight.`,
      `${first}, treat warm-up mobility as non-negotiable armor.`,
      `Every set logged today becomes your baseline to beat next week, ${first}.`,
      `${first}, sleep is anabolic architecture. Shut down screens on schedule.`,
      `Calm focus, clinical execution, measurable progress, ${first}.`,
    ];
  } else {
    base = [
      `${first}, you're not training to shrink — you're sculpting presence that owns the room.`,
      `Everything fits better when your confidence is forged in iron, ${first}.`,
      `${first}, take your time on the pause. Luxury physiques are built with patience and tension.`,
      `Hydrate, move with poise, and watch how effortlessly your aura shifts today, ${first}.`,
      `${first}, the mirror is just catching up to the discipline you already carry.`,
      `Indulge in the ritual of becoming undeniable, ${first}.`,
      `${first}, strong glutes, sculpted shoulders, calm mind — that's an unfair advantage.`,
      `Treat today's training like an appointment with your highest self, ${first}.`,
      `${first}, you deserve the energy that comes from 8 hours of deep recovery.`,
      `Move with intention, ${first}. Every controlled rep refines the silhouette.`,
      `${first}, grace under heavy load is the ultimate signature.`,
      `Pour another glass, hit your steps, and step into the spotlight, ${first}.`,
      `${first}, your body responds to how deeply you respect your routine.`,
      `Slow eccentric, sharp focus, unapologetic standards, ${first}.`,
      `${first}, you look even better when you know nobody handed you this physique.`,
      `Let the warm-up wake up your power, ${first}. Today's session is yours.`,
      `${first}, protect your sleep like high-performance recovery armor.`,
      `Built by science, refined by consistency, carried by you, ${first}.`,
      `${first}, notice how effortless discipline feels once it becomes your identity.`,
      `Step onto the floor calm, leave knowing you raised the bar, ${first}.`,
    ];
  }

  const offset = (variationSeed * 5) % base.length;
  return [...base.slice(offset), ...base.slice(0, offset)];
}
