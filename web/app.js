"use strict";
(function () {
  var APK = "https://github.com/moh2511r1997-hub/hozaty/releases/latest/download/hozaty.apk";
  var SITE = "https://moh2511r1997-hub.github.io/hozaty/";
  var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var onPages = /github\.io$/.test(location.hostname);
  var BOOKS_BASE = onPages ? "books/" : SITE + "books/";
  var D = null, root = document.getElementById("app");

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function getDone() { try { return JSON.parse(ls("hz:done") || "{}"); } catch (e) { return {}; } }
  function setDone(o) { ls("hz:done", JSON.stringify(o)); }
  function key(sid, cid, lid) { return sid + "|" + cid + "|" + lid; }
  function toast(m) { var o = document.querySelector(".toast"); if (o) o.remove(); var n = document.createElement("div"); n.className = "toast"; n.textContent = m; document.body.appendChild(n); setTimeout(function () { n.remove(); }, 3200); }
  function sub(id) { return D.subjects.filter(function (s) { return s.id === id; })[0]; }
  function bookUrl(f) { return BOOKS_BASE + f.split("/").map(encodeURIComponent).join("/"); }
  function yt(id) { return "https://www.youtube.com/watch?v=" + id; }
  function count(s, done) { var t = 0, d = 0; s.courses.forEach(function (c) { c.lessons.forEach(function (l) { t++; if (done[key(s.id, c.id, l.id)]) d++; }); }); return [d, t]; }
  var LOGO = "img/logo.png";

  /* ---------- icons ---------- */
  var P = {
    nahw: '<path d="M4 6h16M4 12h10M4 18h16"/><path d="M17 10l3 2-3 2"/>',
    sarf: '<path d="M4 8h12l-3-3M20 16H8l3 3"/><circle cx="12" cy="12" r="0.8"/>',
    mantiq: '<path d="M12 3l8 5v8l-8 5-8-5V8z"/><path d="M12 3v18M4 8l16 8M20 8L4 16"/>',
    balagha: '<path d="M7 7h4v5H7zM13 7h4v5h-4z"/><path d="M9 12c0 3-1 4-3 5M15 12c0 3-1 4-3 5"/>',
    aqaid: '<path d="M12 3a8 8 0 1 0 8 9 6 6 0 1 1-8-9z"/><path d="M17 4l.7 1.8L19.5 6l-1.8.7L17 8.5l-.7-1.8L14.5 6l1.8-.2z"/>',
    physics: '<circle cx="12" cy="12" r="1.8"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
    astro: '<circle cx="12" cy="12" r="4.5"/><path d="M2.5 15c3-3 13-9 19-6"/><path d="M21.5 9c-3 3-13 9-19 6"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    books: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    pdf: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    check: '<path d="M5 12l5 5 9-10"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + P[n] + "</svg>"; }

  /* ---------- layout ---------- */
  function shell(inner, tab) {
    var nav = [["#/", "الدروس", "home"], ["#/plan", "الجدول", "cal"], ["#/books", "الكتب", "books"], ["#/qibla", "القبلة", "compass"], ["#/about", "حول", "info"]];
    root.innerHTML = '<div class="wrap"><header class="top"><img src="' + LOGO + '" alt="شعار حوزتي"><div class="name">حوزتي</div><button class="iconbtn" id="theme" aria-label="تبديل المظهر">◐</button></header>' + inner + "</div>" +
      '<nav class="bottom" aria-label="التنقل">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + (n[0] === tab ? ' aria-current="page"' : "") + ">" + svg(n[2]) + "<span>" + n[1] + "</span></a>"; }).join("") + "</nav>";
    document.getElementById("theme").onclick = function () { var cur = document.documentElement.getAttribute("data-theme"); var dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme:dark)").matches; var nx = dark ? "light" : "dark"; document.documentElement.setAttribute("data-theme", nx); ls("hz:theme", nx); };
    window.scrollTo(0, 0);
  }

  /* ---------- pages ---------- */
  function pageHome() {
    var done = getDone(), h = '<div class="hero"><h1>دروسك اليومية</h1><p>اختر مادة، ثم اختر الدرس. كل درس يفتح شرحه على يوتيوب.</p></div>';
    var last = ls("hz:last"), cont = "";
    if (last) { var p = last.split("|"), s = sub(p[0]); if (s) cont = '<a class="btn accent" href="#/l/' + esc(last) + '" style="margin-bottom:14px">' + svg("link") + "تابع من حيث توقفت</a>"; }
    var groups = {};
    D.subjects.forEach(function (s) { (groups[s.dept] = groups[s.dept] || []).push(s); });
    h += cont;
    Object.keys(groups).forEach(function (dep) {
      h += '<div class="sec"><h2>' + esc(dep) + '</h2></div><div class="grid">' + groups[dep].map(function (s) {
        var c = count(s, done), pct = c[1] ? Math.round(c[0] * 100 / c[1]) : 0;
        return '<a class="tile" href="#/s/' + s.id + '"><img class="wm" src="' + LOGO + '" alt=""><span class="ic">' + svg(s.icon) + "</span><b>" + esc(s.name) + "</b><small>" + c[1] + " درساً</small>" +
          '<div class="bar" title="' + pct + '%"><i style="width:' + pct + '%"></i></div></a>';
      }).join("") + "</div>";
    });
    shell(h, "#/");
  }

  function pageSubject(sid) {
    var s = sub(sid); if (!s) return pageHome(); var done = getDone();
    var h = '<div class="crumb"><a href="#/">الدروس</a> › <span>' + esc(s.name) + '</span></div><div class="hero"><h1>' + esc(s.name) + '</h1><p class="muted">' + esc(s.dept) + "</p></div>";
    s.courses.forEach(function (c, ci) {
      h += '<div class="sec"><h2>' + esc(c.name) + "</h2><small>" + esc(c.note || "") + "</small></div><div class=\"lessons\">" + c.lessons.map(function (l, li) {
        var d = done[key(s.id, c.id, l.id)];
        return '<a class="les' + (d ? " done" : "") + '" href="#/l/' + s.id + "|" + c.id + "|" + l.id + '"><span class="num">' + (d ? '<img src="' + LOGO + '" alt="">' : l.n) + "</span><small>" + (d ? "تم" : "الدرس") + "</small></a>";
      }).join("") + "</div>";
    });
    if (s.books.length) h += '<div class="sec"><h2>كتب المادة</h2></div><div class="card"><div class="list">' + s.books.map(bookRow).join("") + "</div></div>";
    shell(h, "#/");
  }

  function bookRow(b) { return '<div class="item"><span class="pdf">PDF</span><div class="grow"><b>' + esc(b.title) + '</b></div><a class="btn" target="_blank" rel="noopener" href="' + bookUrl(b.file) + '">فتح</a></div>'; }

  function find(sid, cid, lid) {
    var s = sub(sid); if (!s) return null; var c = s.courses.filter(function (x) { return x.id === cid; })[0]; if (!c) return null;
    var i = -1; c.lessons.forEach(function (l, k) { if (l.id === lid) i = k; }); if (i < 0) return null; return { s: s, c: c, i: i, l: c.lessons[i] };
  }

  function pageLesson(ref) {
    var p = ref.split("|"), f = find(p[0], p[1], p[2]); if (!f) return pageHome();
    ls("hz:last", ref); var done = getDone(), k = key(f.s.id, f.c.id, f.l.id), isDone = !!done[k];
    var prev = f.c.lessons[f.i - 1], next = f.c.lessons[f.i + 1];
    var h = '<div class="crumb"><a href="#/">الدروس</a> › <a href="#/s/' + f.s.id + '">' + esc(f.s.name) + "</a> › <span>" + esc(f.c.name) + "</span></div>";
    h += '<div class="hero"><h1>' + esc(f.l.title) + '</h1><p class="muted">' + esc(f.c.name) + "</p></div>";
    h += '<a class="thumb" target="_blank" rel="noopener" href="' + yt(f.l.id) + '" aria-label="شاهد الشرح على يوتيوب"><img src="https://i.ytimg.com/vi/' + f.l.id + '/hqdefault.jpg" alt="" loading="lazy"><span class="play"><span><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span></span></a>';
    h += '<p class="muted" style="margin-top:8px">شرح الدرس: <b>' + esc(f.l.ch) + "</b></p>";
    h += '<div class="row" style="margin-block:12px"><a class="btn primary" target="_blank" rel="noopener" href="' + yt(f.l.id) + '">▶ شاهد على يوتيوب</a>' +
      (f.c.book ? '<a class="btn" target="_blank" rel="noopener" href="' + bookUrl(f.c.book) + '">' + svg("pdf") + "كتاب الدرس PDF</a>" : "") +
      '<button class="btn ' + (isDone ? "ok" : "accent") + '" id="done">' + svg("check") + (isDone ? "تم الدرس (إلغاء)" : "أتممتُ الدرس") + "</button></div>";
    if (f.l.read) {
      h += '<div class="sec"><h2>للقراءة</h2><span class="chip">ويكيبيديا العربية</span></div><div class="card"><div class="read">' + esc(f.l.read) + "</div></div>";
      h += '<div class="note">المصدر: ' + f.l.refs.map(function (r) { return '<a target="_blank" rel="noopener" href="' + esc(r.url) + '">' + esc(r.title) + "</a>"; }).join("، ") + ". النص مختصر ومرخّص CC BY-SA 4.0.</div>";
    }
    h += '<div class="row" style="margin-top:16px;justify-content:space-between">' + (prev ? '<a class="btn" href="#/l/' + f.s.id + "|" + f.c.id + "|" + prev.id + '">→ السابق</a>' : "<span></span>") + (next ? '<a class="btn" href="#/l/' + f.s.id + "|" + f.c.id + "|" + next.id + '">التالي ←</a>' : "") + "</div>";
    shell(h, "#/");
    document.getElementById("done").onclick = function () { var d = getDone(); if (d[k]) delete d[k]; else d[k] = 1; setDone(d); pageLesson(ref); toast(d[k] ? "أحسنت، أُضيف إلى المنجَز." : "أُلغي الإنجاز."); };
  }

  function pageBooks() {
    var h = '<div class="hero"><h1>الكتب</h1><p>كل كتب المنهج بصيغة PDF، بحسب المادة.</p></div>';
    D.subjects.filter(function (s) { return s.books.length; }).forEach(function (s) {
      h += '<div class="sec"><h2>' + esc(s.name) + '</h2><small>' + s.books.length + ' كتاب</small></div><div class="card"><div class="list">' + s.books.map(bookRow).join("") + "</div></div>";
    });
    h += '<div class="note">نسخ ممسوحة ضوئيًا من الأرشيف. تحقق من الطبعة المعتمدة عند أستاذك. التسمية من سجل المنهج وقد تحتاج مراجعة.</div>';
    shell(h, "#/books");
  }

  /* ---------- qibla & prayer times (location) ---------- */
  var KAABA = { lat: 21.4225, lon: 39.8262 };
  function rad(d) { return d * Math.PI / 180; } function deg(r) { return r * 180 / Math.PI; }
  function qiblaBearing(lat, lon) { var p1 = rad(lat), p2 = rad(KAABA.lat), dl = rad(KAABA.lon - lon); var y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl); return (deg(Math.atan2(y, x)) + 360) % 360; }
  function fixA(a) { a = a % 360; return a < 0 ? a + 360 : a; } function fixH(h) { h = h % 24; return h < 0 ? h + 24 : h; }
  function prayerTimes(date, lat, lon) {
    var tz = -date.getTimezoneOffset() / 60, jd = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000 + 2440587.5 - lon / 360;
    var D2 = jd - 2451545.0, g = fixA(357.529 + 0.98560028 * D2), q = fixA(280.459 + 0.98564736 * D2), L = fixA(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g))), e = 23.439 - 0.00000036 * D2;
    var RA = fixH(deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15), eqt = q / 15 - RA, decl = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), noon = 12 + tz - lon / 15 - eqt;
    function T(a) { var c = (-Math.sin(rad(a)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat))); return (c < -1 || c > 1) ? NaN : deg(Math.acos(c)) / 15; }
    return { fajr: noon - T(16), sunrise: noon - T(0.833), dhuhr: noon, sunset: noon + T(0.833), maghrib: noon + T(4), isha: noon + T(14) };
  }
  function fmt(h) { if (isNaN(h)) return "—"; h = fixH(h + 1 / 120); var H = Math.floor(h), M = Math.floor((h - H) * 60); return (H % 12 === 0 ? 12 : H % 12) + ":" + (M < 10 ? "0" : "") + M + (H >= 12 ? " م" : " ص"); }
  function geo() { try { return JSON.parse(ls("hz:geo") || "null"); } catch (e) { return null; } }
  var geoMsg = "";
  function pageQibla() {
    var g = geo(), h = '<div class="hero"><h1>القبلة وأوقات الصلاة</h1><p>تُحسب على جهازك، ولا يُرسل موقعك إلى أي جهة.</p></div>';
    if (!g) { h += '<div class="card"><p>اسمح بالوصول إلى الموقع لحساب اتجاه القبلة وأوقات الصلاة.</p><button class="btn primary" id="geo">حدّد موقعي</button>' + (geoMsg ? '<p class="muted" style="margin-top:10px">' + geoMsg + "</p>" : "") + "</div>"; shell(h, "#/qibla"); document.getElementById("geo").onclick = askGeo; return; }
    var b = qiblaBearing(g.lat, g.lon), t = prayerTimes(new Date(), g.lat, g.lon);
    var rows = [["الفجر", t.fajr], ["الشروق", t.sunrise], ["الظهر", t.dhuhr], ["الغروب", t.sunset], ["المغرب", t.maghrib], ["العشاء", t.isha]];
    h += '<div class="grid wide"><div class="card"><h3>اتجاه القبلة</h3><div class="compass"><div class="n">الشمال</div><div class="arrow" style="transform:rotate(' + b.toFixed(1) + 'deg)"><i></i></div></div><p style="text-align:center;margin:0"><b>' + b.toFixed(1) + '°</b> من الشمال مع عقارب الساعة</p><p class="muted" style="text-align:center;font-size:14px">قارنها ببوصلة هاتفك للتأكد.</p></div>' +
      '<div class="card"><div class="row" style="justify-content:space-between"><h3>أوقات الصلاة اليوم</h3><span class="chip">طريقة الجعفري</span></div><div class="list">' + rows.map(function (r) { return '<div class="item"><div class="grow">' + r[0] + '</div><b>' + fmt(r[1]) + "</b></div>"; }).join("") + '</div><p class="muted" style="font-size:14px">حساب تقريبي قد يختلف بدقائق عن التقويم المعتمد. اعتمد تقويم مرجعك احتياطًا.</p></div></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn" id="geo">حدّث موقعي</button><button class="btn" id="geoc">امسح موقعي</button></div><p class="muted" style="font-size:14px">الموقع: ' + g.lat.toFixed(3) + "، " + g.lon.toFixed(3) + "</p>";
    shell(h, "#/qibla"); document.getElementById("geo").onclick = askGeo; document.getElementById("geoc").onclick = function () { ls("hz:geo", null); pageQibla(); };
  }
  async function askGeo() {
    geoMsg = "جارٍ تحديد الموقع…"; pageQibla();
    try {
      var G = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Geolocation, pos;
      if (isNative && G) { var pm = await G.requestPermissions(); if (pm.location !== "granted" && pm.coarseLocation !== "granted") throw new Error("denied"); pos = await G.getCurrentPosition({ enableHighAccuracy: false, timeout: 20000 }); }
      else pos = await new Promise(function (ok, no) { if (!navigator.geolocation) return no(new Error("none")); navigator.geolocation.getCurrentPosition(ok, no, { timeout: 20000 }); });
      ls("hz:geo", JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude })); geoMsg = "";
    } catch (e) { geoMsg = "تعذّر تحديد الموقع. تأكد من السماح بالوصول وتشغيل GPS."; }
    pageQibla();
  }

  function pageAbout() {
    var h = '<div class="hero landing"><img src="' + LOGO + '" alt="شعار حوزتي" width="120" height="120" style="border-radius:28px;background:#fff;box-shadow:var(--shadow)"><h1>حوزتي</h1><p>منصة دروس للمقدمات الحوزوية مع الفيزياء والفلك. كل درس مربوط بشرحه على يوتيوب، وكل كتب المنهج بصيغة PDF.</p></div>';
    h += '<div class="card"><h3>مصادر الشروح</h3><p>الدروس الحوزوية: قناة <b>معهد تراث الأنبياء للدراسات الحوزوية</b> على يوتيوب. دروس الفيزياء والفلك: أساتذة وجهات علمية عرب، ويُذكر اسم المقدِّم في كل درس.</p><p class="muted" style="margin:0">التطبيق لا ينتج الشروح ولا يعدّلها، وإنما يرتّبها ويربطها. الحقوق لأصحابها.</p></div>';
    h += '<div class="card" style="margin-top:12px"><h3>نصوص القراءة</h3><p style="margin:0">نصوص الفيزياء والفلك مختصرة من ويكيبيديا العربية بترخيص CC BY-SA 4.0 ومنسوبة لمقالاتها.</p></div>';
    h += '<div class="card" style="margin-top:12px"><h3>تنبيه</h3><p style="margin:0">لا يقدّم التطبيق فتاوى. وتسمية بعض الكتب من سجل المنهج وتحتاج مراجعة أستاذ. ترتيب المنهج حسب المعهد وليس منهجًا رسميًا للنجف.</p></div>';
    if (!isNative) h += '<div class="card" style="margin-top:12px"><h3>تطبيق أندرويد</h3><p>ثبّت التطبيق على هاتفك لتصلك تذكير الثامنة صباحًا كل يوم.</p><a class="btn primary" href="' + APK + '">تحميل التطبيق (APK)</a></div>';
    h += '<div class="card" style="margin-top:12px"><h3>بياناتك</h3><p class="muted">تقدّمك محفوظ على هذا الجهاز فقط.</p><button class="btn" id="reset">امسح تقدّمي</button></div>';
    shell(h, "#/about");
    document.getElementById("reset").onclick = function () { if (confirm("سيُمسح تقدّمك في كل الدروس. متأكد؟")) { setDone({}); ls("hz:last", null); toast("تم المسح."); pageAbout(); } };
  }

  /* ---------- daily timetable: 8:00-11:00, Saturday to Wednesday (Thursday and Friday off) ---------- */
  var SLOTS = [["8:00 – 8:35", "nahw"], ["8:40 – 9:10", "sarf"], ["9:15 – 9:50", "mantiq"], ["9:55 – 10:25", "balagha"], ["10:30 – 11:00", "aqaid"]];
  var SCI_SLOTS = [["8:00 – 9:30", "physics"], ["9:40 – 11:00", "astro"]];
  var WEEK = [[6, "السبت"], [0, "الأحد"], [1, "الاثنين"], [2, "الثلاثاء"], [3, "الأربعاء"], [4, "الخميس"], [5, "الجمعة"]];
  function nextLesson(s, done) {
    for (var i = 0; i < s.courses.length; i++) { var c = s.courses[i]; for (var j = 0; j < c.lessons.length; j++) { if (!done[key(s.id, c.id, c.lessons[j].id)]) return { c: c, l: c.lessons[j] }; } }
    return null;
  }
  function pagePlan() {
    var done = getDone(), today = new Date().getDay(), sci = today === 4 || today === 5, slots = sci ? SCI_SLOTS : SLOTS;
    var h = '<div class="hero"><h1>الجدول اليومي</h1><p>من الثامنة صباحًا إلى الحادية عشرة. من السبت إلى الأربعاء للعلوم الحوزوية، والخميس والجمعة للفيزياء والفلك.</p></div>';
    h += '<div class="days">' + WEEK.map(function (d) { return '<span class="day' + (d[0] === today ? " now" : "") + (d[0] === 4 || d[0] === 5 ? " sci" : "") + '">' + d[1] + "</span>"; }).join("") + "</div>";
    {
      h += '<div class="card"><h3>درس اليوم</h3><div class="list">' + slots.map(function (sl) {
        var s = sub(sl[1]), n = nextLesson(s, done);
        return '<div class="slot"><span class="t">' + sl[0] + '</span><div class="grow"><b>' + esc(s.name) + "</b>" + (n ? '<div class="muted" style="font-size:15px">' + esc(n.l.title) + "</div>" : '<div class="muted">أتممتَ كل دروسها</div>') + "</div>" +
          (n ? '<a class="btn primary" href="#/l/' + s.id + "|" + n.c.id + "|" + n.l.id + '">ابدأ</a>' : "") + "</div>";
      }).join("") + "</div></div>";
    }
    h += '<div class="note">الدرس التالي لكل مادة هو أول درس لم تُتمّه. إن غبتَ لا يتقدم المؤشر، فتبدأ بالدرس الفائت. في الخميس والجمعة تُدرس الفيزياء ثم الفلك بالتتابع.</div>';
    shell(h, "#/plan");
  }

  /* ---------- router ---------- */
  function route() {
    var h = location.hash || "#/", m;
    if ((m = h.match(/^#\/s\/(.+)$/))) return pageSubject(decodeURIComponent(m[1]));
    if ((m = h.match(/^#\/l\/(.+)$/))) return pageLesson(decodeURIComponent(m[1]));
    if (h === "#/plan") return pagePlan();
    if (h === "#/books") return pageBooks();
    if (h === "#/qibla") return pageQibla();
    if (h === "#/about") return pageAbout();
    pageHome();
  }

  /* ---------- daily reminder (Android) ---------- */
  async function schedule() {
    var LN = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; if (!isNative || !LN) return;
    try {
      var p = await LN.requestPermissions(); if (p.display !== "granted") return;
      var days = [7, 1, 2, 3, 4, 5, 6]; /* every day: Sat..Wed hawza, Thu+Fri physics and astronomy */
      await LN.cancel({ notifications: days.map(function (d) { return { id: 800 + d }; }) });
      await LN.schedule({ notifications: days.map(function (d) { return { id: 800 + d, title: "حوزتي", body: "حان موعد درس اليوم. افتح التطبيق وتابع من حيث توقفت.", schedule: { on: { weekday: d, hour: 8, minute: 0 }, allowWhileIdle: true } }; }) });
    } catch (e) {}
  }

  /* ---------- start ---------- */
  var th = ls("hz:theme"); if (th) document.documentElement.setAttribute("data-theme", th);
  fetch("data.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; route(); window.addEventListener("hashchange", route);
    setTimeout(function () { var s = document.getElementById("splash"); if (s) { s.classList.add("off"); setTimeout(function () { s.remove(); }, 500); } }, 700);
    setTimeout(schedule, 1500);
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !isNative) navigator.serviceWorker.register("sw.js").catch(function () {});
  }).catch(function () { root.innerHTML = '<div class="wrap"><div class="card" style="margin-top:30px">تعذّر تحميل البيانات. تحقق من الاتصال ثم أعد المحاولة.</div></div>'; var s = document.getElementById("splash"); if (s) s.remove(); });
})();
