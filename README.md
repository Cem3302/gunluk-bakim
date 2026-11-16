# Günlük Bakım ve Arıza Takibi — Daily Maintenance & Fault Tracking

`daily maintenance.xlsx` dosyanızdan çıkarılan **533 ekipmanlık** listeyle çalışan
web tabanlı günlük bakım uygulaması. **Tek dosya:** `index.html` — çift tıklayıp
tarayıcıda açmanız yeterli (sunucu, kurulum ve internet gerektirmez).

> `style.css`, `template.html`, `build.sh` ve `js/` klasörü kaynak dosyalardır;
> çalıştırılan dosya `index.html`'dir. Kaynakları değiştirip `bash build.sh`
> ile yeniden derleyebilirsiniz.

## Özellikler

- **Excel'den gelen ana liste** — 533 ekipman: No, Tip, Marka, Model, Spesifikasyon.
  Bakım formu Excel'deki sütunların aynısıdır: Saat, Konum, Yağlama (GRS),
  Hava Filtresi (AIR) ve 9 yağ tipi (15W-40, 68, ACX30, ACX50, 80W-90, 85W-90,
  ATF DIII, COOL ELF, 85W-140) + Gözlem.
- **Yağ miktarı (litre)** — her yağ tipi hücresinde "kullanıldı" kutucuğunun yanında
  litre alanı vardır. Litre girildiğinde kutucuk otomatik işaretlenir ve ekipman
  bakıldı sayılır. Geçmiş görünümünde ve CSV'de `15W-40 · 2.5 L` gibi görünür.
- **Günlük kayıt** — tarih seçin (geçmişe dönük de girilebilir), bakan kişi ve
  vardiya girin; her ekipman için bakıldı işaretleyip detayları doldurun.
  Kayıtlar otomatik kaydedilir (localStorage).
- **Geçmiş kayıtlar** — Günlük Kayıtlar görünümü (gün gün açılır, o günün
  tüm detayları) ve **Son Bakımlar** görünümü (her ekipmanın en son bakım tarihi,
  yapılanlar, gözlem ve bakan kişi). Son 14 günün grafiği ve CSV (Excel) indirme.
- **2 gün üst üste uyarı** — bir ekipman **2 gündür (ayarlanabilir eşik)** üst üste
  bakıma gitmediyse kırmızı uyarı panelinde ve menü rozetinde listelenir;
  "son bakım" tarihiyle birlikte. Uyarıya tıklayınca o ekipman listede gösterilir.
- **Ekipman ekleme / silme** — yeni ekipman ekleyin, listeden silin
  (geçmiş bakım kayıtları korunur). "Excel listesine dön" ile silinenler hariç
  orijinal 533'lük liste geri gelir.
- **TR / EN dil seçeneği** — arayüzün tamamı Türkçe/İngilizce; ekipman tipleri
  Türkçe arayüzde Türkçeleştirilir (DÖZER, TEKERLEKLİ EKSKAVATÖR, ...).
- **Yedekleme** — tüm veriyi JSON olarak indirme / geri yükleme, tek tıkla
  kayıt temizleme, uyarı eşiği ayarı (1–30 gün).
- **Mobil uyumlu** — telefonda geniş tablo kart listesine döner; detaylar ▸
  düğmesiyle açılır, menü yatay kaydırılır, dokunmatik hedefler büyütülür.

## Pano — canlı senkron (`dashboard.html`)

`dashboard.html` (16:9 duvar/TV panosu) verisini **periyodikbakim.abacusai.app**
adresinden alır ve kendiliğinden güncellenir:

1. `.github/workflows/live-sync.yml` her **5 dakikada** bir Abacus API'sini
   (`/api/maintenance`) sunucu tarafında okur ve Firebase Realtime Database'e yazar
   (`gunluk/board.json`). Tarayıcı bu API'yi doğrudan çağıramaz çünkü API CORS
   başlığı göndermiyor.
2. Pano bu yolu **SSE** ile dinler → pano açıkken yeni veri **1–2 saniyede**,
   sayfa yenilemeden düşer. SSE koparsa 5 dakikada bir REST yedeği devreye girer.
3. Sağ üstteki rozet durumu gösterir: **Canlı · ss:dd** (yeşil),
   **Gecikmeli** (12 dakikadan eski veri), **Çevrimdışı**, **Yerel dosya**.
4. Elle **Excel yükleme** (📊 düğmesi / sürükle-bırak) hâlâ çalışır; dosya
   yüklenince canlı senkron duraklar, **↺ Varsayılan** ile canlıya dönülür.

Kategoriler ve eşikler uygulamayla birebir: Heavy Truck / Light Vehicle (KM,
1000 km uyarı eşiği), Heavy Equipment / Light Equipment (Saat, 50 saat).

## Uyarı kuralı

Son bakımdan bu yana geçen gün sayısı (bugün dahil) ≥ eşik ise uyarı verilir.
Yani varsayılan 2 gün için: dün ve bugün bakılmadıysa → uyarı.
Hiç bakılmamış bir ekipman ise, ilk kayıtlı günden itibaren geçen süre kadar
sayılır (yeni eklenen ekipmanlar kendi eklenme gününden itibaren sayılır).

## Veriler nerede tutuluyor?

Tarayıcının localStorage alanında. Farklı bilgisayar/tarayıcı arasında taşımak için
**Ayarlar → Yedeği İndir (JSON)** kullanın, karşı tarafta **Yedekten Geri Yükle**
ile açın. Kayıtlar CSV olarak da indirilebilir (Excel'de açılır).
