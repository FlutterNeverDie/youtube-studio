// 몽골 2편 썸네일 시안 (2026-11-03 사용자: "썸네일 5개 정도 예시, A/B 테스트용") - 1편 시안 3과 같은 그림체·글자(큰 얼굴, 과장된 감정, 2~3단어)
// 11-03 3차 (사용자: "a안 밖에 할만한게 없네, 캐릭터 없는 버전, 이슬람 궁전을 몽골군이 감싼 것도"): 글은 셋 다 같고 그림만 다르게 - 그림 A/B 테스트
//   A 불타는 도시 + 고함치는 칸 · B 같은 장면 캐릭터 없이 · C 이슬람 궁전을 사방에서 에워싼 몽골군
// 고어 금지: 피·시체 없이 불·연기·눈물·무너지는 성까지만
// 찍기: node scripts/m02-thumbs.mjs [A,B,C] [ko,en]
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "../ui";
import { InkDefs } from "../draft/kit";
import { Person } from "../draft/M01Ch4";
import { City } from "../draft/M02City";
import { Bubble, Defs, Embers, Fire, Horde, Khan, type Line, R, Smoke, Words, Y } from "./Mongol01Thumbs";
import { CIV } from "../draft/M02Ch3";

export type M02Concept = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "V1" | "V2" | "V3" | "V4" | "MAP" | "BA" | "OBJ";
export type M02Lang = "none" | "ko" | "en" | "es" | "pt" | "hi" | "id"; // es·pt·hi·id는 메인 문구(TF)만 - 2026-11-03 언어별 썸네일
export type M02ThumbProps = { concept: M02Concept; lang: M02Lang };
type Txt = Record<"ko" | "en", { lines: Line[]; size: number[] }>;
const INK = "#1c120c";

// ---------------------------------------------------------------- A. (11-03 사용자 제안 "몽골군이 이슬람 국가를 짓밟은 방법") 불타는 이슬람 도시를 넘어 쏟아지는 기병 + 고함치는 칸
// 언어별 썸네일 문구 (2026-11-03 사용자: "국가별 썸네일") - 번역이 아니라 그 나라 유튜버 말투, 두 줄·짧게
const TF: Record<Exclude<M02Lang, "none">, { lines: Line[]; size: number[] }> = {
  ko: { lines: [[["이슬람 제국을", "#fff"]], [["짓밟은 ", Y], ["방법", R]]], size: [92, 124] },
  en: { lines: [[["HOW THEY CRUSHED", "#fff"]], [["AN ", Y], ["EMPIRE", R]]], size: [84, 140] },
  es: { lines: [[["ASÍ APLASTARON", "#fff"]], [["UN ", Y], ["IMPERIO", R]]], size: [84, 140] },
  pt: { lines: [[["COMO ESMAGARAM", "#fff"]], [["UM ", Y], ["IMPÉRIO", R]]], size: [84, 140] },
  hi: { lines: [[["एक साम्राज्य को", "#fff"]], [["कैसे ", Y], ["कुचला?", R]]], size: [88, 128] },
  id: { lines: [[["CARA MONGOL", "#fff"]], [["MELUMAT ", Y], ["KEKAISARAN", R]]], size: [92, 96] },
};
const ConceptF = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "#160505", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -180, top: 20, width: 1920, height: 1080, transform: "scale(0.62)", transformOrigin: "0 0", filter: "sepia(0.45) hue-rotate(-15deg) saturate(1.8) brightness(0.62)" }}><City f={0} burn={1} bare /></div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <Defs />
      <rect width={1280} height={720} fill="#ff3a10" opacity={0.12} />
      <Smoke x={260} y={150} r={110} n={7} seed={8} />
      <Embers n={70} seed={12} />
      <Fire x0={-40} x1={900} y={560} h={150} seed={13} n={14} />
    </svg>
    <Horde rows={[{ y: 470, w: 90, n: 14, x0: -40, x1: 860, op: 0.9 }, { y: 560, w: 140, n: 9, x0: -60, x1: 860 }, { y: 690, w: 210, n: 6, x0: -80, x1: 820 }]} />
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <circle cx={1010} cy={420} r={320} fill="#ff2a12" opacity={0.45} filter="url(#blur40)" />
      <Khan x={1010} y={420} s={1.5} expr="roar" skin="#e49a78" />
    </svg>
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={26} size={TF[lang].size} />}
  </AbsoluteFill>
);

// 쪽을 고를 수 있는 기병 줄 (Horde는 모두 오른쪽만 봄) - 에워싸기용
const Riders = ({ y, w, n, x0, x1, face, op = 1, seed = 0 }: { y: number; w: number; n: number; x0: number; x1: number; face: "l" | "r"; op?: number; seed?: number }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const r = (k: number) => { const v = Math.sin((seed + i) * 127.1 + k * 311.7) * 43758.5; return v - Math.floor(v); };
      return <Img key={i} src={staticFile(`riders/mongol/run${(i + seed) % 4}.svg`)} style={{ position: "absolute", left: x0 + ((x1 - x0) * (i + r(1) * 0.7)) / n, top: y + (r(2) - 0.5) * w * 0.25, width: w * (0.9 + r(3) * 0.2), transform: face === "r" ? "scaleX(-1)" : undefined, filter: "brightness(0)", opacity: op }} />;
    })}
  </>
);
const Spears = ({ x0, x1, y, n, h }: { x0: number; x1: number; y: number; n: number; h: number }) => (
  <g stroke={INK} strokeWidth={3}>{Array.from({ length: n }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return <path key={i} d={`M ${x} ${y} l ${(i % 3) - 1} ${-h}`} />; })}</g>
);

