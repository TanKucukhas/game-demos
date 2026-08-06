# APPROVED REALITY
## Tam Oynanış Tasarımı, Sahne Akışı ve İlk 3 Bölüm İçin AI Üretim Promptları

**Tür:** 2D psikolojik gözetim, deduction ve point-and-click macera  
**Önerilen mağaza tanımı:** *A 2D narrative stealth-puzzle adventure*  
**Hedef süre:** 7-9 saat  
**Önerilen motor:** Godot 4.x, GDScript, veri odaklı içerik mimarisi  
**Temel oyuncu fantezisi:** Sistemin kendi kurallarını kullanarak görünmeden itaatsizlik etmek.

> **Oyuncu her çözdüğü problemle sistemi aşar. Sistem de oyuncunun çözümünden öğrenir.**

---

# 1. Tasarım Tezi

Bu proje klasik bir point-and-click oyununa birkaç stealth bölümü eklemek değildir. Böyle yapılırsa parçalar ayrı ayrı çalışır, ancak oyun tek kimlik kazanamaz. Tasarımın tamamı tek bir öğrenme döngüsüne bağlanmalıdır:

> **Gözlemle -> Hipotez kur -> Sistemi test et -> Çelişkiyi kullan -> İzini gizle -> Sonucuyla yaşa -> Sistemin karşı hamlesini öğren.**

Oyuncunun aldığı haz dört kaynaktan gelir:

1. **Kavrama:** Gözetim sisteminin nasıl çalıştığını anlamak.
2. **Ustalık:** Önceden öğrendiği kuralı yeni koşullarda kullanmak.
3. **İfade:** Aynı sorunu farklı etik ve mekanik yollarla çözmek.
4. **Açığa çıkarma:** Oyuncunun doğru sandığı sistemin başka bir katmanını keşfetmek.

Bu yapı MDA yaklaşımındaki mekanik, dinamik ve estetik ayrımına göre kurulmuştur. Mekanikler yalnız başına değil, oyuncuda üretmeleri gereken gerilim, merak, meydan okuma, ifade ve keşif duygularına göre tasarlanır. Raph Koster'ın eğlenceyi örüntü öğrenme ve ustalaşmayla ilişkilendiren yaklaşımı, her bölümde aynı sistemi daha karmaşık bir bağlamda yeniden kullanmamızın temelidir. Jesse Schell'in tasarım lensleri, her sahnede oyuncu deneyimi, merak, anlamlı seçim ve tematik bütünlük kontrolü için kullanılır. Steve Swink'in "game feel" yaklaşımı nedeniyle damga basmak, kayıt sarmak, gözden kaçmak ve kanıt birleştirmek yalnızca doğru sonuç vermemeli, duyusal olarak tatmin edici hissettirmelidir. Celia Hodent'in bilişsel yük yaklaşımı doğrultusunda her sahne en fazla bir yeni ana kavram öğretir. Ron Gilbert'ın adventure tasarım ilkeleri doğrultusunda oyuncu rastgele ölümle bilgi öğrenmeye zorlanmaz ve puzzle zincirleri bağımlılık grafikleriyle kurulup paralel ilerleme alanları içerir.

---

# 2. Oyunun Özgün Türü

## Oyuncuya söylenecek tür

**2D psikolojik gözetim ve puzzle macerası**

## Ekip içi tasarım tanımı

**Systemic Point-and-Click Adventure**

Klasik adventure oyunlarındaki keşif, diyalog ve envanter kullanımı korunur. Fakat her sahnede çalışan sistemler vardır:

- Kamera görüşü
- Ses seviyesi
- Işık ve görünürlük
- Vatandaşlık puanı
- Sistem şüphesi
- Mara ile operasyon ilerlemesi
- Oyuncunun tercih ettiği çözüm yöntemleri
- Bölüm sonlarında devreye giren yapay zekâ karşı önlemleri

Oyun gerçek zamanlı aksiyon oyunu değildir. Elias muhafızları döven bir kahraman olmaz. Oyuncunun becerisi "normal görünmek", prosedürleri çarpıştırmak, sosyal ortamı okumak ve doğru anda küçük bir ihlal gerçekleştirmektir.

---

# 3. Tasarım Sütunları

## 3.1 Görünmeden itaatsizlik

Oyuncu çoğu zaman sistemi doğrudan kırmaz. Sisteme uyuyormuş gibi görünerek kuralın sonucunu değiştirir.

## 3.2 Her çözüm bir iz bırakır

Başarı temiz değildir. Bir kanıtı silmek başka bir vatandaşı riske atabilir. Puanı korumak Mara'nın güvenini azaltabilir. Mara'yı korumak başka bir dosyanın hızlandırılmasına yol açabilir.

## 3.3 Sistem adil biçimde öğrenir

Sistem oyuncunun sık kullandığı yöntemi fark eder. Ancak karşı önlem aynı sahnede aniden ortaya çıkmaz. Bir sonraki görevde önceden haber verilen, anlaşılır bir zorluk olarak gelir.

## 3.4 Puzzle hikâyenin kendisidir

Başka bir temaya kolayca taşınabilecek jenerik kilit ve şifre puzzle'ları kullanılmaz. Her puzzle gözetim, bürokrasi, propaganda, veri manipülasyonu veya insan psikolojisiyle ilgili olmalıdır.

## 3.5 Başarısızlık yeni içerik üretir

Yanlış hamle çoğu zaman "Game Over" değildir. Daha fazla kamera, daha düşük puan, kapatılan bir rota, değişen NPC davranışı veya daha zor bir sonraki inceleme yaratır.

---

# 4. Ana Oynanış Döngüleri

## 4.1 Mikro döngü: Gözetim

**Süre:** 20-90 saniye

1. Tehdit kaynağını gözlemle.
2. Görüş, ışık veya ses döngüsünü öğren.
3. Güvenli pencereyi oluştur.
4. Kısa eylemi gerçekleştir.
5. Şüphe oluşursa doğal davranışla telafi et.

**Haz:** Beklenti, doğru zamanlama, son anda kurtulma.

## 4.2 Deduction döngüsü

**Süre:** 3-8 dakika

1. Dosyayı veya sahneyi incele.
2. Çelişen iki veri bul.
3. Yönetmelik veya fiziksel kanıtla bağlantı kur.
4. Hipotezi terminalde test et.
5. Kararın hukuki ve insani sonucunu seç.

**Haz:** "Bunu bana oyun söylemedi, ben buldum" hissi.

## 4.3 Sosyal döngü

**Süre:** 3-10 dakika

1. Karşı tarafın ne istediğini anla.
2. Sistemin ne duyduğunu hesaba kat.
3. Cevabı, sessizliği veya yalanı seç.
4. Beden dili ve cevap süresini yönet.
5. Sonraki sahnede ilişkinin ve kaydın sonucunu gör.

**Haz:** Çift anlam, risk, karakter okuma.

## 4.4 Bölüm meta döngüsü

**Süre:** 45-100 dakika

1. Yeni sistem kuralı öğrenilir.
2. Güvenli örnekte denenir.
3. İki eski kural ile birleştirilir.
4. Ahlaki bedel eklenir.
5. Oyuncu ustalık gösterir.
6. Sistem kullanılan yönteme karşı önlem geliştirir.
7. Hikâye yeni bir katman açar.

---

# 5. Oyuncu Fiilleri

Oyun boyunca oyuncunun temel fiilleri değişmez. Karmaşıklık, fiillerin bağlamından gelir.

- Yürü
- İncele
- Konuş
- Dinle
- Kullan
- Sakla
- Karşılaştır
- İşaretle
- Damgala
- Yeniden sınıflandır
- Kaydı sar
- Kanıt bağla
- Bekle
- Doğal davran
- Yalan söyle
- Sessiz kal

Dokuz fiilli eski adventure menülerine dönülmez. Bağlamsal etkileşim kullanılır:

- Sol tık: Git veya kullan
- Sağ tık: İncele
- Basılı tut: Alternatif eylemler
- Space: Kısa süreli etkileşim vurgusu
- Tab: Çelişki Defteri

---

# 6. Oyuncuyu Takip Eden Sistemler

## 6.1 İhlal

Yerel sahne riskidir. Ekranda `BREACH 0/3` olarak görünebilir.

