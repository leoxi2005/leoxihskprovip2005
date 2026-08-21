import {
  COLLOCATIONS,
  CONFUSABLES,
  DECK,
  FIXES,
  MYSONG,
  SONGS,
  type Collocation,
  type Confusable,
  type FixItem,
  type Grammar,
  type Order,
  type Passage,
  type Sentence,
  type Vocab,
} from '../data';
import { NUM_DRILLS } from './numbers';
import {
  buildBoss,
  buildLightning,
  makeBuildQ,
  makeClozeQ,
  makeColloQ,
  makeConfQ,
  makeFixQ,
  makeNumQ,
  makeGramQ,
  makeMatchQ,
  makeMySongQ,
  makeOrderQ,
  makePassQ,
  makeSentQ,
  makeSDictQ,
  makeSongQ,
  makeToneQ,
  makeWordQ,
  shuffle,
} from './questions';
import {
  KEYS,
  isLeech,
  laneId,
  laneOf,
  loadRaw,
  newBudget,
  saveRaw,
  spendNewBudget,
  type Lane,
  type SrsMap,
} from './storage';
import type { GameId, Kind, Question, Settings, SrsEntry } from './types';

/** Topic selection, keyed by topic name. */
export type TopicSel = Record<string, boolean>;

export interface Pools {
  vocab: Vocab[];
  grammar: Grammar[];
  sentences: Sentence[];
  passages: Passage[];
  orders: Order[];
  confusables: Confusable[];
  collocations: Collocation[];
  fixes: FixItem[];
}

/**
 * Non-vocab content is tagged with span topics ("Chủ đề 22–23") that have no chip
 * of their own, so they match if any covered topic is on.
 */
export function matchTopic(sel: TopicSel, t: string): boolean {
  if (sel[t]) return true;
  if (t === 'Tổng hợp') return true;
  if (t === 'Chủ đề 22–23') return !!(sel['Chủ đề 22'] || sel['Chủ đề 23']);
  if (t === 'Chủ đề 21–23') return !!(sel['Chủ đề 21'] || sel['Chủ đề 22'] || sel['Chủ đề 23']);
  return false;
}

export function pools(sel: TopicSel): Pools {
  return {
    vocab: DECK.vocab.filter((v) => sel[v.t]),
    grammar: DECK.grammar.filter((g) => matchTopic(sel, g.t)),
    sentences: DECK.sentences.filter((s) => matchTopic(sel, s.t)),
    passages: DECK.passages.filter((p) => matchTopic(sel, p.t)),
    orders: DECK.orders.filter((o) => matchTopic(sel, o.t)),
    confusables: CONFUSABLES.filter((c) => matchTopic(sel, c.t)),
    collocations: COLLOCATIONS.filter((c) => matchTopic(sel, c.t)),
    fixes: FIXES.filter((f) => matchTopic(sel, f.t)),
  };
}

/**
 * Từ điển dùng để cắt câu thành quân bài — chính là deck, không phải một danh sách
 * ngoài. Xem `segment.ts` để biết vì sao.
 */
export const DICT: ReadonlySet<string> = new Set(DECK.vocab.map((v) => v.h));

/** Những từ có câu ví dụ cắt sạch được thành quân bài. Tính một lần rồi nhớ luôn. */
let buildableCache: Set<string> | null = null;
export function buildableSet(): Set<string> {
  if (!buildableCache) {
    buildableCache = new Set(DECK.vocab.filter((w) => makeBuildQ(w, DICT)).map((w) => w.h));
  }
  return buildableCache;
}

/** Từ dựng được câu xếp chữ, trong phạm vi chủ đề đang bật. */
export const buildable = (list: Vocab[]): Vocab[] => {
  const ok = buildableSet();
  return list.filter((w) => ok.has(w.h));
};

/** Từ có câu ví dụ đủ dài để chép chính tả. */
export const dictatable = (list: Vocab[]): Vocab[] => list.filter((w) => makeSDictQ(w) !== null);

export const topicsOf = (): string[] => [...new Set(DECK.vocab.map((v) => v.t))];

interface Picked<T> {
  x: T;
  id: string;
  e: SrsEntry | undefined;
}

/**
 * Due items first (soonest first), then unseen, then not-yet-due.
 *
 * The not-yet-due tail is rotated by a persisted cursor so back-to-back sessions
 * on a small deck don't serve the same questions every time.
 *
 * Vocabulary does not go through here — it has two lanes per word, so it uses
 * `pickWords` instead.
 */
