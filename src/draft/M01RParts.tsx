// 몽골 1편 수정판 공용 그림 (2026-11-05) - 사용자 대본판. 1편(M01Ch4)·2편 부품을 그대로 쓰고, 없는 주인공 물건만 여기서 그린다
// 화면 글자 없음(연도 카드만), 사람은 M01Ch4의 Person, 지도는 Cliopatria 1209 윤곽(chinaMap.ts)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CM_LAKES, CM_LAND, CM_POL, CM_RIVERS } from "./chinaMap";
import { clamp, ease, FPS, INK } from "./kit";
import { FlagG, GateTowerG, Look, Mtn, WALL, WallG, WallLine } from "./M01Ch4";

export const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
export const sec = (s: number) => Math.round(s * FPS);
export const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
export const Svg = ({ children, op = 1 }: { children: React.ReactNode; op?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: op, ...ink }}>{children}</svg>
);

// ---------- 인물 차림 ----------
export const WEISHAO: Look = { robe: "#d9a93a", dark: "#b8862a", trim: "#a8332a", hat: "jin_emperor", beard: "thin", collar: "round" };
export const PRINCE_WEI: Look = { robe: "#7a4a7a", dark: "#5e3860", trim: "#c9a24a", hat: "jin_official", beard: "thin", collar: "round" };
export const ZHANGZONG: Look = { robe: "#efe6d4", dark: "#d4c7a8", trim: "#c9a24a", hat: "jin_emperor", beard: "long", collar: "round" };
export const SENGGUM: Look = { robe: "#6a4a5a", dark: "#4f3744", trim: "#c9b08a", hat: "fur", beard: "thin", collar: "cross" };
export const XIA_COUSIN: Look = { robe: "#4f8a7c", dark: "#3c6e62", trim: "#e3c068", hat: "xia_king", beard: "full", collar: "cross" };
export const XIA_LORD: Look = { robe: "#6f9a8a", dark: "#55806f", trim: "#c9a24a", hat: "xia_soldier", beard: "long", collar: "cross" };
// 서하 마을 사람 (옷깃 교차·초록 끝동 - 수비병 옷과 이어 보이게)
export const XIA_FOLK: Look[] = [
  { robe: "#c9bfa2", dark: "#a89e82", trim: "#4f7a70", hat: "porter", beard: "thin", collar: "cross" },
  { robe: "#a8a890", dark: "#888a72", trim: "#4f7a70", hat: "scarf", collar: "cross" },
  { robe: "#b8ad8a", dark: "#968c6c", trim: "#4f7a70", hat: "porter", beard: "long", collar: "cross" },
  { robe: "#98a896", dark: "#7a8a78", trim: "#c9a24a", hat: "scarf", collar: "cross" },
];
export const FARMER: Look = { robe: "#8a7a5a", dark: "#6e6046", trim: "#5a4636", hat: "porter", collar: "round" };
export const HERDER: Look = { robe: "#6a5a44", dark: "#4f4232", trim: "#c9b08a", hat: "fur", beard: "thin", collar: "cross" };
export const HERDER2: Look = { robe: "#7a4a44", dark: "#5e3832", trim: "#c9b08a", hat: "scarf", collar: "cross" };

