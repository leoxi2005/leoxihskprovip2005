/**
 * Ôn từ vựng và ngữ pháp CỦA CHÍNH ĐỀ SẮP LÀM, ngay trước khi làm.
 *
 * Luyện từng phần vốn chạy thẳng từ trang hướng dẫn vào câu hỏi. Hướng dẫn dạy *cách
 * làm* — đọc câu ★ trước, săn từ khoá, đừng dịch cả đoạn — nhưng cách làm chỉ ăn tiền
 * khi đã đọc được chữ. Ai dừng ở 50–60% một phần thường không hỏng ở kỹ thuật: họ mở
 * câu ra, gặp bốn từ chưa gặp bao giờ, và từ đó trở đi thì mọi mẹo đều vô nghĩa.
 *
 * Chỗ này vá đúng khoảng trống ấy. Nó KHÔNG bày một danh sách từ HSK 4 chung chung —
 * cái đó deck đã có, và học rời rồi vào đề vẫn không nhận ra chữ. Nó cắt đúng những
 * câu vừa được rút cho buổi luyện này, nhặt ra từ đáng dừng lại và điểm ngữ pháp thật
 * sự có mặt trong đó. Ôn xong là gặp lại ngay, trong đúng câu vừa nhìn thấy từ ấy.
 *
 * Ba nguồn ghép lại:
 *  1. **Từ vựng** — cắt câu bằng chính deck (xem `segment.ts`), bỏ từ vỡ lòng HSK 1–2,
 *     xếp từ mang đáp án lên đầu.
 *  2. **Điểm ngữ pháp trong đề** — mục nào của deck có từ khoá xuất hiện trong đề.
 *  3. **Khung ngữ pháp của phần** — thứ viết tay, vì không suy ra từ dữ liệu được:
 *     trật tự 完成句子, dấu hiệu nối câu của 排列顺序… Xem `PART_NOTES`.
 */

import { DECK, LEVEL_OF, type Grammar, type Vocab } from '../data';
import type { ExamQ, PartId } from './exam';
import { PART_NOTES, type PartNote } from './partnotes';
import { hanOnly, segment } from './segment';

/** Bao nhiêu từ một bảng ôn bày ra trước khi thành một buổi học từ vựng riêng. */
export const MAX_WORDS = 16;

/** Bao nhiêu mục ngữ pháp rút từ deck — quá số này thì không ai đọc hết. */
export const MAX_POINTS = 6;

// -- text of a question -----------------------------------------------------

export interface QText {
  /** Mọi chữ Hán câu hỏi bày ra hoặc đọc lên. */
  all: string[];
  /**
   * Phần chữ mang đáp án: đáp án đúng, từ điền vào chỗ trống, câu mẫu.
   *
   * Tách riêng vì đây là chỗ đáng ôn nhất. Trượt một câu 选词填空 hầu như luôn là
   * không biết đúng cái từ phải điền, chứ không phải không hiểu bốn từ còn lại.
   */
  key: string[];
}

/**
 * Chữ của một câu hỏi, tách làm hai loại.
 *
 * Lấy cả phần *chưa* hiện ra lúc làm bài — lời thoại của câu nghe, đoạn văn của câu
 * đọc. Đó là chủ ý: ôn trước thì được biết trước, và biết trước từ trong băng chính
 * là điều kiện để nghe ra nó. Bảng ôn không in câu hỏi, chỉ in từ.
 */
