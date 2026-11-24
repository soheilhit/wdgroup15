# ست‌یار (wdgroup15)

سایت انتخاب و ست کردن لباس. کاربر عکس لباس‌هایش را وارد می‌کند، از مانتو، شلوار، کفش و کیف ست می‌سازد و برای موقعیت‌هایی مثل مهمانی، دانشگاه و روزمره پیشنهاد استایل می‌گیرد.

بدون بک‌اند و بدون نصب چیزی: فقط HTML، CSS و JavaScript ساده. داده‌ها در `localStorage` مرورگر ذخیره می‌شوند.

## اجرا

فایل `index.html` را در مرورگر باز کن، یا:

```bash
python3 -m http.server 8000
# بعد برو به http://localhost:8000
```

## ساختار فایل‌ها

```
wdgroup15/
├── index.html            صفحه خوش‌آمد            (feature-welcome)
├── wardrobe.html         کمد و افزودن لباس        (feature-home)
├── builder.html          ست‌ساز و ست‌های ذخیره‌شده  (feature-notes)
├── suggest.html          پیشنهاد استایل           (feature-reminders)
├── css/
│   ├── base.css          رنگ‌ها، هدر، دکمه‌ها، فرم   (develop)
│   ├── welcome.css
│   ├── wardrobe.css
│   ├── outfit.css        نمایش ست (مشترک بین builder و suggest)
│   ├── builder.css
│   └── suggest.css
└── js/
    ├── storage.js        ذخیره‌سازی، دسته‌ها، رنگ‌ها   (develop)
    ├── ui.js             هدر، اعلان، نمایش ست       (develop)
    ├── welcome.js
    ├── wardrobe.js
    ├── builder.js
    ├── suggest-engine.js قوانین پیشنهاد (بدون AI)
    └── suggest.js
```

## تقسیم کار برنچ‌ها

| برنچ | فایل‌ها |
|---|---|
| `develop` | `css/base.css`، `css/outfit.css`، `js/storage.js`، `js/ui.js`، `README.md` |
| `feature-welcome` | `index.html`، `css/welcome.css`، `js/welcome.js` |
| `feature-home` | `wardrobe.html`، `css/wardrobe.css`، `js/wardrobe.js` |
| `feature-notes` | `builder.html`، `css/builder.css`، `js/builder.js` |
| `feature-reminders` | `suggest.html`، `css/suggest.css`، `js/suggest-engine.js`، `js/suggest.js` |

ترتیب ادغام: اول `develop` را از `main` بگیرید، بعد هر `feature-*` را داخل `develop` ادغام کنید و در پایان `develop` را داخل `main`.

## قابلیت‌ها

- افزودن لباس با عکس (عکس قبل از ذخیره کوچک می‌شود)، دسته، رنگ و موقعیت
- ست‌ساز با پیش‌نمایش زنده و ذخیره ست
- پیشنهاد استایل بر اساس موقعیت با امتیازدهی هماهنگی رنگ
- لباس نمونه برای امتحان سریع

## محدودیت‌ها

- داده‌ها فقط در همان مرورگر می‌مانند (با پاک کردن داده‌های سایت از بین می‌روند).
- حذف پس‌زمینه عکس انجام نمی‌شود؛ بهتر است عکس‌ها روی زمینه ساده باشند.