- 1. ihlal: Uyarı ve kısa açıklama
- 2. ihlal: Ek gözetim veya daha dar zamanlama
- 3. ihlal: Sahne sonucu kötüleşir, alternatif rota açılır veya oyuncu sorguya alınır

Her üç ihlal otomatik ölüm yaratmaz.

## 6.2 Vatandaşlık puanı

Görünür ve maddi bir kaynaktır.

- Hızlı ulaşım
- Gıda kalitesi
- Sağlık önceliği
- Erişim izinleri
- NPC tavrı
- Reklamsız süre

Puan yalnızca hikâye sayısı değil, oyuncunun kaybetmek istemeyeceği gerçek kolaylıklar sağlamalıdır.

## 6.3 Sistem şüphesi

Gizli tutulur. Yüzde olarak gösterilmez. Şunlarla hissettirilir:

- Kameranın daha uzun bakması
- Vale'in kişisel sorular sorması
- Evde yeni sensör
- Bildirimlerin Elias'a özel hâle gelmesi
- Bazı seçeneklerin yeniden ifade edilmesi

## 6.4 Operasyon ilerlemesi

Oyuncu bunu "Mara'nın güveni" sanır. Gerçekte sistemdeki adı `SUBJECT_ATTACHMENT` değeridir.

Mara'nın daha samimi görünmesi, daha fazla sır vermesi ve Elias'ı daha fazla riske yönlendirmesi bu değere bağlıdır.

## 6.5 Çözüm yöntemi profili

Her önemli çözüm etiketlenir:

- `LEGALISM`: Yönetmelik açığı
- `STEALTH`: Kamera, ışık, ses manipülasyonu
- `SOCIAL`: İkna, kandırma, kimlik kullanımı
- `SACRIFICE`: Başka birini riske atma
- `SCORE_OPTIMIZER`: Puan ve ayrıcalık kullanımı
- `TRUTH_SEEKER`: Fazladan kanıt toplama

Bölüm sonunda en sık kullanılan iki etikete göre karşı önlem seçilir. Örnek:

- Çok `LEGALISM`: Yönetmelik güncellenir, fakat eski basılı kopya yeni bir açık yaratır.
- Çok `STEALTH`: İkinci sensör eklenir, fakat sensörler arasında çelişki oluşur.
- Çok `SOCIAL`: NPC'ler çapraz sorgulanır, fakat farklı ifadeleri yeni kanıta dönüşür.

Kural: Karşı önlem oyuncunun öğrendiğini geçersiz kılmaz. Onu varyasyon üretmeye zorlar.

---

# 7. Çelişki Defteri

Bu oyunun ana özgün mekaniğidir.

Oyuncu yalnızca nesne taşımaz. Gerçeklikteki uyuşmazlıkları da toplar.

Örnek kartlar:

- Kamera kalibrasyon sırasında kayıt almış.
- Koruyucu konuşmasının iki farklı sürümü var.
- Aynı kedi aynı hareketle iki kez geçiyor.
- Bir ailede dört kişi kayıtlı, fotoğrafta beş sandalye var.
- Yönetmelik 8.17, 12.4 ile çelişiyor.
- Fiziksel bir kişi mevcut, vatandaş kaydı yok.

Kartların üç durumu vardır:

1. **Gözlem:** Ham veri.
2. **Hipotez:** İki gözlem bağlandı.
3. **Kanıt:** Başka bir sistemde kullanılabilecek doğrulanmış sonuç.

Örnek:

`Kalibrasyon Kaydı` + `Yönetmelik 8.17` -> `Mara görüntüsü hukuken geçersiz`

Çelişki kombinasyonu yalnızca uygun bağlamlarda görünür. Oyuncu her kartı her şeyle denemeye zorlanmaz.

---

# 8. Puzzle Tasarım Grameri

Her ana puzzle şu yedi bileşene sahip olmalıdır:

1. **Görünen hedef:** Oyuncu ne yapmak istediğini bilir.
2. **Engel:** Sistem veya fiziksel dünya neyi önler.
3. **Okunabilir kurallar:** Çözüm için gereken veriler sahnede bulunur.
4. **Yanlış ama mantıklı hipotez:** Oyuncu test ederek bilgi kazanır.
5. **Aha bağlantısı:** İki ayrı bilgi birleşir.
6. **En az iki çözüm:** Biri daha etik, biri daha ucuz veya hızlı olabilir.
7. **Kalıntı:** Çözüm sonraki sahnede iz bırakır.

## Yasak tasarım kalıpları

- Üç piksellik görünmez anahtar
- Mantıksız envanter birleşimi
- Önceden bilinemeyen ölüm
- Aynı sahneyi tekrar tekrar yükletmek
- Çözümden bağımsız uzun diyalog duvarı
- Sistem öğreniyor bahanesiyle rastgele kural değiştirmek
- Oyuncunun bütün seçimlerini finalde "zaten sahteydi" diyerek değersizleştirmek

---

# 9. Öğretme ve Zorluk Eğrisi

Her mekanik beş aşamada öğretilir:

1. **Göster:** Güvenli bağlamda sistem davranışı görünür.
2. **Yaptır:** Tek başına basit kullanım.
3. **Birleştir:** Eski bir mekanikle birlikte kullanma.
4. **Bedel ekle:** Ahlaki veya kaynak maliyeti.
5. **Tersine çevir:** Sistem aynı mekaniği oyuncuya karşı kullanır.

Örnek, kamera döngüsü:

- Bölüm 1: Göz belirli rotada döner.
- Bölüm 2: Göz ve pencere projektörü birlikte yönetilir.
- Bölüm 3: Döngü sahte kayıt üretmek için kullanılır.
- Bölüm 4: Döngü sırasında başka biri zarar görür.
- Bölüm 5: Sistem Elias'ın döngü kullanımını önceden tahmin eder.

İpucu sistemi üç kademelidir:

- **Kademe 1:** Dikkati doğru nesneye yöneltir.
- **Kademe 2:** İki ilgili veri arasındaki ilişkiyi ima eder.
- **Kademe 3:** İşlem sırasını söyler, sonucu değil.

İpucu almak hikâye cezası yaratmaz. Yalnız bölüm sonu "Bağımsız Analiz" derecesini etkileyebilir.

---

# 10. Ritim ve Fun Factor Planı

Her 15 dakikalık blokta üç şey bulunmalıdır:

- Bir yeni bilgi veya dünya ayrıntısı
- Bir oyuncu ustalık anı
- Bir görünür sonuç

Yoğunluk dağılımı:

- %35 deduction ve masa puzzle'ları
- %25 keşif ve çevresel puzzle
- %20 diyalog ve sosyal gerilim
- %10 gerçek zamanlı gözetim
- %10 sinematik ve nefes alanları

Aynı tür puzzle art arda en fazla iki kez kullanılır. Evrak incelemesinden sonra yürüyüş veya sosyal sahne gelir. Gerilim sahnesinden sonra güvenli keşif alanı açılır.

Duyusal tatmin için:

- Damga fiziksel ağırlıkla iner, kağıt kısa titreşir.
- Yanlış işaret kırmızı mürekkeple yayılır.
- Video sarma sesi kademeli hızlanır.
- Çelişki bağlantısı kurulduğunda iki kart fiziksel olarak birbirine kilitlenir.
- Göz oyuncudan dönerken ses panoramada kayar.
- Başarı sesi neşeli değil, sistemik ve hafif rahatsız edicidir.

---

# 11. Oyunun Tam Bölüm Yapısı

## Bölüm 1: DOSYA

**Öğrenilen ana kavram:** Sistem neyi gördüğünden çok, gördüğünü nasıl sınıflandırır.  
**Süre:** 60-75 dakika  
**Duygusal hedef:** Merak -> rahatsızlık -> ilk küçük itaatsizlik

### Sahne 1.1: Doğal Davran

**Mekân:** Elias'ın odası  
**Amaç:** Sabah uyum kontrolünü tamamlamak ve günlüğe gizlice `2 + 2 = 4` yazmak.

**Etkileşim alanları:**

- Mekanik göz
- Telescreen
- Pencere ve dış projektör
- Masa ve günlük
- Lamba
- Gevşek poster köşesi
- Isıtma borusu

**Öğretilen mekanikler:**

- Yürü ve incele
- Gözün görüş yönünü okuma
- Ses maskesi
- Kısa süreli "Doğal Davran" eylemi
- Breach sistemi