export function textOf(q: ExamQ): QText {
  switch (q.kind) {
    case 'tf':
      // Câu ★ mang đáp án, nhưng nó là CẢ CÂU: coi nó là "từ đáp án" thì gần như từ
      // nào cũng được gắn sao, mà một cái sao gắn cho tất cả thì không chỉ ra gì cả.
      return { all: [q.item.say, q.item.stmt], key: [] };
    case 'qa':
      return {
        all: [...(q.item.say ?? []), q.item.text ?? '', q.item.q, ...q.item.opts],
        key: [q.item.opts[q.item.ans]],
      };
    case 'fill': {
      /*
       * CẢ SÁU từ trong bảng đều là "từ đáp án", không chỉ từ đúng.
       *
       * Sáu từ ấy hiện nguyên trên đề, và việc phần này hỏi chính là chọn giữa chúng —
       * không hiểu năm từ kia thì loại trừ không chạy. Bản đầu chỉ đánh dấu từ đúng,
       * nên năm từ còn lại phải tranh chỗ với từ trong câu theo cấp độ, và có lần bị
       * đẩy khỏi bảng ôn — ôn xong vẫn gặp một lựa chọn chưa từng thấy.
       */
      const item = q.group.items[q.at];
      return { all: [item.sent, ...q.group.bank], key: q.group.bank.slice() };
    }
    case 'order':
      return { all: q.item.parts.slice(), key: [] };
    case 'sent':
      // Câu mẫu chứa đúng những mảnh đã cho, nên `key` sẽ trùng `all` — vô nghĩa.
      // 完成句子 không hỏi một từ nào cả, nó hỏi trật tự.
      return { all: [...q.item.words, q.item.accept[0]], key: [] };
    case 'pic':
      return { all: [q.item.word, q.item.sample], key: [q.item.word] };
  }
}

// -- vocabulary -------------------------------------------------------------

/** Hanzi → mục từ điển của deck. Dựng một lần, dùng cho mọi bảng ôn. */
const BY_HAN: ReadonlyMap<string, Vocab> = new Map(DECK.vocab.map((v) => [v.h, v]));

/** Từ điển để cắt câu — đúng bộ mà `segment.ts` chờ đợi. */
const DICT: ReadonlySet<string> = new Set(DECK.vocab.map((v) => v.h));

/**
 * Cấp của một từ; từ ngoài đại cương 1–4 coi như cấp 4.
 *
 * Deck giáo trình mang cả những từ không có trong danh sách chính thức. Coi chúng là
 * dễ thì bảng ôn bỏ qua đúng những từ lạ nhất; coi là cấp 4 thì cùng lắm ôn thừa.
 */
export const levelOf = (h: string): 1 | 2 | 3 | 4 => LEVEL_OF.get(h) ?? 4;

export interface PrepWord {
  v: Vocab;
  level: 1 | 2 | 3 | 4;
  /** Từ này là (một phần của) đáp án ở ít nhất một câu. */
  isKey: boolean;
  /** Số câu trong buổi luyện có chứa từ này. */
  hits: number;
}

/**
 * Những từ đáng dừng lại, lấy từ đúng các câu sắp làm.
 *
 * Bỏ HSK 1–2 hẳn: người ngồi HSK 4 không cần ôn 我 và 好, và để chúng vào thì mười
 * sáu ô của bảng ôn bị chúng chiếm sạch — từ dễ bao giờ cũng nhiều hơn từ khó.
 *
 * Thứ tự: từ mang đáp án trước, rồi cấp cao trước, rồi từ xuất hiện nhiều lần trước.
 * `pinned` (những từ đã tự đánh dấu "chưa thuộc" ở buổi trước) chen lên trên hết —
 * gặp lại một từ mình từng bỏ qua là cả lý do để có cái danh sách đó.
 */
export function prepWords(
  qs: { q: ExamQ }[],
  opts: { pinned?: ReadonlySet<string>; max?: number } = {},
): PrepWord[] {
  const pinned = opts.pinned ?? new Set<string>();
  const found = new Map<string, PrepWord>();

  for (const { q } of qs) {
    const { all, key } = textOf(q);
    const keyHan = new Set(key.flatMap((s) => segment(s, DICT)));
    // Một câu đếm một lần cho mỗi từ: câu 排列顺序 nhắc lại 他 bốn lần không làm 他
    // thành từ quan trọng hơn.
    const seen = new Set<string>();
    for (const line of all) {
      for (const w of segment(line, DICT)) {
        if (seen.has(w)) continue;
        seen.add(w);
        const v = BY_HAN.get(w);
        if (!v) continue;
        const level = levelOf(w);
        if (level <= 2 && !pinned.has(w)) continue;
        const prev = found.get(w);
        if (prev) {
          prev.hits++;
          prev.isKey ||= keyHan.has(w);
        } else {
          found.set(w, { v, level, isKey: keyHan.has(w), hits: 1 });
        }
      }
    }
  }

  const rank = (w: PrepWord): number =>
    (pinned.has(w.v.h) ? 1000 : 0) + (w.isKey ? 100 : 0) + w.level * 10 + Math.min(w.hits, 9);

  return [...found.values()]
    .sort((a, b) => rank(b) - rank(a) || a.v.h.localeCompare(b.v.h))
    .slice(0, opts.max ?? MAX_WORDS);
}

