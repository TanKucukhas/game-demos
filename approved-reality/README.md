# APPROVED REALITY

Tarayıcıda çalışan 2D psikolojik gözetim / deduction macerası. 192×108 sanal
çözünürlük, prosedürel ışık motoru, nokta-tıkla oynanış.

    python3 -m http.server 8490     # sonra http://localhost:8490/

Tasarım: `DESIGN.md`, `STORY.md`, `BLUEPRINT.md`, `PLAN.md`, `ENGINE.md`.

---

## Üç sanat yönü yan yana duruyor

Karakter ve sahne sanatı için üç yaklaşım denendi. Üçü de repoda; adres
çubuğundaki `?sanat=` parametresiyle seçiliyor:

| | URL | Karakter | Sahne nesneleri |
|---|---|---|---|
| 1. Elle çizim | `?sanat=elle` | kodla çizilen 6×14 sprite (3× ölçekli) | tamamen kodla (`gfx.put`) |
| 2. PixelLab | `?sanat=pixellab` | PixelLab sprite + iskelet animasyonu | PixelLab parçaları |
| 3. Sorceress | *(varsayılan)* | Sorceress karakteri + türetilmiş animasyonlar | PixelLab parçaları |

Üç varyant da aynı ışık motorunu, aynı ölçeği (**ayakta insan = 45 piksel**) ve
aynı oynanış kodunu kullanır. Fark sadece hangi görsel varlıkların yüklendiğidir.

### 1. Elle çizim
Her şey `gfx.put` ile malzeme rampalarından çiziliyor; karakter `drawActor`
içinde piksel piksel. Üretim maliyeti sıfır, düzenlemesi anında, üslup birliği
garantili. Detay tavanı düşük.

### 2. PixelLab
`tools/gen_prop.py` nesneleri, `tools/gen_karakter.py` karakteri,
`tools/gen_anim.py` animasyonları üretir. Animasyon **iskelet tabanlıdır**:
pozlar kodla kurgulanır, model karakteri o pozlarda çizer — böylece kimlik ve
ölçek sabit kalır. Metin tabanlı animasyon (`animate-with-text`) denendi ve
işe yaramadı: referans bağlılığı yüksekken model hareketi tümden yok sayıyor,
düşükken karakterin boyu ve kimliği değişiyordu.

### 3. Sorceress
`sorceress.games` AutoSprite V3 ile üretildi (karakterimiz referans verilerek).
Kaynak sanat belirgin şekilde daha iyi, ama iki sınır çıktı:
video modeli yürüyüş döngüsünü uygulamadı (üç klip de neredeyse durağan), ve
592×1504'lük kaynak oyunun 45 piksellik ölçeğine inerken detayın çoğunu
kaybediyor. Yürüyüş ve oturuş bu yüzden **yüksek çözünürlükte prosedürel**
üretilip sonra küçültüldü (`tools/sorc_sprite.py`); yan profil yürüyüş ise
PixelLab'in `rotate` + iskelet hattıyla eklendi (`tools/yan_yuru.py`).

---

## Motor notları

**Işık.** `lightPass` her karede her pikseli yeniden hesaplar: malzeme rampası +
canlı ışık haritası + Bayer dither. Bu dekor değil, bölüm 1'in bulmacası —
lambayı söndürmek, perdeyi kapatmak, devriye ışığını camla masaya yansıtmak.

**Parça katmanı.** AI nesneleri `gfx.prop` ile ışık haritasının içine
yerleştirilir; aynı ışıkla gölgelenir ve aynı bantlamadan geçer. Yerleşim kodda
kaldığı için "masayı 4 piksel sola al" hâlâ mümkün.

**Yazı katmanı.** Metinler ayrı bir 3× tuvale (`#tv`) çizilir, sahne 1×
kalır — yazılar keskin, dünya iri pikselli.

**Ölçek.** Tek referans: ayakta insan 45 piksel. Parça ölçüleri
`tools/gen_prop.py` içinde bunun katı olarak tanımlıdır; yoksa masa ile yatak
ayrı dünyalardan gelmiş gibi duruyor.

## Araçlar

    tools/gen_portre.py    kimlik portreleri (doğrulama ekranı, Mara dosyası)
    tools/gen_prop.py      sahne nesneleri
    tools/gen_karakter.py  karakter sprite'ı
    tools/gen_anim.py      iskelet tabanlı animasyon
    tools/gen_sahne.py     tam sahne arka planı (deneme)
    tools/sorc_sprite.py   Sorceress videolarından oyun sprite'ı
    tools/yan_yuru.py      profil yürüyüş
    tools/gen_ses.py       ElevenLabs ses efektleri

Anahtarlar `../1984/.env` dosyasından okunur.
Görsel karşılaştırma galerisi: `art/index.html`.
