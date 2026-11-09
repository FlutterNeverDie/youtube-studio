# 장 초안 검사 (2026-10-26 사용자: "훅·1~2장 만들면서 찾은 문제, 다신 이렇게 안 걸리게 하네스 걸자")
#   python3 scripts/check-draft.py episodes/mongol-01 [장...] [--video out/mongol-01-ch2.mp4 [--approved-until 초]] [--sheet] [--timeline]
#   장을 사용자에게 보여 주기 전에 돌린다. 오류가 있으면 1로 끝남(보여 주지 말고 고칠 것)
# 잡는 것 (근거는 docs/guide/02의 "1편 초안 1장·2장 피드백" 절):
#   대본  - 한국어 규칙 전부(docs/guide/locales/ko.rules.json: 합쇼체·명사 떼기·나라 비교·예고형 끝맺음 등)
#   대본  - 극적인 순간(처형·목숨·숨겨 주기·이름 짓기·즉위)에 멈춤(⏸)이 없으면 경고
#   대본  - 맥락 컷: 누군가를 "데려온·끌고 온·얻은" 사람으로 소개하는 줄(기술자·포로·시민·길잡이 등)은 그 줄의 ▶ 장면 설명에
#           "맥락:" 으로 누구인지·어디서 왔는지 보여 주는 앞 컷을 적어야 함 - 없으면 오류 (2026-11-02 사용자: "앞뒤 설명 넣어 주는 거 하네스에 걸어",
#           "사막 한가운데 캐릭터 세워 놓기만 하면 말이 안 돼", "점령지에서 데려온 일반 시민인 걸 보여 주는 장면이 필요해")
#   화면  - 장 파일(src/draft/<M01>Ch<n>.tsx)이 그 장의 줄을 빠짐없이·틀린 번호 없이 쓰는지 (줄 번호가 바뀌면 화면·대사가 어긋남)
#   화면  - 대사에 나오는 인물이 장 파일에 자기 캐릭터(또는 자기 기병)로 나오는지 ("왜 말 타는 캐릭터는 계속 같은 캐릭터야?")
#   화면  - 큰 숫자(BigNum)·장 카드는 연도만 ("연도 외에는 숫자를 화면 위로 올리지 마") - 분석 장(ANALYSIS)은 예외
#   화면  - 위기·죽음 장면 Shot에 웃는 포즈(happy·smug·hop)가 있으면 경고 ("웃으면 안 되지")
#   영상  - --video: 몇 프레임만 확 바뀌는 깜빡임·크롬 3×3 타일 깨짐·오른쪽 끝 띠 깨짐, 장면이 1.5초도 안 보이고 넘어가는 빠른 전환 (2026-10-27)
#   대본  - (2026-11-03 2편 전체 피드백) 같은 연도 카드 연속·장 안 큰 숫자 되풀이, 훅 첫 두 줄 위치 소개("지금의 ~"),
#           원인 없는 결과(경고 → 오류: 경고라서 c2_05 "작은 도시를 항복시키고"가 그냥 지나감), 막연한 장 끝 연결("~방법이 있었습니다"),
#           장마다 점검 도장(docs/guide/11-대본-점검.md 질문을 보고 --stamp - 대사가 바뀌면 도장이 풀림)
#   눈    - --sheet: 묶음(Shot)마다 가운데 프레임을 찍어 한 장으로 → 아래 "눈으로 볼 것" 목록과 함께 직접 확인
import json
import math
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import langrules as L  # noqa: E402
import tools  # noqa: E402  외부 프로그램 위치는 tools에서만 (맥·윈도우)

ANALYSIS = {("mongol-01", "3"), ("mongol-02", "0"), ("mongol-02", "3")}  # 2편 훅 "2"(편 번호)·3장 투석기 1 : 4 분석 (2026-11-02 사용자 확인)  # 숫자 설명이 핵심인 분석 장 - 화면 숫자 허용 (사용자 확인 대기, 02)
DRAMA = r"처형|목숨|죽게|못 본 척|그를 봤습니다|네 이름은|이름이 바로|붙잡혀|말고삐를 붙잡"
DANGER = r"도망|숨습니다|독을|죽|처형|버리고|납치|낚아채|붙잡|포로|삶았|목숨|형틀|나무 칼"
LOOK = [
    "같은 연출을 돌려쓰지 않았나 (특히 기병이 가로로 지나가는 장면 반복) - 장면마다 움직임 방향·카메라·효과가 다른가",
    "사건이 행동으로 보이나 (버림 = 천막을 걷고 떠남, 납치 = 낚아채 감) - 지나가는 사람처럼 보이지 않나",
    "판이 바뀌는 사건에 이유가 보이나 (동맹: 무엇을 바치고 무엇을 약속받았나) - 한 줄로 넘기지 않았나",
    "군대 맨 앞에 이끄는 인물이 타고 있나 (Rider kind=인물)",
    "대립은 두 인물이 정면으로 마주 보나, 전투에서 얼굴을 맞대나",
    "핵심 장면(기억해야 할 장면)은 캐릭터 조합이 아니라 전용 그림인가",
    "표정이 상황과 맞나 - 위기엔 겁먹은 얼굴, 지나간 뒤엔 안도, 웃음은 😏 자리에서만",
    "극적인 순간은 천천히 - 멈춤 동안 화면이 정말 느려지고 정적이 있나",
    "자세가 어색하지 않나 (서서 뿌리 캐기 등) - 필요하면 앉은·옆모습 자세를 만든다",
    "잘림·겹침·빈 화면·화면 밖으로 나간 그림이 없나",
    "소품이 공중에 떠 있지 않나 - 잔·무기·깃발·밧줄은 손이나 땅에 붙어 있게 (2026-10-26 사용자: \"결혼식 찻잔이 공중에 떠 있어\")",
    "사건 사이 인과가 이어지나 - 불리해 보인 직후 갑자기 이기거나 항복하는 비약 금지, 왜 그렇게 됐는지 장면이 있나 (2026-10-26 사용자: \"물둑이 깨져 몽골이 큰일 난 것처럼 보이다 갑자기 서하가 항복하는 게 맥락이 안 맞잖아\")",
    "군대는 직사각형 블록이 아니라 병사 그림이나 점으로 (사용자: \"직사각형을 군대로 그려 놨는데 차라리 병사로\")",
    "웅장해야 할 것은 웅장하게 - 만리장성·수도·궁궐이 초라하지 않나, 도망 행렬은 길게 (사용자: \"만리장성이 너무 초라해\", \"중국 성과 주변이 너무 옹졸해\")",
    "전투는 결과까지 - 쓰러진 병사(피 없이)·끝까지 쫓는 추격이 보이나 (사용자: \"시체를 그려, 끝까지 쫓아서 죽이는 거 넣어\")",
    "중요한 행동(처형·납치·체포)은 결과만이 아니라 그 순간이 보이나 - 끌려 나가기로 때우지 않기 (사용자: \"그들부터 죽이는 걸 보여줘야 해\")",
    "새로 등장한 사람·무리가 누구인지·어디서 왔는지 앞 컷이 있나 - 빈 땅에 세워 놓기만 하지 않았나, 같은 나라 사람이면 옷차림으로 이어 보이나 (2026-11-02 사용자: \"금나라에서 데려온 기술자인지 티가 안 나\", \"자기 나라 사람인지 구별이 안 가\")",
    "우는 장면은 눈물이 보이나 - 감은 눈(^ ^)은 웃는 얼굴로 보임, 우는 눈(> <)과 눈물 줄기 (2026-11-02 사용자: \"웃는 거 같아, 모두 울고 있어야 해\")",
]

