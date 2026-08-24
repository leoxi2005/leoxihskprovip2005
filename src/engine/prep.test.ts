import { describe, expect, it } from 'vitest';
import { DECK, LEVEL_OF } from '../data';
import { EXAM_1 } from '../data/exam1';
import { PART_GUIDES, flatten, partQuestions, type PartId } from './exam';
import {
  MAX_WORDS,
  PART_NOTES,
  buildPrep,
  levelOf,
  makeCheck,
  prepGrammar,
  prepWords,
  textOf,
  toggleShaky,
} from './prep';

const ALL = flatten(EXAM_1);
const forPart = (id: PartId) => partQuestions(ALL, id);

describe('chữ của một câu hỏi', () => {
  it('câu nghe: lấy cả lời thoại, vì ôn trước là được biết trước', () => {
    const q = forPart('听力第一部分')[0].q;
    if (q.kind !== 'tf') throw new Error('sai loại câu');
    expect(textOf(q).all).toContain(q.item.say);
  });

  it('câu điền từ: đáp án là từ trong bảng, không phải cả câu', () => {
    const q = forPart('阅读第一部分')[0].q;
    if (q.kind !== 'fill') throw new Error('sai loại câu');
    const { key } = textOf(q);
    expect(key).toEqual([q.group.bank[q.group.items[q.at].ans]]);
  });

  it('câu trắc nghiệm: chỉ đáp án đúng vào phần key', () => {
    const q = forPart('阅读第三部分')[0].q;
    if (q.kind !== 'qa') throw new Error('sai loại câu');
    expect(textOf(q).key).toEqual([q.item.opts[q.item.ans]]);
  });

  it('mọi loại câu đều trả về chữ, không loại nào rơi ra ngoài', () => {
    const kinds = new Set(ALL.map((x) => x.q.kind));
    expect(kinds.size).toBe(6);
    for (const { q } of ALL) {
      expect(textOf(q).all.join('').length).toBeGreaterThan(0);
    }
  });
});

