// 몽골 1편 검수용 초안 - 2장 "초원 통일" (대본 3판, c2_01~c2_30) 화면
// 기준: 합격한 도입부(src/hook/Mongol01Hook.tsx)의 밝은 종이 그림체 + 1장(M01Ch1.tsx)의 전용 그림 기법
// 2장 피드백(02-제작-결정.md "2장 피드백"): 같은 연출 돌려쓰지 않기(장면마다 방향·카메라·효과 다르게), 군대 맨 앞엔 그 인물(Rider temujin·jamukha·toghrul·merkit·yesugei),
//   대립은 마주 보게, 화면 숫자는 연도만, 가마솥은 포로 실루엣까지(피 없이), 극적인 끝은 기다림, 1202~1204는 지도에서 땅을 먹는 식, 깜빡임 없게
// 없는 인물: 메르키트인·호위병·포로·자무카 부하·부족민 = archer를 어둡게 한 실루엣, 귀족 = 타이치우드 족장(taichiud_chief) + 금빛 실루엣, 목동·노예 = 작은 실루엣 + 양
// 무릎 꿇은 테무친(외투를 바침)·제베·자무카는 전용 그림(옆모습 몸 + 캐릭터 머리 겹)
// 깜빡임 방지: 하얀 번쩍임(흰 화면 깜빡) 안 씀, 충격은 카메라 흔들림·먼지로. 말 그림(run0~3)은 장면 중간에 still로 바꾸지 않음
// 말 타이밍(초)은 목소리 파일의 쉼 자리에서 잼
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import rigs from "../episode/char-rig.json";
import { BigNum, Chapter, Char, clamp, Dim, ease, Fire, FPS, Ger, Glow, Group, INK, Paper, Rider, SFX, ShotProps, Steppe, talkingAt, Tug } from "./kit";

const sec = (s: number) => Math.round(s * FPS);
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
// 구간 [a,b]가 줄 길이 변화로 뒤집히거나 0이 되어도 깨지지 않게 (그때는 b에서 바로 to)
const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
// 카메라 흔들림
const shake = (f: number, from: number, amp: number, dur = 40) => {
  const t = f - from;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const d = 1 - t / dur;
  // 느린 흔들림 (프레임마다 좌우가 뒤집히면 깜빡임처럼 보임)
  return { x: Math.sin(t * 1.1) * amp * d, y: Math.cos(t * 1.4) * amp * 0.6 * d };
};
// 카메라: 배율·초점(화면 좌표)·흔들림을 한 번에. 초점 (cx,cy)가 화면 가운데 오도록 밀어 넣음 (가장자리 검은 틈 안 생기게 잘라 맞춤)
const Cam = ({ z = 1, cx = 960, cy = 540, sx = 0, sy = 0, children }: { z?: number; cx?: number; cy?: number; sx?: number; sy?: number; children: React.ReactNode }) => {
  const tx = Math.max(Math.min(960 - cx * z, 0), 1920 - 1920 * z) + sx;
  const ty = Math.max(Math.min(540 - cy * z, 0), 1080 - 1080 * z) + sy;
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "0 0" }}>{children}</AbsoluteFill>;
};

// ---------- 전용 그림: 캐릭터 머리 겹 + 코드로 그린 몸 ----------
const RIG = rigs as Record<string, { neck: number[] }>;
const Head = ({ id, pose = "front", x, y, s, rot = 0, flip = false, eyes, mouth = "0", face }: { id: string; pose?: string; x: number; y: number; s: number; rot?: number; flip?: boolean; eyes?: 0 | 1; mouth?: string; face?: "stern" }) => {
  const f = useCurrentFrame();
  const n = RIG[id]?.neck ?? [300, 420];
  const blink = eyes ?? ((f + id.length * 17) % 104 < 4 ? 1 : 0);
  const L = (name: string) => <Img src={staticFile(`chars/${id}/${pose}/${name}.svg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
  return (
    <div style={{ position: "absolute", left: x - n[0] * s, top: y - n[1] * s, width: 600 * s, height: 720 * s, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, transformOrigin: `${n[0] * s}px ${n[1] * s}px` }}>
      {L("head")}
      {face === "stern" ? <SternFace neckY={n[1]} blink={blink} mouth={mouth} /> : (
        <>
          {L(`eyes${blink}`)}
          {L(`mouth${mouth}`)}
        </>
      )}
    </div>
  );
};
// 근엄한 얼굴 (죽음을 각오한 무사): 굵고 곧게 내려앉은 눈썹, 정면을 똑바로 보는 눈, 굳게 다문 입 - 판 좌표(600×720, 정면 얼굴 기준)
const SternFace = ({ neckY, blink, mouth }: { neckY: number; blink: number; mouth: string }) => {
  const dy = neckY - 419; // 제베 기준 목 높이와의 차이
  const open = mouth === "2" ? 8 : mouth === "1" ? 5 : 0;
  return (
    <svg width="100%" height="100%" viewBox="0 0 600 720" style={{ position: "absolute", inset: 0, ...ink }}>
      <g transform={`translate(0 ${dy})`}>
        <path d="M 236 316 L 286 330" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        <path d="M 314 330 L 364 316" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        {blink ? (
          <path d="M 250 342 L 278 342 M 322 342 L 350 342" stroke={INK} strokeWidth={6} />
        ) : (
          <>
            <ellipse cx={264} cy={343} rx={8} ry={8} fill={INK} />
            <ellipse cx={336} cy={343} rx={8} ry={8} fill={INK} />
            <circle cx={266} cy={340} r={2.4} fill="#fff" />
            <circle cx={338} cy={340} r={2.4} fill="#fff" />
            <path d="M 250 334 L 280 336 M 320 336 L 350 334" stroke={INK} strokeWidth={5} />
          </>
        )}
        {open ? <ellipse cx={300} cy={393} rx={10} ry={open} fill="#3a1f18" stroke={INK} strokeWidth={4} /> : <path d="M 283 393 L 317 393" stroke={INK} strokeWidth={6} strokeLinecap="round" />}
      </g>
    </svg>
  );
};
// 말하는 입 (전용 그림용): 말하는 동안 0·1·2를 음절처럼
const mouthAt = (f: number, at: number, id: string) => (talkingAt(f, at, id) ? ["1", "2", "1", "0", "2", "1"][Math.floor((f - at) / 4) % 6] : "0");
const SKIN = "#ecbf93";
type Robe = { robe: string; dark: string; trim: string; boot: string };
const TEM: Robe = { robe: "#4d6b8a", dark: "#3d556e", trim: "#c9a24e", boot: "#3a2b22" };
const JAM: Robe = { robe: "#4f6e55", dark: "#3c5643", trim: "#b5863a", boot: "#3a2b22" };
const JEB: Robe = { robe: "#5e6f80", dark: "#4a5866", trim: "#a8332a", boot: "#3a2b22" };
const Arm = ({ d, color, w = 44 }: { d: string; color: string; w?: number }) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + 12} fill="none" strokeLinecap="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
  </>
);
// 검은 담비 가죽 외투 (보르테의 혼수, 귀한 물건): 윤기 나는 검은 털(결·광택·빛 반사), 털 깃·소매 끝, 붉은 비단 안감, 금실 띠.
// (x,y) 가운데 위, s 배율, shine 0~1 = 빛줄기를 받아 털끝이 반짝임
const Coat = ({ x, y, s = 1, rot = 0, shine = 0 }: { x: number; y: number; s?: number; rot?: number; shine?: number }) => {
  const f = useCurrentFrame();
  const id = React.useId().replace(/:/g, "");
  const sweep = ((f % 120) / 120) * 360 - 60; // 털 위를 천천히 지나가는 광택
  return (
    <svg width={300 * s} height={320 * s} viewBox="-150 -10 300 320" style={{ position: "absolute", left: x - 150 * s, top: y - 10 * s, transform: `rotate(${rot}deg)`, transformOrigin: "50% 10%", ...ink }}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b2a22" />
          <stop offset="0.45" stopColor="#1c1411" />
          <stop offset="1" stopColor="#2a1d17" />
        </linearGradient>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={sweep - 40} y1="0" x2={sweep + 40} y2="300">
          <stop offset="0" stopColor="#fff2d8" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff2d8" stopOpacity={0.28 + shine * 0.2} />
          <stop offset="1" stopColor="#fff2d8" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}c`}><path d="M -44 8 C -76 12 -116 42 -124 84 L -100 100 L -92 76 L -100 296 L 100 296 L 92 76 L 100 100 L 124 84 C 116 42 76 12 44 8 Z" /></clipPath>
      </defs>
      {/* 몸판 + 소매 */}
      <path d="M -44 8 C -76 12 -116 42 -124 84 L -100 100 L -92 76 L -100 296 L 100 296 L 92 76 L 100 100 L 124 84 C 116 42 76 12 44 8 Z" fill={`url(#${id}f)`} stroke={INK} strokeWidth={6} />
      {/* 앞이 살짝 벌어져 보이는 붉은 비단 안감 + 금실 띠 */}
      <path d="M -10 40 L 10 40 L 26 296 L -26 296 Z" fill="#9a2f2a" stroke={INK} strokeWidth={4} />
      {[80, 130, 180, 230, 280].map((yy) => <path key={yy} d={`M ${-6 - yy * 0.06} ${yy} q ${8 + yy * 0.06} -8 ${16 + yy * 0.12} 0`} stroke="#d9b45a" strokeWidth={3} fill="none" />)}
      <path d="M -6 40 L -22 296 M 6 40 L 22 296" stroke="#d9b45a" strokeWidth={5} />
      <g clipPath={`url(#${id}c)`}>
        {/* 털결: 아래로 흐르는 짧은 곡선 (밝은 털끝) */}
        {Array.from({ length: 70 }).map((_, i) => {
          const fx = -110 + ((i * 47) % 220);
          const fy = 30 + ((i * 89) % 260);
          if (Math.abs(fx) < 30 && fy > 40) return null;
          return <path key={i} d={`M ${fx} ${fy} q ${fx < 0 ? -3 : 3} 9 ${fx < 0 ? -1 : 1} 18`} stroke="#6b5444" strokeWidth={2.2} fill="none" opacity={0.75} />;
        })}
        {Array.from({ length: 30 }).map((_, i) => {
          const fx = -100 + ((i * 71) % 200);
          const fy = 50 + ((i * 53) % 240);
          if (Math.abs(fx) < 30 && fy > 40) return null;
          return <path key={`b${i}`} d={`M ${fx} ${fy} q 2 7 0 13`} stroke="#a88a70" strokeWidth={1.6} fill="none" opacity={0.6} />;
        })}
        {/* 지나가는 광택 */}
        <rect x={-150} y={-10} width={300} height={320} fill={`url(#${id}g)`} />
      </g>
      {/* 털 깃 (복슬복슬한 가장자리) */}
      <path d="M -44 8 C -40 26 -30 40 -12 46 C -6 34 6 34 12 46 C 30 40 40 26 44 8 C 30 2 -30 2 -44 8 Z" fill="#2c1f19" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 12 }).map((_, i) => <path key={`c${i}`} d={`M ${-40 + i * 7.3} ${10 + Math.sin(i) * 3} l ${i < 6 ? -3 : 3} ${14 + (i % 3) * 4}`} stroke="#7a6252" strokeWidth={2.5} />)}
      {/* 소매 끝 털 */}
      <path d="M -126 80 C -118 96 -106 104 -96 102 L -98 88 Z M 126 80 C 118 96 106 104 96 102 L 98 88 Z" fill="#3a2a22" stroke={INK} strokeWidth={4} />
      {/* 밑단 털 */}
      <path d={`M -100 296 ${Array.from({ length: 10 }).map((_, i) => `q 10 ${i % 2 ? 10 : 6} 20 0`).join(" ")}`} fill="#2c1f19" stroke={INK} strokeWidth={4} />
      {/* 빛 반짝임 */}
      {shine > 0 && [[-60, 90], [50, 140], [-30, 210], [70, 240], [-80, 170]].map(([sx, sy], i) => {
        const t = ((f + i * 17) % 50) / 50;
        const k = Math.max(0, Math.sin(Math.PI * t)) * shine;
        return <path key={`s${i}`} d={`M ${sx} ${sy - 9 * k} L ${sx + 2} ${sy - 2} L ${sx + 9 * k} ${sy} L ${sx + 2} ${sy + 2} L ${sx} ${sy + 9 * k} L ${sx - 2} ${sy + 2} L ${sx - 9 * k} ${sy} L ${sx - 2} ${sy - 2} Z`} fill="#fff6dc" opacity={k} />;
      })}
    </svg>
  );
};
// 무릎 꿇은 사람 (옆모습, 오른쪽을 봄). (x,y) = 목, s = 판 1px당 화면 px. arms: offer(두 손을 앞으로 들어 올림, lift 0~1) · bound(뒤로 묶임) · down(무릎 위)
const Kneel = ({ id, x, y, s, c, arms = "down", lift = 0, pose = "side", mouth = "0", coat = false, bow = 0, flip = false, face }: { id: string; x: number; y: number; s: number; c: Robe; arms?: "offer" | "bound" | "down"; lift?: number; pose?: string; mouth?: string; coat?: boolean; bow?: number; flip?: boolean; face?: "stern" }) => {
  const hx = 150 - lift * 10;
  const hy = 140 - lift * 190;
  return (
    <div style={{ position: "absolute", inset: 0, transform: flip ? `scaleX(-1)` : undefined, transformOrigin: `${x}px ${y}px` }}>
      <svg width={600 * s} height={520 * s} viewBox="-260 -120 600 520" style={{ position: "absolute", left: x - 260 * s, top: y - 120 * s, ...ink }}>
        <ellipse cx={0} cy={330} rx={210} ry={20} fill="rgba(43,29,20,0.25)" />
        <g transform={`rotate(${bow * 18} 0 300)`}>
          {/* 몸통 + 접은 다리 (도포 자락이 다리를 덮음) */}
          <path d="M -48 -4 C -96 30 -112 120 -104 200 C -150 230 -170 290 -150 322 L 150 322 C 170 300 160 262 120 250 L 40 236 C 52 160 54 70 44 -4 Z" fill={c.robe} stroke={INK} strokeWidth={7} />
          <path d="M -44 -2 C -80 40 -92 120 -88 200" stroke={c.dark} strokeWidth={20} fill="none" opacity={0.6} />
          <path d="M -104 196 C -40 214 10 214 52 204" stroke={c.trim} strokeWidth={14} fill="none" />
          <path d="M 6 -2 C 14 60 24 130 30 200" stroke={c.trim} strokeWidth={8} fill="none" />
          <ellipse cx={-150} cy={318} rx={46} ry={16} fill={c.boot} stroke={INK} strokeWidth={5} />
          {arms === "bound" && (
            <>
              <Arm d="M -20 30 C -70 70 -90 120 -86 150" color={c.dark} w={40} />
              {[90, 118, 146].map((yy) => <path key={yy} d={`M -110 ${yy} C -40 ${yy + 14} 30 ${yy + 10} 52 ${yy - 4}`} stroke={INK} strokeWidth={9} fill="none" />)}
              {[90, 118, 146].map((yy) => <path key={`r${yy}`} d={`M -110 ${yy} C -40 ${yy + 14} 30 ${yy + 10} 52 ${yy - 4}`} stroke="#c9a24a" strokeWidth={4} fill="none" />)}
            </>
          )}
          {arms === "down" && (
            <>
              <Arm d="M 10 40 C 40 110 70 170 110 214" color={c.robe} />
              <circle cx={114} cy={220} r={24} fill={SKIN} stroke={INK} strokeWidth={5} />
            </>
          )}
          {arms === "offer" && (
            <>
              {coat && <Coat x={hx + 40} y={hy - 30} s={0.95} rot={-8} />}
              <Arm d={`M 10 40 C 60 70 ${hx - 30} ${hy + 40} ${hx} ${hy}`} color={c.robe} />
              <circle cx={hx} cy={hy} r={24} fill={SKIN} stroke={INK} strokeWidth={5} />
              <Arm d={`M -16 56 C 40 100 ${hx + 30} ${hy + 60} ${hx + 50} ${hy + 14}`} color={c.dark} w={40} />
              <circle cx={hx + 52} cy={hy + 12} r={22} fill={SKIN} stroke={INK} strokeWidth={5} />
            </>
          )}
        </g>
      </svg>
      <Head id={id} pose={pose} x={x + bow * 40 * s} y={y + bow * 30 * s} s={s} rot={bow * 22} mouth={mouth} face={face} />
    </div>
  );
};

// ---------- 소품 ----------
const Torch = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => {
  const f = useCurrentFrame();
  const k = 1 + Math.sin(f / 2.5 + x) * 0.1;
  return (
    <svg width={80 * s} height={220 * s} viewBox="0 0 80 220" style={{ position: "absolute", left: x - 40 * s, top: y - 70 * s, ...ink }}>
      <path d="M 40 70 L 40 220" stroke={INK} strokeWidth={12} />
      <path d="M 40 70 L 40 220" stroke="#7a5230" strokeWidth={6} />
      <path d={`M 40 ${76 - 70 * k} C 6 40 14 80 40 80 C 66 80 74 40 40 ${76 - 70 * k} Z`} fill="#e8913a" stroke={INK} strokeWidth={4} />
      <path d={`M 40 ${78 - 40 * k} C 28 56 30 80 40 80 C 50 80 52 56 40 ${78 - 40 * k} Z`} fill="#ffd36b" />
    </svg>
  );
};
// 먼지 구름: t 0→1 퍼지며 옅어짐
const Dust = ({ x, y, t, r = 80, color = "#c9b48a" }: { x: number; y: number; t: number; r?: number; color?: string }) =>
  t <= 0 || t >= 1 ? null : (
    <>
      {[-1.2, -0.4, 0.5, 1.3].map((dx, i) => {
        const rr = r * (0.7 + i * 0.1) * (0.6 + t * 0.9);
        return <div key={i} style={{ position: "absolute", left: x + dx * r * (0.6 + t) - rr, top: y - rr - r * 0.3 * t * (i % 2 ? 1.4 : 1), width: rr * 2, height: rr * 2, borderRadius: "50%", background: `radial-gradient(${color}, transparent 70%)`, opacity: (1 - t) * 0.9 }} />;
      })}
    </>
  );
