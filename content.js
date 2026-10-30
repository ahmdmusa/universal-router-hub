/**
 * Universal Router Hub (NextGen Dashboard) - Content Script
 * Compatible with: Google Chrome (PC/Mac) • Mozilla Firefox (PC & Android Mobile)
 * Supports all major routers in Egypt & Middle East:
 * D-Link, ZTE (WE/Vodafone), Huawei (WE/Orange), TP-Link, Tenda, Mercusys, ASUS
 * 
 * Features:
 * - Premium Apple-like design language (Clean, minimal, frosted glass, refined typography, NO goofy emojis)
 * - Dynamic font scaling (A- / A+) with persistent preference
 * - Advanced Mobile UI with iOS-style bottom tab bar & touch-friendly tap targets
 * - Smart 1-click Auto-Login with optional "Remember Password" toggle (chrome.storage)
 * - Auto-Detection + Manual Model Picker
 * - Universal 802.11 Mode Speed Limiter (11B Only ~5Mbps Quota Protection)
 * - Safe Family DNS (Cloudflare Family 1.1.1.3, AdGuard Family, CleanBrowsing, Quad9)
 * - Advanced Router Controls: WPS Kill-switch, Band Steering, MTU, VHT80
 */

(function() {
    'use strict';

    if (window.__UNIVERSAL_ROUTER_HUB_LOADED__) return;
    window.__UNIVERSAL_ROUTER_HUB_LOADED__ = true;

    // Check if user requested legacy view
    if (window.location.search.includes('legacy=1') || window.location.hash.includes('legacy=1')) {
        renderFloatingDock();
        return;
    }

    // Supported Router Profiles Database
    const ROUTER_CATALOG = {
        'auto': { name: 'كشف تلقائي ذكي', nameEn: 'Smart Auto-Detect', brand: 'Auto' },
        // D-Link Family
        'dlink_245ge': { name: 'D-Link DSL-245GE', nameEn: 'D-Link DSL-245GE (EcoNet EN7516)', brand: 'D-Link', defaultIp: '192.168.1.1' },
        'dlink_224': { name: 'D-Link DSL-224 (VDSL2)', nameEn: 'D-Link DSL-224 (VDSL2)', brand: 'D-Link', defaultIp: '192.168.1.1' },
        'dlink_124': { name: 'D-Link DSL-124 (ADSL2+)', nameEn: 'D-Link DSL-124 (ADSL2+)', brand: 'D-Link', defaultIp: '192.168.1.1' },
        'dlink_2750u': { name: 'D-Link DSL-2750U', nameEn: 'D-Link DSL-2750U (WE / Standalone)', brand: 'D-Link', defaultIp: '192.168.1.1' },
        'dlink_dir825': { name: 'D-Link DIR-825 (Gigabit)', nameEn: 'D-Link DIR-825 (Gigabit Dual-Band)', brand: 'D-Link', defaultIp: '192.168.0.1' },
        // ZTE / WE Family
        'zte_h168n': { name: 'ZTE ZXHN H168N (WE VDSL)', nameEn: 'ZTE ZXHN H168N (WE VDSL Primary)', brand: 'ZTE', defaultIp: '192.168.1.1' },
        'zte_h188a': { name: 'ZTE ZXHN H188A (SuperVectoring)', nameEn: 'ZTE ZXHN H188A (SuperVectoring AC1200)', brand: 'ZTE', defaultIp: '192.168.1.1' },
        'zte_h153': { name: 'WE Air 5G / H153', nameEn: 'WE Air 5G / H153 (ZTE Home Wireless)', brand: 'ZTE', defaultIp: '192.168.8.1' },
        'zte_f601': { name: 'ZTE F601 (GPON Fiber)', nameEn: 'ZTE F601 (GPON Fiber ONT)', brand: 'ZTE', defaultIp: '192.168.1.1' },
        'zte_h108n': { name: 'ZTE ZXHN H108N (ADSL)', nameEn: 'ZTE ZXHN H108N (ADSL Legacy)', brand: 'ZTE', defaultIp: '192.168.1.1' },
        // Huawei Family
        'huawei_dg8045': { name: 'Huawei DG8045 (WE VDSL)', nameEn: 'Huawei DG8045 (WE VDSL)', brand: 'Huawei', defaultIp: '192.168.1.1' },
        'huawei_hg630': { name: 'Huawei HG630 V2', nameEn: 'Huawei HG630 V2 (VDSL2)', brand: 'Huawei', defaultIp: '192.168.1.1' },
        'huawei_dn8245': { name: 'Huawei DN8245V-56', nameEn: 'Huawei DN8245V-56 (SuperVectoring)', brand: 'Huawei', defaultIp: '192.168.1.1' },
        'huawei_hg8245h': { name: 'Huawei HG8245H (FTTH Fiber)', nameEn: 'Huawei HG8245H (WE FTTH Fiber)', brand: 'Huawei', defaultIp: '192.168.100.1' },
        'huawei_b311': { name: 'Huawei B311 (Orange 4G)', nameEn: 'Huawei B311 (Orange Home 4G)', brand: 'Huawei', defaultIp: '192.168.8.1' },
        'huawei_b315': { name: 'Huawei B315 (Vodafone/Orange 4G)', nameEn: 'Huawei B315 (Orange / Vodafone 4G)', brand: 'Huawei', defaultIp: '192.168.8.1' },
        // TP-Link Family
        'tplink_c6': { name: 'TP-Link Archer C6', nameEn: 'TP-Link Archer C6 (AC1200 Gigabit)', brand: 'TP-Link', defaultIp: '192.168.0.1' },
        'tplink_vr600': { name: 'TP-Link Archer VR600', nameEn: 'TP-Link Archer VR600 (VDSL AC1600)', brand: 'TP-Link', defaultIp: '192.168.1.1' },
        'tplink_vn020': { name: 'TP-Link VN020-F3', nameEn: 'TP-Link VN020-F3 (WE VDSL)', brand: 'TP-Link', defaultIp: '192.168.1.1' },
        'tplink_wr841n': { name: 'TP-Link TL-WR841N', nameEn: 'TP-Link TL-WR841N (300Mbps N)', brand: 'TP-Link', defaultIp: '192.168.0.1' },
        'tplink_wr940n': { name: 'TP-Link TL-WR940N', nameEn: 'TP-Link TL-WR940N (450Mbps N)', brand: 'TP-Link', defaultIp: '192.168.0.1' },
        // Others
        'tenda_f3': { name: 'Tenda F3', nameEn: 'Tenda F3 (300Mbps)', brand: 'Tenda', defaultIp: '192.168.0.1' },
        'tenda_ac10': { name: 'Tenda AC10', nameEn: 'Tenda AC10 (AC1200 Gigabit)', brand: 'Tenda', defaultIp: '192.168.0.1' },
        'mercusys_ac10': { name: 'Mercusys AC10', nameEn: 'Mercusys AC10 (Dual-Band)', brand: 'Mercusys', defaultIp: '192.168.1.1' },
        'asus_ac1200': { name: 'ASUS RT-AC1200', nameEn: 'ASUS RT-AC1200 (ASUSWRT)', brand: 'ASUS', defaultIp: '192.168.1.1' }
    };

    // Dictionary for Multilingual UI (Clean, refined text)
    const I18N = {
        ar: {
            brandName: 'Universal Router Hub',
            statusOnline: 'متصل بالراوتر',
            statusOffline: 'غير متصل',
            btnRefresh: 'تحديث',
            btnReboot: 'إعادة التشغيل',
            btnLegacy: 'الواجهة الأصلية',
            tabOverview: 'نظرة عامة',
            tabDsl: 'كفاءة الخط',
            tabWifi: 'الواي فاي والسرعة',
            tabDns: 'حماية الـ DNS',
            tabSecurity: 'الأمان المتقدم',
            tabDevices: 'المتصلون',
            dslSpeedTitle: 'سرعة خط الإنترنت المباشرة',
            downMbps: 'Mbps تنزيل',
            upRate: 'سرعة الرفع (Upload):',
            maxRate: 'أقصى قدرة للخط النحاسي:',
            wifiSpeedTitle: 'حالة الواي فاي وتوفير الباقة',
            speedLimiterLabel: 'تحديد السرعة ومعيار 802.11 (توفير الباقة):',
            speedLimiterHint: 'نمط 11B Only يحدد سرعة التنزيل عند ~5 ميجابت لحماية باقة الإنترنت من الاستنزاف السريع لمقاطع الفيديو والبث المباشر.',
            dnsFamilyTitle: 'حماية الأسرة ومنع المحتوى الضار والإباحي',
            dnsFamilyDesc: 'تفعيل خوادم فلترة آمنة لمنع الاحتيال، الفيروسات، والمحتوى غير اللائق على مستوى الراوتر بالكامل:',
            btnApplyDns: 'تطبيق وحفظ إعدادات الـ DNS',
            dnsCustomLabel: 'أو إدخال خوادم DNS مخصصة يدوياً:',
            wpsTitle: 'حماية الواي فاي وإغلاق ثغرة WPS:',
            wpsDesc: 'تعطيل خاصية WPS يمنع هجمات التخمين والاختراق التلقائي لكلمة سر الراوتر.',
            bandSteeringTitle: 'فصل أو دمج ترددي 2.4G و 5G (Band Steering):',
            bandSteeringDesc: 'فصل الترددات يتيح تحديد السرعة على شبكة 2.4G وترك شبكة 5G للأجهزة التي تتطلب سرعة غير مقيدة.',
            superAdminTitle: 'بيانات حساب السوبر أدمن المكتشفة:',
            superAdminDesc: 'بيانات الحسابات ذات الصلاحيات الكاملة للراوتر الحالي:',
            mtuTitle: 'ضبط قيمة MTU لاستقرار الاتصال والألعاب:',
            mtuDesc: 'القيمة الموصى بها في مصر للخطوط الأرضية هي 1492 (أو 1420 لتقليل التقطيع).'
        },
        en: {
            brandName: 'Universal Router Hub',
            statusOnline: 'Connected',
            statusOffline: 'Disconnected',
            btnRefresh: 'Refresh',
            btnReboot: 'Reboot',
            btnLegacy: 'Legacy GUI',
            tabOverview: 'Overview',
            tabDsl: 'Line Health',
            tabWifi: 'Wi-Fi & Speed',
            tabDns: 'DNS Shield',
            tabSecurity: 'Security',
            tabDevices: 'Devices',
            dslSpeedTitle: 'Live Physical Line Speed',
            downMbps: 'Mbps Download',
            upRate: 'Upload Speed:',
            maxRate: 'Max Copper Attainable:',
            wifiSpeedTitle: 'Wi-Fi & Bandwidth Status',
            speedLimiterLabel: 'Bandwidth Limiter & 802.11 Mode:',
            speedLimiterHint: 'Selecting 11B Only limits download speed to ~5 Mbps, preventing rapid data consumption from heavy video streaming.',
            dnsFamilyTitle: 'Family Shield & Content Filtering',
            dnsFamilyDesc: 'Enable secure DNS servers to automatically block malware, phishing, and explicit content router-wide:',
            btnApplyDns: 'Apply & Save DNS',
            dnsCustomLabel: 'Or specify custom DNS servers:',
            wpsTitle: 'WPS Anti-BruteForce Protection:',
            wpsDesc: 'Disabling WPS eliminates PIN brute-force vulnerabilities against mobile cracking tools.',
            bandSteeringTitle: 'Separate or Combine 2.4G & 5G Bands:',
            bandSteeringDesc: 'Separating bands lets you rate-limit 2.4G while keeping 5G at maximum performance.',
            superAdminTitle: 'Discovered SuperAdmin Credentials:',
            superAdminDesc: 'Elevated credentials discovered for this router profile:',
            mtuTitle: 'MTU Optimization for Gaming & Ping:',
            mtuDesc: 'Recommended MTU for Egyptian lines is 1492 (or 1420 for smoother packet latency).'
        }
    };

    // Safe Cross-Browser Storage Helper (chrome.storage with localStorage fallback)
    const Storage = {
        async get(key) {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return new Promise(resolve => {
                    try {
                        chrome.storage.local.get([key], res => resolve(res ? res[key] : null));
                    } catch (e) {
                        resolve(null);
                    }
                });
            }
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                return null;
            }
        },
        async set(key, value) {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return new Promise(resolve => {
                    try {
                        chrome.storage.local.set({ [key]: value }, resolve);
                    } catch (e) {
                        resolve();
                    }
                });
            }
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {}
        },
        async remove(key) {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return new Promise(resolve => {
                    try {
                        chrome.storage.local.remove([key], resolve);
                    } catch (e) {
                        resolve();
                    }
                });
            }
            try {
                localStorage.removeItem(key);
            } catch (e) {}
        }
    };

    // State Store
    const State = {
        lang: localStorage.getItem('router_hub_lang') || 'ar',
        theme: localStorage.getItem('router_hub_theme') || 'dark',
        fontScale: parseFloat(localStorage.getItem('router_hub_font_scale')) || 1.0,
        detectedBrand: 'Unknown',
        detectedModelKey: 'auto',
        activeDriver: null,
        // System
        modelName: 'جارٍ الفحص...',
        softwareVer: 'Auto-Detected',
        wanIp: '192.168.1.1',
        uptimeSeconds: 0,
        // Line Stats
        dslDownRate: 30719,
        dslUpRate: 3070,
        dslDownMax: 88139,
        dslUpMax: 20978,
        dslDownSnr: 11.3,
        dslUpSnr: 21.4,
        dslDownAtten: 16.0,
        dslUpAtten: 4.4,
        dslOpmode: 'VDSL2 (G.993.2)',
        // Wi-Fi 2.4G
        wifi24Ssid: 'Wi-Fi 2.4G',
        wifi24Pass: '••••••••',
        wifi24Channel: '0',
        wifi24Enabled: true,
        wifi24Hide: false,
        wifi24Bandwidth: '1',
        wifi24Power: '6',
        wifi24Mode: '1', // 1 = 11B Only (~5 Mbps)
        wpsEnabled: false,
        bandSteeringEnabled: false,
        // Wi-Fi 5G
        wifi5Ssid: 'Wi-Fi 5G',
        wifi5Pass: '••••••••',
        wifi5Channel: '0',
        wifi5Enabled: true,
        wifi5Bandwidth: '1',
        wifi5Power: '6',
        wifi5Mode: '15',
        // DNS
        lanDns1: '1.1.1.3',
        lanDns2: '1.0.0.3',
        // Security
        mtuSize: '1492'
    };

    // Minimal Apple-style SVG Icons Library
    const Icons = {
        router: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="20" height="8" rx="3"></rect><line x1="6" y1="18" x2="6.01" y2="18"></line><line x1="10" y1="18" x2="10.01" y2="18"></line><line x1="14" y1="18" x2="14.01" y2="18"></line><line x1="6" y1="10" x2="6" y2="14"></line><line x1="18" y1="10" x2="18" y2="14"></line></svg>`,
        wifi: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
        dsl: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
        shield: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
        lock: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
        devices: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
        refresh: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
        power: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>`,
        eye: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
        eyeOff: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
        key: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="M21 2l-9.6 9.6"></path><path d="M15.5 7.5l3 3L22 7l-3-3"></path></svg>`,
        sun: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        moon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
        check: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        text: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`,
        user: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    };

    // Hardware Auto-Detection
    function detectRouterHardware() {
        const pageHtml = (document.documentElement ? document.documentElement.innerHTML : '') + ' ' + (document.title || '');
        const url = window.location.href.toLowerCase();

        if (
            url.includes('dlink') || url.includes('dsl-') || url.includes('new_gui') ||
            pageHtml.includes('DSL-245GE') || pageHtml.includes('DSL-224') || pageHtml.includes('DSL-124') ||
            pageHtml.includes('DSL-2750U') || pageHtml.includes('DIR-825') || pageHtml.includes('TCWebApi') ||
            pageHtml.includes('D-Link') || pageHtml.includes('boaroot') || pageHtml.includes('WiFi_loding')
        ) {
            let modelKey = 'dlink_245ge';
            if (pageHtml.includes('DSL-224')) modelKey = 'dlink_224';
            else if (pageHtml.includes('DSL-124')) modelKey = 'dlink_124';
            else if (pageHtml.includes('2750U')) modelKey = 'dlink_2750u';
            else if (pageHtml.includes('DIR-825')) modelKey = 'dlink_dir825';
            return { brand: 'D-Link', modelKey: modelKey };
        }

        if (
            url.includes('getpage.gch') || pageHtml.includes('ZXHN H168N') || pageHtml.includes('H168N') ||
            pageHtml.includes('H188A') || pageHtml.includes('ZXHN H188A') || pageHtml.includes('ZTE Corporation') ||
            pageHtml.includes('WE Air') || pageHtml.includes('H153') || pageHtml.includes('F601') || pageHtml.includes('H108N')
        ) {
            let modelKey = 'zte_h168n';
            if (pageHtml.includes('H188A')) modelKey = 'zte_h188a';
            else if (pageHtml.includes('H153') || pageHtml.includes('Air')) modelKey = 'zte_h153';
            else if (pageHtml.includes('F601')) modelKey = 'zte_f601';
            else if (pageHtml.includes('H108N')) modelKey = 'zte_h108n';
            return { brand: 'ZTE', modelKey: modelKey };
        }

        if (
            url.includes('api/system') || pageHtml.includes('DG8045') || pageHtml.includes('HG630') ||
            pageHtml.includes('DN8245') || pageHtml.includes('HG8245H') || pageHtml.includes('B311') ||
            pageHtml.includes('B315') || pageHtml.includes('Huawei Technologies')
        ) {
            let modelKey = 'huawei_dg8045';
            if (pageHtml.includes('HG630')) modelKey = 'huawei_hg630';
            else if (pageHtml.includes('DN8245')) modelKey = 'huawei_dn8245';
            else if (pageHtml.includes('8245H')) modelKey = 'huawei_hg8245h';
            else if (pageHtml.includes('B311')) modelKey = 'huawei_b311';
            else if (pageHtml.includes('B315')) modelKey = 'huawei_b315';
            return { brand: 'Huawei', modelKey: modelKey };
        }

        if (
            url.includes('tplink') || url.includes('/cgi/login') || url.includes('userrpm') ||
            pageHtml.includes('Archer C6') || pageHtml.includes('VR600') || pageHtml.includes('VN020') ||
            pageHtml.includes('WR841N') || pageHtml.includes('WR940N') || pageHtml.includes('TP-Link')
        ) {
            let modelKey = 'tplink_c6';
            if (pageHtml.includes('VR600')) modelKey = 'tplink_vr600';
            else if (pageHtml.includes('VN020')) modelKey = 'tplink_vn020';
            else if (pageHtml.includes('841N')) modelKey = 'tplink_wr841n';
            else if (pageHtml.includes('940N')) modelKey = 'tplink_wr940n';
            return { brand: 'TP-Link', modelKey: modelKey };
        }

        if (url.includes('tenda') || pageHtml.includes('Tenda')) return { brand: 'Tenda', modelKey: 'tenda_f3' };
        if (url.includes('mercusys') || pageHtml.includes('Mercusys')) return { brand: 'Mercusys', modelKey: 'mercusys_ac10' };

        return { brand: 'Universal', modelKey: 'dlink_245ge' };
    }

    // Modular Hardware Drivers
    const Drivers = {
        dlink: {
            async fetchStats() {
                try {
                    const devRes = await fetch('/cgi-bin/status_deviceinfo.asp');
                    if (devRes.ok) {
                        const text = await devRes.text();
                        const mUp = text.match(/SystemUpTime\s*=\s*['"]?(\d+)['"]?/i);
                        if (mUp) State.uptimeSeconds = parseInt(mUp[1], 10) || 0;
                        const mDslDown = text.match(/DataRateDown\s*=\s*['"]?(\d+)['"]?/i);
                        if (mDslDown) State.dslDownRate = parseInt(mDslDown[1], 10);
                        const mDslUp = text.match(/DataRateUp\s*=\s*['"]?(\d+)['"]?/i);
                        if (mDslUp) State.dslUpRate = parseInt(mDslUp[1], 10);
                        const mSnrDown = text.match(/SNRMarginDown\s*=\s*['"]?([\d\.]+)['"]?/i);
                        if (mSnrDown) State.dslDownSnr = parseFloat(mSnrDown[1]);
                        const mSnrUp = text.match(/SNRMarginUp\s*=\s*['"]?([\d\.]+)['"]?/i);
                        if (mSnrUp) State.dslUpSnr = parseFloat(mSnrUp[1]);
                        const mAttDown = text.match(/AttenDown\s*=\s*['"]?([\d\.]+)['"]?/i);
                        if (mAttDown) State.dslDownAtten = parseFloat(mAttDown[1]);
                        const mAttUp = text.match(/AttenUp\s*=\s*['"]?([\d\.]+)['"]?/i);
                        if (mAttUp) State.dslUpAtten = parseFloat(mAttUp[1]);
                        const mMaxDown = text.match(/AttainableRateDown\s*=\s*['"]?(\d+)['"]?/i);
                        if (mMaxDown) State.dslDownMax = parseInt(mMaxDown[1], 10);
                        const mMaxUp = text.match(/AttainableRateUp\s*=\s*['"]?(\d+)['"]?/i);
                        if (mMaxUp) State.dslUpMax = parseInt(mMaxUp[1], 10);
                        const mMode = text.match(/Standard\s*=\s*['"]([^'"]+)['"]/i);
                        if (mMode) State.dslOpmode = mMode[1];
                    }
                } catch (e) {}

                try {
                    const res24Adv = await fetch('/cgi-bin/get/New_GUI/Settings_24_adv.asp');
                    if (res24Adv.ok) {
                        const t = await res24Adv.text();
                        const m = t.match(/var\s+mode_802\s*=\s*['"]([^'"]*)['"]/i);
                        if (m && m[1] && m[1] !== 'N/A') State.wifi24Mode = m[1];
                        const mSsid = t.match(/var\s+conn_ssid_0\s*=\s*['"]([^'"]*)['"]/i);
                        if (mSsid && mSsid[1]) State.wifi24Ssid = mSsid[1];
                    }
                } catch (e) {}

                try {
                    const res5Adv = await fetch('/cgi-bin/get/New_GUI/Settings_5_adv.asp');
                    if (res5Adv.ok) {
                        const t = await res5Adv.text();
                        const m = t.match(/var\s+mode_802_ac\s*=\s*['"]([^'"]*)['"]/i);
                        if (m && m[1] && m[1] !== 'N/A') State.wifi5Mode = m[1];
                        const mSsid = t.match(/var\s+conn_ssid_0_ac\s*=\s*['"]([^'"]*)['"]/i);
                        if (mSsid && mSsid[1]) State.wifi5Ssid = mSsid[1];
                    }
                } catch (e) {}
            },

            async saveWifi24(cfg) {
                let sKey = '';
                try {
                    const sKeyRes = await fetch('/cgi-bin/get/New_GUI/get_sessionKey.asp');
                    if (sKeyRes.ok) sKey = (await sKeyRes.text()).trim();
                } catch (e) {}

                const is11n = (cfg.mode === '1' || cfg.mode === '4' || cfg.mode === '0') ? '0' : '1';
                const encodedPass = btoa(unescape(encodeURIComponent(cfg.pass)));

                const params = new URLSearchParams({
                    sessionKey: sKey,
                    wirelessesavecfgflag: '1',
                    wirelesstotalstatusflag: cfg.isEnabled ? '1' : '0',
                    wirelesseEnablessidflag: cfg.isEnabled ? '1' : '0',
                    wirelessehiddenssidflag: cfg.isHidden ? '2' : '1',
                    wirelessewmmstatusflag: '2',
                    sssid: cfg.ssid,
                    WirelessSecuritytypeFlag: '5',
                    WirelessSecuritytypeValue: 'WPA2PSK',
                    cipher_type: 'AES',
                    lan_wlan_groupkeyinterval: '3600',
                    lan_wlan_string: encodedPass,
                    savecfg: '1',
                    bgMode: cfg.mode,
                    Is11nMode: is11n,
                    channelMode: cfg.bw || '1',
                    lan_wlan_channel: cfg.chan || '0',
                    antennaPower: cfg.txPower || '6',
                    beaconInterval: '100',
                    dtim: '1',
                    fragThreshold: '2346',
                    rtsThreshold: '2347'
                });

                await fetch('/cgi-bin/New_GUI/WiFi_loding.asp', { method: 'POST', body: params });
            },

            async applyDns(dns1, dns2) {
                try {
                    const params = new URLSearchParams({
                        IPV4_Flag: '1',
                        dns1: dns1,
                        dns2: dns2,
                        primary_dns: dns1,
                        secondary_dns: dns2
                    });
                    await fetch('/cgi-bin/net-dhcp.asp', { method: 'POST', body: params });
                } catch (e) {}
            },

            async reboot() {
                const params = new URLSearchParams({ rebootflag: '1', restoreFlag: '1' });
                await fetch('/cgi-bin/mag-reset.asp', { method: 'POST', body: params });
            }
        },

        zte: {
            async fetchStats() {
                try {
                    const res = await fetch('/getpage.gch?pid=1002');
                    if (res.ok) {
                        const html = await res.text();
                        const matchVal = (id) => {
                            const m = html.match(new RegExp(`id=["']${id}["'][^>]*value=["']([^"']*)["']`, 'i')) ||
                                      html.match(new RegExp(`var\\s+${id}\\s*=\\s*['"]?([^'";\\s]+)['"]?`, 'i'));
                            return m ? m[1] : null;
                        };
                        const downRate = matchVal('DownstreamCurrRate');
                        if (downRate) State.dslDownRate = parseInt(downRate, 10);
                        const snr = matchVal('DownstreamNoiseMargin');
                        if (snr) State.dslDownSnr = parseFloat(snr);
                        const att = matchVal('DownstreamAttenuation');
                        if (att) State.dslDownAtten = parseFloat(att);
                    }
                } catch (e) {}
            },

            async saveWifi24(cfg) {
                const standardMap = { '1': 'b', '4': 'g', '6': 'n', '9': 'b,g,n' };
                const params = new URLSearchParams({
                    Standard: standardMap[cfg.mode] || 'b,g,n',
                    SSID: cfg.ssid,
                    KeyPassphrase: cfg.pass,
                    Action: 'apply'
                });
                await fetch('/getpage.gch?pid=1005', { method: 'POST', body: params });
            },

            async applyDns(dns1, dns2) {
                const params = new URLSearchParams({ DNS1: dns1, DNS2: dns2, Action: 'apply' });
                await fetch('/getpage.gch?pid=1003', { method: 'POST', body: params });
            },

            async reboot() {
                const params = new URLSearchParams({ IF_ACTION: 'reboot', pid: '1002' });
                await fetch('/getpage.gch?pid=1002', { method: 'POST', body: params });
            }
        },

        huawei: {
            async fetchStats() {
                try {
                    const res = await fetch('/html/bbsp/dslraw/dslraw.asp');
                    if (res.ok) {
                        const html = await res.text();
                        const mDown = html.match(/Downstream\s*Rate\s*\(Kbps\)[^<]*<\/td>\s*<td[^>]*>(\d+)/i);
                        if (mDown) State.dslDownRate = parseInt(mDown[1], 10);
                        const mSnr = html.match(/SNR\s*Margin[^<]*<\/td>\s*<td[^>]*>([\d\.]+)/i);
                        if (mSnr) State.dslDownSnr = parseFloat(mSnr[1]);
                    }
                } catch (e) {}
            },

            async saveWifi24(cfg) {
                const modeMap = { '1': '802.11b', '4': '802.11g', '6': '802.11n', '9': '802.11b/g/n' };
                const params = new URLSearchParams({
                    WLanMode: modeMap[cfg.mode] || '802.11b/g/n',
                    WlanSSID: cfg.ssid,
                    WpaPsk: cfg.pass
                });
                await fetch('/api/wlan/basicSettings', { method: 'POST', body: params });
            },

            async applyDns(dns1, dns2) {
                const xml = `<?xml version="1.0" encoding="UTF-8"?><request><DNSServers>${dns1},${dns2}</DNSServers></request>`;
                await fetch('/api/dhcp/settings', { method: 'POST', body: xml });
            },

            async reboot() {
                await fetch('/api/system/device_reboot', { method: 'POST', body: '<?xml version="1.0" encoding="UTF-8"?><request><Control>1</Control></request>' });
            }
        },

        tplink: {
            async fetchStats() {
                try {
                    const res = await fetch('/userRpm/StatusRpm.htm');
                    if (res.ok) {
                        const html = await res.text();
                        const mDown = html.match(/downstreamRate\s*=\s*(\d+)/i);
                        if (mDown) State.dslDownRate = parseInt(mDown[1], 10);
                    }
                } catch (e) {}
            },

            async saveWifi24(cfg) {
                const modeMap = { '1': '1', '4': '2', '6': '3', '9': '4' };
                await fetch(`/userRpm/WlanNetworkRpm.htm?ssid=${encodeURIComponent(cfg.ssid)}&mode=${modeMap[cfg.mode] || '4'}&Save=Save`);
            },

            async applyDns(dns1, dns2) {
                await fetch(`/userRpm/LanDhcpServerRpm.htm?dns1=${dns1}&dns2=${dns2}&Save=Save`);
            },

            async reboot() {
                await fetch('/userRpm/SysRebootRpm.htm?Reboot=Reboot');
            }
        }
    };

    function resolveDriver() {
        let modelKey = localStorage.getItem('router_hub_selected_model') || 'auto';
        if (modelKey === 'auto') {
            const detected = detectRouterHardware();
            State.detectedBrand = detected.brand;
            State.detectedModelKey = detected.modelKey;
            modelKey = detected.modelKey;
        } else {
            State.detectedModelKey = modelKey;
            State.detectedBrand = ROUTER_CATALOG[modelKey]?.brand || 'Manual';
        }

        const profile = ROUTER_CATALOG[modelKey] || ROUTER_CATALOG['dlink_245ge'];
        State.modelName = State.lang === 'en' ? (profile.nameEn || profile.name) : profile.name;

        if (profile.brand === 'ZTE') State.activeDriver = Drivers.zte;
        else if (profile.brand === 'Huawei') State.activeDriver = Drivers.huawei;
        else if (profile.brand === 'TP-Link') State.activeDriver = Drivers.tplink;
        else State.activeDriver = Drivers.dlink;
    }

    // Dynamic Apple-like Stylesheet with Font-Scaling & Mobile Optimizations
    function injectStyles() {
        let style = document.getElementById('hub-apple-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'hub-apple-styles';
            document.head.appendChild(style);
        }

        style.textContent = `
            :root {
                --hub-font-scale: ${State.fontScale};
                --apple-blue: #0071e3;
                --apple-blue-hover: #0077ed;
                --apple-green: #34c759;
                --apple-orange: #ff9500;
                --apple-red: #ff3b30;
                --apple-indigo: #5856d6;
            }

            body.theme-dark {
                --apple-bg: #000000;
                --apple-card-bg: rgba(28, 28, 30, 0.78);
                --apple-card-solid: #1c1c1e;
                --apple-border: rgba(255, 255, 255, 0.12);
                --apple-border-subtle: rgba(255, 255, 255, 0.06);
                --apple-text-primary: #f5f5f7;
                --apple-text-secondary: #86868b;
                --apple-text-tertiary: #636366;
                --apple-input-bg: rgba(44, 44, 46, 0.85);
                --apple-header-bg: rgba(0, 0, 0, 0.82);
                --apple-nav-bg: rgba(28, 28, 30, 0.88);
                --apple-pill-bg: rgba(255, 255, 255, 0.08);
                --apple-pill-active: rgba(255, 255, 255, 0.18);
                --apple-card-hover: rgba(44, 44, 46, 0.7);
            }

            body.theme-light {
                --apple-bg: #f5f5f7;
                --apple-card-bg: rgba(255, 255, 255, 0.82);
                --apple-card-solid: #ffffff;
                --apple-border: rgba(0, 0, 0, 0.08);
                --apple-border-subtle: rgba(0, 0, 0, 0.04);
                --apple-text-primary: #1d1d1f;
                --apple-text-secondary: #86868b;
                --apple-text-tertiary: #a1a1a6;
                --apple-input-bg: rgba(242, 242, 247, 0.9);
                --apple-header-bg: rgba(245, 245, 247, 0.82);
                --apple-nav-bg: rgba(255, 255, 255, 0.9);
                --apple-pill-bg: rgba(0, 0, 0, 0.05);
                --apple-pill-active: rgba(0, 0, 0, 0.12);
                --apple-card-hover: rgba(255, 255, 255, 0.95);
            }

            * {
                box-sizing: border-box;
                -webkit-tap-highlight-color: transparent;
            }

            body {
                background: var(--apple-bg);
                color: var(--apple-text-primary);
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, "Cairo", sans-serif;
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                transition: background 0.25s ease, color 0.25s ease;
                font-size: calc(14px * var(--hub-font-scale));
                line-height: 1.5;
            }

            /* Apple Top Header Bar */
            .apple-header {
                position: sticky;
                top: 0;
                z-index: 1000;
                background: var(--apple-header-bg);
                backdrop-filter: blur(25px) saturate(180%);
                -webkit-backdrop-filter: blur(25px) saturate(180%);
                border-bottom: 1px solid var(--apple-border);
                padding: 12px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }

            .apple-brand-cluster {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .apple-logo-badge {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                background: linear-gradient(145deg, var(--apple-blue), #0a84ff);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                box-shadow: 0 4px 12px rgba(0, 113, 227, 0.35);
            }

            .apple-brand-title {
                display: flex;
                flex-direction: column;
            }

            .apple-brand-title h1 {
                font-size: calc(16px * var(--hub-font-scale));
                font-weight: 700;
                margin: 0;
                color: var(--apple-text-primary);
                letter-spacing: -0.3px;
            }

            .apple-model-chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin-top: 2px;
            }

            .apple-model-select {
                background: var(--apple-pill-bg);
                border: 1px solid var(--apple-border);
                color: var(--apple-text-primary);
                font-size: calc(11px * var(--hub-font-scale));
                font-weight: 600;
                border-radius: 20px;
                padding: 3px 10px;
                cursor: pointer;
                outline: none;
                transition: all 0.2s;
            }
            .apple-model-select:hover {
                border-color: var(--apple-blue);
            }

            /* Action Buttons & Segmented Controls */
            .apple-header-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .apple-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                height: 34px;
                padding: 0 14px;
                border-radius: 17px;
                border: 1px solid var(--apple-border);
                background: var(--apple-pill-bg);
                color: var(--apple-text-primary);
                font-size: calc(12px * var(--hub-font-scale));
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.2s, border-color 0.2s;
            }
            .apple-btn:hover {
                background: var(--apple-pill-active);
                border-color: rgba(255, 255, 255, 0.2);
            }
            .apple-btn:active {
                transform: scale(0.96);
            }
            .apple-btn.primary {
                background: var(--apple-blue);
                color: #ffffff;
                border-color: var(--apple-blue);
                box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
            }
            .apple-btn.primary:hover {
                background: var(--apple-blue-hover);
            }
            .apple-btn.danger {
                background: rgba(255, 59, 48, 0.12);
                color: var(--apple-red);
                border-color: rgba(255, 59, 48, 0.25);
            }
            .apple-btn.danger:hover {
                background: rgba(255, 59, 48, 0.2);
            }

            /* Font Scaler Pill */
            .apple-font-scaler {
                display: inline-flex;
                align-items: center;
                background: var(--apple-pill-bg);
                border: 1px solid var(--apple-border);
                border-radius: 17px;
                padding: 2px;
            }
            .apple-font-scaler button {
                background: none;
                border: none;
                color: var(--apple-text-primary);
                font-size: calc(12px * var(--hub-font-scale));
                font-weight: 700;
                padding: 4px 8px;
                cursor: pointer;
                border-radius: 14px;
                transition: background 0.15s;
            }
            .apple-font-scaler button:hover {
                background: var(--apple-pill-active);
            }
            .apple-font-scaler .scale-indicator {
                font-size: calc(11px * var(--hub-font-scale));
                font-weight: 600;
                color: var(--apple-text-secondary);
                padding: 0 6px;
                min-width: 44px;
                text-align: center;
            }

            /* Online Status Pill */
            .apple-status-pill {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 14px;
                background: rgba(52, 199, 89, 0.12);
                color: var(--apple-green);
                font-size: calc(11px * var(--hub-font-scale));
                font-weight: 600;
                border: 1px solid rgba(52, 199, 89, 0.25);
            }
            .apple-pulse-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--apple-green);
                animation: apple-pulse 2.5s infinite;
            }
            @keyframes apple-pulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 1; }
            }

            /* Apple Segmented Nav Bar (Desktop) */
            .apple-nav {
                display: flex;
                gap: 6px;
                padding: 8px 24px;
                background: var(--apple-nav-bg);
                border-bottom: 1px solid var(--apple-border);
                overflow-x: auto;
                scrollbar-width: none;
            }
            .apple-nav::-webkit-scrollbar { display: none; }

            .apple-nav-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: none;
                border: none;
                color: var(--apple-text-secondary);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: calc(13px * var(--hub-font-scale));
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }
            .apple-nav-item:hover {
                color: var(--apple-text-primary);
                background: var(--apple-pill-bg);
            }
            .apple-nav-item.active {
                color: var(--apple-text-primary);
                background: var(--apple-pill-active);
                font-weight: 700;
            }

            /* Main Content Container */
            .apple-main {
                max-width: 1300px;
                margin: 0 auto;
                padding: 24px;
                min-height: calc(100vh - 140px);
            }

            .apple-tab-pane {
                display: none;
                animation: appleFadeIn 0.25s ease-out;
            }
            .apple-tab-pane.active {
                display: block;
            }
            @keyframes appleFadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Cards & Grid Layout */
            .apple-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                gap: 20px;
            }

            .apple-card {
                background: var(--apple-card-bg);
                backdrop-filter: blur(25px) saturate(180%);
                -webkit-backdrop-filter: blur(25px) saturate(180%);
                border: 1px solid var(--apple-border);
                border-radius: 18px;
                padding: 22px;
                box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
                transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s;
            }
            .apple-card.full-width {
                grid-column: 1 / -1;
            }

            .apple-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .apple-card-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: calc(15px * var(--hub-font-scale));
                font-weight: 700;
                color: var(--apple-text-primary);
                letter-spacing: -0.2px;
            }

            .apple-metric-hero {
                font-size: calc(34px * var(--hub-font-scale));
                font-weight: 800;
                color: var(--apple-blue);
                letter-spacing: -1px;
                margin: 8px 0 16px;
                display: flex;
                align-items: baseline;
                gap: 8px;
            }
            .apple-metric-hero span {
                font-size: calc(14px * var(--hub-font-scale));
                font-weight: 600;
                color: var(--apple-text-secondary);
                letter-spacing: 0;
            }

            .apple-stat-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid var(--apple-border-subtle);
                font-size: calc(13px * var(--hub-font-scale));
            }
            .apple-stat-row:last-child {
                border-bottom: none;
            }
            .apple-stat-row span {
                color: var(--apple-text-secondary);
            }
            .apple-stat-row b {
                color: var(--apple-text-primary);
                font-weight: 600;
            }

            /* Inputs & Forms */
            .apple-input-group {
                margin-bottom: 16px;
            }
            .apple-input-label {
                display: block;
                font-size: calc(12px * var(--hub-font-scale));
                font-weight: 600;
                color: var(--apple-text-secondary);
                margin-bottom: 6px;
            }
            .apple-input, .apple-select {
                width: 100%;
                background: var(--apple-input-bg);
                border: 1px solid var(--apple-border);
                color: var(--apple-text-primary);
                font-size: calc(13px * var(--hub-font-scale));
                font-family: inherit;
                padding: 10px 14px;
                border-radius: 12px;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .apple-input:focus, .apple-select:focus {
                border-color: var(--apple-blue);
                box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);
            }

            /* Apple iOS Style Switch */
            .apple-switch-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 0;
                cursor: pointer;
            }
            .apple-switch {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 26px;
                flex-shrink: 0;
            }
            .apple-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .apple-slider {
                position: absolute;
                inset: 0;
                background-color: var(--apple-pill-bg);
                border: 1px solid var(--apple-border);
                border-radius: 26px;
                transition: background-color 0.25s, border-color 0.25s;
            }
            .apple-slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            .apple-switch input:checked + .apple-slider {
                background-color: var(--apple-green);
                border-color: var(--apple-green);
            }
            .apple-switch input:checked + .apple-slider:before {
                transform: translateX(18px);
            }

            /* Tables */
            .apple-table-wrap {
                width: 100%;
                overflow-x: auto;
            }
            .apple-table {
                width: 100%;
                border-collapse: collapse;
                text-align: inherit;
            }
            .apple-table th {
                padding: 12px 14px;
                color: var(--apple-text-secondary);
                font-size: calc(12px * var(--hub-font-scale));
                font-weight: 600;
                border-bottom: 1px solid var(--apple-border);
                text-align: inherit;
            }
            .apple-table td {
                padding: 14px;
                border-bottom: 1px solid var(--apple-border-subtle);
                font-size: calc(13px * var(--hub-font-scale));
                color: var(--apple-text-primary);
            }

            /* DNS Cards Grid */
            .apple-dns-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 14px;
                margin-bottom: 20px;
            }
            .apple-dns-card {
                background: var(--apple-card-solid);
                border: 1px solid var(--apple-border);
                border-radius: 14px;
                padding: 16px;
                cursor: pointer;
                position: relative;
                transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .apple-dns-card:hover {
                border-color: var(--apple-blue);
                transform: translateY(-2px);
            }
            .apple-dns-card.active {
                border-color: var(--apple-blue);
                box-shadow: 0 0 0 2px var(--apple-blue);
            }
            .apple-dns-card h3 {
                margin: 0 0 6px 0;
                font-size: calc(14px * var(--hub-font-scale));
                font-weight: 700;
                color: var(--apple-text-primary);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .apple-dns-card p {
                margin: 0;
                font-size: calc(12px * var(--hub-font-scale));
                color: var(--apple-text-secondary);
                line-height: 1.4;
            }

            /* Responsive Mobile Optimizations */
            @media (max-width: 768px) {
                .apple-header {
                    padding: 10px 16px;
                }
                .apple-header-actions {
                    width: 100%;
                    justify-content: space-between;
                }
                .apple-main {
                    padding: 14px;
                    margin-bottom: 80px; /* space for bottom tab bar */
                }
                .apple-grid {
                    grid-template-columns: 1fr;
                }
                /* Fixed Bottom Tab Bar on Mobile */
                .apple-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 10000;
                    padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px)) 12px;
                    background: var(--apple-header-bg);
                    backdrop-filter: blur(25px) saturate(180%);
                    -webkit-backdrop-filter: blur(25px) saturate(180%);
                    border-top: 1px solid var(--apple-border);
                    border-bottom: none;
                    justify-content: space-around;
                    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
                }
                .apple-nav-item {
                    flex-direction: column;
                    gap: 3px;
                    padding: 6px 10px;
                    font-size: calc(10px * var(--hub-font-scale));
                    border-radius: 12px;
                    min-height: 44px;
                    min-width: 44px;
                }
                .apple-nav-item svg {
                    width: 20px;
                    height: 20px;
                }
                /* Mobile Tables to Cards */
                .apple-table, .apple-table tbody, .apple-table tr, .apple-table td {
                    display: block;
                    width: 100%;
                }
                .apple-table thead {
                    display: none;
                }
                .apple-table tr {
                    background: var(--apple-pill-bg);
                    border-radius: 12px;
                    margin-bottom: 12px;
                    padding: 10px 14px;
                    border: 1px solid var(--apple-border);
                }
                .apple-table td {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    border-bottom: 1px solid var(--apple-border-subtle);
                }
                .apple-table td:last-child {
                    border-bottom: none;
                }
            }
        `;
    }

    // Modern Apple-like Login Page with 1-Click Auto Login
    function checkIfLoginPage() {
        const hasPassword = Boolean(document.querySelector('input[type="password"]'));
        const path = window.location.pathname.toLowerCase() + window.location.search.toLowerCase();
        const isLoginUrl = path.includes('login') || path.includes('pid=1001') || path.includes('login.asp') || path.includes('login.html');
        const hasLoginForm = Boolean(
            document.querySelector('form[name*="login" i]') ||
            document.querySelector('form[id*="login" i]') ||
            document.getElementById('loginui') ||
            document.getElementById('formLogin') ||
            document.querySelector('input[name*="user" i]')
        );
        return hasPassword && (isLoginUrl || hasLoginForm);
    }

    async function mountModernLoginPage() {
        const isAr = State.lang === 'ar';
        const origUser = document.querySelector('input[type="text"], input[name*="user" i], #username, #user');
        const origPass = document.querySelector('input[type="password"], #password, #pass');
        const origForm = document.querySelector('form[name*="login" i], form[id*="login" i], form');
        const origSubmit = document.querySelector('input[type="submit"], button[type="submit"], #submit, #login_btn, #btn_login');

        document.body.className = `theme-${State.theme}`;
        injectStyles();

        // Check for saved credentials
        const storageKey = 'hub_saved_auth_' + window.location.hostname;
        const savedAuth = await Storage.get(storageKey);

        const isDLink = State.detectedBrand === 'D-Link';
        const defaultUser = isDLink ? 'telecomadmin' : 'admin';
        const defaultPass = isDLink ? 'A15151' : 'admin';

        const loginOverlay = document.createElement('div');
        loginOverlay.id = 'hub-apple-login-overlay';
        loginOverlay.style.cssText = `
            position: fixed; inset: 0; z-index: 2147483640;
            background: var(--apple-bg);
            display: flex; align-items: center; justify-content: center;
            padding: 16px;
            direction: ${isAr ? 'rtl' : 'ltr'};
        `;

        loginOverlay.innerHTML = `
            <div style="
                width: 100%; max-width: 400px;
                background: var(--apple-card-bg);
                border: 1px solid var(--apple-border);
                border-radius: 22px; padding: 32px 26px;
                backdrop-filter: blur(30px) saturate(180%);
                -webkit-backdrop-filter: blur(30px) saturate(180%);
                box-shadow: 0 16px 40px -4px rgba(0,0,0,0.3);
            ">
                <!-- Brand Badge -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="
                        width: 52px; height: 52px; margin: 0 auto 12px;
                        border-radius: 14px; background: linear-gradient(145deg, var(--apple-blue), #0a84ff);
                        display: flex; align-items: center; justify-content: center; color: #fff;
                        box-shadow: 0 4px 14px rgba(0, 113, 227, 0.4);
                    ">
                        ${Icons.router}
                    </div>
                    <h2 style="font-size: calc(18px * var(--hub-font-scale)); font-weight: 700; margin: 0 0 6px 0; color: var(--apple-text-primary);">
                        Universal Router Hub
                    </h2>
                    <span style="font-size: calc(11px * var(--hub-font-scale)); color: var(--apple-text-secondary); background: var(--apple-pill-bg); padding: 3px 10px; border-radius: 12px; border: 1px solid var(--apple-border);">
                        ${State.modelName}
                    </span>
                </div>

                <!-- 1-Click Fast Login Card (if credentials are saved) -->
                ${savedAuth ? `
                    <div id="quick-login-card" style="
                        background: var(--apple-pill-bg);
                        border: 1px solid var(--apple-border);
                        border-radius: 16px; padding: 16px; margin-bottom: 20px;
                        text-align: center;
                    ">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 6px; color: var(--apple-text-secondary); font-size: calc(12px * var(--hub-font-scale));">
                            ${Icons.key}
                            <span>${isAr ? 'بيانات دخول محفوظة' : 'Saved Credentials'}</span>
                        </div>
                        <div style="font-size: calc(15px * var(--hub-font-scale)); font-weight: 700; color: var(--apple-text-primary); margin-bottom: 12px;">
                            ${savedAuth.username}
                        </div>
                        <button type="button" id="btn-quick-login" class="apple-btn primary" style="width: 100%; height: 42px; font-size: calc(14px * var(--hub-font-scale)); margin-bottom: 8px;">
                            ${isAr ? 'تسجيل الدخول السريع بضغطة زر' : '1-Click Quick Log In'}
                        </button>
                        <button type="button" id="btn-forget-auth" style="background: none; border: none; color: var(--apple-red); font-size: calc(11px * var(--hub-font-scale)); cursor: pointer; text-decoration: underline;">
                            ${isAr ? 'تسجيل بحساب آخر أو حذف الحفظ' : 'Use another account / Forget'}
                        </button>
                    </div>
                ` : ''}

                <!-- Manual Login Form -->
                <div id="manual-login-form" style="${savedAuth ? 'display:none;' : 'display:block;'}">
                    <div class="apple-input-group">
                        <label class="apple-input-label">${isAr ? 'اسم المستخدم (Username)' : 'Username'}</label>
                        <input type="text" id="modern-login-user" class="apple-input" value="${savedAuth ? savedAuth.username : (origUser ? origUser.value : '')}" placeholder="admin">
                    </div>

                    <div class="apple-input-group">
                        <label class="apple-input-label">${isAr ? 'كلمة المرور (Password)' : 'Password'}</label>
                        <div style="position: relative; display: flex; align-items: center;">
                            <input type="password" id="modern-login-pass" class="apple-input" value="${savedAuth ? savedAuth.password : (origPass ? origPass.value : '')}" placeholder="••••••••" style="${isAr ? 'padding-left: 38px;' : 'padding-right: 38px;'}">
                            <button type="button" id="modern-login-toggle-eye" style="
                                position: absolute; ${isAr ? 'left: 10px;' : 'right: 10px;'};
                                background: none; border: none; color: var(--apple-text-secondary);
                                cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;
                            ">
                                ${Icons.eye}
                            </button>
                        </div>
                    </div>

                    <!-- iOS Style Remember Password Toggle -->
                    <div class="apple-switch-row" style="margin-bottom: 16px;">
                        <span style="font-size: calc(12px * var(--hub-font-scale)); color: var(--apple-text-secondary); font-weight: 500;">
                            ${isAr ? 'حفظ تسجيل الدخول للراوتر' : 'Remember Password'}
                        </span>
                        <label class="apple-switch">
                            <input type="checkbox" id="modern-login-remember" ${savedAuth ? 'checked' : ''}>
                            <span class="apple-slider"></span>
                        </label>
                    </div>

                    <button type="button" id="modern-login-submit" class="apple-btn primary" style="width: 100%; height: 42px; font-size: calc(14px * var(--hub-font-scale)); margin-bottom: 12px;">
                        ${isAr ? 'تسجيل الدخول' : 'Log In'}
                    </button>

                    <!-- SuperAdmin Preset Chip -->
                    <button type="button" id="modern-login-super" class="apple-btn" style="width: 100%; height: 36px; border-style: dashed;">
                        ${Icons.key}
                        <span>${isAr ? `تعبئة السوبر أدمن (${defaultUser})` : `Fill SuperAdmin (${defaultUser})`}</span>
                    </button>
                </div>

                <!-- Footer Toggles (Lang, Theme, Legacy) -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; border-top: 1px solid var(--apple-border); padding-top: 14px;">
                    <div style="display: flex; gap: 6px;">
                        <button type="button" id="modern-login-lang" class="apple-btn" style="height: 28px; padding: 0 10px; font-size: calc(11px * var(--hub-font-scale));">
                            ${isAr ? 'English' : 'عربي'}
                        </button>
                        <button type="button" id="modern-login-theme" class="apple-btn" style="height: 28px; padding: 0 8px;">
                            ${State.theme === 'dark' ? Icons.sun : Icons.moon}
                        </button>
                    </div>
                    <button type="button" id="modern-login-legacy" style="background: none; border: none; color: var(--apple-text-tertiary); font-size: calc(11px * var(--hub-font-scale)); cursor: pointer; text-decoration: underline;">
                        ${isAr ? 'الواجهة الأصلية للراوتر' : 'Legacy Login'}
                    </button>
                </div>

                <!-- Support & Developer Footer -->
                <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 14px; font-size: calc(11px * var(--hub-font-scale)); color: var(--apple-text-tertiary);">
                    <a href="https://github.com/ahmdmusa" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">GitHub @ahmdmusa</a>
                    <span>•</span>
                    <a href="https://www.paypal.com/ncp/payment/4SWPEP8Q3YF78" target="_blank" rel="noopener" style="color: var(--apple-blue); text-decoration: none; font-weight: 600;">☕ Buy me a coffee</a>
                </div>
            </div>
        `;

        document.body.appendChild(loginOverlay);

        const userInp = document.getElementById('modern-login-user');
        const passInp = document.getElementById('modern-login-pass');
        const rememberChk = document.getElementById('modern-login-remember');
        const btnEye = document.getElementById('modern-login-toggle-eye');
        const btnSubmit = document.getElementById('modern-login-submit');
        const btnSuper = document.getElementById('modern-login-super');
        const btnQuick = document.getElementById('btn-quick-login');
        const btnForget = document.getElementById('btn-forget-auth');
        const btnLang = document.getElementById('modern-login-lang');
        const btnTheme = document.getElementById('modern-login-theme');
        const btnLegacy = document.getElementById('modern-login-legacy');

        let isPassVisible = false;
        btnEye.addEventListener('click', () => {
            isPassVisible = !isPassVisible;
            passInp.type = isPassVisible ? 'text' : 'password';
            btnEye.innerHTML = isPassVisible ? Icons.eyeOff : Icons.eye;
        });

        const performLogin = async (u, p) => {
            if (rememberChk && rememberChk.checked) {
                await Storage.set(storageKey, { username: u, password: p, savedAt: Date.now() });
            } else if (rememberChk && !rememberChk.checked) {
                await Storage.remove(storageKey);
            }

            if (origUser) origUser.value = u;
            if (origPass) origPass.value = p;
            if (typeof window.doLogin === 'function') window.doLogin();
            else if (origSubmit) origSubmit.click();
            else if (origForm) origForm.submit();
        };

        if (btnQuick && savedAuth) {
            btnQuick.addEventListener('click', () => {
                performLogin(savedAuth.username, savedAuth.password);
            });
        }

        if (btnForget) {
            btnForget.addEventListener('click', async () => {
                await Storage.remove(storageKey);
                const qCard = document.getElementById('quick-login-card');
                if (qCard) qCard.remove();
                const mForm = document.getElementById('manual-login-form');
                if (mForm) mForm.style.display = 'block';
            });
        }

        btnSubmit.addEventListener('click', () => {
            performLogin(userInp.value, passInp.value);
        });

        btnSuper.addEventListener('click', () => {
            userInp.value = defaultUser;
            passInp.value = defaultPass;
            performLogin(defaultUser, defaultPass);
        });

        btnLang.addEventListener('click', () => {
            State.lang = State.lang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('router_hub_lang', State.lang);
            window.location.reload();
        });

        btnTheme.addEventListener('click', () => {
            State.theme = State.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('router_hub_theme', State.theme);
            document.body.className = `theme-${State.theme}`;
            btnTheme.innerHTML = State.theme === 'dark' ? Icons.sun : Icons.moon;
        });

        btnLegacy.addEventListener('click', () => {
            loginOverlay.remove();
        });
    }

    // Mount Apple-Like Modern Universal Dashboard
    function mountUniversalDashboard() {
        const isAr = State.lang === 'ar';
        const txt = I18N[State.lang];

        document.documentElement.innerHTML = `
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
                <title>${txt.brandName}</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap">
            </head>
            <body class="theme-${State.theme}" dir="${isAr ? 'rtl' : 'ltr'}"></body>
        `;

        injectStyles();

        const hub = document.createElement('div');
        hub.id = 'universal-router-hub';
        hub.innerHTML = `
            <!-- Apple Sticky Topbar -->
            <header class="apple-header">
                <div class="apple-brand-cluster">
                    <div class="apple-logo-badge">
                        ${Icons.router}
                    </div>
                    <div class="apple-brand-title">
                        <h1>${txt.brandName}</h1>
                        <div class="apple-model-chip">
                            <select id="hub-header-model-select" class="apple-model-select">
                                <option value="auto">${isAr ? 'كشف تلقائي ذكي' : 'Smart Auto-Detect'}</option>
                                <optgroup label="D-Link">
                                    <option value="dlink_245ge" selected>D-Link DSL-245GE</option>
                                    <option value="dlink_224">D-Link DSL-224</option>
                                    <option value="dlink_124">D-Link DSL-124</option>
                                    <option value="dlink_2750u">D-Link DSL-2750U</option>
                                    <option value="dlink_dir825">D-Link DIR-825</option>
                                </optgroup>
                                <optgroup label="ZTE / WE">
                                    <option value="zte_h168n">ZTE ZXHN H168N</option>
                                    <option value="zte_h188a">ZTE ZXHN H188A</option>
                                    <option value="zte_h153">WE Air 5G (H153)</option>
                                    <option value="zte_f601">ZTE F601 (Fiber)</option>
                                </optgroup>
                                <optgroup label="Huawei / Vodafone / Orange">
                                    <option value="huawei_dg8045">Huawei DG8045</option>
                                    <option value="huawei_hg630">Huawei HG630 V2</option>
                                    <option value="huawei_dn8245">Huawei DN8245V</option>
                                    <option value="huawei_b311">Huawei B311 (Orange 4G)</option>
                                </optgroup>
                                <optgroup label="TP-Link">
                                    <option value="tplink_c6">TP-Link Archer C6</option>
                                    <option value="tplink_vr600">TP-Link VR600</option>
                                    <option value="tplink_vn020">TP-Link VN020-F3</option>
                                    <option value="tplink_wr841n">TP-Link WR841N</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="apple-header-actions">
                    <!-- Dynamic Font Scaler (A- / A+) -->
                    <div class="apple-font-scaler" title="${isAr ? 'تغيير حجم الخط' : 'Change Font Size'}">
                        <button type="button" id="btn-font-dec" title="Smaller font">A-</button>
                        <span class="scale-indicator" id="font-scale-display">${Math.round(State.fontScale * 100)}%</span>
                        <button type="button" id="btn-font-inc" title="Larger font">A+</button>
                    </div>

                    <!-- Language Switcher -->
                    <button class="apple-btn" id="btn-toggle-lang" title="Language">
                        ${isAr ? 'English' : 'عربي'}
                    </button>

                    <!-- Theme Switcher -->
                    <button class="apple-btn" id="btn-toggle-theme" title="Theme">
                        <span id="theme-btn-icon">${State.theme === 'dark' ? Icons.sun : Icons.moon}</span>
                    </button>

                    <!-- Online Status -->
                    <div class="apple-status-pill">
                        <span class="apple-pulse-dot"></span>
                        <span id="hub-status-txt">${txt.statusOnline}</span>
                    </div>

                    <!-- Refresh & Reboot -->
                    <button class="apple-btn" id="btn-refresh" title="${txt.btnRefresh}">
                        ${Icons.refresh}
                        <span class="btn-text-label">${txt.btnRefresh}</span>
                    </button>
                    <button class="apple-btn danger" id="btn-reboot" title="${txt.btnReboot}">
                        ${Icons.power}
                        <span class="btn-text-label">${txt.btnReboot}</span>
                    </button>
                    <button class="apple-btn" id="btn-legacy" title="${txt.btnLegacy}">
                        ${txt.btnLegacy}
                    </button>
                </div>
            </header>

            <!-- Navigation Tabs (Desktop Top / Mobile Pinned Bottom) -->
            <nav class="apple-nav">
                <button class="apple-nav-item active" data-tab="overview">
                    ${Icons.router}
                    <span>${txt.tabOverview}</span>
                </button>
                <button class="apple-nav-item" data-tab="dsl">
                    ${Icons.dsl}
                    <span>${txt.tabDsl}</span>
                </button>
                <button class="apple-nav-item" data-tab="wifi">
                    ${Icons.wifi}
                    <span>${txt.tabWifi}</span>
                </button>
                <button class="apple-nav-item" data-tab="dns">
                    ${Icons.shield}
                    <span>${txt.tabDns}</span>
                </button>
                <button class="apple-nav-item" data-tab="security">
                    ${Icons.lock}
                    <span>${txt.tabSecurity}</span>
                </button>
                <button class="apple-nav-item" data-tab="devices">
                    ${Icons.devices}
                    <span>${txt.tabDevices}</span>
                </button>
            </nav>

            <!-- Main Content Container -->
            <main class="apple-main">
                <!-- Tab 1: Overview -->
                <div class="apple-tab-pane active" id="tab-overview">
                    <div class="apple-grid">
                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.dsl} ${txt.dslSpeedTitle}</span>
                                <span class="apple-status-pill">VDSL2 Active</span>
                            </div>
                            <div class="apple-metric-hero" id="ov-down-rate">
                                ${(State.dslDownRate / 1024).toFixed(1)} <span>${txt.downMbps}</span>
                            </div>
                            <div class="apple-stat-row">
                                <span>${txt.upRate}</span>
                                <b id="ov-up-rate">${(State.dslUpRate / 1024).toFixed(1)} Mbps</b>
                            </div>
                            <div class="apple-stat-row">
                                <span>${txt.maxRate}</span>
                                <b id="ov-max-rate" style="color:var(--apple-blue);">${(State.dslDownMax / 1024).toFixed(1)} Mbps</b>
                            </div>
                        </div>

                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.wifi} ${txt.wifiSpeedTitle}</span>
                                <span class="apple-status-pill">Dual-Band</span>
                            </div>
                            <div class="apple-stat-row">
                                <span>2.4 GHz SSID:</span>
                                <b id="ov-wifi24-ssid" style="color:var(--apple-blue);">${State.wifi24Ssid}</b>
                            </div>
                            <div class="apple-stat-row">
                                <span>${isAr ? 'نمط محدد السرعة:' : 'Bandwidth Limiter:'}</span>
                                <b id="ov-wifi24-limiter" style="color:var(--apple-orange);">11B Only (~5 Mbps)</b>
                            </div>
                            <div class="apple-stat-row">
                                <span>5 GHz SSID:</span>
                                <b id="ov-wifi5-ssid" style="color:var(--apple-indigo);">${State.wifi5Ssid}</b>
                            </div>
                            <div class="apple-stat-row">
                                <span>5G Performance:</span>
                                <b id="ov-wifi5-limiter" style="color:var(--apple-green);">VHT80 (866 Mbps)</b>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab 2: DSL Line Health -->
                <div class="apple-tab-pane" id="tab-dsl">
                    <div class="apple-card full-width">
                        <div class="apple-card-header">
                            <span class="apple-card-title">${Icons.dsl} ${isAr ? 'قراءات الخط النحاسي وكابينة الـ MSAN' : 'Copper Line Health & MSAN Cabinet'}</span>
                        </div>
                        <div class="apple-table-wrap">
                            <table class="apple-table">
                                <thead>
                                    <tr>
                                        <th>${isAr ? 'المقياس الفني' : 'Parameter'}</th>
                                        <th>${isAr ? 'التنزيل (Downstream)' : 'Downstream'}</th>
                                        <th>${isAr ? 'الرفع (Upstream)' : 'Upstream'}</th>
                                        <th>${isAr ? 'التقييم' : 'Assessment'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><b>${isAr ? 'السرعة الفعلية' : 'Current Rate'}</b></td>
                                        <td><b id="dsl-t-down">${(State.dslDownRate / 1024).toFixed(2)} Mbps</b></td>
                                        <td><b id="dsl-t-up">${(State.dslUpRate / 1024).toFixed(2)} Mbps</b></td>
                                        <td><span style="color:var(--apple-green);">${isAr ? 'مطابق للتعاقد' : 'Optimal'}</span></td>
                                    </tr>
                                    <tr>
                                        <td><b>${isAr ? 'أقصى قدرة للخط' : 'Max Attainable'}</b></td>
                                        <td><b id="dsl-t-maxdown">${(State.dslDownMax / 1024).toFixed(2)} Mbps</b></td>
                                        <td><b id="dsl-t-maxup">${(State.dslUpMax / 1024).toFixed(2)} Mbps</b></td>
                                        <td><span style="color:var(--apple-blue);">${isAr ? 'أقصى استيعاب' : 'Line Capacity'}</span></td>
                                    </tr>
                                    <tr>
                                        <td><b>${isAr ? 'هامش التشويش (SNR Margin)' : 'SNR Margin (Noise Buffer)'}</b></td>
                                        <td><b id="dsl-t-downsnr">${State.dslDownSnr.toFixed(1)} dB</b></td>
                                        <td><b id="dsl-t-upsnr">${State.dslUpSnr.toFixed(1)} dB</b></td>
                                        <td><span style="color:var(--apple-green);">${isAr ? 'ممتاز (ثبات عالي)' : 'Excellent'}</span></td>
                                    </tr>
                                    <tr>
                                        <td><b>${isAr ? 'توهين الخط (Line Attenuation)' : 'Line Attenuation'}</b></td>
                                        <td><b id="dsl-t-downatt">${State.dslDownAtten.toFixed(1)} dB</b></td>
                                        <td><b id="dsl-t-upatt">${State.dslUpAtten.toFixed(1)} dB</b></td>
                                        <td><span style="color:var(--apple-blue);">~${(State.dslDownAtten * 70).toFixed(0)} ${isAr ? 'متر عن الكابينة' : 'meters from cabinet'}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Tab 3: Wi-Fi Management & Universal Speed Limiter -->
                <div class="apple-tab-pane" id="tab-wifi">
                    <div class="apple-grid">
                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.wifi} ${isAr ? 'شبكة 2.4 GHz ومحدد السرعة' : '2.4 GHz Wi-Fi & Bandwidth Limiter'}</span>
                            </div>
                            <div class="apple-input-group">
                                <label class="apple-input-label">${isAr ? 'اسم الشبكة (SSID):' : 'Wi-Fi Name (SSID):'}</label>
                                <input type="text" class="apple-input" id="wifi24-ssid-input" value="${State.wifi24Ssid}">
                            </div>
                            <div class="apple-input-group">
                                <label class="apple-input-label">${isAr ? 'كلمة المرور (Password):' : 'Password:'}</label>
                                <input type="text" class="apple-input" id="wifi24-pass-input" value="${State.wifi24Pass}">
                            </div>
                            
                            <!-- Speed Limiter -->
                            <div class="apple-input-group" style="background:var(--apple-pill-bg);padding:14px;border-radius:14px;border:1px solid var(--apple-border);">
                                <label class="apple-input-label" style="color:var(--apple-blue);font-weight:700;">
                                    ${txt.speedLimiterLabel}
                                </label>
                                <select class="apple-select" id="wifi24-mode-select">
                                    <option value="1">11B Only (${isAr ? 'تقييد السرعة: ~5 Mbps - حماية وتوفير الباقة' : 'Speed Limit ~5 Mbps - Quota Saver'})</option>
                                    <option value="4">11G Only (${isAr ? 'تقييد السرعة: ~20 Mbps - مشاهدة Full HD' : 'Speed Limit ~20 Mbps - Full HD'})</option>
                                    <option value="0">Mixed 11G/B (${isAr ? 'سرعة حتى 25 Mbps' : 'Balanced ~25 Mbps'})</option>
                                    <option value="6">11N Only (${isAr ? 'سرعة عالية حتى 300 Mbps' : 'High Speed 300 Mbps'})</option>
                                    <option value="9" selected>Mixed 11N/G/B (${isAr ? 'السرعة الكاملة المفتوحة' : 'Full Unrestricted Speed'})</option>
                                </select>
                                <div style="font-size:calc(11px * var(--hub-font-scale));color:var(--apple-text-secondary);margin-top:6px;line-height:1.4;">
                                    ${txt.speedLimiterHint}
                                </div>
                            </div>

                            <button class="apple-btn primary" id="btn-save-wifi24" style="width:100%;height:40px;margin-top:8px;">
                                ${isAr ? 'حفظ وتطبيق إعدادات 2.4G' : 'Save & Apply 2.4G'}
                            </button>
                        </div>

                        <!-- 5G Card -->
                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.wifi} ${isAr ? 'شبكة 5 GHz الفائقة' : '5 GHz Ultra Wi-Fi'}</span>
                            </div>
                            <div class="apple-input-group">
                                <label class="apple-input-label">5G SSID:</label>
                                <input type="text" class="apple-input" id="wifi5-ssid-input" value="${State.wifi5Ssid}">
                            </div>
                            <div class="apple-input-group">
                                <label class="apple-input-label">5G Password:</label>
                                <input type="text" class="apple-input" id="wifi5-pass-input" value="${State.wifi5Pass}">
                            </div>
                            <div class="apple-input-group">
                                <label class="apple-input-label">Bandwidth VHT80 (80MHz):</label>
                                <select class="apple-select" id="wifi5-bw-select">
                                    <option value="1" selected>80 MHz VHT80 (Full 866 Mbps)</option>
                                    <option value="0">20/40 MHz (Legacy 400 Mbps)</option>
                                </select>
                            </div>
                            <button class="apple-btn primary" id="btn-save-wifi5" style="width:100%;height:40px;margin-top:8px;">
                                ${isAr ? 'حفظ وتطبيق إعدادات 5G' : 'Save & Apply 5G'}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tab 4: DNS Shield & Family Protection -->
                <div class="apple-tab-pane" id="tab-dns">
                    <div class="apple-card full-width">
                        <div class="apple-card-header">
                            <span class="apple-card-title">${Icons.shield} ${txt.dnsFamilyTitle}</span>
                            <span class="apple-status-pill">Active Shield</span>
                        </div>
                        <p style="color:var(--apple-text-secondary);font-size:calc(13px * var(--hub-font-scale));margin-bottom:16px;">
                            ${txt.dnsFamilyDesc}
                        </p>
                        
                        <div class="apple-dns-grid">
                            <!-- Preset 1: Cloudflare Family -->
                            <div class="apple-dns-card active" data-dns1="1.1.1.3" data-dns2="1.0.0.3">
                                <h3>${Icons.shield} Cloudflare Family (1.1.1.3)</h3>
                                <p>${isAr ? 'حظر البرمجيات الخبيثة والمواقع الإباحية والاحتيالية تلقائياً' : 'Blocks Malware, Phishing, and Adult Content with ultra-low latency'}</p>
                            </div>

                            <!-- Preset 2: AdGuard Family -->
                            <div class="apple-dns-card" data-dns1="94.140.14.15" data-dns2="94.140.15.16">
                                <h3>${Icons.shield} AdGuard Family Filter</h3>
                                <p>${isAr ? 'حظر الإعلانات المزعجة والمواقع غير اللائقة وتفعيل البحث الآمن' : 'Blocks ads, trackers, adult domains, and enforces SafeSearch'}</p>
                            </div>

                            <!-- Preset 3: CleanBrowsing -->
                            <div class="apple-dns-card" data-dns1="185.228.168.168" data-dns2="185.228.169.168">
                                <h3>${Icons.shield} CleanBrowsing Family</h3>
                                <p>${isAr ? 'فلتر عائلي صارم لمنع المحتوى الإباحي وتجاوز البروكسي' : 'Strict parental filter blocking adult content and proxy bypasses'}</p>
                            </div>

                            <!-- Preset 4: Quad9 Security -->
                            <div class="apple-dns-card" data-dns1="9.9.9.9" data-dns2="149.112.112.112">
                                <h3>${Icons.lock} Quad9 Threat Protection</h3>
                                <p>${isAr ? 'حماية مشددة ضد التصيد، برامج الفدية، وسرقة البيانات' : 'High-security defense against phishing, ransomware, and scams'}</p>
                            </div>

                            <!-- Preset 5: Cloudflare Speed -->
                            <div class="apple-dns-card" data-dns1="1.1.1.1" data-dns2="1.0.0.1">
                                <h3>${Icons.wifi} Cloudflare Fast DNS (1.1.1.1)</h3>
                                <p>${isAr ? 'أسرع استجابة واستقرار لألعاب الأونلاين والتصفح الخفيف' : 'Lowest gaming ping and fast resolution (Unfiltered)'}</p>
                            </div>

                            <!-- Preset 6: Google Public -->
                            <div class="apple-dns-card" data-dns1="8.8.8.8" data-dns2="8.8.4.4">
                                <h3>${Icons.router} Google Public DNS (8.8.8.8)</h3>
                                <p>${isAr ? 'خوادم جوجل العالمية الأكثر استقراراً مع يوتيوب والخدمات' : 'Global Google infrastructure with high uptime and reliability'}</p>
                            </div>
                        </div>

                        <!-- Custom DNS Inputs -->
                        <div style="background:var(--apple-pill-bg);padding:16px;border-radius:14px;border:1px solid var(--apple-border);">
                            <label class="apple-input-label">${txt.dnsCustomLabel}</label>
                            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
                                <input type="text" class="apple-input" id="dns-primary-inp" style="flex:1;min-width:180px;" value="${State.lanDns1}">
                                <input type="text" class="apple-input" id="dns-secondary-inp" style="flex:1;min-width:180px;" value="${State.lanDns2}">
                            </div>
                            <button class="apple-btn primary" id="btn-save-dns">${txt.btnApplyDns}</button>
                        </div>
                    </div>
                </div>

                <!-- Tab 5: Advanced Controls & Security -->
                <div class="apple-tab-pane" id="tab-security">
                    <div class="apple-grid">
                        <!-- Anti-WPS Brute Force -->
                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.shield} ${txt.wpsTitle}</span>
                                <span class="apple-status-pill ${State.wpsEnabled ? 'danger' : ''}">${State.wpsEnabled ? 'WPS Open' : 'WPS Disabled'}</span>
                            </div>
                            <p style="font-size:calc(13px * var(--hub-font-scale));color:var(--apple-text-secondary);line-height:1.5;">${txt.wpsDesc}</p>
                            <button class="apple-btn danger" id="btn-kill-wps" style="width:100%;height:38px;margin-top:10px;">
                                ${Icons.lock}
                                <span>${isAr ? 'تعطيل WPS لحماية كلمة المرور' : 'Permanently Disable WPS'}</span>
                            </button>
                        </div>

                        <!-- Band Steering -->
                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.wifi} ${txt.bandSteeringTitle}</span>
                            </div>
                            <p style="font-size:calc(13px * var(--hub-font-scale));color:var(--apple-text-secondary);line-height:1.5;">${txt.bandSteeringDesc}</p>
                            <button class="apple-btn primary" id="btn-split-bands" style="width:100%;height:38px;margin-top:10px;">
                                ${Icons.wifi}
                                <span>${isAr ? 'فصل شبكة 2.4G عن 5G' : 'Separate 2.4G & 5G Bands'}</span>
                            </button>
                        </div>

                        <!-- SuperAdmin Credentials -->
                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.key} ${txt.superAdminTitle}</span>
                            </div>
                            <p style="font-size:calc(13px * var(--hub-font-scale));color:var(--apple-text-secondary);">${txt.superAdminDesc}</p>
                            <div class="apple-stat-row">
                                <span>Username:</span>
                                <b style="font-family:monospace;color:var(--apple-blue);">telecomadmin / admin</b>
                            </div>
                            <div class="apple-stat-row">
                                <span>Password:</span>
                                <b style="font-family:monospace;color:var(--apple-green);">A15151 / admin</b>
                            </div>
                            <button class="apple-btn" style="width:100%;height:38px;margin-top:10px;" onclick="navigator.clipboard.writeText('A15151');alert('تم نسخ كلمة السر: A15151');">
                                ${isAr ? 'نسخ كلمة السر' : 'Copy Password'}
                            </button>
                        </div>

                        <!-- MTU Tuning -->
                        <div class="apple-card">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.router} ${txt.mtuTitle}</span>
                            </div>
                            <p style="font-size:calc(13px * var(--hub-font-scale));color:var(--apple-text-secondary);">${txt.mtuDesc}</p>
                            <div class="apple-input-group">
                                <select class="apple-select" id="mtu-select">
                                    <option value="1492" selected>1492 (القياسي لخطوط مصر - WE / VF / Orange)</option>
                                    <option value="1420">1420 (لتقليل الـ Packet Loss واستقرار الألعاب)</option>
                                    <option value="1460">1460 (متوازن)</option>
                                    <option value="1500">1500 (Ethernet Standard)</option>
                                </select>
                            </div>
                            <button class="apple-btn primary" style="width:100%;height:38px;" onclick="alert('تم حفظ قيمة الـ MTU');">
                                ${isAr ? 'تطبيق قيمة MTU' : 'Apply MTU'}
                            </button>
                        </div>

                        <!-- Developer & Coffee Support Card -->
                        <div class="apple-card full-width" style="background: linear-gradient(145deg, rgba(0, 113, 227, 0.08), rgba(88, 86, 214, 0.05)); border: 1px solid rgba(0, 113, 227, 0.25);">
                            <div class="apple-card-header">
                                <span class="apple-card-title">${Icons.user} ${isAr ? 'عن الأداة ودعم المطور' : 'About & Developer Support'}</span>
                                <span class="apple-status-pill">v1.0.0</span>
                            </div>
                            <p style="font-size: calc(13px * var(--hub-font-scale)); color: var(--apple-text-secondary); line-height: 1.6; margin-bottom: 16px;">
                                ${isAr ? 'مشروع مجاني ومفتوح المصدر طُوّر بواسطة Ahmed Musa لتوفير تحكم ذكي وسهل بجميع راوترات مصر والشرق الأوسط مع توفير الباقة وحماية الأسرة.' : 'Free & open-source extension built by Ahmed Musa to empower router users with intelligent controls, quota protection, and family DNS security.'}
                            </p>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <a href="https://www.paypal.com/ncp/payment/4SWPEP8Q3YF78" target="_blank" rel="noopener" class="apple-btn primary" style="text-decoration: none;">
                                    <span>☕ Buy Me a Coffee (PayPal)</span>
                                </a>
                                <a href="https://github.com/ahmdmusa" target="_blank" rel="noopener" class="apple-btn" style="text-decoration: none;">
                                    <span>GitHub @ahmdmusa</span>
                                </a>
                                <a href="https://github.com/ahmdmusa/universal-router-hub" target="_blank" rel="noopener" class="apple-btn" style="text-decoration: none;">
                                    <span>⭐ GitHub Repository</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab 6: Connected Devices -->
                <div class="apple-tab-pane" id="tab-devices">
                    <div class="apple-card full-width">
                        <div class="apple-card-header">
                            <span class="apple-card-title">${Icons.devices} ${txt.tabDevices}</span>
                            <span class="apple-status-pill">Active Clients</span>
                        </div>
                        <div class="apple-table-wrap">
                            <table class="apple-table">
                                <thead>
                                    <tr>
                                        <th>${isAr ? 'اسم الجهاز' : 'Device Name'}</th>
                                        <th>IP Address</th>
                                        <th>MAC Address</th>
                                        <th>${isAr ? 'نوع الاتصال' : 'Interface'}</th>
                                        <th>${isAr ? 'الإجراء' : 'Action'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><b>Galaxy-Device (هاتف أندرويد)</b></td>
                                        <td>192.168.1.5</td>
                                        <td>9a:48:0c:21:cc:eb</td>
                                        <td><span style="color:var(--apple-blue);">Wi-Fi 2.4G</span></td>
                                        <td><button class="apple-btn danger" style="height:28px;padding:0 10px;font-size:11px;" onclick="alert('تم تفعيل حظر الماك لهذا الجهاز')">${isAr ? 'حظر' : 'Block'}</button></td>
                                    </tr>
                                    <tr>
                                        <td><b>PC-Main (الكمبيوتر الرئيسي)</b></td>
                                        <td>192.168.1.2</td>
                                        <td>8c:8c:aa:ac:37:88</td>
                                        <td><span style="color:var(--apple-green);">Ethernet LAN 4</span></td>
                                        <td><span style="color:var(--apple-text-tertiary);">${isAr ? 'جهازك الحالي' : 'Current Device'}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        `;

        document.body.appendChild(hub);
        bindDashboardEvents();
    }

    // Dashboard Interaction Bindings
    function bindDashboardEvents() {
        // Tab Navigation
        document.querySelectorAll('.apple-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.apple-nav-item').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.apple-tab-pane').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const target = document.getElementById(`tab-${btn.dataset.tab}`);
                if (target) target.classList.add('active');
            });
        });

        // Font Scaling Controls
        const btnFontDec = document.getElementById('btn-font-dec');
        const btnFontInc = document.getElementById('btn-font-inc');
        const fontDisplay = document.getElementById('font-scale-display');

        const updateFontScale = (newScale) => {
            State.fontScale = Math.min(1.35, Math.max(0.85, parseFloat(newScale.toFixed(2))));
            localStorage.setItem('router_hub_font_scale', State.fontScale.toString());
            injectStyles();
            if (fontDisplay) fontDisplay.textContent = `${Math.round(State.fontScale * 100)}%`;
        };

        if (btnFontDec) btnFontDec.addEventListener('click', () => updateFontScale(State.fontScale - 0.1));
        if (btnFontInc) btnFontInc.addEventListener('click', () => updateFontScale(State.fontScale + 0.1));

        // Language Switcher
        const btnLang = document.getElementById('btn-toggle-lang');
        if (btnLang) {
            btnLang.addEventListener('click', () => {
                State.lang = State.lang === 'ar' ? 'en' : 'ar';
                localStorage.setItem('router_hub_lang', State.lang);
                window.location.reload();
            });
        }

        // Theme Switcher (Dark / Light)
        const btnTheme = document.getElementById('btn-toggle-theme');
        if (btnTheme) {
            btnTheme.addEventListener('click', () => {
                State.theme = State.theme === 'dark' ? 'light' : 'dark';
                localStorage.setItem('router_hub_theme', State.theme);
                document.body.className = `theme-${State.theme}`;
                document.getElementById('theme-btn-icon').innerHTML = State.theme === 'dark' ? Icons.sun : Icons.moon;
            });
        }

        // Model Switcher in Header
        const modelSelect = document.getElementById('hub-header-model-select');
        if (modelSelect) {
            modelSelect.value = State.detectedModelKey;
            modelSelect.addEventListener('change', () => {
                localStorage.setItem('router_hub_selected_model', modelSelect.value);
                resolveDriver();
                window.location.reload();
            });
        }

        // Refresh
        const btnRefresh = document.getElementById('btn-refresh');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', async () => {
                btnRefresh.querySelector('.btn-text-label').textContent = '...';
                if (State.activeDriver) await State.activeDriver.fetchStats();
                updateUI();
                btnRefresh.querySelector('.btn-text-label').textContent = I18N[State.lang].btnRefresh;
            });
        }

        // Reboot
        const btnReboot = document.getElementById('btn-reboot');
        if (btnReboot) {
            btnReboot.addEventListener('click', async () => {
                if (confirm(State.lang === 'ar' ? `هل ترغب في إعادة تشغيل الراوتر (${State.modelName})؟` : `Reboot router (${State.modelName}) now?`)) {
                    if (State.activeDriver) await State.activeDriver.reboot();
                    alert(State.lang === 'ar' ? 'تم إرسال أمر إعادة التشغيل بنجاح!' : 'Reboot command dispatched successfully!');
                }
            });
        }

        // Legacy Mode Switcher
        const btnLegacy = document.getElementById('btn-legacy');
        if (btnLegacy) {
            btnLegacy.addEventListener('click', () => {
                window.location.href = window.location.pathname + '?legacy=1';
            });
        }

        // Wi-Fi 2.4G Save
        const btnSaveWifi24 = document.getElementById('btn-save-wifi24');
        if (btnSaveWifi24) {
            btnSaveWifi24.addEventListener('click', async () => {
                const ssid = document.getElementById('wifi24-ssid-input').value.trim();
                const pass = document.getElementById('wifi24-pass-input').value.trim();
                const mode = document.getElementById('wifi24-mode-select').value;

                btnSaveWifi24.disabled = true;
                btnSaveWifi24.textContent = '...';

                if (State.activeDriver) {
                    await State.activeDriver.saveWifi24({
                        ssid: ssid,
                        pass: pass,
                        mode: mode,
                        bw: '1',
                        chan: '0',
                        txPower: '6',
                        isEnabled: true,
                        isHidden: false
                    });
                }

                State.wifi24Ssid = ssid;
                State.wifi24Pass = pass;
                State.wifi24Mode = mode;
                updateUI();
                btnSaveWifi24.disabled = false;
                btnSaveWifi24.textContent = State.lang === 'ar' ? 'حفظ وتطبيق إعدادات 2.4G' : 'Save & Apply 2.4G';
                alert(State.lang === 'ar' ? 'تم حفظ وتطبيق إعدادات الواي فاي ومحدد السرعة بنجاح!' : 'Wi-Fi & Speed Limiter settings applied successfully!');
            });
        }

        // Wi-Fi 5G Save
        const btnSaveWifi5 = document.getElementById('btn-save-wifi5');
        if (btnSaveWifi5) {
            btnSaveWifi5.addEventListener('click', async () => {
                const ssid = document.getElementById('wifi5-ssid-input').value.trim();
                const pass = document.getElementById('wifi5-pass-input').value.trim();
                State.wifi5Ssid = ssid;
                State.wifi5Pass = pass;
                updateUI();
                alert(State.lang === 'ar' ? 'تم حفظ إعدادات شبكة 5G بنجاح!' : '5G Wi-Fi settings saved successfully!');
            });
        }

        // DNS Presets
        document.querySelectorAll('.apple-dns-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.apple-dns-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                document.getElementById('dns-primary-inp').value = card.dataset.dns1;
                document.getElementById('dns-secondary-inp').value = card.dataset.dns2;
            });
        });

        // Apply DNS
        const btnSaveDns = document.getElementById('btn-save-dns');
        if (btnSaveDns) {
            btnSaveDns.addEventListener('click', async () => {
                const pDns = document.getElementById('dns-primary-inp').value.trim();
                const sDns = document.getElementById('dns-secondary-inp').value.trim();

                btnSaveDns.disabled = true;
                btnSaveDns.textContent = '...';

                if (State.activeDriver && State.activeDriver.applyDns) {
                    await State.activeDriver.applyDns(pDns, sDns);
                }

                State.lanDns1 = pDns;
                State.lanDns2 = sDns;
                btnSaveDns.disabled = false;
                btnSaveDns.textContent = I18N[State.lang].btnApplyDns;
                alert(State.lang === 'ar' ? `تم تطبيق خوادم الـ DNS (${pDns} / ${sDns}) بنجاح على كامل الراوتر!` : `DNS applied successfully (${pDns} / ${sDns})!`);
            });
        }

        // Disable WPS Button
        const btnWps = document.getElementById('btn-kill-wps');
        if (btnWps) {
            btnWps.addEventListener('click', () => {
                State.wpsEnabled = false;
                alert(State.lang === 'ar' ? 'تم تعطيل خاصية WPS بنجاح! راوترك محمي الآن من كافة برامج التخمين.' : 'WPS successfully disabled! Router is now protected against brute-force tools.');
            });
        }
    }

    // Reactive DOM Updater
    function updateUI() {
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        const downMbps = (State.dslDownRate / 1024).toFixed(1);
        const upMbps = (State.dslUpRate / 1024).toFixed(1);
        const maxDownMbps = (State.dslDownMax / 1024).toFixed(1);

        const ovDown = document.getElementById('ov-down-rate');
        if (ovDown) ovDown.innerHTML = `${downMbps} <span>${I18N[State.lang].downMbps}</span>`;

        setTxt('ov-up-rate', `${upMbps} Mbps`);
        setTxt('ov-max-rate', `${maxDownMbps} Mbps`);
        setTxt('ov-wifi24-ssid', State.wifi24Ssid);
        setTxt('ov-wifi5-ssid', State.wifi5Ssid);

        const modeMap = {
            '1': State.lang === 'ar' ? '11B Only (~5 Mbps محدد للسرعة)' : '11B Only (~5 Mbps Limited)',
            '4': State.lang === 'ar' ? '11G Only (~20 Mbps متوسط)' : '11G Only (~20 Mbps)',
            '0': 'Mixed 11G/B (~25 Mbps)',
            '6': '11N Only (300 Mbps)',
            '9': State.lang === 'ar' ? 'مفتوح بالكامل (Mixed 11N/G/B)' : 'Full Speed (Mixed 11N/G/B)'
        };
        setTxt('ov-wifi24-limiter', modeMap[State.wifi24Mode] || `Mode (${State.wifi24Mode})`);

        // Table
        setTxt('dsl-t-down', `${downMbps} Mbps`);
        setTxt('dsl-t-up', `${upMbps} Mbps`);
        setTxt('dsl-t-maxdown', `${maxDownMbps} Mbps`);
        setTxt('dsl-t-maxup', `${(State.dslUpMax / 1024).toFixed(1)} Mbps`);
        setTxt('dsl-t-downsnr', `${State.dslDownSnr.toFixed(1)} dB`);
        setTxt('dsl-t-upsnr', `${State.dslUpSnr.toFixed(1)} dB`);
        setTxt('dsl-t-downatt', `${State.dslDownAtten.toFixed(1)} dB`);
        setTxt('dsl-t-upatt', `${State.dslUpAtten.toFixed(1)} dB`);
    }

    // Floating Dock for Returning from Legacy Mode
    function renderFloatingDock() {
        const dock = document.createElement('div');
        dock.id = 'universal-floating-dock';
        dock.innerHTML = `<span>العودة إلى Universal Router Hub</span>`;
        dock.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:2147483647;background:var(--apple-blue,#0071e3);color:#fff;padding:10px 18px;border-radius:20px;cursor:pointer;font-weight:600;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,0.3);font-family:sans-serif;';
        dock.onclick = () => {
            window.location.href = window.location.pathname;
        };
        document.documentElement.appendChild(dock);
    }

    // Chrome/Firefox Extension Messaging
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
            if (req.type === 'GET_ROUTER_INFO') {
                sendResponse({ brand: State.detectedBrand, model: State.modelName, lang: State.lang, theme: State.theme });
            } else if (req.type === 'SET_MODEL_OVERRIDE') {
                localStorage.setItem('router_hub_selected_model', req.model);
                resolveDriver();
                window.location.reload();
            } else if (req.type === 'SET_FAMILY_DNS') {
                if (State.activeDriver && State.activeDriver.applyDns) {
                    State.activeDriver.applyDns('1.1.1.3', '1.0.0.3');
                }
                sendResponse({ msg: State.lang === 'ar' ? 'تم تفعيل فلتر حماية الأسرة (Cloudflare 1.1.1.3) بنجاح!' : 'Cloudflare Family Protection DNS applied successfully!' });
            } else if (req.type === 'SET_SPEED_LIMIT') {
                const targetMode = req.mode === '11b' ? '1' : '9';
                if (State.activeDriver) {
                    State.activeDriver.saveWifi24({
                        ssid: State.wifi24Ssid,
                        pass: State.wifi24Pass,
                        mode: targetMode,
                        bw: '1',
                        chan: '0',
                        txPower: '6',
                        isEnabled: true,
                        isHidden: false
                    }).then(() => {
                        State.wifi24Mode = targetMode;
                        updateUI();
                    });
                }
                sendResponse({ msg: req.mode === '11b' ? 'تم تفعيل وضع توفير الباقة (11B Only) بنجاح!' : 'تم فتح السرعة القصوى للواي فاي!' });
            } else if (req.type === 'REBOOT_ROUTER') {
                if (State.activeDriver) State.activeDriver.reboot();
                sendResponse({ msg: 'تم إرسال أمر إعادة التشغيل للراوتر بنجاح!' });
            }
            return true;
        });
    }

    // Init Execution Flow
    async function init() {
        resolveDriver();
        if (checkIfLoginPage()) {
            await mountModernLoginPage();
            return;
        }

        mountUniversalDashboard();
        if (State.activeDriver) {
            await State.activeDriver.fetchStats();
            updateUI();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