// ---------------------------------------------------------------- B. 캐릭터 없이 - 불타는 도시를 향해 쏟아지는 기병 떼
const ConceptB = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "#160505", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -60, top: -40, width: 1920, height: 1080, transform: "scale(0.72)", transformOrigin: "0 0", filter: "sepia(0.45) hue-rotate(-15deg) saturate(1.8) brightness(0.62)" }}><City f={0} burn={1} bare /></div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <Defs />
      <rect width={1280} height={720} fill="#ff3a10" opacity={0.12} />
      <Smoke x={980} y={140} r={120} n={8} seed={3} />
      <Smoke x={620} y={110} r={90} n={6} seed={6} />
      <Embers n={90} seed={14} />
      <Fire x0={-40} x1={1320} y={580} h={170} seed={15} n={20} />
      <path d="M -20 600 L 1300 600 L 1300 740 L -20 740 Z" fill="#2a0c06" opacity={0.6} />
    </svg>
    <Horde rows={[{ y: 470, w: 95, n: 20, x0: -40, x1: 1300, op: 0.9 }, { y: 545, w: 150, n: 12, x0: -60, x1: 1300 }, { y: 640, w: 240, n: 7, x0: -100, x1: 1300 }]} />
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={26} size={TF[lang].size} />}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- C. 이슬람 궁전을 사방에서 에워싼 몽골군 (해 질 녘, 아직 불타기 전 - 긴장)
type SiegeV = "dusk" | "night" | "engines" | "close";
// 11-03 4차 (사용자: "C가 제일 낫다 비슷하게 더 뽑아봐"): 같은 짜임(가운데 궁전 + 사방 기병)에 시간·장비·거리만 바꿈
//   C 해 질 녘 · D 밤 횃불 바다 · E 투석기가 돌을 날리기 시작 · F 더 가까이 (궁전 크게, 앞줄 기병 크게)
const SKY: Record<SiegeV, string> = {
  dusk: "linear-gradient(#2a0d14, #8a2a1c 45%, #e0703a 70%, #5a2a14 71%)",
  night: "linear-gradient(#05060f, #14183a 50%, #2a2240 70%, #120c14 71%)",
  engines: "linear-gradient(#1a0a0a, #5a1e14 45%, #c0502a 70%, #4a2010 71%)",
  close: "linear-gradient(#2a0d14, #8a2a1c 45%, #e0703a 75%, #5a2a14 76%)",
};
const Torches = ({ y0, y1, n, seed }: { y0: number; y1: number; n: number; seed: number }) => (
  <svg width={1280} height={720} style={{ position: "absolute" }}>
    {Array.from({ length: n }, (_, i) => { const r = (k: number) => { const v = Math.sin((seed + i) * 91.3 + k * 47.1) * 43758.5; return v - Math.floor(v); }; const x = r(1) * 1300 - 10, y = y0 + r(2) * (y1 - y0), sz = 1.5 + ((y - y0) / (y1 - y0)) * 3; return <g key={i}><circle cx={x} cy={y} r={sz * 2.6} fill="#ff9a30" opacity={0.3} /><circle cx={x} cy={y} r={sz} fill="#ffd27a" /></g>; })}
  </svg>
);
const Trebuchet = ({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill="#140805" stroke="#140805" strokeLinecap="round">
    <path d="M -60 0 L 60 0" strokeWidth={10} /><path d="M -40 0 L 0 -110 L 40 0" strokeWidth={9} fill="none" />
    <path d="M -70 -160 L 60 -70" strokeWidth={9} /><rect x={42} y={-78} width={34} height={34} />
    <path d="M -70 -160 L -84 -120" strokeWidth={4} />
  </g>
);
const Siege = ({ lang, v }: { lang: M02Lang; v: SiegeV }) => {
  const close = v === "close", night = v === "night", dy = close ? 50 : 0;
  const cityF = night ? "saturate(0.8) brightness(0.5) hue-rotate(10deg)" : v === "engines" ? "saturate(1.1) brightness(0.8) sepia(0.3)" : "saturate(1.15) brightness(0.92) sepia(0.2)";
  return (
    <AbsoluteFill style={{ background: SKY[v], overflow: "hidden" }}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <Defs />
        {night ? <><circle cx={1120} cy={90} r={46} fill="#f4ecd0" /><circle cx={1120} cy={90} r={120} fill="#f4ecd0" opacity={0.15} filter="url(#blur40)" /></> : <circle cx={760} cy={430} r={260} fill="#ffb060" opacity={0.45} filter="url(#blur40)" />}
        <Spears x0={0} x1={1280} y={500} n={120} h={26} />
      </svg>
      <Riders y={470} w={40} n={40} x0={-20} x1={1300} face="r" op={0.85} seed={1} />
      <div style={{ position: "absolute", left: close ? -40 : 120, top: close ? -150 : -60, width: 1920, height: 1080, transform: `scale(${close ? 0.74 : 0.56})`, transformOrigin: "0 0", filter: cityF }}><City f={0} bare /></div>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <Defs />
        {night && <circle cx={640} cy={250} r={300} fill="#ffb050" opacity={0.12} filter="url(#blur40)" />}
        <rect width={1280} height={720} fill={night ? "#1a2050" : "#ff5a20"} opacity={night ? 0.25 : 0.1} />
        <path d="M -20 560 L 1300 560 L 1300 740 L -20 740 Z" fill={night ? "#0c0810" : "#4a1e0e"} opacity={0.85} />
        {v === "engines" && <>
          {/* 날아가는 돌 + 성벽에 맞은 자리 */}
          {[[260, 360, 520, 210], [1030, 360, 830, 190], [180, 380, 340, 260]].map(([x0, y0, x1, y1], k) => <g key={k}><path d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${y1 - 160} ${x1} ${y1}`} stroke="#ffe0a0" strokeWidth={4} strokeDasharray="10 12" fill="none" opacity={0.8} /><circle cx={x1} cy={y1} r={16} fill="#6a6258" stroke={INK} strokeWidth={4} /></g>)}
          <Fire x0={760} x1={900} y={250} h={70} seed={21} n={4} />
          <Smoke x={830} y={170} r={34} n={4} seed={22} color="#4a3a34" />
          <Fire x0={470} x1={560} y={260} h={50} seed={23} n={3} />
        </>}
        {[60, 250, 1050, 1220].map((x, i) => <g key={i}><path d={`M ${x} 700 L ${x} ${470 - (i % 2) * 30}`} stroke={INK} strokeWidth={6} />{Array.from({ length: 7 }).map((_, k) => <path key={k} d={`M ${x} ${478 - (i % 2) * 30} q ${(k - 3) * 6} 20 ${(k - 3) * 9} 46`} stroke="#1a0a06" strokeWidth={5} fill="none" />)}</g>)}
      </svg>
      <svg width={1280} height={720} style={{ position: "absolute" }}><path d={`M -20 ${400 + dy} L 1300 ${400 + dy} L 1300 560 L -20 560 Z`} fill={night ? "#0a0612" : "#6a2a14"} opacity={0.55} /><Spears x0={0} x1={1280} y={470 + dy} n={70} h={40} />
        {v === "engines" && <><Trebuchet x={240} y={470} s={1.1} /><Trebuchet x={1040} y={470} s={1.1} flip /><Trebuchet x={150} y={455} s={0.7} /></>}
      </svg>
      <Riders y={400 + dy} w={62} n={11} x0={-20} x1={640} face="r" seed={11} />
      <Riders y={400 + dy} w={62} n={11} x0={600} x1={1290} face="l" seed={13} />
      <Riders y={440 + dy} w={80} n={8} x0={-20} x1={640} face="r" seed={15} />
      <Riders y={440 + dy} w={80} n={8} x0={600} x1={1290} face="l" seed={17} />
      <Riders y={close ? 470 : 500} w={close ? 140 : 110} n={6} x0={-40} x1={close ? 360 : 300} face="r" seed={3} />
      <Riders y={close ? 470 : 500} w={close ? 140 : 110} n={6} x0={close ? 880 : 940} x1={1300} face="l" seed={5} />
      <Riders y={close ? 540 : 580} w={close ? 230 : 170} n={5} x0={-100} x1={close ? 460 : 420} face="r" seed={7} />
      <Riders y={close ? 540 : 580} w={close ? 230 : 170} n={5} x0={close ? 760 : 820} x1={1340} face="l" seed={9} />
      {night && <Torches y0={395} y1={560} n={110} seed={3} />}
      {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={26} size={TF[lang].size} />}
    </AbsoluteFill>
  );
};
const ConceptC = ({ lang }: { lang: M02Lang }) => <Siege lang={lang} v="dusk" />;

// ================================================================ 11-03 5차 (사용자: "투석기 좋다, 다른 각도여도 상관없어 - 아예 다른 각도·구도·그림도")
// G 위에서 내려다본 포위 · H 성벽 위 수비병 눈높이 (날아드는 돌) · I 거대한 투석기 앞 · J 언덕 위 기병이 내려다보는 포위된 궁전
const rr = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5; return v - Math.floor(v); };
const SANDC = "#dcc392", SANDD = "#b99a63";

const ConceptG = ({ lang }: { lang: M02Lang }) => {
  const cx = 820, cy = 390;
  return (
    <AbsoluteFill style={{ background: "#b98a4c", overflow: "hidden" }}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <Defs />
        {Array.from({ length: 60 }, (_, i) => <ellipse key={i} cx={rr(i, 1) * 1280} cy={rr(i, 2) * 720} rx={40 + rr(i, 3) * 80} ry={10 + rr(i, 4) * 14} fill="#a4773e" opacity={0.35} />)}
        {/* 바깥: 게르 진영 */}
        {Array.from({ length: 70 }, (_, i) => { const a = rr(i, 5) * Math.PI * 2, d = 470 + rr(i, 6) * 260; return <g key={i}><circle cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.8} r={12} fill="#efe6d0" stroke={INK} strokeWidth={3} /><circle cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.8} r={3} fill={INK} /></g>; })}
        {/* 에워싼 군대: 위에서 본 말 탄 병사 (긴 타원 + 머리) */}
        {Array.from({ length: 900 }, (_, i) => { const a = rr(i, 7) * Math.PI * 2, d = 255 + Math.pow(rr(i, 8), 0.7) * 210; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8, ang = (a * 180) / Math.PI + 180; return <g key={i} transform={`translate(${x} ${y}) rotate(${ang})`}><ellipse rx={9} ry={4} fill="#1a0e08" /><circle cx={-1} cy={0} r={2.6} fill={["#7a2a1a", "#2a3a5a", "#5a4a2a"][i % 3]} /></g>; })}
        {/* 투석기 (위에서) + 날아가는 돌 */}
        {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 + 0.3, d = 300; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8, tx = cx + Math.cos(a) * 190, ty = cy + Math.sin(a) * 190 * 0.8; return <g key={i}><rect x={x - 14} y={y - 14} width={28} height={28} fill="#5a3a1e" stroke={INK} strokeWidth={4} transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} /><path d={`M ${x} ${y} L ${tx} ${ty}`} stroke="#fff6d0" strokeWidth={3} strokeDasharray="6 8" /><circle cx={(x + tx) / 2} cy={(y + ty) / 2} r={7} fill="#6a6258" stroke={INK} strokeWidth={3} /></g>; })}
        {/* 도시: 둥근 성벽 + 탑 */}
        <ellipse cx={cx} cy={cy} rx={210} ry={170} fill="#c8a870" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 40 }, (_, i) => { const a = rr(i, 9) * Math.PI * 2, d = rr(i, 10) * 150; const w = 18 + rr(i, 11) * 20; return <rect key={i} x={cx + Math.cos(a) * d - w / 2} y={cy + Math.sin(a) * d * 0.78 - w / 2} width={w} height={w * 0.8} fill={i % 3 ? SANDC : "#e8d6a8"} stroke={INK} strokeWidth={2.5} />; })}
        <circle cx={cx + 20} cy={cy - 10} r={56} fill="#3f8a72" stroke={INK} strokeWidth={6} /><circle cx={cx + 6} cy={cy - 26} r={20} fill="#7fc0a8" opacity={0.7} /><circle cx={cx + 20} cy={cy - 10} r={7} fill="#e2b13c" stroke={INK} strokeWidth={2} />
        <circle cx={cx - 90} cy={cy + 40} r={30} fill="#3f8a72" stroke={INK} strokeWidth={5} />
        {[[cx + 100, cy - 70], [cx - 60, cy - 80], [cx + 110, cy + 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={SANDC} stroke={INK} strokeWidth={4} />)}
        <ellipse cx={cx} cy={cy} rx={210} ry={170} fill="none" stroke={SANDD} strokeWidth={26} />
        <ellipse cx={cx} cy={cy} rx={210} ry={170} fill="none" stroke={INK} strokeWidth={4} />
        <ellipse cx={cx} cy={cy} rx={232} ry={192} fill="none" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <circle key={i} cx={cx + Math.cos(a) * 210} cy={cy + Math.sin(a) * 170} r={17} fill={SANDC} stroke={INK} strokeWidth={4} />; })}
        {/* 맞은 자리: 불·연기 */}
        {[0.3 + (2 / 10) * Math.PI * 2, 0.3 + (6 / 10) * Math.PI * 2, 0.3 + (8 / 10) * Math.PI * 2].map((a, i) => { const x = cx + Math.cos(a) * 205, y = cy + Math.sin(a) * 166; return <g key={i}><circle cx={x} cy={y} r={34} fill="#ff6a20" opacity={0.6} filter="url(#blur20)" /><circle cx={x} cy={y} r={16} fill="#ffd060" /><circle cx={x + 18} cy={y - 26} r={22} fill="#3a2a24" opacity={0.7} /></g>; })}
        <rect width={1280} height={720} fill="url(#vig)" />
        <radialGradient id="vg2" cx="0.64" cy="0.54" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.65} /></radialGradient>
        <rect width={1280} height={720} fill="url(#vg2)" />
      </svg>
      {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={26} size={TF[lang].size} />}
    </AbsoluteFill>
  );
};

// H: 성벽 위 수비병 눈높이 - 지평선까지 덮은 군대, 투석기 줄, 화면으로 날아드는 큰 돌
const ConceptH = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#2a0d14, #8a2a1c 40%, #e0703a 55%, #6a3418 56%, #3a1a0c)", overflow: "hidden" }}>
    <svg width={1280} height={720} style={{ position: "absolute" }}><Defs /><circle cx={640} cy={390} r={300} fill="#ffb060" opacity={0.4} filter="url(#blur40)" /><Spears x0={0} x1={1280} y={404} n={200} h={14} /></svg>
    <Riders y={385} w={26} n={60} x0={-20} x1={1300} face="l" op={0.8} seed={31} />
    <Riders y={405} w={40} n={40} x0={-20} x1={1300} face="l" op={0.9} seed={33} />
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      {[140, 420, 760, 1060].map((x, i) => <Trebuchet key={i} x={x} y={470} s={0.75} flip={i % 2 === 1} />)}
    </svg>
    <Riders y={445} w={64} n={22} x0={-20} x1={1300} face="l" seed={35} />
    <Riders y={500} w={96} n={13} x0={-40} x1={1300} face="l" seed={37} />
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <Defs />
      {/* 날아드는 돌 (화면 쪽으로) */}
      <path d="M 640 420 Q 900 120 1060 230" stroke="#ffe0a0" strokeWidth={5} strokeDasharray="12 12" fill="none" opacity={0.8} />
      {Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M ${930 - k * 8} ${170 + k * 22} L ${1010 - k * 4} ${200 + k * 18}`} stroke="#fff" strokeWidth={6 - k * 0.6} strokeLinecap="round" opacity={0.7} />)}
      <circle cx={1080} cy={250} r={120} fill="#7a7266" stroke={INK} strokeWidth={10} />
      <path d="M 1010 210 C 1030 170 1080 160 1110 175" stroke="#a8a090" strokeWidth={14} fill="none" strokeLinecap="round" />
      <circle cx={1040} cy={290} r={14} fill="#5a544a" /><circle cx={1120} cy={300} r={10} fill="#5a544a" />
      {/* 앞: 성벽 위 흉벽 (발밑) */}
      <path d="M -20 590 L 1300 590 L 1300 740 L -20 740 Z" fill={SANDC} stroke={INK} strokeWidth={8} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-30 + i * 240} y={530} width={140} height={70} fill={SANDC} stroke={INK} strokeWidth={7} />)}
      {[0, 1].map((i) => <path key={i} d={`M -20 ${640 + i * 45} L 1300 ${640 + i * 45}`} stroke={SANDD} strokeWidth={5} />)}
      {/* 흉벽에 꽂힌 화살 */}
      {[300, 330, 720, 1150].map((x, i) => <path key={i} d={`M ${x} 560 l ${-30 + i * 8} -60`} stroke={INK} strokeWidth={5} />)}
    </svg>
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={26} size={TF[lang].size} />}
  </AbsoluteFill>
);