export function pickDue<T>(
  srs: SrsMap,
  list: T[],
  idf: (x: T, i: number) => string,
  n: number,
  rotKey?: string,
): Picked<T>[] {
  const now = Date.now();
  const all: Picked<T>[] = list.map((x, i) => ({ x, id: idf(x, i), e: srs[idf(x, i)] }));
  const due = shuffle(all.filter((o) => o.e && o.e.due <= now)).sort((a, b) => a.e!.due - b.e!.due);
  const fresh = shuffle(all.filter((o) => !o.e));
  let later = all.filter((o) => o.e && o.e.due > now);

  if (rotKey && later.length > 1) {
    let cur = parseInt(loadRaw(KEYS.rot + rotKey) || '', 10) || 0;
    cur = cur % later.length;
    later = later.slice(cur).concat(later.slice(0, cur));
    saveRaw(KEYS.rot + rotKey, String((cur + Math.max(1, n)) % Math.max(1, later.length)));
  } else {
    later = shuffle(later);
  }
  return [...due, ...fresh, ...later].slice(0, n);
}

// -- vocabulary picking (two lanes per word) --------------------------------

export interface PickedWord {
  w: Vocab;
  lane: Lane;
  /** Box of the chosen lane. */
  box: number;
  /** This lane has never been graded. */
  fresh: boolean;
  leech: boolean;
}

type Bucket = 'due' | 'grow' | 'new' | 'later';

interface Cand extends PickedWord {
  bucket: Bucket;
  /** Sort key inside `due`/`later`: the due timestamp. */
  at: number;
}

const laneEntry = (srs: SrsMap, w: Vocab, lane: Lane): SrsEntry | undefined =>
  srs[laneId('w:' + w.h, lane)];

/**
 * Choose which lane of a word to serve, and which queue it belongs to.
 *
 * A word only ever appears once per session even though it carries two lanes —
 * being asked the same word twice in ten minutes teaches the session, not the word.
 *
 * `grow` is the case that would otherwise be mis-filed: a word whose recognition is
 * mature but whose recall lane has never been touched. That is a new *skill*, not a
 * new word, so it must not eat the day's new-word budget.
 */
function candidate(srs: SrsMap, w: Vocab, now: number): Cand {
  const lanes: Lane[] = ['recog', 'recall'];
  const seen = lanes.map((lane) => ({ lane, e: laneEntry(srs, w, lane) }));
  const leech = seen.some((s) => isLeech(s.e));

  const due = seen.filter((s) => s.e && s.e.due <= now).sort((a, b) => a.e!.due - b.e!.due)[0];
  if (due) {
    return { w, lane: due.lane, box: due.e!.box, fresh: false, leech, bucket: 'due', at: due.e!.due };
  }

  const untouched = seen.filter((s) => !s.e);
  if (untouched.length === 2) {
    return { w, lane: 'recog', box: 0, fresh: true, leech, bucket: 'new', at: now };
  }
  if (untouched.length === 1) {
    return { w, lane: untouched[0].lane, box: 0, fresh: true, leech, bucket: 'grow', at: now };
  }

  const soonest = seen.slice().sort((a, b) => a.e!.due - b.e!.due)[0];
  return {
    w,
    lane: soonest.lane,
    box: soonest.e!.box,
    fresh: false,
    leech,
    bucket: 'later',
    at: soonest.e!.due,
  };
}

export interface WordPick {
  picks: PickedWord[];
  /** Brand-new words handed out, to be charged against today's budget. */
  newUsed: number;
}

/**
 * Session vocabulary, in the order it should be taught.
 *
 * Order is: leeches, then everything genuinely due, then new skills on known words,
 * then brand-new words up to the day's budget, then a rotated slice of what is not
 * due yet so a short deck still varies between runs.
 */
