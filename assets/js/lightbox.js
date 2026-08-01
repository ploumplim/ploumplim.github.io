/* ============================================================
   Lightbox partagée (Blitz Ball · Deep Dive Repair · Over the Garden)
   - Clic sur une image/vidéo média -> pop-up zoomée sur la même page
   - Reclic sur l'image (ou clic sur le fond / bouton × / touche Échap) -> ferme
   - Les vidéos s'ouvrent avec le son + contrôles (fermeture via fond / × / Échap)
   ============================================================ */
(function () {
  // ----- construction de l'overlay -----
  const box = document.createElement("div");
  box.className = "lightbox";
  const closeBtn = document.createElement("button");
  closeBtn.className = "lightbox-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = "&times;";
  box.appendChild(closeBtn);
  document.body.appendChild(box);

  function close() {
    box.classList.remove("open");
    const m = box.querySelector("img, video");
    if (m) m.remove(); // retire le clone (stoppe la vidéo)
  }
  function open(node) {
    const old = box.querySelector("img, video");
    if (old) old.remove();
    box.appendChild(node);
    box.classList.add("open");
  }

  // ----- éléments rendus cliquables -----
  const media = document.querySelectorAll(
    ".cover img, .cover video, .media-slot img, .media-slot video, .task-media img, .task-media video"
  );

  media.forEach(function (el) {
    el.classList.add("zoomable");
    el.addEventListener("click", function (e) {
      e.preventDefault();  // neutralise un éventuel lien parent (a.media-slot)
      e.stopPropagation();

      if (el.tagName === "VIDEO") {
        const v = document.createElement("video");
        v.src = el.currentSrc || el.getAttribute("src");
        v.controls = true;
        v.autoplay = true;
        v.loop = el.loop;
        v.playsInline = true;
        // clic sur la vidéo : ne ferme pas (on garde l'accès aux contrôles)
        v.addEventListener("click", function (ev) { ev.stopPropagation(); });
        open(v);
      } else {
        const img = document.createElement("img");
        img.src = el.currentSrc || el.src;
        img.alt = el.alt || "";
        open(img); // reclic sur l'image -> remonte jusqu'à .lightbox -> ferme
      }
    });
  });

  // ----- fermeture -----
  box.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
