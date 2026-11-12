// Builds web/data.json: subjects -> courses -> lessons (each lesson = one YouTube video) + books list.
// Hawza video IDs come from the public channel "معهد تراث الأنبياء للدراسات الحوزوية" (series + playlists).
// Science videos are picked from Arabic teachers/communicators (see "ch" per lesson).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
const SCI = {
  physics: [
    ["motion", "الحركة والسرعة", "XKi5YV9No6I", "الأستاذ منتظر الخفاجي"], ["force", "القوة", "GNJr1pL6HwE", "الأستاذ علي السوداني"],
    ["energy", "الطاقة والشغل", "Cb3Doa2QHG4", "محمد زيادة"], ["kin", "معادلات الحركة", "tqXU9S3tymQ", "الأستاذ علي السوداني"],
    ["newton", "قوانين نيوتن للحركة", "VDT9uxAoenM", "الأستاذ منتظر الخفاجي"], ["work", "الشغل والطاقة الحركية", "m7JTv_n2bEo", "khalled physics"],
    ["charge", "الشحنة والمجال الكهربائي", "QzfQ5ZDHxN4", "الأستاذ علي السوداني"], ["circuits", "الدوائر الكهربائية وقانون أوم", "GTJnJXdUNno", "عزام زقزوق"],
    ["mag", "المغناطيسية", "WbDxzWxU6rI", "قناة العلوم"], ["wave", "الموجات", "Y0pfgEVgjWs", "محمد فاروق"],
    ["optics", "البصريات", "lQnbhu8Efjw", "محمد ناجي"], ["thermo", "الديناميكا الحرارية", "yR37JC9Vajk", "محمد زيادة"],
    ["sr", "النسبية الخاصة", "sTNXep569Mo", "العلم بالملعقة"], ["qm", "مدخل إلى ميكانيكا الكم", "no14BMI_0BE", "باختصار"]
  ],
  astro: [
    ["sky", "السماء الليلية والكوكبات", "bKySzMFLE7U", "The BST Astronomy"], ["cal", "التقويم والفصول", "LNEhbt5Nugk", "أحسن العلوم"],
    ["obs", "المقراب (التلسكوب)", "OutUI4eKpP4", "علوم واختراعات بالمختصر"], ["ss", "المجموعة الشمسية", "bPajcMkGcbk", "SolarBalls بالعربي"],
    ["sun", "الشمس", "AAjIPao8Wyo", "MT_for_Space"], ["stars", "النجوم ودورة حياتها", "QEXe6htlp8o", "ASTRO-MUSTAFA"],
    ["galaxy", "المجرات", "l_W18Dtsg64", "أسئلة نص الليل"], ["bh", "الثقوب السوداء", "ha4VhfCrsVg", "حسين عبدالله"],
    ["cosmo", "الانفجار العظيم وتوسع الكون", "XaT9Piac72k", "العلم بالملعقة"]
  ]
};
const OS = "https://openstax.org/books/";
const REF = {
  physics: {
    motion: ["OpenStax University Physics Vol.1، الفصل 3: Motion Along a Straight Line", OS + "university-physics-volume-1/pages/3-introduction"],
    force: ["OpenStax University Physics Vol.1، الفصل 5: Newton's Laws of Motion", OS + "university-physics-volume-1/pages/5-introduction"],
    energy: ["OpenStax University Physics Vol.1، الفصل 7: Work and Kinetic Energy", OS + "university-physics-volume-1/pages/7-introduction"],
    kin: ["OpenStax University Physics Vol.1، الفصل 4: Motion in Two and Three Dimensions", OS + "university-physics-volume-1/pages/4-introduction"],
    newton: ["OpenStax University Physics Vol.1، الفصل 5: Newton's Laws of Motion", OS + "university-physics-volume-1/pages/5-introduction"],
    work: ["OpenStax University Physics Vol.1، الفصل 8: Potential Energy and Conservation of Energy", OS + "university-physics-volume-1/pages/8-introduction"],
    charge: ["OpenStax University Physics Vol.2، الفصل 5: Electric Charges and Fields", OS + "university-physics-volume-2/pages/5-introduction"],
    circuits: ["OpenStax University Physics Vol.2، الفصل 10: Direct-Current Circuits", OS + "university-physics-volume-2/pages/10-introduction"],
    mag: ["OpenStax University Physics Vol.2، الفصل 11: Magnetic Forces and Fields", OS + "university-physics-volume-2/pages/11-introduction"],
    wave: ["OpenStax University Physics Vol.1، الفصل 16: Waves", OS + "university-physics-volume-1/pages/16-introduction"],
    optics: ["OpenStax University Physics Vol.3، الفصل 1: The Nature of Light", OS + "university-physics-volume-3/pages/1-introduction"],
    thermo: ["OpenStax University Physics Vol.2، الفصل 3: The First Law of Thermodynamics", OS + "university-physics-volume-2/pages/3-introduction"],
    sr: ["OpenStax University Physics Vol.3، الفصل 5: Relativity", OS + "university-physics-volume-3/pages/5-introduction"],
    qm: ["OpenStax University Physics Vol.3، الفصل 7: Quantum Mechanics", OS + "university-physics-volume-3/pages/7-introduction"]
  },
  astro: {
    sky: ["OpenStax Astronomy 2e، الفصل 2: Observing the Sky", OS + "astronomy-2e/pages/1-introduction"],
    cal: ["OpenStax Astronomy 2e، الفصل 4: Earth, Moon, and Sky", OS + "astronomy-2e/pages/1-introduction"],
    obs: ["OpenStax Astronomy 2e، الفصل 6: Astronomical Instruments", OS + "astronomy-2e/pages/1-introduction"],
    ss: ["OpenStax Astronomy 2e، الفصل 7: Other Worlds, an Introduction to the Solar System", OS + "astronomy-2e/pages/1-introduction"],
    sun: ["OpenStax Astronomy 2e، الفصل 15: The Sun", OS + "astronomy-2e/pages/1-introduction"],
    stars: ["OpenStax Astronomy 2e، الفصل 22: Stars from Adolescence to Old Age", OS + "astronomy-2e/pages/1-introduction"],
    galaxy: ["OpenStax Astronomy 2e، الفصل 26: Galaxies", OS + "astronomy-2e/pages/1-introduction"],
    bh: ["OpenStax Astronomy 2e، الفصل 24: Black Holes and Curved Spacetime", OS + "astronomy-2e/pages/1-introduction"],
    cosmo: ["OpenStax Astronomy 2e، الفصل 30: The Big Bang", OS + "astronomy-2e/pages/1-introduction"]
  }
};
const topics = JSON.parse(fs.readFileSync(path.join(root, "data", "topics.json"), "utf8"));
const sci = (sid) => SCI[sid].map((u, i) => {
  const t = topics[sid + ":" + u[0]];
  const r = REF[sid][u[0]];
  return { n: i + 1, id: u[2], title: u[1], ch: u[3], read: t ? t.text : "", refs: t ? t.sources : [], book: r ? { title: r[0], url: r[1] } : null };
});

