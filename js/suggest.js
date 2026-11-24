/* ست‌یار — منطق صفحه پیشنهاد استایل (برنچ feature-reminders) */
(function () {
  "use strict";

  var occBox = document.getElementById("occasions");
  var results = document.getElementById("results");
  var shuffleBtn = document.getElementById("btn-shuffle");

  var state = { occasion: "daily", seed: 1 };
  var current = []; // پیشنهادهای نمایش‌داده‌شده

  function renderOccasions() {
    occBox.innerHTML = Store.OCCASIONS.map(function (o) {
      return '<button type="button" class="chip' + (o.id === state.occasion ? " active" : "") +
        '" data-id="' + o.id + '">' + o.label + "</button>";
    }).join("");
  }

  occBox.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    state.occasion = b.getAttribute("data-id");
    state.seed = 1;
    render();
  });

  shuffleBtn.addEventListener("click", function () {
    state.seed += 1;
    render();
  });

  // امتیاز را به ۱ تا ۵ نقطه تبدیل می‌کنیم
  function dots(score) {
    var n = Math.max(1, Math.min(5, Math.round(score / 2)));
    var out = "";
    for (var i = 1; i <= 5; i++) out += '<i class="' + (i <= n ? "on" : "") + '"></i>';
    return '<span class="match">هماهنگی ' + out + "</span>";
  }

  function render() {
    renderOccasions();
    var items = Store.getItems();

    if (!items.length) {
      current = [];
      results.innerHTML =
        '<div class="empty"><h3>کمدت خالی است</h3><p>برای گرفتن پیشنهاد، اول لباس اضافه کن.</p>' +
        '<a class="btn btn-primary" href="wardrobe.html">رفتن به کمد</a></div>';
      return;
    }

    current = SuggestEngine.suggest(items, state.occasion, {
      limit: 4,
      seed: state.seed,
      isNeutral: Store.isNeutral
    });

    if (!current.length) {
      results.innerHTML =
        '<div class="empty"><h3>برای «' + Store.occasionLabel(state.occasion) + '» لباس کافی نداریم</h3>' +
        "<p>حداقل یک مانتو و یک شلوار با این موقعیت لازم است. در کمد، موقعیت لباس‌ها را اصلاح کن یا لباس تازه اضافه کن.</p>" +
        '<a class="btn btn-primary" href="wardrobe.html">رفتن به کمد</a></div>';
      return;
    }

    results.innerHTML = current.map(function (c, i) {
      return '<article class="card outfit-card">' +
        UI.board(c.parts) +
        '<div class="meta"><h3>پیشنهاد ' + (i + 1) + "</h3>" + dots(c.score) + "</div>" +
        '<div class="actions"><button class="btn btn-primary btn-sm" type="button" data-save="' + i + '">ذخیره این ست</button></div>' +
        "</article>";
    }).join("");
  }

  results.addEventListener("click", function (e) {
    var b = e.target.closest("[data-save]");
    if (!b) return;
    var c = current[Number(b.getAttribute("data-save"))];
    if (!c) return;
    var ids = {};
    Object.keys(c.parts).forEach(function (cat) { ids[cat] = c.parts[cat].id; });
    var saved = Store.addOutfit({
      name: "ست " + Store.occasionLabel(state.occasion),
      occasion: state.occasion,
      parts: ids
    });
    if (saved) {
      UI.toast("در ست‌های ذخیره‌شده اضافه شد");
      b.disabled = true;
      b.textContent = "ذخیره شد";
    } else {
      UI.toast("ذخیره نشد؛ حافظه مرورگر پر است");
    }
  });

  render();
})();
