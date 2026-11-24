# إزالة ضجة الخلفية بالاعتماد على بصمة الضجة من فترات السكوت
# الاستخدام: python denoise.py in.wav out.wav "start:end,start:end,..."
import sys, numpy as np, soundfile as sf, noisereduce as nr
inp, out, spans = sys.argv[1], sys.argv[2], sys.argv[3]
y, sr = sf.read(inp)
noise = np.concatenate([y[int(float(a) * sr):int(float(b) * sr)] for a, b in (s.split(":") for s in spans.split(","))])
clean = nr.reduce_noise(y=y, sr=sr, y_noise=noise, stationary=True, prop_decrease=0.95, n_fft=2048, freq_mask_smooth_hz=300, time_mask_smooth_ms=60)
sf.write(out, clean.astype(np.float32), sr, subtype="FLOAT")
print(f"noise sample {len(noise)/sr:.2f}s → {out}")