// 불붙은 게르 (불꽃 + 연기)
const Burning = ({ x, y, w = 240, k = 1 }: { x: number; y: number; w?: number; k?: number }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Ger x={x} y={y} w={w} door="#3c3c50" lit={0.6} />
      <Glow x={x} y={y - w * 0.5} r={w * 1.2} color="#f08a3a" op={0.45 * k} />
      <svg width={w} height={w} viewBox="0 0 100 100" style={{ position: "absolute", left: x - w / 2, top: y - w * 1.2, ...ink, opacity: k }}>
        {[20, 45, 70].map((cx, i) => {
          const h = 40 + Math.sin(f / 3 + i * 2) * 10;
          return <path key={i} d={`M ${cx - 12} 95 C ${cx - 14} ${95 - h * 0.6} ${cx} ${95 - h} ${cx + 2} ${95 - h} C ${cx + 6} ${95 - h * 0.6} ${cx + 14} 80 ${cx + 12} 95 Z`} fill={i % 2 ? "#ffd36b" : "#e8913a"} stroke={INK} strokeWidth={2} />;
        })}
      </svg>
      {[0, 1].map((i) => {
        const t = ((f + i * 30) % 60) / 60;
        return <div key={i} style={{ position: "absolute", left: x - 60 + i * 30 + t * 40, top: y - w * 1.2 - t * 220, width: 130 + t * 100, height: 130 + t * 100, borderRadius: "50%", background: "radial-gradient(rgba(40,30,28,0.5), transparent 70%)", opacity: 1 - t }} />;
      })}
    </>
  );
};
// 양 (목동 쪽)
export const Sheep = ({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) => (
  <svg width={130 * s} height={90 * s} viewBox="0 0 130 90" style={{ position: "absolute", left: x - 65 * s, top: y - 90 * s, transform: flip ? "scaleX(-1)" : undefined, ...ink }}>
    {[40, 62, 84].map((xx) => <path key={xx} d={`M ${xx} 60 L ${xx - 2} 88`} stroke={INK} strokeWidth={7} />)}
    <path d="M 20 52 C 10 30 30 14 50 20 C 60 6 90 8 96 24 C 116 26 118 56 100 62 C 90 72 40 74 30 66 C 16 66 12 58 20 52 Z" fill="#efe8d8" stroke={INK} strokeWidth={4} />
    <ellipse cx={108} cy={34} rx={14} ry={11} fill="#3a2f2a" stroke={INK} strokeWidth={3} />
  </svg>
);
// 숲 (나무들)
const Trees = ({ x0, y, n = 6, dark = false }: { x0: number; y: number; n?: number; dark?: boolean }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
    {Array.from({ length: n }).map((_, i) => {
      const x = x0 + i * 95 + ((i * 41) % 40);
      const h = 300 + ((i * 67) % 120);
      return (
        <g key={i}>
          <path d={`M ${x} ${y} L ${x} ${y - h * 0.4}`} stroke={INK} strokeWidth={16} />
          <path d={`M ${x} ${y} L ${x} ${y - h * 0.4}`} stroke="#6a4a2e" strokeWidth={9} />
          <path d={`M ${x} ${y - h} L ${x - 80} ${y - h * 0.35} L ${x + 80} ${y - h * 0.35} Z`} fill={dark ? "#2f3b2c" : "#56704a"} stroke={INK} strokeWidth={5} />
          <path d={`M ${x} ${y - h * 1.08} L ${x - 60} ${y - h * 0.6} L ${x + 60} ${y - h * 0.6} Z`} fill={dark ? "#36452f" : "#628055"} stroke={INK} strokeWidth={5} />
        </g>
      );
    })}
  </svg>
);
// 칼 (빈 손에 쥔 모양): (x,y) 손잡이, rot 각도
const Sword = ({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) => (
  <svg width={60 * s} height={340 * s} viewBox="0 0 60 340" style={{ position: "absolute", left: x - 30 * s, top: y - 300 * s, transform: `rotate(${rot}deg)`, transformOrigin: `50% ${(300 / 340) * 100}%`, ...ink }}>
    <path d="M 30 6 C 42 60 40 200 36 270 L 24 270 C 20 200 22 60 30 6 Z" fill="#c9cfd0" stroke={INK} strokeWidth={4} />
    <path d="M 4 270 L 56 270 L 52 282 L 8 282 Z" fill="#c9a24a" stroke={INK} strokeWidth={4} />
    <path d="M 24 282 L 36 282 L 36 330 L 24 330 Z" fill="#5a3a24" stroke={INK} strokeWidth={4} />
  </svg>
);
// 가마솥 (앞면만 - 뒤에 그린 것이 솥 안으로 들어가 보임)
const CauldronBack = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <svg width={320 * s} height={60 * s} viewBox="0 0 320 60" style={{ position: "absolute", left: x - 160 * s, top: y - 30 * s, ...ink }}>
    <ellipse cx={160} cy={30} rx={130} ry={24} fill="#4a3c34" stroke={INK} strokeWidth={6} />
    <ellipse cx={160} cy={34} rx={110} ry={16} fill="#6f6a5c" />
  </svg>
);
const CauldronFront = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => {
  const f = useCurrentFrame();
  return (
    <svg width={320 * s} height={480 * s} viewBox="0 -200 320 480" style={{ position: "absolute", left: x - 160 * s, top: y - 230 * s, ...ink }}>
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 22) % 66) / 66;
        return <path key={i} d={`M ${110 + i * 50} ${20 - t * 200} c -20 -30 20 -50 0 -80`} stroke="#efe6d4" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6 * Math.sin(Math.PI * t)} />;
      })}
      <path d="M 30 30 C 60 46 260 46 290 30 C 300 140 240 190 160 190 C 80 190 20 140 30 30 Z" fill="#3a3330" stroke={INK} strokeWidth={6} />
      <path d="M 30 50 C 0 50 0 80 30 80 M 290 50 C 320 50 320 80 290 80" stroke={INK} strokeWidth={8} fill="none" />
      <path d="M 60 200 L 40 270 M 260 200 L 280 270 M 160 196 L 160 270" stroke={INK} strokeWidth={14} />
    </svg>
  );
};
// 실루엣 (없는 인물): 그림을 검게 (warm: 금빛 테두리 느낌으로 살짝 밝게)
const Shadow = ({ op = 1, gold = false, lv = 0.12, children }: { op?: number; gold?: boolean; lv?: number; children: React.ReactNode }) => (
  <AbsoluteFill style={{ filter: gold ? "brightness(0.55) sepia(1) saturate(2.2) hue-rotate(-8deg)" : `brightness(${lv}) saturate(0.3)`, opacity: op }}>{children}</AbsoluteFill>
);
// 묶는 밧줄 (서 있는 Char 위에 겹침)
const Rope = ({ x, h, bottom }: { x: number; h: number; bottom: number }) => {
  const w = h * 0.42;
  return (
    <svg width={w} height={h * 0.3} viewBox="0 0 100 70" preserveAspectRatio="none" style={{ position: "absolute", left: x - w / 2, bottom: bottom + h * 0.3, ...ink }}>
      {[14, 34, 54].map((yy) => <path key={yy} d={`M 2 ${yy} C 30 ${yy + 10} 70 ${yy + 10} 98 ${yy - 2}`} stroke={INK} strokeWidth={7} fill="none" />)}
      {[14, 34, 54].map((yy) => <path key={`c${yy}`} d={`M 2 ${yy} C 30 ${yy + 10} 70 ${yy + 10} 98 ${yy - 2}`} stroke="#c9a24a" strokeWidth={3.5} fill="none" />)}
    </svg>
  );
};
const Arrow = ({ x, y, w = 220, rot = 0 }: { x: number; y: number; w?: number; rot?: number }) => (
  <svg width={w} height={w * 0.16} viewBox="0 0 220 36" style={{ position: "absolute", left: x - w / 2, top: y - w * 0.08, transform: `rotate(${rot}deg)`, ...ink }}>
    <path d="M 10 18 L 200 18" stroke={INK} strokeWidth={6} />
    <path d="M 186 6 L 218 18 L 186 30 Z" fill="#9aa0a2" stroke={INK} strokeWidth={4} />
    <path d="M 4 6 L 34 18 L 4 30 M 18 6 L 46 18 L 18 30" stroke="#e8dcc0" strokeWidth={6} fill="none" /><path d="M 4 6 L 34 18 L 4 30" stroke={INK} strokeWidth={2} fill="none" />
  </svg>
);
// 회상 필름: 바랜 색 + 떨리는 종이 + 가장자리 어둡게
const Faded = ({ children, k = 1 }: { children: React.ReactNode; k?: number }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `sepia(${0.85 * k}) saturate(${1 - 0.4 * k}) contrast(0.92) brightness(1.04)`, transform: `translate(${Math.sin(f * 1.7) * 1.5 * k}px, ${Math.cos(f * 2.3) * 1.2 * k}px)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(0,0,0,0) 45%, rgba(60,40,20,0.6))", opacity: k }} />
    </AbsoluteFill>
  );
};

// ---------- 1201 전용 그림: 앞발을 든 말과 균형을 잃는 테무친 · 쓰러진 말 · 땅에 떨어진 테무친 · 활 ----------
const HORSE = { coat: "#b88a52", dark: "#7a5530", mane: "#3a2618", hoof: "#2b1d14" };
const rotP = (p: number[], c: number[], deg: number) => {
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
const Leg = ({ d, w = 26, c = HORSE.coat }: { d: string; w?: number; c?: string }) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>
);
// 활 (세운 모양, (x,y) 가운데, h 길이, rot 기울기)
const Bow = ({ x, y, h = 200, rot = 0 }: { x: number; y: number; h?: number; rot?: number }) => (
  <svg width={h * 0.5} height={h} viewBox="-50 -100 100 200" style={{ position: "absolute", left: x - h * 0.25, top: y - h / 2, transform: `rotate(${rot}deg)`, ...ink }}>
    <path d="M -6 -96 C 10 -90 6 -80 0 -74 C 30 -40 30 40 0 74 C 6 80 10 90 -6 96" stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
    <path d="M -6 -96 C 10 -90 6 -80 0 -74 C 30 -40 30 40 0 74 C 6 80 10 90 -6 96" stroke="#8a5a2e" strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M -4 -92 L -4 92" stroke="#e8dcc0" strokeWidth={2.5} />
    <rect x={14} y={-12} width={12} height={24} rx={4} fill="#a8332a" stroke={INK} strokeWidth={3} />
  </svg>
);
// 앞발을 든 말 + 그 위의 테무친. (x,y) = 뒷발굽 땅, s = 1단위당 화면 px, rear 0~1 (일어섬), lean 0~1 (사람이 뒤로 젖혀짐), fly 0~1 (사람이 말에서 떨어져 나감)
const RearingRide = ({ x, y, s, rear, lean, arrow = true }: { x: number; y: number; s: number; rear: number; lean: number; arrow?: boolean }) => {
  const f = useCurrentFrame();
  const R = -rear * 40;
  const fl = (a: number, b: number) => a + (b - a) * rear;
  const front = `M 318 -176 Q ${fl(330, 400)} ${fl(-90, -150)} ${fl(322, 372)} ${fl(-4, -96)}`;
  const front2 = `M 300 -170 Q ${fl(300, 380)} ${fl(-86, -170)} ${fl(296, 350)} ${fl(-4, -120)}`;
  const L = -lean * 34;
  const neck = rotP(rotP([222, -398], [228, -282], L), [70, 0], R);
  const kick = Math.sin(f / 2.2) * 8 * rear;
  return (
    <>
      <svg width={760 * s} height={720 * s} viewBox="-160 -640 760 720" style={{ position: "absolute", left: x - 160 * s, top: y - 640 * s, ...ink }}>
        <ellipse cx={200} cy={6} rx={200} ry={16} fill="rgba(43,29,20,0.25)" />
        <g transform={`rotate(${R} 70 0)`}>
          <path d="M 64 -236 C 10 -228 -16 -160 -4 -86 C 20 -136 40 -176 76 -204 Z" fill={HORSE.mane} stroke={INK} strokeWidth={6} />
          <Leg d="M 100 -176 Q 70 -90 52 -4" c={HORSE.dark} />
          <Leg d={front2} c={HORSE.dark} />
          <Leg d="M 120 -170 Q 104 -86 88 -4" />
          <ellipse cx={210} cy={-214} rx={160} ry={74} fill={HORSE.coat} stroke={INK} strokeWidth={7} />
          <Leg d={front} />
          <path d="M 296 -256 C 336 -306 356 -356 378 -392 L 440 -362 C 412 -312 392 -246 352 -186 Z" fill={HORSE.coat} stroke={INK} strokeWidth={7} />
          <path d="M 300 -262 C 330 -310 350 -360 372 -398" stroke={HORSE.mane} strokeWidth={22} fill="none" />
          <path d={`M 372 -398 C 412 ${-432 + kick * 0.2} 476 -412 508 -370 C 520 -350 500 -328 476 -336 L 424 -346 Z`} fill={HORSE.coat} stroke={INK} strokeWidth={7} />
          <path d="M 392 -414 L 384 -446 L 410 -420 Z" fill={HORSE.coat} stroke={INK} strokeWidth={5} />
          <circle cx={438} cy={-386} r={6} fill={INK} />
          <path d="M 470 -350 L 520 -320" stroke={INK} strokeWidth={4} />
          {/* 안장 */}
          <path d="M 170 -284 C 200 -300 260 -300 290 -282 L 280 -250 L 180 -252 Z" fill="#8a3b2c" stroke={INK} strokeWidth={6} />
          {arrow && <><path d="M 352 -206 L 476 -250" stroke={INK} strokeWidth={6} /><path d="M 452 -256 L 480 -252 L 462 -232 M 466 -262 L 492 -256 L 476 -238" stroke="#e8dcc0" strokeWidth={6} fill="none" /></>}
          {/* 테무친 (말 위, 뒤로 젖혀짐) */}
          <g transform={`rotate(${L} 228 -282)`}>
            <Leg d="M 230 -282 Q 282 -250 270 -178" w={30} c={TEM.dark} />
            <ellipse cx={272} cy={-168} rx={22} ry={13} fill={TEM.boot} stroke={INK} strokeWidth={4} />
            <path d="M 190 -270 C 186 -330 196 -380 222 -400 C 248 -396 262 -360 262 -300 L 264 -268 Z" fill={TEM.robe} stroke={INK} strokeWidth={7} />
            <path d="M 196 -300 L 262 -300" stroke={TEM.trim} strokeWidth={10} />
            <Arm d={`M 226 -380 C 200 -420 ${170 - kick} -450 ${150 - kick} ${-480 + kick}`} color={TEM.robe} w={26} />
            <circle cx={150 - kick} cy={-480 + kick} r={16} fill={SKIN} stroke={INK} strokeWidth={4} />
            <Arm d={`M 236 -376 C 280 -400 300 -${420 + kick} 330 -${430 + kick}`} color={TEM.dark} w={24} />
            <circle cx={332} cy={-432 - kick} r={15} fill={SKIN} stroke={INK} strokeWidth={4} />
          </g>
        </g>
      </svg>
      <Head id="temujin_young" pose="shocked" x={x + neck[0] * s} y={y + neck[1] * s} s={s * 0.42} rot={R + L} />
    </>
  );
};
// 쓰러진 말 (옆으로 누움, 머리 오른쪽). (x,y) = 배 아래 땅
const FallenHorse = ({ x, y, s, breathe = 0 }: { x: number; y: number; s: number; breathe?: number }) => (
  <svg width={720 * s} height={260 * s} viewBox="-300 -230 720 260" style={{ position: "absolute", left: x - 300 * s, top: y - 230 * s, ...ink }}>
    <ellipse cx={40} cy={10} rx={300} ry={18} fill="rgba(43,29,20,0.28)" />
    <path d="M -170 -96 C -230 -90 -270 -40 -280 4 C -240 -20 -200 -50 -160 -70 Z" fill={HORSE.mane} stroke={INK} strokeWidth={6} />
    <Leg d="M -90 -40 Q -20 -20 30 -4" c={HORSE.dark} />
    <Leg d="M 120 -40 Q 190 -30 250 -6" c={HORSE.dark} />
    <ellipse cx={0} cy={-84 - breathe} rx={170} ry={72 + breathe} fill={HORSE.coat} stroke={INK} strokeWidth={7} />
    <Leg d="M -60 -30 Q 10 -10 70 -2" />
    <Leg d="M 140 -36 Q 220 -12 280 -4" />
    <path d="M 140 -120 C 200 -110 260 -80 300 -40 L 270 -10 C 230 -40 180 -60 130 -60 Z" fill={HORSE.coat} stroke={INK} strokeWidth={7} />
    <path d="M 146 -124 C 210 -114 262 -86 300 -48" stroke={HORSE.mane} strokeWidth={20} fill="none" />
    <path d="M 290 -52 C 330 -60 380 -40 400 -10 C 400 6 380 10 360 4 L 280 -6 Z" fill={HORSE.coat} stroke={INK} strokeWidth={7} />
    <path d="M 330 -40 c 6 -6 14 -6 18 0" stroke={INK} strokeWidth={4} fill="none" />
    <path d="M -40 -150 C 0 -160 60 -160 90 -148 L 84 -120 L -30 -124 Z" fill="#8a3b2c" stroke={INK} strokeWidth={6} />
    <g transform="rotate(-150 120 -110)"><path d="M 120 -110 L 250 -110" stroke={INK} strokeWidth={6} /><path d="M 228 -122 L 256 -110 L 228 -98 M 242 -122 L 268 -110 L 242 -98" stroke="#e8dcc0" strokeWidth={6} fill="none" /></g>
  </svg>
);
// 땅에 떨어진 테무친 (팔꿈치로 몸을 받친 채 누움, 머리 오른쪽). (x,y) = 목
const FallenMan = ({ x, y, s, pose = "shocked" }: { x: number; y: number; s: number; pose?: string }) => (
  <>
    <svg width={520 * s} height={240 * s} viewBox="-400 -100 520 240" style={{ position: "absolute", left: x - 400 * s, top: y - 100 * s, ...ink }}>
      <ellipse cx={-150} cy={118} rx={240} ry={16} fill="rgba(43,29,20,0.25)" />
      <path d="M 10 -6 C -60 -20 -200 0 -300 40 L -290 104 C -200 96 -60 96 20 70 C 40 40 34 6 10 -6 Z" fill={TEM.robe} stroke={INK} strokeWidth={7} />
      <path d="M -60 -6 L -70 96" stroke={TEM.trim} strokeWidth={12} />
      <ellipse cx={-330} cy={60} rx={30} ry={20} fill={TEM.boot} stroke={INK} strokeWidth={5} />
      <ellipse cx={-320} cy={98} rx={30} ry={18} fill={TEM.boot} stroke={INK} strokeWidth={5} />
      <Arm d="M -10 30 C -10 70 20 90 40 110" color={TEM.dark} w={30} />
      <circle cx={44} cy={112} r={16} fill={SKIN} stroke={INK} strokeWidth={4} />
    </svg>
    <Head id="temujin_young" pose={pose} x={x} y={y} s={s * 0.62} rot={-18} />
  </>
);
// 테무친의 진영 (세력을 얻은 뒤의 배경): 지평선 위 게르들·툭·연기. n = 게르 수 (세력이 클수록 많이)
const Camp = ({ horizon, n = 6, dark = false }: { horizon: number; n?: number; dark?: boolean }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, filter: dark ? "brightness(0.55)" : undefined }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = 90 + (i + 0.5) * (1740 / n) + ((i * 53) % 50) - 25;
        const w = 120 + ((i * 37) % 60);
        return <Ger key={i} x={x} y={horizon + 30 + (i % 3) * 14} w={w} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={dark ? 0.8 : 0} />;
      })}
      {Array.from({ length: Math.ceil(n / 2) }).map((_, i) => <Tug key={`t${i}`} x={160 + (i + 0.7) * (1600 / Math.ceil(n / 2))} y={horizon + 40} h={200} sway={Math.sin((f + i * 13) / 14) * 4} />)}
      {[0, 1].map((i) => {
        const t = ((f + i * 40) % 80) / 80;
        return <div key={`s${i}`} style={{ position: "absolute", left: 600 + i * 700 - t * 30, top: horizon - 60 - t * 160, width: 80 + t * 80, height: 80 + t * 80, borderRadius: "50%", background: "radial-gradient(rgba(90,80,70,0.35), transparent 70%)", opacity: 1 - t }} />;
      })}
    </div>
  );
};
// 호위병 (제대로 된 병사 그림 + 창): 발 x, 키 h, bottom
const Guard = ({ x, h, bottom, flip = false, dark = 0 }: { x: number; h: number; bottom: number; flip?: boolean; dark?: number }) => {
  const sx = x + (flip ? -1 : 1) * h * 0.24;
  return (
    <div style={{ position: "absolute", inset: 0, filter: dark ? `brightness(${1 - dark})` : undefined }}>
      <svg width={40} height={h * 1.15} viewBox={`0 0 40 ${h * 1.15}`} style={{ position: "absolute", left: sx - 20, bottom: bottom + 10, ...ink }}>
        <path d={`M 20 ${h * 1.15} L 20 40`} stroke={INK} strokeWidth={10} />
        <path d={`M 20 ${h * 1.15} L 20 40`} stroke="#7a5230" strokeWidth={5} />
        <path d="M 20 2 L 8 44 L 32 44 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
        <path d="M 10 50 C 4 70 8 86 14 96 M 30 50 C 36 70 32 86 26 96" stroke="#a8332a" strokeWidth={6} fill="none" />
      </svg>
      <Char id="archer" x={x} h={h} pose="front" flip={flip} bottom={bottom} enter="none" beat="none" />
    </div>
  );
};

// 처형 장면용: 쓰러진 사람 실루엣 (피 없이, 검은 형체만). (x,y) = 머리 아래 땅
const Lying = ({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) => (
  <svg width={360 * s} height={110 * s} viewBox="-300 -90 360 110" style={{ position: "absolute", left: x - 300 * s, top: y - 90 * s, transform: flip ? "scaleX(-1)" : undefined, transformOrigin: `${300 * s}px ${90 * s}px`, ...ink }}>
    <path d="M -10 -40 C -80 -60 -200 -50 -280 -24 L -276 8 C -180 10 -60 6 0 -4 Z" fill="#1d1612" />
    <circle cx={20} cy={-36} r={34} fill="#1d1612" />
    <path d="M 4 -64 L 20 -86 L 36 -64 Z" fill="#1d1612" />
  </svg>
);
// 집행인 (노을을 등진 검은 실루엣, 두 손으로 칼자루를 쥐고 들어 올림). up 0 = 칼을 옆에 내림, 1 = 머리 위
const Executioner = ({ x, bottom, h, up }: { x: number; bottom: number; h: number; up: number }) => {
  const k = h / 600;
  const gx = lerp(up, 0, 1, 90, 150);
  const gy = lerp(up, 0, 1, -250, -600);
  const rot = lerp(up, 0, 1, 160, -28);
  return (
    <svg width={500 * k} height={1000 * k} viewBox="-250 -900 500 1000" style={{ position: "absolute", left: x - 250 * k, top: 1080 - bottom - 900 * k, ...ink }}>
      <g fill="#120d0a" stroke="#120d0a">
        <path d="M -70 -360 C -90 -250 -100 -120 -110 0 L -20 0 L 0 -150 L 20 0 L 110 0 C 100 -120 90 -250 70 -360 Z" />
        <circle cx={0} cy={-430} r={70} />
        <path d="M -78 -440 C -70 -520 70 -520 78 -440 Z M -6 -505 L 0 -560 L 6 -505 Z" />
        <path d={`M -60 -350 L ${gx - 14} ${gy + 10}`} strokeWidth={46} strokeLinecap="round" fill="none" />
        <path d={`M 60 -350 L ${gx + 14} ${gy + 10}`} strokeWidth={46} strokeLinecap="round" fill="none" />
        <g transform={`translate(${gx} ${gy}) rotate(${rot})`}>
          <rect x={-10} y={-10} width={20} height={60} />
          <rect x={-40} y={-18} width={80} height={14} />
          <path d="M -14 -18 L 14 -18 L 10 -300 L 0 -330 L -10 -300 Z" fill="#8f9597" stroke={INK} strokeWidth={6} />
        </g>
      </g>
    </svg>
  );
};
const TRT: Robe = { robe: "#6b6f6a", dark: "#55594f", trim: "#a8332a", boot: "#3a2b22" };
// ================= 장면 =================
// 1) c2_01 혼인 잔치 (낮): 흰 천 줄, 양가 가족, 말젖술 잔, 춤. 카메라가 천천히 둘에게로
const S1 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const z = lerp(f, 0, frames, 1.0, 1.12, true);
  return (
    <AbsoluteFill>
      <Cam z={z} cx={960} cy={640}>
        <Steppe time="day" horizon={600} />
        <Ger x={420} y={700} w={300} />
        <Ger x={1500} y={700} w={300} door="#4f6b5a" />
        {/* 흰 천(하닥) 줄 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 300 420 C 700 520 1200 520 1620 420" stroke={INK} strokeWidth={4} fill="none" />
          {Array.from({ length: 13 }).map((_, i) => {
            const t = (i + 0.5) / 13;
            const x = 300 + t * 1320;
            const y = 420 + Math.sin(Math.PI * t) * 92;
            const sw = Math.sin(f / 10 + i) * 6;
            return <path key={i} d={`M ${x - 14} ${y} L ${x + 14} ${y} L ${x + 10 + sw} ${y + 70} L ${x - 10 + sw} ${y + 64} Z`} fill={i % 3 === 1 ? "#5d86a8" : "#f2ead8"} stroke={INK} strokeWidth={3} />;
          })}
        </svg>
        {/* 양가 가족: 왼쪽 호엘룬, 오른쪽 신부 집안(실루엣 아님 - 궁수 그림 둘이 잔을 듦) */}
        <Char id="hoelun" x={330} h={460} pose="happy" bottom={150} enter="pop" delay={4} beat="hop" beatAt={40} />
        <Char id="archer" x={1560} h={430} pose="happy" flip bottom={150} enter="pop" delay={8} beat="hop" beatAt={30} />
        <Char id="archer" x={1720} h={410} pose="happy" flip bottom={160} enter="pop" delay={12} beat="hop" beatAt={56} />
        <Char id="temujin_young" x={830} h={540} pose="happy" bottom={160} enter="up" delay={0} beat="hop" beatAt={24} />
        <Char id="borte" x={1090} h={500} pose="happy" flip bottom={160} enter="up" delay={6} beat="hop" beatAt={34} />
        {/* 잔칫상 (낮은 상 위에 말젖술 항아리·잔·고기) - 잔은 공중에 띄우지 않고 상 위에 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {[[180, 560], [1380, 1800]].map(([x0, x1], k) => (
            <g key={k}>
              <path d={`M ${x0} 960 L ${x1} 960 L ${x1 - 20} 990 L ${x0 + 20} 990 Z`} fill="#8a5a34" stroke={INK} strokeWidth={5} />
              <path d={`M ${x0 + 30} 990 L ${x0 + 30} 1030 M ${x1 - 30} 990 L ${x1 - 30} 1030`} stroke={INK} strokeWidth={10} />
              <path d={`M ${x0 + 40} 960 C ${x0 + 30} 900 ${x0 + 110} 890 ${x0 + 110} 920 L ${x0 + 104} 960 Z`} fill="#c9a24a" stroke={INK} strokeWidth={4} />
              {[0, 1, 2].map((i) => <g key={i}><path d={`M ${x0 + 150 + i * 70} 960 L ${x0 + 190 + i * 70} 960 C ${x0 + 188 + i * 70} 938 ${x0 + 152 + i * 70} 938 ${x0 + 150 + i * 70} 960 Z`} fill="#efe6d4" stroke={INK} strokeWidth={4} transform={`translate(0 ${-0})`} /><ellipse cx={x0 + 170 + i * 70} cy={942} rx={20} ry={5} fill="#f4efe2" stroke={INK} strokeWidth={3} /></g>)}
              <ellipse cx={x1 - 90} cy={948} rx={50} ry={16} fill="#a8623a" stroke={INK} strokeWidth={4} />
            </g>
          ))}
        </svg>
      </Cam>
      <SFX name="crowd" at={0} vol={0.18} dur={frames} />
    </AbsoluteFill>
  );
};

// 2) c2_02 한밤 납치: 둘만 있는 게르 앞 모닥불 → 오른쪽 언덕 위 횃불들 → 메르키트 기병이 대각선으로 쏟아져 내려와 보르테를 말 위로 낚아챔
//    (가로 행렬 아님: 오른쪽 위 → 왼쪽 아래, 멀리서 가까이 커짐 + 카메라 흔들림·먼지·횃불)
const RAID_N = 8;
const S2 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const torches = sec(2.6);
  const pour = sec(3.0);
  const DUR = 54; // 기병 한 명이 언덕 위 → 화면 왼쪽 아래까지
  // 기병 길: 진행 p에서 (왼쪽 x, 위 y, 폭 w)
  // 가운데 x 1800→200, 발(아래) y 280→1260, 폭 110→560
  const path = (p: number) => {
    const w = 110 + 450 * p;
    return { x: 1800 - 1600 * p - w / 2, y: 280 + 980 * p - 0.775 * w, w };
  };
  const BX = 900; // 보르테 발 x (기병 길 위)
  const pg = (1800 - BX) / 1600;
  const BB = 1080 - (280 + 980 * pg); // 보르테 bottom
  const grab = pour + Math.round(pg * DUR);
  const lead = (fr: number) => (fr - pour) / DUR;
  const sh = f >= pour ? shake(f, pour, 9, 80) : { x: 0, y: 0 };
  const sh2 = shake(f, grab, 16, 24);
  const taken = f >= grab;
  const lp = lead(f);
  const gp = path(pg);
  const now = path(lp);
  const after = f >= pour + DUR + 20;
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, pour, 1.12, 1.0, true)} cx={1130} cy={700} sx={sh.x + sh2.x} sy={sh.y + sh2.y}>
        <Steppe time="night" horizon={620} hills={false} />
        {/* 오른쪽 위로 솟은 어두운 언덕 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 300 624 C 800 600 1300 380 1600 300 C 1760 260 1860 250 1960 250 L 1960 624 Z" fill="#232a2f" stroke={INK} strokeWidth={5} />
        </svg>
        {/* 언덕 능선의 횃불들 */}
        {f >= torches && f < pour + 20 && [1500, 1590, 1680, 1770, 1850].map((x, i) => (
          <div key={i} style={{ opacity: lerp(f, torches + i * 3, torches + i * 3 + 6, 0, 1) }}>
            <Glow x={x} y={290 - (x - 1500) * 0.12} r={70} color="#f3a24e" op={0.7} />
            <Torch x={x} y={300 - (x - 1500) * 0.12} s={0.45} />
          </div>
        ))}
        <Ger x={1560} y={760} w={260} door="#8a3b2c" lit={0.8} />
        <Fire x={1160} y={900} s={0.9} />
        <Char id="temujin_young" x={1360} h={440} pose={f < torches ? "front" : "shocked"} flip={taken} gesture={taken ? "point" : undefined} gestureAt={grab + 2} bottom={170} enter="none" beat={f < torches ? "none" : "jump"} beatAt={torches + 4} />
        {/* 보르테: 닿는 순간 말 위로 들려 기병 길을 따라 사라짐 */}
        {(!taken || lp < 1.05) && (
          <div style={{ position: "absolute", inset: 0, transform: taken ? `translate(${now.x - gp.x}px, ${now.y - gp.y - 110 * Math.min(1, (f - grab) / 6)}px) scale(${now.w / gp.w})` : undefined, transformOrigin: `${BX}px ${1080 - BB}px` }}>
            <div style={{ position: "absolute", inset: 0, transform: taken ? `rotate(${-lerp(f, grab, grab + 6, 0, 70)}deg) scale(${lerp(f, grab, grab + 6, 1, 0.7)})` : undefined, transformOrigin: `${BX}px ${1080 - BB}px` }}>
              <Char id="borte" x={BX} h={400} pose={f < torches ? "front" : "shocked"} bottom={BB} enter="none" beat={f < torches ? "none" : "jump"} beatAt={torches + 8} />
            </div>
          </div>
        )}
        {/* 메르키트 기병: 멀리(작게)부터 그려 가까운 기병이 위에 */}
        {Array.from({ length: RAID_N }).map((_, i) => {
          const p = (f - pour - i * 7) / DUR;
          return { i, p };
        }).filter((r) => r.p > -0.02 && r.p < 1.1).sort((a, b) => a.p - b.p).map(({ i, p }) => {
          const q = path(p);
          const off = (i % 3 - 1) * 70 * (0.4 + p);
          return (
            <React.Fragment key={i}>
              <Dust x={q.x + q.w * 0.5} y={q.y + q.w * 0.72 + off} t={((f - pour - i * 7) % 18) / 18} r={q.w * 0.22} color="#4a4a48" />
              <Rider kind="merkit" x={q.x + off * 0.3} y={q.y + off} w={q.w} flip phase={i * 5} />
              {i % 2 === 0 && <><Glow x={q.x + q.w * 0.3} y={q.y + off} r={q.w * 0.5} color="#f3a24e" op={0.5} /><Torch x={q.x + q.w * 0.32} y={q.y + off - q.w * 0.05} s={q.w / 420} /></>}
            </React.Fragment>
          );
        })}
        {after && <Dust x={800} y={900} t={lerp(f, pour + DUR + 20, frames, 0.2, 0.95)} r={200} color="#3d3d3a" />}
      </Cam>
      <SFX name="hooves" at={pour - 6} vol={0.45} dur={DUR + 30} />
      <SFX name="neigh" at={grab - 2} vol={0.35} dur={50} />
    </AbsoluteFill>
  );
};

// 3) c2_03 회상(바랜 색, 단계가 보이게 - 비밀사): ① 매사냥하던 젊은 예수게이가 언덕에서 신혼 수레(호엘룬)와 메르키트 신랑 칠레두를 봄
//    ② 형제들과 말을 달려 쫓음 ③ 신랑은 말을 타고 달아나고, 수레 위의 호엘룬이 울며 자기 저고리를 벗어 던져 줌
//    ④ 예수게이가 수레 고삐를 잡고 호엘룬을 데려감 ⑤ 언덕 위에서 주먹을 쥐는 칠레두(원한) → 지금: 달빛 능선 너머로 보르테를 데려가는 메르키트
const Falcon = ({ x, y, s = 1, flap = 0 }: { x: number; y: number; s?: number; flap?: number }) => (
  <svg width={120 * s} height={80 * s} viewBox="-60 -40 120 80" style={{ position: "absolute", left: x - 60 * s, top: y - 40 * s, ...ink }}>
    <path d={`M 0 0 C -20 ${-20 - flap * 14} -44 ${-24 - flap * 10} -58 ${-10 - flap * 18} C -40 -2 -20 4 0 6 C 20 4 40 -2 58 ${-10 - flap * 18} C 44 ${-24 - flap * 10} 20 ${-20 - flap * 14} 0 0 Z`} fill="#6a4a30" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-2} r={8} fill="#8a6440" stroke={INK} strokeWidth={3} />
    <path d="M 4 -2 L 12 0 L 4 3 Z" fill="#d9b45a" />
  </svg>
);
// 신혼 수레 (흰 덮개, 바퀴 둘, 앞에 끄는 소) - 오른쪽으로 감. (x,y) = 수레 바닥 가운데, roll = 바퀴 돌기
const BrideCart = ({ x, y, s = 1, roll = 0 }: { x: number; y: number; s?: number; roll?: number }) => (
  <svg width={620 * s} height={320 * s} viewBox="-320 -260 620 320" style={{ position: "absolute", left: x - 320 * s, top: y - 260 * s, ...ink }}>
    {/* 소 */}
    <path d="M 150 -70 C 160 -120 260 -120 270 -80 L 290 -90 C 300 -70 290 -50 276 -46 L 270 -10 L 252 -10 L 248 -40 L 180 -40 L 176 -10 L 158 -10 Z" fill="#7a5a3a" stroke={INK} strokeWidth={5} />
    <path d="M 270 -98 C 280 -116 296 -112 300 -104 M 262 -98 C 256 -116 240 -116 236 -108" stroke="#e8dcc0" strokeWidth={5} fill="none" />
    <path d="M 150 -60 L 100 -60" stroke="#6a4a2e" strokeWidth={8} />
    {/* 수레 */}
    <path d="M -200 -60 L 110 -60 L 100 -30 L -190 -30 Z" fill="#8a6440" stroke={INK} strokeWidth={5} />
    <path d="M -180 -60 C -160 -210 80 -210 100 -60 Z" fill="#efe6d4" stroke={INK} strokeWidth={5} />
    <path d="M -120 -60 C -110 -170 40 -170 50 -60" stroke="#c8b998" strokeWidth={4} fill="none" />
    {[-120, 40].map((cx) => (
      <g key={cx} transform={`rotate(${roll} ${cx} -10)`}>
        <circle cx={cx} cy={-10} r={42} fill="none" stroke={INK} strokeWidth={9} />
        <path d={`M ${cx - 42} -10 L ${cx + 42} -10 M ${cx} -52 L ${cx} 32`} stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </svg>
);
const S3 = (p: ShotProps) => (
  <AbsoluteFill>
    <S3Body {...p} />
    <SFX name="gallop" at={40} vol={0.3} dur={80} />
  </AbsoluteFill>
);
const S3Body = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const chase = 40;
  const fleeAt = 85;
  const takeAt = 120;
  const grudge = sec(4.85); // "메르키트는 그 원한을"
  const now = sec(6.3); // "그 아들의 아내에게"
  const k = lerp(f, 0, 12, 0, 1);
  if (f < chase) {
    // ① 언덕 위에서 매사냥하던 예수게이 (매가 날아오름) → 아래 길을 가는 신혼 수레를 봄
    return (
      <AbsoluteFill>
        <Faded k={k}>
          <Cam z={lerp(f, 0, chase, 1.15, 1.05)} cx={900} cy={600}>
            <Steppe time="day" horizon={560} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M -20 720 C 200 640 420 620 620 690 C 760 740 860 780 980 1100 L -20 1100 Z" fill="#c4a874" stroke={INK} strokeWidth={5} />
            </svg>
            <BrideCart x={1320} y={760} s={0.7} roll={f * 4} />
            <Char id="hoelun" x={1385} h={250} pose="happy" bottom={1080 - 760 + 30} enter="none" beat="none" />
            <Char id="archer" x={1600} h={300} pose="happy" bottom={1080 - 770} enter="none" beat="none" />
            <Char id="yesugei" x={330} h={520} pose={f > 24 ? "shocked" : "front"} gesture="point" gestureAt={4} bottom={1080 - 680} enter="none" beat={f > 24 ? "jump" : "none"} beatAt={24} />
            <Falcon x={lerp(f, 0, chase, 470, 820)} y={lerp(f, 0, chase, 520, 260)} s={0.9} flap={Math.abs(Math.sin(f / 3))} />
          </Cam>
        </Faded>
      </AbsoluteFill>
    );
  }
  if (f < takeAt) {
    // ② 형제들과 말을 달려 쫓음 (카메라가 수레를 따라 흐름) ③ 신랑은 말을 타고 달아나고, 호엘룬이 울며 저고리를 벗어 던짐
    const t = f - chase;
    const fled = f >= fleeAt;
    const rx = lerp(f, chase, takeAt, -600, 560, true);
    const throwK = lerp(f, fleeAt + 4, fleeAt + 22, 0, 1, true);
    return (
      <AbsoluteFill>
        <Faded k={1}>
          <Cam z={1.0} cx={960} cy={560}>
            <Steppe time="day" horizon={560} />
            <BrideCart x={1080} y={860} s={0.95} roll={t * 6} />
            <Char id="hoelun" x={930} h={330} pose={fled ? "sad" : "shocked"} gesture={throwK > 0 && throwK < 1 ? "open" : undefined} gestureAt={fleeAt + 2} bottom={1080 - 860 + 40} enter="none" beat="none" />
            {/* 칠레두: 처음엔 수레 곁에서 놀라고 → 말을 타고 오른쪽으로 달아남 */}
            {!fled ? (
              <Char id="archer" x={1480} h={380} pose="shocked" flip bottom={170} enter="none" beat="jump" beatAt={chase + 8} />
            ) : (
              <Rider kind="merkit" x={lerp(f, fleeAt, takeAt, 1350, 2100)} y={470} w={300} phase={2} />
            )}
            {/* 던진 저고리가 달아나는 신랑 쪽으로 날아감 */}
            {throwK > 0 && throwK < 1 && (
              <svg width={120} height={110} viewBox="0 0 120 110" style={{ position: "absolute", left: lerp(throwK, 0, 1, 960, 1620), top: lerp(throwK, 0, 1, 520, 470) - Math.sin(Math.PI * throwK) * 160, transform: `rotate(${throwK * 300}deg)`, ...ink }}>
                <path d="M 30 6 L 90 6 L 116 40 L 98 50 L 92 36 L 92 104 L 28 104 L 28 36 L 22 50 L 4 40 Z" fill="#6b4a7a" stroke={INK} strokeWidth={4} />
              </svg>
            )}
            {/* 예수게이 형제들이 달려옴 (예수게이가 앞) */}
            <Rider kind="mongol" x={rx - 380} y={430} w={340} phase={6} />
            <Rider kind="mongol" x={rx - 230} y={530} w={360} phase={10} />
            <Rider kind="yesugei" x={rx} y={470} w={440} phase={0} />
            <Dust x={rx + 100} y={860} t={(t % 18) / 18} r={120} />
          </Cam>
        </Faded>
      </AbsoluteFill>
    );
  }
  if (f < now) {
    // ④ 예수게이가 수레 고삐를 잡고 데려감 (왼쪽으로, 호엘룬은 울며 뒤를 돌아봄) ⑤ "그 원한": 언덕 위의 칠레두가 주먹을 쥠
    const t = f - takeAt;
    const lead = lerp(f, takeAt, now, 0, 520);
    return (
      <AbsoluteFill>
        <Faded k={1}>
          <Cam z={lerp(f, takeAt, now, 1.0, 1.1)} cx={900} cy={580}>
            <Steppe time="day" horizon={560} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M 1300 640 C 1500 560 1700 500 1960 510 L 1960 660 C 1800 650 1500 650 1300 640 Z" fill="#c4a874" stroke={INK} strokeWidth={5} />
            </svg>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${-lead}px)` }}>
              <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", transformOrigin: "1080px 0" }}>
                <BrideCart x={1080} y={860} s={0.95} roll={-t * 3} />
              </div>
              <Char id="hoelun" x={1180} h={330} pose="sad" flip bottom={1080 - 860 + 40} enter="none" beat="none" />
              <Rider kind="yesugei" x={560} y={470} w={440} flip phase={0} still={false} />
              {/* 고삐: 예수게이 손 → 수레 앞 */}
              <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
                <path d="M 720 620 Q 790 720 880 760" stroke={INK} strokeWidth={7} fill="none" />
                <path d="M 720 620 Q 790 720 880 760" stroke="#8a6440" strokeWidth={3} fill="none" />
              </svg>
            </div>
            {f >= grudge && <Char id="archer" x={1720} h={340} pose="angry" flip bottom={1080 - 600} enter="pop" delay={grudge} beat="shake" beatAt={grudge + 6} gesture="fist" gestureAt={grudge + 4} />}
          </Cam>
        </Faded>
      </AbsoluteFill>
    );
  }
  const g = f - now;
  return (
    <AbsoluteFill>
      <Steppe time="night" horizon={680} />
      {[0, 1, 2, 3].map((i) => <Rider key={i} kind="merkit" x={900 + g * 3.2 + i * 120} y={560 - i * 4} w={150 - i * 6} flip={false} phase={i * 4} dark />)}
      <Dim op={lerp(f, frames - 14, frames, 0, 0.7)} />
      <AbsoluteFill style={{ background: "#000", opacity: lerp(g, 0, 8, 0.6, 0) }} />
    </AbsoluteFill>
  );
};

