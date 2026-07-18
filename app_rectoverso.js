/* ==========================================================
   RECTO VERSO — JAVASCRIPT COMPLET
   ----------------------------------------------------------
   Gère :
   - ouverture et fermeture des popups
   - popups de salles et cartels d’œuvres
   - popup cinéma
   - fermeture en cliquant sur le fond
   - fermeture avec la touche Échap
   - blocage du scroll de la page
   - arrêt automatique des vidéos
   - une seule vidéo en lecture à la fois
   - menu mobile
   - menu déroulant des scènes
   - animation du hamburger
   - scroll rapide et fluide
   - disparition du menu lorsqu’un cartel est ouvert
========================================================== */


/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let pageScrollPosition = 0;


/* ==========================================================
   FONCTIONS UTILITAIRES
========================================================== */

/**
 * Vérifie si un élément est réellement visible.
 */
function isElementVisible(element) {
    if (!element) {
        return false;
    }

    const style = window.getComputedStyle(element);

    return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
    );
}


/**
 * Renvoie toutes les popups actuellement ouvertes.
 */
function getOpenPopups() {
    return [...document.querySelectorAll(".popup")].filter((popup) => {
        return isElementVisible(popup);
    });
}


/**
 * Vérifie si au moins une popup est ouverte.
 */
function hasOpenPopup() {
    return getOpenPopups().length > 0;
}


/**
 * Vérifie si au moins un cartel d’œuvre est ouvert.
 */
function hasOpenArtworkPopup() {
    return [...document.querySelectorAll(".popup-oeuvre")].some((popup) => {
        return isElementVisible(popup);
    });
}


/**
 * Met à jour la visibilité du menu mobile.
 *
 * Le menu disparaît lorsque :
 * - un cartel d’œuvre est ouvert ;
 * - le cinéma est ouvert.
 */
function updateMobileMenuVisibility() {
    const mobileMenu = document.querySelector(".mobile-menu");

    if (!mobileMenu) {
        return;
    }

    const cinemaPopup = document.getElementById("popupCINE");

    const shouldHideMenu =
        hasOpenArtworkPopup() ||
        isElementVisible(cinemaPopup);

    mobileMenu.classList.toggle("cartel-open", shouldHideMenu);
}


/**
 * Bloque le scroll de la page sans perdre la position.
 */
