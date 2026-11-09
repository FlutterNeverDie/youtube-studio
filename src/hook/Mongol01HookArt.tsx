// 몽골 1편 도입부(Mongol01Hook.tsx) 전용 그림: 지도 지형·종이 결·먹물 튐, 나라별 성·깃발, 콜로세움·페르세폴리스, 로마 독수리 깃발·페르시아 깃발, 큰 천막 안·화로
// 그림은 코드로 (먹선 + 바랜 색, kit의 #kit-ink 필터), 글자 없음
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Glow } from "../draft/kit";

const INK = "#2b1d14";
const ink = { filter: "url(#kit-ink)", overflow: "visible" as const };

// ---------- 종이 결 (정지된 결 - 프레임마다 바뀌면 깜빡임) ----------
export const Grain = ({ op = 0.4 }: { op?: number }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "multiply", opacity: op, pointerEvents: "none" }}>
    <filter id="hook-grain-fine"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={2} /><feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.32  1.1 0 0 0 -0.42" /></filter>
    <filter id="hook-grain-blot"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.28  1.4 0 0 0 -0.62" /></filter>
    <rect width={1920} height={1080} filter="url(#hook-grain-blot)" />
    <rect width={1920} height={1080} filter="url(#hook-grain-fine)" />
  </svg>
);

