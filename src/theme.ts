/** Design tokens — "neo-brutalist storybook". Values are final per the handoff. */

export const C = {
  bg: '#faf4e8',
  dot: '#eee3cd',
  card: '#fffdf7',
  panel: '#fbf6ea',
  soft: '#fdf3dd',
  ink: '#2d2419',
  line: '#e3d8c0',
  edge: '#d9cbac',
  track: '#eadfca',
  red: '#c94f38',
  ochre: '#e8a93c',
  green: '#4f9d5f',
  blue: '#3b7ea1',
  purple: '#8a63b8',
  pink: '#d6567b',
  bossDark: '#7a2d3d',
  muted: '#8a7a5f',
  muted2: '#a3906f',
  gold: '#a4761b',
  body: '#4a3f2f',
  okBg: '#e9f5e6',
  okInk: '#3c7a49',
  badBg: '#fbe7e2',
  badInk: '#a83c27',
} as const;

export const F = {
  ui: "'Baloo 2',sans-serif",
  han: "'Noto Serif SC',serif",
} as const;

/** Offset hard shadow, the signature of the style. */
export const shadow = (n: number, color: string = C.ink) => `${n}px ${n}px 0 ${color}`;

export const CHIP_COLORS: Record<string, string> = {
  m2h: '#c94f38',
  h2m: '#3b7ea1',
  a2h: '#8a63b8',
  write: '#4f9d5f',
  type: '#d67bb0',
  gram: '#b07f1f',
  sent: '#3b7ea1',
  pass: '#2f6f8f',
  order: '#c96f2e',
  match: '#5a8f4f',
  tf: '#e8a93c',
  dict: '#8a63b8',
  flash: '#e0653a',
  song: '#d6567b',
  conf: '#7a5cc4',
};

export const CHIP_LABELS: Record<string, string> = {
  m2h: 'TỪ VỰNG · Nghĩa → Chữ Hán',
  h2m: 'ĐỌC HIỂU TỪ · Chữ Hán → Nghĩa',
  a2h: 'LUYỆN NGHE 🎧',
  write: 'VIẾT CHỮ HÁN ✍️',
  type: 'GÕ CHỮ HÁN ⌨️',
  gram: 'NGỮ PHÁP 📐',
  sent: 'ĐỌC HIỂU CÂU 📖',
  pass: 'ĐỌC HIỂU ĐOẠN VĂN 📚',
  order: 'SẮP XẾP CÂU 🧩',
  match: 'GHÉP CẶP 🔗',
  tf: 'VÒNG TIA CHỚP ⚡',
  dict: 'NGHE VIẾT 🎧⌨️',
  flash: 'NHỚ NHANH 🧠',
  song: 'HỌC QUA NHẠC 🎵',
  conf: 'CẶP DỄ NHẦM ⚔️',
};

export const PRAISE = [
  '太棒了! Đỉnh quá 🎉',
  '正确! Chuẩn luôn ✨',
  '很好! Tuyệt vời 🌟',
  '厉害! Quá giỏi 🔥',
];

export const OOPS = ['哎呀! Chưa đúng rồi', '没关系! Từ này sẽ quay lại sau', '加油! Cố lên nhé'];
