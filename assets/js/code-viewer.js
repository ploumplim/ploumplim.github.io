/* ============================================================
   Code viewer — turns each <details class="code-block"> into a
   compact slider (one file / function at a time) and highlights it.
   ------------------------------------------------------------
   - The snippet is split into slides at every top-level chunk:
     a line starting at column 0, right after a blank line.
   - Slide titles: a "// File.cs — …" comment gives the file name,
     otherwise the first class / method signature, otherwise the
     start of the leading comment.
   - Tabs + ‹ › buttons + ←/→ keys; fixed-height pane that scrolls.
   Needs highlight.js (optional: without it the code stays plain).
   ============================================================ */
(function () {
  function splitChunks(text) {
    const lines = text.replace(/\s+$/, "").split("\n");
    const chunks = [];
    let cur = [];
    lines.forEach((line, i) => {
      const startsTopLevel = line.length && !/^\s/.test(line) && line[0] !== "}" && line[0] !== "{";
      const prevBlank = i > 0 && lines[i - 1].trim() === "";
      if (startsTopLevel && prevBlank && cur.some((l) => l.trim() !== "")) {
        chunks.push(cur);
        cur = [];
      }
      cur.push(line);
    });
    if (cur.length) chunks.push(cur);
    // drop the blank lines left at the edges of each chunk
    return chunks.map((c) => {
      while (c.length && !c[0].trim()) c.shift();
      while (c.length && !c[c.length - 1].trim()) c.pop();
      return c.join("\n");
    });
  }

  function titleOf(chunk) {
    const lines = chunk.split("\n");
    const first = lines[0].trim();
    const file = first.match(/^\/\/\s*([\w.]+\.cs)\b/);
    if (file) return file[1];
    for (const l of lines.slice(0, 3)) {
      if (l.trim().startsWith("//")) continue;
      const type = l.match(/\b(?:class|struct|enum)\s+(\w+)/);
      if (type) return type[1];
      const method = l.match(/(\w+)\s*\([^;]*\)\s*$/);
      if (method && !/^(if|for|foreach|while|switch|return|new)$/.test(method[1])) return method[1] + "()";
    }
    if (first.startsWith("//")) {
      const t = first.replace(/^\/\/\s*/, "").split(/\s+[—–:-]\s+|:\s/)[0];
      return t.length > 28 ? t.slice(0, 27) + "…" : t;
    }
    return "Code";
  }

  function highlight(code) {
    if (window.hljs) window.hljs.highlightElement(code);
  }

  document.querySelectorAll(".code-block").forEach((block, b) => {
    const pre = block.querySelector("pre");
    const code = pre && pre.querySelector("code");
    if (!code) return;
    const lang = (code.className.match(/language-\w+/) || ["language-csharp"])[0];
    const chunks = splitChunks(code.textContent);

    const viewer = document.createElement("div");
    viewer.className = "code-viewer";

    const bar = document.createElement("div");
    bar.className = "code-tabs";
    bar.setAttribute("role", "tablist");

    const panes = chunks.map((chunk, i) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "code-tab";
      tab.textContent = titleOf(chunk);
      tab.setAttribute("role", "tab");
      tab.id = `code-${b}-tab-${i}`;
      bar.appendChild(tab);

      const p = document.createElement("pre");
      p.className = "code-pane";
      p.setAttribute("role", "tabpanel");
      p.setAttribute("aria-labelledby", tab.id);
      p.tabIndex = 0;
      const c = document.createElement("code");
      c.className = lang;
      c.textContent = chunk;
      p.appendChild(c);
      highlight(c);
      return { tab, pane: p };
    });

    const nav = document.createElement("div");
    nav.className = "code-nav";
    const prev = document.createElement("button");
    const next = document.createElement("button");
    const count = document.createElement("span");
    prev.type = next.type = "button";
    prev.className = next.className = "code-arrow";
    prev.innerHTML = "&#8249;";
    next.innerHTML = "&#8250;";
    prev.setAttribute("aria-label", "Previous snippet");
    next.setAttribute("aria-label", "Next snippet");
    count.className = "code-count";
    nav.append(prev, count, next);

    const head = document.createElement("div");
    head.className = "code-head";
    head.append(bar);
    if (panes.length > 1) head.append(nav);

    const stage = document.createElement("div");
    stage.className = "code-stage";
    panes.forEach(({ pane }) => stage.appendChild(pane));

    viewer.append(head, stage);
    pre.replaceWith(viewer);

    let current = 0;
    function show(i) {
      current = (i + panes.length) % panes.length;
      panes.forEach(({ tab, pane }, k) => {
        const on = k === current;
        tab.classList.toggle("active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        pane.hidden = !on;
      });
      count.textContent = `${current + 1} / ${panes.length}`;
      panes[current].pane.scrollTop = 0;
      // keep the active tab visible when the tab row scrolls (phones)
      const t = panes[current].tab;
      bar.scrollTo({ left: t.offsetLeft - bar.clientWidth / 2 + t.offsetWidth / 2, behavior: "smooth" });
    }
    panes.forEach(({ tab }, i) => tab.addEventListener("click", () => show(i)));
    prev.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    // ←/→ on the tab row only (inside the code, arrows must keep scrolling long lines)
    bar.addEventListener("keydown", (e) => {
      if (panes.length < 2) return;
      if (e.key === "ArrowRight") { show(current + 1); panes[current].tab.focus(); e.preventDefault(); }
      if (e.key === "ArrowLeft") { show(current - 1); panes[current].tab.focus(); e.preventDefault(); }
    });
    show(0);
  });
})();
