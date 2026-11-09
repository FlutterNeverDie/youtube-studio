// 조공 상자 (회상 장면)
import React from "react";
import { INK } from "./kit";
export const Chest = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -80 44 L -80 -14 L 80 -14 L 80 44 Z" fill="#8a4a2e" stroke={INK} strokeWidth={5} />
    <path d="M -86 -14 C -80 -50 80 -50 86 -14 Z" fill="#a85a36" stroke={INK} strokeWidth={5} />
    <path d="M -46 -36 L -46 44 M 46 -36 L 46 44" stroke="#c9a24a" strokeWidth={9} />
    <rect x={-14} y={-20} width={28} height={26} fill="#e0b64a" stroke={INK} strokeWidth={4} />
  </g>
);
