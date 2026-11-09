// 몽골 1편 수정판 6장 - 야호령으로 (대본 08:35-10:00) + 20초 엔딩
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Chapter, chapterFrames, Char, cue, Glow, Group, Ger, INK, Lang, LangContext, Rider, SFX, ShotProps, Snd, Steppe, Tug } from "./kit";
import { Cam, Cart, Dust, EMPEROR, ENVOY, FlagG, Horse, JIN_GEN, JIN_SOL, JinTentG, MON, PORTER, Person, S5, S7, Spear, ThroneRoom } from "./M01Ch4";
import { Ending, ENDING_FRAMES } from "./M01Ch5";
import { lerp, MapArrow, NationMap, Sack, Scroll, sec, SmallFort, Svg } from "./M01RParts";

const id = (n: number) => `m1r.c6_${String(n).padStart(2, "0")}`;
// 쿠릴타이: 높은 단 위 칭기즈칸, 흰 툭 아홉, 수많은 창
const Kurultai: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2));
  return (
    <AbsoluteFill>
      <Cam z={f < a2 ? lerp(f, 0, a2, 1.0, 1.1) : lerp(f, a2, frames, 1.1, 1.3)} cx={960} cy={f < a2 ? 560 : 440}>
        <Steppe time="dusk" horizon={520} />
        {Array.from({ length: 9 }).map((_, i) => <Tug key={i} x={360 + i * 150} y={560} h={360} sway={Math.sin((f + i * 9) / 12) * 6} />)}
        <Svg><path d="M 620 700 L 1300 700 L 1400 800 L 520 800 Z" fill="#7a5a3a" stroke={INK} strokeWidth={6} /><path d="M 520 800 L 1400 800 L 1400 860 L 520 860 Z" fill="#5e4430" stroke={INK} strokeWidth={6} /></Svg>
        <Char id="genghis" x={960} h={560} pose="front" bottom={330} enter="none" beat="none" gesture={f >= a2 ? "fist" : undefined} gestureAt={a2 + 6} />
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          {Array.from({ length: 120 }).map((_, i) => {
            const x = -20 + (i % 24) * 84 + ((Math.floor(i / 24) % 2) * 40), y = 860 + Math.floor(i / 24) * 52;
            const up = f >= a2 + cue(id(2), 1) ? lerp(f, a2 + cue(id(2), 1), a2 + cue(id(2), 1) + 14, 0, 40) : 0;
            return <g key={i} transform={`translate(${x} ${y})`}><path d={`M 26 ${-up} L 26 ${-110 - up}`} stroke={INK} strokeWidth={4} /><path d={`M 21 ${-110 - up} L 26 ${-128 - up} L 31 ${-110 - up} Z`} fill="#b8bcbd" stroke={INK} strokeWidth={2} /><circle cx={0} cy={0} r={22} fill="#5e6f80" stroke={INK} strokeWidth={3} /><path d="M -22 -2 C -14 -28 14 -28 22 -2 Z" fill="#8a3b2c" stroke={INK} strokeWidth={3} /></g>;
          })}
        </svg>
      </Cam>
      <SFX name="crowd" at={0} vol={0.16} dur={frames} />
      <SFX name="war_cry" at={a2 + cue(id(2), 1)} vol={0.16} dur={50} />
    </AbsoluteFill>
  );
};
// 그림자극 바탕: 노을 종이 위 검은 실루엣 (피 없음)
const Shadow = ({ children, op = 1 }: { children: React.ReactNode; op?: number }) => <div style={{ position: "absolute", inset: 0, filter: "brightness(0)", opacity: op }}>{children}</div>;
const ShadowBg = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #f0b872, #b5622e 75%, #5e2c16)" }} />;
// 첫째 명분: 타타르의 잔 → 쓰러지는 아버지 + 뒤의 금나라 깃발
const Tatar: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const drop = lerp(f, frames * 0.5, frames * 0.72, 0, 1, true);
  return (
    <AbsoluteFill>
      <ShadowBg />
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={960} cy={560}>
        <Svg><g opacity={lerp(f, 20, 50, 0, 0.95)}><FlagG x={1540} y={900} banner="jin" h={640} t={f} /></g></Svg>
        <Shadow>
          <Person L={MON} x={1180} y={940} h={620} arms="offer" eyes="sly" mouth="smile" flip />
          <div style={{ position: "absolute", inset: 0, transform: `rotate(${drop * 80}deg)`, transformOrigin: "640px 940px" }}>
            <Char id="yesugei" x={640} h={660} pose="front" bottom={140} enter="none" beat="none" />
          </div>
          <Svg><path d="M 1090 700 l 56 0 l -8 50 l -40 0 Z" fill="#000" /></Svg>
        </Shadow>
      </Cam>
    </AbsoluteFill>
  );
};
// 둘째 명분: 맥락 - 끌려가는 옛 칸의 실루엣 → 나무 당나귀 형틀 → 망치가 올라감 → 컷
const WoodenDonkey = () => (
  <g fill="#000">
    <path d="M 760 640 L 1240 640 L 1240 690 L 760 690 Z" />
    <path d="M 800 690 L 740 960 L 790 960 L 850 690 Z M 1200 690 L 1260 960 L 1210 960 L 1150 690 Z M 900 690 L 870 960 L 920 960 L 950 690 Z M 1100 690 L 1130 960 L 1080 960 L 1050 690 Z" />
    <path d="M 1240 660 L 1340 540 L 1400 560 L 1420 600 L 1360 620 L 1290 700 Z M 1340 540 L 1330 490 L 1360 530 Z M 1376 548 L 1380 500 L 1396 556 Z" />
    <path d="M 760 660 L 700 720 L 716 734 L 770 690 Z" />
  </g>
);
const Ambaghai: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(4), 1);
  const hit = frames - 14;
  const hammer = lerp(f, hit - 30, hit - 4, 0, 1, true);
  const black = lerp(f, hit, hit + 5, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ShadowBg />
      {f < c1 + 24 && (
        <AbsoluteFill style={{ opacity: lerp(f, c1 + 12, c1 + 24, 1, 0) }}><Cam z={1.04} cx={960} cy={560}>
          <Shadow>
            <Svg><path d={`M ${lerp(f, 0, c1, 520, 1120)} 760 L ${lerp(f, 0, c1, 160, 760)} 730`} stroke="#000" strokeWidth={7} /></Svg>
            <Person L={EMPEROR} x={lerp(f, 0, c1, 90, 730)} y={980} h={560} arms="offer" eyes="dot" bob={Math.abs(Math.sin(f / 7)) * 10} rot={6} />
            {[0, 1].map((i) => <Person key={i} L={JIN_SOL} x={lerp(f, 0, c1, 520 + i * 200, 1160 + i * 200)} y={980} h={600} arms="hold" eyes="dot" bob={Math.abs(Math.sin(f / 7 + i)) * 10}><Spear x={222} y={300} /></Person>)}
          </Shadow>
        </Cam></AbsoluteFill>
      )}
      {f >= c1 + 12 && (
        <AbsoluteFill style={{ opacity: lerp(f, c1 + 12, c1 + 24, 0, 1) }}>
          <Cam z={lerp(f, c1, frames, 1.0, 1.1)} cx={1020} cy={620}>
            <Svg><WoodenDonkey /></Svg>
            <Shadow>
              <Person L={JIN_SOL} x={1500} y={980} h={640} arms="fist" eyes="dot" flip />
              <div style={{ position: "absolute", inset: 0, transform: "rotate(-14deg)", transformOrigin: "950px 640px" }}><Person L={EMPEROR} x={980} y={700} h={420} arms="up" eyes="shut" mouth="wail" t={f} /></div>
            </Shadow>
            <Svg><g transform={`translate(1370 ${480 - hammer * 60}) rotate(${-40 - hammer * 30})`} fill="#000"><path d="M -6 0 L 6 0 L 6 120 L -6 120 Z" /><path d="M -34 -22 L 34 -22 L 34 14 L -34 14 Z" /></g></Svg>
          </Cam>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <SFX name="hit" at={hit} vol={0.3} dur={24} />
    </AbsoluteFill>
  );
};
// 지도: 대형이 갈라짐 - 본대는 수도 쪽 국경, 아들들은 북서쪽
const Split: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(5), 1), c2 = cue(id(5), 2), c3 = cue(id(5), 3);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.5, 1.7)} cx={lerp(f, 0, frames, 1020, 1050)} cy={lerp(f, 0, frames, 330, 380)}>
        <NationMap show={{ mongol: 1, jin: 1, xia: 1 }} fade={{ xia: 1 }}>
          <MapArrow d="M 860 250 C 960 280 1050 320 1130 400" len={330} p={lerp(f, c2 - 6, c2 + 50, 0, 1, true)} head="M 1106 424 L 1160 428 L 1138 376 Z" />
          <MapArrow d="M 860 250 C 860 310 900 370 960 420" len={210} p={lerp(f, c3 - 6, c3 + 40, 0, 1, true)} c="#7a8f5a" w={14} head="M 940 440 L 990 440 L 968 396 Z" />
          <FlagG x={1185} y={470} banner="jin" h={110} t={f} />
        </NationMap>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const main = i < 3;
          const start = main ? c2 : c3;
          const k = lerp(f, start, start + 60, 0, 0.9 - (i % 3) * 0.22, true);
          const gather = lerp(f, 0, c1, 0, 1, true);
          const x = main ? 860 + (1130 - 860) * k : 860 + (960 - 860) * k;
          const y = main ? 250 + (400 - 250) * k : 250 + (420 - 250) * k;
          const jx = (i - 2.5) * 26 * (1 - gather * 0.4);
          return <Rider key={i} kind={i === 0 ? "mongol_white" : i % 2 ? "mongol" : "mongol2"} x={x - 26 + jx * (k > 0 ? 0.3 : 1)} y={y - 32 + (i % 2) * 8} w={56} phase={i * 3} still={k === 0} />;
        })}
        <Char id="genghis" x={lerp(f, c2, c2 + 60, 760, 980, true)} h={300} pose="side" bottom={1080 - lerp(f, c2, c2 + 60, 280, 410, true)} enter="none" beat="none" />
      </Cam>
      <SFX name="hooves" at={c2 - 6} vol={0.2} dur={frames - c2} />
    </AbsoluteFill>
  );
};
// 황제가 완안승유에게 지휘 깃발을 내림
const Command: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(6), 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.12)} cx={1120} cy={lerp(f, 0, frames, 600, 560)}>
        <ThroneRoom />
        <Person L={EMPEROR} x={1300} y={640} h={400} arms={f >= c1 ? "point" : "sleeves"} eyes="worry" mouth="flat" sweat flip />
        <Person L={JIN_GEN} x={880} y={1020} h={640} arms="hold" eyes="dot" mouth="flat"><Spear x={222} y={300} flag="#c9a24a" /></Person>
        {[1660, 1820].map((x, i) => <Person key={i} L={JIN_SOL} x={x} y={1000} h={460} arms="hold" eyes="side" flip><Spear x={222} y={300} /></Person>)}
      </Cam>
      <SFX name="war_drums" at={c1} vol={0.16} dur={60} />
    </AbsoluteFill>
  );
};
// 국경 마을에서 곡식 수레가 수도로, 빈 창고 문이 닫힘 (청야)
const Grain: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(7), 1);
  const shut = lerp(f, c1 + 8, c1 + 36, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.06)} cx={920} cy={600}>
        <Steppe time="day" horizon={480} hills={false} />
        <Svg>
          <path d="M 80 680 L 80 340 L 700 340 L 700 680 Z" fill="#b89a6a" stroke={INK} strokeWidth={6} />
          <path d="M 30 350 L 390 200 L 750 350 Z" fill="#5a4a40" stroke={INK} strokeWidth={6} />
          <path d="M 280 680 L 280 430 L 500 430 L 500 680 Z" fill="#2a1e16" stroke={INK} strokeWidth={5} />
          <path d={`M 280 680 L ${280 + 110 * shut} 680 L ${280 + 110 * shut} 430 L 280 430 Z`} fill="#8a6440" stroke={INK} strokeWidth={5} />
          <path d={`M 500 680 L ${500 - 110 * shut} 680 L ${500 - 110 * shut} 430 L 500 430 Z`} fill="#8a6440" stroke={INK} strokeWidth={5} />
          <FlagG x={740} y={680} banner="jin" h={280} t={f} />
        </Svg>
        {[0, 1, 2].map((i) => <Cart key={i} x={lerp(f, 0, frames, 760 - i * 620, 1760 - i * 620)} y={780 + i * 30} w={560} t={f} load={<g><Sack x={-80} y={-146} s={1} /><Sack x={40} y={-146} s={1} /><Sack x={-20} y={-204} s={0.9} /></g>} />)}
        {[0, 1].map((i) => <Person key={i} L={PORTER} x={lerp(f, 0, frames, 680 - i * 620, 1680 - i * 620)} y={1020} h={430} arms="hold" eyes="side" bob={Math.abs(Math.sin(f / 6 + i)) * 8} />)}
      </Cam>
      <SFX name="gate" at={c1 + 8} vol={0.26} dur={30} />
    </AbsoluteFill>
  );
};
// 야호령에 모이는 금나라 대군 (1편 S5)
const Pass: React.FC<ShotProps> = ({ at, frames }) => <S5 frames={frames} at={() => at(id(8)) + cue(id(8), 2)} />;
// 오사보: 비계가 걸린 요새, 제베가 앞장서 쏟아짐 → 깃발이 쓰러짐
const Wusha: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a10 = at(id(10));
  const c1 = a10 + cue(id(10), 1), c2 = a10 + cue(id(10), 2);
  const fall = lerp(f, c2, c2 + 30, 0, 1, true);
  const go = lerp(f, 6, c1, 0, 1, true);
  return (
    <AbsoluteFill>
      {f < 102 && (
        <Cam z={lerp(f, 0, 90, 1.0, 1.1)} cx={720} cy={560}>
          <Steppe time="dusk" horizon={560} />
          <Char id="jebe" x={720} h={760} pose="angry" bottom={40} enter="none" beat="none" gesture="point" gestureAt={18} />
          <Char id="subutai" x={1300} h={600} pose="side" bottom={70} enter="none" beat="none" flip />
        </Cam>
      )}
      {f >= 90 && (
        <AbsoluteFill style={{ opacity: lerp(f, 90, 102, 0, 1) }}>
          <Cam z={lerp(f, 90, frames, 1.0, 1.1)} cx={lerp(f, c1, c1 + 40, 1020, 1160, true)} cy={560}>
            <Steppe time="day" horizon={560} hills={false} />
            <SmallFort top={250} base={580} x0={760} x1={2060} f={f} flag="jin" scaffold={1} door={lerp(f, c1, c1 + 16, 0, 1)} />
            <Svg><g opacity={1 - fall}><FlagG x={1410} y={250} banner="jin" h={130} t={f} fall={fall} /></g>{fall > 0 && <g transform="translate(1430 170)"><path d="M 0 80 L 0 -60" stroke={INK} strokeWidth={8} /><path d="M -12 -40 C -16 0 -8 30 0 44 C 8 30 16 0 12 -40 Z" fill="#f2ead8" stroke={INK} strokeWidth={4} opacity={fall} /></g>}</Svg>
            {f > c1 - 40 && [0, 1, 2].map((i) => <Person key={i} L={JIN_SOL} x={lerp(f, c1 - 20, c1 + 40, 1120 + i * 170, 1900 + i * 170)} y={830 + i * 30} h={320} arms="up" eyes="wide" mouth="wail" t={f} bob={Math.abs(Math.sin(f / 4 + i)) * 10} />)}
            {Array.from({ length: 7 }).map((_, i) => <Rider key={i} kind={i === 0 ? "mongol_white" : i % 2 ? "mongol" : "mongol2"} x={lerp(f, 100, c1 + 40, -700 - i * 170, 640 - i * 150)} y={670 + (i % 3) * 66} w={330} phase={i * 3} />)}
            <Dust x={lerp(f, 100, c1 + 40, -800, 400)} y={880} t={f} r={90} />
          </Cam>
          <SFX name="cavalry" at={100} vol={0.24} dur={Math.max(30, c1 + 30 - 100)} />
          <SFX name="impact" at={c1} vol={0.22} dur={30} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 다시 모여 말을 쉬게 함
const Rest: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={960} cy={610}>
        <Steppe time="dusk" horizon={540} />
        {[[160, 570, 170], [420, 556, 130], [1520, 556, 140], [1780, 572, 180]].map(([x, y, w], i) => <Ger key={i} x={x} y={y} w={w} />)}
        <Tug x={960} y={640} h={380} sway={Math.sin(f / 13) * 5} />
        {[[120, 630, 380], [520, 660, 430], [1000, 680, 460], [1400, 640, 400]].map(([x, y, w], i) => <Horse key={i} x={x} y={y} w={w} run={false} graze={0.7 + Math.sin(f / 24 + i) * 0.3} flip={i % 2 === 1} />)}
        {[[420, 1020], [1500, 1030]].map(([x, y], i) => <Person key={i} L={MON} x={x} y={y} h={400} kneel arms="sleeves" eyes="shut" mouth="smile" />)}
      </Cam>
      <SFX name="wind" at={0} vol={0.32} dur={frames + 10} fade={8} />
    </AbsoluteFill>
  );
};
// 고갯길을 메운 금나라 진영, 완안승유 → 금나라 사신이 칭기즈칸 앞에 → 지도를 펼치는 순간 검은 화면
const Eve: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a13 = at(id(13)), a14 = at(id(14));
  const open = lerp(f, a14 + 18, a14 + 52, 0, 1, true);
  const black = lerp(f, a14 + cue(id(14), 0) + sec(2.2), frames - 6, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < a13 + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, a13, 1.0, 1.1)} cx={1000} cy={600}>
            <Steppe time="night" horizon={540} />
            <Svg>
              <path d="M -40 560 L 300 220 L 560 520 L 820 300 L 1040 540 L 1300 260 L 1600 520 L 1960 240 L 1960 620 L -40 620 Z" fill="#2c3238" stroke={INK} strokeWidth={6} />
              {[[420, 640, 1], [640, 620, 0.9], [860, 650, 1.05], [1090, 625, 0.9], [1320, 650, 1.05], [1540, 620, 0.9], [1760, 640, 1]].map(([x, y, s], i) => <JinTentG key={i} x={x} y={y} s={s} lit={1} />)}
              {Array.from({ length: 10 }).map((_, i) => <FlagG key={i} x={120 + i * 190} y={720 + (i % 2) * 18} banner="jin" h={170} t={f + i * 8} />)}
            </Svg>
            <Glow x={1000} y={660} r={600} color="#f3a24e" op={0.3} />
            <Person L={JIN_GEN} x={1000} y={1060} h={560} arms="fist" eyes="angry" mouth="flat"><Spear x={222} y={300} flag="#c9a24a" /></Person>
          </Cam>
        </AbsoluteFill>
      )}
      {f >= a13 && (
        <AbsoluteFill style={{ opacity: lerp(f, a13, a13 + 12, 0, 1) }}>
          <Cam z={lerp(f, a13, frames, 1.05, 1.22)} cx={960} cy={600}>
            <Steppe time="night" horizon={620} />
            <Glow x={960} y={720} r={560} color="#f3a24e" op={0.45} />
            {[260, 1640].map((x, i) => <Ger key={i} x={x} y={640} w={300} lit={0.7} />)}
            <Tug x={460} y={720} h={420} sway={Math.sin(f / 13) * 5} />
            <Char id="genghis" x={640} h={700} pose="side" bottom={60} enter="none" beat="none" />
            <div style={{ position: "absolute", inset: 0, filter: "brightness(.42)" }}>
              <Person L={ENVOY} x={1390} y={1000} h={620} arms="offer" eyes="dot" flip bow={lerp(f, a14, a14 + 16, 0, 0.3)} />
            </div>
            <Svg><Scroll x={lerp(f, a14 + 8, a14 + 30, 1330, 1040, true)} y={lerp(f, a14 + 8, a14 + 30, 790, 930, true)} s={1.5} open={open * 2.4} /></Svg>
          </Cam>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <SFX name="wind" at={0} vol={0.26} dur={frames} fade={8} />
    </AbsoluteFill>
  );
};
const groups: Group[] = [
  { ids: [id(1), id(2)], Shot: Kurultai },
  { ids: [id(3)], Shot: Tatar },
  { ids: [id(4)], Shot: Ambaghai },
  { ids: [id(5)], Shot: Split },
  { ids: [id(6)], Shot: Command },
  { ids: [id(7)], Shot: Grain },
  { ids: [id(8)], Shot: Pass },
  { ids: [id(9), id(10)], Shot: Wusha },
  { ids: [id(11)], Shot: Rest },
  { ids: [id(12), id(13), id(14), id(15)], Shot: Eve },
];
export const M01R_CH6_FRAMES = chapterFrames("m1r.6") + ENDING_FRAMES;
export const M01RCh6 = ({ lang }: { lang?: Lang }) => {
  const total = chapterFrames("m1r.6");
  const body = (
    <AbsoluteFill>
      <Sequence durationInFrames={total}><Chapter ch="m1r.6" year="1211" groups={groups} music="march" /></Sequence>
      <Sequence from={total} durationInFrames={ENDING_FRAMES}>
        <Ending />
        <Snd src={staticFile("bgm/ending.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
  return lang ? <LangContext.Provider value={lang}>{body}</LangContext.Provider> : body;
};
void S7;