// 4) c2_04 텅 빈 게르 안: 천장 구멍(토ono)에서 내려오는 빛 한 줄기 아래 검은 담비 외투 한 벌, 그 곁에 앉은 테무친. 카메라가 외투로 천천히
const GerInside = ({ dark = 0.5 }: { dark?: number }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #6a523a, #2a1f17 75%)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      {/* 격자 벽 */}
      {Array.from({ length: 26 }).map((_, i) => <path key={i} d={`M ${-100 + i * 90} 430 L ${-10 + i * 90} 780`} stroke="#5a442e" strokeWidth={5} />)}
      {Array.from({ length: 26 }).map((_, i) => <path key={`b${i}`} d={`M ${-10 + i * 90} 430 L ${-100 + i * 90} 780`} stroke="#5a442e" strokeWidth={5} />)}
      {/* 지붕 살 */}
      {Array.from({ length: 15 }).map((_, i) => <path key={`r${i}`} d={`M 960 90 L ${-200 + i * 165} 430`} stroke="#7a5230" strokeWidth={9} />)}
      <ellipse cx={960} cy={90} rx={120} ry={34} fill="#d8c8a0" stroke={INK} strokeWidth={6} />
      <path d="M 0 780 L 1920 780 L 1920 1080 L 0 1080 Z" fill="#4a3626" stroke={INK} strokeWidth={5} />
      <ellipse cx={960} cy={900} rx={520} ry={90} fill="#7a3a2a" stroke={INK} strokeWidth={4} opacity={0.75} />
    </svg>
    <Dim op={dark} />
  </AbsoluteFill>
);
const S4 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const beam = 0.5 + 0.08 * Math.sin(f / 20);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.28, true)} cx={1080} cy={790}>
        <GerInside dark={0.45} />
        {/* 빛줄기 */}
        <div style={{ position: "absolute", left: 860, top: 90, width: 340, height: 820, background: "linear-gradient(rgba(255,236,190,0.55), rgba(255,236,190,0.08))", clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)", opacity: beam, mixBlendMode: "screen" }} />
        {/* 바닥에 펼쳐 놓은 외투 */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: "translate(1080px, 700px) scaleY(0.8) translate(-1080px, -700px)" }}>
          <Coat x={1080} y={560} s={1.5} shine={1} />
        </div>
        <Glow x={1080} y={840} r={240} op={0.35} />
        <Char id="temujin_young" x={560} h={520} pose="sad" bottom={160} enter="none" beat="sink" beatAt={20} />
      </Cam>
    </AbsoluteFill>
  );
};

