/**
 * Trò chơi thật — khác hẳn phần còn lại của app.
 *
 * Mọi chế độ khác đều cùng một nhịp: ra câu → chọn → bấm Kiểm tra → đọc lời giải.
 * Nhịp đó tốt cho việc học nhưng nó không phải nhịp của một trò chơi: không có gì
 * chạy khi bạn ngồi im, và không bao giờ thua.
 *
 * Ba trò dưới đây bỏ hẳn nút Kiểm tra. Chúng có mạng, có điểm, có kỷ lục, và có một
 * đồng hồ không chờ ai cả. Đổi lại, chúng chỉ hỏi được thứ trả lời được trong hai
 * giây — nhận mặt chữ — nên chúng bổ sung cho các chế độ kia chứ không thay thế.
 */
import type { Vocab } from '../data';
import { shuffle } from './questions';
import { KEYS, load, save } from './storage';

export type ArcadeId = 'rain' | 'snake' | 'blitz' | 'duel' | 'tower';

export interface ArcadeCard {
  id: ArcadeId;
  icon: string;
  name: string;
  desc: string;
  /** Kỹ năng trò này thật sự luyện — in ngay trên thẻ để không ai tưởng nó chỉ để chơi. */
  skill: string;
  bg: string;
  key: string;
}

export const ARCADES: ArcadeCard[] = [
  {
    id: 'rain',
    icon: '🌧️',
    name: 'Mưa Chữ',
    desc: 'Chữ rơi xuống — bắt đúng chữ mang nghĩa đang hỏi',
    skill: 'Nhận mặt chữ dưới áp lực thời gian',
    bg: '#2f6f8f',
    key: 'r',
  },
  {
    id: 'snake',
    icon: '🐍',
    name: 'Rắn Săn Chữ',
    desc: 'Lái rắn đi ăn đúng chữ, đừng đâm vào tường hay vào mình',
    skill: 'Nghĩa → chữ, vừa nhớ vừa lái',
    bg: '#4f9d5f',
    key: 'x',
  },
  {
    id: 'duel',
    icon: '⚔️',
    name: 'Đấu Chữ',
    desc: 'Đua 10 câu với đối thủ — thắng thì lên hạng, thua thì tụt',
    skill: 'Trả lời đúng NHANH HƠN người khác',
    bg: '#7a2d3d',
    key: 'g',
  },
  {
    id: 'tower',
    icon: '🗼',
    name: 'Tháp Vàng',
    desc: 'Mỗi tầng nhân đôi vàng — rút bây giờ hay leo thêm một tầng?',
    skill: 'Biết dừng đúng lúc, và nhớ chắc dưới áp lực',
    bg: '#a4571f',
    key: 't',
  },
  {
    id: 'blitz',
    icon: '⚡',
    name: 'Nối Chữ Cấp Tốc',
    desc: 'Dọn sạch bàn 12 cặp trước khi hết giờ — nối nhanh được cộng giờ',
    skill: 'Quét bàn và ghép cặp thật nhanh',
    bg: '#b07f1f',
    key: 'v',
  },
];

/**
 * Sáu hạng đấu của trò Đấu Chữ.
 *
 * Có hạng để leo là thứ giữ người chơi quay lại mạnh hơn mọi điểm số: điểm cao hôm
 * nay không mất đi đâu, còn hạng thì **tụt được** — và cái có thể mất mới là cái người
 * ta giữ. Đối thủ máy mạnh dần theo hạng, nên leo lên là thật sự phải chơi khá hơn.
 */
export interface Tier {
  name: string;
  icon: string;
  /** Đối thủ trả lời một câu mất bao nhiêu mili giây. */
  botMs: number;
  /** Tỉ lệ đối thủ trả lời đúng. */
  botAcc: number;
  color: string;
}

export const TIERS: Tier[] = [
  { name: 'Đồng', icon: '🥉', botMs: 5200, botAcc: 0.72, color: '#a4761b' },
  { name: 'Bạc', icon: '🥈', botMs: 4300, botAcc: 0.8, color: '#8a7a5f' },
  { name: 'Vàng', icon: '🥇', botMs: 3600, botAcc: 0.86, color: '#e8a93c' },
  { name: 'Bạch Kim', icon: '💎', botMs: 3000, botAcc: 0.9, color: '#3b7ea1' },
  { name: 'Kim Cương', icon: '👑', botMs: 2500, botAcc: 0.94, color: '#8a63b8' },
  { name: 'Cao Thủ', icon: '🐉', botMs: 2100, botAcc: 0.97, color: '#c94f38' },
];

