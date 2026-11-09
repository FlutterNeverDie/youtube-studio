// 몽골 1편 새 구성 (2026-10-27 사용자: 1·2장 빼고 "훅 18초 + 시리즈 시작 멘트 → 3장"부터, 4·5장 그대로)
// 짧은 훅 → 3장 → 4장 → 5장(+엔딩). 훅 브금은 SHORT_TAIL 동안 3장 밑으로 겹쳐 빠짐 (M01HookCh3와 같은 이음새)
import { AbsoluteFill, Sequence } from "remotion";
import { chapterFrames, Lang, LangContext, Stem, StemKind } from "./kit";
import { M01Ch3 } from "./M01Ch3";
import { M01Ch4 } from "./M01Ch4";
import { M01Ch5, M01_CH5_FRAMES } from "./M01Ch5";
import { Mongol01Hook, shortEnd, SHORT_TAIL } from "../hook/Mongol01Hook";

const AFTER = "c0_01"; // "지금부터, 몽골 제국 시리즈를 시작합니다."
const HOOK_END = shortEnd(AFTER);
const PARTS = [
  { C: M01Ch3, frames: chapterFrames("3") },
  { C: M01Ch4, frames: chapterFrames("4") },
  { C: M01Ch5, frames: M01_CH5_FRAMES },
];
const FROM = PARTS.reduce<number[]>((a, p, i) => [...a, i ? a[i - 1] + PARTS[i - 1].frames : HOOK_END], []);
export const M01_EP_FRAMES = FROM[PARTS.length - 1] + PARTS[PARTS.length - 1].frames;
// 장이 시작하는 프레임 (설명 장 시각·자막에서 씀)
export const M01_EP_STARTS = { hook: 0, "3": FROM[0], "4": FROM[1], "5": FROM[2] };

// lang: 영어(본편 기본 트랙)·한국어·더빙 언어 / stem: 목소리·배경 따로 렌더 (scripts/stem-mix.py)
export const M01Ep = ({ lang = "en", stem = "all" }: { lang?: Lang; stem?: StemKind }) => (
  <Stem.Provider value={stem}>
    <LangContext.Provider value={lang}>
      <AbsoluteFill style={{ background: "#000" }}>
        <Sequence durationInFrames={HOOK_END + SHORT_TAIL}><Mongol01Hook short after={AFTER} /></Sequence>
        {PARTS.map(({ C, frames }, i) => <Sequence key={i} from={FROM[i]} durationInFrames={frames}><C /></Sequence>)}
      </AbsoluteFill>
    </LangContext.Provider>
  </Stem.Provider>
);
