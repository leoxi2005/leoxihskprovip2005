/**
 * Pinyin surgery for the tone drill.
 *
 * Everything here works off the tone marks already in the deck rather than trying to
 * split pinyin into syllables — a marked vowel *is* a syllable's tone, so swapping the
 * mark in place gives an exact, correctly-spelled distractor with no segmentation.
 */

/** Marked forms of each base vowel, indexed by tone 1–4. */
const MARKS: Record<string, string> = {
  a: 'āáǎà',
  e: 'ēéěè',
  i: 'īíǐì',
  o: 'ōóǒò',
  u: 'ūúǔù',
  ü: 'ǖǘǚǜ',
};

/** Marked vowel → `[base, tone]`. */
const LOOKUP: Record<string, [string, number]> = {};
for (const [base, marked] of Object.entries(MARKS)) {
  [...marked].forEach((ch, i) => {
    LOOKUP[ch] = [base, i + 1];
  });
}

export interface ToneSpot {
  /** Index into the pinyin string. */
  i: number;
  /** Unmarked vowel, e.g. `a`. */
  base: string;
  /** 1–4. */
  tone: number;
}

/** Every toned vowel in the string, left to right — one per non-neutral syllable. */
export function toneSpots(p: string): ToneSpot[] {
  const out: ToneSpot[] = [];
  [...p].forEach((ch, i) => {
    const hit = LOOKUP[ch];
    if (hit) out.push({ i, base: hit[0], tone: hit[1] });
  });
  return out;
}

/** The tone pattern, e.g. `2-4` for `míngbái`. Neutral syllables are not counted. */
export const tonePattern = (p: string): string =>
  toneSpots(p)
    .map((s) => s.tone)
    .join('-');

/** Same string with the vowel at `i` re-marked to `tone`. */
export function retone(p: string, i: number, tone: number): string {
  const hit = LOOKUP[p[i]];
  if (!hit) return p;
  return p.slice(0, i) + MARKS[hit[0]][tone - 1] + p.slice(i + 1);
}

/** Strips tone marks — used for search and for building sound-alike traps. */
export const stripTones = (p: string): string =>
  [...p].map((ch) => LOOKUP[ch]?.[0] ?? ch).join('');

/**
 * Wrong-but-plausible tonings of `p`, nearest-miss first.
 *
 * Each variant changes exactly one syllable's tone, which is how a real mistake
 * sounds — a learner who mishears 4th as 1st, not one who mangles the whole word.
 */
export function toneDistractors(p: string, n: number): string[] {
  const spots = toneSpots(p);
  if (!spots.length) return [];
  const out: string[] = [];
  // Walk tone offsets outward so the first candidates are the confusable near-misses.
  for (const delta of [1, 3, 2]) {
    for (const s of spots) {
      const tone = ((s.tone - 1 + delta) % 4) + 1;
      const v = retone(p, s.i, tone);
      if (v !== p && !out.includes(v)) out.push(v);
      if (out.length >= n) return out;
    }
  }
  return out;
}

/**
 * The consonant and final swaps Vietnamese learners actually make: the retroflex
 * series heard as the dental one, and `-n` heard as `-ng`.
 *
 * Ordered longest-first so `zh` is tried before `z` would match inside it.
 */
const SOUND_SWAPS: [RegExp, string][] = [
  [/zh/g, 'z'],
  [/ch/g, 'c'],
  [/sh/g, 's'],
  [/ng\b/g, 'n'],
  [/n\b/g, 'ng'],
  [/^z(?!h)/g, 'zh'],
  [/^c(?!h)/g, 'ch'],
  [/^s(?!h)/g, 'sh'],
];

/** Distractors that keep the tones but break the consonant or the final. */
export function soundDistractors(p: string, n: number): string[] {
  const out: string[] = [];
  for (const [re, to] of SOUND_SWAPS) {
    const v = p.replace(re, to);
    if (v !== p && !out.includes(v)) out.push(v);
    if (out.length >= n) break;
  }
  return out;
}

/** Vietnamese label for a tone, for the feedback panel. */
export const TONE_NAMES = [
  'thanh nhẹ (khinh thanh)',
  'thanh 1 — cao và bằng (ā)',
  'thanh 2 — lên (á)',
  'thanh 3 — xuống rồi lên (ǎ)',
  'thanh 4 — xuống dứt khoát (à)',
] as const;

export const toneName = (t: number): string => TONE_NAMES[t] ?? TONE_NAMES[0];
