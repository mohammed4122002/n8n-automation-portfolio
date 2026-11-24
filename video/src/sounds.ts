import { staticFile } from "remotion";

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

export const MUSIC = {
  ambient: staticFile("music/ambient-loop.mp3"),
} as const;
