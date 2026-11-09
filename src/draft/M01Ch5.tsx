// 몽골 1편 검수용 초안 - 5장 "서쪽에서 온 낙타 행렬" (c5_01~c5_10) 화면 - 1편의 끝 (2026-10-26)
// 기준: 합격한 훅·1·2장(src/draft/M01Ch1·Ch2.tsx)의 밝은 종이 그림체, 02-제작-결정.md "1장·2장 피드백" 전부
// 흐름 (대본 c5_01~c5_18, 2026-10-26 사용자 피드백 반영): 첫 프레임부터 지도(두 나라 영역·깃발) → 서쪽 호라즘·샤 → 진영의 칸이 사신에게 "장사나 하자"
//   → 칸의 진영에서 몽골 상인(흰 툭·칸의 패)이 낙타를 끌고 떠남 → 1218 오트라르 → 이날추크 "첩자" → 성문이 닫히며 칼 → 검은 화면 → 주인 잃은 낙타
//   → 화난 칸이 사신 셋을 보냄 → 샤의 궁궐: 하나는 벽 그림자로 칼(컷), 둘은 수염이 밀려 쫓겨남 → 검은 툭이 솟음(전쟁)
//   → 지도: 몇 배 큰 호라즘 + 금나라 전선에 묶인 몽골 → 홀로 산에 올라 사흘 기도(등잔 셋·별) → "하늘이여" 올려다봄 → 새벽 언덕 위 칸이 진격 명령
//   → 기병이 칸의 양옆으로 카메라 쪽에 쏟아져 화면 밖으로 → 칸만 남고 천천히 어두워짐 → 20초 고정 엔딩(ending.wav, 최종 화면 자리) (2026-10-26 사용자, 10→20초)
// 학살은 피 없이: 칼이 들리는 실루엣 → 성문이 닫히는 순간 검은 화면 + 소리. 흰 번쩍임 안 씀, 흔들림은 느리게
// 브금: kit의 Chapter는 한 곡을 끝까지 깔아서, 이 장만 같은 계산의 Chapter5로 - 성문이 닫히면 음악이 끊기고(정적·바람), 사신·궁궐·지도는 긴장된 곡, 산에서 슬픈 곡, 출정부터는 북·뿔나팔·말발굽
// 지도: public/hook/m01/asia.svg (scripts/asia-map.py, Natural Earth) - 아래 MX·MY가 같은 투영
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "../../public/ep/mongol-01/draft/voice.json";
import { rateOf, secOf, useLang, voiceSrc, BigNum, Bgm, CARD, Char, SERIF, chapterFrames, chapterLines, clamp, ease, FPS, Ger, Glow, Group, INK, InkDefs, lineFrames, Paper, Rider, SFX, ShotProps, Steppe, talkingAt, Tug, Snd, ChapterCard, CARD_X, SHOT_XF, FadeIn, Fire, slotSec } from "./kit";

const sec = (s: number) => Math.round(s * FPS);
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) => interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const k01 = (x: number) => Math.max(0, Math.min(1, x));
// 느린 흔들림 (프레임마다 뒤집히지 않게)
const shake = (f: number, from: number, amp: number, dur = 40) => {
  const t = f - from;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const d = 1 - t / dur;
  return { x: Math.sin(t * 0.9) * amp * d, y: Math.cos(t * 1.2) * amp * 0.6 * d };
};
// 카메라: 배율·초점·흔들림 (가장자리 검은 틈 안 생기게 잘라 맞춤) - 2장과 같음
const Cam = ({ z = 1, cx = 960, cy = 540, sx = 0, sy = 0, children }: { z?: number; cx?: number; cy?: number; sx?: number; sy?: number; children: React.ReactNode }) => {
  const tx = Math.max(Math.min(960 - cx * z, 0), 1920 - 1920 * z) + sx;
  const ty = Math.max(Math.min(540 - cy * z, 0), 1080 - 1080 * z) + sy;
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "0 0" }}>{children}</AbsoluteFill>;
};
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k01(t)).toString(16).padStart(2, "0")).join("");
};
const rotP = (p: number[], c: number[], deg: number) => {
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
// 실루엣 (없는 인물): 그림을 검게
const Shadow = ({ lv = 0.12, op = 1, children }: { lv?: number; op?: number; children: React.ReactNode }) => (
  <AbsoluteFill style={{ filter: `brightness(${lv}) saturate(0.3)`, opacity: op }}>{children}</AbsoluteFill>
);

// ---------- 파일 읽기 (지도 해안선·모자 벗은 칸 머리) ----------
const TXT: Record<string, string> = {};
const useText = (path: string) => {
  const [t, setT] = useState<string | null>(TXT[path] ?? null);
  const [h] = useState(() => (TXT[path] ? null : delayRender(`ch5 ${path}`)));
  useEffect(() => {
    if (h === null) return;
    let live = true;
    fetch(staticFile(path))
      .then((r) => r.text())
      .then((x) => {
        TXT[path] = x;
        if (live) setT(x);
        continueRender(h);
      })
      .catch(() => continueRender(h));
    return () => {
      live = false;
    };
  }, [h, path]);
  return t;
};

// ================= 전용 그림: 쌍봉낙타 =================
// 판 좌표: (0,0) = 몸 가운데 아래 땅, 오른쪽을 봄, 높이 약 330. s = 판 1당 화면 px
// walk: 같은 쪽 앞뒤 다리가 함께 움직이는 낙타 걸음(측대보), low 0~1 목을 떨굼, load 짐 종류
const CAMEL = { coat: "#b8915c", far: "#9a774a", shag: "#7e5e38", belly: "#d2b17e", pad: "#4a3a2a" };
type Load = "bales" | "carpet" | "jars" | "loose" | "none";
const NECK_PIVOT = [100, -222];
const camelPt = (p: number[], low: number) => rotP(p, NECK_PIVOT, low * 58);
export const camelNose = (x: number, y: number, s: number, low = 0, flip = false) => {
  const p = camelPt([262, -270], low);
  return [x + (flip ? -p[0] : p[0]) * s, y + p[1] * s];
};
const camelRear = (x: number, y: number, s: number, flip = false) => [x + (flip ? 112 : -112) * s, y - 214 * s];
const CamelLeg = ({ hip, t, front, far, A }: { hip: number[]; t: number; front: boolean; far: boolean; A: number }) => {
  const sw = A * Math.sin(t);
  const lift = Math.max(0, Math.cos(t)) * (A > 0 ? 1 : 0);
  const k = [hip[0] + 92 * Math.sin(sw), hip[1] + 92 * Math.cos(sw)];
  const a2 = sw + (front ? -0.7 : 0.6) * lift;
  const foot = [k[0] + 88 * Math.sin(a2), Math.min(0, k[1] + 88 * Math.cos(a2))];
  const d = `M ${hip[0]} ${hip[1]} L ${k[0]} ${k[1]} L ${foot[0]} ${foot[1]}`;
  const c = far ? CAMEL.far : CAMEL.coat;
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={front ? 32 : 36} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={c} strokeWidth={front ? 22 : 26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={foot[0] + 6} cy={foot[1] - 4} rx={20} ry={9} fill={CAMEL.pad} stroke={INK} strokeWidth={4} />
    </>
  );
};
const BALE = ["#a8332a", "#4d6b8a", "#7a5a2e", "#5e7a4a", "#8a3b5c"];
const CamelLoad = ({ load, v }: { load: Load; v: number }) => {
  const c1 = BALE[v % BALE.length];
  const c2 = BALE[(v + 2) % BALE.length];
  if (load === "none") return null;
  if (load === "loose")
    // 끈이 풀려 한쪽으로 미끄러진 짐 (주인 잃은 낙타)
    return (
      <g transform="rotate(24 10 -268)">
        <path d="M -40 -282 L 54 -282 L 50 -262 L -36 -262 Z" fill="#8a3b2c" stroke={INK} strokeWidth={5} />
        <rect x={-30} y={-262} width={78} height={70} rx={14} fill={c1} stroke={INK} strokeWidth={5} />
        {[-14, 6, 26].map((xx) => <path key={xx} d={`M ${xx} -258 L ${xx} -196`} stroke="#e8dcc0" strokeWidth={5} />)}
        <path d="M 48 -240 C 80 -220 90 -180 84 -150" stroke="#c9a24a" strokeWidth={5} fill="none" />
      </g>
    );
  return (
    <g>
      {/* 안장 담요 + 양쪽으로 늘어진 짐 */}
      <path d="M -46 -286 C -20 -276 30 -276 62 -286 L 58 -258 L -42 -258 Z" fill="#8a3b2c" stroke={INK} strokeWidth={5} />
      <path d="M -40 -274 L 56 -274" stroke="#c9a24a" strokeWidth={5} />
      {load === "jars" ? (
        <>
          {[-22, 34].map((xx) => (
            <g key={xx}>
              <path d={`M ${xx - 10} -300 L ${xx + 10} -300 L ${xx + 12} -290 C ${xx + 34} -270 ${xx + 30} -210 ${xx} -196 C ${xx - 30} -210 ${xx - 34} -270 ${xx - 12} -290 Z`} fill="#b2683c" stroke={INK} strokeWidth={5} />
              <path d={`M ${xx - 20} -250 C ${xx - 6} -244 ${xx + 6} -244 ${xx + 20} -250`} stroke="#e8dcc0" strokeWidth={4} fill="none" />
            </g>
          ))}
          <path d="M -44 -232 C -10 -222 30 -222 64 -232" stroke="#6a4a2e" strokeWidth={6} fill="none" />
        </>
      ) : (
        <>
          <rect x={-40} y={-262} width={98} height={76} rx={16} fill={c1} stroke={INK} strokeWidth={5} />
          {[-22, 0, 22, 44].map((xx) => <path key={xx} d={`M ${xx} -258 L ${xx} -190`} stroke="#e8dcc0" strokeWidth={5} opacity={0.85} />)}
          <path d="M -40 -224 L 58 -224" stroke={INK} strokeWidth={4} />
          {load === "carpet" ? (
            <>
              <rect x={-66} y={-318} width={150} height={34} rx={17} fill={c2} stroke={INK} strokeWidth={5} />
              <path d="M -40 -318 L -40 -284 M 0 -318 L 0 -284 M 40 -318 L 40 -284" stroke="#e8dcc0" strokeWidth={4} />
              <circle cx={84} cy={-301} r={14} fill={c2} stroke={INK} strokeWidth={4} />
              <path d="M 84 -308 C 92 -304 90 -294 82 -296" stroke={INK} strokeWidth={3} fill="none" />
            </>
          ) : (
            <>
              <path d="M -30 -284 C -36 -320 10 -330 14 -300 C 18 -330 60 -322 54 -284 Z" fill="#e8dcc0" stroke={INK} strokeWidth={5} />
              <path d="M 14 -300 L 14 -284 M -12 -312 C -2 -300 -6 -292 -10 -286" stroke={INK} strokeWidth={4} fill="none" />
            </>
          )}
        </>
      )}
    </g>
  );
};
export const Camel = ({ x, y, s, phase = 0, walk = true, low = 0, load = "bales", v = 0, flip = false, sway = 0 }: { x: number; y: number; s: number; phase?: number; walk?: boolean; low?: number; load?: Load; v?: number; flip?: boolean; sway?: number }) => {
  const A = walk ? 0.34 : 0;
  const t = phase;
  const bob = walk ? Math.abs(Math.sin(t)) * 5 : 0;
  const tail = Math.sin(t * 0.5 + v) * 6 + sway;
  return (
    <svg width={460 * s} height={400 * s} viewBox="-150 -360 460 400" style={{ position: "absolute", left: x - 150 * s, top: y - 360 * s, transform: flip ? "scaleX(-1)" : undefined, transformOrigin: `${150 * s}px ${360 * s}px`, ...ink }}>
      <ellipse cx={30} cy={2} rx={160} ry={14} fill="rgba(43,29,20,0.22)" />
      {/* 먼 쪽 다리 (반대 박자) */}
      <CamelLeg hip={[-78, -176]} t={t + Math.PI} front={false} far A={A} />
      <CamelLeg hip={[82, -176]} t={t + Math.PI} front far A={A} />
      <g transform={`translate(0 ${-bob})`}>
        {/* 꼬리 */}
        <path d={`M -116 -214 C ${-132 + tail * 0.3} -192 ${-134 + tail} -170 ${-126 + tail} -150`} stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={`M -116 -214 C ${-132 + tail * 0.3} -192 ${-134 + tail} -170 ${-126 + tail} -150`} stroke={CAMEL.shag} strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* 몸통 + 두 혹 */}
        <path d="M -120 -204 C -130 -250 -104 -270 -76 -270 C -70 -336 -14 -340 -6 -276 C 8 -270 20 -270 32 -276 C 42 -338 96 -334 98 -268 C 120 -262 130 -238 124 -206 C 120 -170 92 -150 46 -150 L -64 -150 C -104 -150 -118 -174 -120 -204 Z" fill={CAMEL.coat} stroke={INK} strokeWidth={7} />
        <path d="M -96 -164 C -50 -152 40 -152 98 -164" stroke={CAMEL.belly} strokeWidth={14} fill="none" opacity={0.7} />
        {/* 혹 위 거친 털 */}
        <path d="M -70 -300 C -60 -328 -24 -332 -12 -300 M 38 -300 C 50 -326 86 -326 92 -296" stroke={CAMEL.shag} strokeWidth={16} fill="none" strokeLinecap="round" />
        <CamelLoad load={load} v={v} />
        {/* 목 + 머리 (low만큼 앞으로 떨굼) */}
        <g transform={`rotate(${low * 58} ${NECK_PIVOT[0]} ${NECK_PIVOT[1]})`}>
          <path d="M 86 -250 C 124 -250 146 -214 168 -222 C 186 -230 192 -264 200 -290 L 236 -280 C 228 -246 218 -200 188 -182 C 160 -168 116 -172 92 -194 Z" fill={CAMEL.coat} stroke={INK} strokeWidth={7} />
          <path d="M 100 -192 C 124 -176 160 -170 186 -184" stroke={CAMEL.shag} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 196 -292 C 210 -310 244 -306 262 -286 C 274 -274 270 -262 256 -260 L 224 -262 C 208 -264 194 -276 196 -292 Z" fill={CAMEL.coat} stroke={INK} strokeWidth={6} />
          <path d="M 204 -300 L 196 -318 L 214 -304 Z" fill={CAMEL.coat} stroke={INK} strokeWidth={4} />
          <ellipse cx={228} cy={-288} rx={5} ry={4} fill={INK} />
          <path d="M 220 -296 q 8 -5 16 0" stroke={INK} strokeWidth={3} fill="none" />
          <path d="M 254 -276 l 8 2 M 248 -264 C 254 -262 260 -262 264 -266" stroke={INK} strokeWidth={3} fill="none" />
          {/* 코 고삐 고리 */}
          <circle cx={262} cy={-270} r={5} fill="#c9a24a" stroke={INK} strokeWidth={2} />
        </g>
      </g>
      {/* 가까운 쪽 다리 */}
      <CamelLeg hip={[-64, -170]} t={t} front={false} far={false} A={A} />
      <CamelLeg hip={[94, -170]} t={t} front far={false} A={A} />
    </svg>
  );
};
// 고삐 (두 점 사이로 늘어진 밧줄, 화면 좌표)
const Rope = ({ a, b, sag = 30, w = 4 }: { a: number[]; b: number[]; sag?: number; w?: number }) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={w + 3} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#a8875a" strokeWidth={w} fill="none" strokeLinecap="round" />
    </>
  );
};

