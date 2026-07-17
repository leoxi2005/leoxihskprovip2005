import { beforeEach, describe, expect, it } from 'vitest';
import { CONFUSABLES, DECK, EXTRA_TOPIC, IMAGES, MYSONG, OLD_IDS } from '../data';
import { ttsFor } from './questions';
import { buildSession, endlessBatch, matchTopic, pickDue, pools, topicsOf } from './session';
import { migrateSrs, nextEntry, type SrsMap } from './storage';
import { DEFAULT_SETTINGS, isChoiceQ, isTileQ, type GameId, type Question } from './types';

const ALL_TOPICS = Object.fromEntries(topicsOf().map((t) => [t, true]));
const build = (g: GameId, srs: SrsMap = {}) => buildSession(g, ALL_TOPICS, srs, DEFAULT_SETTINGS);

beforeEach(() => localStorage.clear());

describe('topics', () => {
  it('selects the whole vocab deck when every topic is on', () => {
    const P = pools(ALL_TOPICS);
    expect(P.vocab).toHaveLength(DECK.vocab.length);
    expect(P.sentences).toHaveLength(DECK.sentences.length);
    expect(P.passages).toHaveLength(DECK.passages.length);
    expect(P.orders).toHaveLength(DECK.orders.length);
  });

  /**
   * Known gap, carried over from the prototype: chips come from vocab topics, so
   * grammar tagged with a topic no vocab uses ("Bài 3") can never be selected.
   * Fix by giving those items a reachable topic, or by deriving chips from all
   * content topics. Asserted here so the gap can't widen unnoticed.
   */
  it('cannot reach grammar whose topic has no vocab', () => {
    const unreachable = DECK.grammar.filter((g) => !matchTopic(ALL_TOPICS, g.t));
    expect(unreachable.map((g) => g.t)).toEqual(Array(10).fill('Bài 3'));
    expect(pools(ALL_TOPICS).grammar).toHaveLength(DECK.grammar.length - 10);
  });

  it('matches span topics against their member topics', () => {
    expect(matchTopic({ 'Chủ đề 22': true }, 'Chủ đề 22–23')).toBe(true);
    expect(matchTopic({ 'Chủ đề 23': true }, 'Chủ đề 22–23')).toBe(true);
    expect(matchTopic({ 'Chủ đề 22': false, 'Chủ đề 23': false }, 'Chủ đề 22–23')).toBe(false);
  });

  it('builds nothing when no topic is selected', () => {
    expect(buildSession('mix', {}, {}, DEFAULT_SETTINGS)).toHaveLength(0);
  });
});

const MODES: GameId[] = [
  'mix',
  'boss',
  'tf',
  'write',
  'listen',
  'match',
  'flash',
  'read',
  'song',
  'mysong',
  'confuse',
  'endless',
];

describe.each(MODES)('%s session', (g) => {
  it('is playable and well-formed', () => {
    const session = build(g);
    expect(session.length).toBeGreaterThan(0);

    session.forEach((q: Question) => {
      if (isChoiceQ(q)) {
        // Confusables are a duel between exactly two words; everything else offers 4.
        expect(q.opts).toHaveLength(q.kind === 'conf' ? 2 : 4);
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(q.opts.length);
        const labels = q.opts.map((o) => (typeof o === 'string' ? o : o.h));
        expect(new Set(labels).size, `duplicate options in ${q.kind}`).toBe(labels.length);
      }
      if (isTileQ(q)) {
        // The answer must be constructible from the tiles offered.
        const pool = q.tiles.slice();
        const needed = q.kind === 'write' ? q.ansStr.split('') : q.o.tokens;
        for (const ch of needed) {
          const at = pool.indexOf(ch);
          expect(at, `tile "${ch}" missing`).toBeGreaterThanOrEqual(0);
          pool.splice(at, 1);
        }
      }
      if (q.kind === 'match') {
        expect(q.pairs).toHaveLength(4);
        expect([...q.rightOrder].sort()).toEqual([0, 1, 2, 3]);
      }
      // A true/false statement is true exactly when the shown meaning is the real one.
      if (q.kind === 'tf') expect(q.isTrue).toBe(q.shown === q.w.m);
      if (q.kind !== 'match') expect(ttsFor(q), `${q.kind} has nothing to speak`).toBeTruthy();
    });
  });
});

