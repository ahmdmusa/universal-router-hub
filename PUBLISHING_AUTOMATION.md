# 🚀 دليل أتمتة النشر عبر جميع المنصات (Universal Router Hub)
# Multi-Platform Automated Publishing Guide

تم إعداد نظام **CI/CD متكامل** عبر **GitHub Actions** يقوم ببناء، فحص، وحزم الإضافة ونشرها تلقائياً إلى:
1. **GitHub Releases** (توليد الـ Release وحزم zip الجاهزة مع بصمات SHA256 تلقائياً).
2. **Google Chrome Web Store** (نشر تلقائي عبر Chrome Web Store API).
3. **Mozilla Firefox Add-ons - AMO** (نشر وتوقيع رقمي تلقائي للمتصفح على الكمبيوتر وموبايل أندرويد).
4. **Microsoft Edge Add-ons** (نشر تلقائي لمتجر مايكروسوفت إيدج).

---

## ⚡ طرق تشغيل النشر التلقائي (How to Trigger Release)

### الطريقة الأولى: بأمر واحد من جهازك (الأسهل والأسرع)
في مسار المشروع، قم بتشغيل الأمر التالي:
```bash
node scripts/release.js
```
أو لترقية الإصدار (Version Bump) تلقائياً والنشر:
```bash
node scripts/release.js patch   # ترقية من 1.0.0 -> 1.0.1 والنشر
node scripts/release.js minor   # ترقية من 1.0.0 -> 1.1.0 والنشر
node scripts/release.js major   # ترقية من 1.0.0 -> 2.0.0 والنشر
```
يقوم هذا السكربت تلقائياً بـ:
1. التحقق من كود الإضافة وصحة المانيفست `manifest.json`.
2. حزم ملفات الـ ZIP المخصصة لكل منصة وحساب بصمات الـ SHA256.
3. عمل `git commit` و `git tag` بالإصدار الجديد.
4. الرفع إلى GitHub (`git push` + `git push --tags`)، مما يطلق الـ GitHub Actions Workflow فوراً!

---

### الطريقة الثانية: عبر وسوم Git (Git Tags)
```bash
git tag v1.0.1
git push origin v1.0.1
```
بمجرد دفع أي Tag يبدأ بـ `v*`، يعمل الـ Workflow فوراً في الخلفية.

---

