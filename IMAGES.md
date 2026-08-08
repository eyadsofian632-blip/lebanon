# دليل الصور

## أسرع طريقة — أمر واحد

صور كل المزارات بتتنزل أوتوماتيك من ويكيميديا كومنز في أماكنها الصح:

```bash
node scripts/fetch-images.mjs
```

بيجيب 17 صورة (الهيرو + كل مزار + بانر الحجز) ويحطهم في المسارات اللي
`index.html` بيقرأ منها، ويكتب `CREDITS.md` فيه اسم المصور والرخصة لكل صورة.

**محتاج Node 18 أو أحدث.** لو عايز نسخ WebS كمان: `npm i sharp` قبل التشغيل.

مش عاجبتك صورة معينة؟ جرّب البديل:

```bash
node scripts/fetch-images.mjs --only=byblos --pick=2 --force
```

> **مهم قانونيًا:** صور كومنز مجانية بس أغلبها بيتطلب ذكر المصور. سيب
> `CREDITS.md` في المشروع، وراجع صفحة كل صورة قبل استخدامها في إعلان مدفوع.

الصور اللي الأمر ده **مش** هيجيبها (لأنها مش على كومنز): اللوجو، وصور فندق
Midtown، وصور رحلاتك السابقة، وصورة المشاركة. دي من عندك — تفاصيلها تحت.

---

## 1) اللوجو (مهم — مطلوب)

| الملف | المسار |
|---|---|
| لوجو البكري أوفر سيز | `assets/logo/elbakri-logo.png` |
| أيقونة الآيفون | `assets/logo/apple-touch-icon.png` — 180×180 |

### الطريقة الأوتوماتيك — شيل الخلفية بأمر واحد

```bash
npm i sharp
node scripts/prepare-logo.mjs ~/Downloads/elbakri-logo.png
```

بياخد اللوجو الأصلي، يقرا لون الخلفية من الأركان، ويشيلها **بس** — الرسمة
والخطوط والطيارة والألوان والنِسب ما بيتغيرش فيها أي حاجة. وبيطلع كمان
أيقونة الآيفون. النتيجة PNG شفاف في مكانه الصح.

لسه فاضل هالة رمادية؟ زوّد التسامح:

```bash
TOLERANCE=40 node scripts/prepare-logo.mjs ~/Downloads/elbakri-logo.png
```

### أو من غير أي أوامر

**مش محتاج تشيل الخلفية أصلًا.** الموقع بيحط اللوجو على «لوحة» لونها `#EDF0F5`
وهو نفس لون خلفية اللوجو الأصلي، فالخلفية بتختفي بصريًا لوحدها. ارمي الملف
الأصلي في `assets/logo/elbakri-logo.png` وخلاص.

---

## 2) صور المزارات

`fetch-images.mjs` بينزّلها كلها أوتوماتيك. الجدول ده لو عايز تحط صورك بنفسك
أو تستبدل واحدة:

| المكان | المسار |
|---|---|
| صورة الهيرو (بيروت / الروشة وقت الغروب) | `assets/lebanon/hero/hero.jpg` |
| صخرة الروشة | `assets/lebanon/raouche/raouche.jpg` |
| مسجد محمد الأمين | `assets/lebanon/mohammad-al-amin/mohammad-al-amin.jpg` |
| ساحة الشهداء | `assets/lebanon/martyrs-square/martyrs-square.jpg` |
| زيتونة باي | `assets/lebanon/zaitunay-bay/zaitunay-bay.jpg` |
| شارع الحمرا | `assets/lebanon/hamra/hamra.jpg` |
| مغارة جعيتا | `assets/lebanon/jeita/jeita.jpg` |
| التلفريك | `assets/lebanon/cable-car/cable-car.jpg` |
| THE PINE YARDS | `assets/lebanon/pine-yards/pine-yards.jpg` |
| جبيل | `assets/lebanon/byblos/byblos.jpg` |
| البترون | `assets/lebanon/batroun/batroun.jpg` |
| دير القمر | `assets/lebanon/deir-el-qamar/deir-el-qamar.jpg` |
| قصر موسى | `assets/lebanon/moussa-castle/moussa-castle.jpg` |
| شلالات الزرقاء | `assets/lebanon/blue-waterfalls/blue-waterfalls.jpg` |
| اليوم الحر في بيروت | `assets/lebanon/free-day/free-day.jpg` |
| يوم العودة | `assets/lebanon/departure/departure.jpg` |
| خلفية بانر الحجز الأخير | `assets/lebanon/final-cta/final-cta.jpg` |

