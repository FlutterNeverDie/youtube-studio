// 몽골 1편 검수용 초안 - 3장 "숫자 10: 몽골 군대 해부" (2026-10-26) ★ 이 편의 핵심 분석
// 흐름: 원수 부족들이 모였다 흩어짐 → 숫자 10으로 다시 짬(10·100·1,000·10,000) → 장점 넷(명령·섞기·연대 책임·떼어 쓰기)
//       → 몰이사냥(네르게)으로 훈련 → 같은 원이 적군 포위로 → 말 갈아타기
// 화면 글자는 숫자·연도·기호만 (이름 낱말은 내레이션이 말함). 짐승·말·작은 병사 점은 이 파일에서 코드로 그림
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import rigs from "../episode/char-rig.json";
import { Character, type Beat } from "../episode/Character";
import { BigNum, Chapter, clamp, ease, fadeIn, Fire, FPS, Ger, Group, INK, Paper, Rider, SERIF, SFX, ShotProps, Stars, Tug } from "./kit";

const S = (s: number) => Math.round(s * FPS);
const RED = "#a8332a";
const PAPER = "#f1e5c8";
const lerp = (f: number, a: number, b: number, from: number, to: number) => interpolate(f, [a, b], [from, to], { ...clamp, easing: ease });
const range = (n: number, from = 0) => Array.from({ length: n }, (_, i) => i + from);

