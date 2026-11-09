// 본편 구간을 잘라 만드는 세로 쇼츠 틀 (2026-10-26 사용자 "싼 방법"): 모든 쇼츠가 같은 틀
//   ① 첫 1초부터 질문 (훅 목소리 + 구간에서 가장 센 장면 - 인트로·로고 없음) → ② 본편 구간 그대로 → ③ 1.8초 엔딩: 본편 썸네일 + ▼ (화면 아래 "관련 동영상" 버튼을 가리킴, 글자 없음)
//   화면: 가운데 가로 영상 + 위아래는 같은 장면을 흐리게 키워 채움, 왼쪽 위 작은 채널 마크(public/brand/icon.png)
// 재료: public/shorts-src/<id>.mp4(소리 없음) · <id>.<lang>.wav(본편·더빙 트랙에서 같은 구간) · <id>.hook.<lang>.wav(질문) · <thumb>(본편 썸네일 글자 없는 판)
// 화면 글자 없음 (02). 소리 마감은 렌더 뒤 scripts/loudness.py
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

export const SHORT_END = 54; // 엔딩 1.8초 - 길면 반복 재생 전에 넘긴다
export type CutShortProps = { id: string; lang: string; clip: number; hook: number; hookFrom: number; thumb: string };
export const cutShortFrames = (p: { clip: number; hook: number }) => p.hook + p.clip + SHORT_END;

const Frame = ({ src, from }: { src: string; from: number }) => (
  <>
    <OffthreadVideo src={src} startFrom={from} muted style={{ position: "absolute", left: -1166, top: 0, width: 3413, height: 1920, filter: "blur(28px) brightness(0.55) saturate(1.2)" }} />
    <OffthreadVideo src={src} startFrom={from} muted style={{ position: "absolute", left: 0, top: 656, width: 1080, height: 608, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }} />
  </>
);

const Ending = ({ thumb }: { thumb: string }) => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 8], [0.85, 1], { extrapolateRight: "clamp" });
  const bob = Math.abs(Math.sin(f / 5)) * 26;
  return (
    <AbsoluteFill style={{ background: "rgba(10,6,4,0.72)", opacity: interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" }) }}>
      <Img src={staticFile(thumb)} style={{ position: "absolute", left: 90, top: 560, width: 900, height: 506, borderRadius: 28, border: "8px solid #fff", boxShadow: "0 24px 70px rgba(0,0,0,0.8)", transform: `scale(${pop})` }} />
      <svg width={260} height={260} viewBox="0 0 100 100" style={{ position: "absolute", left: 410, top: 1180 + bob }}>
        <path d="M 20 30 L 80 30 L 50 78 Z" fill="#ffd23f" stroke="#000" strokeWidth={7} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

export const CutShort = ({ id, lang, clip, hook, hookFrom, thumb }: CutShortProps) => {
  const src = staticFile(`shorts-src/${id}.mp4`);
  return (
    <AbsoluteFill style={{ background: "#120c08" }}>
      <Sequence durationInFrames={hook}>
        <Frame src={src} from={hookFrom} />
        <Audio src={staticFile(`shorts-src/${id}.hook.${lang}.wav`)} />
      </Sequence>
      <Sequence from={hook} durationInFrames={clip}>
        <Frame src={src} from={0} />
        <Audio src={staticFile(`shorts-src/${id}.${lang}.wav`)} />
      </Sequence>
      <Sequence from={hook + clip}>
        <Frame src={src} from={clip - 1} />
        <Ending thumb={thumb} />
      </Sequence>
      <Img src={staticFile("brand/icon.png")} style={{ position: "absolute", left: 40, top: 40, width: 96, height: 96, borderRadius: 48, border: "4px solid #fff", opacity: 0.92 }} />
    </AbsoluteFill>
  );
};