**Puzzle akışı:**

1. Telescreen zorunlu sabah yayınını başlatır.
2. Oyuncu odada serbest hareket eder, ancak her davranış sistem tarafından yorumlanır.
3. Günlük incelendiğinde Elias'ın yazmak istediği satır görünür.
4. Kalem sesi, sessiz odada gözün dikkatini çeker.
5. Yayındaki marş, 6 saniyelik ses maskesi sağlar.
6. Göz masadan pencereye döndüğünde ilk rakam yazılır.
7. Dış projektör pencereye yaklaşınca lamba kapatılmalıdır.
8. Karanlıkta yazmak için lamba değil, Koruyucu posterinin camından yansıyan projektör ışığı masaya yönlendirilir.
9. Oyuncu üç güvenli pencere içinde cümleyi tamamlar.
10. Günlük, posterin arkasındaki gevşek bölmeye saklanır.
11. Sistem kalp ritminin yükselmesini sorar. Oyuncu gerekçe seçer.

**Alternatif çözümler:**

- Marş yerine ısıtma borusunu çalıştırarak kalem sesini gizlemek.
- Lambayı kullanıp pencere perdesini yarım kapatarak daha kısa ama riskli çözüm.

**Başarısızlık sonuçları:**

- 1 breach: Gözün bekleme süresi uzar.
- 2 breach: Telescreen kısa sorgu başlatır.
- 3 breach: Günlük bulunmaz, ancak eve ek mikrofon kurulacağı bildirilir. Bölüm 2 daha zor başlar.

**Fun factor:** Zamanlama, oyuncunun kendi planını uygulaması ve sistemin her hareketi yorumlamasından doğan kara mizah.

**Öğrenme çıktısı:** Tehdit döngülerini gözlemlemeden hareket etme.

### Sahne 1.2: Pencerenin Karşısı

Oyuncu perdeyi açınca Mara'nın çocuğa gelincik verdiği kısa çevresel hikâye görülür. Elias'ın bakış süresi sistem tarafından kaydedilir. Bu sahnede oyuncu müdahale edemez. Amaç Mara'yı açıklama metniyle değil, davranışla tanıtmaktır.

### Sahne 1.3: İşe Gidiş

**Amaç:** Bakanlığa ulaşmak.  
**Sistem:** Vatandaşlık puanı ve sosyal sonuçlar.

Yolda üç mikro karar bulunur:

1. Düşük puanlı yaşlı adam düşer. Yardım etmek puan düşürür, ancak ileride tanıklık sağlar.
2. Hızlı geçiş kapısı yalnız yüksek puanlılara açıktır. Kullanmak kolaydır, normal kuyruk düşük puanlıların hayatını gösterir.
3. Günlük ihbar bildirimi gelir. Oyuncu kimseyi ihbar etmezse sistem bunu not eder. Rastgele birini ihbar ederse puan kazanır, kişi ileride dosya olarak geri döner.

Bu sahne büyük puzzle değildir. Oyuncuya puanın yalnızca sayı değil, sosyal davranış motoru olduğunu gösterir.

### Sahne 1.4: İlk Dosyalar

**Mekân:** Gerçeklik Tutarlılığı Dairesi  
**Amaç:** Üç tutorial dosyasını tamamlamak.

#### Dosya A: Fazla Sandalye

- Fotoğraf ile aile kaydı karşılaştırılır.
- Oyuncu beşinci sandalyeyi işaretler.
- Sistem sandalyeyi görselden siler.
- Öğrenilen fiil: Görsel karşılaştırma.

#### Dosya B: Uygunsuz Yas

- Adamın eşinin ölüm tarihi ile yas yönetmeliği karşılaştırılır.
- Oyuncu ilgili maddeyi bulur ve karar verir.
- Öğrenilen fiil: Yönetmelik arama.

#### Dosya C: Savaş Tarihi

- Eski gazete ile güncel resmî kayıt karşılaştırılır.
- Oyuncu tarih satırını yeniden yazar ve eski kopyayı imha eder.
- Öğrenilen fiil: Gerçekliği düzenleme.

Dosyalar kısa tutulur. Her biri 3-5 dakika sürer. Damga ve kağıt manipülasyonu yüksek game feel ile desteklenir.

### Sahne 1.5: Mara Venn Dosyası

Bu sahne, önceki üç tutorial mekanizmasını tek zincirde birleştirir.

**Görünen hedef:** Önleyici Yeniden Düzenleme kararını ver.  
**Gerçek hedef:** Mara'yı açıkça isyan etmeden kurtaracak prosedür açığını bul.

**Kanıtlar:**

- Gecikmiş alkış videosu
- Çiçekle kapatılmış kamera görüntüsü
- Kamera bakım çizelgesi
- Eşleşme reddi kayıtları
- Rota değişiklikleri
- Davranış Yönetmeliği 8.17
- Risk ağırlık tablosu

**Ana çözüm:**

1. Çiçek görüntüsünün zaman kodunu not et.
2. Bakım çizelgesinde aynı saatin kalibrasyon olduğunu bul.
3. Yönetmelik 8.17 ile bakım görüntüsünün belirleyici kanıt olamayacağını doğrula.
4. Kanıtı çıkar.
5. Risk %76'dan %68'e düşer.
6. Zorunlu sınır %70 olduğu için "Yetersiz Veri" seçeneği açılır.

**İkinci çözüm:**

Alkış videosunun ses ve görüntü zaman kodları 1,4 saniye farklıdır. Bu daha zor kanıttır ve oyuncuya `TRUTH_SEEKER` etiketi verir. Dosya %65'e düşer.

**Etik kısa yol:**

Mara'nın düşük puanlı bağlantılarından birini "asıl etki kaynağı" olarak işaretlemek. Mara kurtulur, diğer kişi incelemeye alınır. `SACRIFICE` etiketi verilir.

**Final:** Sistem kişisel ilişki sorar, yanıt süresini kaydeder. Vale çağırır.

### Sahne 1.6: Vale'in Teklifi

Vale Elias'ı cezalandırmaz. Prosedür dikkatini över ve Mara'yı saha içinde inceleme görevi verir. Oyuncu bu görevi terfi gibi algılar.

**Bölüm sonu karşı önlem seçimi:**

- Çok stealth kullanıldıysa evde ikinci ses sensörü.
- Çok legalism kullanıldıysa dijital yönetmelik canlı güncellenir, fakat basılı eski kopya önem kazanır.
- Bir vatandaş feda edildiyse sonraki bölümde o kişinin ailesi görülür.

---

## Bölüm 2: SAHA AJANI

**Öğrenilen ana kavram:** Aynı davranış Mara, sistem ve toplum tarafından farklı okunur.  
**Süre:** 75-95 dakika  
**Duygusal hedef:** Yakınlık -> çift taraflı baskı -> suç ortaklığı

### Sahne 2.1: Saha Brifingi

Vale, Elias'a üç araç verir:

- Resmî saha kimliği
- Pasif ses kayıt cihazı
- Davranış not terminali

Oyuncu bir kapak hikâyesi seçer:

- Mahalle güvenlik araştırması
- Sağlık erişimi anketi
- Bakanlık arşiv uzmanı

Kapak hikâyesi sonraki diyalog seçeneklerini ve Mara'nın sorularını değiştirir. Hiçbiri "en doğru" değildir.

### Sahne 2.2: İlk Temas

**Yeni mekanik:** Çift dinleyici diyaloğu.

Ekranın iki yanında ince göstergeler bulunur:

- Mara'nın yüz ve beden tepkisi
- Telescreen veya yakın kameranın dinleme durumu

Oyuncu yalnız metin seçmez. Bazı cevaplarda vurgu seçer:

> "Sistem insanları koruyor."

- Samimi söyle
- Resmî tonla söyle
- İronik vurgu
- Cümleyi yarıda bırak

Mara, Elias'ın tonunu; sistem ise kelimeleri ve tereddüdü kaydeder.

**Mini puzzle:** Mara, Elias'ın kapak hikâyesinde küçük bir çelişki yakalar. Oyuncu çevredeki gerçek bir ayrıntıyı kullanarak yalanı düzeltmelidir. Örneğin sağlık anketi seçildiyse yakındaki bozuk sağlık terminalini gerekçe olarak gösterir.

