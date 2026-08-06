#!/usr/bin/env python3
"""
APPROVED REALITY — AI portre uretim hatti.

  1. PixelLab (pixflux) ile prompt'tan pixel art uretir
     (yoksa OpenAI gpt-image-1 ile foto uretip yerel piksellestirir)
  2. Oyunun koyu paletine indirger (quantize + karartma)
  3. art/<isim>.png (oyun boyutu) + art/preview/<isim>_8x.png yazar

Kullanim:
  python3 tools/gen_portre.py elias "middle aged man portrait ..." 28 32
  python3 tools/gen_portre.py --engine openai elias "..." 28 32
"""
import base64, io, json, os, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV  = os.path.join(os.path.dirname(ROOT), "1984", ".env")
ART  = os.path.join(ROOT, "art")
PREV = os.path.join(ART, "preview")

def env(*names):
    vals = {}
    for line in open(ENV, encoding="utf-8"):
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            vals[k.strip()] = v.strip()
    for n in names:
        if vals.get(n):
            return vals[n]
    return None

# oyunun koyu tonlari (core.js ramplarindan + portre paleti)
GAME_PALETTE = [
    "#0c0a12", "#1d150e", "#2e2018", "#332619", "#131b2a", "#263650",
    "#3a4552", "#5c4230", "#6e5238", "#8f6b4c", "#b98f6e", "#c9a27c",
    "#4e2e26", "#a89e88", "#0d0b0f", "#22344c",
]

def hexrgb(h):
    return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))

def post_json(url, body, headers, timeout=180):
    req = urllib.request.Request(url, json.dumps(body).encode(),
        {"Content-Type": "application/json", **headers})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} {url}\n{e.read().decode()[:800]}")

def gen_pixellab(prompt, w, h):
    tok = env("PIXELLAB_TOKEN") or sys.exit("PIXELLAB_TOKEN yok")
    # pixflux: text -> pixel art
    out = post_json("https://api.pixellab.ai/v1/generate-image-pixflux",
        {"description": prompt,
         "image_size": {"width": max(32, w), "height": max(32, h)},
         "no_background": False,
         "text_guidance_scale": 8},
        {"Authorization": f"Bearer {tok}"})
    b64 = out["image"]["base64"]
    return b64
def gen_openai(prompt, w, h):
    tok = env("OPENAI") or sys.exit("OPENAI anahtari yok")
    out = post_json("https://api.openai.com/v1/images/generations",
        {"model": "gpt-image-1", "prompt": prompt, "size": "1024x1024",
         "quality": "medium"},
        {"Authorization": f"Bearer {tok}"})
    return out["data"][0]["b64_json"]

def pixelate(png_bytes, w, h):
    from PIL import Image
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    # kare degilse ortadan kirp
    side = min(img.size)
    img = img.crop(((img.width-side)//2, (img.height-side)//2,
                    (img.width+side)//2, (img.height+side)//2))
    img = img.resize((w, h), Image.LANCZOS)      # kucult
    # oyun paletine indirger
    pal_img = Image.new("P", (1, 1))
    flat = []
    for hx in GAME_PALETTE: flat += list(hexrgb(hx))
    flat += flat[:3] * (256 - len(GAME_PALETTE))
    pal_img.putpalette(flat)
    img = img.quantize(palette=pal_img, dither=Image.FLOYDSTEINBERG).convert("RGB")
    return img

def main():
    args = sys.argv[1:]
    engine = "pixellab"
    if args and args[0] == "--engine":
        engine = args[1]; args = args[2:]
    if len(args) < 2:
        sys.exit(__doc__)
    name, prompt = args[0], args[1]
    w = int(args[2]) if len(args) > 2 else 28
    h = int(args[3]) if len(args) > 3 else 32

    os.makedirs(PREV, exist_ok=True)
    print(f"[{engine}] uretiliyor: {name} {w}x{h}")
    b64 = gen_pixellab(prompt, w, h) if engine == "pixellab" else gen_openai(prompt, w, h)
    raw = base64.b64decode(b64)
    open(os.path.join(PREV, f"{name}_kaynak.png"), "wb").write(raw)

    img = pixelate(raw, w, h)
    out = os.path.join(ART, f"{name}.png")
    img.save(out)
    from PIL import Image
    img.resize((w*8, h*8), Image.NEAREST).save(
        os.path.join(PREV, f"{name}_8x.png"))
    print("yazildi:", out)

if __name__ == "__main__":
    main()
