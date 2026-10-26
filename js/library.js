/* My Library — renders data/library.js, with type tabs, search, copy and a full-prompt viewer. */
(function () {
  'use strict';

  var I = window.ICONS;
  var SITE = window.SITE || {};
  var TYPES = {
    prompt: { label: 'Prompt' },
    tool:   { label: 'AI Tool' },
    skill:  { label: 'Skill / File' }
  };

  // Keep only valid entries: known type + a title. Empty optional fields are simply not shown.
  var items = (window.LIBRARY || []).filter(function (it) {
    return it && TYPES[it.type] && typeof it.title === 'string' && it.title.trim();
  }).map(function (it, i) {
    return {
      id: i,
      type: it.type,
      title: it.title.trim(),
      category: (it.category || '').trim(),
      description: (it.description || '').trim(),
      prompt: (it.prompt || '').trim(),
      url: safeUrl(it.url),
      download: safeUrl(it.download)
    };
  });

  function safeUrl(u) {
    if (typeof u !== 'string') return '';
    u = u.trim();
    return /^(https?:\/\/|\.?\/|[\w-]+\/)/i.test(u) ? u : '';   // http(s) links or relative files only
  }

  var $ = function (id) { return document.getElementById(id); };
  var results = $('results'), q = $('q');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  $('backIcon').innerHTML = I.back;
  $('searchIcon').innerHTML = I.search;
  $('viewerClose').innerHTML = I.close;
  if (SITE.displayName) $('brandName').textContent = SITE.displayName;
  if (SITE.avatar) document.querySelectorAll('.topbar__brand img').forEach(function (im) { im.src = SITE.avatar; });

  /* ---------- counts ---------- */
  var counts = { all: items.length, prompt: 0, tool: 0, skill: 0 };
  items.forEach(function (it) { counts[it.type]++; });
  Object.keys(counts).forEach(function (k) {
    var el = document.querySelector('[data-count="' + k + '"]');
    if (el) el.textContent = counts[k];
  });

  /* ---------- state (type is kept in the URL hash so a tab can be linked directly, e.g. library.html#prompts) ---------- */
  var HASH = { prompts: 'prompt', tools: 'tool', skills: 'skill' };
  var state = { type: HASH[location.hash.slice(1)] || 'all', query: '' };

  function norm(s) {
    return (s || '').toLowerCase()
      .replace(/[ً-ْـ]/g, '')           // harakat + tatweel
      .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  }

  /* ---------- render ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function linkBtn(href, label, icon, primary) {
    var a = el('a', 'btn btn--sm ' + (primary ? 'btn--primary' : 'btn--soft'));
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = icon; a.appendChild(document.createTextNode(label));
    return a;
  }
  // Files hosted with the site (files/…) can be downloaded directly; external links can only be opened.
  function isLocalFile(href) { return !/^https?:\/\//i.test(href); }
  function fileName(title, href) {
    var ext = (href.split('?')[0].match(/\.([a-z0-9]{2,5})$/i) || [])[1];
    var base = title.replace(/[\\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'file';
    return ext ? base + '.' + ext.toLowerCase() : base;
  }
  function downloadBtn(it) {
    var href = it.download, pdf = /\.pdf($|\?)/i.test(href);
    var a = el('a', 'btn btn--sm btn--primary');
    a.href = href;
    a.addEventListener('click', function () { if (window.track) window.track('تحميل ملف', it.title); });
    if (isLocalFile(href)) a.setAttribute('download', fileName(it.title, href));   // save to the device
    else { a.target = '_blank'; a.rel = 'noopener'; }                            // external: open the link
    a.innerHTML = I.download; a.appendChild(document.createTextNode(pdf ? 'تحميل PDF' : 'تحميل'));
    return a;
  }
  function tracked(a, name, title) { a.addEventListener('click', function () { if (window.track) window.track(name, title); }); return a; }
  function actionBtn(label, icon, primary, onClick) {
    var b = el('button', 'btn btn--sm ' + (primary ? 'btn--primary' : 'btn--soft'));
    b.type = 'button'; b.innerHTML = icon; b.appendChild(document.createTextNode(label));
    b.addEventListener('click', onClick);
    return b;
  }

  function card(it) {
    var c = el('article', 'card');
    var meta = el('div', 'card__meta');
    var t = el('span', 'badge badge--type en', TYPES[it.type].label);
    meta.appendChild(t);
    if (it.category) meta.appendChild(el('span', 'badge badge--cat', it.category));
    c.appendChild(meta);
    c.appendChild(el('h2', 'card__title', it.title));
    if (it.description) c.appendChild(el('p', 'card__desc', it.description));

    var actions = el('div', 'card__actions');
    if (it.type === 'prompt' && it.prompt) {
      actions.appendChild(actionBtn('نسخ البرومبت', I.copy, true, function () { copy(it.prompt); if (window.track) window.track('نسخ برومبت', it.title); }));
      actions.appendChild(actionBtn('عرض كامل', I.eye, false, function (e) { openViewer(it, e.currentTarget); if (window.track) window.track('عرض برومبت', it.title); }));
    }
    if (it.type === 'tool' && it.url) actions.appendChild(tracked(linkBtn(it.url, 'زيارة الموقع', I.external, true), 'زيارة أداة', it.title));
    if (it.type === 'skill') {
      if (it.download) {
        actions.appendChild(downloadBtn(it));
        // a viewable copy too (PDF/images open in the browser), useful inside Instagram/TikTok where downloads may be blocked
        if (isLocalFile(it.download) && /\.(pdf|png|jpe?g|webp|gif|txt|md)($|\?)/i.test(it.download)) actions.appendChild(tracked(linkBtn(it.download, 'عرض', I.eye, false), 'عرض ملف', it.title));
      }
      if (it.url) actions.appendChild(tracked(linkBtn(it.url, 'فتح', I.open, !it.download), 'فتح رابط', it.title));
    }
    if (it.type === 'prompt' && it.url) actions.appendChild(linkBtn(it.url, 'رابط', I.open, false));
    if (actions.children.length) c.appendChild(actions);
    return c;
  }

  function empty(title, text) {
    var d = el('div', 'empty');
    d.innerHTML = I.box;
    d.appendChild(el('strong', '', title));
    if (text) d.appendChild(el('span', '', text));
    return d;
  }

  function render() {
    var nq = norm(state.query.trim());
    var list = items.filter(function (it) {
      if (state.type !== 'all' && it.type !== state.type) return false;
      if (!nq) return true;
      return norm([it.title, it.category, it.description, it.prompt].join(' ')).indexOf(nq) !== -1;
    });
    results.innerHTML = '';
    if (!items.length) {
      results.appendChild(empty('لا توجد موارد بعد', ''));
      return;
    }
    if (!list.length) {
      results.appendChild(empty('لا توجد نتائج', nq ? 'جرّب كلمة بحث أخرى' : ''));
      return;
    }
    var frag = document.createDocumentFragment();
    list.forEach(function (it, i) {
      var c = card(it);
      c.style.animationDelay = Math.min(i, 8) * 35 + 'ms';
      frag.appendChild(c);
    });
    results.appendChild(frag);
  }

  /* ---------- tabs ---------- */
  function setType(type, push) {
    state.type = type;
    tabs.forEach(function (t) {
      var on = t.dataset.type === type;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (push) {
      var h = { prompt: '#prompts', tool: '#tools', skill: '#skills' }[type] || ' ';
      history.replaceState(null, '', h === ' ' ? location.pathname : h);
    }
    render();
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setType(t.dataset.type, true); });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t);
      var next = { ArrowLeft: i + 1, ArrowRight: i - 1, Home: 0, End: tabs.length - 1 }[e.key];  // RTL
      if (next === undefined) return;
      e.preventDefault();
      var n = tabs[(next + tabs.length) % tabs.length];
      n.focus(); setType(n.dataset.type, true);
    });
  });

  /* ---------- search ---------- */
  var timer, searchTimer;
  q.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { state.query = q.value; render(); }, 120);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { var v = q.value.trim(); if (v.length >= 2 && window.track) window.track('بحث', v.slice(0, 40)); }, 1500);
  });

  /* ---------- copy (Clipboard API, with a fallback for in-app browsers) ---------- */
  var toast = $('toast'), toastTimer;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select(); ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }
  function copy(text) {
    var done = function () { showToast('تم نسخ البرومبت ✓'); };
    var fail = function () { showToast(fallbackCopy(text) ? 'تم نسخ البرومبت ✓' : 'تعذّر النسخ — اضغط «عرض كامل» وانسخ يدوياً'); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fail);
    else fail();
  }

  /* ---------- full prompt viewer ---------- */
  var viewer = $('viewer'), current = null, opener = null;
  $('viewerCopy').innerHTML = I.copy;
  $('viewerCopy').appendChild(document.createTextNode('نسخ البرومبت'));
  function openViewer(it, from) {
    current = it; opener = from;
    $('viewerTitle').textContent = it.title;
    $('viewerText').textContent = it.prompt;
    if (typeof viewer.showModal === 'function') viewer.showModal(); else viewer.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
  function closeViewer() {
    if (typeof viewer.close === 'function') viewer.close(); else viewer.removeAttribute('open');
  }
  viewer.addEventListener('close', function () {
    document.body.style.overflow = '';
    if (opener) opener.focus();
  });
  $('viewerClose').addEventListener('click', closeViewer);
  $('viewerCopy').addEventListener('click', function () { if (current) copy(current.prompt); });
  viewer.addEventListener('click', function (e) { if (e.target === viewer) closeViewer(); });  // tap outside

  setType(state.type, false);
})();
