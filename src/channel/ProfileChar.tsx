// 프로필 사진 시안 (2026-11-02 사용자: "간단하고 상징적으로, 우리가 자주 쓰는 캐릭터 느낌", "몽골만이 아니라 전 세계 세계사·이슈") - 800×800, 유튜브가 동그랗게 자름
//   globe: 지구가 캐릭터(우리 그림체 눈·볼·먹선) - 세계사 채널 그 자체 · duo: 로마 군단병 | 몽골 칸 얼굴 반반(시대가 맞붙음) · trio: 페르시아·로마·몽골 셋이 어깨동무하듯 모임(여러 시대)
import { AbsoluteFill, Img, staticFile } from "remotion";

export type ProfileCharLook = "globe" | "duo" | "trio" | "antique" | "antiqueHelmet" | "globeHelmet" | "globeHelmetMark" | "test";
const INK = "#2b1d14";

// 캐릭터 판(600×720)을 scale배로 키워 판의 (cx, cy)를 화면 (x, y)에
const Face = ({ id, pose, scale, cx = 300, cy, x = 400, y = 400 }: { id: string; pose: string; scale: number; cx?: number; cy: number; x?: number; y?: number }) => {
  const L = (n: string) => <Img src={staticFile(`chars/${id}/${pose}/${n}.svg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
  return (
    <div style={{ position: "absolute", width: 600, height: 720, left: x - cx, top: y - cy, transform: `scale(${scale})`, transformOrigin: `${cx}px ${cy}px` }}>
      {L("body")}
      {L("head")}
      {L("eyes0")}
      {L("mouth0")}
    </div>
  );
};
// 캐릭터마다 얼굴 가운데(판 좌표 y)
const HEAD: Record<string, number> = { roman_legionary: 318, genghis: 312, persian_immortal: 350 };

const Ring = ({ color, width = 30 }: { color: string; width?: number }) => (
  <AbsoluteFill style={{ borderRadius: "50%", boxShadow: `inset 0 0 0 ${width}px ${color}, inset 0 0 0 ${width + 6}px ${INK}` }} />
);
const Paper = ({ from, to }: { from: string; to: string }) => <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${from} 0%, ${to} 100%)` }} />;

// 지구 캐릭터: 바랜 바다 + 대륙(단순화한 아프리카·유라시아 쪽) + 우리 캐릭터 눈(흰 점)·볼·웃는 입, 굵은 먹선
const GlobeChar = ({ helmet }: { helmet?: boolean }) => (
  <svg viewBox="0 0 800 800" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <clipPath id="g"><circle cx="400" cy="415" r="250" /></clipPath>
      <radialGradient id="sea" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#8fc1c0" /><stop offset="1" stopColor="#4d8a8c" /></radialGradient>
    </defs>
    <ellipse cx="400" cy="690" rx="190" ry="26" fill={INK} opacity="0.18" />
    <circle cx="400" cy="415" r="250" fill="url(#sea)" />
    <g clipPath="url(#g)" fill="#c9b06e" stroke={INK} strokeWidth="9" strokeLinejoin="round">
      {/* 대륙은 얼굴(가운데 아래)을 피해 위쪽·양옆에 - 유라시아 띠, 아메리카 왼쪽 끝, 오스트레일리아 오른쪽 아래 */}
      <path d="M 200 250 C 250 190 330 175 400 190 C 470 170 560 180 630 230 C 670 265 640 300 590 292 C 545 305 500 290 455 300 C 420 288 385 300 350 290 C 310 300 265 300 230 290 C 200 280 190 265 200 250 Z" />
      <path d="M 140 330 C 175 320 195 355 190 400 C 186 450 172 500 160 545 C 138 500 125 420 140 330 Z" />
      <path d="M 590 545 C 625 530 670 540 675 570 C 655 598 610 600 585 582 C 575 566 578 552 590 545 Z" />
    </g>
    {/* 경위선 */}
    <g clipPath="url(#g)" fill="none" stroke={INK} strokeWidth="3" opacity="0.25">
      <ellipse cx="400" cy="415" rx="120" ry="250" /><ellipse cx="400" cy="415" rx="250" ry="90" /><line x1="150" y1="415" x2="650" y2="415" />
    </g>
    <circle cx="400" cy="415" r="250" fill="none" stroke={INK} strokeWidth="14" />
    {/* 얼굴 */}
    <g stroke={INK} strokeWidth="10" strokeLinecap="round">
      <circle cx="330" cy="420" r="30" fill={INK} stroke="none" /><circle cx="470" cy="420" r="30" fill={INK} stroke="none" />
      <circle cx="320" cy="408" r="10" fill="#fff" stroke="none" /><circle cx="460" cy="408" r="10" fill="#fff" stroke="none" />
      <ellipse cx="290" cy="478" rx="34" ry="20" fill="#e88a74" stroke="none" opacity="0.75" /><ellipse cx="510" cy="478" rx="34" ry="20" fill="#e88a74" stroke="none" opacity="0.75" />
      <path d="M 360 488 Q 400 525 440 488" fill="none" />
    </g>
    {/* 반지름 250(가운데 400,415)에 맞게 옛 지구본 기준 투구를 키워 옮김 */}
    {helmet && <RomanHelmet transform="translate(400 432) scale(1.1) translate(-400 -380)" />}
  </svg>
);

// 로마 투구(갈레아): 옛 지구본(가운데 400,380 반지름 215) 기준 좌표 - 다른 지구에는 transform으로 맞춤
const RomanHelmet = ({ transform }: { transform?: string }) => (
  <g transform={transform}>
    <g stroke={INK} strokeWidth="9" strokeLinejoin="round">
            <path d="M 268 210 C 300 130 360 105 400 105 C 440 105 500 130 532 210 Z" fill="#b9bec4" />
            <path d="M 290 175 C 330 140 470 140 510 175" fill="none" stroke="#fff" strokeWidth="6" opacity="0.5" />
            <path d="M 300 128 C 320 40 480 40 500 128 C 470 112 330 112 300 128 Z" fill="#c8361f" />
            <path d="M 330 92 L 340 120 M 365 75 L 368 112 M 400 70 L 400 110 M 435 75 L 432 112 M 470 92 L 460 120" stroke="#8e2a1c" strokeWidth="5" fill="none" />
            <rect x="258" y="200" width="284" height="26" rx="10" fill="#e2b85a" />
          </g>
  </g>
);

// 옛 지구본 캐릭터 (4번, 2026-11-02 사용자: "지구본에 얼굴 단 걸로 좀 더 세계사처럼"): 바랜 양피지 바다·갈색 대륙·나침반 방위선(옛 해도 느낌),
// 놋쇠 자오환(기울어진 고리)과 나무 받침대 - 한눈에 "옛 지구본". helmet이면 로마 투구 볏을 씌움(전쟁·전술 채널 톤)
const AntiqueGlobe = ({ helmet }: { helmet?: boolean }) => {
  const C = { cx: 400, cy: 380, r: 215 };
  return (
    <svg viewBox="0 0 800 800" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <clipPath id="ag"><circle cx={C.cx} cy={C.cy} r={C.r} /></clipPath>
        <radialGradient id="old" cx="38%" cy="32%" r="80%"><stop offset="0" stopColor="#f3e2b8" /><stop offset="0.7" stopColor="#d9bd84" /><stop offset="1" stopColor="#b8945a" /></radialGradient>
        <linearGradient id="brass" x1="0" x2="1"><stop offset="0" stopColor="#8a6424" /><stop offset="0.5" stopColor="#e2b85a" /><stop offset="1" stopColor="#8a6424" /></linearGradient>
        <linearGradient id="wood" x1="0" x2="1"><stop offset="0" stopColor="#5a3418" /><stop offset="0.5" stopColor="#8e5a2e" /><stop offset="1" stopColor="#5a3418" /></linearGradient>
      </defs>
      {/* 받침대: 기둥 + 둥근 발 */}
      <path d="M 385 600 L 415 600 L 425 670 L 375 670 Z" fill="url(#wood)" stroke={INK} strokeWidth="9" strokeLinejoin="round" />
      <ellipse cx="400" cy="690" rx="120" ry="28" fill="url(#wood)" stroke={INK} strokeWidth="9" />
      {/* 지구 */}
      <circle cx={C.cx} cy={C.cy} r={C.r} fill="url(#old)" />
      <g clipPath="url(#ag)">
        {/* 방위선(옛 해도의 나침반 선) */}
        <g stroke="#8a5a2a" strokeWidth="2.5" opacity="0.35">
          {Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return <line key={i} x1={560} y1={470} x2={560 + Math.cos(a) * 600} y2={470 + Math.sin(a) * 600} />; })}
        </g>
        <g fill="none" stroke={INK} strokeWidth="3" opacity="0.3">
          <ellipse cx={C.cx} cy={C.cy} rx="100" ry={C.r} /><ellipse cx={C.cx} cy={C.cy} rx={C.r} ry="80" /><line x1={C.cx - C.r} y1={C.cy} x2={C.cx + C.r} y2={C.cy} />
        </g>
        <g fill="#a9783f" stroke={INK} strokeWidth="8" strokeLinejoin="round">
          <path d="M 205 250 C 250 195 330 180 400 195 C 470 178 555 188 615 235 C 645 265 615 292 570 285 C 530 296 490 284 450 293 C 415 283 385 293 350 285 C 310 293 270 293 235 285 C 205 276 195 262 205 250 Z" />
          <path d="M 190 330 C 220 322 236 352 232 392 C 228 435 216 478 206 515 C 186 476 176 405 190 330 Z" />
          <path d="M 560 490 C 592 477 632 486 636 512 C 618 538 578 540 556 524 C 547 510 549 497 560 490 Z" />
        </g>
      </g>
      <circle cx={C.cx} cy={C.cy} r={C.r} fill="none" stroke={INK} strokeWidth="12" />
      {/* 놋쇠 자오환: 살짝 기운 반원 고리 + 위 꼭지 */}
      <g transform={`rotate(-18 ${C.cx} ${C.cy})`}>
        <path d={`M ${C.cx} ${C.cy - C.r - 30} A ${C.r + 30} ${C.r + 30} 0 0 1 ${C.cx} ${C.cy + C.r + 30}`} fill="none" stroke={INK} strokeWidth="30" strokeLinecap="round" />
        <path d={`M ${C.cx} ${C.cy - C.r - 30} A ${C.r + 30} ${C.r + 30} 0 0 1 ${C.cx} ${C.cy + C.r + 30}`} fill="none" stroke="url(#brass)" strokeWidth="18" strokeLinecap="round" />
        <circle cx={C.cx} cy={C.cy - C.r - 30} r="14" fill="#e2b85a" stroke={INK} strokeWidth="7" />
      </g>
      {helmet && <RomanHelmet />}
      {/* 얼굴 */}
      <g stroke={INK} strokeWidth="10" strokeLinecap="round">
        <circle cx="335" cy={C.cy + 20} r="27" fill={INK} stroke="none" /><circle cx="465" cy={C.cy + 20} r="27" fill={INK} stroke="none" />
        <circle cx="326" cy={C.cy + 9} r="9" fill="#fff" stroke="none" /><circle cx="456" cy={C.cy + 9} r="9" fill="#fff" stroke="none" />
        <ellipse cx="298" cy={C.cy + 72} rx="30" ry="17" fill="#e07a62" stroke="none" opacity="0.7" /><ellipse cx="502" cy={C.cy + 72} rx="30" ry="17" fill="#e07a62" stroke="none" opacity="0.7" />
        <path d={`M 365 ${C.cy + 80} Q 400 ${C.cy + 112} 435 ${C.cy + 80}`} fill="none" />
      </g>
    </svg>
  );
};

