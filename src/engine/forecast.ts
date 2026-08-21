/**
 * "Thi hôm nay thì được bao nhiêu?"
 *
 * Màn Thống kê cũ trả lời được "bạn đã làm bao nhiêu câu" và "dạng nào hay sai", nhưng
 * không trả lời được câu duy nhất người sắp thi muốn biết. Ở đây tính ước lượng đó từ
 * chính nhật ký trả lời, quy về thang 300 điểm của đề thật.
 *
 * **Con số này lạc quan hơn điểm thi thật, và app phải nói thẳng như vậy.** Lý do:
 * lúc ôn thì không bấm giờ, sai được nghe lại, và câu nào cũng có lời giải ngay sau đó.
 * Nên nếu đã từng làm đề thi thử, điểm đề thử mới là con số đáng tin — ước lượng này
 * chỉ để nhìn xu hướng giữa hai lần thi thử, và để chỉ ra phần đang kéo điểm xuống.
 */
import type { LogRow } from './storage';
import type { Kind } from './types';

export type SectionId = 'listen' | 'read' | 'write';

/**
 * Dạng câu nào tính vào phần nào của đề.
 *
 * Chỉ lấy những dạng thật sự giống một phần của đề. Thẻ nghĩa ↔ chữ (`m2h`/`h2m`),
 * ghép cặp và vòng tia chớp bị bỏ ra: chúng đo trí nhớ từ vựng chứ không đo được kỹ
 * năng nào của đề, mà lại rất dễ đúng — để vào là điểm ước lượng phồng lên vô ích.
 */
const SECTION_KINDS: Record<SectionId, Kind[]> = {
  listen: ['a2h', 'dict', 'sdict', 'num'],
  read: ['gram', 'sent', 'pass', 'cloze', 'conf', 'collo', 'fix'],
  write: ['write', 'type', 'build', 'order'],
};

export const SECTION_NAME: Record<SectionId, string> = {
  listen: 'Nghe',
  read: 'Đọc',
  write: 'Viết',
};

/** Dưới ngần này lượt trả lời thì con số chưa nói lên điều gì. */
export const ENOUGH = 30;

/** Chỉ nhìn những lượt gần đây — trình độ ba tháng trước không còn là trình độ hôm nay. */
const WINDOW = 300;

export interface SectionForecast {
  id: SectionId;
  /** Số lượt đã tính. */
  n: number;
  /** 0–100. */
  pct: number;
  /** 0–100 điểm của phần đó. */
  points: number;
  enough: boolean;
}

export interface Forecast {
  sections: SectionForecast[];
  /** 0–300. */
  total: number;
  /** Đủ dữ liệu cho cả ba phần chưa. */
  enough: boolean;
  /** Phần yếu nhất trong những phần đã đủ dữ liệu. */
  weakest: SectionForecast | null;
}

/** Điểm đạt của HSK 4. */
export const PASS = 180;

export function predictScore(log: LogRow[]): Forecast {
  const sections = (Object.keys(SECTION_KINDS) as SectionId[]).map((id) => {
    const want = new Set<Kind>(SECTION_KINDS[id]);
    const rows = log.filter((r) => want.has(r[2])).slice(-WINDOW);
    const right = rows.filter((r) => r[3] === 1).length;
    const pct = rows.length ? Math.round((right / rows.length) * 100) : 0;
    return { id, n: rows.length, pct, points: Math.round(pct), enough: rows.length >= ENOUGH };
  });
  const ready = sections.filter((s) => s.enough);
  return {
    sections,
    total: sections.reduce((n, s) => n + s.points, 0),
    enough: ready.length === sections.length,
    weakest: ready.length ? ready.reduce((a, b) => (b.pct < a.pct ? b : a)) : null,
  };
}

/**
 * Một câu nói thẳng người học nên làm gì tiếp.
 *
 * Không phải lời động viên: nó nêu đúng phần đang kéo điểm xuống, vì đó là chỗ mà một
 * giờ ôn đổi được nhiều điểm nhất.
 */
export function advice(f: Forecast, examBest: number | null): string {
  const thin = f.sections.filter((s) => !s.enough);
  if (thin.length) {
    return `Chưa đủ dữ liệu cho phần ${thin.map((s) => SECTION_NAME[s.id]).join(' · ')} — làm thêm vài phiên rồi con số mới có nghĩa.`;
  }
  const w = f.weakest!;
  if (examBest !== null && examBest >= PASS && f.total >= PASS) {
    return `Đang trên ngưỡng đạt. Phần ${SECTION_NAME[w.id]} vẫn thấp nhất (${w.pct}%) — giữ nhịp và đừng bỏ phần đó.`;
  }
  if (f.total < PASS) {
    const need = PASS - f.total;
    return `Còn thiếu khoảng ${need} điểm để chạm ngưỡng 180. Phần ${SECTION_NAME[w.id]} đang yếu nhất (${w.pct}%) — đó là chỗ đổi công lấy điểm nhanh nhất.`;
  }
  return `Phần ${SECTION_NAME[w.id]} đang yếu nhất (${w.pct}%) — một giờ ôn ở đó đáng giá hơn một giờ ôn phần bạn đã chắc.`;
}
