# 장 초안(src/draft)으로 만든 편의 마감 재료 (2026-10-26): 전체 타임라인 · 언어별 자막(.srt) · 업로드 정보(uploads/<편>.json)
#   python3 scripts/draft-final.py episodes/mongol-01 timeline     → out/draft-sheets/timeline-<편>-full.json (render-checked.py용 장면 경계)
#   python3 scripts/draft-final.py episodes/mongol-01 subs <폴더> [--lang=pt,hi,id]   → <폴더>/자막_<언어 한글>.srt (LANGS 전부, 또는 고른 언어만)
#   python3 scripts/draft-final.py episodes/mongol-01 dubs [--lang=pt,hi,id]   → out/<편>.<언어>.wav 더빙 트랙(-14 LUFS), 영상 길이와 같은지 확인
#   python3 scripts/draft-final.py episodes/mongol-01 texts <폴더> [--lang=pt,hi,id]   → <폴더>/제목 설명_<언어 한글>.txt (스튜디오에 붙여 넣을 제목+설명 전문)
#   python3 scripts/draft-final.py episodes/mongol-01 upload <영상 경로(~/ReStory 기준)> [썸네일 경로...]  → uploads/<편>.json
#   python3 scripts/draft-final.py episodes/mongol-01 run [--from 번호] [--no-upload]   ← 마감 전부 한 번에 (사용자가 시작을 정한 뒤에만)
#     1 대본·화면 검사 → 2 1440p 영어 본편(깨진 프레임 다시 찍기) → 3 깜빡임 검사(.checked) → 4 더빙 트랙(LANGS의 en 밖 전부, -14 LUFS)
#     → 5 자막(LANGS 전부) → 6 산출물 폴더로 복사 → 7 업로드 정보 → 8 비공개 업로드 (meta.json에 youtubeId가 있으면 다시 안 올림)
# 언어는 LANGS 한 곳에서 (2026-10-26 pt·hi·id 추가). 줄 길이(slot)는 BASE(en·ko·es)로만 정한다 - 영상이 이미 나간 뒤 더한 언어는 그 길이 안에 rate로 들어감
# 시간 계산은 src/draft/kit.tsx·src/hook/Mongol01Hook.tsx와 같다: 줄 길이 = 영어·한국어 중 긴 쪽(스페인어는 12%까지 빠르게) + 쉼 10 + 멈춤,
# 장 = 카드 40 + 줄들 + 15 (+ 장 파일의 ENDING_FRAMES: 편 끝 10초 엔딩, 1편은 5장 +300), 훅 = 앞 12 + 줄들 + 끝 30. 바꾸면 양쪽을 같이 바꿀 것 (안 맞으면 timeline이 컴포지션 길이와 달라 멈춤)
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS, GAP, CARD, SPEEDUP = 30, 10, 66, 1.12  # CARD는 kit.tsx와 같게 (2026-10-27 40→66)
ep = ROOT / sys.argv[1]
cmd = sys.argv[2]
name = ep.name
prefix = "M" + re.sub(r"[^0-9r]", "", name).upper().zfill(2)  # mongol-01r → M01R
lines = json.loads((ep / "draft/lines.json").read_text())
vdir = ROOT / "public/ep" / name / "draft"
LANGS = ["en", "ko", "es", "pt", "hi", "id"]  # en = 본편 기본 트랙, 나머지 = 더빙
BASE = ["en", "ko"] if name in ("mongol-02", "mongol-01r") else ["en", "ko", "es"]  # 줄 길이를 정하는 언어 (kit.tsx slotSec와 같음)
LANG_KO = {"en": "영어", "ko": "한국어", "es": "스페인어", "pt": "포르투갈어", "hi": "힌디어", "id": "인도네시아어"}
V = {"ko": json.loads((vdir / "voice.json").read_text())}
TR = {}
for l in LANGS[:]:
    if l == "ko":
        continue
    if not (vdir / f"voice-{l}.json").exists() or not (ep / f"draft/i18n-{l}.json").exists():
        if l in BASE:
            sys.exit(f"{l} 목소리·번역 없음")
        LANGS.remove(l)  # 아직 안 만든 더빙 언어는 건너뜀
        continue
    V[l] = json.loads((vdir / f"voice-{l}.json").read_text())
    TR[l] = json.loads((ep / f"draft/i18n-{l}.json").read_text())
