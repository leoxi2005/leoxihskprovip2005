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

// -- per-part coaching ------------------------------------------------------

/** The exact `ExamQ.part` string, which is also a part's id. */
export type PartId =
  | '听力第一部分'
  | '听力第二部分'
  | '听力第三部分'
  | '阅读第一部分'
  | '阅读第二部分'
  | '阅读第三部分'
  | '书写第一部分'
  | '书写第二部分';

export interface PartGuide {
  id: PartId;
  section: SectionId;
  /** Short Vietnamese name. */
  vi: string;
  /** The Chinese name of the task type, as the paper prints it. */
  task: string;
  count: number;
  /** Seconds a candidate can afford per question in the real paper. */
  secPerQ: number;
  /** What the part is actually testing. */
  what: string;
  /** How to work a question, in order. */
  steps: string[];
  /** The mistakes that cost marks here. */
  traps: string[];
}

/**
 * How to work each part.
 *
 * Sitting a full paper tells you your score; it does not tell you what to do
 * differently. These are the per-part techniques — the thing a tutor would say
 * before letting you near a timed paper.
 */
export const PART_GUIDES: PartGuide[] = [
  {
    id: '听力第一部分',
    section: 'listen',
    vi: 'Nghe · Phán đoán đúng sai',
    task: '判断对错',
    count: 10,
    secPerQ: 13,
    what: 'Nghe một đoạn độc thoại ngắn. Trên đề in sẵn một câu bắt đầu bằng ★ — phán đoán câu đó ĐÚNG hay SAI so với những gì vừa nghe.',
    steps: [
      'Đọc câu ★ TRƯỚC khi băng chạy. Giữa các câu có khoảng 12 giây trống — dùng hết chỗ đó.',
      'Khoanh trong đầu 2–3 từ khoá của câu ★: danh từ, động từ, con số, thời gian.',
      'Khi nghe, chỉ săn đúng mấy từ khoá đó. Đừng cố dịch cả đoạn — không kịp và cũng không cần.',
      'Không chắc thì vẫn chọn. Xác suất 50%, bỏ trống là 0.',
    ],
    traps: [
      'Băng nhắc đúng từ trong câu ★ nhưng có 不 · 没 · 别 đứng trước → vẫn là SAI.',
      'Đổi chủ thể: băng nói "bạn tôi đi", câu ★ viết "anh ấy đi".',
      'Đổi thời gian hoặc chiều hướng: 提前 ↔ 推迟, 已经 ↔ 还没, 三点 ↔ 三十.',
    ],
  },
  {
    id: '听力第二部分',
    section: 'listen',
    vi: 'Nghe · Đối thoại ngắn',
    task: '短对话',
    count: 15,
    secPerQ: 12,
    what: 'Hai người mỗi người nói một câu, người thứ ba đặt câu hỏi. Đề CHỈ in 4 phương án — câu hỏi nằm trong băng.',
    steps: [
      'Đọc 4 phương án trước để đoán câu hỏi sẽ hỏi gì: nghề nghiệp? nơi chốn? thái độ? thời gian?',
      'Đáp án hầu như luôn nằm ở lượt nói THỨ HAI — lượt đầu chỉ dựng bối cảnh.',
      'Nghe kỹ câu 问 ở cuối: nó quyết định chọn gì, và nó chỉ đọc một lần.',
    ],
    traps: [
      'Phương án lặp y nguyên một từ vừa nghe thường là bẫy, không phải đáp án.',
      'Câu hỏi hỏi 男的 nhưng thông tin lại nằm trong lời 女的 (và ngược lại).',
      'Nghe hụt thì chọn đại rồi sang câu sau ngay — nấn ná là mất luôn câu kế tiếp.',
    ],
  },
  {
    id: '听力第三部分',
    section: 'listen',
    vi: 'Nghe · Đoạn dài',
    task: '长对话 / 短文',
    count: 20,
    secPerQ: 12,
    what: 'Hội thoại 4–5 lượt hoặc một đoạn văn ngắn, kèm 1–2 câu hỏi. Đây là phần dài nhất của bài nghe.',
    steps: [
      'Nếu một đoạn có 2 câu hỏi, đọc lướt hết 8 phương án trước khi băng chạy.',
      'Vừa nghe vừa ghi nhớ bốn thứ: ai · ở đâu · làm gì · kết quả ra sao.',
      'Câu hỏi đầu thường hỏi chi tiết, câu sau hỏi ý chính hoặc thái độ người nói.',
    ],
    traps: [
      'Đoạn văn hay có 但是 · 不过 · 其实 — ý chính nằm SAU chỗ ngoặt, không phải trước.',
      'Mất câu thứ nhất thì buông luôn câu đó, tập trung giữ câu thứ hai.',
    ],
  },
  {
    id: '阅读第一部分',
    section: 'read',
    vi: 'Đọc · Điền từ',
    task: '选词填空',
    count: 10,
    secPerQ: 45,
    what: 'Năm câu, sáu từ cho sẵn — chọn từ điền vào chỗ trống. Luôn thừa đúng một từ.',
    steps: [
      'Xác định TỪ LOẠI của cả sáu lựa chọn trước: danh, động, tính, phó từ.',
      'Nhìn chỗ trống, xem trước và sau nó là gì để suy ra cần từ loại nào.',
      'Làm câu chắc chắn trước và loại dần. Từ còn thừa cuối cùng thường là câu khó nhất.',
    ],
    traps: [
      'Chọn theo nghĩa mà quên từ loại — đây là lỗi phổ biến nhất của phần này.',
      'Sau 很 · 非常 · 太 phải là tính từ. Trước 的 + danh từ là định ngữ.',
      'Động từ li hợp (帮忙 · 见面 · 聊天) không mang tân ngữ trực tiếp.',
    ],
  },
  {
    id: '阅读第二部分',
    section: 'read',
    vi: 'Đọc · Sắp xếp câu',
    task: '排列顺序',
    count: 10,
    secPerQ: 60,
    what: 'Ba mảnh câu A · B · C — xếp lại thành một đoạn văn hợp lý.',
    steps: [
      'Tìm câu MỞ ĐẦU: có chủ ngữ đầy đủ (tên riêng, danh từ cụ thể), không dùng đại từ thay thế.',
      'Loại ngay khỏi vị trí đầu những câu bắt đầu bằng 但是 · 所以 · 因此 · 后来 · 这 · 那 · 他 · 她.',
      'Nối theo cặp dấu hiệu: 因为→所以, 虽然→但是, 先→然后, 一…就…',
      'Đại từ (他 · 这件事 · 那里) luôn TRỎ VỀ danh từ đã xuất hiện trước đó — dùng nó để xác định thứ tự.',
    ],
    traps: [
      'Đây là phần ngốn giờ nhất cả bài. Quá 90 giây một câu thì chọn rồi đi tiếp, đừng tiếc.',
      'Đọc trôi chảy không có nghĩa là đúng — phải kiểm tra lại chuỗi dấu hiệu logic.',
    ],
  },
  {
    id: '阅读第三部分',
    section: 'read',
    vi: 'Đọc · Đọc hiểu đoạn',
    task: '短文选答案',
    count: 20,
    secPerQ: 50,
    what: 'Đoạn văn ngắn kèm 1–2 câu hỏi. Chiếm 20/40 câu phần Đọc — nặng ký nhất.',
    steps: [
      'Đọc CÂU HỎI trước, rồi mới đọc đoạn. Biết mình đang tìm gì thì đọc nhanh gấp đôi.',
      'Câu hỏi chi tiết: quét tìm từ khoá trong đoạn, không đọc từ đầu.',
      'Câu hỏi 主要谈什么 · 告诉我们什么: đáp án gần như luôn ở câu đầu hoặc câu cuối đoạn.',
    ],
    traps: [
      'Đáp án đúng thường là DIỄN ĐẠT LẠI bằng từ khác, không chép nguyên văn.',
      'Phương án chép y nguyên một cụm trong bài nhưng lệch nghĩa là bẫy quen thuộc.',
    ],
  },
  {
    id: '书写第一部分',
    section: 'write',
    vi: 'Viết · Hoàn thành câu',
    task: '完成句子',
    count: 10,
    secPerQ: 90,
    what: 'Cho sẵn vài từ, viết thành một câu hoàn chỉnh. Phần đoán được sát nhất trong cả đề — 10 câu kiểm tra 10 điểm ngữ pháp khác nhau.',
    steps: [
      'Tìm ĐỘNG TỪ chính trước tiên.',
      'Tìm chủ ngữ — thường là đại từ hoặc danh từ chỉ người.',
      'Nhận diện kết cấu đặc biệt: 把 · 被 · 比 · 得 · 是…的. Chúng quyết định toàn bộ trật tự.',
      'Ráp theo khung: Chủ ngữ → Thời gian → Nơi chốn → Trạng ngữ → Động từ → Bổ ngữ → Tân ngữ.',
      'Viết xong đọc lại một lượt và ĐỪNG QUÊN DẤU CÂU.',
    ],
    traps: [
      'Quên 。 hoặc ？ cuối câu là mất điểm oan nhất trong cả bài thi.',
      'Câu 把: động từ không được đứng trơ, phải có thành phần theo sau (了 · 在… · 给… · 好).',
      'Dùng thiếu hoặc thừa từ đã cho đều bị tính sai — phải dùng HẾT, không thêm từ lạ.',
    ],
  },
  {
    id: '书写第二部分',
    section: 'write',
    vi: 'Viết · Nhìn tranh đặt câu',
    task: '看图写句子',
    count: 5,
    secPerQ: 180,
    what: 'Một bức tranh và một từ cho sẵn — viết một câu dùng từ đó, hợp với tranh.',
    steps: [
      'Xác định từ cho sẵn thuộc từ loại nào, rồi chọn khung câu tương ứng.',
      'Viết CÂU ĐƠN, 8–15 chữ là đủ. Đúng ngữ pháp quan trọng hơn dài.',
      'Câu phải liên quan tới tranh, không được viết một câu tuỳ ý.',
    ],
    traps: [
      'Viết dài để "ăn điểm" là hiểu sai cách chấm — chấm theo đúng/sai ngữ pháp, không theo độ dài.',
      'Bỏ trống chắc chắn 0 điểm. Một câu đơn giản luôn hơn không viết gì.',
      'Vẫn phải có dấu câu.',
    ],
  },
];

