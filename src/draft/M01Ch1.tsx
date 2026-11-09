// 몽골 1편 검수용 초안 - 1장 "버려진 아이" 8판 (2026-10-27: 1편·2편으로 나눔, 7판 사용자: "텐션이 낮고 재미가 없어")
// 참고 별별역사식: 20~30초마다 "그런데" 반전 · 인물 속마음 대사 · 쫓는 쪽 계획을 먼저 · 웃음은 상황으로. 장면 = 대본(script-ko.md 1장 8판) ▶ 줄
// 흐름: 칭기즈칸 → 핏덩이를 쥔 아기 → 무법천지 초원 → 신부를 빼앗은 예수게이(호엘룬의 저고리, 메르키트 원한) → 보르테와 개 → 타타르의 독
//   → 부족이 버림 → 강가에서 버팀(카사르) → 교훈 1 → 습격·방벽 → 숲 아흐레(안장·흰 바위) → 나무 칼 → 탈출 → 수색꾼 → 양털 수레 → 교훈 2 → 보르테가 사라짐
// 7판 사고로 막은 것: 아기를 안은 채 손짓·뜀 금지(아기는 누운 장면만), 낚시는 강가에서만, 동생은 가만있지 않음(방벽 뒤에서 활)
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import rigs from "../episode/char-rig.json";
import { Character } from "../episode/Character";
import { Chapter, Char, clamp, Dim, ease, Fire, FPS, Ger, Glow, Group, INK, Lang, LangContext, Paper, Rider, SFX, ShotProps, slotSec, Steppe, Tug, Snd } from "./kit";
import { SM_LAKES, SM_LAND, SM_POL, SM_RIVERS } from "./steppeMap";