_pick = [a.split("=", 1)[1].split(",") for a in sys.argv if a.startswith("--lang=")]
PICK = [l for l in LANGS if not _pick or l in _pick[0]]  # --lang=pt,hi,id 로 고른 언어
HOOK = json.loads((ROOT / "public/hook/m01/voice.json").read_text())  # 한국어 훅 n1~n5
KEYS = ["n1", "n2", "n3", "n4", "n5"]


def sec(id_, lang):
    if id_.startswith("hook_") and lang == "ko":
        return HOOK[id_[5:]]["sec"]
    return V[lang][id_]["sec"]


def slot(id_):
    if name in ("mongol-02", "mongol-01r"):  # kit.tsx slotSec와 같음: 이 편들은 영어·한국어로만 정함
        return max(sec(id_, "en"), sec(id_, "ko"))
    return max(sec(id_, "en"), sec(id_, "ko"), sec(id_, "es") / SPEEDUP)


def rate(id_, lang):
    return max(1.0, sec(id_, lang) / slot(id_))


def text(id_, lang):
    if lang == "ko":
        t = HOOK[id_[5:]]["text"] if id_.startswith("hook_") else next(l["tts"] for l in lines if l["id"] == id_)
    else:
        t = TR[lang][id_]
    return re.sub(r"\s*/+\s*", " ", t).strip()


def short_n4(id_):
    m = json.loads((ep / "meta.json").read_text()).get("structure") or {}
    return m.get("hook") == "short" and id_ == "hook_n4"


# ---------- 편 전체의 줄 시각 (프레임) ----------
parts = []  # (이름, 시작 프레임, 길이, [(줄 id, 시작 프레임)], [장면 경계(편 기준)])
_meta0 = json.loads((ep / "meta.json").read_text())
STRUCT = _meta0.get("structure")  # 새 1편(2026-10-27): {"hook": "short", "after": "c0_01", "chapters": "345"} - src/draft/M01Ep.tsx와 같은 계산
SHORT_Q = math.ceil(1.96 * FPS)  # Mongol01Hook.tsx Q_SEC 가장 긴 값 (ko 1.96초)
Q_SEC = {"ko": 1.96, "en": 1.88, "es": 1.48, "pt": 1.51, "hi": 1.34, "id": 0.87}  # 언어별 n4 질문이 끝나는 초 (자막은 질문까지만)
t = 0
st, cuts = [], [0]
a = 12
NO_HOOK = bool(STRUCT and STRUCT.get("hook") == "none")  # 금나라 1부(2026-11-06): 0장이 곧 훅이라 따로 훅이 없다 - src/draft/M01REp.tsx와 같은 계산
keys = [] if NO_HOOK else KEYS[:4] if STRUCT and STRUCT.get("hook") == "short" else KEYS
starts = []
for k in keys:
    starts.append(t + a)
    st.append((f"hook_{k}", t + a))
    cuts.append(t + a)
    a += math.ceil(slot(f"hook_{k}") * FPS) + GAP
if STRUCT and STRUCT.get("hook") == "short":
    after = STRUCT.get("after")
    st.append((after, starts[3] + SHORT_Q + 12))  # AFTER_GAP 12
    hook_len = starts[3] + SHORT_Q + (12 + math.ceil(slot(after) * FPS) + 30 if after else 22)
else:
    hook_len = a + 30
if NO_HOOK:
    hook_len = 0
else:
    parts.append(("hook", 0, hook_len, st, cuts))