// ---------- 이 장 전용 소품 ----------
// 캐릭터 한 명 (등 깃발 flag = 소속 색 · 기울임 rot · 흐림 op). 발이 bottom(px, 화면 아래에서)에 닿음
// 소속은 옷 색 대신 등에 꽂은 작은 삼각 깃발로 (색 필터는 얼굴까지 물들어서 안 씀)
type GuyP = { id?: string; x: number; bottom?: number; h?: number; flag?: string; rot?: number; op?: number; pose?: string; flip?: boolean; enter?: "up" | "pop" | "none"; delay?: number; beat?: Beat; beatAt?: number; gesture?: string; gestureAt?: number };
const Guy = ({ id = "archer", x, bottom = 150, h = 240, flag, rot = 0, op = 1, enter = "none", ...p }: GuyP) => {
  const w = (h * 600) / 720;
  return (
    <div style={{ position: "absolute", left: x - w / 2, bottom, width: w, height: h, opacity: op, transform: rot ? `rotate(${rot}deg)` : undefined, transformOrigin: "50% 100%", filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.28))" }}>
      {flag && (
        <svg width={w} height={h} viewBox="0 0 600 720" style={{ position: "absolute", inset: 0, overflow: "visible", filter: "url(#kit-ink)" }}>
          <path d="M 410 520 L 410 40" stroke={INK} strokeWidth={14} />
          <path d="M 416 44 L 590 92 L 416 142 Z" fill={flag} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        </svg>
      )}
      <Character id={id} height={h} enter={enter} {...p} />
    </div>
  );
};
// 색 섞기 (#rrggbb)
const mixColor = (a: string, b: string, t: number) => {
  const c = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(c(a, i) + (c(b, i) - c(a, i)) * t).toString(16).padStart(2, "0")).join("");
};
const UNIT = "#f2ead8"; // 새 부대 색 (흰 툭과 같음)
const Ground = ({ y = 930 }: { y?: number }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, bottom: 0, background: "linear-gradient(#9fb065, #86994f)", borderTop: `5px solid ${INK}` }} />
);
// 장점 번호 (왼쪽 위 동그라미)
const Badge = ({ n, at = 0 }: { n: number; at?: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const k = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", left: 50, top: 40, width: 128, height: 128, borderRadius: "50%", border: `7px solid ${INK}`, background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})`, boxShadow: "0 6px 0 rgba(43,29,20,0.25)", filter: "url(#kit-ink)" }}>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 90, color: INK, lineHeight: 1, fontVariantNumeric: "lining-nums" }}>{n}</span>
    </div>
  );
};
// 사람 아이콘 (SVG 안, 발이 y) - 높이 약 21
const Pin = ({ x, y, s = 1, c = INK, op = 1 }: { x: number; y: number; s?: number; c?: string; op?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op} fill={c}>
    <circle cx={0} cy={-15} r={5.5} />
    <path d="M -8 0 C -8 -11 8 -11 8 0 Z" />
  </g>
);
// 휘는 화살표 (p = 그려진 정도 0~1)
const Arrow = ({ x1, y1, x2, y2, cx, cy, p, color = RED, w = 10, op = 1 }: { x1: number; y1: number; x2: number; y2: number; cx?: number; cy?: number; p: number; color?: string; w?: number; op?: number }) => {
  if (p <= 0.01) return null;
  const qx = cx ?? (x1 + x2) / 2;
  const qy = cy ?? (y1 + y2) / 2;
  const N = 24;
  const pts = range(N + 1).map((i) => {
    const t = (i / N) * p;
    return [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * qx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * qy + t * t * y2];
  });
  const [ex, ey] = pts[N];
  const [px, py] = pts[N - 2];
  const a = Math.atan2(ey - py, ex - px);
  const L = w * 2.8;
  const head = `M ${ex + Math.cos(a) * L * 0.5} ${ey + Math.sin(a) * L * 0.5} L ${ex + Math.cos(a + 2.5) * L} ${ey + Math.sin(a + 2.5) * L} L ${ex + Math.cos(a - 2.5) * L} ${ey + Math.sin(a - 2.5) * L} Z`;
  return (
    <g opacity={op}>
      <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
};
// 짐승 (옆모습, 오른쪽을 봄): 사슴·늑대·토끼. y = 발
const Beast = ({ sp, x, y, s = 1, f = 0, flip = false, op = 1 }: { sp: "deer" | "wolf" | "hare" | "fox"; x: number; y: number; s?: number; f?: number; flip?: boolean; op?: number }) => {
  const sw = Math.sin(f * 0.6) * 22;
  const r = (a: number) => (a * Math.PI) / 180;
  const leg = (x0: number, y0: number, len: number, a: number) => <path d={`M ${x0} ${y0} L ${x0 + Math.sin(r(a)) * len} ${y0 + Math.cos(r(a)) * len}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={op}>
      {sp === "deer" && (
        <>
          {leg(-16, -30, 30, -sw)}
          {leg(16, -30, 30, sw)}
          <ellipse cx={0} cy={-36} rx={27} ry={12} fill="#a8743e" stroke={INK} strokeWidth={3.5} />
          <path d="M 18 -42 L 28 -66 L 38 -62 L 30 -36 Z" fill="#a8743e" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M 26 -68 L 46 -60 L 42 -54 L 30 -58 Z" fill="#a8743e" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d="M 30 -68 L 24 -86 M 26 -78 L 16 -84 M 33 -68 L 40 -88 M 37 -79 L 46 -84" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
          <ellipse cx={-27} cy={-40} rx={5} ry={4} fill="#f1e8d6" stroke={INK} strokeWidth={2} />
          {leg(-10, -30, 30, sw)}
          {leg(22, -30, 30, -sw)}
        </>
      )}
      {sp === "wolf" && (
        <>
          {leg(-16, -22, 22, -sw)}
          {leg(16, -22, 22, sw)}
          <path d="M -24 -32 C -46 -36 -54 -22 -58 -12 C -44 -20 -34 -22 -24 -24 Z" fill="#6e6b64" stroke={INK} strokeWidth={3} />
          <ellipse cx={0} cy={-29} rx={27} ry={10} fill="#7d7a72" stroke={INK} strokeWidth={3.5} />
          <path d="M 18 -36 L 34 -40 L 50 -30 L 34 -24 L 20 -24 Z" fill="#7d7a72" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M 26 -38 L 28 -48 L 33 -39 Z" fill="#7d7a72" stroke={INK} strokeWidth={2.5} />
          {leg(-10, -22, 22, sw)}
          {leg(22, -22, 22, -sw)}
        </>
      )}
      {sp === "fox" && (
        <>
          {leg(-12, -18, 18, -sw)}
          {leg(12, -18, 18, sw)}
          <path d="M -20 -26 C -44 -34 -54 -18 -56 -8 C -46 -12 -36 -16 -20 -20 Z" fill="#c8702e" stroke={INK} strokeWidth={3} />
          <path d="M -50 -12 C -54 -10 -56 -8 -56 -8 C -52 -8 -50 -10 -46 -11 Z" fill="#f2ead8" />
          <ellipse cx={0} cy={-24} rx={22} ry={8} fill="#c8702e" stroke={INK} strokeWidth={3.5} />
          <path d="M 14 -30 L 28 -34 L 42 -24 L 28 -18 L 16 -19 Z" fill="#c8702e" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M 22 -32 L 24 -44 L 30 -33 Z" fill="#c8702e" stroke={INK} strokeWidth={2.5} />
          <path d="M 30 -22 L 42 -24 L 30 -19 Z" fill="#f2ead8" />
          {leg(-8, -18, 18, sw)}
          {leg(18, -18, 18, -sw)}
        </>
      )}
      {sp === "hare" && (
        <>
          <ellipse cx={0} cy={-10} rx={14} ry={9} fill="#b49a72" stroke={INK} strokeWidth={3} />
          <circle cx={13} cy={-18} r={6} fill="#b49a72" stroke={INK} strokeWidth={3} />
          <path d={`M 12 -22 L ${8 + sw * 0.1} -38 M 15 -22 L ${16 + sw * 0.1} -38`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
    </g>
  );
};
// 위에서 본 기병 점 (갈색 말 + 먹색 사람)
const Dot = ({ x, y, c = INK, s = 1, op = 1 }: { x: number; y: number; c?: string; s?: number; op?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={0} rx={11} ry={7} fill="#8a5a34" stroke={INK} strokeWidth={2} />
    <circle cx={0} cy={0} r={5.5} fill={c} />
  </g>
);
// 위에서 본 적 병사 (회청색 방패)
const Foe = ({ x, y, op = 1, s = 1 }: { x: number; y: number; op?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M -11 -12 L 11 -12 L 11 2 C 11 10 0 15 0 15 C 0 15 -11 10 -11 2 Z" fill="#5d6f86" stroke={INK} strokeWidth={2.5} />
    <path d="M 0 -9 L 0 10 M -7 -3 L 7 -3" stroke="#d9dde0" strokeWidth={2.5} />
  </g>
);
// 위에서 본 들판
const Field = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #a8b86e, #8a9a52)" }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {range(140).map((i) => {
        const x = (i * 263) % 1920;
        const y = (i * 151 + (i % 7) * 37) % 1080;
        return <path key={i} d={`M ${x} ${y} l -5 -12 M ${x} ${y} l 2 -14 M ${x} ${y} l 8 -10`} stroke="#5f7236" strokeWidth={2.4} opacity={0.6} strokeLinecap="round" />;
      })}
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(30,18,8,.4))" }} />
  </AbsoluteFill>
);

// ---------- 초록 몽골 초원 (2026-10-26 사용자: "몽골 초원은 초록인데 왜 흙밭이지") - kit의 Steppe(흙빛) 대신 이 장 전용 ----------
// 하늘 + 멀리 푸른 언덕 + 가까운 초록 언덕 + 초록 땅(풀결·들꽃 조금). time: day · dusk · night
const SKY3 = { day: ["#dfe6df", "#efe8cf"], dusk: ["#c98a5e", "#ebc48f"], night: ["#1d2738", "#344157"] };
const FAR3 = { day: "#9fb3a0", dusk: "#8a8a6a", night: "#2a3438" };
const HILL3 = { day: "#a9b872", dusk: "#8a8f56", night: "#2b3530" };
const LAND3 = { day: ["#9fb065", "#86994f"], dusk: ["#7c8148", "#5e6236"], night: ["#232c26", "#1a201c"] };
const Steppe = ({ time = "day", horizon = 640, hills = true }: { time?: keyof typeof SKY3; horizon?: number; hills?: boolean }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `linear-gradient(${SKY3[time][0]}, ${SKY3[time][1]} ${horizon / 10.8}%)` }} />
    {time === "night" && <Stars />}
    {time === "dusk" && <div style={{ position: "absolute", left: 1300, top: horizon - 160, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(#ffe2a8, #f0a865 60%, transparent 70%)", opacity: 0.85 }} />}
    {hills && (
      <svg width="1920" height="1080" style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        <path d={`M 0 ${horizon - 70} C 260 ${horizon - 130} 560 ${horizon - 120} 820 ${horizon - 80} C 1100 ${horizon - 40} 1380 ${horizon - 150} 1920 ${horizon - 90} L 1920 ${horizon} L 0 ${horizon} Z`} fill={FAR3[time]} stroke={INK} strokeWidth={3} opacity={0.85} />
        <path d={`M 0 ${horizon - 40} C 300 ${horizon - 110} 520 ${horizon - 90} 760 ${horizon - 40} C 1000 ${horizon} 1300 ${horizon - 120} 1920 ${horizon - 60} L 1920 1080 L 0 1080 Z`} fill={HILL3[time]} stroke={INK} strokeWidth={4} />
      </svg>
    )}
    <div style={{ position: "absolute", left: 0, right: 0, top: horizon, bottom: 0, background: `linear-gradient(${LAND3[time][0]}, ${LAND3[time][1]})`, borderTop: `5px solid ${INK}` }} />
    <svg width="1920" height="1080" style={{ position: "absolute" }}>
      {range(46).map((i) => {
        const y = horizon + 20 + ((i * 89) % Math.max(40, 1080 - horizon - 20));
        const k = 0.5 + (y - horizon) / 700;
        const x = (i * 211) % 1920;
        return <path key={i} d={`M ${x} ${y} l ${-6 * k} ${-14 * k} M ${x} ${y} l ${2 * k} ${-18 * k} M ${x} ${y} l ${9 * k} ${-12 * k}`} stroke={time === "night" ? "#141a16" : "#5f7236"} strokeWidth={3} strokeLinecap="round" opacity={0.7} />;
      })}
      {time !== "night" && range(14).map((i) => {
        const y = horizon + 40 + ((i * 131) % Math.max(40, 1080 - horizon - 40));
        const x = (i * 457 + 90) % 1920;
        return <circle key={`fl${i}`} cx={x} cy={y} r={4 + (y - horizon) / 160} fill={["#e8d36a", "#f2ead8", "#c98ab0"][i % 3]} stroke={INK} strokeWidth={1.5} />;
      })}
    </svg>
  </AbsoluteFill>
);
// ---------- 1) 원수였던 부족들: 노려보다가, 불리해지자 각자 족장 깃발 따라 흩어짐 (c3_01) ----------
const TRIBES = [
  { x: 280, hue: 0, flag: "#a8332a", dx: -1150, dy: 0, s: 1 },
  { x: 720, hue: 150, flag: "#3d5a80", dx: -380, dy: -300, s: 0.4 },
  { x: 1200, hue: 70, flag: "#5b7a3a", dx: 380, dy: -300, s: 0.4 },
  { x: 1640, hue: 270, flag: "#c9a24a", dx: 1150, dy: 0, s: 1 },
];
// 쏟아지는 화살 (오른쪽 위에서 비스듬히 날아와 땅에 꽂힘) - 전투가 불리해짐
const ArrowRain = ({ f, t0, n = 22 }: { f: number; t0: number; n?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
    {range(n).map((i) => {
      const ta = t0 + i * 2.5;
      if (f < ta) return null;
      const lx = 120 + ((i * 431) % 1700);
      const ly = 800 + ((i * 97) % 220);
      const p = Math.min(1, (f - ta) / 12);
      const sx = lx + 520, sy = -120;
      const x = sx + (lx - sx) * p;
      const y = sy + (ly - sy) * p;
      const a = (Math.atan2(ly - sy, lx - sx) * 180) / Math.PI;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M -110 0 L 0 0" stroke="#6b4a2c" strokeWidth={5} />
          <path d="M 0 0 L -14 -6 L -14 6 Z" fill="#9aa0a4" stroke={INK} strokeWidth={2} />
          <path d="M -110 0 L -124 -9 M -110 0 L -124 9 M -100 0 L -114 -9 M -100 0 L -114 9" stroke="#e8e0cc" strokeWidth={4} />
        </g>
      );
    })}
  </svg>
);
const Shot1 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  // 2026-10-27 첫 줄 앞에 "1206년, 칭기즈칸은 초원의 부족들을 하나로 묶습니다" 추가 - 문장 시작(4.5·8.4·12.6초)에 맞춰 뒤로 밂
  const glare = S(5.0);
  const enemy = S(8.6);
  const flee = S(10.2);
  const alone = S(12.8);
  // 족장이 먼저 달아나고, 병사들이 한 박 늦게 따라감
  const runAt = (lag: number) => interpolate(f, [flee + lag, flee + lag + 50], [0, 1], { ...clamp, easing: (x) => x * x });
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={600} />
      {/* 진영: 게르들 + 칭기즈칸의 흰 툭과 호위병 */}
      <Ger x={260} y={600} w={200} />
      <Ger x={470} y={590} w={150} />
      <Ger x={1480} y={590} w={170} />
      <Ger x={1700} y={605} w={220} />
      <Tug x={1080} y={600} h={300} sway={Math.sin(f / 11) * 4} />
      <Guy x={830} bottom={480} h={170} />
      <Guy x={1180} bottom={480} h={170} />
      <Guy id="genghis" x={960} bottom={470} h={290} enter="up" delay={4} pose={f < flee ? "front" : "angry"} beat={f < flee ? "none" : "shake"} beatAt={f < alone ? flee + 14 : alone} />
      {TRIBES.map((t, i) => {
        const op = t.s < 1 ? 1 - interpolate(f, [flee + 36, flee + 56], [0, 1], clamp) : 1;
        // 0↔1, 2↔3 이 서로 노려봄
        const faceRight = i % 2 === 0;
        const fleeRight = t.dx > 0;
        const at = (lag: number) => {
          const k = runAt(lag);
          return { transform: `translate(${t.dx * k}px, ${t.dy * k}px) scale(${1 - (1 - t.s) * k})`, transformOrigin: `${t.x}px 980px` };
        };
        return (
          <AbsoluteFill key={i} style={{ opacity: op }}>
            {/* 족장 + 부족 깃발 */}
            <AbsoluteFill style={at(0)}>
              <Tug x={t.x + 70} y={880} h={340} color={t.flag} sway={Math.sin(f / 9 + i) * 6} />
              <Guy id="taichiud_chief" x={t.x} bottom={150} h={270} enter="pop" delay={i * 6}
                pose={f < glare ? "front" : f < flee ? "angry" : "shocked"} flip={f < glare ? false : f < flee ? faceRight : fleeRight}
                beat={f < glare ? "none" : f < flee ? "shake" : "jump"} beatAt={f < flee ? glare + i * 3 : flee - 4} />
            </AbsoluteFill>
            {/* 병사 둘 (족장을 따라 늦게) */}
            {[-110, 110].map((o, j) => (
              <AbsoluteFill key={j} style={at(8 + j * 5)}>
                <Guy x={t.x + o} bottom={95} h={225} flag={t.flag} enter="pop" delay={i * 6 + 3 + j * 3}
                  pose={f < glare ? "front" : f < flee ? "angry" : "shocked"} flip={f < glare ? false : f < flee ? faceRight : fleeRight}
                  beat={f < glare ? "none" : f < flee ? "shake" : "jump"} beatAt={f < flee ? glare + j * 4 + i * 3 : flee + 6 + j * 3} />
              </AbsoluteFill>
            ))}
          </AbsoluteFill>
        );
      })}
      {f >= enemy && <ArrowRain f={f} t0={enemy} />}
      <SFX name="arrow_rain" at={enemy} vol={0.35} dur={70} />
    </AbsoluteFill>
  );
};

// ---------- 2) 칭기즈칸이 다시 짬: 뒤엉킨 병사들이 가지런히 → "10" (c3_02) ----------
const Shot2 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = S(1.0);
  const ten = S(3.3);
  const k = spring({ frame: f - snap, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <Paper />
      <Ground y={930} />
      {range(10).map((i) => {
        const c = i % 5;
        const back = i < 5;
        const tx = 1010 + c * 175 + (back ? 0 : 88);
        const tb = back ? 420 : 150;
        const jx = 1000 + ((i * 397) % 820);
        const jb = 150 + ((i * 211) % 300);
        const jr = ((i * 53) % 40) - 20;
        return <Guy key={i} x={jx + (tx - jx) * k} bottom={jb + (tb - jb) * k} h={back ? 200 : 240} rot={jr * (1 - k)} flag={TRIBES[i % 4].flag} pose={f < snap + 8 ? "angry" : "front"} beat="none" />;
      })}
      <Guy id="genghis" x={470} h={760} bottom={50} pose={f >= ten ? "smug" : "angry"} gesture="fist" gestureAt={snap - 8} beat="none" />
      <BigNum text="10" at={ten} size={240} x={430} y={-330} />
      <SFX name="boom" at={ten} vol={0.4} />
    </AbsoluteFill>
  );
};

// ---------- 3) 병사 10명 + 앞에 대장 1명 = "10" (c3_03, 도입부 마지막 장면에서 이어짐) ----------
const Shot3 = () => {
  const f = useCurrentFrame();
  const cap = S(1.4);
  return (
    <AbsoluteFill>
      <Paper />
      <Ground y={930} />
      <BigNum text="10" at={2} size={380} y={-250} />
      {f >= cap - 6 && <div style={{ opacity: fadeIn(f, cap - 6, 8) }}><Tug x={1075} y={950} h={420} /></div>}
      {range(10).map((i) => <Guy key={i} x={i < 5 ? 230 + i * 120 : 1210 + (i - 5) * 120} h={240} bottom={150} enter="pop" delay={i * 3} />)}
      <Guy x={960} h={330} bottom={120} pose="smug" enter="up" delay={cap} />
    </AbsoluteFill>
  );
};

// ---------- 4) 트리: 대장 1 → 10 → 100 → 1,000 → 10,000 (c3_04~c3_09) ----------
// 줄(c3_04·05·06)마다 위에 새 대장이 생기고, 지금까지의 트리가 가운데 가지로 줄어들며 같은 가지 9개가 펼쳐짐 (현대 군대: 분대 → 중대 → 대대 → 사단)
// 계급은 글자 없이 모자 색: 병사 먹색 · 십 갈색 · 백 파랑 · 천 빨강 · 만 금색 (+ 열 명 줄에선 계급만큼 작은 깃발)
const RANK = [INK, "#8a5a34", "#3d5a80", RED, "#c9a24a"];
const TW0 = 150, TW = 1480;
const tx = (N: number, i: number) => TW0 + ((i + 0.5) * TW) / N;
const rowsY = (n: number) => {
  const sp = Math.min(250, 700 / (n - 1));
  const top = 230 + (700 - sp * (n - 1)) / 2;
  return range(n).map((j) => top + j * sp);
};
const PIN_S: Record<number, number> = { 1: 4.2, 10: 2.4, 100: 0.75, 1000: 0.24 };
const fmt = (n: number) => n.toLocaleString("en-US");
const RankFlags = ({ x, y, r, s = 1 }: { x: number; y: number; r: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M 0 0 L 0 ${-14 - r * 11}`} stroke={INK} strokeWidth={2.5} />
    {range(r).map((k) => <path key={k} d={`M 1 ${-14 - k * 11 - 10} L 13 ${-14 - k * 11 - 5} L 1 ${-14 - k * 11} Z`} fill={RANK[r]} stroke={INK} strokeWidth={1.5} />)}
  </g>
);
const TreeShot = ({ at }: ShotProps) => {
  const f = useCurrentFrame();
  const a5 = at("c3_05"), a6 = at("c3_06"), a7 = at("c3_07"), a8 = at("c3_08"), a9 = at("c3_09");
  const T = [0, S(1.2), a5 + S(1.0), a6 + S(1.6)];
  const faces = a9 + S(9.3);
  if (f >= faces) return <Shot5Faces f0={faces} />;
  let s = 0;
  for (let k = 1; k < 4; k++) if (f >= T[k]) s = k;
  const n = s + 2;
  const p = s === 0 ? 1 : interpolate(f, [T[s], T[s] + 50], [0, 1], { ...clamp, easing: ease });
  const yN = rowsY(n);
  const yO = rowsY(Math.max(2, n - 1));
  // 칸 자리: 새 줄 j, i번째 (전 단계 트리는 가운데 4번 가지로 줄어듦)
  const pos = (j: number, i: number) => {
    const N = 10 ** j;
    const xn = tx(N, i);
    if (j === 0) return { x: xn, y: yN[0] - 60 * (1 - p), op: s === 0 ? 1 : p };
    const bs = 10 ** (j - 1);
    const b = Math.floor(i / bs);
    const k = i % bs;
    const y = s === 0 ? yN[j] : yO[j - 1] + (yN[j] - yO[j - 1]) * p;
    if (s === 0) return { x: xn, y, op: 1 };
    if (b === 4) return { x: tx(bs, k) + (xn - tx(bs, k)) * p, y, op: 1 };
    return { x: xn, y, op: Math.max(0, Math.min(1, (p - 0.3 - Math.abs(b - 4) * 0.05) / 0.25)) };
  };
  const rankOf = (j: number) => n - 1 - j;
  const tumen = f >= a7;
  const dim = 1 - 0.55 * fadeIn(f, a8 + S(1.4), 12) * (1 - fadeIn(f, a9 - 4, 8));
  // 장점 1: 명령 화살표 네 번 (가운데 사슬 4·44·444·4444)
  const CH = [0, 4, 44, 444, 4444];
  const arrowT = (k: number) => a9 + S(2.0) + k * S(0.9);
  const care = a9 + S(5.8);
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ opacity: dim }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <defs>
            <pattern id="c3-band" width={3.2} height={5} patternUnits="userSpaceOnUse">
              <circle cx={1.6} cy={2.5} r={1.1} fill={INK} />
            </pattern>
          </defs>
          {/* 가지 (부채꼴) */}
          {range(n - 1).map((j) => {
            const N = 10 ** j;
            if (N > 100) return null;
            const r = rankOf(j);
            return range(N).map((i) => {
              const P = pos(j, i);
              const c0 = j + 1 === n - 1 && n === 5 ? null : pos(j + 1, i * 10);
              const c9 = j + 1 === n - 1 && n === 5 ? null : pos(j + 1, i * 10 + 9);
              const half = TW / (2 * 10 ** (j + 1));
              const yc = yN[j + 1] !== undefined ? (c0 ? c0.y : yN[j + 1]) : 0;
              const xa = c0 ? c0.x - half * 0.8 : tx(10 ** (j + 1), i * 10) - half;
              const xb = c9 ? c9.x + half * 0.8 : tx(10 ** (j + 1), i * 10 + 9) + half;
              const op = Math.min(P.op, c0 ? c0.op : 1);
              const hot = f >= care && f < faces && CH[j] === i;
              return <path key={`${j}-${i}`} d={`M ${P.x} ${P.y + 4} L ${xa} ${yc - (j + 1 === n - 1 ? 20 : 40)} L ${xb} ${yc - (j + 1 === n - 1 ? 20 : 40)} Z`} fill={hot ? RED : RANK[r]} fillOpacity={hot ? 0.35 : 0.1} stroke={hot ? RED : RANK[r]} strokeOpacity={0.35} strokeWidth={1.5} opacity={op} />;
            });
          })}
          {/* 줄마다 사람 - 단이 바뀔 때 가운데(4번) 가지는 전 단계 크기에서 새 크기로 이어서 줄어듦 (한 프레임에 툭 바뀌지 않게) */}
          {range(n).map((j) => {
            const N = 10 ** j;
            const r = rankOf(j);
            if (j === 0) return null; // 맨 위 대장은 캐릭터로
            const grow = s > 0 && p < 1;
            const mid = (i: number) => grow && Math.floor(i / 10 ** (j - 1)) === 4;
            // 가운데 가지: 전 단계 크기(PIN_S[N/10]) → 새 크기
            const sz = (i: number) => (mid(i) ? PIN_S[N / 10] + (PIN_S[N] - PIN_S[N / 10]) * p : PIN_S[N]);
            if (N === 10)
              return range(10).map((i) => {
                const P = pos(j, i);
                // 새 줄 1의 가운데는 전 대장(캐릭터)이 줄어든 자리 - 캐릭터가 사라지는 만큼 나타남
                const op = mid(i) ? p : P.op;
                return (
                  <g key={`${j}-${i}`} opacity={op}>
                    <Pin x={P.x} y={P.y} s={2.4} c={RANK[r]} />
                    {r > 0 && <RankFlags x={P.x + 16} y={P.y - 26} r={r} />}
                  </g>
                );
              });
            if (N === 100)
              return range(100).map((i) => {
                const P = pos(j, i);
                const k = sz(i);
                return (
                  <g key={`${j}-${i}`} opacity={P.op}>
                    <Pin x={P.x} y={P.y} s={k} c={RANK[r]} />
                    {mid(i) && r > 0 && <g opacity={1 - p}><RankFlags x={P.x + 6.7 * k} y={P.y - 10.8 * k} r={r} s={k / 2.4} /></g>}
                  </g>
                );
              });
            if (N === 1000)
              return range(1000).map((i) => {
                const P = pos(j, i);
                return mid(i) ? <Pin key={`${j}-${i}`} x={P.x} y={P.y} s={sz(i)} c={RANK[r]} op={P.op} /> : <circle key={`${j}-${i}`} cx={P.x} cy={P.y - 2.6} r={2.3} fill={RANK[r]} opacity={P.op} />;
              });
            // 10,000: 가지마다 점무늬 띠 (가운데 띠는 전 단계 1,000 점줄 높이에서 두꺼워짐)
            return range(10).map((b) => {
              const y = pos(j, 0).y;
              let x0 = TW0 + (b * TW) / 10, x1 = TW0 + ((b + 1) * TW) / 10;
              let op = Math.max(0, Math.min(1, (p - 0.3 - Math.abs(b - 4) * 0.05) / 0.25));
              let hh = 24;
              if (b === 4) { x0 = TW0 + (x0 - TW0) * p; x1 = TW0 + TW + (x1 - TW0 - TW) * p; op = 1; hh = 5 + 19 * p; }
              return <rect key={`b${b}`} x={x0 + 2} y={y - hh} width={x1 - x0 - 4} height={hh} fill={b === 4 && p < 0.35 ? RANK[r] : "url(#c3-band)"} opacity={b === 4 && p < 0.35 ? 0.7 : op} />;
            });
          })}
          {/* 줄마다 숫자 (그 단 사람 수) - 맨 아래(전체)는 크게. 단이 바뀔 때 전 숫자는 옅어지고 새 숫자가 겹쳐 나타남 */}
          {range(n).map((j) => {
            const r = rankOf(j);
            const big = j === n - 1;
            const y = pos(j, 0).y;
            const fresh = s > 0 && p < 1;
            return (
              <g key={j}>
                <text x={1680} y={y - (big ? 0 : 6)} fontFamily={SERIF} fontWeight={700} fontSize={big ? 66 : 44} fill={big ? RED : RANK[r]} opacity={fresh ? p : 1}>{fmt(10 ** j)}</text>
                {fresh && j > 0 && <text x={1680} y={y - (big ? 0 : 6)} fontFamily={SERIF} fontWeight={700} fontSize={big ? 66 : 44} fill={big ? RED : RANK[r]} opacity={1 - p}>{fmt(10 ** (j - 1))}</text>}
              </g>
            );
          })}
          {/* 사단(투멘): 트리 전체를 금색 점선으로 */}
          {tumen && <rect x={TW0 - 30} y={yN[0] - 170} width={TW + 60} height={yN[n - 1] - yN[0] + 200} rx={18} fill="none" stroke="#c9a24a" strokeWidth={6} strokeDasharray="20 12" opacity={fadeIn(f, a7, 12)} />}
          {/* 장점 1: 명령 화살표 */}
          {f >= a9 && range(4).map((k) => {
            const A = pos(k, CH[k]);
            const B = pos(k + 1, CH[k + 1]);
            const q = interpolate(f, [arrowT(k), arrowT(k) + 14], [0, 1], { ...clamp, easing: ease });
            return (
              <g key={k}>
                <Arrow x1={A.x + 30} y1={A.y + 6} x2={B.x + 30} y2={B.y - (k === 3 ? 30 : 56)} p={q} w={10} />
                {q > 0.6 && <text x={A.x + 52} y={(A.y + B.y) / 2 + 8} fontFamily={SERIF} fontWeight={700} fontSize={56} fill={RED}>{k + 1}</text>}
              </g>
            );
          })}
        </svg>
        {/* 맨 위 대장 (캐릭터): 단이 바뀔 때 전 대장은 가운데 가지 자리로 줄어들며 사라짐 */}
        {s > 0 && p < 1 && (() => {
          const P = pos(1, 4);
          const y0 = yO[0];
          return <Guy x={tx(1, 0) + (P.x - tx(1, 0)) * p} bottom={1080 - (y0 + (P.y - y0) * p)} h={130 * (1 - 0.6 * p)} op={1 - p} flag={RANK[rankOf(1)]} />;
        })()}
        <Guy id={tumen ? "subutai" : "archer"} x={pos(0, 0).x} bottom={1080 - pos(0, 0).y} h={130} op={pos(0, 0).op} flag={RANK[rankOf(0)]} pose={tumen ? "smug" : "front"} gesture={f >= a9 ? "point" : undefined} gestureAt={arrowT(0) - 8} />
        {tumen && <div style={{ opacity: fadeIn(f, a7 + 6, 12) }}><Tug x={pos(0, 0).x + 110} y={pos(0, 0).y + 10} h={200} color="#c9a24a" sway={Math.sin(f / 10) * 4} /></div>}
        {/* 대장 한 명이 챙기는 건 열 명뿐: 확대경 */}
        {f >= care && (() => {
          const k = spring({ frame: f - care, fps: FPS, config: { damping: 13, stiffness: 160 } });
          const B = pos(4, 4444);
          return (
            <>
              <svg width={1920} height={1080} style={{ position: "absolute" }}>
                <path d={`M ${B.x} ${B.y - 14} L 1180 640`} stroke={RED} strokeWidth={4} strokeDasharray="10 8" opacity={k} />
              </svg>
              <div style={{ position: "absolute", left: 1080, top: 380, width: 520, height: 300, borderRadius: 150, overflow: "hidden", border: `7px solid ${RED}`, background: PAPER, transform: `scale(${k})`, boxShadow: "0 10px 24px rgba(0,0,0,0.3)" }}>
                <svg width={520} height={300}>
                  <Pin x={260} y={110} s={3} c={RANK[1]} />
                  <RankFlags x={282} y={74} r={1} s={1.5} />
                  {range(10).map((i) => <Pin key={i} x={45 + i * 48} y={250} s={2.2} c={INK} />)}
                  {range(10).map((i) => <path key={`l${i}`} d={`M 260 116 L ${45 + i * 48} 196`} stroke={RED} strokeWidth={2} opacity={0.5} />)}
                </svg>
              </div>
            </>
          );
        })()}
      </AbsoluteFill>
      {/* "이유는 네 가지": 번호 동그라미 넷 */}
      {f >= a8 && f < a9 && range(4).map((i) => {
        const t0 = a8 + S(1.4) + i * 6;
        if (f < t0) return null;
        const k = spring({ frame: f - t0, fps: FPS, config: { damping: 11, stiffness: 190 } });
        return (
          <div key={i} style={{ position: "absolute", left: 960 + (i - 1.5) * 280 - 105, top: 440, width: 210, height: 210, borderRadius: "50%", border: `9px solid ${INK}`, background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})`, boxShadow: "0 8px 0 rgba(43,29,20,0.25)", filter: "url(#kit-ink)" }}>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: INK, lineHeight: 1, fontVariantNumeric: "lining-nums" }}>{i + 1}</span>
          </div>
        );
      })}
      {f >= a9 && <Badge n={1} at={a9} />}
      {T.slice(1).map((t, i) => <SFX key={i} name="whoosh" at={t} vol={0.25} dur={30} />)}
    </AbsoluteFill>
  );
};

// ---------- 6-2) c3_11 처음엔 으르렁: 멱살 → 흙먼지 싸움 구름 ----------
const Brawl = () => {
  const f = useCurrentFrame();
  const cloud = S(1.2);
  const k = fadeIn(f, cloud, 8);
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={600} />
      <Ger x={300} y={605} w={200} />
      <Ger x={1650} y={605} w={220} />
      {range(4).map((i) => <Guy key={i} x={[220, 420, 1500, 1700][i]} bottom={330} h={200} flag={i % 2 ? TRIBES[1].flag : TRIBES[0].flag} pose="shocked" flip={i < 2} beat="jump" beatAt={cloud + 4 + i * 3} />)}
      <div style={{ opacity: 1 - k }}>
        <Guy x={760} h={520} bottom={60} flag={TRIBES[0].flag} pose="angry" flip beat="shake" beatAt={6} />
        <Guy x={1160} h={520} bottom={60} flag={TRIBES[1].flag} pose="angry" beat="shake" beatAt={10} />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <path d={`M 860 ${660 + Math.sin(f / 5) * 6} L 900 640 L 930 675 L 960 645 L 990 675 L 1020 640 L 1060 ${660 - Math.sin(f / 5) * 6}`} stroke={RED} strokeWidth={8} fill="none" strokeLinejoin="round" />
        </svg>
      </div>
      {f >= cloud && (
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)", opacity: k }}>
          <g transform={`rotate(${(f - cloud) * 2.2} 960 720)`}>
            {range(9).map((i) => { const a = (i / 9) * Math.PI * 2; return <circle key={i} cx={960 + Math.cos(a) * 170} cy={720 + Math.sin(a) * 110} r={120 + (i % 3) * 20} fill="#d8c49a" stroke={INK} strokeWidth={6} />; })}
            <circle cx={960} cy={720} r={170} fill="#d8c49a" />
          </g>
          {/* 구름 밖으로 삐져나오는 주먹·발 (느리게 바뀜) */}
          {range(4).map((i) => {
            const on = Math.floor((f - cloud) / 9 + i) % 4 === 0;
            if (!on) return null;
            const a = i * 1.6 + 0.4;
            const x = 960 + Math.cos(a) * 300, y = 720 + Math.sin(a) * 190;
            return i % 2 ? (
              <g key={i}><path d={`M ${960 + Math.cos(a) * 200} ${720 + Math.sin(a) * 130} L ${x} ${y}`} stroke="#3d5a80" strokeWidth={30} strokeLinecap="round" /><circle cx={x} cy={y} r={26} fill={SKIN} stroke={INK} strokeWidth={5} /></g>
            ) : (
              <g key={i}><path d={`M ${960 + Math.cos(a) * 200} ${720 + Math.sin(a) * 130} L ${x} ${y}`} stroke="#8a3b2c" strokeWidth={30} strokeLinecap="round" /><ellipse cx={x} cy={y} rx={34} ry={20} fill="#3a2b22" stroke={INK} strokeWidth={5} /></g>
            );
          })}
          {range(5).map((i) => { const a = (f - cloud) / 14 + i * 1.25; const x = 960 + Math.cos(a) * 260, y = 560 + Math.sin(a) * 60; return <path key={`s${i}`} d={`M ${x} ${y - 18} L ${x + 5} ${y - 5} L ${x + 18} ${y} L ${x + 5} ${y + 5} L ${x} ${y + 18} L ${x - 5} ${y + 5} L ${x - 18} ${y} L ${x - 5} ${y - 5} Z`} fill="#f0c95a" stroke={INK} strokeWidth={3} />; })}
        </svg>
      )}
      <SFX name="hit" at={cloud + 4} vol={0.35} dur={30} />
      <Badge n={2} at={0} />
    </AbsoluteFill>
  );
};

// ---------- 6-3) c3_12 같은 천막에서 먹고 자고(어색한 밥상) → 같은 적과 싸우다 서로 구해 줌 ----------
const Rescue = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const fight = S(3.3);
  if (f < fight) return <Shot6Dinner len={fight} />;
  const t = f - fight;
  const step = lerp(t, 10, 40, 0, 1);
  const lift = lerp(t, S(2.6), S(3.4), 0, 1);
  const bx = 1250 - step * 260;
  const stuck = range(5).filter((i) => t > 30 + i * 6);
  return (
    <AbsoluteFill style={{ opacity: fadeIn(t, 0, 6) }}>
      <Steppe time="dusk" horizon={560} />
      <Tug x={300} y={560} h={260} />
      <ArrowRain f={t} t0={4} n={14} />
      {/* 쓰러진 빨강 → 일으켜 세움 */}
      <Guy x={720} h={360} bottom={120} flag={TRIBES[0].flag} rot={-78 * (1 - lift)} pose={lift < 1 ? "shocked" : "happy"} beat={lift < 1 ? "none" : "hop"} beatAt={S(3.5)} />
      {/* 파랑이 방패로 막아 줌 */}
      <Guy x={bx} h={380} bottom={120} flag={TRIBES[1].flag} pose={t < S(3.4) ? "angry" : "happy"} gesture={t >= S(2.4) ? "open" : undefined} gestureAt={S(2.4)} />
      <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        <g transform={`translate(${bx + 120} 720) rotate(-20)`}>
          {stuck.map((i) => <path key={i} d={`M ${-30 + i * 16} ${-40 + i * 18} L ${60 + i * 16} ${-110 + i * 14}`} stroke="#6b4a2c" strokeWidth={5} />)}
          <ellipse cx={0} cy={0} rx={70} ry={110} fill="#8a5a34" stroke={INK} strokeWidth={8} />
          <ellipse cx={0} cy={0} rx={50} ry={86} fill="none" stroke="#c9a24a" strokeWidth={6} />
          <circle cx={0} cy={0} r={16} fill="#9aa0a4" stroke={INK} strokeWidth={5} />
        </g>
      </svg>
      <SFX name="shield" at={fight + 34} vol={0.35} dur={30} />
      <Badge n={2} at={0} />
      {frames < 0 && null}
    </AbsoluteFill>
  );
};

// ---------- 6-4) c3_13 옛 족장은 등을 돌리고, 열 명이 어깨동무 - 깃발이 하나로 ----------
const Shoulder = () => {
  const f = useCurrentFrame();
  const c = fadeIn(f, S(0.4), 30);
  const away = lerp(f, S(1.0), S(2.6), 0, 1);
  const hug = S(2.7);
  const xs = range(10).map((i) => 330 + i * 140);
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={580} />
      <Ger x={520} y={585} w={170} />
      <Ger x={1420} y={585} w={190} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - fadeIn(f, S(0.6), 20)) * 300}px)` }}><Tug x={960} y={640} h={420} sway={Math.sin(f / 10) * 4} /></div>
      {/* 옛 족장 둘: 등을 돌려 떠남 */}
      {[{ x: 110, col: TRIBES[0].flag, d: -1 }, { x: 1810, col: TRIBES[1].flag, d: 1 }].map((t, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, transform: `translateX(${t.d * away * 300}px)`, opacity: 1 - away * 0.9 }}>
          <Tug x={t.x + t.d * -50} y={900} h={380} color={t.col} />
          <Guy id="taichiud_chief" x={t.x} h={300} bottom={160} pose={f < S(1.0) ? "angry" : "sad"} flip={t.d > 0} beat="sink" beatAt={S(1.0)} />
        </div>
      ))}
      {xs.map((x, i) => (
        <Guy key={i} x={x} h={250} bottom={140} flag={mixColor(i % 2 ? TRIBES[1].flag : TRIBES[0].flag, UNIT, c)} pose={f < hug ? "front" : "happy"} beat={f < hug ? "none" : "hop"} beatAt={hug + i * 3} />
      ))}
      {/* 어깨동무: 옆 사람 어깨로 걸친 팔 */}
      {f >= hug - 4 && (
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)", opacity: fadeIn(f, hug - 4, 8) }}>
          {xs.slice(0, 9).map((x, i) => {
            const d = `M ${x + 30} ${850} C ${x + 60} ${822} ${x + 100} ${822} ${x + 118} ${840}`;
            return (
              <g key={i}>
                <path d={d} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
                <path d={d} stroke="#6b5a48" strokeWidth={20} fill="none" strokeLinecap="round" />
                <circle cx={x + 120} cy={842} r={11} fill={SKIN} stroke={INK} strokeWidth={4} />
              </g>
            );
          })}
        </svg>
      )}
      <Badge n={2} at={0} />
    </AbsoluteFill>
  );
};

