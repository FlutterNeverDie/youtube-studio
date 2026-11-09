// 연출 기법 예시 (2026-11-02, docs/guide/10-연출-기법.md) - 점과 선만으로 각 5초: ① 되감기 ② 물 눈금 ③ 물줄기 갈라지기
// 사용자가 기법 이름만으론 이해가 안 된다고 해서 만든 맛보기. 실제 영상 그림이 아님
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";

const C = { sand: "#ead6a6", ink: "#2b1d14", mo: "#3f5f86", water: "#5f93b8", dead: "#9a8f80" };
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const L = (f: number, a: number, b: number, x: number, y: number) => interpolate(f, [a, b], [x, y], cl);
const Label = ({ t }: { t: string }) => (
  <div style={{ position: "absolute", left: 40, top: 30, fontSize: 54, fontWeight: 700, color: C.ink, fontFamily: "sans-serif" }}>{t}</div>
);
const Well = ({ x, y, lv, gauge = false }: { x: number; y: number; lv: number; gauge?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r={34} fill="#7a6a50" stroke={C.ink} strokeWidth={5} />
    <circle cx={x} cy={y} r={24 * Math.max(0.05, lv)} fill={C.water} />
    {gauge && (
      <g>
        <rect x={x + 50} y={y - 70} width={26} height={110} fill="#fff" stroke={C.ink} strokeWidth={4} />
        <rect x={x + 53} y={y - 67 + 104 * (1 - lv)} width={20} height={104 * lv} fill={lv < 0.25 ? "#c0392b" : C.water} />
      </g>
    )}
  </g>
);
const dots = (n: number) => Array.from({ length: n }).map((_, i) => [((i * 37) % 11) - 5, ((i * 53) % 9) - 4]);
const D = dots(60);

// ① 되감기: 한 덩어리로 우물 하나에 몰림 → 물이 마르고 쓰러짐 → 되감기 → 세 갈래로 나뉘어 우물 셋
const Rewind = () => {
  const f = useCurrentFrame();
  const REW_A = 62, REW_B = 82;
  const t = f < REW_A ? f : f < REW_B ? L(f, REW_A, REW_B, REW_A, 0) : -1; // 되감기 땐 시간이 거꾸로
  const WELLS = [[700, 300], [960, 540], [700, 780]];
  let body: React.ReactNode;
  if (t >= 0) {
    const go = L(t, 0, 40, 0, 1);
    const lv = L(t, 25, 50, 1, 0);
    const dead = t > 48;
    body = (
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {WELLS.map(([x, y], i) => <Well key={i} x={x} y={y} lv={i === 1 ? lv : 1} />)}
        {D.map(([dx, dy], i) => <circle key={i} cx={200 + 700 * go + dx * 14} cy={540 + dy * 14} r={7} fill={dead && i % 2 ? C.dead : C.mo} />)}
      </svg>
    );
  } else {
    const g = L(f, REW_B, 140, 0, 1);
    body = (
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {WELLS.map(([x, y], i) => <Well key={i} x={x} y={y} lv={1 - 0.25 * L(f, REW_B + 30, 140, 0, 1)} />)}
        {D.map(([dx, dy], i) => {
          const w = WELLS[i % 3];
          return <circle key={i} cx={200 + (w[0] - 40 - 200) * g + dx * 8} cy={540 + (w[1] - 540) * g + dy * 8} r={7} fill={C.mo} />;
        })}
      </svg>
    );
  }
  const rew = f >= REW_A && f < REW_B;
  return (
    <AbsoluteFill style={{ background: C.sand }}>
      {body}
      {rew && (
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0 6px, transparent 6px 22px)", transform: `translateY(${(f * 37) % 22}px)` }}>
          <div style={{ position: "absolute", right: 60, top: 40, fontSize: 80, color: "#fff", textShadow: "0 0 12px #000", fontFamily: "sans-serif" }}>◀◀</div>
        </AbsoluteFill>
      )}
      <Label t="① 되감기" />
    </AbsoluteFill>
  );
};

