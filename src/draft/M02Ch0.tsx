// 몽골 2편 훅 1판 (2026-11-02) - 대본 episodes/mongol-02/script-ko.md "## 0. 훅" (c0_01~c0_06, kit에서는 m2.c0_01…)
// 사용자: "25초만큼은 영상 퀄리티가 좋아야 해, 그림이 많고 풍부해야 해" (1편 금나라 중도를 웅장하게, 도망 행렬을 길게 했을 때처럼)
// 흐름: 지도에서 호라즘 도시들이 켜짐 → 성벽 도시 파노라마(수비병·깃발) → 몰려오는 몽골 기병 → 올려다본 까마득한 성벽
//   → 지도 깃발이 차례로 쓰러짐 → 불타는 도시 앞 언덕의 기병 → 방법 미리보기 3컷(줄 당기는 투석기·흙짐 진 포로·펠트 인형) → 흰 툭 + "2"
// 2편 방향(plan.md): 방법론만, 꾸민 정리 문장·인물 대사 없음
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { BigNum, Chapter, clamp, Dim, ease, FPS, Glow, Group, INK, Lang, LangContext, Rider, SFX, ShotProps, Steppe, Tug, tl } from "./kit";
import { Trebuchet as Treb } from "./M02Ch3";
import { GateOpen } from "./M02Ch4";
import { Cam, Dust, HC, Horse, Look, MON, PORTER, Person, RiderOn, Smoke, Spear, walkBob } from "./M01Ch4";
import { KH_CITIES, KhFlag, MapBoard, MapCam, MX, MY, Spearman } from "./M01Ch5";

const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
const sec = (s: number) => Math.round(s * FPS);
const id = (n: number) => `m2.c0_0${n}`;

// 호라즘 성벽 도시 그림은 M02City.tsx로 옮김
import { City, Dome, Minaret, SAND, SAND_D, SAND_DD, WALL_TOP } from "./M02City";
export * from "./M02City";

// ================= 1) c0_01 지도 (5판 2026-11-03 사용자: "호라즘은 지금의 00나라, 중앙아시아의 이슬람 국가였습니다")
// 넓은 지도 → "호라즘은"에 호라즘 땅이 번짐 → "우즈베키스탄에서 이란에 걸친"에 카메라가 북동(우즈베키스탄)에서 남서(이란)로 훑음
// → "중앙아시아의"에 도시마다 불 → "이슬람 나라였습니다"에 도시마다 둥근 지붕·첨탑이 솟음. 목소리 쉼 자리(c0_01.wav): 2.5 / 3.5~5.7 / 6.5 / 7.8초
const Mosque = ({ x, y, pop }: { x: number; y: number; pop: number }) => (
  <svg width={240} height={240} viewBox="-120 -200 240 240" style={{ position: "absolute", left: x - 120, top: y - 200, overflow: "visible", transform: `scale(${pop})`, transformOrigin: "50% 83%" }}>
    <ellipse cx={0} cy={6} rx={78} ry={12} fill="rgba(43,29,20,0.28)" />
    <Minaret x={-58} base={4} h={120} w={26} />
    <Minaret x={58} base={4} h={120} w={26} />
    <Dome x={0} y={-6} r={48} />
  </svg>
);
const H1: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const KH = tl(id(1), 2.5), UZ = tl(id(1), 3.5), IR = tl(id(1), 5.7), CA = tl(id(1), 6.5), ISL = tl(id(1), 7.8);
  const kh = lerp(f, KH, KH + 45, 0.05, 1, true);
  const z = f < UZ ? lerp(f, 0, UZ, 0.75, 0.95, true) : f < IR ? lerp(f, UZ, IR, 0.95, 1.15, true) : f < CA + 10 ? lerp(f, IR, CA + 10, 1.15, 0.9, true) : lerp(f, CA + 10, frames, 0.9, 1.08, true);
  const cx = f < UZ ? lerp(f, 0, UZ, MX(60), MX(65), true) : f < IR ? lerp(f, UZ, IR, MX(65), MX(54), true) : lerp(f, IR, CA + 10, MX(54), MX(61), true);
  const cy = f < UZ ? lerp(f, 0, UZ, MY(40), MY(41.5), true) : f < IR ? lerp(f, UZ, IR, MY(41.5), MY(34.5), true) : lerp(f, IR, CA + 10, MY(34.5), MY(38.5), true);
  return (
    <AbsoluteFill style={{ background: "#c3cbbd" }}>
      <MapCam z={z} cx={cx} cy={cy}>
        <MapBoard kh={kh} mg={0.5} />
        {KH_CITIES.map(([x, y], i) => {
          const pop = spring({ frame: f - CA - i * 5, fps: FPS, config: { damping: 11, stiffness: 140 } });
          const mq = spring({ frame: f - ISL - i * 4, fps: FPS, config: { damping: 10, stiffness: 120 } });
          return (
            <React.Fragment key={i}>
              <Glow x={x} y={y} r={120} color="#ffd27a" op={0.75 * pop} />
              {mq > 0.01 && <Mosque x={x} y={y + 10} pop={mq * 0.62} />}
              {pop > 0.01 && <KhFlag x={x + 52} y={y} h={110} pop={pop} />}
            </React.Fragment>
          );
        })}
      </MapCam>
      <SFX name="wind" at={0} vol={0.2} dur={frames} fade={20} />
      {KH_CITIES.map((_, i) => <SFX key={i} name="tick" at={CA + i * 5} vol={0.1} dur={10} />)}
    </AbsoluteFill>
  );
};

