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
  return url.includes("/embed/"); // Vérifie si l'URL correspond à un contenu intégré
}

// Bloquer les sites non autorisés lors de la mise à jour de l'URL d'un onglet
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (isInternalChromePage(changeInfo.url) || isEmbeddedContent(changeInfo.url)) return; // Exclure les pages internes et les contenus intégrés

    chrome.storage.local.get(["enabled", "whitelist"], ({ enabled, whitelist = [] }) => {
      if (!enabled) return;
      const domain = getMainDomain(changeInfo.url);
      if (!domain) return;

      // Bloquer uniquement si l'onglet est actif et visible
      chrome.tabs.get(tabId, (tab) => {
        if (tab.active && !whitelist.includes(domain)) {
          const blockedPage = chrome.runtime.getURL("blocked.html") + "?blockedUrl=" + encodeURIComponent(changeInfo.url);
          chrome.tabs.update(tabId, { url: blockedPage });
        }
      });
    });
  }
});

// Bloquer les sites non autorisés lors de la navigation principale
chrome.webNavigation.onBeforeNavigate.addListener(({ url, tabId, frameId }) => {
  if (frameId !== 0) return; // Ignorer les contenus intégrés
  if (isInternalChromePage(url) || isEmbeddedContent(url)) return; // Exclure les pages internes et les contenus intégrés

  chrome.storage.local.get(["enabled", "whitelist"], ({ enabled, whitelist = [] }) => {
    if (!enabled) return;
    const domain = getMainDomain(url);
    if (!domain) return;

    chrome.tabs.get(tabId, (tab) => {
      if (tab.active && !whitelist.includes(domain)) {
        const blockedPage = chrome.runtime.getURL("blocked.html") + "?blockedUrl=" + encodeURIComponent(url);
        chrome.tabs.update(tabId, { url: blockedPage });
      }
    });
  });
});