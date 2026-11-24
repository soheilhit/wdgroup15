/* ست‌یار — هدر، اعلان و ابزارهای مشترک رابط (برنچ develop) */
(function (root) {
  "use strict";

  var PAGES = [
    { id: "welcome", href: "index.html", label: "خوش‌آمد" },
    { id: "wardrobe", href: "wardrobe.html", label: "کمد من" },
    { id: "builder", href: "builder.html", label: "ست‌ساز" },
    { id: "suggest", href: "suggest.html", label: "پیشنهاد استایل" }
  ];

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var current = document.body.getAttribute("data-page");
    var links = PAGES.map(function (p) {
      return '<a href="' + p.href + '"' + (p.id === current ? ' class="active"' : "") + ">" + p.label + "</a>";
    }).join("");
    host.className = "site-header";
    host.innerHTML =
      '<div class="container">' +
      '<a class="brand" href="index.html"><span class="brand-mark"></span>ست‌یار</a>' +
      '<nav class="nav">' + links + "</nav>" +
      "</div>";
  }

  var toastTimer = null;
  function toast(message) {
    var el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  // اگر بعضی لباس‌ها عکس نداشته باشند، تصویر نمونه نشان داده می‌شود
  function itemImage(item) {
    return item.img || root.Store.placeholder(item.category, item.color);
  }

  // parts: { manto: item, pants: item, shoes: item, bag: item } (هر کدام می‌تواند خالی باشد)
  function board(parts) {
    return '<div class="board">' + root.Store.CATEGORIES.map(function (c) {
      var it = parts[c.id];
      if (!it) return '<div class="slot empty-slot">' + c.label + "</div>";
      return '<div class="slot"><img src="' + itemImage(it) + '" alt="' + esc(it.name) + '"><small>' + esc(it.name) + "</small></div>";
    }).join("") + "</div>";
  }

  // پیدا کردن لباس‌های یک ست ذخیره‌شده از روی شناسه‌ها
  function resolveParts(outfitParts, items) {
    var byId = {};
    items.forEach(function (i) { byId[i.id] = i; });
    var out = {};
    Object.keys(outfitParts).forEach(function (cat) {
      if (byId[outfitParts[cat]]) out[cat] = byId[outfitParts[cat]];
    });
    return out;
  }

  root.UI = {
    esc: esc,
    toast: toast,
    itemImage: itemImage,
    renderHeader: renderHeader,
    board: board,
    resolveParts: resolveParts
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHeader);
  } else {
    renderHeader();
  }
})(window);
