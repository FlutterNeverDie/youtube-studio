# 말 탄 기병 (옆모습, 오른쪽을 봄): 캐릭터와 같은 그림체(먹선 + 바랜 색 + 종이 질감)로 달리는 다리 4장
#   python3 audio/riders.py            → public/riders/<종류>/run0~3.svg (400×310)
# 영상에서 run0~3을 4프레임씩 돌리면 달리고, 위아래로 살짝 들썩이게 한다. 무리는 같은 그림을 크기·색만 조금씩 바꿔 여러 번 놓음
# 몽골 말: 작고 다부진 몸, 큰 머리, 굵은 목, 짧은 다리, 덥수룩한 갈기 (몽골 토종말)
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/riders"
INK = "#2b1d14"
W, H = 400, 310

LOOK = (
    '<filter id="ink" x="-5%" y="-5%" width="110%" height="110%">'
    '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n"/>'
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="2"/></filter>'
    '<filter id="paper" x="0" y="0" width="100%" height="100%">'
    '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="t"/>'
    '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.2  0 0 0 0.4 0" result="tc"/>'
    '<feComposite in="tc" in2="SourceAlpha" operator="in" result="tx"/>'
    '<feBlend in="SourceGraphic" in2="tx" mode="multiply"/></filter>'
)

KINDS = {
    # 몽골 기병: 둥근 쇠 투구 + 붉은 술, 미늘 갑옷, 손에 활
    "mongol": dict(horse="#8a5a36", mane="#3a2618", skin="#d9a87c", cloth="#2f4a5e", armor="#7d93a6",
                   helmet="#8a9298", plume="#a8332a", bow=True),
    # 몽골 기병(밤색 말·갈색 옷) - 무리에 섞어 단조롭지 않게
    "mongol2": dict(horse="#5e4030", mane="#24170f", skin="#cf9d72", cloth="#5a3e28", armor="#8a6440",
                    helmet="#7a7f84", plume="#a8332a", bow=True),
    # 예수게이 (1편 1장): 흰 이마 무늬 검정 말 + 갈색 뾰족 털모자 + 밤색 델 - characters.json yesugei와 같은 색
    "yesugei": dict(horse="#2c2420", mane="#120c08", skin="#d9a77c", cloth="#6a3b2a", armor="#6a3b2a",
                    helmet="#5a3424", plume=None, bow=True, hat="peak", blaze=True, mustache=True),
    # 1편 2장 주인공들 (characters.json 색과 같게) - 무리 맨 앞에서 누가 이끄는지 보이게
    "temujin": dict(horse="#9a7a52", mane="#3a2618", skin="#e9b98c", cloth="#4d6b8a", armor="#4d6b8a",
                    helmet="#7a2e22", fur="#6b4a2e", plume=None, bow=True, hat="fur"),
    "jamukha": dict(horse="#3e3430", mane="#1a120c", skin="#dfa978", cloth="#2f4a3a", armor="#2f4a3a",
                    helmet="#3b3a4a", fur="#5e4a3a", plume=None, bow=True, hat="fur", goatee=True),
    "toghrul": dict(horse="#b9b2a4", mane="#6e665a", skin="#e0ad80", cloth="#4a5a6a", armor="#4a5a6a",
                    helmet="#ece2cc", plume=None, bow=False, hat="peak", beard="#d8d0c4"),
    # 메르키트 기병 (적 - 붉은 갈색 옷, 어두운 털모자)
    "merkit": dict(horse="#4a3a2e", mane="#1a120c", skin="#cf9d72", cloth="#6e2f26", armor="#6e2f26",
                   helmet="#2e2622", fur="#4a3a2e", plume=None, bow=True, hat="fur"),
    # 흰 말 (칸·지휘관)
    "mongol_white": dict(horse="#e8dfcc", mane="#b9ad96", skin="#dcae84", cloth="#9c3a2c", armor="#c9a24a",
                         helmet="#f2ead8", plume="#c9a24a", bow=False),
}

# 다리 자세 (위다리 각도, 아랫다리 각도 - 도, 0 = 똑바로 아래, + = 앞쪽) : 앞다리 둘, 뒷다리 둘
PHASES = [
    ((40, 10), (10, -30), (-10, -40), (30, 20)),
    ((20, -20), (-10, -50), (20, 10), (-20, -60)),
    ((-10, -40), (35, 15), (35, 25), (-35, -10)),
    ((10, -60), (45, 30), (0, -30), (10, 40)),
]


