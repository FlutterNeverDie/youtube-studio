# 목소리 크기 맞추기 (2026-10-27 사용자: "비지엠·효과음에 비해 음성이 약간 작은 듯, 잘되는 유튜브랑 비교해 봐")
# 재 보니 TTS 줄이 -24 LUFS로 브금 곡(-14)보다 10dB 작아, 말 사이 브금이 올라오면 목소리와 거의 같았다. 별별역사는 목소리를 눌러(압축) 빽빽하게 씀
# → 줄마다 가볍게 압축한 뒤 -20 LUFS(최고점 -1.5 dBTP)로 맞춘다. 길이는 그대로라 화면 타이밍은 안 바뀜
# .venv/bin/python -I scripts/voice-level.py <wav 폴더...>   (이미 맞춘 파일은 levels.json에 적혀 건너뜀, 원본은 <폴더>/_raw/에 보관)
import json, re, shutil, subprocess, sys, wave
import numpy as np
from pathlib import Path

CODE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(CODE / "scripts"))
import tools  # noqa: E402

TARGET, TP = -20.0, -1.5


def compress(x, sr, thr_db=-24.0, ratio=2.5, att=0.005, rel=0.08):
    """가벼운 압축 (렌더 도구의 ffmpeg엔 acompressor가 없어 직접): 소리 크기 곡선을 따라 thr 넘는 만큼 1/ratio로 줄임"""
    a, r = np.exp(-1 / (att * sr)), np.exp(-1 / (rel * sr))
    lvl = np.abs(x).max(axis=1) if x.ndim > 1 else np.abs(x)
    env = np.empty_like(lvl)
    e = 0.0
    for i, v in enumerate(lvl):  # 줄 하나 몇 초라 그냥 돌려도 됨
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        env[i] = e
    db = 20 * np.log10(env + 1e-9)
    g = 10 ** (-np.maximum(0, db - thr_db) * (1 - 1 / ratio) / 20)
    return x * (g[:, None] if x.ndim > 1 else g)


def read(p):
    w = wave.open(str(p))
    ch, sr = w.getnchannels(), w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return (x.reshape(-1, ch) if ch > 1 else x), sr, ch


def write(p, x, sr, ch):
    w = wave.open(str(p), "wb")
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def ff(*a):
    return subprocess.run([*tools.remotion(), "ffmpeg", "-hide_banner", "-nostats", *a], cwd=CODE, capture_output=True, text=True, check=True)


for d in map(Path, sys.argv[1:]):
    log_p = d / "levels.json"
    log = json.loads(log_p.read_text()) if log_p.exists() else {}
    raw = d / "_raw"
    n = 0
    for w in sorted(d.glob("*.wav")):
        st = w.stat()
        if log.get(w.name) == st.st_mtime_ns:
            continue
        raw.mkdir(exist_ok=True)
        shutil.copy2(w, raw / w.name)  # 새로 만든 줄이면 원본을 새로 보관
        tmp = w.with_suffix(".tmp.wav")
        x, sr, ch = read(raw / w.name)
        write(tmp, compress(x, sr), sr, ch)
        m = json.loads(re.findall(r"\{[^{}]*\}", ff("-i", str(tmp), "-af", f"loudnorm=I={TARGET}:TP={TP}:print_format=json", "-f", "null", "-").stderr)[-1])
        gain = TARGET - float(m["input_i"])
        gain = min(gain, TP - float(m["input_tp"]))  # 최고점 넘지 않게
        y, sr, ch = read(tmp)
        write(w, y * 10 ** (gain / 20), sr, ch)
        tmp.unlink()
        log[w.name] = w.stat().st_mtime_ns
        n += 1
    log_p.write_text(json.dumps(log, indent=0))
    print(f"{d}: {n}개 맞춤")