// 5) c2_05~07 케레이트의 큰 진영 - 높은 자리의 토그릴 칸 앞에 무릎 꿇고 외투를 바치는 테무친 (핵심 장면, 천천히)
//    c2_05: 넓게, 테무친이 외투를 안고 걸어 들어옴(왼쪽 → 가운데) / c2_06: 낮은 자리에서 테무친에게 다가가며 외투를 들어 올림 / c2_07: 위로 올려다보듯 토그릴에게, 외투가 토그릴 곁으로
const Dais = () => (
  <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
    {/* 큰 천막 휘장 */}
    <path d="M 1000 140 C 1200 60 1600 60 1860 140 L 1880 640 L 980 640 Z" fill="#d9c9a4" stroke={INK} strokeWidth={6} />
    <path d="M 1000 140 C 1200 60 1600 60 1860 140" stroke="#a8332a" strokeWidth={22} fill="none" />
    {[1080, 1260, 1440, 1620, 1800].map((x) => <path key={x} d={`M ${x} 120 L ${x} 640`} stroke="#b8a888" strokeWidth={4} />)}
    {/* 단(계단 셋) */}
    <path d="M 1080 640 L 1820 640 L 1840 700 L 1060 700 Z" fill="#8a3b2c" stroke={INK} strokeWidth={6} />
    <path d="M 1030 700 L 1870 700 L 1890 770 L 1010 770 Z" fill="#7a3426" stroke={INK} strokeWidth={6} />
    <path d="M 980 770 L 1920 770 L 1940 850 L 960 850 Z" fill="#6a2e22" stroke={INK} strokeWidth={6} />
    {/* 높은 자리 (등받이) */}
    <path d="M 1330 300 L 1570 300 L 1590 640 L 1310 640 Z" fill="#c9a24a" stroke={INK} strokeWidth={6} />
    <path d="M 1360 330 L 1540 330 L 1550 610 L 1350 610 Z" fill="#a8332a" stroke={INK} strokeWidth={4} />
  </svg>
);
const S5 = ({ at }: ShotProps) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a6 = at("c2_06");
  const a7 = at("c2_07");
  const walkEnd = a6 - 20;
  const wx = lerp(f, 10, walkEnd, -150, 640, true);
  const kneel = f >= walkEnd;
  const lift = spring({ frame: f - (a6 + sec(3.3)), fps, config: { damping: 18, stiffness: 60 } }); // "이 외투를 받아 주십시오"
  const give = lerp(f, a7 - 10, a7 + 30, 0, 1, true); // 외투가 토그릴 곁으로
  // 카메라: 넓게 → 테무친(낮게) → 토그릴(위)
  const z = f < a6 ? lerp(f, 0, a6, 1.0, 1.05) : f < a7 ? lerp(f, a6, a6 + 60, 1.05, 1.2, true) : lerp(f, a7, a7 + 40, 1.2, 1.3, true);
  const cx = f < a6 ? 960 : f < a7 ? lerp(f, a6, a6 + 60, 960, 1000, true) : lerp(f, a7, a7 + 40, 1000, 1250, true);
  const cy = f < a6 ? 560 : f < a7 ? lerp(f, a6, a6 + 60, 560, 600, true) : lerp(f, a7, a7 + 40, 600, 480, true);
  const s = 0.72;
  const neckY = 1080 - 170 - (275 + 47) * s; // 무릎 꿇은 몸의 목 높이 (발 y = 910)
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={cy}>
        <Steppe time="day" horizon={520} />
        <Ger x={260} y={640} w={240} door="#3c5560" />
        <Ger x={560} y={600} w={180} door="#3c5560" />
        <Tug x={960} y={640} h={380} color="#6a86a0" sway={Math.sin(f / 15) * 5} />
        <Dais />
        {/* 호위병 (실루엣) */}
        <Shadow><Char id="archer" x={1080} h={440} pose="front" bottom={230} enter="none" beat="none" /><Char id="archer" x={1830} h={440} pose="front" flip bottom={230} enter="none" beat="none" /></Shadow>
        {/* 토그릴: 높은 자리 위 */}
        <Char id="toghrul" x={1450} h={520} pose={f >= a7 + sec(4.4) ? "happy" : f >= a7 ? "front" : "smug"} talking={talkingAt(f, a7, "c2_07")} gesture={f >= a7 ? "open" : undefined} gestureAt={a7 + 6} bottom={440} enter="none" beat={f >= a7 + sec(4.4) ? "nod" : "none"} beatAt={a7 + sec(4.4)} />
        {give > 0 && <div style={{ opacity: give }}><Coat x={1640} y={lerp(give, 0, 1, 520, 470)} s={0.55} rot={10} /></div>}
        {/* 테무친: 외투를 안고 걸어옴 → 무릎 꿇고 바침 */}
        {!kneel ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${-Math.abs(Math.sin(f / 5)) * 10}px)` }}>
            <Char id="temujin_young" x={wx} h={520} pose="side" bottom={170} enter="none" beat="none" />
            <Coat x={wx + 70} y={1080 - 170 - 300} s={0.6} rot={-12} />
          </div>
        ) : (
          <Kneel id="temujin_young" x={640} y={neckY} s={s} c={TEM} arms="offer" coat={give < 0.5} lift={give > 0 ? 1 - give : lift} mouth={mouthAt(f, a6, "c2_06")} pose={f >= a7 + sec(4.4) ? "happy" : "side"} bow={lerp(f, walkEnd, walkEnd + 14, 0, 0.6) * (1 - lift) + (give > 0.9 ? 0.4 : 0)} />
        )}
      </Cam>
      <Glow x={960} y={300} r={700} op={0.15} />
    </AbsoluteFill>
  );
};

// 6) c2_08~09 토그릴이 사람을 보내 자무카를 부름 → 자무카가 기병을 이끌고 언덕 너머에서 다가옴 → 수만 기병이 능선을 덮음 → 테무친·자무카 어깨동무, 뒤로 아버지의 그림자
const S6 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const call = sec(3.0);
  const mass = sec(6.1);
  const a9 = at("c2_09");
  if (f < a9) {
    if (f < call) {
      // 전령이 멀어짐 (화면 안쪽으로 작아짐)
      const p = lerp(f, 6, call, 0, 1);
      return (
        <AbsoluteFill>
          <Steppe time="day" horizon={560} />
          <Char id="toghrul" x={360} h={560} pose="front" gesture="point" gestureAt={4} bottom={110} enter="none" />
          <Rider kind="mongol" x={lerp(p, 0, 1, 700, 1350)} y={lerp(p, 0, 1, 640, 470)} w={lerp(p, 0, 1, 360, 60)} phase={0} />
          <Dust x={lerp(p, 0, 1, 860, 1380)} y={lerp(p, 0, 1, 900, 520)} t={(f % 16) / 16} r={lerp(p, 0, 1, 80, 14)} />
        </AbsoluteFill>
      );
    }
    // 자무카 기병이 언덕 너머에서 이쪽으로 (커짐) → 수만 기병
    const g = f - call;
    const wide = f >= mass;
    return (
      <AbsoluteFill>
        <Cam z={wide ? lerp(f, mass, mass + 30, 1.3, 1.0, true) : 1.3} cx={960} cy={480}>
          <Steppe time="day" horizon={520} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M 0 700 C 400 600 900 580 1300 620 C 1600 650 1800 640 1920 620 L 1920 1080 L 0 1080 Z" fill="#c4a874" stroke={INK} strokeWidth={5} />
          </svg>
          {/* 능선을 덮는 수만 기병 (작은 검은 실루엣 줄) */}
          {wide && [0, 1, 2].map((r) => Array.from({ length: 22 }).map((_, i) => {
            const show = lerp(f, mass + i * 1.2 + r * 4, mass + i * 1.2 + r * 4 + 6, 0, 1);
            return <div key={`${r}-${i}`} style={{ opacity: show }}><Rider kind={i % 4 ? "mongol" : "mongol2"} x={-40 + i * 90 + (r % 2) * 45} y={520 + r * 55} w={90 + r * 14} still phase={i} dark /></div>;
          }))}
          {Array.from({ length: 5 }).map((_, i) => {
            const p = lerp(g, i * 5, i * 5 + 70, 0, 1);
            const x = 960 + (i - 2) * 230 * p - (i === 2 ? 0 : 0);
            const w = lerp(p, 0, 1, 80, i === 2 ? 440 : 300);
            return <Rider key={i} kind={i === 2 ? "jamukha" : "mongol2"} x={x - w / 2} y={lerp(p, 0, 1, 560, i === 2 ? 600 : 650)} w={w} phase={i * 3} />;
          })}
        </Cam>
        <SFX name="cavalry" at={call} vol={0.3} dur={mass - call + 30} />
        <SFX name="war_horn" at={mass} vol={0.3} dur={60} />
      </AbsoluteFill>
    );
  }
  const g = f - a9;
  const ghost = lerp(g, sec(2.6), sec(3.6), 0, 0.35) * lerp(g, frames - a9 - 30, frames - a9, 1, 0.6);
  return (
    <AbsoluteFill>
      <Cam z={lerp(g, 0, frames - a9, 1.25, 1.0, true)} cx={960} cy={620}>
        <Steppe time="dusk" horizon={560} />
        {/* 하늘의 아버지 그림자 */}
        <div style={{ position: "absolute", inset: 0, opacity: ghost, filter: "sepia(1) blur(1px)" }}>
          <Char id="yesugei" x={960} h={900} pose="front" bottom={260} enter="none" beat="none" />
        </div>
        {/* 능선 위 기병 실루엣 */}
        {Array.from({ length: 26 }).map((_, i) => <Rider key={i} kind="mongol" x={-60 + i * 76} y={480 + (i % 2) * 18} w={100} still phase={i} dark />)}
        <Char id="toghrul" x={1500} h={560} pose="smug" bottom={170} enter="none" />
        <Char id="temujin_young" x={850} h={540} pose="happy" bottom={160} enter="none" beat="hop" beatAt={14} />
        <Char id="jamukha" x={1060} h={560} pose="happy" flip bottom={160} enter="none" beat="hop" beatAt={18} />
        {/* 어깨동무: 자무카 팔이 테무친 어깨 위로 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <Arm d="M 1020 728 C 960 708 880 708 820 728" color={JAM.robe} w={30} />
          <circle cx={816} cy={730} r={17} fill={SKIN} stroke={INK} strokeWidth={4} />
        </svg>
      </Cam>
    </AbsoluteFill>
  );
};

// 7) c2_10 달밤, 세 갈래가 위에서 메르키트 진영으로: 왼쪽 위(테무친)·오른쪽 위(자무카)·가운데 안쪽에서 커지며(토그릴), 천막에 불이 붙고 메르키트가 달아남
const S7 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const hit = 58;
  const p = lerp(f, 0, hit, 0, 1);
  const burn = lerp(f, hit - 4, hit + 14, 0, 1);
  const sh = shake(f, hit, 12, 40);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={960} cy={700} sx={sh.x} sy={sh.y}>
        <Steppe time="night" horizon={460} />
        {[[700, 800, 230], [960, 760, 200], [1220, 800, 230], [830, 900, 250], [1100, 910, 250]].map(([x, y, w], i) => burn > 0 ? <Burning key={i} x={x} y={y} w={w} k={burn} /> : <Ger key={i} x={x} y={y} w={w} door="#3c3c50" lit={0.9} />)}
        {/* 달아나는 메르키트 (실루엣) */}
        {f > hit && <Shadow>{[0, 1, 2, 3].map((i) => <Char key={i} id="archer" x={600 + i * 260 + (i % 2 ? 1 : -1) * (f - hit) * 6} h={180} pose="shocked" flip={i % 2 === 0} bottom={120 + (i % 2) * 30} enter="none" beat="none" />)}</Shadow>}
        {/* 왼쪽 위 → (테무친 앞), 오른쪽 위 → (자무카 앞), 가운데 안쪽 → 앞으로 (토그릴 앞) */}
        {[1, 2].map((i) => <Rider key={`l${i}`} kind="mongol" x={lerp(p, 0, 1, -500, 380) - i * 150} y={lerp(p, 0, 1, 300, 640) - i * 40} w={lerp(p, 0, 1, 200, 300)} phase={i * 4} />)}
        <Rider kind="temujin" x={lerp(p, 0, 1, -360, 520)} y={lerp(p, 0, 1, 330, 660)} w={lerp(p, 0, 1, 240, 360)} phase={1} />
        {[1, 2].map((i) => <Rider key={`r${i}`} kind="mongol2" x={lerp(p, 0, 1, 2100, 1150) + i * 150} y={lerp(p, 0, 1, 300, 640) - i * 40} w={lerp(p, 0, 1, 200, 300)} flip phase={i * 5} />)}
        <Rider kind="jamukha" x={lerp(p, 0, 1, 1960, 1040)} y={lerp(p, 0, 1, 330, 660)} w={lerp(p, 0, 1, 240, 360)} flip phase={2} />
        <Rider kind="toghrul" x={lerp(p, 0, 1, 900, 760)} y={lerp(p, 0, 1, 420, 560)} w={lerp(p, 0, 1, 80, 300)} phase={3} />
        <Dust x={960} y={940} t={lerp(f, hit, hit + 40, 0, 1)} r={260} color="#3d3d3a" />
      </Cam>
      <SFX name="war_cry" at={hit - 10} vol={0.3} dur={60} />
      <SFX name="fire" at={hit} vol={0.3} dur={frames - hit} />
    </AbsoluteFill>
  );
};

// 8) c2_11 (전용 그림, 천천히): 불타는 진영 속 말 위의 테무친이 외침 → 어둠 속 보르테가 그 목소리를 알아들음 → 달려옴
//    → 테무친이 몸을 숙여 손을 뻗고, 보르테가 두 손으로 말고삐를 붙잡음(말 머리·고삐·손이 맞닿음) → 말 위로 끌어올려 함께 탐, 횃불 든 호위병들 사이로
// 말 탄 테무친 (오른쪽을 봄, 서 있는 말). (x,y) = 뒷발굽 땅, s 배율, lean 0~1 = 앞으로 숙임, reach 0~1 = 오른손을 아래로 뻗음, pillion 0~1 = 뒤에 탄 보르테
const BORTE = { robe: "#3f7a6a", dark: "#2f5f52", trim: "#d9b45a", boot: "#3a2b22" };
const Mounted = ({ x, y, s, lean = 0, reach = 0, pillion = 0, shout = false, step = 0 }: { x: number; y: number; s: number; lean?: number; reach?: number; pillion?: number; shout?: boolean; step?: number }) => {
  const f = useCurrentFrame();
  const L = lean * 26;
  const neck = rotP([222, -398], [228, -282], L);
  const hand = rotP([310 + reach * 110, -380 + reach * 100], [228, -282], L);
  const sw = Math.sin(step) * 14;
  return (
    <>
      <svg width={760 * s} height={720 * s} viewBox="-160 -640 760 720" style={{ position: "absolute", left: x - 160 * s, top: y - 640 * s, ...ink }}>
        <ellipse cx={200} cy={6} rx={220} ry={16} fill="rgba(0,0,0,0.3)" />
        <path d="M 64 -236 C 10 -228 -16 -160 -4 -86 C 20 -136 40 -176 76 -204 Z" fill={HORSE.mane} stroke={INK} strokeWidth={6} />
        <Leg d={`M 100 -176 Q ${76 - sw} -90 ${58 - sw} -4`} c={HORSE.dark} />
        <Leg d={`M 300 -170 Q ${300 + sw} -86 ${300 + sw} -4`} c={HORSE.dark} />
        <Leg d={`M 120 -170 Q ${104 + sw} -86 ${92 + sw} -4`} />
        <ellipse cx={210} cy={-214} rx={160} ry={74} fill={HORSE.coat} stroke={INK} strokeWidth={7} />
        <Leg d={`M 318 -176 Q ${330 - sw} -90 ${322 - sw} -4`} />
        <path d="M 296 -256 C 336 -306 356 -356 378 -392 L 440 -362 C 412 -312 392 -246 352 -186 Z" fill={HORSE.coat} stroke={INK} strokeWidth={7} />
        <path d="M 300 -262 C 330 -310 350 -360 372 -398" stroke={HORSE.mane} strokeWidth={22} fill="none" />
        <path d="M 372 -398 C 412 -432 476 -412 508 -370 C 520 -350 500 -328 476 -336 L 424 -346 Z" fill={HORSE.coat} stroke={INK} strokeWidth={7} />
        <path d="M 392 -414 L 384 -446 L 410 -420 Z" fill={HORSE.coat} stroke={INK} strokeWidth={5} />
        <circle cx={438} cy={-386} r={6} fill={INK} />
        {/* 굴레 */}
        <path d="M 420 -400 L 470 -340 M 440 -404 C 470 -380 490 -360 500 -350" stroke="#5a3a24" strokeWidth={6} fill="none" />
        <circle cx={480} cy={-346} r={7} fill="#c9a24a" stroke={INK} strokeWidth={3} />
        <path d="M 170 -284 C 200 -300 260 -300 290 -282 L 280 -250 L 180 -252 Z" fill="#8a3b2c" stroke={INK} strokeWidth={6} />
        {/* 뒤에 탄 보르테 */}
        {pillion > 0 && (
          <g opacity={pillion}>
            <Leg d="M 160 -282 Q 196 -250 192 -184" w={28} c={BORTE.dark} />
            <path d="M 126 -270 C 124 -330 132 -372 156 -392 C 182 -390 194 -356 194 -300 L 196 -268 Z" fill={BORTE.robe} stroke={INK} strokeWidth={7} />
            <path d="M 130 -300 L 194 -300" stroke={BORTE.trim} strokeWidth={9} />
            <Arm d="M 170 -370 C 196 -360 214 -340 226 -330" color={BORTE.robe} w={24} />
          </g>
        )}
        {/* 테무친 */}
        <g transform={`rotate(${L} 228 -282)`}>
          <Leg d="M 230 -282 Q 282 -250 270 -178" w={30} c={TEM.dark} />
          <ellipse cx={272} cy={-168} rx={22} ry={13} fill={TEM.boot} stroke={INK} strokeWidth={4} />
          <path d="M 190 -270 C 186 -330 196 -380 222 -400 C 248 -396 262 -360 262 -300 L 264 -268 Z" fill={TEM.robe} stroke={INK} strokeWidth={7} />
          <path d="M 196 -300 L 262 -300" stroke={TEM.trim} strokeWidth={10} />
          <Arm d="M 216 -372 C 240 -330 270 -320 300 -330" color={TEM.dark} w={24} />
          <circle cx={302} cy={-330} r={15} fill={SKIN} stroke={INK} strokeWidth={4} />
        </g>
        <Arm d={`M ${rotP([236, -376], [228, -282], L).join(" ")} Q ${(rotP([236, -376], [228, -282], L)[0] + hand[0]) / 2 + 20} ${(rotP([236, -376], [228, -282], L)[1] + hand[1]) / 2 - 30} ${hand[0]} ${hand[1]}`} color={TEM.robe} w={26} />
        <circle cx={hand[0]} cy={hand[1]} r={16} fill={SKIN} stroke={INK} strokeWidth={4} />
      </svg>
      {pillion > 0 && <div style={{ opacity: pillion }}><Head id="borte" pose="front" x={x + 156 * s} y={y - 394 * s} s={s * 0.42} /></div>}
      <Head id="temujin_young" pose={shout ? "angry" : "front"} x={x + neck[0] * s} y={y + neck[1] * s} s={s * 0.42} rot={L * 0.6} mouth={shout ? ["2", "1", "2", "2"][Math.floor(f / 5) % 4] : "0"} />
    </>
  );
};
// 고삐를 두 손으로 붙잡은 보르테 (전용 그림, 왼쪽 말 머리 쪽을 봄). (x,y) = 발 아래 땅, (gx,gy) = 두 손(고삐) 위치
const ReachBorte = ({ x, y, s, gx, gy, run = 0 }: { x: number; y: number; s: number; gx: number; gy: number; run?: number }) => {
  const ny = y - 330 * s; // 목 (s 0.56이면 Char 키 470과 비슷)
  const sh = [x - 20 * s, ny + 30 * s];
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
        <ellipse cx={x} cy={y} rx={90 * s} ry={14 * s} fill="rgba(0,0,0,0.3)" />
        <path d={`M ${x - 46 * s} ${ny + 10 * s} C ${x - 70 * s} ${ny + 120 * s} ${x - 96 * s} ${y - 40 * s} ${x - 110 * s - run * 20 * s} ${y} L ${x + 80 * s} ${y} C ${x + 70 * s} ${y - 80 * s} ${x + 50 * s} ${ny + 120 * s} ${x + 40 * s} ${ny + 10 * s} Z`} fill={BORTE.robe} stroke={INK} strokeWidth={7} />
        <path d={`M ${x - 56 * s} ${ny + 150 * s} L ${x + 52 * s} ${ny + 150 * s}`} stroke={BORTE.trim} strokeWidth={10 * s} />
        <Arm d={`M ${sh[0]} ${sh[1]} Q ${(sh[0] + gx) / 2} ${(sh[1] + gy) / 2 + 30 * s} ${gx + 18 * s} ${gy + 6 * s}`} color={BORTE.dark} w={26 * s} />
        <Arm d={`M ${x + 20 * s} ${sh[1]} Q ${(x + gx) / 2} ${(sh[1] + gy) / 2 + 40 * s} ${gx - 6 * s} ${gy + 14 * s}`} color={BORTE.robe} w={26 * s} />
        <circle cx={gx + 18 * s} cy={gy + 6 * s} r={15 * s} fill={SKIN} stroke={INK} strokeWidth={4} />
        <circle cx={gx - 6 * s} cy={gy + 14 * s} r={15 * s} fill={SKIN} stroke={INK} strokeWidth={4} />
      </svg>
      <Head id="borte" pose="shocked" x={x - 6 * s} y={ny} s={s * 1.0} rot={-8} flip />
    </>
  );
};
const S8 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const hear = sec(2.55); // "그 목소리를 알아들은 보르테가"
  const runAt = sec(5.95); // "어둠 속에서 달려와"
  const grab = sec(8.1); // "그의 말고삐를 붙잡습니다"
  const pullAt = grab + 46;
  const seated = pullAt + 30;
  // 말·테무친 자리
  const HX = 380, HY = 930, HS = 1.15;
  const bridle = [HX + 480 * HS, HY - 346 * HS];
  if (f >= hear && f < runAt) {
    // 어둠 속의 보르테: 불빛 한 줄이 얼굴에, 목소리 쪽으로 고개를 듦
    const t = f - hear;
    return (
      <AbsoluteFill>
        <Cam z={lerp(t, 0, runAt - hear, 1.25, 1.45)} cx={1100} cy={560}>
          <Steppe time="night" horizon={560} />
          <Burning x={300} y={620} w={240} />
          <Shadow>{[0, 1, 2].map((i) => <Char key={i} id="archer" x={600 + i * 260 + Math.sin((f + i * 20) / 10) * 30} h={300} pose="shocked" flip={i % 2 === 0} bottom={220} enter="none" beat="none" />)}</Shadow>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 22% 36% at 57% 52%, rgba(0,0,0,0) 30%, rgba(5,4,3,0.75))" }} />
          <Glow x={1100} y={520} r={260} color="#f0a060" op={0.45} />
          <Char id="borte" x={1100} h={520} pose={t > 26 ? "shocked" : "sad"} flip bottom={170} enter="none" beat={t > 26 ? "jump" : "none"} beatAt={26} />
        </Cam>
        <Dim op={0.15} />
      </AbsoluteFill>
    );
  }
  // 말 위의 테무친 (같은 자리) - 외침 → 숙여 손을 뻗음 → 보르테가 고삐를 잡음 → 끌어올림
  const lean = f < runAt ? 0 : lerp(f, runAt + 20, grab, 0, 1, true) * (1 - lerp(f, pullAt, seated, 0, 1, true));
  const reach = lean;
  const pillion = lerp(f, seated - 6, seated, 0, 1);
  const runK = lerp(f, runAt, grab, 0, 1, true);
  const bx = lerp(runK, 0, 1, 2050, bridle[0] + 130);
  const bob = f < grab ? Math.abs(Math.sin((f - runAt) / 5)) * 14 : 0;
  const pull = lerp(f, pullAt, seated, 0, 1, true);
  const slow = f >= grab - 20;
  const z = f < runAt ? 1.05 : slow ? lerp(f, grab - 20, pullAt, 1.1, 1.35, true) : 1.1;
  const cx = slow ? lerp(f, grab - 20, pullAt, 960, bridle[0], true) : 960;
  const step = f >= seated ? (f - seated) / 4 : 0;
  const walk = f >= seated ? (f - seated) * 2 : 0;
  const spot = lerp(f, runAt, grab, 0.2, 0.7);
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={f >= seated ? lerp(f, seated, frames, 560, 520) : 600} sx={f < hear ? Math.sin(f * 0.9) * 3 : 0}>
        <Steppe time="night" horizon={560} />
        <Burning x={220} y={620} w={260} />
        <Burning x={1680} y={600} w={220} />
        {/* 둘레 혼란 (멀리 달리는 실루엣 기병) */}
        {f < grab && [0, 1, 2].map((i) => <Rider key={i} kind={i % 2 ? "merkit" : "mongol"} x={((f * 6 + i * 700) % 2600) - 600} y={470 + i * 30} w={150} flip={i % 2 === 1} phase={i * 3} dark />)}
        {/* 함께 탄 뒤: 횃불 든 테무친의 호위병들이 둘레로 */}
        {f >= seated - 10 && (
          <div style={{ position: "absolute", inset: 0, opacity: lerp(f, seated - 10, seated + 10, 0, 1) }}>
            <Guard x={1350} h={460} bottom={200} flip />
            <Guard x={1560} h={440} bottom={220} flip />
            <Torch x={1270} y={560} s={0.9} />
            <Glow x={1270} y={540} r={200} color="#f3a24e" op={0.5} />
          </div>
        )}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 55% at 50% 60%, rgba(0,0,0,0) 40%, rgba(5,4,3,${spot}))` }} />
        <Glow x={bridle[0]} y={bridle[1] + 120} r={460} op={0.3} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${walk}px)` }}>
          <Mounted x={HX} y={HY} s={HS} lean={lean} reach={reach} pillion={pillion} shout={f < hear} step={step} />
          {/* 외침: 퍼지는 물결 */}
          {f < hear && [0, 1].map((i) => {
            const t = ((f / 20) + i * 0.5) % 1;
            return <div key={i} style={{ position: "absolute", left: HX + 230 * HS - 60 - t * 160, top: HY - 420 * HS - 60 - t * 160, width: 120 + t * 320, height: 120 + t * 320, borderRadius: "50%", border: `6px solid rgba(243,223,176,${0.7 * (1 - t)})` }} />;
          })}
          {/* 고삐 줄: 굴레 → (보르테의 두 손) */}
          {f >= grab - 6 && f < seated && (
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d={`M ${bridle[0]} ${bridle[1]} Q ${bridle[0] + 20} ${bridle[1] + 90} ${bridle[0] + 70} ${bridle[1] + 116}`} stroke={INK} strokeWidth={8} fill="none" />
              <path d={`M ${bridle[0]} ${bridle[1]} Q ${bridle[0] + 20} ${bridle[1] + 90} ${bridle[0] + 70} ${bridle[1] + 116}`} stroke="#8a6440" strokeWidth={4} fill="none" />
            </svg>
          )}
          {/* 보르테: 달려옴 → 두 손으로 고삐 → 말 위로 끌려 올라감 */}
          {f >= runAt && f < grab && (
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${-bob}px)` }}>
              <Char id="borte" x={bx} h={470} pose="shocked" flip bottom={150} enter="none" beat="none" />
            </div>
          )}
          {f >= grab && f < seated && (
            <div style={{ position: "absolute", inset: 0, transform: `translate(${-pull * 520}px, ${-Math.sin(Math.PI * pull) * 160 - pull * 120}px) scale(${1 - pull * 0.4}) rotate(${-pull * 20}deg)`, transformOrigin: `${bridle[0] + 130}px ${HY}px`, opacity: 1 - lerp(f, seated - 8, seated, 0, 1) }}>
              <ReachBorte x={bridle[0] + 130} y={HY} s={0.64} gx={bridle[0] + 70} gy={bridle[1] + 110} />
            </div>
          )}
        </div>
      </Cam>
      <SFX name="crowd" at={0} vol={0.25} dur={hear} />
      <SFX name="neigh" at={grab - 2} vol={0.25} dur={50} />
    </AbsoluteFill>
  );
};