describe('từ vựng để ôn', () => {
  it('không bao giờ bày từ HSK 1–2 — người thi HSK 4 không cần ôn 我 với 好', () => {
    for (const id of PART_GUIDES.map((g) => g.id)) {
      for (const w of prepWords(forPart(id))) {
        expect(levelOf(w.v.h)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('mọi từ lấy ra đều thật sự có trong câu của phần đó', () => {
    const qs = forPart('阅读第一部分');
    const han = qs.map(({ q }) => textOf(q).all.join('')).join('');
    for (const w of prepWords(qs)) expect(han).toContain(w.v.h);
  });

  it('từ mang đáp án được xếp lên trước từ chỉ đi ngang qua', () => {
    const words = prepWords(forPart('阅读第一部分'), { max: 40 });
    const lastKey = words.map((w) => w.isKey).lastIndexOf(true);
    const firstPlain = words.map((w) => w.isKey).indexOf(false);
    // Có cả hai loại thì mọi từ đáp án phải đứng trên mọi từ thường.
    if (lastKey >= 0 && firstPlain >= 0) expect(lastKey).toBeLessThan(firstPlain);
  });

  it('từ tự đánh dấu "chưa thuộc" chen lên đầu, kể cả khi là từ dễ', () => {
    const qs = forPart('阅读第三部分');
    // Một từ HSK 1–2 có thật trong mấy câu này, tức bình thường sẽ bị loại.
    const easy = qs
      .flatMap(({ q }) => textOf(q).all.join(''))
      .join('')
      .split('')
      .find((c) => LEVEL_OF.get(c) === 1 && DECK.vocab.some((v) => v.h === c));
    if (!easy) return;
    const out = prepWords(qs, { pinned: new Set([easy]) });
    expect(out[0].v.h).toBe(easy);
  });

  it('không bao giờ vượt quá số ô của bảng', () => {
    for (const id of PART_GUIDES.map((g) => g.id)) {
      expect(prepWords(forPart(id)).length).toBeLessThanOrEqual(MAX_WORDS);
    }
  });

  it('mỗi từ chỉ hiện một lần, dù xuất hiện ở nhiều câu', () => {
    const words = prepWords(forPart('书写第一部分'), { max: 60 });
    expect(new Set(words.map((w) => w.v.h)).size).toBe(words.length);
  });
});

describe('điểm ngữ pháp rút từ đề', () => {
  it('chỉ nhận mục mà từ khoá thật sự nằm trong đề', () => {
    const qs = forPart('阅读第三部分');
    const han = qs.map(({ q }) => textOf(q).all.join('')).join('');
    for (const g of prepGrammar(qs)) expect(han).toContain(g.a);
  });

  it('không lặp lại cùng một điểm ngữ pháp hai lần', () => {
    const out = prepGrammar(forPart('听力第三部分'));
    expect(new Set(out.map((g) => g.name)).size).toBe(out.length);
  });

  it('bỏ từ khoá quá thường, nếu không bảng nào cũng giống bảng nào', () => {
    // 的 có mặt trong gần như mọi đề; một dấu hiệu đúng với mọi đề thì vô dụng.
    expect(prepGrammar(ALL).every((g) => g.a !== '的')).toBe(true);
  });

  it('không nhận từ khoá một chữ — 把 với 比 khớp ở đâu cũng khớp', () => {
    for (const g of PART_GUIDES) {
      for (const x of prepGrammar(forPart(g.id))) expect(x.a.length).toBeGreaterThan(1);
    }
  });

  it('không lẫn mục "Từ vựng: …" vào bảng ngữ pháp', () => {
    for (const g of prepGrammar(ALL, 50)) expect(g.name).not.toMatch(/^Từ vựng/i);
  });

  it('mỗi phần ra một bảng khác nhau, chứ không phải một bảng dùng chung', () => {
    const sets = PART_GUIDES.map((g) => prepGrammar(forPart(g.id)).map((x) => x.a).join(','));
    expect(new Set(sets.filter(Boolean)).size).toBeGreaterThan(1);
  });
});

describe('bảng ôn của từng phần', () => {
  /**
   * Mức sâu phải ĐỀU giữa tám phần.
   *
   * Bản đầu viết 书写第一部分 sáu điểm còn bảy phần kia ba điểm, và chỗ mỏng rơi đúng
   * vào 阅读第二部分 — phần đang thấp điểm nhất. Bảng ôn chỉ dày ở phần mình thấy dễ
   * viết thì nó ôn hộ người viết, không ôn hộ người học.
   */
  it('cả tám phần đều đủ sáu điểm ngữ pháp, mỗi điểm hai ví dụ', () => {
    for (const g of PART_GUIDES) {
      const notes = PART_NOTES[g.id] ?? [];
      expect(notes.length).toBeGreaterThanOrEqual(6);
      for (const n of notes) {
        expect(n.eg.length).toBeGreaterThanOrEqual(2);
        expect(n.why.length).toBeGreaterThan(40);
        for (const e of n.eg) expect(e.cn).toMatch(/[\u4e00-\u9fff]/);
      }
    }
  });

  it('không có hai điểm ngữ pháp trùng tên trong cùng một phần', () => {
    for (const g of PART_GUIDES) {
      const names = (PART_NOTES[g.id] ?? []).map((n) => n.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('phần nào cũng dựng được bảng ôn có từ để học', () => {
    for (const g of PART_GUIDES) {
      const pack = buildPrep(g.id, forPart(g.id));
      expect(pack.notes.length).toBeGreaterThan(0);
      expect(pack.words.length).toBeGreaterThan(0);
    }
  });
});

describe('kiểm tra nhanh', () => {
  const words = prepWords(forPart('阅读第一部分'));

  it('bốn lựa chọn khác nhau, và đáp án nằm đúng chỗ ans', () => {
    for (const q of makeCheck(words)) {
      expect(q.opts.length).toBe(4);
      expect(new Set(q.opts).size).toBe(4);
      expect(q.opts[q.ans]).toBe(q.v.m);
    }
  });

  it('không hỏi quá số từ đang có', () => {
    expect(makeCheck(words.slice(0, 2)).length).toBe(2);
  });

  it('mồi nhử cùng từ loại, để không loại được bằng ngữ pháp', () => {
    const pool = DECK.vocab;
    for (const q of makeCheck(words)) {
      const sameKind = pool.filter((x) => x.pos === q.v.pos && x.m !== q.v.m);
      if (sameKind.length < 3) continue;
      const kinds = q.opts.map((m) => pool.find((x) => x.m === m)?.pos);
      expect(new Set(kinds).size).toBe(1);
    }
  });
});

describe('dấu "chưa thuộc"', () => {
  it('bấm lần nữa là bỏ dấu', () => {
    const on = toggleShaky({ shaky: [] }, '经验');
    expect(on.shaky).toEqual(['经验']);
    expect(toggleShaky(on, '经验').shaky).toEqual([]);
  });

  it('từ mới nhất lên đầu và danh sách không phình mãi', () => {
    let m = { shaky: Array.from({ length: 200 }, (_, i) => 'x' + i) };
    m = toggleShaky(m, '新');
    expect(m.shaky[0]).toBe('新');
    expect(m.shaky.length).toBe(200);
  });
});
