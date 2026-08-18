/* ============================================================
   i18n — EN/FR language toggle (shared by every page)
   ------------------------------------------------------------
   How it works:
   - Any element carrying a data-fr="…" attribute is translatable.
     Its ORIGINAL HTML (English) is captured once and kept as the
     English version; data-fr holds the French version.
   - Inside data-fr you can use inline HTML (<strong>, <em>, <sup>…).
     If you need a tag WITH an attribute, escape the quotes:
       data-fr="… <span class=&quot;accent&quot;>juste</span> …"
   - The chosen language is stored in localStorage, so it sticks
     across pages and reloads.
   - The home page generates its project cards in JS; it can expose
     window.renderProjects(lang) and this script will call it.
   ============================================================ */
(function () {
  const KEY = "site-lang";
  const getLang = () => localStorage.getItem(KEY) || "en";

  function translate(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-fr]").forEach((el) => {
      // capture the English original the first time we see this element
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === "fr" ? el.getAttribute("data-fr") : el.dataset.en;
    });

    // reflect state on the toggle
    const t = document.getElementById("langToggle");
    if (t) {
      t.classList.toggle("fr", lang === "fr");
      t.setAttribute("aria-checked", lang === "fr" ? "true" : "false");
      t.querySelectorAll(".lang-opt").forEach((o) =>
        o.classList.toggle("active", o.dataset.lang === lang)
      );
    }
  }

  function setLang(lang) {
    localStorage.setItem(KEY, lang);
    translate(lang);
    // let a page re-render its JS-generated content (e.g. the home project cards)
    if (typeof window.renderProjects === "function") window.renderProjects(lang);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const t = document.getElementById("langToggle");
    if (t) {
      t.addEventListener("click", () =>
        setLang(getLang() === "fr" ? "en" : "fr")
      );
    }
    translate(getLang());
  });

  // exposed so inline scripts can read the saved language on first render
  window.getLang = getLang;
  window.setLang = setLang;
})();
