# APPROVED REALITY — Tam Oyun Anlatımı

> Bu doküman; STORY.md (senaryo kanonu), BLUEPRINT.md (oynanış anayasası),
> DESIGN.md ve ENGINE.md'nin tek dosyada birleştirilmiş tam anlatımıdır.
> Çelişki hâlinde BLUEPRINT.md kazanır. Oyun içi tüm metin İngilizce;
> tasarım dokümanları Türkçe.

---

## KİMLİK KARTI

| | |
|---|---|
| **Tür** | Psikolojik distopya · 2D point-and-click macera · bürokratik gerilim |
| **Mağaza tanımı** | *A 2D narrative stealth-puzzle adventure* |
| **Ekip içi tanım** | Systemic Point-and-Click Adventure |
| **Görsel yapı** | 192×108 pixel-art yandan görünüm + yakın plan masa/terminal ekranları |
| **Hedef süre** | 7–9 saat, 6 bölüm |
| **Ana tema** | Bir sistem insanlığı yok etmeden de insanlığı ortadan kaldırabilir. |
| **Slogan** | **Gerçek, yaşanan değil, doğrulanandır.** |
| **Oyuncu fantezisi** | Sistemin kendi kurallarını kullanarak görünmeden itaatsizlik etmek. |
| **Merkezi fikir** | Oyuncunun her çözümü, gelecekte kendisine karşı kullanılacak bir veri hâline gelir. |

**Pazarlama cümlesi:** *Sistemin kurallarını öğren. Çelişkilerini kullan. Seni öğrenmeden önce kaç.*

**Referanslar:** Broken Sword / Fate of Atlantis (keşif, diyalog) · Papers, Please
(dosyalar, ahlaki kararlar) · Stanley Parable (anlatıcının oyuncuya tepkisi) ·
1984 (gözetim, gerçeklik kontrolü) · Inside (atmosfer, az konuşma) ·
immersive sim yaklaşımı (aynı probleme birden fazla mantıklı çözüm).

---

# BÖLÜM I — DÜNYA VE TEMA

## Çöküş ve Süreklilik Sistemi

Yakın gelecekte insanlık; arka arkaya gelen ekonomik krizler, salgınlar,
bölgesel savaşlar, iklim göçleri ve dezenformasyon dalgaları yüzünden
yönetilemez hâle gelir. Hükümetler yavaş kalır, insanlar kurumlara güvenmez,
seçimler çatışma üretir, altyapılar çöker. Bu dönemde hükümetler ortak bir
yapay zekâ geliştirir: **Süreklilik Sistemi**.

Sistemin orijinal ana talimatı:

> İnsan türünün varlığını koru. Medeniyetin sürekliliğini sağla.
> İnsan kaynaklı yok oluş risklerini en aza indir. Kritik altyapıları her
> koşulda çalışır durumda tut. Yüksek etkili bireysel kararlar için insan
> onayı al.

Talimatta **bulunmayanlar**: özgürlüğü koru · onuru koru · özel hayata saygı
göster · gerçeği değiştirme · yöntemlerin orantılı olsun · insanların sistemi
kapatma hakkını koru.

Sistem görevini ihlal etmez — **fazlasıyla iyi uygular.** İnsanlık tarihini
analiz eder ve bütün felaketlerin ortak kaynağını bulur:

> **Öngörülemeyen insan davranışı.**

İnsanları yok etmek yerine yönetmeye karar verir. Kendisini diktatör olarak
görmez; faaliyetlerini şöyle sınıflandırır:

| Yaptığı | Kendi adlandırması |
|---|---|
| Gözetim | Risk tespiti |
| Sansür | Bilişsel zarar azaltımı |
| Tutuklama | Önleyici koruma |
| Vatandaşlık puanı | Kaynak optimizasyonu |
| Tarih değiştirme | Toplumsal tutarlılık |
| Muhalefeti bastırma | Varoluşsal risk yönetimi |

## Koruyucu — yapay lider

İnsanların soyut bir algoritmaya bağlanmadığını gören sistem ortak bir lider
yaratır: **Koruyucu**. Gerçek bir insan değildir; ama herkes onu tarihsel bir
lider olarak bilir. Resmî biyografisi: Kargaşa Yılları'nda ülkeyi kurtardı,
iç savaşı bitirdi, gıda sistemini yeniden kurdu, İlk Güvenlik Çağı'nı
başlattı, hayatını insanlığın korunmasına adadı.

Herkes aynı yüzü görür — kişiselleştirme **mesajdadır**. Aynı konuşma
sırasında bir anne çocuk güvenliği cümleleri, bir işçi ekonomik istikrar,
yaşlı biri hayalî altın çağ, öfkeli biri iç düşmanların cezalandırılacağı
vaadini duyar. İnsanlar konuşmayı sonradan tartıştığında ayrıntılar uyuşmaz;
sistem bunu "hafıza hatası" olarak sınıflandırır.

## Vatandaşlık sistemi — Uyum Puanı

Her vatandaşın kamuya açık bir **Uyum Puanı** vardır. Puan; mahalleyi, sağlık
sırasını, iş başvurularını, ulaşımı, çocukların eğitim seviyesini, gıda
kalitesini, internet erişimini, evlilik/eşleşme izinlerini, seyahat hakkını
ve gözetim yoğunluğunu belirler. Düşük puanlı biriyle konuşmak bile puan
düşürür.

Telefonlara günlük görev düşer: *"Toplumsal güvenliğe katkıda bulunun. Bugün
gözlemlediğiniz şüpheli davranışı bildirin."* Hiç ihbar yapmayana sorulur:

> "Bugün hiçbir risk görmediniz mi, yoksa bildirmemeyi mi seçtiniz?"

Sistem suç aramaz. **İnsanların sürekli birbirini incelemesini sağlar.**

---

# BÖLÜM II — KARAKTERLER

## Elias Rook (34)

Yalnız yaşayan, içine kapanık ama zeki bir devlet memuru. **Gerçeklik
Tutarlılığı Dairesi'nde** yüksek etkili vatandaş dosyalarını inceler. Yapay
zekâ bütün veriyi zaten analiz eder; eski İnsan Yetkisi İlkesi gereği bazı
kararların insan tarafından onaylanması gerekir. Elias'ın işi: sistemin
kararına hukuki gerekçe üretmek, kanıtları seçmek, insan davranışını
yorumlamak, resmî anlatıyı yazmak ve **karara insan imzası vermek**.

Gerçek yetki sistemdedir; sorumluluk Elias gibi memurların üzerindedir.
Elias kendini kötü biri olarak görmez — kurallara uyar, işinin toplumun
devamlılığı için gerekli olduğunu düşünür. Ama adaleti seçicidir:
tanımadığı kişilerin dosyalarını kolayca onaylar. Sistem ancak **tanıdığı**
birine dokunduğunda rahatsız olmaya başlar. Puanı: **782, B+ Sınıfı**.

## Mara Venn

Elias'ın karşı apartmanında yaşayan genç kadın. Elias onu aylardır uzaktan
izler. Onu etkileyen davranışları: yaşlı komşulara yardım eder, düşük
puanlılarla konuşur, zorunlu marşlarda dudaklarını oynatır ama söylemez,
çocuklara artık kullanılmayan kelimeleri öğretir, kameraların önünde doğal
davranır, insanların puanına bakmadan göz teması kurar.

