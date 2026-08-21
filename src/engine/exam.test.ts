import { describe, expect, it } from 'vitest';
import { EXAM_1 } from '../data/exam1';
import {
  EXAM_SPEC,
  PART_GUIDES,
  PASS_MARK,
  TOTAL_QUESTIONS,
  countOf,
  drawPaper,
  flatten,
  isRight,
  partOfDay,
  partQuestions,
  passageFor,
  score,
  sectionRanges,
  writtenMatches,
  type ExamAnswer,
  type SelfMark,
} from './exam';

/**
 * `EXAM_1` là KHO, một đề là thứ `drawPaper` rút ra từ kho đó — nên mọi bài kiểm tra
 * về HÌNH DẠNG của đề phải chạy trên bản đã rút, không phải trên kho.
 */
const QS = flatten(drawPaper(EXAM_1));

describe('paper shape', () => {
  it('matches the official blueprint exactly', () => {
    expect(TOTAL_QUESTIONS).toBe(100);
    expect(QS).toHaveLength(100);
    const p = drawPaper(EXAM_1);
    expect(p.listen1).toHaveLength(10);
    expect(p.listen2).toHaveLength(15);
    expect(p.listen3).toHaveLength(20);
    expect(p.read1.flatMap((g) => g.items)).toHaveLength(10);
    expect(p.read2).toHaveLength(10);
    expect(p.read3).toHaveLength(20);
    expect(p.write1).toHaveLength(10);
    expect(p.write2).toHaveLength(5);
  });

  it('rút đề nào cũng đủ 100 câu, dù rút bao nhiêu lần', () => {
    for (let k = 0; k < 30; k++) expect(flatten(drawPaper(EXAM_1))).toHaveLength(100);
  });

  it('kho không được nhỏ hơn một đề', () => {
    expect(EXAM_1.write1.length).toBeGreaterThanOrEqual(countOf('书写第一部分'));
    expect(EXAM_1.write2.length).toBeGreaterThanOrEqual(countOf('书写第二部分'));
    expect(EXAM_1.read2.length).toBeGreaterThanOrEqual(countOf('阅读第二部分'));
    expect(EXAM_1.read3.length).toBeGreaterThanOrEqual(countOf('阅读第三部分'));
  });

  it('kho đủ lớn thì hai lần rút không ra y hệt nhau', () => {
    const a = drawPaper(EXAM_1).write1.map((x) => x.accept[0]);
    const b = drawPaper(EXAM_1).write1.map((x) => x.accept[0]);
    // Với kho 51 câu, xác suất trùng cả mười câu là gần như bằng không.
    expect(a.join('|') === b.join('|')).toBe(false);
  });

  it('runs the sections in the order they are sat, without interleaving', () => {
    expect(QS.map((x) => x.section).join(' ')).toBe(
      [...Array(45).fill('listen'), ...Array(40).fill('read'), ...Array(15).fill('write')].join(' '),
    );
    const r = sectionRanges(QS);
    expect(r.listen).toEqual([0, 44]);
    expect(r.read).toEqual([45, 84]);
    expect(r.write).toEqual([85, 99]);
  });

  it('times each section the way the real paper does', () => {
    expect(EXAM_SPEC.map((s) => s.minutes)).toEqual([30, 40, 25]);
    expect(EXAM_SPEC.reduce((n, s) => n + s.points, 0)).toBe(300);
    expect(PASS_MARK).toBe(180);
  });
});

