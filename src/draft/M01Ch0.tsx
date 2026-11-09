// 몽골 1편 훅 4판 (2026-10-27 사용자: "답은 10이라는 것도 별로 재미가 없어", "첩자라며 죽인 것도 굳이야, 별별역사를 봐봐 걔네 대사 다 들어봐")
// 결말(5장 오트라르)부터 꺼냄: 칭기즈칸의 마음이 세 번 바뀜 - 친구가 되고 싶음 → 한 번 참음 → "…실수가 아니었군" → 호라즘이 지도에서 사라짐
// 그림은 5장(M01Ch5.tsx) 것을 그대로 씀: 상단 출발·성벽 위 총독·밤 성문·주인 잃은 낙타·샤의 궁궐·지도. 장 카드 없이 첫 프레임부터 (kit cardOf)
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { Chapter, Char, clamp, Dim, ease, FPS, Ger, Glow, Group, Lang, LangContext, SFX, ShotProps, slotSec, Steppe, Tug } from "./kit";
import { Aftermath, GateNight, Guard, KH_CITIES, KhFlag, MapBoard, MapCam, Merchant, MX, MY, S4, S8, Sendoff, T_DAWN, T_SHUT } from "./M01Ch5";

const lerp = (f: number, a: number, b: number, from: number, to: number, e = false) =>
  b <= a ? (f >= b ? to : from) : interpolate(f, [a, b], [from, to], e ? { ...clamp, easing: ease } : clamp);
const speaking = (f: number, at: number, id: string) => f >= at && f < at + Math.ceil(slotSec(id) * FPS);

