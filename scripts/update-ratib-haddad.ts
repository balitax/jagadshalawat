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

// Find the Ratib al-Haddad item and update it with complete content
async function updateRatibAlHaddad() {
  console.log("Finding Ratib al-Haddad item...");

  const items = await db
    .select()
    .from(wiridItems)
    .where(eq(wiridItems.title, "Ratib al-Haddad"));

  if (items.length === 0) {
    console.error("Ratib al-Haddad not found!");
    await client.end();
    return;
  }

  const item = items[0];
  console.log(`Found: ${item.id} (current arab length: ${item.arab.length})`);

  const completeArab = `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

أَعُوْذُ بِاللهِ مِنَ الشَّيْطٰنِ الرَّجِيْمِ

اَلْفَاتِحَةُ (7×)
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَۙ
الرَّحْمٰنِ الرَّحِيْمِۙ
مٰلِكِ يَوْمِ الدِّيْنِۗ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِيْنُۚ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَۙ
صِرَاطَ الَّذِيْنَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّآلِّيْنَۗ

اٰيَةُ الْكُرْسِيِّ (1×)
اَللّٰهُ لَآ إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمٰوٰتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِيْ يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيْهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيْطُوْنَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمٰوٰتِ وَالْأَرْضَ ۖ وَلَا يَؤُوْدُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيْمُ

سُوْرَةُ الْإِخْلَاصِ (3×)
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
قُلْ هُوَ اللهُ أَحَدٌ ۝ اَللهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ

سُوْرَةُ الْفَلَقِ (3×)
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
قُلْ أَعُوْذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ

سُوْرَةُ النَّاسِ (3×)
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
قُلْ أَعُوْذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِيْ يُوَسْوِسُ فِي صُدُوْرِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ

اَلِاسْتِغْفَارُ (3×)
أَسْتَغْفِرُ اللهَ الْعَظِيْمَ الَّذِيْ لَا إِلٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّوْمَ وَأَتُوْبُ إِلَيْهِ

الصَّلَاةُ عَلَى النَّبِيِّ (3×)
اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ

لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ (1×)

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُرْضِيْكَ بِهَا عَنَّا وَتَرْضَى عَنَّا فِيْهَا وَتُصْلِحُ بِهَا أَمْرَنَا وَتَنْفَعُنَا بِهَا فِيْمَا أَهَّمَنَا اللهُمَّ صَلِّ عَلَيْهِ وَسَلِّمْ وَبَارِكْ عَلَيْهِ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيْمًا كَثِيْرًا

اَلْأَسْمَاءُ الْحُسْنَى (1×)
اللهُ الَّذِيْ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ، وَلَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمٰوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِيْ يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيْهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيْطُوْنَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَآءَ، وَسِعَ كُرْسِيُّهُ السَّمٰوَاتِ وَالْأَرْضَ، وَلَا يَؤُوْدُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيْمُ

إِلٰهِيْ عَبْدٌ ظَلِيْمٌ، لَا يَمْلِكُ لِنَفْسِهِ نَفْعًا وَلَا ضَرًّا، وَلَا مَوْتًا وَلَا حَيَاةً وَلَا نُشُوْرًا، وَإِنَّهُ لَيَرَى بَعْضَ أَعْيَانِ الظُّلْمِ، فَيَسْتَعِيْذُكَ رَبَّهُ مِنْهَا، فَأَعِيْذُهُ بِكَلِمَاتِكَ التَّامَّاتِ الَّتِيْ لَا يُجَاوِزُهُنَّ بَرٌّ وَلَا فَاجِرٌ، وَبِكَلِمَاتِكَ التَّامَّةِ كُلِّهَا الَّتِيْ مَلَأَتْ أَرْكَانَ عَرْشِكَ، وَبِاسْمِكَ الْأَعْظَمِ الْأَعْظَمِ الْأَعْظَمِ، وَبِنُوْرِ وَجْهِكَ الَّذِيْ مَلَأَ أَسْاسَ عَرْشِكَ، أَعُوْذُ بِكَ مِنْ أَنْ تَغْلِبَنِيْ الْخَطَايَا وَتَجْرِيَ عَلَيَّ مَا لَا أُحِبُّ، وَأَسْأَلُكَ أَنْ تُعْطِيَنِيْ بِرَحْمَتِكَ مَا أَسْأَلُكَ، وَأَعُوْذُ بِكَ مِنْ عَذَابِكَ وَسَخَطِكَ

اَللهُمَّ إِنِّيْ أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْاٰخِرَةِ، اَللهُمَّ إِنِّيْ أَسْأَلُكَ الْعَافِيَةَ فِيْ دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ، اَللهُمَّ اسْتُرْ عَوْرَاتِيْ وَآمِنْ رَوْعَاتِيْ، اَللهُمَّ احْفَظْنِيْ مِنْ أَمَامِيْ وَمِنْ خَلْفِيْ وَعَنْ يَمِيْنِيْ وَعَنْ شِمَالِيْ، وَمِنْ فَوْقِيْ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ

اَللهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوْءُ بِذَنْبِيْ فَاغْفِرْ لِيْ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ

اَللهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوْذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوْذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوْذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ

سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيْمِ (100×)

لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ (10×)

اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَحْوَالِ وَالْآفَاتِ وَتَقْضِيْ لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ وَتُطَهِّرُنَا بِهَا مِنْ جَمِيْعِ السَّيِّئَاتِ وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَيَاتِ مِنْ جَمِيْعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ، إِنَّهُ عَلَى مَا يَشَاءُ قَدِيْرٌ`;

  const completeLatin = `Bismillâhir-rahmânir-rahim

A'ûdzubillâhi minasy-syaithânir-rajîm

Al-Fâtihah (7×)
Bismillâhir-rahmânir-rahim
Alhamdu lillâhi rabbil-‘âlamîn, arrahmânir-rahîm, mâliki yawmid-dîn. Iyyâka na'budu wa iyyâka nasta'în. Ihdinash-shirâthal-mustaqîm, shirâthal-ladzîna an'amta 'alaihim ghairil-maghdhûbi 'alaihim wa ladh-dhâllîn.

Âyatul Kursî (1×)
Allâhu lâ ilâha illâ huwal-hayyul-qayyûm, lâ ta'khudzuhû sinatuw wa lâ naum, lahû mâ fis-samâwâti wa mâ fil-ard, man dzal-ladzî yasyfa'u 'indahû illâ bi'idznih, ya'lamu mâ baina aidîhim wa mâ khalfahum, wa lâ yuhîthûna bisyai'in min 'ilmihî illâ bi mâ syâ', wasi'a kursiyyuhus-samâwâti wal-ard, wa lâ ya'ûduhû hifzhuhumâ, wa huwal-'aliyyul-'azhîm.

Sûratul Ikhlâsh (3×)
Bismillâhir-rahmânir-rahim
Qul huwallâhu ahad, wallâhus-samad, lam yalid wa lam yûlad, wa lam yakun lahû kufuwan ahad.

Sûratul Falâq (3×)
Bismillâhir-rahmânir-rahim
Qul a'ûdzubi rabbil-falâq, min syarri mâ khalaq, wa min syarri gâsiqin idzâ waqab, wa min syarrin-naffâtsâti fil-'uqad, wa min syarri khâsidin idzâ hasad.

Sûratun Nâs (3×)
Bismillâhir-rahmânir-rahim
Qul a'ûdzubi rabbinnâs, malikinnâs, ilâhinnâs, min syarril-waswâsil-khannâs, alladzî yuwaswisu fî shudûrinnâs, minal-jinnati wannâs.

Al-Istighfâr (3×)
Astaghfirullâhal-'azhîmal-ladzî lâ ilâha illâ huwal-hayyul-qayyûm wa atûbu ilaih.

ash-Shalâtu 'alan-Nabiyy (3×)
Allâhumma sholli 'alâ sayyidinâ muhammadin wa 'alâ âli sayyidinâ muhammadin.

Lâ haula wa lâ quwwata illâ billâhil-'aliyyil-'azhîm (1×)

Allâhumma sholli 'alaihi wa sallim wa bârik 'alaihi wa 'alâ âlihî wa shahbihi wa sallim taslîman katsîran.

Al-Asmâul Husnâ (1×)
Allâhulladzî lâ ilâha illâ huwal-hayyul-qayyûm, lâ ta'khudzuhû sinatuw wa lâ naum, lahû mâ fis-samâwâti wa mâ fil-ard, man dzal-ladzî yasyfa'u 'indahû illâ bi'idznih, ya'lamu mâ baina aidîhim wa mâ khalfahum, wa lâ yuhîthûna bisyai'in min 'ilmihî illâ bi mâ syâ', wasi'a kursiyyuhus-samâwâti wal-ard, wa lâ ya'ûduhû hifzhuhumâ, wa huwal-'aliyyul-'azhîm.

Ilâhî 'abduzhalîm, lâ yamliku linafsihi naf'an wa lâ dharra, wa lâ mautan wa lâ hayâtan wa lâ nusyûra, wa innahû layarâ ba'da a'yânidh-dhulmi fayasta'îdzuka rabbahu minhu, fa a'îdzuhu bikalimâtikat-tâmmâtil-ladzî lâ yujâwizuhunna barrun wa lâ fâjirun, wa bikalimâtikat-tâmmati kulliha-l-ladzî mal'aat arkana 'arsyik, wa bismikal-a'dzhâmil-a'dzhâmil-a'dzhâm, wa binûri wajhikal-ladzî mal'a asâsa 'arsyik, a'ûdzu bika min an taghlibanil-khathâya wa tajriya 'alayya mâ lâ uhibbu, wa as'aluka an tu'thiyanî birohmatika mâ as'aluka, wa a'ûdzu bika min 'adzâbika wasakhdhika.

Allâhumma innî as'alukal-'âfiyata fid-dunyâ wal-âkhirati, allâhumma innî as'alukal-'âfiyata fî dînî wa dunyâya wa ahliyya wa mâlî, allâhummastur 'awrâtî wa âmin raw'âtî, allâhumma hfazhnî min amâmî wa min khalfî wa 'an yamînî wa 'an shimâlî, wa min fawqî, wa a'ûdzu bi'azhmathika an ugtâla min tahtî.

Allâhumma anta rabbî lâ ilâha illâ anta, khalaqtanî wa ana 'abduka, wa ana 'alâ 'ahdika wa wa'dika mâ istatha'tu, a'ûdzu bika min syarri mâ shana'tu, abû'u laka bi ni'matika 'alayya, wa abû'u bi dzambî faghfirlî fainnahu lâ yaghfirudz-dzunûba illâ anta.

Allâhumma innî a'ûdzu bika minal-hammi wal-hazan, wa a'ûdzu bika minal-'ajzi wal-kasal, wa a'ûdzu bika minal-jubni wal-bukhl, wa a'ûdzu bika ghalabatid-daini wa qahrir-rijâl.

Subhânallâhi wa bihamdih, subhânallahil-'azhîm (100×)

Lâ ilâha illallâhu wahdahu lâ syarîka lah, lahul-mulku wa lahul-hamdu wa huwa 'alâ kulli syai'in qadîr (10×).

Allâhumma sholli 'alâ sayyidinâ muhammadin shalâtan tunjiinâ bihâ min jamî'il-ahwâli wal-âfâti wa taqdhî lanâ bihâ jamî'al-hâjâti wa tuthahhirunâ bihâ min jamî'is-sayyi'âti wa tarfa'unâ bihâ 'indaka a'lad-darajâti wa tuballighunâ bihâ aqshâl-ghayâti min jamî'il-khairâti fil-hayâti wa ba'dal-mamâti, innahu 'alâ mâ yasyâ'u qadîr.`;

  const completeTranslation = `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang

Aku berlindung kepada Allah dari godaan syaitan yang terkutuk

Al-Fatihah (7×)
Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
Segala puji bagi Allah, Tuhan semesta alam.
Yang Maha Pengasih lagi Maha Penyayang.
Yang menguasai hari pembalasan.
Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami meminta pertolongan.
Tunjukilah kami jalan yang lurus,
yaitu jalan orang-orang yang Engkau beri nikmat kepada mereka, bukan jalan mereka yang dimurkai dan bukan pula jalan mereka yang sesat.

Ayat Kursi (1×)
Allah, tidak ada tuhan selain Dia. Dia Yang Maha Hidup lagi Maha Terus-Menerus mengurus (makhluk-Nya). Tidak mengantuk dan tidak tidur. Milik-Nya segala yang di langit dan di bumi. Tiada yang dapat memberi syafaat di sisi-Nya tanpa seizin-Nya. Dia mengetahui segala yang di hadapan mereka dan yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun dari ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat menjaga keduanya, dan Dia Maha Tinggi lagi Maha Agung.

Surah Al-Ikhlas (3×)
Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
Katakanlah: "Dialah Allah Yang Maha Esa.
Allah tempat bergantung.
Dia tidak beranak dan tidak pula diperanakkan.
Dan tidak ada seorang pun yang setara dengan Dia."

Surah Al-Falaq (3×)
Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) subuh,
dari kejahatan makhluk-Nya,
dan dari kejahatan gelap malam apabila telah gelap,
dan dari kejahatan perempuan-perempuan yang meniup pada buhul-buhul (tali),
dan dari kejahatan pendengki bila dia dengki."

Surah An-Nas (3×)
Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
Katakanlah: "Aku berlindung kepada Tuhan (pemelihara) manusia,
Raja (pemelihara) manusia,
Sembahan (pemelihara) manusia,
dari kejahatan (bisikan) syaitan yang biasa bersembunyi,
yang membisikkan (kejahatan) ke dalam dada manusia,
dari (golongan) jin dan manusia."

Istighfar (3×)
Aku memohon ampun kepada Allah Yang Maha Agung yang tidak ada tuhan selain Dia, Yang Maha Hidup lagi Maha Terus-Menerus mengurus (makhluk-Nya), dan aku bertaubat kepada-Nya.

Sholawat Nabi (3×)
Ya Allah, limpahkanlah sholawat kepada penghulu kami Muhammad dan keluarga penghulu kami Muhammad.

Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung (1×)

Ya Allah, limpahkanlah shalawat, salam, dan keberkahan kepada beliau, keluarga beliau, dan para sahabat beliau dengan penuh keselamatan.

Asmaul Husna (1×)
Allah, tidak ada tuhan selain Dia. Dia Yang Maha Hidup lagi Maha Terus-Menerus mengurus (makhluk-Nya). Tidak mengantuk dan tidak tidur. Milik-Nya segala yang di langit dan di bumi. Tiada yang dapat memberi syafaat di sisi-Nya tanpa seizin-Nya. Dia mengetahui segala yang di hadapan mereka dan yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun dari ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat menjaga keduanya, dan Dia Maha Tinggi lagi Maha Agung.

Ya Tuhanku, hamba-Mu ini adalah orang yang zalim, tidak mampu memberi manfaat maupun mudharat bagi dirinya sendiri, tidak mampu mati, hidup, dan tidak (pula) bangkit. Sesungguhnya hamba ini melihat sebagian kezaliman, maka hamba-Mu ini berlindung kepada-Mu dari kezaliman tersebut. Lindungilah hamba-Mu ini dengan kalimat-kalimat-Mu yang sempurna yang tidak dapat dilampaui oleh orang baik maupun orang fasik, dan dengan seluruh kalimat-kalimat-Mu yang sempurna yang telah memenuhi tiang-tiang arsy-Mu, dan dengan nama-Mu yang paling agung, paling agung, paling agung, dan dengan cahaya wajah-Mu yang telah memenuhi dasar arsy-Mu. Aku berlindung kepada-Mu dari kemarakan-Mu yang dapat menimpaku, dan dari siksa-Mu. Semoga Engkau ridha terhadapku karena aku telah mengingkari kezalimanku sendiri.

Ya Allah, sesungguhnya aku memohon kepada-Mu kesejahteraan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon kepada-Mu kesejahteraan dalam agamaku, duniaku, keluargaku, dan hartaku. Ya Allah, tutuplah aibku dan berikanlah aku rasa aman dari rasa takutku. Ya Allah, lindungilah aku dari arah depan, belakang, kanan, kiri, dan dari atas aku. Dan aku berlindung dengan kebesaran-Mu dari ditelan bumi (dari arah bawah).

Ya Allah, Engkau adalah Tuhanku, tidak ada tuhan selain Engkau. Engkau telah menciptakan aku dan aku adalah hamba-Mu. Dan aku akan menaati perintah-Mu dan menepati janji-Mu selama aku mampu. Aku berlindung kepada-Mu dari kejahatan perbuatan-Mu. Aku mengakui nikmat-Mu terhadapku dan aku mengakui dosaku, maka ampunilah aku. Sesungguhnya tidak ada yang mengampuni dosa-dosa kecuali Engkau.

Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kegelisahan dan kesedihan, dari kelemahan dan kemalasan, dari sifat pengecut dan kikir, dari beban hutang dan penindasan orang-orang.

Maha Suci Allah dan segala puji bagi-Nya. Maha Suci Allah Yang Maha Agung (100×).

Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Milik-Nya segala kerajaan dan bagi-Nya segala puji, dan Dia Maha Kuasa atas segala sesuatu (10×).

Ya Allah, limpahkanlah shalawat yang dapat menyelamatkan kami dari segala ketakutan dan penyakit, yang dapat memenuhi segala kebutuhan kami, yang dapat mensucikan diri kami dari segala keburukan, yang dapat mengangkat derajat kami ke tingkat tertinggi di sisi-Mu, dan yang dapat membawa kami kepada tujuan tertinggi dari segala kebaikan dalam kehidupan dan setelah mati. Sesungguhnya Dia Maha Kuasa atas segala sesuatu.`;

  await db
    .update(wiridItems)
    .set({
      arab: completeArab,
      latin: completeLatin,
      translation: completeTranslation,
    })
    .where(eq(wiridItems.id, item.id));

  console.log(`✓ Updated Ratib al-Haddad`);
  console.log(`  New arab length: ${completeArab.length} chars`);
  console.log(`  New latin length: ${completeLatin.length} chars`);
  console.log(`  New translation length: ${completeTranslation.length} chars`);

  await client.end();
}

updateRatibAlHaddad().catch((e) => {
  console.error("Update failed:", e);
  process.exit(1);
});
