// 몽골 1편 수정판 3장 - 서하의 성을 무너뜨리는 법 (대본 04:05-05:35)
// 포로·해자(공격하는 쪽 등 뒤 정면) · 궁수의 체력(눈금) · 피란민 몰기(위에서 본 구조도) · 성 안(곡식 눈금) · 수공(1편 S2 그대로)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chapter, Char, cue, Dim, Ger, Glow, Group, INK, Lang, LangContext, SFX, ShotProps, Steppe, Tug } from "./kit";
import { Cam, ChinaMap, Flames, GateTowerG, House, MON, Person, S2, S2b, S2c, S3, Smoke, Spear, WallG, XIA_SOL } from "./M01Ch4";
import { ArrowVolley, lerp, MapFire, Sack, sec, Svg, XIA_FOLK } from "./M01RParts";

const id = (n: number) => `m1r.c3_${String(n).padStart(2, "0")}`;
// 1) 지도: 해마다 서하로, 성마다 불
const SPOTS = [[720, 500], [850, 520], [780, 600], [690, 430], [900, 590]];
const Raids: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2));
  const xia = lerp(f, a2 + cue(id(2), 1), frames - 16, 0, 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.5, 1.95)} cx={lerp(f, 0, frames, 900, 800)} cy={lerp(f, 0, frames, 400, 500)}>
        <ChinaMap f={f} rich={1} jin={1} strings={0} arrow={lerp(f, 6, a2, 0, 1, true)} pull={0} xia={xia} />
        {f < a2 + cue(id(2), 1) && <Char id="genghis" x={700} h={300} pose="side" bottom={1080 - 340} enter="none" beat="none" />}
        <Svg>{SPOTS.map(([x, y], i) => { const on = lerp(f, a2 + 20 + i * 26, a2 + 34 + i * 26, 0, 1); return on > 0 ? <MapFire key={i} x={x} y={y} k={1.1 * on} f={f} /> : null; })}</Svg>
      </Cam>
      <SFX name="hooves" at={6} vol={0.18} dur={frames - 10} />
    </AbsoluteFill>
  );
};
// 2) 맥락: 불탄 서하 마을에서 끌려오는 사람들 → 등 뒤에서 본 해자와 성벽
const MOAT_TOP = 640, MOAT_BOT = 760;
const WallFront = ({ f, fill }: { f: number; fill: number }) => (
  <>
    <Steppe time="dusk" horizon={520} hills={false} />
    <Svg>
      <WallG x0={-40} x1={1960} top={190} base={MOAT_TOP} c="#a8957a" />
      <GateTowerG x={960} y={190} s={1.05} />
      <path d={`M 840 ${MOAT_TOP} L 840 430 C 860 370 1060 370 1080 430 L 1080 ${MOAT_TOP} Z`} fill="#7a5230" stroke={INK} strokeWidth={6} />
      {/* 해자: 깊은 물 도랑 → 메워지는 흙 */}
      <path d={`M -40 ${MOAT_TOP} L 1960 ${MOAT_TOP} L 1960 ${MOAT_BOT} L -40 ${MOAT_BOT} Z`} fill="#4f7a8a" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${i * 170 - 20 + Math.sin(f / 14 + i) * 16} ${MOAT_TOP + 30 + (i % 3) * 26} q 30 -10 60 0`} stroke="#8fb0c0" strokeWidth={4} fill="none" />)}
      {fill > 0 && <path d={`M ${960 - 620 * fill} ${MOAT_BOT} C ${960 - 300 * fill} ${MOAT_BOT - 150 * fill} ${960 + 300 * fill} ${MOAT_BOT - 150 * fill} ${960 + 620 * fill} ${MOAT_BOT} Z`} fill="#8a6f44" stroke={INK} strokeWidth={5} />}
    </Svg>
    {Array.from({ length: 11 }).map((_, i) => <Person key={i} L={XIA_SOL} x={120 + i * 168} y={214} h={120} arms="hold" eyes="dot" />)}
  </>
);
const Moat: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(3), 1), c2 = cue(id(3), 2);
  const FRONT = Math.max(sec(2.4), c1 - 20);
  const fill = lerp(f, c1, frames - 10, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < FRONT + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, FRONT, 1.08, 1.0)} cx={900} cy={600}>
            <Steppe time="dusk" horizon={520} />
            <Svg>
              {[[1420, 520], [1600, 540], [1260, 500], [1760, 520]].map(([x, y], i) => <House key={i} x={x} y={y} k={3} />)}
            </Svg>
            <Smoke x={1420} y={400} f={f} n={3} s={1.5} />
            <Smoke x={1640} y={410} f={f} n={3} s={1.3} />
            <Flames x={1500} y={520} w={300} f={f} />
            {/* 밧줄에 묶여 끌려오는 마을 사람들 */}
            <Svg><path d={`M ${lerp(f, 0, FRONT, 1320, 1040)} 860 L ${lerp(f, 0, FRONT, 420, 140)} 860`} stroke="#7a5a3a" strokeWidth={6} /></Svg>
            {[0, 1, 2, 3, 4].map((i) => <Person key={i} L={XIA_FOLK[i % 4]} x={lerp(f, 0, FRONT, 1240 - i * 180, 960 - i * 180)} y={960 + (i % 2) * 18} h={370} arms="offer" eyes={i % 2 ? "cry" : "worry"} mouth="frown" flip bob={Math.abs(Math.sin(f / 6 + i)) * 8} rot={-4} />)}
            <Person L={MON} x={lerp(f, 0, FRONT, 300, 20)} y={990} h={440} arms="fist" eyes="angry" flip bob={Math.abs(Math.sin(f / 6)) * 8} />
            <Person L={MON} x={lerp(f, 0, FRONT, 1450, 1170)} y={990} h={440} arms="hold" eyes="side" flip bob={Math.abs(Math.sin(f / 6 + 2)) * 8}><Spear x={222} y={300} /></Person>
          </Cam>
        </AbsoluteFill>
      )}
      {f >= FRONT && (
        <AbsoluteFill style={{ opacity: lerp(f, FRONT, FRONT + 12, 0, 1) }}>
          <Cam z={lerp(f, FRONT, frames, 1.0, 1.08)} cx={960} cy={540}>
            <WallFront f={f} fill={fill} />
            <ArrowVolley f={f} x0={100} x1={1800} y0={230} y1={780} n={28} op={lerp(f, FRONT + 10, FRONT + 40, 0, 1) * lerp(f, c2, c2 + 90, 1, 0.3)} />
            {/* 맨 앞의 포로: 흙짐을 지고 해자로 */}
            {Array.from({ length: 9 }).map((_, i) => {
              const k = ((f - FRONT) * 0.0042 + i * 0.111) % 1;
              const y = lerp(k, 0, 1, 1040, 730), s = lerp(k, 0, 1, 1.05, 0.55);
              const x = 300 + ((i * 317) % 1320);
              const op = lerp(k, 0.82, 1, 1, 0);
              return (
                <div key={i} style={{ position: "absolute", inset: 0, opacity: op }}>
                  <Person L={XIA_FOLK[i % 4]} x={x} y={y} h={330 * s} arms="up" eyes="cry" mouth="wail" t={f + i} bob={Math.abs(Math.sin(f / 5 + i)) * 8} />
                  <Svg><Sack x={x - 4} y={y - 330 * s - 6} s={0.9 * s} c="#a8895a" /></Svg>
                </div>
              );
            })}
            {/* 그 뒤에 몸을 숨긴 몽골 병사들 (등 쪽 큰 그림) */}
            {[[40, 1180], [330, 1290], [1590, 1290], [1880, 1180]].map(([x, y], i) => <Person key={i} L={MON} x={x} y={y} h={600} arms="hold" eyes="side" rot={(i % 2 ? 1 : -1) * 2}><Spear x={222} y={300} /></Person>)}
          </Cam>
          <SFX name="arrow_rain" at={FRONT + 8} vol={0.26} dur={frames - FRONT - 8} />
          <SFX name="crowd" at={FRONT} vol={0.14} dur={frames - FRONT} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 3) 궁수 가까이: 떨리는 손, 비어 가는 화살 통 → 같은 서하인을 내려다봄 → 주저앉음
const Quiver = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -46 -210 L 46 -210 L 34 90 L -34 90 Z" fill="#7a5a3a" stroke={INK} strokeWidth={7} />
    <path d="M -46 -180 L 46 -180 M -40 -60 L 40 -60" stroke="#4a3522" strokeWidth={7} />
    {Array.from({ length: n }).map((_, i) => <g key={i} transform={`translate(${-30 + i * 10} ${-214 - (i % 2) * 18})`}><path d="M 0 0 L 0 -90" stroke={INK} strokeWidth={5} /><path d="M -8 -90 L 0 -110 L 8 -90 L 0 -82 Z" fill="#f2ead8" stroke={INK} strokeWidth={3} /></g>)}
  </g>
);
const Archer: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(4), 1), c2 = cue(id(4), 2);
  const down = c1 + 4;
  const n = Math.round(lerp(f, 6, c2 + 30, 7, 1));
  const tired = lerp(f, 10, c2 + 30, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {(f < down + 12 || f >= c2) && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={960} cy={560}>
            <AbsoluteFill style={{ background: "linear-gradient(#d8c9a8, #e9dfc4)" }} />
            <Svg>{Array.from({ length: 8 }).map((_, i) => <rect key={i} x={i * 260 - 40} y={820} width={170} height={300} fill="#a8957a" stroke={INK} strokeWidth={6} />)}<path d="M -40 900 L 1960 900 L 1960 1120 L -40 1120 Z" fill="#a8957a" stroke={INK} strokeWidth={6} /></Svg>
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${lerp(f, c2, c2 + 60, 0, 240, true)}px) rotate(${lerp(f, c2, c2 + 60, 0, -6, true)}deg)`, transformOrigin: "50% 100%" }}>
              <Person L={XIA_SOL} x={900} y={1260} h={1180} arms="hold" eyes={f >= c2 ? "shut" : tired > 0.5 ? "worry" : "angry"} mouth={tired > 0.4 ? "frown" : "flat"} bow={tired * 0.2} rot={Math.sin(f / 2.2) * tired * 1.6} sweat={tired > 0.25}>
                <g transform="translate(232 240)"><path d="M 16 -130 Q -60 0 16 130" stroke={INK} strokeWidth={12} fill="none" /><path d="M 16 -130 Q -60 0 16 130" stroke="#8a5a2e" strokeWidth={6} fill="none" /><path d="M 16 -130 L 16 130" stroke="#e8dcc0" strokeWidth={2.5} /></g>
              </Person>
            </div>
            <Svg><Quiver x={1500} y={880} n={n} /></Svg>
            {f >= c2 + 20 && <Person L={XIA_SOL} x={320} y={1040} h={520} arms="sleeves" eyes="shut" mouth="frown" kneel bow={0.6} />}
          </Cam>
        </AbsoluteFill>
      )}
      {f >= down && f < c2 + 12 && (
        <AbsoluteFill style={{ opacity: Math.min(lerp(f, down, down + 12, 0, 1), lerp(f, c2, c2 + 12, 1, 0)) }}>
          <Cam z={lerp(f, down, c2 + 12, 1.0, 1.1)} cx={960} cy={700}>
            <AbsoluteFill style={{ background: "linear-gradient(#8a6f44, #c4a56a)" }} />
            {[[260, 1300, 880, 0], [740, 1250, 820, 1], [1180, 1280, 860, 2], [1650, 1320, 900, 3]].map(([x, y, h, i]) => <Person key={i} L={XIA_FOLK[i]} x={x} y={y} h={h} arms="up" eyes="cry" mouth="wail" t={f + i * 4} rot={Math.sin(f / 7 + i) * 3} />)}
          </Cam>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 4) 위에서 본 큰 성과 둘레 마을들: 마을마다 불, 사람 점이 큰 성으로
const VILLAGES = [[300, 260], [420, 780], [760, 130], [1240, 110], [1620, 300], [1660, 760], [1180, 930], [720, 950]];
const Refugees: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(5), 1);
  const fireAt = (i: number) => 10 + i * 12;
  const flow = lerp(f, c1 - 10, frames, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#b7c48a" }}>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={960} cy={520}>
        <Svg>
          <rect x={-200} y={-200} width={2320} height={1480} fill="#b7c48a" />
          {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${(i * 311) % 1920} ${(i * 173) % 1080} l 40 -6`} stroke="#8f9f62" strokeWidth={4} />)}
          {/* 길 */}
          {VILLAGES.map(([x, y], i) => <path key={i} d={`M ${x} ${y} Q ${(x + 960) / 2 + 40} ${(y + 520) / 2 - 30} 960 520`} stroke="#d9c79a" strokeWidth={16} fill="none" />)}
          {/* 큰 성 (위에서) */}
          <path d="M 700 330 L 1220 330 L 1220 710 L 700 710 Z" fill="#cdbb94" stroke={INK} strokeWidth={8} />
          <path d="M 730 360 L 1190 360 L 1190 680 L 730 680 Z" fill="#e0d2ad" stroke={INK} strokeWidth={4} />
          {[[700, 330], [1220, 330], [700, 710], [1220, 710], [960, 330], [960, 710], [700, 520], [1220, 520]].map(([x, y], i) => <rect key={i} x={x - 22} y={y - 22} width={44} height={44} fill="#a8957a" stroke={INK} strokeWidth={5} />)}
          {Array.from({ length: 28 }).map((_, i) => <House key={i} x={770 + (i % 7) * 64} y={420 + Math.floor(i / 7) * 62} k={0.9} />)}
          {/* 마을: 집 + 불 */}
          {VILLAGES.map(([x, y], i) => {
            const fire = lerp(f, fireAt(i), fireAt(i) + 16, 0, 1, true);
            return <g key={i}>{[[-40, 10], [30, -14], [6, 34]].map(([dx, dy], j) => <g key={j} opacity={1 - fire * 0.55}><House x={x + dx} y={y + dy} k={1.2} /></g>)}{fire > 0 && <MapFire x={x} y={y - 10} k={1.5 * fire} f={f} />}</g>;
          })}
          {/* 사람 점 행렬 */}
          {VILLAGES.map(([x, y], i) => Array.from({ length: 12 }).map((_, j) => {
            const k = (flow * 1.35 - j * 0.03 - (i % 3) * 0.02);
            if (k <= 0 || k >= 1) return null;
            const qx = (x + 960) / 2 + 40, qy = (y + 520) / 2 - 30;
            const px = (1 - k) * (1 - k) * x + 2 * (1 - k) * k * qx + k * k * 960;
            const py = (1 - k) * (1 - k) * y + 2 * (1 - k) * k * qy + k * k * 520;
            return <circle key={`${i}-${j}`} cx={px + Math.sin(j * 7) * 8} cy={py + Math.cos(j * 5) * 8} r={7} fill="#4a3522" stroke={INK} strokeWidth={1.5} />;
          }))}
          {/* 몽골 기병 부호: 마을 뒤에서 몰아넣음 */}
          {VILLAGES.map(([x, y], i) => { const dx = x - 960, dy = y - 520, d = Math.hypot(dx, dy); const r = 70 + 40 * Math.sin(f / 30 + i); return <g key={i} transform={`translate(${x + (dx / d) * r} ${y + (dy / d) * r})`} opacity={lerp(f, fireAt(i), fireAt(i) + 10, 0, 1)}><path d="M -12 16 L 0 -18 L 12 16 Z" fill="#3f5f86" stroke={INK} strokeWidth={3} /></g>; })}
        </Svg>
      </Cam>
      <SFX name="fire" at={10} vol={0.16} dur={frames - 10} />
    </AbsoluteFill>
  );
};
// 5) 성 안: 사람이 불어나는 골목 + 곡식 눈금이 내려감 → 다툼 → 고개 숙인 수비병
const Inside: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(6), 1), c2 = cue(id(6), 2);
  const grain = lerp(f, 6, c1 + 40, 1, 0.12);
  const crowd = Math.round(lerp(f, 0, c1, 4, 18));
  const CR = [[1180, 880], [1320, 900], [1020, 900], [860, 880], [1480, 910], [720, 910], [1100, 960], [1260, 980], [940, 980], [800, 990], [1420, 990], [1580, 970], [620, 980], [1150, 1040], [980, 1060], [1320, 1060], [760, 1070], [1500, 1060]];
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={lerp(f, c2, c2 + 40, 960, 1040, true)} cy={590}>
        <Steppe time="dusk" horizon={430} hills={false} />
        <Svg>
          <WallG x0={-40} x1={1960} top={130} base={430} />
          {[120, 460, 1400, 1720].map((x, i) => <g key={i}><path d={`M ${x - 130} 700 L ${x - 130} 440 L ${x + 130} 440 L ${x + 130} 700 Z`} fill="#d8c8a4" stroke={INK} strokeWidth={6} /><path d={`M ${x - 170} 450 L ${x} 350 L ${x + 170} 450 Z`} fill="#7a3426" stroke={INK} strokeWidth={6} /></g>)}
          {/* 곡식 창고 눈금 */}
          <g transform="translate(200 520)">
            <rect x={-90} y={0} width={180} height={420} rx={8} fill="#6e5236" stroke={INK} strokeWidth={8} />
            <rect x={-74} y={16 + 388 * (1 - grain)} width={148} height={388 * grain} fill="#d9b85a" stroke={INK} strokeWidth={3} />
            {[1, 2, 3].map((i) => <path key={i} d={`M -74 ${16 + i * 97} L -44 ${16 + i * 97}`} stroke={INK} strokeWidth={5} />)}
            <Sack x={0} y={-50} s={0.9} />
          </g>
        </Svg>
        {CR.slice(0, crowd).map(([x, y], i) => <Person key={i} L={XIA_FOLK[i % 4]} x={x} y={y} h={y > 1000 ? 340 : y > 950 ? 310 : 280} arms={f >= c1 + 10 && i % 4 === 0 ? "fist" : "sleeves"} eyes={f >= c1 + 10 ? (i % 4 === 0 ? "angry" : "worry") : "worry"} mouth={f >= c1 + 10 && i % 4 === 0 ? "talk" : "frown"} t={f + i * 3} flip={i % 2 === 0} bob={Math.abs(Math.sin(f / 9 + i)) * 4} />)}
        {f >= c2 && [0, 1].map((i) => <Person key={i} L={XIA_SOL} x={1680 + i * 160} y={1040} h={480} arms="hold" eyes="worry" mouth="frown" bow={lerp(f, c2, c2 + 40, 0, 0.5)} flip><Spear x={222} y={300} /></Person>)}
      </Cam>
      <SFX name="crowd" at={0} vol={0.2} dur={frames} />
      {frames < 0 && <Ger x={0} y={0} />}
    </AbsoluteFill>
  );
};
// 6) 수공: 1편 S2 그대로 (둑 → 터짐 → 몽골 진영이 잠김) - 줄 자리만 이 대본에 맞춤
const Flood: React.FC<ShotProps> = ({ at, frames }) => (
  <S2 frames={frames} at={(k) => k.endsWith("6") ? at(id(9)) + cue(id(9), 1) : k.endsWith("7") ? at(id(10)) : at(id(10)) + cue(id(10), 1) + 30} />
);
// 7) 물이 빠진 뒤 다시 에워쌈 (1편 S2b)
const After: React.FC<ShotProps> = (p) => <S2b {...p} />;
const Refuse: React.FC<ShotProps> = (p) => <S2c {...p} />;
const Surrender: React.FC<ShotProps> = (p) => <S3 {...p} />;
const groups: Group[] = [
  { ids: [id(1), id(2)], Shot: Raids },
  { ids: [id(3)], Shot: Moat },
  { ids: [id(4)], Shot: Archer },
  { ids: [id(5)], Shot: Refugees },
  { ids: [id(6)], Shot: Inside },
  { ids: [id(7), id(8), id(9), id(10)], Shot: Flood },
  { ids: [id(11)], Shot: After },
  { ids: [id(12)], Shot: Refuse },
  { ids: [id(13), id(14)], Shot: Surrender },
];
export const M01RCh3 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m1r.3" year="1207" groups={groups} music="siege" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void Char; void Dim; void Glow; void Tug;
