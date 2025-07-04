function getMainDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.').filter(Boolean);
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch (e) {
    return null;
  }
}

function isInternalChromePage(url) {
  return url.startsWith("chrome://") || url.startsWith("chrome-extension://");
}

function isEmbeddedContent(url) {
  return url.includes("/embed/");
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (isInternalChromePage(changeInfo.url) || isEmbeddedContent(changeInfo.url)) return

    chrome.storage.local.get(["enabled", "whitelist"], ({ enabled, whitelist = [] }) => {
      if (!enabled) return;
      const domain = getMainDomain(changeInfo.url);
      if (!domain) return;

      chrome.tabs.get(tabId, (tab) => {
        if (tab.active && !whitelist.includes(domain)) {
          const blockedPage = chrome.runtime.getURL("blocked.html") + "?blockedUrl=" + encodeURIComponent(changeInfo.url);
          chrome.tabs.update(tabId, { url: blockedPage });
        }
      });
    });
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(({ url, tabId, frameId }) => {
  if (frameId !== 0) return;
  if (isInternalChromePage(url) || isEmbeddedContent(url)) return; 

  chrome.storage.local.get(["enabled", "whitelist", "blacklist"], ({ enabled, whitelist = [], blacklist = [] }) => {
    const domain = getMainDomain(url);
    if (!domain) return;

    if (blacklist.includes(domain)) {
      const blockedPage = chrome.runtime.getURL("blocked.html") + "?blockedUrl=" + encodeURIComponent(url);
      chrome.tabs.update(tabId, { url: blockedPage });
      return;
    }

    if (!enabled) return;

    if (!whitelist.includes(domain)) {
      const blockedPage = chrome.runtime.getURL("blocked.html") + "?blockedUrl=" + encodeURIComponent(url);
      chrome.tabs.update(tabId, { url: blockedPage });
    }
  });
});