# 검수용 초안: 한국어 검수본(script-ko.md)의 장을 줄 데이터로 뽑고 목소리를 만든다
# 대본 줄 끝의 ⏸초 = 그 줄 뒤 멈춤(극적인 순간을 천천히, 02 1장 피드백)
# 문장 안의 / = 숨 쉬는 자리: 거기서 목소리를 끊어 따로 만들고 0.3초 쉼을 넣어 잇는다(// 는 0.6초). 화면·검사용 text에서는 / 를 뺀다 (2026-10-26 사용자: 숨쉬기 타이밍)
#   .venv/bin/python -I scripts/draft-lines.py episodes/mongol-01 1 2 3 [--lang=en]
#   → episodes/<편>/draft/lines.json (장·줄 번호·화면 지시·배역·대사) + public/ep/<편>/draft/<id>.wav, voice.json(길이)
#   장 번호 없이 부르면 lines.json을 그대로 읽기만 한다 (더빙만 새로 만들 때 - 2026-10-26: 넘긴 장만으로 lines.json을 다시 쓰던 사고 방지)
#     .venv/bin/python -I scripts/draft-lines.py episodes/mongol-01 --lang=pt [--ch=0,3,4,5]  (그 장들만)
#   줄 길이(slot)는 en·ko·es로 정해져 있다 (src/draft/kit.tsx). 그 밖의 언어(pt·hi·id …)는 끝에 rate = 길이/slot을 계산해 1.15 넘는 줄을 알려 준다 → 번역을 줄여 다시
# 내레이터는 Chirp(cast.json: Algenib 1.02, 음 낮춤 없음(11-09)), 인물 대사는 cast.json 배역(Gemini 연기) - audio/voice_episode.py의 make_line 그대로
import json
import re
import sys

import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "audio"))
import cast as C  # noqa: E402
import voice_episode as V  # noqa: E402

# 인물 이름(대본) → (캐릭터 그림 id, 배역)
SPEAKERS = {
    "타이치우드 족장": ("taichiud_chief", "villain"),
    "테무친": ("temujin_young", "hero"),
    "자무카": ("jamukha", "schemer"),
    "궁수": ("jebe", "general"),  # 진지하게 (2026-10-26 사용자: "제가 쐈습니다 너무 웃겨, 엄근하게")
    "칭기즈칸": ("genghis", "king"),
    "금나라 사신": ("archer", "messenger"),
    "토그릴": ("toghrul", "sage"),
    "예수게이": ("yesugei", "commoner"),  # 1장 7판(2026-10-26): 숨을 거두며 "테무친을 데려와라"
    "호엘룬": ("hoelun", "mother"),
    "타타르 사람": (None, "schemer"),  # 1장 8판(2026-10-27): 실루엣으로 속삭임 "저자가 예수게이다"
    "수색꾼": (None, "sage"),  # 1장 8판: 테무친을 숨겨 준 남자(실제 소르칸 시라), 얼굴 없이 늙은 목동
    "제베": ("jebe", "general"),  # 1편 5장(2026-10-27): 원정 전 회의 - 후계자 질문 (실제로는 예수이, 비사 254절)
    "수부타이": ("subutai", "sage"),  # 1편 5장: 앞뒤로 적을 두게 된다는 걱정
}

ep = ROOT / sys.argv[1]
chapters = {a for a in sys.argv[2:] if not a.startswith("--")}
md = (ep / "script-ko.md").read_text() if chapters else ""
lines, ch, shot = ([], None, "") if chapters else (json.loads((ep / "draft/lines.json").read_text()), None, "")
for raw in md.splitlines():
    m = re.match(r"^## (\d+)\.", raw)
    if m:
        ch = m.group(1)
        continue
    if ch not in chapters:
        continue
    if raw.startswith("▶"):
        shot = raw[1:].strip()
        continue
    m = re.match(r"^(N|[^:\s][^:]{0,12}):\s*(.+)$", raw)
    if not m:
        continue
    who = m.group(1)
    hold = sum(float(h) for h in re.findall(r"⏸\s*([\d.]+)", m.group(2)))  # 극적인 순간: 이 줄 뒤 멈춤(초)
    text = re.sub(r"\[[^\]]*\]|😏(\([^)]*\))?|⏸\s*[\d.]+", "", m.group(2)).strip()
    if not text:
        continue
    char, role = (None, "narrator") if who == "N" else SPEAKERS[who]
    n = sum(1 for x in lines if x["ch"] == ch) + 1
    tts = text
    text = re.sub(r"\s*/+\s*", " ", text).strip()
    lines.append({"id": f"c{ch}_{n:02d}", "ch": ch, "who": who, "char": char, "role": role, "text": text, "tts": tts, "shot": shot, "hold": hold})
