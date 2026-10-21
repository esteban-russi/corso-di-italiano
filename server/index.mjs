// Minimal dependency-free Node server: serves the built SPA from ../dist and
// proxies POST /api/chat to Gemini, keeping the API key server-side only.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { buildChatPrompt, splitTranslation } from "./prompt.mjs";
import { clientKey, createRateLimiter, limiterConfigFromEnv } from "./rateLimit.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = process.env.PORT || 8080;
// Accept the legacy VITE_-prefixed name too, since that is what local .env files carry.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
// "gemini-flash-latest" is an alias that tracks the current flash model, so it
// keeps working when a specific dated version is retired for new API users.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

// /api/chat spends money on every call, so it is never served unmetered.
// Tunable via CHAT_RATE_LIMIT / CHAT_RATE_GLOBAL_LIMIT / CHAT_RATE_WINDOW_MS.
const chatLimiter = createRateLimiter(limiterConfigFromEnv());

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2",
};

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on("end", () => resolve(data));
  });
}

/**
 * Refuse the request with a machine-readable code. The client localizes it, so
 * no user-facing interface text is authored here (docs/04-interface-language.md);
 * `reply` is only a last-resort fallback for an older client.
 */
function refuse(res, status, code, fallback, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify({ error: code, reply: fallback }));
}

async function handleChat(req, res) {
  const verdict = chatLimiter.check(clientKey(req));
  if (!verdict.allowed) {
    const retryAfter = Math.max(1, Math.ceil(verdict.retryAfterMs / 1000));
    return refuse(res, 429, "rate_limited", "(Too many messages — take a short break!)", {
      "Retry-After": String(retryAfter),
    });
  }
  if (!GEMINI_API_KEY) {
    return refuse(res, 500, "server_misconfigured", "(Server missing GEMINI_API_KEY)");
  }
  try {
    const body = JSON.parse((await readBody(req)) || "{}");

    // Check if this is a persona-based chat request from the conversational interface
    if (body.personaPrompt) {
      const systemInstruction = `
${body.personaPrompt}
Tu sei un tutor madrelingua italiano per una piattaforma di apprendimento conversazionale.
Rigidità correzione: "${body.grammarStrictness || "tutor"}".
Rispondi SEMPRE in italiano naturale, accogliente e culturalmente autentico.
Includi sempre la traduzione in inglese e da 1 a 3 note grammaticali/culturali concrete (parole nuove, congiuntivo, modi di dire, pronuncia).

Restituisci ESCLUSIVAMENTE un oggetto JSON valido con la seguente struttura esatta:
{
  "text": "La tua risposta in italiano",
  "translation": "English translation of your reply",
  "grammarNotes": [
    {
      "wordOrPhrase": "parola o espressione chiave",
      "explanation": "spiegazione in inglese chiara e sintetica",
      "category": "verb"
    }
  ]
}
`.trim();

      const contents = [];
      if (Array.isArray(body.history)) {
        for (const h of body.history.slice(-6)) {
          contents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: String(h.text || "") }],
          });
        }
      }
      if (body.userMessage) {
        contents.push({
          role: "user",
          parts: [{ text: String(body.userMessage) }],
        });
      }

      const temperature = Math.min(Math.max(Number(body.temperature) || 0.7, 0.1), 1.2);

      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              maxOutputTokens: 1000,
              temperature,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      /** @type {{ candidates?: { content?: { parts?: { text?: string }[] } }[] }} */
      const data = await r.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      try {
        const parsed = JSON.parse(raw);
        const text = parsed.text || "...";
        const translation = parsed.translation || "";
        const grammarNotes = Array.isArray(parsed.grammarNotes) ? parsed.grammarNotes : [];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ reply: text, text, translation, grammarNotes }));
        return;
      } catch {
        const { reply, translation } = splitTranslation(raw);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ reply: reply || raw, text: reply || raw, translation, grammarNotes: [] }));
        return;
      }
    }

    // Default legacy prompt handling
    const systemPrompt = buildChatPrompt(body);
    const contents = (body.messages || []).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.text || "") }],
    }));
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 1000, temperature: 0.9 },
        }),
      }
    );
    /** @type {{ candidates?: { content?: { parts?: { text?: string }[] } }[] }} */
    const data = await r.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "...";
    // The translation rides along in the same turn and is split off here, so
    // the marker never reaches the thread (docs/01-conversation-core.md).
    const { reply, translation } = splitTranslation(raw);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ reply: reply || "...", text: reply || "...", translation, grammarNotes: [] }));
  } catch (e) {
    console.error("chat upstream failed:", e);
    return refuse(res, 502, "upstream_failed", "(Connection error — try again!)");
  }
}

async function handleTts(req, res) {
  if (!GEMINI_API_KEY) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "GEMINI_API_KEY not configured", fallbackToBrowser: true }));
    return;
  }
  try {
    const body = JSON.parse((await readBody(req)) || "{}");
    const { text, voiceName = "Fenrir" } = body;
    if (!text || typeof text !== "string") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Text is required for TTS" }));
      return;
    }

    const allowedVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    let selectedVoice = voiceName;
    if (!allowedVoices.includes(selectedVoice)) {
      selectedVoice = voiceName.includes("Kore") ? "Kore"
        : voiceName.includes("Puck") ? "Puck"
        : voiceName.includes("Charon") ? "Charon"
        : voiceName.includes("Fenrir") ? "Fenrir"
        : "Fenrir";
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: text }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        }),
      }
    );

    /** @type {{ candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[] }} */
    const data = await r.json();
    const base64Audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No audio generated", fallbackToBrowser: true }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        audioBase64: base64Audio,
        mimeType: "audio/wav",
        voiceUsed: selectedVoice,
      })
    );
  } catch (err) {
    console.error("TTS upstream error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "TTS generation failed", fallbackToBrowser: true }));
  }
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = normalize(join(DIST, urlPath));
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, "index.html");
    await stat(filePath);
  } catch {
    filePath = join(DIST, "index.html"); // SPA fallback
  }
  try {
    const buf = await readFile(filePath);
    const type = MIME[extname(filePath)] || "application/octet-stream";
    const cache = extname(filePath) === ".html" ? "no-cache" : "public, max-age=31536000, immutable";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": cache });
    res.end(buf);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}

createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return handleChat(req, res);
  if (req.method === "POST" && req.url === "/api/tts") return handleTts(req, res);
  if (req.method === "GET" && req.url === "/api/health") { res.writeHead(200); res.end("ok"); return; }
  return serveStatic(req, res);
}).listen(PORT, () => console.log(`corso-di-italiano listening on :${PORT}`));
