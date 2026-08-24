import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manually
const envPath = resolve(import.meta.dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema.js";
import { wiridItems } from "../db/schema.js";
import { eq } from "drizzle-orm";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url, { max: 10, prepare: false });
const db = drizzle(client, { schema });

interface UpdateData {
  title: string;
  arab: string;
  latin: string;
  translation: string;
}

const updates: UpdateData[] = [
  // ============================================================
  // WIRID HARIAN
  // ============================================================
  {
    title: "Wirid Bakda Shalat Fardhu",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

أَسْتَغْفِرُ اللهَ الْعَظِيْمَ الَّذِيْ لَا إِلٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّوْمَ وَأَتُوْبُ إِلَيْهِ ×٣

اللّٰهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ

سُبْحَانَ اللهِ (×٣٣)
وَالْحَمْدُ لِلّٰهِ (×٣٣)
وَلاَ إِلَهَ إِلاَّ اللهُ (×٣٣)
وَاللهُ أَكْبَرُ (×٣٣)
وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ الْعَلِيِّ الْعَظِيْمِ

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ×١٠

لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ ×١٠

أَسْتَغْفِرُ اللهَ الْعَظِيْمَ (×١٠٠)`,
    latin: `Bismillâhir-rahmânir-rahîm

Astaghfirullâhal-‘azhîmal-ladzî lâ ilâha illâ huwal-hayyul-qayyûm wa atûbu ilaih. 3×

Allâhumma antas-salâmu wa minkas-salâm, tabârakta yâ dzal-jâli wal-ikrâm.

Subhânallâh (33×)
Walhamdulillâh (33×)
Walâ ilâha illallâh (33×)
Wallâhu akbar (33×)
Walâ haula walâ quwwata illâ billâhil-‘aliyyil-‘azhîm.

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin. 10×

Lâ ilâha illallâhu wahdahu lâ syarîka lah, lahul-mulku wa lahul-hamdu wa huwa ‘alâ kulli syai’in qadîr. 10×

Astaghfirullâhal-‘azhîm. 100×`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Aku memohon ampun kepada Allah Yang Maha Agung, yang tidak ada tuhan selain Dia, Yang Maha Hidup lagi Maha Terus-Menerus mengurus (makhluk-Nya), dan aku bertaubat kepada-Nya. 3×

Ya Allah, Engkaulah Kesejahteraan dan dari-Mu lah kesejahteraan. Maha Suci Engkau, wahai Dikuasa Kemuliaan dan Penghormatan.

Maha Suci Allah (33×)
Segala puji bagi Allah (33×)
Tidak ada tuhan selain Allah (33×)
Allah Maha Besar (33×)
Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad. 10×

Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Milik-Nya segala kerajaan dan bagi-Nya segala puji, dan Dia Maha Kuasa atas segala sesuatu. 10×

Aku memohon ampun kepada Allah Yang Maha Agung. 100×`,
  },
  {
    title: "Wirdul Lathif (Dzikir Pagi)",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

قُلْ هُوَ اللهُ أَحَدٌ ۝ اَللهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ×٣

قُلْ أَعُوْذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ×٣

قُلْ أَعُوْذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِيْ يُوَسْوِسُ فِي صُدُوْرِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ ×٣

اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ×١

أَسْتَغْفِرُ اللهَ وَأَتُوْبُ إِلَيْهِ ×١٠٠

لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ ×١٠٠

سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيْمِ ×١٠٠

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ×١٠٠

اَللهُمَّ إِنِّيْ أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْاٰخِرَةِ ×٣

لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ ×١٠

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُرْضِيْكَ بِهَا عَنَّا ×٣`,
    latin: `Bismillâhir-rahmânir-rahîm

Qul huwallâhu ahad. Allâhush-shamad. Lam yalid wa lam yûlad. Wa lam yakun lahû kufuwan ahad. 3×

Qul a‘ûdzu birabbil-falâq. Min syarri mâ khalaq. Wa min syarri gâsiqin idzâ waqab. Wa min syarrin-naffâtsâti fil-‘uqad. Wa min syarri khâsidin idzâ hasad. 3×

Qul a‘ûdzu birabbinnâs. Malikinnâs. Ilâhinnâs. Min syarril-waswâsil-khannâs. Alladzî yuwaswisu fî shudûrinnâs. Minal-jinnati wannâs. 3×

Alhamdulillâhi rabbil-‘âlamîn. 1×

Astaghfirullâha wa atûbu ilaih. 100×

Lâ ilâha illallâhu wahdahu lâ syarîka lah, lahul-mulku wa lahul-hamdu wa huwa ‘alâ kulli syai’in qadîr. 100×

Subhânallâhi wa bihamdih, subhânallahil-‘azhîm. 100×

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin. 100×

Allâhumma innî as‘alukal-‘âfiyata fid-dunyâ wal-âkhirah. 3×

Lâ haula walâ quwwata illâ billâhil-‘aliyyil-‘azhîm. 10×

Allâhumma shalli ‘alâ sayyidinâ muhammadin shalâtan tardlâka bihâ ‘annâ. 3×`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Katakanlah: "Dialah Allah Yang Maha Esa. Allah tempat bergantung. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada seorang pun yang setara dengan Dia." 3×

Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) subuh, dari kejahatan makhluk-Nya, dan dari kejahatan gelap malam apabila telah gelap, dan dari kejahatan perempuan-perempuan yang meniup pada buhul-buhul (tali), dan dari kejahatan pendengki bila dia dengki." 3×

Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) manusia, Raja (pemelihara) manusia, Sembahan (pemelihara) manusia, dari kejahatan (bisikan) syaitan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia." 3×

Segala puji bagi Allah, Tuhan semesta alam. 1×

Aku memohon ampun kepada Allah dan aku bertaubat kepada-Nya. 100×

Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Milik-Nya segala kerajaan dan bagi-Nya segala puji, dan Dia Maha Kuasa atas segala sesuatu. 100×

Maha Suci Allah dan segala puji bagi-Nya. Maha Suci Allah Yang Maha Agung. 100×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad. 100×

Ya Allah, sesungguhnya aku memohon kepada-Mu kesejahteraan di dunia dan akhirat. 3×

Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung. 10×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad, sholawat yang Engkau ridhai darinya. 3×`,
  },
  {
    title: "Wirdul Lathif (Dzikir Petang)",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

قُلْ هُوَ اللهُ أَحَدٌ ۝ اَللهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ×٣

قُلْ أَعُوْذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ×٣

قُلْ أَعُوْذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِيْ يُوَسْوِسُ فِي صُدُوْرِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ ×٣

اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ×١

أَسْتَغْفِرُ اللهَ وَأَتُوْبُ إِلَيْهِ ×١٠٠

لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ ×١٠٠

سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيْمِ ×١٠٠

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ×١٠٠

اَللهُمَّ إِنِّيْ أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْاٰخِرَةِ ×٣

لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ ×١٠

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُرْضِيْكَ بِهَا عَنَّا ×٣`,
    latin: `Bismillâhir-rahmânir-rahîm

Qul huwallâhu ahad. Allâhush-shamad. Lam yalid wa lam yûlad. Wa lam yakun lahû kufuwan ahad. 3×

Qul a‘ûdzu birabbil-falâq. Min syarri mâ khalaq. Wa min syarri gâsiqin idzâ waqab. Wa min syarrin-naffâtsâti fil-‘uqad. Wa min syarri khâsidin idzâ hasad. 3×

Qul a‘ûdzu birabbinnâs. Malikinnâs. Ilâhinnâs. Min syarril-waswâsil-khannâs. Alladzî yuwaswisu fî shudûrinnâs. Minal-jinnati wannâs. 3×

Alhamdulillâhi rabbil-‘âlamîn. 1×

Astaghfirullâha wa atûbu ilaih. 100×

Lâ ilâha illallâhu wahdahu lâ syarîka lah, lahul-mulku wa lahul-hamdu wa huwa ‘alâ kulli syai’in qadîr. 100×

Subhânallâhi wa bihamdih, subhânallahil-‘azhîm. 100×

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin. 100×

Allâhumma innî as‘alukal-‘âfiyata fid-dunyâ wal-âkhirah. 3×

Lâ haula walâ quwwata illâ billâhil-‘aliyyil-‘azhîm. 10×

Allâhumma shalli ‘alâ sayyidinâ muhammadin shalâtan tardlâka bihâ ‘annâ. 3×`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Katakanlah: "Dialah Allah Yang Maha Esa. Allah tempat bergantung. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada seorang pun yang setara dengan Dia." 3×

Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) subuh, dari kejahatan makhluk-Nya, dan dari kejahatan gelap malam apabila telah gelap, dan dari kejahatan perempuan-perempuan yang meniup pada buhul-buhul (tali), dan dari kejahatan pendengki bila dia dengki." 3×

Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) manusia, Raja (pemelihara) manusia, Sembahan (pemelihara) manusia, dari kejahatan (bisikan) syaitan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia." 3×

Segala puji bagi Allah, Tuhan semesta alam. 1×

Aku memohon ampun kepada Allah dan aku bertaubat kepada-Nya. 100×

Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Milik-Nya segala kerajaan dan bagi-Nya segala puji, dan Dia Maha Kuasa atas segala sesuatu. 100×

Maha Suci Allah dan segala puji bagi-Nya. Maha Suci Allah Yang Maha Agung. 100×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad. 100×

Ya Allah, sesungguhnya aku memohon kepada-Mu kesejahteraan di dunia dan akhirat. 3×

Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung. 10×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad, sholawat yang Engkau ridhai darinya. 3×`,
  },
  {
    title: "Wirid Menjelang Tidur",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

قُلْ هُوَ اللهُ أَحَدٌ ۝ اَللهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ×٣

قُلْ أَعُوْذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ×٣

قُلْ أَعُوْذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِيْ يُوَسْوِسُ فِي صُدُوْرِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ ×٣

بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
اَللهُمَّ بِاسْمِكَ أَمُوْتُ وَأَحْيَا

اَللهُمَّ اغْفِرْ لِيْ وَارْحَمْنِيْ وَأَلْحِقْنِيْ بِالصَّالِحِيْنَ

اَللهُمَّ إِنِّيْ أَسْأَلُكَ الْجَنَّةَ وَأَعُوْذُ بِكَ مِنَ النَّارِ

سُبْحَانَ اللهِ (×٣٣)
وَالْحَمْدُ لِلّٰهِ (×٣٣)
وَلاَ إِلَهَ إِلاَّ اللهُ (×٣٣)
وَاللهُ أَكْبَرُ (×٣٣)
وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ الْعَلِيِّ الْعَظِيْمِ

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ×١٠

اَللهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوْءُ بِذَنْبِيْ فَاغْفِرْ لِيْ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ`,
    latin: `Bismillâhir-rahmânir-rahîm

Qul huwallâhu ahad. Allâhush-shamad. Lam yalid wa lam yûlad. Wa lam yakun lahû kufuwan ahad. 3×

Qul a‘ûdzu birabbil-falâq. Min syarri mâ khalaq. Wa min syarri gâsiqin idzâ waqab. Wa min syarrin-naffâtsâti fil-‘uqad. Wa min syarri khâsidin idzâ hasad. 3×

Qul a‘ûdzu birabbinnâs. Malikinnâs. Ilâhinnâs. Min syarril-waswâsil-khannâs. Alladzî yuwaswisu fî shudûrinnâs. Minal-jinnati wannâs. 3×

Bismillâhir-rahmânir-rahîm
Allâhumma bismika amûtu wa ahyâ.

Allâhumma-ghfirlî warhamnî walhiqnis-shâlihîn.

Allâhumma innî as‘alukal-jannata wa a‘ûdzu bika minan-nâr.

Subhânallâh (33×)
Walhamdulillâh (33×)
Walâ ilâha illallâh (33×)
Wallâhu akbar (33×)
Walâ haula walâ quwwata illâ billâhil-‘aliyyil-‘azhîm.

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin. 10×

Allâhumma anta rabbî lâ ilâha illâ anta, khalaqtanî wa ana ‘abduka, wa ana ‘alâ ‘ahdika wa wa’dika mâ istatha’tu, a‘ûdzu bika min syarri mâ shana’tu, abû’ laka bi ni’matika ‘alayya, wa abû’ bi dzambî faghfirlî fa innahû lâ yaghfirudz-dzunûba illâ anta.`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Katakanlah: "Dialah Allah Yang Maha Esa. Allah tempat bergantung. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada seorang pun yang setara dengan Dia." 3×

Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) subuh, dari kejahatan makhluk-Nya, dan dari kejahatan gelap malam apabila telah gelap, dan dari kejahatan perempuan-perempuan yang meniup pada buhul-buhul (tali), dan dari kejahatan pendengki bila dia dengki." 3×

Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) manusia, Raja (pemelihara) manusia, Sembahan (pemelihara) manusia, dari kejahatan (bisikan) syaitan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia." 3×

Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
Ya Allah, dengan nama-Mu aku mati dan aku hidup.

Ya Allah, ampunilah aku dan rahmatilah aku dan hubungkanlah aku dengan orang-orang yang saleh.

Ya Allah, sesungguhnya aku memohon surga dan aku berlindung kepada-Mu dari neraka.

Maha Suci Allah (33×)
Segala puji bagi Allah (33×)
Tidak ada tuhan selain Allah (33×)
Allah Maha Besar (33×)
Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad. 10×

Ya Allah, Engkau adalah Tuhanku, tidak ada tuhan selain Engkau. Engkau telah menciptakan aku dan aku adalah hamba-Mu. Dan aku akan menaati perintah-Mu dan menepati janji-Mu selama aku mampu. Aku berlindung kepada-Mu dari kejahatan perbuatan-Mu. Aku mengakui nikmat-Mu terhadapku dan aku mengakui dosaku, maka ampunilah aku. Sesungguhnya tidak ada yang mengampuni dosa-dosa kecuali Engkau.`,
  },

  // ============================================================
  // RATIB
  // ============================================================
  {
    title: "Ratib Samman",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

اَلْفَاتِحَةُ (×٧)
إِلَى حَضْرَةِ سَيِّدِنَا مُحَمَّدٍ ﷺ

لَا إِلٰهَ إِلَّا اللهُ الْمَلِكُ الْحَقُّ الْمُبِيْنُ (×٧)
لَا إِلٰهَ إِلَّا اللهُ الْوَاحِدُ الْقَهَّارُ (×٧)
لَا إِلٰهَ إِلَّا اللهُ الصَّبُورُ الشَّكُوْرُ (×٧)
لَا إِلٰهَ إِلَّا اللهُ ذَا الْجَلاَلِ وَالإِكْرَامِ (×٧)
لَا إِلٰهَ إِلَّا اللهُ الْعَلِيُّ الْكَبِيْرُ (×٧)
لَا إِلٰهَ إِلَّا اللهُ الْوَهَّابُ الْغَفَّارُ (×٧)
لَا إِلٰهَ إِلَّا اللهُ رَبُّ السَّمَوَاتِ السَّبْعِ وَرَبُّ الْعَرْشِ الْعَظِيْمِ (×٧)

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ (×٧)
سَلَامٌ عَلَيْكَ يَا رَسُوْلَ اللهِ
سَلَامٌ عَلَيْكَ يَا نَبِيَّ اللهِ
سَلَامٌ عَلَيْكَ يَا حَبِيْبَ اللهِ

اَلْفَاتِحَةُ (×٧)`,
    latin: `Bismillâhir-rahmânir-rahîm

Al-Fâtihah (7×)
Ilâ hadhrati sayyidinâ muhammadin shallallâhu ‘alaihi wa sallam.

Lâ ilâha illallâhul-malikul-haqqul-mubîn. 7×
Lâ ilâha illallâhul-wâhidul-qahhâr. 7×
Lâ ilâha illallâhush-shabûrushing-syakûr. 7×
Lâ ilâha illallâhu dzal-jâli wal-ikrâm. 7×
Lâ ilâha illallâhul-‘aliyyul-kabîr. 7×
Lâ ilâha illallâhul-wahhâbul-ghaffâr. 7×
Lâ ilâha illallâhu rabbus-samâwâti sab‘i wa rabbul-‘arsyil-‘azhîm. 7×

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin. 7×
Salâmun ‘alâika yâ rasûlallâh.
Salâmun ‘alâika yâ nabiyyallâh.
Salâmun ‘alâika yâ habîballâh.

Al-Fâtihah (7×)`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Al-Fatihah (7×)
Untuk hadirat penghulu kami Muhammad ﷺ

Tidak ada tuhan selain Allah, Raja yang Benar yang Menerangkan. 7×
Tidak ada tuhan selain Allah Yang Maha Esa lagi Maha Perkasa. 7×
Tidak ada tuhan selain Allah Yang Maha Sabar lagi Maha Mensyukuri. 7×
Tidak ada tuhan selain Allah Yang Maha Agung lagi Maha Penuh Kemuliaan. 7×
Tidak ada tuhan selain Allah Yang Maha Tinggi lagi Maha Besar. 7×
Tidak ada tuhan selain Allah Yang Maha Pemberi lagi Maha Pengampun. 7×
Tidak ada tuhan selain Allah, Tuhan tujuh langit dan Tuhan arsy yang agung. 7×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad. 7×
Kesejahteraan tercurah padamu, wahai Rasulullah.
Kesejahteraan tercurah padamu, wahai Nabi Allah.
Kesejahteraan tercurah padamu, wahai Kekasih Allah.

Al-Fatihah (7×)`,
  },
  {
    title: "Ratib al-Aydrus (Syamsis Syumus)",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

اَلْفَاتِحَةُ (×٧)
إِلَى حَضْرَةِ سَيِّدِنَا مُحَمَّدٍ ﷺ وَإِلَى حُرُمَاتِهِ وَحُرُمَاتِ أَهْلِ بَيْتِهِ وَصَحْبِهِ

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُرْضِيْكَ بِهَا عَنَّا وَتَرْضَى عَنَّا فِيْهَا ×٧

يَا حَيُّ يَا قَيُّوْمُ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ، بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ ×٧

سُبْحَانَ اللهِ الْعَظِيْمِ وَبِحَمْدِهِ (×٧)

لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ ×٧

اَلْفَاتِحَةُ (×٧)`,
    latin: `Bismillâhir-rahmânir-rahîm

Al-Fâtihah (7×)
Ilâ hadhrati sayyidinâ muhammadin shallallâhu ‘alaihi wa sallama wa ilâ hurumâtihi wa hurumâti ahli baytihi wa shahbihi.

Allâhumma shalli ‘alâ sayyidinâ muhammadin shalâtan tardlâka bihâ ‘annâ wa tardlâ ‘annâ fîhâ. 7×

Yâ hayyu yâ qayyûm, yâ dzal-jâli wal-ikrâm, birohmatika yâ arhamar-râhimîn. 7×

Subhânallâhil-‘azhîm wa bihamdih. 7×

Lâ haula walâ quwwata illâ billâhil-‘aliyyil-‘azhîm. 7×

Al-Fâtihah (7×)`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Al-Fatihah (7×)
Untuk hadirat penghulu kami Muhammad ﷺ dan untuk kesucian beliau, kesucian keluarga beliau, dan para sahabat beliau.

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad, sholawat yang Engkau ridhai darinya dan Engkau ridhai karenanya. 7×

Wahai Yang Maha Hidup, Wahai Yang Maha Terus-Menerus mengurus, Wahai Dikuasa Kemuliaan dan Penghormatan, dengan rahmat-Mu, Wahai Yang Paling Penyayang di antara para penyayang. 7×

Maha Suci Allah Yang Maha Agung dan segala puji bagi-Nya. 7×

Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung. 7×

Al-Fatihah (7×)`,
  },
  {
    title: "Ratib Syaikhona Kholil",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

أَسْتَغْفِرُ اللهَ الْعَظِيْمَ الَّذِيْ لَا إِلٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّوْمَ وَأَتُوْبُ إِلَيْهِ ×٣

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ×٣

لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ ×٧

لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، أَنْجَزَ وَعْدَهُ وَنَصَرَ عَبْدَهُ وَهَزَمَ الْأَحْزَابَ وَحْدَهُ ×٧

سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيْمِ ×٧

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ×٧

لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ ×٧

اَلْفَاتِحَةُ (×٧)`,
    latin: `Bismillâhir-rahmânir-rahîm

Astaghfirullâhal-‘azhîmal-ladzî lâ ilâha illâ huwal-hayyul-qayyûm wa atûbu ilaih. 3×

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin. 3×

Lâ ilâha illallâhu wahdahu lâ syarîka lah, lahul-mulku wa lahul-hamdu wa huwa ‘alâ kulli syai’in qadîr. 7×

Lâ ilâha illallâhu wahdahu lâ syarîka lah, anjaza wa’dahu wa nasara ‘abdahû wahazamal-ahzâba wahdahu. 7×

Subhânallâhi wa bihamdih, subhânallahil-‘azhîm. 7×

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin. 7×

Lâ haula walâ quwwata illâ billâhil-‘aliyyil-‘azhîm. 7×

Al-Fâtihah (7×)`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Aku memohon ampun kepada Allah Yang Maha Agung, yang tidak ada tuhan selain Dia, Yang Maha Hidup lagi Maha Terus-Menerus mengurus (makhluk-Nya), dan aku bertaubat kepada-Nya. 3×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad. 3×

Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Milik-Nya segala kerajaan dan bagi-Nya segala puji, dan Dia Maha Kuasa atas segala sesuatu. 7×

Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Dia menepati janji-Nya, menolong hamba-Nya, dan mengalahkan para musuh dengan kekuatan-Nya sendiri. 7×

Maha Suci Allah dan segala puji bagi-Nya. Maha Suci Allah Yang Maha Agung. 7×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad. 7×

Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung. 7×

Al-Fatihah (7×)`,
  },

  // ============================================================
  // HIZIB
  // ============================================================
  {
    title: "Hizib Autad",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

اَللهُ الْكَافِيْ رَبُّنَا الْكَافِيْ ۞ قَصَدْنَا الْكَافِيْ وَجَدْنَا الْكَافِيْ
رَبَّنَا الْكَافِيْ ۞ نِعْمَ الْكَافِيْ الْكَافِيْ ۞ الْكَافِيْ يُكْفِيْنَا
وَأَحْسَنَ اللهُ الْكَافِيْ ۞ وَكَفَى اللهُ الْكَافِيْ ۞ وَيَكْفِيْنَا اللهُ الْكَافِيْ
وَهُوَ خَيْرُ الْكَافِيْنَ الْكَافِيْ ۞ وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِيْنَ

يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ ۞ يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ ۞ يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ
أَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ ۞ وَلَا تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ أَبَدًا

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُغْرِسُ بِهَا لَنَا فِي الدُّنْيَا نَخْلَةً وَفِي الْاٰخِرَةِ دَرَجَةً عَالِيَةً
وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيْمًا كَثِيْرًا

وَآخِرُ دَعْوَانَا أَنِ الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ`,
    latin: `Bismillâhir-rahmânir-rahîm

Allâhul-kâfî rabbunal-kâfî. Qashadnal-kâfî wajadnal-kâfî.
Rabbanal-kâfî. Ni’mal-kâfil-kâfî. Al-kâfî yukfînâ.
Wa ahsanallâhul-kâfî. Wa kafâllâhul-kâfî. Wa yakfînâllâhul-kâfî.
Wa huwa khairul-kâfînal-kâfî. Wa shallallâhu ‘alâ sayyidinâ muhammadin wa ‘alâ âlihi wa shahbihi ajma‘în.

Yâ hayyu yâ qayyûm birohmatika astaghîts. Yâ hayyu yâ qayyûm birohmatika astaghîts. Yâ hayyu yâ qayyûm birohmatika astaghîts.
Ashlih lî sya’nî kullahû wa lâ takilnî ilâ nafsî thorfata ‘ainin abadâ.

Allâhumma shalli ‘alâ sayyidinâ muhammadin shalâtan tughsiru bihâ lanâ fid-dunyâ nakhlatan wa fil-âkhirati darajatan ‘âliyah.
Wa shallallâhu ‘alâ sayyidinâ muhammadin wa ‘alâ âlihi wa shahbihi wa sallama taslîman katsîran.

Wa âkhiru da‘wânâ anil-hamdu lillâhi rabbil-‘âlamîn.`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Allah Yang Mencukupi, Tuhan kami Yang Mencukupi. Kami mencari yang Mencukupi, kami mendapat yang Mencukupi.
Tuhan kami Yang Mencukupi. Nikmatlah Yang Mencukupi, Yang Mencukupi itu. Yang Mencukupi mencukupi kami.
Dan Allah sebaik-baik Yang Mencukupi. Dan Allah telah mencukupi. Dan Allah mencukupi kami.
Dan Dia sebaik-baik Yang Mencukupi. Dan semoga Allah melimpahkan sholawat kepada penghulu kami Muhammad dan keluarga serta sahabat beliau semuanya.

Wahai Yang Maha Hidup, Wahai Yang Maha Terus-Menerus mengurus, dengan rahmat-Mu aku memohon pertolongan. Wahai Yang Maha Hidup, Wahai Yang Maha Terus-Menerus mengurus, dengan rahmat-Mu aku memohon pertolongan. Wahai Yang Maha Hidup, Wahai Yang Maha Terus-Menerus mengurus, dengan rahmat-Mu aku memohon pertolongan.
Perbaikilah urusanku seluruhnya dan janganlah Engkau serahkan aku kepada diriku sendiri sedetik pun selamanya.

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad, sholawat yang dengannya Engkau tanamkan untuk kami di dunia pohon kurma dan di akhirat derajat yang tinggi.
Dan semoga Allah melimpahkan sholawat kepada penghulu kami Muhammad dan keluarga serta sahabat beliau, dan semoga keselamatan tercurah dengan limpah.

Dan akhir seruan kami adalah segala puji bagi Allah, Tuhan semesta alam.`,
  },
  {
    title: "Hizib Bahr",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

يَا اللهُ يَا عَلِيُّ يَا عَظِيْمُ يَا حَلِيْمُ يَا عَلِيْمُ
يَا كَرِيْمُ يَا وَدُوْدُ يَا مَجِيْدُ يَا مُبِيْنُ يَا رَحِيْمُ
يَا دَائِمُ يَا قَيُّوْمُ يَا مُنْعِمُ يَا مُهَيْمِنُ يَا رَقِيْبُ
يَا مُجِيْبُ يَا سَمِيْعُ يَا بَصِيْرُ يَا حَكِيْمُ يَا شَكُوْرُ
يَا كَرِيْمُ يَا رَحِيْمُ يَا سَتَّارُ يَا غَفَّارُ يَا جَبَّارُ
يَا قَانِتُ يَا مُصَلِّي عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ

يَا مُبَدِّلَ السَّيِّئَاتِ حَسَنَاتٍ يَا مُبَدِّلَ الظُّلُمَاتِ نُوْرًا
يَا مُبَدِّلَ الْخَوْفِ أَمْنًا يَا مُبَدِّلَ الْعُسْرِ يُسْرًا
يَا مُبَدِّلَ الْحَسْرَةِ رِضًا يَا مُبَدِّلَ الْهَمِّ فَرَحًا
يَا مُبَدِّلَ الْمَرَضِ صِحَّةً يَا مُبَدِّلَ الْفَقْرِ غِنًى

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيْمًا كَثِيْرًا

وَآخِرُ دَعْوَانَا أَنِ الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ`,
    latin: `Bismillâhir-rahmânir-rahîm

Yâ Allâhu yâ ‘aliyyu yâ ‘adhîmu yâ halîmu yâ ‘alîm.
Yâ karîmu yâ wadûdu yâ majîdu yâ mubînu yâ rahîm.
Yâ dâ’imu yâ qayyûmu yâ mun’imu yâ muhaiminu yâ raqîb.
Yâ mujîbu yâ samî’u yâ bashîru yâ hakîmu yâ syakûr.
Yâ karîmu yâ rahîm yâ sattâru yâ ghaffâru yâ jabâr.
Yâ qânitu yâ mushallî ‘alâ muhammadin wa âli muhammadin.

Yâ mubaddilas-sayyi’âti hasanât. Yâ mubaddiladh-dhulûmâti nûrâ.
Yâ mubaddilal-khaufi amnâ. Yâ mubaddilal-‘usri yusrâ.
Yâ mubaddilal-hasrati ridlâ. Yâ mubaddilal-hammi farahâ.
Yâ mubaddilal-maradhi shihhâ. Yâ mubaddilal-faqlri ghinâ.

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Wa shallallâhu ‘alâ sayyidinâ muhammadin wa ‘alâ âlihi wa shahbihi wa sallama taslîman katsîran.

Wa âkhiru da‘wânâ anil-hamdu lillâhi rabbil-‘âlamîn.`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Wahai Allah, Wahai Yang Maha Tinggi, Wahai Yang Maha Agung, Wahai Yang Maha Lembut, Wahai Yang Maha Mengetahui.
Wahai Yang Maha Pemurah, Wahai Yang Maha Cinta, Wahai Yang Maha Mulia, Wahai Yang Maha Menerangkan, Wahai Yang Maha Penyayang.
Wahai Yang Maha Terus-Menerus, Wahai Yang Maha Terus-Menerus mengurus, Wahai Yang Maha Pemberi Nikmat, Wahai Yang Maha Memelihara, Wahai Yang Maha Mengawasi.
Wahai Yang Maha Memperkenankan, Wahai Yang Maha Mendengar, Wahai Yang Maha Melihat, Wahai Yang Maha Bijaksana, Wahai Yang Maha Mensyukuri.
Wahai Yang Maha Pemurah, Wahai Yang Maha Penyayang, Wahai Yang Maha Menutupi, Wahai Yang Maha Pengampun, Wahai Yang Maha Memaksa.
Wahai Yang Maha Taat, Wahai Yang Maha Melimpahkan sholawat kepada Muhammad dan keluarga Muhammad.

Wahai Yang Maha Mengubah keburukan menjadi kebaikan. Wahai Yang Maha Mengubah kegelapan menjadi cahaya.
Wahai Yang Maha Mengubah ketakutan menjadi keamanan. Wahai Yang Maha Mengubah kesulitan menjadi kemudahan.
Wahai Yang Maha Mengubah kekecewaan menjadi kerelaan. Wahai Yang Maha Mengubah kegelisahan menjadi kegembiraan.
Wahai Yang Maha Mengubah penyakit menjadi sehat. Wahai Yang Maha Mengubah kefakiran menjadi kekayaan.

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Dan semoga Allah melimpahkan sholawat kepada penghulu kami Muhammad dan keluarga serta sahabat beliau, dan semoga keselamatan tercurah dengan limpah.

Dan akhir seruan kami adalah segala puji bagi Allah, Tuhan semesta alam.`,
  },
  {
    title: "Hizib Nawawi",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

اللهُ أَكْبَرُ أَقُوْلُ عَلَى نَفْسِيْ وَعَلَى دِيْنِيْ وَعَلَى أَهْلِيْ وَعَلَى أَوْلَادِيْ وَعَلَى مَالِيْ وَعَلَى أَصْحَابِيْ وَعَلَى أَدْيَانِهِمْ وَعَلَى أَمْوَالِهِمْ أَلْفَ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ

بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
يَا مُنْزِلَ السَّكِيْنَةِ عَلَى الْقُلُوْبِ وَيَا مُدْخِلَ الْحُبِّ فِي الْقُلُوْبِ وَيَا مُخْرِجَ الْحُبِّ مِنَ الْقُلُوْبِ وَيَا مُنْزِلَ التَّوْقِيْعِ فِي الْقُلُوْبِ وَيَا مُدْخِلَ الْبَشَارَةِ فِي الْقُلُوْبِ وَيَا مُدْخِلَ الشَّوْقِ فِي الْقُلُوْبِ وَيَا مُنْزِلَ الرَّوْحِ وَالرَّاحَةِ عَلَى الْقُلُوْبِ وَيَا مُنْزِلَ الطَّمْعِ فِي الْقُلُوْبِ وَيَا مُدْخِلَ الْوَجْدِ فِي الْقُلُوْبِ وَيَا مُنْزِلَ النُّوْرِ فِي الْقُلُوْبِ وَيَا مُدْخِلَ الْإِيْمَانَ فِي الْقُلُوْبِ وَيَا مُنْزِلَ الْمَحَبَّةِ فِي الْقُلُوْبِ وَيَا مُدْخِلَ السَّكِيْنَةِ فِي الْقُلُوْبِ
صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ

يَا مُبَدِّلَ السَّيِّئَاتِ حَسَنَاتٍ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
يَا مُبَدِّلَ الظُّلُمَاتِ نُوْرًا صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
يَا مُبَدِّلَ الْخَوْفِ أَمْنًا صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
يَا مُبَدِّلَ الْعُسْرِ يُسْرًا صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
يَا مُبَدِّلَ الْمَرَضِ صِحَّةً صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
يَا مُبَدِّلَ الْفَقْرِ غِنًى صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
يَا مُبَدِّلَ الْهَمِّ فَرَحًا صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
يَا مُبَدِّلَ الْحَسْرَةِ رِضًا صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ

وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيْمًا كَثِيْرًا

وَآخِرُ دَعْوَانَا أَنِ الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ`,
    latin: `Bismillâhir-rahmânir-rahîm

Allâhu akbaru aqûlu ‘alâ nafsî wa ‘alâ dînî wa ‘alâ ahlî wa ‘alâ aulâdî wa ‘alâ mâlî wa ‘alâ ash-hâbî wa ‘alâ adyânihim wa ‘alâ amwâlihim alf lâ haula walâ quwwata illâ billâhil-‘aliyyil-‘azhîm.

Bismillâhir-rahmânir-rahîm
Yâ munzilas-sakînati ‘alal-qulûb wa yâ mudkhilal-hubbi fil-qulûb wa yâ mukhrijal-hubbi minal-qulûb wa yâ munzilat-tauqî’i fil-qulûb wa yâ mudkhilal-basyârati fil-qulûb wa yâ mudkhilasy-syauqi fil-qulûb wa yâ munzilar-rôhi war-râhati ‘alal-qulûb wa yâ munzhilath-tho’mi fil-qulûb wa yâ mudkhilal-wajdi fil-qulûb wa yâ munzilan-nûri fil-qulûb wa yâ mudkhilal-îmâna fil-qulûb wa yâ munzhilal-mahabbati fil-qulûb wa yâ mudkhilas-sakînati fil-qulûb
Shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.

Yâ mubaddilas-sayyi’âti hasanât shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Yâ mubaddiladh-dhulûmâti nûrâ shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Yâ mubaddilal-khaufi amnâ shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Yâ mubaddilal-‘usri yusrâ shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Yâ mubaddilal-maradhi shihhâ shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Yâ mubaddilal-faqlri ghinâ shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Yâ mubaddilal-hammi farahâ shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.
Yâ mubaddilal-hasrati ridlâ shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.

Wa shallallâhu ‘alâ sayyidinâ muhammadin wa ‘alâ âlihi wa shahbihi wa sallama taslîman katsîran.

Wa âkhiru da‘wânâ anil-hamdu lillâhi rabbil-‘âlamîn.`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Allah Maha Besar. Aku mengatakan untuk diriku, agamaku, keluargaku, anak-anakku, hartaku, sahabat-sahabatku, agama mereka, dan harta mereka: seribu kali tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.

Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
Wahai Yang Menurunkan ketenangan ke dalam hati, Wahai yang memasukkan cinta ke dalam hati, Wahai yang mengeluarkan cinta dari hati, Wahai yang menurunkan penegasan ke dalam hati, Wahai yang memasukkan kabar gembira ke dalam hati, Wahai yang memasukkan kerinduan ke dalam hati, Wahai yang menurunkan ketenangan dan kenyamanan ke dalam hati, Wahai yang menurunkan harapan ke dalam hati, Wahai yang memasukkan keharuan ke dalam hati, Wahai yang menurunkan cahaya ke dalam hati, Wahai yang memasukkan iman ke dalam hati, Wahai yang menurunkan kasih sayang ke dalam hati, Wahai yang memasukkan ketenangan ke dalam hati.
Limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.

Wahai Yang Mengubah keburukan menjadi kebaikan, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Wahai Yang Mengubah kegelapan menjadi cahaya, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Wahai Yang Mengubah ketakutan menjadi keamanan, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Wahai Yang Mengubah kesulitan menjadi kemudahan, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Wahai Yang Mengubah penyakit menjadi sehat, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Wahai Yang Mengubah kefakiran menjadi kekayaan, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Wahai Yang Mengubah kegelisahan menjadi kegembiraan, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.
Wahai Yang Mengubah kekecewaan menjadi kerelaan, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.

Dan semoga Allah melimpahkan sholawat kepada penghulu kami Muhammad dan keluarga serta sahabat beliau, dan semoga keselamatan tercurah dengan limpah.

Dan akhir seruan kami adalah segala puji bagi Allah, Tuhan semesta alam.`,
  },
  {
    title: "Hizib Nashar (asy-Syadzili)",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

اَللهُمَّ بِسَطْوَةِ جَبَرُوْتِ قَهْرِكَ، وَبِسُرْعَةِ إِغَاثَةِ نَصْرِكَ، وَبِغِيْرَتِكَ لِانْتِهَاكِ حُرُمَاتِكَ، وَبِحِمَايَتِكَ لِمَنِ احْتَمَى بِآيَاتِكَ، أَنْ تَصْرِفَ عَنَّا هَذِهِ الْبَلَايَا وَالْمُصِيْبَاتِ وَالْآفَاتِ الدَّائِرَةِ بِمَا شِئْتَ وَقَضَيْتَ

وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيْمًا كَثِيْرًا

يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ ×٧

وَآخِرُ دَعْوَانَا أَنِ الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ`,
    latin: `Bismillâhir-rahmânir-rahîm

Allâhumma bisathwati jabarûti qahrika, wa bisur’ati ighâtsati nashrika, wa bighîratika lintihâki hurumâtika, wa bihimâyatika limanihtamâ biâyâtika, an tashrifa ‘annâ hâdzihil-balâya wal-mushibâtil-âfatid-dâ’irati bimâ syi’ta wa qadaita.

Wa shallallâhu ‘alâ sayyidinâ muhammadin wa ‘alâ âlihi wa shahbihi wa sallama taslîman katsîran.

Yâ hayyu yâ qayyûm birohmatika astaghîts. 7×

Wa âkhiru da‘wânâ anil-hamdu lillâhi rabbil-‘âlamîn.`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Ya Allah, dengan kekuasaan-Mu yang Maha Perkasa, dengan segeranya pertolongan-Mu, dengan cemburu-Mu terhadap pelanggaran kesucian-Mu, dengan perlindungan-Mu terhadap orang yang berlindung dengan ayat-ayat-Mu, agar Engkau palingkan dari kami bencana, musibah, dan marabahaya yang berputar ini dengan apa yang Engkau kehendaki dan Engkau tentukan.

Dan semoga Allah melimpahkan sholawat kepada penghulu kami Muhammad dan keluarga serta sahabat beliau, dan semoga keselamatan tercurah dengan limpah.

Wahai Yang Maha Hidup, Wahai Yang Maha Terus-Menerus mengurus, dengan rahmat-Mu aku memohon pertolongan. 7×

Dan akhir seruan kami adalah segala puji bagi Allah, Tuhan semesta alam.`,
  },
  {
    title: "Hizib Sakran",
    arab: `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

اَللهُمَّ إِنِّي احْتَطْتُ بِدَرْبِ اللهِ، طُوْلُهُ مَا شَاءَ اللهُ، قُفْلُهُ لَا إِلٰهَ إِلَّا اللهُ، بَابُهُ مُحَمَّدٌ رَسُوْلُ اللهِ، صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ

اَللهُمَّ إِنِّي احْتَطْتُ بِدَرْبِ اللهِ، فَاحْفَظْنِيْ وَاحْفَظْ بَيْتِيْ وَوَلَدِيْ وَأَهْلِيْ وَمَالِيْ وَكُلَّ مَنْ لِيْ عَلَيْهِ حَقٌّ

اَللهُمَّ احْمِنَا بِحِمَايَتِكَ وَاحْفَظْنَا بِحِفْظِكَ وَعِنْدَكَ فِي أَمَانِكَ وَأَمَانِيْكَ

يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ ×٧

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ

وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيْمًا كَثِيْرًا

وَآخِرُ دَعْوَانَا أَنِ الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ`,
    latin: `Bismillâhir-rahmânir-rahîm

Allâhumma innîhtath-tu bidarbillâhi, thûluhu mâ syâ’allâhu, qufluhu lâ ilâha illallâhu, bâbuhu muhammadun rasûlullâhi, shallallâhu ‘alaihi wa sallama.

Allâhumma innîhtath-tu bidarbillâhi, fa hfazhnî wa hfazh baitî wa waladî wa ahlî wa mâlî wa kulla man lî ‘alaihi haqq.

Allâhumma hmimâ bihimâyatika wa hfazhnî bi hifzhika wa ‘indaka fî amânika wa amânik.

Yâ hayyu yâ qayyûm birohmatika astaghîts. 7×

Allâhumma shalli ‘alâ sayyidinâ muhammadin wa ‘alâ âli sayyidinâ muhammadin.

Wa shallallâhu ‘alâ sayyidinâ muhammadin wa ‘alâ âlihi wa shahbihi wa sallama taslîman katsîran.

Wa âkhiru da‘wânâ anil-hamdu lillâhi rabbil-‘âlamîn.`,
    translation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Ya Allah, sesungguhnya aku berlindung dengan jalan Allah, panjangnya sesuai kehendak Allah, kuncinya tidak ada tuhan selain Allah, pintunya adalah Muhammad Rasulullah, semoga Allah melimpahkan sholawat dan salam kepadanya.

Ya Allah, sesungguhnya aku berlindung dengan jalan Allah, maka lindungilah aku, lindungilah rumahku, anak-anakku, keluargaku, hartaku, dan semua orang yang memiliki hak dariku.

Ya Allah, lindungilah kami dengan perlindungan-Mu, jaga kami dengan penjagaan-Mu, dan di sisi-Mu kami berada dalam keamanan dan harapan-Mu.

Wahai Yang Maha Hidup, Wahai Yang Maha Terus-Menerus mengurus, dengan rahmat-Mu aku memohon pertolongan. 7×

Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.

Dan semoga Allah melimpahkan sholawat kepada penghulu kami Muhammad dan keluarga serta sahabat beliau, dan semoga keselamatan tercurah dengan limpah.

Dan akhir seruan kami adalah segala puji bagi Allah, Tuhan semesta alam.`,
  },
];

async function updateAllShortWirid() {
  let updated = 0;
  let notFound = 0;

  for (const data of updates) {
    const items = await db
      .select()
      .from(wiridItems)
      .where(eq(wiridItems.title, data.title));

    if (items.length === 0) {
      console.log(`⚠️  Not found: ${data.title}`);
      notFound++;
      continue;
    }

    const item = items[0];
    const oldLen = item.arab.length;
    
    await db
      .update(wiridItems)
      .set({
        arab: data.arab,
        latin: data.latin,
        translation: data.translation,
      })
      .where(eq(wiridItems.id, item.id));

    console.log(`✅ ${data.title}: ${oldLen} → ${data.arab.length} chars`);
    updated++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Not found: ${notFound}`);
  
  await client.end();
}

updateAllShortWirid().catch((e) => {
  console.error("Update failed:", e);
  process.exit(1);
});
