// 2편 공용 그림: 호라즘 성벽 도시(City)·돔·첨탑·성벽 등 (2026-11-02 M02Ch0에서 떼어 냄 - 훅이 3·4장 그림을 쓰면서 생긴 순환 import를 끊으려고)
import React from "react";
import { AbsoluteFill } from "remotion";
import { Glow, INK } from "./kit";
import { Smoke } from "./M01Ch4";
import { KhFlag, Spearman } from "./M01Ch5";

const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };

// ================= 호라즘 성벽 도시 (사막 흙빛 성벽 + 청록 돔 + 첨탑) =================
export const SAND = "#dcc392";
export const SAND_D = "#b99a63";
export const SAND_DD = "#94784a";
export const DOME = "#3f8f8a";
export const GOLD = "#d9a92e";
export const Dome = ({ x, y, r, c = DOME }: { x: number; y: number; r: number; c?: string }) => (
  <g>
    <rect x={x - r * 0.85} y={y - r * 0.15} width={r * 1.7} height={r * 0.9} fill={SAND} stroke={INK} strokeWidth={4} />
    <path d={`M ${x - r} ${y} C ${x - r} ${y - r * 1.4} ${x + r} ${y - r * 1.4} ${x + r} ${y} Z`} fill={c} stroke={INK} strokeWidth={5} />
    <path d={`M ${x - r * 0.55} ${y - r * 0.5} C ${x - r * 0.4} ${y - r * 0.9} ${x - r * 0.1} ${y - r * 1.02} ${x + r * 0.1} ${y - r * 1.03}`} stroke="#7fc0b8" strokeWidth={r * 0.08} fill="none" opacity={0.6} />
    <path d={`M ${x} ${y - r * 1.04} L ${x} ${y - r * 1.4}`} stroke={GOLD} strokeWidth={5} />
    <circle cx={x} cy={y - r * 1.44} r={Math.max(5, r * 0.07)} fill={GOLD} stroke={INK} strokeWidth={3} />
  </g>
);
export const Minaret = ({ x, base, h, w = 64 }: { x: number; base: number; h: number; w?: number }) => {
  const t = base - h;
  return (
    <g>
      <path d={`M ${x - w / 2} ${base} L ${x - w * 0.34} ${t} L ${x + w * 0.34} ${t} L ${x + w / 2} ${base} Z`} fill={SAND} stroke={INK} strokeWidth={5} />
      {[0.15, 0.32, 0.5, 0.68, 0.84].map((u) => <path key={u} d={`M ${x - w / 2 + w * 0.16 * u} ${base - h * u} L ${x + w / 2 - w * 0.16 * u} ${base - h * u}`} stroke={SAND_D} strokeWidth={7} />)}
      <rect x={x - w * 0.5} y={t - 46} width={w} height={46} fill={SAND_D} stroke={INK} strokeWidth={5} />
      {[-0.25, 0, 0.25].map((u) => <path key={u} d={`M ${x + u * w - 6} ${t - 6} L ${x + u * w - 6} ${t - 26} C ${x + u * w - 6} ${t - 36} ${x + u * w + 6} ${t - 36} ${x + u * w + 6} ${t - 26} L ${x + u * w + 6} ${t - 6} Z`} fill="#3a2a1e" />)}
      <path d={`M ${x - w * 0.42} ${t - 46} C ${x - w * 0.42} ${t - 96} ${x + w * 0.42} ${t - 96} ${x + w * 0.42} ${t - 46} Z`} fill={DOME} stroke={INK} strokeWidth={4} />
      <path d={`M ${x} ${t - 84} L ${x} ${t - 110}`} stroke={GOLD} strokeWidth={4} />
    </g>
  );
};
export const House = ({ x, y, w, h, c = SAND }: { x: number; y: number; w: number; h: number; c?: string }) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill={c} stroke={INK} strokeWidth={4} />
    <path d={`M ${x - 4} ${y - h} L ${x + w + 4} ${y - h}`} stroke={SAND_DD} strokeWidth={7} />
    <path d={`M ${x + w * 0.35} ${y} L ${x + w * 0.35} ${y - h * 0.45} C ${x + w * 0.35} ${y - h * 0.62} ${x + w * 0.65} ${y - h * 0.62} ${x + w * 0.65} ${y - h * 0.45} L ${x + w * 0.65} ${y} Z`} fill="#3a2a1e" />
  </g>
);
// 성벽 한 줄: 위에 톱니(여장) + 돌 줄눈
export const WallStrip = ({ x0, x1, top, base, c = SAND_D }: { x0: number; x1: number; top: number; base: number; c?: string }) => (
  <g>
    <rect x={x0} y={top} width={x1 - x0} height={base - top} fill={c} stroke={INK} strokeWidth={6} />
    {Array.from({ length: Math.ceil((x1 - x0) / 46) }).map((_, i) => <rect key={i} x={x0 + i * 46} y={top - 26} width={26} height={28} fill={c} stroke={INK} strokeWidth={5} />)}
    {Array.from({ length: Math.floor((base - top) / 42) }).map((_, i) => <path key={`r${i}`} d={`M ${x0} ${top + 30 + i * 42} L ${x1} ${top + 30 + i * 42}`} stroke={SAND_DD} strokeWidth={3} opacity={0.6} />)}
  </g>
);
export const Tower = ({ x, top, base, w = 110, c = SAND }: { x: number; top: number; base: number; w?: number; c?: string }) => (
  <g>
    <path d={`M ${x - w / 2} ${base} L ${x - w * 0.44} ${top} L ${x + w * 0.44} ${top} L ${x + w / 2} ${base} Z`} fill={c} stroke={INK} strokeWidth={6} />
    {[-0.33, 0, 0.33].map((u) => <rect key={u} x={x + u * w - 11} y={top - 28} width={22} height={30} fill={c} stroke={INK} strokeWidth={5} />)}
    <path d={`M ${x - 8} ${top + 50} L ${x - 8} ${top + 80} L ${x + 8} ${top + 80} L ${x + 8} ${top + 50} Z`} fill="#3a2a1e" />
  </g>
);
// 도시 판 (1920×1080, 성벽 위 = WALL_TOP). burn 0~1 불타는 도시
export const WALL_TOP = 560;
export const TOWERS = [40, 300, 560, 820, 1100, 1360, 1620, 1880];
export const CityG = ({ burn = 0 }: { burn?: number }) => (
  <g>
    {/* 안쪽 집들 (뒤 → 앞) */}
    {Array.from({ length: 34 }).map((_, i) => {
      const x = -40 + ((i * 263) % 2000);
      const row = i % 3;
      return <House key={i} x={x} y={WALL_TOP - 10 - row * 26} w={70 + (i % 4) * 22} h={60 + ((i * 7) % 5) * 16} c={row === 1 ? "#d3b886" : SAND} />;
    })}
    <Minaret x={1530} base={WALL_TOP} h={430} w={74} />
    <Dome x={980} y={WALL_TOP - 110} r={150} />
    <Dome x={620} y={WALL_TOP - 70} r={84} c="#4f8fa8" />
    <Dome x={1320} y={WALL_TOP - 80} r={96} />
    <Minaret x={800} base={WALL_TOP - 40} h={300} w={54} />
    <Minaret x={1160} base={WALL_TOP - 40} h={330} w={56} />
    <Dome x={260} y={WALL_TOP - 60} r={64} c="#4f8fa8" />
    <Dome x={1760} y={WALL_TOP - 60} r={70} />
    {burn > 0 && <rect x={-40} y={WALL_TOP - 420} width={2000} height={420} fill="#ff9a3a" opacity={0.28 * burn} />}
    {/* 바깥 큰 성벽 + 망루 + 성문 */}
    <WallStrip x0={-40} x1={1960} top={WALL_TOP} base={800} />
    {TOWERS.map((x) => <Tower key={x} x={x} top={WALL_TOP - 70} base={800} w={x === 820 || x === 1100 ? 150 : 110} />)}
    <path d="M 900 800 L 900 690 C 900 630 1020 630 1020 690 L 1020 800 Z" fill="#2e2018" stroke={INK} strokeWidth={6} />
    <path d="M 880 800 L 880 680 C 880 610 1040 610 1040 680 L 1040 800" fill="none" stroke={SAND_DD} strokeWidth={10} />
    {/* 해자 + 다리 */}
    <path d="M -40 800 L 1960 800 L 1960 846 L -40 846 Z" fill="#6f93a8" stroke={INK} strokeWidth={4} />
    <path d="M 890 800 L 1030 800 L 1050 850 L 870 850 Z" fill="#9a7a4e" stroke={INK} strokeWidth={4} />
  </g>
);
// 대추야자 (성 밖)
export const Palm = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <svg width={240 * s} height={420 * s} viewBox="-120 -420 240 420" style={{ position: "absolute", left: x - 120 * s, top: y - 420 * s, ...ink }}>
    <path d="M 0 0 C -10 -120 10 -240 -6 -330" stroke={INK} strokeWidth={22} fill="none" />
    <path d="M 0 0 C -10 -120 10 -240 -6 -330" stroke="#7a5a38" strokeWidth={14} fill="none" />
    {[-150, -110, -60, -20, 30, 70, 120].map((a, i) => (
      <path key={i} d={`M -6 -330 q ${Math.cos((a * Math.PI) / 180) * 60} ${-30 + Math.sin((a * Math.PI) / 180) * 30} ${Math.cos((a * Math.PI) / 180) * 120} ${Math.abs(Math.sin((a * Math.PI) / 180)) * 50 - 10}`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
    ))}
    {[-150, -110, -60, -20, 30, 70, 120].map((a, i) => (
      <path key={`g${i}`} d={`M -6 -330 q ${Math.cos((a * Math.PI) / 180) * 60} ${-30 + Math.sin((a * Math.PI) / 180) * 30} ${Math.cos((a * Math.PI) / 180) * 120} ${Math.abs(Math.sin((a * Math.PI) / 180)) * 50 - 10}`} stroke="#5e7a3a" strokeWidth={9} fill="none" strokeLinecap="round" />
    ))}
  </svg>
);
// 도시 전체 장면: 하늘·먼 산·도시·성벽 위 수비병·깃발·성 밖 (burn이면 노을·연기·불빛)
export const City = ({ f, burn = 0, guards = true, bare = false }: { f: number; burn?: number; guards?: boolean; bare?: boolean }) => (
  <AbsoluteFill>
    {!bare && <AbsoluteFill style={{ background: burn > 0 ? "linear-gradient(#3a2230, #c0603a 55%, #e8a05a)" : "linear-gradient(#e6d6b0, #f1e4c6 50%)" }}/>}
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      {!bare && <path d="M -40 330 L 160 250 L 330 300 L 520 220 L 760 290 L 1000 230 L 1240 300 L 1460 210 L 1700 280 L 1960 240 L 1960 560 L -40 560 Z" fill={burn > 0 ? "#6a4a4a" : "#c9b48e"} stroke={INK} strokeWidth={4} opacity={0.8} />}
      <CityG burn={burn} />
      {!bare && <rect x={-40} y={846} width={2000} height={300} fill={burn > 0 ? "#7a5a3a" : "#d2b47c"} />}
      <path d="M 870 850 C 820 940 700 1020 600 1100 L 1300 1100 C 1200 1020 1100 940 1050 850 Z" fill={burn > 0 ? "#8a6a48" : "#e0c690"} stroke={INK} strokeWidth={4} />
    </svg>
    {/* 성벽 위 수비병: 망루 사이마다 빽빽이 */}
    {guards && Array.from({ length: 52 }).map((_, i) => {
      const x = 20 + i * 37.5;
      if (TOWERS.some((t) => Math.abs(t - x) < 60) || (x > 870 && x < 1050)) return null;
      return <Spearman key={i} x={x} y={WALL_TOP + 4} s={0.17} spear={Math.sin(f / 20 + i) * 4} col={burn > 0 ? "#1d1612" : "#4a3a2e"} />;
    })}
    {burn === 0 && TOWERS.map((x, i) => <KhFlag key={x} x={x} y={WALL_TOP - 96} h={130} dir={i % 2 ? 1 : -1} />)}
    {!bare && <><Palm x={140} y={1010} s={1.1} />
    <Palm x={1790} y={1030} s={1.2} />
    <Palm x={1620} y={990} s={0.8} /></>}
    {burn > 0 && (
      <>
        {[[640, 420], [980, 330], [1320, 400], [300, 480], [1700, 470]].map(([x, y], i) => <Smoke key={i} x={x} y={y} f={f + i * 17} n={4} s={1.2} />)}
        {[[600, 470], [1000, 430], [1350, 460], [1530, 300]].map(([x, y], i) => <Glow key={`g${i}`} x={x} y={y} r={220} color="#ff8a3a" op={0.5 + 0.15 * Math.sin(f / 5 + i)} />)}
      </>
    )}
  </AbsoluteFill>
);

