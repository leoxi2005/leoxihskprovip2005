import { beforeEach, describe, expect, it } from 'vitest';
import {
  LOCKED_UNTIL_CLEAR,
  MAX_NEW,
  MIN_NEW,
  dayPlan,
  daysUntil,
  newPerDayFor,
  paceCapacity,
  paceFor,
  phaseFor,
  requiredPace,
  type PlanInput,
} from './plan';
import { DEFAULT_SETTINGS } from './types';
import { exportProgress, importProgress, KEYS, save, type LogRow } from './storage';
import { byKind, forecast, recentDays, secondsPerQuestion, streakFrom, topMissed } from './stats';

const iso = (offsetDays: number): string => {
  const d = new Date(Date.now() + offsetDays * 864e5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const input = (over: Partial<PlanInput> = {}): PlanInput => ({
  settings: { ...DEFAULT_SETTINGS, examDate: iso(60) },
  log: [],
  due: 0,
  unseen: 200,
  leeches: 0,
  newToday: 0,
  ...over,
});

beforeEach(() => localStorage.clear());

describe('countdown', () => {
  it('counts whole days to the exam and goes negative once it has passed', () => {
    expect(daysUntil(iso(0))).toBe(0);
    expect(daysUntil(iso(30))).toBe(30);
    expect(daysUntil(iso(-2))).toBe(-2);
  });

  it('walks the four phases as the date approaches', () => {
    expect(phaseFor(86).id).toBe('build');
    expect(phaseFor(50).id).toBe('build');
    expect(phaseFor(49).id).toBe('grammar');
    expect(phaseFor(21).id).toBe('grammar');
    expect(phaseFor(20).id).toBe('papers');
    expect(phaseFor(7).id).toBe('papers');
    expect(phaseFor(6).id).toBe('taper');
    expect(phaseFor(0).id).toBe('taper');
  });

  /**
   * The taper is the load-bearing part: words met in the last week cannot reach a
   * stable box before the exam, and they crowd out reviews that can.
   */
  it('tapers new words to nothing in the final week', () => {
    expect(newPerDayFor('build', 12)).toBe(12);
    expect(newPerDayFor('grammar', 12)).toBeLessThan(12);
    expect(newPerDayFor('papers', 12)).toBeLessThan(newPerDayFor('grammar', 12));
    expect(newPerDayFor('taper', 12)).toBe(0);
  });
});

describe('daily plan', () => {
  it('always asks for reviews, new words and listening', () => {
    const p = dayPlan(input());
    expect(p.tasks.filter((t) => t.required).map((t) => t.id)).toEqual(['due', 'new', 'listen']);
    expect(p.clear).toBe(false);
  });

  it('is clear once the required work is done', () => {
    const log: LogRow[] = Array.from({ length: 15 }, (_, i) => [Date.now(), 'w:x' + i, 'a2h', 1, 900]);
    const p = dayPlan(input({ due: 0, unseen: 0, log }));
    expect(p.tasks.find((t) => t.id === 'listen')!.done).toBe(15);
    expect(p.clear).toBe(true);
  });

  it('never asks for more new words than the deck still has', () => {
    const p = dayPlan(input({ unseen: 3 }));
    expect(p.tasks.find((t) => t.id === 'new')!.target).toBe(3);
  });

  it('drops the new-word task entirely in the final week', () => {
    const p = dayPlan(input({ settings: { ...DEFAULT_SETTINGS, examDate: iso(3) } }));
    const task = p.tasks.find((t) => t.id === 'new')!;
    expect(task.target).toBe(0);
    expect(task.required).toBe(false);
  });

  it('adds reading work only once vocabulary is no longer the priority', () => {
    const ids = (days: number) =>
      dayPlan(input({ settings: { ...DEFAULT_SETTINGS, examDate: iso(days) } })).tasks.map((t) => t.id);
    expect(ids(60)).toContain('tone');
    expect(ids(60)).not.toContain('read');
    expect(ids(30)).toContain('read');
    expect(ids(30)).toContain('cloze');
  });

  it('surfaces leeches only when there are some', () => {
    expect(dayPlan(input()).tasks.some((t) => t.id === 'leech')).toBe(false);
    expect(dayPlan(input({ leeches: 4 })).tasks.some((t) => t.id === 'leech')).toBe(true);
  });

  it('locks only the modes that teach least per minute', () => {
    // Every mode that clears the review queue has to stay reachable, or the lock
    // could stop someone from doing the very work it is asking for.
    expect(LOCKED_UNTIL_CLEAR).not.toContain('mix');
    expect(LOCKED_UNTIL_CLEAR).not.toContain('listen');
    expect(LOCKED_UNTIL_CLEAR).not.toContain('write');
    expect(LOCKED_UNTIL_CLEAR).toContain('endless');
    expect(LOCKED_UNTIL_CLEAR).toContain('song');
  });
});

describe('review log statistics', () => {
  const row = (dayOffset: number, id: string, ok: 0 | 1): LogRow => [
    Date.now() - dayOffset * 864e5,
    id,
    'h2m',
    ok,
    1200,
  ];

  it('fills in the empty days between sessions', () => {
    const days = recentDays([row(0, 'w:a', 1), row(3, 'w:b', 1)], 5);
    expect(days).toHaveLength(5);
    expect(days.map((d) => d.n)).toEqual([0, 1, 0, 0, 1]);
  });

  it('counts a streak that is still alive from yesterday', () => {
    expect(streakFrom([row(1, 'w:a', 1), row(2, 'w:b', 1)])).toBe(2);
    // A whole missed day breaks it.
    expect(streakFrom([row(2, 'w:a', 1), row(3, 'w:b', 1)])).toBe(0);
  });

  it('merges the two lanes of a word when ranking misses', () => {
    const log = [row(0, 'w:难', 0), row(0, 'w:难#r', 0), row(0, 'w:易', 1)];
    const top = topMissed(log);
    expect(top).toHaveLength(1);
    expect(top[0]).toMatchObject({ id: 'w:难', wrong: 2, n: 2 });
  });

  it('ranks the weakest question kind first', () => {
    const log: LogRow[] = [
      [Date.now(), 'w:a', 'dict', 0, 900],
      [Date.now(), 'w:b', 'dict', 0, 900],
      [Date.now(), 'w:c', 'h2m', 1, 900],
    ];
    expect(byKind(log)[0]).toMatchObject({ kind: 'dict', pct: 0 });
  });

  it('folds overdue items into today rather than hiding them in the past', () => {
    const f = forecast({ 'w:a': { box: 1, due: Date.now() - 9e8 }, 'w:b': { box: 1, due: Date.now() + 2 * 864e5 } }, 7);
    expect(f[0].due).toBe(1);
    expect(f[2].due).toBe(1);
  });
});

describe('backup', () => {
  it('round-trips progress through a file', () => {
    save(KEYS.srs, { 'w:通过': { box: 4, due: 123 } });
    save(KEYS.stats, { xp: 999, streak: 7, last: '', dayDate: '', dayXp: 0 });
    const file = exportProgress();

    localStorage.clear();
    const res = importProgress(file);
    expect(res.ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEYS.srs)!)['w:通过'].box).toBe(4);
    expect(JSON.parse(localStorage.getItem(KEYS.stats)!).xp).toBe(999);
  });

  it('refuses anything that is not one of its own backups, leaving progress alone', () => {
    save(KEYS.srs, { 'w:通过': { box: 4, due: 123 } });
    expect(importProgress('not json').ok).toBe(false);
    expect(importProgress('{"app":"something-else","data":{}}').ok).toBe(false);
    expect(importProgress('{"app":"hsk-quest","version":99,"data":{}}').ok).toBe(false);
    // Untouched.
    expect(JSON.parse(localStorage.getItem(KEYS.srs)!)['w:通过'].box).toBe(4);
  });

  it('leaves local-only keys out of the file', () => {
    save(KEYS.srs, {});
    localStorage.setItem(KEYS.muted, '1');
    localStorage.setItem(KEYS.rot + 'vocab', '5');
    const data = JSON.parse(exportProgress()).data;
    expect(data[KEYS.muted]).toBeUndefined();
    expect(data[KEYS.rot + 'vocab']).toBeUndefined();
  });
});

