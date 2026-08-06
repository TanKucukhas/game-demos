#!/usr/bin/env python3
"""
APPROVED REALITY — oyun ici karakter sprite uretimi (PixelLab).

Portredeki yuz ve kiyafeti oyun icindeki kucuk karaktere tasir.
Seffaf arka plan + oyunun paletini API'ye zorlar, sonra oyun olcusune indirir.

  python3 tools/gen_karakter.py stand          # duruş
  python3 tools/gen_karakter.py walk           # 4 kareli yuruyus
  python3 tools/gen_karakter.py stand --size 12x20
"""
import base64, io, json, os, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV  = os.path.join(os.path.dirname(ROOT), "1984", ".env")
ART  = os.path.join(ROOT, "art")
PREV = os.path.join(ART, "preview")
# pixflux prompt'a daha sadik (min 32x32 alan), bitforge 16px'e kadar iner
# ama renk yonergesini tutmuyor -> varsayilan pixflux.
API_PIXFLUX  = "https://api.pixellab.ai/v1/generate-image-pixflux"
API_BITFORGE = "https://api.pixellab.ai/v1/generate-image-bitforge"

# oyunun karakter paleti — portreyle ayni dunya
# NOT: nötr gri-maviler sart. Palette sadece ten + koyu lacivert olunca
# gri yuzeyler en yakin renk olarak TEN'e dusuyor ve karakter ciplak cikiyor.
PALETTE = [
    "#c9a27c", "#a87f60",                                   # ten
    "#332619", "#241f1b",                                   # sac
    "#8aa2b4", "#687892", "#5c7288", "#4e6a8e",             # acik gri-mavi
    "#485264", "#3c4c62", "#33506b", "#303848",             # orta gri-mavi
    "#22344c", "#1e2331", "#141c2c", "#101320",             # koyu lacivert
    "#10161f", "#0d0b0f",                                   # bot / golge
]

BODY = ("plain DARK NAVY BLUE standard issue uniform, closed high collar tunic "
        "buttoned all the way up to the neck, long sleeves covering both arms "
        "completely, matching dark blue trousers, black boots, only the face "
        "and hands show skin, entirely blue clothing, minimal futuristic")
FACE = ("weary man around 40 years old, short dark hair, blank neutral "
        "expression, no smile, tired eyes")

POSES = {
 "stand": f"tiny full body game character sprite, whole figure head to toe, "
          f"both legs and both boots fully visible, {FACE}, no hat, wearing a "
          f"{BODY}, standing upright still, arms straight down at sides, facing "
          "the viewer, dystopian citizen, bleak orwellian mood",
 "walk":  f"tiny full body game character sprite, entire body visible from head "
          f"to feet including legs and boots, {FACE}, wearing a {BODY}, mid "
          "stride walking, one leg forward one leg back, facing the viewer, "
          "small head, dystopian citizen",
 "sit":   f"full body pixel art character sprite of a {FACE}, wearing a {BODY}, "
          "seated on a stool hunched over a desk writing, side view",
}

def token():
    for line in open(ENV, encoding="utf-8"):
        if line.startswith("PIXELLAB_TOKEN"):
            return line.split("=", 1)[1].strip()
    sys.exit("PIXELLAB_TOKEN yok: " + ENV)

def palette_b64():
    """paleti tek satirlik png'ye gomup base64 dondurur"""
    from PIL import Image
    img = Image.new("RGB", (len(PALETTE), 1))
    for i, hx in enumerate(PALETTE):
        img.putpixel((i, 0), tuple(int(hx[j:j+2], 16) for j in (1, 3, 5)))
    buf = io.BytesIO(); img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()

def file_b64(path, size=None):
    """stil gorseli cikti ile ayni olcude olmali — gerekirse yeniden boyutlar"""
    if size is None:
        return base64.b64encode(open(path, "rb").read()).decode()
    from PIL import Image
    img = Image.open(path).convert("RGB").resize(size, Image.NEAREST)
    buf = io.BytesIO(); img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()

def generate(prompt, w, h, seed=None):
    body = {
        "description": prompt,
        "negative_description": "portrait, headshot, bust, close-up, cropped "
                                "body, medieval, fantasy, robe, beard, long "
                                "hair, background, scenery, floor, shadow, text, "
                                "frame, multiple characters, weapon, hat, smile",
        "image_size": {"width": w, "height": h},
        "no_background": True,
        "view": "side",
        "direction": "south",
        "outline": "selective outline",
        "shading": "flat shading",
        "detail": "low detail",
        "text_guidance_scale": 9,
    }
    # palet: serbest uret, sonra yerel olarak oyun paletine indir.
    # (API'ye zorlanan palette tek acik renk ten oldugu icin model tum
    #  aydinlik yuzeyleri tene ceviriyordu.)
    if "--palet" in sys.argv:
        body["color_image"] = {"type": "base64", "base64": palette_b64()}
    api = API_BITFORGE if "--bitforge" in sys.argv else API_PIXFLUX
    port = os.path.join(ART, "elias.png")
    if api is API_BITFORGE and "--stil" in sys.argv and os.path.exists(port):
        body["style_image"] = {"type": "base64", "base64": file_b64(port, (w, h))}
        body["style_strength"] = 20
    if seed is not None:
        body["seed"] = seed
    req = urllib.request.Request(api, json.dumps(body).encode(),
        {"Content-Type": "application/json", "Authorization": "Bearer " + token()})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return base64.b64decode(json.load(r)["image"]["base64"])
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}\n{e.read().decode()[:600]}")

