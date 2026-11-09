# 인물 캐릭터: characters.json(Claude가 편마다 설계) → 겹 SVG → 영상에서 숨쉬기·깜빡임·입 움직임
#   python3 audio/characters.py list episodes/mongol-03/ep.json   이 편에 필요한 인물과 아직 설계가 없는 인물
#   python3 audio/characters.py build [id...]                     public/chars/<id>/<포즈>/ 겹 SVG + src/episode/char-rig.json
#   python3 audio/characters.py sheet <png> [id...]               확인용 한 장 (헤드리스 Chrome)
#   .venv/bin/python -I audio/characters.py mouth episodes/mongol-03/ep.json
#                                                                 목소리 → 프레임별 입 모양 public/ep/<편>/ep/mouth.json
# 그림체 (2026-10-26 사용자 OK, 시안 ~/ReStory/시안/새 그림체 시안 (2026-10-26)/):
#   OverSimplified식 전신 - 둥근 얼굴·점 눈·굵은 눈썹으로 표정이 크게 읽히고, 투구·갑옷·무기 소품은 자세히.
#   먹선(#2b1d14) + 바랜 색 + 종이 질감. 인물마다 키(body.height)·덩치(body.build)가 다름
# 판: 그림 좌표 600×900(발바닥 y=880)을 겹 파일 600×720에 0.8배로 담는다(viewBox -75 0 750 900).
#   겹 크기는 예전 상반신 판과 같아서 편집기·지도 얼굴 메달(사이트 sceneFace.ts, 600×720 고정)이 그대로 읽는다
# 겹: body(몸·다리·평소 팔) · head(머리·모자·눈썹·턱수염) · eyes0/eyes1(뜬 눈/감은 눈) · mouth<X·A~H>(발음 입 모양 9개 + 콧수염)
#   · mouth0~2(예전 크기 방식) · arm_<손짓>(손짓하는 팔) · body_<손짓>(그 팔을 뺀 몸). 머리 겹은 영상에서 같이 흔들리고 몸은 숨쉬기
#   목·어깨 자리(영상에서 머리 흔들림·팔 휘두름 중심)는 build가 src/episode/char-rig.json에 적는다
# stages(같은 인물의 나이·상황별 모습)는 public/chars/<id>_<단계>/로 따로 그린다 (장면표 stage 또는 단계의 speakers)
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "characters.json"
OUT = ROOT / "public/chars"
RIG = ROOT / "src/episode/char-rig.json"
INK = "#2b1d14"
W, H = 600, 720  # 겹 파일 크기
GROUND = 880  # 그림 좌표 발바닥
VB = (-75, 0, 750, 900)  # 그림 좌표 → 겹 파일 (0.8배)
BK = W / VB[2]


def board(x, y):
    """그림 좌표 → 겹 파일(600×720) 좌표"""
    return (x - VB[0]) * BK, (y - VB[1]) * BK