// ---------- 이 장 전용 소품 (먹선 + 바랜 색) ----------
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
// 카메라 흔들림 (독·충격)
const shake = (f: number, from: number, amp: number, dur = 40) => {
  const t = f - from;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const d = 1 - t / dur;
  return { x: Math.sin(t * 2.7) * amp * d, y: Math.cos(t * 3.1) * amp * 0.6 * d };
};
// 오논강: 화면을 가로지르는 굽은 물길 (time에 따라 색)
const River = ({ y, h = 120, time = "day" }: { y: number; h?: number; time?: "day" | "dusk" | "night" }) => {
  const f = useCurrentFrame();
  const fill = time === "night" ? "#1e3346" : time === "dusk" ? "#7d8f8c" : "#9db7b3";
  const line = time === "night" ? "#8fa9b8" : "#e8f0e6";
  return (
    <svg width={1920} height={h + 80} viewBox={`0 0 1920 ${h + 80}`} style={{ position: "absolute", left: 0, top: y - 40, ...ink }}>
      <path d={`M -20 40 C 400 10 700 70 1100 36 C 1450 8 1700 46 1940 30 L 1940 ${h + 50} C 1500 ${h + 70} 1100 ${h + 30} 700 ${h + 60} C 400 ${h + 80} 200 ${h + 40} -20 ${h + 56} Z`} fill={fill} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = ((i * 233 + f * (1.2 + (i % 3) * 0.4)) % 2100) - 100;
        const yy = 60 + ((i * 37) % Math.max(20, h - 30));
        return <path key={i} d={`M ${x} ${yy} q 30 -8 60 0`} stroke={line} strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />;
      })}
    </svg>
  );
};
// 강보에 싸인 아기 (꼼지락)
const Baby = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => {
  const f = useCurrentFrame();
  const wig = Math.sin(f / 5) * 3;
  return (
    <svg width={190 * s} height={120 * s} viewBox="0 0 190 120" style={{ position: "absolute", left: x - 95 * s, top: y - 60 * s, ...ink }}>
      <path d="M 18 70 C 10 30 70 18 120 30 C 170 40 186 70 170 92 C 150 116 60 118 30 100 Z" fill="#d9c6a0" stroke={INK} strokeWidth={5} />
      <path d="M 60 40 C 90 60 120 60 150 52 M 52 92 C 90 82 130 86 160 92" stroke="#a88a5c" strokeWidth={4} fill="none" />
      <g transform={`rotate(${wig} 48 56)`}>
        <circle cx={48} cy={56} r={30} fill="#f0cfa6" stroke={INK} strokeWidth={5} />
        <path d="M 36 54 q 5 4 10 0 M 52 54 q 5 4 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M 44 68 q 4 3 8 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={34} cy={64} r={5} fill="#e59a7e" opacity={0.6} />
        <circle cx={62} cy={64} r={5} fill="#e59a7e" opacity={0.6} />
      </g>
    </svg>
  );
};
// 잔 (독을 타는 장면 클로즈업)
const Cup = ({ x, y, s = 1, tint = 0 }: { x: number; y: number; s?: number; tint?: number }) => (
  <svg width={360 * s} height={300 * s} viewBox="0 0 360 300" style={{ position: "absolute", left: x - 180 * s, top: y - 150 * s, ...ink }}>
    <path d="M 40 70 L 320 70 C 316 190 260 250 180 252 C 100 250 44 190 40 70 Z" fill="#c9a24a" stroke={INK} strokeWidth={8} />
    <ellipse cx={180} cy={70} rx={140} ry={26} fill="#e2c67c" stroke={INK} strokeWidth={8} />
    <ellipse cx={180} cy={76} rx={120} ry={18} fill={tint > 0 ? `rgb(${236 - 170 * tint},${228 - 150 * tint},${200 - 150 * tint})` : "#ece4c8"} />
    <path d="M 140 252 L 130 290 L 230 290 L 220 252" fill="#b38c3c" stroke={INK} strokeWidth={8} />
    <path d="M 70 120 C 120 140 240 140 290 120" stroke="#8a6c2c" strokeWidth={5} fill="none" />
  </svg>
);
// 횃불
const Torch = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => {
  const f = useCurrentFrame();
  const k = 1 + Math.sin(f / 2.5) * 0.1;
  return (
    <svg width={80 * s} height={220 * s} viewBox="0 0 80 220" style={{ position: "absolute", left: x - 40 * s, top: y - 70 * s, ...ink }}>
      <path d="M 40 70 L 40 220" stroke={INK} strokeWidth={12} />
      <path d="M 40 70 L 40 220" stroke="#7a5230" strokeWidth={6} />
      <path d={`M 40 ${76 - 70 * k} C 6 40 14 80 40 80 C 66 80 74 40 40 ${76 - 70 * k} Z`} fill="#e8913a" stroke={INK} strokeWidth={4} />
      <path d={`M 40 ${78 - 40 * k} C 28 56 30 80 40 80 C 50 80 52 56 40 ${78 - 40 * k} Z`} fill="#ffd36b" />
    </svg>
  );
};
// 뒤지개(뿌리 캐는 막대) + 캔 뿌리 더미
const Roots = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <svg width={300} height={140} viewBox="0 0 300 140" style={{ position: "absolute", left: x - 150, top: y - 110, ...ink }}>
    <path d="M 20 130 C 60 96 240 96 280 130 Z" fill="#7c5c38" stroke={INK} strokeWidth={5} />
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${70 + i * 46} ${96 - (i % 2) * 14}) rotate(${(i % 3) * 25 - 25})`}>
        <path d="M 0 0 C 10 20 4 40 -6 56 M 0 0 C -10 16 -14 30 -20 38" stroke="#d8c08c" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M 0 0 C -6 -20 6 -30 0 -44 M 0 0 C 10 -16 18 -22 22 -36" stroke="#7d8a4a" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    ))}
  </svg>
);
// 갈대 (강가, 밤)
const Reeds = ({ x, y, n = 7, dark = false }: { x: number; y: number; n?: number; dark?: boolean }) => {
  const f = useCurrentFrame();
  return (
    <svg width={n * 34 + 40} height={260} viewBox={`0 0 ${n * 34 + 40} 260`} style={{ position: "absolute", left: x, top: y - 250, ...ink }}>
      {Array.from({ length: n }).map((_, i) => {
        const h = 150 + ((i * 47) % 90);
        const sw = Math.sin(f / 22 + i) * 8;
        const bx = 20 + i * 34;
        return (
          <g key={i}>
            <path d={`M ${bx} 260 Q ${bx + sw / 2} ${260 - h / 2} ${bx + sw} ${260 - h}`} stroke={dark ? "#0f1416" : "#6d6a3c"} strokeWidth={6} fill="none" />
            <ellipse cx={bx + sw} cy={260 - h + 4} rx={7} ry={20} fill={dark ? "#141a1c" : "#7a5a36"} stroke={INK} strokeWidth={3} />
          </g>
        );
      })}
    </svg>
  );
};
// 검은 실루엣 (없는 인물): 캐릭터 그림을 brightness(0)
const Shadow = ({ op = 1, warm = 0, children }: { op?: number; warm?: number; children: React.ReactNode }) => (
  <AbsoluteFill style={{ filter: `brightness(${warm}) ${warm ? "sepia(1) saturate(3)" : ""}`, opacity: op }}>{children}</AbsoluteFill>
);

// ---------- 전용 그림 (핵심 장면은 캐릭터 겹을 세우지 않고 코드로 그림 - 머리만 캐릭터 머리 겹을 얹어 같은 얼굴) ----------
const RIG = rigs as Record<string, { neck: number[] }>;
// 캐릭터 머리 겹(head·eyes·mouth)만: (x,y) = 목 자리, s = 판 1px당 화면 px
// bare = 눈·입 겹을 빼고 children(판 600×720 좌표 SVG)으로 얼굴을 직접 그림
const Head = ({ id, pose = "front", x, y, s, rot = 0, flip = false, eyes, mouth = "0", bare = false, children }: { id: string; pose?: string; x: number; y: number; s: number; rot?: number; flip?: boolean; eyes?: 0 | 1; mouth?: string; bare?: boolean; children?: React.ReactNode }) => {
  const f = useCurrentFrame();
  const n = RIG[id]?.neck ?? [300, 420];
  const blink = eyes ?? ((f + id.length * 17) % 104 < 4 ? 1 : 0);
  const L = (name: string) => <Img src={staticFile(`chars/${id}/${pose}/${name}.svg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
  return (
    <div style={{ position: "absolute", left: x - n[0] * s, top: y - n[1] * s, width: 600 * s, height: 720 * s, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, transformOrigin: `${n[0] * s}px ${n[1] * s}px` }}>
      {L("head")}
      {!bare && L(`eyes${blink}`)}
      {!bare && L(`mouth${mouth}`)}
      {children && <svg viewBox="0 0 600 720" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>{children}</svg>}
    </div>
  );
};
const SKIN = "#ecbf93";
const KID = { robe: "#4d6b8a", dark: "#3d556e", trim: "#c9a24e", skin: "#e9b98c", boot: "#3a2b22" };
const HOE = { robe: "#6b4a7a", dark: "#553b61", trim: "#b5863a" };
// 쪼그려 앉아(옆모습, 오른쪽을 봄) 뒤지개로 뿌리를 캐는 호엘룬. (x,y) = 목, d = 캐는 동작(0~1)
const SquatHoelun = ({ x, y, s, d, pose = "side" }: { x: number; y: number; s: number; d: number; pose?: string }) => {
  const dy = d * 34;
  return (
    <>
      <svg width={600 * s} height={500 * s} viewBox="-250 -100 600 500" style={{ position: "absolute", left: x - 250 * s, top: y - 100 * s, ...ink }}>
        <ellipse cx={-10} cy={312} rx={190} ry={18} fill="rgba(43,29,20,0.25)" />
        {/* 몸: 등이 둥글게 굽고 무릎이 앞으로 */}
        <path d="M -40 -6 C -130 20 -170 150 -160 300 L 130 300 C 150 250 140 186 96 168 C 80 110 60 30 40 -6 Z" fill={HOE.robe} stroke={INK} strokeWidth={7} />
        <path d="M -40 -6 C -100 30 -130 120 -130 200" stroke={HOE.dark} strokeWidth={18} fill="none" opacity={0.6} />
        <path d="M -150 170 C -80 182 10 182 96 168" stroke={HOE.trim} strokeWidth={14} fill="none" />
        <path d="M 0 -4 C 10 60 26 130 40 168" stroke={HOE.trim} strokeWidth={8} fill="none" />
        <ellipse cx={-120} cy={302} rx={52} ry={18} fill={KID.boot} stroke={INK} strokeWidth={5} />
        <ellipse cx={104} cy={302} rx={52} ry={18} fill={KID.boot} stroke={INK} strokeWidth={5} />
        {/* 뒤지개 (위아래로 찍음) */}
        <g transform={`translate(0 ${dy})`}>
          <path d="M 250 40 L 170 330" stroke={INK} strokeWidth={18} strokeLinecap="round" />
          <path d="M 250 40 L 170 330" stroke="#8a6440" strokeWidth={9} strokeLinecap="round" />
        </g>
        {/* 두 손으로 뒤지개를 쥔 팔 (소매·손목 띠·주먹) */}
        <Sleeve x1={6} y1={28} x2={204} y2={146 + dy} color={HOE.dark} trim={HOE.trim} />
        <Grip x={220} y={150 + dy} rot={-16} />
        <Sleeve x1={-24} y1={58} x2={184} y2={218 + dy} w1={60} w2={40} color={HOE.robe} trim={HOE.trim} />
        <Grip x={200} y={222 + dy} rot={-16} />
      </svg>
      <Head id="hoelun" pose={pose} x={x} y={y} s={s * 0.95} rot={pose === "side" ? 14 : 4} />
    </>
  );
};
// 강가에 앉은 아이 (옆모습, 오른쪽을 봄, 다리를 늘어뜨림) + 낚싯대. (x,y) = 목
// sib = 동생 (다른 얼굴: 코드로 그린 머리 - 정수리를 밀고 양옆 머리 타래, 졸린 눈, 올리브색 옷)
const SitKid = ({ x, y, s, tip, lineTo, fish = 0, mouth = "0", lift = 0, sib = false }: { x: number; y: number; s: number; tip: [number, number]; lineTo: number; fish?: number; mouth?: string; lift?: number; sib?: boolean }) => {
  const f = useCurrentFrame();
  const C = sib ? { robe: "#7a8a4a", dark: "#5e6b38", trim: "#c8a27c", skin: KID.skin, boot: KID.boot } : KID;
  const hx = x + 104 * s;
  const hy = y + 112 * s - lift * 20;
  const swing = Math.sin(f / 9 + x) * 6;
  const [tx, ty0] = tip;
  const ty = ty0 - lift * 60;
  const lineEnd = lineTo - fish * (lineTo - ty - 40);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
        <path d={`M ${hx} ${hy} Q ${(hx + tx) / 2} ${Math.min(hy, ty) - 50} ${tx} ${ty}`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d={`M ${hx} ${hy} Q ${(hx + tx) / 2} ${Math.min(hy, ty) - 50} ${tx} ${ty}`} stroke="#8a6440" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M ${tx} ${ty} L ${tx + Math.sin(f / 11) * 4} ${lineEnd}`} stroke={INK} strokeWidth={2.5} />
        {fish > 0 && (
          <g transform={`translate(${tx} ${lineEnd + 22}) rotate(${80 + Math.sin(f / 2) * 25})`}>
            <path d="M -26 0 C -10 -16 16 -16 22 0 C 16 16 -10 16 -26 0 Z" fill="#b9c4b8" stroke={INK} strokeWidth={4} />
            <path d="M 22 0 L 38 -12 L 38 12 Z" fill="#b9c4b8" stroke={INK} strokeWidth={4} />
            <circle cx={-14} cy={-3} r={3} fill={INK} />
          </g>
        )}
      </svg>
      <svg width={400 * s} height={420 * s} viewBox="-150 -60 400 420" style={{ position: "absolute", left: x - 150 * s, top: y - 60 * s, ...ink }}>
        <path d="M -40 -4 C -95 20 -105 120 -95 196 L 60 196 C 70 140 60 50 36 -4 Z" fill={C.robe} stroke={INK} strokeWidth={6} />
        <path d="M -90 120 C -40 128 20 128 64 120" stroke={C.trim} strokeWidth={10} fill="none" />
        {/* 허벅지 앞으로 + 정강이 늘어뜨림 (흔들흔들) */}
        <path d="M -40 150 L 120 150 C 140 150 146 196 120 200 L -40 200 Z" fill={C.dark} stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${swing} 120 178)`}>
          <path d="M 104 180 L 104 290 L 140 290 L 140 180 Z" fill={C.dark} stroke={INK} strokeWidth={6} />
          <ellipse cx={132} cy={296} rx={30} ry={14} fill={KID.boot} stroke={INK} strokeWidth={5} />
        </g>
        <g transform={`translate(0 ${-lift * 20 / s})`}>
          <Sleeve x1={-6} y1={36} x2={92} y2={110} w1={46} w2={30} color={C.robe} trim={C.trim} />
          <Grip x={106} y={112} rot={-30} skin={C.skin} />
        </g>
      </svg>
      {sib ? (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <g transform={`translate(${x + 8 * s} ${y - 96 * s}) scale(${2.15 * s})`}>
            <DrawnHead hat="tufts" r={46} mood="sleepy" skin={C.skin} />
          </g>
        </svg>
      ) : (
        <Head id="temujin_child" pose="side" x={x} y={y - lift * 10} s={s} rot={-lift * 8} mouth={mouth} />
      )}
    </>
  );
};
// 나무 칼(형틀)을 쓴 어린 테무친: 큰 네모 판에 목과 두 손목이 끼워짐, 위에서 조금 내려다본 모양.
// (x,y) = 목, tilt = 판 무게로 기울기, water = 물속(몸 안 그림), drop = 판이 떨어져 내려오는 중(0~1, 1이면 자리)
// shiver = 떨림 세기(px), sweat = 땀방울, breath = 내쉬는 입김(0~1), slump = 축 처짐(px)
// face="relief" = 안도 얼굴을 직접 그림 (웃지 않음): 감은 눈(아래로 처진 눈꺼풀) + 눈 밑 그늘 + 처진 걱정 눈썹 + 살짝 벌린 입(숨 내쉼)
const CangueKid = ({ x, y, s, tilt = 0, water = false, pose = "sad", drop = 1, eyes, mouth = "0", shiver = 0, sweat, breath = 0, slump = 0, face }: { x: number; y: number; s: number; tilt?: number; water?: boolean; pose?: string; drop?: number; eyes?: 0 | 1; mouth?: string; shiver?: number; sweat?: boolean; breath?: number; slump?: number; face?: "relief" }) => {
  const f = useCurrentFrame();
  const by = (1 - drop) * -600;
  const sway = Math.sin(f / 23) * 1.5;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${Math.sin(f * 2.3) * shiver}px, ${Math.cos(f * 3.1) * shiver * 0.5 + slump}px) rotate(${tilt + sway}deg)`, transformOrigin: `${x}px ${y}px` }}>
      <svg width={800 * s} height={560 * s} viewBox="-400 -120 800 560" style={{ position: "absolute", left: x - 400 * s, top: y - 120 * s, ...ink }}>
        {!water && (
          <g>
            <ellipse cx={20} cy={392} rx={260} ry={22} fill="rgba(43,29,20,0.28)" />
            {/* 판 밑의 몸: 무게에 눌려 무릎이 살짝 굽음 */}
            <path d="M -110 100 L 110 100 C 128 200 138 290 120 360 L -116 360 C -136 290 -126 200 -110 100 Z" fill={KID.robe} stroke={INK} strokeWidth={7} />
            <path d="M -128 250 L 132 250" stroke={KID.trim} strokeWidth={12} />
            <path d="M 0 104 L 6 250" stroke={KID.trim} strokeWidth={7} />
            <path d="M -96 360 L -70 400 M 96 360 L 74 400" stroke={INK} strokeWidth={4} />
            <ellipse cx={-62} cy={392} rx={52} ry={20} fill={KID.boot} stroke={INK} strokeWidth={6} />
            <ellipse cx={70} cy={392} rx={52} ry={20} fill={KID.boot} stroke={INK} strokeWidth={6} />
            {/* 판 밑으로 들어간 팔 (소매) */}
            <path d="M -120 110 C -170 110 -200 90 -210 70 L -170 64 C -160 84 -140 92 -110 96 Z" fill={KID.dark} stroke={INK} strokeWidth={5} />
            <path d="M 120 110 C 170 110 200 90 210 70 L 170 64 C 160 84 140 92 110 96 Z" fill={KID.dark} stroke={INK} strokeWidth={5} />
          </g>
        )}
        <g transform={`translate(0 ${by})`}>
          {/* 판 앞면(두께) + 윗면 */}
          <path d="M -340 66 L 340 66 L 336 114 L -336 114 Z" fill="#6e4e2c" stroke={INK} strokeWidth={7} />
          <path d="M -292 -44 L 292 -44 L 340 66 L -340 66 Z" fill="#a47a4c" stroke={INK} strokeWidth={7} />
          {/* 나뭇결·이음매·쇠못 */}
          <path d="M -250 -20 C -150 -24 -90 -18 -60 -22 M 70 -20 C 140 -26 210 -18 262 -22 M -300 30 C -220 26 -150 34 -90 30 M 100 34 C 190 28 250 36 316 32 M -200 52 L -120 50 M 140 50 L 230 52" stroke="#7c5832" strokeWidth={4} fill="none" />
          <path d="M 0 -44 L 0 66" stroke={INK} strokeWidth={5} />
          <path d="M 0 66 L 0 114" stroke={INK} strokeWidth={4} />
          {[-300, -236, 236, 300].map((cx) => <circle key={cx} cx={cx} cy={cx < 0 ? -10 + (cx + 300) / 3 : -10 + (300 - cx) / 3} r={7} fill="#4a4a48" stroke={INK} strokeWidth={3} />)}
          {/* 목 구멍 (머리가 여기서 나옴) */}
          <ellipse cx={0} cy={8} rx={74} ry={26} fill="#2a1c10" stroke={INK} strokeWidth={6} />
          {/* 손목 구멍 + 끼인 두 손 */}
          {[-206, 206].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={44} rx={34} ry={12} fill="#2a1c10" stroke={INK} strokeWidth={5} />
              <path d={`M ${cx - 20} 44 C ${cx - 26} 14 ${cx - 16} -4 ${cx} -6 C ${cx + 16} -4 ${cx + 26} 14 ${cx + 20} 44 Z`} fill={KID.skin} stroke={INK} strokeWidth={5} />
              <path d={`M ${cx - 9} 2 L ${cx - 9} 18 M ${cx + 1} 0 L ${cx + 1} 18 M ${cx + 11} 4 L ${cx + 11} 18`} stroke={INK} strokeWidth={3} />
              <path d={`M ${cx - 24} 40 C ${cx - 10} 46 ${cx + 10} 46 ${cx + 24} 40`} stroke="#5a3a20" strokeWidth={6} fill="none" />
            </g>
          ))}
        </g>
      </svg>
      {/* 얼굴 (판 위로) + 땀 + 입김 */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${by * s + slump * 0.4}px)` }}>
        <Head id="temujin_child" pose={pose} x={x} y={y + 10 * s} s={s * 1.02} rot={-tilt * 0.6 + 4 + slump * 0.15} eyes={eyes} mouth={mouth} bare={face === "relief"}>
          {face === "relief" && (
            <g stroke={INK} strokeLinecap="round" fill="none">
              {[265, 335].map((ex) => (
                <g key={ex}>
                  <path d={`M ${ex - 11} 421 Q ${ex} 429 ${ex + 11} 421`} strokeWidth={3.6} />
                  <path d={`M ${ex - 8} 433 Q ${ex} 436 ${ex + 8} 433`} strokeWidth={2} opacity={0.35} />
                </g>
              ))}
              <path d="M 252 404 L 278 397" strokeWidth={3.4} />
              <path d="M 322 397 L 348 404" strokeWidth={3.4} />
              <ellipse cx={300} cy={472} rx={6.5} ry={8.5} fill="#5a2a20" strokeWidth={2.6} />
            </g>
          )}
        </Head>
        {breath > 0 && (
          <svg width={260 * s} height={140 * s} viewBox="0 0 260 140" style={{ position: "absolute", left: x + 40 * s, top: y - 150 * s, opacity: Math.sin(Math.PI * Math.min(1, breath)) * 0.75, ...ink }}>
            {[0, 1, 2].map((i) => <ellipse key={i} cx={40 + i * 50 + breath * 60} cy={90 - i * 16 - breath * 20} rx={22 + i * 10 + breath * 14} ry={14 + i * 6 + breath * 8} fill="#dfe6ea" opacity={0.7 - i * 0.15} />)}
          </svg>
        )}
        {(sweat ?? (pose !== "shocked" && !water)) && [
          <svg key="a" width={60 * s} height={80 * s} viewBox="0 0 60 80" style={{ position: "absolute", left: x + 96 * s, top: y - 120 * s + ((f / 2) % 30) * s, opacity: 0.85, ...ink }}>
            <path d="M 30 6 C 44 34 50 48 30 60 C 10 48 16 34 30 6 Z" fill="#cfe3ea" stroke={INK} strokeWidth={4} />
          </svg>,
          <svg key="b" width={44 * s} height={60 * s} viewBox="0 0 60 80" style={{ position: "absolute", left: x - 120 * s, top: y - 150 * s + (((f + 17) / 2.4) % 30) * s, opacity: 0.8, ...ink }}>
            <path d="M 30 6 C 44 34 50 48 30 60 C 10 48 16 34 30 6 Z" fill="#cfe3ea" stroke={INK} strokeWidth={4} />
          </svg>,
        ]}
      </div>
    </div>
  );
};
// 수레 (소가 끄는, 걷은 게르 뭉치를 실음) - 오른쪽으로 감
const Cart = ({ x, y, s = 1, ox = "ox" }: { x: number; y: number; s?: number; ox?: "ox" | "camel" }) => {
  const f = useCurrentFrame();
  const wr = (x / (60 * s)) * 57;
  const leg = Math.sin(f / 5) * 10;
  return (
    <svg width={560 * s} height={300 * s} viewBox="0 0 560 300" style={{ position: "absolute", left: x - 280 * s, top: y - 280 * s, ...ink }}>
      {/* 짐: 둘둘 만 펠트 + 격자벽 + 서까래 */}
      <path d="M 40 130 L 60 70 L 120 70 L 140 130 Z" fill="#c8b998" stroke={INK} strokeWidth={5} />
      <path d="M 52 110 L 128 80 M 52 80 L 128 110" stroke="#8a6440" strokeWidth={4} />
      <rect x={110} y={58} width={170} height={72} rx={36} fill="#ece3cf" stroke={INK} strokeWidth={5} />
      <path d="M 150 60 L 150 130 M 200 58 L 200 130 M 245 60 L 245 130" stroke="#b8a888" strokeWidth={4} />
      <path d="M 70 64 L 300 40 M 80 60 L 310 30" stroke="#8a6440" strokeWidth={6} strokeLinecap="round" />
      {/* 수레 바닥 + 끌채 */}
      <path d="M 30 130 L 300 130 L 300 150 L 30 150 Z" fill="#8a6440" stroke={INK} strokeWidth={5} />
      <path d="M 300 140 L 400 160" stroke={INK} strokeWidth={9} />
      {/* 큰 바퀴 */}
      <g transform={`rotate(${wr} 150 200)`}>
        <circle cx={150} cy={200} r={62} fill="none" stroke={INK} strokeWidth={10} />
        {[0, 45, 90, 135].map((a) => <path key={a} d={`M ${150 + Math.cos((a * Math.PI) / 180) * 58} ${200 + Math.sin((a * Math.PI) / 180) * 58} L ${150 - Math.cos((a * Math.PI) / 180) * 58} ${200 - Math.sin((a * Math.PI) / 180) * 58}`} stroke="#6e4e2c" strokeWidth={7} />)}
        <circle cx={150} cy={200} r={12} fill="#6e4e2c" stroke={INK} strokeWidth={4} />
      </g>
      {ox === "ox" ? (
        <g>
          {/* 소 */}
          <path d={`M 400 186 L ${396 + leg} 262 M 430 190 L ${434 - leg} 262 M 490 190 L ${486 - leg} 262 M 516 186 L ${520 + leg} 262`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <ellipse cx={460} cy={170} rx={80} ry={44} fill="#7a5638" stroke={INK} strokeWidth={6} />
          <ellipse cx={540} cy={160} rx={30} ry={24} fill="#7a5638" stroke={INK} strokeWidth={6} />
          <path d="M 528 138 C 520 118 532 112 540 120 M 552 138 C 562 116 552 110 546 120" stroke="#e8dcc0" strokeWidth={6} fill="none" />
          <circle cx={548} cy={156} r={4} fill={INK} />
        </g>
      ) : (
        <g>
          {/* 낙타 */}
          <path d={`M 410 190 L ${406 + leg} 272 M 436 192 L ${440 - leg} 272 M 490 192 L ${486 - leg} 272 M 512 188 L ${516 + leg} 272`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
          <path d="M 396 190 C 396 150 420 110 446 140 C 460 100 490 110 500 150 C 530 150 520 100 540 70 L 560 76 C 560 120 540 196 500 196 Z" fill="#b8925c" stroke={INK} strokeWidth={6} />
          <circle cx={552} cy={82} r={4} fill={INK} />
        </g>
      )}
    </svg>
  );
};
// 서서히 도는 사람(실루엣): k 0→1 동안 폭이 줄었다 늘며 앞 그림 → 뒤 그림으로
const Turning = ({ k, a, b }: { k: number; a: React.ReactNode; b: React.ReactNode }) => (
  <AbsoluteFill style={{ transform: `scaleX(${Math.max(0.28, Math.abs(Math.cos(Math.PI * k)))})`, transformOrigin: "var(--tx) 100%" }}>{k < 0.5 ? a : b}</AbsoluteFill>
);

// 소매 팔: 어깨(x1,y1) → 손목(x2,y2), 어깨 쪽이 넓고 손목에 장식 띠 (막대처럼 보이지 않게)
const Sleeve = ({ x1, y1, x2, y2, w1 = 54, w2 = 38, color, trim }: { x1: number; y1: number; x2: number; y2: number; w1?: number; w2?: number; color: string; trim: string }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const ux = dx / len;
  const uy = dy / len;
  const p = (x: number, y: number, w: number, sgn: number) => `${x + nx * w * 0.5 * sgn} ${y + ny * w * 0.5 * sgn}`;
  const mx = x1 + dx * 0.5 + nx * 6;
  const my = y1 + dy * 0.5 + ny * 6;
  const cx = x2 - ux * 10;
  const cy = y2 - uy * 10;
  return (
    <g>
      <path d={`M ${p(x1, y1, w1, 1)} Q ${mx + nx * w1 * 0.45} ${my + ny * w1 * 0.45} ${p(x2, y2, w2 + 8, 1)} L ${p(x2, y2, w2 + 8, -1)} Q ${mx - nx * w1 * 0.4} ${my - ny * w1 * 0.4} ${p(x1, y1, w1, -1)} Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${p(cx, cy, w2 + 8, 1)} L ${p(cx, cy, w2 + 8, -1)}`} stroke={trim} strokeWidth={9} />
      <path d={`M ${p(cx, cy, w2 + 8, 1)} L ${p(cx, cy, w2 + 8, -1)}`} stroke={INK} strokeWidth={2} opacity={0.5} />
    </g>
  );
};
// 막대를 쥔 손 (주먹 + 손가락 마디)
const Grip = ({ x, y, rot = 0, skin = SKIN }: { x: number; y: number; rot?: number; skin?: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={0} rx={24} ry={19} fill={skin} stroke={INK} strokeWidth={5} />
    <path d="M 10 -14 L 10 12 M 0 -16 L 0 14 M -10 -14 L -10 12" stroke={INK} strokeWidth={2.5} opacity={0.7} />
    <path d="M -22 -4 C -30 -10 -28 -20 -16 -18" fill={skin} stroke={INK} strokeWidth={4} />
  </g>
);
// 코드로 그린 옆얼굴 (오른쪽을 봄, 가운데 (0,0), 반지름 r): 둥근 얼굴·점 눈·먹선
type HatKind = "fur" | "scarf" | "elder" | "tufts" | "cap";
const DrawnHead = ({ hat, color = "#7a5638", r = 46, mood = "sad", skin = SKIN }: { hat: HatKind; color?: string; r?: number; mood?: "sad" | "neutral" | "sleepy" | "blank"; skin?: string }) => (
  <g>
    {hat === "scarf" && <path d={`M ${-r * 0.6} ${-r * 0.4} C ${-r * 1.3} ${r * 0.2} ${-r * 1.3} ${r * 1.1} ${-r * 0.9} ${r * 1.5} L ${-r * 0.5} ${r * 1.3} C ${-r * 0.7} ${r * 0.8} ${-r * 0.4} ${r * 0.3} 0 0 Z`} fill={color} stroke={INK} strokeWidth={5} />}
    {hat === "tufts" && [-1, 1].map((k) => <ellipse key={k} cx={-r * 0.85} cy={k * r * 0.12 + r * 0.25} rx={r * 0.24} ry={r * 0.4} fill="#3a2b22" stroke={INK} strokeWidth={4} transform={`rotate(${k * 12} ${-r * 0.55} ${r * 0.25})`} />)}
    <circle cx={0} cy={0} r={r} fill={skin} stroke={INK} strokeWidth={5} />
    {/* 코 */}
    <path d={`M ${r * 0.93} ${-r * 0.12} C ${r * 1.16} ${r * 0.02} ${r * 1.12} ${r * 0.16} ${r * 0.92} ${r * 0.18}`} fill={skin} stroke={INK} strokeWidth={4} />
    {/* 귀 */}
    {hat !== "scarf" && <ellipse cx={-r * 0.18} cy={r * 0.08} rx={r * 0.16} ry={r * 0.22} fill={skin} stroke={INK} strokeWidth={4} />}
    {/* 눈·눈썹·입 */}
    {mood === "sleepy" ? (
      <path d={`M ${r * 0.38} ${-r * 0.06} q ${r * 0.12} ${r * 0.08} ${r * 0.24} 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    ) : (
      <ellipse cx={r * 0.5} cy={-r * 0.06} rx={r * 0.09} ry={r * 0.13} fill={INK} />
    )}
    <path d={mood === "sad" ? `M ${r * 0.34} ${-r * 0.32} L ${r * 0.66} ${-r * 0.4}` : `M ${r * 0.34} ${-r * 0.36} L ${r * 0.66} ${-r * 0.36}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <circle cx={r * 0.38} cy={r * 0.3} r={r * 0.14} fill="#e59a7e" opacity={0.5} />
    <path d={mood === "sad" ? `M ${r * 0.56} ${r * 0.5} q ${r * 0.14} ${-r * 0.08} ${r * 0.26} 0` : `M ${r * 0.56} ${r * 0.48} l ${r * 0.26} 0`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    {(hat === "fur" || hat === "elder") && (
      <g>
        <path d={`M ${-r * 0.92} ${-r * 0.3} C ${-r * 0.9} ${-r * 1.5} ${r * 0.9} ${-r * 1.5} ${r * 0.92} ${-r * 0.3} Z`} fill={color} stroke={INK} strokeWidth={5} />
        <rect x={-r * 1.06} y={-r * 0.5} width={r * 2.1} height={r * 0.38} rx={r * 0.18} fill="#6b4a2e" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M ${-r * 0.9 + i * r * 0.34} ${-r * 0.16} q ${r * 0.06} ${-r * 0.18} ${r * 0.12} 0`} stroke="#4a3220" strokeWidth={3} fill="none" />)}
      </g>
    )}
    {hat === "cap" && <path d={`M ${-r * 0.95} ${-r * 0.25} C ${-r * 0.9} ${-r * 1.25} ${r * 0.9} ${-r * 1.25} ${r * 0.95} ${-r * 0.25} L ${r * 1.15} ${-r * 0.2} L ${-r * 1.0} ${-r * 0.15} Z`} fill={color} stroke={INK} strokeWidth={5} />}
    {hat === "tufts" && <path d={`M ${-r * 0.7} ${-r * 0.7} C ${-r * 0.2} ${-r * 1.1} ${r * 0.4} ${-r * 1.0} ${r * 0.7} ${-r * 0.7}`} stroke="#8a6a50" strokeWidth={3} fill="none" opacity={0.6} />}
    {hat === "scarf" && <path d={`M ${-r * 1.04} ${r * 0.3} C ${-r * 1.12} ${-r * 1.3} ${r * 0.9} ${-r * 1.4} ${r * 0.96} ${-r * 0.3} C ${r * 0.6} ${-r * 0.62} ${-r * 0.2} ${-r * 0.7} ${-r * 0.5} ${-r * 0.1} C ${-r * 0.6} ${r * 0.2} ${-r * 0.7} ${r * 0.4} ${-r * 1.04} ${r * 0.3} Z`} fill={color} stroke={INK} strokeWidth={5} />}
    {hat === "elder" && <path d={`M ${r * 0.1} ${r * 0.62} C ${r * 0.2} ${r * 1.5} ${r * 0.8} ${r * 1.4} ${r * 0.96} ${r * 0.4} C ${r * 0.7} ${r * 0.62} ${r * 0.4} ${r * 0.7} ${r * 0.1} ${r * 0.62} Z`} fill="#ece6da" stroke={INK} strokeWidth={4} />}
  </g>
);
// 걸어서 떠나는 부족민 (전용 그림, 오른쪽으로 걷는 옆모습). (x,y) = 발, sc = 크기
type FolkKind = { hat: HatKind; hatColor: string; robe: string; trim: string; load?: "bundle" | "pot" | "staff" | "none"; long?: boolean; sc: number; mood?: "sad" | "neutral" };
const Folk = ({ x, y, k, walk, lookBack = false }: { x: number; y: number; k: FolkKind; walk: number; lookBack?: boolean }) => {
  const sw = Math.sin(walk) * 16;
  const sc = k.sc;
  const bob = -Math.abs(Math.sin(walk)) * 6;
  return (
    <svg width={320 * sc} height={400 * sc} viewBox="-160 -360 320 400" style={{ position: "absolute", left: x - 160 * sc, top: y - 360 * sc, ...ink }}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="rgba(43,29,20,0.25)" />
      <g transform={`translate(0 ${bob})`}>
        {/* 다리·장화 */}
        {!k.long && [-1, 1].map((sgn) => (
          <g key={sgn}>
            <path d={`M ${sgn * 12} -50 L ${sgn * 12 + sgn * sw} -8`} stroke={INK} strokeWidth={26} strokeLinecap="round" />
            <path d={`M ${sgn * 12} -50 L ${sgn * 12 + sgn * sw} -8`} stroke="#4a3a2c" strokeWidth={16} strokeLinecap="round" />
            <ellipse cx={sgn * 12 + sgn * sw + 10} cy={-2} rx={24} ry={11} fill="#3a2b22" stroke={INK} strokeWidth={4} />
          </g>
        ))}
        {k.long && [-1, 1].map((sgn) => <ellipse key={sgn} cx={sgn * sw * 0.6 + 12} cy={-2} rx={22} ry={10} fill="#3a2b22" stroke={INK} strokeWidth={4} />)}
        {/* 등짐 (뒤 = 왼쪽) */}
        {k.load === "bundle" && (
          <g>
            <ellipse cx={-62} cy={-170} rx={44} ry={66} fill="#d8ccb0" stroke={INK} strokeWidth={5} />
            <path d="M -96 -200 L -28 -190 M -100 -150 L -26 -140" stroke="#8a6440" strokeWidth={5} />
          </g>
        )}
        {k.load === "pot" && <path d="M -96 -200 C -110 -160 -96 -120 -60 -118 C -24 -120 -14 -160 -30 -200 Z" fill="#7a6a5a" stroke={INK} strokeWidth={5} />}
        {/* 몸 (델) */}
        <path d={k.long ? "M -40 -200 L 34 -200 C 52 -140 62 -70 66 -10 L -60 -10 C -58 -80 -54 -150 -40 -200 Z" : "M -40 -200 L 34 -200 C 48 -150 56 -100 58 -48 L -56 -48 C -54 -110 -52 -160 -40 -200 Z"} fill={k.robe} stroke={INK} strokeWidth={6} />
        <path d="M 4 -198 C 18 -170 26 -140 30 -120" stroke={k.trim} strokeWidth={8} fill="none" />
        <path d={`M -52 -116 L 50 -116`} stroke={k.trim} strokeWidth={12} />
        {/* 팔 (걸으며 흔듦) */}
        {k.load === "staff" ? (
          <g>
            <path d="M 70 -170 L 52 0" stroke={INK} strokeWidth={14} strokeLinecap="round" />
            <path d="M 70 -170 L 52 0" stroke="#8a6440" strokeWidth={7} strokeLinecap="round" />
            <Sleeve x1={-4} y1={-188} x2={56} y2={-118} w1={40} w2={28} color={k.robe} trim={k.trim} />
            <Grip x={62} y={-110} />
          </g>
        ) : (
          <g>
            <Sleeve x1={-4} y1={-188} x2={-4 + sw * 2.2} y2={-110} w1={40} w2={28} color={k.robe} trim={k.trim} />
            <circle cx={-4 + sw * 2.4} cy={-98} r={14} fill={SKIN} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {/* 머리 */}
        <g transform={`translate(4 -262) scale(${lookBack ? -1 : 1} 1)`}>
          <DrawnHead hat={k.hat} color={k.hatColor} r={58} mood={k.mood ?? "sad"} />
        </g>
      </g>
    </svg>
  );
};
const FOLK: FolkKind[] = [
  { hat: "elder", hatColor: "#8a6a48", robe: "#7a6a50", trim: "#4a3a2c", load: "staff", sc: 1.15 }, // 지팡이 짚은 노인 (맨 뒤 - 한 번 돌아봄)
  { hat: "scarf", hatColor: "#8a3b2c", robe: "#4e6e6a", trim: "#c9a24e", load: "bundle", long: true, sc: 1.1 }, // 짐을 진 여자
  { hat: "cap", hatColor: "#3d556e", robe: "#b5863a", trim: "#7a5230", sc: 0.78, mood: "neutral" }, // 아이
  { hat: "fur", hatColor: "#5a4030", robe: "#8a5a2b", trim: "#3a2b22", load: "bundle", sc: 1.28 }, // 큰 짐을 진 남자
  { hat: "scarf", hatColor: "#3e5a7a", robe: "#6b5a7a", trim: "#c8a27c", load: "pot", long: true, sc: 1.05 }, // 솥을 진 여자
  { hat: "fur", hatColor: "#6e5236", robe: "#5a6a4a", trim: "#c9a24e", sc: 1.2, mood: "neutral" }, // 남자
];

// 강가 낚시 장면 (c1_05, c1_06 앞부분 공용). t0 = 시작 시각(이어지는 장면에서 물고기·뿌리 상태를 이어 감),
// raid = 타이치우드 기병이 들이닥친 프레임(없으면 null): 기병이 달려와 아이를 낚아채 끌고 감, 낚싯대가 떨어지고 물고기가 튐
const CATCH = 80;
const Fishing = ({ t0 = 0, raid = null }: { t0?: number; raid?: number | null }) => {
  const fr = useCurrentFrame();
  const f = fr + t0;
  const dig = raid !== null && fr >= raid ? 0 : Math.max(0, Math.sin(f / 6));
  const fish = interpolate(f, [CATCH, CATCH + 12], [0, 1], { ...clamp, easing: ease });
  const lift = interpolate(f, [CATCH, CATCH + 8, CATCH + 18], [0, 1, 0.6], clamp);
  const roots = Math.max(1, Math.min(5, 2 + Math.floor(f / 28))); // t0가 음수(물고기를 늦게 낚음)여도 0 밑으로 안 내려감
  const pan = interpolate(f, [0, 142], [30, -30], clamp);
  // 습격: r = 습격부터 프레임. 0~22 기병이 왼쪽에서 달려옴 → 22 낚아챔 → 돌아서 왼쪽으로 끌고 감
  const r = raid === null ? -1 : fr - raid;
  const GRAB = 22;
  const grabbed = r >= GRAB;
  const riderX = r < 0 ? -900 : r < GRAB ? interpolate(r, [0, GRAB], [-700, 820], { easing: ease }) : interpolate(r, [GRAB, GRAB + 6, GRAB + 46], [820, 840, -800], { ...clamp, easing: (t) => t * t });
  const back = r >= GRAB + 4;
  const rodFall = interpolate(r, [GRAB, GRAB + 22], [0, 1], { ...clamp, easing: (t) => t * t });
  const fishFly = interpolate(r, [GRAB, GRAB + 26], [0, 1], clamp);
  const sh = shake(r, GRAB, 10, 16);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <AbsoluteFill style={{ transform: `translateX(${pan}px) scale(1.04)` }}>
        <Steppe time="day" horizon={520} />
        <Glow x={500} y={300} r={600} op={0.25} color="#fff2c8" />
        {/* 강 + 둑 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 1080 1090 L 1080 900 C 1150 880 1180 850 1196 806 C 1230 730 1250 670 1290 620 L 1940 620 L 1940 1090 Z" fill="#9db7b3" stroke={INK} strokeWidth={5} />
          <path d="M 1196 806 C 1180 850 1150 880 1080 900 L 1080 940 C 1150 920 1190 890 1210 850 Z" fill="#8a6c46" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 1320 + ((i * 167 + f * 1.3) % 600);
            const y = 660 + ((i * 53) % 400);
            return <path key={i} d={`M ${x} ${y} q 30 -8 60 0`} stroke="#e8f0e6" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />;
          })}
          {[0, 1].map((i) => {
            const t = (f + i * 30) % 60;
            return <ellipse key={i} cx={1574} cy={800} rx={10 + t} ry={(10 + t) * 0.22} fill="none" stroke="#e8f0e6" strokeWidth={3} opacity={1 - t / 60} />;
          })}
          {fish > 0 && <ellipse cx={1574} cy={800} rx={30 + fish * 70} ry={(30 + fish * 70) * 0.22} fill="none" stroke="#fff" strokeWidth={5} opacity={1 - fish} />}
          {/* 떨어지는 낚싯대 + 튀는 물고기 + 물보라 */}
          {grabbed && (
            <g>
              <g transform={`translate(${1190 + rodFall * 160} ${730 + rodFall * 130}) rotate(${-30 + rodFall * 50})`}>
                <path d="M -40 0 L 380 0" stroke={INK} strokeWidth={10} strokeLinecap="round" />
                <path d="M -40 0 L 380 0" stroke="#8a6440" strokeWidth={5} strokeLinecap="round" />
              </g>
              {fishFly < 1 && (
                <g transform={`translate(${1560 + fishFly * 220} ${560 - Math.sin(fishFly * Math.PI) * 260 + fishFly * 260}) rotate(${fishFly * 540})`}>
                  <path d="M -26 0 C -10 -16 16 -16 22 0 C 16 16 -10 16 -26 0 Z" fill="#b9c4b8" stroke={INK} strokeWidth={4} />
                  <path d="M 22 0 L 38 -12 L 38 12 Z" fill="#b9c4b8" stroke={INK} strokeWidth={4} />
                </g>
              )}
              {[0, 1].map((i) => {
                const t = Math.max(0, r - GRAB - 14 - i * 8);
                return <ellipse key={i} cx={1350} cy={880} rx={20 + t * 4} ry={(20 + t * 4) * 0.22} fill="none" stroke="#fff" strokeWidth={4} opacity={t > 0 ? Math.max(0, 1 - t / 24) : 0} />;
              })}
            </g>
          )}
        </svg>
        <Roots x={720} y={1000} n={roots} />
        <SquatHoelun x={430} y={640} s={0.95} d={dig} pose={r >= 6 ? "shocked" : "side"} />
        {dig > 0.85 && <svg width={80} height={60} style={{ position: "absolute", left: 600, top: 900, ...ink }}><circle cx={20} cy={30} r={7} fill="#7c5c38" /><circle cx={50} cy={18} r={5} fill="#7c5c38" /></svg>}
        <SitKid x={940} y={720} s={0.56} tip={[1380, 620]} lineTo={850} sib />
        {!grabbed && <SitKid x={1100} y={640} s={0.8} tip={[1570, 560]} lineTo={800} fish={fish} lift={lift} mouth={r >= 4 ? "1" : f >= CATCH ? "2" : "0"} />}
        {/* 타이치우드 기병 (낚아채 끌고 감) - 아이는 겁에 질려 버둥댐 */}
        {r >= 0 && (
          <>
            <Rider kind="mongol2" x={riderX - 440} y={420} w={440} flip={back} phase={9} />
            <Rider kind="mongol2" x={riderX} y={470} w={540} flip={back} phase={3} />
            {grabbed && (
              <div style={{ position: "absolute", left: riderX + (back ? 60 : 300), top: 420, width: 330, height: 400, transform: `rotate(${back ? 62 : -55}deg)`, transformOrigin: "50% 50%" }}>
                <Character id="temujin_child" height={400} pose="shocked" enter="none" beat="jump" beatAt={0} flip={back} />
              </div>
            )}
          </>
        )}
      </AbsoluteFill>
      {CATCH - t0 >= 0 && <SFX name="swish" at={CATCH - t0} vol={0.3} />}
      {raid !== null && <SFX name="gallop" at={raid} vol={0.4} dur={80} />}
      {raid !== null && <SFX name="hit" at={raid + GRAB} vol={0.35} />}
    </AbsoluteFill>
  );
};

// 밤 강가 배경 (c1_08 뒷부분 ~ c1_10 공용)
const WATER = 800;
const NightRiver = ({ rings = true }: { rings?: boolean }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Steppe time="night" horizon={470} />
      <AbsoluteFill style={{ background: "linear-gradient(rgba(10,14,24,0) 30%, rgba(10,14,24,.35))" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M -20 600 C 400 590 800 640 1200 650 C 1500 656 1700 630 1940 640 L 1940 820 L -20 820 Z" fill="#232a29" stroke={INK} strokeWidth={5} />
        <path d={`M -20 ${WATER} C 500 ${WATER - 10} 1300 ${WATER + 6} 1940 ${WATER - 4} L 1940 1090 L -20 1090 Z`} fill="#1a2e40" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 1420 + Math.sin(i * 1.9 + f / 30) * 90 + (i % 3) * 30;
          const y = WATER + 24 + i * 19;
          return <path key={i} d={`M ${x} ${y} q 40 -5 80 0`} stroke="#d6dde0" strokeWidth={3} opacity={0.32} fill="none" strokeLinecap="round" />;
        })}
        {rings && [0, 1, 2].map((i) => {
          const t = (f + i * 40) % 120;
          return <ellipse key={i} cx={880} cy={WATER + 70} rx={330 + t * 1.6} ry={(330 + t * 1.6) * 0.14} fill="none" stroke="#9fb4c0" strokeWidth={3} opacity={0.45 * (1 - t / 120)} />;
        })}
      </svg>
    </>
  );
};
// 수색꾼 실루엣의 흰 눈 두 개 (점 눈, 눈동자가 보는 쪽으로). 캐릭터 판(600×720) 좌표 - archer 눈 자리
const ManEyes = ({ x, h, bottom, side, flip, look }: { x: number; h: number; bottom: number; side: boolean; flip: boolean; look: [number, number] }) => {
  const w = (h * 600) / 720;
  const eyes = side ? [292, 356] : [263, 337];
  return (
    <div style={{ position: "absolute", left: x - w / 2, bottom, width: w, height: h, transform: flip ? "scaleX(-1)" : undefined }}>
      <svg viewBox="0 0 600 720" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {eyes.map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={338} rx={12} ry={14} fill="#f4efe2" />
            <circle cx={ex + look[0]} cy={340 + look[1]} r={5.5} fill="#120c08" />
          </g>
        ))}
      </svg>
    </div>
  );
};

// =====================================================================
// 7판 공용 도구 (2장 M01Ch2.tsx와 같은 것: 구간 lerp·카메라·매·신혼 수레·먼지·게르 안·양·진영·호위병·계절)
// =====================================================================
const sec = (s: number) => Math.round(s * FPS);
// 구간 [a,b]가 줄 길이 변화로 뒤집히거나 0이 되어도 깨지지 않게 (그때는 b에서 바로 to)
const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
// 카메라: 배율·초점(화면 좌표)을 한 번에. 초점 (cx,cy)가 화면 가운데 오도록 밀어 넣음 (가장자리 검은 틈 안 생기게 잘라 맞춤)
const Cam = ({ z = 1, cx = 960, cy = 540, sx = 0, sy = 0, children }: { z?: number; cx?: number; cy?: number; sx?: number; sy?: number; children: React.ReactNode }) => {
  const tx = Math.max(Math.min(960 - cx * z, 0), 1920 - 1920 * z) + sx;
  const ty = Math.max(Math.min(540 - cy * z, 0), 1080 - 1080 * z) + sy;
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "0 0" }}>{children}</AbsoluteFill>;
};
// 말하는 중인지: 화면은 모든 언어가 같으니 줄 길이(slot) 기준 - kit의 talkingAt은 영어 길이라 새 줄(영어 아직 없음)에선 늘 꺼짐
const speaking = (f: number, at: number, id: string) => f >= at && f < at + Math.ceil(slotSec(id) * FPS);
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
    <path d="M 150 -70 C 160 -120 260 -120 270 -80 L 290 -90 C 300 -70 290 -50 276 -46 L 270 -10 L 252 -10 L 248 -40 L 180 -40 L 176 -10 L 158 -10 Z" fill="#7a5a3a" stroke={INK} strokeWidth={5} />
    <path d="M 270 -98 C 280 -116 296 -112 300 -104 M 262 -98 C 256 -116 240 -116 236 -108" stroke="#e8dcc0" strokeWidth={5} fill="none" />
    <path d="M 150 -60 L 100 -60" stroke="#6a4a2e" strokeWidth={8} />
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
// 게르 안: 격자 벽·지붕 살·천장 구멍
const GerInside = ({ dark = 0.5 }: { dark?: number }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #6a523a, #2a1f17 75%)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      {Array.from({ length: 26 }).map((_, i) => <path key={i} d={`M ${-100 + i * 90} 430 L ${-10 + i * 90} 780`} stroke="#5a442e" strokeWidth={5} />)}
      {Array.from({ length: 26 }).map((_, i) => <path key={`b${i}`} d={`M ${-10 + i * 90} 430 L ${-100 + i * 90} 780`} stroke="#5a442e" strokeWidth={5} />)}
      {Array.from({ length: 15 }).map((_, i) => <path key={`r${i}`} d={`M 960 90 L ${-200 + i * 165} 430`} stroke="#7a5230" strokeWidth={9} />)}
      <ellipse cx={960} cy={90} rx={120} ry={34} fill="#d8c8a0" stroke={INK} strokeWidth={6} />
      <path d="M 0 780 L 1920 780 L 1920 1080 L 0 1080 Z" fill="#4a3626" stroke={INK} strokeWidth={5} />
      <ellipse cx={960} cy={900} rx={520} ry={90} fill="#7a3a2a" stroke={INK} strokeWidth={4} opacity={0.75} />
    </svg>
    <Dim op={dark} />
  </AbsoluteFill>
);
const Sheep = ({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) => (
  <svg width={130 * s} height={90 * s} viewBox="0 0 130 90" style={{ position: "absolute", left: x - 65 * s, top: y - 90 * s, transform: flip ? "scaleX(-1)" : undefined, ...ink }}>
    {[40, 62, 84].map((xx) => <path key={xx} d={`M ${xx} 60 L ${xx - 2} 88`} stroke={INK} strokeWidth={7} />)}
    <path d="M 20 52 C 10 30 30 14 50 20 C 60 6 90 8 96 24 C 116 26 118 56 100 62 C 90 72 40 74 30 66 C 16 66 12 58 20 52 Z" fill="#efe8d8" stroke={INK} strokeWidth={4} />
    <ellipse cx={108} cy={34} rx={14} ry={11} fill="#3a2f2a" stroke={INK} strokeWidth={3} />
  </svg>
);
// 진영 (게르 n채 + 툭 + 연기)
const Camp = ({ horizon, n = 6, dark = false, x0 = 90, span = 1740 }: { horizon: number; n?: number; dark?: boolean; x0?: number; span?: number }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, filter: dark ? "brightness(0.55)" : undefined }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = x0 + (i + 0.5) * (span / n) + ((i * 53) % 50) - 25;
        const w = 120 + ((i * 37) % 60);
        return <Ger key={i} x={x} y={horizon + 30 + (i % 3) * 14} w={w} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={dark ? 0.8 : 0} />;
      })}
      {Array.from({ length: Math.ceil(n / 2) }).map((_, i) => <Tug key={`t${i}`} x={x0 + 70 + (i + 0.7) * (span / Math.ceil(n / 2) - 10)} y={horizon + 40} h={200} sway={Math.sin((f + i * 13) / 14) * 4} />)}
      {[0, 1].map((i) => {
        const t = ((f + i * 40) % 80) / 80;
        return <div key={`s${i}`} style={{ position: "absolute", left: x0 + 510 + i * 700 - t * 30, top: horizon - 60 - t * 160, width: 80 + t * 80, height: 80 + t * 80, borderRadius: "50%", background: "radial-gradient(rgba(90,80,70,0.35), transparent 70%)", opacity: 1 - t }} />;
      })}
    </div>
  );
};
// 호위병 (병사 그림 + 창): 발 x, 키 h, bottom
const Guard = ({ x, h, bottom, flip = false, dark = 0, pose = "front" }: { x: number; h: number; bottom: number; flip?: boolean; dark?: number; pose?: string }) => {
  const sx = x + (flip ? -1 : 1) * h * 0.24;
  return (
    <div style={{ position: "absolute", inset: 0, filter: dark ? `brightness(${1 - dark})` : undefined }}>
      <svg width={40} height={h * 1.15} viewBox={`0 0 40 ${h * 1.15}`} style={{ position: "absolute", left: sx - 20, bottom: bottom + 10, ...ink }}>
        <path d={`M 20 ${h * 1.15} L 20 40`} stroke={INK} strokeWidth={10} />
        <path d={`M 20 ${h * 1.15} L 20 40`} stroke="#7a5230" strokeWidth={5} />
        <path d="M 20 2 L 8 44 L 32 44 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
        <path d="M 10 50 C 4 70 8 86 14 96 M 30 50 C 36 70 32 86 26 96" stroke="#a8332a" strokeWidth={6} fill="none" />
      </svg>
      <Char id="archer" x={x} h={h} pose={pose} flip={flip} bottom={bottom} enter="none" beat="none" />
    </div>
  );
};
// 계절 바탕 (가을 → 겨울 → 봄): 하늘·땅·나무 잎 색
const SEASON = [
  { sky: ["#e6cfa4", "#efd9b0"], land: ["#c9a35a", "#b08840"], leaf: "#c8762e", snow: 0 },
  { sky: ["#c9d0d6", "#e4e6e6"], land: ["#eef0ee", "#dfe3e3"], leaf: "#6a5a4a", snow: 1 },
  { sky: ["#dfe6d0", "#eef0dc"], land: ["#b9c88a", "#a3b672"], leaf: "#8cbf5a", snow: 0 },
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
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M 1640 760 L 1640 520 M 1640 600 L 1590 540 M 1640 580 L 1700 520" stroke="#5a3a24" strokeWidth={16} />
        {i !== 1 && <ellipse cx={1640} cy={480} rx={130} ry={100} fill={S.leaf} stroke={INK} strokeWidth={5} />}
        {i === 1 && <path d="M 1560 470 C 1600 440 1680 440 1720 470" stroke="#f4f4f2" strokeWidth={14} fill="none" />}
      </svg>
    </AbsoluteFill>
  );
};
// 눈보라 (흩날리는 눈송이)
const Snow = ({ n = 70, wind = 6 }: { n?: number; wind?: number }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const sp = 3 + (i % 5);
        const y = ((i * 137 + f * sp) % 1180) - 60;
        const x = (((i * 211 + f * wind + Math.sin((f + i * 9) / 12) * 30) % 2100) + 2100) % 2100 - 90;
        return <circle key={i} cx={x} cy={y} r={2.5 + (i % 3) * 1.6} fill="#fbfbf8" opacity={0.85} />;
      })}
    </svg>
  );
};
// 부족 깃발 (글자 없이 모양·색으로 부족을 구분 - 02 "세력은 깃발로"). kind: 0 삼각 · 1 네모 · 2 제비꼬리 · 3 긴 띠 · 4 둥근 끝
const BANNERS = [
  { shape: 0, c: "#b23a2c", mark: "sun" }, // 타타르 (붉은 삼각 + 해) - 2장 지도와 같은 모양
  { shape: 1, c: "#3f6690", mark: "cross" }, // 케레이트
  { shape: 2, c: "#c9963a", mark: "peak" }, // 나이만
  { shape: 3, c: "#4a4a44", mark: "none" }, // 메르키트 (검은 띠)
  { shape: 4, c: "#7a8a4a", mark: "dot" }, // 옹기라트 (보르테네)
  { shape: 1, c: "#8a4a6a", mark: "none" },
  { shape: 0, c: "#4f8a7c", mark: "dot" },
  { shape: 2, c: "#a8603a", mark: "none" },
  { shape: 3, c: "#6a5a8a", mark: "sun" },
];
const BannerG = ({ x, y, kind, h = 120, fall = 0, t = 0 }: { x: number; y: number; kind: number; h?: number; fall?: number; t?: number }) => {
  const B = BANNERS[kind % BANNERS.length];
  const w = Math.sin(t / 8 + x * 0.013) * 5;
  const k = h / 200;
  const cloth =
    B.shape === 0 ? `M 2 -196 L 104 ${-170 + w} L 2 -140 Z`
    : B.shape === 1 ? `M 2 -196 L 96 ${-196 + w} L 96 ${-130 + w} L 2 -130 Z`
    : B.shape === 2 ? `M 2 -196 L 110 ${-194 + w} L 86 ${-164 + w} L 110 ${-134 + w} L 2 -132 Z`
    : B.shape === 3 ? `M 2 -196 L 40 -196 C 70 ${-176 + w} 100 ${-120 + w} 120 ${-96 + w} C 90 ${-110 + w} 60 -140 2 -150 Z`
    : `M 2 -196 L 70 ${-196 + w} C 116 ${-190 + w} 116 ${-136 + w} 70 ${-132 + w} L 2 -132 Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${fall * 84}) scale(${k})`} opacity={1 - fall * 0.45}>
      <path d="M 0 0 L 0 -200" stroke={INK} strokeWidth={9} />
      <path d="M 0 0 L 0 -200" stroke="#6a4a2e" strokeWidth={4} />
      <path d={cloth} fill={B.c} stroke={INK} strokeWidth={4} />
      {B.mark === "sun" && <circle cx={34} cy={-168 + w / 3} r={12} fill="#f0c04a" stroke={INK} strokeWidth={3} />}
      {B.mark === "cross" && <path d={`M 50 -186 L 50 -140 M 30 -163 L 70 -163`} stroke="#f2ead8" strokeWidth={8} />}
      {B.mark === "peak" && <path d="M 22 -150 L 36 -166 L 46 -156 L 58 -172 L 70 -150" stroke={INK} strokeWidth={5} fill="none" />}
      {B.mark === "dot" && <circle cx={44} cy={-164 + w / 2} r={10} fill="#f2ead8" stroke={INK} strokeWidth={3} />}
      <path d="M -8 -204 L 0 -222 L 8 -204 Z" fill="#c9a24a" stroke={INK} strokeWidth={3} />
    </g>
  );
};
// 흰 툭 (몽골 - 테무친네): 지도 위 작은 것
const TugG = ({ x, y, h = 130, t = 0 }: { x: number; y: number; h?: number; t?: number }) => {
  const k = h / 200;
  const sw = Math.sin(t / 14) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M 0 0 L 0 -170" stroke={INK} strokeWidth={10} />
      <path d="M 0 0 L 0 -170" stroke="#7a5230" strokeWidth={5} />
      <path d="M 0 -200 L -10 -170 L 10 -170 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={-166} rx={18} ry={7} fill="#c9a24a" stroke={INK} strokeWidth={4} />
      <path d={`M -18 -160 C ${-26 + sw} -116 ${-22 + sw * 1.5} -76 ${-14 + sw * 2} -46 L ${14 + sw * 2} -46 C ${22 + sw * 1.5} -76 ${26 + sw} -116 18 -160 Z`} fill="#f2ead8" stroke={INK} strokeWidth={4} />
    </g>
  );
};

// =====================================================================
// 초원 지도 1160 (scripts/steppe-map.py → steppeMap.ts, 실제 해안선·강 + Cliopatria 나라 윤곽). 몽골 부족들은 깃발 자리로만
// 자리(화면 px): 오논강 고향 941,359 · 타타르 1210,348 · 메르키트 787,250 · 케레이트 799,414 · 나이만 230,430 · 옹기라트 1248,485 · 금 중도 1167,847
// =====================================================================
const HOME_P = [941, 372];
const TRIBE_P: [number, number, number][] = [
  [1205, 350, 0], [787, 262, 3], [790, 420, 1], [250, 440, 2], [1252, 492, 4],
  [470, 230, 5], [600, 380, 6], [1060, 260, 7], [560, 560, 8], [1010, 470, 5], [360, 330, 7], [1120, 600, 6],
];
// 약탈: 부족 a의 기병 점이 b로 달려가 깃발을 쓰러뜨리고 가축(흰 점)을 몰고 돌아옴. 주기 PER, 시작 off
const RAIDS: [number, number, number][] = [[0, 2, 0], [3, 6, 24], [1, 7, 50], [4, 9, 12], [5, 10, 70], [8, 11, 38], [2, 9, 88], [7, 0, 60]];
const PER = 120;
const raidPhase = (f: number, off: number) => ((f - off) % PER + PER) % PER;
const SteppeMap = ({ f, dim = 0, raids = 1, home = 1 }: { f: number; dim?: number; raids?: number; home?: number }) => {
  // 깃발마다 쓰러짐(약탈당한 직후 잠깐)
  const fall = TRIBE_P.map((_, ti) =>
    Math.max(0, ...RAIDS.filter((r) => r[1] === ti).map(([, , off]) => {
      const p = raidPhase(f, off);
      return raids * (p < 46 ? 0 : p < 56 ? (p - 46) / 10 : p < 84 ? 1 : p < 100 ? 1 - (p - 84) / 16 : 0);
    })),
  );
  return (
    <AbsoluteFill>
      <Paper />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <rect width={1920} height={1080} fill="#8fb0c0" />
        <path d={SM_LAND} fill="#e6d2a2" fillRule="evenodd" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        {/* 초원(몽골 고원)은 초록 - 02 "몽골 초원은 초록" */}
        <ellipse cx={760} cy={380} rx={660} ry={250} fill="#a9b86e" opacity={0.55} />
        <ellipse cx={1000} cy={340} rx={380} ry={170} fill="#9aae62" opacity={0.45} />
        {/* 주변 나라 (흐리게, 점선) */}
        {["khitan", "goryeo", "song"].map((k) => <path key={k} d={SM_POL[k]} fill="#d6c59a" stroke="#8a7a5a" strokeWidth={2.5} strokeDasharray="8 6" />)}
        <path d={SM_POL.xia} fill="#b8c4b0" stroke="#7a8a7a" strokeWidth={3} strokeDasharray="8 6" />
        <path d={SM_POL.jin} fill="#d8b89a" stroke="#8a6a5a" strokeWidth={3} strokeDasharray="8 6" />
        <path d={SM_LAKES} fill="#8fb0c0" stroke={INK} strokeWidth={2.5} />
        <path d={SM_RIVERS} stroke="#5f86a0" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* 고비 사막 */}
        {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={560 + ((i * 263) % 600)} cy={590 + ((i * 47) % 110)} r={2.8} fill="#8a7650" opacity={0.55} />)}
        {[640, 820, 1000].map((x) => <path key={x} d={`M ${x} 650 q 30 -18 60 0 q 30 -18 60 0`} stroke="#a8905a" strokeWidth={4} fill="none" />)}
        {/* 알타이·항가이 산, 헨티 숲 */}
        {[[230, 520, 1.2], [290, 580, 1], [180, 460, 1], [330, 500, 0.9], [610, 440, 0.9], [660, 470, 0.8], [700, 430, 0.7]].map(([x, y, k], i) => (
          <path key={i} transform={`translate(${x} ${y}) scale(${k})`} d="M -38 0 L -6 -52 L 8 -32 L 20 -44 L 42 0 Z" fill="#b3a585" stroke={INK} strokeWidth={3.5} />
        ))}
        {[[960, 300], [995, 315], [925, 290], [1010, 280], [975, 270]].map(([x, y], i) => <path key={`t${i}`} d={`M ${x} ${y - 28} L ${x - 13} ${y} L ${x + 13} ${y} Z`} fill="#56704a" stroke={INK} strokeWidth={3} />)}
        {/* 부족 깃발 */}
        {TRIBE_P.map(([x, y, kind], i) => <BannerG key={i} x={x} y={y} kind={kind} h={110} fall={fall[i]} t={f} />)}
        {/* 금나라 깃발 (남쪽, 흐리게) */}
        <g opacity={0.55}>
          <BannerG x={1180} y={850} kind={1} h={90} t={f} />
        </g>
        {home > 0 && <g opacity={home}><TugG x={HOME_P[0]} y={HOME_P[1]} h={120} t={f} /></g>}
        {/* 약탈 기병 점 + 가축 */}
        {raids > 0 && RAIDS.map(([a, b, off], i) => {
          const p = raidPhase(f, off);
          const [ax, ay] = TRIBE_P[a];
          const [bx, by] = TRIBE_P[b];
          const go = p < 46 ? ease(p / 46) : p < 56 ? 1 : p < 110 ? 1 - (p - 56) / 54 : 0;
          if (p >= 110) return null;
          const x = ax + (bx - ax) * go;
          const y = ay - 20 + (by - ay) * go;
          const dir = p < 50 ? Math.sign(bx - ax) : -Math.sign(bx - ax);
          return (
            <g key={i} opacity={raids}>
              {[0, 1, 2].map((k) => (
                <g key={k} transform={`translate(${x - dir * k * 16} ${y + (k % 2) * 10})`}>
                  <ellipse cx={0} cy={0} rx={9} ry={5.5} fill="#3a2b22" />
                  <circle cx={dir * 3} cy={-8} r={4} fill="#3a2b22" />
                </g>
              ))}
              {p >= 56 && [0, 1, 2, 3].map((k) => <circle key={`s${k}`} cx={x + dir * (22 + k * 12)} cy={y + 4 + (k % 2) * 7} r={5} fill="#f2ead8" stroke={INK} strokeWidth={2} />)}
              {p >= 44 && p < 70 && <circle cx={bx} cy={by - 40} r={(p - 44) * 2.2} fill="#5a4a3a" opacity={0.4 * (1 - (p - 44) / 26)} />}
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(30,18,8,${0.35 + dim * 0.4}))` }} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 8판 새 소품 (2026-10-27): 개·말·숲·흰 바위·양털 수레·활 쏘는 동생 카사르·바늘
// =====================================================================
// 줄 안의 자리: 그 줄 목소리의 k(0~1) 지점 프레임 - 낱말 위치에 맞춰 움직임을 붙임 (목소리 길이가 바뀌어도 따라감)
const P = (at: (id: string) => number, id: string, k: number) => at(id) + Math.round(slotSec(id) * FPS * k);
// 큰 개 (옆모습, 오른쪽을 봄). (x,y) = 발. bark = 짖는 중, sit = 앉음
const Dog = ({ x, y, s = 1, bark = false, sit = false, flip = false }: { x: number; y: number; s?: number; bark?: boolean; sit?: boolean; flip?: boolean }) => {
  const f = useCurrentFrame();
  const wag = Math.sin(f / 2.5) * 18;
  const open = bark && f % 12 < 6 ? 1 : 0;
  return (
    <svg width={300 * s} height={220 * s} viewBox="-150 -200 300 220" style={{ position: "absolute", left: x - 150 * s, top: y - 200 * s, transform: flip ? "scaleX(-1)" : undefined, ...ink }}>
      <ellipse cx={0} cy={6} rx={110} ry={10} fill="rgba(43,29,20,0.25)" />
      <g transform={`rotate(${wag} -80 -96)`}>
        <path d="M -80 -96 C -120 -110 -130 -150 -110 -170" stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M -80 -96 C -120 -110 -130 -150 -110 -170" stroke="#8a6438" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      {(sit ? [[-60, -30], [-30, -30], [40, -4], [70, -4]] : [[-62, -4], [-36, -4], [44, -4], [72, -4]]).map(([lx, ly], i) => (
        <g key={i}>
          <path d={`M ${lx} -70 L ${lx} ${ly}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />
          <path d={`M ${lx} -70 L ${lx} ${ly}`} stroke="#9a7444" strokeWidth={11} strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={0} cy={sit ? -70 : -86} rx={92} ry={38} fill="#a87c48" stroke={INK} strokeWidth={6} transform={sit ? "rotate(-14 0 -70)" : undefined} />
      <path d="M -40 -100 C 0 -112 40 -110 70 -96" stroke="#7a5630" strokeWidth={8} fill="none" opacity={0.6} />
      <g transform={`translate(${sit ? 72 : 82} ${sit ? -138 : -128})`}>
        <circle cx={0} cy={0} r={36} fill="#a87c48" stroke={INK} strokeWidth={6} />
        <path d="M -20 -24 L -34 -54 L -2 -34 Z" fill="#6a4a2a" stroke={INK} strokeWidth={4} />
        <path d={`M 24 -6 L 62 2 L 60 ${16 + open * 6} L 26 ${20 + open * 4} Z`} fill="#b88c58" stroke={INK} strokeWidth={5} />
        {open > 0 && <path d="M 30 22 L 58 26 L 54 38 L 32 32 Z" fill="#7a2a20" stroke={INK} strokeWidth={4} />}
        <circle cx={60} cy={2} r={6} fill={INK} />
        <circle cx={12} cy={-8} r={5} fill={INK} />
        <path d="M 2 -18 L 22 -14" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {open > 0 && [0, 1, 2].map((i) => <path key={i} d={`M ${76 + i * 4} ${-18 + i * 18} l 26 ${-8 + i * 8}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      </g>
    </svg>
  );
};
// 말 (옆모습, 오른쪽을 봄). (x,y) = 발 가운데. saddle 0~1 = 안장이 미끄러져 땅으로, pack = 안장 뒤에 묶은 활·화살 두 대·먹을 것 자루
const Horse = ({ x, y, s = 1, saddle = 0, pack = false, flip = false }: { x: number; y: number; s?: number; saddle?: number; pack?: boolean; flip?: boolean }) => {
  const f = useCurrentFrame();
  const tail = Math.sin(f / 10) * 8;
  const head = Math.sin(f / 37) * 3;
  const fall = saddle;
  return (
    <svg width={560 * s} height={440 * s} viewBox="-280 -420 560 440" style={{ position: "absolute", left: x - 280 * s, top: y - 420 * s, transform: flip ? "scaleX(-1)" : undefined, ...ink }}>
      <ellipse cx={0} cy={6} rx={210} ry={14} fill="rgba(43,29,20,0.25)" />
      <path d={`M -150 -200 C ${-215 + tail} -190 ${-232 + tail} -120 ${-214 + tail} -70`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d={`M -150 -200 C ${-215 + tail} -190 ${-232 + tail} -120 ${-214 + tail} -70`} stroke="#3a2b22" strokeWidth={20} fill="none" strokeLinecap="round" />
      {[-122, -88, 104, 138].map((lx, i) => (
        <g key={i}>
          <path d={`M ${lx} -170 L ${lx + (i % 2 ? 6 : -4)} -10`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
          <path d={`M ${lx} -170 L ${lx + (i % 2 ? 6 : -4)} -10`} stroke={i % 2 ? "#6a4a30" : "#7a5638"} strokeWidth={19} strokeLinecap="round" />
          <ellipse cx={lx + (i % 2 ? 8 : -2)} cy={-4} rx={18} ry={9} fill="#2a1c12" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <ellipse cx={0} cy={-200} rx={178} ry={74} fill="#7a5638" stroke={INK} strokeWidth={7} />
      <g transform={`rotate(${head} 130 -230)`}>
        <path d="M 112 -246 C 150 -306 182 -356 214 -366 L 262 -336 C 272 -314 262 -298 242 -298 L 210 -302 C 190 -270 176 -232 166 -196 Z" fill="#7a5638" stroke={INK} strokeWidth={7} />
        <path d="M 124 -256 C 152 -320 182 -360 210 -368" stroke="#3a2b22" strokeWidth={18} fill="none" strokeLinecap="round" />
        <circle cx={228} cy={-340} r={6} fill={INK} />
        <path d="M 206 -366 L 196 -392 L 218 -372 Z" fill="#6a4a30" stroke={INK} strokeWidth={4} />
      </g>
      {/* 안장 + 깔개: fall이면 옆으로 기울며 미끄러져 땅에 떨어짐 */}
      <g transform={`translate(${-fall * 40} ${fall * fall * 216}) rotate(${-fall * 64} 0 -262)`}>
        <path d="M -86 -262 L 86 -262 L 92 -206 L -92 -206 Z" fill="#3e5a7a" stroke={INK} strokeWidth={5} />
        <path d="M -70 -262 C -66 -300 -40 -294 -30 -276 L 30 -276 C 44 -298 66 -300 70 -262 Z" fill="#8a3b2c" stroke={INK} strokeWidth={6} />
        <path d="M -92 -222 L 92 -222" stroke="#c9a24e" strokeWidth={7} />
      </g>
      {fall === 0 && <path d="M 0 -206 L 0 -132" stroke="#5a3a24" strokeWidth={8} />}
      {pack && (
        <g>
          <ellipse cx={-122} cy={-262} rx={46} ry={30} fill="#d8ccb0" stroke={INK} strokeWidth={5} />
          <path d="M -150 -262 L -96 -262" stroke="#8a6440" strokeWidth={5} />
          <path d="M -180 -330 Q -120 -380 -60 -330" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M -180 -330 Q -120 -380 -60 -330" stroke="#8a6440" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M -180 -330 L -60 -330" stroke="#e8dcc0" strokeWidth={2.5} />
          {[0, 1].map((i) => (
            <g key={i}>
              <path d={`M ${-160 + i * 14} -246 L ${-104 + i * 14} -330`} stroke="#6a4a2e" strokeWidth={5} />
              <path d={`M ${-104 + i * 14} -330 l -4 -14 l 12 6 Z`} fill="#b8bcbd" stroke={INK} strokeWidth={3} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};
// 숲 (빽빽한 나무 줄기 + 위쪽 잎 덩이 + 틈으로 드는 빛). light 0~1 = 낮의 밝기(밤 0)
const Forest = ({ light = 1, shift = 0 }: { light?: number; shift?: number }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#5b7a4a, #3b5232 55%, #2c3d26)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {Array.from({ length: 18 }).map((_, i) => {
          const x = ((i * 157 + shift * 0.5) % 2100) - 90;
          const w = 34 + ((i * 29) % 30);
          return <rect key={`b${i}`} x={x} y={-20} width={w} height={900} fill="#3a2e22" opacity={0.55} />;
        })}
        {[0, 1, 2].map((i) => <path key={`l${i}`} d={`M ${520 + i * 420} -20 L ${640 + i * 420} -20 L ${820 + i * 420} 900 L ${560 + i * 420} 900 Z`} fill="#f4e6b0" opacity={(0.1 + 0.04 * Math.sin(f / 40 + i)) * light} />)}
        <path d="M -20 820 C 400 790 900 830 1300 810 C 1600 798 1800 820 1940 812 L 1940 1100 L -20 1100 Z" fill="#3e4f2c" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = ((i * 233 + shift) % 2200) - 120;
          const w = 70 + ((i * 41) % 50);
          return (
            <g key={`t${i}`}>
              <path d={`M ${x} -20 L ${x + w} -20 L ${x + w + 10} 840 L ${x - 10} 840 Z`} fill="#5a4230" stroke={INK} strokeWidth={6} />
              <path d={`M ${x + w * 0.3} 80 L ${x + w * 0.35} 760 M ${x + w * 0.7} 200 L ${x + w * 0.66} 800`} stroke="#43301f" strokeWidth={4} />
            </g>
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => <ellipse key={`c${i}`} cx={i * 270 + 60} cy={20 + (i % 2) * 40} rx={220} ry={120} fill={i % 2 ? "#4e6e3c" : "#5a7c44"} stroke={INK} strokeWidth={5} />)}
        {Array.from({ length: 7 }).map((_, i) => <ellipse key={`g${i}`} cx={((i * 311 + shift) % 2100) - 60} cy={850} rx={110} ry={44} fill="#4f6a36" stroke={INK} strokeWidth={4} />)}
      </svg>
      <AbsoluteFill style={{ background: `rgba(8,12,10,${0.62 * (1 - light)})` }} />
    </AbsoluteFill>
  );
};
// 칼자국 난 나무 (숨은 날을 셈 - 화면에 숫자를 쓰지 않고). n = 자국 수, fresh = 마지막 자국이 막 생김(0~1, 밝게 빛남)
const NotchTree = ({ x, n, fresh = 0 }: { x: number; n: number; fresh?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
    <path d={`M ${x - 70} -20 L ${x + 70} -20 L ${x + 84} 860 L ${x - 84} 860 Z`} fill="#6a4c34" stroke={INK} strokeWidth={7} />
    <path d={`M ${x - 30} 40 L ${x - 24} 820 M ${x + 34} 120 L ${x + 30} 840`} stroke="#4e3624" strokeWidth={5} />
    {Array.from({ length: n }).map((_, i) => {
      const yy = 430 + (i % 3) * 34 + Math.floor(i / 3) * 130;
      return <path key={i} d={`M ${x - 46} ${yy} L ${x + 40} ${yy - 18}`} stroke={i === n - 1 && fresh > 0 ? `rgba(255,236,190,${0.5 + fresh * 0.5})` : "#e8d6b0"} strokeWidth={10} strokeLinecap="round" />;
    })}
  </svg>
);
// 흰 바위 (게르만 함): (x,y) = 바닥 가운데
const WhiteRock = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <svg width={640 * s} height={460 * s} viewBox="-320 -440 640 460" style={{ position: "absolute", left: x - 320 * s, top: y - 440 * s, ...ink }}>
    <ellipse cx={0} cy={8} rx={300} ry={22} fill="rgba(20,16,10,0.35)" />
    <path d="M -290 0 C -310 -180 -220 -380 -40 -410 C 140 -430 290 -300 300 -120 C 306 -50 290 -10 270 0 Z" fill="#ecebe2" stroke={INK} strokeWidth={8} />
    <path d="M -180 -300 C -120 -340 -40 -350 30 -340 M 120 -260 C 180 -220 220 -160 230 -90 M -230 -120 C -200 -80 -150 -60 -100 -60" stroke="#b9b8ae" strokeWidth={7} fill="none" />
  </svg>
);
// 양털 수레: 수레 바닥·바퀴 위에 양털 더미. pulled 0~1 = 오른쪽 양털이 뽑혀 나가 장화 끝이 보임
const WoolCart = ({ x, y, s = 1, pulled = 0 }: { x: number; y: number; s?: number; pulled?: number }) => {
  const tufts = Array.from({ length: 22 }).map((_, i) => [-230 + (i % 8) * 64 + (i % 3) * 10, -150 - Math.floor(i / 8) * 62 + ((i * 7) % 20), 54 + ((i * 13) % 20)]);
  return (
    <svg width={640 * s} height={420 * s} viewBox="-320 -360 640 420" style={{ position: "absolute", left: x - 320 * s, top: y - 360 * s, ...ink }}>
      <ellipse cx={0} cy={52} rx={280} ry={16} fill="rgba(43,29,20,0.25)" />
      <path d="M -290 -90 L 290 -90 L 290 -50 L -290 -50 Z" fill="#8a6440" stroke={INK} strokeWidth={6} />
      <path d="M -290 -180 L -290 -50 M 290 -180 L 290 -50" stroke={INK} strokeWidth={10} />
      {pulled > 0.4 && (
        <g opacity={lerp(pulled, 0.4, 0.8, 0, 1)}>
          <ellipse cx={226} cy={-112} rx={34} ry={18} fill={KID.boot} stroke={INK} strokeWidth={5} />
        </g>
      )}
      {tufts.map(([tx, ty, r], i) => {
        const gone = tx > 120 && ty > -230 ? lerp(pulled, (i % 5) * 0.08, (i % 5) * 0.08 + 0.4, 0, 1) : 0;
        return gone >= 1 ? null : <circle key={i} cx={tx + gone * 160} cy={ty - gone * 120} r={r * (1 - gone * 0.4)} fill="#f2ece0" stroke={INK} strokeWidth={4} opacity={1 - gone} />;
      })}
      {[-170, 170].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-6} r={52} fill="none" stroke={INK} strokeWidth={10} />
          <path d={`M ${cx - 50} -6 L ${cx + 50} -6 M ${cx} -56 L ${cx} 44`} stroke="#6e4e2c" strokeWidth={6} />
        </g>
      ))}
      <path d="M -290 -70 L -400 -40" stroke={INK} strokeWidth={10} />
    </svg>
  );
};
// 동생 카사르: 활을 당긴 옆모습(오른쪽을 봄) - 낚시 장면의 동생과 같은 얼굴(양옆 머리 타래, 올리브색 옷). (x,y) = 발,
// draw 0~1 = 시위를 당김(1에서 놓으면 0으로), aim = 활을 위로 드는 각도(도), shrug = 으쓱(어깨·머리가 들림)
const KasarBow = ({ x, y, s = 1, draw = 0, aim = 0, flip = false, shrug = 0, arrow = true }: { x: number; y: number; s?: number; draw?: number; aim?: number; flip?: boolean; shrug?: number; arrow?: boolean }) => {
  const C = { robe: "#7a8a4a", dark: "#5e6b38", trim: "#c8a27c" };
  const sx = 130 - 70 * draw;
  return (
    <svg width={420 * s} height={500 * s} viewBox="-200 -480 420 500" style={{ position: "absolute", left: x - 200 * s, top: y - 480 * s, transform: flip ? "scaleX(-1)" : undefined, ...ink }}>
      <ellipse cx={0} cy={6} rx={90} ry={10} fill="rgba(43,29,20,0.25)" />
      {[-24, 24].map((lx) => (
        <g key={lx}>
          <path d={`M ${lx} -70 L ${lx + lx * 0.3} -10`} stroke={INK} strokeWidth={26} strokeLinecap="round" />
          <path d={`M ${lx} -70 L ${lx + lx * 0.3} -10`} stroke={C.dark} strokeWidth={16} strokeLinecap="round" />
          <ellipse cx={lx * 1.3 + 10} cy={-4} rx={26} ry={11} fill={KID.boot} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <g transform={`translate(0 ${-shrug * 8})`}>
        <path d="M -52 -250 L 44 -250 C 60 -180 66 -110 68 -60 L -64 -60 C -62 -130 -60 -200 -52 -250 Z" fill={C.robe} stroke={INK} strokeWidth={6} />
        <path d="M -60 -140 L 64 -140" stroke={C.trim} strokeWidth={12} />
        <path d="M 4 -248 C 18 -210 26 -180 30 -150" stroke={C.trim} strokeWidth={8} fill="none" />
        <g transform={`rotate(${-aim} 10 -226)`}>
          <Sleeve x1={-14} y1={-222} x2={sx} y2={-226} w1={40} w2={28} color={C.dark} trim={C.trim} />
          <path d={`M 150 -336 Q 196 -226 150 -116`} stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d={`M 150 -336 Q 196 -226 150 -116`} stroke="#8a6440" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M 150 -336 L ${sx} -226 L 150 -116`} stroke="#efe6d4" strokeWidth={2.5} fill="none" />
          {arrow && (
            <g>
              <path d={`M ${sx} -226 L 214 -226`} stroke="#6a4a2e" strokeWidth={5} />
              <path d="M 214 -226 l -14 -8 l 0 16 Z" fill="#b8bcbd" stroke={INK} strokeWidth={3} />
            </g>
          )}
          <Sleeve x1={10} y1={-232} x2={150} y2={-226} w1={40} w2={28} color={C.robe} trim={C.trim} />
          <Grip x={156} y={-226} rot={-90} skin={KID.skin} />
          <Grip x={sx - 4} y={-226} rot={0} skin={KID.skin} />
        </g>
        <g transform={`translate(8 ${-300 - shrug * 6}) scale(1.15)`}>
          <DrawnHead hat="tufts" r={46} mood="neutral" skin={KID.skin} />
        </g>
      </g>
    </svg>
  );
};
// 날아가는 화살 (a→b, k 0~1)
const ArrowFly = ({ a, b, k }: { a: [number, number]; b: [number, number]; k: number }) => {
  if (k <= 0 || k >= 1) return null;
  const x = a[0] + (b[0] - a[0]) * k;
  const y = a[1] + (b[1] - a[1]) * k - Math.sin(Math.PI * k) * 40;
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <g transform={`translate(${x} ${y}) rotate(${ang})`}>
        <path d="M -70 0 L 0 0" stroke="#6a4a2e" strokeWidth={5} />
        <path d="M 0 0 l -14 -8 l 0 16 Z" fill="#b8bcbd" stroke={INK} strokeWidth={3} />
        <path d="M -70 0 l -12 -8 M -70 0 l -12 8" stroke="#e8dcc0" strokeWidth={4} />
      </g>
    </svg>
  );
};
// 나무 방벽 (쓰러진 통나무 더미)
const Barricade = ({ x, y, w = 760 }: { x: number; y: number; w?: number }) => (
  <svg width={w + 80} height={260} viewBox={`-40 -220 ${w + 80} 260`} style={{ position: "absolute", left: x - 40, top: y - 220, ...ink }}>
    {[[0, -30, w, 0], [40, -90, w - 60, 6], [10, -150, w - 160, -5], [120, -200, w - 320, 3]].map(([lx, ly, lw, rot], i) => (
      <g key={i} transform={`rotate(${rot} ${lx + lw / 2} ${ly})`}>
        <rect x={lx} y={ly - 28} width={lw} height={56} rx={28} fill={i % 2 ? "#6a4c34" : "#7a5a3c"} stroke={INK} strokeWidth={6} />
        <ellipse cx={lx + lw - 4} cy={ly} rx={14} ry={26} fill="#c8a878" stroke={INK} strokeWidth={4} />
        <path d={`M ${lx + 40} ${ly - 8} L ${lx + lw * 0.5} ${ly - 12} M ${lx + lw * 0.3} ${ly + 10} L ${lx + lw * 0.8} ${ly + 8}`} stroke="#4e3624" strokeWidth={4} />
      </g>
    ))}
    {[[60, -150], [w - 120, -210], [w * 0.5, -200]].map(([bx, by], i) => <path key={`b${i}`} d={`M ${bx} ${by} l -30 -60 M ${bx} ${by} l 20 -70 M ${bx} ${by} l 50 -40`} stroke="#4e3624" strokeWidth={7} strokeLinecap="round" />)}
  </svg>
);
// 올가미 밧줄: (x1,y1) 기병 손 → 테무친 둘레 고리 (k 0~1 날아감)
const Lasso = ({ x1, y1, x2, y2, k }: { x1: number; y1: number; x2: number; y2: number; k: number }) => {
  if (k <= 0) return null;
  const ex = x1 + (x2 - x1) * k;
  const ey = y1 + (y2 - y1) * k;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      <path d={`M ${x1} ${y1} Q ${(x1 + ex) / 2} ${Math.min(y1, ey) - 120 * (1 - k * 0.6)} ${ex} ${ey}`} stroke={INK} strokeWidth={8} fill="none" />
      <path d={`M ${x1} ${y1} Q ${(x1 + ex) / 2} ${Math.min(y1, ey) - 120 * (1 - k * 0.6)} ${ex} ${ey}`} stroke="#c8a878" strokeWidth={4} fill="none" />
      <ellipse cx={ex} cy={ey} rx={k >= 1 ? 120 : 70} ry={k >= 1 ? 30 : 40} fill="none" stroke={INK} strokeWidth={8} />
      <ellipse cx={ex} cy={ey} rx={k >= 1 ? 120 : 70} ry={k >= 1 ? 30 : 40} fill="none" stroke="#c8a878" strokeWidth={4} />
    </svg>
  );
};
// 실루엣 남자 (수색꾼·아들들·추격대 - 얼굴 없이 검게) + 흰 점 눈
const ShadowMan = ({ x, h, bottom, pose = "front", flip = false, look = [0, 0], beat = "none", beatAt = 0, gesture, gestureAt }: { x: number; h: number; bottom: number; pose?: string; flip?: boolean; look?: [number, number]; beat?: "jump" | "shake" | "hop" | "sink" | "nod" | "none"; beatAt?: number; gesture?: string; gestureAt?: number }) => (
  <>
    <Shadow>
      <Char id="archer" x={x} h={h} bottom={bottom} pose={pose} flip={flip} enter="none" beat={beat} beatAt={beatAt} gesture={gesture} gestureAt={gestureAt} />
    </Shadow>
    {beat === "none" && !gesture && <ManEyes x={x} h={h} bottom={bottom} side={pose === "side"} flip={flip} look={look} />}
  </>
);

// =====================================================================
// 장면 (8판)
// =====================================================================
// A) c1_01~02 - 어둠 속 칭기즈칸에 빛 → "그런데 이 남자의 인생은"에서 빛이 얼굴로 좁아짐 → 같은 자리에서 열리며 1162 게르 안,
//    펠트 위에 누운 강보의 아기(안은 사람 없음 - 7판 공중부양 사고) → "주먹에 핏덩이를"에서 작은 주먹으로 다가감
const SA: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const CLOSE = at("c1_02") - 4;
  if (f < CLOSE) {
    const light = lerp(f, 0, 30, 0, 1, true);
    const r = lerp(f, P(at, "c1_01", 0.55), CLOSE, 1300, 0, true);
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <AbsoluteFill style={{ clipPath: `circle(${r}px at 960px 560px)` }}>
          <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, CLOSE, 1, 1.18)})`, transformOrigin: "960px 560px" }}>
            <Steppe time="night" horizon={760} />
            <Camp horizon={700} n={9} dark />
            <Dim op={0.35} />
            <Glow x={960} y={520} r={520} op={0.45 * light} color="#f3c77e" />
            <Tug x={620} y={1000} h={520} sway={Math.sin(f / 14) * 5} />
            <Tug x={1300} y={1000} h={520} sway={Math.sin(f / 13) * 5} />
            <AbsoluteFill style={{ filter: `brightness(${0.35 + 0.65 * light})` }}>
              <Char id="genghis" x={960} h={860} bottom={60} pose="smug" enter="none" beat="none" />
            </AbsoluteFill>
          </AbsoluteFill>
        </AbsoluteFill>
        <SFX name="drum" at={2} vol={0.3} />
      </AbsoluteFill>
    );
  }
  const g = f - CLOSE;
  const r = lerp(g, 4, 40, 0, 1400, true);
  const FIST = P(at, "c1_02", 0.42); // "주먹에 핏덩이를"
  const NAME = P(at, "c1_02", 0.8); // "이름은 테무친"
  const push = lerp(f, FIST - 10, FIST + 30, 0, 1, true) * (1 - lerp(f, NAME, NAME + 30, 0, 1, true));
  const grip = lerp(f, FIST, FIST + 12, 0, 1, true);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at 778px 630px)` }}>
        <Cam z={(1 + push * 0.55) * lerp(g, 0, 60, 1.06, 1)} cx={lerp(push, 0, 1, 860, 1010)} cy={lerp(push, 0, 1, 640, 640)}>
          <GerInside dark={0.25} />
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <path d="M 860 90 L 1060 90 L 1260 900 L 560 900 Z" fill="#f6e2b0" opacity={0.16} />
          </svg>
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <ellipse cx={900} cy={720} rx={420} ry={90} fill="#c8b48a" stroke={INK} strokeWidth={6} />
            <path d="M 560 720 C 700 690 1100 690 1240 720" stroke="#8a3b2c" strokeWidth={10} fill="none" />
          </svg>
          <Baby x={900} y={640} s={2.6} />
          {/* 강보 밖으로 나온 작은 주먹 + 붉은 핏덩이 */}
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
            <g transform={`translate(1010 ${612 - grip * 6}) rotate(${-10 + Math.sin(f / 6) * 3})`}>
              <ellipse cx={0} cy={0} rx={34 - grip * 4} ry={28} fill="#f0cfa6" stroke={INK} strokeWidth={5} />
              <path d="M 12 -20 L 12 16 M 0 -24 L 0 18 M -12 -20 L -12 16" stroke={INK} strokeWidth={3} opacity={0.6 * grip} />
              {grip > 0 && <ellipse cx={-26} cy={6} rx={10 * grip} ry={8 * grip} fill="#9a1f1a" stroke={INK} strokeWidth={3} />}
            </g>
          </svg>
          <Glow x={900} y={600} r={420} op={0.3} />
        </Cam>
      </AbsoluteFill>
      {f >= FIST && <SFX name="drum" at={FIST} vol={0.28} />}
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 8, frames, 0, 0.6) }} />
    </AbsoluteFill>
  );
};

// B) c1_03 - 실제 지도: 오논강 고향(흰 툭)에서 카메라가 빠지며 부족 깃발 수십 개, 기병 점들이 서로 쳐들어가 깃발을 쓰러뜨리고 가축을 몰고 감
//    "말 그대로 무법천지"에서 더 빠지며 어두워짐
const SB: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L = P(at, "c1_03", 0.72);
  const z = f < L ? lerp(f, 0, sec(4), 2.4, 1.25, true) : lerp(f, L, frames, 1.25, 1.0, true);
  const cx = f < L ? lerp(f, 0, sec(4), HOME_P[0], 840, true) : lerp(f, L, frames, 840, 960, true);
  const cy = f < L ? lerp(f, 0, sec(4), HOME_P[1] - 40, 420, true) : lerp(f, L, frames, 420, 540, true);
  return (
    <AbsoluteFill>
      <Cam z={z} cx={cx} cy={cy}>
        <SteppeMap f={f} raids={lerp(f, sec(2.6), sec(4.2), 0, 1)} dim={lerp(f, L, frames, 0, 0.8)} />
      </Cam>
      <SFX name="map" at={0} vol={0.3} />
      <SFX name="battle_far" at={sec(3)} vol={0.12} dur={frames - sec(3)} />
    </AbsoluteFill>
  );
};

// C) c1_04~09 - 예수게이와 신부 호엘룬: ① 작은 진영 앞 예수게이 ② 언덕에서 매사냥, 아래 길의 신부 수레를 봄(펄쩍) → "저 신부, 우리 집으로" 😏
//    ③ 형제 셋이 내리달려 수레를 둘러쌈, 겁에 질린 신랑 ④ 호엘룬이 침착하게 "어서 도망가요!" - "이 옷 냄새로"에서 저고리를 던짐 → 신랑이 받아 안고 말로 달아남
//    ⑤ 예수게이가 수레 고삐를 끌고 감 (형제들 멀뚱) ⑥ 언덕 위에서 돌아보는 신랑(원한) → 밤, 검은 메르키트 기병 행렬
const SC: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const INTRO = P(at, "c1_04", 0.36);
  const SPOT = P(at, "c1_04", 0.86);
  const L5 = at("c1_05");
  const CH = at("c1_06");
  const L7 = at("c1_07");
  const THROW = P(at, "c1_07", 0.64);
  const FLEE = THROW + 20;
  const TAKE = at("c1_08");
  const L9 = at("c1_09");
  const GRUDGE = P(at, "c1_09", 0.3);
  const NIGHT = P(at, "c1_09", 0.66);
  const groom = { position: "absolute" as const, inset: 0, filter: "saturate(0.55) brightness(0.8)" }; // 신랑(메르키트) - 제베와 같은 archer 그림이라 색을 죽임
  let body: React.ReactNode;
  if (f < INTRO) {
    body = (
      <Cam z={lerp(f, 0, INTRO, 1.0, 1.1)} cx={980} cy={560}>
        <Steppe time="day" horizon={560} />
        <Camp horizon={560} n={4} x0={260} span={1400} />
        {[[260, 860, 0.9], [380, 900, 0.8, 1], [1600, 880, 0.9, 1], [1720, 930, 0.75]].map(([x, y, s, fl], i) => <Sheep key={i} x={x} y={y} s={s} flip={!!fl} />)}
        <Rider kind="mongol" x={1380} y={560} w={300} still />
        <Guard x={560} h={500} bottom={110} />
        <Guard x={1400} h={500} bottom={110} flip />
        <Char id="yesugei" x={970} h={780} bottom={80} pose="smug" enter="up" beat="nod" beatAt={sec(1.8)} gesture="fist" gestureAt={sec(1.2)} />
      </Cam>
    );
  } else if (f < CH) {
    const p = lerp(f, INTRO, CH, 0, 1);
    const talk = f >= L5;
    body = (
      <Cam z={talk ? lerp(f, L5, L5 + 16, 1.12, 1.45, true) : lerp(f, INTRO, L5, 1.15, 1.08)} cx={talk ? 520 : 900} cy={talk ? 520 : 600}>
        <Steppe time="day" horizon={560} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -20 720 C 200 640 420 620 620 690 C 760 740 860 780 980 1100 L -20 1100 Z" fill="#9aae62" stroke={INK} strokeWidth={5} />
        </svg>
        <BrideCart x={lerp(p, 0, 1, 1100, 1420)} y={760} s={0.7} roll={f * 4} />
        <Char id="hoelun" x={lerp(p, 0, 1, 1165, 1485)} h={250} pose="happy" bottom={1080 - 760 + 30} enter="none" beat="none" />
        <div style={groom}><Char id="archer" x={lerp(p, 0, 1, 1380, 1700)} h={300} pose="happy" bottom={1080 - 770} enter="none" beat="none" /></div>
        <Char id="yesugei" x={330} h={520} pose={talk ? "smug" : f > SPOT ? "shocked" : "front"} gesture={f > SPOT && !talk ? "point" : undefined} gestureAt={SPOT + 2} bottom={1080 - 680} enter="none" beat={f > SPOT && !talk ? "jump" : "none"} beatAt={SPOT} talking={speaking(f, L5, "c1_05")} />
        <Falcon x={lerp(f, INTRO, SPOT, 470, 1100)} y={lerp(f, INTRO, SPOT, 520, 200)} s={0.9} flap={Math.abs(Math.sin(f / 3))} />
      </Cam>
    );
  } else if (f < TAKE) {
    const fled = f >= FLEE;
    const rx = lerp(f, CH, CH + sec(2.4), -700, 300, true);
    const throwK = lerp(f, THROW, THROW + 18, 0, 1, true);
    const close = lerp(f, L7 - 6, L7 + 18, 0, 1, true) * (1 - lerp(f, FLEE + 10, FLEE + 30, 0, 1, true));
    const circle = f > CH + sec(2.4) ? Math.sin((f - CH) / 14) * 30 : 0;
    body = (
      <Cam z={1 + close * 0.32} cx={lerp(close, 0, 1, 960, 1150)} cy={lerp(close, 0, 1, 560, 640)}>
        <Steppe time="day" horizon={560} />
        <BrideCart x={1080} y={860} s={0.95} roll={0} />
        <Char id="hoelun" x={930} h={330} pose={fled ? "sad" : f >= L7 ? "angry" : "front"} gesture={f >= L7 && f < THROW ? "point" : throwK > 0 && throwK < 1 ? "open" : undefined} gestureAt={f >= THROW ? THROW : L7 + 4} bottom={1080 - 860 + 40} enter="none" beat="none" talking={speaking(f, L7, "c1_07")} />
        {!fled ? (
          <div style={groom}><Char id="archer" x={1480} h={380} pose="shocked" flip bottom={170} enter="none" beat="shake" beatAt={CH + sec(1.6)} /></div>
        ) : (
          <Rider kind="merkit" x={lerp(f, FLEE, TAKE, 1350, 2100)} y={470} w={300} phase={2} />
        )}
        {throwK > 0 && throwK < 1 && (
          <svg width={120} height={110} viewBox="0 0 120 110" style={{ position: "absolute", left: lerp(throwK, 0, 1, 960, 1440), top: lerp(throwK, 0, 1, 560, 600) - Math.sin(Math.PI * throwK) * 160, transform: `rotate(${throwK * 300}deg)`, ...ink }}>
            <path d="M 30 6 L 90 6 L 116 40 L 98 50 L 92 36 L 92 104 L 28 104 L 28 36 L 22 50 L 4 40 Z" fill="#6b4a7a" stroke={INK} strokeWidth={4} />
          </svg>
        )}
        <Rider kind="mongol" x={rx - 380} y={430 + circle * 0.3} w={340} phase={6} still={f > CH + sec(2.6)} />
        <Rider kind="mongol" x={rx - 230} y={530 - circle * 0.3} w={360} phase={10} still={f > CH + sec(2.6)} />
        <Rider kind="yesugei" x={rx} y={470} w={440} phase={0} still={f > CH + sec(2.6)} />
        {f < CH + sec(2.6) && <Dust x={rx + 100} y={860} t={((f - CH) % 18) / 18} r={120} />}
      </Cam>
    );
  } else if (f < NIGHT) {
    const t = f - TAKE;
    const lead = lerp(f, TAKE, L9, 0, 520);
    body = (
      <Cam z={lerp(f, TAKE, NIGHT, 1.0, 1.12)} cx={f < L9 ? 900 : lerp(f, L9, L9 + 30, 900, 1500, true)} cy={lerp(f, L9, L9 + 30, 580, 520, true)}>
        <Steppe time="day" horizon={560} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 1300 640 C 1500 560 1700 500 1960 510 L 1960 660 C 1800 650 1500 650 1300 640 Z" fill="#9aae62" stroke={INK} strokeWidth={5} />
        </svg>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-lead}px)` }}>
          <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", transformOrigin: "1080px 0" }}>
            <BrideCart x={1080} y={860} s={0.95} roll={-t * 3} />
          </div>
          <Char id="hoelun" x={1180} h={330} pose="sad" flip bottom={1080 - 860 + 40} enter="none" beat="none" />
          <Rider kind="yesugei" x={560} y={470} w={440} flip phase={0} />
          {/* 뒤에 남은 형제 둘 (멀뚱 - 말을 세우고 서로 봄) 😏 */}
          <Rider kind="mongol" x={1340} y={430} w={300} still />
          <Rider kind="mongol" x={1560} y={470} w={300} still flip />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M 720 620 Q 790 720 880 760" stroke={INK} strokeWidth={7} fill="none" />
            <path d="M 720 620 Q 790 720 880 760" stroke="#8a6440" strokeWidth={3} fill="none" />
          </svg>
        </div>
        {f >= L9 - 10 && <div style={groom}><Char id="archer" x={1720} h={340} pose={f >= GRUDGE ? "angry" : "sad"} flip bottom={1080 - 600} enter="pop" delay={L9 - 10} beat={f >= GRUDGE ? "shake" : "none"} beatAt={GRUDGE + 4} gesture={f >= GRUDGE ? "fist" : undefined} gestureAt={GRUDGE + 2} /></div>}
      </Cam>
    );
  } else {
    const g = f - NIGHT;
    body = (
      <AbsoluteFill>
        <Steppe time="night" horizon={680} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Rider key={i} kind="merkit" x={700 + g * 3.2 + i * 120} y={560 - i * 4} w={150 - i * 6} phase={i * 4} dark />)}
        <AbsoluteFill style={{ background: "#000", opacity: lerp(g, 0, 8, 0.6, 0) }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: lerp(f, 0, 12, 0, 1) }}>
      {body}
      <Dim op={lerp(f, frames - 14, frames, 0, 0.7)} />
      <SFX name="gallop" at={CH} vol={0.3} dur={sec(2.6)} />
      <SFX name="gallop" at={FLEE} vol={0.25} dur={TAKE - FLEE} />
      <SFX name="drum" at={GRUDGE} vol={0.3} />
    </AbsoluteFill>
  );
};

// D) c1_10~14 - 보르테와 개: 아버지와 아들이 말을 달려 → 보르테네 진영, 수줍게 마주 본 두 아이 → 예수게이가 사돈(실루엣 노인)에게 돌아서 부탁
//    → c1_12 "내 아들이 개를…" 그 순간 큰 개가 달려와 짖고, 테무친이 펄쩍 뛰어 아버지 뒤로 숨음 😏 → c1_13 아버지 다리 뒤에서 덜덜, 보르테 키득
//    → c1_14 예수게이가 말에 올라 노을 속으로 혼자 떠남, 테무친이 손을 흔듦
const SD: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const MEET = P(at, "c1_10", 0.62);
  const L11 = at("c1_11");
  const L12 = at("c1_12");
  const DOG = P(at, "c1_12", 0.12);
  const L13 = at("c1_13");
  const GO = at("c1_14");
  if (f < MEET) {
    const p = lerp(f, 0, MEET, 0, 1);
    return (
      <AbsoluteFill>
        <Steppe time="day" horizon={520} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const x = ((i * 277 + f * 9) % 2200) - 140;
            const y = 640 + ((i * 71) % 400);
            return <path key={i} d={`M ${x} ${y} l 8 -30 M ${x + 12} ${y} l 2 -38 M ${x + 22} ${y} l -6 -28`} stroke="#6f8a46" strokeWidth={5} strokeLinecap="round" />;
          })}
        </svg>
        <Rider kind="yesugei" x={lerp(p, 0, 1, 1500, 380)} y={lerp(p, 0, 1, 470, 360)} w={lerp(p, 0, 1, 160, 620)} flip phase={0} />
        <Rider kind="temujin" x={lerp(p, 0, 1, 1640, 900)} y={lerp(p, 0, 1, 500, 520)} w={lerp(p, 0, 1, 110, 400)} flip phase={5} />
        <Dust x={lerp(p, 0, 1, 1600, 900)} y={lerp(p, 0, 1, 560, 960)} t={(f % 20) / 20} r={lerp(p, 0, 1, 30, 110)} />
        <SFX name="hooves" at={0} vol={0.28} dur={MEET} />
      </AbsoluteFill>
    );
  }
  const gone = f >= GO;
  const dusk = lerp(f, GO, frames, 0, 0.75);
  const rk = lerp(f, GO, frames, 0, 1);
  const shy = f >= MEET + 20;
  const dogIn = f >= DOG;
  const dogX = lerp(f, DOG, DOG + 22, -200, 330, true);
  const hide = lerp(f, DOG + 6, DOG + 20, 0, 1, true);
  const scared = dogIn && !gone;
  const tx = lerp(hide, 0, 1, 780, 1120);
  const zoom = f >= L13 && !gone ? lerp(f, L13, L13 + 30, 1.0, 1.22, true) : 1;
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={600} />
      <AbsoluteFill style={{ opacity: dusk }}><Steppe time="dusk" horizon={600} /></AbsoluteFill>
      <Cam z={(f < L11 ? lerp(f, MEET, L11, 1.08, 1.0) : 1) * zoom} cx={zoom > 1 ? 1100 : 900} cy={zoom > 1 ? 700 : 600}>
        <Ger x={260} y={680} w={300} door="#7a8a4a" />
        <Ger x={1760} y={650} w={240} door="#7a8a4a" />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><BannerG x={470} y={700} kind={4} h={260} t={f} /></svg>
        <Sheep x={1500} y={790} s={0.7} flip />
        {/* 사돈 (보르테 아버지 - 실루엣 노인, 지팡이) */}
        {f >= L11 - 20 && !gone && (
          <div style={{ position: "absolute", inset: 0, opacity: lerp(f, L11 - 20, L11, 0, 1), filter: "brightness(0.25)" }}>
            <Folk x={1600} y={1000} k={{ ...FOLK[0], sc: 1.7 }} walk={0} lookBack />
          </div>
        )}
        {/* 테무친은 아버지 뒤로 숨음 → 아버지보다 먼저 그림 */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${scared && hide >= 1 ? Math.sin(f * 2.1) * 2 : 0}px)` }}>
          <Char id="temujin_child" x={gone ? 780 : tx} h={470} bottom={100} flip={hide > 0.5 && !gone} pose={gone ? "sad" : scared ? "shocked" : shy ? "happy" : "front"} enter="none" beat={scared ? "jump" : shy && !dogIn ? "hop" : "none"} beatAt={scared ? DOG + 4 : MEET + 26} gesture={gone ? "open" : undefined} gestureAt={GO + 6} />
        </div>
        {!gone && <Char id="yesugei" x={1250} h={780} bottom={90} flip={f < L11} pose={f >= L12 ? "front" : "happy"} enter="none" beat={f >= L11 ? "nod" : "none"} beatAt={L11 + 14} gesture={f >= L12 ? "open" : undefined} gestureAt={L12 + 4} talking={speaking(f, L12, "c1_12")} />}
        {gone && <Rider kind="yesugei" x={lerp(rk, 0, 1, 1100, 1700)} y={lerp(rk, 0, 1, 440, 560)} w={lerp(rk, 0, 1, 380, 110)} phase={2} />}
        <Char id="borte" x={560} h={440} bottom={100} flip={!gone && !dogIn} pose={f >= L13 && !gone ? "happy" : shy ? "happy" : "front"} enter="pop" delay={MEET + 4} beat={(shy && !dogIn) || (f >= L13 + 20 && !gone) ? "hop" : "none"} beatAt={f >= L13 ? L13 + 24 : MEET + 34} />
        {dogIn && !gone && <Dog x={dogX} y={1000} s={1.25} bark={f < L13 + 20} sit={f >= L13 + 20} />}
      </Cam>
      {dogIn && <SFX name="wolf" at={DOG + 6} vol={0.12} dur={30} />}
      {gone && <SFX name="hooves" at={GO} vol={0.22} dur={frames - GO} />}
    </AbsoluteFill>
  );
};

// E) c1_15~18 - 타타르 잔치: 노을, 예수게이가 말을 세우고 불가에 앉음(손님 대접) → c1_16 "하필 그 천막은" 붉은 삼각 깃발로 카메라가 확
//    → c1_17 실루엣들이 손님을 알아보고 한 사람이 속삭임 → "잔에 그걸 타라" 잔 클로즈업, 검은 손이 독을 떨어뜨림
//    → c1_18 아무것도 모르고 떠나는 예수게이 - 밤길에 말 위에서 점점 휘청, 화면이 흐려지며 어두워짐
const SE: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const FLAG = P(at, "c1_16", 0.08);
  const LOOK = at("c1_17") - 6;
  const CUT = P(at, "c1_17", 0.55);
  const DROP = P(at, "c1_17", 1) + 6;
  const L18 = at("c1_18");
  const HOME = P(at, "c1_18", 0.5); // "사흘 뒤 겨우 집에"
  if (f < CUT) {
    const arrive = lerp(f, 0, sec(2.6), 0, 1, true);
    const seated = f >= sec(5.4);
    const look = f >= LOOK;
    const z = f < FLAG ? lerp(f, 0, FLAG, 1.0, 1.06) : lerp(f, FLAG, FLAG + 18, 1.06, 1.55, true) * lerp(f, FLAG + 40, LOOK, 1, 0.68, true);
    const cx = f < FLAG ? 960 : lerp(f, FLAG, FLAG + 18, 960, 1630, true) + lerp(f, FLAG + 40, LOOK, 0, -670, true);
    return (
      <AbsoluteFill>
        <Cam z={Math.max(1, z)} cx={cx} cy={lerp(f, FLAG, FLAG + 18, 600, 420, true) + lerp(f, FLAG + 40, LOOK, 0, 180, true)}>
          <Steppe time="dusk" horizon={560} />
          <Ger x={420} y={600} w={260} door="#5a3a2a" lit={0.7} />
          <Ger x={1500} y={590} w={240} door="#5a3a2a" lit={0.6} />
          <Ger x={1180} y={575} w={170} door="#5a3a2a" lit={0.5} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><BannerG x={1640} y={640} kind={0} h={300} t={f} /></svg>
          <Dim op={0.22} />
          <Fire x={960} y={900} s={1.4} />
          {[[640, 360, false], [1260, 380, true], [1460, 330, true], [1100, 300, true], [800, 300, false]].map(([x, h, fl], i) => (
            <Shadow key={i}>
              <Char id="archer" x={x as number} h={h as number} bottom={150} pose={look ? "side" : "front"} flip={look ? true : (fl as boolean)} enter="none" beat={look && i === 1 ? "nod" : "none"} beatAt={LOOK + 14} />
            </Shadow>
          ))}
          {!seated ? <Rider kind="yesugei" x={lerp(arrive, 0, 1, -500, 60)} y={560} w={380} still={arrive >= 1} phase={1} /> : <Char id="yesugei" x={300} h={520} bottom={140} pose="happy" enter="none" beat="none" />}
          {seated && <Rider kind="yesugei" x={-80} y={600} w={300} still />}
          <Glow x={300} y={700} r={260} op={0.3} />
        </Cam>
        <Dim op={lerp(f, CUT - 10, CUT, 0, 1)} />
        <SFX name="campfire" at={0} vol={0.3} dur={CUT} />
        <SFX name="drum" at={FLAG} vol={0.35} />
      </AbsoluteFill>
    );
  }
  if (f < L18) {
    const g = f - CUT;
    const drop = lerp(f, DROP - 14, DROP, 0, 1);
    const tint = lerp(f, DROP, DROP + 20, 0, 1);
    const sh = shake(f, DROP + 2, 14, 50);
    const dark = lerp(f, DROP + 6, L18, 0, 0.6);
    return (
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${1.06 + g * 0.0012})` }}>
          <Paper />
          <Glow x={960} y={760} r={700} op={0.45} color="#e7955a" />
          <Cup x={960} y={660} s={1.6} tint={tint} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <g opacity={lerp(g, 0, 10, 0, 1)} transform={`translate(${lerp(g, 0, 16, 120, 0, true)} 0)`}>
              <path d="M 1960 176 L 1960 300 C 1700 312 1450 322 1250 324 L 1236 222 C 1450 216 1700 196 1960 176 Z" fill="#120c08" />
              <path d="M 1250 220 C 1180 210 1110 230 1080 270 C 1060 300 1070 330 1100 336 L 1250 326 Z" fill="#120c08" />
              <path d="M 1090 280 C 1060 286 1040 300 1036 316 M 1100 300 C 1070 310 1056 326 1056 342" stroke="#120c08" strokeWidth={16} strokeLinecap="round" fill="none" />
              <g transform={`rotate(${lerp(f, DROP - 30, DROP - 18, 0, 50)} 1020 320)`}>
                <path d="M 996 300 C 990 330 1000 356 1020 356 C 1040 356 1050 330 1044 300 Z" fill="#5d6b3e" stroke={INK} strokeWidth={4} />
                <rect x={1010} y={286} width={20} height={16} fill="#8a6440" stroke={INK} strokeWidth={3} />
              </g>
            </g>
            {f < DROP + 2 && <path d={`M 990 ${360 + drop * 170} q 14 26 0 40 q -14 -14 0 -40 Z`} fill="#1f2a18" stroke={INK} strokeWidth={3} opacity={lerp(f, DROP - 18, DROP - 14, 0, 1)} />}
            {f >= DROP && [0, 1, 2].map((i) => {
              const t = f - DROP - i * 6;
              if (t < 0) return null;
              return <ellipse key={i} cx={990} cy={545} rx={20 + t * 5} ry={(20 + t * 5) * 0.16} fill="none" stroke="#2f3a22" strokeWidth={4} opacity={Math.max(0, 1 - t / 30)} />;
            })}
          </svg>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 50% at 50% 55%, rgba(10,6,4,0) 20%, rgba(10,6,4,${0.4 + dark}))` }} />
        <Dim op={dark * 0.7} />
        <SFX name="rumble" at={DROP} vol={0.35} dur={L18 - DROP} />
      </AbsoluteFill>
    );
  }
  // 밤길: 말 위의 예수게이가 점점 휘청 (독이 퍼짐) - 화면이 흐려지고 기울며 어두워짐
  const g = f - L18;
  const sick = lerp(f, L18 + 20, HOME + 30, 0, 1);
  const sway = Math.sin(g / 9) * 9 * sick;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `rotate(${sway * 0.25}deg) scale(1.05)`, filter: `blur(${sick * 2.5}px)` }}>
        <Steppe time={f < HOME ? "dusk" : "night"} horizon={620} />
        <AbsoluteFill style={{ background: "#5a7a3a", opacity: 0.14 * sick, mixBlendMode: "multiply" }} />
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${sway}deg)`, transformOrigin: `${lerp(f, L18, frames, 300, 1300) + 200}px 900px` }}>
          <Rider kind="yesugei" x={lerp(f, L18, frames, 300, 1300)} y={460} w={420} phase={3} />
        </div>
      </AbsoluteFill>
      <Dim op={lerp(f, HOME, frames, 0.1, 0.85)} />
      <SFX name="hooves" at={L18} vol={0.22} dur={frames - L18} />
    </AbsoluteFill>
  );
};