// I: 거대한 투석기 - 화면 오른쪽을 꽉 채운 투석기, 줄을 당기는 병사들, 멀리 불붙은 궁전
const ConceptI = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#1a0606, #6a1a10 45%, #e0602a 68%, #3a140a 69%)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -260, top: 150, width: 1920, height: 1080, transform: "scale(0.5)", transformOrigin: "0 0" }}><City f={0} burn={1} bare /></div>
    <svg width={1280} height={720} style={{ position: "absolute", mixBlendMode: "multiply" }}><rect width={1280} height={720} fill="#c06040" /></svg>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <Defs />
      <Fire x0={-40} x1={720} y={600} h={90} seed={41} n={14} />
      <Smoke x={420} y={250} r={40} n={5} seed={42} color="#3a2420" />
      <path d="M -20 610 L 1300 610 L 1300 740 L -20 740 Z" fill="#1a0a06" />
      {/* 날아가는 돌 */}
      <path d="M 820 140 Q 560 40 330 380" stroke="#ffe0a0" strokeWidth={5} strokeDasharray="12 12" fill="none" opacity={0.85} />
      <circle cx={470} cy={120} r={30} fill="#6a6258" stroke={INK} strokeWidth={6} />
      {/* 거대한 투석기 (실루엣) */}
      <g fill="#120604" stroke="#120604" strokeLinecap="round">
        <path d="M 760 720 L 1000 300 L 1240 720" strokeWidth={34} fill="none" />
        <path d="M 820 600 L 1180 600" strokeWidth={22} />
        <path d="M 1000 300 L 1290 470" strokeWidth={30} />
        <path d="M 1000 300 L 790 120" strokeWidth={30} />
        <circle cx={1000} cy={300} r={30} />
        <path d="M 790 120 L 760 190" strokeWidth={8} />
        {/* 당기는 줄 */}
        {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M 1280 470 L ${700 + k * 60} 650`} strokeWidth={4} />)}
      </g>
    </svg>
    {/* 줄을 당기는 병사들 */}
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      {Array.from({ length: 10 }).map((_, k) => { const x = 680 + k * 62; return <g key={k} fill="#120604" stroke="#120604" strokeLinecap="round" strokeLinejoin="round"><circle cx={x + 26} cy={598} r={17} /><path d={`M ${x + 22} 616 L ${x - 4} 676`} strokeWidth={30} /><path d={`M ${x - 4} 676 L ${x - 34} 724 M ${x - 4} 676 L ${x + 24} 724`} strokeWidth={14} /><path d={`M ${x + 18} 628 L ${x + 52} 612`} strokeWidth={11} /><path d={`M ${x + 12} 590 l 28 -10 l -8 -10 Z`} /></g>; })}
    </svg>
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={26} size={TF[lang].size} />}
  </AbsoluteFill>
);

// J: 언덕 위 기병 (앞, 큰 실루엣 + 툭) - 아래 들판에서 포위된 궁전
const ConceptJ = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#2a0d14, #9a3a1c 45%, #f0904a 62%, #7a3a18 63%)", overflow: "hidden" }}>
    <svg width={1280} height={720} style={{ position: "absolute" }}><Defs /><circle cx={900} cy={430} r={220} fill="#ffd080" opacity={0.6} filter="url(#blur40)" /></svg>
    <div style={{ position: "absolute", left: 470, top: 230, width: 1920, height: 1080, transform: "scale(0.38)", transformOrigin: "0 0", filter: "saturate(1.1) brightness(0.85) sepia(0.25)" }}><City f={0} bare /></div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <path d="M -20 560 L 1300 560 L 1300 740 L -20 740 Z" fill="#5a2a12" />
      {[[560, 470], [740, 500], [1180, 480]].map(([x0, y0], k) => <Trebuchet key={k} x={x0} y={y0 + 70} s={0.45} flip={k === 2} />)}
    </svg>
    <Riders y={520} w={30} n={36} x0={420} x1={1300} face="r" op={0.9} seed={51} />
    <Riders y={545} w={38} n={30} x0={420} x1={1300} face="l" op={0.95} seed={53} />
    <Riders y={580} w={48} n={22} x0={420} x1={1300} face="r" seed={55} />
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      {/* 앞 언덕 */}
      <path d="M -20 470 C 160 430 380 470 560 600 L 640 740 L -20 740 Z" fill="#140806" />
      {/* 툭 */}
      <path d="M 430 600 L 430 250" stroke="#140806" strokeWidth={9} />
      {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M 430 262 q ${(k - 4) * 9} 40 ${(k - 4) * 14} 90`} stroke="#140806" strokeWidth={7} fill="none" />)}
    </svg>
    <Riders y={250} w={400} n={1} x0={60} x1={200} face="r" seed={2} />
    <Riders y={360} w={240} n={2} x0={-120} x1={120} face="r" seed={6} />
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={26} size={TF[lang].size} />}
  </AbsoluteFill>
);