describe('pace', () => {
  /**
   * The trap this exists to close: a learner reads "12 a day, 82 days left" and
   * concludes they will cover 984 words. The taper means they will cover 655.
   */
  it('counts the taper rather than multiplying days by pace', () => {
    expect(paceCapacity(12, 82)).toBeLessThan(12 * 82);
    expect(paceCapacity(12, 82)).toBeGreaterThan(600);
  });

  it('gives zero capacity once only the final week is left', () => {
    expect(paceCapacity(20, 6)).toBe(0);
  });

  it('grows with pace and with time', () => {
    expect(paceCapacity(20, 82)).toBeGreaterThan(paceCapacity(12, 82));
    expect(paceCapacity(12, 82)).toBeGreaterThan(paceCapacity(12, 40));
  });

  it('finds the smallest pace that still finishes the deck', () => {
    const need = requiredPace(800, 82);
    expect(paceCapacity(need, 82)).toBeGreaterThanOrEqual(800);
    expect(paceCapacity(need - 1, 82)).toBeLessThan(800);
  });

  it('never asks for less than the floor or more than the ceiling', () => {
    expect(requiredPace(1, 82)).toBe(MIN_NEW);
    expect(requiredPace(99999, 82)).toBe(MAX_NEW);
  });

  it('reports a shortfall instead of silently under-delivering', () => {
    const settings = { ...DEFAULT_SETTINGS, autoPace: false, newPerDay: 5, examDate: iso(82) };
    const p = paceFor(900, 82, settings);
    expect(p.base).toBe(5);
    expect(p.shortfall).toBeGreaterThan(0);
    // Reachable: some higher pace would have covered it, the chosen one just doesn't.
    expect(p.reachable).toBe(true);
  });

  it('flags a deck that no pace can cover in the time left', () => {
    const p = paceFor(900, 20, { ...DEFAULT_SETTINGS, examDate: iso(20) });
    expect(p.reachable).toBe(false);
    expect(p.shortfall).toBeGreaterThan(0);
  });

  it('auto mode tracks the deck instead of holding a stale number', () => {
    const settings = { ...DEFAULT_SETTINGS, autoPace: true, newPerDay: 12, examDate: iso(82) };
    const heavy = paceFor(900, 82, settings).base;
    const light = paceFor(100, 82, settings).base;
    expect(heavy).toBeGreaterThan(light);
    // The stored newPerDay is ignored entirely while auto is on.
    expect(paceFor(900, 82, { ...settings, newPerDay: 3 }).base).toBe(heavy);
  });

  it('drives the day plan’s new-word target', () => {
    const auto = dayPlan(input({ unseen: 900, settings: { ...DEFAULT_SETTINGS, examDate: iso(82) } }));
    const manual = dayPlan(
      input({
        unseen: 900,
        settings: { ...DEFAULT_SETTINGS, examDate: iso(82), autoPace: false, newPerDay: 5 },
      }),
    );
    expect(auto.tasks.find((t) => t.id === 'new')!.target).toBeGreaterThan(
      manual.tasks.find((t) => t.id === 'new')!.target,
    );
    expect(auto.pace.shortfall).toBe(0);
  });

  it('estimates the day’s load from the required work only', () => {
    const p = dayPlan(input({ due: 40, unseen: 100 }));
    const required = p.tasks.filter((t) => t.required).reduce((n, t) => n + t.target, 0);
    expect(p.questions).toBe(required);
    expect(p.questions).toBeGreaterThan(40);
  });
});

