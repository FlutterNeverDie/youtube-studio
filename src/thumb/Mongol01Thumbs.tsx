// 몽골 1편 썸네일 시안 3 (2026-10-26): "자극적으로" - 큰 얼굴 + 과장된 감정 + 빨강·검정·불 대비 + 글자 0~3단어
// 영상 그림체(둥근 얼굴·먹선·종이결)는 그대로, 표정만 썸네일 전용으로 최대 강도 (고함·공포·사악한 비웃음·이 악물기)
// 고어 금지: 해골·불·연기·무너지는 성·도망치는 사람까지만
// 찍기: node scripts/m01-thumbs3.mjs (전용 진입점 src/thumb/index.ts - Root.tsx 안 건드림)
import { EA_EMPIRE, EA_LAND } from "./eurasiaMap";
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT, useFonts } from "../ui";

const INK = "#1c120c";
export type Concept = "A" | "B" | "C" | "D";
export type TLang = "none" | "ko" | "en" | "es" | "pt" | "hi" | "id";
export type M01ThumbProps = { concept: Concept; lang: TLang };

// 결정적 난수 (같은 그림이 매번 같게)
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- 공통 정의
export const Defs = () => (
  <defs>
    <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
    </filter>
    <filter id="blur8"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="blur20"><feGaussianBlur stdDeviation="20" /></filter>
    <filter id="blur40"><feGaussianBlur stdDeviation="40" /></filter>
    <pattern id="fur" width="14" height="10" patternUnits="userSpaceOnUse">
      <rect width="14" height="10" fill="#7a5638" />
      <path d="M2 9 q2 -6 4 0 M8 7 q2 -6 4 0" stroke="#4e3522" strokeWidth="2" fill="none" />
    </pattern>
    <pattern id="furw" width="14" height="10" patternUnits="userSpaceOnUse">
      <rect width="14" height="10" fill="#9a7a58" />
      <path d="M2 9 q2 -6 4 0 M8 7 q2 -6 4 0" stroke="#6e5238" strokeWidth="2" fill="none" />
    </pattern>
    <linearGradient id="underlit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3a0000" stopOpacity={0.45} />
      <stop offset="0.32" stopColor="#3a0000" stopOpacity={0.12} />
      <stop offset="0.55" stopColor="#ff4a12" stopOpacity={0} />
      <stop offset="1" stopColor="#ff5a12" stopOpacity={0.3} />
    </linearGradient>
    <pattern id="brick" width="40" height="20" patternUnits="userSpaceOnUse">
      <rect width="40" height="20" fill="#9a8a72" />
      <path d="M0 0 H40 M0 10 H40 M10 0 V10 M30 10 V20" stroke="#5e5040" strokeWidth="2" />
    </pattern>
  </defs>
);

// ---------------------------------------------------------------- 칭기즈칸 얼굴 (썸네일 전용 표정)
// 원래 판(600×900) 좌표를 그대로 쓴다: 얼굴 x 182~418, 눈 y 418, 모자 위 250
type KhanExpr = "roar" | "smirk" | "grit";
const KhanHead = ({ expr, skin = "#dcae84" }: { expr: KhanExpr; skin?: string }) => {
  const jaw = expr === "roar" ? 572 : 520; // 고함은 턱이 내려간다
  const face = `M 182 400 C 182 300 418 300 418 400 C 418 ${jaw - 50} 370 ${jaw} 300 ${jaw} C 230 ${jaw} 182 ${jaw - 50} 182 400 Z`;
  return (
    <g filter="url(#ink)" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
      {/* 귀덮개 땋은 머리 */}
      <path d="M 190 404 C 138 416 128 520 170 540 C 200 520 188 460 190 440 Z" fill="#3a2a1e" />
      <path d="M 410 404 C 462 416 472 520 430 540 C 400 520 412 460 410 440 Z" fill="#3a2a1e" />
      <ellipse cx="186" cy="424" rx="17" ry="24" fill={skin} />
      <ellipse cx="414" cy="424" rx="17" ry="24" fill={skin} />
      <path d={face} fill={skin} />
      {/* 그늘 */}
      <path d={`M 196 420 C 204 ${jaw - 40} 240 ${jaw - 8} 284 ${jaw - 2} C 236 ${jaw - 2} 194 ${jaw - 36} 192 420 Z`} fill="#000" opacity={0.14} stroke="none" />
      {/* 붉은 볼 (화가 나면 더 붉게) */}
      <ellipse cx="226" cy="458" rx="24" ry="13" fill="#d8503a" opacity={expr === "smirk" ? 0.35 : 0.6} stroke="none" />
      <ellipse cx="374" cy="458" rx="24" ry="13" fill="#d8503a" opacity={expr === "smirk" ? 0.35 : 0.6} stroke="none" />
      {expr === "smirk" && <path d={face} fill="url(#underlit)" stroke="none" />}
      {/* 모자 */}
      <path d="M 198 352 C 192 244 408 244 402 352 Z" fill="#f2ead8" />
      <path d="M 300 258 C 290 290 290 330 296 352 M 250 274 C 244 300 244 330 248 350 M 350 274 C 356 300 356 330 352 350" fill="none" stroke="#c8bba0" strokeWidth={4} />
      <path d="M 172 352 C 172 324 428 324 428 352 C 428 382 172 382 172 352 Z" fill="url(#furw)" />
      <circle cx="300" cy="248" r="12" fill="#c9a24a" />
      {expr === "smirk" ? <SmirkFace /> : <RageFace expr={expr} jaw={jaw} />}
    </g>
  );
};

