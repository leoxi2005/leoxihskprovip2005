import { describe, expect, it } from 'vitest';
import { endlessSub } from './Result';

describe('endless result copy', () => {
  it('never taunts a first-time player with a record of zero', () => {
    expect(endlessSub(0, 0)).not.toContain('0');
    expect(endlessSub(3, 0)).toContain('3');
    expect(endlessSub(3, 0)).not.toContain('kỷ lục cũ');
  });

  it('counts what it takes to beat the record, not to match it', () => {
    // Record 10, streak 8 → 9, 10, 11: three more to actually beat it.
    expect(endlessSub(8, 10)).toBe('Còn 3 câu nữa là phá kỷ lục 10');
    expect(endlessSub(10, 10)).toContain('Hoà kỷ lục');
  });

  it('celebrates a beaten record with the old number', () => {
    expect(endlessSub(12, 10)).toBe('Bạn vừa vượt kỷ lục cũ (10) — chuỗi mới: 12');
  });
});
