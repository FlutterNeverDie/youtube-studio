// 몽골 2편 2장 "사막 건너기" 1판 (2026-11-02) - 대본 episodes/mongol-02/script-ko.md "## 2." (c2_01~c2_17, kit에서는 m2.c2_01…)
// 방법론: 길잡이 · 나눠 걷기(되감기 기법) · 가벼운 짐(짐 펼치기) · 계절(온도 눈금) → 부하라 등 뒤에 나타남 → 밤에 빠져나간 수비군이 들판에서 무너짐(횃불이 꺼짐) → 남은 요새
// 사용자(2026-11-02): 방법 설명할 때 화면에 번호 숫자 띄우지 않기 / 기법은 docs/guide/10-연출-기법.md 에서 고르고 한 편 안에서 되풀이하지 않기
// 깜빡임 주의: 먹선 필터 단 컴포넌트는 한 화면에 수십 개까지, 많은 병사는 한 svg 안의 작은 그림(KhG·MoG)
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { BigNum, Chapter, clamp, ease, Fire, FPS, Glow, Group, INK, Lang, LangContext, Paper, Rider, SFX, ShotProps, Stars, Tug, tl } from "./kit";
import { Cam, Dust, Horse, MON, PORTER, Person, RiderOn, Smoke, Spear, walkBob } from "./M01Ch4";
import { CIV } from "./M02Ch3";
import { Camel, KH_CITIES, KhFlag, MapCam, MX, MY, Spearman } from "./M01Ch5";
import { City, Palm, SAND, SAND_D, SAND_DD } from "./M02City";
import { Castle, grid, JAND, KHUJAND, KYZYL, MapShot, MoG, OTRAR, rnd, smoothD } from "./M02Ch1";

const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };
const sec = (s: number) => Math.round(s * FPS);
const id = (n: number) => `m2.c2_${String(n).padStart(2, "0")}`;

