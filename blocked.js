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

function getBlockedUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("blockedUrl");
}

function getRandomImage() {
  fetch('./img/list.json')
    .then(response => response.json())
    .then(data => {
      const imageList = data.images;
      const randomImage = imageList[Math.floor(Math.random() * imageList.length)];

      const imgElement = document.querySelector("img");
      imgElement.src = `${randomImage.file}`;

      const creditElement = document.querySelector(".image-credit");
      creditElement.textContent = randomImage.credit;
    })
    .catch(error => console.error('Error loading images:', error));
}

function getRandomMotivationPhrase() {
  fetch('./motivation.json')
    .then(response => response.json())
    .then(data => {
      const phrases = data["en"].phrases_motivation; 
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      document.querySelector(".blocked-title").textContent = randomPhrase;
    })
    .catch(error => console.error('Error while loading motivation phrase', error));
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("blockedSettings", ({ blockedSettings }) => {
    const showMotivation = blockedSettings?.showMotivation ?? true;
    const showImage = blockedSettings?.showImage ?? true;

    if (showImage) {
      getRandomImage();
    } else {
      document.querySelector("img").style.display = "none";
    }

    if (showMotivation) {
      getRandomMotivationPhrase();
    } else {
      document.querySelector(".blocked-title").textContent = "";
    }
  });
});

document.getElementById("addWhitelistBtn").addEventListener("click", () => {
  const blockedUrl = getBlockedUrl();
  if (!blockedUrl) return alert("Error: Blocked URL not found");

  const domain = getMainDomain(blockedUrl);
  if (!domain) return alert("Error: Unable to extract domain");

  chrome.storage.local.get("whitelist", ({ whitelist = [] }) => {
    if (whitelist.includes(domain)) {
      alert("Error: Site already in the whitelist");
      return;
    }
    whitelist.push(domain);
    chrome.storage.local.set({ whitelist }, () => {
      alert("Site added to the whitelist!");
      window.location.href = blockedUrl;
    });
  });
});

document.getElementById("disableModeBtn").addEventListener("click", () => {
  const blockedUrl = getBlockedUrl();
  if (!blockedUrl) return alert("Error: Blocked URL not found");
  chrome.storage.local.set({ enabled: false }, () => {
    alert("Focus mode off !");
    window.location.href = blockedUrl;
  });
});
