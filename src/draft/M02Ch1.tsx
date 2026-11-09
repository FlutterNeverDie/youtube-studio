// 몽골 2편 1장 "군대 배치" 1판 (2026-11-02) - 대본 episodes/mongol-02/script-ko.md "## 1." (c1_01~c1_19, kit에서는 m2.c1_01…)
// check-draft: 이름만 칭기즈칸 (본대를 가리킬 때 이름만 나옴 - 화면은 흰 툭 아래 본대)
// 방법론: 호라즘은 군대를 쪼개 성 안에 넣음 → 몽골은 네 갈래로 동시에, 성마다 따로 상대(각개격파) → 오트라르 5개월 → 본대는 사막으로
// 사용자(2026-11-02): 훅의 투석기처럼 단순한 그림 말고 고퀄리티로 - 대군은 줄줄이 빽빽하게, 지도는 병사 그림 수백 개로, 모형은 움직임이 이어지게
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { BigNum, Char, Chapter, clamp, Dim, ease, Fire, FPS, Ger, Glow, Group, INK, Lang, LangContext, Paper, Rider, SFX, ShotProps, Stars, Tug, tl } from "./kit";
import { Cam, Dust, Smoke } from "./M01Ch4";
import { KH_CITIES, KhFlag, MapBoard, MapCam, MX, MY, Spearman } from "./M01Ch5";
import { City, Dome, SAND, SAND_D, SAND_DD, Tower, WallStrip } from "./M02City";

const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
const sec = (s: number) => Math.round(s * FPS);
const id = (n: number) => `m2.c1_${String(n).padStart(2, "0")}`;
export const P = (lon: number, lat: number) => [MX(lon), MY(lat)];
export const KG = "#2e6b4f"; // 호라즘 초록
export const MB = "#3f5f86"; // 몽골 파랑

// ================= 지도 위 작은 병사 그림 =================
// 호라즘 창병 (발 = 0,0, 키 약 24)
export const KhG = ({ x, y, s = 1, c = KG }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 6 2 L 6 -26" stroke={INK} strokeWidth={1.8} />
    <path d="M -5 0 L -6 -11 C -6 -14 6 -14 6 -11 L 5 0 Z" fill={c} stroke={INK} strokeWidth={1.6} />
    <circle cx={0} cy={-17} r={4.4} fill="#e8c9a0" stroke={INK} strokeWidth={1.4} />
    <path d="M -4.6 -18 C -4 -24 4 -24 4.6 -18 Z" fill="#efe6d4" stroke={INK} strokeWidth={1.2} />
  </g>
);
// 몽골 기병 (발 = 0,0, 길이 약 26)
export const MoG = ({ x, y, s = 1, c = MB, flip = false }: { x: number; y: number; s?: number; c?: string; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -9 0 L -8 -7 M 7 0 L 8 -7" stroke={INK} strokeWidth={2} />
    <ellipse cx={0} cy={-9} rx={11} ry={5} fill="#7a5530" stroke={INK} strokeWidth={1.5} />
    <path d="M 9 -11 L 14 -17 L 16 -14 Z" fill="#7a5530" stroke={INK} strokeWidth={1.3} />
    <path d="M -3 -12 L -2 -19 L 3 -19 L 3 -12 Z" fill={c} stroke={INK} strokeWidth={1.3} />
    <circle cx={0.5} cy={-22} r={3.6} fill="#e8c9a0" stroke={INK} strokeWidth={1.3} />
    <path d="M -3.4 -23 C -3 -28 4 -28 4.4 -23 Z" fill="#8a3b2c" stroke={INK} strokeWidth={1.1} />
  </g>
);
// 무리: n명을 가운데 (x,y)에 촘촘히 (gap 간격)
export const grid = (n: number, gap: number) => {
  const w = Math.max(1, Math.ceil(Math.sqrt(n * 1.7)));
  const h = Math.ceil(n / w);
  return Array.from({ length: n }).map((_, i) => [((i % w) - (w - 1) / 2) * gap + (Math.floor(i / w) % 2) * gap * 0.4, (Math.floor(i / w) - (h - 1) / 2) * gap * 0.62]);
};
export const Troop = ({ x, y, n, kind = "kh", s = 1, op = 1 }: { x: number; y: number; n: number; kind?: "kh" | "mo"; s?: number; op?: number }) => (
  <g opacity={op}>
    {grid(n, kind === "kh" ? 12 * s : 22 * s).map(([dx, dy], i) => (kind === "kh" ? <KhG key={i} x={x + dx} y={y + dy} s={s} /> : <MoG key={i} x={x + dx} y={y + dy} s={s} />))}
  </g>
);
// 선 위의 점 (pts 꺾은선, t 0~1)
export const along = (pts: number[][], t: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = k01(t) * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const u = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
export const smoothD = (pts: number[][]) => "M " + pts.map((p) => p.join(" ")).join(" L ");

// ================= 1장 지도 =================
// 호라즘 군대 조각: 도시마다 (KH_CITIES 순서: 우르겐치·사마르칸트·부하라·니샤푸르·헤라트·레이·오트라르) 병사 수(그림 개수, 크기만 비교 - 실제 숫자 아님)
const PIECES = [34, 56, 40, 16, 16, 12, 28];
export const SAMK = KH_CITIES[1];
const PRE = [[-150, -70], [0, -80], [150, -70], [-140, 50], [0, 40], [140, 50], [0, 140]]; // 쪼개지기 전 한 덩어리 안의 자리
const START = P(80.5, 44.4); // 몽골군이 들어오는 동쪽
const GATHER = P(72.6, 43.4);
export const OTRAR = KH_CITIES[6];
const PRONG = [
  [GATHER, P(70.5, 43.3), [OTRAR[0] + 40, OTRAR[1] - 10]], // ① 오트라르
  [GATHER, P(71.4, 42.2), P(70.4, 41.1), P(69.6, 40.3)], // ② 강을 거슬러 남쪽(베나카트·후잔트) - 2026-11-02 대사 순서에 맞춰 ②③ 바꿈
  [GATHER, P(70, 43.6), P(67.6, 43.7), P(66.2, 44.3), P(65, 44.7)], // ③ 강을 따라 북쪽 하류(잔드 쪽)
  [GATHER, P(70.6, 42.7), P(68.4, 42.5), P(66.4, 42.4), P(64.8, 42.2)], // ④ 본대 - 시르다리야를 건너 키질쿰 사막 안으로 (부하라 쪽)
];
export const KHUJAND = P(69.6, 40.3);
export const KYZYL = [P(62.0, 43.6), P(62.8, 44.1), P(63.6, 44.3), P(64.8, 44.3), P(65.8, 44.1), P(66.8, 43.6), P(67.6, 42.8), P(67.6, 42.0), P(67.0, 41.3), P(66.0, 41.0), P(64.8, 41.0), P(63.6, 41.1), P(62.7, 41.6), P(62.0, 42.3), P(61.9, 42.9), P(62.0, 43.6)];
export const JAND = P(65, 44.7);
type MapState = {
  split?: number; // 0 한 덩어리 → 1 도시마다
  cut?: number; // 조각 사이 잇는 선 끊기
  mongol?: number; // 동쪽에서 들어와 모임
  prong?: number[]; // 네 갈래 진행
  fog?: number; // ④ 안개 속으로
  rings?: number[]; // 도시마다 몽골 고리 (KH_CITIES 순서 + 7 후잔트 + 8 잔드)
  otrarSmall?: number; // 오트라르 고리가 작아짐 (일부만 남김)
  onward?: number; // 나머지가 다음 도시로
  kh?: number;
};
const Ring = ({ c, r, n, f, op = 1 }: { c: number[]; r: number; n: number; f: number; op?: number }) => (
  <g opacity={op}>
    <ellipse cx={c[0]} cy={c[1]} rx={r} ry={r * 0.62} fill="none" stroke={MB} strokeWidth={4} strokeDasharray="10 8" opacity={0.5} />
    {Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + f * 0.006;
      return <MoG key={i} x={c[0] + Math.cos(a) * r} y={c[1] + Math.sin(a) * r * 0.62 + 10} s={0.95} flip={Math.sin(a) > 0} />;
    })}
  </g>
);
const RING_AT = [...KH_CITIES, KHUJAND, JAND];
export const M1Map = ({ f, st }: { f: number; st: MapState }) => {
  const { split = 0, cut = 0, mongol = 0, prong = [0, 0, 0, 0], fog = 0, rings = [], otrarSmall = 0, onward = 0, kh = 1 } = st;
  return (
    <>
      <MapBoard kh={kh} mg={0.45} />
      {/* 키질쿰 사막 (2026-11-02 사용자: 호라즘 땅이 초록뿐이라 본대가 사막으로 들어가는 게 헷갈림 → 시르다리야·아무다리야 사이를 모래색으로) */}
      <svg width={3200} height={1440} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
        <path d={smoothD(KYZYL)} fill="#e9cf92" stroke="#b39a62" strokeWidth={5} strokeDasharray="14 10" opacity={0.95} />
        {Array.from({ length: 40 }).map((_, i) => {
          const x = MX(61.8 + ((i * 37) % 60) / 10), y = MY(40.7 + ((i * 53) % 34) / 10);
          return <circle key={i} cx={x} cy={y} r={3.2} fill="#b39a62" opacity={0.8} />;
        })}
        {[[63.2, 43.1], [64.8, 42.6], [66.2, 41.7], [63.6, 41.6], [65.4, 43.6], [62.4, 42.4], [66.6, 42.8]].map(([lo, la], i) => (
          <path key={`d${i}`} d={`M ${MX(lo) - 40} ${MY(la)} q 20 -14 40 0 q 20 -14 40 0`} stroke="#b39a62" strokeWidth={5} fill="none" />
        ))}
      </svg>
      <svg width={3200} height={1440} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
        {/* 조각 사이를 잇는 지휘선: 한 사람이 묶지 않음 → 가운데부터 끊김 */}
        {split > 0.95 && KH_CITIES.map((a, i) => {
          if (i === 1) return null;
          const b = SAMK;
          const g = k01(cut * 1.6 - i * 0.1);
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          return (
            <g key={i} opacity={1 - g * 0.6}>
              <path d={`M ${a[0]} ${a[1] - 30} L ${mx + (a[0] - mx) * g * 0.6} ${my - 30 + (a[1] - my) * g * 0.6}`} stroke={KG} strokeWidth={5} strokeDasharray="12 8" />
              <path d={`M ${b[0]} ${b[1] - 30} L ${mx + (b[0] - mx) * g * 0.6} ${my - 30 + (b[1] - my) * g * 0.6}`} stroke={KG} strokeWidth={5} strokeDasharray="12 8" />
            </g>
          );
        })}
        {/* 호라즘 조각들 */}
        {PIECES.map((n, i) => {
          const t = k01(split * 1.5 - i * 0.07);
          const e = ease(t);
          const to = KH_CITIES[i];
          const x = SAMK[0] + PRE[i][0] + (to[0] - SAMK[0] - PRE[i][0]) * e;
          const y = SAMK[1] - 40 + PRE[i][1] + (to[1] + 58 - SAMK[1] + 40 - PRE[i][1]) * e - Math.sin(t * Math.PI) * 60;
          return <Troop key={i} x={x} y={y} n={n} />;
        })}
        {/* 몽골군 */}
        {mongol > 0 && prong.every((p) => p <= 0) && (() => {
          const c = [START[0] + (GATHER[0] - START[0]) * ease(mongol), START[1] + (GATHER[1] - START[1]) * ease(mongol)];
          return <Troop x={c[0]} y={c[1]} n={36} kind="mo" />;
        })()}
        {PRONG.map((pts, i) => {
          const t = prong[i];
          if (t <= 0) return null;
          const head = along(pts, t);
          const isFog = i === 3;
          return (
            <g key={i} opacity={isFog ? 1 - fog : 1}>
              {isFog && <path d={smoothD(pts)} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - t} />}
              <path d={smoothD(pts)} stroke={isFog ? "#f2ead8" : MB} strokeWidth={isFog ? 11 : 9} fill="none" strokeLinecap="round" strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - t} opacity={isFog ? 1 : 0.75} />
              <Troop x={head[0]} y={head[1]} n={i === 3 ? 14 : 9} kind="mo" />
            </g>
          );
        })}
        {/* 나머지가 다음 도시로 (오트라르에서 남쪽 도시들로) */}
        {onward > 0 && [[OTRAR, KHUJAND], [OTRAR, KH_CITIES[1]], [JAND, KH_CITIES[0]]].map(([a, b], i) => {
          const m = [(a[0] + b[0]) / 2 + 30, (a[1] + b[1]) / 2];
          const pts = [a, m, b];
          const t = k01(onward * 1.3 - i * 0.15);
          const h = along(pts, t);
          return (
            <g key={`o${i}`}>
              <path d={smoothD(pts)} stroke={MB} strokeWidth={8} fill="none" strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - t} opacity={0.7} strokeLinecap="round" />
              {t > 0 && <Troop x={h[0]} y={h[1]} n={8} kind="mo" />}
            </g>
          );
        })}
      </svg>
      {/* 고리 (도시마다) */}
      <svg width={3200} height={1440} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
        {rings.map((a, i) => (a > 0 ? <Ring key={i} c={[RING_AT[i][0], RING_AT[i][1] - 20]} r={i === 6 ? 90 - otrarSmall * 40 : 70} n={i === 6 ? Math.round(14 - otrarSmall * 9) : 9} f={f + i * 40} op={a} /> : null))}
      </svg>
      {/* ④ 안개 (사막) */}
      {fog > 0 && [[67.4, 41.6, 260], [66, 42.2, 300], [68.6, 41.4, 200]].map(([lo, la, r], i) => (
        <div key={i} style={{ position: "absolute", left: MX(lo) - r, top: MY(la) - r * 0.6, width: r * 2, height: r * 1.2, borderRadius: "50%", background: "radial-gradient(rgba(245,238,220,.95), rgba(245,238,220,0) 70%)", opacity: fog }} />
      ))}
    </>
  );
};
export const MapShot = ({ f, st, z, cx, cy }: { f: number; st: MapState; z: number; cx: number; cy: number }) => (
  <AbsoluteFill style={{ background: "#c3cbbd" }}>
    <MapCam z={z} cx={cx} cy={cy}>
      <M1Map f={f} st={st} />
    </MapCam>
  </AbsoluteFill>
);
export const MAP_C = { z: 1.75, cx: MX(64), cy: MY(40.6) };
export const MAP_E = { z: 2.1, cx: MX(68.4), cy: MY(42.3) };