t = hook_len
for ch in (STRUCT or {}).get("chapters", "12345"):
    ls = [l for l in lines if l["ch"] == ch]
    if not ls:
        continue
    src = (ROOT / f"src/draft/{prefix}Ch{ch}.tsx").read_text()
    firsts = {(re.findall(r'"(c\d+_\d+)"', g) or [f"c{ch}_{int(re.search(r'id\((\d+)\)', g).group(1)):02d}"])[0] for g, _ in re.findall(r"\{\s*ids:\s*\[([^\]]*)\]\s*,\s*Shot:\s*(\w+)", src)}
    card = 0 if ch in (STRUCT or {}).get("no_card", "") else CARD  # kit.tsx cardOf·NO_CARD와 같음
    a, st, cuts = card, [], ([t] if not card else [t, t + card - 4, t + card + 14])  # 카드 + 카드가 첫 장면 위에서 사라지는 겹침
    for l in ls:
        st.append((l["id"], t + a))
        if l["id"] in firsts:
            cuts.append(t + a)
        a += math.ceil(slot(l["id"]) * FPS) + GAP + round(l.get("hold", 0) * FPS)
    m = re.search(r"export const ENDING_FRAMES = (\d+)", src)  # 편 끝 고정 엔딩 (check-draft.py와 같음)
    ending = int(m.group(1)) if m else (STRUCT or {}).get("ending_frames", {}).get(ch, 0)  # 다른 파일의 ENDING_FRAMES를 가져다 쓰는 장
    if ending:
        cuts.append(t + a + 15)
    parts.append((f"ch{ch}", t, a + 15 + ending, st, cuts))
    t += a + 15 + ending
TOTAL = t

if cmd == "timeline":
    bounds = sorted({c for p in parts for c in p[4]} | {TOTAL})
    out = ROOT / "out/draft-sheets" / f"timeline-{name}-full.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"fps": FPS, "scenes": [{"frames": y - x, "show": {"type": "draft"}} for x, y in zip(bounds, bounds[1:])]}))
    print(f"타임라인: {out.relative_to(ROOT)} (총 {TOTAL}프레임 = {TOTAL / FPS / 60:.2f}분)")


def stamp(fr, sep=","):
    s = fr / FPS
    return f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d}{sep}{int(round((s % 1) * 1000)):03d}"


SUB_LIM = {"ko": 24, "hi": 38}  # 한 줄 글자 수: 한국어 24, 힌디어(데바나가리, 모음 기호까지 셈) 38, 나머지(라틴 문자) 42


def split(txt, lang):
    """화면 자막 한 덩어리가 길면 문장·쉼표에서 둘로 (영어·스페인어·포르투갈어·인도네시아어 42자, 힌디어 38자, 한국어 24자 안팎이 한 줄)"""
    lim = SUB_LIM.get(lang, 42)
    if len(txt) <= lim * 2:
        return [txt]
    cut = [m.end() for m in re.finditer(r"[.!?…,:;।] ", txt) if 0.2 * len(txt) < m.end() < 0.8 * len(txt)]  # 양 끝 짧은 조각은 눈 깜빡할 새 지나감
    best = min(cut, key=lambda c: abs(c - len(txt) / 2)) if cut else len(txt) // 2
    return [txt[:best].strip(), txt[best:].strip()]


if cmd == "subs":
    folder = Path(sys.argv[3]).expanduser()
    folder.mkdir(parents=True, exist_ok=True)
    meta = json.loads((ep / "meta.json").read_text())
    for lang in PICK:
        cues = []
        for p in parts:
            for id_, fr in p[3]:
                dur = math.ceil(sec(id_, lang) / rate(id_, lang) * FPS)
                txt = text(id_, lang)
                if short_n4(id_):  # 짧은 훅: n4는 첫 질문까지만 들림
                    dur = math.ceil(Q_SEC.get(lang, 1.96) / rate(id_, lang) * FPS)
                    txt = re.split(r"(?<=[?？।])\s", txt)[0]
                chunks = split(txt, lang)
                n = sum(len(c) for c in chunks)
                at = fr
                for c in chunks:
                    d = round(dur * len(c) / n)
                    cues.append((at, at + d, c))
                    at += d
        body = "\n".join(f"{i}\n{stamp(a)} --> {stamp(b)}\n{c}\n" for i, (a, b, c) in enumerate(cues, 1))
        out = folder / f"자막_{LANG_KO[lang]}.srt"  # 편 폴더 안이라 편 이름 앞머리 없음 (2026-10-26 사용자)
        out.write_text(body)
        print(f"자막 {lang}: {out} ({len(cues)}개)")

def ts(fr):
    s = int(fr / FPS)
    return f"{s // 60}:{s % 60:02d}"


