// 몽골 1편 도입부 30초 (2026-10-26 합격본 → 같은 날 퀄리티 올림: 1·2장 수준의 배경·조명·전용 그림)
// 재료: public/hook/m01/ (내레이션 n1~n5.wav, voice.json, europe.svg), public/series/mongol/ (세계 땅·1260 영역), public/chars/ (캐릭터 겹), public/riders/ (기병 run0~3)
// 화면 글자는 숫자·연도만 (02 화면 글자 규칙), 흰 번쩍임 없음, 흔들림은 느리게, 소품은 손이나 땅에, 번지는 물감 효과 없음
// 장면 길이는 voice.json(목소리 길이)으로 계산 - 내레이션이 바뀌면 자동으로 맞춰짐
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "../../public/hook/m01/voice.json";
import { Character } from "../episode/Character";
import { Bgm, Fire, Ger, Glow, InkDefs as KitInkDefs, Lang, Rider, secOf, slotSec, SPEEDUP, Steppe, Tug, useLang, voiceSrc, Snd } from "../draft/kit";
import { EUROPE_LAND } from "./europeLand";
import { HookTown, NationFlag, Persepolis, Colosseum, Aquila, Derafsh, MapTerrain, Grain, InkSplat, GerHall, Brazier } from "./Mongol01HookArt";

const FPS = 30;
const LEAD = 12; // 첫 목소리 전 검은 화면
const GAP = 10;
const KEYS = ["n1", "n2", "n3", "n4", "n5"] as const;
// 줄 길이는 en·ko·es 중 긴 쪽(스페인어는 최대 12% 빠르게) - pt·hi·id는 이 길이 안에 rate로 맞춤(kit.tsx). 한국어는 hook/m01/<k>.wav, 다른 언어는 draft/<언어>/hook_<k>.wav (scripts/draft-lines.py)
const hookSec = (k: (typeof KEYS)[number], lang: Lang) => (lang === "ko" ? voice[k].sec : secOf(`hook_${k}`, lang));
const hookSlot = (k: (typeof KEYS)[number]) => Math.max(hookSec(k, "en"), hookSec(k, "ko"), hookSec(k, "es") / SPEEDUP);
const hookRate = (k: (typeof KEYS)[number], lang: Lang) => Math.max(1, hookSec(k, lang) / hookSlot(k));
const len = (k: (typeof KEYS)[number]) => Math.ceil(hookSlot(k) * FPS) + GAP;
const START = KEYS.reduce<number[]>((a, k, i) => [...a, i ? a[i - 1] + len(KEYS[i - 1]) : LEAD], []);
const TAIL = 30;
export const MONGOL01_HOOK_FRAMES = START[4] + len("n5") + TAIL;
// 짧은 훅 (2026-10-27 사용자: "18초까지만 그대로 쓰고 바로 3장부터"): n4의 첫 문장 "어떻게 가능했을까요?"(n4.wav 0~1.96초)에서 끊고 잠깐 머문 뒤 검게 닫음.
// 브금(main)은 끝에서 SHORT_TAIL만큼 더 흘러 다음 장 브금과 겹치며 빠짐 - 뚝 끊기지 않게
// 언어마다 n4 첫 문장(질문)이 끝나는 초 - n4.wav 무음 시작 (2026-10-27 측정). 화면 길이는 가장 긴 것(ko)으로, 소리는 각 언어 자리에서 끊음
const Q_SEC: Record<string, number> = { ko: 1.96, en: 1.88, es: 1.48, pt: 1.51, hi: 1.34, id: 0.87 };
export const SHORT_Q = Math.ceil(Math.max(...Object.values(Q_SEC)) * FPS);
const shortQ = (lang: Lang) => Math.ceil(((Q_SEC[lang] ?? 1.96) / hookRate("n4", lang)) * FPS);
// 끊은 질문 뒤에 이어 말할 줄(시리즈 시작 멘트 c0_01, 2026-10-27)이 있으면 칸 장면(S4)을 그만큼 늘림
export const AFTER_GAP = 12;
export const shortEnd = (afterId?: string) => START[3] + SHORT_Q + (afterId ? AFTER_GAP + Math.ceil(slotSec(afterId) * FPS) + 30 : 22); // 이어 말할 줄은 가장 긴 언어 길이로
export const SHORT_TAIL = 45;

const INK = "#2b1d14";
const MONGOL_RED = "#a8332a";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn = (x: number) => x * x * x;
const sec = (s: number) => Math.round(s * FPS);
const SERIF = "Baskerville, 'Big Caslon', 'Hoefler Text', serif";
// 구간이 뒤집혀도 깨지지 않는 보간
const lerp = (f: number, a: number, b: number, from: number, to: number, e: ((x: number) => number) | false = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: e } : clamp);
// 느린 카메라 흔들림 (프레임마다 좌우가 뒤집히면 깜빡임처럼 보임)
const shake = (f: number, from: number, amp: number, dur = 40) => {
  const t = f - from;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const d = 1 - t / dur;
  return { x: Math.sin(t * 0.9) * amp * d, y: Math.cos(t * 1.2) * amp * 0.6 * d };
};
// 카메라: 배율·초점(화면 좌표)·흔들림 - 가장자리에 빈틈이 생기지 않게 잘라 맞춤
const Cam = ({ z = 1, cx = 960, cy = 540, sx = 0, sy = 0, children }: { z?: number; cx?: number; cy?: number; sx?: number; sy?: number; children: React.ReactNode }) => {
  const tx = Math.max(Math.min(960 - cx * z, 0), 1920 - 1920 * z) + sx;
  const ty = Math.max(Math.min(540 - cy * z, 0), 1080 - 1080 * z) + sy;
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "0 0" }}>{children}</AbsoluteFill>;
};

