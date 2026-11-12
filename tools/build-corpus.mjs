// Fetches archive.org metadata + OCR text of the books in books-spec.mjs, then builds:
//   data/archive-meta.json  (ids, pdf file names/sizes)            -> used by make-data.mjs
//   web/corpus/<subject>.json (cleaned passages for the in-app discussion)  -> used by the chat
// Raw OCR text is cached in data/raw/ (not committed).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SPEC } from "./books-spec.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(root, "data", "raw"), OUT = path.join(root, "web", "corpus");
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "HozatyBooksBuild/1.0 (educational app)" };
async function getJSON(u) { for (let k = 0; k < 4; k++) { try { const r = await fetch(u, { headers: UA }); if (r.ok) return r.json(); } catch (e) {} await sleep(2500 * (k + 1)); } return null; }
async function getText(u, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 200) return fs.readFileSync(file, "utf8");
  for (let k = 0; k < 4; k++) { try { const r = await fetch(u, { headers: UA }); if (r.ok) { const t = await r.text(); fs.writeFileSync(file, t); return t; } } catch (e) {} await sleep(3000 * (k + 1)); }
  return null;
}
const AR = /[ء-غف-ي]/g;
function clean(page) {
  return page.split("\n").map((l) => l.replace(/[ً-ٰٟ]/g, (m) => m).replace(/\s+/g, " ").trim()).filter((l) => {
    if (l.length < 12) return false;
    const letters = (l.match(AR) || []).length, nonsp = l.replace(/\s/g, "").length;
    return nonsp > 0 && letters / nonsp >= 0.7;
  });
}
function passages(text) {
  const pages = text.split("\f"), out = [];
  pages.forEach((pg, pi) => {
    const lines = clean(pg); let buf = "";
    const flush = () => { const t = buf.trim(); buf = ""; if (t.split(" ").length < 14) return; const w = t.split(" "); const one = w.filter((x) => x.length === 1).length / w.length; if (one > 0.22) return; out.push([pi + 1, t]); };
    for (const l of lines) { buf += (buf ? " " : "") + l; if (buf.length > 650) flush(); }
    flush();
  });
  return out;
}
const meta = {}; let total = 0;
for (const [sid, list] of Object.entries(SPEC)) {
  const books = [], chunks = [];
  for (const e of list) {
    const m = await getJSON("https://archive.org/metadata/" + e.id); await sleep(900);
    if (!m || !m.files) { console.log("NO META", e.id); continue; }
    const pdfs = m.files.filter((f) => /\.pdf$/i.test(f.name) && f.source === "original");
    const pdfList = (pdfs.length ? pdfs : m.files.filter((f) => /\.pdf$/i.test(f.name))).map((f) => ({ name: f.name, mb: Math.round(f.size / 1e5) / 10 }));
    meta[e.id] = { title: e.title, pdfs: pdfList.slice(0, 6) };
    if (!e.corpus) continue;
    const txts = m.files.filter((f) => /\.txt$/i.test(f.name) && /djvu/i.test(f.name)).slice(0, 3);
    let bi = books.length; books.push({ id: e.id, title: e.title }); let n = 0;
    for (const t of txts) {
      const file = path.join(RAW, (e.id + "__" + t.name).replace(/[^\w.؀-ۿ-]/g, "_"));
      const txt = await getText("https://archive.org/download/" + e.id + "/" + encodeURIComponent(t.name), file); await sleep(900);
      if (!txt) { console.log("NO TEXT", e.id, t.name); continue; }
      for (const [p, s] of passages(txt)) { chunks.push([bi, p, s]); n++; }
    }
    console.log(sid, e.id, "passages:", n);
  }
  fs.writeFileSync(path.join(OUT, sid + ".json"), JSON.stringify({ books, chunks }));
  total += chunks.length; console.log("==", sid, "books:", books.length, "passages:", chunks.length);
}
fs.writeFileSync(path.join(root, "data", "archive-meta.json"), JSON.stringify(meta));
console.log("total passages:", total);
