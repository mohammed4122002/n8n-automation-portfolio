import React from "react";
import {
  AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
  CalculateMetadataFunction,
} from "remotion";
import { Audio } from "@remotion/media";
import { createTikTokStyleCaptions, Caption } from "@remotion/captions";
import { parseMedia } from "@remotion/media-parser";
import { SFX, MUSIC } from "../sounds";
import captionsJson from "../../public/voice/day2.captions.json";

// ───────── الهوية ─────────
const GOLD = "#e0b84f";
const GOLD_DEEP = "#b8892a";
const INK = "#0b0a08";
const CREAM = "#f6eedb";
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const VOICE = "voice/day2.wav";

const fontFace = `
@font-face{font-family:Cairo;src:url(${staticFile("fonts/Cairo-800.ttf")});font-weight:800}
@font-face{font-family:Cairo;src:url(${staticFile("fonts/Cairo-400.ttf")});font-weight:400}`;

// ───────── التوقيتات (ثواني، من الكابشن المتزامن مع الصوت) ─────────
const T = {
  hook: 0, oneLine: 7.6,
  pieces: 9.0, prompt: 12.2, model: 14.9, parser: 17.6,
  tape: 20.8,
  pipe: 28.5, pBrompt: 32.7, pModel: 33.9, pParser: 35.0, pipeWord: 36.7, factory: 38.0,
  code: 41.3, vscode: 44.0, typeStart: 44.9,
  term: 55.9, bullets: 58.3, sorry: 63.5, polite: 66.3, stream: 70.8, shorter: 73.0,
  takeaway: 76.2,
  cta: 84.5, follow: 92.0, tomorrow: 94.7, bye: 98.6,
};

export const calculateDay2Metadata: CalculateMetadataFunction<Record<string, unknown>> = async () => {
  const { slowDurationInSeconds } = await parseMedia({ src: staticFile(VOICE), fields: { slowDurationInSeconds: true } });
  return { durationInFrames: Math.ceil((slowDurationInSeconds + 1.2) * FPS) };
};

// ───────── أدوات حركة ─────────
// إزاحة المشهد الحالي (عشان التوقيتات تكون بالثواني المطلقة من بداية الفيديو)
const OffsetCtx = React.createContext(0);
const useAppear = (atSec: number, delay = 0, damping = 14) => {
  const f = useCurrentFrame() + React.useContext(OffsetCtx);
  const { fps } = useVideoConfig();
  return spring({ frame: f - s(atSec) - delay, fps, config: { damping, mass: 0.7 } });
};
const fadeOut = (f: number, dur: number, len = 8) =>
  interpolate(f, [dur - len, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// مشهد بيظهر ويختفي بنعومة — الإحداثيات داخله نسبية لبدايته
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode; sfx?: string }> = ({ from, to, children, sfx }) => {
  const dur = s(to) - s(from);
  return (
    <Sequence from={s(from)} durationInFrames={dur} layout="none">
      <OffsetCtx.Provider value={s(from)}><SceneInner dur={dur}>{children}</SceneInner></OffsetCtx.Provider>
      {sfx ? <Audio src={sfx} volume={0.45} /> : null}
    </Sequence>
  );
};
const SceneInner: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 9], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = fadeOut(f, dur);
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), transform: `translateY(${(1 - inn) * 40}px) scale(${0.97 + 0.03 * inn})` }}>
      {children}
    </AbsoluteFill>
  );
};

// صوت عند لحظة معيّنة (ثواني مطلقة)
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.5 }) => (
  <Sequence from={s(at)} durationInFrames={s(3)} layout="none"><Audio src={src} volume={volume} /></Sequence>
);

// ───────── الخلفية ─────────
const Background: React.FC<{ gold: boolean }> = ({ gold }) => {
  const f = useCurrentFrame();
  const rot = f * 0.04;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{
        background: `repeating-conic-gradient(from ${rot}deg at 50% 38%, rgba(224,184,79,.10) 0deg 4deg, transparent 4deg 14deg)`,
        maskImage: "radial-gradient(circle at 50% 38%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 38%, black 0%, transparent 70%)",
      }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(224,184,79,.22), transparent 55%)" }} />
      <AbsoluteFill style={{
        opacity: gold ? 1 : 0, transition: "none",
        background: `radial-gradient(circle at 50% 35%, #f3d27a 0%, ${GOLD} 40%, ${GOLD_DEEP} 100%)`,
      }} />
    </AbsoluteFill>
  );
};