// ---------- 물건 (판 좌표 svg 조각, 가운데 기준) ----------
export const Sack = ({ x, y, s = 1, c = "#c9a874" }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 40 C -60 -8 -34 -38 -16 -42 L -22 -56 C -8 -62 8 -62 22 -56 L 16 -42 C 34 -38 60 -8 46 40 C 22 50 -22 50 -46 40 Z" fill={c} stroke={INK} strokeWidth={5} />
    <path d="M -18 -42 C -6 -36 6 -36 18 -42" stroke={INK} strokeWidth={5} fill="none" />
    <path d="M -24 6 C -12 12 12 12 24 6 M -28 22 C -14 28 14 28 28 22" stroke="#8a6f44" strokeWidth={3} fill="none" />
  </g>
);
export const SaltBlock = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 30 L -46 -14 L -14 -34 L 46 -34 L 46 12 L 16 30 Z" fill="#efeadf" stroke={INK} strokeWidth={5} />
    <path d="M -46 -14 L 16 -14 L 46 -34 M 16 -14 L 16 30" stroke={INK} strokeWidth={4} fill="none" />
    <path d="M -30 2 l 8 6 M -8 12 l 6 -6 M 26 -8 l 8 4 M -22 -22 l 10 0" stroke="#b9b2a0" strokeWidth={3} />
  </g>
);
export const TeaBrick = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-30} width={100} height={60} rx={4} fill="#5e4630" stroke={INK} strokeWidth={5} />
    <rect x={-40} y={-20} width={80} height={40} fill="none" stroke="#8a6c4a" strokeWidth={3} />
    <path d="M -22 0 C -14 -14 -4 -14 2 0 C -4 12 -14 12 -22 0 Z M 2 0 C 10 -14 20 -14 26 0 C 20 12 10 12 2 0 Z" fill="#7a6040" stroke={INK} strokeWidth={2.5} />
  </g>
);
export const SilkBolt = ({ x, y, s = 1, c = "#b8332a" }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -56 -24 L 40 -24 L 40 24 L -56 24 Z" fill={c} stroke={INK} strokeWidth={5} />
    <ellipse cx={40} cy={0} rx={13} ry={24} fill="#e0b64a" stroke={INK} strokeWidth={4} />
    <ellipse cx={40} cy={0} rx={4} ry={9} fill={INK} />
    <path d="M -56 -8 L 38 -8 M -56 10 L 38 10" stroke="#ffffff" strokeWidth={2.5} opacity={0.35} />
  </g>
);
export const IronBar = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 26 L -26 -10 L 46 -10 L 34 26 Z" fill="#6a7072" stroke={INK} strokeWidth={5} />
    <path d="M -46 2 L -32 -34 L 40 -34 L 28 2 Z" fill="#858c8e" stroke={INK} strokeWidth={5} />
    <path d="M 10 -26 L 58 -46 L 64 -40 L 18 -18 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
  </g>
);
export const Scroll = ({ x, y, s = 1, open = 0 }: { x: number; y: number; s?: number; open?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-54 - open * 30} y={-16} width={108 + open * 60} height={32} fill="#e9c75a" stroke={INK} strokeWidth={4} />
    <rect x={-66 - open * 30} y={-22} width={14} height={44} rx={5} fill="#a8332a" stroke={INK} strokeWidth={4} />
    <rect x={52 + open * 30} y={-22} width={14} height={44} rx={5} fill="#a8332a" stroke={INK} strokeWidth={4} />
    {open > 0.5 && [0, 1, 2].map((i) => <path key={i} d={`M ${-40 - open * 20} ${-8 + i * 8} L ${40 + open * 20} ${-8 + i * 8}`} stroke={INK} strokeWidth={2} opacity={0.5} />)}
  </g>
);
// 쇠 저울 (관리 손에)
export const Balance = ({ x, y, s = 1, tip = 0 }: { x: number; y: number; s?: number; tip?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -90 L 0 -40" stroke={INK} strokeWidth={6} />
    <g transform={`rotate(${tip * 12} 0 -40)`}>
      <path d="M -90 -40 L 90 -40" stroke={INK} strokeWidth={8} />
      <path d="M -90 -40 L -116 20 L -64 20 Z M 90 -40 L 64 20 L 116 20 Z" fill="none" stroke={INK} strokeWidth={3} />
      <path d="M -122 20 C -112 44 -68 44 -58 20 Z" fill="#c9a24a" stroke={INK} strokeWidth={4} />
      <path d="M 58 20 C 68 44 112 44 122 20 Z" fill="#c9a24a" stroke={INK} strokeWidth={4} />
    </g>
  </g>
);
// 화살 다발 비 (t = 지금 프레임, 공중 화살은 한 svg 안에)
export const ArrowVolley = ({ f, x0, x1, y0, y1, n = 26, dir = 1, op = 1 }: { f: number; x0: number; x1: number; y0: number; y1: number; n?: number; dir?: number; op?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: op, overflow: "visible" }}>
    {Array.from({ length: n }).map((_, i) => {
      const k = ((f + i * 7) % 34) / 34;
      const sx = x0 + ((i * 197) % Math.max(1, x1 - x0));
      const x = sx + dir * k * 120, y = y0 + k * (y1 - y0) + (i % 5) * 8;
      return <g key={i} transform={`translate(${x} ${y}) rotate(${dir > 0 ? 66 : 114})`}><path d="M -26 0 L 22 0" stroke={INK} strokeWidth={3.5} /><path d="M 22 -4 L 30 0 L 22 4 Z" fill={INK} /><path d="M -26 -4 L -32 0 L -26 4" stroke={INK} strokeWidth={2} fill="none" /></g>;
    })}
  </svg>
);
// 짐승 등 대신 쓰는 단순 부호: 불·연기 없는 작은 불꽃 (지도 위)
export const MapFire = ({ x, y, k = 1, f }: { x: number; y: number; k?: number; f: number }) => (
  <g transform={`translate(${x} ${y}) scale(${k * (1 + Math.sin(f / 3 + x) * 0.08)})`}>
    <path d="M 0 -30 C -18 -8 -14 10 0 10 C 14 10 18 -8 0 -30 Z" fill="#e8913a" stroke={INK} strokeWidth={3} />
    <path d="M 0 -12 C -7 -2 -5 8 0 8 C 5 8 7 -2 0 -12 Z" fill="#ffd36b" />
  </g>
);
// ---------- 지도 (1209 윤곽): 나라마다 밝기를 따로 ----------
export type Reg = "mongol" | "jin" | "song" | "xia" | "khitan";
const REG_C: Record<Reg, string> = { mongol: "#5d7b98", jin: "#cf8f68", song: "#c6c07a", xia: "#7fb09a", khitan: "#a98fb8" };
export const NationMap = ({ show, fade = {}, wall = 1, children }: { show: Partial<Record<Reg, number>>; fade?: Partial<Record<Reg, number>>; wall?: number; children?: React.ReactNode }) => (
  <AbsoluteFill style={{ background: "#8fb0c0" }}>
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      <rect x={-300} y={-300} width={2520} height={1680} fill="#8fb0c0" />
      <path d={CM_LAND} fill="#e6d2a2" fillRule="evenodd" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {["tibet", "dali", "goryeo"].map((k) => <path key={k} d={CM_POL[k]} fill="#d6c59a" stroke="#8a7a5a" strokeWidth={2.5} strokeDasharray="8 6" />)}
      {(Object.keys(REG_C) as Reg[]).map((k) => (
        <g key={k}>
          <path d={CM_POL[k]} fill="#d8c49a" stroke="#8a7a5a" strokeWidth={2.5} strokeLinejoin="round" />
          {(show[k] ?? 0) > 0 && <path d={CM_POL[k]} fill={REG_C[k]} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" opacity={(show[k] ?? 0) * (1 - (fade[k] ?? 0) * 0.75)} />}
        </g>
      ))}
      <path d={CM_LAKES} fill="#8fb0c0" stroke={INK} strokeWidth={2.5} />
      <path d={CM_RIVERS} stroke="#5f86a0" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={760 + ((i * 263) % 420)} cy={300 + ((i * 47) % 70)} r={2.6} fill="#8a7650" opacity={0.6} />)}
      {[[520, 600, 1], [610, 700, 1.1], [700, 640, 0.9], [560, 780, 1], [1060, 520, 0.8], [1360, 200, 0.8], [1400, 260, 0.7], [660, 140, 0.8]].map(([x, y, k], i) => <Mtn key={i} x={x} y={y} k={k} />)}
      {wall > 0 && <g opacity={wall}><WallLine pts={WALL} /></g>}
      {children}
    </svg>
  </AbsoluteFill>
);
// 지도 위 굵은 화살 (경로 d, 길이 len, p 0~1)
export const MapArrow = ({ d, len, p, c = "#4d6b8a", w = 18, head }: { d: string; len: number; p: number; c?: string; w?: number; head?: string }) => (
  p <= 0 ? null : (
    <g>
      <path d={d} stroke={INK} strokeWidth={w + 10} fill="none" strokeDasharray={`${p * len} 3000`} strokeLinecap="round" />
      <path d={d} stroke={c} strokeWidth={w} fill="none" strokeDasharray={`${p * len} 3000`} strokeLinecap="round" />
      {p > 0.97 && head && <path d={head} fill={c} stroke={INK} strokeWidth={5} />}
    </g>
  )
);
// ---------- 작은 서하 성 (정면) ----------
export const SmallFort = ({ top = 420, base = 760, x0 = 260, x1 = 1660, burn = 0, f = 0, door = 0, c = "#a8957a", flag = "xia", scaffold = 0 }: { top?: number; base?: number; x0?: number; x1?: number; burn?: number; f?: number; door?: number; c?: string; flag?: "xia" | "jin"; scaffold?: number }) => {
  const m = (x0 + x1) / 2;
  return (
    <Svg>
      <WallG x0={x0} x1={x1} top={top} base={base} c={c} />
      <GateTowerG x={m} y={top} s={0.9} burn={burn} />
      {[x0, x1].map((x, i) => <g key={i}><path d={`M ${x - 70} ${base} L ${x - 70} ${top - 50} L ${x + 70} ${top - 50} L ${x + 70} ${base} Z`} fill={c} stroke={INK} strokeWidth={6} />{[-46, -14, 18, 50].map((o) => <rect key={o} x={x + o - 12} y={top - 76} width={24} height={26} fill={c} stroke={INK} strokeWidth={4} />)}</g>)}
      <path d={`M ${m - 90} ${base} L ${m - 90} ${base - 160} C ${m - 70} ${base - 210} ${m + 70} ${base - 210} ${m + 90} ${base - 160} L ${m + 90} ${base} Z`} fill="#3a2a1e" stroke={INK} strokeWidth={6} />
      {/* 문짝: door 0 닫힘 → 1 부서져 벌어짐 */}
      <g transform={`translate(${m - 90} ${base}) rotate(${-door * 62}) translate(${-(m - 90)} ${-base})`}><path d={`M ${m - 90} ${base} L ${m - 90} ${base - 160} C ${m - 80} ${base - 190} ${m - 30} ${base - 202} ${m} ${base - 204} L ${m} ${base} Z`} fill="#7a5230" stroke={INK} strokeWidth={5} /></g>
      <g transform={`translate(${m + 90} ${base}) rotate(${door * 62}) translate(${-(m + 90)} ${-base})`}><path d={`M ${m + 90} ${base} L ${m + 90} ${base - 160} C ${m + 80} ${base - 190} ${m + 30} ${base - 202} ${m} ${base - 204} L ${m} ${base} Z`} fill="#7a5230" stroke={INK} strokeWidth={5} /></g>
      {scaffold > 0 && <g opacity={scaffold}>{Array.from({ length: 8 }).map((_, i) => { const x = m + 200 + i * 56; return <g key={i}><path d={`M ${x} ${base} L ${x} ${top - 40}`} stroke="#7a5230" strokeWidth={8} /><path d={`M ${x - 40} ${top + 60} L ${x + 40} ${top + 60} M ${x - 40} ${top + 170} L ${x + 40} ${top + 170}`} stroke="#8a6440" strokeWidth={7} /></g>; })}</g>}
      <FlagG x={x0} y={top - 76} banner={flag} h={150} t={f} />
      <FlagG x={x1} y={top - 76} banner={flag} h={150} t={f} />
    </Svg>
  );
};
// 저울 두 접시 (서하 고르기)
export const useF = () => useCurrentFrame();
