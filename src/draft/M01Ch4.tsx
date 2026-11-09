// 몽골 1편 검수용 초안 - 4장 "만리장성 너머" (c4_01~c4_33) 화면
// 기준: 합격한 훅·1·2장(M01Ch1·M01Ch2)의 밝은 종이 그림체. 02 "1장·2장 피드백" 전부 적용
//   - 이 장의 핵심 = 1211 야호령 전투 분석: ① 위에서 본 지형도(좁은 산길에 길게 늘어선 금나라 진) ② 사신이 넘어와 배치를 털어놓음
//     ③ 한 점으로 모여 무칼리가 앞장서 가운데를 뚫음(땅 높이 전용 그림) ④ 끊긴 앞뒤, 서로 못 도움 ⑤ 좁은 길로 도망치다 서로 밟음 → 공식 네 가지 아이콘
//   - 같은 연출 돌려쓰지 않기: 기병 가로 지나가기 없음 (무칼리 돌격은 왼쪽 아래 → 오른쪽 위로 멀어지며, 행렬은 세로로 카메라가 올라감)
//   - 화면 숫자는 연도만(1209·1211·1215), 흰 번쩍임 없음, 흔들림은 느리게, 극적인 끝(중도 함락)은 천천히
// 없는 인물(금나라 황제·사신 석말명안·금나라 장수·서하 왕·공주·무칼리·병사·짐꾼)은 characters.json을 건드리지 않고
//   이 파일 안 전용 그림(Person: 둥근 얼굴·점 눈·먹선·바랜 색, 복식만 다르게)으로 그림. 무칼리는 전용 말 탄 그림(MuqaliRide)
// check-draft: 이름만 무칼리
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CM_LAKES, CM_LAND, CM_POL, CM_RIVERS } from "./chinaMap";
import { BigNum, Chapter, Char, clamp, Dim, ease, Fire, FPS, Ger, Glow, Group, INK, Paper, Rider, SFX, ShotProps, Steppe, talkingAt, Tug } from "./kit";

const sec = (s: number) => Math.round(s * FPS);
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
// b <= a면 바로 끝값: 목소리가 짧아져 구간이 없어진 장면이 렌더를 멈추지 않게 (2026-11-06 내레이터 교체)
const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) => (b <= a ? (f < a ? from : to) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp));
// 느린 흔들림 (프레임마다 좌우가 뒤집히면 깜빡임처럼 보임)
export const shake = (f: number, from: number, amp: number, dur = 40) => {
  const t = f - from;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const d = 1 - t / dur;
  return { x: Math.sin(t * 0.9) * amp * d, y: Math.cos(t * 1.2) * amp * 0.6 * d };
};
// 카메라: 배율·초점·흔들림 (가장자리 검은 틈 안 생기게)
export const Cam = ({ z = 1, cx = 960, cy = 540, sx = 0, sy = 0, children }: { z?: number; cx?: number; cy?: number; sx?: number; sy?: number; children: React.ReactNode }) => {
  const tx = Math.max(Math.min(960 - cx * z, 0), 1920 - 1920 * z) + sx;
  const ty = Math.max(Math.min(540 - cy * z, 0), 1080 - 1080 * z) + sy;
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "0 0" }}>{children}</AbsoluteFill>;
};
export const Dust = ({ x, y, t, r = 80, color = "#c9b48a" }: { x: number; y: number; t: number; r?: number; color?: string }) =>
  t <= 0 || t >= 1 ? null : (
    <>
      {[-1.2, -0.4, 0.5, 1.3].map((dx, i) => {
        const rr = r * (0.7 + i * 0.1) * (0.6 + t * 0.9);
        return <div key={i} style={{ position: "absolute", left: x + dx * r * (0.6 + t) - rr, top: y - rr - r * 0.3 * t * (i % 2 ? 1.4 : 1), width: rr * 2, height: rr * 2, borderRadius: "50%", background: `radial-gradient(${color}, transparent 70%)`, opacity: (1 - t) * 0.9 }} />;
      })}
    </>
  );
const fadeTo = (f: number, a: number, d = 10) => lerp(f, a, a + d, 0, 1);

// =====================================================================
// 전용 인물 그림 (없는 인물): 판 300×440, 발 = (150, 440). 둥근 얼굴·점 눈·볼 홍조·먹선 - 새 그림체와 같은 결
// =====================================================================
const SKIN = "#ecbf93";
type Hat = "turban" | "scarf" | "fur" | "jin_official" | "jin_emperor" | "jin_soldier" | "jin_general" | "xia_king" | "xia_soldier" | "princess" | "mongol" | "muqali" | "porter";
export type Look = { robe: string; dark: string; trim: string; hat: Hat; beard?: "none" | "thin" | "long" | "full"; armor?: boolean; collar?: "round" | "cross" };
export type Eyes = "dot" | "wide" | "shut" | "angry" | "worry" | "side" | "sly" | "cry";
type Mouth = "smile" | "flat" | "o" | "frown" | "grin" | "talk" | "wobble" | "wail";
type Arms = "down" | "offer" | "sleeves" | "point" | "up" | "fist" | "hold" | "shovel";
export const EMPEROR: Look = { robe: "#d9a93a", dark: "#b8862a", trim: "#a8332a", hat: "jin_emperor", beard: "thin", collar: "round" };
export const ENVOY: Look = { robe: "#7a4a6a", dark: "#5e3852", trim: "#c9a24a", hat: "jin_official", beard: "long", collar: "round" };
export const OFFICIAL: Look = { robe: "#4f6e6a", dark: "#3c5654", trim: "#c9a24a", hat: "jin_official", beard: "thin", collar: "round" };
export const JIN_GEN: Look = { robe: "#a8432e", dark: "#83321f", trim: "#c9a24a", hat: "jin_general", beard: "full", armor: true, collar: "round" };
export const JIN_SOL: Look = { robe: "#a8432e", dark: "#83321f", trim: "#6b5b4b", hat: "jin_soldier", armor: true, collar: "round" };
export const XIA_KING: Look = { robe: "#efe6d4", dark: "#d4c7a8", trim: "#a8332a", hat: "xia_king", beard: "thin", collar: "cross" };
export const XIA_SOL: Look = { robe: "#e3dccb", dark: "#c8bfa8", trim: "#4f7a70", hat: "xia_soldier", collar: "cross" };
export const XIA_PRIN: Look = { robe: "#6f9a8a", dark: "#55806f", trim: "#e3c068", hat: "princess", collar: "cross" };
const JIN_PRIN: Look = { robe: "#c9708a", dark: "#a8566e", trim: "#e3c068", hat: "princess", collar: "round" };
const JIN_REST: Look = { robe: "#a8432e", dark: "#83321f", trim: "#6b5b4b", hat: "porter", collar: "round" };
export const PORTER: Look = { robe: "#8a7a5a", dark: "#6e6046", trim: "#5a4636", hat: "porter", collar: "cross" };
export const MON: Look = { robe: "#5e6f80", dark: "#4a5866", trim: "#a8332a", hat: "mongol", collar: "cross" };
const MUQALI: Look = { robe: "#6a4a3a", dark: "#4f372b", trim: "#c9a24a", hat: "muqali", beard: "full", armor: true, collar: "cross" };

