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
 * đầu. Câu thứ hai đi mượn băng của câu đầu, và nếu mượn nguyên si thì băng hỏi một
 * đằng còn màn hình hỏi một nẻo — nên bản đi mượn cắt dòng 问 đi.
 *
 * Ở đây chứ không ở `exam.ts`, vì `tools/tts/collect.mjs` phải cắt y hệt để thu đúng
 * bản mượn: lệch một dòng là lệch khoá băm, và câu đó lặng lẽ rơi về giọng máy.
 */
export const withoutAsk = (lines: readonly string[]): string[] =>
  lines.filter((l) => !/^问\s*[:：]/.test(l.trim()));
