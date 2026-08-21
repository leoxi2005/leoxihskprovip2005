/**
 * Vàng, rương và linh thú — lớp phần thưởng nằm ngoài việc học.
 *
 * Vì sao cần: SRS trả công bằng một con số ngày càng xa (hộp 7 = 75 ngày), tức là
 * học càng giỏi thì phần thưởng càng thưa. Lớp này trả công NGAY sau mỗi phiên, và
 * quan trọng hơn là trả bằng thứ để dành được — vàng dồn lại mở rương, rương ra linh
 * thú, linh thú thì thiếu con nào thấy rõ con đó.
 *
 * Ba thứ mua được bằng vàng đều có tác dụng thật chứ không chỉ để nhìn: **băng** giữ
 * chuỗi ngày khi lỡ nghỉ một hôm, **bùa XP** nhân đôi điểm một phiên, và **linh thú**
 * là thứ duy nhất thuần sưu tầm.
 */
import { KEYS, load, save } from './storage';
import type { GameId } from './types';

export interface Pet {
  id: string;
  icon: string;
  name: string;
  /** Câu giới thiệu, hiện khi bắt được. */
  line: string;
}

/**
 * Mười hai linh thú, xếp từ dễ gặp tới hiếm.
 *
 * Con cuối cùng (🐲 Rồng) chỉ ra khỏi rương khi đã có đủ mười một con kia — bộ sưu
 * tập cần một cái đích nhìn thấy được, không phải một xác suất chạy mãi.
 */
export const PETS: Pet[] = [
  { id: 'panda', icon: '🐼', name: 'Gấu trúc 熊猫', line: 'Ăn trúc, ngủ trưa, thi vẫn qua.' },
  { id: 'cat', icon: '🐱', name: 'Mèo 猫', line: 'Nằm lên bàn phím đúng lúc bạn gõ chữ Hán.' },
  { id: 'rabbit', icon: '🐰', name: 'Thỏ 兔子', line: 'Nhớ từ nhanh, quên cũng nhanh.' },
  { id: 'fox', icon: '🦊', name: 'Cáo 狐狸', line: 'Chuyên gia bẫy 经过 / 通过.' },
  { id: 'tiger', icon: '🐯', name: 'Hổ 老虎', line: 'Gầm một tiếng, combo lên mười.' },
  { id: 'monkey', icon: '🐵', name: 'Khỉ 猴子', line: 'Học lỏm thanh điệu chỉ bằng cách nghe.' },
  { id: 'owl', icon: '🦉', name: 'Cú 猫头鹰', line: 'Bạn học ban đêm thì nó thức cùng.' },
  { id: 'crane', icon: '🦩', name: 'Hạc 鹤', line: 'Đứng một chân đọc hết bài đọc hiểu.' },
  { id: 'turtle', icon: '🐢', name: 'Rùa 乌龟', line: 'Chậm mà chắc — hộp 7, bảy mươi lăm ngày.' },
  { id: 'dolphin', icon: '🐬', name: 'Cá heo 海豚', line: 'Nghe một lần là nhớ, kể cả băng thi.' },
  { id: 'phoenix', icon: '🦚', name: 'Phượng 凤凰', line: 'Sai bao nhiêu lần cũng đứng dậy được.' },
  { id: 'dragon', icon: '🐲', name: 'Rồng 龙', line: 'Chỉ tới khi đã có đủ mười một bạn kia.' },
];

export interface Meta {
  coins: number;
  /** Rương chưa mở. */
  chests: number;
  /** Đã mở bao nhiêu rương, tính từ đầu. */
  opened: number;
  /** Băng giữ chuỗi ngày. */
  freezes: number;
  /** Còn bao nhiêu phiên được nhân đôi XP. */
  boost: number;
  pets: string[];
  /** Ngày của mấy bộ đếm bên dưới, `toDateString()`. */
  day: string;
  maxCombo: number;
  games: GameId[];
  /** Nhiệm vụ đã nhận thưởng hôm nay. */
  claimed: string[];
  /** Đã nhận thưởng "xong cả ba" hôm nay chưa. */
  bonusTaken: boolean;
  bestCombo: number;
  /** Tổng vàng từng kiếm được, để tính huy hiệu. */
  earned: number;
}

export const DEFAULT_META: Meta = {
  coins: 0,
  chests: 0,
  opened: 0,
  freezes: 0,
  boost: 0,
  pets: [],
  day: '',
  maxCombo: 0,
  games: [],
  claimed: [],
  bonusTaken: false,
  bestCombo: 0,
  earned: 0,
};

