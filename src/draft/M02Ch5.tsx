// 몽골 2편 끝 장 1판 (2026-11-02) - 대본 episodes/mongol-02/script-ko.md "## 5." (c5_01~c5_04) + 20초 고정 엔딩(칸 옆에 수부타이)
// 사용자: "호라즘 입장보다 몽골은 중앙아시아까지 정벌을 완료했다, 다음은 지금의 러시아와 유럽이 남아 있었다"
// 지도: public/hook/m02/eurasia.svg (scripts/eurasia-map.py, 4400×1800, 경도 -12~124) - 아래 EX·EY가 같은 투영
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Chapter, chapterFrames, Char, clamp, ease, FPS, Glow, Group, INK, Lang, LangContext, SFX, ShotProps, Snd, Tug } from "./kit";
import { Cam, Dust, Smoke } from "./M01Ch4";
import { City } from "./M02City";
import { MoG } from "./M02Ch1";
import { Fire, Rider } from "./kit";
import { Horse, MON, Person, RiderOn } from "./M01Ch4";

const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
const sec = (s: number) => Math.round(s * FPS);
const id = (n: number) => `m2.c5_${String(n).padStart(2, "0")}`;
const EW = 4400, EH = 1800;
const EX = (lon: number) => (lon + 12) * 32.3529;
const EY = (lat: number) => (65.972 - lat) * 47.4384;
const E = (lon: number, lat: number) => [EX(lon), EY(lat)];
const pd = (pts: number[][]) => "M " + pts.map((p) => p.join(" ")).join(" L ") + " Z";
// 2판 (2026-11-02 사용자: "다 갈아엎어, 지도 말고 떠는 킵차크 사람들과 성·군사들, 유럽도 소식을 듣고, 악당들이 큰 전쟁을 준비하는 애니메이션 장면처럼")
// 컷: ① 정복한 도시를 내려다보는 몽골 대군 ② 서쪽 몽타주 - 킵차크 진영·루스 나무 성·유럽 돌 성 ③ 캅카스 고갯길의 제베·수부타이와 기병 2만 ④ 노을 속 서쪽으로 내려가는 행렬
const RED_SKY = "linear-gradient(#2a1418, #6a2a24 38%, #c0603a 62%, #e8a05a)";
// 먹구름 (어두운 겹 구름)
const DarkCloud = ({ x, y, s = 1, f }: { x: number; y: number; s?: number; f: number }) => (
  <g transform={`translate(${x + f * 0.3} ${y}) scale(${s})`}>
    <path d="M -220 30 C -250 -20 -170 -60 -120 -40 C -100 -100 10 -110 40 -50 C 80 -90 190 -70 170 0 C 240 0 240 50 180 54 L -200 54 C -260 54 -260 30 -220 30 Z" fill="#3a2a2e" stroke={INK} strokeWidth={4} opacity={0.85} />
    <path d="M -190 50 C -80 36 60 36 180 46" stroke="#c0603a" strokeWidth={6} fill="none" opacity={0.6} />
  </g>
);
// 서쪽 전사: 원뿔 투구(코 가리개)·사슬 갑옷·둥근 방패·창 - kind로 킵차크(털 장식·갈색)·루스(붉은 방패) 구분, 판 300×480, 발 = (150, 480)
const WestWarrior = ({ x, y, h, kind, f = 0, look = 0 }: { x: number; y: number; h: number; kind: "kipchak" | "rus"; f?: number; look?: number }) => {
  const s = h / 480;
  const shield = kind === "rus" ? "#a8332a" : "#7a5a3a";
  const coat = kind === "rus" ? "#5a5e66" : "#6a5440";
  return (
    <svg width={300 * s} height={480 * s} viewBox="0 0 300 480" style={{ position: "absolute", left: x - 150 * s, top: y - 480 * s, ...ink }}>
      <ellipse cx={150} cy={476} rx={80} ry={9} fill="rgba(0,0,0,.25)" />
      <path d="M 252 470 L 238 40" stroke={INK} strokeWidth={10} /><path d="M 252 470 L 238 40" stroke="#7a5230" strokeWidth={5} /><path d="M 238 40 L 228 2 L 248 2 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
      <rect x={110} y={400} width={30} height={70} rx={8} fill="#3a2b22" stroke={INK} strokeWidth={4} /><rect x={160} y={400} width={30} height={70} rx={8} fill="#3a2b22" stroke={INK} strokeWidth={4} />
      <path d="M 90 210 C 80 300 84 380 96 420 L 204 420 C 216 380 220 300 210 210 Z" fill={coat} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={110 + (i % 6) * 16} cy={260 + Math.floor(i / 6) * 22} r={5} fill="none" stroke="#3a3e40" strokeWidth={2.5} />)}
      <path d="M 92 380 L 208 380" stroke="#c9a24a" strokeWidth={8} />
      {/* 얼굴 (look: 0 앞 → 1 오른쪽(동쪽)을 봄) */}
      <circle cx={150 + look * 8} cy={150} r={52} fill="#e8c09a" stroke={INK} strokeWidth={6} />
      <circle cx={134 + look * 16} cy={150} r={6} fill={INK} /><circle cx={166 + look * 16} cy={150} r={6} fill={INK} />
      <path d={`M ${126 + look * 16} 136 L ${144 + look * 16} 142 M ${174 + look * 16} 136 L ${156 + look * 16} 142`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d={`M ${124 + look * 12} 176 C ${140 + look * 12} 168 ${160 + look * 12} 168 ${176 + look * 12} 176`} stroke={kind === "kipchak" ? "#5a3a20" : "#7a5030"} strokeWidth={9} fill="none" strokeLinecap="round" />
      {kind === "rus" && <path d={`M ${116 + look * 8} 172 C ${120 + look * 8} 214 ${180 + look * 8} 214 ${184 + look * 8} 172`} fill="#8a5a30" stroke={INK} strokeWidth={4} />}
      {/* 원뿔 투구 + 코 가리개 (+ 킵차크는 털 테두리) */}
      <path d="M 96 132 C 100 70 130 40 150 20 C 170 40 200 70 204 132 C 170 120 130 120 96 132 Z" fill="#8a8e90" stroke={INK} strokeWidth={6} />
      <path d={`M ${146 + look * 10} 122 L ${154 + look * 10} 122 L ${152 + look * 10} 168 L ${148 + look * 10} 168 Z`} fill="#8a8e90" stroke={INK} strokeWidth={3} />
      {kind === "kipchak" && <path d="M 92 136 C 120 118 180 118 208 136 L 204 150 C 170 136 130 136 96 150 Z" fill="#7a5a3a" stroke={INK} strokeWidth={4} />}
      {/* 둥근 방패 (킵차크) / 물방울 방패 (루스) */}
      {kind === "rus" ? <path d="M 40 230 C 40 200 120 200 120 230 C 120 300 90 350 80 370 C 70 350 40 300 40 230 Z" fill={shield} stroke={INK} strokeWidth={6} /> : <circle cx={78} cy={280} r={56} fill={shield} stroke={INK} strokeWidth={6} />}
      {kind === "rus" ? <path d="M 80 214 L 80 350 M 50 250 L 110 250" stroke="#e8c84a" strokeWidth={6} /> : <circle cx={78} cy={280} r={14} fill="#b8bcbd" stroke={INK} strokeWidth={4} />}
    </svg>
  );
};
// 유럽 기사: 원통 투구·흰 겉옷에 붉은 십자·연 모양 방패, 판 300×480
const Knight = ({ x, y, h }: { x: number; y: number; h: number }) => {
  const s = h / 480;
  return (
    <svg width={300 * s} height={480 * s} viewBox="0 0 300 480" style={{ position: "absolute", left: x - 150 * s, top: y - 480 * s, ...ink }}>
      <ellipse cx={150} cy={476} rx={80} ry={9} fill="rgba(0,0,0,.25)" />
      <path d="M 240 470 L 232 60" stroke={INK} strokeWidth={10} /><path d="M 240 470 L 232 60" stroke="#7a5230" strokeWidth={5} />
      <path d="M 232 66 L 280 80 L 232 104 Z" fill="#f4efe2" stroke={INK} strokeWidth={4} /><path d="M 232 84 L 268 84" stroke="#a8332a" strokeWidth={6} />
      <rect x={112} y={400} width={30} height={70} rx={6} fill="#6a6e70" stroke={INK} strokeWidth={4} /><rect x={158} y={400} width={30} height={70} rx={6} fill="#6a6e70" stroke={INK} strokeWidth={4} />
      <path d="M 92 200 C 82 300 86 380 96 420 L 204 420 C 214 380 218 300 208 200 Z" fill="#efe9dc" stroke={INK} strokeWidth={6} />
      <path d="M 150 220 L 150 400 M 108 290 L 192 290" stroke="#a8332a" strokeWidth={22} />
      <rect x={100} y={68} width={100} height={124} rx={10} fill="#9a9ea0" stroke={INK} strokeWidth={6} />
      <path d="M 106 118 L 194 118" stroke={INK} strokeWidth={8} />
      {[0, 1, 2, 3].map((k) => <circle key={k} cx={130 + k * 14} cy={150} r={3} fill={INK} />)}
      <path d="M 30 210 L 110 210 L 110 300 C 110 340 70 380 70 400 C 70 380 30 340 30 300 Z" fill="#2e4a8a" stroke={INK} strokeWidth={6} />
      <path d="M 50 240 L 90 240 M 70 220 L 70 300" stroke="#e8c84a" strokeWidth={8} />
    </svg>
  );
};
// 킵차크 수레 천막 (바퀴 달린 둥근 천막)
const Kibitka = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 -40 L 110 -40 L 100 -10 L -100 -10 Z" fill="#6a4a2e" stroke={INK} strokeWidth={5} />
    <path d="M -96 -40 C -96 -150 96 -150 96 -40 Z" fill="#cfc2a4" stroke={INK} strokeWidth={6} />
    {[-60, -20, 20, 60].map((dx) => <path key={dx} d={`M ${dx} -40 C ${dx * 0.8} -110 ${dx * 0.4} -130 0 -134`} stroke="#a8977a" strokeWidth={4} fill="none" />)}
    {[-70, 70].map((dx) => <g key={dx}><circle cx={dx} cy={0} r={30} fill="#5a3a24" stroke={INK} strokeWidth={5} /><path d={`M ${dx - 26} 0 L ${dx + 26} 0 M ${dx} -26 L ${dx} 26`} stroke={INK} strokeWidth={4} /></g>)}
  </g>
);
// 루스 나무 성벽 + 양파 지붕 교회 + 종탑
const RusTown = ({ f, bell }: { f: number; bell: number }) => (
  <g>
    {/* 교회 */}
    <rect x={820} y={300} width={280} height={300} fill="#efe6d4" stroke={INK} strokeWidth={6} />
    {[860, 960, 1060].map((x) => <path key={x} d={`M ${x - 14} 470 L ${x - 14} 420 C ${x - 14} 400 ${x + 14} 400 ${x + 14} 420 L ${x + 14} 470 Z`} fill="#3a2e22" />)}
    <path d="M 900 300 L 900 220 L 1020 220 L 1020 300" fill="#efe6d4" stroke={INK} strokeWidth={6} />
    <path d="M 900 222 C 880 160 940 120 960 80 C 980 120 1040 160 1020 222 Z" fill="#d9a92e" stroke={INK} strokeWidth={6} />
    <path d="M 960 80 L 960 30 M 944 46 L 976 46" stroke={INK} strokeWidth={6} />
    {[840, 1080].map((x) => <g key={x}><path d={`M ${x - 26} 300 C ${x - 34} 260 ${x - 6} 240 ${x} 220 C ${x + 6} 240 ${x + 34} 260 ${x + 26} 300 Z`} fill="#4f7aa8" stroke={INK} strokeWidth={5} /><path d={`M ${x} 220 L ${x} 196`} stroke={INK} strokeWidth={4} /></g>)}
    {/* 종탑 + 흔들리는 종 */}
    <rect x={1180} y={260} width={110} height={340} fill="#efe6d4" stroke={INK} strokeWidth={6} />
    <path d="M 1170 262 L 1235 200 L 1300 262 Z" fill="#4f7aa8" stroke={INK} strokeWidth={5} />
    <g transform={`rotate(${Math.sin(f / 4) * 24 * bell} 1235 290)`}><path d="M 1210 290 C 1210 330 1260 330 1260 290 L 1250 330 L 1220 330 Z" fill="#c9a24a" stroke={INK} strokeWidth={5} /></g>
    {/* 통나무 성벽 + 망루 */}
    <rect x={-40} y={560} width={2000} height={200} fill="#8a6440" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 50 }).map((_, i) => <g key={i}><path d={`M ${-30 + i * 40} 560 L ${-30 + i * 40} 760`} stroke="#6a4a2e" strokeWidth={4} /><path d={`M ${-30 + i * 40 - 18} 560 L ${-30 + i * 40} 530 L ${-30 + i * 40 + 18} 560 Z`} fill="#8a6440" stroke={INK} strokeWidth={4} /></g>)}
    {[300, 1600].map((x) => <g key={x}><rect x={x - 70} y={420} width={140} height={340} fill="#7a5638" stroke={INK} strokeWidth={6} /><path d={`M ${x - 90} 422 L ${x} 330 L ${x + 90} 422 Z`} fill="#5a3a24" stroke={INK} strokeWidth={6} />{Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M ${x - 70} ${470 + k * 46} L ${x + 70} ${470 + k * 46}`} stroke="#5a3a24" strokeWidth={4} />)}</g>)}
  </g>
);
// 유럽 돌 성 (해 질 녘): 높은 탑 둘·성벽·십자 깃발·횃불 창
const EuroCastle = ({ f }: { f: number }) => (
  <g>
    {[[560, 160, 200], [1360, 120, 220]].map(([x, top, w], i) => (
      <g key={i}>
        <rect x={x - w / 2} y={top} width={w} height={700 - top} fill="#8a8478" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 5 }).map((_, k) => <rect key={k} x={x - w / 2 + k * (w / 5) + 6} y={top - 30} width={w / 5 - 12} height={32} fill="#8a8478" stroke={INK} strokeWidth={5} />)}
        {Array.from({ length: 8 }).map((_, k) => <path key={`r${k}`} d={`M ${x - w / 2} ${top + 50 + k * 60} L ${x + w / 2} ${top + 50 + k * 60}`} stroke="#6e6a60" strokeWidth={3} />)}
        <path d={`M ${x - 12} ${top + 90} l 0 50 l 24 0 l 0 -50 Z`} fill="#ffcf6a" opacity={0.7 + 0.3 * Math.sin(f / 5 + i)} />
        <path d={`M ${x} ${top - 30} L ${x} ${top - 140}`} stroke={INK} strokeWidth={7} />
        <path d={`M ${x + 2} ${top - 140} C ${x + 50} ${top - 150 + Math.sin(f / 5 + i) * 8} ${x + 90} ${top - 126 - Math.sin(f / 5 + i) * 8} ${x + 110} ${top - 130} L ${x + 100} ${top - 96} C ${x + 70} ${top - 92} ${x + 40} ${top - 106} ${x + 2} ${top - 90} Z`} fill="#efe9dc" stroke={INK} strokeWidth={4} />
        <path d={`M ${x + 46} ${top - 140} L ${x + 46} ${top - 96} M ${x + 20} ${top - 118} L ${x + 76} ${top - 118}`} stroke="#a8332a" strokeWidth={8} />
      </g>
    ))}
    <rect x={640} y={380} width={640} height={320} fill="#7a766c" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={646 + k * 53} y={354} width={34} height={28} fill="#7a766c" stroke={INK} strokeWidth={4} />)}
    <path d="M 900 700 L 900 560 C 900 500 1020 500 1020 560 L 1020 700 Z" fill="#2a2018" stroke={INK} strokeWidth={6} />
  </g>
);
const Cut1: React.FC<{ f: number; d: number }> = ({ f, d }) => (
  // ① 정복한 호라즘 도시를 내려다보는 언덕 위 몽골 대군 (새벽)
  <AbsoluteFill>
    <Cam z={lerp(f, 0, d, 1.0, 1.08)} cx={960} cy={560}>
      <AbsoluteFill style={{ background: "linear-gradient(#e8b890, #f2d8b0 40%, #e6d2a2)" }} />
      {/* 골짜기 아래 정복한 호라즘 도시 (흰 깃발, 연기 몇 줄기) */}
      <div style={{ position: "absolute", inset: 0, transform: "translate(260px, 150px) scale(0.62)", transformOrigin: "50% 50%" }}>
        <City f={f} bare guards={false} burn={0.01} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>{[300, 1060, 1640].map((x) => <g key={x} transform={`translate(${x} 470)`}><path d="M 0 0 L 0 -150" stroke={INK} strokeWidth={8} /><path d={`M 2 -150 C 40 ${-160 + Math.sin(f / 4 + x) * 8} 80 ${-140 - Math.sin(f / 4 + x) * 8} 100 -140 L 92 -112 C 60 -110 30 -120 2 -108 Z`} fill="#f4efe2" stroke={INK} strokeWidth={4} /></g>)}</svg>
        {[500, 1300].map((x, k) => <Smoke key={x} x={x} y={300} f={f + k * 30} n={2} s={0.8} />)}
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M -40 760 C 300 640 800 600 1200 700 C 1500 770 1800 760 1960 740 L 1960 1100 L -40 1100 Z" fill="#7a6a44" stroke={INK} strokeWidth={5} />
      </svg>
      {Array.from({ length: 22 }).map((_, i) => <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={-60 + i * 90} y={600 + Math.sin(i * 0.6) * 30 + (i % 3) * 20} w={130 + (i % 3) * 20} still phase={i} />)}
      {[160, 520, 900, 1280, 1660].map((x, i) => <Tug key={x} x={x} y={800} h={360} sway={Math.sin((f + i * 9) / 11) * 5} />)}
      <Horse x={400} y={1060} w={480} run={false} coat="#e8e0cc" dark="#c8bfa8" saddle="#a8332a"><RiderOn L={MON} arms="point" eyes="dot" mouth="flat" t={f} /></Horse>
    </Cam>
  </AbsoluteFill>
);
// ② 서쪽 몽타주 2판 (2026-11-02 사용자: "킵차크랑 유럽 군을 두 화면으로, 더 다양한 장면") - 네 박자(각 약 2.6초):
//   A 화면 둘: 왼쪽 킵차크 진영(전령·겁먹은 사람들) | 오른쪽 유럽 돌 성(기사들) → B 루스 나무 성(종·병사) → C 대장간(칼을 벼림, 불똥) → D 영주들의 작전 회의(촛불·지도)
const Sky = ({ f }: { f: number }) => (
  <>
    <AbsoluteFill style={{ background: RED_SKY }} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>{[[300, 140, 1.1], [900, 90, 1.3], [1500, 160, 1.0]].map(([x, y, sc], i) => <DarkCloud key={i} x={x} y={y} s={sc} f={f} />)}</svg>
  </>
);
const KipchakScene = ({ f, t, sub }: { f: number; t: number; sub: number }) => (
  <AbsoluteFill>
    <Sky f={f} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      <path d="M -40 640 C 400 600 900 630 1960 600 L 1960 1100 L -40 1100 Z" fill="#6a6a3e" stroke={INK} strokeWidth={4} />
      {[[200, 700, 1.1], [520, 680, 0.9], [1500, 690, 1.0], [1780, 700, 0.8]].map(([x, y, sc], i) => <Kibitka key={i} x={x} y={y} s={sc} />)}
    </svg>
    {[[700, 960, 0.6], [880, 980, 0.2], [1080, 970, 0.8]].map(([x, y, lk], i) => <WestWarrior key={i} x={x} y={y} h={400} kind="kipchak" f={f} look={lk} />)}
    {[[360, 980], [460, 1000], [1300, 990]].map(([x, y], i) => <Person key={i} L={{ robe: ["#8a5a3a", "#6a7a5a", "#a87a4a"][i], dark: "#5a3e28", trim: "#c9a24a", hat: i === 1 ? "scarf" : "fur", collar: "cross" }} x={x} y={y} h={i === 2 ? 200 : 260} arms={i === 0 ? "sleeves" : "down"} eyes="wide" mouth="o" />)}
    <Horse x={lerp(t, 0, sub * 0.5, 2200, 1600, true)} y={980} w={380} run={t < sub * 0.5} coat="#8a6440" dark="#6a4a2e" saddle="#5a3a24" flip><RiderOn L={{ robe: "#6a5440", dark: "#4e3e2e", trim: "#c9a24a", hat: "fur", beard: "thin", collar: "cross" }} arms="point" eyes="wide" mouth="o" t={f} /></Horse>
  </AbsoluteFill>
);
const KnightScene = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <Sky f={f} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><EuroCastle f={f} /><rect x={-40} y={700} width={2000} height={400} fill="#4a4636" /></svg>
    {[300, 1620].map((x) => <Fire key={x} x={x} y={760} s={1} />)}
    {Array.from({ length: 8 }).map((_, i) => <Knight key={i} x={260 + i * 200} y={1010 + (i % 2) * 30} h={400} />)}
  </AbsoluteFill>
);
const RusScene = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <Sky f={f} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><RusTown f={f} bell={1} /><rect x={-40} y={760} width={2000} height={340} fill="#5a4a36" /></svg>
    {Array.from({ length: 9 }).map((_, i) => <WestWarrior key={i} x={160 + i * 200} y={1000 + (i % 2) * 30} h={380} kind="rus" f={f} look={0.3} />)}
  </AbsoluteFill>
);
// 대장간: 화덕 불빛 · 모루 위 달군 칼 · 망치질 불똥 · 벽에 걸린 칼과 방패
const SmithScene = ({ f }: { f: number }) => {
  const up = Math.sin(f / 3) > 0;
  return (
    <AbsoluteFill style={{ background: "#1e1612" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <rect x={-40} y={-40} width={2000} height={1200} fill="#2e221a" />
        {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M -40 ${100 + i * 90} L 1960 ${100 + i * 90}`} stroke="#241a14" strokeWidth={6} />)}
        {/* 벽의 칼·방패 */}
        {[260, 380, 500].map((x, i) => <path key={x} d={`M ${x} 120 L ${x} 420`} stroke="#b8bcbd" strokeWidth={14} />)}
        {[1500, 1700].map((x) => <g key={x}><path d={`M ${x - 60} 160 C ${x - 60} 120 ${x + 60} 120 ${x + 60} 160 C ${x + 60} 260 ${x + 20} 320 ${x} 340 C ${x - 20} 320 ${x - 60} 260 ${x - 60} 160 Z`} fill="#a8332a" stroke={INK} strokeWidth={6} /><path d={`M ${x} 140 L ${x} 320 M ${x - 40} 200 L ${x + 40} 200`} stroke="#e8c84a" strokeWidth={8} /></g>)}
        {/* 화덕 */}
        <path d="M 1180 1080 L 1180 560 C 1180 460 1560 460 1560 560 L 1560 1080 Z" fill="#5a4a40" stroke={INK} strokeWidth={8} />
        <path d="M 1260 900 L 1260 700 C 1260 640 1480 640 1480 700 L 1480 900 Z" fill="#ff8a3a" opacity={0.8 + 0.2 * Math.sin(f / 3)} />
      </svg>
      <Person L={{ robe: "#5a4636", dark: "#3e3026", trim: "#8a6a3e", hat: "porter", beard: "full", collar: "cross" }} x={800} y={940} h={520} arms="up" eyes="angry" mouth="grin" rot={up ? -4 : 2} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {/* 가죽 앞치마 */}
        <path d="M 730 700 L 870 700 L 880 900 L 720 900 Z" fill="#6a4a2e" stroke={INK} strokeWidth={5} opacity={0.9} />
        {/* 모루 + 달군 칼 (사람 앞) */}
        <path d="M 520 800 L 1000 800 L 960 860 L 880 860 L 880 1040 L 660 1040 L 660 860 L 560 860 Z" fill="#4a4e50" stroke={INK} strokeWidth={8} />
        <path d="M 600 780 L 1020 770 L 1050 785 L 1020 800 L 600 800 Z" fill="#ff9a4a" stroke={INK} strokeWidth={5} />
        <path d="M 520 790 L 600 790" stroke="#5a3a24" strokeWidth={22} strokeLinecap="round" />
      </svg>
      <Glow x={1370} y={780} r={520} color="#ff8a3a" op={0.55} />
      <Glow x={820} y={785} r={220} color="#ffb04a" op={0.5} />
      <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ position: "absolute", left: 800 - 150 + 70, top: 940 - 520 - 30 + (up ? -70 : 90), ...ink }}><g transform={`rotate(${up ? -50 : 20})`}><path d="M 0 0 L 0 -110" stroke="#7a5230" strokeWidth={16} /><rect x={-34} y={-140} width={68} height={36} rx={6} fill="#5a5e60" stroke={INK} strokeWidth={5} /></g></svg>
      {!up && Array.from({ length: 12 }).map((_, k) => { const a = (k / 12) * Math.PI - Math.PI; const r = 40 + ((f * 7 + k * 13) % 80); return <div key={k} style={{ position: "absolute", left: 860 + Math.cos(a) * r, top: 775 + Math.sin(a) * r * 0.7, width: 8, height: 8, borderRadius: "50%", background: "#ffd27a", boxShadow: "0 0 8px 3px rgba(255,180,80,.8)" }} />; })}
    </AbsoluteFill>
  );
};
// 영주들의 작전 회의: 어두운 방, 촛불, 탁자 위 펼친 지도, 몸을 숙인 영주들
// 공후들의 회의 2판 (2026-11-02 사용자 "그 뒤 장면이 뭘 의미하는지 모르겠어") - 몽골에 쫓긴 킵차크 사신이 루스 공후들 앞에 무릎 꿇고 지도의 동쪽을 가리키며 도움을 청함
const CouncilScene = ({ f, t }: { f: number; t: number }) => {
  const kneel = lerp(t, 0, 14, 0, 1, true);
  return (
    <AbsoluteFill style={{ background: "#1a1412" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <rect x={-40} y={-40} width={2000} height={1200} fill="#2a201a" />
        {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M ${i * 360} -40 L ${i * 360} 1120`} stroke="#221a14" strokeWidth={30} />)}
        {/* 정교회 성화 · 루스 깃발 */}
        <g transform="translate(960 160)"><rect x={-90} y={-110} width={180} height={220} rx={10} fill="#c9a24a" stroke={INK} strokeWidth={6} /><rect x={-70} y={-90} width={140} height={180} fill="#8a3b2c" stroke={INK} strokeWidth={4} /><circle cx={0} cy={-30} r={34} fill="#f2d27a" stroke={INK} strokeWidth={4} /></g>
        {[300, 1620].map((x) => <g key={x}><path d={`M ${x - 80} 60 L ${x + 80} 60 L ${x + 80} 380 L ${x} 340 L ${x - 80} 380 Z`} fill="#a8332a" stroke={INK} strokeWidth={6} /><path d={`M ${x} 100 L ${x} 300 M ${x - 46} 170 L ${x + 46} 170`} stroke="#e8c84a" strokeWidth={10} /></g>)}
      </svg>
      {/* 탁자 뒤 루스 공후들 (붉은·푸른 겉옷, 털 장식 모자, 수염) */}
      {[[560, "#8a2a2e"], [820, "#2e4a6a"], [1100, "#6a2a4a"], [1360, "#3a5a3a"]].map(([x, robe], i) => <Person key={i} L={{ robe: robe as string, dark: "#2a1e18", trim: "#c9a24a", hat: "fur", beard: i % 2 ? "full" : "long", collar: "round" }} x={x as number} y={820} h={500} arms={i === 2 ? "fist" : "down"} eyes={i === 1 ? "wide" : "worry"} mouth={i === 2 ? "o" : "frown"} t={f + i * 5} bow={0.12} />)}
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M 240 720 L 1680 720 L 1820 1080 L 100 1080 Z" fill="#5a3a24" stroke={INK} strokeWidth={8} />
        <path d="M 660 760 L 1260 750 L 1280 900 L 640 910 Z" fill="#e8d6a8" stroke={INK} strokeWidth={6} />
        <path d="M 700 860 C 800 820 900 840 980 810 M 1000 790 C 1100 810 1200 780 1260 800" stroke="#6f93a8" strokeWidth={6} fill="none" />
        <path d="M 1260 780 L 1040 830" stroke="#a8332a" strokeWidth={12} strokeDasharray="20 12" />
        <path d="M 1040 830 L 1076 806 L 1068 844 Z" fill="#a8332a" />
        {[[700, 800], [1200, 820]].map(([x, y], i) => <g key={i}><rect x={x - 12} y={y - 50} width={24} height={50} fill="#efe6d4" stroke={INK} strokeWidth={4} /><path d={`M ${x} ${y - 50} q -8 -14 0 -${26 + Math.sin(f / 3 + i) * 4} q 8 12 0 ${26 + Math.sin(f / 3 + i) * 4}`} fill="#ffcf6a" /></g>)}
      </svg>
      <Glow x={700} y={740} r={300} color="#ffcf6a" op={0.5 + 0.1 * Math.sin(f / 3)} />
      <Glow x={1200} y={760} r={300} color="#ffcf6a" op={0.5 + 0.1 * Math.sin(f / 3 + 1)} />
      {/* 앞: 무릎 꿇은 킵차크 사신 (털모자·갈색 옷, 지도의 동쪽을 가리킴) - 뒷모습 쪽 */}
      <Person L={{ robe: "#6a5440", dark: "#4e3e2e", trim: "#c9a24a", hat: "fur", beard: "thin", collar: "cross" }} x={1500} y={1100} h={560} arms="point" eyes="wide" mouth="talk" kneel={kneel > 0.5} t={f} flip />
    </AbsoluteFill>
  );
};
// 출정 2판 (2026-11-02 사용자: "군사들 나오는 거 너무 어색해") - 종이 울리는 나무 성벽 앞 길을 따라 병사 행렬이 옆으로 행군 (걸음 따라 들썩임, 붉은 깃발·북), 앞줄은 크게
const MusterScene = ({ f, t }: { f: number; t: number }) => (
  <AbsoluteFill>
    <Sky f={f} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><RusTown f={f} bell={1} /><rect x={-40} y={760} width={2000} height={340} fill="#5a4a36" /><path d="M -40 900 C 600 880 1300 900 1960 880 L 1960 980 C 1300 990 600 970 -40 990 Z" fill="#7a6648" /></svg>
    {/* 뒷줄 (작게, 성벽 바로 앞) */}
    {Array.from({ length: 12 }).map((_, k) => { const x = ((k * 170 + t * 4) % 2100) - 120; return <div key={`b${k}`} style={{ position: "absolute", left: 0, top: -Math.abs(Math.sin((t + k * 7) / 5)) * 6 }}><WestWarrior x={x} y={860} h={260} kind="rus" f={f} look={1} /></div>; })}
    {/* 깃발 든 기수 */}
    {[0, 1].map((k) => { const x = ((k * 1050 + t * 5) % 2100) - 120; return (
      <svg key={`fl${k}`} width={240} height={420} viewBox="-20 -400 240 420" style={{ position: "absolute", left: x - 20, top: 980 - 400 - Math.abs(Math.sin((t + k * 5) / 5)) * 8, ...ink }}>
        <path d="M 0 0 L 0 -380" stroke={INK} strokeWidth={9} /><path d="M 0 0 L 0 -380" stroke="#7a5230" strokeWidth={5} />
        <path d={`M 2 -376 L 170 ${-366 + Math.sin(f / 4 + k) * 10} L 170 ${-250 + Math.sin(f / 4 + k) * 10} L 2 -260 Z`} fill="#a8332a" stroke={INK} strokeWidth={5} />
        <circle cx={86} cy={-314} r={28} fill="#e8c84a" stroke={INK} strokeWidth={4} />
      </svg>
    ); })}
    {/* 앞줄 (크게) - 걸음마다 들썩임 */}
    {Array.from({ length: 6 }).map((_, k) => { const x = ((k * 360 + t * 5) % 2160) - 180; return <div key={`f${k}`} style={{ position: "absolute", left: 0, top: -Math.abs(Math.sin((t + k * 5) / 5)) * 10 }}><WestWarrior x={x} y={1110} h={480} kind="rus" f={f} look={1} /></div>; })}
  </AbsoluteFill>
);
// 화면 둘 전용 판 (2026-11-02 사용자: "각 나라 사진을 확대한 느낌이라 이상해, 두 개 크기에 맞게 다시 짜야") - 956×1080에 맞춰 처음부터 배치
const PW = 956;
const HalfSky = ({ f }: { f: number }) => (
  <>
    <AbsoluteFill style={{ background: RED_SKY }} />
    <svg width={PW} height={1080} style={{ position: "absolute", ...ink }}>{[[200, 120, 0.9], [700, 200, 1.0]].map(([x, y, sc], i) => <DarkCloud key={i} x={x} y={y} s={sc} f={f} />)}</svg>
  </>
);
const KipchakHalf = ({ f, t, sub }: { f: number; t: number; sub: number }) => (
  <AbsoluteFill>
    <HalfSky f={f} />
    <svg width={PW} height={1080} style={{ position: "absolute", ...ink }}>
      <path d={`M -20 600 C 300 570 600 590 ${PW + 20} 560 L ${PW + 20} 1100 L -20 1100 Z`} fill="#6a6a3e" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M ${(i * 131) % PW} ${640 + (i * 53) % 400} l -6 -14 m 6 14 l 0 -18 m 0 18 l 6 -14`} stroke="#4e5a2a" strokeWidth={3} fill="none" />)}
      <Kibitka x={160} y={640} s={0.9} />
      <Kibitka x={760} y={630} s={0.8} />
      <Kibitka x={470} y={600} s={0.55} />
    </svg>
    {/* 동쪽(오른쪽)에서 달려온 전령 */}
    <Horse x={lerp(t, 0, sub * 0.45, 1200, 760, true)} y={900} w={360} run={t < sub * 0.45} coat="#8a6440" dark="#6a4a2e" saddle="#5a3a24" flip><RiderOn L={{ robe: "#6a5440", dark: "#4e3e2e", trim: "#c9a24a", hat: "fur", beard: "thin", collar: "cross" }} arms="point" eyes="wide" mouth="o" t={f} /></Horse>
    {/* 전사 둘 · 가족 (모두 전령 쪽을 봄) */}
    <WestWarrior x={300} y={1010} h={500} kind="kipchak" f={f} look={0.9} />
    <WestWarrior x={500} y={1040} h={540} kind="kipchak" f={f} look={0.7} />
    <Person L={{ robe: "#6a7a5a", dark: "#4e5a40", trim: "#c9a24a", hat: "scarf", collar: "cross" }} x={110} y={1060} h={330} arms="sleeves" eyes="wide" mouth="o" />
    <Person L={{ robe: "#a87a4a", dark: "#7a5a36", trim: "#c9a24a", hat: "fur", collar: "cross" }} x={170} y={1070} h={210} arms="down" eyes="wide" mouth="o" />
  </AbsoluteFill>
);
const KnightHalf = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <HalfSky f={f} />
    <svg width={PW} height={1080} style={{ position: "absolute", ...ink }}>
      {/* 성: 가운데 높은 탑 + 양옆 성벽 */}
      <rect x={-20} y={360} width={PW + 40} height={300} fill="#7a766c" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 18 }).map((_, k) => <rect key={k} x={-14 + k * 56} y={334} width={34} height={28} fill="#7a766c" stroke={INK} strokeWidth={4} />)}
      <rect x={350} y={120} width={260} height={540} fill="#8a8478" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 5 }).map((_, k) => <rect key={`t${k}`} x={356 + k * 52} y={92} width={36} height={30} fill="#8a8478" stroke={INK} strokeWidth={5} />)}
      {Array.from({ length: 8 }).map((_, k) => <path key={`r${k}`} d={`M 350 ${170 + k * 60} L 610 ${170 + k * 60}`} stroke="#6e6a60" strokeWidth={3} />)}
      <path d="M 466 220 l 0 60 l 28 0 l 0 -60 Z" fill="#ffcf6a" opacity={0.7 + 0.3 * Math.sin(f / 5)} />
      <path d="M 420 660 L 420 520 C 420 460 540 460 540 520 L 540 660 Z" fill="#2a2018" stroke={INK} strokeWidth={6} />
      <path d="M 480 92 L 480 -20" stroke={INK} strokeWidth={7} />
      <path d={`M 482 -20 C 530 ${-30 + Math.sin(f / 5) * 8} 570 ${-6 - Math.sin(f / 5) * 8} 590 -10 L 580 24 C 550 28 520 14 482 30 Z`} fill="#efe9dc" stroke={INK} strokeWidth={4} />
      <path d="M 526 -20 L 526 26 M 500 4 L 556 4" stroke="#a8332a" strokeWidth={8} />
      <rect x={-20} y={660} width={PW + 40} height={440} fill="#4a4636" />
    </svg>
    <Fire x={160} y={720} s={1} />
    <Fire x={800} y={720} s={1} />
    {/* 기사 두 줄 */}
    {[160, 400, 640, 860].map((x, i) => <Knight key={`b${i}`} x={x} y={900} h={360} />)}
    {[280, 560, 820].map((x, i) => <Knight key={`f${i}`} x={x} y={1070} h={470} />)}
  </AbsoluteFill>
);
const Cut2: React.FC<{ f: number; d: number }> = ({ f, d }) => {
  // 3판 박자: 화면 둘 45% · 회의 30% · 출정 25%
  const B1 = d * 0.45, B2 = d * 0.75;
  const n = f < B1 ? 0 : f < B2 ? 1 : 2;
  const t = n === 0 ? f : n === 1 ? f - B1 : f - B2;
  const sub = n === 0 ? B1 : n === 1 ? B2 - B1 : d - B2;
  const op = n === 0 ? 1 : lerp(t, 0, 8, 0, 1);
  const zoom = lerp(t, 0, sub, 1.0, 1.06);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: op }}>
        {n === 0 && (
          <>
            {/* 화면 둘 (줄이지 않고 각 장면의 가운데만 크게 잘라 보여 줌) */}
            {[0, 1].map((k) => (
              <div key={k} style={{ position: "absolute", left: k * 964, top: 0, width: 956, height: 1080, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 1080, transform: `scale(${zoom})`, transformOrigin: "50% 80%" }}>
                  {k === 0 ? <KipchakHalf f={f} t={t} sub={sub} /> : <KnightHalf f={f} />}
                </div>
              </div>
            ))}
            <div style={{ position: "absolute", left: 954, top: 0, width: 12, height: 1080, background: INK }} />
          </>
        )}
        {n === 1 && <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "60% 70%" }}><CouncilScene f={f} t={t} /></AbsoluteFill>}
        {n === 2 && <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}><MusterScene f={f} t={t} /></AbsoluteFill>}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.5))" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// ③ 2판 (2026-11-02 사용자: "제베랑 수부타이가 진격하는 거 너무 저퀄리티, 아예 새롭게") - 두 컷
