/**
 * Sitting a real past paper's listening section inside the app.
 *
 * The synthesised voice is fine for learning the question shapes, but it is not what
 * the exam sounds like — flat prosody, one speaker, no studio recording. The fix is
 * not to fake it better; it is to let a real recording drive the session.
 *
 * The official sample paper's recording ships with the app — the exam body publishes
 * it free for practice. Real past papers are its copyright, so those the learner
 * supplies as their own file, which then stays in this browser and is never uploaded.
 */

/** 听力 is 45 questions: ten true/false, then thirty-five four-option. */
export const LISTEN_COUNT = 45;
export const TF_COUNT = 10;

export type KeyAnswer = 'T' | 'F' | 'A' | 'B' | 'C' | 'D';

/**
 * Digits are deliberately absent.
 *
 * A few answer sheets write true/false as 1/0, but almost every pasted key is
 * numbered — "1.✓ 2.✗" — and reading those digits as answers silently doubles the
 * key. Losing an unusual notation beats corrupting the common case.
 */
const TRUE_CHARS = '+TYty✓√对';
const FALSE_CHARS = '-FNfn✗×错';

/** Normalises one character of a pasted answer key, or `null` if it is punctuation. */
function normalise(ch: string): KeyAnswer | null {
  if (TRUE_CHARS.includes(ch)) return 'T';
  if (FALSE_CHARS.includes(ch)) return 'F';
  const up = ch.toUpperCase();
  if ('ABCD'.includes(up)) return up as KeyAnswer;
  // Full-width letters, which is what you get pasting from a Chinese PDF.
  const wide = 'ＡＢＣＤ'.indexOf(ch);
  if (wide >= 0) return 'ABCD'[wide] as KeyAnswer;
  return null;
}

export interface KeyParse {
  key: KeyAnswer[];
  /** Vietnamese message when the key cannot be used as-is. */
  error?: string;
}

/**
 * Reads an answer key typed or pasted from the paper's answer sheet.
 *
 * Deliberately forgiving about separators and about how true/false is written —
 * answer sheets use ✓/✗, 对/错, T/F and +/− interchangeably, and a key that is
 * rejected over punctuation is a key nobody enters twice.
 */
export function parseKey(text: string): KeyParse {
  const key: KeyAnswer[] = [];
  for (const ch of text) {
    const a = normalise(ch);
    if (a) key.push(a);
  }

  if (key.length !== LISTEN_COUNT) {
    return {
      key,
      error: `Cần đúng ${LISTEN_COUNT} đáp án cho phần nghe, đang đọc được ${key.length}.`,
    };
  }
  const badTf = key.slice(0, TF_COUNT).findIndex((a) => a !== 'T' && a !== 'F');
  if (badTf >= 0) {
    return { key, error: `Câu ${badTf + 1} phải là đúng/sai (✓ ✗ · T F · 对 错), không phải ${key[badTf]}.` };
  }
  const badAbcd = key.slice(TF_COUNT).findIndex((a) => a === 'T' || a === 'F');
  if (badAbcd >= 0) {
    return { key, error: `Câu ${TF_COUNT + badAbcd + 1} phải là A · B · C · D.` };
  }
  return { key };
}

/** What each question of the listening section offers as choices. */
export const optionsFor = (i: number): KeyAnswer[] =>
  i < TF_COUNT ? ['T', 'F'] : ['A', 'B', 'C', 'D'];

export interface RealScore {
  right: number;
  count: number;
  /** Scaled onto the section's 100 points, as the paper does. */
  points: number;
  blank: number;
  /** Indices (0-based) that were answered wrongly. */
  wrong: number[];
}

export function scoreKey(key: KeyAnswer[], given: (KeyAnswer | null)[]): RealScore {
  let right = 0;
  let blank = 0;
  const wrong: number[] = [];
  key.forEach((a, i) => {
    const g = given[i];
    if (!g) blank++;
    if (g === a) right++;
    else wrong.push(i);
  });
  return {
    right,
    count: key.length,
    points: key.length ? Math.round((right / key.length) * 100) : 0,
    blank,
    wrong,
  };
}

// -- stored papers ----------------------------------------------------------

export interface StoredPaper {
  id: string;
  name: string;
  key: KeyAnswer[];
  /** The recording itself. Stays on this machine. */
  audio: Blob;
  at: number;
}

/** Metadata only — what the picker shows without pulling megabytes of audio. */
export type PaperInfo = Omit<StoredPaper, 'audio'>;

const DB_NAME = 'hskq-papers';
const STORE = 'papers';

/**
 * `localStorage` cannot hold a 30 MB recording, so papers live in IndexedDB.
 *
 * Every call resolves to `null` where IndexedDB is missing (private mode, test
 * environments) rather than throwing — a browser without it should lose the feature,
 * not the app.
 */
function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return open().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) return resolve(null);
        try {
          const req = run(db.transaction(STORE, mode).objectStore(STORE));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      }),
  );
}