// ---------- 도장 먹물 튐: 찍힌 점 둘레로 길쭉한 방울 ----------
export const InkSplat = ({ cx, cy, t, color }: { cx: number; cy: number; t: number; color: string }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
    {Array.from({ length: 26 }).map((_, i) => {
      const a = i * 2.39996;
      const d = 1.0 + ((i * 53) % 30) / 100;
      const r = 3 + ((i * 7) % 8);
      const x = cx + Math.cos(a) * d * 400 * (0.8 + 0.2 * t);
      const y = cy + Math.sin(a) * d * 200 * (0.8 + 0.2 * t);
      const deg = (a * 180) / Math.PI;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${deg}) scale(${t})`}>
          <ellipse cx={0} cy={0} rx={r * (i % 3 ? 1.2 : 3)} ry={r} fill={color} opacity={0.85} />
          {i % 4 === 0 && <circle cx={r * 5} cy={0} r={r * 0.5} fill={color} opacity={0.85} />}
        </g>
      );
    })}
  </svg>
);

// ---------- 지도 지형 ----------
const Mt = ({ x, y, s = 1, snow = true }: { x: number; y: number; s?: number; snow?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 0 L -6 -64 L 10 -40 L 22 -54 L 52 0 Z" fill="#b4a283" stroke={INK} strokeWidth={4} />
    <path d="M -6 -64 L 4 0" stroke="#8f7e62" strokeWidth={4} />
    {snow && <path d="M -16 -48 L -6 -64 L 4 -48 L -4 -44 Z" fill="#f5eedc" />}
  </g>
);
const Tree = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g>
    <path d={`M ${x} ${y + 6 * s} L ${x} ${y - 4 * s}`} stroke="#6a4a2e" strokeWidth={3 * s + 1} />
    <path d={`M ${x} ${y - 34 * s} L ${x - 10 * s} ${y - 16 * s} L ${x - 6 * s} ${y - 16 * s} L ${x - 14 * s} ${y} L ${x + 14 * s} ${y} L ${x + 6 * s} ${y - 16 * s} L ${x + 10 * s} ${y - 16 * s} Z`} fill="#6c8558" stroke={INK} strokeWidth={2.5} />
  </g>
);
const sand = (x0: number, x1: number, y0: number, y1: number, n: number, key: string) =>
  Array.from({ length: n }).map((_, i) => <circle key={`${key}${i}`} cx={x0 + ((i * 263) % (x1 - x0))} cy={y0 + ((i * 47) % (y1 - y0))} r={2.2} fill="#a8905a" />);
const dunes = (pts: number[][], key: string, s = 1) =>
  pts.map(([x, y], i) => <path key={`${key}${i}`} d={`M ${x} ${y} q ${14 * s} -10 ${28 * s} 0 q ${14 * s} -10 ${28 * s} 0`} stroke="#a8905a" strokeWidth={3} fill="none" />);
const grass = (x0: number, x1: number, y0: number, y1: number, n: number, key: string) =>
  Array.from({ length: n }).map((_, i) => {
    const x = x0 + ((i * 197) % (x1 - x0));
    const y = y0 + ((i * 61) % (y1 - y0));
    return <path key={`${key}${i}`} d={`M ${x - 5} ${y} l 3 -9 M ${x} ${y} l 0 -11 M ${x + 5} ${y} l -3 -9`} stroke="#7d8a4e" strokeWidth={2.2} />;
  });
const curve = (pts: number[][]) => {
  // 점들을 지나는 부드러운 선 (가운데 점 기준 2차 곡선)
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L ${l[0]} ${l[1]}`;
};
// europe = false: 세계 지도(series/mongol/land.png, 1920×1080 판) · true: 유럽·서아시아(hook/m01/europe.svg)
export const MapTerrain = ({ europe = false }: { europe?: boolean }) =>
  europe ? (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      {/* 강: 도나우·드네프르·볼가 */}
      {[
        [[560, 440], [700, 428], [812, 455], [830, 540], [950, 560], [1073, 533]],
        [[1180, 170], [1110, 280], [1095, 350], [1200, 420], [1181, 487]],
        [[1330, 150], [1550, 170], [1600, 280], [1480, 380], [1440, 411], [1526, 494]],
      ].map((p, i) => <path key={i} d={curve(p)} stroke="#7d9db0" strokeWidth={4.5} fill="none" strokeLinecap="round" />)}
      {/* 숲: 러시아 북쪽·폴란드·독일 */}
      {Array.from({ length: 26 }).map((_, i) => <Tree key={`r${i}`} x={1000 + ((i * 263) % 700)} y={40 + ((i * 89) % 210)} s={0.9} />)}
      {Array.from({ length: 9 }).map((_, i) => <Tree key={`p${i}`} x={600 + ((i * 131) % 330)} y={250 + ((i * 37) % 70)} s={0.8} />)}
      {/* 초원 풀결 */}
      {grass(1100, 1600, 400, 560, 40, "g")}
      {/* 사막: 카라쿰·시리아 */}
      {sand(1700, 1880, 680, 780, 26, "k")}
      {dunes([[1720, 720], [1800, 760], [1760, 700]], "kd")}
      {sand(1260, 1450, 960, 1060, 22, "s")}
      {dunes([[1300, 990], [1380, 1030]], "sd")}
      {/* 산: 알프스·카르파티아·캅카스·피레네·발칸·타우루스·자그로스·우랄 */}
      {[[530, 500], [575, 488], [620, 494], [660, 506]].map(([x, y], i) => <Mt key={`al${i}`} x={x} y={y} s={0.7} />)}
      {[[800, 425], [848, 402], [896, 420], [928, 462], [934, 506]].map(([x, y], i) => <Mt key={`ca${i}`} x={x} y={y} s={0.55} snow={false} />)}
      {[[1340, 600], [1385, 606], [1430, 612], [1475, 622]].map(([x, y], i) => <Mt key={`cc${i}`} x={x} y={y} s={0.65} />)}
      {[[330, 622], [370, 626]].map(([x, y], i) => <Mt key={`py${i}`} x={x} y={y} s={0.55} />)}
      {[[880, 590], [930, 600]].map(([x, y], i) => <Mt key={`bk${i}`} x={x} y={y} s={0.5} snow={false} />)}
      {[[1140, 830], [1190, 826], [1240, 836]].map(([x, y], i) => <Mt key={`tr${i}`} x={x} y={y} s={0.55} snow={false} />)}
      {[[1510, 900], [1550, 940], [1590, 985]].map(([x, y], i) => <Mt key={`zg${i}`} x={x} y={y} s={0.6} snow={false} />)}
      {[[1806, 80], [1812, 150], [1816, 220]].map(([x, y], i) => <Mt key={`ur${i}`} x={x} y={y} s={0.5} snow={false} />)}
    </svg>
  ) : (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      {/* 숲: 시베리아 */}
      {Array.from({ length: 30 }).map((_, i) => <Tree key={`t${i}`} x={830 + ((i * 263) % 480)} y={250 + ((i * 47) % 140)} s={0.55} />)}
      {/* 초원 풀결: 카자흐 초원 ~ 몽골 고원 */}
      {grass(620, 1000, 440, 500, 34, "g")}
      {grass(1000, 1130, 430, 490, 14, "m")}
      {/* 사막: 고비·타클라마칸·사하라·아라비아·카라쿰 */}
      {sand(985, 1090, 500, 540, 18, "gb")}
      {sand(885, 960, 550, 580, 10, "tk")}
      {sand(380, 640, 640, 720, 40, "sh")}
      {dunes([[420, 670], [520, 690], [600, 660], [460, 710]], "shd", 0.8)}
      {sand(645, 720, 680, 720, 12, "ar")}
      {sand(760, 820, 540, 570, 8, "kk")}
      {/* 강: 볼가·아무다리야·황하 */}
      <path d={curve([[700, 380], [740, 430], [712, 470], [700, 500]])} stroke="#7d9db0" strokeWidth={3} fill="none" />
      <path d={curve([[1100, 560], [1060, 540], [1020, 580], [1080, 600], [1110, 580]])} stroke="#7d9db0" strokeWidth={3} fill="none" />
      {/* 산: 히말라야·톈산·알타이·우랄·캅카스·알프스·자그로스 */}
      {Array.from({ length: 7 }).map((_, i) => <Mt key={`hm${i}`} x={868 + i * 22} y={652 + Math.sin(i) * 4} s={0.42} />)}
      {[[868, 528], [898, 522], [930, 530]].map(([x, y], i) => <Mt key={`ts${i}`} x={x} y={y} s={0.38} />)}
      {[[982, 462], [998, 480]].map(([x, y], i) => <Mt key={`at${i}`} x={x} y={y} s={0.36} />)}
      {[[764, 330], [766, 370], [762, 410]].map(([x, y], i) => <Mt key={`ur${i}`} x={x} y={y} s={0.32} snow={false} />)}
      {[[646, 548], [668, 552]].map(([x, y], i) => <Mt key={`cc${i}`} x={x} y={y} s={0.32} />)}
      {[[484, 518], [504, 516]].map(([x, y], i) => <Mt key={`al${i}`} x={x} y={y} s={0.3} />)}
      {[[720, 612], [740, 626]].map(([x, y], i) => <Mt key={`zg${i}`} x={x} y={y} s={0.3} snow={false} />)}
    </svg>
  );

// ---------- 지도 위 나라별 성·도시 (가운데 아래가 (x,y)) ----------
export const HookTown = ({ x, y, kind, s = 1 }: { x: number; y: number; kind: string; s?: number }) => (
  <svg width={130 * s} height={110 * s} viewBox="-65 -100 130 110" style={{ position: "absolute", left: x - 65 * s, top: y - 100 * s, ...ink }}>
    <ellipse cx={0} cy={4} rx={60} ry={8} fill="rgba(43,29,20,0.2)" />
    {(kind === "rus" || kind === "rus2") && (
      <>
        {/* 나무 울타리 + 흰 돌 교회와 양파 지붕 */}
        <path d="M -56 0 L -56 -26 L 56 -26 L 56 0 Z" fill="#a07a4e" stroke={INK} strokeWidth={3.5} />
        {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${-50 + i * 12.5} -26 L ${-44 + i * 12.5} -34 L ${-38 + i * 12.5} -26`} fill="#a07a4e" stroke={INK} strokeWidth={2.5} />)}
        <path d="M -18 -26 L -18 -62 L 18 -62 L 18 -26 Z" fill="#efe6d2" stroke={INK} strokeWidth={3.5} />
        <path d="M -6 -26 L -6 -40 C -6 -46 6 -46 6 -40 L 6 -26 Z" fill="#5a3e28" />
        <path d={`M -14 -62 C -20 -76 -6 -82 0 ${kind === "rus" ? -94 : -92} C 6 -82 20 -76 14 -62 Z`} fill={kind === "rus" ? "#c9a24a" : "#4d6b8a"} stroke={INK} strokeWidth={3.5} />
        {kind === "rus2" && <path d="M 26 -26 L 26 -48 L 42 -48 L 42 -26 Z M 24 -48 L 34 -60 L 44 -48 Z" fill="#efe6d2" stroke={INK} strokeWidth={3} />}
      </>
    )}
    {(kind === "castle" || kind === "castle2") && (
      <>
        {/* 돌 성벽 + 탑 + 붉은 원뿔 지붕 */}
        <path d="M -50 0 L -50 -30 L 50 -30 L 50 0 Z" fill="#cfc3a8" stroke={INK} strokeWidth={3.5} />
        {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M ${-42 + i * 16} -30 L ${-42 + i * 16} -37 L ${-34 + i * 16} -37 L ${-34 + i * 16} -30`} fill="#cfc3a8" stroke={INK} strokeWidth={2.5} />)}
        {[-46, 46].map((tx) => <path key={tx} d={`M ${tx - 10} 0 L ${tx - 10} -52 L ${tx + 10} -52 L ${tx + 10} 0 Z`} fill="#c2b593" stroke={INK} strokeWidth={3.5} />)}
        {[-46, 46].map((tx) => <path key={`r${tx}`} d={`M ${tx - 14} -52 L ${tx} -72 L ${tx + 14} -52 Z`} fill={kind === "castle" ? "#a8332a" : "#3f6690"} stroke={INK} strokeWidth={3} />)}
        <path d="M -14 -30 L -14 -70 L 14 -70 L 14 -30 Z" fill="#d8ccb0" stroke={INK} strokeWidth={3.5} />
        <path d="M -18 -70 L 0 -96 L 18 -70 Z" fill={kind === "castle" ? "#a8332a" : "#3f6690"} stroke={INK} strokeWidth={3} />
        <path d="M -8 0 L -8 -14 C -8 -22 8 -22 8 -14 L 8 0 Z" fill="#5a3e28" />
      </>
    )}
    {kind === "georgia" && (
      <>
        {/* 돌 교회 (원통 + 원뿔 지붕) + 낮은 성벽 */}
        <path d="M -54 0 L -54 -20 L 54 -20 L 54 0 Z" fill="#c8b48e" stroke={INK} strokeWidth={3.5} />
        <path d="M -28 -20 L -28 -50 L 28 -50 L 28 -20 Z" fill="#e0cfa8" stroke={INK} strokeWidth={3.5} />
        <path d="M -32 -50 L 0 -62 L 32 -50 Z" fill="#9a7a50" stroke={INK} strokeWidth={3} />
        <path d="M -10 -58 L -10 -76 L 10 -76 L 10 -58 Z" fill="#e0cfa8" stroke={INK} strokeWidth={3} />
        <path d="M -13 -76 L 0 -96 L 13 -76 Z" fill="#9a7a50" stroke={INK} strokeWidth={3} />
      </>
    )}
    {kind === "persia" && (
      <>
        {/* 흙벽돌 성벽 + 푸른 둥근 지붕 + 가는 탑 */}
        <path d="M -60 0 L -60 -26 L 60 -26 L 60 0 Z" fill="#d8b88a" stroke={INK} strokeWidth={3.5} />
        {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M ${-54 + i * 18} -26 C ${-54 + i * 18} -34 ${-44 + i * 18} -34 ${-44 + i * 18} -26`} fill="#d8b88a" stroke={INK} strokeWidth={2.5} />)}
        <path d="M -22 -26 L -22 -48 L 22 -48 L 22 -26 Z" fill="#e6cfa4" stroke={INK} strokeWidth={3.5} />
        <path d="M -24 -48 C -24 -78 24 -78 24 -48 Z" fill="#4f86a8" stroke={INK} strokeWidth={3.5} />
        <path d="M 36 -26 L 36 -84 L 46 -84 L 46 -26 Z" fill="#e6cfa4" stroke={INK} strokeWidth={3} />
        <path d="M 34 -84 L 41 -94 L 48 -84 Z" fill="#4f86a8" stroke={INK} strokeWidth={2.5} />
      </>
    )}
    {kind === "cuman" && (
      <>
        {/* 초원의 천막 둘 + 수레 */}
        {[[-26, 1], [26, 0.8]].map(([tx, k], i) => (
          <g key={i} transform={`translate(${tx} 0) scale(${k})`}>
            <path d="M -28 0 L -28 -22 L 28 -22 L 28 0 Z" fill="#e6dcc4" stroke={INK} strokeWidth={3.5} />
            <path d="M -32 -22 C -18 -48 18 -48 32 -22 Z" fill="#d8caa8" stroke={INK} strokeWidth={3.5} />
            <path d="M -6 0 L -6 -14 L 6 -14 L 6 0 Z" fill="#8a6a2c" />
          </g>
        ))}
      </>
    )}
  </svg>
);

// ---------- 나라별 깃발 (글자 없음): (x,y) = 장대 아래, fall 0~1 쓰러짐 ----------
export const NationFlag = ({ x, y, kind, fall = 0, h = 104 }: { x: number; y: number; kind: string; fall?: number; h?: number }) => {
  const f = useCurrentFrame();
  const w = Math.sin(f / 7 + x) * 3;
  const cloth = (fill: string, children?: React.ReactNode, swallow = false) => (
    <>
      <path d={swallow ? `M 4 4 L 62 ${4 + w} L 50 ${24 + w} L 62 ${44 + w} L 4 44 Z` : `M 4 4 L 62 ${4 + w} L 62 ${44 + w} L 4 44 Z`} fill={fill} stroke={INK} strokeWidth={3} />
      {children}
    </>
  );
  return (
    <div style={{ position: "absolute", inset: 0, transform: `rotate(${fall * 80}deg)`, transformOrigin: `${x}px ${y}px`, opacity: 1 - fall * 0.45 }}>
      <svg width={80} height={h + 16} viewBox={`-6 -12 80 ${h + 16}`} style={{ position: "absolute", left: x - 6, top: y - h - 4, ...ink }}>
        <path d={`M 0 ${h} L 0 -4`} stroke={INK} strokeWidth={6} />
        <path d={`M 0 ${h} L 0 -4`} stroke="#6a4a2e" strokeWidth={2.5} />
        <circle cx={0} cy={-6} r={4} fill="#c9a24a" stroke={INK} strokeWidth={2} />
        {kind === "poland" && cloth("#b23a2c", <path d="M 33 14 L 33 36 M 20 16 C 24 26 30 26 33 22 C 36 26 42 26 46 16 M 26 32 L 33 36 L 40 32" stroke="#f2ead8" strokeWidth={4} fill="none" />)}
        {kind === "hungary" && cloth("#f2ead8", <>{[4, 22].map((yy) => <path key={yy} d={`M 5 ${yy + 4} L 61 ${yy + 4 + w * 0.5} L 61 ${yy + 13 + w * 0.5} L 5 ${yy + 13} Z`} fill="#b23a2c" />)}</>)}
        {kind === "rus" && cloth("#a8332a", <path d="M 22 14 L 22 34 L 44 34 L 44 14 M 33 14 L 33 34" stroke="#e8c45a" strokeWidth={4} fill="none" />, true)}
        {kind === "rus2" && cloth("#3f6690", <circle cx={28} cy={24} r={9} fill="#e8c45a" stroke={INK} strokeWidth={2} />, true)}
        {kind === "cuman" && <><path d={`M 4 4 L 66 ${22 + w} L 4 42 Z`} fill="#d8a83a" stroke={INK} strokeWidth={3} /><path d="M 12 14 L 26 22 L 12 30" stroke={INK} strokeWidth={4} fill="none" /></>}
        {kind === "georgia" && cloth("#f2ead8", <path d="M 33 8 L 33 40 M 6 24 L 60 24" stroke="#b23a2c" strokeWidth={7} />)}
        {kind === "khwarazm" && cloth("#4e7a4e", <><circle cx={30} cy={24} r={11} fill="#e8c45a" /><circle cx={35} cy={22} r={9} fill="#4e7a4e" /></>)}
      </svg>
    </div>
  );
};

// ---------- 2) 로마·페르시아 배경 ----------
// 콜로세움: 왼쪽 지평선 위, 세 층 아치 + 무너진 오른쪽 끝 (뒤 배경이라 옅게)
export const Colosseum = () => {
  const tiers = [[640, 560], [560, 480], [480, 410]];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink, opacity: 0.92 }}>
      <path d="M -20 640 L -20 360 C 200 330 460 334 640 360 L 660 400 L 700 410 L 700 480 L 730 490 L 730 640 Z" fill="#dccaa4" stroke={INK} strokeWidth={6} />
      {tiers.map(([b, t], r) => (
        <g key={r}>
          <path d={`M -20 ${t} L ${700 + (r === 0 ? 30 : r === 1 ? 0 : -60)} ${t}`} stroke="#9c8762" strokeWidth={5} />
          {Array.from({ length: 10 - (r === 2 ? 1 : 0) }).map((_, i) => {
            const x = 10 + i * 72;
            const top = t + 18;
            return <path key={i} d={`M ${x} ${b - 4} L ${x} ${top + 18} C ${x} ${top - 2} ${x + 44} ${top - 2} ${x + 44} ${top + 18} L ${x + 44} ${b - 4} Z`} fill="#8f7a58" stroke={INK} strokeWidth={3} />;
          })}
        </g>
      ))}
      <path d="M -20 410 L 640 410" stroke="#9c8762" strokeWidth={5} />
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={30 + i * 70} y={378} width={18} height={20} fill="#8f7a58" stroke={INK} strokeWidth={2.5} />)}
      {/* 앞 사이프러스 두 그루 */}
      {[760, 820].map((x, i) => <path key={i} d={`M ${x} 646 C ${x - 26} 590 ${x - 18} 480 ${x} ${440 + i * 30} C ${x + 18} 480 ${x + 26} 590 ${x} 646 Z`} fill="#5d7048" stroke={INK} strokeWidth={4} />)}
    </svg>
  );
};
// 페르세폴리스: 오른쪽 돌 단 위 높은 기둥들 (몇 개는 부러짐), 꼭대기에 두 머리 황소 기둥머리
export const Persepolis = () => {
  const cols = [[1150, 300, true], [1260, 330, true], [1370, 250, false], [1480, 330, true], [1590, 310, true], [1700, 200, false], [1810, 320, true]] as const;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink, opacity: 0.92 }}>
      <path d="M 1080 640 L 1080 600 L 1940 600 L 1940 640 Z" fill="#cdb894" stroke={INK} strokeWidth={6} />
      <path d="M 1100 600 L 1100 578 L 1940 578 L 1940 600" fill="#d8c4a0" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${1110 + i * 70} 610 L ${1110 + i * 70} 632`} stroke="#9c8762" strokeWidth={3} />)}
      {cols.map(([x, h, cap], i) => (
        <g key={i}>
          <path d={`M ${x - 18} 578 L ${x - 16} ${578 - h} L ${x + 16} ${578 - h} L ${x + 18} 578 Z`} fill="#e2d2ae" stroke={INK} strokeWidth={4} />
          {[-8, 0, 8].map((dx) => <path key={dx} d={`M ${x + dx} 570 L ${x + dx} ${586 - h}`} stroke="#b9a47e" strokeWidth={2.5} />)}
          <path d={`M ${x - 28} 578 L ${x + 28} 578 L ${x + 22} 566 L ${x - 22} 566 Z`} fill="#d2bf98" stroke={INK} strokeWidth={3} />
          {cap ? (
            <g transform={`translate(${x} ${578 - h})`}>
              {/* 소용돌이 장식 + 등을 맞댄 두 황소 (머리는 바깥으로) */}
              <path d="M -16 0 L -16 -26 L 16 -26 L 16 0 Z" fill="#d8c69e" stroke={INK} strokeWidth={3} />
              <circle cx={-10} cy={-14} r={5} fill="none" stroke={INK} strokeWidth={2.5} />
              <circle cx={10} cy={-14} r={5} fill="none" stroke={INK} strokeWidth={2.5} />
              {[-1, 1].map((sd) => (
                <g key={sd} transform={`scale(${sd} 1)`}>
                  <path d="M 0 -26 L 40 -26 C 52 -26 58 -34 60 -44 L 66 -50 C 74 -50 80 -44 78 -36 C 76 -30 70 -28 64 -28 L 60 -18 L 52 -18 L 50 -10 L 40 -10 L 40 -18 L 0 -18 Z" fill="#cdb48a" stroke={INK} strokeWidth={3.5} />
                  <path d="M 60 -48 C 60 -60 70 -66 76 -62" stroke={INK} strokeWidth={3.5} fill="none" />
                  <circle cx={70} cy={-40} r={2.5} fill={INK} />
                </g>
              ))}
              <path d="M -46 -26 L 46 -26 L 46 -36 L -46 -36 Z" fill="#b89e76" stroke={INK} strokeWidth={3} />
            </g>
          ) : (
            <path d={`M ${x - 16} ${578 - h} L ${x - 4} ${566 - h} L ${x + 6} ${574 - h} L ${x + 16} ${562 - h}`} stroke={INK} strokeWidth={4} fill="#e2d2ae" />
          )}
        </g>
      ))}
      {/* 기둥 위 들보 조각 */}
      <path d="M 1100 270 L 1300 270 L 1300 246 L 1100 246 Z" fill="#cdb48a" stroke={INK} strokeWidth={4} />
      <path d="M 1540 266 L 1650 266 L 1650 244 L 1540 244 Z" fill="#cdb48a" stroke={INK} strokeWidth={4} />
    </svg>
  );
};
// 로마 독수리 깃발 (땅에 꽂음): (x,y) = 장대 아래, rot 흔들림
export const Aquila = ({ x, y, rot = 0, h = 600 }: { x: number; y: number; rot?: number; h?: number }) => (
  <svg width={200} height={h + 40} viewBox={`-100 ${-h - 40} 200 ${h + 40}`} style={{ position: "absolute", left: x - 100, top: y - h - 40, transform: `rotate(${rot}deg)`, transformOrigin: `50% 100%`, ...ink }}>
    <path d={`M 0 0 L 0 ${-h + 40}`} stroke={INK} strokeWidth={12} />
    <path d={`M 0 0 L 0 ${-h + 40}`} stroke="#7a5230" strokeWidth={6} />
    {/* 가로대 + 붉은 천 + 금 술 */}
    <path d={`M -64 ${-h + 170} L 64 ${-h + 170}`} stroke={INK} strokeWidth={8} />
    <path d={`M -58 ${-h + 172} L 58 ${-h + 172} L 58 ${-h + 290} L -58 ${-h + 290} Z`} fill="#a8332a" stroke={INK} strokeWidth={5} />
    <path d={`M -44 ${-h + 190} L 44 ${-h + 190} L 44 ${-h + 272} L -44 ${-h + 272} Z`} fill="none" stroke="#e0b84a" strokeWidth={4} />
    <circle cx={0} cy={-h + 231} r={16} fill="#e0b84a" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${-52 + i * 15} ${-h + 290} L ${-52 + i * 15} ${-h + 308}`} stroke="#e0b84a" strokeWidth={5} />)}
    {/* 금 독수리: 날개를 위로 펼침 */}
    <path d={`M 0 ${-h + 60} C -20 ${-h + 40} -50 ${-h + 10} -78 ${-h - 30} C -60 ${-h - 4} -54 ${-h + 20} -36 ${-h + 34} C -50 ${-h + 30} -60 ${-h + 24} -70 ${-h + 10} C -50 ${-h + 52} -20 ${-h + 64} 0 ${-h + 70} C 20 ${-h + 64} 50 ${-h + 52} 70 ${-h + 10} C 60 ${-h + 24} 50 ${-h + 30} 36 ${-h + 34} C 54 ${-h + 20} 60 ${-h - 4} 78 ${-h - 30} C 50 ${-h + 10} 20 ${-h + 40} 0 ${-h + 60} Z`} fill="#e0b84a" stroke={INK} strokeWidth={4} />
    <path d={`M -8 ${-h + 64} C -10 ${-h + 40} -6 ${-h + 24} 6 ${-h + 18} C 18 ${-h + 16} 22 ${-h + 26} 14 ${-h + 30} L 8 ${-h + 30} C 10 ${-h + 44} 10 ${-h + 56} 8 ${-h + 64} Z`} fill="#d4a63c" stroke={INK} strokeWidth={3.5} />
    <path d={`M -16 ${-h + 70} L 16 ${-h + 70} L 12 ${-h + 80} L -12 ${-h + 80} Z`} fill="#c9a24a" stroke={INK} strokeWidth={3} />
  </svg>
);
// 페르시아 깃발 (땅에 꽂음): 보랏빛 천 + 금 마름모 + 늘어진 술
export const Derafsh = ({ x, y, rot = 0, h = 600 }: { x: number; y: number; rot?: number; h?: number }) => {
  const f = useCurrentFrame();
  return (
    <svg width={220} height={h + 40} viewBox={`-110 ${-h - 40} 220 ${h + 40}`} style={{ position: "absolute", left: x - 110, top: y - h - 40, transform: `rotate(${rot}deg)`, transformOrigin: `50% 100%`, ...ink }}>
      <path d={`M 0 0 L 0 ${-h}`} stroke={INK} strokeWidth={12} />
      <path d={`M 0 0 L 0 ${-h}`} stroke="#7a5230" strokeWidth={6} />
      <circle cx={0} cy={-h - 12} r={16} fill="#e0b84a" stroke={INK} strokeWidth={4} />
      <path d={`M -8 ${-h - 26} L 0 ${-h - 44} L 8 ${-h - 26} Z`} fill="#e0b84a" stroke={INK} strokeWidth={3} />
      <path d={`M -70 ${-h + 10} L 70 ${-h + 10}`} stroke={INK} strokeWidth={8} />
      <path d={`M -66 ${-h + 12} L 66 ${-h + 12} L 66 ${-h + 190} L -66 ${-h + 190} Z`} fill="#6a3a7a" stroke={INK} strokeWidth={5} />
      <path d={`M 0 ${-h + 36} L 46 ${-h + 101} L 0 ${-h + 166} L -46 ${-h + 101} Z`} fill="#e0b84a" stroke={INK} strokeWidth={4} />
      <path d={`M 0 ${-h + 70} L 22 ${-h + 101} L 0 ${-h + 132} L -22 ${-h + 101} Z`} fill="#a8332a" stroke={INK} strokeWidth={3} />
      {[[-66, -h + 12], [66, -h + 12], [-66, -h + 190], [66, -h + 190]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={8} fill="#e0b84a" stroke={INK} strokeWidth={2.5} />)}
      {[-50, -25, 0, 25, 50].map((dx, i) => {
        const sw = Math.sin(f / 9 + i) * 4;
        return <path key={i} d={`M ${dx} ${-h + 190} q ${sw} 30 ${sw * 1.5} 60`} stroke={["#a8332a", "#e0b84a", "#6a3a7a"][i % 3]} strokeWidth={7} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
};

// ---------- 4) 큰 천막 안 (어둠 속, lit 0~1 불빛이 오르며 밝아짐) ----------
export const GerHall = ({ lit }: { lit: number }) => (
  <AbsoluteFill style={{ filter: `brightness(${0.18 + lit * 0.72})` }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #6b4630, #2a1a12 75%)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, ...ink }}>
      {/* 지붕 살: 천장 고리에서 퍼짐 */}
      {Array.from({ length: 17 }).map((_, i) => <path key={`r${i}`} d={`M 960 -40 L ${-300 + i * 157} 340`} stroke="#7a5230" strokeWidth={10} />)}
      <path d="M -40 340 L 1960 340" stroke="#5a3a24" strokeWidth={14} />
      {/* 격자 벽 */}
      {Array.from({ length: 24 }).map((_, i) => <path key={`a${i}`} d={`M ${-80 + i * 90} 350 L ${10 + i * 90} 820`} stroke="#5a3e28" strokeWidth={6} />)}
      {Array.from({ length: 24 }).map((_, i) => <path key={`b${i}`} d={`M ${10 + i * 90} 350 L ${-80 + i * 90} 820`} stroke="#5a3e28" strokeWidth={6} />)}
      {/* 칸 뒤 수놓은 휘장 */}
      <path d="M 640 150 L 1280 150 L 1300 840 L 620 840 Z" fill="#7a2a20" stroke={INK} strokeWidth={7} />
      <path d="M 680 190 L 1240 190 L 1256 800 L 664 800 Z" fill="none" stroke="#c9a24a" strokeWidth={10} />
      {Array.from({ length: 12 }).map((_, i) => <path key={`p${i}`} d={`M ${700 + i * 46} 208 l 12 14 l 12 -14`} stroke="#c9a24a" strokeWidth={4} fill="none" />)}
      {[[960, 330], [800, 520], [1120, 520], [960, 690]].map(([x, y], i) => (
        <g key={`m${i}`}>
          <path d={`M ${x} ${y - 60} L ${x + 60} ${y} L ${x} ${y + 60} L ${x - 60} ${y} Z`} fill="#9c3a2c" stroke="#c9a24a" strokeWidth={5} />
          <path d={`M ${x} ${y - 26} L ${x + 26} ${y} L ${x} ${y + 26} L ${x - 26} ${y} Z`} fill="#c9a24a" />
        </g>
      ))}
      {/* 걸어 둔 활·화살통 (벽 고리) */}
      <path d="M 360 420 C 400 470 400 590 360 640" stroke={INK} strokeWidth={10} fill="none" />
      <path d="M 360 420 C 400 470 400 590 360 640" stroke="#8a5a2e" strokeWidth={5} fill="none" />
      <path d="M 360 420 L 360 640" stroke="#e8dcc0" strokeWidth={2} />
      <path d="M 1540 430 L 1580 430 L 1574 600 L 1546 600 Z" fill="#6a4a2e" stroke={INK} strokeWidth={4} />
      {[1550, 1562, 1574].map((x) => <path key={x} d={`M ${x} 430 L ${x} 396`} stroke="#e8dcc0" strokeWidth={5} />)}
      {/* 바닥 + 양탄자 */}
      <path d="M -20 820 L 1940 820 L 1940 1100 L -20 1100 Z" fill="#3e2a1c" stroke={INK} strokeWidth={6} />
      <path d="M 420 840 L 1500 840 L 1640 1100 L 280 1100 Z" fill="#8a3b2c" stroke={INK} strokeWidth={5} />
      <path d="M 470 860 L 1450 860 L 1570 1090 L 350 1090 Z" fill="none" stroke="#c9a24a" strokeWidth={6} />
    </svg>
  </AbsoluteFill>
);
// 화로: 세 발 청동 그릇 + 불꽃 (k 0~1 불 크기), (x,y) = 발 아래
export const Brazier = ({ x, y, k, s = 1 }: { x: number; y: number; k: number; s?: number }) => {
  const f = useCurrentFrame();
  const fl = (0.4 + 0.6 * k) * (1 + Math.sin(f / 3 + x) * 0.08);
  return (
    <>
      <Glow x={x} y={y - 200 * s} r={360 * s} color="#f39a45" op={0.55 * k} />
      <svg width={220 * s} height={360 * s} viewBox="-110 -330 220 360" style={{ position: "absolute", left: x - 110 * s, top: y - 330 * s, ...ink }}>
        {k > 0.02 && (
          <g opacity={Math.min(1, k * 2)}>
            <path d={`M -50 -150 C -60 ${-150 - 90 * fl} -10 ${-160 - 120 * fl} 0 ${-160 - 150 * fl} C 14 ${-160 - 110 * fl} 70 ${-150 - 80 * fl} 50 -150 Z`} fill="#e8913a" stroke={INK} strokeWidth={4} />
            <path d={`M -26 -150 C -30 ${-150 - 50 * fl} 0 ${-158 - 80 * fl} 4 ${-158 - 96 * fl} C 12 ${-150 - 60 * fl} 34 ${-150 - 40 * fl} 26 -150 Z`} fill="#ffd36b" />
          </g>
        )}
        <path d="M -80 -160 L 80 -160 C 74 -110 40 -92 0 -92 C -40 -92 -74 -110 -80 -160 Z" fill="#8a6a3a" stroke={INK} strokeWidth={6} />
        <path d="M -84 -164 L 84 -164 L 84 -150 L -84 -150 Z" fill="#a8844a" stroke={INK} strokeWidth={5} />
        <path d="M -40 -100 L -70 20 M 40 -100 L 70 20 M 0 -92 L 0 20" stroke={INK} strokeWidth={12} />
        <path d="M -40 -100 L -70 20 M 40 -100 L 70 20 M 0 -92 L 0 20" stroke="#6a4a2a" strokeWidth={6} />
      </svg>
    </>
  );
};