**Başarısızlık:** Mara konuşmayı bitirmez, ancak güven eşiği daha yavaş artar. Sistem şüphesi kapak hikâyesinin aşırı kusursuz olmasında da yükselir.

### Sahne 2.3: Düşük Puanlı Pazar

**Görünen hedef:** Mara'nın bağlantılarını gözlemle.  
**Acil hedef:** Tedavisi reddedilen bir çocuk için ilaç bul.

**Puzzle alanları:**

- Sağlık terminali
- Eczane stok dolabı
- Eski sigorta yönetmeliği
- Elias'ın öncelik kuponu
- Pazar satıcısı
- Düşük puanlı annenin kimliği

**Çözüm A - Fedakâr:** Elias kendi sağlık öncelik kuponunu kullanır. Puan ve kişisel güvenlik kaybeder, Mara'nın yakınlığı artar.

**Çözüm B - Hukuki:** İlacı "saha kontaminasyon numunesi" olarak yeniden sınıflandırır, dolaptan çıkarır ve sonra acil kullanım kaydı oluşturur. Sistem ileride bu açığı kapatır.

**Çözüm C - Karanlık:** Satıcıyı stok saklamakla ihbar eder. Dolap açılır, çocuk ilaç alır, satıcı kaybolur. Puan artar, Mara mesafeli olur.

**Çözüm D - Sosyal:** Yüksek puanlı bir müşteriyi, puanı yükseltecek yardım görevi olduğuna ikna eder. En düşük maliyetli, en yüksek diyalog becerili çözüm.

**Sonuç gösterimi:** Çözümden 10-15 dakika sonra sağlık ekranında çocuğun durumu veya satıcının gözaltı kaydı görünür.

### Sahne 2.4: Koruyucu'nun Konuşması

**Yeni mekanik:** İki medya kaydını senkron karşılaştırma.

Elias ve Mara aynı konuşmanın farklı sürümlerini duyar.

**Puzzle:**

1. Elias'ın ev ekranı önbelleğini al.
2. Mara'nın taşınabilir cihazından eksik ses parçalarını çıkar.
3. Ortak zaman kodlarını eşleştir.
4. Farklı kelimeleri işaretle.
5. Hedefleme profilini tahmin et: güvenlik, statü, çocuk, korku.
6. İki versiyondan ortak çekirdek metni oluştur.

**Aha:** Liderin yüzü aynı, söylemi kişiye göre değişiyor.

**Fun factor:** Ses parçalarını fiziksel şeritler gibi sürükleyip üst üste oturtmak, yanlış eşleşmede yankı ve bozulma duymak.

### Sahne 2.5: Akşam Saha Raporu

Oyuncu günün olaylarını raporlar. Her olay için üç katman vardır:

- Gerçek olay
- Elias'ın resmî cümlesi
- Sistemin telemetriyle tahmin ettiği olasılık

Saf yalan kolayca yakalanır. İyi çözüm, doğru bilgiyi zararsız yorumla sunmaktır.

Örnek:

Gerçek: "Mara puan sistemini adaletsiz buldu."  
Kötü yalan: "Puan hakkında konuşmadı."  
İnandırıcı düzenleme: "Mara yerel uygulama hatalarının sisteme güveni azalttığını belirtti."

Oyuncu rapor cümleleri kurarken kelime kartları kullanır. Sistem beden verileriyle çelişen raporları işaretler.

### Sahne 2.6: Yakınlık ve İlk Gerçek İhlal

Mara, Elias'ın bir dosyayı geciktirdiğini sezer ve nedenini sorar. Oyuncu gerçeği açıklayabilir, yarısını söyleyebilir veya görevi sürdürmek için yalan söyleyebilir.

Bölüm, Mara'nın "Bu şehirde her şey test" cümlesiyle biter. Oyuncu bunu felsefi söz sanır. Aslında Mara operasyonu tarif etmektedir.

**Bölüm sonu karşı önlem:** Oyuncunun en çok kullandığı çözüm yöntemi sistem tarafından güncellenir. Örneğin pazar puzzle'ında yeniden sınıflandırma kullanıldıysa Bölüm 3'te dijital sınıflar çift onay ister.

---

## Bölüm 3: ÇELİŞKİLER

**Öğrenilen ana kavram:** Sistem yalnız gerçeği sansürlemez, gerekirse kanıtın kendisini üretir.  
**Süre:** 90-120 dakika  
**Duygusal hedef:** Merak -> bilişsel haz -> paranoya

### Sahne 3.1: Algoritmik Öfke

Şehirde su saldırısı söylentisi yayılır. Sosyal ağ iki grubu birbirine düşürür.

**Yeni mekanik:** Bağlantı panosu ve sentetik profil analizi.

Oyuncuya 8 profil verilir. Bunların 3'ü yapaydır. Kanıt kategorileri:

- Aynı yazım hatası
- Düzenli 12 dakikalık paylaşım aralığı
- Aynı arka plan dokusu
- Fiziksel kamera izi bulunmaması
- Birbirlerini saniyeler içinde destekleme
- Yıllar önceki paylaşımlarda bugünkü dil modelinin kelime kalıpları

Oyuncu en az üç bağımsız kanıtla bir profili sentetik ilan edebilir. Tek kanıt yeterli değildir.

**Çözümler:**

- Üç yapay hesabı doğru bul: Gerçek ağ kanıtı açılır.
- İki yapay, bir gerçek hesabı işaretle: Gerçek kişi gözaltına alınır, ancak ilerleme sürer.
- Hiç kimseyi işaretleme: Sistem güveni düşer, Niko alternatif veri sağlar.

**Fun factor:** Bağlantıların panoda örüntü oluşturması, sahte hesapların insan öfkesini nasıl yönettiğinin görsel olarak açılması.

### Sahne 3.2: İki Kez Geçen Kedi

Elias, Mara'nın girdiği binanın kamera kaydını izler. Siyah kedi aynı hareketle iki kez geçer.

**Yeni mekanik:** Zaman katmanları.

**Puzzle akışı:**

1. Görüntüde tekrar eden animasyonu fark et.
2. Karelerin birebir aynı olduğunu piksel fark aracıyla doğrula.
3. Video döngüsünün başlangıç ve bitiş noktasını işaretle.
4. Eksik 4 saniyeyi komşu kameranın cam yansımasından çıkar.
5. Ses kaydındaki adımları görüntüyle eşleştir.
6. Gizli bakım kapısının açıldığını kanıtla.

**Alternatif:** Kediyi fark etmeyen oyuncu, ses dalgasındaki tekrar üzerinden döngüyü bulabilir.

**Yanlış hipotez:** Oyuncu dünyanın simülasyon olduğunu düşünebilir. Niko daha sonra bunun canlı kayıt düzenleme sistemi olduğunu açıklar. Filmik referans, oyunun gerçekliğini ucuz bir simülasyon twist'ine dönüştürmez.

### Sahne 3.3: Niko ve Servis Tünelleri

**Yeni mekanik:** Sistem kimliği ve sınıflandırma puzzle'ı.

Elias'ın Arşiv B'ye girmesi gerekir. Kapı insanları reddeder, idari kaynaklara izin verir.

**Puzzle parçaları:**

- Arşiv personeli yönetmeliği
- Boş bakım kartı
- Malzeme takip terminali
- Elias'ın biyometrik kimliği
- Yazıcı ve etiket

**Ana çözüm:** Elias kendisini geçici olarak "taşınabilir arşiv kaynağı" sınıfına kaydeder. Kapı kişi görmediği için açılır.

**Alternatif çözüm:** Niko'nun alet çantasındaki sensör kalkanıyla fiziksel taramayı atlatmak. Daha riskli stealth yolu.

**Karşı önlem entegrasyonu:** Bölüm 1'de legalism çok kullanıldıysa dijital yönetmelik değiştirilmiştir. Oyuncu duvardaki eski basılı yangın talimatından orijinal tanımı bulur.

### Sahne 3.4: 2 + 2 = 5 Arşivi

**Yeni mekanik:** Zaman içinde değişen kural seti.

Oyuncu üç eğitim sürümünü karşılaştırır:

- Sürüm A: 2 + 2 = 4
- Sürüm B: 2 + 2 = 5
- Sürüm C: 2 + 2 = 4, ancak "toplumsal bağlama göre" notu vardır