// F) c1_19~20 - 게르 안: 누운 예수게이 "테무친을… 데려와라" (손을 뻗었다 떨어짐) → c1_20 문으로 빛이 들며 달려 들어온 테무친(문간 실루엣) → 늦음, 호엘룬이 주저앉음
const SF: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L = at("c1_19");
  const END = L + Math.ceil(slotSec("c1_19") * FPS) + 8;
  const L20 = at("c1_20");
  const talk = speaking(f, L, "c1_19");
  const reach = lerp(f, L - 6, L + 16, 0, 1, true) * (1 - lerp(f, END, END + 18, 0, 1, true));
  const door = lerp(f, L20, L20 + 14, 0, 1, true);
  const out = lerp(f, P(at, "c1_20", 0.9), frames, 0, 1);
  const mouth = talk ? ["1", "2", "1", "0"][Math.floor((f - L) / 4) % 4] : "0";
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={900} cy={700}>
        <GerInside dark={0.35} />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <path d="M 860 90 L 1060 90 L 1160 900 L 560 900 Z" fill="#f6e2b0" opacity={0.2 * (1 - out)} />
          {door > 0 && <path d="M 1640 430 L 1840 430 L 1840 780 L 1640 780 Z" fill="#f6dca0" opacity={0.75 * door} />}
          {door > 0 && <path d="M 1640 780 L 1840 780 L 1500 1080 L 1100 1080 Z" fill="#f6dca0" opacity={0.25 * door} />}
        </svg>
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M 300 880 L 1240 880 L 1300 990 L 240 990 Z" fill="#c8b48a" stroke={INK} strokeWidth={6} />
          <ellipse cx={470} cy={872} rx={130} ry={40} fill="#e8dcc0" stroke={INK} strokeWidth={5} />
          <path d="M 560 900 C 600 760 1120 740 1220 850 L 1230 930 L 560 930 Z" fill="#8a3b2c" stroke={INK} strokeWidth={7} />
          <path d="M 600 860 C 760 810 1040 800 1210 860" stroke="#c9a24a" strokeWidth={8} fill="none" />
          <g transform={`rotate(${-reach * 50} 640 850)`}>
            <path d="M 600 860 C 640 830 700 820 760 812 L 770 850 C 712 858 660 868 620 892 Z" fill="#6b4a32" stroke={INK} strokeWidth={6} />
            <path d="M 752 808 L 770 852" stroke="#c9a24a" strokeWidth={8} />
            <ellipse cx={790} cy={828} rx={24} ry={19} fill="#d8b088" stroke={INK} strokeWidth={5} />
          </g>
        </svg>
        <Head id="yesugei" pose="sad" x={560} y={860} s={0.72} rot={-78} eyes={talk || reach > 0.5 || f >= END ? (f >= END ? 1 : 0) : 1} mouth={mouth} />
        <Char id="hoelun" x={1380} h={640} bottom={110} flip pose="sad" enter="none" beat={f >= L20 + 30 ? "sink" : "none"} beatAt={L20 + 32} />
        {door > 0 && (
          <div style={{ position: "absolute", inset: 0, filter: "brightness(0.2)" }}>
            <Char id="temujin_child" x={1740} h={340} bottom={300} flip pose="shocked" enter="pop" delay={L20 + 6} beat="none" />
          </div>
        )}
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
      <SFX name="wind" at={0} vol={0.18} dur={frames} />
    </AbsoluteFill>
  );
};