/** Thắng đủ ngần này sao thì lên hạng. */
export const STARS_PER_TIER = 3;

export interface Rank {
  /** Chỉ số trong `TIERS`. */
  tier: number;
  stars: number;
  wins: number;
  losses: number;
}

export const DEFAULT_RANK: Rank = { tier: 0, stars: 0, wins: 0, losses: 0 };

export const loadRank = (): Rank => ({ ...DEFAULT_RANK, ...load<Partial<Rank>>(KEYS.rank, {}) });

/**
 * Ghi kết quả một trận.
 *
 * Thua ở hạng thấp nhất thì **không tụt xuống dưới 0 sao**: người mới học mà trận đầu
 * thua đã bị đẩy xuống nữa thì họ đóng app, chứ không chơi lại.
 */
export function applyDuel(rank: Rank, won: boolean): { rank: Rank; promoted: boolean; demoted: boolean } {
  const r = { ...rank, wins: rank.wins + (won ? 1 : 0), losses: rank.losses + (won ? 0 : 1) };
  if (won) {
    r.stars += 1;
    if (r.stars >= STARS_PER_TIER && r.tier < TIERS.length - 1) {
      r.stars = 0;
      r.tier += 1;
      return { rank: r, promoted: true, demoted: false };
    }
    if (r.stars > STARS_PER_TIER) r.stars = STARS_PER_TIER;
    return { rank: r, promoted: false, demoted: false };
  }
  r.stars -= 1;
  if (r.stars < 0) {
    if (r.tier > 0) {
      r.tier -= 1;
      r.stars = STARS_PER_TIER - 1;
      return { rank: r, promoted: false, demoted: true };
    }
    r.stars = 0;
  }
  return { rank: r, promoted: false, demoted: false };
}

export const saveRank = (r: Rank): void => save(KEYS.rank, r);

export const arcadeById = (id: ArcadeId): ArcadeCard => ARCADES.find((a) => a.id === id)!;

export const arcadeForKey = (key: string): ArcadeId | undefined =>
  ARCADES.find((a) => a.key === key.toLowerCase())?.id;

/** Một lượt hỏi trong trò chơi: một từ đích và mấy từ nhiễu. */
export interface ArcadeRound {
  word: Vocab;
  /** Từ đích nằm lẫn trong này. */
  opts: Vocab[];
}

/**
 * Bốc một lượt.
 *
 * Từ nhiễu ưu tiên khác nghĩa hẳn từ đích: trong một trò chơi hai giây, hai nghĩa
 * na ná nhau không phải là câu hỏi khó, nó là một cái bẫy đọc.
 */
export function arcadeRound(pool: Vocab[], n: number): ArcadeRound | null {
  if (pool.length < n) return null;
  const word = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle(pool.filter((v) => v.h !== word.h && v.m !== word.m)).slice(0, n - 1);
  if (others.length < n - 1) return null;
  return { word, opts: shuffle([word, ...others]) };
}

/** Kỷ lục từng trò. */
export type ArcadeBest = Partial<Record<ArcadeId, number>>;

export const loadBest = (): ArcadeBest => load<ArcadeBest>(KEYS.arcade, {});

/** Ghi kỷ lục mới, trả về `true` nếu đây thật sự là kỷ lục. */
export function saveBest(id: ArcadeId, score: number): boolean {
  const all = loadBest();
  if ((all[id] ?? 0) >= score) return false;
  save(KEYS.arcade, { ...all, [id]: score });
  return true;
}

/**
 * XP của một ván.
 *
 * Trần 400 là cố ý: một ván Mưa Chữ dài không được phép thay thế một buổi ôn tập,
 * nếu không thì cách tối ưu để lên cấp là chơi game và không bao giờ mở thẻ ra nữa.
 */
export const arcadeXp = (score: number): number => Math.min(400, score * 3);
