function getMainDomain(urlOrDomain) {
    try {
      // Ajouter https:// si pas présent pour que new URL marche
      let urlStr = urlOrDomain.trim();
      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        urlStr = "https://" + urlStr;
      }
      const hostname = new URL(urlStr).hostname;
      const parts = hostname.split('.').filter(Boolean);
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch (e) {
      return null;
    }
  }
  
  function renderWhitelist(whitelist) {
    const ul = document.getElementById("whitelist");
    ul.innerHTML = "";
    whitelist.forEach(domain => {
      const li = document.createElement("li");
      li.textContent = domain;
  
      // Bouton supprimer à droite
      const btn = document.createElement("button");
      btn.textContent = "✕";
      btn.style.marginLeft = "10px";
      btn.style.background = "transparent";
      btn.style.border = "none";
      btn.style.color = "#d32f2f";
      btn.style.cursor = "pointer";
      btn.title = "Supprimer ce site";
  
      btn.addEventListener("click", () => {
        chrome.storage.local.get("whitelist", ({ whitelist = [] }) => {
          const newList = whitelist.filter(d => d !== domain);
          chrome.storage.local.set({ whitelist: newList }, () => {
            renderWhitelist(newList);
          });
        });
      });
  
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }
  
  function updateToggle(checked) {
    const toggle = document.getElementById("toggleFilter");
    toggle.checked = checked;
  }
  
  function addDomain(urlOrDomain) {
    const domain = getMainDomain(urlOrDomain);
    if (!domain) {
      alert("URL ou domaine invalide");
      return;
    }
  
    chrome.storage.local.get("whitelist", ({ whitelist = [] }) => {
      if (whitelist.includes(domain)) {
        alert("Site déjà autorisé");
        return;
      }
      whitelist.push(domain);
      chrome.storage.local.set({ whitelist }, () => {
        renderWhitelist(whitelist);
        document.getElementById("manualInput").value = "";
      });
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["enabled", "whitelist"], ({ enabled = false, whitelist = [] }) => {
      updateToggle(enabled);
      renderWhitelist(whitelist);
    });
  
    document.getElementById("toggleFilter").addEventListener("change", (e) => {
      chrome.storage.local.set({ enabled: e.target.checked });
    });
  
    document.getElementById("addCurrentSiteBtn").addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        const url = tabs[0].url;
        addDomain(url);
      });
    });
  
    document.getElementById("addManualBtn").addEventListener("click", () => {
      const input = document.getElementById("manualInput");
      addDomain(input.value);
    });
  });
  