// ================================================================ 11-03 6차 (사용자: "투석기 외엔 맘에 드는 게 없네, 어두운 거 말고. 잘되는 썸네일 분석해봐")
// 참고 28장(~/ReStory/시안/썸네일 참고) 공통점: 밝고 채도 높은 배경 · 큰 얼굴 + 과장된 표정 · 두 인물이 맞서는 구도 · 한가운데 사물 하나 · (한국 채널) 아래 두 줄 글 + 말풍선
// K 오버심플리파이드식 맞대결(낮, 궁전 가운데, 비웃는 칸 vs 질린 샤, 사이로 날아가는 돌) · L 한국 채널식(투석기 + 말풍선 + 아래 띠 글) · M 큰 얼굴(주황 배경, 칸 얼굴 반 + 돌 맞는 궁전)
const TrebuchetC = ({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
    <rect x={-80} y={-14} width={160} height={22} rx={4} fill="#8a5a30" strokeWidth={5} />
    <circle cx={-56} cy={12} r={16} fill="#6a4020" strokeWidth={5} /><circle cx={56} cy={12} r={16} fill="#6a4020" strokeWidth={5} />
    <path d="M -50 -12 L 0 -130 L 50 -12" fill="none" stroke="#8a5a30" strokeWidth={18} /><path d="M -50 -12 L 0 -130 L 50 -12" fill="none" strokeWidth={4} />
    <path d="M -100 -200 L 80 -80" stroke="#a06a38" strokeWidth={16} /><path d="M -100 -200 L 80 -80" strokeWidth={3} fill="none" />
    <rect x={58} y={-92} width={48} height={48} fill="#6a6258" strokeWidth={5} />
    <circle cx={0} cy={-130} r={11} fill="#c9a24a" strokeWidth={4} />
    <path d="M -100 -200 L -116 -150" strokeWidth={5} />
  </g>
);
const Stone = ({ x, y, r, trail }: { x: number; y: number; r: number; trail?: string }) => (
  <g>
    {trail && <path d={trail} stroke="#fff" strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={0.9} />}
    <circle cx={x} cy={y} r={r} fill="#8a8478" stroke={INK} strokeWidth={Math.max(5, r * 0.12)} />
    <path d={`M ${x - r * 0.5} ${y - r * 0.2} C ${x - r * 0.4} ${y - r * 0.6} ${x} ${y - r * 0.7} ${x + r * 0.3} ${y - r * 0.6}`} stroke="#b9b2a4" strokeWidth={r * 0.16} fill="none" strokeLinecap="round" />
  </g>
);
const Burst = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <path d={Array.from({ length: 20 }).map((_, i) => { const a = (i / 20) * Math.PI * 2, d = i % 2 ? r * 0.5 : r; return `${i ? "L" : "M"} ${x + Math.cos(a) * d} ${y + Math.sin(a) * d * 0.8}`; }).join(" ") + " Z"} fill="#fff1b0" stroke={INK} strokeWidth={6} />
);
const SHAH = { ...CIV[0], robe: "#3a6aa8", dark: "#2a4e80", trim: "#e2b13c", beard: "full" as const };

