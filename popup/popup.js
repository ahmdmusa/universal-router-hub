document.addEventListener('DOMContentLoaded', async () => {
    const modelSelect = document.getElementById('router-model-select');
    const detectedInfo = document.getElementById('detected-model-info');
    const gatewayInput = document.getElementById('gateway-ip');
    const btnOpenHub = document.getElementById('btn-open-hub');
    const btnSpeedLimit = document.getElementById('btn-speed-limit');
    const btnFullSpeed = document.getElementById('btn-full-speed');
    const btnReboot = document.getElementById('btn-reboot');
    const statusBadge = document.getElementById('status-badge');

    // Storage abstraction (compatible with Chrome and Firefox WebExtensions)
    const storage = {
        get: async (key) => {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                return new Promise(r => chrome.storage.local.get(key, res => r(res[key])));
            }
            return localStorage.getItem(key);
        },
        set: async (key, val) => {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                return new Promise(r => chrome.storage.local.set({ [key]: val }, r));
            }
            localStorage.setItem(key, val);
        }
    };

    // Load saved settings
    const savedModel = await storage.get('router_selected_model') || 'auto';
    const savedGateway = await storage.get('router_gateway_ip') || '192.168.1.1';
    modelSelect.value = savedModel;
    gatewayInput.value = savedGateway;

    // Detect Active Tab
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0] && tabs[0].url) {
                const url = tabs[0].url;
                if (url.includes('192.168.') || url.includes('10.0.0.')) {
                    statusBadge.textContent = 'متصل بالراوتر';
                    statusBadge.style.color = '#10b981';
                    try {
                        const host = new URL(url).hostname;
                        gatewayInput.value = host;
                    } catch (e) {}

                    // Ask content script for detected brand
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_ROUTER_INFO' }, (response) => {
                        if (response && response.brand) {
                            detectedInfo.textContent = `🎯 تم التعرف على: ${response.brand} (${response.model || 'تلقائي'})`;
                            detectedInfo.style.color = '#38bdf8';
                        } else {
                            detectedInfo.textContent = 'جاهز للتطبيق على صفحة الراوتر المفتوحة.';
                        }
                    });
                } else {
                    statusBadge.textContent = 'غير متصل';
                    statusBadge.style.color = '#f59e0b';
                    detectedInfo.textContent = 'افتح صفحة الراوتر أولاً أو اضغط زر الفتح أدناه.';
                }
            }
        });
    }

    // Save model selection
    modelSelect.addEventListener('change', async () => {
        await storage.set('router_selected_model', modelSelect.value);
        detectedInfo.textContent = modelSelect.value === 'auto' ? 
            '✨ تم تفعيل الكشف التلقائي الذكي.' : 
            `🔒 تم تثبيت الموديل: ${modelSelect.options[modelSelect.selectedIndex].text}`;
        
        // Notify tab
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_MODEL_OVERRIDE', model: modelSelect.value });
                }
            });
        }
    });

    // Save gateway IP
    gatewayInput.addEventListener('change', async () => {
        await storage.set('router_gateway_ip', gatewayInput.value.trim());
    });

    // Open Hub Button (Focus existing router tab or open new)
    btnOpenHub.addEventListener('click', () => {
        const ip = gatewayInput.value.trim() || '192.168.1.1';
        const targetUrl = `http://${ip}/`;
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({}, (tabs) => {
                const existingTab = tabs.find(t => t.url && (t.url.includes(ip) || t.url.includes('192.168.') || t.url.includes('10.0.0.')));
                if (existingTab) {
                    chrome.tabs.update(existingTab.id, { active: true });
                    if (existingTab.windowId && chrome.windows) {
                        chrome.windows.update(existingTab.windowId, { focused: true });
                    }
                } else {
                    chrome.tabs.create({ url: targetUrl });
                }
                window.close();
            });
        } else {
            window.open(targetUrl, '_blank');
        }
    });

    // Quick Action: Family Protection DNS (Block Adult/Malware)
    const btnFamilyDns = document.getElementById('btn-family-dns');
    if (btnFamilyDns) {
        btnFamilyDns.addEventListener('click', () => {
            sendTabAction('SET_FAMILY_DNS');
        });
    }

    // Language & Theme Toggles in Popup
    const btnPopLang = document.getElementById('btn-pop-lang');
    if (btnPopLang) {
        btnPopLang.addEventListener('click', async () => {
            let currentLang = await storage.get('router_hub_lang') || 'ar';
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            await storage.set('router_hub_lang', currentLang);
            sendTabAction('SET_LANG', { lang: currentLang });
            alert(currentLang === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Switched to English');
        });
    }

    const btnPopTheme = document.getElementById('btn-pop-theme');
    if (btnPopTheme) {
        btnPopTheme.addEventListener('click', async () => {
            let currentTheme = await storage.get('router_hub_theme') || 'dark';
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            await storage.set('router_hub_theme', currentTheme);
            btnPopTheme.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
            sendTabAction('SET_THEME', { theme: currentTheme });
        });
    }

    // Quick Action: Speed Limit
    btnSpeedLimit.addEventListener('click', () => {
        sendTabAction('SET_SPEED_LIMIT', { mode: '11b' });
    });

    // Quick Action: Full Speed
    btnFullSpeed.addEventListener('click', () => {
        sendTabAction('SET_SPEED_LIMIT', { mode: 'full' });
    });

    // Quick Action: Reboot
    btnReboot.addEventListener('click', () => {
        if (confirm('هل تريد تأكيد إرسال أمر إعادة التشغيل للراوتر الآن؟')) {
            sendTabAction('REBOOT_ROUTER');
        }
    });

    function sendTabAction(actionType, payload = {}) {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: actionType, ...payload }, (res) => {
                        if (res && res.msg) alert(res.msg);
                    });
                }
            });
        }
    }
});
