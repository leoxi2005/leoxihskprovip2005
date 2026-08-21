import { beforeEach, describe, expect, it } from 'vitest';
import { DECK } from '../data';
import { ARCADES, arcadeForKey, arcadeRound, arcadeXp, loadBest, saveBest } from './arcade';
import { GAME_CARDS, gameForKey } from './games';

describe('phím tắt của trò chơi', () => {
  it('không trò nào trùng phím với trò nào', () => {
    expect(new Set(ARCADES.map((a) => a.key)).size).toBe(ARCADES.length);
  });

  it('không đụng phím của các chế độ ôn, cũng không đụng S của Sinh Tồn', () => {
    for (const a of ARCADES) {
      expect(gameForKey(a.key), `phím ${a.key} đã có chủ`).toBeUndefined();
      expect(a.key).not.toBe('s');
    }
    // Và ngược lại: bấm phím của một chế độ ôn không được mở ra trò chơi.
    for (const c of GAME_CARDS) expect(arcadeForKey(c.key)).toBeUndefined();
  });

  it('mã trò không trùng nhau', () => {
    expect(new Set(ARCADES.map((a) => a.id)).size).toBe(ARCADES.length);
  });
});

describe('bốc lượt trong trò chơi', () => {
  it('luôn có đúng một đáp án nằm giữa các từ nhiễu', () => {
    for (let i = 0; i < 200; i++) {
      const r = arcadeRound(DECK.vocab, 4)!;
      expect(r.opts).toHaveLength(4);
      expect(r.opts.filter((o) => o.h === r.word.h)).toHaveLength(1);
    }
  });

  it('không có hai lựa chọn nào cùng nghĩa — trong hai giây thì đó là bẫy đọc, không phải câu hỏi', () => {
    for (let i = 0; i < 200; i++) {
      const r = arcadeRound(DECK.vocab, 4)!;
      expect(new Set(r.opts.map((o) => o.m)).size).toBe(4);
    }
  });

  it('không đủ từ thì trả về null chứ không dựng bàn thiếu', () => {
    expect(arcadeRound(DECK.vocab.slice(0, 2), 4)).toBeNull();
  });
});

describe('điểm và kỷ lục', () => {
  beforeEach(() => localStorage.clear());

  it('XP có trần — một ván dài không được phép thay cho một buổi ôn', () => {
    expect(arcadeXp(0)).toBe(0);
    expect(arcadeXp(20)).toBe(60);
    expect(arcadeXp(10_000)).toBe(400);
  });

  it('chỉ ghi đè khi thật sự phá được kỷ lục', () => {
    expect(saveBest('rain', 12)).toBe(true);
    expect(saveBest('rain', 9)).toBe(false);
    expect(loadBest().rain).toBe(12);
    expect(saveBest('rain', 13)).toBe(true);
    expect(loadBest().rain).toBe(13);
  });

  it('kỷ lục của trò này không đụng vào trò kia', () => {
    saveBest('rain', 20);
    saveBest('snake', 5);
    expect(loadBest()).toEqual({ rain: 20, snake: 5 });
  });
});