// ================= 전용 그림: 칭기즈칸이 보낸 몽골 상인·사신 (몽골 옷: 델 + 털 챙 모자) =================
// 2026-10-26 사용자: "몽골 상인인지 그냥 상인인지 헷갈려" → 상단은 몽골 모자·델, 흰 툭 깃발과 칸의 패(금빛 패찰)를 지님
const SKIN = "#d9a77a";
const ROBES = ["#4f6e7a", "#7a5a3a", "#6b4f7a", "#5e6f4a", "#8a6a3a", "#3f5a6e"];
const MHAT = ["#8a3b2c", "#4d6b8a", "#6b4f3a", "#5e6f4a"];
// 작은 흰 툭 (손에 든 깃대 끝 - 칸의 표식). (x, y) = 깃대 위 끝
const MiniTug = ({ x, y, sway = 0 }: { x: number; y: number; sway?: number }) => (
  <g>
    <path d={`M ${x} ${y - 26} L ${x - 8} ${y - 4} L ${x + 8} ${y - 4} Z`} fill="#b8bcbd" stroke={INK} strokeWidth={4} />
    <ellipse cx={x} cy={y} rx={13} ry={5} fill="#c9a24a" stroke={INK} strokeWidth={3} />
    <path d={`M ${x - 12} ${y + 3} C ${x - 16 + sway} ${y + 34} ${x - 12 + sway * 1.5} ${y + 64} ${x - 8 + sway * 2} ${y + 84} L ${x + 10 + sway * 2} ${y + 84} C ${x + 16 + sway * 1.5} ${y + 64} ${x + 16 + sway} ${y + 34} ${x + 12} ${y + 3} Z`} fill="#f2ead8" stroke={INK} strokeWidth={4} />
  </g>
);
// 걷는 몽골 상인·사신 (옆모습, 오른쪽을 봄 - flip이면 왼쪽). (x,y) = 발 아래 땅, s (키 약 300). 앞손 = 고삐(또는 깃대)를 쥔 손 (merchantHand)
// banner 흰 툭 깃대를 듦 · paiza 목에 칸의 패 · shaved 수염이 밀려 손으로 턱을 가림(사신)
const merchantHand = (x: number, y: number, s: number, flip = false) => [x + (flip ? -64 : 64) * s, y - 150 * s];
export const Merchant = ({ x, y, s, phase = 0, v = 0, walk = true, look = 0, flip = false, banner = false, paiza = false, shaved = false }: { x: number; y: number; s: number; phase?: number; v?: number; walk?: boolean; look?: number; flip?: boolean; banner?: boolean; paiza?: boolean; shaved?: boolean }) => {
  const f = useCurrentFrame();
  const sw = walk ? Math.sin(phase) * 0.35 : 0;
  const bob = walk ? Math.abs(Math.cos(phase)) * 4 : 0;
  const robe = ROBES[v % ROBES.length];
  const legD = (a: number) => `M 0 -60 L ${Math.sin(a) * 60} ${-60 + Math.cos(a) * 60}`;
  return (
    <svg width={260 * s} height={520 * s} viewBox="-120 -500 260 520" style={{ position: "absolute", left: x - 120 * s, top: y - 500 * s, transform: flip ? "scaleX(-1)" : undefined, transformOrigin: `${120 * s}px ${500 * s}px`, ...ink }}>
      <ellipse cx={0} cy={2} rx={60} ry={9} fill="rgba(43,29,20,0.22)" />
      {[sw, -sw].map((a, i) => (
        <g key={i}>
          <path d={legD(a)} stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <path d={legD(a)} stroke={i ? "#3a2b22" : "#4a382a"} strokeWidth={14} strokeLinecap="round" />
        </g>
      ))}
      <g transform={`translate(0 ${-bob})`}>
        <path d="M -16 -226 C -50 -160 -40 -90 -50 -44 C -20 -36 30 -36 52 -44 C 46 -100 40 -170 26 -226 Z" fill={robe} stroke={INK} strokeWidth={6} />
        <path d="M 24 -224 C 4 -204 -4 -184 -2 -150" stroke={INK} strokeWidth={4} fill="none" />
        <path d="M 24 -224 C 4 -204 -4 -184 -2 -150" stroke="#c9a24a" strokeWidth={2} fill="none" />
        <path d="M -40 -140 C -10 -132 20 -132 42 -140" stroke="#2f4a5e" strokeWidth={10} fill="none" />
        {paiza && (
          <g>
            <path d="M -8 -226 L 6 -196 L 20 -226" stroke="#a8332a" strokeWidth={3} fill="none" />
            <rect x={-2} y={-198} width={16} height={26} rx={4} fill="#e0b84a" stroke={INK} strokeWidth={3} />
            <circle cx={6} cy={-185} r={3.5} fill={INK} />
          </g>
        )}
        {shaved ? (
          <>
            <path d="M 6 -214 C 36 -196 46 -214 34 -236" stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
            <path d="M 6 -214 C 36 -196 46 -214 34 -236" stroke={robe} strokeWidth={16} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 6 -214 C 30 -190 50 -170 62 -152" stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
            <path d="M 6 -214 C 30 -190 50 -170 62 -152" stroke={robe} strokeWidth={16} fill="none" strokeLinecap="round" />
          </>
        )}
        {banner && (
          <g>
            <path d="M 64 -60 L 64 -420" stroke={INK} strokeWidth={9} />
            <path d="M 64 -60 L 64 -420" stroke="#7a5230" strokeWidth={4} />
            <MiniTug x={64} y={-420} sway={Math.sin(f / 10 + v) * 4} />
          </g>
        )}
        <g transform={`rotate(${look * -18} 4 -236)`}>
          <circle cx={4} cy={-262} r={30} fill={SKIN} stroke={INK} strokeWidth={5} />
          <path d="M 30 -266 L 40 -256 L 30 -252" fill={SKIN} stroke={INK} strokeWidth={4} />
          {!shaved && <path d="M -6 -246 C 0 -224 26 -222 32 -246 C 22 -238 8 -238 -6 -246 Z" fill="#2a1d14" stroke={INK} strokeWidth={3} />}
          {shaved && <path d="M 2 -244 C 10 -236 22 -236 30 -244" stroke="#b88a66" strokeWidth={3} fill="none" />}
          <circle cx={18} cy={-266} r={3.5} fill={INK} />
          <path d="M 8 -278 L 28 -274" stroke={INK} strokeWidth={4} />
          <path d="M -30 -274 C -28 -306 -2 -318 8 -324 C 18 -316 38 -302 38 -274 Z" fill={MHAT[v % MHAT.length]} stroke={INK} strokeWidth={5} />
          <path d="M -34 -278 C -14 -266 24 -266 42 -278 L 42 -266 C 22 -254 -14 -254 -34 -266 Z" fill="#6b4a2e" stroke={INK} strokeWidth={4} />
          <path d="M -32 -270 L -40 -236 L -22 -246 Z" fill="#6b4a2e" stroke={INK} strokeWidth={4} />
        </g>
        {shaved && <circle cx={34} cy={-238} r={11} fill={SKIN} stroke={INK} strokeWidth={4} />}
        {!shaved && <circle cx={64} cy={-150} r={11} fill={SKIN} stroke={INK} strokeWidth={4} />}
      </g>
    </svg>
  );
};
// 몽골 모자 뒷모습 (털 챙 + 귀덮개)
const HatBack = ({ cy, c }: { cy: number; c: string }) => (
  <>
    <path d={`M -46 ${cy} C -44 ${cy - 52} -10 ${cy - 70} 0 ${cy - 74} C 10 ${cy - 70} 44 ${cy - 52} 46 ${cy} Z`} fill={c} stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={cy} rx={54} ry={14} fill="#6b4a2e" stroke={INK} strokeWidth={5} />
    <path d={`M -50 ${cy + 4} L -54 ${cy + 40} L -34 ${cy + 26} Z M 50 ${cy + 4} L 54 ${cy + 40} L 34 ${cy + 26} Z`} fill="#6b4a2e" stroke={INK} strokeWidth={4} />
  </>
);
// 무릎 꿇은 몽골 사신·상인 (뒷모습). (x,y) = 무릎 아래 땅, bow 0~1 엎드려 절함
const EnvoyBack = ({ x, y, s, bow = 0, robe = "#4f6e7a", hat = "#8a3b2c" }: { x: number; y: number; s: number; bow?: number; robe?: string; hat?: string }) => (
  <svg width={300 * s} height={340 * s} viewBox="-150 -320 300 340" style={{ position: "absolute", left: x - 150 * s, top: y - 320 * s, ...ink }}>
    <ellipse cx={0} cy={4} rx={120} ry={14} fill="rgba(43,29,20,0.25)" />
    <ellipse cx={-46} cy={-8} rx={30} ry={13} fill="#4a382a" stroke={INK} strokeWidth={4} />
    <ellipse cx={46} cy={-8} rx={30} ry={13} fill="#4a382a" stroke={INK} strokeWidth={4} />
    <g transform={`translate(0 ${bow * 40}) scale(1 ${1 - bow * 0.18})`}>
      <path d="M -106 -6 C -116 -70 -96 -160 -54 -190 L 54 -190 C 96 -160 116 -70 106 -6 Z" fill={robe} stroke={INK} strokeWidth={6} />
      <path d="M -70 -170 C -76 -120 -84 -60 -84 -10 M 70 -170 C 76 -120 84 -60 84 -10 M 0 -190 L 0 -10" stroke={INK} strokeWidth={3} opacity={0.4} fill="none" />
      <path d="M -100 -96 C -40 -84 40 -84 100 -96" stroke="#2f4a5e" strokeWidth={12} fill="none" />
      <path d="M -24 -196 L 24 -196 L 18 -178 L -18 -178 Z" fill={SKIN} stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={-222} r={36} fill="#2a1d14" stroke={INK} strokeWidth={5} />
      <path d="M -12 -192 C -18 -170 -16 -150 -10 -136 M 12 -192 C 18 -170 16 -150 10 -136" stroke="#2a1d14" strokeWidth={8} fill="none" />
      <HatBack cy={-232} c={hat} />
    </g>
  </svg>
);
// 호라즘 병사 (실루엣, 앞모습, 작은 머리 + 터번을 감은 뾰족 투구). (x,y) = 발, s (키 약 400)
//   blade < 0: 창을 든 병사 (spear = 창 기울기, 0 곧게 위 → + 앞으로 내림) · blade 0~1: 휜 칼을 내린 데서 머리 위로 들어 올림
export const Spearman = ({ x, y, s, spear = 0, blade = -1, col = "#1d1612" }: { x: number; y: number; s: number; spear?: number; blade?: number; col?: string }) => {
  const hand = blade < 0 ? [70, -150] : [lerp(blade, 0, 1, 74, 40), lerp(blade, 0, 1, -120, -360)];
  const sw = blade < 0 ? 0 : lerp(blade, 0, 1, 160, -12);
  const wrap = col === "#1d1612" ? "#3a2c22" : "#5a4636";
  return (
    <svg width={300 * s} height={480 * s} viewBox="-150 -460 300 480" style={{ position: "absolute", left: x - 150 * s, top: y - 460 * s, ...ink }}>
      <g fill={col} stroke={col} strokeLinejoin="round">
        <rect x={-36} y={-76} width={28} height={76} rx={10} />
        <rect x={8} y={-76} width={28} height={76} rx={10} />
        <path d="M -60 -206 C -70 -150 -76 -100 -74 -62 L 74 -62 C 76 -100 70 -150 60 -206 C 40 -222 -40 -222 -60 -206 Z" />
        <path d="M -60 -200 C -84 -170 -90 -130 -80 -104" strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d="M -16 -214 L 16 -214 L 14 -196 L -14 -196 Z" />
        <circle cx={0} cy={-242} r={34} />
        <path d="M -46 -252 C -48 -276 -30 -286 0 -288 C 30 -286 48 -276 46 -252 C 30 -244 -30 -244 -46 -252 Z" stroke={wrap} strokeWidth={3} />
        <path d="M -38 -276 C -20 -268 20 -268 38 -276" fill="none" stroke={wrap} strokeWidth={3} />
        <path d="M -30 -284 C -24 -310 -10 -326 0 -350 C 10 -326 24 -310 30 -284 Z" />
        <path d="M -36 -250 L -40 -214 L -22 -226 Z" />
        <path d={`M 52 -198 Q ${(52 + hand[0]) / 2 + 26} ${(-198 + hand[1]) / 2 + 20} ${hand[0]} ${hand[1]}`} strokeWidth={30} strokeLinecap="round" fill="none" />
        {blade < 0 ? (
          <g transform={`rotate(${spear} ${hand[0]} ${hand[1]})`}>
            <path d={`M ${hand[0]} ${hand[1] + 140} L ${hand[0]} ${hand[1] - 250}`} strokeWidth={10} />
            <path d={`M ${hand[0]} ${hand[1] - 290} L ${hand[0] - 12} ${hand[1] - 246} L ${hand[0] + 12} ${hand[1] - 246} Z`} />
          </g>
        ) : (
          <g transform={`translate(${hand[0]} ${hand[1]}) rotate(${sw})`}>
            <rect x={-8} y={-6} width={16} height={34} rx={4} />
            <path d="M -24 -6 L 24 -6" strokeWidth={10} />
            <path d="M -8 -8 C -12 -80 -2 -150 26 -196 C 16 -140 10 -80 8 -8 Z" />
          </g>
        )}
      </g>
    </svg>
  );
};
// ================= 호라즘 깃발 (초록 기, 금테, 팔각 별 - 글자 없음) =================
export const KhFlag = ({ x, y, h = 260, fall = 0, pop = 1, dir = 1 }: { x: number; y: number; h?: number; fall?: number; pop?: number; dir?: number }) => {
  const f = useCurrentFrame();
  const w = Math.sin(f / 9 + x * 0.01) * 6;
  const k = h / 260;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `rotate(${fall * 82 * dir}deg)`, transformOrigin: `${x}px ${y}px`, opacity: 1 - fall * 0.4 }}>
      <svg width={200 * k} height={300 * k} viewBox="-20 -280 200 300" style={{ position: "absolute", left: x - 20 * k, top: y - 280 * k, transform: `scale(${pop})`, transformOrigin: `${20 * k}px ${280 * k}px`, ...ink }}>
        <path d="M 0 0 L 0 -250" stroke={INK} strokeWidth={10} />
        <path d="M 0 0 L 0 -250" stroke="#6a4a2e" strokeWidth={5} />
        <circle cx={0} cy={-258} r={10} fill="#d9a92e" stroke={INK} strokeWidth={4} />
        <path d={`M 4 -244 L 124 ${-238 + w} L 124 ${-120 + w} L 64 ${-142 + w * 0.5} L 4 -120 Z`} fill="#2e6b4f" stroke={INK} strokeWidth={5} />
        <path d={`M 14 -232 L 114 ${-228 + w} L 114 ${-132 + w} L 64 ${-152 + w * 0.5} L 14 -134 Z`} fill="none" stroke="#d9a92e" strokeWidth={5} />
        <g transform={`translate(64 ${-192 + w * 0.5})`}>
          <rect x={-17} y={-17} width={34} height={34} fill="#d9a92e" stroke={INK} strokeWidth={3} />
          <rect x={-17} y={-17} width={34} height={34} fill="#d9a92e" stroke={INK} strokeWidth={3} transform="rotate(45)" />
          <circle r={8} fill="#2e6b4f" />
        </g>
      </svg>
    </div>
  );
};