const ArmP = ({ d, color, w = 30 }: { d: string; color: string; w?: number }) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + 10} fill="none" strokeLinecap="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
  </>
);
// 손 위치 (판 좌표) - 소품을 손에 붙이려고 밖에서도 씀
const HANDS: Record<Arms, number[][]> = {
  down: [[86, 322], [214, 322]],
  hold: [[86, 322], [222, 300]],
  offer: [[128, 298], [172, 298]],
  sleeves: [[150, 296], [150, 296]],
  point: [[86, 322], [304, 178]],
  up: [[70, 96], [230, 96]],
  fist: [[86, 322], [232, 104]],
  shovel: [[120, 300], [200, 250]],
};
const HatG = ({ hat }: { hat: Hat }) => {
  switch (hat) {
    // 2026-11-02 호라즘 사람들: 흰 터번(남자) · 머릿수건(여자, 턱 아래로 감쌈)
    case "turban":
      return (
        <g>
          <path d="M 78 100 C 70 34 230 34 222 100 C 190 86 110 86 78 100 Z" fill="#f2ece0" stroke={INK} strokeWidth={5} />
          <path d="M 84 82 C 120 66 180 66 216 82 M 92 64 C 124 52 176 52 208 64" stroke="#cfc6b2" strokeWidth={5} fill="none" />
          <path d="M 196 94 C 214 110 222 132 214 150" stroke="#f2ece0" strokeWidth={14} strokeLinecap="round" fill="none" />
        </g>
      );
    case "scarf":
      return (
        <g>
          <path d="M 70 130 C 60 40 240 40 230 130 C 236 180 220 206 196 214 L 196 176 C 210 150 208 110 150 104 C 92 110 90 150 104 176 L 104 214 C 80 206 64 180 70 130 Z" fill="#8a4a5a" stroke={INK} strokeWidth={5} />
          <path d="M 90 90 C 130 70 170 70 210 90" stroke="#a8667a" strokeWidth={5} fill="none" />
        </g>
      );
    case "jin_official":
      return (
        <g>
          <path d="M 82 82 L -24 74 L -24 88 L 82 96 Z M 218 82 L 324 74 L 324 88 L 218 96 Z" fill="#26201c" stroke={INK} strokeWidth={4} />
          <path d="M 78 104 C 74 30 226 30 222 104 C 190 92 110 92 78 104 Z" fill="#26201c" stroke={INK} strokeWidth={5} />
          <ellipse cx={150} cy={44} rx={44} ry={28} fill="#26201c" stroke={INK} strokeWidth={5} />
        </g>
      );
    case "jin_emperor":
      return (
        <g>
          <path d="M 82 88 C 40 80 18 52 12 26 L 26 22 C 34 46 52 66 84 74 Z M 218 88 C 260 80 282 52 288 26 L 274 22 C 266 46 248 66 216 74 Z" fill="#26201c" stroke={INK} strokeWidth={4} />
          <path d="M 78 104 C 72 10 228 10 222 104 C 190 92 110 92 78 104 Z" fill="#26201c" stroke={INK} strokeWidth={5} />
          <path d="M 82 92 C 110 82 190 82 218 92" stroke="#e0b64a" strokeWidth={9} fill="none" />
          <path d="M 132 70 L 150 34 L 168 70 Z" fill="#e0b64a" stroke={INK} strokeWidth={4} />
          <circle cx={150} cy={60} r={8} fill="#a8332a" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "jin_soldier":
    case "jin_general":
      return (
        <g>
          <path d="M 76 98 L 70 178 L 96 182 L 98 104 Z M 224 98 L 230 178 L 204 182 L 202 104 Z" fill="#6b5b4b" stroke={INK} strokeWidth={4} />
          <path d="M 74 104 C 70 24 230 24 226 104 Z" fill="#8f9597" stroke={INK} strokeWidth={5} />
          <path d="M 74 100 L 226 100" stroke={hat === "jin_general" ? "#c9a24a" : "#6b6f70"} strokeWidth={10} />
          <path d="M 150 30 L 150 8" stroke={INK} strokeWidth={6} />
          <path d={hat === "jin_general" ? "M 150 12 C 120 -30 130 -50 150 -60 C 170 -50 180 -30 150 12 Z" : "M 150 14 C 136 -6 140 -18 150 -22 C 160 -18 164 -6 150 14 Z"} fill="#b8332a" stroke={INK} strokeWidth={4} />
        </g>
      );
    case "xia_king":
      return (
        <g>
          <path d="M 92 84 L 96 4 L 124 36 L 150 -24 L 176 36 L 204 4 L 208 84 Z" fill="#e0b64a" stroke={INK} strokeWidth={5} />
          <path d="M 86 84 C 110 74 190 74 214 84 L 214 100 C 190 92 110 92 86 100 Z" fill="#c9a24a" stroke={INK} strokeWidth={4} />
          <circle cx={150} cy={50} r={10} fill="#a8332a" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "xia_soldier":
      return (
        <g>
          <path d="M 76 102 C 80 20 220 20 224 102 Z" fill="#e8e2d4" stroke={INK} strokeWidth={5} />
          <path d="M 76 96 L 224 96" stroke="#4f7a70" strokeWidth={10} />
          <path d="M 150 26 L 150 6" stroke="#4f7a70" strokeWidth={7} />
        </g>
      );
    case "princess":
      return (
        <g>
          <ellipse cx={150} cy={22} rx={62} ry={34} fill="#2b2220" stroke={INK} strokeWidth={5} />
          <path d="M 76 114 C 66 40 234 40 224 114 C 200 72 100 72 76 114 Z" fill="#2b2220" stroke={INK} strokeWidth={5} />
          <path d="M 96 18 L 60 4 M 204 18 L 240 4" stroke="#e3c068" strokeWidth={6} />
          <circle cx={56} cy={18} r={7} fill="#e3c068" stroke={INK} strokeWidth={2} /><circle cx={244} cy={18} r={7} fill="#e3c068" stroke={INK} strokeWidth={2} />
          <circle cx={150} cy={6} r={12} fill="#c9708a" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "mongol":
      return (
        <g>
          <path d="M 80 96 C 84 30 216 30 220 96 Z" fill="#8f9597" stroke={INK} strokeWidth={5} />
          <path d="M 74 98 C 110 86 190 86 226 98 L 226 112 C 190 102 110 102 74 112 Z" fill="#5a4030" stroke={INK} strokeWidth={4} />
          <path d="M 150 36 L 150 10" stroke={INK} strokeWidth={6} />
          <circle cx={150} cy={10} r={8} fill="#a8332a" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "muqali":
      return (
        <g>
          <path d="M 80 100 L 66 186 L 96 190 L 98 106 Z M 220 100 L 234 186 L 204 190 L 202 106 Z" fill="#5a4030" stroke={INK} strokeWidth={4} />
          <path d="M 78 102 C 88 40 120 12 150 -6 C 180 12 212 40 222 102 Z" fill="#9aa0a2" stroke={INK} strokeWidth={5} />
          <path d="M 78 100 L 222 100" stroke="#c9a24a" strokeWidth={11} />
          <path d="M 150 -6 L 150 -34" stroke={INK} strokeWidth={7} />
          <path d="M 150 -30 C 120 -40 96 -30 80 -6 C 104 -18 126 -20 150 -22 Z" fill="#b8332a" stroke={INK} strokeWidth={4} />
        </g>
      );
    case "fur":
      return (
        <g>
          <path d="M 76 108 C 66 30 234 30 224 108 Z" fill="#7a5a3a" stroke={INK} strokeWidth={5} />
          <path d="M 70 104 C 110 88 190 88 230 104 L 230 122 C 190 108 110 108 70 122 Z" fill="#c9b08a" stroke={INK} strokeWidth={4} />
          <path d="M 220 70 C 260 80 270 120 250 150 C 244 120 236 100 214 92 Z" fill="#7a5a3a" stroke={INK} strokeWidth={4} />
        </g>
      );
    case "porter":
      return (
        <g>
          <path d="M 78 106 C 74 44 226 44 222 106 C 190 90 110 90 78 106 Z" fill="#2b2220" stroke={INK} strokeWidth={4} />
          <path d="M 76 92 C 110 82 190 82 224 92" stroke="#c9b08a" strokeWidth={14} fill="none" />
          <circle cx={150} cy={44} r={16} fill="#2b2220" stroke={INK} strokeWidth={4} />
        </g>
      );
  }
};
export type PersonProps = { L: Look; eyes?: Eyes; mouth?: Mouth; arms?: Arms; bow?: number; kneel?: boolean; half?: boolean; sweat?: boolean; t?: number; step?: number; children?: React.ReactNode; front?: React.ReactNode; back?: React.ReactNode };
// 판 좌표의 사람 (svg <g>) - 말 위·지도 위에도 바로 넣을 수 있게
const PersonG = ({ L, eyes = "dot", mouth = "flat", arms = "down", bow = 0, kneel = false, half = false, sweat = false, t = 0, step = 0, children, front, back }: PersonProps) => {
  const [hl, hr] = HANDS[arms];
  const up = kneel ? 80 : 0;
  const mo = mouth === "talk" ? (["o", "flat", "smile", "o"] as Mouth[])[Math.floor(t / 4) % 4] : mouth === "wobble" ? (Math.floor(t / 3) % 2 ? "frown" : "flat") : mouth;
  const blink = eyes !== "shut" && (t + L.robe.length * 13) % 96 < 3;
  const st = Math.sin(step) * 10;
  const armD = (side: 0 | 1) => {
    const sx = side ? 196 : 104;
    const [hx, hy] = side ? hr : hl;
    const mx = (sx + hx) / 2 + (side ? 14 : -14);
    const my = (205 + hy) / 2 + 10;
    return `M ${sx} 205 Q ${mx} ${my} ${hx} ${hy}`;
  };
  return (
    <g>
      {!half && <ellipse cx={150} cy={438} rx={kneel ? 100 : 78} ry={10} fill="rgba(43,29,20,0.22)" />}
      {/* 다리·치맛자락 */}
      {!half && !kneel && (
        <>
          <ellipse cx={116 - st} cy={428} rx={28} ry={12} fill="#3a2b22" stroke={INK} strokeWidth={4} />
          <ellipse cx={184 + st} cy={428} rx={28} ry={12} fill="#3a2b22" stroke={INK} strokeWidth={4} />
        </>
      )}
      {!half && kneel && <path d="M 66 440 C 60 400 80 380 100 376 L 200 376 C 220 380 240 400 234 440 Z" fill={L.dark} stroke={INK} strokeWidth={5} />}
      <g transform={`translate(0 ${up + bow * 26}) rotate(${bow * 16} 150 ${kneel ? 330 : 320})`}>
        {back}
        {/* 뒤 팔 (몸 뒤) */}
        {arms === "shovel" && <ArmP d={armD(0)} color={L.dark} />}
        {/* 몸통 (도포) */}
        <path d={half || kneel ? "M 100 188 C 82 230 80 290 78 336 L 222 336 C 220 290 218 230 200 188 Z" : "M 100 188 C 80 232 76 330 70 426 L 230 426 C 224 330 220 232 200 188 Z"} fill={L.robe} stroke={INK} strokeWidth={6} />
        <path d={half || kneel ? "M 104 200 C 92 240 90 290 90 330" : "M 104 200 C 90 260 86 340 84 420"} stroke={L.dark} strokeWidth={16} fill="none" opacity={0.6} />
        {L.armor && (
          <g>
            <path d="M 104 200 L 196 200 L 204 296 L 96 296 Z" fill="#8f8a7e" stroke={INK} strokeWidth={4} />
            {[214, 234, 254, 274].map((yy) => <path key={yy} d={`M 100 ${yy} L 200 ${yy}`} stroke={INK} strokeWidth={2.5} opacity={0.7} />)}
            {[120, 140, 160, 180].map((xx) => <path key={xx} d={`M ${xx} 202 L ${xx} 294`} stroke={INK} strokeWidth={1.5} opacity={0.4} />)}
          </g>
        )}
        {L.collar === "cross" ? <path d="M 118 192 L 176 262" stroke={L.trim} strokeWidth={10} /> : <path d="M 116 192 C 128 218 172 218 184 192" stroke={L.trim} strokeWidth={9} fill="none" />}
        {L.hat === "jin_emperor" && <g><circle cx={150} cy={252} r={24} fill="#e0b64a" stroke={INK} strokeWidth={4} /><path d="M 138 244 C 148 236 162 244 156 254 C 150 262 140 258 146 250" stroke="#a8332a" strokeWidth={4} fill="none" /></g>}
        <path d="M 86 304 L 214 304" stroke={L.trim} strokeWidth={12} />
        {children}
        {/* 팔 */}
        {arms === "sleeves" ? (
          <>
            <ArmP d="M 104 205 C 92 250 112 290 150 294" color={L.robe} w={40} />
            <ArmP d="M 196 205 C 208 250 188 290 150 294" color={L.robe} w={40} />
            <ellipse cx={150} cy={296} rx={30} ry={20} fill={L.dark} stroke={INK} strokeWidth={4} />
          </>
        ) : (
          <>
            {arms !== "shovel" && <ArmP d={armD(0)} color={L.robe} />}
            <ArmP d={armD(1)} color={L.robe} />
            <circle cx={hl[0]} cy={hl[1]} r={15} fill={SKIN} stroke={INK} strokeWidth={4} />
            <circle cx={hr[0]} cy={hr[1]} r={15} fill={SKIN} stroke={INK} strokeWidth={4} />
          </>
        )}
        {front}
        {/* 머리 */}
        <circle cx={150} cy={116} r={74} fill={SKIN} stroke={INK} strokeWidth={6} />
        <ellipse cx={104} cy={140} rx={13} ry={7} fill="#e08a78" opacity={0.45} />
        <ellipse cx={196} cy={140} rx={13} ry={7} fill="#e08a78" opacity={0.45} />
        {blink ? (
          <path d="M 112 118 L 132 118 M 168 118 L 188 118" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        ) : eyes === "wide" ? (
          <g>
            <circle cx={122} cy={116} r={16} fill="#fbf6ea" stroke={INK} strokeWidth={4} /><circle cx={178} cy={116} r={16} fill="#fbf6ea" stroke={INK} strokeWidth={4} />
            <circle cx={122} cy={118} r={6} fill={INK} /><circle cx={178} cy={118} r={6} fill={INK} />
          </g>
        ) : eyes === "shut" ? (
          <path d="M 110 120 Q 122 110 134 120 M 166 120 Q 178 110 190 120" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        ) : eyes === "cry" ? (
          <g>
            <path d="M 108 110 L 132 120 L 108 128 M 192 110 L 168 120 L 192 128" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 104 100 L 136 86 M 196 100 L 164 86" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            {[0, 1].map((k) => {
              const u = ((t + k * 9) % 22) / 22;
              const x = k ? 176 : 124;
              return <g key={k}><path d={`M ${x} 126 C ${x - 4} 150 ${x + 2} 170 ${x - 2} 190`} stroke="#8fc0dc" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} /><ellipse cx={x - 2} cy={192 + u * 40} rx={6} ry={9} fill="#8fc0dc" opacity={1 - u} /></g>;
            })}
          </g>
        ) : eyes === "sly" ? (
          <path d="M 110 118 Q 122 124 134 116 M 166 116 Q 178 124 190 118" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        ) : (
          <g>
            <circle cx={eyes === "side" ? 130 : 122} cy={116} r={7.5} fill={INK} />
            <circle cx={eyes === "side" ? 186 : 178} cy={116} r={7.5} fill={INK} />
          </g>
        )}
        {eyes === "angry" && <path d="M 104 90 L 138 104 M 196 90 L 162 104" stroke={INK} strokeWidth={6} strokeLinecap="round" />}
        {eyes === "worry" && <path d="M 106 104 L 136 92 M 194 104 L 164 92" stroke={INK} strokeWidth={5} strokeLinecap="round" />}
        {L.beard === "full" && <path d="M 86 140 C 92 196 208 196 214 140 C 196 168 104 168 86 140 Z" fill="#3a2a20" stroke={INK} strokeWidth={4} />}
        {(L.beard === "thin" || L.beard === "long") && <path d="M 146 146 C 132 146 116 152 104 166 M 154 146 C 168 146 184 152 196 166" stroke="#2b2220" strokeWidth={5} fill="none" strokeLinecap="round" />}
        {L.beard === "long" && <path d="M 142 170 C 140 196 146 214 150 226 C 154 214 160 196 158 170 Z" fill="#2b2220" />}
        {mo === "smile" && <path d="M 134 152 Q 150 166 166 152" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
        {mo === "flat" && <path d="M 138 156 L 162 156" stroke={INK} strokeWidth={5} strokeLinecap="round" />}
        {mo === "o" && <ellipse cx={150} cy={158} rx={9} ry={12} fill="#5a2a22" stroke={INK} strokeWidth={4} />}
        {mo === "frown" && <path d="M 134 162 Q 150 148 166 162" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
        {mo === "grin" && <path d="M 128 148 Q 150 176 172 148 Z" fill="#5a2a22" stroke={INK} strokeWidth={4} />}
        {mo === "wail" && (() => { const o = 10 + Math.abs(Math.sin(t / 4)) * 8; return <path d={`M 128 ${160 - o * 0.2} Q 150 ${146 - o * 0.4} 172 ${160 - o * 0.2} Q 168 ${166 + o} 150 ${168 + o} Q 132 ${166 + o} 128 ${160 - o * 0.2} Z`} fill="#4a1e18" stroke={INK} strokeWidth={4} />; })()}
        <HatG hat={L.hat} />
        {sweat && <path d="M 218 92 C 210 108 214 120 222 120 C 230 120 232 108 218 92 Z" fill="#a9d0e0" stroke={INK} strokeWidth={3} />}
      </g>
    </g>
  );
};
// 화면에 세우는 사람: (x, y) = 발, h = 키(판 440 기준)
export const Person = ({ x, y, h = 300, flip = false, bob = 0, rot = 0, op = 1, ...p }: PersonProps & { x: number; y: number; h?: number; flip?: boolean; bob?: number; rot?: number; op?: number }) => {
  const s = h / 440;
  return (
    <svg width={300 * s} height={440 * s} viewBox="0 0 300 440" style={{ position: "absolute", left: x - 150 * s, top: y - 440 * s - bob, transform: `${flip ? "scaleX(-1) " : ""}rotate(${rot}deg)`, transformOrigin: "50% 100%", opacity: op, ...ink }}>
      <PersonG {...p} />
    </svg>
  );
};
// 걷는 사람: 발 교차 + 통통
export const walkBob = (f: number, on: boolean) => (on ? Math.abs(Math.sin(f / 5)) * 10 : 0);

// =====================================================================
// 말 (옆모습, 오른쪽을 봄) - 판 좌표: 발굽 y = 0. 달리면 다리가 돌고, 위에 탄 사람은 children
// =====================================================================
export const HC = { coat: "#b88a52", dark: "#7a5530", mane: "#3a2618" };
const HorseG = ({ t, run = true, coat = HC.coat, dark = HC.dark, mane = HC.mane, saddle = "#8a3b2c", children, rein = true, graze = 0 }: { t: number; run?: boolean; coat?: string; dark?: string; mane?: string; saddle?: string | null; children?: React.ReactNode; rein?: boolean; graze?: number }) => {
  const leg = (hx: number, off: number, isFront: boolean, c: string) => {
    const a = 2 * Math.PI * (t / 16 + off);
    const dx = run ? Math.sin(a) * 58 : 0;
    const lift = run ? Math.max(0, -Math.cos(a)) * 46 : 0;
    const fx = hx + dx;
    const fy = -lift;
    const kx = (hx + fx) / 2 + (isFront ? -16 : 16) + (run ? Math.sin(a) * 10 : 0);
    const ky = -150 / 2 - lift * 0.4;
    const d = `M ${hx} -150 Q ${kx} ${ky} ${fx} ${fy}`;
    return (
      <g key={`${hx}-${off}`}>
        <path d={d} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={d} stroke={c} strokeWidth={24} fill="none" strokeLinecap="round" />
        <ellipse cx={fx} cy={fy - 4} rx={15} ry={8} fill="#2b1d14" />
      </g>
    );
  };
  const nod = run ? Math.sin((2 * Math.PI * t) / 16) * 6 : 0;
  return (
    <g>
      <ellipse cx={40} cy={4} rx={190} ry={14} fill="rgba(43,29,20,0.22)" />
      <path d={`M -104 -206 C -160 -200 -205 ${-176 + nod} -222 ${-130 + nod} C -186 -148 -150 -168 -108 -180 Z`} fill={mane} stroke={INK} strokeWidth={6} />
      {leg(126, 0.12, true, dark)}
      {leg(-82, 0.62, false, dark)}
      <ellipse cx={40} cy={-182} rx={152} ry={62} fill={coat} stroke={INK} strokeWidth={7} />
      {leg(150, 0, true, coat)}
      {leg(-56, 0.5, false, coat)}
      <g transform={`rotate(${nod * 0.6 + graze * (62 + Math.sin(t / 7) * 4)} 160 -200)`}>
        <path d="M 136 -222 C 166 -272 188 -304 214 -334 L 272 -302 C 246 -272 226 -232 192 -170 Z" fill={coat} stroke={INK} strokeWidth={7} />
        <path d="M 138 -228 C 168 -278 190 -308 214 -338" stroke={mane} strokeWidth={20} fill="none" />
        <path d="M 212 -334 C 248 -366 300 -350 332 -308 C 342 -290 328 -272 306 -280 L 262 -292 Z" fill={coat} stroke={INK} strokeWidth={7} />
        <path d="M 228 -348 L 222 -376 L 246 -352 Z" fill={coat} stroke={INK} strokeWidth={5} />
        <circle cx={264} cy={-324} r={5.5} fill={INK} />
        {rein && <path d="M 300 -296 C 250 -270 180 -262 120 -250" stroke={INK} strokeWidth={4} fill="none" />}
      </g>
      {saddle && <path d="M -14 -240 C 20 -258 80 -258 112 -240 L 102 -210 L -2 -210 Z" fill={saddle} stroke={INK} strokeWidth={6} />}
      {children}
    </g>
  );
};
// 말 탄 사람 (판 좌표, HorseG 안에): 윗몸 + 옆으로 내려온 다리
export const RiderOn = ({ L, ...p }: PersonProps) => (
  <g>
    <g transform="translate(-53 -452) scale(0.62)">
      <PersonG L={L} half {...p} />
    </g>
    <path d="M 46 -246 Q 96 -224 82 -168" stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d="M 46 -246 Q 96 -224 82 -168" stroke={L.dark} strokeWidth={24} fill="none" strokeLinecap="round" />
    <ellipse cx={90} cy={-160} rx={22} ry={12} fill="#3a2b22" stroke={INK} strokeWidth={4} />
  </g>
);
// 화면에 놓는 말: (x, y) = 발굽 땅 가운데, w = 너비
export const Horse = ({ x, y, w = 400, flip = false, phase = 0, run = true, rot = 0, children, ...c }: { x: number; y: number; w?: number; flip?: boolean; phase?: number; run?: boolean; rot?: number; children?: React.ReactNode; coat?: string; dark?: string; mane?: string; saddle?: string | null; rein?: boolean; graze?: number }) => {
  const f = useCurrentFrame() + phase;
  const s = w / 560;
  const bob = run ? Math.abs(Math.sin((Math.PI * f) / 8)) * 10 * s : 0;
  return (
    <svg width={560 * s} height={500 * s} viewBox="-230 -480 560 500" style={{ position: "absolute", left: x - 270 * s, top: y - 480 * s - bob, transform: `${flip ? "scaleX(-1) " : ""}rotate(${rot}deg)`, ...ink }}>
      <HorseG t={f} run={run} {...c}>{children}</HorseG>
    </svg>
  );
};
// 굽은 칼 (판 좌표, 손 (x,y)에 쥠)
export const Sabre = ({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -4 -8 C 10 -80 30 -160 70 -220 C 44 -150 26 -80 8 -6 Z" fill="#c9cfd0" stroke={INK} strokeWidth={4} />
    <path d="M -22 -6 L 24 -12" stroke="#c9a24a" strokeWidth={9} />
    <path d="M 0 -4 L -4 30" stroke="#5a3a24" strokeWidth={12} strokeLinecap="round" />
  </g>
);
// 창 (판 좌표, 손에 세워 쥠)
export const Spear = ({ x, y, len = 420, flag }: { x: number; y: number; len?: number; flag?: string }) => (
  <g>
    <path d={`M ${x} ${y + 120} L ${x} ${y - len + 120}`} stroke={INK} strokeWidth={10} />
    <path d={`M ${x} ${y + 120} L ${x} ${y - len + 120}`} stroke="#7a5230" strokeWidth={5} />
    <path d={`M ${x} ${y - len + 76} L ${x - 10} ${y - len + 126} L ${x + 10} ${y - len + 126} Z`} fill="#b8bcbd" stroke={INK} strokeWidth={3} />
    {flag && <path d={`M ${x + 2} ${y - len + 130} L ${x + 70} ${y - len + 150} L ${x + 2} ${y - len + 172} Z`} fill={flag} stroke={INK} strokeWidth={3} />}
  </g>
);
// 삽 (판 좌표)
export const Shovel = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M 0 -120 L 0 130" stroke={INK} strokeWidth={11} />
    <path d="M 0 -120 L 0 130" stroke="#7a5230" strokeWidth={6} />
    <path d="M -22 120 L 22 120 L 18 170 L 0 186 L -18 170 Z" fill="#9aa0a2" stroke={INK} strokeWidth={4} />
  </g>
);

// =====================================================================
// 소품·건물 (화면 좌표)
// =====================================================================
const Chest = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <svg width={160 * s} height={110 * s} viewBox="0 0 160 110" style={{ position: "absolute", left: x - 80 * s, top: y - 110 * s, ...ink }}>
    <path d="M 10 40 L 150 40 L 146 106 L 14 106 Z" fill="#8a3b2c" stroke={INK} strokeWidth={5} />
    <path d="M 10 40 C 20 6 140 6 150 40 Z" fill="#a8473a" stroke={INK} strokeWidth={5} />
    <path d="M 10 40 L 150 40 M 40 14 L 40 106 M 120 14 L 120 106" stroke="#c9a24a" strokeWidth={6} />
    <rect x={70} y={44} width={20} height={22} fill="#c9a24a" stroke={INK} strokeWidth={3} />
  </svg>
);
const SILK = ["#b8332a", "#3f6690", "#e0b64a", "#4f7a70", "#c9708a"];
export const SilkG = ({ x, y, n = 5, s = 1 }: { x: number; y: number; n?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, i) => {
      const r = Math.floor(i / 3);
      const c = i % 3;
      return <g key={i}><rect x={-60 + c * 40 + r * 20} y={-26 - r * 26} width={40} height={26} rx={12} fill={SILK[i % 5]} stroke={INK} strokeWidth={4} /><ellipse cx={-20 + c * 40 + r * 20} cy={-13 - r * 26} rx={5} ry={11} fill="#f2ead8" stroke={INK} strokeWidth={2} /></g>;
    })}
  </g>
);
// 낙타 (서하의 공물 - 등에 비단 짐)
export const Camel = ({ x, y, w = 360, t = 0, walk = true }: { x: number; y: number; w?: number; t?: number; walk?: boolean }) => {
  const s = w / 400;
  const sw = walk ? Math.sin(t / 5) * 16 : 0;
  return (
    <svg width={400 * s} height={360 * s} viewBox="-200 -340 400 360" style={{ position: "absolute", left: x - 200 * s, top: y - 340 * s, transform: "scaleX(-1)", ...ink }}>
      <ellipse cx={0} cy={6} rx={170} ry={12} fill="rgba(43,29,20,0.2)" />
      {[[-80, sw], [-50, -sw], [60, -sw], [90, sw]].map(([lx, d], i) => <path key={i} d={`M ${lx} -150 L ${lx + d} 0`} stroke={INK} strokeWidth={i % 2 ? 22 : 26} strokeLinecap="round" />)}
      {[[-80, sw], [-50, -sw], [60, -sw], [90, sw]].map(([lx, d], i) => <path key={`c${i}`} d={`M ${lx} -150 L ${lx + d} 0`} stroke={i % 2 ? "#a88a5a" : "#c9a874"} strokeWidth={i % 2 ? 13 : 17} strokeLinecap="round" />)}
      <path d="M -120 -150 C -130 -210 -90 -260 -40 -250 C -10 -300 50 -290 70 -240 C 110 -230 130 -190 120 -150 C 60 -130 -60 -130 -120 -150 Z" fill="#c9a874" stroke={INK} strokeWidth={6} />
      <path d="M 110 -180 C 140 -200 150 -250 150 -290 L 186 -290 C 200 -270 196 -250 170 -246 C 166 -210 150 -170 124 -150 Z" fill="#c9a874" stroke={INK} strokeWidth={6} />
      <circle cx={170} cy={-276} r={4} fill={INK} />
      <path d="M -60 -260 L 60 -250 L 56 -200 L -64 -206 Z" fill="#3f6690" stroke={INK} strokeWidth={5} />
      <SilkG x={0} y={-252} n={5} s={0.9} />
    </svg>
  );
};
// 수레 (바퀴 둘, 짐)
export const Cart = ({ x, y, w = 360, t = 0, load, rolling = true }: { x: number; y: number; w?: number; t?: number; load?: React.ReactNode; rolling?: boolean }) => {
  const s = w / 360;
  const r = rolling ? t * 6 : 0;
  return (
    <svg width={360 * s} height={300 * s} viewBox="-180 -280 360 300" style={{ position: "absolute", left: x - 180 * s, top: y - 280 * s, ...ink }}>
      {load}
      <path d="M -150 -110 L 140 -110 L 130 -60 L -140 -60 Z" fill="#8a5a34" stroke={INK} strokeWidth={6} />
      <path d="M 140 -90 L 200 -80" stroke={INK} strokeWidth={10} />
      {[-90, 80].map((wx) => (
        <g key={wx} transform={`translate(${wx} -46) rotate(${r})`}>
          <circle r={44} fill="#a8774a" stroke={INK} strokeWidth={6} />
          {[0, 45, 90, 135].map((a) => <path key={a} d={`M ${-40 * Math.cos((a * Math.PI) / 180)} ${-40 * Math.sin((a * Math.PI) / 180)} L ${40 * Math.cos((a * Math.PI) / 180)} ${40 * Math.sin((a * Math.PI) / 180)}`} stroke={INK} strokeWidth={4} />)}
          <circle r={9} fill={INK} />
        </g>
      ))}
    </svg>
  );
};
// 금나라 깃발: 검붉은 네모 + 금빛 톱니 테 + 해 / 서하 깃발: 청록 삼각 + 흰 원 (글자 없이 모양·색으로)
export const FlagG = ({ x, y, banner: kind, h = 200, fall = 0, t = 0 }: { x: number; y: number; banner: "jin" | "xia" | "tribeA" | "tribeB"; h?: number; fall?: number; t?: number }) => {
  const w = Math.sin(t / 8 + x * 0.01) * 5;
  const k = h / 200;
  return (
    <g transform={`translate(${x} ${y}) rotate(${fall * 84}) scale(${k})`} opacity={1 - fall * 0.4}>
      <path d="M 0 0 L 0 -200" stroke={INK} strokeWidth={9} />
      <path d="M 0 0 L 0 -200" stroke="#6a4a2e" strokeWidth={4} />
      {kind === "jin" && (
        <>
          <path d={`M 2 -196 L 104 ${-196 + w} L 104 ${-110 + w} L 2 -110 Z`} fill="#c9a24a" stroke={INK} strokeWidth={4} />
          <path d={`M 10 -188 L 96 ${-188 + w} L 96 ${-118 + w} L 10 -118 Z`} fill="#8a2a22" />
          <circle cx={54} cy={-153 + w / 2} r={16} fill="#e0b64a" stroke={INK} strokeWidth={3} />
          <path d="M -8 -204 L 0 -222 L 8 -204 Z" fill="#c9a24a" stroke={INK} strokeWidth={3} />
        </>
      )}
      {kind === "xia" && (
        <>
          <path d={`M 2 -196 L 118 ${-166 + w} L 2 -128 Z`} fill="#4f8a7c" stroke={INK} strokeWidth={4} />
          <circle cx={38} cy={-164} r={12} fill="#f2ead8" stroke={INK} strokeWidth={3} />
          <path d="M -10 -200 C -4 -214 4 -214 10 -200" stroke="#f2ead8" strokeWidth={5} fill="none" />
        </>
      )}
      {kind === "tribeA" && <path d={`M 2 -196 L 90 ${-176 + w} L 2 -150 Z`} fill="#b23a2c" stroke={INK} strokeWidth={4} />}
      {kind === "tribeB" && <path d={`M 2 -196 L 80 ${-196 + w} L 80 ${-150 + w} L 2 -150 Z`} fill="#6a8a4a" stroke={INK} strokeWidth={4} />}
    </g>
  );
};
export const Flag = (p: { x: number; y: number; banner: "jin" | "xia" | "tribeA" | "tribeB"; h?: number; fall?: number }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <FlagG {...p} t={f} />
    </svg>
  );
};
// 중국식 성벽 (톱니 담) - 화면 좌표 svg 조각
export const WallG = ({ x0, x1, top, base, c = "#a8957a" }: { x0: number; x1: number; top: number; base: number; c?: string }) => (
  <g>
    <path d={`M ${x0} ${top} L ${x1} ${top} L ${x1} ${base} L ${x0} ${base} Z`} fill={c} stroke={INK} strokeWidth={6} />
    {Array.from({ length: Math.floor((x1 - x0) / 44) }).map((_, i) => <rect key={i} x={x0 + 6 + i * 44} y={top - 24} width={26} height={26} fill={c} stroke={INK} strokeWidth={4} />)}
    {Array.from({ length: Math.floor((base - top) / 36) }).map((_, r) => <path key={r} d={`M ${x0} ${top + 30 + r * 36} L ${x1} ${top + 30 + r * 36}`} stroke={INK} strokeWidth={2} opacity={0.3} />)}
  </g>
);
// 문루 (2층 지붕, 붉은 기둥)
export const GateTowerG = ({ x, y, s = 1, burn = 0 }: { x: number; y: number; s?: number; burn?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 0 L 110 0 L 110 -70 L -110 -70 Z" fill="#a8332a" stroke={INK} strokeWidth={5} />
    {[-80, -30, 30, 80].map((px) => <path key={px} d={`M ${px} 0 L ${px} -70`} stroke="#6a1f18" strokeWidth={9} />)}
    <path d="M -170 -60 C -120 -78 120 -78 170 -60 L 120 -100 L -120 -100 Z" fill="#4a4440" stroke={INK} strokeWidth={5} />
    <path d="M -80 -100 L 80 -100 L 80 -140 L -80 -140 Z" fill="#a8332a" stroke={INK} strokeWidth={5} />
    <path d="M -130 -130 C -90 -146 90 -146 130 -130 L 70 -180 L -70 -180 Z" fill="#4a4440" stroke={INK} strokeWidth={5} />
    <path d="M -170 -60 C -180 -66 -186 -76 -184 -86 M 170 -60 C 180 -66 186 -76 184 -86 M -130 -130 C -140 -136 -146 -146 -144 -154 M 130 -130 C 140 -136 146 -146 144 -154" stroke={INK} strokeWidth={5} fill="none" />
    {burn > 0 && <path d="M -60 -100 L 60 -100 L 60 -140 L -60 -140 Z" fill="#ffb24a" opacity={0.5 * burn} />}
  </g>
);
// 금나라 군막 (네모 천막)
export const JinTentG = ({ x, y, s = 1, lit = 0 }: { x: number; y: number; s?: number; lit?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 0 L -70 -54 L 70 -54 L 70 0 Z" fill="#d8c8a4" stroke={INK} strokeWidth={5} />
    <path d="M -86 -50 L 0 -104 L 86 -50 Z" fill="#a8432e" stroke={INK} strokeWidth={5} />
    <path d="M -16 0 L -16 -38 L 16 -38 L 16 0 Z" fill={lit ? "#ffd98c" : "#5a3a2a"} stroke={INK} strokeWidth={4} />
    <path d="M 0 -104 L 0 -124" stroke={INK} strokeWidth={4} />
  </g>
);
// 땅 위 산 (큰 바위산 - 땅 높이 장면)
export const Crag = ({ d, c = "#9a8c74", shade = "#7d7060" }: { d: string; c?: string; shade?: string }) => {
  // 바위 결: 꼭짓점에서 아래로 내려오는 갈라진 선
  const pts = (d.match(/-?\d+ -?\d+/g) ?? []).map((q) => q.split(" ").map(Number)).filter(([, y]) => y < 900);
  return (
    <g>
      <path d={d} fill={c} stroke={INK} strokeWidth={6} />
      {pts.map(([x, y], i) => <path key={i} d={`M ${x} ${y + 10} l ${i % 2 ? -30 : 30} 90 l ${i % 2 ? 10 : -10} 80`} stroke={shade} strokeWidth={6} fill="none" opacity={0.6} />)}
      {pts.map(([x, y], i) => <path key={`s${i}`} d={`M ${x - 4} ${y + 6} L ${x - 40} ${y + 70} L ${x - 10} ${y + 60} Z`} fill="#efe6d4" opacity={0.35} />)}
    </g>
  );
};

// =====================================================================
// 1) c4_01~02 남쪽: 진영의 칭기즈칸이 남쪽 지평선(금빛)을 봄 → 지도: 부유한 중국, 북쪽 절반 금나라(깃발),
//    금 황제가 실로 초원 부족 깃발 둘을 맞부딪치게 함(이간질) → 몽골 화살이 금나라를 비켜 옆구리 서하로
// =====================================================================
// 지도: 실제 해안선·강 + 1209년 나라 윤곽 (scripts/china-map.py → chinaMap.ts, 경도 80~140). 2026-10-26 사용자: "너무 조잡해 … 국가 지도 위에 캐릭터를 올려"
// 자리(화면 px): 몽골 초원 832,154 · 서하 도성 838,520 · 금 중도 1165,463 · 개봉 1098,670 · 남송 임안 1286,853
export const P = {
  genghis: [832, 270], zhongdu: [1165, 463], xingqing: [838, 520],
  tribeA: [690, 250], tribeB: [1010, 268],
};
// 금나라 북쪽 경계 장성(계호, 12세기) - 내몽골을 따라 동북으로
export const WALL = [[770, 452], [896, 406], [960, 394], [1024, 369], [1088, 357], [1152, 337], [1216, 313], [1280, 272], [1344, 215]];
const HOUSES = [[1165, 470], [1098, 676], [1050, 560], [1210, 560], [1270, 430], [1380, 330], [985, 615], [1150, 620], [1300, 520], [1286, 858], [1150, 820], [1000, 880], [1240, 760], [1100, 960], [900, 905], [1200, 690]];
export const House = ({ x, y, k = 1 }: { x: number; y: number; k?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M -18 0 L -18 -18 L 18 -18 L 18 0 Z" fill="#efe6d4" stroke={INK} strokeWidth={3} />
    <path d="M -28 -16 C -10 -22 10 -22 28 -16 L 14 -32 L -14 -32 Z" fill="#7a3426" stroke={INK} strokeWidth={3} />
  </g>
);
// 성벽: 돌 띠 + 톱니(여장) + 마디마다 망루
export const WallLine = ({ pts, k = 1 }: { pts: number[][]; k?: number }) => {
  const d = "M " + pts.map(([x, y]) => `${x} ${y}`).join(" L ");
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={17 * k} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} stroke="#b9ab8c" strokeWidth={11 * k} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} stroke="#7d6f58" strokeWidth={3 * k} fill="none" strokeDasharray={`${5 * k} ${5 * k}`} transform={`translate(0 ${-6 * k})`} />
      {pts.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
          <path d="M -11 6 L -11 -18 L 11 -18 L 11 6 Z" fill="#cfc2a2" stroke={INK} strokeWidth={3.5} />
          <path d="M -15 -17 L 0 -28 L 15 -17 Z" fill="#7a3426" stroke={INK} strokeWidth={3} />
          <path d="M -3 -10 L 3 -10 L 3 -3 L -3 -3 Z" fill={INK} />
        </g>
      ))}
    </g>
  );
};
export const Mtn = ({ x, y, k = 1 }: { x: number; y: number; k?: number }) => (
  <path transform={`translate(${x} ${y}) scale(${k})`} d="M -30 0 L -4 -40 L 8 -24 L 16 -33 L 34 0 Z" fill="#b3a585" stroke={INK} strokeWidth={3.5} />
);
export const ChinaMap = ({ f, rich, jin, strings, arrow, pull, xia = 0, south = 0 }: { f: number; rich: number; jin: number; strings: number; arrow: number; pull: number; xia?: number; south?: number }) => {
  const bonk = Math.max(0, Math.sin(f / 7)) * 22 * strings;
  const [ex, ey] = P.zhongdu;
  return (
    <AbsoluteFill>
      <Paper />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <defs>
          <clipPath id="cm-jin"><path d={CM_POL.jin} /></clipPath>
          <clipPath id="cm-rich"><path d={CM_POL.jin + CM_POL.song} /></clipPath>
        </defs>
        <rect width={1920} height={1080} fill="#8fb0c0" />
        <path d={CM_LAND} fill="#e6d2a2" fillRule="evenodd" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        {["khitan", "tibet", "dali", "goryeo"].map((k) => <path key={k} d={CM_POL[k]} fill="#d6c59a" stroke="#8a7a5a" strokeWidth={2.5} strokeDasharray="8 6" />)}
        <path d={CM_POL.song} fill="#c9bd98" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={CM_POL.xia} fill="#9dbaa8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={CM_POL.jin} fill={jin > 0 ? "#cf8f68" : "#d8c49a"} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={CM_POL.mongol} fill="#5d7b98" stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={0.9} />
        {xia > 0 && <path d={CM_POL.xia} fill="#5d7b98" stroke={INK} strokeWidth={5} opacity={0.85 * xia} />}
        <path d={CM_LAKES} fill="#8fb0c0" stroke={INK} strokeWidth={2.5} />
        <path d={CM_RIVERS} stroke="#5f86a0" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* 고비 사막 (몽골과 금 사이 모래점) */}
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={760 + ((i * 263) % 420)} cy={300 + ((i * 47) % 70)} r={2.6} fill="#8a7650" opacity={0.6} />)}
        {/* 산 - 티베트 고원·태항산·대흥안령 */}
        {[[520, 600, 1], [610, 700, 1.1], [700, 640, 0.9], [560, 780, 1], [1060, 520, 0.8], [1360, 200, 0.8], [1400, 260, 0.7], [660, 140, 0.8]].map(([x, y, k], i) => <Mtn key={i} x={x} y={y} k={k} />)}
        <WallLine pts={WALL} />
        {/* 부유함: 논밭 줄 + 집들이 솟음 (금·남송 땅 안에만) */}
        <g clipPath="url(#cm-rich)">
          {rich > 0 && [[1050, 610], [1230, 640], [1150, 900], [1000, 820], [1240, 800], [1120, 520]].map(([x, y], i) => (
            <g key={`fd${i}`} opacity={Math.min(1, rich * 2 - i * 0.2)}>
              {[0, 1, 2, 3].map((r) => <path key={r} d={`M ${x - 46} ${y + r * 10} L ${x + 46} ${y + r * 10 - 6}`} stroke="#6f8f4a" strokeWidth={4} />)}
            </g>
          ))}
          {jin > 0 && Array.from({ length: 140 }).map((_, i) => {
            const x = 960 + ((i * 197) % 560);
            const y = 300 + ((i * 113) % 420);
            const k = lerp(jin, (i % 30) / 60, (i % 30) / 60 + 0.4, 0, 1);
            return <circle key={`p${i}`} cx={x} cy={y} r={4.5 * k} fill="#6a2a1e" opacity={0.6} clipPath="url(#cm-jin)" />;
          })}
        </g>
        {HOUSES.map(([x, y], i) => {
          const k = lerp(rich, (i / HOUSES.length) * 0.6, (i / HOUSES.length) * 0.6 + 0.3, 0, 1, true);
          return k > 0 ? <House key={i} x={x} y={y} k={k * (i === 0 ? 1.4 : 0.9)} /> : null;
        })}
        {/* 초원 부족 깃발 둘 (이간질 - 금 황제 손의 실에 끌려 서로 부딪침) */}
        {strings > 0 && (
          <g opacity={strings}>
            <FlagG x={P.tribeA[0] + bonk} y={P.tribeA[1]} banner="tribeA" h={100} t={f} />
            <FlagG x={P.tribeB[0] - bonk} y={P.tribeB[1]} banner="tribeB" h={100} t={f} />
            <path d={`M ${ex - 34} ${ey - 92 - pull * 0.4} Q ${(ex + P.tribeA[0]) / 2} ${ey - 60} ${P.tribeA[0] + bonk + 2} ${P.tribeA[1] - 96}`} stroke="#f2ead8" strokeWidth={3} strokeDasharray="6 5" fill="none" />
            <path d={`M ${ex + 34} ${ey - 92 - pull * 0.4} Q ${(ex + P.tribeB[0]) / 2} ${ey - 90} ${P.tribeB[0] - bonk + 2} ${P.tribeB[1] - 96}`} stroke="#f2ead8" strokeWidth={3} strokeDasharray="6 5" fill="none" />
          </g>
        )}
        {jin > 0 && <FlagG x={1262} y={560} banner="jin" h={150 * Math.min(1, jin * 1.5)} t={f} />}
        <FlagG x={760} y={560} banner="xia" h={120} t={f} fall={xia} />
        {/* 남쪽(금나라)으로 가는 화살 */}
        {south > 0 && (
          <g>
            <path d="M 930 250 C 980 320 1060 380 1120 420" stroke={INK} strokeWidth={28} fill="none" strokeDasharray={`${south * 230} 2000`} strokeLinecap="round" />
            <path d="M 930 250 C 980 320 1060 380 1120 420" stroke="#4d6b8a" strokeWidth={18} fill="none" strokeDasharray={`${south * 230} 2000`} strokeLinecap="round" />
            {south > 0.97 && <path d="M 1104 446 L 1160 436 L 1126 392 Z" fill="#4d6b8a" stroke={INK} strokeWidth={5} />}
          </g>
        )}
        {/* 몽골 화살: 금나라로 가는 척 → 서쪽 옆구리(서하)로 휨 */}
        {arrow > 0 && (
          <g>
            <path d={ARROW_XIA} stroke={INK} strokeWidth={26} fill="none" strokeDasharray={`${arrow * 420} 2000`} strokeLinecap="round" />
            <path d={ARROW_XIA} stroke="#4d6b8a" strokeWidth={16} fill="none" strokeDasharray={`${arrow * 420} 2000`} strokeLinecap="round" />
            {arrow > 0.97 && <path d="M 838 486 L 874 470 L 860 432 Z" fill="#4d6b8a" stroke={INK} strokeWidth={5} />}
          </g>
        )}
      </svg>
      <Tug x={P.genghis[0] - 90} y={P.genghis[1] - 6} h={150} sway={Math.sin(f / 14) * 4} />
      {xia > 0 && [[720, 500], [850, 520], [780, 600]].map(([x, y], i) => {
        const up = lerp(xia, i * 0.2, i * 0.2 + 0.5, 0, 1, true);
        return up > 0 ? <div key={i} style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - up) * 40}px)`, opacity: up }}><Tug x={x} y={y} h={110} sway={Math.sin((f + i * 9) / 14) * 3} /></div> : null;
      })}
    </AbsoluteFill>
  );
};
const ARROW_XIA = "M 900 270 C 960 330 990 380 950 420 C 915 452 880 450 858 466";
const S1 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a2 = at("c4_04");
  const toMap = sec(2.35);
  const rich = lerp(f, sec(2.6), sec(5.2), 0, 1);
  const jin = lerp(f, sec(5.7), sec(7.0), 0, 1, true);
  const strings = lerp(f, sec(7.7), sec(8.3), 0, 1) * lerp(f, a2 + sec(0.8), a2 + sec(1.4), 1, 0);
  const arrow = lerp(f, a2 + sec(1.2), a2 + sec(3.6), 0, 1, true);
  const pull = Math.max(0, Math.sin(f / 7)) * 14;
  if (f < toMap + 10) {
    // 진영 앞 칭기즈칸 - 남쪽(오른쪽) 지평선의 금빛
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, toMap + 10, 1.05, 1.16)} cx={1300} cy={560}>
          <Steppe time="dusk" horizon={600} />
          <Glow x={1650} y={600} r={420} color="#ffd98c" op={0.6} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {[1500, 1620, 1760].map((x, i) => <path key={i} d={`M ${x - 26} 600 L ${x - 26} 560 L ${x - 14} 560 L ${x - 14} 520 L ${x + 14} 520 L ${x + 14} 560 L ${x + 26} 560 L ${x + 26} 600 Z M ${x - 34} 524 L ${x} 498 L ${x + 34} 524 Z`} fill="#b07a4a" opacity={0.55} />)}
          </svg>
          {[[160, 640, 220], [420, 610, 180], [760, 630, 150]].map(([x, y, w], i) => <Ger key={i} x={x} y={y} w={w} door="#8a3b2c" />)}
          <Tug x={300} y={660} h={320} sway={Math.sin(f / 14) * 4} />
          <Person L={MON} x={420} y={930} h={300} arms="hold" eyes="dot"><Spear x={222} y={300} flag="#f2ead8" /></Person>
          <Person L={MON} x={1000} y={940} h={290} arms="hold" eyes="side"><Spear x={222} y={300} /></Person>
          <Char id="genghis" x={700} h={540} pose="side" bottom={130} enter="none" beat="none" />
        </Cam>
      </AbsoluteFill>
    );
  }
  // 몽골 초원(칭기즈칸)에서 시작 → 남쪽 부유한 땅으로 내려가며 넓게 → 금나라·황제
  const cx = lerp(f, toMap, sec(5.5), 860, 1060, true);
  const cy = lerp(f, toMap, sec(5.5), 300, 520, true);
  const z = lerp(f, toMap, sec(5.5), 1.55, 1.12, true);
  const relief = f > a2 + sec(1.5);
  return (
    <AbsoluteFill style={{ opacity: lerp(f, toMap + 10, toMap + 22, 0, 1) }}>
      <Cam z={z} cx={cx} cy={cy}>
        <ChinaMap f={f} rich={rich} jin={jin} strings={strings} arrow={arrow} pull={pull} />
        {/* 금 황제 (지도 위 작은 전용 그림): 실을 쥐고 히죽 → 화살이 비켜 가자 안도 */}
        {jin > 0.3 && (
          <Person L={EMPEROR} x={P.zhongdu[0]} y={P.zhongdu[1] + 110} h={190} arms={strings > 0.2 ? "up" : "down"} eyes={relief ? "shut" : strings > 0.2 ? "sly" : "dot"} mouth={relief ? "flat" : strings > 0.2 ? "grin" : "flat"} sweat={f > a2 && f < a2 + sec(2.2)} bob={pull * 0.4} op={lerp(f, sec(7.4), sec(7.8), 0, 1)} />
        )}
        <Char id="genghis" x={P.genghis[0]} h={170} pose={f > a2 ? "smug" : "front"} gesture={f > a2 ? "point" : undefined} gestureAt={a2 + 6} bottom={1080 - P.genghis[1]} enter="none" beat="none" />
      </Cam>
      <SFX name="map" at={toMap + 8} vol={0.3} dur={40} />
      <SFX name="coins" at={sec(3.0)} vol={0.25} dur={45} />
      <SFX name="swish" at={a2 + sec(1.2)} vol={0.3} dur={30} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 2) c4_05~06 1209 서하 도성 포위 - 몽골군이 강둑을 터서 물을 성으로 → 둑이 무너지며 물이 몽골 진영으로 😏
//    ⏸("물은…") 동안 물보라가 멈춘 듯 느려지고 병사들이 고개를 돌림 → 진영이 잠기고 천막이 떠내려감, 성 위 서하 병사는 멀뚱
// =====================================================================
const RIVER_TOP = 486;
const DIKE = 560; // 둑 위 선
const Flood = ({ level, f, x0 = -40, x1 = 1960, op = 0.92 }: { level: number; f: number; x0?: number; x1?: number; op?: number }) => {
  if (level >= 1090) return null;
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 40) pts.push(`${x} ${level + Math.sin(x / 70 + f / 6) * 8}`);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <path d={`M ${x0} 1100 L ${pts.join(" L ")} L ${x1} 1100 Z`} fill="#6f93a8" stroke={INK} strokeWidth={5} opacity={op} />
      {Array.from({ length: 10 }).map((_, i) => {
        const x = x0 + ((i * 211 + f * 3) % (x1 - x0));
        const y = level + 40 + ((i * 89) % 260);
        return y < 1080 ? <path key={i} d={`M ${x} ${y} q 20 -10 40 0 q 20 10 40 0`} stroke="#d8e6ea" strokeWidth={4} fill="none" opacity={0.7} /> : null;
      })}
    </svg>
  );
};
// 떠다니는 게르 (기울며 둥둥)
const FloatGer = ({ x, y, w, f, k = 1 }: { x: number; y: number; w: number; f: number; k?: number }) => (
  <div style={{ position: "absolute", inset: 0, transform: `rotate(${Math.sin(f / 11 + x) * 8 * k}deg)`, transformOrigin: `${x}px ${y}px` }}>
    <Ger x={x} y={y} w={w} door="#8a3b2c" />
  </div>
);
export const S2 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a4 = at("c4_06");
  const a5 = at("c4_07");
  const a6 = at("c4_08");
  const dig = sec(4.0);
  const trickle = lerp(f, sec(5.0), a4, 0, 1);
  const crack = lerp(f, a4 + 10, a4 + 40, 0, 1);
  const burst = a4 + 40;
  // ⏸ 동안 물보라가 멈춘 듯 (아주 느리게)
  const slow = f < burst ? 0 : f < a5 ? (f - burst) * 0.12 : (a5 - burst) * 0.12 + (f - a5);
  const pour = lerp(slow, 0, 50, 0, 1, true);
  const level = lerp(slow, 6, 140, 1100, 828, true);
  const surprised = f >= burst;
  const sh = shake(f, a5, 7, 70);
  // 카메라: 넓게 포위 → 둑으로 당김 → ⏸ 정지 → 진영 쪽으로 → c4_08 성벽(서하 병사) → 다시 넓게
  const smirk = a6 + sec(0.6);
  const wide = a6 + sec(4.2);
  const z = f < dig ? lerp(f, 0, dig, 1.0, 1.08) : f < a5 ? lerp(f, dig, a4 + 30, 1.08, 1.35, true) : f < a6 ? lerp(f, a5, a5 + 30, 1.35, 1.12, true) : f < wide ? lerp(f, smirk, smirk + 30, 1.12, 1.45, true) : lerp(f, wide, wide + 24, 1.45, 1.05, true);
  const cx = f < dig ? 960 : f < a5 ? lerp(f, dig, a4 + 30, 960, 1000, true) : f < a6 ? lerp(f, a5, a5 + 30, 1000, 700, true) : f < wide ? lerp(f, smirk, smirk + 30, 700, 1450, true) : lerp(f, wide, wide + 24, 1450, 960, true);
  const cy = f < dig ? 600 : f < a5 ? lerp(f, dig, a4 + 30, 600, 560, true) : f < a6 ? 700 : f < wide ? lerp(f, smirk, smirk + 30, 700, 460, true) : lerp(f, wide, wide + 24, 460, 620, true);
  const gerDrift = (i: number) => Math.max(0, slow - 40) * (0.8 + i * 0.3);
  const gerY = (y0: number) => Math.min(y0, level + 30);
  const floating = level < 900;
  const digPose = Math.sin(f / 4) * 14;
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={cy} sx={sh.x} sy={sh.y}>
        <Steppe time="day" horizon={470} hills={false} />
        {/* 멀리 산 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -20 474 L 160 380 L 300 440 L 460 360 L 640 470 Z" fill="#b5a888" stroke={INK} strokeWidth={4} />
          {/* 황하 (둑 뒤 높은 물) */}
          <path d={`M -40 ${RIVER_TOP} C 300 ${RIVER_TOP - 10} 700 ${RIVER_TOP + 6} 1130 ${RIVER_TOP} L 1130 ${DIKE} L -40 ${DIKE} Z`} fill="#6f93a8" stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${((i * 260 + f * 2) % 1100) - 40} ${RIVER_TOP + 30 + (i % 2) * 20} q 20 -8 40 0 q 20 8 40 0`} stroke="#d8e6ea" strokeWidth={4} fill="none" />)}
          {/* 둑 (흙) */}
          <path d={`M -40 ${DIKE - 12} C 300 ${DIKE - 22} 700 ${DIKE - 16} 1130 ${DIKE - 12} L 1160 ${DIKE + 50} L -40 ${DIKE + 50} Z`} fill="#9a7a50" stroke={INK} strokeWidth={6} />
          {/* 판 물길: 둑 틈 → 성 쪽으로 */}
          <path d={`M 1040 ${DIKE + 10} C 1100 ${DIKE + 40} 1160 ${DIKE + 70} 1240 ${DIKE + 80}`} stroke="#7d5f3c" strokeWidth={26} fill="none" />
          {trickle > 0 && <path d={`M 1040 ${DIKE + 10} C 1100 ${DIKE + 40} 1160 ${DIKE + 70} 1240 ${DIKE + 80}`} stroke="#6f93a8" strokeWidth={12} fill="none" strokeDasharray={`${trickle * 240} 400`} />}
          {/* 서하 도성 (오른쪽 언덕 위) */}
          <path d="M 1080 1100 C 1120 800 1180 680 1300 640 C 1500 620 1700 615 1960 620 L 1960 1100 Z" fill="#b89a62" stroke={INK} strokeWidth={5} />
        </svg>
        {/* 성벽 위 서하 병사 (벽 뒤에서 머리만) */}
        {[1300, 1400, 1800, 1890].map((x, i) => (
          <Person key={i} L={XIA_SOL} x={x} y={560} h={200} eyes={f < burst ? "dot" : f < a6 ? "wide" : i === 1 ? "sly" : "dot"} mouth={f >= a6 && i === 1 ? "smile" : f >= burst ? "o" : "flat"} arms={f >= smirk && i === 2 ? "sleeves" : "down"} flip={i % 2 === 1} />
        ))}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <WallG x0={1220} x1={1960} top={470} base={640} />
          <GateTowerG x={1600} y={470} s={0.9} />
          <path d="M 1550 640 L 1550 560 C 1550 530 1650 530 1650 560 L 1650 640 Z" fill="#4a3424" stroke={INK} strokeWidth={5} />
        </svg>
        <Flag x={1235} y={470} banner="xia" h={150} />
        <Flag x={1845} y={470} banner="xia" h={150} />
        {/* 둑이 터짐: 틈 + 물보라 (⏸ 동안 멈춘 듯) */}
        {crack > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d={`M 1000 ${DIKE - 14} L ${1010 + crack * 10} ${DIKE + 10} L ${990 - crack * 6} ${DIKE + 26} L ${1004 + crack * 12} ${DIKE + 50}`} stroke={INK} strokeWidth={5} fill="none" />
            {f >= burst && (
              <g>
                {/* 갈라진 물줄기: 틈에서 부채꼴로 솟았다 떨어지는 가는 줄기들 */}
                {[-3, -2, -1, 0, 1, 2, 3].map((k) => {
                  const grow = Math.min(1, (slow + 4) / 8);
                  const h = (150 - Math.abs(k) * 24 + 30 * pour) * grow;
                  const dx = k * 46 * grow;
                  const x0 = 1000 + k * 6;
                  const y0 = DIKE - 8;
                  const d = `M ${x0} ${y0} Q ${x0 + dx * 0.5} ${y0 - h * 1.5} ${x0 + dx} ${y0 - h * 0.35 + Math.abs(k) * 12}`;
                  return (
                    <g key={k}>
                      <path d={d} stroke={INK} strokeWidth={14 - Math.abs(k)} fill="none" strokeLinecap="round" />
                      <path d={d} stroke="#8fb0c0" strokeWidth={8 - Math.abs(k)} fill="none" strokeLinecap="round" />
                      <path d={d} stroke="#eef4f4" strokeWidth={2.5} fill="none" strokeDasharray="10 14" />
                      {/* 줄기 끝에서 떨어져 나가는 물방울 */}
                      {[0, 1, 2].map((j) => {
                        const u = ((slow * 0.9 + j * 9 + (k + 3) * 4) % 26) / 26;
                        return <ellipse key={j} cx={x0 + dx + k * 14 * u + (j - 1) * 6} cy={y0 - h * 0.35 + Math.abs(k) * 12 - 20 + u * u * 70 + j * 8} rx={5 - j} ry={7 - j} fill="#d8e6ea" stroke={INK} strokeWidth={2} opacity={1 - u * 0.6} />;
                      })}
                    </g>
                  );
                })}
              </g>
            )}
            {f >= burst && pour > 0 && (
              <g>
                <path d={`M 965 ${DIKE + 20} C 930 ${DIKE + 120 * pour} 820 ${DIKE + 220 * pour} ${970 - 380 * pour} ${DIKE + 300 * pour} L ${1040 - 90 * pour} ${DIKE + 320 * pour} C 1010 ${DIKE + 200 * pour} 1040 ${DIKE + 100 * pour} 1040 ${DIKE + 20} Z`} fill="#6f93a8" stroke={INK} strokeWidth={5} />
                {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${985 + i * 14} ${DIKE + 30} C ${970 + i * 10} ${DIKE + 120 * pour} ${900 - i * 30} ${DIKE + 200 * pour} ${860 - i * 60} ${DIKE + 260 * pour}`} stroke="#d8e6ea" strokeWidth={4} fill="none" strokeDasharray={`30 ${20 + i * 6}`} strokeDashoffset={-f * 6} />)}
              </g>
            )}
          </svg>
        )}
        {/* 둑 위에서 삽질하던 병사들: 터지는 순간 굳어 고개를 돌림 */}
        {[880, 1110].map((x, i) => (
          <Person key={i} L={MON} x={x} y={DIKE + 10} h={170} arms={surprised ? "up" : "shovel"} eyes={surprised ? "wide" : "dot"} mouth={surprised ? "o" : "flat"} flip={i === 1} rot={surprised ? 0 : digPose * (i ? -0.3 : 0.3)}>
            {!surprised && <Shovel x={170} y={260} rot={30 + digPose} />}
          </Person>
        ))}
        {/* 몽골 진영 (둑 아래 낮은 땅) */}
        {[[200, 780, 200], [470, 800, 230], [760, 770, 190], [360, 960, 250], [700, 980, 240], [1010, 900, 200]].map(([x, y, w], i) => (
          floating ? <FloatGer key={i} x={x + gerDrift(i)} y={gerY(y)} w={w} f={f + i * 7} k={1} /> : <Ger key={i} x={x} y={y} w={w} door={i % 2 ? "#4d6b8a" : "#8a3b2c"} />
        ))}
        <Tug x={560} y={floating ? Math.min(820, level + 40) : 820} h={300} sway={Math.sin(f / 14) * 4} />
        {/* 둔덕 위 칭기즈칸 + 호위병: 물이 발목까지 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 40 1090 C 60 860 150 820 300 820 C 440 820 520 880 540 1090 Z" fill="#a88a5a" stroke={INK} strokeWidth={5} />
        </svg>
        <Person L={MON} x={110} y={850} h={260} arms="hold" eyes={f >= a5 ? "wide" : "dot"} mouth={f >= a5 ? "o" : "flat"}><Spear x={222} y={300} /></Person>
        <Char id="genghis" x={300} h={420} pose={f < a5 ? "front" : f < a6 + sec(3.6) ? "shocked" : "sad"} bottom={1080 - 840} enter="none" beat={f >= a5 && f < a5 + 4 ? "jump" : "none"} beatAt={a5} />
        {/* 물에 잠긴 병사들 (팔을 허우적, 게르 지붕을 잡음) */}
        {floating && [[620, 0], [900, 1], [430, 2]].map(([x, i]) => (
          <Person key={i} L={MON} x={x + Math.sin(f / 9 + i) * 10 + gerDrift(i) * 0.5} y={level + 70} h={190} arms={i === 1 ? "up" : "offer"} eyes="wide" mouth="o" rot={Math.sin(f / 8 + i) * 6} />
        ))}
        <Flood level={level} f={f} x0={-40} x1={1400} op={0.85} />
        {/* 성 언덕 앞면 (물이 언덕을 넘지 못함) + 포위한 몽골 기병 (높은 땅이라 멀쩡) */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 1080 1100 C 1120 800 1180 680 1300 640 C 1500 620 1700 615 1960 620 L 1960 1100 Z" fill="#b89a62" stroke={INK} strokeWidth={5} />
        </svg>
        {[1330, 1500, 1680, 1850].map((x, i) => <Rider key={i} kind={i % 2 ? "mongol2" : "mongol"} x={x - 90} y={680 + (i % 2) * 30} w={180} still phase={i} />)}
        {/* 😏 게르 지붕을 타고 삽으로 노 젓는 병사 */}
        {f >= wide - 20 && (
          <div style={{ position: "absolute", inset: 0, transform: `translate(${lerp(f, wide - 20, frames, 0, 260)}px, 0)` }}>
            <FloatGer x={640} y={level + 30} w={220} f={f} k={0.6} />
            <Person L={MON} x={640} y={level - 100} h={190} arms="shovel" eyes="shut" mouth="frown" rot={Math.sin(f / 10) * 4}><Shovel x={170} y={260} rot={20 + Math.sin(f / 6) * 30} /></Person>
          </div>
        )}
      </Cam>
      <SFX name="rumble" at={a4 + 10} vol={0.35} dur={60} />
      <SFX name="rain_thunder" at={a5} vol={0.3} dur={a6 - a5 + 40} />
      <SFX name="crowd" at={a5 + 10} vol={0.2} dur={80} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 3) c4_12 서하 왕이 공주·공물(상자·낙타에 비단)을 이끌고 와 칭기즈칸 앞에 무릎 꿇고 고개를 숙임 → "등 뒤가 깨끗" 칭기즈칸이 돌아서 남쪽을 가리킴 → 지도: 서하가 몽골 툭으로 채워지고 화살은 남쪽 금나라만
// =====================================================================
export const S3 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const arrive = sec(3.0);
  const bowAt = sec(3.4);
  const clean = sec(5.9);
  const walk = (x0: number, x1: number, d = 0) => lerp(f, d, arrive + d, x0, x1, true);
  const moving = f < arrive;
  const bow = lerp(f, bowAt, bowAt + 18, 0, 1, true);
  const turn = sec(5.4); // 칭기즈칸이 돌아서 남쪽(금나라)을 똑바로 봄
  if (f >= clean) {
    // 지도: 서하(등 뒤)가 몽골 색·흰 툭으로 채워지고, 화살은 남쪽 금나라만
    const t = f - clean;
    return (
      <AbsoluteFill style={{ opacity: lerp(t, 0, 10, 0, 1) }}>
        <Cam z={lerp(t, 0, frames - clean, 1.12, 1.2)} cx={960} cy={520}>
          <ChinaMap f={f} rich={1} jin={1} strings={0} arrow={0} pull={0} xia={lerp(t, 4, 34, 0, 1, true)} south={lerp(t, 30, 56, 0, 1, true)} />
          <Char id="genghis" x={P.genghis[0]} h={170} pose="side" bottom={1080 - P.genghis[1]} enter="none" beat="none" />
        </Cam>
        <SFX name="drum" at={clean + 4} vol={0.3} dur={30} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.05, 1.15)} cx={f < turn ? lerp(f, 0, arrive, 1100, 860, true) : lerp(f, turn, turn + 20, 860, 700, true)} cy={600}>
        <Steppe time="day" horizon={540} />
        {[[120, 600, 200], [330, 580, 170], [560, 600, 190], [1700, 590, 150]].map(([x, y, w], i) => <Ger key={i} x={x} y={y} w={w} door={i % 2 ? "#4d6b8a" : "#8a3b2c"} />)}
        <Tug x={240} y={640} h={360} sway={Math.sin(f / 14) * 4} />
        <Tug x={720} y={640} h={300} sway={Math.sin(f / 13) * 4} />
        {/* 호위병 */}
        <Person L={MON} x={150} y={930} h={300} arms="hold"><Spear x={222} y={300} flag="#f2ead8" /></Person>
        <Person L={MON} x={720} y={930} h={300} arms="hold" flip><Spear x={222} y={300} /></Person>
        <Char id="genghis" x={430} h={540} pose={f < bowAt ? "front" : f < turn ? "smug" : "side"} gesture={f >= turn ? "point" : undefined} gestureAt={turn + 4} bottom={150} enter="none" beat={f >= bowAt + 20 && f < turn ? "nod" : "none"} beatAt={bowAt + 20} />
        {/* 공물: 땅에 놓인 상자·비단 */}
        {f > arrive - 10 && (
          <>
            <Chest x={880} y={960} s={0.9} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><SilkG x={1000} y={968} n={6} s={0.9} /></svg>
          </>
        )}
        {/* 서하 행렬 (오른쪽에서 걸어 들어옴) */}
        <Camel x={walk(2350, 1700, 6)} y={930} w={340} t={f} walk={moving} />
        <Person L={PORTER} x={walk(2150, 1500, 4)} y={950} h={270} arms={f < arrive ? "offer" : "down"} bob={walkBob(f, moving)} step={moving ? f / 5 : 0} />
        <Person L={XIA_PRIN} x={walk(2000, 1300, 2)} flip y={940} h={290} arms="sleeves" eyes={bow > 0.5 ? "shut" : "worry"} mouth="flat" bow={bow * 0.5} bob={walkBob(f, moving)} />
        <Person L={XIA_KING} x={walk(1850, 1090, 0)} flip y={950} h={320} arms={bow > 0 ? "sleeves" : "down"} eyes={bow > 0.5 ? "shut" : "worry"} mouth="wobble" t={f} kneel={bow > 0.2} bow={bow * 0.7} sweat bob={walkBob(f, moving)} />
        <Flag x={walk(2050, 1400, 3) + 60} y={760} banner="xia" h={160} fall={lerp(f, bowAt, bowAt + 20, 0, 0.6, true)} />
      </Cam>
      <SFX name="gong" at={bowAt} vol={0.3} dur={60} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 4) c4_13 1211 - 노을, 산 능선을 따라 달리는 만리장성. 카메라가 맨 앞 칭기즈칸(말 탄 테무친 그림)과 군대에서 위로 올라가 성벽을 봄 (세로 이동)
// =====================================================================
const RIDGE = "M -20 380 L 140 300 L 300 340 L 480 240 L 640 300 L 820 220 L 1000 290 L 1180 200 L 1380 280 L 1560 210 L 1760 270 L 1940 230 L 1940 560 L -20 560 Z";
const WALLPATH = "M -20 372 L 140 296 L 300 334 L 480 236 L 640 296 L 820 216 L 1000 286 L 1180 196 L 1380 276 L 1560 206 L 1760 266 L 1940 226";
const S4 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const cy = lerp(f, 0, frames - 20, 840, 380, true);
  return (
    <AbsoluteFill>
      <Cam z={1.3} cx={960} cy={cy}>
        <Steppe time="dusk" horizon={560} hills={false} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d={RIDGE} fill="#8f6f4a" stroke={INK} strokeWidth={6} />
          <path d={WALLPATH} stroke={INK} strokeWidth={30} fill="none" />
          <path d={WALLPATH} stroke="#b5a17e" strokeWidth={20} fill="none" />
          <path d={WALLPATH} stroke={INK} strokeWidth={12} fill="none" strokeDasharray="10 14" transform="translate(0 -14)" />
          {[[480, 236], [820, 216], [1180, 196], [1560, 206]].map(([x, y], i) => <g key={i}><rect x={x - 30} y={y - 70} width={60} height={70} fill="#b5a17e" stroke={INK} strokeWidth={5} /><path d={`M ${x - 40} ${y - 66} L ${x} ${y - 100} L ${x + 40} ${y - 66} Z`} fill="#4a4440" stroke={INK} strokeWidth={4} /></g>)}
        </svg>
        {[1180, 480].map((x, i) => <Flag key={i} x={x + 40} y={i ? 230 : 190} banner="jin" h={120} />)}
        {/* 몽골군: 여러 줄, 맨 앞에 칭기즈칸 */}
        {[0, 1, 2, 3].map((r) => Array.from({ length: 9 }).map((_, i) => (
          <Rider key={`${r}-${i}`} kind={(i + r) % 3 ? "mongol" : "mongol2"} x={-60 + i * 220 + (r % 2) * 110} y={560 + r * 60} w={150 + r * 20} still phase={i} dark={r < 2} />
        )))}
        <Tug x={700} y={1010} h={380} sway={Math.sin(f / 12) * 5} />
        <Tug x={1300} y={1010} h={380} sway={Math.sin(f / 13) * 5} />
        <Rider kind="temujin" x={820} y={720} w={420} still />
      </Cam>
      <BigNum text="1211" at={4} size={190} y={-360} />
      <SFX name="war_horn" at={10} vol={0.3} dur={90} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 5) c4_14~10 야호령(오소리 입): 두 바위산 사이 좁은 고갯길을 금나라 군막·병사가 가득 메움 (바위가 이빨처럼)
//    "기록은 수십만" → 병사가 산꼭대기·하늘까지 부풀어 오름 😏 → "과장" → 거품처럼 빠짐 → 넓게 빠지며 왼쪽 아래 작은 몽골군과 비교
// =====================================================================
const Trooper = ({ x, y, k, c = "#a8432e", helm = "#8f9597" }: { x: number; y: number; k: number; c?: string; helm?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M -14 0 L -12 -34 L 12 -34 L 14 0 Z" fill={c} stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-44} r={13} fill={SKIN} stroke={INK} strokeWidth={3} />
    <path d="M -14 -46 C -14 -64 14 -64 14 -46 Z" fill={helm} stroke={INK} strokeWidth={3} />
    <path d="M 16 6 L 16 -78" stroke={INK} strokeWidth={3} />
  </g>
);
const PASS_L = "M -20 1100 L -20 120 L 200 80 L 420 160 L 560 120 L 760 300 L 900 430 L 940 470 L 760 1100 Z";
const PASS_R = "M 1940 1100 L 1940 140 L 1720 90 L 1500 170 L 1360 130 L 1160 300 L 1020 430 L 980 470 L 1160 1100 Z";
const passRows = (n: number) => Array.from({ length: n }).map((_, r) => {
  const t = r / (n - 1); // 0 먼 쪽 → 1 가까운 쪽
  const y = 480 + t * t * 560;
  const half = 30 + t * 210;
  const k = 0.25 + t * 1.15;
  return { y, half, k };
});
export const S5 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a10 = at("c4_15");
  const puff = lerp(f, a10 + 4, a10 + sec(1.6), 0, 1, true) * lerp(f, a10 + sec(2.3), a10 + sec(3.6), 1, 0, true);
  const back = a10 + sec(4.6);
  const z = f < back ? lerp(f, 0, a10, 1.0, 1.25, true) : lerp(f, back, back + 40, 1.25, 1.0, true);
  const cx = f < back ? 960 : lerp(f, back, back + 40, 960, 960);
  const rows = passRows(9);
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={f < back ? 560 : 560}>
        <Steppe time="day" horizon={470} hills={false} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 고갯길 바닥 */}
          <path d="M 940 470 L 980 470 L 1160 1100 L 760 1100 Z" fill="#c9b07c" stroke={INK} strokeWidth={4} />
          {/* 양쪽 바위산 */}
          <Crag d={PASS_L} />
          <Crag d={PASS_R} />
          {/* 오소리 이빨 바위 */}
          {[[880, 470], [840, 600], [800, 760], [1040, 470], [1080, 600], [1120, 760]].map(([x, y], i) => <path key={i} d={`M ${x - 22} ${y} L ${x + (i < 3 ? 26 : -26)} ${y - 70} L ${x + 22} ${y} Z`} fill="#d8ccb0" stroke={INK} strokeWidth={4} />)}
          {/* 금나라 군막 */}
          {rows.slice(0, 7).map((r, ri) => Array.from({ length: Math.max(1, Math.round(r.half / 70)) }).map((_, i, arr) => <JinTentG key={`${ri}-${i}`} x={960 - r.half + ((i + 0.5) * 2 * r.half) / arr.length} y={r.y - 20 * r.k} s={r.k * 0.55} />))}
          {/* 금나라 병사 */}
          {rows.map((r, ri) => Array.from({ length: Math.max(2, Math.round(r.half / (22 * r.k))) }).map((_, i, arr) => <Trooper key={`t${ri}-${i}`} x={960 - r.half + ((i + 0.5) * 2 * r.half) / arr.length} y={r.y + 10} k={r.k * 0.9} />))}
          {/* 😏 기록의 "수십만": 산 위·하늘까지 부풀어 오른 병사들 */}
          {puff > 0 && Array.from({ length: 70 }).map((_, i) => {
            const x = 80 + ((i * 937 + Math.floor(i / 7) * 61) % 1760);
            const y = 170 + ((i * 577 + (i % 5) * 113) % 520);
            const kk = lerp(puff, (i % 10) / 20, (i % 10) / 20 + 0.5, 0, 1);
            return kk > 0 ? <Trooper key={`p${i}`} x={x} y={y} k={0.9 * kk} /> : null;
          })}
        </svg>
        {[[700, 600], [1240, 600], [860, 480], [1080, 480]].map(([x, y], i) => <Flag key={i} x={x} y={y} banner="jin" h={i < 2 ? 220 : 120} />)}
        {/* 비교: 왼쪽 아래 언덕의 작은 몽골군 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -20 1100 L -20 900 C 120 860 300 870 460 940 L 520 1100 Z" fill="#b89a62" stroke={INK} strokeWidth={5} />
        </svg>
        {[0, 1, 2].map((i) => <Rider key={i} kind={i ? "mongol" : "mongol2"} x={20 + i * 120} y={780 + (i % 2) * 20} w={150} still phase={i} />)}
      </Cam>
      <SFX name="war_drums" at={10} vol={0.25} dur={a10} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 위에서 본 야호령 지형도 (분석 장면들이 함께 씀): 양쪽 산(빗금 산 기호) 사이로 북(위, 몽골) → 남(아래 오른쪽, 금나라 수도 쪽) 구불구불한 좁은 길
// =====================================================================
const ROAD = [[620, -20], [660, 120], [760, 240], [880, 330], [960, 450], [1060, 560], [1150, 670], [1260, 790], [1350, 920], [1420, 1100]];
const segLen = ROAD.slice(1).map((p, i) => Math.hypot(p[0] - ROAD[i][0], p[1] - ROAD[i][1]));
const ROADLEN = segLen.reduce((a, b) => a + b, 0);
const roadAt = (t: number) => {
  let d = Math.max(0, Math.min(1, t)) * ROADLEN;
  for (let i = 0; i < segLen.length; i++) {
    if (d <= segLen[i] || i === segLen.length - 1) {
      const k = Math.min(1, d / segLen[i]);
      const [ax, ay] = ROAD[i];
      const [bx, by] = ROAD[i + 1];
      return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, a: (Math.atan2(by - ay, bx - ax) * 180) / Math.PI };
    }
    d -= segLen[i];
  }
  return { x: 0, y: 0, a: 0 };
};
const distRoad = (x: number, y: number) => {
  let m = 1e9;
  for (let i = 0; i < ROAD.length - 1; i++) {
    const [ax, ay] = ROAD[i];
    const [bx, by] = ROAD[i + 1];
    const dx = bx - ax, dy = by - ay;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    m = Math.min(m, Math.hypot(x - ax - dx * k, y - ay - dy * k));
  }
  return m;
};
const MOUNTS = (() => {
  const out: number[][] = [];
  for (let gy = 0; gy < 10; gy++) for (let gx = 0; gx < 14; gx++) {
    const x = gx * 145 + ((gy * 37 + gx * 53) % 70) - 10 + (gy % 2) * 70;
    const y = 160 + gy * 100 + ((gx * 29) % 40);
    const d = distRoad(x, y);
    if (d < 100 || d > 560 || (gx + gy) % 4 === 3) continue;
    out.push([x, y, 0.7 + ((gx * 7 + gy * 3) % 6) / 10]);
  }
  return out;
})();
const MapMount = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 0 L -6 -60 L 14 -36 L 26 -48 L 54 0 Z" fill="#b2a284" stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-2 + i * 10} ${-50 + i * 10} L ${6 + i * 12} 0`} stroke={INK} strokeWidth={2} opacity={0.5} />)}
  </g>
);
const PassBase = ({ dim = 0 }: { dim?: number }) => (
  <AbsoluteFill>
    <Paper />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      {/* 북쪽 초원 / 남쪽 평야 */}
      <path d="M -20 -20 L 1940 -20 L 1940 110 C 1400 140 900 90 -20 130 Z" fill="#d8c69c" opacity={0.7} />
      <path d={ROAD.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ")} stroke={INK} strokeWidth={70} fill="none" strokeLinejoin="round" />
      <path d={ROAD.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ")} stroke="#d9c597" strokeWidth={60} fill="none" strokeLinejoin="round" />
      <path d={ROAD.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ")} stroke="#a8905a" strokeWidth={4} fill="none" strokeDasharray="14 16" />
      {MOUNTS.map(([x, y, s], i) => <MapMount key={i} x={x} y={y} s={s} />)}
    </svg>
    {dim > 0 && <AbsoluteFill style={{ background: `rgba(30,20,10,${dim})` }} />}
  </AbsoluteFill>
);
// 두 색 섞기 (#rrggbb)
const mix = (a: string, b: string, k: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(p(a, i) * (1 - k) + p(b, i) * k).toString(16).padStart(2, "0")).join("");
};
// 금나라 부대 칸 (길 따라 회전)
const JIN_T = Array.from({ length: 12 }).map((_, i) => 0.24 + i * 0.058);
const UnitG = ({ x, y, a, c = "#a8432e", grey = 0, s = 1, flag = "jin", op = 1 }: { x: number; y: number; a: number; c?: string; grey?: number; s?: number; flag?: "jin" | "mon" | null; op?: number }) => {
  const col = grey > 0 ? mix(c, "#9a948a", grey * 0.75) : c;
  const helm = flag === "mon" ? "#5a4030" : "#8f9597";
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} opacity={op}>
      {Array.from({ length: 18 }).map((_, i) => {
        const cx = -40 + (i % 6) * 16 + ((i * 7) % 5) - 2;
        const cy = -16 + Math.floor(i / 6) * 16 + ((i * 3) % 4) - 2;
        return (
          <g key={i}>
            {flag === "jin" && <path d={`M ${cx + 2} ${cy - 2} L ${cx + 16} ${cy - 8}`} stroke={INK} strokeWidth={2} />}
            <circle cx={cx} cy={cy} r={7} fill={col} stroke={INK} strokeWidth={2.2} />
            <circle cx={cx + 1} cy={cy - 1} r={3.6} fill={helm} />
          </g>
        );
      })}
      {flag === "jin" && <g transform="rotate(90)"><path d="M -24 0 L -24 -48" stroke={INK} strokeWidth={4} /><rect x={-22} y={-48} width={22} height={16} fill="#8a2a22" stroke="#c9a24a" strokeWidth={3} /></g>}
      {flag === "mon" && <g transform="rotate(90)"><path d="M -24 0 L -24 -48" stroke={INK} strokeWidth={4} /><path d="M -28 -44 C -30 -34 -26 -28 -24 -24 C -22 -28 -18 -34 -20 -44 Z" fill="#f2ead8" stroke={INK} strokeWidth={2} /></g>}
    </g>
  );
};
// 칼 둘 겹침 (싸우는 자리 기호)
const CrossSwords = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((k) => (
      <g key={k} transform={`rotate(${k * 40})`}>
        <path d="M 0 -40 L 0 26" stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <path d="M 0 -40 L 0 22" stroke="#c9cfd0" strokeWidth={5} />
        <path d="M -12 24 L 12 24" stroke="#c9a24a" strokeWidth={7} />
      </g>
    ))}
  </g>
);
// 쉬는 부대 기호: 솥에 김
const Pot = ({ x, y, f }: { x: number; y: number; f: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -14 0 C -14 14 14 14 14 0 Z" fill="#3a3330" stroke={INK} strokeWidth={3} />
    <path d={`M -4 -4 c -6 -8 6 -12 0 ${-20 - Math.sin(f / 6) * 3}`} stroke="#f2ead8" strokeWidth={4} fill="none" opacity={0.8} />
  </g>
);
// 지도를 비스듬히 눕힘 (땅 높이 → 위에서 보기 전환, 긴장 장면)
const Tilt = ({ deg, children, oy = "60%" }: { deg: number; children: React.ReactNode; oy?: string }) => (
  <AbsoluteFill style={{ perspective: 1600, perspectiveOrigin: `50% 0%` }}>
    <AbsoluteFill style={{ transform: `rotateX(${deg}deg) scale(${1 + deg / 90})`, transformOrigin: `50% ${oy}` }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// 6) c4_16~12 [분석 1] 땅에서 위로 → 지형도. 길을 따라 금나라 부대가 하나씩 길게 늘어섬(카메라가 따라감) → 맨 앞 두 칸만 싸우고 나머지는 회색으로 쉼
const S6 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a12 = at("c4_17");
  const deg = lerp(f, 0, 40, 55, 0, true);
  const lineUp = (i: number) => lerp(f, a12 + sec(0.7) + i * 7, a12 + sec(0.7) + i * 7 + 10, 0, 1, true);
  const allIn = a12 + sec(4.5);
  const front = a12 + sec(6.0);
  const only = a12 + sec(7.9);
  const grey = lerp(f, only, only + 20, 0, 1);
  const follow = lerp(f, a12 + sec(0.7), a12 + sec(3.7), 0.2, 0.92, true);
  const c = roadAt(follow);
  const z = f < a12 ? lerp(f, 30, a12, 1.0, 1.05) : f < allIn ? 1.35 : f < front ? lerp(f, allIn, allIn + 30, 1.35, 1.0, true) : lerp(f, front, front + 40, 1.0, 1.3, true);
  const cx = f < a12 ? 960 : f < allIn ? c.x : f < front ? lerp(f, allIn, allIn + 30, c.x, 960, true) : lerp(f, front, front + 40, 960, 900, true);
  const cy = f < a12 ? 540 : f < allIn ? c.y : f < front ? lerp(f, allIn, allIn + 30, c.y, 540, true) : lerp(f, front, front + 40, 540, 330, true);
  const pulse = f < a12 ? 0.5 + 0.5 * Math.sin(f / 5) : 0;
  const mon = roadAt(0.1);
  const monIn = lerp(f, front, front + 30, 0, 1, true);
  return (
    <AbsoluteFill>
      <Tilt deg={deg}>
        <Cam z={z} cx={cx} cy={cy}>
          <PassBase />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {/* c4_16: 이 진지(길)에 약점 - 길 둘레 고리가 숨 쉼 */}
            {f < a12 && <path d={ROAD.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ")} stroke="#b8332a" strokeWidth={90} fill="none" opacity={0.12 + 0.12 * pulse} strokeLinejoin="round" />}
            {JIN_T.map((t, i) => {
              const p = roadAt(t);
              const k = f < a12 ? 1 : lineUp(i);
              const g = i < 2 ? 0 : grey;
              return k > 0 ? <UnitG key={i} x={p.x} y={p.y} a={p.a} s={0.6 + 0.4 * k} grey={g} op={k} /> : null;
            })}
            {/* 몽골 (북쪽 입구) 이 맨 앞과 맞닿음 */}
            {monIn > 0 && <UnitG x={mon.x} y={mon.y + lerp(monIn, 0, 1, -80, 0)} a={mon.a} c="#4d6b8a" flag="mon" op={monIn} />}
            {f > front + 20 && [0, 1].map((i) => { const p = roadAt(JIN_T[i] - 0.03); return <CrossSwords key={i} x={p.x + 60} y={p.y - 30} s={lerp(f, front + 20 + i * 8, front + 34 + i * 8, 0, 0.9, true)} />; })}
            {grey > 0 && JIN_T.slice(2).map((t, i) => { const p = roadAt(t); return <g key={i} opacity={grey}><Pot x={p.x + 56} y={p.y + 10} f={f + i * 5} /></g>; })}
          </svg>
        </Cam>
      </Tilt>
      <SFX name="map" at={4} vol={0.3} dur={40} />
      {JIN_T.map((_, i) => <SFX key={i} name="tick" at={a12 + sec(0.7) + i * 7} vol={0.15} dur={10} />)}
      <SFX name="swords" at={front + 20} vol={0.2} dur={40} />
    </AbsoluteFill>
  );
};

// 7) c4_18~14 [분석 2] 밤 - 금나라 사신(석말명안)이 금나라 진영을 빠져나와 몽골 진영으로 넘어옴 → 금나라 장수 "어?" 😏
//    → 칭기즈칸의 모닥불 앞, 무릎 꿇은 사신이 땅에 지도를 펼쳐 짚으며 말함 (지도에 쉬는 금나라 말들) → 칭기즈칸이 주먹
const MiniMap = ({ x, y, w, f, horses = 0 }: { x: number; y: number; w: number; f: number; horses?: number }) => {
  const s = w / 1920;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 1080 * s, transform: "perspective(900px) rotateX(48deg)", transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0", overflow: "hidden", border: `14px solid ${INK}`, boxShadow: "0 20px 30px rgba(0,0,0,0.35)" }}>
        <PassBase />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {JIN_T.map((t, i) => { const p = roadAt(t); return <UnitG key={i} x={p.x} y={p.y} a={p.a} />; })}
          {horses > 0 && JIN_T.map((t, i) => {
            const p = roadAt(t);
            const k = lerp(horses, i / 24, i / 24 + 0.4, 0, 1, true);
            return <g key={`h${i}`} transform={`translate(${p.x + 90} ${p.y + 30}) scale(${0.55 * k}) scale(-1 1)`}><HorseG t={f} run={false} saddle={null} rein={false} /></g>;
          })}
        </svg>
      </div>
    </div>
  );
};
export const S7 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a14 = at("c4_19");
  const cross = sec(4.6);
  const huh = sec(3.8);
  const ex = lerp(f, 6, cross, 1480, 560);
  if (f < cross) {
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, cross, 1.15, 1.05)} cx={lerp(f, 0, cross, 1200, 900)} cy={600}>
          <Steppe time="night" horizon={560} />
          {/* 금나라 진영 (오른쪽) */}
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {[[1400, 640, 1], [1600, 620, 0.9], [1780, 650, 1.1], [1520, 720, 1.2], [1760, 760, 1.3]].map(([x, y, s], i) => <JinTentG key={i} x={x} y={y} s={s} lit={1} />)}
          </svg>
          <Glow x={1600} y={660} r={320} color="#f3a24e" op={0.35} />
          <Flag x={1380} y={700} banner="jin" h={210} />
          <Flag x={1860} y={700} banner="jin" h={210} />
          {/* 몽골 진영 (왼쪽, 멀리) */}
          {[[150, 640, 180], [360, 620, 150]].map(([x, y, w], i) => <Ger key={i} x={x} y={y} w={w} door="#3c3c50" lit={0.9} />)}
          <Tug x={480} y={660} h={260} sway={Math.sin(f / 14) * 4} />
          <Fire x={300} y={760} s={0.7} />
          {/* 금나라 장수: 군막에서 나와 빈자리를 보고 "어?" */}
          {f > huh - 30 && <Person L={JIN_GEN} x={1560} y={900} h={330} eyes={f > huh ? "wide" : "dot"} mouth={f > huh ? "o" : "flat"} arms={f > huh ? "up" : "down"} flip />}
          {f > huh + 4 && <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><text x={1600} y={520} fontSize={110} fontFamily="Baskerville, serif" fontWeight={700} fill={INK} transform={`rotate(10 1600 520)`}>?</text></svg>}
          {/* 사신: 소매에 지도를 품고 뒤를 흘끔거리며 왼쪽으로 */}
          <Person L={ENVOY} x={ex} y={930} h={340} arms="sleeves" eyes="side" flip={Math.floor(f / 26) % 3 !== 1} mouth="flat" sweat bob={walkBob(f, true)} step={f / 5} />
          <Dim op={0.15} />
        </Cam>
        <SFX name="wind" at={0} vol={0.25} dur={cross} />
      </AbsoluteFill>
    );
  }
  // c4_19 "저들은 아직 말을 먹이고 있습니다": 금나라 진영 땅 높이 짧은 컷 - 갑옷·투구를 벗어 두고 말에게 여물을 주는 병사들
  const rest = a14 + sec(2.3);
  if (f >= a14 && f < rest) {
    const t = f - a14;
    return (
      <AbsoluteFill>
        <Cam z={lerp(t, 0, rest - a14, 1.12, 1.2)} cx={960} cy={600}>
          <Steppe time="dusk" horizon={520} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {[[260, 560, 1], [560, 540, 0.8], [1500, 550, 0.9], [1760, 570, 1.1]].map(([x, y, sc], i) => <JinTentG key={i} x={x} y={y} s={sc} />)}
            {/* 벗어 둔 갑옷·투구·세워 둔 창 */}
            {[[700, 930], [1180, 950]].map(([x, y], i) => <g key={`a${i}`}><path d={`M ${x - 40} ${y} L ${x - 30} ${y - 60} L ${x + 30} ${y - 60} L ${x + 40} ${y} Z`} fill="#8f8a7e" stroke={INK} strokeWidth={4} />{[0, 1, 2].map((r) => <path key={r} d={`M ${x - 34} ${y - 46 + r * 16} L ${x + 34} ${y - 46 + r * 16}`} stroke={INK} strokeWidth={2} />)}<path d={`M ${x + 46} ${y} C ${x + 46} ${y - 40} ${x + 100} ${y - 40} ${x + 100} ${y} Z`} fill="#8f9597" stroke={INK} strokeWidth={4} /><path d={`M ${x + 73} ${y - 34} L ${x + 73} ${y - 52}`} stroke="#b8332a" strokeWidth={6} /></g>)}
            {[1320, 1345, 1370].map((x) => <path key={x} d={`M ${x} 900 L ${x + 30} 600`} stroke={INK} strokeWidth={7} />)}
            {/* 여물 더미 */}
            {[[520, 940], [1000, 950]].map(([x, y], i) => <g key={`h${i}`}><path d={`M ${x - 70} ${y} C ${x - 60} ${y - 50} ${x + 60} ${y - 50} ${x + 70} ${y} Z`} fill="#d9b85a" stroke={INK} strokeWidth={4} />{[-40, -10, 20, 45].map((dx) => <path key={dx} d={`M ${x + dx} ${y - 30} l 12 -16`} stroke="#a8862a" strokeWidth={4} />)}</g>)}
          </svg>
          <Flag x={420} y={560} banner="jin" h={190} />
          <Flag x={1650} y={570} banner="jin" h={190} />
          <Horse x={400} y={950} w={380} run={false} graze={1} saddle={null} />
          <Horse x={1140} y={960} w={400} run={false} graze={1} flip coat="#e8e0cc" dark="#c8bfa8" saddle={null} />
          <Person L={JIN_REST} x={700} y={990} h={300} arms="offer" eyes="shut" mouth="smile" bob={Math.abs(Math.sin(f / 9)) * 4}><path d="M 110 300 C 120 280 180 280 190 300 C 180 320 120 320 110 300 Z" fill="#d9b85a" stroke={INK} strokeWidth={4} /></Person>
          <Person L={JIN_REST} x={1420} y={1000} h={290} kneel arms="down" eyes="shut" mouth="o" flip />
          <Person L={JIN_REST} x={1700} y={980} h={280} arms="sleeves" eyes="sly" mouth="smile" />
        </Cam>
        <SFX name="neigh" at={0} vol={0.25} dur={40} />
      </AbsoluteFill>
    );
  }
  // 칭기즈칸 앞에서 지도를 펼침
  const unroll = lerp(f, cross + 6, cross + 30, 0, 1, true);
  const horses = 0;
  const now = a14 + sec(2.6);
  const z = f >= rest ? lerp(f, rest, rest + 20, 1.35, 1.15, true) : 1.05;
  const cx = f >= rest ? lerp(f, rest, rest + 20, 960, 700, true) : 960;
  const cy = f >= rest ? lerp(f, rest, rest + 20, 700, 560, true) : 600;
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={cy}>
        <Steppe time="night" horizon={540} />
        <Glow x={960} y={760} r={700} color="#f3c77e" op={0.35} />
        {[[180, 600, 240], [1720, 600, 220], [520, 560, 160]].map(([x, y, w], i) => <Ger key={i} x={x} y={y} w={w} door="#8a3b2c" lit={0.9} />)}
        <Tug x={720} y={620} h={330} sway={Math.sin(f / 14) * 4} />
        <Person L={MON} x={140} y={900} h={300} arms="hold"><Spear x={222} y={300} flag="#f2ead8" /></Person>
        <Person L={MON} x={1800} y={900} h={300} arms="hold" flip><Spear x={222} y={300} /></Person>
        <Char id="genghis" x={480} h={520} pose={f >= now ? "smug" : "front"} gesture={f >= now ? "fist" : undefined} gestureAt={now + 4} bottom={140} enter="none" beat={f > cross + 40 && f < a14 ? "nod" : "none"} beatAt={cross + 60} />
        {/* 땅에 펼친 지도 (두 사람 사이) */}
        <div style={{ position: "absolute", inset: 0, transform: `scaleX(${unroll})`, transformOrigin: "1060px 880px" }}>
          <MiniMap x={780} y={720} w={560} f={f} horses={horses} />
        </div>
        <Fire x={690} y={1050} s={0.5} />
        <Person L={ENVOY} x={1460} y={960} h={360} kneel arms={f >= a14 ? "point" : "offer"} flip mouth={talkingAt(f, a14, "c4_19") ? "talk" : "flat"} t={f} eyes={f >= a14 ? "dot" : "worry"} bow={f < a14 ? 0.25 : 0.1} />
      </Cam>
      <SFX name="map" at={cross + 6} vol={0.35} dur={40} />
      <SFX name="campfire" at={cross} vol={0.25} dur={frames - cross} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 8) c4_20~17 [분석 3] 기울인 지도: 흩어진 몽골 부대가 한 점(쐐기)으로 모임 → (땅 높이) 무칼리가 결사대 맨 앞에서 칼을 들고