// G) c1_21~25 - 버림: 노을, 우두머리가 사라진 진영 - 사람들이 천막을 걷기 시작 → c1_22 맨 앞에서 지휘하는 타이치우드 족장 "깊은 물은 말랐고…"
//    → 수레·사람들이 떠남 → c1_23 호엘룬이 깃대를 쥐고 앞으로 나서며 외침(아기 없음, 깃대는 땅에 박힌 채 손 옆) → c1_24 두어 사람이 돌아섰다가 밤이 되자 그마저 사라짐
//    → c1_25 빈 초원에 게르 하나 (다음 장면이 같은 게르에서 이어짐)
const LONE: [number, number, number] = [330, 640, 300]; // 홀로 남은 게르 (G 끝 = H 처음)
const SG: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const B = P(at, "c1_21", 0.5); // "하나둘 천막을 걷기 시작"
  const L22 = at("c1_22");
  const L23 = at("c1_23");
  const L24 = at("c1_24");
  const NIGHT = P(at, "c1_24", 0.6);
  const L25 = at("c1_25");
  const fold = (i: number) => interpolate(f, [B + i * 14, B + 22 + i * 14], [0, 1], { ...clamp, easing: (t) => t * t });
  const pull = lerp(f, L25, frames, 1.12, 1, true);
  const shout = speaking(f, L23, "c1_23");
  const step = lerp(f, L23 - 6, L23 + 14, 0, 1, true);
  const night = lerp(f, NIGHT, NIGHT + 30, 0, 1);
  const chiefGo = lerp(f, L23, L23 + sec(3), 0, 1, true);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${pull})`, transformOrigin: "17% 60%" }}>
        <Steppe time="dusk" horizon={560} />
        <AbsoluteFill style={{ opacity: night }}><Steppe time="night" horizon={560} /></AbsoluteFill>
        {[[1080, 600, 200], [1360, 590, 180], [1620, 600, 210]].map(([x, y, w], i) => (
          <div key={i} style={{ position: "absolute", inset: 0, transform: `scaleY(${1 - fold(i)})`, transformOrigin: `${x}px ${y}px`, opacity: 1 - fold(i) * 0.6 }}>
            <Ger x={x} y={y} w={w} door="#6f4a2c" />
          </div>
        ))}
        {[0, 1, 2].map((i) => {
          const go = L22 + 10 + i * 22;
          const cx = interpolate(f, [go, go + 300], [880 + i * 260, 2400 + i * 260], { ...clamp, easing: (t) => t * (0.6 + 0.4 * t) });
          return <Cart key={i} x={cx} y={760 + (i % 2) * 40} s={0.8 - i * 0.06} ox={i === 1 ? "camel" : "ox"} />;
        })}
        {FOLK.map((k, i) => {
          // 0·2번(노인·아이 딸린 사람)은 호엘룬의 외침에 돌아섰다가(c1_24) 밤이 되면 사라짐
          const turner = i === 0 || i === 2;
          const s0 = L22 + 14 + i * 6;
          const t = Math.max(0, f - s0);
          const back = turner && f >= L24;
          if (back && f >= NIGHT + 30) return null;
          const fwd = Math.max(0, (back ? L24 : f) - s0);
          const x = 840 + i * 175 + fwd * 3.2 - (back ? (f - L24) * 2.4 : 0);
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: back ? 1 - night : 1 }}>
              <Folk x={x} y={905 + (i % 2) * 26 - (i % 3) * 10} k={k} walk={(back ? f - L24 : t) / 4} lookBack={back} />
            </div>
          );
        })}
        {/* 족장: 수레 행렬 앞에서 손을 젓고("더 따를 이유가 없다") → 등을 돌려 떠남 */}
        {f >= L22 - 10 && chiefGo < 1 && (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${chiefGo * 900}px)`, opacity: 1 - chiefGo }}>
            <Char id="taichiud_chief" x={1440} h={720} bottom={110} flip={chiefGo === 0} pose={chiefGo > 0 ? "side" : "smug"} enter="pop" delay={L22 - 10} beat="none" talking={speaking(f, L22, "c1_22")} gesture={f >= L22 + 8 && chiefGo === 0 ? "open" : undefined} gestureAt={L22 + 8} />
          </div>
        )}
        <Ger x={LONE[0]} y={LONE[1]} w={LONE[2]} lit={lerp(f, L25, frames, 0, 0.85)} />
        <Glow x={LONE[0]} y={LONE[1] - 50} r={280} op={lerp(f, L25, frames, 0, 0.55)} />
        {f < L25 && (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${step * 120}px)` }}>
            <Tug x={720} y={950} h={480} sway={Math.sin(f / 9) * 8} />
            <Char id="hoelun" x={560} h={620} bottom={130} pose={f >= L24 ? "sad" : f >= L23 - 6 ? "angry" : "shocked"} enter="none" beat={f >= L23 && f < L24 ? "shake" : "none"} beatAt={L23 + 2} gesture={f >= L23 - 6 && f < L24 ? "point" : undefined} gestureAt={L23 - 4} talking={shout} />
          </div>
        )}
        {f < L25 && <Char id="temujin_child" x={380} h={440} bottom={130} pose={f >= L24 ? "angry" : "sad"} enter="none" beat="none" />}
        {f >= L25 && (
          <div style={{ position: "absolute", inset: 0, opacity: lerp(f, L25, L25 + 20, 0, 1) }}>
            <Char id="hoelun" x={560} h={420} bottom={300} pose="sad" enter="none" beat="none" />
            <Char id="temujin_child" x={680} h={320} bottom={300} pose="sad" enter="none" beat="none" />
          </div>
        )}
      </AbsoluteFill>
      <Dim op={lerp(f, L25, frames, 0, 0.3)} />
      <SFX name="wind" at={0} vol={0.3} dur={frames} />
    </AbsoluteFill>
  );
};

// H) c1_26~28 - 버틴 날들: G의 마지막 게르가 밤 → 새벽으로 밝아지고 강가로 이어짐(7판 "전환이 매끄럽지 못함") → 강가 낚시·뿌리 캐기
//    → c1_27 바늘을 불에 달궈 구부리는 손 클로즈업 → 다시 강가, 작은 물고기를 낚아 환호 😏 → c1_28 강가에서 동생 카사르가 날아가는 새를 한 발에 떨어뜨리고 으쓱, 테무친이 주먹 😏
const SH: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const DAWN = sec(1.6);
  const L27 = at("c1_27");
  const BACK = P(at, "c1_27", 0.72);
  const CATCH_AT = P(at, "c1_27", 0.95);
  const L28 = at("c1_28");
  if (f < DAWN + 14) {
    const dawn = lerp(f, 0, DAWN, 0, 1, true);
    const into = lerp(f, DAWN, DAWN + 14, 0, 1);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${1 + dawn * 0.06})`, transformOrigin: "17% 60%" }}>
          <Steppe time="night" horizon={560} />
          <AbsoluteFill style={{ opacity: dawn }}><Steppe time="dusk" horizon={560} /></AbsoluteFill>
          <Ger x={LONE[0]} y={LONE[1]} w={LONE[2]} lit={0.85 * (1 - dawn)} />
          <Dim op={0.3 * (1 - dawn)} />
        </AbsoluteFill>
        <AbsoluteFill style={{ opacity: into }}><Fishing t0={80 - CATCH_AT} /></AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (f < L28) {
    const needle = f >= L27 && f < BACK;
    if (needle) {
      const t = f - L27;
      const bend = lerp(t, 10, 50, 0, 1, true);
      const hot = 0.5 + 0.5 * Math.sin(t / 4);
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ transform: `scale(${1.05 + t * 0.0008})` }}>
            <Paper />
            <Glow x={1040} y={760} r={520} op={0.55} color="#f0a050" />
            <Fire x={1080} y={1060} s={2.2} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d={`M 700 430 L 1040 430 Q ${1040 + 60 * bend} 430 ${1040 + 60 * bend} ${430 + 70 * bend} Q ${1040 + 60 * bend} ${430 + 120 * bend} ${1040 - 10 * bend} ${430 + 110 * bend}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d={`M 700 430 L 1040 430 Q ${1040 + 60 * bend} 430 ${1040 + 60 * bend} ${430 + 70 * bend} Q ${1040 + 60 * bend} ${430 + 120 * bend} ${1040 - 10 * bend} ${430 + 110 * bend}`} stroke="#9aa0a2" strokeWidth={7} fill="none" strokeLinecap="round" />
              <circle cx={1040 + 60 * bend} cy={430 + 70 * bend} r={18} fill="#ff8a3a" opacity={0.55 * hot} />
              <g transform="translate(0 0)">
                <Sleeve x1={300} y1={560} x2={660} y2={440} w1={110} w2={70} color={KID.robe} trim={KID.trim} />
                <Grip x={690} y={432} rot={-10} skin={KID.skin} />
              </g>
            </svg>
          </AbsoluteFill>
          <Dim op={0.12} />
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill>
        <Fishing t0={80 - CATCH_AT} />
        {f >= BACK && f < BACK + 8 && <Dim op={lerp(f, BACK, BACK + 8, 0.6, 0)} />}
      </AbsoluteFill>
    );
  }
  // c1_28 카사르의 활
  const g = f - L28;
  const DRAW = P(at, "c1_28", 0.3) - L28;
  const SHOT = P(at, "c1_28", 0.5) - L28;
  const draw = g < DRAW ? lerp(g, 10, DRAW, 0, 1, true) : g < SHOT ? 1 : 0;
  const ak = lerp(g, SHOT, SHOT + 12, 0, 1);
  const hit = g >= SHOT + 12;
  const bx = 1500 + (hit ? 0 : -g * 2);
  const fallK = lerp(g, SHOT + 12, SHOT + 50, 0, 1);
  const shrug = lerp(g, SHOT + 30, SHOT + 42, 0, 1, true) * (1 - lerp(g, SHOT + 70, SHOT + 84, 0, 1, true));
  return (
    <AbsoluteFill>
      <Cam z={lerp(g, 0, frames - L28, 1.04, 1.0)} cx={960} cy={540}>
        <Steppe time="day" horizon={560} />
        <River y={720} h={110} time="day" />
        <Reeds x={1500} y={760} n={6} />
        <KasarBow x={760} y={960} s={1.25} draw={draw} aim={34} shrug={shrug} arrow={g < SHOT} />
        <ArrowFly a={[1000, 560]} b={[bx, 230]} k={ak} />
        {!hit ? <Falcon x={bx} y={230} s={1.3} flap={Math.abs(Math.sin(f / 3))} /> : fallK < 1 && (
          <div style={{ position: "absolute", inset: 0, transform: `translate(${fallK * 80}px, ${fallK * fallK * 560}px) rotate(${fallK * 200}deg)`, transformOrigin: `${bx}px 230px` }}>
            <Falcon x={bx} y={230} s={1.3} flap={0} />
          </div>
        )}
        <Char id="temujin_child" x={1300} h={500} bottom={140} flip pose={hit ? "happy" : "front"} enter="none" beat={g >= SHOT + 24 ? "hop" : "none"} beatAt={SHOT + 26} gesture={g >= SHOT + 24 ? "fist" : undefined} gestureAt={SHOT + 24} />
      </Cam>
      <SFX name="swish" at={L28 + SHOT} vol={0.35} />
      <SFX name="arrow_hit" at={L28 + SHOT + 12} vol={0.3} />
    </AbsoluteFill>
  );
};

// I) c1_29~30 - 교훈 1 (7판 S10): 겨울밤, 게르 앞 작은 불가의 테무친이 먼 부족 진영 불빛을 노려봄 → 미래: 칭기즈칸이 부족 깃발을 쓰러뜨리고 흰 툭 하나
const SI: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L30 = at("c1_30");
  if (f < L30) {
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, L30, 1.0, 1.1)} cx={760} cy={620}>
          <Steppe time="night" horizon={520} />
          {[[1180, 500, 3], [1420, 486, 1], [1660, 504, 2], [1820, 494, 0]].map(([x, y, k], i) => (
            <React.Fragment key={i}>
              <Glow x={x} y={y - 6} r={70} op={0.55} color="#f0a050" />
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}><g style={{ filter: "brightness(0.6)" }}><BannerG x={x + 30} y={y} kind={k} h={90} t={f} /></g></svg>
            </React.Fragment>
          ))}
          <Ger x={420} y={720} w={300} lit={0.8} />
          <svg width={300} height={150} viewBox="0 0 260 130" style={{ position: "absolute", left: 270, top: 517, ...ink }}>
            <path d="M 14 82 C 60 18 200 18 246 82 C 220 70 200 76 180 68 C 150 76 120 64 90 72 C 60 64 40 76 14 82 Z" fill="#dfe4e8" stroke={INK} strokeWidth={4} />
          </svg>
          <Fire x={760} y={960} s={0.7} />
          <Char id="temujin_child" x={900} h={600} bottom={90} flip pose={f >= P(at, "c1_29", 0.3) ? "angry" : "sad"} enter="none" beat={f >= P(at, "c1_29", 0.66) ? "shake" : "none"} beatAt={P(at, "c1_29", 0.68)} gesture={f >= P(at, "c1_29", 0.66) ? "fist" : undefined} gestureAt={P(at, "c1_29", 0.66)} />
          <Snow n={50} wind={4} />
        </Cam>
        <Dim op={0.15} />
        <SFX name="wind" at={0} vol={0.28} dur={L30} />
      </AbsoluteFill>
    );
  }
  const g = f - L30;
  const BREAK = P(at, "c1_30", 0.44) - L30;
  const flags = [[260, 3], [520, 1], [760, 2], [1160, 0], [1400, 4], [1660, 5]];
  const tug = lerp(g, BREAK + 40, BREAK + 70, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(g, 0, frames - L30, 1.06, 1.0)} cx={960} cy={560}>
        <Steppe time="dusk" horizon={700} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,214,140,0.45), rgba(0,0,0,0) 70%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {flags.map(([x, k], i) => <BannerG key={i} x={x} y={820} kind={k} h={300} t={f} fall={lerp(g, BREAK + i * 6, BREAK + i * 6 + 14, 0, 1, true)} />)}
        </svg>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - tug) * 380}px)`, opacity: tug }}>
          <Tug x={960} y={860} h={620} sway={Math.sin(f / 14) * 6} />
        </div>
        <Char id="genghis" x={960} h={720} bottom={100} pose="front" enter="up" delay={L30 + 4} beat="none" gesture={g >= BREAK - 8 ? "open" : undefined} gestureAt={L30 + BREAK - 8} />
      </Cam>
      <AbsoluteFill style={{ background: "#d8b070", opacity: 0.12, mixBlendMode: "multiply" }} />
      <SFX name="drum" at={L30 + BREAK} vol={0.4} />
    </AbsoluteFill>
  );
};

