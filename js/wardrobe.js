/* ست‌یار — منطق صفحه کمد (برنچ feature-home) */
(function () {
  "use strict";

  var form = document.getElementById("add-form");
  var fileInput = document.getElementById("file");
  var preview = document.getElementById("preview");
  var nameInput = document.getElementById("name");
  var categorySel = document.getElementById("category");
  var colorsBox = document.getElementById("colors");
  var occBox = document.getElementById("occasions");
  var filtersBox = document.getElementById("filters");
  var grid = document.getElementById("grid");

  var state = { img: null, color: "black", occasions: ["daily"], filter: "all" };

  /* ---------- ساخت فرم ---------- */
  categorySel.innerHTML = Store.CATEGORIES.map(function (c) {
    return '<option value="' + c.id + '">' + c.label + "</option>";
  }).join("");

  function renderColors() {
    colorsBox.innerHTML = Store.COLORS.map(function (c) {
      return '<button type="button" class="swatch' + (c.id === state.color ? " active" : "") +
        '" data-id="' + c.id + '" title="' + c.label + '" aria-label="' + c.label +
        '" style="background:' + c.hex + '"></button>';
    }).join("");
  }

  function renderOccasions() {
    occBox.innerHTML = Store.OCCASIONS.map(function (o) {
      var on = state.occasions.indexOf(o.id) !== -1;
      return '<button type="button" class="chip' + (on ? " active" : "") + '" data-id="' + o.id + '">' + o.label + "</button>";
    }).join("");
  }

  colorsBox.addEventListener("click", function (e) {
    var b = e.target.closest(".swatch");
    if (!b) return;
    state.color = b.getAttribute("data-id");
    renderColors();
  });

  occBox.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    var id = b.getAttribute("data-id");
    var i = state.occasions.indexOf(id);
    if (i === -1) state.occasions.push(id);
    else if (state.occasions.length > 1) state.occasions.splice(i, 1); // حداقل یک موقعیت
    renderOccasions();
  });

  /* ---------- انتخاب عکس ---------- */
  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    Store.fileToDataURL(file, 480).then(function (url) {
      state.img = url;
      preview.src = url;
      preview.hidden = false;
    }).catch(function (err) {
      UI.toast(err.message);
      fileInput.value = "";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var category = categorySel.value;
    var saved = Store.addItem({
      name: nameInput.value.trim(),
      category: category,
      color: state.color,
      occasions: state.occasions.slice(),
      // اگر عکس نگذاشته باشد، تصویر نمونه جایگزین می‌شود
      img: state.img || Store.placeholder(category, state.color)
    });
    if (!saved) {
      UI.toast("حافظه مرورگر پر است؛ چند لباس را پاک کن");
      return;
    }
    UI.toast("به کمد اضافه شد");
    form.reset();
    state.img = null;
    preview.hidden = true;
    preview.removeAttribute("src");
    nameInput.value = "";
    state.occasions = ["daily"];
    renderOccasions();
    renderGrid();
  });

  document.getElementById("btn-samples").addEventListener("click", function () {
    var added = Store.loadSamples();
    UI.toast(added ? added + " لباس نمونه اضافه شد" : "افزودن ممکن نشد");
    renderGrid();
  });

  /* ---------- فیلتر و لیست ---------- */
  function renderFilters() {
    var items = Store.getItems();
    var all = [{ id: "all", label: "همه (" + items.length + ")" }].concat(
      Store.CATEGORIES.map(function (c) {
        var n = items.filter(function (i) { return i.category === c.id; }).length;
        return { id: c.id, label: c.label + " (" + n + ")" };
      })
    );
    filtersBox.innerHTML = all.map(function (f) {
      return '<button type="button" class="chip' + (f.id === state.filter ? " active" : "") +
        '" data-id="' + f.id + '">' + f.label + "</button>";
    }).join("");
  }

  filtersBox.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    state.filter = b.getAttribute("data-id");
    renderGrid();
  });

  function renderGrid() {
    renderFilters();
    var items = Store.getItems().filter(function (i) {
      return state.filter === "all" || i.category === state.filter;
    });

    if (!items.length) {
      grid.innerHTML =
        '<div class="empty"><h3>اینجا هنوز چیزی نیست</h3>' +
        "<p>از فرم کنار لباس اضافه کن یا با لباس نمونه شروع کن.</p></div>";
      return;
    }

    grid.innerHTML = items.map(function (it) {
      var c = Store.colorInfo(it.color);
      var tags = it.occasions.map(function (o) {
        return '<span class="tag">' + Store.occasionLabel(o) + "</span>";
      }).join("");
      return '<article class="card item">' +
        '<div class="pic"><img src="' + UI.itemImage(it) + '" alt="' + UI.esc(it.name) + '"></div>' +
        "<h4>" + '<span class="dot" style="background:' + c.hex + '"></span>' + UI.esc(it.name) + "</h4>" +
        '<div class="tags"><span class="tag">' + Store.categoryLabel(it.category) + "</span>" + tags + "</div>" +
        '<button class="btn btn-danger btn-sm" data-remove="' + it.id + '" type="button">حذف</button>' +
        "</article>";
    }).join("");
  }

  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-remove]");
    if (!b) return;
    if (!confirm("این لباس از کمد و ست‌ها حذف شود؟")) return;
    Store.removeItem(b.getAttribute("data-remove"));
    UI.toast("حذف شد");
    renderGrid();
  });

  renderColors();
  renderOccasions();
  renderGrid();
})();