function lockPageScroll() {
    if (document.body.classList.contains("popup-open")) {
        return;
    }

    pageScrollPosition =
        window.scrollY ||
        document.documentElement.scrollTop;

    document.body.classList.add("popup-open");

    document.body.style.position = "fixed";
    document.body.style.top = `-${pageScrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
}


/**
 * Réactive le scroll de la page.
 */
function unlockPageScroll() {
    if (!document.body.classList.contains("popup-open")) {
        return;
    }

    document.body.classList.remove("popup-open");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, pageScrollPosition);
}


/**
 * Arrête toutes les vidéos contenues dans un élément.
 */
function stopVideosInside(element) {
    if (!element) {
        return;
    }

    const videos = element.querySelectorAll("video");

    videos.forEach((video) => {
        video.pause();

        try {
            video.currentTime = 0;
        } catch (error) {
            // Certaines vidéos peuvent ne pas encore être chargées.
        }
    });
}


/**
 * Place le scroll interne d’une popup en haut.
 */
function resetPopupScroll(popup) {
    if (!popup) {
        return;
    }

    popup.scrollTop = 0;

    const popupContent = popup.querySelector(".popup-content");

    if (popupContent) {
        popupContent.scrollTop = 0;
    }
}


/* ==========================================================
   OUVERTURE DES POPUPS
========================================================== */

/**
 * Ouvre une popup.
 *
 * Cette fonction reste globale pour fonctionner avec :
 * onclick="openPopup('oeuvre71')"
 */
function openPopup(popupId) {
    const popup = document.getElementById(popupId);

    if (!popup) {
        console.warn(`Popup introuvable : ${popupId}`);
        return;
    }

    closeMobileScenesMenu();

    resetPopupScroll(popup);

    /*
     * Les popups cinéma utilisent display:grid.
     * Les autres popups utilisent display:flex.
     */
    if (popup.classList.contains("popup-cinema")) {
        popup.style.display = "grid";
    } else {
        popup.style.display = "flex";
    }

    popup.classList.add("active");
    popup.setAttribute("aria-hidden", "false");

    lockPageScroll();

    requestAnimationFrame(() => {
        updateMobileMenuVisibility();
    });
}


/* ==========================================================
   FERMETURE DES POPUPS
========================================================== */

/**
 * Ferme une popup.
 *
 * Cette fonction reste globale pour fonctionner avec :
 * onclick="closePopup('oeuvre71')"
 */
function closePopup(popupId) {
    const popup = document.getElementById(popupId);

    if (!popup) {
        console.warn(`Popup introuvable : ${popupId}`);
        return;
    }

    stopVideosInside(popup);

    popup.classList.remove("active");
    popup.setAttribute("aria-hidden", "true");

    /*
     * On attend la frame suivante avant de vérifier
     * les autres popups afin que display:none soit
     * bien pris en compte.
     */
    popup.style.display = "none";

    requestAnimationFrame(() => {
        if (!hasOpenPopup()) {
            unlockPageScroll();
        }

        updateMobileMenuVisibility();
    });
}


/**
 * Ferme uniquement la popup située au-dessus des autres.
 */
function closeTopPopup() {
    const openPopups = getOpenPopups();

    if (openPopups.length === 0) {
        return;
    }

    const topPopup = openPopups.reduce((highest, popup) => {
        const popupZIndex =
            Number.parseInt(
                window.getComputedStyle(popup).zIndex,
                10
            ) || 0;

        const highestZIndex =
            Number.parseInt(
                window.getComputedStyle(highest).zIndex,
                10
            ) || 0;

        return popupZIndex >= highestZIndex
            ? popup
            : highest;
    });

    closePopup(topPopup.id);
}


/* ==========================================================
   CINÉMA
========================================================== */

/**
 * Ouvre le cinéma et descend jusqu’au film demandé.
 *
 * Exemple :
 * openCinemaFilm("film-lise")
 */
function openCinemaFilm(filmId) {
    const cinemaPopup = document.getElementById("popupCINE");

    if (!cinemaPopup) {
        return;
    }

    openPopup("popupCINE");

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const film = document.getElementById(filmId);

            if (!film) {
                return;
            }

            const cinemaContent =
                cinemaPopup.querySelector(".cinema-content");

            if (cinemaContent) {
                const filmTop =
                    film.offsetTop -
                    cinemaContent.offsetTop -
                    20;

                animateElementScroll(
                    cinemaContent,
                    filmTop,
                    450
                );
            } else {
                film.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}


/**
 * Animation de scroll interne à un élément.
 */
function animateElementScroll(
    element,
    targetPosition,
    duration = 450
) {
    if (!element) {
        return;
    }

    const startPosition = element.scrollTop;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    function animation(currentTime) {
        const elapsedTime = currentTime - startTime;

        const progress = Math.min(
            elapsedTime / duration,
            1
        );

        const easing =
            1 - Math.pow(1 - progress, 4);

        element.scrollTop =
            startPosition +
            distance * easing;

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}


/* ==========================================================
   MENU MOBILE
========================================================== */

/**
 * Ferme la liste déroulante des scènes.
 */
function closeMobileScenesMenu() {
    const toggleButton =
        document.querySelector(".mobile-menu-toggle");

    const scenesMenu =
        document.querySelector(".mobile-menu-scenes");

    if (toggleButton) {
        toggleButton.classList.remove("is-open");
        toggleButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (scenesMenu) {
        scenesMenu.classList.remove("is-open");
        scenesMenu.setAttribute(
            "aria-hidden",
            "true"
        );
    }
}


/**
 * Ouvre ou ferme la liste déroulante.
 */
function toggleMobileScenesMenu() {
    const toggleButton =
        document.querySelector(".mobile-menu-toggle");

    const scenesMenu =
        document.querySelector(".mobile-menu-scenes");

    if (!toggleButton || !scenesMenu) {
        return;
    }

    const isOpen =
        scenesMenu.classList.contains("is-open");

    toggleButton.classList.toggle(
        "is-open",
        !isOpen
    );

    scenesMenu.classList.toggle(
        "is-open",
        !isOpen
    );

    toggleButton.setAttribute(
        "aria-expanded",
        String(!isOpen)
    );

    scenesMenu.setAttribute(
        "aria-hidden",
        String(isOpen)
    );
}


/**
 * Animation rapide et fluide vers une position de page.
 */
function animateScrollTo(
    targetPosition,
    duration = 450
) {
    const startPosition =
        window.scrollY ||
        document.documentElement.scrollTop;

    const maximumScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const finalPosition = Math.max(
        0,
        Math.min(targetPosition, maximumScroll)
    );

    const distance =
        finalPosition - startPosition;

    const startTime = performance.now();

    function animation(currentTime) {
        const elapsedTime =
            currentTime - startTime;

        const progress = Math.min(
            elapsedTime / duration,
            1
        );

        /*
         * Départ rapide puis ralentissement doux.
         */
        const easing =
            1 - Math.pow(1 - progress, 4);

        window.scrollTo(
            0,
            startPosition +
            distance * easing
        );

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}


/**
 * Scroll animé vers une ancre.
 */
function scrollToAnchor(targetId) {
    if (!targetId || targetId === "#") {
        return;
    }

    if (
        targetId === "#top" ||
        targetId === "#accueil"
    ) {
        animateScrollTo(0, 450);
        return;
    }

    const target =
        document.querySelector(targetId);

    if (!target) {
        console.warn(
            `Ancre introuvable : ${targetId}`
        );
        return;
    }

    const scrollOffset = 20;

    const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        scrollOffset;

    animateScrollTo(targetPosition, 450);
}


/* ==========================================================
   VIDÉOS
========================================================== */

/**
 * Empêche plusieurs vidéos de jouer simultanément.
 */
function initialiseVideoManagement() {
    const videos = document.querySelectorAll("video");

    videos.forEach((video) => {
        video.addEventListener("play", () => {
            videos.forEach((otherVideo) => {
                if (otherVideo !== video) {
                    otherVideo.pause();
                }
            });
        });
    });
}


/* ==========================================================
   INITIALISATION DU SITE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const mobileMenu =
        document.querySelector(".mobile-menu");

    const toggleButton =
        document.querySelector(".mobile-menu-toggle");

    const scenesMenu =
        document.querySelector(".mobile-menu-scenes");

    const indexSection =
        document.querySelector("#index");

    initialiseVideoManagement();


    /* ------------------------------------------------------
       ÉTAT INITIAL DES POPUPS
    ------------------------------------------------------ */

    document.querySelectorAll(".popup").forEach((popup) => {
        popup.style.display = "none";
        popup.setAttribute("aria-hidden", "true");
    });


    /* ------------------------------------------------------
       OUVERTURE DU MENU DES SCÈNES
    ------------------------------------------------------ */

    if (toggleButton) {
        toggleButton.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleMobileScenesMenu();
        });
    }

    if (scenesMenu) {
        scenesMenu.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }


    /* ------------------------------------------------------
       LIENS DU MENU MOBILE
    ------------------------------------------------------ */

    const mobileMenuLinks =
        document.querySelectorAll(
            '.mobile-menu a[href^="#"]'
        );

    mobileMenuLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId =
                link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const targetExists =
                targetId === "#top" ||
                targetId === "#accueil" ||
                document.querySelector(targetId);

            if (!targetExists) {
                return;
            }

            event.preventDefault();

            closeMobileScenesMenu();
            scrollToAnchor(targetId);
        });
    });


    /* ------------------------------------------------------
       APPARITION DU MENU MOBILE À PARTIR DE L’INDEX
    ------------------------------------------------------ */

    if (mobileMenu && indexSection) {
        const menuObserver =
            new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        /*
                         * Dès que le haut de l’index a été
                         * atteint, le menu devient visible.
                         */
                        const indexHasBeenReached =
                            entry.isIntersecting ||
                            entry.boundingClientRect.top < 0;

                        mobileMenu.classList.toggle(
                            "visible",
                            indexHasBeenReached
                        );

                        if (!indexHasBeenReached) {
                            closeMobileScenesMenu();
                        }
                    });
                },
                {
                    threshold: 0,
                    rootMargin: "0px"
                }
            );

        menuObserver.observe(indexSection);
    } else if (mobileMenu) {
        /*
         * Si aucun élément #index n’existe,
         * on affiche simplement le menu.
         */
        mobileMenu.classList.add("visible");
    }


    /* ------------------------------------------------------
       FERMETURE DU MENU EN CLIQUANT À L’EXTÉRIEUR
    ------------------------------------------------------ */

    document.addEventListener("click", (event) => {
        if (
            mobileMenu &&
            !mobileMenu.contains(event.target)
        ) {
            closeMobileScenesMenu();
        }
    });


    /* ------------------------------------------------------
       FERMETURE DES POPUPS EN CLIQUANT SUR LE FOND
    ------------------------------------------------------ */

    document.querySelectorAll(".popup").forEach((popup) => {
        popup.addEventListener("click", (event) => {
            /*
             * On ferme uniquement si le clic est
             * directement sur l’overlay sombre.
             */
            if (event.target === popup) {
                closePopup(popup.id);
            }
        });
    });


    /* ------------------------------------------------------
       EMPÊCHER LE CLIC DANS LE CONTENU DE FERMER LA POPUP
    ------------------------------------------------------ */

    document
        .querySelectorAll(".popup-content")
        .forEach((content) => {
            content.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();
                }
            );
        });


    /* ------------------------------------------------------
       TOUCHE ÉCHAP
    ------------------------------------------------------ */

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (
            scenesMenu &&
            scenesMenu.classList.contains("is-open")
        ) {
            closeMobileScenesMenu();
            return;
        }

        closeTopPopup();
    });


    /* ------------------------------------------------------
       MISE À JOUR INITIALE DU MENU
    ------------------------------------------------------ */

    updateMobileMenuVisibility();
});


/* ==========================================================
   EXPOSITION DES FONCTIONS POUR LE HTML
========================================================== */

/*
 * Nécessaire puisque ton HTML utilise des attributs onclick.
 */

window.openPopup = openPopup;
window.closePopup = closePopup;
window.openCinemaFilm = openCinemaFilm;
window.closeMobileScenesMenu = closeMobileScenesMenu;
window.toggleMobileScenesMenu = toggleMobileScenesMenu;