//    금나라 방패 줄 한가운데로 돌격, 왼쪽 아래 → 오른쪽 위로 멀어지며 뚫음 → (지도) 쐐기가 줄 한가운데를 끊음, 앞뒤가 서로 돕지 못함(✕), 뒤가 꽉 막혀 짐
// =====================================================================
const MON_SPREAD = [[200, 170], [420, 110], [660, 190], [280, 380], [560, 420], [780, 330]];
const WEDGE = [[560, 300], [505, 262], [598, 252], [452, 222], [640, 206], [540, 236]];
const WS = [520, 280]; // 쐐기 출발점 (가운데 옆구리를 노림)
const CUT = 5; // 5번째 칸과 6번째 칸 사이를 끊음
// 무칼리 전용 그림: 달리는 말 위, 칼을 치켜든 몽골 장수 (투구 붉은 술, 비늘 갑옷)
const MuqaliRide = ({ x, y, w, raise, phase = 0 }: { x: number; y: number; w: number; raise: number; phase?: number }) => {
  const f = useCurrentFrame() + phase;
  return (
    <Horse x={x} y={y} w={w} phase={phase} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a">
      <RiderOn L={MUQALI} arms={raise > 0.5 ? "fist" : "hold"} eyes="angry" mouth={raise > 0.5 ? "grin" : "flat"} t={f}>
        {null}
      </RiderOn>
      {/* 칼: 판 좌표 손 위치 (RiderOn 변환과 같게) */}
      <Sabre x={-53 + (raise > 0.5 ? 232 : 222) * 0.62} y={-452 + (raise > 0.5 ? 104 : 300) * 0.62} rot={raise > 0.5 ? 10 : 70} s={0.7} />
      <path d="M -60 -250 L -120 -420" stroke={INK} strokeWidth={6} />
      <path d={`M -120 -420 L ${-40 + Math.sin(f / 4) * 8} -400 L -112 -380 Z`} fill="#f2ead8" stroke={INK} strokeWidth={4} />
    </Horse>
  );
};
const S8 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a16 = at("c4_21");
  const a17 = at("c4_22");
  const gather = lerp(f, 8, a16 - 20, 0, 1, true);
  if (f < a16) {
    return (
      <AbsoluteFill>
        <Tilt deg={25} oy="30%">
          <Cam z={lerp(f, 0, a16, 1.35, 1.5)} cx={660} cy={330}>
            <PassBase />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              {JIN_T.map((t, i) => { const p = roadAt(t); return <UnitG key={i} x={p.x} y={p.y} a={p.a} />; })}
              {MON_SPREAD.map(([x, y], i) => {
                const [wx, wy] = WEDGE[i];
                return <UnitG key={i} x={x + (wx - x) * gather} y={y + (wy - y) * gather} a={25 + 50 * (1 - gather)} c="#4d6b8a" flag="mon" s={0.8} />;
              })}
              {gather > 0.9 && <path d="M 400 150 L 600 320 L 380 330" stroke="#4d6b8a" strokeWidth={14} fill="none" opacity={lerp(gather, 0.9, 1, 0, 0.6)} strokeLinejoin="round" />}
            </svg>
          </Cam>
        </Tilt>
        <SFX name="war_drums" at={0} vol={0.3} dur={a16} />
      </AbsoluteFill>
    );
  }
  if (f < a17) {
    // 땅 높이: 무칼리 돌격 (왼쪽 아래 → 오른쪽 위로 멀어지며)
    const t = f - a16;
    const raiseAt = sec(2.7);
    const hit = sec(5.3);
    const p = lerp(t, 0, hit, 0, 1);
    const mx = lerp(p, 0, 1, -200, 1060);
    const my = lerp(p, 0, 1, 1180, 790);
    const mw = lerp(p, 0, 1, 760, 420);
    const broke = t >= hit;
    const after = t - hit;
    const sh = shake(t, hit, 9, 50);
    const cam = Math.min(1, p);
    return (
      <AbsoluteFill>
        <Cam z={1.2} cx={lerp(cam, 0, 1, 700, 1150)} cy={lerp(cam, 0, 1, 700, 560)} sx={sh.x} sy={sh.y}>
          <Steppe time="day" horizon={420} hills={false} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <Crag d="M -20 430 L 200 220 L 420 300 L 560 180 L 760 430 Z" />
            <Crag d="M 1160 430 L 1400 160 L 1600 260 L 1760 140 L 1940 260 L 1940 430 Z" />
          </svg>
          {/* 금나라 방패 줄 (가운데가 터져 나감) */}
          {Array.from({ length: 11 }).map((_, i) => {
            const x = 700 + i * 90;
            const mid = Math.abs(i - 5) <= 1;
            const side = i < 5 ? -1 : 1;
            const fly = broke && mid ? Math.min(1, after / 16) : 0;
            const push = broke && !mid ? Math.min(1, after / 20) * (6 - Math.abs(i - 5)) * 14 : 0;
            return (
              <React.Fragment key={i}>
                {fly > 0 && <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}><ellipse cx={x + side * 30} cy={606} rx={34} ry={12} fill="#8a2a22" stroke={INK} strokeWidth={4} /><path d={`M ${x - 60} 612 L ${x + 70} 600`} stroke={INK} strokeWidth={5} /></svg>}
                <Person L={JIN_SOL} x={x + side * (fly * 150 + push)} y={600 - Math.sin(fly * Math.PI) * 50 + fly * 20} h={190} rot={-side * fly * 14} kneel={fly > 0.6} eyes={t > hit - 30 ? "wide" : "dot"} mouth={t > hit - 30 ? "o" : "flat"} arms={fly > 0.2 ? "up" : "hold"} flip={i < 5}>
                  {fly === 0 && <Spear x={222} y={300} len={460} />}
                  {fly === 0 && <ellipse cx={170} cy={280} rx={46} ry={70} fill="#8a2a22" stroke={INK} strokeWidth={5} />}
                </Person>
              </React.Fragment>
            );
          })}
          <Flag x={1150} y={560} banner="jin" h={200} fall={broke ? Math.min(1, after / 20) : 0} />
          {/* 결사대 (무칼리 뒤 쐐기) */}
          {[1, 2, 3, 4].map((i) => {
            const pp = lerp(t, i * 6, hit + i * 6, 0, 1);
            const off = (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 120;
            const w = lerp(pp, 0, 1, 600, 330);
            return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={lerp(pp, 0, 1, -360, 900) - Math.ceil(i / 2) * 140 - w / 2} y={lerp(pp, 0, 1, 1020, 640) + off * 0.4 - w * 0.775} w={w} phase={i * 3} />;
          })}
          <MuqaliRide x={broke ? mx + after * 9 : mx} y={broke ? my - after * 4 : my} w={broke ? Math.max(260, mw - after * 4) : mw} raise={lerp(t, raiseAt, raiseAt + 8, 0, 1)} />
          <Dust x={1160} y={620} t={lerp(after, 0, 40, 0, 1)} r={180} />
        </Cam>
        <SFX name="gallop" at={a16} vol={0.4} dur={sec(5.5)} />
        <SFX name="war_cry" at={a16 + raiseAt} vol={0.35} dur={60} />
        <SFX name="shield" at={a16 + hit} vol={0.4} dur={40} />
      </AbsoluteFill>
    );
  }
  // 지도: 끊긴 가운데
  const t = f - a17;
  const pierce = lerp(t, 0, 40, 0, 1, true);
  const gap = lerp(t, 10, 50, 0, 1, true);
  const help = lerp(t, sec(4.4), sec(5.2), 0, 1, true);
  const jam = lerp(t, sec(7.0), sec(8.4), 0, 1, true);
  const cut = roadAt((JIN_T[CUT - 1] + JIN_T[CUT]) / 2);
  const wedgeTip = { x: WS[0] + (cut.x - 40 - WS[0]) * pierce, y: WS[1] + (cut.y - 20 - WS[1]) * pierce };
  return (
    <AbsoluteFill>
      <Cam z={lerp(t, 0, frames - (a17), 1.15, 1.3)} cx={cut.x} cy={cut.y}>
        <PassBase />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {JIN_T.map((tt, i) => {
            const front = i < CUT;
            const p = roadAt(tt);
            // 가운데에서 갈라짐: 앞은 위로, 뒤는 아래로 밀림
            const push = gap * (front ? -1 : 1) * 75;
            const q = roadAt(tt + push / ROADLEN);
            // 뒤는 꽉 막힘: 서로 겹치며 몰림
            const j = !front ? jam * (i - CUT) * 0.018 : 0;
            const r = roadAt(tt - j + push / ROADLEN);
            const pp = front ? q : r;
            const wob = !front ? Math.sin(f / 2.5 + i) * 3 * jam : 0;
            return <UnitG key={i} x={pp.x + wob} y={pp.y} a={p.a + wob * 4} s={1.25} />;
          })}
          {/* 쐐기 (몽골) 화살 */}
          <path d={`M ${WS[0]} ${WS[1]} L ${wedgeTip.x} ${wedgeTip.y}`} stroke={INK} strokeWidth={56} strokeLinecap="round" />
          <path d={`M ${WS[0]} ${WS[1]} L ${wedgeTip.x} ${wedgeTip.y}`} stroke="#4d6b8a" strokeWidth={42} strokeLinecap="round" />
          <g transform={`translate(${wedgeTip.x} ${wedgeTip.y}) rotate(${(Math.atan2(cut.y - 20 - WS[1], cut.x - 40 - WS[0]) * 180) / Math.PI})`}>
            <path d="M -10 -50 L 70 0 L -10 50 Z" fill="#4d6b8a" stroke={INK} strokeWidth={7} />
          </g>
          {/* 앞·뒤가 서로 도우려는 화살 → 막힘 ✕ */}
          {help > 0 && [-1, 1].map((k) => {
            const a = roadAt(k < 0 ? JIN_T[CUT - 2] : JIN_T[CUT + 1]);
            const mx = cut.x + (a.x - cut.x) * (1 - help * 0.6);
            const my = cut.y + (a.y - cut.y) * (1 - help * 0.6);
            return (
              <g key={k}>
                <path d={`M ${a.x + 60} ${a.y} Q ${a.x + 140} ${(a.y + cut.y) / 2} ${mx + 70} ${my}`} stroke="#a8432e" strokeWidth={16} fill="none" strokeDasharray="22 12" />
                {help > 0.8 && <path d={`M ${mx + 40} ${my - 30} L ${mx + 100} ${my + 30} M ${mx + 100} ${my - 30} L ${mx + 40} ${my + 30}`} stroke={INK} strokeWidth={16} strokeLinecap="round" />}
              </g>
            );
          })}
          {/* 뒤쪽이 꽉 막힘: 압박 선 */}
          {jam > 0 && JIN_T.slice(CUT + 1, CUT + 5).map((tt, i) => { const p = roadAt(tt - jam * (i + 1) * 0.018); return <path key={i} d={`M ${p.x - 70} ${p.y - 40} l 20 10 M ${p.x + 70} ${p.y - 40} l -20 10`} stroke={INK} strokeWidth={6} opacity={jam} />; })}
        </svg>
      </Cam>
      <SFX name="impact" at={a17 + 30} vol={0.3} dur={30} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 9) c4_23 [분석 4] 기울인 지도: 무너진 부대가 수많은 점으로 흩어져 좁은 길(남쪽)로 몰리며 서로 엉킴, 파란 기병 화살이 뒤를 쫓음
