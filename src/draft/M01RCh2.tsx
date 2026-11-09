// 몽골 1편 수정판 2장 - 예행연습 상대 서하 (대본 02:23-04:05)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chapter, Char, cue, Dim, Glow, Group, INK, Lang, LangContext, Rider, SFX, ShotProps, Steppe } from "./kit";
import { Cam, Cart, ChinaMap, Dust, FlagG, Person, MON, Smoke, SilkG, Spear, ThroneRoom, XIA_KING, XIA_SOL, ZhongduG } from "./M01Ch4";
import { Camel as CaravanCamel, Merchant } from "./M01Ch5";
import { ArrowVolley, lerp, MapArrow, NationMap, SENGGUM, SilkBolt, SmallFort, Svg, XIA_COUSIN, XIA_LORD } from "./M01RParts";

const id = (n: number) => `m1r.c2_${String(n).padStart(2, "0")}`;
// 1) 초원 기병 앞의 금나라 거대 성벽 도시. 맥락: 초원에서 막 내려온 기병
const BigCity: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c2 = cue(id(1), 2);
  const grow = lerp(f, 0, frames, 0.85, 1.25, true);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#c98a5e, #ebc48f 60%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${grow})`, transformOrigin: "50% 62%" }}>
        <Svg><ZhongduG /></Svg>
      </div>
      <Svg><path d="M -40 820 C 500 790 1300 800 1960 830 L 1960 1100 L -40 1100 Z" fill="#7c8148" stroke={INK} strokeWidth={5} /></Svg>
      {[[120, 790, 300], [370, 820, 360], [650, 800, 320], [1040, 830, 340], [1320, 800, 300], [1570, 820, 330]].map(([x, y, w], i) => <Rider key={i} kind={i === 2 ? "mongol_white" : i % 2 ? "mongol2" : "mongol"} x={x} y={y} w={w} still phase={i * 3} />)}
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, 0, 14, 1, 0) }} />
      <SFX name="wind" at={0} vol={0.2} dur={frames} fade={8} />
      <SFX name="drum" at={c2} vol={0.2} dur={40} />
    </AbsoluteFill>
  );
};
// 2) 지도: 금나라로 향하던 화살이 서하로 휨 (1편 지도)
const ToXia: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(2), 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.25, 1.55, true)} cx={lerp(f, 0, frames, 1000, 860, true)} cy={lerp(f, 0, frames, 400, 440, true)}>
        <ChinaMap f={f} rich={1} jin={1} strings={0} arrow={lerp(f, c1 - 6, frames - 10, 0, 1, true)} pull={0} />
        <Char id="genghis" x={700} h={300} pose="smug" gesture="point" gestureAt={c1} bottom={1080 - 340} enter="none" beat="none" />
      </Cam>
      <SFX name="swish" at={c1} vol={0.22} dur={26} />
    </AbsoluteFill>
  );
};
// 3) 실크로드 낙타 대상이 서하 성 앞에서 통행세 → 송나라 수레의 세폐
const Silk: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(3), 1), c2 = cue(id(3), 2);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < c2 + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, c2, 1.0, 1.1)} cx={lerp(f, 0, c2, 800, 1100)} cy={600}>
            <Steppe time="day" horizon={500} hills={false} />
            <AbsoluteFill style={{ background: "linear-gradient(rgba(216,190,130,0) 46%, rgba(216,190,130,.85) 60%)" }} />
            <SmallFort top={250} base={540} x0={900} x1={2100} f={f} />
            {[0, 1, 2, 3, 4].map((i) => <CaravanCamel key={i} x={lerp(f, 0, c2 + 12, -240 + i * -300, 1060 + i * -300)} y={820 + (i % 2) * 34} s={0.88} phase={i * 9} load="bales" v={i} />)}
            {[0, 1].map((i) => <Merchant key={i} x={lerp(f, 0, c2 + 12, -100 + i * -300, 1200 + i * -300)} y={890 + i * 24} s={1.1} phase={i * 5} v={i + 1} />)}
            <Person L={XIA_SOL} x={1330} y={880} h={360} arms="offer" eyes="side" flip />
            <Person L={XIA_SOL} x={1620} y={860} h={350} arms="hold" eyes="dot" flip><Spear x={222} y={300} /></Person>
          </Cam>
        </AbsoluteFill>
      )}
      {f >= c2 && (
        <AbsoluteFill style={{ opacity: lerp(f, c2, c2 + 12, 0, 1) }}>
          <Cam z={lerp(f, c2, frames, 1.0, 1.08)} cx={960} cy={620}>
            <Steppe time="dusk" horizon={520} hills={false} />
            <SmallFort top={190} base={500} x0={1100} x1={2100} f={f} />
            <Cart x={lerp(f, c2, frames, 80, 560)} y={830} w={560} t={f} load={<SilkG x={0} y={-110} n={6} s={1.1} />} />
            <Person L={XIA_KING} x={1560} y={940} h={500} arms="offer" eyes="sly" mouth="smile" flip />
          </Cam>
        </AbsoluteFill>
      )}
      <SFX name="hooves" at={0} vol={0.12} dur={c2} />
      <SFX name="coins" at={c1 + 4} vol={0.24} dur={40} />
    </AbsoluteFill>
  );
};
// 궁궐 청록 (금나라 궁궐과 다른 나라로 보이게)
const XiaPalace = () => <div style={{ position: "absolute", inset: 0, filter: "hue-rotate(115deg) saturate(.5) brightness(1.15)" }}><ThroneRoom /></div>;
// 4) 과거의 이야기 → 많은 병력과 성 → 궁궐 안 권력 다툼
const Intrigue: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a5 = at(id(5));
  const inside = a5 + cue(id(5), 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < inside + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, inside, 1.15, 1.0)} cx={960} cy={560}>
            <Steppe time="dusk" horizon={460} hills={false} />
            <SmallFort top={150} base={440} x0={150} x1={1770} f={f} />
            {Array.from({ length: 16 }).map((_, i) => <Person key={i} L={XIA_SOL} x={120 + (i % 8) * 240 + (i > 7 ? 110 : 0)} y={i > 7 ? 1010 : 800} h={i > 7 ? 340 : 280} arms="hold" eyes="dot" flip={i % 2 === 1}><Spear x={222} y={300} /></Person>)}
          </Cam>
        </AbsoluteFill>
      )}
      {f >= inside && (
        <AbsoluteFill style={{ opacity: lerp(f, inside, inside + 12, 0, 1) }}>
          <Cam z={lerp(f, inside, frames, 1.0, 1.15)} cx={1200} cy={560}>
            <XiaPalace />
            <Person L={XIA_KING} x={1300} y={660} h={380} arms="sleeves" eyes="worry" mouth="frown" sweat />
            {/* 벽의 칼 그림자 */}
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: lerp(f, inside + 30, inside + 60, 0, 0.55) }}>
              <path d="M 1500 110 L 1520 480 L 1500 520 L 1480 480 Z M 1440 490 L 1560 490 L 1560 510 L 1440 510 Z M 1490 510 L 1510 510 L 1510 600 L 1490 600 Z" fill="#100806" />
            </svg>
            <Person L={XIA_COUSIN} x={760} y={980} h={480} arms="sleeves" eyes="sly" mouth="flat" />
            <Person L={XIA_LORD} x={960} y={1000} h={450} arms="point" eyes="side" mouth="talk" t={f} flip />
          </Cam>
          <Dim op={0.1} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 5) 저울: 무거운 금나라 성 / 가벼운 서하 성 → 서하 쪽으로 들어감 (가까이 들어가기)