const pl = (id, name, ch, count, note) => ({ id: "pl-" + id.slice(-8), name, ch, count, note: note || "", playlist: id, lessons: [] });
const ADV = [
  { id: "lumaa", name: "اللمعة الدمشقية", dept: "السطوح", icon: "fiqh", books: [], courses: [
    pl("PLKxikzZNxA6Fv8xzCQuAGPqWSLojCf7sf", "شرح اللمعة الدمشقية", INST, 444, "المعهد: الفقه الاستدلالي (سطوح)")
  ] },
  { id: "usul", name: "أصول الفقه", dept: "السطوح", icon: "usul", books: [], courses: [
    pl("PL3aG68x9FJJNoRJzKQZZuI3tLUfd20yua", "شرح أصول الفقه للمظفر", "الشيخ محمد خزعل المالكي", 306, "للمبتدئين في الأصول"),
    pl("PL1NMY451gI7Zvu8sebUTCqlZK-ByteSe9", "شرح الحلقة الثالثة (السيد الشهيد الصدر)", "تراث السيد كمال الحيدري", 120, "الحلقة الثالثة"),
    pl("PLT_PtgMEfGos7vLjZcxothWK256iz9gty", "شرح كفاية الأصول", "السيد رشيد الحسيني", 437, "كفاية الأصول (الآخوند الخراساني)"),
    pl("PL3aG68x9FJJNmk93mByR4Bbv38ujtQqn_", "شرح فرائد الأصول (الرسائل)", "الشيخ إسكندر الجعفري", 116, "رسائل الشيخ الأنصاري")
  ] },
  { id: "fiqh", name: "الفقه (المكاسب)", dept: "السطوح", icon: "fiqh", books: [], courses: [
    pl("PLXNQQLzru0ZFhFKCC20OL3HpdlLXtyS69", "المكاسب المحرمة، ج1", "الشيخ جعفر آل طوق", 212, "مكاسب الشيخ الأنصاري")
  ] },
  { id: "kharij", name: "بحث الخارج", dept: "بحث الخارج", icon: "kharij", books: [], courses: [
    pl("PLKxikzZNxA6Htfqd9x-qg3JOXHAV2L899", "بحث الفقه", INST + " (الشيخ باقر الإيرواني)", 370, "خارج الفقه"),
    pl("PLHASXv5O7U58N1gRB0SQP9hBbaK2fEub6", "مفاتيح عملية الاستنباط الفقهي", "السيد كمال الحيدري", 534, "خارج الفقه"),
    pl("PLKBYpgQj3ZUokAnwEFJtSBxyrq5Qm8r1h", "بحث خارج أصول الفقه 1444هـ", "السيد جعفر الحسيني الشيرازي", 128, "خارج الأصول"),
    pl("PLL8f2rvO55U2zPbLyX64TrjCvL6fToMVA", "بحث خارج أصول الفقه", "السيد منير الخباز", 15, "خارج الأصول"),
    pl("PL3aG68x9FJJPosAGDA45yzremewW5txUN", "خارج الفقه: كتاب الصوم", "السيد أبو القاسم الخوئي (دروس مسجلة)", 25, "خارج الفقه")
  ] }
];
const books = (sid) => BOOKS[sid].map(([f, t]) => ({ file: f, title: t }));
const data = {
  subjects: [
    { id: "nahw", name: "النحو", dept: "المقدمات", icon: "nahw", books: books("nahw"), courses: [
      { id: "nahw-ajr", name: "متن الأجرومية ودروس في النحو", note: "محاضرات المعهد", lessons: inst(pairs(nahw1), "المحاضرة"), book: BOOKS.nahw[1][0] },
      { id: "nahw-tuhfa", name: "التحفة السنية بشرح المقدمة الأجرومية", note: "تُعرض الدروس المتوفرة على القناة", lessons: inst(pairs(nahw2), "الدرس"), book: BOOKS.nahw[0][0] },
      { id: "nahw-tamhidi", name: "دروس تمهيدية في قواعد اللغة العربية", note: "المرحلة التمهيدية", lessons: inst(seq(nahwTamhidi), "الدرس"), book: BOOKS.nahw[1][0] },
      { id: "nahw-qatr", name: "شرح قطر الندى وبل الصدى", note: "الجزء الأول", lessons: inst(seq(qatr), "الدرس"), book: BOOKS.nahw[3][0] }
    ] },
    { id: "sarf", name: "الصرف", dept: "المقدمات", icon: "sarf", books: books("sarf"), courses: [
      { id: "sarf-mukhtasar", name: "علم الصرف (مختصر الصرف)", note: "حلقات المعهد", lessons: inst(pairs(sarf), "الحلقة"), book: BOOKS.sarf[1][0] }
    ] },
    { id: "mantiq", name: "المنطق", dept: "المقدمات", icon: "mantiq", books: books("mantiq"), courses: [
      { id: "mantiq-khulasa", name: "خلاصة المنطق", note: "المرحلة التمهيدية", lessons: inst(pairs(mantiq), "الدرس"), book: BOOKS.mantiq[0][0] }
    ] },
    { id: "balagha", name: "البلاغة", dept: "المقدمات", icon: "balagha", books: books("balagha"), courses: [
      { id: "balagha-tahdhib", name: "البلاغة (تهذيب البلاغة)", note: "دروس المعهد", lessons: inst(pairs(balagha), "الدرس"), book: BOOKS.balagha[1][0] }
    ] },
    { id: "aqaid", name: "العقائد", dept: "المقدمات", icon: "aqaid", books: books("aqaid"), courses: [
      { id: "aqaid-tamhidi", name: "دروس تمهيدية في عقائد الشيعة الإمامية", note: "المرحلة التمهيدية", lessons: inst(seq(aqaidT), "الدرس"), book: BOOKS.aqaid[0][0] },
      { id: "aqaid-first", name: "شرح عقائد الإمامية (المقدمات الأولى)", note: "الشيخ ورد زين العابدين الحلبي", lessons: inst(pairs(aqaid1), "الدرس"), book: BOOKS.aqaid[0][0] }
    ] },
    ...ADV,
    { id: "physics", name: "الفيزياء", dept: "العلوم", icon: "physics", books: [
      { url: OS + "university-physics-volume-1", title: "University Physics Vol.1 (OpenStax، مجاني بترخيص CC BY)" },
      { url: OS + "university-physics-volume-2", title: "University Physics Vol.2 (OpenStax)" },
      { url: OS + "university-physics-volume-3", title: "University Physics Vol.3 (OpenStax)" }
    ], courses: [
      { id: "physics-core", name: "الفيزياء من المفاهيم إلى الحديثة", note: "شروح أساتذة عرب + مقال تعريفي من ويكيبيديا العربية", lessons: sci("physics") }
    ] },
    { id: "astro", name: "الفلك", dept: "العلوم", icon: "astro", books: [
      { url: OS + "astronomy-2e", title: "Astronomy 2e (OpenStax، مجاني بترخيص CC BY)" }
    ], courses: [
      { id: "astro-core", name: "الفلك والكونيات", note: "شروح عربية + مقال تعريفي من ويكيبيديا العربية", lessons: sci("astro") }
    ] }
  ]
};
data.missing = [
  "متن الأجرومية (الأصل)", "مختصر الصرف (الفضلي)", "تهذيب البلاغة (الكتاب المقرر)", "مختصر الإلهيات",
  "اللمعة الدمشقية", "أصول الفقه (المظفر)", "الحلقات (الصدر)", "كفاية الأصول", "المكاسب", "فرائد الأصول (الرسائل)"
];
fs.mkdirSync(path.join(root, "web"), { recursive: true });
fs.writeFileSync(path.join(root, "web", "data.json"), JSON.stringify(data));
const total = data.subjects.reduce((a, s) => a + s.courses.reduce((b, c) => b + c.lessons.length, 0), 0);
const plays = data.subjects.reduce((a, s) => a + s.courses.filter((c) => c.playlist && !c.lessons.length).length, 0);
const ids = data.subjects.flatMap((s) => s.courses.flatMap((c) => c.lessons.map((l) => l.id)));
const bad = ids.filter((x) => !/^[A-Za-z0-9_-]{11}$/.test(x));
console.log("playlists:", plays, "lessons:", total, "bad ids:", bad.length ? bad.join(",") : "none", "dupes:", ids.length - new Set(ids).size);