describe('session shape', () => {
  it('matches the sizes the design pins down', () => {
    expect(build('boss')).toHaveLength(8);
    expect(build('tf')).toHaveLength(12);
    expect(build('match')).toHaveLength(6);
    expect(build('mysong')).toHaveLength(13);
  });

  it('flags every boss question', () => {
    expect(build('boss').every((q) => q.boss)).toBe(true);
  });

  it('interleaves specials between vocab questions in a mix', () => {
    const kinds = build('mix').map((q) => q.kind);
    expect(kinds.some((k) => ['gram', 'sent', 'pass', 'order', 'match'].includes(k))).toBe(true);
  });

  it('never repeats a blank as a distractor within a song', () => {
    build('song').forEach((q) => {
      if (q.kind !== 'song') return;
      const blanks = q.song.lines.map((l) => l.blank);
      const wrong = q.opts.filter((_, i) => i !== q.ans).map((o) => o.h);
      expect(wrong.some((h) => blanks.includes(h))).toBe(false);
    });
  });
});

describe('spaced repetition', () => {
  it('walks the box ladder up and resets on a miss', () => {
    let e = nextEntry(undefined, true);
    expect(e.box).toBe(1);
    for (let i = 0; i < 10; i++) e = nextEntry(e, true);
    expect(e.box).toBe(5);
    // Box 5 = 12 days out.
    expect(e.due - Date.now()).toBeCloseTo(1036800e3, -4);
    expect(nextEntry(e, false).box).toBe(0);
  });

  it('serves due items first, then unseen, then not-yet-due', () => {
    const now = Date.now();
    const srs: SrsMap = {
      'w:A': { box: 1, due: now - 1000 },
      'w:B': { box: 1, due: now + 1e9 },
      'w:C': { box: 2, due: now - 5000 },
    };
    const list = [{ h: 'A' }, { h: 'B' }, { h: 'C' }, { h: 'D' }];
    const picked = pickDue(srs, list, (x) => 'w:' + x.h, 4);
    // C is more overdue than A; D is unseen; B is not due yet.
    expect(picked.map((p) => p.x.h)).toEqual(['C', 'A', 'D', 'B']);
  });

  it('rotates content between sessions once everything is scheduled ahead', () => {
    const ahead: SrsMap = Object.fromEntries(
      DECK.vocab.map((v) => ['w:' + v.h, { box: 3, due: Date.now() + 1e9 }]),
    );
    const first = build('flash', ahead).map((q) => ('word' in q ? q.word.h : ''));
    const second = build('flash', ahead).map((q) => ('word' in q ? q.word.h : ''));
    expect(first).not.toEqual(second);
  });
});

describe('v1 progress migration', () => {
  it('rewrites positional keys onto stable ids', () => {
    const migrated = migrateSrs({
      w0: { box: 2, due: 1 },
      g1: { box: 1, due: 2 },
      r3: { box: 0, due: 3 },
      'w:已经': { box: 4, due: 4 },
    });
    expect(migrated['w:' + OLD_IDS[0]]).toEqual({ box: 2, due: 1 });
    expect(migrated['g:g1']).toBeDefined();
    expect(migrated['s:r3']).toBeDefined();
    // Already-migrated keys are left alone.
    expect(migrated['w:已经']).toEqual({ box: 4, due: 4 });
  });
});

