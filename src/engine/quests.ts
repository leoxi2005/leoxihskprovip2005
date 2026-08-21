/**
 * Nhiệm vụ hằng ngày — vòng lặp "hôm nay còn việc chưa xong" của app.
 *
 * Khác **Kế hoạch hằng ngày** (`plan.ts`) ở chỗ: kế hoạch là thứ BẮT BUỘC để kịp
 * ngày thi và được tính ngược từ lượng từ còn lại; nhiệm vụ ở đây là thứ để chơi —
 * đổi mỗi ngày, thưởng vàng, và cố tình đẩy người học sang những chế độ họ ít mở.
 *
 * Ba nhiệm vụ mỗi ngày, chọn bằng chính chuỗi ngày tháng nên mở lại app bao nhiêu
 * lần vẫn ra đúng ba nhiệm vụ đó — bốc lại mỗi lần load thì người chơi chỉ cần F5
 * cho tới khi ra nhiệm vụ dễ.
 */
import type { LogRow } from './storage';
import { todayRows } from './stats';
import type { GameId, Kind } from './types';

export interface QuestCtx {
  /** Các lượt trả lời từ 0h hôm nay. */
  rows: LogRow[];
  /** Combo cao nhất đạt được hôm nay. */
  maxCombo: number;
  /** Những chế độ đã chơi hôm nay. */
  games: GameId[];
  /** XP kiếm được hôm nay. */
  dayXp: number;
}

export interface Quest {
  id: string;
  icon: string;
  name: string;
  goal: number;
  /** Vàng nhận được khi xong. */
  coins: number;
  measure: (c: QuestCtx) => number;
}

/** Đếm số lượt trả lời ĐÚNG thuộc một nhóm dạng câu. */
const rightOf =
  (...kinds: Kind[]) =>
  (c: QuestCtx): number => {
    const want = new Set<Kind>(kinds);
    return c.rows.filter((r) => want.has(r[2]) && r[3] === 1).length;
  };

/**
 * Kho nhiệm vụ.
 *
 * Mỗi nhiệm vụ phải làm được trong một phiên bình thường — nhiệm vụ mà ngày nào cũng
 * treo dở thì chỉ dạy người chơi bỏ qua nó.
 */
export const QUESTS: Quest[] = [
  {
    id: 'q:right',
    icon: '💯',
    name: 'Trả lời đúng 40 câu',
    goal: 40,
    coins: 30,
    measure: (c) => c.rows.filter((r) => r[3] === 1).length,
  },
  {
    id: 'q:listen',
    icon: '🎧',
    name: 'Đúng 15 câu nghe',
    goal: 15,
    coins: 30,
    measure: rightOf('a2h', 'dict', 'sdict', 'num'),
  },
  {
    id: 'q:build',
    icon: '🧱',
    name: 'Dựng đúng 8 câu',
    goal: 8,
    coins: 35,
    measure: rightOf('build', 'order'),
  },
  {
    id: 'q:sdict',
    icon: '📝',
    name: 'Chép đúng 6 câu chính tả',
    goal: 6,
    coins: 40,
    measure: rightOf('sdict'),
  },
  {
    id: 'q:gram',
    icon: '📐',
    name: 'Đúng 12 câu ngữ pháp',
    goal: 12,
    coins: 30,
    measure: rightOf('gram', 'fix', 'cloze'),
  },
  {
    id: 'q:word',
    icon: '🧲',
    name: 'Đúng 10 câu kết hợp từ & dễ nhầm',
    goal: 10,
    coins: 30,
    measure: rightOf('collo', 'conf'),
  },
  {
    id: 'q:num',
    icon: '🔢',
    name: 'Gỡ 8 bẫy số & giờ',
    goal: 8,
    coins: 30,
    measure: rightOf('num'),
  },
  {
    id: 'q:tone',
    icon: '🎚️',
    name: 'Đúng 12 câu thanh điệu',
    goal: 12,
    coins: 25,
    measure: rightOf('tone'),
  },
  {
    id: 'q:write',
    icon: '✍️',
    name: 'Viết đúng 10 chữ Hán',
    goal: 10,
    coins: 30,
    measure: rightOf('write', 'type'),
  },
  { id: 'q:combo', icon: '🔥', name: 'Đạt combo ×10', goal: 10, coins: 35, measure: (c) => c.maxCombo },
  {
    id: 'q:modes',
    icon: '🎲',
    name: 'Chơi 3 chế độ khác nhau',
    goal: 3,
    coins: 25,
    measure: (c) => new Set(c.games).size,
  },
  { id: 'q:xp', icon: '⭐', name: 'Kiếm 250 XP', goal: 250, coins: 30, measure: (c) => c.dayXp },
];

/** Vàng thưởng thêm khi xong cả ba nhiệm vụ trong ngày. */
export const ALL_DONE_BONUS = 60;

/** Băm chuỗi ngày thành một số — cùng một ngày luôn ra cùng một bộ nhiệm vụ. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Ba nhiệm vụ của ngày `day` (`toDateString()`).
 *
 * Bốc bằng cách xoay vòng theo bước nguyên tố cùng nhau với số nhiệm vụ, nên ba
 * nhiệm vụ chắc chắn khác nhau và bộ ba trôi đều qua cả kho theo ngày.
 */
export function questsFor(day: string): Quest[] {
  const n = QUESTS.length;
  const start = hash(day) % n;
  // 5 nguyên tố cùng nhau với 12, nên xoay 5 bước không bao giờ rơi lại chỗ cũ.
  const step = 5;
  return [0, 1, 2].map((k) => QUESTS[(start + k * step) % n]);
}

export interface QuestState {
  quest: Quest;
  at: number;
  done: boolean;
  claimed: boolean;
}

export function questStates(day: string, ctx: QuestCtx, claimed: readonly string[]): QuestState[] {
  return questsFor(day).map((quest) => {
    const at = Math.min(quest.goal, Math.max(0, Math.round(quest.measure(ctx))));
    return { quest, at, done: at >= quest.goal, claimed: claimed.includes(quest.id) };
  });
}

/** Bối cảnh chấm nhiệm vụ, dựng từ nhật ký và bộ đếm trong ngày. */
export const questCtx = (
  log: LogRow[],
  day: { maxCombo: number; games: GameId[] },
  dayXp: number,
): QuestCtx => ({ rows: todayRows(log), maxCombo: day.maxCombo, games: day.games, dayXp });