//    → (땅 높이, 노을, 천천히) 멀리까지 이어진 산길 위에 쓰러진 금나라 깃발·투구·부러진 창 - 사람 몸은 그리지 않음
// =====================================================================
const S9 = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const ground = sec(4.3);
  const chaseEnd = sec(7.1);
  if (f < ground) {
    const run = lerp(f, 0, ground, 0, 1);
    const tangle = lerp(f, sec(3.2), sec(5.0), 0, 1, true);
    const neck = roadAt(0.86);
    return (
      <AbsoluteFill>
        <Tilt deg={30}>
          <Cam z={lerp(f, 0, ground, 1.2, 1.45)} cx={lerp(f, 0, ground, 1050, neck.x)} cy={lerp(f, 0, ground, 620, neck.y - 40)}>
            <PassBase />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              {Array.from({ length: 110 }).map((_, i) => {
                const t0 = 0.3 + ((i * 37) % 60) / 100;
                const tt = Math.min(0.97, t0 + run * (0.25 + (i % 7) * 0.03));
                const p = roadAt(tt);
                const crowd = Math.max(0, 1 - Math.abs(tt - 0.86) * 8);
                const spread = 26 * (1 - crowd * 0.6);
                const ox = Math.sin(i * 12.9) * spread + Math.sin(f / 3 + i) * 4 * tangle * crowd;
                const oy = Math.cos(i * 7.3) * spread;
                const fall = crowd > 0.5 && i % 3 === 0 && tangle > 0.3;
                return fall ? <ellipse key={i} cx={p.x + ox} cy={p.y + oy} rx={10} ry={5} fill="#6a2a1e" opacity={0.8} /> : <circle key={i} cx={p.x + ox} cy={p.y + oy} r={8} fill="#a8432e" stroke={INK} strokeWidth={2} />;
              })}
              {[0, 1, 2].map((i) => {
                const p = roadAt(Math.min(0.8, 0.2 + run * 0.55 - i * 0.05));
                return <g key={`m${i}`} transform={`translate(${p.x + (i - 1) * 40} ${p.y}) rotate(${p.a})`}><path d="M -40 -14 L 30 0 L -40 14 Z" fill="#4d6b8a" stroke={INK} strokeWidth={5} /></g>;
              })}
              {tangle > 0 && <circle cx={neck.x} cy={neck.y} r={70 + Math.sin(f / 4) * 6} fill="none" stroke="#b8332a" strokeWidth={6} strokeDasharray="12 10" opacity={tangle * 0.7} />}
            </svg>
          </Cam>
        </Tilt>
        <SFX name="battle_far" at={0} vol={0.35} dur={ground} />
      </AbsoluteFill>
    );
  }
  if (f < chaseEnd) {
    // 땅 높이 협곡: 달아나는 금나라 병사들이 서로 밀치고 넘어지며 짓밟힘, 몽골 기병이 끝까지 쫓아 칼을 내리치는 순간 → 검게 끊음 (피 없이)
    const c = f - ground;
    const raise = 22;
    const strike = 56;
    const black = strike + 4;
    const rx = lerp(c, 0, strike, 1900, 1080);
    const swing = lerp(c, strike - 8, strike, 0, 1);
    const sh = shake(c, strike, 6, 20);
    return (
      <AbsoluteFill>
        <Cam z={lerp(c, 0, black, 1.05, 1.2)} cx={lerp(c, 0, black, 900, 1000)} cy={600} sx={sh.x} sy={sh.y}>
          <Steppe time="dusk" horizon={460} hills={false} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <Crag d="M -20 1100 L -20 160 L 260 220 L 520 380 L 640 470 L 560 1100 Z" c="#7d6a50" shade="#5a4a38" />
            <Crag d="M 1940 1100 L 1940 180 L 1680 230 L 1440 380 L 1300 470 L 1460 1100 Z" c="#7d6a50" shade="#5a4a38" />
            <path d="M 640 470 L 1300 470 L 1460 1100 L 560 1100 Z" fill="#b89a6a" stroke={INK} strokeWidth={4} />
          </svg>
          {/* 넘어져 짓밟힌 병사들 (엎어진 몸, 피 없이) */}
          {[[820, 900, 90], [1120, 960, -90], [960, 820, 90]].map(([x, y, r], i) => <Person key={`d${i}`} L={JIN_SOL} x={x} y={y} h={200} rot={r} eyes="shut" mouth="flat" arms="down" />)}
          {/* 달아나는 병사들: 왼쪽 앞으로, 서로 부딪치며 */}
          {[[1200, 880, 0], [1350, 930, 6], [1000, 1000, 12], [1450, 860, 3], [1150, 1040, 9]].map(([x0, y, d], i) => {
            const x = x0 - (c + d) * 7;
            const stumble = i === 2 && c > 30;
            return <Person key={i} L={JIN_SOL} x={x} y={y} h={230} arms="up" eyes="wide" mouth="o" flip rot={stumble ? -lerp(c, 30, 44, 0, 70) : Math.sin((f + i * 4) / 3) * 4} bob={stumble ? 0 : walkBob(f + i * 3, true)} step={f / 3} />;
          })}
          {/* 쫓기는 마지막 병사 + 쫓는 몽골 기병 */}
          <Person L={JIN_SOL} x={lerp(c, 0, strike, 1560, 940)} y={1000} h={240} arms="up" eyes="wide" mouth="o" flip rot={-6} bob={walkBob(f, true)} step={f / 3} />
          <Horse x={rx + 140} y={1040} w={560} flip coat="#6a5a4a" dark="#4a3e34" mane="#1e1712" saddle="#8a3b2c">
            <RiderOn L={MON} arms="fist" eyes="angry" mouth="flat" t={f} />
            <Sabre x={-53 + 232 * 0.62} y={-452 + 104 * 0.62} rot={lerp(c, 0, raise, 60, 0) + swing * 120} s={0.8} />
          </Horse>
        </Cam>
        {/* 칼이 내려치는 순간부터 10프레임에 걸쳐 검게 (2026-10-27 빠른 전환 하네스: 뚝 끊고 1초 뒤 다음 장면이라 급했음) */}
        <AbsoluteFill style={{ background: "#000", opacity: lerp(c, strike - 2, black + 6, 0, 1) }} />
        <SFX name="gallop" at={ground} vol={0.4} dur={black} />
        <SFX name="sword" at={ground + strike - 6} vol={0.45} dur={30} />
        <SFX name="hit" at={ground + black} vol={0.35} dur={20} />
      </AbsoluteFill>
    );
  }
  // 땅 높이: 끝없이 이어진 길 위의 쓰러진 금나라 병사·깃발·투구, 멀리 계속 쫓는 몽골 기병 (천천히 앞으로)
  const g = f - chaseEnd;
  const z = lerp(g, 0, frames - chaseEnd, 1.0, 1.18);
  const bodies = Array.from({ length: 14 }).map((_, i) => {
    const d = (i + 0.5) / 14;
    const t = 1 - Math.pow(d, 0.7);
    const half = 40 + t * 250;
    const side = ((i * 5) % 7) / 6 - 0.5;
    return { x: 960 + side * half * 1.4 + 30 * t, y: 550 + t * 520, h: 30 + t * 230, r: i % 2 ? 90 : -90 };
  });
  const items = Array.from({ length: 34 }).map((_, i) => {
    const d = i / 34; // 0 가까이 → 1 멀리
    const t = 1 - Math.pow(d, 0.7); // 길 위 깊이 (1 = 가까이)
    const y = 550 + t * 520;
    const half = 40 + t * 250; // 길 반폭 (길 밖 비탈엔 안 놓음)
    const side = ((i * 7) % 5) / 4 - 0.5;
    return { x: 960 + side * half * 1.5 + 30 * t, y, k: 0.25 + t * 1.25, kind: i % 3, rot: ((i * 53) % 70) - 35 };
  });
  return (
    <AbsoluteFill style={{ opacity: lerp(g, 0, 22, 0, 1) }}>
      <Cam z={z} cx={960} cy={560}>
        <Steppe time="dusk" horizon={540} hills={false} />
        {/* 멀리 길 끝까지 계속 쫓는 몽골 기병 (실루엣) */}
        {[0, 1, 2].map((i) => { const u = Math.min(1, g / 160 + i * 0.12); return <Rider key={`m${i}`} kind="mongol" x={960 - 40 + (i - 1) * 30 * (1 - u) - 60 * (1 - u)} y={560 - 40 * (1 - u) - 90 * (1 - u)} w={40 + 80 * (1 - u)} dark flip={i % 2 === 1} phase={i * 4} />; })}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <Crag d="M -20 1100 L -20 220 L 300 260 L 520 330 L 800 520 L 920 540 L 700 1100 Z" c="#7d6a50" shade="#5a4a38" />
          <Crag d="M 1940 1100 L 1940 200 L 1600 270 L 1360 340 L 1080 520 L 1000 540 L 1260 1100 Z" c="#7d6a50" shade="#5a4a38" />
          <path d="M 920 540 L 1000 540 L 1260 1100 L 700 1100 Z" fill="#b89a6a" stroke={INK} strokeWidth={4} />
          {items.map((it, i) => (
            <g key={i} transform={`translate(${it.x} ${it.y}) scale(${it.k}) rotate(${it.rot})`}>
              {it.kind === 0 && <g><path d="M -60 0 L 60 -8" stroke={INK} strokeWidth={8} /><path d="M 30 -8 L 30 -50 L 70 -50 L 70 -10 Z" fill="#8a2a22" stroke="#c9a24a" strokeWidth={4} /></g>}
              {it.kind === 1 && <path d="M -22 0 C -22 -30 22 -30 22 0 Z" fill="#8f9597" stroke={INK} strokeWidth={4} />}
              {it.kind === 2 && <path d="M -50 0 L 10 -6 M 20 -6 L 56 -20" stroke={INK} strokeWidth={7} />}
            </g>
          ))}
        </svg>
        {bodies.slice().reverse().map((b, i) => <Person key={`b${i}`} L={JIN_SOL} x={b.x} y={b.y} h={b.h} rot={b.r} eyes="shut" mouth="flat" arms="down" />)}
        {/* 까마귀 */}
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {[0, 1, 2].map((i) => {
            const a = g / 30 + i * 2.1;
            const x = 960 + Math.cos(a) * (180 + i * 60);
            const y = 260 + Math.sin(a) * 50;
            const w = Math.sin(g / 3 + i) * 10;
            return <path key={i} d={`M ${x - 24} ${y - w} Q ${x - 10} ${y - 4} ${x} ${y} Q ${x + 10} ${y - 4} ${x + 24} ${y - w}`} stroke="#1d1612" strokeWidth={5} fill="none" />;
          })}
        </svg>
        <Glow x={1400} y={400} r={500} color="#f0a865" op={0.3} />
      </Cam>
      <SFX name="wind" at={chaseEnd} vol={0.35} dur={frames - chaseEnd} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 10) c4_24~24 정리: 네 칸 아이콘이 한 줄씩 쌓임 (글자 없이) ① 좁은 땅 ② 정보(눈 + 펼친 지도) ③ 한 곳에 집중(작은 화살들 → 큰 화살이 줄을 끊음) ④ 끝까지 추격
