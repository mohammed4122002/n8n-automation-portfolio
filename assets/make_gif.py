from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display
import math, os, textwrap

# Install the rendering dependencies with: python -m pip install -r assets/requirements.txt

# ─── Config ──────────────────────────────────────────────────────────────────
W, H       = 1200, 480
FPS        = 20
HOLD_SEC   = 1.5      # seconds each project card stays visible
TRANS_SEC  = 0.5      # seconds for slide transition
INTRO_SEC  = 2.2      # seconds for the intro screen

TRANS_F = int(FPS * TRANS_SEC)
INTRO_F = int(FPS * INTRO_SEC)

# brand palette  (dark bg + accent gradient per project)
BG        = (11, 13, 23)
CARD_BG   = (20, 24, 40)
WHITE     = (255, 255, 255)
DIM       = (120, 130, 160)
ACCENT_A  = (99, 102, 241)   # indigo
ACCENT_B  = (139, 92, 246)   # violet
GOLD      = (251, 191, 36)

PROJECTS = [
    {"num": "01", "en": "Email Digest → Telegram",       "ar": "ملخص Gmail اليومي",           "col": (99,102,241)},
    {"num": "02", "en": "Smart Gmail Replies",            "ar": "مساعد الرد الذكي",             "col": (139,92,246)},
    {"num": "03", "en": "Gmail Attachments → Drive",     "ar": "منظّم مرفقات Gmail",           "col": (59,130,246)},
    {"num": "04", "en": "Daily Sales Report",             "ar": "تقرير المبيعات اليومي",        "col": (16,185,129)},
    {"num": "05", "en": "Client Intake & Welcome Email", "ar": "نموذج استقبال العملاء",         "col": (245,158,11)},
    {"num": "06", "en": "Error Monitoring Center",        "ar": "مركز مراقبة الأخطاء",          "col": (239,68,68)},
    {"num": "07", "en": "Content Calendar Publisher",    "ar": "ناشر تقويم المحتوى",           "col": (236,72,153)},
    {"num": "08", "en": "AI Support Ticket Triage",      "ar": "فرز تذاكر دعم العملاء",        "col": (14,165,233)},
    {"num": "09", "en": "Arabic ↔ English Translator",   "ar": "بوت ترجمة مع فحص الجودة",     "col": (168,85,247)},
    {"num": "10", "en": "Voice Notes → Tasks",           "ar": "ملاحظات صوتية إلى مهام",       "col": (20,184,166)},
    {"num": "11", "en": "Weekly Content Ideas Engine",   "ar": "محرك أفكار المحتوى الأسبوعي", "col": (234,179,8)},
    {"num": "12", "en": "Invoice Extraction & Validation","ar": "استخراج الفواتير والتحقق",   "col": (99,102,241)},
    {"num": "13", "en": "RAG Knowledge Agent",           "ar": "مساعد المعرفة الداخلي (RAG)",  "col": (139,92,246)},
    {"num": "14", "en": "AI Lead Scoring & Routing",     "ar": "تقييم العملاء وتوزيعهم",       "col": (16,185,129)},
    {"num": "15", "en": "Contact Data Cleaning",         "ar": "تنظيف بيانات جهات الاتصال",    "col": (245,158,11)},
    {"num": "16", "en": "Customer Deduplication",       "ar": "إزالة التكرار من قائمة العملاء","col": (59,130,246)},
    {"num": "17", "en": "Nested JSON → Table",            "ar": "تحويل JSON معقد إلى جدول",      "col": (14,165,233)},
    {"num": "18", "en": "Regex Contact Extraction",     "ar": "استخراج الأرقام والإيميلات",    "col": (168,85,247)},
    {"num": "19", "en": "JavaScript Commission",         "ar": "معادلة عمولة مخصصة",            "col": (16,185,129)},
    {"num": "20", "en": "HTTP Request → Any API",        "ar": "ربط API الطقس دون node جاهز",    "col": (59,130,246)},
]