// ================= 지도 (중앙아시아·몽골) =================
export const MX = (lon: number) => (lon - 40) * 39.0244;
export const MY = (lat: number) => (55.711 - lat) * 52.5125;
const P = (lon: number, lat: number) => [MX(lon), MY(lat)];
const poly = (pts: number[][], close = true) => "M " + pts.map(([lo, la]) => `${MX(lo).toFixed(0)} ${MY(la).toFixed(0)}`).join(" L ") + (close ? " Z" : "");
const smooth = (pts: number[][]) => {
  const q = pts.map(([lo, la]) => [MX(lo), MY(la)]);
  let d = `M ${q[0][0].toFixed(0)} ${q[0][1].toFixed(0)}`;
  for (let i = 1; i < q.length - 1; i++) {
    const mx = (q[i][0] + q[i + 1][0]) / 2, my = (q[i][1] + q[i + 1][1]) / 2;
    d += ` Q ${q[i][0].toFixed(0)} ${q[i][1].toFixed(0)} ${mx.toFixed(0)} ${my.toFixed(0)}`;
  }
  const l = q[q.length - 1];
  return d + ` L ${l[0].toFixed(0)} ${l[1].toFixed(0)}`;
};
export const MAP_W = 3200, MAP_H = 1440;
// 1218년 무렵 (대충 - "많이 가졌다"만 보이게, 02 지도 원칙)
export const KHWARAZM = poly([[69.2, 44.4], [66, 45.6], [62, 46.6], [58.5, 46], [55.4, 45.2], [53.4, 42], [53, 40], [54, 37.4], [51, 36.6], [49, 37.4], [47.4, 37], [46.4, 35], [47.6, 33.4], [50, 31], [53, 28.6], [56, 27.2], [58, 25.8], [61.6, 25.2], [63, 27], [66, 29.6], [68.6, 32], [70.2, 34.6], [71.6, 36.6], [72.6, 38.6], [71.6, 40.4], [70.8, 41.4], [69.6, 42.8]]);
const MONGOL = poly([[73.6, 44.2], [78, 46.6], [83, 49.6], [88, 50.6], [92, 52.6], [98, 52.2], [104, 51.6], [110, 50.6], [116, 50.2], [120, 48.2], [121, 45], [119, 42], [117.2, 40.4], [114, 39], [110, 39.6], [106, 38.6], [101, 38.2], [96, 40], [90, 42], [84, 42.6], [78, 41.8], [74.2, 42.6]]);
// 1218년의 아랄해 (지금보다 훨씬 큼 - 자료의 호수는 오늘날 모양이라 옛 물가를 대충 덧그림)
const ARAL = smooth([[59.4, 46.3], [60.6, 46.8], [61.7, 46.4], [61.9, 45.3], [61.1, 44.3], [60.1, 43.5], [58.9, 43.7], [58.2, 44.5], [58.3, 45.5], [59.4, 46.3]]);
const SYR = smooth([[71.6, 40.9], [70.2, 40.4], [68.9, 40.9], [68.6, 42], [68.3, 42.85], [67.3, 43.9], [65.5, 44.8], [63.4, 45.7], [61.8, 46.1]]);
const AMU = smooth([[68.6, 37.1], [66.5, 37.4], [64.8, 38.5], [63.4, 39.2], [62.2, 40.4], [61.2, 41.3], [60.4, 42.2], [59.9, 43.2], [59.9, 43.7]]);
const ILI = smooth([[82.2, 43.9], [80, 43.9], [77.8, 44.2], [76.6, 45.2], [76.2, 45.9]]);
const KHER = smooth([[108.6, 48.6], [111.6, 47.6], [114.6, 47.6], [116.6, 48.8]]);
const ORKH = smooth([[101.8, 46.8], [103, 47.8], [104.5, 49], [106, 50.2]]);
const YELLOW = smooth([[101.6, 36], [104.6, 36.8], [106.4, 39.2], [107.6, 40.6], [110, 40.8], [111, 39.2], [110.4, 36], [111.6, 34.8], [114.4, 34.9], [117, 36.4], [118.8, 37.6]]);
export const KH_CITIES = [P(60.6, 42.3), P(67, 39.65), P(64.4, 39.8), P(58.8, 36.2), P(62.2, 34.35), P(51.4, 35.7), P(68.3, 42.85)]; // 우르겐치·사마르칸트·부하라·니샤푸르·헤라트·레이·오트라르
const OTRAR = P(68.3, 42.85);
const MG_TUGS = [P(102.8, 47.2), P(110.5, 47.4), P(116.4, 39.9), P(89, 44), P(81, 44)];
const ROUTE = [P(102.8, 47.2), P(96, 46.2), P(89, 44), P(81, 44), P(76, 43.1), P(72.3, 42.6), P(68.3, 42.85)];
const MAP_MTN: number[][] = [
  [70.5, 42], [72.5, 42.3], [74.5, 42.6], [76.5, 42.4], [78.5, 42.2], [80.5, 42.6], [82.5, 43], [85, 43.2], [87.5, 43.4], // 톈산
  [72.5, 38.6], [74, 38], [72, 37.4], // 파미르
  [68.5, 35.4], [70, 35.8], [66.5, 34.8], // 힌두쿠시
  [57.5, 38.2], [59.5, 37.4], [51.6, 36.2], [53.6, 36], // 코페트다그·엘부르즈
  [48.6, 33.6], [50.6, 31.8], [52.6, 30.4], // 자그로스
  [87.5, 49.2], [90, 48.2], [92, 47.2], // 알타이
  [98, 47.6], [100, 47], [101, 48.2], // 항가이
  [108.6, 49.2], [110, 48.8], // 헨티
  [80, 36.4], [84, 36], [88, 36.6], // 쿤룬
];
const DESERTS: [number, number, number, number][] = [[59.2, 39.4, 210, 110], [64.2, 42.4, 170, 90], [83, 39.2, 330, 110], [105, 43, 380, 120]]; // 카라쿰·키질쿰·타클라마칸·고비
const MapMtn = ({ x, y, s = 1.6 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 0 L -6 -64 L 10 -40 L 22 -54 L 52 0 Z" fill="#a89a80" stroke={INK} strokeWidth={4} />
    <path d="M -16 -48 L -6 -64 L 4 -48 L -4 -44 Z" fill="#f2ead8" />
  </g>
);
// 호라즘 도시: 둥근 지붕 + 첨탑
const MapCity = ({ x, y, s = 1, op = 1 }: { x: number; y: number; s?: number; op?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M -30 0 L -30 -26 L 30 -26 L 30 0 Z" fill="#e8dcc0" stroke={INK} strokeWidth={4} />
    <path d="M -18 -26 C -18 -52 18 -52 18 -26 Z" fill="#5d86a8" stroke={INK} strokeWidth={4} />
    <path d="M 24 -26 L 24 -64 L 32 -64 L 32 -26" fill="#e8dcc0" stroke={INK} strokeWidth={4} />
    <path d="M 22 -64 L 28 -74 L 34 -64 Z" fill="#c9a24a" stroke={INK} strokeWidth={3} />
  </g>
);
const ptAt = (pts: number[][], t: number) => {
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
// 해안선(땅·호수) 읽기 - 한 번만 나눠 둠
const ASIA: { land?: string; lakes?: string } = {};
const useAsia = () => {
  const t = useText("hook/m01/asia.svg");
  return useMemo(() => {
    if (!t) return null;
    if (!ASIA.land) {
      const ds = [...t.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
      ASIA.land = ds[0];
      ASIA.lakes = ds[1];
    }
    return ASIA as { land: string; lakes: string };
  }, [t]);
};
// 지도 판 (MAP_W×MAP_H). kh 호라즘 색 퍼짐 0~1, mg 몽골 색, route 무역로 0~1, gone 그림자 앞머리(이 x보다 오른쪽 = 어둠, 없으면 -1)
export const MapBoard = ({ kh, mg = 1, route = 0, gone = -1 }: { kh: number; mg?: number; route?: number; gone?: number }) => {
  const a = useAsia();
  const kc = [MX(64), MY(39.5)];
  if (!a) return <Paper />;
  return (
    <svg width={MAP_W} height={MAP_H} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <defs>
        <clipPath id="ch5-land"><path d={a.land} clipRule="evenodd" /></clipPath>
        <clipPath id="ch5-kh"><circle cx={kc[0]} cy={kc[1]} r={1300 * kh} /></clipPath>
        <mask id="ch5-route">
          <path d={"M " + ROUTE.map((p) => p.join(" ")).join(" L ")} stroke="#fff" strokeWidth={30} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - route} />
        </mask>
      </defs>
      <rect width={MAP_W} height={MAP_H} fill="#c3cbbd" />
      <path d={a.land} fill="#e6d2a2" fillRule="evenodd" stroke={INK} strokeWidth={5} />
      <g clipPath="url(#ch5-land)">
        {DESERTS.map(([lo, la, rx, ry], i) => (
          <g key={i}>
            <ellipse cx={MX(lo)} cy={MY(la)} rx={rx} ry={ry} fill="#ecdba8" />
            {Array.from({ length: 26 }).map((_, j) => <circle key={j} cx={MX(lo) + (((j * 137) % 200) / 100 - 1) * rx * 0.85} cy={MY(la) + (((j * 71) % 200) / 100 - 1) * ry * 0.7} r={3} fill="#b39a62" />)}
            {[-0.5, 0, 0.5].map((u) => <path key={u} d={`M ${MX(lo) + u * rx - 40} ${MY(la) + u * ry * 0.4} q 20 -12 40 0 q 20 -12 40 0`} stroke="#b39a62" strokeWidth={4} fill="none" />)}
          </g>
        ))}
        <path d={MONGOL} fill="#6d8fb0" opacity={0.62 * mg} stroke={INK} strokeWidth={5} strokeDasharray="20 12" />
        <g clipPath="url(#ch5-kh)">
          <path d={KHWARAZM} fill="#5f8a5a" opacity={0.62} stroke={INK} strokeWidth={6} strokeDasharray="20 12" />
        </g>
      </g>
      <path d={a.lakes} fill="#c3cbbd" stroke={INK} strokeWidth={4} />
      <path d={ARAL} fill="#c3cbbd" stroke={INK} strokeWidth={4} />
      {[SYR, AMU, ILI, KHER, ORKH, YELLOW].map((d, i) => <path key={i} d={d} stroke="#6f93a8" strokeWidth={i < 2 ? 9 : 7} fill="none" strokeLinecap="round" />)}
      {MAP_MTN.map(([lo, la], i) => <MapMtn key={i} x={MX(lo)} y={MY(la)} s={1.05 + (i % 3) * 0.15} />)}
      {KH_CITIES.map(([x, y], i) => <MapCity key={i} x={x} y={y + 6} s={1.2} op={k01(kh * 3 - 0.6 - i * 0.12)} />)}
      {route > 0 && (
        <g mask="url(#ch5-route)">
          <path d={"M " + ROUTE.map((p) => p.join(" ")).join(" L ")} stroke={INK} strokeWidth={7} strokeDasharray="22 16" fill="none" strokeLinecap="round" />
        </g>
      )}
      {gone >= 0 && <rect x={gone} y={0} width={MAP_W} height={MAP_H} fill="url(#ch5-dark)" />}
      <defs>
        <linearGradient id="ch5-dark" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#0c0907" stopOpacity={0} />
          <stop offset="0.12" stopColor="#0c0907" stopOpacity={0.32} />
          <stop offset="1" stopColor="#0c0907" stopOpacity={0.42} />
        </linearGradient>
      </defs>
    </svg>
  );
};
// 지도 카메라: 판 좌표 (cx,cy)를 화면 가운데로, z 배율 (가장자리 틈 없이)
export const MapCam = ({ z, cx, cy, blur = 0, children }: { z: number; cx: number; cy: number; blur?: number; children: React.ReactNode }) => {
  const tx = Math.max(Math.min(960 - cx * z, 0), 1920 - MAP_W * z);
  const ty = Math.max(Math.min(540 - cy * z, 0), 1080 - MAP_H * z);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: MAP_W, height: MAP_H, transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "0 0", filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {children}
    </div>
  );
};
// 무역 물건 (비단 꾸러미 · 동전 자루)
const Goods = ({ x, y, item, s = 1 }: { x: number; y: number; item: "silk" | "coin"; s?: number }) => (
  <svg width={90 * s} height={80 * s} viewBox="-45 -70 90 80" style={{ position: "absolute", left: x - 45 * s, top: y - 70 * s, ...ink }}>
    <ellipse cx={0} cy={4} rx={36} ry={7} fill="rgba(43,29,20,0.25)" />
    {item === "silk" ? (
      <>
        <rect x={-34} y={-44} width={68} height={44} rx={10} fill="#c9a24a" stroke={INK} strokeWidth={4} />
        <path d="M -14 -44 L -14 0 M 14 -44 L 14 0" stroke="#a8332a" strokeWidth={6} />
        <path d="M -30 -50 C -10 -64 10 -64 30 -50" stroke="#a8332a" strokeWidth={5} fill="none" />
      </>
    ) : (
      <>
        <path d="M -26 0 C -40 -20 -26 -44 -10 -48 L -16 -60 L 16 -60 L 10 -48 C 26 -44 40 -20 26 0 Z" fill="#8a6a3a" stroke={INK} strokeWidth={4} />
        <path d="M -14 -50 L 14 -50" stroke="#c9a24a" strokeWidth={5} />
        <circle cx={-6} cy={-22} r={9} fill="#e8c35a" stroke={INK} strokeWidth={3} />
        <circle cx={10} cy={-14} r={8} fill="#e8c35a" stroke={INK} strokeWidth={3} />
      </>
    )}
  </svg>
);

// ================= 장면 =================
// 1) c5_01~02 지도: 몽골(흰 툭, 칭기즈칸) → "서쪽을 봅니다"에서 카메라가 서쪽으로 휙 → 호라즘 색이 퍼지고 도시마다 초록 깃발, 샤 무함마드
//    → c5_02 카메라가 빠지며 두 나라가 한눈에: 서로 마주 본 두 왕 사이로 무역로(점선)가 그어지고 비단·동전이 오감
const GEN_AT = [2330, 820];
const SHAH_AT = [600, 905];
const S1 = ({ at }: ShotProps) => {
  const f = useCurrentFrame();
  const b = at("c5_02");
  // 2026-10-26 사용자: "처음에 산속 어딘가 같아" → 첫 프레임부터 지도 전체(바다·호수·강·두 나라 영역 색·깃발)를 보이고, 흐림 없이 서쪽으로 미끄러져 들어감
  const pan0 = 46, pan1 = 96;
  const pk = lerp(f, pan0, pan1, 0, 1, true);
  const out = lerp(f, b, b + 50, 0, 1, true);
  const cx = interpolate(pk, [0, 1], [1700, 880]) * (1 - out) + 1660 * out;
  const cy = interpolate(pk, [0, 1], [720, 820]) * (1 - out) + 740 * out;
  const z = interpolate(pk, [0, 1], [0.76, 1.3]) * (1 - out) + 0.76 * out;
  const speed = 0;
  const reveal = sec(3.8);
  const kh = 1;
  const route = lerp(f, b + 18, b + 70, 0, 1, true);
  const shahIn = reveal + 30;
  return (
    <AbsoluteFill style={{ background: "#c3cbbd" }}>
      <MapCam z={z} cx={cx} cy={cy} blur={speed * 4}>
        <MapBoard kh={kh} route={route} />
        {MG_TUGS.map(([x, y], i) => <Tug key={i} x={x} y={y} h={170} sway={Math.sin((f + i * 9) / 12) * 4} />)}
        {KH_CITIES.map(([x, y], i) => {
          // 깃발은 처음부터 서 있고, "호라즘 제국"에서 한 번 더 크게 튐
          const t = f - (reveal + 6 + i * 4);
          const pop = t > 0 ? 1 + 0.25 * Math.sin(Math.min(1, t / 14) * Math.PI) : 1;
          return <KhFlag key={i} x={x + 34} y={y} h={140} pop={pop} />;
        })}
        {/* 칭기즈칸: "서쪽을 봅니다"에서 서쪽(왼쪽)을 가리킴 → c5_02에선 두 손을 펼침 (장사) */}
        <Char id="genghis" x={GEN_AT[0]} h={330} pose="front" flip bottom={MAP_H - GEN_AT[1]} enter="none" beat="none" gesture={f < b ? "point" : "open"} gestureAt={f < b ? sec(1.4) : b + 30} />
        {f >= shahIn && <Char id="muhammad" x={SHAH_AT[0]} h={330} pose="front" bottom={MAP_H - SHAH_AT[1]} enter="pop" delay={shahIn} beat="none" gesture={f >= b ? "open" : undefined} gestureAt={b + 40} />}
        {/* 무역로 위로 오가는 비단(동 → 서)·동전(서 → 동) */}
        {route >= 1 && [0, 1, 2].map((i) => <Goods key={`s${i}`} item="silk" s={1.2} x={ptAt(ROUTE, ((f - b - 70) / 70 + i / 3) % 1)[0]} y={ptAt(ROUTE, ((f - b - 70) / 70 + i / 3) % 1)[1] - 10} />)}
        {route >= 1 && [0, 1].map((i) => {
          const p = ptAt(ROUTE, 1 - (((f - b - 70) / 70 + i / 2 + 0.25) % 1));
          return <Goods key={`c${i}`} item="coin" s={1.2} x={p[0]} y={p[1] + 26} />;
        })}
      </MapCam>
      <SFX name="map" at={0} vol={0.35} dur={45} />
      <SFX name="whoosh" at={pan0 - 4} vol={0.35} dur={50} />
      <SFX name="drum" at={reveal} vol={0.35} dur={60} />
      <SFX name="coins" at={b + 74} vol={0.25} dur={40} />
    </AbsoluteFill>
  );
};

// 2) c5_03 노을진 칭기즈칸의 큰 진영 (해는 서쪽=왼쪽에 짐): 호위병·툭·게르 앞의 칸이 무릎 꿇은 상인 사신에게 말함
//    "해가 지는 쪽" - 지는 해를 가리킴 → "해가 뜨는 쪽의 왕" - 주먹을 가슴께로 → "장사나 하자" - 두 손을 펼침. 사신 뒤엔 짐 실은 낙타들이 기다림
const BigGer = ({ x, y }: { x: number; y: number }) => <Ger x={x} y={y} w={460} door="#c9a24a" lit={0.5} />;
export const Guard = ({ x, h, bottom, flip = false }: { x: number; h: number; bottom: number; flip?: boolean }) => {
  const sx = x + (flip ? -1 : 1) * h * 0.24;
  return (
    <>
      <svg width={40} height={h * 1.15} viewBox={`0 0 40 ${h * 1.15}`} style={{ position: "absolute", left: sx - 20, bottom: bottom + 10, ...ink }}>
        <path d={`M 20 ${h * 1.15} L 20 40`} stroke={INK} strokeWidth={10} />
        <path d={`M 20 ${h * 1.15} L 20 40`} stroke="#7a5230" strokeWidth={5} />
        <path d="M 20 2 L 8 44 L 32 44 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
        <path d="M 10 50 C 4 70 8 86 14 96 M 30 50 C 36 70 32 86 26 96" stroke="#a8332a" strokeWidth={6} fill="none" />
      </svg>
      <Char id="archer" x={x} h={h} pose="front" flip={flip} bottom={bottom} enter="none" beat="none" />
    </>
  );
};
const S2 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  // 조각 시작 0.3·3.0·5.5초 ("우리 사이에 평화를 맺고, 상인들이 마음껏 오가게 하자" - 2026-10-27 "장사나 하자"에서 바꿈, 줄이 9.5초로 늘어남)
  // 영어 본편 기준: "I am the ruler" 3.2초, "Let there be peace" 7.5초 (줄 13.5초)
  const g1 = sec(0.4), g2 = sec(3.2), g3 = sec(7.5);
  const gesture = f < g2 ? "point" : f < g3 ? "fist" : "open";
  const gAt = f < g2 ? g1 : f < g3 ? g2 : g3;
  const bow = lerp(f, sec(12.6), sec(13.3), 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={1000} cy={640}>
        <AbsoluteFill style={{ transform: "scaleX(-1)" }}>
          <Steppe time="dusk" horizon={600} />
        </AbsoluteFill>
        <Glow x={490} y={540} r={520} color="#f6b06a" op={0.4} />
        {/* 진영: 지평선의 게르들 + 흰 툭 아홉 */}
        {Array.from({ length: 11 }).map((_, i) => <Ger key={i} x={120 + i * 170 + ((i * 53) % 40)} y={636 + (i % 3) * 12} w={120 + ((i * 37) % 50)} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={0.6} />)}
        {Array.from({ length: 9 }).map((_, i) => <Tug key={i} x={1010 + i * 105} y={640 - Math.abs(i - 4) * 4} h={300} sway={Math.sin((f + i * 11) / 13) * 5} />)}
        <BigGer x={1420} y={700} />
        {/* 사신 뒤에 기다리는 짐 실은 낙타들 + 고삐를 쥔 상인 */}
        <Camel x={190} y={760} s={0.5} walk={false} load="carpet" v={1} sway={Math.sin(f / 20) * 3} />
        <Camel x={400} y={772} s={0.55} walk={false} load="bales" v={0} sway={Math.sin(f / 23) * 3} />
        <Rope a={camelNose(190, 760, 0.5)} b={camelRear(400, 772, 0.55)} sag={14} w={3} />
        <Rope a={camelNose(400, 772, 0.55)} b={merchantHand(560, 790, 0.55)} sag={12} w={3} />
        <Merchant x={560} y={790} s={0.55} walk={false} v={4} />
        <Guard x={880} h={520} bottom={150} />
        <Guard x={1800} h={520} bottom={150} flip />
        <Char id="genghis" x={1290} h={660} pose="front" flip bottom={110} enter="none" beat="none" gesture={gesture} gestureAt={gAt} talking={talkingAt(f, at("c5_03"), "c5_03")} />
        <EnvoyBack x={700} y={1010} s={1.25} bow={bow} />
      </Cam>
      <SFX name="campfire" at={0} vol={0.15} dur={frames} />
      <SFX name="wind" at={0} vol={0.12} dur={frames} />
    </AbsoluteFill>
  );
};

// ---------- 오트라르 성벽 (네 꼭짓점으로 정한 벽면 - 정면이든 비스듬하든) ----------
// q: fb(먼 쪽 아래) nb(가까운 쪽 아래) nt(가까운 쪽 위) ft(먼 쪽 위). 벽 위 점 = pt(u 0~1 먼→가까운, v 0~1 아래→위)
type Quad = { fb: number[]; nb: number[]; nt: number[]; ft: number[] };
const qpt = (q: Quad, u: number, v: number) => {
  const b = [q.fb[0] + (q.nb[0] - q.fb[0]) * u, q.fb[1] + (q.nb[1] - q.fb[1]) * u];
  const t = [q.ft[0] + (q.nt[0] - q.ft[0]) * u, q.ft[1] + (q.nt[1] - q.ft[1]) * u];
  return [b[0] + (t[0] - b[0]) * v, b[1] + (t[1] - b[1]) * v];
};
const pts = (arr: number[][]) => arr.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
type Gate = { u0: number; u1: number; vt: number };
const gatePath = (q: Quad, g: Gate) => {
  const a = qpt(q, g.u0, 0), b = qpt(q, g.u1, 0), c = qpt(q, g.u1, g.vt * 0.72), d = qpt(q, g.u0, g.vt * 0.72);
  const top = qpt(q, (g.u0 + g.u1) / 2, g.vt * 1.06);
  return `M ${a[0]} ${a[1]} L ${d[0]} ${d[1]} Q ${d[0]} ${top[1]} ${top[0]} ${top[1]} Q ${c[0]} ${top[1]} ${c[0]} ${c[1]} L ${b[0]} ${b[1]} Z`;
};
const WALL = { face: "#c9a46a", dark: "#a8844e", top: "#d8b880" };
export const Wall = ({ q, gate, towers = [], n = 18, lit = 0, dim = 0 }: { q: Quad; gate?: Gate; towers?: number[]; n?: number; lit?: number; dim?: number }) => {
  const H = (u: number) => Math.hypot(qpt(q, u, 1)[0] - qpt(q, u, 0)[0], qpt(q, u, 1)[1] - qpt(q, u, 0)[1]);
  const merlon = (u: number, w: number, v0: number) => {
    const h = 0.085;
    const a = qpt(q, u - w / 2, v0), b = qpt(q, u + w / 2, v0), c = qpt(q, u + w / 2, v0 + h * 0.6), d = qpt(q, u - w / 2, v0 + h * 0.6), top = qpt(q, u, v0 + h * 1.15);
    return `M ${pts([a, b, c])} Q ${c[0]} ${top[1]} ${top[0]} ${top[1]} Q ${d[0]} ${top[1]} ${d[0]} ${d[1]} Z`;
  };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink, filter: `url(#kit-ink) brightness(${1 - dim})` }}>
      <path d={`M ${pts([q.fb, q.nb, q.nt, q.ft])} Z`} fill={WALL.face} stroke={INK} strokeWidth={6} />
      {Array.from({ length: n }).map((_, i) => <path key={i} d={merlon((i + 0.5) / n, 0.55 / n, 1)} fill={WALL.face} stroke={INK} strokeWidth={5} />)}
      {[0.14, 0.3, 0.46, 0.62, 0.78].map((v) => <path key={v} d={`M ${pts([qpt(q, 0, v), qpt(q, 1, v)])}`} stroke={WALL.dark} strokeWidth={3} opacity={0.6} />)}
      {Array.from({ length: 40 }).map((_, i) => {
        const u = ((i * 0.618) % 1), v = 0.07 + ((i * 0.37) % 0.85);
        const a = qpt(q, u, v), b = qpt(q, u, v + 0.08);
        return <path key={`j${i}`} d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke={WALL.dark} strokeWidth={2.5} opacity={0.45} />;
      })}
      <path d={`M ${pts([qpt(q, 0, 0.02), qpt(q, 1, 0.02)])}`} stroke="#8a6a40" strokeWidth={10} opacity={0.35} />
      {towers.map((tu, i) => {
        const w = 0.075;
        const o = 0.05; // 탑은 벽보다 높음
        const a = qpt(q, tu - w, 0), b = qpt(q, tu + w, 0), c = qpt(q, tu + w * 0.86, 1 + o), d = qpt(q, tu - w * 0.86, 1 + o);
        const hl = H(tu);
        return (
          <g key={i}>
            <path d={`M ${pts([a, b, c, d])} Z`} fill={WALL.top} stroke={INK} strokeWidth={6} />
            <path d={`M ${pts([qpt(q, tu + w * 0.5, 0), qpt(q, tu + w * 0.45, 1 + o)])}`} stroke={WALL.dark} strokeWidth={hl * 0.04} opacity={0.35} />
            {[-0.6, 0, 0.6].map((k) => <path key={k} d={merlon(tu + k * w * 0.62, w * 0.42, 1 + o)} fill={WALL.top} stroke={INK} strokeWidth={5} />)}
            {[0.35, 0.65].map((v) => {
              const p = qpt(q, tu, v);
              return <path key={v} d={`M ${p[0] - hl * 0.012} ${p[1] + hl * 0.03} L ${p[0] - hl * 0.012} ${p[1] - hl * 0.02} Q ${p[0]} ${p[1] - hl * 0.045} ${p[0] + hl * 0.012} ${p[1] - hl * 0.02} L ${p[0] + hl * 0.012} ${p[1] + hl * 0.03} Z`} fill="#2a1d14" stroke={INK} strokeWidth={3} />;
            })}
          </g>
        );
      })}
      {gate && (
        <>
          <path d={gatePath(q, gate)} fill={lit > 0 ? mix("#2a1d14", "#e09a52", lit) : "#2a1d14"} stroke={INK} strokeWidth={7} />
          <path d={gatePath(q, { u0: gate.u0 - 0.012, u1: gate.u1 + 0.012, vt: gate.vt + 0.03 })} fill="none" stroke={WALL.dark} strokeWidth={10} />
        </>
      )}
    </svg>
  );
};
// 성문 짝 (두 짝이 가운데로 닫힘, shut 0 열림 → 1 닫힘)
export const Doors = ({ q, gate, shut }: { q: Quad; gate: Gate; shut: number }) => {
  if (shut <= 0.001) return null;
  const um = (gate.u0 + gate.u1) / 2;
  const leaf = (ua: number, ub: number) => {
    const a = qpt(q, ua, 0), b = qpt(q, ub, 0), c = qpt(q, ub, gate.vt * 1.06), d = qpt(q, ua, gate.vt * 1.06);
    return `M ${pts([a, b, c, d])} Z`;
  };
  const L1 = gate.u0 + (um - gate.u0) * shut, R0 = gate.u1 - (gate.u1 - um) * shut;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <defs><clipPath id="ch5-gate"><path d={gatePath(q, gate)} /></clipPath></defs>
      <g clipPath="url(#ch5-gate)">
        {[[gate.u0, L1], [R0, gate.u1]].map(([ua, ub], i) => (
          <g key={i}>
            <path d={leaf(ua, ub)} fill="#6a4a2e" stroke={INK} strokeWidth={6} />
            {[0.25, 0.5, 0.75].map((k) => {
              const u = ua + (ub - ua) * k;
              return <path key={k} d={`M ${pts([qpt(q, u, 0), qpt(q, u, gate.vt * 1.06)])}`} stroke="#4a3220" strokeWidth={4} />;
            })}
            {[0.2, 0.5].map((v) => <path key={v} d={`M ${pts([qpt(q, ua, gate.vt * v), qpt(q, ub, gate.vt * v)])}`} stroke="#3a2a1e" strokeWidth={12} />)}
            {[0.2, 0.5].flatMap((v) => [0.2, 0.5, 0.8].map((k) => {
              const p = qpt(q, ua + (ub - ua) * k, gate.vt * v);
              return <circle key={`${v}-${k}`} cx={p[0]} cy={p[1]} r={5} fill="#8a8f90" stroke={INK} strokeWidth={2} />;
            }))}
          </g>
        ))}
      </g>
    </svg>
  );
};
// 성 안 도시 (벽 위로 보이는 둥근 지붕·첨탑)
const CityBehind = ({ x0, x1, base, s = 1 }: { x0: number; x1: number; base: number; s?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
    {Array.from({ length: 6 }).map((_, i) => {
      const x = x0 + ((i + 0.5) / 6) * (x1 - x0);
      const w = (70 + ((i * 29) % 40)) * s;
      const h = (40 + ((i * 47) % 50)) * s;
      return (
        <g key={i}>
          <path d={`M ${x - w} ${base} L ${x - w} ${base - h} L ${x + w} ${base - h} L ${x + w} ${base} Z`} fill="#d2b47e" stroke={INK} strokeWidth={4} />
          {i % 2 === 0 && <path d={`M ${x - w * 0.6} ${base - h} C ${x - w * 0.6} ${base - h - w * 1.1} ${x + w * 0.6} ${base - h - w * 1.1} ${x + w * 0.6} ${base - h} Z`} fill={i % 4 ? "#4f7d9a" : "#5d86a8"} stroke={INK} strokeWidth={4} />}
        </g>
      );
    })}
    <path d={`M ${x0 + (x1 - x0) * 0.62} ${base} L ${x0 + (x1 - x0) * 0.62} ${base - 260 * s} L ${x0 + (x1 - x0) * 0.62 + 34 * s} ${base - 260 * s} L ${x0 + (x1 - x0) * 0.62 + 34 * s} ${base} Z`} fill="#d8bc86" stroke={INK} strokeWidth={4} />
    <path d={`M ${x0 + (x1 - x0) * 0.62 - 8 * s} ${base - 260 * s} L ${x0 + (x1 - x0) * 0.62 + 17 * s} ${base - 300 * s} L ${x0 + (x1 - x0) * 0.62 + 42 * s} ${base - 260 * s} Z`} fill="#c9a24a" stroke={INK} strokeWidth={4} />
  </svg>
);
const Shrub = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <svg width={120 * s} height={70 * s} viewBox="-60 -66 120 70" style={{ position: "absolute", left: x - 60 * s, top: y - 66 * s, ...ink }}>
    <path d="M -50 0 C -56 -30 -30 -50 -10 -40 C 0 -66 40 -60 40 -34 C 60 -30 60 0 44 0 Z" fill="#8a8a5a" stroke={INK} strokeWidth={4} />
  </svg>
);

