// 검수용 초안(장별 화면)의 공용 도구 (2026-10-26): 합격한 1편 도입부(src/hook/Mongol01Hook.tsx)와 같은 그림체
// 대사 타이밍: public/ep/<편>/draft/voice.json(길이) + episodes/<편>/draft/lines.json(장·순서) - scripts/draft-lines.py가 만듦
// 장 하나 = <Chapter ch="1" groups={...} />: 대사 줄마다 목소리를 깔고, groups가 여러 줄을 한 화면(Shot)으로 묶는다
// Shot은 at(id) 로 그 줄이 시작하는 프레임(묶음 기준)을 받아 움직임을 맞춘다
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "../../public/ep/mongol-01/draft/voice.json";
import voiceEn from "../../public/ep/mongol-01/draft/voice-en.json";
import voiceEs from "../../public/ep/mongol-01/draft/voice-es.json";
import voicePt from "../../public/ep/mongol-01/draft/voice-pt.json";
import voiceHi from "../../public/ep/mongol-01/draft/voice-hi.json";
import voiceId from "../../public/ep/mongol-01/draft/voice-id.json";
import lines from "../../episodes/mongol-01/draft/lines.json";
// 2편 초안 (2026-11-02): 줄 id·장 번호 앞에 "m2." - 1편(c0_01 …)과 겹치지 않게. 장 파일은 Chapter ch="m2.0", at("m2.c0_01")
import lines2 from "../../episodes/mongol-02/draft/lines.json";
import voice2 from "../../public/ep/mongol-02/draft/voice.json";
import voice2En from "../../public/ep/mongol-02/draft/voice-en.json"; // 2편 영어 (2026-11-03)
import voice2Es from "../../public/ep/mongol-02/draft/voice-es.json"; // 2편 더빙 (2026-11-03, 영상이 나간 뒤라 slot 식에 안 넣음)
import voice2Pt from "../../public/ep/mongol-02/draft/voice-pt.json";
import voice2Hi from "../../public/ep/mongol-02/draft/voice-hi.json";
import voice2Id from "../../public/ep/mongol-02/draft/voice-id.json";
// 1편 수정판 (2026-11-05 사용자 대본): 줄 id·장 번호 앞에 "m1r." - 옛 1편·2편과 겹치지 않게. 영어·한국어만
import lines1r from "../../episodes/mongol-01r/draft/lines.json";
import voice1r from "../../public/ep/mongol-01r/draft/voice.json";
import voice1rEn from "../../public/ep/mongol-01r/draft/voice-en.json";
import voice1rEs from "../../public/ep/mongol-01r/draft/voice-es.json";
import voice1rPt from "../../public/ep/mongol-01r/draft/voice-pt.json";
import voice1rHi from "../../public/ep/mongol-01r/draft/voice-hi.json";
import voice1rId from "../../public/ep/mongol-01r/draft/voice-id.json";
import bgmSec from "../../public/bgm/durations.json";
import bgmTempo from "../../public/bgm/tempo.json";
import { Character } from "../episode/Character";

export const FPS = 30;
export const GAP = 10; // 줄 사이 쉼
export const CARD = 66; // 장 카드 길이 (2026-10-27 40→66: "1206 뜨자마자 넘어가 버려" - 연도가 1.5초 넘게 보이고 첫 장면과 겹쳐 서서히 바뀜)
export const CARD_X = 18; // 장 카드가 첫 장면 위에서 서서히 사라지는 길이 (검은 화면을 거치지 않음)
export const INK = "#2b1d14";
export const SERIF = "Baskerville, 'Big Caslon', 'Hoefler Text', serif";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = (x: number) => 1 - Math.pow(1 - x, 3);

