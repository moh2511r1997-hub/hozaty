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
    if (D.audio && D.audio.courses.some(function (c) { return c[0] === s.id; })) h += '<a class="btn accent" style="margin-block:10px" href="#/audio/' + s.id + '">🎧 صوتيات أساتذة الحوزة لهذه المادة</a>';
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
    var h = '<div class="hero"><h1>الكتب</h1><p>كتب المنهج بصيغة PDF بحسب المادة.</p></div>' + tabsBooksAudio("books");
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

  /* ---------- audio: howza.net lessons (streamed from the site) ---------- */
  var AU = { sid: null, open: null, cur: null };
  function audioUrl(c, i) { return "https://howza.net/Sounds/" + c[3].split("/").map(encodeURIComponent).join("/") + "/" + String(i).padStart(3, "0") + ".mp3"; }
  function catUrl(p) { return "https://howza.net/archives/category/" + p.split("/").map(encodeURIComponent).join("/"); }
  function subName(id) { var s = sub(id); return s ? s.name : id; }
  function tabsBooksAudio(active) { return '<div class="seg" style="margin-bottom:12px"><a class="segl" href="#/books" aria-selected="' + (active === "books") + '">الكتب</a><a class="segl" href="#/audio" aria-selected="' + (active === "audio") + '">الصوتيات</a></div>'; }
  function playLesson(ci, i) {
    var c = D.audio.courses[ci], au = document.getElementById("au"); if (!au) return;
    AU.cur = [ci, i]; au.src = audioUrl(c, i); au.playbackRate = parseFloat(ls("hz:rate") || "1"); au.play().catch(function () {});
    document.getElementById("aut").textContent = c[2] + " — الملف " + i + " من " + c[4];
    [].forEach.call(document.querySelectorAll(".fb"), function (b) { b.classList.toggle("on", b.getAttribute("data-c") == ci && b.getAttribute("data-i") == i); });
  }
  function pageAudio(sid) {
    AU.sid = sid || null; var A = D.audio, list = A.courses.map(function (c, i) { return [c, i]; }).filter(function (x) { return !AU.sid || x[0][0] === AU.sid; });
    var h = '<div class="hero"><h1>الصوتيات</h1><p>دروس صوتية لأساتذة الحوزة العلمية من «' + esc(A.credit) + '». تُبثّ من موقعهم وتحتاج إنترنتًا.</p></div>' + tabsBooksAudio("audio");
    h += '<div class="card aucard"><div id="aut" class="muted">اختر درسًا للتشغيل</div><audio id="au" controls preload="none" style="width:100%;margin-top:8px"></audio><div class="row" style="margin-top:8px"><button class="btn" id="aprev">→ السابق</button><button class="btn" id="anext">التالي ←</button><label class="row small" style="gap:6px">السرعة <select id="arate"><option>0.75</option><option>1</option><option>1.25</option><option>1.5</option><option>2</option></select></label></div></div>';
    h += '<div class="chips" style="margin-top:12px"><button class="cp" data-s="" aria-pressed="' + (!AU.sid) + '">الكل</button>' + [].concat(["nahw", "sarf", "mantiq", "balagha", "aqaid", "fiqh0", "fiqh", "usul", "falsafa"]).filter(function (s) { return A.courses.some(function (c) { return c[0] === s; }); }).map(function (s) { return '<button class="cp" data-s="' + s + '" aria-pressed="' + (AU.sid === s) + '">' + esc(subName(s)) + "</button>"; }).join("") + "</div>";
    h += list.map(function (x) {
      var c = x[0], ci = x[1], isOpen = AU.open === ci, nums = "";
      if (isOpen) { for (var i = 1; i <= c[4]; i++) nums += '<button class="fb" data-c="' + ci + '" data-i="' + i + '">' + i + "</button>"; }
      return '<div class="card cc"><div class="row" style="justify-content:space-between"><h3>' + esc(c[2]) + '</h3><span class="chip">' + c[4] + ' ملفًا</span></div><p class="muted small" style="margin:4px 0 8px">' + esc(subName(c[0])) + '</p><div class="row"><button class="btn primary" data-open="' + ci + '">' + (isOpen ? "إخفاء الملفات" : "🎧 اختر الملف") + '</button><a class="btn" target="_blank" rel="noopener" href="https://howza.net/archives/' + c[1] + '">صفحة الدورة</a></div>' + (isOpen ? '<div class="files">' + nums + "</div>" : "") + "</div>";
    }).join("");
    h += '<div class="sec"><h2>كل كتب الموقع</h2><small>' + A.cats.length + ' كتابًا</small></div><div class="card"><div class="list">' + A.cats.map(function (k) { return '<div class="item"><div class="grow"><b>' + esc(k[0]) + '</b><div class="muted small">' + k[1] + ' دورة</div></div><a class="btn" target="_blank" rel="noopener" href="' + catUrl(k[2]) + '">افتح</a></div>'; }).join("") + "</div></div>";
    h += '<div class="note">الأصوات لأصحابها وللموقع، والتطبيق يفتحها منه مباشرة ولا يعدّلها. إن توقف ملف فتخطّاه التطبيق إلى التالي.</div>';
    shell(h, "#/books");
    var au = document.getElementById("au"), rate = document.getElementById("arate"); rate.value = ls("hz:rate") || "1";
    rate.onchange = function () { ls("hz:rate", rate.value); au.playbackRate = parseFloat(rate.value); };
    function step(d) { if (!AU.cur) return; var c = D.audio.courses[AU.cur[0]], n = AU.cur[1] + d; if (n >= 1 && n <= c[4]) playLesson(AU.cur[0], n); }
    document.getElementById("aprev").onclick = function () { step(-1); }; document.getElementById("anext").onclick = function () { step(1); };
    au.onended = function () { step(1); }; au.onerror = function () { if (AU.cur) { toast("تعذّر هذا الملف، ننتقل إلى التالي."); step(1); } };
    [].forEach.call(document.querySelectorAll("[data-open]"), function (b) { b.onclick = function () { var v = parseInt(b.getAttribute("data-open"), 10); AU.open = AU.open === v ? null : v; pageAudio(AU.sid); }; });
    [].forEach.call(document.querySelectorAll(".fb"), function (b) { b.onclick = function () { playLesson(parseInt(b.getAttribute("data-c"), 10), parseInt(b.getAttribute("data-i"), 10)); }; });
    [].forEach.call(document.querySelectorAll(".cp[data-s]"), function (b) { b.onclick = function () { AU.open = null; pageAudio(b.getAttribute("data-s") || null); }; });
  }

  /* ---------- editable timetable ---------- */
  var DEFPLAN = { start: "08:00", end: "11:00", gap: 5, days: [6, 0, 1, 2, 3], subs: ["nahw", "sarf", "mantiq", "balagha", "aqaid"] };
  function getPlan() { var p = null; try { p = JSON.parse(ls("hz:plan") || "null"); } catch (e) {} if (!p || !p.start || !p.end) return JSON.parse(JSON.stringify(DEFPLAN)); p.gap = isFinite(p.gap) ? p.gap : 5; p.days = p.days || DEFPLAN.days; p.subs = (p.subs && p.subs.length) ? p.subs : DEFPLAN.subs; return p; }
  function mins(t) { var m = /^(\d{1,2}):(\d\d)$/.exec(t); return m ? (+m[1]) * 60 + (+m[2]) : 0; }
  function fmtT(m) { var h = Math.floor(m / 60) % 24, mm = m % 60; return h + ":" + (mm < 10 ? "0" : "") + mm; }
  function slotsFor(p) {
    var a = mins(p.start), b = mins(p.end), n = p.subs.length; if (b <= a || !n) return [];
    var each = Math.floor(((b - a) - p.gap * (n - 1)) / n); if (each < 5) return [];
    var t = a; return p.subs.map(function (sid) { var s = fmtT(t) + " – " + fmtT(t + each); t += each + p.gap; return [s, sid]; });
  }
  var DAYN = [[6, "السبت"], [0, "الأحد"], [1, "الاثنين"], [2, "الثلاثاء"], [3, "الأربعاء"], [4, "الخميس"], [5, "الجمعة"]];
  var PLANSUBS = ["nahw", "sarf", "mantiq", "balagha", "aqaid", "fiqh0", "fiqh", "usul", "falsafa", "hadith"];
  function nextLesson(s, done) {
    for (var i = 0; i < s.courses.length; i++) { var c = s.courses[i]; for (var j = 0; j < c.lessons.length; j++) { if (!done[key(s.id, c.id, c.lessons[j].id)]) return { c: c, l: c.lessons[j] }; } }
    return null;
  }
  function pagePlan() {
    var p = getPlan(), done = getDone(), today = new Date().getDay(), off = p.days.indexOf(today) < 0, slots = slotsFor(p);
    var h = '<div class="hero"><h1>الجدول اليومي</h1><p>من ' + esc(fmtT(mins(p.start))) + ' إلى ' + esc(fmtT(mins(p.end))) + '، وتقدر تعدّله ليلائم وقتك.</p></div>';
    h += '<div class="days">' + DAYN.map(function (d) { return '<span class="day' + (d[0] === today ? " now" : "") + (p.days.indexOf(d[0]) < 0 ? " off" : "") + '">' + d[1] + "</span>"; }).join("") + "</div>";
    if (off) h += '<div class="card"><h3>اليوم خارج جدولك</h3><p style="margin:0">استرح، أو تصفّح الدروس من قسم الدروس.</p></div>';
    else if (!slots.length) h += '<div class="card"><h3>الوقت لا يكفي</h3><p style="margin:0">قلّل عدد المواد أو وسّع الوقت في «تعديل الأوقات» أدناه.</p></div>';
    else h += '<div class="card"><h3>درس اليوم</h3><div class="list">' + slots.map(function (sl) {
      var s = sub(sl[1]); if (!s) return "";
      var n = nextLesson(s, done);
      return '<div class="slot"><span class="t">' + sl[0] + '</span><div class="grow"><b>' + esc(s.name) + "</b>" + (n ? '<div class="muted" style="font-size:15px">' + esc(n.c.name) + " · " + esc(n.l.title) + "</div>" : '<div class="muted">افتح المادة لتصفّح دوراتها</div>') + "</div>" +
        (n ? '<a class="btn primary" href="#/l/' + s.id + "|" + n.c.id + "|" + n.l.id + '">ابدأ</a>' : '<a class="btn" href="#/s/' + s.id + '">افتح</a>') + "</div>";
    }).join("") + "</div></div>";
    h += '<div class="card" style="margin-top:12px"><h3>تعديل الأوقات</h3><div class="grid g2f"><label class="field">البداية<input id="pst" type="time" value="' + esc(p.start) + '"></label><label class="field">النهاية<input id="pen" type="time" value="' + esc(p.end) + '"></label><label class="field">الاستراحة بين المواد (دقائق)<input id="pgp" type="number" min="0" max="30" value="' + p.gap + '"></label></div>' +
      '<p class="muted small" style="margin:12px 0 6px">أيام الدراسة</p><div class="chips wrap2">' + DAYN.map(function (d) { return '<button class="cp" data-day="' + d[0] + '" aria-pressed="' + (p.days.indexOf(d[0]) >= 0) + '">' + d[1] + "</button>"; }).join("") + "</div>" +
      '<p class="muted small" style="margin:12px 0 6px">المواد (بالترتيب الذي تختاره)</p><div class="chips wrap2">' + PLANSUBS.filter(sub).map(function (sid) { var k = p.subs.indexOf(sid); return '<button class="cp" data-psub="' + sid + '" aria-pressed="' + (k >= 0) + '">' + (k >= 0 ? (k + 1) + ". " : "") + esc(sub(sid).name) + "</button>"; }).join("") + "</div>" +
      '<div class="row" style="margin-top:14px"><button class="btn primary" id="psave">حفظ</button><button class="btn" id="preset">إعادة الضبط</button></div><p class="muted small" style="margin:8px 0 0">يُضبط تذكير الإشعار على وقت البداية وعلى الأيام التي تختارها.</p></div>';
    h += '<div class="note">الدرس التالي لكل مادة هو أول درس لم تُتمّه. إن غبتَ لا يتقدم المؤشر، فتبدأ بالدرس الفائت.</div>';
    shell(h, "#/plan");
    var draft = JSON.parse(JSON.stringify(p));
    function readInputs() { draft.start = document.getElementById("pst").value || draft.start; draft.end = document.getElementById("pen").value || draft.end; draft.gap = Math.max(0, Math.min(30, parseInt(document.getElementById("pgp").value, 10) || 0)); }
    [].forEach.call(document.querySelectorAll("[data-day]"), function (b) { b.onclick = function () { readInputs(); var d = parseInt(b.getAttribute("data-day"), 10), k = draft.days.indexOf(d); if (k >= 0) draft.days.splice(k, 1); else draft.days.push(d); ls("hz:plan", JSON.stringify(draft)); pagePlan(); }; });
    [].forEach.call(document.querySelectorAll("[data-psub]"), function (b) { b.onclick = function () { readInputs(); var s = b.getAttribute("data-psub"), k = draft.subs.indexOf(s); if (k >= 0) { if (draft.subs.length > 1) draft.subs.splice(k, 1); } else draft.subs.push(s); ls("hz:plan", JSON.stringify(draft)); pagePlan(); }; });
    document.getElementById("psave").onclick = function () { readInputs(); if (mins(draft.end) <= mins(draft.start)) { toast("وقت النهاية يجب أن يكون بعد البداية."); return; } ls("hz:plan", JSON.stringify(draft)); schedule(); toast("حُفظ جدولك."); pagePlan(); };
    document.getElementById("preset").onclick = function () { ls("hz:plan", null); schedule(); toast("أُعيد الجدول الافتراضي."); pagePlan(); };
  }

  /* ---------- router ---------- */
  function route() {
    if (!D) return;
    var h = location.hash || "#/", m;
    if ((m = h.match(/^#\/s\/(.+)$/))) return pageSubject(decodeURIComponent(m[1]));
    if ((m = h.match(/^#\/l\/(.+)$/))) return pageLesson(decodeURIComponent(m[1]));
    if ((m = h.match(/^#\/audio(?:\/(.+))?$/))) return pageAudio(m[1] ? decodeURIComponent(m[1]) : null);
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
      var pl = getPlan(), t = mins(pl.start);
      await LN.cancel({ notifications: [1, 2, 3, 4, 5, 6, 7].map(function (d) { return { id: 800 + d }; }) });
      await LN.schedule({ notifications: pl.days.map(function (d) { return { id: 800 + d + 1, title: "حوزتي", body: "حان موعد درس اليوم. افتح التطبيق وتابع من حيث توقفت.", schedule: { on: { weekday: d + 1, hour: Math.floor(t / 60), minute: t % 60 }, allowWhileIdle: true } }; }) });
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
