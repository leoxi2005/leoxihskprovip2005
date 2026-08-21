/**
 * Huy hiệu — phần thưởng cho những thứ một phiên học không nhìn thấy.
 *
 * SRS chỉ biết từng từ, nhiệm vụ hằng ngày chỉ biết hôm nay. Huy hiệu là chỗ duy
 * nhất trong app nhìn được toàn bộ chặng đường: tổng số câu đã trả lời, chuỗi ngày
 * dài nhất, kỹ năng nào đã cày đủ sâu.
 *
 * Mỗi huy hiệu là một con số ĐANG CHẠY chứ không phải một cái công tắc: hiện
 * "412/1000 câu" thì cái chưa đạt cũng nói được điều gì đó, còn một ô xám trơn thì
 * không.
 */
import type { LogRow } from './storage';
import { byDay } from './stats';
import type { Kind } from './types';

export interface AwardCtx {
  xp: number;
  level: number;
  streak: number;
  /** Số từ cả hai làn đều đã chín. */
  learned: number;
  /** Tổng số lượt trả lời từ trước tới nay. */
  answers: number;
  right: number;
  bestEndless: number;
  bestCombo: number;
  pets: number;
  chestsOpened: number;
  coinsEarned: number;
  /** Số lượt đúng theo từng dạng câu, tính từ đầu. */
  kindRight: Map<Kind, number>;
  /** Điểm đề thi thử cao nhất, trên 300. */
  examBest: number;
  /** Số ngày khác nhau đã học. */
  days: number;
}

export interface Award {
  id: string;
  icon: string;
  name: string;
  desc: string;
  goal: number;
  at: (c: AwardCtx) => number;
}

const rights =
  (...kinds: Kind[]) =>
  (c: AwardCtx): number =>
    kinds.reduce((n, k) => n + (c.kindRight.get(k) ?? 0), 0);

const A = (
  id: string,
  icon: string,
  name: string,
  desc: string,
  goal: number,
  at: (c: AwardCtx) => number,
): Award => ({ id, icon, name, desc, goal, at });

export const AWARDS: Award[] = [
  // -- đường dài ------------------------------------------------------------
  A('a:learn1', '🌱', 'Mầm chữ', '50 từ chín cả hai làn', 50, (c) => c.learned),
  A('a:learn2', '🌳', 'Rừng chữ', '300 từ chín cả hai làn', 300, (c) => c.learned),
  A('a:learn3', '🏔️', 'Núi chữ', '800 từ chín cả hai làn', 800, (c) => c.learned),
  A('a:answers1', '👣', 'Ngàn bước', '1.000 lượt trả lời', 1000, (c) => c.answers),
  A('a:answers2', '🚀', 'Vạn bước', '10.000 lượt trả lời', 10000, (c) => c.answers),
  A('a:days1', '📅', 'Một tháng', 'Học vào 30 ngày khác nhau', 30, (c) => c.days),
  A('a:days2', '📆', 'Một trăm ngày', 'Học vào 100 ngày khác nhau', 100, (c) => c.days),
  A('a:streak1', '🔥', 'Chuỗi bảy ngày', 'Bảy ngày liên tiếp không nghỉ', 7, (c) => c.streak),
  A('a:streak2', '🔥', 'Chuỗi ba mươi', 'Ba mươi ngày liên tiếp', 30, (c) => c.streak),
  A('a:level', '⭐', 'Cấp hai mươi', 'Lên tới cấp 20', 20, (c) => c.level),

  // -- kỹ năng --------------------------------------------------------------
  A('a:listen', '🎧', 'Tai thính', '500 câu nghe đúng', 500, rights('a2h', 'dict', 'sdict', 'num')),
  A('a:sdict', '📝', 'Chép như máy', '150 câu chính tả đúng', 150, rights('sdict')),
  A('a:build', '🧱', 'Thợ xây câu', '200 câu dựng đúng', 200, rights('build', 'order')),
  A('a:write', '✍️', 'Bút cứng', '300 chữ viết đúng', 300, rights('write', 'type')),
  A('a:gram', '📐', 'Vững ngữ pháp', '300 câu ngữ pháp đúng', 300, rights('gram', 'fix', 'cloze')),
  A('a:tone', '🎚️', 'Chuẩn thanh điệu', '200 câu thanh điệu đúng', 200, rights('tone')),
  A('a:collo', '🧲', 'Ghép từ khéo', '150 câu kết hợp từ đúng', 150, rights('collo', 'conf')),
  A('a:num', '🔢', 'Không lọt bẫy số', '100 câu số & giờ đúng', 100, rights('num')),
  A('a:read', '📚', 'Đọc trôi', '150 câu đọc hiểu đúng', 150, rights('pass', 'sent')),

  // -- bản lĩnh -------------------------------------------------------------
  A('a:combo', '💥', 'Combo ba mươi', 'Chuỗi 30 câu đúng liên tiếp', 30, (c) => c.bestCombo),
  A('a:endless', '♾️', 'Sinh tồn 50', 'Sống sót 50 câu trong chế độ Sinh Tồn', 50, (c) => c.bestEndless),
  A('a:exam', '📝', 'Qua đề thi thử', 'Đạt 180/300 ở đề thi thử', 180, (c) => c.examBest),
  A('a:exam2', '🏅', 'Đề thi thử 260+', 'Đạt 260/300 ở đề thi thử', 260, (c) => c.examBest),

  // -- sưu tầm --------------------------------------------------------------
  A('a:pets', '🐲', 'Đủ bộ linh thú', 'Bắt đủ 12 con', 12, (c) => c.pets),
  A('a:chests', '🎁', 'Tay mở rương', 'Mở 25 rương', 25, (c) => c.chestsOpened),
  A('a:coins', '🪙', 'Kho vàng', 'Kiếm tổng cộng 5.000 vàng', 5000, (c) => c.coinsEarned),
];

export interface AwardState {
  award: Award;
  at: number;
  done: boolean;
  pct: number;
}

export function awardStates(c: AwardCtx): AwardState[] {
  return AWARDS.map((award) => {
    const raw = Math.max(0, Math.round(award.at(c)));
    const at = Math.min(raw, award.goal);
    return { award, at, done: at >= award.goal, pct: Math.round((at / award.goal) * 100) };
  });
}

/** Số lượt ĐÚNG theo từng dạng câu, đọc từ nhật ký. */
export function kindRightOf(log: LogRow[]): Map<Kind, number> {
  const out = new Map<Kind, number>();
  for (const r of log) if (r[3] === 1) out.set(r[2], (out.get(r[2]) ?? 0) + 1);
  return out;
}

/** Số ngày khác nhau từng có ít nhất một lượt trả lời. */
export const studyDays = (log: LogRow[]): number => byDay(log).length;
