# 목소리·배경(브금+효과음) 따로 렌더한 두 갈래를 섞으며, 목소리 나오는 동안 배경을 눌러 목소리가 안 묻히게 (사이드체인)
# 2026-10-27 사용자: "전체적으로 효과음에 소리가 안 묻히게" - 브금은 Remotion에서 이미 줄지만 효과음(북·쾅·말발굽)은 대사 중에도 그대로였다
#   .venv/bin/python -I scripts/stem-mix.py <voice.wav> <bed.wav> <출력.wav>        섞기 + 검사 결과
#   .venv/bin/python -I scripts/stem-mix.py <voice.wav> <bed.wav> --check            섞지 않고 가리는 곳만 (하네스)
# 렌더: Remotion 컴포지션에 props stem="voice" / stem="bed" (src/draft/kit.tsx Snd)
# 규칙: 목소리가 나오는 50ms 칸마다 배경이 목소리보다 GAP dB 이상 작아야 함. 넘는 만큼만 줄이고(30ms에 줄고 300ms에 돌아옴) 목소리 없을 땐 손대지 않음
import sys
import wave

import numpy as np

GAP = 10.0  # 목소리 - 배경 최소 차이 (dB)
VOICE_ON = -35.0  # 이보다 큰 50ms 칸 = 또렷한 말소리 (dBFS). 2026-10-27 -45였을 때 첫 숨·말끝까지 목소리로 쳐서 배경을 30dB 눌러 "브금이 1초 들리다 끊김"
HOP = 0.05
MAX_RED = 12.0  # 아무리 커도 이만큼까지만 줄임 (dB) - 큰 효과음은 충분히 낮추고 음악은 안 사라지게 (30 → 12, 2026-10-27)


def read(p):
    w = wave.open(p)
    ch, sr = w.getnchannels(), w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    x = x.reshape(-1, ch)
    return (np.repeat(x, 2, 1) if ch == 1 else x), sr


def levels(x, hop):
    n = len(x) // hop
    return 10 * np.log10((x[: n * hop] ** 2).mean(axis=1).reshape(n, hop).mean(axis=1) + 1e-12)


def smooth(g, att, rel):
    """줄일 땐 att초, 돌아올 땐 rel초 (칸 단위)"""
    a, r = np.exp(-HOP / att), np.exp(-HOP / rel)
    out, e = np.empty_like(g), 0.0
    for i, v in enumerate(g):
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        out[i] = e
    return out


v, sr = read(sys.argv[1])
b, sr2 = read(sys.argv[2])
assert sr == sr2, "두 갈래의 샘플레이트가 다름"
n = min(len(v), len(b))
v, b = v[:n], b[:n]
hop = int(sr * HOP)
lv0, lb0 = levels(v, hop), levels(b, hop)
# 0.45초 창으로 봄 - 50ms 칸 그대로면 낱말 사이 틈마다 "가림"으로 잡혀 배경이 출렁임(펌핑)
W = 4
pad = lambda a, val: np.concatenate([np.full(W, val), a, np.full(W, val)])
lv = np.max(np.lib.stride_tricks.sliding_window_view(pad(lv0, -120.0), 2 * W + 1), axis=1)  # 목소리: 창 안 가장 큰 값
lb = 10 * np.log10(np.mean(10 ** (np.lib.stride_tricks.sliding_window_view(pad(lb0, -120.0), 2 * W + 1) / 10), axis=1))  # 배경: 창 안 평균 힘
on = lv0 > VOICE_ON  # 실제로 목소리가 나는 칸만 (창 최댓값으로 정하면 말 시작 0.2초 전 효과음까지 눌림)
over = np.where(on, np.maximum(0, lb - (lv - GAP)), 0)  # 얼마나 줄여야 하나 (dB)
bad = np.flatnonzero(over > 3)


def spans(idx):
    out = []
    for i in idx:
        if out and i - out[-1][1] <= 4:
            out[-1][1] = i
        else:
            out.append([i, i])
    return out


hits = [sp for sp in spans(bad) if sp[1] - sp[0] >= 2]
print(f"목소리 나오는 동안 배경이 목소리를 가리는 곳 (차이 {GAP:.0f}dB 미만, 3dB 넘게): {len(hits)}곳")
for a, c in hits[:15]:
    print(f"  {a * HOP // 60:.0f}:{a * HOP % 60:05.2f} ~ {(c + 1) * HOP:.2f}초  최대 {over[a:c + 1].max():.1f}dB 넘침")
if "--check" in sys.argv:
    sys.exit(0)

win = lambda x: 10 * np.log10(np.mean(10 ** (np.lib.stride_tricks.sliding_window_view(pad(x, -120.0), 2 * W + 1) / 10), axis=1))
# 줄일 양을 몇 번 다듬음: 창 단위로 잰 넘침만큼 줄이고 → 줄인 배경으로 다시 재서 남은 만큼 더 (부드럽게 줄이다 보니 한 번엔 덜 줄어듦)
def gain_of(red):
    g = 10 ** (-np.repeat(red, hop) / 20)
    return np.concatenate([g, np.full(n - len(g), 1.0)])[:, None]


red = np.zeros_like(over)
for _ in range(10):
    rest = np.where(on, np.maximum(0, win(levels(b * gain_of(red), hop)) - (lv - GAP)), 0)
    if rest.max() < 1:
        break
    red = np.minimum(MAX_RED, smooth(red + np.maximum(rest, np.append(rest[2:], [0, 0])), 0.08, 0.5))
gain = gain_of(red)
mix = v + b * gain
peak = np.abs(mix).max()
if peak > 0.99:
    mix *= 0.99 / peak
lb2 = win(levels(b * gain, hop))
left_db = np.where(on, np.maximum(0, lb2 - (lv - GAP)), 0)
left = [sp for sp in spans(np.flatnonzero(left_db > 3)) if sp[1] - sp[0] >= 2]  # 0.1초 넘게 남은 곳만 (말 시작 한 칸은 줄이는 중)
w = wave.open(sys.argv[3], "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(sr)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
w.close()
print(f"섞음 → {sys.argv[3]} (눌러 준 뒤 남은 곳 {len(left)}, 가장 많이 줄인 곳 {red.max():.1f}dB)")
for a, c in left[:5]:
    print(f"  남음 {a * HOP:.2f}~{(c + 1) * HOP:.2f}초 {left_db[a:c + 1].max():.1f}dB")
sys.exit(1 if left else 0)
