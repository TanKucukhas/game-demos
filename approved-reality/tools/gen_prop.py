#!/usr/bin/env python3
"""
APPROVED REALITY — sahne parcalari (prop) uretimi.

Duvar/zemin kodda kalir (isik motoru onlari zaten guzel isliyor); masa, poster,
telekran, pencere, yatak, kapi gibi NESNELER burada tek tek uretilir. Boylece
yerlesim kodda kalir ("masayi 4 piksel sola al" hala mumkun) ve isik motoru
parcalarin uzerinde calisir.

  python3 tools/gen_prop.py masa
  python3 tools/gen_prop.py --hepsi
  python3 tools/gen_prop.py poster --n 4        # aday uret, secim sayfasi cikar
  python3 tools/gen_prop.py poster --pick 2     # adayi kalici yap
"""
import base64, io, json, os, shutil, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART  = os.path.join(ROOT, "art")
PROP = os.path.join(ART, "prop")
PREV = os.path.join(ART, "preview")
API  = "https://api.pixellab.ai/v1/generate-image-pixflux"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_karakter import token, to_palette, trim

LOOK = ("dark bleak orwellian dystopia, cold blue-grey palette, worn and grimy, "
        "single weak light from the left, flat side view, 2d adventure game "
        "object sprite on transparent background")

# TEK OLCEK REFERANSI: ayakta bir insan 45 piksel (art/kar_stand.png).
# Butun parca olculeri bundan turetilir, yoksa masa ile yatak ayri dunyalardan
# gelmis gibi duruyor.
INSAN = 45
def p(oran_w, oran_h):            # insan boyunun kati
    return (round(INSAN*oran_w), round(INSAN*oran_h))

# isim: (genislik, yukseklik, tanim)
PROPS = {
 # yazi masasi: bel hizasi (~0.45 boy), genislik ~1 boy
 "masa":     (*p(1.05, 0.46), "a worn wooden writing desk seen from the side, "
              "flat top, four straight legs, one drawer"),
 # tabure: oturma yuksekligi ~0.28 boy
 "tabure":   (*p(0.38, 0.30), "a small plain wooden stool, three legs, side view"),
 # tek kisilik karyola: uzunluk ~1.6 boy, yukseklik ~0.4
 "yatak":    (*p(1.62, 0.40), "a narrow iron framed single bed seen from the "
              "side, thin grey mattress, one flat pillow at the left end, "
              "folded dark blanket"),
 # kapi: insandan biraz uzun
 "kapi":     (*p(0.58, 1.45), "a heavy scratched wooden door, closed, flat "
              "front view, metal handle on the right, worn frame"),
 # duvar telekrani
 "telekran": (*p(1.10, 0.82), "a bulky wall mounted surveillance screen unit, "
              "thick metal bezel, empty dark glass screen, small red light"),
 # pencere
 "pencere":  (*p(0.85, 0.78), "a barred window, iron cross bars over dark "
              "glass, worn metal frame, night behind it"),
 # afis: metin YOK (slogan koddan basiliyor)
 "poster":   (*p(0.70, 0.95), "a blank red propaganda poster sheet pinned to a "
              "wall, plain paper, no text, no letters, no face, worn corners"),
 "lamba":    (*p(0.30, 0.34), "a small metal desk lamp with a conical shade "
              "bent over, side view"),
 "boru":     (*p(0.16, 1.55), "a rusted vertical heating pipe with a round "
              "valve wheel, side view"),
}

def palette_b64():
    """oyunun malzeme rampalarindan turetilen ortak palet"""
    from PIL import Image
    cols = ["#0e0c16","#151827","#1e2333","#2c3040","#443f4a",   # WALL
            "#0c0a12","#14121e","#1c1c2a","#282634","#3e3a44",   # FLOOR
            "#101320","#1e2331","#303848","#485264","#687892",   # METAL
            "#3e3648","#5c5555","#7e7768","#a29a82","#c8bfa0",   # PAPER
            "#4a1026","#701a2c","#96222e","#bc3a36","#d95c46",   # RED
            "#1a0f14","#2c1c16","#42291a","#5c3d22","#7a552e",   # WOOD
            "#141c2e","#243044","#3c4c62","#5c7288","#8aa2b4"]   # GLASS
    img = Image.new("RGB", (len(cols), 1))
    for i, h in enumerate(cols):
        img.putpixel((i, 0), tuple(int(h[j:j+2], 16) for j in (1, 3, 5)))
    buf = io.BytesIO(); img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()

