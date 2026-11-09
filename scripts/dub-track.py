# 더빙 트랙 한 언어 만들기 (2026-11-03 2편: draft-final.py dubs는 1편 장 구조 계산이라 2편(카드 없는 장·tl)과 안 맞음 → 컴포지션 길이로 확인)
#   .venv/bin/python -I scripts/dub-track.py <컴포지션> <언어> <영상.mp4>  → out/<영상 이름>.<언어>.wav
#   목소리·배경(브금+효과음)을 따로 렌더 → stem-mix.py(목소리 나올 때 배경을 눌러 섞음) → -14 LUFS → 길이가 영상과 0.1초 안인지 확인
import json, os, subprocess, sys, wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tools  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
comp, lang, video = sys.argv[1], sys.argv[2], sys.argv[3]
base = Path(video).with_suffix("")
v, raw = (f"{base}.{lang}.{k}.wav" for k in ("voice", "raw"))
out = f"{base}.{lang}.wav"
py = [sys.executable, "-I"]


def sh(*a):
    subprocess.run([str(x) for x in a], check=True, cwd=ROOT)


# 배경(효과음)은 본편 언어(영어)로: 장면 안 효과음 시각이 렌더 언어의 목소리 조각을 따라가는데(tl), 화면은 영어 기준이라
# 배경까지 더빙 언어로 렌더하면 칼 소리·불 소리가 영어 화면과 어긋남 (2026-11-03)
MAIN = os.environ.get("MAIN_LANG", "en")
# 브금 줄임(duck)은 더빙 목소리에 맞춰야 해서(영어 목소리가 끝난 뒤 브금이 커지면 긴 더빙 대사가 묻힘) 배경도 언어마다 렌더 - props duck=<언어>
b = f"{base}.{lang}.bed.wav"
for stem, f, props in (("voice", v, {"lang": lang, "stem": "voice"}), ("bed", b, {"lang": MAIN, "stem": "bed", "duck": lang})):
    sh(*tools.remotion("render", "src/index.ts", comp, f, "--codec=wav", "--timeout=120000", "--concurrency=3", f"--props={json.dumps(props)}"))
sh(*py, "scripts/stem-mix.py", v, b, raw)
sh(*py, "scripts/loudness.py", raw, out)
for f in (v, b, raw):
    os.remove(ROOT / f)
dur = float(subprocess.run([*tools.remotion("ffprobe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True, cwd=ROOT).stdout.strip() or 0)
with wave.open(str(ROOT / out)) as w:
    got = w.getnframes() / w.getframerate()
if dur and abs(got - dur) > 0.1:
    sys.exit(f"{lang} 트랙 {got:.2f}초 ≠ 영상 {dur:.2f}초")
print(f"{lang} 트랙 {got:.2f}초 (영상 {dur:.2f}초) → {out}")