//   A 새벽 캅카스 벼랑 위: 제베·수부타이가 크게 서서 서쪽(오른쪽)을 내려다봄, 뒤로 두 사람의 툭이 바람에 펄럭임, 눈발 ·
//     아래 골짜기엔 기병 2만 명이 강물처럼 굽이쳐 지평선까지 (작은 그림 수백 개를 한 svg에)
//   B 땅에 붙은 낮은 카메라: 큰 기병들이 화면 앞을 우레처럼 지나감 (먼 줄·가운데 줄·가까운 줄 속도 다르게), 먼지, 툭
const VALLEY = (u: number) => {
  // 골짜기 길: 왼쪽 아래(벼랑 밑) → 오른쪽 지평선
  const x = 760 + u * 1300 + Math.sin(u * 7) * 140 * (1 - u);
  const y = 1000 - u * 470 + Math.sin(u * 5) * 30;
  return [x, y];
};
const Cut3: React.FC<{ f: number; d: number }> = ({ f, d }) => {
  const A = d * 0.5;
  if (f < A + 8) {
    const z = lerp(f, 0, A, 1.08, 1.0);
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Cam z={z} cx={960} cy={560}>
          <AbsoluteFill style={{ background: "linear-gradient(#4a5a7a, #c8a0a0 40%, #f0c890 58%, #f4dcb0 70%)" }} />
          <div style={{ position: "absolute", left: 1500, top: 380, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(#fff4d0, #f6c062 50%, transparent 70%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {/* 먼 산줄기 (옅게) → 가운데 눈 덮인 봉우리 (음영) */}
            <path d="M -40 560 L 160 400 L 330 470 L 520 330 L 700 450 L 900 360 L 1100 470 L 1300 380 L 1500 470 L 1700 400 L 1960 480 L 1960 700 L -40 700 Z" fill="#9aa4b8" opacity={0.7} />
            <path d="M 400 700 L 640 300 L 880 700 Z M 1000 700 L 1260 260 L 1520 700 Z M 1460 700 L 1680 380 L 1900 700 Z" fill="#7a7a8e" stroke={INK} strokeWidth={5} />
            <path d="M 640 300 L 880 700 L 700 700 Z M 1260 260 L 1520 700 L 1320 700 Z M 1680 380 L 1900 700 L 1740 700 Z" fill="#5e5e72" />
            {[[640, 300], [1260, 260], [1680, 380]].map(([x, y], k) => <path key={k} d={`M ${x} ${y} L ${x - 70} ${y + 120} L ${x - 30} ${y + 100} L ${x} ${y + 140} L ${x + 30} ${y + 96} L ${x + 76} ${y + 126} Z`} fill="#f4f2ec" stroke={INK} strokeWidth={4} />)}
            {/* 골짜기 바닥 */}
            <path d="M 500 1100 C 700 900 1100 720 1960 520 L 1960 1100 Z" fill="#b8a888" />
            {/* 굽이치는 기병 강 (수백 기) */}
            {Array.from({ length: 260 }).map((_, k) => {
              const u = ((k / 260) + f * 0.0016) % 1;
              const [x, y] = VALLEY(u);
              const sc = 1.6 - u * 1.3;
              return <g key={k} transform={`translate(${x + ((k * 37) % 7 - 3) * 18 * sc} ${y + ((k * 53) % 5 - 2) * 10 * sc})`}><MoG x={0} y={0} s={sc} /></g>;
            })}
            {/* 먼지 띠 */}
            <path d={"M " + Array.from({ length: 30 }).map((_, k) => VALLEY(k / 29).join(" ")).join(" L ")} stroke="#e8d8b0" strokeWidth={90} fill="none" opacity={0.25} strokeLinecap="round" />
            {/* 앞 벼랑 (어두운 바위, 결) */}
            <path d="M -40 1100 L -40 880 C 160 840 420 850 600 900 C 720 940 780 1000 800 1100 Z" fill="#3e3630" stroke={INK} strokeWidth={6} />
            {[[60, 700], [200, 690], [340, 720], [120, 820], [300, 860], [480, 900]].map(([x, y], k) => <path key={k} d={`M ${x} ${y} l 40 20 l -10 30`} stroke="#2a2420" strokeWidth={5} fill="none" />)}
          </svg>
          {/* 두 사람의 툭 (바람에 크게) */}
          {[150, 560].map((x, k) => <div key={x} style={{ position: "absolute", inset: 0, transform: "scale(1.6)", transformOrigin: `${x}px 700px` }}><Tug x={x} y={700} h={420} sway={Math.sin((f + k * 9) / 7) * 10} /></div>)}
          {/* 제베 · 수부타이 (노을 쪽 테두리 빛) */}
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(6px 0 0 rgba(255,200,120,.7))" }}>
            <Char id="jebe" x={260} h={900} pose="side" bottom={1080 - 1000} enter="none" beat="none" />
            <Char id="subutai" x={580} h={870} pose="side" bottom={1080 - 990} enter="none" beat="none" />
          </div>
          {Array.from({ length: 50 }).map((_, k) => { const t = ((f * 1.4 + k * 13) % 70) / 70; return <div key={`sn${k}`} style={{ position: "absolute", left: ((k * 97) % 1920) + t * 200, top: t * 1080, width: 5, height: 5, borderRadius: "50%", background: "#fff", opacity: 0.8 }} />; })}
        </Cam>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45))" }} />
      </AbsoluteFill>
    );
  }
  // B 낮은 카메라: 큰 기병들이 화면 앞을 우레처럼 지나감
  const t = f - A;
  const rows = [
    { y: 560, w: 180, sp: 9, n: 12, k: "far" },
    { y: 640, w: 340, sp: 16, n: 8, k: "mid" },
    { y: 760, w: 640, sp: 30, n: 5, k: "near" },
  ];
  return (
    <AbsoluteFill style={{ background: "#000", opacity: lerp(t, 0, 8, 0, 1) }}>
      <AbsoluteFill style={{ background: "linear-gradient(#c8a0a0, #f0c890 52%, #c9ad74 52%, #a88c56)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M -40 560 L 300 460 L 600 520 L 900 430 L 1200 510 L 1500 440 L 1960 520 L 1960 600 L -40 600 Z" fill="#8a8a9a" opacity={0.7} />
        {Array.from({ length: 30 }).map((_, k) => { const x = ((k * 160 - t * 40) % 2200 + 2200) % 2200 - 140; return <path key={k} d={`M ${x} ${900 + (k % 4) * 40} l 120 0`} stroke="#8a6e44" strokeWidth={5} opacity={0.6} />; })}
      </svg>
      {rows.map((r, ri) => (
        <React.Fragment key={ri}>
          {Array.from({ length: r.n }).map((_, k) => {
            const span = 1920 + r.w * 2;
            const x = (((k * (span / r.n)) + t * r.sp) % span) - r.w;
            return (
              <React.Fragment key={k}>
                <Dust x={x + r.w * 0.15} y={r.y + r.w * 0.62} t={((f + k * 5 + ri * 7) % 18) / 18} r={r.w * 0.3} color="#d8bd88" />
                <Rider kind={(k + ri) % 2 ? "mongol" : "mongol2"} x={x} y={r.y} w={r.w} phase={k * 3 + ri} />
                {ri === 1 && k % 3 === 0 && <Tug x={x + r.w * 0.5} y={r.y + r.w * 0.25} h={r.w * 1.2} sway={Math.sin((f + k) / 5) * 8} />}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.4))" }} />
    </AbsoluteFill>
  );
};
const Cut4: React.FC<{ f: number; d: number }> = ({ f, d }) => (
  // ④ 노을 속 서쪽 초원으로 내려가는 기병 행렬 실루엣 → 검게
  <AbsoluteFill>
    <Cam z={lerp(f, 0, d, 1.0, 1.1)} cx={900} cy={560}>
      <AbsoluteFill style={{ background: "linear-gradient(#3a2030, #a8503a 50%, #f0a060 70%)" }} />
      <div style={{ position: "absolute", left: 300, top: 560, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(#ffe0a0, #f08a40 55%, transparent 70%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M -40 720 C 400 680 900 700 1960 650 L 1960 1100 L -40 1100 Z" fill="#1a1210" />
      </svg>
      {Array.from({ length: 30 }).map((_, i) => {
        const x = 1960 - ((i * 80 + f * 3) % 2200);
        return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={640 - (1960 - x) * 0.02} w={110} flip dark phase={i * 3} />;
      })}
      {[0, 1, 2].map((i) => { const x = 1960 - ((i * 700 + f * 3) % 2200); return <Tug key={i} x={x + 40} y={720 - (1960 - x) * 0.02} h={200} color="#1a1210" sway={Math.sin((f + i * 9) / 10) * 4} />; })}
    </Cam>
  </AbsoluteFill>
);
const Shot: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2)), a3 = at(id(3)), a4 = at(id(4));
  const cuts = [[0, a2], [a2, a3], [a3, a4], [a4, frames]];
  const xf = (t0: number) => lerp(f, t0 - 8, t0 + 8, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < a2 + 8 && <Cut1 f={f} d={a2} />}
      {f >= a2 - 8 && f < a3 + 8 && <AbsoluteFill style={{ opacity: xf(a2) }}><Cut2 f={f - a2} d={a3 - a2} /></AbsoluteFill>}
      {f >= a3 - 8 && f < a4 + 8 && <AbsoluteFill style={{ opacity: xf(a3) }}><Cut3 f={f - a3} d={a4 - a3} /></AbsoluteFill>}
      {f >= a4 - 8 && <AbsoluteFill style={{ opacity: xf(a4) }}><Cut4 f={f - a4} d={frames - a4} /></AbsoluteFill>}
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 40, frames, 0, 1) }} />
      <SFX name="war_horn" at={10} vol={0.3} dur={60} fade={10} />
      <SFX name="wind" at={a2} vol={0.3} dur={a3 - a2} fade={20} />
      <SFX name="hooves" at={a2 + 4} vol={0.2} dur={40} />
      <SFX name="war_drums" at={a2} vol={0.2} dur={Math.round((a3 - a2) * 0.45)} fade={10} />
      <SFX name="crowd" at={a2 + Math.round((a3 - a2) * 0.45)} vol={0.15} dur={Math.round((a3 - a2) * 0.3)} fade={10} />
      <SFX name="bells" at={a2 + Math.round((a3 - a2) * 0.75)} vol={0.3} dur={Math.round((a3 - a2) * 0.25) + 10} fade={10} />
      <SFX name="march" at={a2 + Math.round((a3 - a2) * 0.75)} vol={0.25} dur={Math.round((a3 - a2) * 0.25) + 10} fade={10} />
      <SFX name="cavalry" at={a3} vol={0.35} dur={frames - a3} fade={30} />
      <SFX name="war_horn" at={a3 + 10} vol={0.35} dur={70} fade={10} />
      {void cuts}
    </AbsoluteFill>
  );
};

// ================= 20초 고정 엔딩 (1편과 같은 판, 2편부터 칸 옆에 수부타이) =================
export const ENDING_FRAMES = 600;
const Ending = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam z={lerp(f, 0, ENDING_FRAMES, 1.0, 1.03)} cx={600} cy={700}>
        <AbsoluteFill style={{ background: "linear-gradient(#0e1424, #1d2638 45%, #4a3a3a 68%, #8a5a3e 74%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 137) % 560} r={i % 6 ? 1.3 : 2.2} fill="#e8e2cf" opacity={(0.25 + (i % 4) * 0.12) * (0.75 + 0.25 * Math.sin(f / 30 + i))} />)}
        </svg>
        <Glow x={300} y={800} r={700} color="#d9824a" op={0.35} />
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <path d="M -40 800 C 200 780 420 690 600 690 C 780 690 900 770 1100 790 C 1400 815 1700 800 1960 795 L 1960 1080 L -40 1080 Z" fill="#14110e" stroke="#0a0806" strokeWidth={4} />
        </svg>
        <div style={{ position: "absolute", inset: 0, filter: "brightness(0.8)" }}>
          <Tug x={800} y={704} h={430} sway={Math.sin(f / 22) * 6} />
        </div>
        {/* 칸 + 옆에 수부타이 (어둡게 눌러 색만 살짝, 노을 쪽 가장자리 빛) */}
        <div style={{ position: "absolute", inset: 0, filter: "brightness(0.3) saturate(1.4) drop-shadow(-4px 0 0 rgba(240,150,90,0.75)) drop-shadow(-2px -2px 3px rgba(255,190,120,0.5))" }}>
          <Char id="subutai" x={420} h={360} pose="side" bottom={1080 - 712} enter="none" beat="none" />
          <Char id="genghis" x={620} h={400} pose="side" bottom={1080 - 700} enter="none" beat="none" />
        </div>
      </Cam>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5))" }} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [0, 36], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [{ ids: [id(1), id(2), id(3), id(4)], Shot }];
export const M02_CH5_FRAMES = chapterFrames("m2.5") + ENDING_FRAMES;
export const M02Ch5 = ({ lang }: { lang?: Lang }) => {
  const total = chapterFrames("m2.5");
  const body = (
    <AbsoluteFill>
      <Sequence durationInFrames={total}><Chapter ch="m2.5" year="1221" groups={groups} music="main" /></Sequence>
      <Sequence from={total} durationInFrames={ENDING_FRAMES}>
        <Ending />
        <Snd src={staticFile("bgm/ending.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
  return lang ? <LangContext.Provider value={lang}>{body}</LangContext.Provider> : body;
};
