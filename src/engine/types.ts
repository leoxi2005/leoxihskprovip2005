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
  | 'conf'
  | 'tone'
  | 'cloze';

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
  | 'endless'
  | 'tone'
  | 'cloze'
  | 'leech';

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

/**
 * Pick the correctly-toned pinyin. Every option is the same syllable string — only
 * the tone marks (or a deliberate zh/z, -n/-ng swap) differ.
 */
export interface ToneQ extends Base {
  kind: 'tone';
  word: Vocab;
  opts: string[];
  ans: number;
  /** What the distractors were built from, for the feedback panel. */
  trap: 'tone' | 'sound';
}

/** The word's own example sentence with the word blanked out. */
export interface ClozeQ extends Base {
  kind: 'cloze';
  word: Vocab;
  /** `q.sent` already has the blank cut into it. */
  sent: string;
  vi: string;
  opts: Vocab[];
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
  | ConfQ
  | ToneQ
  | ClozeQ;

/** Questions whose answer is picked from an options grid. */
export type AnyChoiceQ = ChoiceQ | GramQ | SentQ | PassQ | SongQ | ConfQ | ToneQ | ClozeQ;

/** Questions built from tiles (`write` and `order`). */
export type AnyTileQ = WriteQ | OrderQ;

export const isChoiceQ = (q: Question): q is AnyChoiceQ => 'opts' in q && 'ans' in q;
export const isTileQ = (q: Question): q is AnyTileQ => q.kind === 'write' || q.kind === 'order';
export const isTypeQ = (q: Question): q is TypeQ => q.kind === 'type' || q.kind === 'dict';
/** The word a question is about, when it has one. */
export const wordOf = (q: Question): Vocab | undefined => ('word' in q ? q.word : undefined);

export type Mode = 'home' | 'quiz' | 'result' | 'book' | 'exam' | 'stats';

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
  /**
   * Hệ số phát bản thu sẵn, 0.6–1.2. **1 = đúng tốc độ băng thi** (3.5 chữ/giây).
   *
   * Mặc định để 1.15, tức nhanh hơn phòng thi một nhịp: quen tai ở tốc độ khó hơn
   * thì hôm thi nghe sẽ thấy thong thả. Riêng đề mô phỏng KHÔNG chạy theo con số
   * này mà luôn đúng 1 — xem `speakExam`.
   *
   * Con số này từng có nghĩa khác: hồi app còn đọc bằng giọng máy của trình duyệt,
   * 1 là "tốc độ mặc định của giọng đó" — nhanh hơn phòng thi khá nhiều. Từ khi có
   * bản thu sẵn thì 1 là một mốc thật, nên mặc định mới là 1 chứ không phải 0.9.
   */
  voiceRate: number;
  /** 8–40 */
  sessionSize: number;
  /** 50–500 */
  dailyGoal: number;
  /** 800–4000 */
  flashMs: number;
  /**
   * How many words may be met for the first time each day, 3–40.
   *
   * Without a cap every session front-loads unseen words, and a fortnight later the
   * due pile is unclearable — the classic way an SRS deck dies.
   *
   * Ignored while `autoPace` is on.
   */
  newPerDay: number;
  /**
   * Let the plan work out the pace instead of using `newPerDay`.
   *
   * A number typed in once goes stale the same week: every word learned lowers the
   * pace needed, every day skipped raises it. Recomputing daily is the only version
   * of this setting that stays true.
   */
  autoPace: boolean;
  /** Target exam day, `YYYY-MM-DD`. Drives the countdown and the daily plan. */
  examDate: string;
}

/** HSK 4 at Ho Chi Minh City University of Education, the last paper before HSK 3.0. */
export const DEFAULT_EXAM_DATE = '2026-11-07';

export const DEFAULT_SETTINGS: Settings = {
  autoPlayAudio: true,
  voiceRate: 1.15,
  sessionSize: 18,
  dailyGoal: 150,
  flashMs: 1800,
  newPerDay: 12,
  autoPace: true,
  examDate: DEFAULT_EXAM_DATE,
};

export interface SrsEntry {
  /** 0–`MAX_BOX` (7). */
  box: number;
  due: number;
  /** Times this lane has been missed. At `LEECH_AT` the word counts as a leech. */
  lapses?: number;
  /** Times this lane has been graded, right or wrong. */
  reps?: number;
}

export interface Stats {
  xp: number;
  streak: number;
  /** `toDateString()` of the last finished session. */
  last: string;
  dayDate: string;
  dayXp: number;
}