// ================= 2) c0_02 앞 조각 "큰 도시마다 두른 높은 성벽은," 성벽 도시 파노라마: 가까이에서 뒤로 빠지며 끝없이 늘어선 수비병 =================
const H2: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.55, 1.0, true)} cx={lerp(f, 0, frames, 980, 960, true)} cy={lerp(f, 0, frames, 520, 540, true)}>
        <City f={f} />
      </Cam>
      <SFX name="crowd" at={0} vol={0.12} dur={frames} />
      <SFX name="war_horn" at={sec(2.2)} vol={0.18} dur={sec(3)} />
    </AbsoluteFill>
  );
};

// ================= 3) c0_03 몰려오는 몽골 기병 → 아래에서 올려다본 까마득한 성벽 =================
const H3: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const cut = at(id(2)) + tl(id(2), 3.1); // "/ 말을 탄 몽골 기병을" (c0_02.wav 쉼 2.56~3.39초)
  if (f < cut) return <H2 frames={cut} at={at} />;
  // 올려다본 성벽 (2026-11-02 사용자 2차: "말이 계속 보인 채로 줌아웃하며 멀어져야 말 크기는 그대로인데 성은 커 보이지")
  // 앞의 큰 몽골 기병은 화면에 고정, 뒤의 성벽 판(높이 2200)만 0.3배 → 0.49배(화면 꼭대기까지)로 커짐 - 땅선(아래 가운데) 기준
  const t = f - cut;
  const d = frames - cut;
  const H = 2200;
  const g = lerp(t, 0, d - 6, 0, 1, true);
  const k = lerp(g, 0, 1, 0.22, 0.43); // 끝에서 성벽 꼭대기 수비병이 화면 위 끝에 걸림
  const GROUND = 1000;
  return (
    <AbsoluteFill style={{ opacity: lerp(t, 0, 8, 0, 1), background: "linear-gradient(#bcd0d6, #efe4c8 70%)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}><rect x={0} y={GROUND} width={1920} height={200} fill="#cdb07a" /></svg>
      <div style={{ position: "absolute", left: 960 - 960, top: GROUND - H, width: 1920, height: H, transform: `scale(${k})`, transformOrigin: "50% 100%" }}>
        <svg width={1920} height={H} style={{ position: "absolute", ...ink }}>
          {/* 양옆으로 끝없이 이어지는 벽 */}
          <path d={`M -3000 ${H} L -3000 700 L 300 700 L 300 ${H} Z`} fill={SAND_D} stroke={INK} strokeWidth={8} />
          <path d={`M 1620 ${H} L 1620 700 L 4900 700 L 4900 ${H} Z`} fill={SAND_D} stroke={INK} strokeWidth={8} />
          {Array.from({ length: 70 }).map((_, i) => <rect key={`wm${i}`} x={-3000 + i * 112} y={666} width={52} height={36} fill={SAND_D} stroke={INK} strokeWidth={5} />)}
          {/* 양쪽 큰 망루 */}
          <path d={`M -60 ${H} L 520 ${H} L 470 40 L 20 40 Z`} fill={SAND} stroke={INK} strokeWidth={8} />
          <path d={`M 1400 ${H} L 1980 ${H} L 1900 40 L 1450 40 Z`} fill={SAND} stroke={INK} strokeWidth={8} />
          {/* 가운데 성문 벽 */}
          <path d={`M 470 ${H} L 1450 ${H} L 1450 150 L 470 150 Z`} fill={SAND_D} stroke={INK} strokeWidth={8} />
          {Array.from({ length: 19 }).map((_, i) => <path key={i} d={`M -3000 ${760 + i * 76} L 4900 ${760 + i * 76}`} stroke={SAND_DD} strokeWidth={4} opacity={0.5} />)}
          {Array.from({ length: 8 }).map((_, i) => <path key={`c${i}`} d={`M 470 ${220 + i * 70} L 1450 ${220 + i * 70}`} stroke={SAND_DD} strokeWidth={4} opacity={0.5} />)}
          {Array.from({ length: 14 }).map((_, i) => <rect key={`m${i}`} x={480 + i * 68} y={116} width={38} height={36} fill={SAND_D} stroke={INK} strokeWidth={5} />)}
          {[0, 1].map((q) => Array.from({ length: 6 }).map((_, i) => <rect key={`tm${q}${i}`} x={(q ? 1450 : 20) + i * 80} y={6} width={40} height={36} fill={SAND} stroke={INK} strokeWidth={5} />))}
          {Array.from({ length: 12 }).map((_, i) => <path key={`s${i}`} d={`M ${600 + (i % 4) * 240} ${380 + Math.floor(i / 4) * 480} l 0 80`} stroke="#2e2018" strokeWidth={16} strokeLinecap="round" />)}
          {[245, 1690].map((x) => [400, 900, 1400].map((y) => <path key={`ts${x}${y}`} d={`M ${x} ${y} l 0 90`} stroke="#2e2018" strokeWidth={18} strokeLinecap="round" />))}
          <path d={`M 790 ${H} L 790 ${H - 420} C 800 ${H - 560} 1120 ${H - 560} 1130 ${H - 420} L 1130 ${H} Z`} fill="#2e2018" stroke={INK} strokeWidth={8} />
        </svg>
        {Array.from({ length: 15 }).map((_, i) => <Spearman key={i} x={495 + i * 68} y={122} s={0.3} spear={10 + Math.sin(f / 15 + i) * 5} />)}
        {[0, 1].map((q) => Array.from({ length: 5 }).map((_, i) => <Spearman key={`t${q}${i}`} x={(q ? 1480 : 50) + i * 80} y={12} s={0.3} spear={-10} />))}
        {[245, 960, 1690].map((x, i) => <KhFlag key={x} x={x} y={i === 1 ? 118 : 8} h={260} dir={i % 2 ? 1 : -1} />)}
      </div>
      {/* 앞: 큰 몽골 기병 - 화면 크기 그대로 */}
      <Horse x={330} y={1060} w={620} run={false} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a">
        <RiderOn L={MON} arms="hold" eyes="wide" mouth="o" t={f} />
        <Spear x={60} y={-380} len={360} />
      </Horse>
      <SFX name="neigh" at={2} vol={0.25} dur={40} />
      <SFX name="wind" at={0} vol={0.25} dur={d} />
    </AbsoluteFill>
  );
};

// ================= 4) c0_04 지도 깃발이 차례로 쓰러짐 → 불타는 도시 앞 언덕에 늘어선 몽골 기병 =================
const H4: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const cut = tl(id(3), 2.1);
  if (f < cut) {
    return (
      <AbsoluteFill style={{ background: "#c3cbbd" }}>
        <MapCam z={lerp(f, 0, cut, 1.0, 1.12)} cx={MX(62)} cy={MY(39)}>
          <MapBoard kh={1} mg={0.5} />
          {KH_CITIES.map(([x, y], i) => {
            const fall = lerp(f, 6 + i * 7, 18 + i * 7, 0, 1, true);
            return (
              <React.Fragment key={i}>
                {fall > 0.3 && <Smoke x={x} y={y} f={f * 2 + i * 13} n={3} s={0.5} />}
                <KhFlag x={x + 30} y={y} h={120} fall={fall} dir={i % 2 ? 1 : -1} />
              </React.Fragment>
            );
          })}
        </MapCam>
        {KH_CITIES.map((_, i) => <SFX key={i} name="impact" at={14 + i * 7} vol={0.12} dur={14} />)}
      </AbsoluteFill>
    );
  }
  const t = f - cut;
  return (
    <AbsoluteFill style={{ opacity: lerp(t, 0, 8, 0, 1) }}>
      <Cam z={lerp(t, 0, frames - cut, 1.0, 1.1)} cx={960} cy={600}>
        <City f={f} burn={1} />
        {/* 앞 언덕 (검은 실루엣) + 줄지어 선 기병 */}
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -40 1100 L -40 930 C 300 880 700 900 1000 950 C 1300 990 1600 900 1960 920 L 1960 1100 Z" fill="#1d1612" />
        </svg>
        {Array.from({ length: 12 }).map((_, i) => <Rider key={i} kind={i % 3 ? "mongol" : "mongol2"} x={-60 + i * 170} y={760 + Math.sin(i * 1.7) * 20} w={230} still dark />)}
        {[200, 860, 1500].map((x, i) => <Tug key={x} x={x} y={940} h={360} color="#1d1612" sway={Math.sin((f + i * 9) / 12) * 5} />)}
      </Cam>
      <SFX name="fire" at={0} vol={0.3} dur={frames - cut} />
    </AbsoluteFill>
  );
};

