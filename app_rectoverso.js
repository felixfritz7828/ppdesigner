/* =========================
   GESTION DES VIDÉOS
========================= */

function stopVideo(video, reset = true){
    video.pause();

    if(reset){
        try{
            video.currentTime = 0;
        }catch(error){
            // La vidéo n'est peut-être pas encore chargée.
        }
    }
}

function stopAllVideos(reset = false){
    document.querySelectorAll("video").forEach(video => {
        stopVideo(video, reset);
    });
}

function playCartelVideos(popup){
    const videos = popup.querySelectorAll("video");

    videos.forEach(video => {
        try{
            video.currentTime = 0;
        }catch(error){
            // La vidéo n'est peut-être pas encore chargée.
        }

        const playPromise = video.play();

        if(playPromise){
            playPromise.catch(() => {
                // L'autoplay avec son peut être bloqué.
            });
        }
    });
}


/* =========================
   GESTION DES POPUPS
========================= */

function openPopup(id){
    const popup = document.getElementById(id);

    if(!popup){
        return;
    }

    popup.style.display = "block";

    if(popup.classList.contains("popup-cinema")){
        popup.scrollTop = 0;
    }

    /*
     * On bloque seulement le défilement.
     * On ne passe plus le body en position:fixed.
     */
    document.documentElement.classList.add("popup-open");
    document.body.classList.add("popup-open");

    stopAllVideos(false);

    /*
     * Les vidéos des cartels artistes peuvent démarrer.
     * Les trois vidéos du cinéma restent arrêtées.
     */
    if(!popup.classList.contains("popup-cinema")){
        playCartelVideos(popup);
    }
}


function closePopup(id){
    const popup = document.getElementById(id);

    if(!popup){
        return;
    }

    popup.querySelectorAll("video").forEach(video => {
        stopVideo(video, true);
    });

    popup.style.display = "none";

    const popupEncoreOuvert = [...document.querySelectorAll(".popup")]
        .some(element => {
            return window.getComputedStyle(element).display !== "none";
        });

    if(!popupEncoreOuvert){
        document.documentElement.classList.remove("popup-open");
        document.body.classList.remove("popup-open");
    }
}


/* =========================
   CLIC SUR LE FOND
========================= */

document.querySelectorAll(".popup").forEach(popup => {
    popup.addEventListener("click", event => {
        if(event.target === popup){
            closePopup(popup.id);
        }
    });
});


/* =========================
   UNE SEULE VIDÉO À LA FOIS
========================= */

document.querySelectorAll("video").forEach(video => {
    video.addEventListener("play", () => {
        document.querySelectorAll("video").forEach(otherVideo => {
            if(otherVideo !== video){
                stopVideo(otherVideo, false);
            }
        });
    });
});


/* =========================
   INDEX → FILM DU CINÉMA
========================= */

function openCinemaFilm(filmId){
    openPopup("popupCINE");

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            const popupCinema = document.getElementById("popupCINE");
            const film = document.getElementById(filmId);

            if(!popupCinema || !film){
                return;
            }

            const popupRect = popupCinema.getBoundingClientRect();
            const filmRect = film.getBoundingClientRect();

            const destination =
                popupCinema.scrollTop +
                filmRect.top -
                popupRect.top -
                20;

            popupCinema.scrollTo({
                top:destination,
                behavior:"smooth"
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
   SCROLL RAPIDE ET FLUIDE DU MENU MOBILE
========================================= */

const mobileMenuLinks = document.querySelectorAll(
    '.mobile-menu a[href^="#"]'
);

mobileMenuLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const target =
            targetId === "#top"
                ? document.documentElement
                : document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        closeMobileScenesMenu();

        const scrollOffset = 20;

        const targetPosition =
            targetId === "#top"
            ? 0
            : target.getBoundingClientRect().top
            + window.scrollY
            - scrollOffset;

            animateScrollTo(targetPosition, 450);

    });

});


function animateScrollTo(targetPosition, duration = 450) {

    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    function animation(currentTime) {

        const elapsedTime = currentTime - startTime;

        const progress = Math.min(
            elapsedTime / duration,
            1
        );

        /*
        Accélération douce au départ,
        puis ralentissement rapide à l’arrivée.
        */

        const easing =
            1 - Math.pow(1 - progress, 4);

        window.scrollTo(
            0,
            startPosition + distance * easing
        );

        if (progress < 1) {
            requestAnimationFrame(animation);
        }

    }

    requestAnimationFrame(animation);

}

    const mobileMenu = document.querySelector(".mobile-menu");
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const scenesMenu = document.querySelector(".mobile-menu-scenes");
    const indexSection = document.querySelector("#index");

    if (!mobileMenu || !menuToggle || !scenesMenu || !indexSection) {
        return;
    }


    /* Affiche le menu lorsque l’index entre dans l’écran */

    const indexObserver = new IntersectionObserver(
        (entries) => {

            const indexIsVisible = entries[0].isIntersecting;

            mobileMenu.classList.toggle(
                "visible",
                indexIsVisible
            );

            if (!indexIsVisible) {
                closeMobileScenesMenu();
            }

        },
        {
            threshold:0.02
        }
    );

    indexObserver.observe(indexSection);


    /* Ouverture et fermeture de la liste */

    menuToggle.addEventListener("click", () => {

        const menuIsOpen =
            scenesMenu.classList.contains("is-open");

        if (menuIsOpen) {
            closeMobileScenesMenu();
        } else {
            openMobileScenesMenu();
        }

    });


    /* Ferme le panneau après avoir choisi une scène */

    scenesMenu.querySelectorAll("a").forEach((link) => {

        link.addEventListener("click", () => {
            closeMobileScenesMenu();
        });

    });


    /* Ferme le panneau en touchant ailleurs */

    document.addEventListener("click", (event) => {

        if (!mobileMenu.contains(event.target)) {
            closeMobileScenesMenu();
        }

    });


    /* Ferme le panneau avec la touche Échap */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeMobileScenesMenu();
        }

    });


    function openMobileScenesMenu() {

        scenesMenu.classList.add("is-open");
        menuToggle.classList.add("is-open");

        scenesMenu.setAttribute("aria-hidden", "false");
        menuToggle.setAttribute("aria-expanded", "true");

    }


    function closeMobileScenesMenu() {

        scenesMenu.classList.remove("is-open");
        menuToggle.classList.remove("is-open");

        scenesMenu.setAttribute("aria-hidden", "true");
        menuToggle.setAttribute("aria-expanded", "false");

    }

});