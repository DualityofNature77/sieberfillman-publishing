/* Live catalog: loads titles from the Sieber Fillman vault (sieberfillmanpublishing.online).
   The books already written into this page stay as they are if the vault can't be reached,
   so the catalog never goes blank and search engines still see every title. */
(function () {
  var FEED = "https://sieberfillmanpublishing.online/api.php?a=catalog";
  var grid = document.querySelector(".books");
  if (!grid || !window.fetch) return;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var safeUrl = function (u) { return /^https:\/\//i.test(u || "") ? u : ""; };
  var statusKey = function (s) {
    if (s === "Released") return "released";
    if (s === "In writing" || s === "Paused") return "writing";
    return "production";
  };
  var label = { production: "In production", writing: "In writing" };

  var card = function (b) {
    var st = statusKey(b.status);
    var live = (b.editions || []).filter(function (e) { return e.status === "Live" && safeUrl(e.url); });
    var buy = st === "released" && live.length
      ? live.map(function (e, i) {
          var name = e.label || e.format || "Buy";
          var p = parseFloat(e.price);
          var price = i === 0 && isFinite(p) ? "$" + p.toFixed(2) + " · " : "";
          return '<a class="btn ' + (i === 0 ? "btn-ox" : "btn-ghost") + ' btn-sm" href="' + esc(safeUrl(e.url)) + '" target="_blank" rel="noopener">' + esc(price + name) + "</a>";
        }).join("")
      : '<span class="st ' + st + '">' + (label[st] || "Coming soon") + "</span>";
    var cover = b.media && b.media.front && safeUrl(b.media.front.thumb)
      ? '<img class="bk-cover" src="' + esc(b.media.front.thumb) + '" alt="Cover of ' + esc(b.title) + '" loading="lazy" width="640" height="960">' : "";
    return '<article class="bk' + (cover ? " has-cover" : "") + '" data-imprint="' + esc(b.imprint) + '" data-status="' + st + '">' + cover +
      '<span class="im">' + esc(b.imprint) + " · " + esc(b.num) + "</span>" +
      "<h3>" + esc(b.title) + "</h3>" + (b.subtitle ? '<div class="sub">' + esc(b.subtitle) + "</div>" : "") +
      "<p>" + esc(b.desc) + "</p>" +
      '<div class="foot">' + buy + "</div></article>";
  };

  // Covers come from the vault's permanent addresses (/media/BK-001/front-thumb.jpg), so a new upload shows here automatically.
  var css = document.createElement("style");
  css.textContent = ".bk .bk-cover{display:block;width:100%;height:auto;aspect-ratio:2/3;object-fit:cover;border-radius:8px;margin:0 0 14px;background:#EFE3CC;box-shadow:0 14px 30px -18px rgba(63,16,24,.45)}";
  document.head.appendChild(css);

  fetch(FEED, { mode: "cors", credentials: "omit" })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (j) {
      if (!j || !j.books || !j.books.length) return;
      var only = grid.getAttribute("data-imprint");
      var list = only ? j.books.filter(function (b) { return b.imprint === only; }) : j.books;
      if (!list.length) return;
      grid.innerHTML = list.map(card).join("\n");
      if (window.sfpCatalogApply) window.sfpCatalogApply();
    })
    .catch(function () { /* keep the titles already on the page */ });
})();
