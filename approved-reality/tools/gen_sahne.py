#!/usr/bin/env python3
"""
APPROVED REALITY — sahne (arka plan) uretim denemesi.

Oyunun sanat yonunu "her sey PixelLab" secenegine tasimanin ne getirip ne
goturdugunu gormek icin sahne arka planlari uretir.

  python3 tools/gen_sahne.py oda
  python3 tools/gen_sahne.py oda --size 256x144 --n 3
"""
import base64, io, json, os, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART  = os.path.join(ROOT, "art")
PREV = os.path.join(ART, "preview")
API  = "https://api.pixellab.ai/v1/generate-image-pixflux"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_karakter import token

LOOK = ("dark bleak orwellian dystopia, cold blue-grey palette, heavy shadows, "
        "single weak light source, grimy concrete, 1984 surveillance state, "
        "side view flat interior like a 2d adventure game background")

SAHNE = {
 "oda": "cramped dim apartment room interior, side view cutaway: a large wall "
        "mounted telescreen with a glowing eye on the left, a red propaganda "
        "poster in the middle, a barred rainy window on the right, a small "
        "wooden desk with a diary and an oil lamp, a narrow iron bed, a heating "
        "pipe, bare floorboards, " + LOOK,
 "sokak": "rainy dystopian city street at dawn, side view: brutalist concrete "
          "blocks, a huge public screen showing a face, a queue of citizens, a "
          "red priority gate on the right, wet asphalt reflecting light, "
          "distant ministry pyramid on the horizon, " + LOOK,
 "ofis": "bureaucratic office floor interior, side view cutaway: rows of desks "
         "with terminal screens, a red banner on the wall, a supervisor's door "
         "on the right, a canteen hatch on the left, filing cabinets, " + LOOK,
}

def generate(prompt, w, h, seed=None):
    body = {
        "description": prompt,
        "negative_description": "people, characters, person, figure, text, "
                                "words, logo, watermark, ui, hud, frame, border",
        "image_size": {"width": w, "height": h},
        "outline": "selective outline",
        "shading": "detailed shading",
        "detail": "highly detailed",
        "view": "side",
        "text_guidance_scale": 8,
    }
    if seed is not None: body["seed"] = seed
    req = urllib.request.Request(API, json.dumps(body).encode(),
        {"Content-Type": "application/json", "Authorization": "Bearer " + token()})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return base64.b64decode(json.load(r)["image"]["base64"])
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}\n{e.read().decode()[:600]}")

def main():
    from PIL import Image
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    name = args[0] if args else "oda"
    size, n = "192x108", 1
    for i, a in enumerate(sys.argv):
        if a == "--size": size = sys.argv[i+1]
        if a == "--n": n = int(sys.argv[i+1])
    w, h = (int(v) for v in size.split("x"))
    os.makedirs(PREV, exist_ok=True)

    for k in range(n):
        print(f"[pixellab] sahne {name} {w}x{h} [{k}]")
        raw = generate(SAHNE[name], w, h, seed=500+k*211 if n > 1 else None)
        p = os.path.join(PREV, f"sahne_{name}_{k}.png")
        open(p, "wb").write(raw)
        img = Image.open(p)
        img.resize((img.width*4, img.height*4), Image.NEAREST).save(
            os.path.join(PREV, f"sahne_{name}_{k}_4x.png"))
        print("  ", p)

if __name__ == "__main__":
    main()
