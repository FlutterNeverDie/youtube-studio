// 몽골 1편 새 앞부분 (2026-10-27 사용자: "기존 영상 18초까지만 그대로 쓰고 1·2장 빼고 3장부터, 뚝 끊기는 거랑 어색한 건 수정")
// 짧은 훅(합격 훅을 "어떻게 가능했을까요?"에서 끊음) → 3장. 훅 브금(main)이 SHORT_TAIL 동안 3장 카드·브금(discovery) 밑으로 겹치며 빠짐
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Lang, LangContext, NoBgm, Stem, StemKind, chapterFrames } from "./kit";
import { M01Ch3 } from "./M01Ch3";
import { Mongol01Hook, shortEnd, SHORT_TAIL } from "../hook/Mongol01Hook";

// "어떻게 가능했을까요?" 뒤 시리즈 시작 멘트 (2026-10-27 사용자)
const AFTER = "c0_01";
const HOOK_END = shortEnd(AFTER);

export const M01_HOOK_CH3_FRAMES = HOOK_END + chapterFrames("3");

export const M01HookCh3 = ({ lang = "ko", noBgm = false, stem = "all" }: { lang?: Lang; noBgm?: boolean; stem?: StemKind }) => (
  <Stem.Provider value={stem}>
  <NoBgm.Provider value={noBgm}>
  <LangContext.Provider value={lang}>
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={HOOK_END + SHORT_TAIL}><Mongol01Hook short after={AFTER} /></Sequence>
      <Sequence from={HOOK_END}><M01Ch3 /></Sequence>
    </AbsoluteFill>
  </LangContext.Provider>
  </NoBgm.Provider>
  </Stem.Provider>
);
