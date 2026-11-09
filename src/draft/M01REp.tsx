// 몽골 1편 수정판 전체 이어 보기 (2026-11-05) - M02Ep와 같은 틀. stem: 더빙 트랙용 목소리·배경 분리
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { chapterFrames, DuckLang, Lang, Stem, StemKind } from "./kit";
import { M01RCh0 } from "./M01RCh0";
import { M01RCh1 } from "./M01RCh1";
import { M01RCh2 } from "./M01RCh2";
import { M01RCh3 } from "./M01RCh3";
import { M01RCh4 } from "./M01RCh4";
import { M01RCh5 } from "./M01RCh5";
import { M01R_CH6_FRAMES, M01RCh6 } from "./M01RCh6";

const PARTS: [React.FC<{ lang?: Lang }>, number][] = [
  [M01RCh0, chapterFrames("m1r.0")],
  [M01RCh1, chapterFrames("m1r.1")],
  [M01RCh2, chapterFrames("m1r.2")],
  [M01RCh3, chapterFrames("m1r.3")],
  [M01RCh4, chapterFrames("m1r.4")],
  [M01RCh5, chapterFrames("m1r.5")],
  [M01RCh6, M01R_CH6_FRAMES],
];
export const M01R_EP_FRAMES = PARTS.reduce((a, [, n]) => a + n, 0);
export const M01REp = ({ lang = "ko", stem = "all", duck }: { lang?: Lang; stem?: StemKind; duck?: Lang }) => {
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
