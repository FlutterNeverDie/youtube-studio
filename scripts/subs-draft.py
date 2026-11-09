# 장 초안 편의 자막(.srt) - 줄 시작 시각을 src/draft/kit.tsx와 같은 식으로 계산하고, 목소리 조각(cues)마다 끊어 화면에 맞춘다 (2026-11-03 2편)
#   python3 scripts/subs-draft.py episodes/mongol-02 <폴더> [언어...]   (언어 없으면 voice 파일이 있는 언어 전부)
# kit.tsx와 맞춰야 하는 것: FPS 30 · GAP 10 · CARD 66 · 카드 없는 장(0장, NO_CARD) · 끝 15 · 2편 slot = max(en, ko)
# 확인: 장 프레임 합 + 엔딩이 영상 프레임 수와 같아야 함 (다르면 멈춤)
import json, math, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ep = ROOT / sys.argv[1]
folder = Path(sys.argv[2]).expanduser()
FPS, GAP, CARD = 30, 10, 66
NO_CARD = {"3", "4"}  # kit.tsx NO_CARD (m2.3·m2.4)
ENDING = 600  # M02Ch5 ENDING_FRAMES
VIDEO_FRAMES = 15879  # 올린 2편 영어 1440p
LANG_KO = {"en": "영어", "ko": "한국어", "es": "스페인어", "pt": "포르투갈어", "hi": "힌디어", "id": "인도네시아어"}
LIM = {"ko": 24, "hi": 38}
vdir = ROOT / "public/ep" / ep.name / "draft"
lines = json.loads((ep / "draft/lines.json").read_text())
V = {"ko": json.loads((vdir / "voice.json").read_text())}
for f in vdir.glob("voice-*.json"):
    d = json.loads(f.read_text())
    if d:
        V[f.stem[6:]] = d
langs = sys.argv[3:] or list(V)
slot = lambda i: max(V["en"][i]["sec"], V["ko"][i]["sec"])

start, t = {}, 0
for ch in "012345":
    ls = [l for l in lines if l["ch"] == ch]
    a = 0 if ch == "0" or ch in NO_CARD else CARD
    for l in ls:
        start[l["id"]] = t + a
        a += math.ceil(slot(l["id"]) * FPS) + GAP + round(l.get("hold", 0) * FPS)
    t += a + 15
if t + ENDING != VIDEO_FRAMES:
    sys.exit(f"계산한 길이 {t + ENDING} ≠ 영상 {VIDEO_FRAMES}프레임 - kit.tsx와 식이 달라짐")


def stamp(fr):
    s = fr / FPS
    return f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round((s % 1) * 1000)):03d}"


folder.mkdir(parents=True, exist_ok=True)
for lang in langs:
    cues = []
    for l in lines:
        i = l["id"]
        v = V[lang][i]
        rate = max(1.0, v["sec"] / slot(i))
        txt = l["tts"] if lang == "ko" else v["text"]
        txt = re.sub(r"⏸[\d.]*", "", txt)
        parts = [p.strip() for p in re.split(r"//|/", txt) if p.strip()]
        cs = v.get("cues") or [0.0]
        if len(cs) != len(parts):  # 조각 수가 다르면 줄 하나로
            parts, cs = [" ".join(parts)], [0.0]
        ends = cs[1:] + [v["sec"]]
        # 짧은 조각은 다음 조각과 합쳐 한 화면 (한 화면 = 두 줄까지), 초 → 영상 프레임 (rate만큼 빨라짐)
        lim, line = LIM.get(lang, 42) * 2, []
        for p, a, b in zip(parts, cs, ends):
            if line and len(line[-1][2]) + len(p) + 1 <= lim:
                line[-1] = (line[-1][0], b, line[-1][2] + " " + p)
            else:
                line.append((a, b, p))
        cues += [(start[i] + round(a / rate * FPS), start[i] + round(b / rate * FPS), c) for a, b, c in line]
    body = "\n".join(f"{k}\n{stamp(a)} --> {stamp(b)}\n{c}\n" for k, (a, b, c) in enumerate(cues, 1))
    out = folder / f"자막_{LANG_KO[lang]}.srt"
    out.write_text(body)
    print(f"자막 {lang}: {out} ({len(cues)}개)")