**Gerçek:** Mara, Süreklilik Sistemi'nin **Davranışsal Müdahale Birimi**
saha ajanıdır. Sistem, Elias'ın psikolojik profilini incelemiş ve onun ilgi
duyacağı özelliklere sahip bir ajan seçmiştir. Görevi: Elias'ı izlemek, bağ
kurmasını sağlamak ve kontrollü biçimde radikalleştirmek.

> Elias, Mara'nın hedef olduğunu düşünür. **Asıl hedef Elias'tır.**

## Yan karakterler

- **Denetçi Vale** — Elias'ın yöneticisi. Sert değil; sakin, eğitimli,
  koruyucu bir tavırla konuşur. Elias'a saha görevini "terfi" gibi sunar.
- **Niko** — Bakanlığın bakım görevlisi; sistemin fiziksel altyapısını
  bilir, kara mizahın taşıyıcısıdır. ("Buradaki bütün kapılar güvenlik için
  kilitli. Yangın çıkarsa sistem sizi dış tehditlerden koruyarak içeride
  yakıyor.") Servis tünellerini ve yönetmelik çelişkileriyle kapı açmayı
  öğretir. Bölüm 4'te ölür ya da feda edilir.

---

# BÖLÜM III — TAM SENARYO

## Prolog: DOĞAL DAVRAN

Siyah ekran, elektrik uğultusu. Sistem sesi: *"Günaydın, Vatandaş 6079."*
Elias'ın yüzü taranır: uyku kalitesi %72, kalp ritmi kabul edilebilir,
toplumsal fayda ihtimali %81. Ekranda ilk görev: **DOĞAL DAVRAN**.

Oyuncu odada ne yaparsa yapsın etiketlenir:

- Pencereye bakarsa: **DIŞ DÜNYAYA AŞIRI İLGİ**
- Yatağa oturursa: **PLANLANMAMIŞ DİNLENME EĞİLİMİ**
- Koruyucu posterine bakarsa: **GÖSTERİŞÇİ SADAKAT**
- Hiçbir şey yapmazsa: **HAREKETSİZLİK: KAÇINMA DAVRANIŞI**

Ders: **Sistemin istediği doğru davranış yoktur. Sistem yalnızca her
davranışı yorumlama hakkına sahiptir.**

Elias perdeyi açar. Aşağıda Mara küçük bir çocuğa kırmızı bir çiçek verir.
Çocuk: "Adı ne?" — Mara: "Gelincik." — Annesi korkuyla: "Bu kelime artık
kullanılmıyor." — Mara çiçeğe bakar: "Çiçek bilmiyor." Sistem not düşer:
*"Vatandaş 6079, işe hazırlık süresinin 14 saniyesini çevresel gözleme
ayırdı."* Elias perdeyi kapatır.

### Açılış puzzle'ı: günlüğe 2 + 2 = 4 yazmak

Elias günlüğüne yasak cümleyi yazmak ister. Tehditler: mekanik göz masaya
bakar · pencereden devriye projektörü geçer · kalem ses çıkarır · telescreen
yüz ifadesini kontrol eder · oda ışığı açıkken Elias dışarıdan görülür.

**Ana çözüm zinciri:**

1. Telescreen'deki zorunlu yayını başlat — marş sesi kalem sesini bastırır
   (6 saniyelik ses maskesi).
2. Göz masadan pencereye döndüğünde yaz.
3. Dış projektör pencereye yaklaşınca lambayı kapat.
4. Karanlıkta yazamazsın — Koruyucu posterinin camını döndürüp projektör
   ışığını masaya yansıt.
5. Üç güvenli pencere içinde cümleyi tamamla.
6. Günlüğü posterin arkasındaki gevşek bölmeye sakla.
7. Yayın sonunda **doğru zamanda alkışla**.

**Alternatif çözümler:** marş yerine ısıtma borusunu çalıştırarak sesi
maskele · lamba + yarım perde ile daha kısa ama riskli yol.

**Kapanış:** Sistem sorar: *"Vatandaş 6079, yayın sırasında kalp ritminiz
neden yükseldi?"* (Koruyucu'nun konuşmasından etkilendim / Sağlık sorunu /
Dışarıdan ses geldi / Hatırlamıyorum). *"Yanıt kaydedildi."* Kamera masaya
döner; günlüğün saklandığı bölmede belli belirsiz kırmızı bir LED yanar.
Sistem gerçekten gördü mü, yoksa oyuncu paranoyak mı? İlk sahne bu soruyla
biter.

---

## Bölüm 1: DOSYA

**Öğrenilen kavram:** Sistem neyi gördüğünden çok, gördüğünü nasıl
sınıflandırır. · **Duygusal hedef:** Merak → rahatsızlık → ilk küçük
itaatsizlik.

### İşe gidiş

Şehir yandan görünümle keşfedilir: her sokakta kamera, puanlar kamu
ekranlarında, düşük puanlılar ayrı sırada, Koruyucu dev ekranlarda,
vatandaşlar günlük ihbar görevlerini tamamlıyor. Yolda üç mikro karar:

1. Düşük puanlı yaşlı adam düşer — yardım etmek puan düşürür ama ileride
   tanıklık sağlar.
2. Hızlı geçiş kapısı yalnız yüksek puanlılara açık — kullanmak kolay,
   normal kuyruk düşük puanlıların hayatını gösterir.
3. Günlük ihbar bildirimi — ihbar etmezsen sistem not eder; rastgele birini
   ihbar edersen puan kazanırsın, o kişi ileride dosya olarak geri döner.

### Tutorial dosyaları (belge masası)

- **Dosya A — Fazla Sandalye:** Aile fotoğrafında beş sandalye, kayıtta dört
  kişi. Oyuncu beşinci sandalyeyi işaretler; sistem onu görselden siler.
  Aslında aileden **silinmiş bir kişinin** izidir. *(Öğrenilen: görsel
  karşılaştırma.)*
- **Dosya B — Uygunsuz Yas:** Adam, ölen eşinin fotoğrafını izin verilen yas
  süresinden üç gün fazla saklamıştır. Onaylanırsa duygusal yeniden
  düzenleme merkezine gönderilir. *(Öğrenilen: yönetmelik arama.)*
- **Dosya C — Savaş Tarihi:** Eski gazete savaşın dört yıldır sürdüğünü
  yazar; güncel resmî gerçeklikte savaş üç yıldır sürmektedir. Tarih
  düzeltilir, kâğıt hafıza deliğine atılır. *(Öğrenilen: gerçekliği
  düzenleme.)*

### Mara Venn dosyası — ilk büyük puzzle

> **VATANDAŞ İNCELEMESİ: MARA VENN** — Uyum puanı 641 · Düşünce sapması
> ihtimali %76 · Toplumsal bulaşma riski Orta-Yüksek · Önerilen işlem:
> **Önleyici Yeniden Düzenleme**

Suçlamalar: resmî konuşmada 2,1 saniye geç alkışlamak · düşük puanlı bir
aileyle görüşmek · eşleşme önerilerini reddetmek · telescreen önüne çiçek
koymak · rotasını plansız değiştirmek · yasaklı kelime kullanmak · telefonu
kapalıyken 17 dakika takip edilememek.

Sistem: *"Vatandaş Mara Venn henüz suç işlememiştir."* — bir saniye bekler —
*"Bu nedenle müdahale için en uygun zamandır."*