def shade(c, k):
    """k<1 어둡게, k>1 밝게"""
    r, g, b = (int(c.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
    f = (lambda v: int(v * k)) if k < 1 else (lambda v: int(v + (255 - v) * (k - 1)))
    return "#" + "".join(f"{max(0, min(255, f(v))):02x}" for v in (r, g, b))


# 겹마다 같은 필터(같은 seed)라 머리·눈·입 겹의 선 흔들림이 서로 맞는다
LOOK = (
    '<filter id="ink" x="-5%" y="-5%" width="110%" height="110%">'
    '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="n"/>'
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter>'
    '<filter id="paper" x="-15%" y="-10%" width="130%" height="120%">'
    '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="t"/>'
    '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.2  0 0 0 0.4 0" result="tc"/>'
    '<feComposite in="tc" in2="SourceAlpha" operator="in" result="tx"/>'
    '<feBlend in="SourceGraphic" in2="tx" mode="multiply" result="m"/>'
    '<feColorMatrix in="m" type="matrix" values="0.88 0.1 0.02 0 0.02  0.05 0.9 0.05 0 0.01  0.04 0.08 0.84 0 0  0 0 0 1 0"/></filter>'
)


def patterns(c):
    """인물 색으로 만든 무늬: lam 미늘(세로로 긴 쇠·가죽 조각을 끈으로 엮은 줄) · mail 사슬 · fur 털 · furw 흰 털"""
    pl = c["plates"]
    lace = c.get("lace", "#8a3b2c")
    fur = c.get("fur", "#7a5638")
    return (
        f'<pattern id="lam" width="16" height="25" patternUnits="userSpaceOnUse">'
        f'<rect width="16" height="25" fill="{shade(pl, 0.7)}"/><rect x="1.5" y="1" width="13" height="21" rx="5" fill="{pl}" stroke="{INK}" stroke-width="2"/>'
        f'<line x1="0" y1="23.5" x2="16" y2="23.5" stroke="{lace}" stroke-width="2.5"/></pattern>'
        '<pattern id="mail" width="10" height="9" patternUnits="userSpaceOnUse">'
        '<rect width="10" height="9" fill="#6f7478"/><circle cx="5" cy="4.5" r="3.4" fill="none" stroke="#b4b9bb" stroke-width="1.8"/></pattern>'
        f'<pattern id="fur" width="14" height="10" patternUnits="userSpaceOnUse">'
        f'<rect width="14" height="10" fill="{fur}"/><path d="M2 9 q2 -6 4 0 M8 7 q2 -6 4 0" stroke="{shade(fur, 0.72)}" stroke-width="2" fill="none"/></pattern>'
        '<pattern id="furw" width="14" height="10" patternUnits="userSpaceOnUse">'
        '<rect width="14" height="10" fill="#9a7a58"/><path d="M2 9 q2 -6 4 0 M8 7 q2 -6 4 0" stroke="#6e5238" stroke-width="2" fill="none"/></pattern>'
    )


def svg(c, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(map(str, VB))}" width="{W}" height="{H}">'
        f"<defs>{LOOK}{patterns(c)}</defs>"
        f'<g filter="url(#paper)"><g filter="url(#ink)" stroke="{INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">{body}</g></g></svg>'
    )


# ---------- 설계 → 그리기 값 ----------
BULK = {"slim": 0.86, "average": 1.0, "stocky": 1.12, "heavy": 1.24}
MONGOL_HATS = {"khan", "fur", "fur_flaps", "fur_peak", "helmet", "boqta", "scarf", "cuman", "none"}


def resolve(c):
    """characters.json 한 인물(단계를 덮어쓴 것) → 그리기 값을 채운 사본"""
    c = dict(c)
    b = c.get("body") or {}
    c["height"] = float(b.get("height", 1.0))
    c["bulk"] = float((c.get("fig") or {}).get("bulk", BULK.get(b.get("build"), 1.0)))
    female = c.get("sex") == "f"
    child = c.get("age") == "child"
    c["head"] = float((c.get("fig") or {}).get("head", 0.94 if child else 0.97 if female else 1.0))
    c.setdefault("face", "round" if child else "oval")
    culture = (c.get("era") or {}).get("culture", "")
    c["boot_style"] = c.get("boot_style") or ("gutal" if ("몽골" in culture or "쿠만" in culture or "케레이트" in culture or not culture) else "plain")
    c.setdefault("boots", "#3a2b22")
    c.setdefault("trim", "#c9a24a")
    c.setdefault("cloth", "#8b3a2b")
    steel_hat = c.get("hat") in ("helmet", "rus_helmet", "turban_helmet")
    c.setdefault("plates", "#7d93a6" if steel_hat and c.get("hat_color", "#888")[1] in "6789ab" else "#8a6440")
    c.setdefault("brow", shade(c.get("hair", "#2a2018"), 0.9))
    c["arm_w"] = 42 * c["bulk"] * (0.84 if child else 1)
    return c


class Fig:
    def __init__(s, c):
        s.c, s.h, s.w, s.hs = c, c["height"], c["bulk"], c["head"]
        s.nx, s.ny = s.T(300, 520)

    def T(s, x, y):  # 몸 좌표(키 1·덩치 1 기준) → 그림 좌표
        return 300 + (x - 300) * s.w, GROUND - (GROUND - y) * s.h

    def Hd(s, x, y):  # 머리 좌표(목 300,515) → 그림 좌표
        return s.nx + (x - 300) * s.hs, s.ny + (y - 515) * s.hs

    def head_g(s, inner):
        return f'<g transform="translate({s.nx:.1f},{s.ny:.1f}) scale({s.hs}) translate(-300,-515)">{inner}</g>'

    def body_g(s, inner):
        return (f'<g transform="translate(300,{GROUND}) scale({s.w},{s.h}) translate(-300,-{GROUND})">'
                + inner.replace("<path ", '<path vector-effect="non-scaling-stroke" ')
                .replace("<rect ", '<rect vector-effect="non-scaling-stroke" ')
                .replace("<circle ", '<circle vector-effect="non-scaling-stroke" ')
                .replace("<ellipse ", '<ellipse vector-effect="non-scaling-stroke" ') + "</g>")


# ---------- 몸 (몸 좌표: 어깨 214·386 / 548, 허리 640, 발바닥 880) ----------
def robe_path(hem, flare=0):
    return (f"M 214 528 C 236 516 270 512 300 512 C 330 512 364 516 386 528 C 404 540 410 560 410 590 "
            f"L {420 + flare} {hem} C {380 + flare / 2} {hem + 12} {220 - flare / 2} {hem + 12} {180 - flare} {hem} L 190 590 C 190 560 196 540 214 528 Z")


def long_outfit(c):
    return c.get("sex") == "f" or c.get("outfit") in ("gown", "robe")


def hem_y(c):
    if c.get("outfit") == "segmentata":  # 로마 튜닉: 무릎 위
        return 740
    return 846 if long_outfit(c) else 782


def back_layer(c):
    s = ""
    cape = c.get("cape")
    if cape and c.get("cape_style") != "rus":  # 어깨에서 뒤로 늘어진 망토
        s += f'<path d="M 206 530 C 160 600 150 720 150 {hem_y(c) + 20} C 230 {hem_y(c) + 42} 370 {hem_y(c) + 42} 450 {hem_y(c) + 20} C 450 720 440 600 394 530 Z" fill="{cape}"/>'
        s += f'<path d="M 162 {hem_y(c) + 10} C 240 {hem_y(c) + 26} 360 {hem_y(c) + 26} 438 {hem_y(c) + 10}" fill="none" stroke="{shade(cape, 0.7)}" stroke-width="5"/>'
    if cape and c.get("cape_style") == "rus":  # 루스 공후 망토(코르즈노) - 오른쪽 어깨 브로치
        s += f'<path d="M 200 528 C 150 610 140 720 146 806 C 240 830 350 828 440 806 C 444 720 430 600 400 528 Z" fill="{cape}"/>'
    if c.get("hat") == "georgian_crown":  # 면사포가 어깨 뒤로
        v = c.get("veil", "#efe6d2")
        s += f'<path d="M 214 500 C 170 560 160 640 166 700 C 240 716 360 716 434 700 C 440 640 430 560 386 500 Z" fill="{v}"/>'
    if c.get("hair_style") == "long" and c.get("hat") not in ("boqta", "georgian_crown"):  # 등 뒤로 내려온 머리
        s += f'<path d="M 236 520 C 220 580 226 640 250 676 L 350 676 C 374 640 380 580 364 520 Z" fill="{c.get("hair", "#1a120c")}"/>'
    if "bow" in c.get("back", []):  # 등의 활 (합성궁 - 양끝이 뒤로 휨)
        s += '<path d="M 400 470 C 470 520 478 640 412 712" fill="none" stroke="#2b1d14" stroke-width="15"/>'
        s += '<path d="M 400 470 C 470 520 478 640 412 712" fill="none" stroke="#a87a3e" stroke-width="8"/>'
        s += '<path d="M 400 470 C 392 462 386 462 382 470 M 412 712 C 404 722 398 722 394 714" fill="none" stroke="#2b1d14" stroke-width="7"/>'
        s += '<line x1="400" y1="472" x2="410" y2="710" stroke="#e8dcc0" stroke-width="2"/>'
    if "spear" in c.get("back", []):
        s += '<path d="M 420 860 L 470 300" fill="none" stroke="#2b1d14" stroke-width="16"/><path d="M 420 860 L 470 300" fill="none" stroke="#7a5230" stroke-width="9"/>'
        s += '<path d="M 470 300 l -12 -6 l 16 -70 l 12 72 Z" fill="#a9aba6"/>'
    return s


def boots(c):
    b = c["boots"]
    s = ""
    top = 760 if not long_outfit(c) else 812
    if c["boot_style"] == "sandal":  # 로마 군화 칼리가: 맨다리 + 발등·발목 가죽끈 (트라야누스 기둥)
        for sgn in (-1, 1):
            x1, x2 = 300 + sgn * 16, 300 + sgn * 66
            s += f'<path d="M {x1} 730 L {x2} 730 L {x2 + sgn*2} 852 L {x1} 852 Z" fill="{c["skin"]}"/>'
            s += (f'<path d="M {x1} 846 L {x2 + sgn*2} 846 C {x2 + sgn*16} 852 {x2 + sgn*20} 864 {x2 + sgn*18} 878 L {x1} 878 Z" fill="{b}"/>')
            for y in (800, 822):
                s += f'<path d="M {x1} {y} L {x2 + sgn*2} {y + 4}" fill="none" stroke="{b}" stroke-width="7"/>'
        return s
    if c["boot_style"] != "gutal":  # 가죽 장화: 발목 위까지, 앞코 둥글게 (루스·호라즘·조지아)
        for sgn in (-1, 1):
            x1, x2 = 300 + sgn * 14, 300 + sgn * 74
            s += (f'<path d="M {x1} {top} L {x2} {top} L {x2 + sgn*2} 846 C {x2 + sgn*14} 852 {x2 + sgn*22} 862 {x2 + sgn*20} 878 '
                  f'L {x1} 878 Z" fill="{b}"/>')
        return s
    # 몽골 장화(구탈): 두꺼운 펠트·가죽, 종아리까지 오는 넓은 통, 앞코만 살짝 들림(말리지 않음), 굽 없음
    for sgn in (-1, 1):
        x1, x2 = 300 + sgn * 12, 300 + sgn * 80
        s += (f'<path d="M {x1} {top} L {x2} {top} L {x2 + sgn*4} 842 C {x2 + sgn*16} 846 {x2 + sgn*26} 846 {x2 + sgn*30} 852 '
              f'C {x2 + sgn*32} 870 {x2 + sgn*24} 878 {x2 + sgn*4} 878 L {x1} 878 Z" fill="{b}"/>')
        if not long_outfit(c):
            s += f'<path d="M {x1} 778 L {x2 + sgn*1} 778" fill="none" stroke="{c["trim"]}" stroke-width="6"/>'
        s += f'<path d="M {x1 + sgn*8} 806 C {x1 + sgn*30} 812 {x2 - sgn*20} 800 {x2} 822" fill="none" stroke="{shade(b, 1.6)}" stroke-width="3"/>'
    return s


def torso(c):
    r, t = c["cloth"], c["trim"]
    kind = c.get("outfit", "deel")
    hem = hem_y(c)
    flare = 14 if long_outfit(c) else 0
    s = f'<path d="M 272 470 L 272 530 L 328 530 L 328 470 Z" fill="{shade(c["skin"], 0.85)}"/>'  # 목 (머리가 들썩여도 틈이 안 보이게)
    s += f'<path d="{robe_path(hem, flare)}" fill="{r}"/>'
    s += f'<path d="M 190 600 L {182 - flare} {hem - 4} C 200 {hem + 2} 220 {hem + 4} 236 {hem + 6} L 228 600 Z" fill="{shade(r, 0.8)}" stroke="none"/>'
    if kind in ("deel", "lamellar", "armor"):
        # 델: 목에서 입은 사람 오른쪽(화면 왼쪽) 겨드랑이로 비스듬히 여밈 + 옷단
        s += f'<path d="M 300 516 C 290 548 262 572 226 590" fill="none" stroke="{t}" stroke-width="14"/>'
        s += f'<path d="M 300 516 C 290 548 262 572 226 590" fill="none" stroke="{INK}" stroke-width="3"/>'
        s += f'<path d="M {184 - flare} {hem - 10} C 240 {hem + 4} 360 {hem + 4} {416 + flare} {hem - 10}" fill="none" stroke="{t}" stroke-width="12"/>'
    if kind == "robe":  # 페르시아 긴 옷(카바): 깊은 V깃 + 안옷 + 앞섶 띠
        s += f'<path d="M 252 518 L 300 600 L 348 518 Z" fill="{c.get("inner", shade(t, 0.85))}"/>'
        s += f'<path d="M 244 516 L 300 606 L 356 516" fill="none" stroke="{t}" stroke-width="10"/>'
        s += f'<path d="M 300 606 L 300 {hem + 8}" fill="none" stroke="{t}" stroke-width="10"/>'
        s += f'<path d="M {184 - flare} {hem - 8} C 240 {hem + 6} 360 {hem + 6} {416 + flare} {hem - 8}" fill="none" stroke="{t}" stroke-width="10"/>'
    if kind == "gown":  # 왕족 긴 옷: 금실 깃 + 가운데 수놓은 띠 + 옷단
        s += f'<path d="M 246 518 C 270 540 330 540 354 518" fill="none" stroke="{t}" stroke-width="14"/>'
        s += f'<path d="M 286 538 L 314 538 L 322 {hem + 8} L 278 {hem + 8} Z" fill="{t}"/>'
        s += f'<path d="M {184 - flare} {hem - 8} C 240 {hem + 6} 360 {hem + 6} {416 + flare} {hem - 8}" fill="none" stroke="{t}" stroke-width="12"/>'
    if kind in ("lamellar", "armor"):  # 미늘 조끼: 어깨에서 허벅지까지
        s += '<path d="M 212 540 C 240 524 360 524 388 540 L 398 720 C 340 734 260 734 202 720 Z" fill="url(#lam)"/>'
        s += f'<path d="M 202 720 C 260 734 340 734 398 720" fill="none" stroke="{c.get("lace", "#8a3b2c")}" stroke-width="7"/>'
    if kind == "mail":  # 사슬 갑옷(무릎 위까지) + 겉옷 띠
        s += '<path d="M 210 532 C 240 520 360 520 390 532 L 404 740 C 340 754 260 754 196 740 Z" fill="url(#mail)"/>'
        s += f'<path d="M 196 740 C 260 754 340 754 404 740" fill="none" stroke="{INK}" stroke-width="4"/>'
        if c.get("surcoat"):
            s += f'<path d="M 262 560 L 338 560 L 352 748 L 248 748 Z" fill="{c["surcoat"]}"/><path d="M 262 560 L 338 560" fill="none" stroke="{t}" stroke-width="7"/>'
    if kind == "segmentata":  # 로마 판금 갑옷(로리카 세그멘타타): 가슴·배를 두른 쇠띠 + 어깨 띠 (트라야누스 기둥)
        s += f'<path d="M 206 534 C 240 520 360 520 394 534 L 400 652 C 340 664 260 664 200 652 Z" fill="{c.get("plate", "#9aa2a6")}"/>'
        for y in (566, 592, 618, 642):
            s += f'<path d="M 204 {y} C 260 {y + 12} 340 {y + 12} 396 {y}" fill="none" stroke-width="4"/>'
        s += f'<path d="M 262 520 L 262 560 M 338 520 L 338 560" fill="none" stroke="{shade(c.get("plate", "#9aa2a6"), 0.7)}" stroke-width="5"/>'
        for x in range(232, 372, 20):  # 허리 아래 가죽 띠(징 박은 앞치마)
            s += f'<path d="M {x} 664 L {x} 720" fill="none" stroke="#2b1d14" stroke-width="10"/><path d="M {x} 664 L {x} 720" fill="none" stroke="#7a5230" stroke-width="5"/>'
    # 허리띠
    s += f'<path d="M 194 628 C 250 642 350 642 406 628 L 407 660 C 350 674 250 674 193 660 Z" fill="{c.get("belt", "#5a3a22")}"/>'
    s += f'<rect x="288" y="636" width="24" height="28" rx="4" fill="{t}"/>'
    if "quiver" in c.get("back", []):  # 오른쪽 허리 화살통(위가 넓은 통에 깃이 위로)
        q = c.get("quiver", "#6e4a2c")
        s += f'<path d="M 392 652 L 432 646 L 440 760 L 404 766 Z" fill="{q}"/>'
        s += f'<path d="M 396 680 L 436 674 M 400 730 L 438 724" fill="none" stroke="{t}" stroke-width="5"/>'
        for x in (398, 408, 418, 428):
            s += f'<path d="M {x} 652 L {x+2} 612" fill="none" stroke="#2b1d14" stroke-width="4"/><path d="M {x-5} 616 L {x+2} 600 L {x+8} 618 Z" fill="#e8dcc0" stroke-width="3"/>'
    if c.get("sword"):  # 왼쪽 허리 칼 (칼집, 십자 날밑 - 루스) / 굽은 칼(saber)
        if c["sword"] == "saber":
            s += '<path d="M 214 652 C 190 700 178 760 186 800" fill="none" stroke="#2b1d14" stroke-width="20"/><path d="M 214 652 C 190 700 178 760 186 800" fill="none" stroke="#5a3a24" stroke-width="12"/>'
            s += '<path d="M 206 646 L 232 656" fill="none" stroke="#2b1d14" stroke-width="10"/><path d="M 206 646 L 232 656" fill="none" stroke="#c9a24a" stroke-width="5"/>'
            s += '<path d="M 222 650 L 232 620" fill="none" stroke="#2b1d14" stroke-width="12"/>'
        else:
            s += '<path d="M 214 650 L 176 800" fill="none" stroke="#2b1d14" stroke-width="20"/><path d="M 214 650 L 176 800" fill="none" stroke="#5a3a24" stroke-width="12"/>'
            s += '<path d="M 200 642 L 236 652" fill="none" stroke="#2b1d14" stroke-width="12"/><path d="M 200 642 L 236 652" fill="none" stroke="#c9a24a" stroke-width="6"/>'
            s += '<path d="M 220 646 L 228 616" fill="none" stroke="#2b1d14" stroke-width="12"/><circle cx="229" cy="612" r="8" fill="#c9a24a"/>'
    if c.get("shield") == "scutum":  # 로마 큰 방패(스쿠툼): 화면 오른쪽, 몸 앞, 붉은 바탕 + 금테 + 가운데 쇠 돋을새김
        s += '<path d="M 372 560 C 400 550 452 550 478 560 L 478 800 C 452 810 400 810 372 800 Z" fill="#a8332a"/>'
        s += '<path d="M 382 572 C 404 564 446 564 468 572 L 468 790 C 446 798 404 798 382 790 Z" fill="none" stroke="#c9a24a" stroke-width="6"/>'
        s += '<circle cx="425" cy="680" r="22" fill="#b8bcbd"/><circle cx="425" cy="680" r="8" fill="#8a8e90" stroke-width="3"/>'
    if c.get("collar") == "fur" or c.get("fur_collar"):  # 털 깃
        s += '<path d="M 222 526 C 256 556 344 556 378 526 C 356 506 244 506 222 526 Z" fill="url(#fur)"/>'
    if c.get("cape_style") == "rus" and c.get("cape"):
        s += f'<path d="M 400 528 C 360 560 330 600 318 640" fill="none" stroke="{c["cape"]}" stroke-width="22"/>'
        s += f'<circle cx="384" cy="540" r="17" fill="{t}"/><circle cx="384" cy="540" r="6" fill="#8a3b2c" stroke-width="3"/>'
    if c.get("pendant") == "cross":  # 네스토리우스파 청동 십자가 (케레이트)
        s += f'<path d="M 300 522 L 300 566" fill="none" stroke-width="3"/><path d="M 292 566 h 16 v 12 h 12 v 14 h -12 v 22 h -16 v -22 h -12 v -14 h 12 Z" fill="{t}" stroke-width="4"/>'
    return s


# 팔: (어깨, 팔꿈치, 손) 몸 좌표, 화면 왼쪽 팔 기준 - 오른팔은 좌우 뒤집음
ARMS = {
    "down": ((214, 548), (194, 640), (204, 724)),
    "limp": ((216, 560), (206, 650), (218, 738)),
    "fist_up": ((214, 548), (152, 520), (160, 432)),
    "hands_up": ((214, 548), (150, 500), (128, 418)),
    "hip": ((214, 548), (140, 598), (188, 648)),
    "point": ((214, 548), (150, 560), (78, 520)),
    "wave": ((214, 548), (136, 528), (148, 430)),
    "open": ((214, 548), (164, 640), (104, 604)),
}
HAND = {"fist_up": "fist", "hip": "fist", "point": "point", "hands_up": "open", "wave": "open", "open": "open"}


def sleeve_col(c):
    return c.get("sleeve") or ("#6f7478" if c.get("outfit") == "mail" else c["cloth"])


def stroke_arm(c, d, wdt):
    return (f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{wdt + 12:.0f}"/>'
            f'<path d="{d}" fill="none" stroke="{sleeve_col(c)}" stroke-width="{wdt:.0f}"/>')


def hand_at(c, hx, hy, kind, dx, r=22):
    skin = c["skin"]
    s = f'<circle cx="{hx:.0f}" cy="{hy:.0f}" r="{r}" fill="{skin}"/>'
    if kind == "point":  # 집게손가락
        s += (f'<path d="M {hx + dx*16:.0f} {hy - 4:.0f} l {dx*26} -6" fill="none" stroke="{INK}" stroke-width="20"/>'
              f'<path d="M {hx + dx*16:.0f} {hy - 4:.0f} l {dx*26} -6" fill="none" stroke="{skin}" stroke-width="11"/>')
    elif kind == "open":  # 펼친 손: 엄지
        s += f'<ellipse cx="{hx + dx*20:.0f}" cy="{hy - 4:.0f}" rx="9" ry="13" fill="{skin}" transform="rotate({dx*30} {hx + dx*20:.0f} {hy - 4:.0f})"/>'
    elif kind == "fist":
        s += f'<path d="M {hx-11:.0f} {hy-6:.0f} l 20 0 M {hx-11:.0f} {hy+5:.0f} l 20 0" fill="none" stroke="{INK}" stroke-width="3"/>'
    return s


def arm(f, kind, right):
    c = f.c
    pts = ARMS[kind]
    if right:
        pts = tuple((600 - x, y) for x, y in pts)
    (sx, sy), (ex, ey), (hx, hy) = (f.T(*p) for p in pts)
    d = f"M {sx:.0f} {sy:.0f} Q {ex:.0f} {ey:.0f} {hx:.0f} {hy:.0f}"
    wdt = c["arm_w"]
    s = stroke_arm(c, d, wdt)
    t = 0.86  # 소매 끝(말발굽 소매) 띠
    cx = (1 - t) ** 2 * sx + 2 * (1 - t) * t * ex + t * t * hx
    cy = (1 - t) ** 2 * sy + 2 * (1 - t) * t * ey + t * t * hy
    s += f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{wdt/2+4:.0f}" fill="{c.get("cuff", c["trim"])}"/>'
    s += shoulder_guard(f, right)
    s += hand_at(c, hx, hy, HAND.get(kind, "plain"), 1 if right else -1, 25 if kind == "fist_up" else 22)
    return s


def shoulder_guard(f, right):
    if f.c.get("outfit") not in ("lamellar", "armor"):
        return ""
    ax, ay = f.T(386 if right else 214, 548)
    return f'<path d="M {ax-30:.0f} {ay-14:.0f} C {ax-10:.0f} {ay-30:.0f} {ax+12:.0f} {ay-30:.0f} {ax+30:.0f} {ay-14:.0f} L {ax+24:.0f} {ay+44:.0f} L {ax-24:.0f} {ay+44:.0f} Z" fill="url(#lam)"/>'


def crossed_arms(f):
    """팔짱: 위팔 둘 → 왼쪽 아래팔(손은 오른 위팔 밑에 숨음) → 오른쪽 아래팔이 위로 가로질러 왼 위팔을 잡음"""
    c = f.c
    wdt = c["arm_w"]
    P = lambda x, y: "%.0f %.0f" % f.T(x, y)  # noqa: E731
    s = stroke_arm(c, f"M {P(214, 548)} Q {P(186, 600)} {P(204, 652)}", wdt)
    s += stroke_arm(c, f"M {P(204, 652)} Q {P(300, 662)} {P(380, 628)}", wdt)  # 왼 아래팔 (아래)
    s += stroke_arm(c, f"M {P(386, 548)} Q {P(414, 600)} {P(396, 652)}", wdt)
    s += stroke_arm(c, f"M {P(396, 620)} Q {P(300, 640)} {P(226, 610)}", wdt)  # 오른 아래팔 (위)
    cx, cy = f.T(392, 624)
    s += f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{wdt/2+4:.0f}" fill="{c.get("cuff", c["trim"])}"/>'
    s += shoulder_guard(f, False) + shoulder_guard(f, True)
    hx, hy = f.T(222, 606)
    s += f'<ellipse cx="{hx:.0f}" cy="{hy:.0f}" rx="20" ry="24" fill="{c["skin"]}"/>'
    s += f'<path d="M {hx-12:.0f} {hy-10:.0f} l 0 20 M {hx-2:.0f} {hy-12:.0f} l 0 22" fill="none" stroke-width="3"/>'
    return s


# ---------- 머리 (머리 좌표: 얼굴 가운데 300,400 / 목 300,515) ----------
FACES = {
    "round": "M 182 400 C 182 300 418 300 418 400 C 418 476 370 516 300 516 C 230 516 182 476 182 400 Z",
    "oval": "M 190 396 C 190 296 410 296 410 396 C 410 478 366 518 300 518 C 234 518 190 478 190 396 Z",
    "square": "M 180 392 C 180 300 420 300 420 392 C 422 456 410 500 360 514 C 330 520 270 520 240 514 C 190 500 178 456 180 392 Z",
}
SIDE = "matrix(0.86 0 0 1 72 0)"  # 옆(3/4)모습: 이목구비를 오른쪽으로 30 옮기고 가로로 줄임


def feat(view, inner):
    return f'<g transform="{SIDE}">{inner}</g>' if view == "side" else inner


def hair_back(c, view):
    hair = c.get("hair", "#2a2018")
    st = c.get("hair_style", "braids")
    s = ""
    if st == "braids" and c.get("hat") not in ("rus_helmet", "turban", "turban_helmet", "georgian_crown"):
        # 몽골 남자 머리: 정수리 밀고 귀 뒤로 땋아 고리로(케귈)
        for sgn in (-1, 1):
            if view == "side" and sgn > 0:
                continue
            x = 300 + sgn * 112
            s += f'<path d="M {x} 410 C {x + sgn*44} 420 {x + sgn*50} 500 {x + sgn*14} 512 C {x - sgn*8} 500 {x + sgn*4} 450 {x} 440 Z" fill="{hair}"/>'
            s += f'<path d="M {x + sgn*16} 450 l {sgn*14} 6 M {x + sgn*18} 476 l {sgn*14} 4" fill="none" stroke="{shade(hair, 1.8)}" stroke-width="3"/>'
    if st == "long" and c.get("hat") not in ("boqta", "georgian_crown"):  # 얼굴 양옆으로 내려오는 머리 (턱 밑은 비움)
        for x, d in ((190, 1), (410, -1)):
            s += f'<path d="M {x} 340 C {x - d*30} 420 {x - d*30} 500 {x - d*8} 540 L {x + d*40} 540 C {x + d*20} 480 {x + d*14} 420 {x + d*34} 360 Z" fill="{hair}"/>'
    return s


def hat_back(c, view):
    """얼굴 뒤로 가는 모자 부분: 투구 목·귀 가리개(얼굴을 가리지 않게 뒤로), 사슬 목가리개, 면사포"""
    h = c.get("hat", "none")
    s = ""
    if h == "helmet":  # 미늘 목·귀 가리개 - 귀 자리에서 턱 높이까지, 얼굴 뒤
        s += '<path d="M 186 356 C 160 400 158 460 176 492 L 214 482 L 212 360 Z" fill="url(#lam)"/>'
        if view != "side":
            s += '<path d="M 414 356 C 440 400 442 460 424 492 L 386 482 L 388 360 Z" fill="url(#lam)"/>'
    if h in ("rus_helmet", "turban_helmet"):  # 사슬 목가리개가 얼굴 둘레·목을 덮음
        s += '<path d="M 176 360 C 160 450 170 540 210 560 L 390 560 C 430 540 440 450 424 360 Z" fill="url(#mail)"/>'
    if h == "georgian_crown":  # 얇은 면사포가 어깨까지
        v = c.get("veil", "#efe6d2")
        for sgn in (-1, 1):  # 얼굴 양옆 띠 (어깨 뒤로 늘어진 부분은 몸 겹 back_layer)
            x = 300 + sgn * 94
            s += f'<path d="M {x} 330 C {x + sgn*44} 400 {x + sgn*52} 470 {x + sgn*46} 540 L {x + sgn*10} 540 C {x + sgn*16} 470 {x + sgn*10} 410 {x - sgn*6} 350 Z" fill="{v}"/>'
    if h == "scarf":
        col = c.get("hat_color", "#4f6d5a")
        s += f'<path d="M 184 330 C 150 420 150 520 170 560 L 430 560 C 450 520 450 420 416 330 Z" fill="{col}"/>'
    return s


def ears(c, view):
    if c.get("hat") in ("rus_helmet", "helmet", "fur_flaps", "turban_helmet", "scarf", "georgian_crown") or c.get("hair_style") == "long":
        return ""
    skin = c["skin"]
    xs = (-1,) if view == "side" else (-1, 1)
    return "".join(f'<ellipse cx="{300 + sgn*(112 if view != "side" else 106)}" cy="420" rx="16" ry="22" fill="{skin}"/>' for sgn in xs)


def hat(c):
    h = c.get("hat", "none")
    col = c.get("hat_color", "#7a2e22")
    t = c["trim"]
    s = ""
    if h == "khan":  # 흰 펠트 모자 + 털 테 (원 황실 초상의 칭기즈칸)
        s += f'<path d="M 200 352 C 196 250 404 250 400 352 Z" fill="{c.get("hat_color", "#f2ead8")}"/>'
        s += '<path d="M 300 262 C 290 290 290 330 296 352 M 250 278 C 244 300 244 330 248 350 M 350 278 C 356 300 356 330 352 350" fill="none" stroke="#c8bba0" stroke-width="4"/>'
        s += '<path d="M 176 350 C 176 326 424 326 424 350 C 424 378 176 378 176 350 Z" fill="url(#furw)"/>'
        s += f'<circle cx="300" cy="254" r="11" fill="{t}"/>'
    elif h == "helmet":  # 둥근 원뿔 쇠 투구 + 말총 술 (집사 세밀화·몽고습래회사) - 가리개는 hat_back
        s += f'<path d="M 300 236 C 236 246 194 300 190 362 L 410 362 C 406 300 364 246 300 236 Z" fill="{col}"/>'
        s += f'<path d="M 300 240 L 300 360 M 248 262 C 236 296 232 330 234 360 M 352 262 C 364 296 368 330 366 360" fill="none" stroke="{shade(col, 0.72)}" stroke-width="5"/>'
        s += f'<path d="M 186 352 C 220 342 380 342 414 352 L 414 372 C 380 362 220 362 186 372 Z" fill="{t}"/>'
        s += '<path d="M 300 236 L 300 200" stroke-width="9"/>'
        if c.get("plume"):
            p = c["plume"]
            s += f'<path d="M 300 196 C 276 196 258 214 252 246 C 270 236 282 232 300 230 C 318 232 330 236 348 246 C 342 214 324 196 300 196 Z" fill="{p}"/>'
            s += f'<path d="M 276 214 C 270 222 266 230 264 238 M 300 204 L 300 226 M 324 214 C 330 222 334 230 336 238" fill="none" stroke="{shade(p, 0.65)}" stroke-width="3"/>'
        else:
            s += f'<circle cx="300" cy="198" r="9" fill="{t}"/>'
    elif h == "fur_flaps":  # 귀덮개 털모자 (초원 사람의 겨울 모자)
        for sgn in (-1, 1):
            x = 300 + sgn * 118
            s += f'<path d="M {x - sgn*24} 350 C {x + sgn*18} 360 {x + sgn*22} 440 {x + sgn*6} 478 C {x - sgn*14} 476 {x - sgn*26} 440 {x - sgn*30} 360 Z" fill="url(#fur)"/>'
        s += f'<path d="M 196 350 C 192 254 408 254 404 350 Z" fill="{col}"/>'
        s += f'<path d="M 300 258 L 300 346" stroke="{shade(col, 0.7)}" stroke-width="5"/>'
        s += '<path d="M 182 350 C 182 322 418 322 418 350 C 418 376 182 376 182 350 Z" fill="url(#fur)"/>'
    elif h == "fur":  # 몽골 털모자: 둥근 꼭대기 + 넓은 털 테
        s += f'<path d="M 202 352 C 198 258 402 258 398 352 Z" fill="{col}"/>'
        s += f'<path d="M 336 288 C 376 300 398 322 398 352 L 362 352 C 362 326 354 304 336 288 Z" fill="{shade(col, 0.75)}" stroke="none"/>'
        s += f'<path d="M 300 262 L 300 244" stroke-width="7"/><circle cx="300" cy="240" r="9" fill="{t}"/>'
        s += '<path d="M 178 350 C 178 324 422 324 422 350 C 422 378 178 378 178 350 Z" fill="url(#fur)"/>'
    elif h == "fur_peak":  # 뾰족한 꼭대기 + 앞이 갈라져 올라간 털 챙 (몽골·케레이트 귀족)
        s += f'<path d="M 206 352 C 214 290 262 238 300 206 C 338 238 386 290 394 352 Z" fill="{col}"/>'
        s += f'<path d="M 300 206 C 338 238 386 290 394 352 L 356 352 C 350 290 330 240 300 206 Z" fill="{shade(col, 0.78)}" stroke="none"/>'
        s += f'<circle cx="300" cy="204" r="9" fill="{t}"/>'
        s += '<path d="M 178 362 C 172 330 236 322 290 334 L 300 352 L 310 334 C 364 322 428 330 422 362 C 360 350 240 350 178 362 Z" fill="url(#fur)"/>'
    elif h == "cuman":  # 쿠만: 높은 뾰족 펠트 모자(끝이 앞으로 살짝 꺾임) + 털 챙 (쿠만 돌 인물상)
        s += f'<path d="M 208 352 C 214 280 262 220 318 180 C 330 196 326 212 316 222 C 362 270 388 310 392 352 Z" fill="{col}"/>'
        s += f'<path d="M 316 222 C 362 270 388 310 392 352 L 354 352 C 350 300 336 256 316 222 Z" fill="{shade(col, 0.76)}" stroke="none"/>'
        s += '<path d="M 180 352 C 180 326 420 326 420 352 C 420 378 180 378 180 352 Z" fill="url(#fur)"/>'
    elif h == "boqta":  # 몽골 귀부인 보크타: 머리에 맞는 모자 + 높은 기둥 + 위가 벌어진 꼭대기
        s += f'<path d="M 190 380 C 184 270 416 270 410 380 C 360 362 240 362 190 380 Z" fill="{col}"/>'
        s += f'<path d="M 280 290 C 278 240 270 190 262 150 L 338 150 C 330 190 322 240 320 290 Z" fill="{col}"/>'
        s += f'<path d="M 304 290 C 306 240 312 190 318 150 L 338 150 C 330 190 322 240 320 290 Z" fill="{shade(col, 0.72)}" stroke="none"/>'
        s += f'<path d="M 248 156 Q 300 136 352 156 L 342 170 Q 300 156 258 170 Z" fill="{t}"/>'
        s += f'<path d="M 274 206 L 326 206 M 272 244 L 328 244" fill="none" stroke="{t}" stroke-width="6"/>'
        s += f'<path d="M 190 380 C 240 362 360 362 410 380" fill="none" stroke="{t}" stroke-width="10"/>'
        if c.get("veil"):  # 뒤로 늘어진 천
            pass
    elif h == "turban":  # 터번: 흰 천을 감은 둥근 덩어리
        cl = c.get("hat_color", "#efe4cc")
        s += f'<path d="M 184 372 C 150 214 450 214 416 372 C 380 352 220 352 184 372 Z" fill="{cl}"/>'
        s += f'<path d="M 194 340 C 260 302 350 312 410 350 M 194 302 C 260 266 340 272 404 306 M 240 280 C 282 266 322 268 362 282" fill="none" stroke="{shade(cl, 0.72)}" stroke-width="4"/>'
    elif h == "turban_helmet":  # 터번을 감은 뾰족 투구 (호라즘 전사)
        steel = c.get("steel", "#9a9c96")
        cl = c.get("hat_color", "#efe4cc")
        s += f'<path d="M 214 330 C 216 270 262 230 300 196 C 338 230 384 270 386 330 Z" fill="{steel}"/>'
        s += f'<path d="M 300 196 C 338 230 384 270 386 330 L 350 330 C 346 280 330 236 300 196 Z" fill="{shade(steel, 0.74)}" stroke="none"/>'
        s += '<path d="M 300 196 L 300 176" stroke-width="7"/>'
        s += f'<path d="M 182 372 C 166 310 434 310 418 372 C 380 352 220 352 182 372 Z" fill="{cl}"/>'
        s += f'<path d="M 190 346 C 260 322 350 326 412 352" fill="none" stroke="{shade(cl, 0.72)}" stroke-width="4"/>'
    elif h == "rus_helmet":  # 루스 원뿔 투구 + 코 가리개 (립베츠형 투구) + 금테
        s += f'<path d="M 300 176 C 270 230 214 290 196 366 L 404 366 C 386 290 330 230 300 176 Z" fill="{c.get("hat_color", "#9aa2a6")}"/>'
        s += '<path d="M 300 182 C 290 240 286 310 288 366" fill="none" stroke="#c6ccce" stroke-width="10"/>'
        s += f'<path d="M 192 354 L 408 354 L 408 380 L 192 380 Z" fill="{t}"/>'
        s += f'<circle cx="300" cy="172" r="8" fill="{t}"/>'
    elif h == "crown_cap":  # 루스 공후 모자: 둥근 천 모자 + 검은 털 띠 (스뱌토슬라프 이즈보르니크 세밀화)
        s += f'<path d="M 204 352 C 198 252 402 252 396 352 Z" fill="{col}"/>'
        s += f'<path d="M 336 284 C 376 298 396 322 396 352 L 360 352 C 360 326 352 302 336 284 Z" fill="{shade(col, 0.74)}" stroke="none"/>'
        s += '<path d="M 176 350 C 176 322 424 322 424 350 C 424 380 176 380 176 350 Z" fill="url(#fur)"/>'
    elif h == "georgian_crown":  # 조지아 여왕관: 금 띠 + 십자가 끝 (면사포는 hat_back)
        g = c.get("hat_color", "#d6a838")
        s += f'<path d="M 204 362 L 204 312 L 230 330 L 252 286 L 276 324 L 300 270 L 324 324 L 348 286 L 370 330 L 396 312 L 396 362 Z" fill="{g}"/>'
        s += "".join(f'<path d="M {x} {y} l 0 -20 M {x - 7} {y - 13} l 14 0" fill="none" stroke-width="5"/>' for x, y in ((252, 286), (300, 270), (348, 286)))
        s += f'<path d="M 198 352 Q 300 336 402 352 L 402 374 Q 300 358 198 374 Z" fill="{shade(g, 0.88)}"/>'
        s += "".join(f'<circle cx="{x}" cy="{362 - 5 * (1 - ((x - 300) / 100) ** 2):.0f}" r="{8 if x == 300 else 6}" fill="{gc}" stroke-width="3"/>' for x, gc in ((236, "#2e6b4f"), (268, "#8b2f22"), (300, "#2a5db0"), (332, "#8b2f22"), (364, "#2e6b4f")))
    elif h == "scarf":  # 여인 머릿수건
        s += f'<path d="M 184 380 C 170 270 430 270 416 380 C 380 350 220 350 184 380 Z" fill="{col}"/>'
        s += f'<path d="M 190 360 C 240 330 360 330 410 360" fill="none" stroke="{t}" stroke-width="8"/>'
    elif h == "galea":  # 로마 갈레아(임페리얼 갈릭형): 둥근 쇠 사발 + 이마 턱 + 넓은 목 가리개 + 볼 가리개(얼굴 옆) + 붉은 깃털 볏
        s += f'<path d="M 176 382 C 168 420 172 460 188 474 L 214 466 L 210 380 Z" fill="{col}"/><path d="M 424 382 C 432 420 428 460 412 474 L 386 466 L 390 380 Z" fill="{col}"/>'
        s += '<path d="M 300 296 C 258 280 250 222 266 196 C 280 176 320 176 334 196 C 350 222 342 280 300 296 Z" fill="#a8332a"/>'
        s += '<path d="M 282 206 C 278 236 284 262 292 282 M 300 188 L 300 290 M 318 206 C 322 236 316 262 308 282" fill="none" stroke="#6e1f18" stroke-width="3"/>'
        s += f'<path d="M 192 366 C 186 256 414 256 408 366 Z" fill="{col}"/>'
        s += f'<path d="M 184 358 C 220 346 380 346 416 358 L 416 376 C 380 366 220 366 184 376 Z" fill="{t}"/>'
    elif h == "achaemenid_band":  # 페르시아 불사부대: 머리 위 꼰 머리띠 (수사 궁전 유약 벽돌 궁수 행렬)
        hair = c.get("hair", "#1a120c")
        s += f'<path d="M 186 384 C 176 270 424 270 414 384 C 392 336 352 322 300 330 C 248 322 208 336 186 384 Z" fill="{hair}"/>'
        for x in range(206, 400, 24):  # 곱슬 머리 끝
            s += f'<circle cx="{x}" cy="{352 if 230 < x < 370 else 366}" r="11" fill="{hair}"/>'
        s += f'<path d="M 188 340 C 230 320 370 320 412 340 L 412 358 C 370 338 230 338 188 358 Z" fill="{col}"/>'
        s += f'<path d="M 200 344 l 16 -10 M 236 336 l 16 -8 M 272 332 l 16 -6 M 308 332 l 16 -4 M 344 334 l 16 0 M 380 340 l 14 4" fill="none" stroke="{shade(col, 0.6)}" stroke-width="4"/>'
    elif h == "crown":  # (옛 설계용) 단순한 금 띠 관
        s += f'<path d="M 204 362 L 204 300 L 252 330 L 300 290 L 348 330 L 396 300 L 396 362 Z" fill="{col}"/>'
    elif h == "hood":
        s += f'<path d="M 170 420 C 150 250 450 250 430 420 C 420 340 380 310 300 308 C 220 310 180 340 170 420 Z" fill="{col}"/>'
    else:  # 모자 없음: 머리카락
        hair = c.get("hair", "#2a2018")
        if c.get("hair_style") == "braids":  # 정수리를 민 몽골 머리 + 앞머리 한 줌
            s += f'<path d="M 194 360 C 200 286 400 286 406 360 C 380 330 220 330 194 360 Z" fill="{shade(c["skin"], 0.82)}"/>'
            s += f'<path d="M 286 312 C 292 336 308 336 314 312 L 310 352 L 290 352 Z" fill="{hair}"/>'
        else:
            s += f'<path d="M 186 384 C 176 270 424 270 414 384 C 392 336 352 322 300 330 C 248 322 208 336 186 384 Z" fill="{hair}"/>'
    return s


# ---------- 얼굴 ----------
EYE_L, EYE_R, EYE_Y = 254, 346, 418
BROW_Y = 382
# 눈썹 (바깥 x, 바깥 y, 안쪽 x, 안쪽 y) - 눈 x 기준, 왼눈 (오른눈은 좌우 뒤집음)
BROWS = {
    "neutral": (-34, 4, 26, -2),
    "stern": (-34, -2, 24, 7),
    "angry": (-34, -8, 22, 10),
    "shocked": (-30, -12, 30, -18),
    "happy": (-32, -6, 30, -8),
    "sad": (-30, 8, 26, -12),
    "worried": (-32, 5, 26, -9),
    "smug": (-32, 0, 28, -10),
}
MOOD_BROW = {"calm": "neutral", "stern": "stern", "angry": "stern", "worried": "worried", "smug": "neutral"}
HAT_TOP = {"rus_helmet": 166, "boqta": 136, "helmet": 190, "cuman": 176, "fur_peak": 196, "turban_helmet": 168, "georgian_crown": 262,
           "khan": 244, "fur": 232, "fur_flaps": 262, "turban": 262, "crown_cap": 262, "scarf": 280}


def brows(c, expr):
    shape = MOOD_BROW.get(c.get("mood", "calm"), "neutral") if expr == "neutral" else expr
    x0, y0, x1, y1 = BROWS[shape]
    thin = c.get("sex") == "f"
    s = ""
    for x, sgn in ((EYE_L, 1), (EYE_R, -1)):
        a, b = (x + sgn * x0, BROW_Y + y0), (x + sgn * x1, BROW_Y + y1)
        if expr == "smug" and sgn < 0:  # 한쪽 눈썹만 치켜 올림
            a, b = (x - x0, BROW_Y - 14), (x - x1, BROW_Y - 4)
        s += f'<path d="M {a[0]} {a[1]} L {b[0]} {b[1]}" stroke="{INK}" stroke-width="{10 if thin else 15}"/>'
        s += f'<path d="M {a[0]} {a[1]} L {b[0]} {b[1]}" stroke="{c["brow"]}" stroke-width="{4 if thin else 6}"/>'
    return s


def eyes(c, expr, closed):
    s = ""
    col = c.get("eye_color", INK)
    if expr == "happy":  # 눈웃음(∩) - 감아도 같음
        return "".join(f'<path d="M {x-14} {EYE_Y+4} Q {x} {EYE_Y-14} {x+14} {EYE_Y+4}" fill="none" stroke-width="7"/>' for x in (EYE_L, EYE_R))
    if closed:
        return "".join(f'<path d="M {x-14} {EYE_Y} Q {x} {EYE_Y+9} {x+14} {EYE_Y}" fill="none" stroke-width="6"/>' for x in (EYE_L, EYE_R))
    if expr == "shocked":
        return "".join(f'<ellipse cx="{x}" cy="{EYE_Y}" rx="19" ry="23" fill="#f6efe0" stroke-width="5"/><circle cx="{x}" cy="{EYE_Y+2}" r="6" fill="{col}" stroke="none"/>' for x in (EYE_L, EYE_R))
    if expr == "smug":  # 반쯤 감은 눈
        return "".join(f'<circle cx="{x}" cy="{EYE_Y+2}" r="10" fill="{col}" stroke="none"/><path d="M {x-16} {EYE_Y-3} L {x+16} {EYE_Y-3}" stroke="{c["skin"]}" stroke-width="10"/>'
                       f'<path d="M {x-16} {EYE_Y-3} L {x+16} {EYE_Y-3}" stroke-width="5"/>' for x in (EYE_L, EYE_R))
    rx, ry = {"narrow": (9, 11), "round": (11, 14)}.get(c.get("eyes"), (10, 13))
    if c.get("age") == "child":
        rx, ry = rx + 2, ry + 2
    if expr == "sad":
        ry -= 2
    for k, x in enumerate((EYE_L, EYE_R)):
        s += f'<ellipse cx="{x}" cy="{EYE_Y}" rx="{rx}" ry="{ry}" fill="{col}" stroke="none"/><circle cx="{x+3}" cy="{EYE_Y-4}" r="3" fill="#fff" stroke="none"/>'
        if c.get("sex") == "f":  # 바깥 눈꼬리 속눈썹
            sgn = -1 if k == 0 else 1
            s += f'<path d="M {x + sgn*(rx-1)} {EYE_Y-ry+5} l {sgn*8} -6" fill="none" stroke-width="4"/>'
    if expr == "sad":  # 눈물
        s += f'<path d="M {EYE_R+6} {EYE_Y+18} Q {EYE_R-2} {EYE_Y+36} {EYE_R+6} {EYE_Y+44} Q {EYE_R+14} {EYE_Y+36} {EYE_R+6} {EYE_Y+18} Z" fill="#8cc4e8" stroke="#3a6a8a" stroke-width="3"/>'
    return s


def beard_col(c):
    return c.get("beard_color", c.get("hair", "#2a2018"))


def beard_chin(c):
    """턱수염 (머리 겹 - 입 아래에 깔림)"""
    b, col = c.get("beard", "none"), beard_col(c)
    my = 478
    if b == "mustache":  # 아래턱의 가는 수염 (칸 초상)
        return f'<path d="M 300 {my+24} C 290 {my+44} 296 {my+60} 306 {my+66} C 310 {my+50} 312 {my+38} 304 {my+24} Z" fill="{col}"/>'
    if b == "thin":
        return f'<path d="M 300 {my+28} l 0 18" stroke="{col}" stroke-width="9"/>'
    if b == "goatee":
        return f'<path d="M 282 504 C 286 534 300 548 304 552 C 312 536 318 520 318 504 C 306 510 294 510 282 504 Z" fill="{col}"/>'
    if b == "short":
        return f'<path d="M 200 440 C 204 500 250 532 300 534 C 350 532 396 500 400 440 C 380 488 340 496 300 496 C 260 496 220 488 200 440 Z" fill="{col}"/>'
    if b in ("full", "rus_full"):  # 턱을 덮는 둥근 수염
        return f'<path d="M 196 430 C 200 520 250 560 300 560 C 350 560 400 520 404 430 C 380 480 340 470 300 470 C 260 470 220 480 196 430 Z" fill="{col}"/>'
    if b == "long":  # 가슴까지 내려오는 긴 수염 (노인)
        return (f'<path d="M 196 430 C 200 530 252 600 300 646 C 348 600 400 530 404 430 C 380 480 340 470 300 470 C 260 470 220 480 196 430 Z" fill="{col}"/>'
                f'<path d="M 262 530 C 272 570 284 600 296 626 M 338 530 C 328 570 316 600 304 626" fill="none" stroke="{shade(col, 0.75)}" stroke-width="3"/>')
    return ""


def mustache(c):
    """콧수염 (입 겹 - 입 위에 덮임)"""
    b, col = c.get("beard", "none"), beard_col(c)
    if b == "thin":
        return f'<path d="M 274 466 C 286 458 314 458 326 466" fill="none" stroke="{col}" stroke-width="6"/>'
    drop = {"mustache": 38, "droop": 74, "short": 14, "full": 14, "rus_full": 14, "long": 22}.get(b)
    if drop is None:
        return ""
    return (f'<path d="M 300 458 C 276 452 254 462 248 {470+drop} C 262 {476+drop/2} 270 470 300 468 '
            f'C 330 470 338 {476+drop/2} 352 {470+drop} C 346 462 324 452 300 458 Z" fill="{col}"/>')


MY = 478
REST = {  # 쉴 때 입 (표정별)
    "neutral": f'<path d="M 280 {MY} Q 300 {MY+4} 320 {MY}" fill="none" stroke-width="6"/>',
    "angry": f'<path d="M 270 {MY+8} Q 300 {MY-12} 330 {MY+8} Q 300 {MY} 270 {MY+8} Z" fill="#6b2a22" stroke-width="5"/><path d="M 278 {MY+2} L 322 {MY+2}" stroke="#f6efe0" stroke-width="5"/>',
    "shocked": f'<ellipse cx="300" cy="{MY+6}" rx="18" ry="24" fill="#6b2a22" stroke-width="6"/>',
    "happy": f'<path d="M 266 {MY-6} Q 300 {MY+40} 334 {MY-6} Z" fill="#6b2a22" stroke-width="6"/><path d="M 280 {MY+16} Q 300 {MY+26} 320 {MY+16}" fill="none" stroke="#d9786a" stroke-width="7"/>',
    "smug": f'<path d="M 276 {MY+4} Q 304 {MY+10} 330 {MY-10}" fill="none" stroke-width="6"/>',
    "sad": f'<path d="M 278 {MY+10} Q 300 {MY-6} 322 {MY+10}" fill="none" stroke-width="6"/>',
}
# 발음 입 모양 9개 (Rhubarb Lip Sync 기호, 2026-10-21): 목소리를 음소로 풀어 프레임마다 고른다
#   X 쉼 · A 입술 닫힘(ㅁ·ㅂ·ㅍ, M·B·P) · B 살짝 벌림(대부분 자음) · C 벌림(에·애) · D 크게(아)
#   E 둥글게(오·어) · F 오므림(우·W) · G 윗니가 아랫입술(F·V) · H 혀 올림(L)
VISEMES = "XABCDEFGH"


def viseme(code, c, expr):
    if code == "X":
        return REST[expr]
    if expr == "shocked":  # 놀람은 모양과 상관없이 둥근 입, 크기만 따라감
        ry = {"A": 10, "B": 13, "F": 12, "G": 13}.get(code, 22)
        return f'<ellipse cx="300" cy="{MY + 4}" rx="{12 + ry * 0.25:.1f}" ry="{ry}" fill="#6b2a22" stroke-width="6"/>'
    lip = shade(c["skin"], 0.62)
    up = -6 if expr == "happy" else (3 if expr == "sad" else 0)  # 입꼬리
    top = MY - 6
    if code == "A":  # 닫힌 입술: 도톰한 한 줄
        return (f'<path d="M 278 {MY + up} Q 300 {MY + 4} 322 {MY + up}" fill="none" stroke-width="7"/>'
                f'<path d="M 284 {MY + 7} Q 300 {MY + 12} 316 {MY + 7}" fill="none" stroke="{lip}" stroke-width="4"/>')
    # 모양별 (반너비, 높이, 윗니, 아랫니, 혀, 둥글기)
    w, h, tt, tb, tongue, rnd = {
        "B": (22, 9, True, True, False, 0),
        "C": (26, 18, True, False, False, 0),
        "D": (28, 32, True, False, True, 0),
        "E": (19, 22, False, False, True, 0.6),
        "F": (11, 13, False, False, False, 1),
        "G": (22, 10, True, False, False, 0),
        "H": (24, 22, True, False, True, 0),
    }[code]
    if expr == "angry":
        w, tb = w + 4, True
    if expr == "happy" and not rnd:
        w += 4
    cy = top + h / 2
    if rnd:
        s = f'<ellipse cx="300" cy="{cy}" rx="{w}" ry="{h / 2 + 2}" fill="#6b2a22" stroke-width="6"/>'
    else:
        s = f'<path d="M {300 - w} {top + up} Q 300 {top - 4} {300 + w} {top + up} Q {300 + w * 0.75} {top + h} 300 {top + 2 + h} Q {300 - w * 0.75} {top + h} {300 - w} {top + up} Z" fill="#6b2a22" stroke-width="5"/>'
    if tongue:
        s += f'<ellipse cx="300" cy="{top + h * 0.8:.1f}" rx="{w * 0.5:.1f}" ry="{max(4, h * 0.2):.1f}" fill="#d9786a" stroke="none"/>'
    if tt:
        s += f'<path d="M {300 - w + 7} {top + 2} L {300 + w - 7} {top + 2} L {300 + w - 9} {top + min(8, h * 0.45):.1f} L {300 - w + 9} {top + min(8, h * 0.45):.1f} Z" fill="#f6efe0" stroke="none"/>'
    if tb:
        s += f'<path d="M {300 - w + 10} {top + h - 4} L {300 + w - 10} {top + h - 4} L {300 + w - 12} {top + h} L {300 - w + 12} {top + h} Z" fill="#f6efe0" stroke="none"/>'
    if code == "G":  # 아랫입술을 윗니가 문다
        s += f'<path d="M {300 - w + 2} {top + h} Q 300 {top + h + 8} {300 + w - 2} {top + h}" fill="none" stroke="{lip}" stroke-width="6"/>'
    return s


def head_layer(c, view, expr):
    skin = c["skin"]
    s = hat_back(c, view) + hair_back(c, view) + ears(c, view)
    s += f'<path d="{FACES.get(c.get("face"), FACES["oval"])}" fill="{skin}"/>'
    s += f'<path d="M 196 420 C 204 470 240 504 284 512 C 236 512 194 478 192 420 Z" fill="{shade(skin, 0.86)}" stroke="none"/>'
    ft = "".join(f'<ellipse cx="{300 + sgn*70}" cy="452" rx="20" ry="11" fill="#d98a72" opacity="{0.7 if c.get("sex") == "f" else 0.55}" stroke="none"/>' for sgn in (-1, 1))
    if c.get("age") == "old":
        ft += '<path d="M 222 440 q 12 8 26 4 M 352 444 q 14 4 26 -4 M 262 352 q 38 -8 76 0" fill="none" stroke-width="4" opacity="0.6"/>'
    if c.get("scar"):
        ft += '<path d="M 360 372 C 366 392 370 414 368 440" fill="none" stroke="#9a4a3a" stroke-width="5"/>'
    if view == "side":
        ft += '<path d="M 300 428 C 318 444 318 452 302 456" fill="none" stroke-width="5"/>'
    else:
        ft += '<path d="M 298 430 C 292 446 296 452 306 452" fill="none" stroke-width="5"/>'
    ft += beard_chin(c)
    s += feat(view, ft)
    hs = hat(c)
    s += f'<g transform="translate(12 0)">{hs}</g>' if view == "side" else hs
    if c.get("hat") == "rus_helmet":  # 코 가리개는 이목구비와 같이 움직임
        s += feat(view, f'<path d="M 290 378 L 310 378 L 308 452 L 292 452 Z" fill="{c.get("hat_color", "#9aa2a6")}"/>')
    s += feat(view, brows(c, expr))
    top = HAT_TOP.get(c.get("hat"), 280)
    if expr == "shocked":
        s += f'<path d="M 166 {top + 60} l -24 -24 M 434 {top + 60} l 24 -24 M 300 {top - 14} l 0 -34" fill="none" stroke-width="7"/>'
    if expr == "angry":
        s += '<path d="M 452 330 l 30 -10 M 456 360 l 34 4 M 148 330 l -30 -10" fill="none" stroke="#a8332a" stroke-width="7"/>'
    return s


# ---------- 포즈 ----------
# 장면표 "pose"로 고른다 (없으면 front). arms = (화면 왼쪽 팔, 화면 오른쪽 팔) 또는 "crossed"(팔짱)
POSES = {
    "front": ("front", "neutral", ("down", "down")),
    "side": ("side", "neutral", ("down", "down")),  # 3/4 옆모습, 오른쪽을 봄 (왼쪽은 영상에서 뒤집기 facing: "left")
    "angry": ("front", "angry", ("down", "fist_up")),
    "shocked": ("front", "shocked", ("hands_up", "hands_up")),
    "sad": ("front", "sad", ("limp", "limp")),
    "happy": ("front", "happy", ("hip", "wave")),
    "smug": ("front", "smug", "crossed"),  # 거만: 팔짱 + 반쯤 감은 눈 + 한쪽 눈썹 (2026-10-26)
}
# 손짓 (장면표 "gesture"): 영상에서 그 팔이 어깨를 중심으로 휘둘러 올라온다. 값 = (왼팔, 오른팔), None = 그 팔은 포즈 그대로
GESTURES = {"point": (None, "point"), "fist": (None, "fist_up"), "open": ("open", "open")}


def pose_layers(c, pose):
    f = Fig(c)
    view, expr, arms = POSES[pose]
    core = f.body_g(back_layer(c) + boots(c) + torso(c))
    if arms == "crossed":
        rest = crossed_arms(f)
        rest_l, rest_r = arm(f, "down", False), None
    else:
        rest_l, rest_r = arm(f, arms[0], False), arm(f, arms[1], True)
        rest = rest_l + rest_r
    out = {"body": core + rest}
    for g, (gl, gr) in GESTURES.items():
        keep = "" if gl else rest_l
        out[f"body_{g}"] = core + keep
        out[f"arm_{g}"] = (arm(f, gl, False) if gl else "") + arm(f, gr, True)
    out["head"] = f.head_g(head_layer(c, view, expr))
    out["eyes0"] = f.head_g(feat(view, eyes(c, expr, False)))
    out["eyes1"] = f.head_g(feat(view, eyes(c, expr, True)))
    for v in VISEMES:
        out[f"mouth{v}"] = f.head_g(feat(view, viseme(v, c, expr) + mustache(c)))
    for k, v in enumerate("XCD"):  # 예전 크기 방식 0·1·2
        out[f"mouth{k}"] = out[f"mouth{v}"]
    return out


def rig(c):
    f = Fig(c)
    r = lambda p: [round(v, 1) for v in board(*p)]  # noqa: E731
    return {"neck": r((f.nx, f.ny)), "shoulderR": r(f.T(386, 548)), "shoulderL": r(f.T(214, 548)), "top": round(board(0, f.Hd(300, HAT_TOP.get(c.get("hat"), 280))[1])[1], 1)}


def variants(spec):
    """(폴더 이름, 그리기 값) - 인물 기본 + stages마다 <id>_<단계>"""
    for cid, c in spec.items():
        yield cid, resolve(c)
        for st, over in (c.get("stages") or {}).items():
            o = {k: v for k, v in over.items() if k not in ("speakers", "basis")}
            body = {**(c.get("body") or {}), **{k: o.pop(k) for k in ("height", "build") if k in o}}
            yield f"{cid}_{st}", resolve({**c, **o, "body": body})


def build(ids=None):
    import shutil

    spec = json.loads(SPEC.read_text())["characters"]
    rigs = json.loads(RIG.read_text()) if RIG.exists() else {}
    for vid, c in variants(spec):
        if ids and vid not in ids and not any(i in spec and vid.startswith(i + "_") and vid[len(i) + 1:] in (spec[i].get("stages") or {}) for i in ids):
            continue
        d = OUT / vid
        if d.exists():
            shutil.rmtree(d)
        for pose in POSES:
            pd = d / pose
            pd.mkdir(parents=True)
            for name, inner in pose_layers(c, pose).items():
                (pd / f"{name}.svg").write_text(svg(c, inner))
        rigs[vid] = rig(c)
        print(f"→ public/chars/{vid}/ (포즈 {len(POSES)}개)")
    RIG.write_text(json.dumps(dict(sorted(rigs.items())), indent=1) + "\n")


def sheet(png, ids=None, poses=None, mouths=False, scale=0.5, ground=True):
    """확인용 한 장: 인물 × 포즈 (또는 한 명의 입 모양 9개). 헤드리스 Chrome으로 찍는다"""
    import subprocess
    import tempfile

    spec = json.loads(SPEC.read_text())["characters"]
    ids = ids or [k for k, _ in variants(spec)]
    poses = poses or list(POSES)
    cw, ch = int(W * scale), int(H * scale)
    rows = []
    for vid in ids:
        cells = []
        items = [(p, "mouthX") for p in poses] if not mouths else [("front", f"mouth{v}") for v in VISEMES]
        for p, m in items:
            base = (OUT / vid / p).as_uri()
            layers = "".join(f'<img src="{base}/{l}.svg">' for l in ("body", "head", "eyes0", m))
            cells.append(f'<div class="c">{layers}</div>')
        rows.append(f'<div class="r">{"".join(cells)}</div>')
    html = (f'<html><body style="margin:0;background:#e9dcc0"><style>.r{{display:flex}}.c{{position:relative;width:{cw}px;height:{ch}px}}'
            f'.c img{{position:absolute;inset:0;width:100%;height:100%}}</style>{"".join(rows)}</body></html>')
    with tempfile.TemporaryDirectory() as tmp:
        hp = Path(tmp) / "sheet.html"
        hp.write_text(html)
        n = len(items)
        subprocess.run([str(tools.chrome()), "--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--hide-scrollbars",
                        f"--window-size={cw * n},{ch * len(rows)}", f"--screenshot={Path(png).resolve()}", hp.as_uri()],
                       check=True, capture_output=True)
    print(f"→ {png}")


def needed(ep_path):
    ep = json.loads(Path(ep_path).read_text())
    spec = json.loads(SPEC.read_text())["characters"] if SPEC.exists() else {}
    by_speaker = {s.upper(): cid for cid, c in spec.items() for s in c.get("speakers", [])}
    names = json.loads((ROOT / "episodes/names.json").read_text())["names"]
    speakers = sorted({s["speaker"] for s in ep["scenes"] if s.get("speaker")})
    mentioned = sorted({n for n in names if not names[n].get("place") for s in ep["scenes"] if n in (s.get("text") or "")})
    print("대사 인물:")
    for s in speakers:
        print(f"  {s:24} {'→ ' + by_speaker[s.upper()] if s.upper() in by_speaker else '설계 없음'}")
    print("대사에 나오는 이름(사전):")
    for n in mentioned:
        hit = [cid for cid, c in spec.items() if n in c.get("names", [])]
        print(f"  {n:24} {'→ ' + hit[0] if hit else '설계 없음'}")


sys.path.insert(0, str(ROOT / "scripts"))
import tools  # noqa: E402 - 외부 프로그램 위치 (맥·윈도우)

RHUBARB = tools.rhubarb()


def visemes(wav, text, lang, fps):
    """Rhubarb로 목소리 → 프레임마다 입 모양 글자(X·A~H). 영어는 대사 글로 음소를 맞추고, 다른 언어는 소리만으로(phonetic)"""
    import subprocess, tempfile

    with tempfile.TemporaryDirectory() as tmp:
        cmd = [str(RHUBARB), "-q", "--machineReadable", "-f", "tsv", "--extendedShapes", "GHX"]
        if lang == "en" and text:
            dialog = Path(tmp) / "d.txt"
            dialog.write_text(text)
            cmd += ["-d", str(dialog)]
        else:
            cmd += ["-r", "phonetic"]
        out = subprocess.run(cmd + [str(wav)], capture_output=True, text=True, check=True).stdout
    cues = [(float(t), v) for t, v in (l.split("\t") for l in out.strip().splitlines())]
    with __import__("wave").open(str(wav)) as w:
        n = int(w.getnframes() / w.getframerate() * fps) + 1
    res, k = [], 0
    for f in range(n):
        while k + 1 < len(cues) and cues[k + 1][0] <= f / fps:
            k += 1
        res.append(cues[k][1] if cues else "X")
    return "".join(res)


def mouth(ep_path):
    """목소리 wav → 프레임마다 입 모양. Rhubarb가 있으면 발음 입 모양 9개(X·A~H), 없으면 크기로 0(닫힘)·1·2(크게). 장면 길이·fps는 timeline.json 기준"""
    import wave

    import numpy as np

    ep = Path(ep_path)
    base = ROOT / "public/ep" / ep.parent.name / ep.stem
    tl = json.loads((base / "timeline.json").read_text())
    fps = tl["fps"]
    res = {}
    for sc in tl["scenes"]:
        langs = [("en", sc.get("vo"), sc.get("text")), *((l, p, (sc.get("i18n") or {}).get(l)) for l, p in (sc.get("vo_i18n") or {}).items())]
        for lang, path, text in langs:
            if not path or path in res:
                continue
            f = ROOT / "public" / path
            if not f.exists():
                continue
            if RHUBARB.exists():
                try:
                    res[path] = visemes(f, text, lang, fps)
                    continue
                except Exception as e:  # noqa: BLE001 - 한 줄 실패는 크기 방식으로
                    print(f"  입 모양(Rhubarb) 실패 {path}: {e}")
            with wave.open(str(f)) as w:
                sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
                x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32)
            x = x.reshape(-1, ch).mean(axis=1) if ch > 1 else x
            hop = sr // fps
            rms = np.array([np.sqrt(np.mean(x[i : i + hop] ** 2)) if len(x[i : i + hop]) else 0 for i in range(0, len(x), hop)])
            peak = np.percentile(rms, 95) or 1
            lv = np.where(rms > peak * 0.55, 2, np.where(rms > peak * 0.18, 1, 0))
            # 한 프레임짜리 깜빡임은 지운다 (입이 덜덜 떨리지 않게)
            for i in range(1, len(lv) - 1):
                if lv[i - 1] == lv[i + 1] != lv[i]:
                    lv[i] = lv[i - 1]
            res[path] = "".join(map(str, lv))
    (base / "mouth.json").write_text(json.dumps(res))
    print(f"→ {base.relative_to(ROOT)}/mouth.json ({len(res)}개 목소리)")


if __name__ == "__main__":
    cmd, *args = sys.argv[1:] or ["build"]
    {"build": lambda: build(args or None), "list": lambda: needed(args[0]), "mouth": lambda: mouth(args[0]),
     "sheet": lambda: sheet(args[0], args[1:] or None)}[cmd]()
