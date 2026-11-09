// 몽골 1편 수정판 5장 - 침을 뱉다 (대본 07:18-08:35): 마주 봄 → 가까이 → 침 → 회상(바랜 색) → 떠남·분노 → 국경 요새
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chapter, Char, cue, Dim, Ger, Glow, Group, INK, Lang, LangContext, Rider, SFX, ShotProps, Steppe, Tug } from "./kit";
import { Cam, ENVOY, FlagG, MON, Person, Shovel, Spear, ThroneRoom, WALL, WallLine, ZhongduG, PORTER } from "./M01Ch4";
import { Sack, lerp, NationMap, PRINCE_WEI, Scroll, SilkBolt, SmallFort, Svg, WEISHAO } from "./M01RParts";
import { Chest } from "./M01RChest";

const id = (n: number) => `m1r.c5_${String(n).padStart(2, "0")}`;
// 금나라 국경 도시 정주 앞 천막 (칭기즈칸이 찾아옴)
const Jingzhou: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={lerp(f, 0, frames, 1050, 900)} cy={600}>
        <Steppe time="day" horizon={500} hills={false} />
        <AbsoluteFill style={{ background: "linear-gradient(rgba(210,190,130,0) 44%, rgba(210,190,130,.8) 60%)" }} />
        <SmallFort top={200} base={500} x0={760} x1={2200} f={f} flag="jin" />
        <Ger x={420} y={640} w={380} door="#c9a24a" />
        <Tug x={700} y={760} h={460} sway={Math.sin(f / 13) * 6} />
        {[0, 1, 2].map((i) => <Rider key={i} kind="mongol" x={760 - i * 360} y={690} w={380} still={f > 40} phase={i * 4} flip={false} />)}
        <Char id="genghis" x={1420} h={560} pose="side" bottom={70} enter="none" beat="none" />
      </Cam>
      <SFX name="hooves" at={0} vol={0.2} dur={50} />
    </AbsoluteFill>
  );
};
// 마주 봄: 사신이 조서를 받쳐 듦, 칭기즈칸이 고개를 갸웃 → 새 황제가 누구냐
const Faceoff: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a3 = at(id(3));
  const ans = a3 + cue(id(3), 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.12)} cx={960} cy={560}>
        <Steppe time="dusk" horizon={560} />
        <Ger x={230} y={620} w={320} door="#8a3b2c" />
        <Tug x={560} y={680} h={420} sway={Math.sin(f / 13) * 5} />
        <Char id="genghis" x={620} h={780} pose={f >= ans ? "angry" : "front"} bottom={30} enter="none" beat={f >= a3 ? "nod" : "none"} beatAt={a3} gesture={f >= a3 && f < ans ? "open" : undefined} gestureAt={a3} />
        <Person L={ENVOY} x={1360} y={1040} h={780} arms="offer" eyes={f >= ans ? "worry" : "dot"} mouth={f >= ans ? "talk" : "flat"} t={f} bow={f >= ans ? 0.35 : 0.12} flip sweat={f >= ans} front={<Scroll x={150} y={290} s={0.9} />} />
        <Person L={MON} x={1760} y={1060} h={520} arms="hold" eyes="side" flip><Spear x={222} y={300} /></Person>
      </Cam>
      <SFX name="page" at={10} vol={0.18} dur={24} />
    </AbsoluteFill>
  );
};
// 침을 뱉다: 얼굴 가까이 굳음 → 남쪽으로 돌아서 뱉음(침방울 궤적), 사신의 놀란 얼굴 😏
const Spit: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(4), 1);
  const spit = c1 + 34;
  const k = lerp(f, spit, spit + 20, 0, 1);
  return (
    <AbsoluteFill>
      {f < spit + 30 ? (
        <Cam z={lerp(f, 0, spit, 1.0, 1.06)} cx={900} cy={520}>
          <Steppe time="dusk" horizon={860} />
          <Glow x={900} y={380} r={560} op={0.3} color="#f6c07a" />
          <Char id="genghis" x={900} h={1500} pose={f < c1 ? "angry" : "side"} bottom={-360} enter="none" beat="none" />
          <Svg>
            {k > 0 && k < 1 && [0, 1, 2, 3, 4].map((i) => {
              const t = Math.max(0, k - i * 0.06);
              return <circle key={i} cx={1000 + t * 560} cy={690 - Math.sin(t * Math.PI) * 70 + t * t * 300} r={17 - i * 2.5} fill="#e6eef0" stroke={INK} strokeWidth={3} />;
            })}
            {k >= 1 && <path d="M 1500 1000 q 26 -22 52 -4 q 24 -14 44 4 q -48 16 -96 0 Z" fill="#e6eef0" stroke={INK} strokeWidth={3} />}
          </Svg>
        </Cam>
      ) : (
        <AbsoluteFill style={{ opacity: lerp(f, spit + 30, spit + 40, 0, 1) }}>
          <Cam z={lerp(f, spit + 30, frames, 1.0, 1.14)} cx={960} cy={380}>
            <Steppe time="dusk" horizon={860} />
            <Person L={ENVOY} x={960} y={1700} h={1500} arms="up" eyes="wide" mouth="o" sweat t={f} />
          </Cam>
        </AbsoluteFill>
      )}
      <SFX name="swish" at={spit} vol={0.22} dur={20} />
    </AbsoluteFill>
  );
};
// "천자는…" 칭기즈칸이 손가락질, 흰 툭 앞, 떨며 엎드린 사신 (내레이션이 전함)
const Scorn: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.15, 1.0)} cx={900} cy={540}>
        <Steppe time="dusk" horizon={720} />
        {[260, 480, 1060].map((x, i) => <Tug key={i} x={x} y={780} h={560} sway={Math.sin((f + i * 11) / 12) * 6} />)}
        <Char id="genghis" x={680} h={860} pose="angry" bottom={60} enter="none" beat="none" gesture="point" gestureAt={10} flip={false} />
        <Person L={ENVOY} x={1420} y={1010} h={560} kneel arms="offer" bow={0.9} eyes="shut" mouth="wobble" t={f} sweat flip front={<Scroll x={150} y={300} s={0.8} />} />
      </Cam>
      <SFX name="wind" at={0} vol={0.2} dur={frames} />
    </AbsoluteFill>
  );
};
// 회상(바랜 색): 조공품 앞 위소왕, 다른 족장들은 엎드렸는데 칭기즈칸만 서 있음 → 위소왕 얼굴이 붉어짐
const Flashback: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a8 = at(id(8));
  const bowCue = at(id(7)) + cue(id(7), 1);
  const red = lerp(f, bowCue + 30, a8 + 10, 0, 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: "sepia(.55) saturate(.8) brightness(.97)" }}>
        <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={lerp(f, bowCue, bowCue + 40, 960, 1100, true)} cy={600}>
          <Steppe time="day" horizon={480} hills={false} />
          <SmallFort top={160} base={470} x0={140} x1={1780} f={f} flag="jin" />
          <Svg>
            <Chest x={1130} y={800} s={1.2} /><Sack x={1030} y={830} s={1} /><SilkBolt x={1230} y={850} s={1.1} />
          </Svg>
          <Person L={PRINCE_WEI} x={1460} y={980} h={560} arms={f >= a8 ? "point" : "sleeves"} eyes={f >= a8 ? "angry" : bowCue < f ? "sly" : "dot"} mouth={f >= a8 ? "talk" : "flat"} t={f} flip sweat={red > 0.6} />
          {red > 0 && <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: red * 0.55 }}><ellipse cx={1460} cy={560} rx={80} ry={56} fill="#d8452e" /></svg>}
          {[0, 1, 2, 3].map((i) => <Person key={i} L={MON} x={230 + i * 150} y={990 + (i % 2) * 22} h={300} kneel arms="sleeves" bow={lerp(f, bowCue - 30, bowCue, 0.2, 0.9)} eyes="shut" />)}
          <Char id="genghis" x={860} h={620} pose={f >= a8 ? "angry" : "front"} bottom={50} enter="none" beat="none" />
        </Cam>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(40,24,10,.55))" }} />
      <SFX name="page" at={2} vol={0.2} dur={24} />
    </AbsoluteFill>
  );
};
// 칭기즈칸이 북쪽으로 떠남, 사신만 남음 → 궁궐에서 일어나 명령하는 위소왕
const RideOff: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(9), 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < c1 + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, c1, 1.0, 1.08)} cx={960} cy={620}>
            <Steppe time="day" horizon={540} />
            {[0, 1, 2, 3, 4].map((i) => <Rider key={i} kind={i ? (i % 2 ? "mongol" : "mongol2") : "mongol_white"} x={lerp(f, 0, c1 + 12, 860 + i * 190, -620 + i * 190)} y={640 + (i % 2) * 70} w={360} flip phase={i * 3} />)}
            <Person L={ENVOY} x={1500} y={1010} h={500} arms="offer" eyes="wide" mouth="o" sweat flip front={<Scroll x={150} y={300} s={0.75} />} />
          </Cam>
          <SFX name="gallop" at={0} vol={0.2} dur={c1 + 6} />
        </AbsoluteFill>
      )}
      {f >= c1 && (
        <AbsoluteFill style={{ opacity: lerp(f, c1, c1 + 12, 0, 1) }}>
          <Cam z={lerp(f, c1, frames, 1.0, 1.28)} cx={1300} cy={lerp(f, c1, frames, 580, 430)}>
            <ThroneRoom />
            <Person L={WEISHAO} x={1300} y={lerp(f, c1 + 10, c1 + 24, 640, 620, true)} h={410} arms={f > cue(id(9), 2) ? "point" : "fist"} eyes="angry" mouth="talk" t={f} rot={Math.sin(f / 4) * 1.5} flip />
            <Person L={ENVOY} x={720} y={1010} h={460} kneel arms="sleeves" bow={0.9} eyes="shut" sweat />
          </Cam>
          <SFX name="gong" at={c1 + 10} vol={0.2} dur={40} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 지도: 금나라 북쪽 국경에 요새가 줄줄이 → 흙벽을 쌓는 일꾼들
const Forts: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(10), 1);
  const toBuild = c1 + 30;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < toBuild + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, toBuild, 1.6, 1.8)} cx={1040} cy={380}>
            <NationMap show={{ mongol: 1, jin: 1 }}>
              {WALL.map(([x, y], i) => {
                const k = lerp(f, 16 + i * 8, 26 + i * 8, 0, 1, true);
                return <g key={i} transform={`translate(${x} ${y - 10}) scale(${k * 1.5})`}><path d="M -18 8 L -18 -18 L 18 -18 L 18 8 Z" fill="#cfc2a2" stroke={INK} strokeWidth={3.5} /><path d="M -24 -16 L 0 -34 L 24 -16 Z" fill="#a8332a" stroke={INK} strokeWidth={3} /></g>;
              })}
            </NationMap>
          </Cam>
        </AbsoluteFill>
      )}
      {f >= toBuild && (
        <AbsoluteFill style={{ opacity: lerp(f, toBuild, toBuild + 12, 0, 1) }}>
          <Cam z={lerp(f, toBuild, frames, 1.0, 1.08)} cx={960} cy={600}>
            <Steppe time="day" horizon={500} hills={false} />
            <SmallFort top={240} base={560} x0={-20} x1={1300} f={f} flag="jin" scaffold={1} />
            {[[1500, 880], [1240, 960], [1720, 960], [960, 980]].map(([x, y], i) => <Person key={i} L={PORTER} x={x} y={y} h={430} arms="shovel" eyes="shut" rot={Math.sin(f / 9 + i) * 8} flip={i % 2 === 0}><Shovel x={170} y={250} rot={25} /></Person>)}
          </Cam>
          <SFX name="hit" at={toBuild + 8} vol={0.14} dur={20} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
const groups: Group[] = [
  { ids: [id(1)], Shot: Jingzhou },
  { ids: [id(2), id(3)], Shot: Faceoff },
  { ids: [id(4)], Shot: Spit },
  { ids: [id(5)], Shot: Scorn },
  { ids: [id(6), id(7), id(8)], Shot: Flashback },
  { ids: [id(9)], Shot: RideOff },
  { ids: [id(10)], Shot: Forts },
];
export const M01RCh5 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m1r.5" year="1210" groups={groups} music="intrigue" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void Dim; void FlagG; void WallLine; void ZhongduG;