// 분노 눈: 흰자위 + 작은 눈동자 + 핏발, 굵은 V자 눈썹 (고함·이 악물기 공통)
const RageEyes = () => (
  <g>
    {/* 흰자: 눈썹에 눌려 위가 잘린 아몬드 */}
    <path d="M 220 416 C 232 398 262 398 284 414 C 270 436 236 438 220 416 Z" fill="#fffaf0" strokeWidth={5} />
    <path d="M 380 416 C 368 398 338 398 316 414 C 330 436 364 438 380 416 Z" fill="#fffaf0" strokeWidth={5} />
    {/* 핏발 */}
    <path d="M 224 418 l 12 -3 M 226 424 l 10 1 M 282 416 l -10 -2 M 376 418 l -12 -3 M 374 424 l -10 1 M 318 416 l 10 -2" stroke="#d23a2a" strokeWidth={2.5} />
    {/* 작은 눈동자 = 노려봄 */}
    <circle cx="258" cy="418" r="9" fill={INK} stroke="none" />
    <circle cx="342" cy="418" r="9" fill={INK} stroke="none" />
    <circle cx="261" cy="415" r="2.6" fill="#fff" stroke="none" />
    <circle cx="345" cy="415" r="2.6" fill="#fff" stroke="none" />
    {/* V자 눈썹 */}
    <path d="M 198 368 L 292 404 L 286 422 L 196 390 Z" fill={INK} strokeWidth={4} />
    <path d="M 402 368 L 308 404 L 314 422 L 404 390 Z" fill={INK} strokeWidth={4} />
    {/* 미간 주름 */}
    <path d="M 293 382 l 3 18 M 307 382 l -3 18" strokeWidth={4} fill="none" />
    {/* 관자놀이 핏줄 (만화 분노 표시) */}
    <g transform="translate(386 318) rotate(12)" stroke="#d61f1f" strokeWidth={7} fill="none">
      <path d="M -18 -6 C -6 -6 -6 -18 -6 -18 M 18 -6 C 6 -6 6 -18 6 -18 M -18 6 C -6 6 -6 18 -6 18 M 18 6 C 6 6 6 18 6 18" />
    </g>
  </g>
);

const RageFace = ({ expr, jaw }: { expr: "roar" | "grit"; jaw: number }) => (
  <g>
    <RageEyes />
    {/* 코: 찡그려 콧망울이 벌어짐 */}
    <path d="M 296 426 C 284 450 288 462 300 462 C 312 462 318 456 312 448" fill="none" strokeWidth={5} />
    <path d="M 270 448 q -8 10 -2 20 M 330 448 q 8 10 2 20" fill="none" strokeWidth={3.5} opacity={0.7} />
    {expr === "roar" ? (
      <g>
        {/* 쩍 벌린 입 */}
        <path d={`M 234 478 C 254 462 346 462 366 478 C 376 ${jaw - 50} 340 ${jaw - 18} 300 ${jaw - 18} C 260 ${jaw - 18} 224 ${jaw - 50} 234 478 Z`} fill="#4a0d0d" strokeWidth={6} />
        {/* 혀 */}
        <path d={`M 262 ${jaw - 30} C 270 ${jaw - 62} 330 ${jaw - 62} 338 ${jaw - 30} C 320 ${jaw - 20} 280 ${jaw - 20} 262 ${jaw - 30} Z`} fill="#d9564a" stroke="none" />
        {/* 윗니 + 송곳니 */}
        <path d="M 244 478 C 266 468 334 468 356 478 L 352 492 L 340 490 L 334 506 L 326 490 C 310 492 290 492 274 490 L 266 506 L 260 490 L 248 492 Z" fill="#fffaf0" strokeWidth={3} />
        {/* 아랫니 */}
        <path d={`M 262 ${jaw - 26} L 270 ${jaw - 38} L 278 ${jaw - 24} M 322 ${jaw - 24} L 330 ${jaw - 38} L 338 ${jaw - 26}`} fill="#fffaf0" strokeWidth={3} />
        {/* 팔자로 벌어진 콧수염 */}
        <path d="M 300 462 C 270 452 232 460 206 494 C 232 486 258 474 300 474 C 342 474 368 486 394 494 C 368 460 330 452 300 462 Z" fill="#3a2a1e" strokeWidth={5} />
        {/* 턱수염 */}
        <path d={`M 276 ${jaw - 4} C 280 ${jaw + 30} 298 ${jaw + 44} 310 ${jaw + 40} C 318 ${jaw + 24} 322 ${jaw + 8} 324 ${jaw - 4} Z`} fill="#3a2a1e" strokeWidth={5} />
        {/* 고함 파동 (얼굴 밖) */}
        <path d="M 470 420 C 492 460 492 520 466 560 M 506 400 C 534 456 534 530 500 584 M 130 420 C 108 460 108 520 134 560 M 94 400 C 66 456 66 530 100 584" fill="none" stroke="#fff" strokeWidth={9} />
      </g>
    ) : (
      <g>
        {/* 이 악물기: 입술 젖혀 이가 다 보임 */}
        <path d="M 236 480 C 260 470 340 470 364 480 C 360 500 350 512 300 512 C 250 512 240 500 236 480 Z" fill="#fffaf0" strokeWidth={6} />
        <path d="M 238 494 C 270 498 330 498 362 494 M 262 476 V 508 M 282 474 V 512 M 300 474 V 512 M 318 474 V 512 M 338 476 V 508" fill="none" strokeWidth={3} />
        <path d="M 300 462 C 270 452 232 460 206 494 C 232 486 258 476 300 474 C 342 476 368 486 394 494 C 368 460 330 452 300 462 Z" fill="#3a2a1e" strokeWidth={5} />
        <path d={`M 280 ${jaw - 4} C 284 ${jaw + 26} 298 ${jaw + 40} 310 ${jaw + 36} C 316 ${jaw + 22} 320 ${jaw + 8} 322 ${jaw - 4} Z`} fill="#3a2a1e" strokeWidth={5} />
      </g>
    )}
  </g>
);

