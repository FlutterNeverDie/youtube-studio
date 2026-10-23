// 몽골 예고편 쇼츠 2 (2026-10-23): 칼카 1223 거짓 후퇴 - 전술이 보이는 예고편 (사용자: "몽골 유럽 전쟁 예고편으로 전술 같은 거 보여 주는 게 낫지")
// 시네마틱(3D) 보류(2026-10-23) → 처음·끝은 옛 그림·지도(2D). 재료: public/teaser2/ (내레이션 v1~v7), public/ep/teaser/maps/kalka/ (map-scene.mjs --size 540x960, 714장)
// 연출: 장면 사이 흰 번쩍 + 휙 소리, 돌아서는 순간 정적 0.4초 → 뿔나팔 + 북 + 화면 흔들림, 마지막 연도는 붓 숫자만(화면 글자 규칙)
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import voiceKo from "../../public/teaser2/voice.json";
import voiceEn from "../../public/teaser2/en/voice.json";
import voiceEs from "../../public/teaser2/es/voice.json"; // 스페인어 오디오 트랙(2026-10-23) - 장면 길이에는 안 넣음(칸 안에 들어가게 대사를 줄임)
// 언어마다 목소리만 바꾼다(화면은 같음). 장면 길이는 두 언어 중 긴 쪽에 맞춤
const voice = voiceKo;

const F = (k: keyof typeof voice) => Math.round(Math.max(voiceKo[k].sec, (voiceEn as Record<string, { sec: number }>)[k]?.sec ?? 0) * 30);
const GAP = 9;
const v1 = F("v1") + GAP;
const MAP = 1710; // v2~v6 (지도 장면 프레임 수와 같게) - 2026-10-23 느리게: 사건마다 내레이션 뒤 멈춤
const mapVo = ["v2", "v2b", "v3", "v4", "v5", "v6", "v6c", "v6d", "v6b"] as const;
// 내레이션 시작 = 장면 marks(lead 0.105, retreat 0.186, chase 0.324, turn 0.485, close 0.566, lesson 0.906)와 같게
// v6d 전술 설명(2026-10-23 사용자: "50~60초 오디오가 비는데 전투 전략 설명하란 말야") - 한국어 v6c 끝 바로 뒤, v6b는 0.93으로 미룸
const mapStarts = [0, 0.088, 0.156, 0.272, 0.407, 0.475, 0.567, 0.7544, 0.93].map((t) => Math.round(t * MAP));
const TURN = mapStarts[4]; // v5 "돌아섰습니다"
const END = v1 + MAP;
const ENDV = F("v7") + 24; // 엔딩 내레이션
const HOLD = 150; // 엔딩 뒤 5초 정지 + 브금 (2026-10-23 사용자)
export const KALKA_TEASER_FRAMES = END + ENDV + HOLD;

// 대사 나올 때 브금·효과음 줄이기 (2026-10-23 영어판 측정: 추격·전투 구간에서 대사가 배경보다 약 2 dB 작아 묻힘) - docs/guide/03 소리
type Lang = "ko" | "en" | "es";
const DUCK = 0.3; // 약 -10 dB
const RAMP = 8; // 프레임
const BG = 0.7; // 배경 전체 약 -3 dB (대사 없는 틈이 대사보다 커서 말이 끊길 때마다 소리가 튀었다)
const lines = (lang: Lang) => {
  const v = ({ ko: voiceKo, en: voiceEn, es: voiceEs }[lang]) as Record<string, { sec: number }>;
  const at: [number, number][] = [[4, 4 + v.v1.sec * 30]];
  mapVo.forEach((k, i) => { const a = v1 + mapStarts[i] + (i === 4 ? 6 : 0); at.push([a, a + v[k].sec * 30]); });
  at.push([END + 6, END + 6 + v.v7.sec * 30]);
  return at;
};
const duckAt = (at: [number, number][], f: number) => {
  let k = 1;
  for (const [a, b] of at) {
    const d = f < a ? (a - f) / RAMP : f > b ? (f - b) / RAMP : 0;
    k = Math.min(k, DUCK + (1 - DUCK) * Math.min(1, d));
  }
  return k;
};

const Vignette = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,12,5,.5))" }} />;
// 장면 전환: 흰 번쩍 (6프레임)
const Flash = ({ at }: { at: number }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 3, at, at + 6], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#fff8e8", opacity: o, pointerEvents: "none" }} />;
};

const MapPart = () => {
  const f = useCurrentFrame();
  const i = Math.min(MAP - 1, Math.max(0, f));
  // 돌아서는 순간: 화면이 쿵 흔들리고 살짝 당겨짐
  const k = f - TURN - 12;
  const shake = k >= 0 && k < 14 ? Math.sin(k * 2.2) * (14 - k) * 0.9 : 0;
  const punch = interpolate(k, [0, 4, 16], [1, 1.06, 1.02], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile(`ep/teaser/maps/kalka/${String(i).padStart(5, "0")}.jpg`)} style={{ width: "100%", height: "100%", transform: `translate(${shake}px, ${shake * 0.5}px) scale(${punch})` }} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Cine = ({ src, from, to, len }: { src: string; from: number; to: number; len: number }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={staticFile(`teaser2/${src}`)} muted style={{ height: "100%", position: "absolute", left: "50%", transform: `translateX(-50%) scale(${interpolate(f, [0, len], [from, to])})` }} />
      <Vignette />
    </AbsoluteFill>
  );
};

