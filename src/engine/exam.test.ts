import { describe, expect, it } from 'vitest';
import { EXAM_1 } from '../data/exam1';
import {
  EXAM_SPEC,
  PASS_MARK,
  TOTAL_QUESTIONS,
  flatten,
  isRight,
  passageFor,
  score,
  sectionRanges,
  writtenMatches,
  type ExamAnswer,
  type SelfMark,
} from './exam';

const QS = flatten(EXAM_1);

describe('paper shape', () => {
  it('matches the official blueprint exactly', () => {
    expect(TOTAL_QUESTIONS).toBe(100);
    expect(QS).toHaveLength(100);
    expect(EXAM_1.listen1).toHaveLength(10);
    expect(EXAM_1.listen2).toHaveLength(15);
    expect(EXAM_1.listen3).toHaveLength(20);
    expect(EXAM_1.read1.flatMap((g) => g.items)).toHaveLength(10);
    expect(EXAM_1.read2).toHaveLength(10);
    expect(EXAM_1.read3).toHaveLength(20);
    expect(EXAM_1.write1).toHaveLength(10);
    expect(EXAM_1.write2).toHaveLength(5);
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
    const q = QS.find((x) => x.q.kind === 'sent')!.q;
    expect(writtenMatches(q, '请把窗户打开')).toBe(true);
    expect(writtenMatches(q, '请 把 窗户 打开。')).toBe(true);
    expect(writtenMatches(q, '窗户请打开')).toBe(false);
  });

  it('lets the candidate override a written answer the matcher rejected', () => {
    const q = QS.find((x) => x.q.kind === 'sent')!.q;
    expect(isRight(q, '窗户被他打开了', undefined)).toBe(false);
    expect(isRight(q, '窗户被他打开了', true)).toBe(true);
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
