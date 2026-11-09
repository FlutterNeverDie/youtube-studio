// 몽골 2편 3장 "성 부수는 기술" 1판 (2026-11-02) - 대본 episodes/mongol-02/script-ko.md "## 3." (c3_01~c3_10, kit에서는 m2.c3_01…)
// 사용자: "1~3은 아주 디테일한 기술 분석, 아주 고퀄로 - 전에 저퀄로 렌더하기 급급했던 거 만회" / "포로 장면은 표정만 말고 절규·신음·고통이 보이게"
// 주인공 물건: 금나라 기술자 · 투석기(부품·조립·원리·발사) · 물에 불린 통나무 · 흙짐 진 포로 행렬 · 절규하는 수비병
// 기법(docs/guide/10-연출-기법.md, 한 편 안에서 되풀이 안 함): 분해도 → 빨리 감기 조립 · 분석 겹그림(받침점·1:4 치수선) · 느린 화면 + 궤적 점선 · 작업 공정 줄 · 가까이 교차 편집(위·아래 얼굴)
// 깜빡임 주의: 필터 단 컴포넌트 수십 개까지, 많은 그림은 한 svg 안에
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chapter, clamp, ease, FPS, Ger, Glow, Group, INK, Lang, LangContext, Rider, SFX, ShotProps, Tug, tl } from "./kit";
import { Cam, Dust, Horse, Look, MON, PORTER, Person, RiderOn, Smoke, Spear, ZhongduG } from "./M01Ch4";
import { Ox } from "./M02Ch2";
import { KH_CITIES, KhFlag, MapCam, Spearman } from "./M01Ch5";
import { SAND, SAND_D, SAND_DD } from "./M02City";
import { MapShot, MAP_C, rnd } from "./M02Ch1";

const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
const sec = (s: number) => Math.round(s * FPS);
const id = (n: number) => `m2.c3_${String(n).padStart(2, "0")}`;
const WOOD = "#9a7048", WOOD_D = "#6e4c2e", IRON = "#5a5e60";

