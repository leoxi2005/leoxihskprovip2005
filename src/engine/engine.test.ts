import { beforeEach, describe, expect, it } from 'vitest';
import {
  CONFUSABLES,
  DECK,
  EXTRA_TOPIC,
  EXTRA2_TOPICS,
  EXTRA3_TOPICS,
  IMAGES,
  MYSONG,
  NEW_TOPICS,
  OLD_IDS,
  STORIES,
} from '../data';
import { EXTRA2_GRAMMAR, EXTRA2_VOCAB } from '../data/extra2';
import { EXTRA3_GRAMMAR, EXTRA3_VOCAB } from '../data/extra3';
import { EXTRA4_VOCAB } from '../data/extra4';
import { GameEngine } from './GameEngine';
import { stripTones, tonePattern } from './pinyin';
import { ttsFor } from './questions';
import {
  buildSession,
  clozeable,
  endlessBatch,
  leechesOf,
  matchTopic,
  pickDue,
  pickWords,
  pools,
  topicsOf,
} from './session';
import {
  LEECH_AT,
  MAX_BOX,
  gradeId,
  isLeech,
  laneId,
  laneOf,
  migrateSrs,
  newBudget,
  nextEntry,
  seedRecallLanes,
  spendNewBudget,
  type SrsMap,
} from './storage';
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
  'tone',
  'cloze',
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
    expect(build('mysong')).toHaveLength(13);
  });

  /**
   * Match used to deal six boards off an untouched deck, which meant meeting 24 words
   * for the first time in one sitting. The daily budget now bounds it instead.
   */
  it('bounds a match session by the day’s new-word budget', () => {
    expect(build('match')).toHaveLength(Math.floor(DEFAULT_SETTINGS.newPerDay / 4));
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
    expect(e.box).toBe(MAX_BOX);
    // Top box = 75 days out, jittered ±10% so a batch never returns as one lump.
    const gap = e.due - Date.now();
    expect(gap).toBeGreaterThan(6480e6 * 0.88);
    expect(gap).toBeLessThan(6480e6 * 1.12);

    const missed = nextEntry(e, false);
    expect(missed.box).toBe(0);
    expect(missed.lapses).toBe(1);
  });

  it('shortens the interval when a correct answer was slow', () => {
    const fast = nextEntry({ box: 3, due: 0 }, true, false);
    const slow = nextEntry({ box: 3, due: 0 }, true, true);
    expect(slow.box).toBe(fast.box);
    // 0.6× the gap, with both ends jittered — the ordering has to hold regardless.
    expect(slow.due - Date.now()).toBeLessThan((fast.due - Date.now()) * 0.85);
  });

  it('counts a word as a leech only after enough misses', () => {
    let e = nextEntry(undefined, false);
    for (let i = 1; i < LEECH_AT; i++) e = nextEntry(e, false);
    expect(e.lapses).toBe(LEECH_AT);
    expect(isLeech(e)).toBe(true);
    expect(isLeech({ box: 0, due: 0, lapses: LEECH_AT - 1 })).toBe(false);
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

describe('the Bài 13–16 drop', () => {
  it('adds every word exactly once', () => {
    // The SRS id is `w:<hanzi>`, so two entries for one word would share a box.
    const seen = DECK.vocab.map((v) => v.h);
    expect(new Set(seen).size).toBe(seen.length);
    EXTRA2_VOCAB.forEach((v) => {
      expect(DECK.vocab.filter((x) => x.h === v.h), v.h).toHaveLength(1);
    });
  });

  it('gives every word a reading, a meaning and an example', () => {
    EXTRA2_VOCAB.forEach((v) => {
      expect(v.p, v.h).toBeTruthy();
      expect(v.m, v.h).toBeTruthy();
      expect(v.ex, v.h).toContain(v.h);
      expect(v.exVi, v.h).toBeTruthy();
      // Function words are unlearnable from a bare gloss — every word gets a hint.
      expect(STORIES[v.h], v.h).toBeTruthy();
    });
  });

  it('keeps every cloze self-consistent, with the answer among the options', () => {
    EXTRA2_GRAMMAR.forEach((g) => {
      expect(g.opts, g.id).toContain(g.a);
      expect(new Set(g.opts).size, g.id).toBe(g.opts.length);
      expect(g.sent, g.id).toContain('____');
      expect(g.sent.replace('____', g.a), g.id).toBe(g.full);
    });
  });

  it('leaves each new topic playable on its own', () => {
    EXTRA2_TOPICS.forEach((t) => {
      const only = { [t]: true };
      // Boss and lightning both need at least 8 words in the pool.
      expect(pools(only).vocab.length, t).toBeGreaterThanOrEqual(8);
      expect(pools(only).grammar.length, t).toBeGreaterThan(0);
      expect(buildSession('boss', only, {}, DEFAULT_SETTINGS), t).toHaveLength(8);
    });
  });
});

describe('the Bài 17–19 drop', () => {
  it('adds every word exactly once', () => {
    // The SRS id is `w:<hanzi>`, so two entries for one word would share a box.
    const seen = DECK.vocab.map((v) => v.h);
    expect(new Set(seen).size).toBe(seen.length);
    EXTRA3_VOCAB.forEach((v) => {
      expect(DECK.vocab.filter((x) => x.h === v.h), v.h).toHaveLength(1);
    });
  });

  it('gives every word a reading, a meaning and an example', () => {
    EXTRA3_VOCAB.forEach((v) => {
      expect(v.p, v.h).toBeTruthy();
      expect(v.m, v.h).toBeTruthy();
      expect(v.ex, v.h).toContain(v.h);
      expect(v.exVi, v.h).toBeTruthy();
      // Function words are unlearnable from a bare gloss — every word gets a hint.
      expect(STORIES[v.h], v.h).toBeTruthy();
    });
  });

  it('keeps every cloze self-consistent, with the answer among the options', () => {
    EXTRA3_GRAMMAR.forEach((g) => {
      expect(g.opts, g.id).toContain(g.a);
      expect(new Set(g.opts).size, g.id).toBe(g.opts.length);
      expect(g.sent, g.id).toContain('____');
      expect(g.sent.replace('____', g.a), g.id).toBe(g.full);
      // A cloze id collision would silently drop one of the two items.
      expect(DECK.grammar.filter((x) => x.id === g.id), g.id).toHaveLength(1);
    });
  });

  it('leaves each new topic playable on its own', () => {
    EXTRA3_TOPICS.forEach((t) => {
      const only = { [t]: true };
      // Boss and lightning both need at least 8 words in the pool.
      expect(pools(only).vocab.length, t).toBeGreaterThanOrEqual(8);
      expect(pools(only).grammar.length, t).toBeGreaterThan(0);
      expect(buildSession('boss', only, {}, DEFAULT_SETTINGS), t).toHaveLength(8);
    });
  });
});

describe('the ⭐ shortcut', () => {
  it('isolates exactly the topics added after the bundle', () => {
    const engine = new GameEngine();
    engine.init();
    engine.selOnly(NEW_TOPICS);
    // selOnly walks `engine.topics`, so the order here has to match deck order.
    expect(engine.topics.filter((t) => engine.sel[t])).toEqual([...NEW_TOPICS]);
    // The notebook and every game mode read the same pool, so both narrow together.
    expect(engine.pools().vocab).toHaveLength(
      EXTRA2_VOCAB.length + EXTRA3_VOCAB.length + EXTRA4_VOCAB.length,
    );
    engine.dispose();
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

describe('recognition and recall lanes', () => {
  it('routes each kind to its own lane, keeping the old id for recognition', () => {
    // Everything written before lanes existed used the bare id — recognition has to
    // keep it, or a year of progress lands in the wrong lane.
    expect(gradeId('w:通过', 'h2m')).toBe('w:通过');
    expect(gradeId('w:通过', 'm2h')).toBe('w:通过');
    expect(gradeId('w:通过', 'write')).toBe('w:通过#r');
    expect(gradeId('w:通过', 'dict')).toBe('w:通过#r');
    expect(laneOf('type')).toBe('recall');
    expect(laneOf('flash')).toBe('recog');
  });

  it('seeds the recall lane two boxes below what recognition had earned', () => {
    const srs: SrsMap = { 'w:A': { box: 5, due: Date.now() + 1e6 }, 'g:g1': { box: 4, due: 0 } };
    const out = seedRecallLanes(srs);
    expect(out['w:A#r'].box).toBe(3);
    expect(out['w:A'].box).toBe(5);
    // Only vocabulary has two lanes; grammar and the rest keep a single entry.
    expect(out['g:g1#r']).toBeUndefined();
  });

  it('does not re-seed on a second run', () => {
    const srs: SrsMap = { 'w:A': { box: 5, due: 0 } };
    const once = seedRecallLanes(srs);
    once['w:A#r'] = { box: 0, due: 0 };
    expect(seedRecallLanes(once)['w:A#r'].box).toBe(0);
  });

  it('asks a word once per session, on whichever lane is more overdue', () => {
    const now = Date.now();
    const [w] = pools(ALL_TOPICS).vocab;
    const srs: SrsMap = {
      [laneId('w:' + w.h, 'recog')]: { box: 2, due: now - 1000 },
      [laneId('w:' + w.h, 'recall')]: { box: 1, due: now - 90000 },
    };
    const { picks } = pickWords(srs, [w], 5, 10);
    expect(picks).toHaveLength(1);
    expect(picks[0].lane).toBe('recall');
    expect(picks[0].box).toBe(1);
  });

  it('treats an untouched recall lane as a new skill, not a new word', () => {
    const [w] = pools(ALL_TOPICS).vocab;
    const srs: SrsMap = { [laneId('w:' + w.h, 'recog')]: { box: 3, due: Date.now() + 1e9 } };
    // newLimit 0 — a brand-new word would be excluded, this one must not be.
    const { picks, newUsed } = pickWords(srs, [w], 5, 0);
    expect(picks).toHaveLength(1);
    expect(picks[0].lane).toBe('recall');
    expect(newUsed).toBe(0);
  });
});

describe('daily new-word budget', () => {
  it('spends down and refuses to go negative', () => {
    expect(newBudget(10)).toBe(10);
    spendNewBudget(4);
    expect(newBudget(10)).toBe(6);
    spendNewBudget(99);
    expect(newBudget(10)).toBe(0);
  });

  it('holds a first session to the budget instead of the session size', () => {
    const size = { ...DEFAULT_SETTINGS, sessionSize: 40, newPerDay: 5 };
    const first = buildSession('flash', ALL_TOPICS, {}, size);
    expect(first).toHaveLength(5);
    // Budget already spent — a second run the same day finds nothing new to teach.
    expect(buildSession('flash', ALL_TOPICS, {}, size)).toHaveLength(0);
  });
});

describe('tone drill', () => {
  const toneQs = build('tone');

  it('builds a full session of tone questions', () => {
    expect(toneQs.length).toBeGreaterThan(10);
    toneQs.forEach((q) => expect(q.kind).toBe('tone'));
  });

  it('offers four distinct spellings, one of them the deck’s own pinyin', () => {
    toneQs.forEach((q) => {
      if (q.kind !== 'tone') return;
      expect(q.opts).toHaveLength(4);
      expect(new Set(q.opts).size).toBe(4);
      expect(q.opts[q.ans]).toBe(q.word.p);
    });
  });

  it('never changes anything but the tone in a tone trap', () => {
    toneQs.forEach((q) => {
      if (q.kind !== 'tone' || q.trap !== 'tone') return;
      // Strip the marks and every option collapses onto the same syllables.
      const bare = q.opts.map(stripTones);
      expect(new Set(bare).size).toBe(1);
    });
  });

  it('keeps the tones intact in a sound trap', () => {
    toneQs.forEach((q) => {
      if (q.kind !== 'tone' || q.trap !== 'sound') return;
      const patterns = q.opts.map(tonePattern);
      // At least the distractors built from consonant swaps share the real pattern.
      expect(patterns.filter((p) => p === tonePattern(q.word.p)).length).toBeGreaterThan(1);
    });
  });
});

describe('example-sentence cloze', () => {
  it('only draws on words whose example really contains them', () => {
    clozeable(pools(ALL_TOPICS).vocab).forEach((w) => expect(w.ex).toContain(w.h));
  });

  it('cuts the word out and never leaks it through a distractor', () => {
    build('cloze').forEach((q) => {
      if (q.kind !== 'cloze') return;
      expect(q.sent).not.toContain(q.word.h);
      expect(q.sent).toContain('____');
      expect(q.opts[q.ans].h).toBe(q.word.h);
      q.opts.forEach((o, i) => {
        if (i !== q.ans) expect(q.word.ex).not.toContain(o.h);
      });
    });
  });
});

describe('leech mode', () => {
  it('collects the words that keep being missed, worst first', () => {
    const [a, b, c] = pools(ALL_TOPICS).vocab;
    const srs: SrsMap = {
      [laneId('w:' + a.h, 'recog')]: { box: 0, due: 0, lapses: LEECH_AT },
      [laneId('w:' + b.h, 'recall')]: { box: 0, due: 0, lapses: LEECH_AT + 4 },
      [laneId('w:' + c.h, 'recog')]: { box: 0, due: 0, lapses: LEECH_AT - 1 },
    };
    const stuck = leechesOf(srs, [a, b, c]);
    expect(stuck.map((w) => w.h)).toEqual([b.h, a.h]);
    expect(buildSession('leech', ALL_TOPICS, srs, DEFAULT_SETTINGS)).toHaveLength(2);
  });

  it('is empty when nothing has gone wrong enough to qualify', () => {
    expect(build('leech')).toHaveLength(0);
  });
});
