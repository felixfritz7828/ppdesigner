document.addEventListener('DOMContentLoaded', function () {
  const indexButton = document.querySelector('.index-button');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const body = document.body;

  indexButton.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
    body.classList.toggle('sidebar-open'); // Ajoute ou retire la classe 'sidebar-open' au corps
  });

  const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function () {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
      body.classList.remove('sidebar-open'); // Retire la classe 'sidebar-open' du corps
    });
  });

  sidebarOverlay.addEventListener('click', function () {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    body.classList.remove('sidebar-open'); // Retire la classe 'sidebar-open' du corps
  });

  const pngOverlay = document.getElementById('pngOverlay');
  window.addEventListener('scroll', function () {
    pngOverlay.style.transform = 'translateY(' + (window.scrollY * 1.5) + 'px)';
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const globalPlayer = document.getElementById("globalPlayer");
  const inlinePlayers = document.querySelectorAll(".podcast-audio audio");

  inlinePlayers.forEach(inline => {
    inline.addEventListener("play", (e) => {
      const source = inline.querySelector("source");
      const newSrc = source ? source.getAttribute("src") : null;

      if (newSrc && globalPlayer.src !== window.location.origin + "/" + newSrc) {
        globalPlayer.src = newSrc;
        globalPlayer.play();
      }

      // Empêche la lecture dans le player inline
      inline.pause();
      inline.currentTime = 0;
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const globalPlayer = document.getElementById("globalPlayer");
  const globalBar = document.getElementById("globalPlayerBar");

  // Si une source est stockée en mémoire, on la réaffiche
  const storedSrc = localStorage.getItem("futuribles-player-src");
  if (storedSrc) {
    globalPlayer.src = storedSrc;
    globalBar.style.display = "block";
  }

  // On capte les clics sur tous les lecteurs inline
  const inlinePlayers = document.querySelectorAll(".podcast-audio audio");
  inlinePlayers.forEach(inline => {
    inline.addEventListener("play", (e) => {
      const source = inline.querySelector("source");
      const newSrc = source ? source.getAttribute("src") : null;

      if (newSrc) {
        // Met à jour le lecteur global
        globalPlayer.src = newSrc;
        globalPlayer.play();
        globalBar.style.display = "block";

        // Enregistre pour les autres pages
        localStorage.setItem("futuribles-player-src", newSrc);

        // Stoppe le lecteur inline
        inline.pause();
        inline.currentTime = 0;
      }
    });
  });
});

// Fonction appelée par le bouton X
function closeGlobalPlayer() {
  const globalBar = document.getElementById("globalPlayerBar");
  const globalPlayer = document.getElementById("globalPlayer");
  globalPlayer.pause();
  globalPlayer.currentTime = 0;
  globalBar.style.display = "none";

  // Supprime la mémoire
  localStorage.removeItem("futuribles-player-src");
}


console.log("Fichier JS bien chargé !");