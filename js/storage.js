/* ست‌یار — ذخیره‌سازی و داده‌های مشترک (برنچ develop)
   همه چیز داخل مرورگر (localStorage) نگه‌داری می‌شود. */
(function (root) {
  "use strict";

  var KEY_ITEMS = "wd15.items";
  var KEY_OUTFITS = "wd15.outfits";

  var CATEGORIES = [
    { id: "manto", label: "مانتو" },
    { id: "pants", label: "شلوار" },
    { id: "shoes", label: "کفش" },
    { id: "bag", label: "کیف" }
  ];

  var OCCASIONS = [
    { id: "daily", label: "روزمره" },
    { id: "uni", label: "دانشگاه" },
    { id: "party", label: "مهمانی" }
  ];

  var COLORS = [
    { id: "black", label: "مشکی", hex: "#1f1f23", neutral: true },
    { id: "white", label: "سفید", hex: "#f5f2ec", neutral: true },
    { id: "beige", label: "کرم", hex: "#d9c3a0", neutral: true },
    { id: "gray", label: "طوسی", hex: "#9a9aa0", neutral: true },
    { id: "navy", label: "سرمه‌ای", hex: "#1f2a4a", neutral: true },
    { id: "brown", label: "قهوه‌ای", hex: "#6b4a36", neutral: true },
    { id: "red", label: "قرمز", hex: "#b3263a", neutral: false },
    { id: "pink", label: "صورتی", hex: "#e08aa3", neutral: false },
    { id: "green", label: "سبز", hex: "#4f7a5a", neutral: false },
    { id: "blue", label: "آبی", hex: "#3f6fb5", neutral: false },
    { id: "yellow", label: "زرد", hex: "#e2b53c", neutral: false },
    { id: "purple", label: "بنفش", hex: "#6c4a8f", neutral: false }
  ];

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function categoryLabel(id) { var c = find(CATEGORIES, id); return c ? c.label : id; }
  function occasionLabel(id) { var o = find(OCCASIONS, id); return o ? o.label : id; }
  function colorInfo(id) { return find(COLORS, id) || COLORS[0]; }
  function isNeutral(id) { return !!colorInfo(id).neutral; }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function read(key) {
    try {
      var raw = root.localStorage.getItem(key);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function write(key, data) {
    try {
      root.localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      return false; // حافظه مرورگر پر است
    }
  }

  /* ---------- لباس‌ها ---------- */
  function getItems() { return read(KEY_ITEMS); }

  function addItem(item) {
    var items = getItems();
    var full = {
      id: uid(),
      name: item.name || "بدون نام",
      category: item.category,
      color: item.color || "black",
      occasions: item.occasions && item.occasions.length ? item.occasions : ["daily"],
      img: item.img,
      createdAt: Date.now()
    };
    items.push(full);
    return write(KEY_ITEMS, items) ? full : null;
  }

  function removeItem(id) {
    write(KEY_ITEMS, getItems().filter(function (i) { return i.id !== id; }));
    // ست‌هایی که این لباس را دارند هم اصلاح می‌شوند
    var outfits = getOutfits().map(function (o) {
      var parts = {};
      Object.keys(o.parts).forEach(function (cat) { if (o.parts[cat] !== id) parts[cat] = o.parts[cat]; });
      o.parts = parts;
      return o;
    }).filter(function (o) { return Object.keys(o.parts).length >= 2; });
    write(KEY_OUTFITS, outfits);
  }

  /* ---------- ست‌ها: parts = { manto: itemId, pants: itemId, ... } ---------- */
  function getOutfits() { return read(KEY_OUTFITS); }

  function addOutfit(outfit) {
    var list = getOutfits();
    var full = {
      id: uid(),
      name: outfit.name || "ست " + (list.length + 1),
      occasion: outfit.occasion || "daily",
      parts: outfit.parts,
      createdAt: Date.now()
    };
    list.unshift(full);
    return write(KEY_OUTFITS, list) ? full : null;
  }

  function removeOutfit(id) {
    write(KEY_OUTFITS, getOutfits().filter(function (o) { return o.id !== id; }));
  }

  function clearAll() {
    try {
      root.localStorage.removeItem(KEY_ITEMS);
      root.localStorage.removeItem(KEY_OUTFITS);
    } catch (e) { /* مهم نیست */ }
  }

  /* ---------- تصویر ---------- */
  function shade(hex, amount) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function ch(v) {
      v = Math.round(v + 255 * amount);
      return Math.max(0, Math.min(255, v));
    }
    return "#" + ((1 << 24) + (ch(r) << 16) + (ch(g) << 8) + ch(b)).toString(16).slice(1);
  }

  // تصویر نمونه برای وقتی کاربر عکس ندارد (SVG ساخته‌شده با کد)
  function placeholder(category, colorId) {
    var hex = colorInfo(colorId).hex;
    var dark = shade(hex, -0.18);
    var shape = "";
    if (category === "manto") {
      shape =
        '<path d="M70 28 L100 42 L130 28 L174 60 L154 92 L142 82 L148 182 L52 182 L58 82 L46 92 L26 60 Z" fill="' + hex + '"/>' +
        '<path d="M100 42 L100 182" stroke="' + dark + '" stroke-width="3" fill="none"/>' +
        '<path d="M56 112 H144" stroke="' + dark + '" stroke-width="6" fill="none"/>';
    } else if (category === "pants") {
      shape =
        '<path d="M62 22 H138 L148 180 H106 L100 82 L94 180 H52 Z" fill="' + hex + '"/>' +
        '<path d="M62 38 H138" stroke="' + dark + '" stroke-width="6" fill="none"/>' +
        '<path d="M100 38 V82" stroke="' + dark + '" stroke-width="3" fill="none"/>';
    } else if (category === "shoes") {
      shape =
        '<path d="M22 118 C22 98 60 94 80 94 L98 116 C122 118 152 110 178 130 C184 142 178 156 166 156 H34 C26 156 22 146 22 136 Z" fill="' + hex + '"/>' +
        '<path d="M24 146 H178" stroke="' + dark + '" stroke-width="8" fill="none"/>';
    } else {
      shape =
        '<path d="M72 78 C72 34 128 34 128 78" stroke="' + dark + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
        '<rect x="44" y="76" width="112" height="90" rx="14" fill="' + hex + '"/>' +
        '<rect x="44" y="98" width="112" height="8" fill="' + dark + '"/>' +
        '<circle cx="100" cy="116" r="7" fill="' + dark + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' + shape + "</svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // کوچک‌کردن عکس آپلودی تا حافظه مرورگر زود پر نشود
  function fileToDataURL(file, maxSize) {
    maxSize = maxSize || 480;
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("خواندن فایل ممکن نشد")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("فایل، عکس معتبری نیست")); };
        img.onload = function () {
          var ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * ratio));
          var h = Math.max(1, Math.round(img.height * ratio));
          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/webp", 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- داده نمونه ---------- */
  function loadSamples() {
    var samples = [
      ["مانتو کرم بلند", "manto", "beige", ["daily", "uni"]],
      ["مانتو مشکی رسمی", "manto", "black", ["party", "uni"]],
      ["مانتو سبز", "manto", "green", ["daily"]],
      ["مانتو صورتی", "manto", "pink", ["party"]],
      ["شلوار جین سرمه‌ای", "pants", "navy", ["daily", "uni"]],
      ["شلوار مشکی", "pants", "black", ["party", "uni", "daily"]],
      ["شلوار کرم", "pants", "beige", ["daily", "party"]],
      ["کفش سفید کتانی", "shoes", "white", ["daily", "uni"]],
      ["کفش مشکی", "shoes", "black", ["party", "uni"]],
      ["کفش قهوه‌ای", "shoes", "brown", ["daily", "party"]],
      ["کیف قهوه‌ای", "bag", "brown", ["daily", "uni"]],
      ["کیف مشکی دستی", "bag", "black", ["party", "uni"]],
      ["کیف قرمز", "bag", "red", ["party"]]
    ];
    var added = 0;
    samples.forEach(function (s) {
      var ok = addItem({ name: s[0], category: s[1], color: s[2], occasions: s[3], img: placeholder(s[1], s[2]) });
      if (ok) added++;
    });
    return added;
  }

  root.Store = {
    CATEGORIES: CATEGORIES,
    OCCASIONS: OCCASIONS,
    COLORS: COLORS,
    categoryLabel: categoryLabel,
    occasionLabel: occasionLabel,
    colorInfo: colorInfo,
    isNeutral: isNeutral,
    getItems: getItems,
    addItem: addItem,
    removeItem: removeItem,
    getOutfits: getOutfits,
    addOutfit: addOutfit,
    removeOutfit: removeOutfit,
    clearAll: clearAll,
    placeholder: placeholder,
    fileToDataURL: fileToDataURL,
    loadSamples: loadSamples
  };
})(typeof window !== "undefined" ? window : globalThis);