// ───────── الهيدر الثابت ─────────
const Header: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const progress = f / durationInFrames;
  return (
    <>
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 30px 12px 14px", borderRadius: 60,
          background: "rgba(15,13,9,.85)", border: `2px solid ${GOLD}55`, direction: "ltr" }}>
          <Img src={staticFile("brand/avatar.jpg")} style={{ width: 58, height: 58, borderRadius: 30, border: `2px solid ${GOLD}` }} />
          <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 30, color: CREAM, letterSpacing: 0.5 }}>Mohammed Abu Saada</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a }}>
        <div dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 30, color: GOLD }}>اليوم 2 من 30 · LangChain</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 10, width: `${progress * 100}%`, background: GOLD }} />
    </>
  );
};

// ───────── عناصر مشتركة ─────────
const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string; at?: number }> = ({ children, size = 92, color = CREAM, at }) => {
  const a = useAppear(at ?? -10);
  return (
    <div dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: size, lineHeight: 1.3, color, textAlign: "center",
      opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>{children}</div>
  );
};
const Hl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: GOLD, color: INK, padding: "0 18px", borderRadius: 14, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
);

const PieceCard: React.FC<{ label: string; en: string; desc: string; n: number; at: number; tilt?: number; tape?: boolean }> =
  ({ label, en, desc, n, at, tilt = 0, tape }) => {
    const a = useAppear(at);
    return (
      <div style={{ position: "relative", width: 820, padding: "30px 40px", borderRadius: 30, background: "rgba(24,21,15,.95)",
        border: `3px solid ${GOLD}`, boxShadow: `0 20px 60px rgba(0,0,0,.6), 0 0 40px ${GOLD}22`,
        display: "flex", alignItems: "center", gap: 34, direction: "rtl",
        opacity: a, transform: `translateX(${(1 - a) * -120}px) rotate(${tilt}deg) scale(${0.9 + 0.1 * a})` }}>
        <div style={{ width: 110, height: 110, borderRadius: 26, background: GOLD, color: INK, display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily: "Cairo", fontWeight: 800, fontSize: 62, flexShrink: 0 }}>{n}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 56, color: CREAM, lineHeight: 1.2 }}>
            {label} <span style={{ color: GOLD, fontSize: 40, direction: "ltr", unicodeBidi: "isolate" }}>{en}</span>
          </div>
          <div style={{ fontFamily: "Cairo", fontWeight: 400, fontSize: 36, color: "#cbbf9f" }}>{desc}</div>
        </div>
        {tape ? (
          <div style={{ position: "absolute", top: -26, left: 120 + n * 90, width: 200, height: 56, background: "rgba(230,220,190,.75)",
            transform: `rotate(${n % 2 ? 8 : -10}deg)`, boxShadow: "0 4px 10px rgba(0,0,0,.4)" }} />
        ) : null}
      </div>
    );
  };

// ───────── المشاهد ─────────
const HookScene: React.FC = () => {
  const one = useAppear(T.oneLine);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, gap: 50 }}>
      <div style={{ width: 300, height: 300, borderRadius: 160, padding: 8, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
        boxShadow: `0 0 80px ${GOLD}55` }}>
        <Img src={staticFile("brand/portrait.jpg")} style={{ width: "100%", height: "100%", borderRadius: 150, objectFit: "cover" }} />
      </div>
      <Title size={84}>كود طويل… ولا <span style={{ color: GOLD }}>سطر واحد</span>؟</Title>
      <div style={{ opacity: one, transform: `scale(${0.6 + 0.4 * one})`, fontFamily: "monospace", fontSize: 40, color: INK, background: GOLD,
        padding: "16px 34px", borderRadius: 20, direction: "ltr", fontWeight: 700 }}>prompt | llm | parser</div>
    </AbsoluteFill>
  );
};

const PiecesScene: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, gap: 34 }}>
    <Title size={70}>أي تطبيق ذكاء اصطناعي<br /><span style={{ color: GOLD }}>فيه 3 قطع</span></Title>
    <div style={{ height: 10 }} />
    <PieceCard n={1} label="البرومبت" en="Prompt" desc="السؤال اللي بتجهزه" at={T.prompt} />
    <PieceCard n={2} label="النموذج" en="LLM" desc="اللي بيفكر ويجاوب" at={T.model} />
    <PieceCard n={3} label="البارسر" en="Parser" desc="اللي بيرتب الجواب" at={T.parser} />
  </AbsoluteFill>
);