// ================= 코끼리 (호라즘 대군, 등에 가마) - 오른쪽을 봄, 발 = 0 =================
export const Elephant = ({ x, y, w = 300, f = 0 }: { x: number; y: number; w?: number; f?: number }) => {
  const s = w / 300;
  const sw = Math.sin(f / 12) * 6;
  return (
    <svg width={340 * s} height={330 * s} viewBox="-150 -310 340 330" style={{ position: "absolute", left: x - 150 * s, top: y - 310 * s, ...ink }}>
      <ellipse cx={10} cy={6} rx={140} ry={12} fill="rgba(43,29,20,0.2)" />
      {[-90, -40, 40, 90].map((lx, i) => <rect key={i} x={lx - 20} y={-90} width={40} height={92} rx={10} fill={i % 3 ? "#8d8a84" : "#7a7772"} stroke={INK} strokeWidth={5} />)}
      <ellipse cx={0} cy={-130} rx={130} ry={82} fill="#9a9690" stroke={INK} strokeWidth={6} />
      <path d={`M 110 -150 C 150 -150 170 -110 160 -60 C 154 -20 150 0 ${158 + sw} 4`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d={`M 110 -150 C 150 -150 170 -110 160 -60 C 154 -20 150 0 ${158 + sw} 4`} stroke="#9a9690" strokeWidth={20} fill="none" strokeLinecap="round" />
      <circle cx={118} cy={-160} r={52} fill="#9a9690" stroke={INK} strokeWidth={6} />
      <path d="M 90 -200 C 50 -200 40 -120 80 -110 C 96 -130 100 -170 90 -200 Z" fill="#87837e" stroke={INK} strokeWidth={5} />
      <circle cx={138} cy={-172} r={5} fill={INK} />
      <path d="M 142 -128 C 168 -120 180 -104 182 -90" stroke="#f4eee0" strokeWidth={9} fill="none" strokeLinecap="round" />
      {/* 가마 */}
      <path d="M -70 -200 L 60 -200 L 50 -260 L -60 -260 Z" fill="#a8332a" stroke={INK} strokeWidth={5} />
      <path d="M -80 -205 L 70 -205" stroke="#d9a92e" strokeWidth={9} />
      <path d="M -66 -260 C -40 -300 40 -300 56 -260 Z" fill={KG} stroke={INK} strokeWidth={5} />
      <path d="M -110 -150 C -40 -180 40 -180 100 -150 L 90 -120 C 30 -140 -40 -140 -100 -120 Z" fill="#c9a24a" stroke={INK} strokeWidth={4} opacity={0.9} />
    </svg>
  );
};

// ================= 1) c1_01~03 화면 반 나누기 (2026-11-02 사용자 "재미가 없다, 화면을 반 나눠서 한쪽은 들판에서 싸우고 한쪽은 성에서 싸우는 걸 순서대로") =================
// "두 가지 길" → 왼쪽 들판 전투가 먼저 살아 움직임 → 오른쪽 성벽 방어가 이어서 → "성을 골랐습니다"에서 오른쪽이 화면 전체로 커지며 성문이 닫힘
// 깜빡임 주의 (1판 사고): 먹선 필터를 단 그림 수백 개를 한 화면에 그리면 크롬이 화면 오른쪽 조각을 몇 프레임씩 비움 → 그림 수를 수십 개로 제한
const HALF = 960;
const ARROWS = (f: number, from: number[][], to: number[][], n: number, seed = 0) =>
  Array.from({ length: n }).map((_, i) => {
    const a = from[i % from.length], b = to[(i * 3 + seed) % to.length];
    const t = ((f * 1.6 + i * 13 + seed * 7) % 36) / 36;
    const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * 120;
    const ang = (Math.atan2(b[1] - a[1] - Math.cos(t * Math.PI) * 120 * Math.PI, b[0] - a[0]) * 180) / Math.PI;
    return <path key={i} d={`M ${x} ${y} l ${Math.cos((ang * Math.PI) / 180) * 30} ${Math.sin((ang * Math.PI) / 180) * 30}`} stroke={INK} strokeWidth={3.5} opacity={t > 0.05 && t < 0.95 ? 1 : 0} />;
  });
// 왼쪽: 들판 전투 - 위에서 비스듬히 내려다봄 (2026-11-02 사용자 3차: "너무 저퀄, 둘러싸던가")
// 가운데 빽빽한 호라즘 방진(창병·코끼리 둘) 둘레를 몽골 기병 두 겹이 빙빙 돌며 사방에서 화살 - 먼지 띠가 고리를 따라 일어남
// 그림은 한 svg 안에 (깜빡임 방지)
const FC = [480, 640];
const FieldFight = ({ f, live }: { f: number; live: number }) => {
  const g = Math.max(0, f) * live;
  const rot = g * 0.022;
  const rings = [{ rx: 330, ry: 190, n: 16, sp: 1 }, { rx: 420, ry: 250, n: 20, sp: 0.75 }];
  const riders = rings.flatMap((r, k) => Array.from({ length: r.n }).map((_, i) => {
    const a = (i / r.n) * Math.PI * 2 + rot * r.sp + k * 0.3;
    return { x: FC[0] + Math.cos(a) * r.rx, y: FC[1] + Math.sin(a) * r.ry, a, k };
  }));
  const kh = grid(96, 26).map(([dx, dy], i) => ({ x: FC[0] + dx * (1 - live * 0.08), y: FC[1] + dy * 0.9 * (1 - live * 0.08) + 10, i }));
  return (
    <AbsoluteFill style={{ transform: "scale(1.32)", transformOrigin: "50% 60%" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #d9c08a, #c4a76c 70%, #a88c56)", transform: "scale(1.5)" }} />
      {/* 먼지 띠 */}
      {live > 0 && riders.map((r, i) => (i % 2 ? null : <div key={`d${i}`} style={{ position: "absolute", left: r.x - 90, top: r.y - 50, width: 180, height: 110, borderRadius: "50%", background: "radial-gradient(rgba(214,196,150,.85), transparent 70%)", opacity: 0.55 * live }} />))}
      <svg width={HALF} height={1080} style={{ position: "absolute", ...ink }}>
        {/* 땅 자국 (말발굽 고리) */}
        {rings.map((r, k) => <ellipse key={k} cx={FC[0]} cy={FC[1] + 20} rx={r.rx} ry={r.ry} fill="none" stroke="#a88c56" strokeWidth={34} opacity={0.35} />)}
        {/* 뒤쪽 기병 (방진보다 위) */}
        {riders.filter((r) => Math.sin(r.a) < 0).map((r, i) => <MoG key={`b${i}`} x={r.x} y={r.y} s={2.6 - r.k * 0.2} flip={Math.cos(r.a + Math.PI / 2) < 0} />)}
        {/* 호라즘 방진 */}
        {kh.map((p) => {
          const down = live > 0 && rnd(p.i, 9) < Math.min(0.35, g / 300);
          return down ? <g key={p.i} transform={`translate(${p.x} ${p.y}) rotate(80)`}><KhG x={0} y={0} s={2.1} /></g> : <KhG key={p.i} x={p.x} y={p.y} s={2.1} c={["#2e6b4f", "#6a3a2e", "#4a4a5a"][p.i % 3]} />;
        })}
        {/* 앞쪽 기병 */}
        {riders.filter((r) => Math.sin(r.a) >= 0).map((r, i) => <MoG key={`f${i}`} x={r.x} y={r.y} s={3 - r.k * 0.3} flip={Math.cos(r.a + Math.PI / 2) < 0} />)}
      </svg>
      <Elephant x={FC[0] - 90} y={FC[1] - 40} w={130} f={g} />
      <Elephant x={FC[0] + 80} y={FC[1] - 30} w={130} f={g + 20} />
      <KhFlag x={FC[0] - 10} y={FC[1] - 70} h={170} />
      {/* 사방에서 날아드는 화살 */}
      {live > 0 && (
        <svg width={HALF} height={1080} style={{ position: "absolute" }}>
          {riders.map((r, i) => {
            if (i % 2) return null;
            const t = ((g * 1.5 + i * 7) % 24) / 24;
            const tx = FC[0] + (rnd(i, 7) - 0.5) * 220, ty = FC[1] + (rnd(i, 8) - 0.5) * 110;
            const x = r.x + (tx - r.x) * t, y = r.y - 30 + (ty - r.y + 30) * t - Math.sin(t * Math.PI) * 70;
            const dx = tx - r.x, dy = ty - r.y;
            const L = Math.hypot(dx, dy) || 1;
            return <path key={i} d={`M ${x} ${y} l ${(dx / L) * 34} ${(dy / L) * 34}`} stroke={INK} strokeWidth={3.5} opacity={t > 0.05 && t < 0.92 ? 1 : 0} />;
          })}
        </svg>
      )}
    </AbsoluteFill>
  );
};
// 오른쪽: 성 안에서 버팀 - 정면에서 본 성벽 (2026-11-02 사용자 2차: "오른쪽 화면이 너무 작다, 화살이 너무 없어 보여, 정면으로 보는 것도 괜찮고")
// 몽골 기병 등 뒤에서 성벽을 정면으로: 아래에서 화살 수십 대가 솟아 벽에 꽂히고(꽂힌 화살이 점점 쌓임), 수비병은 여장 뒤로 숨었다 일어나 돌을 떨어뜨림
export const rnd = (i: number, k = 1) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const WallFight = ({ f, live, shut = 0 }: { f: number; live: number; shut?: number }) => {
  const g = Math.max(0, f) * live;
  const TOP = 230;
  const stuck = Math.min(70, Math.floor(g / 1.6));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#cbd3cf, #e9dfc4 40%)" }} />
      <svg width={HALF} height={1080} style={{ position: "absolute", ...ink }}>
        <Dome x={480} y={TOP - 40} r={120} />
        {/* 성벽 정면 */}
        <rect x={-20} y={TOP} width={1000} height={900} fill={SAND_D} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 13 }).map((_, i) => <path key={i} d={`M -20 ${TOP + 50 + i * 60} L 980 ${TOP + 50 + i * 60}`} stroke={SAND_DD} strokeWidth={4} opacity={0.6} />)}
        {Array.from({ length: 13 }).map((_, r) => Array.from({ length: 7 }).map((_, c) => <path key={`${r}-${c}`} d={`M ${((r % 2) * 70 + c * 140) - 20} ${TOP + 50 + r * 60} l 0 60`} stroke={SAND_DD} strokeWidth={3} opacity={0.5} />))}
        {Array.from({ length: 12 }).map((_, i) => <rect key={`m${i}`} x={-10 + i * 84} y={TOP - 48} width={50} height={50} fill={SAND_D} stroke={INK} strokeWidth={6} />)}
        {/* 양쪽 망루 (앞으로 튀어나옴) */}
        {[60, 900].map((x) => (
          <g key={x}>
            <rect x={x - 100} y={TOP - 80} width={200} height={1000} fill={SAND} stroke={INK} strokeWidth={7} />
            {[-70, -10, 50].map((dx) => <rect key={dx} x={x + dx - 20} y={TOP - 126} width={40} height={48} fill={SAND} stroke={INK} strokeWidth={6} />)}
            <path d={`M ${x - 10} ${TOP + 60} l 0 70 M ${x - 10} ${TOP + 300} l 0 70`} stroke="#2e2018" strokeWidth={16} strokeLinecap="round" />
          </g>
        ))}
        {/* 성문 + 닫히는 문짝 */}
        <path d={`M 360 1080 L 360 ${TOP + 470} C 360 ${TOP + 340} 600 ${TOP + 340} 600 ${TOP + 470} L 600 1080 Z`} fill="#2e2018" stroke={INK} strokeWidth={7} />
        <path d={`M 362 1080 L 362 ${TOP + 470} C 362 ${TOP + 390} 420 ${TOP + 362} 480 ${TOP + 360} L ${362 + 118 * shut} ${TOP + 360} L ${362 + 118 * shut} 1080 Z`} fill="#7a5230" stroke={INK} strokeWidth={6} />
        <path d={`M 598 1080 L 598 ${TOP + 470} C 598 ${TOP + 390} 540 ${TOP + 362} 480 ${TOP + 360} L ${598 - 118 * shut} ${TOP + 360} L ${598 - 118 * shut} 1080 Z`} fill="#6a4628" stroke={INK} strokeWidth={6} />
        {/* 벽에 꽂힌 화살 (점점 쌓임) */}
        {Array.from({ length: stuck }).map((_, i) => {
          const x = 20 + rnd(i) * 920, y = TOP + 20 + rnd(i, 2) * 420;
          if (x > 350 && x < 610 && y > TOP + 330) return null;
          return <g key={`a${i}`}><path d={`M ${x} ${y} l -16 26`} stroke={INK} strokeWidth={4} /><path d={`M ${x - 16} ${y + 26} l -8 2 m 8 -2 l -2 8`} stroke="#efe6d4" strokeWidth={4} /></g>;
        })}
      </svg>
      {/* 여장 위 수비병: 화살이 쏟아지면 숨었다 일어남 */}
      {Array.from({ length: 9 }).map((_, i) => {
        const duck = live > 0 ? Math.max(0, Math.sin(g / 7 + i * 1.3)) * 46 : 0;
        return <Spearman key={i} x={140 + i * 85} y={TOP + 4 + duck} s={0.27} spear={-25 + Math.sin(g / 9 + i) * 8} />;
      })}
      <svg width={HALF} height={1080} style={{ position: "absolute", left: 0, top: TOP - 60, ...ink }}>
        {Array.from({ length: 12 }).map((_, i) => <rect key={`mm${i}`} x={-10 + i * 84} y={12} width={50} height={50} fill={SAND_D} stroke={INK} strokeWidth={6} />)}
      </svg>
      {/* 솟아오르는 화살 (아래 → 벽 위쪽) + 떨어지는 돌 */}
      {live > 0 && (
        <svg width={HALF} height={1080} style={{ position: "absolute" }}>
          {Array.from({ length: 36 }).map((_, i) => {
            const t = ((g * 1.3 + rnd(i, 3) * 30) % 30) / 30;
            const x0 = 40 + rnd(i, 4) * 880, x1 = 20 + rnd(i, 5) * 920;
            const y1 = TOP - 40 + rnd(i, 6) * 460;
            const x = x0 + (x1 - x0) * t, y = 1120 + (y1 - 1120) * t;
            return <path key={i} d={`M ${x} ${y} L ${x - (x1 - x0) * 0.05} ${y + 60}`} stroke={INK} strokeWidth={3.5} opacity={t < 0.96 ? 0.9 : 0} />;
          })}
          {Array.from({ length: 5 }).map((_, i) => {
            const t = ((g + i * 9) % 34) / 34;
            return <circle key={`s${i}`} cx={160 + i * 170 + Math.sin(i) * 30} cy={TOP - 20 + t * t * 900} r={24 - t * 4} fill="#8a8478" stroke={INK} strokeWidth={5} opacity={t < 0.94 ? 1 : 0} />;
          })}
        </svg>
      )}
      {/* 앞: 몽골 기병 등 (어둡게, 아래 가장자리) */}
      {Array.from({ length: 5 }).map((_, i) => <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={-120 + i * 230} y={900 + (i % 2) * 40} w={300} dark still={live === 0} phase={i * 3} />)}
    </AbsoluteFill>
  );
};
const S1: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2)), a3 = at(id(3));
  const leftOn = lerp(f, a2, a2 + 8, 0, 1);
  const rightOn = lerp(f, a2 + tl(id(2), 2.2), a2 + tl(id(2), 2.2) + 8, 0, 1); // "/ 성 안에 들어가 버티는 것입니다"
  const pick = lerp(f, a3, a3 + 24, 0, 1, true); // "성을 골랐습니다" - 오른쪽이 화면 전체로
  // 2026-11-02 사용자 "7초까지 화면만 고정이라 별로" → 1안: 지도로 시작 - 몽골군이 국경으로 밀려오고 도시마다 경보, "두 가지 길"에서 먹선이 그어지며 반으로 갈라짐
  const SPLIT = at(id(1)) + tl(id(1), 3.0);
  const open = lerp(f, SPLIT, SPLIT + 16, 0, 1, true);
  const mapOp = lerp(f, SPLIT + 10, SPLIT + 24, 1, 0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* 왼쪽 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: HALF, height: 1080, overflow: "hidden", transform: `translateX(${-pick * HALF}px)`, filter: `saturate(${0.35 + leftOn * 0.65 - (rightOn > 0 ? 0.35 : 0)}) brightness(${0.75 + leftOn * 0.25 - rightOn * 0.2})` }}>
        <FieldFight f={f - a2} live={leftOn} />
      </div>
      {/* 오른쪽 → 화면 전체 */}
      <div style={{ position: "absolute", left: HALF * (1 - pick), top: 0, width: HALF * (1 + pick), height: 1080, overflow: "hidden", filter: `saturate(${0.35 + rightOn * 0.65}) brightness(${0.75 + rightOn * 0.25})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: HALF, height: 1080, transform: `scale(${1 + pick})`, transformOrigin: "50% 100%", marginLeft: pick * HALF * 0.5 }}>
          <WallFight f={f - a2 - tl(id(2), 2.4)} live={rightOn} shut={lerp(f, a3 + 14, a3 + 40, 0, 1, true)} />
        </div>
      </div>
      {/* 지도: 몽골군 접근 + 경보 */}
      {mapOp > 0 && (
        <AbsoluteFill style={{ opacity: mapOp }}>
          <MapShot f={f} st={{ split: 0, mongol: lerp(f, 0, SPLIT, 0, 1, true) }} z={lerp(f, 0, SPLIT, 1.6, 1.85)} cx={lerp(f, 0, SPLIT, MX(67), MX(66))} cy={MY(41.2)} />
          <MapCam z={lerp(f, 0, SPLIT, 1.6, 1.85)} cx={lerp(f, 0, SPLIT, MX(67), MX(66))} cy={MY(41.2)}>
            {KH_CITIES.map(([x, y], i) => {
              const on = f > 40 + i * 8;
              const pulse = on ? 0.5 + 0.4 * Math.sin((f - i * 8) / 4) : 0;
              return <Glow key={i} x={x} y={y - 10} r={120} color="#ff6a3a" op={pulse} />;
            })}
          </MapCam>
        </AbsoluteFill>
      )}
      {/* 가운데 먹선 (위아래로 그어짐) */}
      <div style={{ position: "absolute", left: HALF - 6 - pick * HALF, top: 0, width: 12, height: 1080 * open, background: INK, opacity: 1 - pick }} />
      <SFX name="cavalry" at={0} vol={0.18} dur={SPLIT} />
      <SFX name="bells" at={40} vol={0.2} dur={SPLIT - 40} />
      <SFX name="swish" at={SPLIT} vol={0.3} dur={20} />
      <SFX name="battle" at={a2} vol={0.25} dur={sec(2.4)} />
      <SFX name="arrows" at={a2 + tl(id(2), 2.2)} vol={0.25} dur={a3 - a2 - tl(id(2), 2.4)} />
      <SFX name="gate" at={a3 + 10} vol={0.35} dur={40} />
    </AbsoluteFill>
  );
};

// ================= 3) c1_04 지도: 큰 덩어리가 쪼개져 도시마다 들어감 =================
const S3: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <>
      <MapShot f={f} st={{ split: lerp(f, 20, frames - 20, 0, 1) }} z={lerp(f, 0, frames, 2.2, MAP_C.z, true)} cx={lerp(f, 0, frames, SAMK[0], MAP_C.cx, true)} cy={lerp(f, 0, frames, SAMK[1] - 40, MAP_C.cy, true)} />
      <SFX name="whoosh" at={22} vol={0.2} dur={30} />
      {PIECES.map((_, i) => <SFX key={i} name="tick" at={40 + i * 9} vol={0.1} dur={10} />)}
    </>
  );
};

// ================= 4) c1_05~06 종이 위 두 칸: 들판에선 몽골이 둘러쌈 / 성벽 앞에선 멈춤 → 지쳐 돌아감 =================
const Panel = ({ x, w, children }: { x: number; w: number; children: React.ReactNode }) => (
  <div style={{ position: "absolute", left: x, top: 150, width: w, height: 700, overflow: "hidden", border: `6px solid ${INK}`, borderRadius: 8, background: "#e8d6a8", boxShadow: "0 12px 30px rgba(0,0,0,.25)" }}>{children}</div>
);
const S4: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const back = at(id(6)) + 10; // "성 안에서 버티기만 하면" → 지쳐 돌아감
  const left = lerp(f, 0, 14, 0, 1);
  const right = lerp(f, tl(id(5), 3.2), tl(id(5), 3.2) + 14, 0, 1);
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{ opacity: left, transform: `translateY(${(1 - left) * 40}px)` }}>
        <Panel x={110} w={800}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#e9dfc0, #e9dfc0 34%, #c9b47a 34%)" }} />
          {/* 가운데 적(창병) 무리 + 둘레를 도는 몽골 기병 */}
          {Array.from({ length: 18 }).map((_, i) => <Spearman key={i} x={330 + (i % 6) * 32} y={440 + Math.floor(i / 6) * 34} s={0.14} spear={20} col="#2e5a46" />)}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + f * 0.03;
            const flip = Math.sin(a) > 0;
            return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={400 + Math.cos(a) * 300 - 60} y={420 + Math.sin(a) * 150 - 40} w={120} flip={flip} phase={i * 3} />;
          })}
          <svg width={800} height={700} style={{ position: "absolute", ...ink }}>
            <ellipse cx={400} cy={460} rx={330} ry={170} fill="none" stroke={MB} strokeWidth={6} strokeDasharray="18 12" />
          </svg>
        </Panel>
      </div>
      <div style={{ opacity: right, transform: `translateY(${(1 - right) * 40}px)` }}>
        <Panel x={1010} w={800}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#e9dfc0, #e9dfc0 34%, #c9b47a 34%)" }} />
          <svg width={800} height={700} style={{ position: "absolute", ...ink }}>
            <g transform="translate(480 0)"><WallStrip x0={0} x1={360} top={140} base={560} /><Tower x={60} top={90} base={560} w={100} /></g>
          </svg>
          {Array.from({ length: 5 }).map((_, i) => <Spearman key={i} x={560 + i * 50} y={142} s={0.12} spear={30} />)}
          {Array.from({ length: 6 }).map((_, i) => {
            const turned = f > back + i * 4;
            const away = Math.max(0, f - back - i * 4);
            const x = 300 - (i % 3) * 110 - (turned ? away * 2.2 : 0) + (turned ? 0 : Math.sin(f / 9 + i) * 4);
            return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={450 + Math.floor(i / 3) * 60} w={140} flip={turned} still={!turned} phase={i * 5} />;
          })}
          <svg width={800} height={700} style={{ position: "absolute", ...ink }}>
            {f < back && Array.from({ length: 4 }).map((_, i) => <path key={i} d={`M ${430 + i * 6} ${300 + i * 60} l 30 -20 m -30 20 l 30 20`} stroke={INK} strokeWidth={5} fill="none" opacity={0.6} />)}
          </svg>
        </Panel>
      </div>
      <SFX name="page" at={0} vol={0.3} dur={20} />
      <SFX name="page" at={tl(id(5), 3.2)} vol={0.3} dur={20} />
      <SFX name="hooves" at={back} vol={0.2} dur={60} />
    </AbsoluteFill>
  );
};

// ================= 5) c1_07 지도: 조각 사이를 잇던 선이 끊김 =================
// 2판 (2026-11-02 사용자: "성마다 나눠 넣어 수적 우위를 버린 실수였다고") - 대사 13.8초
// "믿지 못했습니다" 지휘선이 끊김 → "여러 성에 나눠 넣으면서" 조각들이 성 안으로 작아짐 → "가장 큰 무기를 스스로 버린 것입니다" 사마르칸트 자리에 원래의 큰 덩어리 그림자가 떠올랐다 흩어져 사라짐
const S5: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const ghostOn = lerp(f, tl(id(7), 8.2), tl(id(7), 9.0), 0, 1) * lerp(f, tl(id(7), 11.2), tl(id(7), 13.4), 1, 0);
  const crumble = lerp(f, tl(id(7), 10.6), tl(id(7), 13.2), 0, 1, true);
  return (
    <>
      <MapShot f={f} st={{ split: 1, cut: lerp(f, 30, tl(id(7), 4), 0, 1) }} z={lerp(f, 0, frames, MAP_C.z, MAP_C.z + 0.25)} cx={lerp(f, 0, frames, MAP_C.cx, SAMK[0] - 60)} cy={lerp(f, 0, frames, MAP_C.cy, SAMK[1] - 60)} />
      {ghostOn > 0 && (
        <MapCam z={lerp(f, 0, frames, MAP_C.z, MAP_C.z + 0.25)} cx={lerp(f, 0, frames, MAP_C.cx, SAMK[0] - 60)} cy={lerp(f, 0, frames, MAP_C.cy, SAMK[1] - 60)}>
          <svg width={3200} height={1440} style={{ position: "absolute", left: 0, top: 0, opacity: ghostOn * 0.75 }}>
            {grid(196, 12).map(([dx, dy], i) => {
              const a = rnd(i, 3) * Math.PI * 2, r = crumble * (80 + rnd(i, 4) * 260);
              return <KhG key={i} x={SAMK[0] + dx + Math.cos(a) * r} y={SAMK[1] - 80 + dy + Math.sin(a) * r * 0.6} s={1} c="#6f8f7a" />;
            })}
          </svg>
        </MapCam>
      )}
      {[0, 2, 3, 4, 5, 6].map((i, k) => <SFX key={i} name="hit" at={40 + k * 12} vol={0.08} dur={10} />)}
      <SFX name="whoosh" at={tl(id(7), 10.6)} vol={0.25} dur={40} />
    </>
  );
};

// ================= 6) c1_08~11 2판 (2026-11-02 사용자: "나눠지는 것도, 사라지는 것도 엉성해, 새롭게" → 네 칸 화면, 이름 문장 뺌, "사라진다" 대신 "보이지 않았다")
// ① 위에서 본 몽골 대형(네모)이 네 덩어리로 쩍 갈라짐(1·2·3·4) → ② 덩어리마다 제 칸으로 날아가 화면이 네 칸 → 대사 순서대로 한 칸씩 밝아짐
// ③ 칸마다 호라즘 망루에 봉화가 타오름 (1 오트라르 포위 · 2 강 하류 · 3 골짜기 상류) / 4 본대는 흰 툭 아래 모래 언덕 쪽으로 멀어짐
// ④ 네 칸이 지도로 합쳐짐: 세 곳에 봉화 연기, 본대가 간 쪽(부하라 방향)만 어둡고 조용함
const QW = 960, QH = 540;
const QUAD = [[0, 0], [QW, 0], [0, QH], [QW, QH]];
const QCOL = ["#a8332a", "#3f5f86", "#c9a24a", "#efe6d4"]; // 덩어리 깃발 색 (4 = 흰 툭, 본대)
// 망루 + 봉화 (칸 안 좌표, (x,y) = 망루 발)
const Beacon = ({ x, y, k = 1, lit, f }: { x: number; y: number; k?: number; lit: number; f: number }) => (
  <>
    <svg width={QW} height={QH} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <path d="M -40 0 L -30 -190 L 30 -190 L 40 0 Z" fill={SAND} stroke={INK} strokeWidth={5} />
        {[-24, 0, 24].map((dx) => <rect key={dx} x={dx - 9} y={-212} width={18} height={24} fill={SAND} stroke={INK} strokeWidth={4} />)}
        <path d="M -6 -150 l 0 36" stroke="#2e2018" strokeWidth={10} strokeLinecap="round" />
      </g>
    </svg>
    {lit > 0 && (
      <div style={{ position: "absolute", left: 0, top: 0, width: QW, height: QH, opacity: lit }}>
        <Smoke x={x} y={y - 230 * k} f={f} n={3} s={0.55 * k} />
        <Fire x={x} y={y - 205 * k} s={0.55 * k} />
      </div>
    )}
  </>
);
// big 0~1: 말하는 칸이 화면 가운데로 모이며 1.75배로 커짐 (2026-11-02 사용자 "네 칸 유지 말고 각 화면을 가운데로 모아 확대했다 다시 줄어들게")
const BIG = 1.75;
const QPanel = ({ q, f, on, big = 0, children }: { q: number; f: number; on: number; big?: number; children: React.ReactNode }) => (
  <div style={{ position: "absolute", left: QUAD[q][0] + ((1920 - QW * BIG) / 2 - QUAD[q][0]) * big, top: QUAD[q][1] + ((1080 - QH * BIG) / 2 - QUAD[q][1]) * big, width: QW, height: QH, transform: `scale(${1 + (BIG - 1) * big})`, transformOrigin: "0 0", zIndex: big > 0 ? 10 : 1, overflow: "hidden", filter: `brightness(${0.55 + 0.45 * on}) saturate(${0.45 + 0.55 * on})`, boxShadow: big > 0 ? `0 20px 60px rgba(0,0,0,${0.5 * big}), inset 0 0 0 ${8 / (1 + (BIG - 1) * big)}px ${QCOL[q]}` : undefined }}>
    {children}
    <svg width={QW} height={QH} style={{ position: "absolute", left: 0, top: 0 }}>
      <text x={40} y={92} fontFamily="Baskerville, serif" fontWeight={700} fontSize={78} fill={QCOL[q] === "#efe6d4" ? "#f2ead8" : QCOL[q]} stroke={INK} strokeWidth={3} opacity={0.6 + 0.4 * on}>{q + 1}</text>
    </svg>
    <span style={{ display: "none" }}>{f}</span>
  </div>
);
// 칸 1: 오트라르 포위
const Q1 = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(#dccdaa, #efe4c8 46%, #cfb57c 46%)" }} />
    <svg width={QW} height={QH} style={{ position: "absolute", ...ink }}>
      <Dome x={640} y={170} r={60} />
      <WallStrip x0={430} x1={980} top={180} base={330} />
      <Tower x={450} top={140} base={330} w={80} />
    </svg>
    {Array.from({ length: 6 }).map((_, i) => <Ger key={i} x={90 + i * 140} y={470 + (i % 2) * 30} w={110} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} />)}
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2 + f * 0.02;
      return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={330 + Math.cos(a) * 260 - 50} y={330 + Math.sin(a) * 50 - 50} w={110} flip={Math.sin(a) > 0} phase={i * 3} />;
    })}
    <Beacon x={450} y={140} k={0.55} lit={1} f={f} />
  </AbsoluteFill>
);
// 칸 2: 넓은 강을 따라 하류로 (왼쪽으로)
const Q2 = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(#dfd2b0, #efe4c8 38%, #c9b07a 38%)" }} />
    <svg width={QW} height={QH} style={{ position: "absolute", ...ink }}>
      <path d="M -20 250 C 300 230 600 280 980 240 L 980 330 C 600 370 300 320 -20 340 Z" fill="#6f93a8" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M ${((i * 190 - f * 3) % 1100 + 1100) % 1100 - 80} ${285 + (i % 2) * 18} l 50 0`} stroke="#a9c3cf" strokeWidth={4} />)}
    </svg>
    {Array.from({ length: 9 }).map((_, i) => {
      const x = ((i * 130 - f * 6) % 1300 + 1300) % 1300 - 160;
      return (
        <React.Fragment key={i}>
          <Dust x={x + 120} y={470} t={((f + i * 4) % 22) / 22} r={45} />
          <Rider kind={i % 2 ? "mongol" : "mongol2"} x={x} y={370 + (i % 2) * 40} w={140} flip phase={i * 3} />
        </React.Fragment>
      );
    })}
    <Beacon x={140} y={232} k={0.42} lit={1} f={f} />
  </AbsoluteFill>
);
// 칸 3: 골짜기 사이로 강 상류 도시로 (위로 오름)
const Q3 = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(#d6cdb4, #ece2c6 60%)" }} />
    <svg width={QW} height={QH} style={{ position: "absolute", ...ink }}>
      <path d="M -20 540 L -20 160 L 90 70 L 170 120 L 250 60 L 330 200 L 390 540 Z" fill="#a8977a" stroke={INK} strokeWidth={5} />
      <path d="M 90 70 L 140 240 L 120 540 M 250 60 L 270 260 L 300 540" stroke="#8a7a5c" strokeWidth={10} fill="none" opacity={0.7} />
      <path d="M 90 70 L 70 100 L 110 110 Z M 250 60 L 230 92 L 272 96 Z" fill="#f2ead8" />
      <path d="M 980 540 L 980 130 L 880 50 L 780 110 L 700 40 L 630 190 L 560 540 Z" fill="#978668" stroke={INK} strokeWidth={5} />
      <path d="M 700 40 L 690 250 L 650 540 M 880 50 L 860 280 L 880 540" stroke="#7a6a50" strokeWidth={10} fill="none" opacity={0.7} />
      <path d="M 700 40 L 680 74 L 722 80 Z M 880 50 L 860 82 L 902 86 Z" fill="#f2ead8" />
      <path d="M 300 540 C 420 400 520 300 470 170 L 500 170 C 560 300 470 420 640 540 Z" fill="#cfb57c" />
      <path d="M 430 540 C 480 420 500 300 482 180" stroke="#6f93a8" strokeWidth={14} fill="none" />
      <g transform="translate(482 170)"><path d="M -60 0 L -60 -50 L 60 -50 L 60 0 Z" fill={SAND} stroke={INK} strokeWidth={4} /><path d="M -24 -50 C -24 -80 24 -80 24 -50 Z" fill="#3f8f8a" stroke={INK} strokeWidth={4} /></g>
    </svg>
    {Array.from({ length: 8 }).map((_, i) => {
      const u = ((f * 0.006 + i / 8) % 1);
      const y = 560 - u * 330, x = 400 + Math.sin(u * 3) * 60 + u * 40;
      const w = 150 - u * 100;
      return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x - w / 2} y={y - w * 0.7} w={w} phase={i * 3} />;
    })}
    <Beacon x={560} y={150} k={0.36} lit={1} f={f} />
  </AbsoluteFill>
);
// 칸 4: 흰 툭 아래 본대가 모래 언덕 쪽으로 멀어짐 (망루 없음)
const Q4 = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(#e8c98e, #f2deb0 45%)" }} />
    <svg width={QW} height={QH} style={{ position: "absolute", ...ink }}>
      <path d="M -20 250 C 200 200 400 240 600 210 C 760 190 880 230 980 220 L 980 540 L -20 540 Z" fill="#dcb878" />
      <path d="M -20 360 C 300 300 600 360 980 320 L 980 540 L -20 540 Z" fill="#cfa863" stroke={INK} strokeWidth={4} />
    </svg>
    {Array.from({ length: 12 }).map((_, i) => {
      const u = ((f * 0.005 + i / 12) % 1);
      const y = 520 - u * 300, x = 300 + u * 380 + (i % 3 - 1) * 70 * (1 - u);
      const w = 170 - u * 140;
      return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x - w / 2} y={y - w * 0.7} w={w} phase={i * 3} />;
    }).reverse()}
    <Tug x={250} y={470} h={300} sway={Math.sin(f / 9) * 6} />
  </AbsoluteFill>
);
const SPOTS = [OTRAR, JAND, KHUJAND];
// 작은 지도 카드: 갈래 k의 경로가 그어짐 (앞 갈래들은 흐리게 끝까지)
const MINI_W = 600, MINI_H = 360, MINI_Z = 0.85;
const MiniMap = ({ f, k, t, op }: { f: number; k: number; t: number; op: number }) => {
  const mid = along(PRONG[k], 0.6);
  const cx = (mid[0] + GATHER[0]) / 2, cy = (mid[1] + GATHER[1]) / 2;
  const prong = [0, 1, 2, 3].map((i) => (i < k ? 1 : i === k ? Math.max(0.001, t) : 0));
  return (
    <div style={{ position: "absolute", right: 70, bottom: 60, width: MINI_W, height: MINI_H, overflow: "hidden", border: `6px solid ${INK}`, borderRadius: 10, background: "#c3cbbd", boxShadow: "0 14px 40px rgba(0,0,0,.45)", opacity: op, zIndex: 20, transform: `translateY(${(1 - op) * 30}px)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 3200, height: 1440, transform: `translate(${MINI_W / 2 - cx * MINI_Z}px, ${MINI_H / 2 - cy * MINI_Z}px) scale(${MINI_Z})`, transformOrigin: "0 0" }}>
        <M1Map f={f} st={{ split: 1, cut: 1, prong, rings: [0, 0, 0, 0, 0, 0, k === 0 ? t : 1] }} />
      </div>
    </div>
  );
};
// 3판 (2026-11-02 사용자: "지도상 위치를 크게, 개별 화면을 작게"): 큰 지도 위에서 갈래마다 화살표가 뻗고,
// 그 갈래의 장면은 작은 카드로 목적지 옆에 떴다가 목적지 점으로 줄어들며 사라짐 (선으로 이어짐)
const S6Z = 2.3, S6CX = MX(67.4), S6CY = MY(42.0);
const toScr = (p: number[]) => {
  const tx = Math.max(Math.min(960 - S6CX * S6Z, 0), 1920 - 3200 * S6Z);
  const ty = Math.max(Math.min(540 - S6CY * S6Z, 0), 1080 - 1440 * S6Z);
  return [p[0] * S6Z + tx, p[1] * S6Z + ty];
};
const DEST = [OTRAR, KHUJAND, JAND, PRONG[3][PRONG[3].length - 1]];
const CARD_W = 640, CARD_H = 360;
const CARD_AT = [[1240, 660], [1240, 680], [40, 40], [40, 40]]; // 카드 왼쪽 위 (목적지를 가리지 않는 쪽)
const SceneCard = ({ q, f, op }: { q: number; f: number; op: number }) => {
  const d = toScr([DEST[q][0], DEST[q][1] - 20]);
  const [x0, y0] = CARD_AT[q];
  const k = 0.25 + 0.75 * op; // 줄어들며 목적지로
  const x = d[0] + (x0 - d[0]) * op, y = d[1] + (y0 - d[1]) * op;
  const cxm = x0 + CARD_W / 2, cym = y0 + CARD_H / 2;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
        <path d={`M ${d[0]} ${d[1]} L ${cxm + (d[0] - cxm) * 0.0} ${cym}`} stroke={INK} strokeWidth={5} strokeDasharray="12 8" />
        <circle cx={d[0]} cy={d[1]} r={12} fill={QCOL[q]} stroke={INK} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", left: x, top: y, width: CARD_W, height: CARD_H, transform: `scale(${k})`, transformOrigin: `${(d[0] - x) / 1}px ${(d[1] - y) / 1}px`, opacity: Math.min(1, op * 1.5), overflow: "hidden", border: `7px solid ${INK}`, borderRadius: 10, boxShadow: "0 16px 44px rgba(0,0,0,.45)", background: "#e9dcbc", willChange: "transform" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: QW, height: QH, transform: `scale(${CARD_W / QW})`, transformOrigin: "0 0" }}>
          {q === 0 ? <Q1 f={f} /> : q === 1 ? <Q3 f={f} /> : q === 2 ? <Q2 f={f} /> : <Q4 f={f} />}
        </div>
        <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={24} y={66} fontFamily="Baskerville, serif" fontWeight={700} fontSize={58} fill={q === 3 ? "#f2ead8" : QCOL[q]} stroke={INK} strokeWidth={3}>{q + 1}</text>
        </svg>
      </div>
    </>
  );
};
const S6: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a9 = at(id(9)), a10 = at(id(10)), a11 = at(id(11));
  const cut = lerp(f, tl(id(8), 1.5), tl(id(8), 2.8), 0, 1, true); // "네 갈래로 나눠" - 대형이 갈라짐
  const toMap = lerp(f, tl(id(8), 3.2), tl(id(8), 4.0), 0, 1, true); // "동시에" - 지도로
  const MAPT = a11 + tl(id(11), 3.4);
  const win = [[a9, a10], [a10, a10 + tl(id(10), 3.4)], [a10 + tl(id(10), 3.4), a11], [a11, frames - 30]]; // "남쪽 도시들로," 뒤에 셋째
  const cardOp = (k: number) => Math.min(lerp(f, win[k][0] - 2, win[k][0] + 14, 0, 1, true), lerp(f, win[k][1] - 12, win[k][1] + 6, 1, 0, true));
  // "동시에": 네 갈래가 한꺼번에 조금씩 출발 → 대사 차례에 그 갈래가 끝까지
  const start = lerp(f, tl(id(8), 3.6), a9, 0, 0.18, true);
  const prong = [0, 1, 2, 3].map((k) => Math.max(0.001, Math.max(start, lerp(f, win[k][0], win[k][0] + (k === 3 ? sec(6) : sec(2.2)), 0, 1, true))));
  const lit = [0, 1, 2].map((k) => lerp(f, win[k][0] + sec(1.6), win[k][0] + sec(2.2), 0, 1));
  const block = grid(70, 30);
  return (
    <AbsoluteFill style={{ background: "#c3cbbd" }}>
      {toMap > 0 && (
        <AbsoluteFill style={{ opacity: toMap }}>
          <MapShot f={f} st={{ split: 1, cut: 1, prong, rings: [0, 0, 0, 0, 0, 0, lit[0]] }} z={S6Z} cx={S6CX} cy={S6CY} />
          <MapCam z={S6Z} cx={S6CX} cy={S6CY}>
            {[OTRAR, KHUJAND, JAND].map(([x, y], i) => (lit[i] > 0 ? (
              <div key={i} style={{ position: "absolute", left: 0, top: 0, width: 3200, height: 1440, opacity: lit[i] }}>
                <Smoke x={x + 40} y={y - 70} f={f + i * 20} n={3} s={0.45} />
                <Fire x={x + 40} y={y - 40} s={0.4} />
              </div>
            ) : null))}
            {/* 본대가 향한 쪽(부하라)은 끝까지 어둡게 - 불 꺼진 망루 */}
            <div style={{ position: "absolute", left: KH_CITIES[2][0] - 160, top: KH_CITIES[2][1] - 160, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(rgba(20,16,12,.5), transparent 70%)", opacity: lerp(f, MAPT - 20, MAPT + 20, 0, 1) }} />
          </MapCam>
          {[0, 1, 2, 3].map((k) => (cardOp(k) > 0 ? <SceneCard key={k} q={k} f={f} op={cardOp(k)} /> : null))}
        </AbsoluteFill>
      )}
      {toMap < 1 && (
        <AbsoluteFill style={{ opacity: 1 - toMap }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #a9b874, #8aa057 75%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {[0, 1, 2, 3].map((q) => {
              const sx = q % 2 ? 1 : -1, sy = q < 2 ? -1 : 1;
              const cx = 960 + sx * (175 + 230 * cut), cy = 540 + sy * (120 + 110 * cut);
              return (
                <g key={q}>
                  {block.map(([dx, dy], i) => <MoG key={i} x={cx + dx} y={cy + dy} s={2.4} flip={sx < 0} />)}
                  <g transform={`translate(${cx} ${cy - 150})`} opacity={cut}>
                    <path d="M 0 40 L 0 -40" stroke={INK} strokeWidth={6} />
                    <path d="M 2 -40 L 60 -30 L 2 -12 Z" fill={QCOL[q]} stroke={INK} strokeWidth={4} />
                    <text x={-14} y={-56} fontFamily="Baskerville, serif" fontWeight={700} fontSize={64} fill={INK}>{q + 1}</text>
                  </g>
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
      )}
      <SFX name="war_horn" at={tl(id(8), 1.4)} vol={0.25} dur={60} />
      <SFX name="whoosh" at={tl(id(8), 3.2)} vol={0.25} dur={30} />
      <SFX name="cavalry" at={tl(id(8), 3.6)} vol={0.18} dur={frames - tl(id(8), 3.6)} />
      {[0, 1, 2].map((k) => <SFX key={k} name="fire" at={win[k][0] + sec(1.6)} vol={0.18} dur={40} />)}
      <SFX name="wind" at={MAPT} vol={0.3} dur={frames - MAPT} />
    </AbsoluteFill>
  );
};
// 얼굴 메달 속 캐릭터 (kit Char를 크게, 얼굴만 보이게)
const CharFace = ({ id: cid }: { id: string }) => (
  <div style={{ position: "absolute", left: -40, top: 0, width: 320, height: 400 }}>
    <Char id={cid} x={160} h={560} bottom={-80} pose="front" enter="none" beat="none" />
  </div>
);

// ================= 7) c1_12~14 2판 (2026-11-02 사용자: "두 성과 군사가 나오는 게 너무 엉성, 새로 짜자" → 포위 그림 반복 말고 다른 구도)
// 위에서 비스듬히 본 들판: 왼쪽 성 A는 몽골 고리에 갇혀 돌을 맞음 → 오른쪽 성 B 성문이 열리고 구원군 행렬이 길을 따라 나옴
// → "그곳은 들판입니다": 길 양옆 언덕 뒤에서 기병이 쏟아져 행렬의 앞·가운데·뒤를 끊어 세 토막 → 토막마다 기병이 감싸고 화살
// → 앞 두 토막은 무너지고, 뒤 토막만 성 B로 도망쳐 들어가 성문이 닫힘 → 카메라가 빠지면 성 A는 여전히 혼자 갇힘
// 그림은 한 svg 안의 작은 그림(KhG·MoG)으로 (깜빡임 방지)
const CA = [330, 600], CB = [1640, 590];
const roadY = (x: number) => 650 + 26 * Math.sin((x - 400) / 360);
export const Castle = ({ x, y, k = 1, door = 0 }: { x: number; y: number; k?: number; door?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <ellipse cx={0} cy={8} rx={150} ry={26} fill="rgba(43,29,20,.18)" />
    <path d="M -38 -150 C -38 -196 38 -196 38 -150 Z" fill="#3f8f8a" stroke={INK} strokeWidth={4} />
    <path d="M 60 -120 L 60 -200 L 72 -200 L 72 -120" fill={SAND} stroke={INK} strokeWidth={4} />
    <path d="M -120 0 L -120 -120 L 120 -120 L 120 0 Z" fill={SAND_D} stroke={INK} strokeWidth={5} />
    {[-110, -78, -46, -14, 18, 50, 82].map((dx) => <rect key={dx} x={dx} y={-136} width={20} height={18} fill={SAND_D} stroke={INK} strokeWidth={4} />)}
    {[-120, 120].map((dx) => <g key={dx}><rect x={dx - 26} y={-150} width={52} height={150} fill={SAND} stroke={INK} strokeWidth={5} />{[-20, 0, 20].map((e) => <rect key={e} x={dx + e - 7} y={-164} width={14} height={16} fill={SAND} stroke={INK} strokeWidth={3} />)}</g>)}
    <path d="M -28 0 L -28 -48 C -28 -76 28 -76 28 -48 L 28 0 Z" fill="#2e2018" stroke={INK} strokeWidth={4} />
    <path d={`M -28 0 L -28 -48 C -28 -66 -14 -74 0 -76 L ${-28 + 28 * door} -76 L ${-28 + 28 * door} 0 Z M 28 0 L 28 -48 C 28 -66 14 -74 0 -76 L ${28 - 28 * door} -76 L ${28 - 28 * door} 0 Z`} fill="#7a5230" stroke={INK} strokeWidth={3} opacity={door} />
  </g>
);
const NCOL = 72; // 구원군 (3줄 × 24)
const S7: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a13 = at(id(13)), a14 = at(id(14));
  const out0 = a13 + tl(id(13), 1.2); // 성문이 열리고 행렬 출발
  const AMB = a13 + tl(id(13), 5.4); // "그곳은 들판입니다"
  const run = Math.min(f, AMB) - out0;
  const head = 1560 - Math.max(0, run) * 6.3; // 매복 때 행렬이 두 언덕 사이 한가운데 // 행렬 머리 x (왼쪽으로)
  const cutT = lerp(f, AMB + 10, AMB + 40, 0, 1, true); // 세 토막으로 끊김
  const fallT = lerp(f, a14, a14 + tl(id(14), 2.4), 0, 1); // 앞 두 토막 무너짐
  const flee = 0; // 2026-11-02 사용자: 뒤 토막이 성으로 돌아갈 필요 없음 - 세 토막이 각각 둘러싸인 채 끝
  const shut = lerp(f, a14 + tl(id(14), 2.6), a14 + tl(id(14), 3.2), 0, 1, true);
  const doorB = lerp(f, out0 - 10, out0, 1, 0); void shut;
  // 병사 자리
  const sol = Array.from({ length: NCOL }).map((_, i) => {
    const file = i % 3, rank = Math.floor(i / 3);
    const chunk = rank < 8 ? 0 : rank < 16 ? 1 : 2;
    let x = head + rank * 30 + chunk * 70 * cutT;
    if (f < out0 || (x > 1600 && flee === 0)) return null;
    let y = roadY(x) + (file - 1) * 18;
    if (chunk === 2 && flee > 0) { x += flee * 420; y = roadY(x) + (file - 1) * 18; }
    const down = rnd(i, 5) < fallT * [0.85, 0.7, 0.6][chunk];
    return { x, y, chunk, down, gone: chunk === 2 && x > 1640, op: chunk === 2 ? lerp(x, 1560, 1640, 1, 0) : 1 };
  });
  const center = (c: number) => {
    const xs = sol.filter((p) => p && p.chunk === c) as { x: number; y: number }[];
    if (!xs.length) return c === 2 ? [CB[0] - 40, roadY(CB[0] - 40)] : [head, roadY(head)];
    return [xs.reduce((a, p) => a + p.x, 0) / xs.length, xs.reduce((a, p) => a + p.y, 0) / xs.length];
  };
  const cc = [center(0), center(1), center(2)];
  // 언덕 뒤 매복 기병: 위 18 · 아래 18 → 토막 사이와 둘레로
  const amb = lerp(f, AMB - 6, AMB + 30, 0, 1, true);
  const riders = Array.from({ length: 36 }).map((_, k) => {
    const top = k < 18;
    const sx = 760 + (k % 18) * 30, sy = top ? 470 : 840;
    const c = k % 3;
    const a = (k / 36) * Math.PI * 2 + f * 0.035 * (c === 1 ? -1 : 1);
    const r = c === 2 ? 70 : 105;
    let tx = cc[c][0] + Math.cos(a) * r * 1.3, ty = cc[c][1] + Math.sin(a) * r * 0.6;
    if (c === 2 && flee > 0) {
      const w = lerp(f, a14 + tl(id(14), 1.0), a14 + tl(id(14), 2.6), 0, 1, true);
      const t1 = [cc[1][0] + Math.cos(a) * 140, cc[1][1] + Math.sin(a) * 70];
      tx = tx + (t1[0] - tx) * w; ty = ty + (t1[1] - ty) * w;
    }
    return { x: sx + (tx - sx) * amb, y: sy + (ty - sy) * amb, flip: amb < 1 ? tx < sx : Math.sin(a) * (c === 1 ? -1 : 1) > 0, a, c };
  });
  // 성 A 둘레 고리
  const ringA = Array.from({ length: 16 }).map((_, k) => {
    const a = (k / 16) * Math.PI * 2 + f * 0.012;
    return { x: CA[0] + Math.cos(a) * 230, y: CA[1] - 20 + Math.sin(a) * 90, flip: Math.sin(a) > 0, back: Math.sin(a) < 0 };
  });
  const zoomIn = lerp(f, AMB - 20, AMB + 30, 0, 1, true) * (1 - lerp(f, a14 + tl(id(14), 2.8), frames - 10, 0, 1, true));
  return (
    <AbsoluteFill>
      <Cam z={1 + 0.5 * zoomIn} cx={960 + (cc[1][0] - 960) * zoomIn} cy={600 + (cc[1][1] - 600) * zoomIn}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #d6bd85, #c4a66c 70%, #a88c56)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 들판 무늬: 덤불·돌·마른 풀 */}
          {Array.from({ length: 46 }).map((_, k) => {
            const x = rnd(k, 11) * 1920, y = 300 + rnd(k, 12) * 760;
            if (Math.abs(y - roadY(x)) < 60) return null;
            return k % 3 ? <path key={`g${k}`} d={`M ${x} ${y} l -8 -16 m 8 16 l 0 -20 m 0 20 l 8 -16`} stroke="#8a7a4a" strokeWidth={3} fill="none" /> : <ellipse key={`g${k}`} cx={x} cy={y} rx={22} ry={12} fill="#8f8a52" stroke={INK} strokeWidth={3} />;
          })}
          {/* 길 */}
          <path d={"M 420 " + roadY(420) + Array.from({ length: 30 }).map((_, k) => ` L ${420 + k * 42} ${roadY(420 + k * 42)}`).join("")} stroke="#b89a64" strokeWidth={70} fill="none" strokeLinecap="round" opacity={0.7} />
          {/* 성 A 고리 (뒤쪽) */}
          {ringA.filter((r) => r.back).map((r, k) => <MoG key={`ab${k}`} x={r.x} y={r.y} s={2.4} flip={r.flip} />)}
          <Castle x={CA[0]} y={CA[1]} k={1.15} />
          {ringA.filter((r) => !r.back).map((r, k) => <MoG key={`af${k}`} x={r.x} y={r.y} s={2.6} flip={r.flip} />)}
          {/* 성 A로 날아드는 돌 */}
          {Array.from({ length: 3 }).map((_, k) => {
            const t = ((f + k * 17) % 50) / 50;
            const x = CA[0] - 300 + t * 300, y = CA[1] - 100 - Math.sin(t * Math.PI) * 180;
            return <circle key={`st${k}`} cx={x} cy={y} r={10} fill="#8a8478" stroke={INK} strokeWidth={3} opacity={t < 0.95 ? 1 : 0} />;
          })}
          <Castle x={CB[0]} y={CB[1]} k={1.15} door={doorB} />
          {/* 위·아래 언덕 (매복 자리) */}
          <path d="M 640 520 C 720 330 1320 330 1400 520 Z" fill="#a98c52" stroke={INK} strokeWidth={6} />
          <path d="M 700 500 C 790 380 1250 380 1340 500 Z" fill="#b99c60" />
          <path d="M 760 470 C 860 410 1180 410 1280 470" stroke="#8c7442" strokeWidth={7} fill="none" />
          {[760, 900, 1050, 1200].map((x) => <path key={x} d={`M ${x} ${440 - (x === 900 || x === 1050 ? 30 : 0)} l -10 -18 m 10 18 l 0 -22 m 0 22 l 10 -18`} stroke="#6f6a3a" strokeWidth={4} fill="none" />)}
          {/* 구원군 */}
          {sol.map((p, i) => (p && !p.gone ? (p.down ? <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${rnd(i, 2) > 0.5 ? 80 : -80})`}><KhG x={0} y={0} s={2.1} /></g> : <g key={i} opacity={p.op}><KhG x={p.x} y={p.y} s={2.1} c={["#2e6b4f", "#6a3a2e", "#4a4a5a"][i % 3]} /></g>) : null))}
          {/* 기병 */}
          {amb > 0 && riders.map((r, k) => <MoG key={`r${k}`} x={r.x} y={r.y} s={2.6} flip={r.flip} />)}
          <path d="M 600 900 C 700 720 1340 720 1440 900 Z" fill="#a98c52" stroke={INK} strokeWidth={6} />
          <path d="M 660 890 C 760 780 1280 780 1380 890 Z" fill="#b99c60" />
          <path d="M 720 850 C 840 800 1200 800 1320 850" stroke="#8c7442" strokeWidth={7} fill="none" />
          {[740, 880, 1040, 1220].map((x) => <path key={x} d={`M ${x} ${820 - (x === 880 || x === 1040 ? 26 : 0)} l -10 -18 m 10 18 l 0 -22 m 0 22 l 10 -18`} stroke="#6f6a3a" strokeWidth={4} fill="none" />)}
        </svg>
        {/* 행렬 깃발 */}
        {f > out0 && f < a14 + tl(id(14), 1.2) && <KhFlag x={head + 20} y={roadY(head) - 30} h={110} />}
        {/* 매복 먼지 */}
        {amb > 0 && amb < 1 && [800, 960, 1120, 1260].flatMap((x, k) => [[x, 470], [x, 840]]).map(([x, y], k) => <div key={`du${k}`} style={{ position: "absolute", left: x - 110, top: y - 60, width: 220, height: 120, borderRadius: "50%", background: "radial-gradient(rgba(214,196,150,.9), transparent 70%)", opacity: Math.sin(amb * Math.PI) }} />)}
        {/* 화살 */}
        {amb >= 1 && fallT < 1 && (
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            {riders.map((r, k) => {
              if (k % 2 || r.c === 2) return null;
              const t = ((f * 1.6 + k * 7) % 22) / 22;
              const tx = cc[r.c][0] + (rnd(k, 3) - 0.5) * 120, ty = cc[r.c][1] + (rnd(k, 4) - 0.5) * 50;
              const x = r.x + (tx - r.x) * t, y = r.y - 20 + (ty - r.y + 20) * t - Math.sin(t * Math.PI) * 40;
              const L = Math.hypot(tx - r.x, ty - r.y) || 1;
              return <path key={k} d={`M ${x} ${y} l ${((tx - r.x) / L) * 26} ${((ty - r.y) / L) * 26}`} stroke={INK} strokeWidth={3} opacity={t > 0.05 && t < 0.92 ? 1 : 0} />;
            })}
          </svg>
        )}
      </Cam>
      <SFX name="catapult" at={10} vol={0.15} dur={40} />
      <SFX name="gate" at={out0 - 12} vol={0.3} dur={30} />
      <SFX name="march" at={out0} vol={0.25} dur={AMB - out0} />
      <SFX name="war_cry" at={AMB - 6} vol={0.3} dur={60} />
      <SFX name="cavalry" at={AMB - 10} vol={0.35} dur={70} />
      <SFX name="arrow_rain" at={AMB + 30} vol={0.25} dur={a14 + tl(id(14), 2.4) - AMB - 30} />
    </AbsoluteFill>
  );
};

