/* ست‌یار — موتور پیشنهاد استایل (برنچ feature-reminders)
   بدون هوش مصنوعی؛ فقط چند قانون ساده‌ی هماهنگی رنگ و موقعیت. */
(function (root) {
  "use strict";

  var ORDER = ["manto", "pants", "shoes", "bag"];

  function neutral(colorId, isNeutral) { return isNeutral(colorId); }

  // امتیاز یک ترکیب؛ هرچه بالاتر، هماهنگ‌تر
  function scoreOutfit(parts, isNeutral) {
    var score = 0;
    var colors = [];
    var loud = [];
    ORDER.forEach(function (cat) {
      var it = parts[cat];
      if (!it) return;
      colors.push(it.color);
      if (!neutral(it.color, isNeutral)) loud.push(it.color);
    });

    // حداکثر یک رنگ پررنگ، بهترین حالت است
    if (loud.length === 0) score += 3;
    else if (loud.length === 1) score += 4;
    else {
      var distinct = loud.filter(function (c, i) { return loud.indexOf(c) === i; });
      score -= (distinct.length - 1) * 4;
      if (distinct.length === 1) score += 1; // چند تکه از یک رنگ پررنگ
    }

    // مانتو و شلوار هم‌رنگ، یکنواخت و بی‌حالت می‌شود
    if (parts.manto && parts.pants && parts.manto.color === parts.pants.color) score -= 3;

    // کفش و کیف هم‌رنگ، ست‌شده به نظر می‌رسد
    if (parts.shoes && parts.bag && parts.shoes.color === parts.bag.color) score += 2;

    // تکمیل‌بودن ست
    if (parts.shoes) score += 1;
    if (parts.bag) score += 1;

    return score;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // items: آرایه‌ی لباس‌ها، occasion: شناسه‌ی موقعیت، options: { limit, seed, isNeutral }
  function suggest(items, occasion, options) {
    options = options || {};
    var limit = options.limit || 4;
    var isNeutral = options.isNeutral || function () { return true; };
    var rand = mulberry32(options.seed == null ? 1 : options.seed);

    var byCat = {};
    ORDER.forEach(function (cat) {
      byCat[cat] = items.filter(function (i) {
        return i.category === cat && i.occasions && i.occasions.indexOf(occasion) !== -1;
      });
    });

    // حداقل مانتو و شلوار لازم است
    if (!byCat.manto.length || !byCat.pants.length) return [];

    // دسته‌های خالی (کفش یا کیف) نادیده گرفته می‌شوند
    var pools = ORDER.map(function (cat) {
      return byCat[cat].length ? byCat[cat] : [null];
    });

    var combos = [];
    pools[0].forEach(function (m) {
      pools[1].forEach(function (p) {
        pools[2].forEach(function (s) {
          pools[3].forEach(function (b) {
            var parts = {};
            if (m) parts.manto = m;
            if (p) parts.pants = p;
            if (s) parts.shoes = s;
            if (b) parts.bag = b;
            combos.push({ parts: parts, score: scoreOutfit(parts, isNeutral) + rand() * 0.9 });
          });
        });
      });
    });

    combos.sort(function (a, b) { return b.score - a.score; });

    // ترکیب‌های خیلی شبیه هم تکرار نشوند: هر مانتو حداکثر دو بار
    var used = {};
    var result = [];
    for (var i = 0; i < combos.length && result.length < limit; i++) {
      var mantoId = combos[i].parts.manto.id;
      if ((used[mantoId] || 0) >= 2) continue;
      used[mantoId] = (used[mantoId] || 0) + 1;
      result.push(combos[i]);
    }
    return result;
  }

  var api = { ORDER: ORDER, scoreOutfit: scoreOutfit, suggest: suggest };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SuggestEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
