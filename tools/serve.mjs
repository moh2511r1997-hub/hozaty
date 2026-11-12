// Tiny static server to test www/ in a browser: node tools/serve.mjs  ->  http://localhost:5173
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const www = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "www");
http.createServer((req, res) => {
  const p = path.join(www, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(www) || !fs.existsSync(p)) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "Content-Type": p.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(5173, () => console.log("http://localhost:5173"));