// 9a) c2_12 함께 지낸 1년 반 (⏸3, 천천히): 같은 진영을 고정해 두고 계절이 바뀜 - 풀빛 여름 → 단풍 가을 → 눈 덮인 겨울 → 새싹 봄 → 다시 여름
//     그동안 두 의형제가 함께: 여름 모닥불가 식사 · 가을 함께 말 달려 사냥 · 겨울 눈 속 모닥불 · 봄 나란히 활쏘기
const SEASON = [
  { sky: ["#e9dcbc", "#efe4c8"], land: ["#a9b86e", "#8fa05a"], leaf: "#5f8a46", snow: 0 },
  { sky: ["#e6cfa4", "#efd9b0"], land: ["#c9a35a", "#b08840"], leaf: "#c8762e", snow: 0 },
  { sky: ["#c9d0d6", "#e4e6e6"], land: ["#eef0ee", "#dfe3e3"], leaf: "#6a5a4a", snow: 1 },
  { sky: ["#dfe6d0", "#eef0dc"], land: ["#b9c88a", "#a3b672"], leaf: "#8cbf5a", snow: 0 },
  { sky: ["#e9dcbc", "#efe4c8"], land: ["#a9b86e", "#8fa05a"], leaf: "#5f8a46", snow: 0 },
];
const SeasonBg = ({ i, horizon = 600 }: { i: number; horizon?: number }) => {
  const S = SEASON[i];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${S.sky[0]}, ${S.sky[1]} ${horizon / 10.8}%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d={`M 0 ${horizon - 40} C 300 ${horizon - 110} 520 ${horizon - 90} 760 ${horizon - 40} C 1000 ${horizon} 1300 ${horizon - 120} 1920 ${horizon - 60} L 1920 1080 L 0 1080 Z`} fill={S.snow ? "#f4f4f2" : S.land[0]} stroke={INK} strokeWidth={4} opacity={0.9} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: horizon, bottom: 0, background: `linear-gradient(${S.land[0]}, ${S.land[1]})`, borderTop: `5px solid ${INK}` }} />
      {/* 나무 한 그루 (잎 색이 계절 따라) */}
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M 1640 760 L 1640 520 M 1640 600 L 1590 540 M 1640 580 L 1700 520" stroke="#5a3a24" strokeWidth={16} />
        {i !== 2 && <ellipse cx={1640} cy={480} rx={130} ry={100} fill={S.leaf} stroke={INK} strokeWidth={5} />}
        {i === 2 && <path d="M 1560 470 C 1600 440 1680 440 1720 470" stroke="#f4f4f2" strokeWidth={14} fill="none" />}
      </svg>
    </AbsoluteFill>
  );
};
const Seasons = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const n = SEASON.length;
  const seg = frames / n;
  const i = Math.min(n - 1, Math.floor(f / seg));
  const local = f - i * seg;
  const fade = i < n - 1 ? lerp(local, seg - 16, seg, 0, 1) : 0;
  const snowK = i === 2 ? 1 : i === 1 ? fade : i === 3 ? 1 - lerp(local, 0, 16, 0, 1) : 0;
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.06)} cx={960} cy={600}>
        <SeasonBg i={i} />
        {fade > 0 && <AbsoluteFill style={{ opacity: fade }}><SeasonBg i={i + 1} /></AbsoluteFill>}
        {/* 같은 진영 (게르 셋, 툭 둘) - 겨울엔 지붕에 눈 */}
        {[[360, 700, 260], [700, 680, 220], [1180, 690, 240]].map(([x, y, w], k) => (
          <React.Fragment key={k}>
            <Ger x={x} y={y} w={w} door={k === 1 ? "#4f6e55" : "#4d6b8a"} lit={i === 2 ? 0.8 : 0} />
            {snowK > 0 && (
              <svg width={w} height={w * 0.5} viewBox="0 0 260 130" style={{ position: "absolute", left: x - w / 2, top: y - w * 0.75 + 30 * (w / 260), opacity: snowK, ...ink }}>
                <path d="M 14 82 C 60 18 200 18 246 82 C 220 70 200 76 180 68 C 150 76 120 64 90 72 C 60 64 40 76 14 82 Z" fill="#fbfbf8" stroke={INK} strokeWidth={4} />
              </svg>
            )}
          </React.Fragment>
        ))}
        <Tug x={540} y={720} h={300} color="#f2ead8" sway={Math.sin(f / 14) * 5} />
        <Tug x={960} y={720} h={300} color="#4f6e55" sway={Math.sin(f / 13) * 5} />
        {/* 계절마다 두 사람 */}
        {(i === 0 || i === 4 || i === 2) && (
          <>
            <Fire x={960} y={920} s={0.9} />
            <Char id="temujin_young" x={760} h={480} pose="happy" bottom={140} enter="none" beat="hop" beatAt={Math.round(i * seg) + 20} />
            <Char id="jamukha" x={1160} h={500} pose="happy" flip bottom={140} enter="none" beat="hop" beatAt={Math.round(i * seg) + 28} />
          </>
        )}
        {i === 1 && (
          <>
            <Rider kind="temujin" x={lerp(local, 0, seg, -400, 1200)} y={560} w={360} phase={0} />
            <Rider kind="jamukha" x={lerp(local, 0, seg, -700, 900)} y={600} w={360} phase={6} />
            <svg width={120} height={70} viewBox="0 0 120 70" style={{ position: "absolute", left: lerp(local, 0, seg, 1300, 1900), top: 820, ...ink }}>
              <path d="M 20 40 C 30 20 80 18 96 34 L 112 26 L 108 44 L 96 46 C 80 60 40 60 20 52 Z" fill="#b08860" stroke={INK} strokeWidth={4} />
            </svg>
          </>
        )}
        {i === 3 && (
          <>
            <Char id="temujin_young" x={760} h={480} pose="front" bottom={140} enter="none" gesture="fist" gestureAt={Math.round(i * seg) + 6} />
            <Char id="jamukha" x={1000} h={500} pose="happy" bottom={140} enter="none" gesture="point" gestureAt={Math.round(i * seg) + 10} />
            <svg width={60} height={260} viewBox="0 0 60 260" style={{ position: "absolute", left: 1500, top: 640, ...ink }}>
              <path d="M 30 260 L 30 40" stroke="#6a4a2e" strokeWidth={8} />
              <circle cx={30} cy={40} r={30} fill="#efe6d4" stroke={INK} strokeWidth={4} />
              <circle cx={30} cy={40} r={14} fill="#a8332a" stroke={INK} strokeWidth={3} />
            </svg>
            <Arrow x={lerp(local, 10, 30, 1150, 1520)} y={lerp(local, 10, 30, 720, 680)} w={140} rot={-4} />
          </>
        )}
        {/* 가을 낙엽 · 겨울 눈 */}
        {(i === 1 || i === 2) && Array.from({ length: 26 }).map((_, k) => {
          const t = ((f * (i === 2 ? 1.6 : 2.4) + k * 97) % 1100);
          const xx = (k * 151 + Math.sin((f + k * 20) / 20) * 40) % 1920;
          return i === 2 ? <div key={k} style={{ position: "absolute", left: xx, top: t - 40, width: 10, height: 10, borderRadius: "50%", background: "#fbfbf8" }} /> : <div key={k} style={{ position: "absolute", left: xx, top: t - 40, width: 18, height: 10, borderRadius: "50% 0", background: k % 2 ? "#c8762e" : "#b9542a", transform: `rotate(${f * 6 + k * 40}deg)` }} />;
        })}
      </Cam>
      <SFX name="wind" at={Math.round(2 * seg)} vol={0.18} dur={Math.round(seg)} />
    </AbsoluteFill>
  );
};

