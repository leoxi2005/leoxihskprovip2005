import { describe, expect, it } from 'vitest';
import { H41001_LISTEN, H41001_PAPER_ID, H41001_PARTS } from './h41001';
import { BUILTIN_PAPERS, LISTEN_COUNT, TF_COUNT } from '../engine/realpaper';

/**
 * The clips were cut by machine from the recording's own answer pauses, and a slip of
 * one boundary would hand the learner the wrong question with no visible symptom — the
 * audio still plays, it just answers something else. These are the invariants that
 * would have caught such a slip.
 */
describe('the sample paper cut into questions', () => {
  const paper = BUILTIN_PAPERS.find((b) => b.id === H41001_PAPER_ID)!;

  it('covers all 45 questions once, in order', () => {
    expect(H41001_LISTEN).toHaveLength(LISTEN_COUNT);
    expect(H41001_LISTEN.map((q) => q.n)).toEqual(
      Array.from({ length: LISTEN_COUNT }, (_, i) => i + 1),
    );
  });

  it('prints what the paper prints: a statement for part 1, four options after it', () => {
    H41001_LISTEN.forEach((q) => {
      if (q.n <= TF_COUNT) {
        expect(q.statement, `câu ${q.n}`).toBeTruthy();
        expect(q.options, `câu ${q.n}`).toBeUndefined();
      } else {
        expect(q.options, `câu ${q.n}`).toHaveLength(4);
        expect(q.options!.every((o) => o.trim().length > 0), `câu ${q.n}`).toBe(true);
      }
    });
  });

  it('splits into the parts the paper uses', () => {
    const count = (p: 1 | 2 | 3) => H41001_LISTEN.filter((q) => q.part === p).length;
    expect(count(1)).toBe(10);
    expect(count(2)).toBe(15);
    expect(count(3)).toBe(20);
    expect(H41001_PARTS.map((p) => p.part)).toEqual([1, 2, 3]);
  });

  it('keeps every clip inside the recording and moving forwards', () => {
    let prev = 0;
    H41001_LISTEN.forEach((q) => {
      const [a, b] = q.at;
      expect(a, `câu ${q.n}`).toBeGreaterThan(prev);
      expect(b, `câu ${q.n}`).toBeGreaterThan(a);
      // The recording is 1789.8s long; a clip reaching past it plays silence.
      expect(b, `câu ${q.n}`).toBeLessThan(1789);
      prev = b;
    });
  });

  it('gives each question enough audio to be answerable', () => {
    H41001_LISTEN.forEach((q) => {
      const secs = q.at[1] - q.at[0];
      // A follow-up question is only its stem — the passage played with the one before.
      expect(secs, `câu ${q.n}`).toBeGreaterThan(q.sharesPassage ? 3 : 12);
      expect(secs, `câu ${q.n}`).toBeLessThan(50);
    });
  });

  it('marks exactly the second question of each two-question passage', () => {
    const shared = H41001_LISTEN.filter((q) => q.sharesPassage).map((q) => q.n);
    // 36–45 is five passages of two questions, so the follow-ups are the odd ones.
    expect(shared).toEqual([37, 39, 41, 43, 45]);
    // A follow-up can never be first: it would have nothing to follow.
    shared.forEach((n) => expect(H41001_LISTEN[n - 2].sharesPassage).toBeFalsy());
  });

  it('carries the recording\'s own words for every question', () => {
    H41001_LISTEN.forEach((q) => {
      expect(q.script.length, `câu ${q.n}`).toBeGreaterThan(0);
      expect(q.script.every((l) => l.trim().length > 5), `câu ${q.n}`).toBe(true);
      // Part 1 reads one paragraph and prints the statement; parts 2–3 always ask a 问.
      if (q.n <= TF_COUNT) {
        expect(q.script, `câu ${q.n}`).toHaveLength(1);
        expect(q.ask, `câu ${q.n}`).toBeUndefined();
      } else {
        expect(q.ask, `câu ${q.n}`).toBeTruthy();
      }
    });
  });

  /**
   * The script was cut out of one long transcript, and the first attempt let the part-2
   * worked example slide onto the end of question 10 — plausible-looking Chinese
   * attached to the wrong question, which is worse than no script at all.
   */
  it('never carries a neighbour\'s lines', () => {
    H41001_LISTEN.filter((q) => q.n > TF_COUNT && q.n < 36).forEach((q) => {
      expect(q.script.length, `câu ${q.n}`).toBeGreaterThan(1);
      expect(q.script.every((l) => /^[男女]：/.test(l)), `câu ${q.n}`).toBe(true);
    });
    // 36–45 are read as monologues, so no speaker labels at all.
    H41001_LISTEN.filter((q) => q.n >= 36).forEach((q) => {
      expect(q.script.some((l) => /^[男女]：/.test(l)), `câu ${q.n}`).toBe(false);
    });
  });

  it('quotes the deciding words straight out of the script', () => {
    H41001_LISTEN.forEach((q) => {
      const spoken = q.script.join('') + (q.ask ?? '');
      // A cue typed by hand rather than copied would explain the wrong sentence
      // convincingly, which is the one failure mode worth a test of its own.
      expect(spoken.includes(q.cue), `câu ${q.n}: ${q.cue}`).toBe(true);
      // Three characters is a real cue — 没纸了 decides question 11 on its own — but a
      // shorter fragment would highlight noise.
      expect(q.cue.length, `câu ${q.n}`).toBeGreaterThanOrEqual(3);
    });
  });

  it('gives both questions of a shared passage the same passage', () => {
    H41001_LISTEN.filter((q) => q.sharesPassage).forEach((q) => {
      const first = H41001_LISTEN[q.n - 2];
      expect(q.script, `câu ${q.n}`).toEqual(first.script);
      // …but their own questions differ, or one of them is a copy of the other.
      expect(q.ask, `câu ${q.n}`).not.toBe(first.ask);
    });
  });

  it('has an answer waiting for every question it asks', () => {
    expect(paper).toBeTruthy();
    H41001_LISTEN.forEach((q) => {
      const a = paper.key[q.n - 1];
      expect(a, `câu ${q.n}`).toBeTruthy();
      // Part 1 is true/false; the rest are lettered. Marking a ✓ against an "A" would
      // fail every attempt at that question.
      if (q.n <= TF_COUNT) expect(['T', 'F'], `câu ${q.n}`).toContain(a);
      else expect(['A', 'B', 'C', 'D'], `câu ${q.n}`).toContain(a);
    });
  });
});