describe('paper content', () => {
  /**
   * Drafting notes and placeholder words are easy to leave behind in a paper this
   * size, and a stray Latin word inside a Chinese sentence gives the answer away.
   * Only the Chinese-bearing fields are scanned — `vi` is Vietnamese by design.
   */
  it('never leaves a Latin word inside the Chinese', () => {
    const chinese: string[] = [
      ...EXAM_1.listen1.flatMap((x) => [x.say, x.stmt]),
      ...[...EXAM_1.listen2, ...EXAM_1.listen3, ...EXAM_1.read3].flatMap((x) => [
        ...(x.say ?? []),
        x.text ?? '',
        x.q,
        ...x.opts,
      ]),
      ...EXAM_1.read1.flatMap((g) => [...g.bank, ...g.items.map((it) => it.sent)]),
      ...EXAM_1.read2.flatMap((x) => x.parts),
      ...EXAM_1.write1.flatMap((x) => [...x.words, ...x.accept]),
      ...EXAM_1.write2.flatMap((x) => [x.word, x.sample]),
    ];
    chinese.forEach((s) => expect(s, s).not.toMatch(/[A-Za-zА-Яа-я]/));
  });

  it('offers four options with a valid answer on every choice question', () => {
    [...EXAM_1.listen2, ...EXAM_1.listen3, ...EXAM_1.read3].forEach((x) => {
      expect(x.opts, x.q).toHaveLength(4);
      expect(x.ans).toBeGreaterThanOrEqual(0);
      expect(x.ans).toBeLessThan(4);
      expect(new Set(x.opts).size, x.q).toBe(4);
      expect(x.vi, x.q).toBeTruthy();
    });
  });

  it('leaves exactly one spare word in each 选词填空 bank', () => {
    EXAM_1.read1.forEach((g) => {
      expect(g.bank).toHaveLength(6);
      expect(g.items).toHaveLength(5);
      const used = g.items.map((it) => it.ans);
      expect(new Set(used).size).toBe(5);
      used.forEach((u) => expect(g.bank[u]).toBeTruthy());
      // Each sentence has exactly one blank to fill.
      g.items.forEach((it) => expect(it.sent).toContain('（'));
    });
  });

  it('gives every 排列顺序 item a full permutation of its three fragments', () => {
    EXAM_1.read2.forEach((o) => {
      expect([...o.ans].sort()).toEqual([0, 1, 2]);
      expect(o.parts).toHaveLength(3);
    });
  });

  it('models a 完成句子 answer that uses every word given', () => {
    EXAM_1.write1.forEach((s) => {
      const model = s.accept[0];
      s.words.forEach((w) => expect(model, `${model} thiếu "${w}"`).toContain(w));
    });
  });

  it('uses the required word in every 看图写句子 model answer', () => {
    EXAM_1.write2.forEach((p) => {
      expect(p.sample).toContain(p.word);
      expect(p.scene).toBeTruthy();
    });
  });

  it('carries a follow-up reading question back to its own passage', () => {
    QS.forEach(({ q }, i) => {
      if (q.kind === 'qa' && q.part === '阅读第三部分') {
        expect(passageFor(QS, i), `câu ${i + 1}`).toBeTruthy();
      }
    });
  });
});

