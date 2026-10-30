/**
 * Universal Router Hub - Background Service Worker
 * Handles extension installation, first-run onboarding, and tab management.
 */

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        const welcomeUrl = chrome.runtime.getURL('welcome/welcome.html');
        chrome.tabs.create({ url: welcomeUrl });
    }
});