// 사악한 비웃음: 반쯤 감은 눈 + 한쪽 눈썹 치켜듦 + 이 드러낸 비대칭 웃음
const SmirkFace = () => (
  <g>
    {/* 눈: 눈꺼풀이 반쯤 덮음, 눈동자는 아래(시청자)를 내려다봄 */}
    <path d="M 222 424 C 238 412 268 412 286 420 C 268 430 238 432 222 424 Z" fill="#fffaf0" strokeWidth={5} />
    <path d="M 314 418 C 332 402 366 404 384 418 C 366 430 330 430 314 418 Z" fill="#fffaf0" strokeWidth={5} />
    <circle cx="262" cy="423" r="7.5" fill={INK} stroke="none" />
    <circle cx="352" cy="419" r="8" fill={INK} stroke="none" />
    <circle cx="264" cy="421" r="2.2" fill="#fff" stroke="none" />
    <circle cx="354" cy="417" r="2.4" fill="#fff" stroke="none" />
    {/* 무거운 윗눈꺼풀 + 웃느라 올라온 아랫눈꺼풀 */}
    <path d="M 214 424 C 234 404 272 406 292 420" fill="none" strokeWidth={12} />
    <path d="M 308 418 C 328 396 370 398 390 416" fill="none" strokeWidth={12} />
    <path d="M 226 432 C 244 438 266 438 282 430 M 318 426 C 336 434 360 434 378 426" fill="none" strokeWidth={4} />
    {/* 눈썹: 왼쪽은 가운데로 눌린 V, 오른쪽은 치켜 올라가 비웃음 */}
    <path d="M 198 372 L 294 404 L 288 418 L 196 390 Z" fill={INK} strokeWidth={4} />
    <path d="M 306 400 C 330 362 376 344 410 356 L 406 372 C 376 364 340 380 314 414 Z" fill={INK} strokeWidth={4} />
    {/* 광대 주름 (웃느라 볼이 올라감) */}
    <path d="M 214 446 q 18 10 34 4 M 352 446 q 18 6 36 -6" fill="none" strokeWidth={4} opacity={0.7} />
    {/* 코 */}
    <path d="M 296 426 C 284 450 288 462 300 462 C 312 462 318 456 312 448" fill="none" strokeWidth={5} />
    {/* 비대칭 웃음: 오른쪽 입꼬리가 크게 올라감 */}
    <path d="M 226 480 C 270 508 334 500 392 452 C 380 510 344 538 296 538 C 258 538 234 512 226 480 Z" fill="#4a0d0d" strokeWidth={6} />
    <path d="M 232 484 C 272 508 334 500 386 458 L 380 480 C 342 512 286 520 240 500 Z" fill="#fffaf0" strokeWidth={3} />
    <path d="M 258 496 v 14 M 282 502 v 15 M 306 502 v 15 M 330 496 v 15 M 352 486 v 14 M 370 472 v 12" stroke={INK} strokeWidth={3} />
    <path d="M 392 452 q 12 -4 16 -18" fill="none" strokeWidth={5} />
    {/* 끝이 말려 올라간 콧수염 */}
    <path d="M 300 464 C 272 456 236 470 214 456 C 222 478 260 482 300 476 C 340 482 380 474 404 444 C 378 458 330 454 300 464 Z" fill="#3a2a1e" strokeWidth={5} />
    <path d="M 284 536 C 288 566 300 576 312 572 C 318 560 320 546 322 536 Z" fill="#3a2a1e" strokeWidth={5} />
  </g>
);

// 칸의 상반신 (붉은 겉옷·털 깃·금띠)
const KhanBody = () => (
  <g filter="url(#ink)" stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <path d="M 60 1000 C 70 700 170 590 300 586 C 430 590 530 700 540 1000 Z" fill="#a33a2a" />
    <path d="M 70 1000 C 80 760 120 680 170 640 L 200 1000 Z" fill="#7c2e23" stroke="none" />
    <path d="M 300 600 C 280 680 230 740 150 790" fill="none" stroke="#c9a24a" strokeWidth={22} />
    <path d="M 150 610 C 220 570 380 570 450 610 C 420 660 180 660 150 610 Z" fill="url(#fur)" />
    <path d="M 272 556 L 272 600 L 328 600 L 328 556 Z" fill="#9c7656" />
  </g>
);