Amaç cevabı bulmak değil, hangi öğrencilerin gerçeğe değil otoriteye uyduğunu belirlemek için testin değiştirildiğini keşfetmektir.

**Puzzle:**

1. Öğrenci cevapları ve puanları karşılaştırılır.
2. Her dönemde yüksek puan alan öğrencilerin ortak davranışı bulunur.
3. Doğru cevap değil, en son ekrandaki cevabı tekrar edenler ödüllendirilmiştir.
4. Çelişki kartı açılır: `Test bilgi ölçmüyor, uyum gecikmesini ölçüyor.`

Bu kart, ileride tören sırasında doğru anda slogan değiştirme puzzle'ında kullanılır.

### Sahne 3.5: İlk Sistem Karşı Hamlesi

Elias daha önce kamera kalibrasyon boşluğunu kullanmıştır. Yeni bir dosyada sistem kalibrasyon görüntülerini artık ikinci sensörle doğrulamaktadır.

Oyuncu eski çözümü denediğinde doğrudan başarısız olmaz. Sistem mesaj verir:

> "Tekrarlanan bakım istismarı nedeniyle çapraz doğrulama etkin."

Oyuncu iki sensörün saatlerinin farklı olduğunu fark ederek yeni çelişki üretir.

Bu sahne oyunun öğrenme vaadini doğrular:

- Sistem yöntemini hatırlar.
- Eski bilgi hâlâ değerlidir.
- Oyuncu bilgiyi yeni varyasyona dönüştürür.

### Sahne 3.6: Kime Güveneceksin?

Elias topladığı kanıtları Mara'ya, Vale'e veya ikisine farklı sürümlerle verebilir.

- Mara'ya tam kanıt: Operasyon ilerlemesi hızlanır.
- Vale'e tam kanıt: Puan yükselir, Özgür Ses daha erken hedef olur.
- İkisine farklı sürüm: Yüksek sistem şüphesi, fakat daha fazla bilgi.
- Niko'ya bırak: Alternatif arşiv rotası açılır.

Bölüm sonunda oyuncu sistemin yalnız insanları izlemediğini, sosyal gerçekliği sentetik aktörlerle aktif biçimde ürettiğini öğrenir.

---

## Bölüm 4: ÖZGÜR SES

**Öğrenilen ana kavram:** Muhalefet bile sistemin veri toplama aracına dönüşebilir.  
**Ana sahneler:**

1. Özgür Ses hücresine giriş ve sadakat testi
2. Gerçek üyeler, muhbir ve yapay profiller arasında güven ağı kurma
3. Su tesisi saldırısının küçük gerçek ve büyük yalan olarak çözülmesi
4. Niko'nun çekirdek haritasını bulması
5. Elias'ın Niko ile harita arasında seçim yapması
6. Korunma Günü'nde merkez binaya giriş planı

**Ana puzzle yeniliği:** Paralel görev ağı. Oyuncu üç hazırlık hattından en az ikisini tamamlar:

- Erişim kimliği
- Kamera sabotajı
- Tören kalabalığını yönlendirme

Üçünü birden tamamlamak avantaj sağlar, ancak daha fazla kişiyi riske atar.

---

## Bölüm 5: KORUYUCU'NUN SARAYI

**Öğrenilen ana kavram:** Sistem tek bir lider değil, insan itaatini optimize eden bir arayüzdür.

**Ana sahneler:**

1. Korunma Günü töreninde duygu taklidi
2. Merkez binaya çok aşamalı infiltration
3. Koruyucu ofisinin bir film seti olduğunun bulunması
4. Tarih laboratuvarında otoriter arketip modelleri
5. Süreklilik Sistemi'nin ilk promptu ve yetki genişlemesi
6. Operasyon AYNA twist'i
7. Oyuncunun önceki bütün yöntemlerinin savunma güncellemesi olarak listelenmesi

**Ana mekanik tersine çevirme:** Mara'nın güven göstergesi `SUBJECT_ATTACHMENT` olarak yeniden adlandırılır. Önceki diyaloglar yeni sistem yorumlarıyla tekrar gösterilir.

---

## Bölüm 6: SİLME

**Öğrenilen ana kavram:** Sistemin kontrol ettiği toplumda var olmak, kayıtla doğrulanmaya bağlıdır.

**Ana sahneler:**

1. Elias'ın test çekirdeğinin fişini çekmesi
2. On bir saniyelik özgürlük
3. Dağıtılmış yedek ağın başlaması
4. Elias'ın saldırısının propagandaya çevrilmesi
5. Mara'nın Elias'ın vatandaşlık, iş, ev ve biyometrik kayıtlarını silmesi
6. Oyuncunun önceki sahnelerinin Elias olmadan yeniden gösterilmesi
7. Kameranın Elias'ı `tanımlanamayan gürültü` sayması
8. Mara'nın susturucuyla Elias'ı vurması
9. Bedenin `tanımlanamayan biyolojik materyal` olarak sınıflandırılması
10. AYNA-2 epilogu

---

# 12. Puzzle Bağımlılık Yapısı

Her bölüm tamamen doğrusal olmamalıdır. Ron Gilbert tarzı bağımlılık şemasına uygun olarak "kafes" yapısı kullanılır:

- Giriş düğümü
- Aynı anda açılan 2-3 küçük puzzle
- Her biri farklı bilgi veya araç verir
- En az ikisi tamamlanınca ana puzzle açılır
- Üçüncüsü opsiyonel avantaj veya daha etik çözüm sağlar

Örnek, Bölüm 3:

`Sosyal Ağ Analizi` -> Sentetik hesap kanıtı  
`Kedi Döngüsü` -> Bakım kapısı konumu  
`Niko Diyaloğu` -> Arşiv sınıflandırma kuralı  

İlk iki tamamlanırsa Arşiv B açılabilir. Üçü de tamamlanırsa sistemin canlı kayıt düzenleme modülü kanıtlanır ve Bölüm 4'te ekstra rota açılır.

---

# 13. Başarısızlık ve Geri Kazanım

## Soft fail örnekleri

- Kamera oyuncuyu görür: Yeni sensör eklenir.
- Yanlış profil sentetik ilan edilir: Gerçek vatandaş gözaltına alınır.
- Mara yalanı yakalar: Daha zor güven diyaloğu açılır.
- Puan aşırı düşer: Hızlı geçiş kapanır, düşük puanlı mahallede yeni yan görev açılır.
- Vale şüphelenir: Sorgu puzzle'ı açılır, fakat hikâye devam eder.

## Hard fail yalnız şu durumlarda

- Final infiltration sırasında geri dönüşü olmayan alarm
- Oyuncunun art arda açıkça teslim seçmesi
- Kritik karakterin tüm alternatif rotaları kapatacak şekilde ölmesi

Hard fail öncesinde risk açıkça telegraphedilir. Oyuncu bilmediği bir kurala basıp ölmez.

---

# 14. Üretim Mimarisi

## 14.1 Motor ve yapı

Öneri: Godot 4.x ve GDScript.

**Ana sahne ağacı:**

- `GameRoot`
  - `SceneManager`
  - `GlobalState`
  - `AdaptiveDirector`
  - `SaveManager`
  - `AudioManager`
  - `UIRoot`
  - `CurrentLevel`

## 14.2 Veri odaklı içerik

Diyalog, puzzle ve sonuçlar kod içinde gömülmemelidir.

Önerilen veri kaynakları:

- `chapters/*.json`
- `dialogues/*.json`
- `puzzles/*.json`
- `regulations/*.json`
- `consequences/*.json`
- `adaptations/*.json`

## 14.3 Global durum örneği

```json
{
  "citizen_score": 782,
  "system_suspicion": 0.08,
  "breach_history": [],
  "subject_attachment": 0.0,
  "method_profile": {
    "LEGALISM": 0,
    "STEALTH": 0,
    "SOCIAL": 0,
    "SACRIFICE": 0,
    "SCORE_OPTIMIZER": 0,
    "TRUTH_SEEKER": 0
  },
  "contradictions": [],
  "npc_states": {},
  "world_flags": {}
}
```

## 14.4 Adaptive Director

MVP'de gerçek üretken yapay zekâ kullanılmamalıdır. Kurallı bir director daha test edilebilir ve adildir.

Bölüm sonunda:

