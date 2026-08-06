#!/usr/bin/env python3
"""
Sorceress AutoSprite V3 videolarindan oyun sprite'i uretir.

Sitenin kendi kare-cikarma adimi (CorridorKey/Cloud) videolari yukleyemedigi
icin takiliyordu; videolari dogrudan indirip kareleri burada isliyoruz.

  1. kenarlardan flood-fill ile siyah fonu seffaflastirir
  2. TUM animasyonlarin karelerinden ortak sinir kutusu cikarir (gecis kaymasi olmasin)
  3. ayakta insan = INSAN piksel olacak sekilde tam sayi kat kucultur
  4. oyunun paletine oturtur, tek sayfa + json yazar

  python3 tools/sorc_sprite.py
"""
import glob, json, os, sys
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART  = os.path.join(ROOT, "art")
SORC = os.path.join(ART, "sorc")
PREV = os.path.join(ART, "preview")
INSAN = 45                       # oyun olcegi: ayakta karakter yuksekligi

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_karakter import to_palette

# video klasoru -> (animasyon adi, kullanilacak kare araligi, kare sayisi)
# NOT: ilk kare kaynak sprite sayfasini gosteriyor, atlanmali.
# "Walking Right Cycle" videosu aslinda yurumuyor (model hareketi uygulamadi),
# bu yuzden ikinci bir idle varyanti olarak kullaniliyor.
# Uretilen ucunun de govdesi neredeyse durağan cikti: video modeli "walk cycle"
# yonergesini uygulamadi. Oturma klibi de kendi masasini/sandalyesini iceriyor,
# bizim masamizla cakisiyor -> disarida birakildi (oyun eski oturma cizimine duser).
KLIP = {
  "63bac2de-7e33-4065-a44c-7d0a5ab8600c": ("idle",  (10, 46), 4),
  "8cb95bcd-f1d8-44aa-a63c-bad8c10cba7f": ("walk",  (4, 24), 4),
}

def key_black(img, tol=42):
    """kenarlardan tasarak siyah fonu sil — koyu uniformayi yemesin diye
    sadece kenara BAGLI koyu pikseller silinir"""
    from PIL import Image
    im = img.convert("RGBA"); px = im.load()
    W, H = im.size
    seen = bytearray(W*H)
    q = deque()
    def dark(x, y):
        r, g, b, a = px[x, y]
        return max(r, g, b) <= tol
    for x in range(W):
        for y in (0, H-1):
            if not seen[y*W+x] and dark(x, y): q.append((x, y)); seen[y*W+x] = 1
    for y in range(H):
        for x in (0, W-1):
            if not seen[y*W+x] and dark(x, y): q.append((x, y)); seen[y*W+x] = 1
    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < W and 0 <= ny < H and not seen[ny*W+nx] and dark(nx, ny):
                seen[ny*W+nx] = 1; q.append((nx, ny))
    return im