// ---------- 9-2) c3_19 사냥에서 배운 세 가지: 둘러싸기 → 신호 맞추기 → 기다리기 (각각 짧은 장면) ----------
// ---------- 몰이사냥 전용 그림 (2026-10-26 사용자: "둘러싸는 거, 기다리는 게 반영이 안 돼") ----------
// 비스듬히 내려다본 초원: 지평선 끝까지 이어진 기병 원(작은 기병 그림 80기, 열 기마다 깃발 든 대장)이 좁혀 들어오고 짐승 떼가 가운데로 몰림
// sky: 0 낮 → 1 노을 → 2 밤(원 둘레 모닥불) → 3 새벽 → 4 낮
const NR = 80;
const NCX = 960, NCY = 650, TILT = 0.46, HOR = 130;
const SKYK = ["#cfdfe0", "#e8a46a", "#1d2738", "#efb99a", "#cfdfe0"];
const DARKK = [0, 0.22, 0.62, 0.16, 0];
const skyAt = (t: number) => { const i = Math.min(3, Math.floor(t)); const k = t - i; return { sky: mixColor(SKYK[i], SKYK[i + 1], k), dark: DARKK[i] + (DARKK[i + 1] - DARKK[i]) * k, night: Math.max(0, 1 - Math.abs(t - 2) * 1.4) }; };
const HUNT: { sp: "deer" | "wolf" | "hare" | "fox"; r: number; a: number }[] = range(20).map((i) => ({ sp: (["deer", "deer", "wolf", "fox", "hare", "deer", "hare", "fox", "wolf", "deer"] as const)[i % 10], r: 0.15 + ((i * 37) % 70) / 100, a: i * 2.39 + 0.4 }));
const HORSE_C = ["#8a5a36", "#5e4030", "#b89a6a", "#9a968e", "#2c2420"];
// 위에서 비스듬히 본 기병 (머리가 th 방향)
const TopRider = ({ x, y, k, th, c, cloth }: { x: number; y: number; k: number; th: number; c: string; cloth: string }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <ellipse cx={0} cy={6} rx={18} ry={6} fill="rgba(30,40,20,0.3)" />
    <g transform={`rotate(${th}) scale(1 ${0.62})`}>
      <path d="M -17 0 C -26 -3 -30 3 -34 6" stroke={INK} strokeWidth={3} fill="none" />
      <ellipse cx={0} cy={0} rx={17} ry={8} fill={c} stroke={INK} strokeWidth={2.5} />
      <ellipse cx={18} cy={0} rx={8} ry={4.5} fill={c} stroke={INK} strokeWidth={2.5} />
    </g>
    <ellipse cx={-1} cy={-6} rx={6.5} ry={7.5} fill={cloth} stroke={INK} strokeWidth={2.2} />
    <circle cx={-1} cy={-14} r={5} fill="#8a9298" stroke={INK} strokeWidth={2} />
    <circle cx={-1} cy={-19} r={2} fill={RED} />
  </g>
);
const NergeView = ({ f, R, gap = 0, wave = -1, moving = 0, sky = 0, sit, esc = 0, zoom = 1, appear = -999, red = false }: { f: number; R: number; gap?: number; wave?: number; moving?: number; sky?: number; sit?: (i: number) => number; esc?: number; zoom?: number; appear?: number; red?: boolean }) => {
  const S0 = skyAt(sky);
  const P = (a: number, r: number) => ({ x: NCX + Math.cos(a) * r, y: NCY + Math.sin(a) * r * TILT });
  const depth = (y: number) => 0.62 + 0.5 * ((y - HOR) / (1080 - HOR));
  const riders = range(NR).map((j) => {
    let a = (j / NR) * Math.PI * 2 - Math.PI / 2;
    const d = Math.atan2(Math.sin(a), Math.cos(a)); // 오른쪽(0) 근처가 끊김
    if (Math.abs(d) < 0.45) a += Math.sign(d || 1) * gap * (0.45 - Math.abs(d)) * 0.9;
    const p = P(a, R);
    const lead = j % 10 === 0;
    const dist = Math.min(j, NR - j) / 10; // 맨 위 대장에서 몇 번째 대장인지
    const raise = lead ? (wave < 0 ? 0 : Math.max(0, Math.min(1, wave - dist))) : 0;
    const th = (Math.atan2((NCY - p.y) / TILT, NCX - p.x) * 180) / Math.PI;
    const show = fadeIn(f, appear + dist * 10 * 1.1, 6);
    return { ...p, a, lead, raise, th, k: depth(p.y), show, j };
  });
  const animals = HUNT.map((an, i) => {
    const sk = sit ? sit(i) : 0;
    const wob = Math.sin(f / 11 + i) * 16 * (1 - sk) * (0.4 + moving);
    let p = P(an.a, an.r * R * 0.8 + wob);
    if (i === 0 && esc > 0) p = { x: NCX + R * 0.45 + esc * 900, y: NCY + 10 };
    return { ...p, sk, i, an };
  });
  const items = [...riders.map((r) => ({ y: r.y, r })), ...animals.map((m) => ({ y: m.y, m }))].sort((u, v) => u.y - v.y);
  return (
    <AbsoluteFill style={{ background: S0.sky }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${NCX}px ${NCY}px` }}>
        {/* 하늘·먼 언덕·초원 */}
        {S0.night > 0.2 && <div style={{ opacity: S0.night }}><Stars /></div>}
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          <path d={`M -400 ${HOR + 4} C 0 ${HOR - 40} 400 ${HOR - 30} 800 ${HOR - 6} C 1200 ${HOR + 10} 1600 ${HOR - 50} 2320 ${HOR - 10} L 2320 ${HOR + 30} L -400 ${HOR + 30} Z`} fill="#8fa79a" stroke={INK} strokeWidth={3} />
          <rect x={-400} y={HOR + 20} width={2720} height={1400} fill="#9fb065" />
          <rect x={-400} y={HOR + 20} width={2720} height={1400} fill="url(#c3-meadow)" />
          <defs>
            <linearGradient id="c3-meadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b3be7c" stopOpacity={0.7} />
              <stop offset="1" stopColor="#7d9148" stopOpacity={0.6} />
            </linearGradient>
            <radialGradient id="c3-fireglow">
              <stop offset="0" stopColor="#ffd98c" stopOpacity={0.9} />
              <stop offset="1" stopColor="#ffb050" stopOpacity={0} />
            </radialGradient>
          </defs>
          {range(120).map((i) => { const x = ((i * 263) % 2600) - 340; const y = HOR + 30 + ((i * 151) % 1000); const k = depth(y); return <path key={i} d={`M ${x} ${y} l ${-5 * k} ${-12 * k} M ${x} ${y} l ${2 * k} ${-14 * k} M ${x} ${y} l ${8 * k} ${-10 * k}`} stroke="#5f7236" strokeWidth={2.4} opacity={0.55} strokeLinecap="round" />; })}
          {range(18).map((i) => { const x = ((i * 457) % 2400) - 240; const y = HOR + 60 + ((i * 211) % 900); return <circle key={`fl${i}`} cx={x} cy={y} r={3 * depth(y)} fill={["#e8d36a", "#f2ead8", "#c98ab0"][i % 3]} />; })}
          {/* 원 둘레 흙먼지 (움직일 때) */}
          {moving > 0.02 && riders.filter((r) => r.j % 2 === 0).map((r) => {
            const o = P(r.a, R + 26);
            return <ellipse key={`d${r.j}`} cx={o.x} cy={o.y} rx={(22 + Math.sin(f / 4 + r.j) * 6) * r.k} ry={10 * r.k} fill="#cbb98a" opacity={0.45 * moving * r.show} />;
          })}
          {/* 깊이 순서로 기병·짐승 */}
          {items.map((it) => {
            if ("r" in it && it.r) {
              const r = it.r;
              if (r.show <= 0) return null;
              return (
                <g key={`r${r.j}`} opacity={r.show}>
                  <TopRider x={r.x} y={r.y} k={r.k * 1.4} th={r.th} c={HORSE_C[r.j % 5]} cloth={r.lead ? "#9c3a2c" : r.j % 3 ? "#2f4a5e" : "#5a3e28"} />
                  {r.lead && (
                    <g transform={`translate(${r.x + 8 * r.k} ${r.y - 18 * r.k}) scale(${r.k * 1.4})`}>
                      <path d={`M 0 0 L 0 ${-26 - 30 * r.raise}`} stroke={INK} strokeWidth={3} />
                      <path d={r.raise > 0.5 ? `M 1 ${-56 * r.raise} L ${22 + Math.sin(f / 3 + r.j) * 3} ${-50 * r.raise} L 1 ${-44 * r.raise} Z` : `M 1 -26 L 6 -12 L 1 -14 Z`} fill={r.raise > 0.5 ? RED : "#e8e0cc"} stroke={INK} strokeWidth={1.8} />
                    </g>
                  )}
                </g>
              );
            }
            const m = (it as { m: (typeof animals)[number] }).m;
            const k = depth(m.y) * 0.85;
            const flip = m.i === 0 && esc > 0 ? false : Math.cos(m.an.a + f / 40) < 0;
            return (
              <g key={`a${m.i}`} transform={`translate(${m.x} ${m.y}) scale(1 ${1 - 0.42 * m.sk}) translate(${-m.x} ${-m.y})`}>
                <Beast sp={m.an.sp} x={m.x} y={m.y} s={k} f={m.sk > 0.1 ? 0 : f + m.i * 5} flip={flip} />
              </g>
            );
          })}
          {red && <ellipse cx={NCX + R} cy={NCY} rx={80} ry={50} fill="none" stroke={RED} strokeWidth={7} />}
        </svg>
        {/* 밤: 어둡게, 그 위에 원 둘레 모닥불 (불은 어둠 위에) */}
        {S0.dark > 0.01 && <AbsoluteFill style={{ background: `rgba(14,20,40,${S0.dark})` }} />}
        {S0.night > 0.02 && (
          <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible", opacity: S0.night }}>
            {range(NR / 5).map((q) => {
              const a = (q / (NR / 5)) * Math.PI * 2 - Math.PI / 2;
              const o = P(a, R + 46);
              const k = depth(o.y);
              const fl = 1 + Math.sin(f / 3 + q) * 0.12;
              return (
                <g key={q}>
                  <circle cx={o.x} cy={o.y} r={70 * k} fill="url(#c3-fireglow)" />
                  <path d={`M ${o.x} ${o.y - 22 * k * fl} C ${o.x - 9 * k} ${o.y - 8 * k} ${o.x - 7 * k} ${o.y} ${o.x} ${o.y} C ${o.x + 7 * k} ${o.y} ${o.x + 9 * k} ${o.y - 8 * k} ${o.x} ${o.y - 22 * k * fl} Z`} fill="#f0a040" stroke={INK} strokeWidth={1.5} />
                </g>
              );
            })}
          </svg>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// 땅 높이 컷: 원을 지키는 기병 줄 앞에서 지친 사슴이 멈춰 섬
const NergeGround = ({ f0 }: { f0: number }) => {
  const f = useCurrentFrame() - f0;
  const stop = S(0.6);
  const dx = interpolate(f, [0, stop], [-260, 0], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Steppe time="dusk" horizon={560} />
      <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
        {range(11).map((i) => <RR key={i} x={80 + i * 180} y={700 - (i % 2) * 14} s={0.5} horse={["bay", "dark", "dun", "grey", "black"][i % 5]} man={i === 5 ? "white" : i % 2 ? "mongol2" : "mongol"} f={f} still flip={i % 2 === 0} />)}
        <g filter="url(#kit-ink)"><Beast sp="deer" x={960 + dx} y={1010} s={3.2} f={f < stop ? f : 0} /></g>
        {f >= stop && range(3).map((i) => { const t = ((f - stop + i * 9) % 26) / 26; return <path key={i} d={`M ${1090 + i * 22} ${700 + t * 40} c -8 12 8 12 0 0`} fill="#7fa6c9" stroke={INK} strokeWidth={2} opacity={1 - t} />; })}
      </svg>
      <Tug x={1000} y={705} h={230} />
    </AbsoluteFill>
  );
};

const MethodIcons = ({ cur }: { cur: number }) => (
  <svg width={420} height={150} style={{ position: "absolute", left: 40, top: 30, filter: "url(#kit-ink)" }}>
    {range(3).map((i) => {
      const x = 70 + i * 140, on = i === cur;
      return (
        <g key={i} transform={`translate(${x} 75) scale(${on ? 1.15 : 0.85})`} opacity={on ? 1 : 0.4}>
          <circle r={56} fill={PAPER} stroke={on ? RED : INK} strokeWidth={7} />
          {i === 0 && <><circle r={30} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="6 6" /><path d="M -14 0 L 14 0" stroke={INK} strokeWidth={4} /></>}
          {i === 1 && <><ellipse cx={0} cy={-12} rx={26} ry={9} fill="#c9a46a" stroke={INK} strokeWidth={4} /><path d="M -26 -12 L -26 16 C -26 26 26 26 26 16 L 26 -12" fill="#8a3b2c" stroke={INK} strokeWidth={4} /><path d="M 10 -40 L 2 -16" stroke={INK} strokeWidth={4} /></>}
          {i === 2 && <><circle cx={0} cy={0} r={16} fill="#f0b048" stroke={INK} strokeWidth={4} />{range(8).map((k) => <path key={k} d={`M ${Math.cos(k * 0.785) * 24} ${Math.sin(k * 0.785) * 24} L ${Math.cos(k * 0.785) * 34} ${Math.sin(k * 0.785) * 34}`} stroke={INK} strokeWidth={4} />)}</>}
        </g>
      );
    })}
  </svg>
);
// c3_19 사냥에서 배운 세 가지 - 같은 전용 그림으로 이어서: 둘러싸기(사방에서 좁혀 듦) → 신호(깃발이 대장에서 대장으로 퍼지고 원 전체가 한 걸음) → 기다리기(낮·노을·밤 모닥불·새벽, 짐승이 지쳐 주저앉음)
const NergeLearn = () => {
  const f = useCurrentFrame();
  // 목소리 쉼(약 1.6~2.7초, 3.95~5.1초) 가운데에서 장면이 바뀜. 줄 뒤 멈춤 3초는 기다리기에 씀
  const sig = S(2.2), wait = S(4.5);
  const cur = f < sig ? 0 : f < wait ? 1 : 2;
  const wave = f < sig ? -1 : interpolate(f, [sig + 4, sig + 40], [0, 5], clamp);
  const stepT = sig + 44;
  const R = interpolate(f, [0, sig - 4, stepT, stepT + 10], [480, 330, 330, 285], { ...clamp, easing: ease });
  const moving = f < sig - 4 ? 1 : f >= stepT && f < stepT + 12 ? 1 : 0;
  const sky = interpolate(f, [wait + 6, wait + S(6.0)], [0, 3.9], clamp);
  const sit = (i: number) => lerp(f, wait + 24 + i * 6, wait + 44 + i * 6, 0, 1);
  const zoom = interpolate(f, [0, sig], [1, 1.45], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <NergeView f={f} R={R} wave={wave} moving={moving} sky={f >= wait ? sky : 0} sit={f >= wait ? sit : undefined} zoom={zoom} />
      <MethodIcons cur={cur} />
      <SFX name="drum" at={sig + 2} vol={0.35} dur={40} />
      <SFX name="campfire" at={wait + S(2.4)} vol={0.25} dur={S(1.6)} />
    </AbsoluteFill>
  );
};

const FACES: { x: number; bottom: number; h: number; pose: string; beat: Beat; flip?: boolean }[] = [
  { x: 300, bottom: 330, h: 215, pose: "happy", beat: "hop" },
  { x: 520, bottom: 330, h: 215, pose: "smug", beat: "nod" },
  { x: 740, bottom: 330, h: 215, pose: "sad", beat: "sink" },
  { x: 1180, bottom: 330, h: 215, pose: "shocked", beat: "jump", flip: true },
  { x: 1400, bottom: 330, h: 215, pose: "angry", beat: "shake", flip: true },
  { x: 1620, bottom: 330, h: 215, pose: "side", beat: "nod", flip: true },
  { x: 230, bottom: 70, h: 280, pose: "front", beat: "nod" },
  { x: 500, bottom: 70, h: 280, pose: "happy", beat: "hop" },
  { x: 1420, bottom: 70, h: 280, pose: "smug", beat: "nod", flip: true },
  { x: 1690, bottom: 70, h: 280, pose: "shocked", beat: "jump", flip: true },
];
const Shot5Faces = ({ f0 }: { f0: number }) => {
  const f = useCurrentFrame() - f0;
  const quirk = S(3.6); // "10명이면 얼굴도 이름도 버릇도"
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 0, 6) }}>
      <Steppe time="day" horizon={560} />
      <Tug x={1080} y={900} h={430} />
      {FACES.map((p, i) => (
        <Guy key={i} x={p.x} bottom={p.bottom} h={p.h} pose={f >= quirk + i * 9 ? p.pose : "front"} flip={p.flip} enter="pop" delay={f0 + i * 3}
          beat={f >= quirk + i * 9 ? p.beat : "none"} beatAt={f0 + quirk + i * 9} />
      ))}
      <Guy x={960} h={430} bottom={90} pose="smug" enter="up" delay={f0 + 4} gesture="point" gestureAt={f0 + quirk - 10} beat="none" />
      <Badge n={1} at={0} />
    </AbsoluteFill>
  );
};

// ---------- 6) 장점 2: 부족 섞기 - 원수끼리 한 줄 → 색이 같아짐 → 한 천막 밥 → 다른 부대로 가면 칼 (c3_07) ----------
const Shot6 = ({ frames }: ShotProps) => {
  // c3_10: 원수 두 부족이 노려보다 → 한 줄로 번갈아 섞임 (깃발 색은 아직 제각각)
  const f = useCurrentFrame();
  const mix = S(2.2);
  const same = frames + 99; // 색은 아직 안 섞임 (c3_13에서 같아짐)
  const m = interpolate(f, [mix, mix + 40], [0, 1], { ...clamp, easing: ease });
  const c = 0;
  return (
    <AbsoluteFill>
      <Paper />
      <Ground y={930} />
      {/* 옛 족장 깃발: 쓰러짐 / 새 부대 깃발: 올라옴 */}
      {[{ x: 110, col: TRIBES[0].flag, d: -1 }, { x: 1810, col: TRIBES[1].flag, d: 1 }].map((t, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, transform: `rotate(${t.d * 0}deg)`, transformOrigin: `${t.x}px 940px`, opacity: 1 - fadeIn(f, same, 14) }}>
          <Tug x={t.x} y={940} h={400} color={t.col} sway={Math.sin(f / 9 + i) * 5} />
        </div>
      ))}
      {f >= same - 10 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - fadeIn(f, same - 10, 16)) * 420}px)` }}><Tug x={960} y={850} h={460} /></div>}
      {range(10).map((i) => {
        const left = i < 5;
        const j = left ? i : i - 5;
        const x0 = left ? 250 + j * 105 : 1250 + j * 105;
        const x1 = 330 + (left ? 2 * j : 2 * j + 1) * 140;
        const hop = m > 0 && m < 1 ? -Math.sin(m * Math.PI) * 50 : 0;
        const col = mixColor(left ? TRIBES[0].flag : TRIBES[1].flag, UNIT, c);
        return (
          <Guy key={i} x={x0 + (x1 - x0) * m} bottom={150 - hop} h={250} flag={col} enter="pop" delay={j * 3 + (left ? 0 : 2)}
            pose={f < mix ? "angry" : "side"} flip={f < mix ? left : f < same + 6 ? i % 2 === 0 : false}
            beat={f < mix ? "shake" : "none"} beatAt={f < mix ? 10 + j * 2 : same + 8 + i * 2} />
        );
      })}
      <Badge n={2} at={0} />
    </AbsoluteFill>
  );
};
// ---------- 전용 그림: 캐릭터 머리 겹 + 코드로 그린 앉은 몸 (원수 둘의 어색한 밥상) ----------
const RIG = rigs as Record<string, { neck: number[] }>;
const Head = ({ id, pose = "front", x, y, s, rot = 0, flip = false, mouth = "0" }: { id: string; pose?: string; x: number; y: number; s: number; rot?: number; flip?: boolean; mouth?: string }) => {
  const f = useCurrentFrame();
  const n = RIG[id]?.neck ?? [300, 420];
  const blink = (f + x) % 104 < 4 ? 1 : 0;
  const L = (name: string) => <Img src={staticFile(`chars/${id}/${pose}/${name}.svg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
  return (
    <div style={{ position: "absolute", left: x - n[0] * s, top: y - n[1] * s, width: 600 * s, height: 720 * s, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, transformOrigin: `${n[0] * s}px ${n[1] * s}px` }}>
      {L("head")}
      {L(`eyes${blink}`)}
      {L(`mouth${mouth}`)}
    </div>
  );
};
const SKIN = "#ecbf93";
type Robe = { robe: string; dark: string; trim: string };
const ARM = (d: string, color: string, w = 34) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + 10} fill="none" strokeLinecap="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
  </>
);
// 책상다리로 앉아 그릇을 든 사람 (정면). (x,y) = 목, s = 판 1px당 화면 px
// bowl: 그릇 높이(0 무릎 ~ 1 입가), offer: 오른손으로 고기 꼬치를 옆 사람에게 내밂(0~1, dir = 내미는 쪽 1 오른쪽 · -1 왼쪽)
const Seated = ({ id, x, y, s, c, pose, bowl = 0, offer = 0, dir = 1, mouth = "0", lean = 0 }: { id: string; x: number; y: number; s: number; c: Robe; pose: string; bowl?: number; offer?: number; dir?: number; mouth?: string; lean?: number }) => {
  const by = 150 - bowl * 70;
  const ox = dir * (60 + offer * 190);
  const oy = 130 - offer * 30;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `rotate(${lean}deg)`, transformOrigin: `${x}px ${y + 260 * s}px` }}>
      <svg width={600 * s} height={420 * s} viewBox="-300 -40 600 420" style={{ position: "absolute", left: x - 300 * s, top: y - 40 * s, filter: "url(#kit-ink)", overflow: "visible" }}>
        <ellipse cx={0} cy={292} rx={210} ry={22} fill="rgba(43,29,20,0.3)" />
        {/* 책상다리 (도포 자락) */}
        <path d="M -190 270 C -200 220 -120 196 0 200 C 120 196 200 220 190 270 C 120 292 -120 292 -190 270 Z" fill={c.dark} stroke={INK} strokeWidth={7} />
        <ellipse cx={-150} cy={268} rx={40} ry={16} fill="#3a2b22" stroke={INK} strokeWidth={5} />
        <ellipse cx={150} cy={268} rx={40} ry={16} fill="#3a2b22" stroke={INK} strokeWidth={5} />
        {/* 몸통 */}
        <path d="M -72 0 C -110 30 -126 140 -118 222 L 118 222 C 126 140 110 30 72 0 Z" fill={c.robe} stroke={INK} strokeWidth={7} />
        <path d="M -8 4 C 10 70 40 130 60 210" stroke={c.trim} strokeWidth={10} fill="none" />
        <path d="M -116 170 C -40 184 40 184 116 170" stroke={c.trim} strokeWidth={14} fill="none" />
        {/* 왼팔: 그릇을 받침 */}
        {ARM(`M -80 40 C -120 100 -90 ${by + 20} -30 ${by + 10}`, c.robe)}
        {/* 그릇 */}
        <path d={`M -70 ${by - 10} Q 0 ${by + 52} 70 ${by - 10} Z`} fill="#8a5a34" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={0} cy={by - 10} rx={70} ry={10} fill="#e8d9b4" stroke={INK} strokeWidth={5} />
        <circle cx={-30} cy={by + 10} r={20} fill={SKIN} stroke={INK} strokeWidth={5} />
        {/* 오른팔: 숟가락질 / 고기 꼬치를 내밂 */}
        {offer > 0 ? (
          <>
            {ARM(`M ${dir * 80} 40 C ${dir * 130} 90 ${ox - dir * 60} ${oy + 30} ${ox} ${oy}`, c.robe)}
            <path d={`M ${ox} ${oy} L ${ox + dir * 90} ${oy - 40}`} stroke="#6b4a2c" strokeWidth={6} strokeLinecap="round" />
            <ellipse cx={ox + dir * 62} cy={oy - 28} rx={24} ry={16} fill="#9a4f2c" stroke={INK} strokeWidth={4} transform={`rotate(${-dir * 24} ${ox + dir * 62} ${oy - 28})`} />
            <circle cx={ox} cy={oy} r={20} fill={SKIN} stroke={INK} strokeWidth={5} />
          </>
        ) : (
          <>
            {ARM(`M 80 40 C 120 100 100 ${by + 6} 40 ${by - 20}`, c.robe)}
            <circle cx={40} cy={by - 20} r={20} fill={SKIN} stroke={INK} strokeWidth={5} />
          </>
        )}
      </svg>
      <Head id={id} pose={pose} x={x} y={y} s={s} mouth={mouth} />
    </div>
  );
};
// 게르 안 (격자 벽 + 서까래 + 천장 구멍 빛 + 양탄자)
const GerRoom = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(#5a4330, #8a6c4a 45%, #a4855c)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
      {range(23).map((i) => <path key={i} d={`M 960 -60 L ${-300 + i * 110} 330`} stroke="#c45a3a" strokeWidth={9} opacity={0.75} />)}
      <path d="M 0 330 L 1920 330" stroke={INK} strokeWidth={8} />
      {range(40).map((i) => <path key={`a${i}`} d={`M ${-400 + i * 70} 340 L ${-400 + i * 70 + 440} 800`} stroke="#c9a46a" strokeWidth={6} opacity={0.55} />)}
      {range(40).map((i) => <path key={`b${i}`} d={`M ${i * 70} 340 L ${i * 70 - 440} 800`} stroke="#c9a46a" strokeWidth={6} opacity={0.55} />)}
      <path d="M 0 800 L 1920 800 L 1920 1080 L 0 1080 Z" fill="#8a3b2c" stroke={INK} strokeWidth={6} />
      <path d="M 120 850 L 1800 850 L 1800 1040 L 120 1040 Z" fill="none" stroke="#d9b04a" strokeWidth={8} />
      {range(12).map((i) => <path key={`r${i}`} d={`M ${200 + i * 135} 945 l 30 -40 l 30 40 l -30 40 Z`} fill="none" stroke="#d9b04a" strokeWidth={5} />)}
      {/* 기둥 둘 */}
      <path d="M 900 -10 L 900 800 M 1020 -10 L 1020 800" stroke="#c45a3a" strokeWidth={22} />
      <path d="M 900 -10 L 900 800 M 1020 -10 L 1020 800" stroke={INK} strokeWidth={4} opacity={0.6} />
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(170deg, rgba(255,230,170,0) 30%, rgba(255,226,160,0.28) 45%, rgba(255,230,170,0) 60%)" }} />
  </AbsoluteFill>
);
// 원수 둘이 한 게르 안에서 어색하게 밥 (😏 자리): 옷 색 = 옛 부족, 벽엔 두 부족 깃발
const RED_ROBE: Robe = { robe: "#8a3b2c", dark: "#6e2e22", trim: "#c9a24a" };
const BLUE_ROBE: Robe = { robe: "#3d5a80", dark: "#2f4866", trim: "#c9a24a" };
const Shot6Dinner = ({ f0 = 0, len = S(3.8) }: { f0?: number; len?: number }) => {
  const f = useCurrentFrame() - f0;
  const look = S(0.7);
  const give = S(1.8);
  const offer = lerp(f, give, give + 16, 0, 1);
  const chew = (k: number) => (Math.floor((f + k) / 5) % 2 ? "1" : "0");
  const z = interpolate(f, [0, len], [1, 1.08], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 0, 6) * (1 - fadeIn(f, len - 6, 6)) }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 60%" }}>
        <GerRoom />
        {/* 벽에 건 옛 부족 깃발 둘 */}
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
          <path d="M 420 360 L 420 600" stroke={INK} strokeWidth={8} />
          <path d="M 424 364 L 560 404 L 424 444 Z" fill={TRIBES[0].flag} stroke={INK} strokeWidth={6} />
          <path d="M 1500 360 L 1500 600" stroke={INK} strokeWidth={8} />
          <path d="M 1496 364 L 1360 404 L 1496 444 Z" fill={TRIBES[1].flag} stroke={INK} strokeWidth={6} />
          {/* 가운데 솥 */}
          <ellipse cx={960} cy={870} rx={150} ry={26} fill="rgba(43,29,20,0.35)" />
          <path d="M 860 790 C 860 870 1060 870 1060 790 Z" fill="#3a332c" stroke={INK} strokeWidth={7} />
          <path d="M 845 790 L 1075 790" stroke={INK} strokeWidth={10} strokeLinecap="round" />
          {range(3).map((i) => <path key={i} d={`M ${920 + i * 40} 770 c -14 -20 14 -30 0 -50 c -14 -20 14 -30 0 -50`} stroke="#f2ead8" strokeWidth={5} fill="none" opacity={0.3 + 0.2 * Math.sin(f / 8 + i)} />)}
        </svg>
        {/* 왼쪽(빨강 부족)이 어색하게 고기를 내밀고, 오른쪽(파랑 부족)이 😏 */}
        <Seated id="archer" x={640} y={520} s={0.8} c={RED_ROBE} pose={f < look ? "front" : f < give ? "angry" : "sad"} bowl={f < look ? Math.abs(Math.sin(f / 7)) : 0.3} offer={offer} dir={1} mouth={f < look ? chew(0) : "0"} lean={f >= look && f < give ? -3 : 0} />
        <Seated id="archer" x={1280} y={520} s={0.8} c={BLUE_ROBE} pose={f < look + 6 ? "front" : f < give + 18 ? "angry" : "smug"} bowl={f < look + 6 ? Math.abs(Math.sin(f / 7 + 1)) : 0.3} mouth={f < look + 6 ? chew(3) : "0"} lean={f >= look + 6 && f < give + 18 ? 3 : 0} />
        {/* 노려보는 불꽃 */}
        {f >= look + 6 && f < give && (
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <path d={`M 800 ${430 + Math.sin(f / 4) * 6} L 850 410 L 880 445 L 920 415 L 960 450 L 1000 415 L 1040 445 L 1070 410 L 1120 ${430 - Math.sin(f / 4) * 6}`} stroke={RED} strokeWidth={8} fill="none" strokeLinejoin="round" opacity={0.85} />
          </svg>
        )}
      </AbsoluteFill>
      <Badge n={2} at={0} />
    </AbsoluteFill>
  );
};
// 다른 부대로 슬쩍 → 칼이 쾅 (어기면 사형)
const Shot6Desert = ({ frames }: ShotProps) => {
  const f0 = 0;
  const f = useCurrentFrame() - f0;
  const sneak = interpolate(f, [8, S(2.1)], [0, 1], clamp);
  const slam = S(2.5);
  const back = interpolate(f, [slam + 4, slam + 16], [0, 1], { ...clamp, easing: ease });
  const x = 650 + sneak * 300 - back * 250;
  const swordY = interpolate(f, [slam - 6, slam], [-700, 0], { ...clamp, easing: (t) => t * t });
  const shake = f >= slam && f < slam + 24 ? Math.sin((f - slam) * 0.9) * 10 * (1 - (f - slam) / 24) : 0; // 느린 흔들림
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 0, 6), transform: `translateX(${shake}px)` }}>
      <Paper />
      <Ground y={930} />
      <Tug x={110} y={940} h={430} />
      <Tug x={1820} y={940} h={430} color="#4a4038" />
      {range(4).map((i) => <Guy key={i} x={210 + i * 110} h={240} bottom={150} flag={UNIT} pose={f >= slam + 4 ? "shocked" : "front"} beat={f >= slam + 4 ? "jump" : "none"} beatAt={slam + 4 + i * 2} />)}
      {range(5).map((i) => <Guy key={i} x={1270 + i * 110} h={240} bottom={150} flag="#4a4038" pose={f >= slam + 4 ? "shocked" : "front"} flip beat={f >= slam + 4 ? "jump" : "none"} beatAt={slam + 6 + i * 2} />)}
      <Guy x={x} h={250} flag={UNIT} bottom={150 + (f < slam && sneak > 0 && sneak < 1 ? Math.abs(Math.sin(f / 4)) * 12 : 0)} pose={f < slam ? "side" : "shocked"} flip={f < slam} beat={f < slam ? "none" : "jump"} beatAt={slam + 2} />
      {/* 칼 */}
      {f >= slam - 6 && (
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)", transform: `translateY(${swordY}px)` }}>
          <path d="M 1100 960 L 1080 930 L 1080 470 L 1120 470 L 1120 930 Z" fill="#c9ccd0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 1100 930 L 1100 480" stroke="#9aa0a4" strokeWidth={6} />
          <path d="M 1030 470 L 1170 470 L 1170 444 L 1030 444 Z" fill="#c9a24a" stroke={INK} strokeWidth={6} />
          <path d="M 1086 444 L 1086 360 L 1114 360 L 1114 444 Z" fill="#6b4226" stroke={INK} strokeWidth={6} />
          <circle cx={1100} cy={350} r={18} fill="#c9a24a" stroke={INK} strokeWidth={6} />
        </svg>
      )}
      {f >= slam && f < slam + 14 && (
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {range(7).map((i) => { const a = Math.PI + (i / 6) * Math.PI; const r1 = 40 + (f - slam) * 9; return <path key={i} d={`M ${1100 + Math.cos(a) * r1} ${940 + Math.sin(a) * r1 * 0.6} l ${Math.cos(a) * 40} ${Math.sin(a) * 24}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />; })}
        </svg>
      )}
      <SFX name="sword" at={f0 + slam - 4} vol={0.45} dur={40} />
      <Badge n={2} at={0} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [frames - f0 - 8, frames - f0], [0, 0.6], clamp) }} />
    </AbsoluteFill>
  );
};