export const guideFor = (id: PartId): PartGuide => PART_GUIDES.find((g) => g.id === id)!;

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

/** Số câu chính thức của một phần, theo đúng cấu trúc đề thật. */
export const countOf = (id: PartId): number => PART_GUIDES.find((g) => g.id === id)!.count;

/** Trộn một bản sao — không đụng vào mảng gốc, vì kho đề là hằng số dùng chung. */
function shuffled<T>(a: readonly T[]): T[] {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Rút một đề 100 câu từ kho.
 *
 * Kho chứa nhiều hơn số câu của một đề — làm lại lần hai mà gặp đúng 100 câu cũ thì
 * lần đó chỉ đo được trí nhớ về đề, không đo được trình độ. Rút ngẫu nhiên giữ đúng
 * cấu trúc (`PART_GUIDES.count`) nhưng đổi nội dung mỗi lần ngồi.
 *
 * Phần nào trong kho vừa đủ hoặc thiếu thì giữ nguyên thứ tự gốc — không xáo một phần
 * đã đúng số, vì thứ tự trong đề thật cũng là thứ tự khó dần.
 */
export function drawPaper(bank: ExamPaper): ExamPaper {
  const take = <T,>(all: readonly T[], n: number): T[] =>
    all.length <= n ? all.slice() : shuffled(all).slice(0, n);
  // 阅读第一部分 tính theo NHÓM: mỗi nhóm một bảng sáu từ và năm chỗ trống.
  const perGroup = bank.read1[0]?.items.length || 5;
  return {
    ...bank,
    listen1: take(bank.listen1, countOf('听力第一部分')),
    listen2: take(bank.listen2, countOf('听力第二部分')),
    listen3: take(bank.listen3, countOf('听力第三部分')),
    read1: take(bank.read1, Math.ceil(countOf('阅读第一部分') / perGroup)),
    read2: take(bank.read2, countOf('阅读第二部分')),
    read3: take(bank.read3, countOf('阅读第三部分')),
    write1: take(bank.write1, countOf('书写第一部分')),
    write2: take(bank.write2, countOf('书写第二部分')),
  };
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

/** Just one part of the paper, for practising it on its own. */
export const partQuestions = (
  qs: { section: SectionId; q: ExamQ }[],
  id: PartId,
): { section: SectionId; q: ExamQ }[] => qs.filter((x) => x.q.part === id);

/** Best score recorded per part, keyed by part id. */
export type DrillBest = Partial<Record<PartId, { right: number; count: number; at: number }>>;

/**
 * The part to practise today, rotating so a whole week touches every one.
 *
 * Left to choose freely, people drill the part they are already best at. Rotation
 * puts the awkward ones in front of you without nagging.
 */
export const partOfDay = (daysLeft: number): PartId =>
  PART_GUIDES[Math.abs(daysLeft) % PART_GUIDES.length].id;

/** Section boundaries, so the clock can be reset when a new section starts. */
export function sectionRanges(qs: { section: SectionId }[]): Record<SectionId, [number, number]> {
  const out = {} as Record<SectionId, [number, number]>;
  qs.forEach(({ section }, i) => {
    if (!out[section]) out[section] = [i, i];
    else out[section][1] = i;
  });
  return out;
}
