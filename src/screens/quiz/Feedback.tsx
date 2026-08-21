import type { CSSProperties, ReactNode } from 'react';
import { IMAGES, STORIES } from '../../data';
import { diffChars } from '../../engine/diff';
import { NUM_CAT_LABEL } from '../../engine/numbers';
import { toneName, tonePattern, toneSpots } from '../../engine/pinyin';
import { hanOnly } from '../../engine/segment';
import { C, F } from '../../theme';
import type { GameState, Question } from '../../engine/types';
import { useEngine } from '../../engine/useEngine';

interface FeedbackView {
  hanzi: ReactNode;
  hanziStyle: CSSProperties;
  pinyin?: string;
  meaning: string;
  /** Extra explanation — example sentence, grammar note, why the TF was false. */
  note?: string;
  /** Vietnamese mnemonic. */
  story?: string;
  /** Hanzi key for the illustration. */
  imgKey?: string;
}

const BIG_HANZI: CSSProperties = { fontFamily: F.han, fontSize: 36, fontWeight: 700 };
const SENT_HANZI: CSSProperties = { fontFamily: F.han, fontSize: 21, fontWeight: 700, lineHeight: 1.5 };

/**
 * Bài chép chính tả hiện lại câu gốc, tô đúng chỗ lệch: chữ gõ đúng để đen, chữ bỏ
 * sót gạch đỏ, chữ gõ thừa gạch ngang. Chỉ nói "sai rồi" thì người học không biết
 * mình nghe hụt chỗ nào.
 */
function dictMarks(typed: string, target: string): ReactNode {
  const { marks } = diffChars(hanOnly(typed), target);
  return (
    <span>
      {marks.map((m, i) => (
        <span
          key={i}
          style={{
            color: m.kind === 'ok' ? C.ink : m.kind === 'miss' ? C.red : C.muted2,
            background: m.kind === 'miss' ? '#f7d9d2' : 'transparent',
            textDecoration: m.kind === 'extra' ? 'line-through' : 'none',
            borderRadius: 4,
            padding: m.kind === 'miss' ? '0 2px' : 0,
          }}
        >
          {m.ch}
        </span>
      ))}
    </span>
  );
}

/** What the panel reveals — pinyin included, which the question itself never shows. */
function feedbackView(q: Question, st: GameState): FeedbackView {
  switch (q.kind) {
    case 'song':
      return {
        hanzi: q.line.cn,
        hanziStyle: SENT_HANZI,
        pinyin: q.line.pin,
        meaning: q.line.vi,
        note: `${q.word2.h} (${q.word2.p}) — ${q.word2.m}`,
      };
    case 'tf':
      return {
        hanzi: q.w.h,
        hanziStyle: BIG_HANZI,
        pinyin: q.w.p,
        meaning: (q.w.pos ? q.w.pos + ' · ' : '') + q.w.m,
        note: q.isTrue ? undefined : `Nghĩa hiển thị "${q.shown}" là của từ khác`,
        imgKey: q.w.h,
      };
    case 'match':
      return {
        hanzi: q.pairs.map((w) => w.h).join(' · '),
        hanziStyle: { fontFamily: F.han, fontSize: 26, fontWeight: 700 },
        pinyin: q.pairs.map((w) => w.p).join(' · '),
        meaning: q.pairs.map((w) => `${w.h} = ${w.m}`).join('　'),
      };
    case 'gram': {
      const note = [q.g.name, q.g.expl].filter(Boolean).join(' — ');
      return {
        hanzi: q.g.full,
        hanziStyle: SENT_HANZI,
        pinyin: q.g.pin || undefined,
        meaning: q.g.vi || '',
        note: note || undefined,
      };
    }
    case 'sent':
      return { hanzi: q.r.cn, hanziStyle: SENT_HANZI, pinyin: q.r.pin, meaning: q.r.vi };
    case 'conf':
      // The rule is the whole point of this mode — it carries the explanation.
      return {
        hanzi: q.c.full,
        hanziStyle: SENT_HANZI,
        pinyin: q.c.pin,
        meaning: q.c.vi,
        note: q.c.why,
      };
    case 'tone': {
      const pattern = tonePattern(q.word.p);
      const names = toneSpots(q.word.p)
        .map((s) => toneName(s.tone))
        .join(' + ');
      return {
        hanzi: q.word.h,
        hanziStyle: BIG_HANZI,
        pinyin: q.word.p,
        meaning: (q.word.pos ? q.word.pos + ' · ' : '') + q.word.m,
        note:
          q.trap === 'sound'
            ? `Bẫy phụ âm/vần — đọc kỹ: ${q.word.p}. Nghe 🔊 và lặp lại 3 lần.`
            : `Mẫu thanh ${pattern}${names ? ' — ' + names : ''}`,
        imgKey: q.word.h,
      };
    }
    case 'cloze':
      return {
        hanzi: q.word.ex || q.word.h,
        hanziStyle: SENT_HANZI,
        pinyin: q.word.p,
        meaning: q.vi || (q.word.pos ? q.word.pos + ' · ' : '') + q.word.m,
        note: `${q.word.h} (${q.word.p}) — ${q.word.m}`,
        story: STORIES[q.word.h],
        imgKey: q.word.h,
      };
    case 'order':
      return {
        hanzi: q.o.tokens.join(''),
        hanziStyle: SENT_HANZI,
        pinyin: q.o.py || undefined,
        meaning: q.o.vi,
        note: q.o.tip || undefined,
      };
    case 'build':
      return {
        hanzi: q.ansStr,
        hanziStyle: SENT_HANZI,
        meaning: q.vi,
        note: `${q.word.h} (${q.word.p}) — ${q.word.m}`,
        story: STORIES[q.word.h],
        imgKey: q.word.h,
      };
    case 'sdict':
      return {
        hanzi: dictMarks(st.typedText, q.sent),
        hanziStyle: SENT_HANZI,
        pinyin: q.word.p,
        meaning: q.vi || q.word.m,
        note: `Chữ tô đỏ là chữ bạn nghe hụt · chữ gạch ngang là chữ gõ thừa. Từ khoá: ${q.word.h} (${q.word.p}) — ${q.word.m}`,
        imgKey: q.word.h,
      };
    case 'num':
      return {
        hanzi: q.d.say,
        hanziStyle: SENT_HANZI,
        meaning: `${NUM_CAT_LABEL[q.d.cat]} · ${q.d.label} — ${q.d.vi}`,
        note: q.d.why,
      };
    case 'fix':
      return {
        hanzi: q.f.right,
        hanziStyle: SENT_HANZI,
        pinyin: q.f.pin,
        meaning: q.f.vi,
        note: `Chỗ sai là mảnh ${q.f.bad + 1} "${q.f.parts[q.f.bad]}" — ${q.f.why}`,
      };
    case 'collo':
      return {
        hanzi: q.c.full,
        hanziStyle: SENT_HANZI,
        pinyin: q.c.pin,
        meaning: q.c.vi,
        note: q.c.why,
      };
    case 'pass':
      return {
        hanzi: q.qq.opts[q.qq.correct],
        hanziStyle: SENT_HANZI,
        meaning: q.p.vi ? 'Dịch đoạn: ' + q.p.vi : '',
        note: q.qq.expl || undefined,
      };
    default:
      return {
        hanzi: q.word.h,
        hanziStyle: BIG_HANZI,
        pinyin: q.word.p,
        meaning: (q.word.pos ? q.word.pos + ' · ' : '') + q.word.m,
        note: q.word.ex ? 'Ví dụ: ' + q.word.ex + (q.word.exVi ? ' — ' + q.word.exVi : '') : undefined,
        story: STORIES[q.word.h],
        imgKey: q.word.h,
      };
  }
}

