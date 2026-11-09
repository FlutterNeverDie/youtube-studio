# 깜빡임 없는 렌더: 프레임 사진으로 렌더 → 깨진 프레임 찾기 → 그 프레임만 한 장씩 다시 찍기 → 다시 검사 → 소리와 합쳐 mp4
# .venv/bin/python -I scripts/render-checked.py <컴포지션> <timeline.json> <출력.mp4> [--resume [시작-끝]] [--draft] [--lang=ko]
#   장 초안은 --draft(1080p) + 타임라인은 scripts/check-draft.py --timeline <장>이 만든 것
# 화면 배치는 1920×1080 그대로 4/3배로 찍어 2560×1440(1440p) - make-episode.mjs 참고
# 크롬이 긴 렌더 중 가끔 화면을 3×3 타일로 깨뜨려 찍는다(설정으로 못 막음, docs/guide/04 참고). 한 장씩 다시 찍으면 정상
import json, shutil, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pngframes import png_frames
import tools  # noqa: E402 - 외부 프로그램 위치 (맥·윈도우), npx 대신 노드로 remotion

comp, tl_path, out = sys.argv[1], sys.argv[2], Path(sys.argv[3])  # 그 뒤 --resume [시작-끝]
CODE = Path(__file__).resolve().parent.parent
# --lang=ko: 장 초안을 그 언어 목소리로 (컴포지션 lang 속성, 기본 en) - 2026-10-26 본편 기본이 영어가 되어 한국어 검수판용
LANG = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--lang=")), None)
PROPS = [f"--props={json.dumps({'lang': LANG})}"] if LANG else []
frames_dir = CODE / "out/frames" / (comp + (f"-{LANG}" if LANG else ""))
tl = json.load(open(tl_path))
FPS = tl["fps"]
SHOT = ["--image-format=jpeg", "--jpeg-quality=95", "--scale=1.3333333333333333", "--timeout=120000"]
if "--draft" in sys.argv:  # 장 초안(검수용): 1080p 그대로 - 2026-10-26 초안도 깨진 프레임이 나와 이 도구로 렌더
    SHOT = [a for a in SHOT if not a.startswith("--scale")]
SHOT += PROPS


def run(*a):
    subprocess.run(list(a), check=True, cwd=CODE, capture_output=True)


def small_frames():
    raw = subprocess.run(
        [*tools.remotion(), "ffmpeg", "-v", "error", "-framerate", str(FPS), "-i", str(frames_dir / "element-%05d.jpeg"),
         "-vf", "scale=32:18,format=gray", "-c:v", "png", "-f", "image2pipe", "-"],
        capture_output=True, check=True, cwd=CODE,
    ).stdout
    return np.stack(png_frames(raw))


def bad_frames():
    """깨진 프레임 = 한두 프레임만 앞뒤와 다르고 앞뒤끼리는 비슷한 것 (크롬 3×3 타일 깨짐).
    장면 안의 컷·서서히 바뀌는 빛은 깨짐이 아님 - 예전 판정(주변보다 큰 변화)은 초안의 장면 안 컷을 깨짐으로 보고
    다섯 번 다시 찍어도 안 없어져 멈췄다 (2026-10-26). scripts/check-draft.py --video와 같은 기준"""
    fr = small_frames().astype(np.float32)
    D = lambda a, b: float(np.abs(fr[a] - fr[b]).mean())
    bad = set()
    def tiled(k):  # 크롬 3×3 타일 깨짐 - 아홉 칸이 같은 그림, 192×108에서 비교 (2026-10-27: 3~12프레임 연속이라 앞뒤 비교로는 놓침)
        a = np.asarray(Image.open(frames_dir / f"element-{k:05d}.jpeg").convert("L").resize((192, 108), Image.BOX), dtype=np.float32)
        t = [a[r * 36:(r + 1) * 36, c * 64:(c + 1) * 64] for r in range(3) for c in range(3)]
        d = max(float(np.abs(x - t[0]).mean()) for x in t[1:])
        return d < 12 and d < 0.5 * float(a.std())
    for k in range(1, len(fr) - 1):
        if tiled(k):
            bad.add(k)
            continue
        for w in (1, 2, 3, 4):
            if k + w >= len(fr):
                continue
            jump, back = D(k, k - 1), D(k - 1, k + w)
            if jump > 10 and back < jump * 0.25 and D(k + w, k + w - 1) > 10:
                bad.update(range(k, k + w))
                break
    return sorted(bad)


# --resume: 이미 찍어 둔 프레임을 쓰고 깨진 것만 다시 (뒤에 프레임 번호를 주면 그 범위도 다시 찍음, 예: --resume 19400-19531)
resume = "--resume" in sys.argv
if resume and frames_dir.exists():
    rng = [a for a in sys.argv if "-" in a and a[0].isdigit()]
    if rng:
        a, b = map(int, rng[0].split("-"))
        for f in range(a, b + 1):
            run(*tools.remotion(), "still", "src/index.ts", comp, str(frames_dir / f"element-{f:05d}.jpeg"), f"--frame={f}", *SHOT)
else:
  if frames_dir.exists():
    shutil.rmtree(frames_dir)
  frames_dir.mkdir(parents=True)
  print("1) 프레임 렌더", flush=True)
  run(*tools.remotion(), "render", "src/index.ts", comp, str(frames_dir), "--sequence", "--concurrency=6", *SHOT)
  # 리모션은 자릿수를 전체 길이에 맞춰 붙이므로 5자리로 통일
  for f in frames_dir.glob("element-*.jpeg"):
      n = int(f.stem.split("-")[1])
      f.replace(frames_dir / f"element-{n:05d}.jpeg")  # replace: 윈도우 rename은 같은 이름이 있으면 오류

for round_ in range(1, 6):
    bad = bad_frames()
    print(f"{round_ + 1}) 깨진 프레임 {len(bad)}장", flush=True)
    if not bad:
        break
    for f in bad:
        run(*tools.remotion(), "still", "src/index.ts", comp, str(frames_dir / f"element-{f:05d}.jpeg"), f"--frame={f}", *SHOT)
else:
    sys.exit("5번 다시 찍어도 깨진 프레임이 남음 - 멈춤")

print("소리 렌더 + 합치기", flush=True)
wav = frames_dir / "audio.wav"
# 긴 소리 렌더는 동시 처리가 많으면 가끔 한 프레임에서 멈춰 시간 초과가 난다 - 3개로 줄이고 한 번 더 시도
for attempt in range(2):
    try:
        run(*tools.remotion(), "render", "src/index.ts", comp, str(wav), "--codec=wav", "--timeout=120000", "--concurrency=3", *PROPS)
        break
    except subprocess.CalledProcessError:
        if attempt:
            raise
# 소리 마감: -14 LUFS (scripts/loudness.py) - 더빙 트랙도 같은 기준
run(sys.executable, "-I", "scripts/loudness.py", str(wav), str(frames_dir / "audio-mastered.wav"))
wav = frames_dir / "audio-mastered.wav"
run(*tools.remotion(), "ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(frames_dir / "element-%05d.jpeg"), "-i", str(wav),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", str(CODE / out))
shutil.rmtree(frames_dir)
print(f"→ {out}")
