/**
 * Mock HSK 4 paper — the exam Ho Chi Minh City University of Education actually
 * administers (it is Vietnam's licensed HSK centre in the south).
 *
 * The shape here is the official one, not an approximation: 100 questions in three
 * sections, 45 + 40 + 15, timed 30 + 40 + 25 minutes, 100 points a section, 180/300
 * to pass. Deviating from it would make the rehearsal useless — the whole value of a
 * mock is that the clock and the question order feel like the real thing.
 *
 * Note the 7 November 2026 sitting is still HSK 2.0: Vietnam switches to HSK 3.0 on
 * 13 December 2026, so this format is the one that paper will use.
 */

export type SectionId = 'listen' | 'read' | 'write';

export interface PartSpec {
  /** `听力第一部分` etc. */
  cn: string;
  vi: string;
  /** What the candidate is told to do, in Vietnamese. */
  task: string;
  count: number;
}

export interface SectionSpec {
  id: SectionId;
  cn: string;
  vi: string;
  minutes: number;
  points: number;
  parts: PartSpec[];
}

export const EXAM_SPEC: SectionSpec[] = [
  {
    id: 'listen',
    cn: '听力',
    vi: 'Nghe hiểu',
    minutes: 30,
    points: 100,
    parts: [
      {
        cn: '第一部分',
        vi: 'Phần 1',
        task: 'Nghe một đoạn rồi phán đoán câu in trên đề là ĐÚNG hay SAI. Mỗi câu chỉ nghe một lần.',
        count: 10,
      },
      {
        cn: '第二部分',
        vi: 'Phần 2',
        task: 'Nghe đoạn đối thoại ngắn và câu hỏi, chọn đáp án đúng nhất. Mỗi câu chỉ nghe một lần.',
        count: 15,
      },
      {
        cn: '第三部分',
        vi: 'Phần 3',
        task: 'Nghe đoạn hội thoại dài hoặc đoạn văn ngắn, chọn đáp án đúng nhất. Mỗi câu chỉ nghe một lần.',
        count: 20,
      },
    ],
  },
  {
    id: 'read',
    cn: '阅读',
    vi: 'Đọc hiểu',
    minutes: 40,
    points: 100,
    parts: [
      { cn: '第一部分', vi: 'Phần 1', task: 'Chọn từ thích hợp điền vào chỗ trống.', count: 10 },
      { cn: '第二部分', vi: 'Phần 2', task: 'Sắp xếp ba câu thành một đoạn văn hợp lý.', count: 10 },
      { cn: '第三部分', vi: 'Phần 3', task: 'Đọc đoạn văn và chọn đáp án đúng.', count: 20 },
    ],
  },
  {
    id: 'write',
    cn: '书写',
    vi: 'Viết',
    minutes: 25,
    points: 100,
    parts: [
      { cn: '第一部分', vi: 'Phần 1', task: 'Dùng các từ cho sẵn viết thành một câu hoàn chỉnh.', count: 10 },
      { cn: '第二部分', vi: 'Phần 2', task: 'Nhìn tranh, dùng từ cho sẵn viết một câu.', count: 5 },
    ],
  },
];

/** 180 out of 300 is the official pass mark. */
export const PASS_MARK = 180;

export const TOTAL_QUESTIONS = EXAM_SPEC.reduce(
  (n, s) => n + s.parts.reduce((m, p) => m + p.count, 0),
  0,
);

// -- paper data -------------------------------------------------------------

/** 听力第一部分 — judge the printed sentence against what was said. */
export interface TfItem {
  /** Spoken text; never shown before the answers are revealed. */
  say: string;
  /** The printed sentence to judge. */
  stmt: string;
  ok: boolean;
  vi: string;
}

/** 听力第二/三部分 and 阅读第三部分 — four options, one right. */
export interface QaItem {
  /** Spoken lines, in order. Empty for reading questions. */
  say?: string[];
  /**
   * This question follows on from the previous one's recording — the real exam asks
   * two questions off a single playing, and replaying it would hand back an advantage
   * the paper does not give.
   */
  sameAudio?: boolean;
  /** Passage shown on the page. Empty for listening questions. */
  text?: string;
  q: string;
  opts: [string, string, string, string];
  ans: number;
  /** Vietnamese translation of what was said or read. */
  vi: string;
  expl?: string;
}

/**
 * 阅读第一部分 — a shared bank of six words for five sentences, exactly as printed.
 * One word is always left over, which is what stops the last blank being free.
 */
export interface FillGroup {
  bank: [string, string, string, string, string, string];
  items: { sent: string; ans: number; vi: string }[];
}

/** 阅读第二部分 — put three fragments in order. */
export interface OrderItem {
  parts: [string, string, string];
  /** Correct reading order as indices into `parts`, e.g. `[1,0,2]` = B A C. */
  ans: [number, number, number];
  vi: string;
}

/** 书写第一部分 — build a sentence from the given words. */
export interface SentItem {
  words: string[];
  /** Model answer first; any further entries are also accepted. */
  accept: string[];
  vi: string;
}

/** 书写第二部分 — one sentence about the picture, using the given word. */
export interface PicItem {
  word: string;
  /** Hanzi key into `IMAGES`, when the deck has an illustration for it. */
  img?: string;
  /** Scene prompt, for when no illustration exists. */
  scene: string;
  sample: string;
  vi: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  listen1: TfItem[];
  listen2: QaItem[];
  listen3: QaItem[];
  read1: FillGroup[];
  read2: OrderItem[];
  read3: QaItem[];
  write1: SentItem[];
  write2: PicItem[];
}

// -- flattening -------------------------------------------------------------