// 3) c5_04 1218 오트라르: 비스듬히 뻗은 성벽, 열린 성문으로 굽은 길을 따라 짐 실은 낙타 행렬이 지평선에서부터 줄지어 들어감 (카메라는 행렬을 따라 오른쪽으로)
const OQ: Quad = { fb: [1110, 770], nb: [1990, 1010], nt: [1990, 250], ft: [1110, 515] };
const OGATE: Gate = { u0: 0.33, u1: 0.5, vt: 0.62 };
const GATE_FOOT = qpt(OQ, 0.415, 0);
const ROAD = [[30, 556], [520, 590], [960, 930], GATE_FOOT];
const roadAt = (p: number) => {
  const t = k01(p);
  const m = 1 - t;
  const [a, b, c, d] = ROAD;
  return [m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0], m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1]];
};
const roadS = (p: number) => 0.13 + 0.5 * Math.pow(k01(p), 1.3);
const CARAVAN = 17;
export const OtrarCaravan = ({ f, frames }: { f: number; frames: number }) => {
  const head = 0.8 + f * 0.0019;
  // 문턱(p = 1)을 넘으면 문 안쪽으로 - 오른쪽 문설주·벽 뒤로 사라지며 어두워짐 (벽 오른쪽을 한 번 더 덮어 가림)
  const items = Array.from({ length: CARAVAN }).map((_, i) => {
    const p = head - i * 0.062;
    if (p <= 1) {
      const [x, y] = roadAt(p);
      return { i, p, x, y, s: roadS(p), k: 0 };
    }
    const k = Math.min(1, (p - 1) / 0.16);
    return { i, p, x: GATE_FOOT[0] + 260 * k, y: GATE_FOOT[1] - 30 * k, s: roadS(1) * (1 - 0.15 * k), k };
  }).filter((c) => c.p > 0.02 && c.p < 1.16);
  const lead = (c: { i: number }) => c.i % 4 === 0;
  const mPos = (c: { x: number; y: number; s: number }) => [c.x + 250 * c.s, c.y + 26 * c.s];
  const byP = [...items].sort((a, b) => a.p - b.p);
  const cover = [qpt(OQ, OGATE.u1, -0.06), qpt(OQ, 1.06, -0.06), qpt(OQ, 1.06, 1.4), qpt(OQ, OGATE.u1, 1.4)].map((q) => `${q[0]}px ${q[1]}px`).join(", ");
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.04, 1.14)} cx={lerp(f, 0, frames, 720, 1180, true)} cy={640}>
        <Steppe time="day" horizon={540} hills={false} />
        {/* 멀리 시르다리야 강과 갈대 */}
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <path d="M 0 578 C 400 566 800 590 1200 572 C 1500 560 1700 570 1920 566 L 1920 586 C 1700 590 1500 580 1200 594 C 800 610 400 588 0 598 Z" fill="#8fb0c0" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 24 }).map((_, i) => <path key={i} d={`M ${40 + i * 80} 600 l -4 -26 M ${48 + i * 80} 600 l 4 -22`} stroke="#6f7a4a" strokeWidth={4} />)}
          {/* 길 */}
          <path d={`M ${ROAD[0].join(" ")} C ${ROAD[1].join(" ")} ${ROAD[2].join(" ")} ${ROAD[3].join(" ")}`} stroke="#d8c08a" strokeWidth={70} fill="none" opacity={0.7} />
        </svg>
        {[[300, 700, 0.8], [700, 1000, 1.1], [180, 900, 1], [1000, 760, 0.6]].map(([x, y, s], i) => <Shrub key={i} x={x} y={y} s={s} />)}
        <CityBehind x0={1180} x1={1900} base={420} s={0.9} />
        <Wall q={OQ} gate={OGATE} towers={[0.3, 0.53, 0.9]} n={16} lit={0.15} />
        {/* 성벽 위 병사들 (작은 실루엣) */}
        {[0.12, 0.22, 0.62, 0.74].map((u, i) => {
          const p = qpt(OQ, u, 1);
          return <Spearman key={i} x={p[0]} y={p[1] + 24} s={0.2 + u * 0.1} col="#3a2a1e" />;
        })}
        <KhFlag x={qpt(OQ, 0.3, 1.05)[0]} y={qpt(OQ, 0.3, 1.05)[1]} h={170} />
        <KhFlag x={qpt(OQ, 0.53, 1.05)[0]} y={qpt(OQ, 0.53, 1.05)[1]} h={190} />
        {/* 고삐: 앞 낙타의 엉덩이 ↔ 뒤 낙타의 코, 무리마다 맨 앞은 상인의 손 */}
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          {items.map((c) => {
            const ahead = items.find((d) => d.i === c.i - 1);
            const nose = camelNose(c.x, c.y, c.s);
            const w = Math.max(2, 5 * c.s);
            if (lead(c)) return <Rope key={c.i} a={nose} b={merchantHand(mPos(c)[0], mPos(c)[1], c.s * 0.95)} sag={10 * c.s} w={w} />;
            if (!ahead) return null;
            return <Rope key={c.i} a={nose} b={camelRear(ahead.x, ahead.y, ahead.s)} sag={30 * c.s} w={w} />;
          })}
        </svg>
        {byP.map((c) => (
          <div key={c.i} style={{ position: "absolute", inset: 0, filter: c.k > 0 ? `brightness(${1 - 0.55 * c.k})` : undefined }}>
            <Camel x={c.x} y={c.y} s={c.s} phase={(f + c.i * 7) / 5} load={(["bales", "carpet", "jars", "bales"] as Load[])[c.i % 4]} v={c.i} />
            {lead(c) && <Merchant x={mPos(c)[0]} y={mPos(c)[1]} s={c.s * 0.95} phase={(f + c.i * 5) / 4} v={c.i} banner paiza />}
          </div>
        ))}
        <AbsoluteFill style={{ clipPath: `polygon(${cover})` }}>
          <Wall q={OQ} gate={OGATE} towers={[0.3, 0.53, 0.9]} n={16} lit={0.15} />
        </AbsoluteFill>
      </Cam>
    </AbsoluteFill>
  );
};
// 3-1) c5_04 앞부분 - 칭기즈칸의 진영(낮, 초원): 칸이 서쪽을 가리키고, 몽골 옷의 상인들이 흰 툭 깃발과 칸의 패를 들고 낙타를 끌고 떠남
//      (2026-10-26 사용자: "몽골 상인인지 그냥 상인인지 헷갈려, 그래서 왜 칭기즈칸이 화났는지 헷갈려")
const SEND = 112; // 이 프레임에 오트라르로 컷 ("수백 명이" 다음 쉼)
const SEND_ROAD = [[1260, 980], [900, 820], [520, 700], [120, 610]];
// pose·talking: 훅(M01Ch0)에서 칸이 웃으며 말함 (2026-10-27)
export const Sendoff = ({ f, pose = "front", talking = false }: { f: number; pose?: string; talking?: boolean }) => {
  const at = (p: number) => ptAt(SEND_ROAD, p);
  const sc = (p: number) => 0.62 - 0.46 * p;
  const items = Array.from({ length: 10 }).map((_, i) => ({ i, p: -0.12 + f * 0.004 + i * 0.1 })).filter((c) => c.p > -0.2 && c.p < 1);
  const byFar = [...items].sort((a, b) => b.p - a.p);
  const pos = (p: number) => {
    const q = at(Math.max(0, p));
    return { x: q[0] + Math.min(0, p) * 900, y: q[1] + Math.min(0, p) * 400, s: sc(Math.max(0, p)) };
  };
  return (
    <Cam z={lerp(f, 0, SEND, 1.0, 1.06)} cx={900} cy={640}>
      <Steppe time="day" horizon={560} />
      {Array.from({ length: 9 }).map((_, i) => <Ger key={i} x={980 + i * 120 + ((i * 37) % 30)} y={590 + (i % 3) * 10} w={110 + ((i * 29) % 40)} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} />)}
      {Array.from({ length: 5 }).map((_, i) => <Tug key={`t${i}`} x={1450 + i * 100} y={700} h={300} sway={Math.sin((f + i * 11) / 13) * 5} />)}
      <Guard x={1330} h={470} bottom={160} flip />
      <Char id="genghis" x={1640} h={600} pose={pose} flip bottom={110} enter="none" beat="none" gesture="point" gestureAt={8} talking={talking} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
        {items.map((c) => {
          const ahead = items.find((d) => d.i === c.i + 1);
          const q = pos(c.p);
          const nose = camelNose(q.x, q.y, q.s, 0, true);
          if (c.i % 3 === 0) return <Rope key={c.i} a={nose} b={merchantHand(q.x - 250 * q.s, q.y + 26 * q.s, q.s * 0.95, true)} sag={10 * q.s} w={Math.max(2, 5 * q.s)} />;
          if (!ahead) return null;
          const qa = pos(ahead.p);
          return <Rope key={c.i} a={nose} b={camelRear(qa.x, qa.y, qa.s, true)} sag={30 * q.s} w={Math.max(2, 5 * q.s)} />;
        })}
      </svg>
      {byFar.map((c) => {
        const q = pos(c.p);
        return (
          <React.Fragment key={c.i}>
            <Camel x={q.x} y={q.y} s={q.s} phase={(f + c.i * 7) / 5} load={(["bales", "carpet", "jars"] as Load[])[c.i % 3]} v={c.i} flip />
            {c.i % 3 === 0 && <Merchant x={q.x - 250 * q.s} y={q.y + 26 * q.s} s={q.s * 0.95} phase={(f + c.i * 5) / 4} v={c.i} flip banner paiza />}
          </React.Fragment>
        );
      })}
    </Cam>
  );
};
const S3 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f < SEND ? <Sendoff f={f} /> : <OtrarCaravan f={f - SEND} frames={frames - SEND} />}
      <SFX name="wind" at={0} vol={0.15} dur={frames} />
      <SFX name="hooves" at={0} vol={0.1} dur={frames} />
      <SFX name="crowd" at={SEND} vol={0.08} dur={frames - SEND} />
    </AbsoluteFill>
  );
};

// 4) c5_05 올려다본 성벽: 흉벽 뒤 총독 이날추크(화난 얼굴)가 내려다보며 손가락으로 가리킴, 양옆 창병. 앞에는 올려다보는 상인들의 뒷머리와 낙타
//    멈춤(⏸0.8) 동안 창병들이 창끝을 아래로 내림
const DQ: Quad = { fb: [-60, 1140], nb: [1980, 1140], nt: [1980, 700], ft: [-60, 700] };
const MerchantBackHead = ({ x, y, s, v = 0, look = 0 }: { x: number; y: number; s: number; v?: number; look?: number }) => (
  <svg width={300 * s} height={300 * s} viewBox="-150 -260 300 300" style={{ position: "absolute", left: x - 150 * s, top: y - 260 * s, ...ink }}>
    <path d="M -130 40 C -120 -40 -80 -90 0 -96 C 80 -90 120 -40 130 40 Z" fill={ROBES[v % ROBES.length]} stroke={INK} strokeWidth={6} />
    <g transform={`translate(${look * 10} ${-look * 8})`}>
      <path d="M -26 -110 L 26 -110 L 22 -86 L -22 -86 Z" fill={SKIN} stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-142} r={44} fill="#2a1d14" stroke={INK} strokeWidth={5} />
      <g transform="translate(0 -6) scale(1.15)"><HatBack cy={-140} c={MHAT[v % MHAT.length]} /></g>
    </g>
  </svg>
);
export const S4 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  // 2026-10-27 "국경 도시를 지키던 호라즘의 총독, 이날추크는 / 상인들을 첩자라 부릅니다" - "첩자라" 약 5초
  const point = sec(5.0); // 영어 "accused the merchants of spying" 4.4초~
  const lower = lerp(f, sec(5.9), sec(6.6), 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.12)} cx={960} cy={420}>
        <AbsoluteFill style={{ background: "linear-gradient(#d9c7a0, #efe0bd 70%)" }} />
        <Glow x={300} y={140} r={420} color="#fff1c8" op={0.5} />
        {/* 구름 */}
        {[[420, 170, 1], [1420, 120, 1.3], [1000, 230, 0.8]].map(([x, y, s], i) => (
          <svg key={i} width={420 * s} height={140 * s} viewBox="0 0 420 140" style={{ position: "absolute", left: x - 210 * s + Math.sin(f / 60 + i) * 6, top: y - 70 * s, ...ink, opacity: 0.8 }}>
            <path d="M 30 110 C 0 110 0 70 40 66 C 40 20 110 10 140 46 C 160 4 250 4 260 50 C 300 30 360 40 360 80 C 400 80 410 110 380 110 Z" fill="#f4ead2" stroke={INK} strokeWidth={4} />
          </svg>
        ))}
        {/* 창병 (실루엣) 과 이날추크 - 흉벽 뒤 */}
        <Spearman x={280} y={810} s={0.95} spear={lower * 58} col="#3a2c22" />
        <Spearman x={560} y={840} s={1.05} spear={lower * 64} col="#3a2c22" />
        <Spearman x={1380} y={840} s={1.05} spear={lower * 64} col="#3a2c22" />
        <Spearman x={1660} y={810} s={0.95} spear={lower * 58} col="#3a2c22" />
        <Char id="inalchuq" x={960} h={900} pose="angry" bottom={130} enter="none" beat="none" gesture={f >= point ? "point" : undefined} gestureAt={point} />
        <Wall q={DQ} towers={[0.03, 0.97]} n={11} />
        <KhFlag x={qpt(DQ, 0.03, 1.05)[0] + 30} y={qpt(DQ, 0.03, 1.05)[1]} h={330} />
        <KhFlag x={qpt(DQ, 0.97, 1.05)[0] - 40} y={qpt(DQ, 0.97, 1.05)[1]} h={330} />
        {/* 앞: 올려다보는 상인들의 뒷머리와 낙타 머리 (어둡게) */}
        <AbsoluteFill style={{ filter: "brightness(0.72) blur(1.5px)" }}>
          <Camel x={1490} y={1300} s={1.3} walk={false} low={-0.25} load="none" />
          <MerchantBackHead x={340} y={1180} s={1.5} v={0} look={k01((f - point) / 10)} />
          <MerchantBackHead x={760} y={1230} s={1.7} v={2} look={k01((f - point - 4) / 10)} />
          <MerchantBackHead x={1180} y={1200} s={1.45} v={4} look={k01((f - point - 8) / 10)} />
        </AbsoluteFill>
      </Cam>
      <SFX name="wind" at={0} vol={0.15} dur={frames} />
      <SFX name="sword" at={sec(3.75)} vol={0.3} dur={30} />
    </AbsoluteFill>
  );
};

// ================= 전용 그림: 산꼭대기의 칭기즈칸 (옆모습 - 몸·얼굴 모두 오른쪽을 봄) =================
const KHAN = { robe: "#9c3a2c", dark: "#7a2c22", trim: "#c9a24a", boot: "#3a2b22", belt: "#2f4a5e", cape: "#5b3d27", fur: "#7a5638", skin: "#dcae84", hair: "#3a2a1e", beard: "#5b4f45" };
// 칸의 흰 펠트 모자 (캐릭터 그림과 같은 모양, svg 안 묶음). (x,y) = 챙 가운데, 판 단위
const HatG = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(0.8)`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <path d="M -100 0 C -104 -102 104 -102 100 0 Z" fill="#f2ead8" />
    <path d="M 0 -90 C -10 -62 -10 -22 -4 0 M -50 -74 C -56 -52 -56 -22 -52 -2 M 50 -74 C 56 -52 56 -22 52 -2" fill="none" stroke="#c8bba0" strokeWidth={4} />
    <path d="M -124 -2 C -124 -26 124 -26 124 -2 C 124 26 -124 26 -124 -2 Z" fill="#9a7a58" />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${-110 + i * 20} 8 q 3 -10 6 0`} fill="none" stroke="#6e5238" strokeWidth={3} />)}
    <circle cx={0} cy={-98} r={11} fill="#c9a24a" />
  </g>
);
const HAT_ON_HEAD = [6, -150]; // 목 기준 모자 챙 가운데
const HAT_TOP = 80; // 챙 가운데에서 모자 꼭대기까지 - 손은 꼭대기를 쥠
// 옆모습 머리 (오른쪽을 봄, 목 = (0,0)): 정수리부터 덮은 머리카락, 귀 뒤 땋은 고리, 처진 콧수염, 턱 끝 수염. eyes 1 = 감음, mouth "0"·"1"·"2"
const ProfileHead = ({ eyes, mouth, hat, tense = false }: { eyes: 0 | 1; mouth: string; hat: boolean; tense?: boolean }) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
    <path d="M -64 -54 C -100 -44 -102 -2 -72 6 C -60 -10 -58 -32 -64 -54 Z" fill={KHAN.hair} />
    <path d="M -88 -86 C -92 -160 -30 -186 18 -182 C 70 -178 100 -140 98 -98 L 106 -86 L 114 -66 L 100 -62 C 100 -40 90 -14 64 -2 C 40 8 0 8 -30 -4 C -70 -20 -88 -50 -88 -86 Z" fill={KHAN.skin} />
    <path d="M -90 -84 C -94 -160 -30 -190 20 -186 C 64 -182 90 -158 96 -128 C 72 -144 42 -148 16 -138 C -8 -128 -26 -104 -36 -72 C -58 -74 -78 -78 -90 -84 Z" fill={KHAN.hair} />
    <path d="M -60 -150 C -40 -168 -10 -176 20 -174" fill="none" stroke="#8a817a" strokeWidth={4} />
    <ellipse cx={-30} cy={-64} rx={16} ry={21} fill={KHAN.skin} />
    <path d="M -34 -74 C -24 -70 -24 -58 -32 -54" fill="none" strokeWidth={4} />
    <path d={tense ? "M 34 -120 C 52 -116 68 -108 82 -98" : "M 36 -114 L 82 -104"} stroke={KHAN.hair} strokeWidth={11} />
    {tense && <path d="M 86 -110 C 90 -104 92 -98 90 -92" fill="none" strokeWidth={3} opacity={0.6} />}
    {eyes ? <path d="M 54 -86 Q 64 -79 75 -86" fill="none" strokeWidth={5} /> : <ellipse cx={65} cy={-88} rx={6} ry={8} fill={INK} stroke="none" />}
    <ellipse cx={50} cy={-56} rx={15} ry={8} fill="#d98a72" opacity={0.45} stroke="none" />
    {mouth === "0" ? <path d="M 84 -38 L 99 -36" fill="none" strokeWidth={4} /> : <ellipse cx={92} cy={-36} rx={8} ry={mouth === "2" ? 8 : 4.5} fill="#5a2a20" strokeWidth={3} />}
    <path d="M 100 -54 C 86 -50 74 -38 68 -14 C 80 -28 92 -40 106 -46 Z" fill={KHAN.beard} strokeWidth={4} />
    <path d="M 66 -8 C 62 6 68 20 76 24 C 80 12 78 0 76 -8 Z" fill={KHAN.beard} strokeWidth={4} />
    {hat && <HatG x={HAT_ON_HEAD[0]} y={HAT_ON_HEAD[1]} />}
  </g>
);
// 두 마디 팔 (어깨 → 팔꿈치 → 손): 길이를 지키며 팔꿈치가 자연스럽게 굽음
const ARM_L = 140;
const elbowOf = (sh: number[], hd: number[]) => {
  const dx = hd[0] - sh[0], dy = hd[1] - sh[1];
  const d = Math.min(Math.hypot(dx, dy), ARM_L * 2 - 1);
  const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
  const h = Math.sqrt(ARM_L * ARM_L - (d / 2) * (d / 2));
  const hand = [sh[0] + ux * d, sh[1] + uy * d];
  return { el: [sh[0] + (ux * d) / 2 - uy * h, sh[1] + (uy * d) / 2 + ux * h], hand };
};
// 무릎 꿇은 칭기즈칸 (옆모습, 오른쪽을 봄). (x,y) = 목, s. hand = 오른손(판 좌표), hat: 머리·손·땅, bow 0~1 몸을 앞으로 숙임, nod 고개만 숙임(도)
const KhanKneel = ({ x, y, s, hand, hat, hatGround, hatOff = [0, HAT_TOP], bow, nod = 0, eyes, mouth, tense = false }: { x: number; y: number; s: number; hand: number[]; hat: "head" | "hand" | "ground"; hatGround: number[]; hatOff?: number[]; bow: number; tense?: boolean; nod?: number; eyes: 0 | 1; mouth: string }) => {
  const R = bow * 16;
  const neck = rotP([0, 0], [0, 300], R);
  const sh = rotP([16, 40], [0, 300], R);
  const { el, hand: hd } = elbowOf(sh, hand);
  const fore = [hd[0] - (hd[0] - el[0]) * 0.2, hd[1] - (hd[1] - el[1]) * 0.2];
  return (
    <svg width={800 * s} height={760 * s} viewBox="-380 -380 800 760" style={{ position: "absolute", left: x - 380 * s, top: y - 380 * s, ...ink }}>
      <ellipse cx={-20} cy={330} rx={250} ry={22} fill="rgba(20,14,10,0.3)" />
      {hat === "ground" && <HatG x={hatGround[0]} y={hatGround[1]} />}
      <g transform={`rotate(${R} 0 300)`}>
        <path d="M -40 -6 C -120 40 -200 210 -250 324 L -70 324 C -90 220 -70 90 -30 20 Z" fill={KHAN.cape} stroke={INK} strokeWidth={7} />
        <path d="M -48 -4 C -96 30 -112 120 -104 200 C -150 230 -170 290 -150 322 L 150 322 C 170 300 160 262 120 250 L 40 236 C 52 160 54 70 44 -4 Z" fill={KHAN.robe} stroke={INK} strokeWidth={7} />
        <path d="M -44 -2 C -80 40 -92 120 -88 200" stroke={KHAN.dark} strokeWidth={20} fill="none" opacity={0.6} />
        <path d="M -100 120 C -40 132 10 132 50 122" stroke={KHAN.belt} strokeWidth={22} fill="none" />
        <path d="M -104 196 C -40 214 10 214 52 204" stroke={KHAN.trim} strokeWidth={14} fill="none" />
        <path d="M 6 -2 C 14 60 24 130 30 200" stroke={KHAN.trim} strokeWidth={8} fill="none" />
        <ellipse cx={-150} cy={318} rx={46} ry={16} fill={KHAN.boot} stroke={INK} strokeWidth={5} />
      </g>
      <g transform={`translate(${neck[0]} ${neck[1]}) rotate(${R + nod})`}>
        <ProfileHead eyes={eyes} mouth={mouth} hat={hat === "head"} tense={tense} />
      </g>
      <ellipse cx={neck[0]} cy={neck[1] + 4} rx={62} ry={22} fill={KHAN.fur} stroke={INK} strokeWidth={6} transform={`rotate(${R} ${neck[0]} ${neck[1]})`} />
      {hat === "hand" && <HatG x={hd[0] + hatOff[0]} y={hd[1] + hatOff[1]} rot={-6} />}
      {/* 팔: 넓은 소매(위팔·아래팔) + 금빛 소맷부리 + 손 */}
      <path d={`M ${sh[0]} ${sh[1]} L ${el[0]} ${el[1]} L ${fore[0]} ${fore[1]}`} stroke={INK} strokeWidth={62} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${sh[0]} ${sh[1]} L ${el[0]} ${el[1]} L ${fore[0]} ${fore[1]}`} stroke={KHAN.robe} strokeWidth={50} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${el[0]} ${el[1]} L ${fore[0]} ${fore[1]}`} stroke={KHAN.dark} strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.35} />
      <path d={`M ${fore[0]} ${fore[1]} L ${fore[0] + (hd[0] - fore[0]) * 0.35} ${fore[1] + (hd[1] - fore[1]) * 0.35}`} stroke={KHAN.trim} strokeWidth={46} strokeLinecap="butt" />
      <ellipse cx={hd[0]} cy={hd[1]} rx={22} ry={20} fill={KHAN.skin} stroke={INK} strokeWidth={5} />
    </svg>
  );
};
// 버터 등잔 (놋쇠 잔 + 불꽃). flame 0~1, smoke 0~1 막 꺼진 연기
const ButterLamp = ({ x, y, s = 1, flame, smoke = 0 }: { x: number; y: number; s?: number; flame: number; smoke?: number }) => {
  const f = useCurrentFrame();
  const k = flame * (1 + Math.sin(f / 3 + x) * 0.08);
  return (
    <>
      {flame > 0 && <Glow x={x} y={y - 60 * s} r={150 * s} color="#f6c070" op={0.55 * flame} />}
      <svg width={80 * s} height={140 * s} viewBox="-40 -120 80 140" style={{ position: "absolute", left: x - 40 * s, top: y - 120 * s, ...ink }}>
        {smoke > 0 && <path d={`M 0 -50 C -10 -70 10 -86 0 -${100 + smoke * 10}`} stroke="#b8b0a4" strokeWidth={5} fill="none" opacity={(1 - smoke) * 0.7} />}
        <path d="M -16 0 L 16 0 L 8 -14 L 4 -26 L -4 -26 L -8 -14 Z" fill="#b58a3a" stroke={INK} strokeWidth={3} />
        <path d="M -22 -26 L 22 -26 C 20 -40 -20 -40 -22 -26 Z" fill="#c9a24a" stroke={INK} strokeWidth={3} />
        <ellipse cx={0} cy={-34} rx={16} ry={4} fill="#efe0b0" />
        {flame > 0 && <path d={`M 0 ${-38 - 40 * k} C -12 -54 -8 -38 0 -38 C 8 -38 12 -54 0 ${-38 - 40 * k} Z`} fill="#ffd36b" stroke="#e8913a" strokeWidth={3} />}
      </svg>
    </>
  );
};
// 하늘 (phi = 해의 각도, 90 = 한낮). 노을 → 밤 → 새벽으로 한 번만 천천히. 별은 밤에만 천천히 돌고, 도는 궤적(trail, 도)이 길어짐
const SKYC = { dayT: "#9fb4bc", dayB: "#eadcbc", duskT: "#b98262", duskB: "#efc58e", nightT: "#111827", nightB: "#2c3850" };
const skyLight = (phi: number) => Math.sin((phi * Math.PI) / 180);
const Sky = ({ phi, cx = 960, cy = 900, R = 780, sun = true, trail = 0 }: { phi: number; cx?: number; cy?: number; R?: number; sun?: boolean; trail?: number }) => {
  const e = skyLight(phi);
  const dk = k01((e + 0.2) / 0.5);
  const tw = k01(1 - Math.abs(e) / 0.28) * 0.85;
  const top = mix(mix(SKYC.nightT, SKYC.dayT, dk), SKYC.duskT, tw);
  const bot = mix(mix(SKYC.nightB, SKYC.dayB, dk), SKYC.duskB, tw);
  const a = (phi * Math.PI) / 180;
  const sunP = [cx + R * Math.cos(a), cy - R * Math.sin(a)];
  const moonP = [cx - R * Math.cos(a), cy + R * Math.sin(a)];
  const night = k01(-e / 0.3);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${top}, ${bot} 82%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: night }}>
        <g transform={`rotate(${-(phi - 170) * 0.35} ${cx} ${cy})`}>
          {Array.from({ length: 140 }).map((_, i) => {
            const sx = cx - 1300 + ((i * 263) % 2600), sy = cy - 1300 + ((i * 151) % 1400);
            const r = Math.hypot(sx - cx, sy - cy);
            const p0 = rotP([sx, sy], [cx, cy], trail);
            return (
              <g key={i}>
                {trail > 0.5 && i % 2 === 0 && <path d={`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 0 ${sx} ${sy}`} stroke="#e8e2cf" strokeWidth={i % 6 ? 1 : 1.6} fill="none" opacity={0.22} />}
                <circle cx={sx} cy={sy} r={i % 6 ? 1.4 : 2.4} fill="#e8e2cf" opacity={0.35 + (i % 4) * 0.15} />
              </g>
            );
          })}
        </g>
      </svg>
      {sun && (
        <>
          <div style={{ position: "absolute", left: sunP[0] - 70, top: sunP[1] - 70, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(#fff2c4, #f6c070 55%, rgba(240,168,101,0) 72%)", boxShadow: "0 0 120px 50px rgba(246,192,112,0.35)" }} />
          <div style={{ position: "absolute", left: moonP[0] - 52, top: moonP[1] - 52, width: 104, height: 104, borderRadius: "50%", background: "#e6dfca", boxShadow: "0 0 80px 26px rgba(230,223,202,0.22)" }} />
        </>
      )}
    </AbsoluteFill>
  );
};
// 부르칸 칼둔: 먼 산줄기 + 앞 봉우리 (time 0 밤 → 1 낮의 밝기)
const Ridges = ({ light, y = 760 }: { light: number; y?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
    <path d={`M 0 ${y} L 160 ${y - 70} L 330 ${y - 20} L 520 ${y - 110} L 700 ${y - 40} L 900 ${y - 90} L 1120 ${y - 20} L 1320 ${y - 120} L 1540 ${y - 40} L 1760 ${y - 100} L 1920 ${y - 50} L 1920 1080 L 0 1080 Z`} fill={mix("#2a3240", "#8d8a7a", light)} stroke={INK} strokeWidth={4} />
    <path d={`M 0 ${y + 80} L 240 ${y + 20} L 480 ${y + 70} L 760 ${y + 10} L 1040 ${y + 80} L 1300 ${y + 30} L 1600 ${y + 90} L 1920 ${y + 40} L 1920 1080 L 0 1080 Z`} fill={mix("#222831", "#77735f", light)} stroke={INK} strokeWidth={4} />
  </svg>
);
// 산꼭대기 바위 + 오보(돌무더기와 푸른 천)
const Summit = ({ light }: { light: number }) => {
  const f = useCurrentFrame();
  const c = mix("#2b2a2c", "#9a8a72", light);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <path d="M -20 1100 L 300 930 L 560 860 L 760 836 L 1260 832 L 1480 870 L 1760 960 L 1960 1100 Z" fill={c} stroke={INK} strokeWidth={6} />
      <path d="M 560 880 L 700 900 M 1300 860 L 1420 900 M 860 860 L 900 880" stroke={mix("#1a1a1c", "#6e6250", light)} strokeWidth={5} />
      {/* 오보 */}
      <g transform="translate(1440 862)">
        {[[-50, 0, 34], [0, 0, 38], [46, 0, 30], [-24, -40, 30], [22, -40, 28], [0, -74, 24]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y - r * 0.6} rx={r} ry={r * 0.7} fill={mix("#3a3836", "#b3a68e", light)} stroke={INK} strokeWidth={4} />)}
        <path d="M 0 -96 L 0 -230" stroke={INK} strokeWidth={8} />
        <path d="M 0 -96 L 0 -230" stroke="#6a4a2e" strokeWidth={4} />
        {[0, 1, 2].map((i) => {
          const w = Math.sin(f / 8 + i) * 10;
          return <path key={i} d={`M 0 ${-220 + i * 26} C 40 ${-226 + i * 26 + w} 80 ${-200 + i * 26 + w} 120 ${-210 + i * 26 + w * 1.4} L 118 ${-196 + i * 26 + w * 1.4} C 80 ${-186 + i * 26 + w} 40 ${-210 + i * 26 + w} 0 ${-204 + i * 26} Z`} fill={i === 1 ? "#efe6d2" : "#5d86a8"} stroke={INK} strokeWidth={3} />;
        })}
      </g>
    </svg>
  );
};
// 멀리서 본 산 (오르는 길·내려오는 길): 봉우리, 숲, 굽은 길, 산 아래 진영. light 0 밤 → 1 새벽
const MTN_PATH = [[260, 1000], [520, 930], [420, 860], [700, 790], [600, 720], [900, 640], [820, 560], [1080, 470], [1010, 400], [1210, 300]];
const pathAt = (t: number) => ptAt(MTN_PATH, t);
const FarMountain = ({ light, camp = 0 }: { light: number; camp?: number }) => {
  const f = useCurrentFrame();
  const m = mix("#1e2430", "#6e6a5a", light);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
        <path d="M -40 1100 L 200 900 L 520 700 L 860 500 L 1120 330 L 1240 270 L 1340 320 L 1560 520 L 1800 700 L 1960 820 L 1960 1100 Z" fill={m} stroke={INK} strokeWidth={6} />
        <path d="M 1240 270 L 1180 330 L 1210 340 L 1250 300 L 1300 340 L 1340 320 Z" fill={mix("#3a4254", "#d8d0bc", light)} />
        {Array.from({ length: 34 }).map((_, i) => {
          const x = 120 + ((i * 173) % 1700);
          const yb = 1060 - ((i * 59) % 260) + (x > 1200 ? (x - 1200) * 0.2 : 0);
          return <path key={i} d={`M ${x} ${yb - 70} L ${x - 24} ${yb} L ${x + 24} ${yb} Z`} fill={mix("#141a1c", "#3e5038", light)} stroke={INK} strokeWidth={3} />;
        })}
        <path d={"M " + MTN_PATH.map((p) => p.join(" ")).join(" L ")} stroke={mix("#3a3a40", "#b8a888", light)} strokeWidth={9} fill="none" strokeLinejoin="round" strokeDasharray="2 14" strokeLinecap="round" />
      </svg>
      {camp > 0 && (
        <div style={{ opacity: camp }}>
          {/* 산 아래 진영: 게르, 모닥불, 툭, 모여드는 기병 */}
          {Array.from({ length: 8 }).map((_, i) => <Ger key={i} x={1380 + i * 70} y={1000 - (i % 2) * 20} w={70} door="#8a3b2c" lit={0.9} />)}
          {Array.from({ length: 5 }).map((_, i) => <Tug key={`t${i}`} x={1400 + i * 110} y={990} h={120} sway={Math.sin((f + i * 9) / 10) * 3} />)}
          {Array.from({ length: 10 }).map((_, i) => <Rider key={`r${i}`} kind={i % 2 ? "mongol2" : "mongol"} x={1340 + i * 58} y={1010 + (i % 3) * 14} w={80} still dark phase={i} />)}
        </div>
      )}
    </>
  );
};
// 걷는 작은 칸 (먼 산길 위, 몇십 px) - 흰 모자로 알아봄
const TinyKhan = ({ x, y, s = 1, walk = 0, hat = true }: { x: number; y: number; s?: number; walk?: number; hat?: boolean }) => {
  const sw = Math.sin(walk) * 6;
  return (
    <svg width={60 * s} height={90 * s} viewBox="-30 -86 60 90" style={{ position: "absolute", left: x - 30 * s, top: y - 86 * s }}>
      <path d={`M -4 -26 L ${-6 + sw} 0 M 4 -26 L ${6 - sw} 0`} stroke="#1d1612" strokeWidth={6} strokeLinecap="round" />
      <path d="M -12 -56 C -16 -40 -16 -28 -14 -22 L 14 -22 C 16 -28 16 -40 12 -56 Z" fill="#7a2c22" stroke="#1d1612" strokeWidth={2.5} />
      <path d="M -12 -54 C -22 -40 -24 -26 -22 -14 L -12 -22 Z" fill="#3e2a1c" />
      <circle cx={0} cy={-64} r={8} fill="#c99a74" stroke="#1d1612" strokeWidth={2} />
      {hat && <path d="M -10 -68 C -10 -84 10 -84 10 -68 Z M -13 -68 L 13 -68" fill="#f2ead8" stroke="#1d1612" strokeWidth={2.5} />}
    </svg>
  );
};

