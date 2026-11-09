# 유라시아 해안선 지도(SVG) - 2편 끝 장(몽골의 정복 → 서쪽에 남은 러시아·유럽), asia-map.py와 같은 방식 (2026-11-02)
#   python3 scripts/eurasia-map.py → public/hook/m02/eurasia.svg (4400×1800, 경도 -12~124)
#   자리 확인: python3 scripts/asia-map.py 68.3,42.85 ...  (화면 좌표는 src/draft/M01Ch5.tsx의 xy()와 같은 식)
# 자료: Natural Earth 10m land·lakes (퍼블릭 도메인, data/geo/ne/)
import importlib.util
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("europe_map", ROOT / "scripts/europe-map.py")
E = importlib.util.module_from_spec(spec)
spec.loader.exec_module(E)

# europe-map의 투영 값을 이 지도에 맞게 바꿔 끼움 (함수들이 모듈 전역을 읽음)
E.LON0, E.LON1, E.LAT_C = -12.0, 124.0, 47.0
E.W, E.H = 4400, 1800
E.KX = E.W / (E.LON1 - E.LON0)
E.KY = E.KX / math.cos(math.radians(E.LAT_C))
E.LAT_TOP = E.LAT_C + (E.H / 2) / E.KY

if __name__ == "__main__":
    ne = ROOT / "data/geo/ne"
    land = E.path(E.polygons(ne / "ne_10m_land/ne_10m_land.shp"))
    lakes = E.path(E.polygons(ne / "ne_10m_lakes/ne_10m_lakes.shp"), min_area=3000)
    out = ROOT / "public/hook/m02/eurasia.svg"
    out.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {E.W} {E.H}" width="{E.W}" height="{E.H}">'
        f'<rect width="{E.W}" height="{E.H}" fill="#c3cbbd"/>'
        f'<path d="{land}" fill="#e6d2a2" fill-rule="evenodd" stroke="#2b1d14" stroke-width="5" stroke-linejoin="round"/>'
        f'<path d="{lakes}" fill="#c3cbbd" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/></svg>')
    print(f"→ {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    print(f"KX {E.KX:.4f} KY {E.KY:.4f} LAT_TOP {E.LAT_TOP:.4f}")
    for a in sys.argv[1:]:
        lon, lat = map(float, a.split(","))
        print(a, "→", tuple(round(v) for v in E.xy(lon, lat)))