const ConceptK = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#5ec0f2, #b8e6fb 60%)", overflow: "hidden" }}>
    <InkDefs />
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      {[[180, 120], [520, 70], [980, 110]].map(([x, y], i) => <g key={i} fill="#fff" opacity={0.95}><ellipse cx={x} cy={y} rx={90} ry={30} /><ellipse cx={x + 40} cy={y - 20} rx={50} ry={30} /></g>)}
    </svg>
    <div style={{ position: "absolute", left: 160, top: 40, width: 1920, height: 1080, transform: "scale(0.5)", transformOrigin: "0 0", filter: "saturate(1.25) brightness(1.08)" }}><City f={0} bare /></div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <path d="M -20 560 L 1300 560 L 1300 740 L -20 740 Z" fill="#e6c27a" stroke={INK} strokeWidth={5} />
      <Burst x={760} y={330} r={90} />
      <Stone x={700} y={300} r={46} trail="M 300 420 Q 480 120 660 280" />
    </svg>
    <svg width={1280} height={720} style={{ position: "absolute" }}><Defs /><Khan x={250} y={520} s={1.25} expr="smirk" skin="#e49a78" /></svg>
    <Person L={SHAH} x={1080} y={900} h={720} flip arms="up" eyes="wide" mouth="wail" sweat t={0} />
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={20} size={[80, 108]} />}
  </AbsoluteFill>
);