_val = {i + 1 for i, a in enumerate(sys.argv) if a in ("--video", "--approved-until")}  # 옵션 뒤 값은 장 번호가 아님
args = [a for i, a in enumerate(sys.argv) if i >= 1 and not a.startswith("--") and i not in _val]
ep = ROOT / args[0]
want = set(args[1:])
video = sys.argv[sys.argv.index("--video") + 1] if "--video" in sys.argv else None
# --approved-until 초: 사용자가 이미 합격시킨 앞부분(새 1편의 18초 훅 - 2026-10-27 "18초까지만 그대로")은 빠른 전환·뚝 컷을 안 봄. 깨짐·깜빡임은 그래도 봄
APPROVED = float(sys.argv[sys.argv.index("--approved-until") + 1]) * 30 if "--approved-until" in sys.argv else 0
if video:
    want -= {video}
prefix = "M" + re.sub(r"\D", "", ep.name).zfill(2) + ("R" if ep.name.endswith("r") else "")  # mongol-01 → M01, 수정판 mongol-01r → M01R (2026-11-05)
lines = json.loads((ep / "draft/lines.json").read_text())
md = (ep / "script-ko.md").read_text()
# 점검 도장 (2026-11-03): 장 제목 줄 끝 [점검 해시8] - 해시는 그 장 대사(N)로 만듦, 대사를 고치면 도장이 풀려 다시 점검
import hashlib  # noqa: E402
CHECKLIST = [x[6:].strip() for x in (ROOT / "docs/guide/11-대본-점검.md").read_text().splitlines() if x.startswith("- [ ] ")]


def stamp_of(ch):
    return hashlib.sha1("\n".join(l["text"] for l in lines if l["ch"] == ch and l["who"] == "N").encode()).hexdigest()[:8]


if "--stamp" in sys.argv:
    print("대본 점검표 (docs/guide/11-대본-점검.md) - 장마다 아래를 다 따져 본 뒤에만 도장:")
    for q in CHECKLIST:
        print("  □", q)
    out = []
    for raw in md.splitlines():
        m = re.match(r"^## (\d+)\.", raw)
        if m and (not want or m.group(1) in want):
            raw = re.sub(r"\s*\[점검 [0-9a-f]{8}\]$", "", raw) + f" [점검 {stamp_of(m.group(1))}]"
        out.append(raw)
    md = "\n".join(out) + "\n"
    (ep / "script-ko.md").write_text(md)
    print("도장 찍음:", ", ".join(sorted(want) if want else "전체"))
chars = json.loads((ROOT / "characters.json").read_text())["characters"]
riders = {p.name for p in (ROOT / "public/riders").iterdir() if p.is_dir()}
R = L.load("ko")
errs, warns = [], []


def err(m):
    errs.append(m)


def warn(m):
    warns.append(m)


# ---------- 대본 ----------
for raw in md.splitlines():
    m = re.match(r"^(N|[^▶#\s\-][^:]{0,12}):\s*(.+)$", raw)
    if not m or raw.startswith(("범위", "이 편", "길이", "웃음", "2판", "3판")):
        continue
    text = re.sub(r"\[[^\]]*\]|😏(\([^)]*\))?|⏸\s*[\d.]+", "", m.group(2)).strip()
    # 따옴표 안("…")은 인용한 생각·통보라 말투 규칙에서 뺌 (2026-11-02 2편: "성벽은 넘지 못한다", "성문을 열면 살려 준다")
    text = re.sub(r'"[^"]*"', '말했습니다', text)
    for r, s, e, _ in L.lint(text, "ko", "narration" if m.group(1) == "N" else "dialogue", R):
        if r["level"] == "error":
            err(f"대본 [{r['id']}] \"{text[s:e]}\" - {text[:50]}")

