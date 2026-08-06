# APPROVED REALITY — Motor Eşlemesi ve Yol Haritası

Doküman hiyerarşisi:

1. **BLUEPRINT.md** — kanonik oynanış anayasası: tasarım tezi, döngüler,
   Çelişki Defteri durumları, puzzle grameri (7 bileşen + yasak kalıplar),
   öğretme eğrisi, 6 bölümlük sahne-sahne akış, method profile +
   Adaptive Director, Godot 4.x üretim mimarisi ve Bölüm 1-3 AI üretim
   promptları. Çelişki hâlinde BLUEPRINT kazanır.
2. **STORY.md** — senaryo kanonu (BLUEPRINT bölüm yapısı 6 bölümdür;
   DESIGN.md'deki 5'lik yapı eskidi).
3. **DESIGN.md** — tür/katman özeti (BLUEPRINT'in öncülü; tarihsel).
4. **ENGINE.md** — korunan görsel/işitsel sistemlerin envanteri.
   BLUEPRINT Godot önerir; ENGINE.md'deki teknikler (rampalar, ışık
   haritası, deterministik animasyon, ses boru hattı) motordan bağımsız
   taşınır. Prompt 1 zaten mevcut oda görselini referans kabul ediyor.

Açık karar: üretim motoru (aşağıda §0). Prototip:
`unpersoned/alkov-seviye4.html`.

## 0 · Motor kararı — KARAR VERİLDİ: JS canvas devam (31 Tem 2026)

Mevcut motor büyütülür; Godot'ya geçilmez. BLUEPRINT'in Godot'ya özgü
maddeleri (sahne ağacı, GDScript, autoload) **içerik ve kabul kriteri
speci** olarak okunur — sistem listesi, veri şemaları, akışlar ve kabul
kriterleri motordan bağımsız geçerlidir.

JS mimari eşlemesi (BLUEPRINT §14-15 → bizim dünya):

| BLUEPRINT sistemi | JS karşılığı |
|---|---|
| SceneManager | sahne = veri modülü (`scenes/*.js`: mat-buffer kurulumu, hotspot, LOOK, ışık kaynakları); tek motor çekirdeği |
| GlobalState + SaveManager | `state.js` — BLUEPRINT §14.3 JSON şeması aynen; localStorage'a serileştirme (1984 kampanyası kalıbı) |
| AdaptiveDirector | `director.js` — kural tabanlı, yalnız bölüm geçişinde; method_profile en yüksek 2 etiket → modifier listesi |
| SurveillanceSensor | mevcut göz state machine'i genelleştirilir: SCAN_ROOM / WATCH_DESK / WATCH_WINDOW / SUSPICIOUS + ses eşiği + ışık görünürlüğü |
| BreachController | mevcut BREACH 0/3 + soft-fail modifier'ları |
| ContradictionNotebook | `notebook.js` — kart: observation → hypothesis → evidence; Tab ile açılır |
| DocumentPuzzleSystem | yakın plan masa ekranı; 1984 sürükleme dilbilgisi (belgeyi araca/slota götür) + damga game feel |
| DialogueSystem | seçenek: text, tone (sincere/official/ironic/evasive), response_window, mara_effect, system_effect, required_flags |
| ConsequenceSystem | world_flags → sahne kurulumunda okunur |
| HintSystem | 3 kademe; hikâye cezası yok |

Dosya yapısı hedefi: `approved-reality/` içinde `index.html` (kabuk+motor),
`js/` (çekirdek sistemler), `data/` (bölüm/diyalog/puzzle/yönetmelik JSON),
`audio/`, `tools/` (gen_ses.py kopyası). Prototipten motor çekirdeği
(render+animasyon+aktör+ses) taşınır, oyun durumu yeniden yazılır.

Kural: **oyun içi tüm metin İngilizce**; tasarım dokümanları Türkçe kalabilir.

---

## 1 · Prototip zaten neyi kanıtladı

DESIGN.md'deki açılış sahnesi spesifikasyonunun yarısı ALCOVE'da çalışır
durumda:

| Tasarım gereksinimi | Prototipteki karşılığı | Durum |
|---|---|---|
| Mekanik göz karakteri izler, kör noktaya döner | pupil takip/tarama/kırpma fazları | ✅ birebir |
| Günlüğe 2+2=4 yazma döngüsü | 4 tıklık yazım + güvenli pencere | ✅ |
| İhlal sayacı (BREACH 0/3), yakalanma geri bildirimi | kızıl iris + vinyet + buzz + VO | ✅ |
| Mum/ışık = yazma önkoşulu | canlı ışık haritası, karanlıkta yazamama | ✅ |
| Tıkla-yürü, yürü-sonra-etkileş, hotspot+dönen replikler | aktör sistemi + LOOK tablosu | ✅ |
| Her aksiyonda SFX + ortam yatağı + müzik | ElevenLabs + WebAudio + Suno | ✅ |
| Sistem yorumlu anlatıcı ("HAREKETSİZLİK: KAÇINMA...") | strip mesajları | 🔶 kalıp var, ton PROLOG'a çevrilecek |

## 2 · Açılış sahnesi (Prolog) için eksik parçalar

DESIGN.md'deki çözüm zincirine göre sırayla:

1. **Telescreen yayını** — başlatılabilir zorunlu yayın; marş çalarken
   `pen noise masked` durumu. (Ses: Suno marş varyantı ya da ElevenLabs.)
2. **Devriye ışığı** — pencereden periyodik geçen projektör süpürmesi;
   ışık haritasına dördüncü kaynak olarak eklenir (motor destekliyor).
3. **Oda ışığı anahtarı** — açıkken dışarıdan görülme riski; kapatınca
   yazamama → **ayna puzzle'ı**: koridor ışığını masaya yönlendirme.
