import { describe, expect, it } from 'vitest';
import {
  BUILTIN_PAPERS,
  LISTEN_COUNT,
  PAPER_PRESETS,
  TF_COUNT,
  optionsFor,
  parseKey,
  scoreKey,
  type KeyAnswer,
} from './realpaper';

/** A well-formed key: ten true/false then thirty-five letters. */
const GOOD = '✓✗✓✓✗✗✓✗✓✓' + 'ABCD'.repeat(8) + 'ABC';

describe('answer key', () => {
  it('reads a clean key', () => {
    const { key, error } = parseKey(GOOD);
    expect(error).toBeUndefined();
    expect(key).toHaveLength(LISTEN_COUNT);
    expect(key.slice(0, 3)).toEqual(['T', 'F', 'T']);
  });

  /**
   * Answer sheets write true/false four different ways depending on where the PDF came
   * from, and a key rejected over punctuation is a key nobody enters twice.
   */
  it('accepts every way an answer sheet writes true and false', () => {
    ['✓✗√×对错TFYN', '+-+-+-+-+-'].forEach((tf) => {
      const { key, error } = parseKey(tf + 'ABCD'.repeat(8) + 'ABC');
      expect(error, tf).toBeUndefined();
      expect(key.slice(0, 2), tf).toEqual(['T', 'F']);
    });
  });

  /**
   * Keys get pasted with their question numbers attached far more often than anyone
   * writes true/false as 1/0, so digits are ignored rather than read as answers.
   */
  it('ignores numbering, spaces and line breaks', () => {
    const messy =
      '1.✓ 2.✗ 3.✓ 4.✓ 5.✗\n6.✗ 7.✓ 8.✗ 9.✓ 10.✓\n' +
      '11.A 12.B 13.C 14.D 15.A 16.B 17.C 18.D 19.A 20.B 21.C 22.D 23.A 24.B 25.C ' +
      '26.D 27.A 28.B 29.C 30.D 31.A 32.B 33.C 34.D 35.A 36.B 37.C 38.D 39.A 40.B ' +
      '41.C 42.D 43.A 44.B 45.C';
    const { key, error } = parseKey(messy);
    expect(error).toBeUndefined();
    expect(key).toHaveLength(LISTEN_COUNT);
    expect(key[TF_COUNT]).toBe('A');
    expect(key.at(-1)).toBe('C');
  });

  it('reads full-width letters pasted out of a Chinese PDF', () => {
    const { key, error } = parseKey('✓✗✓✓✗✗✓✗✓✓' + 'ＡＢＣＤ'.repeat(8) + 'ＡＢＣ');
    expect(error).toBeUndefined();
    expect(key[TF_COUNT]).toBe('A');
  });

  it('says how many it found when the count is wrong', () => {
    expect(parseKey('✓✗✓').error).toContain('3');
    expect(parseKey(GOOD + 'A').error).toContain('46');
  });

  it('points at the first question in the wrong format', () => {
    // A letter where a true/false belongs.
    expect(parseKey('✓✗A✓✗✗✓✗✓✓' + 'ABCD'.repeat(8) + 'ABC').error).toContain('Câu 3');
    // A tick where a letter belongs.
    expect(parseKey('✓✗✓✓✗✗✓✗✓✓' + '✓BCD' + 'ABCD'.repeat(7) + 'ABC').error).toContain('Câu 11');
  });

  it('offers the right choices per question', () => {
    expect(optionsFor(0)).toEqual(['T', 'F']);
    expect(optionsFor(TF_COUNT - 1)).toEqual(['T', 'F']);
    expect(optionsFor(TF_COUNT)).toEqual(['A', 'B', 'C', 'D']);
  });
});