// 5) c5_06 밤의 성문 정면: 횃불 밝은 문 안의 몽골 상인·낙타, 양옆에서 칼 든 병사 실루엣이 들어서고 칼이 들림 → 두 짝 문이 닫히는 순간(죽입니다) 쿵
//    → 검은 화면(소리만) → 잿빛 새벽, 닫힌 성문 앞: 주인 잃은 낙타 한 마리, 흩어진 짐·쓰러진 흰 툭 깃발·떨어진 몽골 모자
const GQ: Quad = { fb: [-40, 1000], nb: [1960, 1000], nt: [1960, 250], ft: [-40, 250] };
const GGATE: Gate = { u0: 0.355, u1: 0.645, vt: 0.84 };
const AQ: Quad = { fb: [-40, 700], nb: [1960, 700], nt: [1960, 360], ft: [-40, 360] };
const AGATE: Gate = { u0: 0.44, u1: 0.56, vt: 0.78 };
// 2026-10-27 빠른 전환 하네스: 쾅 → 검은 화면이 2프레임 만에 뚝, 새벽까지 0.5초 → 닫힌 뒤 12프레임 동안 어두워지고 새벽은 20프레임에 걸쳐 밝아짐
export const T_SHUT = 84, T_BLACK = 98, T_DAWN = 106;
const Torch = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => {
  const f = useCurrentFrame();
  const k = 1 + Math.sin(f / 2.5 + x) * 0.1;
  return (
    <>
      <Glow x={x} y={y - 40 * s} r={200 * s} color="#f3a24e" op={0.55} />
      <svg width={80 * s} height={220 * s} viewBox="0 0 80 220" style={{ position: "absolute", left: x - 40 * s, top: y - 70 * s, ...ink }}>
        <path d="M 40 70 L 40 220" stroke={INK} strokeWidth={12} />
        <path d="M 40 70 L 40 220" stroke="#7a5230" strokeWidth={6} />
        <path d={`M 40 ${76 - 70 * k} C 6 40 14 80 40 80 C 66 80 74 40 40 ${76 - 70 * k} Z`} fill="#e8913a" stroke={INK} strokeWidth={4} />
        <path d={`M 40 ${78 - 40 * k} C 28 56 30 80 40 80 C 50 80 52 56 40 ${78 - 40 * k} Z`} fill="#ffd36b" />
      </svg>
    </>
  );
};
export const GateNight = ({ f }: { f: number }) => {
  const shut = interpolate(f, [28, T_SHUT], [0, 1], { ...clamp, easing: (x) => x * x * x });
  const step = lerp(f, 8, 34, 0, 1, true);
  const blade = interpolate(f, [26, 60, 74, T_SHUT], [0, 1, 1, 0.6], clamp);
  const sh = shake(f, T_SHUT, 14, 30);
  const g0 = qpt(GQ, GGATE.u0, 0)[0], g1 = qpt(GQ, GGATE.u1, 0)[0];
  return (
    <Cam z={lerp(f, 0, T_SHUT, 1.0, 1.16)} cx={960} cy={650} sx={sh.x} sy={sh.y}>
      <AbsoluteFill style={{ background: "linear-gradient(#0e1422, #222c40 70%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={(i * 211) % 1920} cy={(i * 89) % 240} r={i % 5 ? 1.2 : 2} fill="#e8e2cf" opacity={0.5} />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, bottom: 0, background: "#1c1a18", borderTop: `5px solid ${INK}` }} />
      <Wall q={GQ} gate={GGATE} towers={[0.3, 0.7]} n={14} lit={0.9} dim={0.55} />
      {/* 문 안: 횃불 빛 마당, 모여 선 상인·낙타 (실루엣), 양옆에서 들어서는 칼 든 병사 */}
      <AbsoluteFill style={{ clipPath: `path('${gatePath(GQ, GGATE)}')` }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 70%, #f6c27a, #c4682e 55%, #5a2a14)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 870, bottom: 0, background: "#7a4a26" }} />
        <Shadow lv={0.08}>
          <Camel x={760} y={900} s={0.5} walk={false} load="bales" v={0} low={0.1} />
          <Camel x={1150} y={905} s={0.48} walk={false} load="carpet" v={1} flip />
          {/* 양옆에서 들어와 상인들을 에워싸는 병사, 칼이 머리 위로 들림 (문이 닫혀 가도 가운데 틈으로 보이게) */}
          {[1, -1].map((side) => (
            <div key={side} style={{ position: "absolute", inset: 0, transform: side < 0 ? "scaleX(-1)" : undefined, transformOrigin: "960px 0" }}>
              <Spearman x={lerp(step, 0, 1, g0 - 140, 700)} y={912} s={0.8} blade={blade * 0.95} />
              <Spearman x={lerp(step, 0, 1, g0 - 60, 815)} y={935} s={0.95} blade={blade} />
            </div>
          ))}
          <Merchant x={905} y={945} s={0.62} walk={false} v={0} look={0.7} />
          <Merchant x={1015} y={950} s={0.6} walk={false} v={1} look={0.7} />
          <Merchant x={960} y={965} s={0.68} walk={false} v={2} look={-0.5} />
        </Shadow>
      </AbsoluteFill>
      <Doors q={GQ} gate={GGATE} shut={shut} />
      <Torch x={qpt(GQ, 0.24, 0.62)[0]} y={qpt(GQ, 0.24, 0.62)[1]} s={1.1} />
      <Torch x={qpt(GQ, 0.76, 0.62)[0]} y={qpt(GQ, 0.76, 0.62)[1]} s={1.1} />
    </Cam>
  );
};
export const Aftermath = ({ f }: { f: number }) => {
  const t = f - T_DAWN;
  const low = interpolate(t, [8, 50], [0, 0.62], { ...clamp, easing: ease });
  const fade = lerp(t, 0, 20, 0, 1);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Cam z={lerp(t, 0, 92, 1.0, 1.07)} cx={820} cy={720}>
        <AbsoluteFill style={{ background: "linear-gradient(#8f979c, #cfc6b0 60%)" }} />
        <CityBehind x0={300} x1={1700} base={380} s={0.8} />
        <Wall q={AQ} gate={AGATE} towers={[0.38, 0.62]} n={18} dim={0.18} />
        <Doors q={AQ} gate={AGATE} shut={1} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, bottom: 0, background: "linear-gradient(#bfae86, #a8936a)", borderTop: `5px solid ${INK}` }} />
        {/* 흩어진 짐: 뒤집힌 꾸러미·풀려 쏟아진 비단·깨진 항아리·떨어진 지팡이 */}
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <path d="M 1120 930 C 1200 960 1300 940 1380 980 C 1440 1010 1520 1000 1600 1030 L 1590 1054 C 1510 1026 1430 1036 1370 1004 C 1290 966 1196 986 1112 954 Z" fill="#a8332a" stroke={INK} strokeWidth={4} />
          <path d="M 1130 944 C 1210 970 1300 952 1380 992 M 1400 1012 C 1460 1030 1530 1024 1594 1044" stroke="#e8c35a" strokeWidth={4} fill="none" />
          <g transform="rotate(-18 1080 930)">
            <rect x={1000} y={870} width={150} height={96} rx={20} fill="#4d6b8a" stroke={INK} strokeWidth={5} />
            {[1030, 1070, 1110].map((xx) => <path key={xx} d={`M ${xx} 874 L ${xx} 962`} stroke="#e8dcc0" strokeWidth={6} />)}
          </g>
          <g transform="translate(360 960) rotate(78)">
            <path d="M -10 -50 L 10 -50 L 12 -40 C 34 -20 30 40 0 54 C -30 40 -34 -20 -12 -40 Z" fill="#b2683c" stroke={INK} strokeWidth={5} />
          </g>
          {[[440, 990, 20], [470, 1004, -30], [420, 1010, 60]].map(([x, y, r], i) => <path key={i} d={`M ${x} ${y} l 26 -6 l 6 18 l -24 8 Z`} fill="#b2683c" stroke={INK} strokeWidth={4} transform={`rotate(${r} ${x} ${y})`} />)}
          <path d="M 200 1030 L 520 1000" stroke={INK} strokeWidth={12} strokeLinecap="round" />
          <path d="M 200 1030 L 520 1000" stroke="#8a6440" strokeWidth={6} strokeLinecap="round" />
          {/* 쓰러진 흰 툭 깃대(칸의 상단 표식)·떨어진 몽골 모자 */}
          <path d="M 1300 1010 L 1700 900" stroke={INK} strokeWidth={12} strokeLinecap="round" />
          <path d="M 1300 1010 L 1700 900" stroke="#7a5230" strokeWidth={5} strokeLinecap="round" />
          <g transform="rotate(-105 1700 900)"><MiniTug x={1700} y={900} /></g>
          <g transform="translate(560 1000) rotate(-20)">
            <path d="M -34 0 C -32 -32 -6 -44 4 -50 C 14 -42 34 -28 36 0 Z" fill="#4d6b8a" stroke={INK} strokeWidth={5} />
            <path d="M -40 -4 C -18 8 22 8 42 -4 L 42 8 C 22 20 -18 20 -40 8 Z" fill="#6b4a2e" stroke={INK} strokeWidth={4} />
          </g>
        </svg>
        <Camel x={780} y={960} s={1.0} walk={false} load="loose" v={1} low={low} sway={Math.sin(t / 24) * 4} />
        {/* 땅에 끌리는 고삐 (끝이 풀려 땅에 놓임) */}
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          {(() => {
            const n = camelNose(780, 960, 1.0, low);
            const d = `M ${n[0]} ${n[1]} C ${n[0] + 30} ${n[1] + 120} ${n[0] + 20} 1000 ${n[0] + 90} 1000 C ${n[0] + 150} 1000 ${n[0] + 170} 1012 ${n[0] + 230} 1006`;
            return (
              <>
                <path d={d} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
                <path d={d} stroke="#a8875a" strokeWidth={5} fill="none" strokeLinecap="round" />
              </>
            );
          })()}
        </svg>
        {/* 바람에 날리는 모래 */}
        {[0, 1, 2].map((i) => {
          const k = ((t + i * 30) % 90) / 90;
          return <div key={i} style={{ position: "absolute", left: -200 + k * 2200, top: 900 + i * 50, width: 420, height: 60, borderRadius: "50%", background: "radial-gradient(rgba(220,205,170,0.5), transparent 70%)", opacity: Math.sin(Math.PI * k) }} />;
        })}
      </Cam>
    </AbsoluteFill>
  );
};
const S5 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  let scene: React.ReactNode = null;
  if (f < T_BLACK) scene = <GateNight f={f} />;
  else if (f >= T_DAWN) scene = <Aftermath f={f} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene}
      {f < T_BLACK && <AbsoluteFill style={{ background: "#000", opacity: lerp(f, T_SHUT + 2, T_BLACK, 0, 1) }} />}
      <SFX name="gate" at={26} vol={0.4} dur={T_SHUT - 26} />
      <SFX name="impact" at={T_SHUT} vol={0.6} dur={50} />
      <SFX name="boom" at={T_SHUT} vol={0.35} dur={60} />
      <SFX name="wind" at={T_BLACK + 6} vol={0.28} dur={frames - T_BLACK - 6} />
    </AbsoluteFill>
  );
};
const P_TOP = 150; // 산꼭대기로 들어가는 프레임 (c5_15 기준)
const Climb = ({ t, len }: { t: number; len: number }) => {
  const q = lerp(t, 0, len, 0.04, 0.72);
  const p = pathAt(q);
  return (
    <Cam z={1.25} cx={lerp(t, 0, len, 640, 980, true)} cy={lerp(t, 0, len, 860, 520, true)}>
      <Sky phi={172} sun={false} />
      <Glow x={200} y={760} r={500} color="#e8915a" op={0.35} />
      <FarMountain light={0.25} />
      {/* 산 아래 멀리 진영 불빛 */}
      {Array.from({ length: 6 }).map((_, i) => <Glow key={i} x={120 + i * 70} y={1040 - (i % 2) * 10} r={40} color="#f3b05e" op={0.8} />)}
      <TinyKhan x={p[0]} y={p[1]} s={1.1} walk={t / 3} />
    </Cam>
  );
};
// 하늘은 한 번만 천천히: 노을(산꼭대기에 닿음) → 밤(별이 천천히 돌고 궤적이 길어짐) → c5_16 동안은 거의 멈춤 → c5_17 새벽
// '사흘'은 조용히: 내려놓은 모자 옆 버터 등잔이 하나씩 새로 켜짐(앞의 것은 타들어 꺼짐) - 세 개
const LAMPS = [226, 262, 298];
const PrayerScene = ({ f, at }: { f: number; at: (id: string) => number }) => {
  // c8 = 기도 대사(c5_17), c9 = "사흘째 새벽"(c5_18) - 2026-10-27 망설임·결심 줄이 들어와 번호가 한 칸씩 밀림
  const c8 = at("c5_17"), c9 = at("c5_18");
  const phi = interpolate(f, [P_TOP, 216, c8, c9, c9 + 66], [170, 205, 262, 266, 352], clamp); // 새벽은 2초 넘게 천천히 밝아짐
  const trail = interpolate(f, [216, c8, c9], [0, 34, 36], clamp);
  const e = skyLight(phi);
  const light = k01((e + 0.25) / 0.6);
  // 오른손 (판 좌표): 무릎 → 모자 꼭대기(머리 위) → 땅의 모자 → 무릎 … 다시 땅 → 머리 → 무릎. 팔꿈치는 굽혀서
  const HG = [236, 300];
  // 머리 위의 모자는 앞챙을 쥐고(손이 얼굴을 가로지르지 않게 앞으로 돌아서 올라감), 땅의 모자는 꼭대기를 쥠
  const FRONT = [95, -5], TOPG = [0, -HAT_TOP];
  const KNEE = [118, 214], AROUND = [196, -40], HEADH = [HAT_ON_HEAD[0] + FRONT[0], HAT_ON_HEAD[1] + FRONT[1]], GROUND = [HG[0] + TOPG[0], HG[1] + TOPG[1]];
  const tk = [158, 166, 174, 198, 216, c9, c9 + 12, c9 + 26, c9 + 36];
  const hx = interpolate(f, tk, [KNEE[0], AROUND[0], HEADH[0], GROUND[0], KNEE[0], KNEE[0], GROUND[0], HEADH[0], KNEE[0]], { ...clamp, easing: ease });
  const hy = interpolate(f, tk, [KNEE[1], AROUND[1], HEADH[1], GROUND[1], KNEE[1], KNEE[1], GROUND[1], HEADH[1], KNEE[1]], { ...clamp, easing: ease });
  const bow = interpolate(f, tk, [0, 0, 0, 0.6, 0.25, 0.25, 0.6, 0, 0], { ...clamp, easing: ease });
  // 손에 든 모자의 자리 (손 기준): 앞챙 쥠 → 꼭대기 쥠으로 옮기는 동안 부드럽게
  const gk = interpolate(f, [174, 198, c9 + 12, c9 + 26], [0, 1, 1, 0], clamp);
  const hatOff = [-(FRONT[0] + (TOPG[0] - FRONT[0]) * gk), -(FRONT[1] + (TOPG[1] - FRONT[1]) * gk)];
  const hat: "head" | "hand" | "ground" = f < 174 ? "head" : f < 198 ? "hand" : f < c9 + 12 ? "ground" : f < c9 + 26 ? "hand" : "head";
  const praying = f >= 216 && f < c9;
  const eyesOpen = f >= c8 + sec(4.8); // 영어 본편 "was not started by the Mongols" 4.9초
  const eyes: 0 | 1 = praying && !eyesOpen ? 1 : 0;
  const mouth = talkingAt(f, c8, "c5_17") ? ["1", "2", "1", "0", "2", "1"][Math.floor((f - c8) / 4) % 6] : "0";
  // "하늘이여"에서 고개를 들어 하늘을 봄 (절박하고 결연하게)
  const up = lerp(f, c8 + sec(7.5), c8 + sec(8.05), 0, 1, true); // 영어 "Heaven" 7.56초 // "하늘이여" 4.44초 (2026-10-27 "몽골이 시작한 것이 아닙니다 / 이길 힘을"으로 바꿈)
  const nod = praying ? (eyesOpen ? 3 - 17 * up : 12) : 0;
  const tense = f >= c8 && f < c9;
  const figure = { filter: `brightness(${0.45 + 0.55 * light}) saturate(${0.55 + 0.45 * light})` };
  const lamp = (i: number) => {
    const on = LAMPS[i], off = LAMPS[i + 1];
    if (f < on) return { flame: 0, smoke: 0 };
    const up = lerp(f, on, on + 10, 0, 1, true);
    if (off === undefined) return { flame: up, smoke: 0 };
    if (f < off) return { flame: up * lerp(f, on + 10, off, 1, 0.35), smoke: 0 };
    return { flame: 0, smoke: k01((f - off) / 24) };
  };
  // 결심 (c5_18 뒤쪽, 모자를 다시 쓴 뒤): 얼굴 가까이, 왼쪽에서 아침 햇빛, 눈을 뜨고 굳은 눈빛 - 앞의 망설임(c5_15)과 짝
  // 전경 · 기도 클로즈업 · 결심 클로즈업을 겹쳐서 넘김 (2026-10-27 빠른 전환 하네스: 클로즈업 → 새벽 전경 → 결심이 1초 간격으로 뚝뚝 바뀌었음)
  const RESOLVE = c9 + 56;
  const XF = 14;
  const closeOp = Math.min(lerp(f, c8 - XF, c8, 0, 1), lerp(f, c9, c9 + XF, 1, 0));
  const resolveOp = lerp(f, RESOLVE - XF, RESOLVE, 0, 1);
  const z = f < c8 ? lerp(f, P_TOP, c8, 1.0, 1.1) : lerp(f, c9, c9 + 56, 1.1, 1.14);
  const SC = 1.05;
  const t = f - c8;
  return (
    <AbsoluteFill>
      {(closeOp < 1 && resolveOp < 1) && (
        <Cam z={z} cx={960} cy={620}>
          <Sky phi={phi} trail={trail} />
          <Ridges light={light} />
          <div style={{ position: "absolute", inset: 0, ...figure }}>
            <Summit light={light} />
            <KhanKneel x={840} y={834 - 322 * SC} s={SC} hand={[hx, hy]} hat={hat} hatGround={HG} hatOff={hatOff} bow={bow} nod={nod} eyes={eyes} mouth={mouth} tense={tense} />
          </div>
          {[0, 1, 2].map((i) => <ButterLamp key={i} x={1250 + i * 44} y={837 + i * 5} s={0.75} {...lamp(i)} />)}
          {f >= c9 && <Glow x={1700} y={760} r={700} color="#f6b06a" op={lerp(f, c9, c9 + 40, 0, 0.35)} />}
        </Cam>
      )}
      {closeOp > 0 && (
        // c5_17: 얼굴 가까이 (판을 크게 그림 - 확대로 흐려지지 않게). 하늘은 거의 멈춤, 아래 오른쪽에서 등잔 불빛
        <AbsoluteFill style={{ opacity: closeOp }}>
          <Sky phi={phi} cx={960} cy={1500} R={1100} trail={trail} />
          <Ridges light={light} y={1000} />
          <div style={{ position: "absolute", inset: 0, ...figure }}>
            <KhanKneel x={760} y={740} s={lerp(t, 0, c9 - c8, 2.1, 2.2)} hand={KNEE} hat="ground" hatGround={HG} bow={0.25} nod={nod} eyes={eyes} mouth={mouth} tense={tense} />
          </div>
          <Glow x={1500} y={1060} r={520} color="#f6c070" op={0.3} />
        </AbsoluteFill>
      )}
      {resolveOp > 0 && (
        <AbsoluteFill style={{ opacity: resolveOp }}>
          <Sky phi={phi} cx={960} cy={1500} R={1100} />
          <Ridges light={light} y={1000} />
          <div style={{ position: "absolute", inset: 0, filter: "brightness(1.05)" }}>
            <KhanKneel x={760} y={740} s={lerp(f, RESOLVE - XF, RESOLVE + 90, 2.1, 2.25)} hand={KNEE} hat="head" hatGround={HG} bow={0} nod={-2} eyes={0} mouth="0" tense />
          </div>
          <Glow x={200} y={420} r={900} color="#ffcf8a" op={lerp(f, RESOLVE - XF, RESOLVE + 20, 0.2, 0.5)} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 서 있는 말과 기병 (옆모습, 왼쪽=서쪽을 봄). (x,y) = 발굽 가운데 땅, s (키 약 250). lead = 흰 말의 칸(색), 아니면 검은 실루엣
const StandRider = ({ x, y, s, lead = false, shade = false, v = 0 }: { x: number; y: number; s: number; lead?: boolean; shade?: boolean; v?: number }) => {
  const f = useCurrentFrame();
  const dark = shade ? "#0b0806" : "#140f0b";
  const horse = lead && !shade ? "#e8dfcc" : dark;
  const mane = lead && !shade ? "#b9ad96" : dark;
  const robe = lead && !shade ? "#9c3a2c" : dark;
  const hatC = lead && !shade ? "#f2ead8" : dark;
  const st = shade ? "none" : INK;
  const tail = Math.sin(f / 14 + v) * 4;
  const nodH = Math.sin(f / 30 + v * 2) * 2;
  return (
    <svg width={300 * s} height={290 * s} viewBox="-150 -280 300 290" style={{ position: "absolute", left: x - 150 * s, top: y - 280 * s, ...(shade ? { overflow: "visible" as const } : ink) }}>
      <g stroke={st} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        <path d={`M 66 -116 C ${84 + tail} -100 ${88 + tail} -70 ${82 + tail} -46`} stroke={shade ? dark : INK} strokeWidth={14} fill="none" />
        {[[-52, -92], [-36, -92], [38, -92], [54, -92]].map(([lx, ly], i) => <path key={i} d={`M ${lx} ${ly} L ${lx + (i % 2 ? 2 : -2)} -2`} stroke={shade ? dark : INK} strokeWidth={14} />)}
        {[[-52, -92], [-36, -92], [38, -92], [54, -92]].map(([lx, ly], i) => <path key={`c${i}`} d={`M ${lx} ${ly} L ${lx + (i % 2 ? 2 : -2)} -2`} stroke={horse} strokeWidth={7} />)}
        <ellipse cx={0} cy={-110} rx={72} ry={32} fill={horse} />
        <g transform={`rotate(${nodH} -56 -126)`}>
          <path d="M -50 -132 C -66 -160 -78 -184 -90 -196 L -116 -176 L -122 -164 L -112 -158 L -84 -166 C -76 -150 -70 -126 -60 -108 Z" fill={horse} />
          <path d="M -48 -136 C -62 -160 -74 -182 -86 -194" stroke={mane} strokeWidth={10} fill="none" />
          <path d="M -90 -196 L -84 -210 L -80 -194 Z" fill={horse} />
        </g>
        {/* 기병: 다리·몸·머리·투구(칸은 흰 모자) + 등에 멘 활 */}
        <path d="M -6 -124 L -14 -86" stroke={shade ? dark : INK} strokeWidth={14} />
        <path d="M -24 -132 C -26 -160 -18 -186 -2 -192 C 14 -188 20 -160 16 -130 Z" fill={robe} />
        <path d="M 10 -186 C 32 -170 34 -140 18 -120" stroke={lead && !shade ? "#8a5a2e" : dark} strokeWidth={6} fill="none" />
        <circle cx={-4} cy={-206} r={15} fill={lead && !shade ? "#dcae84" : dark} />
        {lead ? <path d="M -20 -210 C -20 -232 12 -232 12 -210 Z M -24 -210 L 16 -210" fill={hatC} /> : <path d="M -18 -212 C -18 -232 10 -232 10 -212 Z M -4 -230 L -4 -244" fill={dark} />}
      </g>
    </svg>
  );
};
// 새벽, 산을 내려온 칸이 화면 가운데(언덕 위, 흰 툭 둘 사이) → "진격을 명령합니다"에서 손짓 → 지평선에 서 있던 기병들이
// 칸의 양옆으로 갈라져 카메라 쪽으로 커지며 화면 밖으로 쏟아짐(앞 장들의 '가로로 지나가기'와 다르게 - 뒤에서 앞으로), 먼지
// → c5_18 돌격이 지나간 뒤 먼지 속에 칸만 남고 천천히 어두워짐 (극적인 끝은 천천히, 흰 번쩍임 없음)
const HZ = 615; // 지평선
const CH_N = 90; // 2026-10-27 40→90, 출발 간격 3.6→2.6: "웅장한 장면인데 너무 빨리 지나가" - 쏟아지는 시간 약 2.4초 → 4초
const RKIND = ["mongol", "mongol2", "mongol_white"];
const chargeRider = (i: number) => {
  const side = i % 2 ? 1 : -1;
  const lane = i >> 1;
  return { side, lane, x0: 960 + side * (150 + ((lane * 53) % 240)), spread: 900 + ((lane * 97) % 600), d: Math.floor(lane * 2.6) + (i % 2) * 2, dur: 48 + (lane % 3) * 4, kind: RKIND[(i * 7 + lane) % 3] };
};
const Charge = ({ t, base, cmd, go, c14, len }: { t: number; base: number; cmd: number; go: number; c14: number; len: number }) => {
  const sh = shake(t, go + 26, 5, 100);
  const z = t < c14 ? lerp(t, 0, c14, 1.0, 1.04) : lerp(t, c14, len, 1.04, 1.16);
  const dustUp = lerp(t, go, go + 60, 0, 1, true) * lerp(t, c14 + 30, len, 1, 0.45);
  const dark = lerp(t, c14 + 40, len - 6, 0, 1); // 천천히 어두워짐
  const riders = Array.from({ length: CH_N }).map((_, i) => {
    const r = chargeRider(i);
    const q = (t - go - r.d) / r.dur;
    if (q >= 1) return null;
    if (q < 0) {
      // 출발 전: 지평선에 서 있음 (작게)
      const node = r.side < 0 ? <StandRider x={r.x0} y={HZ + 6} s={0.3} shade v={i} /> : <div style={{ position: "absolute", inset: 0, transform: `scaleX(-1)`, transformOrigin: `${r.x0}px 0` }}><StandRider x={r.x0} y={HZ + 6} s={0.3} shade v={i} /></div>;
      return { w: 0, node: <React.Fragment key={i}>{node}</React.Fragment> };
    }
    const g = q * q;
    const w = 90 + 1150 * g;
    const y = HZ + 6 + 720 * Math.pow(q, 1.4);
    const x = r.x0 + r.side * r.spread * Math.pow(q, 1.6);
    return {
      w,
      node: (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: x - r.side * w * 0.55 - w * 0.6, top: y - w * 0.22, width: w * 1.2, height: w * 0.36, borderRadius: "50%", background: "radial-gradient(rgba(150,120,85,0.55), transparent 70%)", opacity: k01(q * 3) }} />
          <div style={{ filter: `brightness(${0.55 + 0.35 * q})` }}>
            <Rider kind={r.kind} x={x - w / 2} y={y - w * 0.775} w={w} flip={r.side < 0} phase={(i * 5) % 16} />
          </div>
        </React.Fragment>
      ),
    };
  });
  const back = riders.filter((r) => r && r.w < 430).map((r) => r!.node);
  const front = riders.filter((r) => r && r.w >= 430).map((r) => r!.node);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam z={z} cx={960} cy={600} sx={sh.x} sy={sh.y}>
        <Sky phi={369} />
        <Glow x={1500} y={HZ} r={760} color="#f0a060" op={0.45} />
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <path d={`M -40 ${HZ + 4} L 160 470 L 330 420 L 520 500 L 700 ${HZ + 4} Z`} fill="#4c4a44" stroke={INK} strokeWidth={5} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: HZ, bottom: 0, background: "linear-gradient(#6f7d4c, #4d5934)", borderTop: `5px solid ${INK}` }} />
        {/* 지평선 뒤 열: 출발과 함께 먼지에 묻혀 사라짐 */}
        <div style={{ opacity: 1 - lerp(t, go, go + 40, 0, 1) }}>
          {Array.from({ length: 26 }).map((_, i) => <StandRider key={`h${i}`} x={60 + i * 72} y={HZ - 2} s={0.18} shade v={i} />)}
        </div>
        {/* 지평선을 따라 끝없이 이어지는 기병 행렬 (작게, 양쪽으로) - 출발 뒤 계속 */}
        {t > go && Array.from({ length: 34 }).map((_, i) => {
          const dir = i % 2 ? 1 : -1;
          const x = ((t - go) * (5 + (i % 4)) + i * 131) % 2300 - 190;
          return <div key={`s${i}`} style={{ opacity: lerp(t, go, go + 20, 0, 0.9) * (1 - dark) }}><Rider kind={RKIND[i % 3]} x={dir > 0 ? x : 1920 - x} y={HZ - 30 + (i % 3) * 8} w={70 + (i % 3) * 12} flip={dir < 0} phase={i * 3} dark /></div>;
        })}
        {/* 지평선 먼지 띠 */}
        <div style={{ position: "absolute", left: -200, right: -200, top: HZ - 140, height: 260, borderRadius: "50%", background: "radial-gradient(rgba(170,140,100,0.7), transparent 70%)", opacity: dustUp }} />
        {back}
        {/* 칸이 선 언덕 + 흰 툭 둘 */}
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <path d="M 560 1080 C 620 950 760 900 960 895 C 1160 900 1300 950 1360 1080 Z" fill="#5d6a3e" stroke={INK} strokeWidth={5} />
        </svg>
        <Tug x={690} y={935} h={560} sway={Math.sin(t / 9) * 5 + (t > go ? Math.sin(t / 3) * 6 * (1 - dark) : 0)} />
        <Tug x={1230} y={935} h={560} sway={Math.sin(t / 10 + 1) * 5 + (t > go ? Math.sin(t / 3.4) * 6 * (1 - dark) : 0)} />
        <Char id="genghis" x={960} h={640} pose="angry" bottom={150} enter="none" beat="none" gesture="point" gestureAt={base + cmd - 6} /> {/* Char는 묶음 프레임으로 움직임 → base(장면 시작) 더함 */}
        {front}
        {/* 지나간 뒤 남는 먼지 (앞쪽 아래) */}
        <div style={{ position: "absolute", left: -300, right: -300, top: 760, height: 520, borderRadius: "50%", background: "radial-gradient(rgba(150,122,88,0.5), transparent 70%)", opacity: lerp(t, go + 40, go + 110, 0, 1) * lerp(t, c14, len, 1, 0.35) }} />
      </Cam>
      {/* 새벽 어스름 + 가장자리 어둡게 → 끝에서 천천히 검게 */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(12,8,6,0.55))" }} />
      <AbsoluteFill style={{ background: "rgba(20,12,10,0.18)" }} />
      <AbsoluteFill style={{ background: "#000", opacity: dark }} />
      <Sequence from={base}>{/* 효과음 시각은 이 장면 기준 (SFX는 묶음 프레임을 씀) */}
        <SFX name="war_horn" at={cmd - 4} vol={0.35} dur={90} />
        <SFX name="war_cry" at={go + 4} vol={0.22} dur={90} />
        <SFX name="cavalry" at={go} vol={0.4} dur={c14 + 60 - go} />
        <SFX name="war_drums" at={go - 6} vol={0.3} dur={c14 - go + 20} />
        <SFX name="wind" at={c14} vol={0.3} dur={len - c14} />
      </Sequence>
    </AbsoluteFill>
  );
};
// 10-a) c5_11 술렁이는 진영 (2026-10-27 사용자: "민심도 흔들려야"): 노을 진영 곳곳에서 둘셋씩 모여 수군대는 사람들(서로 고개를 돌림), 눈치 보는 병사, 천천히 옆으로 훑음
const TentWall = () => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 80% at 50% 60%, #4a2f1e, #1a100a 75%)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.35, ...ink }}>
      {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M ${i * 150 - 100} 0 L ${i * 150 + 200} 640 M ${i * 150 + 200} 0 L ${i * 150 - 100} 640`} stroke="#6a4a30" strokeWidth={6} />)}
    </svg>
  </>
);
const S10Camp = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const pan = lerp(f, 0, frames, 0, -260);
  // 둘셋씩 무리: [x, 몇 명, 서로 보는 방향 바뀌는 때]
  const groups: [number, number, number][] = [[260, 2, 20], [700, 3, 46], [1180, 2, 70], [1600, 3, 34], [2020, 2, 58]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, width: 2400, transform: `translateX(${pan}px)` }}>
        <Steppe time="dusk" horizon={600} />
        {Array.from({ length: 12 }).map((_, i) => <Ger key={i} x={80 + i * 205} y={620 + (i % 3) * 14} w={140} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={0.6} />)}
        {groups.map(([gx, n, t0], gi) => Array.from({ length: n }).map((_, k) => {
          const turn = Math.floor((f + t0) / 40) % 2 === 0;
          return <Merchant key={`${gi}-${k}`} x={gx + k * 110} y={960 + (k % 2) * 16} s={0.85} walk={false} v={gi * 3 + k} look={(k % 2 ? -1 : 1) * (turn ? 0.4 : 0.1)} flip={k % 2 === 1} />;
        }))}
        <Guard x={480} h={430} bottom={120} />
        <Guard x={1420} h={430} bottom={120} flip />
      </div>
      <SFX name="crowd" at={0} vol={0.22} dur={frames} />
      <SFX name="wind" at={0} vol={0.15} dur={frames} />
    </AbsoluteFill>
  );
};
// 10-b) c5_12~14 큰 천막 안 회의: 가운데 칸, 왼쪽 수부타이("앞뒤로 적을") · 오른쪽 제베.
//      제베가 한 걸음 나서 "칸께서 혹시 돌아오지 못하시면" → 모두 얼어붙음 → c5_14 칸의 얼굴 가까이 (굳은 얼굴, 천천히 다가감)
const S10Council = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const sb = at("c5_12"), jb = at("c5_13"), cl = at("c5_14");
  const step = lerp(f, jb - 10, jb + 8, 0, 1, true);
  const froze = f >= jb + Math.ceil(slotSec("c5_13") * FPS);
  // 칸의 얼굴 가까이는 회의 장면 위로 14프레임에 걸쳐 겹쳐 나타남 (2026-10-27 뚝 컷 경고)
  const closeOp = lerp(f, cl, cl + 14, 0, 1);
  const t = f - cl;
  const closeUp = (
      <AbsoluteFill style={{ background: "#0c0806", opacity: closeOp }}>
        <AbsoluteFill style={{ transform: `scale(${lerp(t, 0, frames - cl, 1.0, 1.08)})`, transformOrigin: "50% 40%" }}>
          <TentWall />
          <Glow x={1300} y={700} r={700} color="#f3a24e" op={0.4} />
          <Char id="genghis" x={960} h={1500} pose="front" bottom={-560} enter="none" beat="none" />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6))" }} />
      </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: "#0c0806" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, cl, 1.0, 1.06)})`, transformOrigin: "50% 55%" }}>
        <TentWall />
        {[420, 1500].map((x, i) => <Glow key={i} x={x} y={640} r={420} color="#f3a24e" op={0.4 + Math.sin(f / 5 + i) * 0.04} />)}
        {/* 칸 (가운데 뒤, 앉은 자리 높게) */}
        <Char id="genghis" x={960} h={600} pose="front" bottom={330} enter="none" beat="none" talking={false} />
        {/* 수부타이 (왼쪽, 칸을 봄) */}
        <Char id="subutai" x={430} h={620} pose={froze ? "shocked" : "front"} flip bottom={90} enter="none" beat="none" gesture={f >= sb + 10 && f < jb - 12 ? "point" : undefined} gestureAt={sb + 10} talking={talkingAt(f, sb, "c5_12")} />
        {/* 제베 (오른쪽, c5_13에 한 걸음 나섬) */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-step * 110}px)` }}>
          <Char id="jebe" x={1500} h={640} pose="front" bottom={80} enter="none" beat="none" talking={talkingAt(f, jb, "c5_13")} />
        </div>
        {/* 등잔 */}
        <ButterLamp x={700} y={900} s={1.1} flame={1} smoke={0} />
        <ButterLamp x={1240} y={900} s={1.1} flame={1} smoke={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55))" }} />
      <SFX name="campfire" at={0} vol={0.22} dur={frames} />
      <SFX name="drum" at={jb + Math.ceil(slotSec("c5_13") * FPS)} vol={0.3} />
      {f >= cl && closeUp}
    </AbsoluteFill>
  );
};
// 10-1) c5_15 칭기즈칸의 속마음 "…지금 저 나라와 싸우면, / 이길 수 있을까." (2026-10-27 사용자: 기도 전 망설임이 있어야 결심이 산다)
//     밤, 천막 안 등잔 하나. 낮은 상 위의 지도(작은 몽골 · 몇 배 큰 호라즘)를 내려다보는 칸, 굳은 얼굴 → 한숨(고개가 살짝 떨어짐)
const S10Doubt = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const sigh = lerp(f, sec(2.6), sec(3.6), 0, 1, true);
  return (
    <AbsoluteFill style={{ background: "#0c0806" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, frames, 1.0, 1.08)})`, transformOrigin: "50% 45%" }}>
        {/* 천막 벽 (격자 살) */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 80% at 50% 60%, #4a2f1e, #1a100a 75%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.35, ...ink }}>
          {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M ${i * 150 - 100} 0 L ${i * 150 + 200} 640 M ${i * 150 + 200} 0 L ${i * 150 - 100} 640`} stroke="#6a4a30" strokeWidth={6} />)}
        </svg>
        <Glow x={1320} y={600} r={620} color="#f3a24e" op={0.45 + Math.sin(f / 4) * 0.04} />
        {/* 칸 (상 너머) */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${sigh * 10}px)` }}>
          <Char id="genghis" x={960} h={720} pose={f < sec(2.6) ? "front" : "sad"} bottom={260} enter="none" beat="none" talking={false} />
        </div>
        {/* 낮은 상 + 지도: 작은 몽골(붉게) · 몇 배 큰 호라즘(초록) */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 300 820 L 1620 820 L 1720 1080 L 200 1080 Z" fill="#5a3a24" stroke={INK} strokeWidth={6} />
          <path d="M 520 830 L 1400 830 L 1440 1010 L 480 1010 Z" fill="#e6d3a8" stroke={INK} strokeWidth={5} />
          <path d="M 1120 860 C 1180 850 1250 870 1260 900 C 1250 930 1170 935 1130 915 Z" fill="#b5523e" stroke={INK} strokeWidth={4} />
          <path d="M 560 870 C 700 840 960 850 1010 900 C 1030 950 900 990 700 985 C 580 980 520 930 560 870 Z" fill="#7fa36a" stroke={INK} strokeWidth={4} />
          {/* 크기를 재 보는 손가락 자리 (점선) */}
          <path d={`M 1180 895 L ${1180 - lerp(f, 20, 70, 0, 420, true)} 905`} stroke={INK} strokeWidth={4} strokeDasharray="10 10" fill="none" opacity={1 - sigh} />
        </svg>
        {/* 등잔 */}
        <ButterLamp x={1360} y={835} s={1.2} flame={1} smoke={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6))" }} />
      <SFX name="campfire" at={0} vol={0.25} dur={frames} />
    </AbsoluteFill>
  );
};
// 6) c5_16~c5_19 한 흐름 (이 묶음 시작 기준): 해 질 녘 홀로 산길을 오름 → 산꼭대기(전용 그림): 모자를 벗어 내려놓고 사흘 기도(등잔 셋·별)
//    → c5_16 얼굴 가까이: 감은 눈 → "제가"에서 눈을 뜨고 "하늘이여"에서 하늘을 올려다봄(절박·결연) → c5_17 새벽 모자를 다시 씀
//    → 언덕 위 칸이 진격을 명령 → 기병이 카메라 쪽으로 쏟아짐 → c5_18 칸만 남고 천천히 어두워짐 (뒤에 10초 엔딩은 Chapter5가 붙임)
const CMD_SEC = 2.6; // c5_19 시작부터 "호라즘으로 진격을 명령합니다" 손짓까지 (/ 뒤 조각 시작: 한 2.7·영 3.5·스 3.6초)
const S11 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const c13 = at("c5_19"); // "산을 내려온 그는, / 호라즘으로 진격을 명령합니다"
  const TUMEN = c13 + 34;
  const cmd = c13 + sec(CMD_SEC) - TUMEN;
  let scene: React.ReactNode;
  if (f < P_TOP) scene = <Climb t={f} len={P_TOP} />;
  else if (f < TUMEN) scene = <PrayerScene f={f} at={at} />;
  else scene = <Charge t={f - TUMEN} base={TUMEN} cmd={cmd} go={cmd + 12} c14={frames - TUMEN - 70} len={frames - TUMEN} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene}
      {/* 장면 사이 어둠: 14프레임에 걸쳐 어두워졌다가 4프레임 머물고 20프레임에 걸쳐 밝아짐 (2026-10-27 빠른 전환 하네스: 10프레임에 밝아지면 급해 보임) */}
      {[P_TOP, TUMEN].map((c) => <AbsoluteFill key={c} style={{ background: "#000", opacity: interpolate(f, [c - 16, c - 2, c + 2, c + 22], [0, 1, 1, 0], clamp) }} />)}
      <SFX name="wind" at={0} vol={0.22} dur={TUMEN} />
      <SFX name="drum" at={at("c5_18")} vol={0.3} />
      <SFX name="drum" at={at("c5_18") + 56} vol={0.4} />
      <SFX name="wolf" at={40} vol={0.12} dur={60} />
    </AbsoluteFill>
  );
};

