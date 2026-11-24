import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { SFX, RSFX, MUSIC } from "./sounds";

const fontFace = `@font-face{font-family:Cairo;src:url(${staticFile("fonts/Cairo-800.ttf")});font-weight:800}`;

export const SoundTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 10, fps });
  return (
    <AbsoluteFill style={{ background: "#0b0b0b", justifyContent: "center", alignItems: "center" }}>
      <style>{fontFace}</style>
      <Audio src={MUSIC.ambient} volume={0.35} loop />
      <Sequence from={10}><Audio src={RSFX.whoosh} /></Sequence>
      <Sequence from={60}><Audio src={RSFX.mouseClick} /></Sequence>
      <Sequence from={80}><Audio src={RSFX.vineBoom} volume={0.6} /></Sequence>
      <Sequence from={110}><Audio src={RSFX.ding} /></Sequence>
      <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 110, color: "#d4af37",
        transform: `scale(${s})`, opacity: interpolate(frame, [0, 15], [0, 1]) }}>
        أتمتة n8n
      </div>
    </AbsoluteFill>
  );
};