/** The colored panel that slides up after a check. */
export function Feedback({ q, st }: { q: Question; st: GameState }) {
  const engine = useEngine();
  const v = feedbackView(q, st);
  const ok = st.correct;
  const img = v.imgKey ? IMAGES[v.imgKey] : undefined;
  const last = st.qi + 1 >= st.session.length;

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: ok ? C.okBg : C.badBg,
        borderTop: `3px solid ${ok ? C.green : C.red}`,
        padding: '16px 20px 20px',
        zIndex: 60,
        animation: 'fadeup .25s ease',
        maxHeight: '46vh',
        overflow: 'auto',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {img && (
          <div
            role="img"
            aria-label="Ảnh gợi nhớ"
            style={{
              width: 110,
              height: 110,
              borderRadius: 16,
              border: `3px solid ${C.ink}`,
              boxShadow: '3px 3px 0 ' + C.ink,
              flexShrink: 0,
              backgroundImage: `url("${img}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        <div style={{ flex: 1, minWidth: 260, textAlign: 'left' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: ok ? C.okInk : C.badInk }}>{st.fbMsg}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
            <span style={v.hanziStyle}>{v.hanzi}</span>
            <button
              onClick={engine.playPrompt}
              title="Nghe lại"
              aria-label="Nghe lại"
              style={{
                width: 38,
                height: 38,
                borderRadius: 99,
                border: `2px solid ${C.ink}`,
                background: C.card,
                fontSize: 16,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              🔊
            </button>
          </div>
          {v.pinyin && <div style={{ fontWeight: 800, color: C.gold, fontSize: 17, marginTop: 2 }}>{v.pinyin}</div>}
          <div style={{ fontSize: 16, color: C.body, marginTop: 5, fontWeight: 600 }}>{v.meaning}</div>
          {v.note && (
            <div style={{ marginTop: 6, fontSize: 14, color: '#7d6c4e', fontWeight: 600, lineHeight: 1.5 }}>
              💡 {v.note}
            </div>
          )}
          {v.story && (
            <div style={{ marginTop: 6, fontSize: 14, color: '#7d6c4e', fontWeight: 600, lineHeight: 1.5 }}>
              🧠 {v.story}
            </div>
          )}
        </div>

        <button
          onClick={engine.next}
          style={{
            background: ok ? C.green : C.red,
            color: '#fff',
            border: `3px solid ${C.ink}`,
            borderRadius: 14,
            padding: '14px 32px',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '3px 3px 0 ' + C.ink,
            fontFamily: F.ui,
            whiteSpace: 'nowrap',
          }}
        >
          {last ? 'Kết quả ⏎' : 'Tiếp tục ⏎'}
        </button>
      </div>
    </div>
  );
}
