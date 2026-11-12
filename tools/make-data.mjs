// Builds web/data.json: subjects -> courses -> lessons (each lesson = one YouTube video) + books list.
// Hawza video IDs come from the public channel "معهد تراث الأنبياء للدراسات الحوزوية" (series + playlists).
// Science videos are picked from Arabic teachers/communicators (see "ch" per lesson).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SPEC } from "./books-spec.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pairs = (s) => s.split(",").map((x) => { const i = x.indexOf(":"); return { n: +x.slice(0, i), id: x.slice(i + 1) }; });
const seq = (s) => s.split(",").map((id, i) => ({ n: i + 1, id }));
const INST = "معهد تراث الأنبياء للدراسات الحوزوية";

const nahw1 = "1:Yn0f_bp6PSQ,2:_Oi9DykhPOo,3:euyMjRLDE7Y,4:Yol3LKnA7-k,5:bQ6Au_7P4sM,6:qcXG-KIfucw,7:6e4tc3pt1wQ,8:_NCtSbWTLv8,9:uA9bAv2ZRwQ,10:IxT7euLLnJw,11:bEl7pr6yFcY,13:o2qprZJViDY,14:2dJklehwlNA,15:c_j40wNlHdQ,16:dpleSo4K3rU,17:7GPUEEp1XNg,18:vR7wEHW32LA,19:jOEkBIyk0yU,20:sR7gZLrMpXk,21:6Hh7furbljg,22:Qa3W7IGii0Y,23:0fIuTb-MIos,24:4exHo7TMH84,25:Ldl37IhWO9U,26:g_kW-bZSB6E,27:O9S1QrcHk-M";
const nahw2 = "1:Es5xKOsVGcg,2:Onj29J0u8tQ,3:uXGxQQGGSx8,5:K-BNGlG8nto,6:T-dsIFrfCzQ,7:ahzSCNzpr2g,8:JiWDRqpF8lk,9:Lf9Tbuxsnxc,10:KyK2ycC_Jhc,11:OlI69cEADsQ,12:tC_7PAMNZR0,13:YKWFJXXIsK0,14:VIemWCrhsH0,15:Lht4XNW_G14,17:PcEmTtCDlmo,21:DnqjYQWHNYg,23:l4YbaOanjJY,26:wHpyZ4Jlq_A,29:nPjKJMceGGE,30:qJQ-n-d7XBE,34:yf3nIlshaXk,36:Oh4OH0RnDZA,44:JzP-x4lne78,53:FEeZ14OqI8g";
const nahwTamhidi = "hbM9-xAVtHQ,-DO7Z4ptB3M,sCRU5BEzwPQ,1GaM_M4tsPw,kkOqhFDoyOc,j4H3X8w04f0,jH549v7aBdY,DPOsDCmMntA,sfq2eEaTCl4,DFC0I1SZKWo,jlG-LIBhK_s,sqS3jO4cLck,U8R9rYnmwPc,6or1iqs6Zuw,FA8iP_7trhQ,9stKrU9hW7o,c7TLi9DbAVc,pboXJDiigBY,c8sd1pXnd70,AqaL1jDz-zg,GA50-i1v9_E,gSdS3HR4534,WKxaiED3bl4,BVlZSWZRVJQ,h0fwveCU_vQ,6iE_QeEZEAc,Q04J6mMA1ew,XvmreaVyduY,Ccy4gPad-dM,1XCOIGG8iWc,M4MDGUUJw_4,tpdqelQcDus,n3Dl9hinWYU,CIIVDHawlqs,PUmGGdHwMB4,UNFm2HoQcHU,sM8Q_Atg6y4,5XjIqpSxoeA,hb37vBCgxO4,9gRcpElvmHU,wmyDThzXuzE";
const qatr = "AZjz2V3FKNE,m7Bi-Cpojqk,QTCHfM6keks,SGpbDYcKr7E,y6Nv7kBcP2I,AoVHqTgKiEk,WJO0V-KsTbk,nRT_8_ARKeQ,G48l3zH4joo,QUg6efFuBQc,AhxLN8DJjCk,B9C3HDcgJWk,QufeNE4h2qE,6KHEGM6HG44,cJHi33_6tCI,_DrJ2Fw56ak,ZcUyLelnGEk,YFK-601Tf58,sTD1a5gTNN8,wpMb-Ws8KXY,L81M2ZWHXu0,pRsl1-twh7c,XTDDgtRrJhA,jTeyKO0oswk,729xTaZPXiM,6c96MKGaNVA,6VAseFbb88E,dPlQ11EVLA0,lUmIvSk_btY,z49k27Ll09A,PqK_2-Bn4n4,Pc78SVPfkug,-Bs5CM44Uvs,Tmp7NSWD-GM,3zp03iausiw,RqwyQPLzgS4,I0_UzIC7hSc,uICkcTZSQus,adAV193uqSw,GwRYESBDyaM,6HgfP0dlykE,bsa8F_PvvmA,5IIKIQp7PLQ,iMnNs11BrWc,iseI6f6qRD0,NvBJMx9vqXQ,ayf_H_YdNpU,Fg2dtykpHrw";
const sarf = "1:w-wET2VFirg,2:dNBI0WE3fv4,3:xMZZM6ZMPF8,4:nrOyGgewbXM,5:rKkXE96AXYc,6:DDrrIvwYAwA,7:rLDuWOkG8-o,8:Lrq6Lj_Icjg,9:9VZqmPYki0o,10:1eya0B9AqgY,11:yACrPPhwDTA,12:d0GcPnYOXWs,13:RaYMPQ5Ug_0,14:GCVIbjEVR1E,15:e5OBaNkD-qg,19:2RNKp7ctYe8,20:_IzcIOI1kAY,21:oW9JHxzbybo,22:iV-2sRjS6aM,23:Hres8Xe3Mgo,24:0zRJkFGR9m4,25:do16k7zqtz4,26:B9oPqzrb1Xk,27:oSmBZbdxCXQ,28:Mlq3PTkaEms,29:LcET6gvLUCU,30:VwKdRQic3cc,31:bcSWxYDIvcY,33:A9JogLhE408,34:idXru00mHBg,36:lX8vOjF2ONc,39:AIzQ2px4zSE,40:5O-9JTg5mvw,41:gFTql88W0js,42:jy2IiroDha4,44:E0kYvAueLQU,46:IO-ZTZEwWx4,47:DvPxVy2er4Q,48:VsLF2BJcyG8,49:MUGTaipkbzY,50:klI7Z5oHokY,51:h8JbXjY1Ct0,53:h0OyDXkLnHA,54:Da_KvwWlkwc,55:jDk0Cv35KKY,56:kzqlqnCtC30,57:sXI1ElqqFzY,58:jRCta8rQBG0,59:4u8Mtc7N1dE,60:7aWG3v-Bt2Y,61:bAZTavF50A4,62:6_JAq9y_uWw,64:iDrwurybL8w,65:xtxYLpxjfLs,67:pRe35KioKbs,68:9gOmQ10S2cs";
const mantiq = "1:REW_P6TUoRg,2:Jp5C84q9yc0,3:BYEmi88gKD8,4:buK85DuVgso,5:CLy01fJYpmE,6:Vbt0Rtg1OQo,7:vDuBsBdFaaQ,8:ixRzaT6SVY8,9:wsHc6fzxjNI,10:aSdBXPQWlv8,11:BjPG002JqCI,12:b0RgKOqZ4MM,13:bA68nSYZypg,14:91CdUeDoL9g,15:GCQKuc_rdDk,16:QBZfymtiNKI,17:r-hxZWExn4g,18:UHoFf8J-9kc,19:fj3c2yimcCM,20:yPsdZP0IXs0,21:zAIkGsF8_O0,22:B_82INK4lPI,23:SAjvoLPEzDA,24:Ujh2RNcuDBA,25:RQS-GRcYqMY,26:SCqES02l8mg,27:qchmjCNKFwI,28:JrkaGmQ472w,29:Fej-gt5uXYM,30:ggOubEmFW0M,31:ZC7Lwg5Q_ic,32:tfdLQv3THAE,33:7B3VIx_Ywdc,34:A1PynAe7bOs,35:YNPbkSLdbDk,36:8gMk1oSkOR0,37:9Iu-u6pUR8c,38:ig-HoXzb2tE,39:DhCWZEfetjs,40:pOFAWJ9D1HM,47:NSjqmro0yLc,48:9EogFBVT-m8,50:5eLFZ7Irskg,52:2FzWlX4Kg5s";
const balagha = "1:10jFRS_R1Sc,2:-2Qs07StTv0,3:iUUiFvL8Lw0,4:NEGEnc8lyZ4,5:PeqNGLka4ik,6:SdeLtN5_PwY,7:ULoJaMAnwWQ,8:lKU6myKPAYw,9:o6QLnlT4lgM,10:ZOCpA9IaF88,11:VbTj4DaJhns,13:vRhqJKXf0ng,14:olJIFfUSWpE,15:vqvCqf_Hapo,16:JXNj4fT34v0,17:SeC0fZpjrvw,18:PGHjn7n_F5g,19:h1SnnFCuREc,20:lSRC28waBp8,21:bjB6N6cnyIM,22:kXyWcDV463A,23:sFjjKzfF4rQ,24:Afhv_8p71OM,25:-kaQhtBUR1Y,26:gxcuii1a6kA,27:w9BhPt4BTTU,28:eDagSf2NTYI,30:qgXh-UU8GMk,31:WoDnxghJoUw,32:3_vpFsVXIn0,33:BWkPJZ3k0ck,34:jeAZ8q5So_Y,35:idGfRcTXegw,36:Kbk8-hM-OFg,37:xZrMve9BZU0,38:NTbCM8vAgRs,39:J3mR3Ro6S1E";
const aqaidT = "obeDjFUjVik,Kt30Z1JsIdk,rq_fdbd_OXo,d_bSvcPCRLc,UlKxS3rT_5Y,U6G2ug9g9f4,appQud3qEyM,i_r5hYB7Wf8,KecIZSXjlqA,oJUBGnFmjUU,3nn8jYZ2kIo,vnvrNwgL40Y,QI_sC_KjyaU,6m0NiKAuvJI,6BFerOTUXTw,klc1lXM6XcM,By0nZ6LF4S4,jONUy9ZwKYs,TZd7CsihdU4,BCaDwWN4_xo,8_VvCwqk864,B6MOY-8bxeE,lO3ZFpmMfu4,SWAL7evs5lk,mBqhOQOdwLg,PKSByNRi9q0,WmNNZY47HIA,LGOv1MZuvBU,jQvXvwNXPMM,JzkctusVnWA,AOvmZfPvGj4,Mi7UVwtAiT4,OwVN1dIeRFg,A5QKoHWls2I,g2XzbC0XtBU,SELcFyr9t4I,XZqnoCsEIn4,iQhydQecf90,Ubv0rkHFXR8,mckMTLkpuuY";
const aqaid1 = "1:536ZSyHq7jE,2:hVDJRK5m8G4,3:LGbyuVnv6Eg,4:0tJjdp-beUM,5:K8_qzsP_2D8,6:651S8wm5DIM,7:Tkav-idNoU0,8:4aRjZ-g3eSw,9:tp5udkTnmsY,10:obKV-ZHeyFE,11:WnJFytCksX8,12:3bVizD11pqE,13:atdeoXQZbKk,14:hF4a64cvm1Y,15:WHhDkI3CEI0,16:ouwPSGLhFI0,17:nkc_K7GijCA,18:yVW7RYzdQ-c,19:EFfdHskUyRc,20:zHIzJDwE64M,21:Lu90CUAK09s,22:p1RZFeB7eg4,23:J7k1LkslczA,24:hUE8a2QvmCM,25:gAVjEavY1ns,26:9wFfMSHKS9Q,27:4t9yiXsyuXI,28:DYK9NNHXp8s,29:ID-k7KAvNE0,30:HEr2MM16Ics,31:KOk6naNCyQg,32:4mvIrkiES0U,33:w_A7OBvAQXI,34:oPY4uDeDBQo,35:ZU7JghPjkuE,36:Goq2Ag8pTEI,37:Hpurx5DPt_A,38:xdwQ-UGWcoE,39:xeqzgw3ngA8,40:CiqRVwfyrug,41:_MA_gdzTN_o,42:luHE0C0PS-s,43:3YtiC8mWb2E,44:oZBk3itFG_k,45:RxcH3B4rJXs,46:58ysx-XIl3Q,47:xZlNP2ZvUUg,48:KnOGBrysKHk";

