// تفريغ التسجيل لكابشن بتوقيت كل كلمة
// الاستخدام: node scripts/transcribe.mjs day2 [ar]
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { writeFileSync } from "node:fs";

const name = process.argv[2] ?? "voice";
const language = process.argv[3] ?? "ar";
const root = new URL("..", import.meta.url).pathname;

const output = await transcribe({
  inputPath: `${root}public/voice/${name}.16k.wav`,
  whisperPath: `${root}whisper.cpp`,
  whisperCppVersion: "1.7.6",
  model: "large-v3-turbo",
  language,
  tokenLevelTimestamps: true,
  splitOnWord: true,
});
const { captions } = toCaptions({ whisperCppOutput: output });
const out = `${root}public/voice/${name}.captions.json`;
writeFileSync(out, JSON.stringify(captions, null, 1));
console.log(`✓ ${captions.length} كلمة → ${out}`);
console.log(captions.map((c) => c.text).join(""));
