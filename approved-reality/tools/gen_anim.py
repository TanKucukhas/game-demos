#!/usr/bin/env python3
"""
APPROVED REALITY — karakter animasyonu (PixelLab animate-with-skeleton).

art/kar_stand.png referans alinir, iskeleti tahmin edilir, pozlar KOD ile
kurgulanir ve model karakteri o pozlarda cizer. Boylece:
  - kimlik ve olcek sabit kalir (metin tabanli animasyonun sorunuydu)
  - hareket garantidir
  - tum kareler ortak kutu + ayak hizasiyla kesilir -> idle<->walk gecisi puruzsuz

Cikti:
  art/elias_anim.png   — yan yana tum kareler
  art/elias_anim.json  — {fw, fh, foot, anims:{idle:[...], walk:[...]}}

  python3 tools/gen_anim.py
"""
import base64, io, json, os, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART  = os.path.join(ROOT, "art")
PREV = os.path.join(ART, "preview")
SKEL = "https://api.pixellab.ai/v1/estimate-skeleton"
ANIM = "https://api.pixellab.ai/v1/animate-with-skeleton"
CANVAS = 64

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_karakter import to_palette, trim, token

PX = 1.0 / CANVAS            # 1 piksel = normalize birim

def b64png(img):
    buf = io.BytesIO(); img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()

def decode(s):
    if s.startswith("data:"): s = s.split(",", 1)[1]
    return base64.b64decode(s)

def post(url, body):
    req = urllib.request.Request(url, json.dumps(body).encode(),
        {"Content-Type": "application/json", "Authorization": "Bearer " + token()})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} {url}\n{e.read().decode()[:600]}")

