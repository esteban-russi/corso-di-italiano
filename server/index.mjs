// Minimal dependency-free Node server: serves the built SPA from ../dist and
// proxies POST /api/chat to Gemini, keeping the API key server-side only.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { buildChatPrompt } from "./prompt.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = process.env.PORT || 8080;
// Accept the legacy VITE_-prefixed name too, since that is what local .env files carry.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
// "gemini-flash-latest" is an alias that tracks the current flash model, so it
// keeps working when a specific dated version is retired for new API users.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

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

async function handleChat(req, res) {
  if (!GEMINI_API_KEY) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ reply: "(Server missing GEMINI_API_KEY)" }));
    return;
  }
  try {
    const body = JSON.parse((await readBody(req)) || "{}");
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
    const data = await r.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "...";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ reply }));
  } catch (e) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ reply: "(Connection error — try again!)", error: String(e) }));
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
  if (req.method === "GET" && req.url === "/api/health") { res.writeHead(200); res.end("ok"); return; }
  return serveStatic(req, res);
}).listen(PORT, () => console.log(`corso-di-italiano listening on :${PORT}`));
