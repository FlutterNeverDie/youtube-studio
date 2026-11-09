// 몽골 2편 전체 이어 보기 (2026-11-02) - 훅 + 1~4장 + 끝 장(20초 엔딩 포함), 장마다 그대로 이어 붙임
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { chapterFrames, DuckLang, Lang, Stem, StemKind } from "./kit";
import { M02Ch0 } from "./M02Ch0";
import { M02Ch1 } from "./M02Ch1";
import { M02Ch2 } from "./M02Ch2";
import { M02Ch3 } from "./M02Ch3";
import { M02Ch4 } from "./M02Ch4";
import { M02_CH5_FRAMES, M02Ch5 } from "./M02Ch5";

const PARTS: [React.FC<{ lang?: Lang }>, number][] = [
  [M02Ch0, chapterFrames("m2.0")],
  [M02Ch1, chapterFrames("m2.1")],
  [M02Ch2, chapterFrames("m2.2")],
  [M02Ch3, chapterFrames("m2.3")],
  [M02Ch4, chapterFrames("m2.4")],
  [M02Ch5, M02_CH5_FRAMES],
];
export const M02_EP_FRAMES = PARTS.reduce((a, [, n]) => a + n, 0);
// stem: 더빙 트랙용으로 목소리·배경을 따로 렌더 (scripts/stem-mix.py, 2026-11-03 - 1편 M01Ep와 같음)
export const M02Ep = ({ lang = "ko", stem = "all", duck }: { lang?: Lang; stem?: StemKind; duck?: Lang }) => {
  let at = 0;
  return (
    <Stem.Provider value={stem}>
    <DuckLang.Provider value={duck ?? null}>
    <AbsoluteFill style={{ background: "#000" }}>
      {PARTS.map(([C, n], i) => {
        const from = at;
        at += n;
        return <Sequence key={i} from={from} durationInFrames={n}><C lang={lang} /></Sequence>;
      })}
    </AbsoluteFill>
    </DuckLang.Provider>
    </Stem.Provider>
  );
};
