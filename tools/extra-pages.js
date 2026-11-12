  /* ---------- extra pages: location (qibla + prayer times) and verified sources ---------- */
  var KAABA = { lat: 21.4225, lon: 39.8262 };
  function rad(d) { return d * Math.PI / 180; } function deg(r) { return r * 180 / Math.PI; }
  function qiblaBearing(lat, lon) {
    var p1 = rad(lat), p2 = rad(KAABA.lat), dl = rad(KAABA.lon - lon);
    var y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return (deg(Math.atan2(y, x)) + 360) % 360;
  }
  function fixA(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function fixH(h) { h = h % 24; return h < 0 ? h + 24 : h; }
  /* Ja'fari method (Fajr 16 deg, Maghrib 4 deg, Isha 14 deg), computed on-device; approximate. */
  function prayerTimes(date, lat, lon) {
    var tz = -date.getTimezoneOffset() / 60;
    var jd = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000 + 2440587.5 - lon / (15 * 24);
    var D = jd - 2451545.0, g = fixA(357.529 + 0.98560028 * D), q = fixA(280.459 + 0.98564736 * D);
    var L = fixA(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)));
    var e = 23.439 - 0.00000036 * D;
    var RA = fixH(deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15);
    var eqt = q / 15 - RA, decl = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L))));
    var noon = 12 + tz - lon / 15 - eqt;
    function T(angle) {
      var c = (-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat)));
      if (c < -1 || c > 1) return NaN; return deg(Math.acos(c)) / 15;
    }
    return { fajr: noon - T(16), sunrise: noon - T(0.833), dhuhr: noon, sunset: noon + T(0.833), maghrib: noon + T(4), isha: noon + T(14) };
  }
  function fmtH(h) {
    if (isNaN(h)) return "—"; h = fixH(h + 1 / 120); var H = Math.floor(h), M = Math.floor((h - H) * 60);
    var ap = H >= 12 ? "م" : "ص", h12 = H % 12 === 0 ? 12 : H % 12; return h12 + ":" + (M < 10 ? "0" : "") + M + " " + ap;
  }
  window.__hzPrayer = { qiblaBearing: qiblaBearing, prayerTimes: prayerTimes };

  function loadGeo() { try { return JSON.parse(localStorage.getItem("hz:geo") || "null"); } catch (e) { return null; } }
  PAGES.qibla = function () {
    var geo = loadGeo(), h = head("القبلة وأوقات الصلاة", "تُحسب على جهازك من موقعك، ولا يُرسل موقعك إلى أي جهة.");
    if (!geo) {
      return h + '<div class="card"><p>لم تحدّد موقعك بعد. اسمح للتطبيق بالوصول إلى الموقع لحساب اتجاه القبلة وأوقات الصلاة.</p><button class="btn primary" data-act="geo">حدّد موقعي</button>' + (S.geoMsg ? '<p class="small muted" style="margin-top:10px">' + S.geoMsg + '</p>' : '') + '</div>';
    }
    var b = qiblaBearing(geo.lat, geo.lon), t = prayerTimes(new Date(), geo.lat, geo.lon);
    var rows = [["الفجر", t.fajr], ["الشروق", t.sunrise], ["الظهر", t.dhuhr], ["الغروب", t.sunset], ["المغرب", t.maghrib], ["العشاء", t.isha]];
    return h + '<div class="grid g2"><div class="card"><h3>اتجاه القبلة</h3>' +
      '<div style="display:grid;place-items:center;padding:12px"><div style="position:relative;width:180px;height:180px;border-radius:50%;border:2px solid var(--line);display:grid;place-items:center"><span style="position:absolute;top:4px;font-size:13px;color:var(--ink-soft)">الشمال</span>' +
      '<div style="width:6px;height:140px;position:relative;transform:rotate(' + b.toFixed(1) + 'deg)"><div style="position:absolute;top:0;left:-7px;border-inline:10px solid transparent;border-bottom:26px solid var(--turq)"></div><div style="position:absolute;top:24px;bottom:50%;left:0;width:6px;background:var(--turq);border-radius:3px"></div></div></div></div>' +
      '<p style="text-align:center;margin:0"><b>' + b.toFixed(1) + '°</b> من الشمال باتجاه عقارب الساعة</p><p class="small muted" style="text-align:center">للتأكد قارنه ببوصلة هاتفك.</p></div>' +
      '<div class="card"><div class="row between"><h3>أوقات الصلاة اليوم</h3>' + chip("طريقة الجعفري", "turq") + '</div><div class="list">' +
      rows.map(function (r) { return '<div class="item"><div class="grow">' + r[0] + '</div><b class="time">' + fmtH(r[1]) + '</b></div>'; }).join("") +
      '</div><p class="small muted" style="margin-top:8px">حساب تقريبي، قد يختلف بدقائق عن التقويم المعتمد. اعتمد تقويم مرجعك عند الاحتياط.</p></div></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn" data-act="geo">حدّث موقعي</button><button class="btn quiet" data-act="geoClear">امسح موقعي</button></div>' +
      '<p class="small muted" style="margin-top:8px">الموقع: ' + geo.lat.toFixed(3) + ", " + geo.lon.toFixed(3) + '</p>';
  };
  var EXTRA_ACTS = {};
  EXTRA_ACTS.geo = async function () {
    S.geoMsg = "جارٍ تحديد الموقع…"; render();
    try {
      var C = window.Capacitor, G = C && C.Plugins && C.Plugins.Geolocation, pos;
      if (C && C.isNativePlatform && C.isNativePlatform() && G) {
        var p = await G.requestPermissions(); if (p.location !== "granted" && p.coarseLocation !== "granted") throw new Error("denied");
        pos = await G.getCurrentPosition({ enableHighAccuracy: false, timeout: 20000 });
      } else {
        pos = await new Promise(function (ok, no) { if (!navigator.geolocation) return no(new Error("none")); navigator.geolocation.getCurrentPosition(ok, no, { timeout: 20000 }); });
      }
      localStorage.setItem("hz:geo", JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude, t: Date.now() }));
      S.geoMsg = ""; toast("تم تحديد الموقع.");
    } catch (e) { S.geoMsg = "تعذّر تحديد الموقع. تأكد من السماح بالوصول للموقع وتشغيل GPS."; }
    render();
  };
  EXTRA_ACTS.geoClear = function () { try { localStorage.removeItem("hz:geo"); } catch (e) {} render(); };

  var SOURCES = [
    ["قناة معهد تراث الأنبياء للدراسات الحوزوية", "https://www.youtube.com/@Turath-Alanbiaa", "كل القنوات والقوائم"],
    ["قواعد اللغة العربية (المرحلة التمهيدية)", "https://www.youtube.com/playlist?list=PLKxikzZNxA6GxfUbJqamu1814e8K2yD8T", "النحو والصرف"],
    ["عقائد الشيعة الإمامية (المرحلة التمهيدية)", "https://www.youtube.com/playlist?list=PLKxikzZNxA6GCIWhI_sT5dtfX0frzk8Lp", "العقائد"],
    ["شرح عقائد الإمامية (المقدمات الأولى)، الشيخ ورد الحلبي", "https://www.youtube.com/playlist?list=PLKxikzZNxA6FBo9tPJfKZgYS518yX2qc2", "العقائد"]
  ];
  PAGES.sources = function () {
    return head("المصادر والصوتيات", "قوائم دروس صوتية ومرئية تحقّقتُ من وجودها بفتحها. تُفتح خارج التطبيق.") +
      '<div class="card"><div class="list">' + SOURCES.map(function (s) {
        return '<div class="item"><div class="grow"><b>' + s[0] + '</b><div class="small muted">' + s[2] + '</div></div><a class="btn" target="_blank" rel="noopener" href="' + s[1] + '">افتح</a></div>';
      }).join("") + '</div></div>' +
      '<p class="small muted" style="margin-top:10px">لا توجد بعد مصادر صوتية موثّقة للفيزياء والفلك، فهي تُدرَّس بالشرح العام للأستاذ الذكي. هذا الترتيب من مؤسسة واحدة وليس منهجًا رسميًا للنجف.</p>';
  };
