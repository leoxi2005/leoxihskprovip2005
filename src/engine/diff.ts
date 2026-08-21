/**
 * So bài chép chính tả với câu gốc.
 *
 * Không so từng vị trí một: gõ thiếu một chữ ở đầu câu mà chấm theo vị trí thì cả
 * câu sau đó đều bị tính sai, và điểm 0 đó không nói được gì cho người học. Dùng
 * chuỗi con chung dài nhất (LCS) nên một chữ thiếu chỉ mất đúng một chữ.
 */

export type MarkKind = 'ok' | 'miss' | 'extra';

export interface Mark {
  ch: string;
  kind: MarkKind;
}

export interface DiffResult {
  /** Số chữ của câu gốc mà người học gõ đúng. */
  hit: number;
  /** Tổng số chữ của câu gốc. */
  total: number;
  /** 0–1. */
  score: number;
  /** Câu gốc, mỗi chữ kèm trạng thái — `extra` là chữ thừa người học gõ thêm. */
  marks: Mark[];
}

/** Bảng LCS, dựng đầy đủ vì câu ví dụ dài nhất trong deck chỉ 20 chữ. */
function lcsTable(a: string, b: string): number[][] {
  const t = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1]);
    }
  }
  return t;
}

/**
 * `typed` là bài làm, `target` là câu gốc (cả hai chỉ nên còn chữ Hán).
 *
 * `marks` đọc theo thứ tự câu gốc, xen kẽ những chữ thừa ở đúng chỗ chúng được gõ vào.
 */
export function diffChars(typed: string, target: string): DiffResult {
  const t = lcsTable(typed, target);
  const marks: Mark[] = [];
  let i = typed.length;
  let j = target.length;
  let hit = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && typed[i - 1] === target[j - 1]) {
      marks.push({ ch: target[j - 1], kind: 'ok' });
      hit++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || t[i][j - 1] >= t[i - 1][j])) {
      marks.push({ ch: target[j - 1], kind: 'miss' });
      j--;
    } else {
      marks.push({ ch: typed[i - 1], kind: 'extra' });
      i--;
    }
  }
  marks.reverse();
  return { hit, total: target.length, score: target.length ? hit / target.length : 0, marks };
}

/** Ngưỡng tính là làm đúng một câu chép chính tả. */
export const DICT_PASS = 0.9;
