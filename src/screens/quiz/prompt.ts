import type { CSSProperties } from 'react';
import { C, F } from '../../theme';
import type { GameState, Question } from '../../engine/types';

const serif: CSSProperties = { fontFamily: F.han, fontWeight: 700, color: C.ink };

export interface PromptView {
  title: string;
  main: string;
  mainStyle: CSSProperties;
  sub?: string;
  /** `big` is the pulsing purple listen button on audio-first questions. */
  speaker: 'none' | 'small' | 'big';
}

/** What the prompt card shows for each question kind. */
export function promptView(q: Question, st: GameState): PromptView {
  const posSub = 'word' in q && q.word.pos ? `(${q.word.pos})` : '';

  switch (q.kind) {
    case 'm2h':
      return {
        title: 'Chọn chữ Hán đúng với nghĩa',
        main: q.word.m,
        mainStyle: { fontSize: 30, fontWeight: 800, lineHeight: 1.35 },
        sub: posSub || undefined,
        speaker: 'none',
      };
    case 'h2m':
      return {
        title: 'Từ này nghĩa là gì?',
        main: q.word.h,
        mainStyle: { ...serif, fontSize: 70, lineHeight: 1.2 },
        speaker: 'small',
      };
    case 'flash':
      // The hanzi flashes, hides, then comes back with the answer.
      return {
        title: st.checked
          ? 'Chữ vừa rồi nghĩa là gì?'
          : st.flashOn
            ? 'GHI NHỚ NHANH — chữ sắp biến mất!'
            : 'Chữ vừa rồi nghĩa là gì?',
        main: st.checked || st.flashOn ? q.word.h : '❓',
        mainStyle: {
          ...serif,
          fontSize: 70,
          lineHeight: 1.2,
          opacity: st.checked || st.flashOn ? 1 : 0.45,
          transition: 'opacity .3s',
        },
        speaker: 'none',
      };
    case 'a2h':
      return {
        title: 'Nghe và chọn từ bạn nghe được',
        main: '',
        mainStyle: {},
        speaker: 'big',
      };
    case 'write':
      return {
        title: 'Ghép chữ Hán cho từ',
        main: q.word.m,
        mainStyle: { fontSize: 28, fontWeight: 800, lineHeight: 1.35 },
        sub: (posSub ? posSub + ' · ' : '') + 'Bấm số hoặc chạm vào ô chữ',
        speaker: 'small',
      };
    case 'type':
      return {
        title: 'Gõ chữ Hán cho từ (dùng bộ gõ tiếng Trung)',
        main: q.word.m,
        mainStyle: { fontSize: 28, fontWeight: 800, lineHeight: 1.35 },
        sub: posSub || undefined,
        speaker: 'small',
      };
    case 'dict':
      return { title: 'Nghe và gõ lại chữ Hán', main: '', mainStyle: {}, speaker: 'big' };
    case 'match':
      return { title: 'Ghép chữ Hán với nghĩa đúng', main: '', mainStyle: {}, speaker: 'none' };
    case 'song':
      return {
        title: `🎵 ${q.song.title} — câu ${q.li + 1}/${q.song.lines.length}`,
        main: q.line.cn.split(q.line.blank).join(' ____ '),
        mainStyle: { ...serif, fontSize: 32, lineHeight: 1.7 },
        sub: q.yt
          ? 'Ca sĩ vừa hát đúng câu này — 🔊 nghe lại, 🐢 nghe chậm'
          : 'Nghe 🔊 rồi điền từ còn thiếu vào lời bài hát',
        speaker: 'small',
      };
    case 'tf':
      return { title: 'VÒNG TIA CHỚP — đúng hay sai?', main: '', mainStyle: {}, speaker: 'none' };
    case 'gram':
      return {
        title: 'Chọn từ điền vào chỗ trống',
        main: q.g.sent,
        mainStyle: { ...serif, fontSize: 28, lineHeight: 1.7 },
        speaker: 'none',
      };
    case 'conf':
      return {
        title: `${q.c.pair[0]} hay ${q.c.pair[1]}? — chỉ một cái đúng`,
        main: q.c.sent,
        mainStyle: { ...serif, fontSize: 30, lineHeight: 1.7 },
        sub: 'Phím 1 hoặc 2 · sau khi trả lời sẽ có lời giải thích',
        speaker: 'none',
      };
    case 'sent':
      return {
        title: 'Câu này nghĩa là gì?',
        main: q.r.cn,
        mainStyle: { ...serif, fontSize: 27, lineHeight: 1.7 },
        speaker: 'none',
      };
    case 'pass':
      return {
        title: 'Đọc đoạn văn và trả lời câu hỏi',
        main: q.qq.q,
        mainStyle: { ...serif, fontSize: 24, lineHeight: 1.6 },
        speaker: 'small',
      };
    case 'tone':
      return {
        title:
          q.trap === 'sound'
            ? 'Phát âm nào đúng? — coi chừng zh/z · sh/s · ch/c · -n/-ng'
            : 'Từ này đọc đúng thanh điệu nào?',
        main: q.word.h,
        mainStyle: { ...serif, fontSize: 62, lineHeight: 1.2 },
        sub: q.word.m,
        // The listen button only appears after the check: hearing the word is how you
        // confirm a tone, so offering it earlier would answer the question out loud.
        speaker: st.checked ? 'small' : 'none',
      };
    case 'cloze':
      return {
        title: 'Chọn từ điền vào chỗ trống trong câu',
        main: q.sent,
        mainStyle: { ...serif, fontSize: 27, lineHeight: 1.75 },
        sub: q.vi || undefined,
        speaker: 'none',
      };
    case 'build':
      return {
        title: 'Dựng lại câu tiếng Trung từ nghĩa tiếng Việt',
        main: q.vi,
        mainStyle: { fontSize: 25, fontWeight: 800, lineHeight: 1.45 },
        sub: `${q.tlen} từ · bấm số hoặc chạm để xếp`,
        // Nghe trước là được đọc luôn đáp án, nên loa chỉ hiện sau khi chấm.
        speaker: st.checked ? 'small' : 'none',
      };
    case 'sdict':
      return {
        title: 'Nghe cả câu rồi gõ lại bằng chữ Hán',
        main: st.checked ? q.sent : '',
        mainStyle: { ...serif, fontSize: 26, lineHeight: 1.7 },
        sub: st.checked ? q.vi || undefined : `Câu có ${q.sent.length} chữ · nghe lại thoải mái`,
        speaker: 'big',
      };
    case 'num':
      return {
        title: 'Nghe rồi chọn đúng con số',
        main: st.checked ? q.d.say : '',
        mainStyle: { ...serif, fontSize: 28, lineHeight: 1.6 },
        sub: st.checked ? q.d.vi : undefined,
        speaker: 'big',
      };
    case 'fix':
      return {
        title: 'Câu này sai một chỗ — chỗ nào?',
        main: q.f.parts.join(''),
        mainStyle: { ...serif, fontSize: 27, lineHeight: 1.8 },
        sub: q.f.vi,
        speaker: st.checked ? 'small' : 'none',
      };
    case 'collo':
      return {
        title: `Từ nào đi được với chỗ trống? — "${q.c.vi}"`,
        main: q.c.frame,
        mainStyle: { ...serif, fontSize: 34, lineHeight: 1.6 },
        sub: 'Bốn từ đều dịch ra tiếng Việt gần giống nhau — chỉ một từ ghép được',
        speaker: st.checked ? 'small' : 'none',
      };
    case 'order':
      return {
        title: 'Sắp xếp thành câu đúng',
        main: q.o.vi,
        mainStyle: { fontSize: 26, fontWeight: 800, lineHeight: 1.4 },
        sub: 'Bấm số hoặc chạm để xếp các từ theo đúng thứ tự',
        speaker: 'none',
      };
  }
}

