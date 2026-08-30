import { describe, expect, it } from 'vitest';
import { DECK, LEVEL_OF } from '../data';
import { EXAM_1 } from '../data/exam1';
import { PART_GUIDES, countOf, drawPaper, flatten, partQuestions, type PartId } from './exam';
import {
  MAX_GRAMMAR_QS,
  MAX_WORDS,
  PART_NOTES,
  buildCheck,
  buildPrep,
  grammarQs,
  levelOf,
  makeCheck,
  prepGrammar,
  prepWords,
  soundsClose,
  textOf,
  toggleShaky,
} from './prep';

const ALL = flatten(EXAM_1);
const forPart = (id: PartId) => partQuestions(ALL, id);

describe('chữ của một câu hỏi', () => {
  it('câu nghe: lấy cả lời thoại, vì ôn trước là được biết trước', () => {
    const q = forPart('听力第一部分')[0].q;
    if (q.kind !== 'tf') throw new Error('sai loại câu');
    expect(textOf(q).all).toContain(q.item.say);
  });

  it('câu điền từ: cả sáu từ trong bảng đều là từ phải biết, không riêng từ đúng', () => {
    const q = forPart('阅读第一部分')[0].q;
    if (q.kind !== 'fill') throw new Error('sai loại câu');
    // Phần này hỏi bằng cách bắt chọn giữa sáu từ; không hiểu năm từ kia thì
    // loại trừ không chạy, nên cả sáu đều đáng ôn.
    expect(textOf(q).key).toEqual(q.group.bank);
  });

  it('câu trắc nghiệm: chỉ đáp án đúng vào phần key', () => {
    const q = forPart('阅读第三部分')[0].q;
    if (q.kind !== 'qa') throw new Error('sai loại câu');
    expect(textOf(q).key).toEqual([q.item.opts[q.item.ans]]);
  });

  it('mọi loại câu đều trả về chữ, không loại nào rơi ra ngoài', () => {
    const kinds = new Set(ALL.map((x) => x.q.kind));
    expect(kinds.size).toBe(6);
    for (const { q } of ALL) {
      expect(textOf(q).all.join('').length).toBeGreaterThan(0);
    }
  });
});

