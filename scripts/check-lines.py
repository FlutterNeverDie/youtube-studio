# 대사 AI 티 · 번역투 검사 (규칙만, LLM 없음) - 장 초안 · 업로드 정보 · Openology 쇼츠 공통 (2026-11-09)
#   python3 scripts/check-lines.py episodes/mongol-02                 장 초안 (draft/lines.json 한국어 + draft/i18n-<언어>.json)
#   python3 scripts/check-lines.py uploads/mongol-02.json             업로드 제목 · 설명 · 태그 (localizations)
#   python3 scripts/check-lines.py ~/Documents/GitHub/openology/shorts/01b-diabetes-v3
#                                                                     쇼츠 (cuts.json · script.json · onetake*/lines.json · desc_<언어>.txt)
#   [--selftest]  번역투 짝 규칙 예문 시험
#   [--lang=ko,en]  고른 언어만    [--report]  알리기만 하고 늘 종료 코드 0    [--strict]  경고도 종료 코드 1
#   기본 종료 코드: 오류(error) 규칙이 걸리면 1, 경고(warn)만이면 0
# 한 줄 규칙은 docs/guide/locales/<언어>.rules.json (scripts/langrules.py lint) - check-text.py가 ep.json에 쓰는 것과 같은 규칙
# 여러 줄 검사는 여기서 (한 줄씩 보는 규칙으로는 못 잡는 것):
#   x-same-opener  이어진 두 문장이 같은 접속어·같은 두 낱말로 시작 ("Mas … / Mas …", "E assim … / Assim, …", "~면, … / ~면, …")
#   x-same-ending  세 문장 연달아 끝맺음이 같음 ("~넣은 것입니다 / 버린 것입니다 / 쳐들어간 것입니다")
#   x-hedge-run    이어진 두 문장에 어림말 ("한 티스푼 정도 / 열 배쯤", "about … / roughly …") - 숫자는 한 번, 딱 잘라
#   x-hook-echo    처음 두 문장과 마지막 두 문장이 같은 말 ("X isn't just Y" 훅을 끝에서 되풀이)
#   overuse 규칙(편 단위 횟수)은 줄마다가 아니라 문서마다 한 번만 알림
# 업로드에서만: up-tags-english(영어 태그 그대로), up-en-century("13th c."), up-title-same(제목이 영어 그대로)
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import langrules as L  # noqa: E402

LANGS = ["en", "ko", "es", "pt", "hi", "id"]

# 문장 첫머리 접속어 (같은 것이 두 문장 연달아 나오면 경고). "and" 류는 떼고 다음 낱말로 비교 ("E assim" = "Assim")
AND = {"en": {"and"}, "es": {"y"}, "pt": {"e"}, "id": {"dan"}, "hi": {"और"}, "ko": {"그리고"}}
CONNECT = {
    "en": {"but", "so", "yet", "then", "if", "because", "now", "still", "here's"},
    "es": {"pero", "así", "entonces", "si", "aun", "porque", "luego"},
    "pt": {"mas", "assim", "então", "se", "só", "aí", "porque", "depois"},
    "id": {"tapi", "jadi", "lalu", "namun", "kalau", "jika", "karena", "makanya", "sementara"},
    "hi": {"पर", "लेकिन", "तो", "अगर", "फिर", "इसलिए", "क्योंकि"},
    "ko": {"하지만", "그런데", "그러나", "그래서", "그러자", "그런데도", "결국"},
}
HEDGE = {
    "en": r"\b(?:about|around|roughly|nearly|almost|approximately)\s+(?:\$?\d|one|two|three|four|five|six|seven|eight|nine|ten|half|a\b)",
    "es": r"\b(?:alrededor de|unos|unas|aproximadamente|casi|cerca de)\s+\d",
    "pt": r"\b(?:cerca de|uns|umas|aproximadamente|quase|por volta de)\s+\d",
    "id": r"\b(?:sekitar|kurang lebih|hampir|kira-kira)\b",
    "hi": r"(?:लगभग|क़रीब|करीब)",
    "ko": r"(?:정도|쯤|약\s?\d|거의)",
}
SENT = re.compile(r"(?<=[.!?…।])\s+")