# 넘긴 장만 새로 뽑고 나머지 장은 기존 lines.json 그대로 둠 (2026-11-03: "0 2 3 4"만 넘겼더니 1·5장이 lines.json에서 통째로 사라짐)
_old = ep / "draft/lines.json"
if chapters and _old.exists():
    _keep = [x for x in json.loads(_old.read_text()) if x["ch"] not in chapters]
    lines = sorted(_keep + lines, key=lambda x: (int(x["ch"]), x["id"]))

out = ROOT / "public/ep" / ep.name / "draft"
out.mkdir(parents=True, exist_ok=True)


# 목소리가 문장 안에서 혼자 오래 끊는 곳 (2026-11-02 사용자: "자기 나라 사람들을 / 향해서 중간 텀이 너무 길어" - 대본엔 쉼이 없는데
# 무료 목소리가 "사람들을" 뒤를 1.2초 끊어 읽음. 낱말을 바꾸면 사라짐 ("바로 자기 나라 사람들을 향해서였습니다")) → 조각(/ 사이) 안의 가장 긴 무음(초)
GAP_MAX = 0.7


def inner_gap(y, sr):
    a = np.abs(y.astype(float)) if y.ndim == 1 else np.abs(y.astype(float)).mean(axis=1)
    k = max(1, int(sr * 0.02))
    e = np.array([np.sqrt((a[i:i + k] ** 2).mean()) for i in range(0, len(a) - k, k)])
    if not len(e) or e.max() == 0:
        return 0.0
    loud = np.where(e > e.max() * 0.04)[0]
    if len(loud) < 2:
        return 0.0
    quiet = e[loud[0]:loud[-1]] <= e.max() * 0.04  # 앞뒤 무음은 빼고 말소리 사이만
    best = run = 0
    for q in quiet:
        run = run + 1 if q else 0
        best = max(best, run)
    return best * 0.02


def squeeze_gaps(y, sr, keep=0.35, limit=0.6):
    """자동 고침: 조각 안에서 limit초 넘게 끊긴 무음을 keep초로 줄임 (앞뒤 무음은 그대로) - 낱말을 안 바꿔도 됨"""
    a = np.abs(y.astype(float)) if y.ndim == 1 else np.abs(y.astype(float)).mean(axis=1)
    k = max(1, int(sr * 0.02))
    e = np.array([np.sqrt((a[i:i + k] ** 2).mean()) for i in range(0, len(a) - k, k)])
    if not len(e) or e.max() == 0:
        return y
    th = e.max() * 0.04
    loud = np.where(e > th)[0]
    if len(loud) < 2:
        return y
    cut, run0 = [], None
    for i in range(loud[0], loud[-1] + 1):
        if e[i] <= th and run0 is None:
            run0 = i
        if e[i] > th and run0 is not None:
            if (i - run0) * 0.02 > limit:
                mid = (run0 + i) // 2
                half = int(keep / 0.02 / 2)
                cut.append(((run0) * k, (mid - half) * k))
                cut.append(((mid + half) * k, i * k))
            run0 = None
    if not cut:
        return y
    keepmask = np.ones(len(y), bool)
    for a0, a1 in cut:
        keepmask[a0:a1] = False
    return y[keepmask]