// 위에서 본 모래 바탕 (모래 언덕 물결)
const SandTop = ({ f = 0, night = 0 }: { f?: number; night?: number }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #ecd39c, #dcbd7e 70%, #c9a565)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
      {Array.from({ length: 34 }).map((_, i) => {
        const x = rnd(i, 21) * 1920, y = rnd(i, 22) * 1080;
        return <path key={i} d={`M ${x - 60} ${y} q 30 -18 60 0 q 30 -18 60 0`} stroke="#b8975a" strokeWidth={5} fill="none" opacity={0.7} />;
      })}
      {Array.from({ length: 60 }).map((_, i) => <circle key={`s${i}`} cx={(rnd(i, 23) * 1920 + f * 0.3) % 1920} cy={rnd(i, 24) * 1080} r={2.5} fill="#a8874e" opacity={0.6} />)}
    </svg>
    {night > 0 && <AbsoluteFill style={{ background: "#0d1428", opacity: night }} />}
  </>
);
// 위에서 본 우물 2판 (2026-11-02 사용자: "우물이 너무 저퀄리티") - 젖은 모래 자국 · 돌 하나하나 쌓은 테 · 물결 비치는 물 · 나무 도르래 틀과 그림자 · 물통(구유) · 대추야자 한두 그루
const PalmTop = ({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx={14} cy={18} rx={58} ry={30} fill="rgba(43,29,20,.18)" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <path key={i} d={`M 0 0 Q ${Math.cos(a + 0.3) * 30} ${Math.sin(a + 0.3) * 30} ${Math.cos(a) * 58} ${Math.sin(a) * 58}`} stroke="#4f6e34" strokeWidth={14} fill="none" strokeLinecap="round" />;
    })}
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <path key={`l${i}`} d={`M 0 0 Q ${Math.cos(a + 0.3) * 30} ${Math.sin(a + 0.3) * 30} ${Math.cos(a) * 58} ${Math.sin(a) * 58}`} stroke="#7a9a4a" strokeWidth={6} fill="none" strokeLinecap="round" />;
    })}
    <circle r={9} fill="#7a5a38" stroke={INK} strokeWidth={3} />
  </g>
);
const WellTop = ({ x, y, lv, s = 1, f = 0, rich = false }: { x: number; y: number; lv: number; s?: number; f?: number; rich?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 젖은 모래 자국 + 발자국 */}
    <ellipse cx={0} cy={6} rx={78} ry={60} fill="#c9a565" opacity={0.6} />
    {rich && Array.from({ length: 10 }).map((_, i) => { const a = (i / 10) * Math.PI * 2; return <ellipse key={`fp${i}`} cx={Math.cos(a) * 66} cy={Math.sin(a) * 52} rx={5} ry={3} fill="#a8874e" />; })}
    {/* 구유 (물 먹이는 통) */}
    {rich && <g transform="translate(58 30) rotate(-20)"><rect x={-30} y={-9} width={60} height={18} rx={4} fill="#7a5a38" stroke={INK} strokeWidth={4} /><rect x={-24} y={-4} width={48} height={8} fill={lv > 0.2 ? "#5f93b8" : "#5a4630"} /></g>}
    {/* 돌 테: 돌 하나하나 */}
    <circle r={44} fill="#9a8466" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return <ellipse key={i} cx={Math.cos(a) * 37} cy={Math.sin(a) * 37} rx={10} ry={7} transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 37} ${Math.sin(a) * 37})`} fill={i % 3 ? "#b39c78" : "#8a7658"} stroke={INK} strokeWidth={2.5} />;
    })}
    {/* 우물 안 + 물 */}
    <circle r={27} fill="#2a2018" />
    <circle r={26 * Math.max(0, lv)} fill="#4f86ad" />
    {lv > 0.1 && <ellipse cx={-7} cy={-8} rx={10 * lv} ry={5 * lv} fill="#b6d6e8" opacity={0.7} />}
    {lv > 0.1 && <circle r={12 + ((f * 0.6) % 14)} fill="none" stroke="#9cc3dc" strokeWidth={2} opacity={0.6 * (1 - ((f * 0.6) % 14) / 14)} />}
    {/* 나무 도르래 틀 (위에서 본 가로대 + 그림자) */}
    <path d="M -54 -6 L 54 -6" stroke="rgba(43,29,20,.25)" strokeWidth={14} transform="translate(10 12)" />
    <path d="M -54 -6 L 54 -6" stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d="M -54 -6 L 54 -6" stroke="#8a6440" strokeWidth={8} strokeLinecap="round" />
    <circle cx={0} cy={-6} r={8} fill="#6a4a2e" stroke={INK} strokeWidth={3} />
    {[-54, 54].map((xx) => <circle key={xx} cx={xx} cy={-6} r={7} fill="#6a4a2e" stroke={INK} strokeWidth={3} />)}
    {rich && <PalmTop x={-70} y={-48} s={0.9} r={20} />}
  </g>
);
// ================= 1) c2_01~02 지도: 두 강 사이를 막은 키질쿰 사막, 강가 성들에만 봉화 =================
const RIVER_SPOTS = [OTRAR, KHUJAND, JAND, KH_CITIES[0], KH_CITIES[1], KH_CITIES[2]];
const S1: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2)), a3 = at(id(3));
  const mo = lerp(f, a3, a3 + 20, 0, 1);
  const arrow = lerp(f, a3 + tl(id(3), 1.6), a3 + tl(id(3), 3.6), 0, 1, true);
  const MO_AT = [MX(67.9), MY(42.5)];
  const MO_TO = [MX(64.6), MY(41.2)];
  const z = lerp(f, 0, frames, 1.9, 2.5, true);
  const cx = lerp(f, 0, frames, MX(65.6), MX(64.6)), cy = lerp(f, 0, frames, MY(41.8), MY(42.3));
  const glow = lerp(f, 10, 50, 0, 1);
  return (
    <AbsoluteFill>
      <MapShot f={f} st={{ split: 1, cut: 1 }} z={z} cx={cx} cy={cy} />
      <MapCam z={z} cx={cx} cy={cy}>
        <svg width={3200} height={1440} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={smoothD(KYZYL)} fill="none" stroke="#c9842e" strokeWidth={10} strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - glow} opacity={0.8} />
          <path d={smoothD(KYZYL)} fill="#f6d79a" opacity={0.25 + 0.15 * Math.sin(f / 8)} />
          {mo > 0 && (
            <g opacity={mo}>
              <path d={`M ${MO_AT[0]} ${MO_AT[1]} Q ${(MO_AT[0] + MO_TO[0]) / 2} ${MO_AT[1] - 60} ${MO_TO[0]} ${MO_TO[1]}`} stroke="#3f5f86" strokeWidth={10} strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - arrow} fill="none" strokeLinecap="round" />
              {grid(16, 20).map(([dx, dy], k) => <MoG key={k} x={MO_AT[0] + dx} y={MO_AT[1] + dy} s={0.95} flip />)}
            </g>
          )}
        </svg>
        {RIVER_SPOTS.map(([x, y], i) => {
          const on = lerp(f, a2 + 10 + i * 8, a2 + 22 + i * 8, 0, 1);
          return on > 0 ? (
            <div key={i} style={{ position: "absolute", left: 0, top: 0, width: 3200, height: 1440, opacity: on }}>
              <Smoke x={x + 40} y={y - 70} f={f + i * 20} n={2} s={0.4} />
              <Fire x={x + 40} y={y - 40} s={0.36} />
            </div>
          ) : null;
        })}
      </MapCam>
      <SFX name="wind" at={0} vol={0.3} dur={frames} />
      {RIVER_SPOTS.map((_, i) => <SFX key={i} name="fire" at={a2 + 10 + i * 8} vol={0.08} dur={20} />)}
    </AbsoluteFill>
  );
};

// ================= 2) c2_03~05 길잡이: 사막 입구 작은 도시가 흰 깃발을 올리고 문을 엶 → 길잡이가 걸어 나옴 → 사막 위에 우물을 잇는 점선 길 =================
const GUIDE = { ...PORTER, robe: "#e6dcc4", dark: "#c8bca0", trim: "#5a6e8a" };
// 길잡이 노인 (사막 길을 아는 현지인): 흰 터번 + 바람에 날리는 자락, 흰 수염, 줄무늬 긴 옷 + 붉은 허리띠, 지팡이, 허리의 가죽 물주머니 - 판 300×520, 발 = (150, 520)
const Guide = ({ x, y, h, f }: { x: number; y: number; h: number; f: number }) => {
  const s = h / 520;
  const w = Math.sin(f / 7) * 10;
  const blink = f % 90 < 3;
  return (
    <svg width={300 * s} height={520 * s} viewBox="0 0 300 520" style={{ position: "absolute", left: x - 150 * s, top: y - 520 * s, ...ink, filter: "url(#kit-ink) drop-shadow(0 14px 20px rgba(0,0,0,.3))" }}>
      <ellipse cx={150} cy={516} rx={100} ry={10} fill="rgba(43,29,20,.22)" />
      {/* 지팡이 */}
      <path d="M 236 96 L 248 516" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M 236 96 L 248 516" stroke="#8a6440" strokeWidth={8} strokeLinecap="round" />
      <path d="M 228 90 C 236 70 256 76 250 100" stroke="#8a6440" strokeWidth={10} fill="none" />
      {/* 발 */}
      <ellipse cx={120} cy={508} rx={26} ry={10} fill="#5a3a24" stroke={INK} strokeWidth={4} />
      <ellipse cx={182} cy={508} rx={26} ry={10} fill="#5a3a24" stroke={INK} strokeWidth={4} />
      {/* 긴 옷 + 줄무늬 */}
      <path d="M 92 200 C 80 300 70 420 76 500 L 224 500 C 230 420 220 300 208 200 Z" fill="#9a7a50" stroke={INK} strokeWidth={6} />
      {[110, 130, 170, 190].map((xx) => <path key={xx} d={`M ${xx} 210 L ${xx - (150 - xx) * 0.15} 496`} stroke="#7a5a38" strokeWidth={6} />)}
      {/* 겉옷 (열린 망토) */}
      <path d="M 86 196 C 60 300 56 420 66 500 L 110 500 C 104 400 112 280 124 206 Z" fill="#cdb48a" stroke={INK} strokeWidth={5} />
      <path d="M 214 196 C 240 300 244 420 234 500 L 190 500 C 196 400 188 280 176 206 Z" fill="#cdb48a" stroke={INK} strokeWidth={5} />
      {/* 허리띠 + 물주머니 */}
      <path d="M 88 290 C 130 302 170 302 212 290 L 212 312 C 170 324 130 324 88 312 Z" fill="#b8433a" stroke={INK} strokeWidth={5} />
      <path d="M 196 312 C 230 320 236 372 210 392 C 186 404 172 372 182 340 Z" fill="#7a4a28" stroke={INK} strokeWidth={5} />
      {/* 팔: 오른손 지팡이, 왼손 가리킴 */}
      <path d="M 200 214 C 226 240 236 250 236 128" stroke={INK} strokeWidth={34} strokeLinecap="round" fill="none" />
      <path d="M 200 214 C 226 240 236 250 236 128" stroke="#cdb48a" strokeWidth={24} strokeLinecap="round" fill="none" />
      <circle cx={236} cy={126} r={14} fill="#b9845a" stroke={INK} strokeWidth={4} />
      <path d="M 100 214 C 70 236 40 236 18 206" stroke={INK} strokeWidth={34} strokeLinecap="round" fill="none" />
      <path d="M 100 214 C 70 236 40 236 18 206" stroke="#cdb48a" strokeWidth={24} strokeLinecap="round" fill="none" />
      <circle cx={16} cy={204} r={13} fill="#b9845a" stroke={INK} strokeWidth={4} />
      <path d="M 6 196 L -14 184" stroke="#b9845a" strokeWidth={9} strokeLinecap="round" />
      {/* 목 + 얼굴 */}
      <rect x={134} y={168} width={32} height={30} fill="#b9845a" stroke={INK} strokeWidth={4} />
      <circle cx={150} cy={130} r={50} fill="#c48e60" stroke={INK} strokeWidth={6} />
      {/* 흰 수염 */}
      <path d="M 104 136 C 104 196 124 230 150 236 C 176 230 196 196 196 136 C 186 160 170 168 150 168 C 130 168 114 160 104 136 Z" fill="#ece6d8" stroke={INK} strokeWidth={5} />
      <path d="M 128 154 C 140 146 160 146 172 154" stroke="#ece6d8" strokeWidth={9} strokeLinecap="round" fill="none" />
      {/* 눈·흰 눈썹·주름 */}
      {blink ? <path d="M 124 124 l 14 0 M 162 124 l 14 0" stroke={INK} strokeWidth={5} /> : <><circle cx={131} cy={124} r={6} fill={INK} /><circle cx={169} cy={124} r={6} fill={INK} /></>}
      <path d="M 118 110 C 126 104 138 104 144 110 M 156 110 C 162 104 174 104 182 110" stroke="#f4f0e6" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M 112 140 l 8 4 M 188 140 l -8 4" stroke="#8a5a38" strokeWidth={3} />
      {/* 흰 터번 + 바람에 날리는 자락 */}
      <path d={`M 184 92 C 214 104 ${246 + w} ${118 + w * 0.5} ${270 + w} ${110 + w}`} stroke={INK} strokeWidth={26} strokeLinecap="round" fill="none" />
      <path d={`M 184 92 C 214 104 ${246 + w} ${118 + w * 0.5} ${270 + w} ${110 + w}`} stroke="#efe9dc" strokeWidth={16} strokeLinecap="round" fill="none" />
      <path d="M 96 110 C 90 60 120 40 150 40 C 180 40 210 60 204 110 C 170 98 130 98 96 110 Z" fill="#f4efe2" stroke={INK} strokeWidth={6} />
      <path d="M 102 92 C 130 80 170 80 198 92 M 108 72 C 134 62 166 62 192 72" stroke="#cfc6b2" strokeWidth={5} fill="none" />
    </svg>
  );
};
const WELLS_PATH = [[150, 760], [430, 560], [700, 690], [980, 470], [1260, 600], [1540, 420], [1800, 520]];
// 3판 (2026-11-03 사용자: "뜬금없이 항복한 거 같아, 앞뒤 전개", "사실상 포로잖아") - 목소리 쉼 자리(c2_05~08.wav)에 컷을 맞춤
// A 넓게(c2_04~05 앞): 노을 사막 입구 작은 도시 앞으로 몽골 대군이 몰려와 멈춤
// A2 성벽 위(c2_05 "몽골 대군을 본 사람들은"): 주민들이 밖을 보고 얼어붙음 → 성채 문으로 몰려 들어감
// E 성문 앞(c2_06): 몽골 사신이 성 위에 대고 외침 → "도시는 싸우지 않고" 흰 깃발, 문이 열리고 주민 대표들이 선물을 들고 나와 무릎 꿇음
// F 줄 세운 주민들(c2_07 앞): 몽골 병사가 줄을 따라 걷다 노인의 팔을 잡아 줄 밖으로 끌어냄
// C 가까이(c2_07 "그대로 길잡이로 앞세웠다"): 길잡이 노인 + 옆에 창 든 몽골 병사, 뒤에 낙타
// D 위에서(c2_08 "길잡이가 아는 것은"): 지팡이 끝이 모래에 우물과 길을 그림 → 지도: 우물을 잇는 점선 길
const S2: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a5 = at(id(5)), a6 = at(id(6)), a7 = at(id(7)), a8 = at(id(8));
  const A2 = a5 + tl(id(5), 3.2), E0 = a6, OPEN = a6 + tl(id(6), 4.4), F0 = a7, C0 = a7 + tl(id(7), 4.5), D0 = a8, MAP0 = a8 + tl(id(8), 2.3);
  const chart = lerp(f, MAP0 - 10, MAP0 + 6, 0, 1);
  const draw = lerp(f, MAP0 + 6, frames - 20, 0, 1);
  const xf = (t0: number) => lerp(f, t0 - 6, t0 + 6, 0, 1); // 컷 사이 짧은 겹침
  if (chart < 1) {
    let shot: React.ReactNode;
    if (f < A2 + 6) {
      shot = (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, A2, 1.0, 1.15)} cx={1150} cy={600}>
            <AbsoluteFill style={{ background: "linear-gradient(#e6a878, #f2cf98 38%, #dcbd7e 46%)" }} />
            <div style={{ position: "absolute", left: 1450, top: 260, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(#ffe6a8, #f0a865 60%, transparent 72%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M -40 500 C 300 460 700 520 1100 480 C 1500 450 1800 500 1960 480 L 1960 1100 L -40 1100 Z" fill="#d6b678" />
              {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${100 + i * 190} ${640 + (i % 3) * 90} q 40 -24 80 0 q 40 -24 80 0`} stroke="#b8975a" strokeWidth={5} fill="none" />)}
              <Castle x={1380} y={700} k={1.5} door={1} />
            </svg>
            {Array.from({ length: 5 }).map((_, i) => <Spearman key={i} x={1250 + i * 60} y={500} s={0.17} spear={-30} col="#6a5a44" />)}
            {Array.from({ length: 16 }).map((_, i) => {
              const x = lerp(f, 0, tl(id(4), 3.6), -500 - i * 80, 20 + (i % 4) * 170, true);
              return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={600 + Math.floor(i / 4) * 90} w={180 + Math.floor(i / 4) * 22} still={f > tl(id(4), 3.6)} phase={i * 3} />;
            })}
            {[260, 620, 900].map((x, i) => <Tug key={x} x={x} y={900} h={320} sway={Math.sin((f + i * 9) / 10) * 5} />)}
          </Cam>
        </AbsoluteFill>
      );
    } else if (f < E0 + 6) {
      // 성벽 위: 밖(오른쪽)을 보고 얼어붙음 → "맞서 싸울 엄두를" 왼쪽 성채 문으로 몰려 들어감
      const RUN = a5 + tl(id(5), 5.3);
      const go = lerp(f, RUN, E0, 0, 1);
      shot = (
        <AbsoluteFill style={{ opacity: xf(A2) }}>
          <Cam z={lerp(f, A2, E0, 1.05, 1.0)} cx={960} cy={560}>
            <AbsoluteFill style={{ background: "linear-gradient(#e6a878, #f2cf98 50%)" }} />
            {/* 성벽 너머: 지평선을 끝까지 메운 몽골 대군 (2026-11-03 사용자: "몽골군이 너무 작고 옹졸해") - 뒤 3줄은 한 svg 작은 그림, 앞 2줄은 큰 기병 + 툭 숲 + 먼지 */}
            <svg width={1920} height={1080} style={{ position: "absolute" }}>
              <path d="M 360 380 C 900 360 1500 372 1960 360 L 1960 760 L 360 760 Z" fill="#cfae72" />
              {[0, 1, 2, 3].flatMap((r) => Array.from({ length: 46 }).map((_, i) => <MoG key={`${r}-${i}`} x={380 + i * 34 + (r % 2) * 17} y={400 + r * 26} s={1.3 + r * 0.25} flip />))}
            </svg>
            {[620, 900, 1180, 1460, 1740].map((x, i) => <Tug key={`t${x}`} x={x} y={560} h={300} sway={Math.sin((f + i * 7) / 10) * 5} />)}
            {Array.from({ length: 13 }).map((_, i) => <Rider key={`a${i}`} kind={i % 2 ? "mongol" : "mongol2"} x={400 + i * 120} y={540} w={130} still flip phase={i} />)}
            {Array.from({ length: 9 }).map((_, i) => <Rider key={`b${i}`} kind={i % 2 ? "mongol2" : "mongol"} x={430 + i * 170} y={600} w={180} still flip phase={i + 3} />)}
            {[700, 1100, 1500, 1850].map((x, i) => <Dust key={x} x={x} y={640} t={((f + i * 9) % 40) / 40} r={150} color="#d8bd88" />)}
            {/* 왼쪽: 성채 문 (안쪽 작은 성) */}
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M -40 150 L 360 150 L 360 900 L -40 900 Z" fill={SAND} stroke={INK} strokeWidth={8} />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={-20 + i * 96} y={112} width={56} height={44} fill={SAND} stroke={INK} strokeWidth={6} />)}
              <path d="M 120 900 L 120 560 C 120 470 300 470 300 560 L 300 900 Z" fill="#2e2018" stroke={INK} strokeWidth={7} />
              {/* 성벽 위 걷는 길 + 바깥 흉벽 */}
              <path d="M 340 900 L 1960 900 L 1960 1100 L 340 1100 Z" fill={SAND_D} stroke={INK} strokeWidth={6} />
              <path d="M 340 760 L 1960 760 L 1960 900 L 340 900 Z" fill={SAND} stroke={INK} strokeWidth={6} />
              {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={380 + i * 140} y={706} width={80} height={60} fill={SAND} stroke={INK} strokeWidth={6} />)}
            </svg>
            {CIV.concat(CIV).slice(0, 8).map((L, i) => {
              const x0 = 520 + i * 165;
              const x = x0 - go * (x0 - 210) * (1 + (i % 3) * 0.08);
              const run = go > 0.02 && x > 230;
              return x > 230 ? <Person key={i} L={L} x={x} y={1010 + (i % 2) * 18} h={330} flip={run} eyes={run ? "worry" : "wide"} mouth={run ? "wail" : "o"} arms={run ? "up" : i % 3 ? "down" : "fist"} sweat t={f + i * 5} step={run ? f / 3 + i : 0} bob={walkBob(f + i * 4, run)} /> : null;
            })}
          </Cam>
        </AbsoluteFill>
      );
    } else if (f < F0 + 6) {
      // 성문 앞: 사신이 성 위에 대고 외침 → 흰 깃발, 문이 열리고 주민 대표들이 선물을 들고 나와 무릎 꿇음
      const flag = lerp(f, OPEN - 10, OPEN + 14, 0, 1, true);
      const door = lerp(f, OPEN, OPEN + 24, 0, 1, true);
      const walk = lerp(f, OPEN + 24, OPEN + sec(2.0), 0, 1);
      shot = (
        <AbsoluteFill style={{ opacity: xf(E0) }}>
          <Cam z={lerp(f, E0, F0, 1.0, 1.08)} cx={900} cy={560}>
            <AbsoluteFill style={{ background: "linear-gradient(#f0c890, #f4dcac 60%, #d9b878 60%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M -40 120 L 1260 120 L 1260 820 L -40 820 Z" fill={SAND_D} stroke={INK} strokeWidth={8} />
              {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-20 + i * 132} y={84} width={70} height={44} fill={SAND_D} stroke={INK} strokeWidth={6} />)}
              {Array.from({ length: 6 }).map((_, i) => <path key={`b${i}`} d={`M -40 ${220 + i * 100} L 1260 ${220 + i * 100}`} stroke={SAND_DD} strokeWidth={4} opacity={0.5} />)}
              {/* 성문 */}
              <path d="M 380 820 L 380 470 C 380 330 760 330 760 470 L 760 820 Z" fill="#2a1d14" stroke={INK} strokeWidth={8} />
              <g transform={`translate(380 0) scale(${1 - door * 0.82} 1)`}><path d="M 0 820 L 0 470 C 0 400 60 345 190 336 L 190 820 Z" fill="#7a5230" stroke={INK} strokeWidth={6} /></g>
              <g transform={`translate(760 0) scale(${-(1 - door * 0.82)} 1)`}><path d="M 0 820 L 0 470 C 0 400 60 345 190 336 L 190 820 Z" fill="#6a4628" stroke={INK} strokeWidth={6} /></g>
              {/* 흰 깃발 */}
              <path d="M 570 90 L 570 -60" stroke={INK} strokeWidth={8} />
              <path d={`M 572 ${-60 + (1 - flag) * 140} l 130 16 l -14 40 l -116 6 Z`} fill="#f4efe2" stroke={INK} strokeWidth={4} opacity={flag > 0 ? 1 : 0} />
            </svg>
            {/* 성 위에서 내려다보는 주민들 */}
            {[120, 260, 880, 1040].map((x, i) => <Person key={x} L={CIV[i % 5]} x={x} y={260} h={230} half eyes="worry" mouth={i % 2 ? "o" : "frown"} t={f + i * 7} />)}
            {/* 주민 대표 3명: 선물 들고 나와 무릎 꿇음 */}
            {walk > 0 && [0, 1, 2].map((i) => {
              const x = 520 + i * 70 + walk * (360 + i * 40);
              const kneel = walk >= 1;
              return <Person key={`d${i}`} L={CIV[(i * 2) % 5]} x={x} y={900} h={300} kneel={kneel} arms="offer" eyes="worry" bow={kneel ? 0.4 : 0} step={kneel ? 0 : f / 3 + i} bob={walkBob(f + i * 4, !kneel)} t={f} front={<g><rect x={124} y={262} width={52} height={36} fill="#a8332a" stroke={INK} strokeWidth={4} /><path d="M 124 272 L 176 272" stroke="#d9a92e" strokeWidth={5} /></g>} />;
            })}
            {/* 몽골 사신: 흰 깃발 창, 성 위를 가리키며 외침 */}
            <Horse x={1440} y={1000} w={520} run={false} flip coat="#8a6440" saddle="#a8332a">
              <RiderOn L={MON} arms="point" eyes="angry" mouth={f < OPEN ? "talk" : "flat"} t={f} />
              <path d="M 120 -560 L 160 -120" stroke={INK} strokeWidth={8} />
            </Horse>
          </Cam>
        </AbsoluteFill>
      );
    } else if (f < C0 + 6) {
      // 줄 세운 주민들 사이를 몽골 병사가 걸으며 훑음 → 길잡이 노인 앞에서 멈추고 팔을 잡아 끌어냄
      const STOP = a7 + tl(id(7), 2.6);
      const sx = lerp(f, F0, STOP, 1700, 860);
      const pull = lerp(f, STOP + 6, C0 - 4, 0, 1, true);
      shot = (
        <AbsoluteFill style={{ opacity: xf(F0) }}>
          <AbsoluteFill style={{ background: "linear-gradient(#f0c890, #f4dcac 46%, #d9b878 46%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            <path d="M -40 160 L 1960 160 L 1960 500 L -40 500 Z" fill={SAND_D} stroke={INK} strokeWidth={6} />
            <path d="M 820 500 L 820 300 C 820 220 1100 220 1100 300 L 1100 500 Z" fill="#2a1d14" stroke={INK} strokeWidth={6} />
            <path d="M 960 160 L 960 40" stroke={INK} strokeWidth={6} /><path d="M 962 40 l 90 12 l -10 30 l -80 4 Z" fill="#f4efe2" stroke={INK} strokeWidth={4} />
          </svg>
          {/* 줄 선 주민들 (고개 숙임) */}
          {[200, 380, 560, 1120, 1300, 1480, 1660].map((x, i) => <Person key={x} L={CIV[i % 5]} x={x} y={860} h={380} eyes="worry" mouth="frown" bow={0.25} t={f + i * 9} />)}
          {/* 길잡이 노인: 끌려 나옴 */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${pull * 60}px, ${pull * 120}px)` }}>
            <Guide x={760} y={880} h={430} f={f} />
          </div>
          {/* 몽골 병사 */}
          <Person L={MON} x={sx + pull * 60} y={880 + pull * 120} h={420} flip={f < STOP} arms={f < STOP ? "hold" : "point"} eyes={f < STOP ? "side" : "angry"} mouth={pull > 0 ? "talk" : "flat"} step={f < STOP ? f / 3 : 0} bob={walkBob(f, f < STOP)} t={f} />
          {pull > 0 && <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><path d={`M ${sx - 70 + pull * 60} ${720 + pull * 120} L ${800 + pull * 60} ${700 + pull * 120}`} stroke="#5a4636" strokeWidth={14} strokeLinecap="round" /></svg>}
        </AbsoluteFill>
      );
    } else if (f < D0 + 6) {
      // 가까이: 길잡이 노인 + 옆에 창 든 몽골 병사
      shot = (
        <AbsoluteFill style={{ opacity: xf(C0) }}>
          <Cam z={lerp(f, C0, D0, 1.0, 1.1)} cx={900} cy={540}>
            <AbsoluteFill style={{ background: "linear-gradient(#f0c890, #f4dcac 52%, #d9b878 52%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M -40 560 C 300 500 700 560 1100 520 C 1500 490 1800 540 1960 520 L 1960 1100 L -40 1100 Z" fill="#d0ad6c" stroke={INK} strokeWidth={4} />
            </svg>
            <Camel x={1560} y={960} s={1.6} walk={false} load="jars" flip phase={f / 6} />
            <Guide x={720} y={1120} h={980} f={f} />
            <Person L={MON} x={1180} y={1160} h={900} flip arms="hold" eyes="angry" mouth="flat" t={f} />
            <Spear x={1060} y={260} len={760} />
          </Cam>
        </AbsoluteFill>
      );
    } else {
      // 위에서: 지팡이 끝이 모래에 우물과 길을 그림
      const g = lerp(f, D0, MAP0 - 4, 0, 1);
      const PTS = [[420, 640], [760, 420], [1060, 600], [1380, 380], [1620, 560]];
      const L = PTS.length - 1;
      const k = g * L;
      const seg = Math.min(L - 1, Math.floor(k));
      const u = k - seg;
      const tip = [PTS[seg][0] + (PTS[seg + 1][0] - PTS[seg][0]) * u, PTS[seg][1] + (PTS[seg + 1][1] - PTS[seg][1]) * u];
      shot = (
        <AbsoluteFill style={{ opacity: xf(D0) }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #ecd39c, #d4b273 80%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
            {Array.from({ length: 50 }).map((_, i) => <circle key={i} cx={rnd(i, 41) * 1920} cy={rnd(i, 42) * 1080} r={2.5} fill="#a8874e" opacity={0.6} />)}
            {PTS.slice(0, seg + 1).map(([x, y], i) => <circle key={`w${i}`} cx={x} cy={y} r={44} fill="none" stroke="#8a6a3a" strokeWidth={9} />)}
            <path d={"M " + [...PTS.slice(0, seg + 1), tip].map((p) => p.join(" ")).join(" L ")} stroke="#8a6a3a" strokeWidth={8} fill="none" strokeDasharray="20 12" />
            {[[200, -40], [520, -60], [1500, -50], [1780, -30]].map(([x, y], i) => <ellipse key={`sh${i}`} cx={x} cy={y + 90} rx={140} ry={110} fill="rgba(40,26,14,.28)" />)}
            <path d={`M ${tip[0]} ${tip[1]} L ${tip[0] + 520} ${tip[1] - 700}`} stroke={INK} strokeWidth={26} strokeLinecap="round" />
            <path d={`M ${tip[0]} ${tip[1]} L ${tip[0] + 520} ${tip[1] - 700}`} stroke="#8a6440" strokeWidth={16} strokeLinecap="round" />
          </svg>
          <Dust x={tip[0]} y={tip[1] + 30} t={((f % 12) / 12)} r={40} color="#d8bd88" />
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill>
        {shot}
        <AbsoluteFill style={{ background: "#f0e2c0", opacity: chart }} />
        <SFX name="hooves" at={0} vol={0.25} dur={sec(3.6)} />
        <SFX name="crowd" at={A2} vol={0.18} dur={E0 - A2} fade={12} />
        <SFX name="gate" at={OPEN} vol={0.4} dur={40} />
        <SFX name="wind" at={F0} vol={0.25} dur={D0 - F0} fade={12} />
        <SFX name="swish" at={D0} vol={0.15} dur={MAP0 - D0} />
      </AbsoluteFill>
    );
  }
  // 사막 위 지도에 없는 길: 우물과 우물을 잇는 점선이 그려짐
  const L = WELLS_PATH.length - 1;
  return (
    <AbsoluteFill>
      <SandTop f={f} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d={smoothD(WELLS_PATH)} stroke={INK} strokeWidth={9} strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - draw} fill="none" opacity={0.25} />
        <path d={smoothD(WELLS_PATH)} stroke="#7a3a22" strokeWidth={8} strokeDasharray="22 16" fill="none" style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }} />
        {WELLS_PATH.map(([x, y], i) => {
          const on = lerp(draw * L, i - 0.2, i + 0.1, 0, 1);
          return on > 0 ? <g key={i} opacity={on}><WellTop x={x} y={y} lv={1} s={1.05 + on * 0.25} f={f + i * 7} rich /><circle cx={x} cy={y} r={50 + (1 - on) * 70} fill="none" stroke="#5f93b8" strokeWidth={5} opacity={1 - on} /></g> : null;
        })}
      </svg>
      <SFX name="map" at={0} vol={0.25} dur={30} />
    </AbsoluteFill>
  );
};

// ================= 2-2) c2_09 행렬 맨 앞 길잡이 (2026-11-03 사용자: "길을 잘 아는 사람이 몽골군을 이끌고 길을 알려 주는 장면") =================
// 옆에서 따라가는 카메라: 맨 앞에 지팡이 짚고 걷는 노인 + 바로 뒤 고삐 쥔 몽골 기병 + 끝없는 기병 행렬(모래 언덕이 흘러감)
// → "다음 우물로 가는 길을" 노인이 지팡이로 언덕 너머를 가리킴 → 언덕 위로 야자수 우물이 드러남, 행렬 머리가 그쪽으로 꺾음
const Lead: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const P = at(id(9)) + tl(id(9), 3.0);
  const scroll = Math.min(f, P + 20) * 5 + Math.max(0, f - P - 20) * 1.5;
  const reveal = lerp(f, P, P + 30, 0, 1, true);
  const turn = lerp(f, P + 30, frames, 0, 1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#a9c4d4, #f1dcae 48%, #e2c07e 48%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {/* 먼 언덕 (천천히) */}
        {[0, 1, 2].map((k) => <path key={k} d={`M ${((scroll * 0.3 + k * 1400) % 4200) - 1400} 520 c 300 -110 600 -110 900 0 c 200 -60 400 -60 500 0 Z`} fill="#dcbc80" stroke={INK} strokeWidth={4} />)}
        {/* 우물 언덕 (왼쪽에서 솟음) */}
        <g transform={`translate(${300} ${520 + (1 - reveal) * 160})`} opacity={reveal}>
          <path d="M -260 0 C -160 -120 160 -120 260 0 Z" fill="#d4b06e" stroke={INK} strokeWidth={5} />
          <ellipse cx={0} cy={-70} rx={46} ry={14} fill="#5f93b8" stroke={INK} strokeWidth={4} />
          <path d="M -46 -70 L -46 -50 C -20 -40 20 -40 46 -50 L 46 -70" fill="#8a7658" stroke={INK} strokeWidth={4} />
        </g>
        {/* 가까운 모래 물결 (빠르게) */}
        {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${((i * 260 + scroll) % 2600) - 340} ${900 + (i % 3) * 50} q 40 -20 80 0 q 40 -20 80 0`} stroke="#b8975a" strokeWidth={5} fill="none" />)}
      </svg>
      {reveal > 0 && <><Palm x={360} y={430 + (1 - reveal) * 160} s={0.9} /><Glow x={300} y={460} r={200} color="#ffe9b0" op={0.5 * reveal} /></>}
      {/* 행렬: 뒤로 갈수록 작고 높게 */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 1080 + i * 150 - turn * Math.max(0, 6 - i) * 40;
        const y = 760 - Math.min(i, 8) * 14 - turn * Math.max(0, 6 - i) * 30;
        return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={y} w={220 - Math.min(i, 8) * 10} flip phase={i * 3} />;
      })}
      {/* 고삐 쥔 몽골 기병 (노인 바로 뒤) */}
      <Horse x={900} y={900} w={420} flip run={f < P + 20} coat="#6a4a2e" saddle="#a8332a">
        <RiderOn L={MON} arms="hold" eyes="angry" t={f} />
      </Horse>
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}><path d={`M 760 640 C 700 690 640 690 600 ${640 - reveal * 40}`} stroke="#5a4636" strokeWidth={8} fill="none" /></svg>
      {/* 맨 앞 길잡이 노인 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translateY(${-walkBob(f, f < P + 20) * 0.6}px)` }}>
        <div style={{ position: "absolute", left: 560, top: 920, transform: `rotate(${-reveal * 10}deg)`, transformOrigin: "0 0" }}>
          <Guide x={0} y={0} h={520} f={f} />
        </div>
      </div>
      <Dust x={1300} y={880} t={((f % 30) / 30)} r={140} color="#d8bd88" />
      <SFX name="hooves" at={0} vol={0.25} dur={frames} fade={20} />
      <SFX name="wind" at={0} vol={0.2} dur={frames} fade={20} />
      <SFX name="tick" at={P + 14} vol={0.15} dur={10} />
    </AbsoluteFill>
  );
};

// ================= 2-3) c2_10~11 말 떼 (2026-11-03 사용자: "하나의 우물에서 물이 부족할 수 있다 등 앞뒤 보강") =================
// "두 번째 방법은" 위에서 본 사막을 가로지르는 한 덩어리 → "한 사람이 말을 여러 마리씩" 옆에서: 기병 한 명이 여벌 말 셋을 줄로 끌고 감
// → "말은 사람보다 훨씬 많았습니다" 카메라가 확 빠지며 끝없는 말 떼 (작은 그림은 한 svg 안 - 깜빡임 방지)
const HoG = ({ x, y, s = 1, c = "#8a6440" }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -8 0 L -7 -7 M 7 0 L 8 -7" stroke={INK} strokeWidth={2} />
    <ellipse cx={0} cy={-9} rx={11} ry={5} fill={c} stroke={INK} strokeWidth={1.5} />
    <path d="M 9 -11 L 14 -17 L 16 -14 Z" fill={c} stroke={INK} strokeWidth={1.3} />
  </g>
);
const HCOATS = ["#8a6440", "#6a4a2e", "#b88a52", "#5a4a3e", "#c9b48a"];
const Herd: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a11 = at(id(11));
  const WIDE = a11 + tl(id(11), 5.0);
  if (f < a11 - 4) {
    const k = lerp(f, 0, a11, 0, 1);
    return (
      <AbsoluteFill>
        <SandTop f={f} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {grid(420, 30).map(([dx, dy], i) => <MoG key={i} x={820 + k * 300 + dx * 1.7} y={560 + dy * 1.7} s={2.2} />)}
        </svg>
        <SFX name="cavalry" at={0} vol={0.2} dur={a11} fade={12} />
      </AbsoluteFill>
    );
  }
  if (f < WIDE) {
    // 옆에서: 기병 한 명 + 줄에 묶인 여벌 말 셋
    return (
      <AbsoluteFill style={{ opacity: lerp(f, a11 - 4, a11 + 6, 0, 1) }}>
        <AbsoluteFill style={{ background: "linear-gradient(#b9cfd8, #f1dcae 55%, #e0bf80 55%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${((i * 260 - f * 6) % 2600 + 2600) % 2600 - 340} ${880 + (i % 3) * 50} q 40 -20 80 0 q 40 -20 80 0`} stroke="#b8975a" strokeWidth={5} fill="none" />)}
          {[0, 1, 2].map((i) => <path key={`r${i}`} d={`M ${1240 - i * 330} 640 C ${1150 - i * 330} 700 ${1060 - i * 330} 700 ${980 - i * 330} 650`} stroke="#5a4636" strokeWidth={7} fill="none" />)}
        </svg>
        {[0, 1, 2].map((i) => <Horse key={i} x={880 - i * 330} y={880} w={380} coat={HCOATS[i + 1]} saddle={null} phase={i * 4} />)}
        <Horse x={1240} y={880} w={420} coat={HCOATS[0]} saddle="#a8332a" phase={2}>
          <RiderOn L={MON} arms="hold" eyes="dot" t={f} />
        </Horse>
        <SFX name="hooves" at={0} vol={0.3} dur={WIDE} fade={12} />
      </AbsoluteFill>
    );
  }
  // 확 빠짐: 끝없는 말 떼 (기병 하나에 말 셋)
  const z = lerp(f, WIDE, frames, 3.2, 1.0, true);
  return (
    <AbsoluteFill style={{ opacity: lerp(f, WIDE - 6, WIDE + 6, 0, 1) }}>
      <AbsoluteFill style={{ background: "linear-gradient(#b9cfd8, #f1dcae 26%, #e0bf80 26%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "50% 70%" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {Array.from({ length: 22 }).flatMap((_, r) => Array.from({ length: 16 }).map((_, c) => {
            const y = 300 + r * 36;
            const s = 0.9 + r * 0.06;
            const x = ((c * 128 + r * 37 + f * 1.2) % 2100) - 90;
            return (
              <g key={`${r}-${c}`}>
                <MoG x={x} y={y} s={s} />
                {[1, 2, 3].map((k) => <HoG key={k} x={x - k * 26 * s} y={y + (k % 2) * 4} s={s} c={HCOATS[(r + c + k) % 5]} />)}
              </g>
            );
          }))}
        </svg>
      </div>
      <SFX name="cavalry" at={0} vol={0.25} dur={frames - WIDE} fade={20} />
    </AbsoluteFill>
  );
};

// ================= 2-4) c2_12 작은 우물: 해가 뜨고 지는 동안 물이 조금씩만 차오름 (옆에서 자른 단면 - 다음 장면 되감기와 같은 그림) =================
const SmallWell: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const day = lerp(f, tl(id(12), 2.6), frames - 10, 0, 1); // "하루에 퍼 올릴 수 있는 물이"
  const sunA = Math.PI * (1 - day);
  const lv = 0.15 + 0.3 * day;
  const surf = 940 - 400 * lv;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${day > 0.85 ? "#e9a070" : "#efd9a8"}, #f6e6c0 39%, #d9b878 39%, #b8935a 46%, #9a7646)` }} />
      <div style={{ position: "absolute", left: 960 + Math.cos(sunA) * 700 - 60, top: 360 - Math.sin(sunA) * 260 - 60, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(#fff3c8, #f2b860 60%, transparent 72%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <path d={`M ${960 - 700} 360 A 700 260 0 0 1 ${960 + 700} 360`} stroke="#c9a66a" strokeWidth={4} strokeDasharray="10 14" fill="none" opacity={0.6} />
        {Array.from({ length: 8 }).map((_, k) => <path key={k} d={`M -20 ${500 + k * 70} C 400 ${490 + k * 70} 1500 ${515 + k * 70} 1940 ${500 + k * 70}`} stroke="#8a6a3e" strokeWidth={3} fill="none" opacity={0.5} />)}
        <rect x={900} y={420} width={120} height={540} fill="#3a2e22" stroke={INK} strokeWidth={6} />
        <rect x={906} y={surf} width={108} height={954 - surf} fill="#5f93b8" />
        {/* 바닥에서 스미는 물방울 */}
        {[0, 1, 2].map((k) => <circle key={k} cx={930 + k * 30} cy={954 - ((f * 1.5 + k * 30) % 80)} r={5} fill="#8fc0de" opacity={0.8} />)}
        <path d={`M 1040 ${surf} l 40 0 M 1040 940 l 40 0 M 1060 ${surf} L 1060 940`} stroke="#3f5f86" strokeWidth={5} opacity={0.7} />
        <rect x={880} y={380} width={160} height={50} fill="#8a7658" stroke={INK} strokeWidth={6} />
        <path d="M 880 380 L 930 220 L 990 220 L 1040 380" stroke="#6a4a2e" strokeWidth={14} fill="none" />
        <circle cx={960} cy={220} r={20} fill="#8a6440" stroke={INK} strokeWidth={5} />
        <path d="M 960 220 L 960 430" stroke="#6b4f2e" strokeWidth={4} />
        <path d="M 936 430 L 984 430 L 978 474 L 942 474 Z" fill="#7a5230" stroke={INK} strokeWidth={4} />
      </svg>
      <Palm x={1500} y={520} s={0.8} />
      <SFX name="wind" at={0} vol={0.15} dur={frames} fade={20} />
    </AbsoluteFill>
  );
};