def clean(t):
    """TTS 숨표(/ //)와 겹친 빈칸을 빼고, 힌디어 누크타는 NFC로 (규칙은 분해형 기준 - NFC가 분해형을 만듦)"""
    t = re.sub(r"\s*/+\s*", " ", t or "").strip()
    return unicodedata.normalize("NFC", t)


def words(s):
    return re.findall(r"[\w\u0900-\u0963\u0966-\u097F'’-]+", s.lower())  # 데바나가리 모음 기호는 \w가 아니라 따로 (। ॥는 뺌)


LISTY = re.compile(r"^\s*(?:[-•*#]|\d{1,2}:\d{2}|https?://)|https?://|\bPMC\d|\bdoi\b", re.I)


def desc_rows(name_of, paragraphs):
    """설명란 줄: 소리 내어 읽지 않으니 scope "desc"(발음 규칙 · 명사 조각 검사 뺌), 출처 · 해시태그 · 타임스탬프 줄은 건너뜀"""
    return [(name_of(k), clean(p), "desc") for k, p in enumerate(paragraphs) if p.strip() and not LISTY.search(p)]


# ---------- 읽어 들이기: 문서 = (이름, 언어, [(줄 id, 글, scope)]) ----------
def from_draft(ep):
    docs = []
    lines = json.loads((ep / "draft/lines.json").read_text())
    docs.append((f"{ep.name} 장 초안", "ko", [(x["id"], clean(x["text"]), "narration" if x.get("who") == "N" else "dialogue") for x in lines]))
    who = {x["id"]: x.get("who") for x in lines}
    for f in sorted((ep / "draft").glob("i18n-*.json")):
        lang = f.stem.split("-", 1)[1]
        tr = json.loads(f.read_text())
        order = [x["id"] for x in lines if x["id"] in tr] + [k for k in tr if k not in who]
        docs.append((f"{ep.name} 장 초안", lang, [(k, clean(tr[k]), "narration" if who.get(k, "N") == "N" else "dialogue") for k in order if isinstance(tr[k], str)]))
    return docs, []


def from_upload(path):
    d = json.loads(path.read_text())
    base = d.get("defaultLanguage", "en")
    locs = d.get("localizations") or {}
    docs, extra = [], []
    en = locs.get(base) or {}
    en_tags = {t.lower() for t in en.get("tags", [])}
    for lang, m in locs.items():
        rows = [("title", clean(m.get("title", "")), "narration")]
        rows += desc_rows(lambda k: f"description.{k}", (m.get("description") or "").split("\n"))
        docs.append((f"{path.name} 업로드", lang, rows))
        if lang == base:
            continue
        tags = m.get("tags") or []
        same = [t for t in tags if t.lower() in en_tags]
        if tags and len(same) >= 0.6 * len(tags):
            extra.append((path.name, lang, "tags", "warn", "up-tags-english", f"태그 {len(same)}/{len(tags)}개가 영어 그대로 - 그 나라 사람이 검색하는 말로", ", ".join(same[:5])))
        for k, p in enumerate((m.get("description") or "").split("\n")):
            for mm in re.finditer(r"\b\d{1,2}(?:st|nd|rd|th) c(?:\.|entury)", p):
                extra.append((path.name, lang, f"description.{k}", "warn", "up-en-century", "영어 세기 표기 그대로 - 그 언어 표기로 (siglo XIII · século XIII · abad ke-13 · 13वीं सदी · 13세기)", mm.group(0)))
        if m.get("title") and m.get("title") == en.get("title"):
            extra.append((path.name, lang, "title", "warn", "up-title-same", "제목이 기본 언어 그대로", m["title"]))
    return docs, extra


def rows_from_json(obj):
    """id와 언어별 글(en/ko/…)이 있는 칸을 순서대로 모음 (cuts · lines · cards 형식을 가리지 않음)"""
    out = []
    if isinstance(obj, dict):
        if "id" in obj and any(isinstance(obj.get(l), str) for l in LANGS):
            out.append(obj)
        for v in obj.values():
            out += rows_from_json(v)
    elif isinstance(obj, list):
        for v in obj:
            out += rows_from_json(v)
    return out


