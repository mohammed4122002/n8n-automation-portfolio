import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { SFX, MUSIC } from "./sounds";

const fontFace = `@font-face{font-family:Cairo;src:url(${staticFile("fonts/Cairo-800.ttf")});font-weight:800}`;

export const SoundTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 10, fps });
  return (
    <AbsoluteFill style={{ background: "#0b0b0b", justifyContent: "center", alignItems: "center" }}>
      <style>{fontFace}</style>
      <Audio src={MUSIC.ambient} volume={0.35} loop />
      <Sequence from={10}><Audio src={SFX.whoosh} /></Sequence>
      <Sequence from={60}><Audio src={SFX.pop} /></Sequence>
      <Sequence from={100}><Audio src={SFX.success} /></Sequence>
      <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 110, color: "#d4af37",
        transform: `scale(${s})`, opacity: interpolate(frame, [0, 15], [0, 1]) }}>
        أتمتة n8n
      </div>
    </AbsoluteFill>
  );
};