describe('marking a real paper', () => {
  const key = parseKey(GOOD).key;

  it('scales onto the section’s hundred points', () => {
    expect(scoreKey(key, key).points).toBe(100);
    expect(scoreKey(key, Array(LISTEN_COUNT).fill(null)).points).toBe(0);
  });

  it('counts blanks separately from wrong answers', () => {
    const given: (KeyAnswer | null)[] = key.slice();
    given[0] = null;
    given[1] = key[1] === 'T' ? 'F' : 'T';
    const s = scoreKey(key, given);
    expect(s.blank).toBe(1);
    expect(s.right).toBe(LISTEN_COUNT - 2);
    expect(s.wrong).toEqual([0, 1]);
  });

  it('lists the wrong questions so they can be listened to again', () => {
    const given: (KeyAnswer | null)[] = key.slice();
    given[12] = 'A';
    given[30] = 'A';
    const wrong = scoreKey(key, given).wrong;
    // Only the ones actually mismatched, and in question order.
    expect(wrong.every((i) => given[i] !== key[i])).toBe(true);
    expect(wrong).toEqual([...wrong].sort((a, b) => a - b));
  });
});

describe('built-in answer keys', () => {
  /**
   * These are transcribed from published answer sheets by hand, which is exactly the
   * kind of thing that goes wrong silently — a dropped answer shifts every question
   * after it and the learner is marked against nonsense.
   */
  it('parses cleanly, so no preset can ship mis-transcribed', () => {
    PAPER_PRESETS.forEach((p) => {
      const { key, error } = parseKey(p.key);
      expect(error, `${p.id}: ${error}`).toBeUndefined();
      expect(key, p.id).toHaveLength(LISTEN_COUNT);
      expect(p.name, p.id).toBeTruthy();
      expect(p.note, p.id).toBeTruthy();
    });
  });

  it('gives every preset a distinct id', () => {
    expect(new Set(PAPER_PRESETS.map((p) => p.id)).size).toBe(PAPER_PRESETS.length);
  });

  /**
   * Read off the sample paper's own 听力材料 script, question by question, after a key
   * copied from a PDF labelled "H41001 答案" turned out to belong to some other paper
   * and marked 37 of 45 questions wrongly. The spot checks below quote the line of
   * script that decides the answer, so a key swapped back in silently cannot pass.
   */
  it('holds the H41001 sample key as its own script gives it', () => {
    const key = parseKey(PAPER_PRESETS.find((p) => p.id === 'H41001')!.key).key;
    expect(key.slice(0, 10).join('')).toBe('TFFTFTTFTF');
    expect(key.slice(10, 25).join('')).toBe('ACCBCDCACABBACB');
    expect(key.slice(25).join('')).toBe('ADDCCBDCABBDDBDADBDA');

    // 3: 经理几乎没发现他有什么缺点 → the statement about spotting faults is false.
    expect(key[2]).toBe('F');
    // 5: 您的材料我已经翻译完了 → he did translate part two.
    expect(key[4]).toBe('F');
    // 12: 这本小说讲了一个爱情故事 → they are discussing a novel, option C.
    expect(key[11]).toBe('C');
    // 45: 下面我听听大家的意见 → the speaker is running a meeting, option A.
    expect(key[44]).toBe('A');
  });
});

describe('papers that ship with their recording', () => {
  /**
   * The sample paper is the one a learner can sit with nothing set up, so both halves
   * have to be there: a usable key, and a file the browser can actually reach.
   */
  it('carries a full key and a playable url', () => {
    expect(BUILTIN_PAPERS.length).toBeGreaterThan(0);
    BUILTIN_PAPERS.forEach((b) => {
      expect(b.key, b.id).toHaveLength(LISTEN_COUNT);
      // A key that failed to parse comes back short or empty, never usable silently.
      expect(b.key.every(Boolean), b.id).toBe(true);
      expect(b.url, b.id).toMatch(/audio\/.+\.(mp3|m4a|wav)$/);
    });
  });

  it('serves the recording from the site root, so a sub-path deploy still finds it', () => {
    BUILTIN_PAPERS.forEach((b) => expect(b.url.startsWith('/'), b.url).toBe(true));
  });

  it('names a preset that really declares an audio file', () => {
    BUILTIN_PAPERS.forEach((b) => {
      const preset = PAPER_PRESETS.find((p) => p.id === b.id);
      expect(preset?.audio, b.id).toBeTruthy();
      expect(b.url.endsWith(preset!.audio!), b.id).toBe(true);
    });
  });
});