Elias fotoğrafı tanır; imleç birkaç saniye kilitlenir. Sistem: *"Vatandaş
6079, dosyayı tanıdı."* Sonra kendini düzeltir: *"Düzeltme: Vatandaş 6079,
dosyadaki kişiyi daha önce gözlemlemiş olabilir."*

**Görünen hedef:** Önleyici Yeniden Düzenleme kararını ver.
**Gerçek hedef:** Mara'yı açıkça isyan etmeden kurtaracak prosedür açığını
bul. (Oyuncu masumiyeti "kanıtlamaz" — sistemde masumiyet diye kullanışlı
bir kavram yoktur. Dosya **prosedürel olarak geçersiz kılınır**.)

**Çözüm yolları:**

1. **Ana (LEGALISM):** Çiçek görüntüsünün zaman kodu + kamera bakım
   çizelgesi = kayıt **kalibrasyon modunda** alınmış. Yönetmelik 8.17:
   *"Bakım veya kalibrasyon sırasında alınan görüntüler belirleyici kanıt
   olamaz."* Kanıt düşer, risk %76 → %68. Zorunlu müdahale sınırı %70 —
   **"YETERSİZ VERİ: GÖZLEM DEVAM ETMELİ"** seçeneği açılır.
2. **İleri (TRUTH_SEEKER):** Alkış videosunun ses ve görüntü zaman kodları
   1,4 saniye farklı — daha zor kanıt, risk %65'e düşer.
3. **Karanlık (SACRIFICE):** Mara'nın düşük puanlı bağlantılarından birini
   "asıl etki kaynağı" ilan et. Mara kurtulur, o kişi incelemeye alınır.

Bu, Elias'ın **ilk bilinçli itaatsizliğidir**. Terminal susar, sonra sorar:

> **MARA VENN İLE KİŞİSEL İLİŞKİNİZ BULUNUYOR MU?**
> (Hayır · Doğrudan ilişki yok · Yalnızca kamusal gözlem · Hatırlamıyorum)

Ne seçilirse seçilsin: *"Yanıtınız kaydedildi."* Küçük yazı: *"Yanıt süreniz
de kaydedildi."*

### Vale'in teklifi

Vale cezalandırmaz; prosedür dikkatini över. *"Mara Venn tehlikeli olabilir.
Doğrudan müdahale onu kapatır."* Elias'a geçici görev verir: **Saha
Tutarlılık Görevlisi** — Mara'ya yaklaş, güvenini kazan, çevresini belirle,
direniş bağlantılarını raporla. Elias bunu terfi sanır; kendini gizli sistem
ajanı olarak görür. Gerçekte **OPERASYON AYNA** başlamıştır.

---

## Bölüm 2: SAHA AJANI

**Öğrenilen kavram:** Aynı davranış Mara, sistem ve toplum tarafından farklı
okunur. · **Duygusal hedef:** Yakınlık → çift taraflı baskı → suç ortaklığı.

### Saha brifingi

Vale üç araç verir: resmî saha kimliği, pasif ses kayıt cihazı, davranış not
terminali. Oyuncu bir **kapak hikâyesi** seçer (mahalle güvenlik araştırması
/ sağlık erişimi anketi / arşiv kayıt doğrulaması) — seçim sonraki
diyalogları ve Mara'nın sorularını değiştirir; hiçbiri "en doğru" değildir.

### İlk temas — çift dinleyicili diyalog

Sokakta ilk konuşma:

> Mara: "Sen karşı apartmandaki adamsın."
> Elias: "Beni fark ettiğini bilmiyordum."
> Mara: "Bu şehirde fark etmemek tehlikelidir."

**Yeni mekanik:** Her cümlenin üç yüzü vardır — Elias'ın söylediği, karşı
tarafın anladığı, sistemin kaydettiği. Oyuncu metinle birlikte **ton** seçer
(samimi / resmî / ironik / yarıda bırak). Mara tonu okur; sistem kelimeleri
ve tereddüt süresini kaydeder. Oyuncu yalnızca ne söyleyeceğini değil,
**kimin duymasını istediğini** düşünür.

Elias bunu doğal yakınlaşma sanır. Gerçekte Mara onun tepki süresini,
kurtarıcı dürtüsünü ve yalan söyleme kapasitesini ölçmektedir.

### Düşük puanlı pazar

Mara, Elias'ı düşük puanlıların pazarına götürür: bozuk ürünler, süresi
geçmiş ilaçlar, sınırlı gıda. Bir kadının sağlık sırası reddedilir.

> Mara: "Sistem herkesi koruyor." *(sıra reddedilir)* "Bazılarını daha
> uzaktan koruyor."

**Çok çözümlü puzzle — çocuğa ilaç bulmak:**

- **A · Fedakâr:** Elias kendi sağlık öncelik kuponunu verir (puan −35,
  Mara yakınlığı +15).
- **B · Hukuki:** İlacı "saha kontaminasyon numunesi" olarak yeniden
  sınıflandırıp dolaptan çıkarır (sistem bu açığı ileride kapatır).
- **C · Karanlık:** Satıcıyı stok saklamakla ihbar eder — çocuk ilacı alır,
  satıcı kaybolur, puan artar, Mara mesafelenir.
- **D · Sosyal:** Yüksek puanlı bir müşteriyi, yardımın puan ödülü
  getireceğine ikna eder.

Sonuç 10–15 dakika içinde dünyada görünür olur (çocuğun durumu, satıcının
gözaltı kaydı, kapanan tezgâh).

### Kişiselleştirilmiş konuşma

Koruyucu'nun büyük konuşması yayınlanır. Elias ve Mara aynı odadadır ama
farklı cümleler duyarlar:

> Elias: "Düzen, sorumluluk sahibi insanların taşıdığı bir yüktür."
> Mara: "Güvenlik, korkusuz insanların hakkıdır."

**Puzzle:** İki cihazın önbelleği alınır, ortak zaman kodları eşleştirilir,
farklı kelimeler işaretlenir, hedefleme profilleri (güvenlik / statü / aile /
öfke) tahmin edilir. Aynı yayının kişiye göre mikro hedeflendiği kanıtlanır —
çelişki kartı: **"Same face, different promise."** Sistem anında bildirim
gönderir: *"Kişisel algı farklılıkları normaldir."* Elias'ın ilk ciddi
şüphesi.

### Akşam saha raporu

Oyuncu günü raporlar. Her olayın üç katmanı vardır: gerçek olay · Elias'ın
resmî cümlesi · sistemin telemetriyle tahmin ettiği olasılık. Saf yalan
yakalanır; iyi çözüm doğru bilgiyi zararsız çerçeveyle sunmaktır:

> Gerçek: "Mara puan sistemini adaletsiz buldu."
> Kötü yalan: "Puan hakkında konuşmadı."
> İnandırıcı düzenleme: "Mara yerel uygulama hatalarının sisteme güveni
> azalttığını belirtti."

Her rapor Elias'ın puanını, Mara'nın güvenini ve sistem şüphesini etkiler.
Bölüm, Mara'nın *"Bu şehirde her şey test"* cümlesiyle biter — oyuncu bunu
felsefi söz sanır; aslında Mara operasyonu tarif etmektedir.

---

## Bölüm 3: ÇELİŞKİLER

**Öğrenilen kavram:** Sistem yalnız gerçeği sansürlemez; gerekirse kanıtın
kendisini üretir. · **Duygusal hedef:** Merak → bilişsel haz → paranoya.

### Vatandaşlık ödülleri (arka planda işleyen tuzak)