def describe(meta, lang):
    """meta.json langs.<언어> → 유튜브 제목·설명(훅 문단, 장 시각, 더 보기, 출처, 해시태그)·태그"""
    m = meta["langs"][lang]
    chap = "\n".join(f"{ts(p[1])} {c}" for p, c in zip(parts, m["chapters"]))
    desc = "\n\n".join([m["hook"], chap, m.get("more", "") + "\n" + m.get("ai_note", ""), m.get("sources_title", "Sources:") + "\n" + "\n".join(meta["sources"]), " ".join(m.get("hashtags", []))])
    return {"title": m["title"], "description": desc.strip(), "tags": m.get("tags", meta["langs"]["en"].get("tags", []))}


if cmd == "texts":  # 이미 올린 영상에 언어를 더할 때: 스튜디오에 붙여 넣을 제목+설명 (API로 안 바꿈)
    folder = Path(sys.argv[3]).expanduser()
    folder.mkdir(parents=True, exist_ok=True)
    meta = json.loads((ep / "meta.json").read_text())
    for lang in [l for l in PICK if l in meta["langs"]]:
        d = describe(meta, lang)
        out = folder / f"제목 설명_{LANG_KO[lang]}.txt"
        out.write_text(f"[제목]\n{d['title']}\n\n[설명]\n{d['description']}\n\n[태그]\n{', '.join(d['tags'])}\n")
        print(f"제목·설명: {out}")

if cmd == "upload":
    meta = json.loads((ep / "meta.json").read_text())
    video, thumbs = sys.argv[3], sys.argv[4:]
    starts = [p[1] for p in parts]
    loc = {lang: describe(meta, lang) for lang in meta["langs"] if not _pick or lang in _pick[0]}  # --lang=en: 그 언어만 (2026-10-27 새 1편은 영어로 먼저 올리고 다국어는 나중에 교체)
    up = {"video": video, "thumbs": thumbs, "categoryId": "27", "defaultLanguage": "en", "localizations": loc}
    out = ROOT / "uploads" / f"{name}.json"
    out.write_text(json.dumps(up, ensure_ascii=False, indent=1))
    print(f"업로드 정보: {out.relative_to(ROOT)} (장 시각 {', '.join(ts(s) for s in starts)})")

