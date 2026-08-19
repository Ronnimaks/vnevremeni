/**
 * Заслон на выкладке: ни один файл сайта не должен быть слишком тяжёлым.
 *
 * Откуда правило. Личный кабинет приезжал одним файлом на 596 килобайт и у
 * заказчицы не открывался ни разу, при том что сам сайт открывался нормально —
 * у него самый крупный файл 97 килобайт. Мобильная связь с VPN длинную передачу
 * не вытягивает, короткую вытягивает. Разница была только в размере куска.
 *
 * Чтобы это не вернулось через полгода, когда про тот разговор никто не вспомнит,
 * проверка стоит на выкладке: собралось что-то тяжелее предела — сборка не проходит,
 * правка на сайт не уезжает.
 *
 * Считается вес именно в пути, то есть после сжатия, — столько и поедет к человеку.
 *
 * Запуск:  node scripts/proverka-razmerov.mjs
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const sborka = join(koren, 'dist');

// Всё, без чего страница не покажется и не заработает. Здесь предел строгий.
const KOD = new Set(['.html', '.js', '.mjs', '.css', '.json', '.txt', '.yml', '.php']);
const PREDEL_KOD = 150 * 1024;

// Картинки, шрифты, видео. Они не задерживают показ страницы, поэтому здесь
// не запрет, а предупреждение — чтобы вес не рос незаметно.
const PREDEL_MEDIA = 300 * 1024;

/**
 * Известные исключения. Каждое — с причиной, иначе список за год превратится
 * в свалку, куда сваливают всё неудобное.
 */
const ISKLYUCHENIYA = [
  {
    put: 'kabinet/sveltia-cms.js',
    prichina: 'запасной ход кабинета: берётся целиком, только если не доехали куски',
  },
  {
    put: 'kabinet/fonts/material-symbols-latin-wght-normal.woff2',
    prichina: 'шрифт значков кабинета; по именам не режется, нужен отдельный подход',
  },
];

function vseFajly(papka) {
  const spisok = [];
  for (const imya of readdirSync(papka)) {
    const polnyj = join(papka, imya);
    if (statSync(polnyj).isDirectory()) spisok.push(...vseFajly(polnyj));
    else spisok.push(polnyj);
  }
  return spisok;
}

const kb = (n) => Math.round(n / 1024);

let narusheniy = 0;
const predupredil = [];

for (const fajl of vseFajly(sborka).sort()) {
  const otnositelnyj = relative(sborka, fajl).replace(/\\/g, '/');
  const rasshirenie = extname(fajl).toLowerCase();
  const soderzhimoe = readFileSync(fajl);

  // Картинки, видео и шрифты уже сжаты — повторное сжатие им ничего не даёт,
  // и по проводу они едут как есть.
  const szhimaemyj = KOD.has(rasshirenie);
  const vPuti = szhimaemyj ? gzipSync(soderzhimoe, { level: 6 }).length : soderzhimoe.length;

  const isklyuchenie = ISKLYUCHENIYA.find((i) => i.put === otnositelnyj);
  const predel = szhimaemyj ? PREDEL_KOD : PREDEL_MEDIA;

  if (vPuti <= predel) continue;

  if (isklyuchenie) {
    console.log(`  разрешено: ${otnositelnyj} — ${kb(vPuti)} КБ (${isklyuchenie.prichina})`);
    continue;
  }

  if (szhimaemyj) {
    console.error(`  СЛИШКОМ ТЯЖЁЛЫЙ: ${otnositelnyj} — ${kb(vPuti)} КБ в пути, предел ${kb(predel)} КБ`);
    narusheniy++;
  } else {
    predupredil.push(`  тяжеловат: ${otnositelnyj} — ${kb(vPuti)} КБ`);
  }
}

console.log('');
if (predupredil.length) {
  console.log('Тяжёлые картинки и видео (показ страницы не задерживают):');
  predupredil.forEach((s) => console.log(s));
  console.log('');
}

if (narusheniy > 0) {
  console.error(
    `Сборка остановлена: ${narusheniy} файл(ов) тяжелее ${kb(PREDEL_KOD)} КБ.\n` +
      'Такой файл не доедет до части гостей — разрежьте его на куски\n' +
      '(пример: scripts/narezat-kabinet.mjs) или уберите лишнее.\n'
  );
  process.exit(1);
}

console.log(`Проверка веса пройдена: ничего тяжелее ${kb(PREDEL_KOD)} КБ в пути.`);
