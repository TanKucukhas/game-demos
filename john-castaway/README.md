# ADA ⸙

Kazazede vinyet motoru — Johnny Castaway'in (Dynamix/Sierra, 1992) **ruhani varisi**.
Kazım adında bir kazazede, tek palmiyeli bir adada kendi hayatını yaşar; sen izlersin,
arada öneri verirsin — ama emir veremezsin.

> **Hukuki not:** Bu projede hiçbir Johnny Castaway varlığı (grafik, ses, isim, karakter)
> kullanılmamıştır. Tüm sprite'lar bu repo'nun kendi pipeline'ında üretilen özgün artwork'tür.
> Orijinal ekran koruyucunun davranış mimarisi (veri odaklı sahne zamanlayıcı) yalnızca
> *fikir* düzeyinde ilham kaynağıdır.

## Çalıştırma

```bash
npm run serve        # http://localhost:8321
```

Test için saat override: `http://localhost:8321/?h=22` (22:00'a kurar, gece sahneleri).

## Sprite pipeline

Tüm artwork koddan üretilir — Kazım parametrik poz motoruyla (`tools/kazim.js`),
prop'lar ASCII pixel-map + prosedürel çizimle (`tools/props.js`), hepsi 28 renklik
kilitli ADA paletinden (`tools/palette.js`).

```bash
npm run sprites      # assets/kazim.png+json, assets/props.png+json yeniden üretilir
```

### MCP server ile

`.mcp.json` bu repo'da tanımlı — Claude Code bu klasörde açıldığında `ada-sprites`
MCP server'ı otomatik bağlanır (`npm install` sonrası):

| Tool | Ne yapar |
|---|---|
| `generate_atlases` | Tüm spritesheet'leri yeniden üretir |
| `list_frames` | Atlas'lardaki kare ve animasyonları listeler |
| `preview_frame` | Bir animasyonu/prop'u N× zoom PNG olarak `assets/previews/`e render eder |

Artwork iterasyonu böylece araç çağrısına dönüşür: palet/poz değiştir → `generate_atlases`
→ `preview_frame` ile gözle kontrol.

## Mimari (kritik kararlar)

- **Veri odaklı sahneler** — `data/events.json`: ağırlık, cooldown, koşul (gece/gündüz),
  mood, chainNext. Davranış kancaları `src/game.js` içindeki `BEHAVIORS` kaydında.
- **Story Director** — seçim sırası: zincir kuyruğu → uygunluk → cooldown → tekrar engeli
  → komedi ritmi (arka arkaya iki üzücü sahne gelmez) → moral ağırlığı (moral düşükse
  konfor sahneleri öne çıkar).
- **Öneri mekaniği** — oyuncu emir vermez: %62 kabul, %28 yanlış anlama (komedi:
  sal yerine sandalye), %10 ret. Yanlış anlamalar moral kazandırır — Kazım gururludur.
- **İki stat** — `morale` + `island_attachment`. Açlık/enerji yok; bu bir survival oyunu değil.
- **Kaçış döngüsü** — sal %100 → kaçış denemesi → sal denize değince ikiye ayrılır →
  adaya bağlılık +10 → "yarın yenisi". Orijinalin Gilligan's Island ironisi.
- **480×270 taban, ~32×48 karakter** — diorama ölçeği; animasyon bütçesi gag sayısına harcanır.

## Çekirdek döngü: Kaçış Düzenekleri 🧩

Ambient ada bir **hub**; asıl oyun The Incredible Machine DNA'lı düzenek bulmacaları
(TIM ve Johnny Castaway aynı yıl, aynı stüdyoda, aynı yapımcıdan çıkmıştı — 1992, Jeff Tunnell).

- Her bölümde parçaları (kalas, halat, yengeç, bot, kova) slotlara ata, **ÇALIŞTIR**.
- Yanlış kombinasyonlar ceza değil **içerik**: her birinin kendine özel, yazılmış komik
  sonucu var (ceviz kovaya girer → Kazım kovayı közler).
- Bölümler sıralı açılır; final bölümde Kazım 31 yıl sonra ilk kez adadan çıkar (üç metre).
- Veri: `data/puzzles.json` (slot/parça/sonuç + adım DSL'i), motor: `src/puzzle.js`.
- QA kancası: `?pz=mancinik&parts=rope,plank,crab` bir sonucu otomatik oynatır.

## Yol haritası

- **M1:** spritesheet pipeline + MCP server + öneri mekaniği + Story Director
- **M2 (bu sürüm):** Kaçış Düzenekleri — 3 bölüm, adım-DSL'li sonuç motoru
- **M3:** 8-10 bölüm, parça envanteri (bölüm ödülleri yeni parça açar), tatil bölümleri
- **M4:** Tauri v2 ile masaüstü alt-şerit/her-zaman-üstte sürüm (Steam köprüsü)

## Referanslar (yalnızca davranış speci olarak)

- [jc_reborn](https://github.com/jno6809/jc_reborn) — orijinal motorun C/SDL2 reimplementasyonu
- [xesf/castaway](https://github.com/xesf/castaway) — JS reimplementasyonu + format dokümanları
