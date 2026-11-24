// ينصّب whisper.cpp + موديل يدعم العربي لتفريغ الصوت لكابشن
import { installWhisperCpp, downloadWhisperModel } from "@remotion/install-whisper-cpp";
const folder = new URL("../whisper.cpp", import.meta.url).pathname;
await installWhisperCpp({ to: folder, version: "1.7.6" });
await downloadWhisperModel({ model: "large-v3-turbo", folder });
console.log("whisper ready");
