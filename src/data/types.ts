/** Shapes of the content bundle in `src/data/*.json`. */

export interface Vocab {
  /** Hanzi — also the stable SRS id (`w:<h>`). */
  h: string;
  /** Pinyin. */
  p: string;
  /** Part of speech (Vietnamese). */
  pos: string;
  /** Meaning (Vietnamese). */
  m: string;
  /** Topic. */
  t: string;
  /** Example sentence. */
  ex?: string;
  exVi?: string;
}

export interface Grammar {
  id: string;
  /** Correct option. */
  a: string;
  opts: string[];
  /** Sentence with `____` cloze. */
  sent: string;
  /** Sentence with the blank filled in. */
  full: string;
  pin: string;
  vi: string;
  name: string;
  expl?: string;
  t: string;
}

export interface Sentence {
  id: string;
  cn: string;
  pin: string;
  vi: string;
  /** Distractor meanings. */
  d: string[];
  t: string;
}

export interface PassageQuestion {
  q: string;
  opts: string[];
  correct: number;
  expl: string;
}

export interface Passage {
  id: string;
  t: string;
  title: string;
  text: string;
  py: string;
  vi: string;
  questions: PassageQuestion[];
}

export interface Order {
  id: string;
  tokens: string[];
  py: string;
  vi: string;
  tip: string;
  t: string;
}

export interface Deck {
  vocab: Vocab[];
  grammar: Grammar[];
  sentences: Sentence[];
  passages: Passage[];
  orders: Order[];
}

export interface SongLine {
  cn: string;
  /** The word removed from `cn` to make the cloze. */
  blank: string;
  pin: string;
  vi: string;
  /** Seconds into the recording where this line is sung. Real songs only. */
  t?: number;
  /** Seconds where the next line starts — the point to stop playback at. */
  end?: number;
}

export interface Song {
  id: string;
  title: string;
  lines: SongLine[];
}

/**
 * A real song: a `Song` plus a YouTube id and its own vocab. Its lines carry
 * timestamps (aligned from an LRC sheet), which is what lets the player sing the
 * exact line a question is asking about instead of whatever is playing.
 */
export interface MySong extends Song {
  yt: string;
  /** Length of the recording in seconds. */
  duration: number;
  vocab: Pick<Vocab, 'h' | 'p' | 'm'>[];
}
