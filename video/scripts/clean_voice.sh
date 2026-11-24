#!/usr/bin/env bash
# تنظيف التسجيل: إزالة ضجة الخلفية (بصمة الضجة من السكتات) + EQ للصوت + ديإيسر
# + تقصير السكتات الطويلة + ضغط + توحيد مستوى الصوت (-14 LUFS) + بوابة خفيفة بالسكتات
# الاستخدام: bash scripts/clean_voice.sh <ملف_التسجيل> <اسم_الناتج> [فترات_سكوت "s:e,s:e"]
set -euo pipefail
IN="$1"; NAME="${2:-voice}"; SPANS="${3:-}"
cd "$(dirname "$0")/.."
mkdir -p work public/voice
PY=work/venv/bin/python
[ -x "$PY" ] || { python3 -m venv work/venv && work/venv/bin/pip install -q noisereduce soundfile; }
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

ff -i "$IN" -ac 1 -ar 48000 "work/${NAME}_raw.wav"
# فترات السكوت تلقائيًا إذا ما انعطت
if [ -z "$SPANS" ]; then
  SPANS=$(ffmpeg -hide_banner -i "work/${NAME}_raw.wav" -af silencedetect=n=-40dB:d=0.4 -f null - 2>&1 \
    | grep -oE "silence_(start|end): [0-9.]+" | awk '{print $2}' | paste -d: - - | awk -F: '$2-$1>0.3' | paste -sd,)
fi
"$PY" -I scripts/denoise.py "work/${NAME}_raw.wav" "work/${NAME}_dn.wav" "$SPANS"
ff -i "work/${NAME}_dn.wav" -af "highpass=f=85,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3500:t=q:w=1.5:g=2.5,\
equalizer=f=9000:t=h:w=4000:g=1.5,deesser=i=0.35,\
silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.2:stop_periods=-1:stop_duration=0.55:stop_threshold=-50dB:stop_silence=0.4" "work/${NAME}_eq.wav"
# loudnorm لازم بخطوة لحاله (بيعلق إذا انحط بعد areverse/silenceremove بنفس السلسلة)
ff -i "work/${NAME}_eq.wav" -af "acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=8,alimiter=limit=0.89" -ar 48000 "work/${NAME}_ln.wav"
ff -i "work/${NAME}_ln.wav" -af "agate=threshold=-42dB:ratio=3:range=-18dB:attack=3:release=180:knee=6" "public/voice/$NAME.wav"
ff -i "public/voice/$NAME.wav" -ac 1 -ar 16000 "public/voice/$NAME.16k.wav"
echo "✓ public/voice/$NAME.wav  ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "public/voice/$NAME.wav")s)"
