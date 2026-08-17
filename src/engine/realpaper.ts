/**
 * Sitting a real past paper's listening section inside the app.
 *
 * The synthesised voice is fine for learning the question shapes, but it is not what
 * the exam sounds like — flat prosody, one speaker, no studio recording. The fix is
 * not to fake it better; it is to let a real recording drive the session.
 *
 * The audio never leaves the machine and is never bundled with the app: HSK papers
 * are Hanban's copyright, so the learner supplies a file they obtained themselves and
 * the browser keeps it locally.
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

export const savePaper = (p: StoredPaper): Promise<unknown> =>
  tx('readwrite', (s) => s.put(p) as IDBRequest<unknown>);

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