type Line = { id: string; ch: string; who: string; char: string | null; role: string; text: string; shot: string; hold?: number };
const EP2 = "m2.";
const EP1R = "m1r.";
const L = [...(lines as Line[]), ...(lines2 as Line[]).map((l) => ({ ...l, id: EP2 + l.id, ch: EP2 + l.ch })), ...(lines1r as Line[]).map((l) => ({ ...l, id: EP1R + l.id, ch: EP1R + l.ch }))];
const withPrefix = (v: Record<string, { sec: number }>, p = EP2) => Object.fromEntries(Object.entries(v).map(([k, x]) => [p + k, x]));
// ---------- 언어 (2026-10-26 사용자: 기본 트랙은 영어, 한국어·스페인어는 더빙) ----------
// 화면은 한 벌: 줄 길이(slot)는 영어·한국어 중 긴 쪽, 스페인어는 그 안에 최대 12% 빠르게 넣고 그래도 길면 slot을 늘림.
// 어느 언어로 렌더할지는 맨 위(M01Draft·각 장 컴포지션의 lang)에서 LangContext로 내려 준다 - 장 파일은 손대지 않음
// 2026-10-26 더빙 1차 추가: 포르투갈어(브라질) pt·힌디어 hi·인도네시아어 id - 영상이 이미 나간 뒤라 slot 식에는 넣지 않는다.
// 새 언어는 정해진 줄 길이 안에 rate(최대 1.15)로 들어가야 함 - 넘으면 번역을 줄여 다시 만든다 (scripts/draft-lines.py가 넘는 줄을 알려 줌)
export type Lang = "en" | "ko" | "es" | "pt" | "hi" | "id";
export const LANGS: Lang[] = ["en", "ko", "es", "pt", "hi", "id"];
const VOICES: Record<Lang, Record<string, { sec: number }>> = { ko: { ...voice, ...withPrefix(voice2), ...withPrefix(voice1r, EP1R) }, en: { ...voiceEn, ...withPrefix(voice2En), ...withPrefix(voice1rEn, EP1R) }, es: { ...voiceEs, ...withPrefix(voice2Es), ...withPrefix(voice1rEs, EP1R) }, pt: { ...voicePt, ...withPrefix(voice2Pt), ...withPrefix(voice1rPt, EP1R) }, hi: { ...voiceHi, ...withPrefix(voice2Hi), ...withPrefix(voice1rHi, EP1R) }, id: { ...voiceId, ...withPrefix(voice2Id), ...withPrefix(voice1rId, EP1R) } };
export const SPEEDUP = 1.12;
// ---------- 장면 안 시각은 렌더 언어의 목소리 조각에 맞춤 (2026-11-03 사용자: "왜 한국어 기준으로 해놨어? 영어로 해야지") ----------
// 장 파일은 장면 안 시각을 한국어 목소리(검수본, voice.json) 기준 초로 적는다: at(id) + tl(id, 초).
// tl은 그 초가 한국어의 몇 번째 조각(대본 / 사이) 어디쯤인지 찾아, 지금 렌더하는 언어 목소리의 같은 조각·같은 비율 자리(프레임)로 옮긴다.
// 조각 시작 시각(cues)은 scripts/draft-lines.py가 만들 때 기록. 언어끼리 조각 수가 다르면 길이 비율로 (check-draft가 오류로 잡음)
type Cued = { sec: number; cues?: number[] };
let RENDER_LANG: Lang = "en"; // Chapter가 그릴 때 정함 - 한 렌더 안에서 언어는 하나
export const tl = (id: string, s: number) => {
  const k = VOICES.ko[id] as Cued | undefined, v = VOICES[RENDER_LANG][id] as Cued | undefined;
  if (!k || !v) return Math.round(s * FPS);
  let t: number;
  if (RENDER_LANG === "ko") t = s;
  else if (s >= k.sec) t = v.sec + (s - k.sec);
  else if (!k.cues || !v.cues || k.cues.length !== v.cues.length) t = (s * v.sec) / k.sec;
  else {
    let j = k.cues.length - 1;
    while (j > 0 && k.cues[j] > s) j--;
    const ka = k.cues[j], kb = k.cues[j + 1] ?? k.sec, va = v.cues[j], vb = v.cues[j + 1] ?? v.sec;
    t = va + ((s - ka) / Math.max(0.01, kb - ka)) * (vb - va);
  }
  return Math.round((t / rateOf(id, RENDER_LANG)) * FPS);
};
// 그 줄의 k번째 조각(대본 /)이 시작하는 프레임 - 렌더 언어 목소리 기준 (1편 수정판, 2026-11-05)
export const cue = (id: string, k: number) => {
  const v = VOICES[RENDER_LANG][id] as Cued | undefined;
  const c = v?.cues;
  if (!c || !c.length) return 0;
  return Math.round((c[Math.min(k, c.length - 1)] / rateOf(id, RENDER_LANG)) * FPS);
};
export const secOf = (id: string, lang: Lang) => VOICES[lang][id]?.sec ?? 0;
// 줄 길이(slot)는 en·ko·es로만 정해진다 - 새 언어를 여기 넣으면 이미 올린 영상의 타이밍이 바뀜
// 2편(m2.)은 영어·한국어로 줄 길이를 정해 영상을 올린 뒤 스페인어를 더해서 slot에 안 넣음 (넣으면 올린 영상과 길이가 달라짐 - 2026-11-03)
export const slotSec = (id: string) => Math.max(secOf(id, "en"), secOf(id, "ko"), id.startsWith(EP2) || id.startsWith(EP1R) ? 0 : secOf(id, "es") / SPEEDUP);
export const rateOf = (id: string, lang: Lang) => {
  if (!VOICES[lang][id]) throw new Error(`${lang} 목소리 없음: ${id} (scripts/draft-lines.py --lang=${lang})`); // 조용히 소리 없는 트랙이 되지 않게
  return Math.max(1, secOf(id, lang) / slotSec(id));
};
// 목소리 파일: 한국어는 draft/<id>.wav, 다른 언어는 draft/<언어>/<id>.wav (scripts/draft-lines.py)
export const voiceSrc = (id: string, lang: Lang) => {
  const [ep, key] = id.startsWith(EP2) ? ["mongol-02", id.slice(EP2.length)] : id.startsWith(EP1R) ? ["mongol-01r", id.slice(EP1R.length)] : ["mongol-01", id];
  return staticFile(lang === "ko" ? `ep/${ep}/draft/${key}.wav` : `ep/${ep}/draft/${lang}/${key}.wav`);
};
export const LangContext = createContext<Lang>("en");
// 더빙 배경 렌더용 (2026-11-03): 효과음은 본편(영어) 화면 시각에 두고, 브금 줄임(duck)만 더빙 언어 목소리에 맞춤 - 영어 목소리가 끝난 뒤 더 긴 더빙 대사 밑에서 브금이 다시 커지던 문제
export const DuckLang = createContext<Lang | null>(null);
export const useLang = () => useContext(LangContext);
// 줄 길이 = 가장 긴 언어 목소리 + 쉼 + 멈춤(대본 ⏸초 - 극적인 순간)
export const lineFrames = (id: string) => Math.ceil(slotSec(id) * FPS) + GAP + Math.round((L.find((l) => l.id === id)?.hold ?? 0) * FPS);
export const chapterLines = (ch: string) => L.filter((l) => l.ch === ch);
// 0장 = 편 맨 앞 훅: 장 카드(연도) 없이 첫 프레임부터 장면 (2026-10-27 훅 4판)
// 앞 장과 같은 연도면 장 카드를 빼는 장 (2026-11-03 사용자: "1220년이 3번 연속 나와서 지겨움" - check-draft가 같은 연도 카드 연속을 오류로 잡음)
export const NO_CARD = new Set<string>(["m2.3", "m2.4", "m1r.1", "m1r.2"]);
export const cardOf = (ch: string) => (ch === "0" || ch.endsWith(".0") || NO_CARD.has(ch) ? 0 : CARD);
export const chapterFrames = (ch: string) => cardOf(ch) + chapterLines(ch).reduce((a, l) => a + lineFrames(l.id), 0) + 15;

