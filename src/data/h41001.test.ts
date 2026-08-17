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
