// تفريغ التسجيل لكابشن بتوقيت كل كلمة — بيقسم الصوت لمقاطع قصيرة عند السكتات
// (أدق بكثير وبيمنع تكرار/هلوسة Whisper بالملفات الطويلة)
// الاستخدام: node scripts/transcribe.mjs day2 [ar]
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

const name = process.argv[2] ?? "voice";
const language = process.argv[3] ?? "ar";
const root = new URL("..", import.meta.url).pathname;
const input = `${root}public/voice/${name}.16k.wav`;
const MAX_CHUNK = 15;

const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", input]).toString());
const sd = spawnSync("ffmpeg", ["-hide_banner", "-i", input, "-af", "silencedetect=n=-45dB:d=0.25", "-f", "null", "-"]).stderr.toString();
const starts = [...sd.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
const ends = [...sd.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
const mids = starts.map((s, i) => (s + (ends[i] ?? s)) / 2);

// نقاط القص: أبعد سكتة قبل ما يتجاوز المقطع MAX_CHUNK ثانية
const cuts = [0];
for (;;) {
  const last = cuts[cuts.length - 1];
  if (dur - last <= MAX_CHUNK) break;
  const cands = mids.filter((m) => m > last + 3 && m <= last + MAX_CHUNK);
  cuts.push(cands.length ? cands[cands.length - 1] : last + MAX_CHUNK);
}
cuts.push(dur);

const tmp = `${root}work/chunks`;
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const all = [];
for (let i = 0; i < cuts.length - 1; i++) {
  const [a, b] = [cuts[i], cuts[i + 1]];
  const f = `${tmp}/c${i}.wav`;
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", `${a}`, "-to", `${b}`, "-i", input, "-ar", "16000", "-ac", "1", f]);
  const out = await transcribe({
    inputPath: f, whisperPath: `${root}whisper.cpp`, whisperCppVersion: "1.7.6",
    model: "large-v3-turbo", language, tokenLevelTimestamps: true, splitOnWord: true, printOutput: false,
  });
  const { captions } = toCaptions({ whisperCppOutput: out });
  const off = a * 1000;
  for (const c of captions) {
    if (!c.text.trim()) continue;
    all.push({ ...c, startMs: Math.round(c.startMs + off), endMs: Math.round(Math.min(c.endMs + off, b * 1000)), timestampMs: c.timestampMs == null ? null : Math.round(c.timestampMs + off) });
  }
  console.log(`chunk ${i}: ${a.toFixed(1)}–${b.toFixed(1)}s  ${captions.map((c) => c.text).join("")}`);
}
writeFileSync(`${root}public/voice/${name}.captions.json`, JSON.stringify(all, null, 1));
console.log(`✓ ${all.length} كلمة`);