// ---------- 7) 장점 3: 연대 책임 - 끈으로 묶인 10명 / 카르피니의 기록(1247) / 하나가 도망치면 아홉이 끌려감 (c3_08, c3_09) ----------
const ROPE_X = (i: number) => 375 + i * 130;
const Roped = ({ f, run, dragT, turnT, glareT, homeT, calmT }: { f: number; run: number; dragT: number; turnT: number; glareT: number; homeT: number; calmT: number }) => {
  // run: 도망친 거리(px), 9번이 도망치는 사람
  const drag = Math.max(0, run - 80);
  const xs = range(10).map((i) => (i === 9 ? ROPE_X(9) + run : ROPE_X(i) + drag * (0.35 + 0.65 * (i / 8))));
  const H = 235;
  const waist = 930 - H * 0.4;
  const taut = Math.min(1, drag / 50);
  const ropeD = xs.slice(1).reduce((d, x, i) => d + ` Q ${(xs[i] + x) / 2} ${waist + 26 * (1 - taut)} ${x} ${waist}`, `M ${xs[0]} ${waist}`);
  return (
    <>
      {range(9).map((i) => {
        const pulled = drag > 5 && f < homeT;
        const pose = f >= calmT ? "front" : f >= glareT ? "angry" : pulled ? "shocked" : "front";
        return <Guy key={i} x={xs[i]} h={H} bottom={150} rot={pulled ? 10 * taut : 0} pose={pose} flip={f >= glareT && f < calmT} beat={f >= calmT ? "nod" : f >= glareT ? "shake" : pulled ? "jump" : "none"} beatAt={f >= calmT ? calmT + i * 2 : f >= glareT ? glareT + i : dragT + i * 2} />;
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        <path d={ropeD} stroke="#7a5230" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d={ropeD} stroke="#c9a46a" strokeWidth={4} fill="none" strokeDasharray="10 8" strokeLinecap="round" />
      </svg>
      <Guy x={xs[9]} h={H} bottom={150 + (run > 0 && run < 80 ? Math.abs(Math.sin(f / 4)) * 10 : 0)} rot={drag > 5 && f < turnT ? -8 : 0}
        pose={f >= calmT ? "sad" : f >= glareT ? "sad" : f >= turnT ? "shocked" : run > 0 ? "side" : "front"} flip={run > 0 && f < turnT}
        beat={f >= calmT ? "none" : f >= glareT ? "sink" : f >= turnT ? "jump" : "none"} beatAt={f >= calmT ? calmT : f >= glareT ? glareT + 6 : turnT} />
    </>
  );
};
const Shot7 = ({ at }: ShotProps) => {
  const f = useCurrentFrame();
  const write = S(2.0);
  const R0 = S(6.4);
  const b = at("c3_16");
  if (f >= write && f < R0) return <Shot7Record f0={write} len={R0 - write} />;
  const creep = R0 + S(1.1);
  const dragEnd = R0 + S(2.1);
  const turnT = R0 + S(2.3);
  const glareT = b + S(0.2);
  const homeA = b + S(1.2);
  const homeT = b + S(2.4);
  const calmT = b + S(3.0);
  let run = 0;
  if (f >= R0) {
    run = interpolate(f, [R0, creep], [0, 80], clamp) + interpolate(f, [creep, dragEnd], [0, 130], { ...clamp, easing: ease });
    run *= 1 - interpolate(f, [homeA, homeT], [0, 1], { ...clamp, easing: ease });
  }
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={560} />
      <Ger x={300} y={565} w={190} />
      <Ger x={520} y={555} w={140} />
      <Ger x={1420} y={560} w={160} />
      <Ger x={1650} y={570} w={210} />
      <Tug x={960} y={570} h={260} sway={Math.sin(f / 11) * 4} />
      <AbsoluteFill style={{ transform: "scale(1.12)", transformOrigin: "50% 86%" }}>
        <Roped f={f} run={run} dragT={creep} turnT={turnT} glareT={glareT} homeT={homeT} calmT={calmT} />
      </AbsoluteFill>
      <Badge n={3} at={0} />
    </AbsoluteFill>
  );
};
// 카르피니의 기록: 양피지에 깃펜이 쓰고, 10명 그림 → 하나가 빠지면 열이 다 쓰러짐
const Shot7Record = ({ f0, len }: { f0: number; len: number }) => {
  const f = useCurrentFrame() - f0;
  const lines = [0, 1, 2];
  const wp = interpolate(f, [6, S(2.0)], [0, 3], clamp);
  const flee = S(2.4);
  const fall = S(3.3);
  const pen = Math.min(2.999, wp);
  const li = Math.floor(pen);
  const penX = 640 + (pen - li) * 640;
  const penY = 400 + li * 70 + Math.sin(f * 1.3) * 6;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 0, 6) * (1 - fadeIn(f, len - 6, 6)) }}>
      <Paper />
      <div style={{ position: "absolute", left: 480, top: 170, width: 960, height: 740, background: "linear-gradient(135deg, #f0dfb2, #dcc48e)", border: `6px solid ${INK}`, borderRadius: 14, transform: "rotate(-2deg)", boxShadow: "0 18px 30px rgba(0,0,0,0.3)", filter: "url(#kit-ink)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", transform: "rotate(-2deg)", filter: "url(#kit-ink)" }}>
        <text x={1340} y={290} textAnchor="end" fontFamily={SERIF} fontWeight={700} fontSize={84} fill={INK} opacity={fadeIn(f, 2, 8)}>1247</text>
        {lines.map((i) => {
          const p = Math.max(0, Math.min(1, wp - i));
          let d = `M 640 ${400 + i * 70}`;
          for (let s = 1; s <= 40; s++) d += ` L ${640 + s * 16} ${400 + i * 70 + Math.sin(s * 1.7 + i) * 9 - (s % 5 === 0 ? 12 : 0)}`;
          return <path key={i} d={d} stroke={INK} strokeWidth={5} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" strokeLinejoin="round" />;
        })}
        {/* 10명 그림 */}
        {range(10).map((i) => {
          const x = 680 + i * 62 + (i === 9 ? lerp(f, flee, flee + 10, 0, 90) : 0);
          const down = lerp(f, fall + i * 2, fall + i * 2 + 8, 0, 1);
          return (
            <g key={i} opacity={fadeIn(f, S(1.6) + i * 2, 4)} transform={`rotate(${down * 90} ${x} 760)`}>
              <Pin x={x} y={760} s={2.4} c={down > 0.5 ? RED : INK} />
            </g>
          );
        })}
        {f >= flee + 4 && <Arrow x1={1250} y1={700} x2={1340} y2={700} p={lerp(f, flee, flee + 8, 0, 1)} w={7} color={INK} />}
      </svg>
      {/* 깃펜 */}
      {wp < 3 && (
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
          <g transform={`translate(${penX} ${penY}) rotate(-35)`}>
            <path d="M 0 0 C 20 -60 50 -150 40 -230 C 10 -170 -6 -80 0 0 Z" fill="#f2ead8" stroke={INK} strokeWidth={4} />
            <path d="M 0 0 L 30 -200" stroke={INK} strokeWidth={3} />
          </g>
        </svg>
      )}
      <Badge n={3} at={0} />
    </AbsoluteFill>
  );
};