if cmd in ("run", "dubs"):
    import os
    import shutil
    import subprocess
    import time

    sys.path.insert(0, str(ROOT / "scripts"))
    import tools

    meta = json.loads((ep / "meta.json").read_text())
    comp = f"Mongol{re.sub(r'[^0-9r]', '', name).zfill(2)}-" + ("Ep" if STRUCT else "Draft")  # 새 구조(짧은 훅 + 3~5장)는 M01Ep
    out = f"out/{name}.mp4"
    tl = f"out/draft-sheets/timeline-{name}-full.json"
    home = tools.hwm_home()
    folder = home / meta["folder"]
    first = int(sys.argv[sys.argv.index("--from") + 1]) if "--from" in sys.argv else 1
    py = [str(tools.python()), "-I"]

    def sh(*a):
        print("  $ " + " ".join(map(str, a)), flush=True)
        subprocess.run(list(map(str, a)), cwd=ROOT, check=True)

    def dubs():
        # 더빙 트랙: 언어마다 컴포지션을 소리만 렌더 → -14 LUFS → 길이가 영상(TOTAL 프레임)과 같은지 확인
        import wave

        for lang in [l for l in PICK if l != "en"]:
            # 목소리·배경(브금+효과음) 두 갈래로 렌더 → stem-mix.py(목소리 나올 때 배경을 눌러 섞음) → -14 LUFS (2026-10-27, 본편과 같은 섞기)
            v, b, raw = (f"out/{name}.{lang}.{k}.wav" for k in ("voice", "bed", "raw"))
            for stem, f in (("voice", v), ("bed", b)):
                sh(*tools.remotion("render", "src/index.ts", comp, f, "--codec=wav", "--timeout=120000", "--concurrency=3", f"--props={json.dumps({'lang': lang, 'stem': stem})}"))
            sh(*py, "scripts/stem-mix.py", v, b, raw)
            sh(*py, "scripts/loudness.py", raw, f"out/{name}.{lang}.wav")
            for f in (v, b, raw):
                os.remove(ROOT / f)
            with wave.open(str(ROOT / f"out/{name}.{lang}.wav")) as w:
                got = w.getnframes() / w.getframerate()
            if abs(got - TOTAL / FPS) > 0.1:
                sys.exit(f"{lang} 트랙 {got:.2f}초 ≠ 영상 {TOTAL / FPS:.2f}초")
            print(f"  {lang} 트랙 {got:.2f}초 (영상 {TOTAL / FPS:.2f}초)")

    if cmd == "dubs":
        dubs()
        sys.exit()

    def deliver():
        # 예전 1편 폴더(같은 편 이름, 다른 부제)는 '예전'으로 옮겨 둔다 - 지우지 않음
        for old in folder.parent.glob(meta["folder"].split("/")[-1].split(" - ")[0] + " - *"):
            if old != folder:
                (folder.parent / "예전").mkdir(exist_ok=True)
                shutil.move(str(old), str(folder.parent / "예전" / old.name))
                print(f"  옛 폴더 → 예전/{old.name}")
        d = json.loads((ROOT / "deliver.json").read_text())
        d["items"] = [i for i in d["items"] if not i["src"].startswith((f"out/{name}.", f"out/thumbs/{name}-"))]
        # 편 폴더 안 이름: 영상_<날짜>.mp4, 더빙_<언어>.wav (2026-10-26 사용자: 편 이름 앞머리 빼기)
        d["items"] += [{"src": out, "dir": meta["folder"], "name": "영상", "nodate": False}]
        d["items"] += [{"src": f"out/{name}.{l}.wav", "dir": meta["folder"], "name": f"더빙_{LANG_KO[l]}", "nodate": True} for l in LANGS if l != "en"]
        (ROOT / "deliver.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
        sh(tools.node(), "scripts/deliver.mjs")

    def upload():
        if "--no-upload" in sys.argv:
            return print("  업로드 건너뜀 (--no-upload)")
        m = json.loads((ep / "meta.json").read_text())
        if m.get("youtubeId"):
            return print(f"  이미 올림: {m['youtubeId']} - 다시 안 올림")
        sh(tools.node(), "scripts/youtube.mjs", "upload", out, f"uploads/{name}.json")

    steps = [
        ("대본·화면 검사", lambda: (sh(sys.executable, "scripts/check-draft.py", f"episodes/{name}"),
                                  # AI 티 · 번역투 (2026-11-09): 지금은 알리기만 (--report), 사용자가 확인하면 막는 검사로
                                  sh(sys.executable, "scripts/check-lines.py", f"episodes/{name}", *([f"uploads/{name}.json"] if (ROOT / f"uploads/{name}.json").exists() else []), "--report"))),
        ("1440p 본편 렌더", lambda: (sh(sys.executable, __file__, f"episodes/{name}", "timeline"), sh(*py, "scripts/render-checked.py", comp, tl, out))),
        ("깜빡임 검사", lambda: sh(sys.executable, "scripts/check-draft.py", f"episodes/{name}", "--video", out)),  # 한두 프레임만 튀었다 돌아오는 것만 (check-flicker는 초안의 장면 안 컷을 오탐)
        ("더빙 트랙", dubs),
        ("자막", lambda: sh(sys.executable, __file__, f"episodes/{name}", "subs", folder)),
        ("산출물 폴더", deliver),
        ("업로드 정보", lambda: sh(sys.executable, __file__, f"episodes/{name}", "upload", f"{meta['folder']}/{meta['name']}.mp4", *meta.get("thumbs", [])[:1])),
        ("비공개 업로드", upload),
    ]
    t0 = time.time()
    for i, (label, fn) in enumerate(steps, 1):
        if i < first:
            continue
        print(f"[{i}/{len(steps)}] {label}  ({(time.time() - t0) / 60:.0f}분 지남)", flush=True)
        try:
            fn()
        except subprocess.CalledProcessError as e:
            sys.exit(f"[{i}] {label}에서 멈춤 (종료 코드 {e.returncode}) - 고친 뒤 --from {i}")
    print(f"끝 ({(time.time() - t0) / 60:.0f}분) → {folder}")