chs = sorted({l["ch"] for l in lines} if not want else want)
# 목소리 안 끊김 (2026-11-02 사용자: "자기 나라 사람들을 / 향해서 중간 텀이 너무 길어") - scripts/draft-lines.py가 잰 조각 안 최장 무음(gap)
_vj = ROOT / "public/ep" / ep.name / "draft/voice.json"
if _vj.exists():
    for _id, _v in json.loads(_vj.read_text()).items():
        if _v.get("gap", 0) > 0.7 and any(x["id"] == _id and (not want or x["ch"] in want) for x in lines):
            err(f"{_id} 목소리가 문장 안에서 {_v['gap']:.1f}초 끊김 (무료 목소리 버릇) - 낱말을 바꿔 다시 만들 것 (예: 앞에 '바로'를 붙임)")
# 맥락 컷 (2026-11-02): 새로 등장하는 사람·무리를 "어디서 온 누구"로 소개하는 줄
INTRO = r"데려온|데려와|데리고 온|끌고 와|끌고 온|끌려|얻었|얻은|점령한 도시의 사람|출신|전문가|기술자|길잡이|시민|백성|포로"
for l in lines if ep.name != "mongol-01" else []:  # 1편은 이미 올림 - 2편부터
    if (not want or l["ch"] in want) and l["who"] == "N" and re.search(INTRO, l["text"]) and "맥락:" not in l.get("shot", ""):
        err(f"{l['id']} 맥락 컷 없음 - 누구인지·어디서 왔는지 보여 주는 앞 컷을 ▶에 \"맥락: …\"으로 적고 화면에 넣을 것 (2026-11-02 사용자: 앞뒤 설명) - {l['text'][:40]}")
OUTCOME = r"항복|고개를 숙|무릎을 꿇|화친|함락|무너뜨|무너집|도망칩"
CAUSE = r"때문|그래서|결국|덕분|탓|못한|못해|이유|바닥나|외면|버티|겁먹은|배신|이겼|무너진|끊기면|모읍니다|뚫습니다|[가-힣]자,|엄두"
for ch in chs:
    ls = [l for l in lines if l["ch"] == ch]
    for k, l in enumerate(ls):
        # 질문("어떻게 무너뜨렸을까요?")은 결과가 아니라 예고라 뺌. 앞 장면에서 이미 이유를 보여 줬으면 ▶에 "원인: …"으로 적고 통과
        if l["who"] == "N" and re.search(OUTCOME, l["text"]) and not l["text"].rstrip().endswith("?") and "원인:" not in l.get("shot", ""):
            ctx = " ".join(x["text"] for x in ls[max(0, k - 2): k + 1])
            if not re.search(CAUSE, ctx):
                (err if ep.name != "mongol-01" else warn)(f"{l['id']} 결과(항복·함락·무너짐 등) 앞에 이유가 안 보임 - 왜 그렇게 됐는지 앞에 한 줄·한 장면, 이미 보여 줬으면 ▶에 \"원인: …\" (2026-11-03 사용자: \"뜬금없이 항복한 거 같아\") - {l['text'][:40]}")
