import type { Grammar, Vocab } from './types';

/**
 * Content added after the original handoff bundle, from the 通过 / 经过 lesson.
 * Kept out of `deck.json` so the designer's bundle stays exactly as delivered.
 *
 * The topic is deliberately one that also has vocab — grammar tagged with a
 * vocab-less topic can never be selected (see the `Bài 3` gap in the README).
 */
export const EXTRA_TOPIC = 'Bài 12 · 通过 & 经过';

export const EXTRA_VOCAB: Vocab[] = [
  {
    h: '难道',
    p: 'nándào',
    pos: 'Phó từ',
    m: 'lẽ nào, chẳng lẽ',
    t: EXTRA_TOPIC,
    ex: '都早上八点了，老师还没来，难道他忘了今天有课？',
    exVi: 'Hơn 8h sáng rồi mà thầy vẫn chưa đến, lẽ nào thầy quên là hôm nay có lớp?',
  },
  {
    h: '通过',
    p: 'tōngguò',
    pos: 'Động từ/Giới từ',
    m: 'thông qua, vượt qua; bằng, nhờ vào',
    t: EXTRA_TOPIC,
    ex: '通过努力，她取得了好成绩。',
    exVi: 'Bằng sự nỗ lực, cô ấy đã đạt được thành tích tốt.',
  },
  {
    h: '之',
    p: 'zhī',
    pos: 'Trợ từ',
    m: 'của (dùng trong văn viết)',
    t: EXTRA_TOPIC,
    ex: '失败是成功之母。',
    exVi: 'Thất bại là mẹ thành công.',
  },
  {
    h: '失败是成功之母',
    p: 'shībài shì chénggōng zhī mǔ',
    pos: 'Thành ngữ',
    m: 'thất bại là mẹ thành công',
    t: EXTRA_TOPIC,
    ex: '别难过，失败是成功之母。',
    exVi: 'Đừng buồn, thất bại là mẹ thành công.',
  },
  {
    h: '努力',
    p: 'nǔlì',
    pos: 'Động từ/Danh từ',
    m: 'nỗ lực, cố gắng',
    t: EXTRA_TOPIC,
    ex: '任何成功都要通过努力才能得到。',
    exVi: 'Thành công nào cũng cần sự nỗ lực để đạt được.',
  },
  {
    h: '面试',
    p: 'miànshì',
    pos: 'Danh từ/Động từ',
    m: 'phỏng vấn',
    t: EXTRA_TOPIC,
    ex: '经过2个小时的面试，我通过面试了。',
    exVi: 'Trải qua hai tiếng phỏng vấn, tôi đã vượt qua vòng phỏng vấn.',
  },
  {
    h: '取得',
    p: 'qǔdé',
    pos: 'Động từ',
    m: 'đạt được, giành được',
    t: EXTRA_TOPIC,
    ex: '通过努力，她取得了好成绩。',
    exVi: 'Bằng sự nỗ lực, cô ấy đã đạt được thành tích tốt.',
  },
  {
    h: '同意',
    p: 'tóngyì',
    pos: 'Động từ',
    m: 'đồng ý, tán thành',
    t: EXTRA_TOPIC,
    ex: '经过讨论，大家都同意李梅当队长。',
    exVi: 'Thông qua thảo luận, mọi người đều đồng ý Lý Mai làm đội trưởng.',
  },
  {
    h: '优秀',
    p: 'yōuxiù',
    pos: 'Tính từ',
    m: 'xuất sắc, ưu tú',
    t: EXTRA_TOPIC,
    ex: '通过招聘，公司找到了几个优秀人才。',
    exVi: 'Thông qua tuyển dụng, công ty đã tìm được một vài nhân tài xuất sắc.',
  },
  {
    h: '人才',
    p: 'réncái',
    pos: 'Danh từ',
    m: 'nhân tài',
    t: EXTRA_TOPIC,
    ex: '公司找到了几个优秀人才。',
    exVi: 'Công ty đã tìm được một vài nhân tài xuất sắc.',
  },
];

/**
 * Cloze questions. Distractors are picked so exactly one option can be right —
 * 经过 and 通过 are never offered against each other here, because in many
 * sentences both are acceptable. That contrast lives in `CONFUSABLES` instead,
 * restricted to cases where one really is wrong.
 */