// ---------- 8) 장점 4: 떼어 쓰기 - 덩어리에서 1,000과 20,000이 블록처럼 빠져 여러 갈래로 (c3_10) ----------
// 투멘 블록 = 밍간 칸 5×2 (점 무늬)
const TUMEN = [
  { x: 680, y: 410 }, { x: 960, y: 410 }, { x: 1240, y: 410 },
  { x: 680, y: 690 }, { x: 960, y: 690 }, { x: 1240, y: 690 },
];
const Ming = ({ x, y, op = 1 }: { x: number; y: number; op?: number }) => <rect x={x - 24} y={y - 62} width={48} height={124} rx={5} fill="url(#c3-dots)" stroke={INK} strokeWidth={3} opacity={op} />;
const mingXY = (j: number) => [-104 + (j % 5) * 52, -64 + Math.floor(j / 5) * 128];
const Shot8 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const one = S(3.4);
  const two = S(6.6);
  const sync = S(8.8);
  const go = S(11.6);
  const step = f >= sync ? Math.round(Math.sin((f - sync) * 0.5) * 5) : 0;
  const zoom = interpolate(f, [go - 10, go + 20], [1, 0.82], { ...clamp, easing: ease });
  const launch = (t: number) => interpolate(f, [go + t, frames - 6], [0, 1], { ...clamp, easing: (x) => x * x });
  // 갈래: 1,000 → 오른쪽 위 / 20,000 → 왼쪽 / 오른쪽 둘 → 오른쪽 아래 / 가운데 둘 → 아래
  const pOne = interpolate(f, [one, one + 22], [0, 1], { ...clamp, easing: ease });
  const pTwo = interpolate(f, [two, two + 26], [0, 1], { ...clamp, easing: ease });
  const g1 = launch(0), g2 = launch(4), g3 = launch(8), g4 = launch(12);
  const oneX = 1240 + 104 + pOne * 380 + g1 * 360;
  const oneY = 410 - 64 - pOne * 220 - g1 * 230;
  const twoDX = -pTwo * 300 - g2 * 520;
  const twoDY = g2 * 40;
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          <defs>
            <pattern id="c3-dots" width={10} height={10} patternUnits="userSpaceOnUse">
              <circle cx={5} cy={5} r={2.8} fill={INK} />
            </pattern>
          </defs>
          {/* 갈래 화살표 */}
          {f >= go - 6 && (
            <g filter="url(#kit-ink)">
              <Arrow x1={1640} y1={160} x2={2150} y2={-120} p={lerp(f, go - 6, go + 12, 0, 1)} w={14} />
              <Arrow x1={330} y1={560} x2={-330} y2={560} cy={500} p={lerp(f, go - 4, go + 14, 0, 1)} w={18} />
              <Arrow x1={1440} y1={760} x2={2050} y2={1180} p={lerp(f, go - 2, go + 16, 0, 1)} w={18} />
              <Arrow x1={960} y1={900} x2={900} y2={1350} p={lerp(f, go, go + 18, 0, 1)} w={18} />
            </g>
          )}
          {TUMEN.map((t, i) => {
            const left = i % 3 === 0;
            const right = i % 3 === 2;
            const dx = left ? twoDX : right ? g3 * 520 : 0;
            const dy = left ? twoDY : right ? g3 * 360 : g4 * 520;
            const pop = fadeIn(f, i * 3, 8);
            return (
              <g key={i} transform={`translate(${t.x + dx} ${t.y + dy + step})`} opacity={pop}>
                {range(10).map((j) => (i === 2 && j === 4 ? null : <Ming key={j} x={mingXY(j)[0]} y={mingXY(j)[1]} />))}
              </g>
            );
          })}
          <g transform={`translate(0 ${step})`}><Ming x={oneX} y={oneY} /></g>
          {pOne > 0.5 && <text x={oneX - 40} y={oneY + 20} textAnchor="end" fontFamily={SERIF} fontWeight={700} fontSize={70} fill={RED} opacity={fadeIn(f, one + 10, 6) * (1 - fadeIn(f, go, 10))}>1,000</text>}
          {pTwo > 0.5 && <text x={680 + twoDX} y={200} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={80} fill={RED} opacity={fadeIn(f, two + 14, 6) * (1 - fadeIn(f, go, 10))}>20,000</text>}
          {pTwo > 0.5 && f < go && <rect x={680 + twoDX - 150} y={410 - 150} width={300} height={580} rx={14} fill="none" stroke={RED} strokeWidth={5} strokeDasharray="16 10" opacity={fadeIn(f, two + 14, 6)} />}
        </svg>
      </AbsoluteFill>
      <Badge n={4} at={0} />
      <SFX name="whoosh" at={one} vol={0.3} dur={30} />
      <SFX name="whoosh" at={two} vol={0.3} dur={30} />
      <SFX name="march" at={sync} vol={0.3} dur={frames - sync} />
    </AbsoluteFill>
  );
};

// ---------- 9) 몰이사냥(네르게): 하늘에서 본 거대한 원이 짐승을 가운데로, 원이 끊기면 대장이 벌 (c3_11, c3_12) ----------
const RING = 64;
const CX = 960, CY = 560;
const ANIMALS: { sp: "deer" | "wolf" | "hare"; r: number; a: number }[] = range(15).map((i) => ({ sp: (["deer", "wolf", "hare", "deer", "hare"] as const)[i % 5], r: 0.2 + ((i * 37) % 60) / 100, a: i * 2.4 + 0.3 }));
const Shot9 = () => {
  const f = useCurrentFrame();
  const top = S(3.6);
  if (f < top) return <Shot9Hunt />;
  // 땅 높이 컷은 2.2초, 하늘 장면과 12프레임씩 겹쳐 서서히 바뀜 (2026-10-27: 1.2초 + 검은 화면 → "전환이 너무 빨라", check-draft 빠른 전환)
  const cutA = S(8.4), cutB = S(10.6), XF = 12;
  const groundOp = Math.min(interpolate(f, [cutA, cutA + XF], [0, 1], clamp), interpolate(f, [cutB - XF, cutB], [1, 0], clamp));
  // "수만 명이 거대한 원을" → "몇 주에 걸쳐 가운데로"(낮·밤이 지나가며 원이 좁혀짐) → "원이 끊기면 대장이 벌"
  const R = interpolate(f, [top, S(5.4), S(7.4), cutA], [900, 900, 760, 480], { ...clamp, easing: ease });
  const moving = f < S(5.4) ? 0 : f < cutA ? 1 : 0;
  const sky = f < S(7.4) ? 0 : f < cutA ? interpolate(f, [S(7.4), cutA], [0, 3.2], clamp) : interpolate(f, [cutB, cutB + 30], [3.2, 4], clamp);
  const gapT = S(10.9);
  const capT = S(12.0);
  const gap = interpolate(f, [gapT, gapT + 14], [0, 1], { ...clamp, easing: ease });
  const esc = interpolate(f, [gapT + 6, gapT + 44], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, top, 6) }}>
      <NergeView f={f} R={f >= cutB ? 480 : R} gap={gap} moving={moving} sky={sky} esc={esc} appear={top + 2} red={f >= gapT + 10} zoom={interpolate(f, [top, S(7.4)], [0.92, 1], clamp)} />
      {/* 끊긴 자리 대장: 동그란 창 안에서 놀람 → 풀죽음 */}
      {f >= capT && (
        <div style={{ position: "absolute", left: 1450, top: 160, width: 380, height: 380, borderRadius: "50%", overflow: "hidden", border: `8px solid ${RED}`, background: "radial-gradient(#e6ecd4, #b8c48a)", transform: `scale(${spring({ frame: f - capT, fps: FPS, config: { damping: 12, stiffness: 180 } })})`, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
          <Guy x={190} h={370} bottom={-60} pose={f < capT + S(1.0) ? "shocked" : "sad"} beat={f < capT + S(1.0) ? "jump" : "sink"} beatAt={f < capT + S(1.0) ? capT + 4 : capT + S(1.0)} />
        </div>
      )}
      {groundOp > 0 && <AbsoluteFill style={{ opacity: groundOp }}><NergeGround f0={cutA} /></AbsoluteFill>}
      <SFX name="hooves" at={S(5.4)} vol={0.25} dur={S(4)} />
      <SFX name="campfire" at={cutA - 6} vol={0.25} dur={cutB - cutA} />
    </AbsoluteFill>
  );
};
// "훈련은? 답은 사냥" - 풀 뜯는 짐승들, 언덕 위 칭기즈칸이 가리키면 능선마다 기병 실루엣이 하나둘 솟아 둘러쌈 (가로로 지나가는 기병 아님)
const Shot9Hunt = () => {
  const f = useCurrentFrame();
  const call = S(2.1);
  const z = interpolate(f, [0, S(3.6)], [1, 1.06], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 70%" }}>
      <Steppe time="day" horizon={560} />
      {/* 능선의 기병 실루엣 (서 있는 말) */}
      {range(16).map((i) => {
        const t0 = call + 6 + ((i * 7) % 16) * 2;
        if (f < t0) return null;
        const x = i < 8 ? 20 + i * 95 : 1180 + (i - 8) * 95;
        const rise = lerp(f, t0, t0 + 10, 40, 0);
        return <div key={i} style={{ position: "absolute", inset: 0, clipPath: "inset(0 0 520px 0)" }}><Rider kind={i % 2 ? "mongol2" : "mongol"} x={x} y={420 + rise + (i % 3) * 8} w={110} still dark flip={i >= 8} /></div>;
      })}
      <Tug x={1050} y={600} h={260} sway={Math.sin(f / 10) * 4} />
      <Guy id="genghis" x={960} bottom={480} h={250} pose={f < call ? "front" : "smug"} gesture="point" gestureAt={call - 6} beat="none" />
      <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        {range(9).map((i) => {
          const sp = (["deer", "deer", "wolf", "hare", "deer", "hare", "wolf", "deer", "hare"] as const)[i];
          const x = 160 + i * 200 + ((i * 53) % 60);
          const y = 760 + ((i * 89) % 230);
          const look = f >= call + 10 + i * 2;
          return <Beast key={i} sp={sp} x={x} y={y} s={1.6 + (y - 760) / 300} f={look ? 0 : f * 0.2 + i} flip={i % 2 === 0} />;
        })}
      </svg>
      <SFX name="war_horn" at={call} vol={0.3} dur={60} />
    </AbsoluteFill>
  );
};