// ================= 8) c1_15 지도: 도시마다 몽골 고리, 서로 이어지지 못함 =================
const S8: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const rings = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => lerp(f, 10 + i * 8, 24 + i * 8, 0, 1));
  return (
    <>
      <MapShot f={f} st={{ split: 1, cut: 1, rings }} z={lerp(f, 0, frames, MAP_C.z, MAP_C.z + 0.1)} cx={MAP_C.cx + 80} cy={MAP_C.cy} />
      <SFX name="hooves" at={0} vol={0.15} dur={frames} />
    </>
  );
};

// ================= 9) c1_16 병사 더미 비교: 전체는 호라즘 ≫ 몽골 → 성 하나 앞에선 몽골 ≫ 성 안 =================
// 2026-11-02 사용자: "전체 숫자가 비슷해 보임, 호라즘을 3배쯤" → 같은 그림 크기에서 더미 넓이 = 숫자 (호라즘 270 · 몽골 60, 넓이 약 3배)
const KN = 270, MN = 60;
const castlesX0 = 240;
// 가까이 본 성 하나 vs 둘러싼 몽골군
const OneCastle = ({ f, op }: { f: number; op: number }) => (
  <AbsoluteFill style={{ opacity: op }}>
    <Cam z={lerp(f, 0, 140, 1.12, 1.0, true)} cx={960} cy={560}>
      <AbsoluteFill style={{ background: "linear-gradient(#d8cba8, #efe4c8 44%, #cdb27a 44%)" }} />
      {/* 뒤: 지평선까지 천막과 기병 */}
      {Array.from({ length: 14 }).map((_, i) => <Ger key={`g${i}`} x={40 + i * 140} y={500 + (i % 2) * 14} w={110} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} />)}
      {Array.from({ length: 22 }).map((_, i) => <Rider key={`b${i}`} kind={i % 2 ? "mongol" : "mongol2"} x={-40 + i * 90} y={470 + (i % 3) * 8} w={100} still phase={i} />)}
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <Castle x={960} y={800} k={3.0} />
      </svg>
      {/* 성벽 위 수비병 몇 명 */}
      {[-240, -120, 0, 120, 240].map((dx, i) => <Spearman key={i} x={960 + dx} y={398} s={0.3} spear={-10 + Math.sin(f / 9 + i) * 6} />)}
      {/* 앞: 성을 감싼 몽골 기병 두 줄 + 툭 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = -80 + i * 170, side = x < 700 || x > 1180;
        return <Rider key={`m${i}`} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={side ? 640 : 700} w={200} flip={x > 960} still={i % 3 !== 0} phase={i * 3} />;
      })}
      {Array.from({ length: 9 }).map((_, i) => <Rider key={`f${i}`} kind={i % 2 ? "mongol2" : "mongol"} x={-160 + i * 250} y={800 + (i % 2) * 30} w={300} flip={i > 4} still={i % 2 === 0} phase={i * 5} />)}
      {[200, 760, 1220, 1720].map((x, i) => <Tug key={x} x={x} y={900} h={340} sway={Math.sin((f + i * 9) / 11) * 5} />)}
    </Cam>
    {/* 구석: 나머지 성 6개는 제자리 (서로 돕지 못함) */}
    <div style={{ position: "absolute", right: 50, top: 50, width: 560, height: 170, background: "#efe2c4", border: `6px solid ${INK}`, borderRadius: 10, boxShadow: "0 12px 30px rgba(0,0,0,.35)", opacity: lerp(f, 30, 44, 0, 1) }}>
      <svg width={560} height={170} style={{ position: "absolute", ...ink }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i} transform={`translate(${52 + i * 91} 140)`}>
            <path d="M -36 0 L -36 -34 L 36 -34 L 36 0 Z" fill={SAND_D} stroke={INK} strokeWidth={3} />
            {[-30, -10, 10, 30].map((dx) => <rect key={dx} x={dx - 5} y={-42} width={10} height={10} fill={SAND_D} stroke={INK} strokeWidth={2.5} />)}
            {Array.from({ length: 8 }).map((_, k) => <KhG key={k} x={(k % 4 - 1.5) * 13} y={-46 - Math.floor(k / 4) * 12} s={0.8} />)}
          </g>
        ))}
      </svg>
    </div>
  </AbsoluteFill>
);
const S9: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const flip = at(id(16)) + tl(id(16), 3.6); // "하지만 성 하나 앞에서는"
  const u = lerp(f, flip, flip + 40, 0, 1, true);
  const castles = Array.from({ length: 7 }).map((_, i) => [240 + i * 240, 700]);
  const kpos = grid(KN, 33);
  const mpos = grid(MN, 41);
  // 2판 (2026-11-02 사용자: "성 하나에서 몽골이 많았다는 비교 다시 그려, 별로") - 성 7개로 흩어진 뒤 카메라가 첫 성으로 날아들어
  // 가까이 본 성 하나: 성벽 위엔 수비병 몇 명, 성 둘레는 지평선까지 몽골 기병·천막·툭으로 꽉 참 / 구석 작은 칸엔 나머지 성 6개가 제자리에서 지켜보기만
  const zoom = lerp(f, flip + 34, flip + 58, 0, 1, true);
  const close = lerp(f, flip + 40, flip + 56, 0, 1); // 2026-11-02 사용자 "너무 확대돼서 어색" - 2.2배까지만, 그 사이 가까운 성으로 겹쳐 넘어감
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ transform: `scale(${1 + zoom * 1.2})`, transformOrigin: `${castlesX0}px 640px`, opacity: 1 - close }}>
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {u > 0 && castles.map(([x, y], i) => (
          <g key={i} opacity={u} transform={`translate(${x} ${y})`}>
            <path d="M -80 0 L -80 -70 L 80 -70 L 80 0 Z" fill={SAND_D} stroke={INK} strokeWidth={5} />
            {[-70, -35, 0, 35, 70].map((dx) => <rect key={dx} x={dx - 9} y={-88} width={18} height={20} fill={SAND_D} stroke={INK} strokeWidth={4} />)}
            <path d="M -18 0 L -18 -30 C -18 -46 18 -46 18 -30 L 18 0 Z" fill="#2e2018" />
          </g>
        ))}
        {kpos.map(([dx, dy], i) => {
          const c = castles[i % 7];
          const k = Math.floor(i / 7);
          const tx = c[0] + ((k % 8) - 3.5) * 15, ty = c[1] - 92 - Math.floor(k / 8) * 14;
          const x = 620 + dx + (tx - 620 - dx) * u, y = 600 + dy + (ty - 600 - dy) * u;
          return <KhG key={i} x={x} y={y} s={2.3 - u * 1.25} />;
        })}
        {mpos.map(([dx, dy], i) => {
          const c = castles[0];
          const a = (i / MN) * Math.PI * 2;
          const rr = 140 + (i % 3) * 34;
          const tx = c[0] + Math.cos(a) * rr, ty = c[1] - 40 + Math.sin(a) * rr * 0.55;
          const x = 1500 + dx + (tx - 1500 - dx) * u, y = 600 + dy + (ty - 600 - dy) * u;
          return <MoG key={i} x={x} y={y} s={2.0 - u * 0.2} flip={u > 0.5 && Math.cos(a) > 0} />;
        })}
      </svg>
      </AbsoluteFill>
      {close > 0 && <OneCastle f={f - flip - 40} op={close} />}
      <SFX name="tick" at={flip} vol={0.15} dur={10} />
      <SFX name="whoosh" at={flip + 4} vol={0.25} dur={30} />
    </AbsoluteFill>
  );
};

