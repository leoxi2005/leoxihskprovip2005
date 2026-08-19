/**
 * Xuất từ vựng ra bảng dán thẳng vào Table DAT của TouchDesigner.
 *
 * Chạy: `node tools/td-table.mjs [thư mục đích]`   (mặc định ~/Downloads/HSK_TABLES)
 *
 * TouchDesigner đọc TSV (ngăn bằng Tab) sạch hơn CSV: nghĩa tiếng Việt có dấu phẩy,
 * mà Table DAT không hiểu dấu ngoặc kép bao ô — dùng CSV là vỡ cột ngay dòng đầu tiên.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { EXTRA_VOCAB } from '../src/data/extra.ts';
import { EXTRA2_VOCAB } from '../src/data/extra2.ts';
import { EXTRA3_VOCAB } from '../src/data/extra3.ts';
import { EXTRA4_VOCAB } from '../src/data/extra4.ts';
import { splitHsk4, HSK4_ALL } from '../src/data/hsk4.ts';
import { splitHsk123 } from '../src/data/hsk123.ts';
import deck from '../src/data/deck.json' with { type: 'json' };

const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith('--')) ?? path.join(os.homedir(), 'Downloads/HSK_TABLES');
/** Số từ cho bảng rút gọn — `--top=50`. */
const TOP = Number(args.find((a) => a.startsWith('--top='))?.split('=')[1] ?? 50);
/** Bỏ qua bao nhiêu từ đầu bảng xếp hạng — `--skip=50` để lấy đợt tiếp theo, không trùng đợt trước. */
const SKIP = Number(args.find((a) => a.startsWith('--skip='))?.split('=')[1] ?? 0);
await fs.mkdir(out, { recursive: true });

const textbook = [...deck.vocab, ...EXTRA_VOCAB, ...EXTRA2_VOCAB, ...EXTRA3_VOCAB, ...EXTRA4_VOCAB];
const hsk4 = splitHsk4(new Set(textbook.map((v) => v.h)));
const hsk123 = splitHsk123(new Set([...textbook.map((v) => v.h), ...hsk4.fresh.map((v) => v.h)]));
// Từ trong giáo trình mượn câu ví dụ của danh sách chính thức khi chính nó chưa có —
// đúng như `ENRICHED` trong src/data/index.ts, nếu không cột ví dụ sẽ rỗng quá nửa.
const vocab = [
  ...textbook.map((v) => (v.ex ? v : { ...v, ...pickEx(hsk4.known.get(v.h) ?? hsk123.known.get(v.h)) })),
  ...hsk123.fresh,
  ...hsk4.fresh,
];

function pickEx(official) {
  return official ? { ex: official.ex, exVi: official.exVi } : {};
}

/**
 * Cấp của một từ, dò thẳng trong hai danh sách chính thức.
 *
 * Không lấy theo tên nhóm: deck của designer có sẵn vài nhóm tên "HSK4 · …" chứa cả
 * cụm từ ngoài đại cương (加班费, 地方小吃…), lấy theo nhóm thì bảng "600 từ HSK4"
 * phình lên 623 dòng mà nhìn vẫn có vẻ đúng.
 */
const level = new Map(
  splitHsk123(new Set()).fresh.map((v) => [v.h, 'HSK' + /^HSK(\d)/.exec(v.t)[1]]),
);
for (const v of HSK4_ALL) level.set(v.h, 'HSK4');
const capOf = (v) => level.get(v.h) ?? 'Giáo trình';

// Tab và xuống dòng trong ô sẽ phá cấu trúc bảng — thay bằng khoảng trắng.
const cell = (s) => String(s ?? '').replace(/[\t\r\n]+/g, ' ').trim();
const tsv = (rows) => rows.map((r) => r.map(cell).join('\t')).join('\n') + '\n';

const header = ['hanzi', 'pinyin', 'nghia', 'cap', 'vidu', 'viduVi'];
const row = (v) => [v.h, v.p, v.m, capOf(v), v.ex ?? '', v.exVi ?? ''];

/**
 * Bảng rút gọn: N từ HSK4 **từ hai chữ trở lên**, xếp theo số lần xuất hiện trong đề.
 *
 * Xếp theo thứ tự deck thì đầu bảng toàn từ lẻ tẻ của giáo trình (加班费, 地方小吃) —
 * trông như bốc ngẫu nhiên. Đếm trên chính lời thoại bản thu đề thật + đề mô phỏng thì
 * đầu bảng là những từ đề thi thật sự dùng đi dùng lại.
 */
const corpus = (
  await Promise.all(
    ['h41001.ts', 'exam1.ts'].map((f) =>
      fs.readFile(path.join(import.meta.dirname, '../src/data', f), 'utf8'),
    ),
  )
)
  .flatMap((t) => [...t.matchAll(/'([^']*[一-鿿][^']*)'/g)].map((m) => m[1]))
  .join('\n');

const countIn = (w) => {
  let n = 0;
  for (let i = corpus.indexOf(w); i !== -1; i = corpus.indexOf(w, i + w.length)) n++;
  return n;
};
const hanziLen = (w) => [...w].filter((c) => /[一-鿿]/.test(c)).length;
const top = vocab
  .filter((v) => capOf(v) === 'HSK4' && hanziLen(v.h) >= 2)
  .map((v) => ({ v, n: countIn(v.h) }))
  .sort((a, b) => b.n - a.n || a.v.p.localeCompare(b.v.p))
  .slice(SKIP, SKIP + TOP)
  .map((x) => x.v);

/** Tên bảng nói rõ đây là hạng mấy tới hạng mấy, để hai đợt không lẫn vào nhau. */
const tag = SKIP ? `top${SKIP + 1}-${SKIP + TOP}` : `top${TOP}`;

const files = {
  'hsk_tatca.tsv': tsv([header, ...vocab.map(row)]),
  'hsk4_chinhthuc.tsv': tsv([header, ...vocab.filter((v) => capOf(v) === 'HSK4').map(row)]),
  // Một cột chữ Hán, không tiêu đề — đúng dạng bảng chữ chạy trong TouchDesigner.
  'hsk_chuhan.txt': vocab.map((v) => cell(v.h)).join('\n') + '\n',
  'hsk4_chuhan.txt': vocab.filter((v) => capOf(v) === 'HSK4').map((v) => cell(v.h)).join('\n') + '\n',
  [`${tag}.tsv`]: tsv([header, ...top.map(row)]),
  [`${tag}_chuhan.txt`]: top.map((v) => cell(v.h)).join('\n') + '\n',
};

for (const [name, body] of Object.entries(files)) {
  await fs.writeFile(path.join(out, name), body, 'utf8');
  console.log(`${name}: ${body.trim().split('\n').length} dòng`);
}
console.log('→ ' + out);
