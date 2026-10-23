# 화면 움직임 검사 (토큰 없음) - 찍은 연속 그림(지도 장면)에서 실제로 화면이 얼마나 빨리 바뀌는지 잰다
# 2026-10-23 사용자: "38~44초 말들의 이동이 또 너무 빠르다" - map-scene.mjs의 속도 검사는 부대 가운데만 재서
#   병사 쏠림·쓰러짐·먼지·카메라 줌을 놓쳤다. 이 검사는 결과 그림 자체를 본다
# .venv/bin/python -I scripts/check-motion.py public/ep/<편>/maps/<장면> [--fps 30] [--limit 3.0] [--offset 초(영상 안 시작 시각)]
# 1초 창마다 연속 프레임 밝기 차이 평균(0~255)을 재서, 한도를 넘는 구간을 영상 시각으로 알려 준다. 넘으면 exit 1
# 한도 3.0 (세로 270x480으로 줄여 잼): 사용자가 괜찮다고 본 구간 2.3~2.8, "너무 빠르다"고 한 38~44초가 3.8~4.6 (칼카 예고편 6)
import sys
from pathlib import Path
import numpy as np
from PIL import Image

args = sys.argv[1:]
d = Path(args[0])
opt = lambda k, v: float(args[args.index(k) + 1]) if k in args else v
fps, limit, offset = opt("--fps", 30), opt("--limit", 3.0), opt("--offset", 0)
files = sorted(d.glob("[0-9]*.jpg"))
if len(files) < 2:
    sys.exit(f"그림 없음: {d}")
prev, diffs = None, []
for f in files:
    im = np.asarray(Image.open(f).convert("L").resize((270, 480) if Image.open(f).height > Image.open(f).width else (480, 270)), dtype=np.float32)
    if prev is not None:
        diffs.append(float(np.abs(im - prev).mean()))
    prev = im
w = int(fps)
bad = []
for i in range(0, len(diffs) - w, w // 2):
    m = sum(diffs[i : i + w]) / w
    if m > limit:
        bad.append((offset + i / fps, offset + (i + w) / fps, m))
med = sorted(diffs)[len(diffs) // 2]
print(f"화면 움직임: 프레임 {len(files)}장, 중간값 {med:.2f}, 최대 1초 평균 {max(sum(diffs[i:i+w])/w for i in range(0, len(diffs)-w)):.2f} (한도 {limit})")
for a, b, m in bad:
    print(f"  {a:5.1f}~{b:5.1f}초: {m:.2f} - 너무 빠름. 그 구간의 이동·쓰러짐·카메라 줌을 늘리거나 줄일 것 (02 속도·간격·멈춤)")
sys.exit(1 if bad else 0)
