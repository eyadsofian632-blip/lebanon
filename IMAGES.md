# دليل الصور

كل صور الموقع دلوقتي **من صورك إنت** — المزارات والفندق واللوجو والرحلات
السابقة. مفيش أي صورة ستوك ولا صورة من ويكيميديا.

## تغيير أي صورة

استبدل الملف في مكانه وخلاص — مفيش أي تعديل في الكود. الأسماء لازم تكون
بالظبط زي الجدول تحت.

> `scripts/fetch-images.mjs` بقى **معطّل لكل الأماكن** — لو شغلته مش هيكتب فوق
> أي صورة. لسه موجود لو حبيت تضيف مكان جديد وتجيبله صورة من ويكيميديا.

---

## 1) اللوجو ✅ اترفع

| الملف | المسار |
|---|---|
| لوجو البكري أوفر سيز | `assets/logo/elbakri-logo.png` |
| أيقونة الآيفون | `assets/logo/apple-touch-icon.png` — 180×180 |

الخلفية اتشالت أوتوماتيك (اتقاست من الأركان، اتشالت 96% من البكسلات) —
الرسمة والطيارة والخط والألوان والنِسب ما اتلمسوش.

### لو حبيت تعيد المعالجة بنفسك

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

## 2) صور المزارات ✅ كلها من صورك

| المكان | المسار |
|---|---|
| الهيرو (بيروت من فوق) | `assets/lebanon/hero/hero.jpg` |
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
| اليوم الحر | `assets/lebanon/free-day/free-day.jpg` |
| بانر الحجز الأخير | `assets/lebanon/final-cta/final-cta.jpg` |

كل صورة اتظبطت على عرض 1920px وجودة 82 + نسخة WebP، عشان تفضل سريعة على الموبايل.

معرض الصور بيستخدم نفس الصور دي تلقائيًا — مفيش ملفات إضافية مطلوبة.

---

## 3) الفندق ✅ اترفعت

| الصورة | المسار | المحتوى |
|---|---|---|
| الكبيرة | `assets/hotel/hotel-main.jpg` | تراس المسبح بإطلالة على البحر |
| صغيرة 1 | `assets/hotel/hotel-1.jpg` | المسبح من قريب |
| صغيرة 2 | `assets/hotel/hotel-2.jpg` | واجهة ومدخل الفندق |

---

## 4) صور الرحلات السابقة (قسم «لقطات من رحلاتنا») ✅ اترفعت

| الصورة | المسار |
|---|---|
| مجموعة بين أشجار الأرز المغطاة بالثلج | `assets/trips/trip-01.jpg` |
| مسافرون في إطلالة على الساحل | `assets/trips/trip-02.jpg` |
| مجموعة في قطار الجولة السياحي | `assets/trips/trip-03.jpg` |
| مسافرات في صورة تذكارية على البحر | `assets/trips/trip-04.jpg` |
| مسافرون في رحلة تزلج على الثلج | `assets/trips/trip-05.jpg` |
| مسافرات على دراجة ثلجية في الجبل | `assets/trips/trip-06.jpg` |

عايز تزوّد صور؟ ضيف `trip-07.jpg` وهكذا، وكرر بلوك `<figure class="slide">`
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