// J) c1_31~32 - 몇 해 뒤 강가(평화) → "지평선 너머로 흙먼지" 언덕 위에 먼지와 검은 기병들 → c1_32 기병 떼가 카메라 앞을 휩쓸고, 맨 앞에 버리고 떠났던 족장(능글)
const SJ: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const DUST = P(at, "c1_31", 0.6);
  const L32 = at("c1_32");
  const CHIEF = P(at, "c1_32", 0.45);
  if (f < L32) {
    const hill = lerp(f, DUST, DUST + 20, 0, 1);
    return (
      <AbsoluteFill>
        <Fishing t0={200} />
        {hill > 0 && (
          <AbsoluteFill style={{ opacity: hill }}>
            <Dust x={420} y={400} t={0.35 + ((f - DUST) % 40) / 120} r={110} color="#b8a072" />
            {[0, 1, 2, 3, 4].map((i) => <Rider key={i} kind="mongol2" x={260 + i * 110} y={392 - (i % 2) * 8} w={120} still={f < DUST + 40} phase={i * 3} dark />)}
          </AbsoluteFill>
        )}
        <Dim op={lerp(f, L32 - 8, L32, 0, 1)} />
        {f >= DUST && <SFX name="rumble" at={DUST} vol={0.25} dur={L32 - DUST} />}
      </AbsoluteFill>
    );
  }
  const g = f - L32;
  if (f < CHIEF) {
    return (
      <AbsoluteFill style={{ transform: `translate(${shake(g, 0, 6, 60).x}px, 0)` }}>
        <Steppe time="day" horizon={500} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Rider key={i} kind="mongol2" x={-500 + g * (14 + (i % 3) * 2) + (i % 4) * 240 - Math.floor(i / 4) * 300} y={380 + (i % 4) * 70 + Math.floor(i / 4) * 40} w={300 + (i % 4) * 70} phase={i * 3} />)}
        <Dust x={g * 14 - 200} y={980} t={(g % 20) / 20} r={180} />
        <SFX name="cavalry" at={L32} vol={0.4} dur={CHIEF - L32} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, CHIEF, frames, 1.0, 1.12)} cx={960} cy={500}>
        <Steppe time="day" horizon={560} />
        {[[200, 430], [420, 400], [1300, 410], [1520, 440]].map(([x, y], i) => <Rider key={i} kind="mongol2" x={x} y={y} w={340} still flip={x > 960} />)}
        <Char id="taichiud_chief" x={960} h={820} bottom={60} pose="smug" enter="up" delay={CHIEF} beat="none" />
      </Cam>
      <Dim op={lerp(f, frames - 10, frames, 0, 0.6)} />
      <SFX name="drum" at={CHIEF} vol={0.35} />
    </AbsoluteFill>
  );
};

