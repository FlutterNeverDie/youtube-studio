# 브금 뚝 끊김 검사 (2026-10-26 사용자: "브금이 웅장하다가 뚝 끊기는 게 영상들에 있는데 하네스로 잡아줘")
#   .venv/bin/python -I scripts/check-bgm-cut.py <영상.mp4|소리.wav> [--from 초] [--to 초]
# 본편·장 초안에서 브금은 처음부터 끝까지 깔려 있어야 한다(목소리 아래로 줄어들 뿐). 그래서
#   오류 - 뚝 끊김: 소리가 있던 자리(앞 0.5초 중앙값 > -38dBFS)에서 0.2초 안에 거의 무음(< -52dBFS)으로 떨어져 0.4초 넘게 이어짐
#   오류 - 빈 자리: 영상 처음 1초·마지막 1초를 뺀 곳에서 거의 무음이 1.5초 넘게 이어짐 (곡이 장보다 짧아 끝나 버린 경우)
# 원인: 곡 길이(70~107초)가 장(3~4분)보다 짧은데 반복하지 않음, 장이 바뀔 때 페이드 없이 끊음 - 고친 곳은 src/draft/kit.tsx Bgm
# 1로 끝나면 사용자에게 보여 주지 말고 고칠 것
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tools  # noqa: E402

SR, HOP = 16000, 0.05
LOUD, SILENT = -38.0, -52.0


def levels(path):
    raw = subprocess.run([*tools.remotion(), "ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", "-f", "wav", "-"], capture_output=True, check=True).stdout
    y = np.frombuffer(raw[44:], dtype=np.int16).astype(np.float32) / 32768  # Remotion ffmpeg엔 raw(s16le) 출력이 없어 wav 머리 44바이트를 떼고 읽음
    n = int(SR * HOP)
    y = y[: len(y) // n * n].reshape(-1, n)
    return 20 * np.log10(np.sqrt((y ** 2).mean(axis=1)) + 1e-9)


def find(db, t0=0.0, t1=None):
    k = lambda s: int(round(s / HOP))  # noqa: E731
    end = len(db) if t1 is None else min(len(db), k(t1))
    out = []
    i = max(k(t0), k(0.5))
    while i < end - k(0.6):
        before = np.median(db[i - k(0.5): i])
        after = db[i: i + k(0.6)]
        if before > LOUD and np.all(after[k(0.2):] < SILENT) and after[: k(0.2)].min() < SILENT:
            out.append(("뚝 끊김", i * HOP, f"앞 {before:.0f}dB → 무음"))
            i += k(2)
            continue
        i += 1
    # 빈 자리 (처음·끝 1초 제외)
    quiet = db < SILENT
    i, a, b = 0, max(k(t0), k(1)), end - k(1)
    j = a
    while j < b:
        if quiet[j]:
            s = j
            while j < b and quiet[j]:
                j += 1
            if (j - s) * HOP >= 1.5:
                out.append(("빈 자리", s * HOP, f"{(j - s) * HOP:.1f}초 무음"))
        j += 1
    return sorted(out, key=lambda r: r[1])


if __name__ == "__main__":
    a = sys.argv[1:]
    t0 = float(a[a.index("--from") + 1]) if "--from" in a else 0.0
    t1 = float(a[a.index("--to") + 1]) if "--to" in a else None
    rows = find(levels(a[0]), t0, t1)
    for kind, t, why in rows:
        print(f"  오류 - {kind} {int(t // 60)}:{t % 60:04.1f} ({why})")
    print(f"브금 끊김 검사: 오류 {len(rows)}")
    sys.exit(1 if rows else 0)