const InkDefs = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="hook-ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={5} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={7} />
    </filter>
  </svg>
);

// 붓으로 찍는 큰 숫자: 쾅 하고 커졌다 자리 잡음
const BigNum = ({ text, at = 0, size = 300, x = 0, y = 0, color = INK }: { text: string; at?: number; size?: number; x?: number; y?: number; color?: string }) => {
  const f = useCurrentFrame() - at;
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const k = spring({ frame: f, fps, config: { damping: 13, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${x}px, ${y}px)` }}>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, color, filter: "url(#hook-ink)", fontVariantNumeric: "lining-nums",
        transform: `scale(${2.2 - 1.2 * k})`, opacity: Math.min(1, f / 3), textShadow: "0 6px 0 rgba(43,29,20,0.18)" }}>{text}</span>
    </AbsoluteFill>
  );
};

const Char = ({ id, x, h = 560, bottom = 200, shadow = 0.35, ...p }: { id: string; x: number; h?: number; bottom?: number; shadow?: number; pose?: string; flip?: boolean; enter?: "up" | "pop" | "none"; beat?: "jump" | "shake" | "hop" | "sink" | "nod" | "none"; beatAt?: number; delay?: number }) => {
  const w = (h * 600) / 720;
  return (
    <div style={{ position: "absolute", left: x - w / 2, bottom, width: w, height: h, filter: `drop-shadow(0 14px 20px rgba(0,0,0,${shadow}))` }}>
      <Character id={id} height={h} {...p} />
    </div>
  );
};

// 먼지 구름: t 0→1 퍼지며 옅어짐
const Dust = ({ x, y, t, r = 80, color = "#c9b48a", op = 0.9 }: { x: number; y: number; t: number; r?: number; color?: string; op?: number }) =>
  t <= 0 || t >= 1 ? null : (
    <>
      {[-1.2, -0.4, 0.5, 1.3].map((dx, i) => {
        const rr = r * (0.7 + i * 0.1) * (0.6 + t * 0.9);
        return <div key={i} style={{ position: "absolute", left: x + dx * r * (0.6 + t) - rr, top: y - rr - r * 0.3 * t * (i % 2 ? 1.4 : 1), width: rr * 2, height: rr * 2, borderRadius: "50%", background: `radial-gradient(${color}, transparent 70%)`, opacity: (1 - t) * op }} />;
      })}
    </>
  );
// 기병 그림(400×310)의 발 위치로 세우기: (x 가운데, feet 발 y, w 너비)
const RiderAt = ({ kind, x, feet, w, flip = false, phase = 0, dark = false }: { kind: string; x: number; feet: number; w: number; flip?: boolean; phase?: number; dark?: boolean }) => (
  <Rider kind={kind} x={x - w / 2} y={feet - w * 0.76} w={w} flip={flip} phase={phase} dark={dark} />
);

// ================= 1) 지구 육지의 6분의 1 =================
// 해 질 녘 몽골 초원(멀리 능선 위 기병 행렬·게르·툭) → 초원이 둥근 창으로 오므라들며 그 점이 세계 지도 위 몽골 고원이 됨 (카메라가 빠짐)
// → 그 첫 점에서 1260 무렵 영역이 붉은 도장처럼 쾅(먹물 튐·흙먼지, 번지지 않음) → 아래 땅에선 흰 말의 칸이 이끄는 쐐기 대열이 비스듬히 다가옴
const FOCUS = [1075, 462]; // 지도 위 몽골 고원 (오논강 근처)
const IRIS = [14, 40];
const STAMP = 48;
// 쐐기 대열: back = 맨 앞(칸)에서 뒤로 떨어진 거리, d = 깊이(0 멀리 ~ 1 가까이)
const WEDGE = (() => {
  const a: { back: number; d: number; kind: string }[] = [{ back: 0, d: 0.62, kind: "mongol_white" }];
  for (let r = 1; r <= 5; r++) {
    for (const side of [-1, 1]) {
      a.push({ back: r * 150 + (side > 0 ? 40 : 0), d: Math.min(1, Math.max(0, 0.62 + side * r * 0.085)), kind: (r + side) % 2 ? "mongol" : "mongol2" });
    }
    a.push({ back: r * 150 + 80, d: 0.62, kind: r % 2 ? "mongol2" : "mongol" });
  }
  return a.sort((p, q) => p.d - q.d);
})();
const SteppeOpening = ({ f }: { f: number }) => (
  <AbsoluteFill>
    <Steppe time="dusk" horizon={600} />
    {/* 먼 능선 위 검은 기병 행렬 */}
    {Array.from({ length: 12 }).map((_, i) => (
      <RiderAt key={i} kind="mongol" x={-200 + i * 95 + f * 5} feet={560 + Math.sin(i * 1.3) * 4} w={90} phase={i * 3} dark />
    ))}
    <Ger x={300} y={700} w={260} door="#8a3b2c" lit={0.6} />
    <Ger x={560} y={660} w={180} door="#4d6b8a" lit={0.6} />
    <Tug x={780} y={720} h={340} sway={Math.sin(f / 12) * 6} />
    <Fire x={470} y={800} s={0.8} />
    {/* 앞 풀 */}
    <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
      {Array.from({ length: 46 }).map((_, i) => {
        const x = (i * 43) % 1920;
        const y = 900 + ((i * 71) % 160);
        const sw = Math.sin(f / 10 + i) * 4;
        return <path key={i} d={`M ${x} ${y} q ${-6 + sw} -30 ${-14 + sw * 2} -46 M ${x} ${y} q ${2 + sw} -36 ${4 + sw * 2} -56 M ${x} ${y} q ${8 + sw} -26 ${18 + sw * 2} -38`} stroke="#5d4a2c" strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  </AbsoluteFill>
);
const S1 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = f < IRIS[0] ? 6 : lerp(f, IRIS[0], STAMP - 4, 6, 1.0, ease);
  const k = spring({ frame: f - STAMP, fps, config: { damping: 12, stiffness: 200 } });
  const sh = shake(f, STAMP, 10, 34);
  const mask = (src: string): React.CSSProperties => ({ WebkitMaskImage: `url(${staticFile(src)})`, maskImage: `url(${staticFile(src)})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" });
  // 초원 창: 몽골 고원 점으로 오므라듦
  const irisR = lerp(f, IRIS[0], IRIS[1], 1500, 0, easeIn);
  const steppeScale = lerp(f, 0, IRIS[0], 1.1, 1.0);
  // 대열: 왼쪽 뒤에서 오른쪽 앞으로 비스듬히
  const lead = lerp(f, 0, 150, -260, 1180);
  const near = lerp(f, 0, 150, -40, 30);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #efe2c4, #d8c49a)" }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${FOCUS[0]}px ${FOCUS[1]}px` }}>
          {/* 바다: 물결 결 + 위·경선 */}
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            {[150, 300, 450, 600, 750, 900].map((y) => <path key={y} d={`M 0 ${y} L 1920 ${y}`} stroke="#b8a47c" strokeWidth={1.5} strokeDasharray="10 8" opacity={0.6} />)}
            {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${i * 170 + 40} 0 L ${i * 170 + 40} 1080`} stroke="#b8a47c" strokeWidth={1.5} strokeDasharray="10 8" opacity={0.6} />)}
          </svg>
          <Img src={staticFile("series/mongol/land.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          <MapTerrain />
          {f >= STAMP && (
            <AbsoluteFill style={{ transform: `scale(${1.2 - 0.2 * k})`, transformOrigin: `${FOCUS[0]}px ${FOCUS[1]}px`, opacity: Math.min(1, (f - STAMP + 1) / 3) }}>
              <AbsoluteFill style={{ filter: "drop-shadow(0 0 1.5px #5a1712) drop-shadow(0 4px 0 rgba(60,20,10,0.3))" }}>
                <AbsoluteFill style={{ ...mask("series/mongol/empire-1260.png") }}>
                  <AbsoluteFill style={{ background: MONGOL_RED, opacity: 0.86 }} />
                  {/* 도장 인주 결: 덜 묻은 자리 */}
                  <svg width={1920} height={1080} style={{ position: "absolute", mixBlendMode: "screen", opacity: 0.3 }}>
                    <filter id="hook-stampgrain"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={3} seed={11} /><feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 0 0.5  2.4 0 0 0 -1.25" /></filter>
                    <rect width={1920} height={1080} filter="url(#hook-stampgrain)" />
                  </svg>
                </AbsoluteFill>
              </AbsoluteFill>
            </AbsoluteFill>
          )}
          {f >= STAMP && <InkSplat cx={890} cy={520} t={lerp(f, STAMP, STAMP + 6, 0, 1, ease)} color="#8f2a22" />}
          {/* 찍힌 둘레에 흙먼지 */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2 + 0.3;
            return <Dust key={i} x={FOCUS[0] + Math.cos(a) * 300} y={FOCUS[1] + Math.sin(a) * 170 + 40} t={(f - STAMP - 1) / 28} r={42} color="#cbb68c" op={0.75} />;
          })}
        </AbsoluteFill>
        <Grain op={0.35} />
        {/* 초원 창 */}
        {f < IRIS[1] && (
          <AbsoluteFill style={{ clipPath: `circle(${irisR}px at ${FOCUS[0]}px ${FOCUS[1]}px)` }}>
            <AbsoluteFill style={{ transform: `scale(${steppeScale})`, transformOrigin: `${FOCUS[0]}px ${FOCUS[1]}px` }}>
              <SteppeOpening f={f} />
            </AbsoluteFill>
          </AbsoluteFill>
        )}
        {f >= IRIS[0] && f < IRIS[1] && (
          <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#hook-ink)" }}>
            <circle cx={FOCUS[0]} cy={FOCUS[1]} r={irisR} fill="none" stroke={INK} strokeWidth={7} />
          </svg>
        )}
      </AbsoluteFill>
      {f >= STAMP + 8 && <BigNum text="1260" at={STAMP + 8} size={96} x={-610} y={-400} color={INK} />}
      {/* 아래 땅: 흰 말의 칸이 이끄는 쐐기 대열 (원근: 먼 쪽 작고 높게) */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(rgba(176,150,100,0), rgba(176,150,100,0.85) 45%, #a88c5c)" }} />
      {WEDGE.map((r, i) => {
        const w = 95 + r.d * 165 + (r.kind === "mongol_white" ? 40 : 0);
        const x = lead - r.back * (0.7 + r.d * 0.5);
        const feet = 900 + r.d * 150 + near * r.d;
        return (
          <React.Fragment key={i}>
            <Dust x={x - w * 0.55} y={feet - 10} t={((f + i * 7) % 24) / 24} r={w * 0.22} color="#c9b48a" op={0.6} />
            <RiderAt kind={r.kind} x={x} feet={feet} w={w} phase={(i * 5) % 16} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ================= 2) 로마도, 페르시아도 아니었다 =================
// 왼쪽 콜로세움 앞 독수리 깃발의 로마 군단병, 오른쪽 페르세폴리스 기둥 앞 깃발의 페르시아 병사가 뽐냄
// → "아니었습니다"에서 지평선 끝의 흰 말이 흙먼지를 일으키며 비스듬히 달려 들어옴(멀리 작게 → 앞 크게) → 둘이 펄쩍 놀라 밀려남
const S2 = () => {
  const f = useCurrentFrame();
  const turn = sec(1.45); // "아니었습니다" 끝
  const shocked = f >= turn;
  const t0 = turn - 16;
  const arrive = turn + 26;
  const pushOut = lerp(f, turn, turn + 14, 0, 1, ease);
  const p = lerp(f, t0, arrive, 0, 1, (x) => x * x * (3 - 2 * x));
  const at = (q: number) => ({ w: 70 + q * 560, feet: 640 + q * 290, x: 760 + q * 200 });
  const r = at(p);
  const rx = r.x + Math.max(0, f - arrive) * 0.8;
  const sh = shake(f, arrive - 4, 8, 40);
  const wob = (k: number) => Math.sin(Math.max(0, f - turn) / 6 + k) * 6 * Math.exp(-Math.max(0, f - turn) / 40) * (shocked ? 1 : 0);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, 170, 1.06, 1.0)} cx={960} cy={560} sx={sh.x} sy={sh.y}>
        <Steppe time="day" horizon={640} hills={false} />
        <Colosseum />
        <Persepolis />
        {/* 가운데 길: 지평선 끝에서 앞으로 */}
        <svg width={1920} height={1080} style={{ position: "absolute", filter: "url(#kit-ink)" }}>
          <path d="M 900 640 L 980 640 L 1260 1080 L 560 1080 Z" fill="#d7c294" opacity={0.7} />
        </svg>
        <AbsoluteFill style={{ background: "linear-gradient(rgba(239,228,200,0) 40%, rgba(239,228,200,0.25) 58%, rgba(0,0,0,0) 62%)" }} />
        {/* 땅에 꽂은 깃발 */}
        <Aquila x={150} y={880} rot={wob(0)} />
        <Derafsh x={1770} y={880} rot={wob(1)} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-pushOut * 110}px)` }}>
          <Char id="roman_legionary" x={470} pose={shocked ? "shocked" : "smug"} beat={shocked ? "jump" : "none"} beatAt={turn} bottom={200} enter="none" />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${pushOut * 110}px)` }}>
          <Char id="persian_immortal" x={1450} pose={shocked ? "shocked" : "smug"} flip beat={shocked ? "jump" : "none"} beatAt={turn + 3} bottom={200} enter="none" />
        </div>
        {/* 흙먼지 꼬리: 지나온 자리마다 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const s0 = t0 + i * 4;
          const q = at(lerp(s0, t0, arrive, 0, 1, (x) => x * x * (3 - 2 * x)));
          return f >= s0 ? <Dust key={i} x={q.x - q.w * 0.4} y={q.feet - 6} t={(f - s0) / 34} r={q.w * 0.28} color="#d2bd90" /> : null;
        })}
        {f >= arrive - 2 && <Dust x={rx} y={r.feet} t={(f - arrive + 2) / 40} r={200} color="#d8c49a" />}
        {f >= t0 && <RiderAt kind="mongol_white" x={rx} feet={r.feet} w={r.w} phase={0} />}
      </Cam>
    </AbsoluteFill>
  );
};

// ================= 3) 100만 명이 수천만 명의 제국들을 무너뜨림 =================
// 유럽·서아시아 해안선 지도(지형·종이 결) 위 실제 도시 자리에 나라마다 성·도시 그림과 서로 다른 깃발, 그 앞 사람들.
// 동쪽에서 흰 말의 장수가 맨 앞에 선 기병 떼가 휩쓸면 사람들이 펄쩍 놀라 쓰러지고, 깃발이 쓰러진 자리에 흰 툭이 꽂히며 그 땅빛이 몽골 색으로 살짝 바뀜
// 실제처럼 폴란드·헝가리(북쪽 줄)·아나톨리아·시리아(남쪽 줄)에서 멈춤
// 실제 도시 경위도를 scripts/europe-map.py 투영(x=(경도+14)×24.6, y=(60.5-위도)×34.8)으로 옮긴 자리
type Nation = { town: [number, number, string]; flag: [number, number, string]; people: [string, number, number][]; tint: string };
const NATIONS: Nation[] = [
  { town: [1712, 812, "persia"], flag: [1880, 850, "khwarazm"], people: [["muhammad", 1630, 870], ["jalal", 1790, 862]], tint: "1470px 560px, 1940px 520px, 1940px 1100px, 1470px 1100px" }, // 호라즘 (레이·니샤푸르)
  { town: [1400, 630, "georgia"], flag: [1500, 668, "georgia"], people: [["rusudan", 1452, 672]], tint: "1360px 560px, 1560px 560px, 1580px 740px, 1350px 740px" }, // 조지아
  { town: [1352, 452, "cuman"], flag: [1190, 482, "cuman"], people: [["koten", 1240, 486], ["koten", 1295, 490]], tint: "1120px 390px, 1560px 380px, 1580px 560px, 1340px 600px, 1110px 560px" }, // 쿠만 초원
  { town: [1160, 330, "rus"], flag: [1030, 360, "rus"], people: [["mstislav_kiev", 1075, 364], ["mstislav_bold", 1124, 370]], tint: "960px 250px, 1250px 240px, 1270px 400px, 1120px 420px, 960px 400px" }, // 키예프
  { town: [1430, 160, "rus2"], flag: [1270, 190, "rus2"], people: [["mstislav_bold", 1322, 192], ["mstislav_kiev", 1372, 198]], tint: "1100px -20px, 1700px -20px, 1700px 300px, 1250px 290px, 1080px 240px" }, // 블라디미르·랴잔
  { town: [790, 318, "castle"], flag: [880, 352, "poland"], people: [["mstislav_bold", 834, 370], ["mstislav_kiev", 745, 336]], tint: "690px 240px, 960px 240px, 980px 400px, 690px 400px" }, // 폴란드 (크라쿠프·레그니차)
  { town: [842, 428, "castle2"], flag: [918, 478, "hungary"], people: [["mstislav_bold", 812, 474], ["mstislav_kiev", 868, 480]], tint: "720px 405px, 990px 405px, 990px 540px, 720px 540px" }, // 헝가리 (부다·모히)
];
const GO = 15;
const SPEED = 10.5;
const FRONT0 = 2050;
const hitAt = (x: number) => GO + (FRONT0 - (x + 40)) / SPEED;
// 기병 줄: 위(top, 말 그림 꼭대기 y), 멈추는 x - 북쪽 줄은 폴란드·헝가리, 남쪽 줄은 아나톨리아·시리아
const ROWS = [
  { y: 100, stop: 700 },
  { y: 340, stop: 700 },
  { y: 560, stop: 1130 },
  { y: 770, stop: 1290 },
];
// 휩쓴 땅 모양: 줄마다 경계 x (위→아래), 줄 사이는 부드럽게 이음
const sweptPath = (xs: number[]) => {
  const ys = [-40, ...ROWS.map((r) => r.y + 60), 1120];
  const px = [xs[0], ...xs, xs[xs.length - 1]];
  let d = `M 2000 -40 L ${px[0]} ${ys[0]}`;
  for (let i = 1; i < ys.length; i++) {
    const my = (ys[i - 1] + ys[i]) / 2;
    d += ` C ${px[i - 1]} ${my} ${px[i]} ${my} ${px[i]} ${ys[i]}`;
  }
  return d + " L 2000 1120 Z";
};
const S3 = () => {
  const f = useCurrentFrame();
  const front = Math.max(ROWS[0].stop, FRONT0 - Math.max(0, f - GO) * SPEED);
  const z = lerp(f, 0, 168, 1.16, 1.06);
  return (
    <AbsoluteFill style={{ background: "#c3cbbd" }}>
      <Cam z={z} cx={front + 360} cy={500}>
        <Img src={staticFile("hook/m01/europe.svg")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, filter: "url(#hook-ink)" }} />
        {/* 휩쓴 땅: 기병 떼가 지나간 뒤쪽(동쪽) 땅빛이 몽골 색으로 살짝 - 경계는 줄마다 기병 바로 뒤를 따라감(번지지 않음), 바다는 그대로 */}
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs><clipPath id="hook-euland"><path d={EUROPE_LAND} /></clipPath></defs>
          <g clipPath="url(#hook-euland)">
            <path filter="url(#hook-ink)" d={sweptPath(ROWS.map((r, i) => {
              const stopF = GO + (FRONT0 - r.stop) / SPEED;
              return Math.max(r.stop, front) + lerp(f, stopF, stopF + 24, 230, 30, ease) + [0, 50, -30, 40][i];
            }))} fill={MONGOL_RED} opacity={0.26} stroke={INK} strokeWidth={0} />
          </g>
        </svg>
        <MapTerrain europe />
        {/* 나라마다 성·도시 + 깃발 → 쓰러지고 흰 툭 */}
        {NATIONS.map((n, k) => {
          const first = Math.min(...n.people.map((q) => hitAt(q[1])));
          const fall = lerp(f, first + 4, first + 14, 0, 1, ease);
          const up = lerp(f, first + 16, first + 26, 0, 1, ease);
          return (
            <React.Fragment key={k}>
              <HookTown x={n.town[0]} y={n.town[1]} kind={n.town[2]} />
              <NationFlag x={n.flag[0]} y={n.flag[1]} kind={n.flag[2]} fall={fall} />
              {up > 0 && (
                <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - up) * 40}px)`, opacity: up }}>
                  <Tug x={n.flag[0] + 6} y={n.flag[1]} h={104} sway={Math.sin(f / 10 + k) * 3} />
                </div>
              )}
            </React.Fragment>
          );
        })}
        {/* 사람들: 기병 떼 맨 앞이 지나가면 놀라서 펄쩍 → 쓰러짐 */}
        {NATIONS.flatMap((n) => n.people).map(([id, x, y], k) => {
          const h = 118;
          const hitF = hitAt(x);
          const hit = f >= hitF;
          const fall = interpolate(f, [hitF + 4, hitF + 12], [0, -84], clamp);
          const w = (h * 600) / 720;
          return (
            <div key={k} style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `rotate(${fall}deg)`, transformOrigin: "30% 100%", opacity: 1 - Math.max(0, -fall - 60) / 50, filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.3))" }}>
              <Character id={id} height={h} pose={hit ? "shocked" : "front"} enter="pop" delay={k * 2} beat={hit ? "jump" : "none"} beatAt={hitF} />
            </div>
          );
        })}
        {/* 기병 떼 (왼쪽을 봄): 줄마다 흙먼지 꼬리, 가운데 줄 맨 앞에 흰 말의 장수 */}
        {ROWS.map((row, r) => {
          const fr = Math.max(row.stop, front);
          const moving = fr > row.stop + 1;
          return (
            <React.Fragment key={r}>
              {moving && Array.from({ length: 5 }).map((_, i) => <Dust key={`d${i}`} x={fr + 160 + i * 170} y={row.y + 118} t={((f + i * 9 + r * 5) % 30) / 30} r={46} color="#cdb98f" op={0.7} />)}
              {Array.from({ length: 7 }).map((_, i) => {
                const jx = ((i * 37 + r * 53) % 60) - 30;
                const y = row.y + (((i * 29 + r * 17) % 50) - 25) + (i % 2) * 18;
                return <Rider key={`${r}-${i}`} kind={(i + r) % 2 ? "mongol2" : "mongol"} x={fr + 70 + i * 120 + jx} y={y} w={146} flip phase={(i * 5 + r * 3) % 16} />;
              })}
              {r === 1 && <Rider kind="mongol_white" x={fr - 70} y={row.y - 18} w={186} flip phase={2} />}
            </React.Fragment>
          );
        })}
      </Cam>
      <Grain op={0.3} />
      <div style={{ opacity: interpolate(f, [0, 8, 40, 52], [0, 1, 1, 0], clamp) }}>
        <BigNum text="1,000,000" at={2} size={120} y={390} />
      </div>
    </AbsoluteFill>
  );
};

