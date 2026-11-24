import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// غلاف ريل اليوم الثاني — لايت مود، مبني على مشهد البداية
const GOLD = "#d9a93a";
const GOLD_DEEP = "#a9781c";
const INK = "#14110b";
const SKY_TOP = "#cfe4f6";
const SKY_MID = "#eef4f8";
const SAND = "#f7e3b5";

const fontFace = `
@font-face{font-family:Cairo;src:url(${staticFile("fonts/Cairo-800.ttf")});font-weight:800}
@font-face{font-family:Cairo;src:url(${staticFile("fonts/Cairo-400.ttf")});font-weight:400}`;

export const Day2Cover: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY_MID} 45%, #fbf3e2 75%, ${SAND} 100%)` }}>
    <style>{fontFace}</style>
    {/* أشعة ناعمة */}
    <AbsoluteFill style={{
      background: "repeating-conic-gradient(from 0deg at 50% 46%, rgba(255,255,255,.75) 0deg 5deg, transparent 5deg 15deg)",
      maskImage: "radial-gradient(circle at 50% 46%, black 0%, transparent 62%)",
      WebkitMaskImage: "radial-gradient(circle at 50% 46%, black 0%, transparent 62%)",
    }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, rgba(255,255,255,.95) 0%, transparent 38%)" }} />

    {/* الهيدر */}
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 30px 12px 14px", borderRadius: 60,
        background: INK, direction: "ltr", boxShadow: "0 10px 30px rgba(20,17,11,.18)" }}>
        <Img src={staticFile("brand/avatar.jpg")} style={{ width: 58, height: 58, borderRadius: 30, border: `2px solid ${GOLD}` }} />
        <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 30, color: "#f6eedb" }}>Mohammed Abu Saada</span>
      </div>
    </div>

    {/* المحتوى — ضمن المنطقة الآمنة بالنص (عشان قصّ الشبكة بإنستغرام) */}
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46, paddingBottom: 40 }}>
      <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 40, color: INK, background: `linear-gradient(135deg, #f3d27a, ${GOLD})`,
          padding: "4px 30px", borderRadius: 40 }}>أسبوع الأساسيات</span>
        <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 40, color: "#f6eedb", background: INK, padding: "4px 30px", borderRadius: 40 }}>
          اليوم 02
        </span>
      </div>

      <div style={{ width: 400, height: 400, borderRadius: 210, padding: 10, background: `linear-gradient(135deg, #f3d27a, ${GOLD_DEEP})`,
        boxShadow: `0 30px 70px rgba(169,120,28,.35), 0 0 0 14px rgba(255,255,255,.7)` }}>
        <Img src={staticFile("brand/portrait.jpg")} style={{ width: "100%", height: "100%", borderRadius: 200, objectFit: "cover" }} />
      </div>

      <div dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 104, lineHeight: 1.45, color: INK, textAlign: "center" }}>
        كود طويل…<br />
        ولا <span style={{ display: "inline-block", lineHeight: 1.15, background: INK, color: "#f3d27a", padding: "6px 30px 14px", borderRadius: 24, marginTop: 14 }}>سطر واحد</span>؟
      </div>

      <div style={{ fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 46, fontWeight: 700, color: INK, direction: "ltr",
        background: `linear-gradient(135deg, #f3d27a, ${GOLD})`, padding: "18px 40px", borderRadius: 24,
        boxShadow: "0 14px 34px rgba(169,120,28,.3)" }}>
        prompt <span style={{ color: "#fff" }}>|</span> llm <span style={{ color: "#fff" }}>|</span> parser
      </div>
    </AbsoluteFill>

    {/* الفوتر */}
    <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", fontFamily: "Cairo", fontWeight: 800,
      fontSize: 30, letterSpacing: 4, color: INK, direction: "ltr" }}>
      30 DAYS OF LLM APPS · LANGCHAIN
    </div>
  </AbsoluteFill>
);