if ep.name != "mongol-01":
    allch = sorted({l["ch"] for l in lines}, key=int)
    # 훅 위치 소개 (2026-11-03 사용자: "호라즘은 지금의 00나라, 중앙아시아의 이슬람 국가였습니다") - 처음 보는 나라는 어디 있는 나라인지부터
    hook = [l for l in lines if l["ch"] == "0" and l["who"] == "N"][:2]
    if hook and not any(re.search(r"지금의|오늘날", l["text"]) for l in hook) and "check-draft: 위치 소개 생략" not in md:
        err("0장(훅) 첫 두 줄에 위치 소개가 없음 - \"지금의 ~에 걸친 ~ 나라\"처럼 어디 있는 나라인지 (이미 소개한 나라면 대본에 check-draft: 위치 소개 생략)")
    # 막연한 장 끝 연결 (2026-11-03 사용자: "성을 부수지 않고도 이기는 방법이 있었습니다 말고 심리전도 강했다고") - 다음 장이 무엇인지 이름을 붙임
    for ch in allch[:-1]:
        last = [l for l in lines if l["ch"] == ch and l["who"] == "N"][-1:]
        if last and (not want or ch in want) and re.search(r"(방법|길|수|것|무기|비결)(이|도)\s*있었습니다\.?$", last[0]["text"].strip()):
            warn(f"{last[0]['id']} 장 끝 연결이 막연함 - \"~방법이 있었습니다\" 대신 무엇인지 이름을 붙여서 (예: 심리전에도 강했습니다) - {last[0]['text'][:40]}")
    # 같은 연도 되풀이 (2026-11-03 사용자: "1220년이 3번 연속 나와서 지겨움" - 2장 카드·2장 큰 숫자·3장 카드·4장 카드)
    kit = (ROOT / "src/draft/kit.tsx").read_text()
    _nc = re.search(r"NO_CARD = new Set<string>\(\[([^\]]*)\]", kit)
    nocard = set(re.findall(r'"([^"]+)"', _nc.group(1) if _nc else ""))
    shown = None  # 마지막으로 화면에 뜬 장 카드 연도
    for ch in allch:
        f = ROOT / f"src/draft/{prefix}Ch{ch}.tsx"
        if not f.exists():
            continue
        src = f.read_text()
        m = re.search(r'<Chapter ch="([^"]+)" year="(\d*)"', src)
        if not m:
            continue
        cid, year = m.groups()
        card = year if year and not (cid == "0" or cid.endswith(".0") or cid in nocard) else None
        if card and card == shown:
            err(f"{ch}장 카드 연도 {card}가 앞 장 카드와 같음 - 같은 연도가 연달아 뜸, kit NO_CARD에 \"{cid}\" 넣어 카드를 뺄 것")
        if card:
            shown = card
            for v in re.findall(r'<BigNum[^>]*?text=\{?["`]([^"`]+)["`]', src):
                if v == card:
                    err(f"{ch}장: 장 카드 연도 {card}를 큰 숫자로 또 띄움 - 한 장 안에서 같은 연도 되풀이 (2026-11-03 사용자)")
            for l in [x for x in lines if x["ch"] == ch and x["who"] == "N" and f"{card}년" in x["text"]]:
                warn(f"{l['id']} 장 카드에 뜬 {card}년을 대사로 또 말함 - 꼭 필요한지 (계절·때만 말해도 되면 연도 빼기) - {l['text'][:40]}")
    # 장면 안 시각은 렌더 언어 목소리에 맞춤 (2026-11-03 사용자: "왜 한국어 기준으로 해놨어? 영어로 해야지")
    #  - 줄 시작 + 초는 tl(id(n), 초)로 (한국어 초를 렌더 언어의 같은 조각·비율 자리로 옮김, kit.tsx). sec()로 적으면 영어판에서 어긋남
    #  - 그러려면 언어끼리 조각(/) 수가 같아야 함
    for ch in allch:
        f = ROOT / f"src/draft/{prefix}Ch{ch}.tsx"
        if f.exists():
            for k, row in enumerate(f.read_text().splitlines(), 1):
                if re.search(r"\b(a\d+|at\(id\(\d+\)\))\s*\+\s*sec\(", row):
                    err(f"{ch}장 {k}줄: 줄 시작 + sec(초) - 한국어 목소리에만 맞음, tl(id(n), 초)로 (영어판 어긋남, 2026-11-03)")
    _vk = json.loads((ROOT / "public/ep" / ep.name / "draft/voice.json").read_text())
    for _lf in sorted((ROOT / "public/ep" / ep.name / "draft").glob("voice-*.json")):
        _vl = json.loads(_lf.read_text())
        for _id, _x in _vl.items():
            if _id in _vk and _x.get("cues") is not None and _vk[_id].get("cues") is not None and len(_x["cues"]) != len(_vk[_id]["cues"]):
                err(f"{_id} {_lf.stem[6:]} 조각(/) 수 {len(_x['cues'])}개 ≠ 한국어 {len(_vk[_id]['cues'])}개 - 같은 자리에서 끊어야 화면이 그 언어 목소리에 맞음 (i18n-{_lf.stem[6:]}.json)")
    # 카드를 뺀 장 경계 소리 (2026-11-03 사고: 4장 카드를 빼자 넘김 소리가 사라져 3장 → 4장 사이 0.6초 무음, check-bgm-cut 6:53)
    # → 카드를 뺀 장의 첫 장면은 0프레임부터 장면 끝까지 바닥 소리(<SFX at={0} … dur={frames}>)를 깔아야 함
    for ch in allch:
        f = ROOT / f"src/draft/{prefix}Ch{ch}.tsx"
        if not f.exists():
            continue
        src = f.read_text()
        m = re.search(r'<Chapter ch="([^"]+)"', src)
        g = re.search(r"\{\s*ids:\s*\[[^\]]*\]\s*,\s*Shot:\s*(\w+)", src)
        if not m or not g or m.group(1) not in nocard:
            continue
        body = re.search(rf"const {g.group(1)}\b.*?(?=\nconst |\nexport |\Z)", src, re.S)
        if not body or not re.search(r"<SFX[^>]*at=\{0\}[^>]*dur=\{frames\}", body.group(0)):
            err(f"{ch}장: 장 카드를 뺐는데 첫 장면({g.group(1)})에 0프레임부터 끝까지 까는 바닥 소리가 없음 - 장 경계가 무음이 됨 (<SFX name=\"wind\" at={{0}} dur={{frames}} fade={{8}} />, 04 2026-11-03)")
    # 점검 도장
    for ch in (allch if not want else [c for c in allch if c in want]):
        m = re.search(rf"^## {ch}\..*\[점검 ([0-9a-f]{{8}})\]$", md, re.M)
        if not m:
            err(f"{ch}장 점검 도장 없음 - docs/guide/11-대본-점검.md 질문을 따져 본 뒤 python3 scripts/check-draft.py {args[0]} {ch} --stamp")
        elif m.group(1) != stamp_of(ch):
            err(f"{ch}장 점검 도장이 옛 대사 것 - 대사가 바뀜, 점검표를 다시 따져 본 뒤 --stamp")
