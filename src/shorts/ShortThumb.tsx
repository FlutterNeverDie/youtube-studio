// 쇼츠 썸네일 (1080×1920, 2026-10-23 칼카 예고편 영어판): 위 큰 글자 + 가운데 지도(전술이 보이는 순간) + 아래 큰 글자
// 몽골 = 스타일 A(빨간 띠·빨간 글자, 02 썸네일). 작은 화면에서도 읽히게 글자는 위·아래 2~4단어씩, 가운데 안전 영역 안에
import { AbsoluteFill, Img, staticFile } from "remotion";

const SANS = "-apple-system, 'Helvetica Neue', Arial, sans-serif";
export type ShortThumbProps = { img: string; zoom?: number; focusY?: number; band?: string; top: string; bottom: string };

const Big = ({ text, color, size }: { text: string; color: string; size: number }) => (
  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 0.95, color, textAlign: "center", textTransform: "uppercase", letterSpacing: -2,
    WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 10px 30px rgba(0,0,0,0.85)" }}>{text}</div>
);
// 한 줄이 넘치지 않게(가장 긴 줄 기준), 두 줄이면 얼굴을 가리지 않게 작게
const fit = (t: string) => { const ls = t.split("\n"); return Math.min(ls.length > 1 ? 140 : 190, Math.round(1450 / Math.max(4, ...ls.map((l) => l.length)))); };

export const ShortThumb = ({ img, zoom = 1.6, focusY = 52, band, top, bottom }: ShortThumbProps) => (
  <AbsoluteFill style={{ background: "#120f0a", overflow: "hidden" }}>
    <Img src={staticFile(img)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: `50% ${focusY}%`, filter: "saturate(1.35) contrast(1.15)" }} />
    {/* 위·아래 어둡게 - 글자가 지도 위에서 읽히게 */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,8,5,0.88) 0%, rgba(10,8,5,0) 30%, rgba(10,8,5,0) 66%, rgba(10,8,5,0.9) 100%)" }} />
    <div style={{ position: "absolute", top: 150, left: 50, right: 50, whiteSpace: "pre-line", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {band && <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: "#fff", background: "#e5381f", padding: "6px 26px", borderRadius: 10, textTransform: "uppercase" }}>{band}</div>}
      <Big text={top} color="#ffffff" size={fit(top)} />
    </div>
    <div style={{ position: "absolute", bottom: 330, left: 40, right: 40, whiteSpace: "pre-line" }}>
      <Big text={bottom} color="#e5381f" size={fit(bottom)} />
    </div>
  </AbsoluteFill>
);