const Weigh: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const tilt = lerp(f, 6, 36, 0, 9, true);
  const z = lerp(f, frames * 0.55, frames, 1, 1.5, true);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #efe2c4, #d3bd90)" }} />
      <Cam z={z} cx={lerp(f, frames * 0.55, frames, 960, 1400, true)} cy={lerp(f, frames * 0.55, frames, 540, 470, true)}>
        <Svg>
          <path d="M 960 200 L 960 1000 M 800 1000 L 1120 1000" stroke={INK} strokeWidth={16} />
          <path d="M 960 200 L 960 1000" stroke="#8a5a2e" strokeWidth={7} />
          <g transform={`rotate(${-tilt} 960 220)`}>
            <path d="M 300 220 L 1620 220" stroke={INK} strokeWidth={16} /><path d="M 300 220 L 1620 220" stroke="#8a5a2e" strokeWidth={7} />
          </g>
        </Svg>
        {(() => {
          const lx = 960 + Math.cos((tilt * Math.PI) / 180) * -660, ly = 220 + Math.sin((tilt * Math.PI) / 180) * 660;
          const rx = 960 + Math.cos((tilt * Math.PI) / 180) * 660, ry = 220 - Math.sin((tilt * Math.PI) / 180) * 660;
          return (
            <>
              <Svg>
                <path d={`M ${lx} ${ly} L ${lx - 240} ${ly + 330} M ${lx} ${ly} L ${lx + 240} ${ly + 330} M ${rx} ${ry} L ${rx - 170} ${ry + 280} M ${rx} ${ry} L ${rx + 170} ${ry + 280}`} stroke={INK} strokeWidth={5} />
                <path d={`M ${lx - 270} ${ly + 330} C ${lx - 200} ${ly + 400} ${lx + 200} ${ly + 400} ${lx + 270} ${ly + 330} Z`} fill="#c9a24a" stroke={INK} strokeWidth={6} />
                <path d={`M ${rx - 200} ${ry + 280} C ${rx - 140} ${ry + 340} ${rx + 140} ${ry + 340} ${rx + 200} ${ry + 280} Z`} fill="#c9a24a" stroke={INK} strokeWidth={6} />
              </Svg>
              <div style={{ position: "absolute", left: lx - 345, top: ly + 96, width: 691, height: 389 }}><div style={{ transform: "scale(.36)", transformOrigin: "0 0", width: 1920, height: 1080, position: "relative" }}><Svg><ZhongduG /></Svg></div></div>
              <div style={{ position: "absolute", left: rx - 960 * 0.24, top: ry + 280 - 1080 * 0.205, width: 460, height: 220 }}><div style={{ transform: "scale(.24)", transformOrigin: "0 0", width: 1920, height: 1080, position: "relative" }}><SmallFort top={300} base={860} x0={200} x1={1720} f={f} /></div></div>
            </>
          );
        })()}
      </Cam>
      <SFX name="impact" at={30} vol={0.16} dur={30} />
    </AbsoluteFill>
  );
};
// 6) 지도: 금나라로 뻗는 화살의 옆구리를 서하가 찌름
const Flank: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(7), 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.35, 1.5)} cx={960} cy={430}>
        <NationMap show={{ mongol: 1, jin: 1, xia: 1 }}>
          <path d="M 860 520 C 960 560 1060 540 1180 500" stroke="#a8332a" strokeWidth={14} fill="none" strokeDasharray={`${lerp(f, 4, 34, 0, 360)} 3000`} />
          <FlagG x={770} y={560} banner="xia" h={110} t={f} />
          <FlagG x={1262} y={560} banner="jin" h={130} t={f} />
          <MapArrow d="M 920 270 C 980 320 1060 370 1130 410" len={270} p={lerp(f, 20, c1, 0, 1, true)} head="M 1108 436 L 1164 428 L 1132 382 Z" />
          <MapArrow d="M 820 480 C 860 440 950 390 1010 340" len={260} p={lerp(f, c1 + 8, c1 + 46, 0, 1, true)} c="#4f8a7c" head="M 990 366 L 1036 320 L 984 318 Z" />
        </NationMap>
      </Cam>
      <SFX name="swish" at={c1 + 8} vol={0.2} dur={26} />
    </AbsoluteFill>
  );
};
// 7) 1205: 셍굼이 쫓겨 서하 국경 성으로 달아남. 맥락: 뒤로 먼지 이는 초원, 칭기즈칸의 기병
const Senggum: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a9 = at(id(9));
  const see = a9 + cue(id(9), 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={lerp(f, 0, see, 960, 1160, true)} cy={640}>
        <Steppe time="day" horizon={520} hills={false} />
        <AbsoluteFill style={{ background: "linear-gradient(rgba(210,190,130,0) 44%, rgba(210,190,130,.9) 62%)" }} />
        <SmallFort top={230} base={560} x0={1160} x1={2180} f={f} door={lerp(f, a9 - 40, a9, 0, 0.8)} />
        {(() => {
          const x = lerp(f, 0, a9 + 30, -120, 1300);
          return f < a9 + 40 && (
            <>
              <Dust x={x - 80} y={880} t={f} r={70} />
              <Person L={SENGGUM} x={x + 70} y={900} h={350} arms="down" eyes="worry" mouth="o" sweat bob={walkBob(f)} />
            </>
          );
        })()}
        {[0, 1, 2, 3].map((i) => <Rider key={i} kind="mongol" x={lerp(f, 0, see + 30, -900 - i * 240, 420 - i * 240)} y={760 + (i % 2) * 70} w={340} phase={i * 5} still={f > see + 30} />)}
        {f > see - 10 && <Char id="genghis" x={940} h={480} pose="side" bottom={110} enter="pop" beat="none" />}
      </Cam>
      <SFX name="gallop" at={0} vol={0.2} dur={see + 20} />
    </AbsoluteFill>
  );
};
const walkBob = (f: number) => Math.abs(Math.sin(f / 3.4)) * 16;
// 8) 처음 보는 성벽 앞에서 멈춘 기병, 벽 뒤 화살 → 빙 둘러쌈 → 문이 부서짐 (공격하는 쪽 등 뒤에서 본 정면)
const FirstWall: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(10), 1), c2 = cue(id(10), 2);
  const breach = c2 + 56;
  const door = lerp(f, breach, breach + 16, 0, 1, true);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < c2 + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, c2, 1.0, 1.14)} cx={960} cy={500}>
            <Steppe time="day" horizon={620} hills={false} />
            <SmallFort top={220} base={640} x0={240} x1={1680} f={f} />
            {Array.from({ length: 9 }).map((_, i) => <Person key={i} L={XIA_SOL} x={340 + i * 150} y={252} h={120} arms="hold" eyes="dot" />)}
            {f >= c1 - 10 && <ArrowVolley f={f} x0={300} x1={1600} y0={250} y1={860} n={30} />}
            {[[60, 700, 420], [430, 730, 440], [800, 720, 440], [1180, 730, 440], [1540, 700, 420]].map(([x, y, w], i) => <Rider key={i} kind={i % 2 ? "mongol2" : "mongol"} x={x} y={y} w={w} still phase={i} />)}
          </Cam>
          {f >= c1 && <Person L={MON} x={1580} y={1120} h={760} arms="up" eyes="wide" mouth="o" sweat />}
          <SFX name="arrow_rain" at={c1 - 10} vol={0.26} dur={c2 - c1 + 16} />
        </AbsoluteFill>
      )}
      {f >= c2 && (
        <AbsoluteFill style={{ opacity: lerp(f, c2, c2 + 12, 0, 1) }}>
          <Cam z={lerp(f, c2, frames, 1.05, 1.0)} cx={960} cy={540}>
            <Steppe time="day" horizon={540} hills={false} />
            <SmallFort top={260} base={560} x0={560} x1={1360} f={f} door={door} burn={door} />
            {Array.from({ length: 22 }).map((_, i) => {
              const a = (i / 22) * Math.PI;
              const r = lerp(f, c2, c2 + 44, 1500, 760, true);
              return <Rider key={i} kind={i % 3 ? "mongol" : "mongol2"} x={920 + Math.cos(a) * r - 110} y={500 + Math.sin(a) * r * 0.62} w={220} flip={Math.cos(a) > 0} still={f > c2 + 46} phase={i * 3} />;
            })}
          </Cam>
          <SFX name="impact" at={breach} vol={0.3} dur={36} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 9) 불타는 작은 성 → 낙타와 짐을 끌고 초원으로
const Loot: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(11), 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={lerp(f, c1 - 10, c1 + 40, 1100, 780, true)} cy={600}>
        <Steppe time="dusk" horizon={520} />
        <SmallFort top={250} base={540} x0={1140} x1={2200} f={f} door={1} burn={1} c="#8a7a62" />
        <Smoke x={1300} y={240} f={f} n={4} s={1.3} />
        <Smoke x={1700} y={250} f={f} n={3} s={1.5} />
        <Glow x={1500} y={420} r={520} op={0.45} color="#f09a4a" />
        {[0, 1, 2].map((i) => <CaravanCamel key={i} x={lerp(f, 0, frames, 1060 + i * 240, 200 + i * 240)} y={830 + (i % 2) * 40} s={0.8} flip phase={i * 7} load="bales" v={i} />)}
        {[0, 1, 2, 3].map((i) => <Rider key={i} kind={i % 2 ? "mongol" : "mongol2"} x={lerp(f, 0, frames, 860 + i * 280, 0 + i * 280)} y={700 + (i % 2) * 180} w={300} flip phase={i * 4} />)}
      </Cam>
      <SFX name="fire" at={0} vol={0.2} dur={frames} />
    </AbsoluteFill>
  );
};
// 10) 서하 궁궐: 황제가 끌려 내려오고 사촌이 옥좌에
const Coup: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c2 = cue(id(12), 2);
  const drag = lerp(f, c2 - 10, c2 + 40, 0, 1, true);
  const sit = lerp(f, c2 + 40, c2 + 70, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.12)} cx={1160} cy={580}>
        <XiaPalace />
        <Person L={XIA_KING} x={lerp(drag, 0, 1, 1300, 820)} y={lerp(drag, 0, 1, 660, 940)} h={380} arms="up" eyes={drag > 0 ? "wide" : "dot"} mouth={drag > 0 ? "wail" : "flat"} rot={drag * 12} sweat={drag > 0} />
        {drag > 0 && [0, 1].map((i) => <Person key={i} L={XIA_SOL} x={lerp(drag, 0, 1, 1140 + i * 330, 690 + i * 290)} y={lerp(drag, 0, 1, 700, 980)} h={390} arms="fist" eyes="angry" flip={i === 1} />)}
        <Person L={XIA_COUSIN} x={lerp(sit, 0, 1, 1720, 1300)} y={lerp(sit, 0, 1, 880, 660)} h={lerp(sit, 0, 1, 450, 380)} arms="sleeves" eyes="sly" mouth={sit > 0.9 ? "grin" : "flat"} flip={sit < 1} />
      </Cam>
      <SFX name="gong" at={c2 + 62} vol={0.22} dur={40} />
    </AbsoluteFill>
  );
};
const groups: Group[] = [
  { ids: [id(1)], Shot: BigCity },
  { ids: [id(2)], Shot: ToXia },
  { ids: [id(3)], Shot: Silk },
  { ids: [id(4), id(5)], Shot: Intrigue },
  { ids: [id(6)], Shot: Weigh },
  { ids: [id(7)], Shot: Flank },
  { ids: [id(8), id(9)], Shot: Senggum },
  { ids: [id(10)], Shot: FirstWall },
  { ids: [id(11)], Shot: Loot },
  { ids: [id(12)], Shot: Coup },
];
export const M01RCh2 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m1r.2" year="" groups={groups} music="steppe" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void SilkBolt;