def speak(role, tts, lang, wav, key):
    """한 줄 목소리: / 자리에서 끊어 0.3초 쉼을 넣고 이음 → (초, 엔진, 속도)"""
    r = dict(C.CAST[role])
    if role == "narrator":
        r["rate"] = 1.02  # 2026-10-26 사용자: "전체적으로 5% 정도 느리게" (1.07 → 1.02)
    parts = re.split(r"\s*(/+)\s*", tts)  # [조각, 구분자, 조각, ...]
    ys, engines, gap, cues, n = [], [], 0.0, [], 0
    for k in range(0, len(parts), 2):
        y, sr, engine = V.make_line(r, parts[k], lang, V.RAW / f"draft-{key}-{lang}-{k // 2}.wav")
        y = squeeze_gaps(y, sr)  # 2026-11-02 사용자 "하네스로 수정 못 해?" → 알리기만 하지 않고 자동으로 줄임
        cues.append(round(n / sr, 3))
        n += len(y) + (int(sr * 0.3 * len(parts[k + 1])) if k + 1 < len(parts) else 0)
        ys.append(y)
        engines.append(engine)
        gap = max(gap, inner_gap(y, sr))
        if k + 1 < len(parts):
            ys.append(np.zeros(int(sr * 0.3 * len(parts[k + 1])), dtype=y.dtype))
    y = np.concatenate(ys)
    wav.parent.mkdir(parents=True, exist_ok=True)
    C.write(wav, y, sr)
    return {"sec": round(len(y) / sr, 2), "text": tts, "rate": r.get("rate"), "voice": voice_stamp(role), "engine": "+".join(dict.fromkeys(engines)), "gap": round(gap, 2), "cues": cues}


def cues_of(tts, key, lang):
    """예전에 만든 줄의 조각 시작 시각(초) - 조각 원본(audio/.ep-raw)에서 다시 잼 (speak와 같은 계산)"""
    parts = re.split(r"\s*(/+)\s*", tts or "")
    cues, n, sr = [], 0, 24000
    for k in range(0, len(parts), 2):
        raw = V.RAW / f"draft-{key}-{lang}-{k // 2}.wav"
        if not raw.exists():
            return None
        y, sr = C.read(raw)
        y = squeeze_gaps(y, sr)
        cues.append(round(n / sr, 3))
        n += len(y) + (int(sr * 0.3 * len(parts[k + 1])) if k + 1 < len(parts) else 0)
    return cues


def rate_of(role):
    return 1.02 if role == "narrator" else C.CAST[role].get("rate")


def voice_stamp(role):
    r = C.CAST[role]
    return f"{r['voice'].split('-')[-1]}{r.get('pitch', 0):+d}"


# --revoice: 목소리 설정이 바뀐 내레이터 줄도 다시 만듦. 기본은 안 함 - 이미 올라간 편의 옛 목소리를 실수로 바꾸지 않게 (2026-11-06)
REVOICE = "--revoice" in sys.argv


# 언어: 한국어(검수본) + 있는 번역 episodes/<편>/draft/i18n-<언어>.json (영어 기본 트랙·더빙 - 2026-10-26 사용자: 기본은 영어)
langs = {"ko": None}
for f in sorted((ep / "draft").glob("i18n-*.json")):
    langs[f.stem.split("-", 1)[1]] = json.loads(f.read_text())
only = [a.split("=", 1)[1] for a in sys.argv if a.startswith("--lang=")]
for lang, tr in langs.items():
    if only and lang not in only:
        continue
    vpath = out / ("voice.json" if lang == "ko" else f"voice-{lang}.json")
    voice = json.loads(vpath.read_text()) if vpath.exists() else {}
    # --ch=0,3,4,5: 그 장들만 (2026-10-27 새 1편은 1·2장을 안 씀 - 번역 없는 1장 8판 줄에서 멈추고, 안 쓰는 장 목소리를 매번 다시 만들었음)
    use = next((set(a.split("=", 1)[1].split(",")) for a in sys.argv if a.startswith("--ch=")), None)
    items = [(x["id"], x["role"], x["tts"] if lang == "ko" else tr.get(x["id"])) for x in lines if not use or x["ch"] in use]
    if tr:  # 훅 5줄도 (public/hook/<편 줄임>/<언어>/)
        items += [(k, "narrator", v) for k, v in tr.items() if k.startswith("hook_")]
    for id_, role, tts in items:
        if not tts:
            sys.exit(f"{lang} {id_} 대사 없음")
        wav = (out / f"{id_}.wav") if lang == "ko" else (out / lang / f"{id_}.wav")
        old = voice.get(id_, {})
        if old.get("text") != tts or old.get("rate") != rate_of(role) or not wav.exists() or (REVOICE and role == "narrator" and old.get("voice") != voice_stamp(role)):  # 글자나 속도가 바뀌면 다시
            voice[id_] = speak(role, tts, lang, wav, f"{ep.name}-{id_}")
            print(f"{lang} {id_} {voice[id_]['sec']:5.2f}s {role:9s} {voice[id_]['engine']:22s} {tts[:40]}", flush=True)
    for id_, role, tts in items:  # 예전에 만든 줄도 잼 (조각 원본 audio/.ep-raw)
        if id_ in voice and "gap" not in voice[id_]:
            g = 0.0
            for k in range(len(re.split(r"\s*/+\s*", tts or ""))):
                raw = V.RAW / f"draft-{ep.name}-{id_}-{lang}-{k}.wav"
                if raw.exists():
                    yy, ss = C.read(raw)
                    g = max(g, inner_gap(yy, ss))
            voice[id_]["gap"] = g
    # 조각 시작 시각 (2026-11-03 사용자: "왜 한국어 기준으로 해놨어? 영어로 해야지") - 화면이 언어마다 목소리 조각에 맞춰 움직이게 (kit.tsx tl)
    for id_, role, tts in items:
        if id_ in voice and "cues" not in voice[id_]:
            c = cues_of(tts, f"{ep.name}-{id_}", lang)
            if c is not None:
                voice[id_]["cues"] = c
    vpath.write_text(json.dumps(voice, ensure_ascii=False, indent=1))
    long_gaps = [(i, v["gap"]) for i, v in voice.items() if v.get("gap", 0) > GAP_MAX and (not use or any(x["id"] == i and x["ch"] in use for x in lines))]
    for i, g in long_gaps:
        print(f"!! {lang} {i} 목소리가 문장 안에서 {g:.1f}초 끊김 - 낱말을 바꿔 다시 만들 것 (예: 앞에 '바로'·쉼표 위치 바꾸기)", flush=True)
    if lang == "ko":
        ko_voice = voice