def trim(img):
    """seffaf kenarlari kirp"""
    bb = img.getbbox()
    return img.crop(bb) if bb else img

def to_palette(img):
    """alfayi koruyarak oyun paletine en yakin renge oturt"""
    from PIL import Image
    pal = [tuple(int(h[i:i+2], 16) for i in (1, 3, 5)) for h in PALETTE]
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    src = img.convert("RGBA").load(); dst = out.load()
    for y in range(img.height):
        for x in range(img.width):
            rr, gg, bb, aa = src[x, y]
            if aa < 128: continue
            best = min(pal, key=lambda c: (c[0]-rr)**2 + (c[1]-gg)**2 + (c[2]-bb)**2)
            dst[x, y] = (*best, 255)
    return out

def shrink(img, tw, th):
    """alfa duyarli, baskin-renk esasli kucultme — kucuk sprite'ta net kalir"""
    from PIL import Image
    src = trim(img.convert("RGBA"))
    # en-boy oranini koru, hedefe sigdir
    sc = min(tw / src.width, th / src.height)
    nw, nh = max(1, round(src.width * sc)), max(1, round(src.height * sc))
    out = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    px = src.load()
    small = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    for y in range(nh):
        for x in range(nw):
            x0, x1 = int(x * src.width / nw), max(int((x+1) * src.width / nw), int(x*src.width/nw)+1)
            y0, y1 = int(y * src.height / nh), max(int((y+1) * src.height / nh), int(y*src.height/nh)+1)
            votes = {}
            for sy in range(y0, min(y1, src.height)):
                for sx in range(x0, min(x1, src.width)):
                    c = px[sx, sy]
                    if c[3] < 128: continue
                    votes[c[:3]] = votes.get(c[:3], 0) + 1
            if votes:
                best = max(votes, key=votes.get)
                small.putpixel((x, y), (*best, 255))
    out.paste(small, ((tw - nw)//2, th - nh))   # ayaklar alta yaslanir
    return out

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    size = "10x16"
    for i, a in enumerate(sys.argv):
        if a == "--size": size = sys.argv[i+1]
    pose = args[0] if args else "stand"
    tw, th = (int(v) for v in size.split("x"))
    os.makedirs(PREV, exist_ok=True)
    from PIL import Image

    n = 1
    for i, a in enumerate(sys.argv):
        if a == "--n": n = int(sys.argv[i+1])

    # bitforge 16px'e kadar iner: dogrudan oyun olcusunde uret, kucultme yok
    gw = max(16, tw)
    cands = []
    for k in range(n):
        raw = generate(POSES[pose], gw, th, seed=1000+k*137 if n > 1 else None)
        open(os.path.join(PREV, f"kar_{pose}_{k}_ham.png"), "wb").write(raw)
        img = to_palette(trim(Image.open(io.BytesIO(raw)).convert("RGBA")))
        cands.append(img)
        print(f"  [{k}] figur: {img.width}x{img.height}")

    if n > 1:   # kontakt sayfasi: hepsini yan yana 12x buyut
        pad, z = 4, 12
        W = sum(c.width for c in cands)*z + pad*(n+1)
        H = max(c.height for c in cands)*z + pad*2
        sheet = Image.new("RGBA", (W, H), (10, 12, 18, 255))
        x = pad
        for c in cands:
            big = c.resize((c.width*z, c.height*z), Image.NEAREST)
            sheet.paste(big, (x, pad), big); x += big.width + pad
        sheet.save(os.path.join(PREV, f"kar_{pose}_secim.png"))
        print("secim sayfasi:", os.path.join(PREV, f"kar_{pose}_secim.png"))
        for k, c in enumerate(cands):
            c.save(os.path.join(PREV, f"kar_{pose}_{k}.png"))
        return

    out = cands[0]
    out.save(os.path.join(ART, f"kar_{pose}.png"))
    out.resize((out.width*12, out.height*12), Image.NEAREST).save(
        os.path.join(PREV, f"kar_{pose}_12x.png"))
    print("yazildi:", os.path.join(ART, f"kar_{pose}.png"))

if __name__ == "__main__":
    main()
