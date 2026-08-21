/**
 * Gom mọi câu tiếng Trung mà app có thể đọc thành `tools/tts/corpus.json`.
 *
 * Chạy: `node tools/tts/collect.mjs`
 *
 * Node 24 đọc thẳng được `.ts` (chỉ xoá phần kiểu), nên dữ liệu được lấy từ chính
 * các module app dùng chứ không dò bằng biểu thức chính quy: thiếu một câu là câu
 * đó lặng lẽ rơi về giọng máy của trình duyệt, không có lỗi nào báo lên cả.
 *
 * `src/data/index.ts` không import được trực tiếp (nó import JSON theo kiểu của
 * Vite và đụng `import.meta.env`), nên phần ghép deck được dựng lại y hệt ở đây —
 * và `npm test` có bài kiểm tra đối chiếu đủ số câu, để hai bên không trôi khỏi nhau.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXTRA_GRAMMAR, EXTRA_VOCAB, CONFUSABLES } from '../../src/data/extra.ts';
import { EXTRA2_GRAMMAR, EXTRA2_VOCAB } from '../../src/data/extra2.ts';
import { EXTRA3_GRAMMAR, EXTRA3_VOCAB } from '../../src/data/extra3.ts';
import { EXTRA4_GRAMMAR, EXTRA4_VOCAB } from '../../src/data/extra4.ts';
import { splitHsk4 } from '../../src/data/hsk4.ts';
import { splitHsk123 } from '../../src/data/hsk123.ts';
import { EXAM_1 } from '../../src/data/exam1.ts';
import deck from '../../src/data/deck.json' with { type: 'json' };
import songs from '../../src/data/songs.json' with { type: 'json' };
import { COLLOCATIONS, FIXES } from '../../src/data/drills.ts';
import { NUM_DRILLS } from '../../src/engine/numbers.ts';
import { ttsKey } from '../../src/engine/tts.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HAN = /[一-鿿]/;

const textbook = [...deck.vocab, ...EXTRA_VOCAB, ...EXTRA2_VOCAB, ...EXTRA3_VOCAB, ...EXTRA4_VOCAB];
const hsk4 = splitHsk4(new Set(textbook.map((v) => v.h)));
const hsk123 = splitHsk123(new Set([...textbook.map((v) => v.h), ...hsk4.fresh.map((v) => v.h)]));
const vocab = [
  // Từ trong deck gốc lấy câu ví dụ của danh sách chính thức khi chính nó chưa có —
  // đúng như `ENRICHED` trong src/data/index.ts, vì đó là câu vòng điền từ đọc lên.
  ...textbook.map((v) => (v.ex ? v : { ...v, ex: (hsk4.known.get(v.h) ?? hsk123.known.get(v.h))?.ex })),
  ...hsk123.fresh,
  ...hsk4.fresh,
];
const grammar = [
  ...deck.grammar,
  ...EXTRA_GRAMMAR,
  ...EXTRA2_GRAMMAR,
  ...EXTRA3_GRAMMAR,
  ...EXTRA4_GRAMMAR,
];

const out = new Map();
const add = (lines, why) => {
  const clean = (Array.isArray(lines) ? lines : [lines]).filter((l) => l && HAN.test(l));
  if (!clean.length) return;
  const key = ttsKey(clean.join('\n'));
  if (!out.has(key)) out.set(key, { key, lines: clean, why });
};

for (const v of vocab) {
  add(v.h, 'từ');
  if (v.ex) add(v.ex, 'ví dụ');
}
for (const g of grammar) add(g.full, 'ngữ pháp');
for (const c of CONFUSABLES) add(c.full, 'dễ nhầm');
for (const s of deck.sentences ?? []) add(s.cn, 'câu');
for (const p of deck.passages ?? []) add(p.text, 'đoạn đọc');
for (const o of deck.orders ?? []) add(o.tokens.join(''), 'sắp câu');
for (const song of songs) {
  for (const l of song.lines) {
    add(l.cn, 'bài hát');
    // Vòng điền từ đọc câu với chỗ trống bỏ ngỏ — đúng chuỗi GameEngine dựng ra.
    if (l.blank) add(l.cn.split(l.blank).join('……'), 'bài hát · chỗ trống');
  }
}
for (const d of NUM_DRILLS) add(d.say, 'bẫy số');
for (const c of COLLOCATIONS) add(c.frame.replace('____', c.a), 'kết hợp từ');
// Chỉ thu câu ĐÃ SỬA. Câu sai không bao giờ được đọc lên — nghe một câu sai bằng
// giọng chuẩn là cách nhanh nhất để nhớ nhầm.
for (const f of FIXES) add(f.right, 'bắt lỗi sai');
for (const part of [EXAM_1.listen1, EXAM_1.listen2, EXAM_1.listen3]) {
  for (const q of part ?? []) if (q.say) add(q.say, 'đề mô phỏng · nghe');
}

const corpus = [...out.values()];
await fs.writeFile(path.join(ROOT, 'tools/tts/corpus.json'), JSON.stringify(corpus, null, 1) + '\n');

const chars = corpus.reduce((a, i) => a + i.lines.join('').replace(/[^一-鿿]/g, '').length, 0);
const by = {};
for (const i of corpus) by[i.why] = (by[i.why] ?? 0) + 1;
console.log(`${corpus.length} đoạn · ${chars} chữ · ~${Math.round((chars / 3.5 / 60) * 1.25)} phút audio`);
console.log(Object.entries(by).map(([k, n]) => `  ${k}: ${n}`).join('\n'));