// K) c1_33~35 - 숲속 방벽: 가족이 쓰러진 나무로 방벽을 쌓고 그 뒤에서 카사르가 활을 쏴 맨 앞 기병을 멈춰 세움(동생이 가만있지 않음 - 7판 피드백)
//    → c1_34 족장 "테무친만 내놔라!" → c1_35 테무친이 말에 올라 혼자 숲 깊이 달아남, 가족이 바라봄
const SK: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L34 = at("c1_34");
  const L35 = at("c1_35");
  const RIDE = P(at, "c1_35", 0.45);
  const shotK = (i: number) => lerp((f + i * 23) % 46, 20, 32, 0, 1);
  const drawK = (f % 46) < 20 ? lerp(f % 46, 0, 20, 0, 1) : 0;
  const ride = lerp(f, RIDE, frames, 0, 1);
  return (
    <AbsoluteFill>
      <Cam z={f >= L34 && f < L35 ? lerp(f, L34, L34 + 20, 1.0, 1.18, true) : 1} cx={f >= L34 && f < L35 ? 480 : 960} cy={540}>
        <Forest light={0.8} />
        <Barricade x={900} y={900} w={700} />
        {/* 왼쪽: 추격대 (말을 세움) */}
        {f < L35 && [[-60, 470, 0], [120, 520, 4], [300, 480, 8]].map(([x, y, ph], i) => <Rider key={i} kind="mongol2" x={x} y={y} w={340} still={f > sec(1.5)} phase={ph} />)}
        {f >= L34 - 6 && f < L35 && <Char id="taichiud_chief" x={420} h={700} bottom={110} pose="angry" enter="pop" delay={L34 - 6} beat="none" talking={speaking(f, L34, "c1_34")} gesture="point" gestureAt={L34 + 4} />}
        {/* 오른쪽: 방벽 뒤 가족 */}
        <Char id="hoelun" x={1700} h={520} bottom={160} flip pose="shocked" enter="none" beat="none" />
        {f < RIDE && <Char id="temujin_child" x={1500} h={470} bottom={170} flip pose={f >= L34 ? "shocked" : "angry"} enter="none" beat={f >= L35 ? "nod" : "none"} beatAt={L35 + 8} />}
        <KasarBow x={1180} y={830} s={1.05} draw={f < L35 ? drawK : 0} aim={6} flip arrow={f < L35} />
        {f < L35 && [0, 1].map((i) => <ArrowFly key={i} a={[1000, 610]} b={[380, 600]} k={shotK(i)} />)}
        {/* 숲 깊이 달아나는 테무친 (작아짐) */}
        {f >= RIDE && ride < 1 && <Rider kind="temujin" x={lerp(ride, 0, 1, 1460, 1840)} y={lerp(ride, 0, 1, 520, 480)} w={lerp(ride, 0, 1, 360, 120)} phase={2} />}
        {f >= RIDE && <Dim op={ride * 0.5} />}
      </Cam>
      <SFX name="arrows" at={sec(0.5)} vol={0.25} dur={L35 - sec(0.5)} />
      {f >= RIDE && <SFX name="hooves" at={RIDE} vol={0.25} dur={frames - RIDE} />}
    </AbsoluteFill>
  );
};

