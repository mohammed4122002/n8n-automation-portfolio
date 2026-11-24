import { Composition } from "remotion";
import { SoundTest } from "./SoundTest";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SoundTest" component={SoundTest} durationInFrames={150} fps={30} width={1080} height={1920} />
  </>
);
