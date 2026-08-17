import { OLD_IDS } from '../data';
import type { Kind, SrsEntry, Stats } from './types';

export const KEYS = {
  srs: 'hskq_srs',
  stats: 'hskq_stats',
  topics: 'hskq_topics_v2',
  muted: 'hskq_muted',
  finale: 'hskq_finale',
  settings: 'hskq_settings',
  /** Endless mode personal best. */
  best: 'hskq_best_endless',
  /** Suffixed with a pool name, e.g. `hskq_rot_vocab`. */
  rot: 'hskq_rot_',
  /** `{ date, n }` — how many brand-new words were introduced today. */
  newday: 'hskq_newday',
  /** Compact review log; see `LogRow`. */
  log: 'hskq_log',
  /** Marks which one-off data migrations have already run. */
  mig: 'hskq_mig',
  /** Best score per exam paper, and the log of finished mock exams. */
  exam: 'hskq_exam',
  /** `{ date, done }` — the daily plan's completion ticks. */
  plan: 'hskq_plan',
  /** Best result per exam part, from the part-by-part practice mode. */
  drill: 'hskq_drill',
} as const;

/** localStorage can throw (private mode, quota) — progress is best-effort. */
export function load<T>(key: string, fallback: T): T {
  try {
    const v = JSON.parse(localStorage.getItem(key) as string);
    return v == null ? fallback : (v as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const DEFAULT_STATS: Stats = { xp: 0, streak: 0, last: '', dayDate: '', dayXp: 0 };

export type SrsMap = Record<string, SrsEntry>;

// -- lanes ------------------------------------------------------------------

/**
 * Recognising a word and producing it are different skills that decay at different
 * rates, so each word carries two independent SRS entries.
 *
 * The recognition lane keeps the bare id (`w:<hanzi>`), which is what every version
 * before this one wrote — so old progress lands in the right lane with no rewriting.
 */
export type Lane = 'recog' | 'recall';

/** Kinds that make you produce the word rather than pick it out of a line-up. */
const RECALL_KINDS = new Set<Kind>(['type', 'dict', 'write']);

export const laneOf = (k: Kind): Lane => (RECALL_KINDS.has(k) ? 'recall' : 'recog');

export const laneId = (id: string, lane: Lane): string => (lane === 'recall' ? id + '#r' : id);

/** The id a question should be graded under. */
export const gradeId = (id: string, kind: Kind): string => laneId(id, laneOf(kind));

// -- scheduling -------------------------------------------------------------

/**
 * Box intervals: 5min, 30min, 12h, 2d, 5d, 12d, 30d, 75d.
 *
 * The last two boxes exist so a word you genuinely know stops crowding out the ones
 * you don't — at six boxes the longest gap was 12 days, which meant everything ever
 * learned came back two or three times a month.
 */
const INTERVALS = [300e3, 1800e3, 43200e3, 172800e3, 432e6, 1036800e3, 2592e6, 6480e6];

export const MAX_BOX = INTERVALS.length - 1;

/** A correct-but-slow answer is weaker evidence, so it buys a shorter gap. */
const SLOW_FACTOR = 0.6;

/** Answering above this many milliseconds counts as slow, per kind. */
export const SLOW_MS: Partial<Record<Kind, number>> = {
  m2h: 7000,
  h2m: 6000,
  a2h: 8000,
  flash: 7000,
  tone: 8000,
  type: 14000,
  dict: 16000,
  write: 14000,
  cloze: 12000,
};

const DEFAULT_SLOW_MS = 12000;

export const isSlow = (kind: Kind, ms: number): boolean => ms > (SLOW_MS[kind] ?? DEFAULT_SLOW_MS);

/** Words missed this many times are leeches — they need re-teaching, not more drilling. */
export const LEECH_AT = 6;

export const isLeech = (e: SrsEntry | undefined): boolean => (e?.lapses ?? 0) >= LEECH_AT;

/**
 * Correct → next box (capped at `MAX_BOX`); wrong → back to box 0.
 *
 * Every gap is jittered ±10% so a batch learned in one sitting doesn't come back as
 * one indigestible lump on the same day forever after.
 */
export function nextEntry(prev: SrsEntry | undefined, ok: boolean, slow = false): SrsEntry {
  const box = ok ? Math.min((prev?.box ?? 0) + 1, MAX_BOX) : 0;
  const gap = INTERVALS[box] * (ok && slow ? SLOW_FACTOR : 1) * (0.9 + Math.random() * 0.2);
  return {
    box,
    due: Date.now() + Math.round(gap),
    lapses: (prev?.lapses ?? 0) + (ok ? 0 : 1),
    reps: (prev?.reps ?? 0) + 1,
  };
}

// -- migrations -------------------------------------------------------------

const migDone = (): Record<string, 1> => load<Record<string, 1>>(KEYS.mig, {});

const markMig = (name: string): void => save(KEYS.mig, { ...migDone(), [name]: 1 });

/**
 * v1 stored SRS under positional keys (`w12`, `g1`, `r3`). Rewrite those onto the
 * stable ids used since v2 (`w:<hanzi>`, `g:g1`, `s:r3`) so progress survives.
 */
export function migrateSrs(srs: SrsMap): SrsMap {
  let changed = false;
  const out: SrsMap = {};
  for (const k of Object.keys(srs)) {
    let nk = k;
    const m = k.match(/^w(\d+)$/);
    if (m && OLD_IDS[+m[1]]) {
      nk = 'w:' + OLD_IDS[+m[1]];
      changed = true;
    } else if (/^g\d$/.test(k)) {
      nk = 'g:' + k;
      changed = true;
    } else if (/^r\d$/.test(k)) {
      nk = 's:' + k;
      changed = true;
    }
    out[nk] = srs[k];
  }
  if (changed) save(KEYS.srs, out);
  return changed ? out : srs;
}

/**
 * Seed the recall lane from the single lane that existed before it.
 *
 * Recognising a word never proved you could write it, so the new lane starts two
 * boxes lower rather than inheriting the score outright — and its first due date is
 * spread across that box's own interval, so 400 words don't all land at once.
 *
 * Runs once, tracked in `KEYS.mig`. It only ever fills in a missing lane, so a second
 * run would be a no-op anyway.
 */
export function seedRecallLanes(srs: SrsMap): SrsMap {
  if (migDone().lanes) return srs;
  const now = Date.now();
  const out = { ...srs };
  let added = 0;
  for (const k of Object.keys(srs)) {
    if (!k.startsWith('w:') || k.endsWith('#r')) continue;
    const rk = k + '#r';
    if (out[rk]) continue;
    const box = Math.max(0, (srs[k].box ?? 0) - 2);
    out[rk] = { box, due: now + Math.round(INTERVALS[box] * Math.random()), lapses: 0, reps: 0 };
    added++;
  }
  markMig('lanes');
  if (added) save(KEYS.srs, out);
  return added ? out : srs;
}

// -- daily new-word budget --------------------------------------------------

interface NewDay {
  date: string;
  n: number;
}

/** How many brand-new words may still be introduced today. */
export function newBudget(limit: number): number {
  const d = load<NewDay>(KEYS.newday, { date: '', n: 0 });
  const today = new Date().toDateString();
  return Math.max(0, limit - (d.date === today ? d.n : 0));
}

/** Records that `n` new words were just handed out. */
export function spendNewBudget(n: number): void {
  if (n <= 0) return;
  const today = new Date().toDateString();
  const d = load<NewDay>(KEYS.newday, { date: '', n: 0 });
  save(KEYS.newday, { date: today, n: (d.date === today ? d.n : 0) + n });
}

// -- review log -------------------------------------------------------------

/** `[timestamp, srs id, kind, correct, milliseconds]` — compact on purpose. */
export type LogRow = [number, string, Kind, 0 | 1, number];

/** Roughly a year of heavy use; past that the oldest rows fall off the front. */
const LOG_CAP = 5000;

export const loadLog = (): LogRow[] => load<LogRow[]>(KEYS.log, []);

export function appendLog(rows: LogRow[]): void {
  if (!rows.length) return;
  const log = loadLog().concat(rows);
  save(KEYS.log, log.length > LOG_CAP ? log.slice(log.length - LOG_CAP) : log);
}

// -- backup -----------------------------------------------------------------

/** Bumped only when the shape changes in a way an old import could not survive. */
const BACKUP_VERSION = 1;

/**
 * Everything worth carrying to another machine.
 *
 * Deliberately not "every key": the rotation cursors and the mute flag are local
 * conveniences, and copying them over would be noise in the file and confusion on
 * restore.
 */
const BACKED_UP: string[] = [
  KEYS.srs,
  KEYS.stats,
  KEYS.settings,
  KEYS.topics,
  KEYS.best,
  KEYS.newday,
  KEYS.log,
  KEYS.mig,
  KEYS.exam,
  KEYS.plan,
  KEYS.drill,
];

export interface Backup {
  app: 'hsk-quest';
  version: number;
  at: number;
  data: Record<string, unknown>;
}

export function exportProgress(): string {
  const data: Record<string, unknown> = {};
  for (const k of BACKED_UP) {
    const raw = loadRaw(k);
    if (raw !== null) data[k] = JSON.parse(raw);
  }
  const backup: Backup = { app: 'hsk-quest', version: BACKUP_VERSION, at: Date.now(), data };
  return JSON.stringify(backup, null, 2);
}

export interface ImportResult {
  ok: boolean;
  msg: string;
}

/**
 * Restores a backup, replacing what is here.
 *
 * Validated before anything is written, so a truncated or foreign file leaves the
 * existing progress untouched rather than half-overwriting it.
 */
export function importProgress(text: string): ImportResult {
  let backup: Backup;
  try {
    backup = JSON.parse(text) as Backup;
  } catch {
    return { ok: false, msg: 'Tệp không phải JSON hợp lệ.' };
  }
  if (backup?.app !== 'hsk-quest' || typeof backup.data !== 'object' || !backup.data) {
    return { ok: false, msg: 'Đây không phải tệp sao lưu của HSK Quest.' };
  }
  if (backup.version > BACKUP_VERSION) {
    return { ok: false, msg: 'Tệp được tạo bởi phiên bản mới hơn — hãy cập nhật app trước.' };
  }

  const keys = Object.keys(backup.data).filter((k) => BACKED_UP.includes(k));
  if (!keys.length) return { ok: false, msg: 'Tệp sao lưu không chứa dữ liệu nào nhận ra được.' };

  for (const k of keys) save(k, backup.data[k]);

  const srs = (backup.data[KEYS.srs] ?? {}) as SrsMap;
  const when = backup.at ? new Date(backup.at).toLocaleDateString('vi-VN') : 'không rõ ngày';
  return { ok: true, msg: `Đã khôi phục ${Object.keys(srs).length} mục tiến trình (sao lưu ${when}).` };
}