def leg(x, y, a1, a2, col, l1=38, l2=36, w=19):
    r1, r2 = math.radians(a1), math.radians(a2)
    kx, ky = x + l1 * math.sin(r1), y + l1 * math.cos(r1)
    hx, hy = kx + l2 * math.sin(r2), ky + l2 * math.cos(r2)
    d = f"M {x:.0f} {y:.0f} L {kx:.0f} {ky:.0f} L {hx:.0f} {hy:.0f}"
    s = f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w + 9}"/><path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"/>'
    s += f'<ellipse cx="{hx + 3:.0f}" cy="{hy + 4:.0f}" rx="11" ry="7" fill="{INK}" stroke="none"/>'
    return s


def shade(c, k):
    r, g, b = (int(c.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
    return "#" + "".join(f"{max(0, min(255, int(v * k))):02x}" for v in (r, g, b))


def rider_svg(k, phase):
    c = KINDS[k]
    hc = c["horse"]
    far, near = shade(hc, 0.78), hc
    fl, fr, bl, br = PHASES[phase]
    s = ""
    # 먼 쪽 다리 (어둡게, 몸 뒤)
    s += leg(262, 196, *fl, far) + leg(120, 196, *bl, far)
    # 꼬리
    s += f'<path d="M 92 148 C 60 150 44 180 40 214 C 58 200 70 186 96 170 Z" fill="{c["mane"]}"/>'
    # 몸통·목·머리
    s += f'<path d="M 100 168 C 96 132 130 118 180 120 L 246 118 C 262 96 278 72 300 62 C 318 54 336 58 346 72 L 362 112 C 366 122 360 130 350 130 C 338 130 330 124 322 116 L 300 104 C 292 128 286 150 284 168 C 282 206 250 214 190 214 C 130 214 102 204 100 168 Z" fill="{hc}"/>'
    s += f'<path d="M 120 196 C 160 210 230 210 270 196" fill="none" stroke="{shade(hc, 0.8)}" stroke-width="6"/>'
    # 갈기 (덥수룩, 짧게 선 몽골 말 갈기)
    s += f'<path d="M 252 118 C 262 92 280 70 302 60 L 310 70 C 292 82 278 102 268 126 Z" fill="{c["mane"]}"/>'
    s += f'<path d="M 300 58 C 304 50 312 48 318 54 L 312 66 Z" fill="{c["mane"]}"/>'  # 앞머리
    # 귀·눈·콧구멍·고삐
    s += f'<path d="M 318 60 L 322 42 L 330 60 Z" fill="{hc}"/>'
    if c.get("blaze"):  # 이마의 흰 무늬
        s += '<path d="M 330 66 C 340 80 346 96 352 112 L 344 114 C 338 98 330 82 324 70 Z" fill="#efe6d2" stroke="none"/>'
    s += f'<circle cx="326" cy="80" r="4" fill="{INK}" stroke="none"/><circle cx="352" cy="118" r="3" fill="{INK}" stroke="none"/>'
    s += f'<path d="M 342 112 C 320 120 270 128 236 126" fill="none" stroke="{INK}" stroke-width="3"/>'
    # 안장 + 안장 깔개
    s += f'<path d="M 168 118 C 168 140 236 140 236 118 Z" fill="{shade(c["cloth"], 0.7)}"/>'
    s += f'<path d="M 172 120 L 230 120 L 226 160 L 176 160 Z" fill="#8a3b2c"/>'
    # 가까운 다리
    s += leg(270, 200, *fr, near) + leg(128, 200, *br, near)
    # 기병: 다리(장화) - 등자에 걸쳐 앞으로
    s += f'<path d="M 200 120 L 214 156 L 236 168" fill="none" stroke="{INK}" stroke-width="30"/><path d="M 200 120 L 214 156 L 236 168" fill="none" stroke="{c["cloth"]}" stroke-width="20"/>'
    s += f'<path d="M 216 156 L 236 168 L 248 168 C 252 176 244 182 234 180 L 212 172 Z" fill="#3a2b22"/>'
    # 몸통 (앞으로 숙임) + 미늘
    s += f'<path d="M 176 124 C 172 92 186 62 212 56 C 236 52 248 70 246 96 L 238 124 Z" fill="{c["cloth"]}"/>'
    s += f'<path d="M 184 116 C 182 92 192 72 212 66 C 230 64 240 78 238 98 L 232 116 Z" fill="{c["armor"]}"/>'
    for y in (80, 92, 104):
        s += f'<path d="M 188 {y} L 236 {y}" fill="none" stroke="{INK}" stroke-width="2"/>'
    # 팔 + 활
    if c["bow"]:
        s += f'<path d="M 226 70 L 262 78 L 290 70" fill="none" stroke="{INK}" stroke-width="20"/><path d="M 226 70 L 262 78 L 290 70" fill="none" stroke="{c["cloth"]}" stroke-width="12"/>'
        s += f'<path d="M 296 20 C 310 40 310 100 296 120" fill="none" stroke="{INK}" stroke-width="10"/><path d="M 296 20 C 310 40 310 100 296 120" fill="none" stroke="#a87a3e" stroke-width="5"/>'
        s += f'<path d="M 296 22 L 296 118" fill="none" stroke="#e8dcc0" stroke-width="2"/>'
        s += f'<circle cx="294" cy="70" r="9" fill="{c["skin"]}"/>'
    else:  # 고삐를 쥔 손
        s += f'<path d="M 226 70 L 246 98 L 270 110" fill="none" stroke="{INK}" stroke-width="20"/><path d="M 226 70 L 246 98 L 270 110" fill="none" stroke="{c["cloth"]}" stroke-width="12"/>'
        s += f'<circle cx="272" cy="112" r="9" fill="{c["skin"]}"/>'
    # 머리 (옆모습: 둥근 얼굴 + 점 눈 + 투구 + 술)
    s += f'<path d="M 196 40 C 196 12 246 10 248 38 C 250 58 236 70 220 70 C 204 70 196 58 196 40 Z" fill="{c["skin"]}"/>'
    s += f'<circle cx="236" cy="38" r="3.5" fill="{INK}" stroke="none"/><path d="M 228 28 L 242 30" fill="none" stroke="{INK}" stroke-width="4"/>'
    s += f'<path d="M 232 54 L 242 52" fill="none" stroke="{INK}" stroke-width="3"/>'
    if c.get("mustache"):  # 늘어진 콧수염
        s += f'<path d="M 226 50 C 236 46 244 48 246 52 C 244 60 240 66 238 70 C 236 62 232 56 226 54 Z" fill="{INK}" stroke="none"/>'
    if c.get("goatee"):  # 염소수염
        s += f'<path d="M 236 64 C 240 70 240 78 236 82 C 232 76 232 70 236 64 Z" fill="{INK}" stroke="none"/>'
    if c.get("beard"):  # 긴 수염 (토그릴)
        s += f'<path d="M 214 56 C 222 92 238 98 246 60 C 236 66 222 64 214 56 Z" fill="{c["beard"]}"/>'
    if c.get("hat") == "fur":  # 둥근 털모자: 둥근 꼭대기(색) + 넓은 털 챙
        s += f'<path d="M 200 34 C 198 10 248 6 250 32 Z" fill="{c["helmet"]}"/>'
        s += f'<path d="M 190 36 C 196 22 252 20 258 34 C 252 46 196 48 190 36 Z" fill="{c.get("fur", "#6b4a2e")}"/>'
    elif c.get("hat") == "peak":  # 뾰족 꼭대기 털모자 + 털 챙
        s += f'<path d="M 198 34 C 204 10 216 -6 228 -10 C 240 0 250 14 252 32 Z" fill="{c["helmet"]}"/>'
        s += f'<path d="M 190 36 C 200 24 248 22 256 34 C 250 44 198 46 190 36 Z" fill="#6b4a2e"/>'
    else:
        s += f'<path d="M 196 36 C 190 6 250 0 250 32 Z" fill="{c["helmet"]}"/><path d="M 192 32 L 252 30" fill="none" stroke="#c9a24a" stroke-width="6"/>'
        s += f'<path d="M 196 34 C 188 48 188 62 196 70 L 210 66 L 206 36 Z" fill="{shade(c["helmet"], 0.8)}"/>'  # 목 가리개
        s += f'<path d="M 222 6 L 222 -6" fill="none" stroke="{INK}" stroke-width="4"/><path d="M 222 -4 C 206 -6 196 4 192 16 C 204 10 214 8 222 8 Z" fill="{c["plume"]}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -24 {W} {H}" width="{W}" height="{H}"><defs>{LOOK}</defs>'
            f'<g filter="url(#paper)"><g filter="url(#ink)" stroke="{INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">{s}</g></g></svg>')


if __name__ == "__main__":
    for k in KINDS:
        d = OUT / k
        d.mkdir(parents=True, exist_ok=True)
        for p in range(len(PHASES)):
            (d / f"run{p}.svg").write_text(rider_svg(k, p))
        print(f"→ public/riders/{k}/ (run0~{len(PHASES) - 1})")
