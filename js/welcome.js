/* ست‌یار — منطق صفحه خوش‌آمد (برنچ feature-welcome) */
(function () {
  "use strict";

  var ART = [
    ["art-manto", "manto", "beige"],
    ["art-pants", "pants", "navy"],
    ["art-shoes", "shoes", "brown"],
    ["art-bag", "bag", "red"]
  ];

  ART.forEach(function (a) {
    var el = document.getElementById(a[0]);
    if (el) el.src = Store.placeholder(a[1], a[2]);
  });

  var hint = document.getElementById("hint");
  var btn = document.getElementById("btn-samples");

  function refreshHint() {
    var n = Store.getItems().length;
    hint.textContent = n ? "الان " + n + " لباس در کمدت هست." : "";
  }

  btn.addEventListener("click", function () {
    if (Store.getItems().length) {
      UI.toast("کمدت از قبل لباس دارد");
      location.href = "wardrobe.html";
      return;
    }
    var added = Store.loadSamples();
    if (!added) {
      UI.toast("ذخیره‌سازی مرورگر در دسترس نیست");
      return;
    }
    UI.toast(added + " لباس نمونه اضافه شد");
    setTimeout(function () { location.href = "builder.html"; }, 700);
  });

  refreshHint();
})();
