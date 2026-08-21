/**
 * Tách một câu tiếng Trung thành các "quân bài" để xếp lại thành câu.
 *
 * Không dùng thư viện phân từ nào cả: từ điển ở đây chính là deck của app (1282 từ
 * HSK 1–4), nên mọi quân bài đều là thứ người học đã gặp. Cắt bằng thư viện ngoài
 * sẽ ra những mảnh không nằm trong deck — người chơi phải xếp một từ họ chưa học.
 *
 * Hai bước:
 *  1. Khớp tham lam từ dài nhất (tối đa 4 chữ) theo từ điển.
 *  2. Dán lại theo luật ngữ pháp, vì bước 1 cắt quá vụn: 我给他发了一条短信 ra 8
 *     mảnh, xếp 8 mảnh là trò xếp hình chứ không còn là câu.
 */

/** Trợ từ luôn dính vào từ đứng TRƯỚC: 买了 · 我的 · 说得 · 他们 · 一点儿. */
const SUFFIX = new Set(['了', '着', '过', '的', '地', '得', '们', '儿', '吗', '呢', '吧', '啊', '嘛']);

/** Phủ định luôn dính vào từ đứng SAU: 不是 · 没去. */
const PREFIX = new Set(['不', '没']);

/** Số & chỉ định đứng trước lượng từ: 一个 · 这件 · 两条. */
const NUM = new Set('一二三四五六七八九十百千万零两几这那每半多某上下前后本'.split(''));

/** Chữ số — dính liền nhau thành một quân: 二十一 là một số, không phải ba quân. */
const DIGITS = new Set('零一二三四五六七八九十百千万亿两'.split(''));

/** Lượng từ hay gặp trong deck. */
const MEASURE = new Set(
  '个条家项种位本件张只把双份台辆些点次场道杯瓶碗块片段句篇封棵头匹群排列层间口串顿趟遍年月日天周次'.split(''),
);

/** Cụm cố định mà deck không có mục riêng — nếu để rời sẽ thành hai quân vô nghĩa. */
const GLUE = [
  '越来越', '一点儿', '有点儿', '差不多', '不好意思', '对不起',
  '这里', '那里', '哪里', '这儿', '那儿', '哪儿', '这么', '那么', '怎么', '什么',
  '这些', '那些', '哪些', '一下', '一起', '一样', '一直', '一定', '一共', '一边',
  '我们', '你们', '他们', '她们', '咱们', '以后', '以前', '的话', '而且', '所以',
  '因为', '但是', '可是', '如果', '虽然', '还是', '或者', '不但', '不过', '要是',
  '请问', '各位', '为了', '关于', '对于', '之间', '一会儿', '好像', '刚才',
];

/**
 * Khớp từ dài nhất, thử `GLUE` trước rồi tới từ điển deck.
 *
 * Chữ không khớp gì thì đứng một mình — bước dán ở dưới sẽ gom nó lại.
 */
interface Tok {
  w: string;
  /** `false` = chữ này không khớp từ nào trong deck, chỉ đứng lẻ vì hết cách. */
  known: boolean;
}

function greedy(text: string, dict: ReadonlySet<string>): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < text.length) {
    let hit = '';
    for (let len = Math.min(4, text.length - i); len >= 1; len--) {
      const w = text.slice(i, i + len);
      if (GLUE.includes(w) || dict.has(w)) {
        hit = w;
        break;
      }
    }
    if (hit) {
      out.push({ w: hit, known: true });
      i += hit.length;
    } else {
      out.push({ w: text[i], known: false });
      i += 1;
    }
  }
  return out;
}

/** Bỏ mọi thứ không phải chữ Hán — dấu câu không thành quân bài. */
export const hanOnly = (s: string): string => s.replace(/[^一-鿿]/g, '');

/**
 * Tách câu thành quân bài.
 *
 * Trả về mảng rỗng nếu câu không có chữ Hán nào.
 */
export function segment(sentence: string, dict: ReadonlySet<string>): string[] {
  return segmentTokens(sentence, dict).map((t) => t.w);
}

function segmentTokens(sentence: string, dict: ReadonlySet<string>): Tok[] {
  const text = hanOnly(sentence);
  if (!text) return [];
  const raw = greedy(text, dict);

  const out: Tok[] = [];
  const glue = (t: Tok) => {
    const last = out[out.length - 1];
    out[out.length - 1] = { w: last.w + t.w, known: last.known && t.known };
  };
  for (const tok of raw) {
    const prev = out[out.length - 1];

    // 二 + 十 → 二十, rồi 二十 + 一 → 二十一.
    if (prev && tok.w.length === 1 && DIGITS.has(tok.w) && [...prev.w].every((c) => DIGITS.has(c))) {
      glue(tok);
      continue;
    }
    // 一 + 个 → 一个. Chỉ dán khi vế trái đúng là một chữ số/chỉ định đứng lẻ,
    // để không biến 医生 + 个 thành một quân.
    if (
      prev &&
      tok.w.length === 1 &&
      MEASURE.has(tok.w) &&
      (NUM.has(prev.w) || [...prev.w].every((c) => DIGITS.has(c)))
    ) {
      glue(tok);
      continue;
    }
    if (prev && tok.w.length === 1 && SUFFIX.has(tok.w)) {
      glue(tok);
      continue;
    }
    if (prev && prev.w.length === 1 && PREFIX.has(prev.w)) {
      glue(tok);
      continue;
    }
    out.push(tok);
  }
  return out;
}

/**
 * Như `segment`, nhưng trả `null` khi câu chứa chữ không có trong deck.
 *
 * Đây là bộ lọc của chế độ Dựng Câu: một quân bài mà người học chưa từng gặp thì
 * câu đó không dùng để luyện được — 热烈 bị cắt thành 热 và 烈 là hai quân vô nghĩa,
 * thà bỏ câu đó đi. Deck còn hơn nghìn câu khác.
 */
export function segmentStrict(sentence: string, dict: ReadonlySet<string>): string[] | null {
  const toks = segmentTokens(sentence, dict);
  if (!toks.length || toks.some((t) => !t.known)) return null;
  return toks.map((t) => t.w);
}
