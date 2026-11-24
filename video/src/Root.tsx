import { Composition } from "remotion";
import { SoundTest } from "./SoundTest";
import { VoiceOver, calculateVoiceOverMetadata, VoiceOverProps } from "./VoiceOver";
import day2Captions from "../public/voice/day2.captions.json";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SoundTest" component={SoundTest} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition
      id="Day2"
      component={VoiceOver}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={300}
      defaultProps={{ voice: "voice/day2.wav", captions: day2Captions, title: "اليوم الثاني" } as VoiceOverProps}
      calculateMetadata={calculateVoiceOverMetadata}
    />
  </>
);
