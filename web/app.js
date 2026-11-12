"use strict";
(function () {
  var APK = "https://github.com/moh2511r1997-hub/hozaty/releases/latest/download/hozaty.apk";
  var SITE = "https://moh2511r1997-hub.github.io/hozaty/";
  var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var onPages = /github\.io$/.test(location.hostname);
  var BOOKS_BASE = onPages ? "books/" : SITE + "books/";
  var D = null, root = document.getElementById("app");
  var LOGO = "img/logo.png";

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
  function plUrl(id) { return "https://www.youtube.com/playlist?list=" + id; }
  function archive(q) { return "https://archive.org/search?query=" + encodeURIComponent(q); }
  function bookTitle(file) { var t = ""; D.subjects.forEach(function (s) { s.books.forEach(function (b) { if (b.file === file) t = b.title; }); }); return t; }

  /* ---------- city (Najaf / Qom) ---------- */
  function city() { return ls("hz:city") === "qom" ? "qom" : "najaf"; }
  function okCity(x) { return !x.city || x.city === city(); }
  function visibleCourses(s) { return s.courses.filter(okCity); }
  function count(s, done) { var t = 0, d = 0; visibleCourses(s).forEach(function (c) { c.lessons.forEach(function (l) { t++; if (done[key(s.id, c.id, l.id)]) d++; }); }); return [d, t]; }

  /* ---------- themes: day themes for light mode, night themes for dark mode ---------- */
  var THEMES = {
    light: [["royal", "الأزرق الملكي", "#102D55", "#08B8C5"], ["emerald", "الزمرد", "#0F5C46", "#1FB58A"], ["sand", "الرمل", "#6B4420", "#C98A1B"]],
    dark: [["night-blue", "ليل أزرق", "#0B1A30", "#08B8C5"], ["night-green", "ليل زمردي", "#07211B", "#2ED3A0"], ["night-violet", "ليل بنفسجي", "#15122B", "#A78BFA"]]
  };
  var DEF = { light: "royal", dark: "night-blue" };
  function mode() { var m = ls("hz:mode"); if (m === "light" || m === "dark") return m; return matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"; }
  function applyTheme() {
    var m = mode(), t = ls("hz:th-" + m); if (!THEMES[m].some(function (x) { return x[0] === t; })) t = DEF[m];
    var h = document.documentElement; h.setAttribute("data-mode", m); h.setAttribute("data-theme", t);
    var mc = document.querySelector('meta[name="theme-color"]'); if (mc) mc.setAttribute("content", getComputedStyle(h).getPropertyValue("--bg").trim() || "#102D55");
  }

  /* ---------- icons ---------- */
  var P = {
    nahw: '<path d="M4 6h16M4 12h10M4 18h16"/><path d="M17 10l3 2-3 2"/>',
    sarf: '<path d="M4 8h12l-3-3M20 16H8l3 3"/><circle cx="12" cy="12" r="0.8"/>',
    mantiq: '<path d="M12 3l8 5v8l-8 5-8-5V8z"/><path d="M12 3v18M4 8l16 8M20 8L4 16"/>',
    balagha: '<path d="M7 7h4v5H7zM13 7h4v5h-4z"/><path d="M9 12c0 3-1 4-3 5M15 12c0 3-1 4-3 5"/>',
    aqaid: '<path d="M12 3a8 8 0 1 0 8 9 6 6 0 1 1-8-9z"/><path d="M17 4l.7 1.8L19.5 6l-1.8.7L17 8.5l-.7-1.8L14.5 6l1.8-.2z"/>',
    fiqh: '<path d="M12 3v18M5 7h14"/><path d="M5 7l-2 6a3 3 0 0 0 4 0zM19 7l-2 6a3 3 0 0 0 4 0z"/><path d="M8 21h8"/>',
    usul: '<path d="M4 20V6a2 2 0 0 1 2-2h12v14H6a2 2 0 0 0-2 2z"/><path d="M9 8h6M9 12h6"/>',
    kharij: '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    books: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    pdf: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + P[n] + "</svg>"; }

  /* ---------- layout ---------- */
  function shell(inner, tab) {
    var nav = [["#/", "الدروس", "home"], ["#/chat", "المباحثة", "chat"], ["#/plan", "الجدول", "cal"], ["#/books", "الكتب", "books"], ["#/about", "حول", "info"]];
    root.innerHTML = '<div class="wrap"><header class="top"><img src="' + LOGO + '" alt="شعار حوزتي"><div class="name">حوزتي</div><button class="iconbtn" id="modebtn" aria-label="تبديل الوضع النهاري والليلي">' + svg(mode() === "dark" ? "sun" : "moon") + "</button></header>" + inner + "</div>" +
      '<nav class="bottom" aria-label="التنقل">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + (n[0] === tab ? ' aria-current="page"' : "") + ">" + svg(n[2]) + "<span>" + n[1] + "</span></a>"; }).join("") + "</nav>";
    document.getElementById("modebtn").onclick = function () { ls("hz:mode", mode() === "dark" ? "light" : "dark"); applyTheme(); route(); };
    window.scrollTo(0, 0);
  }

  /* ---------- pages ---------- */
  function pageHome() {
    var done = getDone(), name = ls("hz:name") || "";
    var h = '<div class="hero"><h1>السلام عليكم' + (name ? " يا " + esc(name) : "") + '</h1><p>اختر مرحلتك ومادتك. كل درس يفتح شرحه على يوتيوب، وكل مادة مربوطة بكتابها.</p></div>';
    h += '<div class="seg" role="tablist" aria-label="الحوزة"><button role="tab" data-city="najaf" aria-selected="' + (city() === "najaf") + '">حوزة النجف</button><button role="tab" data-city="qom" aria-selected="' + (city() === "qom") + '">حوزة قم</button></div>';
    var last = ls("hz:last");
    if (last) { var p = last.split("|"); if (sub(p[0])) h += '<a class="btn accent" href="#/l/' + esc(last) + '" style="margin-bottom:14px">' + svg("link") + "تابع من حيث توقفت</a>"; }
    var ORDER = ["المقدمات", "السطوح", "بحث الخارج"], groups = {};
    D.subjects.forEach(function (s) { if (visibleCourses(s).length) (groups[s.dept] = groups[s.dept] || []).push(s); });
    ORDER.filter(function (d) { return groups[d]; }).forEach(function (dep) {
      h += '<div class="sec"><h2>' + esc(dep) + '</h2><small>' + groups[dep].length + ' مواد</small></div><div class="grid">' + groups[dep].map(function (s) {
        var c = count(s, done), pc = visibleCourses(s).filter(function (x) { return x.playlist; }).length, pct = c[1] ? Math.round(c[0] * 100 / c[1]) : 0;
        var sm = (c[1] ? c[1] + " درساً" : "") + (c[1] && pc ? " · " : "") + (pc ? pc + " دورة" : "");
        return '<a class="tile" href="#/s/' + s.id + '"><img class="wm" src="' + LOGO + '" alt=""><span class="ic">' + svg(s.icon) + "</span><b>" + esc(s.name) + "</b><small>" + sm + "</small>" +
          (c[1] ? '<div class="bar" title="' + pct + '%"><i style="width:' + pct + '%"></i></div>' : "") + "</a>";
      }).join("") + "</div>";
    });
    shell(h, "#/");
    [].forEach.call(document.querySelectorAll(".seg button"), function (b) { b.onclick = function () { ls("hz:city", b.getAttribute("data-city")); pageHome(); }; });
  }

  function courseCard(c) {
    var chips = '<span class="chip">' + c.count + " فيديو</span>" + (c.city === "qom" ? ' <span class="chip alt">منهج قم</span>' : "");
    var bk = c.book ? '<a class="btn" target="_blank" rel="noopener" href="' + bookUrl(c.book) + '">' + svg("pdf") + "الكتاب PDF</a>" : c.bookUrl ? '<a class="btn" target="_blank" rel="noopener" href="' + esc(c.bookUrl) + '">' + svg("pdf") + "الكتاب (أرشيف الإنترنت)</a>" : (c.q ? '<a class="btn" target="_blank" rel="noopener" href="' + archive(c.q) + '">' + svg("pdf") + "ابحث عن الكتاب</a>" : "");
    return '<div class="card cc"><div class="row" style="justify-content:space-between"><h3>' + esc(c.name) + "</h3><span>" + chips + '</span></div><p class="muted" style="margin:6px 0 10px">' + esc(c.ch) + (c.note ? " · " + esc(c.note) : "") + '</p><div class="row"><a class="btn primary" target="_blank" rel="noopener" href="' + plUrl(c.playlist) + '">▶ شرح الدروس على يوتيوب</a>' + bk + "</div></div>";
  }

  function pageSubject(sid) {
    var s = sub(sid); if (!s) return pageHome(); var done = getDone();
    var h = '<div class="crumb"><a href="#/">الدروس</a> › <span>' + esc(s.name) + '</span></div><div class="hero"><h1>' + esc(s.name) + '</h1><p class="muted">' + esc(s.dept) + " · " + (city() === "qom" ? "حوزة قم" : "حوزة النجف") + "</p></div>";
    visibleCourses(s).forEach(function (c) {
      if (c.playlist && !c.lessons.length) { h += courseCard(c); return; }
      h += '<div class="sec"><h2>' + esc(c.name) + "</h2><small>" + esc(c.note || "") + '</small></div>' +
        (c.book ? '<div class="row" style="margin-bottom:10px"><a class="btn" target="_blank" rel="noopener" href="' + bookUrl(c.book) + '">' + svg("pdf") + "كتاب الدورة PDF: " + esc(bookTitle(c.book)) + "</a></div>" : "") +
        '<div class="lessons">' + c.lessons.map(function (l) {
          var d = done[key(s.id, c.id, l.id)];
          return '<a class="les' + (d ? " done" : "") + '" href="#/l/' + s.id + "|" + c.id + "|" + l.id + '"><span class="num">' + (d ? '<img src="' + LOGO + '" alt="">' : l.n) + "</span><small>" + (d ? "تم" : "الدرس") + "</small></a>";
        }).join("") + "</div>";
    });
    if (s.books.length) h += '<div class="sec"><h2>كتب المادة</h2></div><div class="card"><div class="list">' + s.books.map(bookRow).join("") + "</div></div>";
    shell(h, "#/");
  }

  function bookRow(b) { var ext = !!b.url; return '<div class="item"><span class="pdf"' + (ext ? ' style="background:var(--navy);color:var(--on-navy)"' : '') + '>PDF</span><div class="grow"><b>' + esc(b.title) + '</b>' + (ext ? '<div class="muted small">أرشيف الإنترنت' + (b.mb ? ' · ' + b.mb + ' م.ب' : '') + '</div>' : '') + '</div><a class="btn" target="_blank" rel="noopener" href="' + (ext ? esc(b.url) : bookUrl(b.file)) + '">' + (ext ? 'تحميل / قراءة' : 'فتح') + '</a></div>'; }

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
    h += '<div class="row" style="margin-top:16px;justify-content:space-between">' + (prev ? '<a class="btn" href="#/l/' + f.s.id + "|" + f.c.id + "|" + prev.id + '">→ السابق</a>' : "<span></span>") + (next ? '<a class="btn" href="#/l/' + f.s.id + "|" + f.c.id + "|" + next.id + '">التالي ←</a>' : "") + "</div>";
    shell(h, "#/");
    document.getElementById("done").onclick = function () { var d = getDone(); if (d[k]) delete d[k]; else d[k] = 1; setDone(d); pageLesson(ref); toast(d[k] ? "أحسنت، أُضيف إلى المنجَز." : "أُلغي الإنجاز."); };
  }

  function pageBooks() {
    var h = '<div class="hero"><h1>الكتب</h1><p>كتب المنهج بصيغة PDF بحسب المادة.</p></div>';
    D.subjects.filter(function (s) { return s.books.length; }).forEach(function (s) {
      h += '<div class="sec"><h2>' + esc(s.name) + '</h2><small>' + s.books.length + ' كتاب</small></div><div class="card"><div class="list">' + s.books.map(bookRow).join("") + "</div></div>";
    });
    h += '<div class="note">كتب مستضافة هنا (PDF) وأخرى من أرشيف الإنترنت العام (كثير منها رُفع من مكتبة مؤمن قريش). نسخ ممسوحة ضوئيًا، فتحقق من الطبعة المعتمدة عند أستاذك.</div>';
    shell(h, "#/books");
  }

  function pageAbout() {
    var m = mode(), cur = document.documentElement.getAttribute("data-theme");
    var h = '<div class="hero landing"><img src="img/logo-wide.png" alt="شعار حوزتي" width="320" style="max-width:80%;height:auto"><h1>حوزتي</h1><p>دروس المقدمات والسطوح وبحث الخارج لحوزتي النجف وقم. كل درس مربوط بشرحه على يوتيوب، وكتب المنهج بصيغة PDF.</p></div>';
    h += '<div class="card"><h3>المظهر</h3><div class="row" style="margin:8px 0"><button class="btn' + (m === "light" ? " primary" : "") + '" data-mode="light">' + svg("sun") + 'الوضع النهاري</button><button class="btn' + (m === "dark" ? " primary" : "") + '" data-mode="dark">' + svg("moon") + 'الوضع الليلي</button></div>' +
      '<p class="muted" style="margin:10px 0 6px">' + (m === "light" ? "ثيمات النهار" : "ثيمات الليل") + '</p><div class="swatches">' + THEMES[m].map(function (t) {
        return '<button class="sw" data-th="' + t[0] + '" aria-pressed="' + (cur === t[0]) + '"><i style="background:linear-gradient(135deg,' + t[2] + " 50%," + t[3] + ' 50%)"></i><span>' + t[1] + "</span></button>";
      }).join("") + "</div></div>";
    h += '<div class="card" style="margin-top:12px"><h3>اسم طالب العلم</h3><div class="row"><input id="nm" type="text" maxlength="40" value="' + esc(ls("hz:name") || "") + '" placeholder="اكتب اسمك"><button class="btn primary" id="svn">حفظ</button></div></div>';
    h += '<div class="card" style="margin-top:12px"><h3>مصادر الشروح</h3><p>المقدمات: قناة <b>معهد تراث الأنبياء للدراسات الحوزوية</b>. السطوح وبحث الخارج: قوائم دروس لأساتذة ومراجع يُذكر اسم كل منهم. التطبيق لا ينتج الشروح ولا يعدّلها، وإنما يرتّبها ويربطها، والحقوق لأصحابها.</p><p class="muted" style="margin:0">ترتيب المراحل المعروض شائع ومقرّب بين النجف وقم، وتختلف المدارس في تفاصيله، فراجع أستاذك. لا يقدّم التطبيق فتاوى.</p></div>';
    if (!isNative) h += '<div class="card" style="margin-top:12px"><h3>تطبيق أندرويد</h3><p>ثبّت التطبيق ليصلك تذكير الثامنة صباحًا من السبت إلى الأربعاء.</p><a class="btn primary" href="' + APK + '">تحميل التطبيق (APK)</a></div>';
    h += '<div class="card" style="margin-top:12px"><h3>بياناتك</h3><p class="muted">تقدّمك محفوظ على هذا الجهاز فقط، ولا حاجة لتسجيل دخول.</p><button class="btn" id="reset">امسح تقدّمي</button></div>';
    shell(h, "#/about");
    [].forEach.call(document.querySelectorAll("button[data-mode]"), function (b) { b.onclick = function () { ls("hz:mode", b.getAttribute("data-mode")); applyTheme(); pageAbout(); }; });
    [].forEach.call(document.querySelectorAll("button[data-th]"), function (b) { b.onclick = function () { ls("hz:th-" + mode(), b.getAttribute("data-th")); applyTheme(); pageAbout(); }; });
    document.getElementById("svn").onclick = function () { var v = document.getElementById("nm").value.trim(); if (v) { ls("hz:name", v); toast("حُفظ الاسم."); } };
    document.getElementById("reset").onclick = function () { if (confirm("سيُمسح تقدّمك في كل الدروس. متأكد؟")) { setDone({}); ls("hz:last", null); toast("تم المسح."); pageAbout(); } };
  }

  /* ---------- daily timetable: 8:00-11:00, Saturday to Wednesday (Thursday and Friday off) ---------- */
  var SLOTS = [["8:00 – 8:35", "nahw"], ["8:40 – 9:10", "sarf"], ["9:15 – 9:50", "mantiq"], ["9:55 – 10:25", "balagha"], ["10:30 – 11:00", "aqaid"]];
  var WEEK = [[6, "السبت"], [0, "الأحد"], [1, "الاثنين"], [2, "الثلاثاء"], [3, "الأربعاء"], [4, "الخميس"], [5, "الجمعة"]];
  function nextLesson(s, done) {
    for (var i = 0; i < s.courses.length; i++) { var c = s.courses[i]; for (var j = 0; j < c.lessons.length; j++) { if (!done[key(s.id, c.id, c.lessons[j].id)]) return { c: c, l: c.lessons[j] }; } }
    return null;
  }
  function pagePlan() {
    var done = getDone(), today = new Date().getDay(), off = today === 4 || today === 5;
    var h = '<div class="hero"><h1>الجدول اليومي</h1><p>من الثامنة صباحًا إلى الحادية عشرة، من السبت إلى الأربعاء. الخميس والجمعة عطلة.</p></div>';
    h += '<div class="days">' + WEEK.map(function (d) { return '<span class="day' + (d[0] === today ? " now" : "") + (d[0] === 4 || d[0] === 5 ? " off" : "") + '">' + d[1] + "</span>"; }).join("") + "</div>";
    if (off) h += '<div class="card"><h3>اليوم عطلة</h3><p style="margin:0">استرح، ويمكنك مراجعة ما مضى أو تصفّح السطوح وبحث الخارج من قسم الدروس.</p></div>';
    else h += '<div class="card"><h3>درس اليوم</h3><div class="list">' + SLOTS.map(function (sl) {
      var s = sub(sl[1]), n = nextLesson(s, done);
      return '<div class="slot"><span class="t">' + sl[0] + '</span><div class="grow"><b>' + esc(s.name) + "</b>" + (n ? '<div class="muted" style="font-size:15px">' + esc(n.c.name) + " · " + esc(n.l.title) + "</div>" : '<div class="muted">أتممتَ كل دروسها</div>') + "</div>" +
        (n ? '<a class="btn primary" href="#/l/' + s.id + "|" + n.c.id + "|" + n.l.id + '">ابدأ</a>' : "") + "</div>";
    }).join("") + "</div></div>";
    h += '<div class="note">الدرس التالي لكل مادة هو أول درس لم تُتمّه. إن غبتَ لا يتقدم المؤشر، فتبدأ بالدرس الفائت.</div>';
    shell(h, "#/plan");
  }

  /* ---------- internal discussion (retrieval from the attached books only, no AI, no network) ---------- */
  var CH = { sid: null, mode: "ask", idx: {}, msgs: [], current: null, loading: false };
  var STOP = {};
  "من في على الى عن ما هو هي هذا هذه ذلك التي الذي ان كان لا لم لن قد كل اي او ثم بين مع هل كيف لماذا ماذا متي اين اذا حتي بعد قبل عند منه فيه عليه له لها لهم وهو وهي وما ولا وان انه انها كما بل لكن ايضا غير ذلك".split(" ").forEach(function (w) { STOP[w] = 1; });
  function normAr(s) { return String(s).replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^ء-ي0-9]+/g, " ").trim(); }
  function stem(w) {
    w = w.replace(/^(وال|بال|كال|فال|لل|ال)/, ""); if (w.length > 4) w = w.replace(/^(و|ف)/, "");
    if (w.length > 4) w = w.replace(/(ها|هم|ات|ون|ين|ان)$/, ""); if (w.length > 3) w = w.replace(/(ه|ي)$/, "");
    return w;
  }
  function toks(s) { return normAr(s).split(" ").filter(function (w) { return w.length > 1 && !STOP[w]; }).map(stem).filter(function (w) { return w.length > 1; }); }

  function buildIndex(data) {
    var inv = {}, len = [], tot = 0;
    data.chunks.forEach(function (c, i) {
      var t = toks(c[2]), tf = {}; t.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
      len[i] = t.length; tot += t.length;
      Object.keys(tf).forEach(function (w) { (inv[w] = inv[w] || []).push([i, tf[w]]); });
    });
    return { data: data, inv: inv, len: len, avg: tot / Math.max(1, data.chunks.length), N: data.chunks.length };
  }
  function idf(ix, w) { var n = (ix.inv[w] || []).length; return Math.log(1 + (ix.N - n + 0.5) / (n + 0.5)); }
  function search(ix, q, k) {
    var qt = toks(q), sc = {}; if (!qt.length) return [];
    var seenT = {}; qt.forEach(function (w) {
      if (seenT[w]) return; seenT[w] = 1; var post = ix.inv[w]; if (!post) return; var id = idf(ix, w);
      post.forEach(function (p) { var i = p[0], tf = p[1], d = 1.2 * (0.25 + 0.75 * ix.len[i] / ix.avg); sc[i] = (sc[i] || 0) + id * (tf * 2.2) / (tf + d); });
    });
    var arr = Object.keys(sc).map(function (i) { return [+i, sc[i]]; }).sort(function (a, b) { return b[1] - a[1]; });
    var out = [], perBook = {};
    for (var j = 0; j < arr.length && out.length < k; j++) { var c = ix.data.chunks[arr[j][0]], b = c[0]; if ((perBook[b] || 0) >= 2) continue; perBook[b] = (perBook[b] || 0) + 1; out.push({ i: arr[j][0], score: arr[j][1] }); }
    return out;
  }
  function highlight(text, qt) {
    var set = {}; qt.forEach(function (w) { set[w] = 1; });
    return esc(text).replace(/[ء-يً-ٰٟـ]+/g, function (word) { var st = stem(normAr(word)); return set[st] ? "<mark>" + word + "</mark>" : word; });
  }
  function loadCorpus(sid) {
    if (CH.idx[sid]) return Promise.resolve(CH.idx[sid]);
    return fetch("corpus/" + sid + ".json").then(function (r) { return r.json(); }).then(function (d) { CH.idx[sid] = buildIndex(d); return CH.idx[sid]; });
  }
  var CSUBJ = [["nahw", "النحو"], ["sarf", "الصرف"], ["mantiq", "المنطق"], ["balagha", "البلاغة"], ["aqaid", "العقائد"], ["fiqh0", "الفقه"], ["fiqh", "الفقه الاستدلالي"], ["usul", "الأصول"], ["falsafa", "الفلسفة"], ["hadith", "الحديث"]];

  function passageHtml(ix, p, qt) {
    var c = ix.data.chunks[p.i], b = ix.data.books[c[0]];
    return '<div class="quote"><div class="qt">' + highlight(c[2], qt) + '</div><div class="qsrc">' + esc(b.title) + " · ص " + c[1] + " (تقريبية)</div></div>";
  }
  function addMsg(who, html) { CH.msgs.push({ who: who, html: html }); }
  function renderChat() {
    var box = document.getElementById("chatbox"); if (!box) return;
    box.innerHTML = CH.msgs.map(function (m) { return '<div class="msg ' + m.who + '">' + m.html + "</div>"; }).join("");
    box.scrollTop = box.scrollHeight;
  }
  function clean(ix, text) { var t = toks(text); if (t.length < 12) return 0; var ok = t.filter(function (w) { return (ix.inv[w] || []).length >= 4; }).length; return ok / t.length; }
  function pickDiscuss(ix) {
    var best = null, bs = -1;
    for (var t = 0; t < 120; t++) { var c = ix.data.chunks[Math.floor(Math.random() * ix.N)]; var n = c[2].length; if (n < 320 || n > 760 || /d{3,}/.test(c[2])) continue; var s = clean(ix, c[2]); if (s > bs) { bs = s; best = c; } if (s >= 0.9) break; }
    return best || ix.data.chunks[Math.floor(Math.random() * ix.N)];
  }
  function keyTerms(ix, text) {
    var seen = {}, arr = []; toks(text).forEach(function (w) { var df = (ix.inv[w] || []).length; if (!seen[w] && w.length > 2 && df >= 4 && df < ix.N * 0.04) { seen[w] = 1; arr.push([w, idf(ix, w)]); } });
    return arr.sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8).map(function (x) { return x[0]; });
  }
  function startDiscuss() {
    var ix = CH.idx[CH.sid]; if (!ix) return; var c = pickDiscuss(ix), b = ix.data.books[c[0]];
    CH.current = { text: c[2], terms: keyTerms(ix, c[2]) };
    addMsg("bot", "لنتباحث في هذا النص من «" + esc(b.title) + "». اقرأه ثم اكتب بأسلوبك: ما الفكرة التي يقررها؟ وما الألفاظ المهمة فيه؟<div class=\"quote\"><div class=\"qt\">" + esc(c[2]) + "</div><div class=\"qsrc\">" + esc(b.title) + " · ص " + c[1] + " (تقريبية)</div></div>");
  }
  function evalAnswer(text) {
    var cur = CH.current, mine = {}; toks(text).forEach(function (w) { mine[w] = 1; });
    var hit = cur.terms.filter(function (w) { return mine[w]; }), miss = cur.terms.filter(function (w) { return !mine[w]; });
    var pct = Math.round(hit.length * 100 / cur.terms.length), verdict = pct >= 70 ? "أحسنت، غطّيتَ أغلب مفاتيح النص." : pct >= 40 ? "جيد، لكن بقيت نقاط مهمة." : "راجع النص ثم أعد الكتابة، فقد فاتتك مفاتيح كثيرة.";
    var html = "<b>" + verdict + "</b><br>تقدير تقريبي بالكلمات المفتاحية: " + hit.length + " من " + cur.terms.length + " (" + pct + "%).";
    if (hit.length) html += '<div class="muted small">وردت عندك: ' + esc(hit.join("، ")) + "</div>";
    if (miss.length) html += '<div class="muted small">لم ترد: ' + esc(miss.join("، ")) + "</div>";
    html += '<div class="row" style="margin-top:8px"><button class="btn primary" id="nextd">نص آخر</button><button class="btn" id="toask">إلى وضع السؤال</button></div><div class="muted small" style="margin-top:6px">هذا مقياس آلي بسيط للكلمات، وليس تقييمًا علميًا. اعرض إجابتك على أستاذك.</div>';
    return html;
  }
  function answerAsk(q) {
    var ix = CH.idx[CH.sid], qt = toks(q), res = search(ix, q, 3);
    if (!res.length || res[0].score < 1.2) { addMsg("bot", "لم أجد في الكتب المرفقة لهذه المادة ما يجيب عن سؤالك. جرّب كلمات أخرى أو مادة أخرى."); return; }
    addMsg("bot", "وجدتُ هذه المقاطع في الكتب المرفقة (نقلٌ حرفي من نص مستخرج آليًا، فقد تظهر فيه أخطاء):" + res.map(function (p) { return passageHtml(ix, p, qt); }).join(""));
  }
  function pageChat() {
    var sid = CH.sid || "nahw";
    var h = '<div class="hero"><h1>المباحثة</h1><p>ناقش الكتب المرفقة: اسأل فتأتيك مقاطع منها، أو اطلب أن نتباحث في نص ويُقاس فهمك.</p></div>';
    h += '<div class="chips">' + CSUBJ.map(function (s) { return '<button class="cp" data-sid="' + s[0] + '" aria-pressed="' + (s[0] === sid) + '">' + s[1] + "</button>"; }).join("") + "</div>";
    h += '<div class="seg" style="margin-top:10px"><button data-m="ask" aria-selected="' + (CH.mode === "ask") + '">اسأل الكتب</button><button data-m="discuss" aria-selected="' + (CH.mode === "discuss") + '">باحثني في نص</button></div>';
    h += '<div id="chatbox" class="chatbox" aria-live="polite"></div>';
    h += '<form class="chatform" id="chatform"><input id="chatin" type="text" autocomplete="off" placeholder="' + (CH.mode === "ask" ? "اكتب سؤالك من الكتاب…" : "اكتب شرحك للنص…") + '"><button class="btn primary" type="submit" id="chatsend">إرسال</button></form>';
    h += '<div class="note">المحتوى كله مقتطف حرفيًا من الكتب المرفقة (' + CSUBJ.length + ' مواد)، بلا توليد ولا اتصال بأي خدمة ذكاء. النص مستخرج آليًا من مسوحات وقد يحوي أخطاء.</div>';
    shell(h, "#/chat");
    [].forEach.call(document.querySelectorAll(".cp"), function (b) { b.onclick = function () { CH.sid = b.getAttribute("data-sid"); CH.msgs = []; CH.current = null; pageChat(); }; });
    [].forEach.call(document.querySelectorAll(".seg [data-m]"), function (b) { b.onclick = function () { CH.mode = b.getAttribute("data-m"); CH.msgs = []; CH.current = null; pageChat(); }; });
    var ready = function () {
      if (!CH.msgs.length) { addMsg("bot", CH.mode === "ask" ? "السلام عليكم. اسألني عن أي مسألة في كتب «" + esc((CSUBJ.filter(function (s) { return s[0] === sid; })[0] || [0, ""])[1]) + "» وأنقل لك ما ورد فيها." : "سأعرض عليك نصًا من الكتب، اشرحه لي بأسلوبك ثم أقيس أهم مفاتيحه."); if (CH.mode === "discuss") startDiscuss(); }
      renderChat(); bindChat();
    };
    CH.sid = sid;
    if (CH.idx[sid]) ready(); else { addMsg("bot", "جارٍ تحميل كتب المادة…"); renderChat(); loadCorpus(sid).then(function () { CH.msgs = []; ready(); }).catch(function () { CH.msgs = []; addMsg("bot", "تعذّر تحميل كتب هذه المادة. تحقق من الاتصال."); renderChat(); }); }
  }
  function bindChat() {
    var f = document.getElementById("chatform"); if (!f) return;
    f.onsubmit = function (e) {
      e.preventDefault(); var inp = document.getElementById("chatin"), v = inp.value.trim(); if (!v || !CH.idx[CH.sid]) return; inp.value = "";
      addMsg("me", esc(v));
      if (CH.mode === "ask") answerAsk(v);
      else if (CH.current) { addMsg("bot", evalAnswer(v)); renderChat(); var nx = document.getElementById("nextd"), ta = document.getElementById("toask"); if (nx) nx.onclick = function () { CH.current = null; startDiscuss(); renderChat(); }; if (ta) ta.onclick = function () { CH.mode = "ask"; CH.msgs = []; pageChat(); }; return; }
      renderChat();
    };
  }

  /* ---------- router ---------- */
  function route() {
    if (!D) return;
    var h = location.hash || "#/", m;
    if ((m = h.match(/^#\/s\/(.+)$/))) return pageSubject(decodeURIComponent(m[1]));
    if ((m = h.match(/^#\/l\/(.+)$/))) return pageLesson(decodeURIComponent(m[1]));
    if (h === "#/chat") return pageChat();
    if (h === "#/plan") return pagePlan();
    if (h === "#/books") return pageBooks();
    if (h === "#/about") return pageAbout();
    pageHome();
  }

  /* ---------- daily reminder (Android), Saturday to Wednesday ---------- */
  async function schedule() {
    var LN = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; if (!isNative || !LN) return;
    try {
      var p = await LN.requestPermissions(); if (p.display !== "granted") return;
      var days = [7, 1, 2, 3, 4]; /* Sat, Sun, Mon, Tue, Wed */
      await LN.cancel({ notifications: [1, 2, 3, 4, 5, 6, 7].map(function (d) { return { id: 800 + d }; }) });
      await LN.schedule({ notifications: days.map(function (d) { return { id: 800 + d, title: "حوزتي", body: "حان موعد درس اليوم. افتح التطبيق وتابع من حيث توقفت.", schedule: { on: { weekday: d, hour: 8, minute: 0 }, allowWhileIdle: true } }; }) });
    } catch (e) {}
  }

  /* ---------- start: Basmala (3 s) -> student name -> content ---------- */
  function showName(done) {
    var el = document.getElementById("welcome"); if (!el) return done();
    var saved = ls("hz:name") || "";
    if (saved) { el.remove(); return done(); }
    el.innerHTML = '<div class="wbox"><img src="img/logo-wide.png" alt="حوزتي" class="wlogo"><h1>أهلاً بطالب العلم</h1><p class="muted">اكتب اسمك لنبدأ. لا حاجة لتسجيل دخول.</p><input id="stn" type="text" maxlength="40" autocomplete="off" placeholder="اسم طالب العلم" value="' + esc(saved) + '"><button class="btn primary" id="go" style="width:100%;margin-top:12px">' + (saved ? "ادخل" : "ابدأ") + "</button></div>";
    el.classList.add("on");
    var inp = document.getElementById("stn"), go = document.getElementById("go");
    function sync() { go.disabled = !inp.value.trim(); } sync(); inp.oninput = sync;
    function enter() { var v = inp.value.trim(); if (!v) return; ls("hz:name", v); el.classList.remove("on"); setTimeout(function () { el.remove(); }, 400); done(); }
    go.onclick = enter; inp.onkeydown = function (e) { if (e.key === "Enter") enter(); };
    setTimeout(function () { inp.focus(); }, 300);
  }

  applyTheme();
  var dataP = fetch("data.json").then(function (r) { return r.json(); });
  var basmalaP = new Promise(function (res) { setTimeout(res, 3000); });
  Promise.all([dataP, basmalaP]).then(function (r) {
    D = r[0];
    var s = document.getElementById("splash"); if (s) { s.classList.add("off"); setTimeout(function () { s.remove(); }, 500); }
    showName(function () { route(); window.addEventListener("hashchange", route); setTimeout(schedule, 1500); });
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !isNative) navigator.serviceWorker.register("sw.js").catch(function () {});
  }).catch(function () { var s = document.getElementById("splash"); if (s) s.remove(); root.innerHTML = '<div class="wrap"><div class="card" style="margin-top:30px">تعذّر تحميل البيانات. تحقق من الاتصال ثم أعد المحاولة.</div></div>'; });
})();
