// 몽골 예고편 쇼츠 시험 (2026-10-23): 새 그림체 + 시네마틱 + 제국 번지기 지도 + 웃음 한 스푼이 어떤 느낌인지 보는 30초 세로 영상
// 재료: public/teaser/ (목소리 n1~n5·j1·g1, steppe.mp4, 새 그림체 SVG), public/ep/teaser/maps/spread/ (map-scene.mjs 210장)
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "../../public/teaser/voice.json";

const FPS = 30;
const sec = (k: keyof typeof voice) => Math.ceil(voice[k].sec * FPS) + 8;
// 장면 순서: [목소리, 화면]
const BEATS: { v: keyof typeof voice; show: "steppe" | "abandon" | "map" | "arrow" | "jebe" | "khan" | "end" }[] = [
  { v: "n1", show: "steppe" },
  { v: "n2", show: "abandon" },
  { v: "n3", show: "map" },
  { v: "n4", show: "arrow" },
  { v: "j1", show: "jebe" },
  { v: "g1", show: "khan" },
  { v: "n5", show: "end" },
];
const starts = BEATS.reduce<number[]>((a, b, i) => [...a, i ? a[i - 1] + sec(BEATS[i - 1].v) : 0], []);
export const TEASER_FRAMES = starts[starts.length - 1] + sec("n5") + 45;

const Paper = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #efe2c4, #d6c094)" }} />;
const Vignette = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,18,8,.45))" }} />;

// 캐릭터 한 명: 아래에서 튀어 올라 등장, 숨쉬기(또는 부들부들·펄쩍)
const Char = ({ src, x, w = 760, flip, anim = "idle", delay = 0 }: { src: string; x: number; w?: number; flip?: boolean; anim?: "idle" | "shake" | "jump"; delay?: number }) => {
  const f = useCurrentFrame() - delay;
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 11, stiffness: 140 } });
  const breathe = 1 + Math.sin(f / 13) * 0.012;
  const shake = anim === "shake" ? Math.sin(f * 2.4) * 6 : 0;
  const jump = anim === "jump" ? -Math.max(0, Math.sin(Math.min(f, 18) / 18 * Math.PI)) * 120 : 0;
  return (
    <Img
      src={staticFile(`teaser/${src}.svg`)}
      style={{ position: "absolute", width: w, left: x - w / 2, bottom: 120, transformOrigin: "50% 100%",
        transform: `translate(${shake}px, ${(1 - pop) * 500 + jump}px) scale(${flip ? -1 : 1}, ${breathe})`, opacity: f < 0 ? 0 : 1 }}
    />
  );
};

const Show = ({ kind, len }: { kind: (typeof BEATS)[number]["show"]; len: number }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, len], [1, 1.08]);
  if (kind === "steppe")
    return <AbsoluteFill style={{ background: "#000" }}><OffthreadVideo src={staticFile("teaser/steppe.mp4")} muted style={{ height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} /><Vignette /></AbsoluteFill>;
  if (kind === "map" || kind === "end") {
    const i = Math.min(209, Math.floor(interpolate(f, [0, len], kind === "map" ? [0, 209] : [180, 209], { extrapolateRight: "clamp" })));
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Img src={staticFile(`ep/teaser/maps/spread/${String(i).padStart(5, "0")}.jpg`)} style={{ height: "100%", position: "absolute", left: "50%", transform: `translateX(-50%) scale(${zoom})` }} />
        <Vignette />
        {kind === "end" && <Char src="v3-genghis-shocked" x={540} w={680} anim="idle" delay={6} />}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Paper />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <path d="M 0 1300 C 300 1260 700 1280 1080 1250 L 1080 1920 L 0 1920 Z" fill="#c9ad78" />
        <path d="M 0 1180 L 160 1110 L 300 1150 L 460 1080 L 640 1140 L 820 1090 L 1080 1150 L 1080 1300 L 0 1300 Z" fill="#b89a6a" opacity={0.6} />
      </svg>
      {kind === "abandon" && (<><Char src="v3-khan_bare-neutral" x={340} w={640} /><div style={{ position: "absolute", right: -40, bottom: 560, fontSize: 0 }} /></>)}
      {kind === "arrow" && (<><Char src="v3-khan_bare-angry" x={330} w={660} anim="shake" /><ArrowFly /></>)}
      {kind === "jebe" && (<><Char src="v3-khan_bare-angry" x={260} w={560} anim="idle" /><Char src="v3-jebe-smug" x={800} w={560} flip delay={4} /></>)}
      {kind === "khan" && (<><Char src="v3-khan_bare-happy" x={300} w={600} delay={0} /><Char src="v3-jebe-neutral" x={800} w={540} flip /></>)}
      <Vignette />
    </AbsoluteFill>
  );
};

// 화살이 날아와 꽂힘 (웃음 장면 효과)
const ArrowFly = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [6, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${interpolate(t, [0, 1], [1200, 640])}, ${interpolate(t, [0, 1], [700, 1020])}) rotate(30)`}>
        <path d="M -150 0 L 0 0" stroke="#5a3a1e" strokeWidth={9} /><path d="M 0 0 l -26 -12 l 0 24 Z" fill="#9a9c96" stroke="#2b1d14" strokeWidth={4} />
        <path d="M -150 0 l -22 -14 M -150 0 l -22 14 M -130 0 l -22 -14 M -130 0 l -22 14" stroke="#efe2c4" strokeWidth={6} />
      </g>
    </svg>
  );
};

export const MongolTeaser = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Audio src={staticFile("bgm/hook.wav")} volume={0.35} />
    {BEATS.map((b, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={(i < BEATS.length - 1 ? sec(b.v) : sec(b.v) + 45)}>
        <Show kind={b.show} len={sec(b.v)} />
        <Audio src={staticFile(`teaser/${b.v}.wav`)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