// ================= 3) c2_13~14 되감기: 한 덩어리로 우물 하나에 몰림 → 물이 마름 → 뒤따른 부대는 빈 우물 → ◀◀ → 다섯 갈래로 흩어져 우물마다 =================
const W5 = [[1120, 220], [1280, 420], [1080, 560], [1320, 720], [1100, 880]];
const HORDE = grid(140, 20);
const S3: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a7 = at(id(13)), a8 = at(id(14));
  // 3판 (2026-11-03): "뒤따르는 부대는 빈 우물만" - 앞 부대가 왼쪽으로 떠나고 뒤 부대가 오른쪽에서 와 빈 우물을 내려다봄 (c2_13.wav 쉼 5.9초)
  const LEAVE = a7 + tl(id(13), 5.4);
  const REW = a8, REW_E = a8 + 24;
  // 시간 t: 되감기 동안 거꾸로
  const t = f < REW ? f : f < REW_E ? lerp(f, REW, REW_E, REW, 0) : -1;
  const rew = f >= REW && f < REW_E;
  const start = [260, 560];
  const leave = lerp(t, LEAVE, LEAVE + 30, 0, 1, true), come = lerp(t, LEAVE + 10, LEAVE + 50, 0, 1, true);
  let body: React.ReactNode;
  if (t >= 0 && t >= a7 - 8) {
    // 2판 (2026-11-02 사용자 "우물 말라 말 죽는 그림 이상해") - 옆에서 자른 우물 단면: 말들이 몰려 두레박이 오르내릴 때마다 물이 줄고, 바닥이 드러나면 빈 두레박 · 말들이 고개를 떨굼
    const lv = lerp(t, a7 + tl(id(13), 0.6), a7 + tl(id(13), 4.0), 1, 0);
    const thirst = lerp(t, a7 + tl(id(13), 3.6), a7 + tl(id(13), 5.0), 0, 1);
    const crowd = lerp(t, a7 - 8, a7 + tl(id(13), 1.0), 0, 1, true);
    const cyc = ((t - a7) % 34) / 34; // 두레박 한 번 오르내림
    const surf = 940 - 400 * lv;
    const by = t < a7 ? 430 : 430 + (surf - 40 - 430) * (cyc < 0.5 ? cyc * 2 : 2 - cyc * 2);
    const full = cyc > 0.5 && lv > 0.04;
    body = (
      <AbsoluteFill style={{ filter: `saturate(${1 - thirst * 0.5})`, opacity: lerp(t, a7 - 8, a7 + 4, 0, 1) }}>
        <AbsoluteFill style={{ background: "linear-gradient(#efd9a8, #f6e6c0 39%, #d9b878 39%, #b8935a 46%, #9a7646)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          {/* 땅 단면 줄 */}
          {Array.from({ length: 8 }).map((_, k) => <path key={k} d={`M -20 ${500 + k * 70} C 400 ${490 + k * 70} 1500 ${515 + k * 70} 1940 ${500 + k * 70}`} stroke="#8a6a3e" strokeWidth={3} fill="none" opacity={0.5} />)}
          {/* 우물 통 */}
          <rect x={900} y={420} width={120} height={540} fill="#3a2e22" stroke={INK} strokeWidth={6} />
          <rect x={906} y={surf} width={108} height={954 - surf} fill="#5f93b8" />
          {lv < 0.05 && <path d="M 912 948 l 20 -8 l 14 6 l 24 -10 l 18 8 l 18 -6" stroke="#7a5a32" strokeWidth={4} fill="none" />}
          <rect x={880} y={380} width={160} height={50} fill="#8a7658" stroke={INK} strokeWidth={6} />
          {/* 도르래 틀 + 두레박 */}
          <path d="M 880 380 L 930 220 L 990 220 L 1040 380" stroke="#6a4a2e" strokeWidth={14} fill="none" />
          <circle cx={960} cy={220} r={20} fill="#8a6440" stroke={INK} strokeWidth={5} />
          <path d={`M 960 220 L 960 ${by}`} stroke="#6b4f2e" strokeWidth={4} />
          <path d={`M 936 ${by} L 984 ${by} L 978 ${by + 44} L 942 ${by + 44} Z`} fill="#7a5230" stroke={INK} strokeWidth={4} />
          {full && <rect x={942} y={by + 4} width={36} height={12} fill="#5f93b8" />}
          {/* 갈라진 땅 */}
          {thirst > 0 && [[600, 470], [1300, 480], [760, 520], [1180, 530]].map(([x, y], k) => <path key={k} d={`M ${x} ${y} l 20 10 l -10 16 l 24 8`} stroke="#6a4a2e" strokeWidth={4} fill="none" opacity={thirst} />)}
        </svg>
        {/* 몰려든 말들 (양쪽에서 빽빽이) */}
        {/* 2판: 세 줄 깊이(멀리 작게 → 가까이 크게)로 빽빽이, 우물 쪽으로 머리를 들이밂 */}
        {[0, 1, 2].flatMap((row) => Array.from({ length: [12, 10, 6][row] }).map((_, k) => {
          const side = k % 2 ? 1 : -1;
          const n = Math.floor(k / 2);
          const gap = [70, 105, 170][row];
          const x = 960 + side * ([150, 170, 230][row] + n * gap) * crowd + side * (1 - crowd) * 1000 - leave * 1500;
          const y = [400, 445, 500][row];
          const w = [150, 210, 290][row];
          return <Horse key={`${row}-${k}`} x={x} y={y} w={w} run={crowd < 1 || leave > 0} flip={leave > 0 ? false : side > 0} graze={leave > 0 ? 0 : thirst} coat={["#8a6440", "#6a4a2e", "#b88a52", "#5a4a3e", "#c9b48a"][(k + row) % 5]} saddle={(k + row) % 3 ? "#a8332a" : null} phase={k * 3 + row} />;
        }))}
        {/* 뒤따른 부대: 오른쪽에서 와서 빈 우물 앞에 멈춰 고개를 떨굼 */}
        {come > 0 && [0, 1, 2].flatMap((row) => Array.from({ length: [5, 4, 3][row] }).map((_, k) => (
          <Horse key={`b${row}-${k}`} x={1060 + ([90, 110, 160][row] + k * [80, 120, 190][row]) + (1 - come) * 1100} y={[400, 445, 500][row]} w={[150, 210, 290][row]} run={come < 1} flip graze={lerp(t, LEAVE + 50, LEAVE + 70, 0, 1)} coat={["#5a4a3e", "#c9b48a", "#8a6440"][(k + row) % 3]} saddle="#a8332a" phase={k * 5 + row}>
            {k % 2 === 0 && <RiderOn L={MON} arms="down" eyes={come >= 1 ? "worry" : "dot"} mouth={come >= 1 ? "frown" : "flat"} t={f} />}
          </Horse>
        )))}
      </AbsoluteFill>
    );
  } else if (t >= 0) {
    const go = lerp(t, 0, a7 - 8, 0, 0.3);
    const cx = start[0] + (W5[2][0] - 70 - start[0]) * go, cy = start[1] + (W5[2][1] - start[1]) * go;
    body = (
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {W5.map(([x, y], i) => <WellTop key={i} x={x} y={y} lv={1} f={f + i * 7} rich />)}
        {HORDE.map(([dx, dy], i) => <MoG key={i} x={cx + dx} y={cy + dy} s={1.5} />)}
      </svg>
    );
  } else {
    const g = lerp(f, REW_E, REW_E + sec(2.4), 0, 1, true);
    const lvAfter = 1 - 0.3 * lerp(f, REW_E + sec(2.0), frames, 0, 1);
    body = (
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {W5.map(([x, y], i) => <WellTop key={i} x={x} y={y} lv={lvAfter} f={f + i * 7} rich />)}
        {W5.map(([x, y], i) => <path key={`p${i}`} d={`M ${start[0]} ${start[1]} Q ${(start[0] + x) / 2} ${(start[1] + y) / 2 + (i - 2) * 30} ${x - 70} ${y}`} stroke="#3f5f86" strokeWidth={5} strokeDasharray="14 12" fill="none" opacity={0.5 * g} />)}
        {HORDE.map(([dx, dy], i) => {
          const w = W5[i % 5];
          const k = Math.floor(i / 5);
          const lx = ((k % 6) - 2.5) * 20, ly = (Math.floor(k / 6) - 2) * 14;
          const tx = w[0] - 110 + lx, ty = w[1] + ly;
          const sx = start[0] + dx, sy = start[1] + dy;
          return <MoG key={i} x={sx + (tx - sx) * g} y={sy + (ty - sy) * g} s={1.5} />;
        })}
      </svg>
    );
  }
  return (
    <AbsoluteFill>
      <SandTop f={f} />
      {body}
      {rew && (
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.10) 0 6px, transparent 6px 24px)", transform: `translateY(${(f * 37) % 24}px)` }}>
          <AbsoluteFill style={{ background: "rgba(255,255,255,.08)" }} />
          <div style={{ position: "absolute", right: 70, top: 50, fontSize: 110, color: "#fff", textShadow: "0 0 16px #000", fontFamily: "sans-serif" }}>◀◀</div>
        </AbsoluteFill>
      )}
      <SFX name="cavalry" at={a7 - 10} vol={0.2} dur={sec(2.4)} />
      <SFX name="neigh" at={a7 + tl(id(13), 4.2)} vol={0.2} dur={40} />
      <SFX name="whoosh" at={REW} vol={0.35} dur={24} />
      {/* 3판 (2026-11-03): 되감기 뒤 대사 속 쉼(c2_14 "흩어져, / 갈래마다")에서 브금이 줄어든 채 발굽 소리가 먼저 끝나 0.7초 무음 → 장면 끝까지 바람·발굽을 깖 (check-bgm-cut 4:28) */}
      <SFX name="hooves" at={REW_E} vol={0.2} dur={frames - REW_E} fade={20} />
      <SFX name="wind" at={0} vol={0.18} dur={frames} fade={20} />
    </AbsoluteFill>
  );
};

