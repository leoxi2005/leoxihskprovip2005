import { useState } from 'react';
import { PICS } from '../../data';
import {
  isAutoGraded,
  isRight,
  writtenMatches,
  type ExamAnswer,
  type ExamQ,
  type SectionId,
  type SelfMark,
} from '../../engine/exam';
import { C, F, shadow } from '../../theme';

/**
 * Rendering for one exam question, and for its answer key.
 *
 * Shared by the timed paper and the part-by-part practice mode: the two differ in
 * pacing and feedback, never in what a question looks like.
 */

// -- one question -----------------------------------------------------------

const optionBtn = (picked: boolean) => ({
  display: 'block',
  width: '100%',
  textAlign: 'left' as const,
  background: picked ? C.soft : C.card,
  border: `3px solid ${picked ? C.ochre : C.edge}`,
  borderRadius: 14,
  padding: '12px 16px',
  marginBottom: 8,
  fontSize: 17,
  fontFamily: F.han,
  fontWeight: 700,
  cursor: 'pointer',
  color: C.ink,
});

const LABELS = ['A', 'B', 'C', 'D'];

export function QuestionView({
  q,
  at,
  answer,
  onAnswer,
  passage,
  locked = false,
}: {
  q: ExamQ;
  at: number;
  answer: ExamAnswer;
  onAnswer: (v: ExamAnswer) => void;
  passage?: string;
  /** Practice mode freezes the answer once it has been marked. */
  locked?: boolean;
}) {
  const pick = (v: ExamAnswer) => {
    if (!locked) onAnswer(v);
  };
  const han = { fontFamily: F.han, fontSize: 20, lineHeight: 1.9, fontWeight: 700 } as const;

  switch (q.kind) {
    case 'tf':
      return (
        <>
          <Note>🎧 Nghe đoạn ghi âm rồi phán đoán câu dưới đây ĐÚNG hay SAI. Chỉ nghe một lần.</Note>
          <div style={{ ...han, fontSize: 24, margin: '18px 0 20px' }}>{q.item.stmt}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['✓ ĐÚNG', '✗ SAI'].map((t, k) => {
              // 1 is true, 0 is false — the same order the answer key uses.
              const v = k === 0 ? 1 : 0;
              return (
                <button key={t} onClick={() => pick(v)} style={{ ...optionBtn(answer === v), fontFamily: F.ui, textAlign: 'center' }}>
                  {t}
                </button>
              );
            })}
          </div>
        </>
      );

    case 'qa':
      return (
        <>
          {passage ? (
            <div
              style={{
                ...han,
                background: C.panel,
                border: `2px solid ${C.line}`,
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 14,
                textAlign: 'left',
              }}
            >
              {passage}
            </div>
          ) : (
            <Note>🎧 Nghe rồi chọn đáp án đúng nhất. Câu hỏi nằm trong phần ghi âm — chỉ phát một lần.</Note>
          )}
          {passage && <div style={{ ...han, fontSize: 18, marginBottom: 12 }}>{q.item.q}</div>}
          {q.item.opts.map((o, k) => (
            <button key={k} onClick={() => pick(k)} style={optionBtn(answer === k)}>
              <b style={{ fontFamily: F.ui, marginRight: 10, color: C.muted }}>{LABELS[k]}</b>
              {o}
            </button>
          ))}
        </>
      );

    case 'fill':
      return (
        <>
          <Note>Chọn từ thích hợp điền vào chỗ trống.</Note>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              margin: '12px 0 16px',
              justifyContent: 'center',
            }}
          >
            {q.group.bank.map((w, k) => (
              <button
                key={k}
                onClick={() => pick(k)}
                style={{
                  ...optionBtn(answer === k),
                  width: 'auto',
                  display: 'inline-block',
                  marginBottom: 0,
                  padding: '8px 14px',
                }}
              >
                {w}
              </button>
            ))}
          </div>
          {/* `pre-line` để nhóm hội thoại xuống dòng đúng chỗ: A một dòng, B một dòng. */}
          <div style={{ ...han, fontSize: 22, whiteSpace: 'pre-line' }}>{q.group.items[q.at].sent}</div>
        </>
      );

    case 'order': {
      const picked = typeof answer === 'string' ? answer : '';
      return (
        <>
          <Note>Sắp xếp ba câu thành một đoạn văn hợp lý — bấm theo thứ tự đúng.</Note>
          <div style={{ margin: '14px 0' }}>
            {q.item.parts.map((p, k) => {
              const pos = picked.indexOf(String(k));
              return (
                <button
                  key={k}
                  onClick={() =>
                    pick(picked.includes(String(k)) ? picked.replace(String(k), '') : picked + k)
                  }
                  style={optionBtn(pos >= 0)}
                >
                  <b style={{ fontFamily: F.ui, marginRight: 10, color: C.muted }}>{LABELS[k]}</b>
                  {p}
                  {pos >= 0 && (
                    <span style={{ float: 'right', fontFamily: F.ui, color: C.red, fontWeight: 800 }}>
                      {pos + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>
            Thứ tự đang chọn:{' '}
            {picked
              .split('')
              .map((c) => LABELS[+c])
              .join(' → ') || '—'}
          </div>
        </>
      );
    }

    case 'sent':
      return (
        <>
          <Note>Dùng TẤT CẢ các từ dưới đây viết thành một câu hoàn chỉnh.</Note>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '16px 0' }}>
            {/* Khoá theo VỊ TRÍ chứ không theo chữ: câu 一边…一边 có hai mảnh giống hệt
                nhau, khoá trùng thì React giữ lại ô cũ và nó trôi sang câu kế tiếp. */}
            {q.item.words.map((w, i) => (
              <span
                key={i}
                style={{
                  fontFamily: F.han,
                  fontSize: 21,
                  fontWeight: 700,
                  background: C.soft,
                  border: `2px solid ${C.ink}`,
                  borderRadius: 12,
                  padding: '6px 14px',
                }}
              >
                {w}
              </span>
            ))}
          </div>
          <Writing at={at} value={typeof answer === 'string' ? answer : ''} onAnswer={pick} locked={locked} />
        </>
      );

    case 'pic': {
      // CHỈ tra trong PICS. Bản cũ lùi về `IMAGES[word]` khi không thấy ảnh riêng, và
      // đúng hai từ (修理, 讨论) có thẻ từ vựng nên lọt vào đây — mà thẻ từ vựng vẽ sẵn
      // biểu tượng của chính từ đó quanh khung, tức là in đáp án lên đề.
      const img = PICS[q.item.img ?? q.item.word];
      return (
        <>
          <Note>Nhìn tranh và dùng từ cho sẵn viết MỘT câu.</Note>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '14px 0', flexWrap: 'wrap' }}>
            {img ? (
              <div
                role="img"
                aria-label={q.item.scene}
                style={{
                  // Tranh giờ LÀ đề bài, không còn là ảnh minh hoạ cho một dòng mô tả —
                  // ở 150px người làm phải nheo mắt đoán cảnh thay vì đọc nó.
                  width: 'min(280px, 60vw)',
                  height: 'min(280px, 60vw)',
                  borderRadius: 16,
                  border: `3px solid ${C.ink}`,
                  boxShadow: shadow(3),
                  backgroundImage: `url("${img}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: C.panel,
                  border: `2px dashed ${C.edge}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.body,
                }}
              >
                🖼️ {q.item.scene}
              </div>
            )}
            <span
              style={{
                fontFamily: F.han,
                fontSize: 30,
                fontWeight: 800,
                background: C.soft,
                border: `2px solid ${C.ink}`,
                borderRadius: 14,
                padding: '8px 20px',
              }}
            >
              {q.item.word}
            </span>
          </div>
          <Writing at={at} value={typeof answer === 'string' ? answer : ''} onAnswer={pick} locked={locked} />
        </>
      );
    }
  }
}

/**
 * The writing box.
 *
 * Keyed by question index so React swaps the DOM node between questions instead of
 * carrying one field's text and caret across to the next.
 */
function Writing({
  at,
  value,
  onAnswer,
  locked,
}: {
  at: number;
  value: string;
  onAnswer: (v: string) => void;
  locked?: boolean;
}) {
  return (
    <textarea
      key={at}
      value={value}
      onChange={(e) => onAnswer(e.target.value)}
      readOnly={locked}
      placeholder="Gõ câu tiếng Trung của bạn (dùng bộ gõ tiếng Trung)…"
      rows={3}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: F.han,
        fontSize: 20,
        fontWeight: 700,
        color: C.ink,
        background: C.card,
        border: `3px solid ${C.ink}`,
        borderRadius: 14,
        padding: '12px 16px',
        outline: 'none',
        resize: 'vertical',
      }}
    />
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '.05em',
        color: C.muted,
      }}
    >
      {children}
    </div>
  );
}