### الطريقة الثالثة: يدوياً من لوحة تحكم GitHub (1-Click Run)
1. ادخل على مستودعك: [https://github.com/ahmdmusa/universal-router-hub/actions](https://github.com/ahmdmusa/universal-router-hub/actions).
2. اختر **Multi-Platform Release & Deployment**.
3. اضغط **Run workflow**، وحدد الخيارات (Dry run للتجربة، أو النشر الفعلي للمتاجر).

---

## 🔑 إعداد مفاتيح المتاجر (Store Secrets Configuration)

كل منصة تتطلب إضافة مفاتيح API الخاصة بها إلى **GitHub Repository Secrets**.  
إذا لم تكن المفاتيح مضافة، سيتخطى النظام المنصة بهدوء وينشر الـ GitHub Release بدون أي أخطاء!

يمكنك إضافة المفاتيح مباشرة عبر **GitHub CLI** أو من صفحة:  
`https://github.com/ahmdmusa/universal-router-hub/settings/secrets/actions`

---

### 1. متجر جوجل كروم (Google Chrome Web Store)

#### البيانات المطلوبة:
- `CHROME_EXTENSION_ID`: معرّف الإضافة في سوق كروم (يظهر في رابط الإضافة بعد أول رفع يدوي).
- `CHROME_CLIENT_ID`: من Google Cloud Console.
- `CHROME_CLIENT_SECRET`: من Google Cloud Console.
- `CHROME_REFRESH_TOKEN`: كود التحديث لـ OAuth2.

#### خطوات الاستخراج:
1. افتح [Google Cloud Console](https://console.cloud.google.com/) وأنشئ مشروعاً جديداً.
2. فعّل مكتبة **Chrome Web Store API**.
3. في شاشة **OAuth consent screen**، اختر نوع التطبيق **External**.
4. في **Credentials**، أنشئ **OAuth 2.0 Client IDs** (النوع: Desktop App أو Web Application).
5. احصل على الـ `Refresh Token` باتباع الدليل الرسمي لكروم أو باستخدام أداة `chrome-webstore-upload-keys`.

#### إضافة الأسرار بأمر GitHub CLI:
```bash
gh secret set CHROME_EXTENSION_ID --body "معرف_الاضافة_هنا"
gh secret set CHROME_CLIENT_ID --body "client_id_هنا"
gh secret set CHROME_CLIENT_SECRET --body "client_secret_هنا"
gh secret set CHROME_REFRESH_TOKEN --body "refresh_token_هنا"
```

---

### 2. متجر موزيلا فايرفوكس (Mozilla Firefox Add-ons AMO)

يدعم أجهزة الكمبيوتر وهواتف أندرويد (Firefox Mobile).

#### البيانات المطلوبة:
- `FIREFOX_API_KEY`: الـ JWT issuer key.
- `FIREFOX_API_SECRET`: الـ JWT secret.

#### خطوات الاستخراج:
1. سجل دخولك على [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/addon/api/key/).
2. انتقل إلى **Manage API Keys**.
3. اضغط على **Generate new credentials**.
4. انسخ كل من **JWT issuer (Key)** و **JWT secret**.

#### إضافة الأسرار بأمر GitHub CLI:
```bash
gh secret set FIREFOX_API_KEY --body "your-jwt-issuer-key"
gh secret set FIREFOX_API_SECRET --body "your-jwt-secret"
```

---

### 3. متجر مايكروسوفت إيدج (Microsoft Edge Add-ons)

#### البيانات المطلوبة:
- `EDGE_PRODUCT_ID`: معرّف الإضافة في لوحة Microsoft Partner Center.
- `EDGE_CLIENT_ID`: معرّف العميل لتطبيق Azure AD.
- `EDGE_CLIENT_SECRET`: كلمة سر Azure AD App.
- `EDGE_ACCESS_TOKEN_URL`: رابط المصادقة من Azure AD.

#### خطوات الاستخراج:
1. ادخل إلى [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge).
2. في إعدادات المطور، انتقل إلى **API access** وأنشئ Azure Active Directory Application.
3. انسخ الـ Client ID و Client Secret و Access Token URL.

#### إضافة الأسرار بأمر GitHub CLI:
```bash
gh secret set EDGE_PRODUCT_ID --body "your-product-id"
gh secret set EDGE_CLIENT_ID --body "your-client-id"
gh secret set EDGE_CLIENT_SECRET --body "your-client-secret"
gh secret set EDGE_ACCESS_TOKEN_URL --body "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token"
```

---

## 📂 الحزم الناتجة في كل عملية بناء (Build Artifacts)

يقوم السكربت `scripts/package.js` بإنتاج حزم مهيأة خصيصاً لكل متجر داخل مجلد `dist/`:

| اسم الحزمة | الغرض والمنصة | الخصائص |
|:---|:---|:---|
| `universal-router-hub-v1.0.0.zip` | الحزمة الشاملة العامة | تعمل على جميع المتصفحات |
| `universal-router-hub-chrome-v1.0.0.zip` | متجر Chrome Web Store | متوافقة مع شروط فحص جوجل الصارمة |
| `universal-router-hub-firefox-v1.0.0.zip` | متجر Firefox AMO | تتضمن إعدادات معرّف Gecko لموزيلا |
| `universal-router-hub-edge-v1.0.0.zip` | متجر Microsoft Edge | مخصصة لمتجر مايكروسوفت |
| `SHA256SUMS.txt` | ملف البصمات الأمنية | للتحقق من سلامة وعدم تلاعب الحزم |

---

## 🛠️ أدوات التطوير المحلية المتاحة (Local Commands)

| الأمر | الوظيفة |
|:---|:---|
| `node scripts/validate.js` | فحص سلامة الملفات والأكواد والمانيفست محلياً |
| `node scripts/package.js` | حزمة ملفات الـ ZIP في مجلد `dist/` |
| `node scripts/bump-version.js [patch\|minor\|major]` | ترقية رقم الإصدار في `manifest.json` و `package.json` |
| `node scripts/release.js` | تشغيل دورة النشر الكاملة بنقرة واحدة |