export const SMALL_SPEAKER: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 99,
  border: `2px solid ${C.ink}`,
  background: C.soft,
  fontSize: 19,
  cursor: 'pointer',
  marginBottom: 10,
  boxShadow: '2px 2px 0 ' + C.ink,
};

export const BIG_SPEAKER: CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: 99,
  border: `3px solid ${C.ink}`,
  background: C.purple,
  fontSize: 40,
  cursor: 'pointer',
  boxShadow: '4px 4px 0 ' + C.ink,
  animation: 'pulse 1.6s ease infinite',
};

/** The hint shown next to the check button, per question kind. */
export function hintFor(q: Question): string {
  if (q.kind === 'build') return `Phím 1–${q.tiles.length} xếp từ · Backspace xoá · Enter kiểm tra`;
  if (q.kind === 'sdict') return 'Nghe 🔊 bao nhiêu lần cũng được · gõ đúng ≥90% số chữ là qua';
  if (q.kind === 'num') return 'Nghe 🔊 rồi chọn con số · Enter kiểm tra';
  if (q.kind === 'fix') return 'Phím 1–4 chọn mảnh sai · Enter kiểm tra';
  if (q.kind === 'collo') return 'Phím 1–4 chọn từ · Enter kiểm tra';
  if (q.kind === 'write' || q.kind === 'order') {
    return `Phím 1–${q.tiles.length} chọn · Backspace xoá · Enter kiểm tra`;
  }
  if (q.kind === 'match') return 'Phím 1–4 chọn chữ Hán · 5–8 chọn nghĩa · bấm nhầm không sao, chọn lại nhé';
  if (q.kind === 'tf') return 'Phím 1 = ĐÚNG · 2 = SAI · nhanh lên, đồng hồ đang chạy!';
  if (q.kind === 'dict') return 'Nghe 🔊 rồi gõ lại chữ Hán · Enter kiểm tra';
  if (q.kind === 'type') return 'Gõ chữ Hán bằng bộ gõ tiếng Trung · Enter kiểm tra';
  if (q.kind === 'conf') return 'Phím 1 · 2 chọn từ · Enter kiểm tra';
  if (q.kind === 'tone') return 'Nhớ lại thanh điệu trước — nghe 🔊 sau khi kiểm tra để đối chiếu';
  if (q.kind === 'cloze') return 'Đọc cả câu rồi chọn từ hợp nghĩa · Enter kiểm tra';
  return `Phím 1–${'opts' in q ? q.opts.length : 0} chọn đáp án · Enter kiểm tra`;
}