const inst = (list, label) => list.map((l) => ({ n: l.n, id: l.id, title: label + " " + l.n, ch: INST }));

const BOOKS = {
  nahw: [
    ["2-Nahw/Tuhfa_Saniyya_Ajrumiyya_1.pdf", "التحفة السنية بشرح المقدمة الآجرومية"],
    ["2-Nahw/20201213_20201213_2327_1.pdf", "متن الآجرومية (جداول)"],
    ["2-Nahw/a947n_1.pdf", "الممتع في شرح الآجرومية"],
    ["2-Nahw/20231023_20231023_0542_1.pdf", "قطر الندى وبل الصدى، ج1"],
    ["2-Nahw/ibn.3aqil_1.pdf", "شرح ابن عقيل، ج1"],
    ["2-Nahw/ibn.3aqil_2.pdf", "شرح ابن عقيل، ج2"]
  ],
  sarf: [["1-Sarf/jami_al-muqaddimah_1.pdf", "جامع المقدمات"], ["1-Sarf/Shada3rf_1.pdf", "شذا العرف في فن الصرف"]],
  mantiq: [
    ["3-Mantiq/Khulasat_al-Mantiq_Fadhli_1.pdf", "خلاصة المنطق"],
    ["3-Mantiq/manteq-almuzafar_1.pdf", "المنطق للمظفر (الأجزاء 1-3)"],
    ["3-Mantiq/tahdeeb-almanti9_1.pdf", "تهذيب المنطق"],
    ["3-Mantiq/hashiayazditahthibmantiq_1.pdf", "حاشية ملا عبد الله على تهذيب المنطق"]
  ],
  balagha: [
    ["4-Balagha/ar102arab34_1.pdf", "جواهر البلاغة"],
    ["4-Balagha/mmaaniob_1.pdf", "مختصر المعاني، المجلد 1"], ["4-Balagha/mmaaniob_2.pdf", "مختصر المعاني، المجلد 2"],
    ["4-Balagha/mmaaniob_3.pdf", "مختصر المعاني، المجلد 3"], ["4-Balagha/mmaaniob_4.pdf", "مختصر المعاني، المجلد 4"]
  ],
  aqaid: [
    ["5-Aqaid/Aqaid_al-Imamiyya_Muzaffar_1.pdf", "عقائد الإمامية، الشيخ المظفر"],
    ["5-Aqaid/Bab_Hadi_Ashar_Hilli_Suyuri_1.pdf", "الباب الحادي عشر (الحلي والسيوري)"],
    ["5-Aqaid/Kashf_al-Murad_Tajrid_al-Itiqad_1.pdf", "كشف المراد في شرح تجريد الاعتقاد"]
  ]
};