# ─── Font helpers ─────────────────────────────────────────────────────────────
def load_font(size, bold=False):
    candidates = []
    if bold:
        candidates += [
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/calibrib.ttf",
            "C:/Windows/Fonts/trebucbd.ttf",
        ]
    candidates += [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
        "C:/Windows/Fonts/seguiemj.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

FONT_NUM   = load_font(76, bold=True)
FONT_EN    = load_font(31, bold=True)
FONT_AR    = load_font(24)
FONT_TITLE = load_font(62, bold=True)
FONT_SUB   = load_font(23)
FONT_TAG   = load_font(16)
FONT_PROG  = load_font(15)
FONT_MICRO = load_font(12, bold=True)

# ─── Drawing helpers ─────────────────────────────────────────────────────────
def lerp(a, b, t):
    return a + (b - a) * t

def ease_inout(t):
    return t * t * (3 - 2 * t)

def hex_col(col, alpha=255):
    return (*col, alpha)

def shape_text(text):
    if any("\u0600" <= char <= "\u06ff" for char in text):
        return get_display(arabic_reshaper.reshape(text), base_dir="R")
    return text

def gradient_rect(draw, x0, y0, x1, y1, c1, c2, vertical=True):
    steps = (y1 - y0) if vertical else (x1 - x0)
    for i in range(steps):
        t = i / max(steps - 1, 1)
        r = int(lerp(c1[0], c2[0], t))
        g = int(lerp(c1[1], c2[1], t))
        b = int(lerp(c1[2], c2[2], t))
        if vertical:
            draw.line([(x0, y0+i), (x1, y0+i)], fill=(r,g,b))
        else:
            draw.line([(x0+i, y0), (x0+i, y1)], fill=(r,g,b))

def rounded_rect(draw, x0, y0, x1, y1, r, fill, outline=None, outline_w=2):
    draw.rectangle([x0+r, y0, x1-r, y1], fill=fill)
    draw.rectangle([x0, y0+r, x1, y1-r], fill=fill)
    draw.ellipse([x0, y0, x0+2*r, y0+2*r], fill=fill)
    draw.ellipse([x1-2*r, y0, x1, y0+2*r], fill=fill)
    draw.ellipse([x0, y1-2*r, x0+2*r, y1], fill=fill)
    draw.ellipse([x1-2*r, y1-2*r, x1, y1], fill=fill)
    if outline:
        draw.arc([x0, y0, x0+2*r, y0+2*r], 180, 270, fill=outline, width=outline_w)
        draw.arc([x1-2*r, y0, x1, y0+2*r], 270, 0,   fill=outline, width=outline_w)
        draw.arc([x0, y1-2*r, x0+2*r, y1], 90,  180, fill=outline, width=outline_w)
        draw.arc([x1-2*r, y1-2*r, x1, y1], 0,   90,  fill=outline, width=outline_w)
        draw.line([x0+r, y0, x1-r, y0], fill=outline, width=outline_w)
        draw.line([x0+r, y1, x1-r, y1], fill=outline, width=outline_w)
        draw.line([x0, y0+r, x0, y1-r], fill=outline, width=outline_w)
        draw.line([x1, y0+r, x1, y1-r], fill=outline, width=outline_w)

def center_text(draw, text, font, y, col=WHITE, x_range=(0, W)):
    display_text = shape_text(text)
    try:
        bbox = draw.textbbox((0, 0), display_text, font=font)
        tw = bbox[2] - bbox[0]
    except:
        tw = len(text) * 10
    cx = (x_range[0] + x_range[1]) // 2
    draw.text((cx - tw//2, y), display_text, font=font, fill=col)

def draw_progress(draw, current, total, transition=0):
    x0, y, segment_w, gap = 80, H - 20, 45, 8
    for index in range(total):
        x = x0 + index * (segment_w + gap)
        if index < current:
            color = PROJECTS[index]["col"]
        elif index == current:
            color = tuple(int(lerp(c, 255, transition * 0.35)) for c in PROJECTS[index]["col"])
        else:
            color = (34, 41, 60)
        rounded_rect(draw, x, y, x + segment_w, y + 4, 2, color)

# ─── Frame renderers ─────────────────────────────────────────────────────────
def draw_bg(draw, phase=0):
    gradient_rect(draw, 0, 0, W, H, (8, 11, 21), (16, 20, 36))
    glow_x = int(930 + math.sin(phase * math.tau) * 90)
    glow_y = int(130 + math.cos(phase * math.tau) * 35)
    for radius in range(260, 20, -20):
        blend = 0.12 * (1 - radius / 260)
        color = tuple(int(BG[i] * (1 - blend) + ACCENT_B[i] * blend) for i in range(3))
        draw.ellipse([glow_x - radius, glow_y - radius, glow_x + radius, glow_y + radius], fill=color)

def draw_grid(draw):
    grid = (25, 31, 49)
    for x in range(24, W, 48):
        draw.line([(x,0),(x,H)], fill=grid, width=1)
    for y in range(24, H, 48):
        draw.line([(0,y),(W,y)], fill=grid, width=1)

def draw_card(draw, proj, ox=0, phase=0):
    col  = proj["col"]
    col2 = tuple(min(255, int(c*1.4)) for c in col)
    cx   = W // 2 + ox

    cw, ch = 1040, 338
    rx, ry = cx - cw//2, 72
    shadow = (5, 8, 17)
    rounded_rect(draw, rx + 5, ry + 8, rx + cw + 5, ry + ch + 8, 24, shadow)
    rounded_rect(draw, rx, ry, rx + cw, ry + ch, 24, (16, 21, 37),
                 outline=(43, 51, 72), outline_w=2)
    rounded_rect(draw, rx + 1, ry + 1, rx + cw - 1, ry + 5, 2, col)

    # Header and animated accent.
    draw.text((rx + 34, ry + 23), "N8N  /  AUTOMATION PORTFOLIO",
              font=FONT_MICRO, fill=(137, 148, 173))
    counter = f"PROJECT  {proj['num']}  /  {len(PROJECTS):02}"
    bbox = draw.textbbox((0, 0), counter, font=FONT_MICRO)
    draw.text((rx + cw - 34 - bbox[2], ry + 23), counter,
              font=FONT_MICRO, fill=(137, 148, 173))

    # Project identity.
    draw.text((rx + 34, ry + 54), proj["num"], font=FONT_NUM, fill=col)
    draw.line([(rx + 36, ry + 145), (rx + 132, ry + 145)], fill=col, width=4)
    en_lines = textwrap.wrap(proj["en"], width=35)
    for line_index, line in enumerate(en_lines[:2]):
        draw.text((rx + 36, ry + 158 + line_index * 38), line,
                  font=FONT_EN, fill=WHITE)
    display_ar = shape_text(proj["ar"])
    ar_bbox = draw.textbbox((0, 0), display_ar, font=FONT_AR)
    ar_width = ar_bbox[2] - ar_bbox[0]
    draw.text((rx + 36 + min(570 - ar_width, 570), ry + 249), display_ar,
              font=FONT_AR, fill=col2)

    # Compact tags.
    tags = ["n8n", "NO-CODE + CODE", "30-DAY SERIES"]
    tx = rx + 36
    for tag in tags:
        width = draw.textbbox((0, 0), tag, font=FONT_MICRO)[2] + 24
        rounded_rect(draw, tx, ry + 297, tx + width, ry + 322, 8,
                     (25, 31, 51), outline=(48, 57, 78), outline_w=1)
        draw.text((tx + 12, ry + 303), tag, font=FONT_MICRO, fill=(174, 184, 205))
        tx += width + 10

    # Workflow preview panel.
    px, py, pw, ph = rx + 676, ry + 58, 332, 254
    rounded_rect(draw, px, py, px + pw, py + ph, 18, (12, 17, 31),
                 outline=(38, 47, 68), outline_w=1)
    draw.text((px + 18, py + 16), "WORKFLOW PREVIEW",
              font=FONT_MICRO, fill=(117, 131, 157))
    nodes = [(px + 54, py + 112), (px + 166, py + 72), (px + 278, py + 112)]
    for index in range(2):
        draw.line([nodes[index], nodes[index + 1]], fill=(55, 66, 91), width=3)
        pulse_t = (phase * 2.0 + index * 0.42) % 1
        dot_x = int(lerp(nodes[index][0], nodes[index + 1][0], pulse_t))
        dot_y = int(lerp(nodes[index][1], nodes[index + 1][1], pulse_t))
        draw.ellipse([dot_x - 5, dot_y - 5, dot_x + 5, dot_y + 5], fill=col)

    labels = ["TRIGGER", "WORKFLOW", "OUTPUT"]
    for index, (node_x, node_y) in enumerate(nodes):
        radius = 23 if index == 1 else 19
        draw.ellipse([node_x - radius, node_y - radius, node_x + radius, node_y + radius],
                     fill=(24, 31, 49), outline=col if index == 1 else (72, 83, 107), width=2)
        if index == 1:
            inner = 6 + int(2 * (0.5 + 0.5 * math.sin(phase * math.tau)))
            draw.ellipse([node_x - inner, node_y - inner, node_x + inner, node_y + inner], fill=col)
        else:
            draw.ellipse([node_x - 5, node_y - 5, node_x + 5, node_y + 5], fill=col)
        label = labels[index]
        label_box = draw.textbbox((0, 0), label, font=FONT_MICRO)
        label_width = label_box[2] - label_box[0]
        draw.text((node_x - label_width // 2, node_y + 34), label,
                  font=FONT_MICRO, fill=(151, 164, 188))

    # Decorative activity bars make the preview feel alive without competing with the title.
    bar_y = py + 206
    for index in range(12):
        height = 5 + int((index % 4) * 2 + 3 * (0.5 + 0.5 * math.sin(phase * math.tau + index * 0.8)))
        bar_x = px + 24 + index * 23
        draw.rounded_rectangle([bar_x, bar_y - height, bar_x + 11, bar_y],
                               radius=4, fill=col if index < 3 + int(phase * 8) % 8 else (42, 51, 72))

def render_card_frame(proj_idx, ox=0, phase=0):
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_bg(draw, phase)
    draw_grid(draw)
    draw_card(draw, PROJECTS[proj_idx], ox=ox, phase=phase)
    draw_progress(draw, proj_idx, len(PROJECTS))
    return img

def render_intro_frame(t):
    """Render a branded animated title card."""
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_bg(draw, t)
    draw_grid(draw)
    intro_y = int(68 + (1 - ease_inout(min(t * 1.4, 1))) * 28)
    draw.text((80, intro_y), "AUTOMATION", font=FONT_TITLE, fill=WHITE)
    draw.text((80, intro_y + 70), "PORTFOLIO", font=FONT_TITLE, fill=ACCENT_B)
    draw.text((84, intro_y + 158), "BUILT WITH n8n  /  30-DAY SERIES",
              font=FONT_SUB, fill=(160, 173, 197))
    display_ar = shape_text("أتمتة عملية، خطوة بخطوة")
    ar_box = draw.textbbox((0, 0), display_ar, font=FONT_AR)
    draw.text((84, intro_y + 202), display_ar, font=FONT_AR, fill=(189, 199, 218))

    # Animated node constellation.
    center = (865, 226)
    orbit = [(0, -114), (126, -38), (78, 106), (-78, 106), (-126, -38)]
    points = [(center[0] + dx, center[1] + dy) for dx, dy in orbit]
    for index in range(len(points)):
        draw.line([points[index], points[(index + 1) % len(points)]],
                  fill=(49, 58, 83), width=2)
    for index, (x, y) in enumerate(points):
        radius = 20 if index == 0 else 13
        draw.ellipse([x - radius, y - radius, x + radius, y + radius],
                     fill=(21, 28, 47), outline=ACCENT_A if index == 0 else (72, 87, 119), width=2)
        if index == 0:
            draw.ellipse([x - 6, y - 6, x + 6, y + 6], fill=ACCENT_B)
    pulse_index = int(t * len(points)) % len(points)
    px, py = points[pulse_index]
    draw.ellipse([px - 5, py - 5, px + 5, py + 5], fill=(189, 178, 255))

    badge_x, badge_y = 760, 366
    rounded_rect(draw, badge_x, badge_y, badge_x + 250, badge_y + 48, 16,
                 (22, 29, 49), outline=(54, 65, 93), outline_w=1)
    draw.text((badge_x + 20, badge_y + 14), "20 WORKFLOWS", font=FONT_TAG, fill=WHITE)
    draw.ellipse([badge_x + 200, badge_y + 18, badge_x + 212, badge_y + 30], fill=(45, 212, 153))
    draw.text((80, H - 42), "EMAIL   ·   AI   ·   DATA   ·   API", font=FONT_MICRO, fill=(113, 128, 154))
    return img

# ─── Build frames ─────────────────────────────────────────────────────────────
frames = []
durations = []

print("Rendering intro...")
for f in range(INTRO_F):
    t = f / max(INTRO_F-1, 1)
    frames.append(render_intro_frame(t))
    durations.append(int(INTRO_SEC * 1000 / INTRO_F))

print("Rendering project cards...")
frame_number = INTRO_F
for idx in range(len(PROJECTS)):
    frames.append(render_card_frame(idx, phase=frame_number / FPS))
    durations.append(int(HOLD_SEC * 1000))
    frame_number += 1

    # slide transition to next (except last)
    if idx < len(PROJECTS) - 1:
        for f in range(TRANS_F):
            t = ease_inout(f / max(TRANS_F-1, 1))
            ox_out = -int(t * (W + 600))
            ox_in  = int((1-t) * (W + 600))

            img  = Image.new("RGB", (W, H), BG)
            draw = ImageDraw.Draw(img)
            phase = frame_number / FPS
            draw_bg(draw, phase)
            draw_grid(draw)
            draw_card(draw, PROJECTS[idx], ox=ox_out, phase=phase)
            draw_card(draw, PROJECTS[idx+1], ox=ox_in, phase=phase)
            draw_progress(draw, idx, len(PROJECTS), transition=t)
            frames.append(img)
            durations.append(int(1000 / FPS))
            frame_number += 1

print(f"Total frames: {len(frames)}")

# ─── Optimise & Export ────────────────────────────────────────────────────────
# Convert to palette mode for smaller file
palette_frames = []
for img in frames:
    palette_frames.append(img.convert("P", palette=Image.ADAPTIVE, colors=128))

out_path = os.path.join(os.path.dirname(__file__), "automation-showcase.gif")
palette_frames[0].save(
    out_path,
    save_all=True,
    append_images=palette_frames[1:],
    optimize=True,
    loop=0,
    duration=durations,
    disposal=2,
)
print(f"Saved: {out_path}  ({os.path.getsize(out_path)//1024} KB)")