// L) c1_36~43 - 숲에서 아흐레: 나무 칼자국으로 날을 셈(숫자는 화면에 안 씀). ① 웅크린 테무친, 칼자국 셋 → 말을 끌고 나서려는데 ② 안장이 스르르 떨어짐
//    "하늘이… 나가지 말라는 건가?" ③ 칼자국 여섯, 길목을 막은 흰 바위 - 한참 쳐다봄 "…네, 알겠습니다" 😏 ④ 칼자국 아홉, 홀쭉
//    "이름도 없이 굶어 죽을 수는 없다" 덤불을 칼로 벰 ⑤ 숲을 빠져나오는 순간 사방에서 올가미
const SL: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const GO = P(at, "c1_36", 0.5);
  const L37 = at("c1_37");
  const SLIP = P(at, "c1_37", 0.55);
  const L38 = at("c1_38");
  const L39 = at("c1_39");
  const ROCK = P(at, "c1_39", 0.6);
  const L40 = at("c1_40");
  const L41 = at("c1_41");
  const L42 = at("c1_42");
  const CUT = P(at, "c1_42", 1) + 4;
  const L43 = at("c1_43");
  const TRAP = P(at, "c1_43", 0.5);
  const n = f < L39 ? 3 : f < L41 ? 6 : 9;
  const dayFlick = (a: number) => (f >= a && f < a + 30 ? 0.5 + 0.5 * Math.cos(((f - a) / 30) * Math.PI * 2) : 1);
  if (f < L39) {
    const close = f >= L37 ? lerp(f, L37, L37 + 20, 0, 1, true) : 0;
    const walk = lerp(f, GO, L37, 0, 1, true);
    return (
      <AbsoluteFill>
        <Cam z={1 + close * 0.25} cx={lerp(close, 0, 1, 960, 1180)} cy={lerp(close, 0, 1, 540, 640)}>
          <Forest light={dayFlick(0)} />
          <NotchTree x={260} n={n} fresh={lerp(f, 0, 30, 1, 0)} />
          <Horse x={1320} y={920} s={1.1} saddle={lerp(f, SLIP, SLIP + 22, 0, 1)} />
          <Char id="temujin_child" x={lerp(walk, 0, 1, 640, 1000)} h={f < GO ? 380 : 470} bottom={f < GO ? 120 : 140} flip={false} pose={f >= L38 ? "shocked" : f >= SLIP ? "shocked" : "sad"} enter="none" beat={f >= SLIP && f < SLIP + 10 ? "jump" : "none"} beatAt={SLIP + 4} talking={speaking(f, L38, "c1_38")} />
        </Cam>
        {f >= SLIP && <SFX name="hit" at={SLIP + 20} vol={0.35} />}
        <SFX name="wind" at={0} vol={0.18} dur={L39} />
      </AbsoluteFill>
    );
  }
  if (f < L43) {
    const reveal = lerp(f, ROCK - 14, ROCK + 10, 0, 1, true);
    const thin = f >= L41;
    const cut = lerp(f, CUT - 8, CUT + 14, 0, 1, true);
    const stare = f >= ROCK && f < L41;
    return (
      <AbsoluteFill>
        <Cam z={stare ? lerp(f, L40 - 10, L40 + 10, 1.0, 1.15, true) : 1} cx={stare ? 900 : 960} cy={560}>
          <Forest light={dayFlick(f < L41 ? L39 : L41)} shift={reveal * -200} />
          <NotchTree x={260 - reveal * 200} n={n} fresh={lerp(f, f < L41 ? L39 : L41, (f < L41 ? L39 : L41) + 30, 1, 0)} />
          {f < L41 && <WhiteRock x={1420 - reveal * 120} y={880} s={1.15} />}
          {f >= L41 && (
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              {[-1, 1].map((k) => (
                <g key={k} transform={`translate(${k * cut * 170} ${cut * 30}) rotate(${k * cut * 14} 1500 860)`}>
                  <ellipse cx={1500 + k * 90} cy={760} rx={150} ry={130} fill="#3e5a30" stroke={INK} strokeWidth={6} />
                  <ellipse cx={1500 + k * 60} cy={660} rx={110} ry={90} fill="#4e6e3c" stroke={INK} strokeWidth={5} />
                </g>
              ))}
              {cut > 0 && <path d="M 1500 520 L 1500 900" stroke="#f4e6b0" strokeWidth={40 * cut} opacity={0.5} />}
            </svg>
          )}
          <div style={{ position: "absolute", inset: 0, transform: thin ? "scaleX(0.86)" : undefined, transformOrigin: "820px 1000px" }}>
            <Char id="temujin_child" x={820} h={470} bottom={140} pose={f >= L42 ? "angry" : thin ? "sad" : f >= L40 ? "sad" : "shocked"} enter="none" beat={f >= L40 && f < L41 ? "nod" : f >= L41 && f < L42 ? "sink" : "none"} beatAt={f >= L41 ? L41 + 10 : L40 + 14} gesture={f >= L42 && f < CUT + 14 ? "fist" : undefined} gestureAt={L42 + 6} talking={speaking(f, L40, "c1_40") || speaking(f, L42, "c1_42")} />
          </div>
        </Cam>
        {f >= CUT && <SFX name="sword" at={CUT} vol={0.35} />}
        <SFX name="wind" at={L39} vol={0.18} dur={L43 - L39} />
      </AbsoluteFill>
    );
  }
  // 숲 가장자리 → 기다리던 추격대, 올가미
  const g = f - L43;
  const walk = lerp(f, L43, TRAP, 0, 1, true);
  const sh = shake(f, TRAP + 18, 10, 26);
  const kx = lerp(walk, 0, 1, 520, 900);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <Cam z={lerp(f, TRAP, frames, 1.0, 1.12)} cx={900} cy={600}>
        <Steppe time="day" horizon={600} />
        <div style={{ position: "absolute", left: -1300, top: 0, width: 1920, height: 1080, overflow: "hidden" }}><Forest light={1} /></div>
        {f >= TRAP && [[1300, 440, true], [1520, 500, true], [-40, 470, false]].map(([x, y, fl], i) => (
          <div key={i} style={{ position: "absolute", inset: 0, opacity: lerp(f, TRAP + i * 4, TRAP + i * 4 + 10, 0, 1) }}>
            <Rider kind="mongol2" x={x as number} y={y as number} w={380} still flip={fl as boolean} />
          </div>
        ))}
        <Char id="temujin_child" x={kx} h={460} bottom={140} pose={f >= TRAP + 10 ? "shocked" : "sad"} enter="none" beat={f >= TRAP + 18 ? "shake" : "none"} beatAt={TRAP + 18} />
        {f >= TRAP && <Lasso x1={1440} y1={520} x2={kx} y2={720} k={lerp(f, TRAP + 4, TRAP + 18, 0, 1)} />}
        {f >= TRAP && <Lasso x1={160} y1={560} x2={kx} y2={760} k={lerp(f, TRAP + 8, TRAP + 22, 0, 1)} />}
      </Cam>
      <Dim op={lerp(f, frames - 16, frames, 0, 0.8)} />
      {g >= 0 && f >= TRAP && <SFX name="whoosh" at={TRAP + 4} vol={0.35} />}
    </AbsoluteFill>
  );
};

// M) c1_44 - 족장 앞: 감시병 사이 붙잡힌 테무친, 족장이 성큼 들어와 "목에 칼을 씌워라" → 나무 칼이 위에서 쿵 (7판 S11 뒷부분)
const SM: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L = at("c1_44");
  const CLAMP = L + Math.ceil(slotSec("c1_44") * FPS) - 4;
  const drop = spring({ frame: f - CLAMP, fps: 30, config: { damping: 11, stiffness: 160 } });
  const sh = shake(f, CLAMP + 6, 12, 22);
  const push = lerp(f, 0, CLAMP, 0, 0.1);
  const tilt = lerp(f, CLAMP + 6, CLAMP + 40, 0, -7, true);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + push})`, transformOrigin: "50% 55%" }}>
        <Steppe time="day" horizon={560} />
        <Camp horizon={560} n={7} />
        <Dim op={0.2} />
        <Char id="archer" x={250} h={560} bottom={130} pose="angry" enter="none" beat="none" />
        <Char id="archer" x={1030} h={560} bottom={130} flip pose="angry" enter="none" beat="none" />
        {f < CLAMP + 4 ? (
          <Char id="temujin_child" x={640} h={540} bottom={150} pose="shocked" enter="none" beat="none" />
        ) : (
          <CangueKid x={640} y={590} s={0.95} tilt={tilt} pose={f < CLAMP + 30 ? "shocked" : "sad"} drop={Math.min(1, drop)} eyes={f > CLAMP + 60 && f % 70 < 14 ? 1 : undefined} />
        )}
        <div style={{ position: "absolute", inset: 0, transform: `translate(${lerp(f, 0, 40, 760, 0, true)}px, ${f < 40 ? -Math.abs(Math.sin(f / 4)) * 12 : 0}px)` }}>
          <Char id="taichiud_chief" x={1440} h={720} bottom={100} flip pose={f < 40 ? "side" : "smug"} enter="none" beat="none" talking={speaking(f, L, "c1_44")} gesture={f >= L + sec(1.6) ? "point" : undefined} gestureAt={L + sec(1.6)} />
        </div>
      </AbsoluteFill>
      <SFX name="hit" at={CLAMP + 6} vol={0.5} />
    </AbsoluteFill>
  );
};

// N) c1_45 - 하룻밤씩 이 천막 저 천막으로 끌려다님 (7판 S12)
const SN: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const pan = lerp(f, 0, frames, 0, -900);
  const wob = Math.sin(f / 5);
  const kx = 1500 + lerp(f, 0, frames, 0, -760);
  const night = lerp(f, frames * 0.45, frames * 0.6, 0, 1);
  return (
    <AbsoluteFill>
      <Steppe time="day" horizon={540} />
      <AbsoluteFill style={{ opacity: night }}><Steppe time="night" horizon={540} /></AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${pan * 0.4}px)` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 3200, height: 1080 }}>
          <Camp horizon={540} n={10} x0={0} span={3000} dark={night > 0.5} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${pan}px)` }}>
        {FOLK.slice(1).map((k, i) => <Folk key={i} x={500 + i * 420} y={760} k={{ ...k, sc: k.sc * 0.8 }} walk={0} lookBack={i % 2 === 0} />)}
        <svg width={4000} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          <path d={`M ${kx - 120} ${700 + wob * 6} Q ${kx - 260} 820 ${kx - 420} 700`} stroke={INK} strokeWidth={8} fill="none" />
          <path d={`M ${kx - 120} ${700 + wob * 6} Q ${kx - 260} 820 ${kx - 420} 700`} stroke="#a8875a" strokeWidth={4} fill="none" />
        </svg>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-Math.abs(Math.sin(f / 6)) * 8}px)` }}>
          <Char id="archer" x={kx - 470} h={560} bottom={120} flip pose="angry" enter="none" beat="none" />
        </div>
        <CangueKid x={kx} y={600 + Math.abs(wob) * 10} s={0.8} tilt={wob * 6 - 4} pose="sad" slump={10} />
      </AbsoluteFill>
      <Dim op={night * 0.3} />
      <SFX name="crowd" at={0} vol={0.15} dur={frames} />
    </AbsoluteFill>
  );
};