//     → c4_29 네 칸이 위로 모여 작은 문장(紋章)이 되고, 아래 서쪽으로 뻗는 길 위에 차례로 찍힘 ("앞으로도 계속")
// =====================================================================
const Card = ({ x, y, s = 1, show, children }: { x: number; y: number; s?: number; show: number; children: React.ReactNode }) => (
  <g transform={`translate(${x} ${y + (1 - show) * 80}) scale(${s})`} opacity={show}>
    <rect x={-180} y={-180} width={360} height={360} rx={18} fill="#efe2c4" stroke={INK} strokeWidth={8} />
    <rect x={-166} y={-166} width={332} height={332} rx={12} fill="none" stroke="#a8905a" strokeWidth={3} />
    {children}
  </g>
);
const IconNarrow = ({ k }: { k: number }) => (
  <g>
    <path d="M -170 160 L -170 -40 L -110 -120 L -60 -60 L -30 -100 L -26 160 Z" fill="#b2a284" stroke={INK} strokeWidth={5} />
    <path d="M 170 160 L 170 -30 L 110 -130 L 70 -70 L 30 -100 L 26 160 Z" fill="#b2a284" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={-14 + (i % 3) * 14 + Math.sin(k * 6 + i) * 2} cy={20 + Math.floor(i / 3) * 26 + (1 - k) * 30} r={10} fill="#a8432e" stroke={INK} strokeWidth={3} />)}
    {[0, 1, 2].map((i) => <circle key={`b${i}`} cx={-14 + i * 14} cy={-60} r={10} fill="#4d6b8a" stroke={INK} strokeWidth={3} />)}
    <CrossSwords x={0} y={-24} s={0.5 * k} />
  </g>
);
const IconInfo = ({ k, f }: { k: number; f: number }) => {
  const open = Math.min(1, k * 1.5) * ((f % 90) < 4 ? 0.1 : 1);
  return (
    <g>
      <path d="M -130 40 L 130 40 L 150 150 L -150 150 Z" fill="#f2ead8" stroke={INK} strokeWidth={5} />
      <path d="M -100 120 C -40 90 20 110 100 60" stroke="#a8905a" strokeWidth={8} fill="none" />
      {[-70, -20, 30].map((x, i) => <rect key={i} x={x} y={100 - i * 16} width={30} height={16} fill="#a8432e" stroke={INK} strokeWidth={3} />)}
      <path d={`M -110 -60 Q 0 ${-60 - 70 * open} 110 -60 Q 0 ${-60 + 70 * open} -110 -60 Z`} fill="#fbf6ea" stroke={INK} strokeWidth={7} />
      <circle cx={0} cy={-60} r={34 * open} fill="#4d6b8a" stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-60} r={14 * open} fill={INK} />
    </g>
  );
};
const IconFocus = ({ k }: { k: number }) => {
  const m = Math.min(1, k * 1.6);
  const brk = lerp(k, 0.6, 1, 0, 1);
  return (
    <g>
      <path d={`M -150 70 L ${-20 - brk * 30} 70 M ${20 + brk * 30} 70 L 150 70`} stroke="#a8432e" strokeWidth={22} strokeLinecap="round" />
      {[-120, -60, 0, 60, 120].map((sx, i) => {
        const x = sx * (1 - m);
        const y = -130 + m * 60;
        return <path key={i} d={`M ${x} ${y - 30} L ${x} ${y + 10}`} stroke="#4d6b8a" strokeWidth={14} strokeLinecap="round" opacity={1 - m * 0.8} />;
      })}
      <path d={`M 0 -110 L 0 ${-40 + brk * 120}`} stroke={INK} strokeWidth={40} strokeLinecap="round" opacity={m} />
      <path d={`M 0 -110 L 0 ${-40 + brk * 120}`} stroke="#4d6b8a" strokeWidth={28} strokeLinecap="round" opacity={m} />
      <path d={`M -40 ${-50 + brk * 120} L 0 ${10 + brk * 120} L 40 ${-50 + brk * 120} Z`} fill="#4d6b8a" stroke={INK} strokeWidth={6} opacity={m} />
    </g>
  );
};
const IconChase = ({ k, f }: { k: number; f: number }) => (
  <g>
    <path d="M -170 120 L 170 120" stroke="#a8905a" strokeWidth={6} />
    {[0, 1, 2].map((i) => {
      const x = -40 + i * 60 + k * 40;
      const down = k > 0.7 && i === 0;
      return down ? <ellipse key={i} cx={x} cy={110} rx={18} ry={8} fill="#a8432e" stroke={INK} strokeWidth={3} /> : <g key={i} transform={`translate(${x} ${100 - Math.abs(Math.sin(f / 4 + i)) * 10})`}><circle r={14} fill="#a8432e" stroke={INK} strokeWidth={3} /></g>;
    })}
    <g transform={`translate(${-130 + k * 120} 120) scale(0.32)`}><HorseG t={f} saddle="#8a3b2c"><RiderOn L={MON} arms="fist" eyes="angry" t={f} /></HorseG></g>
  </g>
);
const CARD_X = [300, 740, 1180, 1620];
const Icons = ({ ks, f }: { ks: number[]; f: number }) => (
  <>
    <Card x={CARD_X[0]} y={520} show={Math.min(1, ks[0] * 3)}><IconNarrow k={ks[0]} /></Card>
    <Card x={CARD_X[1]} y={520} show={Math.min(1, ks[1] * 3)}><IconInfo k={ks[1]} f={f} /></Card>
    <Card x={CARD_X[2]} y={520} show={Math.min(1, ks[2] * 3)}><IconFocus k={ks[2]} /></Card>
    <Card x={CARD_X[3]} y={520} show={Math.min(1, ks[3] * 3)}><IconChase k={ks[3]} f={f} /></Card>
  </>
);
const S10 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const A = ["c4_25", "c4_26", "c4_27", "c4_28"].map(at);
  const a24 = at("c4_29");
  const ks = A.map((a) => lerp(f, a + 4, a + 60, 0, 1));
  const gather = lerp(f, a24, a24 + 30, 0, 1, true);
  const stamps = [0, 1, 2].map((i) => lerp(f, a24 + 34 + i * 16, a24 + 44 + i * 16, 0, 1, true));
  const slots = lerp(f, 0, 20, 0, 1);
  return (
    <AbsoluteFill>
      <Paper />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {/* 빈 칸 네 자리 */}
        {CARD_X.map((x, i) => <rect key={i} x={x - 180} y={340} width={360} height={360} rx={18} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="14 12" opacity={slots * 0.4 * (1 - gather)} />)}
        <g transform={`translate(${480 * gather} ${40 * gather}) scale(${1 - gather * 0.5})`}>
          <Icons ks={ks} f={f} />
        </g>
        {/* 앞으로: 서쪽으로 뻗는 길 + 찍히는 문장 */}
        {gather > 0 && (
          <g opacity={gather}>
            {/* 대충 그린 넓은 땅 (동쪽 끝 = 몽골) */}
            <path d="M 40 820 L 90 700 L 180 690 L 230 610 L 330 640 L 420 600 L 560 630 L 700 580 L 860 610 L 1000 560 L 1180 590 L 1320 550 L 1480 580 L 1600 560 L 1760 600 L 1880 680 L 1860 800 L 1760 880 L 1600 900 L 1480 960 L 1300 930 L 1120 980 L 980 940 L 820 970 L 640 930 L 480 980 L 320 930 L 180 950 L 80 900 Z" fill="#d8c69c" stroke={INK} strokeWidth={5} opacity={0.6} />
            <path d="M 1640 700 C 1720 680 1820 700 1840 760 C 1820 820 1720 830 1650 810 C 1610 780 1610 720 1640 700 Z" fill="#4d6b8a" stroke={INK} strokeWidth={5} opacity={0.85} />
            <path d="M 1800 820 C 1500 760 1200 860 900 800 C 600 740 360 820 120 780" stroke={INK} strokeWidth={10} fill="none" strokeDasharray={`${gather * 2000} 3000`} />
            {[[1450, 790], [900, 800], [380, 790]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y - 10}) scale(${0.16 * stamps[i]}) translate(-960 -520)`} opacity={stamps[i]}>
                <Icons ks={[1, 1, 1, 1]} f={f} />
              </g>
            ))}
            <path d="M 150 760 L 100 782 L 150 806" stroke={INK} strokeWidth={10} fill="none" strokeLinejoin="round" />
          </g>
        )}
      </svg>
      {A.map((a, i) => <SFX key={i} name="drum" at={a + 2} vol={0.3} dur={30} />)}
      {[0, 1, 2].map((i) => <SFX key={`s${i}`} name="hit" at={a24 + 34 + i * 16} vol={0.25} dur={20} />)}
    </AbsoluteFill>
  );
};

// =====================================================================
// 11) c4_30~26 금나라 궁궐: 겁먹은 황제(땀)가 공주·말·비단 수레를 몽골 쪽(왼쪽)으로 보냄 → "몇 달 뒤에는…" 밤,
//     같은 궁궐에서 보따리를 진 황제가 짐 수레에 올라 남쪽(아래 오른쪽)으로 살금살금 → 칭기즈칸(진영·호위병) "응?" 😏
// =====================================================================
// 궁궐 지붕 (금빛/회색 기와): (x,y) = 몸채 아래 가운데, w 너비
export const HallG = ({ x, y, w, gold = true, burn = 0 }: { x: number; y: number; w: number; gold?: boolean; burn?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${w / 400})`}>
    <path d="M -150 0 L -150 -70 L 150 -70 L 150 0 Z" fill="#a8332a" stroke={INK} strokeWidth={6} />
    {[-110, -40, 40, 110].map((px) => <path key={px} d={`M ${px} 0 L ${px} -70`} stroke="#6a1f18" strokeWidth={10} />)}
    <path d="M -210 -64 C -120 -84 120 -84 210 -64 L 150 -130 L -150 -130 Z" fill={gold ? "#d9a93a" : "#4a4440"} stroke={INK} strokeWidth={6} />
    <path d="M -150 -130 L 150 -130 L 110 -160 L -110 -160 Z" fill={gold ? "#c9962a" : "#3a3430"} stroke={INK} strokeWidth={5} />
    <path d="M -210 -64 C -224 -70 -230 -84 -226 -96 M 210 -64 C 224 -70 230 -84 226 -96" stroke={INK} strokeWidth={6} fill="none" />
    {burn > 0 && <path d="M -140 -70 L 140 -70 L 140 -10 L -140 -10 Z" fill="#ffb24a" opacity={0.45 * burn} />}
  </g>
);
// 웅장한 중도: 안쪽 궁궐 지붕들 → 안 성벽 → 바깥 큰 성벽(문루 셋·모서리 망루) → 해자·다리 → 성 밖 마을
export const ZhongduG = ({ burn = 0 }: { burn?: number }) => (
  <g>
    {[[560, 300, 260], [760, 280, 320], [960, 250, 480], [1160, 280, 320], [1360, 300, 260], [660, 340, 200], [1260, 340, 200]].map(([x, y, w], i) => <HallG key={i} x={x} y={y} w={w} burn={burn} />)}
    <path d="M 960 120 L 940 250 L 980 250 Z" fill="#c9962a" stroke={INK} strokeWidth={4} />
    <WallG x0={440} x1={1480} top={350} base={410} c="#b8a684" />
    <GateTowerG x={960} y={350} s={0.55} burn={burn} />
    <WallG x0={-20} x1={1940} top={450} base={620} c="#b5a17e" />
    {[[360, 0.85], [960, 1.15], [1560, 0.85]].map(([x, s], i) => <GateTowerG key={i} x={x} y={450} s={s} burn={burn} />)}
    {[60, 1860].map((x) => <g key={x}><rect x={x - 60} y={380} width={120} height={80} fill="#b5a17e" stroke={INK} strokeWidth={5} /><path d={`M ${x - 80} 386 C ${x - 30} 370 ${x + 30} 370 ${x + 80} 386 L ${x + 50} 350 L ${x - 50} 350 Z`} fill="#4a4440" stroke={INK} strokeWidth={5} /></g>)}
    {[360, 960, 1560].map((x, i) => <path key={i} d={`M ${x - (i === 1 ? 60 : 44)} 620 L ${x - (i === 1 ? 60 : 44)} 545 C ${x - (i === 1 ? 60 : 44)} 505 ${x + (i === 1 ? 60 : 44)} 505 ${x + (i === 1 ? 60 : 44)} 545 L ${x + (i === 1 ? 60 : 44)} 620 Z`} fill="#3a2a1e" stroke={INK} strokeWidth={5} />)}
    <path d="M -20 628 L 1940 628 L 1940 660 L -20 660 Z" fill="#6f93a8" stroke={INK} strokeWidth={4} />
    <path d="M 900 620 L 1020 620 L 1040 664 L 880 664 Z" fill="#9a8a6a" stroke={INK} strokeWidth={4} />
    {burn === 0 && [[160, 760, 2.4], [420, 730, 2.0], [620, 790, 2.6], [1320, 790, 2.6], [1520, 730, 2.0], [1780, 760, 2.4], [260, 900, 3.0], [1660, 900, 3.0]].map(([x, y, k], i) => <House key={`h${i}`} x={x} y={y} k={k} />)}
  </g>
);
// 가마: 상자 + 금빛 지붕 + 창으로 내다보는 황제, 앞뒤 가마꾼
const Palanquin = ({ x, y, k, f }: { x: number; y: number; k: number; f: number }) => {
  const bob = Math.abs(Math.sin(f / 5)) * 6 * k;
  return (
    <>
      <Person L={PORTER} x={x - 150 * k} y={y} h={240 * k} arms="offer" eyes="worry" step={f / 5} bob={bob} />
      <svg width={360 * k} height={300 * k} viewBox="-180 -280 360 300" style={{ position: "absolute", left: x - 180 * k, top: y - 160 * k - 280 * k - bob, ...ink }}>
        <path d="M -200 -40 L 200 -40" stroke={INK} strokeWidth={14} />
        <path d="M -200 -40 L 200 -40" stroke="#7a5230" strokeWidth={8} />
        <rect x={-100} y={-190} width={200} height={170} fill="#a8332a" stroke={INK} strokeWidth={6} />
        <rect x={-60} y={-160} width={120} height={80} fill="#2a1e16" stroke={INK} strokeWidth={5} />
        <g transform="translate(-48 -176) scale(0.32)"><PersonG L={EMPEROR} half eyes="side" sweat t={f} /></g>
        <path d="M -130 -186 C -60 -206 60 -206 130 -186 L 80 -250 L -80 -250 Z" fill="#d9a93a" stroke={INK} strokeWidth={6} />
        <circle cx={0} cy={-258} r={12} fill="#e0b64a" stroke={INK} strokeWidth={4} />
      </svg>
      <Person L={PORTER} x={x + 150 * k} y={y} h={240 * k} arms="offer" eyes="worry" flip step={f / 5 + 2} bob={bob} />
    </>
  );
};
// 남쪽으로 지평선 끝까지 이어진 도망 행렬 (u 0 = 성문 앞, 1 = 지평선)
const routeAt = (u: number) => {
  const a = [420, 840], b = [1150, 760], c = [1560, 380];
  const x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0];
  const y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1];
  return { x, y, k: Math.max(0.05, 1 - u * 0.95) };
};
const S11 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a26 = at("c4_31");
  const give = sec(1.6);
  const later = sec(4.6);
  if (f < later) {
    const g = lerp(f, give, later - 6, 0, 1);
    const road = (u: number) => ({ x: 960 - 700 * u, y: 690 + 330 * u, k: 0.35 + 0.65 * u });
    const walkers = [0, 1, 2, 3, 4];
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, give, 1.5, 1.0, true)} cx={lerp(f, 0, give, 1080, 960, true)} cy={lerp(f, 0, give, 420, 540, true)}>
          <Steppe time="day" horizon={330} hills={false} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <ZhongduG />
            <path d="M 900 664 C 800 760 500 900 200 1100 L 520 1100 C 700 900 960 760 1020 664 Z" fill="#c9b07c" stroke={INK} strokeWidth={4} />
          </svg>
          {[[300, 450], [1620, 450]].map(([x, y], i) => <Flag key={i} x={x} y={y} banner="jin" h={160} />)}
          {/* 성문 위 황제·관리 (겁먹음) */}
          <Person L={OFFICIAL} x={1110} y={452} h={110} arms="sleeves" eyes="worry" />
          <Person L={EMPEROR} x={1180} y={452} h={130} arms="sleeves" eyes="worry" mouth="wobble" t={f} sweat />
          {/* 공물 행렬: 문에서 길을 따라 왼쪽 아래 몽골 쪽으로 */}
          {walkers.map((i) => {
            const u = Math.max(0, Math.min(1, g * 1.2 - i * 0.12));
            const p = road(u);
            if (g * 1.2 - i * 0.12 <= 0) return null;
            const moving = u > 0 && u < 1;
            if (i === 0) return <Person key={i} L={JIN_PRIN} x={p.x} y={p.y} h={300 * p.k} arms="sleeves" eyes="worry" bob={walkBob(f, moving)} />;
            if (i === 1 || i === 2) return <Horse key={i} x={p.x} y={p.y} w={300 * p.k} run={false} flip coat={i === 2 ? "#e8e0cc" : HC.coat} dark={i === 2 ? "#c8bfa8" : HC.dark} saddle="#c9a24a" />;
            if (i === 3) return <Person key={i} L={PORTER} x={p.x} y={p.y} h={260 * p.k} arms="offer" bob={walkBob(f, moving)} />;
            return <Cart key={i} x={p.x} y={p.y} w={330 * p.k} t={-f} rolling={moving} load={<SilkG x={0} y={-110} n={6} s={1.1} />} />;
          })}
          {/* 받는 쪽: 몽골 기병·툭 */}
          <Tug x={120} y={1040} h={380} sway={Math.sin(f / 14) * 4} />
          <Rider kind="mongol" x={-80} y={740} w={340} still />
          <Rider kind="mongol2" x={1580} y={760} w={320} still flip />
        </Cam>
        <AbsoluteFill style={{ background: "#000", opacity: lerp(f, later - 10, later, 0, 0.85) }} />
        <SFX name="coins" at={give} vol={0.25} dur={40} />
        <SFX name="hooves" at={give} vol={0.25} dur={70} />
      </AbsoluteFill>
    );
  }
  if (f < a26) {
    // 밤: 남쪽 성문에서 지평선 끝까지 이어진 도망 행렬 (가마·수레·관리·병사·짐말)
    const t = f - later;
    const items = Array.from({ length: 30 }).map((_, i) => ({ i, u: 0.04 + i * 0.032 + t * 0.0009 })).filter((it) => it.u < 1).reverse();
    return (
      <AbsoluteFill style={{ opacity: lerp(t, 0, 10, 0, 1) }}>
        <Cam z={lerp(t, 0, a26 - later, 1.05, 1.15)} cx={lerp(t, 0, a26 - later, 760, 900)} cy={560}>
          <Steppe time="night" horizon={380} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M 300 1100 C 360 900 600 840 900 790 C 1250 730 1450 520 1560 380 L 1580 380 C 1480 540 1320 760 1000 830 C 760 880 640 960 640 1100 Z" fill="#5e5a48" stroke={INK} strokeWidth={4} />
            <WallG x0={-20} x1={760} top={560} base={800} c="#6e6050" />
            <GateTowerG x={420} y={560} s={1.25} />
            <path d="M 350 800 L 350 690 C 350 640 490 640 490 690 L 490 800 Z" fill="#ffd98c" stroke={INK} strokeWidth={5} opacity={0.85} />
          </svg>
          {items.map(({ i, u }) => {
            const p = routeAt(u);
            const kind = i === 1 ? "pal" : ["cart", "off", "sol", "horse", "cart", "sol"][i % 6];
            if (kind === "pal") return <Palanquin key={i} x={p.x} y={p.y} k={p.k * 0.9} f={f} />;
            if (kind === "cart") return <Cart key={i} x={p.x} y={p.y} w={320 * p.k} t={f} load={<g><rect x={-130} y={-200} width={110} height={90} fill="#8a3b2c" stroke={INK} strokeWidth={5} /><rect x={-10} y={-190} width={120} height={80} fill="#a8473a" stroke={INK} strokeWidth={5} /></g>} />;
            if (kind === "off") return <Person key={i} L={OFFICIAL} x={p.x} y={p.y} h={260 * p.k} arms="offer" eyes="side" bob={walkBob(f + i * 3, true) * p.k} step={f / 5} />;
            if (kind === "horse") return <Horse key={i} x={p.x} y={p.y} w={300 * p.k} run={false} saddle="#5a3a2a" />;
            return (
              <React.Fragment key={i}>
                <Glow x={p.x + 40 * p.k} y={p.y - 300 * p.k} r={90 * p.k + 10} op={0.5} />
                <Person L={JIN_SOL} x={p.x} y={p.y} h={250 * p.k} arms="hold" eyes="side" bob={walkBob(f + i * 5, true) * p.k} step={f / 5}><Spear x={222} y={300} len={420} /></Person>
              </React.Fragment>
            );
          })}
          <AbsoluteFill style={{ background: "rgba(10,12,24,0.2)" }} />
        </Cam>
        <SFX name="march" at={later} vol={0.25} dur={a26 - later} />
      </AbsoluteFill>
    );
  }
  // c4_31 칭기즈칸 "응?" - 진영·호위병, 지평선을 따라 끝없이 이어진 도망 행렬
  const t = f - a26;
  const talk = talkingAt(f, a26, "c4_31");
  return (
    <AbsoluteFill>
      <Cam z={lerp(t, 0, frames - a26, 1.15, 1.25)} cx={760} cy={560}>
        <Steppe time="day" horizon={560} />
        {[[160, 600, 200], [1250, 590, 160]].map(([x, y, w], i) => <Ger key={i} x={x} y={y} w={w} door="#8a3b2c" />)}
        {Array.from({ length: 12 }).map((_, i) => <Cart key={i} x={1330 + i * 60 + t * 1.5} y={566} w={70} t={f} load={<rect x={-110} y={-190} width={200} height={80} fill={i % 3 ? "#8a3b2c" : "#d9a93a"} stroke={INK} strokeWidth={10} />} />)}
        <Tug x={330} y={640} h={340} sway={Math.sin(f / 14) * 4} />
        <Person L={MON} x={180} y={940} h={300} arms="hold" eyes="side"><Spear x={222} y={300} flag="#f2ead8" /></Person>
        <Person L={MON} x={1160} y={940} h={300} arms="hold" flip eyes="wide" mouth="o"><Spear x={222} y={300} /></Person>
        <Char id="genghis" x={680} h={600} pose="shocked" talking={talk} gesture={t > sec(1.4) ? "open" : undefined} gestureAt={a26 + sec(1.4)} bottom={120} enter="none" beat="jump" beatAt={a26 + 2} />
      </Cam>
    </AbsoluteFill>
  );
};