def from_openology(sd):
    docs = []
    files = [sd / n for n in ("cuts.json", "script.json") if (sd / n).exists()]
    files += sorted(sd.glob("*/lines.json"))
    for f in files:
        rows = rows_from_json(json.loads(f.read_text()))
        name = f"{sd.name}/{f.relative_to(sd)}"
        for lang in LANGS:
            if lang == "id":
                continue  # 컷 칸 "id"는 컷 번호 - 인도네시아어 대사가 아님 (2026-11-10 버그: c01을 인니어로 검사)
            r = [(x["id"], clean(x[lang]), "narration") for x in rows if isinstance(x.get(lang), str) and x[lang].strip()]
            if r:
                docs.append((name, lang, r))
    for f in sorted(sd.glob("desc_*.txt")):
        lang = f.stem.split("_", 1)[1]
        docs.append((f"{sd.name}/{f.name}", lang, desc_rows(lambda k: f"줄 {k + 1}", f.read_text().split("\n"))))
    return docs, []


def load_target(arg):
    p = Path(arg).expanduser()
    if not p.is_absolute() and not p.exists():
        p = L.CODE / arg
    p = p.resolve()
    if p.is_file() and p.parent.name == "uploads":
        return from_upload(p)
    if p.is_dir() and (p / "draft/lines.json").exists():
        return from_draft(p)
    if p.is_dir() and any((p / n).exists() for n in ("cuts.json", "script.json")) or p.is_dir() and list(p.glob("*/lines.json")):
        return from_openology(p)
    sys.exit(f"알 수 없는 대상: {arg} (episodes/<편> · uploads/<편>.json · openology shorts/<편> 폴더)")


# ---------- 검사 ----------
def opener_key(sent, lang):
    w = words(sent)
    if w and w[0] in AND.get(lang, ()) and len(w) > 1:
        w = w[1:]
    return w


def multi_line(doc_lang, rows):
    """여러 줄 검사 → [(줄 id, 규칙, 메시지, 맞은 글)]"""
    sents = []
    for lid, text, scope in rows:
        if scope not in ("narration", "desc"):
            continue
        for s in L.sentences(text):
            sents.append((lid, s))
    out = []
    hedge = re.compile(HEDGE[doc_lang], re.I) if doc_lang in HEDGE else None
    for k in range(1, len(sents)):
        (a_id, a), (b_id, b) = sents[k - 1], sents[k]
        ka, kb = opener_key(a, doc_lang), opener_key(b, doc_lang)
        if ka and kb and ka[0] == kb[0] and ka[0] in CONNECT.get(doc_lang, ()):
            out.append((b_id, "x-same-opener", f"앞 문장({a_id})과 같은 접속어 '{kb[0]}'로 시작 - 영어 But/So를 줄마다 옮긴 티. 하나는 빼거나 바꾸기", b))
        elif len(ka) >= 3 and len(kb) >= 3 and ka[:2] == kb[:2]:
            out.append((b_id, "x-same-opener", f"앞 문장({a_id})과 같은 두 낱말 '{' '.join(kb[:2])}'로 시작 - 기계적인 대구", b))
        elif doc_lang == "ko" and re.search(r"[가-힣]면,", a) and re.search(r"[가-힣]면,", b):
            out.append((b_id, "x-same-opener", f"앞 문장({a_id})과 같은 틀 '~면, ~' 연달아 - 하나는 문장 모양을 바꾸기", b))
        if hedge and hedge.search(a) and hedge.search(b):
            out.append((b_id, "x-hedge-run", f"앞 문장({a_id})에 이어 또 어림말 '{hedge.search(b).group(0)}' - 숫자는 한 번, 딱 잘라", b))
    for k in range(2, len(sents)):
        ends = [words(s)[-1:] if doc_lang == "ko" else words(s)[-2:] for _, s in sents[k - 2 : k + 1]]
        if ends[0] and ends[0] == ends[1] == ends[2] and (doc_lang != "ko" or ends[0][0] not in ("있습니다", "입니다")):
            out.append((sents[k][0], "x-same-ending", f"세 문장 연달아 같은 끝맺음 '{' '.join(ends[0])}' - 문장 모양을 하나 바꾸기", sents[k][1]))
    if len(sents) >= 8:
        cw = lambda ss: {w for s in ss for w in words(s) if len(w) >= (2 if doc_lang in ("ko", "hi") else 4)}
        head, tail = cw(s for _, s in sents[:2]), cw(s for _, s in sents[-2:])
        shared = head & tail
        if len(shared) >= 3 and len(shared) >= 0.4 * min(len(head), len(tail)):
            out.append((sents[-1][0], "x-hook-echo", f"끝 두 문장이 처음 두 문장을 되풀이 ({', '.join(sorted(shared)[:5])}) - 요약으로 끝맺는 AI 티, 새 말로 끝내기", sents[-1][1]))
    return out