// O) c1_46~49 - 탈출 (7판 S13): 보름달, 멀리 잔치 → 테무친 곁엔 비실비실한 감시 소년 하나(하품) 😏 → 나무 칼로 내리치고 달아남 → 강물에 얼굴만
//    → c1_49 소년이 소리치고 횃불 수십 개가 강 건너편으로 몰려옴
const SO: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const BOY = P(at, "c1_46", 0.7); // "비실비실한 소년 하나뿐"
  const HIT = P(at, "c1_47", 0.5);
  const RUN = HIT + 22;
  const RIVER = at("c1_48") + 6;
  const L49 = at("c1_49");
  if (f < RUN) {
    const rise = lerp(f, HIT - 44, HIT - 18, 70, 0, true);
    const kx = interpolate(f, [HIT - 14, HIT], [600, 840], { ...clamp, easing: (t) => t * t });
    const swing = interpolate(f, [HIT - 12, HIT - 2, HIT + 8], [0, -22, 10], clamp);
    const fall = interpolate(f, [HIT, HIT + 12], [0, 82], { ...clamp, easing: (t) => t * t });
    const sh = shake(f, HIT, 14, 20);
    const boyZoom = f >= BOY && f < at("c1_47") ? lerp(f, BOY, BOY + 20, 0, 1, true) : 0;
    const yawn = f >= BOY + 10 && f < BOY + 60;
    return (
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        <Cam z={1.04 + boyZoom * 0.3} cx={lerp(boyZoom, 0, 1, 960, 1150)} cy={lerp(boyZoom, 0, 1, 540, 700)}>
          <Steppe time="night" horizon={560} />
          <Glow x={1700} y={520} r={240} op={0.6} color="#f0a050" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", left: 1600 + i * 60, top: 470 - Math.abs(Math.sin(f / 5 + i)) * 14, width: 26, height: 60, borderRadius: "13px 13px 4px 4px", background: "#120c08" }} />
          ))}
          <Ger x={1480} y={600} w={220} door="#3b3b3b" lit={0.4} />
          <Fire x={1300} y={930} s={0.55} />
          {/* 감시 소년 (작고 마름, 꾸벅꾸벅·하품) - 맞으면 쓰러짐 */}
          <div style={{ position: "absolute", inset: 0, transform: `rotate(${fall}deg)`, transformOrigin: "1150px 940px", filter: "brightness(0.7)" }}>
            <div style={{ position: "absolute", inset: 0, transform: `rotate(${Math.sin(f / 9) * 4}deg) scaleX(0.8)`, transformOrigin: "1150px 940px" }}>
              <Folk x={1150} y={940} k={{ ...FOLK[2], load: "staff", sc: 1.3, mood: "sad" }} walk={0} lookBack />
            </div>
            {yawn && (
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
                <ellipse cx={1112} cy={640} rx={10} ry={16 * Math.sin(((f - BOY - 10) / 50) * Math.PI)} fill="#3a1a12" />
              </svg>
            )}
          </div>
          <CangueKid x={kx} y={560} s={0.72} slump={rise} tilt={swing} pose={f >= HIT - 50 ? "angry" : "sad"} sweat />
          {f >= HIT && f < HIT + 10 && (
            <svg width={300} height={300} style={{ position: "absolute", left: 1010, top: 380, ...ink }}>
              {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M 150 150 L ${150 + Math.cos(i * 1.3) * 120} ${150 + Math.sin(i * 1.3) * 120}`} stroke="#f3e6c4" strokeWidth={8} strokeLinecap="round" />)}
            </svg>
          )}
        </Cam>
        <Dim op={0.3} />
        <SFX name="hit" at={HIT} vol={0.5} />
        <SFX name="campfire" at={0} vol={0.2} dur={HIT} />
      </AbsoluteFill>
    );
  }
  if (f < RIVER) {
    const t = f - RUN;
    const wob = Math.sin(t / 2.6);
    return (
      <AbsoluteFill>
        <Steppe time="night" horizon={540} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const x = ((i * 233 - t * 16) % 2200 + 2200) % 2200 - 140;
            const y = 700 + ((i * 71) % 300);
            return <path key={i} d={`M ${x} ${y} l 10 -40 M ${x + 14} ${y} l 2 -50 M ${x + 26} ${y} l -6 -38`} stroke="#141a1c" strokeWidth={6} strokeLinecap="round" />;
          })}
        </svg>
        <CangueKid x={860 + t * 2} y={600 - Math.abs(wob) * 26} s={0.66} tilt={wob * 10} pose="shocked" sweat />
        <Reeds x={2000 - t * 15} y={1000} n={9} dark />
        <Dim op={0.2} />
        <SFX name="swish" at={0} vol={0.2} />
      </AbsoluteFill>
    );
  }
  const t = f - RIVER;
  const k = interpolate(t, [0, 46], [0, 1], { ...clamp, easing: (u) => u * u * (3 - 2 * u) });
  const kx = interpolate(k, [0, 1], [430, 880]);
  const ky = interpolate(k, [0, 0.4, 1], [WATER - 240, WATER - 150, WATER - 10]);
  const torches = f >= L49 ? lerp(f, L49, L49 + sec(3), 0, 1, true) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${lerp(t, 0, frames - RIVER, 1, 1.06)})`, transformOrigin: "58% 34%" }}>
        <NightRiver rings={k > 0.8} />
        {torches > 0 && [0, 1, 2, 3, 4, 5, 6].map((i) => {
          const tx = 2100 - torches * (500 + i * 140) + (i % 2) * 60;
          return (
            <React.Fragment key={i}>
              <Glow x={tx} y={500 + (i % 3) * 16} r={120} op={0.5} color="#f0a050" />
              <Torch x={tx} y={500 + (i % 3) * 16} s={0.5} />
            </React.Fragment>
          );
        })}
        <Reeds x={330} y={WATER + 30} n={7} dark />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${1080 - WATER - 70}px 0)` }}>
          <CangueKid x={kx} y={ky} s={0.8} tilt={(1 - k) * Math.sin(t / 3) * 8} pose="shocked" sweat shiver={1.5 + torches * 2} />
        </div>
        {k > 0.5 && [0, 1].map((i) => {
          const tt = Math.max(0, t - 26 - i * 8);
          return <svg key={i} width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}><ellipse cx={kx} cy={WATER + 60} rx={60 + tt * 8} ry={(60 + tt * 8) * 0.16} fill="none" stroke="#c9d6dc" strokeWidth={4} opacity={Math.max(0, 0.7 - tt / 40)} /></svg>;
        })}
        <Reeds x={1080} y={WATER + 70} n={5} dark />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 55% 58%, rgba(5,6,10,0) 40%, rgba(5,6,10,.75))" }} />
      <SFX name="wind" at={RIVER} vol={0.2} />
      {f >= L49 && <SFX name="crowd" at={L49} vol={0.3} dur={frames - L49} />}
    </AbsoluteFill>
  );
};

// P) c1_50~52 - 수색꾼 (7판 S14, 천천히): 횃불이 다가와 물속의 테무친을 똑바로 내려다봄(정적) → c1_51 낮게 "말하지 않으마"
//    → c1_52 천천히 돌아서 다른 횃불들을 반대쪽으로 데리고 감, 테무친은 안도의 숨
const SP: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const SEE = P(at, "c1_50", 0.7);
  const L51 = at("c1_51");
  const TURN = at("c1_52") + 4;
  const TURN_D = 40;
  const LEAVE = TURN + TURN_D + 6;
  const manX = (t: number) => interpolate(t, [0, SEE - 14], [2150, 1180], { ...clamp, easing: (u) => 1 - Math.pow(1 - u, 2) }) + interpolate(t, [LEAVE, LEAVE + 260], [0, 1000], { ...clamp, easing: (u) => u * u });
  const mx = manX(f);
  const walking = f < SEE - 14 || f > LEAVE;
  const bob = walking ? Math.abs(Math.sin(f / 7)) * -7 : 0;
  const k1 = interpolate(f, [SEE - 16, SEE - 2], [0, 1], clamp);
  const k2 = interpolate(f, [TURN, TURN + TURN_D], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const near = interpolate(Math.abs(mx - 1180), [0, 900], [1, 0], clamp);
  const cam = interpolate(f, [0, SEE, L51 + 20, TURN, frames], [1.06, 1.16, 1.34, 1.3, 1.0], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const camX = interpolate(f, [0, SEE, L51 + 20, frames], [0, -40, -60, 0], clamp);
  const bobW = Math.sin(f / 26) * 4;
  const RELAX = TURN + 70;
  const relaxed = f >= RELAX;
  const pose = relaxed ? "sad" : "shocked";
  const eyes: 0 | 1 = relaxed ? 1 : 0;
  const mouth = relaxed ? "1" : f >= SEE - 2 && f < SEE + 20 ? "1" : "0";
  const fear = interpolate(f, [0, SEE, L51 + 40, RELAX], [1.5, 4, 3, 2.2], clamp);
  const shiver = relaxed ? interpolate(f, [RELAX, RELAX + 60], [2.2, 0.8], clamp) : fear;
  const breath = interpolate(f, [RELAX + 4, RELAX + 64], [0, 1], clamp);
  const slump = interpolate(f, [RELAX, RELAX + 40], [0, 14], { ...clamp, easing: ease });
  const look: [number, number] = f >= SEE - 2 && k2 < 0.5 ? [-5, 5] : [3, 0];
  const H = 470;
  const B = 1080 - 650;
  const man = (p: string, flip: boolean) => (
    <>
      <Shadow>
        <Char id="archer" x={mx} h={H} bottom={B} pose={p} flip={flip} enter="none" beat="none" />
      </Shadow>
      <ManEyes x={mx} h={H} bottom={B} side={p === "side"} flip={flip} look={look} />
    </>
  );
  const others = lerp(f, LEAVE, LEAVE + 200, 0, 1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${camX}px) scale(${cam})`, transformOrigin: "58% 34%" }}>
        <NightRiver />
        {[0, 1, 2].map((i) => {
          const tx = 1500 + i * 160 + others * 900;
          return (
            <React.Fragment key={i}>
              <Glow x={tx} y={470} r={90} op={0.4} color="#f0a050" />
              <Torch x={tx} y={480} s={0.4} />
            </React.Fragment>
          );
        })}
        <Reeds x={330} y={WATER + 30} n={7} dark />
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${bob}px)` }}>
          <Glow x={mx - 80} y={340} r={360} op={0.6} color="#f0a050" />
          <div style={{ position: "absolute", inset: 0, ["--tx" as string]: `${mx}px` } as React.CSSProperties}>
            {k2 > 0 ? <Turning k={k2} a={man("front", false)} b={man("side", false)} /> : k1 > 0 ? <Turning k={k1} a={man("side", true)} b={man("front", false)} /> : man("side", true)}
          </div>
          <Torch x={mx - 80} y={330} s={1.15} />
        </div>
        <Glow x={880} y={WATER - 40} r={300} op={near * 0.55} color="#f3b26a" />
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${bobW}px)` }}>
          <CangueKid x={880} y={WATER - 10} s={0.8} water pose={pose} eyes={eyes} mouth={mouth} face={relaxed ? "relief" : undefined} shiver={shiver} sweat breath={breath} slump={slump} />
        </div>
        <Reeds x={1080} y={WATER + 70} n={5} dark />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${interpolate(f, [SEE - 20, SEE + 20, TURN, TURN + 50], [70, 48, 48, 70], clamp)}% 70% at 55% 58%, rgba(5,6,10,0) 40%, rgba(5,6,10,.75))` }} />
      <SFX name="wind" at={0} vol={0.2} dur={frames} />
      <Snd src={staticFile("sfx/ep/campfire.wav")} volume={(fr) => 0.35 * interpolate(Math.abs(manX(fr) - 1180), [0, 900], [1, 0], clamp) * interpolate(fr, [0, 20], [0, 1], clamp)} />
    </AbsoluteFill>
  );
};

// Q) c1_53~55 - 그 남자의 천막: 밤, 나무 칼을 쓴 테무친이 비틀비틀 게르 앞에 섬 → c1_54 문이 열리고 남자(실루엣)가 기겁 😏 "너, 너는 왜 여길 왔느냐!"
//    → c1_55 게르 안: 아들 둘이 나무 칼을 부숴 불에 넣음 → 밖, 양털 수레 깊숙이 들어가는 테무친
const SQ: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L54 = at("c1_54");
  const L55 = at("c1_55");
  const BREAK = P(at, "c1_55", 0.3);
  const CART = P(at, "c1_55", 0.62);
  if (f < L55) {
    const walk = lerp(f, 0, P(at, "c1_53", 0.6), 0, 1, true);
    const wob = Math.sin(f / 5) * (1 - walk);
    const open = lerp(f, L54 - 8, L54 + 4, 0, 1, true);
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, P(at, "c1_53", 0.6), L54, 1.0, 1.2, true)} cx={1000} cy={620}>
          <Steppe time="night" horizon={600} />
          <Ger x={1150} y={760} w={520} door="#5a3a2a" lit={0.25 + open * 0.75} />
          <Glow x={1150} y={640} r={300} op={0.2 + open * 0.4} />
          {open > 0 && <ShadowMan x={1150} h={300} bottom={1080 - 760} pose="front" beat={f >= L54 ? "jump" : "none"} beatAt={L54 + 2} />}
          {open > 0 && f >= L54 + 20 && <ManEyes x={1150} h={300} bottom={1080 - 760} side={false} flip={false} look={[-6, 2]} />}
          <CangueKid x={lerp(walk, 0, 1, 300, 760)} y={620 + Math.abs(wob) * 10} s={0.7} tilt={wob * 6} pose={f >= L54 ? "shocked" : "sad"} slump={6} />
        </Cam>
        <SFX name="wind" at={0} vol={0.2} dur={L55} />
      </AbsoluteFill>
    );
  }
  if (f < CART) {
    const br = lerp(f, BREAK, BREAK + 16, 0, 1, true);
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, L55, CART, 1.0, 1.08)} cx={960} cy={640}>
          <GerInside dark={0.4} />
          <Fire x={960} y={1000} s={1.1} />
          <ShadowMan x={520} h={560} bottom={110} pose="side" flip={false} beat={f >= BREAK - 10 && f < BREAK + 10 ? "shake" : "none"} beatAt={BREAK - 8} />
          <ShadowMan x={1400} h={540} bottom={110} pose="side" flip beat={f >= BREAK - 10 && f < BREAK + 10 ? "shake" : "none"} beatAt={BREAK - 6} />
          {br < 1 ? (
            <CangueKid x={960} y={560} s={0.82} pose="shocked" />
          ) : (
            <>
              <Char id="temujin_child" x={960} h={520} bottom={150} pose="sad" enter="none" beat="none" />
              {/* 부서진 나무 칼 두 쪽 → 불 속으로 */}
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
                {[-1, 1].map((k) => {
                  const t = lerp(f, BREAK + 16, BREAK + 46, 0, 1, true);
                  return (
                    <g key={k} transform={`translate(${960 + k * (240 - t * 220)} ${560 + t * 420}) rotate(${k * (20 + t * 70)})`} opacity={1 - t * 0.7}>
                      <path d="M -150 -30 L 150 -30 L 140 30 L -140 30 Z" fill="#a47a4c" stroke={INK} strokeWidth={6} />
                    </g>
                  );
                })}
              </svg>
            </>
          )}
        </Cam>
        <SFX name="hit" at={BREAK} vol={0.45} />
        <SFX name="fire" at={BREAK + 30} vol={0.25} dur={CART - BREAK - 30} />
      </AbsoluteFill>
    );
  }
  const sink = lerp(f, CART + 10, CART + 50, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, CART, frames, 1.0, 1.15)} cx={980} cy={640}>
        <Steppe time="night" horizon={600} />
        <Ger x={1600} y={640} w={360} door="#5a3a2a" lit={0.7} />
        <Glow x={1600} y={560} r={260} op={0.4} />
        <Head id="temujin_child" pose="sad" x={1000} y={660 + sink * 120} s={0.8} />
        <WoolCart x={1000} y={900} s={1.25} />
        <ShadowMan x={1360} h={460} bottom={130} pose="front" flip />
      </Cam>
      <Dim op={0.25} />
    </AbsoluteFill>
  );
};

// R) c1_56~59 - 양털 수레 (가장 긴장되는 장면): 낮, 집집마다 뒤지던 추격대가 수레 앞에 멈춤 → c1_57 창끝이 양털을 푹·푹, 양털 속 테무친의 눈 옆을 스침
//    → 양털이 뽑혀 장화 끝이 막 드러나려는 순간 → c1_58 남자(실루엣) "이 더위에 누가 양털 속에…" → c1_59 추격대가 어깨를 으쓱하고 돌아섬, 양털 속 눈이 질끈
const SR: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L57 = at("c1_57");
  const INSIDE = P(at, "c1_57", 0.3);
  const OUT = P(at, "c1_57", 0.68);
  const L58 = at("c1_58");
  const L59 = at("c1_59");
  const RELIEF = P(at, "c1_59", 0.5);
  const thrust = (ph: number) => Math.max(0, Math.sin(((f + ph) / 26) * Math.PI * 2));
  if (f >= INSIDE && f < OUT) {
    // 양털 속 클로즈업: 어둠 속 테무친의 눈, 털 사이로 창끝이 들어왔다 빠짐
    const t = f - INSIDE;
    const k = thrust(0);
    const near = t > 30 ? 1 : 0.5;
    return (
      <AbsoluteFill style={{ background: "#1a140e" }}>
        <AbsoluteFill style={{ transform: `scale(${1.1 + t * 0.001})` }}>
          <Head id="temujin_child" pose="shocked" x={960} y={760} s={1.6} eyes={0} />
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
            {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={(i * 263) % 2000 - 40} cy={(i * 151) % 1100} r={90 + (i % 4) * 30} fill="#e8e0cf" stroke={INK} strokeWidth={4} opacity={Math.abs(((i * 263) % 2000) - 1000) < 260 && ((i * 151) % 1100) > 300 && ((i * 151) % 1100) < 800 ? 0 : 0.95} />)}
            <g transform={`translate(${1960 - k * (560 + near * 140)} ${430 - k * 20})`}>
              <path d="M 0 0 L 900 0" stroke={INK} strokeWidth={22} />
              <path d="M 0 0 L 900 0" stroke="#7a5230" strokeWidth={12} />
              <path d="M -60 0 L 4 -26 L 4 26 Z" fill="#c4c8c9" stroke={INK} strokeWidth={6} />
            </g>
          </svg>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 45% 45% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.8))" }} />
        <SFX name="swish" at={INSIDE + 6} vol={0.3} />
        <SFX name="swish" at={INSIDE + 32} vol={0.35} />
      </AbsoluteFill>
    );
  }
  const searchers = f < L59 + 20 ? 0 : lerp(f, L59 + 20, frames, 0, 1);
  const stop = lerp(f, 0, P(at, "c1_56", 0.7), 0, 1, true);
  const poking = f >= L57 && f < L58;
  const pulled = f >= OUT ? lerp(f, OUT, OUT + 40, 0, 0.75, true) : 0;
  const zoom = f >= OUT && f < L58 ? lerp(f, OUT, OUT + 30, 1, 1.3, true) : 1;
  return (
    <AbsoluteFill>
      <Cam z={zoom * lerp(f, 0, L57, 1.0, 1.06)} cx={zoom > 1 ? 1260 : 960} cy={zoom > 1 ? 760 : 560}>
        <Steppe time="day" horizon={560} />
        <Camp horizon={560} n={5} x0={0} span={1100} />
        <Ger x={1650} y={620} w={320} door="#5a3a2a" />
        <WoolCart x={1000} y={900} s={1.25} pulled={pulled} />
        {/* 추격대 셋: 걸어 들어와 멈춤 → 창으로 찌름 → 어깨를 으쓱하고 떠남 */}
        {[[360, false], [560, false], [1500, true]].map(([x, fl], i) => {
          const xx = (x as number) + (1 - stop) * (fl ? 500 : -500) - searchers * (fl ? -900 : 900);
          return (
            <div key={i} style={{ position: "absolute", inset: 0 }}>
              {poking && i < 2 && (
                <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
                  <g transform={`translate(${xx + 120 + thrust(i * 9) * 220} ${640 + i * 50}) rotate(${-6 + i * 8})`}>
                    <path d="M -260 0 L 160 0" stroke={INK} strokeWidth={12} />
                    <path d="M -260 0 L 160 0" stroke="#7a5230" strokeWidth={6} />
                    <path d="M 196 0 L 156 -16 L 156 16 Z" fill="#b8bcbd" stroke={INK} strokeWidth={4} />
                  </g>
                </svg>
              )}
              <Char id="archer" x={xx} h={520} bottom={110} flip={fl as boolean} pose={f >= L59 ? "front" : "angry"} enter="none" beat={f >= L59 && f < L59 + 20 ? "nod" : "none"} beatAt={L59 + 4} />
            </div>
          );
        })}
        {f >= L58 - 10 && <ShadowMan x={lerp(f, L58 - 10, L58 + 14, 1950, 1700, true)} h={540} bottom={110} pose="front" flip gesture={f >= L58 + 6 && f < L59 + 20 ? "open" : undefined} gestureAt={L58 + 6} />}
        {f >= L59 && f >= RELIEF && (
          <AbsoluteFill style={{ opacity: lerp(f, RELIEF, RELIEF + 10, 0, 1) }}>
            <div style={{ position: "absolute", left: 1180, top: 120, width: 520, height: 300, borderRadius: 40, overflow: "hidden", border: `6px solid ${INK}`, background: "#1a140e" }}>
              <Head id="temujin_child" pose="sad" x={260} y={330} s={0.7} eyes={1} />
            </div>
          </AbsoluteFill>
        )}
      </Cam>
      {f >= OUT && f < L58 && <AbsoluteFill style={{ background: "radial-gradient(ellipse 50% 50% at 60% 60%, rgba(0,0,0,0) 40%, rgba(0,0,0,.6))" }} />}
      <SFX name="march" at={0} vol={0.2} dur={P(at, "c1_56", 0.7)} />
      <SFX name="rumble" at={L57} vol={0.3} dur={L58 - L57} />
    </AbsoluteFill>
  );
};

// S) c1_60~61 - 떠나보냄: 밤, 남자(실루엣)가 안장에 활 하나·화살 두 대·먹을 것 자루를 묶은 말을 건넴 → c1_61 "하마터면 우리 집안이…" 이마를 훔침 😏 → 테무친이 말을 타고 떠남
const SS: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L61 = at("c1_61");
  const RIDE = P(at, "c1_61", 0.9);
  const ride = lerp(f, RIDE, frames, 0, 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.04, 1.12)} cx={900} cy={600}>
        <Steppe time="night" horizon={620} />
        <Ger x={1600} y={660} w={340} door="#5a3a2a" lit={0.8} />
        <Glow x={1600} y={580} r={280} op={0.45} />
        {f < RIDE ? <Horse x={760} y={950} s={1.15} pack /> : <Rider kind="temujin" x={lerp(ride, 0, 1, 600, -600)} y={470} w={480} flip phase={1} />}
        {f < RIDE && <Char id="temujin_child" x={1040} h={480} bottom={130} flip pose={f >= L61 ? "happy" : "front"} enter="none" beat={f >= L61 + 30 ? "nod" : "none"} beatAt={L61 + 34} />}
        <ShadowMan x={1360} h={560} bottom={110} pose="front" flip gesture={f < L61 ? "open" : f >= L61 && f < L61 + 50 ? "point" : undefined} gestureAt={f < L61 ? 10 : L61} beat={f >= L61 + 50 ? "shake" : "none"} beatAt={L61 + 52} />
      </Cam>
      <Dim op={0.2} />
      {f >= RIDE && <SFX name="hooves" at={RIDE} vol={0.25} dur={frames - RIDE} />}
    </AbsoluteFill>
  );
};

// T) c1_62~64 - 교훈 2: 새벽, 언덕을 넘는 테무친을 천막 앞에서 지켜보는 남자와 아들들(실루엣) → c1_63 (7판 S15) 청년 테무친 곁으로 옷차림이 제각각인 사람들
//    → c1_64 나무 칼을 불태운 아들의 실루엣이 금빛 장수 넷 가운데 하나가 됨
const ST: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L63 = at("c1_63");
  const L64 = at("c1_64");
  if (f < L63) {
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, L63, 1.0, 1.08)} cx={960} cy={560}>
          <Steppe time="dusk" horizon={640} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M 900 660 C 1200 560 1600 540 1960 600 L 1960 700 L 900 700 Z" fill="#8d8656" stroke={INK} strokeWidth={5} />
          </svg>
          <Rider kind="temujin" x={lerp(f, 0, L63, 1300, 1700)} y={480} w={lerp(f, 0, L63, 220, 150)} phase={2} dark />
          <Ger x={420} y={760} w={360} door="#5a3a2a" lit={0.5} />
          <ShadowMan x={300} h={520} bottom={110} pose="side" />
          <ShadowMan x={600} h={420} bottom={110} pose="side" />
          <ShadowMan x={760} h={400} bottom={110} pose="side" />
        </Cam>
        <AbsoluteFill style={{ background: "#000", opacity: lerp(f, L63 - 10, L63, 0, 0.6) }} />
      </AbsoluteFill>
    );
  }
  if (f < L64) {
    const g = f - L63;
    const ASK = P(at, "c1_63", 0.35) - L63;
    const TRUST = P(at, "c1_63", 0.7) - L63;
    const pull = lerp(g, 0, 80, 1.2, 1, true);
    const folks = [[300, 2], [520, 5], [1400, 3], [1620, 0]];
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${pull})`, transformOrigin: "50% 60%" }}>
          <Steppe time="dusk" horizon={640} />
          <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(255,214,150,0.3), rgba(0,0,0,0) 45%)" }} />
          {folks.map(([x, ki], i) => {
            const t = lerp(g, ASK + i * 8, ASK + i * 8 + 16, 0, 1, true);
            const k = FOLK[ki];
            return t > 0 ? (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: t, transform: `translateY(${(1 - t) * 50}px)` }}>
                <Folk x={x} y={930} k={{ ...k, sc: k.sc * 1.05 }} walk={0} lookBack={x > 960} />
              </div>
            ) : null;
          })}
          <div style={{ opacity: lerp(g, 12, 34, 1, 0) }}>
            <Char id="temujin_child" x={960} h={480} bottom={120} pose="sad" enter="none" beat="none" />
          </div>
          {g >= 14 && <Char id="temujin_young" x={960} h={880} bottom={40} pose="front" enter="up" delay={L63 + 14} beat={g >= TRUST ? "nod" : "none"} beatAt={L63 + TRUST + 6} gesture={g >= TRUST ? "open" : undefined} gestureAt={L63 + TRUST} />}
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "#000", opacity: lerp(g, L64 - L63 - 10, L64 - L63, 0, 0.5) }} />
      </AbsoluteFill>
    );
  }
  const g = f - L64;
  const GOLD = P(at, "c1_64", 0.5) - L64;
  const gold = lerp(g, GOLD, GOLD + 30, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(g, 0, frames - L64, 1.1, 1.0)} cx={960} cy={560}>
        <Steppe time="dusk" horizon={720} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(255,214,140,${0.5 * gold}), rgba(0,0,0,0) 70%)` }} />
        <div style={{ position: "absolute", inset: 0, opacity: 1 - gold }}>
          <ShadowMan x={960} h={480} bottom={160} pose="front" />
        </div>
        {[300, 700, 1220, 1620].map((x, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, opacity: gold, filter: i === 2 ? "sepia(1) saturate(2.4) brightness(1.1)" : "brightness(0.35)" }}>
            <Rider kind="mongol_white" x={x - 200} y={i === 2 ? 380 : 430} w={i === 2 ? 460 : 380} still />
          </div>
        ))}
      </Cam>
      <AbsoluteFill style={{ background: "#d8b070", opacity: 0.12, mixBlendMode: "multiply" }} />
      <SFX name="war_horn" at={L64 + GOLD} vol={0.25} />
    </AbsoluteFill>
  );
};

// U) c1_65~66 - 끝: 새벽 언덕 위, 활과 화살 두 대만 멘 소년이 말 위에서 초원을 봄(실루엣) → c1_66 초원 지도, 오논강의 작은 흰 툭 하나
//    → "그의 신부 보르테가 사라집니다"에서 보르테네 깃발(옹기라트)이 쓰러지고 북쪽 메르키트 검은 깃발이 크게 솟음 → 어둠 (2장으로)
const SU: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const MAP = at("c1_66");
  const GONE = P(at, "c1_66", 0.7);
  if (f < MAP) {
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, MAP, 1.25, 1.0, true)} cx={960} cy={480}>
          <Steppe time="dusk" horizon={700} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M 460 760 C 700 590 1220 590 1460 760 L 1460 1100 L 460 1100 Z" fill="#7a8a4a" stroke={INK} strokeWidth={6} />
          </svg>
          <Rider kind="temujin" x={800} y={360} w={340} still dark />
        </Cam>
        <Dim op={lerp(f, MAP - 8, MAP, 0, 1)} />
      </AbsoluteFill>
    );
  }
  const g = f - MAP;
  const rise = lerp(f, GONE, GONE + 24, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(g, 0, frames - MAP, 1.6, 1.15, true)} cx={lerp(g, 0, frames - MAP, HOME_P[0], 960)} cy={lerp(g, 0, frames - MAP, HOME_P[1] - 40, 380)}>
        <SteppeMap f={f} raids={0} dim={0.3 + rise * 0.3} />
        {rise > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
            <BannerG x={1252} y={492} kind={4} h={140} fall={rise} t={f} />
            <g opacity={rise}>
              <BannerG x={787} y={262} kind={3} h={110 + rise * 150} t={f} />
            </g>
          </svg>
        )}
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 30, frames, 0, 1) }} />
      <SFX name="drum" at={MAP} vol={0.3} />
      {f >= GONE && <SFX name="drum" at={GONE} vol={0.4} />}
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: ["c1_01", "c1_02"], Shot: SA },
  { ids: ["c1_03"], Shot: SB },
  { ids: ["c1_04", "c1_05", "c1_06", "c1_07", "c1_08", "c1_09"], Shot: SC },
  { ids: ["c1_10", "c1_11", "c1_12", "c1_13", "c1_14"], Shot: SD },
  { ids: ["c1_15", "c1_16", "c1_17", "c1_18"], Shot: SE },
  { ids: ["c1_19", "c1_20"], Shot: SF },
  { ids: ["c1_21", "c1_22", "c1_23", "c1_24", "c1_25"], Shot: SG },
  { ids: ["c1_26", "c1_27", "c1_28"], Shot: SH },
  { ids: ["c1_29", "c1_30"], Shot: SI },
  { ids: ["c1_31", "c1_32"], Shot: SJ },
  { ids: ["c1_33", "c1_34", "c1_35"], Shot: SK },
  { ids: ["c1_36", "c1_37", "c1_38", "c1_39", "c1_40", "c1_41", "c1_42", "c1_43"], Shot: SL },
  { ids: ["c1_44"], Shot: SM },
  { ids: ["c1_45"], Shot: SN },
  { ids: ["c1_46", "c1_47", "c1_48", "c1_49"], Shot: SO },
  { ids: ["c1_50", "c1_51", "c1_52"], Shot: SP },
  { ids: ["c1_53", "c1_54", "c1_55"], Shot: SQ },
  { ids: ["c1_56", "c1_57", "c1_58", "c1_59"], Shot: SR },
  { ids: ["c1_60", "c1_61"], Shot: SS },
  { ids: ["c1_62", "c1_63", "c1_64"], Shot: ST },
  { ids: ["c1_65", "c1_66"], Shot: SU },
];
// lang을 주면 그 언어 목소리로 (render-checked.py --lang=ko 한국어 검수판). 없으면 위(M01Draft)의 LangContext를 따름
export const M01Ch1 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="1" year="1162" groups={groups} music="lament" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