// -- grammar found in the paper ---------------------------------------------

/**
 * Từ khoá quá ngắn và quá thường để dùng làm dấu hiệu nhận điểm ngữ pháp.
 *
 * 的 có trong gần như mọi câu, nên "mục ngữ pháp về 的" sẽ luôn khớp và luôn đứng đầu
 * — tức bảng ngữ pháp lúc nào cũng y hệt nhau bất kể đề rút ra là gì. Một dấu hiệu
 * đúng với mọi đề thì không chỉ ra được gì cả.
 */
const TOO_COMMON = new Set(['的', '了', '在', '是', '有', '和', '也', '就', '很', '不', '都']);

/**
 * Từ khoá một chữ bị loại hẳn, kể cả 把 · 被 · 比 · 得.
 *
 * Thử cho chúng vào rồi: 比 và 把 khớp ở sáu trên tám phần — có lúc là câu so sánh
 * thật, có lúc chỉ là một chữ 比 đi ngang qua — và chúng chiếm mất chỗ của những mục
 * thật sự chỉ ra điều gì đó (即使 · 随着 · 按照). Khớp đúng mà vô dụng vẫn là vô dụng.
 *
 * Mấy kiểu câu ấy không mất đi đâu cả: chúng nằm ở `PART_NOTES`, nơi chúng được viết
 * cho đúng phần cần chúng — 把 và 被 là ngữ pháp của 完成句子, không phải của phần nghe.
 * Chỗ này lo phần TỪ NGỮ pháp; khung câu là việc của bảng viết tay.
 */

/**
 * Mục của kho ngữ pháp thật ra chỉ dạy nghĩa một từ.
 *
 * Kho `grammar` của deck có lẫn mấy mục đặt tên "Từ vựng: …". Ở bảng ôn thì chúng
 * vừa lạc chỗ vừa thừa — từ ấy đã nằm sẵn ở bước ① rồi.
 */
const isVocabEntry = (name: string): boolean => /^Từ vựng/i.test(name);

/**
 * Mục ngữ pháp của deck mà từ khoá của nó thật sự có mặt trong đề vừa rút.
 *
 * Khớp thô bằng chuỗi con, và như thế là đủ: từ khoá ở đây là những thứ như 即使 ·
 * 随着 · 是否 — nhiều chữ, hầu như không nằm lọt trong từ khác.
 */
export function prepGrammar(qs: { q: ExamQ }[], max = MAX_POINTS): Grammar[] {
  const text = qs.map(({ q }) => textOf(q).all.join('')).join('');
  const han = hanOnly(text);
  const out: Grammar[] = [];
  const seen = new Set<string>();
  for (const g of DECK.grammar) {
    if (out.length >= max) break;
    if (g.a.length < 2 || TOO_COMMON.has(g.a)) continue;
    if (isVocabEntry(g.name)) continue;
    if (!han.includes(g.a)) continue;
    // Deck có mấy mục cùng dạy một điểm bằng hai câu khác nhau, và tên chúng chỉ khác
    // nhau ở phần ghi pinyin — nên chặn theo TỪ KHOÁ mới bắt được, tên thì không.
    if (seen.has(g.a)) continue;
    seen.add(g.a);
    out.push(g);
  }
  return out;
}

// -- the structural rules of each part --------------------------------------

/*
 * Bảng viết tay ở `partnotes.ts` — xem doc đầu file đó để biết vì sao nó ở riêng.
 * Re-export để chỗ gọi không phải biết nó nằm ở file nào.
 */
export { PART_NOTES, type PartNote };

// -- the pack ---------------------------------------------------------------

export interface PrepPack {
  words: PrepWord[];
  points: Grammar[];
  notes: PartNote[];
}

/** Cả bảng ôn cho một buổi luyện một phần. */
export function buildPrep(
  part: PartId,
  qs: { q: ExamQ }[],
  pinned?: ReadonlySet<string>,
): PrepPack {
  return {
    words: prepWords(qs, { pinned }),
    points: prepGrammar(qs),
    notes: PART_NOTES[part] ?? [],
  };
}