describe('confusables (经过 / 通过)', () => {
  it('drills the whole set, two options each, answer inside the pair', () => {
    const session = build('confuse');
    expect(session).toHaveLength(CONFUSABLES.length);
    session.forEach((q) => {
      expect(q.kind).toBe('conf');
      if (q.kind !== 'conf') return;
      expect(q.opts).toEqual(q.c.pair);
      expect(q.opts[q.ans]).toBe(q.c.a);
    });
  });

  it('keeps every item self-consistent and explained', () => {
    CONFUSABLES.forEach((c) => {
      expect(c.pair, c.id).toContain(c.a);
      expect(c.sent, c.id).toContain('____');
      // The filled sentence must be the cloze with the answer dropped in.
      expect(c.sent.replace('____', c.a), c.id).toBe(c.full);
      // The rule is the reason this mode exists — never ship an item without one.
      expect(c.why.length, c.id).toBeGreaterThan(20);
    });
  });

  it('is reachable from a topic that actually has vocab', () => {
    // A topic with no vocab has no chip, so its content could never be selected.
    expect(DECK.vocab.some((v) => v.t === EXTRA_TOPIC)).toBe(true);
    expect(pools(ALL_TOPICS).confusables).toHaveLength(CONFUSABLES.length);
    expect(pools({ [EXTRA_TOPIC]: true }).confusables).toHaveLength(CONFUSABLES.length);
  });

  it('leaves the lesson topic playable on its own', () => {
    const only = { [EXTRA_TOPIC]: true };
    // Boss and lightning both need at least 8 words in the pool.
    expect(pools(only).vocab.length).toBeGreaterThanOrEqual(8);
    expect(buildSession('boss', only, {}, DEFAULT_SETTINGS)).toHaveLength(8);
  });
});

describe('the real song is aligned to its recording', () => {
  it('gives every line a slice of the song to sing', () => {
    MYSONG.lines.forEach((l, i) => {
      expect(l.t, `line ${i + 1} has no start`).toBeGreaterThan(0);
      expect(l.end, `line ${i + 1} has no end`).toBeGreaterThan(l.t!);
      // A sung line runs a few seconds; anything longer means a bad alignment.
      expect(l.end! - l.t!, `line ${i + 1} is ${l.end! - l.t!}s long`).toBeLessThanOrEqual(12);
      expect(l.end, `line ${i + 1} runs past the song`).toBeLessThanOrEqual(MYSONG.duration);
    });
  });

  it('keeps the lines in the order they are sung', () => {
    const starts = MYSONG.lines.map((l) => l.t!);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it('asks about a line the player can actually hear', () => {
    // The whole point: every question maps to a real slice of audio.
    build('mysong').forEach((q) => {
      expect(q.kind).toBe('song');
      if (q.kind !== 'song') return;
      expect(q.yt).toBe(true);
      expect(q.line.t).toBeDefined();
      expect(q.line.end).toBeDefined();
    });
  });

  it('hides exactly the word being asked for', () => {
    MYSONG.lines.forEach((l) => {
      expect(l.cn, l.cn).toContain(l.blank);
      expect(l.cn.split(l.blank).join(' ____ ')).not.toContain(l.blank);
    });
  });
});

describe('endless mode', () => {
  it('starts with a single question — the run grows as you survive', () => {
    expect(build('endless')).toHaveLength(1);
  });

  it('only deals fast recognition questions, never typing', () => {
    const batch = endlessBatch(ALL_TOPICS, {}, 40);
    expect(batch).toHaveLength(40);
    batch.forEach((q) => expect(['m2h', 'h2m']).toContain(q.kind));
  });
});

describe('data bundle', () => {
  it('has an id for every gradable item', () => {
    const P = pools(ALL_TOPICS);
    [...P.grammar, ...P.sentences, ...P.passages, ...P.orders].forEach((x) => expect(x.id).toBeTruthy());
  });

  it('holds the correct answer inside its own options', () => {
    DECK.grammar.forEach((g) => expect(g.opts).toContain(g.a));
    DECK.passages.forEach((p) =>
      p.questions.forEach((q) => expect(q.opts[q.correct]).toBeTruthy()),
    );
  });

  it('bundles every illustration locally instead of hotlinking a CDN', () => {
    Object.values(IMAGES).forEach((src) => {
      expect(src, src).not.toMatch(/^https?:/);
      // Anchored on BASE_URL so the paths survive being served under a repo subpath.
      expect(src, src).toBe(import.meta.env.BASE_URL + src.replace(/^\//, ''));
    });
  });
});
