import type { Kind, SrsEntry } from './types';
import type { LogRow, SrsMap } from './storage';

/** Column positions in a `LogRow`, named so the reads below stay readable. */
const AT = 0;
const ID = 1;
const KIND = 2;
const OK = 3;

export const dayKey = (ms: number): string => new Date(ms).toDateString();

export const startOfDay = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Rows logged since midnight. */
export const todayRows = (log: LogRow[]): LogRow[] => {
  const from = startOfDay(new Date());
  return log.filter((r) => r[AT] >= from);
};

export interface DayCount {
  /** `toDateString()`. */
  day: string;
  n: number;
  right: number;
}

/** Answers per day, oldest first — the heatmap's data. */
export function byDay(log: LogRow[]): DayCount[] {
  const map = new Map<string, DayCount>();
  for (const r of log) {
    const day = dayKey(r[AT]);
    const slot = map.get(day) ?? { day, n: 0, right: 0 };
    slot.n++;
    slot.right += r[OK];
    map.set(day, slot);
  }
  return [...map.values()].sort((a, b) => Date.parse(a.day) - Date.parse(b.day));
}

/** The last `days` calendar days, including empty ones, oldest first. */
export function recentDays(log: LogRow[], days: number): DayCount[] {
  const have = new Map(byDay(log).map((d) => [d.day, d]));
  const out: DayCount[] = [];
  const today = startOfDay(new Date());
  for (let k = days - 1; k >= 0; k--) {
    const day = new Date(today - k * 864e5).toDateString();
    out.push(have.get(day) ?? { day, n: 0, right: 0 });
  }
  return out;
}

export interface KindStat {
  kind: Kind;
  n: number;
  right: number;
  /** 0–100, or `null` when the kind has never been answered. */
  pct: number | null;
}

/** Accuracy per question kind — which skill is actually weak. */
export function byKind(log: LogRow[]): KindStat[] {
  const map = new Map<Kind, KindStat>();
  for (const r of log) {
    const slot = map.get(r[KIND]) ?? { kind: r[KIND], n: 0, right: 0, pct: null };
    slot.n++;
    slot.right += r[OK];
    map.set(r[KIND], slot);
  }
  return [...map.values()]
    .map((s) => ({ ...s, pct: s.n ? Math.round((s.right / s.n) * 100) : null }))
    .sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
}

export interface MissStat {
  /** SRS id, lane suffix stripped. */
  id: string;
  wrong: number;
  n: number;
}

/** The items missed most often, worst first. Lanes are merged — it is one word. */
export function topMissed(log: LogRow[], limit = 20): MissStat[] {
  const map = new Map<string, MissStat>();
  for (const r of log) {
    const id = r[ID].replace(/#r$/, '');
    const slot = map.get(id) ?? { id, wrong: 0, n: 0 };
    slot.n++;
    if (!r[OK]) slot.wrong++;
    map.set(id, slot);
  }
  return [...map.values()]
    .filter((s) => s.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || b.n - a.n)
    .slice(0, limit);
}

/** How many answers were logged today, and how many of them were right. */
export function todayCount(log: LogRow[]): DayCount {
  const rows = todayRows(log);
  return {
    day: new Date().toDateString(),
    n: rows.length,
    right: rows.reduce((n, r) => n + r[OK], 0),
  };
}

/** Distinct items answered today, by kind. Used to tick off the daily plan. */
export function todayByKind(log: LogRow[]): Map<Kind, number> {
  const out = new Map<Kind, number>();
  for (const r of todayRows(log)) out.set(r[KIND], (out.get(r[KIND]) ?? 0) + 1);
  return out;
}

export interface ForecastDay {
  /** Days from today: 0 = today. */
  offset: number;
  due: number;
}

/**
 * How many items come due over the next `days`, today's backlog included in day 0.
 *
 * Anything already overdue lands on day 0 — a forecast that hid the backlog behind
 * "yesterday" would understate exactly the number worth acting on.
 */
export function forecast(srs: SrsMap, days = 7): ForecastDay[] {
  const today = startOfDay(new Date());
  const out: ForecastDay[] = Array.from({ length: days }, (_, offset) => ({ offset, due: 0 }));
  for (const e of Object.values(srs) as SrsEntry[]) {
    const offset = Math.floor((startOfDay(new Date(e.due)) - today) / 864e5);
    if (offset < 0) out[0].due++;
    else if (offset < days) out[offset].due++;
  }
  return out;
}

/** Fallback pace before there is any history to measure, in seconds per question. */
const DEFAULT_SECONDS = 9;

/**
 * Typical seconds per question, from the learner's own history.
 *
 * Median rather than mean: a session left open over lunch produces one 40-minute
 * answer, and that single row would drag an average into fiction.
 */
export function secondsPerQuestion(log: LogRow[]): number {
  const recent = log.slice(-400).map((r) => r[4]);
  if (recent.length < 20) return DEFAULT_SECONDS;
  const sorted = recent.slice().sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] / 1000;
  // Clamp: a burst of guessing or one stalled tab should not redraw the estimate.
  return Math.max(3, Math.min(30, median));
}

/** Longest run of consecutive days with at least one answer, ending today or yesterday. */
export function streakFrom(log: LogRow[]): number {
  const days = new Set(byDay(log).map((d) => d.day));
  const today = startOfDay(new Date());
  let n = 0;
  // Yesterday still counts as alive — the streak only breaks once a whole day is skipped.
  let cursor = days.has(new Date(today).toDateString()) ? today : today - 864e5;
  while (days.has(new Date(cursor).toDateString())) {
    n++;
    cursor -= 864e5;
  }
  return n;
}