// -- the quick check --------------------------------------------------------

/**
 * Kiểu câu hỏi của bộ kiểm tra nhanh.
 *
 * Năm kiểu vì một từ "biết" theo năm nghĩa khác nhau, và bốn trong năm cái đó không
 * cứu được bài nghe. Nhận ra nghĩa khi nhìn chữ là mức dễ nhất; nghe một chuỗi âm
 * trôi qua rồi biết đó là từ nào mới là thứ 听力第三部分 thật sự đòi. Nên bảng ôn hỏi
 * cả năm chiều thay vì hỏi sáu lần cùng một chiều.
 */
export type CheckKind = 'mean' | 'listen' | 'recall' | 'usage' | 'grammar';

export interface CheckQ {
  kind: CheckKind;
  /** Từ đang hỏi — câu ngữ pháp không có. */
  v?: Vocab;
  /** Khoá để đánh dấu "chưa thuộc"; rỗng nghĩa là không đánh dấu gì. */
  h: string;
  /** Đề bài hiện ra. Câu nghe để rỗng: hiện chữ ra là hỏng câu hỏi. */
  prompt: string;
  /** Dòng phụ dưới đề — pinyin, hoặc từ loại. */
  sub?: string;
  /** Chữ Hán đọc lên: từ ở câu nghe, cả câu ở câu ngữ pháp. */
  say?: string;
  /** Đề là MỘT TỪ (chữ to) hay một câu (chữ vừa, xuống dòng được). */
  big?: boolean;
  /** Lựa chọn là chữ Hán — cần font Hán và cỡ chữ khác. */
  hanOpts?: boolean;
  opts: string[];
  ans: number;
  /** Hiện ra sau khi trả lời: nghĩa đầy đủ, câu ví dụ, giải thích ngữ pháp. */
  note?: string;
}

/** Một vòng kiểm tra: một kiểu câu hỏi, chạy hết từ của bảng ôn. */
export interface CheckRound {
  id: CheckKind;
  /** Nhãn ngắn trên chip chọn vòng. */
  label: string;
  /** Một câu nói rõ vòng này kiểm tra cái gì. */
  hint: string;
  qs: CheckQ[];
}

/** Bao nhiêu câu ngữ pháp — quá số này thì vòng cuối dài hơn cả bài luyện. */
export const MAX_GRAMMAR_QS = 12;

const shuffled = <T,>(a: readonly T[], pick: () => number): T[] => {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(pick() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Ba mồi nhử, ưu tiên nhóm `near` rồi mới tới phần còn lại.
 *
 * `near` là chỗ quyết định câu hỏi có đáng làm không. Mồi nhử khác từ loại (hoặc ở
 * câu nghe: khác số chữ) loại được bằng ngữ pháp mà không cần biết từ — câu hỏi tự
 * trả lời hộ, làm đúng hết mà vào đề vẫn không nhận ra chữ nào.
 */
function distractors(
  ans: string,
  pool: readonly Vocab[],
  of: (x: Vocab) => string,
  near: (x: Vocab) => boolean,
  pick: () => number,
  n = 3,
): string[] {
  const usable = (x: Vocab) => of(x).length > 0 && of(x) !== ans;
  const first = shuffled(pool.filter((x) => usable(x) && near(x)), pick);
  const rest = shuffled(pool.filter((x) => usable(x) && !near(x)), pick);
  const out: string[] = [];
  for (const x of [...first, ...rest]) {
    if (out.length >= n) break;
    if (!out.includes(of(x))) out.push(of(x));
  }
  return out;
}

/** Ghép đáp án với mồi nhử rồi trộn — chỗ duy nhất `ans` được tính ra. */
const asQ = (q: Omit<CheckQ, 'opts' | 'ans'>, right: string, bad: string[], pick: () => number) => {
  const opts = shuffled([right, ...bad], pick);
  return { ...q, opts, ans: opts.indexOf(right) };
};

/** Pinyin bỏ dấu thanh — để so âm mà không so thanh điệu. */
const bare = (p: string): string =>
  p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-zü]/g, '');

/**
 * Hai từ nghe DỄ LẪN: cùng số chữ, và âm giống nhau ở đầu hoặc có chung một khúc.
 *
 * Không có cái này thì vòng nghe hoá ra vòng đoán độ dài: bốn lựa chọn một từ hai
 * chữ và ba từ một chữ thì nghe thấy hai nhịp là xong, chẳng cần nghe ra âm nào.
 */
