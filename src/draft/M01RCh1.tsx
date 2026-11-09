// 몽골 1편 수정판 1장 - 주변 나라와 교역 (대본 00:26-02:13)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chapter, Char, cue, Fire, Ger, Glow, Group, INK, Lang, LangContext, SFX, ShotProps, Steppe, Tug } from "./kit";
import { Cam, ChinaMap, Cart, EMPEROR, Flames, FlagG, GateTowerG, Horse, House, JIN_SOL, MON, OFFICIAL, P, Person, RiderOn, Sabre, Shovel, WallG, walkBob } from "./M01Ch4";
import { Sheep } from "./M01Ch2";
import { Wagon } from "./M01Ch3";
import { Balance, FARMER, HERDER, HERDER2, IronBar, lerp, NationMap, Sack, SaltBlock, sec, SilkBolt, Svg, TeaBrick } from "./M01RParts";

const id = (n: number) => `m1r.c1_${String(n).padStart(2, "0")}`;
void Flames; void House; void EMPEROR; void GateTowerG; void P;
// 1) 지도: 나라가 대사 순서대로 켜짐 → 금나라만 남고 칭기즈칸이 노려봄
const Neighbors: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2)), a3 = at(id(3)), a4 = at(id(4));
  const show = {
    mongol: lerp(f, 0, 14, 0, 1),
    jin: lerp(f, a2, a2 + 16, 0, 1),
    song: lerp(f, a2 + cue(id(2), 1), a2 + cue(id(2), 1) + 16, 0, 1),
    khitan: lerp(f, a3, a3 + 16, 0, 1),
    xia: lerp(f, a3 + cue(id(3), 1), a3 + cue(id(3), 1) + 16, 0, 1),
  };
  const dim = lerp(f, a4, a4 + 24, 0, 1, true);
  const keys: [number, number, number, number][] = [[0, 1.2, 980, 280], [a2, 1.2, 1180, 470], [a2 + cue(id(2), 1), 1.15, 1180, 620], [a3, 1.15, 560, 340], [a3 + cue(id(3), 1), 1.45, 800, 480], [a4, 1.12, 1060, 460], [frames, 1.2, 1100, 460]];
  const interp = (k: 1 | 2 | 3) => { let v = keys[0][k]; for (let i = 1; i < keys.length; i++) { const [t0] = keys[i - 1], [t1] = keys[i]; if (f >= t0) v = lerp(f, t0, Math.min(t1, t0 + 36), keys[i - 1][k], keys[i][k], true); } return v; };
  return (
    <AbsoluteFill>
      <Cam z={interp(1)} cx={interp(2)} cy={interp(3)}>
        <NationMap show={show} fade={{ mongol: 0, song: dim, xia: dim, khitan: dim }}>
          {show.jin > 0.5 && <FlagG x={1262} y={560} banner="jin" h={130} t={f} />}
          {show.xia > 0.5 && <FlagG x={770} y={560} banner="xia" h={110} t={f} fall={0} />}
          {show.song > 0.5 && <g transform="translate(1130 830)"><path d="M 0 0 L 0 -110" stroke={INK} strokeWidth={7} /><path d="M 2 -108 L 70 -96 L 2 -70 Z" fill="#c9a24a" stroke={INK} strokeWidth={4} /></g>}
          {show.khitan > 0.5 && <g transform="translate(330 320)"><path d="M 0 0 L 0 -110" stroke={INK} strokeWidth={7} /><path d="M 2 -108 L 70 -108 L 56 -88 L 70 -66 L 2 -66 Z" fill="#6a4a8a" stroke={INK} strokeWidth={4} /></g>}
        </NationMap>
        <Tug x={832} y={300} h={140} sway={Math.sin(f / 14) * 4} />
      </Cam>
      {f >= a4 && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${lerp(f, a4, a4 + 18, -500, 0, true)}px)` }}>
          <Char id="genghis" x={360} h={760} pose="angry" bottom={-60} enter="none" beat="none" />
        </div>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, 0, 14, 1, 0) }} />
      <SFX name="wind" at={0} vol={0.14} dur={frames} fade={8} />
    </AbsoluteFill>
  );
};
// 장성 아래 교역 시장: 저울을 쥔 금나라 관리, 말을 끌고 온 몽골 상인, shut = 문이 닫힘
export const Market = ({ f, shut = 0, tip = 0, goods = 1, closeLedger = 0, trader = 1 }: { f: number; shut?: number; tip?: number; goods?: number; closeLedger?: number; trader?: number }) => (
  <AbsoluteFill>
    <Steppe time="day" horizon={500} hills={false} />
    <Svg>
      <WallG x0={-40} x1={1960} top={190} base={560} />
      <GateTowerG x={1180} y={190} s={1.15} />
      <path d="M 1040 560 L 1040 340 C 1060 270 1300 270 1320 340 L 1320 560 Z" fill="#3a2a1e" stroke={INK} strokeWidth={6} />
      {/* 시장 문짝 */}
      <path d={`M 1040 560 L ${1040 + 140 * shut} 560 L ${1040 + 140 * shut} 300 L 1040 340 Z`} fill="#7a5230" stroke={INK} strokeWidth={5} />
      <path d={`M 1320 560 L ${1320 - 140 * shut} 560 L ${1320 - 140 * shut} 300 L 1320 340 Z`} fill="#7a5230" stroke={INK} strokeWidth={5} />
      {/* 차양 달린 좌판 + 쌓인 곡식·비단 */}
      <path d="M 1380 760 L 1860 760 L 1860 900 L 1380 900 Z" fill="#a8865a" stroke={INK} strokeWidth={6} />
      <path d="M 1340 640 L 1900 640 L 1860 560 L 1380 560 Z" fill="#a8332a" stroke={INK} strokeWidth={6} />
      {[1380, 1860].map((x) => <path key={x} d={`M ${x} 640 L ${x} 760`} stroke={INK} strokeWidth={9} />)}
      {goods > 0 && <g opacity={goods}>
        {[[1450, 700], [1540, 705], [1630, 700], [1495, 650]].map(([x, y], i) => <Sack key={i} x={x} y={y} s={0.75} />)}
        <SilkBolt x={1760} y={730} s={0.8} /><SilkBolt x={1755} y={690} s={0.8} c="#3f6690" /><TeaBrick x={1650} y={740} s={0.6} />
      </g>}
      <FlagG x={880} y={190} banner="jin" h={150} t={f} />
      <FlagG x={1500} y={190} banner="jin" h={150} t={f} />
    </Svg>
    <Person L={JIN_SOL} x={960} y={620} h={260} arms="hold" eyes="side" />
    <Person L={JIN_SOL} x={1400} y={620} h={260} arms="hold" eyes="side" flip />
    {/* 관리: 저울 + 장부 */}
    <Person L={OFFICIAL} x={1280} y={990} h={470} arms="offer" eyes={shut > 0.3 ? "sly" : "side"} mouth={shut > 0.3 ? "grin" : "flat"} flip front={<>
      <Balance x={150} y={330} s={1} tip={tip} />
      <g transform={`translate(150 300) rotate(${-closeLedger * 12})`}><path d={`M -46 -28 L 46 -28 L 46 28 L -46 28 Z`} fill="#e8dcc0" stroke={INK} strokeWidth={4} /><path d={`M 0 -28 L 0 28 M -34 -12 L -8 -12 M -34 0 L -8 0 M 8 -12 L 34 -12`} stroke={INK} strokeWidth={2.5} /></g>
    </>} />
    {/* 몽골 상인과 말 */}
    {trader > 0 && <>
      <Horse x={230} y={950} w={520} run={false} graze={0.2} />
      <Person L={MON} x={720} y={1010} h={470} arms="offer" eyes={shut > 0.3 ? "worry" : "dot"} mouth={shut > 0.3 ? "frown" : "flat"} sweat={shut > 0.3} />
    </>}
  </AbsoluteFill>
);
const Trade: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a6 = at(id(6));
  const tip = f < a6 ? Math.sin(f / 12) * 0.4 : 1;
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.12)} cx={f < a6 ? 1000 : lerp(f, a6, a6 + 40, 1000, 1200, true)} cy={700}>
        <Market f={f} tip={tip} />
      </Cam>
      <SFX name="coins" at={8} vol={0.22} dur={40} />
    </AbsoluteFill>
  );
};
// 2) 유목민 가족과 양 떼, 게르를 싣고 옮겨 가는 행렬
const Move: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const shift = lerp(f, 0, frames, 0, 180);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.05)} cx={960} cy={600}>
        <Steppe time="day" horizon={560} />
        <Ger x={1680} y={590} w={170} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${shift - 200}px)` }}>
          <Svg><Wagon x={980} y={780} s={1.1} f={f} /></Svg>
          <Person L={HERDER} x={760} y={840} h={330} arms="hold" eyes="side" bob={walkBob(f, true)} />
          <Person L={HERDER2} x={520} y={860} h={300} arms="down" eyes="dot" bob={walkBob(f + 7, true)} />
          {Array.from({ length: 12 }).map((_, i) => <Sheep key={i} x={60 + (i % 6) * 110 + (i > 5 ? 50 : 0) + Math.sin(f / 18 + i) * 8} y={960 + (i > 5 ? 70 : 0) + (i % 3) * 8} s={0.95} />)}
        </div>
      </Cam>
      <SFX name="wind" at={0} vol={0.22} dur={frames} />
    </AbsoluteFill>
  );
};
// 3) 짐 펼치기: 유목민 둘레로 없는 물건이 빈 동그라미로 차례로 뜸 → 금나라 쪽에서 들어옴
const ITEMS: [number, number, (p: { x: number; y: number; s: number }) => React.ReactNode][] = [
  [420, 300, (p) => <Sack {...p} />], [300, 620, (p) => <SaltBlock {...p} />], [620, 860, (p) => <TeaBrick {...p} />], [1300, 860, (p) => <SilkBolt {...p} />], [1620, 620, (p) => <IronBar {...p} />],
];
const Needs: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a = 0; void at;
  const c1 = cue(id(8), 1);
  const ts = [10 + a, 42, 74, c1 + 4, c1 + 44];
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.05, 1.0)} cx={960} cy={560}>
        <Steppe time="dusk" horizon={700} />
        <Ger x={960} y={760} w={520} door="#8a3b2c" lit={0.4} />
        <Person L={HERDER} x={960} y={1010} h={520} arms="offer" eyes="worry" mouth="frown" />
        <Person L={HERDER2} x={760} y={1020} h={420} arms="down" eyes="worry" />
        <Svg>
          {ITEMS.map(([x, y, Icon], i) => {
            const k = lerp(f, ts[i], ts[i] + 14, 0, 1, true);
            const filled = lerp(f, ts[i] + 6, ts[i] + 20, 0.25, 1);
            return k > 0 ? (
              <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
                <circle r={130} fill="#f1e5c8" stroke={INK} strokeWidth={6} strokeDasharray="20 14" transform={`rotate(${f / 2})`} />
                <g opacity={filled}>{Icon({ x: 0, y: 0, s: 1.35 })}</g>
              </g>
            ) : null;
          })}
        </Svg>
      </Cam>
      <SFX name="swish" at={ts[0]} vol={0.15} dur={16} />
      <SFX name="swish" at={ts[3]} vol={0.15} dur={16} />
    </AbsoluteFill>
  );
};
// 4) 화북의 농사 들판 + 금나라 곡식 창고 (정주민 나라)
const Farms: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(9), 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={lerp(f, c1, c1 + 40, 760, 1200, true)} cy={600}>
        <Steppe time="day" horizon={420} hills={false} />
        <Svg>
          {Array.from({ length: 9 }).map((_, r) => <path key={r} d={`M -40 ${470 + r * 72} C 500 ${450 + r * 72} 1300 ${490 + r * 72} 1980 ${470 + r * 72}`} stroke="#6f8f4a" strokeWidth={22 + r * 3} fill="none" opacity={0.75} />)}
          {Array.from({ length: 16 }).map((_, i) => <g key={i} transform={`translate(${60 + i * 122} ${470 + (i % 4) * 90})`}><path d="M 0 0 L 0 -46 M -14 -34 L 0 -46 L 14 -34 M -12 -18 L 0 -30 L 12 -18" stroke="#c9a24a" strokeWidth={5} fill="none" /></g>)}
          {/* 곡식 창고와 마을 */}
          <path d="M 1340 640 L 1340 340 L 1840 340 L 1840 640 Z" fill="#b89a6a" stroke={INK} strokeWidth={6} />
          <path d="M 1290 350 L 1590 220 L 1890 350 Z" fill="#5a4a40" stroke={INK} strokeWidth={6} />
          <path d="M 1500 640 L 1500 440 L 1680 440 L 1680 640 Z" fill="#3a2a1e" stroke={INK} strokeWidth={5} />
          {[[1420, 620], [1760, 620], [1450, 560], [1730, 560], [1590, 620]].map(([x, y], i) => <Sack key={i} x={x} y={y} s={0.9} />)}
          <FlagG x={1880} y={640} banner="jin" h={260} t={f} />
        </Svg>
        {[[300, 820], [640, 900], [1020, 830]].map(([x, y], i) => <Person key={i} L={FARMER} x={x} y={y} h={330} arms="shovel" eyes="shut" rot={Math.sin(f / 16 + i) * 5 + 8}><Shovel x={170} y={250} rot={25} /></Person>)}
      </Cam>
    </AbsoluteFill>
  );
};
// 5) 눈금: 곡식 더미가 줄어드는 초원 (안정적으로 못 들여오면)
const Shrink: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const left = Math.round(lerp(f, 16, frames - 30, 12, 1));
  const SP = [[1200, 900], [1320, 900], [1440, 900], [1560, 900], [1260, 830], [1380, 830], [1500, 830], [1320, 760], [1440, 760], [1380, 690], [1140, 900], [1620, 900]];
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={900} cy={640}>
        <Steppe time="dusk" horizon={560} />
        {[300, 620].map((x, i) => <Ger key={i} x={x} y={600} w={200 - i * 30} door="#6b4f3a" />)}
        <Svg>{SP.slice(0, left).map(([x, y], i) => <Sack key={i} x={x} y={y} s={0.95} />)}</Svg>
        <Person L={HERDER} x={760} y={1000} h={440} arms="offer" eyes="worry" mouth="frown" bow={lerp(f, 0, frames, 0, 0.45)} sweat />
        <Person L={HERDER2} x={520} y={1020} h={360} arms="sleeves" eyes="cry" mouth="frown" />
      </Cam>
      <SFX name="wind" at={0} vol={0.28} dur={frames} />
    </AbsoluteFill>
  );
};
// 6) 세 칸: 대사 순서대로 밝아짐 - 정기 교역 / 무력 / 영토
const Panel = ({ x, w, on, dim, children }: { x: number; w: number; on: number; dim: number; children: React.ReactNode }) => (
  <div style={{ position: "absolute", left: x, top: 70, width: w, height: 940, overflow: "hidden", border: `8px solid ${INK}`, borderRadius: 10, background: "#efe2c4", transform: `translateY(${(1 - on) * 60}px)`, opacity: on, filter: dim ? `saturate(${1 - dim * 0.7}) brightness(${1 - dim * 0.3})` : undefined }}>
    <div style={{ position: "absolute", left: -((1920 - w) / 2), top: -70, width: 1920, height: 1080 }}>{children}</div>
  </div>
);
const Three: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c = [1, 2, 3].map((k) => cue(id(11), k));
  const lit = c.map((t) => lerp(f, t - 2, t + 14, 0, 1, true));
  const on = c.map(() => 1);
  const cur = f < c[1] ? 0 : f < c[2] ? 1 : 2;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #e9dcbc, #c4ad80)" }} />
      <Panel x={40} w={590} on={on[0]} dim={lit[0] < 1 ? 1 - lit[0] : cur !== 0 ? 1 : 0}>
        <Steppe time="day" horizon={420} hills={false} />
        <Svg><WallG x0={500} x1={1420} top={200} base={420} /><Sack x={1140} y={740} s={1.2} /><Sack x={1240} y={750} s={1.2} /><SilkBolt x={1180} y={660} /></Svg>
        <Person L={MON} x={800} y={960} h={480} arms="offer" eyes="dot" mouth="smile" />
        <Person L={OFFICIAL} x={1110} y={960} h={480} arms="offer" eyes="dot" mouth="smile" flip />
      </Panel>
      <Panel x={665} w={590} on={on[1]} dim={lit[1] < 1 ? 1 - lit[1] : cur !== 1 ? 1 : 0}>
        <Steppe time="dusk" horizon={420} hills={false} />
        <Cart x={700} y={760} w={520} load={<g><Sack x={-70} y={-140} s={1} /><Sack x={50} y={-140} s={1} /></g>} rolling={false} />
        <Person L={OFFICIAL} x={1260} y={980} h={460} arms="up" eyes="wide" mouth="o" sweat flip />
        <Person L={MON} x={700} y={1000} h={500} arms="fist" eyes="angry"><Sabre x={236} y={70} rot={20} s={1.2} /></Person>
      </Panel>
      <Panel x={1290} w={590} on={on[2]} dim={1 - lit[2]}>
        <Cam z={0.72} cx={1000} cy={430}>
          <NationMap show={{ mongol: 1, jin: lerp(f, c[2] + 16, c[2] + 60, 0, 0) }} wall={0}>
            {on[2] > 0 && <path d="M 900 300 C 1000 330 1120 360 1240 440 L 1120 560 C 1000 520 880 460 800 400 Z" fill="#5d7b98" stroke={INK} strokeWidth={5} opacity={lerp(f, c[2] + 18, c[2] + 56, 0, 0.9)} />}
          </NationMap>
          <Tug x={1020} y={420} h={200} sway={Math.sin(f / 12) * 4} />
        </Cam>
      </Panel>
      <SFX name="page" at={Math.max(0, c[0])} vol={0.2} dur={24} />
      <SFX name="page" at={c[1]} vol={0.2} dur={24} />
      <SFX name="page" at={c[2]} vol={0.2} dur={24} />
      {frames < 0 && <Fire x={0} y={0} />}
    </AbsoluteFill>
  );
};
// 7) 이간질: 금나라 황제의 실에 끌려 부딪치는 부족 깃발 (1편 지도)
const Strings: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.5, 1.35)} cx={lerp(f, 0, frames, 960, 1000)} cy={380}>
        <ChinaMap f={f} rich={1} jin={1} strings={lerp(f, 6, 24, 0, 1)} arrow={0} pull={Math.max(0, Math.sin(f / 7)) * 14} />
        <Person L={EMPEROR} x={P.zhongdu[0]} y={P.zhongdu[1] + 110} h={190} arms="up" eyes="sly" mouth="grin" />
      </Cam>
      <SFX name="swish" at={30} vol={0.18} dur={24} />
    </AbsoluteFill>
  );
};
// 8) 시장 문이 닫힘 (교역망을 끊으면)
const Shut: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(13), 1);
  const shut = lerp(f, c1 + 22, c1 + 60, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.14)} cx={1000} cy={640}>
        <Market f={f} shut={shut} tip={1} goods={1 - shut} closeLedger={shut} />
      </Cam>
      <SFX name="gate" at={c1 + 22} vol={0.32} dur={44} />
    </AbsoluteFill>
  );
};
// 9) 등불 켠 천막 안, 남쪽 지도를 내려다보는 칭기즈칸
const Tent: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.14)} cx={980} cy={520}>
        <AbsoluteFill style={{ background: "linear-gradient(#2a1c12, #4a3322 70%, #2f2116)" }} />
        <Svg>
          {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M 960 -80 L ${-200 + i * 210} 620`} stroke="#7a5a3a" strokeWidth={10} />)}
          <path d="M -40 620 L 1960 620 L 1960 1100 L -40 1100 Z" fill="#6b4f33" stroke={INK} strokeWidth={6} />
          {/* 바닥에 펼친 지도 */}
          <g transform="translate(1060 800)">
            <path d="M -360 -120 L 360 -120 L 420 150 L -420 150 Z" fill="#e8d8ae" stroke={INK} strokeWidth={6} />
            <path d="M -240 -90 C -120 -40 40 -60 150 -100 L 300 -20 L 160 80 L -120 110 L -320 40 Z" fill="#cf8f68" stroke={INK} strokeWidth={4} />
            <path d="M -200 -116 L -200 -60 M 90 -116 L 90 -60" stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
            <FlagG x={40} y={30} banner="jin" h={90} t={f} />
          </g>
        </Svg>
        <Glow x={1040} y={640} r={560} op={0.5} color="#f3a24e" />
        <Fire x={1560} y={760} s={0.8} />
        <Char id="genghis" x={620} h={920} pose="side" bottom={-40} enter="none" beat="none" />
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 14, frames, 0, 1) }} />
      <SFX name="campfire" at={0} vol={0.18} dur={frames} />
    </AbsoluteFill>
  );
};
const groups: Group[] = [
  { ids: [id(1), id(2), id(3), id(4)], Shot: Neighbors },
  { ids: [id(5), id(6)], Shot: Trade },
  { ids: [id(7)], Shot: Move },
  { ids: [id(8)], Shot: Needs },
  { ids: [id(9)], Shot: Farms },
  { ids: [id(10)], Shot: Shrink },
  { ids: [id(11)], Shot: Three },
  { ids: [id(12)], Shot: Strings },
  { ids: [id(13)], Shot: Shut },
  { ids: [id(14)], Shot: Tent },
];
export const M01RCh1 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m1r.1" year="" groups={groups} music="intrigue" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void RiderOn; void sec;