// =====================================================================
// 12) c4_32~28 칭기즈칸이 주먹을 쥠(뒤로 툭·군대) → 1215 중도 함락: 밤, 불타는 성벽과 문루, 연기, 성벽 위에 꽂힌 흰 툭,
//     앞에는 검은 실루엣 기병이 바라봄. 천천히 밀어 들어가고, 끝은 오래 머물렀다 어둠으로
// =====================================================================
export const Flames = ({ x, y, w = 120, f, k = 1 }: { x: number; y: number; w?: number; f: number; k?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${(w / 100) * k})`}>
    {[0, 1, 2].map((i) => {
      const h = 60 + Math.sin(f / 4 + i * 2 + x) * 14;
      const cx = -30 + i * 30;
      return <path key={i} d={`M ${cx - 18} 0 C ${cx - 20} ${-h * 0.6} ${cx} ${-h} ${cx + 2} ${-h} C ${cx + 6} ${-h * 0.6} ${cx + 20} -14 ${cx + 18} 0 Z`} fill={i % 2 ? "#ffd36b" : "#e8913a"} stroke={INK} strokeWidth={3} />;
    })}
  </g>
);
export const Smoke = ({ x, y, f, n = 3, s = 1 }: { x: number; y: number; f: number; n?: number; s?: number }) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      const t = ((f + i * (90 / n)) % 90) / 90;
      const r = (90 + t * 160) * s;
      return <div key={i} style={{ position: "absolute", left: x - r + t * 80 * s, top: y - r - t * 380 * s, width: r * 2, height: r * 2, borderRadius: "50%", background: "radial-gradient(rgba(30,24,22,0.55), transparent 70%)", opacity: 1 - t }} />;
    })}
  </>
);
const S12 = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a28 = at("c4_33");
  if (f < a28) {
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, a28, 1.05, 1.2)} cx={960} cy={560}>
          <Steppe time="dusk" horizon={600} />
          {Array.from({ length: 16 }).map((_, i) => <Rider key={i} kind={i % 3 ? "mongol" : "mongol2"} x={-60 + i * 125} y={500 + (i % 2) * 20} w={120} still phase={i} dark />)}
          {[300, 620, 1300, 1620].map((x, i) => <Tug key={i} x={x} y={lerp(f, 6 + i * 4, 26 + i * 4, 880, 640, true)} h={340} sway={Math.sin((f + i * 9) / 12) * 5} />)}
          <Person L={MON} x={560} y={960} h={300} arms="hold" eyes="angry"><Spear x={222} y={300} flag="#f2ead8" /></Person>
          <Person L={MON} x={1380} y={960} h={300} arms="hold" flip eyes="angry"><Spear x={222} y={300} /></Person>
          <Char id="genghis" x={960} h={640} pose="angry" gesture="fist" gestureAt={sec(1.0)} bottom={110} enter="none" beat="shake" beatAt={sec(1.0)} />
        </Cam>
        <SFX name="war_horn" at={sec(1.0)} vol={0.35} dur={a28 - sec(1.0)} />
      </AbsoluteFill>
    );
  }
  const t = f - a28;
  const burn = lerp(t, 0, 50, 0.4, 1);
  const sh = shake(t, 20, 4, 120);
  return (
    <AbsoluteFill>
      <Cam z={lerp(t, 0, frames - a28, 1.0, 1.14)} cx={960} cy={520} sx={sh.x} sy={sh.y}>
        <Steppe time="night" horizon={660} hills={false} />
        <Glow x={960} y={520} r={900} color="#f08a3a" op={0.45 * burn} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <ZhongduG burn={burn} />
          {[[560, 140], [760, 120], [960, 80], [1160, 120], [1360, 140]].map(([x, y], i) => <Flames key={`h${i}`} x={x} y={y + 40} w={120 + (i === 2 ? 60 : 0)} f={f + i * 9} k={burn} />)}
          {[[360, 300], [960, 250], [1560, 300]].map(([x, y], i) => <Flames key={`g${i}`} x={x} y={y} w={i === 1 ? 170 : 120} f={f + i * 11} k={burn} />)}
        </svg>
        <Smoke x={960} y={300} f={f} n={4} s={1.2} />
        <Smoke x={420} y={420} f={f + 30} n={3} />
        <Smoke x={1550} y={400} f={f + 60} n={3} />
        {/* 성벽 위 몽골 툭 */}
        {[420, 1500].map((x, i) => <Tug key={i} x={x} y={lerp(t, 30 + i * 12, 60 + i * 12, 640, 450, true)} h={240} sway={Math.sin((f + i * 7) / 12) * 5} />)}
        {/* 앞의 검은 실루엣 기병 */}
        {[0, 1, 2, 3, 4].map((i) => <Rider key={i} kind={i === 2 ? "temujin" : "mongol"} x={60 + i * 380 + (i === 2 ? 0 : 0)} y={i === 2 ? 760 : 820} w={i === 2 ? 400 : 320} still dark />)}
      </Cam>
      <BigNum text="1215" at={a28 + 8} size={190} y={290} color="#f2ead8" />
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 40, frames, 0, 1) }} />
      <SFX name="fire" at={0} vol={0.35} dur={frames - a28} />
      <SFX name="rumble" at={10} vol={0.3} dur={80} />
      <SFX name="bells" at={sec(1.2)} vol={0.15} dur={80} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 1b) c4_02~03 만리장성: 산맥 능선을 타고 원근으로 끝없이 이어지는 성벽(망루·여장) 위 겁먹은 병사들
//     → 마을: 지평선에서 말 탄 유목민이 카메라 쪽으로 쏟아져 들어와 약탈(불·도망치는 백성) → 바람처럼 지평선으로 사라짐(먼지·바람결)
//     → c4_03 성벽 위 병사들이 창을 고쳐 쥠, 너머 능선에 멈춘 유목민 실루엣 → 북쪽 숲에서 내려오는 사냥꾼(여진) 실루엣 → 금나라 깃발이 꽂힘
// =====================================================================
const GW = [[-60, 940, 1.0], [260, 780, 0.9], [520, 850, 0.78], [760, 650, 0.62], [960, 720, 0.5], [1130, 570, 0.4], [1290, 620, 0.32], [1420, 520, 0.25], [1560, 550, 0.2], [1680, 470, 0.15], [1800, 490, 0.12], [1980, 440, 0.09]];
const WALLC = "#bfae88";
const GreatWallG = () => (
  <g>
    {/* 먼 능선 둘 */}
    <path d="M -20 470 L 160 370 L 380 420 L 620 330 L 900 400 L 1180 320 L 1460 390 L 1720 310 L 1940 360 L 1940 620 L -20 620 Z" fill="#c4c6a6" stroke={INK} strokeWidth={4} />
    <path d="M -20 560 L 220 450 L 480 520 L 700 430 L 1000 500 L 1260 420 L 1540 470 L 1800 400 L 1940 430 L 1940 700 L -20 700 Z" fill="#aab38a" stroke={INK} strokeWidth={4} />
    {/* 성벽이 타는 가까운 산줄기 */}
    <path d={`M ${GW.map(([x, y, d]) => `${x} ${y + 26 * d}`).join(" L ")} L 1980 1100 L -60 1100 Z`} fill="#8c9467" stroke={INK} strokeWidth={6} />
    {GW.slice(0, -1).map(([x, y, d], i) => <path key={`r${i}`} d={`M ${x + 30 * d} ${y + 60 * d} l ${-40 * d} ${160 * d} l ${30 * d} ${120 * d}`} stroke="#6f7750" strokeWidth={6 * d + 2} fill="none" opacity={0.6} />)}
    {/* 성벽 몸 + 위 걷는 길 + 여장(톱니) */}
    {GW.slice(0, -1).map(([x, y, d], i) => {
      const [x2, y2, d2] = GW[i + 1];
      const w = 105 * ((d + d2) / 2);
      const n = Math.max(2, Math.floor(Math.hypot(x2 - x, y2 - y) / (34 * ((d + d2) / 2))));
      return (
        <g key={i}>
          <path d={`M ${x} ${y} L ${x2} ${y2}`} stroke={INK} strokeWidth={w + 10} strokeLinecap="round" />
          <path d={`M ${x} ${y} L ${x2} ${y2}`} stroke={WALLC} strokeWidth={w} strokeLinecap="round" />
          <path d={`M ${x} ${y - w * 0.18} L ${x2} ${y2 - w * 0.18}`} stroke="#d8cba8" strokeWidth={w * 0.22} />
          {Array.from({ length: n }).map((_, k) => {
            const u = (k + 0.5) / n;
            const dd = d + (d2 - d) * u;
            const mx = x + (x2 - x) * u;
            const my = y + (y2 - y) * u - w / 2 - 18 * dd;
            return <rect key={k} x={mx - 12 * dd} y={my} width={24 * dd} height={22 * dd} fill={WALLC} stroke={INK} strokeWidth={Math.max(1.5, 3 * dd)} />;
          })}
        </g>
      );
    })}
    {/* 망루 */}
    {GW.slice(1, -1).map(([x, y, d], i) => (
      <g key={`t${i}`} transform={`translate(${x} ${y - 40 * d}) scale(${d * 1.35})`}>
        <rect x={-60} y={-90} width={120} height={110} fill={WALLC} stroke={INK} strokeWidth={6} />
        <rect x={-18} y={-60} width={36} height={40} fill="#4a3424" stroke={INK} strokeWidth={4} />
        {[-50, -22, 6, 34].map((dx) => <rect key={dx} x={dx} y={-110} width={18} height={20} fill={WALLC} stroke={INK} strokeWidth={4} />)}
        <path d="M -76 -110 C -30 -124 30 -124 76 -110 L 44 -150 L -44 -150 Z" fill="#4a4440" stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);
export const PineG = ({ x, y, h, dark = false }: { x: number; y: number; h: number; dark?: boolean }) => (
  <g>
    <path d={`M ${x} ${y} L ${x} ${y - h * 0.3}`} stroke={INK} strokeWidth={h * 0.06 + 4} />
    {[0, 1, 2].map((k) => <path key={k} d={`M ${x} ${y - h * (1 - k * 0.22)} L ${x - h * (0.18 + k * 0.08)} ${y - h * (0.42 - k * 0.12) - h * 0.12} L ${x + h * (0.18 + k * 0.08)} ${y - h * (0.42 - k * 0.12) - h * 0.12} Z`} fill={dark ? "#2f3f2c" : "#44603e"} stroke={INK} strokeWidth={4} />)}
    <path d={`M ${x - h * 0.08} ${y - h * 0.86} L ${x} ${y - h} L ${x + h * 0.08} ${y - h * 0.86} Z`} fill="#eef0ea" />
  </g>
);
const HUNTER: Look = { robe: "#6a5a44", dark: "#4f4232", trim: "#c9b08a", hat: "fur", beard: "thin", collar: "cross" };
const HuntBow = () => <g><path d="M 74 228 Q 34 322 74 416" stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" /><path d="M 74 228 Q 34 322 74 416" stroke="#8a5a2e" strokeWidth={6} fill="none" /><path d="M 74 228 L 74 416" stroke="#e8dcc0" strokeWidth={2.5} /></g>;
// 유목민 기병이 지평선 → 카메라 쪽으로(또는 반대로) : lane -1~1, t 0 = 지평선
const raidPos = (lane: number, t: number) => {
  const w = 60 + 380 * t;
  return { x: 960 + lane * (60 + 760 * t) - w / 2, y: 520 + 420 * t - w * 0.775, w };
};
export const SWall = ({ at, frames }: ShotProps) => {
  const f = useCurrentFrame();
  const a3 = at("c4_03");
  const raid = sec(4.4);
  const gone = sec(7.3);
  // 2026-10-27 "그런데 장성 안의 금나라도, / 원래는 장성 밖 북쪽 숲에서…"로 바꿈 - 조각 4.5·7.4초
  // 영어 본편 기준 (2026-10-27): "And yet the Jin" 3.45초, 끝 9.25초
  const forest = a3 + sec(3.45);
  const flagAt = a3 + sec(8.0);
  // c4_02 ① / c4_03 ①: 장성
  if (f < raid || (f >= a3 && f < forest)) {
    const second = f >= a3;
    const t = second ? f - a3 : f;
    const len = second ? forest - a3 : raid;
    return (
      <AbsoluteFill>
        <Cam z={second ? lerp(t, 0, len, 1.5, 1.6) : lerp(t, 0, len, 1.0, 1.12)} cx={second ? 360 : lerp(t, 0, len, 1100, 900)} cy={second ? 720 : 600}>
          <Steppe time={second ? "dusk" : "day"} horizon={470} hills={false} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><GreatWallG /></svg>
          {/* 너머 능선에 멈춘 유목민 (c4_03) */}
          {second && [0, 1, 2, 3, 4].map((i) => <Rider key={i} kind="mongol2" x={420 + i * 70} y={560 + (i % 2) * 8} w={80} still dark phase={i} />)}
          {/* 성벽 위 병사들 */}
          {[150, 240, 330].map((x, i) => (
            <Person key={i} L={JIN_SOL} x={x} y={826 - (x - 150) * 0.5} h={190} arms="hold" eyes={second ? "angry" : i === 1 ? "wide" : "worry"} mouth={second ? "flat" : "o"} flip={i === 2} sweat={!second}><Spear x={222} y={300} len={440} /></Person>
          ))}
        </Cam>
        {!second && <SFX name="wind" at={0} vol={0.3} dur={raid} />}
        {second && <SFX name="war_drums" at={a3} vol={0.2} dur={forest - a3} />}
      </AbsoluteFill>
    );
  }
  // c4_02 ②③: 마을 약탈 → 바람처럼 사라짐
  if (f < a3) {
    const t = f - raid;
    const come = lerp(f, raid, raid + sec(1.6), 0, 1);
    const back = lerp(f, gone, a3 - 10, 0, 1.2);
    const fire = lerp(f, raid + sec(1.4), raid + sec(2.0), 0, 1);
    const lanes = [-0.9, -0.5, -0.15, 0.2, 0.55, 0.9];
    return (
      <AbsoluteFill>
        <Cam z={1.05} cx={960} cy={560} sx={shake(t, sec(1.0), 5, 40).x}>
          <Steppe time="day" horizon={520} />
          {/* 마을: 기와집·밭 */}
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {[[200, 820], [1720, 830], [420, 700], [1500, 700]].map(([x, y], i) => <g key={`fd${i}`}>{[0, 1, 2, 3].map((r) => <path key={r} d={`M ${x - 140} ${y + r * 22} L ${x + 140} ${y + r * 22 - 10}`} stroke="#6d8a46" strokeWidth={8} />)}</g>)}
            {[[300, 640, 2.8], [640, 600, 2.2], [1280, 600, 2.2], [1620, 650, 2.8], [960, 580, 1.6]].map(([x, y, k], i) => <House key={i} x={x} y={y} k={k} />)}
            {fire > 0 && [[300, 590], [1620, 600], [640, 560]].map(([x, y], i) => <Flames key={`fl${i}`} x={x} y={y} w={90} f={f + i * 5} k={fire} />)}
          </svg>
          {fire > 0 && <Smoke x={320} y={480} f={f} n={2} s={0.6} />}
          {/* 도망치는 백성 */}
          {[[700, 900, 1], [1180, 920, -1], [880, 1000, 1]].map(([x, y, d], i) => (
            <Person key={i} L={PORTER} x={x + d * Math.min(t, 80) * 3} y={y} h={230} arms="up" eyes="wide" mouth="o" flip={d < 0} bob={walkBob(f, back < 1)} step={f / 4} />
          ))}
          {/* 유목민 기병: 오는 길 / 돌아가는 길 */}
          {lanes.map((lane, i) => {
            const tt = back > 0 ? Math.max(0, 0.85 - back + i * 0.03) : Math.min(0.85, come * (0.45 + ((i * 37) % 10) / 18));
            if (back > 0 && tt <= 0.01) return null;
            const p = raidPos(lane, tt);
            const goingAway = back > 0;
            return <Rider key={i} kind={i % 2 ? "mongol2" : "mongol"} x={p.x} y={p.y} w={p.w} flip={goingAway ? lane > 0 : lane < 0} phase={i * 3} />;
          })}
          {/* 바람결 */}
          {back > 0 && Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 200 + i * 200 - back * 300, top: 500 + (i % 3) * 90, width: 260, height: 6, borderRadius: 3, background: "rgba(242,234,216,0.7)", opacity: Math.sin(Math.min(1, back) * Math.PI) }} />)}
          <Dust x={960} y={560} t={lerp(f, gone, a3, 0, 1)} r={260} />
        </Cam>
        <SFX name="gallop" at={raid} vol={0.4} dur={gone - raid} />
        <SFX name="crowd" at={raid + 20} vol={0.25} dur={60} />
        <SFX name="whoosh" at={gone} vol={0.3} dur={40} />
      </AbsoluteFill>
    );
  }
  // c4_03 ②: 북쪽 숲에서 내려오는 사냥꾼(여진) 실루엣 → 금나라 깃발
  const t = f - forest;
  const color = lerp(f, flagAt - 10, flagAt + 20, 0, 1);
  const walk = lerp(t, 0, flagAt - forest, 0, 1);
  return (
    <AbsoluteFill style={{ opacity: lerp(t, 0, 10, 0, 1) }}>
      <Cam z={lerp(t, 0, frames - forest, 1.05, 1.15)} cx={960} cy={560}>
        <Steppe time="day" horizon={430} hills={false} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -20 520 C 400 440 1400 440 1940 520 L 1940 1100 L -20 1100 Z" fill="#7e9a62" stroke={INK} strokeWidth={5} />
          {Array.from({ length: 22 }).map((_, i) => <PineG key={`b${i}`} x={-40 + i * 92 + ((i * 37) % 40)} y={520 + ((i * 29) % 30)} h={260 + ((i * 53) % 90)} dark />)}
          {Array.from({ length: 12 }).map((_, i) => <PineG key={`f${i}`} x={-60 + i * 170 + ((i * 41) % 60)} y={640 + ((i * 23) % 40)} h={340 + ((i * 61) % 100)} />)}
        </svg>
        {[[-1, 0], [0, 6], [1, 12], [-0.5, 18], [0.5, 24]].map(([lane, d], i) => {
          const u = Math.max(0, Math.min(1, walk * 1.1 - d / 120));
          const x = 960 + lane * (180 + 380 * u);
          const y = 640 + 360 * u;
          const h = 160 + 200 * u;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, filter: `brightness(${0.25 + 0.75 * color})` }}>
              <Person L={HUNTER} x={x} y={y} h={h} arms="hold" eyes={color > 0.5 ? "dot" : "dot"} mouth="flat" bob={walkBob(f + i * 3, u < 1)} step={u < 1 ? f / 5 : 0} flip={lane > 0}><HuntBow /></Person>
            </div>
          );
        })}
        {f >= flagAt - 6 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - lerp(f, flagAt - 6, flagAt + 12, 0, 1, true)) * 120}px)` }}><Flag x={960} y={1000} banner="jin" h={420} /></div>}
      </Cam>
      <SFX name="wolf" at={forest} vol={0.2} dur={60} />
      <SFX name="drum" at={flagAt} vol={0.35} dur={30} />
    </AbsoluteFill>
  );
};