for ch in chs:
    ls = [l for l in lines if l["ch"] == ch]
    for l in ls:
        if re.search(DRAMA, l["text"]) and not l.get("hold"):
            warn(f"{l['id']} 극적인 순간인데 멈춤(⏸) 없음 - {l['text'][:40]}")

    # ---------- 화면 ----------
    f = ROOT / f"src/draft/{prefix}Ch{ch}.tsx"
    if not f.exists():
        err(f"{ch}장 화면 파일 없음: {f.relative_to(ROOT)}")
        continue
    src = f.read_text()
    used = set(re.findall(r'"(c\d+_\d+)"', src))
    # 2편부터: 장 파일이 id(n) 도우미로 줄을 부름 (kit에서는 "m2.c1_01") - id(7) → c<장>_07
    used |= {f"c{ch}_{int(n):02d}" for n in re.findall(r"\bid\((\d+)\)", src)}
    ids = {l["id"] for l in ls}
    for i in sorted(ids - used):
        err(f"{ch}장: 줄 {i}이 화면 묶음(groups)에 없음 - 줄 번호가 바뀌었으면 화면을 다시 맞출 것")
    for i in sorted(used - ids):
        err(f"{ch}장: 화면이 없는 줄 번호 {i}을 씀 (lines.json에 없음)")

    # 대사에 나온 인물 → 자기 캐릭터·기병
    text = " ".join(l["text"] for l in ls)
    exempt = set(re.findall(r"check-draft: 이름만 (\S+)", src))
    for cid, c in chars.items():
        ko = c.get("ko", "")
        if not ko or ko in exempt or ko not in text:
            continue
        family = [k for k in list(chars) + [f"{cid}_{s}" for s in (c.get("stages") or {})] if k == cid or k.startswith(cid + "_")]
        if not any(f'"{k}"' in src for k in family) and f'"{cid}"' not in src:
            err(f"{ch}장: 대사에 \"{ko}\"가 나오는데 화면에 그 캐릭터({cid})가 없음 - 일반 기병·실루엣으로 돌려쓰지 말 것 (정말 이름만 나오면 파일에 // check-draft: 이름만 {ko})")
        elif cid in riders or True:
            pass
    for k in set(re.findall(r'<Rider\b[^>]*?\bkind="([a-z_0-9]+)"', src)) - riders:  # 2편: Troop·BustClose 등의 kind는 기병 종류가 아님
        err(f"{ch}장: 없는 기병 종류 kind=\"{k}\" (audio/riders.py)")

    # 화면 숫자: 연도만
    if (ep.name, ch) not in ANALYSIS:
        for v in re.findall(r'<BigNum[^>]*?text=\{?["`]([^"`]+)["`]', src) + re.findall(r'year="([^"]*)"', src):
            if v and not re.fullmatch(r"\d{3,4}", v):
                err(f"{ch}장: 화면 숫자 \"{v}\" - 이야기 장면은 연도만 (02)")
        for v in re.findall(r">\s*([0-9][0-9,.]*)\s*<", src):
            if not re.fullmatch(r"\d{3,4}", v):
                err(f"{ch}장: 화면 글자 숫자 \"{v}\" - 이야기 장면은 연도만 (02)")

    # 위기 장면에 웃는 포즈
    groups = re.findall(r"\{\s*ids:\s*\[([^\]]*)\]\s*,\s*Shot:\s*(\w+)", src)
    script_fun = {l["id"] for l in ls if "😏" in l.get("shot", "")}
    for idlist, shot in groups:
        gid = re.findall(r'"(c\d+_\d+)"', idlist)
        gl = [l for l in ls if l["id"] in gid]
        if not any(re.search(DANGER, l["text"]) for l in gl) or any(i in script_fun for i in gid):
            continue
        m = re.search(rf"const {shot}\b.*?(?=\nconst |\nexport |\Z)", src, re.S)
        body = m.group(0) if m else ""
        smiles = sorted(set(re.findall(r'pose[=:]\s*\{?[^\n]{0,60}?"(happy|smug)"', body) + re.findall(r'beat[=:]\s*\{?[^\n]{0,40}?"(hop)"', body)))
        if smiles:
            warn(f"{ch}장 {shot} ({', '.join(gid)}): 위기·죽음 장면에 웃는 동작 {smiles} - 상황에 맞는지 확인 (😏 자리가 아니면 안도·겁먹은 얼굴로)")

    # 소품·자세 짝 (2026-10-26 사용자 1장 7판: "애기를 들고 있는데 갑자기 만세를 해서 애기가 공중부양", "사막 바닥에서 낚시")
    for shot in sorted(set(re.findall(r"Shot:\s*(\w+)", src))):
        m = re.search(rf"const {shot}\b.*?(?=\nconst |\nexport |\n// \d+\) |\Z)", src, re.S)
        body = m.group(0) if m else ""
        # 안은 아기(Baby)는 캐릭터 겹 밖에 따로 그린 그림이라 팔을 들거나 뛰면 아기만 공중에 남는다 → 아기를 안은 장면의 캐릭터는 손짓·뜀·놀란 포즈 금지
        if "<Baby" in body:
            for c in re.findall(r"<Char [^\n]*?/>", body):
                bad = re.findall(r'gesture=|beat=\{?[^\n]{0,40}?"(?:jump|hop|shake)"|pose=\{?[^\n]{0,60}?"shocked"', c)
                if bad:
                    err(f"{ch}장 {shot}: 아기를 안은 장면인데 캐릭터가 손짓·뜀·놀란 포즈 {sorted(set(x[:12] for x in bad))} - 아기가 공중에 뜸. 아기를 빼거나 안은 채 움직이는 전용 그림으로 (2026-10-26 사용자)")
        # 낚시(SitKid·낚싯대)는 물가에서만: 같은 장면에 강·물(River·NightRiver·Fishing·water)이 있어야 함
        # 장면 안에 화면 갈래(return)가 여럿이면 낚시가 들어 있는 그 갈래만 본다
        fishing = [body[body.rfind("return (", 0, k.start()): k.start()] for k in re.finditer(r"<SitKid", body)]
        if any(not re.search(r"<River|<NightRiver|<Fishing|fill=\"#9db7b3\"|water", part) for part in fishing):
            err(f"{ch}장 {shot}: 낚시하는 아이가 있는데 장면에 물이 없음 - 맨땅 낚시 (2026-10-26 사용자: \"사막 바닥에서 낚시하질 않나\")")
    # 브금은 kit의 Bgm으로만 (곡을 겹쳐 이어 붙이고 처음·끝 페이드) - 직접 깔면 곡이 끝나는 자리·장 경계에서 뚝 끊김
    if re.search(r"staticFile\(\s*[`\"]bgm/(?!ending\.wav)", src):  # 엔딩 곡(정확히 20초 = 엔딩 길이)만 예외
        err(f"{ch}장: 브금을 <Audio src=bgm/…>로 직접 깜 - kit의 <Bgm>으로 (곡이 장보다 짧으면 뚝 끊김, 2026-10-26 사용자)")
    # 인물이 너무 작거나 화면 끝에 붙음 (2026-10-28, Lemo-Opuscar DIRECTOR.md "자주 하는 실수" - 1편 섬 위의 샤가 작았음). 군중·실루엣은 일부러일 수 있어 경고
    for m in re.finditer(r"<Char\b[^>]*?\bid=\"(\w+)\"[^>]*?>", src):
        tag = m.group(0)
        h = re.search(r"\bh=\{(\d+)\}", tag); x = re.search(r"\bx=\{(\d+)\}", tag)
        line = src[:m.start()].count("\n") + 1
        if h and int(h.group(1)) < 260:
            warn(f"{ch}장 {line}줄: {m.group(1)} 키 {h.group(1)} - 화면에서 너무 작을 수 있음 (주인공이면 300 넘게, 가까이 잡기)")
        if x and (int(x.group(1)) < 140 or int(x.group(1)) > 1780):
            warn(f"{ch}장 {line}줄: {m.group(1)} x={x.group(1)} - 화면 끝에 붙음 (잘리거나 가장자리에 밀림)")
    if re.search(r"<Audio\b", src):
        err(f"{ch}장: 소리를 <Audio>로 직접 깜 - kit의 <Snd>로 (목소리는 <Snd voice>). 목소리·배경을 나눠 렌더해 효과음이 대사를 덮지 않게 섞음 (scripts/stem-mix.py, 2026-10-27 사용자)")

