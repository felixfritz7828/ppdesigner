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