# دليل الصور — أين تضع كل صورة

الموقع مبني بحيث **تسحب الصورة وتحطها في مكانها فقط** — من غير أي تعديل في الكود.
أي صورة ناقصة بتظهر تلقائيًا كبلوك أنيق مكتوب عليه اسم المكان، فالصفحة لا تنكسر أبدًا.

> **الأسماء مهمة.** لازم اسم الملف والامتداد يكون بالظبط زي المكتوب تحت (حروف صغيرة، `.jpg`).

---

## 1) اللوجو (مهم — مطلوب)

| الملف | المسار |
|---|---|
| لوجو البكري أوفر سيز | `assets/logo/elbakri-logo.png` |
| أيقونة الآيفون (اختياري) | `assets/logo/apple-touch-icon.png` — مربعة 180×180 |

**مش محتاج تشيل خلفية اللوجو.** الموقع بيحط اللوجو على «لوحة» لونها `#EDF0F5`
وهو نفس لون خلفية اللوجو الأصلي، فالخلفية بتختفي بصريًا من غير أي تعديل على الملف.
لو عندك نسخة PNG شفافة، حطها بنفس الاسم وهتشتغل عادي كمان.

---

## 2) صور المزارات

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

## 3) الفندق

| الصورة | المسار |
|---|---|
| الصورة الكبيرة | `assets/hotel/hotel-main.jpg` |
| صورة صغيرة 1 | `assets/hotel/hotel-1.jpg` |
| صورة صغيرة 2 | `assets/hotel/hotel-2.jpg` |
| صورة صغيرة 3 | `assets/hotel/hotel-3.jpg` |

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
