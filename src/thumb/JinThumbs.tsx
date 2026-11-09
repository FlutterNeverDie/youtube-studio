// 금나라 침공기 1부 썸네일 (2026-11-06 사용자: "몽골 vs 금나라 이런식이 낫지않아?"): 칸과 성벽이 맞서는 구도
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../ui";
import { InkDefs } from "../draft/kit";
import { WallG, ZhongduG } from "../draft/M01Ch4";
import { Defs, Horde, Khan, type Line, R, Smoke, Words, Y } from "./Mongol01Thumbs";

const TXT: Record<"en" | "ko", { lines: Line[]; size: number[] }> = {
  en: { lines: [[["MONGOLS ", "#fff"], ["VS", Y]], [["JIN EMPIRE", R]]], size: [116, 124] },
  ko: { lines: [[["몽골 ", "#fff"], ["VS", Y]], [["금나라", R]]], size: [104, 118] },
};

export const JinThumb = ({ lang = "en" }: { lang?: "en" | "ko" }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#2a1c33", overflow: "hidden" }}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <InkDefs />
        <Defs />
        <defs>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2340" />
            <stop offset="0.6" stopColor="#c8552a" />
            <stop offset="1" stopColor="#f2a24a" />
          </linearGradient>
        </defs>
        <rect width={1280} height={720} fill="url(#dusk)" />
        <Smoke x={1060} y={150} r={70} n={5} seed={4} color="#2a1420" />
        <g transform="translate(230 -30) scale(0.72)">
          <ZhongduG />
          <WallG x0={120} x1={1800} top={420} base={720} />
        </g>
        <rect y={490} width={1280} height={230} fill="#3a2410" />
      </svg>
      <Horde rows={[{ y: 500, w: 80, n: 13, x0: 340, x1: 1290, op: 0.95 }, { y: 570, w: 130, n: 8, x0: 400, x1: 1290 }]} />
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <circle cx={260} cy={470} r={290} fill="#ff6a20" opacity={0.3} filter="url(#blur40)" />
        <Khan x={260} y={470} s={1.28} expr="grit" skin="#e49a78" />
      </svg>
      <Words lines={TXT[lang].lines} x={30} y={22} size={TXT[lang].size} />
    </AbsoluteFill>
  );
};