// 7) c5_07 "칭기즈칸은 분노했습니다. 하지만 당장 칼을 뽑을 수는 없었습니다. / 몽골군은 아직 금나라와 싸우고 있었기 때문입니다. / 그래서 먼저 사신을 보내, 그 총독을 넘기라고 요구합니다."
//    (2026-10-27 사용자: 화가 났지만 전쟁하기엔 애매해서 사신) 노을 진영: 칸이 주먹을 쥐고 부들부들(분노) → "하지만"에서 멈칫, 동쪽을 돌아봄 →
//    동쪽 지평선 너머 금나라 전선의 연기·불빛(카메라가 그쪽으로 조금 감) → "그래서"에서 다시 서쪽의 사신 셋을 가리킴 → 사신이 말을 달려 지평선으로
const S7 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const stop = sec(3.1), east = sec(3.7), back = sec(8.3), go = sec(11.6); // 영어 본편 기준: "But he couldn't" 3.3초, "So first, he sent envoys" 8.3초, "demanding the governor" 11.6초 // "그래서 먼저 호라즘의 왕에게 사신을 보내" 10.2초, "상인들을 죽인 그 총독을" 13.9초
  const look = lerp(f, east, east + 20, 0, 1, true) * (1 - lerp(f, back, back + 16, 0, 1, true)); // 동쪽을 보는 정도
  // 진영 → 말 달리는 사신: 진영이 16프레임 동안 위에 남아 서서히 사라짐 (2026-10-27 빠른 전환 하네스 9:38)
  const camp = (
      <AbsoluteFill style={{ opacity: 1 - lerp(f, go, go + 16, 0, 1) }}>
        <Cam z={lerp(f, 0, go, 1.0, 1.06)} cx={1000 + look * 260} cy={620}>
          <Steppe time="dusk" horizon={600} />
          {/* 동쪽 지평선: 금나라 전선의 연기 기둥과 불빛 */}
          <div style={{ opacity: lerp(f, east, east + 30, 0, 1, true) }}>
            {[1640, 1760, 1880, 2020].map((x, i) => <Glow key={i} x={x} y={600} r={140} color="#e8703a" op={0.35 + Math.sin(f / 6 + i) * 0.08} />)}
            <svg width={2200} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
              {[1640, 1760, 1880, 2020].map((x, i) => { const t = (f / 3 + i * 17) % 60; return <path key={i} d={`M ${x} 600 C ${x - 30} ${520 - t} ${x + 40} ${460 - t} ${x + 10} ${380 - t * 1.5}`} stroke="#4a4038" strokeWidth={26} fill="none" opacity={0.35} strokeLinecap="round" />; })}
            </svg>
          </div>
          {Array.from({ length: 10 }).map((_, i) => <Ger key={i} x={120 + i * 185} y={630 + (i % 3) * 12} w={130} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={0.6} />)}
          {Array.from({ length: 6 }).map((_, i) => <Tug key={`t${i}`} x={1150 + i * 120} y={660} h={300} sway={Math.sin((f + i * 11) / 13) * 5} />)}
          <Guard x={1780} h={500} bottom={150} flip />
          <Char id="genghis" x={1380} h={650} pose={f < stop ? "angry" : f < back ? "front" : "angry"} flip={!(f >= east && f < back)} bottom={100} enter="none"
            beat={f < stop ? "shake" : "none"} beatAt={6} gesture={f < stop ? "fist" : f >= back ? "point" : undefined} gestureAt={f < stop ? 12 : back + 4} />
          {[0, 1, 2].map((i) => <Merchant key={i} x={520 + i * 170} y={930 + i * 12} s={0.95 + i * 0.05} walk={false} v={i + 1} look={0.35} paiza />)}
        </Cam>
      </AbsoluteFill>
  );
  const t = f - go;
  if (f < go)
    return (
      <AbsoluteFill>
        {camp}
        <SFX name="drum" at={6} vol={0.3} dur={40} />
        <SFX name="battle_far" at={east} vol={0.18} dur={back - east} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill>
      <Steppe time="dusk" horizon={560} />
      <Glow x={300} y={520} r={500} color="#f6b06a" op={0.4} />
      {[2, 1, 0].map((i) => {
        const q = k01((t - i * 8) / 110);
        const w = 360 - 260 * q;
        return <Rider key={i} kind="mongol" x={1500 - 1250 * q - w / 2 + i * 60} y={900 - 330 * q - w * 0.775 + i * 30} w={w} flip phase={i * 5} />;
      })}
      {t < 16 && camp}
      <SFX name="gallop" at={0} vol={0.4} dur={frames - go} />
    </AbsoluteFill>
  );
};
// 샤의 궁궐: 푸른 타일 벽, 금테 뾰족 아치, 기둥, 3단 단상 위 금빛 옥좌, 붉은 카펫, 양옆 휘장(sway 바람), 매달린 등잔
const PalaceHall = ({ sway = 0, turban = false }: { sway?: number; turban?: boolean }) => (
  <AbsoluteFill>
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <defs>
        <pattern id="ch5-tile" width={64} height={64} patternUnits="userSpaceOnUse">
          <rect width={64} height={64} fill="#2f5a7e" />
          <path d="M 32 4 L 60 32 L 32 60 L 4 32 Z" fill="#3f6f96" stroke="#c9a24a" strokeWidth={2} />
          <circle cx={32} cy={32} r={6} fill="#e8dcc0" />
        </pattern>
      </defs>
      <rect width={1920} height={800} fill="url(#ch5-tile)" />
      <path d="M 600 780 L 600 330 Q 600 140 960 60 Q 1320 140 1320 330 L 1320 780 Z" fill="#1f3550" stroke="#c9a24a" strokeWidth={14} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${660 + i * 60} 330 Q ${760 + i * 50} ${200 - i * 20} 960 ${130 + i * 30} Q ${1160 - i * 50} ${200 - i * 20} ${1260 - i * 60} 330`} fill="none" stroke="#c9a24a" strokeWidth={4} opacity={0.6} />)}
      {[520, 1360].map((x) => <rect key={x} x={x - 26} y={120} width={52} height={680} fill="#e8dcc0" stroke={INK} strokeWidth={6} />)}
      <rect y={780} width={1920} height={300} fill="#7a2c22" />
      <path d="M 0 860 L 1920 860 M 0 1020 L 1920 1020" stroke="#c9a24a" strokeWidth={8} />
      {[0, 1, 2].map((i) => <rect key={i} x={640 + i * 50} y={700 + i * 28} width={640 - i * 100} height={30} fill={i % 2 ? "#e8dcc0" : "#d8c49a"} stroke={INK} strokeWidth={5} />)}
      <path d="M 820 704 L 820 420 Q 820 330 960 290 Q 1100 330 1100 420 L 1100 704 Z" fill="#c9a24a" stroke={INK} strokeWidth={7} />
      <path d="M 850 690 L 850 430 Q 850 360 960 330 Q 1070 360 1070 430 L 1070 690 Z" fill="#8a2a22" stroke={INK} strokeWidth={4} />
      <rect x={790} y={636} width={340} height={70} rx={14} fill="#c9a24a" stroke={INK} strokeWidth={6} />
      <rect x={810} y={620} width={300} height={30} rx={12} fill="#3f6690" stroke={INK} strokeWidth={4} />
      {turban && (
        <g transform="translate(900 748) rotate(-14)">
          <ellipse cx={0} cy={0} rx={46} ry={24} fill="#f2e8d2" stroke={INK} strokeWidth={5} />
          <path d="M -38 -6 C -10 -18 20 -18 40 -4 M -34 8 C -6 -2 22 -2 40 8" stroke="#c8bba0" strokeWidth={4} fill="none" />
          <path d="M 40 0 C 90 10 130 30 180 26" stroke="#f2e8d2" strokeWidth={14} fill="none" strokeLinecap="round" />
        </g>
      )}
      <path d={`M -10 -10 L 330 -10 C 300 300 ${340 + sway} 600 ${300 + sway * 1.6} 900 L -10 900 Z`} fill="#8a2a22" stroke={INK} strokeWidth={6} />
      <path d={`M 1930 -10 L 1590 -10 C 1620 300 ${1580 + sway} 600 ${1620 + sway * 1.6} 900 L 1930 900 Z`} fill="#8a2a22" stroke={INK} strokeWidth={6} />
      {[700, 1220].map((x) => <path key={x} d={`M ${x} 0 L ${x} 160 M ${x - 26} 160 L ${x + 26} 160 L ${x + 14} 190 L ${x - 14} 190 Z`} stroke={INK} strokeWidth={5} fill="#c9a24a" />)}
    </svg>
    <Glow x={700} y={200} r={160} op={0.5} />
    <Glow x={1220} y={200} r={160} op={0.5} />
  </AbsoluteFill>
);
// 8) c5_08 샤의 궁궐 (사신 셋의 등 뒤에서 본 옥좌): 샤가 손짓 → 병사 둘이 가운데 사신을 끌어 나감
//    → 벽에 비친 그림자: 무릎 꿇린 사신과 칼이 들리는 실루엣 → 내려오는 순간 검은 화면 + 둔탁한 소리 (피 없이)
//    → 궁궐 문밖: 수염이 밀린 두 사신이 턱을 가린 채 쫓겨나 비틀비틀 걸어감, 문가 계단엔 밀린 수염 뭉치
const H_END = 56, X_CUT = 104, X_OUT = 118; // 칼 그림자 장면 1초 → 1.6초 (2026-10-27 빠른 전환 하네스)
export const S8 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  // 장면 셋을 겹쳐서 넘김 (2026-10-27 빠른 전환 하네스: 궁궐 → 칼 그림자 → 검은 화면 → 쫓겨남이 1.5초 안에 뚝뚝 끊겼음)
  const XF = 12;
  const layers: React.ReactNode[] = [];
  if (f < H_END + XF) {
    const g = lerp(f, 16, 32, 0, 1, true);
    const d = lerp(f, 32, H_END, 0, 1, true);
    layers.push(
      <AbsoluteFill key="hall">
      <Cam z={lerp(f, 0, H_END, 1.0, 1.06)} cx={960} cy={600}>
        <PalaceHall />
        <Char id="muhammad" x={960} h={470} pose="angry" bottom={380} enter="none" beat="none" gesture="point" gestureAt={4} />
        <EnvoyBack x={560} y={1060} s={1.1} bow={0.6} robe="#7a5a3a" hat="#4d6b8a" />
        <EnvoyBack x={1360} y={1060} s={1.1} bow={0.6} robe="#5e6f4a" hat="#6b4f3a" />
        <div style={{ position: "absolute", inset: 0, transform: `translate(${d * 760}px, ${-g * 30}px)` }}>
          <EnvoyBack x={960} y={1070} s={1.15} bow={0.3 - g * 0.3} />
        </div>
        <Spearman x={lerp(g, 0, 1, 700, 860) + d * 760} y={lerp(g, 0, 1, 790, 1040)} s={lerp(g, 0, 1, 0.95, 1.3)} col="#2a2230" />
        <Spearman x={lerp(g, 0, 1, 1220, 1070) + d * 760} y={lerp(g, 0, 1, 790, 1040)} s={lerp(g, 0, 1, 0.95, 1.3)} col="#2a2230" />
      </Cam>
      </AbsoluteFill>,
    );
  }
  if (f >= H_END && f < X_CUT + XF) {
    const b = interpolate(f, [H_END, 76, 80, X_CUT], [0, 1, 1, 0.35], clamp);
    layers.push(
      <AbsoluteFill key="shadow" style={{ opacity: Math.min(lerp(f, H_END, H_END + XF, 0, 1), lerp(f, X_CUT - 4, X_CUT + XF, 1, 0)) }}>
        <AbsoluteFill style={{ background: "linear-gradient(#c89a62, #a87a48)" }} />
        <Glow x={260} y={700} r={700} color="#f6b06a" op={0.5} />
        <div style={{ position: "absolute", inset: 0, filter: "brightness(0) blur(2px)", opacity: 0.78 }}>
          <EnvoyBack x={820} y={1000} s={1.8} bow={0.9} />
          <Spearman x={1200} y={1020} s={2.0} blade={b} />
        </div>
      </AbsoluteFill>
    );
  }
  if (f >= X_OUT) {
    const t = f - X_OUT;
    layers.push(
      <AbsoluteFill key="out" style={{ opacity: lerp(t, 0, 18, 0, 1) }}>
      <Cam z={lerp(t, 0, frames - X_OUT, 1.0, 1.05)} cx={900} cy={600}>
        <AbsoluteFill style={{ background: "linear-gradient(#cfd8d6, #efe6cc 70%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <defs>
            <pattern id="ch5-tile2" width={64} height={64} patternUnits="userSpaceOnUse">
              <rect width={64} height={64} fill="#2f5a7e" />
              <path d="M 32 4 L 60 32 L 32 60 L 4 32 Z" fill="#3f6f96" stroke="#c9a24a" strokeWidth={2} />
            </pattern>
          </defs>
          <path d="M 1000 250 C 1000 60 1500 60 1500 250 Z" fill="#3f6f96" stroke={INK} strokeWidth={6} />
          <rect x={860} y={250} width={1100} height={620} fill="#d8bc86" stroke={INK} strokeWidth={6} />
          <path d="M 1080 870 L 1080 470 Q 1080 330 1250 290 Q 1420 330 1420 470 L 1420 870 Z" fill="url(#ch5-tile2)" stroke="#c9a24a" strokeWidth={12} />
          <path d="M 1150 870 L 1150 520 Q 1150 420 1250 400 Q 1350 420 1350 520 L 1350 870 Z" fill="#2a1d14" stroke={INK} strokeWidth={6} />
          <rect x={-10} y={870} width={1940} height={220} fill="#c9b48a" stroke={INK} strokeWidth={5} />
          {[0, 1, 2].map((i) => <rect key={i} x={1040 - i * 40} y={870 + i * 24} width={420 + i * 80} height={24} fill="#e0cfa4" stroke={INK} strokeWidth={4} />)}
          {[[1120, 900], [1190, 915], [1300, 905], [1240, 935]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} c 6 -10 14 -10 18 0 c 4 -8 12 -8 14 2`} stroke="#2a1d14" strokeWidth={5} fill="none" />)}
        </svg>
        <Spearman x={1440} y={900} s={1.0} spear={55} col="#2a2230" />
        <Merchant x={1150 - t * 4.6} y={960} s={1.0} phase={t / 4.5} v={1} flip shaved look={0.5} />
        <Merchant x={1300 - t * 4.6} y={985} s={1.05} phase={t / 4.5 + 1.4} v={4} flip shaved look={0.6} />
      </Cam>
      </AbsoluteFill>,
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {layers}
      <SFX name="sword" at={H_END + 6} vol={0.35} dur={30} />
      <SFX name="impact" at={X_CUT} vol={0.55} dur={40} />
      <SFX name="crowd" at={X_OUT} vol={0.12} dur={frames - X_OUT} />
    </AbsoluteFill>
  );
};
// 9) c5_09 노을의 칸 진영: 수염이 밀려 돌아온 두 사신(턱을 가림) 앞에서 분노하는 칸 → "전쟁을"에서 검은 툭(전쟁의 깃발)이 솟음
const S9 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const war = sec(3.1);
  const up = spring({ frame: f - war, fps, config: { damping: 12, stiffness: 110 } });
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={1200} cy={600}>
        <Steppe time="dusk" horizon={600} />
        {Array.from({ length: 10 }).map((_, i) => <Ger key={i} x={120 + i * 185} y={630 + (i % 3) * 12} w={130} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={0.6} />)}
        {Array.from({ length: 6 }).map((_, i) => <Tug key={`t${i}`} x={1050 + i * 120} y={660} h={280} sway={Math.sin((f + i * 11) / 13) * 5} />)}
        {f >= war - 2 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - up) * 560}px)` }}><Tug x={1730} y={980} h={640} color="#1d1612" sway={Math.sin(f / 9) * 8} /></div>}
        <Guard x={1840} h={500} bottom={150} flip />
        <Char id="genghis" x={1400} h={660} pose="angry" flip bottom={90} enter="none" beat="shake" beatAt={16} gesture={f >= war ? "fist" : undefined} gestureAt={war} />
        <Merchant x={560} y={960} s={1.05} walk={false} v={1} shaved look={0.55} />
        <Merchant x={760} y={985} s={1.1} walk={false} v={4} shaved look={0.6} />
      </Cam>
      <SFX name="war_drums" at={war} vol={0.4} dur={frames - war} />
    </AbsoluteFill>
  );
};
// 10) c5_10 지도로 크기 비교: 호라즘 땅이 빛나며 초록 병사들이 빼곡히 → 몽골 땅의 기병은 적음 → "금나라" - 몽골 기병 절반이 동쪽 금나라 전선으로,
//     불길과 붉은 점선 전선 → 카메라가 빠지며 전선이 둘 (서쪽 호라즘·동쪽 금나라) 사이에 낀 몽골
const JIN = poly([[108, 41.2], [113, 41.6], [117, 41.2], [120, 40.2], [122, 38.5], [120.5, 35.5], [117, 33.5], [112, 33], [108, 34.5], [106.5, 37], [107, 39.5]]);
const KH_ARMY = [[57, 39], [59, 40.5], [61, 39.5], [62.5, 41], [63.5, 38.5], [65, 40.5], [66, 38], [67.5, 39.5], [56, 37.6], [58.5, 37.5], [60.5, 37], [62.5, 36.5], [64.5, 36.6], [66.5, 36.4], [53, 35.5], [55, 35.6], [57, 35.4], [59, 35], [61, 34.6], [63, 34], [65.5, 34.2], [50, 34], [52, 33.4], [54, 33.2], [56, 32.8], [58, 32.4], [60, 32], [62.5, 31.5], [52.5, 31], [55, 30.6], [57.5, 30], [60, 29.6], [62, 43], [64, 43.6], [66, 42.6], [54.5, 38.6]].map(([lo, la]) => P(lo, la));
const MG_ARMY = [[95, 47.5], [98, 46.6], [101, 46.8], [104, 47.6], [107, 47.2], [93, 45.6], [96, 45], [100, 45.4], [103, 45.6], [106, 45.2]].map(([lo, la]) => P(lo, la));
const JIN_FRONT = [P(109, 41.4), P(112, 41.8), P(115, 41.4), P(118, 40.6), P(120, 39.6)];
const S10 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  // 2026-10-27: 이 줄에서 "금나라와 싸우고 있었습니다"를 빼고(사신 장면 c5_07로 옮김) "이제 싸움은 피할 수 없었습니다 / 하지만 호라즘은 몇 배나 큰" → 동쪽 금나라 전선으로 가지 않고 호라즘 군대에 머묾
  const p2 = frames + 999;
  const k1 = lerp(f, p2, p2 + 50, 0, 1, true);
  const k2 = lerp(f, frames - 70, frames - 20, 0, 1, true);
  const cx = interpolate(k1, [0, 1], [1050, 2350]) * (1 - k2) + 1650 * k2;
  const cy = interpolate(k1, [0, 1], [780, 640]) * (1 - k2) + 740 * k2;
  const z = (lerp(f, 0, p2, 0.82, 0.88) * (1 - k1) + 1.0 * k1) * (1 - k2) + 0.76 * k2;
  const glow = 0.5 + 0.5 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{ background: "#c3cbbd" }}>
      <MapCam z={z} cx={cx} cy={cy}>
        <MapBoard kh={1} />
        <svg width={MAP_W} height={MAP_H} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <path d={KHWARAZM} fill="none" stroke="#f2ead8" strokeWidth={16} opacity={lerp(f, 4, 20, 0, 0.7) * (1 - k1 * 0.6) * (0.6 + 0.4 * glow)} />
          <path d={JIN} fill="#d9b44a" opacity={0.55} stroke={INK} strokeWidth={5} strokeDasharray="20 12" />
          {/* 전선: 동쪽 금나라 (붉은 점선) · 끝에 서쪽 호라즘 국경 */}
          <path d={"M " + JIN_FRONT.map((q) => q.join(" ")).join(" L ")} stroke="#a8332a" strokeWidth={12} strokeDasharray="26 16" fill="none" opacity={lerp(f, p2 + 20, p2 + 40, 0, 1)} />
          <path d={SYR} stroke="#a8332a" strokeWidth={12} strokeDasharray="26 16" fill="none" opacity={k2} />
        </svg>
        {MG_TUGS.map(([x, y], i) => <Tug key={i} x={x} y={y} h={150} sway={Math.sin((f + i * 9) / 12) * 4} />)}
        {KH_CITIES.map(([x, y], i) => <KhFlag key={`f${i}`} x={x + 34} y={y} h={130} />)}
        {/* 호라즘 병사 (빼곡히) */}
        {KH_ARMY.map(([x, y], i) => f >= 8 + i * 1.5 && <Spearman key={`k${i}`} x={x} y={y} s={0.22} col="#2e5a40" spear={0} />)}
        {/* 몽골 기병 (적음) - 절반은 동쪽 금나라 전선으로 */}
        {MG_ARMY.map(([x, y], i) => {
          const east = i % 2 === 1;
          const m = east ? lerp(f, p2 + 6 + i * 3, p2 + 56 + i * 3, 0, 1, true) : 0;
          const tgt = JIN_FRONT[(i >> 1) % 5];
          const tx = x + (tgt[0] - 60 - x) * m;
          const ty = y + (tgt[1] + 40 - y) * m;
          return f >= 40 + i * 3 && <Rider key={`m${i}`} kind={i === 0 ? "mongol_white" : "mongol"} x={tx - 60} y={ty - 93} w={120} flip={!east} still={m === 0 || m === 1} phase={i * 3} />;
        })}
        {JIN_FRONT.map(([x, y], i) => <Glow key={`g${i}`} x={x} y={y} r={90} color="#f08a3a" op={lerp(f, p2 + 40, p2 + 60, 0, 0.6) * (0.7 + 0.3 * Math.sin(f / 4 + i))} />)}
      </MapCam>
      <SFX name="drum" at={6} vol={0.3} dur={40} />
      {p2 + 30 < frames && <SFX name="battle_far" at={p2 + 30} vol={0.18} dur={frames - p2 - 30} />}
    </AbsoluteFill>
  );
};
// 12) 편 끝 20초 고정 엔딩 (나레이션 뒤, 엔딩 음악 ending.wav): 어두운 초원 지평선, 왼쪽 언덕 위 칭기즈칸 실루엣과 흰 툭.
//     오른쪽 넓은 하늘은 유튜브 최종 화면(다음 편 칸·구독 버튼) 자리 - 글자 없음, 아주 느린 움직임만 (툭 꼬리·별·카메라)
export const ENDING_FRAMES = 600; // scripts/check-draft.py·draft-final.py가 이 줄을 읽어 장 길이에 더함
export const Ending = () => {
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
          <Tug x={700} y={704} h={430} sway={Math.sin(f / 22) * 6} />
        </div>
        {/* 칭기즈칸인 게 보이게 (2026-10-27 사용자): 완전 검은 그림자 → 어둡게 눌러 흰 투구·붉은 옷 색만 살짝, 노을 쪽(왼쪽) 가장자리에 주황 빛 */}
        <div style={{ position: "absolute", inset: 0, filter: "brightness(0.3) saturate(1.4) drop-shadow(-4px 0 0 rgba(240,150,90,0.75)) drop-shadow(-2px -2px 3px rgba(255,190,120,0.5))" }}>
          <Char id="genghis" x={560} h={400} pose="side" bottom={1080 - 700} enter="none" beat="none" />
        </div>
      </Cam>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5))" }} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [0, 36], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};


// ---------- 엔딩 미끼 (2026-10-27 사용자: "2편 관련 내용으로, 아주 자극적으로 궁금해지게" - 2편 = 호라즘 전쟁) ----------
// 무릎을 끌어안고 고개를 묻은 샤 (옆모습, 오른쪽을 봄). x,y = 엉덩이 아래 땅. 옷은 5장 샤의 초록 옷을 색 빼서
const HuddledShah = ({ x, y, s = 1, breath = 0 }: { x: number; y: number; s?: number; breath?: number }) => {
  const robe = "#56634f", dark = "#3c4637", skin = "#b89478", turban = "#d9d2c2";
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "url(#kit-ink) saturate(0.5) brightness(0.8)" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={4} rx={150} ry={18} fill="rgba(0,0,0,0.25)" />
        {/* 등과 엉덩이 (둥글게 굽음) */}
        <path d={`M -110 0 C -140 -60 -120 -170 -40 -${205 + breath * 4} C 10 -220 50 -190 60 -150 L 70 0 Z`} fill={robe} stroke={INK} strokeWidth={5} />
        {/* 세운 무릎과 정강이 */}
        <path d="M 10 -150 C 70 -175 130 -150 130 -110 L 120 0 L 60 0 L 70 -100 C 50 -110 25 -112 10 -120 Z" fill={dark} stroke={INK} strokeWidth={5} />
        {/* 맨발 */}
        <path d="M 112 0 C 112 -14 150 -14 162 -4 L 162 4 L 112 4 Z" fill={skin} stroke={INK} strokeWidth={4} />
        {/* 무릎에 묻은 머리 + 터번 */}
        <g transform={`translate(${breath * 2} ${breath * 3})`}>
          <circle cx={58} cy={-176} r={42} fill={skin} stroke={INK} strokeWidth={5} />
          <path d="M 18 -196 C 20 -246 100 -250 104 -200 C 90 -186 30 -184 18 -196 Z" fill={turban} stroke={INK} strokeWidth={5} />
          <path d="M 30 -212 C 55 -222 80 -222 98 -212" stroke="#b3ab98" strokeWidth={4} fill="none" />
          {/* 수염 끝이 무릎 사이로 */}
          <path d="M 70 -142 C 82 -130 92 -126 100 -130" stroke="#2e2620" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
        {/* 무릎을 감싼 팔 */}
        <path d="M -30 -170 C 20 -150 110 -150 128 -122 C 132 -110 118 -102 100 -108 C 70 -118 30 -122 -10 -128" fill={robe} stroke={INK} strokeWidth={5} />
        <circle cx={122} cy={-116} r={14} fill={skin} stroke={INK} strokeWidth={4} />
      </g>
    </svg>
  );
};
// 12) c5_18 "세계 최강이라던 이 나라의 왕은 몽골 기병에게 쫓겨, / 바다 건너 작은 섬으로 겨우 달아납니다" (2026-10-27 사용자: 옥좌에서 끌려나오는 안 → 실제 기록대로 쫓겨 달아남, 나사위)
//     옥좌의 샤(우쭐) → 궁궐이 흔들리며 몽골 기병 그림자가 쏟아져 들어옴 → 샤가 놀라 벌떡 일어나 달아남 → 바닷가: 작은 배에 오른 샤, 언덕 위 기병이 활을 쏘고 화살이 물에 꽂힘, 배가 멀어짐
const BURST = sec(3.4), FLEE = sec(4.2), SHORE = sec(5.3); // 영어 본편 기준: "fled from the Mongol horsemen" 3.5초, "escaping by boat" 5.3초 // "사신의 목을 베었던 호라즘의 왕은," 동안 옥좌 → "몽골 기병에게 쫓겨" 기병 그림자 → "/ 바다 건너" 5.3초 바닷가
const ShoreFlight = ({ t, len }: { t: number; len: number }) => {
  const bx = lerp(t, 0, len, 980, 1520); // 배가 멀어짐
  const by = 760 + Math.sin(t / 8) * 6;
  const arrive = lerp(t, 6, 26, 0, 1, true); // 언덕 위에 기병이 나타남
  const shots = [14, 22, 30, 40, 52, 64];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#59646b 0%, #8d979b 42%, #6b777d 44%, #33404a 100%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const y = 500 + i * 85, dx = ((t * (0.6 + i * 0.1)) % 240) - 240;
          let d = `M ${dx + 760} ${y}`;
          for (let x = dx + 760; x < 2000; x += 120) d += ` q 30 -14 60 0 t 60 0`;
          return <path key={i} d={d} stroke="#d4dadb" strokeWidth={2 + i * 0.5} fill="none" opacity={0.22 + i * 0.05} />;
        })}
        {/* 바닷가 언덕 (왼쪽) */}
        <path d="M -40 1100 L -40 380 C 160 360 420 420 620 560 C 760 660 820 820 860 1100 Z" fill="#7a6e55" stroke={INK} strokeWidth={5} />
        {/* 작은 배 */}
        <g transform={`translate(${bx} ${by}) rotate(${Math.sin(t / 9) * 3})`}>
          <path d="M -150 0 L 150 0 L 110 60 L -110 60 Z" fill="#5a4330" stroke={INK} strokeWidth={5} />
          <path d="M -60 -6 L -60 -150 M -60 -150 L 40 -40" stroke={INK} strokeWidth={5} fill="none" />
        </g>
      </svg>
      {/* 배 위의 샤 (허름하게 색 빠짐, 뒤를 돌아봄) */}
      <div style={{ position: "absolute", inset: 0, filter: "saturate(0.35) brightness(0.8)", clipPath: `inset(0 0 ${1080 - by - 4}px 0)` }}>
        <Char id="muhammad" x={bx + 30} h={220} pose="shocked" bottom={1080 - by - 40} enter="none" beat="none" />
      </div>
      {/* 언덕 위 몽골 기병 */}
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ opacity: arrive }}><Rider kind={RKIND[i % 3]} x={60 + i * 120 - (1 - arrive) * 200} y={300 + i * 22} w={230} phase={i * 3} still={t > 30} /></div>)}
      {/* 화살: 언덕에서 배 쪽으로 날아가 물에 꽂힘 (배는 못 맞힘) */}
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {shots.map((s0, i) => {
          const q = (t - s0) / 20;
          if (q < 0) return null;
          const x0 = 300 + i * 70, y0 = 380 + (i % 3) * 20, x1 = bx - 220 + i * 25, y1 = 800 + (i % 2) * 30;
          if (q >= 1) {
            const sp = Math.min(1, (q - 1) * 2);
            return <g key={i}><path d={`M ${x1} ${y1} l -26 -16`} stroke={INK} strokeWidth={4} /><circle cx={x1} cy={y1 + 4} r={10 + sp * 26} fill="none" stroke="#e6ecee" strokeWidth={3} opacity={1 - sp} /></g>;
          }
          const x = x0 + (x1 - x0) * q, y = y0 + (y1 - y0) * q - Math.sin(Math.PI * q) * 160;
          const dx = (x1 - x0), dy = (y1 - y0) - Math.cos(Math.PI * q) * 160 * Math.PI;
          const a = (Math.atan2(dy, dx) * 180) / Math.PI;
          return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}><path d="M -34 0 L 0 0" stroke={INK} strokeWidth={4} /><path d="M 0 0 l -10 -6 M 0 0 l -10 6" stroke={INK} strokeWidth={3} /></g>;
        })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5))" }} />
    </AbsoluteFill>
  );
};
const S12Flee = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const sh = shake(f, BURST, 9, 26);
  const toShore = lerp(f, SHORE - 6, SHORE + 16, 0, 1, true);
  const run = lerp(f, FLEE, SHORE, 0, 1, true);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {toShore < 1 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, SHORE, 1.0, 1.08)} cx={960} cy={520} sx={sh.x} sy={sh.y}>
            <PalaceHall />
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${run * run * 1100}px)` }}>
              <Char id="muhammad" x={960} h={470} pose={f < BURST + 4 ? "smug" : "shocked"} flip={f >= FLEE} bottom={380 - run * 40} enter="none" beat={f >= BURST + 4 && f < FLEE ? "jump" : "none"} beatAt={BURST + 4} />
            </div>
            {/* 몽골 기병 그림자가 앞쪽으로 쏟아져 들어옴 */}
            {f >= BURST && Array.from({ length: 10 }).map((_, i) => {
              const q = (f - BURST - i * 3) / 34;
              if (q < 0 || q > 1.4) return null;
              return <Rider key={i} kind={RKIND[i % 3]} x={-520 + q * 1500 + (i % 4) * 160} y={560 + (i % 3) * 60} w={420 + (i % 3) * 70} phase={i * 4} dark />;
            })}
          </Cam>
          <Glow x={960} y={420} r={620} color="#f6c86a" op={0.3 * (1 - lerp(f, BURST, BURST + 20, 0, 1))} />
        </AbsoluteFill>
      )}
      {toShore > 0 && <AbsoluteFill style={{ opacity: toShore }}><ShoreFlight t={f - SHORE} len={frames - SHORE} /></AbsoluteFill>}
      <SFX name="impact" at={BURST} vol={0.5} dur={40} />
      <SFX name="cavalry" at={BURST} vol={0.4} dur={SHORE - BURST + 10} />
      <SFX name="war_cry" at={BURST + 6} vol={0.2} dur={50} />
      <SFX name="wind" at={SHORE} vol={0.3} dur={frames - SHORE} />
      <SFX name="arrows" at={SHORE + 14} vol={0.35} dur={70} />
    </AbsoluteFill>
  );
};
// 13) c5_19 "그리고 1년 뒤, 그 섬에서 수의 한 벌 없이 혼자 죽습니다" - 회색 바다 위 작은 섬, 무릎을 끌어안고 고개를 묻은 샤 (숨 쉬듯 어깨가 들썩임)
const S12Island = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, frames, 1.0, 1.12)})`, transformOrigin: "50% 62%" }}>
        <AbsoluteFill style={{ background: "linear-gradient(#4f5a62 0%, #7f898e 40%, #5f6b71 42%, #2f3a40 100%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const y = 470 + i * 80, dx = ((f * (0.5 + i * 0.1)) % 240) - 240;
            let d = `M ${dx - 40} ${y}`;
            for (let x = dx; x < 2000; x += 120) d += ` q 30 -14 60 0 t 60 0`;
            return <path key={i} d={d} stroke="#d4dadb" strokeWidth={2 + i * 0.5} fill="none" opacity={0.22 + i * 0.05} />;
          })}
          <path d="M 420 860 C 620 720 1300 700 1500 830 C 1560 900 1340 960 960 962 C 640 964 360 930 420 860 Z" fill="#7d715a" stroke={INK} strokeWidth={5} />
          {[560, 660, 1300, 1380].map((x, i) => <path key={i} d={`M ${x} ${820 - (i % 2) * 8} l -10 -44 M ${x} ${820 - (i % 2) * 8} l 8 -40 M ${x} ${820 - (i % 2) * 8} l 18 -28`} stroke="#4f4632" strokeWidth={4} fill="none" />)}
        </svg>
        <HuddledShah x={960} y={880} s={1.25} breath={Math.sin(f / 16)} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 65% at 50% 60%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55))" }} />
      </AbsoluteFill>
      <SFX name="wind" at={0} vol={0.35} dur={frames} />
    </AbsoluteFill>
  );
};
// 14) c5_20~17 호라즘 지도: 도시마다 꽂힌 깃발이 하나씩 쓰러짐 → "몽골 제국 시리즈, 2편에서 이어집니다" 동안 천천히 검게 → 엔딩
const S14Question = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#c3cbbd" }}>
      <MapCam z={lerp(f, 0, frames, 0.82, 0.92)} cx={MX(61)} cy={MY(38)}>
        <MapBoard kh={1} />
        {KH_CITIES.map(([x, y], i) => <KhFlag key={i} x={x + 34} y={y} h={130} fall={lerp(f, 20 + i * 12, 34 + i * 12, 0, 1, true)} />)}
      </MapCam>
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(lerp(f, 0, 12, 0.5, 0), lerp(f, frames - 45, frames - 5, 0, 1)) }} />
      <SFX name="rumble" at={10} vol={0.25} dur={frames - 10} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: ["c5_01", "c5_02"], Shot: S1 },
  { ids: ["c5_03"], Shot: S2 },
  { ids: ["c5_04"], Shot: S3 },
  { ids: ["c5_05"], Shot: S4 },
  { ids: ["c5_06"], Shot: S5 },
  { ids: ["c5_07"], Shot: S7 },
  { ids: ["c5_08"], Shot: S8 },
  { ids: ["c5_09"], Shot: S9 },
  { ids: ["c5_10"], Shot: S10 },
  { ids: ["c5_11"], Shot: S10Camp },
  { ids: ["c5_12", "c5_13", "c5_14"], Shot: S10Council },
  { ids: ["c5_15"], Shot: S10Doubt },
  { ids: ["c5_16", "c5_17", "c5_18", "c5_19"], Shot: S11 },
  { ids: ["c5_20"], Shot: S12Flee },
  { ids: ["c5_21"], Shot: S12Island },
  { ids: ["c5_22", "c5_23"], Shot: S14Question },
];

// ---------- 이 장의 틀: kit의 Chapter와 같은 시간 계산(장 카드·줄마다 목소리·쉼·멈춤), 브금만 장면 따라 끊고 바꿈 ----------
const V = voice as Record<string, { sec: number }>;
const Chapter5 = ({ ch, year, groups: gs }: { ch: string; year: string; groups: Group[] }) => {
  const { fps } = useVideoConfig();
  const lang = useLang();
  const ls = chapterLines(ch);
  const start: Record<string, number> = {};
  let t = CARD;
  for (const l of ls) {
    start[l.id] = t;
    t += lineFrames(l.id);
  }
  const total = chapterFrames(ch); // 나레이션 끝(장면 끝) - 그 뒤 ENDING_FRAMES 동안 엔딩
  const duck = (fr: number) => Math.max(0, ...ls.map((l) => {
    const a = start[l.id], b = start[l.id] + Math.ceil((secOf(l.id, lang) / rateOf(l.id, lang)) * fps);
    return Math.min(interpolate(fr, [a - 8, a], [0, 1], clamp), interpolate(fr, [b, b + 8], [1, 0], clamp));
  }));
  const shut = start.c5_06 + T_SHUT; // 성문이 닫히는 순간 - 음악이 끊김
  const tension = start.c5_07; // 칸의 분노·사신·궁궐·지도 - 긴장된 곡
  const climb = start.c5_16; // 산에 오를 때 슬픈 곡으로 조용히 바뀜
  const end = start.c5_19 + 34; // 언덕 위 칸·돌격부터는 뿔나팔·북·말발굽 (장면 효과음), 엔딩은 ending.wav만
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <InkDefs />
      {gs.map((g, i) => {
        const from = start[g.ids[0]];
        const next = gs[i + 1] ? start[gs[i + 1].ids[0]] : total;
        return (
          <Sequence key={i} from={from} durationInFrames={next - from + (gs[i + 1] ? SHOT_XF : 0)}>
            <FadeIn on={i > 0}><g.Shot at={(id) => start[id] - from} frames={next - from} /></FadeIn>
          </Sequence>
        );
      })}
      {/* 연도 카드: 첫 장면 위에서 서서히 사라짐 (kit Chapter와 같음, 2026-10-27 빠른 전환) */}
      <Sequence durationInFrames={CARD + CARD_X}><ChapterCard year={year} /></Sequence>
      {ls.map((l) => <Sequence key={l.id} from={start[l.id]}><Snd voice src={voiceSrc(l.id, lang)} playbackRate={rateOf(l.id, lang)} /></Sequence>)}
      {/* 성문이 닫히면 음악이 확 작아짐(끊지 않음 - 2026-10-26 "뚝 끊김" 하네스) → 긴장된 곡이 겹쳐 올라옴 → 슬픈 곡. 곡은 kit Bgm이 겹쳐 이어 붙임 */}
      <Bgm music="intrigue" frames={tension + 30} fadeOut={30} vol={(fr) => (0.26 - 0.16 * duck(fr)) * interpolate(fr, [shut - 50, shut - 2], [1, 0.3], clamp)} />
      <Sequence from={tension} durationInFrames={climb - tension + 40}><Bgm music="tension" frames={climb - tension + 40} fadeIn={30} fadeOut={40} vol={(fr) => 0.24 - 0.14 * duck(fr + tension)} /></Sequence>
      {/* 슬픈 곡은 마지막 줄의 숨 쉬는 틈("그리고 그 나라는, / 지도에서…")을 지나 돌격 효과음 밑으로 5초에 걸쳐 빠짐 - 예전엔 1초 만에 사라져 틈이 완전 무음 (2026-10-27 브금 끊김 10:19) */}
      <Sequence from={climb} durationInFrames={end + 120 - climb}><Bgm music="lament" frames={end + 120 - climb} fadeIn={40} fadeOut={150} vol={(fr) => 0.24 - 0.14 * duck(fr + climb)} /></Sequence>
      {/* 엔딩 미끼(c5_18~16) 동안 낮게 깔리는 긴장 곡 - 슬픈 곡이 빠지는 자리에서 겹쳐 올라옴 */}
      <Sequence from={start.c5_20 - 20} durationInFrames={total - start.c5_20 + 20}><Bgm music="tension" frames={total - start.c5_20 + 20} fadeIn={50} fadeOut={60} vol={(fr) => 0.24 - 0.14 * duck(fr + start.c5_20 - 20)} /></Sequence>
      <Sequence from={0} durationInFrames={30}><Snd src={staticFile("sfx/ep/page.wav")} volume={0.4} /></Sequence>
      <Sequence from={total} durationInFrames={ENDING_FRAMES}>
        <Ending />
        <Snd src={staticFile("bgm/ending.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
// 5장 길이 = 보통 장 길이 + 10초 엔딩 (Root·M01Draft가 이 값을 씀)
export const M01_CH5_FRAMES = chapterFrames("5") + ENDING_FRAMES;
export const M01Ch5 = () => <Chapter5 ch="5" year="1218" groups={groups} />;
