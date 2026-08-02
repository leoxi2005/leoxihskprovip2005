import deckJson from './deck.json';
import imagesJson from './images.json';
import storiesJson from './stories.json';
import songsJson from './songs.json';
import mysongJson from './mysong.json';
import oldIdsJson from './oldids.json';
import { EXTRA_GRAMMAR, EXTRA_STORIES, EXTRA_VOCAB } from './extra';
import { EXTRA2_GRAMMAR, EXTRA2_STORIES, EXTRA2_VOCAB } from './extra2';
import type { Deck, MySong, Song } from './types';

export * from './types';
export { CONFUSABLES, EXTRA_TOPIC, type Confusable } from './extra';
export { EXTRA2_TOPICS, TOPIC_ART, TOPIC_JOB, TOPIC_LANG, TOPIC_STUDY } from './extra2';

const bundled = deckJson as Deck;

/** The handoff bundle plus everything in `extra.ts` and `extra2.ts`. */
export const DECK: Deck = {
  ...bundled,
  vocab: [...bundled.vocab, ...EXTRA_VOCAB, ...EXTRA2_VOCAB],
  grammar: [...bundled.grammar, ...EXTRA_GRAMMAR, ...EXTRA2_GRAMMAR],
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
