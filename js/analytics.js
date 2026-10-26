/* إحصائيات الزوار عبر GoatCounter (مجاني، بدون كوكيز).
   يعمل فقط عند وضع اسم الحساب في SITE.analytics.goatcounter داخل data/library.js
   أو في المتغير CODE بالأسفل. لا يعمل على جهازك المحلي (localhost) حتى لا تُحسب زياراتك أثناء التجربة. */
(function () {
  'use strict';

  var CODE = '';   // اسم حسابك في GoatCounter (يظهر في الرابط: CODE.goatcounter.com) — فارغ = الإحصائيات متوقفة

  var cfg = (window.SITE && window.SITE.analytics) || {};
  var code = (cfg.goatcounter || CODE || '').trim();
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';

  // queue for events fired before the counter script has loaded
  var queue = [];
  window.track = function (name, detail) {
    if (!code || local) return;
    var ev = { path: name + (detail ? ': ' + detail : ''), title: detail || name, event: true };
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(ev);
    else queue.push(ev);
  };

  if (!code || local) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + code + '.goatcounter.com/count');
  s.onload = function () {
    var t = setInterval(function () {            // count.js sets window.goatcounter.count once ready
      if (window.goatcounter && window.goatcounter.count) {
        clearInterval(t);
        queue.splice(0).forEach(function (ev) { window.goatcounter.count(ev); });
      }
    }, 200);
    setTimeout(function () { clearInterval(t); }, 10000);
  };
  document.head.appendChild(s);
})();
