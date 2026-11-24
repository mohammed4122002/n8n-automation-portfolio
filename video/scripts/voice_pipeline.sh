#!/usr/bin/env bash
# تسجيل → تنظيف → تفريغ كابشن.  الاستخدام: npm run voice -- <ملف_التسجيل> day2
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/clean_voice.sh "$1" "${2:-voice}"
node scripts/transcribe.mjs "${2:-voice}" "${3:-ar}"
