# يصحّح نص الكابشن (من السكربت) ويحافظ على توقيت Whisper
# الاستخدام: python align_captions.py whisper.json fixed.txt out.json
# fixed.txt: سطر لكل مقطع بالترتيب: "<من_ثانية> <إلى_ثانية> | النص الصحيح"
import json, sys, bisect
W = json.load(open(sys.argv[1], encoding="utf-8"))
out = []
for line in open(sys.argv[2], encoding="utf-8"):
    if not line.strip() or line.startswith("#"): continue
    rng, text = line.split("|", 1)
    a, b = (float(x) * 1000 for x in rng.split())
    ws = [w for w in W if a <= w["startMs"] < b and w["text"].strip()]
    # خريطة: موضع الحرف التراكمي → الزمن
    xs, ts, pos = [0.0], [ws[0]["startMs"]], 0
    for w in ws:
        n = len(w["text"].strip())
        xs += [pos + 0.001, pos + n]; ts += [w["startMs"], w["endMs"]]; pos += n
    def t_at(f):
        x = f * pos; i = min(max(bisect.bisect_left(xs, x), 1), len(xs) - 1)
        x0, x1, t0, t1 = xs[i-1], xs[i], ts[i-1], ts[i]
        return t0 + (t1 - t0) * ((x - x0) / (x1 - x0) if x1 > x0 else 0)
    words = text.split(); total = sum(len(w) for w in words); c = 0
    for w in words:
        s, e = t_at(c / total), t_at((c + len(w)) / total); c += len(w)
        out.append({"text": " " + w, "startMs": round(s), "endMs": round(max(e, s + 80)), "timestampMs": round((s + e) / 2), "confidence": 1})
json.dump(out, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "words")