// 칸 전체 (상반신 + 머리), 기준점 = 얼굴 가운데 (300, 430)
export const Khan = ({ x, y, s, expr, skin, flip }: { x: number; y: number; s: number; expr: KhanExpr; skin?: string; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(-300 -430)`}>
    <KhanBody />
    <KhanHead expr={expr} skin={skin} />
  </g>
);

// ---------------------------------------------------------------- 금 황제 (공포의 비명, 두 손으로 볼을 감쌈)
const EmperorScream = ({ x, y, s, look = 1 }: { x: number; y: number; s: number; look?: number }) => {
  const SKIN = "#efd0ac";
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-300 -430)`}>
      <g filter="url(#ink)" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
        {/* 노란 용포 */}
        <path d="M 40 1000 C 50 700 170 590 300 586 C 430 590 550 700 560 1000 Z" fill="#d9a93a" />
        <path d="M 200 600 C 240 640 360 640 400 600" fill="none" stroke="#a8332a" strokeWidth={16} />
        <circle cx="300" cy="720" r="44" fill="#e0b64a" />
        <path d="M 280 706 C 296 690 324 704 314 726 C 304 744 284 736 294 722" stroke="#a8332a" strokeWidth={6} fill="none" />
        {/* 얼굴 (길게 늘어남 - 비명) */}
        <ellipse cx="186" cy="430" rx="16" ry="24" fill={SKIN} />
        <ellipse cx="414" cy="430" rx="16" ry="24" fill={SKIN} />
        <path d="M 184 410 C 180 300 420 300 416 410 C 414 500 372 588 300 588 C 228 588 186 500 184 410 Z" fill={SKIN} />
        {/* 질린 얼굴: 이마에 푸른 그늘 + 세로 줄 */}
        <path d="M 196 380 C 196 320 404 320 404 380 C 404 400 196 400 196 380 Z" fill="#6a78b8" opacity={0.45} stroke="none" />
        <path d="M 230 340 v 46 M 254 334 v 54 M 278 330 v 58 M 302 330 v 58 M 326 330 v 58 M 350 334 v 54 M 374 340 v 46" stroke="#3c467e" strokeWidth={4} opacity={0.6} />
        {/* 금나라 황제 관 */}
        <path d="M 168 352 C 100 344 66 300 56 260 L 78 254 C 92 292 120 322 172 332 Z M 432 352 C 500 344 534 300 544 260 L 522 254 C 508 292 480 322 428 332 Z" fill="#26201c" strokeWidth={5} />
        <path d="M 176 360 C 166 200 434 200 424 360 C 370 340 230 340 176 360 Z" fill="#26201c" />
        <path d="M 180 344 C 230 328 370 328 420 344" stroke="#e0b64a" strokeWidth={14} fill="none" />
        <path d="M 270 300 L 300 238 L 330 300 Z" fill="#e0b64a" strokeWidth={5} />
        <circle cx="300" cy="284" r="13" fill="#a8332a" strokeWidth={4} />
        {/* 눈썹: 가운데가 치솟은 걱정 눈썹 */}
        <path d="M 206 392 C 226 368 262 362 282 360" fill="none" strokeWidth={12} />
        <path d="M 394 392 C 374 368 338 362 318 360" fill="none" strokeWidth={12} />
        {/* 흰자위 가득한 눈 + 바늘 같은 눈동자 */}
        <circle cx="250" cy="430" r="36" fill="#fff" strokeWidth={6} />
        <circle cx="350" cy="430" r="36" fill="#fff" strokeWidth={6} />
        <circle cx={250 + 14 * look} cy="430" r="7" fill={INK} stroke="none" />
        <circle cx={350 + 14 * look} cy="430" r="7" fill={INK} stroke="none" />
        {/* 다크서클 */}
        <path d="M 220 474 q 30 14 60 0 M 320 474 q 30 14 60 0" fill="none" strokeWidth={4} opacity={0.6} />
        {/* 코 */}
        <path d="M 298 450 C 290 470 294 480 304 480" fill="none" strokeWidth={5} />
        {/* 비명 입: 세로로 긴 타원, 떨리는 선 */}
        <path d="M 300 494 C 336 494 346 530 342 556 C 338 578 322 586 300 586 C 278 586 262 578 258 556 C 254 530 264 494 300 494 Z" fill="#4a0d0d" strokeWidth={6} />
        <path d="M 270 508 C 284 498 316 498 330 508 L 326 518 C 312 512 288 512 274 518 Z" fill="#fffaf0" strokeWidth={3} />
        <path d="M 278 572 C 286 556 314 556 322 572 C 312 582 288 582 278 572 Z" fill="#d9564a" stroke="none" />
        {/* 가는 콧수염·턱수염 */}
        <path d="M 290 488 C 270 486 252 500 240 520 M 310 488 C 330 486 348 500 360 520" fill="none" strokeWidth={5} />
        <path d="M 300 590 C 296 620 302 650 294 676" fill="none" strokeWidth={5} />
        {/* 두 손으로 볼을 감쌈 (절규) */}
        <path d="M 150 640 C 130 560 150 470 196 450 C 226 446 236 470 222 500 C 210 530 210 570 220 610 C 210 640 180 660 150 640 Z" fill={SKIN} />
        <path d="M 200 470 q -10 30 -8 60 M 214 486 q -6 26 -4 52" fill="none" strokeWidth={3.5} opacity={0.6} />
        <path d="M 450 640 C 470 560 450 470 404 450 C 374 446 364 470 378 500 C 390 530 390 570 380 610 C 390 640 420 660 450 640 Z" fill={SKIN} />
        <path d="M 400 470 q 10 30 8 60 M 386 486 q 6 26 4 52" fill="none" strokeWidth={3.5} opacity={0.6} />
        {/* 소매 */}
        <path d="M 90 1000 C 80 800 110 680 160 630 C 190 640 220 650 230 700 C 200 780 190 880 200 1000 Z" fill="#d9a93a" />
        <path d="M 510 1000 C 520 800 490 680 440 630 C 410 640 380 650 370 700 C 400 780 410 880 400 1000 Z" fill="#d9a93a" />
        <path d="M 160 630 C 180 650 210 660 230 700 M 440 630 C 420 650 390 660 370 700" fill="none" stroke="#a8332a" strokeWidth={12} />
      </g>
      {/* 땀방울 */}
      {[[150, 330, 1.3], [128, 410, 1], [460, 320, 1.4], [478, 400, 1.1], [420, 270, 0.9], [176, 268, 0.9]].map(([dx, dy, k], i) => (
        <path key={i} transform={`translate(${dx} ${dy}) scale(${k})`} d="M 0 -26 C 10 -8 16 2 16 10 C 16 20 8 26 0 26 C -8 26 -16 20 -16 10 C -16 2 -10 -8 0 -26 Z" fill="#bfe6ff" stroke={INK} strokeWidth={4} />
      ))}
      {/* 떨림 선 */}
      <path d="M 120 250 l -26 -14 M 110 290 l -30 -4 M 480 250 l 26 -14 M 490 290 l 30 -4" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- 소품
const flame = (x: number, y: number, w: number, h: number, lean = 0) =>
  `M ${x - w / 2} ${y} C ${x - w / 2} ${y - h * 0.45} ${x - w * 0.1 + lean * 0.4} ${y - h * 0.55} ${x + lean} ${y - h} C ${x + w * 0.1 + lean * 0.5} ${y - h * 0.6} ${x + w / 2} ${y - h * 0.45} ${x + w / 2} ${y} Z`;

export const Fire = ({ x0, x1, y, h, seed = 1, n = 14 }: { x0: number; x1: number; y: number; h: number; seed?: number; n?: number }) => {
  const items = Array.from({ length: n }, (_, i) => {
    const x = x0 + ((x1 - x0) * (i + rnd(seed + i) * 0.6)) / n;
    const hh = h * (0.55 + rnd(seed + i * 3) * 0.6);
    const w = ((x1 - x0) / n) * (1.6 + rnd(seed + i * 7));
    const lean = (rnd(seed + i * 11) - 0.5) * w * 0.8;
    return { x, hh, w, lean };
  });
  return (
    <g>
      {items.map((t, i) => <path key={`a${i}`} d={flame(t.x, y, t.w, t.hh, t.lean)} fill="#e8321a" />)}
      {items.map((t, i) => <path key={`b${i}`} d={flame(t.x, y, t.w * 0.7, t.hh * 0.75, t.lean * 0.8)} fill="#ff8a1c" />)}
      {items.map((t, i) => <path key={`c${i}`} d={flame(t.x, y, t.w * 0.4, t.hh * 0.48, t.lean * 0.6)} fill="#ffe25a" />)}
    </g>
  );
};

export const Smoke = ({ x, y, r, n = 9, seed = 1, color = "#120707" }: { x: number; y: number; r: number; n?: number; seed?: number; color?: string }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={x + (rnd(seed + i) - 0.5) * r * 3} cy={y - i * r * 0.55} r={r * (0.7 + rnd(seed + i * 5) * 0.7) * (1 + i * 0.08)} fill={color} />
    ))}
  </g>
);

