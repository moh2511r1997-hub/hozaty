/* Hozaty standalone shim: replaces window.claude (sample/downloads) with OpenRouter + local storage + Android notifications.
   db/user are intentionally absent so the app falls back to local storage on the device. */
(function () {
  var KEY = "hz:or_key", MODEL = "hz:or_model", DEFMODEL = "openrouter/auto";
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function err(code, extra) { var e = new Error(code); e.code = code; if (extra) e.detail = extra; return e; }

  /* ---- settings dialog (API key + model) ---- */
  var dialogP = null;
  function dialog(force) {
    if (dialogP) return dialogP;
    dialogP = new Promise(function (resolve, reject) {
      var ov = document.createElement("div"); ov.className = "overlay"; ov.dir = "rtl";
      var sh = document.createElement("div"); sh.className = "sheet";
      function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
      sh.appendChild(el("h3", "", "إعداد الأستاذ الذكي"));
      sh.appendChild(el("p", "small muted", "ألصق مفتاح OpenRouter الخاص بك. يُحفظ على هذا الجهاز فقط ولا يُرسل إلا إلى openrouter.ai."));
      var k = el("input"); k.type = "password"; k.placeholder = "sk-or-..."; k.value = ls(KEY) || ""; k.setAttribute("dir", "ltr"); sh.appendChild(k);
      var lab = el("label", "field", "النموذج (المجانية تنتهي بـ :free)"); var sel = el("select"); lab.appendChild(sel); sh.appendChild(lab);
      var cur = ls(MODEL) || DEFMODEL;
      function addOpt(v, t) { var o = el("option", "", t || v); o.value = v; if (v === cur) o.selected = true; sel.appendChild(o); }
      addOpt("openrouter/auto", "تلقائي (قد يستهلك رصيداً)");
      if (cur && cur !== DEFMODEL) addOpt(cur);
      fetch("https://openrouter.ai/api/v1/models").then(function (r) { return r.json(); }).then(function (j) {
        var free = (j.data || []).filter(function (m) { return /:free$/.test(m.id); }).map(function (m) { return m.id; }).sort();
        free.forEach(function (id) { if (id !== cur) addOpt(id, id); });
      }).catch(function () {});
      var row = el("div", "row"); var ok = el("button", "btn primary", "حفظ"); var no = el("button", "btn quiet", "إلغاء");
      row.appendChild(ok); row.appendChild(no); sh.appendChild(row); ov.appendChild(sh); document.body.appendChild(ov);
      function close() { ov.remove(); dialogP = null; }
      ok.onclick = function () { var v = k.value.trim(); if (!v) { k.focus(); return; } ls(KEY, v); ls(MODEL, sel.value || DEFMODEL); close(); resolve(v); };
      no.onclick = function () { close(); reject(err("no_key")); };
    });
    return dialogP;
  }
  window.hzSettings = function () { return dialog(true).catch(function () {}); };

  /* ---- sample() via OpenRouter, streaming ---- */
  async function sample(prompt, opts) {
    opts = opts || {};
    var key = ls(KEY) || await dialog();
    var resp;
    try {
      resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", signal: opts.signal,
        headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json", "HTTP-Referer": "https://hozaty.app", "X-Title": "Hozaty" },
        body: JSON.stringify({ model: ls(MODEL) || DEFMODEL, stream: true, messages: [{ role: "user", content: prompt }] })
      });
    } catch (e) { if (e && e.name === "AbortError") throw e; throw err("upstream_error"); }
    if (resp.status === 401 || resp.status === 403) { ls(KEY, null); throw err("not_granted"); }
    if (resp.status === 402) throw err("no_credit");
    if (resp.status === 429) throw err("rate_limited");
    if (!resp.ok || !resp.body) throw err("upstream_error", resp.status);
    var reader = resp.body.getReader(), dec = new TextDecoder(), buf = "", text = "";
    for (;;) {
      var r = await reader.read(); if (r.done) break;
      buf += dec.decode(r.value, { stream: true });
      var lines = buf.split("\n"); buf = lines.pop();
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i].trim(); if (ln.indexOf("data:") !== 0) continue;
        var d = ln.slice(5).trim(); if (d === "[DONE]") continue;
        try {
          var j = JSON.parse(d);
          if (j.error) throw err(j.error.code === 429 ? "rate_limited" : "upstream_error");
          var c = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
          if (c) { text += c; if (opts.onText) opts.onText({ text: text }); }
        } catch (e) { if (e && e.code) throw e; }
      }
    }
    if (!text.trim()) throw err("empty_completion");
    return { text: text };
  }
  sample.json = async function (prompt, opts) {
    var r = await sample(prompt + "\n\nأجب بـJSON صالح فقط بلا أي شرح ولا علامات ```.", opts);
    var t = r.text.replace(/```(?:json)?/g, "").trim();
    var a = t.search(/[\[{]/); if (a < 0) throw err("invalid_json");
    var end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    try { return JSON.parse(t.slice(a, end + 1)); } catch (e) { throw err("invalid_json"); }
  };

  /* ---- downloads ---- */
  var downloads = { save: async function (o) {
    var blob = new Blob([o.data], { type: "application/json" });
    var file = new File([blob], o.filename, { type: "application/json" });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; } } catch (e) { if (e && e.name === "AbortError") throw { code: "declined" }; }
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = o.filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  } };

  window.claude = { use: async function (name) {
    if (name === "sample") return sample;
    if (name === "downloads") return downloads;
    return null; /* db, user: local storage fallback */
  } };

  /* ---- floating settings button ---- */
  window.addEventListener("DOMContentLoaded", function () {
    var b = document.createElement("button"); b.textContent = "⚙"; b.setAttribute("aria-label", "إعداد الأستاذ الذكي");
    b.style.cssText = "position:fixed;top:calc(8px + env(safe-area-inset-top,0px));left:8px;z-index:60;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:20px";
    b.onclick = function () { window.hzSettings(); }; document.body.appendChild(b);
  });

  /* ---- daily notification (Android, Sat-Thu) ---- */
  async function schedule() {
    var C = window.Capacitor; if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
    var LN = C.Plugins && C.Plugins.LocalNotifications; if (!LN) return;
    try {
      var p = await LN.requestPermissions(); if (p.display !== "granted") return;
      var hh = 8, mm = 0;
      try { var s = JSON.parse(ls("hz:d:settings") || "null"); var m = /^(\d\d):(\d\d)$/.exec(s && s.schedule && s.schedule.start); if (m) { hh = +m[1]; mm = +m[2]; } } catch (e) {}
      var days = [7, 1, 2, 3, 4, 5]; /* Sat, Sun..Thu */
      await LN.cancel({ notifications: days.map(function (d) { return { id: 800 + d }; }) });
      await LN.schedule({ notifications: days.map(function (d) { return {
        id: 800 + d, title: "حوزتي", body: "السلام عليكم سيدي ومولاي، هل أنتم مستعدون لدرس اليوم؟",
        schedule: { on: { weekday: d, hour: hh, minute: mm }, allowWhileIdle: true } }; }) });
    } catch (e) {}
  }
  window.addEventListener("load", function () { setTimeout(schedule, 1500); });
})();
