#!/usr/bin/env bash
# تنظيف التسجيل: إزالة ضجة + قص الصمت بالبداية والنهاية + توحيد مستوى الصوت (-14 LUFS)
# الاستخدام: bash scripts/clean_voice.sh <ملف_التسجيل> <اسم_الناتج>   مثال: day2
set -euo pipefail
IN="$1"; NAME="${2:-voice}"
cd "$(dirname "$0")/.."
OUT="public/voice/$NAME.wav"
TMP="$(mktemp --suffix=.wav)"; trap 'rm -f "$TMP"' EXIT
# 1) فلترة + إزالة ضجة + قص الصمت
ffmpeg -hide_banner -loglevel error -y -i "$IN" -ac 1 -ar 48000 -af "\
highpass=f=80,lowpass=f=12000,afftdn=nf=-25,\
silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,\
areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.3,areverse" "$TMP"
# 2) ضغط + توحيد مستوى الصوت (loudnorm لازم بخطوة لحاله)
ffmpeg -hide_banner -loglevel error -y -i "$TMP" -af "\
acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 48000 "$OUT"
# نسخة 16kHz للتفريغ بـ Whisper
ffmpeg -hide_banner -loglevel error -y -i "$OUT" -ac 1 -ar 16000 "public/voice/$NAME.16k.wav"
echo "✓ $OUT  ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s)"