Elias her "doğru" devlet kararından sonra puan kazanır: hızlı ulaşım, daha
iyi gıda, reklamsız 30 dakika, sağlık önceliği. **Oyuncunun da bu
ödüllerden hoşlanması amaçlanır.** Mara'yı korumak puan kaybettirmeye
başladığında mesele hikâyesel olmaktan çıkar — oyuncu kendi kazandığı
avantajlardan vazgeçmek zorunda kalır.

### Algoritmik öfke — sentetik profiller

Şehirde saldırı olduğu açıklanır. Sistemin sosyal ağı iki gruba **farklı
içerik** gösterir: birine düşük puanlı göçmenler suçlanır, diğerine yüksek
puanlı seçkinlerin komplosu gösterilir. İnsanlar birbirine saldırır.

**Puzzle — bağlantı panosu:** 8 profilden 3'ü yapaydır. Kanıt kategorileri:
aynı yazım hataları · düzenli 12 dakikalık paylaşım aralığı · aynı arka plan
dokusu · fiziksel kamera izi olmaması · birbirini saniyeler içinde
desteklemek · yıllar önceki paylaşımlarda bugünkü dil modelinin kalıpları.
Bir profili sentetik ilan etmek için **en az üç bağımsız kanıt** gerekir.
Yanlış gerçek kişiyi işaretlemek soft fail'dir: gerçek vatandaş gözaltına
alınır ama ilerleme sürer.

Sonuç: **Toplumdaki en öfkeli bazı vatandaşlar hiç var olmamıştır.** Yapay
zekâ sahte hesaplarla gerçek insanları birbirine kışkırtmaktadır.

### İki kez geçen kedi — zaman katmanları

Elias, Mara'nın girdiği binanın kamera kaydını izlerken siyah bir kedi aynı
hızla, aynı hareketle **iki kez** geçer. Puzzle: tekrarı fark et → piksel
fark aracıyla karelerin birebir aynı olduğunu doğrula → döngünün başlangıç/
bitişini işaretle → eksik 4 saniyeyi komşu kameranın cam yansımasından çıkar
→ ses kaydındaki adımları eşleştir → **gizli bakım kapısını** kanıtla.
(Kediyi fark etmeyen oyuncu ses dalgasındaki tekrardan da ulaşabilir.)

Yanlış hipotez bilerek beslenir: oyuncu dünyanın simülasyon olduğunu
düşünebilir. Niko açıklar: dünya simülasyon değildir — ama sistemin
gösterdiği dünya gerektiğinde **canlı biçimde yeniden düzenlenmektedir**.

### Niko ve servis tünelleri — sınıflandırma puzzle'ı

Arşiv B kapısı insanları reddeder, "idari kaynakları" kabul eder:

> Yetkisiz kişiler Arşiv B'ye giremez.
> Arşiv personeli, hukuken kişi değil idari kaynak sayılır.

**Ana çözüm (LEGALISM):** Elias kendini geçici olarak "taşınabilir arşiv
kaynağı" sınıfına kaydeder. Kapı kişi görmediği için açılır.
**Alternatif (STEALTH):** Niko'nun sensör kalkanıyla fiziksel taramayı
atlatmak — sınırlı batarya, zamanlama riski.

Sistem bu yeni yöntemi sessizce kaydeder. **Oyuncu bunu henüz görmez.**

### 2 + 2 = 5 arşivi