export const EXTRA_GRAMMAR: Grammar[] = [
  {
    id: 'g:x1',
    a: '难道',
    opts: ['难道', '通过', '之', '各'],
    sent: '都早上八点了，老师还没来，____他忘了今天有课？',
    full: '都早上八点了，老师还没来，难道他忘了今天有课？',
    pin: 'Dōu zǎoshang bā diǎn le, lǎoshī hái méi lái, nándào tā wàng le jīntiān yǒu kè?',
    vi: 'Hơn 8h sáng rồi mà thầy vẫn chưa đến, lẽ nào thầy quên là hôm nay có lớp?',
    name: 'Phó từ 难道 — "lẽ nào…?"',
    expl: 'Hỏi tu từ, tỏ ý ngạc nhiên hoặc hoài nghi. Cuối câu thường có 吗 hoặc 呢.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'g:x2',
    a: '通过',
    opts: ['通过', '难道', '之', '力气'],
    sent: '任何成功都要____努力才能得到。',
    full: '任何成功都要通过努力才能得到。',
    pin: 'Rènhé chénggōng dōu yào tōngguò nǔlì cái néng dédào.',
    vi: 'Thành công nào cũng cần sự nỗ lực để đạt được.',
    name: 'Giới từ 通过 — "bằng, nhờ vào"',
    expl: 'Nhấn mạnh phương tiện/cách thức để đạt được kết quả.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'g:x3',
    a: '之',
    opts: ['之', '难道', '通过', '的'],
    sent: '这件事要在三天____内完成。',
    full: '这件事要在三天之内完成。',
    pin: 'Zhè jiàn shì yào zài sān tiān zhī nèi wánchéng.',
    vi: 'Việc này phải hoàn thành nội trong ba ngày.',
    name: 'Trợ từ 之 — 之内 / 之前 / 之后',
    expl: '之内 = trong vòng; 一个月之前 = 1 tháng trước. 之 là cách nói văn viết của 的.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'g:x4',
    a: '之',
    opts: ['之', '的', '通过', '难道'],
    sent: '牡丹被称为花中____王。',
    full: '牡丹被称为花中之王。',
    pin: 'Mǔdān bèi chēngwéi huā zhōng zhī wáng.',
    vi: 'Hoa mẫu đơn được gọi là chúa tể các loài hoa.',
    name: 'Trợ từ 之 — 花中之王',
    expl: 'Kết cấu "A 中之 B" mang màu sắc văn viết, trang trọng.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'g:x5',
    a: '之',
    opts: ['之', '的', '难道', '各'],
    sent: '失败是成功____母。',
    full: '失败是成功之母。',
    pin: 'Shībài shì chénggōng zhī mǔ.',
    vi: 'Thất bại là mẹ thành công.',
    name: 'Thành ngữ 失败是成功之母',
    expl: 'Câu thành ngữ quen thuộc — dùng 之 chứ không dùng 的.',
    t: EXTRA_TOPIC,
  },
];

/** A sentence where one of two near-synonyms is genuinely wrong. */
export interface Confusable {
  id: string;
  /** The two options offered, in display order. */
  pair: [string, string];
  /** Sentence with `____` where the word goes. */
  sent: string;
  /** The correct option — always one of `pair`. */
  a: string;
  full: string;
  pin: string;
  vi: string;
  /** Why the other one does not work. Shown after answering. */
  why: string;
  t: string;
}

/**
 * 经过 vs 通过 — every item here is a case the lesson marks as one-way. Sentences
 * where both words are acceptable (经过讨论 / 通过讨论, 经过努力 / 通过努力) are
 * deliberately left out: drilling those would teach a distinction that isn't real.
 */
