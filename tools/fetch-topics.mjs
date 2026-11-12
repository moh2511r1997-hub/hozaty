// Fetches Arabic Wikipedia plain-text extracts (CC BY-SA 4.0) for physics/astronomy units -> data/topics.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP = {
  "physics:motion": ["حركة (فيزياء)", "سرعة"], "physics:force": ["قوة (فيزياء)", "كتلة"], "physics:energy": ["طاقة", "شغل (فيزياء)"],
  "physics:kin": ["معادلات الحركة", "تسارع"], "physics:newton": ["قوانين نيوتن للحركة"], "physics:work": ["شغل (فيزياء)", "طاقة حركية"],
  "physics:charge": ["شحنة كهربائية", "مجال كهربائي"], "physics:circuits": ["دارة كهربائية", "قانون أوم"], "physics:mag": ["مغناطيسية", "مجال مغناطيسي"],
  "physics:wave": ["موجة"], "physics:optics": ["بصريات"], "physics:thermo": ["ديناميكا حرارية"],
  "physics:sr": ["النسبية الخاصة"], "physics:qm": ["ميكانيكا الكم"],
  "astro:sky": ["كرة سماوية", "كوكبة"], "astro:cal": ["تقويم", "فصول السنة"], "astro:obs": ["مقراب"],
  "astro:ss": ["المجموعة الشمسية"], "astro:sun": ["الشمس"], "astro:stars": ["نجم", "تطور النجوم"],
  "astro:galaxy": ["مجرة"], "astro:bh": ["ثقب أسود"], "astro:cosmo": ["الانفجار العظيم"]
};
const MAXCH = 5500; // per article, keeps the app small
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function extract(title) {
  for (let k = 0; k < 6; k++) { const r = await tryOnce(title); if (r !== "RETRY") return r; await sleep(4000 * (k + 1)); }
  throw new Error(title + " rate limited");
}
async function tryOnce(title) {
  const u = "https://ar.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&explaintext=1&exsectionformat=plain&redirects=1&format=json&titles=" + encodeURIComponent(title);
  const r = await fetch(u, { headers: { "User-Agent": "HozatyOfflineBuild/1.0 (educational app)" } });
  if (r.status === 429) return "RETRY";
  if (!r.ok) throw new Error(title + " HTTP " + r.status);
  const j = await r.json(); const p = Object.values(j.query.pages)[0];
  if (p.missing !== undefined || !p.extract) return null;
  return { title: p.title, url: p.fullurl, text: p.extract };
}
function clean(t) { return t.replace(/\n{3,}/g, "\n\n").replace(/=+ ?[^=\n]+ ?=+/g, "").replace(/[ \t]+\n/g, "\n").trim(); }
const out = {}, report = [];
for (const [uid, titles] of Object.entries(MAP)) {
  let text = "", srcs = [];
  for (const t of titles) {
    try {
      await sleep(1500);
      const a = await extract(t);
      if (!a) { report.push(uid + " MISSING " + t); continue; }
      const room = MAXCH - text.length; if (room < 800) break;
      text += (text ? "\n\n" : "") + "【" + a.title + "】\n" + clean(a.text).slice(0, room);
      srcs.push({ title: a.title, url: a.url });
    } catch (e) { report.push(uid + " ERR " + e.message); }
  }
  if (text) out[uid] = { text, sources: srcs };
}
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "data", "topics.json"), JSON.stringify(out));
console.log("units:", Object.keys(out).length, "/", Object.keys(MAP).length, "bytes:", JSON.stringify(out).length);
console.log(report.join("\n") || "no problems");