/** Giá một rương. */
export const CHEST_COST = 60;

/** Vàng đổi từ XP của phiên vừa chơi. */
export const coinsForXp = (xp: number): number => Math.max(1, Math.round(xp / 8));

/**
 * Đọc trạng thái, và tự dọn các bộ đếm khi sang ngày mới.
 *
 * Dọn ở chỗ đọc chứ không đợi tới lúc ghi: mở app lúc nửa đêm rồi để đó, sáng hôm sau
 * chơi tiếp mà bộ đếm vẫn của hôm qua thì nhiệm vụ hôm nay hiện ra đã xong sẵn.
 */
export function loadMeta(today = new Date().toDateString()): Meta {
  const m = { ...DEFAULT_META, ...load<Partial<Meta>>(KEYS.meta, {}) };
  if (m.day !== today) {
    return { ...m, day: today, maxCombo: 0, games: [], claimed: [], bonusTaken: false };
  }
  return m;
}

export const saveMeta = (m: Meta): void => save(KEYS.meta, m);

export type RewardKind = 'coins' | 'freeze' | 'boost' | 'pet';

export interface Reward {
  kind: RewardKind;
  /** Vàng nhận được, hoặc số lượt bùa/băng. */
  amount: number;
  pet?: Pet;
  icon: string;
  title: string;
  note: string;
}

/**
 * Mở một rương.
 *
 * Linh thú được ưu tiên khi còn con chưa bắt: một rương ra thứ mình đã có là một
 * rương mở hụt, và cảm giác đó phá đúng cái vòng lặp mà rương sinh ra để nuôi.
 * Rồng đứng riêng — chỉ ra khi mười một con kia đã đủ.
 */
export function openChest(m: Meta, roll = Math.random()): { meta: Meta; reward: Reward } {
  const ownable = PETS.filter((p) => !m.pets.includes(p.id));
  const dragonOnly = ownable.length === 1 && ownable[0].id === 'dragon';
  const canPet = ownable.length > 0 && (!dragonOnly || m.pets.length >= PETS.length - 1);

  const next: Meta = { ...m, chests: m.chests - 1, opened: m.opened + 1 };

  if (canPet && roll < 0.35) {
    const pool = ownable.filter((p) => p.id !== 'dragon' || ownable.length === 1);
    const pet = pool[Math.floor((roll / 0.35) * pool.length) % pool.length];
    return {
      meta: { ...next, pets: [...m.pets, pet.id] },
      reward: {
        kind: 'pet',
        amount: 1,
        pet,
        icon: pet.icon,
        title: 'Bắt được ' + pet.name + '!',
        note: pet.line,
      },
    };
  }
  if (roll < 0.55) {
    return {
      meta: { ...next, freezes: m.freezes + 1 },
      reward: {
        kind: 'freeze',
        amount: 1,
        icon: '🧊',
        title: 'Một viên băng giữ chuỗi',
        note: 'Lỡ nghỉ một ngày thì viên này tự tan ra để chuỗi ngày không đứt.',
      },
    };
  }
  if (roll < 0.75) {
    return {
      meta: { ...next, boost: m.boost + 1 },
      reward: {
        kind: 'boost',
        amount: 1,
        icon: '⚡',
        title: 'Bùa XP ×2',
        note: 'Phiên tiếp theo được nhân đôi toàn bộ XP.',
      },
    };
  }
  // Vàng: phần đáy của bảng, nhưng có một khoản lớn hiếm gặp để lần mở nào cũng còn
  // một khả năng đáng chờ.
  const jackpot = roll >= 0.97;
  const amount = jackpot ? 250 : 25 + Math.round(roll * 60);
  return {
    meta: { ...next, coins: m.coins + amount, earned: m.earned + amount },
    reward: {
      kind: 'coins',
      amount,
      icon: jackpot ? '💎' : '🪙',
      title: (jackpot ? 'ĐẠI HỶ! ' : '') + amount + ' vàng',
      note: jackpot ? 'Một phần trăm mới ra được cái này.' : 'Dồn thêm chút nữa là đủ một rương.',
    },
  };
}

/** Cộng vàng và ghi lại tổng đã kiếm — hai con số phải đi cùng nhau. */
export const addCoins = (m: Meta, n: number): Meta => ({
  ...m,
  coins: m.coins + n,
  earned: m.earned + Math.max(0, n),
});
