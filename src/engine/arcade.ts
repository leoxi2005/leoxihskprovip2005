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

export type ArcadeId = 'rain' | 'snake' | 'blitz';

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
    id: 'blitz',
    icon: '⚡',
    name: 'Nối Chữ Cấp Tốc',
    desc: 'Dọn sạch bàn 12 cặp trước khi hết giờ — nối nhanh được cộng giờ',
    skill: 'Quét bàn và ghép cặp thật nhanh',
    bg: '#b07f1f',
    key: 'v',
  },
];

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