export const ProfileChar = ({ look = "globe", id = "genghis", pose = "front", scale = 2.05, cy = 325 }: { look?: ProfileCharLook; id?: string; pose?: string; scale?: number; cy?: number }) => {
  if (look === "test")
    return (<AbsoluteFill style={{ overflow: "hidden" }}><Paper from="#fbf2dc" to="#e3cc9c" /><Face id={id} pose={pose} scale={scale} cy={cy} /></AbsoluteFill>);
  // 워터마크(영상 오른쪽 아래, 유튜브가 150×150으로 줄임): 배경·테두리 없이 투구 쓴 지구만
  if (look === "globeHelmetMark") return <AbsoluteFill><GlobeChar helmet /></AbsoluteFill>;
  if (look === "antique" || look === "antiqueHelmet")
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Paper from="#2f4a63" to="#132233" />
        <AntiqueGlobe helmet={look === "antiqueHelmet"} />
        <Ring color="#e2b85a" width={24} />
      </AbsoluteFill>
    );
  if (look === "duo")
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>
          <Paper from="#d9644a" to="#8e2a1c" />
          <Face id="roman_legionary" pose="front" scale={2.3} cy={HEAD.roman_legionary} y={420} />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>
          <Paper from="#4f8f8a" to="#1f4a4a" />
          <Face id="genghis" pose="front" scale={2.3} cy={HEAD.genghis} y={420} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 396, top: 0, width: 8, height: 800, background: INK }} />
        <Ring color="#f2c54b" width={24} />
      </AbsoluteFill>
    );
  if (look === "trio")
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Paper from="#fbf2dc" to="#e0c592" />
        <Face id="persian_immortal" pose="front" scale={1.45} cy={HEAD.persian_immortal} x={205} y={420} />
        <Face id="genghis" pose="front" scale={1.45} cy={HEAD.genghis} x={595} y={420} />
        <Face id="roman_legionary" pose="front" scale={1.5} cy={HEAD.roman_legionary} x={400} y={440} />
        <Ring color="#c8361f" width={26} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper from="#fbf2dc" to="#e3cc9c" />
      <GlobeChar helmet={look === "globeHelmet"} />
      <Ring color="#c8361f" width={26} />
    </AbsoluteFill>
  );
};