const TapeScene: React.FC = () => {
  const f = useCurrentFrame();
  const wobble = Math.sin(f / 6) * 1.5;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, gap: 40 }}>
      <Title size={76}>ربط يدوي = <span style={{ color: GOLD }}>شريط لاصق</span></Title>
      <div style={{ height: 20 }} />
      <div style={{ transform: `rotate(${-4 + wobble}deg) translateX(-40px)` }}><PieceCard n={1} label="البرومبت" en="Prompt" desc="" at={T.tape - 1} tilt={-3} tape /></div>
      <div style={{ transform: `rotate(${5 - wobble}deg) translateX(50px)`, marginTop: -30 }}><PieceCard n={2} label="النموذج" en="LLM" desc="" at={T.tape - 1} tilt={4} tape /></div>
      <div style={{ transform: `rotate(${-2 + wobble}deg) translateX(-20px)`, marginTop: -30 }}><PieceCard n={3} label="البارسر" en="Parser" desc="" at={T.tape - 1} tilt={-6} tape /></div>
      <Title size={50} color="#cbbf9f" at={T.tape + 4.5}>بيمشي الحال… بس مش مرتّب</Title>
    </AbsoluteFill>
  );
};

const PipeNode: React.FC<{ label: string; at: number }> = ({ label, at }) => {
  const a = useAppear(at);
  return (
    <div style={{ width: 600, padding: "26px 0", borderRadius: 28, textAlign: "center", fontFamily: "Cairo", fontWeight: 800, fontSize: 60,
      color: a > 0.5 ? INK : CREAM, background: a > 0.5 ? GOLD : "rgba(24,21,15,.95)", border: `3px solid ${GOLD}`,
      transform: `scale(${0.85 + 0.15 * a})`, opacity: 0.35 + 0.65 * a, direction: "ltr" }}>{label}</div>
  );
};
const PipeScene: React.FC = () => {
  const f = useCurrentFrame();
  const pipeA = useAppear(T.pipeWord);
  const fac = useAppear(T.factory);
  const flow = ((f - s(T.factory - T.pipe)) / 40) % 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420 }}>
      <Title size={72}>LangChain: <span style={{ color: GOLD }}>اربطهم بخط</span></Title>
      <div style={{ height: 50 }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 70 }}>
        <div style={{ position: "absolute", top: 40, bottom: 40, width: 10, background: `${GOLD}66`, borderRadius: 5 }} />
        {fac > 0.1 ? (
          <div style={{ position: "absolute", top: `${8 + flow * 84}%`, width: 34, height: 34, borderRadius: 20, background: "#fff6d8",
            boxShadow: `0 0 30px ${GOLD}` }} />
        ) : null}
        {[["Prompt", T.pBrompt], ["LLM", T.pModel], ["Parser", T.pParser]].map(([l, at], i) => (
          <React.Fragment key={l as string}>
            <PipeNode label={l as string} at={at as number} />
            {i < 2 ? (
              <div style={{ position: "absolute", top: 135 + i * 215, fontFamily: "monospace", fontWeight: 900, fontSize: 70, color: GOLD,
                background: INK, padding: "0 16px", opacity: pipeA, transform: `scale(${0.5 + 0.5 * pipeA})` }}>|</div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div style={{ height: 50 }} />
      <div style={{ opacity: pipeA }}>
        <Title size={52} color="#cbbf9f">الخط اسمه <span style={{ color: GOLD }}>pipe</span> — زي خط الإنتاج بالمصنع</Title>
      </div>
    </AbsoluteFill>
  );
};

const CODE = [
  ["k", "from"], ["t", " langchain_core.prompts "], ["k", "import"], ["t", " ChatPromptTemplate\n"],
  ["k", "from"], ["t", " langchain_core.output_parsers "], ["k", "import"], ["t", " StrOutputParser\n\n"],
  ["t", "chain = (\n    ChatPromptTemplate.from_template(\n        "], ["s", "\"لخّص النص في 3 نقاط: {text}\""], ["t", ")\n"],
  ["p", "    |"], ["t", " get_llm()\n"], ["p", "    |"], ["t", " StrOutputParser()\n)\n\n"],
  ["f", "print"], ["t", "(chain.invoke({"], ["s", "\"text\""], ["t", ": article}))"],
] as const;
const COLORS: Record<string, string> = { k: "#e0b84f", t: "#e9e3d3", s: "#9ccf8a", p: "#ffcf5a", f: "#7fb4ff" };

const CodeWindow: React.FC<{ chars: number; title: string; children?: React.ReactNode }> = ({ chars, title, children }) => {
  let left = chars;
  return (
    <div style={{ width: 960, borderRadius: 28, overflow: "hidden", background: "#15130f", border: `3px solid ${GOLD}88`,
      boxShadow: `0 30px 80px rgba(0,0,0,.7), 0 0 50px ${GOLD}22` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 26px", background: GOLD, direction: "ltr" }}>
        {["#e9564b", "#f2b233", "#55b85c"].map((c) => <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />)}
        <div style={{ marginLeft: "auto", fontFamily: "monospace", fontWeight: 700, fontSize: 28, color: INK }}>{title}</div>
      </div>
      <pre style={{ margin: 0, padding: "30px 34px", fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 31, lineHeight: 1.55,
        direction: "ltr", textAlign: "left", whiteSpace: "pre-wrap", unicodeBidi: "plaintext", minHeight: 560 }}>
        {children ?? CODE.map(([k, txt], i) => {
          if (left <= 0) return null;
          const shown = txt.slice(0, left); left -= txt.length;
          return <span key={i} style={{ color: COLORS[k] }}>{shown}</span>;
        })}
        {children ? null : <span style={{ background: GOLD, color: GOLD }}>▌</span>}
      </pre>
    </div>
  );
};
const CODE_LEN = CODE.reduce((n, [, t]) => n + t.length, 0);

const CodeScene: React.FC = () => {
  const f = useCurrentFrame();
  const start = s(T.typeStart - T.code);
  const chars = Math.floor(interpolate(f, [start, start + s(8.5)], [0, CODE_LEN], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const vs = useAppear(T.vscode);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, gap: 40 }}>
      <Title size={72}>تعالوا نشوف <span style={{ color: GOLD }}>عملي</span></Title>
      <div style={{ opacity: Math.max(vs, 0.25), transform: `translateY(${(1 - vs) * 40}px)` }}>
        <CodeWindow chars={chars} title="day-02/app.py" />
      </div>
    </AbsoluteFill>
  );
};

const STREAM_TEXT = "الذكاء الاصطناعي التوليدي يغيّر طريقة عمل الفرق التقنية…";
const TermScene: React.FC = () => {
  const f = useCurrentFrame();
  const rel = (sec: number) => s(sec - T.term);
  const show = (sec: number) => interpolate(f, [rel(sec), rel(sec) + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sorryGlow = interpolate(f, [rel(T.sorry), rel(T.sorry) + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const streaming = f >= rel(T.stream);
  const streamChars = Math.floor(interpolate(f, [rel(T.stream) + 10, rel(T.stream) + s(2.4)], [0, STREAM_TEXT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const polite = useAppear(T.polite);
  const shortA = useAppear(T.shorter);
  const line = (txt: string, color: string, op: number, extra: React.CSSProperties = {}) => (
    <div dir="auto" style={{ color, opacity: op, unicodeBidi: "plaintext", ...extra }}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, gap: 36 }}>
      <Title size={68}>{streaming ? <>بدك الجواب <span style={{ color: GOLD }}>كلمة كلمة</span>؟</> : <>طلبت <span style={{ color: GOLD }}>3 نقاط</span>… وطلعوا 3</>}</Title>
      <div style={{ width: 960, borderRadius: 28, overflow: "hidden", background: "#0e0d0a", border: `3px solid ${GOLD}66`,
        boxShadow: "0 30px 80px rgba(0,0,0,.7)" }}>
        <div style={{ padding: "16px 26px", background: "#1d1a13", fontFamily: "monospace", fontSize: 26, color: "#a99d80", direction: "ltr" }}>Terminal</div>
        <div style={{ padding: "26px 34px", fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 32, lineHeight: 1.7, minHeight: 520, direction: "ltr", textAlign: "left" }}>
          {streaming ? (
            <>
              {line("$ python day-02/app.py  # chain.stream()", GOLD, 1)}
              <div dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 400, fontSize: 40, color: CREAM, textAlign: "right", marginTop: 20 }}>
                {STREAM_TEXT.slice(0, streamChars)}<span style={{ color: GOLD }}>▌</span>
              </div>
            </>
          ) : (
            <>
              {line("$ python day-02/app.py", GOLD, 1)}
              <div dir="rtl" style={{ fontFamily: "Cairo", fontSize: 38, textAlign: "right", marginTop: 14, padding: "4px 14px", borderRadius: 12,
                color: sorryGlow > 0 ? INK : "#9d927a", background: `rgba(224,184,79,${sorryGlow})`, opacity: show(T.bullets - 0.6) }}>
                عذرًا على الالتباس! إليك الملخص:
              </div>
              {["١. الذكاء الاصطناعي التوليدي يغيّر طريقة العمل", "٢. بيسرّع كتابة الكود والتوثيق", "٣. بس لازم مراجعة بشرية للنتائج"].map((b, i) => (
                <div key={b} dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 40, color: CREAM, textAlign: "right",
                  opacity: show(T.bullets + i * 0.7), transform: `translateX(${(1 - show(T.bullets + i * 0.7)) * -40}px)` }}>{b}</div>
              ))}
            </>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, direction: "rtl", alignItems: "center" }}>
        {!streaming && polite > 0.01 ? (
          <div style={{ opacity: polite, transform: `scale(${polite})`, fontFamily: "Cairo", fontWeight: 800, fontSize: 46, color: INK, background: GOLD,
            padding: "10px 34px", borderRadius: 40 }}>مؤدب زيادة عن اللزوم</div>
        ) : null}
        {streaming ? (
          <div style={{ display: "flex", gap: 20, alignItems: "center", direction: "ltr", fontFamily: "monospace", fontSize: 44, fontWeight: 700 }}>
            <span style={{ color: "#8a7f68", textDecoration: "line-through" }}>.invoke()</span>
            <span style={{ color: GOLD }}>→</span>
            <span style={{ color: INK, background: GOLD, padding: "4px 22px", borderRadius: 16 }}>.stream()</span>
          </div>
        ) : null}
      </div>
      {streaming ? (
        <div style={{ opacity: shortA, transform: `translateY(${(1 - shortA) * 20}px)` }}>
          <Title size={46} color="#cbbf9f">والكود كله أقصر من رسالة واتساب</Title>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const a = useAppear(T.takeaway + 2.2);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, gap: 50 }}>
      <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 44, color: INK, background: "rgba(11,10,8,.12)", padding: "8px 34px",
        borderRadius: 40, border: `3px solid ${INK}` }}>الخلاصة</div>
      <Title size={98} color={INK}>لا تربط الأشياء<br />ببعض <span style={{ textDecoration: "line-through", textDecorationThickness: 8 }}>يدويًا</span></Title>
      <div style={{ opacity: a, transform: `scale(${0.8 + 0.2 * a})` }}>
        <div dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 80, color: CREAM, background: INK, padding: "14px 44px", borderRadius: 28, lineHeight: 1.35, textAlign: "center" }}>
          ركّب قطع جاهزة<br /><span style={{ color: GOLD }}>وخلّيها تمشي ورا بعض</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const gh = useAppear(T.cta + 0.3);
  const fol = useAppear(T.follow);
  const tom = useAppear(T.tomorrow);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, gap: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: gh, transform: `translateY(${(1 - gh) * 30}px)`,
        fontFamily: "Cairo", fontWeight: 800, fontSize: 48, color: CREAM, background: "rgba(24,21,15,.95)", border: `3px solid ${GOLD}`,
        padding: "18px 40px", borderRadius: 30, direction: "rtl" }}>
        الكود كامل على <span style={{ color: GOLD, direction: "ltr" }}>GitHub</span> · الرابط بأول تعليق
      </div>
      <Title size={80}>شو أول شي ممكن<br /><span style={{ color: GOLD }}>تبنيه بسلسلة زي هاي؟</span></Title>
      <div style={{ opacity: fol, transform: `scale(${0.6 + 0.4 * fol})`, fontFamily: "Cairo", fontWeight: 800, fontSize: 110, color: INK,
        background: `linear-gradient(135deg, #f3d27a, ${GOLD_DEEP})`, padding: "0 70px", borderRadius: 40, boxShadow: `0 0 70px ${GOLD}66` }}>تابعني</div>
      <div style={{ opacity: tom, transform: `translateY(${(1 - tom) * 30}px)`, fontFamily: "Cairo", fontWeight: 800, fontSize: 44, color: "#cbbf9f", direction: "rtl" }}>
        بكرة: النموذج بيحكي <span style={{ color: GOLD }}>بثلاث لهجات</span>
      </div>
    </AbsoluteFill>
  );
};

