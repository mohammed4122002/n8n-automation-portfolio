import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, CalculateMetadataFunction } from "remotion";
import { Audio } from "@remotion/media";
import { createTikTokStyleCaptions, Caption } from "@remotion/captions";
import { parseMedia } from "@remotion/media-parser";
import { MUSIC, SFX } from "./sounds";

export type VoiceOverProps = { voice: string; captions: Caption[]; title: string };

const GOLD = "#d4af37";
const fontFace = `@font-face{font-family:Cairo;src:url(${staticFile("fonts/Cairo-800.ttf")});font-weight:800}`;

export const calculateVoiceOverMetadata: CalculateMetadataFunction<VoiceOverProps> = async ({ props }) => {
  const { slowDurationInSeconds } = await parseMedia({ src: staticFile(props.voice), fields: { slowDurationInSeconds: true } });
  return { durationInFrames: Math.ceil((slowDurationInSeconds + 1) * 30) };
};

const Page: React.FC<{ text: string; tokens: { text: string; fromMs: number; toMs: number }[]; startMs: number }> = ({ tokens, startMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = startMs + (frame / fps) * 1000;
  const pop = spring({ frame, fps, durationInFrames: 8 });
  return (
    <div dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 84, lineHeight: 1.35, textAlign: "center",
      padding: "0 70px", transform: `scale(${0.85 + 0.15 * pop})`, textShadow: "0 6px 24px rgba(0,0,0,.9)" }}>
      {tokens.map((t, i) => {
        const active = nowMs >= t.fromMs && nowMs < t.toMs;
        return <span key={i} style={{ color: active ? GOLD : "#fff", whiteSpace: "pre" }}>{t.text}</span>;
      })}
    </div>
  );
};

export const VoiceOver: React.FC<VoiceOverProps> = ({ voice, captions, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #1c1a12 0%, #0b0b0b 70%)" }}>
      <style>{fontFace}</style>
      <Audio src={staticFile(voice)} />
      <Audio src={MUSIC.ambient} loop volume={0.08} />
      <Audio src={SFX.whoosh} volume={0.6} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 220 }}>
        <div dir="rtl" style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 70, color: GOLD,
          opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }) }}>{title}</div>
      </AbsoluteFill>
      {pages.map((p, i) => {
        const from = Math.round((p.startMs / 1000) * fps);
        const end = i + 1 < pages.length ? pages[i + 1].startMs : p.startMs + p.durationMs;
        const dur = Math.max(1, Math.round(((end - p.startMs) / 1000) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: 300 }}>
              <Page text={p.text} tokens={p.tokens} startMs={p.startMs} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