def generate(desc, w, h, seed=None):
    body = {
        "description": desc + ", " + LOOK,
        "negative_description": "person, people, character, hands, text, words, "
                                "watermark, ui, frame, border, background, floor, "
                                "wall, room, scenery, multiple objects",
        "image_size": {"width": w, "height": h},
        "no_background": True,
        "view": "side",
        "outline": "selective outline",
        "shading": "basic shading",
        "detail": "medium detail",
        "text_guidance_scale": 8,
        "color_image": {"type": "base64", "base64": palette_b64()},
    }
    if seed is not None: body["seed"] = seed
    req = urllib.request.Request(API, json.dumps(body).encode(),
        {"Content-Type": "application/json", "Authorization": "Bearer " + token()})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return base64.b64decode(json.load(r)["image"]["base64"])
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} [{w}x{h}]\n{e.read().decode()[:400]}")

def shrink(img, s):
    """tam sayi katsayiyla kucult — baskin renk, alfa duyarli"""
    from PIL import Image
    if s == 1: return img
    w, h = img.width//s, img.height//s
    out = Image.new("RGBA", (w, h), (0,0,0,0)); src = img.load(); d = out.load()
    need = (s*s)//2
    for y in range(h):
        for x in range(w):
            v, op = {}, 0
            for i in range(s):
                for j in range(s):
                    px = src[x*s+i, y*s+j]
                    if px[3] < 128: continue
                    op += 1; v[px[:3]] = v.get(px[:3], 0) + 1
            if op >= max(1, need):
                d[x, y] = (*max(v.items(), key=lambda kv: kv[1])[0], 255)
    return out

def make(name, n=1):
    from PIL import Image
    w, h, desc = PROPS[name]
    os.makedirs(PROP, exist_ok=True); os.makedirs(PREV, exist_ok=True)
    # pixflux min 32x32 alan: yeterli olana kadar tam sayi kat buyut, sonra indir
    scale = 1
    while (w*scale)*(h*scale) < 1024: scale += 1
    gw, gh = w*scale, h*scale
    gw += gw & 1; gh += gh & 1          # API cift sayi istiyor
    cands = []
    for k in range(n):
        raw = generate(desc, gw, gh, seed=300+k*173 if n > 1 else None)
        img = Image.open(io.BytesIO(raw)).convert("RGBA")
        img = to_palette(trim(shrink(img, scale)))
        cands.append(img)
        print(f"  [{k}] {img.width}x{img.height} (hedef {w}x{h})")
    if n == 1:
        cands[0].save(os.path.join(PROP, f"{name}.png"))
        return
    z = 6
    W = sum(c.width for c in cands)*z + 8*(n+1)
    H = max(c.height for c in cands)*z + 16
    sheet = Image.new("RGBA", (W, H), (12, 14, 20, 255)); x = 8
    for k, c in enumerate(cands):
        c.save(os.path.join(PREV, f"prop_{name}_{k}.png"))
        big = c.resize((c.width*z, c.height*z), Image.NEAREST)
        sheet.paste(big, (x, 8), big); x += big.width + 8
    sheet.save(os.path.join(PREV, f"prop_{name}_secim.png"))
    print("  secim:", os.path.join(PREV, f"prop_{name}_secim.png"))

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    n, pick = 1, None
    for i, a in enumerate(sys.argv):
        if a == "--n": n = int(sys.argv[i+1])
        if a == "--pick": pick = int(sys.argv[i+1])
    if pick is not None:
        name = args[0]
        shutil.copy(os.path.join(PREV, f"prop_{name}_{pick}.png"),
                    os.path.join(PROP, f"{name}.png"))
        print("secildi:", name, pick); return
    names = list(PROPS) if "--hepsi" in sys.argv else args
    for name in names:
        print(f"[pixellab] {name}")
        make(name, n)

if __name__ == "__main__":
    main()