# ---------- 번역투 짝 검사 (2026-11-10): 원문과 번역문을 나란히 놓고 "영어를 그대로 옮긴 흔적"을 잡는다 ----------
# 규칙 파일 docs/guide/locales/calque/<원문>-<번역>.json: 원문 정규식(src)과 번역문 정규식(tgt)이 같은 묶음에서 둘 다 맞을 때만 걸림
#   (번역문만 보는 규칙보다 오탐이 적다 - "~까지 갑니다"는 원문이 "lasts … to"일 때만 직역으로 본다)
# 편 단위 통계: x-mirror(문장 수 · 끊는 자리가 원문과 거의 같음 = 한 줄씩 옮김), x-fragment(원문 조각 문장을 번역도 조각으로),
#   x-ko-style(한국어 "의" · 대명사 · 수동 비율이 사람 대본 기준(금나라 1부)보다 크게 높음)
CALQUE_DIR = L.RULES_DIR / "calque"
SENT_END = re.compile(r'[.?!…]["\')”’]?$')


def load_calque(src, tgt):
    f = CALQUE_DIR / f"{src}-{tgt}.json"
    if not f.exists():
        return []
    rules = json.loads(f.read_text())["rules"]
    for r in rules:
        r["_s"] = re.compile(r["src"], re.I | re.M)
        r["_t"] = re.compile(r["tgt"], re.M)
    return rules


def calque_hits(rules, s, t):
    out = []
    for r in rules:
        if r["_s"].search(s):
            m = r["_t"].search(t)
            if m:
                out.append((r, m.group(0)))
    return out


def group_rows(rows, src):
    """원문 문장이 끝나는 곳까지 줄을 묶음 (Openology 컷은 한 문장이 여러 컷에 걸침)"""
    groups, cur = [], []
    for x in rows:
        if not isinstance(x.get(src), str) or not x[src].strip():
            continue
        cur.append(x)
        if SENT_END.search(clean(x[src])):
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    return groups


def pairs_for(arg):
    """→ [(문서 이름, 원문 언어, 번역 언어, [(묶음 id, 원문, 번역)])]"""
    p = Path(arg).expanduser()
    if not p.is_absolute() and not p.exists():
        p = L.CODE / arg
    p = p.resolve()
    out = []
    if p.is_dir() and (p / "draft/lines.json").exists():  # 몽골 장편: 한국어가 원문, 다른 언어는 영어에서
        lines = json.loads((p / "draft/lines.json").read_text())
        tr = {f.stem.split("-", 1)[1]: json.loads(f.read_text()) for f in (p / "draft").glob("i18n-*.json")}
        if "en" in tr:
            out.append((f"{p.name} 장 초안", "ko", "en", [(x["id"], clean(x["text"]), clean(tr["en"].get(x["id"], ""))) for x in lines if tr["en"].get(x["id"])]))
            for lang, t in tr.items():
                if lang != "en":
                    out.append((f"{p.name} 장 초안", "en", lang, [(x["id"], clean(tr["en"][x["id"]]), clean(t[x["id"]])) for x in lines if tr["en"].get(x["id"]) and t.get(x["id"])]))
        meta = p / "meta.json"  # 제목 · 훅(설명 첫 단락) · 장 제목도 짝으로 (2026-11-10: 장 제목 "Cruzando el desierto"가 대사 검사에선 안 잡힘)
        if meta.exists():
            langs = json.loads(meta.read_text()).get("langs") or {}
            en = langs.get("en") or {}
            for lang, m in langs.items():
                if lang == "en":
                    continue
                rows = [(k, clean(en[k]), clean(m[k])) for k in ("title", "hook") if isinstance(en.get(k), str) and isinstance(m.get(k), str)]
                rows += [(f"chapter.{i}", clean(a), clean(b)) for i, (a, b) in enumerate(zip(en.get("chapters") or [], m.get("chapters") or [])) if isinstance(a, str) and isinstance(b, str)]
                if rows:
                    out.append((f"{p.name} 제목 · 설명", "en", lang, rows))
    elif p.is_dir():  # Openology: 영어가 원문, 같은 컷에 언어별 글
        files = [p / n for n in ("cuts.json", "script.json") if (p / n).exists()] + sorted(p.glob("*/lines.json"))
        for f in files:
            rows = rows_from_json(json.loads(f.read_text()))
            for lang in LANGS:
                if lang in ("en", "id") or not any(isinstance(x.get(lang), str) for x in rows):  # "id" = 컷 번호 칸
                    continue
                gs = [(g[0]["id"], " ".join(clean(x["en"]) for x in g), " ".join(clean(x.get(lang) or "") for x in g)) for g in group_rows(rows, "en")]
                out.append((f"{p.name}/{f.relative_to(p)}", "en", lang, [g for g in gs if g[2].strip()]))
    return out


