import { OLD_IDS } from '../data';
import type { SrsEntry, Stats } from './types';

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

/** Box intervals: 5min, 30min, 12h, 2d, 5d, 12d. */
const INTERVALS = [300e3, 1800e3, 43200e3, 172800e3, 432e6, 1036800e3];

/** Correct → next box (capped at 5); wrong → back to box 0. */
export function nextEntry(prev: SrsEntry | undefined, ok: boolean): SrsEntry {
  const box = ok ? Math.min((prev?.box ?? 0) + 1, 5) : 0;
  return { box, due: Date.now() + INTERVALS[box] };
}