// ───────── الكابشن ─────────
const CaptionLayer: React.FC = () => {
  const f = useCurrentFrame();
  const nowMs = (f / FPS) * 1000;
  const { pages } = React.useMemo(
    () => createTikTokStyleCaptions({ captions: captionsJson as Caption[], combineTokensWithinMilliseconds: 1100 }), []);
  const idx = pages.findIndex((p, i) => nowMs >= p.startMs && nowMs < (pages[i + 1]?.startMs ?? p.startMs + p.durationMs + 400));
  if (idx < 0) return null;
  const p = pages[idx];
  const local = f - s(p.startMs / 1000);
  const pop = spring({ frame: local, fps: FPS, config: { damping: 12, mass: 0.5 }, durationInFrames: 8 });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
      <div dir="rtl" style={{ maxWidth: 940, textAlign: "center", fontFamily: "Cairo", fontWeight: 800, fontSize: 72, lineHeight: 1.4,
        transform: `scale(${0.88 + 0.12 * pop})`, padding: "10px 30px", borderRadius: 24, background: "rgba(11,10,8,.72)" }}>
        {p.tokens.map((t, i) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs + 60;
          return (
            <span key={i} style={{ color: active ? GOLD : CREAM, whiteSpace: "pre", unicodeBidi: "isolate" }}>{t.text}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ───────── التركيب ─────────
export const Day2Reel: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const goldBg = f >= s(T.takeaway) && f < s(T.cta);
  // خفض الموسيقى وقت الكلام + رفعها بالنهاية
  const musicVol = (fr: number) => interpolate(fr, [0, s(1), durationInFrames - s(2), durationInFrames], [0, 0.07, 0.07, 0], { extrapolateRight: "clamp" });
  const outFade = interpolate(f, [durationInFrames - s(0.8), durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ background: INK, opacity: outFade }}>
      <style>{fontFace}</style>
      <Background gold={goldBg} />

      <Scene from={T.hook} to={T.pieces}><HookScene /></Scene>
      <Scene from={T.pieces} to={T.tape} sfx={SFX.whoosh}><PiecesScene /></Scene>
      <Scene from={T.tape} to={T.pipe} sfx={SFX.swish}><TapeScene /></Scene>
      <Scene from={T.pipe} to={T.code} sfx={SFX.whoosh}><PipeScene /></Scene>
      <Scene from={T.code} to={T.term} sfx={SFX.whoosh}><CodeScene /></Scene>
      <Scene from={T.term} to={T.takeaway} sfx={SFX.click}><TermScene /></Scene>
      <Scene from={T.takeaway} to={T.cta} sfx={SFX.impact}><TakeawayScene /></Scene>
      <Scene from={T.cta} to={durationInFrames / FPS} sfx={SFX.whoosh}><CtaScene /></Scene>

      <Header />
      <CaptionLayer />

      {/* الصوت */}
      <Audio src={staticFile(VOICE)} />
      <Audio src={MUSIC.ambient} loop volume={musicVol} />
      <Sfx at={0} src={SFX.whoosh} volume={0.5} />
      <Sfx at={T.oneLine} src={SFX.pop} volume={0.6} />
      <Sfx at={T.prompt} src={SFX.pop} />
      <Sfx at={T.model} src={SFX.pop} />
      <Sfx at={T.parser} src={SFX.pop} />
      <Sfx at={T.pipeWord} src={SFX.notification} volume={0.4} />
      <Sfx at={T.typeStart} src={SFX.typing} volume={0.35} />
      <Sfx at={T.typeStart + 1.1} src={SFX.typing} volume={0.35} />
      <Sfx at={T.typeStart + 2.2} src={SFX.typing} volume={0.35} />
      <Sfx at={T.bullets} src={SFX.success} volume={0.4} />
      <Sfx at={T.stream} src={SFX.click} volume={0.6} />
      <Sfx at={T.takeaway - 1.6} src={SFX.riser} volume={0.3} />
      <Sfx at={T.follow} src={SFX.success} volume={0.45} />
    </AbsoluteFill>
  );
};