describe('marking', () => {
  const blank: ExamAnswer[] = Array(100).fill(null);
  const noMarks: SelfMark[] = Array(100).fill(undefined);

  it('scores an empty paper at zero and counts every blank', () => {
    const s = score(QS, blank, noMarks);
    expect(s.total).toBe(0);
    expect(s.blank).toBe(100);
    expect(s.passed).toBe(false);
  });

  it('scores a perfect paper at 300 and passes', () => {
    const answers = QS.map(({ q }) => {
      switch (q.kind) {
        case 'tf':
          return q.item.ok ? 1 : 0;
        case 'qa':
          return q.item.ans;
        case 'fill':
          return q.group.items[q.at].ans;
        case 'order':
          return q.item.ans.join('');
        case 'sent':
          return q.item.accept[0];
        case 'pic':
          return q.item.sample;
      }
    }) as ExamAnswer[];
    // 看图写句子 can only be marked by the candidate; everything else grades itself.
    const marks = QS.map(({ q }) => (q.kind === 'pic' ? true : undefined));
    const s = score(QS, answers, marks);
    expect(s.sections.map((x) => x.points)).toEqual([100, 100, 100]);
    expect(s.total).toBe(300);
    expect(s.passed).toBe(true);
  });

  it('accepts a written answer that ignores punctuation', () => {
    // Câu nào cũng được: đề giờ rút ngẫu nhiên, nên bài kiểm tra dựng chuỗi từ chính
    // đáp án mẫu của câu bốc trúng thay vì ghim một câu cụ thể.
    const q = QS.find((x) => x.q.kind === 'sent')!.q;
    if (q.kind !== 'sent') throw new Error('không tìm thấy câu 完成句子');
    const model = q.item.accept[0];
    const bare = model.replace(/[\s，。！？、]/g, '');
    expect(writtenMatches(q, bare)).toBe(true);
    expect(writtenMatches(q, [...bare].join(' ') + '。')).toBe(true);
    // Đảo hai chữ đầu ra sau cùng thì không còn khớp đáp án mẫu nữa.
    expect(writtenMatches(q, bare.slice(2) + bare.slice(0, 2))).toBe(false);
  });

  it('lets the candidate override a written answer the matcher rejected', () => {
    const q = QS.find((x) => x.q.kind === 'sent')!.q;
    expect(isRight(q, '这不是答案', undefined)).toBe(false);
    expect(isRight(q, '这不是答案', true)).toBe(true);
  });

  it('scales each section onto its own hundred points', () => {
    // Right on the whole listening section, blank everywhere else.
    const answers = QS.map(({ section, q }) => {
      if (section !== 'listen') return null;
      return q.kind === 'tf' ? (q.item.ok ? 1 : 0) : q.kind === 'qa' ? q.item.ans : null;
    }) as ExamAnswer[];
    const s = score(QS, answers, noMarks);
    expect(s.sections[0].points).toBe(100);
    expect(s.total).toBe(100);
    expect(s.passed).toBe(false);
  });
});

describe('part-by-part practice', () => {
  it('has a guide for every part of the paper, and no orphans', () => {
    const partsInPaper = [...new Set(QS.map((x) => x.q.part))].sort();
    expect(PART_GUIDES.map((g) => g.id).sort()).toEqual(partsInPaper);
  });

  it('counts each part the way the official blueprint does', () => {
    PART_GUIDES.forEach((g) => {
      expect(partQuestions(QS, g.id), g.id).toHaveLength(g.count);
      // 排列顺序 is three fragments marked as one question, so seconds-per-question
      // has to be generous there; every part still needs a usable pacing figure.
      expect(g.secPerQ, g.id).toBeGreaterThan(5);
    });
  });

  it('files every part under the section it is actually sat in', () => {
    PART_GUIDES.forEach((g) => {
      partQuestions(QS, g.id).forEach((x) => expect(x.section, g.id).toBe(g.section));
    });
  });

  it('gives every part real coaching rather than a stub', () => {
    PART_GUIDES.forEach((g) => {
      expect(g.what.length, g.id).toBeGreaterThan(40);
      expect(g.steps.length, g.id).toBeGreaterThanOrEqual(3);
      expect(g.traps.length, g.id).toBeGreaterThanOrEqual(2);
      expect(g.vi, g.id).toBeTruthy();
    });
  });

  /**
   * Left to choose freely, people drill the part they are already best at. Rotation
   * puts the awkward ones in front of you without nagging — so a week has to cover
   * all eight, and the same day must always give the same part.
   */
  it('rotates through every part across eight days, deterministically', () => {
    const week = Array.from({ length: PART_GUIDES.length }, (_, k) => partOfDay(82 - k));
    expect(new Set(week).size).toBe(PART_GUIDES.length);
    expect(partOfDay(82)).toBe(partOfDay(82));
  });

  it('never goes out of range, whatever the countdown says', () => {
    [-9, 0, 1, 365].forEach((d) => {
      expect(PART_GUIDES.some((g) => g.id === partOfDay(d)), String(d)).toBe(true);
    });
  });
});
