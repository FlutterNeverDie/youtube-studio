# 캐릭터 고증·체형 검사 (제작 9단계 "캐릭터 만들기"의 게이트, 토큰 없음) - 2026-10-23 사용자:
#   "다른 편 만들 때도 그 나라·시대·배경, 인물의 특징과 몸 크기를 맞추는 규칙을 하네스로"
# python3 scripts/check-chars.py episodes/mongol-01/ep.json [--json]
# 이 편에 나오는 인물마다 characters.json에 아래가 있어야 통과:
#   era      {"culture": "몽골 제국", "century": 13}            그 나라·시대 (복식 기준)
#   sources  [{"what": "모자", "ref": "원 황제 초상(타이베이 고궁박물원)"}, ...]
#            모자·옷(갑옷)·신발 세 가지는 근거 필수 - 초상화·세밀화·유물·연구서 이름. 확실하지 않으면 꾸미지 않고 "단순하게"라고 적는다
#   rank     king|noble|general|soldier|commoner|cleric|captive|child   신분 (차림·크기를 가른다)
#   body     {"height": 0.8~1.2, "build": "slim|average|stocky|heavy", "basis": "기록 또는 나이·역할 근거"}
#   stages   (선택) 같은 인물이 편마다·장면마다 달라질 때 {"young": {"height":0.75,"build":"slim"}, ...}
# 오류: 위 칸이 없음, 근거 없는 모자·옷·신발, 시대에 안 맞는 차림(아래 ANACHRONISM), 이 편 인물이 모두 같은 키·체형
# 경고: 왕·장군이 일반 병사보다 작음, 같은 키가 셋 이상
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from checklib import Ctx, item, report

ROOT = Path(__file__).resolve().parent.parent
SPEC = json.loads((ROOT / "characters.json").read_text())["characters"]
REQUIRED_SRC = ("모자", "옷", "신발")
RANKS = {"king", "noble", "general", "soldier", "commoner", "cleric", "captive", "child"}
BUILDS = {"slim", "average", "stocky", "heavy"}
# 문화권마다 쓰면 안 되는 차림 (설계 칸 값 기준) - 새 문화권을 다룰 때 여기에 더한다
ANACHRONISM = {
    "몽골": {"hat": {"crown", "crown_cap", "georgian_crown", "rus_helmet", "turban", "turban_helmet"}},
    "루스": {"hat": {"fur", "khan", "boqta", "turban", "turban_helmet", "georgian_crown"}},
    "호라즘": {"hat": {"crown", "khan", "rus_helmet", "boqta", "georgian_crown"}},
    "쿠만": {"hat": {"crown", "crown_cap", "khan", "rus_helmet", "georgian_crown", "turban"}},  # 2026-10-26
    "조지아": {"hat": {"fur", "khan", "boqta", "helmet", "rus_helmet", "turban", "cuman"}},
}

ctx = Ctx()
used = {}
for i, s in enumerate(ctx.scenes):
    cid = s.get("char")
    if not cid and s.get("speaker"):
        cid = next((k for k, c in SPEC.items() if s["speaker"].upper() in [x.upper() for x in c.get("speakers", [])]), None)
    if cid and cid not in used:
        used[cid] = i
out = []
heights = {}
for cid, scene in used.items():
    c = SPEC.get(cid)
    if not c:
        out.append(item(scene, f"{cid}: characters.json에 설계 없음", source="chars", rule="missing", group="캐릭터"))
        continue
    name = c.get("ko", cid)
    era = c.get("era") or {}
    if not era.get("culture") or not era.get("century"):
        out.append(item(scene, f"{name}: era(나라·세기) 없음 - 복식 기준을 정할 수 없음", source="chars", rule="era", group="캐릭터"))
    have = {s.get("what") for s in c.get("sources", []) if s.get("ref")}
    for w in REQUIRED_SRC:
        if w not in have:
            out.append(item(scene, f"{name}: {w} 근거 없음 (sources에 초상화·세밀화·유물·연구서 이름, 모르면 '단순하게')", source="chars", rule="source", group="캐릭터"))
    if c.get("rank") not in RANKS:
        out.append(item(scene, f"{name}: rank(신분) 없음 - {'|'.join(sorted(RANKS))}", source="chars", rule="rank", group="캐릭터"))
    b = c.get("body") or {}
    if not (0.6 <= float(b.get("height", 0) or 0) <= 1.3) or b.get("build") not in BUILDS or not b.get("basis"):
        out.append(item(scene, f"{name}: body(height 0.6~1.3·build·basis 근거) 없음 - 모두 같은 틀로 그리지 않기", source="chars", rule="body", group="캐릭터"))
    else:
        heights[cid] = (float(b["height"]), b["build"], c.get("rank"))
    for culture, bad in ANACHRONISM.items():
        if culture in (era.get("culture") or ""):
            for field, vals in bad.items():
                if c.get(field) in vals:
                    out.append(item(scene, f"{name}: {era['culture']} 인물에 {field}={c[field]} - 그 시대·나라 차림이 아님", source="chars", rule="anachronism", group="캐릭터"))
if len(heights) >= 3:
    if len({(h, b) for h, b, _ in heights.values()}) == 1:
        out.append(item(None, "이 편 인물이 모두 같은 키·체형 - 인물·역할마다 다르게", source="chars", rule="same-body", group="캐릭터"))
    from collections import Counter
    for h, n in Counter(h for h, _, _ in heights.values()).items():
        if n >= 3:
            out.append(item(None, f"키 {h}인 인물이 {n}명 - 나란히 설 때 구분이 안 됨", source="chars", rule="same-height", group="캐릭터", level="warn"))
    soldier = max((h for h, _, r in heights.values() if r == "soldier"), default=None)
    for cid, (h, _, r) in heights.items():
        if soldier and r in ("king", "general") and h < soldier:
            out.append(item(used[cid], f"{SPEC[cid].get('ko', cid)}: {r}인데 일반 병사보다 작음 - 의도한 것인지", source="chars", rule="rank-size", group="캐릭터", level="warn"))
report(ctx, out, "캐릭터 검사", f" ({len(used)}명)")
