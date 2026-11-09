// 몽골 2편 4장 "싸우기 전에 이기기" 1판 (2026-11-02) - 대본 episodes/mongol-02/script-ko.md "## 4." (c4_01~c4_05, kit에서는 m2.c4_01…)
// 사용자: 파르완·펠트 인형 뺌 / "배경이나 인물 너무 단순하게 그리고 있어, 디테일 챙겨"
// 주인공 물건: 사방으로 달려가는 전령 · 열린 도시와 불탄 도시 · 그을린 생존자와 그 말을 듣는 사람들의 얼굴 · 지도 위로 퍼지는 소문
// 기법(10-연출-기법): 한 판 이어 보기(긴 풍경을 카메라가 가로지름) · 가까이 얼굴 교차 · 소문 물결 · 위아래 시간 대비
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chapter, clamp, ease, Fire, FPS, Ger, Glow, Group, INK, Lang, LangContext, Rider, SFX, ShotProps, Stars, Tug, tl } from "./kit";
import { Cam, Dust, Horse, MON, Person, RiderOn, Smoke, Spear } from "./M01Ch4";
import { KH_CITIES, KhFlag, MapCam, Spearman } from "./M01Ch5";
import { City, SAND, SAND_D, SAND_DD } from "./M02City";
import { MapShot, MAP_C, MoG, rnd } from "./M02Ch1";
import { CIV, Trebuchet } from "./M02Ch3";

const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
const sec = (s: number) => Math.round(s * FPS);
const id = (n: number) => `m2.c4_${String(n).padStart(2, "0")}`;

