(function () {
  var $ = function (id) { return document.getElementById(id); };
  var btn = document.querySelector(".menu-btn"), nav = $("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", o ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") nav.classList.remove("open"); });
  }
  document.querySelectorAll(".yr").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Catalog filters (books are pre-rendered in the HTML)
  var getBooks = function () { return Array.prototype.slice.call(document.querySelectorAll(".bk")); };
  if (getBooks().length && $("cat-count")) {
    var state = { imprint: "all", status: "all", q: "" };
    var apply = function () {
      var shown = 0;
      getBooks().forEach(function (b) {
        var ok = (state.imprint === "all" || b.dataset.imprint === state.imprint) &&
                 (state.status === "all" || (state.status === "released" ? b.dataset.status === "released" : b.dataset.status !== "released")) &&
                 (!state.q || b.textContent.toLowerCase().indexOf(state.q) > -1);
        b.style.display = ok ? "" : "none"; if (ok) shown++;
      });
      $("cat-empty").style.display = shown ? "none" : "block";
      $("cat-count").textContent = shown + (shown === 1 ? " title" : " titles");
    };
    document.querySelectorAll("[data-filter]").forEach(function (c) {
      c.addEventListener("click", function () {
        var k = c.dataset.filter;
        document.querySelectorAll('[data-filter="' + k + '"]').forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", "true"); state[k] = c.dataset.value; apply();
      });
    });
    $("cat-q").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); apply(); });
    var fromHash = function () {
      if (location.hash.indexOf("#catalog=") !== 0) return;
      var v = decodeURIComponent(location.hash.slice(9));
      var chip = document.querySelector('[data-filter="imprint"][data-value="' + v + '"]'); if (chip) chip.click();
      $("catalog").scrollIntoView();
    };
    window.addEventListener("hashchange", fromHash); fromHash();
    apply();
    window.sfpCatalogApply = apply; // catalog-live.js calls this after loading titles from the vault
  }

  // Knowledgebase search
  var kbq = $("kb-q");
  if (kbq) {
    var items = Array.prototype.slice.call(document.querySelectorAll(".kb-group details"));
    var groups = Array.prototype.slice.call(document.querySelectorAll(".kb-group"));
    var run = function () {
      var q = kbq.value.trim().toLowerCase(), any = 0;
      items.forEach(function (d) {
        var hit = !q || d.textContent.toLowerCase().indexOf(q) > -1;
        d.style.display = hit ? "" : "none"; if (q && hit) d.open = true; if (!q) d.open = false; if (hit) any++;
      });
      groups.forEach(function (g) {
        var vis = g.querySelectorAll("details:not([style*='none'])").length; g.style.display = vis ? "" : "none";
      });
      $("kb-none").style.display = any ? "none" : "block";
    };
    kbq.addEventListener("input", run);
    var p = new URLSearchParams(location.search).get("q"); if (p) { kbq.value = p; run(); }
    if (location.hash) { var t = document.querySelector(location.hash); if (t && t.tagName === "DETAILS") t.open = true; }
  }
})();
