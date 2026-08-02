/* ============================================================
   Shared lightbox (Blitz Ball · Deep Dive Repair · Over the Garden)
   - Click an image/video media -> zoomed pop-up on the same page
   - Click the image again (or click the backdrop / × button / Esc key) -> close
   - Videos open with sound + controls (close via backdrop / × / Esc)
   ============================================================ */
(function () {
  // ----- overlay construction -----
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
    if (m) m.remove(); // removes the clone (stops the video)
  }
  function open(node) {
    const old = box.querySelector("img, video");
    if (old) old.remove();
    box.appendChild(node);
    box.classList.add("open");
  }

  // ----- elements made clickable -----
  const media = document.querySelectorAll(
    ".cover img, .cover video, .media-slot img, .media-slot video, .task-media img, .task-media video"
  );

  media.forEach(function (el) {
    el.classList.add("zoomable");
    el.addEventListener("click", function (e) {
      e.preventDefault();  // neutralizes any parent link (a.media-slot)
      e.stopPropagation();

      if (el.tagName === "VIDEO") {
        const v = document.createElement("video");
        v.src = el.currentSrc || el.getAttribute("src");
        v.controls = true;
        v.autoplay = true;
        v.loop = el.loop;
        v.playsInline = true;
        // click on the video: does not close (keeps access to the controls)
        v.addEventListener("click", function (ev) { ev.stopPropagation(); });
        open(v);
      } else {
        const img = document.createElement("img");
        img.src = el.currentSrc || el.src;
        img.alt = el.alt || "";
        open(img); // clicking the image again -> bubbles up to .lightbox -> closes
      }
    });
  });

  // ----- closing -----
  box.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