# ---------- 장면 경계 (kit.tsx와 같은 계산: 장 카드 40 + 줄마다 목소리 + 쉼 10 + 멈춤 + 15, 편 끝 장은 + ENDING_FRAMES) ----------
VOICE = json.loads((ROOT / "public/ep" / ep.name / "draft/voice.json").read_text())
_V = {"ko": VOICE}
for _l in ("en", "es"):
    _f = ROOT / "public/ep" / ep.name / f"draft/voice-{_l}.json"
    _V[_l] = json.loads(_f.read_text()) if _f.exists() else {}


def slot(id_):  # kit.tsx slotSec와 같음: 영어·한국어 중 긴 쪽, 스페인어는 12%까지 빠르게
    return max(_V["en"].get(id_, {}).get("sec", 0), _V["ko"].get(id_, {}).get("sec", 0), _V["es"].get(id_, {}).get("sec", 0) / 1.12)


def ending_frames(src):  # 장 파일의 `export const ENDING_FRAMES = 300` (없으면 0) - draft-final.py와 같음
    m = re.search(r"export const ENDING_FRAMES = (\d+)", src)
    return int(m.group(1)) if m else 0


def bounds(ch):
    src = (ROOT / f"src/draft/{prefix}Ch{ch}.tsx").read_text()
    start, t0 = {}, 40
    for l in [x for x in lines if x["ch"] == ch]:
        start[l["id"]] = t0
        t0 += math.ceil(slot(l["id"]) * 30) + 10 + round(l.get("hold", 0) * 30)
    firsts = [re.findall(r'"(c\d+_\d+)"', g)[0] for g, _ in re.findall(r"\{\s*ids:\s*\[([^\]]*)\]\s*,\s*Shot:\s*(\w+)", src)]
    end = t0 + 15
    ending = ending_frames(src)  # 편 끝 장: 나레이션 뒤 고정 엔딩 (2026-10-26, 5장 +300)
    return [0, 62, 80] + sorted(start[i] for i in firsts if i in start) + [end] + ([end + ending] if ending else [])  # 62~80: 장 카드가 첫 장면 위에서 사라지는 겹침(깜빡임 아님, kit CARD 66·CARD_X 18)


# ---------- 초안 타임라인 (scripts/render-checked.py용: 장면 경계를 알려 줘 컷을 깜빡임으로 보지 않게) ----------
if "--timeline" in sys.argv:
    for ch in chs:
        b = bounds(ch)
        tl = ROOT / "out/draft-sheets" / f"timeline-{ep.name}-ch{ch}.json"
        tl.parent.mkdir(parents=True, exist_ok=True)
        tl.write_text(json.dumps({"fps": 30, "scenes": [{"frames": y - x, "show": {"type": "draft"}} for x, y in zip(b, b[1:])]}))
        print(f"타임라인: {tl.relative_to(ROOT)} (총 {b[-1]}프레임)")

