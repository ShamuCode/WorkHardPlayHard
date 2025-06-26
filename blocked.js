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
    .then(image => {
      const image_list = image.images;
      const randomImage = `./img/` + image_list[Math.floor(Math.random() * image_list.length)];
      document.querySelector("img").src = randomImage;
    })
    .catch(error => console.error('Error loading images:', error));
}

function getRandomMotivationPhrase() {
  fetch('./motivation.json')
    .then(response => response.json())
    .then(data => {
      const phrases = data.phrases_motivation;
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      document.querySelector(".blocked-title").textContent = randomPhrase;
    })
    .catch(error => console.error('Erreur lors du chargement des phrases de motivation :', error));
}

document.addEventListener("DOMContentLoaded", () => {
  getRandomImage();
  getRandomMotivationPhrase();
});

document.getElementById("addWhitelistBtn").addEventListener("click", () => {
  const blockedUrl = getBlockedUrl();
  if (!blockedUrl) return alert("URL bloquée introuvable.");

  const domain = getMainDomain(blockedUrl);
  if (!domain) return alert("Impossible d'extraire le domaine.");

  chrome.storage.local.get("whitelist", ({ whitelist = [] }) => {
    if (whitelist.includes(domain)) {
      alert("Site déjà dans la liste blanche.");
      return;
    }
    whitelist.push(domain);
    chrome.storage.local.set({ whitelist }, () => {
      alert("Site ajouté à la liste blanche !");
      window.location.href = blockedUrl;
    });
  });
});
