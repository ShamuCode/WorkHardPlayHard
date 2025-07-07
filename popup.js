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
      updateActiveMode("whitelist", whitelist);
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

function updateActiveMode(key, value) {
  chrome.storage.local.get(["modes", "activeMode"], ({ modes = {}, activeMode }) => {
    if (!activeMode || !modes[activeMode]) return;

    modes[activeMode][key] = value;
    chrome.storage.local.set({ modes });
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
    const enabled = e.target.checked;
    chrome.storage.local.set({ enabled }, () => {
      updateActiveMode("focusEnabled", enabled);
    });
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
    const domain = getMainDomain(input.value);
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
        updateActiveMode("whitelist", whitelist);
        input.value = "";
      });
    });
  });

  document.getElementById("addBlacklistBtn").addEventListener("click", () => {
    const input = document.getElementById("manualBlacklistInput");
    const domain = getMainDomain(input.value);
    if (!domain) {
      alert("Invalid URL or domain");
      return;
    }

    chrome.storage.local.get("blacklist", ({ blacklist = [] }) => {
      if (blacklist.includes(domain)) {
        alert("Website already in blacklist");
        return;
      }
      blacklist.push(domain);
      chrome.storage.local.set({ blacklist }, () => {
        renderBlacklist(blacklist);
        updateActiveMode("blacklist", blacklist);
        input.value = "";
      });
    });
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

  chrome.storage.local.get(["modes", "activeMode", "enabled", "whitelist", "blacklist"], ({ modes = {}, activeMode, enabled = false, whitelist = [], blacklist = [] }) => {
    renderModeSelector(Object.keys(modes));
    if (activeMode) {
      document.getElementById("modeSelector").value = activeMode;
      updateToggle(enabled);
      renderWhitelist(whitelist);
      renderBlacklist(blacklist);
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

function saveMode(name, focusEnabled, whitelist, blacklist) {
  chrome.storage.local.get("modes", ({ modes = {} }) => {
    modes[name] = { focusEnabled, whitelist, blacklist };
    chrome.storage.local.set({ modes }, () => {
      alert(`Mode "${name}" saved successfully!`);
      renderModeSelector(Object.keys(modes));
    });
  });
}

function switchMode(name) {
  chrome.storage.local.get("modes", ({ modes = {} }) => {
    const mode = modes[name];
    if (!mode) {
      alert(`Mode "${name}" not found!`);
      return;
    }

    chrome.storage.local.set({
      enabled: mode.focusEnabled,
      whitelist: mode.whitelist,
      blacklist: mode.blacklist,
      activeMode: name,
    }, () => {
      updateToggle(mode.focusEnabled);
      renderWhitelist(mode.whitelist);
      renderBlacklist(mode.blacklist);
    });
  });
}

function loadMode(name) {
  if (name === "None") {
    chrome.storage.local.set({
      enabled: false,
      whitelist: [],
      blacklist: [],
      activeMode: "None",
    }, () => {
      updateToggle(false);
      renderWhitelist([]);
      renderBlacklist([]);
    });
    return;
  }

  chrome.storage.local.get("modes", ({ modes = {} }) => {
    const mode = modes[name];
    if (!mode) {
      alert(`Mode "${name}" not found!`);
      return;
    }

    chrome.storage.local.set({
      enabled: mode.focusEnabled,
      whitelist: mode.whitelist,
      blacklist: mode.blacklist,
      activeMode: name,
    }, () => {
      updateToggle(mode.focusEnabled);
      renderWhitelist(mode.whitelist);
      renderBlacklist(mode.blacklist);
    });
  });
}

function deleteMode(name) {
  chrome.storage.local.get("modes", ({ modes = {} }) => {
    if (!modes[name]) {
      alert(`Mode "${name}" not found!`);
      return;
    }

    delete modes[name];
    chrome.storage.local.set({ modes }, () => {
      alert(`Mode "${name}" deleted!`);
      renderModeSelector(Object.keys(modes));
    });
  });
}

function renderModes(modeNames) {
  const ul = document.getElementById("modesList");
  ul.innerHTML = "";
  modeNames.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;

    const btn = document.createElement("button");
    btn.textContent = "Switch";
    btn.style.marginLeft = "10px";
    btn.style.background = "#0071e3";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", () => switchMode(name));

    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function renderModeSelector(modeNames) {
  const selector = document.getElementById("modeSelector");
  selector.innerHTML = '<option value="" disabled selected>Select a mode</option> <option value="None">None</option>';
  modeNames.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    selector.appendChild(option);
  });
}

document.getElementById("saveModeBtn").addEventListener("click", () => {
  const modeName = document.getElementById("modeNameInput").value.trim();
  if (!modeName) {
    alert("Please enter a mode name!");
    return;
  }

  chrome.storage.local.get(["enabled", "whitelist", "blacklist"], ({ enabled, whitelist = [], blacklist = [] }) => {
    saveMode(modeName, enabled, whitelist, blacklist);
  });
});

document.getElementById("deleteModeBtn").addEventListener("click", () => {
  const modeName = document.getElementById("modeSelector").value;
  if (!modeName) {
    alert("Please select a mode!");
    return;
  }
  deleteMode(modeName);
});

document.getElementById("modeSelector").addEventListener("change", (event) => {
  const modeName = event.target.value;
  loadMode(modeName);

  const isNone = modeName === "None";
  document.getElementById("saveModeBtn").disabled = isNone;
  document.getElementById("deleteModeBtn").disabled = isNone;
  document.getElementById("exportCurrentModeBtn").disabled = isNone;
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("modes", ({ modes = {} }) => {
    renderModeSelector(Object.keys(modes));
  });
});

document.getElementById("exportCurrentModeBtn").addEventListener("click", () => {
  const modeName = document.getElementById("modeSelector").value;
  if (!modeName) {
    alert("Please select a mode!");
    return;
  }

  chrome.storage.local.get("modes", ({ modes = {} }) => {
    const mode = modes[modeName];
    if (!mode) {
      alert(`Mode "${modeName}" not found!`);
      return;
    }

    const blob = new Blob([JSON.stringify({ [modeName]: mode }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("exportAllModesBtn").addEventListener("click", () => {
  chrome.storage.local.get("modes", ({ modes = {} }) => {
    const blob = new Blob([JSON.stringify(modes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all_modes.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("importModesInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("Please select a file!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedModes = JSON.parse(e.target.result);
      chrome.storage.local.get("modes", ({ modes = {} }) => {
        const updatedModes = { ...modes, ...importedModes };
        chrome.storage.local.set({ modes: updatedModes }, () => {
          alert("Modes imported successfully!");
          renderModeSelector(Object.keys(updatedModes));
        });
      });
    } catch (error) {
      alert("Invalid file format!");
    }
  };
  reader.readAsText(file);
});

function saveActiveMode(modeName) {
  chrome.storage.local.set({ activeMode: modeName });
}

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const container = document.querySelector(".container");
  const darkModeIcon = document.getElementById("darkModeIcon");

  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)");

  chrome.storage.local.get("darkMode", ({ darkMode }) => {
    const isDarkMode = darkMode !== undefined ? darkMode : prefersDarkMode.matches;

    if (isDarkMode) {
      body.classList.add("dark-mode");
      container.classList.add("dark-mode");
      darkModeIcon.textContent = "🌞";
    } else {
      darkModeIcon.textContent = "🌙";
    }

    prefersDarkMode.addEventListener("change", (e) => {
      const autoDarkMode = e.matches;

      chrome.storage.local.set({ darkMode: autoDarkMode }, () => {
        if (autoDarkMode) {
          body.classList.add("dark-mode");
          container.classList.add("dark-mode");
          darkModeIcon.textContent = "🌞"; 
        } else {
          body.classList.remove("dark-mode");
          container.classList.remove("dark-mode");
          darkModeIcon.textContent = "🌙"; 
        }
      });
    });

    darkModeIcon.addEventListener("click", () => {
      const isDarkMode = body.classList.contains("dark-mode");
      chrome.storage.local.set({ darkMode: !isDarkMode }, () => {
        if (!isDarkMode) {
          body.classList.add("dark-mode");
          container.classList.add("dark-mode");
          darkModeIcon.textContent = "🌞";
        } else {
          body.classList.remove("dark-mode");
          container.classList.remove("dark-mode");
          darkModeIcon.textContent = "🌙"; 
        }
      });
    });
  });
});