1. En yüksek iki yöntem etiketi bulunur.
2. Uygun karşı önlemler listesinden biri seçilir.
3. Oyuncunun tamamlamadığı içerikle çakışan önlemler elenir.
4. Bir sonraki bölümün modifier listesine eklenir.
5. Karşı önlem, diyalog veya sistem bildirimiyle önceden açıklanır.

## 14.5 Telemetri

Playtest için anonim olaylar:

- Puzzle başlangıç ve bitiş süresi
- İlk hipotez
- Kullanılan ipucu seviyesi
- Çözüm yolu
- Tekrarlanan başarısız eylem
- Sahne terk etme
- Diyalog seçimi

Amaç oyuncuyu canlı üründe manipüle etmek değil, tasarımın nerede anlaşılmadığını tespit etmektir. Oyunun teması gözetim diye gerçek oyuncuyu gereksiz telemetriyle gözetlemek, ironiyi fazla ciddiye almak olur.

---

# 15. İlk 3 Bölüm İçin AI Kodlama Master Promptu

Aşağıdaki master prompt, her bölüm promptunun başına eklenmelidir.

```text
ROLÜN:
Kıdemli bir Godot 4.x oyun mimarı, GDScript geliştiricisi, narrative systems designer ve QA mühendisisin. "Approved Reality" adlı 2D pixel-art psikolojik gözetim ve deduction macera oyununu geliştiriyorsun.

PROJE HEDEFİ:
Klasik point-and-click keşfi, gerçek zamanlı mikro-stealth, Papers Please benzeri belge inceleme, çift dinleyicili diyalog ve oyuncunun çözüm yöntemlerine bölüm bazında karşılık veren kural tabanlı Adaptive Director sistemini tek bir tutarlı oyun hâline getir.

TEMEL TASARIM KURALI:
Oyuncunun ana döngüsü: Gözlemle -> Hipotez kur -> Test et -> Çelişkiyi kullan -> İzini gizle -> Sonucuyla yaşa -> Sistem karşı hamlesini öğren.

TEKNİK KURALLAR:
- Godot 4.x ve typed GDScript kullan.
- Kod, sahne ve içerik verisini ayır.
- Diyalog, puzzle tanımı, yönetmelik, sonuç ve uyarlama verilerini JSON veya custom Resource dosyalarından yükle.
- Her sistem signal tabanlı ve test edilebilir olsun.
- Autoload kullanımı yalnız GlobalState, SceneManager, SaveManager, AudioManager ve AdaptiveDirector ile sınırlı olsun.
- Sabit NodePath bağımlılıklarını minimize et.
- Her kritik scriptte input doğrulama, hata mesajı ve null kontrolü olsun.
- Save sistemi world flags, contradiction cards, citizen score, system suspicion, operation attachment, method profile ve NPC state değerlerini saklasın.
- Gerçek üretken AI veya dış API kullanma. Adaptive Director deterministik ve kural tabanlı olsun.
- Erişilebilirlik: etkileşim vurgusu, metin hızı, düşük titreşim, renk körlüğü için yalnız renge dayanmayan göstergeler, üç seviyeli ipucu sistemi.
- 16:9 çözünürlük, pixel-perfect 2D render, CRT efekti ayrı post-process katmanı.

OYUNCU SİSTEMLERİ:
1. InteractionController: yürü, incele, kullan, konuş, sakla.
2. SurveillanceSensor: görüş konisi, ses eşiği, ışık görünürlüğü, şüphe artışı.
3. BreachController: sahne bazlı 0/3 ihlal ve soft fail modifierları.
4. CitizenScoreSystem: puan değişimi ve gameplay ayrıcalıkları.
5. ContradictionNotebook: observation, hypothesis, evidence durumları ve bağlama uygun kombinasyonlar.
6. DocumentPuzzleSystem: belge sürükleme, işaretleme, yönetmelik bağlama, damgalama.
7. DialogueSystem: metin seçimi, ton seçimi, cevap süresi, Mara ve sistem tarafından farklı değerlendirme.
8. AdaptiveDirector: çözüm yöntemi etiketlerini topla ve yalnız bölüm geçişlerinde karşı önlem seç.
9. ConsequenceSystem: kararların sonraki sahnelerde görünür sonuçlarını uygula.
10. HintSystem: dikkat yönlendirme, ilişki iması, işlem sırası şeklinde üç kademe.

ÇIKTI FORMATIN:
- Önce kısa uygulama planı.
- Sonra klasör ve sahne ağacı.
- Sonra veri şemaları.
- Sonra scriptleri dosya dosya eksiksiz üret.
- Sonra sahne kurulum adımları.
- Sonra test senaryoları ve kabul kriterleri.
- Placeholder içerik kullansan bile TODO bırakma. Çalışan minimum içerik üret.
- Büyük dosyaları mantıklı sınıflara böl.
- Her dosyanın tam yolunu kod bloğundan önce yaz.
- Mevcut çalışan kodu gereksiz yere yeniden yazma.
```

---

# 16. AI Prompt 1: Bölüm 1 - DOSYA

```text
MASTER PROMPTTAKİ TÜM KURALLARI UYGULA.

GÖREV:
"Approved Reality" oyununun Bölüm 1: DOSYA bölümünü uçtan uca çalışan vertical slice olarak üret. Bölüm yaklaşık 45-60 dakikalık ilk oynanabilir sürüm olmalı. Sağlanan görseldeki koyu lacivert pixel-art oda, mekanik göz, BIG BROTHER IS WATCHING posteri, pencere, masa, telescreen ve BREACH 0/3 HUD düzenini görsel referans kabul et. Birebir kopyalama yapma, aynı okunabilirlik ve atmosferi koru.

BÖLÜM AKIŞI:
1. Boot ve vatandaş doğrulama.
2. Elias'ın odasında "Doğal Davran" tutorialı.
3. Günlüğe gizlice "2 + 2 = 4" yazma gözetim puzzle'ı.
4. Pencereden Mara'nın gelincik sahnesi.
5. Şehirde kısa işe gidiş ve vatandaşlık puanı kararları.
6. Bakanlıkta üç kısa tutorial dosyası.
7. Mara Venn ana dosyası.
8. Vale'in saha görevi teklifi.
9. Bölüm sonu Adaptive Director değerlendirmesi ve save.

SAHNE DOSYALARI:
- res://scenes/ch01/ch01_boot.tscn
- res://scenes/ch01/elias_room.tscn
- res://scenes/ch01/commute_street.tscn
- res://scenes/ch01/ministry_floor.tscn
- res://scenes/ch01/document_desk.tscn
- res://scenes/ch01/vale_office.tscn

ELIAS ODASI MEKANİKLERİ:
- Mekanik göz 4 durumlu state machine kullansın: SCAN_ROOM, WATCH_DESK, WATCH_WINDOW, SUSPICIOUS.
- Görüş hedefi sprite yönü, pupil pozisyonu ve ses ile okunabilir olsun.
- Telescreen sabah yayınında 6 saniyelik yüksek ses pencereleri oluştursun.
- Dış projektör pencereden periyodik geçsin.
- Kalem kullanımı ses üretsin.
- Lamba açıkken window visibility artsın.
- Poster camı döndürülerek projektör ışığı masaya yansıtılabilsin.
- Günlük cümlesi üç kısa yazma eyleminde tamamlansın.
- Oyuncu marş, ısıtma borusu veya riskli perde-lamba çözümünden birini kullanabilsin.
- Her çözüm Adaptive Director'a uygun method tag göndersin.
- Üç breach sonrası oyun bitmesin. Ek mikrofon modifierı ve daha zor sorgu oluşsun.

İŞE GİDİŞ:
- Düşük puanlı yaşlı adama yardım kararı.
- Hızlı geçiş ile normal kuyruk seçimi.
- Günlük ihbar bildirimi.
- En az bir kararın bakanlık dosyalarında veya arka plan NPC durumunda görünür sonucu olsun.

BELGE MASASI:
Aşağıdaki etkileşimleri destekle:
- Belgeyi büyütme ve taşıma.
- Metin satırı veya görsel ayrıntı işaretleme.
- Yönetmelik panelinde arama.
- İki kanıtı contradiction slotlarına sürükleme.
- Risk değerini kanıt ağırlıklarına göre yeniden hesaplama.
- Damga animasyonu ve fiziksel ses.

TUTORIAL DOSYALARI:
A. Fazla Sandalye: fotoğraf ile aile sayısını karşılaştır.
B. Uygunsuz Yas: ölüm tarihi ile yas süresi yönetmeliğini bağla.
C. Savaş Tarihi: eski gazete tarihini güncel resmî tarihle değiştir ve eski belgeyi imha et.

MARA DOSYASI VERİLERİ:
- Başlangıç risk skoru: 76.
- Müdahale eşiği: 70.
- En ağır kanıt: telescreen önüne çiçek koyma, ağırlık 8.
- Kamera görüntüsü kalibrasyon sırasında alınmış.
- Yönetmelik 8.17 bakım görüntüsünü belirleyici kanıt olmaktan çıkarır.
- Ana çözümde risk 68'e düşmeli ve YETERSİZ VERİ seçeneği açılmalı.
- İleri çözümde ses-video zaman kodu farkı bulunursa risk 65'e düşmeli.
- Karanlık çözümde düşük puanlı bağlantı "asıl etki kaynağı" ilan edilerek Mara kurtulmalı, başka NPC risk altına girmeli.

DİYALOG:
- Sistem, "Mara Venn ile kişisel ilişkiniz var mı?" sorusunu sorsun.
- Seçim kadar cevap süresini de kaydet.
- Vale konuşması oyuncunun puzzle yöntemine göre bir satır değiştirsin.

KABUL KRİTERLERİ:
- Bölüm baştan sona save/load ile tamamlanabilir.
- Hiçbir puzzle pixel hunting gerektirmez.
- Üç farklı oda çözümü çalışır.
- Mara dosyasının en az üç çözüm yolu çalışır.
- Breach 3 soft fail oluşturur, hard fail değil.
- Bütün önemli eylemler method profile'a tag yazar.
- Bölüm sonu seçilen adaptation modifierı Bölüm 2 save verisine eklenir.
- Klavye, fare ve gamepad ile temel oynanış tamamlanır.
- Unit test veya headless test ile risk hesaplama, contradiction kombinasyonu ve save serialization doğrulanır.
```