// ---------- 말·기병 그림 (audio/riders.py와 같은 그림을 코드로 옮김 - 사람과 말을 따로 그려 옮겨 타기·빈 말·풀 뜯기가 됨) ----------
// 판 좌표 400×310 (viewBox 0 -24), 발굽 가운데 ≈ (200, 278)
type HK = { horse: string; mane: string; blaze?: boolean };
const HORSES: Record<string, HK> = {
  bay: { horse: "#8a5a36", mane: "#3a2618" },
  dark: { horse: "#5e4030", mane: "#24170f" },
  white: { horse: "#e8dfcc", mane: "#b9ad96" },
  dun: { horse: "#b89a6a", mane: "#5a4030" },
  grey: { horse: "#9a968e", mane: "#4a4640" },
  black: { horse: "#2c2420", mane: "#120c08", blaze: true },
};
const shade = (c: string, k: number) => "#" + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(c.slice(i, i + 2), 16) * k))).toString(16).padStart(2, "0")).join("");
const PHASES: [number, number][][] = [
  [[40, 10], [10, -30], [-10, -40], [30, 20]],
  [[20, -20], [-10, -50], [20, 10], [-20, -60]],
  [[-10, -40], [35, 15], [35, 25], [-35, -10]],
  [[10, -60], [45, 30], [0, -30], [10, 40]],
];
const STAND: [number, number][] = [[4, -2], [-3, 2], [-4, 2], [3, -2]];
const RLeg = ({ x, y, a, col }: { x: number; y: number; a: [number, number]; col: string }) => {
  const r1 = (a[0] * Math.PI) / 180, r2 = (a[1] * Math.PI) / 180;
  const kx = x + 38 * Math.sin(r1), ky = y + 38 * Math.cos(r1);
  const hx = kx + 36 * Math.sin(r2), hy = ky + 36 * Math.cos(r2);
  const d = `M ${x} ${y} L ${kx} ${ky} L ${hx} ${hy}`;
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={col} strokeWidth={19} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={hx + 3} cy={hy + 4} rx={11} ry={7} fill={INK} />
    </>
  );
};
// 말만: ph 0~3 달림 · -1 서 있음, saddle 안장, graze 고개 숙여 풀 뜯기(0~1), tired 지쳐 고개 처짐(0~1), cape 기사 말 덮개 색
const RHorse = ({ c, ph, saddle = false, graze = 0, tired = 0, cape }: { c: HK; ph: number; saddle?: boolean; graze?: number; tired?: number; cape?: string }) => {
  const L = ph < 0 ? STAND : PHASES[ph];
  const far = shade(c.horse, 0.78);
  const neckRot = graze * 95 + tired * 22;
  return (
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
      <RLeg x={262} y={196} a={L[0]} col={far} />
      <RLeg x={120} y={196} a={L[2]} col={far} />
      <path d="M 92 148 C 60 150 44 180 40 214 C 58 200 70 186 96 170 Z" fill={c.mane} />
      <g transform={`rotate(${neckRot} 262 150)`}>
        <path d="M 236 150 L 246 118 C 262 96 278 72 300 62 C 318 54 336 58 346 72 L 362 112 C 366 122 360 130 350 130 C 338 130 330 124 322 116 L 300 104 C 294 124 290 140 286 160 Z" fill={c.horse} />
        <path d="M 252 118 C 262 92 280 70 302 60 L 310 70 C 292 82 278 102 268 126 Z" fill={c.mane} />
        <path d="M 300 58 C 304 50 312 48 318 54 L 312 66 Z" fill={c.mane} />
        <path d="M 318 60 L 322 42 L 330 60 Z" fill={c.horse} />
        {c.blaze && <path d="M 330 66 C 340 80 346 96 352 112 L 344 114 C 338 98 330 82 324 70 Z" fill="#efe6d2" stroke="none" />}
        <circle cx={326} cy={80} r={tired > 0.5 ? 2 : 4} fill={INK} stroke="none" />
        <circle cx={352} cy={118} r={3} fill={INK} stroke="none" />
        <path d="M 318 92 L 352 112 M 322 76 L 330 104" stroke="#5a3a24" strokeWidth={3} fill="none" />
      </g>
      <path d="M 100 168 C 96 132 130 118 180 120 L 262 120 C 290 126 288 150 284 168 C 282 206 250 214 190 214 C 130 214 102 204 100 168 Z" fill={c.horse} />
      <path d="M 120 196 C 160 210 230 210 270 196" fill="none" stroke={shade(c.horse, 0.8)} strokeWidth={6} />
      {cape && <path d="M 110 150 C 140 124 250 122 280 146 L 276 200 C 230 214 150 214 112 200 Z" fill={cape} />}
      {cape && <path d="M 120 196 L 128 186 L 136 198 L 144 186 L 152 198 L 160 186 L 168 198 L 176 186 L 184 198 L 192 186 L 200 198 L 208 186 L 216 198 L 224 186 L 232 198 L 240 186 L 248 198 L 256 186 L 264 198" fill="none" stroke="#c9a24a" strokeWidth={3} />}
      {saddle && <path d="M 168 118 C 168 140 236 140 236 118 Z" fill="#4a3424" />}
      {saddle && <path d="M 172 120 L 230 120 L 226 160 L 176 160 Z" fill="#8a3b2c" />}
      <RLeg x={270} y={200} a={L[1]} col={c.horse} />
      <RLeg x={128} y={200} a={L[3]} col={c.horse} />
    </g>
  );
};
// 사람만 (안장 위): mongol·mongol2·white(지휘관)·knight(유럽 기사 - 통투구·흰 겉옷·창)
type MK = { skin: string; cloth: string; armor: string; helmet: string; plume?: string; bow: boolean; knight?: boolean };
const MEN: Record<string, MK> = {
  mongol: { skin: "#d9a87c", cloth: "#2f4a5e", armor: "#7d93a6", helmet: "#8a9298", plume: "#a8332a", bow: true },
  mongol2: { skin: "#cf9d72", cloth: "#5a3e28", armor: "#8a6440", helmet: "#7a7f84", plume: "#a8332a", bow: true },
  white: { skin: "#dcae84", cloth: "#9c3a2c", armor: "#c9a24a", helmet: "#f2ead8", plume: "#c9a24a", bow: false },
  knight: { skin: "#e0b48a", cloth: "#e8e2d4", armor: "#9aa0a4", helmet: "#a4a8aa", bow: false, knight: true },
};
const RMan = ({ m, lean = 0 }: { m: MK; lean?: number }) => (
  <g stroke={INK} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" transform={`rotate(${lean} 206 130)`}>
    <path d="M 200 120 L 214 156 L 236 168" fill="none" stroke={INK} strokeWidth={30} />
    <path d="M 200 120 L 214 156 L 236 168" fill="none" stroke={m.knight ? "#7d8286" : m.cloth} strokeWidth={20} />
    <path d="M 216 156 L 236 168 L 248 168 C 252 176 244 182 234 180 L 212 172 Z" fill="#3a2b22" />
    <path d="M 176 124 C 172 92 186 62 212 56 C 236 52 248 70 246 96 L 238 124 Z" fill={m.cloth} />
    {m.knight ? (
      <path d="M 210 64 L 210 120 M 188 88 L 238 88" stroke="#a8332a" strokeWidth={9} />
    ) : (
      <>
        <path d="M 184 116 C 182 92 192 72 212 66 C 230 64 240 78 238 98 L 232 116 Z" fill={m.armor} />
        {[80, 92, 104].map((y) => <path key={y} d={`M 188 ${y} L 236 ${y}`} fill="none" strokeWidth={2} />)}
      </>
    )}
    {m.knight ? (
      <>
        <path d="M 250 96 L 400 30" stroke="#6b4a2c" strokeWidth={7} />
        <path d="M 400 30 L 386 44 L 392 22 Z" fill="#9aa0a4" />
        <path d="M 360 48 L 384 50 L 366 62 Z" fill="#3d5a80" strokeWidth={3} />
        <path d="M 226 70 L 246 98 L 262 98" fill="none" stroke={INK} strokeWidth={20} />
        <path d="M 226 70 L 246 98 L 262 98" fill="none" stroke={m.cloth} strokeWidth={12} />
      </>
    ) : m.bow ? (
      <>
        <path d="M 226 70 L 262 78 L 290 70" fill="none" stroke={INK} strokeWidth={20} />
        <path d="M 226 70 L 262 78 L 290 70" fill="none" stroke={m.cloth} strokeWidth={12} />
        <path d="M 296 20 C 310 40 310 100 296 120" fill="none" stroke={INK} strokeWidth={10} />
        <path d="M 296 20 C 310 40 310 100 296 120" fill="none" stroke="#a87a3e" strokeWidth={5} />
        <path d="M 296 22 L 296 118" fill="none" stroke="#e8dcc0" strokeWidth={2} />
        <circle cx={294} cy={70} r={9} fill={m.skin} />
      </>
    ) : (
      <>
        <path d="M 226 70 L 246 98 L 270 110" fill="none" stroke={INK} strokeWidth={20} />
        <path d="M 226 70 L 246 98 L 270 110" fill="none" stroke={m.cloth} strokeWidth={12} />
        <circle cx={272} cy={112} r={9} fill={m.skin} />
      </>
    )}
    {m.knight ? (
      <>
        <path d="M 196 46 C 194 14 250 10 250 42 L 250 66 C 236 72 208 72 196 66 Z" fill={m.helmet} />
        <path d="M 226 38 L 250 38 M 238 46 L 238 62" stroke={INK} strokeWidth={5} />
        <path d="M 196 46 C 196 30 250 26 250 42" fill="none" stroke="#c9a24a" strokeWidth={5} />
      </>
    ) : (
      <>
        <path d="M 196 40 C 196 12 246 10 248 38 C 250 58 236 70 220 70 C 204 70 196 58 196 40 Z" fill={m.skin} />
        <circle cx={236} cy={38} r={3.5} fill={INK} stroke="none" />
        <path d="M 228 28 L 242 30" fill="none" strokeWidth={4} />
        <path d="M 232 54 L 242 52" fill="none" strokeWidth={3} />
        <path d="M 196 36 C 190 6 250 0 250 32 Z" fill={m.helmet} />
        <path d="M 192 32 L 252 30" fill="none" stroke="#c9a24a" strokeWidth={6} />
        <path d="M 196 34 C 188 48 188 62 196 70 L 210 66 L 206 36 Z" fill={shade(m.helmet, 0.8)} />
        {m.plume && <path d="M 222 6 L 222 -6 M 222 -4 C 206 -6 196 4 192 16 C 204 10 214 8 222 8 Z" fill={m.plume} />}
      </>
    )}
  </g>
);
// 말 탄 기병 (또는 빈 말): (x,y) = 발굽 자리, s 배율. f·o로 달림 단계, speed 4(보통)·7(지침)
const RR = ({ x, y, s = 1, horse = "bay", man, f, o = 0, still = false, speed = 4, flip = false, saddle, graze = 0, tired = 0, cape }: { x: number; y: number; s?: number; horse?: string; man?: string; f: number; o?: number; still?: boolean; speed?: number; flip?: boolean; saddle?: boolean; graze?: number; tired?: number; cape?: string }) => {
  const ph = still ? -1 : Math.floor((f + o) / speed) % 4;
  const bob = still ? 0 : Math.sin(((f + o) / (speed * 4)) * Math.PI * 2) * 4;
  return (
    <g transform={`translate(${x} ${y + bob * s}) scale(${flip ? -s : s} ${s}) translate(-200 -278)`} filter="url(#kit-ink)">
      <RHorse c={HORSES[horse]} ph={ph} saddle={saddle ?? !!man} graze={graze} tired={tired} cape={cape} />
      {man && <RMan m={MEN[man]} />}
    </g>
  );
};
// 흐르는 땅 (따라가는 카메라: 풀이 뒤로 흘러감)
const Tufts = ({ f, speed, y0 = 640, y1 = 1080, n = 30, color = "#5f7236" }: { f: number; speed: number; y0?: number; y1?: number; n?: number; color?: string }) => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    {range(n).map((i) => {
      const y = y0 + ((i * 97) % (y1 - y0));
      const k = 0.5 + (y - y0) / (y1 - y0);
      const x = ((((i * 233 - f * speed * k) % 2200) + 2200) % 2200) - 140;
      return <path key={i} d={`M ${x} ${y} l ${-8 * k} ${-16 * k} M ${x} ${y} l ${2 * k} ${-20 * k} M ${x} ${y} l ${12 * k} ${-14 * k}`} stroke={color} strokeWidth={3.5} strokeLinecap="round" />;
    })}
  </svg>
);