// ================= 10) c1_17 지도: 오트라르엔 작은 고리만, 나머지는 다음 도시로 =================
const S10: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <>
      <MapShot f={f} st={{ split: 1, cut: 1, rings: [0, 0, 0, 0, 0, 0, 1], otrarSmall: lerp(f, 20, 70, 0, 1), onward: lerp(f, 70, frames - 10, 0, 1) }} z={lerp(f, 0, frames, MAP_E.z, MAP_C.z + 0.15, true)} cx={lerp(f, 0, frames, MAP_E.cx, MAP_C.cx + 160, true)} cy={lerp(f, 0, frames, MAP_E.cy, MAP_C.cy, true)} />
      <SFX name="hooves" at={70} vol={0.2} dur={frames - 70} />
    </>
  );
};

// ================= 11) c1_18 오트라르 포위: 성 둘레 몽골 진영, 달이 다섯 번 차고 기욺 =================
const Moon = ({ x, y, r, phase }: { x: number; y: number; r: number; phase: number }) => {
  const off = Math.cos(phase * Math.PI * 2) * r * 2; // 0 보름 → 그믐
  return (
    <svg width={r * 4} height={r * 4} viewBox={`${-2 * r} ${-2 * r} ${4 * r} ${4 * r}`} style={{ position: "absolute", left: x - 2 * r, top: y - 2 * r }}>
      <defs><clipPath id="moonc"><circle r={r} /></clipPath></defs>
      <circle r={r} fill="#ece4cc" />
      <circle cx={off + (off >= 0 ? r * 0.15 : -r * 0.15)} r={r * 1.02} fill="#1f2a3d" clipPath="url(#moonc)" opacity={Math.abs(off) < r * 1.95 ? 1 : 0} />
      <circle r={r * 1.6} fill="none" stroke="rgba(236,228,204,.12)" strokeWidth={r * 0.6} />
    </svg>
  );
};
// 2026-11-02 사용자: "해가 뜨고 지는 걸 빠르게 계속 보여 주자, 시간이 흐르는 걸" - 낮밤이 빠르게 돌아감 (한 바퀴 약 0.8초)
const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, "0")).join("");
};
const DAY_T = 24;
const S11: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const ph = ((f + DAY_T * 0.3) % DAY_T) / DAY_T; // 0 한밤 → 0.5 한낮
  const d = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2); // 밝기 0~1
  const dusk = Math.max(0, 1 - Math.abs(d - 0.45) * 4); // 해 뜨고 질 때 노을
  const top = mixHex(mixHex("#141c2c", "#b9cdd6", d), "#c9805a", dusk * 0.6);
  const bot = mixHex(mixHex("#2c3a52", "#efe4c8", d), "#f0b070", dusk * 0.7);
  // 해: 낮 반쪽 동안 왼쪽 → 오른쪽 호 / 달: 밤 반쪽
  const sunT = (ph - 0.25) * 2, moonT = ((ph + 0.25) % 1) * 2;
  const arc = (t: number) => [160 + t * 1600, 620 - Math.sin(t * Math.PI) * 480];
  const sun = arc(sunT), moon = arc(moonT);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.05, 1.15)} cx={960} cy={600}>
        <AbsoluteFill style={{ background: `linear-gradient(${top}, ${bot} 55%)` }} />
        <div style={{ opacity: 1 - d }}><Stars /></div>
        {sunT >= 0 && sunT <= 1 && <div style={{ position: "absolute", left: sun[0] - 70, top: sun[1] - 70, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(#fff2c4, #f6c062 60%, transparent 72%)", boxShadow: "0 0 90px 40px rgba(255,214,140,.35)" }} />}
        {moonT >= 0 && moonT <= 1 && <div style={{ position: "absolute", left: moon[0] - 50, top: moon[1] - 50, width: 100, height: 100, borderRadius: "50%", background: "#e6dfca", boxShadow: "0 0 60px 18px rgba(230,223,202,.25)" }} />}
        <div style={{ position: "absolute", inset: 0, filter: `brightness(${0.5 + 0.5 * d}) saturate(${0.6 + 0.4 * d})` }}>
          <div style={{ position: "absolute", inset: 0, transform: "translateY(-80px) scale(0.8)", transformOrigin: "50% 80%" }}><City f={f} bare /></div>
          <svg width={1920} height={1080} style={{ position: "absolute" }}><rect x={-40} y={800} width={2000} height={300} fill="#a08a5c" /></svg>
          {Array.from({ length: 11 }).map((_, k) => <Ger key={k} x={60 + k * 180} y={900 + (k % 2) * 40} w={150 + (k % 3) * 20} door={k % 2 ? "#8a3b2c" : "#4d6b8a"} lit={0.85 * (1 - d)} />)}
          {[150, 980, 1700].map((x, k) => <Tug key={x} x={x} y={1010} h={300} sway={Math.sin((f + k * 9) / 12) * 4} />)}
        </div>
        {[200, 620, 1040, 1460, 1800].map((x, k) => <Glow key={x} x={x} y={1000} r={140} color="#ff9a4a" op={(0.55 + 0.15 * Math.sin(f / 4 + k)) * (1 - d)} />)}
      </Cam>
      <SFX name="campfire" at={0} vol={0.2} dur={frames} />
      <SFX name="wind" at={0} vol={0.2} dur={frames} />
    </AbsoluteFill>
  );
};

// ================= 12) c1_19 달밤 사막: 모래 언덕 너머로 끝없이 이어지는 기병 행렬 =================
const S12: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.12)} cx={lerp(f, 0, frames, 1100, 860)} cy={560}>
        <AbsoluteFill style={{ background: "linear-gradient(#0f1626, #2a3550 60%, #4a4a5a)" }} />
        <Stars />
        <Glow x={1500} y={220} r={260} color="#e6dfca" op={0.35} />
        <div style={{ position: "absolute", left: 1440, top: 160, width: 120, height: 120, borderRadius: "50%", background: "#e6dfca", boxShadow: "0 0 70px 20px rgba(230,223,202,.25)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -40 640 C 300 560 600 600 900 580 C 1200 560 1500 620 1960 590 L 1960 1100 L -40 1100 Z" fill="#4a4258" />
          <path d="M -40 760 C 400 680 800 720 1100 690 C 1400 660 1700 720 1960 700 L 1960 1100 L -40 1100 Z" fill="#3a3346" stroke={INK} strokeWidth={4} />
          <path d="M -40 900 C 300 860 700 880 1000 900 C 1300 920 1600 860 1960 880 L 1960 1100 L -40 1100 Z" fill="#2a2434" stroke={INK} strokeWidth={4} />
        </svg>
        {/* 능선을 따라 오른쪽 → 왼쪽(서쪽)으로 끝없이 */}
        {Array.from({ length: 34 }).map((_, i) => {
          const span = 2400;
          const x = ((i * (span / 34) - f * 2.2) % span + span) % span - 240;
          const ridge = 690 - 30 * Math.sin((x + 300) / 500);
          return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={ridge - 66} w={90} flip dark phase={i * 3} />;
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const span = 2600;
          const x = ((i * (span / 12) - f * 3.6) % span + span) % span - 320;
          return <Rider key={`n${i}`} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={860 - 150} w={200} flip dark phase={i * 5} />;
        })}
        {[0, 1, 2].map((i) => {
          const x = ((i * 800 - f * 2.2) % 2400 + 2400) % 2400 - 200;
          return <Tug key={i} x={x + 40} y={690 - 30 * Math.sin((x + 300) / 500) + 4} h={150} color="#14101a" sway={Math.sin((f + i * 9) / 10) * 4} />;
        })}
      </Cam>
      <Dim op={0.1} />
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 20, frames, 0, 1) }} />
      <SFX name="wind" at={0} vol={0.35} dur={frames} />
      <SFX name="hooves" at={0} vol={0.12} dur={frames} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: [id(1), id(2), id(3)], Shot: S1 },
  { ids: [id(4)], Shot: S3 },
  { ids: [id(5), id(6)], Shot: S4 },
  { ids: [id(7)], Shot: S5 },
  { ids: [id(8), id(9), id(10), id(11)], Shot: S6 },
  { ids: [id(12), id(13), id(14)], Shot: S7 },
  { ids: [id(15)], Shot: S8 },
  { ids: [id(16)], Shot: S9 },
  { ids: [id(17)], Shot: S10 },
  { ids: [id(18)], Shot: S11 },
  { ids: [id(19)], Shot: S12 },
];
export const M02Ch1 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m2.1" year="1219" groups={groups} music="tension" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
// 쓰지 않는 값 경고 막기
void spring; void SAND; void SAND_DD; void FPS; void Dim;
