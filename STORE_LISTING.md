# 🛒 Store Listing & Publishing Guide
## Universal Router Hub (NextGen Dashboard)

This document contains everything needed to publish **Universal Router Hub** to the **Chrome Web Store**, **Firefox Add-ons (AMO)**, and **Microsoft Edge Add-ons**.

---

## 1. Extension Basic Info

* **Extension Name (English)**: Universal Router Hub - NextGen Dashboard & Speed Limiter
* **اسم الإضافة (العربية)**: Universal Router Hub - الداشبورد الموحد لراوترات مصر وتحديد السرعة
* **Category**: Productivity / Network Tools / Utilities
* **Default Language**: Arabic / English (Bilingual)
* **Website**: https://github.com/ahmed/universal-router-hub
* **Target Platforms**: 
  * Google Chrome / Brave / Edge (Manifest V3)
  * Mozilla Firefox Desktop (WebExtensions)
  * Mozilla Firefox for Android (Mobile Add-on)

---

## 2. Short Descriptions (Max 132 Characters)

* **English**:
  > Transform your slow, legacy router UI into a fast, modern glassmorphism dashboard with 1-click quota saving and family safety DNS.
* **العربية**:
  > حوّل صفحة راوترك القديمة لداشبورد عصري وسريع مع كشف ذكي وتحديد للسرعة لتوفير الباقة وحظر المحتوى الإباحي والضار بنقرة واحدة.

---

## 3. Detailed Store Description (English)

```markdown
Transform any home or office router interface into a responsive, high-speed, glassmorphism dashboard with intelligent hardware auto-detection, universal quota-saving speed limiter, and family safety protection.

🚀 KEY FEATURES:
• Smart Router Auto-Detection: Automatically detects router brand and model upon visiting 192.168.1.1, 192.168.0.1, or 192.168.8.1 (D-Link, ZTE, Huawei, TP-Link, Tenda, Mercusys, ASUS).
• Manual Model Selector: Seamlessly switch between router profiles anytime from the top bar or popup.
• Universal 802.11 Mode Speed Limiter:
  - 🐢 11B Only (~5 Mbps): Physical link-rate throttling to prevent TikTok/4K quota drains.
  - ⚡ 11G Only (~20 Mbps): Smooth Full HD streaming without line bufferbloat.
  - 🔥 Mixed 11N/G/B: Full unrestricted speed.
• 1-Click Family Safety DNS: Built-in presets for Cloudflare Family (1.1.1.3), AdGuard Family, CleanBrowsing, and Quad9 to block phishing, scams, and adult content router-wide.
• Physical Copper VDSL Diagnostics: Live exchange MSAN telemetry (SNR Margin, Line Attenuation, and estimated distance in meters).
• Modern Login Screen: Replaces ugly router login prompts with a sleek glassmorphism card and 1-click SuperAdmin auto-fill.
• Bilingual (English / Arabic) & Dual Themes (Dark / Light).
• Mobile-First Responsive Layout: Bottom navigation bar optimized for single-handed use on Firefox for Android.

🔒 PRIVACY FIRST:
Universal Router Hub operates 100% locally within your browser and local network. It collects ZERO personal data, transmits NO analytics, and makes NO connections to external tracking servers.
```

---

## 4. Detailed Store Description (العربية)

```markdown
حوّل صفحة الراوتر الافتراضية القديمة والمعقدة (192.168.1.1) إلى لوحة تحكم عصرية فائقة السرعة بتصميم Glassmorphism المتجاوب مع الهواتف والكمبيوتر، مع ميزات حصرية للتحكم بالباقة والإنترنت.

🌟 أبرز الميزات:
• كشف تلقائي ذكي لجميع راوترات مصر والشرق الأوسط بمجرد الدخول إلى صفحة الراوتر:
  - عائلة TP-Link (Archer C6, VR600, VN020-F3, WR841N, WR940N)
  - عائلة D-Link (DSL-245GE, DSL-224, DSL-124, DSL-2750U, DIR-825)
  - عائلة ZTE / المصرية للاتصالات WE (ZXHN H168N, H188A, WE Air 5G H153, F601)
  - عائلة Huawei / فودافون / أورنج (DG8045, HG630 V2, DN8245, HG8245H, B311/B315)
  - عائلة Tenda و Mercusys و ASUS.
• محدد السرعة وتوفير الباقة الموحد (802.11 Mode Limiter):
  - 🐢 وضع 11B Only: تقييد السرعة عند ~5 Mbps لمنع استنزاف باقة WE من فيديوهات التيك توك و4K.
  - ⚡ وضع 11G Only: تقييد السرعة عند ~20 Mbps لمشاهدة Full HD ثابتة.
  - 🔥 وضع أقصى سرعة مفتوحة.
• حماية الأسرة والأطفال بنقرة واحدة:
  - تفعيل فوري لخوادم Cloudflare Family 1.1.1.3 و AdGuard Family و CleanBrowsing و Quad9 لحظر المواقع الإباحية ومواقع النصب والاحتيال والفيروسات على مستوى الراوتر بالكامل.
• كشف جودة الخط النحاسي (VDSL Line Health):
  - قراءة مباشرة لكفاءة الإشارة (SNR Margin) ومعدل التوهين وحساب المسافة عن كابينة الـ MSAN بالأمتار وأقصى سرعة يتحملها الخط.
• صفحة تسجيل دخول حديثة مع إمكانية الدخول السريع كـ SuperAdmin بنقرة واحدة.
• دعم كامل للعربية والإنجليزية مع تبديل فوري بين الوضع الفاتح والغامق (Dark / Light).
• متوافقة تماماً مع متصفح Firefox Mobile على هواتف أندرويد.

🔒 سياسة الخصوصية الصارمة:
الإضافة تعمل بنسبة 100% محلياً على جهازك وشبكتك الداخلية. لا يتم جمع أو إرسال أي بيانات أو كلمات مرور أو سجلات تصفح إلى أي خادم خارجي نهائياً.
```

---

## 5. Store Review Justification for Permissions

* **Permission: `storage`**:
  > Used to save the user's interface preferences locally in the browser (chosen language, dark/light theme, and manually selected router model).
* **Host Permissions: `192.168.*`, `10.0.0.*`**:
  > Essential to inject the modern router dashboard and communicate with the local gateway API on standard local router subnet addresses.

---

## 6. Submission Checklists

- [x] Manifest V3 compliant.
- [x] Icons generated: 16x16, 32x32, 48x48, 128x128, 512x512 PNGs.
- [x] No `eval()` or remote script execution (passes strict CSP).
- [x] Zero tracking / analytics.
- [x] Firefox Gecko ID declared (`universal-router-hub@egypt.net`).
- [x] Package ready as `.zip`.