// ---------- 10) 거짓 후퇴 단계별 (c3_20~c3_24): 위에서 본 전술판 + 땅에서 본 짧은 컷 ----------
// 몽골: 앞줄 F(흰 말 지휘관) · 날개 W1/W2(언덕 뒤에 숨음, 장수 기병) / 적: 기병 C(빠름) · 보병 I(느림)
const Knight = ({ x, y, s = 1, op = 1 }: { x: number; y: number; s?: number; op?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={0} rx={15} ry={8} fill="#9a968e" stroke={INK} strokeWidth={2.5} />
    <path d="M -7 -8 L 7 -8 L 7 1 C 7 6 0 9 0 9 C 0 9 -7 6 -7 1 Z" fill="#e8e2d4" stroke={INK} strokeWidth={2} />
    <path d="M 0 -6 L 0 6 M -5 -2 L 5 -2" stroke="#a8332a" strokeWidth={2.2} />
  </g>
);
const Hill = ({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) => (
  <g filter="url(#kit-ink)">
    {[1, 0.72, 0.45].map((k, i) => <ellipse key={i} cx={x} cy={y} rx={rx * k} ry={ry * k} fill={["#8fa45c", "#7f9550", "#718646"][i]} stroke={INK} strokeWidth={4} />)}
    {range(14).map((i) => { const a = (i / 14) * Math.PI * 2; return <path key={i} d={`M ${x + Math.cos(a) * rx * 0.98} ${y + Math.sin(a) * ry * 0.98} L ${x + Math.cos(a) * rx * 0.8} ${y + Math.sin(a) * ry * 0.8}`} stroke={INK} strokeWidth={3} />; })}
  </g>
);
const Feint = ({ at }: ShotProps) => {
  const f = useCurrentFrame();
  const a21 = at("c3_21"), a22 = at("c3_22"), a23 = at("c3_23"), a24 = at("c3_24");
  // 땅에서 본 컷
  if (f >= a21 + S(3.2) && f < a22) return <FeintCutFlee f0={a21 + S(3.2)} />;
  if (f >= a22 && f < a22 + S(3.4)) return <FeintCutBoast f0={a22} />;
  if (f >= a23 + S(1.8) && f < a23 + S(4.4)) return <FeintCutWings f0={a23 + S(1.8)} />;
  const e = (a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
  const Fx = 1150 - 370 * e(a21 + S(0.3), a21 + S(1.8)) + 720 * e(a21 + S(2.6), a21 + S(5.2)) + 150 * e(a22, a23) - 330 * e(a23 + S(6.0), a23 + S(8.0));
  const Cx = 620 + 560 * e(a22 + S(3.6), a22 + S(9.5));
  const Ix = 380 + 230 * e(a22 + S(3.6), a22 + S(11.0));
  const wing = e(a23 + S(0.4), a23 + S(4.6));
  const ring = e(a24 + S(0.2), a24 + S(1.6));
  const RC = { x: 1120, y: 540, r: 240 };
  // 적 기병: 쫓을 때 줄이 앞뒤로 늘어짐
  const stretch = e(a22 + S(3.6), a22 + S(9.5));
  const knights = range(14).map((i) => {
    const c = i % 4, r = Math.floor(i / 4);
    return { x: Cx - r * 34 - c * (6 + stretch * 30) + Math.sin(i * 2.1) * 8 * stretch, y: 470 + c * 46 + (r % 2) * 18 };
  });
  const foot = range(24).map((i) => ({ x: Ix - (i % 6) * 26, y: 450 + Math.floor(i / 6) * 50 + (i % 2) * 10 }));
  // 몽골 점 32개: 앞줄 12 + 위 날개 10 + 아래 날개 10
  const dots = range(32).map((j) => {
    let x: number, y: number;
    if (j < 12) { x = Fx + Math.abs(j - 5.5) * 10; y = 330 + j * 38; }
    else if (j < 22) { const k = j - 12; x = 1480 + (k % 5) * 30 + (1 - wing) * 0 - wing * (520 - k * 40); y = 110 + Math.floor(k / 5) * 26 + wing * (230 - Math.floor(k / 5) * 26 + Math.sin(k) * 10); }
    else { const k = j - 22; x = 1480 + (k % 5) * 30 - wing * (520 - k * 40); y = 970 - Math.floor(k / 5) * 26 - wing * (230 - Math.floor(k / 5) * 26 + Math.sin(k) * 10); }
    const a = (j / 32) * Math.PI * 2;
    return { x: x + (RC.x + Math.cos(a) * RC.r - x) * ring, y: y + (RC.y + Math.sin(a) * RC.r - y) * ring };
  });
  const hidden = 1 - fadeIn(f, a23 + S(0.4), 8);
  const step = f >= a24 ? 4 : f >= a23 ? 3 : f >= a22 ? 2 : f >= a21 ? 1 : 0;
  const fleeing = f >= a21 + S(2.6) && f < a23 + S(6.0);
  // 사냥 원 유령 (같은 원)
  const ghost = fadeIn(f, a24 + S(1.4), 14) * 0.45;
  const intro = 1 - fadeIn(f, 20, 30);
  return (
    <AbsoluteFill>
      <Field />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* 사냥 원 → 전장 (도입) */}
        {intro > 0 && <circle cx={960} cy={560} r={260 + (1 - intro) * 300} fill="none" stroke={INK} strokeWidth={8} strokeDasharray="4 18" opacity={intro} />}
        <Hill x={1560} y={130} rx={300} ry={110} />
        <Hill x={1560} y={950} rx={300} ry={110} />
        {/* 적: 보병(느림) · 기병(빠름) + 늘어진 틈 */}
        {stretch > 0.2 && f < a24 && (
          <g opacity={fadeIn(f, a22 + S(5.0), 10)}>
            <path d={`M ${Ix + 10} 400 L ${Cx - 150} 400`} stroke={RED} strokeWidth={5} strokeDasharray="12 8" />
            <path d={`M ${Ix + 10} 386 L ${Ix + 10} 414 M ${Cx - 150} 386 L ${Cx - 150} 414`} stroke={RED} strokeWidth={5} />
          </g>
        )}
        {foot.map((p, i) => <Foe key={`i${i}`} x={p.x} y={p.y} s={0.95} />)}
        {knights.map((p, i) => <Knight key={`k${i}`} x={p.x} y={p.y} s={1.4} />)}
        {f >= a22 + S(3.6) && f < a24 && range(6).map((i) => <circle key={`d${i}`} cx={Cx - 120 - i * 40} cy={480 + ((i * 53) % 140)} r={18 + i * 3} fill="#c9b48a" opacity={0.35 - i * 0.04} />)}
        {/* 몽골 */}
        {dots.map((d, j) => <Dot key={j} x={d.x} y={d.y} s={1.5} c={j === 0 || j === 12 || j === 22 ? RED : INK} op={j >= 12 && f < a23 + S(0.4) ? 0.3 : 1} />)}
        {/* 언덕이 날개를 가림 */}
        {hidden > 0 && <g opacity={hidden * 0.85}><Hill x={1560} y={130} rx={300} ry={110} /><Hill x={1560} y={950} rx={300} ry={110} /></g>}
        {/* 움직임 화살표 */}
        <g filter="url(#kit-ink)">
          {step === 1 && f < a21 + S(2.0) && <Arrow x1={1100} y1={250} x2={800} y2={250} p={e(a21, a21 + S(0.8))} w={10} color={INK} />}
          {step === 1 && f >= a21 + S(2.6) && <Arrow x1={820} y1={250} x2={1450} y2={250} p={e(a21 + S(2.6), a21 + S(3.2))} w={10} color={INK} />}
          {step === 2 && <Arrow x1={700} y1={760} x2={1200} y2={760} p={e(a22 + S(4.0), a22 + S(5.0))} w={10} color="#5d6f86" />}
          {step === 3 && <Arrow x1={1500} y1={240} x2={1000} y2={360} cx={1350} cy={420} p={e(a23 + S(4.4), a23 + S(5.2))} w={12} />}
          {step === 3 && <Arrow x1={1500} y1={840} x2={1000} y2={720} cx={1350} cy={660} p={e(a23 + S(4.4), a23 + S(5.2))} w={12} />}
          {step === 3 && f >= a23 + S(6.0) && <Arrow x1={1650} y1={540} x2={1380} y2={540} p={e(a23 + S(6.0), a23 + S(6.8))} w={12} />}
        </g>
        {/* 갇힌 적에게 사방에서 화살 */}
        {f >= a24 + S(1.2) && dots.map((d, j) => {
          const t = ((f - a24 - S(1.2) + j * 5) % 22) / 22;
          const x = d.x + (RC.x - d.x) * t * 0.7, y = d.y + (RC.y - d.y) * t * 0.7;
          const a = Math.atan2(RC.y - d.y, RC.x - d.x);
          return <path key={`a${j}`} d={`M ${x} ${y} L ${x + Math.cos(a) * 26} ${y + Math.sin(a) * 26}`} stroke="#6b4a2c" strokeWidth={3} opacity={1 - t} />;
        })}
        {/* 사냥 원 유령: 같은 원 안의 짐승 */}
        {ghost > 0 && (
          <g opacity={ghost}>
            <circle cx={RC.x} cy={RC.y} r={RC.r} fill="none" stroke="#8a5a34" strokeWidth={6} strokeDasharray="6 12" />
            {ANIMALS.slice(0, 9).map((an, i) => <Beast key={i} sp={an.sp} x={RC.x + Math.cos(an.a) * an.r * RC.r * 0.7} y={RC.y + Math.sin(an.a) * an.r * RC.r * 0.7 + 30} s={1.3} f={0} />)}
          </g>
        )}
      </svg>
      {/* 이끄는 장수 기병 (전술판 위 작은 말 탄 그림) */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <RR x={dots[0].x + 10} y={dots[0].y - 26} s={0.32} horse="white" man="white" f={f} flip={!fleeing} still={f < a21} />
        {f >= a23 + S(0.4) && <RR x={dots[12].x} y={dots[12].y - 26} s={0.3} man="mongol" f={f} flip />}
        {f >= a23 + S(0.4) && <RR x={dots[22].x} y={dots[22].y - 26} s={0.3} horse="dark" man="mongol2" f={f} o={5} flip />}
        <RR x={knights[0].x + 30} y={knights[0].y - 30} s={0.3} horse="grey" man="knight" cape="#3d5a80" f={f} still={f < a22 + S(3.6)} />
      </svg>
      {step > 0 && <Badge key={step} n={step} at={[0, a21, a22, a23, a24][step]} />}
      {f >= a21 + S(1.6) && f < a21 + S(2.6) && (
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {range(6).map((i) => { const a = i * 1.05 + f / 6; return <path key={i} d={`M ${760 + Math.cos(a) * 30} ${540 + Math.sin(a) * 60} l ${Math.cos(a) * 40} ${Math.sin(a) * 40}`} stroke={RED} strokeWidth={6} strokeLinecap="round" />; })}
        </svg>
      )}
      <SFX name="swords" at={a21 + S(1.6)} vol={0.3} dur={40} />
      <SFX name="war_horn" at={a23 + S(0.3)} vol={0.35} dur={70} />
      <SFX name="arrow_rain" at={a24 + S(1.2)} vol={0.35} dur={90} />
    </AbsoluteFill>
  );
};
// ① 컷: 겁먹은 척 등을 돌려 달아나는 몽골 앞줄 - 멀리서 비스듬히 다가오며 커짐, 뒤에 쫓는 기사들
const FeintCutFlee = ({ f0 }: { f0: number }) => {
  const f = useCurrentFrame() - f0;
  const p = interpolate(f, [0, S(2.6)], [0, 1], clamp);
  const path = (q: number) => ({ x: 300 + q * 900, y: 520 + q * 380, k: 0.35 + q * 0.75 });
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={470} />
      <Tufts f={f} speed={6} y0={520} />
      <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
        {range(4).map((i) => { const q = path(Math.max(0, p - 0.35 - i * 0.05)); return <RR key={`k${i}`} x={q.x - 140 + i * 70} y={q.y - 30 * i} s={q.k * 0.8} horse="grey" man="knight" cape={i % 2 ? "#3d5a80" : "#8a3b2c"} f={f} o={i * 3} />; })}
        {[2, 1, 0].map((i) => { const q = path(Math.min(1, p + 0.02 * i)); return <RR key={i} x={q.x + [0, -170, 160][i]} y={q.y + [0, -40, -60][i]} s={q.k * [1, 0.85, 0.85][i]} horse={i === 0 ? "white" : i === 1 ? "bay" : "dark"} man={i === 0 ? "white" : i === 1 ? "mongol" : "mongol2"} f={f} o={i * 5} />; })}
      </svg>
      <Badge n={1} at={0} />
    </AbsoluteFill>
  );
};
// ② 컷: "이겼다!" - 유럽 기사 대장이 깃발 아래에서 쫓으라고 가리킴
const EuroBanner = ({ x, y, h = 360, kind = 0 }: { x: number; y: number; h?: number; kind?: number }) => (
  <svg width={260} height={h + 20} viewBox={`0 0 260 ${h + 20}`} style={{ position: "absolute", left: x - 20, top: y - h, filter: "url(#kit-ink)", overflow: "visible" }}>
    <path d={`M 20 ${h} L 20 10`} stroke={INK} strokeWidth={10} />
    <path d={`M 20 ${h} L 20 10`} stroke="#7a5230" strokeWidth={5} />
    <circle cx={20} cy={8} r={9} fill="#c9a24a" stroke={INK} strokeWidth={4} />
    {kind === 0 ? (
      <>
        <path d="M 24 24 L 200 24 L 200 150 L 160 130 L 120 150 L 80 130 L 24 150 Z" fill="#e8e2d4" stroke={INK} strokeWidth={5} />
        <path d="M 112 30 L 112 140 M 30 82 L 194 82" stroke="#a8332a" strokeWidth={18} />
      </>
    ) : (
      <>
        <path d="M 24 24 L 200 24 L 200 160 L 112 190 L 24 160 Z" fill="#3d5a80" stroke={INK} strokeWidth={5} />
        {[60, 100, 140].map((yy) => <path key={yy} d={`M 30 ${yy} L 194 ${yy}`} stroke="#c9a24a" strokeWidth={10} />)}
      </>
    )}
  </svg>
);
const FeintCutBoast = ({ f0 }: { f0: number }) => {
  const f = useCurrentFrame() - f0;
  const go = S(1.6);
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={600} />
      <EuroBanner x={420} y={880} h={430} />
      <EuroBanner x={1500} y={760} h={320} kind={1} />
      <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
        <RR x={1280} y={760} s={0.9} horse="grey" man="knight" cape="#3d5a80" f={f} still={f < go} o={2} />
        <RR x={1600} y={830} s={1} horse="dark" man="knight" cape="#8a3b2c" f={f} still={f < go + 6} />
      </svg>
      <Guy id="mstislav_bold" x={760} h={560} bottom={100} pose={f < go ? "smug" : "angry"} gesture="point" gestureAt={go - 8} beat={f < go ? "none" : "shake"} beatAt={go} />
      <Badge n={2} at={0} />
      <SFX name="war_cry" at={f0 + go} vol={0.3} dur={50} />
    </AbsoluteFill>
  );
};
// ③ 컷: 언덕 너머에서 날개가 튀어나와 비탈을 쏟아져 내려옴 (위 → 아래로, 다가오며 커짐)
const FeintCutWings = ({ f0 }: { f0: number }) => {
  const f = useCurrentFrame() - f0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#e9dcbc, #efe4c8)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        <path d="M 0 420 C 400 360 800 340 1100 380 C 1400 420 1700 400 1920 360 L 1920 1080 L 0 1080 Z" fill="#9fb065" stroke={INK} strokeWidth={6} />
      </svg>
      <Tufts f={0} speed={0} y0={460} />
      <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
        {range(7).map((i) => {
          const t0 = (i % 4) * 5 + Math.floor(i / 4) * 12;
          const q = interpolate(f - t0, [0, S(2.2)], [0, 1], clamp);
          if (f < t0) return null;
          const x = 200 + i * 230 + q * (i < 3 ? -60 : 60) * 2;
          const y = 430 + q * 520;
          const k = 0.35 + q * 0.75;
          return <RR key={i} x={x} y={y} s={k} horse={i === 3 ? "white" : i % 2 ? "dark" : "bay"} man={i === 3 ? "white" : i % 2 ? "mongol2" : "mongol"} f={f} o={i * 3} flip={i >= 4} />;
        })}
      </svg>
      <Badge n={3} at={0} />
    </AbsoluteFill>
  );
};

// ---------- 10-2) c3_25 유럽은 비싸게 배운다: 돌성·문양 깃발 앞, 거만하던 기사 → 금화가 날아감 ----------
const Castle = ({ x, y, w }: { x: number; y: number; w: number }) => {
  const k = w / 900;
  return (
    <svg width={w} height={460 * k} viewBox="0 0 900 460" style={{ position: "absolute", left: x, top: y - 460 * k, filter: "url(#kit-ink)", overflow: "visible" }}>
      <path d="M 120 200 L 780 200 L 780 460 L 120 460 Z" fill="#b9b2a4" stroke={INK} strokeWidth={7} />
      {range(12).map((i) => <path key={i} d={`M ${130 + i * 54} 200 L ${130 + i * 54} 176 L ${156 + i * 54} 176 L ${156 + i * 54} 200`} fill="#b9b2a4" stroke={INK} strokeWidth={6} />)}
      {range(30).map((i) => <path key={`s${i}`} d={`M ${140 + (i % 10) * 64 + (Math.floor(i / 10) % 2) * 32} ${240 + Math.floor(i / 10) * 60} l 46 0`} stroke="#8f887c" strokeWidth={4} />)}
      <path d="M 390 460 L 390 340 C 390 290 510 290 510 340 L 510 460 Z" fill="#4a3424" stroke={INK} strokeWidth={7} />
      {range(5).map((i) => <path key={`g${i}`} d={`M ${405 + i * 24} 330 L ${405 + i * 24} 460`} stroke="#2b1d14" strokeWidth={4} />)}
      {[40, 700].map((tx0, i) => (
        <g key={i}>
          <path d={`M ${tx0} 110 L ${tx0 + 160} 110 L ${tx0 + 160} 460 L ${tx0} 460 Z`} fill="#c4bcae" stroke={INK} strokeWidth={7} />
          {range(4).map((m) => <path key={m} d={`M ${tx0 + m * 44} 110 L ${tx0 + m * 44} 80 L ${tx0 + m * 44 + 28} 80 L ${tx0 + m * 44 + 28} 110`} fill="#c4bcae" stroke={INK} strokeWidth={6} />)}
          <path d={`M ${tx0 + 70} 200 L ${tx0 + 70} 160 C ${tx0 + 70} 146 ${tx0 + 90} 146 ${tx0 + 90} 160 L ${tx0 + 90} 200 Z`} fill="#2b1d14" />
          <path d={`M ${tx0 + 80} 80 L ${tx0 + 80} -10`} stroke={INK} strokeWidth={6} />
          <path d={`M ${tx0 + 84} -8 L ${tx0 + 170} 6 L ${tx0 + 84} 30 Z`} fill={i ? "#3d5a80" : "#e8e2d4"} stroke={INK} strokeWidth={5} />
          {i === 0 && <path d={`M ${tx0 + 110} -4 L ${tx0 + 110} 24 M ${tx0 + 96} 10 L ${tx0 + 130} 10`} stroke="#a8332a" strokeWidth={6} />}
        </g>
      ))}
    </svg>
  );
};
const EuroCastle = () => {
  const f = useCurrentFrame();
  const hit = S(1.9);
  const sad = S(3.0);
  return (
    <AbsoluteFill>
      <Steppe time="dusk" horizon={640} />
      <Castle x={980} y={660} w={860} />
      <EuroBanner x={260} y={900} h={420} />
      <Guy id="mstislav_bold" x={620} h={560} bottom={110} pose={f < hit ? "smug" : f < sad ? "shocked" : "sad"} beat={f < hit ? "none" : f < sad ? "jump" : "sink"} beatAt={f < sad ? hit + 2 : sad} enter="pop" />
      <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        {/* 금화 상자 */}
        <path d="M 860 980 L 1080 980 L 1080 880 L 860 880 Z" fill="#7a5230" stroke={INK} strokeWidth={6} />
        <path d="M 860 880 C 860 830 1080 830 1080 880" fill="#8a6440" stroke={INK} strokeWidth={6} transform={`rotate(${-30 * fadeIn(f, hit - 4, 6)} 860 880)`} />
        {range(18).map((i) => {
          const x0 = 900 + (i % 6) * 30, y0 = 878 - Math.floor(i / 6) * 10;
          const t = Math.max(0, f - hit - (17 - i) * 1.4);
          const x = x0 + t * (16 + (i % 3) * 5);
          const y = y0 - t * 18 + t * t * 0.4;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={26} ry={10} fill="#d9b04a" stroke={INK} strokeWidth={4} />
              <ellipse cx={x} cy={y - 3} rx={15} ry={4} fill="none" stroke="#a8842e" strokeWidth={2.5} />
            </g>
          );
        })}
      </svg>
      <SFX name="coins" at={hit} vol={0.4} dur={45} />
    </AbsoluteFill>
  );
};

