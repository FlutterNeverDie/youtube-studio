# 썸네일용 유라시아 지도 + 몽골 제국 최대 판도 (2026-10-26 사용자: "배경에 지도같은거 - 몽골 컨텐츠인지 헷갈리는데")
#   python3 scripts/thumb-map.py → src/thumb/eurasiaMap.ts (1280×720, 제국(경도 25~135)이 화면 왼쪽 0~760에 오게)
# 자료: Natural Earth 10m land (퍼블릭 도메인), Cliopatria Mongol Empire 1279-1284 (CC BY 4.0)
import importlib.util
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("europe_map", ROOT / "scripts/europe-map.py")
E = importlib.util.module_from_spec(spec)
spec.loader.exec_module(E)
E.W, E.H = 1280, 720
E.KX = 760 / 110
E.LON0, E.LON1, E.LAT_C = 25 - 40 / E.KX, 25 + 1240 / E.KX, 45.0
E.KY = E.KX / math.cos(math.radians(E.LAT_C))
E.LAT_TOP = E.LAT_C + (E.H / 2) / E.KY
land = E.path(E.polygons(ROOT / "data/geo/ne/ne_10m_land/ne_10m_land.shp"), min_px=1.5, min_area=30)
geo = json.loads(next((ROOT / "data/geo/cliopatria").glob("*.geojson")).read_text())
ft = next(f for f in geo["features"] if f["properties"]["Name"] == "Mongol Empire" and f["properties"]["FromYear"] == 1279)
g = ft["geometry"]
polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
emp = E.path([r for p in polys for r in p], min_px=1.5, min_area=30)
out = ROOT / "src/thumb/eurasiaMap.ts"
out.write_text("// scripts/thumb-map.py가 만든 썸네일 지도 (Natural Earth · Cliopatria CC BY 4.0) - 손대지 말고 다시 뽑기\n"
               f"export const EA_LAND = {json.dumps(land)};\nexport const EA_EMPIRE = {json.dumps(emp)};\n")
print(f"→ {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
