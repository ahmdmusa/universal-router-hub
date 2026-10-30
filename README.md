# 🌐 Universal Router Hub (NextGen Dashboard)
### الإضافة الموحدة للتحكم الذكي وتحديث واجهات راوترات مصر والشرق الأوسط
**متوافقة مع: Google Chrome • Mozilla Firefox (PC & Android) • Microsoft Edge • Brave • Opera**

[![CI Status](https://github.com/ahmdmusa/universal-router-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/ahmdmusa/universal-router-hub/actions/workflows/ci.yml)
[![Release](https://github.com/ahmdmusa/universal-router-hub/actions/workflows/release.yml/badge.svg)](https://github.com/ahmdmusa/universal-router-hub/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/ahmdmusa/universal-router-hub?color=success&include_prereleases)](https://github.com/ahmdmusa/universal-router-hub/releases)

> 🚀 **دليل النشر التلقائي عبر المنصات والمتاجر:** راجع [`PUBLISHING_AUTOMATION.md`](PUBLISHING_AUTOMATION.md) للاطلاع على تفاصيل النشر السريع بضغطة زر واحدة إلى Chrome Web Store, Firefox AMO, Edge Add-ons, و GitHub Releases.

---

## 🎯 فكرة المشروع
تحويل صفحة الراوتر الافتراضية القديمة والقبيحة (`192.168.1.1` أو `192.168.0.1` أو `192.168.8.1`) تلقائياً إلى **لوحة تحكم عصرية متجاوبة باللمس (Glassmorphism Dashboard)**، مع التعرف الذكي على نوع وموديل الراوتر، وتوفير زر سحري موحد لتحديد السرعة وحماية باقة الإنترنت الشهرية من النفاذ.

---

## 📊 تغطية ومطابقة راوترات السوق المصري (حسب شعبية الأجهزة)

| العلامة التجارية | النسبة السوقية | الموديلات المدعومة والمدرجة في الإضافة |
| :--- | :---: | :--- |
| **TP-Link** | **30%** | Archer C6, Archer VR600, VN020-F3 (WE), TL-WR841N, TL-WR940N |
| **D-Link** | **25%** | DSL-245GE (EcoNet EN7516), DSL-224 (VDSL2), DSL-124, DSL-2750U, DIR-825 |
| **ZTE / المصرية WE** | **12%** | ZXHN H168N (VDSL الأساسي), ZXHN H188A (SuperVectoring), WE Air 5G (H153), F601 ONT, H108N |
| **Huawei / فودافون / أورنج** | **10%** | DG8045 (WE), HG630 V2, DN8245V, HG8245H (FTTH الفايبر), B311 & B315 (Orange 4G) |
| **Vodafone Wireless** | **8%** | راوترات فودافون الهوائية المنزلية (ZTE & Huawei 4G) |
| **Orange Wireless** | **5%** | راوترات أورنج الهوائية المنزلية (Huawei B311 / B315) |
| **Tenda** | **4%** | Tenda F3, Tenda AC10 Gigabit |
| **Mercusys** | **3%** | Mercusys AC10, MW305R |
| **ASUS** | **3%** | ASUS RT-AC1200 (ASUSWRT) |

---

## 🚀 الميزات الرئيسية

1. **كشف تلقائي ذكي (Smart Auto-Detection)**:
   * بمجرد دخولك لصفحة الراوتر، تفحص الإضافة توقيع السوفتوير وتتعرف على الموديل فوراً.
   * إمكانية الاختيار اليدوي وتثبيت الموديل المفضل من القائمة المنسدلة في الشريط العلوي أو من نافذة الـ Popup.

2. **محدد السرعة وتوفير الباقة الموحد (Universal 802.11 Mode Limiter)**:
   * **🐢 11B Only**: تقييد سرعة التحميل على الهواتف والأجهزة عند **~4.5 إلى 5.5 ميجابت/ثانية** (لمنع استنزاف باقة WE من فيديوهات تيك توك و4K).
   * **⚡ 11G Only**: تقييد السرعة عند **~20 ميجابت/ثانية** (مناسبة لمشاهدة Full HD ثابتة).
   * **🔥 Mixed 11N/G/B**: فتح السرعة القصوى غير المحدودة.

3. **كشف جودة الخط النحاسي (VDSL Line Health)**:
   * قراءة فورية لهامش الضوضاء (SNR Margin) ومعدل التوهين (Line Attenuation).
   * حساب المسافة التقديرية عن كابينة الـ MSAN بالأمتار.
   * عرض أقصى سرعة يتحملها الخط النحاسي (Max Attainable Rate).

4. **واجهة متجاوبة 100% مع الهواتف الذكية (Mobile-First)**:
   * شريط تنقل سفلي مرن يسهل التحكم بيدك الواحدة على شاشات الهواتف.

5. **تسريع التصفح بضغطة زر (Fast DNS Presets)**:
   * تفعيل خوادم Cloudflare 1.1.1.1، Google 8.8.8.8، أو AdGuard لحجب الإعلانات المزعجة.

6. **إعادة تشغيل الراوتر (Reboot) بضغطة زر واحدة**.

---

## 🛠️ طريقة التثبيت والاستخدام

### 1. على متصفح Google Chrome / Edge / Brave (كمبيوتر):
1. افتح المتصفح واكتب في شريط العنوان: `chrome://extensions/`.
2. فعّل **وضع المطور (Developer mode)** من الزاوية العلوية.
3. اضغط على زر **تحميل حزمة غير مضغوطة (Load unpacked)**.
4. اختر مجلد الإضافة:  
   `C:\Users\ahmed\Desktop\universal-router-hub`
5. افتح صفحة الراوتر `http://192.168.1.1` وستظهر لك الداشبورد الحديثة فوراً!

### 2. على متصفح Mozilla Firefox (كمبيوتر):
1. افتح فايرفوكس واكتب: `about:debugging#/runtime/this-firefox`.
2. اضغط على **Load Temporary Add-on...**.
3. اختر ملف `manifest.json` من داخل المجلد:  
   `C:\Users\ahmed\Desktop\universal-router-hub\manifest.json`.
4. اذهب إلى `http://192.168.1.1`.

### 3. على متصفح Firefox Mobile (هواتف أندرويد):
* متصفح Firefox Nightly أو Firefox Beta يدعم تشغيل الإضافات وتثبيتها مباشرة عبر ميزة Custom Add-on Collection أو من خلال تصدير ملف `.zip` للإضافة وتثبيته في المتصفح، لتستمتع بالداشبورد على هاتفك في أي مكان!
