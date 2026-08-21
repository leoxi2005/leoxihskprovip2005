import { describe, expect, it } from 'vitest';
import { ENOUGH, PASS, advice, predictScore } from './forecast';
import type { LogRow } from './storage';

const row = (kind: LogRow[2], ok: 0 | 1): LogRow => [Date.now(), 'w:x', kind, ok, 4000];
const many = (kind: LogRow[2], n: number, rightRatio: number): LogRow[] =>
  Array.from({ length: n }, (_, i) => row(kind, i < Math.round(n * rightRatio) ? 1 : 0));

describe('dự báo điểm thi', () => {
  it('chưa có dữ liệu thì không phán bừa', () => {
    const f = predictScore([]);
    expect(f.total).toBe(0);
    expect(f.enough).toBe(false);
    expect(f.weakest).toBeNull();
    expect(advice(f, null)).toContain('Chưa đủ dữ liệu');
  });

  it('mỗi phần tối đa 100 điểm, cả đề tối đa 300', () => {
    const log = [...many('a2h', 60, 1), ...many('gram', 60, 1), ...many('write', 60, 1)];
    const f = predictScore(log);
    expect(f.total).toBe(300);
    f.sections.forEach((s) => expect(s.points).toBeLessThanOrEqual(100));
  });

  it('đúng một nửa thì được một nửa số điểm', () => {
    const f = predictScore(many('a2h', 100, 0.5));
    expect(f.sections.find((s) => s.id === 'listen')!.points).toBe(50);
  });

  it('ít hơn ngưỡng thì đánh dấu là chưa đủ dữ liệu', () => {
    const f = predictScore(many('a2h', ENOUGH - 1, 1));
    expect(f.sections.find((s) => s.id === 'listen')!.enough).toBe(false);
    expect(f.enough).toBe(false);
  });

  it('chỉ ra đúng phần yếu nhất', () => {
    const log = [...many('a2h', 40, 0.9), ...many('gram', 40, 0.5), ...many('write', 40, 0.8)];
    const f = predictScore(log);
    expect(f.weakest!.id).toBe('read');
    expect(advice(f, null)).toContain('Đọc');
  });

  it('thẻ nghĩa ↔ chữ không được tính vào bất cứ phần nào', () => {
    // Chúng đo trí nhớ từ vựng chứ không đo kỹ năng nào của đề, mà lại rất dễ đúng.
    const f = predictScore(many('m2h', 200, 1));
    expect(f.total).toBe(0);
  });

  it('nói rõ còn thiếu bao nhiêu điểm khi chưa chạm ngưỡng đạt', () => {
    const log = [...many('a2h', 40, 0.5), ...many('gram', 40, 0.5), ...many('write', 40, 0.5)];
    const f = predictScore(log);
    expect(f.total).toBeLessThan(PASS);
    expect(advice(f, null)).toContain('180');
  });
});
