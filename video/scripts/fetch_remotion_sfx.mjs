// يحمّل كل أصوات @remotion/sfx إلى public/sfx/remotion لاستخدامها محلياً بالرندر
import * as sfx from "@remotion/sfx";
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";

const dir = new URL("../public/sfx/remotion/", import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
for (const [name, url] of Object.entries(sfx)) {
  const file = dir + url.split("/").pop();
  if (existsSync(file)) continue;
  execFileSync("curl", ["-sSfL", "-o", file, url]);
  console.log("✓", name);
}
