#!/usr/bin/env python3
"""
UNPERSON / Alkov demosu — ElevenLabs ses uretimi.
Anahtar 1984 projesinin .env dosyasindan okunur.

  python3 tools/gen_ses.py            # eksikleri uret
  python3 tools/gen_ses.py --force    # hepsini yeniden uret
"""
import json, os, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV  = os.path.join(os.path.dirname(ROOT), "1984", ".env")
OUT  = os.path.join(ROOT, "audio")
TTS  = "https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128"
SFX  = "https://api.elevenlabs.io/v1/sound-generation"

ANONS = "XrExE9yKIg1WjnnlVkGX"   # Matilda — telekran anonsu, soguk ve duygusuz

def token():
    for line in open(ENV, encoding="utf-8"):
        line = line.strip()
        for k in ("ELEVENLABS_API_KEY=", "ELEVEN_LABS=", "ELEVAN_LABS="):
            if line.startswith(k):
                return line.split("=", 1)[1].strip()
    sys.exit("ElevenLabs anahtari bulunamadi: " + ENV)

VO = {
 # ucuncu yakalanmada telekran konusur
 "vo_dur":  (ANONS, "Memur. Görüldünüz. Olduğunuz yerde kalın."),
 # ingilizce surum
 "vo_stop": (ANONS, "Officer. You have been seen. Remain where you are."),
}

FX = {
 "adim1":    ("a single soft footstep of a worn leather shoe on bare wooden "
              "floorboards, quiet room, close mic", 0.6),
 "adim2":    ("a single soft footstep of a worn leather shoe on bare wooden "
              "floorboards, slightly different creak, quiet room", 0.6),
 # patlamasiz yeni adim seti — vurgu yok, hafif surtme
 "adim3":    ("a very light quick scuff of a soft shoe sole brushing across "
              "wooden floorboards, gentle, quiet, no impact, no thump", 0.5),
 "adim4":    ("a gentle muffled heel-to-toe step of a soft-soled slipper on "
              "old floorboards, faint wood creak, quiet, no impact", 0.5),
 "kibrit":   ("a wooden match struck once and flaring into flame, short hiss", 1.2),
 "mum_ufle": ("a short human breath blowing out a small candle flame, tiny "
              "wick hiss at the end", 1.0),
 "yazi":     ("a pencil writing two short strokes on rough paper, graphite "
              "scratch, close", 0.9),
 # her etkilesime ozgu sesler
 "crackle":  ("a short burst of television static crackle from an old CRT "
              "screen", 0.8),
 "sting":    ("a low ominous orchestral drone sting, dark, short, dread", 1.6),
 "thunder":  ("distant thunder rumbling softly behind steady rain on a "
              "window pane", 2.0),
 "clink":    ("a small glass paperweight tapped once on a wooden desk, "
              "delicate clink", 0.7),
 "cloth":    ("a heavy wool coat rustling once as a man turns, short", 0.9),
 "creak":    ("an old wooden stool creaking once as someone sits down", 1.0),
 "page":     ("fingertips tapping twice on a paper notebook, soft, close", 0.6),
 "knock":    ("a single knuckle knock on a heavy wooden desk, dry, close", 0.6),
 # ortam katmanlari
 "amb_rain": ("very soft distant rain heard from indoors through a closed "
              "window, muffled smooth wash, no individual drops, no dripping, "
              "steady and even, low and quiet, loopable ambience", 10.0),
 "amb_room": ("empty concrete room tone, very low air movement, faint muffled "
              "building sounds far away, loopable ambience", 10.0),
 "amb_storm":("a single long distant thunder roll, far away, soft, fading out", 4.0),
 "simsek":   ("a sharp lightning strike crack with a fast rolling thunder tail, "
              "storm, medium distance", 3.0),
}

TOK = token()

def post(url, body, path, deneme=0):
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
        headers={"xi-api-key": TOK, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            open(path, "wb").write(r.read())
        return "TAMAM"
    except urllib.error.HTTPError as e:
        msg = e.read().decode()[:180]
        if e.code in (429, 500, 502, 503) and deneme < 3:
            time.sleep(6 * (deneme + 1)); return post(url, body, path, deneme + 1)
        return f"HATA {e.code}: {msg}"
    except Exception as e:
        if deneme < 3:
            time.sleep(6 * (deneme + 1)); return post(url, body, path, deneme + 1)
        return f"HATA: {e}"

def gen(ad, force=False):
    path = os.path.join(OUT, ad + ".mp3")
    if os.path.exists(path) and not force:
        return ad, "atlandi"
    if ad in VO:
        vid, metin = VO[ad]
        body = dict(text=metin, model_id="eleven_multilingual_v2",
                    voice_settings=dict(stability=0.62, similarity_boost=0.75,
                                        style=0.0, use_speaker_boost=True))
        return ad, post(TTS.format(vid=vid), body, path)
    prompt, sure = FX[ad]
    body = dict(text=prompt, duration_seconds=sure, prompt_influence=0.62)
    return ad, post(SFX, body, path)

def main():
    force = "--force" in sys.argv
    os.makedirs(OUT, exist_ok=True)
    work = list(VO) + list(FX)
    print(f"{len(work)} ses uretilecek -> {OUT}\n")
    ok = 0
    with ThreadPoolExecutor(max_workers=3) as ex:
        for ad, st in ex.map(lambda a: gen(a, force), work):
            print(f"  {st:<14} {ad}")
            ok += st in ("TAMAM", "atlandi")
    print(f"\n{ok}/{len(work)} hazir.")

if __name__ == "__main__":
    main()
