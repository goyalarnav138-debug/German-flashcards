import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, getUserStats, updateUserStats, getAllStudents } from "./src/db/users.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth & User endpoints
app.post("/api/auth/register", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, role, section } = req.body;
    const uid = req.user!.uid;
    const email = req.user!.email || "";
    
    const user = await getOrCreateUser(uid, email, name || "Student", role || "student", section);
    res.json(user);
  } catch (error: any) {
    console.error("Failed to register user:", error);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
});

app.get("/api/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email;
    const name = req.user!.name;
    const stats = await getUserStats(uid, email, name);
    res.json(stats);
  } catch (error: any) {
    console.error("Failed to fetch stats:", error);
    res.status(500).json({ error: error.message || "Failed to fetch stats" });
  }
});

app.post("/api/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const statsData = req.body;
    const updatedStats = await updateUserStats(uid, statsData);
    res.json(updatedStats);
  } catch (error: any) {
    console.error("Failed to update stats:", error);
    res.status(500).json({ error: error.message || "Failed to update stats" });
  }
});

app.get("/api/students", requireAuth, async (req: AuthRequest, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (error: any) {
    console.error("Failed to fetch students:", error);
    res.status(500).json({ error: error.message || "Failed to fetch students" });
  }
});

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Grammar Explanation for a Verb + Preposition combination
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { verb, prep, caseName, meaning } = req.body;
    if (!verb || !prep || !caseName) {
      return res.status(400).json({ error: "Missing required parameters (verb, prep, caseName)" });
    }

    const ai = getAIClient();
    const prompt = `You are an expert German teacher explaining the verb '${verb}' with preposition '${prep}' (+ ${caseName}), meaning '${meaning || ''}'.
Provide a high school student-friendly explanation, 3 natural German example sentences with English translations, and a clever memory tip (mnemonic).
Return the result strictly in JSON matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verb: { type: Type.STRING },
            prep: { type: Type.STRING },
            caseName: { type: Type.STRING },
            explanation: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  german: { type: Type.STRING },
                  english: { type: Type.STRING }
                },
                required: ["german", "english"]
              }
            },
            mnemonic: { type: Type.STRING }
          },
          required: ["verb", "prep", "caseName", "explanation", "examples", "mnemonic"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json(data);
  } catch (err: any) {
    console.error("Gemini explain error:", err);
    return res.status(500).json({
      error: "Failed to generate AI explanation.",
      details: err?.message || String(err)
    });
  }
});

// AI Worksheet / Quiz Question Generator
app.post("/api/gemini/generate-worksheet", async (req, res) => {
  try {
    const { grade = "class_9", count = 5 } = req.body;
    const ai = getAIClient();

    const prompt = `Generate a German fill-in-the-blank practice worksheet for ${grade === "class_9" ? "Class 9th (CBSE German standard syllabus - Verbs with Prepositions)" : "Class 10th / B1 German level"}.
Generate ${count} questions testing German prepositions and cases.
Each question should have a sentence with '___' where the preposition belongs, specify the verb being tested, the correct preposition, the correct case, and 4 multiple-choice options.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              sentence: { type: Type.STRING },
              verb: { type: Type.STRING },
              correctPrep: { type: Type.STRING },
              correctCase: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              explanation: { type: Type.STRING }
            },
            required: ["id", "sentence", "verb", "correctPrep", "correctCase", "options", "explanation"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const data = JSON.parse(text);
    return res.json({ questions: data });
  } catch (err: any) {
    console.error("Gemini worksheet error:", err);
    return res.status(500).json({
      error: "Failed to generate worksheet.",
      details: err?.message || String(err)
    });
  }
});

// AI German Tutor Chat
app.post("/api/gemini/tutor", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAIClient();
    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: `You are 'Herr Weber', an encouraging, friendly, and expert German language teacher for high school students in Class 9th and 10th.
Help students master German verbs with fixed prepositions (Verben mit Präpositionen), Dativ vs. Akkusativ cases, sentence structure, and vocabulary.
Keep explanations clear, engaging, formatted with Markdown, and include small German practice sentences or quizzes when helpful.`
      }
    });

    // Replay simple history if provided
    for (const h of history) {
      if (h.role === "user" || h.role === "model") {
        await chat.sendMessage({ message: h.text });
      }
    }

    const response = await chat.sendMessage({ message });
    return res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini tutor error:", err);
    return res.status(500).json({
      error: "Tutor communication failed.",
      details: err?.message || String(err)
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