// ================= 디테일 소품 =================
// 구름 (겹친 둥근 덩어리 + 아래 그림자)
const Cloud = ({ x, y, s = 1, op = 0.9, warm = false }: { x: number; y: number; s?: number; op?: number; warm?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M -150 20 C -170 -20 -110 -50 -80 -30 C -70 -80 10 -90 30 -40 C 60 -70 130 -50 120 0 C 170 0 170 40 130 44 L -140 44 C -180 44 -180 20 -150 20 Z" fill={warm ? "#f6dcc0" : "#f8f2e4"} stroke={INK} strokeWidth={4} />
    <path d="M -130 40 C -60 30 40 30 120 38" stroke={warm ? "#e0b48a" : "#d8d0bc"} strokeWidth={8} fill="none" />
  </g>
);
// 흰 전령 깃발 (손에 든 긴 깃대)
const Pennant = ({ x, y, h = 220, f }: { x: number; y: number; h?: number; f: number }) => {
  const w = Math.sin(f / 4 + x * 0.01) * 10;
  return (
    <svg width={160} height={h + 20} viewBox={`-20 -${h} 160 ${h + 20}`} style={{ position: "absolute", left: x - 20, top: y - h, ...ink }}>
      <path d={`M 0 0 L 0 -${h}`} stroke={INK} strokeWidth={7} />
      <path d={`M 0 0 L 0 -${h}`} stroke="#7a5230" strokeWidth={3} />
      <path d={`M 2 -${h - 4} C 40 ${-h + 4 + w} 80 ${-h - 4 - w} 120 ${-h + 10 + w} L 100 ${-h + 30} C 70 ${-h + 40 - w} 40 ${-h + 28 + w} 2 ${-h + 42} Z`} fill="#f4efe2" stroke={INK} strokeWidth={4} />
    </svg>
  );
};
// 시장 좌판: 차양 + 과일·천 바구니
const Stall = ({ x, y, c, k }: { x: number; y: number; c: string; k: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -90 0 L -90 -120 M 90 0 L 90 -120" stroke="#6b4f2e" strokeWidth={8} />
    <path d="M -110 -120 L 110 -120 L 96 -160 L -96 -160 Z" fill={c} stroke={INK} strokeWidth={5} />
    {[-70, -30, 10, 50, 90].map((dx) => <path key={dx} d={`M ${dx} -160 L ${dx + 6} -120`} stroke="#f4efe2" strokeWidth={8} />)}
    <rect x={-96} y={-56} width={192} height={56} fill="#8a6440" stroke={INK} strokeWidth={5} />
    {k % 3 === 0 && [-60, -20, 20, 60].map((dx) => <g key={dx}><ellipse cx={dx} cy={-62} rx={18} ry={12} fill="#a8895a" stroke={INK} strokeWidth={3} />{[-6, 0, 6].map((d) => <circle key={d} cx={dx + d} cy={-70} r={6} fill={["#c0392b", "#e0a030", "#8a9a3a"][(dx + d + 90) % 3]} stroke={INK} strokeWidth={2} />)}</g>)}
    {k % 3 === 1 && [-60, -10, 40].map((dx, i) => <rect key={dx} x={dx - 20} y={-90} width={44} height={34} fill={["#a8332a", "#4d6b8a", "#c9a24a"][i]} stroke={INK} strokeWidth={3} />)}
    {k % 3 === 2 && [-50, 0, 50].map((dx) => <path key={dx} d={`M ${dx - 18} -56 C ${dx - 22} -90 ${dx + 22} -90 ${dx + 18} -56 Z`} fill="#c97a4a" stroke={INK} strokeWidth={3} />)}
  </g>
);
// 무너진 성벽 조각 + 잿더미 + 불씨
const Ruin = ({ x, y, f }: { x: number; y: number; f: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -200 0 L -200 -140 L -150 -150 L -120 -90 L -60 -170 L -20 -110 L 30 -150 L 80 -60 L 140 -120 L 200 -80 L 200 0 Z" fill="#7a6650" stroke={INK} strokeWidth={6} />
    {[[-150, -40], [-60, -70], [40, -40], [120, -50]].map(([dx, dy], i) => <path key={i} d={`M ${dx} ${dy} l 30 -10 l 10 20 l -30 10 Z`} fill="#3a2e22" />)}
    {Array.from({ length: 10 }).map((_, i) => { const t = ((f + i * 7) % 40) / 40; return <circle key={i} cx={-160 + i * 36 + Math.sin(t * 6 + i) * 10} cy={-20 - t * 160} r={4 - t * 2} fill="#ffb04a" opacity={1 - t} />; })}
  </g>
);

// ================= 가까이 본 얼굴 (공들인 판 400×560, 상반신) =================
// expr: terror(그을린 생존자 - 크게 뜬 눈·벌린 입·떨림) · shock(듣는 사람 - 굳은 얼굴·땀) · cover(입을 손으로 가림)
type Bust = { hat: "turban" | "scarf" | "helm"; beard?: boolean; robe: string; expr: "terror" | "shock" | "cover"; soot?: boolean; point?: boolean };
const BustClose = ({ x, y, h, f, b, flip = false }: { x: number; y: number; h: number; f: number; b: Bust; flip?: boolean }) => {
  const s = h / 560;
  const shake = b.expr === "terror" ? Math.sin(f * 0.8) * 3 : 0;
  const talk = b.expr === "terror" ? 18 + Math.abs(Math.sin(f / 3)) * 16 : 0;
  const skin = "#d9a77a";
  return (
    <svg width={400 * s} height={560 * s} viewBox="0 0 400 560" style={{ position: "absolute", left: x - 200 * s + shake, top: y - 560 * s, transform: flip ? "scaleX(-1)" : undefined, ...ink }}>
      {/* 몸 · 옷 주름 · 찢어진 소매 */}
      <path d="M 60 560 C 60 420 100 360 200 352 C 300 360 340 420 340 560 Z" fill={b.robe} stroke={INK} strokeWidth={6} />
      <path d="M 200 360 L 200 560 M 140 380 C 130 450 130 500 140 560 M 260 380 C 270 450 270 500 260 560" stroke="rgba(0,0,0,.18)" strokeWidth={6} fill="none" />
      <path d="M 150 360 C 170 384 230 384 250 360" stroke="#c9a24a" strokeWidth={8} fill="none" />
      {b.soot && <path d="M 300 470 l 18 30 l -14 12 l 20 28" stroke={INK} strokeWidth={4} fill="none" />}
      {/* 가리킴 (뒤쪽 = 온 길) */}
      {b.point && (
        <g>
          <path d="M 300 400 Q 360 330 380 250" stroke={INK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M 300 400 Q 360 330 380 250" stroke={b.robe} strokeWidth={34} strokeLinecap="round" fill="none" />
          <ellipse cx={384} cy={238} rx={24} ry={28} fill={skin} stroke={INK} strokeWidth={5} />
          <path d="M 390 214 L 404 160" stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d="M 390 214 L 404 160" stroke={skin} strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
      {/* 얼굴 */}
      <rect x={172} y={300} width={56} height={60} fill={skin} stroke={INK} strokeWidth={5} />
      <ellipse cx={200} cy={230} rx={92} ry={102} fill={skin} stroke={INK} strokeWidth={6} />
      <ellipse cx={140} cy={262} rx={16} ry={9} fill="#e08a78" opacity={0.35} />
      <ellipse cx={260} cy={262} rx={16} ry={9} fill="#e08a78" opacity={0.35} />
      {b.beard && <path d="M 116 252 C 124 330 168 350 200 352 C 232 350 276 330 284 252 C 262 288 232 296 200 296 C 168 296 138 288 116 252 Z" fill="#3a2a20" stroke={INK} strokeWidth={4} />}
      {/* 눈썹: 놀라 치켜 올라감 */}
      <path d={b.expr === "shock" ? "M 132 168 L 180 158 M 268 168 L 220 158" : "M 132 176 L 182 152 M 268 176 L 218 152"} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      {/* 눈: 흰자가 보이게 크게 뜸, 작은 눈동자 */}
      {[160, 240].map((ex, k) => (
        <g key={k}>
          <ellipse cx={ex} cy={204} rx={24} ry={b.expr === "shock" ? 22 : 28} fill="#fbf6ea" stroke={INK} strokeWidth={5} />
          <circle cx={ex + (b.point ? 6 : 0) + shake * 0.5} cy={206} r={b.expr === "terror" ? 7 : 9} fill={INK} />
          <path d={`M ${ex - 22} ${236} Q ${ex} ${246} ${ex + 22} ${236}`} stroke="rgba(60,30,20,.35)" strokeWidth={4} fill="none" />
        </g>
      ))}
      {/* 입 */}
      {b.expr === "terror" && <path d={`M 172 ${284 - talk * 0.15} Q 200 ${272 - talk * 0.2} 228 ${284 - talk * 0.15} Q 222 ${292 + talk} 200 ${294 + talk} Q 178 ${292 + talk} 172 ${284 - talk * 0.15} Z`} fill="#4a1e18" stroke={INK} strokeWidth={5} />}
      {b.expr === "shock" && <path d="M 178 292 Q 200 282 222 292" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />}
      {/* 그을음 · 상처 */}
      {b.soot && <g opacity={0.55}><ellipse cx={128} cy={240} rx={30} ry={18} fill="#3a2e28" /><ellipse cx={262} cy={176} rx={26} ry={12} fill="#3a2e28" /><ellipse cx={210} cy={318} rx={22} ry={10} fill="#3a2e28" /></g>}
      {b.soot && <path d="M 248 140 l 20 22" stroke="#a8332a" strokeWidth={5} />}
      {/* 땀 */}
      {b.expr !== "terror" && [0, 1].map((k) => { const t = ((f + k * 13) % 30) / 30; return <path key={k} d={`M ${120 + k * 168} ${180 + t * 50} q -7 12 0 20 q 7 -8 0 -20`} fill="#9cc3dc" opacity={1 - t} />; })}
      {/* 입을 가린 손 */}
      {b.expr === "cover" && (
        <g>
          <path d="M 120 470 Q 110 360 176 300" stroke={INK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M 120 470 Q 110 360 176 300" stroke={b.robe} strokeWidth={34} strokeLinecap="round" fill="none" />
          <path d="M 156 316 C 150 284 160 262 176 258 L 230 254 C 244 254 246 266 236 270 L 214 272 C 238 272 240 286 226 288 C 240 290 238 304 224 304 C 234 308 230 320 216 320 Z" fill={skin} stroke={INK} strokeWidth={5} />
        </g>
      )}
      {/* 머리 */}
      {b.hat === "turban" && <g><path d="M 104 206 C 94 106 306 106 296 206 C 252 188 148 188 104 206 Z" fill="#f2ece0" stroke={INK} strokeWidth={6} /><path d="M 116 174 C 160 156 240 156 284 174 M 128 148 C 168 134 232 134 272 148" stroke="#cfc6b2" strokeWidth={6} fill="none" />{b.soot && <ellipse cx={150} cy={170} rx={34} ry={12} fill="#5a4a40" opacity={0.5} />}</g>}
      {b.hat === "scarf" && <g><path d="M 92 260 C 70 90 330 90 308 260 C 314 330 292 366 262 378 L 262 316 C 286 270 282 168 200 150 C 118 168 114 270 138 316 L 138 378 C 108 366 86 330 92 260 Z" fill="#8a4a5a" stroke={INK} strokeWidth={6} /><path d="M 112 210 C 120 170 140 150 162 142 M 288 210 C 280 170 260 150 238 142" stroke="#a8667a" strokeWidth={6} fill="none" /><path d="M 138 378 C 170 396 230 396 262 378" stroke="#6a3444" strokeWidth={10} fill="none" /></g>}
      {b.hat === "helm" && <g><path d="M 104 176 C 100 90 150 62 200 60 C 250 62 300 90 296 176 C 260 156 140 156 104 176 Z" fill="#7a7e80" stroke={INK} strokeWidth={6} /><path d="M 100 178 C 150 156 250 156 300 178 L 300 202 C 250 182 150 182 100 202 Z" fill="#efe9dc" stroke={INK} strokeWidth={5} /><path d="M 186 62 L 200 16 L 214 62 Z" fill="#7a7e80" stroke={INK} strokeWidth={5} /></g>}
    </svg>
  );
};

// ================= 1) c4_01 새벽 몽골 진영: 전령들이 흰 깃발을 들고 사방으로 =================
const S1: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const go = (i: number) => k01((f - 20 - i * 6) / 80);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.06, 1.0)} cx={960} cy={560}>
        <AbsoluteFill style={{ background: "linear-gradient(#e8b890, #f2d8b0 30%, #f4e8cc 52%, #a8b878 52%, #8aa05a)" }} />
        <div style={{ position: "absolute", left: 1380, top: 420, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(#fff2c8, #f6c062 50%, transparent 70%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {[[300, 160, 1.2], [900, 110, 0.9], [1500, 180, 1.1], [1150, 260, 0.7]].map(([x, y, sc], i) => <Cloud key={i} x={x + f * 0.4} y={y} s={sc} warm />)}
          <path d="M -40 562 C 300 520 600 546 900 520 C 1200 500 1500 540 1960 520 L 1960 600 L -40 600 Z" fill="#9aab68" opacity={0.7} />
          {/* 풀 포기 */}
          {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${rnd(i, 51) * 1920} ${620 + rnd(i, 52) * 440} l -6 -14 m 6 14 l 0 -18 m 0 18 l 6 -14`} stroke="#6a7a3a" strokeWidth={3} fill="none" />)}
        </svg>
        {/* 뒤: 게르 줄 (지붕에서 연기) + 툭 + 풀 뜯는 말 떼 */}
        {Array.from({ length: 9 }).map((_, i) => <Ger key={i} x={100 + i * 215} y={560 + (i % 2) * 18} w={150 + (i % 3) * 20} door={["#8a3b2c", "#4d6b8a", "#4f6b5a"][i % 3]} />)}
        {[200, 640, 1080, 1520].map((x, i) => <Smoke key={x} x={x} y={470} f={f + i * 20} n={2} s={0.35} />)}
        {[340, 980, 1640].map((x, i) => <Tug key={x} x={x} y={600} h={300} sway={Math.sin((f + i * 9) / 11) * 5} />)}
        {Array.from({ length: 5 }).map((_, i) => <Horse key={`h${i}`} x={160 + i * 130} y={720 + (i % 2) * 20} w={150} run={false} graze={0.8} saddle={null} coat={["#8a6440", "#c9b48a", "#5a4a3e", "#b88a52", "#e8e0cc"][i]} phase={i * 7} />)}
        {/* 전령: 진영 가운데서 사방으로 (흰 깃발) */}
        {[[-1, -0.2], [1, -0.25], [-1, 0.35], [1, 0.3], [0.2, 1], [-0.3, 1]].map(([dx, dy], i) => {
          const u = go(i);
          const x = 960 + dx * u * 1300, y = 820 + dy * u * 300;
          const w = 210 + dy * u * 120;
          return (
            <React.Fragment key={i}>
              <Dust x={x + (dx < 0 ? w * 0.8 : 0)} y={y + w * 0.6} t={((f + i * 5) % 20) / 20} r={50} color="#c9b48a" />
              <Rider kind={i % 2 ? "mongol" : "mongol2"} x={x - w / 2} y={y - w * 0.4} w={w} flip={dx < 0} phase={i * 3} />
              <Pennant x={x + (dx < 0 ? w * 0.3 : -w * 0.1)} y={y} h={180} f={f + i * 5} />
            </React.Fragment>
          );
        })}
        <Horse x={980} y={980} w={420} run={false} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a"><RiderOn L={MON} arms="point" eyes="dot" mouth="o" t={f} /></Horse>
      </Cam>
      <SFX name="wind" at={0} vol={0.25} dur={frames} fade={8} />
      <SFX name="war_horn" at={10} vol={0.3} dur={60} fade={10} />
      <SFX name="cavalry" at={20} vol={0.3} dur={frames - 20} fade={20} />
    </AbsoluteFill>
  );
};

// ================= 2) c4_02 2판 (2026-11-02 사용자: "멀쩡한 왕국을 더 오래, 연 곳은 몽골군이 그 문으로 들어가고, 안 연 곳은 공격해 성을 무너뜨리고 안에 있는 사람들을 무참히 죽이는 장면") =================
// 한 판 이어 보기: 열린 도시에 기병이 조용히 들어감(시장은 그대로, 약 3.5초) → 빠르게 들판을 건너 → 버틴 도시: 돌이 날아와 성벽이 무너지고 기병이 쏟아져 들어감,
// 불빛에 성벽에 비친 그림자로 칼을 휘두르고 사람들이 쓰러짐(피 없이) → 불길·연기
const PANO = 4200;
const BX = 2280; // 버틴 도시 판 왼쪽
const Sil = ({ x, y, s, kind, t }: { x: number; y: number; s: number; kind: "slay" | "fall" | "flee" | "loot"; t: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#1a0e08" opacity={0.75}>
    {kind === "slay" && <g><circle cx={0} cy={-150} r={18} /><path d="M -22 -130 L 22 -130 L 26 -40 L 30 0 L 12 0 L 0 -40 L -12 0 L -30 0 L -26 -40 Z" /><g transform={`rotate(${-40 + Math.sin(t / 3) * 70} 18 -122)`}><path d="M 18 -122 L 50 -190" stroke="#1a0e08" strokeWidth={12} strokeLinecap="round" /><path d="M 46 -186 C 70 -230 90 -260 120 -280 C 96 -250 80 -220 56 -180 Z" /></g></g>}
    {kind === "fall" && <g transform={`rotate(${Math.min(80, t * 6)} 0 0)`}><circle cx={0} cy={-140} r={17} /><path d="M -20 -122 L 20 -122 L 24 -30 L 10 0 L -10 0 L -24 -30 Z" /><path d="M -20 -110 L -60 -150 M 20 -110 L 56 -146" stroke="#1a0e08" strokeWidth={10} strokeLinecap="round" /></g>}
    {kind === "loot" && <g transform={`translate(${t * 3} 0)`}><circle cx={0} cy={-140} r={17} /><path d="M -20 -122 L 20 -122 L 30 -40 L 40 0 L 22 0 L 6 -40 L -16 0 L -34 0 L -20 -40 Z" /><path d="M 4 -150 C 30 -200 90 -190 84 -140 C 80 -110 30 -110 8 -124 Z" /><path d="M 30 -196 l 8 -18 l 12 16" stroke="#1a0e08" strokeWidth={6} fill="none" /></g>}
    {kind === "flee" && <g transform={`translate(${-t * 4} 0)`}><circle cx={0} cy={-140} r={17} /><path d="M -20 -122 L 20 -122 L 30 -40 L 40 0 L 22 0 L 6 -40 L -16 0 L -34 0 L -20 -40 Z" /><path d="M -18 -112 L -50 -80 M 18 -112 L 40 -150" stroke="#1a0e08" strokeWidth={10} strokeLinecap="round" /></g>}
  </g>
);
const S2: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  // 3판 (2026-11-03 사용자 A안 협박 대사): c4_02.wav 조각에 맞춤 - "하지만 맞선다면" 9.05초에 건너감 → "성벽을 부수고 들어가" 무너짐
  // → "재물을 모조리 빼앗고" 자루 멘 그림자 → "모두 베어 버린 뒤" 칼 그림자·쓰러짐 → "불바다로" 불길
  const A_E = tl(id(2), 9.0), X_E = tl(id(2), 10.3); // 열린 도시 · 건너가기
  const camX = f < A_E ? lerp(f, 0, A_E, 900, 1500) : f < X_E ? lerp(f, A_E, X_E, 1500, BX + 960, true) : BX + 960;
  const z = f < X_E ? 1 : lerp(f, X_E, frames, 1, 1.08);
  const b = f - X_E; // 버틴 도시 쪽 시간
  const HITS = [6, 22, 38];
  const breach = lerp(b, 44, 70, 0, 1);
  const LOOT = tl(id(2), 12.7) - X_E, SLAY = tl(id(2), 15.1) - X_E, FIRE = tl(id(2), 18.7) - X_E; // 건너간 뒤 (b 기준) - 한국어 조각 "재물을" 12.7 · "칼을 든 자도" 15.1 · "불바다로" 18.7초
  const loot = lerp(b, LOOT, LOOT + 12, 0, 1), slay = lerp(b, SLAY, SLAY + 12, 0, 1);
  const burn = lerp(b, FIRE, FIRE + 40, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#e9dcbc" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: PANO, height: 1080, transform: `translateX(${960 - camX * z}px) scale(${z})`, transformOrigin: "0 50%" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, #dfe6e2 0%, #e6dcc4 45%, ${burn > 0 ? "#b07a5a" : "#e6dcc4"} 70%, ${burn > 0 ? "#6a4a40" : "#dfe0d4"} 100%)` }} />
        <svg width={PANO} height={1080} style={{ position: "absolute", ...ink }}>
          {[[300, 130, 1], [900, 90, 0.8], [1500, 150, 1.1]].map(([x, y, sc], i) => <Cloud key={i} x={x + f * 0.3} y={y} s={sc} />)}
          <path d={`M -40 300 L 300 220 L 700 280 L 1100 200 L 1500 270 L 1900 210 L 2300 280 L 2700 220 L 3100 290 L 3500 230 L 3900 280 L ${PANO + 40} 240 L ${PANO + 40} 560 L -40 560 Z`} fill="#c9b48e" stroke={INK} strokeWidth={4} opacity={0.7} />
          <rect x={-40} y={766} width={PANO + 80} height={340} fill="#c9ad74" />
          <defs><linearGradient id="ash2" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#5a4636" stopOpacity={0} /><stop offset="0.18" stopColor="#5a4636" stopOpacity={1} /></linearGradient></defs>
          <rect x={1980} y={766} width={PANO - 1980 + 40} height={340} fill="url(#ash2)" opacity={burn} />
          {[[160, 900], [1820, 880], [2050, 860]].map(([x, y], k) => <g key={k} transform={`translate(${x} ${y})`}><path d="M 0 0 C -6 -120 6 -240 -4 -330" stroke={INK} strokeWidth={20} fill="none" /><path d="M 0 0 C -6 -120 6 -240 -4 -330" stroke="#7a5a38" strokeWidth={12} fill="none" />{[-150, -110, -60, -20, 30, 70, 120].map((a, jj) => <path key={jj} d={`M -4 -330 q ${Math.cos((a * Math.PI) / 180) * 60} ${-30 + Math.sin((a * Math.PI) / 180) * 30} ${Math.cos((a * Math.PI) / 180) * 120} ${Math.abs(Math.sin((a * Math.PI) / 180)) * 50 - 10}`} stroke="#5e7a3a" strokeWidth={12} fill="none" strokeLinecap="round" />)}</g>)}
        </svg>
        {/* ── 열린 도시 ── */}
        <div style={{ position: "absolute", left: 0, top: -40, width: 1920, height: 1080 }}><City f={f} bare /></div>
        <svg width={PANO} height={1080} style={{ position: "absolute", ...ink }}>
          <g transform="translate(1060 470)"><path d="M 0 0 L 0 -150" stroke={INK} strokeWidth={8} /><path d={`M 2 -150 C 40 ${-160 + Math.sin(f / 4) * 8} 80 ${-140 - Math.sin(f / 4) * 8} 100 -140 L 92 -112 C 60 -110 30 -120 2 -108 Z`} fill="#f4efe2" stroke={INK} strokeWidth={4} /></g>
          {/* 활짝 열린 성문 문짝 */}
          <path d="M 900 760 L 860 770 L 860 660 L 900 650 Z M 1020 760 L 1060 770 L 1060 660 L 1020 650 Z" fill="#7a5230" stroke={INK} strokeWidth={4} />
          {[[260, 1000, "#a8332a"], [620, 1010, "#4d6b8a"], [1380, 1000, "#c9a24a"], [1720, 1010, "#5e7a4a"]].map(([x, y, c], k) => <Stall key={k} x={x as number} y={y as number} c={c as string} k={k} />)}
        </svg>
        {/* 열린 문으로 조용히 들어가는 기병 줄 (멀어지며 작아짐) */}
        {Array.from({ length: 8 }).map((_, k) => {
          const u = k01((f - k * 10) / 90);
          if (u >= 1) return null;
          const w = 200 - u * 140, x = 1300 - u * 340, y = 940 - u * 200;
          return u > 0 ? <Rider key={`in${k}`} kind={k % 2 ? "mongol" : "mongol2"} x={x - w / 2} y={y - w * 0.7} w={w} flip phase={k * 3} /> : null;
        }).reverse()}
        {[[420, 1020, "point"], [500, 1030, "offer"], [820, 1040, "hold"], [1560, 1030, "offer"]].map(([x, y, arms], k) => <Person key={k} L={CIV[k % 5]} x={x as number} y={y as number} h={230} arms={arms as "point"} eyes="dot" mouth={k % 2 ? "smile" : "talk"} t={f + k * 5} step={f / 6} />)}
        {/* ── 버틴 도시 ── */}
        <div style={{ position: "absolute", left: BX, top: -40, width: 1920, height: 1080, WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 280px)", maskImage: "linear-gradient(90deg, transparent 0, #000 280px)" }}><City f={f} burn={burn} guards={burn < 0.3} bare /></div>
        <svg width={PANO} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 날아드는 돌 */}
          {HITS.map((h, k) => { const u = k01((b - h + 20) / 20); return u > 0 && u < 1 ? <circle key={k} cx={BX + 400 + u * 560} cy={300 - Math.sin(u * Math.PI) * 200 + u * 260} r={22} fill="#8a8478" stroke={INK} strokeWidth={5} /> : null; })}
          {/* 무너지는 성벽 덩어리 (성문 오른쪽) */}
          {Array.from({ length: 8 }).map((_, k) => {
            const gx = BX + 1080 + (k % 4) * 60, gy = 530 + Math.floor(k / 4) * 110;
            return <path key={k} d={`M ${gx} ${gy} l 58 0 l 0 104 l -58 0 Z`} fill={SAND_D} stroke={INK} strokeWidth={breach > 0 ? 5 : 0} transform={`translate(${breach * (k - 3.5) * 26} ${breach * breach * (220 + k * 30)}) rotate(${breach * (k % 2 ? 40 : -30)} ${gx + 29} ${gy + 52})`} opacity={1 - breach * 0.2} />;
          })}
          {breach > 0.05 && <path d={`M ${BX + 1080} 530 L ${BX + 1320} 530 L ${BX + 1320} 760 L ${BX + 1080} 760 Z`} fill="#2a1e16" opacity={breach} />}
          {/* 불빛에 비친 그림자: 칼을 휘두르는 몽골 병사, 쓰러지는 사람들 (피 없이) */}
          {loot > 0 && (
            <g opacity={loot * (1 - slay * 0.6)}>
              <Sil x={BX + 380} y={760} s={0.95} kind="loot" t={b - LOOT} />
              <Sil x={BX + 940} y={760} s={1} kind="loot" t={b - LOOT - 6} />
              <Sil x={BX + 1500} y={760} s={0.9} kind="loot" t={b - LOOT - 12} />
            </g>
          )}
          {slay > 0 && (
            <g opacity={slay}>
              <Sil x={BX + 600} y={760} s={1} kind="slay" t={b} />
              <Sil x={BX + 700} y={760} s={0.95} kind="fall" t={b - SLAY - 10} />
              <Sil x={BX + 820} y={760} s={0.9} kind="flee" t={b - SLAY - 10} />
              <Sil x={BX + 1460} y={760} s={1.05} kind="slay" t={b + 5} />
              <Sil x={BX + 1560} y={760} s={0.9} kind="fall" t={b - SLAY - 18} />
              <Sil x={BX + 1640} y={760} s={0.85} kind="fall" t={b - SLAY - 24} />
            </g>
          )}
        </svg>
        {/* 무너진 틈으로 쏟아져 들어가는 기병 */}
        {breach > 0.3 && Array.from({ length: 9 }).map((_, k) => {
          const u = k01((b - 56 - k * 4) / 40);
          const w = 240 - u * 120;
          return u > 0 && u < 1 ? <Rider key={`st${k}`} kind={k % 2 ? "mongol" : "mongol2"} x={BX + 900 + k * 40 + u * 260 - w / 2} y={980 - u * 260 - w * 0.7} w={w} phase={k * 3} /> : null;
        })}
        {HITS.map((h, k) => (b > h && b < h + 24 ? <Dust key={k} x={BX + 1150} y={600} t={(b - h) / 24} r={160} color="#c9b48a" /> : null))}
        {breach > 0 && <Dust x={BX + 1200} y={780} t={breach} r={280} color="#c9b48a" />}
        {burn > 0 && [BX + 300, BX + 820, BX + 1420].map((x, k) => <Fire key={x} x={x} y={900} s={0.8 * burn} />)}
        {burn > 0 && [BX + 220, BX + 720, BX + 1120, BX + 1620].map((x, k) => <Smoke key={x} x={x} y={500} f={f + k * 15} n={3} s={1.1 * burn} />)}
      </div>
      <SFX name="hooves" at={0} vol={0.18} dur={A_E} fade={20} />
      <SFX name="swords" at={X_E + SLAY} vol={0.3} dur={sec(3)} fade={10} />
      <SFX name="crowd" at={0} vol={0.15} dur={A_E} fade={20} />
      <SFX name="whoosh" at={A_E} vol={0.25} dur={30} />
      {HITS.map((h, k) => <SFX key={k} name="catapult_hit" at={X_E + h} vol={0.4} dur={30} />)}
      <SFX name="rumble" at={X_E + 44} vol={0.5} dur={50} />
      <SFX name="war_cry" at={X_E + 56} vol={0.35} dur={50} />
      <SFX name="crowd" at={X_E + 70} vol={0.4} dur={frames - X_E - 70} fade={10} />
      <SFX name="fire" at={X_E + FIRE} vol={0.35} dur={frames - X_E - FIRE} fade={20} />
    </AbsoluteFill>
  );
};

// ================= 3) c4_03 생존자를 일부러 풀어 줌 → 다음 도시 성문 앞에서 이야기, 듣는 얼굴이 굳음 =================
const SURV: Bust = { hat: "turban", beard: true, robe: "#6a5e50", expr: "terror", soot: true, point: true };
const S3: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const B = tl(id(3), 2.4), C = tl(id(3), 4.2);
  const xf = (t0: number) => lerp(f, t0 - 5, t0 + 5, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#2a2018" }}>
      {f < B + 5 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, B, 1.0, 1.08)} cx={900} cy={600}>
            <div style={{ position: "absolute", inset: 0, transform: "translate(-200px, -60px) scale(1.15)", transformOrigin: "50% 50%" }}><City f={f} burn={1} guards={false} /></div>
            <svg width={1920} height={1080} style={{ position: "absolute" }}><rect x={-40} y={860} width={2000} height={300} fill="#5a4636" /></svg>
            {/* 밧줄을 끊어 주는 몽골 병사 + 풀려나는 생존자 셋 */}
            <Person L={MON} x={1180} y={1030} h={360} arms="point" eyes="dot" mouth="o" flip />
            {[0, 1, 2].map((k) => {
              const free = f > 20 + k * 8;
              return (
                <React.Fragment key={k}>
                  <Person L={{ ...CIV[k], robe: "#6a5e50", dark: "#4e4438" }} x={620 + k * 150 - (free ? (f - 20 - k * 8) * 2 : 0)} y={1040} h={300} arms={free ? "down" : "offer"} eyes="wide" mouth="o" step={free ? f / 4 : 0} bob={free ? Math.abs(Math.sin(f / 4 + k)) * 6 : 0} />
                  {!free && <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}><path d={`M ${560 + k * 150} 900 L ${700 + k * 150} 905`} stroke="#7a5a32" strokeWidth={6} /></svg>}
                </React.Fragment>
              );
            })}
            <svg width={300} height={200} viewBox="-150 -100 300 200" style={{ position: "absolute", left: 1040, top: 760, ...ink }}><path d="M -40 20 L 60 -40" stroke="#c9cfd0" strokeWidth={10} strokeLinecap="round" /><path d="M -60 32 L -40 20" stroke="#5a3a24" strokeWidth={14} strokeLinecap="round" /></svg>
          </Cam>
        </AbsoluteFill>
      )}
      {f >= B && f < C + 5 && (
        // 다음 도시 성문 앞: 그을린 생존자가 뒤를 가리키며 이야기
        <AbsoluteFill style={{ opacity: xf(B) }}>
          <AbsoluteFill style={{ background: "linear-gradient(#cfd8d6, #e9dfc4 60%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M 1100 1080 L 1100 300 C 1100 140 1700 140 1700 300 L 1700 1080 Z" fill="#2e2018" stroke={INK} strokeWidth={8} />
            <path d="M 1000 1080 L 1000 0 L 1960 0 L 1960 1080 L 1800 1080 L 1800 300 C 1800 60 1000 60 1000 300 Z" fill={SAND_D} stroke={INK} strokeWidth={8} />
            {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M 1000 ${120 + i * 100} L 1100 ${120 + i * 100} M 1800 ${120 + i * 100} L 1960 ${120 + i * 100}`} stroke={SAND_DD} strokeWidth={4} />)}
          </svg>
          {/* 문 안쪽에 모여든 주민들 (멀리) */}
          {Array.from({ length: 6 }).map((_, k) => <Person key={k} L={CIV[k % 5]} x={1200 + k * 80} y={1000} h={260} arms={k % 2 ? "sleeves" : "down"} eyes="wide" mouth="o" t={f + k * 4} />)}
          <BustClose x={620} y={1120} h={1000} f={f} b={SURV} />
        </AbsoluteFill>
      )}
      {f >= C && (
        // 듣던 수비병·주민들의 얼굴이 굳음 (가까이 셋)
        <AbsoluteFill style={{ opacity: xf(C) }}>
          <AbsoluteFill style={{ background: "linear-gradient(#bfc8c6, #ddd2b8)" }} />
          <BustClose x={420} y={1120} h={880} f={f} b={{ hat: "helm", beard: true, robe: "#5a5e60", expr: "shock" }} />
          <BustClose x={1000} y={1150} h={940} f={f} b={{ hat: "scarf", robe: "#7a5a6a", expr: "cover" }} />
          <BustClose x={1560} y={1120} h={880} f={f + 7} b={{ hat: "turban", beard: true, robe: "#8a6a4a", expr: "shock" }} />
        </AbsoluteFill>
      )}
      <SFX name="wind" at={0} vol={0.25} dur={frames} fade={20} />
      <SFX name="crowd" at={B} vol={0.2} dur={frames - B} fade={20} />
      <SFX name="drum" at={C} vol={0.25} />
    </AbsoluteFill>
  );
};

// ================= 4) c4_04 지도: 불탄 도시에서 소문이 물결처럼 퍼지고, 몽골 화살표보다 먼저 성문이 열림 =================
const SRC = KH_CITIES[2]; // 부하라 (불탄 도시)
const TGT = [KH_CITIES[1], KH_CITIES[0], KH_CITIES[4], KH_CITIES[3], KH_CITIES[5]];
// 2판 끝 (2026-11-02 사용자: "성문을 여는 도시도 있다 할 때 성 정면에서 몽골군이 다가가니까 문이 자동으로 열리고 들어가는 장면")
export const GateOpen = ({ f, d }: { f: number; d: number }) => {
  const open = lerp(f, d * 0.35, d * 0.6, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, d, 1.25, 1.4)} cx={960} cy={640}>
        <City f={f} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 문 안쪽 빛 + 흰 깃발 든 주민 + 양쪽으로 열리는 문짝 */}
          <path d="M 900 800 L 900 690 C 900 630 1020 630 1020 690 L 1020 800 Z" fill="#f6dca0" opacity={open} />
          <g opacity={open}><path d="M 948 800 L 948 690" stroke={INK} strokeWidth={5} /><path d="M 950 690 l 40 6 l -6 16 l -34 2 Z" fill="#f4efe2" stroke={INK} strokeWidth={3} /></g>
          <g transform={`translate(900 0) scale(${1 - open * 0.8} 1)`}><path d="M 0 800 L 0 690 C 0 660 30 642 60 640 L 60 800 Z" fill="#7a5230" stroke={INK} strokeWidth={5} /><path d="M 20 690 L 20 800 M 40 660 L 40 800" stroke="#5a3a24" strokeWidth={4} /></g>
          <g transform={`translate(1020 0) scale(${-(1 - open * 0.8)} 1)`}><path d="M 0 800 L 0 690 C 0 660 30 642 60 640 L 60 800 Z" fill="#6a4628" stroke={INK} strokeWidth={5} /><path d="M 20 690 L 20 800 M 40 660 L 40 800" stroke="#5a3a24" strokeWidth={4} /></g>
          <g transform="translate(1060 470)" opacity={open}><path d="M 0 0 L 0 -150" stroke={INK} strokeWidth={8} /><path d={`M 2 -150 C 40 ${-160 + Math.sin(f / 4) * 8} 80 ${-140 - Math.sin(f / 4) * 8} 100 -140 L 92 -112 C 60 -110 30 -120 2 -108 Z`} fill="#f4efe2" stroke={INK} strokeWidth={4} /></g>
        </svg>
        {/* 다가가는 기병 (뒷모습 쪽, 아래에서 문으로) */}
        {Array.from({ length: 9 }).map((_, k) => {
          const u = k01((f - k * 5) / (d * 0.9));
          const w = 300 - u * 230;
          const x = 960 + ((k % 3) - 1) * 260 * (1 - u), y = 1180 - u * 400;
          return <Rider key={k} kind={k % 2 ? "mongol" : "mongol2"} x={x - w / 2} y={y - w * 0.7} w={w} phase={k * 3} />;
        }).reverse()}
      </Cam>
    </AbsoluteFill>
  );
};
const S4: React.FC<ShotProps> = (p) => {
  const f = useCurrentFrame();
  const a4 = p.at(id(4));
  const G0 = a4 + tl(id(4), 5.2);
  if (f >= G0) return <AbsoluteFill style={{ opacity: lerp(f, G0, G0 + 8, 0, 1) }}><GateOpen f={f - G0} d={p.frames - G0} /><SFX name="hooves" at={0} vol={0.25} dur={p.frames - G0} /><SFX name="gate" at={Math.round((p.frames - G0) * 0.35)} vol={0.4} dur={30} /></AbsoluteFill>;
  return <S4Map {...p} />;
};
const S4Map: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const z = lerp(f, 0, frames, 1.5, 1.35), cx = SRC[0] + 80, cy = SRC[1] - 30;
  const R = (t: number) => t * 1400; // 소문 반지름 (판 좌표)
  return (
    <AbsoluteFill>
      <MapShot f={f} st={{ split: 1, cut: 1 }} z={z} cx={cx} cy={cy} />
      <MapCam z={z} cx={cx} cy={cy}>
        <svg width={3200} height={1440} style={{ position: "absolute", left: 0, top: 0 }}>
          {/* 소문 물결 */}
          {[0, 1, 2, 3].map((k) => {
            const t = ((f / frames) * 1.2 - k * 0.12);
            if (t <= 0 || t > 1) return null;
            return <ellipse key={k} cx={SRC[0]} cy={SRC[1]} rx={R(t)} ry={R(t) * 0.7} fill="none" stroke="#c0392b" strokeWidth={10 - k * 2} opacity={0.6 * (1 - t)} strokeDasharray="30 18" />;
          })}
        </svg>
        <svg width={3200} height={1440} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
          {/* 불탄 도시 */}
          <circle cx={SRC[0]} cy={SRC[1] - 20} r={40} fill="#3a2e28" opacity={0.6} />
          {TGT.map((c, i) => {
            const d = Math.hypot((c[0] - SRC[0]) / 1, (c[1] - SRC[1]) / 0.7);
            const tRumor = d / 1400;
            const now = (f / frames) * 1.2;
            const reached = now > tRumor;
            // 피란민(작은 점들)이 길을 따라 앞서 달림
            const run = k01(now / tRumor);
            // 몽골 화살표는 훨씬 느림
            const mon = k01((now - 0.1) / (tRumor * 2.2));
            return (
              <g key={i}>
                <path d={`M ${SRC[0]} ${SRC[1]} L ${c[0]} ${c[1]}`} stroke="#b89a64" strokeWidth={6} strokeDasharray="4 10" opacity={0.6} />
                {[0, 1, 2].map((k) => { const u = k01(run - k * 0.06); return u > 0 && u < 1 ? <circle key={k} cx={SRC[0] + (c[0] - SRC[0]) * u} cy={SRC[1] + (c[1] - SRC[1]) * u} r={7} fill="#e0d2b0" stroke={INK} strokeWidth={3} /> : null; })}
                {mon > 0 && <MoG x={SRC[0] + (c[0] - SRC[0]) * mon * 0.9} y={SRC[1] + (c[1] - SRC[1]) * mon * 0.9} s={1.4} flip={c[0] < SRC[0]} />}
                {reached && (
                  <g transform={`translate(${c[0] + 30} ${c[1] - 20})`} opacity={k01((now - tRumor) * 8)}>
                    <path d="M 0 0 L 0 -90" stroke={INK} strokeWidth={6} />
                    <path d={`M 2 -90 C 24 ${-96 + Math.sin(f / 4 + i) * 6} 46 ${-84 - Math.sin(f / 4 + i) * 6} 60 -86 L 54 -64 C 34 -62 18 -70 2 -60 Z`} fill="#f4efe2" stroke={INK} strokeWidth={4} />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        {TGT.map((c, i) => {
          const d = Math.hypot(c[0] - SRC[0], (c[1] - SRC[1]) / 0.7);
          const on = k01(((f / frames) * 1.2 - d / 1400) * 6);
          return on > 0 ? <Glow key={i} x={c[0]} y={c[1] - 10} r={110} color="#fff2c8" op={0.6 * on} /> : null;
        })}
        <Smoke x={SRC[0]} y={SRC[1] - 60} f={f} n={3} s={0.5} />
      </MapCam>
      {TGT.map((c, i) => <SFX key={i} name="gate" at={Math.round(((Math.hypot(c[0] - SRC[0], (c[1] - SRC[1]) / 0.7) / 1400) / 1.2) * frames)} vol={0.15} dur={20} />)}
      <SFX name="wind" at={0} vol={0.25} dur={frames} fade={20} />
    </AbsoluteFill>
  );
};

// ================= 5) c4_05 위아래 시간 대비: 위 - 투석기 하나가 성벽 하나를 낮밤으로 계속 / 아래 - 지도 위 흰 깃발이 빠르게 줄줄이 =================
const S5: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const ALL = tl(id(5), 7.3);
  const DAY = 26;
  const ph = (f % DAY) / DAY;
  const d = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2);
  const swingA = 150 + 150 * ease(k01(((f % 30) - 6) / 14));
  const flags = Array.from({ length: 22 }).map((_, i) => ({ x: 160 + (i % 11) * 160 + (Math.floor(i / 11) % 2) * 80, y: 760 + Math.floor(i / 11) * 140, t: 10 + i * 6 }));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* 위 (2판, 2026-11-02 사용자 "성 부수는 것도 성의가 없어, 투석기 여러 개, 밑으론 몽골 기병, 성이 실제로 부서지게"):
          낮밤이 빠르게 도는 동안 투석기 셋이 번갈아 쏘고, 아래 기병이 성벽 앞을 오가며 화살, 맞을수록 성벽 덩어리가 떨어져 나감 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 520, overflow: "hidden" }}>
        <AbsoluteFill style={{ background: `linear-gradient(${d > 0.5 ? "#cfdbe0" : "#1a2438"}, ${d > 0.5 ? "#efe4c8" : "#2c3a52"})` }} />
        {d < 0.5 && <Stars />}
        <div style={{ position: "absolute", left: 200 + ph * 1500, top: 230 - Math.sin(ph * Math.PI) * 190, width: 80, height: 80, borderRadius: "50%", background: d > 0.5 ? "radial-gradient(#fff4c8, #f6c062 60%, transparent 72%)" : "#e6dfca" }} />
        <svg width={1920} height={520} style={{ position: "absolute", ...ink }}>
          <rect x={-20} y={440} width={1960} height={120} fill={d > 0.5 ? "#d6b97f" : "#4a4232"} />
          {/* 성벽 + 망루 */}
          <path d="M 1180 450 L 1180 150 L 1960 150 L 1960 450 Z" fill={SAND_D} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 13 }).map((_, i) => <rect key={i} x={1186 + i * 60} y={126} width={34} height={26} fill={SAND_D} stroke={INK} strokeWidth={4} />)}
          {[1240, 1700].map((x) => <g key={x}><rect x={x - 50} y={100} width={100} height={350} fill={SAND} stroke={INK} strokeWidth={6} />{[-30, 0, 30].map((dx) => <rect key={dx} x={x + dx - 10} y={80} width={20} height={22} fill={SAND} stroke={INK} strokeWidth={4} />)}</g>)}
          {Array.from({ length: 6 }).map((_, i) => <path key={`r${i}`} d={`M 1180 ${190 + i * 44} L 1960 ${190 + i * 44}`} stroke={SAND_DD} strokeWidth={3} opacity={0.6} />)}
          {/* 맞은 횟수만큼 떨어져 나가는 덩어리 */}
          {Array.from({ length: 12 }).map((_, k) => {
            const hitAt = 20 + k * 11;
            const u = k01((f - hitAt) / 18);
            const gx = 1330 + (k % 6) * 56, gy = 150 + Math.floor(k / 6) * 90;
            return <g key={`c${k}`}><path d={`M ${gx} ${gy} l 54 0 l 0 86 l -54 0 Z`} fill="#3a2e22" opacity={u > 0 ? 1 : 0} /><path d={`M ${gx} ${gy} l 54 0 l 0 86 l -54 0 Z`} fill={SAND_D} stroke={INK} strokeWidth={4} transform={`translate(${u * (k % 2 ? 30 : -20)} ${u * u * 330}) rotate(${u * (k % 2 ? 50 : -40)} ${gx + 27} ${gy + 43})`} opacity={1 - u * 0.3} /></g>;
          })}
          {/* 투석기 셋 (번갈아) */}
          {[0, 1, 2].map((k) => {
            const ph2 = ((f + k * 11) % 33) / 33;
            const a = 150 + 150 * ease(k01((ph2 - 0.15) / 0.4));
            return <g key={`t${k}`} transform={`translate(${200 + k * 300} ${300 - k * 10}) scale(${0.3 - k * 0.02})`}><Trebuchet a={a} crew={[]} stone={a < 260} /></g>;
          })}
          {/* 날아가는 돌 */}
          {[0, 1, 2].map((k) => { const u = k01((((f + k * 11) % 33) / 33 - 0.45) / 0.5); return u > 0 && u < 1 ? <circle key={`s${k}`} cx={300 + k * 300 + u * (1050 - k * 260)} cy={200 - Math.sin(u * Math.PI) * 150 + u * 40} r={14} fill="#8a8478" stroke={INK} strokeWidth={4} /> : null; })}
        </svg>
        {/* 성벽 앞을 오가며 활을 쏘는 기병 */}
        {Array.from({ length: 6 }).map((_, k) => {
          const x = 760 + ((k * 130 + f * 5) % 520);
          return <Rider key={`m${k}`} kind={k % 2 ? "mongol" : "mongol2"} x={x} y={380 + (k % 2) * 20} w={110} phase={k * 3} />;
        })}
        <svg width={1920} height={520} style={{ position: "absolute" }}>
          {Array.from({ length: 10 }).map((_, k) => { const t = ((f * 1.4 + k * 9) % 24) / 24; const x0 = 820 + k * 50; return <path key={k} d={`M ${x0 + t * 400} ${420 - t * 220} l 22 -12`} stroke={INK} strokeWidth={3} opacity={t < 0.9 ? 1 : 0} />; })}
        </svg>
        {Array.from({ length: 12 }).map((_, k) => { const hitAt = 20 + k * 11; return f > hitAt && f < hitAt + 20 ? <Dust key={`d${k}`} x={1357 + (k % 6) * 56} y={200 + Math.floor(k / 6) * 90} t={(f - hitAt) / 20} r={70} color="#c9b48a" /> : null; })}
        <AbsoluteFill style={{ background: "#0d1428", opacity: (1 - d) * 0.35 }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 516, width: 1920, height: 10, background: INK }} />
      {/* 아래: 지도 위 흰 깃발이 줄줄이 */}
      <div style={{ position: "absolute", left: 0, top: 526, width: 1920, height: 554, overflow: "hidden", background: "#e6d2a2" }}>
        <svg width={1920} height={554} style={{ position: "absolute", ...ink }}>
          <path d="M -20 300 C 300 260 600 320 900 280 C 1200 250 1500 320 1940 290" stroke="#6f93a8" strokeWidth={14} fill="none" />
          {flags.slice(0, -1).map((p, i) => <path key={`rd${i}`} d={`M ${p.x} ${p.y - 526} L ${flags[i + 1].x} ${flags[i + 1].y - 526}`} stroke="#b89a64" strokeWidth={4} strokeDasharray="6 10" opacity={i % 11 === 10 ? 0 : 0.7} />)}
          {[[120, 120], [520, 90], [980, 130], [1420, 100], [1820, 120], [300, 470], [1100, 480], [1700, 470]].map(([x, y], i) => <g key={`mt${i}`} transform={`translate(${x} ${y})`}><path d="M -50 30 L 0 -40 L 50 30 Z" fill="#a8977a" stroke={INK} strokeWidth={4} /><path d="M 0 -40 L -14 -20 L 14 -20 Z" fill="#f2ead8" /></g>)}
          {Array.from({ length: 30 }).map((_, i) => <circle key={`sd${i}`} cx={rnd(i, 61) * 1920} cy={rnd(i, 62) * 554} r={3} fill="#b39a62" />)}
          {flags.map((p, i) => {
            const on = k01((f - p.t) / 6);
            return (
              <g key={i} transform={`translate(${p.x} ${p.y - 526})`}>
                <path d="M -30 0 L -30 -26 L 30 -26 L 30 0 Z" fill="#e8dcc0" stroke={INK} strokeWidth={4} />
                <path d="M -16 -26 C -16 -46 16 -46 16 -26 Z" fill="#5d86a8" stroke={INK} strokeWidth={3} />
                {on > 0 && <g opacity={on} transform={`translate(26 -20) scale(${0.5 + 0.5 * on})`}><path d="M 0 0 L 0 -70" stroke={INK} strokeWidth={5} /><path d="M 2 -70 l 46 8 l -6 18 l -40 2 Z" fill="#f4efe2" stroke={INK} strokeWidth={3} /></g>}
              </g>
            );
          })}
        </svg>
      </div>
      {/* 3판 (2026-11-03 사용자: "몽골군이 손쉽게 호라즘을 먹을 수 있었다") "덕분에 몽골군은" - 지도가 화면 전체로 올라오고 흰 깃발이 온 땅을 덮음, 흰 툭이 솟음 */}
      {f > ALL - 2 && (
        <AbsoluteFill style={{ transform: `translateY(${(1 - lerp(f, ALL, ALL + 20, 0, 1, true)) * 1080}px)`, background: "#e6d2a2" }}>
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M -20 520 C 300 470 600 560 900 500 C 1200 450 1500 560 1940 510" stroke="#6f93a8" strokeWidth={16} fill="none" />
            <path d="M 500 -20 C 560 300 420 600 560 1100" stroke="#6f93a8" strokeWidth={12} fill="none" />
            {Array.from({ length: 48 }).map((_, i) => {
              const x = 100 + (i % 8) * 245 + (Math.floor(i / 8) % 2) * 120, y = 150 + Math.floor(i / 8) * 165;
              const on = k01((f - ALL - 10 - ((i * 7) % 48) * 1.2) / 6);
              return (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <path d="M -30 0 L -30 -26 L 30 -26 L 30 0 Z" fill="#e8dcc0" stroke={INK} strokeWidth={4} />
                  <path d="M -16 -26 C -16 -46 16 -46 16 -26 Z" fill="#5d86a8" stroke={INK} strokeWidth={3} />
                  {on > 0 && <g opacity={on} transform={`translate(26 -20) scale(${0.5 + 0.5 * on})`}><path d="M 0 0 L 0 -70" stroke={INK} strokeWidth={5} /><path d="M 2 -70 l 46 8 l -6 18 l -40 2 Z" fill="#f4efe2" stroke={INK} strokeWidth={3} /></g>}
                </g>
              );
            })}
          </svg>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - lerp(f, ALL + 50, ALL + 75, 0, 1, true)) * 700}px)` }}><Tug x={1660} y={1100} h={620} sway={Math.sin(f / 9) * 4} /></div>
        </AbsoluteFill>
      )}
      {f > ALL && <SFX name="war_horn" at={ALL + 50} vol={0.25} dur={60} />}
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 20, frames, 0, 1) }} />
      {[0, 30, 60, 90, 120, 150].map((t) => (t < frames ? <SFX key={t} name="catapult_hit" at={t + 18} vol={0.18} dur={20} /> : null))}
      {flags.map((p, i) => (i % 3 === 0 ? <SFX key={`g${i}`} name="tick" at={p.t} vol={0.1} dur={8} /> : null))}
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: [id(1)], Shot: S1 },
  { ids: [id(2)], Shot: S2 },
  { ids: [id(3)], Shot: S3 },
  { ids: [id(4)], Shot: S4 },
  { ids: [id(5)], Shot: S5 },
];
export const M02Ch4 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m2.4" year="1220" groups={groups} music="tension" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void SAND; void Spear; void Spearman; void KhFlag; void MAP_C;
