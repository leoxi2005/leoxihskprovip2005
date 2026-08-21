import { describe, expect, it } from 'vitest';
import { COLLOCATIONS, DECK, FIXES } from '../data';
import { DICT_PASS, diffChars } from './diff';
import { NUM_DRILLS, cnNum, spoken } from './numbers';
import { makeBuildQ, makeColloQ, makeFixQ, makeNumQ, makeSDictQ } from './questions';
import { DICT, buildable, dictatable } from './session';
import { hanOnly, segment, segmentStrict } from './segment';

describe('tách câu thành quân bài', () => {
  it('dán trợ từ vào từ đứng trước, không để đứng lẻ', () => {
    expect(segment('我买了一本书。', DICT)).toEqual(['我', '买了', '一本', '书']);
  });

  it('gom chữ số thành một quân', () => {
    expect(segment('二十一', DICT)).toEqual(['二十一']);
  });

  it('bỏ sạch dấu câu', () => {
    expect(hanOnly('他力气很大。')).toBe('他力气很大');
  });

  it('từ chối câu có chữ ngoài deck', () => {
    // 烈 không phải một từ trong deck, nên 热烈 sẽ vỡ thành hai quân vô nghĩa.
    expect(segmentStrict('大家讨论得很热烈。', DICT)).toBeNull();
  });

  it('ghép các quân lại đúng bằng câu gốc', () => {
    for (const w of DECK.vocab) {
      const toks = segmentStrict(w.ex ?? '', DICT);
      if (toks) expect(toks.join('')).toBe(hanOnly(w.ex!));
    }
  });
});

describe('chế độ Dựng Câu', () => {
  const pool = buildable(DECK.vocab);

  it('có đủ câu để chơi lâu dài', () => {
    expect(pool.length).toBeGreaterThan(300);
  });

  it('quân bài luôn dựng lại được đúng câu, và không bao giờ dựng sẵn', () => {
    for (const w of pool.slice(0, 200)) {
      const q = makeBuildQ(w, DICT)!;
      expect(q.tiles.slice().sort()).toEqual(q.answer.slice().sort());
      expect(q.tlen).toBe(q.answer.length);
      expect(q.ansStr).toBe(hanOnly(w.ex!));
      expect(q.tlen).toBeGreaterThanOrEqual(3);
      expect(q.tlen).toBeLessThanOrEqual(7);
    }
  });

  it('tính vào làn tái tạo của chính từ đó', () => {
    const q = makeBuildQ(pool[0], DICT)!;
    expect(q.id).toBe('w:' + pool[0].h);
  });
});

describe('chép chính tả', () => {
  it('chỉ nhận câu đủ dài để đáng chép', () => {
    for (const w of dictatable(DECK.vocab).slice(0, 100)) {
      const q = makeSDictQ(w)!;
      expect(q.sent.length).toBeGreaterThanOrEqual(4);
      expect(q.sent.length).toBeLessThanOrEqual(16);
      expect(q.sent).toBe(hanOnly(w.ex!));
    }
  });

  it('gõ thiếu một chữ chỉ mất đúng một chữ', () => {
    const r = diffChars('我给他发了短信', '我给他发了一条短信');
    expect(r.hit).toBe(7);
    expect(r.total).toBe(9);
    expect(r.marks.filter((m) => m.kind === 'miss').map((m) => m.ch)).toEqual(['一', '条']);
  });

  it('chữ thừa ở đầu câu không kéo cả câu thành sai', () => {
    const r = diffChars('啊他力气很大', '他力气很大');
    expect(r.hit).toBe(5);
    expect(r.score).toBe(1);
    expect(r.marks.filter((m) => m.kind === 'extra')).toHaveLength(1);
  });

  it('gõ đúng hết thì đạt ngưỡng, gõ hụt hai chữ trên chín thì không', () => {
    expect(diffChars('他力气很大', '他力气很大').score).toBeGreaterThanOrEqual(DICT_PASS);
    expect(diffChars('我给他发了短信', '我给他发了一条短信').score).toBeLessThan(DICT_PASS);
  });
});