// 9) c2_12~15 함께 지내던 진영이 둘로 갈라짐: 왼쪽 귀족들 곁의 자무카 vs 오른쪽 목동·노예 곁의 테무친, 정면으로 마주 봄. 말하는 쪽으로 카메라, 끝에 칼을 겨눔
const S9 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const split = sec(0.5); // "하지만 둘이 원하는 것은" (c2_13 시작)
  const a13 = at("c2_14");
  const a14 = at("c2_15");
  const a15 = at("c2_16");
  const swords = a15 + sec(5.6); // "결국 두 의형제는"
  const apart = lerp(f, split, split + 40, 0, 1, true);
  const draw = lerp(f, split, split + 20, 0, 1);
  // 함께 지낸 1년 반: 하늘 낮 → 노을 → 밤 → 낮 (숫자 없이 시간이 흐름)
  const time = "dusk" as const;
  // 카메라: 갈라지기 전 가운데 → 자무카(왼쪽) → 테무친(오른쪽) → 넓게 → 칼 둘
  let cx = 960;
  let z = 1;
  if (f >= a13 && f < a14) { cx = lerp(f, a13, a13 + 20, 960, 600, true); z = lerp(f, a13, a13 + 20, 1, 1.3, true); }
  else if (f >= a14 && f < a15) { cx = lerp(f, a14, a14 + 20, 600, 1320, true); z = 1.3; }
  else if (f >= a15 && f < swords) { cx = lerp(f, a15, a15 + 24, 1320, 960, true); z = lerp(f, a15, a15 + 24, 1.3, 1.0, true); }
  else if (f >= swords) { z = lerp(f, swords, swords + 16, 1.0, 1.4, true); cx = 960; }
  const gather = lerp(f, a15, a15 + sec(4), 0, 1);
  const sw = lerp(f, swords, swords + 10, 0, 1, true);
  const sh = shake(f, swords + 10, 10, 24);
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={600} sx={sh.x} sy={sh.y}>
        <Steppe time={time} horizon={600} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-apart * 220}px)` }}>
          <Ger x={420} y={700} w={240} door="#c9a24a" />
          {/* 귀족들: 타이치우드 족장 + 금빛 실루엣 */}
          {apart > 0.3 && <Char id="taichiud_chief" x={330} h={520} pose="smug" bottom={160} enter="pop" delay={split + 24} />}
          {(apart > 0.3 || gather > 0) && <Shadow gold>{apart > 0.3 && <><Char id="taichiud_chief" x={180 - gather * 40} h={470} pose="smug" bottom={190} enter="pop" delay={split + 30} /><Char id="taichiud_chief" x={490} h={440} pose="front" bottom={200} enter="pop" delay={split + 36} /></>}{gather > 0 && <><Char id="taichiud_chief" x={-60 + gather * 140} h={430} pose="smug" bottom={210} enter="none" beat="none" /></>}</Shadow>}
          <Char id="jamukha" x={760} h={560} pose={f < split ? "happy" : f >= swords ? "angry" : "smug"} flip={false} talking={talkingAt(f, a13, "c2_14")} gesture={f >= a13 && f < a14 ? "point" : undefined} gestureAt={a13 + 4} bottom={150} enter="none" beat={f >= swords ? "shake" : "none"} beatAt={swords + 10} />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${apart * 220}px)` }}>
          <Ger x={1520} y={700} w={220} door="#7a6a5a" />
          {/* 목동·노예: 작은 실루엣 + 양 */}
          {(apart > 0.3 || gather > 0) && <Shadow lv={0.3}>{apart > 0.3 && <><Char id="archer" x={1500} h={360} pose="sad" flip bottom={170} enter="pop" delay={split + 24} /><Char id="archer" x={1650} h={340} pose="front" flip bottom={190} enter="pop" delay={split + 30} /></>}{gather > 0 && <><Char id="archer" x={1980 - gather * 200} h={330} pose="happy" flip bottom={200} enter="none" beat="none" /><Char id="archer" x={2100 - gather * 220} h={320} pose="front" flip bottom={180} enter="none" beat="none" /></>}</Shadow>}
          {apart > 0.3 && [[1440, 930], [1580, 950], [1720, 925], [1840 - gather * 60, 945]].map(([x, y], i) => <Sheep key={i} x={x} y={y} s={0.9} flip={i % 2 === 0} />)}
          <Char id="temujin_young" x={1160} h={540} pose={f < split ? "happy" : f >= a14 || f >= swords ? "angry" : "front"} flip talking={talkingAt(f, a14, "c2_15")} gesture={f >= a14 && f < a15 ? "fist" : undefined} gestureAt={a14 + 4} bottom={150} enter="none" beat={f >= swords ? "shake" : "none"} beatAt={swords + 10} />
        </div>
        {/* 갈라지는 땅 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 960 1080 L 930 990 L 985 900 L 940 800 L 990 700 L 955 610" stroke={INK} strokeWidth={12} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </svg>
        {/* 칼을 겨눔 */}
        {sw > 0 && (
          <>
            <Sword x={760 - 220 + 120} y={700} rot={lerp(sw, 0, 1, -10, 62)} s={1.1} />
            <Sword x={1160 + 220 - 120} y={700} rot={lerp(sw, 0, 1, 10, -62)} s={1.1} />
          </>
        )}
      </Cam>
      <SFX name="impact" at={split} vol={0.3} dur={40} />
      <SFX name="sword" at={swords + 6} vol={0.4} dur={40} />
    </AbsoluteFill>
  );
};

// 10) c2_16 1187 달란 발주트: 두 기병대가 양쪽에서 맞부딪침 → 말 위의 테무친과 자무카가 얼굴을 맞댐(크게, 멈춘 듯) → 테무친 쪽이 밀려 달아남
const S10 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const meet = 34;
  const lose = sec(3.4);
  if (f < meet) {
    const p = lerp(f, 0, meet, 0, 1);
    return (
      <AbsoluteFill>
        <Steppe time="day" horizon={500} />
        {Array.from({ length: 7 }).map((_, i) => <Rider key={`t${i}`} kind={i === 3 ? "temujin" : "mongol"} x={lerp(p, 0, 1, -700, 380) - (i % 4) * 160} y={480 + (i % 3) * 120} w={i === 3 ? 340 : 280} phase={i * 3} />)}
        {Array.from({ length: 7 }).map((_, i) => <Rider key={`j${i}`} kind={i === 3 ? "jamukha" : "mongol2"} x={lerp(p, 0, 1, 2300, 1200) + (i % 4) * 160} y={480 + (i % 3) * 120} w={i === 3 ? 340 : 280} flip phase={i * 4} />)}
        <BigNum text="1187" at={2} size={170} y={-390} />
        <SFX name="cavalry" at={0} vol={0.35} dur={meet} />
      </AbsoluteFill>
    );
  }
  const g = f - meet;
  const sh = shake(g, 0, 18, 30);
  if (f < lose) {
    // 얼굴을 맞댐: 두 말 탄 인물 크게, 둘 사이 먼지
    const push = lerp(g, 0, lose - meet, 0, 40);
    return (
      <AbsoluteFill>
        <Cam z={lerp(g, 0, lose - meet, 1.0, 1.12)} cx={960} cy={480} sx={sh.x} sy={sh.y}>
          <Steppe time="day" horizon={620} />
          <Rider kind="temujin" x={-60 - push} y={250} w={980} phase={0} still />
          <Rider kind="jamukha" x={1000 - push} y={250} w={980} flip phase={0} still />
          <Dust x={960} y={940} t={lerp(g, 0, 40, 0.05, 0.9)} r={240} />
        </Cam>
        <SFX name="swords" at={0} vol={0.4} dur={60} />
      </AbsoluteFill>
    );
  }
  const h = f - lose;
  return (
    <AbsoluteFill>
      <Cam z={1.0} cx={960} cy={540}>
        <Steppe time="day" horizon={500} />
        {Array.from({ length: 6 }).map((_, i) => <Rider key={`t${i}`} kind={i === 2 ? "temujin" : "mongol"} x={600 - (i % 3) * 170 - h * 11} y={520 + Math.floor(i / 3) * 170} w={260} flip phase={i * 3} />)}
        {Array.from({ length: 8 }).map((_, i) => <Rider key={`j${i}`} kind={i === 3 ? "jamukha" : "mongol2"} x={1250 + (i % 4) * 170 - h * 8} y={480 + Math.floor(i / 4) * 190} w={270} flip phase={i * 4} />)}
        <Dust x={700 - h * 9} y={900} t={(h % 20) / 20} r={160} />
      </Cam>
    </AbsoluteFill>
  );
};

// 11) c2_17 밤, 줄지어 끓는 가마솥들 - 포로 실루엣이 사다리로 끌려 올라가 솥 안으로 사라짐 (피·상처 없이). 앞에 어두운 자무카
const POTS = [{ x: 620, y: 700, s: 0.75 }, { x: 1080, y: 680, s: 0.62 }, { x: 1460, y: 665, s: 0.5 }];
const S11 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={1000} cy={600}>
        <Steppe time="night" horizon={600} />
        {POTS.map((p, i) => {
          const t = lerp(f, 18 + i * 22, 18 + i * 22 + 70, 0, 1);
          // 포로: 사다리 아래 → 사다리 위(솥 가장자리) → 솥 안으로 (솥 앞면에 가려짐)
          const up = Math.min(1, t / 0.75);
          const down = Math.max(0, (t - 0.75) / 0.25);
          const fx = p.x - 190 * p.s + up * 130 * p.s + down * 120 * p.s;
          const fy = p.y + 280 * p.s - up * 300 * p.s + down * 120 * p.s;
          const px = fx;
          const ph = 260 * p.s;
          const pb = 1080 - fy;
          return (
            <React.Fragment key={i}>
              <Fire x={p.x} y={p.y + 250 * p.s} s={p.s * 1.3} />
              <CauldronBack x={p.x} y={p.y} s={p.s} />
              {t > 0 && t < 1 && (
                <Shadow>
                  <div style={{ position: "absolute", inset: 0, transform: `rotate(${down * 12}deg)`, transformOrigin: `${px}px ${1080 - pb}px` }}>
                    <Char id="archer" x={px} h={ph} pose="shocked" bottom={pb} enter="none" beat="none" />
                  </div>
                </Shadow>
              )}
              <CauldronFront x={p.x} y={p.y} s={p.s} />
              {/* 사다리 */}
              <svg width={200 * p.s} height={300 * p.s} viewBox="0 0 200 300" style={{ position: "absolute", left: p.x - 230 * p.s, top: p.y - 20 * p.s, ...ink }}>
                <path d="M 20 300 L 150 10 M 60 300 L 190 10" stroke="#5a3a24" strokeWidth={10} />
                {[60, 120, 180, 240].map((yy) => <path key={yy} d={`M ${20 + (300 - yy) * 0.43} ${yy} L ${60 + (300 - yy) * 0.43} ${yy}`} stroke="#5a3a24" strokeWidth={8} />)}
              </svg>
            </React.Fragment>
          );
        })}
        {/* 앞의 자무카 (어둡게, 불빛만) */}
        <div style={{ position: "absolute", inset: 0, filter: "brightness(0.45)" }}>
          <Char id="jamukha" x={230} h={640} pose="front" bottom={60} enter="none" />
        </div>
        <Glow x={300} y={600} r={260} color="#f08a3a" op={0.25} />
      </Cam>
      <SFX name="fire" at={0} vol={0.3} dur={frames} />
    </AbsoluteFill>
  );
};

// 12) c2_18 낮: 자무카 진영 사람들이 하나둘 짐을 지고 테무친 쪽으로 - 카메라가 무리를 따라 오른쪽으로 흐름 → 다시 자무카: 텅 빈 진영에 황당 😏
const S12 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const go = sec(2.4);
  const back = sec(4.6);
  if (f < back) {
    const pan = lerp(f, go, back, 0, 1500, true);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${-pan}px)` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 3500, height: 1080 }}>
            <AbsoluteFill style={{ width: 3500 }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#e9dcbc, #efe4c8 55%)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 600, bottom: 0, background: "linear-gradient(#c9b07c, #b89a62)", borderTop: `5px solid ${INK}` }} />
            </AbsoluteFill>
            <Ger x={300} y={700} w={240} door="#c9a24a" />
            <Ger x={2900} y={700} w={240} door="#8a3b2c" />
            <Char id="jamukha" x={420} h={560} pose="smug" bottom={150} enter="none" />
            <Char id="temujin_young" x={2700} h={540} pose={f > back - 30 ? "happy" : "sad"} flip bottom={150} enter="none" beat={f > back - 30 ? "hop" : "none"} beatAt={back - 30} />
            {Array.from({ length: 7 }).map((_, i) => {
              const w = lerp(f, go - 20 + i * 6, back + i * 4, 0, 1);
              const x = 700 + i * 110 + w * 1600;
              const hop = w > 0 && w < 1 ? Math.abs(Math.sin((f + i * 7) / 4)) * 10 : 0;
              return (
                <React.Fragment key={i}>
                  <svg width={120} height={90} viewBox="0 0 120 90" style={{ position: "absolute", left: x - 150, top: 1080 - 170 - (i % 3) * 14 - 200 - (i % 2) * 14 - hop, ...ink }}>
                    <path d="M 10 30 C 10 6 110 6 110 30 L 104 84 L 16 84 Z" fill="#d8c8a0" stroke={INK} strokeWidth={4} />
                    <path d="M 10 44 L 110 44" stroke="#8a6440" strokeWidth={5} />
                  </svg>
                  <Char id="archer" x={x} h={300 + (i % 2) * 20} pose={w > 0.9 ? "happy" : "front"} bottom={170 + (i % 3) * 14 + hop} enter="none" beat="none" />
                </React.Fragment>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  // 텅 빈 자무카 진영
  const g = f - back;
  return (
    <AbsoluteFill>
      <Cam z={lerp(g, 0, frames - back, 1.15, 1.25)} cx={700} cy={620}>
        <Steppe time="day" horizon={600} />
        <Ger x={300} y={700} w={240} door="#c9a24a" />
        <Char id="jamukha" x={700} h={560} pose="shocked" bottom={150} enter="none" beat="jump" beatAt={4} />
        {/* 굴러가는 마른풀 */}
        <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: "absolute", left: 1500 - g * 9, top: 820, transform: `rotate(${-g * 9}deg)`, ...ink }}>
          {[0, 40, 80, 120, 160].map((a) => <ellipse key={a} cx={60} cy={60} rx={50} ry={22} transform={`rotate(${a} 60 60)`} fill="none" stroke="#8a6a3a" strokeWidth={5} />)}
        </svg>
      </Cam>
      <SFX name="wind" at={0} vol={0.3} dur={frames - back} />
    </AbsoluteFill>
  );
};

// 13) c2_19 1201 타이치우드와의 전투 (전용 그림): 달리는 테무친 → 숲에서 날아오는 화살 클로즈업 → 화살 맞은 말이 앞발을 들고 일어서고 테무친이 균형을 잃음
//     → 흙먼지 속에 쓰러진 말과 땅에 떨어진 테무친. 피·흰 번쩍임 없이 흔들림·먼지로
const S13 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const shot = sec(3.6); // "그때 숲에서 날아온 화살"
  const rearAt = shot + 30;
  const down = sec(6.0); // "테무친의 말을 쓰러뜨립니다"
  if (f < shot) {
    const scroll = f * 10;
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, shot, 1.0, 1.08)} cx={900} cy={620}>
          <Steppe time="day" horizon={540} hills={false} />
          <Trees x0={1420} y={560} n={6} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {Array.from({ length: 16 }).map((_, i) => {
              const x = ((((i * 173 - scroll) % 2100) + 2100) % 2100) - 90;
              return <path key={i} d={`M ${x} ${860 + (i % 3) * 60} l 14 -34 l 10 30 l 12 -24`} stroke="#7d6a40" strokeWidth={5} fill="none" />;
            })}
          </svg>
          {[0, 1, 2].map((i) => <Rider key={`e${i}`} kind="mongol2" x={1250 + i * 160 - f * 1.5} y={470 + i * 24} w={150} flip phase={i * 4} />)}
          {[0, 1].map((i) => <Rider key={`m${i}`} kind="mongol" x={180 - i * 200} y={480 + i * 60} w={360} phase={i * 6 + 3} />)}
          <Rider kind="temujin" x={560} y={420} w={520} phase={0} />
          <Dust x={600} y={900} t={(f % 18) / 18} r={120} />
        </Cam>
        <BigNum text="1201" at={2} size={170} y={-390} />
        <SFX name="battle_far" at={0} vol={0.25} dur={shot} />
      </AbsoluteFill>
    );
  }
  if (f < rearAt) {
    // 화살 클로즈업: 흐린 숲 앞을 큰 화살이 오른쪽 → 왼쪽으로 (조금 느리게)
    const t = f - shot;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: "linear-gradient(#e9dcbc, #d8c69c)" }} />
        <div style={{ position: "absolute", inset: 0, filter: "blur(6px)", opacity: 0.8 }}>
          <Trees x0={-60} y={1080} n={22} />
        </div>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: lerp(t, 0, 30, 2100, -900) + 260 + i * 60, top: 520 + (i - 1.5) * 26, width: 420 - i * 60, height: 4, background: "rgba(43,29,20,0.35)" }} />)}
        <Arrow x={lerp(t, 0, 30, 2200, -400)} y={540} w={720} rot={180} />
        <SFX name="swish" at={0} vol={0.4} dur={24} />
      </AbsoluteFill>
    );
  }
  if (f < down) {
    const t = f - rearAt;
    const rear = lerp(t, 0, 10, 0, 1, true);
    const lean = lerp(t, 4, 26, 0, 1, true);
    const sh = shake(t, 0, 14, 36);
    return (
      <AbsoluteFill>
        <Cam z={lerp(t, 0, down - rearAt, 1.05, 1.18)} cx={980} cy={560} sx={sh.x} sy={sh.y}>
          <Steppe time="day" horizon={600} hills={false} />
          <Trees x0={1500} y={620} n={5} />
          <RearingRide x={760} y={930} s={1.15} rear={rear} lean={lean} />
          <Dust x={900} y={930} t={lerp(t, 0, 40, 0.05, 0.8)} r={200} />
        </Cam>
        <SFX name="arrow_hit" at={0} vol={0.45} dur={30} />
        <SFX name="neigh" at={2} vol={0.4} dur={60} />
      </AbsoluteFill>
    );
  }
  const t = f - down;
  const sh = shake(t, 0, 12, 26);
  return (
    <AbsoluteFill>
      <Cam z={lerp(t, 0, frames - down, 1.12, 1.2)} cx={960} cy={700} sx={sh.x} sy={sh.y}>
        <Steppe time="day" horizon={560} hills={false} />
        <Trees x0={1500} y={580} n={5} />
        <FallenHorse x={640} y={880} s={1.05} breathe={Math.sin(t / 8) * 3} />
        <FallenMan x={1560} y={830} s={1.0} pose={t > 30 ? "angry" : "shocked"} />
        <Dust x={900} y={880} t={lerp(t, 0, 60, 0.1, 0.95)} r={260} />
        <Dust x={1300} y={900} t={lerp(t, 4, 50, 0.1, 0.95)} r={160} />
      </Cam>
      <SFX name="impact" at={0} vol={0.4} dur={30} />
    </AbsoluteFill>
  );
};

// 14) c2_20 활을 든 궁수(제베)가 싸움이 기울자 활을 내리고 숲으로 달아남 → 병사들이 쫓아 들어가 → 묶어 끌고 나옴(활은 병사가 듦)
const S14 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const caught = sec(3.5);
  const turnAt = 26;
  const flee = lerp(f, turnAt, caught - 16, 0, 1);
  const out = lerp(f, caught, frames - 10, 0, 1, true);
  return (
    <AbsoluteFill>
      <Steppe time="dusk" horizon={560} />
      <Trees x0={980} y={640} n={9} dark />
      {f < caught ? (
        <>
          {/* 제베: 숲 가장자리에서 활을 들고 서 있다가 → 돌아서 숲으로 (작아지며 오른쪽 위로) */}
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${f >= turnAt ? -Math.abs(Math.sin(f / 4)) * 12 : 0}px)`, opacity: lerp(flee, 0.85, 1, 1, 0) }}>
            {(() => {
              const x = lerp(flee, 0, 1, 700, 1350);
              const h = lerp(flee, 0, 1, 480, 220);
              const b = lerp(flee, 0, 1, 160, 440);
              return (
                <>
                  <Char id="jebe" x={x} h={h} pose={f < turnAt ? "angry" : "shocked"} flip={f >= turnAt} bottom={b} enter="none" beat="none" />
                  <Bow x={x + (f >= turnAt ? -1 : 1) * h * 0.26} y={1080 - b - h * 0.42} h={h * 0.62} rot={f < turnAt ? 0 : (f >= turnAt ? 14 : 0)} />
                </>
              );
            })()}
          </div>
          {/* 쫓는 병사들 (테무친 쪽 기병) */}
          {[0, 1, 2].map((i) => {
            const p = lerp(f, 20 + i * 8, caught, 0, 1);
            return <Rider key={i} kind="mongol" x={lerp(p, 0, 1, -300, 1100) - i * 120} y={lerp(p, 0, 1, 620, 470) + i * 30} w={lerp(p, 0, 1, 340, 150)} phase={i * 4} />;
          })}
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, transform: `translate(${lerp(out, 0, 1, 260, -120)}px, 0)` }}>
          <Guard x={1400} h={lerp(out, 0, 1, 300, 480)} bottom={lerp(out, 0, 1, 380, 160)} flip />
          <Char id="jebe" x={1150} h={lerp(out, 0, 1, 280, 460)} pose="sad" flip bottom={lerp(out, 0, 1, 380, 150)} enter="none" beat="none" />
          <Rope x={1150} h={lerp(out, 0, 1, 280, 460)} bottom={lerp(out, 0, 1, 380, 150)} />
          <Char id="archer" x={900} h={lerp(out, 0, 1, 300, 480)} pose="angry" flip bottom={lerp(out, 0, 1, 380, 160)} enter="none" beat="none" />
          <Bow x={900 - lerp(out, 0, 1, 300, 480) * 0.26} y={1080 - lerp(out, 0, 1, 380, 160) - lerp(out, 0, 1, 300, 480) * 0.42} h={lerp(out, 0, 1, 300, 480) * 0.6} rot={-10} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// 15) c2_21~25 숨죽인 정적 (엄숙하게, 노을): 테무친의 진영·호위병, 무릎 꿇린 궁수와 그 앞 땅에 놓인 활, 내려다보는 테무친.