// ================= 5) c0_05 방법 미리보기 3컷 =================
// 5a 줄 당기는 투석기 (견인식): 긴 팔 끝 투석 주머니에 돌, 짧은 팔 끝 밧줄을 수십 명이 신호에 맞춰 당김 → 긴 팔이 휘며 돌이 날아감
const PIV = [820, 520];
const LONG = 560;
const SHORT = 210;
const MON_B: Look = { ...MON, robe: "#6a5a44", dark: "#4f4232" };
const Trebuchet = ({ f }: { f: number }) => {
  const pull = spring({ frame: f - 14, fps: FPS, config: { damping: 18, stiffness: 70 } });
  const a = ((140 + pull * 150) * Math.PI) / 180; // 긴 팔 방향 (140° 왼쪽 아래 → 290° 위)
  const le = [PIV[0] + LONG * Math.cos(a), PIV[1] + LONG * Math.sin(a)];
  const se = [PIV[0] - SHORT * Math.cos(a), PIV[1] - SHORT * Math.sin(a)];
  const relA = ((140 + 0.72 * 150) * Math.PI) / 180;
  const released = pull > 0.72;
  // 놓는 순간의 위치·속도로 날아감
  const r0 = [PIV[0] + LONG * Math.cos(relA), PIV[1] + LONG * Math.sin(relA)];
  const tRel = f - 14 - 16;
  const tt = Math.max(0, tRel);
  const stone = released ? [r0[0] + 52 * tt, r0[1] - 40 * tt + 1.6 * tt * tt] : [le[0] + 30 * Math.cos(a + 0.9), le[1] + 30 * Math.sin(a + 0.9) + 40];
  const pullers = Array.from({ length: 16 }).map((_, i) => ({ x: 1080 + (i % 8) * 92 + (i >= 8 ? 46 : 0), y: i >= 8 ? 1010 : 960, k: i >= 8 ? 1.05 : 0.92 }));
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {/* 받침 (A자 틀) */}
        <path d={`M ${PIV[0] - 190} 980 L ${PIV[0]} ${PIV[1]} L ${PIV[0] + 190} 980`} stroke={INK} strokeWidth={30} fill="none" />
        <path d={`M ${PIV[0] - 190} 980 L ${PIV[0]} ${PIV[1]} L ${PIV[0] + 190} 980`} stroke="#8a6440" strokeWidth={20} fill="none" />
        <path d={`M ${PIV[0] - 120} 800 L ${PIV[0] + 120} 800`} stroke={INK} strokeWidth={16} />
        <path d={`M ${PIV[0] - 120} 800 L ${PIV[0] + 120} 800`} stroke="#8a6440" strokeWidth={9} />
        {/* 밧줄 다발: 짧은 팔 끝 → 당기는 사람들 손 */}
        {pullers.map((p, i) => <path key={i} d={`M ${se[0]} ${se[1]} L ${p.x - 30 + pull * 16} ${p.y - 170 * p.k}`} stroke="#6b4f2e" strokeWidth={3} />)}
        {/* 팔 */}
        <path d={`M ${se[0]} ${se[1]} L ${le[0]} ${le[1]}`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
        <path d={`M ${se[0]} ${se[1]} L ${le[0]} ${le[1]}`} stroke="#9a7048" strokeWidth={20} strokeLinecap="round" />
        <circle cx={PIV[0]} cy={PIV[1]} r={18} fill="#5a3a24" stroke={INK} strokeWidth={5} />
        {/* 주머니 줄 + 돌 */}
        {!released && <path d={`M ${le[0]} ${le[1]} L ${stone[0]} ${stone[1]}`} stroke="#6b4f2e" strokeWidth={4} />}
        {released && tt > 0 && <path d={`M ${stone[0]} ${stone[1]} L ${stone[0] - 52 * 3} ${stone[1] + (40 - 3.2 * tt) * 3}`} stroke="#8a8478" strokeWidth={10} opacity={0.35} strokeLinecap="round" />}
        {stone[1] < 1200 && <circle cx={stone[0]} cy={stone[1]} r={30} fill="#8a8478" stroke={INK} strokeWidth={5} />}
      </svg>
      {pullers.map((p, i) => <Person key={i} L={i % 3 ? PORTER : MON_B} x={p.x + pull * 22} y={p.y} h={250 * p.k} arms="hold" eyes={pull > 0.2 ? "shut" : "dot"} mouth={pull > 0.2 ? "grin" : "flat"} rot={-pull * 14} />)}
      <Person L={MON} x={250} y={990} h={290} arms={f < 14 ? "up" : "point"} eyes="angry" mouth={f < 18 ? "o" : "flat"} />
    </>
  );
};
// 5b 흙짐을 진 포로 행렬이 해자로 끝없이 → 해자가 차오름, 뒤에서 몽골 기병이 몰고 성벽 위에서 화살이 쏟아짐
const CAPT: Look[] = [
  { ...PORTER, robe: "#8a7a5a" },
  { ...PORTER, robe: "#7a6a5a", dark: "#5e5244" },
  { ...PORTER, robe: "#9a8a6a", dark: "#7a6c52" },
  { ...PORTER, robe: "#6e6a5a", dark: "#56524a" },
];
const Captives = ({ f, d }: { f: number; d: number }) => {
  const fill = lerp(f, 0, d, 0.15, 0.7);
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(#d9cfb4, #efe4c8 50%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <rect x={-40} y={700} width={2000} height={420} fill="#cdb07a" />
        {/* 성벽 (오른쪽) */}
        <path d="M 1560 140 L 1960 140 L 1960 900 L 1520 900 Z" fill={SAND_D} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={1560 + i * 52} y={110} width={30} height={32} fill={SAND_D} stroke={INK} strokeWidth={5} />)}
        {Array.from({ length: 14 }).map((_, i) => <path key={`r${i}`} d={`M 1530 ${190 + i * 52} L 1960 ${190 + i * 52}`} stroke={SAND_DD} strokeWidth={3} opacity={0.6} />)}
        {/* 해자: 흙이 쌓이며 차오름 */}
        <path d="M 1180 900 L 1520 900 L 1490 1080 L 1210 1080 Z" fill="#5f7f92" stroke={INK} strokeWidth={5} />
        <path d={`M 1195 ${1080 - 180 * fill} L 1505 ${1080 - 180 * fill} L 1490 1080 L 1210 1080 Z`} fill="#9a7a4e" stroke={INK} strokeWidth={4} />
      </svg>
      {/* 성벽 위 수비병 + 쏟아지는 화살 */}
      {Array.from({ length: 7 }).map((_, i) => <Spearman key={i} x={1590 + i * 52} y={116} s={0.14} spear={50} />)}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const t = ((f * 1.4 + i * 19) % 40) / 40;
          const x0 = 1580 + (i % 7) * 50, y0 = 150;
          const x = x0 - t * (300 + (i % 5) * 120), y = y0 + t * 760;
          return <path key={i} d={`M ${x} ${y} L ${x + 26} ${y - 66}`} stroke={INK} strokeWidth={4} opacity={t < 0.95 ? 1 : 0} />;
        })}
      </svg>
      {/* 뒤에서 모는 몽골 기병 */}
      <Horse x={110 + Math.sin(f / 20) * 14} y={860} w={340} run={false} coat="#5a4a3e" dark="#3e3229" mane="#1e1712" saddle="#a8332a">
        <RiderOn L={MON} arms="point" eyes="angry" mouth="flat" t={f} />
        <Spear x={60} y={-380} len={360} />
      </Horse>
      {/* 포로 행렬: 왼쪽에서 해자로, 흙자루를 머리에 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const u = ((f * 0.008 + i / 12) % 1);
        const x = -160 + u * 1360; // 화면 밖 왼쪽 → 해자 가장자리(1200)
        const sink = lerp(u, 0.9, 1, 0, 1); // 해자에 닿으면 흙을 쏟고 비탈 아래로
        const y = 1000 - (i % 2) * 26 + sink * 140;
        return (
          <React.Fragment key={i}>
            <Person L={CAPT[i % 4]} x={x} y={y} h={260} arms="up" eyes="worry" mouth="frown" bob={walkBob(f + i * 4, true)} rot={4} op={1 - sink} />
            <svg width={190} height={110} viewBox="-60 -35 120 70" style={{ position: "absolute", left: x - 95, top: y - 330 - walkBob(f + i * 4, true), opacity: 1 - sink, ...ink }}>
              <path d="M -54 20 C -60 -20 -20 -32 0 -30 C 30 -32 60 -18 54 20 Z" fill="#a8895a" stroke={INK} strokeWidth={5} />
              <path d="M -20 -26 L -10 20 M 22 -26 L 14 20" stroke="#7a5a38" strokeWidth={4} />
            </svg>
          </React.Fragment>
        );
      })}
    </>
  );
};
// 5c 펠트 인형: 빈 말 안장에 펠트 인형을 앉힘 → 뒤로 빠지면 지평선까지 인형을 태운 말들 (노을, 멀리서 보면 대군)
const Dummy = ({ x = 50, y = -246, s = 1 }: { x?: number; y?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 0 L -40 -150 C -40 -176 40 -176 40 -150 L 34 0 Z" fill="#c8b48a" stroke={INK} strokeWidth={6} />
    <path d="M -40 -130 L -96 -96 M 40 -130 L 96 -96" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d="M -40 -130 L -96 -96 M 40 -130 L 96 -96" stroke="#b8a47a" strokeWidth={13} strokeLinecap="round" />
    <path d="M -30 -100 L 30 -60 M 30 -100 L -30 -60" stroke="#8a7650" strokeWidth={4} />
    <circle cx={0} cy={-206} r={36} fill="#d8c6a0" stroke={INK} strokeWidth={6} />
    <path d="M -10 -210 L 10 -210 M -14 -192 L 14 -192" stroke="#8a7650" strokeWidth={5} />
    <path d="M -46 -224 C -40 -262 40 -262 46 -224 C 30 -232 -30 -232 -46 -224 Z" fill="#8a3b2c" stroke={INK} strokeWidth={5} />
    <path d="M -50 -222 L -56 -196 M 50 -222 L 56 -196" stroke="#6a4a3a" strokeWidth={10} strokeLinecap="round" />
  </g>
);
const Dummies = ({ f, d }: { f: number; d: number }) => {
  const lift = lerp(f, 4, 26, 0, 1, true);
  const back = lerp(f, 26, d, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(back, 0, 1, 1.75, 1.0)} cx={lerp(back, 0, 1, 700, 960)} cy={lerp(back, 0, 1, 690, 560)}>
        <Steppe time="dusk" horizon={560} />
        {/* 지평선까지 인형을 태운 말들 (실루엣) */}
        {Array.from({ length: 26 }).map((_, i) => <Rider key={`f${i}`} kind={i % 2 ? "mongol" : "mongol2"} x={-40 + i * 76} y={540 + (i % 3) * 6} w={84} still dark />)}
        {Array.from({ length: 14 }).map((_, i) => (
          <Horse key={`m${i}`} x={80 + i * 140} y={720 + (i % 2) * 16} w={170} run={false} coat="#4a3e34" dark="#33291f" mane="#1e1712" saddle="#5a3a2a" phase={i * 5}>
            <Dummy />
          </Horse>
        ))}
        {/* 앞: 인형을 들어 안장에 앉히는 병사 */}
        <Horse x={700} y={960} w={520} run={false} coat={HC.coat} dark={HC.dark} saddle="#8a3b2c">
          {lift >= 1 && <Dummy />}
        </Horse>
        {lift < 1 && (
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <g transform={`translate(${700 + (50 - 0) * (520 / 560) - 30 * (1 - lift) + 140 * (1 - lift)} ${960 + (-246 * 520) / 560 + 140 * (1 - lift)}) scale(${520 / 560})`}>
              <Dummy x={0} y={0} />
            </g>
          </svg>
        )}
        <Person L={MON} x={lift < 1 ? 830 : 900} y={1000} h={380} arms={lift < 1 ? "up" : "point"} eyes="dot" mouth="grin" />
        <Glow x={1300} y={420} r={500} op={0.3} color="#f6b06a" />
      </Cam>
    </AbsoluteFill>
  );
};
const H5: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = Math.round(frames / 3);
  const c2 = Math.round((frames * 2) / 3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < c1 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, c1, 1.0, 1.08)} cx={1000} cy={600}>
            <AbsoluteFill style={{ background: "linear-gradient(#d6c9a8, #efe4c8 55%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute" }}><rect x={-40} y={950} width={2000} height={200} fill="#cdb07a" /></svg>
            {/* 2026-11-02: 3장의 공들인 투석기로 바꿈 (예전 훅 그림은 저퀄리티 - 사용자) */}
            {(() => {
              const u = ease(Math.max(0, Math.min(1, (f - 12) / 26)));
              const a = 150 + 150 * u;
              const pull = Math.max(0, Math.min(1, (f - 10) / 14));
              const crew = Array.from({ length: 12 }).map((_, i) => [400 + (i % 6) * 64 + (i >= 6 ? 32 : 0), (i >= 6 ? 420 : 390)]);
              const fly = Math.max(0, Math.min(1, (f - 30) / 26));
              return (
                <>
                  <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
                    <g transform="translate(560 560) scale(0.85)"><Treb a={a} crew={crew.map(([x, y]) => [x - 30 + pull * 16, y - 140])} stone={a < 262} /></g>
                    {fly > 0 && fly < 1 && <circle cx={760 + fly * 900} cy={300 - Math.sin(fly * Math.PI) * 220 + fly * 300} r={22} fill="#8a8478" stroke={INK} strokeWidth={5} />}
                  </svg>
                  {crew.map(([x, y], i) => <Person key={i} L={i % 3 ? PORTER : MON} x={560 + x * 0.85 + pull * 14} y={560 + y * 0.85 + 40} h={200} arms="hold" eyes={pull > 0.2 ? "shut" : "dot"} mouth={pull > 0.2 ? "grin" : "flat"} rot={-pull * 16} />)}
                </>
              );
            })()}
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              {/* 멀리 오른쪽 성벽 (돌이 날아가 꽂힘) */}
              <path d="M 1640 520 L 1960 520 L 1960 1000 L 1640 1000 Z" fill={SAND_D} stroke={INK} strokeWidth={6} />
              {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={1650 + i * 46} y={494} width={26} height={28} fill={SAND_D} stroke={INK} strokeWidth={5} />)}
            </svg>
          </Cam>
          <SFX name="catapult" at={28} vol={0.4} dur={40} />
        </AbsoluteFill>
      )}
      {f >= c1 && f < c2 && (
        <AbsoluteFill style={{ opacity: lerp(f, c1, c1 + 6, 0, 1) }}>
          <Cam z={lerp(f, c1, c2, 1.0, 1.06)} cx={900} cy={620}>
            <Captives f={f - c1 + 30} d={c2 - c1} />
          </Cam>
          <SFX name="arrow_rain" at={c1} vol={0.25} dur={c2 - c1} />
        </AbsoluteFill>
      )}
      {f >= c2 && (
        <AbsoluteFill style={{ opacity: lerp(f, c2, c2 + 6, 0, 1) }}>
          {/* 2026-11-02: 펠트 인형은 4장에서 뺐으므로 4장의 "저절로 열리는 성문" 컷으로 */}
          <GateOpen f={f - c2} d={frames - c2} />
          <SFX name="gate" at={c2 + Math.round((frames - c2) * 0.35)} vol={0.35} dur={30} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ================= 6) c0_06 흰 툭이 화면 가득 솟음 + 숫자 2 =================
const H6: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const up = spring({ frame: f - 4, fps: FPS, config: { damping: 14, stiffness: 90 } });
  const two = at(id(5)) + tl(id(5), 2.0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, frames, 1.0, 1.08)})` }}>
        <Steppe time="dusk" horizon={720} />
        <Dim op={0.15} />
        {Array.from({ length: 30 }).map((_, i) => <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={-60 + i * 66} y={668 + (i % 3) * 8} w={80} still dark />)}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - up) * 900}px)` }}>
          <div style={{ position: "absolute", inset: 0, transform: "scale(2.6)", transformOrigin: "1180px 1160px" }}><Tug x={1180} y={1160} h={420} sway={Math.sin(f / 9) * 4} /></div>
        </div>
        <Glow x={1180} y={300} r={420} op={0.35} color="#ffe2a8" />
      </AbsoluteFill>
      <BigNum text="2" at={two} size={360} x={-420} y={-40} color="#f2ead8" />
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 24, frames, 0, 1) }} />
      <SFX name="war_drums" at={0} vol={0.35} dur={frames} />
      <SFX name="war_horn" at={two - 6} vol={0.3} dur={60} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: [id(1)], Shot: H1 },
  { ids: [id(2)], Shot: H3 },
  { ids: [id(3)], Shot: H4 },
  { ids: [id(4)], Shot: H5 },
  { ids: [id(5)], Shot: H6 },
];
export const M02Ch0 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m2.0" year="" groups={groups} music="siege" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
