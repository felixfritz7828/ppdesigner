/* ==========================================================
   RECTO VERSO
   Gestion des popups, vidéos, cinéma et menu mobile
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const popups = [...document.querySelectorAll(".popup")];

    const mobileMenu = document.querySelector(".mobile-menu");
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const scenesMenu = document.querySelector(".mobile-menu-scenes");
    const indexSection = document.querySelector("#index");

    let savedScrollPosition = 0;


    /* ======================================================
       POPUPS
    ====================================================== */

    function getOpenPopups() {
        return popups.filter((popup) =>
            popup.classList.contains("is-open")
        );
    }


function updatePageState() {
    const popupIsOpen =
        document.querySelector(".popup.is-open") !== null;

    document.body.classList.toggle(
        "popup-open",
        popupIsOpen
    );

    if (!popupIsOpen) {
        unlockPageScroll();
    }
}


    function lockPageScroll() {
        if (body.classList.contains("scroll-locked")) {
            return;
        }

        savedScrollPosition = window.scrollY;

        body.classList.add("scroll-locked");

        body.style.position = "fixed";
        body.style.top = `-${savedScrollPosition}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
    }


    function unlockPageScroll() {
        if (!body.classList.contains("scroll-locked")) {
            return;
        }

        body.classList.remove("scroll-locked");

        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";

        window.scrollTo(0, savedScrollPosition);
    }


    function stopVideos(container) {
        container.querySelectorAll("video").forEach((video) => {
            video.pause();

            try {
                video.currentTime = 0;
            } catch {
                // La vidéo n’est peut-être pas encore chargée.
            }
        });
    }


    function resetPopupScroll(popup) {
        popup.scrollTop = 0;

        popup
            .querySelectorAll(".popup-content, .cinema-content")
            .forEach((element) => {
                element.scrollTop = 0;
            });
    }


function openPopup(popupId) {
    const popup = document.getElementById(popupId);

    if (!popup) {
        console.warn(`Popup introuvable : ${popupId}`);
        return;
    }

    closeScenesMenu();
    resetPopupScroll(popup);
    lockPageScroll();

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");

    updatePageState();
}


function closePopup(popupId) {
    const popup = document.getElementById(popupId);

    if (!popup) {
        console.warn(`Popup introuvable : ${popupId}`);
        return;
    }

    stopVideos(popup);

    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");

    updatePageState();
}

function closeTopPopup() {
    const openPopups = getOpenPopups();

    if (openPopups.length === 0) {
        return;
    }

    const topPopup = openPopups.reduce(
        (highestPopup, currentPopup) => {

            const highestZIndex =
                parseInt(
                    getComputedStyle(highestPopup).zIndex,
                    10
                ) || 0;

            const currentZIndex =
                parseInt(
                    getComputedStyle(currentPopup).zIndex,
                    10
                ) || 0;

            return currentZIndex >= highestZIndex
                ? currentPopup
                : highestPopup;
        }
    );

    closePopup(topPopup.id);
}

    /* ======================================================
       CINÉMA
    ====================================================== */

    function openCinemaFilm(filmId) {
        const cinemaPopup = document.getElementById("popupCINE");
        const film = document.getElementById(filmId);

        if (!cinemaPopup) {
            return;
        }

        openPopup("popupCINE");

        if (!film) {
            return;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {

                const popupTop =
                    cinemaPopup.getBoundingClientRect().top;

                const filmTop =
                    film.getBoundingClientRect().top;

                const targetPosition =
                    cinemaPopup.scrollTop +
                    filmTop -
                    popupTop -
                    20;

                animateElementScroll(
                    cinemaPopup,
                    targetPosition
                );
            });
        });
    }


    /* ======================================================
       VIDÉOS
    ====================================================== */

    const videos = [...document.querySelectorAll("video")];

    videos.forEach((video) => {
        video.addEventListener("play", () => {

            videos.forEach((otherVideo) => {
                if (otherVideo !== video) {
                    otherVideo.pause();
                }
            });

        });
    });


    /* ======================================================
       MENU MOBILE
    ====================================================== */

    function closeScenesMenu() {
        if (menuToggle) {
            menuToggle.classList.remove("is-open");
            menuToggle.setAttribute(
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


    function toggleScenesMenu() {
        if (!menuToggle || !scenesMenu) {
            return;
        }

        const willOpen =
            !scenesMenu.classList.contains("is-open");

        menuToggle.classList.toggle(
            "is-open",
            willOpen
        );

        scenesMenu.classList.toggle(
            "is-open",
            willOpen
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(willOpen)
        );

        scenesMenu.setAttribute(
            "aria-hidden",
            String(!willOpen)
        );
    }


    if (menuToggle) {
        menuToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleScenesMenu();
        });
    }


    if (scenesMenu) {
        scenesMenu.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }


    document.addEventListener("click", (event) => {
        if (
            mobileMenu &&
            !mobileMenu.contains(event.target)
        ) {
            closeScenesMenu();
        }
    });


    /* ======================================================
       APPARITION DU MENU À PARTIR DE L’INDEX
    ====================================================== */

    if (mobileMenu && indexSection) {

        const observer = new IntersectionObserver(
            ([entry]) => {

                const indexHasBeenReached =
                    entry.isIntersecting ||
                    entry.boundingClientRect.top < 0;

                mobileMenu.classList.toggle(
                    "visible",
                    indexHasBeenReached
                );

                if (!indexHasBeenReached) {
                    closeScenesMenu();
                }
            },
            {
                threshold:0
            }
        );

        observer.observe(indexSection);

    } else if (mobileMenu) {

        mobileMenu.classList.add("visible");

    }


    /* ======================================================
       LIENS ET SCROLL
    ====================================================== */

    document
        .querySelectorAll('.mobile-menu a[href^="#"]')
        .forEach((link) => {

            link.addEventListener("click", (event) => {
                const targetId = link.getAttribute("href");

                if (!targetId || targetId === "#") {
                    return;
                }

                if (
                    targetId !== "#top" &&
                    targetId !== "#accueil" &&
                    !document.querySelector(targetId)
                ) {
                    return;
                }

                event.preventDefault();

                closeScenesMenu();
                scrollToAnchor(targetId);
            });

        });


    function scrollToAnchor(targetId) {
        if (
            targetId === "#top" ||
            targetId === "#accueil"
        ) {
            animateWindowScroll(0);
            return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
            return;
        }

        const targetPosition =
            target.getBoundingClientRect().top +
            window.scrollY -
            20;

        animateWindowScroll(targetPosition);
    }


    function animateWindowScroll(
        targetPosition,
        duration = 450
    ) {
        const startPosition = window.scrollY;

        const maximumPosition =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const finalPosition = Math.max(
            0,
            Math.min(targetPosition, maximumPosition)
        );

        animateValue(
            startPosition,
            finalPosition,
            duration,
            (value) => {
                window.scrollTo(0, value);
            }
        );
    }


    function animateElementScroll(
        element,
        targetPosition,
        duration = 450
    ) {
        animateValue(
            element.scrollTop,
            targetPosition,
            duration,
            (value) => {
                element.scrollTop = value;
            }
        );
    }


    function animateValue(
        start,
        end,
        duration,
        update
    ) {
        const startTime = performance.now();
        const distance = end - start;

        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easing =
                1 - Math.pow(1 - progress, 4);

            update(start + distance * easing);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }


    /* ======================================================
       FERMETURE DES POPUPS
    ====================================================== */

    popups.forEach((popup) => {

        popup.setAttribute("aria-hidden", "true");

        popup.addEventListener("click", (event) => {
            if (event.target === popup) {
                closePopup(popup.id);
            }
        });

    });


    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (
            scenesMenu &&
            scenesMenu.classList.contains("is-open")
        ) {
            closeScenesMenu();
            return;
        }

        closeTopPopup();
    });


    /* ======================================================
       FONCTIONS UTILISÉES PAR LES onclick DU HTML
    ====================================================== */

    window.openPopup = openPopup;
    window.closePopup = closePopup;
    window.openCinemaFilm = openCinemaFilm;
    window.closeMobileScenesMenu = closeScenesMenu;
    window.toggleMobileScenesMenu = toggleScenesMenu;

});