// ================= 4) c2_09~11 짐 펼치기: 몽골 병사 한 명의 짐이 하나씩 떠오름 → 곡식 수레 행렬은 모래에 빠지고 기병은 그 옆을 지나감 =================
// 2판 (2026-11-02 "저퀄리티 다 고치기"): 줄에 꿰어 말리는 고기 · 입을 벌린 천 주머니에 쏟아진 말린 우유 덩어리 · 바느질 자국과 마개가 있는 가죽 물주머니
const Meat = () => (
  <g>
    <path d="M -70 -58 C -20 -46 20 -46 70 -58" stroke="#6b4f2e" strokeWidth={5} fill="none" />
    {[-52, -24, 4, 32, 58].map((x, i) => (
      <g key={i} transform={`translate(${x} ${-52 + Math.abs(x) * 0.08}) rotate(${(i - 2) * 4})`}>
        <path d="M -9 0 C -14 30 -10 62 -2 84 C 6 70 12 34 9 0 Z" fill={i % 2 ? "#7a2e1e" : "#8e3a24"} stroke={INK} strokeWidth={3.5} />
        <path d="M -4 14 C -6 34 -4 52 0 66" stroke="#b8604a" strokeWidth={3} fill="none" opacity={0.8} />
        <path d="M -9 0 L 9 0" stroke="#6b4f2e" strokeWidth={5} />
      </g>
    ))}
  </g>
);
const Qurut = () => (
  <g>
    <path d="M -58 10 C -66 -30 -40 -54 -26 -50 L 26 -50 C 40 -54 66 -30 58 10 C 54 52 -54 52 -58 10 Z" fill="#b89a6a" stroke={INK} strokeWidth={5} />
    <path d="M -30 -50 C -20 -64 20 -64 30 -50" stroke="#8a6a3e" strokeWidth={6} fill="none" />
    <path d="M -40 -20 C -20 -10 20 -10 40 -20" stroke="#8a6a3e" strokeWidth={4} fill="none" opacity={0.6} />
    {[[-26, -46], [0, -54], [24, -46], [-12, -36], [14, -34], [40, 30], [56, 44], [30, 50]].map(([x, y], i) => (
      <g key={i}><circle cx={x} cy={y} r={13} fill="#f6f1e2" stroke={INK} strokeWidth={3.5} /><circle cx={x - 4} cy={y - 4} r={3} fill="#d8cfb8" /></g>
    ))}
  </g>
);
const Skin = () => (
  <g>
    <path d="M -46 -40 C -80 10 -60 74 0 74 C 60 74 80 10 46 -40 C 30 -50 -30 -50 -46 -40 Z" fill="#8a5a32" stroke={INK} strokeWidth={5} />
    <path d="M -30 -30 C -54 14 -40 60 -4 64" stroke="#a87448" strokeWidth={8} fill="none" opacity={0.7} />
    <path d="M -46 -40 C -60 0 -56 40 -30 62" stroke="#f0e2c0" strokeWidth={3} strokeDasharray="6 6" fill="none" />
    <path d="M 46 -40 C 60 0 56 40 30 62" stroke="#f0e2c0" strokeWidth={3} strokeDasharray="6 6" fill="none" />
    <path d="M -16 -44 L -12 -76 L 12 -76 L 16 -44 Z" fill="#6a4426" stroke={INK} strokeWidth={4} />
    <rect x={-14} y={-90} width={28} height={16} rx={5} fill="#c9a24a" stroke={INK} strokeWidth={4} />
    <path d="M -40 -30 C -70 -60 -90 -40 -96 -10" stroke="#6b4f2e" strokeWidth={5} fill="none" />
    <ellipse cx={18} cy={20} rx={10} ry={20} fill="#b07c4c" opacity={0.6} />
  </g>
);
const Item = ({ x, y, on, to, children }: { x: number; y: number; on: number; to: number[]; children: React.ReactNode }) => (
  <g opacity={on}>
    <path d={`M ${to[0]} ${to[1]} L ${x} ${y}`} stroke={INK} strokeWidth={4} strokeDasharray="10 8" opacity={0.6} />
    <circle cx={x} cy={y} r={120} fill="#f4e8c8" stroke={INK} strokeWidth={7} />
    <circle cx={x} cy={y} r={108} fill="none" stroke="#c9a24a" strokeWidth={4} />
    <g transform={`translate(${x} ${y + 6}) scale(${0.8 + 0.5 * on})`}>{children}</g>
  </g>
);
// 2판 (2026-11-02): 소가 끄는 곡식 수레 - 수레는 땅에 붙고 바퀴가 모래 둔덕에 반쯤 묻힘, 곡식 자루가 높이 쌓임, 소는 고개를 숙이고 버팀
export const Ox = ({ strain }: { strain: number }) => (
  <g>
    {[[-50, 0], [-28, 4], [36, 0], [58, 4]].map(([x, d], i) => <path key={i} d={`M ${x} -60 L ${x + (i < 2 ? -6 : 6) * strain} ${-2 + d}`} stroke={INK} strokeWidth={18} strokeLinecap="round" />)}
    {[[-50, 0], [-28, 4], [36, 0], [58, 4]].map(([x, d], i) => <path key={`c${i}`} d={`M ${x} -60 L ${x + (i < 2 ? -6 : 6) * strain} ${-2 + d}`} stroke="#6e5a44" strokeWidth={11} strokeLinecap="round" />)}
    <ellipse cx={0} cy={-84} rx={84} ry={42} fill="#7e6a52" stroke={INK} strokeWidth={6} />
    <path d="M -84 -96 C -96 -80 -104 -66 -100 -50" stroke="#7e6a52" strokeWidth={8} fill="none" />
    <g transform={`translate(${86 + strain * 6} ${-84 + strain * 16})`}>
      <ellipse cx={14} cy={0} rx={30} ry={22} fill="#7e6a52" stroke={INK} strokeWidth={5} />
      <path d="M 0 -18 C -6 -34 -20 -38 -26 -30 M 22 -18 C 30 -34 44 -36 48 -26" stroke="#efe6d4" strokeWidth={6} fill="none" strokeLinecap="round" />
      <circle cx={22} cy={-4} r={4} fill={INK} />
      <ellipse cx={38} cy={8} rx={8} ry={6} fill="#5e4a38" />
    </g>
  </g>
);
const Cart = ({ x, y, sink, f }: { x: number; y: number; sink: number; f: number }) => {
  const tilt = -4 * sink;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={200} ry={18} fill="rgba(43,29,20,.2)" />
      {/* 끌채 + 소 */}
      <path d="M 110 -60 L 260 -70" stroke={INK} strokeWidth={10} />
      <g transform="translate(330 0)"><Ox strain={sink} /></g>
      <g transform={`rotate(${tilt} 0 0)`}>
        {/* 짐칸 */}
        <path d="M -140 -50 L 130 -50 L 140 -130 L -150 -130 Z" fill="#8a6440" stroke={INK} strokeWidth={6} />
        {[-110, -60, -10, 40, 90].map((xx) => <path key={xx} d={`M ${xx} -52 L ${xx + 2} -128`} stroke="#6a4a2e" strokeWidth={5} />)}
        {/* 곡식 자루 더미 */}
        {[[-110, -150], [-55, -152], [0, -150], [55, -152], [105, -148], [-80, -196], [-25, -198], [30, -196], [80, -194], [-50, -238], [5, -240], [55, -236]].map(([sx, sy], k) => (
          <g key={k}><ellipse cx={sx} cy={sy} rx={32} ry={24} fill={k % 3 ? "#d9c18a" : "#c9ae74"} stroke={INK} strokeWidth={4} /><path d={`M ${sx - 6} ${sy - 22} l 6 -8 l 6 8`} stroke="#8a6a3e" strokeWidth={3} fill="none" /></g>
        ))}
        {/* 바퀴 (반쯤 묻힘) */}
        {[-80, 80].map((dx) => (
          <g key={dx} transform={`translate(${dx} ${-20 + sink * 26}) rotate(${Math.sin(f / 4 + dx) * 8 * (1 - sink)})`}>
            <circle r={56} fill="#6a4a2e" stroke={INK} strokeWidth={7} />
            <circle r={40} fill="none" stroke="#4a3220" strokeWidth={5} />
            {[0, 45, 90, 135].map((a) => <path key={a} d={`M ${Math.cos((a * Math.PI) / 180) * 40} ${Math.sin((a * Math.PI) / 180) * 40} L ${-Math.cos((a * Math.PI) / 180) * 40} ${-Math.sin((a * Math.PI) / 180) * 40}`} stroke="#4a3220" strokeWidth={6} />)}
            <circle r={10} fill="#3a2a1e" />
          </g>
        ))}
      </g>
      {/* 바퀴를 삼킨 모래 둔덕 */}
      {[-80, 80].map((dx) => <path key={`m${dx}`} d={`M ${dx - 90} 14 C ${dx - 50} ${-14 - sink * 20} ${dx + 50} ${-14 - sink * 20} ${dx + 90} 14 Z`} fill="#d6b678" stroke={INK} strokeWidth={4} />)}
      {sink > 0.3 && [-80, 80].map((dx) => <path key={`p${dx}`} d={`M ${dx - 40} -4 l -14 -12 m 54 12 l 14 -14`} stroke="#b8975a" strokeWidth={4} opacity={sink} />)}
    </g>
  );
};
const S4: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a10 = at(id(16)), a11 = at(id(17));
  const on = (t: number) => spring({ frame: f - t, fps: FPS, config: { damping: 13, stiffness: 120 } });
  const SADDLE = [840, 560];
  const cut = lerp(f, a11 - 8, a11 + 8, 0, 1);
  return (
    <AbsoluteFill>
      {cut < 1 && (
        <AbsoluteFill style={{ opacity: 1 - cut }}>
          <Paper />
          <Cam z={lerp(f, 0, a11, 1.05, 1.0)} cx={960} cy={560}>
            {/* 여벌 말 (뒤) */}
            <AbsoluteFill style={{ opacity: on(a10 + tl(id(16), 4.2)) }}>
              <Horse x={1320} y={880} w={420} run={false} saddle={null} coat="#c9b48a" dark="#a8936a" />
              <Horse x={1500} y={900} w={400} run={false} saddle={null} coat="#7a5a3e" dark="#5a4230" />
            </AbsoluteFill>
            <Horse x={840} y={930} w={620} run={false} coat="#8a6440" dark="#6a4a2e" mane="#2a1d14" saddle="#a8332a">
              <RiderOn L={MON} arms="hold" eyes="dot" mouth="flat" t={f} />
              <Spear x={60} y={-380} len={360} />
            </Horse>
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <Item x={360} y={300} on={on(a10)} to={SADDLE}><Meat /></Item>
              <Item x={420} y={700} on={on(a10 + tl(id(16), 2.0))} to={SADDLE}><Qurut /></Item>
              <Item x={1300} y={250} on={on(a10 + tl(id(16), 3.2))} to={SADDLE}><Skin /></Item>
            </svg>
          </Cam>
          {[a10, a10 + tl(id(16), 2.0), a10 + tl(id(16), 3.2), a10 + tl(id(16), 4.2)].map((t, i) => <SFX key={i} name="tick" at={t} vol={0.15} dur={10} />)}
        </AbsoluteFill>
      )}
      {cut > 0 && (
        <AbsoluteFill style={{ opacity: cut }}>
          <Cam z={lerp(f, a11, frames, 1.0, 1.08)} cx={960} cy={600}>
            <AbsoluteFill style={{ background: "linear-gradient(#e7d4a6, #f2e2b8 40%, #dcbd7e 40%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${i * 260} ${470 + (i % 2) * 40} q 60 -30 120 0 q 60 -30 120 0`} stroke="#b8975a" strokeWidth={5} fill="none" />)}
              {/* 뒤: 모래에 빠진 곡식 수레 행렬 (멀리 작은 수레들이 지평선까지) */}
              {Array.from({ length: 6 }).map((_, i) => <g key={`far${i}`} transform={`translate(${1500 - i * 260} ${470}) scale(0.45)`}><Cart x={0} y={0} sink={1} f={f} /></g>)}
              {[[260, 640], [1020, 660]].map(([x, y], i) => <Cart key={i} x={x} y={y} sink={lerp(f, a11 + i * 10, a11 + tl(id(17), 2) + i * 10, 0, 1)} f={f} />)}
            </svg>
            {/* 수레를 뒤에서 미는 사람들 (몸을 기울여 힘씀) */}
            {[[50, 650], [105, 662], [810, 670], [865, 682]].map(([x, y], i) => <Person key={i} L={i % 2 ? PORTER : { ...PORTER, robe: "#7a6a5a", dark: "#5e5244" }} x={x} y={y} h={200} arms="offer" eyes="shut" mouth="grin" rot={22 + Math.sin(f / 6 + i) * 3} />)}
            {/* 채찍 든 마부 */}
            {[[700, 650], [1460, 670]].map(([x, y], i) => <Person key={`d${i}`} L={{ ...PORTER, robe: "#6a3a2e", dark: "#4a2a20" }} x={x} y={y} h={210} arms="up" eyes="angry" mouth="o" flip />)}
            {/* 앞: 짐 가벼운 몽골 기병이 그 옆을 지나감 */}
            {Array.from({ length: 8 }).map((_, i) => {
              const x = ((i * 300 + (f - a11) * 7) % 2600) - 400;
              return (
                <React.Fragment key={i}>
                  <Dust x={x + 60} y={980} t={((f + i * 5) % 22) / 22} r={60} />
                  <Rider kind={i % 2 ? "mongol" : "mongol2"} x={x} y={760 + (i % 2) * 40} w={260} phase={i * 3} />
                </React.Fragment>
              );
            })}
          </Cam>
          <SFX name="hooves" at={a11} vol={0.3} dur={frames - a11} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ================= 5) c2_18 계절: 사막 위 온도 눈금이 한여름에서 늦겨울·이른 봄으로 내려감 (3판: 큰 숫자 1220 뺌 - 2026-11-03 사용자 "1220년이 3번 연속") =================
// 2판 (2026-11-02 "저퀄리티 다 고치기"): 겹겹 모래 언덕 + 가까이 큰 기병 행렬(흰 툭) + 해가 작아지고 하늘이 식음 + 나무틀 온도계(해·눈 표시)
const S5: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const drop = lerp(f, tl(id(18), 1.2), tl(id(18), 3.0), 0, 1, true);
  const lv = 0.92 - drop * 0.58;
  const heat = 1 - drop;
  const sky0 = heat > 0.5 ? "#f0b878" : "#cfdde0";
  const hot = lv > 0.6;
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.06)} cx={860} cy={560}>
        <AbsoluteFill style={{ background: `linear-gradient(${sky0}, #f4e4bc 46%)` }} />
        <div style={{ position: "absolute", left: 1100, top: 110, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(#fff6d0, #f6c062 50%, transparent 70%)", transform: `scale(${0.7 + 0.5 * heat})`, opacity: 0.55 + 0.45 * heat, boxShadow: `0 0 ${80 * heat}px ${40 * heat}px rgba(255,190,90,.35)` }} />
        <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
          <path d="M -40 470 C 200 420 420 460 640 430 C 900 400 1100 450 1400 420 C 1650 400 1800 440 1960 430 L 1960 1100 L -40 1100 Z" fill="#e4c88e" />
          <path d="M -40 560 C 260 500 520 560 860 520 C 1180 486 1500 560 1960 520 L 1960 1100 L -40 1100 Z" fill="#d8b878" stroke={INK} strokeWidth={4} />
          {[[200, 600], [700, 590], [1300, 580]].map(([x, y], k) => <path key={`sh${k}`} d={`M ${x} ${y} C ${x + 120} ${y - 40} ${x + 260} ${y - 30} ${x + 380} ${y + 10}`} stroke="#c4a060" strokeWidth={14} fill="none" opacity={0.7} />)}
          <path d="M -40 820 C 400 760 900 820 1400 790 C 1650 776 1800 800 1960 790 L 1960 1100 L -40 1100 Z" fill="#cfa863" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${i * 170} ${880 + (i % 3) * 60} q 40 -24 80 0 q 40 -24 80 0`} stroke="#a8874e" strokeWidth={5} fill="none" />)}
          {heat > 0.05 && Array.from({ length: 7 }).map((_, i) => <path key={`h${i}`} d={`M ${120 + i * 260} 540 q 12 -22 0 -44 q -12 -22 0 -44 q 12 -22 0 -44`} stroke="#fff4d8" strokeWidth={6} fill="none" opacity={0.6 * heat} transform={`translate(0 ${-(f * 2 + i * 20) % 60})`} />)}
        </svg>
        {/* 멀리 능선의 행렬 */}
        {Array.from({ length: 16 }).map((_, i) => {
          const x = ((i * 140 + f * 2) % 2300) - 200;
          return <Rider key={`far${i}`} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={500 - 26 * Math.sin((x + 200) / 400)} w={80} phase={i * 3} />;
        })}
        {/* 가까운 능선의 큰 기병 + 흰 툭 */}
        {Array.from({ length: 7 }).map((_, i) => {
          const x = ((i * 330 + f * 4) % 2400) - 300;
          return (
            <React.Fragment key={`n${i}`}>
              <Dust x={x + 60} y={830} t={((f + i * 5) % 24) / 24} r={60} color="#d8bd88" />
              <Rider kind={i % 2 ? "mongol" : "mongol2"} x={x} y={640 + (i % 2) * 30} w={260} phase={i * 3} />
              {i % 3 === 0 && <Tug x={x + 150} y={760} h={260} sway={Math.sin((f + i * 7) / 9) * 5} />}
            </React.Fragment>
          );
        })}
      </Cam>
      {/* 온도계: 나무틀 + 유리관 + 해·눈 표시 */}
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        <g transform="translate(1680 130)">
          <rect x={-70} y={-30} width={140} height={760} rx={24} fill="#8a6440" stroke={INK} strokeWidth={7} />
          <rect x={-56} y={-16} width={112} height={732} rx={18} fill="#a87c50" />
          {/* 해 (위) · 눈 (아래 가까이) */}
          <g transform="translate(0 -70)"><circle r={30} fill="#f6c062" stroke={INK} strokeWidth={5} />{Array.from({ length: 8 }).map((_, k) => <path key={k} d={`M ${Math.cos((k / 8) * 6.28) * 38} ${Math.sin((k / 8) * 6.28) * 38} L ${Math.cos((k / 8) * 6.28) * 52} ${Math.sin((k / 8) * 6.28) * 52}`} stroke="#e0a030" strokeWidth={6} strokeLinecap="round" />)}</g>
          <g transform="translate(-44 480)">{[0, 60, 120].map((a) => <path key={a} d={`M ${Math.cos((a * Math.PI) / 180) * 16} ${Math.sin((a * Math.PI) / 180) * 16} L ${-Math.cos((a * Math.PI) / 180) * 16} ${-Math.sin((a * Math.PI) / 180) * 16}`} stroke="#4f8fb8" strokeWidth={5} strokeLinecap="round" />)}</g>
          <rect x={-22} y={0} width={44} height={600} rx={22} fill="#f8f4ea" stroke={INK} strokeWidth={6} />
          <circle cx={0} cy={640} r={50} fill={hot ? "#c0392b" : "#4f8fb8"} stroke={INK} strokeWidth={7} />
          <rect x={-11} y={14 + 570 * (1 - lv)} width={22} height={600 - 14 - 570 * (1 - lv) + 30} fill={hot ? "#c0392b" : "#4f8fb8"} />
          <circle cx={-14} cy={630} r={12} fill="#ffffff" opacity={0.4} />
          {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M 22 ${40 + k * 64} l ${k % 2 ? 14 : 26} 0`} stroke={INK} strokeWidth={4} />)}
        </g>
      </svg>
      <SFX name="wind" at={0} vol={0.25} dur={frames} />
      <SFX name="hooves" at={0} vol={0.15} dur={frames} />
    </AbsoluteFill>
  );
};