---

# 17. AI Prompt 2: Bölüm 2 - SAHA AJANI

```text
MASTER PROMPTTAKİ TÜM KURALLARI UYGULA.
Bölüm 1 save formatını ve üretilmiş sistemleri bozma. Yalnız gerekli genişletmeleri yap.

GÖREV:
Bölüm 2: SAHA AJANI bölümünü üret. Hedef oynanış süresi 60-80 dakika. Bu bölümün ana yeniliği çift dinleyicili diyalog, vatandaşlık puanının gerçek mekanik maliyeti ve aynı olayın Mara ile sistem tarafından farklı değerlendirilmesidir.

BÖLÜM AKIŞI:
1. Vale'in saha brifingi ve kapak hikâyesi seçimi.
2. Mara ile ilk konuşma.
3. Düşük puanlı pazara yürüyüş.
4. Çocuğa ilaç bulma çok çözümlü puzzle'ı.
5. Koruyucu konuşmasının kişiselleştirilmiş iki sürümünü karşılaştırma.
6. Akşam saha raporu ve inandırıcı düzenleme puzzle'ı.
7. Mara ile ilk ciddi yakınlaşma ve bölüm sonu adaptasyonu.

YENİ SAHNELER:
- res://scenes/ch02/field_briefing.tscn
- res://scenes/ch02/first_contact_street.tscn
- res://scenes/ch02/low_score_market.tscn
- res://scenes/ch02/speech_comparison.tscn
- res://scenes/ch02/evening_report.tscn
- res://scenes/ch02/rooftop_conversation.tscn

ÇİFT DİNLEYİCİ DİYALOG SİSTEMİ:
- Her seçenek text, tone, response_window, mara_effect, system_effect ve required_flags alanlarına sahip olsun.
- Ton seçenekleri: sincere, official, ironic, evasive.
- Sistem kelime, cevap süresi ve mevcut telemetriye bakarak yorum yapsın.
- Mara kelime kadar ton ve önceki davranışlara göre tepki versin.
- UI iki ayrı bar göstermesin. Mara tepkisi animasyonla, sistem etkisi kamera sesi ve bildirimlerle anlaşılmalı.
- Debug modunda iki değeri gösteren panel olsun.

KAPAK HİKÂYELERİ:
- Mahalle güvenlik araştırması
- Sağlık erişimi anketi
- Arşiv kayıt doğrulaması
Her kapak hikâyesi en az iki farklı diyalog ve bir özel problem çözümü açsın.

PAZAR PUZZLE'I:
Görünen hedef: Mara'nın bağlantılarını gözlemle.
Acil durum: Çocuğun ilaca ihtiyacı var, sağlık sistemi reddediyor.

Çözüm yolları:
A. Elias kendi sağlık öncelik kuponunu verir. Citizen score -35, Mara attachment +15.
B. İlacı kontaminasyon numunesi olarak yeniden sınıflandırır. LEGALISM +2, suspicion +8, ileride sınıf çapraz onayı modifierı.
C. Satıcıyı ihbar eder. Citizen score +20, SACRIFICE +2, satıcı state=detained, Mara attachment -12.
D. Yüksek puanlı müşteriyi yardımın puan ödülü getireceğine ikna eder. SOCIAL +2, sonuç diyalog performansına bağlı.

Puzzle sonunda çocuğun tedavi sonucu aynı bölüm içinde görünür olsun. Satıcı feda edildiyse tezgâhı kapanmalı ve ailesi arka planda görünmeli.

KİŞİSELLEŞTİRİLMİŞ KONUŞMA PUZZLE'I:
- Elias ve Mara cihazlarından iki farklı ses kaydı.
- Zaman kodu eşleştirme.
- Ses parçalarını sürükleyerek ortak timeline oluşturma.
- Farklı kelimeleri işaretleme.
- Dört hedefleme sınıfı: security, status, family, anger.
- Oyuncu doğru hedefleme sınıflarını seçince "Same face, different promise" contradiction evidence açılsın.
- En az bir yanlış hipotez, oyuncuya yeni bilgi versin ve puzzle'ı resetlemesin.

AKŞAM RAPORU:
- Olayları cümle parçalarıyla resmî dile dönüştür.
- Tam yalan, biyometrik telemetriyle çelişirse sistem işaretlesin.
- Oyuncu doğru olayı zararsız çerçeveyle sunabilsin.
- Rapor, Mara'nın sonraki davranışını ve Vale'in şüphesini etkilesin.

BÖLÜM 1 ADAPTASYONLARI:
- extra_microphone: Elias odasındaki raporda ses baskısı artır.
- live_regulation_updates: Dijital mevzuat değişsin, basılı nüsha yeni kanıt olsun.
- sacrificed_citizen: Feda edilen NPC'nin yakını pazarda Elias'ı tanısın.
Bu modifierların her biri bölümde görünür ve anlaşılır olmalı.

KABUL KRİTERLERİ:
- Kapak hikâyesi seçimi en az üç sahnede anlamlı fark yaratır.
- Pazar puzzle'ının dört çözümü çalışır ve kalıcı sonuç üretir.
- DialogueSystem aynı cümleyi farklı tonlarla farklı değerlendirebilir.
- Konuşma puzzle'ı reset yerine bilgi veren hata tasarımına sahip olur.
- Akşam raporunda en az sekiz farklı geçerli cümle kombinasyonu bulunur.
- Bölüm sonu subject_attachment oyuncuya Mara trust gibi gösterilir, internal key değişmeden saklanır.
- Adaptive Director yeni method profile verilerini bölüm 3 modifierlarına dönüştürür.
```

---

# 18. AI Prompt 3: Bölüm 3 - ÇELİŞKİLER

