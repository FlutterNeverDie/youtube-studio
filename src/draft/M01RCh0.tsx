// 금나라 정복전 1부 훅 (2026-11-06 사용자: "훅은 우리타입으로") - 대본 episodes/mongol-01r/script-ko.md "## 0."
// 초원 통일 → 금나라 지도 → 거대한 성벽 → 칭기즈칸 → 흰 툭
import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame } from "remotion";
import { Chapter, Char, cue, Dim, FPS, Ger, Glow, Group, INK, Lang, LangContext, Rider, SFX, ShotProps, Steppe, Tug } from "./kit";
import { Cam, FlagG, RiderOn, MON, ZhongduG } from "./M01Ch4";
import { lerp, NationMap, Svg } from "./M01RParts";

const id = (n: number) => `m1r.c0_${String(n).padStart(2, "0")}`;
const TRIBE = [
  { x: 240, c: "#b23a2c", k: "merkit" }, { x: 560, c: "#6a8a4a", k: "jamukha" }, { x: 1360, c: "#3d5a80", k: "toghrul" }, { x: 1680, c: "#7a4a7a", k: "yesugei" },
];
void RiderOn; void MON;
// 1) 부족 깃발들이 맞서다 차례로 쓰러짐, 가운데 흰 툭이 올라옴. 맥락: 몽골 초원
const H1: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(1), 1), c2 = cue(id(1), 2);
  const rise = lerp(f, c2 - 6, c2 + 30, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.08)} cx={960} cy={600}>
        <Steppe time="day" horizon={560} />
        {[[120, 590, 150], [430, 575, 120], [1480, 578, 130], [1800, 595, 160]].map(([x, y, w], i) => <Ger key={i} x={x} y={y} w={w} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} />)}
        {TRIBE.map((t, i) => {
          const dir = i < 2 ? 1 : -1;
          const fall = lerp(f, c1 + 30 + i * 22, c1 + 54 + i * 22, 0, 1, true);
          const clash = Math.sin(f / 6 + i) * 8;
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", inset: 0, transform: `rotate(${dir * fall * 78}deg)`, transformOrigin: `${t.x}px 930px`, opacity: 1 - fall * 0.35 }}>
                <Tug x={t.x} y={930} h={560} color={t.c} sway={Math.sin((f + i * 13) / 11) * 6} />
              </div>
              {[0, 1, 2].map((j) => <Rider key={j} kind={t.k} x={t.x + (dir > 0 ? 40 : -300) + dir * j * 70 + clash} y={760 + j * 46} w={260 - j * 20} flip={dir < 0} phase={j * 3 + i} still={fall > 0.7} />)}
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - rise) * 720}px)` }}>
          <Tug x={960} y={960} h={760} sway={Math.sin(f / 13) * 7} />
        </div>
      </Cam>
      <SFX name="battle_far" at={0} vol={0.16} dur={at(id(1)) + c2 + 10} />
    </AbsoluteFill>
  );
};
// 2) 지도: 몽골 남쪽의 금나라 땅이 켜짐, 금나라 깃발
const H2: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const c1 = cue(id(2), 1);
  const jin = lerp(f, c1 - 8, c1 + 14, 0, 1, true);
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.1, 1.3)} cx={lerp(f, 0, frames, 1000, 1180)} cy={lerp(f, 0, frames, 320, 470)}>
        <NationMap show={{ mongol: 1, jin }} fade={{ mongol: 0 }}>
          {jin > 0.5 && <FlagG x={1262} y={560} banner="jin" h={130} t={f} />}
        </NationMap>
      </Cam>
      <SFX name="map" at={0} vol={0.2} dur={frames} fade={8} />
      <SFX name="drum" at={c1} vol={0.18} dur={40} />
    </AbsoluteFill>
  );
};
// 3) 맥락: 초원에서 내려온 기병들 앞의 거대한 금나라 성벽 도시
const H3: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const grow = lerp(f, 0, frames, 1.2, 0.92, true);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#b9c7cc, #e6d3a8 60%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${grow})`, transformOrigin: "50% 62%" }}>
        <Svg><ZhongduG /></Svg>
      </div>
      <Svg><path d="M -40 820 C 500 790 1300 800 1960 830 L 1960 1100 L -40 1100 Z" fill="#7c8148" stroke={INK} strokeWidth={5} /></Svg>
      {[[120, 790, 300], [370, 820, 360], [650, 800, 320], [1040, 830, 340], [1320, 800, 300], [1570, 820, 330]].map(([x, y, w], i) => <Rider key={i} kind={i === 2 ? "mongol_white" : "mongol"} x={x} y={y} w={w} phase={i * 3} still />)}
      <SFX name="wind" at={0} vol={0.2} dur={frames} fade={8} />
    </AbsoluteFill>
  );
};
// 4) 노을 속 칭기즈칸 가까이, 뒤로 흰 툭들
const H4: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.1)} cx={960} cy={420}>
        <Steppe time="dusk" horizon={720} />
        <Glow x={960} y={420} r={620} op={0.4} color="#f6c07a" />
        {[220, 420, 620, 1300, 1500, 1700].map((x, i) => <Tug key={i} x={x} y={820} h={620 - Math.abs(960 - x) / 6} sway={Math.sin((f + i * 11) / 13) * 7} />)}
        <Char id="genghis" x={960} h={1080} pose="front" bottom={-200} enter="none" beat="none" />
      </Cam>
      <SFX name="wind" at={0} vol={0.18} dur={frames} fade={8} />
    </AbsoluteFill>
  );
};
// 5) 흰 툭이 화면 가득 솟음 (시리즈 끝 멘트)
const H5: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const up = spring({ frame: f - 4, fps: FPS, config: { damping: 14, stiffness: 90 } });
  return (
    <AbsoluteFill>
      <Cam z={lerp(f, 0, frames, 1.0, 1.06)} cx={960} cy={520}>
        <Steppe time="dusk" horizon={800} />
        <Dim op={0.2} />
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - up) * 900}px)` }}>
          <Tug x={960} y={1120} h={1120} sway={Math.sin(f / 9) * 12} />
          {[420, 1500].map((x, i) => <Tug key={i} x={x} y={1120} h={760} sway={Math.sin((f + i * 20) / 11) * 9} />)}
        </div>
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 14, frames, 0, 1) }} />
    </AbsoluteFill>
  );
};
const groups: Group[] = [
  { ids: [id(1)], Shot: H1 },
  { ids: [id(2)], Shot: H2 },
  { ids: [id(3)], Shot: H3 },
  { ids: [id(4)], Shot: H4 },
  { ids: [id(5)], Shot: H5 },
];
export const M01RCh0 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="m1r.0" year="" groups={groups} music="hook" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