4. **Günlüğü gizleme adımı** — yazdıktan sonra gizli bölmeye sürükleme.
5. **Alkış zamanlaması** — yayın sonunda doğru anda tıklama (2,1 saniye
   geç alkışlamak Mara'nın suçlaması — mekanik, hikâyeyle aynı dili
   konuşuyor).
6. **Kalp ritmi sorusu + 4 cevap** — cevap VE cevap süresi kaydedilir.
7. **Kırmızı nokta finali** — bölmede belli belirsiz LED; çözümsüz
   paranoya vuruşu.
8. **Sistem yorumları** — her nesne bakışına PROLOG etiketleri
   ("EXCESSIVE INTEREST IN THE OUTSIDE WORLD" vb.) — LOOK tablosunun
   İngilizce yeniden yazımı.

## 3 · HUD / okunabilirlik (DESIGN §görsel)

- Alt şerit bağlamsal durum: `EYE: DISTRACTED · WINDOW: CLEAR ·
  TELESCREEN: LISTENING` — yalnız değişen kanal gösterilir, kokpit yok.
- Ses dalgası göstergesi: eylem anında 3-4 piksellik dalga ikonu.
- Gözün hedefi: bebek yönü + izlemedeyken sönük kırmızı nokta.

## 4 · Sistemler (bölüm 1+ için sıra)

1. **Sahne yöneticisi** — çoklu oda/geçiş; mevcut tek-sahne IIFE'si
   `kurSahne()` başına veri dosyasına ayrılır.
2. **Yakın plan masa/terminal çerçevesi** — Mara dosyası puzzle'ı
   (belge karşılaştırma + damga). 1984 prototipindeki sürükleme dilbilgisi
   buraya taşınır (belgeyi araca götür = işlem).
3. **Çelişki Defteri** — envanter yerine fikir koleksiyonu; puzzle
   girdisi olarak `kayıt + yönetmelik = geçersiz kanıt` kombinasyonu.
4. **Dört değer** — breach (var), citizen score, Mara trust (gizli,
   "Subject Attachment" olarak saklanır — arayüz twist'i için isim
   baştan doğru konmalı), system suspicion (gizli, dünyaya yansır).
5. **Diyalog katmanı** — söylenen/anlaşılan/kaydedilen üçlüsü; her
   seçenek üç değere ayrı yazar.
6. **Davranış modeli bildirimleri** — oyuncunun yöntem tekrarı sayaçları;
   eşik aşımında "BEHAVIOR MODEL UPDATED" + ilgili kuralın gerçekten
   sıkılaşması.

## 5 · Üretim boru hatları

- **Ses:** `unpersoned/tools/gen_ses.py` kalıbı → `approved-reality/tools/`
  kopyalanır; sistem sesi (soğuk anons) için Matilda İngilizce doğrulandı.
  Normalizasyon hedefleri ENGINE.md §4.
- **Müzik:** Suno kredisi yenilenince kalan istemler (bleak industrial,
  paranoid synth, totalitarian march, typewriter industrial, music box) —
  Koruyucu yayını için ayrıca "state anthem, ceremonial choir-less brass"
  gerekecek (alkış zamanlama sahnesinin marşı).
- **Görsel:** 192×108 prosedürel motor Prolog + Bakanlık için sürer;
  yakın plan ekranlar ayrı çözünürlükte (384×216) düşünülebilir
  (ENGINE.md'de ölçek notu).

## 6 · Milestone'lar (BLUEPRINT Bölüm 1 = Prompt 1 kabul kriterleri, JS'e uyarlanmış)

**M1 — Sahne 1.1 "Doğal Davran"** (dikey dilim, tek oda):
motor çekirdeğinin `approved-reality/`ye taşınması + göz 4-durumlu state
machine + telescreen yayını (6 sn ses maskesi) + devriye projektörü +
lamba/görünürlük + poster camı yansıtma puzzle'ı + günlük 3 aşamalı yazım +
gizleme + alternatif çözümler (ısıtma borusu / perde-lamba) + method tag
kaydı + 3-breach soft fail (ek mikrofon modifier'ı) + kalp ritmi sorusu.
İngilizce metin seti; sistem yorumlu açılış (yüz tarama, DOĞAL DAVRAN).

**M2 — Sahne 1.2-1.3:** gelincik vinyeti + işe gidiş (3 mikro karar,
puanın sosyal motor olduğu sahne).

**M3 — Sahne 1.4-1.6:** yakın plan belge masası çerçevesi + 3 tutorial
dosyası + Mara Venn dosyası (3 çözüm yolu: 8.17 / zaman kodu / feda) +
Vale teklifi + bölüm sonu Adaptive Director değerlendirmesi + save/load.

M3 sonunda BLUEPRINT Prompt 1 kabul listesi maddeler hâlinde test edilir
(pixel hunting yok, üç oda çözümü, üç dosya çözümü, tag'ler, modifier
aktarımı).

---

## 7 · DURUM — 31 Tem 2026 gecesi: TÜM OYUN İNŞA EDİLDİ

M1-M3 ve ötesi (Bölüm 4-6 + epilog) tek gecede tamamlandı; tarayıcıda
uçtan uca oynanarak doğrulandı. Dosyalar: `index.html` + `js/core.js`
(motor), `js/ch1-3.js`, `js/ch46.js`, `js/main.js`. Çalıştırma:
`python3 -m http.server 8490` (approved-reality/ içinden), sekme görünür
kalmalı (arka planda setTimeout kısılır). Kalan: Suno marş/tema
parçaları, ch4-6 sahne derinleştirme, oda-2+ görsel çeşitleme.