//     c2_22·23 제베가 말함(각오한 진지한 얼굴, 긴 대사 동안 카메라가 아주 천천히 얼굴로) → c2_24 테무친이 내려다보며 말하고 끄덕임
//     → c2_25 "제베"에서 테무친이 활을 집어 돌려주고 제베가 두 손으로 받음 → 정적 속에 고개를 숙임
const S15 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a22 = at("c2_23");
  const a23 = at("c2_24");
  const a24 = at("c2_25");
  const a25 = at("c2_26");
  const toward = at("c2_22") + sec(3.7); // "그런데 궁수가 먼저"
  // 카메라
  let z = 1, cx = 960, cy = 560;
  if (f < toward) { z = lerp(f, 0, toward, 1.0, 1.06); }
  else if (f < a22) { z = lerp(f, toward, a22, 1.06, 1.3, true); cx = lerp(f, toward, a22, 960, 1180, true); cy = lerp(f, toward, a22, 560, 600, true); }
  else if (f < a23) { z = lerp(f, a22, a23, 1.3, 1.42); cx = 1200; cy = 600; }
  else if (f < a24) { z = lerp(f, a23, a24, 1.42, 2.0); cx = lerp(f, a23, a24, 1200, 1240); cy = lerp(f, a23, a24, 600, 620); }
  else if (f < a25) { z = lerp(f, a24, a25, 1.6, 1.72); cx = 640; cy = 470; }
  else { z = lerp(f, a25, a25 + 30, 1.25, 1.18, true); cx = 980; cy = 600; }
  // 활: 땅 → 테무친 손 ("제베") → 제베 두 손
  const tx = lerp(f, a25 + 6, a25 + 40, 600, 860, true); // 테무친이 다가섬
  const pick = lerp(f, a25 + sec(1.2), a25 + sec(1.9), 0, 1, true);
  const give = lerp(f, a25 + sec(2.0), a25 + sec(2.7), 0, 1, true);
  const s = 0.62;
  const neckY = 1080 - 150 - 322 * s;
  const lift = f >= a25 ? lerp(f, a25 + sec(1.6), a25 + sec(2.4), 0, 0.55, true) : 0;
  const hand = [1250 - (150 - lift * 10 + 26) * s, neckY + (140 - lift * 190 + 6) * s]; // 제베 두 손 가운데 (뒤집힌 몸)
  const ground = [1060, 930];
  const tHand = [tx + 120, 1080 - 150 - 600 * 0.42];
  const bx = give > 0 ? tHand[0] + (hand[0] - tHand[0]) * give : ground[0] + (tHand[0] - ground[0]) * pick;
  const by = give > 0 ? tHand[1] + (hand[1] - tHand[1]) * give : ground[1] + (tHand[1] - ground[1]) * pick;
  const brot = give > 0 ? lerp(give, 0, 1, 0, 90) : lerp(pick, 0, 1, 90, 0);
  const ropeOn = f < a25 + sec(1.4);
  const bowDown = f >= a25 + sec(3.4) ? lerp(f, a25 + sec(3.4), a25 + sec(4.4), 0, 0.5, true) : 0;
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={cy}>
        <Steppe time="dusk" horizon={560} />
        <Camp horizon={560} n={7} />
        <Glow x={1000} y={700} r={620} op={0.28} />
        {/* 둘러선 호위병 (앞줄은 제대로 된 병사, 뒷줄은 실루엣) - 움직이지 않음 */}
        <Shadow lv={0.2}>{[820, 1500, 1660, 1800].map((x, i) => <Char key={i} id="archer" x={x} h={380} pose="front" flip={x > 1300} bottom={250} enter="none" beat="none" />)}</Shadow>
        <Guard x={330} h={430} bottom={200} />
        <Guard x={1560} h={440} bottom={190} flip />
        <Char id="temujin_young" x={tx} h={600} pose="front" talking={talkingAt(f, a24, "c2_25") || talkingAt(f, a25, "c2_26")} gesture={pick > 0 && give < 1 ? "open" : undefined} gestureAt={a25 + sec(1.2)} bottom={150} enter="none" beat={f >= a24 + sec(6.9) && f < a25 ? "nod" : "none"} beatAt={a24 + sec(6.9)} />
        <Kneel id="jebe" x={1250} y={neckY} s={s} c={JEB} arms={ropeOn ? "bound" : "offer"} lift={lift} flip pose="front" face="stern" mouth={f < a23 ? mouthAt(f, a22, "c2_23") : mouthAt(f, a23, "c2_24")} bow={f < a22 ? 0.45 : f < a24 ? -0.12 : bowDown} />
        <Bow x={bx} y={by} h={240} rot={brot} />
      </Cam>
      <SFX name="wind" at={0} vol={0.18} dur={frames} />
    </AbsoluteFill>
  );
};

// 16) c2_26 대장장이 화덕: 망치질하는 수부타이(불꽃) → 제베·수부타이가 테무친 양옆 (제베 거만 😏) → "훗날 유럽": 노을 능선 위 두 기병이 서쪽(왼쪽)으로
const S16 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const both = sec(4.2);
  const later = sec(6.5);
  if (f < both) {
    const strike = (f % 24) / 24;
    const up = strike < 0.6 ? strike / 0.6 : 1 - (strike - 0.6) / 0.4;
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, both, 1.2, 1.0, true)} cx={1000} cy={640}>
          <Paper />
          <div style={{ position: "absolute", left: 0, right: 0, top: 860, bottom: 0, background: "linear-gradient(#b99f6c, #a38858)", borderTop: `5px solid ${INK}` }} />
          <Fire x={1380} y={860} s={1.3} />
          {/* 모루 */}
          <svg width={260} height={200} viewBox="0 0 260 200" style={{ position: "absolute", left: 930, top: 660, ...ink }}>
            <path d="M 20 40 L 240 40 L 240 70 C 200 70 180 80 170 110 L 190 180 L 70 180 L 90 110 C 80 80 50 70 20 70 Z" fill="#5d5754" stroke={INK} strokeWidth={6} />
            <path d="M 60 196 L 200 196 L 190 180 L 70 180 Z" fill="#7a5230" stroke={INK} strokeWidth={5} />
            <rect x={110} y={26} width={60} height={14} fill="#f0a050" stroke={INK} strokeWidth={3} />
            {strike > 0.95 || strike < 0.08 ? [-60, -20, 25, 60].map((a, i) => <path key={i} d={`M 140 26 l ${a} ${-50 - i * 8}`} stroke="#f3b04a" strokeWidth={6} strokeLinecap="round" />) : null}
          </svg>
          <Char id="subutai" x={780} h={500} pose="front" bottom={220} enter="none" beat="none" />
          {/* 망치 (팔 끝) */}
          <svg width={300} height={300} viewBox="0 0 300 300" style={{ position: "absolute", left: 830, top: 520, transform: `rotate(${-up * 70}deg)`, transformOrigin: "40px 140px", ...ink }}>
            <path d="M 40 140 L 260 160" stroke={INK} strokeWidth={14} />
            <path d="M 40 140 L 260 160" stroke="#8a6440" strokeWidth={7} />
            <rect x={240} y={128} width={44} height={66} rx={6} fill="#5d5754" stroke={INK} strokeWidth={5} transform="rotate(5 262 161)" />
          </svg>
        </Cam>
        <SFX name="sword" at={22} vol={0.2} dur={10} />
        <SFX name="sword" at={46} vol={0.2} dur={10} />
        <SFX name="sword" at={70} vol={0.2} dur={10} />
      </AbsoluteFill>
    );
  }
  const dusk = f >= later;
  const g = f - later;
  return (
    <AbsoluteFill>
      <Cam z={dusk ? lerp(g, 0, frames - later, 1.0, 1.06) : lerp(f, both, later, 1.15, 1.0, true)} cx={960} cy={600}>
        <Steppe time={dusk ? "dusk" : "day"} horizon={600} />
        <Camp horizon={600} n={8} />
        <Guard x={200} h={440} bottom={190} />
        <Guard x={1740} h={440} bottom={190} flip />
        {dusk && [0, 1].map((i) => <Rider key={i} kind="mongol" x={1500 - g * 5 - i * 160} y={430 + i * 14} w={170} flip phase={i * 5} dark />)}
        <Char id="jebe" x={520} h={520} pose="smug" bottom={160} enter="pop" delay={both + 4} beat="nod" beatAt={both + 30} />
        <Char id="temujin_young" x={960} h={560} pose="front" bottom={160} enter="pop" delay={both} />
        <Char id="subutai" x={1400} h={530} pose={dusk ? "smug" : "front"} flip bottom={160} enter="pop" delay={both + 10} />
      </Cam>
    </AbsoluteFill>
  );
};