// 1c) c4_04 다시 지도: 금나라로 가는 척하던 화살이 옆구리 서하로 휨, 금 황제는 안도
// 1b) c4_04 "바로 금나라로 가지 않고 옆구리 서하부터" - 앞 지도와 다른 그림: 장성 앞까지 확대, 몽골 기병 행렬이 금나라 쪽으로 내려오다
//     장성 앞에서 서쪽으로 꺾어 서하 도성으로 → 서하 왕은 깜짝, 금 황제는 안도(남의 일). 칭기즈칸은 초원에서 서하를 가리킴
const MARCH = [[905, 250], [945, 300], [960, 350], [930, 395], [880, 430], [845, 470]];
const along = (t: number) => {
  const seg = MARCH.slice(1).map((q, i) => Math.hypot(q[0] - MARCH[i][0], q[1] - MARCH[i][1]));
  let d = Math.max(0, t) * seg.reduce((x, y) => x + y, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = Math.min(1, d / seg[i]);
      const [x0, y0] = MARCH[i];
      const [x1, y1] = MARCH[i + 1];
      return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, left: x1 < x0 };
    }
    d -= seg[i];
  }
  return { x: MARCH[0][0], y: MARCH[0][1], left: false };
};
const S1b = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const go = lerp(f, sec(0.6), frames - sec(0.4), 0, 1);
  const turned = go > 0.55; // 장성 앞에서 서쪽으로 꺾음
  const relief = turned;
  return (
    <AbsoluteFill style={{ opacity: lerp(f, 0, 10, 0, 1) }}>
      <Cam z={lerp(f, 0, frames, 2.0, 2.25)} cx={lerp(f, 0, frames, 960, 900)} cy={lerp(f, 0, frames, 380, 430)}>
        <ChinaMap f={f} rich={1} jin={1} strings={0} arrow={0} pull={0} />
        {/* 몽골 기병 행렬 (작게, 길 따라) */}
        {Array.from({ length: 9 }).map((_, i) => {
          const p = along(go - i * 0.085);
          return go - i * 0.085 > 0 ? <Rider key={i} kind={i === 0 ? "mongol_white" : i % 2 ? "mongol2" : "mongol"} x={p.x - 22} y={p.y - 30} w={44} flip={p.left} phase={i} /> : null;
        })}
        <Person L={XIA_KING} x={P.xingqing[0] - 40} y={P.xingqing[1] + 70} h={110} arms={turned ? "up" : "down"} eyes={turned ? "wide" : "dot"} mouth={turned ? "o" : "flat"} sweat={turned} bob={turned ? Math.abs(Math.sin(f / 4)) * 3 : 0} />
        <Person L={EMPEROR} x={P.zhongdu[0]} y={P.zhongdu[1] + 90} h={120} arms="down" eyes={relief ? "shut" : "wide"} mouth={relief ? "flat" : "o"} sweat={!relief} />
        <Char id="genghis" x={P.genghis[0] - 30} h={110} pose="smug" gesture="point" gestureAt={sec(0.6)} bottom={1080 - P.genghis[1] + 10} enter="none" beat="none" />
      </Cam>
      <SFX name="hooves" at={sec(0.6)} vol={0.22} dur={frames - sec(1)} />
      <SFX name="swish" at={Math.round(sec(0.6) + (frames - sec(1)) * 0.55)} vol={0.3} dur={30} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 2b) c4_09 물이 빠진 뒤: 진흙탕 속에서 게르를 다시 세우는 병사들 → 성을 둘러싼 몽골 진영이 안쪽부터 세 겹으로 늘어남(점선 고리로 "겹겹이")
