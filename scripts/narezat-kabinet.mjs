/**
 * Нарезка кода личного кабинета на куски.
 *
 * Зачем. Редактор приезжает одним файлом почти в 600 килобайт (в сжатом виде).
 * Замер показал: с телефона заказчицы файлы до ста килобайт доходят стабильно,
 * а этот — не доходит вовсе, при том что сам сайт открывается. Разница только
 * в размере куска: у сайта самый крупный файл — 97 килобайт.
 *
 * Что делаем. Режем файл на части примерно по сто килобайт в пути. Страница
 * кабинета забирает их по очереди, при срыве повторяет только сорванный кусок,
 * а потом склеивает обратно и запускает. Склейка побайтовая, поэтому получается
 * ровно тот же файл — сверяется по контрольной сумме.
 *
 * Запуск:  node scripts/narezat-kabinet.mjs
 */

import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const istochnik = join(koren, 'public', 'kabinet', 'sveltia-cms.js');
const papka = join(koren, 'public', 'kabinet', 'chasti');

// Столько должен весить кусок после сжатия при передаче.
// Взято с запасом от ста килобайт: сжимаемость по файлу гуляет, и без запаса
// отдельные куски вылезали за предел.
const PREDEL_V_PUTI = 80 * 1024;

const summa = (buf) => createHash('sha256').update(buf).digest('hex');

const ishodnyj = readFileSync(istochnik);
const szhatyj = gzipSync(ishodnyj, { level: 9 }).length;

// Сжатие уменьшает объём примерно в одно и то же число раз по всему файлу,
// поэтому размер куска до сжатия считаем от этого соотношения.
const dolya = szhatyj / ishodnyj.length;
const razmerKuska = Math.floor(PREDEL_V_PUTI / dolya);
const vsego = Math.ceil(ishodnyj.length / razmerKuska);

if (existsSync(papka)) rmSync(papka, { recursive: true });
mkdirSync(papka, { recursive: true });

const chasti = [];
for (let i = 0; i < vsego; i++) {
  const kusok = ishodnyj.subarray(i * razmerKuska, (i + 1) * razmerKuska);
  const imya = `cms-${String(i).padStart(2, '0')}.txt`;
  writeFileSync(join(papka, imya), kusok);
  chasti.push({ imya, bajt: kusok.length, vPuti: gzipSync(kusok, { level: 9 }).length });
}

const opis = {
  ishodnik: 'sveltia-cms.js',
  bajt: ishodnyj.length,
  summa: summa(ishodnyj),
  chasti: chasti.map((c) => c.imya),
};
writeFileSync(join(papka, 'opis.json'), JSON.stringify(opis, null, 2));

console.log(`исходный файл : ${Math.round(ishodnyj.length / 1024)} КБ (${Math.round(szhatyj / 1024)} КБ в пути)`);
console.log(`кусков        : ${vsego}`);
for (const c of chasti) {
  console.log(`  ${c.imya}  ${String(Math.round(c.bajt / 1024)).padStart(4)} КБ  →  ${String(Math.round(c.vPuti / 1024)).padStart(3)} КБ в пути`);
}
console.log(`контрольная сумма: ${opis.summa.slice(0, 16)}…`);