export function soundsClose(a: Vocab, b: Vocab): boolean {
  if (a.h.length !== b.h.length) return false;
  const x = bare(a.p);
  const y = bare(b.p);
  if (x[0] === y[0]) return true;
  for (let i = 0; i + 3 <= x.length; i++) if (y.includes(x.slice(i, i + 3))) return true;
  return false;
}

/** ① Nhìn chữ → nhớ nghĩa. Chiều dễ nhất, nên nó đi trước để không nản. */
export function meaningQs(words: PrepWord[], pool: readonly Vocab[], pick: () => number): CheckQ[] {
  return words.map(({ v }) =>
    asQ(
      { kind: 'mean', v, h: v.h, prompt: v.h, sub: v.p, say: v.h, big: true, note: `${v.pos} · ${v.m}` },
      v.m,
      distractors(v.m, pool, (x) => x.m, (x) => x.pos === v.pos, pick),
      pick,
    ),
  );
}

/**
 * ② Nghe âm → chỉ ra chữ. Vòng quan trọng nhất trước một bài nghe.
 *
 * Nhìn 银行 mà nhớ ra "ngân hàng" không chứng minh được gì về việc nghe: chữ Hán
 * cho sẵn cả nghĩa lẫn hình. Trong băng thì chỉ có yínháng trôi qua một lần rưỡi
 * giây. Đây là vòng duy nhất kiểm tra đúng việc đó.
 */
export function listenQs(words: PrepWord[], pool: readonly Vocab[], pick: () => number): CheckQ[] {
  return words.map(({ v }) =>
    asQ(
      { kind: 'listen', v, h: v.h, prompt: '', say: v.h, hanOpts: true, note: `${v.p} · ${v.m}` },
      v.h,
      distractors(v.h, pool, (x) => x.h, (x) => soundsClose(v, x), pick),
      pick,
    ),
  );
}

/** ③ Nhớ nghĩa → nhớ mặt chữ. Chiều ngược, vì phần đọc bắt nhận ra chữ chứ không dịch. */
export function recallQs(words: PrepWord[], pool: readonly Vocab[], pick: () => number): CheckQ[] {
  return words.map(({ v }) =>
    asQ(
      { kind: 'recall', v, h: v.h, prompt: v.m, sub: v.pos, hanOpts: true, note: `${v.h} · ${v.p}` },
      v.h,
      distractors(
        v.h,
        pool,
        (x) => x.h,
        (x) => x.pos === v.pos && x.h.length === v.h.length,
        pick,
      ),
      pick,
    ),
  );
}

/**
 * Câu ví dụ của một từ, đã khoét chỗ của chính từ ấy.
 *
 * Lấy từ VÍ DỤ CỦA DECK, không lấy câu trong đề. Bảng ôn cố tình không in câu hỏi:
 * đọc trước nguyên câu văn của bài nghe thì buổi luyện chỉ còn là kiểm tra trí nhớ
 * ngắn hạn, mà cái đang cần luyện là nghe.
 */
const clozeOf = (v: Vocab): { sent: string; vi?: string } | null => {
  // Đúng MỘT lần: ví dụ của 行 là 这样行不行？, khoét chỗ đầu thì chữ 行 vẫn còn nằm
  // ngay đó — câu hỏi in sẵn đáp án. Khoét cả hai chỗ thì câu văn không còn là câu.
  if (!v.ex || v.ex.split(v.h).length !== 2) return null;
  return { sent: v.ex.replace(v.h, '＿＿'), vi: v.exVi };
};