// ② 물 눈금: 한 덩어리가 지나간 우물은 눈금이 바닥(빨강) / 세 갈래로 나뉘면 우물마다 조금씩만 줄고 밤에 다시 참
const Gauge = () => {
  const f = useCurrentFrame();
  const night = L(f, 100, 115, 0, 1) * L(f, 135, 150, 1, 0);
  const W1 = [[500, 300], [500, 540], [500, 780]];
  const W2 = [[1300, 300], [1300, 540], [1300, 780]];
  const a = L(f, 0, 45, 0, 1);
  const b = L(f, 50, 95, 0, 1);
  return (
    <AbsoluteFill style={{ background: C.sand }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <path d="M 960 120 L 960 1000" stroke={C.ink} strokeWidth={3} strokeDasharray="12 10" opacity={0.4} />
        {W1.map(([x, y], i) => <Well key={i} x={x} y={y} lv={i === 1 ? L(f, 20, 45, 1, 0) : 1} gauge />)}
        {D.map(([dx, dy], i) => <circle key={i} cx={120 + 330 * a + dx * 12} cy={540 + dy * 12} r={7} fill={C.mo} />)}
        {W2.map(([x, y], i) => <Well key={`b${i}`} x={x} y={y} lv={Math.min(1, L(f, 70, 95, 1, 0.65) + L(f, 115, 135, 0, 0.35))} gauge />)}
        {D.map(([dx, dy], i) => {
          const w = W2[i % 3];
          return <circle key={`d${i}`} cx={1000 + (w[0] - 40 - 1000) * b + dx * 7} cy={540 + (w[1] - 540) * b + dy * 7} r={7} fill={C.mo} opacity={f >= 50 ? 1 : 0} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "#0d1428", opacity: night * 0.55 }} />
      <Label t="② 물 눈금" />
    </AbsoluteFill>
  );
};

// ③ 물줄기 갈라지기: 우물(점)과 길(선) 그물 위로 빛나는 물줄기처럼 흘러 갈라졌다 다시 모임
const NODES = [[160, 540], [520, 300], [520, 540], [520, 780], [900, 220], [900, 460], [900, 640], [900, 860], [1280, 340], [1280, 540], [1280, 760], [1700, 540]];
const EDGES = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 7], [4, 8], [5, 8], [5, 9], [6, 9], [6, 10], [7, 10], [8, 11], [9, 11], [10, 11]];
const depth = (n: number) => (n === 0 ? 0 : n <= 3 ? 1 : n <= 7 ? 2 : n <= 10 ? 3 : 4);
const Flow = () => {
  const f = useCurrentFrame();
  const front = f / 30; // 깊이 1단계에 1초
  return (
    <AbsoluteFill style={{ background: "#1c2433" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {EDGES.map(([a, b], i) => {
          const pa = NODES[a], pb = NODES[b];
          const p = Math.max(0, Math.min(1, front - depth(a)));
          return (
            <g key={i}>
              <path d={`M ${pa[0]} ${pa[1]} L ${pb[0]} ${pb[1]}`} stroke="#3a4558" strokeWidth={6} />
              <path d={`M ${pa[0]} ${pa[1]} L ${pa[0] + (pb[0] - pa[0]) * p} ${pa[1] + (pb[1] - pa[1]) * p}`} stroke="#7fc8ff" strokeWidth={10} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px #7fc8ff)" }} />
            </g>
          );
        })}
        {NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={20} fill={front >= depth(i) ? C.water : "#2a3344"} stroke="#9fb3c8" strokeWidth={4} />)}
      </svg>
      <div style={{ position: "absolute", left: 40, top: 30, fontSize: 54, fontWeight: 700, color: "#e8eef5", fontFamily: "sans-serif" }}>③ 물줄기 갈라지기</div>
    </AbsoluteFill>
  );
};

export const TECH_DEMO_FRAMES = 450;
export const TechDemo = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={150}><Rewind /></Sequence>
    <Sequence from={150} durationInFrames={150}><Gauge /></Sequence>
    <Sequence from={300} durationInFrames={150}><Flow /></Sequence>
  </AbsoluteFill>
);
