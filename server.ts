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
  const apiKey = process.env.GEMINI_API_KEY;
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

    const firstName = body.name.trim().split(/\s+/)[0] || body.name.trim();
    const prompt = `Create a science-backed 7-day training split and 20 personalized motivational quotes for athlete "${firstName}".
Profile:
- Gender: ${body.gender}
- Physique Goal: ${body.goal}
- Height: ${body.metrics?.heightCm ?? 170} cm, Weight: ${body.metrics?.weightKg ?? 65} kg, Age: ${body.metrics?.age ?? 26}
- Workout Time: ${body.schedule?.workoutTime ?? "18:00"}, Wake: ${body.schedule?.wakeTime ?? "06:30"}, Bedtime: ${body.schedule?.bedTime ?? "22:30"}
- Motivation Vibe: ${body.schedule?.vibe ?? "Confident & Indulging"}

Rules:
1. Return exactly 7 days in "split" ordered dayIndex 0 (Mon) through 6 (Sun) with dayLabel "Mon".."Sun". Include 5 training days and 2 active recovery/rest days (e.g., Thu & Sun).
2. If goal is "Hourglass & Glute Sculpt", emphasize upper/lower glutes, side delts, and TVA/vacuum core with zero bulky oblique work.
3. If goal is "V-Taper Aesthetic", emphasize wide lats, capped 3D side delts, upper chest shelf, and tight waist ratio.
4. Each training day needs 3-4 specific dynamic warmupDrills matching that day's target muscle, and 4-5 tailored exercises with realistic starter weights in kg, coaching cues, tempo (e.g., "3-1-1-0"), and restSeconds (60, 90, or 120).
5. Active recovery days should have isRestDay: true, 3 mobility warmupDrills, and 2 light recovery/walk/core drills in exercises (or empty exercises if purely rest, preferably 2 gentle mobility/zone-2 items).
6. Return exactly 20 short, high-impact quotes in "quotes", each addressing "${firstName}" naturally in the "${body.schedule?.vibe ?? "Confident & Indulging"}" tone.`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-4-hydrogen"];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction:
              "You are KINETIX, an elite biomechanics and physique coach. Respond strictly with valid JSON matching the schema.",
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