def box_shrink(img, s):
    """tam sayi kat kucult — alfa duyarli ORTALAMA.
    20x gibi buyuk kucultmelerde 'baskin renk' benekli hamur uretiyor;
    ortalama alip sonra palete oturtmak portre hattinda da daha temizdi."""
    from PIL import Image
    w, h = img.width//s, img.height//s
    out = Image.new("RGBA", (w, h), (0,0,0,0))
    src = img.load(); d = out.load()
    need = max(1, (s*s)//3)
    for y in range(h):
        for x in range(w):
            rr = gg = bb = op = 0
            for i in range(s):
                for j in range(s):
                    p = src[x*s+i, y*s+j]
                    if p[3] < 110: continue
                    op += 1; rr += p[0]; gg += p[1]; bb += p[2]
            if op >= need:
                d[x, y] = (rr//op, gg//op, bb//op, 255)
    return out

import math

def walk_frames(base, n=8, amp=0.075, lift=0.030, bob=0.012):
    """YUKSEK COZUNURLUKTE yuruyus uret, sonra kucult.
    Video modeli yuruyus dongusunu uygulamadi; bacaklari kalca hattindan
    makaslayarak kendimiz uretiyoruz. Yuksek cozunurlukte yapildigi icin
    kucultunce puruzsuz cikiyor (dogrudan 45px uzerinde yapilsa kirilirdi)."""
    from PIL import Image
    W, H = base.size
    bb = base.getbbox()
    hipY = bb[1] + int((bb[3]-bb[1]) * 0.52)     # kalca hatti
    cx = (bb[0]+bb[2])//2
    A = (bb[3]-bb[1]) * amp
    L = (bb[3]-bb[1]) * lift
    B = (bb[3]-bb[1]) * bob
    src = base.load()
    out = []
    for k in range(n):
        ph = 2*math.pi*k/n
        f = Image.new("RGBA", (W, H), (0,0,0,0)); d = f.load()
        # govde: yuruyusun cift ritmiyle 1 kez inip kalkar
        body_dy = -abs(math.sin(ph)) * B
        for y in range(H):
            for x in range(W):
                p = src[x, y]
                if p[3] < 110: continue
                dx, dy = 0.0, body_dy
                if y > hipY:
                    tt = (y-hipY)/max(1, bb[3]-hipY)      # kalcada 0, ayakta 1
                    side = -1 if x < cx else 1
                    sw = math.sin(ph) * side
                    dx = A * tt * sw
                    dy += -L * tt * max(0.0, sw)          # one gelen bacak kalkar
                nx, ny = int(round(x+dx)), int(round(y+dy))
                if 0 <= nx < W and 0 <= ny < H: d[nx, ny] = p
        out.append(f)
    return out

def sit_frames(base, n=3):
    """Oturus pozu idle'dan turetilir: govde saga yaslanir, uyluklar saga
    dogru yatay, baldirlar asagi. Masa saginda oldugu icin saga bakiyor."""
    from PIL import Image
    W, H = base.size
    bb = base.getbbox()
    hipY = bb[1] + int((bb[3]-bb[1]) * 0.52)
    botY = bb[3]
    cx   = (bb[0]+bb[2])//2
    legL = botY - hipY
    thighL = int(legL * 0.46)
    kneeY  = hipY + thighL
    src = base.load()
    out = []
    for k in range(n):
        lean = [0, 1, 0][k % 3]                       # hafif nefes/yazma salinimi
        f = Image.new("RGBA", (W, H), (0,0,0,0)); d = f.load()
        def put(nx, ny, p):
            for a in (0, 1):
                for b in (0, 1):
                    X, Y = int(nx)+a, int(ny)+b
                    if 0 <= X < W and 0 <= Y < H and d[X, Y][3] == 0: d[X, Y] = p
        for y in range(bb[1], botY):
            for x in range(bb[0], bb[2]):
                p = src[x, y]
                if p[3] < 110: continue
                if y < hipY:                          # govde: saga yaslan, otur
                    lean_amt = (hipY - y) / max(1, hipY - bb[1])
                    put(x + 4*lean_amt + lean, y + legL*0.42, p)
                elif y < kneeY:                       # uyluk: 90 derece saga
                    u = y - hipY
                    v = x - cx
                    put(cx + 2 + u*0.95, hipY + legL*0.42 + v*0.5, p)
                else:                                 # baldir: asagi, dizin ucunda
                    u = y - kneeY
                    v = x - cx
                    put(cx + 2 + thighL*0.95 + v*0.5, hipY + legL*0.42 + u*0.95, p)
        out.append(f)
    return out

def main():
    from PIL import Image
    os.makedirs(PREV, exist_ok=True)
    keyed, order = [], {}
    for d, (name, (a, b), n) in KLIP.items():
        fs = sorted(glob.glob(os.path.join(SORC, d, "*.png")))
        if not fs: sys.exit("kare yok: " + d)
        b = min(b, len(fs)-1)
        idx = [a + round(i*(b-a)/(n-1)) for i in range(n)]
        print(f"{name}: {len(fs)} kareden {idx}")
        order[name] = list(range(len(keyed), len(keyed)+n))
        for i in idx:
            keyed.append(key_black(Image.open(fs[i])))

    # yuruyus: idle'in ilk karesinden yuksek cozunurlukte turetilir
    wf = walk_frames(keyed[order["idle"][0]], n=8)
    order["walkE"] = list(range(len(keyed), len(keyed)+len(wf)))
    keyed += wf

    sf = sit_frames(keyed[order["idle"][0]], n=3)
    order["sit"] = list(range(len(keyed), len(keyed)+len(sf)))
    keyed += sf

    # ortak kutu: butun animasyonlar ayni cerceveden kesilir
    boxes = [f.getbbox() for f in keyed if f.getbbox()]
    box = (min(x0 for x0,_,_,_ in boxes), min(y0 for _,y0,_,_ in boxes),
           max(x1 for _,_,x1,_ in boxes), max(y1 for _,_,_,y1 in boxes))
    cut = [f.crop(box) for f in keyed]
    print("ortak kutu:", box, "->", cut[0].size)

    # ayakta karakter INSAN piksel olacak sekilde kat sec
    idle0 = cut[order["idle"][0]]
    bb = idle0.getbbox()
    boy = bb[3]-bb[1]
    s = max(1, round(boy / INSAN))
    print(f"ayakta boy {boy}px -> 1/{s} = {boy//s}px")

    small = [to_palette(box_shrink(f, s)) for f in cut]
    fw, fh = small[0].size
    print("kare:", fw, "x", fh)

    # ayak hatti: ayakta duran karakterin kare icindeki en alt pikseli.
    # Ortak kare oturma pozu yuzunden uzun; cizerken bu deger yere oturtulur,
    # yoksa karakter havada durur veya UI seridine tasar.
    foot = small[order["idle"][0]].getbbox()[3]
    print("ayak hatti:", foot, "/", fh)

    sheet = Image.new("RGBA", (fw*len(small), fh), (0,0,0,0))
    for i, f in enumerate(small): sheet.paste(f, (i*fw, 0), f)
    sheet.save(os.path.join(ART, "elias_anim.png"))
    json.dump({"fw": fw, "fh": fh, "foot": foot, "anims": order},
              open(os.path.join(ART, "elias_anim.json"), "w"))

    z = 8
    sheet.resize((sheet.width*z, sheet.height*z), Image.NEAREST).save(
        os.path.join(PREV, "elias_anim_8x.png"))
    for name, idx in order.items():
        gs = [small[i].resize((fw*z, fh*z), Image.NEAREST).convert("RGB") for i in idx]
        gs[0].save(os.path.join(PREV, f"anim_{name}.gif"), save_all=True,
                   append_images=gs[1:], duration=110, loop=0)
    print("yazildi: art/elias_anim.png + .json")

if __name__ == "__main__":
    main()