_KO_BASE = None


def ko_style(texts):
    """문장당 "의" · 대명사 · 수동 꼴 개수"""
    sents = [s for t in texts for s in L.sentences(t)] or [""]
    n = len(sents)
    j = " ".join(texts)
    return {"의": len(re.findall(r"[가-힣]의 ", j)) / n,
            "대명사": len(re.findall(r"(그것|이것|그들|이들|그녀)", j)) / n,
            "수동": len(re.findall(r"(에 의해|되어지|되어집|불립니다|불린다)", j)) / n}


def ko_base():
    global _KO_BASE
    if _KO_BASE is None:
        f = L.CODE / "episodes/mongol-01r/draft/lines.json"  # 사용자 대본으로 쓴 사람 한국어 (오탐 기준)
        _KO_BASE = ko_style([clean(x["text"]) for x in json.loads(f.read_text())]) if f.exists() else None
    return _KO_BASE


def pair_check(name, src, tgt, pairs):
    """→ [(문서, 언어, id, level, 규칙, 메시지, 맞은 글, 제안)]"""
    rules = load_calque(src, tgt)
    doc = f"{name} 번역투 {src}→{tgt}"
    found = []
    for gid, s, t in pairs:
        for r, m in calque_hits(rules, s, t):
            found.append((doc, tgt, gid, r.get("level", "warn"), r["id"], f"{r['msg']} (원문: {s[:60]})", m, [r["natural"]] if r.get("natural") else None))
    multi = [(gid, L.sentences(s), L.sentences(t)) for gid, s, t in pairs if len(L.sentences(s)) >= 2]
    if len(multi) >= 8:
        same = sum(1 for _, a, b in multi if len(a) == len(b))
        if same / len(multi) >= 0.95:
            found.append((doc, tgt, "편 전체", "warn", "x-mirror", f"원문 문장이 둘 이상인 {len(multi)}묶음 중 {same}묶음이 번역도 문장 수가 똑같음 - 한 줄씩 옮긴 흔적. 그 언어 말투로 합치거나 나누기", "", None))
    if tgt == "ko":
        for gid, s, t in pairs:
            if str(gid).startswith(("chapter", "title")):
                continue  # 장 제목 · 영상 제목은 원래 명사로 끝남
            ss, ts = L.sentences(s), L.sentences(t)
            if len(ss) == len(ts):
                for a, b in zip(ss, ts):
                    if len(a.split()) <= 3 and not re.search(r"(다|요|까|죠|네|지|라|자|오)[.?!…]?[\"'”’)]*$", b.strip()):
                        found.append((doc, tgt, gid, "warn", "x-fragment", f"원문 조각 문장({a})을 한국어도 명사 조각으로 옮김 - 서술어로 끝내기", b, None))
        base = ko_base()
        if base and pairs:
            mine = ko_style([t for _, _, t in pairs])
            for k, v in mine.items():
                if v > max(2 * base[k], base[k] + 0.15):
                    found.append((doc, tgt, "편 전체", "warn", "x-ko-style", f"문장당 '{k}' {v:.2f}개 - 사람 대본(금나라 1부) {base[k]:.2f}개보다 많음, 영어 구조를 옮긴 흔적", "", None))
    return found