export const CONFUSABLES: Confusable[] = [
  {
    id: 'c:1',
    pair: ['经过', '通过'],
    sent: '事情的____是这样的。',
    a: '经过',
    full: '事情的经过是这样的。',
    pin: 'Shìqing de jīngguò shì zhèyàng de.',
    vi: 'Quá trình của vụ việc là như thế này.',
    why: '经过 làm DANH TỪ = quá trình diễn ra của sự việc. 通过 hoàn toàn không có nghĩa này → 事情的通过 ✗',
    t: EXTRA_TOPIC,
  },
  {
    id: 'c:2',
    pair: ['经过', '通过'],
    sent: '生孩子的____我一辈子也忘不了。',
    a: '经过',
    full: '生孩子的经过我一辈子也忘不了。',
    pin: 'Shēng háizi de jīngguò wǒ yíbèizi yě wàng bù liǎo.',
    vi: 'Quá trình sinh con cả đời tôi không thể quên được.',
    why: 'Lại là 经过 danh từ — "quá trình". Sau 的 chỉ có thể là 经过.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'c:3',
    pair: ['经过', '通过'],
    sent: '我是____他才认识你的。',
    a: '通过',
    full: '我是通过他才认识你的。',
    pin: 'Wǒ shì tōngguò tā cái rènshi nǐ de.',
    vi: 'Tôi biết bạn thông qua anh ấy.',
    why: '通过 + người = nhờ vào/qua trung gian ai đó. 经过 không dùng để chỉ phương tiện → 我是经过他… ✗',
    t: EXTRA_TOPIC,
  },
  {
    id: 'c:4',
    pair: ['经过', '通过'],
    sent: '这个国家今年2月____了性别平等法。',
    a: '通过',
    full: '这个国家今年2月通过了性别平等法。',
    pin: 'Zhè ge guójiā jīnnián èr yuè tōngguò le xìngbié píngděng fǎ.',
    vi: 'Đất nước này tháng 2 năm nay đã thông qua luật bình đẳng giới.',
    why: '通过 = thông qua / phê duyệt một dự luật. 经过 không dùng trong trường hợp này.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'c:5',
    pair: ['经过', '通过'],
    sent: '你今年能____HSK4级的考试吗？',
    a: '通过',
    full: '你今年能通过HSK4级的考试吗？',
    pin: 'Nǐ jīnnián néng tōngguò HSK sì jí de kǎoshì ma?',
    vi: 'Năm nay bạn có thi qua được HSK4 không?',
    why: '通过 = vượt qua / đạt yêu cầu một kỳ thi. 经过 không dùng ở đây.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'c:6',
    pair: ['经过', '通过'],
    sent: '我每天上班要____这家咖啡店。',
    a: '经过',
    full: '我每天上班要经过这家咖啡店。',
    pin: 'Wǒ měitiān shàngbān yào jīngguò zhè jiā kāfēi diàn.',
    vi: 'Ngày nào đi làm tôi cũng đi qua quán cafe này.',
    why: '经过 + nơi chốn = đi ngang qua. Đây là nghĩa di chuyển, không phải "phương tiện" → không dùng 通过.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'c:7',
    pair: ['经过', '通过'],
    sent: '从北京坐火车到广州要____武汉。',
    a: '经过',
    full: '从北京坐火车到广州要经过武汉。',
    pin: 'Cóng Běijīng zuò huǒchē dào Guǎngzhōu yào jīngguò Wǔhàn.',
    vi: 'Từ Bắc Kinh ngồi xe lửa đi Quảng Châu thì phải qua Vũ Hán.',
    why: 'Tuyến đường đi ngang một địa điểm → 经过 + nơi chốn. Cấu trúc khác: 从 + nơi chốn + 经过.',
    t: EXTRA_TOPIC,
  },
  {
    id: 'c:8',
    pair: ['经过', '通过'],
    sent: '____2个小时的面试，我通过面试了。',
    a: '经过',
    full: '经过2个小时的面试，我通过面试了。',
    pin: 'Jīngguò liǎng ge xiǎoshí de miànshì, wǒ tōngguò miànshì le.',
    vi: 'Trải qua hai tiếng phỏng vấn, tôi đã vượt qua vòng phỏng vấn.',
    why: 'Cả hai trong một câu! 经过 + thời gian = trải qua; 通过面试 = vượt qua vòng phỏng vấn.',
    t: EXTRA_TOPIC,
  },
];

/** Mnemonics for the new words, in the same voice as the bundled ones. */
export const EXTRA_STORIES: Record<string, string> = {
  难道: 'Hán Việt: «nan đạo» — "chẳng lẽ nào lại khó thế?" → lẽ nào, chẳng lẽ.',
  通过: 'Hán Việt: «thông qua» — nghe là nhớ liền: thông qua luật, thi qua, nhờ ai đó.',
  经过: 'Hán Việt: «kinh qua» — trải qua một quá trình, hoặc đi ngang qua một nơi.',
  之: '«Chi» — chữ 的 mặc áo dài văn viết: 成功之母, 花中之王.',
  失败是成功之母: 'Thất bại (失败) LÀ (是) mẹ (母) của thành công (成功之) — vấp rồi mới biết đi.',
  努力: 'Hán Việt: «nỗ lực».',
  面试: '«Diện thí» — thi (试) mặt đối mặt (面) → phỏng vấn.',
  取得: '«Thủ đắc» — lấy (取) được (得) → đạt được.',
  同意: '«Đồng ý» — y hệt tiếng Việt.',
  优秀: 'Hán Việt: «ưu tú».',
  人才: '«Nhân tài» — y hệt tiếng Việt.',
};
