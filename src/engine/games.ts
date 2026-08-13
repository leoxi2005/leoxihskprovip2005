import { C } from '../theme';
import type { GameId } from './types';

export interface GameCard {
  icon: string;
  name: string;
  desc: string;
  bg: string;
  g: GameId;
  /** Keyboard shortcut, matched case-insensitively against `KeyboardEvent.key`. */
  key: string;
  /** Hidden from the grid until the condition holds — leeches only exist once you have some. */
  needsLeech?: boolean;
}

/**
 * The game grid, and the single source of truth for its shortcuts.
 *
 * The home screen renders this list and `GameEngine.handleKey` dispatches from it, so
 * a card can never drift out of sync with the key printed on it.
 */
export const GAME_CARDS: GameCard[] = [
  { icon: '🐉', name: 'Đấu Trùm', desc: '8 câu · 3 tim', bg: C.bossDark, g: 'boss', key: '1' },
  { icon: '⚡', name: 'Tia Chớp', desc: '12 câu · 6 giây/câu', bg: '#b07f1f', g: 'tf', key: '2' },
  { icon: '✍️', name: 'Luyện Viết', desc: 'Ghép · gõ · nghe viết', bg: C.green, g: 'write', key: '3' },
  { icon: '🎧', name: 'Luyện Nghe', desc: 'Nghe chọn + nghe viết', bg: C.purple, g: 'listen', key: '4' },
  { icon: '🔗', name: 'Ghép Cặp', desc: '4 cặp mỗi bàn', bg: '#5a8f4f', g: 'match', key: '5' },
  { icon: '🧠', name: 'Nhớ Nhanh', desc: 'Chữ biến mất — nhớ nghĩa', bg: '#e0653a', g: 'flash', key: '6' },
  { icon: '📚', name: 'Ngữ pháp & Đọc', desc: 'Cloze · câu · đoạn văn', bg: '#2f6f8f', g: 'read', key: '7' },
  { icon: '🎚️', name: 'Thanh Điệu', desc: 'mǎi hay mài? · zh/z · -n/-ng', bg: '#1f7a6d', g: 'tone', key: '8' },
  { icon: '🧩', name: 'Điền Từ', desc: 'Từ trong câu thật', bg: '#a4571f', g: 'cloze', key: '9' },
  { icon: '⚔️', name: 'Cặp Dễ Nhầm', desc: '经过 hay 通过? · có giải thích', bg: '#7a5cc4', g: 'confuse', key: '0' },
  { icon: '🔥', name: 'Từ Khắc Tinh', desc: 'Những từ mãi không nhớ', bg: '#a83c27', g: 'leech', key: 'k', needsLeech: true },
  { icon: '🎵', name: 'Học qua nhạc', desc: 'Điền từ vào lời bài hát', bg: C.pink, g: 'song', key: 'j' },
  { icon: '🎤', name: '绝弦的美', desc: 'Bài hát thật + video', bg: '#b3446c', g: 'mysong', key: 'l' },
];

/** The game a key press should start, or `undefined`. */
export const gameForKey = (key: string): GameId | undefined =>
  GAME_CARDS.find((c) => c.key === key.toLowerCase())?.g;
