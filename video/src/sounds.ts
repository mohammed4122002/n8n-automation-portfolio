import { staticFile } from "remotion";
import * as RemotionSfx from "@remotion/sfx";

// مؤثرات مولّدة محلياً (بدون حقوق) — public/sfx
export const SFX = {
  whoosh: staticFile("sfx/whoosh.mp3"),
  swish: staticFile("sfx/swish.mp3"),
  click: staticFile("sfx/click.mp3"),
  pop: staticFile("sfx/pop.mp3"),
  success: staticFile("sfx/success.mp3"),
  notification: staticFile("sfx/notification.mp3"),
  typing: staticFile("sfx/typing.mp3"),
  riser: staticFile("sfx/riser.mp3"),
  impact: staticFile("sfx/impact.mp3"),
  error: staticFile("sfx/error.mp3"),
} as const;

// مكتبة Remotion الرسمية @remotion/sfx — نسخة محلية بـ public/sfx/remotion
// (تتحمّل بأمر: npm run sfx:remotion)
// أمثلة: RSFX.whoosh, RSFX.whip, RSFX.pageTurn, RSFX.uiSwitch, RSFX.mouseClick,
// RSFX.shutterModern, RSFX.ding, RSFX.vineBoom, RSFX.recordScratch, RSFX.yippee ...
type RsfxName = keyof typeof RemotionSfx;
export const RSFX = Object.fromEntries(
  Object.entries(RemotionSfx).map(([k, url]) => [k, staticFile(`sfx/remotion/${url.split("/").pop()}`)]),
) as Record<RsfxName, string>;

export const MUSIC = {
  ambient: staticFile("music/ambient-loop.mp3"),
} as const;