// 옛 그림을 천천히 당김 (세로 화면에 맞게 가운데를 잘라)
const Art = ({ src, from, to, len, pos = "50% 50%" }: { src: string; from: number; to: number; len: number; pos?: string }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#1a120a" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter: "sepia(.25) contrast(1.05)", transform: `scale(${interpolate(f, [0, len], [from, to], { extrapolateRight: "clamp" })})` }} />
      <Vignette />
    </AbsoluteFill>
  );
};

// 마지막: 1241 (붓 숫자) - 숫자만
const Year = ({ len }: { len: number }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [len * 0.45, len * 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = interpolate(f, [len * 0.45, len * 0.6], [1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: "Baskerville, 'Big Caslon', serif", fontWeight: 700, fontSize: 230, color: "#f4ead2", letterSpacing: 6, transform: `scale(${s})`,
        textShadow: "0 0 30px rgba(0,0,0,.8), 0 6px 0 #6e1a10" }}>1241</div>
    </AbsoluteFill>
  );
};

export const KalkaTeaser = ({ lang = "ko" }: { lang?: Lang }) => {
  const dir = lang === "ko" ? "teaser2" : `teaser2/${lang}`;
  const at = lines(lang);
  // Sequence 안 frame은 시작부터 세므로 from을 더해 절대 프레임으로
  const dk = (from: number, v: number | ((f: number) => number)) => (f: number) => (typeof v === "number" ? v : v(f)) * BG * duckAt(at, from + f);
  return (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* 브금: 긴장 → 돌아서는 순간 전투곡 */}
    <Sequence durationInFrames={v1 + TURN + 6}><Audio src={staticFile("bgm/tension.wav")} volume={dk(0, (f) => interpolate(f, [v1 + TURN - 20, v1 + TURN + 6], [0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))} /></Sequence>
    <Sequence from={v1 + TURN + 12} durationInFrames={END - (v1 + TURN + 12) + 10}><Audio src={staticFile("bgm/battle.wav")} volume={dk(v1 + TURN + 12, (f) => interpolate(f, [END - (v1 + TURN + 12) - 15, END - (v1 + TURN + 12) + 10], [0.42, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))} /></Sequence>
    <Sequence from={END}><Audio src={staticFile("bgm/outro.wav")} volume={dk(END, (f) => interpolate(f, [0, 12, ENDV + HOLD - 40, ENDV + HOLD], [0, 0.5, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))} /></Sequence>
    <Sequence durationInFrames={v1}><Art src="art/mongol/mongol-horde.jpg" from={1.05} to={1.25} len={v1} pos="50% 40%" /></Sequence>
    <Sequence from={v1} durationInFrames={MAP}><MapPart /></Sequence>
    <Sequence from={END}><Art src="art/mongol/kalka-battle.jpg" from={1.2} to={1.02} len={ENDV} pos="50% 35%" /></Sequence>
    {/* 내레이션 */}
    <Sequence from={4}><Audio src={staticFile(`${dir}/v1.wav`)} /></Sequence>
    {mapVo.map((k, i) => <Sequence key={k} from={v1 + mapStarts[i] + (i === 4 ? 6 : 0)}><Audio src={staticFile(`${dir}/${k}.wav`)} /></Sequence>)}
    <Sequence from={END + 6}><Audio src={staticFile(`${dir}/v7.wav`)} /></Sequence>
    {/* 효과음: 전환 휙, 후퇴 말발굽, 돌아서는 순간 뿔나팔·북·충돌 */}
    <Sequence from={v1 - 4}><Audio src={staticFile("sfx/ep/whoosh.wav")} volume={dk(v1 - 4, 0.5)} /></Sequence>
    <Sequence from={v1 + mapStarts[2]} durationInFrames={mapStarts[4] - mapStarts[2]}><Audio src={staticFile("sfx/ep/gallop.wav")} volume={dk(v1 + mapStarts[2], 0.28)} loop /></Sequence>
    <Sequence from={v1 + TURN + 8}><Audio src={staticFile("sfx/ep/war_horn.wav")} volume={dk(v1 + TURN + 8, 0.6)} /></Sequence>
    <Sequence from={v1 + TURN + 12}><Audio src={staticFile("sfx/ep/war_drums.wav")} volume={dk(v1 + TURN + 12, 0.45)} /></Sequence>
    <Sequence from={v1 + mapStarts[5]}><Audio src={staticFile("sfx/ep/battle.wav")} volume={dk(v1 + mapStarts[5], 0.3)} /></Sequence>
    <Sequence from={END - 4}><Audio src={staticFile("sfx/ep/whoosh.wav")} volume={dk(END - 4, 0.5)} /></Sequence>
    <Sequence from={END + ENDV}><Audio src={staticFile("sfx/ep/impact.wav")} volume={dk(END + ENDV, 0.5)} /></Sequence>
    <Flash at={v1} />
    <Flash at={END} />
  </AbsoluteFill>
);
};