const BUB: Record<"ko" | "en", Line> = { ko: [["저게 뭐야...?", "#111"]], en: [["What is THAT...?", "#111"]] };
const TL: Txt = {
  ko: { lines: [[["이슬람 제국을 ", "#fff"], ["짓밟은 방법", Y]]], size: [92] },
  en: { lines: [[["HOW THEY ", "#fff"], ["CRUSHED", Y], [" AN EMPIRE", "#fff"]]], size: [78] },
};
const ConceptL = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#7fcaf0, #d8f0fb 55%)", overflow: "hidden" }}>
    <InkDefs />
    <div style={{ position: "absolute", left: 420, top: -10, width: 1920, height: 1080, transform: "scale(0.52)", transformOrigin: "0 0", filter: "saturate(1.2) brightness(1.05)" }}><City f={0} bare /></div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <path d="M -20 470 L 1300 470 L 1300 740 L -20 740 Z" fill="#e6c27a" />
      <Burst x={820} y={250} r={80} />
      <Stone x={770} y={230} r={40} trail="M 260 330 Q 470 30 735 215" />
      <TrebuchetC x={200} y={520} s={1.25} />
    </svg>
    <Person L={SHAH} x={1110} y={760} h={500} flip arms="up" eyes="wide" mouth="o" sweat t={0} />
    {lang !== "none" && <>
      <Bubble x={lang === "ko" ? 760 : 700} y={300} w={lang === "ko" ? 300 : 380} h={84} tail={[1030, 410]} text={BUB[lang as "ko" | "en"]} size={46} />
      <div style={{ position: "absolute", left: 0, top: 560, width: 1280, height: 160, background: "linear-gradient(90deg, #8a1a10, #c42a14)", borderTop: "8px solid #111" }} />
      <Words lines={TL[lang as "ko" | "en"].lines} x={30} y={582} size={TL[lang as "ko" | "en"].size} />
    </>}
  </AbsoluteFill>
);

