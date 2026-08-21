import deckJson from './deck.json';
import imagesJson from './images.json';
import storiesJson from './stories.json';
import songsJson from './songs.json';
import mysongJson from './mysong.json';
import oldIdsJson from './oldids.json';
import { EXTRA_GRAMMAR, EXTRA_STORIES, EXTRA_VOCAB } from './extra';
import { EXTRA2_GRAMMAR, EXTRA2_STORIES, EXTRA2_TOPICS, EXTRA2_VOCAB } from './extra2';
import { EXTRA3_GRAMMAR, EXTRA3_STORIES, EXTRA3_TOPICS, EXTRA3_VOCAB } from './extra3';
import { EXTRA4_GRAMMAR, EXTRA4_STORIES, EXTRA4_TOPICS, EXTRA4_VOCAB } from './extra4';
import { splitHsk123 } from './hsk123';
import { splitHsk4 } from './hsk4';
import type { Deck, MySong, Song, Vocab } from './types';

export * from './types';
export { COLLOCATIONS, FIXES, type Collocation, type FixItem } from './drills';
export { CONFUSABLES, EXTRA_TOPIC, type Confusable } from './extra';
export { EXTRA2_TOPICS, TOPIC_ART, TOPIC_JOB, TOPIC_LANG, TOPIC_STUDY } from './extra2';
export { EXTRA3_TOPICS, TOPIC_ATT, TOPIC_BODY, TOPIC_LIFE } from './extra3';
export {
  EXTRA4_TOPICS,
  TOPIC_PAY,
  TOPIC_SCHOOL,
  TOPIC_TALK,
  TOPIC_TRIP,
  TOPIC_WORK,
} from './extra4';

/**
 * Every topic added after the designer's bundle — what the ⭐ shortcut on the
 * home screen isolates. Order follows the order the words appear in `DECK`, so
 * `selOnly` lines up with `engine.topics`.
 */
export const NEW_TOPICS = [...EXTRA2_TOPICS, ...EXTRA3_TOPICS, ...EXTRA4_TOPICS] as const;

const bundled = deckJson as Deck;

/** The textbook deck: the handoff bundle plus every `extraN.ts` drop. */
const TEXTBOOK: Vocab[] = [
  ...bundled.vocab,
  ...EXTRA_VOCAB,
  ...EXTRA2_VOCAB,
  ...EXTRA3_VOCAB,
  ...EXTRA4_VOCAB,
];

const HSK4 = splitHsk4(new Set(TEXTBOOK.map((v) => v.h)));

// Level 1–3 is split against the textbook deck *and* the level-4 list, so a word can
// only ever enter the deck once, under the lowest level that claims it.
const HSK123 = splitHsk123(new Set([...TEXTBOOK.map((v) => v.h), ...HSK4.fresh.map((v) => v.h)]));

/**
 * Words the textbook deck already had keep their own topic, meaning and illustration —
 * moving them would orphan their SRS history and their mnemonics. The official lists
 * only fill in an example sentence where the deck had none, which is what the cloze
 * mode runs on.
 */
const ENRICHED: Vocab[] = TEXTBOOK.map((v) => {
  const official = v.ex ? undefined : (HSK4.known.get(v.h) ?? HSK123.known.get(v.h));
  return official ? { ...v, ex: official.ex, exVi: official.exVi } : v;
});

/** Batch topics for the HSK 4 words the textbook deck did not cover. */
export const HSK4_TOPICS = HSK4.topics;

/** Batch topics for the HSK 1–3 base the deck did not cover. */
export const HSK123_TOPICS = HSK123.topics;

export { HSK4_BATCH, HSK4_COUNT } from './hsk4';
export { HSK123_BATCH, HSK123_COUNT } from './hsk123';

/** How many of each official list the textbook deck already contained. */
export const HSK4_OVERLAP = HSK4.known.size;
export const HSK123_OVERLAP = HSK123.known.size;

/**
 * Topics that start switched off.
 *
 * HSK 1–2 is here for coverage of the full 1200-word syllabus, not for drilling.
 * Someone sitting HSK 4 knows 我 and 好, and letting those words consume the daily
 * new-word budget would be the most expensive kind of busywork. The chips are still
 * there to switch on for anyone who wants to check the base.
 */
export const DEFAULT_OFF_TOPICS: readonly string[] = HSK123.offByDefault;

export const DECK: Deck = {
  ...bundled,
  vocab: [...ENRICHED, ...HSK123.fresh, ...HSK4.fresh],
  grammar: [
    ...bundled.grammar,
    ...EXTRA_GRAMMAR,
    ...EXTRA2_GRAMMAR,
    ...EXTRA3_GRAMMAR,
    ...EXTRA4_GRAMMAR,
  ],
};

/**
 * Hanzi → bundled illustration path.
 *
 * These live in `public/`, so Vite never rewrites them — under a base path like
 * `/leoxihskprovip2005/` a bare `/img/x.jpg` would resolve to the domain root and 404.
 * Re-anchor them on BASE_URL, which is `/` in dev and the repo path in a build.
 */
export const IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(imagesJson as Record<string, string>).map(([h, src]) => [
    h,
    import.meta.env.BASE_URL + src.replace(/^\//, ''),
  ]),
);

/** Hanzi → Vietnamese mnemonic. */
export const STORIES: Record<string, string> = {
  ...storiesJson,
  ...EXTRA_STORIES,
  ...EXTRA2_STORIES,
  ...EXTRA3_STORIES,
  ...EXTRA4_STORIES,
};

/** Built-in vocabulary chants. */
export const SONGS = songsJson as Song[];

/** The real song with a YouTube video. */
export const MYSONG = mysongJson as MySong;

/**
 * v1 SRS keys were positional (`w0`, `w1`, …) into this list. Kept so existing
 * progress can be migrated onto the stable `w:<hanzi>` ids. See `migrateSrs`.
 */
export const OLD_IDS = oldIdsJson as string[];
