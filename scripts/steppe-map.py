# 몽골 초원 1160년 지도 - 1편 1장 7판(초원이 수십 부족으로 갈라진 땅). china-map.py와 같은 방식, 몽골 고원이 가운데 오게
#   python3 scripts/steppe-map.py [경도,위도 ...] → src/draft/steppeMap.ts (1920×1080, 경도 86~136 · 위도 약 34~56)
# 자료: Natural Earth 10m (퍼블릭 도메인), Cliopatria 1160년 나라 윤곽 (CC BY 4.0). 몽골 부족들은 Cliopatria에 없음 - 깃발 자리로만
import importlib.util
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("china_map", ROOT / "scripts/china-map.py")
C = importlib.util.module_from_spec(spec)
spec.loader.exec_module(C)
E = C.E
E.LON0, E.LON1, E.LAT_C = 86.0, 136.0, 45.5
E.KX = E.W / (E.LON1 - E.LON0)
E.KY = E.KX / math.cos(math.radians(E.LAT_C))
E.LAT_TOP = E.LAT_C + (E.H / 2) / E.KY
YEAR = 1160
POLITIES = {"jin": "Great Jin", "xia": "Western Xia", "song": "Southern Song", "khitan": "Kara-Khitans", "goryeo": "Goryeo"}

if __name__ == "__main__":
    ne = ROOT / "data/geo/ne"
    land = E.path(E.polygons(ne / "ne_10m_land/ne_10m_land.shp"), min_px=2.5, min_area=60)
    lakes = E.path(E.polygons(ne / "ne_10m_lakes/ne_10m_lakes.shp"), min_area=150)
    # 초원 강(오논·케룰렌·톨·오르콘·셀렝게)까지 보이게 짧은 강도 남김
    segs = list(C.lines(ne / "ne_10m_rivers_lake_centerlines/ne_10m_rivers_lake_centerlines.shp"))
    rivers = "".join(C.open_path(s) for s in segs if sum(math.dist(E.xy(*a), E.xy(*b)) for a, b in zip(s, s[1:])) > 120)
    geo = json.loads(next((ROOT / "data/geo/cliopatria").glob("*.geojson")).read_text())
    pol = {}
    for key, name in POLITIES.items():
        ft = next(f for f in geo["features"] if f["properties"]["Name"] == name and f["properties"]["FromYear"] <= YEAR <= f["properties"]["ToYear"])
        g = ft["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        pol[key] = E.path([ring for poly in polys for ring in poly], min_px=2.5, min_area=200)
    out = ROOT / "src/draft/steppeMap.ts"
    body = "// scripts/steppe-map.py가 만든 몽골 초원 1160년 지도 (Natural Earth · Cliopatria CC BY 4.0) - 손대지 말고 다시 뽑기\n"
    body += f"export const SM_LAND = {json.dumps(land)};\nexport const SM_LAKES = {json.dumps(lakes)};\nexport const SM_RIVERS = {json.dumps(rivers)};\n"
    body += f"export const SM_POL: Record<string, string> = {json.dumps(pol, indent=0)};\n"
    out.write_text(body)
    print(f"→ {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    for a in sys.argv[1:]:
        lon, lat = map(float, a.split(","))
        print(a, "→", tuple(round(v) for v in E.xy(lon, lat)))