const ConceptM = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 55%, #ffd860, #ff9a2a 55%, #e0602a)", overflow: "hidden" }}>
    <InkDefs />
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      {Array.from({ length: 24 }).map((_, i) => { const a = (i / 24) * Math.PI * 2; return <path key={i} d={`M 900 400 L ${900 + Math.cos(a) * 1400} ${400 + Math.sin(a) * 1400} L ${900 + Math.cos(a + 0.12) * 1400} ${400 + Math.sin(a + 0.12) * 1400} Z`} fill="#fff" opacity={i % 2 ? 0 : 0.14} />; })}
    </svg>
    <div style={{ position: "absolute", left: 520, top: 170, width: 1920, height: 1080, transform: "scale(0.4)", transformOrigin: "0 0", filter: "saturate(1.2)" }}><City f={0} bare /></div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <Defs />
      <path d="M 500 600 L 1300 600 L 1300 740 L 500 740 Z" fill="#c98a3a" />
      <Burst x={900} y={330} r={100} />
      <Stone x={850} y={300} r={52} trail="M 420 120 Q 640 60 810 270" />
      <TrebuchetC x={1160} y={640} s={0.8} />
      <Khan x={300} y={470} s={1.75} expr="roar" skin="#e49a78" />
    </svg>
    {lang !== "none" && <Words lines={TF[lang].lines} x={540} y={22} size={[74, 100]} />}
  </AbsoluteFill>
);

// ================================================================ 11-03 7차 (사용자: "A(투석기 밤)만 좋고 나머진 별로, 다른 접근법" → 1~4 다 그려 봐)
// 1 영상 장면 그대로(V1~V4: public/thumbsrc/m02/v_<초>.png, 영어 1440p에서 뽑음) + 글 · 2 지도(네 갈래 화살표) · 3 전후 비교(연도만) · 4 사물 하나 크게(돔 + 돌, 글 없음)
const Frame = ({ src, zoom = 1, ox = 0, oy = 0, filter }: { src: string; zoom?: number; ox?: number; oy?: number; filter?: string }) => (
  <Img src={staticFile(`thumbsrc/m02/${src}`)} style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 720, transform: `translate(${ox}px, ${oy}px) scale(${zoom})`, transformOrigin: "0 0", filter }} />
);
const Shade = () => <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 330, background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0))" }} />;
const VFrame = ({ lang, src, zoom, ox, oy, filter }: { lang: M02Lang; src: string; zoom?: number; ox?: number; oy?: number; filter?: string }) => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <Frame src={src} zoom={zoom} ox={ox} oy={oy} filter={filter} />
    <Shade />
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={20} size={[86, 116]} />}
  </AbsoluteFill>
);

// 2 지도: 호라즘 지도 위로 네 갈래 빨간 화살표가 한꺼번에, 도시마다 불
const BigArrow = ({ d, w = 34 }: { d: string; w?: number }) => (
  <g>
    <path d={d} stroke="#000" strokeWidth={w + 16} fill="none" strokeLinecap="round" />
    <path d={d} stroke="#e8281c" strokeWidth={w} fill="none" strokeLinecap="round" markerEnd="url(#ah)" />
  </g>
);
const ConceptMap = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "#efe0b8", overflow: "hidden" }}>
    <Frame src="v_6.5.png" zoom={1.25} ox={-180} oy={-60} filter="saturate(1.3)" />
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <Defs />
      <defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.2" markerHeight="2.2" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#e8281c" stroke="#000" strokeWidth={1.2} /></marker></defs>
      <BigArrow d="M 1300 260 C 1160 250 1060 280 960 330" />
      <BigArrow d="M 1300 420 C 1180 430 1080 450 990 470" />
      <BigArrow d="M 1220 720 C 1120 640 1010 600 900 590" />
      <BigArrow d="M 1300 120 C 1100 100 900 160 780 250" />
      {[[930, 360], [880, 480], [760, 290], [860, 600]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={46} fill="#ff6a20" opacity={0.55} filter="url(#blur20)" /><Fire x0={x - 34} x1={x + 34} y={y + 24} h={60} seed={60 + i} n={4} /></g>)}
    </svg>
    <Shade />
    {lang !== "none" && <Words lines={TF[lang].lines} x={30} y={20} size={TF[lang].size.map((x) => x * 0.88)} />}
  </AbsoluteFill>
);

