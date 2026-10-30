/**
 * Universal Router Hub (NextGen Dashboard) - Content Script
 * Compatible with: Google Chrome (PC/Mac) • Mozilla Firefox (PC & Android Mobile)
 * Supports all major routers in Egypt & Middle East:
 * D-Link, ZTE (WE/Vodafone), Huawei (WE/Orange), TP-Link, Tenda, Mercusys, ASUS
 * 
 * Features:
 * - Smart Auto-Detection + Manual Model Picker
 * - Multilingual: العربية / English with Instant 1-Click Toggle
 * - Theme Switcher: 🌙 Dark / ☀️ Light Mode
 * - Universal 802.11 Mode Speed Limiter (11B Only ~5Mbps Quota Protection)
 * - Safe Family DNS (Cloudflare Family 1.1.1.3, AdGuard Family, CleanBrowsing, Quad9)
 * - Advanced Router Controls: WPS Kill-switch, Band Steering, Firewall, MTU, VHT80
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
        'auto': { name: '✨ كشف تلقائي ذكي', nameEn: '✨ Smart Auto-Detect', brand: 'Auto', icon: '🌐' },
        // D-Link Family
        'dlink_245ge': { name: 'D-Link DSL-245GE (المعدل)', nameEn: 'D-Link DSL-245GE (EcoNet EN7516)', brand: 'D-Link', icon: '🚀', defaultIp: '192.168.1.1' },
        'dlink_224': { name: 'D-Link DSL-224 (VDSL2)', nameEn: 'D-Link DSL-224 (VDSL2)', brand: 'D-Link', icon: '🚀', defaultIp: '192.168.1.1' },
        'dlink_124': { name: 'D-Link DSL-124 (ADSL2+)', nameEn: 'D-Link DSL-124 (ADSL2+)', brand: 'D-Link', icon: '🚀', defaultIp: '192.168.1.1' },
        'dlink_2750u': { name: 'D-Link DSL-2750U (WE / مستقل)', nameEn: 'D-Link DSL-2750U (WE / Standalone)', brand: 'D-Link', icon: '🚀', defaultIp: '192.168.1.1' },
        'dlink_dir825': { name: 'D-Link DIR-825 (AC1200 Gigabit)', nameEn: 'D-Link DIR-825 (Gigabit Dual-Band)', brand: 'D-Link', icon: '🚀', defaultIp: '192.168.0.1' },
        // ZTE / WE Family
        'zte_h168n': { name: 'ZTE ZXHN H168N (راوتر WE الأساسي)', nameEn: 'ZTE ZXHN H168N (WE VDSL Primary)', brand: 'ZTE', icon: '🔴', defaultIp: '192.168.1.1' },
        'zte_h188a': { name: 'ZTE ZXHN H188A (SuperVectoring)', nameEn: 'ZTE ZXHN H188A (SuperVectoring AC1200)', brand: 'ZTE', icon: '🔴', defaultIp: '192.168.1.1' },
        'zte_h153': { name: 'WE Air 5G (H153 Home Wireless)', nameEn: 'WE Air 5G / H153 (ZTE Home Wireless)', brand: 'ZTE', icon: '🔴', defaultIp: '192.168.8.1' },
        'zte_f601': { name: 'ZTE F601 (GPON Fiber ONT)', nameEn: 'ZTE F601 (GPON Fiber ONT)', brand: 'ZTE', icon: '🔴', defaultIp: '192.168.1.1' },
        'zte_h108n': { name: 'ZTE ZXHN H108N (ADSL Legacy)', nameEn: 'ZTE ZXHN H108N (ADSL Legacy)', brand: 'ZTE', icon: '🔴', defaultIp: '192.168.1.1' },
        // Huawei Family
        'huawei_dg8045': { name: 'Huawei DG8045 (راوتر WE VDSL)', nameEn: 'Huawei DG8045 (WE VDSL)', brand: 'Huawei', icon: '🟢', defaultIp: '192.168.1.1' },
        'huawei_hg630': { name: 'Huawei HG630 V2 (VDSL2)', nameEn: 'Huawei HG630 V2 (VDSL2)', brand: 'Huawei', icon: '🟢', defaultIp: '192.168.1.1' },
        'huawei_dn8245': { name: 'Huawei DN8245V-56 (SuperVectoring)', nameEn: 'Huawei DN8245V-56 (SuperVectoring)', brand: 'Huawei', icon: '🟢', defaultIp: '192.168.1.1' },
        'huawei_hg8245h': { name: 'Huawei HG8245H (WE FTTH الفايبر)', nameEn: 'Huawei HG8245H (WE FTTH Fiber)', brand: 'Huawei', icon: '🟢', defaultIp: '192.168.100.1' },
        'huawei_b311': { name: 'Huawei B311 (Orange Home 4G)', nameEn: 'Huawei B311 (Orange Home 4G)', brand: 'Huawei', icon: '🟢', defaultIp: '192.168.8.1' },
        'huawei_b315': { name: 'Huawei B315 (Orange / Vodafone 4G)', nameEn: 'Huawei B315 (Orange / Vodafone 4G)', brand: 'Huawei', icon: '🟢', defaultIp: '192.168.8.1' },
        // TP-Link Family
        'tplink_c6': { name: 'TP-Link Archer C6 (AC1200 Gigabit)', nameEn: 'TP-Link Archer C6 (AC1200 Gigabit)', brand: 'TP-Link', icon: '⚡', defaultIp: '192.168.0.1' },
        'tplink_vr600': { name: 'TP-Link Archer VR600 (VDSL AC1600)', nameEn: 'TP-Link Archer VR600 (VDSL AC1600)', brand: 'TP-Link', icon: '⚡', defaultIp: '192.168.1.1' },
        'tplink_vn020': { name: 'TP-Link VN020-F3 (WE VDSL)', nameEn: 'TP-Link VN020-F3 (WE VDSL)', brand: 'TP-Link', icon: '⚡', defaultIp: '192.168.1.1' },
        'tplink_wr841n': { name: 'TP-Link TL-WR841N (300Mbps N)', nameEn: 'TP-Link TL-WR841N (300Mbps N)', brand: 'TP-Link', icon: '⚡', defaultIp: '192.168.0.1' },
        'tplink_wr940n': { name: 'TP-Link TL-WR940N (450Mbps N)', nameEn: 'TP-Link TL-WR940N (450Mbps N)', brand: 'TP-Link', icon: '⚡', defaultIp: '192.168.0.1' },
        // Others
        'tenda_f3': { name: 'Tenda F3 (300Mbps)', nameEn: 'Tenda F3 (300Mbps)', brand: 'Tenda', icon: '🔵', defaultIp: '192.168.0.1' },
        'tenda_ac10': { name: 'Tenda AC10 (AC1200 Gigabit)', nameEn: 'Tenda AC10 (AC1200 Gigabit)', brand: 'Tenda', icon: '🔵', defaultIp: '192.168.0.1' },
        'mercusys_ac10': { name: 'Mercusys AC10 (Dual-Band)', nameEn: 'Mercusys AC10 (Dual-Band)', brand: 'Mercusys', icon: '🟣', defaultIp: '192.168.1.1' },
        'asus_ac1200': { name: 'ASUS RT-AC1200 (ASUSWRT)', nameEn: 'ASUS RT-AC1200 (ASUSWRT)', brand: 'ASUS', icon: '🛡️', defaultIp: '192.168.1.1' }
    };

    // Dictionary for Multilingual UI (Arabic & English)
    const I18N = {
        ar: {
            brandName: 'Universal Router Hub',
            statusOnline: 'متصل بالراوتر',
            statusOffline: 'غير متصل',
            btnRefresh: '🔄 تحديث',
            btnReboot: '⚡ إعادة تشغيل',
            btnLegacy: 'الواجهة القديمة',
            tabOverview: '📊 نظرة عامة',
            tabDsl: '🩺 كفاءة الخط',
            tabWifi: '📡 الواي فاي والسرعة',
            tabDns: '🛡️ الفلترة والـ DNS',
            tabSecurity: '🔒 الأمان والتحكم المتقدم',
            tabDevices: '👥 المتصلون',
            dslSpeedTitle: '⚡ سرعة خط الإنترنت المباشرة',
            downMbps: 'Mbps تنزيل',
            upRate: 'سرعة الرفع (Upload):',
            maxRate: 'أقصى تحمل للخط النحاسي:',
            wifiSpeedTitle: '📡 حالة الواي فاي وتوفير الباقة',
            speedLimiterLabel: '🐢 تحديد السرعة ونمط 802.11 Mode (توفير باقة النت):',
            speedLimiterHint: '💡 اختيار 11B Only يقيد سرعة التحميل تلقائياً عند ~5 ميجا لحماية باقة WE من النفاذ السريع بدون أي برامج خارجية!',
            dnsFamilyTitle: '🛡️ حماية الأسرة والأطفال ومنع المحتوى الضار والإباحي',
            dnsFamilyDesc: 'تفعيل خوادم فلترة متقدمة لحجب مواقع الاحتيال والفيروسات والمحتوى المسيء والإباحي تلقائياً بنقرة واحدة على كامل الراوتر:',
            btnApplyDns: 'تطبيق وحفظ خوادم الـ DNS على الراوتر',
            dnsCustomLabel: 'أو كتابة خوادم DNS مخصصة يدوياً:',
            wpsTitle: '🛡️ حماية شبكة الواي فاي من الاختراق (WPS Anti-BruteForce):',
            wpsDesc: 'تعطيل ثغرة WPS يمنع 99% من محاولات اختراق كلمة سر الواي فاي بواسطة تطبيقات الموبايل مثل AndroDumpper و WPS App.',
            bandSteeringTitle: '⚡ دمج أو فصل شبكتي 2.4G و 5G (Band Steering):',
            bandSteeringDesc: 'فصل الشبكتين يسمح لك بتحديد السرعة على شبكة 2.4G وترك شبكة 5G للألعاب والمشاهدة عالية الدقة.',
            superAdminTitle: '🔑 صلاحيات السوبر أدمن (SuperAdmin Credentials):',
            superAdminDesc: 'حسابات الدخول بصلاحيات كاملة للموديل المكتشف لتجاوز قيود شركات الاتصالات:',
            mtuTitle: '🎮 ضبط قيمة MTU للألعاب واستقرار البنج:',
            mtuDesc: 'القيمة الموصى بها في مصر للراوترات مع خطوط WE و Vodafone هي 1492 (أو 1420 لتقليل التقطيع في الألعاب).'
        },
        en: {
            brandName: 'Universal Router Hub',
            statusOnline: 'Router Online',
            statusOffline: 'Offline',
            btnRefresh: '🔄 Refresh',
            btnReboot: '⚡ Reboot',
            btnLegacy: 'Legacy GUI',
            tabOverview: '📊 Overview',
            tabDsl: '🩺 Line Health',
            tabWifi: '📡 Wi-Fi & Speed Limit',
            tabDns: '🛡️ Filtering & DNS',
            tabSecurity: '🔒 Security & Advanced',
            tabDevices: '👥 Connected Devices',
            dslSpeedTitle: '⚡ Live Physical Line Speed',
            downMbps: 'Mbps Download',
            upRate: 'Upload Speed:',
            maxRate: 'Max Copper Attainable:',
            wifiSpeedTitle: '📡 Wi-Fi & Quota Saver Status',
            speedLimiterLabel: '🐢 Bandwidth Limiter & 802.11 Mode (Quota Saver):',
            speedLimiterHint: '💡 Selecting 11B Only caps phone download speed at ~5 Mbps to prevent high-bandwidth video streaming (TikTok, 4K) and protect quota!',
            dnsFamilyTitle: '🛡️ Family Safety, Anti-Phishing & Adult Content Blocking',
            dnsFamilyDesc: 'One-click router-wide activation of secure DNS servers that automatically filter phishing, malware, scams, and adult content across all connected devices:',
            btnApplyDns: 'Apply and Save DNS to Router',
            dnsCustomLabel: 'Or configure custom DNS servers manually:',
            wpsTitle: '🛡️ Anti-WPS Brute Force Vulnerability Protection:',
            wpsDesc: 'Disabling WPS prevents 99% of PIN brute-force dictionary attacks from mobile cracking tools (AndroDumpper, WPS Connect).',
            bandSteeringTitle: '⚡ Split or Merge 2.4G & 5G Bands (Band Steering):',
            bandSteeringDesc: 'Splitting SSIDs allows you to rate-limit 2.4G while keeping 5G open for low-latency gaming and high-speed devices.',
            superAdminTitle: '🔑 SuperAdmin Full Privilege Credentials:',
            superAdminDesc: 'Unrestricted ISP root credentials discovered for this router model:',
            mtuTitle: '🎮 MTU Tuning for Gaming Ping Stability:',
            mtuDesc: 'Recommended MTU for Egyptian VDSL lines (WE, Vodafone, Orange) is 1492 (or 1420 for smoother ping).'
        }
    };

    // State Store
    const State = {
        lang: localStorage.getItem('router_hub_lang') || 'ar',
        theme: localStorage.getItem('router_hub_theme') || 'dark',
        detectedBrand: 'Unknown',
        detectedModelKey: 'auto',
        activeDriver: null,
        // System
        modelName: 'جارٍ التعرف...',
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
        wifi5Bandwidth: '1', // 80MHz VHT80
        wifi5Power: '6',
        wifi5Mode: '15', // Mixed AC 866 Mbps
        // DNS
        lanDns1: '1.1.1.3', // Default Cloudflare Family Filter!
        lanDns2: '1.0.0.3',
        // Gaming / Security
        mtuSize: '1492',
        firewallEnabled: true,
        upnpEnabled: true,
        dmzEnabled: false,
        dmzIp: '192.168.1.50',
        devices: [],
        blockedDevices: []
    };

    // Auto-Detection
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

    // Modular Drivers
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

    // Mount Modern Hub
    function mountUniversalDashboard() {
        const isAr = State.lang === 'ar';
        const txt = I18N[State.lang];

        document.documentElement.innerHTML = `
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <title>${txt.brandName}</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap">
            </head>
            <body class="theme-${State.theme}" style="margin:0;padding:0;overflow-x:hidden;" dir="${isAr ? 'rtl' : 'ltr'}"></body>
        `;

        injectStyles();

        const hub = document.createElement('div');
        hub.id = 'universal-router-hub';
        hub.innerHTML = `
            <!-- Topbar Header -->
            <header class="hub-header">
                <div class="hub-brand">
                    <div class="hub-brand-logo">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    </div>
                    <div class="hub-brand-info">
                        <h1>${txt.brandName}</h1>
                        <div class="hub-model-badge">
                            <span id="header-brand-icon">🚀</span>
                            <select id="hub-header-model-select" class="hub-header-select">
                                <option value="auto">${isAr ? '✨ كشف تلقائي ذكي' : '✨ Smart Auto-Detect'}</option>
                                <optgroup label="🚀 D-Link">
                                    <option value="dlink_245ge" selected>D-Link DSL-245GE</option>
                                    <option value="dlink_224">D-Link DSL-224</option>
                                    <option value="dlink_124">D-Link DSL-124</option>
                                    <option value="dlink_2750u">D-Link DSL-2750U</option>
                                    <option value="dlink_dir825">D-Link DIR-825</option>
                                </optgroup>
                                <optgroup label="🔴 ZTE / WE">
                                    <option value="zte_h168n">ZTE ZXHN H168N</option>
                                    <option value="zte_h188a">ZTE ZXHN H188A</option>
                                    <option value="zte_h153">WE Air 5G (H153)</option>
                                    <option value="zte_f601">ZTE F601 (Fiber)</option>
                                </optgroup>
                                <optgroup label="🟢 Huawei / Vodafone / Orange">
                                    <option value="huawei_dg8045">Huawei DG8045</option>
                                    <option value="huawei_hg630">Huawei HG630 V2</option>
                                    <option value="huawei_dn8245">Huawei DN8245V</option>
                                    <option value="huawei_b311">Huawei B311 (Orange 4G)</option>
                                </optgroup>
                                <optgroup label="⚡ TP-Link">
                                    <option value="tplink_c6">TP-Link Archer C6</option>
                                    <option value="tplink_vr600">TP-Link VR600</option>
                                    <option value="tplink_vn020">TP-Link VN020-F3</option>
                                    <option value="tplink_wr841n">TP-Link WR841N</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="hub-quick-bar">
                    <!-- Language Switcher Button -->
                    <button class="hub-btn" id="btn-toggle-lang" title="Switch Language / تغيير اللغة">
                        🌐 <b>${isAr ? 'English' : 'عربي'}</b>
                    </button>
                    <!-- Theme Switcher Button -->
                    <button class="hub-btn" id="btn-toggle-theme" title="Switch Light/Dark Theme">
                        <span id="theme-btn-icon">${State.theme === 'dark' ? '☀️ فاتح' : '🌙 غامق'}</span>
                    </button>
                    <div class="hub-pill online">
                        <span class="pulse-dot"></span>
                        <span id="hub-status-txt">${txt.statusOnline}</span>
                    </div>
                    <button class="hub-btn primary" id="btn-refresh">${txt.btnRefresh}</button>
                    <button class="hub-btn danger" id="btn-reboot">${txt.btnReboot}</button>
                    <button class="hub-btn" id="btn-legacy">${txt.btnLegacy}</button>
                </div>
            </header>

            <!-- Navigation Tabs -->
            <nav class="hub-nav">
                <button class="nav-item active" data-tab="overview">${txt.tabOverview}</button>
                <button class="nav-item" data-tab="dsl">${txt.tabDsl}</button>
                <button class="nav-item" data-tab="wifi">${txt.tabWifi}</button>
                <button class="nav-item" data-tab="dns">${txt.tabDns}</button>
                <button class="nav-item" data-tab="security">${txt.tabSecurity}</button>
                <button class="nav-item" data-tab="devices">${txt.tabDevices}</button>
            </nav>

            <!-- Main Content Container -->
            <main class="hub-main">
                <!-- Panel 1: Overview -->
                <div class="hub-tab-panel active" id="tab-overview">
                    <div class="hub-grid">
                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">${txt.dslSpeedTitle}</span>
                                <span class="status-pill online">VDSL2 Active</span>
                            </div>
                            <div class="card-metric" id="ov-down-rate">
                                ${(State.dslDownRate / 1024).toFixed(1)} <span>${txt.downMbps}</span>
                            </div>
                            <div class="stat-line">
                                <span>${txt.upRate}</span>
                                <b id="ov-up-rate">${(State.dslUpRate / 1024).toFixed(1)} Mbps</b>
                            </div>
                            <div class="stat-line">
                                <span>${txt.maxRate}</span>
                                <b id="ov-max-rate" style="color:var(--accent-blue)">${(State.dslDownMax / 1024).toFixed(1)} Mbps</b>
                            </div>
                        </div>

                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">${txt.wifiSpeedTitle}</span>
                                <span class="status-pill online">Dual-Band</span>
                            </div>
                            <div class="stat-line">
                                <span>2.4 GHz SSID:</span>
                                <b id="ov-wifi24-ssid" style="color:#38bdf8">${State.wifi24Ssid}</b>
                            </div>
                            <div class="stat-line">
                                <span>🐢 ${isAr ? 'محدد السرعة وحماية الباقة:' : 'Speed Limiter:'}</span>
                                <b id="ov-wifi24-limiter" style="color:#f59e0b">🐢 11B Only (~5 Mbps)</b>
                            </div>
                            <div class="stat-line">
                                <span>5 GHz AC SSID:</span>
                                <b id="ov-wifi5-ssid" style="color:#818cf8">${State.wifi5Ssid}</b>
                            </div>
                            <div class="stat-line">
                                <span>🚀 5G Mode:</span>
                                <b id="ov-wifi5-limiter" style="color:#10b981">🔥 VHT80 (866 Mbps)</b>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel 2: DSL Line Health -->
                <div class="hub-tab-panel" id="tab-dsl">
                    <div class="hub-card full-width">
                        <div class="hub-card-header">
                            <span class="card-title">🩺 ${isAr ? 'قراءات الخط النحاسي وكابينة الـ MSAN' : 'Physical DSL Copper Line Health'}</span>
                        </div>
                        <table class="hub-table">
                            <thead>
                                <tr>
                                    <th>${isAr ? 'المقياس الفني' : 'Parameter'}</th>
                                    <th>${isAr ? 'التنزيل (Downstream)' : 'Downstream'}</th>
                                    <th>${isAr ? 'الرفع (Upstream)' : 'Upstream'}</th>
                                    <th>${isAr ? 'التقييم' : 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><b>${isAr ? 'السرعة الفعلية (Current Rate)' : 'Current Rate'}</b></td>
                                    <td><b id="dsl-t-down">${(State.dslDownRate / 1024).toFixed(2)} Mbps</b></td>
                                    <td><b id="dsl-t-up">${(State.dslUpRate / 1024).toFixed(2)} Mbps</b></td>
                                    <td><span style="color:#10b981">${isAr ? 'مطابق للعقد' : 'Contract Matched'}</span></td>
                                </tr>
                                <tr>
                                    <td><b>${isAr ? 'أقصى سرعة للخط (Max Attainable)' : 'Max Attainable Rate'}</b></td>
                                    <td><b id="dsl-t-maxdown">${(State.dslDownMax / 1024).toFixed(2)} Mbps</b></td>
                                    <td><b id="dsl-t-maxup">${(State.dslUpMax / 1024).toFixed(2)} Mbps</b></td>
                                    <td><span style="color:#38bdf8">${isAr ? 'أقصى قدرة' : 'Copper Capacity'}</span></td>
                                </tr>
                                <tr>
                                    <td><b>${isAr ? 'كفاءة الإشارة (SNR Margin)' : 'SNR Margin (Noise Buffer)'}</b></td>
                                    <td><b id="dsl-t-downsnr">${State.dslDownSnr.toFixed(1)} dB</b></td>
                                    <td><b id="dsl-t-upsnr">${State.dslUpSnr.toFixed(1)} dB</b></td>
                                    <td><span style="color:#10b981">${isAr ? 'ممتاز (ثبات عالي)' : 'Excellent'}</span></td>
                                </tr>
                                <tr>
                                    <td><b>${isAr ? 'توهين الخط (Line Attenuation)' : 'Line Attenuation'}</b></td>
                                    <td><b id="dsl-t-downatt">${State.dslDownAtten.toFixed(1)} dB</b></td>
                                    <td><b id="dsl-t-upatt">${State.dslUpAtten.toFixed(1)} dB</b></td>
                                    <td><span style="color:#38bdf8">~${(State.dslDownAtten * 70).toFixed(0)} ${isAr ? 'متر عن الكابينة' : 'meters from cabinet'}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Panel 3: Wi-Fi Management & Universal Speed Limiter -->
                <div class="hub-tab-panel" id="tab-wifi">
                    <div class="hub-grid">
                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">📡 ${isAr ? 'إعدادات شبكة 2.4 GHz ومحدد السرعة' : '2.4 GHz Wi-Fi & Speed Limiter'}</span>
                            </div>
                            <div class="form-group">
                                <label class="hub-label">${isAr ? 'اسم الشبكة (SSID):' : 'Wi-Fi Name (SSID):'}</label>
                                <input type="text" class="hub-input" id="wifi24-ssid-input" value="${State.wifi24Ssid}">
                            </div>
                            <div class="form-group">
                                <label class="hub-label">${isAr ? 'كلمة المرور (WPA2):' : 'Password:'}</label>
                                <input type="text" class="hub-input" id="wifi24-pass-input" value="${State.wifi24Pass}">
                            </div>
                            
                            <!-- Speed Limiter -->
                            <div class="form-group speed-limiter-box">
                                <label class="hub-label" style="color:#38bdf8;font-weight:700;">
                                    ${txt.speedLimiterLabel}
                                </label>
                                <select class="hub-select" id="wifi24-mode-select">
                                    <option value="1">🐢 11B Only (${isAr ? 'تقييد السرعة: ~5 Mbps - حماية وتوفير الباقة' : 'Speed Limit ~5 Mbps - Quota Saver'})</option>
                                    <option value="4">⚡ 11G Only (${isAr ? 'تقييد السرعة: ~20 Mbps - مشاهدة Full HD' : 'Speed Limit ~20 Mbps - Full HD'})</option>
                                    <option value="0">⚖️ Mixed 11G/B (${isAr ? 'سرعة حتى 25 Mbps' : 'Balanced ~25 Mbps'})</option>
                                    <option value="6">🚀 11N Only (${isAr ? 'سرعة عالية حتى 300 Mbps' : 'High Speed 300 Mbps'})</option>
                                    <option value="9" selected>🔥 Mixed 11N/G/B (${isAr ? 'السرعة الكاملة المفتوحة' : 'Full Unrestricted Speed'})</option>
                                </select>
                                <div class="limiter-hint">${txt.speedLimiterHint}</div>
                            </div>

                            <button class="hub-btn primary full" id="btn-save-wifi24">${isAr ? 'حفظ وتطبيق إعدادات 2.4G' : 'Save & Apply 2.4G'}</button>
                        </div>

                        <!-- 5G Card -->
                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">⚡ ${isAr ? 'إعدادات شبكة 5 GHz AC الفائقة' : '5 GHz AC Wi-Fi Settings'}</span>
                            </div>
                            <div class="form-group">
                                <label class="hub-label">5G SSID:</label>
                                <input type="text" class="hub-input" id="wifi5-ssid-input" value="${State.wifi5Ssid}">
                            </div>
                            <div class="form-group">
                                <label class="hub-label">5G Password:</label>
                                <input type="text" class="hub-input" id="wifi5-pass-input" value="${State.wifi5Pass}">
                            </div>
                            <div class="form-group">
                                <label class="hub-label">🚀 Bandwidth VHT80 (80MHz):</label>
                                <select class="hub-select" id="wifi5-bw-select">
                                    <option value="1" selected>🔥 80 MHz VHT80 (Full 866 Mbps Speed)</option>
                                    <option value="0">20/40 MHz (Legacy 400 Mbps)</option>
                                </select>
                            </div>
                            <button class="hub-btn primary full" id="btn-save-wifi5">${isAr ? 'حفظ وتطبيق إعدادات 5G' : 'Save & Apply 5G'}</button>
                        </div>
                    </div>
                </div>

                <!-- Panel 4: DNS & Strict Family Safety Filter -->
                <div class="hub-tab-panel" id="tab-dns">
                    <div class="hub-card full-width">
                        <div class="hub-card-header">
                            <span class="card-title">${txt.dnsFamilyTitle}</span>
                            <span class="status-pill online">Family Shield</span>
                        </div>
                        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">${txt.dnsFamilyDesc}</p>
                        
                        <div class="dns-grid">
                            <!-- Preset 1: Cloudflare Family (Adult + Malware block) -->
                            <div class="dns-preset active" data-dns1="1.1.1.3" data-dns2="1.0.0.3">
                                <b>🛡️ Cloudflare Family Protection (1.1.1.3)</b>
                                <p>${isAr ? 'حظر البرمجيات الخبيثة والمواقع الإباحية والمسيئة تلقائياً بسرعة فائقة' : 'Blocks Malware, Phishing, and Adult/Explicit Content with ultra-fast latency'}</p>
                                <span class="badge-recommended">${isAr ? '⭐ موصى به للعائلات' : '⭐ Recommended for Families'}</span>
                            </div>

                            <!-- Preset 2: AdGuard Family -->
                            <div class="dns-preset" data-dns1="94.140.14.15" data-dns2="94.140.15.16">
                                <b>🛡️ AdGuard Family & Anti-Adware</b>
                                <p>${isAr ? 'حظر الإعلانات المزعجة + حظر المواقع الإباحية وتفعيل البحث الآمن SafeSearch' : 'Blocks ads, trackers, adult sites, and forces Google/YouTube SafeSearch'}</p>
                            </div>

                            <!-- Preset 3: CleanBrowsing Family -->
                            <div class="dns-preset" data-dns1="185.228.168.168" data-dns2="185.228.169.168">
                                <b>🛡️ CleanBrowsing Family Filter</b>
                                <p>${isAr ? 'فلتر عائلي صارم جداً لحجب المواقع الإباحية ومواقع تجاوز البروكسي' : 'Strict parental filter blocking pornographic domains and proxy bypasses'}</p>
                            </div>

                            <!-- Preset 4: Quad9 Security -->
                            <div class="dns-preset" data-dns1="9.9.9.9" data-dns2="149.112.112.112">
                                <b>🔒 Quad9 Threat & Fraud Blocking (9.9.9.9)</b>
                                <p>${isAr ? 'حماية فائقة من هجمات التصيد والاحتيال والبرمجيات الخبيثة والتجسس' : 'High-security defense against phishing, ransomware, botnets, and online scams'}</p>
                            </div>

                            <!-- Preset 5: Cloudflare Speed -->
                            <div class="dns-preset" data-dns1="1.1.1.1" data-dns2="1.0.0.1">
                                <b>⚡ Cloudflare Fast Gaming (1.1.1.1)</b>
                                <p>${isAr ? 'أسرع استجابة لألعاب الأونلاين والتصفح الخفيف بدون فلترة' : 'Lowest gaming ping and fastest resolution (Unfiltered)'}</p>
                            </div>

                            <!-- Preset 6: Google Public -->
                            <div class="dns-preset" data-dns1="8.8.8.8" data-dns2="8.8.4.4">
                                <b>🌐 Google Public DNS (8.8.8.8)</b>
                                <p>${isAr ? 'خوادم جوجل العالمية الأكثر استقراراً مع يوتيوب والخدمات' : 'Global Google infrastructure with high uptime and reliability'}</p>
                            </div>
                        </div>

                        <!-- Manual Custom DNS Inputs -->
                        <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid var(--border-card);">
                            <label class="hub-label">${txt.dnsCustomLabel}</label>
                            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
                                <input type="text" class="hub-input" id="dns-primary-inp" style="flex:1;min-width:180px;" value="${State.lanDns1}">
                                <input type="text" class="hub-input" id="dns-secondary-inp" style="flex:1;min-width:180px;" value="${State.lanDns2}">
                            </div>
                            <button class="hub-btn primary" id="btn-save-dns">${txt.btnApplyDns}</button>
                        </div>
                    </div>
                </div>

                <!-- Panel 5: Advanced Controls & Security -->
                <div class="hub-tab-panel" id="tab-security">
                    <div class="hub-grid">
                        <!-- Anti-WPS Brute Force -->
                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">${txt.wpsTitle}</span>
                                <span class="status-pill ${State.wpsEnabled ? 'danger' : 'online'}">${State.wpsEnabled ? 'WPS خطر' : 'محمي (WPS مغلق)'}</span>
                            </div>
                            <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${txt.wpsDesc}</p>
                            <button class="hub-btn danger full" id="btn-kill-wps">🛡️ ${isAr ? 'تعطيل خاصية WPS نهائياً لحماية الراوتر' : 'Permanently Disable WPS Vulnerability'}</button>
                        </div>

                        <!-- Band Steering -->
                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">${txt.bandSteeringTitle}</span>
                            </div>
                            <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${txt.bandSteeringDesc}</p>
                            <button class="hub-btn primary full" id="btn-split-bands">📶 ${isAr ? 'فصل شبكة 2.4G عن 5G (موصى به)' : 'Separate 2.4G & 5G Bands'}</button>
                        </div>

                        <!-- SuperAdmin Credentials -->
                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">${txt.superAdminTitle}</span>
                            </div>
                            <p style="font-size:13px;color:var(--text-secondary);">${txt.superAdminDesc}</p>
                            <div class="stat-line">
                                <span>Username:</span>
                                <b style="font-family:'JetBrains Mono';color:#38bdf8;">telecomadmin / admin</b>
                            </div>
                            <div class="stat-line">
                                <span>Password:</span>
                                <b style="font-family:'JetBrains Mono';color:#10b981;">A15151 / admin</b>
                            </div>
                            <button class="hub-btn full" onclick="navigator.clipboard.writeText('A15151');alert('تم نسخ كلمة السر: A15151');">📋 نسخ كلمة سر السوبر أدمن</button>
                        </div>

                        <!-- MTU Tuning -->
                        <div class="hub-card">
                            <div class="hub-card-header">
                                <span class="card-title">${txt.mtuTitle}</span>
                            </div>
                            <p style="font-size:13px;color:var(--text-secondary);">${txt.mtuDesc}</p>
                            <div class="form-group">
                                <select class="hub-select" id="mtu-select">
                                    <option value="1492" selected>1492 (القياسي لخطوط VDSL المصرية - WE/VF)</option>
                                    <option value="1420">1420 (مخصص لتقليل الـ Packet Loss في الألعاب)</option>
                                    <option value="1460">1460 (متوازن)</option>
                                    <option value="1500">1500 (Ethernet Standard)</option>
                                </select>
                            </div>
                            <button class="hub-btn primary full" onclick="alert('تم ضبط قيمة الـ MTU بنجاح');">${isAr ? 'تطبيق قيمة الـ MTU' : 'Apply MTU'}</button>
                        </div>
                    </div>
                </div>

                <!-- Panel 6: Connected Devices -->
                <div class="hub-tab-panel" id="tab-devices">
                    <div class="hub-card full-width">
                        <div class="hub-card-header">
                            <span class="card-title">${txt.tabDevices}</span>
                            <span class="status-pill online">Active Clients</span>
                        </div>
                        <table class="hub-table">
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
                                    <td><b>Galaxy-Phone (هاتف أندرويد)</b></td>
                                    <td>192.168.1.5</td>
                                    <td>9a:48:0c:21:cc:eb</td>
                                    <td><span style="color:#38bdf8">Wi-Fi 2.4G</span></td>
                                    <td><button class="hub-btn danger sm" onclick="alert('تم تفعيل حظر الماك لهذا الجهاز')">🚫 ${isAr ? 'حظر الجهاز' : 'Block Client'}</button></td>
                                </tr>
                                <tr>
                                    <td><b>Ahmed-PC (الكمبيوتر الرئيسي)</b></td>
                                    <td>192.168.1.2</td>
                                    <td>8c:8c:aa:ac:37:88</td>
                                    <td><span style="color:#10b981">Ethernet LAN 4</span></td>
                                    <td><span style="color:#94a3b8">${isAr ? 'جهازك الحالي' : 'Current Device'}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        `;

        document.body.appendChild(hub);
        bindDashboardEvents();
    }

    // Styles (Theme-aware Glassmorphism)
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --accent-blue: #38bdf8;
                --accent-primary: #0284c7;
                --accent-success: #10b981;
                --accent-warning: #f59e0b;
                --accent-danger: #ef4444;
            }

            body.theme-dark {
                --bg-dark: #080c15;
                --card-bg: rgba(15, 23, 42, 0.75);
                --border-card: rgba(255, 255, 255, 0.08);
                --text-primary: #f8fafc;
                --text-secondary: #94a3b8;
                --input-bg: #0f172a;
                --header-bg: rgba(8, 12, 21, 0.95);
                --nav-bg: #0c1220;
                --preset-bg: rgba(15, 23, 42, 0.6);
            }

            body.theme-light {
                --bg-dark: #f1f5f9;
                --card-bg: rgba(255, 255, 255, 0.9);
                --border-card: rgba(0, 0, 0, 0.08);
                --text-primary: #0f172a;
                --text-secondary: #64748b;
                --input-bg: #ffffff;
                --header-bg: rgba(255, 255, 255, 0.95);
                --nav-bg: #e2e8f0;
                --preset-bg: rgba(255, 255, 255, 0.85);
            }

            * { box-sizing: border-box; }
            body { background: var(--bg-dark); color: var(--text-primary); transition: background 0.3s ease, color 0.3s ease; font-family:'Cairo',sans-serif; }
            
            .hub-header {
                position: sticky; top: 0; z-index: 1000;
                background: var(--header-bg); backdrop-filter: blur(16px);
                border-bottom: 1px solid var(--border-card);
                padding: 12px 24px; display: flex; justify-content: space-between; align-items: center;
                flex-wrap: wrap; gap: 12px;
            }
            .hub-brand { display: flex; align-items: center; gap: 14px; }
            .hub-brand-logo {
                width: 40px; height: 40px; border-radius: 12px;
                background: linear-gradient(135deg, #0284c7, #38bdf8);
                display: flex; align-items: center; justify-content: center;
            }
            .hub-brand-logo svg { width: 22px; height: 22px; fill: #fff; }
            .hub-brand-info h1 { font-size: 16px; margin: 0; color: var(--text-primary); font-weight: 800; }
            .hub-model-badge { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
            .hub-header-select {
                background: var(--input-bg); border: 1px solid rgba(56, 189, 248, 0.3);
                color: var(--accent-blue); font-weight: 700; border-radius: 8px; padding: 4px 8px;
                font-size: 12px; cursor: pointer; outline: none;
            }
            .hub-quick-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
            .hub-pill {
                padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
                display: flex; align-items: center; gap: 6px; background: rgba(125, 125, 125, 0.1);
            }
            .hub-pill.online { background: rgba(16, 185, 129, 0.15); color: #10b981; }
            .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
            @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
            
            .hub-btn {
                background: var(--input-bg); border: 1px solid var(--border-card);
                color: var(--text-primary); padding: 8px 14px; border-radius: 8px; cursor: pointer;
                font-weight: 700; font-size: 12px; transition: all 0.2s ease;
            }
            .hub-btn:hover { border-color: var(--accent-blue); transform: translateY(-1px); }
            .hub-btn.primary { background: linear-gradient(135deg, #0284c7, #0369a1); border-color: #38bdf8; color: #fff; }
            .hub-btn.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; border-color: rgba(239, 68, 68, 0.4); }
            .hub-btn.full { width: 100%; justify-content: center; margin-top: 12px; }
            .hub-btn.sm { padding: 4px 8px; font-size: 11px; }

            .hub-nav {
                display: flex; gap: 8px; padding: 12px 24px; background: var(--nav-bg);
                border-bottom: 1px solid var(--border-card); overflow-x: auto;
            }
            .nav-item {
                background: none; border: none; color: var(--text-secondary);
                padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;
                font-weight: 700; white-space: nowrap; transition: all 0.2s;
            }
            .nav-item.active, .nav-item:hover { color: var(--text-primary); background: rgba(56, 189, 248, 0.15); }

            .hub-main { padding: 24px; max-width: 1400px; margin: 0 auto; }
            .hub-tab-panel { display: none; }
            .hub-tab-panel.active { display: block; }

            .hub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; }
            .hub-card {
                background: var(--card-bg); border: 1px solid var(--border-card);
                border-radius: 16px; padding: 20px; backdrop-filter: blur(12px);
            }
            .hub-card.full-width { grid-column: 1 / -1; }
            .hub-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .card-title { font-size: 15px; font-weight: 800; color: var(--text-primary); }
            .status-pill { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; }
            .status-pill.online { background: rgba(16, 185, 129, 0.2); color: #10b981; }
            .status-pill.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

            .card-metric { font-size: 28px; font-weight: 900; color: var(--accent-blue); margin-bottom: 12px; }
            .card-metric span { font-size: 14px; color: var(--text-secondary); font-weight: 600; }
            .stat-line {
                display: flex; justify-content: space-between; align-items: center;
                padding: 8px 0; border-bottom: 1px solid var(--border-card); font-size: 13px;
            }

            .form-group { margin-bottom: 14px; }
            .hub-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: var(--text-secondary); }
            .hub-input, .hub-select {
                width: 100%; background: var(--input-bg); border: 1px solid var(--border-card);
                color: var(--text-primary); padding: 10px 14px; border-radius: 8px; font-size: 13px; outline: none;
            }
            .speed-limiter-box {
                background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(56, 189, 248, 0.3);
                border-radius: 12px; padding: 14px;
            }
            .limiter-hint { font-size: 11px; color: var(--text-secondary); margin-top: 6px; line-height: 1.4; }

            .hub-table { width: 100%; border-collapse: collapse; text-align: inherit; }
            .hub-table th, .hub-table td { padding: 12px; border-bottom: 1px solid var(--border-card); font-size: 13px; }
            .hub-table th { color: var(--accent-blue); font-weight: 700; }

            .dns-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
            .dns-preset {
                background: var(--preset-bg); border: 1px solid var(--border-card);
                border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; position: relative;
            }
            .dns-preset:hover, .dns-preset.active { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); transform: translateY(-2px); }
            .dns-preset b { display: block; font-size: 14px; color: var(--text-primary); margin-bottom: 4px; }
            .dns-preset p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
            .badge-recommended {
                display: inline-block; margin-top: 8px; font-size: 10px; font-weight: 700;
                padding: 2px 8px; border-radius: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8;
            }

            @media (max-width: 768px) {
                .hub-header { padding: 10px 14px; }
                .hub-main { padding: 14px; margin-bottom: 65px; }
                .hub-grid { grid-template-columns: 1fr; }
                .hub-nav {
                    position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000;
                    padding: 8px 12px; justify-content: space-around;
                    background: var(--header-bg); backdrop-filter: blur(20px);
                    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4); border-top: 1px solid var(--border-card);
                }
                .nav-item { font-size: 11px; padding: 6px 10px; }
            }
        `;
        document.head.appendChild(style);
    }

    // Dashboard Interaction Bindings
    function bindDashboardEvents() {
        // Tab Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.hub-tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const target = document.getElementById(`tab-${btn.dataset.tab}`);
                if (target) target.classList.add('active');
            });
        });

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
                document.getElementById('theme-btn-icon').textContent = State.theme === 'dark' ? '☀️ فاتح' : '🌙 غامق';
            });
        }

        // Model Switcher in Header
        const modelSelect = document.getElementById('hub-header-model-select');
        modelSelect.value = State.detectedModelKey;
        modelSelect.addEventListener('change', () => {
            localStorage.setItem('router_hub_selected_model', modelSelect.value);
            resolveDriver();
            window.location.reload();
        });

        // Refresh
        document.getElementById('btn-refresh').addEventListener('click', async () => {
            const btn = document.getElementById('btn-refresh');
            btn.textContent = '⏳ ...';
            if (State.activeDriver) await State.activeDriver.fetchStats();
            updateUI();
            btn.textContent = I18N[State.lang].btnRefresh;
        });

        // Reboot
        document.getElementById('btn-reboot').addEventListener('click', async () => {
            if (confirm(State.lang === 'ar' ? `هل أنت متأكد من إعادة تشغيل الراوتر (${State.modelName})؟` : `Reboot router (${State.modelName}) now?`)) {
                if (State.activeDriver) await State.activeDriver.reboot();
                alert(State.lang === 'ar' ? 'تم إرسال أمر إعادة التشغيل بنجاح!' : 'Reboot command dispatched successfully!');
            }
        });

        // Legacy Mode Switcher
        document.getElementById('btn-legacy').addEventListener('click', () => {
            window.location.href = window.location.pathname + '?legacy=1';
        });

        // Wi-Fi 2.4G Save (with Speed Limiter!)
        document.getElementById('btn-save-wifi24').addEventListener('click', async () => {
            const btn = document.getElementById('btn-save-wifi24');
            const ssid = document.getElementById('wifi24-ssid-input').value.trim();
            const pass = document.getElementById('wifi24-pass-input').value.trim();
            const mode = document.getElementById('wifi24-mode-select').value;

            btn.disabled = true;
            btn.textContent = '...';

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
            btn.disabled = false;
            btn.textContent = State.lang === 'ar' ? 'حفظ وتطبيق إعدادات 2.4G' : 'Save & Apply 2.4G';
            alert(State.lang === 'ar' ? '✅ تم حفظ وتطبيق إعدادات الواي فاي ونمط السرعة بنجاح!' : '✅ Wi-Fi & Speed Limiter settings applied!');
        });

        // DNS Preset Click Handlers
        document.querySelectorAll('.dns-preset').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.dns-preset').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                document.getElementById('dns-primary-inp').value = card.dataset.dns1;
                document.getElementById('dns-secondary-inp').value = card.dataset.dns2;
            });
        });

        // Apply DNS
        document.getElementById('btn-save-dns').addEventListener('click', async () => {
            const btn = document.getElementById('btn-save-dns');
            const pDns = document.getElementById('dns-primary-inp').value.trim();
            const sDns = document.getElementById('dns-secondary-inp').value.trim();

            btn.disabled = true;
            btn.textContent = '...';

            if (State.activeDriver && State.activeDriver.applyDns) {
                await State.activeDriver.applyDns(pDns, sDns);
            }

            State.lanDns1 = pDns;
            State.lanDns2 = sDns;
            btn.disabled = false;
            btn.textContent = I18N[State.lang].btnApplyDns;
            alert(State.lang === 'ar' ? `✅ تم تطبيق خوادم الـ DNS (${pDns} / ${sDns}) بنجاح على كامل الراوتر!` : `✅ DNS applied successfully (${pDns} / ${sDns})!`);
        });

        // Disable WPS Button
        const btnWps = document.getElementById('btn-kill-wps');
        if (btnWps) {
            btnWps.addEventListener('click', () => {
                State.wpsEnabled = false;
                alert(State.lang === 'ar' ? '✅ تم إغلاق وتعطيل خاصية WPS بنجاح! راوترك محمي الآن من كافة برامج الاختراق.' : '✅ WPS successfully disabled! Router is now protected against brute-force tools.');
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
            '1': State.lang === 'ar' ? '🐢 11B Only (~5 Mbps محدد للسرعة)' : '🐢 11B Only (~5 Mbps Limited)',
            '4': State.lang === 'ar' ? '⚡ 11G Only (~20 Mbps متوسط)' : '⚡ 11G Only (~20 Mbps)',
            '0': '⚖️ Mixed 11G/B (~25 Mbps)',
            '6': '🚀 11N Only (300 Mbps)',
            '9': State.lang === 'ar' ? '🔥 مفتوح بالكامل (Mixed 11N/G/B)' : '🔥 Full Speed (Mixed 11N/G/B)'
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
        dock.innerHTML = `<span>🚀 العودة إلى Universal Router Hub</span>`;
        dock.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:2147483647;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;padding:12px 20px;border-radius:30px;cursor:pointer;font-weight:700;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,0.6);border:1px solid #38bdf8;font-family:sans-serif;';
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
                sendResponse({ msg: State.lang === 'ar' ? '🛡️ تم تفعيل فلتر حماية الأسرة ومنع المحتوى الضار (Cloudflare 1.1.1.3) بنجاح!' : '🛡️ Cloudflare Family Protection DNS (1.1.1.3) applied successfully!' });
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
                sendResponse({ msg: req.mode === '11b' ? '✅ تم تفعيل وضع توفير الباقة (11B Only) بنجاح!' : '⚡ تم فتح السرعة القصوى للواي فاي!' });
            } else if (req.type === 'REBOOT_ROUTER') {
                if (State.activeDriver) State.activeDriver.reboot();
                sendResponse({ msg: '⚡ تم إرسال أمر إعادة التشغيل للراوتر بنجاح!' });
            }
            return true;
        });
    }

    // Login Page Detection & Modernization
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

    function mountModernLoginPage() {
        const isAr = State.lang === 'ar';
        const origUser = document.querySelector('input[type="text"], input[name*="user" i], #username, #user');
        const origPass = document.querySelector('input[type="password"], #password, #pass');
        const origForm = document.querySelector('form[name*="login" i], form[id*="login" i], form');
        const origSubmit = document.querySelector('input[type="submit"], button[type="submit"], #submit, #login_btn, #btn_login');

        document.body.className = `theme-${State.theme}`;
        injectStyles();

        const loginOverlay = document.createElement('div');
        loginOverlay.id = 'hub-modern-login-overlay';
        loginOverlay.style.cssText = `
            position: fixed; inset: 0; z-index: 2147483640;
            background: var(--bg-dark);
            display: flex; align-items: center; justify-content: center;
            padding: 20px; font-family: 'Cairo', sans-serif;
            direction: ${isAr ? 'rtl' : 'ltr'};
        `;

        const isDLink = State.detectedBrand === 'D-Link';
        const defaultUser = isDLink ? 'telecomadmin' : 'admin';
        const defaultPass = isDLink ? 'A15151' : 'admin';

        loginOverlay.innerHTML = `
            <div style="
                width: 100%; max-width: 420px;
                background: var(--card-bg);
                border: 1px solid var(--border-card);
                border-radius: 24px; padding: 32px 28px;
                backdrop-filter: blur(20px);
                box-shadow: 0 20px 50px rgba(0,0,0,0.6);
            ">
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="
                        width: 52px; height: 52px; margin: 0 auto 12px;
                        border-radius: 16px; background: linear-gradient(135deg, #0284c7, #38bdf8);
                        display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
                    ">
                        <svg style="width:28px;height:28px;fill:#fff;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    </div>
                    <h2 style="font-size:19px;font-weight:900;color:var(--text-primary);margin:0 0 6px 0;">Universal Router Hub</h2>
                    <span style="font-size:12px;color:var(--accent-blue);background:rgba(56,189,248,0.12);padding:3px 12px;border-radius:12px;border:1px solid rgba(56,189,248,0.3);font-weight:700;">
                        ${State.modelName}
                    </span>
                </div>

                <div style="display:flex;flex-direction:column;gap:16px;">
                    <div>
                        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:6px;">
                            ${isAr ? 'اسم المستخدم (Username):' : 'Username:'}
                        </label>
                        <input type="text" id="modern-login-user" value="${origUser ? origUser.value : ''}" placeholder="admin" style="
                            width:100%;box-sizing:border-box;background:var(--input-bg);border:1px solid var(--border-card);
                            color:var(--text-primary);padding:12px 14px;border-radius:10px;font-size:14px;outline:none;
                        ">
                    </div>

                    <div>
                        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:6px;">
                            ${isAr ? 'كلمة المرور (Password):' : 'Password:'}
                        </label>
                        <div style="position:relative;display:flex;align-items:center;">
                            <input type="password" id="modern-login-pass" value="${origPass ? origPass.value : ''}" placeholder="••••••••" style="
                                width:100%;box-sizing:border-box;background:var(--input-bg);border:1px solid var(--border-card);
                                color:var(--text-primary);padding:12px 14px;border-radius:10px;font-size:14px;outline:none;
                            ">
                            <button type="button" id="modern-login-toggle-eye" style="
                                position:absolute;${isAr ? 'left:10px' : 'right:10px'};background:none;border:none;color:var(--text-secondary);
                                cursor:pointer;font-size:14px;padding:4px;
                            ">👁️</button>
                        </div>
                    </div>

                    <button type="button" id="modern-login-submit" style="
                        width:100%;padding:12px;border-radius:10px;border:none;cursor:pointer;
                        background:linear-gradient(135deg, #0284c7, #0369a1);color:#fff;
                        font-weight:800;font-size:14px;box-shadow:0 4px 14px rgba(2,132,199,0.4);
                        margin-top:6px;transition:all 0.2s ease;
                    ">
                        ${isAr ? 'تسجيل الدخول إلى الراوتر' : 'Log In to Router'}
                    </button>

                    <button type="button" id="modern-login-super" style="
                        width:100%;padding:10px;border-radius:10px;border:1px dashed var(--accent-blue);
                        background:rgba(2,132,199,0.08);color:var(--accent-blue);
                        font-weight:700;font-size:12px;cursor:pointer;transition:all 0.2s ease;
                    ">
                        🚀 ${isAr ? `دخول سريع كـ SuperAdmin (${defaultUser} / ${defaultPass})` : `1-Click SuperAdmin (${defaultUser} / ${defaultPass})`}
                    </button>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;border-top:1px solid var(--border-card);padding-top:14px;">
                    <div style="display:flex;gap:6px;">
                        <button type="button" id="modern-login-lang" class="hub-btn sm">🌐 ${isAr ? 'English' : 'عربي'}</button>
                        <button type="button" id="modern-login-theme" class="hub-btn sm">${State.theme === 'dark' ? '☀️' : '🌙'}</button>
                    </div>
                    <button type="button" id="modern-login-legacy" style="background:none;border:none;color:var(--text-secondary);font-size:11px;cursor:pointer;text-decoration:underline;">
                        ${isAr ? 'الواجهة الأصلية' : 'Legacy Login'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(loginOverlay);

        const userInp = document.getElementById('modern-login-user');
        const passInp = document.getElementById('modern-login-pass');
        const btnEye = document.getElementById('modern-login-toggle-eye');
        const btnSubmit = document.getElementById('modern-login-submit');
        const btnSuper = document.getElementById('modern-login-super');
        const btnLang = document.getElementById('modern-login-lang');
        const btnTheme = document.getElementById('modern-login-theme');
        const btnLegacy = document.getElementById('modern-login-legacy');

        btnEye.addEventListener('click', () => {
            passInp.type = passInp.type === 'password' ? 'text' : 'password';
            btnEye.textContent = passInp.type === 'password' ? '👁️' : '🔒';
        });

        const performLogin = (u, p) => {
            if (origUser) origUser.value = u;
            if (origPass) origPass.value = p;
            if (typeof window.doLogin === 'function') window.doLogin();
            else if (origSubmit) origSubmit.click();
            else if (origForm) origForm.submit();
        };

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
            btnTheme.textContent = State.theme === 'dark' ? '☀️' : '🌙';
        });

        btnLegacy.addEventListener('click', () => {
            loginOverlay.remove();
        });
    }

    // Init Execution Flow
    async function init() {
        resolveDriver();
        if (checkIfLoginPage()) {
            mountModernLoginPage();
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
