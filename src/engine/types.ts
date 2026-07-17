import type { Confusable, Grammar, MySong, Order, Passage, PassageQuestion, Sentence, Song, Vocab } from '../data';

export type Kind =
  | 'm2h'
  | 'h2m'
  | 'a2h'
  | 'write'
  | 'type'
  | 'dict'
  | 'flash'
  | 'match'
  | 'tf'
  | 'gram'
  | 'sent'
  | 'pass'
  | 'order'
  | 'song'
  | 'conf';

export type GameId =
  | 'mix'
  | 'boss'
  | 'tf'
  | 'write'
  | 'listen'
  | 'match'
  | 'flash'
  | 'read'
  | 'song'
  | 'mysong'
  | 'confuse'
  | 'endless';

interface Base {
  kind: Kind;
  /** SRS id. `null` for match boards (each pair grades itself). */
  id: string | null;
  /** Requeued after a wrong answer — scores less and is not re-graded. */
  re?: boolean;
  boss?: boolean;
}

/** 4-option question over a vocab word. */
export interface ChoiceQ extends Base {
  kind: 'm2h' | 'h2m' | 'a2h' | 'flash';
  word: Vocab;
  opts: Vocab[];
  ans: number;
}

/** Typed-answer question (with a Chinese IME) over a vocab word. */
export interface TypeQ extends Base {
  kind: 'type' | 'dict';
  word: Vocab;
}

/** Build the word out of hanzi tiles. */
export interface WriteQ extends Base {
  kind: 'write';
  word: Vocab;
  tiles: string[];
  ansStr: string;
  tlen: number;
}

export interface GramQ extends Base {
  kind: 'gram';
  g: Grammar;
  opts: string[];
  ans: number;
}

export interface SentQ extends Base {
  kind: 'sent';
  r: Sentence;
  opts: string[];
  ans: number;
}

/** Pick which of two near-synonyms fits the sentence. */
export interface ConfQ extends Base {
  kind: 'conf';
  c: Confusable;
  opts: string[];
  ans: number;
}

export interface PassQ extends Base {
  kind: 'pass';
  p: Passage;
  qq: PassageQuestion;
  opts: string[];
  ans: number;
}

/** Reorder tokens into a correct sentence — shares the tile UI with `write`. */
export interface OrderQ extends Base {
  kind: 'order';
  o: Order;
  tiles: string[];
  ansStr: string;
  tlen: number;
}

/** 4 hanzi ↔ 4 meanings. `rightOrder[j]` is the pair index shown in right slot j. */
export interface MatchQ extends Base {
  kind: 'match';
  id: null;
  pairs: Vocab[];
  rightOrder: number[];
}

/** Lightning true/false: is `shown` really the meaning of `w`? */
export interface TfQ extends Base {
  kind: 'tf';
  w: Vocab;
  shown: string;
  isTrue: boolean;
}

/** Lyric cloze. `yt` marks the real-song variant (video stays mounted, no auto-TTS). */
export interface SongQ extends Base {
  kind: 'song';
  song: Song | MySong;
  line: Song['lines'][number];
  li: number;
  word2: Pick<Vocab, 'h' | 'p' | 'm'>;
  opts: Pick<Vocab, 'h' | 'p' | 'm'>[];
  ans: number;
  yt?: boolean;
}

export type Question =
  | ChoiceQ
  | TypeQ
  | WriteQ
  | GramQ
  | SentQ
  | PassQ
  | OrderQ
  | MatchQ
  | TfQ
  | SongQ
  | ConfQ;

/** Questions whose answer is picked from an options grid. */
export type AnyChoiceQ = ChoiceQ | GramQ | SentQ | PassQ | SongQ | ConfQ;

/** Questions built from tiles (`write` and `order`). */
export type AnyTileQ = WriteQ | OrderQ;

export const isChoiceQ = (q: Question): q is AnyChoiceQ => 'opts' in q && 'ans' in q;
export const isTileQ = (q: Question): q is AnyTileQ => q.kind === 'write' || q.kind === 'order';
export const isTypeQ = (q: Question): q is TypeQ => q.kind === 'type' || q.kind === 'dict';
/** The word a question is about, when it has one. */
export const wordOf = (q: Question): Vocab | undefined => ('word' in q ? q.word : undefined);

export type Mode = 'home' | 'quiz' | 'result' | 'book';

export interface GameState {
  ready: boolean;
  mode: Mode;
  /** Which game built the current session. */
  game: GameId;
  qi: number;
  session: Question[];
  /** Selected option index, -1 = none. */
  sel: number;
  /** Characters placed into the answer slots. */
  typed: string[];
  /** Tile indices used, parallel to `typed`. */
  usedTiles: number[];
  typedText: string;
  checked: boolean;
  correct: boolean;
  combo: number;
  sessionXp: number;
  right: number;
  wrong: number;
  missed: Pick<Vocab, 'h' | 'p' | 'm'>[];
  fbMsg: string;
  /** Bumped to re-render after a topic toggle. */
  topicVer: number;
  muted: boolean;
  /** Match: selected left index. */
  mSel: number;
  /** Match: pairs solved, indexed by pair. */
  mDone: boolean[];
  /** Match: hanzi that were mis-paired at least once. */
  mWrong: Record<string, 1>;
  /** Countdown bar, as a percentage. Used by the lightning round and endless mode. */
  tfLeft: number;
  /** Endless: questions survived so far. */
  score: number;
  /** Endless: the record to beat, read when the run starts. */
  best: number;
  /** Endless: the run ended because the answer was wrong or time ran out. */
  dead: boolean;
  /** True once the session may not append a finale (set for single-game modes). */
  light: boolean;
  /** Flash: hanzi still visible. */
  flashOn: boolean;
  bossHp: number;
  hearts: number;
  bookWord: Vocab | null;
}

export interface Settings {
  autoPlayAudio: boolean;
  /** 0.6–1.2 */
  voiceRate: number;
  /** 8–40 */
  sessionSize: number;
  /** 50–500 */
  dailyGoal: number;
  /** 800–4000 */
  flashMs: number;
}

export const DEFAULT_SETTINGS: Settings = {
  autoPlayAudio: true,
  voiceRate: 0.9,
  sessionSize: 18,
  dailyGoal: 150,
  flashMs: 1800,
};

export interface SrsEntry {
  /** 0–5 */
  box: number;
  due: number;
}

export interface Stats {
  xp: number;
  streak: number;
  /** `toDateString()` of the last finished session. */
  last: string;
  dayDate: string;
  dayXp: number;
}