if chapters:
    (ep / "draft/lines.json").write_text(json.dumps(lines, ensure_ascii=False, indent=1))
# 새로 만든 줄도 목소리 크기 맞춤(-20 LUFS, 가벼운 압축) - 2026-10-27 사용자 "음성이 약간 작은 듯" (scripts/voice-level.py, 이미 맞춘 파일은 건너뜀)
import subprocess  # noqa: E402
subprocess.run([sys.executable, "-I", str(ROOT / "scripts/voice-level.py"), str(out), *[str(d) for d in out.iterdir() if d.is_dir() and not d.name.startswith("_")]], check=True)
voice = json.loads((out / "voice.json").read_text())
tot = sum(voice[x["id"]]["sec"] for x in lines)
print(f"{len(lines)}줄, 목소리 합계 {tot:.0f}초")

# 줄 길이가 정해진 뒤 더한 언어: rate = 그 언어 길이 / slot (slot = max(en, ko, es/1.12) - kit.tsx와 같음, 훅의 한국어는 public/hook/m01/voice.json)
MAX_RATE = 1.15
hook_ko = json.loads((ROOT / "public/hook/m01/voice.json").read_text()) if (ROOT / "public/hook/m01/voice.json").exists() else {}
base = {l: json.loads((out / f"voice-{l}.json").read_text()) for l in ("en", "es") if (out / f"voice-{l}.json").exists()}  # 2편 초안은 한국어만 (2026-11-02)
# 2편부터는 영어·한국어로만 줄 길이를 정하고 영상을 올린 뒤 스페인어를 더함 → es도 rate 검사 대상, slot에서 빠짐 (kit.tsx slotSec, 2026-11-03)
ES_IN_SLOT = ep.name == "mongol-01"
for lang in langs:
    if lang in ("ko", "en") or (lang == "es" and ES_IN_SLOT) or (only and lang not in only):
        continue
    vl = json.loads((out / f"voice-{lang}.json").read_text())
    rows = []
    for id_, s in vl.items():
        ko_sec = hook_ko[id_[5:]]["sec"] if id_.startswith("hook_") else voice[id_]["sec"]  # voice = 한국어 voice.json
        slot = max(base["en"][id_]["sec"], ko_sec, base["es"][id_]["sec"] / 1.12 if ES_IN_SLOT else 0)
        rows.append((s["sec"] / slot, id_))
    over = sorted([r for r in rows if r[0] > MAX_RATE], reverse=True)
    print(f"{lang}: 최대 rate {max(rows)[0]:.3f} ({max(rows)[1]}), {MAX_RATE} 넘는 줄 {len(over)}개" + ("".join(f"\n  {i} {r:.3f}" for r, i in over)))
