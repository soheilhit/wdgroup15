/* ست‌یار — منطق ست‌ساز و ست‌های ذخیره‌شده (برنچ feature-notes) */
(function () {
  "use strict";

  var area = document.getElementById("builder-area");
  var savedBox = document.getElementById("saved");

  // برای هر دسته، شماره‌ی لباس انتخاب‌شده در لیست آن دسته (-1 یعنی هیچ‌کدام)
  var picked = {};
  Store.CATEGORIES.forEach(function (c) { picked[c.id] = -1; });
  var occasion = "daily";

  function byCategory() {
    var items = Store.getItems();
    var map = {};
    Store.CATEGORIES.forEach(function (c) {
      map[c.id] = items.filter(function (i) { return i.category === c.id; });
    });
    return map;
  }

  function currentParts(map) {
    var parts = {};
    Store.CATEGORIES.forEach(function (c) {
      var list = map[c.id];
      var idx = picked[c.id];
      if (idx >= 0 && idx < list.length) parts[c.id] = list[idx];
    });
    return parts;
  }

  function renderBuilder() {
    var map = byCategory();
    var total = Store.getItems().length;

    if (!total) {
      area.innerHTML =
        '<div class="empty"><h3>کمدت خالی است</h3>' +
        "<p>اول چند لباس اضافه کن تا بتوانی ست بسازی.</p>" +
        '<a class="btn btn-primary" href="wardrobe.html">رفتن به کمد</a>' +
        '<button class="btn btn-ghost" type="button" id="b-samples">لباس نمونه</button></div>';
      document.getElementById("b-samples").addEventListener("click", function () {
        Store.loadSamples();
        renderAll();
      });
      return;
    }

    // اگر لباسی حذف شده باشد، شماره‌ها را درست کن
    Store.CATEGORIES.forEach(function (c) {
      if (picked[c.id] >= map[c.id].length) picked[c.id] = map[c.id].length - 1;
    });

    var parts = currentParts(map);

    var pickers = Store.CATEGORIES.map(function (c) {
      var list = map[c.id];
      var idx = picked[c.id];
      var label = !list.length ? "در کمد نیست" : idx === -1 ? "انتخاب نشده" : list[idx].name;
      var counter = list.length ? " (" + (idx + 1) + "/" + list.length + ")" : "";
      return '<div class="card picker" data-cat="' + c.id + '">' +
        '<button class="arrow" type="button" data-dir="1"' + (list.length ? "" : " disabled") + ' aria-label="بعدی">›</button>' +
        '<div class="info"><strong>' + c.label + counter + "</strong><span>" + UI.esc(label) + "</span></div>" +
        '<button class="arrow" type="button" data-dir="-1"' + (list.length ? "" : " disabled") + ' aria-label="قبلی">‹</button>' +
        (idx !== -1 ? '<button class="btn btn-soft btn-sm none-btn" type="button" data-clear="1">بدون ' + c.label + "</button>" : "") +
        "</div>";
    }).join("");

    var occ = Store.OCCASIONS.map(function (o) {
      return '<button type="button" class="chip' + (o.id === occasion ? " active" : "") + '" data-occ="' + o.id + '">' + o.label + "</button>";
    }).join("");

    area.innerHTML =
      '<div class="builder">' +
      '<div class="pickers">' + pickers + "</div>" +
      '<div class="card preview-card">' + UI.board(parts) +
      '<div class="save-row">' +
      '<input class="input" id="outfit-name" maxlength="40" placeholder="اسم ست (اختیاری)">' +
      '<div class="occ-row" style="display:flex;gap:6px;flex-wrap:wrap">' + occ + "</div>" +
      '<button class="btn btn-primary" type="button" id="btn-save">ذخیره ست</button>' +
      "</div></div></div>";
  }

  area.addEventListener("click", function (e) {
    var map = byCategory();

    var arrow = e.target.closest(".arrow");
    if (arrow && !arrow.disabled) {
      var cat = arrow.closest(".picker").getAttribute("data-cat");
      var n = map[cat].length;
      if (!n) return;
      var dir = Number(arrow.getAttribute("data-dir"));
      // از «انتخاب نشده» شروع می‌شود و دور می‌زند
      var next = picked[cat] + dir;
      if (next >= n) next = 0;
      if (next < 0) next = n - 1;
      picked[cat] = next;
      keepName(renderBuilder);
      return;
    }

    var clear = e.target.closest("[data-clear]");
    if (clear) {
      picked[clear.closest(".picker").getAttribute("data-cat")] = -1;
      keepName(renderBuilder);
      return;
    }

    var occBtn = e.target.closest("[data-occ]");
    if (occBtn) {
      occasion = occBtn.getAttribute("data-occ");
      keepName(renderBuilder);
      return;
    }

    if (e.target.id === "btn-save") saveCurrent(map);
  });

  // بازسازی صفحه، اسمی که کاربر نوشته را از بین نبرد
  function keepName(fn) {
    var el = document.getElementById("outfit-name");
    var value = el ? el.value : "";
    fn();
    var again = document.getElementById("outfit-name");
    if (again) again.value = value;
  }

  function saveCurrent(map) {
    var parts = currentParts(map);
    var ids = {};
    Object.keys(parts).forEach(function (cat) { ids[cat] = parts[cat].id; });
    if (Object.keys(ids).length < 2) {
      UI.toast("حداقل دو تکه انتخاب کن");
      return;
    }
    var saved = Store.addOutfit({
      name: document.getElementById("outfit-name").value.trim(),
      occasion: occasion,
      parts: ids
    });
    if (!saved) {
      UI.toast("ذخیره نشد؛ حافظه مرورگر پر است");
      return;
    }
    UI.toast("ست ذخیره شد");
    document.getElementById("outfit-name").value = "";
    renderSaved();
  }

  /* ---------- ست‌های ذخیره‌شده ---------- */
  function renderSaved() {
    var outfits = Store.getOutfits();
    var items = Store.getItems();
    if (!outfits.length) {
      savedBox.innerHTML = '<div class="empty" style="grid-column:1/-1"><h3>هنوز ستی ذخیره نکرده‌ای</h3><p>یک ترکیب بساز و ذخیره‌اش کن.</p></div>';
      return;
    }
    savedBox.innerHTML = outfits.map(function (o) {
      return '<article class="card outfit-card">' +
        UI.board(UI.resolveParts(o.parts, items)) +
        '<div class="meta"><h3>' + UI.esc(o.name) + '</h3><span class="tag">' + Store.occasionLabel(o.occasion) + "</span></div>" +
        '<div class="actions"><button class="btn btn-danger btn-sm" type="button" data-del="' + o.id + '">حذف</button></div>' +
        "</article>";
    }).join("");
  }

  savedBox.addEventListener("click", function (e) {
    var b = e.target.closest("[data-del]");
    if (!b) return;
    Store.removeOutfit(b.getAttribute("data-del"));
    UI.toast("ست حذف شد");
    renderSaved();
  });

  function renderAll() {
    renderBuilder();
    renderSaved();
  }

  renderAll();
})();
