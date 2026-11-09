// 몽골 1편 검수용 초안: 합격한 도입부 30초 + 1~5장을 이어 붙임 (2026-10-26)
import { Series } from "remotion";
import { Mongol01Hook, MONGOL01_HOOK_FRAMES } from "../hook/Mongol01Hook";
import { chapterFrames, Lang, LangContext, Stem, StemKind } from "./kit";
import { M01Ch1 } from "./M01Ch1";
import { M01Ch2 } from "./M01Ch2";
import { M01Ch3 } from "./M01Ch3";
import { M01Ch4 } from "./M01Ch4";
import { M01Ch5, M01_CH5_FRAMES } from "./M01Ch5";

const PARTS = [
  { C: Mongol01Hook, frames: MONGOL01_HOOK_FRAMES },
  { C: M01Ch1, frames: chapterFrames("1") },
  { C: M01Ch2, frames: chapterFrames("2") },
  { C: M01Ch3, frames: chapterFrames("3") },
  { C: M01Ch4, frames: chapterFrames("4") },
  { C: M01Ch5, frames: M01_CH5_FRAMES }, // 5장 = 편 끝 + 10초 엔딩
];
export const M01_DRAFT_FRAMES = PARTS.reduce((a, p) => a + p.frames, 0);
// lang: 영어(본편 기본 트랙)·한국어·스페인어·포르투갈어·힌디어·인도네시아어(더빙 트랙) - 화면은 같고 목소리만 바뀜
// stem: 목소리·배경을 따로 렌더할 때 (scripts/stem-mix.py)
export const M01Draft = ({ lang = "en", stem = "all" }: { lang?: Lang; stem?: StemKind }) => (
  <Stem.Provider value={stem}>
  <LangContext.Provider value={lang}>
    <Series>
      {PARTS.map(({ C, frames }, i) => <Series.Sequence key={i} durationInFrames={frames}><C /></Series.Sequence>)}
    </Series>
  </LangContext.Provider>
  </Stem.Provider>
);