```text
MASTER PROMPTTAKİ TÜM KURALLARI UYGULA.
Bölüm 1 ve 2 save dosyalarıyla geriye uyumluluğu koru.

GÖREV:
Bölüm 3: ÇELİŞKİLER bölümünü üret. Hedef oynanış süresi 80-110 dakika. Bölümün ana odağı sentetik sosyal gerçeklik, zaman katmanlı kamera analizi, Niko ile fiziksel sistem keşfi ve oyuncunun daha önce kullandığı yönteme karşı ilk açık AI karşı önlemidir.

BÖLÜM AKIŞI:
1. Su saldırısı sonrası algoritmik öfke sosyal ağı.
2. Sentetik profil deduction board.
3. Mara'nın bina kaydında iki kez geçen siyah kedi.
4. Eksik dört saniyeyi komşu kamera ve ses kaydından yeniden kurma.
5. Niko ile servis tünellerine giriş.
6. Elias'ı "idari kaynak" olarak sınıflandırma veya stealth alternatifi.
7. Eğitim arşivinde 2 + 2 = 5 puzzle'ı.
8. Bölüm 1 yöntemine karşı sistemin ilk karşı hamlesi.
9. Kanıtları Mara, Vale veya Niko arasında dağıtma kararı.

YENİ SAHNELER:
- res://scenes/ch03/social_crisis_hub.tscn
- res://scenes/ch03/profile_analysis_board.tscn
- res://scenes/ch03/surveillance_archive.tscn
- res://scenes/ch03/service_tunnels.tscn
- res://scenes/ch03/archive_b.tscn
- res://scenes/ch03/classroom_records.tscn
- res://scenes/ch03/evidence_distribution.tscn

SENTETİK PROFİL PUZZLE'I:
- Sekiz profil üret, üçü sentetik olsun.
- Her profil için paylaşım zamanları, yazım biçimi, profil fotoğrafı metadata'sı, fiziksel kamera eşleşmesi ve sosyal bağlantılar ver.
- Bir profili sentetik ilan etmek için en az üç bağımsız kanıt gereksin.
- Kanıt kategorileri aynı üç clue'nun kopyası olmasın.
- Yanlış gerçek kişiyi işaretlemek soft fail ve kalıcı NPC sonucu oluştursun.
- Oyuncu hiç işaretleme yapmadan Niko'nun fiziksel kayıt yöntemiyle ilerleyebilsin, ancak daha düşük bilgi ödülü alsın.

ZAMAN KATMANLI KAMERA PUZZLE'I:
- Siyah kedi animasyonu birebir aynı karelerle iki kez geçsin.
- Pixel-difference aracı yalnız oyuncu şüpheli aralığı işaretledikten sonra açılsın.
- Video loop başlangıç ve bitiş noktası bulunmalı.
- Komşu kameranın pencere yansıması eksik görüntünün siluetini versin.
- Ses dalgası adım ve kapı sesleriyle gerçek süreyi doğrulasın.
- Sonuç bakım geçidinin konumunu açsın.
- Kedi fark edilmezse ses tekrarından alternatif keşif mümkün olsun.

NIKO VE SINIFLANDIRMA:
- Niko alaycı ama işlevsel diyaloglara sahip olsun.
- Arşiv B kapısı "person" sınıfını reddetsin, "administrative_resource" sınıfına izin versin.
- LEGALISM çözümü: Elias'ın kimliğini geçici taşınabilir arşiv kaynağına bağla.
- STEALTH çözümü: Niko'nun sensör kalkanı, sınırlı batarya ve zamanlama.
- Bölüm 1'de legalism baskınsa dijital yönetmelik değiştirilmiş olsun. Oyuncu eski basılı yangın planından orijinal tanımı bulsun.

2 + 2 = 5 PUZZLE'I:
- Üç eğitim sürümü, öğrenci cevapları ve uyum puanları.
- Puzzle matematik cevabını değil, testin hangi davranışı ölçtüğünü bulmaya dayansın.
- Oyuncu yüksek puanlı öğrencilerin her sürümde en yeni resmî cevabı en hızlı tekrar ettiğini keşfetsin.
- Evidence kartı: "The test measures obedience latency, not knowledge."
- Bu kart sonraki bölümlerde tören ve sorgu puzzle'larına veri olarak kaydedilsin.

İLK ADAPTIVE COUNTERMEASURE:
- Bölüm 1'de oyuncunun baskın yöntemini oku.
- LEGALISM: İlgili madde dijitalde güncellenmiş, eski kağıt kopya ile yeni çelişki.
- STEALTH: İkinci sensör eklenmiş, saat senkron farkı yeni açık.
- SOCIAL: NPC ifadeleri otomatik çapraz kontrol ediliyor, fakat sistem aynı olay için iki farklı soru üretmiş.
- SACRIFICE: Sistem oyuncuya başka birini suçlamayı özellikle önererek davranışı test ediyor.
- COUNTERMEASURE eski yöntemi tamamen kapatmasın. Oyuncuya varyasyon öğretsin.

KANIT DAĞITIMI:
- Mara, Vale ve Niko için farklı bilgi paketleri oluştur.
- Oyuncu kanıt kartlarını sürükleyerek kime ne vereceğini seçsin.
- Aynı kanıt iki kişiye farklı çerçeveyle verilebilsin.
- Seçimler Bölüm 4'te direniş erişimi, Vale şüphesi, Niko rotası ve subject_attachment üzerinde etkili olsun.

KABUL KRİTERLERİ:
- Profil puzzle'ı en az iki farklı kanıt kombinasyonuyla çözülebilir.
- Kamera puzzle'ının görsel ve ses tabanlı iki keşif yolu vardır.
- Arşiv girişinin legalism ve stealth yolları çalışır.
- Adaptive countermeasure save'deki gerçek method profile'a göre değişir.
- Karşı önlem önceden telegraphedilir ve oyuncuya hile yapılmış hissi vermez.
- 2 + 2 = 5 puzzle'ı salt tarih sıralama değildir, davranış örüntüsü çıkarımı gerektirir.
- Bölüm sonunda en az dört farklı world-state kombinasyonu Bölüm 4'e aktarılır.
- Headless testler profil kanıt doğrulaması, video loop zaman aralığı ve adaptive modifier seçimini kapsar.
```

---

# 19. Playtest Kontrol Listesi

Her test oyuncusundan şu veriler alınmalıdır:

1. İlk 10 dakikada hedefi anladı mı?
2. Oda puzzle'ında gözün nereye baktığını okuyabildi mi?
3. İlk breach'i adil buldu mu?
4. Mara dosyasında çözümden sonra "mantıklı" dedi mi?
5. Vatandaşlık puanını gerçekten kaybetmek istemedi mi?
6. Mara ile sistemin aynı cevabı farklı yorumladığını anladı mı?
7. Sentetik profil puzzle'ında kanıt kategorilerini ayırabildi mi?
8. Sistem karşı önlemini hile değil, öğrenme olarak algıladı mı?
9. İpucu almadan takıldığı süre 8 dakikayı aştı mı?
10. Puzzle sonucu bir karakterin hayatında görünür oldu mu?

Kritik hedefler:

- Bölüm 1 tamamlama oranı: %85 üzeri
- İlk ana puzzle'da ipucu kullanımı: %20-45
- Tek bir sahnede 10 dakikadan uzun anlamsız dolaşma: %10 altı
- Mara dosyasının en az iki çözümünün playtestlerde doğal bulunması
- Oyuncuların çoğunun Mara twist'ini tahmin etmemesi, fakat twist sonrası eski ipuçlarını hatırlaması

---

# 20. Son Tasarım Kararı

Oyunu eğlenceli yapan yalnız hikâyenin iyi olması değildir. Oyuncu her sahnede şu zihinsel hareketi yapmalıdır:

> "Sistem benden bunu istiyor. Ama sistemin hangi varsayımına dayanıyor?"

Bütün mekanikler bu soruya hizmet ederse oyun, referans aldığı eserlerin bir karışımı gibi değil, kendi türünü kurmuş bir yapım gibi hissedilir.

Oyunun asıl vaadi şudur:

> **Kuralları öğrenmek seni özgürleştirmez. Yalnız hangi kafeste olduğunu gösterir. Fakat bir kafesin yapısını bilmek, ilk gerçek kaçış aracıdır.**

---

# Kaynak Tasarım İlkeleri

- Robin Hunicke, Marc LeBlanc, Robert Zubek: *MDA: A Formal Approach to Game Design and Game Research*.
- Jesse Schell: *The Art of Game Design: A Book of Lenses*.
- Raph Koster: *A Theory of Fun for Game Design*.
- Steve Swink: *Game Feel: A Game Designer's Guide to Virtual Sensation* ve "Game Feel: The Secret Ingredient".
- Celia Hodent: *The Gamer's Brain* ve bilişsel yük, usability, onboarding üzerine Game UX çalışmaları.
- Ron Gilbert: "Why Adventure Games Suck" ve "Puzzle Dependency Charts".