// ---------- 11) 말 이야기 (c3_26~c3_31): 여벌 말 → 달리며 옮겨 타기 → 역참 → 초원이 먹이 → 짐 없는 군대 → 반나절 ----------
// 끈에 매인 여벌 말: 기병 손(판 272,112)에서 말 굴레(판 330,96)로
const handAt = (x: number, y: number, s: number) => ({ x: x + (272 - 200) * s, y: y + (112 - 278) * s });
const halterAt = (x: number, y: number, s: number) => ({ x: x + (336 - 200) * s, y: y + (100 - 278) * s });
// c3_26 따라가는 카메라: 기병 하나 + 여벌 말 셋 (가까이서 빠지며 셋이 드러남)
const HorseRun = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, S(2.6)], [1.6, 1], { ...clamp, easing: ease });
  const R = { x: 1180, y: 860, s: 1.25 };
  const spares = [
    { x: 820, y: 800, s: 1.05, horse: "dun", o: 3 },
    { x: 560, y: 760, s: 0.92, horse: "dark", o: 7 },
    { x: 330, y: 725, s: 0.8, horse: "grey", o: 11 },
  ];
  const h = handAt(R.x, R.y, R.s);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "62% 70%" }}>
        <Steppe time="day" horizon={560} />
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
          {range(3).map((i) => { const x = ((((i * 700 - f * 1.5) % 2400) + 2400) % 2400) - 300; return <path key={i} d={`M ${x} 560 C ${x + 150} 500 ${x + 350} 500 ${x + 500} 560 Z`} fill="#9fb07a" stroke={INK} strokeWidth={4} />; })}
        </svg>
        <Tufts f={f} speed={16} y0={600} n={34} />
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          {spares.slice().reverse().map((sp, i) => {
            const t = halterAt(sp.x, sp.y, sp.s);
            return (
              <g key={i}>
                <RR x={sp.x} y={sp.y} s={sp.s} horse={sp.horse} f={f} o={sp.o} saddle={false} />
                <path d={`M ${t.x} ${t.y} Q ${(t.x + h.x) / 2} ${Math.max(t.y, h.y) + 40} ${h.x} ${h.y}`} stroke="#5a3a24" strokeWidth={4} fill="none" />
              </g>
            );
          })}
          <RR x={R.x} y={R.y} s={R.s} horse="bay" man="mongol" f={f} />
        </svg>
        {/* 여벌 말 하나씩 짚어 줌 */}
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {spares.map((sp, i) => { const t0 = S(2.9) + i * 10; return f >= t0 && <ellipse key={i} cx={sp.x + 20 * sp.s} cy={sp.y - 120 * sp.s} rx={190 * sp.s} ry={130 * sp.s} fill="none" stroke={RED} strokeWidth={5} strokeDasharray="12 9" opacity={fadeIn(f, t0, 6)} />; })}
        </svg>
      </AbsoluteFill>
      <SFX name="gallop" at={0} vol={0.3} dur={220} />
    </AbsoluteFill>
  );
};
// c3_27 달리면서 옆 말로 옮겨 타기: 지친 말(고개 처짐·땀) 옆으로 새 말이 붙고, 사람이 건너뛰어 옮겨 앉음 → 지친 말은 뒤처짐
const HorseSwap = () => {
  const f = useCurrentFrame();
  const come = lerp(f, S(0.3), S(1.8), 0, 1);
  const j0 = S(2.0), j1 = S(2.7);
  const jump = lerp(f, j0, j1, 0, 1);
  const A = { x: 980 - lerp(f, j1 + 4, S(6.0), 0, 900), y: 760, s: 1.15 };
  const B = { x: 620 + come * 440, y: 900, s: 1.3 };
  const onB = f >= j1;
  // 사람 위치: A 안장 → B 안장 (포물선)
  const mx = A.x + (B.x - A.x) * jump, my = A.y + (B.y - A.y) * jump - Math.sin(jump * Math.PI) * 120;
  const ms = A.s + (B.s - A.s) * jump;
  const sweat = f < j1 + 20;
  const tiredSlow = f >= j1 + 4;
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={560} />
      <Tufts f={f} speed={14} y0={600} n={34} />
      <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
        <RR x={A.x} y={A.y} s={A.s} horse="bay" f={f} speed={tiredSlow ? 9 : 6} tired={1} saddle />
        {sweat && range(4).map((i) => { const t = ((f + i * 7) % 28) / 28; const x = A.x + 150 * A.s + i * 14, y = A.y - 150 * A.s + t * 50; return <path key={i} d={`M ${x} ${y} c -9 14 9 14 0 0`} fill="#7fa6c9" stroke={INK} strokeWidth={2} opacity={1 - t} />; })}
        <RR x={B.x} y={B.y} s={B.s} horse="dun" f={f} o={2} saddle />
        {/* 사람 (말과 따로) */}
        <g transform={`translate(${mx} ${my}) scale(${ms}) translate(-200 -278)`} filter="url(#kit-ink)">
          <RMan m={MEN.mongol} lean={jump > 0 && jump < 1 ? -12 : 0} />
        </g>
        {f >= j0 && f < j1 + 6 && <Arrow x1={A.x + 20} y1={A.y - 300 * A.s} x2={B.x + 10} y2={B.y - 280 * B.s} cx={(A.x + B.x) / 2} cy={A.y - 420} p={lerp(f, j0, j1, 0, 1)} w={6} color={INK} op={0.7} />}
      </svg>
      <SFX name="gallop" at={0} vol={0.3} dur={260} />
      <SFX name="swish" at={j0} vol={0.4} dur={25} />
      {onB && f < 0 && null}
    </AbsoluteFill>
  );
};
// 울타리 (역참)
const Fence = ({ x0, x1, y }: { x0: number; x1: number; y: number }) => (
  <g filter="url(#kit-ink)">
    {range(Math.floor((x1 - x0) / 70) + 1).map((i) => <path key={i} d={`M ${x0 + i * 70} ${y} L ${x0 + i * 70} ${y - 90}`} stroke={INK} strokeWidth={14} />)}
    {range(Math.floor((x1 - x0) / 70) + 1).map((i) => <path key={`c${i}`} d={`M ${x0 + i * 70} ${y} L ${x0 + i * 70} ${y - 90}`} stroke="#8a6440" strokeWidth={8} />)}
    {[y - 70, y - 35].map((yy) => <path key={yy} d={`M ${x0} ${yy} L ${x1} ${yy}`} stroke={INK} strokeWidth={12} />)}
    {[y - 70, y - 35].map((yy) => <path key={`r${yy}`} d={`M ${x0} ${yy} L ${x1} ${yy}`} stroke="#a07a4c" strokeWidth={6} />)}
  </g>
);
// c3_28 역참: 길목마다 역참(지도) → 울타리 안 싱싱한 말들, 지친 말을 맡기고 새 말로 바로 출발 (길은 왼쪽 아래 → 오른쪽 위로 비스듬히)
const Relay = () => {
  const f = useCurrentFrame();
  const map = S(2.4);
  if (f < map) {
    // 길목마다 역참: 길 위의 게르 점들, 기병 점이 들를 때마다 말 색이 바뀜
    const q = interpolate(f, [10, map - 6], [0, 1], clamp);
    const pt = (t: number) => ({ x: 200 + t * 1520, y: 820 - t * 520 + Math.sin(t * 6) * 60 });
    const ix = Math.floor(q * 4);
    const P = pt(q);
    return (
      <AbsoluteFill>
        <Field />
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
          <polyline points={range(41).map((i) => { const p = pt(i / 40); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke="#6b5636" strokeWidth={10} strokeDasharray="20 14" />
          {range(4).map((i) => { const p = pt((i + 0.5) / 4); return <g key={i}><circle cx={p.x} cy={p.y} r={44} fill={PAPER} stroke={INK} strokeWidth={5} /><path d={`M ${p.x - 26} ${p.y + 12} L ${p.x - 26} ${p.y - 2} C ${p.x - 18} ${p.y - 22} ${p.x + 18} ${p.y - 22} ${p.x + 26} ${p.y - 2} L ${p.x + 26} ${p.y + 12} Z`} fill="#ece3cf" stroke={INK} strokeWidth={4} />{range(3).map((k) => <circle key={k} cx={p.x - 30 + k * 30} cy={p.y + 56} r={9} fill={["#b89a6a", "#5e4030", "#9a968e"][k]} stroke={INK} strokeWidth={3} />)}</g>; })}
          <Dot x={P.x} y={P.y - 30} s={2.2} c={RED} />
          <circle cx={P.x} cy={P.y - 30} r={16} fill="none" stroke={["#8a5a36", "#b89a6a", "#5e4030", "#9a968e"][ix % 4]} strokeWidth={6} />
        </svg>
      </AbsoluteFill>
    );
  }
  const t = f - map;
  const arrive = [S(2.0), S(3.4)];
  const swap = [S(3.8), S(4.4)];
  const leave = [S(4.8), S(7.3)];
  const pa = lerp(t, arrive[0], arrive[1], 0, 1);
  const tired = { x: -250 + pa * 1000, y: 1060 - pa * 220, s: 1.45 - pa * 0.35 };
  const pl = interpolate(t, leave, [0, 1], { ...clamp, easing: (x) => x * x });
  const fresh = { x: 1060 + pl * 760, y: 760 - pl * 260, s: 1.0 - pl * 0.55 };
  const jump = lerp(t, swap[0], swap[1], 0, 1);
  const manOn = t < swap[0] ? tired : t >= swap[1] ? fresh : null;
  const mx = tired.x + (fresh.x - tired.x) * jump, my = tired.y + (fresh.y - tired.y) * jump - Math.sin(jump * Math.PI) * 90;
  const ms = tired.s + (fresh.s - tired.s) * jump;
  // 지친 말은 지기가 끌고 울타리로
  const led = lerp(t, leave[0], leave[1], 0, 1);
  const tiredAfter = { x: tired.x - led * 140, y: tired.y - led * 40, s: tired.s - led * 0.12 };
  const T2 = t >= swap[1] ? tiredAfter : tired;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(t, 0, 8) }}>
      <Steppe time="day" horizon={470} />
      <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        <path d="M -100 1080 C 500 900 900 800 1300 640 C 1500 560 1700 500 1920 470 L 1920 520 C 1700 540 1500 600 1320 690 C 920 870 560 990 140 1080 Z" fill="#b8a874" stroke={INK} strokeWidth={4} />
      </svg>
      <Ger x={1440} y={520} w={240} />
      <Ger x={1650} y={500} w={160} />
      <Tug x={1240} y={560} h={300} sway={Math.sin(f / 10) * 4} />
      <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
        <Fence x0={140} x1={840} y={600} />
        {[
          { x: 260, y: 640, h: "dun", g: 1, fl: false },
          { x: 470, y: 620, h: "dark", g: 0, fl: true },
          { x: 690, y: 650, h: "grey", g: 0.8, fl: false },
          { x: 360, y: 700, h: "black", g: 0, fl: false },
          { x: 600, y: 715, h: "white", g: 1, fl: true },
        ].map((hh, i) => <RR key={i} x={hh.x} y={hh.y} s={0.62} horse={hh.h} f={f} still graze={hh.g * (0.6 + 0.4 * Math.abs(Math.sin(f / 30 + i)))} flip={hh.fl} />)}
        <Fence x0={140} x1={840} y={760} />
        {/* 미리 안장 얹어 둔 새 말 (지기가 잡고 있음) */}
        {t < swap[1] && <RR x={fresh.x} y={fresh.y} s={fresh.s} horse="dun" f={f} still saddle />}
        {t >= swap[1] && <RR x={fresh.x} y={fresh.y} s={fresh.s} horse="dun" f={f} o={2} saddle />}
        {/* 지친 말 */}
        <RR x={T2.x} y={T2.y} s={T2.s} horse="bay" f={f} still={t >= arrive[1]} speed={t < arrive[1] ? 6 : 4} tired={1} saddle />
        {/* 사람 */}
        {manOn ? (
          <g transform={`translate(${manOn.x} ${manOn.y + (manOn === tired && t < arrive[1] ? Math.sin(f / 4) * 4 : 0)}) scale(${manOn.s}) translate(-200 -278)`} filter="url(#kit-ink)"><RMan m={MEN.mongol} /></g>
        ) : (
          <g transform={`translate(${mx} ${my}) scale(${ms}) translate(-200 -278)`} filter="url(#kit-ink)"><RMan m={MEN.mongol} lean={-10} /></g>
        )}
      </svg>
      {/* 역참지기: 새 말을 잡고 있다가 → 지친 말 고삐를 받음 */}
      <Guy x={t < swap[1] ? 1180 : tiredAfter.x + 120} bottom={t < swap[1] ? 1080 - 770 : 1080 - tiredAfter.y - 10} h={t < swap[1] ? 230 : 240 * tiredAfter.s} pose={t < arrive[1] ? "front" : "happy"} gesture={t >= arrive[1] && t < swap[1] ? "open" : undefined} gestureAt={arrive[1]} />
      <SFX name="neigh" at={map + arrive[1]} vol={0.3} dur={40} />
      <SFX name="gallop" at={map + leave[0]} vol={0.3} dur={80} />
    </AbsoluteFill>
  );
};
// c3_29 끝없는 초원이 말의 먹이: 풀 뜯는 말 떼 + 지키는 기병, 카메라가 천천히 빠지며 지평선까지 이어진 풀밭
const Graze = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, S(7.0)], [1.25, 0.92], { ...clamp, easing: ease });
  const herd = range(14).map((i) => ({ x: 120 + ((i * 433) % 1700), y: 640 + ((i * 151) % 360), h: ["bay", "dun", "dark", "grey", "white", "black"][i % 6], fl: i % 3 === 0 }));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "linear-gradient(#e6d7b2, #efe4c8 50%, #9ea562 52%)" }}>
      <AbsoluteFill style={{ transform: `scale(${z}) translateX(${interpolate(f, [0, S(7.0)], [40, -40], clamp)}px)`, transformOrigin: "50% 60%" }}>
        <div style={{ position: "absolute", top: -200, bottom: -200, left: -400, right: -400, background: "linear-gradient(#e6d7b2, #efe4c8 60%)" }} />
        <svg width={2520} height={1280} style={{ position: "absolute", left: -300, top: -100, filter: "url(#kit-ink)" }}>
          <path d="M 0 600 C 400 560 800 580 1300 560 C 1800 540 2200 570 2520 560 L 2520 1280 L 0 1280 Z" fill="#b8b47a" stroke={INK} strokeWidth={4} />
          <path d="M 0 640 C 500 610 900 640 1400 620 C 1900 600 2300 630 2520 620 L 2520 1280 L 0 1280 Z" fill="#a9ad6c" stroke={INK} strokeWidth={4} />
          <path d="M 0 700 C 600 680 1100 720 1600 690 C 2000 670 2300 700 2520 690 L 2520 1280 L 0 1280 Z" fill="#9ea562" stroke={INK} strokeWidth={4} />
          {range(160).map((i) => { const x = (i * 157) % 2520; const y = 720 + ((i * 89) % 540); return <path key={i} d={`M ${x} ${y} l -6 -16 M ${x} ${y} l 2 -20 M ${x} ${y} l 10 -14`} stroke="#6e7a3a" strokeWidth={3} strokeLinecap="round" />; })}
        </svg>
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          {herd.sort((a, b) => a.y - b.y).map((hh, i) => <RR key={i} x={hh.x} y={hh.y} s={0.35 + (hh.y - 600) / 900} horse={hh.h} f={f} still graze={0.7 + 0.3 * Math.abs(Math.sin(f / 25 + i))} flip={hh.fl} />)}
          <RR x={1560} y={600} s={0.5} horse="white" man="mongol" f={f} still />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// 수레 (소가 끄는, 건초·곡식 자루를 실음) - 오른쪽으로
export const Wagon = ({ x, y, s = 1, f }: { x: number; y: number; s?: number; f: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#kit-ink)">
    <path d="M -160 -40 L 60 -40 L 60 -110 L -160 -110 Z" fill="#7a5230" stroke={INK} strokeWidth={6} />
    <path d="M -170 -110 C -150 -200 50 -210 70 -110 Z" fill="#d9c06a" stroke={INK} strokeWidth={6} />
    {range(6).map((i) => <path key={i} d={`M ${-140 + i * 34} -120 l 10 -40`} stroke="#a8903a" strokeWidth={4} />)}
    {[-120, -60].map((sx) => <path key={sx} d={`M ${sx} -110 C ${sx - 20} -150 ${sx + 40} -160 ${sx + 30} -110 Z`} fill="#c9b48a" stroke={INK} strokeWidth={5} />)}
    {[-120, 20].map((wx) => (
      <g key={wx} transform={`rotate(${f * 1.2} ${wx} -20)`}>
        <circle cx={wx} cy={-20} r={34} fill="none" stroke={INK} strokeWidth={8} />
        {range(4).map((k) => <path key={k} d={`M ${wx} -20 l ${Math.cos(k * 0.785) * 32} ${Math.sin(k * 0.785) * 32} M ${wx} -20 l ${-Math.cos(k * 0.785) * 32} ${-Math.sin(k * 0.785) * 32}`} stroke={INK} strokeWidth={4} />)}
      </g>
    ))}
    <path d="M 60 -70 L 140 -60" stroke={INK} strokeWidth={6} />
    {/* 소 */}
    <ellipse cx={210} cy={-70} rx={70} ry={36} fill="#5e4030" stroke={INK} strokeWidth={6} />
    <path d={`M 160 -40 L ${156 + Math.sin(f / 9) * 6} 0 M 250 -40 L ${254 - Math.sin(f / 9) * 6} 0`} stroke={INK} strokeWidth={12} />
    <path d="M 270 -90 L 310 -80 L 312 -50 L 278 -50 Z" fill="#5e4030" stroke={INK} strokeWidth={6} />
    <path d="M 290 -88 C 300 -110 316 -110 320 -100 M 284 -88 C 280 -112 266 -112 262 -102" stroke="#e8e0cc" strokeWidth={6} fill="none" />
  </g>
);
// c3_30 짐 수레를 끌고 느릿느릿 가는 적군(왼쪽) vs 짐 없이 달리는 몽골군(오른쪽) - 말하는 쪽을 밝게
const Supply = () => {
  const f = useCurrentFrame();
  const swap = S(5.4);
  const lightL = 1 - 0.55 * fadeIn(f, swap, 14);
  const lightR = 0.45 + 0.55 * fadeIn(f, swap, 14);
  return (
    <AbsoluteFill>
      {/* 왼쪽: 적 수레 행렬 (비스듬히 안쪽으로, 아주 느리게) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 950, height: 1080, overflow: "hidden" }}>
        <Steppe time="day" horizon={520} />
        <svg width={950} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          {range(3).map((i) => { return <Wagon key={i} x={150 + i * 260 + f * 0.5} y={980 - i * 160} s={0.85 - i * 0.18} f={f * 0.4} />; })}
          <RR x={720 + f * 0.4} y={1000} s={0.75} horse="grey" man="knight" cape="#3d5a80" f={f} speed={9} />
        </svg>
        <Guy id="mstislav_kiev" x={420 + f * 0.4} h={260} bottom={20} pose="sad" />
        <AbsoluteFill style={{ background: `rgba(20,14,8,${1 - lightL})`, transition: "none" }} />
      </div>
      {/* 오른쪽: 짐 없는 몽골 기병 (따라가는 카메라) */}
      <div style={{ position: "absolute", left: 970, top: 0, width: 950, height: 1080, overflow: "hidden" }}>
        <Steppe time="day" horizon={520} />
        <Tufts f={f} speed={18} y0={560} n={24} />
        <svg width={950} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          <RR x={250} y={820} s={0.7} horse="dun" f={f} o={5} saddle={false} />
          <RR x={420} y={920} s={0.85} horse="dark" man="mongol2" f={f} o={2} />
          <RR x={660} y={990} s={1} horse="bay" man="mongol" f={f} />
        </svg>
        <AbsoluteFill style={{ background: `rgba(20,14,8,${1 - lightR})` }} />
      </div>
      <div style={{ position: "absolute", left: 950, top: 0, width: 20, height: 1080, background: INK }} />
      <SFX name="gallop" at={swap} vol={0.3} dur={150} />
    </AbsoluteFill>
  );
};

const Gauge = ({ sun, x, y }: { sun: number; x: number; y: number }) => (
  <svg width={240} height={140} style={{ position: "absolute", left: x, top: y, filter: "url(#kit-ink)" }}>
    <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none" stroke={INK} strokeWidth={5} strokeDasharray="8 8" />
    <path d="M 120 6 L 120 30" stroke={INK} strokeWidth={5} />
    <circle cx={120 - Math.cos(sun * Math.PI) * 100} cy={120 - Math.sin(sun * Math.PI) * 100} r={20} fill="#f0b048" stroke={INK} strokeWidth={4} />
  </svg>
);
const Shot11Race = ({ f0, frames }: { f0: number; frames: number }) => {
  const f = useCurrentFrame() - f0;
  const D = frames - f0;
  const day = D * 1.1; // 적이 도착하는 때 (화면 끝 너머)
  const sun = Math.min(1, f / day);
  // 두 길: 왼쪽 아래 출발 → 오른쪽 위 목적지 게르 (굽은 길)
  const route = (q: number, dy: number) => {
    const x0 = 260, y0 = 900 + dy, cx = 900, cy = 300 + dy, x1 = 1560, y1 = 520 + dy;
    return [(1 - q) ** 2 * x0 + 2 * (1 - q) * q * cx + q * q * x1, (1 - q) ** 2 * y0 + 2 * (1 - q) * q * cy + q * q * y1];
  };
  const qE = Math.min(1, f / day);
  const qM = Math.min(1, f / (day / 2));
  const arrived = qM >= 1;
  const line = (dy: number) => range(31).map((i) => route(i / 30, dy).join(",")).join(" ");
  const [ex, ey] = route(qE, -170);
  const [mx, my] = route(qM, 170);
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 0, 6) }}>
      <Field />
      <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        <polyline points={line(-170)} fill="none" stroke="#6b5636" strokeWidth={8} strokeDasharray="18 14" />
        <polyline points={line(170)} fill="none" stroke="#6b5636" strokeWidth={8} strokeDasharray="18 14" />
        {/* 지나온 길 */}
        <polyline points={range(31).map((i) => route((i / 30) * qE, -170).join(",")).join(" ")} fill="none" stroke="#5d6f86" strokeWidth={12} strokeLinecap="round" />
        <polyline points={range(31).map((i) => route((i / 30) * qM, 170).join(",")).join(" ")} fill="none" stroke={RED} strokeWidth={12} strokeLinecap="round" />
        {/* 몽골: 갈아탈 말 점들이 따라옴 */}
        {range(3).map((i) => { const [hx, hy] = route(Math.max(0, qM - 0.04 * (i + 1)), 170); return <Dot key={i} x={hx} y={hy} s={1.4} c="#8a5a34" />; })}
        <Foe x={ex} y={ey} s={2.2} />
        <Dot x={mx} y={my} s={2.4} c={RED} />
      </svg>
      <Ger x={1640} y={420} w={180} />
      <Ger x={1640} y={760} w={180} lit={arrived ? 0.8 : 0} />
      <Gauge sun={sun} x={40} y={40} />
      {arrived && <Guy id="genghis" x={1480} bottom={250} h={240} pose="smug" enter="pop" delay={Math.ceil(day / 2) + 2} />}
      {arrived && <Guy id="mstislav_kiev" x={1800} bottom={250} h={210} pose="shocked" enter="pop" delay={Math.ceil(day / 2) + 8} />}
    </AbsoluteFill>
  );
};

const Race = ({ frames }: ShotProps) => <Shot11Race f0={0} frames={frames} />;
const Desert = (p: ShotProps) => <Shot6Desert {...p} />;

const groups: Group[] = [
  { ids: ["c3_01"], Shot: Shot1 },
  { ids: ["c3_02"], Shot: Shot2 },
  { ids: ["c3_03"], Shot: Shot3 },
  { ids: ["c3_04", "c3_05", "c3_06", "c3_07", "c3_08", "c3_09"], Shot: TreeShot },
  { ids: ["c3_10"], Shot: Shot6 },
  { ids: ["c3_11"], Shot: Brawl },
  { ids: ["c3_12"], Shot: Rescue },
  { ids: ["c3_13"], Shot: Shoulder },
  { ids: ["c3_14"], Shot: Desert },
  { ids: ["c3_15", "c3_16"], Shot: Shot7 },
  { ids: ["c3_17"], Shot: Shot8 },
  { ids: ["c3_18"], Shot: Shot9 },
  { ids: ["c3_19"], Shot: NergeLearn },
  { ids: ["c3_20", "c3_21", "c3_22", "c3_23", "c3_24"], Shot: Feint },
  { ids: ["c3_25"], Shot: EuroCastle },
  { ids: ["c3_26"], Shot: HorseRun },
  { ids: ["c3_27"], Shot: HorseSwap },
  { ids: ["c3_28"], Shot: Relay },
  { ids: ["c3_29"], Shot: Graze },
  { ids: ["c3_30"], Shot: Supply },
  { ids: ["c3_31"], Shot: Race },
];
// 브금 mountain = Kevin MacLeod "Mountain Emperor" (CC BY 4.0, 설명에 출처) - 2026-10-27 사용자: "지금 브금 너무 별로다" → 후보 3개 중 2번
export const M01Ch3 = () => <Chapter ch="3" year="1206" groups={groups} music="mountain" />;