describe('workload estimate', () => {
  const row = (kind: 'tf' | 'match' | 'h2m', ms: number): LogRow => [Date.now(), 'w:x', kind, 1, ms];

  /**
   * The bug this closes: the lightning round runs on a six-second clock and a match
   * board is logged as four answers off one sitting, so both land at two or three
   * seconds. With them counted, a 51-question day was estimated at three minutes.
   */
  it('ignores burst modes when measuring how fast the learner works', () => {
    const study = Array.from({ length: 30 }, () => row('h2m', 12000));
    const burst = Array.from({ length: 200 }, () => row('tf', 2000));
    expect(secondsPerQuestion([...study, ...burst])).toBe(12);
  });

  it('never estimates faster than a person can read four options', () => {
    expect(secondsPerQuestion(Array.from({ length: 40 }, () => row('h2m', 500)))).toBe(5);
  });

  it('falls back to a default until there is enough history', () => {
    expect(secondsPerQuestion([])).toBe(9);
    expect(secondsPerQuestion(Array.from({ length: 5 }, () => row('h2m', 20000)))).toBe(9);
  });

  it('is not dragged around by one session left open', () => {
    const normal = Array.from({ length: 40 }, () => row('h2m', 10000));
    expect(secondsPerQuestion([...normal, row('h2m', 40 * 60 * 1000)])).toBe(10);
  });
});
