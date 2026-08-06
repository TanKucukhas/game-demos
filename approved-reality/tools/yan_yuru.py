#!/usr/bin/env python3
"""
Profil (yan) yuruyus — mevcut karaktere uygulanir.

Onden bakan yuruyus begenilmedi; karakterin yana donup yurumesi isteniyor.
Sorceress karakterini KORUYARAK PixelLab'in rotate + skeleton ucuyla profil
yuruyus uretir ve var olan sprite sayfasina ekler.

  1. art/elias_anim.png icindeki idle karesini alir (oyun olcegi)
  2. PixelLab rotate ile south -> east cevirir
  3. iskeletini cikarip WALK_SIDE pozlarini uygular
  4. kareleri AYAK HATTI ve merkeze gore hizalayip sayfaya ekler

  python3 tools/yan_yuru.py
"""
import io, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART  = os.path.join(ROOT, "art")
PREV = os.path.join(ART, "preview")
CANVAS = 64

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_karakter import to_palette, trim
from gen_anim import post, b64png, decode, shift, WALK_SIDE, SKEL, ANIM

ROT = "https://api.pixellab.ai/v1/rotate"

def main():
    from PIL import Image
    sheet = Image.open(os.path.join(ART, "elias_anim.png")).convert("RGBA")
    meta  = json.load(open(os.path.join(ART, "elias_anim.json")))
    fw, fh = meta["fw"], meta["fh"]
    foot = meta.get("foot", fh)

    def frame(i):
        return sheet.crop((i*fw, 0, (i+1)*fw, fh))

    idle = frame(meta["anims"]["idle"][0])
    ib = idle.getbbox()
    body = idle.crop(ib)
    print(f"idle govdesi {body.width}x{body.height}")

    # 64x64 tuvale otur: ayaklar sabit bir satira gelsin
    FOOT_Y = 56
    ref = Image.new("RGBA", (CANVAS, CANVAS), (0,0,0,0))
    ref.paste(body, ((CANVAS-body.width)//2, FOOT_Y-body.height), body)
    ref.save(os.path.join(PREV, "yan_ref.png"))

    print("[pixellab] profile cevriliyor (south -> east)...")
    out = post(ROT, {
        "image_size": {"width": CANVAS, "height": CANVAS},
        "from_image": {"type": "base64", "base64": b64png(ref)},
        "from_view": "side", "to_view": "side",
        "from_direction": "south", "to_direction": "east",
    })
    key = "image" if "image" in out else "images"
    im = out[key] if key == "image" else out[key][0]
    east = Image.open(io.BytesIO(decode(im["base64"]))).convert("RGBA")
    east.save(os.path.join(PREV, "yan_east.png"))
    t = trim(east)
    t.resize((t.width*8, t.height*8), Image.NEAREST).save(
        os.path.join(PREV, "yan_east_8x.png"))
    print(f"  profil {t.width}x{t.height}")

    print("[pixellab] iskelet + yan yuruyus...")
    kp = post(SKEL, {"image": {"type":"base64","base64": b64png(east)}})["keypoints"]
    poses = [shift(kp, d, b) for d, b in WALK_SIDE]
    res = post(ANIM, {
        "reference_image": {"type": "base64", "base64": b64png(east)},
        "image_size": {"width": CANVAS, "height": CANVAS},
        "skeleton_keypoints": poses,
        "view": "side", "direction": "east",
        "guidance_scale": 4.0, "seed": 4242,
    })
    raw = [Image.open(io.BytesIO(decode(i["base64"]))).convert("RGBA")
           for i in res["images"]]

    # A,B,C,B dongusu — 3 benzersiz pozdan 4 kare
    seq = [raw[0], raw[1], raw[2], raw[1]]

    # sayfaya ekle: yatayda ortala, ayaklari mevcut ayak hattina otur
    n0 = sheet.width // fw
    new = Image.new("RGBA", (sheet.width + fw*len(seq), fh), (0,0,0,0))
    new.paste(sheet, (0, 0))
    for k, f in enumerate(seq):
        p = to_palette(trim(f))
        dx = n0*fw + k*fw + (fw - p.width)//2
        dy = foot - p.height
        new.paste(p, (dx, max(0, dy)), p)
    new.save(os.path.join(ART, "elias_anim.png"))

    meta["anims"]["walkE"] = list(range(n0, n0+len(seq)))
    json.dump(meta, open(os.path.join(ART, "elias_anim.json"), "w"))
    print("walkE kareleri:", meta["anims"]["walkE"])

    z = 8
    new.resize((new.width*z, new.height*z), Image.NEAREST).save(
        os.path.join(PREV, "elias_anim_8x.png"))
    gs = [new.crop((i*fw,0,(i+1)*fw,fh)).resize((fw*z, fh*z), Image.NEAREST)
            .convert("RGB") for i in meta["anims"]["walkE"]]
    gs[0].save(os.path.join(PREV, "anim_walkE.gif"), save_all=True,
               append_images=gs[1:], duration=120, loop=0)
    print("yazildi: art/elias_anim.png + .json")

if __name__ == "__main__":
    main()