describe('từ vựng để ôn', () => {
  it('không bao giờ bày từ HSK 1–2 — người thi HSK 4 không cần ôn 我 với 好', () => {
    for (const id of PART_GUIDES.map((g) => g.id)) {
      for (const w of prepWords(forPart(id))) {
        expect(levelOf(w.v.h)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('mọi từ lấy ra đều thật sự có trong câu của phần đó', () => {
    const qs = forPart('阅读第一部分');
    const han = qs.map(({ q }) => textOf(q).all.join('')).join('');
    for (const w of prepWords(qs)) expect(han).toContain(w.v.h);
  });

  it('từ mang đáp án được xếp lên trước từ chỉ đi ngang qua', () => {
    const words = prepWords(forPart('阅读第一部分'), { max: 40 });
    const lastKey = words.map((w) => w.isKey).lastIndexOf(true);
    const firstPlain = words.map((w) => w.isKey).indexOf(false);
    // Có cả hai loại thì mọi từ đáp án phải đứng trên mọi từ thường.
    if (lastKey >= 0 && firstPlain >= 0) expect(lastKey).toBeLessThan(firstPlain);
  });

  it('từ tự đánh dấu "chưa thuộc" chen lên đầu, kể cả khi là từ dễ', () => {
    const qs = forPart('阅读第三部分');
    // Một từ HSK 1–2 có thật trong mấy câu này, tức bình thường sẽ bị loại.
    const easy = qs
      .flatMap(({ q }) => textOf(q).all.join(''))
      .join('')
      .split('')
      .find((c) => LEVEL_OF.get(c) === 1 && DECK.vocab.some((v) => v.h === c));
    if (!easy) return;
    const out = prepWords(qs, { pinned: new Set([easy]) });
    expect(out[0].v.h).toBe(easy);
  });

  it('không bao giờ vượt quá số ô của bảng', () => {
    for (const id of PART_GUIDES.map((g) => g.id)) {
      expect(prepWords(forPart(id)).length).toBeLessThanOrEqual(MAX_WORDS);
    }
  });

  it('mỗi từ chỉ hiện một lần, dù xuất hiện ở nhiều câu', () => {
    const words = prepWords(forPart('书写第一部分'), { max: 60 });
    expect(new Set(words.map((w) => w.v.h)).size).toBe(words.length);
  });
});

describe('điểm ngữ pháp rút từ đề', () => {
  it('chỉ nhận mục mà từ khoá thật sự nằm trong đề', () => {
    const qs = forPart('阅读第三部分');
    const han = qs.map(({ q }) => textOf(q).all.join('')).join('');
    for (const g of prepGrammar(qs)) expect(han).toContain(g.a);
  });

  it('không lặp lại cùng một điểm ngữ pháp hai lần', () => {
    const out = prepGrammar(forPart('听力第三部分'));
    expect(new Set(out.map((g) => g.name)).size).toBe(out.length);
  });

  it('bỏ từ khoá quá thường, nếu không bảng nào cũng giống bảng nào', () => {
    // 的 có mặt trong gần như mọi đề; một dấu hiệu đúng với mọi đề thì vô dụng.
    expect(prepGrammar(ALL).every((g) => g.a !== '的')).toBe(true);
  });

  it('không nhận từ khoá một chữ — 把 với 比 khớp ở đâu cũng khớp', () => {
    for (const g of PART_GUIDES) {
      for (const x of prepGrammar(forPart(g.id))) expect(x.a.length).toBeGreaterThan(1);
    }
  });

  it('không lẫn mục "Từ vựng: …" vào bảng ngữ pháp', () => {
    for (const g of prepGrammar(ALL, 50)) expect(g.name).not.toMatch(/^Từ vựng/i);
  });

  it('mỗi phần ra một bảng khác nhau, chứ không phải một bảng dùng chung', () => {
    const sets = PART_GUIDES.map((g) => prepGrammar(forPart(g.id)).map((x) => x.a).join(','));
    expect(new Set(sets.filter(Boolean)).size).toBeGreaterThan(1);
  });
});

describe('bảng ôn của từng phần', () => {
  /**
   * Mức sâu phải ĐỀU giữa tám phần.
   *
   * Bản đầu viết 书写第一部分 sáu điểm còn bảy phần kia ba điểm, và chỗ mỏng rơi đúng
   * vào 阅读第二部分 — phần đang thấp điểm nhất. Bảng ôn chỉ dày ở phần mình thấy dễ
   * viết thì nó ôn hộ người viết, không ôn hộ người học.
   */
  it('cả tám phần đều đủ sáu điểm ngữ pháp, mỗi điểm hai ví dụ', () => {
    for (const g of PART_GUIDES) {
      const notes = PART_NOTES[g.id] ?? [];
      expect(notes.length).toBeGreaterThanOrEqual(6);
      for (const n of notes) {
        expect(n.eg.length).toBeGreaterThanOrEqual(2);
        expect(n.why.length).toBeGreaterThan(40);
        for (const e of n.eg) expect(e.cn).toMatch(/[\u4e00-\u9fff]/);
      }
    }
  });

  it('không có hai điểm ngữ pháp trùng tên trong cùng một phần', () => {
    for (const g of PART_GUIDES) {
      const names = (PART_NOTES[g.id] ?? []).map((n) => n.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('phần nào cũng dựng được bảng ôn có từ để học', () => {
    for (const g of PART_GUIDES) {
      const pack = buildPrep(g.id, forPart(g.id));
      expect(pack.notes.length).toBeGreaterThan(0);
      expect(pack.words.length).toBeGreaterThan(0);
    }
  });
});

/**
 * Bảng ôn chỉ đúng khi ĐỀ được rút đúng.
 *
 * Bản đầu của `PartDrill` tự xáo câu lẻ, nên 阅读第一部分 rơi vào năm bảng từ khác nhau
 * (ba mươi từ thay vì mười hai) và bảng ôn mười sáu ô không sao chứa nổi. Lỗi trông
 * như lỗi của bảng ôn, nhưng nằm ở chỗ rút đề. Mấy bài này canh đúng chỗ đó.
 */
describe('một buổi luyện phải rút đúng như đề thật', () => {
  const drawFor = (id: PartId) => partQuestions(flatten(drawPaper(EXAM_1)), id);

  it('đủ và đúng số câu của phần', () => {
    for (const g of PART_GUIDES) expect(drawFor(g.id).length).toBe(countOf(g.id));
  });

  it('阅读第一部分: mười câu chỉ thuộc HAI bảng từ, y như đề thật', () => {
    for (let t = 0; t < 30; t++) {
      const qs = drawFor('阅读第一部分');
      const banks = new Set(qs.map((x) => (x.q.kind === 'fill' ? x.q.group.bank.join('') : '')));
      expect(banks.size).toBe(2);
    }
  });

  it('阅读第一部分: bảng ôn chứa TRỌN từ của cả hai bảng, không sót từ nào', () => {
    for (let t = 0; t < 10; t++) {
      const qs = drawFor('阅读第一部分');
      const bank = new Set(
        qs.flatMap((x) => (x.q.kind === 'fill' ? x.q.group.bank : [])).map((w) => w.replace(/[①-⑥]/g, '')),
      );
      // Giới hạn mặc định, không nới ra: đây là bảng người học thật sự nhìn thấy.
      const shown = new Set(prepWords(qs).map((w) => w.v.h));
      for (const w of bank) expect(shown.has(w)).toBe(true);
    }
  });

  it('câu thứ hai của một cụm luôn đứng ngay sau đoạn của nó', () => {
    for (const id of ['听力第三部分', '阅读第三部分'] as const) {
      for (let t = 0; t < 20; t++) {
        const qs = drawFor(id);
        qs.forEach((x, i) => {
          if (x.q.kind !== 'qa' || !x.q.item.sameAudio) return;
          const prev = qs[i - 1];
          expect(prev).toBeDefined();
          expect(prev.q.kind).toBe('qa');
          if (prev.q.kind !== 'qa') return;
          // Câu trước phải là câu MANG đoạn — không phải một câu mượn đoạn khác.
          expect(Boolean(prev.q.item.text) || Boolean(prev.q.item.say?.length)).toBe(true);
        });
      }
    }
  });
});

describe('kiểm tra nhanh', () => {
  const words = prepWords(forPart('阅读第一部分'));

  it('bốn lựa chọn khác nhau, và đáp án nằm đúng chỗ ans', () => {
    for (const q of makeCheck(words)) {
      expect(q.opts.length).toBe(4);
      expect(new Set(q.opts).size).toBe(4);
      expect(q.opts[q.ans]).toBe(q.v?.m);
    }
  });

  it('không hỏi quá số từ đang có', () => {
    expect(makeCheck(words.slice(0, 2)).length).toBe(2);
  });

  it('hỏi từ ĐÁP ÁN trước, rồi mới tới từ đi ngang qua', () => {
    const qs = partQuestions(flatten(drawPaper(EXAM_1)), '阅读第一部分');
    const w = prepWords(qs);
    const keys = w.filter((x) => x.isKey).length;
    const asked = makeCheck(w);
    // Còn dư chỗ thì mọi từ đáp án phải được hỏi; hết chỗ thì cả sáu câu là từ đáp án.
    expect(asked.filter((q) => w.find((x) => x.v.h === q.h)?.isKey).length).toBe(
      Math.min(keys, asked.length),
    );
  });

  it('mồi nhử cùng từ loại, để không loại được bằng ngữ pháp', () => {
    const pool = DECK.vocab;
    for (const q of makeCheck(words)) {
      const v = q.v;
      if (!v) throw new Error('câu hỏi nghĩa phải gắn với một từ');
      const sameKind = pool.filter((x) => x.pos === v.pos && x.m !== v.m);
      if (sameKind.length < 3) continue;
      /*
       * Hỏi "có TỪ NÀO cùng từ loại mang nghĩa này không", chứ không tra ngược nghĩa
       * về một từ duy nhất: hai từ khác loại vẫn có thể trùng nghĩa tiếng Việt, nên
       * `find` theo nghĩa trả về từ nào là chuyện may rủi, không phải chuyện đúng sai.
       */
      for (const m of q.opts) {
        expect(pool.some((x) => x.m === m && x.pos === v.pos)).toBe(true);
      }
    }
  });
});

describe('bộ kiểm tra nhiều vòng', () => {
  const packOf = (id: PartId) => buildPrep(id, forPart(id));
  const ALL_PARTS = PART_GUIDES.map((g) => g.id);

  it('mọi câu của mọi vòng đều có bốn lựa chọn khác nhau và đúng một đáp án', () => {
    for (const id of ALL_PARTS) {
      for (const r of buildCheck(packOf(id), id)) {
        expect(r.qs.length).toBeGreaterThan(0);
        for (const q of r.qs) {
          expect(q.opts.length).toBe(4);
          expect(new Set(q.opts).size).toBe(4);
          expect(q.ans).toBeGreaterThanOrEqual(0);
          expect(q.opts[q.ans]).toBeTruthy();
        }
      }
    }
  });

  it('TẤT CẢ từ của bảng ôn đều được hỏi, ở cả ba chiều nhận biết', () => {
    for (const id of ALL_PARTS) {
      const pack = packOf(id);
      if (!pack.words.length) continue;
      const rounds = buildCheck(pack, id);
      const all = pack.words.map((w) => w.v.h).sort();
      for (const kind of ['mean', 'listen', 'recall'] as const) {
        const r = rounds.find((x) => x.id === kind);
        if (!r) throw new Error(`thiếu vòng ${kind} ở ${id}`);
        // Sáu câu trên mười sáu từ là mười từ không được hỏi lần nào — đúng cái cảm
        // giác "kiểm tra toàn từ khác" mà bản đầu để lại. Vòng nào cũng phải phủ hết.
        expect(r.qs.map((q) => q.h).sort()).toEqual(all);
      }
    }
  });

  it('vòng nghe KHÔNG hiện chữ ra, và lựa chọn là chữ Hán', () => {
    for (const id of ALL_PARTS) {
      const r = buildCheck(packOf(id), id).find((x) => x.id === 'listen');
      for (const q of r?.qs ?? []) {
        // Hiện 银行 rồi bật tiếng thì câu hỏi tự trả lời hộ: mắt đọc xong trước tai.
        expect(q.prompt).toBe('');
        expect(q.say).toBe(q.h);
        expect(q.hanOpts).toBe(true);
      }
    }
  });

  it('mồi nhử của vòng nghe cùng số chữ với đáp án khi deck còn từ để lấy', () => {
    const r = buildCheck(packOf('听力第三部分'), '听力第三部分').find((x) => x.id === 'listen');
    for (const q of r?.qs ?? []) {
      const v = q.v;
      if (!v) throw new Error('câu nghe phải gắn với một từ');
      if (DECK.vocab.filter((x) => soundsClose(v, x) && x.h !== v.h).length < 3) continue;
      // Bốn lựa chọn một từ hai chữ và ba từ một chữ thì nghe thấy hai nhịp là xong.
      for (const o of q.opts) expect(o.length).toBe(v.h.length);
    }
  });

  it('vòng điền từ lấy ví dụ của DECK, không lấy câu trong đề', () => {
    for (const id of ALL_PARTS) {
      const r = buildCheck(packOf(id), id).find((x) => x.id === 'usage');
      for (const q of r?.qs ?? []) {
        const v = q.v;
        if (!v?.ex) throw new Error('câu điền từ phải có ví dụ của deck');
        expect(q.prompt).toBe(v.ex.replace(v.h, '＿＿'));
        expect(q.prompt).not.toContain(v.h);
      }
    }
  });

  it('không câu nào in ra câu văn của đề sắp làm', () => {
    for (const id of ALL_PARTS) {
      const qs = forPart(id);
      const paper = qs.map(({ q }) => textOf(q).all.join('')).join('|');
      for (const r of buildCheck(buildPrep(id, qs), id)) {
        // Vòng ngữ pháp được miễn: khung viết tay của phần nghe DẠY bằng chính câu
        // hỏi mẫu của đề (关于男的，可以知道什么？). Đó là câu hỏi chung của cả phần,
        // không phải nội dung đoạn — biết trước nó là điều bảng ôn muốn.
        if (r.id === 'grammar') continue;
        for (const q of r.qs) {
          const shown = q.prompt.replace(/[＿_]/g, '');
          // Từ lẻ thì trùng là chuyện đương nhiên — bảng ôn sinh ra từ chính đề. Cái
          // phải chặn là CÂU: đọc trước nguyên câu của bài nghe thì buổi luyện chỉ
          // còn kiểm tra trí nhớ ngắn hạn, mà thứ đang cần luyện là nghe.
          if (shown.length < 8) continue;
          expect(paper.includes(shown)).toBe(false);
        }
      }
    }
  });

  it('câu khoét lỗ không in sẵn bản dịch — dịch là đọc hộ luôn từ phải chọn', () => {
    for (const id of ALL_PARTS) {
      for (const r of buildCheck(packOf(id), id)) {
        for (const q of r.qs) {
          if (!q.prompt.includes('＿＿')) continue;
          // "Cuốn sách này rất ĐÁNG đọc" nằm ngay trên bốn lựa chọn có 值得 thì câu
          // hỏi tự trả lời hộ. Nghĩa cả câu để dành cho `note`, hiện sau khi chọn.
          expect(q.sub).toBeUndefined();
          expect(q.note).toBeTruthy();
        }
      }
    }
  });

  it('vòng ngữ pháp chạm tới mọi khung của phần, và vẫn còn chỗ cho mục của deck', () => {
    for (const id of ALL_PARTS) {
      const pack = packOf(id);
      const qs = grammarQs(pack.points, pack.notes, Math.random);
      for (const n of pack.notes) {
        expect(qs.some((q) => q.note?.startsWith(n.name))).toBe(true);
      }
      // Mục của deck bị cắt hết là lỗi thứ tự đã sửa một lần: xếp hết ví dụ của khung
      // lên trước thì `max` ăn sạch phần deck, và bước ② vừa hứa xong là hỏi lại.
      const usable = pack.points.filter((g) => g.sent.includes('____'));
      expect(qs.filter((q) => q.hanOpts).length).toBe(usable.length);
      expect(qs.length).toBeLessThanOrEqual(MAX_GRAMMAR_QS);
    }
  });

  it('phần nghe kiểm tra tai ngay sau vòng nghĩa; phần đọc/viết thì để sau', () => {
    const order = (id: PartId) => buildCheck(packOf(id), id).map((r) => r.id);
    expect(order('听力第三部分').slice(0, 2)).toEqual(['mean', 'listen']);
    expect(order('阅读第一部分').indexOf('listen')).toBeGreaterThan(1);
  });

  it('hai từ nghe lẫn nhau phải cùng số chữ và giống âm', () => {
    const v = (h: string) => {
      const x = DECK.vocab.find((y) => y.h === h);
      if (!x) throw new Error('thiếu từ ' + h);
      return x;
    };
    expect(soundsClose(v('银行'), v('印象'))).toBe(true); // yínháng · yìnxiàng
    expect(soundsClose(v('银行'), v('饿'))).toBe(false); // khác số chữ
  });
});

describe('dấu "chưa thuộc"', () => {
  it('bấm lần nữa là bỏ dấu', () => {
    const on = toggleShaky({ shaky: [] }, '经验');
    expect(on.shaky).toEqual(['经验']);
    expect(toggleShaky(on, '经验').shaky).toEqual([]);
  });

  it('từ mới nhất lên đầu và danh sách không phình mãi', () => {
    let m = { shaky: Array.from({ length: 200 }, (_, i) => 'x' + i) };
    m = toggleShaky(m, '新');
    expect(m.shaky[0]).toBe('新');
    expect(m.shaky.length).toBe(200);
  });
});