// ================= 6) c2_14~15 2판 (2026-11-02 사용자: "등 뒤에서 온다는 느낌, 준비 안 된 느낌이 안 남") =================
// 동쪽 성벽 위 수비병들의 등 뒤에서: 모두 강 건너 동쪽만 바라봄(느긋하게, 창을 세워 둠) → "강 쪽이 아니라," 화면이 반대로 휙 돎(흐림)
// → 서쪽 성벽은 텅 빔, 모래 언덕 너머로 몽골 기병이 쏟아져 성(카메라) 쪽으로 달려옴
const Parapet = ({ y = 880 }: { y?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
    <rect x={-20} y={y} width={1960} height={1080 - y + 20} fill={SAND_D} stroke={INK} strokeWidth={7} />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-20 + i * 170} y={y - 90} width={100} height={92} fill={SAND_D} stroke={INK} strokeWidth={7} />)}
    {Array.from({ length: 4 }).map((_, i) => <path key={`r${i}`} d={`M -20 ${y + 40 + i * 44} L 1940 ${y + 40 + i * 44}`} stroke={SAND_DD} strokeWidth={4} opacity={0.6} />)}
  </svg>
);
const S6: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a14 = at(id(20));
  const TURN = a14 + tl(id(20), 1.9); // "강 쪽이 아니라," 뒤
  const whip = lerp(f, TURN - 6, TURN + 6, 0, 1); // 휙 도는 동안 흐림
  const blur = Math.sin(whip * Math.PI) * 18;
  const east = f < TURN;
  const g = f - TURN;
  return (
    <AbsoluteFill style={{ background: "#e9dcbc" }}>
      <AbsoluteFill style={{ filter: blur > 0.5 ? `blur(${blur}px)` : undefined, transform: `translateX(${east ? -whip * 300 : (1 - whip) * 300}px)` }}>
        {east ? (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(#cfdad8, #eee4c8 52%, #c9b47a 52%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M -20 600 C 400 590 1200 610 1940 596 L 1940 640 C 1200 650 400 632 -20 646 Z" fill="#6f93a8" stroke={INK} strokeWidth={4} />
              {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${((i * 260 + f * 1.2) % 2100) - 100} 620 l 60 0`} stroke="#a9c3cf" strokeWidth={4} />)}
              {Array.from({ length: 9 }).map((_, i) => <ellipse key={`t${i}`} cx={100 + i * 220} cy={700 + (i % 2) * 40} rx={50} ry={20} fill="#8f8a52" stroke={INK} strokeWidth={3} />)}
            </svg>
            <Parapet />
            {/* 수비병 등 (동쪽을 바라봄), 느긋하게 */}
            {[260, 640, 1080, 1480].map((x, i) => <Spearman key={x} x={x} y={900} s={0.95} spear={i === 1 ? 30 : 0} col="#3a2c22" />)}
            <KhFlag x={1700} y={800} h={300} />
          </AbsoluteFill>
        ) : (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(#e8d2a2, #f2e2b8 48%, #dcbd7e 48%)" }} />
            <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
              <path d="M -20 540 C 300 470 700 520 1000 480 C 1300 450 1600 520 1940 500 L 1940 700 L -20 700 Z" fill="#d0ad6c" stroke={INK} strokeWidth={4} />
            </svg>
            {/* 언덕 너머 먼지 + 쏟아지는 기병 (카메라 쪽으로 커지며) */}
            {Array.from({ length: 9 }).map((_, i) => <div key={`d${i}`} style={{ position: "absolute", left: i * 230 - 60, top: 400, width: 320, height: 180, borderRadius: "50%", background: "radial-gradient(rgba(214,190,140,.9), transparent 70%)", opacity: lerp(g, 0, 20, 0, 0.9) }} />)}
            {Array.from({ length: 26 }).map((_, i) => {
              const u = Math.max(0, Math.min(1, (g - (i % 9) * 4) / 80));
              const w = 70 + u * 230;
              const x = (i * 83) % 1900 - 40 + (i % 2 ? 1 : -1) * u * 60;
              const y = 470 + u * 330 - w * 0.7 + (i % 3) * 10;
              return u > 0 ? <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x - w / 2} y={y} w={w} phase={i * 3} /> : null;
            }).reverse()}
            {[300, 960, 1600].map((x, i) => <Tug key={x} x={x} y={560 + Math.min(1, g / 80) * 200} h={140 + Math.min(1, g / 80) * 200} sway={Math.sin((f + i * 7) / 9) * 6} />)}
            <Parapet />
            {/* 텅 빈 서쪽 성벽 - 수비병 하나만 뒤늦게 돌아봄 */}
            <Spearman x={1640} y={900} s={0.8} spear={-30} col="#3a2c22" />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      <SFX name="wind" at={0} vol={0.2} dur={frames} />
      <SFX name="whoosh" at={TURN - 6} vol={0.4} dur={20} />
      <SFX name="war_horn" at={TURN + 4} vol={0.4} dur={70} />
      <SFX name="cavalry" at={TURN + 6} vol={0.4} dur={frames - TURN - 6} />
    </AbsoluteFill>
  );
};

// ================= 7) c2_15 밤: 횃불 든 수비군이 성을 빠져나감 → "들판이었습니다" 기병이 휩쓸고 횃불이 하나씩 떨어져 꺼짐 =================
// 2판 (2026-11-02 "저퀄리티 다 고치기"): 성 창문마다 불빛 · 성문 틈 빛 · 횃불 행렬은 두 줄(먼 줄 작게, 가까운 줄 크게)로 길게 · 기병은 크고 빠르게 휩씀 · 떨어진 횃불에서 연기
const S7: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const HIT = tl(id(21), 4.6);
  const files = [{ y: 830, s: 0.13, n: 16, gap: 16, sp: 3.0 }, { y: 920, s: 0.2, n: 12, gap: 20, sp: 3.8 }];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#0b1220, #1d2a40 62%, #2a2a30)" }} />
      <Stars />
      <div style={{ position: "absolute", left: 1440, top: 110, width: 110, height: 110, borderRadius: "50%", background: "#e6dfca", boxShadow: "0 0 70px 24px rgba(230,223,202,.22)" }} />
      <div style={{ position: "absolute", inset: 0, transform: "translate(560px, 40px) scale(0.75)", transformOrigin: "50% 80%", filter: "brightness(0.3) saturate(0.4)" }}><City f={f} bare guards={false} /></div>
      {/* 창문 불빛 · 성문 빛 */}
      {Array.from({ length: 18 }).map((_, k) => <div key={`w${k}`} style={{ position: "absolute", left: 1020 + (k % 9) * 90 + (k > 8 ? 40 : 0), top: 560 + (k > 8 ? 60 : 0) + (k % 3) * 8, width: 10, height: 14, background: "#ffcf6a", opacity: 0.5 + 0.4 * Math.sin(f / 7 + k), boxShadow: "0 0 10px 4px rgba(255,170,70,.4)" }} />)}
      <Glow x={1280} y={780} r={160} color="#ffb04a" op={0.45} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}><rect x={-40} y={790} width={2000} height={300} fill="#17140f" /></svg>
      {files.flatMap((fl, fi) => Array.from({ length: fl.n }).map((_, i) => {
        const x = 1240 - Math.max(0, f - i * fl.gap) * fl.sp;
        if (f < i * fl.gap) return null;
        const t0 = HIT + ((i * 3 + fi * 5) % 9) * 4;
        const hit = f > t0;
        const fall = hit ? lerp(f, t0, t0 + 12, 0, 1) : 0;
        const out = hit ? lerp(f, t0 + 10, t0 + 34, 1, 0) : 1;
        const k = fl.s / 0.16;
        const y = fl.y;
        return (
          <React.Fragment key={`${fi}-${i}`}>
            <Glow x={x + 20 * k} y={y - 120 * k + fall * 100 * k} r={70 * k} color="#ff9a3a" op={0.7 * out} />
            <div style={{ position: "absolute", left: x + 14 * k, top: y - 140 * k + fall * 100 * k, width: 12 * k, height: 22 * k, borderRadius: "50% 50% 40% 40%", background: "#ffcf6a", opacity: out, boxShadow: "0 0 14px 6px rgba(255,150,60,.6)" }} />
            {hit && out < 0.9 && <div style={{ position: "absolute", left: x - 30 * k, top: y - 120 * k - (1 - out) * 80 * k, width: 70 * k, height: 70 * k, borderRadius: "50%", background: "radial-gradient(rgba(120,110,100,.5), transparent 70%)", opacity: 1 - out }} />}
            <div style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${fall * 70}deg)`, transformOrigin: `${x}px ${y}px` }}><Spearman x={x} y={y} s={fl.s} spear={0} col="#0c0a08" /></div>
          </React.Fragment>
        );
      }))}
      {f > HIT - 24 && Array.from({ length: 12 }).map((_, i) => {
        const x = -360 + (f - HIT + 24) * 26 - i * 150;
        return <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={x} y={700 + (i % 3) * 50} w={260 + (i % 3) * 30} dark phase={i * 3} />;
      })}
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 16, frames, 0, 0.6) }} />
      <SFX name="march" at={0} vol={0.2} dur={HIT} />
      {/* 2026-11-03 포르투갈어 더빙에서 대사가 묻혀(stem-mix 남음 313.3초) 조금 줄임 */}
      <SFX name="cavalry" at={HIT - 20} vol={0.32} dur={60} />
      <SFX name="war_cry" at={HIT - 10} vol={0.22} dur={50} />
      {/* 밤 장면 바탕 소리를 끝까지 (2026-11-02 전체 2판 4:26.6 브금 끊김 검사: 횃불이 꺼진 뒤 0.4초 무음) */}
      <SFX name="wind" at={0} vol={0.25} dur={frames} fade={20} />
      <SFX name="fire" at={HIT} vol={0.2} dur={frames - HIT} fade={20} />
    </AbsoluteFill>
  );
};