export function pickWords(
  srs: SrsMap,
  list: Vocab[],
  n: number,
  newLimit: number,
  rotKey = 'vocab',
): WordPick {
  const now = Date.now();
  const cands = list.map((w) => candidate(srs, w, now));

  const byAt = (a: Cand, b: Cand) => a.at - b.at;
  const due = shuffle(cands.filter((c) => c.bucket === 'due')).sort(byAt);
  // A leech is the most expensive word in the deck — it gets seen first, while there
  // is still attention left to spend on re-learning it.
  const dueOrdered = [...due.filter((c) => c.leech), ...due.filter((c) => !c.leech)];
  const grow = shuffle(cands.filter((c) => c.bucket === 'grow'));
  const fresh = shuffle(cands.filter((c) => c.bucket === 'new')).slice(0, Math.max(0, newLimit));
  let later = cands.filter((c) => c.bucket === 'later').sort(byAt);

  if (later.length > 1) {
    let cur = parseInt(loadRaw(KEYS.rot + rotKey) || '', 10) || 0;
    cur = cur % later.length;
    later = later.slice(cur).concat(later.slice(0, cur));
    saveRaw(KEYS.rot + rotKey, String((cur + Math.max(1, n)) % Math.max(1, later.length)));
  }

  const picks = [...dueOrdered, ...grow, ...fresh, ...later].slice(0, n);
  return { picks, newUsed: picks.filter((p) => p.bucket === 'new').length };
}

/** Words whose recognition or recall lane has been missed `LEECH_AT` times or more. */
export function leechesOf(srs: SrsMap, list: Vocab[]): Vocab[] {
  return list
    .filter((w) => isLeech(laneEntry(srs, w, 'recog')) || isLeech(laneEntry(srs, w, 'recall')))
    .sort((a, b) => lapsesOf(srs, b) - lapsesOf(srs, a));
}

export const lapsesOf = (srs: SrsMap, w: Vocab): number =>
  (laneEntry(srs, w, 'recog')?.lapses ?? 0) + (laneEntry(srs, w, 'recall')?.lapses ?? 0);

/** Words whose example sentence can carry a cloze. */
export const clozeable = (list: Vocab[]): Vocab[] => list.filter((w) => w.ex && w.ex.includes(w.h));

/**
 * Endless mode questions: recognition kinds only, because the run is on a clock and
 * a typing question would be a death sentence rather than a challenge.
 *
 * Unlike the other modes this ignores the SRS due-order — a survival run should feel
 * random. It still grades normally, so a run doubles as revision.
 */
export function endlessBatch(sel: TopicSel, srs: SrsMap, n: number): Question[] {
  const P = pools(sel);
  if (P.vocab.length < 4) return [];
  const out: Question[] = [];
  for (const w of shuffle(P.vocab).slice(0, n)) {
    const kind = Math.random() < 0.5 ? 'm2h' : 'h2m';
    const box = srs[laneId('w:' + w.h, 'recog')]?.box ?? 0;
    out.push(makeWordQ(w, box, P.vocab, DECK.vocab, kind, 'recog'));
  }
  return out;
}

/** Which finale a mixed session gets — alternates between runs. */
export function nextFinale(vocab: Vocab[]): Question[] {
  const useBoss = loadRaw(KEYS.finale) !== 'boss';
  let finale: Question[] = [];
  if (useBoss) {
    finale = buildBoss(vocab);
    saveRaw(KEYS.finale, 'boss');
  }
  if (!finale.length) {
    finale = buildLightning(vocab);
    saveRaw(KEYS.finale, 'tf');
  }
  return finale;
}