// ================= 금나라 기술자 =================
const ENG: Look = { robe: "#4f6e8a", dark: "#3c566e", trim: "#c9a24a", hat: "jin_official", beard: "thin", collar: "round" };
const ENG2: Look = { robe: "#5e7a6a", dark: "#465e50", trim: "#c9a24a", hat: "jin_official", beard: "long", collar: "round" };
// 망치 (화면 좌표, 손 자리)
const Hammer = ({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) => (
  <svg width={160 * s} height={160 * s} viewBox="-80 -80 160 160" style={{ position: "absolute", left: x - 80 * s, top: y - 80 * s, ...ink }}>
    <g transform={`rotate(${rot})`}>
      <path d="M 0 0 L 0 -62" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M 0 0 L 0 -62" stroke={WOOD} strokeWidth={6} strokeLinecap="round" />
      <rect x={-22} y={-78} width={44} height={20} rx={4} fill={IRON} stroke={INK} strokeWidth={4} />
    </g>
  </svg>
);

// ================= 투석기 (견인식) - 판 좌표: 받침점 (0,0), 땅 y = 420 =================
// a = 긴 팔 방향(도, 화면 좌표) 150 쉼(왼쪽 아래) → 300 끝(오른쪽 위). 짧은 팔 : 긴 팔 = 130 : 520 = 1 : 4
const LONG = 520, SHORT = 130;
const rad = (d: number) => (d * Math.PI) / 180;
const beamEnds = (a: number) => [[LONG * Math.cos(rad(a)), LONG * Math.sin(rad(a))], [-SHORT * Math.cos(rad(a)), -SHORT * Math.sin(rad(a))]];
const Frame = ({ back = false }: { back?: boolean }) => {
  const c = back ? WOOD_D : WOOD;
  const dx = back ? 34 : 0, dy = back ? -14 : 0;
  return (
    <g transform={`translate(${dx} ${dy})`}>
      {[[-230, 420], [230, 420]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M 0 0 L ${x} ${y}`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
          <path d={`M 0 0 L ${x} ${y}`} stroke={c} strokeWidth={20} strokeLinecap="round" />
          <path d={`M ${x * 0.3} ${y * 0.3} L ${x * 0.34} ${y * 0.34}`} stroke={IRON} strokeWidth={26} />
          <path d={`M ${x * 0.72} ${y * 0.72} L ${x * 0.76} ${y * 0.76}`} stroke={IRON} strokeWidth={26} />
        </g>
      ))}
      {[200, 330].map((y) => (
        <g key={y}>
          <path d={`M ${(-230 * y) / 420} ${y} L ${(230 * y) / 420} ${y}`} stroke={INK} strokeWidth={22} />
          <path d={`M ${(-230 * y) / 420} ${y} L ${(230 * y) / 420} ${y}`} stroke={c} strokeWidth={13} />
        </g>
      ))}
      <path d="M -150 330 L 150 200 M 150 330 L -150 200" stroke={INK} strokeWidth={12} />
      <path d="M -150 330 L 150 200 M 150 330 L -150 200" stroke={c} strokeWidth={6} />
      {/* 받침 깔판 */}
      <path d="M -300 420 L 300 420" stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <path d="M -300 420 L 300 420" stroke={WOOD_D} strokeWidth={24} strokeLinecap="round" />
    </g>
  );
};
const Beam = ({ a }: { a: number }) => {
  const [l, s] = beamEnds(a);
  const n = [-Math.sin(rad(a)), Math.cos(rad(a))];
  const w0 = 22, w1 = 11; // 뿌리 굵고 끝 가늚
  const P = (p: number[], w: number, sgn: number) => `${p[0] + n[0] * w * sgn} ${p[1] + n[1] * w * sgn}`;
  return (
    <g>
      <path d={`M ${P(s, w0, 1)} L ${P(l, w1, 1)} L ${P(l, w1, -1)} L ${P(s, w0, -1)} Z`} fill={WOOD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${P(s, w0 * 0.4, 1)} L ${P(l, w1 * 0.4, 1)}`} stroke="#b88a5a" strokeWidth={4} opacity={0.7} />
      {/* 쇠띠 */}
      {[0.25, 0.55, 0.85].map((u) => {
        const c = [s[0] + (l[0] - s[0]) * u, s[1] + (l[1] - s[1]) * u];
        const w = w0 + (w1 - w0) * u + 3;
        return <path key={u} d={`M ${c[0] + n[0] * w} ${c[1] + n[1] * w} L ${c[0] - n[0] * w} ${c[1] - n[1] * w}`} stroke={IRON} strokeWidth={9} />;
      })}
      {/* 짧은 팔 끝 고리 */}
      <circle cx={s[0]} cy={s[1]} r={14} fill="none" stroke={IRON} strokeWidth={7} />
    </g>
  );
};
const Axle = () => (
  <g>
    <circle r={26} fill={WOOD_D} stroke={INK} strokeWidth={6} />
    <circle r={11} fill={IRON} stroke={INK} strokeWidth={4} />
    <path d="M -6 -6 L 6 6 M 6 -6 L -6 6" stroke="#2a2a2a" strokeWidth={3} />
  </g>
);
// 투석기 전체: crew = 줄 끝(사람 손) 위치 목록(판 좌표), sling = 주머니 위치(없으면 긴 팔 끝에 매달림)
export const Trebuchet = ({ a, crew, stone = true, slingAt }: { a: number; crew: number[][]; stone?: boolean; slingAt?: number[] }) => {
  const [l, s] = beamEnds(a);
  const pouch = slingAt ?? [l[0] + 40 * Math.cos(rad(a + 70)), l[1] + 40 * Math.sin(rad(a + 70)) + 60];
  return (
    <g>
      <Frame back />
      {crew.map(([x, y], i) => <path key={i} d={`M ${s[0]} ${s[1]} L ${x} ${y}`} stroke="#6b4f2e" strokeWidth={3.5} />)}
      <Beam a={a} />
      <Frame />
      <Axle />
      {/* 투석 줄 + 주머니 + 돌 */}
      <path d={`M ${l[0]} ${l[1]} L ${pouch[0] - 14} ${pouch[1]} M ${l[0]} ${l[1]} L ${pouch[0] + 14} ${pouch[1]}`} stroke="#6b4f2e" strokeWidth={4} />
      <path d={`M ${pouch[0] - 22} ${pouch[1] - 6} C ${pouch[0] - 22} ${pouch[1] + 24} ${pouch[0] + 22} ${pouch[1] + 24} ${pouch[0] + 22} ${pouch[1] - 6}`} fill="#8a6a44" stroke={INK} strokeWidth={4} />
      {stone && <circle cx={pouch[0]} cy={pouch[1] + 2} r={20} fill="#8a8478" stroke={INK} strokeWidth={5} />}
    </g>
  );
};

// ================= 1) c3_01~02 기술자 → 통째로 끌던 투석기 ✗ → 짐말마다 부품 → 분해도 → 성 앞 빨리 감기 조립 =================
const PART_BEAM = 0, PART_POST = 1, PART_AXLE = 2, PART_ROPE = 3, PART_SLING = 4;
const PartG = ({ k }: { k: number }) => {
  if (k === PART_BEAM) return <g><path d="M -260 -16 L 260 -8 L 260 8 L -260 16 Z" fill={WOOD} stroke={INK} strokeWidth={6} />{[-150, 0, 150].map((x) => <path key={x} d={`M ${x} -16 L ${x} 16`} stroke={IRON} strokeWidth={9} />)}</g>;
  if (k === PART_POST) return <g>{[-18, 18].map((dy) => <path key={dy} d={`M -200 ${dy} L 200 ${dy}`} stroke={INK} strokeWidth={26} strokeLinecap="round" />)}{[-18, 18].map((dy) => <path key={`c${dy}`} d={`M -200 ${dy} L 200 ${dy}`} stroke={WOOD} strokeWidth={17} strokeLinecap="round" />)}</g>;
  if (k === PART_AXLE) return <g><circle r={40} fill={WOOD_D} stroke={INK} strokeWidth={6} /><circle r={16} fill={IRON} stroke={INK} strokeWidth={4} /><path d="M -90 0 L 90 0" stroke={INK} strokeWidth={16} /><path d="M -90 0 L 90 0" stroke={IRON} strokeWidth={9} /></g>;
  if (k === PART_ROPE) return <g>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={0} cy={-i * 10} rx={56} ry={22} fill="none" stroke="#8a6a3e" strokeWidth={9} />)}<ellipse cx={0} cy={-30} rx={56} ry={22} fill="none" stroke={INK} strokeWidth={3} /></g>;
  return <g><path d="M -40 -20 C -40 30 40 30 40 -20" fill="#8a6a44" stroke={INK} strokeWidth={5} /><path d="M -40 -20 L -60 -70 M 40 -20 L 60 -70" stroke="#6b4f2e" strokeWidth={5} /></g>;
};
// 분해도 자리 (설계도 위 투석기 판 좌표, 받침점 = (960, 420), 축척 0.8)
const BP = { x: 960, y: 400, s: 0.8 };
const EXPLODE: { k: number; at: number[]; rot: number }[] = [
  { k: PART_BEAM, at: [-150, -130], rot: -25 },
  { k: PART_POST, at: [-260, 280], rot: -60 },
  { k: PART_POST, at: [260, 280], rot: 60 },
  { k: PART_AXLE, at: [0, -40], rot: 0 },
  { k: PART_ROPE, at: [420, 200], rot: 0 },
  { k: PART_SLING, at: [-470, 180], rot: 0 },
];
const S1Body: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2));
  const NO = a2 + tl(id(2), 0.2), PACK = a2 + tl(id(2), 2.4), BLUE = a2 + tl(id(2), 3.6), BUILD = a2 + tl(id(2), 6.4); // 분해도를 2.8초로 넉넉히
  const xf = (t0: number) => lerp(f, t0 - 6, t0 + 6, 0, 1);
  const JIN = tl(id(1), 3.2); // "금나라와 싸우며 데려온" - 회상
  if (f < JIN + 6) {
    // 2판 (2026-11-02 사용자: "사막 한가운데 세워 놓기만 하면 말이 안 돼"): 몽골 진영 - 게르·툭 사이 작업장에서 기술자들이 투석기 부품을 손질, 몽골 장수가 지켜봄
    return (
      <AbsoluteFill>
        <Cam z={lerp(f, 0, JIN, 1.12, 1.0)} cx={900} cy={560}>
          <AbsoluteFill style={{ background: "linear-gradient(#dfe3d6, #efe4c8 46%, #b9c084 46%, #9fae6a)" }} />
          {Array.from({ length: 8 }).map((_, i) => <Ger key={i} x={120 + i * 240} y={520 + (i % 2) * 20} w={170} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} />)}
          {[200, 900, 1700].map((x, i) => <Tug key={x} x={x} y={560} h={300} sway={Math.sin((f + i * 9) / 11) * 5} />)}
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {/* 작업장: 깔아 놓은 목재 · 받침대 위 막대 · 밧줄 다발 · 연장 */}
            <rect x={240} y={800} width={1440} height={160} rx={20} fill="#a8895a" opacity={0.5} />
            <g transform="translate(980 760) scale(0.85)"><Frame /><Axle /></g>
            <g transform="translate(560 860)"><PartG k={PART_BEAM} /></g>
            <g transform="translate(1420 880) scale(0.8)"><PartG k={PART_ROPE} /></g>
            <g transform="translate(330 900) scale(0.7)"><PartG k={PART_POST} /></g>
          </svg>
          <Person L={ENG} x={520} y={900} h={330} arms="up" eyes="dot" mouth="flat" />
          <Hammer x={560} y={600} rot={Math.sin(f / 3) * 30} s={1.3} />
          <Person L={ENG2} x={1140} y={930} h={350} arms="point" eyes="dot" mouth="talk" t={f} />
          <Person L={ENG} x={1560} y={920} h={320} arms="offer" eyes="dot" mouth="flat" flip />
          <Horse x={1780} y={1000} w={380} run={false} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a" flip><RiderOn L={MON} arms="hold" eyes="dot" mouth="flat" t={f} /></Horse>
        </Cam>
        <SFX name="hit" at={10} vol={0.15} dur={10} />
        <SFX name="hit" at={30} vol={0.15} dur={10} />
      </AbsoluteFill>
    );
  }
  if (f < NO + 6) {
    // 회상 (빛바랜 색): 금나라 도성 앞, 몽골 기병이 성문에서 나오는 기술자들과 연장 수레·목재를 데려감
    const t = f - JIN;
    return (
      <AbsoluteFill style={{ opacity: xf(JIN), filter: "sepia(0.55) saturate(0.8)" }}>
        <Cam z={lerp(t, 0, NO - JIN, 1.0, 1.08)} cx={960} cy={600}>
          <AbsoluteFill style={{ background: "linear-gradient(#e6dcc2, #efe4c8 40%, #c9b48a 40%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><ZhongduG /></svg>
          {Array.from({ length: 6 }).map((_, i) => {
            const u = k01((t - i * 6) / 70);
            const x = 960 - u * 700 - (i % 2) * 40, y = 700 + u * 280;
            return u > 0 ? <Person key={i} L={i % 2 ? ENG2 : ENG} x={x} y={y} h={200 + u * 120} arms={i % 3 === 0 ? "hold" : "offer"} eyes="worry" mouth="frown" step={f / 5} bob={Math.abs(Math.sin(f / 5 + i)) * 6} /> : null;
          })}
          {[[300, 860], [1500, 880], [1700, 760]].map(([x, y], i) => <Horse key={i} x={x} y={y} w={300} run={false} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a" flip={i > 0}><RiderOn L={MON} arms="point" eyes="dot" mouth="flat" t={f} /><Spear x={60} y={-380} len={360} /></Horse>)}
          {/* 목재·연장 실은 수레 */}
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <g transform={`translate(${1120 - k01(t / 80) * 500} ${900})`}>
              <path d="M -120 -40 L 120 -40 L 110 -90 L -110 -90 Z" fill="#8a6440" stroke={INK} strokeWidth={5} />
              <path d="M -140 -110 L 150 -96 L 150 -84 L -140 -98 Z" fill={WOOD} stroke={INK} strokeWidth={4} />
              {[-70, 70].map((dx) => <circle key={dx} cx={dx} cy={-20} r={30} fill="#6a4a2e" stroke={INK} strokeWidth={5} />)}
            </g>
          </svg>
        </Cam>
        <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(60,40,20,.55)" }} />
        <SFX name="hooves" at={JIN} vol={0.2} dur={NO - JIN} />
      </AbsoluteFill>
    );
  }
  if (f < PACK + 6) {
    // 2판: "통째로 끌고 다니지 않았습니다" - 다 조립된 투석기를 큰 수레(바퀴 넷)에 올려 소 여덟 마리와 사람들이 모래 언덕 위로 끄는데, 바퀴가 묻혀 멈춤 → ✗
    const t = f - NO;
    const stuck = lerp(t, 14, 44, 0, 1);
    const go = lerp(t, 0, 40, 0, 1, true);
    return (
      <AbsoluteFill style={{ opacity: xf(NO) }}>
        <AbsoluteFill style={{ background: "linear-gradient(#e7d4a6, #f2e2b8 40%, #dcbd7e 40%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -40 880 C 400 860 900 760 1300 700 C 1600 660 1800 650 1960 650 L 1960 1100 L -40 1100 Z" fill="#d6b678" stroke={INK} strokeWidth={4} />
          <g transform={`translate(${380 + go * 120} ${820 - go * 30}) rotate(-8)`}>
            {/* 수레 바닥 + 바퀴 넷 */}
            <rect x={-260} y={-40} width={520} height={40} fill={WOOD_D} stroke={INK} strokeWidth={6} />
            {[-200, -70, 70, 200].map((dx) => <g key={dx} transform={`translate(${dx} ${10 + stuck * 30})`}><circle r={52} fill={WOOD_D} stroke={INK} strokeWidth={7} />{[0, 60, 120].map((a) => <path key={a} d={`M ${Math.cos(rad(a)) * 44} ${Math.sin(rad(a)) * 44} L ${-Math.cos(rad(a)) * 44} ${-Math.sin(rad(a)) * 44}`} stroke={INK} strokeWidth={6} />)}</g>)}
            <g transform="translate(0 -460) scale(0.95)"><Trebuchet a={150} crew={[]} /></g>
            {[-200, -70, 70, 200].map((dx) => <path key={`m${dx}`} d={`M ${dx - 80} 70 C ${dx - 40} ${30 - stuck * 40} ${dx + 40} ${30 - stuck * 40} ${dx + 80} 70 Z`} fill="#d6b678" stroke={INK} strokeWidth={4} opacity={0.4 + stuck * 0.6} />)}
          </g>
          {/* 끄는 줄 + 소 여덟 마리 */}
          <path d={`M ${640 + go * 120} ${780 - go * 30} L 1880 640`} stroke="#6b4f2e" strokeWidth={6} />
          {Array.from({ length: 4 }).map((_, i) => <g key={i} transform={`translate(${900 + i * 260} ${760 - i * 30}) scale(0.9)`}><Ox strain={stuck} /></g>)}
          {stuck > 0.8 && <g opacity={lerp(t, 44, 54, 0, 1)} transform="translate(560 520)"><path d="M -150 -150 L 150 150 M 150 -150 L -150 150" stroke="#b8332a" strokeWidth={38} strokeLinecap="round" /></g>}
        </svg>
        {[[820, 820], [1080, 790], [1340, 760], [1600, 730]].map(([x, y], i) => <Person key={i} L={i % 2 ? PORTER : MON} x={x} y={y + 40} h={210} arms="offer" eyes="shut" mouth="grin" rot={-24} />)}
        <SFX name="rumble" at={NO} vol={0.3} dur={44} />
        <SFX name="hit" at={NO + 46} vol={0.3} dur={20} />
      </AbsoluteFill>
    );
  }
  if (f < BLUE + 6) {
    // "부품만 말에 싣고 다니다가": 짐말 행렬이 지나가며 부품이 하나씩 보임
    const t = f - PACK;
    return (
      <AbsoluteFill style={{ opacity: xf(PACK) }}>
        <AbsoluteFill style={{ background: "linear-gradient(#e7d4a6, #f2e2b8 48%, #dcbd7e 48%)" }} />
        {Array.from({ length: 5 }).map((_, i) => {
          const x = 2200 - t * 9 - i * 520;
          return (
            <React.Fragment key={i}>
              <Dust x={x + 100} y={880} t={((f + i * 5) % 22) / 22} r={50} color="#d8bd88" />
              <Horse x={x} y={900} w={420} flip coat={["#8a6440", "#b88a52", "#6a4a2e", "#c9b48a", "#5a4a3e"][i]} saddle="#5a3a2a" phase={i * 4}>
                <g transform="translate(30 -290) scale(0.95)"><PartG k={i} /></g>
              </Horse>
              <Person L={i % 2 ? ENG : PORTER} x={x - 290} y={910} h={260} arms="hold" eyes="dot" step={f / 5} bob={Math.abs(Math.sin(f / 5)) * 6} flip />
            </React.Fragment>
          );
        })}
        <SFX name="hooves" at={PACK} vol={0.25} dur={BLUE - PACK} />
      </AbsoluteFill>
    );
  }
  if (f < BUILD + 6) {
    // 분해도: 설계도 종이 위에 부품이 떠올라 제자리 방향으로 펼쳐짐 (점선 안내선 · 번호 원 없이 동그라미 표시)
    const t = f - BLUE;
    return (
      <AbsoluteFill style={{ opacity: xf(BLUE) }}>
        <AbsoluteFill style={{ background: "#e9dcbc" }} />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {Array.from({ length: 25 }).map((_, i) => <path key={`v${i}`} d={`M ${i * 80} 0 L ${i * 80} 1080`} stroke="#c9b48a" strokeWidth={2} />)}
          {Array.from({ length: 14 }).map((_, i) => <path key={`h${i}`} d={`M 0 ${i * 80} L 1920 ${i * 80}`} stroke="#c9b48a" strokeWidth={2} />)}
        </svg>
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 완성 모습 흐린 윤곽 */}
          <g transform={`translate(${BP.x} ${BP.y}) scale(${BP.s})`} opacity={0.18}><Trebuchet a={200} crew={[]} /></g>
          {EXPLODE.map((p, i) => {
            const u = lerp(t, i * 4, i * 4 + 18, 0, 1, true);
            const x = BP.x + p.at[0] * u * 1.25, y = BP.y + 120 + (p.at[1] - 120) * u * 1.25;
            return (
              <g key={i} opacity={lerp(t, i * 4, i * 4 + 6, 0, 1)}>
                <path d={`M ${BP.x} ${BP.y + 120} L ${x} ${y}`} stroke={INK} strokeWidth={3} strokeDasharray="10 8" opacity={0.5} />
                <g transform={`translate(${x} ${y}) rotate(${p.rot * u}) scale(0.7)`}><PartG k={p.k} /></g>
                <circle cx={x} cy={y} r={70} fill="none" stroke="#8a3b2c" strokeWidth={3} strokeDasharray="6 6" opacity={u} />
              </g>
            );
          })}
        </svg>
        <SFX name="page" at={BLUE} vol={0.3} dur={20} />
      </AbsoluteFill>
    );
  }
  // "성 앞에서 조립했습니다": 성채 앞, 빨리 감기로 부품이 제자리에 쾅쾅 붙음, 기술자 망치질·불똥·먼지
  const t = f - BUILD;
  const steps = [0, 6, 12, 18, 24];
  const placed = steps.filter((s0) => t > s0).length;
  return (
    <AbsoluteFill style={{ opacity: xf(BUILD) }}>
      <AbsoluteFill style={{ background: "linear-gradient(#dfe0d2, #efe4c8 50%, #d6b97f 50%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d="M 1300 540 C 1360 400 1800 400 1860 540 Z" fill="#c4a56a" stroke={INK} strokeWidth={5} />
        <path d="M 1380 440 L 1380 330 L 1780 330 L 1780 440 Z" fill={SAND_D} stroke={INK} strokeWidth={6} />
        <g transform="translate(760 500) scale(0.85)">
          {placed >= 1 && <Frame back />}
          {placed >= 2 && <Frame />}
          {placed >= 3 && <Axle />}
          {placed >= 4 && <Beam a={150} />}
          {placed >= 5 && <Trebuchet a={150} crew={[]} />}
        </g>
      </svg>
      {steps.map((s0, i) => (t > s0 && t < s0 + 10 ? <Dust key={i} x={760 + (i - 2) * 80} y={860} t={(t - s0) / 10} r={90} /> : null))}
      {[[420, 980], [1080, 990], [700, 1010]].map(([x, y], i) => {
        const swing = Math.sin((f + i * 4) / 2.2) > 0;
        return (
          <React.Fragment key={i}>
            <Person L={i % 2 ? ENG2 : ENG} x={x} y={y} h={300} arms="up" eyes="dot" mouth="flat" flip={i === 1} />
            <Hammer x={x + (i === 1 ? -50 : 50)} y={y - 300 - (swing ? 20 : 0)} rot={swing ? (i === 1 ? 40 : -40) : 0} s={1.2} />
            {swing && <div style={{ position: "absolute", left: x + (i === 1 ? -70 : 50), top: y - 250, width: 14, height: 14, borderRadius: "50%", background: "#ffd27a", boxShadow: "0 0 12px 6px rgba(255,190,90,.7)" }} />}
          </React.Fragment>
        );
      })}
      {steps.map((s0, i) => <SFX key={i} name="hit" at={BUILD + s0} vol={0.25} dur={10} />)}
    </AbsoluteFill>
  );
};

// ================= 2) c3_03~04 투석기 원리 분석 → 발사 (느린 화면 · 궤적 점선 · 성벽 명중) =================
// 세계 판 3600 너비: 투석기 받침점 (700, 560), 성벽 x 3150
const PIV = [700, 560];
const CREW = Array.from({ length: 18 }).map((_, i) => [880 + (i % 9) * 70 + (i >= 9 ? 35 : 0), i >= 9 ? 1000 : 960]);
// 시간 왜곡: 0→1 진행을 빠름 - 느림(놓는 순간) - 빠름 으로
const warp = (u: number) => (u < 0.4 ? (u / 0.4) * 0.45 : u < 0.8 ? 0.45 + ((u - 0.4) / 0.4) * 0.2 : 0.65 + ((u - 0.8) / 0.2) * 0.35);
const REL_A = 262;
const S2: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a4 = at(id(4));
  const ana = lerp(f, 8, 26, 0, 1); // 분석 겹그림
  const anaOut = lerp(f, a4 + tl(id(4), 2.6), a4 + tl(id(4), 3.2), 1, 0);
  const SIG = a4 + tl(id(4), 3.4); // "수십 명이 한꺼번에 당기면" 신호
  const SW = SIG + 6, SW_E = SW + sec(2.6); // 휘두름 (느린 화면 포함)
  const u = warp(lerp(f, SW, SW_E, 0, 1));
  const a = 150 + 150 * ease(u);
  const released = a >= REL_A;
  const pull = lerp(f, SIG, SW + 10, 0, 1, true);
  // 돌 궤적: 놓는 순간 위치에서 성벽(3150, 520)까지 포물선
  const [lr] = beamEnds(REL_A);
  const R0 = [PIV[0] + lr[0] * 0.85, PIV[1] + lr[1] * 0.85];
  const TGT = [3150, 470];
  const relF = SW + Math.round(sec(2.6) * 0.62);
  const fly = lerp(f, relF, relF + sec(1.8), 0, 1);
  const stoneAt = (q: number) => [R0[0] + (TGT[0] - R0[0]) * q, R0[1] + (TGT[1] - R0[1]) * q - Math.sin(q * Math.PI) * 520];
  const st = stoneAt(fly);
  const hit = fly >= 1;
  const camX = released ? Math.min(3600 - 960, Math.max(960, st[0])) : 960;
  const slowMo = u > 0.45 && u < 0.65;
  const crewHands = CREW.map(([x, y]) => [x - PIV[0] - 30 + pull * 20, y - PIV[1] - 150]);
  return (
    <AbsoluteFill style={{ background: "#e9dcbc" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 3600, height: 1080, transform: `translateX(${960 - camX}px)` }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#d9dfd8, #efe4c8 52%, #d6b97f 52%)" }} />
        <svg width={3600} height={1080} style={{ position: "absolute", ...ink }}>
          {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M ${i * 260} ${700 + (i % 3) * 90} q 50 -26 100 0 q 50 -26 100 0`} stroke="#b8975a" strokeWidth={5} fill="none" />)}
          {/* 성벽 (오른쪽 끝) */}
          <path d="M 3100 560 L 3100 260 L 3600 260 L 3600 560 Z" fill={SAND_D} stroke={INK} strokeWidth={7} />
          {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={3106 + i * 56} y={234} width={32} height={28} fill={SAND_D} stroke={INK} strokeWidth={5} />)}
          {Array.from({ length: 6 }).map((_, i) => <path key={`r${i}`} d={`M 3100 ${300 + i * 44} L 3600 ${300 + i * 44}`} stroke={SAND_DD} strokeWidth={3} opacity={0.6} />)}
          {hit && <path d="M 3150 470 l 30 -40 l -10 -30 m 10 30 l 40 10 m -70 30 l -20 50" stroke={INK} strokeWidth={6} fill="none" />}
          <g transform={`translate(${PIV[0]} ${PIV[1]})`}>
            <Trebuchet a={a} crew={crewHands} stone={!released} />
            {/* 느린 화면 잔상 */}
            {slowMo && [8, 16, 24].map((d) => <g key={d} opacity={0.18}><Beam a={a - d} /></g>)}
          </g>
          {/* 날아가는 돌 + 궤적 점선 */}
          {released && !hit && (
            <>
              <path d={"M " + Array.from({ length: 21 }).map((_, k) => stoneAt((k / 20) * fly).join(" ")).join(" L ")} stroke="#8a3b2c" strokeWidth={6} strokeDasharray="16 14" fill="none" />
              <circle cx={st[0]} cy={st[1]} r={22} fill="#8a8478" stroke={INK} strokeWidth={5} />
            </>
          )}
        </svg>
        {/* 당기는 사람들 */}
        {CREW.map(([x, y], i) => <Person key={i} L={i % 3 ? PORTER : MON} x={x + pull * 20} y={y} h={230} arms="hold" eyes={pull > 0.2 ? "shut" : "dot"} mouth={pull > 0.2 ? "grin" : "flat"} rot={-pull * 16} />)}
        {/* 신호수 */}
        <Person L={MON} x={1620} y={990} h={280} arms={f < SIG ? "up" : "point"} eyes="angry" mouth={f < SIG + 8 ? "o" : "flat"} flip />
        <svg width={200} height={260} viewBox="-100 -230 200 260" style={{ position: "absolute", left: 1620 - 100 + (f < SIG ? -60 : -110), top: 990 - 300, ...ink }}>
          <g transform={`rotate(${f < SIG ? 0 : 70})`}><path d="M 0 0 L 0 -200" stroke={INK} strokeWidth={8} /><path d="M 2 -200 L 80 -186 L 2 -150 Z" fill="#a8332a" stroke={INK} strokeWidth={4} /></g>
        </svg>
        {hit && <><Dust x={3150} y={470} t={lerp(f, relF + sec(1.8), relF + sec(1.8) + 24, 0, 1)} r={150} color="#c9b48a" /><Smoke x={3150} y={430} f={f} n={2} s={0.6} /></>}
      </div>
      {/* 분석 겹그림: 받침점 · 1 : 4 · 당기는 방향 · 도는 방향 */}
      {ana * anaOut > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", opacity: ana * anaOut }}>
          {(() => {
            const [l, s] = beamEnds(150);
            const L = [PIV[0] + l[0], PIV[1] + l[1]], S = [PIV[0] + s[0], PIV[1] + s[1]];
            const n = [-Math.sin(rad(150)) * 60, Math.cos(rad(150)) * 60];
            return (
              <g fontFamily="Baskerville, serif" fontWeight={700}>
                <circle cx={PIV[0]} cy={PIV[1]} r={44} fill="none" stroke="#c0392b" strokeWidth={6} />
                <circle cx={PIV[0]} cy={PIV[1]} r={9} fill="#c0392b" />
                <path d={`M ${S[0] - n[0]} ${S[1] - n[1]} L ${PIV[0] - n[0]} ${PIV[1] - n[1]}`} stroke="#c0392b" strokeWidth={5} markerEnd="url(#ar)" />
                <path d={`M ${PIV[0] + n[0]} ${PIV[1] + n[1]} L ${L[0] + n[0]} ${L[1] + n[1]}`} stroke="#2e5a8a" strokeWidth={5} />
                {[S, PIV, L].map(([x, y], k) => <path key={k} d={`M ${x - n[0] * 0.3} ${y - n[1] * 0.3} L ${x + n[0] * 0.3} ${y + n[1] * 0.3}`} stroke={INK} strokeWidth={4} transform={`translate(${k === 2 ? n[0] : -n[0]} ${k === 2 ? n[1] : -n[1]})`} />)}
                <text x={(S[0] + PIV[0]) / 2 - n[0] * 1.8} y={(S[1] + PIV[1]) / 2 - n[1] * 1.8} fontSize={72} fill="#c0392b" textAnchor="middle">1</text>
                <text x={(L[0] + PIV[0]) / 2 + n[0] * 1.8} y={(L[1] + PIV[1]) / 2 + n[1] * 1.8} fontSize={72} fill="#2e5a8a" textAnchor="middle">4</text>
                {/* 당기는 방향 ↓ (짧은 팔 끝) */}
                <path d={`M ${S[0] + 60} ${S[1] - 20} L ${S[0] + 60} ${S[1] + 150}`} stroke="#c0392b" strokeWidth={12} />
                <path d={`M ${S[0] + 30} ${S[1] + 120} L ${S[0] + 60} ${S[1] + 170} L ${S[0] + 90} ${S[1] + 120} Z`} fill="#c0392b" />
                {/* 도는 방향 ↻ (긴 팔 끝 호) */}
                <path d={`M ${L[0] - 40} ${L[1] - 60} A 520 520 0 0 1 ${PIV[0] - 300} ${PIV[1] - 430}`} stroke="#2e5a8a" strokeWidth={10} fill="none" strokeDasharray="22 14" />
                <path d={`M ${PIV[0] - 330} ${PIV[1] - 470} L ${PIV[0] - 280} ${PIV[1] - 430} L ${PIV[0] - 340} ${PIV[1] - 410} Z`} fill="#2e5a8a" />
              </g>
            );
          })()}
        </svg>
      )}
      {slowMo && <AbsoluteFill style={{ boxShadow: "inset 0 0 160px rgba(0,0,0,.35)" }} />}
      <SFX name="drum" at={SIG} vol={0.35} />
      <SFX name="war_cry" at={SIG + 2} vol={0.2} dur={30} />
      <SFX name="catapult" at={relF - 6} vol={0.5} dur={40} />
      <SFX name="whoosh" at={relF} vol={0.35} dur={40} />
      <SFX name="catapult_hit" at={relF + sec(1.8)} vol={0.5} dur={50} />
    </AbsoluteFill>
  );
};

// ================= 3) c3_05 작업 공정 줄: 나무 베기 → 토막 → 물에 불리기 → 싣기 (카메라가 오른쪽으로) =================
const Tree = ({ x, y, cut }: { x: number; y: number; cut: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${cut * 80} 0 0)`} style={{ transformOrigin: `${x}px ${y}px` }}>
    <path d="M -22 0 L -16 -260 L 16 -260 L 22 0 Z" fill="#7a5a38" stroke={INK} strokeWidth={6} />
    {[[-80, -300, 90], [30, -330, 100], [100, -270, 80], [-30, -380, 90], [-110, -230, 70]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#5e7a3a" : "#6e8a44"} stroke={INK} strokeWidth={5} />)}
    {[[-60, -310], [40, -350], [90, -280], [-20, -390]].map(([cx, cy], i) => <circle key={`b${i}`} cx={cx} cy={cy} r={9} fill="#5a2a4a" />)}
  </g>
);
const Log = ({ x, y, wet = 0, rot = 0, s = 1 }: { x: number; y: number; wet?: number; rot?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-80} y={-30} width={160} height={60} rx={14} fill={wet > 0.5 ? "#5e4228" : "#9a7048"} stroke={INK} strokeWidth={5} />
    <ellipse cx={80} cy={0} rx={18} ry={30} fill={wet > 0.5 ? "#7a5a3a" : "#c9a274"} stroke={INK} strokeWidth={5} />
    {[0.4, 0.75].map((r) => <ellipse key={r} cx={80} cy={0} rx={18 * r} ry={30 * r} fill="none" stroke="#7a5230" strokeWidth={2.5} />)}
    <path d="M -60 -12 L 40 -16 M -50 10 L 50 14" stroke={wet > 0.5 ? "#4a321e" : "#7a5230"} strokeWidth={3} />
    {wet > 0.5 && [[-40, 32], [10, 34], [50, 32]].map(([dx, dy], i) => <path key={i} d={`M ${dx} ${dy} q -4 12 0 18 q 4 -6 0 -18`} fill="#5f93b8" />)}
  </g>
);
const S3: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const W = 4200;
  const camX = lerp(f, 6, frames - 16, 960, W - 960, true);
  const st = (i: number) => k01((camX - (i * 1000 + 300)) / 500);
  return (
    <AbsoluteFill style={{ background: "#e9dcbc" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 1080, transform: `translateX(${960 - camX}px)` }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#dfe3d6, #efe4c8 54%, #d6b97f 54%)" }} />
        <svg width={W} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 공정 사이 화살표 */}
          {[1, 2, 3].map((i) => <g key={i} transform={`translate(${i * 1000 + 40} 740)`}><path d="M -80 0 L 60 0" stroke="#8a3b2c" strokeWidth={16} /><path d="M 50 -30 L 100 0 L 50 30 Z" fill="#8a3b2c" /></g>)}
          {/* ① 나무 베기 */}
          <Tree x={520} y={880} cut={lerp(st(0), 0.3, 1, 0, 1, true)} />
          {/* ② 토막 내기 */}
          {[0, 1, 2].map((k) => <Log key={k} x={1300 + k * 190 + st(1) * k * 30} y={860 - (k % 2) * 30} s={1.1} />)}
          {/* ③ 물웅덩이에 담가 불리기 */}
          <ellipse cx={2500} cy={880} rx={360} ry={90} fill="#5f86a0" stroke={INK} strokeWidth={6} />
          <ellipse cx={2500} cy={870} rx={320} ry={66} fill="#7aa2bb" />
          {[0, 1, 2].map((k) => <Log key={k} x={2360 + k * 140} y={870 - k * 8} wet={st(2)} rot={k * 6 - 6} s={0.8} />)}
          {Array.from({ length: 6 }).map((_, k) => { const t = ((f + k * 9) % 30) / 30; return <circle key={`bb${k}`} cx={2280 + k * 80} cy={860 - t * 50} r={6 + t * 4} fill="none" stroke="#e0eef5" strokeWidth={3} opacity={1 - t} />; })}
          {/* ④ 투석기 주머니에 싣기 */}
          <g transform="translate(3560 520) scale(0.62)"><Trebuchet a={150} crew={[]} stone={false} /></g>
          <Log x={3300} y={lerp(st(3), 0, 1, 900, 690)} wet={1} rot={-10} s={0.75} />
        </svg>
        <Person L={PORTER} x={420} y={900} h={300} arms="up" eyes="angry" mouth="grin" />
        <svg width={200} height={200} viewBox="-100 -100 200 200" style={{ position: "absolute", left: 360, top: 520, ...ink }}><g transform={`rotate(${Math.sin(f / 2.5) * 40})`}><path d="M 0 60 L 0 -40" stroke={WOOD} strokeWidth={12} /><path d="M -10 -40 L 40 -60 L 34 -20 Z" fill={IRON} stroke={INK} strokeWidth={4} /></g></svg>
        <Person L={{ ...PORTER, robe: "#7a6a5a", dark: "#5e5244" }} x={1250} y={940} h={280} arms="offer" eyes="dot" mouth="flat" />
        <Person L={MON} x={2850} y={920} h={280} arms="point" eyes="dot" mouth="flat" flip />
        {[3150, 3250].map((x, i) => <Person key={x} L={i ? PORTER : MON} x={x} y={940} h={260} arms="up" eyes="shut" mouth="grin" />)}
      </div>
      <SFX name="hit" at={10} vol={0.2} dur={10} />
      <SFX name="rumble" at={tl(id(5), 1.5)} vol={0.2} dur={30} />
      <SFX name="rain_thunder" at={tl(id(5), 3)} vol={0.08} dur={40} />
    </AbsoluteFill>
  );
};

// ================= 4) c3_06~08 해자 → 포로 행렬이 해자를 메움 → 가까이: 활을 겨눈 수비병의 절규 · 올려다보며 울부짖는 포로들 =================
// 비스듬히 위에서 본 성벽·해자 (성벽 위쪽, 해자 가운데, 포로가 아래에서 올라옴)
const MOAT_Y = 520;
// 2판 (2026-11-02 사용자: "점령지에서 데려온 일반 시민인 걸 보여 줘야, 자기 나라 사람인지 구별이 안 가") - 호라즘 시민 차림: 남자 흰 터번(수비병 투구의 흰 띠와 같음), 여자 머릿수건, 노인 흰 수염
export const CIV: Look[] = [
  { robe: "#8a6a4a", dark: "#6e5236", trim: "#2e6b4f", hat: "turban", beard: "full", collar: "cross" },
  { robe: "#6a7a8a", dark: "#52606e", trim: "#c9a24a", hat: "scarf", collar: "round" },
  { robe: "#9a7a5a", dark: "#7a5e42", trim: "#2e6b4f", hat: "turban", beard: "thin", collar: "cross" },
  { robe: "#7a5a6a", dark: "#5e4452", trim: "#c9a24a", hat: "scarf", collar: "round" },
  { robe: "#a08a62", dark: "#7e6c4c", trim: "#5a6e8a", hat: "turban", beard: "long", collar: "cross" },
];
const Captive = ({ x, y, s, f, i, load = "sack", wail = 0 }: { x: number; y: number; s: number; f: number; i: number; load?: "sack" | "wood"; wail?: number }) => {
  const bob = Math.abs(Math.sin(f / 5 + i)) * 6 * s;
  return (
    <>
      <Person L={CIV[i % 5]} x={x} y={y} h={240 * s} arms={wail > 0.5 ? "up" : "offer"} eyes="cry" mouth={wail > 0.5 ? "wail" : "frown"} bob={bob} rot={wail > 0.5 ? Math.sin(f / 3 + i) * 4 : 14} t={f + i * 5} />
      {wail <= 0.5 && (
        <svg width={200 * s} height={140 * s} viewBox="-100 -70 200 140" style={{ position: "absolute", left: x - 30 * s - 100 * s, top: y - 250 * s - bob - 70 * s, ...ink }}>
          {load === "sack" ? <path d="M -60 30 C -66 -30 -20 -50 0 -48 C 30 -50 66 -30 60 30 Z" fill="#a8895a" stroke={INK} strokeWidth={5} /> : <g>{[-20, 0, 20].map((dy) => <path key={dy} d={`M -70 ${dy} L 70 ${dy - 10}`} stroke={WOOD} strokeWidth={14} strokeLinecap="round" />)}<path d="M -20 -30 L -20 30 M 20 -34 L 20 26" stroke="#6b4f2e" strokeWidth={5} /></g>}
        </svg>
      )}
    </>
  );
};
const CivClose = ({ x, y, h, f, kind, i }: { x: number; y: number; h: number; f: number; kind: "old" | "woman" | "young" | "child"; i: number }) => {
  const s = h / 560;
  const sw = Math.sin(f / 5 + i) * 4;
  const mo = 26 + Math.abs(Math.sin(f / 4 + i)) * 20;
  const skin = kind === "old" ? "#c9905f" : "#d9a77a";
  const robe = ["#8a6a4a", "#6a7a8a", "#9a7a5a", "#7a5a6a"][i % 4];
  return (
    <svg width={400 * s} height={560 * s} viewBox="0 0 400 560" style={{ position: "absolute", left: x - 200 * s, top: y - 560 * s, transform: `rotate(${sw}deg)`, transformOrigin: "50% 100%", ...ink }}>
      {/* 몸 */}
      <path d="M 70 560 C 70 420 110 360 200 356 C 290 360 330 420 330 560 Z" fill={robe} stroke={INK} strokeWidth={6} />
      <path d="M 200 360 L 200 560" stroke="rgba(0,0,0,.18)" strokeWidth={8} />
      {/* 위로 뻗은 두 팔 + 벌린 손 */}
      {[[120, 390, 60, 250, 70, 110], [280, 390, 340, 250, 330, 110]].map(([sx, sy, mx, my, hx, hy], k) => (
        <g key={k} transform={`rotate(${Math.sin(f / 4 + k + i) * 4} ${sx} ${sy})`}>
          <path d={`M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`} stroke={INK} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d={`M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`} stroke={robe} strokeWidth={34} strokeLinecap="round" fill="none" />
          <ellipse cx={hx} cy={hy - 10} rx={26} ry={30} fill={skin} stroke={INK} strokeWidth={5} />
          {[-16, -6, 4, 14].map((d) => <path key={d} d={`M ${hx + d} ${hy - 30} l ${d * 0.3} -26`} stroke={INK} strokeWidth={9} strokeLinecap="round" />)}
          {[-16, -6, 4, 14].map((d) => <path key={`c${d}`} d={`M ${hx + d} ${hy - 30} l ${d * 0.3} -26`} stroke={skin} strokeWidth={5} strokeLinecap="round" />)}
        </g>
      ))}
      {/* 얼굴 (올려다봄) */}
      <ellipse cx={200} cy={250} rx={kind === "child" ? 78 : 88} ry={kind === "child" ? 84 : 96} fill={skin} stroke={INK} strokeWidth={6} />
      {kind === "old" && <path d="M 122 270 C 130 360 170 384 200 388 C 230 384 270 360 278 270 C 260 300 230 308 200 308 C 170 308 140 300 122 270 Z" fill="#ece6d8" stroke={INK} strokeWidth={4} />}
      {kind === "young" && <path d="M 130 280 C 140 330 260 330 270 280" stroke="#3a2a20" strokeWidth={12} fill="none" opacity={0.6} />}
      {/* 걱정으로 치켜 올라간 눈썹 · 질끈 감은 눈 · 눈물 줄기 */}
      <path d="M 138 202 L 182 182 M 262 202 L 218 182" stroke={kind === "old" ? "#f4f0e6" : INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M 140 226 L 176 238 L 140 248 M 260 226 L 224 238 L 260 248" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 1].map((k) => {
        const t = ((f + k * 9 + i * 5) % 24) / 24;
        const tx = k ? 236 : 164;
        return <g key={k}><path d={`M ${tx} 246 C ${tx - 6} 290 ${tx + 4} 320 ${tx - 4} 350`} stroke="#8fc0dc" strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.9} /><ellipse cx={tx - 4} cy={352 + t * 70} rx={8} ry={12} fill="#8fc0dc" opacity={1 - t} /></g>;
      })}
      {/* 울부짖는 입 */}
      <path d={`M 168 ${292 - mo * 0.2} Q 200 ${276 - mo * 0.3} 232 ${292 - mo * 0.2} Q 226 ${300 + mo} 200 ${302 + mo} Q 174 ${300 + mo} 168 ${292 - mo * 0.2} Z`} fill="#4a1e18" stroke={INK} strokeWidth={5} />
      <path d={`M 178 ${296 - mo * 0.2} L 222 ${296 - mo * 0.2}`} stroke="#f4efe2" strokeWidth={5} />
      {/* 머리: 터번 · 머릿수건 · 아이 모자 */}
      {kind === "woman" ? (
        <path d="M 100 260 C 86 130 314 130 300 260 C 306 330 286 370 256 382 L 256 320 C 276 280 270 200 200 192 C 130 200 124 280 144 320 L 144 382 C 114 370 94 330 100 260 Z" fill="#8a4a5a" stroke={INK} strokeWidth={6} />
      ) : kind === "child" ? (
        <path d="M 124 210 C 120 140 280 140 276 210 C 240 196 160 196 124 210 Z" fill="#c9a24a" stroke={INK} strokeWidth={6} />
      ) : (
        <g>
          <path d="M 106 214 C 96 116 304 116 294 214 C 250 196 150 196 106 214 Z" fill="#f2ece0" stroke={INK} strokeWidth={6} />
          <path d="M 116 184 C 160 164 240 164 284 184 M 126 158 C 166 142 234 142 274 158" stroke="#cfc6b2" strokeWidth={6} fill="none" />
        </g>
      )}
    </svg>
  );
};
// 가까이 본 수비병 (절규): 판 400×520, 상반신. state 0 겨눔(떨림) → 1 활을 떨구고 고개를 젖혀 절규, 눈물
const ArcherClose = ({ x, y, h, f, state }: { x: number; y: number; h: number; f: number; state: number }) => {
  const s = h / 520;
  const shake = state < 0.5 ? Math.sin(f * 0.9) * 3 : Math.sin(f * 0.6) * 6; // 프레임마다 뒤집히면 깜빡임처럼 보여서 느리게
  const tilt = state * -14;
  const mouthOpen = state > 0.5 ? 30 + Math.abs(Math.sin(f / 4)) * 18 : 6;
  return (
    <svg width={400 * s} height={520 * s} viewBox="0 0 400 520" style={{ position: "absolute", left: x - 200 * s + shake, top: y - 520 * s, ...ink }}>
      {/* 몸 (사슬 갑옷) */}
      <path d="M 70 520 C 70 380 110 320 200 316 C 290 320 330 380 330 520 Z" fill="#5a5e60" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={100 + (i % 10) * 22} cy={370 + Math.floor(i / 10) * 26} r={7} fill="none" stroke="#3a3e40" strokeWidth={3} />)}
      <path d="M 120 330 C 160 350 240 350 280 330 L 270 360 C 230 376 170 376 130 360 Z" fill="#2e6b4f" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${tilt} 200 300)`}>
        {/* 얼굴 */}
        <rect x={176} y={270} width={48} height={50} fill="#d9a77a" stroke={INK} strokeWidth={5} />
        <ellipse cx={200} cy={210} rx={92} ry={100} fill="#d9a77a" stroke={INK} strokeWidth={6} />
        {/* 수염 */}
        <path d="M 120 230 C 130 300 170 318 200 320 C 230 318 270 300 280 230 C 260 262 230 270 200 270 C 170 270 140 262 120 230 Z" fill="#3a2a20" stroke={INK} strokeWidth={4} />
        {/* 눈썹 (안쪽이 치켜 올라감) */}
        <path d={state > 0.5 ? "M 132 158 L 182 136 M 268 158 L 218 136" : "M 134 150 L 180 142 M 266 150 L 220 142"} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        {/* 눈: 떨리는 큰 눈 → 질끈 감은 눈 */}
        {state > 0.5 ? (
          <path d="M 138 182 Q 160 170 182 184 M 218 184 Q 240 170 262 182" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
        ) : (
          <g><ellipse cx={160} cy={182} rx={18} ry={22} fill="#fff" stroke={INK} strokeWidth={4} /><ellipse cx={240} cy={182} rx={18} ry={22} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={160 + shake} cy={190} r={8} fill={INK} /><circle cx={240 + shake} cy={190} r={8} fill={INK} /></g>
        )}
        {/* 눈물 */}
        {state > 0.3 && [0, 1].map((k) => {
          const t = ((f + k * 11) % 26) / 26;
          return <g key={k}><path d={`M ${150 + k * 100} 196 C ${146 + k * 100} 230 ${148 + k * 100} 250 ${144 + k * 100} 270`} stroke="#9cc3dc" strokeWidth={8} fill="none" opacity={0.85} /><ellipse cx={144 + k * 100} cy={270 + t * 60} rx={7} ry={10} fill="#9cc3dc" opacity={1 - t} /></g>;
        })}
        {/* 입: 꽉 다문 → 크게 벌린 절규 */}
        <ellipse cx={200} cy={250} rx={state > 0.5 ? 34 : 22} ry={mouthOpen / 2 + 4} fill="#3a1a14" stroke={INK} strokeWidth={5} />
        {state > 0.5 && <path d={`M 172 ${250 - mouthOpen / 2 + 4} L 228 ${250 - mouthOpen / 2 + 4}`} stroke="#f4efe2" strokeWidth={6} />}
        {/* 투구 (터번을 감은 뾰족 투구) */}
        <path d="M 104 160 C 100 80 150 50 200 48 C 250 50 300 80 296 160 C 260 140 140 140 104 160 Z" fill="#7a7e80" stroke={INK} strokeWidth={6} />
        <path d="M 100 162 C 150 140 250 140 300 162 L 300 186 C 250 166 150 166 100 186 Z" fill="#efe9dc" stroke={INK} strokeWidth={5} />
        <path d="M 186 50 L 200 6 L 214 50 Z" fill="#7a7e80" stroke={INK} strokeWidth={5} />
        {/* 땀 */}
        <path d="M 288 190 q -8 14 0 22 q 8 -8 0 -22" fill="#9cc3dc" />
      </g>
      {/* 활: 겨눈 채 떨림 → 아래로 떨굼 */}
      {state < 0.5 ? (
        <g transform={`translate(70 0) rotate(${shake * 0.6} 200 340)`}>
          <path d="M 250 120 C 380 200 380 420 250 500" stroke={INK} strokeWidth={14} fill="none" />
          <path d="M 250 120 C 380 200 380 420 250 500" stroke="#8a5a32" strokeWidth={8} fill="none" />
          <path d="M 250 120 L 170 310 L 250 500" stroke="#e8e0cc" strokeWidth={3} fill="none" />
          <path d="M 170 310 L 390 300" stroke={INK} strokeWidth={6} />
          <path d="M 390 300 l -26 -12 l 0 24 Z" fill={IRON} />
          <ellipse cx={175} cy={312} rx={26} ry={20} fill="#d9a77a" stroke={INK} strokeWidth={5} />
        </g>
      ) : (
        <g>
          <path d="M 60 470 C 140 500 260 520 360 500" stroke="#8a5a32" strokeWidth={10} fill="none" />
          {/* 머리를 움켜쥔 두 팔 (어깨에서 올라옴) */}
          {[[110, 340, 70, 230, 112, 150], [290, 340, 330, 230, 288, 150]].map(([sx, sy, mx, my, hx, hy], k) => (
            <g key={k} transform={`rotate(${tilt} 200 300)`}>
              <path d={`M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`} stroke={INK} strokeWidth={50} strokeLinecap="round" fill="none" />
              <path d={`M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`} stroke="#5a5e60" strokeWidth={38} strokeLinecap="round" fill="none" />
              <path d={`M ${hx - 26} ${hy - 6} C ${hx - 30} ${hy - 40} ${hx + 30} ${hy - 44} ${hx + 26} ${hy - 6} C ${hx + 20} ${hy + 20} ${hx - 20} ${hy + 20} ${hx - 26} ${hy - 6} Z`} fill="#d9a77a" stroke={INK} strokeWidth={5} />
              {[-12, 0, 12].map((d) => <path key={d} d={`M ${hx + d} ${hy - 30} l 0 14`} stroke={INK} strokeWidth={3} />)}
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};
// 소리 바탕은 장면이 바뀌어도 이어지게 바깥에서 한 번만 (군중: 끌려 나옴부터 끝까지, 행진: 해자로 가는 동안)
const S4: React.FC<ShotProps> = (p) => {
  const a7 = p.at(id(7)), a8 = p.at(id(8));
  return (
    <AbsoluteFill>
      <S4Body {...p} />
      <SFX name="crowd" at={a7 - 6} vol={0.3} dur={p.frames - a7 + 6} fade={20} />
      <SFX name="march" at={a7 + tl(id(6), 4.6)} vol={0.2} dur={a8 - a7 - tl(id(6), 4.6) + 10} fade={20} />
    </AbsoluteFill>
  );
};
const S4Body: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a7 = at(id(7)), a8 = at(id(8));
  const fill = lerp(f, a7 + tl(id(7), 1.0), a8 + tl(id(8), 1.0), 0, 0.7);
  // c3_08 가까이 교차 편집: 겨눔(떨림) → 아래 포로들(울부짖음) → 절규 → 주저앉은 수비병들 + 떨어지는 화살
  const C1 = a8, C2 = a8 + tl(id(8), 2.0), C3 = a8 + tl(id(8), 3.6), C4 = a8 + tl(id(8), 6.0);
  if (f >= C1) {
    const xf = (t0: number) => lerp(f, t0 - 4, t0 + 4, 0, 1);
    let shot: React.ReactNode;
    if (f < C2 + 4) {
      shot = (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: "linear-gradient(#c9d4d6, #e9dfc4)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>{Array.from({ length: 8 }).map((_, i) => <rect key={i} x={i * 260 - 40} y={860} width={160} height={240} fill={SAND_D} stroke={INK} strokeWidth={7} />)}<rect x={-20} y={960} width={1960} height={140} fill={SAND_D} stroke={INK} strokeWidth={7} /></svg>
          <ArcherClose x={860} y={1080} h={1000} f={f} state={0} />
        </AbsoluteFill>
      );
    } else if (f < C3 + 4) {
      // 아래: 성벽을 올려다보며 울부짖는 시민들 (노인·여인·젊은이·아이) - 위에서 내려다본 시점, 두 손을 뻗고 눈물
      shot = (
        <AbsoluteFill style={{ opacity: xf(C2) }}>
          <AbsoluteFill style={{ background: "linear-gradient(#a8895a, #c4a56a)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute" }}>{Array.from({ length: 6 }).map((_, k) => <ellipse key={k} cx={200 + k * 320} cy={1000} rx={150} ry={40} fill="rgba(43,29,20,.2)" />)}</svg>
          <CivClose x={330} y={1180} h={900} f={f} kind="old" i={0} />
          <CivClose x={1590} y={1200} h={880} f={f} kind="woman" i={1} />
          <CivClose x={760} y={1120} h={960} f={f} kind="young" i={2} />
          <CivClose x={1180} y={1160} h={760} f={f} kind="child" i={3} />
        </AbsoluteFill>
      );
    } else if (f < C4 + 4) {
      shot = (
        <AbsoluteFill style={{ opacity: xf(C3) }}>
          <AbsoluteFill style={{ background: "linear-gradient(#8a9aa0, #c9c2ae)" }} />
          <ArcherClose x={960} y={1080} h={1040} f={f} state={1} />
        </AbsoluteFill>
      );
    } else {
      // 성벽 위: 얼굴을 감싸고 주저앉은 수비병, 눈을 감고 쏘는 수비병, 그래도 떨어지는 화살 · 아래에서 머리를 감싼 포로들
      shot = (
        <AbsoluteFill style={{ opacity: xf(C4) }}>
          <AbsoluteFill style={{ background: "linear-gradient(#c9d4d6, #e2d6b8 46%, #b89a64 46%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><rect x={-20} y={420} width={1960} height={80} fill={SAND_D} stroke={INK} strokeWidth={6} />{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-10 + i * 140} y={360} width={80} height={62} fill={SAND_D} stroke={INK} strokeWidth={6} />)}</svg>
          {[[330, 380, "sleeves", true], [860, 420, "hold", false], [1400, 380, "up", false]].map(([x, h, arms, kneel], k) => <Person key={`d${k}`} L={{ robe: "#4a5a5e", dark: "#3a4448", trim: "#2e6b4f", hat: "turban", beard: "full", armor: true, collar: "cross" }} x={x as number} y={440} h={h as number} arms={arms as "up"} eyes="cry" mouth="wail" kneel={kneel as boolean} rot={Math.sin(f / 3 + k) * 3} t={f + k * 7} />)}
          {Array.from({ length: 7 }).map((_, i) => <Person key={`c${i}`} L={CIV[i % 5]} x={150 + i * 270} y={1060 + (i % 2) * 30} h={300} arms="up" eyes="cry" mouth="wail" bow={0.3} rot={Math.sin(f / 4 + i) * 4} t={f + i * 5} />)}
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            {Array.from({ length: 10 }).map((_, i) => { const t = ((f * 1.2 + i * 7) % 26) / 26; const x = 300 + i * 150 - t * 60, y = 460 + t * 480; return <path key={i} d={`M ${x} ${y} l -14 -40`} stroke={INK} strokeWidth={4} opacity={t < 0.95 ? 1 : 0} />; })}
          </svg>
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill>
        {shot}
        <SFX name="war_cry" at={C3} vol={0.35} dur={50} />
        <SFX name="arrows" at={C4} vol={0.3} dur={frames - C4} />
        <SFX name="drum" at={C3} vol={0.25} />
      </AbsoluteFill>
    );
  }
  // 3판 (2026-11-02 사용자: "성에서 끌고 간 것 같지 않아, 민가에서 사람을 결박해 끌고 오고, 모아 가두고, 가둔 곳에서 해자로 내보내야 자연스럽고 극적") - 세 컷
  // A 민가 골목: 몽골 병사가 집 문에서 사람들을 끌어내 손을 묶고 한 줄 밧줄로 엮음 → B 나무 울타리 우리: 묶인 시민들이 갇혀 웅크리고 울음, 창 든 감시병
  // → C 우리 문이 열리고 흙자루·나뭇단을 받아 진 시민들이 줄지어 해자 쪽으로 내몰림 → 해자 장면으로
  const HERD = a7 - 6, PEN = a7 + tl(id(7), 1.9), OUT = a7 + tl(id(7), 4.6), HERD_E = a7 + tl(id(7), 7.2); // 우리 2.7초 · 나오는 장면 2.6초 (2026-11-02 사용자 "1초 더")
  const BOUND: Look[] = CIV;
  if (f >= HERD && f < HERD_E + 6) {
    const xf = (t0: number) => lerp(f, t0 - 6, t0 + 6, 0, 1);
    let shot: React.ReactNode;
    if (f < PEN + 6) {
      const t = f - HERD;
      const line = Array.from({ length: 6 }).map((_, k) => ({ x: 1500 - k * 170 - lerp(t, 10, 70, 0, 260), y: 900 + (k % 2) * 14 }));
      shot = (
        <AbsoluteFill>
          <Cam z={lerp(t, 0, PEN - HERD, 1.08, 1.0)} cx={960} cy={600}>
            <AbsoluteFill style={{ background: "linear-gradient(#d8d0bc, #ece0c4 42%, #c9ad74 42%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              {/* 흙벽돌 민가 골목 */}
              {[[60, 300], [420, 260], [800, 320], [1180, 280], [1560, 300]].map(([x, w], k) => (
                <g key={k}>
                  <rect x={x} y={300 + (k % 2) * 20} width={w} height={300} fill={k % 2 ? "#d8bf8e" : "#ccb07c"} stroke={INK} strokeWidth={6} />
                  <path d={`M ${x - 10} ${300 + (k % 2) * 20} L ${x + w + 10} ${300 + (k % 2) * 20}`} stroke={SAND_DD} strokeWidth={12} />
                  <path d={`M ${x + w * 0.4} 600 L ${x + w * 0.4} ${470 + (k % 2) * 20} C ${x + w * 0.4} ${430 + (k % 2) * 20} ${x + w * 0.62} ${430 + (k % 2) * 20} ${x + w * 0.62} ${470 + (k % 2) * 20} L ${x + w * 0.62} 600 Z`} fill="#2e2018" stroke={INK} strokeWidth={5} />
                  <rect x={x + w * 0.12} y={380 + (k % 2) * 20} width={40} height={40} fill="#3a2e22" stroke={INK} strokeWidth={4} />
                  {k % 2 === 0 && <path d={`M ${x + w * 0.62} 600 L ${x + w * 0.62 + 40} ${470 + (k % 2) * 20} L ${x + w * 0.62 + 40} 600`} fill="#7a5230" stroke={INK} strokeWidth={4} />}
                </g>
              ))}
              {/* 묶은 밧줄: 손과 손을 이음 */}
              <path d={"M " + [[line[0].x + 280, line[0].y - 150], ...line.map((p) => [p.x, p.y - 150])].map((p) => p.join(" ")).join(" L ")} stroke="#7a5a32" strokeWidth={6} fill="none" />
            </svg>
            <Smoke x={300} y={260} f={f} n={2} s={0.7} />
            {/* 집 문에서 끌려 나오는 여인 (몽골 병사가 팔을 잡아끔) */}
            <Person L={BOUND[3]} x={lerp(t, 0, 30, 1260, 1330)} y={640} h={240} arms="up" eyes="cry" mouth="wail" t={f} rot={-8} />
            <Person L={MON} x={lerp(t, 0, 30, 1400, 1470)} y={650} h={260} arms="point" eyes="angry" mouth="flat" flip />
            {/* 손이 묶인 채 한 줄로 끌려가는 사람들 */}
            {line.map((p, k) => <Person key={k} L={BOUND[k % 5]} x={p.x} y={p.y} h={k % 5 === 4 ? 200 : 260} arms="offer" eyes="cry" mouth={k % 2 ? "wail" : "frown"} step={f / 5} bob={Math.abs(Math.sin(f / 5 + k)) * 6} t={f + k * 5} rot={-6} />)}
            <Person L={MON} x={line[0].x + 300} y={910} h={280} arms="hold" eyes="angry" mouth="flat" step={f / 5} />
            <Horse x={180} y={1040} w={360} run={false} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a"><RiderOn L={MON} arms="point" eyes="angry" mouth="flat" t={f} /><Spear x={60} y={-380} len={360} /></Horse>
          </Cam>
        </AbsoluteFill>
      );
    } else if (f < OUT + 6) {
      const t = f - PEN;
      shot = (
        <AbsoluteFill style={{ opacity: xf(PEN) }}>
          <Cam z={lerp(t, 0, OUT - PEN, 1.0, 1.1)} cx={960} cy={580}>
            <AbsoluteFill style={{ background: "linear-gradient(#cfc9b8, #e6dabe 38%, #b89a64 38%)" }} />
            {/* 나무 울타리 우리 (뒤쪽 말뚝) */}
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <ellipse cx={960} cy={720} rx={760} ry={260} fill="#a8895a" />
              {Array.from({ length: 40 }).map((_, k) => { const a = Math.PI + (k / 39) * Math.PI; const x = 960 + Math.cos(a) * 760, y = 720 + Math.sin(a) * 260; return <path key={k} d={`M ${x} ${y} L ${x} ${y - 200}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />; })}
              {Array.from({ length: 40 }).map((_, k) => { const a = Math.PI + (k / 39) * Math.PI; const x = 960 + Math.cos(a) * 760, y = 720 + Math.sin(a) * 260; return <path key={`c${k}`} d={`M ${x} ${y} L ${x} ${y - 200}`} stroke={WOOD} strokeWidth={13} strokeLinecap="round" />; })}
              <path d="M 200 640 C 600 440 1320 440 1720 640" stroke="#6b4f2e" strokeWidth={8} fill="none" />
            </svg>
            {/* 갇혀 웅크린 시민들 */}
            {Array.from({ length: 16 }).map((_, k) => {
              const row = Math.floor(k / 8);
              return <Person key={k} L={BOUND[k % 5]} x={400 + (k % 8) * 150 + row * 70} y={700 + row * 120} h={170 + row * 30} arms={k % 3 === 0 ? "sleeves" : "offer"} eyes="cry" mouth={k % 3 === 1 ? "wail" : "frown"} kneel bow={0.2} t={f + k * 4} rot={Math.sin(f / 5 + k) * 3} />;
            })}
            {/* 앞쪽 말뚝 + 문 + 감시병 */}
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              {Array.from({ length: 34 }).map((_, k) => { const a = (k / 33) * Math.PI; const x = 960 + Math.cos(a) * 760, y = 720 + Math.sin(a) * 260; if (Math.abs(x - 960) < 120 && y > 900) return null; return <g key={k}><path d={`M ${x} ${y + 60} L ${x} ${y - 170}`} stroke={INK} strokeWidth={26} strokeLinecap="round" /><path d={`M ${x} ${y + 60} L ${x} ${y - 170}`} stroke={WOOD} strokeWidth={16} strokeLinecap="round" /></g>; })}
              <path d="M 160 820 C 560 1010 1360 1010 1760 820" stroke="#6b4f2e" strokeWidth={9} fill="none" />
              {/* 우리 문 (닫힘) */}
              <rect x={850} y={830} width={220} height={190} fill="#7a5230" stroke={INK} strokeWidth={6} />
              {[880, 930, 990, 1040].map((x) => <path key={x} d={`M ${x} 830 L ${x} 1020`} stroke="#5a3a24" strokeWidth={8} />)}
              <path d="M 850 920 L 1070 920" stroke="#5a3a24" strokeWidth={10} />
            </svg>
            {[[700, 1060], [1240, 1060]].map(([x, y], k) => <Person key={`g${k}`} L={MON} x={x} y={y} h={330} arms="hold" eyes="angry" mouth="flat" flip={k === 1}><Spear x={222} y={300} len={420} /></Person>)}
          </Cam>
        </AbsoluteFill>
      );
    } else {
      // 우리 문이 열리고 흙짐을 받아 진 시민들이 해자 쪽으로 내몰림
      const t = f - OUT;
      const gate = lerp(t, 0, 14, 0, 1, true);
      shot = (
        <AbsoluteFill style={{ opacity: xf(OUT) }}>
          <AbsoluteFill style={{ background: "linear-gradient(#cfc9b8, #e6dabe 38%, #b89a64 38%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {Array.from({ length: 14 }).map((_, k) => <g key={k}><path d={`M ${80 + k * 60} 700 L ${80 + k * 60} 470`} stroke={INK} strokeWidth={26} strokeLinecap="round" /><path d={`M ${80 + k * 60} 700 L ${80 + k * 60} 470`} stroke={WOOD} strokeWidth={16} strokeLinecap="round" /></g>)}
            <g transform={`translate(920 470) rotate(${gate * -70} 0 230)`}><rect x={0} y={0} width={200} height={230} fill="#7a5230" stroke={INK} strokeWidth={6} />{[30, 80, 130, 170].map((x) => <path key={x} d={`M ${x} 0 L ${x} 230`} stroke="#5a3a24" strokeWidth={8} />)}</g>
            {/* 흙더미·나뭇단 무더기 */}
            <path d="M 1300 720 C 1360 600 1560 600 1620 720 Z" fill="#9a7a4e" stroke={INK} strokeWidth={5} />
            {[0, 1, 2].map((k) => <path key={k} d={`M 1660 ${700 - k * 20} L 1880 ${690 - k * 20}`} stroke={WOOD} strokeWidth={20} strokeLinecap="round" />)}
          </svg>
          {Array.from({ length: 10 }).map((_, k) => {
            const u = k01((t - k * 5) / 60);
            if (u <= 0) return null;
            return <Captive key={k} x={980 + u * 900 - k * 20} y={760 + u * 300 + (k % 2) * 20} s={0.9 + u * 0.4} f={f} i={k} load={k % 3 ? "sack" : "wood"} />;
          })}
          {[[760, 820], [1300, 1060]].map(([x, y], k) => <Person key={`g${k}`} L={MON} x={x} y={y} h={330} arms="point" eyes="angry" mouth="o" flip={k === 1}><Spear x={222} y={300} len={420} /></Person>)}
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill>
        {shot}
        <SFX name="gate" at={OUT} vol={0.35} dur={30} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, a8, 1.0, 1.1)} cx={960} cy={560}>
        <AbsoluteFill style={{ background: "#c4a56a" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 성벽 (위쪽, 비스듬히) */}
          <path d="M -20 0 L 1940 0 L 1940 300 L -20 300 Z" fill={SAND_D} stroke={INK} strokeWidth={7} />
          {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M -20 ${40 + i * 44} L 1940 ${40 + i * 44}`} stroke={SAND_DD} strokeWidth={4} opacity={0.6} />)}
          {Array.from({ length: 16 }).map((_, i) => <rect key={`m${i}`} x={-10 + i * 124} y={270} width={70} height={46} fill={SAND} stroke={INK} strokeWidth={5} />)}
          <path d="M -20 316 L 1940 316 L 1940 360 L -20 360 Z" fill="#a8895a" />
          {/* 해자: 넓고 깊음 */}
          <path d={`M -20 360 L 1940 360 L 1940 ${MOAT_Y + 200} L -20 ${MOAT_Y + 200} Z`} fill="#4f7a92" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 10 }).map((_, i) => <path key={`w${i}`} d={`M ${((i * 230 + f * 1.5) % 2100) - 100} ${420 + (i % 3) * 50} l 70 0`} stroke="#8fb5c9" strokeWidth={4} />)}
          {/* 메워지는 흙 (아래 둑에서 위로) */}
          <path d={`M -20 ${MOAT_Y + 200} L 1940 ${MOAT_Y + 200} L 1940 ${MOAT_Y + 200 - fill * 300} C 1400 ${MOAT_Y + 220 - fill * 330} 600 ${MOAT_Y + 180 - fill * 300} -20 ${MOAT_Y + 200 - fill * 290} Z`} fill="#9a7a4e" stroke={INK} strokeWidth={5} />
          <path d={`M -20 ${MOAT_Y + 200} L 1940 ${MOAT_Y + 200} L 1940 ${MOAT_Y + 240} L -20 ${MOAT_Y + 240} Z`} fill="#7a5e38" />
        </svg>
        {/* 성벽 위 수비병 */}
        {Array.from({ length: 12 }).map((_, i) => <Spearman key={i} x={70 + i * 160} y={280} s={0.2} spear={40} />)}
        {/* 포로 행렬: 아래에서 해자로 끝없이 */}
        {f > HERD_E - 20 && Array.from({ length: 16 }).map((_, i) => {
          const u = ((f - a7 + 10) * 0.006 + (i % 8) / 8) % 1;
          const lane = Math.floor(i / 8);
          const x = 240 + lane * 900 + (i % 8) * 50 + Math.sin(u * 4) * 30;
          const y = 1180 - u * 420;
          return <Captive key={i} x={x} y={y} s={0.95 - u * 0.25} f={f} i={i} load={i % 3 ? "sack" : "wood"} />;
        })}
        {/* 뒤에서 모는 몽골 기병 */}
        {f > a7 && [[100, 1000], [860, 1020], [1700, 1000]].map(([x, y], i) => (
          <Horse key={i} x={x} y={y} w={320} run={false} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a" flip={i === 2}>
            <RiderOn L={MON} arms="point" eyes="angry" mouth="flat" t={f} />
            <Spear x={60} y={-380} len={360} />
          </Horse>
        ))}
      </Cam>
      {/* 해자 단면 (구석) */}
      <svg width={420} height={240} style={{ position: "absolute", right: 40, top: 40, ...ink, opacity: lerp(f, 20, 34, 0, 1) * lerp(f, a7, a7 + 10, 1, 0) }}>
        <rect x={0} y={0} width={420} height={240} rx={10} fill="#efe2c4" stroke={INK} strokeWidth={6} />
        <path d="M 20 70 L 120 70 L 160 200 L 260 200 L 300 70 L 400 70" fill="none" stroke={INK} strokeWidth={6} />
        <path d="M 134 110 L 286 110 L 260 200 L 160 200 Z" fill="#5f93b8" />
        <rect x={330} y={10} width={60} height={60} fill={SAND_D} stroke={INK} strokeWidth={4} />
        <path d="M 210 80 L 210 190" stroke="#c0392b" strokeWidth={5} /><path d="M 200 90 L 210 76 L 220 90 M 200 180 L 210 194 L 220 180" stroke="#c0392b" strokeWidth={5} fill="none" />
      </svg>

    </AbsoluteFill>
  );
};

// ================= 5) c3_09~10 성채 성벽이 돌에 맞아 무너짐, 초록 깃발이 쓰러지고 흰 툭 → 지도: 다음 도시들에 불빛 =================
const S5: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a10 = at(id(10));
  const HITS = [8, 26, 44];
  const fall = lerp(f, 52, 80, 0, 1);
  const map = lerp(f, a10 - 6, a10 + 10, 0, 1);
  return (
    <AbsoluteFill>
      {/* 3판 (2026-11-03): 4장 카드를 빼서 장 경계가 비어 무음 → 장 끝까지 바람을 깖 (check-bgm-cut 6:53) */}
      <SFX name="wind" at={0} vol={0.25} dur={frames} fade={15} />
      {map < 1 && (
        <AbsoluteFill style={{ opacity: 1 - map }}>
          <Cam z={lerp(f, 0, a10, 1.0, 1.08)} cx={960} cy={500} sx={f > 50 && f < 80 ? Math.sin(f) * 6 : 0}>
            <AbsoluteFill style={{ background: "linear-gradient(#cfd8d8, #efe4c8 60%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M 260 1080 C 400 640 1520 640 1660 1080 Z" fill="#c4a56a" stroke={INK} strokeWidth={6} />
              <path d="M 440 700 L 440 330 L 1480 330 L 1480 700 Z" fill={SAND_D} stroke={INK} strokeWidth={7} />
              {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={446 + i * 64} y={300} width={38} height={32} fill={SAND_D} stroke={INK} strokeWidth={5} />)}
              {Array.from({ length: 8 }).map((_, i) => <path key={`r${i}`} d={`M 440 ${370 + i * 44} L 1480 ${370 + i * 44}`} stroke={SAND_DD} strokeWidth={3} opacity={0.5} />)}
              {/* 금 → 무너지는 덩어리 */}
              {f > HITS[0] && <path d="M 900 380 l 30 60 l -20 40 l 40 70" stroke={INK} strokeWidth={6} fill="none" />}
              {f > HITS[1] && <path d="M 1000 360 l -40 80 l 30 40 l -20 90" stroke={INK} strokeWidth={6} fill="none" />}
              {Array.from({ length: 7 }).map((_, i) => {
                const gx = 860 + (i % 4) * 60, gy = 360 + Math.floor(i / 4) * 90;
                return <path key={`ch${i}`} d={`M ${gx} ${gy} l 56 0 l 0 84 l -56 0 Z`} fill={SAND_D} stroke={INK} strokeWidth={5} transform={`translate(${fall * (i - 3) * 30} ${fall * fall * (300 + i * 40)}) rotate(${fall * (i % 2 ? 40 : -30)} ${gx + 28} ${gy + 42})`} opacity={1 - fall * 0.3} />;
              })}
              {fall > 0.05 && <path d="M 860 360 L 1100 360 L 1100 540 L 860 540 Z" fill="#3a2e22" opacity={fall} />}
            </svg>
            {Array.from({ length: 9 }).map((_, i) => <Spearman key={i} x={500 + i * 110} y={306} s={0.2} spear={-20} />)}
            <div style={{ position: "absolute", inset: 0, transform: `rotate(${fall * 70}deg)`, transformOrigin: "960px 300px", opacity: 1 - fall * 0.6 }}><KhFlag x={960} y={300} h={200} /></div>
            {fall > 0.6 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - lerp(f, 80, 110, 0, 1, true)) * 300}px)` }}><Tug x={1300} y={330} h={300} sway={Math.sin(f / 8) * 6} /></div>}
            {HITS.map((h, i) => (f > h && f < h + 26 ? <Dust key={i} x={900 + i * 60} y={420} t={(f - h) / 26} r={140} color="#c9b48a" /> : null))}
            {fall > 0 && <Dust x={980} y={700} t={fall} r={260} color="#c9b48a" />}
          </Cam>
          {HITS.map((h, i) => <SFX key={i} name="catapult_hit" at={h} vol={0.45} dur={30} />)}
          <SFX name="rumble" at={52} vol={0.5} dur={50} />
          <SFX name="war_horn" at={82} vol={0.3} dur={60} />
        </AbsoluteFill>
      )}
      {map > 0 && (
        <AbsoluteFill style={{ opacity: map }}>
          <MapShot f={f} st={{ split: 1, cut: 1 }} z={lerp(f, a10, frames, MAP_C.z + 0.2, MAP_C.z - 0.1)} cx={MAP_C.cx} cy={MAP_C.cy} />
          <MapCam z={lerp(f, a10, frames, MAP_C.z + 0.2, MAP_C.z - 0.1)} cx={MAP_C.cx} cy={MAP_C.cy}>
            {KH_CITIES.map(([x, y], i) => <Glow key={i} x={x} y={y - 10} r={130} color="#ffd27a" op={lerp(f, a10 + 20 + i * 8, a10 + 34 + i * 8, 0, 0.8) * (0.7 + 0.3 * Math.sin(f / 5 + i))} />)}
          </MapCam>
          <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 20, frames, 0, 1) }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// 카드를 뺀 장(NO_CARD)의 첫 장면: 0프레임부터 끝까지 바닥 소리 - 장 경계 무음 방지 (2026-11-03, check-draft)
const S1: React.FC<ShotProps> = (p) => {
  const { frames } = p;
  return (
    <AbsoluteFill>
      <S1Body {...p} />
      <SFX name="wind" at={0} vol={0.2} dur={frames} fade={8} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: [id(1), id(2)], Shot: S1 },
  { ids: [id(3), id(4)], Shot: S2 },
  { ids: [id(5)], Shot: S3 },
  { ids: [id(6), id(7), id(8)], Shot: S4 },
  { ids: [id(9), id(10)], Shot: S5 },
];
export const M02Ch3 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m2.3" year="1220" groups={groups} music="siege" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void SAND; void rnd; void Rider; void FPS;
