import { describe, expect, it } from 'vitest';
import {
  DECK,
  DEFAULT_OFF_TOPICS,
  HSK123_COUNT,
  HSK123_OVERLAP,
  HSK123_TOPICS,
  HSK4_BATCH,
  HSK4_COUNT,
  HSK4_OVERLAP,
  HSK4_TOPICS,
} from '.';
import { splitHsk123 } from './hsk123';
import { HSK4_ALL, splitHsk4 } from './hsk4';
import { toneSpots } from '../engine/pinyin';

/** Every HSK 1–3 row, before deduplication — `splitHsk123` with nothing to exclude. */
const L1_L2_L3 = () => splitHsk123(new Set<string>()).fresh;

describe('HSK 4 word list', () => {
  it('carries the full official level-4 list', () => {
    expect(HSK4_COUNT).toBe(600);
    expect(new Set(HSK4_ALL.map((w) => w.h)).size).toBe(600);
  });

  it('gives every word a toned pinyin, a part of speech and a meaning', () => {
    HSK4_ALL.forEach((w) => {
      expect(w.p, w.h).toBeTruthy();
      expect(w.pos, w.h).toBeTruthy();
      expect(w.m, w.h).toBeTruthy();
      // 呀 is a neutral-tone particle — the only entry with no mark to carry.
      if (w.h !== '呀') expect(toneSpots(w.p).length, `${w.h} ${w.p}`).toBeGreaterThan(0);
    });
  });

  it('gives every word an example sentence that actually contains it', () => {
    HSK4_ALL.forEach((w) => {
      expect(w.ex, w.h).toContain(w.h);
      expect(w.exVi, w.h).toBeTruthy();
    });
  });

  it('numbers batches after deduplication so each one is full', () => {
    const { fresh, topics } = splitHsk4(new Set(['安排', '安全', '按时']));
    expect(fresh).toHaveLength(HSK4_COUNT - 3);
    // Every batch but the last holds a full sitting.
    topics.slice(0, -1).forEach((t) => {
      expect(fresh.filter((w) => w.t === t)).toHaveLength(HSK4_BATCH);
    });
  });
});

describe('merged deck', () => {
  it('folds the official list in without duplicating a word', () => {
    expect(new Set(DECK.vocab.map((v) => v.h)).size).toBe(DECK.vocab.length);
  });

  it('covers every official HSK 4 word', () => {
    const have = new Set(DECK.vocab.map((v) => v.h));
    const missing = HSK4_ALL.filter((w) => !have.has(w.h)).map((w) => w.h);
    expect(missing).toEqual([]);
  });

  /**
   * The textbook deck was already three-quarters HSK 4 vocabulary, so folding the
   * official list in adds 266 words rather than 600 — and the batch topics have to be
   * sized off that number, not off the list length.
   */
  it('adds only the words the deck was missing', () => {
    expect(HSK4_OVERLAP).toBe(334);
    expect(HSK4_TOPICS).toHaveLength(Math.ceil((HSK4_COUNT - HSK4_OVERLAP) / HSK4_BATCH));
  });

  /**
   * Cloze runs on example sentences, and the deck used to have them for barely a third
   * of its words. Merging the official list fills nearly all of the gap.
   */
  it('leaves almost nothing without an example sentence', () => {
    const withEx = DECK.vocab.filter((v) => v.ex && v.ex.includes(v.h));
    expect(withEx.length / DECK.vocab.length).toBeGreaterThan(0.97);
  });
});

describe('HSK 1–3 base', () => {
  /**
   * The row count is deliberately not asserted against 600. Plenty of HSK 1–3 words
   * were already in the textbook deck or turn up on the level-4 list, so this file
   * only holds what nothing else covers — coverage is the property worth pinning,
   * and it is asserted at the bottom of this block.
   */
  it('lists each base word exactly once', () => {
    const all = L1_L2_L3();
    expect(all.length).toBeGreaterThan(500);
    expect(new Set(all.map((w) => w.h)).size).toBe(all.length);
    expect(HSK123_COUNT).toBe(all.length);
  });

  it('gives every base word a toned pinyin and a usable example', () => {
    L1_L2_L3().forEach((w) => {
      expect(w.p, w.h).toBeTruthy();
      expect(w.m, w.h).toBeTruthy();
      expect(w.ex, w.h).toContain(w.h);
      expect(w.exVi, w.h).toBeTruthy();
    });
  });

  it('never leaves a non-Chinese word inside a Chinese sentence', () => {
    L1_L2_L3().forEach((w) => expect(w.ex, w.h).not.toMatch(/[A-Za-zА-Яа-я]/));
  });

  /**
   * The point of the split: a word that already exists must not be dealt a second
   * card, because the SRS id is the hanzi and two cards would fight over one box.
   */
  it('files each word under exactly one level', () => {
    const seen = new Set<string>();
    DECK.vocab.forEach((v) => {
      expect(seen.has(v.h), `${v.h} xuất hiện hai lần`).toBe(false);
      seen.add(v.h);
    });
    expect(DECK.vocab).toHaveLength(
      408 + (HSK4_COUNT - HSK4_OVERLAP) + (HSK123_COUNT - HSK123_OVERLAP),
    );
  });

  it('starts HSK 1–2 switched off and HSK 3 switched on', () => {
    // Levels 1–2 are coverage, not coursework — see DEFAULT_OFF_TOPICS.
    expect(DEFAULT_OFF_TOPICS.length).toBeGreaterThan(0);
    DEFAULT_OFF_TOPICS.forEach((t) => expect(t).toMatch(/^HSK[12] · Đợt/));
    expect(HSK123_TOPICS.some((t) => t.startsWith('HSK3'))).toBe(true);
    HSK123_TOPICS.filter((t) => t.startsWith('HSK3')).forEach((t) =>
      expect(DEFAULT_OFF_TOPICS).not.toContain(t),
    );
  });

  it('covers the whole 1200-word HSK 4 syllabus', () => {
    const have = new Set(DECK.vocab.map((v) => v.h));
    const missing = [...HSK4_ALL, ...L1_L2_L3()].filter((w) => !have.has(w.h));
    expect(missing.map((w) => w.h)).toEqual([]);
  });
});
