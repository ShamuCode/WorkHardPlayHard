function getMainDomain(urlOrDomain) {
  try {
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

    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.style.marginLeft = "10px";
    btn.style.background = "transparent";
    btn.style.border = "none";
    btn.style.color = "#d32f2f";
    btn.style.cursor = "pointer";
    btn.title = "Delete this domain";

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

function renderBlacklist(blacklist) {
  const ul = document.getElementById("blacklist");
  ul.innerHTML = "";
  blacklist.forEach(domain => {
    const li = document.createElement("li");
    li.textContent = domain;

    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.style.marginLeft = "10px";
    btn.style.background = "transparent";
    btn.style.border = "none";
    btn.style.color = "#d32f2f";
    btn.style.cursor = "pointer";
    btn.title = "Delete this domain";

    btn.addEventListener("click", () => {
      chrome.storage.local.get("blacklist", ({ blacklist = [] }) => {
        const newList = blacklist.filter(d => d !== domain);
        chrome.storage.local.set({ blacklist: newList }, () => {
          renderBlacklist(newList);
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
    alert("Invalid URL or domain");
    return;
  }

  chrome.storage.local.get("whitelist", ({ whitelist = [] }) => {
    if (whitelist.includes(domain)) {
      alert("Website already in whitelist");
      return;
    }
    whitelist.push(domain);
    chrome.storage.local.set({ whitelist }, () => {
      renderWhitelist(whitelist);
      document.getElementById("manualInput").value = "";
    });
  });
}

function addToBlacklist(domain) {
  chrome.storage.local.get("blacklist", ({ blacklist = [] }) => {
    if (blacklist.includes(domain)) {
      alert("Website already in blacklist");
      return;
    }
    blacklist.push(domain);
    chrome.storage.local.set({ blacklist }, () => {
      renderBlacklist(blacklist);
      document.getElementById("manualBlacklistInput").value = "";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["enabled", "whitelist"], ({ enabled = false, whitelist = [] }) => {
    updateToggle(enabled);
    renderWhitelist(whitelist);
  });

  chrome.storage.local.get("blacklist", ({ blacklist = [] }) => {
    renderBlacklist(blacklist);
  });

  document.getElementById("toggleFilter").addEventListener("change", (e) => {
    chrome.storage.local.set({ enabled: e.target.checked });
  });

  document.getElementById("addCurrentSiteWBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const url = tabs[0].url;
      addDomain(url);
    });
  });

  document.getElementById("addCurrentSiteBBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const url = tabs[0].url;
      const domain = getMainDomain(url);
      if (!domain) {
        alert("Invalid URL or domain");
        return;
      }
      addToBlacklist(domain);
    });
  });

  document.getElementById("addManualBtn").addEventListener("click", () => {
    const input = document.getElementById("manualInput");
    addDomain(input.value);
  });

  document.getElementById("addBlacklistBtn").addEventListener("click", () => {
    const input = document.getElementById("manualBlacklistInput");
    addToBlacklist(input.value);
  });

  document.getElementById("exportWhitelistBtn").addEventListener("click", () => {
    chrome.storage.local.get("whitelist", ({ whitelist = [] }) => {
      const blob = new Blob([JSON.stringify({ whitelist }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "whitelist.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById("exportBlacklistBtn").addEventListener("click", () => {
    chrome.storage.local.get("blacklist", ({ blacklist = [] }) => {
      const blob = new Blob([JSON.stringify({ blacklist }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blacklist.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById("importWhitelistInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.whitelist)) {
          chrome.storage.local.set({ whitelist: data.whitelist }, () => {
            alert("Whitelist imported successfully!");
            renderWhitelist(data.whitelist);
          });
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Error importing whitelist.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("importBlacklistInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.blacklist)) {
          chrome.storage.local.set({ blacklist: data.blacklist }, () => {
            alert("Blacklist imported successfully!");
            renderBlacklist(data.blacklist);
          });
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Error importing blacklist.");
      }
    };
    reader.readAsText(file);
  });

  chrome.storage.local.get("blockedSettings", ({ blockedSettings }) => {
    if (blockedSettings) {
      document.getElementById("blockedImage").checked = blockedSettings.showImage || false;
    }
  });
});

document.getElementById("saveBlockedSettings").addEventListener("click", () => {
  const blockedImage = document.getElementById("blockedImage").checked;

  chrome.storage.local.set({
    blockedSettings: {
      showImage: blockedImage
    }
  }, () => {
    alert("Settings saved!");
  });
});