// ---------- 바탕 ----------
export const InkDefs = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="kit-ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={5} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={6} />
    </filter>
  </svg>
);
export const Paper = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #efe2c4, #d3bd90)" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(30,18,8,.45))" }} />
  </AbsoluteFill>
);
// 하늘 + 초원 (time: day 낮 · dusk 노을 · night 달밤) - 저녁·밤은 은은하게 (02 참고: 조명·저녁빛)
const SKY = {
  day: ["#e9dcbc", "#efe4c8"],
  dusk: ["#c98a5e", "#ebc48f"],
  night: ["#1d2738", "#344157"],
};
// 몽골 초원은 초록 (2026-10-26 사용자: "왜 다 흙밭이지??") - 노을은 노을빛 도는 올리브, 밤은 그대로
const LAND = { day: ["#a3b76f", "#84a055"], dusk: ["#77784a", "#5b5d36"], night: ["#252a2c", "#1a1d1f"] };
export const Steppe = ({ time = "day", horizon = 640, hills = true }: { time?: keyof typeof SKY; horizon?: number; hills?: boolean }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `linear-gradient(${SKY[time][0]}, ${SKY[time][1]} ${horizon / 10.8}%)` }} />
    {time === "night" && <Stars />}
    {time === "night" && <div style={{ position: "absolute", left: 1450, top: 110, width: 130, height: 130, borderRadius: "50%", background: "#e6dfca", boxShadow: "0 0 80px 26px rgba(230,223,202,.25)" }} />}
    {time === "dusk" && <div style={{ position: "absolute", left: 1300, top: horizon - 160, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(#ffe2a8, #f0a865 60%, transparent 70%)", opacity: 0.85 }} />}
    {hills && (
      <svg width="1920" height="1080" style={{ position: "absolute", filter: "url(#kit-ink)" }}>
        <path d={`M 0 ${horizon - 40} C 300 ${horizon - 110} 520 ${horizon - 90} 760 ${horizon - 40} C 1000 ${horizon} 1300 ${horizon - 120} 1920 ${horizon - 60} L 1920 1080 L 0 1080 Z`} fill={time === "night" ? "#2b3238" : time === "dusk" ? "#8d8656" : "#b7c48a"} stroke={INK} strokeWidth={4} />
      </svg>
    )}
    <div style={{ position: "absolute", left: 0, right: 0, top: horizon, bottom: 0, background: `linear-gradient(${LAND[time][0]}, ${LAND[time][1]})`, borderTop: `5px solid ${INK}` }} />
  </AbsoluteFill>
);
export const Stars = () => (
  <svg width="1920" height="1080" style={{ position: "absolute" }}>
    {Array.from({ length: 80 }).map((_, i) => <circle key={i} cx={(i * 211) % 1920} cy={(i * 97) % 520} r={i % 5 ? 1.2 : 2} fill="#e8e2cf" opacity={0.3 + (i % 4) * 0.12} />)}
  </svg>
);
// 가장자리 어둡게 + 따뜻한 빛 웅덩이 (등불·모닥불 자리)
export const Glow = ({ x, y, r = 300, color = "#f3c77e", op = 0.55 }: { x: number; y: number; r?: number; color?: string; op?: number }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(${color}, transparent 65%)`, opacity: op, mixBlendMode: "screen", pointerEvents: "none" }} />
);
export const Dim = ({ op = 0.5 }: { op?: number }) => <AbsoluteFill style={{ background: `rgba(10,8,6,${op})` }} />;

// ---------- 소품 (코드로 그림, 먹선 + 바랜 색) ----------
// 게르(몽골 천막): 흰 펠트 벽 + 둥근 지붕 + 문(색 nubby) - w 너비
export const Ger = ({ x, y, w = 260, door = "#8a3b2c", lit = 0 }: { x: number; y: number; w?: number; door?: string; lit?: number }) => (
  <svg width={w} height={w * 0.75} viewBox="0 0 260 195" style={{ position: "absolute", left: x - w / 2, top: y - w * 0.75, filter: "url(#kit-ink)", overflow: "visible" }}>
    <path d="M 20 110 L 20 190 L 240 190 L 240 110 Z" fill="#ece3cf" stroke={INK} strokeWidth={5} />
    <path d="M 10 112 C 60 40 200 40 250 112 Z" fill="#e3d7bd" stroke={INK} strokeWidth={5} />
    <path d="M 105 52 C 120 44 140 44 155 52 L 150 60 L 110 60 Z" fill="#b8a888" stroke={INK} strokeWidth={4} />
    {[60, 100, 160, 200].map((xx) => <path key={xx} d={`M ${xx} 112 L ${xx} 190`} stroke="#c8b998" strokeWidth={3} />)}
    <path d="M 20 140 L 240 140" stroke="#8a6440" strokeWidth={5} />
    <path d="M 108 190 L 108 128 L 152 128 L 152 190 Z" fill={door} stroke={INK} strokeWidth={5} />
    {lit > 0 && <path d="M 112 190 L 112 132 L 148 132 L 148 190 Z" fill="#ffd98c" opacity={lit} />}
  </svg>
);
// 툭(말꼬리 깃대): 장대 끝 창날 + 둥근 고리 + 늘어진 말꼬리
export const Tug = ({ x, y, h = 360, color = "#f2ead8", sway = 0 }: { x: number; y: number; h?: number; color?: string; sway?: number }) => (
  <svg width={140} height={h} viewBox={`0 0 140 ${h}`} style={{ position: "absolute", left: x - 70, top: y - h, filter: "url(#kit-ink)", overflow: "visible" }}>
    <path d={`M 70 ${h} L 70 40`} stroke={INK} strokeWidth={10} />
    <path d={`M 70 ${h} L 70 40`} stroke="#7a5230" strokeWidth={5} />
    <path d="M 70 4 L 60 34 L 80 34 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
    <ellipse cx={70} cy={42} rx={18} ry={7} fill="#c9a24a" stroke={INK} strokeWidth={4} />
    <path d={`M 52 46 C ${44 + sway} 90 ${48 + sway * 1.5} 130 ${56 + sway * 2} 160 L ${84 + sway * 2} 160 C ${92 + sway * 1.5} 130 ${96 + sway} 90 88 46 Z`} fill={color} stroke={INK} strokeWidth={4} />
  </svg>
);
// 모닥불
export const Fire = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => {
  const f = useCurrentFrame();
  const k = 1 + Math.sin(f / 3) * 0.08;
  return (
    <>
      <Glow x={x} y={y - 40 * s} r={260 * s} op={0.5} />
      <svg width={140 * s} height={160 * s} viewBox="0 0 140 160" style={{ position: "absolute", left: x - 70 * s, top: y - 150 * s, filter: "url(#kit-ink)" }}>
        <path d="M 20 150 L 120 130 M 20 130 L 120 150" stroke={INK} strokeWidth={14} />
        <path d={`M 70 ${150 - 120 * k} C 30 80 40 150 70 150 C 100 150 110 80 70 ${150 - 120 * k} Z`} fill="#e8913a" stroke={INK} strokeWidth={4} />
        <path d={`M 70 ${150 - 70 * k} C 54 110 58 150 70 150 C 82 150 86 110 70 ${150 - 70 * k} Z`} fill="#ffd36b" />
      </svg>
    </>
  );
};

// ---------- 캐릭터·기병·숫자 (도입부와 같음) ----------
export const Char = ({ id, x, h = 560, bottom = 200, ...p }: { id: string; x: number; h?: number; bottom?: number; pose?: string; flip?: boolean; talking?: boolean; gesture?: string; gestureAt?: number; enter?: "up" | "pop" | "none"; exit?: "down" | "pop" | "none"; frames?: number; beat?: "jump" | "shake" | "hop" | "sink" | "nod" | "none"; beatAt?: number; delay?: number }) => {
  const w = (h * 600) / 720;
  return (
    <div style={{ position: "absolute", left: x - w / 2, bottom, width: w, height: h, filter: "drop-shadow(0 14px 20px rgba(0,0,0,0.3))" }}>
      <Character id={id} height={h} {...p} />
    </div>
  );
};
export const Rider = ({ kind = "mongol", x, y, w = 300, flip = false, phase = 0, still = false, dark = false }: { kind?: string; x: number; y: number; w?: number; flip?: boolean; phase?: number; still?: boolean; dark?: boolean }) => {
  const f = useCurrentFrame() + phase;
  const run = still ? 0 : Math.floor(f / 4) % 4;
  const bob = still ? 0 : Math.sin((f / 16) * Math.PI * 2) * w * 0.012;
  return <Img src={staticFile(`riders/${kind}/run${run}.svg`)} style={{ position: "absolute", left: x, top: y + bob, width: w, transform: flip ? "scaleX(-1)" : undefined, filter: dark ? "brightness(0)" : undefined }} />;
};
export const BigNum = ({ text, at = 0, size = 300, x = 0, y = 0, color = INK }: { text: string; at?: number; size?: number; x?: number; y?: number; color?: string }) => {
  const f = useCurrentFrame() - at;
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const k = spring({ frame: f, fps, config: { damping: 13, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${x}px, ${y}px)` }}>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, color, filter: "url(#kit-ink)", fontVariantNumeric: "lining-nums", transform: `scale(${2.2 - 1.2 * k})`, opacity: Math.min(1, f / 3), textShadow: "0 6px 0 rgba(43,29,20,0.18)" }}>{text}</span>
    </AbsoluteFill>
  );
};
// 천천히 밀어 들어가는 카메라 (Ken Burns): 자식 전체를 from → to 배율로
export const Push = ({ children, from = 1, to = 1.08, dur = 200, ox = "50%", oy = "55%" }: { children: React.ReactNode; from?: number; to?: number; dur?: number; ox?: string; oy?: string }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, dur], [from, to], clamp)})`, transformOrigin: `${ox} ${oy}` }}>{children}</AbsoluteFill>;
};
export const fadeIn = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], clamp);

// ---------- 장 틀 ----------
export type ShotProps = { at: (id: string) => number; frames: number };
export type Group = { ids: string[]; Shot: React.FC<ShotProps> };
// 장 안의 장면 사이: 앞 장면이 SHOT_XF프레임 더 이어지고 그 위로 다음 장면이 서서히 나타남 (2026-10-27 사용자: "9분 47초 갑작스러운 화면 전환")
export const SHOT_XF = 10;
export const FadeIn = ({ on, children }: { on: boolean; children: React.ReactNode }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: on ? interpolate(f, [0, SHOT_XF], [0, 1], clamp) : 1 }}>{children}</AbsoluteFill>;
};
export const ChapterCard = ({ year }: { year: string }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [CARD - 4, CARD + CARD_X - 4], [1, 0], clamp) }}>
      <Paper />
      <BigNum text={year} at={2} size={220} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [0, 10], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};
export const Chapter = ({ ch, year, groups, music }: { ch: string; year: string; groups: Group[]; music: string }) => {
  const lang = useLang();
  RENDER_LANG = lang; // tl()이 이 언어 목소리 조각에 맞춤
  const ls = chapterLines(ch);
  const start: Record<string, number> = {};
  let t = cardOf(ch);
  for (const l of ls) {
    start[l.id] = t;
    t += lineFrames(l.id);
  }
  const total = chapterFrames(ch);
  // 브금은 목소리 앞뒤 8프레임에 걸쳐 부드럽게 줄였다 올림 - 한 번에 바꾸면 말끝마다 배경 소리가 확 커져 잡음·불안정하게 들림 (2026-10-26 사용자, 02 브금 규칙)
  const dl = useContext(DuckLang) ?? lang;
  const duck = (fr: number) => Math.max(0, ...ls.map((l) => {
    const a = start[l.id], b = start[l.id] + Math.ceil((secOf(l.id, dl) / rateOf(l.id, dl)) * FPS);
    return Math.min(interpolate(fr, [a - 8, a], [0, 1], clamp), interpolate(fr, [b, b + 8], [1, 0], clamp));
  }));
  // 장면 전환을 브금 박자에 붙임: 목소리는 그대로, 화면이 바뀌는 프레임만 가장 가까운 박으로 ±4프레임 안에서 옮김 (2026-10-28 사용자 OK - Lemo-Opuscar "리듬은 음악 박자부터")
  const from_ = groups.map((g, i) => (i === 0 ? start[g.ids[0]] : beatSnap(music, start[g.ids[0]])));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <InkDefs />
      {groups.map((g, i) => {
        const from = from_[i];
        const next = groups[i + 1] ? from_[i + 1] : total;
        return (
          <Sequence key={i} from={from} durationInFrames={next - from + (groups[i + 1] ? SHOT_XF : 0)}>
            <FadeIn on={i > 0}><g.Shot at={(id) => start[id] - from} frames={next - from} /></FadeIn>
          </Sequence>
        );
      })}
      {cardOf(ch) > 0 && (
        <Sequence durationInFrames={CARD + CARD_X}>
          <ChapterCard year={year} />
        </Sequence>
      )}
      {ls.map((l) => <Sequence key={l.id} from={start[l.id]}><Snd voice src={voiceSrc(l.id, lang)} playbackRate={rateOf(l.id, lang)} /></Sequence>)}
      <Bgm music={music} frames={total} vol={(fr) => 0.26 - 0.16 * duck(fr)} />
      {cardOf(ch) > 0 && <Sequence from={0} durationInFrames={30}><Snd src={staticFile("sfx/ep/page.wav")} volume={0.4} /></Sequence>}
    </AbsoluteFill>
  );
};
// ---------- 브금 (2026-10-26 사용자: "브금이 웅장하다가 뚝 끊기는 게 영상들에 있어, 하네스로 잡아줘") ----------
// 곡(70~107초)이 장(3~4분)보다 짧아 곡이 끝나는 자리에서 브금이 사라지고, 장이 바뀔 때 페이드 없이 끊겼다.
// Bgm: 곡을 3초씩 겹쳐(앞 곡은 줄고 뒤 곡은 커지게) frames 끝까지 이어 붙이고, 처음은 fadeIn·끝은 fadeOut으로 줄인다.
// vol(fr)은 이 Bgm 안의 프레임 기준. 곡 길이는 public/bgm/durations.json (scripts/check-bgm-cut.py가 렌더본으로 끊김을 잡음)
// 브금은 이 컴포넌트로만 깐다 - <Snd src="bgm/…">를 직접 쓰면 check-draft.py가 오류
const BGM_SEC = bgmSec as Record<string, number>;
// 브금 빼고 렌더 (브금 후보를 대사 밑에 깔아 비교할 때 - 2026-10-27)
export const NoBgm = createContext(false);
// 소리 갈래 (2026-10-27 사용자: "효과음에 소리가 안 묻히게"): "voice" = 목소리만, "bed" = 브금·효과음만, "all" = 다.
// 둘을 따로 렌더해 scripts/stem-mix.py가 목소리 나올 때 bed 전체(효과음 포함)를 눌러 섞는다. 소리는 모두 Snd로 깐다(목소리는 voice)
export type StemKind = "all" | "voice" | "bed";
export const Stem = createContext<StemKind>("all");
export const Snd = ({ voice = false, ...p }: React.ComponentProps<typeof Audio> & { voice?: boolean }) => {
  const s = useContext(Stem);
  if ((s === "voice" && !voice) || (s === "bed" && voice)) return null;
  return <Audio {...p} />;
};
// 곡마다 스스로 줄어드는 꼬리 길이(초) - 반복할 때 이만큼 앞에서 겹침. 없으면 4.5 (mountain은 192.5초부터 7.5초 동안 줄어듦)
const BGM_TAIL: Record<string, number> = { mountain: 8.5 };
// 곡의 박 (public/bgm/tempo.json: bpm·첫 박 초). Bgm이 장 0프레임에 시작해 D-X마다 다시 시작하는 것과 같은 계산으로, 프레임 f에서 가장 가까운 박을 찾음
const TEMPO = bgmTempo as Record<string, { bpm: number; first: number }>;
export const beatSnap = (music: string, f: number, maxShift = 4) => {
  const tp = TEMPO[music];
  if (!tp) return f;
  const D = Math.floor(((BGM_SEC[music] ?? 60) - (BGM_TAIL[music] ?? 4.5)) * FPS), step = D - 3 * FPS;
  const seg = Math.max(0, Math.floor(f / step)) * step; // 지금 들리는(가장 최근에 시작한) 반복
  const beat = (60 / tp.bpm) * FPS, b0 = seg + tp.first * FPS;
  const k = Math.round((f - b0) / beat);
  const snapped = Math.round(b0 + k * beat);
  return Math.abs(snapped - f) <= maxShift ? snapped : f;
};
export const Bgm = ({ music, frames, vol, fadeIn = FPS, fadeOut = Math.round(1.5 * FPS), loop = true }: { music: string; frames: number; vol: (fr: number) => number; fadeIn?: number; fadeOut?: number; loop?: boolean }) => {
  const off = useContext(NoBgm);
  // 반복할 때는 곡 끝 4.5초(곡 자체가 줄어드는 꼬리)를 쓰지 않음 - 꼬리 위에서 겹치면 3초 동안 브금이 꺼진 듯 들림 (2026-10-27 3장 3:22, discovery는 91초부터 줄어듦)
  const D = Math.floor(((BGM_SEC[music] ?? 60) - (loop ? BGM_TAIL[music] ?? 4.5 : 0)) * FPS);
  const X = 3 * FPS;
  const step = D - X;
  const n = loop ? Math.max(1, Math.ceil((frames - X) / step)) : 1;
  const edge = (fr: number) => Math.min(interpolate(fr, [0, fadeIn], [0, 1], clamp), interpolate(fr, [frames - fadeOut, frames], [1, 0], clamp));
  if (off) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const from = k * step;
        const len = Math.min(D, frames - from);
        if (len <= 0) return null;
        const last = from + D >= frames;
        return (
          <Sequence key={k} from={from} durationInFrames={len}>
            <Snd src={staticFile(`bgm/${music}.wav`)} volume={(fr) => vol(fr + from) * edge(fr + from) * (k > 0 ? interpolate(fr, [0, X], [0, 1], clamp) : 1) * (last ? 1 : interpolate(fr, [D - X, D], [1, 0], clamp))} />
          </Sequence>
        );
      })}
    </>
  );
};
// 대사 줄이 말하는 중인지 (캐릭터 talking 용) - 화면은 영어 본편 기준이라 영어 길이로
export const talkingAt = (f: number, at: number, id: string) => f >= at && f < at + Math.ceil((secOf(id, "en") || secOf(id, "ko")) * FPS);
// fade: 앞뒤를 이 프레임만큼 부드럽게 - 기본 6프레임이라 모든 효과음이 뚝 끊기지 않음 (2026-11-02 사용자: "끌려 나오다 해자로 갈 때 배경 소리가 끊어지는 듯", "하네스로 수정 못 해?")
export const SFX = ({ name, at, vol = 0.4, dur, fade = 6 }: { name: string; at: number; vol?: number; dur?: number; fade?: number }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}>
    <Snd src={staticFile(`sfx/ep/${name}.wav`)} volume={fade > 0 ? (fr: number) => vol * Math.max(0, Math.min(1, fr / fade, dur ? (dur - fr) / fade : 1)) : vol} />
  </Sequence>
);