# ---------- 영상: 깜빡임 = 한두 프레임만 앞뒤와 다르고, 앞뒤끼리는 비슷한 것 ----------
# (장면 안의 컷·서서히 바뀌는 빛은 깜빡임이 아님 - check-flicker.py는 타임라인 컷만 알아서 초안에선 오탐이 많았다)
FLASH = r"""
import io, subprocess, sys
import numpy as np
from PIL import Image
sys.path.insert(0, sys.argv[2]); import tools
raw = subprocess.run([*tools.remotion(), "ffmpeg", "-v", "error", "-i", sys.argv[1], "-vf", "scale=192:108:flags=area,format=gray", "-c:v", "png", "-f", "image2pipe", "-"], capture_output=True, check=True).stdout
big, i = [], 0
while (j := raw.find(b"\x89PNG\r\n\x1a\n", i + 1)) != -1 or i < len(raw):
    j = len(raw) if j == -1 else j
    big.append(np.asarray(Image.open(io.BytesIO(raw[i:j])), dtype=np.float32)); i = j
    if j == len(raw): break
fr = [a.reshape(27, 4, 48, 4).mean(axis=(1, 3)) for a in big]  # 48×27 (번쩍임·전환 판정용)
D = lambda a, b: float(np.abs(fr[a] - fr[b]).mean())
# 크롬 3×3 타일 깨짐: 화면 왼쪽 위 1/3이 아홉 칸에 똑같이 복사됨. 192×108에서 칸끼리 비교 (작게 줄이면 칸 경계가 섞여 놓침)
# 2026-10-27: 1:58 3프레임 연속, 2:21~2:26 5~12프레임 연속(6장 동시 still에서) - 앞뒤 비교(번쩍임)로는 못 잡음
def tiled(a):
    t = [a[r * 36:(r + 1) * 36, c * 64:(c + 1) * 64] for r in range(3) for c in range(3)]
    d = max(float(np.abs(x - t[0]).mean()) for x in t[1:])
    return d < 12 and d < 0.5 * float(a.std())
# 평소 움직임: 앞뒤 15프레임의 프레임 간 변화 중간값. 말이 달리는 장면처럼 계속 크게 움직이는 곳은 이것도 커서,
# 그보다 3배 넘게 튀어야 깜빡임·컷으로 봄 (2026-10-27: 훅 기병 장면 - 달리는 동작이 몇 프레임마다 되풀이돼 "튀었다 돌아옴"으로 오탐)
d = np.array([0.0] + [D(k, k - 1) for k in range(1, len(fr))])
local = np.array([float(np.median(np.concatenate([d[max(1, k - 15):k - 1], d[k + 2:k + 16]]))) if len(fr) > 4 else 0.0 for k in range(len(fr))])
sharp = lambda k, x: x > 6 and x > 3 * local[k]  # 6: 크롬이 인물·깃발 층을 통째로 빼고 찍은 프레임(변화 9)도 잡게 (2026-10-27 9:45)
# 오른쪽 끝 띠 깨짐: 화면 오른쪽 1/16에 왼쪽 끝 그림이 복사돼 붙음 (2026-10-27 사용자: "오른쪽 화면이 계속 깜빡여" - 렌더 4개를 동시에 돌릴 때 360p에서 약 2.5%)
# 하늘·벽처럼 좌우 끝이 원래 비슷한 장면은 오탐이라, 4프레임 안 가장 가까운 정상 프레임과 비교해 "띠만 혼자 다를 때"만 깨짐 (정상 12장 오탐 0, 깨진 30장 30)
def wrap_like(a):
    h, w = a.shape; s = w // 16
    copy = float(np.abs(a[:, w - s:] - a[:, :s]).mean()); seam = float(np.abs(a[:, w - s] - a[:, w - s - 1]).mean())
    near = float(np.median([np.abs(a[:, x] - a[:, x - 1]).mean() for x in range(w - 3 * s, w - s - 2)]))
    return copy < 3 and float(a[:, :s].std()) > 6 and seam > 2 * near + 1
WL = [wrap_like(a) for a in big]
def wrapped(k):
    if not WL[k]: return False
    a = big[k]; w = a.shape[1]; s = w // 16
    for dist in range(1, 5):
        for j in (k - dist, k + dist):
            if 0 <= j < len(big) and not WL[j]:
                b = big[j]
                return float(np.abs(a[:, w - s:] - b[:, w - s:]).mean()) > 3 * float(np.abs(a[:, :w - s] - b[:, :w - s]).mean()) + 2
    return False
for k in range(1, len(fr) - 1):
    if tiled(big[k]):
        print(f"{k} 타일"); continue
    if wrapped(k):
        print(f"{k} 띠"); continue
    for w in (1, 2, 3, 4):  # 1~4프레임짜리 번쩍임 (앞뒤끼리는 비슷)
        if k + w >= len(fr): continue
        jump, back = d[k], D(k - 1, k + w)
        if sharp(k, jump) and back < jump * 0.25 and sharp(k + w, d[k + w]):
            print(f"{k} {jump:.1f}"); break
# 빠른 전환 (2026-10-27 사용자: "1206 뜨자마자 넘어가 버려", "장면 전환은 부드럽고 자연스러워야 해 - 하네스 걸자"):
# 화면이 크게 바뀐 묶음(평소 움직임보다 확 튀는 프레임들) 뒤 1.5초(45프레임) 안에 또 크게 바뀌면 = 한 장면이 1.5초도 안 보이고 넘어감
# 서서히 겹쳐 넘기는 전환(5프레임 넘게 이어지는 변화)은 셈하지 않음 - 그게 목표인 전환 (2026-10-27: 기준을 6으로 낮췄더니 겹침 전환까지 잡혔음)
ev, k = [], 1
while k < len(fr):
    if sharp(k, d[k]):
        a = k
        while k + 1 < len(fr) and d[k + 1] > 6: k += 1
        if k - a < 4:
            ev.append((a, k))
    k += 1
for (a, b), (c, e) in zip(ev, ev[1:]):
    if 4 < c - b < 45:  # 4프레임 이하는 위 깜빡임 검사가 봄
        print(f"{b} 빠름 {c}")
# 검은 화면·어두운 화면·밋밋한 화면 (2026-10-28, Lemo-Opuscar "자주 하는 실수": 전환 사이 빈 화면, 너무 어두워 안 보임, 같은 색 위 같은 색)
# 1편 기준: 검은 0.5초 이상은 야호령 한 곳뿐, 어두운 3초 이상은 엔딩뿐, 밋밋한 3초 이상은 없음 → 오탐 없이 경고. 끝 21초(엔딩)는 안 봄
mean = np.array([float(a.mean()) for a in fr]); sd = np.array([float(a.std()) for a in fr])
END = len(fr) - 21 * 30
def runs(mask, minlen):
    out, st = [], None
    for k, v in enumerate(list(mask) + [False]):
        if v and st is None: st = k
        if not v and st is not None:
            if k - st >= minlen and 15 < st < END: out.append((st, k - st))
            st = None
    return out
for a, n in runs(mean < 6, 15): print(f"{a} 검은 {n}")
for a, n in runs(mean < 35, 90): print(f"{a} 어두움 {n}")
for a, n in runs(sd < 10, 90): print(f"{a} 밋밋 {n}")
# 뚝 컷: 한 프레임 만에 화면이 통째로 바뀜 (2026-10-27 사용자: "9분 47초 갑작스러운 화면 전환") - 장면 사이는 겹쳐 넘기는 게 원칙, 일부러 자른 곳만 남기기
for a, b in ev:
    if a == b and d[a] > 25 and (a + 1 >= len(fr) or d[a + 1] < 6):
        print(f"{a} 뚝 {d[a]:.0f}")
"""