export const Embers = ({ n = 60, seed = 3, x0 = 0, x1 = 1280, y0 = 0, y1 = 720 }: { n?: number; seed?: number; x0?: number; x1?: number; y0?: number; y1?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={x0 + rnd(seed + i) * (x1 - x0)} cy={y0 + rnd(seed + i * 13) * (y1 - y0)} r={1.5 + rnd(seed + i * 17) * 4} fill={rnd(seed + i * 19) > 0.5 ? "#ffd25a" : "#ff7a2a"} />
    ))}
  </g>
);

// 중국 성 실루엣 (성벽 + 2층 문루)
const CitySilhouette = ({ y, fill = "#120606" }: { y: number; fill?: string }) => {
  const roof = (cx: number, by: number, w: number) => `M ${cx - w / 2 - 30} ${by} C ${cx - w / 2} ${by - 6} ${cx - w / 2 + 10} ${by - 30} ${cx} ${by - 44} C ${cx + w / 2 - 10} ${by - 30} ${cx + w / 2} ${by - 6} ${cx + w / 2 + 30} ${by} Z`;
  return (
    <g fill={fill}>
      {/* 성벽 + 여장 */}
      <rect x={-20} y={y} width={900} height={400} />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-10 + i * 30} y={y - 16} width={18} height={18} />)}
      {/* 문루 */}
      <rect x={250} y={y - 120} width={200} height={130} />
      <path d={roof(350, y - 110, 230)} />
      <rect x={280} y={y - 190} width={140} height={80} />
      <path d={roof(350, y - 182, 170)} />
      {/* 무너진 탑 */}
      <path d={`M 600 ${y} L 610 ${y - 140} L 640 ${y - 120} L 660 ${y - 170} L 700 ${y - 110} L 712 ${y} Z`} />
      <rect x={60} y={y - 90} width={110} height={100} />
      <path d={roof(115, y - 84, 120)} />
    </g>
  );
};

// 해골 (고어 없이, 둥글둥글한 만화 해골)
const Skull = ({ x, y, s = 1, r = 0, tone = "#efe6d2" }: { x: number; y: number; s?: number; r?: number; tone?: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
    <path d="M -24 4 C -28 -26 28 -26 24 4 C 24 14 18 18 14 20 L 14 30 L -14 30 L -14 20 C -18 18 -24 14 -24 4 Z" fill={tone} />
    <ellipse cx={-10} cy={2} rx={7.5} ry={8.5} fill={INK} stroke="none" />
    <ellipse cx={10} cy={2} rx={7.5} ry={8.5} fill={INK} stroke="none" />
    <path d="M 0 10 L -4 18 L 4 18 Z" fill={INK} stroke="none" />
    <path d="M -8 22 v 8 M 0 22 v 8 M 8 22 v 8" strokeWidth={2.5} />
  </g>
);

const SkullPile = ({ cx, base, w, h, seed = 1, s = 1 }: { cx: number; base: number; w: number; h: number; seed?: number; s?: number }) => {
  const out: React.ReactNode[] = [];
  const step = 34 * s;
  let k = 0;
  for (let row = 0; row * step * 0.8 < h; row++) {
    const yy = base - row * step * 0.8;
    const half = (w / 2) * (1 - (row * step * 0.8) / h);
    for (let xx = cx - half; xx <= cx + half; xx += step * 1.05) {
      k++;
      out.push(<Skull key={k} x={xx + (rnd(seed + k) - 0.5) * 12} y={yy + (rnd(seed + k * 3) - 0.5) * 8} s={s * (0.85 + rnd(seed + k * 5) * 0.3)} r={(rnd(seed + k * 7) - 0.5) * 50} tone={rnd(seed + k * 9) > 0.7 ? "#d9cdb4" : "#efe6d2"} />);
    }
  }
  return <g>{out}</g>;
};

// 말 탄 몽골 기병 실루엣 (영상 그림 riders/mongol을 검게)
export const Horde = ({ rows }: { rows: { y: number; w: number; n: number; x0: number; x1: number; op?: number }[] }) => (
  <>
    {rows.map((r, ri) =>
      Array.from({ length: r.n }, (_, i) => {
        const x = r.x0 + ((r.x1 - r.x0) * (i + rnd(ri * 100 + i) * 0.7)) / r.n;
        const yy = r.y + (rnd(ri * 50 + i * 3) - 0.5) * r.w * 0.12;
        return (
          <Img
            key={`${ri}-${i}`}
            src={staticFile(`riders/mongol/run${(i + ri) % 4}.svg`)}
            style={{ position: "absolute", left: x, top: yy, width: r.w, transform: "scaleX(-1)", filter: "brightness(0)", opacity: r.op ?? 1 }}
          />
        );
      }),
    )}
  </>
);

// ---------------------------------------------------------------- 글자 (굵은 흰 글자 + 검은 테두리, 강조는 노랑/빨강)
type Seg = [string, string?]; // [글자, 색]
export type Line = Seg[];
export const Words = ({ lines, x, y, size, align = "left", rot = 0 }: { lines: Line[]; x: number; y: number; size: number[]; align?: "left" | "right" | "center"; rot?: number }) => (
  <div style={{ position: "absolute", left: align === "right" ? undefined : x, right: align === "left" ? undefined : x, top: y, textAlign: align, transform: `rotate(${rot}deg)`, transformOrigin: "left top" }}>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size[i] ?? size[0], lineHeight: 1.02, whiteSpace: "nowrap", letterSpacing: -2, WebkitTextStroke: `${Math.round((size[i] ?? size[0]) * 0.13)}px #000`, paintOrder: "stroke fill", filter: "drop-shadow(0 6px 0 #000) drop-shadow(0 10px 18px rgba(0,0,0,0.7))" }}>
        {l.map(([t, c], j) => <span key={j} style={{ color: c ?? "#fff" }}>{t}</span>)}
      </div>
    ))}
  </div>
);

