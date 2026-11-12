// Builds www/index.html (standalone, no Claude runtime) from the saved v5 page + tools/shim.js.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let h = fs.readFileSync(path.join(root, "app", "hozaty-app-v5.html"), "utf8");
const shim = fs.readFileSync(path.join(root, "tools", "shim.js"), "utf8");

function rep(from, to) {
  if (!h.includes(from)) throw new Error("patch target not found: " + from.slice(0, 60));
  h = h.split(from).join(to);
}

// unwrap the artifact wrapper's single-page skeleton: keep as is, only patch content.
rep('<div class="proto">', '<div class="proto" hidden>');
rep("الاتصال بحسابك في Claude قائم (حفظ سحابي خاص بك).", "الحفظ على هذا الجهاز.");
rep("الحفظ محلي على هذا الجهاز فقط (الصفحة لا ترى حسابك).", "الحفظ محلي على هذا الجهاز فقط.");
rep("الدخول يتم بحسابك في Claude تلقائياً. لا كلمة مرور منفصلة.", "التطبيق شخصي: بياناتك محفوظة على هذا الجهاز ولا حاجة لحساب.");
rep('chip(cloud ? "متصل بحساب Claude" : "غير متصل", cloud ? "ok" : "warn")', 'chip("حفظ محلي", "ok")');
rep("الصفحة لا ترى حسابك الآن، فيُحفظ تقدّمك على هذا الجهاز فقط. افتح حوزتي من رابطها داخل تطبيق Claude أو claude.ai وأنت مسجّل الدخول.", "يُحفظ تقدّمك على هذا الجهاز فقط. صدّر نسخة احتياطية من الإعدادات بين وقت وآخر.");
rep("المواصفة طلبت Supabase Auth. بالمسار الحالي (بلا كلفة) يحلّ حساب Claude محلها، وتبقى الخصوصية بمجلد خاص لكل مستخدم بدل RLS.", "التطبيق مستقل: لا خادم ولا حسابات. الذكاء الاصطناعي عبر مفتاح OpenRouter الخاص بك (زر ⚙).");
rep("لم تسمح للصفحة باستخدام Claude. اسمح بذلك ثم أعد المحاولة.", "المفتاح غير صالح. أدخل مفتاح OpenRouter من جديد (زر ⚙).");
rep("Claude غير متاح لحسابك حالياً.", "الأستاذ الذكي غير متاح حالياً.");
rep("رفض Claude هذا الطلب.", "رفض النموذج هذا الطلب.");
rep('no_claude: "الأستاذ الذكي غير متصل. افتح حوزتي من رابطها داخل حسابك في Claude."',
    'no_claude: "الأستاذ الذكي غير متصل. أدخل مفتاح OpenRouter من زر ⚙.", no_key: "لم تُدخل مفتاح OpenRouter بعد (زر ⚙ أعلى الشاشة).", no_credit: "رصيد OpenRouter غير كافٍ. اختر نموذجًا مجانيًا (:free) من زر ⚙."');
rep("افتح حوزتي من رابطها داخل حسابك في Claude لتستعين به.", "أدخل مفتاح OpenRouter من زر ⚙ لتستعين به.");
rep(" (أول مرة سيطلب Claude إذنك)", "");
rep('app: "hozati"', 'app: "hozaty"');

// inject shim before the main app script (the first plain <script> after the booktext JSON)
const marker = "</script>\n<script>";
const i = h.indexOf(marker, h.indexOf('id="booktext"'));
if (i < 0) throw new Error("main script marker not found");
h = h.slice(0, i) + "</script>\n<script>\n" + shim + "\n</script>\n<script>" + h.slice(i + marker.length);

// strip claude-specific viewport meta line is harmless; add Capacitor-friendly meta
fs.mkdirSync(path.join(root, "www"), { recursive: true });
fs.writeFileSync(path.join(root, "www", "index.html"), h);
console.log("wrote www/index.html", (h.length / 1e6).toFixed(2) + " MB");