describe('bẫy số & giờ', () => {
  it('đọc số đúng lối viết chuẩn', () => {
    expect(cnNum(15)).toBe('十五');
    expect(cnNum(20)).toBe('二十');
    expect(cnNum(105)).toBe('一百零五');
    expect(cnNum(150)).toBe('一百五十');
    expect(cnNum(1002)).toBe('一千零二');
    expect(cnNum(30000)).toBe('三万');
    expect(cnNum(120000)).toBe('十二万');
  });

  it('nói 两 chứ không nói 二 trước bậc lớn', () => {
    expect(spoken(cnNum(200))).toBe('两百');
    expect(spoken(cnNum(24000))).toBe('两万四千');
    // Hàng chục thì vẫn là 二十.
    expect(spoken(cnNum(20))).toBe('二十');
  });

  it('2 giờ đọc là 两点', () => {
    const two = NUM_DRILLS.find((d) => d.id === 'n:t2-15')!;
    expect(two.say).toContain('两点');
    expect(two.label).toBe('2:15');
  });

  it('差五分四点 là 3:55 chứ không phải 4:05', () => {
    const d = NUM_DRILLS.find((x) => x.id === 'n:tc4')!;
    expect(d.label).toBe('3:55');
    expect(d.bad).toContain('4:05');
  });

  it('mỗi đề có bốn lựa chọn khác nhau và một đáp án', () => {
    for (const d of NUM_DRILLS) {
      expect(new Set([d.label, ...d.bad]).size, d.id).toBe(4);
      const q = makeNumQ(d);
      expect(q.opts[q.ans]).toBe(d.label);
      expect(d.why.length).toBeGreaterThan(10);
    }
  });

  it('không có hai đề trùng mã', () => {
    expect(new Set(NUM_DRILLS.map((d) => d.id)).size).toBe(NUM_DRILLS.length);
  });
});

describe('kết hợp từ', () => {
  it('bốn lựa chọn khác nhau, đáp án nằm trong đó', () => {
    for (const c of COLLOCATIONS) {
      expect(new Set(c.opts).size, c.id).toBe(4);
      expect(c.opts).toContain(c.a);
      expect(c.frame).toContain('____');
      expect(c.why.length).toBeGreaterThan(20);
      const q = makeColloQ(c);
      expect(q.opts[q.ans]).toBe(c.a);
    }
  });
});

describe('bắt lỗi sai', () => {
  it('mỗi câu có đúng bốn mảnh và một chỗ sai', () => {
    for (const f of FIXES) {
      expect(f.parts, f.id).toHaveLength(4);
      expect(f.bad).toBeGreaterThanOrEqual(0);
      expect(f.bad).toBeLessThan(4);
      expect(f.why.length).toBeGreaterThan(20);
      const q = makeFixQ(f);
      expect(q.opts[q.ans]).toBe(f.parts[f.bad]);
    }
  });

  it('câu đã sửa phải khác câu sai — không thì chẳng có lỗi nào cả', () => {
    for (const f of FIXES) {
      expect(hanOnly(f.parts.join('')), f.id).not.toBe(hanOnly(f.right));
    }
  });
});

describe('mã bài không đụng nhau', () => {
  it('mỗi mục nội dung giữ một mã riêng', () => {
    const ids = [
      ...DECK.vocab.map((v) => 'w:' + v.h),
      ...DECK.grammar.map((g) => g.id),
      ...DECK.orders.map((o) => o.id),
      ...COLLOCATIONS.map((c) => c.id),
      ...FIXES.map((f) => f.id),
      ...NUM_DRILLS.map((d) => d.id),
    ];
    const seen = new Set<string>();
    const dup = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dup).toEqual([]);
  });
});