// 한국식 말풍선
export const Bubble = ({ x, y, w, h, tail, text, size, color = "#111" }: { x: number; y: number; w: number; h: number; tail: [number, number]; text: Line; size: number; color?: string }) => (
  <>
    <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
      <g stroke="#000" strokeWidth={8} strokeLinejoin="round">
        <path d={`M ${x + w * 0.3} ${y + h - 6} L ${tail[0]} ${tail[1]} L ${x + w * 0.5} ${y + h - 10} Z`} fill="#fff" />
        <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#fff" />
        <path d={`M ${x + w * 0.3 + 6} ${y + h - 8} L ${x + w * 0.5 - 6} ${y + h - 10}`} stroke="#fff" strokeWidth={12} />
      </g>
    </svg>
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: size, color, letterSpacing: -1.5, whiteSpace: "nowrap" }}>
      <span style={{ whiteSpace: "pre" }}>{text.map(([t, c], j) => <span key={j} style={{ color: c ?? color }}>{t}</span>)}</span>
    </div>
  </>
);

export const Y = "#ffd21f"; // 강조 노랑
export const R = "#ff2b1c"; // 강조 빨강

// ---------------------------------------------------------------- A. 고함치는 칸 + 불타는 중도
const ConceptA = ({ lang }: { lang: TLang }) => {
  const T: Record<string, { lines: Line[]; size: number[] }> = {
    ko: { lines: [[["다", "#fff"]], [["불태워라", Y]]], size: [120, 150] },
    en: { lines: [[["BURN", "#fff"]], [["IT ALL", Y]]], size: [150, 150] },
    es: { lines: [[["¡QUÉMENLO", "#fff"]], [["TODO!", Y]]], size: [104, 150] },
    pt: { lines: [[["QUEIMEM", "#fff"]], [["TUDO!", Y]]], size: [124, 150] },
    hi: { lines: [[["सब कुछ", "#fff"]], [["जला दो!", Y]]], size: [120, 140] },
    id: { lines: [[["BAKAR", "#fff"]], [["SEMUANYA!", Y]]], size: [140, 112] },
  };
  return (
    <AbsoluteFill style={{ background: "#120404", overflow: "hidden" }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
        <Defs />
        <linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140303" />
          <stop offset="1" stopColor="#3a0805" />
        </linearGradient>
        <rect width={1280} height={720} fill="url(#skyA)" />
        {/* 배경 = 유라시아 지도 + 몽골 제국 최대 판도가 불처럼 (2026-10-26 사용자: "배경에 지도 - 몽골 컨텐츠인지 헷갈려") */}
        <path d={EA_LAND} fill="#8c6b45" stroke="#1a0a05" strokeWidth={2.5} />
        <path d={EA_EMPIRE} fill="#ff4a10" opacity={0.7} filter="url(#blur20)" />
        <path d={EA_EMPIRE} fill="url(#empA)" stroke="#ffd25a" strokeWidth={4} strokeLinejoin="round" />
        <linearGradient id="empA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff5a1a" />
          <stop offset="0.6" stopColor="#d81e0a" />
          <stop offset="1" stopColor="#a8160a" />
        </linearGradient>
        <Embers n={70} seed={5} x0={0} x1={760} />
        <Fire x0={-40} x1={760} y={760} h={190} seed={8} n={18} />
        {/* 칸 뒤 빨간 후광 */}
        <circle cx={930} cy={380} r={360} fill="#ff2a12" opacity={0.45} filter="url(#blur40)" />
        <Khan x={930} y={372} s={1.78} expr="roar" skin="#e49a78" />
        {/* 위쪽 그늘(시선 모으기) */}
        <rect width={1280} height={720} fill="url(#vigA)" />
        <radialGradient id="vigA" cx="0.6" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.6} />
        </radialGradient>
      </svg>
      {lang !== "none" && <Words lines={T[lang].lines} x={40} y={36} size={T[lang].size} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- B. 공포에 질린 금 황제 + 지평선을 덮은 기병 떼
const ConceptB = ({ lang }: { lang: TLang }) => {
  const T: Record<string, { text: Line; size: number; w: number }> = {
    ko: { text: [["막을 수가 ", "#111"], ["없어!!", "#e0180c"]], size: 66, w: 520 },
    en: { text: [["WE'RE ", "#111"], ["DOOMED!!", "#e0180c"]], size: 60, w: 600 },
    es: { text: [["¡ESTAMOS ", "#111"], ["PERDIDOS!", "#e0180c"]], size: 54, w: 640 },
  };
  return (
    <AbsoluteFill style={{ background: "#2a0a04", overflow: "hidden" }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
        <Defs />
        <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0606" />
          <stop offset="0.3" stopColor="#a8200c" />
          <stop offset="0.6" stopColor="#ff9a2a" />
          <stop offset="0.74" stopColor="#ffd56a" />
          <stop offset="0.75" stopColor="#c86a2a" />
          <stop offset="1" stopColor="#7a3010" />
        </linearGradient>
        <rect width={1280} height={720} fill="url(#skyB)" />
        {/* 먼지 구름 */}
        <g filter="url(#blur20)" opacity={0.85}>
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={420 + i * 70} cy={560 - rnd(i) * 30} r={50 + rnd(i * 3) * 30} fill="#ffcf7a" opacity={0.6} />)}
        </g>
        {/* 지평선 깃대(창·깃발) */}
        {Array.from({ length: 70 }, (_, i) => {
          const x = 440 + i * 12.5 + rnd(i) * 6;
          const h = 60 + rnd(i * 2) * 50;
          return <path key={i} d={`M ${x} 490 L ${x + 6} ${490 - h}`} stroke="#000" strokeWidth={3} />;
        })}
      </svg>
      {/* 기병 떼: 뒤(작게) → 앞(크게) */}
      <Horde
        rows={[
          { y: 432, w: 60, n: 34, x0: 380, x1: 1290 },
          { y: 450, w: 85, n: 24, x0: 400, x1: 1290 },
          { y: 478, w: 120, n: 16, x0: 430, x1: 1300 },
          { y: 520, w: 175, n: 10, x0: 470, x1: 1300 },
          { y: 580, w: 250, n: 6, x0: 520, x1: 1300 },
        ]}
      />
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
        <Defs />
        <radialGradient id="vigB" cx="0.35" cy="0.5" r="0.8">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </radialGradient>
        <circle cx={300} cy={420} r={330} fill="#ffe08a" opacity={0.35} filter="url(#blur40)" />
        <EmperorScream x={300} y={372} s={1.5} look={1} />
        <rect width={1280} height={720} fill="url(#vigB)" />
      </svg>
      {lang !== "none" && <Bubble x={1240 - T[lang].w} y={40} w={T[lang].w} h={120} tail={[640, 260]} text={T[lang].text} size={T[lang].size} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C. 해골 더미 위 사악하게 웃는 칸
const ConceptC = ({ lang }: { lang: TLang }) => {
  const T: Record<string, { lines: Line[]; size: number[] }> = {
    ko: { lines: [[["누가 ", "#fff"], ["날 막아?", Y]]], size: [104] },
    en: { lines: [[["WHO'LL ", "#fff"], ["STOP ME?", Y]]], size: [100] },
    es: { lines: [[["¿QUIÉN ", "#fff"], ["ME PARA?", Y]]], size: [96] },
  };
  return (
    <AbsoluteFill style={{ background: "#1a0202", overflow: "hidden" }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
        <Defs />
        <linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0202" />
          <stop offset="0.6" stopColor="#8a0a06" />
          <stop offset="1" stopColor="#ff3a12" />
        </linearGradient>
        <rect width={1280} height={720} fill="url(#skyC)" />
        <g filter="url(#blur20)">
          <Smoke x={160} y={460} r={80} seed={2} />
          <Smoke x={1120} y={460} r={80} seed={6} />
        </g>
        {/* 뒤 무너진 성 */}
        <g transform="translate(0 40)"><CitySilhouette y={520} fill="#2a0404" /></g>
        <g transform="translate(1280 40) scale(-1 1)"><CitySilhouette y={520} fill="#2a0404" /></g>
        <Fire x0={-40} x1={360} y={600} h={200} seed={11} n={8} />
        <Fire x0={920} x1={1320} y={600} h={200} seed={13} n={8} />
        {/* 아래에서 올라오는 불빛 */}
        <ellipse cx={640} cy={720} rx={600} ry={200} fill="#ff5a12" opacity={0.6} filter="url(#blur40)" />
        {/* 해골 더미 양쪽 */}
        <SkullPile cx={160} base={710} w={520} h={420} seed={3} s={1.3} />
        <SkullPile cx={1120} base={710} w={520} h={420} seed={21} s={1.3} />
        <Khan x={640} y={392} s={1.62} expr="smirk" />
        {/* 얼굴 위쪽 그늘 (아래 불빛) */}
        <linearGradient id="shadeC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0.55} />
          <stop offset="0.35" stopColor="#000" stopOpacity={0} />
        </linearGradient>
        <rect width={1280} height={720} fill="url(#shadeC)" />
        {/* 앞쪽 해골 더미 (칸 몸을 가림) */}
        <SkullPile cx={640} base={810} w={1200} h={80} seed={41} s={1.35} />
        <Embers n={40} seed={9} y0={300} />
      </svg>
      {lang !== "none" && <Words lines={T[lang].lines} x={0} y={4} size={T[lang].size} align="center" />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- D. 거대한 칸의 주먹이 만리장성을 박살
const Fist = () => (
  <g filter="url(#ink)" stroke={INK} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round">
    {/* 소매 + 털 소맷부리 (위에서 내려옴) */}
    <path d="M 120 -400 L 380 -400 L 360 40 L 120 40 Z" fill="#a33a2a" />
    <path d="M 100 20 C 160 0 330 0 380 20 L 384 90 C 330 70 160 70 96 90 Z" fill="url(#fur)" />
    {/* 주먹 (앞에서 본 👊: 네 손가락 마디 + 가로지른 엄지) */}
    <path d="M 104 80 C 92 130 92 250 118 296 C 170 326 322 326 372 296 C 398 250 400 130 384 80 Z" fill="#dcae84" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={112 + i * 66} y={150 + (i === 0 || i === 3 ? 10 : 0)} width={64} height={152 - (i === 0 || i === 3 ? 14 : 0)} rx={30} fill="#dcae84" />)}
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${128 + i * 66} ${190 + (i === 0 || i === 3 ? 10 : 0)} q 16 -10 32 0`} fill="none" strokeWidth={4} opacity={0.6} />)}
    <path d="M 92 196 C 150 182 250 186 292 214 C 306 232 290 254 260 252 C 210 248 150 252 98 262 Z" fill="#dcae84" />
    <path d="M 252 214 q 16 8 16 26" fill="none" strokeWidth={4} opacity={0.6} />
  </g>
);

const TinySoldier = ({ x, y, s = 1, r = 0, flip = false }: { x: number; y: number; s?: number; r?: number; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})`} stroke={INK} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <path d="M -10 10 L -18 40 M 10 10 L 22 36" fill="none" strokeWidth={6} />
    <path d="M -14 -16 C -16 6 16 6 14 -16 Z" fill="#a8432e" />
    <path d="M -12 -14 L -30 -34 M 12 -14 L 30 -36" fill="none" strokeWidth={6} />
    <circle cx={0} cy={-30} r={15} fill="#ecbf93" />
    <path d="M -16 -34 C -16 -54 16 -54 16 -34 Z" fill="#6b5b4b" />
    <circle cx={-5} cy={-30} r={4} fill="#fff" strokeWidth={1.5} />
    <circle cx={5} cy={-30} r={4} fill="#fff" strokeWidth={1.5} />
    <ellipse cx={0} cy={-21} rx={4} ry={5} fill="#4a0d0d" strokeWidth={1.5} />
  </g>
);

const ConceptD = ({ lang }: { lang: TLang }) => {
  const T: Record<string, { lines: Line[]; size: number[] }> = {
    ko: { lines: [[["장성?", "#fff"]], [["소용없다", Y]]], size: [104, 120] },
    en: { lines: [[["WALL?", "#fff"]], [["USELESS", Y]]], size: [116, 116] },
    es: { lines: [[["¿MURALLA?", "#fff"]], [["INÚTIL", Y]]], size: [92, 124] },
  };
  // 장성: 왼쪽 아래 → 오른쪽 가운데로 뻗음, 가운데 망루를 주먹이 부숨
  return (
    <AbsoluteFill style={{ background: "#2a0a04", overflow: "hidden" }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
        <Defs />
        <linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c0404" />
          <stop offset="0.55" stopColor="#c0300e" />
          <stop offset="1" stopColor="#ffa82a" />
        </linearGradient>
        <rect width={1280} height={720} fill="url(#skyD)" />
        {/* 산 */}
        <path d="M 0 520 L 140 400 L 260 470 L 420 360 L 560 460 L 700 380 L 860 470 L 1000 390 L 1140 460 L 1280 400 L 1280 720 L 0 720 Z" fill="#4a1a0c" />
        <path d="M 0 600 L 200 500 L 380 580 L 560 500 L 760 590 L 960 520 L 1280 600 L 1280 720 L 0 720 Z" fill="#2e1006" />
        {/* 장성 (벽돌, 원근) */}
        <g filter="url(#ink)" stroke={INK} strokeWidth={6} strokeLinejoin="round">
          <path d="M -20 720 L -20 600 L 520 470 L 1300 380 L 1300 450 L 560 560 L 60 720 Z" fill="url(#brick)" />
          <path d="M -20 600 L 520 470 L 1300 380" fill="none" strokeWidth={8} />
          {Array.from({ length: 22 }, (_, i) => {
            const t = i / 21;
            const x = -20 + t * 1320;
            const y = t < 0.41 ? 600 - (t / 0.41) * 130 : 470 - ((t - 0.41) / 0.59) * 90;
            const h = 22 - t * 8;
            return <rect key={i} x={x} y={y - h} width={h * 1.1} height={h} fill="#9a8a72" strokeWidth={4} />;
          })}
        </g>
        {/* 충격: 흙먼지 + 섬광 */}
        <circle cx={560} cy={470} r={240} fill="#fff1b0" opacity={0.55} filter="url(#blur40)" />
        <path d="M 560 330 L 600 420 L 720 360 L 640 450 L 790 470 L 640 500 L 720 600 L 590 530 L 560 660 L 520 540 L 400 610 L 470 500 L 320 480 L 470 440 L 380 350 L 510 420 Z" fill="#ffe25a" stroke="#000" strokeWidth={6} />
        {/* 날아가는 벽돌 */}
        {Array.from({ length: 22 }, (_, i) => {
          const a = rnd(i * 5) * Math.PI * 2;
          const d = 150 + rnd(i * 7) * 260;
          return <rect key={i} x={560 + Math.cos(a) * d} y={470 + Math.sin(a) * d * 0.7} width={30 + rnd(i) * 26} height={16 + rnd(i * 2) * 10} fill="#9a8a72" stroke="#000" strokeWidth={4} transform={`rotate(${rnd(i * 3) * 90} ${560 + Math.cos(a) * d} ${470 + Math.sin(a) * d * 0.7})`} />;
        })}
        {/* 금기 */}
        <g filter="url(#ink)">
          <path d="M 380 560 L 360 610 L 420 640 L 470 560 Z M 640 540 L 700 520 L 720 580 L 660 600 Z" fill="#6e6252" stroke={INK} strokeWidth={5} />
        </g>
        {/* 비명 지르며 날아가는 금나라 병사 */}
        <TinySoldier x={300} y={440} s={2.4} r={-30} />
        <TinySoldier x={800} y={360} s={2.2} r={35} flip />
        <TinySoldier x={170} y={640} s={2.6} r={-10} />
        <TinySoldier x={850} y={600} s={2.5} r={15} flip />
        {/* 주먹 (오른쪽 위에서 내리꽂음) */}
        <g transform="translate(560 480) rotate(24) translate(-240 -300)"><Fist /></g>
        {/* 속도선 */}
        <path d="M 560 30 L 470 200 M 460 40 L 380 190 M 660 20 L 590 150" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
      </svg>
      {/* 오른쪽 위에서 내려다보는 칸 (이 악물기) */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
        <Defs />
        <Khan x={1080} y={250} s={1.2} expr="grit" skin="#e49a78" />
      </svg>
      {lang !== "none" && <Words lines={T[lang].lines} x={36} y={30} size={T[lang].size} />}
    </AbsoluteFill>
  );
};

export const Mongol01Thumb3 = ({ concept, lang }: M01ThumbProps) => {
  useFonts();
  const C = { A: ConceptA, B: ConceptB, C: ConceptC, D: ConceptD }[concept];
  return <C lang={lang} />;
};