// =====================================================================
const RINGS = [[330, 80], [560, 160], [820, 270]];
const RingItem = ({ x, y, k, i, f }: { x: number; y: number; k: number; i: number; f: number }) =>
  i % 3 === 0 ? <Tug x={x} y={y} h={220 * k} sway={Math.sin((f + i * 7) / 13) * 3} /> : i % 3 === 1 ? <Ger x={x} y={y} w={170 * k} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} /> : <Rider kind={i % 2 ? "mongol2" : "mongol"} x={x - 90 * k} y={y - 140 * k} w={180 * k} still phase={i} />;
export const S2b = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const T = [sec(0.4), sec(3.9), sec(4.9)];
  const items = RINGS.flatMap(([rx, ry], r) => Array.from({ length: 10 + r * 6 }).map((_, j, arr) => {
    const a = (j / arr.length) * Math.PI * 2 + r * 0.3;
    const x = 960 + Math.cos(a) * rx;
    const y = 480 + Math.sin(a) * ry;
    const k = 0.45 + ((y - 200) / 900) * 0.9;
    return { x, y, k, r, j, back: Math.sin(a) < 0 };
  }));
  const pop = (r: number, j: number) => lerp(f, T[r] + j * 2, T[r] + j * 2 + 8, 0, 1, true);
  const draw = (back: boolean) => items.filter((it) => it.back === back).sort((a, b) => a.y - b.y).map((it, n) => {
    const p = pop(it.r, it.j);
    return p > 0 ? <div key={`${it.r}-${it.j}-${n}`} style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - p) * 30}px)`, opacity: p }}><RingItem x={it.x} y={it.y} k={it.k} i={it.j + it.r} f={f} /></div> : null;
  });
  const hl = lerp(f, sec(5.2), sec(6.0), 0, 1);
  const hammer = Math.abs(Math.sin(f / 5));
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, T[1], 1.3, 1.0, true)} cx={lerp(f, 0, T[1], 600, 960, true)} cy={lerp(f, 0, T[1], 760, 540, true)}>
        <Steppe time="day" horizon={400} />
        {/* 남은 진흙 웅덩이 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {[[300, 900, 160], [1400, 950, 220], [800, 1010, 140], [1700, 800, 120], [200, 640, 110]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.22} fill="#8a8a6a" stroke={INK} strokeWidth={4} opacity={0.8} />)}
        </svg>
        {draw(true)}
        {/* 서하 도성 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <WallG x0={760} x1={1160} top={360} base={480} />
          <GateTowerG x={960} y={360} s={0.6} />
        </svg>
        <Flag x={790} y={360} banner="xia" h={110} />
        <Flag x={1130} y={360} banner="xia" h={110} />
        {draw(false)}
        {hl > 0 && <svg width={1920} height={1080} style={{ position: "absolute" }}>{RINGS.map(([rx, ry], r) => <ellipse key={r} cx={960} cy={480} rx={rx} ry={ry} fill="none" stroke="#4d6b8a" strokeWidth={8} strokeDasharray="22 14" opacity={hl * 0.8} strokeDashoffset={-f * 2} />)}</svg>}
        {/* 앞: 게르 뼈대를 다시 세우는 병사들 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 380 980 L 380 880 L 620 880 L 620 980" fill="none" stroke="#8a6440" strokeWidth={8} />
          {[400, 440, 480, 520, 560, 600].map((x) => <path key={x} d={`M ${x} 980 L ${x + 30} 880 M ${x + 30} 980 L ${x} 880`} stroke="#8a6440" strokeWidth={5} />)}
          <path d="M 370 880 C 420 800 580 800 630 880" fill="none" stroke="#8a6440" strokeWidth={8} />
        </svg>
        <Person L={MON} x={300} y={1010} h={260} arms="fist" eyes="angry" mouth="flat" rot={-hammer * 4}><path d={`M 232 104 L ${262 + hammer * 10} ${60 + hammer * 20}`} stroke="#7a5230" strokeWidth={10} /><rect x={248 + hammer * 10} y={36 + hammer * 20} width={40} height={26} fill="#5a4030" stroke={INK} strokeWidth={4} /></Person>
        <Person L={MON} x={720} y={1020} h={250} arms="offer" eyes="dot" mouth="flat" flip />
      </Cam>
      {[0, 1, 2, 3].map((i) => <SFX key={i} name="hit" at={8 + i * 14} vol={0.18} dur={10} />)}
      <SFX name="war_drums" at={T[1]} vol={0.25} dur={frames - T[1]} />
    </AbsoluteFill>
  );
};

// 2c) c4_10 금나라 궁궐: 엎드려 애원하는 서하 사신 → 금 황제가 고개를 돌림, 머리 위 생각 구름에 몽골 툭과 서하 깃발이 서로 치고받음
export const XIA_ENV: Look = { robe: "#4f8a7c", dark: "#3c6e62", trim: "#efe6d4", hat: "xia_soldier", beard: "thin", collar: "cross" };
export const ThroneRoom = () => (
  <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
    <rect x={-20} y={-20} width={1960} height={760} fill="#a8332a" />
    {[120, 420, 1500, 1800].map((x) => <g key={x}><rect x={x - 34} y={-20} width={68} height={760} fill="#8a2a22" stroke={INK} strokeWidth={6} /><rect x={x - 46} y={700} width={92} height={40} fill="#c9a24a" stroke={INK} strokeWidth={5} /></g>)}
    <path d="M -20 0 L 1940 0 L 1940 70 L -20 70 Z" fill="#4f6e6a" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={40 + i * 82} cy={35} r={14} fill="#c9a24a" stroke={INK} strokeWidth={3} />)}
    {/* 금빛 병풍 + 단 */}
    <path d="M 1000 160 L 1600 160 L 1600 600 L 1000 600 Z" fill="#d9a93a" stroke={INK} strokeWidth={6} />
    {[1150, 1300, 1450].map((x) => <path key={x} d={`M ${x} 160 L ${x} 600`} stroke="#a8862a" strokeWidth={5} />)}
    <circle cx={1300} cy={330} r={70} fill="none" stroke="#a8332a" strokeWidth={10} />
    <path d="M 900 600 L 1700 600 L 1740 660 L 860 660 Z" fill="#7a3426" stroke={INK} strokeWidth={6} />
    <path d="M 820 660 L 1780 660 L 1820 740 L 780 740 Z" fill="#6a2e22" stroke={INK} strokeWidth={6} />
    <rect x={-20} y={740} width={1960} height={360} fill="#8a7a62" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${i * 170 - 40} 740 L ${i * 240 - 600} 1100`} stroke="#6e604c" strokeWidth={4} />)}
  </svg>
);
export const S2c = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  const away = sec(3.3);
  const turned = f >= away;
  const bubble = lerp(f, away + 20, away + 40, 0, 1, true);
  const bonk = Math.max(0, Math.sin(f / 6)) * 26;
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.05, 1.15)} cx={lerp(f, 0, away, 800, 1150, true)} cy={560}>
        <ThroneRoom />
        <Person L={OFFICIAL} x={760} y={760} h={300} arms="sleeves" eyes="side" />
        <Person L={JIN_GEN} x={1820} y={800} h={320} arms="hold" flip><Spear x={222} y={300} /></Person>
        <Person L={EMPEROR} x={1300} y={640} h={360} arms="sleeves" rot={turned ? lerp(f, away, away + 10, 0, 7) : 0} eyes={turned ? "side" : "dot"} mouth={turned ? "smile" : "flat"} />
        {/* 엎드린 서하 사신 */}
        <Person L={XIA_ENV} x={640} y={1030} h={440} kneel arms="sleeves" bow={1} eyes={turned ? "shut" : "worry"} mouth="wobble" t={f} sweat />
        {/* 생각 구름: 적끼리 싸우게 둠 */}
        {bubble > 0 && (
          <svg width={1920} height={1080} viewBox="0 -150 1920 1080" style={{ position: "absolute", ...ink, opacity: bubble }}>
            <circle cx={1180} cy={260} r={12} fill="#f7f1e2" stroke={INK} strokeWidth={4} />
            <circle cx={1130} cy={220} r={18} fill="#f7f1e2" stroke={INK} strokeWidth={4} />
            <path d="M 760 200 C 700 120 780 40 880 70 C 920 10 1060 10 1090 80 C 1180 70 1200 180 1120 210 C 1110 270 980 280 940 240 C 880 290 760 270 760 200 Z" fill="#f7f1e2" stroke={INK} strokeWidth={6} />
            <g transform={`translate(${880 + bonk} 220)`}><path d="M 0 0 L 0 -120" stroke={INK} strokeWidth={7} /><path d="M -12 -100 C -16 -60 -8 -40 0 -30 C 8 -40 16 -60 12 -100 Z" fill="#f2ead8" stroke={INK} strokeWidth={4} /><path d="M 0 -136 L -7 -116 L 7 -116 Z" fill="#b8bcbd" stroke={INK} strokeWidth={3} /></g>
            <FlagG x={1000 - bonk} y={220} banner="xia" h={120} t={f} />
            {bonk > 20 && <path d="M 935 110 l 10 -20 M 950 118 l 22 -8 M 925 104 l -6 -22" stroke={INK} strokeWidth={5} />}
          </svg>
        )}
      </Cam>
      <SFX name="gong" at={away} vol={0.2} dur={40} />
    </AbsoluteFill>
  );
};

// 2d) c4_11 성안: 텅 빈 곡식 창고·엎어진 바구니, 빈 그릇을 든 굶주린 백성, 고개 숙인 서하 왕. 성벽 너머로 몽골 툭
export const S2d = ({ frames }: ShotProps) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.05, 1.25)} cx={lerp(f, 0, frames, 900, 1250)} cy={620}>
        <Steppe time="dusk" horizon={520} hills={false} />
        {[300, 700, 1200, 1650].map((x, i) => <Tug key={i} x={x} y={470} h={200} sway={Math.sin((f + i * 9) / 13) * 3} />)}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <WallG x0={-20} x1={1940} top={380} base={560} />
          {/* 곡식 창고 (문이 열려 텅 빔) */}
          <path d="M 120 900 L 120 600 L 700 600 L 700 900 Z" fill="#b89a6a" stroke={INK} strokeWidth={6} />
          <path d="M 80 610 L 410 470 L 740 610 Z" fill="#5a4a40" stroke={INK} strokeWidth={6} />
          <path d="M 300 900 L 300 700 L 520 700 L 520 900 Z" fill="#2a1e16" stroke={INK} strokeWidth={5} />
          <path d="M 300 700 L 220 720 L 220 900 L 300 900 Z M 520 700 L 600 720 L 600 900 L 520 900 Z" fill="#8a6440" stroke={INK} strokeWidth={5} />
          {[[340, 890], [380, 894], [460, 888]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={5} ry={3} fill="#d9b85a" />)}
          {/* 엎어진 빈 바구니 */}
          {[[180, 960], [640, 980]].map(([x, y], i) => <g key={i} transform={`rotate(${i ? 20 : -15} ${x} ${y})`}><path d={`M ${x - 50} ${y} L ${x - 36} ${y - 60} L ${x + 36} ${y - 60} L ${x + 50} ${y} Z`} fill="#c9a874" stroke={INK} strokeWidth={4} />{[0, 1, 2].map((r) => <path key={r} d={`M ${x - 46} ${y - 14 - r * 16} L ${x + 46} ${y - 14 - r * 16}`} stroke="#8a6440" strokeWidth={3} />)}</g>)}
        </svg>
        {/* 굶주린 백성 (빈 그릇) */}
        {[[860, 960], [1040, 990], [760, 1050]].map(([x, y], i) => (
          <Person key={i} L={PORTER} x={x} y={y} h={240} kneel arms="offer" eyes="worry" mouth="frown" bow={0.2} sweat={i === 1}>
            <path d="M 118 300 C 120 326 180 326 182 300 Z" fill="#c9bfa8" stroke={INK} strokeWidth={4} />
          </Person>
        ))}
        <Person L={XIA_KING} x={1380} y={960} h={360} arms="sleeves" eyes="shut" mouth="frown" bow={0.6} />
        <Dim op={0.18} />
      </Cam>
      <SFX name="wind" at={0} vol={0.3} dur={frames} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: ["c4_01"], Shot: S1 },
  { ids: ["c4_02", "c4_03"], Shot: SWall },
  { ids: ["c4_04"], Shot: S1b },
  { ids: ["c4_05", "c4_06", "c4_07", "c4_08"], Shot: S2 },
  { ids: ["c4_09"], Shot: S2b },
  { ids: ["c4_10"], Shot: S2c },
  { ids: ["c4_11"], Shot: S2d },
  { ids: ["c4_12"], Shot: S3 },
  { ids: ["c4_13"], Shot: S4 },
  { ids: ["c4_14", "c4_15"], Shot: S5 },
  { ids: ["c4_16", "c4_17"], Shot: S6 },
  { ids: ["c4_18", "c4_19"], Shot: S7 },
  { ids: ["c4_20", "c4_21", "c4_22"], Shot: S8 },
  { ids: ["c4_23"], Shot: S9 },
  { ids: ["c4_24", "c4_25", "c4_26", "c4_27", "c4_28", "c4_29"], Shot: S10 },
  { ids: ["c4_30", "c4_31"], Shot: S11 },
  { ids: ["c4_32", "c4_33"], Shot: S12 },
];
export const M01Ch4 = () => <Chapter ch="4" year="1209" groups={groups} music="siege" />;
