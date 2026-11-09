// 몽골 1편 수정판 4장 - 금나라는 왜 유목민을 경계했나 (대본 05:49-07:11)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chapter, Char, cue, Group, INK, Lang, LangContext, SFX, ShotProps, Steppe, Tug } from "./kit";
import { Cam, Cart, ENVOY, FlagG, Horse, JIN_GEN, Look, OFFICIAL, Person, PineG, RiderOn, Spear, SWall, ThroneRoom } from "./M01Ch4";
import { lerp, NationMap, Sack, Scroll, sec, Svg, WEISHAO, ZHANGZONG } from "./M01RParts";

const id = (n: number) => `m1r.c4_${String(n).padStart(2, "0")}`;
void Char;
// 궁궐 탁자의 초원 지도: 부족 깃발 셋 + 곡식 수레를 옮기는 관리
const TRIBES: [number, number, string][] = [[1180, 300, "#b23a2c"], [760, 380, "#6a8a4a"], [420, 270, "#3d5a80"]]; // 타타르·케레이트·나이만
const Table: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a2 = at(id(2)), a3 = at(id(3));
  const c = [a2, a2 + cue(id(2), 1), a2 + cue(id(2), 1) + 50];
  const cartOn = f < c[0] ? 0 : f < c[1] ? 0 : f < c[2] ? 1 : 2;
  const pos = (n: number) => [TRIBES[n][0] + 90, TRIBES[n][1] + 44];
  const prev = pos(Math.max(0, cartOn - 1)), now = pos(cartOn);
  const t0 = cartOn === 0 ? 0 : c[cartOn];
  const k = lerp(f, t0, t0 + 24, 0, 1, true);
  const bonk = f >= a3 ? Math.max(0, Math.sin(f / 6)) : 0;
  return (
    <AbsoluteFill style={{ background: "#3a2a1e" }}>
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={920} cy={520}>
        <div style={{ position: "absolute", left: 40, top: 40, width: 1840, height: 880, overflow: "hidden", border: `10px solid ${INK}`, borderRadius: 14 }}>
          <div style={{ position: "absolute", left: -40, top: 60, width: 1920, height: 1080, transform: "scale(1.5)", transformOrigin: "50% 30%" }}><NationMap show={{ jin: 1 }} /></div>
        </div>
        {TRIBES.map(([x, y, c0], i) => {
          const fed = cartOn === i && f >= a2;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, transform: `translateX(${(i === 1 ? -1 : 1) * bonk * 30}px) scale(1)`, transformOrigin: `${x}px ${y}px` }}>
              <Tug x={x} y={y + 90} h={fed ? 320 : 230} color={c0} sway={Math.sin((f + i * 11) / 11) * 5} />
            </div>
          );
        })}
        <Svg>
          <g transform={`translate(${prev[0] + (now[0] - prev[0]) * k} ${prev[1] + (now[1] - prev[1]) * k})`}>
            <path d="M -60 10 L 60 10 L 48 40 L -48 40 Z" fill="#8a6440" stroke={INK} strokeWidth={5} />
            <circle cx={-34} cy={46} r={15} fill="#5a4030" stroke={INK} strokeWidth={4} /><circle cx={34} cy={46} r={15} fill="#5a4030" stroke={INK} strokeWidth={4} />
            <Sack x={-22} y={-14} s={0.5} /><Sack x={22} y={-14} s={0.5} />
          </g>
        </Svg>
        <Person L={OFFICIAL} x={1660} y={1120} h={760} arms="point" eyes="sly" mouth="grin" flip />
      </Cam>
      <SFX name="page" at={6} vol={0.2} dur={24} />
      <SFX name="swords" at={a3} vol={0.2} dur={50} />
    </AbsoluteFill>
  );
};
// 철부도: 쇠 찰갑 기병 + 말 갑옷 (주인공 물건)
const HEAVY: Look = { robe: "#5f6668", dark: "#474d4f", trim: "#c9a24a", hat: "jin_general", beard: "full", armor: true, collar: "round" };
const IronRider = ({ x, y, w, f, i }: { x: number; y: number; w: number; f: number; i: number }) => (
  <Horse x={x} y={y} w={w} phase={i * 5} coat="#6b7072" dark="#474d4f" mane="#262220" saddle="#a8332a" run={true}>
    <RiderOn L={HEAVY} arms="hold" eyes="dot" t={f + i * 7} />
  </Horse>
);
const HUNTER: Look = { robe: "#6a5a44", dark: "#4f4232", trim: "#c9b08a", hat: "fur", beard: "thin", collar: "cross" };
const Pagoda: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const a5 = at(id(5));
  const c1 = a5 + cue(id(5), 1);
  const c2 = a5 + cue(id(5), 2);
  const forest = f >= c1 - 4 && f < c2 + 8 && (
      <AbsoluteFill style={{ opacity: Math.min(lerp(f, c1 - 4, c1 + 8, 0, 1), lerp(f, c2 - 4, c2 + 8, 1, 0)) }}>
        <Cam z={lerp(f, c1, c2, 1.0, 1.08)} cx={960} cy={600}>
          <Steppe time="dusk" horizon={700} hills={false} />
          <Svg>
            {Array.from({ length: 13 }).map((_, i) => <PineG key={i} x={40 + i * 150} y={720 + (i % 2) * 20} h={500 + (i % 3) * 70} />)}
          </Svg>
          {[0, 1, 2].map((i) => (
            <Horse key={i} x={lerp(f, c1, c2 + 8, -300 + i * 500, 80 + i * 500)} y={620 + (i % 2) * 40} w={500} phase={i * 6}>
              <RiderOn L={HUNTER} arms="hold" eyes="dot" t={f + i * 5} />
            </Horse>
          ))}
        </Cam>
        <SFX name="gallop" at={c1} vol={0.18} dur={c2 - c1} />
      </AbsoluteFill>
  );
  const walk = lerp(f, a5, frames, -30, 120);
  return (
    <AbsoluteFill>
      <Cam z={f < c2 ? lerp(f, 0, c2, 1.0, 1.1) : lerp(f, c2, c2 + 40, 1.1, 1.55, true)} cx={f < c2 ? 960 : 1200} cy={f < c2 ? 600 : 520}>
        <AbsoluteFill style={{ background: "linear-gradient(#dfe6df, #efe8cf 46%, #9fb065 47%, #86994f)" }} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${walk}px)` }}>
          {[0, 1, 2, 3, 4].map((i) => <IronRider key={i} x={-120 + i * 400} y={500} w={420} f={f} i={i} />)}
          {[0, 1, 2, 3].map((i) => <IronRider key={`b${i}`} x={40 + i * 480} y={620} w={560} f={f} i={i + 5} />)}
        </div>
      </Cam>
      {forest}
      <SFX name="hooves" at={0} vol={0.22} dur={frames} />
      {frames < 0 && <Spear x={0} y={0} />}
    </AbsoluteFill>
  );
};
// 지도: 금나라 땅이 요나라 자리를 덮고 송나라를 남쪽으로 밀어냄
const Conquest: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(6), 1);
  const song = lerp(f, c1, c1 + 44, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={1.25} cx={lerp(f, 0, c1 + 20, 1180, 1130, true)} cy={lerp(f, 0, c1 + 20, 340, 560, true)}>
        <NationMap show={{ jin: lerp(f, 4, 40, 0, 1), song: 1 }}>
          <FlagG x={1262} y={560} banner="jin" h={140} t={f} />
          {/* 쓰러지는 요나라 깃발 */}
          <g transform={`translate(1240 240) rotate(${lerp(f, 16, 40, 0, 84, true)})`}><path d="M 0 0 L 0 -130" stroke={INK} strokeWidth={8} /><path d="M 2 -128 L 84 -128 L 66 -100 L 84 -72 L 2 -72 Z" fill="#6a4a8a" stroke={INK} strokeWidth={4} /></g>
          {/* 남쪽으로 밀리는 송나라 깃발 */}
          <g transform={`translate(1130 ${lerp(song, 0, 1, 610, 830)})`}><path d="M 0 0 L 0 -110" stroke={INK} strokeWidth={7} /><path d="M 2 -108 L 70 -96 L 2 -70 Z" fill="#c9a24a" stroke={INK} strokeWidth={4} /></g>
        </NationMap>
      </Cam>
      <SFX name="map" at={4} vol={0.22} dur={40} />
    </AbsoluteFill>
  );
};
// 만리장성과 유목 기병: 1편 SWall 그대로 (대사 자리만 맞춤)
const Wall: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const A3 = sec(7.3) + 60, FOREST = A3 + sec(3.45);
  const dip = Math.max(...[A3, FOREST].map((t) => Math.min(lerp(f, t - 15, t, 0, 1), lerp(f, t, t + 15, 1, 0))));
  return (
    <AbsoluteFill>
      <SWall frames={frames} at={() => A3} />
      <AbsoluteFill style={{ background: "#000", opacity: dip }} />
    </AbsoluteFill>
  );
};
// 지도의 깃발이 흰 툭 하나로 합쳐짐 → 관리들이 굳음
const Merge: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const m = lerp(f, 8, 44, 0, 1, true);
  return (
    <AbsoluteFill style={{ background: "#3a2a1e" }}>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={900} cy={520}>
        <div style={{ position: "absolute", left: 40, top: 40, width: 1840, height: 880, overflow: "hidden", border: `10px solid ${INK}`, borderRadius: 14 }}>
          <div style={{ position: "absolute", left: -40, top: 60, width: 1920, height: 1080, transform: "scale(1.5)", transformOrigin: "50% 30%" }}><NationMap show={{ jin: 1, mongol: m }} /></div>
        </div>
        {TRIBES.map(([x, y, c0], i) => <div key={i} style={{ position: "absolute", inset: 0, transform: `translate(${(780 - x) * m}px, ${(330 - y) * m}px)`, opacity: 1 - m }}><Tug x={x} y={y + 90} h={230} color={c0} sway={Math.sin((f + i * 11) / 11) * 5} /></div>)}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - m) * 60}px)`, opacity: m }}><Tug x={640} y={470} h={320 + m * 120} sway={Math.sin(f / 12) * 6} /><Char id="genghis" x={820} h={420} pose="side" bottom={1080 - 520} enter="none" beat="none" /></div>
        {[1250, 1500].map((x, i) => <Person key={i} L={OFFICIAL} x={x} y={1100} h={620} arms={m > 0.6 ? "up" : "sleeves"} eyes={m > 0.6 ? "wide" : "dot"} mouth={m > 0.6 ? "o" : "flat"} sweat={m > 0.6} flip />)}
        <Person L={JIN_GEN} x={1760} y={1110} h={660} arms="hold" eyes={m > 0.6 ? "worry" : "dot"} flip><Spear x={222} y={300} /></Person>
      </Cam>
      <SFX name="gong" at={40} vol={0.22} dur={40} />
    </AbsoluteFill>
  );
};
// 장종이 병상에 눕고 → 겁먹은 얼굴의 위소왕이 옥좌에
const Succession: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(11), 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < c1 + 12 && (
        <AbsoluteFill>
          <Cam z={lerp(f, 0, c1, 1.0, 1.12)} cx={1000} cy={640}>
            <ThroneRoom />
            <AbsoluteFill style={{ background: "rgba(20,12,8,.32)" }} />
            <Svg>
              <path d="M 620 860 L 1340 860 L 1340 940 L 620 940 Z" fill="#7a3426" stroke={INK} strokeWidth={6} />
              <path d="M 640 760 C 800 720 1180 720 1320 770 L 1320 870 L 640 870 Z" fill="#d9a93a" stroke={INK} strokeWidth={6} />
            </Svg>
            <div style={{ position: "absolute", inset: 0, transform: "rotate(-84deg)", transformOrigin: "760px 780px" }}><Person L={ZHANGZONG} x={760} y={1040} h={430} arms="down" eyes="shut" mouth="flat" /></div>
            {[440, 1500].map((x, i) => <Person key={i} L={OFFICIAL} x={x} y={1010} h={460} arms="sleeves" eyes="cry" mouth="frown" bow={0.5} flip={i === 1} />)}
          </Cam>
        </AbsoluteFill>
      )}
      {f >= c1 && (
        <AbsoluteFill style={{ opacity: lerp(f, c1, c1 + 12, 0, 1) }}>
          <Cam z={lerp(f, c1, frames, 1.0, 1.5, true)} cx={1300} cy={lerp(f, c1, frames, 560, 400, true)}>
            <ThroneRoom />
            <Person L={WEISHAO} x={1300} y={640} h={400} arms="sleeves" eyes="worry" mouth="wobble" t={f} sweat rot={Math.sin(f / 5) * 1.5} />
            {[880, 1760].map((x, i) => <Person key={i} L={OFFICIAL} x={x} y={1000} h={420} arms="sleeves" eyes="side" bow={0.35} flip={i === 1} />)}
          </Cam>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
// 위소왕이 사신에게 조서를 건넴 → 사신이 북쪽으로 출발
const Sends: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const give = lerp(f, 10, 34, 0, 1, true);
  const go = lerp(f, frames - 50, frames, 0, 1);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={1060} cy={620}>
        <ThroneRoom />
        <Person L={WEISHAO} x={1300} y={640} h={400} arms="offer" eyes="dot" mouth="flat" front={give < 1 ? <Scroll x={150} y={300} s={0.7} /> : undefined} />
        <Person L={ENVOY} x={lerp(go, 0, 1, 920, 300)} y={960} h={520} arms="offer" eyes="dot" bow={give < 1 ? 0.5 : 0.15} flip={go > 0} front={give >= 1 ? <Scroll x={150} y={300} s={0.75} /> : undefined} />
      </Cam>
    </AbsoluteFill>
  );
};
const groups: Group[] = [
  { ids: [id(1), id(2), id(3)], Shot: Table },
  { ids: [id(4), id(5)], Shot: Pagoda },
  { ids: [id(6)], Shot: Conquest },
  { ids: [id(7), id(8), id(9)], Shot: Wall },
  { ids: [id(10)], Shot: Merge },
  { ids: [id(11)], Shot: Succession },
  { ids: [id(12)], Shot: Sends },
];
export const M01RCh4 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m1r.4" year="1208" groups={groups} music="tension" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
void Cart;