/**
 * Stores a paper, reporting whether it actually landed.
 *
 * `tx` swallows a missing or refused IndexedDB so the app survives private mode — but
 * a save that quietly does nothing leaves the learner staring at an empty list with no
 * idea why, so this one call has to say so.
 */
export async function savePaper(p: StoredPaper): Promise<boolean> {
  const done = await tx('readwrite', (s) => s.put(p) as IDBRequest<unknown>);
  return done !== null;
}

export const deletePaper = (id: string): Promise<unknown> =>
  tx('readwrite', (s) => s.delete(id) as unknown as IDBRequest<unknown>);

export const getPaper = (id: string): Promise<StoredPaper | null> =>
  tx<StoredPaper>('readonly', (s) => s.get(id) as IDBRequest<StoredPaper>);

export async function listPapers(): Promise<PaperInfo[]> {
  const all = await tx<StoredPaper[]>('readonly', (s) => s.getAll() as IDBRequest<StoredPaper[]>);
  return (all ?? [])
    .map(({ audio: _audio, ...info }) => info)
    .sort((a, b) => b.at - a.at);
}

export interface PaperPreset {
  id: string;
  name: string;
  /** Listening answers 1–45, exactly as the official answer sheet prints them. */
  key: string;
  note: string;
  /**
   * Filename under `public/audio/` when the recording ships with the app.
   *
   * Only the sample paper qualifies: the exam body publishes it free for anyone to
   * practise on. Every other paper's recording stays the learner's own file.
   */
  audio?: string;
}

/**
 * Answer keys for papers worth having to hand, so the only thing left to supply is
 * the recording.
 *
 * Recordings are the exam body's copyright and are not bundled — except the official
 * sample, which that same body publishes for free practice.
 *
 * A key found floating on the web is worth nothing on its own. The first key shipped
 * for the sample paper came off a PDF that said "H41001 答案" at the top and was wrong
 * on 37 of 45 questions: it marked 经理发现了小王的一些缺点 as true when the recording
 * says 经理几乎没发现他有什么缺点. Both keys below are now derived from the paper itself —
 * read the 听力材料 script against the printed options and the answer follows — and
 * H41332's agrees with the answer sheet published alongside it.
 */
export const PAPER_PRESETS: PaperPreset[] = [
  {
    id: 'H41001',
    name: 'Đề mẫu chính thức HSK 4 (H41001 样卷)',
    key: '√××√×√√×√× ACCBC DCACA BBACB ADDCC BDCAB BDDBD ADBDA',
    note: 'Đề mẫu do đơn vị ra đề phát hành. File nghe đã kèm sẵn; đáp án dò từ chính bản lời thoại 听力材料 của đề.',
    audio: 'hsk4-h41001.mp3',
  },
  {
    id: 'H41332',
    name: 'Đề thật HSK 4 · H41332',
    key: '√××√√××√×√ CCDCB DDCAA BCBAD BDDCD BACAC ACADA DBBBD',
    note: 'Đề thi thật đã công bố. Tải PDF ở my-hsk.com; file nghe tìm ở các nguồn bên dưới.',
  },
];

/** A paper whose recording ships with the app — playable without loading anything. */
export interface BuiltinPaper {
  id: string;
  name: string;
  key: KeyAnswer[];
  /** Ready to hand straight to an `<audio src>`. */
  url: string;
  note: string;
}

/**
 * The papers that need no setup at all.
 *
 * Built from the presets rather than listed twice, so a key can never drift apart
 * from the recording it marks. `BASE_URL` is what makes this work on GitHub Pages,
 * where the site sits under a repository path rather than at the domain root.
 */
export const BUILTIN_PAPERS: BuiltinPaper[] = PAPER_PRESETS.filter((p) => p.audio).map((p) => ({
  id: p.id,
  name: p.name,
  key: parseKey(p.key).key,
  url: `${import.meta.env.BASE_URL}audio/${p.audio}`,
  note: p.note,
}));

/** Where a learner can legitimately get a paper and its recording. */
export const PAPER_SOURCES: { name: string; url: string; note: string }[] = [
  {
    name: 'Chinese Test — trang chính thức',
    url: 'https://www.chinesetest.cn/HSK/4',
    note: 'Đề mẫu và đại cương do đơn vị ra đề phát hành. Nguồn gốc chuẩn nhất.',
  },
  {
    name: 'ImproveMandarin — HSK 4 practice tests',
    url: 'https://improvemandarin.com/hsk-4-practice-test/',
    note: 'Tập hợp đề thật kèm PDF và file nghe, tải trực tiếp không cần đăng ký.',
  },
  {
    name: 'Panda Chinese — HSK 4 mock test',
    url: 'https://pandachinese.online/en/hsk/hsk-4-mock-test/',
    note: 'Có đáp án và audio; 4 bộ miễn phí.',
  },
  {
    name: 'DigMandarin — HSK practice test',
    url: 'https://www.digmandarin.com/hsk-practice-test',
    note: 'PDF + MP3 cho cả sáu cấp, tiện khi muốn tải nhiều đề một lượt.',
  },
];
