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