// -- review -----------------------------------------------------------------

export function ReviewList({
  qs,
  answers,
  marks,
  onMark,
}: {
  qs: { section: SectionId; q: ExamQ }[];
  answers: ExamAnswer[];
  marks: SelfMark[];
  onMark: (at: number, v: boolean) => void;
}) {
  const [openOnly, setOpenOnly] = useState<'all' | 'wrong'>('wrong');

  const rows = qs
    .map((x, k) => ({ ...x, k }))
    .filter((x) => openOnly === 'all' || !isRight(x.q, answers[x.k], marks[x.k]));

  return (
    <>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        {(['wrong', 'all'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setOpenOnly(v)}
            style={{
              border: `2px solid ${openOnly === v ? C.ink : C.edge}`,
              background: openOnly === v ? C.ink : C.card,
              color: openOnly === v ? C.soft : C.muted,
              borderRadius: 99,
              padding: '5px 16px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: F.ui,
            }}
          >
            {v === 'wrong' ? 'Chỉ câu sai' : 'Tất cả 100 câu'}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: '52vh', overflow: 'auto', textAlign: 'left' }}>
        {rows.map(({ q, k }) => {
          const ok = isRight(q, answers[k], marks[k]);
          return (
            <div
              key={k}
              style={{
                background: ok ? C.okBg : C.badBg,
                border: `2px solid ${ok ? C.green : C.red}`,
                borderRadius: 14,
                padding: '10px 14px',
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>
                Câu {k + 1} · <span style={{ fontFamily: F.han }}>{q.part}</span> {ok ? '✓' : '✗'}
              </div>
              <ReviewBody q={q} answer={answers[k]} />
              {!isAutoGraded(q) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.body }}>Tự chấm:</span>
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      onClick={() => onMark(k, v)}
                      style={{
                        border: `2px solid ${C.ink}`,
                        background: marks[k] === v ? (v ? C.green : C.red) : C.card,
                        color: marks[k] === v ? '#fff' : C.ink,
                        borderRadius: 99,
                        padding: '3px 14px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: F.ui,
                      }}
                    >
                      {v ? 'Đúng' : 'Sai'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!rows.length && (
          <p style={{ textAlign: 'center', fontWeight: 700, color: C.okInk }}>
            Không sai câu nào trong nhóm này 🎉
          </p>
        )}
      </div>
    </>
  );
}

export function ReviewBody({ q, answer }: { q: ExamQ; answer: ExamAnswer }) {
  const han = { fontFamily: F.han, fontSize: 16, fontWeight: 700, lineHeight: 1.7 } as const;
  const vi = { fontSize: 13, color: C.body, fontWeight: 600, marginTop: 4, lineHeight: 1.5 } as const;

  switch (q.kind) {
    case 'tf':
      return (
        <>
          <div style={han}>
            {q.item.stmt} → đáp án: <b>{q.item.ok ? 'ĐÚNG' : 'SAI'}</b>
          </div>
          <div style={han}>🎧 {q.item.say}</div>
          <div style={vi}>{q.item.vi}</div>
        </>
      );
    case 'qa':
      return (
        <>
          <div style={han}>
            {q.item.q} → <b>{LABELS[q.item.ans]}. {q.item.opts[q.item.ans]}</b>
            {typeof answer === 'number' && answer !== q.item.ans && (
              <span style={{ color: C.badInk }}> (bạn chọn {LABELS[answer]})</span>
            )}
          </div>
          {q.item.say?.length ? <div style={han}>🎧 {q.item.say.join(' ')}</div> : null}
          <div style={vi}>{q.item.vi}</div>
        </>
      );
    case 'fill': {
      const it = q.group.items[q.at];
      return (
        <>
          <div style={{ ...han, whiteSpace: 'pre-line' }}>
            {it.sent.replace('（　）', `（${q.group.bank[it.ans]}）`)}
          </div>
          <div style={vi}>{it.vi}</div>
        </>
      );
    }
    case 'order':
      return (
        <>
          {/* Nhãn tính từ `ans` chứ không lấy từ dữ liệu. Bản cũ ghi sẵn "B → A → C"
              vào chính câu dịch, mà từ khi các mảnh được xáo lúc rút đề thì cái nhãn
              ghi sẵn ấy trỏ vào ô của một lần bày khác. */}
          <div style={{ ...vi, fontWeight: 800 }}>
            Thứ tự đúng: {q.item.ans.map((n) => 'ABC'[n]).join(' → ')}
          </div>
          <div style={han}>
            {q.item.ans.map((n) => q.item.parts[n]).join(' ')}
          </div>
          <div style={vi}>{q.item.vi}</div>
        </>
      );
    case 'sent':
      return (
        <>
          <div style={han}>Đáp án mẫu: {q.item.accept[0]}</div>
          <div style={han}>Bạn viết: {typeof answer === 'string' && answer ? answer : '— (bỏ trống)'}</div>
          <div style={vi}>
            {q.item.vi}
            {typeof answer === 'string' && answer && !writtenMatches(q, answer)
              ? ' · Khác đáp án mẫu không có nghĩa là sai — hãy tự chấm.'
              : ''}
          </div>
        </>
      );
    case 'pic':
      return (
        <>
          <div style={han}>
            Từ cho sẵn: {q.item.word} · Câu mẫu: {q.item.sample}
          </div>
          <div style={han}>Bạn viết: {typeof answer === 'string' && answer ? answer : '— (bỏ trống)'}</div>
          <div style={vi}>{q.item.vi}</div>
        </>
      );
  }
}
