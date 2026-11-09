# 동아시아 1209년 지도 - 1편 4장(금·서하·몽골)용. europe-map.py와 같은 방식 + Cliopatria 1209년 나라 윤곽
#   python3 scripts/china-map.py → src/draft/chinaMap.ts (1920×1080, 경도 80~140 · 위도 약 25~51)
#   자리 확인: python3 scripts/china-map.py 106.2,38.5 ...  (화면 좌표)
# 자료: Natural Earth 10m land·lakes·rivers (퍼블릭 도메인), Cliopatria (CC BY 4.0, data/geo/cliopatria/ - map-scene.mjs가 받아 둠)
import importlib.util
import json
import math
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("europe_map", ROOT / "scripts/europe-map.py")
E = importlib.util.module_from_spec(spec)
spec.loader.exec_module(E)
E.LON0, E.LON1, E.LAT_C = 80.0, 140.0, 38.0
E.KX = E.W / (E.LON1 - E.LON0)
E.KY = E.KX / math.cos(math.radians(E.LAT_C))
E.LAT_TOP = E.LAT_C + (E.H / 2) / E.KY
YEAR = 1209
POLITIES = {"mongol": "Mongol Empire", "xia": "Western Xia", "jin": "Great Jin", "song": "Southern Song", "goryeo": "Goryeo",
            "khitan": "Kara-Khitans", "tibet": "Tibetans", "dali": "Kingdom of Dali"}


def lines(shp, min_rank=None):
    """폴리라인(type 3) - 강"""
    data = Path(shp).read_bytes()
    pos = 100
    while pos < len(data):
        _, length = struct.unpack(">ii", data[pos:pos + 8])
        rec = data[pos + 8: pos + 8 + length * 2]
        pos += 8 + length * 2
        if struct.unpack("<i", rec[:4])[0] != 3:
            continue
        x0, y0, x1, y1 = struct.unpack("<4d", rec[4:36])
        if x1 < E.LON0 or x0 > E.LON1 or y1 < 20 or y0 > 55:
            continue
        nparts, npts = struct.unpack("<2i", rec[36:44])
        parts = struct.unpack(f"<{nparts}i", rec[44:44 + 4 * nparts])
        pts = struct.unpack(f"<{npts * 2}d", rec[44 + 4 * nparts: 44 + 4 * nparts + 16 * npts])
        for i, s in enumerate(parts):
            e = parts[i + 1] if i + 1 < nparts else npts
            yield [(pts[2 * k], pts[2 * k + 1]) for k in range(s, e)]


def open_path(seg, min_px=3):
    p = [E.xy(*q) for q in seg]
    keep = [p[0]]
    for q in p[1:]:
        if math.hypot(q[0] - keep[-1][0], q[1] - keep[-1][1]) >= min_px:
            keep.append(q)
    return "M" + "L".join(f"{a:.0f} {b:.0f}" for a, b in keep) if len(keep) > 1 else ""


if __name__ == "__main__":
    ne = ROOT / "data/geo/ne"
    land = E.path(E.polygons(ne / "ne_10m_land/ne_10m_land.shp"), min_px=2.5, min_area=60)
    lakes = E.path(E.polygons(ne / "ne_10m_lakes/ne_10m_lakes.shp"), min_area=400)
    # 큰 강만: 황하·장강 등 - 길이(화면 px)로 거름
    segs = [s for s in lines(ne / "ne_10m_rivers_lake_centerlines/ne_10m_rivers_lake_centerlines.shp")]
    rivers = "".join(open_path(s) for s in segs if sum(math.dist(E.xy(*a), E.xy(*b)) for a, b in zip(s, s[1:])) > 220)
    geo = json.loads(next((ROOT / "data/geo/cliopatria").glob("*.geojson")).read_text())
    pol = {}
    for key, name in POLITIES.items():
        ft = next(f for f in geo["features"] if f["properties"]["Name"] == name and f["properties"]["FromYear"] <= YEAR <= f["properties"]["ToYear"])
        g = ft["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        pol[key] = E.path([ring for poly in polys for ring in poly], min_px=2.5, min_area=200)
    out = ROOT / "src/draft/chinaMap.ts"
    body = "// scripts/china-map.py가 만든 동아시아 1209년 지도 (Natural Earth · Cliopatria CC BY 4.0) - 손대지 말고 다시 뽑기\n"
    body += f"export const CM_LAND = {json.dumps(land)};\nexport const CM_LAKES = {json.dumps(lakes)};\nexport const CM_RIVERS = {json.dumps(rivers)};\n"
    body += f"export const CM_POL: Record<string, string> = {json.dumps(pol, indent=0)};\n"
    out.write_text(body)
    print(f"→ {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    for a in sys.argv[1:]:
        lon, lat = map(float, a.split(","))
        print(a, "→", tuple(round(v) for v in E.xy(lon, lat)))