// 17) c2_27 1202·1203·1204 - 초원 지도(대충, 산·숲·강·호수·사막): 동쪽 타타르·가운데 케레이트·서쪽 나이만 땅이 차례로 테무친 색에 먹힘.
//     부족마다 다른 깃발(타타르 = 붉은 삼각기와 해, 케레이트 = 푸른 네모기와 십자, 나이만 = 황토 제비꼬리기와 새, 테무친 = 흰 툭)
//     먹힐 때 그 부족 깃발이 쓰러지고 흰 툭이 꽂힘. 해마다 그 부족 칸이 쓰러지는 짧은 컷
const TEMC = "#4d6b8a";
// 땅덩이와 경계(대충 손으로 그은 선)
const LAND_D = "M 150 420 L 230 300 L 380 240 L 560 210 L 760 190 L 980 170 L 1180 160 L 1390 180 L 1580 230 L 1730 300 L 1810 420 L 1800 560 L 1720 690 L 1560 790 L 1360 850 L 1100 880 L 820 870 L 560 840 L 340 770 L 200 660 L 140 540 Z";
const B1 = [[760, 100], [730, 260], [780, 380], [720, 520], [770, 640], [730, 780], [760, 1000]];
const B2 = [[1220, 100], [1250, 250], [1190, 380], [1240, 500], [1200, 640], [1250, 760], [1220, 1000]];
const strip = (a: number[][] | null, b: number[][] | null) => {
  const left = a ?? [[-10, 100], [-10, 1000]];
  const right = b ?? [[1930, 100], [1930, 1000]];
  return "M " + [...left, ...[...right].reverse()].map((p) => p.join(" ")).join(" L ") + " Z";
};
const TRIBES = [
  { kind: "tatar", d: strip(B2, null), c: "#9aa57c", fx: 1500, fy: 560, from: [1230, 400] },
  { kind: "kereit", d: strip(B1, B2), c: "#8fa1b4", fx: 960, fy: 600, from: [1210, 320] },
  { kind: "naiman", d: strip(null, B1), c: "#b49aa6", fx: 470, fy: 600, from: [760, 450] },
];
const HOME = "M 1080 200 L 1150 180 L 1230 200 L 1260 260 L 1220 320 L 1140 330 L 1080 300 L 1060 250 Z";
// 부족 깃발: (x,y) = 장대 아래, k = 1이면 서 있음, fall 0~1 쓰러짐
const Flag = ({ x, y, kind, fall = 0, h = 210 }: { x: number; y: number; kind: string; fall?: number; h?: number }) => {
  const f = useCurrentFrame();
  const w = Math.sin(f / 8 + x) * 5;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `rotate(${fall * 84}deg)`, transformOrigin: `${x}px ${y}px`, opacity: 1 - fall * 0.5 }}>
      <svg width={160} height={h + 20} viewBox={`-20 -20 160 ${h + 20}`} style={{ position: "absolute", left: x - 20 - 20, top: y - h - 20 + 20 - 20, ...ink }}>
        <path d={`M 20 ${h} L 20 6`} stroke={INK} strokeWidth={9} />
        <path d={`M 20 ${h} L 20 6`} stroke="#6a4a2e" strokeWidth={4} />
        {kind === "tatar" && (
          <>
            <path d="M 20 0 L 20 -14 L 12 0 Z" fill="#c9a24a" stroke={INK} strokeWidth={3} />
            <path d={`M 22 8 L 120 ${34 + w} L 22 64 Z`} fill="#b23a2c" stroke={INK} strokeWidth={4} />
            <circle cx={52} cy={36} r={12} fill="#f0c04a" stroke={INK} strokeWidth={3} />
          </>
        )}
        {kind === "kereit" && (
          <>
            <path d="M 20 -18 L 20 4 M 11 -10 L 29 -10" stroke="#c9a24a" strokeWidth={5} />
            <path d={`M 22 8 L 106 ${8 + w} L 106 ${72 + w} L 22 72 Z`} fill="#3f6690" stroke={INK} strokeWidth={4} />
            <path d={`M 64 18 L 64 62 M 44 36 L 84 36`} stroke="#f2ead8" strokeWidth={8} />
          </>
        )}
        {kind === "naiman" && (
          <>
            <path d="M 8 -2 C 12 -16 28 -16 32 -2" stroke="#c9a24a" strokeWidth={5} fill="none" />
            <path d={`M 22 8 L 118 ${10 + w} L 96 ${40 + w} L 118 ${70 + w} L 22 72 Z`} fill="#c9963a" stroke={INK} strokeWidth={4} />
            <path d="M 42 44 L 56 34 L 66 42 L 76 30 L 88 44" stroke={INK} strokeWidth={5} fill="none" />
          </>
        )}
      </svg>
    </div>
  );
};
const Mountain = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 0 L -6 -64 L 10 -40 L 22 -54 L 52 0 Z" fill="#a89a80" stroke={INK} strokeWidth={4} />
    <path d="M -16 -48 L -6 -64 L 4 -48 L -4 -44 Z" fill="#f2ead8" />
  </g>
);
const MapTree = ({ x, y }: { x: number; y: number }) => <path d={`M ${x} ${y - 30} L ${x - 14} ${y} L ${x + 14} ${y} Z`} fill="#56704a" stroke={INK} strokeWidth={3} />;
const MapShot = ({ eaten }: { eaten: number[] }) => (
  <AbsoluteFill>
    <Paper />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      <defs>
        <clipPath id="ch2-land"><path d={LAND_D} /></clipPath>
        {TRIBES.map((t, i) => <clipPath key={i} id={`ch2-strip${i}`}><path d={t.d} /></clipPath>)}
      </defs>
      <path d={LAND_D} fill="#d8c69c" stroke={INK} strokeWidth={7} />
      <g clipPath="url(#ch2-land)">
        {TRIBES.map((t, i) => (
          <g key={i} clipPath={`url(#ch2-strip${i})`}>
            <path d={t.d} fill={t.c} opacity={0.8} />
            <circle cx={t.from[0]} cy={t.from[1]} r={1000 * eaten[i]} fill={TEMC} opacity={0.88} />
          </g>
        ))}
        {/* 고비 사막 (남쪽): 점과 모래 언덕 */}
        <path d="M 420 760 C 700 700 1100 700 1500 760 L 1600 900 L 380 900 Z" fill="#e6d29a" opacity={0.85} />
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={460 + ((i * 263) % 1080)} cy={770 + ((i * 47) % 90)} r={3} fill="#a8905a" />)}
        {[560, 820, 1080, 1320].map((x) => <path key={x} d={`M ${x} 800 q 40 -22 80 0 q 40 -22 80 0`} stroke="#a8905a" strokeWidth={4} fill="none" />)}
        {[B1, B2].map((b, i) => <path key={i} d={"M " + b.map((p) => p.join(" ")).join(" L ")} stroke={INK} strokeWidth={5} strokeDasharray="18 12" fill="none" />)}
      </g>
      {/* 산: 알타이(서쪽 끝)·항가이(가운데 서쪽) / 숲: 헨티(고향 둘레) / 강: 오논·케룰렌, 톨·오르콘 / 호수 */}
      {[[250, 470], [300, 540], [230, 600], [330, 640], [280, 410]].map(([x, y], i) => <Mountain key={`a${i}`} x={x} y={y} s={1.1} />)}
      {[[640, 520], [690, 570], [600, 590]].map(([x, y], i) => <Mountain key={`k${i}`} x={x} y={y} s={0.9} />)}
      {[[1010, 260], [1040, 300], [1280, 250], [1300, 300], [990, 320], [1320, 350]].map(([x, y], i) => <MapTree key={i} x={x} y={y} />)}
      <path d="M 1240 270 C 1330 300 1380 360 1470 380 C 1540 396 1580 420 1600 440" stroke="#6f93a8" strokeWidth={9} fill="none" />
      <path d="M 1180 330 C 1200 400 1300 450 1420 470 C 1500 480 1560 470 1600 450" stroke="#6f93a8" strokeWidth={7} fill="none" />
      <ellipse cx={1625} cy={450} rx={48} ry={30} fill="#8fb0c0" stroke={INK} strokeWidth={4} />
      <path d="M 880 390 C 930 450 900 520 980 560 C 1040 590 1060 640 1120 660" stroke="#6f93a8" strokeWidth={7} fill="none" />
      <path d="M 860 300 C 880 340 870 370 880 390" stroke="#6f93a8" strokeWidth={6} fill="none" />
      <path d={HOME} fill={TEMC} stroke={INK} strokeWidth={6} />
    </svg>
    <Tug x={1160} y={300} h={190} />
    {TRIBES.map((t, i) => {
      const fall = Math.min(1, Math.max(0, (eaten[i] - 0.2) / 0.3));
      const up = Math.min(1, Math.max(0, (eaten[i] - 0.45) / 0.35));
      return (
        <React.Fragment key={i}>
          <Flag x={t.fx} y={t.fy} kind={t.kind} fall={fall} />
          {up > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - ease(up)) * 60}px)`, opacity: up }}><Tug x={t.fx + 40} y={t.fy} h={220} /></div>}
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);
const S17 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const Y = [sec(2.74), sec(6.66), sec(9.94)];
  const eat = (i: number) => lerp(f, Y[i] + 2, Y[i] + 36, 0, 1, true);
  // 컷: 해마다 지도 → (짧게) 그 부족 칸이 쓰러짐
  const cut1 = [Y[0] + 40, Y[1] - 2]; // 타타르 칸
  const cut2 = [sec(8.2), Y[2] - 2]; // 토그릴
  const inCut = (c: number[]) => f >= c[0] && f < c[1];
  if (inCut(cut1) || inCut(cut2)) {
    const t = inCut(cut1) ? f - cut1[0] : f - cut2[0];
    const len = inCut(cut1) ? cut1[1] - cut1[0] : cut2[1] - cut2[0];
    const fall = lerp(t, len * 0.35, len * 0.35 + 14, 0, 1, true);
    const sh = shake(t, len * 0.35 + 12, 10, 20);
    return (
      <AbsoluteFill>
        <Cam z={lerp(t, 0, len, 1.1, 1.0)} cx={960} cy={600} sx={sh.x} sy={sh.y}>
          {inCut(cut1) ? (
            <>
              <Steppe time="dusk" horizon={600} />
              <Burning x={1300} y={760} w={260} />
              <Burning x={1650} y={720} w={200} />
              {Array.from({ length: 8 }).map((_, i) => <Rider key={i} kind="mongol" x={lerp(t, 0, len, -900, -400) + i * 140} y={500 + (i % 2) * 40} w={240} phase={i * 3} />)}
              {/* 타타르 칸 (실루엣) 이 앞으로 쓰러짐 */}
              <div style={{ position: "absolute", inset: 0, transform: `rotate(${fall * 84}deg)`, transformOrigin: "900px 900px" }}>
                <Shadow><Char id="archer" x={900} h={540} pose="shocked" bottom={180} enter="none" beat="none" /></Shadow>
              </div>
              <Rider kind="temujin" x={lerp(t, 0, len, -500, 200)} y={420} w={420} phase={0} />
            </>
          ) : (
            <>
              <Steppe time="night" horizon={600} />
              <Dais />
              <div style={{ position: "absolute", inset: 0, transform: `rotate(${-fall * 80}deg)`, transformOrigin: "1450px 640px" }}>
                <Char id="toghrul" x={1450} h={520} pose={fall > 0 ? "shocked" : "sad"} bottom={440} enter="none" beat="none" />
              </div>
              <Dim op={0.35} />
            </>
          )}
        </Cam>
        <SFX name="impact" at={Math.round(len * 0.35 + 12)} vol={0.3} dur={30} />
      </AbsoluteFill>
    );
  }
  const e = [eat(0), eat(1), eat(2)];
  const yi = f >= Y[2] ? 2 : f >= Y[1] ? 1 : f >= Y[0] ? 0 : -1;
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.12, 1.0)} cx={yi >= 0 ? TRIBES[yi].fx : 1150} cy={520}>
        <MapShot eaten={e} />
      </Cam>
      {yi >= 0 && <BigNum key={yi} text={["1202", "1203", "1204"][yi]} at={Y[yi] + 1} size={170} y={410} />}
      {yi >= 0 && <SFX key={`s${yi}`} name="drum" at={Y[yi]} vol={0.35} dur={30} />}
    </AbsoluteFill>
  );
};

// 18) c2_28~30 노을: 자무카를 묶어 끌고 온 부하들(우쭐한 얼굴) → 테무친의 명령에 그들이 무릎 꿇려지고(겁먹은 얼굴) → 노을을 등진 집행인의 칼이 천천히 들림
//     → 내려오는 순간 검은 화면 + 둔탁한 소리 → 쓰러진 실루엣들, 그것을 보는 묶인 자무카의 경악한 얼굴 (피·상처 없이)
//     → 무릎 꿇린 자무카와 테무친이 오래 마주 봄 → 부탁 → 불이 꺼지듯 어두워지고 테무친이 등을 돌림
const S18 = (props: ShotProps) => {
  const f = useCurrentFrame();
  if (f < props.at("c2_30") + 30) return <Execution {...props} />;
  return <S18b {...props} />;
};
const Execution = ({ at }: ShotProps) => {
  const f = useCurrentFrame();
  const arrive = sec(4.0);
  const cmd = sec(5.7); // "테무친은 주인을 판 부하들부터"
  const seize = cmd + 8;
  const raise0 = cmd + 18;
  const cut = cmd + 64;
  const after = cut + 16;
  const end = at("c2_30") + 30;
  const drag = lerp(f, sec(0.4), arrive, 1000, 0, true);
  const s = 0.6;
  const neckY = 1080 - 160 - 322 * s;
  const TX = [1060, 1250];
  if (f >= cut && f < after) {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <SFX name="impact" at={0} vol={0.55} dur={40} />
      </AbsoluteFill>
    );
  }
  if (f >= after) {
    // 쓰러진 실루엣들 → 자무카의 경악한 얼굴로 천천히
    const t = f - after;
    const z = lerp(t, 0, end - after, 1.25, 2.1, true);
    const cx = lerp(t, 0, end - after, 1300, 1560, true);
    const cy = lerp(t, 0, end - after, 680, 640, true);
    return (
      <AbsoluteFill>
        <Cam z={z} cx={cx} cy={cy}>
          <Steppe time="dusk" horizon={580} />
          <Camp horizon={580} n={10} dark />
          <Glow x={1150} y={620} r={520} color="#f0a060" op={0.35} />
          <Lying x={1080} y={930} s={1.1} />
          <Lying x={1300} y={950} s={1.05} flip />
          <Kneel id="jamukha" x={1560} y={1080 - 150 - 322 * 0.66} s={0.66} c={JAM} arms="bound" flip pose="shocked" />
        </Cam>
        <Dim op={0.35} />
        <SFX name="wind" at={0} vol={0.3} dur={end - after} />
      </AbsoluteFill>
    );
  }
  const kneel = f >= seize;
  const up = lerp(f, raise0, cut - 6, 0, 1, true); // 칼이 천천히 들림
  const z = f < cmd ? lerp(f, 0, cmd, 1.0, 1.06) : lerp(f, cmd, cut, 1.06, 1.22, true);
  const cx = f < cmd ? 960 : lerp(f, cmd, cmd + 30, 960, 1060, true);
  const dim = lerp(f, seize, cut - 10, 0, 0.45);
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={580}>
        <Steppe time="dusk" horizon={580} />
        <Camp horizon={580} n={10} />
        <Guard x={330} h={480} bottom={170} />
        <Guard x={170} h={460} bottom={200} />
        <Fire x={760} y={920} s={0.8} />
        <Glow x={1150} y={560} r={440} color="#f0a060" op={0.25 + 0.3 * lerp(f, seize, cut, 0, 1)} />
        <Char id="temujin_young" x={560} h={580} pose="front" gesture={f >= cmd ? "point" : undefined} gestureAt={cmd} bottom={150} enter="none" beat="none" />
        {/* 집행인 (노을을 등진 실루엣, 칼을 천천히 들어 올림) */}
        {kneel && (
          <div style={{ position: "absolute", inset: 0, opacity: lerp(f, seize, seize + 10, 0, 1) }}>
            <Executioner x={870} bottom={180} h={600} up={up} />
          </div>
        )}
        {/* 자무카를 판 부하들: 끌고 올 때는 우쭐한 얼굴로 서 있다가 → 무릎 꿇려져 겁먹은 얼굴 */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${drag}px)` }}>
          {TX.map((x, i) =>
            kneel ? (
              <Kneel key={i} id="archer" x={x} y={neckY} s={s} c={TRT} arms="bound" flip pose="shocked" bow={lerp(f, cut - 20, cut - 4, 0, 0.5)} />
            ) : (
              <Char key={i} id="archer" x={x} h={460} pose={f < arrive ? "smug" : "smug"} flip bottom={160} enter="none" beat={f >= arrive && i === 0 ? "nod" : "none"} beatAt={arrive + 6} />
            ),
          )}
          {kneel ? (
            <Kneel id="jamukha" x={1560} y={1080 - 150 - 322 * 0.66} s={0.66} c={JAM} arms="bound" flip pose="shocked" />
          ) : (
            <>
              <Char id="jamukha" x={1560} h={540} pose="sad" flip bottom={150} enter="none" beat="none" />
              <Rope x={1560} h={540} bottom={150} />
            </>
          )}
          {!kneel && (
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M 1520 700 Q 1420 760 1340 720" stroke={INK} strokeWidth={8} fill="none" />
              <path d="M 1520 700 Q 1420 760 1340 720" stroke="#c9a24a" strokeWidth={4} fill="none" />
            </svg>
          )}
        </div>
        {/* 부하들을 붙잡는 테무친의 호위병 (제대로 된 병사) */}
        {kneel && <Guard x={1420} h={480} bottom={170} flip />}
      </Cam>
      <Dim op={dim} />
      <SFX name="drum" at={cmd} vol={0.35} dur={40} />
    </AbsoluteFill>
  );
};
const S18b = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a28 = at("c2_30");
  const a29 = at("c2_31");
  const drag = 0;
  const traitorsOut = 1;
  const kneelAt = 0;
  const dark = lerp(f, a29 + sec(2.4), frames - 20, 0, 0.85, true);
  const turn = lerp(f, a29 + sec(2.2), a29 + sec(3.6), 0, 1, true);
  const fireK = 1 - lerp(f, a29 + sec(1.5), frames - 30, 0, 0.85);
  // 카메라: 넓게 → (마주 봄) 둘 사이로 천천히 → 자무카 얼굴 → 둘
  const z = f < a28 ? lerp(f, kneelAt, a28, 1.0, 1.15, true) : f < a29 ? lerp(f, a28, a29, 1.25, 1.4) : lerp(f, a29, frames, 1.25, 1.1);
  const cx = f < a28 ? 960 : f < a29 ? lerp(f, a28, a28 + 20, 960, 1150, true) : 960;
  const s = 0.68;
  const neckY = 1080 - 150 - 322 * s;
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={600}>
        <Steppe time="dusk" horizon={580} />
        <Camp horizon={580} n={10} />
        <Guard x={330} h={480} bottom={170} />
        <Guard x={170} h={460} bottom={200} />
        <Fire x={960} y={900} s={0.9 * fireK} />
        {/* 테무친: 끝에 천천히 돌아서 왼쪽 어둠으로 (앞 → 옆모습) */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-Math.max(0, turn - 0.5) * 160}px) scaleX(${Math.max(0.06, Math.abs(Math.cos(Math.PI * turn)))})`, transformOrigin: "620px 100%" }}>
          <Char id="temujin_young" x={620} h={580} pose={turn >= 0.5 ? "side" : "front"} flip={turn >= 0.5} bottom={150} enter="none" beat="none" />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${drag}px)` }}>
          {f < kneelAt ? (
            <>
              <Char id="jamukha" x={1250} h={540} pose="sad" flip bottom={150} enter="none" beat="none" />
              <Rope x={1250} h={540} bottom={150} />
              {/* 끄는 밧줄 */}
              <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
                <path d={`M 1290 700 Q 1400 760 ${1500 + traitorsOut * 900} 720`} stroke="#c9a24a" strokeWidth={5} fill="none" opacity={1 - traitorsOut} />
              </svg>
            </>
          ) : (
            <Kneel id="jamukha" x={1250} y={neckY} s={s} c={JAM} arms="bound" flip pose={f >= a28 ? "sad" : "front"} bow={f >= a29 ? lerp(f, a29, a29 + 30, 0, 0.5) : 0} />
          )}
        </div>
      </Cam>
      <Dim op={dark} />
      <SFX name="wind" at={a28} vol={0.25} dur={frames - a28} />
    </AbsoluteFill>
  );
};

// 19) c2_31 1206 오논강 쿠릴타이: 흰 툭이 일제히 서고, 여러 줄의 부족민이 무릎, 가운데로 칭기즈칸 → 정적 4초(바람에 툭이 날리고 카메라 아주 천천히)
const S19 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tugs = 20;
  const kneel = sec(1.5);
  const khan = sec(4.2);
  const wind = Math.sin(f / 9) * 10 + Math.sin(f / 4) * 3;
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={960} cy={560}>
        <Steppe time="dusk" horizon={540} />
        <Camp horizon={530} n={14} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 0 590 C 400 570 700 620 1100 580 C 1400 550 1700 580 1920 570 L 1920 610 C 1700 620 1400 590 1100 625 C 700 660 400 610 0 630 Z" fill="#8fa3a6" stroke={INK} strokeWidth={4} />
        </svg>
        {/* 흰 툭 9개가 한꺼번에 솟음 */}
        {Array.from({ length: 9 }).map((_, i) => {
          const up = spring({ frame: f - tugs, fps, config: { damping: 11, stiffness: 120 } });
          return (
            <Tug key={i} x={240 + i * 180} y={720 - Math.abs(i - 4) * 8 + (1 - up) * 440} h={320 + (i === 4 ? 60 : 0)} sway={wind + i} />
          );
        })}
        <Glow x={960} y={520} r={560} op={lerp(f, khan, khan + 24, 0.1, 0.55)} />
        {f >= khan && <Char id="genghis" x={960} h={800} pose="front" enter="up" delay={khan} bottom={70} beat="none" />}
        {f >= khan && <div style={{ position: "absolute", inset: 0, opacity: lerp(f, khan + 6, khan + 20, 0, 1) }}><Guard x={640} h={540} bottom={120} /><Guard x={1280} h={540} bottom={120} flip /></div>}
        {/* 여러 줄의 부족민 (등 실루엣) - 뒷줄부터 무릎 */}
        {/* 한 줄 = 한 겹 (사람마다 화면 크기 겹을 만들면 렌더 때 그래픽 메모리가 넘쳐 한 프레임씩 깨짐) */}
        {[0, 1, 2].map((r) => (
          <Shadow key={r} lv={0.1 + (2 - r) * 0.08}>
            {Array.from({ length: 11 + r }).map((_, i) => {
              const n = 11 + r;
              const x = (1920 / n) * (i + 0.5) + ((i * 37) % 24);
              const k = lerp(f, kneel + (2 - r) * 6 + i, kneel + (2 - r) * 6 + i + 10, 0, 1, true);
              const h = 200 + r * 70;
              return <Char key={i} id="archer" x={x} h={h} pose="front" bottom={200 - r * 110 - k * h * 0.22} enter="none" beat="none" />;
            })}
          </Shadow>
        ))}
      </Cam>
      <AbsoluteFill style={{ opacity: lerp(f, khan - 16, khan, 1, 0) }}><BigNum text="1206" at={2} size={190} y={-390} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 14, frames, 0, 1) }} />
      <SFX name="war_drums" at={0} vol={0.3} dur={khan} />
      <SFX name="war_horn" at={khan - 4} vol={0.35} dur={80} />
      <SFX name="wind" at={khan + 40} vol={0.3} dur={frames - khan - 40} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: ["c2_01"], Shot: S1 },
  { ids: ["c2_02"], Shot: S2 },
  { ids: ["c2_03"], Shot: S3 },
  { ids: ["c2_04"], Shot: S4 },
  { ids: ["c2_05", "c2_06", "c2_07"], Shot: S5 },
  { ids: ["c2_08", "c2_09"], Shot: S6 },
  { ids: ["c2_10"], Shot: S7 },
  { ids: ["c2_11"], Shot: S8 },
  { ids: ["c2_12"], Shot: Seasons },
  { ids: ["c2_13", "c2_14", "c2_15", "c2_16"], Shot: S9 },
  { ids: ["c2_17"], Shot: S10 },
  { ids: ["c2_18"], Shot: S11 },
  { ids: ["c2_19"], Shot: S12 },
  { ids: ["c2_20"], Shot: S13 },
  { ids: ["c2_21"], Shot: S14 },
  { ids: ["c2_22", "c2_23", "c2_24", "c2_25", "c2_26"], Shot: S15 },
  { ids: ["c2_27"], Shot: S16 },
  { ids: ["c2_28"], Shot: S17 },
  { ids: ["c2_29", "c2_30", "c2_31"], Shot: S18 },
  { ids: ["c2_32"], Shot: S19 },
];
export const M01Ch2 = () => <Chapter ch="2" year="1180" groups={groups} music="march" />;
