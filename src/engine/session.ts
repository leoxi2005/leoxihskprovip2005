import {
  CONFUSABLES,
  DECK,
  MYSONG,
  SONGS,
  type Confusable,
  type Grammar,
  type Order,
  type Passage,
  type Sentence,
  type Vocab,
} from '../data';
import {
  buildBoss,
  buildLightning,
  makeConfQ,
  makeGramQ,
  makeMatchQ,
  makeMySongQ,
  makeOrderQ,
  makePassQ,
  makeSentQ,
  makeSongQ,
  makeWordQ,
  shuffle,
} from './questions';
import { KEYS, loadRaw, saveRaw, type SrsMap } from './storage';
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
  };
}

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
    out.push(makeWordQ(w, srs['w:' + w.h]?.box ?? 0, P.vocab, DECK.vocab, kind));
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
  const word = (w: Vocab, box: number, kind?: Kind) => makeWordQ(w, box, P.vocab, DECK.vocab, kind);

  switch (g) {
    case 'mix': {
      // Leave room for the specials interleaved every 2 words, plus 4 words for a match board.
      const wn = Math.max(4, size - 6);
      const picked = pickDue(srs, P.vocab, (v) => 'w:' + v.h, wn + 4, 'vocab');
      const ws = picked.slice(0, wn).map((o) => word(o.x, o.e ? o.e.box : 0));
      const matchWs = picked.slice(wn).map((o) => o.x);
      const specials = shuffle([
        ...(matchWs.length === 4 ? [makeMatchQ(matchWs)] : []),
        ...pickDue(srs, P.grammar, (x) => x.id, 2, 'gram').map((o) => makeGramQ(o.x)),
        ...pickDue(srs, P.sentences, (x) => x.id, 1, 'sent').map((o) => makeSentQ(o.x)),
        ...pickDue(srs, P.passages, (x) => x.id, 2, 'pass').map((o) => makePassQ(o.x)),
        ...pickDue(srs, P.orders, (x) => x.id, 1, 'order').map((o) => makeOrderQ(o.x)),
        ...pickDue(srs, P.confusables, (x) => x.id, 1, 'conf').map((o) => makeConfQ(o.x)),
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
      const picked = pickDue(srs, P.vocab, (v) => 'w:' + v.h, size, 'vocab');
      const kinds: Kind[] = ['write', 'type', 'dict'];
      session.push(...picked.map((o) => word(o.x, 99, kinds[Math.floor(Math.random() * 3)])));
      break;
    }
    case 'listen': {
      const picked = pickDue(srs, P.vocab, (v) => 'w:' + v.h, size, 'vocab');
      // Every third question is dictation; the rest are listen-and-pick.
      session.push(...picked.map((o, i) => word(o.x, 99, i % 3 === 2 ? 'dict' : 'a2h')));
      break;
    }
    case 'match': {
      const picked = shuffle(pickDue(srs, P.vocab, (v) => 'w:' + v.h, 24, 'vocab').map((o) => o.x));
      for (let i = 0; i + 4 <= picked.length && session.length < 6; i += 4) {
        session.push(makeMatchQ(picked.slice(i, i + 4)));
      }
      break;
    }
    case 'flash': {
      const picked = pickDue(srs, P.vocab, (v) => 'w:' + v.h, size, 'vocab');
      session.push(...picked.map((o) => word(o.x, 99, 'flash')));
      break;
    }
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