def pad_to_canvas(img, foot_y=58):
    from PIL import Image
    c = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    c.paste(img, ((CANVAS - img.width)//2, foot_y - img.height), img)
    return c

# ---------- poz kurgusu ----------
# her poz: {etiket: (dx, dy)} piksel cinsinden sapma. Belirtilmeyen nokta sabit.
def shift(base, deltas, body_dy=0.0):
    out = []
    for k in base:
        dx, dy = deltas.get(k["label"], (0.0, 0.0))
        out.append({"label": k["label"], "z_index": int(k.get("z_index", 0)),
                    "x": k["x"] + dx*PX, "y": k["y"] + (dy + body_dy)*PX})
    return out

# onden gorunen yuruyus: bacaklar makaslar, govde 1px zıplar, kollar ters savrulur
WALK = [
    # A — sol bacak one/disa, sag bacak geride
    (dict({"LEFT KNEE": (1.6, 0), "LEFT LEG": (2.4, -0.6),
           "RIGHT KNEE": (0.6, 0), "RIGHT LEG": (0.9, 0.4),
           "LEFT ELBOW": (-1.0, 0), "LEFT ARM": (-1.6, 0),
           "RIGHT ELBOW": (1.0, 0), "RIGHT ARM": (1.6, 0)}), 0.6),
    # B — gecis: bacaklar bitisik, govde yukarida
    (dict({"LEFT KNEE": (-0.4, 0), "LEFT LEG": (-0.7, 0),
           "RIGHT KNEE": (0.4, 0), "RIGHT LEG": (0.7, 0)}), -1.0),
    # C — A'nin aynasi
    (dict({"RIGHT KNEE": (-1.6, 0), "RIGHT LEG": (-2.4, -0.6),
           "LEFT KNEE": (-0.6, 0), "LEFT LEG": (-0.9, 0.4),
           "RIGHT ELBOW": (1.0, 0), "RIGHT ARM": (1.6, 0),
           "LEFT ELBOW": (-1.0, 0), "LEFT ARM": (-1.6, 0)}), 0.6),
]

# oturma: kalca hafif iner, dizler yukari+yana (onden gorunumde one dogru),
# ayaklar yerden kesilir, sag kol masaya uzanir (yazma)
SIT_BASE = {
    "LEFT HIP": (0.6, 1.0), "RIGHT HIP": (-0.6, 1.0),
    "LEFT KNEE": (2.2, -7.5), "RIGHT KNEE": (-2.2, -7.5),
    "LEFT LEG": (1.6, -4.0), "RIGHT LEG": (-1.6, -4.0),
    "NECK": (0, 1.0), "NOSE": (0, 1.2),
    "LEFT SHOULDER": (0, 1.0), "RIGHT SHOULDER": (0, 1.0),
    "LEFT EYE": (0, 1.2), "RIGHT EYE": (0, 1.2),
    "LEFT EAR": (0, 1.1), "RIGHT EAR": (0, 1.1),
    "LEFT ELBOW": (0.5, 0.5), "LEFT ARM": (1.0, 0.0),
}
def sit(extra=None):
    d = dict(SIT_BASE); d.update(extra or {}); return d

SIT = [
    (sit({"RIGHT ELBOW": (-0.5, 0.0), "RIGHT ARM": (-1.5, -1.5)}), 0.0),
    (sit({"RIGHT ELBOW": (-0.8, -0.5), "RIGHT ARM": (-2.5, -2.5)}), 0.0),
    (sit({"RIGHT ELBOW": (-0.6, -0.2), "RIGHT ARM": (-2.0, -1.8),
          "NOSE": (0, 1.6), "NECK": (0, 1.4)}), 0.0),
]

# idle: nefes — omuzlar/bas cok hafif inip kalkar, ayaklar sabit
IDLE = [
    ({}, 0.0),
    ({"NOSE": (0, 0.5), "NECK": (0, 0.4), "LEFT SHOULDER": (0, 0.5),
      "RIGHT SHOULDER": (0, 0.5), "LEFT ELBOW": (0, 0.4),
      "RIGHT ELBOW": (0, 0.4), "LEFT ARM": (0, 0.3), "RIGHT ARM": (0, 0.3),
      "LEFT EYE": (0, 0.5), "RIGHT EYE": (0, 0.5),
      "LEFT EAR": (0, 0.5), "RIGHT EAR": (0, 0.5)}, 0.0),
    ({"NOSE": (0, 0.2), "NECK": (0, 0.2), "LEFT SHOULDER": (0, 0.2),
      "RIGHT SHOULDER": (0, 0.2)}, 0.0),
]

# profil yuruyus: bacaklar one/geriye savrulur (x ekseni), kollar ters
WALK_SIDE = [
    ({"LEFT KNEE": (2.5, -0.5), "LEFT LEG": (4.5, -0.5),
      "RIGHT KNEE": (-2.0, 0), "RIGHT LEG": (-3.5, 0.5),
      "LEFT ELBOW": (-2.0, 0), "LEFT ARM": (-3.5, 0),
      "RIGHT ELBOW": (2.0, 0), "RIGHT ARM": (3.5, 0)}, 0.5),
    ({"LEFT KNEE": (0.5, 0), "LEFT LEG": (0.5, 0),
      "RIGHT KNEE": (-0.5, 0), "RIGHT LEG": (-0.5, 0)}, -1.0),
    ({"RIGHT KNEE": (2.5, -0.5), "RIGHT LEG": (4.5, -0.5),
      "LEFT KNEE": (-2.0, 0), "LEFT LEG": (-3.5, 0.5),
      "RIGHT ELBOW": (-2.0, 0), "RIGHT ARM": (-3.5, 0),
      "LEFT ELBOW": (2.0, 0), "LEFT ARM": (3.5, 0)}, 0.5),
]

def run(ref, base_kp, poses, seed, direction="south"):
    frames = [shift(base_kp, d, b) for d, b in poses]
    out = post(ANIM, {
        "reference_image": {"type": "base64", "base64": b64png(ref)},
        "image_size": {"width": CANVAS, "height": CANVAS},
        "skeleton_keypoints": frames,
        "view": "side", "direction": direction,
        "guidance_scale": 4.0,
        "seed": seed,
    })
    from PIL import Image
    return [Image.open(io.BytesIO(decode(im["base64"]))).convert("RGBA")
            for im in out["images"]]

ROT = "https://api.pixellab.ai/v1/rotate"

def rotate_east(ref):
    """onden bakan referansi profile cevir — yana yuruyus icin"""
    out = post(ROT, {
        "image_size": {"width": CANVAS, "height": CANVAS},
        "from_image": {"type": "base64", "base64": b64png(ref)},
        "from_view": "side", "to_view": "side",
        "from_direction": "south", "to_direction": "east",
    })
    from PIL import Image
    key = "image" if "image" in out else "images"
    im = out[key] if key == "image" else out[key][0]
    return Image.open(io.BytesIO(decode(im["base64"]))).convert("RGBA")

def main():
    from PIL import Image
    os.makedirs(PREV, exist_ok=True)
    base = trim(Image.open(os.path.join(ART, "kar_stand.png")).convert("RGBA"))
    ref = pad_to_canvas(base)
    ref.save(os.path.join(PREV, "anim_ref.png"))
    print(f"referans {base.width}x{base.height} -> 64x64")

    if "--yan" in sys.argv:
        print("[pixellab] profile cevriliyor...")
        e = rotate_east(ref)
        e.save(os.path.join(PREV, "anim_ref_east.png"))
        t = trim(e)
        t.resize((t.width*8, t.height*8), Image.NEAREST).save(
            os.path.join(PREV, "anim_ref_east_8x.png"))
        print("  yazildi: art/preview/anim_ref_east.png", t.size)
        return

    print("[pixellab] iskelet tahmini...")
    kp = post(SKEL, {"image": {"type": "base64", "base64": b64png(ref)}})["keypoints"]

    print("[pixellab] yuruyus (3 poz)...")
    walk = run(ref, kp, WALK, 4242)
    print("[pixellab] idle (3 poz)...")
    idle = run(ref, kp, IDLE, 4242)
    print("[pixellab] oturma (3 poz)...")
    sitf = run(ref, kp, SIT, 4242)

    # yan (profil) yuruyus: karakter sola/saga giderken kullanilir
    print("[pixellab] profile cevriliyor...")
    refE = rotate_east(ref)
    refE.save(os.path.join(PREV, "anim_ref_east.png"))
    kpE = post(SKEL, {"image": {"type":"base64","base64": b64png(refE)}})["keypoints"]
    print("[pixellab] yan yuruyus (3 poz)...")
    walkE = run(refE, kpE, WALK_SIDE, 4242, "east")

    # 4 kareli dongu 3 benzersiz pozdan: A,B,C,B
    seq = [("idle",  [idle[0], idle[1], idle[2], idle[1]]),
           ("walk",  [walk[0], walk[1], walk[2], walk[1]]),
           ("sit",   [sitf[0], sitf[1], sitf[2], sitf[1]]),
           ("walkE", [walkE[0], walkE[1], walkE[2], walkE[1]])]

    frames, order = [], {}
    for name, fr in seq:
        order[name] = list(range(len(frames), len(frames)+len(fr)))
        frames += [to_palette(f) for f in fr]

    # ORTAK kutu: tum animasyonlar ayni cerceveden kesilir -> gecisde zıplama yok
    boxes = [f.getbbox() for f in frames if f.getbbox()]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes),
           max(b[2] for b in boxes), max(b[3] for b in boxes))
    cut = [f.crop(box) for f in frames]
    fw, fh = cut[0].size
    print(f"ortak kare {fw}x{fh}, {len(cut)} kare")

    sheet = Image.new("RGBA", (fw*len(cut), fh), (0, 0, 0, 0))
    for i, f in enumerate(cut): sheet.paste(f, (i*fw, 0), f)
    sheet.save(os.path.join(ART, "elias_anim.png"))
    json.dump({"fw": fw, "fh": fh, "anims": order},
              open(os.path.join(ART, "elias_anim.json"), "w"))

    z = 8
    sheet.resize((sheet.width*z, sheet.height*z), Image.NEAREST).save(
        os.path.join(PREV, "elias_anim_8x.png"))
    for name, idx in order.items():
        gs = [cut[i].resize((fw*z, fh*z), Image.NEAREST).convert("RGB")
              for i in idx]
        gs[0].save(os.path.join(PREV, f"anim_{name}.gif"), save_all=True,
                   append_images=gs[1:], duration=130, loop=0)
    print("yazildi: art/elias_anim.png + .json")

if __name__ == "__main__":
    main()