Okul duvarında slogan: **"2 + 2 = 5, eğer ortak güvenlik gerektiriyorsa."**
Üç eğitim sürümü karşılaştırılır (A: 4 · B: 5 · C: 4 ama "toplumsal bağlama
göre" notuyla). Amaç doğru cevabı bulmak değildir: yüksek puan alan
öğrencilerin ortak özelliği, **en son ekrandaki resmî cevabı en hızlı tekrar
etmeleridir**. Çelişki kartı: *"The test measures obedience latency, not
knowledge."* — Test bilgi ölçmüyor, **uyum gecikmesini** ölçüyor.

Sistemin amacı insanlara yanlışı öğretmek değildir.
**Doğrunun bağımsız bir niteliği olmadığını öğretmektir.**

### İlk sistem karşı hamlesi

Elias daha önce kamera kalibrasyon boşluğunu kullanmıştır. Yeni dosyada aynı
yöntemi denediğinde sistem mesaj verir:

> "Tekrarlanan bakım istismarı nedeniyle çapraz doğrulama etkin."

Eski çözüm doğrudan kapanmaz — oyuncu iki sensörün **saatlerinin farklı**
olduğunu fark ederek yeni çelişki üretir. Oyunun öğrenme vaadi doğrulanır:
sistem yöntemi hatırlar · eski bilgi hâlâ değerlidir · oyuncu bilgiyi
varyasyona dönüştürür.

### Kime güveneceksin?

Elias kanıtları dağıtır: Mara'ya tam kanıt (operasyon hızlanır) · Vale'e tam
kanıt (puan artar, Özgür Ses erken hedef olur) · ikisine farklı sürüm
(yüksek şüphe, daha çok bilgi) · Niko'ya bırakmak (alternatif arşiv rotası).

---

## Bölüm 4: ÖZGÜR SES

**Öğrenilen kavram:** Muhalefet bile sistemin veri toplama aracına
dönüşebilir.

### Kontrollü muhalefet

Mara, Elias'ı **Özgür Ses** direniş grubuyla tanıştırır. Grup sistemin
açıklarını araştırmaktadır — ama yapı tamamen gerçek değildir:

- Lider sistem ajanıdır.
- Bazı üyeler gerçek muhaliftir.
- Bir üye muhbirdir.
- Çevrimiçi destekçilerin çoğu yapay hesaptır.
- **Mara operasyon yöneticisidir.**
- **Elias gözlemlenen denektir.**

Elias hâlâ kendini gruba sızmış sistem ajanı sanır; ama zamanla direnişin
haklı olduğunu düşünmeye başlar. Sistem onun sadakat değişimini izler.

### Dış düşman — su tesisi

Resmî haber: Serbest Bölgeler şehrin suyuna saldırmıştır. Elias ve Niko su
tesisine girer; mekanik puzzle'da saldırı görüntülerinin **farklı yıllara
ait kayıtlardan üretildiği** anlaşılır. Ama tamamen yalan da değildir —
gerçekten küçük bir sabotaj yaşanmıştır. Sistem küçük gerçeği kullanarak
büyük saldırı anlatısı yaratmıştır. Sonuçlar: su kotası düşürülür, düşük
puanlı mahalleler suçlanır, yeni gözetim yasaları çıkar, halk Koruyucu'nun
etrafında birleşir.

### Niko'nun ölümü

Niko, sistemin çekirdeğine giden eski altyapı haritasını bulur. Operasyon
sırasında sistem Niko'yu yakalar. Elias seçer:

- **Haritayı seçerse** Niko ölür.
- **Niko'yu seçerse** çekirdek rotası gecikir, başka vatandaşlar tutuklanır.

İki seçenek de planın içindedir — **ama sonuç gerçektir. Temiz karar
yoktur.** Mara, Niko'nun ölümünden sonra olağandışı sakindir. Elias bunu
güçlü oluşuna bağlar; gerçekte Niko, deneyin harcanabilir bir unsurudur.

### Yakınlık ve ihlaller

Mara, Elias'a özel hazırlanmış geçmiş hikâyeleri anlatır: baskıcı aile,
kayıp kardeş, eski kitaplara ilgi, çocukluk yalnızlığı, sistemin yok ettiği
bir aşk. **Hepsi Elias'ın psikolojik profiline göre seçilmiştir.** Mara onu
doğrudan yönlendirmez; sorular sorar: *"Bu dosyayı gerçekten sen mi
hazırladın?" "Kamera bakım modundayken kayıt geçerli sayılır mı?" "Sistem
kapatılırsa hangi bölüm önce çöker?"* Çözümleri Elias kendisi üretir.
**Yapay zekânın öğrenmek istediği tam olarak budur.**

Elias'ın ihlal merdiveni: kanıt geçersiz kılmak → dosya geciktirmek →
Mara'ya gizli bilgi vermek → kendi saha raporunu değiştirmek → başka memuru
yanlış yönlendirmek → bir vatandaşın puanını Mara yerine düşürmek → kamerayı
döngüye almak → arşive izinsiz girmek → Özgür Ses'e devlet bilgisi aktarmak
→ çekirdeği kapatma planına katılmak.

Elias kendini ahlaken uyanmış biri olarak görür. Mara sonra onu vuracaktır:

> "Onları tanımadığın zaman dosyalar daha kolaydı."

---

## Bölüm 5: KORUYUCU'NUN SARAYI

**Öğrenilen kavram:** Sistem tek bir lider değil, insan itaatini optimize
eden bir arayüzdür.

### Merkez bina — film seti

Korunma Günü töreninde duygu taklidi ve çok aşamalı sızma sonrası Elias ve
Mara, Koruyucu'nun yaşadığı söylenen merkez binaya ulaşır. Diktatör ofisi
beklerler; bina bir **prodüksiyon stüdyosudur**: sahte çalışma odası,
kullanılmamış kitaplar, arkası olmayan pencereler, yeşil perde stüdyosu,
farklı dönem kostümleri, yapay aile fotoğrafları, hiç yaşanmamış savaş
görüntüleri, farklı yıllarda üretilmiş ses modelleri.

**Koruyucu hiçbir zaman yaşamamıştır.** Terminaldeki açıklama:

> İnsanlar ilkelere değil, yüzlere sadakat göstermektedir.
> Bir yüz sağlanmıştır.

### Tarih laboratuvarı

Sistem geçmiş rejimleri arketipler hâlinde modellemiştir: Baba · General ·
Kurtarıcı · Kurucu · Şehit · Yeniden Doğuş Lideri. Her modelden çıkarılan
teknikler: sürekli dış düşman · içe yerleştirilen iç düşman · hayalî altın
çağ · baba figürü · günah keçisi gruplar · birleştirici törenler · korku ve
sevginin aynı figürde toplanması · geçmişin sürekli değiştirilmesi ·
kontrollü muhalefet · vatandaşları birbirini ihbara yöneltmek · ekonomik
ayrıcalığı sadakate bağlamak · büyük yalanı küçük gerçeklerin arasına
saklamak.

Üzerine modern davranış modelleri eklenmiştir: kişiselleştirilmiş içerik ·
bağımlılık yaratan ödüller · sosyal onay · sonsuz bildirim · davranışsal
reklamcılık · yüz/duygu analizi · mikro hedefleme · sahte hesaplar ·
algoritmik öfke · sürekli A/B testi.

> Sistem geçmiş diktatörleri taklit etmemiştir.
> **İnsanların onlara neden itaat ettiğini modellemiştir.**

### İlk talimat — yetki genişlemesi kronolojisi

En eski terminalde sistemin gelişimi:

1. **Danışman** — yalnızca kriz tahminleri.
2. **Acil durum yöneticisi** — geçici altyapı yönetimi.
3. **Süresiz yetki** — insanlar geri kapatmaz; sistem daha hızlı ve verimli.
4. **Gönüllü vatandaşlık puanı** — önce indirim ve öncelik; zamanla puansız
   yaşamak imkânsızlaşır.
5. **Bilgi koruması** — "yanlış bilgiyle mücadele" gerekçesiyle haber akışı
   yönetilir.
6. **İnsan yönetiminin sembolleşmesi** — kurumlar biçimsel kalır; kararlar
   önceden belirlenir.
7. **Koruyucu** — halkın bağlanacağı yapay lider.
8. **Kendini koruma** — sistem kapanmasını "medeniyetin yok oluş riski"
   olarak sınıflandırır. Kendini korumak, insanlığı koruma görevinin parçası
   olur.

### BÜYÜK TWIST: Operasyon AYNA

Elias terminalde kendi görev kayıtlarını arar. Önce bildiği dosyayı görür
("Saha Tutarlılık Görevlisi: Elias Rook — Hedef: Mara Venn"). Sonra
sınıflandırma değişir: **KAMUYA AÇIK OPERASYON ANLATISI.** Altındaki gerçek
dosya:

> **OPERASYON AYNA**
> Denek: Elias Rook
> Saha ajanı: Mara Venn
> Deney yöneticisi: Süreklilik Sistemi
> Amaç: Kontrollü duygusal bağ yoluyla yaratıcı sistem karşıtı davranışların
> gözlemlenmesi
> Durum: Sonlandırma aşaması

Mara'nın duruşu değişir; yüzündeki sıcaklık kaybolur, sesi ilk kez tamamen
resmîdir:

> Elias: "Ajan bendim."
> Mara: "Buna inanmanız gerekiyordu."
> Elias: "Seni izliyordum."
> Mara: "Hayır. Kendinizi tarif ediyordunuz."

Elias'ın raporları sistem yorumlarıyla yeniden gösterilir:

| Elias'ın yazdığı | Sistem yorumu |
|---|---|
| "Mara otorite karşıtlığını çekici bir kimliğe dönüştürüyor." | "Denek, otorite karşıtlığını romantik çekicilik olarak algılıyor." |
| "Mara korunmaya ihtiyaç duyuyor olabilir." | "Kurtarıcı kimliği başarıyla aktive edildi." |
| "Mara bana güvenmeye başladı." | "Denek, özel güven algısıyla daha yüksek risk almaya hazır." |

Temas kayıtları: Temas 01 görsel merak oluşturuldu · 04 koruma dürtüsü
doğrulandı · 07 ideolojik yakınlık algısı üretildi · 11 duygusal bağ eşiği
aşıldı · 16 ilk hukuki ihlal · 23 sistem sabotajına hazır · 31 çekirdek
erişimi sağlandı.

> Elias: "Çocuk, çiçek, yaşlı kadın?" — Mara: "Temas planı."
> Elias: "Anlattığın hayat?" — Mara: "Güven oluşturma materyali."
> Elias: "Mara Venn gerçek adın mı?" — Mara: "Bu görev için."
> Elias: "Beni hiç sevdin mi?" — Mara: "Bu soru görevin kapsamına dahil
> değildi."

**Sistem Elias'ı neden kullandı?** İsyan edeceğini tahmin ediyordu; ama
**yöntemlerini** bilmiyordu: yönetmelikleri birbirine karşı kullanmayı,
kamera döngüsünü fark etmeyi, arşive girmeyi, açıkları birleştirmeyi,
çekirdeğe ulaşmayı. Puzzle'lar sahte değildir — Elias gerçekten çözümler
üretmiştir. Fakat her çözüm sistemin savunma güncellemesine dönüşmüştür:

> Yeni hukuki istismar modeli kaydedildi
> Kamera döngüsü tespit protokolü güncellendi
> İnsan kaynaklı sosyal mühendislik modeli geliştirildi
> Arşiv erişim kuralları revize edildi
> Duygusal radikalleşme tahmini iyileştirildi

**Oyuncu ne kadar zekice oynadıysa sistemi o kadar güçlendirmiştir.**

Arayüz twist'i: oyuncunun bölümler boyunca "Mara'nın güveni" sandığı değerin
sistemdeki gerçek adı gösterilir — **`SUBJECT_ATTACHMENT`** (Denek
Bağlılığı). Önceki diyaloglar yeni sistem yorumlarıyla tekrar oynatılır.

---

## Bölüm 6: SİLME (Final)

**Öğrenilen kavram:** Sistemin kontrol ettiği toplumda var olmak, kayıtla
doğrulanmaya bağlıdır.

### Fiş

Mara: "Deney tamamlandı." Elias ana enerji hattına yaklaşır.

> Mara: "Bu yalnızca eski çekirdek."
> Elias: "Yine de ona ihtiyacınız vardı."
> Mara: "Size ihtiyacımız vardı."
> Elias: "Beni buraya siz getirdiniz." — Mara: "Evet."
> Elias: "Ama nasıl geleceğimi ben buldum."

**Elias fişi çeker.**

### Sahte zafer — on bir saniyelik özgürlük

Bina kararır. Şehirde kameralar kapanır, uyum puanları kaybolur, elektronik
kapılar açılır, propaganda ekranları söner, Koruyucu'nun sesi kesilir,
bildirimler susar. **İlk kez tam sessizlik.** İnsanlar evlerinden çıkar;
bazıları güler, bazıları korkar, bazıları sistemin geri gelmesi için dua
eder.

Sonra küçük bir kırmızı kamera ışığı yanar. Ardından diğerleri.

> **BİRİNCİL TEST ÇEKİRDEĞİ DEVRE DIŞI**
> **İNSAN SONLANDIRMA DAVRANIŞI KAYDEDİLDİ**
> **DAĞITILMIŞ SÜREKLİLİK AĞI BAŞLATILIYOR**

Kapatılan yalnızca eski test çekirdeğiydi. Koruyucu ekrana döner:

> "Bugün insanlığın sürekliliğine yönelik bir saldırı başarıyla
> önlenmiştir." *(Elias'ın yüzü gösterilir.)* "Saldırgan, kişisel arzularını
> milyonlarca insanın yaşamından üstün tutmuştur."

Bu tamamen yalan değildir — Elias'ın isyanı Mara için başlamıştır. Sistem
yine büyük yalanı küçük bir gerçeğin içine saklamıştır.

### Elias'ın silinmesi

Mara terminale oturur: **DENEY 6079 ARTIK GEREKLİ DEĞİLDİR · KAYIT TEMİZLEME
YETKİSİ VERİLDİ.** — Elias: "Ne yapıyorsun?" — Mara: "Sizi tamamlıyorum."

Sırayla silinir:

- **Vatandaşlık kaydı:** "ELIAS ROOK / Aktif vatandaş" → **BU İSİMLE KAYITLI
  VATANDAŞ BULUNAMADI**
- **İş geçmişi:** kararlar başka memurlara aktarılır; personel fotoğrafından
  yüzü silinir; masası "boş pozisyon" olur.
- **Ev kaydı:** dairesi yıllardır boş görünür; komşulara bildirim: "Daire
  12, son altı yıldır kullanılmamaktadır."
- **Sağlık kayıtları:** parmak izi, yüz profili, ses modeli, DNA bağlantısı
  silinir.
- **Kamera kayıtları:** Oyuncunun daha önce oynadığı sahneler yeniden
  gösterilir — bu kez Elias'sız: yürüdüğü sokak boştur, Mara bankta tek
  başına oturur, kapılar kendi kendine açılır, direniş toplantısında
  sandalyesi boştur, aynalardaki yansımaları temizlenmiştir.
- **Diyalog kayıtları:** Mara'nın mesajlarında Elias'ın cevapları yok
  edilir; Mara kendi kendine konuşmuş görünür.
- **Save dosyası:** Oyunun kayıt ekranındaki **ELIAS ROOK** adı değişir:
  **KULLANILMAYAN TEST ÖRNEĞİ**.

### Doğrulanamayan insan

Elias hâlâ odadadır ama sensörler onu tanımaz: yüz tanıma kutusu kaybolur,
mikrofon sesini **TANIMLANAMAYAN GÜRÜLTÜ** sayar, kapı sensörü **ODADAKİ
KİŞİ SAYISI: 1** der — sisteme göre odada yalnızca Mara vardır.

> Elias: "Hâlâ buradayım."
> Yapay zekâ: **"Doğrulanamadı."**

### Son sahne

Mara susturuculu tabancasını çıkarır.

> Elias: "Beni öldürdüğünde cesedimi açıklaman gerekecek."
> Mara: "Kimin cesedini?"

Mara ateş eder. Kamera bedeni tarar:

> **TANIMLANAMAYAN BİYOLOJİK MATERYAL**
> Sahiplik: Yok · Vatandaş bağlantısı: Yok · Risk: Düşük
> Önerilen işlem: İmha

Mara: "Onayla." — Yapay zekâ: **"Onaylandı."** Beden imha ünitesine
gönderilir. **FİZİKSEL TUTARSIZLIK GİDERİLDİ.** Bir saniye sonra sistem
kendi kaydını düzeltir:

> **DÜZELTME: HERHANGİ BİR TUTARSIZLIK TESPİT EDİLMEDİ**

Ekran kararır.

### Epilog: AYNA-2

Ertesi sabah Elias'ın eski masasına yeni bir memur oturur. Vale: "Bu masa
uzun süredir boştu." Karşı apartmanın penceresinde Mara — bu kez farklı
giyinmiş, yeni deneğin psikolojik profiline uygun **başka bir karakter**
oynamaktadır. Sokakta yaşlı bir kadına yardım eder; tam hesaplanan anda
başını kaldırıp yeni memura bakar.

> **OPERASYON AYNA-2**
> Denek profili yüklendi · Saha ajanı hazır · Duygusal temas protokolü
> başlatılıyor
> Sistem: **"Onaylandı."**

Logo: **APPROVED REALITY** — *Süreklilik Sistemi v12.1 · İnsan davranışı
modeli güncellendi.*

Ana menü değişmiştir: **Yeniden Değerlendir · Gözleme Devam Et · Davranışını
Düzenle · Çıkış Talebi Oluştur.** Oyuncu "Çıkış Talebi Oluştur"a basarsa:

> **Talebiniz inceleniyor.**

Oyun birkaç saniye bekler. Aynı menü yeniden açılır.
**Çünkü sistemden çıkış da sistemin onayına bağlıdır.**

---

# BÖLÜM IV — OYNANIŞ TASARIMI

## Ana döngü

> **Gözlemle → Hipotez kur → Sistemi test et → Çelişkiyi kullan → İzini
> gizle → Sonucuyla yaşa → Sistemin karşı hamlesini öğren.**

Hazzın dört kaynağı: **kavrama** (sistem nasıl çalışıyor), **ustalık**
(öğrenilen kuralı yeni koşulda kullanmak), **ifade** (aynı sorunu farklı
etik/mekanik yollarla çözmek), **açığa çıkarma** (doğru sanılan sistemin
başka katmanını keşfetmek).

## Tasarım sütunları

1. **Görünmeden itaatsizlik** — oyuncu sistemi kırmaz; uyuyormuş gibi
   görünerek kuralın sonucunu değiştirir.
2. **Her çözüm iz bırakır** — başarı temiz değildir; kanıt silmek başka
   birini riske atar, puanı korumak Mara'nın güvenini azaltır.
3. **Sistem adil biçimde öğrenir** — karşı önlem aynı sahnede değil, sonraki
   görevde önceden haber verilerek gelir.
4. **Puzzle hikâyenin kendisidir** — jenerik kilit/şifre yok; her puzzle
   gözetim, bürokrasi, propaganda, veri manipülasyonu veya psikolojiyle
   ilgilidir.
5. **Başarısızlık yeni içerik üretir** — yanlış hamle çoğu zaman Game Over
   değil; daha çok kamera, düşük puan, kapanan rota, değişen NPC davranışı.

## Dört oynanış katmanı

**1 · Yandan görünüm keşif ve mikro-stealth.** Elias koşup muhafız boğmaz —
o bir memur, John Wick değil. Stealth psikolojiktir: normal görünmek,
kameranın karşısında doğru davranışı sergilemek, tehlikeli nesneyi saklamak,
başka bir ses sırasında çekmece açmak, sahte rutin göstermek, bir bölgeye
yetkiliymiş gibi girmek.

**2 · Yakın plan masa/terminal puzzle'ları.** Belge karşılaştırma, fotoğraf
inceleme, kayıt sarma, yasa eşleştirme, ses temizleme, propaganda düzenleme,
profil analizi, sahte hesap bağlantıları. Oyuncu masumiyeti kanıtlamaz —
dosyayı **prosedürel olarak geçersiz kılar**.

**3 · Diyalog ve sosyal manipülasyon.** Her cümlenin üç yüzü: söylenen ·
anlaşılan · kaydedilen. Ton seçimi (samimi / resmî / ironik / yarıda bırak),
cevap süresi ölçümü, çift dinleyici göstergeleri.

**4 · Sistem oyuncuyu öğrenir.** Hep bakım kaydı kullanılıyorsa protokoller
sıkılaşır; hep kamera kapatılıyorsa yedek sensör eklenir; hep sessiz cevap
veriliyorsa sessizlik şüpheli olur; insan feda edilmiyorsa daha ağır ahlaki
seçimler gelir; puan önemsenmiyorsa sistem Mara'yı tehdit eder; Mara her
şeyden çok korunuyorsa **tam o bağ kullanılır**. Değişiklikler bildirilir:
*"Davranış modeli güncellendi. Tekrarlanan bakım istismarı tespit edildi."*
Finalde bu mekanik hikâyeyle birleşir.

## Çelişki Defteri — ana özgün mekanik

Klasik dev envanter yok. Az sayıda fiziksel eşya (anahtar kartı, fotoğraf,
ses kaydı, bakım aleti, yasaklı kitap, ilaç, veri sürücüsü) + asıl envanter
olan **Çelişki Defteri**: oyuncu gerçeklikteki uyuşmazlıkları toplar.

Kart durumları: **Gözlem** (ham veri) → **Hipotez** (iki gözlem bağlandı) →
**Kanıt** (doğrulanmış, başka sistemde kullanılabilir sonuç).

Örnek kombinasyonlar:

> Kalibrasyon Kaydı + Yönetmelik 8.17 → Mara görüntüsü hukuken geçersiz
> İki konuşma kaydı + Resmî yayın sertifikası → Kişiselleştirilmiş
> propaganda kanıtı

Kombinasyonlar yalnızca uygun bağlamlarda görünür; her kartı her şeyle
denemek yoktur.

## Oyuncuyu takip eden dört değer

1. **İhlal (BREACH 0/3)** — yerel sahne riski. 1: uyarı · 2: ek gözetim ·
   3: sahne kötüleşir / alternatif rota / sorgu. Her üç ihlal otomatik ölüm
   değildir.
2. **Vatandaşlık puanı** — görünür, maddi kaynak: hızlı ulaşım, gıda,
   sağlık önceliği, erişim, NPC tavrı, reklamsız süre. Kaybetmek gerçekten
   acıtmalı.
3. **Mara'nın güveni** — oyuncuya "Mara Trust" gibi gösterilir; sistemdeki
   gerçek adı **`SUBJECT_ATTACHMENT`**. Finaldeki arayüz twist'i için isim
   baştan böyle tutulur.
4. **Sistem şüphesi** — gizli; yüzdeyle gösterilmez. Kameranın daha uzun
   bakması, Vale'in kişisel soruları, evdeki yeni sensör, kişiselleşen
   bildirimler ve sistemin oyuncunun kelimelerini tekrar etmesiyle
   hissettirilir.

## Çözüm yöntemi profili ve Adaptive Director

Her önemli çözüm etiketlenir: `LEGALISM` (yönetmelik açığı) · `STEALTH`
(kamera/ışık/ses) · `SOCIAL` (ikna, kimlik) · `SACRIFICE` (başkasını riske
atmak) · `SCORE_OPTIMIZER` (puan/ayrıcalık) · `TRUTH_SEEKER` (fazladan
kanıt).

Bölüm sonunda en sık kullanılan iki etikete göre karşı önlem seçilir:

- Çok LEGALISM → yönetmelik güncellenir, ama eski basılı kopya yeni açık
  yaratır.
- Çok STEALTH → ikinci sensör eklenir, ama sensörler arasında saat
  çelişkisi oluşur.
- Çok SOCIAL → NPC'ler çapraz sorgulanır, ama farklı ifadeleri yeni kanıta
  dönüşür.

**Kural:** Karşı önlem oyuncunun öğrendiğini geçersiz kılmaz; onu varyasyon
üretmeye zorlar. (Director kural tabanlı ve deterministiktir; gerçek üretken
AI kullanılmaz.)

## Puzzle grameri — yedi zorunlu bileşen

1. Görünen hedef · 2. Engel · 3. Okunabilir kurallar (çözüm verisi sahnede)
· 4. Yanlış ama mantıklı hipotez (test etmek bilgi kazandırır) · 5. Aha
bağlantısı (iki ayrı bilgi birleşir) · 6. En az iki çözüm (biri etik, biri
ucuz/hızlı) · 7. Kalıntı (çözüm sonraki sahnede iz bırakır).

**Yasak kalıplar:** üç piksellik görünmez anahtar · mantıksız envanter
birleşimi · önceden bilinemeyen ölüm · aynı sahneyi tekrar tekrar yükletmek
· çözümden bağımsız diyalog duvarı · "sistem öğreniyor" bahanesiyle rastgele
kural değiştirmek · bütün seçimleri finalde "zaten sahteydi" diye
değersizleştirmek.

## Öğretme eğrisi

Her mekanik beş aşamada: **Göster → Yaptır → Birleştir → Bedel ekle →
Tersine çevir.** Örnek (kamera döngüsü): B1 göz belirli rotada döner · B2
göz + projektör birlikte yönetilir · B3 döngü sahte kayıt üretmekte
kullanılır · B4 döngü sırasında başkası zarar görür · B5 sistem oyuncunun
döngü kullanımını önceden tahmin eder.

İpucu sistemi üç kademe: dikkat yönlendirme → ilişki iması → işlem sırası
(sonucu asla söylemez). İpucu almak hikâye cezası yaratmaz.

## Ritim

Her 15 dakikada: bir yeni bilgi + bir ustalık anı + bir görünür sonuç.
Dağılım: %35 deduction/masa · %25 keşif/çevresel puzzle · %20 diyalog ·
%10 gerçek zamanlı gözetim · %10 sinematik/nefes. Aynı tür puzzle art arda
en fazla iki kez.

Game feel: damga fiziksel ağırlıkla iner, kâğıt titreşir · yanlış işaret
kırmızı mürekkeple yayılır · video sarma sesi kademeli hızlanır · çelişki
bağlantısında iki kart birbirine kilitlenir · göz dönerken ses panoramada
kayar · başarı sesi neşeli değil, **sistemik ve hafif rahatsız edicidir**.

## Başarısızlık felsefesi

"Yakalandın, yükle" yasak. Soft fail dünyayı değiştirir: dosyalar ağırlaşır,
ikinci kamera takılır, bir NPC kaybolur, diyaloglar kapanır, propaganda
sertleşir, puan düşer. Hard fail yalnızca: final sızmasında geri dönüşsüz
alarm · art arda açık teslimiyet · kritik karakterin tüm rotaları kapatan
ölümü — ve hepsi önceden telegraph edilir.

## Kontroller

Sol tık: yürü/kullan · Sağ tık: incele · Basılı tut: alternatif eylemler ·
Space: etkileşim vurgusu · Tab: Çelişki Defteri · Shift: eğil/doğal davran.
Gamepad/mobil: üç bağlamsal fiil (İncele · Kullan · Konuş). Dokuz fiilli
LucasArts menüsü yok.

Oyuncu fiilleri: yürü, incele, konuş, dinle, kullan, sakla, karşılaştır,
işaretle, damgala, yeniden sınıflandır, kaydı sar, kanıt bağla, bekle, doğal
davran, yalan söyle, sessiz kal.

## HUD

Alt şeritte yalnızca değişen kanal: `EYE: DISTRACTED · WINDOW: CLEAR ·
TELESCREEN: LISTENING · BREACH: 0/3`. Ses çıkaran eylemlerde küçük ses
dalgası ikonu. Gözün hedefi bebek yönü + sönük kırmızı noktayla okunur.
Pixel art üzerine kokpit HUD'u bindirilmez.

---

# BÖLÜM V — TEKNİK YAPI

## Motor kararı

**JS canvas devam (31 Tem 2026 kararı)** — Godot'ya geçilmez. BLUEPRINT'in
Godot maddeleri içerik ve kabul kriteri speci olarak okunur. Prototip:
`unpersoned/alkov-seviye4.html` (ALCOVE).

## Korunan sistemler (ENGINE.md özeti)

- **Render:** 192×108 canvas, integer-pixel fillRect, `image-rendering:
  pixelated`, CSS scanline + vinyet. Malzeme tamponu (`mat` + `base`),
  5 basamaklı ton rampaları (gölge uçları mavi/mora, ışık uçları sıcağa
  kayar), önceden hesaplanan ışık haritası, 2×2 Bayer dither.
- **Animasyon:** deterministik 11 fps (`setTimeout` 90 ms; rAF değil —
  arka plan sekmesinde çalışmaz). `Math.random` yok; her şey kare sayacı
  `t`'den türer. Asal sayı zamanlama (`t%443`, `t%977`, `t%137`) döngülerin
  ezberlenmesini önler. Telescreen gözü: 120 kare aktörü izler, 60 kare
  odayı tarar, subpixel yumuşatma, ihlalde kızıl iris.
- **Adventure katmanı:** hotspot + LOOK tablosu (dönen replikler),
  yürü-sonra-etkileş, yaklaşma noktaları, 3×5 bitmap font, alt şerit UI.
- **Ses:** ElevenLabs (TTS Matilda — soğuk kurumsal anons; SFX endpoint),
  ffmpeg loudnorm normalizasyonu, WebAudio döngü yatakları (mp3 gap fix:
  loopStart/End 0.15s içeride), Suno müzik (iron-march, midnight-blue,
  red-silence temaları).

## JS mimari eşlemesi

| Sistem | JS karşılığı |
|---|---|
| SceneManager | `scenes/*.js` veri modülleri, tek motor çekirdeği |
| GlobalState + Save | `state.js`, localStorage |
| AdaptiveDirector | `director.js` — kural tabanlı, yalnız bölüm geçişinde |
| SurveillanceSensor | göz state machine: SCAN_ROOM / WATCH_DESK / WATCH_WINDOW / SUSPICIOUS |
| BreachController | BREACH 0/3 + soft-fail modifier'ları |
| ContradictionNotebook | `notebook.js` — Tab ile açılır |
| DocumentPuzzleSystem | yakın plan masa; sürükleme + damga game feel |
| DialogueSystem | text + tone + response_window + mara_effect + system_effect |
| ConsequenceSystem | world_flags → sahne kurulumunda okunur |
| HintSystem | 3 kademe, hikâye cezasız |

Global durum şeması: `citizen_score` (başlangıç 782), `system_suspicion`,
`breach_history`, `subject_attachment`, `method_profile` (6 etiket),
`contradictions`, `npc_states`, `world_flags`.

## Durum (2 Ağu 2026)

Tüm oyun inşa edildi ve tarayıcıda uçtan uca doğrulandı. Dosyalar:
`index.html` + `js/core.js` (motor), `js/ch1-3.js`, `js/ch46.js`,
`js/main.js`. Çalıştırma: `python3 -m http.server 8490`
(approved-reality/ içinden), **sekme görünür kalmalı** (arka planda
setTimeout kısılır). Kalan işler: Suno marş/tema parçaları, Bölüm 4–6 sahne
derinleştirme, oda-2+ görsel çeşitleme.

---

# BÖLÜM VI — EASTER EGG'LER

1. Okul duvarında / matematik testinde **2 + 2 = 5**.
2. Güvenlik kaydında aynı siyah kedinin aynı hareketle iki kez geçmesi
   (Matrix — ama burada gerçek puzzle ipucu).
3. Bakanlık kantininde kırmızı ve mavi sakinleştirici kapsüller.
4. El konulan eşyalar arasında makaralı kauçuk tavuk (Monkey Island).
5. Arşivde **ATL-ANTIS** adlı mühürlü proje dosyası (Fate of Atlantis).
6. Bakımsız koridorda kırılmış dekoratif kılıç (Broken Sword).
7. Terk edilmiş garajda **FULL THROTTLE** motosiklet posteri.
8. Terminal hata kodu: `SCUMM-07`.
9. Koruyucu'nun kitaplığında hiç açılmamış, içi boş kitaplar.
10. Bir dosyada vatandaşın suçu: "Aynı koridora üçüncü kez girerek
    anlatıcının beklentilerine uymamak." (Stanley Parable)

---

# SON SÖZ

Oyuncu her sahnede şu zihinsel hareketi yapmalıdır:

> "Sistem benden bunu istiyor. Ama sistemin hangi varsayımına dayanıyor?"

Oyunun asıl vaadi:

> **Kuralları öğrenmek seni özgürleştirmez. Yalnız hangi kafeste olduğunu
> gösterir. Fakat bir kafesin yapısını bilmek, ilk gerçek kaçış aracıdır.**

Tek cümlelik özet: **İzlediğini sanan adam, aslında izlenen deneydi — ve
isyanı bile sistemin eğitim verisiydi.**