/** Builds a session for a game mode. Returns `[]` when the pools are too thin. */
export function buildSession(g: GameId, sel: TopicSel, srs: SrsMap, settings: Settings): Question[] {
  const P = pools(sel);
  if (!P.vocab.length) return [];
  const size = Math.max(8, Math.min(40, settings.sessionSize));
  const session: Question[] = [];
  // Zero is a legitimate value here, not a mistake: the last week of the study plan
  // deliberately introduces nothing new.
  const budget = newBudget(Math.max(0, Math.min(40, settings.newPerDay)));

  /** A vocabulary question, scheduled against whichever lane its kind belongs to. */
  const wordQ = (w: Vocab, kind?: Kind, laneHint: Lane = 'recog') => {
    const lane = kind ? laneOf(kind) : laneHint;
    const box = srs[laneId('w:' + w.h, lane)]?.box ?? 0;
    return makeWordQ(w, box, P.vocab, DECK.vocab, kind, lane);
  };

  /** Picks words and charges the day's new-word budget in one step. */
  const take = (n: number, rotKey = 'vocab'): PickedWord[] => {
    const { picks, newUsed } = pickWords(srs, P.vocab, n, budget, rotKey);
    spendNewBudget(newUsed);
    return picks;
  };

  switch (g) {
    case 'mix': {
      // Leave room for the specials interleaved every 2 words, plus 4 words for a match board.
      const wn = Math.max(4, size - 6);
      const picked = take(wn + 4);
      const ws = picked.slice(0, wn).map((p) => wordQ(p.w, undefined, p.lane));
      const matchWs = picked.slice(wn).map((p) => p.w);
      const clozePool = clozeable(P.vocab);
      const specials = shuffle([
        ...(matchWs.length === 4 ? [makeMatchQ(matchWs)] : []),
        ...pickDue(srs, P.grammar, (x) => x.id, 2, 'gram').map((o) => makeGramQ(o.x)),
        ...pickDue(srs, P.sentences, (x) => x.id, 1, 'sent').map((o) => makeSentQ(o.x)),
        ...pickDue(srs, P.passages, (x) => x.id, 2, 'pass').map((o) => makePassQ(o.x)),
        ...pickDue(srs, P.orders, (x) => x.id, 1, 'order').map((o) => makeOrderQ(o.x)),
        ...pickDue(srs, P.confusables, (x) => x.id, 1, 'conf').map((o) => makeConfQ(o.x)),
        ...shuffle(P.vocab).slice(0, 2).map(makeToneQ).filter((q) => q !== null),
        ...shuffle(clozePool)
          .slice(0, 2)
          .map((w) => makeClozeQ(w, P.vocab, DECK.vocab))
          .filter((q) => q !== null),
        ...pickDue(srs, P.collocations, (x) => x.id, 1, 'collo').map((o) => makeColloQ(o.x)),
        ...pickDue(srs, P.fixes, (x) => x.id, 1, 'fix').map((o) => makeFixQ(o.x)),
        ...pickDue(srs, NUM_DRILLS, (x) => x.id, 1, 'num').map((o) => makeNumQ(o.x)),
      ]);
      let si = 0;
      ws.forEach((q, i) => {
        session.push(q);
        if ((i + 1) % 2 === 0 && si < specials.length) session.push(specials[si++]);
      });
      while (si < specials.length) session.push(specials[si++]);
      break;
    }
    case 'boss':
      session.push(...buildBoss(P.vocab));
      break;
    case 'tf':
      session.push(...[...buildLightning(P.vocab), ...buildLightning(P.vocab)].slice(0, 12));
      break;
    case 'write': {
      const kinds: Kind[] = ['write', 'type', 'dict'];
      session.push(...take(size, 'recall').map((p) => wordQ(p.w, kinds[Math.floor(Math.random() * 3)])));
      break;
    }
    case 'listen': {
      // Every third question is dictation; the rest are listen-and-pick.
      session.push(...take(size, 'listen').map((p, i) => wordQ(p.w, i % 3 === 2 ? 'dict' : 'a2h')));
      break;
    }
    case 'tone': {
      // Pronunciation is the one skill the SRS boxes say nothing about, so this mode
      // sweeps the selected topics rather than following the due order.
      const qs = shuffle(P.vocab)
        .map(makeToneQ)
        .filter((q) => q !== null);
      session.push(...qs.slice(0, size));
      break;
    }
    case 'cloze': {
      const pool = clozeable(P.vocab);
      if (!pool.length) break;
      // Picking straight from the clozeable pool keeps the day's new-word budget from
      // being charged for words this mode would then have to throw away.
      const { picks, newUsed } = pickWords(srs, pool, size, budget, 'cloze');
      spendNewBudget(newUsed);
      const qs = picks
        .map((p) => makeClozeQ(p.w, P.vocab, DECK.vocab))
        .filter((q) => q !== null);
      // Top up from the rest of the clozeable pool when the due slice was thin.
      const have = new Set(qs.map((q) => q.word.h));
      for (const w of shuffle(pool)) {
        if (qs.length >= size) break;
        if (have.has(w.h)) continue;
        const q = makeClozeQ(w, P.vocab, DECK.vocab);
        if (q) qs.push(q);
      }
      session.push(...qs.slice(0, size));
      break;
    }
    case 'build': {
      const pool = buildable(P.vocab);
      if (!pool.length) break;
      const { picks, newUsed } = pickWords(srs, pool, size, budget, 'build');
      spendNewBudget(newUsed);
      const qs = picks.map((p) => makeBuildQ(p.w, DICT)).filter((q) => q !== null);
      // Bù thêm khi lát đến hạn quá mỏng, để phiên nào cũng đủ dài.
      const have = new Set(qs.map((q) => q.word.h));
      for (const w of shuffle(pool)) {
        if (qs.length >= size) break;
        if (have.has(w.h)) continue;
        const q = makeBuildQ(w, DICT);
        if (q) qs.push(q);
      }
      session.push(...qs.slice(0, size));
      break;
    }
    case 'sdict': {
      const pool = dictatable(P.vocab);
      if (!pool.length) break;
      const { picks, newUsed } = pickWords(srs, pool, size, budget, 'sdict');
      spendNewBudget(newUsed);
      const qs = picks.map((p) => makeSDictQ(p.w)).filter((q) => q !== null);
      const have = new Set(qs.map((q) => q.word.h));
      for (const w of shuffle(pool)) {
        if (qs.length >= size) break;
        if (have.has(w.h)) continue;
        const q = makeSDictQ(w);
        if (q) qs.push(q);
      }
      session.push(...qs.slice(0, size));
      break;
    }
    case 'num':
      // Bẫy số không gắn với chủ đề từ vựng nào, nên quét thẳng cả bộ theo hạn ôn.
      session.push(
        ...pickDue(srs, NUM_DRILLS, (x) => x.id, Math.min(size, NUM_DRILLS.length), 'num').map((o) =>
          makeNumQ(o.x),
        ),
      );
      break;
    case 'fix':
      session.push(
        ...pickDue(srs, P.fixes, (x) => x.id, Math.min(size, P.fixes.length), 'fix').map((o) =>
          makeFixQ(o.x),
        ),
      );
      break;
    case 'collo':
      session.push(
        ...pickDue(srs, P.collocations, (x) => x.id, Math.min(size, P.collocations.length), 'collo').map(
          (o) => makeColloQ(o.x),
        ),
      );
      break;
    case 'leech': {
      // Nothing here is on schedule — these are the words that keep being forgotten,
      // drilled recognition-first because recall clearly isn't landing yet.
      const stuck = leechesOf(srs, P.vocab).slice(0, size);
      stuck.forEach((w, i) => session.push(wordQ(w, i % 3 === 2 ? 'write' : i % 3 === 1 ? 'm2h' : 'h2m')));
      break;
    }
    case 'match': {
      const picked = shuffle(take(24, 'match').map((p) => p.w));
      for (let i = 0; i + 4 <= picked.length && session.length < 6; i += 4) {
        session.push(makeMatchQ(picked.slice(i, i + 4)));
      }
      break;
    }
    case 'flash':
      session.push(...take(size, 'flash').map((p) => wordQ(p.w, 'flash')));
      break;
    case 'read':
      session.push(
        ...shuffle([
          ...pickDue(srs, P.grammar, (x) => x.id, 5, 'gram').map((o) => makeGramQ(o.x)),
          ...pickDue(srs, P.sentences, (x) => x.id, 2, 'sent').map((o) => makeSentQ(o.x)),
          ...pickDue(srs, P.passages, (x) => x.id, 4, 'pass').map((o) => makePassQ(o.x)),
          ...pickDue(srs, P.orders, (x) => x.id, 2, 'order').map((o) => makeOrderQ(o.x)),
          ...pickDue(srs, P.confusables, (x) => x.id, 2, 'conf').map((o) => makeConfQ(o.x)),
        ]),
      );
      break;
    case 'confuse':
      // Every confusable, due ones first — the set is small enough to drill whole.
      session.push(
        ...pickDue(srs, P.confusables, (x) => x.id, P.confusables.length, 'conf').map((o) =>
          makeConfQ(o.x),
        ),
      );
      break;
    case 'endless':
      // Only the first question is built here; each correct answer appends the next.
      session.push(...endlessBatch(sel, srs, 1));
      break;
    case 'mysong':
      MYSONG?.lines.forEach((_, i) => session.push(makeMySongQ(MYSONG, i)));
      break;
    case 'song': {
      if (SONGS.length) {
        // Two songs per session, advancing the cursor so the next run gets the next pair.
        const cur = parseInt(loadRaw(KEYS.rot + 'song') || '', 10) || 0;
        const picked = [SONGS[cur % SONGS.length], SONGS[(cur + 1) % SONGS.length]];
        saveRaw(KEYS.rot + 'song', String((cur + 2) % SONGS.length));
        picked.forEach((s) => s.lines.forEach((_, i) => session.push(makeSongQ(s, i, DECK.vocab))));
      }
      break;
    }
  }
  return session;
}