if video:
    r = subprocess.run([str(tools.python()), "-I", "-c", FLASH, str(Path(video).resolve()), str(ROOT / "scripts")], capture_output=True, text=True, cwd=ROOT)
    if r.returncode:
        err(f"깜빡임 검사 실패: {r.stderr.strip()[-200:]}")
    hits = [ln.split() for ln in r.stdout.strip().splitlines() if ln.strip()]
    hits = [h for h in hits if not (h[1] in ("빠름", "뚝") and int(h[0]) < APPROVED)]
    for kind, msg in (("검은", "검은 화면이 {s:.1f}초 - 전환 사이 빈 화면이면 겹쳐 넘기기, 일부러 둔 어둠이면 그대로"), ("어두움", "어두운 화면이 {s:.1f}초 - 인물·글자가 안 보이지 않나"), ("밋밋", "대비가 낮은 화면이 {s:.1f}초 - 같은 색 위 같은 색이 아닌지")):
        for h in [h for h in hits if h[1] == kind][:10]:
            warn(f"{int(h[0]) / 30 // 60:.0f}:{int(h[0]) / 30 % 60:04.1f} " + msg.format(s=int(h[2]) / 30))
    hits = [h for h in hits if h[1] not in ("검은", "어두움", "밋밋")]
    for h in [h for h in hits if h[1] == "뚝"][:15]:
        warn(f"뚝 컷: {int(h[0]) / 30:.2f}초 한 프레임 만에 화면이 바뀜(변화 {h[2]}) - 일부러 자른 게 아니면 겹쳐서 서서히")
    for h in [h for h in hits if h[1] not in ("빠름", "뚝")][:10]:
        err(f"영상 깜빡임: {int(h[0]) / 30:.2f}초 ({h[0]}프레임, {h[1]}) - 몇 프레임만 튀었다 돌아옴(크롬 타일 깨짐이면 그 프레임만 다시 찍기)")
    for h in [h for h in hits if h[1] == "빠름"][:10]:
        err(f"빠른 전환: {int(h[0]) / 30:.2f}초 장면이 {(int(h[2]) - int(h[0])) / 30:.1f}초 만에 다시 바뀜 - 한 장면은 1.5초 넘게, 넘어갈 땐 겹쳐서 서서히")
    # 통과하면 업로드 허락 표시(.checked) - youtube.mjs가 영상보다 새로운지 본다. 장면 안 컷·어두워짐은 깜빡임이 아니라서
    # 초안(src/draft) 편은 check-flicker.py 대신 이 검사로 (2026-10-26: 1편 1440p에서 check-flicker 오탐 205곳, 눈으로 확인 - 컷·페이드·원형 전환)
    if not [h for h in hits if h[1] != "뚝"] and r.returncode == 0:  # 뚝 컷은 경고라 업로드는 막지 않음
        Path(video + ".checked").write_text("ok")

# ---------- 눈으로 볼 정지 화면 모음 ----------
if "--sheet" in sys.argv:
    out = ROOT / "out/draft-sheets"
    out.mkdir(parents=True, exist_ok=True)
    comp = ep.name.split('-')[0].title() + ep.name.split('-')[1]  # mongol-01 → Mongol01
    for ch in chs:
        bs = bounds(ch)[3:]
        frames = [(a + b) // 2 for a, b in zip(bs, bs[1:])]
        pngs = []
        for old in out.glob(f"ch{ch}-*.png"):
            old.unlink()
        for k, fr in enumerate(frames):
            png = out / f"ch{ch}-{k:02d}.png"
            subprocess.run(tools.remotion("still", "src/index.ts", f"{comp}-Ch{ch}", png, f"--frame={fr}", "--log=error"), cwd=ROOT, check=False)
            if png.exists():
                pngs.append(png)
        if pngs:
            sheet = out / f"{ep.name}-ch{ch}.jpg"
            tile = "import sys; from PIL import Image; ps=sys.argv[2:]; c=4; s=Image.new('RGB',(640*c,360*(-(-len(ps)//c))),'white'); [s.paste(Image.open(q).convert('RGB').resize((640,360)),((k%c)*640,(k//c)*360)) for k,q in enumerate(ps)]; s.save(sys.argv[1],quality=85)"
            subprocess.run([str(tools.python()), "-I", "-c", tile, str(sheet), *map(str, pngs)], check=False)  # Remotion ffmpeg엔 tile 필터가 없음
            print(f"정지 화면 모음: {sheet.relative_to(ROOT)} ({len(pngs)}장 - 묶음마다 가운데 프레임)")

print(f"장 초안 검사 ({ep.name} {'·'.join(chs)}장): 오류 {len(errs)}, 경고 {len(warns)}")
for m in errs:
    print("  오류 -", m)
for m in warns:
    print("  경고 -", m)
print("눈으로 볼 것 (정지 화면·렌더본으로 직접):")
for m in LOOK:
    print("  □", m)
sys.exit(1 if errs else 0)