معرض الصور بيستخدم نفس الصور دي تلقائيًا — مفيش ملفات إضافية مطلوبة.

---

## 3) الفندق — لازم تجيبها بنفسك

| الصورة | المسار | المحتوى |
|---|---|---|
| الكبيرة | `assets/hotel/hotel-main.jpg` | تراس المسبح بإطلالة على البحر |
| صغيرة 1 | `assets/hotel/hotel-1.jpg` | المسبح من قريب |
| صغيرة 2 | `assets/hotel/hotel-2.jpg` | واجهة ومدخل الفندق |

3 صور بالظبط — مفيش خانة فاضية.

صور فندق Midtown مش على ويكيميديا كومنز، وصورها على مواقع الحجز محمية بحقوق
ملكية — مينفعش تتاخد وتتحط في إعلان مدفوع. استخدم صورك إنت، أو اطلب من الفندق
media kit (بيبعتوه عادي للوكالات).

---

## 4) صور الرحلات السابقة (قسم «مسافرون اختاروا البكري»)

دي الصور اللي بعتّها — صور حقيقية من رحلات سابقة:

| الصورة | المسار |
|---|---|
| المجموعة في ميناء جبيل مع علم البكري | `assets/trips/trip-01.jpg` |
| السكوتر الثلجي في الجبل | `assets/trips/trip-02.jpg` |
| المجموعة بين أشجار الأرز | `assets/trips/trip-03.jpg` |
| المجموعة في قطار الجولة | `assets/trips/trip-04.jpg` |
| صورة إضافية | `assets/trips/trip-05.jpg` |

عايز تزوّد صور؟ ضيف `trip-06.jpg` وهكذا، وكرر بلوك `<figure class="slide">`
في `index.html` جوه `carousel__track`.

---

## 5) آراء العملاء (اختياري)

لو عندك **سكرين شوتس حقيقية** لآراء العملاء، حطها في:

```
assets/reviews/review-01.jpg
assets/reviews/review-02.jpg
```

ولا يوجد أي رأي مكتوب أو مُختلق في الموقع حاليًا — القسم بيعرض صور حقيقية من
الرحلات السابقة فقط، لحد ما تبعت السكرين شوتس.

---

## 6) صورة المشاركة على فيسبوك / واتساب

| الصورة | المسار |
|---|---|
| صورة الـ Open Graph | `assets/og/og-cover.jpg` — مقاس 1200×630 |

دي الصورة اللي بتظهر لما حد يشارك اللينك على فيسبوك أو واتساب. مهمة جدًا لإعلانات ميتا.

---

## نصائح سريعة للصور

- **المقاسات:** الهيرو والبانر الأخير ≥ 1920px عرض. باقي الصور 1200–1600px كفاية.
- **الحجم:** ضغط كل صورة لأقل من 300KB (استخدم [squoosh.app](https://squoosh.app) مجانًا).
- **WebP:** لو حابب أداء أعلى، حوّل الصور لـ WebP واحفظها بامتداد `.jpg` برضه —
  المتصفحات بتقراها من الـ content type. أو غيّر الامتدادات في `index.html`.
- **الاتجاه:** صور المزارات أفقية (landscape) أحسن. صور الرحلات أي اتجاه شغالة.
