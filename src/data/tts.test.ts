import { describe, expect, it } from 'vitest';
import { CONFUSABLES, DECK, SONGS } from './index';
import { EXAM_1 } from './exam1';
import clipKeys from './tts.json';
import { ttsKey } from '../engine/tts';

/**
 * Mọi câu app có thể đọc đều phải có bản thu sẵn.
 *
 * Thiếu một câu thì không có lỗi nào nổi lên: câu đó lặng lẽ rơi về giọng máy của
 * trình duyệt, tức là giữa một buổi học toàn giọng phòng thi bỗng chen vào một giọng
 * khác hẳn — và trên máy không cài giọng tiếng Trung thì chỉ là im lặng. Nên danh
 * sách dưới đây được dựng lại từ chính dữ liệu app, không phải từ file corpus, để
 * `tools/tts/collect.mjs` bỏ sót cái gì là lộ ra ở đây.
 *
 * Thêm từ mới mà quên chạy lại `collect.mjs` + `render.py` cũng rơi vào bài này.
 */
const clips = new Set<string>(clipKeys);
const HAN = /[一-鿿]/;

/** [nhãn để đọc lỗi cho dễ, câu] */
function everythingSpoken(): [string, string][] {
  const out: [string, string][] = [];
  for (const v of DECK.vocab) {
    out.push([`từ ${v.h}`, v.h]);
    if (v.ex) out.push([`ví dụ của ${v.h}`, v.ex]);
  }
  for (const g of DECK.grammar) out.push([`ngữ pháp ${g.id}`, g.full]);
  for (const c of CONFUSABLES) out.push([`dễ nhầm ${c.id}`, c.full]);
  for (const s of DECK.sentences) out.push([`câu ${s.id}`, s.cn]);
  for (const p of DECK.passages) out.push([`đoạn đọc ${p.id}`, p.text]);
  for (const o of DECK.orders) out.push([`sắp câu ${o.id}`, o.tokens.join('')]);
  for (const song of SONGS) {
    for (const l of song.lines) {
      out.push([`bài hát ${song.id}`, l.cn]);
      // Vòng điền từ đọc câu với chỗ trống bỏ ngỏ — chuỗi này GameEngine tự dựng.
      if (l.blank) out.push([`bài hát ${song.id} (chỗ trống)`, l.cn.split(l.blank).join('……')]);
    }
  }
  for (const [name, part] of [
    ['listen1', EXAM_1.listen1],
    ['listen2', EXAM_1.listen2],
    ['listen3', EXAM_1.listen3],
  ] as const) {
    for (const q of part ?? []) {
      const say = 'say' in q ? q.say : undefined;
      if (!say) continue;
      const lines = (Array.isArray(say) ? say : [say]).filter((l) => l && HAN.test(l));
      if (lines.length) out.push([`đề mô phỏng ${name}`, lines.join('\n')]);
    }
  }
  return out;
}

describe('bản thu sẵn phủ hết những gì app đọc', () => {
  it('không câu nào phải nhờ giọng máy', () => {
    const missing = everythingSpoken()
      .filter(([, text]) => HAN.test(text) && !clips.has(ttsKey(text)))
      .map(([label, text]) => `${label}: ${text.slice(0, 24)}`);
    expect(missing, `${missing.length} câu chưa thu — chạy lại tools/tts`).toEqual([]);
  });

  it('bản kê không chứa khoá thừa', () => {
    const wanted = new Set(everythingSpoken().map(([, t]) => ttsKey(t)));
    const extra = clipKeys.filter((k) => !wanted.has(k));
    expect(extra.length, `${extra.length} file thu cho câu app không còn dùng`).toBe(0);
  });
});