// ================= 8) c2_17~20 2판 (2026-11-02 사용자: "문을 열었다·요새는 닫힘이 이상, 왜 열었는지 안 나옴, 성 안에 성 구조를 이해 못 함") =================
// 위에서 본 부하라 구조도: 바깥 성벽(큰 고리) 안 집들 + 한쪽 언덕 위 성채(작은 고리, 자기 성벽)
// "도시 사람들은 스스로 성문을 열었습니다" 바깥 성문에 흰 깃발, 문이 열려 몽골군이 흘러 들어감 → "성 안에 또 하나의 성" 성채가 반짝이며 카메라가 다가감
// → "그 성채로 들어가 끝까지 버텼습니다" 성채 문은 닫힌 채 초록 깃발·수비병, 둘레를 몽골군이 에워쌈 → 질문 → 검게
const OUT_C = [980, 560], OUT_R = [760, 400];
const CIT_C = [620, 470], CIT_R = [170, 115];
const ringPt = (c: number[], r: number[], a: number) => [c[0] + Math.cos(a) * r[0], c[1] + Math.sin(a) * r[1]];
const GATE_A = 0; // 바깥 성문: 동쪽(오른쪽)
const Bukhara = ({ f, open, cit, siege }: { f: number; open: number; cit: number; siege: number }) => {
  const gate = ringPt(OUT_C, OUT_R, GATE_A);
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #e2cc96, #cdb07a 75%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", ...ink }}>
        {/* 바깥 성벽 */}
        <ellipse cx={OUT_C[0]} cy={OUT_C[1]} rx={OUT_R[0]} ry={OUT_R[1]} fill="#e8d6a8" stroke={SAND_DD} strokeWidth={34} />
        <ellipse cx={OUT_C[0]} cy={OUT_C[1]} rx={OUT_R[0]} ry={OUT_R[1]} fill="none" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 28 }).map((_, i) => { const p = ringPt(OUT_C, OUT_R, (i / 28) * Math.PI * 2); return <rect key={i} x={p[0] - 14} y={p[1] - 14} width={28} height={28} fill={SAND} stroke={INK} strokeWidth={4} />; })}
        {/* 2판 (2026-11-02): 골목 + 집(평지붕·그림자·안뜰) + 둥근 지붕 몇 개 + 큰 모스크(돔·첨탑) + 시장 + 대추야자 */}
        {Array.from({ length: 8 }).map((_, k) => { const a = (k / 8) * Math.PI * 2 + 0.2; const p = ringPt(OUT_C, [OUT_R[0] * 0.92, OUT_R[1] * 0.92], a); return <path key={`st${k}`} d={`M ${OUT_C[0] + 60} ${OUT_C[1] + 10} L ${p[0]} ${p[1]}`} stroke="#c7aa70" strokeWidth={16} />; })}
        {Array.from({ length: 120 }).map((_, i) => {
          const a = rnd(i, 31) * Math.PI * 2, r = 0.12 + rnd(i, 32) * 0.8;
          const x = OUT_C[0] + Math.cos(a) * OUT_R[0] * r, y = OUT_C[1] + Math.sin(a) * OUT_R[1] * r;
          if (Math.hypot((x - CIT_C[0]) / (CIT_R[0] + 60), (y - CIT_C[1]) / (CIT_R[1] + 50)) < 1) return null;
          if (Math.hypot(x - OUT_C[0] - 60, y - OUT_C[1] - 10) < 110) return null;
          const w = 34 + (i % 4) * 8, h = 26 + (i % 3) * 6;
          const dome = i % 9 === 0;
          return (
            <g key={`h${i}`}>
              <rect x={x - w / 2 + 6} y={y - h / 2 + 6} width={w} height={h} fill="rgba(43,29,20,.22)" />
              <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={i % 4 ? "#e2cb98" : "#d2b682"} stroke={INK} strokeWidth={3} />
              {i % 3 === 0 && !dome && <rect x={x - w / 5} y={y - h / 5} width={w / 2.5} height={h / 2.5} fill="#b89a64" />}
              {dome && <circle cx={x} cy={y} r={h / 2.4} fill="#4f8fa8" stroke={INK} strokeWidth={3} />}
            </g>
          );
        })}
        {/* 시장 (줄무늬 차양) */}
        {[[1260, 640], [1320, 690], [1200, 700]].map(([x, y], k) => <g key={`mk${k}`}><rect x={x - 26} y={y - 16} width={52} height={32} fill={["#a8332a", "#4d6b8a", "#c9a24a"][k]} stroke={INK} strokeWidth={3} />{[-14, 0, 14].map((dx) => <path key={dx} d={`M ${x + dx} ${y - 16} l 0 32`} stroke="#f4efe2" strokeWidth={4} />)}</g>)}
        {/* 큰 모스크: 안뜰 + 큰 돔 + 첨탑 */}
        <g transform="translate(1040 540)">
          <rect x={-90} y={-70} width={180} height={140} fill="#e8d6a8" stroke={INK} strokeWidth={4} />
          <rect x={-60} y={-40} width={120} height={80} fill="#d8c08c" stroke={INK} strokeWidth={3} />
          <circle cx={0} cy={-70} r={44} fill="#3f8f8a" stroke={INK} strokeWidth={5} />
          <circle cx={-10} cy={-80} r={12} fill="#7fc0b8" opacity={0.7} />
          <circle cx={110} cy={-60} r={18} fill={SAND} stroke={INK} strokeWidth={4} />
          <circle cx={110} cy={-60} r={8} fill="#3f8f8a" />
        </g>
        {/* 대추야자 */}
        {[[1500, 420], [1580, 700], [820, 760], [1300, 300], [460, 650]].map(([x, y], k) => <PalmTop key={`pm${k}`} x={x} y={y} s={0.8} r={k * 30} />)}
        {/* 큰 길: 바깥 성문 → 도시 가운데 */}
        <path d={`M ${gate[0]} ${gate[1]} L ${OUT_C[0] + 60} ${OUT_C[1] + 20}`} stroke="#c2a56c" strokeWidth={30} />
        {/* 성채: 언덕 + 자기 성벽 */}
        <ellipse cx={CIT_C[0]} cy={CIT_C[1] + 20} rx={CIT_R[0] + 70} ry={CIT_R[1] + 55} fill="#b99a5e" stroke={INK} strokeWidth={4} />
        <ellipse cx={CIT_C[0]} cy={CIT_C[1]} rx={CIT_R[0]} ry={CIT_R[1]} fill="#d8c08c" stroke={SAND_DD} strokeWidth={26} />
        <ellipse cx={CIT_C[0]} cy={CIT_C[1]} rx={CIT_R[0]} ry={CIT_R[1]} fill="none" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }).map((_, i) => { const p = ringPt(CIT_C, CIT_R, (i / 12) * Math.PI * 2); return <rect key={`c${i}`} x={p[0] - 12} y={p[1] - 12} width={24} height={24} fill={SAND} stroke={INK} strokeWidth={3} />; })}
        <path d={`M ${CIT_C[0] - 40} ${CIT_C[1]} C ${CIT_C[0] - 40} ${CIT_C[1] - 60} ${CIT_C[0] + 40} ${CIT_C[1] - 60} ${CIT_C[0] + 40} ${CIT_C[1]} Z`} fill="#3f8f8a" stroke={INK} strokeWidth={4} />
        {cit > 0 && <ellipse cx={CIT_C[0]} cy={CIT_C[1]} rx={CIT_R[0] + 26} ry={CIT_R[1] + 22} fill="none" stroke="#f2d27a" strokeWidth={10} opacity={cit * (0.5 + 0.5 * Math.sin(f / 5))} />}
        {/* 바깥 성문: 열림 */}
        <rect x={gate[0] - 22} y={gate[1] - 40 + open * 50} width={44} height={80 - open * 50} fill="#7a5230" stroke={INK} strokeWidth={4} />
        <g transform={`translate(${gate[0] + 30} ${gate[1] - 30})`} opacity={lerp(open, 0, 0.3, 0, 1)}><path d="M 0 0 L 0 -90" stroke={INK} strokeWidth={6} /><path d="M 2 -90 l 60 10 l -8 22 l -52 2 Z" fill="#f4efe2" stroke={INK} strokeWidth={3} /></g>
        {/* 흘러 들어가는 몽골군 */}
        {open > 0 && Array.from({ length: 40 }).map((_, i) => {
          const u = Math.max(0, Math.min(1, open * 1.6 - (i / 40) * 0.6));
          const sx = 1920 + 60 + (i % 4) * 26, sy = gate[1] - 30 + (i % 5) * 14;
          const tx = OUT_C[0] + 120 - (i % 8) * 34, ty = OUT_C[1] - 40 + Math.floor(i / 8) * 26;
          const x = u < 0.5 ? sx + (gate[0] - sx) * (u * 2) : gate[0] + (tx - gate[0]) * (u * 2 - 1);
          const y = u < 0.5 ? sy + (gate[1] - sy) * (u * 2) : gate[1] + (ty - gate[1]) * (u * 2 - 1);
          return u > 0 ? <MoG key={`m${i}`} x={x} y={y} s={1.4} flip /> : null;
        })}
        {/* 성채를 에워싼 몽골군 */}
        {siege > 0 && Array.from({ length: 24 }).map((_, i) => { const p = ringPt(CIT_C, [CIT_R[0] + 110, CIT_R[1] + 80], (i / 24) * Math.PI * 2 + f * 0.004); return <MoG key={`s${i}`} x={p[0]} y={p[1] + 10} s={1.4} flip={Math.cos((i / 24) * Math.PI * 2) > 0} />; }).filter((_, i) => i / 24 < siege)}
      </svg>
      {/* 성채 수비병 + 깃발 */}
      {cit > 0 && Array.from({ length: 6 }).map((_, i) => { const p = ringPt(CIT_C, CIT_R, Math.PI + (i / 5) * Math.PI); return <Spearman key={i} x={p[0]} y={p[1] + 4} s={0.09} spear={-10} />; })}
      <KhFlag x={CIT_C[0] + 10} y={CIT_C[1] - 50} h={110} />
    </>
  );
};
const S8: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a18 = at(id(23)), a19 = at(id(24)), a20 = at(id(25));
  const open = lerp(f, tl(id(22), 1.6), a18, 0, 1);
  const zoom = lerp(f, a18 + tl(id(23), 0.6), a19, 0, 1, true);
  const z = 1 + zoom * 1.1 + lerp(f, a20, frames, 0, 0.2);
  return (
    <AbsoluteFill>
      <Cam z={z} cx={OUT_C[0] + (CIT_C[0] - OUT_C[0]) * zoom} cy={OUT_C[1] + (CIT_C[1] - OUT_C[1]) * zoom}>
        <Bukhara f={f} open={open} cit={lerp(f, a18 + tl(id(23), 1.6), a18 + tl(id(23), 2.4), 0, 1)} siege={lerp(f, a19, a19 + tl(id(24), 2.4), 0, 1)} />
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 24, frames, 0, 1) }} />
      <SFX name="gate" at={tl(id(22), 1.6)} vol={0.3} dur={30} />
      <SFX name="hooves" at={tl(id(22), 2)} vol={0.2} dur={a18 - tl(id(22), 2)} />
      <SFX name="bell" at={a18 + tl(id(23), 1.6)} vol={0.2} dur={40} />
      <SFX name="drum" at={a20 + tl(id(25), 2.2)} vol={0.3} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: [id(1), id(2), id(3)], Shot: S1 },
  { ids: [id(4), id(5), id(6), id(7), id(8)], Shot: S2 },
  { ids: [id(9)], Shot: Lead },
  { ids: [id(10), id(11)], Shot: Herd },
  { ids: [id(12)], Shot: SmallWell },
  { ids: [id(13), id(14)], Shot: S3 },
  { ids: [id(15), id(16), id(17)], Shot: S4 },
  { ids: [id(18)], Shot: S5 },
  { ids: [id(19), id(20)], Shot: S6 },
  { ids: [id(21)], Shot: S7 },
  { ids: [id(22), id(23), id(24), id(25)], Shot: S8 },
];
export const M02Ch2 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m2.2" year="1220" groups={groups} music="march" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void SAND_D;
