# 번역투 AI 검토 도장 (2026-11-10): 기계 규칙(check-lines 짝 검사)이 못 잡는 "영어를 그대로 옮긴 문장"을
# 언어마다 에이전트가 원문과 나란히 읽고 고친 뒤 도장을 찍는다. 원문이나 번역이 바뀌면 도장이 풀린다.
#   python3 scripts/calque-review.py lines  <대상> <번역 언어>            검토할 묶음 (id · 원문 · 번역) - 에이전트에게 줌
#   python3 scripts/calque-review.py stamp  <대상> <번역 언어> notes.json  notes = {"ok": true, "summary": "...", "fixed": ["id 이유"], "left": [...]}
#   python3 scripts/calque-review.py status <대상>                         언어별 도장 상태
#   python3 scripts/calque-review.py gate   <대상> [--warn]                도장이 없거나 낡은 언어가 있으면 exit 1 (--warn이면 알리기만)
# <대상> = episodes/<편> (몽골 장 초안: ko→en, en→다른 언어) 또는 openology shorts/<편> 폴더 (en→ko 등)
# 도장 위치: <대상>/review/calque-<원문>-<번역>.json
# 검토 기준: docs/guide/locales/<번역 언어>.md "AI 티 · 번역투" 절 + calque/<원문>-<번역>.json 규칙의 msg들
import datetime
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("check_lines", HERE / "check-lines.py")
CL = importlib.util.module_from_spec(spec)
spec.loader.exec_module(CL)


def target_dir(arg):
    p = Path(arg).expanduser()
    if not p.is_absolute() and not p.exists():
        p = CL.L.CODE / arg
    return p.resolve()


def docs(arg):
    """→ {번역 언어: (원문 언어, [(id, 원문, 번역)])} - 대사만 (제목 · 설명은 check-lines가 따로 봄)"""
    out = {}
    for name, src, tgt, pairs in CL.pairs_for(arg):
        if "제목" in name:
            continue
        s, rows = out.get(tgt, (src, []))
        out[tgt] = (src, rows + pairs)
    return out


def fingerprint(rows):
    return hashlib.sha256(json.dumps([[s, t] for _, s, t in rows], ensure_ascii=False).encode()).hexdigest()[:16]


def stamp_file(arg, src, tgt):
    return target_dir(arg) / "review" / f"calque-{src}-{tgt}.json"


def state(arg):
    res = {}
    for tgt, (src, rows) in docs(arg).items():
        f = stamp_file(arg, src, tgt)
        if not f.exists():
            res[tgt] = (src, "없음", None)
            continue
        d = json.loads(f.read_text())
        res[tgt] = (src, "통과" if d.get("fingerprint") == fingerprint(rows) and d.get("ok") else "낡음(대사가 바뀜)" if d.get("ok") else "실패", d)
    return res


def main():
    cmd, arg = sys.argv[1], sys.argv[2]
    if cmd == "lines":
        tgt = sys.argv[3]
        src, rows = docs(arg)[tgt]
        print(json.dumps({"src": src, "tgt": tgt, "rows": [{"id": i, src: s, tgt: t} for i, s, t in rows]}, ensure_ascii=False, indent=1))
    elif cmd == "stamp":
        tgt, notes = sys.argv[3], json.loads(Path(sys.argv[4]).read_text())
        src, rows = docs(arg)[tgt]
        f = stamp_file(arg, src, tgt)
        f.parent.mkdir(exist_ok=True)
        f.write_text(json.dumps({**notes, "src": src, "tgt": tgt, "fingerprint": fingerprint(rows), "at": datetime.datetime.now().isoformat(timespec="minutes")}, ensure_ascii=False, indent=1) + "\n")
        print(f"도장: {f}")
    elif cmd in ("status", "gate"):
        bad = 0
        for tgt, (src, st, d) in state(arg).items():
            print(f"  {src}→{tgt}: {st}" + (f" - {d.get('summary', '')[:80]}" if d and st == "통과" else ""))
            bad += st != "통과"
        if cmd == "gate" and bad:
            print(f"calque-review: 도장 없는(낡은) 언어 {bad}개 - 에이전트 검토 뒤 stamp")
            return 0 if "--warn" in sys.argv else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