// science: unit id -> [title, videoId, channel]
const pl = (id, name, ch, count, note, x = {}) => ({ id: "pl-" + id.slice(-9), name, ch, count, note: note || "", playlist: id, lessons: [], ...x });
const B = (sid, i) => BOOKS[sid][i][0];
const books = (sid) => BOOKS[sid].map(([f, t]) => ({ file: f, title: t }));
const MALIKI = "الشيخ محمد خزعل المالكي", KAABI = "الشيخ صادق الكعبي البغدادي", ADHAM = "الشيخ أدهم العاسمي", TOQ = "الشيخ جعفر آل طوق", IRW = "الشيخ باقر الإيرواني", HAYDARI = "تراث السيد كمال الحيدري", USAMA = "الشيخ أسامة آل بلال النجفي";
const QOM = "qom", NAJAF = "najaf";

const data = {
  subjects: [
    // ================= المقدمات =================
    { id: "nahw", name: "النحو", dept: "المقدمات", icon: "nahw", books: books("nahw"), courses: [
      { id: "nahw-tamhidi", name: "دروس تمهيدية في قواعد اللغة العربية", note: "المرحلة التمهيدية", lessons: inst(seq(nahwTamhidi), "الدرس"), book: B("nahw", 1) },
      { id: "nahw-ajr", name: "متن الأجرومية ودروس في النحو", note: "محاضرات المعهد", lessons: inst(pairs(nahw1), "المحاضرة"), book: B("nahw", 1) },
      { id: "nahw-tuhfa", name: "التحفة السنية بشرح المقدمة الأجرومية", note: "تُعرض الدروس المتوفرة على القناة", lessons: inst(pairs(nahw2), "الدرس"), book: B("nahw", 0) },
      { id: "nahw-qatr", name: "شرح قطر الندى وبل الصدى", note: "الجزء الأول", lessons: inst(seq(qatr), "الدرس"), book: B("nahw", 3) },
      pl("PLT_PtgMEfGos_XsUj4pOswkFb_L9FnlQn", "شرح ابن الناظم على الألفية", MALIKI, 166, "الألفية", { q: "ألفية ابن مالك" }),
      pl("PL63bIbPrz61A8K23Kj0S4v5iIwo_oK6Yk", "شرح ابن عقيل", "الأستاذ حيدر أحمد السعدي", 147, "شرح الألفية", { book: B("nahw", 4) }),
      pl("PL3aG68x9FJJPv2jNOPeo4oXcLGBA1jBT2", "شرح الصمدية (جامع المقدمات)", "السيد علي الحسيني", 48, "منهج قم", { city: QOM, q: "الصمدية في النحو" }),
      pl("PLhnf8Ho9iP6C74zQkmruml9Lqw8YVIAVj", "شرح مغني اللبيب", "محمد قايد سنان", 92, "نحو متقدم (قم)", { city: QOM, q: "مغني اللبيب" })
    ] },
    { id: "sarf", name: "الصرف", dept: "المقدمات", icon: "sarf", books: books("sarf"), courses: [
      { id: "sarf-mukhtasar", name: "علم الصرف (مختصر الصرف)", note: "حلقات المعهد", lessons: inst(pairs(sarf), "الحلقة"), book: B("sarf", 1) },
      pl("PLBYrhIQANPhEL4MosdVqVPKv3DCPv0wf-", "شذا العرف في فن الصرف", ADHAM, 49, "شرح الكتاب", { book: B("sarf", 1) })
    ] },
    { id: "mantiq", name: "المنطق", dept: "المقدمات", icon: "mantiq", books: books("mantiq"), courses: [
      { id: "mantiq-khulasa", name: "خلاصة المنطق", note: "المرحلة التمهيدية", lessons: inst(pairs(mantiq), "الدرس"), book: B("mantiq", 0) },
      pl("PL3aG68x9FJJNIWFxuIgmcm7kAkea6fiv4", "شرح منطق المظفر", KAABI, 184, "المنطق للمظفر", { book: B("mantiq", 1) }),
      pl("PL3aG68x9FJJNxBTPId3BpXf6LOLNCzeKy", "شرح حاشية ملا عبد الله", KAABI, 114, "الحاشية على تهذيب المنطق", { book: B("mantiq", 3) })
    ] },
    { id: "balagha", name: "البلاغة", dept: "المقدمات", icon: "balagha", books: books("balagha"), courses: [
      { id: "balagha-tahdhib", name: "البلاغة (تهذيب البلاغة)", note: "دروس المعهد", lessons: inst(pairs(balagha), "الدرس"), book: B("balagha", 1) },
      pl("PLBYrhIQANPhFKwuBOQSpkszPWq9-7RqR4", "شرح جواهر البلاغة", ADHAM, 53, "جواهر البلاغة", { book: B("balagha", 0) }),
      pl("PL3aG68x9FJJMZpfXau_C1i-gs7I8GtC-w", "شرح مختصر المعاني", MALIKI, 192, "علم المعاني", { book: B("balagha", 1) }),
      pl("PL3aG68x9FJJMkq0G9sdguJCKbbX56QM4D", "شرح المطول (تلخيص المفتاح)", "الشيخ إياد العامري", 128, "بلاغة متقدمة (قم)", { city: QOM, q: "المطول شرح تلخيص المفتاح" })
    ] },
    { id: "aqaid", name: "العقائد وعلم الكلام", dept: "المقدمات", icon: "aqaid", books: books("aqaid"), courses: [
      { id: "aqaid-tamhidi", name: "دروس تمهيدية في عقائد الشيعة الإمامية", note: "المرحلة التمهيدية", lessons: inst(seq(aqaidT), "الدرس"), book: B("aqaid", 0) },
      { id: "aqaid-first", name: "شرح عقائد الإمامية (المقدمات الأولى)", note: "الشيخ ورد زين العابدين الحلبي", lessons: inst(pairs(aqaid1), "الدرس"), book: B("aqaid", 0) },
      pl("PLPHnyCvrNCmJVxAEfIA-LjdY4a2lCbDHF", "شرح الباب الحادي عشر", USAMA, 50, "الحلي والسيوري", { book: B("aqaid", 1) }),
      pl("PLGrjugrPlBEnrbcXpr2mpa9iTv6C8X-Es", "شرح تجريد الاعتقاد (كشف المراد)", IRW, 250, "كلام متقدم", { book: B("aqaid", 2) })
    ] },
    { id: "fiqh0", name: "الفقه التمهيدي", dept: "المقدمات", icon: "fiqh", books: [], courses: [
      pl("PLKxikzZNxA6EHNwDapPW2ryHbeI5eU6IJ", "دروس تمهيدية في الفقه", INST, 42, "المرحلة التمهيدية"),
      pl("PLKxikzZNxA6GC4aN88zehuovMVV2xb8He", "منهاج الصالحين، الجزء الأول (نص)", INST, 633, "العبادات", { q: "منهاج الصالحين" }),
      pl("PLCmxrR8GSt0-AgNjvMVuglVaxt-pwRrTb", "منهاج الصالحين: كتاب الطهارة", "السيد رياض الموسوي", 74, "العبادات", { q: "منهاج الصالحين" })
    ] },
    // ================= السطوح =================
    { id: "fiqh", name: "الفقه الاستدلالي", dept: "السطوح", icon: "fiqh", books: [], courses: [
      pl("PLaRDQN4HSdzQPkq-BWP2bwbRwFumG4hzb", "شرح شرائع الإسلام (العبادات)", USAMA, 189, "المحقق الحلي", { q: "شرائع الإسلام" }),
      pl("PLKxikzZNxA6Fv8xzCQuAGPqWSLojCf7sf", "شرح اللمعة الدمشقية", INST, 444, "الشهيدان", { q: "اللمعة الدمشقية" }),
      pl("PLXNQQLzru0ZFhFKCC20OL3HpdlLXtyS69", "المكاسب المحرمة، ج1", TOQ, 212, "الشيخ الأنصاري", { q: "المكاسب الشيخ الأنصاري" }),
      pl("PLHNhFObzjUqX1sjybXp7lKUMeG_whMbN_", "شرح العروة الوثقى", TOQ, 22, "السيد اليزدي", { q: "العروة الوثقى" })
    ] },
    { id: "usul", name: "أصول الفقه", dept: "السطوح", icon: "usul", books: [], courses: [
      pl("PL3aG68x9FJJNoRJzKQZZuI3tLUfd20yua", "شرح أصول الفقه للمظفر", MALIKI, 306, "المرحلة الأولى", { q: "أصول الفقه المظفر" }),
      pl("PLT_PtgMEfGovA4u5V-MitsO2dpFhNOpKz", "شرح الحلقة الأولى", MALIKI, 48, "السيد الشهيد الصدر", { q: "دروس في علم الأصول الحلقة الأولى" }),
      pl("PL63bIbPrz61CbZ5mBh9edjZtuc5ywtRh3", "شرح الحلقة الثانية", "الأستاذ حيدر أحمد السعدي", 126, "السيد الشهيد الصدر", { q: "دروس في علم الأصول الحلقة الثانية" }),
      pl("PL1NMY451gI7Zvu8sebUTCqlZK-ByteSe9", "شرح الحلقة الثالثة", HAYDARI, 120, "السيد الشهيد الصدر", { q: "دروس في علم الأصول الحلقة الثالثة" }),
      pl("PLGrjugrPlBElUgc2xxdZVK3qznbtilk-e", "شرح معالم الأصول", IRW, 74, "معالم الدين", { q: "معالم الدين وملاذ المجتهدين" }),
      pl("PL8TuIEFQemhYH9u_SHtLA1nfWahRlhHmS", "شرح قوانين الأصول", "الشيخ محمد جواد السليمي", 105, "المحقق القمي", { city: QOM, q: "قوانين الأصول" }),
      pl("PL3aG68x9FJJNmk93mByR4Bbv38ujtQqn_", "شرح فرائد الأصول (الرسائل)", "الشيخ إسكندر الجعفري", 116, "الشيخ الأنصاري", { q: "فرائد الأصول الرسائل" }),
      pl("PLT_PtgMEfGos7vLjZcxothWK256iz9gty", "شرح كفاية الأصول", "السيد رشيد الحسيني", 437, "الآخوند الخراساني", { q: "كفاية الأصول" })
    ] },
    { id: "falsafa", name: "الفلسفة والحكمة", dept: "السطوح", icon: "mantiq", books: [], courses: [
      pl("PLGYpVOkcswCwQNIg3je_MFG-qrGcObyAD", "شرح بداية الحكمة", "الشيخ حميد العارضي", 169, "العلامة الطباطبائي", { q: "بداية الحكمة" }),
      pl("PLXNQQLzru0ZHFOVN5ubMpw-DDrSP-27sM", "شرح نهاية الحكمة", TOQ, 354, "العلامة الطباطبائي", { q: "نهاية الحكمة" }),
      pl("PLAHtf1vxkXdIlNmoa5MoDRG77Y3M60yv9", "شرح منظومة السبزواري", "Mahammed Hani", 70, "الحكيم السبزواري", { city: QOM, q: "شرح المنظومة السبزواري" }),
      pl("PLAHtf1vxkXdK2guxOljKYGPAE34rt1QBC", "الحكمة المتعالية (الأسفار الأربعة) ج1", "Mahammed Hani", 390, "صدر المتألهين", { q: "الأسفار الأربعة" })
    ] },
    { id: "hadith", name: "الحديث والرجال والتفسير", dept: "السطوح", icon: "usul", books: [], courses: [
      pl("PLHNhFObzjUqXOUJslHIMYOWgetYZ2qXxG", "شرح البداية في علم الدراية", "الشيخ أنمار المظفر", 58, "الشهيد الثاني", { q: "البداية في علم الدراية" }),
      pl("PLXeLSwlKb4x9g3QEAptgLbWrIRInQIWi-", "دروس علم الرجال", "الشيخ فيصل العبادي", 22, "علم الرجال", { q: "علم الرجال" }),
      pl("PLAHtf1vxkXdJ-tkpADmzqroStcrklIgvy", "تفسير الميزان", "Mahammed Hani", 276, "العلامة الطباطبائي", { q: "تفسير الميزان" })
    ] },
    // ================= بحث الخارج =================
    { id: "kharij", name: "بحث الخارج", dept: "بحث الخارج", icon: "kharij", books: [], courses: [
      pl("PLKxikzZNxA6Htfqd9x-qg3JOXHAV2L899", "بحث الفقه", INST + " (" + IRW + ")", 370, "خارج الفقه"),
      pl("PLHASXv5O7U58N1gRB0SQP9hBbaK2fEub6", "مفاتيح عملية الاستنباط الفقهي", "السيد كمال الحيدري", 534, "خارج الفقه"),
      pl("PLKBYpgQj3ZUokAnwEFJtSBxyrq5Qm8r1h", "بحث خارج أصول الفقه 1444هـ", "السيد جعفر الحسيني الشيرازي", 128, "خارج الأصول"),
      pl("PLL8f2rvO55U2zPbLyX64TrjCvL6fToMVA", "بحث خارج أصول الفقه", "السيد منير الخباز", 15, "خارج الأصول"),
      pl("PL3aG68x9FJJPosAGDA45yzremewW5txUN", "خارج الفقه: كتاب الصوم", "السيد أبو القاسم الخوئي (دروس مسجلة)", 25, "خارج الفقه")
    ] }
  ]
};
// ---- external books from archive.org (verified via metadata) ----
const META = fs.existsSync(path.join(root, "data", "archive-meta.json")) ? JSON.parse(fs.readFileSync(path.join(root, "data", "archive-meta.json"), "utf8")) : {};
const ARCH = (id, file) => "https://archive.org/download/" + id + "/" + encodeURIComponent(file);
let extBooks = 0;
for (const [sid, list] of Object.entries(SPEC)) {
  const sub = data.subjects.find((x) => x.id === sid); if (!sub) continue;
  for (const e of list) {
    const m = META[e.id]; if (!m) continue;
    for (const p of m.pdfs) { sub.books.push({ title: e.title + (m.pdfs.length > 1 ? " — " + p.name.replace(/\.pdf$/i, "") : ""), url: p.mb > 80 ? "https://archive.org/details/" + e.id : ARCH(e.id, p.name), mb: p.mb }); extBooks++; }
  }
}
// course -> book on archive.org (details page)
const QMAP = { "ألفية ابن مالك": "alfiya_201812", "مغني اللبيب": "moharram1965_gmail_20180428", "منهاج الصالحين": "mnhjasasalheen-2_202006", "شرائع الإسلام": "01_20220505_202205", "اللمعة الدمشقية": "AAlexandrina-190221", "المكاسب الشيخ الأنصاري": "almkaseb-murtada-alansari_20200628", "أصول الفقه المظفر": "Osulalfeqh", "دروس في علم الأصول الحلقة الأولى": "droosfielmalosul_3", "دروس في علم الأصول الحلقة الثانية": "droosfielmalosul_3", "دروس في علم الأصول الحلقة الثالثة": "droosfielmalosul_3", "فرائد الأصول الرسائل": "abd-albaqir-360", "كفاية الأصول": "20200829_20200829_2116", "بداية الحكمة": "20230721_20230721_0707", "نهاية الحكمة": "moamenquraish_gmail_11", "البداية في علم الدراية": "almoamltv_gmail_20140330_1148", "تفسير الميزان": "almizan_alami_22j" };
let linked = 0;
for (const sub of data.subjects) for (const c of sub.courses) if (c.q && QMAP[c.q] && !c.book) { c.bookUrl = "https://archive.org/details/" + QMAP[c.q]; delete c.q; linked++; }
data.missing = [...new Set(data.subjects.flatMap((s) => s.courses.map((c) => c.q).filter(Boolean)))];
fs.mkdirSync(path.join(root, "web"), { recursive: true });
fs.writeFileSync(path.join(root, "web", "data.json"), JSON.stringify(data));
const total = data.subjects.reduce((a, s) => a + s.courses.reduce((b, c) => b + c.lessons.length, 0), 0);
const plays = data.subjects.reduce((a, s) => a + s.courses.filter((c) => c.playlist).length, 0);
const ids = data.subjects.flatMap((s) => s.courses.flatMap((c) => c.lessons.map((l) => l.id)));
const pids = data.subjects.flatMap((s) => s.courses.filter((c) => c.playlist).map((c) => c.playlist));
const bad = ids.filter((x) => !/^[A-Za-z0-9_-]{11}$/.test(x)), badP = pids.filter((x) => !/^PL[A-Za-z0-9_-]{16,40}$/.test(x));
console.log("external books:", extBooks, "courses linked to archive:", linked);
console.log("playlist courses:", plays, "video lessons:", total, "bad video ids:", bad.length ? bad.join(",") : "none", "bad playlist ids:", badP.length ? badP.join(",") : "none", "dupes:", ids.length - new Set(ids).size, "dupe playlists:", pids.length - new Set(pids).size);