def calque_selftest():
    bad = n = 0
    for f in sorted(CALQUE_DIR.glob("*-*.json")):
        src, tgt = f.stem.split("-")
        for r in load_calque(src, tgt):
            for s, t in r.get("bad", []):
                n += 1
                if not calque_hits([r], s, t):
                    bad += 1
                    print(f"  ✗ {f.stem} {r['id']}: 못 잡음 - {s} / {t}")
            for s, t in r.get("good", []):
                n += 1
                if calque_hits([r], s, t):
                    bad += 1
                    print(f"  ✗ {f.stem} {r['id']}: 잘못 잡음 - {s} / {t}")
        print(f"  {f.stem}: 시험 {n}개")
        n = 0
    return bad


def run(docs, extra, pick):
    found = []  # (문서, 언어, 줄 id, level, 규칙, 메시지, 맞은 글, 제안)
    for name, lang, rows in docs:
        if pick and lang not in pick:
            continue
        data = L.load(lang)
        per = []
        for lid, text, scope in rows:
            for r, s, e, sug in L.lint(text, lang, "narration" if scope == "desc" else scope, data):
                if scope == "desc" and (r.get("kind") == "pron" or r.get("check") == "ko_noun_tail"):
                    continue  # 설명란은 읽지 않음
                per.append((r, lid, text[s:e], sug))
        for r in {id(r): r for r, *_ in per}.values():
            n = r.get("overuse")
            mine = [x for x in per if x[0] is r]
            if n:
                per = [x for x in per if x[0] is not r]
                if len(mine) > n:
                    found.append((name, lang, ", ".join(dict.fromkeys(x[1] for x in mine)), r["level"], r["id"], f"{r['msg']} ({len(mine)}번 - {n}번까지)", "", None))
        found += [(name, lang, lid, r["level"], r["id"], r["msg"], m, sug) for r, lid, m, sug in per]
        found += [(name, lang, lid, "warn", rule, msg, m, None) for lid, rule, msg, m in multi_line(lang, rows)]
    found += [(n, l, lid, lv, rule, msg, m, None) for n, l, lid, lv, rule, msg, m in extra if not pick or l in pick]
    return found


def main():
    if "--selftest" in sys.argv:
        bad = calque_selftest()
        print(f"번역투 짝 규칙 시험: {'통과' if not bad else f'{bad}개 실패'}")
        return 1 if bad else 0
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__ or "사용법은 파일 머리말")
    pick = next((set(a.split("=", 1)[1].split(",")) for a in sys.argv if a.startswith("--lang=")), None)
    found = []
    for a in args:
        docs, extra = load_target(a)
        found += run(docs, extra, pick)
        for name, src, tgt, pairs in pairs_for(a):  # 번역투 짝 검사
            if not pick or tgt in pick:
                found += pair_check(name, src, tgt, pairs)
    cur = None
    for name, lang, lid, lv, rule, msg, m, sug in sorted(found, key=lambda x: (x[0], LANGS.index(x[1]) if x[1] in LANGS else 99, x[3] != "error")):
        if (name, lang) != cur:
            cur = (name, lang)
            print(f"\n== {name} [{lang}]")
        tail = f"  「{m[:70]}」" if m else ""
        fix = f" → {sug[0]}" if sug else ""
        print(f"  {'오류' if lv == 'error' else '경고'} {lid}: {rule} - {msg}{tail}{fix}")
    errs = sum(1 for x in found if x[3] == "error")
    warns = len(found) - errs
    print(f"\ncheck-lines: 오류 {errs}, 경고 {warns}")
    if "--report" in sys.argv:
        return 0
    return 1 if errs or ("--strict" in sys.argv and warns) else 0


if __name__ == "__main__":
    sys.exit(main())
