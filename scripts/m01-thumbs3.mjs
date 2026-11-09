// 몽골 1편 썸네일 시안 3: 4안 × (글자 없음·ko·en·es) → out/thumbs/m01-t3-<안>-<언어>.png + 피드 크기(320×180) 미리보기
// node scripts/m01-thumbs3.mjs [A,B] [none,ko]   (안·언어를 고르면 그것만)
// 한 번 묶고(bundle) still만 여러 장 찍는다 - 동영상 렌더가 아니라 still이라 다른 렌더와 같이 돌려도 됨
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { CODE, chrome, ffmpeg, ffmpegDir } from "./tools.mjs";
import { execFileSync } from "node:child_process";

const concepts = (process.argv[2] ?? "A,B,C,D").split(",");
const langs = (process.argv[3] ?? "none,ko,en,es").split(",");
const outDir = join(CODE, "out/thumbs");
await mkdir(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: join(CODE, "src/thumb/index.ts"), publicDir: join(CODE, "public") });
const opts = { browserExecutable: chrome(), chromiumOptions: { gl: "angle" } };
for (const concept of concepts)
  for (const lang of langs) {
    const inputProps = { concept, lang };
    const composition = await selectComposition({ serveUrl, id: "Mongol01Thumb3", inputProps, ...opts });
    const out = join(outDir, `m01-t3-${concept}-${lang}.png`);
    await renderStill({ composition, serveUrl, output: out, inputProps, imageFormat: "png", ...opts });
    // 피드 크기 미리보기 (유튜브 홈 피드 썸네일 크기)
    execFileSync(ffmpeg(), ["-y", "-loglevel", "error", "-i", out, "-vf", "scale=320:180:flags=lanczos", out.replace(/\.png$/, "-small.png")], { env: { ...process.env, DYLD_LIBRARY_PATH: ffmpegDir() ?? "" } });
    console.log(`→ ${out}`);
  }
