import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

interface BlueprintRequest {
  name: string;
  gender: "female" | "male";
  goal: string;
  variationSeed?: number;
  avoidExercises?: string[];
  customInstruction?: string;
  metrics: {
    heightCm: number;
    weightKg: number;
    age: number;
  };
  schedule: {
    workoutTime: string;
    wakeTime: string;
    bedTime: string;
    vibe: string;
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const blueprintSchema = {
  type: Type.OBJECT,
  properties: {
    split: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayIndex: { type: Type.INTEGER },
          dayLabel: { type: Type.STRING },
          title: { type: Type.STRING },
          targetMuscle: { type: Type.STRING },
          durationMin: { type: Type.INTEGER },
          isRestDay: { type: Type.BOOLEAN },
          warmupTitle: { type: Type.STRING },
          warmupDrills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                prescription: { type: Type.STRING },
              },
              required: ["name", "prescription"],
            },
          },
          exercises: {
            type: Type.ARRAY,
            description:
              "For training days (isRestDay: false), return STRICTLY 6 distinct, properly sequenced exercises (2 primary compounds, 2 secondary hypertrophy movements, 2 targeted isolation/finisher movements). Each exercise cue MUST include a clear progressive overload instruction (e.g., 'Increase weight by 2.5kg when you hit max reps'). For recovery days (isRestDay: true), return 1-2 gentle recovery/TVA activities.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                muscle: { type: Type.STRING },
                cue: { type: Type.STRING },
                tempo: { type: Type.STRING },
                restSeconds: { type: Type.INTEGER },
                setsCount: { type: Type.INTEGER },
                targetReps: { type: Type.INTEGER },
                suggestedWeightKg: { type: Type.NUMBER },
              },
              required: [
                "name",
                "muscle",
                "cue",
                "tempo",
                "restSeconds",
                "setsCount",
                "targetReps",
                "suggestedWeightKg",
              ],
            },
          },
        },
        required: [
          "dayIndex",
          "dayLabel",
          "title",
          "targetMuscle",
          "durationMin",
          "isRestDay",
          "warmupTitle",
          "warmupDrills",
          "exercises",
        ],
      },
    },
    quotes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["split", "quotes"],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "kinetix-api" });
  });

  app.post("/api/blueprint", async (req, res) => {
    const body = req.body as BlueprintRequest | undefined;
    if (!body || !body.name || !body.gender || !body.goal) {
      res.status(400).json({ ok: false, error: "Missing required athlete profile fields." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(200).json({ ok: false, fallback: true, reason: "NO_API_KEY" });
      return;
    }

    const seed = body.variationSeed ?? 0;
    const avoidClause =
      Array.isArray(body.avoidExercises) && body.avoidExercises.length > 0
        ? `\n7. IMPORTANT REGENERATION RULE (Variation #${seed}): Pick fresh exercise variations and different warm-up drills; avoid repeating these previous primary exercises: ${body.avoidExercises.slice(0, 14).join(", ")}.`
        : "";
    const customRequest =
      typeof body.customInstruction === "string" && body.customInstruction.trim()
        ? `\n8. ATHLETE CUSTOM TRAINING PREFERENCE (STRICTLY HONOR THIS): "${body.customInstruction.trim().slice(0, 280)}" — adjust exercises, equipment selection, and volume emphasis accordingly while keeping the 6-exercise structure, TVA/Stomach Vacuum drills, and progressive overload cues.`
        : "";

    const splitRule =
      body.gender === "male"
        ? `2. MALE 6-DAY PUSH/PULL/LEGS (PPL) SPLIT:
   - Mon (dayIndex 0, isRestDay: false): Push A — upper chest density (Incline Dumbbell Press / Incline Barbell Press), shoulder capping (Overhead Press, Lateral Raises), triceps.
   - Tue (dayIndex 1, isRestDay: false): Pull A — lat width (Weighted/Wide-Grip Pull-Ups, Lat Pulldown), upper/mid-back rows, rear delts, biceps.
   - Wed (dayIndex 2, isRestDay: false): Legs A — Barbell Squats, Romanian Deadlifts (RDLs), leg curls/extensions, calves, core.
   - Thu (dayIndex 3, isRestDay: false): Push B — shoulder capping (Overhead Press, Cable Lateral Raises), clavicular chest press, dips/flyes, triceps.
   - Fri (dayIndex 4, isRestDay: false): Pull B — bent-over rows, neutral/iliac pulldowns, face pulls, rear delts, biceps.
   - Sat (dayIndex 5, isRestDay: false): Legs B — RDLs / Trap Bar / Hack Squat, Bulgarian Split Squats, hamstring curls, calves, core.
   - Sun (dayIndex 6, isRestDay: true): Active Recovery & TVA Mobility.
   - Tailor exercise selection and intensity specifically to "${body.goal}".`
        : `2. FEMALE 5-DAY UPPER/LOWER SPLIT:
   - Mon (dayIndex 0, isRestDay: false): Lower A — heavily biased toward glute hypertrophy and hamstring development (Barbell Hip Thrusts, Romanian Deadlifts, Bulgarian Split Squats, Leg Curls, Hip Abductions).
   - Tue (dayIndex 1, isRestDay: false): Upper A — focused on back width/posture and shoulder toning (Lat Pulldowns, Cable Rows, Shoulder Press, Lateral Raises, Face Pulls, Arms) WITHOUT excessive chest volume.
   - Wed (dayIndex 2, isRestDay: true): Active Recovery & TVA Vacuum Mobility.
   - Thu (dayIndex 3, isRestDay: false): Lower B — posterior chain & unilateral glutes (RDLs, Bulgarian Split Squats, 45-degree Glute Extensions, Leg Curls, Kickbacks).
   - Fri (dayIndex 4, isRestDay: false): Upper B — upper back sculpt, rear delts, capped shoulders, and toned arms WITHOUT excessive chest volume.
   - Sat (dayIndex 5, isRestDay: false): Lower C — Hip Thrusts, RDLs, Sumo Squats, Glute Pull-Throughs, Hip Abductions.
   - Sun (dayIndex 6, isRestDay: true): Complete CNS Reset & Restorative Walk.
   - Tailor exercise selection and rep cadence specifically to "${body.goal}".`;

    const prompt = `Create an advanced, scientifically structured 7-day hypertrophy training split (Variation #${seed}) and 20 universal motivational quotes.
Athlete Metrics & Goal:
- Gender: ${body.gender}
- Physique Goal: ${body.goal}
- Height: ${body.metrics?.heightCm ?? 170} cm, Weight: ${body.metrics?.weightKg ?? 65} kg, Age: ${body.metrics?.age ?? 26}
- Workout Time: ${body.schedule?.workoutTime ?? "18:00"}, Wake: ${body.schedule?.wakeTime ?? "06:30"}, Bedtime: ${body.schedule?.bedTime ?? "22:30"}
- Motivation Vibe: ${body.schedule?.vibe ?? "Confident & Indulging"}

Rules:
1. Return exactly 7 days in "split" ordered dayIndex 0 (Mon) through 6 (Sun) with dayLabel "Mon".."Sun".
${splitRule}
3. CORE & STABILITY (ALL USERS): Inject TVA (Transverse Abdominis) engagement work and Stomach Vacuum holds into the warmupDrills (e.g., "TVA Rib-Tuck & Stomach Vacuum Hold: 3 x 20s full-exhale holds") or core slot on EVERY day.
4. PROGRESSIVE OVERLOAD CUES: Every exercise "cue" MUST include a clear progressive overload instruction (for example: "Increase weight by 2.5kg when you hit max reps") alongside crisp biomechanics.
5. STRICT 6-EXERCISE RULE: Every training day (isRestDay: false) MUST include 3-4 specific warmupDrills AND STRICTLY 6 distinct, properly sequenced exercises (2 primary compounds, 2 secondary hypertrophy movements, 2 targeted isolation/finisher movements) with realistic starter weights in kg, tempo (e.g., "3-1-1-0"), and restSeconds (45, 60, 90, 120, or 150). Recovery days (isRestDay: true) have 3 mobility/TVA warmupDrills and 1-2 gentle walk/TVA activities.
6. STRICT NAMING CONVENTION: All routine titles, exercise names, cues, warmups, and all 20 "quotes" MUST use standard, professional fitness terminology ONLY. NEVER include any personal names, nicknames, pet names, or personal identifiers so the output is 100% universal for any squad member. Match the "${body.schedule?.vibe ?? "Confident & Indulging"}" tone.${avoidClause}${customRequest}`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-4-hydrogen"];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction:
              "You are an elite strength, biomechanics, and hypertrophy coach. Respond strictly with valid JSON matching the schema. Never include personal identifiers or pet names.",
            responseMimeType: "application/json",
            responseSchema: blueprintSchema,
          },
        });

        const rawText = (response.text ?? "").trim();
        if (!rawText) continue;
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed.split) && parsed.split.length === 7 && Array.isArray(parsed.quotes)) {
          res.json({ ok: true, model: modelName, blueprint: parsed });
          return;
        }
      } catch (err) {
        console.error(`[KINETIX] Gemini error (${modelName}):`, err instanceof Error ? err.message : err);
      }
    }

    res.status(200).json({ ok: false, fallback: true, reason: "GENERATION_FALLBACK" });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KINETIX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start KINETIX server:", err);
  process.exit(1);
});