/** ④ Điền từ vào câu — biết nghĩa là một chuyện, biết chỗ nó đứng là chuyện khác. */
export function usageQs(words: PrepWord[], pool: readonly Vocab[], pick: () => number): CheckQ[] {
  const out: CheckQ[] = [];
  for (const { v } of words) {
    const c = clozeOf(v);
    if (!c) continue;
    out.push(
      asQ(
        {
          kind: 'usage',
          v,
          h: v.h,
          prompt: c.sent,
          // Nghĩa tiếng Việt của CẢ CÂU chỉ hiện sau khi trả lời. In sẵn dưới chỗ
          // trống thì nó dịch luôn từ đang phải điền: "Cuốn sách này rất ĐÁNG đọc"
          // nằm ngay trên bốn lựa chọn có 值得.
          say: v.ex,
          hanOpts: true,
          note: `${v.ex}${c.vi ? ` — ${c.vi}` : ''}`,
        },
        v.h,
        // Cùng từ loại VÀ cùng số chữ: một chỗ trống hai ô mà ba lựa chọn một chữ thì
        // nhìn độ dài là ra, chẳng cần đọc câu — đúng thứ vòng này muốn bắt phải đọc.
        distractors(
          v.h,
          pool,
          (x) => x.h,
          (x) => x.pos === v.pos && x.h.length === v.h.length,
          pick,
        ),
        pick,
      ),
    );
  }
  return out;
}

/**
 * ⑤ Ngữ pháp: khung câu của phần này, và những mục có mặt trong chính đề sắp làm.
 *
 * Hai nguồn hỏi theo hai kiểu, vì chúng là hai loại kiến thức khác nhau. Mục của
 * deck có sẵn câu khoét lỗ với bốn lựa chọn — hỏi thẳng "điền từ nào". Khung viết
 * tay của từng phần thì không có chỗ trống nào để khoét: nó là một LUẬT, nên hỏi
 * bằng ví dụ — nghe/đọc câu này thì hiểu ra ý gì.
 */
export function grammarQs(
  points: readonly Grammar[],
  notes: readonly PartNote[],
  pick: () => number,
  max = MAX_GRAMMAR_QS,
): CheckQ[] {
  const egs = notes.flatMap((n) => n.eg.map((e, i) => ({ n, e, i })));
  const pool = egs.map((x) => x.e.vi);
  const fromNote = ({ n, e }: { n: PartNote; e: { cn: string; vi: string } }): CheckQ | null => {
    const bad: string[] = [];
    for (const vi of shuffled(pool, pick)) {
      if (bad.length >= 3) break;
      if (vi !== e.vi && !bad.includes(vi)) bad.push(vi);
    }
    if (bad.length < 3) return null;
    return asQ(
      {
        kind: 'grammar',
        h: '',
        prompt: e.cn,
        say: e.cn,
        note: `${n.name}${n.formula ? ` — ${n.formula}` : ''}`,
      },
      e.vi,
      bad,
      pick,
    );
  };

  const fromPoint = (g: Grammar): CheckQ | null => {
    if (!g.sent.includes('____') || g.opts.length < 4 || !g.opts.includes(g.a)) return null;
    const opts = shuffled(g.opts, pick);
    return {
      kind: 'grammar',
      h: '',
      prompt: g.sent.replace('____', '＿＿'),
      // Cũng như vòng ④: bản dịch của cả câu chỉ hiện sau khi trả lời, vì "cùng với
      // sự phát triển…" là đọc hộ luôn chữ 随着 đang phải chọn.
      say: g.full,
      hanOpts: true,
      opts,
      ans: opts.indexOf(g.a),
      note: `${g.name} — ${g.full} — ${g.vi}${g.expl ? ` (${g.expl})` : ''}`,
    };
  };

  /*
   * Thứ tự này là chỗ dễ hỏng nhất của cả vòng.
   *
   * Xếp hết ví dụ của các khung rồi mới tới mục của deck thì cái cắt ở `max` ăn sạch
   * phần deck — vòng ngữ pháp hoá ra chỉ hỏi khung viết tay, còn "điểm ngữ pháp có
   * trong chính đề này" (thứ bước ② vừa hứa) không được hỏi câu nào. Nên: mỗi khung
   * một ví dụ trước, rồi tới mục của deck, ví dụ thứ hai của khung mới nhặt sau cùng.
   */
  const first = egs.filter((x) => x.i === 0).map(fromNote);
  const rest = egs.filter((x) => x.i > 0).map(fromNote);
  const deck = points.map(fromPoint);

  return [...first, ...deck, ...rest].filter((q): q is CheckQ => q !== null).slice(0, max);
}