// 1) c0_01 어둠 속 칭기즈칸 실루엣, 등불 하나 - "여러분은 어떻게 하시겠습니까?"
const H1: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, frames, 1.0, 1.12)})`, transformOrigin: "50% 60%", opacity: lerp(f, 0, 14, 0, 1) }}>
        <Steppe time="night" horizon={780} />
        <Dim op={0.55} />
        <Glow x={1240} y={720} r={360} op={0.5} color="#f3a24e" />
        <div style={{ position: "absolute", inset: 0, filter: "brightness(0)" }}>
          <Char id="genghis" x={900} h={900} pose="side" bottom={40} enter="none" beat="none" />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 8, frames, 0, 1) }} />
      <SFX name="wind" at={0} vol={0.2} dur={frames} />
    </AbsoluteFill>
  );
};

// 2) c0_02 낮의 칸 진영: 웃으며 서쪽을 가리키는 칭기즈칸, 선물 실은 낙타를 끌고 떠나는 몽골 상인들 (5장 Sendoff) 😏
const H2: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sendoff f={f + 10} pose="happy" talking={speaking(f, at("c0_02"), "c0_02")} />
      <SFX name="hooves" at={0} vol={0.12} dur={frames} />
    </AbsoluteFill>
  );
};

// 3) c0_03 성벽 위 총독이 손가락질(5장 S4) → 밤 성문이 닫힘(쿵, 5장 GateNight) → 검은 화면 → 잿빛 새벽, 주인 잃은 낙타와 흩어진 짐("선물까지 빼앗습니다")
const WALL_END = 50;
const GATE_IN = 14; // GateNight를 이 프레임부터 (병사가 들어서는 데서)
const SHUT = WALL_END + T_SHUT - GATE_IN;
const DAWN = SHUT + 8;
const H3: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < WALL_END && <Sequence from={-60} durationInFrames={60 + WALL_END}><S4 at={() => 0} frames={200} /></Sequence>}
      {f >= WALL_END && f < SHUT + 2 && <GateNight f={f - WALL_END + GATE_IN} />}
      {f >= DAWN && <Aftermath f={f - DAWN + T_DAWN} />}
      <SFX name="gate" at={WALL_END} vol={0.4} dur={SHUT - WALL_END} />
      <SFX name="impact" at={SHUT} vol={0.6} dur={50} />
      <SFX name="wind" at={DAWN} vol={0.25} dur={frames - DAWN} />
    </AbsoluteFill>
  );
};

// 4) c0_04 노을 진영: 칭기즈칸이 고개를 갸웃(화내지 않음) "실수겠지. 그 총독만 넘겨라." - 앞에 선 사신 셋(칸의 패)
const H4: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L = at("c0_04");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, frames, 1.0, 1.06)})`, transformOrigin: "62% 58%" }}>
        <Steppe time="dusk" horizon={600} />
        {Array.from({ length: 10 }).map((_, i) => <Ger key={i} x={120 + i * 185} y={630 + (i % 3) * 12} w={130} door={i % 2 ? "#8a3b2c" : "#4d6b8a"} lit={0.6} />)}
        {Array.from({ length: 6 }).map((_, i) => <Tug key={`t${i}`} x={1150 + i * 120} y={660} h={300} sway={Math.sin((f + i * 11) / 13) * 5} />)}
        <Guard x={1780} h={500} bottom={150} flip />
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${lerp(f, 4, 18, 0, -4, true)}deg)`, transformOrigin: "1380px 980px" }}>
          <Char id="genghis" x={1380} h={650} pose="front" flip bottom={100} enter="none" beat="none" gesture="open" gestureAt={L + 30} talking={speaking(f, L, "c0_04")} />
        </div>
        {[0, 1, 2].map((i) => <Merchant key={i} x={520 + i * 170} y={930 + i * 12} s={0.95 + i * 0.05} walk={false} v={i + 1} look={0.35} paiza />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 5) c0_05 샤의 궁궐(5장 S8): 사신 하나가 끌려 나감 → 벽 그림자로 칼(컷) → 수염이 밀린 두 사신이 턱을 가리고 쫓겨남
const H5: React.FC<ShotProps> = ({ frames }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence from={-24} durationInFrames={24 + frames}><S8 at={() => 0} frames={24 + frames} /></Sequence>
  </AbsoluteFill>
);

// 6) c0_06 칭기즈칸 얼굴 가까이: 담담하던 얼굴이 굳음(긴 정적) "…실수가 아니었군." → 뒤로 검은 툭(전쟁의 깃발)이 솟음
const H6: React.FC<ShotProps> = ({ at, frames }) => {
  const f = useCurrentFrame();
  const L = at("c0_06");
  const HARD = L + 24;
  const WAR = L + Math.ceil(slotSec("c0_06") * FPS) + 4;
  const up = spring({ frame: f - WAR, fps: FPS, config: { damping: 13, stiffness: 100 } });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(f, 0, frames, 1.0, 1.1)})`, transformOrigin: "50% 40%" }}>
        <Steppe time="dusk" horizon={760} />
        <Dim op={lerp(f, 0, frames, 0.25, 0.5)} />
        {f >= WAR - 2 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - up) * 700}px)` }}><Tug x={1560} y={1100} h={900} color="#1d1612" sway={Math.sin(f / 9) * 8} /></div>}
        <Glow x={760} y={420} r={520} op={0.35} color="#f6b06a" />
        <Char id="genghis" x={860} h={1500} pose={f >= HARD ? "angry" : "front"} bottom={-430} enter="none" beat="none" talking={speaking(f, L, "c0_06")} />
      </AbsoluteFill>
      <SFX name="drum" at={HARD} vol={0.3} />
      <SFX name="war_drums" at={WAR} vol={0.4} dur={frames - WAR} />
    </AbsoluteFill>
  );
};

// 7) c0_07 지도: 호라즘 땅(초록)이 가장자리부터 줄어들며 지워지고, 도시마다 꽂힌 호라즘 깃발이 차례로 쓰러짐 → 검은 화면
const H7: React.FC<ShotProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const kh = lerp(f, 24, frames - 40, 1, 0, true);
  return (
    <AbsoluteFill style={{ background: "#c3cbbd" }}>
      <MapCam z={lerp(f, 0, frames, 0.8, 0.9)} cx={MX(61)} cy={MY(37.5)}>
        <MapBoard kh={kh} />
        {KH_CITIES.map(([x, y], i) => <KhFlag key={i} x={x + 34} y={y} h={130} fall={lerp(f, 30 + i * 10, 44 + i * 10, 0, 1, true)} />)}
      </MapCam>
      <AbsoluteFill style={{ background: "#000", opacity: lerp(f, frames - 28, frames, 0, 1) }} />
      <SFX name="rumble" at={20} vol={0.3} dur={frames - 20} />
    </AbsoluteFill>
  );
};

const groups: Group[] = [
  { ids: ["c0_01"], Shot: H1 },
  { ids: ["c0_02"], Shot: H2 },
  { ids: ["c0_03"], Shot: H3 },
  { ids: ["c0_04"], Shot: H4 },
  { ids: ["c0_05"], Shot: H5 },
  { ids: ["c0_06"], Shot: H6 },
  { ids: ["c0_07"], Shot: H7 },
];
export const M01Ch0 = ({ lang }: { lang?: Lang }) => {
  const ch = <Chapter ch="0" year="" groups={groups} music="intrigue" />;
  return lang ? <LangContext.Provider value={lang}>{ch}</LangContext.Provider> : ch;
};
