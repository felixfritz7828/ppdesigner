document.addEventListener("DOMContentLoaded", function () {
  // Gestion de la sidebar
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (sidebar && overlay) {
    // Ajout d'une classe 'sidebar-open' au body pour ouverture
    const toggleSidebar = () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("open");
      document.body.classList.toggle("sidebar-open");
    };

    // Si le overlay est cliqué, fermer la sidebar
    overlay.addEventListener("click", toggleSidebar);

    // Ajoute un bouton d'ouverture si besoin
    const indexButtons = document.querySelectorAll(".index-button");
    indexButtons.forEach(btn => btn.addEventListener("click", toggleSidebar));
  }

  // Animation PNG overlay (si existant)
  const pngOverlay = document.getElementById('pngOverlay');
  window.addEventListener('scroll', function () {
    pngOverlay.style.transform = 'translateY(' + (window.scrollY * 1.5) + 'px)';
  });

  // Affichage personnalisé du lecteur audio global (si défini)
  const globalPlayerBar = document.getElementById("globalPlayerBar");
  const closeBtn = document.querySelector(".close-player");
  if (globalPlayerBar && closeBtn) {
    closeBtn.addEventListener("click", () => {
      globalPlayerBar.style.display = "none";
    
    document.querySelectorAll(".player-inline.is-playing").forEach(el => {
      el.classList.remove("is-playing");
      const icon = el.querySelector(".glyph-icon");
      if (icon) icon.textContent = "\\u25B7"; // ▶︎ retour au repos
    });
});
  }
});



// --- SYNCHRONISATION DU LECTEUR GLOBAL AVEC LES BLOCS INLINE ---
const globalPlayerBar = document.getElementById("globalPlayerBar");
const globalPlayer = globalPlayerBar?.querySelector("audio");
const portrait = document.getElementById("globalPlayerPortrait");
const meta1 = document.getElementById("globalPlayerMeta1");
const meta2 = document.getElementById("globalPlayerMeta2");

if (globalPlayerBar && globalPlayer && portrait && meta1 && meta2) {
  const inlinePlayers = document.querySelectorAll(".podcast-audio.player-inline audio");

  const globalPlayerBar = document.getElementById("globalPlayerBar");
  const globalPlayer = globalPlayerBar?.querySelector("audio");
  const portrait = document.getElementById("globalPlayerPortrait");
  const meta1 = document.getElementById("globalPlayerMeta1");
  const meta2 = document.getElementById("globalPlayerMeta2");

  if (globalPlayerBar && globalPlayer && portrait && meta1 && meta2) {
    const inlineBlocks = document.querySelectorAll(".podcast-audio.player-inline");

    inlineBlocks.forEach((block) => {
  // Ajoute dynamiquement le glyphe si absent
  let icon = block.querySelector(".glyph-icon");
  if (!icon) {
    icon = document.createElement("span");
    icon.className = "glyph-icon";
    icon.textContent = "\u25B7"; // ▶︎ lecture par défaut
    block.insertBefore(icon, block.firstChild);
  }

      const audio = block.querySelector("audio");
      const source = audio?.querySelector("source");

      // Supprime les contrôles du lecteur inline
      if (audio) audio.controls = false;

      block.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (source?.src) {
          globalPlayer.src = source.src;
          // Retire l'état "is-playing" de tous les autres
          document.querySelectorAll(".player-inline.is-playing").forEach(el => {
            el.classList.remove("is-playing");
          });

          // Active sur le bloc cliqué
          block.classList.add("is-playing");
      const icon = block.querySelector(".glyph-icon");
      if (icon) icon.textContent = "\u25CC"; // ◌

          globalPlayer.play().catch(err => console.warn("Playback failed", err));

        }

        const wrapper = block.closest(".interview-section");
        if (wrapper) {
          const number = wrapper.querySelector(".designer-number")?.textContent.trim() || "";
          const name = wrapper.querySelector(".designer-name")?.textContent.trim() || "";
          const title = wrapper.querySelector(".designer-title")?.textContent.trim() || "";
          const img = block.querySelector("img")?.src || "";

          meta1.textContent = `${number} – ${name}`;
          meta2.textContent = title;
          portrait.src = img;
        }

        globalPlayerBar.style.display = "block";
      });
    });

    const closeBtn = globalPlayerBar.querySelector(".close-player");
    closeBtn.addEventListener("click", () => {
      globalPlayer.pause();
      globalPlayerBar.style.display = "none";

      // 🔁 Retire l’icône de lecture active sur les players inline
      document.querySelectorAll(".player-inline.is-playing").forEach(el => {
        el.classList.remove("is-playing");
      
    document.querySelectorAll(".player-inline.is-playing").forEach(el => {
      el.classList.remove("is-playing");
      const icon = el.querySelector(".glyph-icon");
      if (icon) icon.textContent = "\\u25B7"; // ▶︎ retour au repos
    });
});
// Quand le podcast se termine naturellement (audio ended)
globalPlayer.addEventListener("ended", () => {
  document.querySelectorAll(".player-inline.is-playing").forEach(el => {
    el.classList.remove("is-playing");
    const icon = el.querySelector(".glyph-icon");
    if (icon) icon.textContent = "\u25B7"; // ▶︎
  });
  globalPlayerBar.style.display = "none";
});






      // Met à jour la source du player global
      const source = audio.querySelector("source");
      if (source && source.src) {
        globalPlayer.src = source.src;
        globalPlayer.play().catch(e => console.warn("Erreur de lecture", e));
      }

      // Récupération des données textuelles depuis le bloc parent
      const wrapper = audio.closest(".interview-section");
      if (wrapper) {
        const number = wrapper.querySelector(".designer-number")?.textContent.trim() || "";
        const name = wrapper.querySelector(".designer-name")?.textContent.trim() || "";
        const title = wrapper.querySelector(".designer-title")?.textContent.trim() || "";
        const img = wrapper.querySelector("img")?.src || "";

        meta1.textContent = `${number} – ${name}`;
        meta2.textContent = title;
        portrait.src = img;
      }

      // Affiche le lecteur global
      globalPlayerBar.style.display = "block";



      console.log("Fichier JS bien chargé !");
    });
  }
}