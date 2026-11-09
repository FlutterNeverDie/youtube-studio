# 유럽·서아시아 해안선 지도(SVG) - 국경 없이 땅·바다만, 손그림 느낌은 영상 쪽 필터로
#   python3 scripts/europe-map.py → public/hook/m01/europe.svg (1920×1080, 경도 -14~64 · 위도 24~66 근처)
# 자료: Natural Earth 10m land·lakes (퍼블릭 도메인, data/geo/ne/) - 셰이프파일을 직접 읽음(라이브러리 없이)
import math
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LON0, LON1, LAT_C = -14.0, 64.0, 45.0
W, H = 1920, 1080
KX = W / (LON1 - LON0)  # 경도 1도 = 몇 px
KY = KX / math.cos(math.radians(LAT_C))  # 위도는 늘려서 모양을 맞춤 (가운데 위도 기준 정거원통)
LAT_TOP = LAT_C + (H / 2) / KY


def xy(lon, lat):
    return (lon - LON0) * KX, (LAT_TOP - lat) * KY


def polygons(shp):
    data = Path(shp).read_bytes()
    pos = 100
    while pos < len(data):
        _, length = struct.unpack(">ii", data[pos:pos + 8])
        rec = data[pos + 8: pos + 8 + length * 2]
        pos += 8 + length * 2
        if struct.unpack("<i", rec[:4])[0] != 5:
            continue
        x0, y0, x1, y1 = struct.unpack("<4d", rec[4:36])
        if x1 < LON0 - 5 or x0 > LON1 + 5 or y1 < 15 or y0 > 75:
            continue
        nparts, npts = struct.unpack("<2i", rec[36:44])
        parts = struct.unpack(f"<{nparts}i", rec[44:44 + 4 * nparts])
        pts = struct.unpack(f"<{npts * 2}d", rec[44 + 4 * nparts: 44 + 4 * nparts + 16 * npts])
        for i, s in enumerate(parts):
            e = parts[i + 1] if i + 1 < nparts else npts
            yield [(pts[2 * k], pts[2 * k + 1]) for k in range(s, e)]


def path(rings, min_px=1.6, min_area=40):
    out = []
    for ring in rings:
        p = [xy(*q) for q in ring]
        xs = [a for a, _ in p]
        ys = [b for _, b in p]
        if max(xs) < -50 or min(xs) > W + 50 or max(ys) < -50 or min(ys) > H + 50:
            continue
        if (max(xs) - min(xs)) * (max(ys) - min(ys)) < min_area:
            continue
        keep = [p[0]]
        for q in p[1:]:
            if math.hypot(q[0] - keep[-1][0], q[1] - keep[-1][1]) >= min_px:
                keep.append(q)
        if len(keep) > 3:
            out.append("M" + "L".join(f"{a:.1f} {b:.1f}" for a, b in keep) + "Z")
    return "".join(out)


if __name__ == "__main__":
    ne = ROOT / "data/geo/ne"
    land = path(polygons(ne / "ne_10m_land/ne_10m_land.shp"))
    lakes = path(polygons(ne / "ne_10m_lakes/ne_10m_lakes.shp"), min_area=20000)
    out = ROOT / "public/hook/m01/europe.svg"
    out.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f'<rect width="{W}" height="{H}" fill="#c3cbbd"/>'
        f'<path d="{land}" fill="#e6d2a2" fill-rule="evenodd" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>'
        f'<path d="{lakes}" fill="#c3cbbd" stroke="#2b1d14" stroke-width="3" stroke-linejoin="round"/></svg>')
    print(f"→ {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    if len(sys.argv) > 1:  # 자리 확인: python3 scripts/europe-map.py 30.5,50.4 ...
        for a in sys.argv[1:]:
            lon, lat = map(float, a.split(","))
            print(a, "→", tuple(round(v) for v in xy(lon, lat)))