// 3 전후 비교: 왼쪽 멀쩡한 궁전(1219) / 오른쪽 불탄 궁전(1221), 사선으로 나눔, 글은 연도만
const ConceptBA = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <Frame src="v_12.5.png" zoom={1.15} ox={-120} oy={-30} filter="saturate(1.3) brightness(1.05)" />
    <div style={{ position: "absolute", inset: 0, clipPath: "polygon(62% 0, 100% 0, 100% 100%, 42% 100%)" }}><Frame src="v_444.png" zoom={1.15} ox={-120} oy={-30} filter="saturate(1.3) contrast(1.05)" /></div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <path d="M 794 0 L 538 720" stroke="#000" strokeWidth={22} /><path d="M 794 0 L 538 720" stroke="#fff" strokeWidth={8} />
    </svg>
    <Words lines={[[["1219", "#fff"]]]} x={40} y={30} size={[150]} />
    <Words lines={[[["1221", R]]]} x={40} y={540} size={[150]} align="right" />
  </AbsoluteFill>
);

// 4 사물 하나: 화면을 채운 이슬람 돔에 거대한 돌이 닿기 직전 (밝은 하늘, 글 없음)
const ConceptObj = ({ lang }: { lang: M02Lang }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#3aa8ea, #a8dcf8 70%)", overflow: "hidden" }}>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <Defs />
      {[[160, 140], [1100, 90]].map(([x, y], i) => <g key={i} fill="#fff"><ellipse cx={x} cy={y} rx={110} ry={34} /><ellipse cx={x + 50} cy={y - 24} rx={60} ry={34} /></g>)}
      {/* 첨탑 */}
      <g stroke={INK} strokeWidth={7}>
        <rect x={110} y={300} width={70} height={460} fill={SANDC} /><rect x={96} y={290} width={98} height={26} fill={SANDD} /><path d="M 110 300 C 110 240 180 240 180 300 Z" fill="#2f8a6e" /><path d="M 145 245 L 145 210" />
      </g>
      {/* 큰 돔 */}
      <path d="M 260 760 L 260 560 L 1060 560 L 1060 760 Z" fill={SANDC} stroke={INK} strokeWidth={9} />
      {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M ${300 + i * 110} 640 l 0 120`} stroke={SANDD} strokeWidth={8} />)}
      <path d="M 280 560 C 280 260 1040 260 1040 560 Z" fill="#2f9a7c" stroke={INK} strokeWidth={10} />
      <path d="M 380 470 C 400 380 480 330 560 320" stroke="#7fd0b4" strokeWidth={26} fill="none" strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${340 + i * 80} 560 C ${360 + i * 76} 420 ${560 + i * 10} 360 660 345`} stroke="#237a62" strokeWidth={4} fill="none" opacity={0.6} />)}
      <path d="M 660 300 L 660 200" stroke={INK} strokeWidth={9} /><circle cx={660} cy={300} r={18} fill="#e2b13c" stroke={INK} strokeWidth={5} />
      <path d="M 645 190 C 630 160 660 140 680 150 C 660 155 655 175 670 190 Z" fill="#e2b13c" stroke={INK} strokeWidth={4} />
      {/* 금이 가기 시작 */}
      <path d="M 860 330 L 830 380 L 870 410 L 840 470" stroke={INK} strokeWidth={6} fill="none" />
      {/* 거대한 돌 + 속도선 */}
      {Array.from({ length: 7 }).map((_, k) => <path key={k} d={`M ${1300} ${30 + k * 40} L ${1080 - k * 6} ${150 + k * 26}`} stroke="#fff" strokeWidth={9 - k} strokeLinecap="round" opacity={0.85} />)}
      <circle cx={970} cy={250} r={150} fill="#8a8478" stroke={INK} strokeWidth={12} />
      <path d="M 880 190 C 900 140 960 120 1010 130" stroke="#b9b2a4" strokeWidth={22} fill="none" strokeLinecap="round" />
      <circle cx={930} cy={300} r={18} fill="#6a6258" /><circle cx={1030} cy={280} r={12} fill="#6a6258" /><circle cx={990} cy={340} r={9} fill="#6a6258" />
      <ellipse cx={870} cy={370} rx={60} ry={14} fill="#000" opacity={0.25} />
    </svg>
    {lang !== "none" && <Words lines={[[["?", Y]]]} x={60} y={20} size={[220]} />}
  </AbsoluteFill>
);

export const Mongol02Thumb = ({ concept, lang }: M02ThumbProps) => {
  useFonts();
  const C = { A: ConceptF, B: ConceptB, C: ConceptC, D: () => <Siege lang={lang} v="night" />, E: () => <Siege lang={lang} v="engines" />, F: () => <Siege lang={lang} v="close" />, G: ConceptG, H: ConceptH, I: ConceptI, J: ConceptJ, K: ConceptK, L: ConceptL, M: ConceptM,
    V1: () => <VFrame lang={lang} src="v_21.5.png" zoom={1.12} ox={-70} oy={-40} />,
    V2: () => <VFrame lang={lang} src="v_369.png" zoom={1.25} ox={-20} oy={-150} />,
    V3: () => <VFrame lang={lang} src="v_444.png" zoom={1.1} ox={-60} oy={-50} filter="saturate(1.2)" />,
    V4: () => <VFrame lang={lang} src="v_399.8.png" zoom={1.25} ox={-160} oy={-60} />,
    MAP: ConceptMap, BA: ConceptBA, OBJ: ConceptObj }[concept];
  return <C lang={lang} />;
};