// ================= 4) 어떻게 가능했을까 =================
// 어두운 큰 천막 안: 화로 두 개에 불이 붙으며 붉은 빛이 칭기즈칸을 아래에서 비춤, 뒤로 수놓은 휘장과 창 든 호위병 실루엣
// 카메라가 천천히 얼굴로 다가가고, "숫자 하나"에서 씩 웃음(그 순간 불빛이 살짝 커짐)
const S4 = () => {
  const f = useCurrentFrame();
  const smirk = sec(3.4);
  const lit = lerp(f, 4, 40, 0, 1, ease);
  const flare = lerp(f, smirk - 4, smirk + 10, 0, 1, ease) * lerp(f, smirk + 10, smirk + 50, 1, 0.5);
  return (
    <AbsoluteFill style={{ background: "#0d0907" }}>
      <Cam z={lerp(f, 0, 200, 1.0, 1.22, (x) => x)} cx={960} cy={400}>
        <GerHall lit={lit} />
        {/* 호위병 실루엣 (창은 손에) */}
        {[[560, false], [1360, true]].map(([x, flip], i) => (
          <div key={i} style={{ position: "absolute", inset: 0, filter: `brightness(${0.08 + lit * 0.12}) saturate(0.4)` }}>
            <svg width={40} height={720} viewBox="0 0 40 720" style={{ position: "absolute", left: (x as number) + (flip ? -110 : 110) - 20, top: 1080 - 150 - 720 + 40, filter: "url(#kit-ink)" }}>
              <path d="M 20 720 L 20 40" stroke={INK} strokeWidth={10} />
              <path d="M 20 2 L 8 44 L 32 44 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
            </svg>
            <Char id="archer" x={x as number} h={520} pose="front" flip={flip as boolean} bottom={150} enter="none" beat="none" shadow={0} />
          </div>
        ))}
        <Glow x={960} y={560} r={520} color="#f0a050" op={0.18 + lit * 0.32 + flare * 0.12} />
        <Char id="genghis" x={960} h={720} pose={f >= smirk ? "smug" : "front"} enter="none" beat={f >= smirk ? "nod" : "none"} beatAt={smirk} bottom={70} />
        {/* 아래에서 올라오는 불빛 (얼굴 아래쪽만 데움) */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 40% 50% at 50% 100%, rgba(255,150,60,0.35), transparent 70%)", mixBlendMode: "screen", opacity: lit * (0.8 + flare * 0.3) }} />
        <Brazier x={600} y={1010} k={lit} s={1.1} />
        <Brazier x={1320} y={1010} k={lit} s={1.1} />
      </Cam>
      {/* 둘레 어둠 */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 46% 62% at 50% 52%, rgba(10,6,4,0) 35%, rgba(10,6,4,${0.95 - lit * 0.25}))` }} />
      <AbsoluteFill style={{ background: "#0a0604", opacity: 1 - lerp(f, 0, 14, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ================= 5) 바로 숫자 10 =================
// 저녁빛 진영(게르·툭·연기) 앞, 하늘에 "10"이 쾅 → 병사 10명이 하나씩 발을 굴러 한 줄로 섬(발밑 먼지) → 가운데로 칭기즈칸이 크게, 뒤로 노을
// 카메라는 "10"에 가까이 있다가 천천히 빠지며 진영 전체를 보여 줌 → 암전
const Camp = ({ horizon, n = 9 }: { horizon: number; n?: number }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x = 90 + (i + 0.5) * (1740 / n) + ((i * 53) % 50) - 25;
        const w = 130 + ((i * 37) % 60);
        return Math.abs(x - 960) < 120 ? null : <Ger key={i} x={x} y={horizon + 30 + (i % 3) * 14} w={w} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={0.5} />;
      })}
      {[300, 700, 1220, 1620].map((x, i) => <Tug key={`t${i}`} x={x} y={horizon + 50} h={230} sway={Math.sin((f + i * 13) / 14) * 5} />)}
      {[0, 1].map((i) => {
        const t = ((f + i * 40) % 80) / 80;
        return <div key={`s${i}`} style={{ position: "absolute", left: 500 + i * 820 - t * 30, top: horizon - 80 - t * 160, width: 80 + t * 80, height: 80 + t * 80, borderRadius: "50%", background: "radial-gradient(rgba(90,70,60,0.35), transparent 70%)", opacity: 1 - t }} />;
      })}
    </>
  );
};
const SOLDIER_X = [170, 300, 430, 560, 690, 1230, 1360, 1490, 1620, 1750];
const S5 = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [len("n5") - 4, len("n5") + TAIL - 8], [0, 1], clamp);
  const khan = sec(3.2);
  const step = (i: number) => 30 + i * 6;
  // 가운데에서 바깥으로 차례로 (칸 양옆이 먼저)
  const seq = (i: number) => [4, 5, 3, 6, 2, 7, 1, 8, 0, 9].indexOf(i);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, khan + 30, 1.22, 1.0, ease)} cx={960} cy={380}>
        <Steppe time="dusk" horizon={600} />
        <Camp horizon={600} />
        <Glow x={960} y={560} r={620} color="#f6c27a" op={lerp(f, khan - 10, khan + 20, 0.15, 0.45)} />
        <BigNum text="10" at={2} size={360} y={-250} color="#2b1d14" />
        {SOLDIER_X.map((x, i) => {
          const a = step(seq(i));
          return (
            <React.Fragment key={i}>
              {f >= a + 6 && <Dust x={x} y={1080 - 130} t={(f - a - 6) / 22} r={46} color="#b89a6a" />}
              {f >= a && <Char id="archer" x={x} h={300} pose="front" enter="up" delay={a} beat="none" bottom={130} flip={x > 960} />}
            </React.Fragment>
          );
        })}
        {f >= khan && <Char id="genghis" x={960} h={560} pose="smug" enter="up" delay={khan} beat="none" bottom={90} />}
      </Cam>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,20,10,0.45))" }} />
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

export const Mongol01Hook = ({ short = false, after }: { short?: boolean; after?: string }) => {
  const lang = useLang();
  const frame = useCurrentFrame();
  const END = short ? shortEnd(after) : MONGOL01_HOOK_FRAMES;
  const AFTER_AT = START[3] + SHORT_Q + AFTER_GAP;
  const keys = short ? KEYS.slice(0, 4) : KEYS;
  const ends = KEYS.map((k, i) => (short ? (i < 3 ? START[i + 1] : END) : i < 4 ? START[i + 1] : MONGOL01_HOOK_FRAMES));
  const voiced = (k: (typeof KEYS)[number]) => (short && k === "n4" ? shortQ(lang) / FPS : hookSec(k, lang) / hookRate(k, lang));
  const scene = (i: number) => ({ from: START[i] - (i === 0 ? LEAD : 0), durationInFrames: ends[i] - START[i] + (i === 0 ? LEAD : 0) });
  // 브금은 목소리 앞뒤 8프레임에 걸쳐 부드럽게 줄였다 올림 (한 번에 바꾸면 말끝이 잡음처럼 들림)
  const duck = (fr: number) => 0.3 - 0.18 * Math.max(0, ...keys.map((k, i) => {
    const a = START[i], b = START[i] + Math.ceil(voiced(k) * FPS);
    return Math.min(interpolate(fr, [a - 8, a], [0, 1], clamp), interpolate(fr, [b, b + 8], [1, 0], clamp));
  }), short && after ? Math.min(interpolate(fr, [AFTER_AT - 8, AFTER_AT], [0, 1], clamp), interpolate(fr, [AFTER_AT + Math.ceil(secOf(after, lang) * FPS), AFTER_AT + Math.ceil(secOf(after, lang) * FPS) + 8], [1, 0], clamp)) : 0);
  const s5step = (i: number) => START[4] + 30 + i * 6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <InkDefs />
      <KitInkDefs />
      <Sequence {...scene(0)}><S1 /></Sequence>
      <Sequence {...scene(1)}><S2 /></Sequence>
      <Sequence {...scene(2)}><S3 /></Sequence>
      <Sequence {...scene(3)}><S4 /></Sequence>
      {!short && <Sequence {...scene(4)}><S5 /></Sequence>}
      {short && <AbsoluteFill style={{ background: "#000", opacity: interpolate(frame, [END - 16, END], [0, 1], clamp) }} />}
      {keys.map((k, i) => (
        <Sequence key={k} from={START[i]} durationInFrames={short && k === "n4" ? shortQ(lang) + 2 : undefined}><Snd voice src={lang === "ko" ? staticFile(`hook/m01/${k}.wav`) : voiceSrc(`hook_${k}`, lang)} playbackRate={hookRate(k, lang)} /></Sequence>
      ))}
      {/* 브금: 도입 곡(8초) 한 번 → 6.5초부터 본 테마(main)가 겹쳐 올라와 끝까지 (2026-10-26: 8초 뒤 브금이 사라져 말 사이가 무음이던 것 - check-bgm-cut.py) */}
      <Bgm music="hook" frames={Math.min(sec(7.87), MONGOL01_HOOK_FRAMES)} loop={false} fadeIn={1} fadeOut={24} vol={duck} />
      {short && after && <Sequence from={AFTER_AT}><Snd voice src={voiceSrc(after, lang)} /></Sequence>}
      {short ? (
        <Sequence from={sec(6.5)} durationInFrames={END + SHORT_TAIL - sec(6.5)}><Bgm music="main" frames={END + SHORT_TAIL - sec(6.5)} fadeIn={36} fadeOut={SHORT_TAIL + 10} vol={(fr) => duck(fr + sec(6.5))} /></Sequence>
      ) : (
        <Sequence from={sec(6.5)} durationInFrames={MONGOL01_HOOK_FRAMES - sec(6.5)}><Bgm music="main" frames={MONGOL01_HOOK_FRAMES - sec(6.5)} fadeIn={36} vol={(fr) => duck(fr + sec(6.5))} /></Sequence>
      )}
      {/* 효과음: 바람(초원), 말발굽(1·2·3), 도장(1), 화로 불(4), 발 구름(5), 숫자 10 */}
      <Sequence from={0} durationInFrames={IRIS[1]}><Snd src={staticFile("sfx/ep/wind.wav")} volume={0.25} /></Sequence>
      <Sequence from={0} durationInFrames={START[1]}><Snd src={staticFile("sfx/ep/gallop.wav")} volume={0.3} /></Sequence>
      <Sequence from={STAMP}><Snd src={staticFile("sfx/ep/boom.wav")} volume={0.5} /></Sequence>
      <Sequence from={START[1] + sec(1.45) - 14} durationInFrames={50}><Snd src={staticFile("sfx/ep/neigh.wav")} volume={0.35} /></Sequence>
      <Sequence from={START[2] + GO} durationInFrames={150}><Snd src={staticFile("sfx/ep/cavalry.wav")} volume={0.4} /></Sequence>
      <Sequence from={START[3] + 4} durationInFrames={short ? END - START[3] - 4 : len("n4")}><Snd src={staticFile("sfx/ep/campfire.wav")} volume={(fr) => (short ? 0.3 * interpolate(fr, [END - START[3] - 24, END - START[3] - 4], [1, 0], clamp) : 0.3)} /></Sequence>
      {!short && <Sequence from={START[4] + 2}><Snd src={staticFile("sfx/ep/boom.wav")} volume={0.55} /></Sequence>}
      {!short && Array.from({ length: 10 }).map((_, i) => (
        <Sequence key={`st${i}`} from={s5step(i) + 6} durationInFrames={12}><Snd src={staticFile("sfx/ep/drum.wav")} volume={0.18} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