/**
 * Cả bộ kiểm tra, chia vòng.
 *
 * Bản đầu hỏi sáu từ, một chiều, một lần. Sáu trên mười sáu nghĩa là mười từ không
 * được hỏi lần nào — và người dùng nhớ đúng cảm giác đó: "kiểm tra toàn từ khác".
 * Giờ mỗi từ đi qua cả ba chiều nhận biết, mỗi khung ngữ pháp của phần được hỏi ít
 * nhất một lần, và vòng nào cũng bỏ qua được.
 *
 * Phần nghe đảo vòng ② lên ngay sau vòng ①: sắp phải nghe thì thứ đáng kiểm tra
 * trước tiên là tai, không phải mắt.
 */
export function buildCheck(
  pack: PrepPack,
  part?: PartId,
  pool: readonly Vocab[] = DECK.vocab,
  pick: () => number = Math.random,
): CheckRound[] {
  const words = pack.words;
  const rounds: CheckRound[] = [
    { id: 'mean', label: '① Nghĩa', hint: 'Nhìn chữ, nhớ ra nghĩa.', qs: meaningQs(words, pool, pick) },
    {
      id: 'listen',
      label: '② Nghe ra từ',
      hint: 'Chỉ có tiếng, không có chữ — đúng như trong băng.',
      qs: listenQs(words, pool, pick),
    },
    {
      id: 'recall',
      label: '③ Nhớ mặt chữ',
      hint: 'Có nghĩa rồi, chỉ ra chữ Hán đúng.',
      qs: recallQs(words, pool, pick),
    },
    {
      id: 'usage',
      label: '④ Điền vào câu',
      hint: 'Từ này đứng ở đâu trong câu.',
      qs: usageQs(words, pool, pick),
    },
    {
      id: 'grammar',
      label: '⑤ Ngữ pháp',
      hint: 'Khung câu của phần này và điểm ngữ pháp có trong đề.',
      qs: grammarQs(pack.points, pack.notes, pick),
    },
  ];

  const listening = part?.startsWith('听力') ?? false;
  const order = listening ? ['mean', 'listen', 'recall', 'usage', 'grammar'] : ['mean', 'recall', 'usage', 'listen', 'grammar'];
  return rounds
    .filter((r) => r.qs.length > 0)
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

/** Bao nhiêu câu kiểm tra nhanh ở chế độ rút gọn — đủ để biết đã nhìn, chưa thành một buổi học. */
export const CHECK_COUNT = 6;

/**
 * Vài câu hỏi nghĩa, lấy ngay từ những từ vừa ôn.
 *
 * Bản rút gọn của vòng ①, giữ lại cho những chỗ chỉ cần chốt một lượt nhanh. Hỏi TỪ
 * ĐÁP ÁN trước đã: bốc đều sáu từ trong mười sáu thì phần lớn lượt kiểm tra rơi vào
 * những từ chỉ đi ngang qua câu, trong khi từ quyết định điểm lại không được hỏi.
 */
export function makeCheck(
  words: PrepWord[],
  pool: readonly Vocab[] = DECK.vocab,
  n = CHECK_COUNT,
  pick: () => number = Math.random,
): CheckQ[] {
  const keys = shuffled(words.filter((w) => w.isKey), pick);
  const rest = shuffled(words.filter((w) => !w.isKey), pick);
  return meaningQs([...keys, ...rest].slice(0, n), pool, pick);
}

// -- words the learner flagged ----------------------------------------------

/**
 * Những từ tự đánh dấu "chưa thuộc" trong lúc ôn.
 *
 * Chỉ là một danh sách chữ Hán, cố tình tách khỏi SRS. SRS ghi lại việc TRẢ LỜI một
 * câu; đây chỉ là "tôi nhìn thẻ này và thấy lạ", một tín hiệu yếu hơn nhiều. Trộn nó
 * vào lịch ôn thật sẽ làm hỏng khoảng cách lặp lại của những từ đã thật sự kiểm tra.
 */
export interface PrepMarks {
  shaky: string[];
}

export const EMPTY_MARKS: PrepMarks = { shaky: [] };

/** Bật/tắt dấu "chưa thuộc" của một từ; danh sách giữ tối đa 200 từ gần nhất. */
export function toggleShaky(marks: PrepMarks, h: string): PrepMarks {
  const has = marks.shaky.includes(h);
  const shaky = has ? marks.shaky.filter((x) => x !== h) : [h, ...marks.shaky].slice(0, 200);
  return { shaky };
}