export type ExamQ =
  | { kind: 'tf'; part: string; i: number; item: TfItem }
  | { kind: 'qa'; part: string; i: number; item: QaItem; heard: boolean }
  | { kind: 'fill'; part: string; i: number; group: FillGroup; at: number }
  | { kind: 'order'; part: string; i: number; item: OrderItem }
  | { kind: 'sent'; part: string; i: number; item: SentItem }
  | { kind: 'pic'; part: string; i: number; item: PicItem };

/** The paper as one numbered list, in the order it is sat. */
export function flatten(p: ExamPaper): { section: SectionId; q: ExamQ }[] {
  const out: { section: SectionId; q: ExamQ }[] = [];
  let n = 0;
  const push = (section: SectionId, q: Omit<ExamQ, 'i'>) =>
    out.push({ section, q: { ...q, i: n++ } as ExamQ });

  p.listen1.forEach((item) => push('listen', { kind: 'tf', part: '听力第一部分', item } as never));
  p.listen2.forEach((item) =>
    push('listen', { kind: 'qa', part: '听力第二部分', item, heard: false } as never),
  );
  p.listen3.forEach((item) =>
    push('listen', { kind: 'qa', part: '听力第三部分', item, heard: false } as never),
  );
  p.read1.forEach((group) =>
    group.items.forEach((_, at) => push('read', { kind: 'fill', part: '阅读第一部分', group, at } as never)),
  );
  p.read2.forEach((item) => push('read', { kind: 'order', part: '阅读第二部分', item } as never));
  p.read3.forEach((item) =>
    push('read', { kind: 'qa', part: '阅读第三部分', item, heard: true } as never),
  );
  p.write1.forEach((item) => push('write', { kind: 'sent', part: '书写第一部分', item } as never));
  p.write2.forEach((item) => push('write', { kind: 'pic', part: '书写第二部分', item } as never));
  return out;
}

// -- answers and scoring ----------------------------------------------------

/**
 * One answer slot per question.
 *
 * `null` means unanswered. Choice questions hold an option index; the two writing
 * parts hold the typed sentence, graded separately.
 */
export type ExamAnswer = number | string | null;

/**
 * Writing is marked by the candidate against a model answer, because no string
 * comparison can tell a correct alternative word order from a wrong one.
 *
 * `undefined` = not yet marked.
 */
export type SelfMark = boolean | undefined;

export const isAutoGraded = (q: ExamQ): boolean => q.kind !== 'sent' && q.kind !== 'pic';

/** Normalises a typed sentence before comparing it to the model answers. */
const tidy = (s: string): string => s.replace(/[\s，。！？、,.!?]/g, '');

/**
 * Whether a written sentence matches one of the accepted answers outright.
 *
 * A miss here is not a mark of zero — it hands the question to the candidate to mark,
 * since 完成句子 usually has more than one right word order.
 */
export const writtenMatches = (q: ExamQ, typed: string): boolean =>
  q.kind === 'sent' && q.item.accept.some((a) => tidy(a) === tidy(typed));

export function isRight(q: ExamQ, a: ExamAnswer, mark: SelfMark): boolean {
  switch (q.kind) {
    case 'tf':
      return a === (q.item.ok ? 1 : 0);
    case 'qa':
      return a === q.item.ans;
    case 'fill':
      return a === q.group.items[q.at].ans;
    case 'order':
      // Marked as one question: the whole three-way order has to be right.
      return typeof a === 'string' && a === q.item.ans.join('');
    case 'sent':
      return mark ?? (typeof a === 'string' && writtenMatches(q, a));
    case 'pic':
      return mark === true;
  }
}

export interface SectionScore {
  id: SectionId;
  right: number;
  count: number;
  /** Scaled to the section's 100 points. */
  points: number;
}

export interface ExamScore {
  sections: SectionScore[];
  total: number;
  passed: boolean;
  /** Questions left blank. */
  blank: number;
}

/**
 * Scales each section onto its own 100 points and sums them.
 *
 * The real exam standardises scores against the cohort; a straight proportion is the
 * closest honest approximation offline, and it is what every practice book uses.
 */
export function score(
  qs: { section: SectionId; q: ExamQ }[],
  answers: ExamAnswer[],
  marks: SelfMark[],
): ExamScore {
  const sections: SectionScore[] = EXAM_SPEC.map((s) => ({
    id: s.id,
    right: 0,
    count: 0,
    points: 0,
  }));
  let blank = 0;

  qs.forEach(({ section, q }, i) => {
    const slot = sections.find((s) => s.id === section)!;
    slot.count++;
    const a = answers[i];
    if (a === null || a === '') blank++;
    if (isRight(q, a, marks[i])) slot.right++;
  });

  sections.forEach((s, i) => {
    s.points = s.count ? Math.round((s.right / s.count) * EXAM_SPEC[i].points) : 0;
  });

  const total = sections.reduce((n, s) => n + s.points, 0);
  return { sections, total, passed: total >= PASS_MARK, blank };
}

/**
 * The passage a reading question belongs to.
 *
 * The paper prints one text and asks two questions off it; the second question carries
 * `sameAudio` and no text of its own, so it reads back to the one that does rather
 * than duplicating the passage in the data.
 */
export function passageFor(qs: { q: ExamQ }[], i: number): string | undefined {
  for (let k = i; k >= 0; k--) {
    const q = qs[k].q;
    if (q.kind !== 'qa') return undefined;
    if (q.item.text) return q.item.text;
    if (!q.item.sameAudio) return undefined;
  }
  return undefined;
}

/** Section boundaries, so the clock can be reset when a new section starts. */
export function sectionRanges(qs: { section: SectionId }[]): Record<SectionId, [number, number]> {
  const out = {} as Record<SectionId, [number, number]>;
  qs.forEach(({ section }, i) => {
    if (!out[section]) out[section] = [i, i];
    else out[section][1] = i;
  });
  return out;
}
