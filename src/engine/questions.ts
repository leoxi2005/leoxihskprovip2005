import type { Confusable, Grammar, MySong, Order, Passage, Sentence, Song, Vocab } from '../data';
import type { ChoiceQ, ConfQ, GramQ, Kind, MatchQ, OrderQ, PassQ, Question, SentQ, SongQ, TfQ } from './types';

export function shuffle<T>(a: readonly T[]): T[] {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const pickOne = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

/**
 * Distractors prefer the same part of speech, so a wrong option is a real
 * choice rather than an obvious category mismatch.
 */
export function makeChoice(
  w: Vocab,
  others: Vocab[],
  kind: ChoiceQ['kind'],
  id = 'w:' + w.h,
): ChoiceQ {
  const pos0 = (w.pos || '').split('/')[0];
  let ds = shuffle(others.filter((o) => (o.pos || '').split('/')[0] === pos0)).slice(0, 3);
  if (ds.length < 3) {
    ds = ds.concat(shuffle(others.filter((o) => !ds.includes(o))).slice(0, 3 - ds.length));
  }
  const opts = shuffle([w, ...ds]);
  return { kind, id, word: w, opts, ans: opts.indexOf(w) };
}

/**
 * Question kind is drawn from a pool weighted by SRS box: new words get
 * recognition-first kinds, mature words get recall-first ones (type/dictation).
 */
export function makeWordQ(w: Vocab, box: number, pool: Vocab[], deck: Vocab[], forceKind?: Kind): Question {
  const others = (pool.length > 8 ? pool : deck).filter((x) => x.h !== w.h);
  let kinds: Kind[];
  if (box <= 0) kinds = ['m2h', 'h2m', 'a2h', 'write', 'type', 'type', 'flash'];
  else if (box === 1) kinds = ['type', 'type', 'write', 'a2h', 'flash', 'type', 'dict'];
  else kinds = ['type', 'type', 'dict', 'write', 'a2h', 'dict', 'flash'];

  const kind = forceKind || pickOne(kinds);
  const id = 'w:' + w.h;

  if (kind === 'type' || kind === 'dict') return { kind, id, word: w };

  if (kind === 'write') {
    const chars = w.h.split('');
    const cpool: string[] = [];
    others.forEach((o) =>
      o.h.split('').forEach((ch) => {
        if (!chars.includes(ch) && !cpool.includes(ch)) cpool.push(ch);
      }),
    );
    const target = chars.length <= 2 ? 5 : Math.min(chars.length + 3, 8);
    const extras = shuffle(cpool).slice(0, target - chars.length);
    return {
      kind,
      id,
      word: w,
      tiles: shuffle([...chars, ...extras]),
      ansStr: w.h,
      tlen: chars.length,
    };
  }

  return makeChoice(w, others, kind as ChoiceQ['kind'], id);
}

export const makeGramQ = (g: Grammar): GramQ => {
  const opts = shuffle(g.opts);
  return { kind: 'gram', id: g.id, g, opts, ans: opts.indexOf(g.a) };
};

export const makeSentQ = (r: Sentence): SentQ => {
  const opts = shuffle([r.vi, ...r.d]);
  return { kind: 'sent', id: r.id, r, opts, ans: opts.indexOf(r.vi) };
};

export function makePassQ(p: Passage): PassQ {
  const qq = pickOne(p.questions);
  const sh = shuffle(qq.opts.map((o, i) => ({ o, c: i === qq.correct })));
  return { kind: 'pass', id: p.id, p, qq, opts: sh.map((x) => x.o), ans: sh.findIndex((x) => x.c) };
}

export function makeOrderQ(o: Order): OrderQ {
  let toks = shuffle(o.tokens);
  // One reshuffle if we happened to deal the answer already.
  if (toks.join('') === o.tokens.join('')) toks = shuffle(o.tokens);
  return { kind: 'order', id: o.id, o, tiles: toks, ansStr: o.tokens.join(''), tlen: o.tokens.length };
}

/** Options keep the lesson's display order — the pair always reads the same way. */
export const makeConfQ = (c: Confusable): ConfQ => ({
  kind: 'conf',
  id: c.id,
  c,
  opts: [...c.pair],
  ans: c.pair.indexOf(c.a),
});

export const makeMatchQ = (ws: Vocab[]): MatchQ => ({
  kind: 'match',
  id: null,
  pairs: ws,
  rightOrder: shuffle(ws.map((_, i) => i)),
});

/** Distractors come from the song's own vocab, so options stay on-theme. */
export function makeMySongQ(song: MySong, li: number): SongQ {
  const line = song.lines[li];
  const w = song.vocab.find((v) => v.h === line.blank) || { h: line.blank, p: '', m: '' };
  const others = shuffle(song.vocab.filter((v) => v.h !== w.h)).slice(0, 3);
  const opts = shuffle([w, ...others]);
  return { kind: 'song', id: 'ms:' + w.h, song, line, li, word2: w, opts, ans: opts.indexOf(w), yt: true };
}

/** Distractors exclude every other blank in the song — no two lines share an answer. */
export function makeSongQ(song: Song, li: number, deck: Vocab[]): SongQ {
  const line = song.lines[li];
  const w = deck.find((v) => v.h === line.blank) || { h: line.blank, p: '', pos: '', m: '', t: '' };
  const others = shuffle(
    deck.filter((v) => v.h !== w.h && song.lines.every((l) => l.blank !== v.h)),
  ).slice(0, 3);
  const opts = shuffle([w, ...others]);
  return { kind: 'song', id: 'w:' + w.h, song, line, li, word2: w, opts, ans: opts.indexOf(w) };
}

export function buildBoss(vocab: Vocab[]): Question[] {
  if (vocab.length < 8) return [];
  return shuffle(vocab)
    .slice(0, 8)
    .map((w) => {
      const q = makeChoice(w, vocab.filter((x) => x.h !== w.h), Math.random() < 0.5 ? 'm2h' : 'h2m');
      return { ...q, boss: true };
    });
}

/** Half the statements are true; the false ones borrow another word's meaning. */
export function buildLightning(vocab: Vocab[]): TfQ[] {
  if (vocab.length < 8) return [];
  return shuffle(vocab)
    .slice(0, 8)
    .map((w) => {
      const isTrue = Math.random() < 0.5;
      let shown = w.m;
      if (!isTrue) {
        const o = shuffle(vocab.filter((x) => x.h !== w.h && x.m !== w.m))[0];
        shown = o ? o.m : w.m;
      }
      return { kind: 'tf', id: 'w:' + w.h, w, shown, isTrue: shown === w.m };
    });
}

/** The text a question should read aloud. */
export function ttsFor(q: Question): string {
  switch (q.kind) {
    case 'song':
      return q.line.cn;
    case 'tf':
      return q.w.h;
    case 'match':
      return '';
    case 'conf':
      return q.c.full;
    case 'gram':
      return q.g.full;
    case 'sent':
      return q.r.cn;
    case 'order':
      return q.o.tokens.join('');
    case 'pass':
      return q.p.text;
    default:
      return 'word' in q ? q.word.h : '';
  }
}
