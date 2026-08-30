/**
 * Tên file của một đoạn thu sẵn.
 *
 * Băm FNV-1a 32 bit: đủ ngắn để làm tên file, và quan trọng hơn là *thuần tuý* —
 * cùng một câu thì lúc thu và lúc phát ra cùng một tên, không cần bảng tra ánh xạ
 * câu → file (bảng đó sẽ nặng hơn chính danh sách khoá vài lần).
 *
 * `tools/tts/collect.mjs` import đúng hàm này, nên hai bên không thể lệch nhau.
 */
export function ttsKey(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Khoá của một lượt nghe nhiều dòng (hội thoại đề thi) — dòng nối bằng xuống dòng. */
export function ttsKeyOf(lines: string[]): string {
  return ttsKey(lines.join('\n'));
}

/**
 * Bỏ dòng `问：…` khỏi một lượt nghe.
 *
 * 听力第三部分 phát một đoạn rồi hỏi hai câu, nhưng dữ liệu chỉ chép dòng 问 của câu
 * đầu. Câu thứ hai đi mượn đoạn ấy, và dòng 问 cũ phải rơi ra — nó hỏi câu TRƯỚC.
 */
export const withoutAsk = (lines: readonly string[]): string[] =>
  lines.filter((l) => !/^问\s*[:：]/.test(l.trim()));

/** Dòng người dẫn đọc câu hỏi, đúng cách băng thi dẫn: `问：…`. */
export const askLine = (q: string): string => `问：${q}`;

/**
 * Băng của câu thứ hai trong một cặp: đoạn cũ, rồi câu hỏi CỦA CHÍNH NÓ.
 *
 * Không chỉ cắt dòng 问 đi là xong. Phần nghe không in câu hỏi ra màn hình — câu hỏi
 * nằm trong băng — nên đoạn không có 问 nào là bốn lựa chọn chẳng biết đang hỏi gì.
 * Băng thi thật cũng đọc hai lần 问 sau một đoạn; dữ liệu chỉ chép lần đầu, nên lần
 * thứ hai được dựng lại ở đây từ chính `q` của câu.
 *
 * Ở `tts.ts` vì `tools/tts/collect.mjs` phải dựng chuỗi Y HỆT để thu: lệch một chữ
 * là lệch khoá băm, và câu đó lặng lẽ rơi về giọng máy.
 */
export const borrowedLines = (passage: readonly string[], ask: string): string[] => [
  ...withoutAsk(passage),
  askLine(ask),
];
