import { useEffect, useMemo, useRef, useState } from 'react';
import { EXAM_1 } from '../../data/exam1';
import {
  flatten,
  guideFor,
  isAutoGraded,
  isRight,
  partQuestions,
  passageFor,
  writtenMatches,
  type DrillBest,
  type ExamAnswer,
  type PartId,
  type SelfMark,
} from '../../engine/exam';
import { KEYS, load, save } from '../../engine/storage';
import { useEngine } from '../../engine/useEngine';
import { C, F, shadow } from '../../theme';
import { QuestionView, ReviewBody } from './Question';

type Phase = 'guide' | 'practice' | 'done';

/** One flattening of the paper, shared by every part. */
const PAPER = flatten(EXAM_1);

const btn = (bg: string, color = '#fff') => ({
  background: bg,
  color,
  border: `3px solid ${C.ink}`,
  borderRadius: 14,
  padding: '12px 26px',
  fontSize: 16,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: F.ui,
  boxShadow: shadow(3),
});

const card = {
  background: C.card,
  border: `3px solid ${C.ink}`,
  borderRadius: 22,
  boxShadow: shadow(5),
  padding: '22px 26px',
  width: '100%',
  maxWidth: 820,
} as const;

const heading = {
  fontSize: 12.5,
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '.06em',
  color: C.muted,
  margin: '18px 0 8px',
};

/**
 * Learn one part of the paper, then practise just that part.
 *
 * The full mock answers "am I ready"; it cannot answer "what should I do
 * differently", because by the time you see the score the technique has already been
 * used up. So this mode teaches the method first and marks every question the moment
 * it is answered — the opposite of the exam on purpose.
 */
export function PartDrill({ part, onExit }: { part: PartId; onExit: () => void }) {
  const engine = useEngine();
  const guide = guideFor(part);
  const qs = useMemo(() => partQuestions(PAPER, part), [part]);

  const [phase, setPhase] = useState<Phase>('guide');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>(() => Array(qs.length).fill(null));
  const [marks, setMarks] = useState<SelfMark[]>(() => Array(qs.length).fill(undefined));
  const [checked, setChecked] = useState(false);
  const played = useRef(new Set<number>());

  const { q } = qs[i] ?? qs[0];
  const answer = answers[i];
  const isListening = guide.section === 'listen';

  const speak = () => {
    const lines = q.kind === 'tf' ? [q.item.say] : q.kind === 'qa' ? (q.item.say ?? []) : [];
    if (lines.length) engine.audio.speak(lines.join('……'));
  };

  // Auto-play once on arrival. Unlike the exam, the replay button below stays
  // available: this is where you are still learning to hear the thing.
  useEffect(() => {
    if (phase !== 'practice' || !isListening || played.current.has(i)) return;
    played.current.add(i);
    speak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, phase, isListening]);

  const right = qs.filter((x, k) => isRight(x.q, answers[k], marks[k])).length;

  // Saved only from the summary screen, so an abandoned run never overwrites a best.
  const saveBest = () => {
    const all = load<DrillBest>(KEYS.drill, {});
    const prev = all[part];
    if (!prev || right >= prev.right) {
      save(KEYS.drill, { ...all, [part]: { right, count: qs.length, at: Date.now() } });
    }
  };

  const restart = () => {
    played.current.clear();
    setAnswers(Array(qs.length).fill(null));
    setMarks(Array(qs.length).fill(undefined));
    setI(0);
    setChecked(false);
    setPhase('practice');
  };

  // -- guide ----------------------------------------------------------------

  if (phase === 'guide') {
    const best = load<DrillBest>(KEYS.drill, {})[part];
    return (
      <Shell>
        <div style={card}>
          <button onClick={onExit} style={{ ...btn(C.card, C.ink), padding: '7px 16px', fontSize: 13 }}>
            ← Danh sách các phần
          </button>

          <h2 style={{ margin: '14px 0 2px', fontSize: 26, fontWeight: 800 }}>
            <span style={{ fontFamily: F.han }}>{guide.id}</span>
          </h2>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.gold }}>
            {guide.vi} · <span style={{ fontFamily: F.han }}>{guide.task}</span>
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: C.muted }}>
            {guide.count} câu trong đề thật · khoảng {guide.secPerQ} giây/câu
            {best && ` · lần tốt nhất của bạn: ${best.right}/${best.count}`}
          </p>

          <p style={{ margin: 0, fontSize: 15, color: C.body, fontWeight: 600, lineHeight: 1.6 }}>
            {guide.what}
          </p>

          <div style={heading}>Cách làm</div>
          <ol style={{ margin: 0, paddingLeft: 22, fontSize: 14.5, color: C.body, lineHeight: 1.65 }}>
            {guide.steps.map((s) => (
              <li key={s} style={{ marginBottom: 6, fontWeight: 600 }}>
                {s}
              </li>
            ))}
          </ol>

          <div style={heading}>Bẫy hay dính</div>
          <ul style={{ margin: 0, paddingLeft: 22, fontSize: 14.5, color: C.badInk, lineHeight: 1.65 }}>
            {guide.traps.map((t) => (
              <li key={t} style={{ marginBottom: 6, fontWeight: 600 }}>
                {t}
              </li>
            ))}
          </ul>

          <div
            style={{
              background: C.okBg,
              border: `2px dashed ${C.green}`,
              borderRadius: 14,
              padding: '10px 16px',
              margin: '18px 0 14px',
              fontSize: 13,
              fontWeight: 700,
              color: C.okInk,
            }}
          >
            💡 Chế độ luyện: chấm ngay từng câu, có giải thích, và {isListening ? 'ĐƯỢC nghe lại' : 'không bấm giờ'}.
            Đề thật thì không — nên khi thấy đã quen tay, hãy làm cả đề để tập điều kiện thật.
          </div>

          <button onClick={restart} style={btn(C.red)}>
            Luyện {qs.length} câu ▶
          </button>
        </div>
      </Shell>
    );
  }

  // -- summary --------------------------------------------------------------

  if (phase === 'done') {
    const pct = qs.length ? Math.round((right / qs.length) * 100) : 0;
    return (
      <Shell>
        <div style={{ ...card, textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 30, fontWeight: 800, color: pct >= 60 ? C.okInk : C.badInk }}>
            {right}/{qs.length} đúng · {pct}%
          </h2>
          <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.muted, fontSize: 14 }}>
            <span style={{ fontFamily: F.han }}>{guide.id}</span> — {guide.vi}
          </p>

          {pct < 60 && (
            <p style={{ fontSize: 14, color: C.body, fontWeight: 600, maxWidth: 520, margin: '0 auto 14px' }}>
              Dưới 60% ở một phần đơn lẻ nghĩa là kỹ thuật chưa vào, không phải bạn yếu từ vựng. Đọc lại
              phần "Cách làm" rồi luyện lại — nhanh hơn nhiều so với cày thêm từ.
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={restart} style={btn(C.ink, C.soft)}>
              Luyện lại
            </button>
            <button onClick={() => setPhase('guide')} style={btn(C.card, C.ink)}>
              Xem lại cách làm
            </button>
            <button onClick={onExit} style={btn(C.card, C.ink)}>
              ← Danh sách các phần
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // -- practice -------------------------------------------------------------

  const ok = isRight(q, answer, marks[i]);
  const needsMark = checked && !isAutoGraded(q);
  const last = i + 1 >= qs.length;
  const answered = answer !== null && answer !== '';

  return (
    <Shell>
      <div style={{ width: '100%', maxWidth: 820 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 12,
            background: C.card,
            border: `3px solid ${C.ink}`,
            borderRadius: 18,
            padding: '10px 16px',
          }}
        >
          <button
            onClick={() => {
              engine.audio.hush();
              setPhase('guide');
            }}
            style={{ ...btn(C.card, C.ink), padding: '5px 12px', fontSize: 13, boxShadow: 'none' }}
          >
            ✕
          </button>
          <span style={{ fontFamily: F.han, fontSize: 17, fontWeight: 900 }}>{guide.id}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: C.muted }}>
            Câu {i + 1}/{qs.length} · đúng {right}
          </span>
        </div>

        <div style={{ ...card, minHeight: 240 }}>
          <QuestionView
            q={q}
            at={i}
            answer={answer}
            onAnswer={(v) =>
              setAnswers((a) => {
                const out = a.slice();
                out[i] = v;
                return out;
              })
            }
            passage={q.kind === 'qa' ? passageFor(qs, i) : undefined}
            locked={checked}
          />

          {isListening && !checked && (
            <button
              onClick={speak}
              style={{ ...btn(C.purple), marginTop: 14, padding: '8px 20px', fontSize: 14 }}
            >
              🔊 Nghe lại
            </button>
          )}
        </div>

        {checked && (
          <div
            style={{
              background: ok ? C.okBg : C.badBg,
              border: `3px solid ${ok ? C.green : C.red}`,
              borderRadius: 18,
              padding: '14px 18px',
              marginTop: 12,
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: ok ? C.okInk : C.badInk, marginBottom: 6 }}>
              {needsMark ? '✍️ Tự chấm câu này' : ok ? '✓ Chính xác' : '✗ Chưa đúng'}
            </div>
            <ReviewBody q={q} answer={answer} />

            {needsMark && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() =>
                      setMarks((m) => {
                        const out = m.slice();
                        out[i] = v;
                        return out;
                      })
                    }
                    style={{
                      border: `2px solid ${C.ink}`,
                      background: marks[i] === v ? (v ? C.green : C.red) : C.card,
                      color: marks[i] === v ? '#fff' : C.ink,
                      borderRadius: 99,
                      padding: '5px 18px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: F.ui,
                    }}
                  >
                    {v ? 'Tôi viết đúng' : 'Tôi viết sai'}
                  </button>
                ))}
                {writtenMatches(q, typeof answer === 'string' ? answer : '') && (
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.okInk }}>
                    Khớp đáp án mẫu ✓
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 14 }}>
          {!checked ? (
            <button
              onClick={() => setChecked(true)}
              disabled={!answered}
              style={{ ...btn(answered ? C.ink : C.edge, C.soft), cursor: answered ? 'pointer' : 'default' }}
            >
              Kiểm tra
            </button>
          ) : (
            <button
              onClick={() => {
                engine.audio.hush();
                if (last) {
                  saveBest();
                  setPhase('done');
                } else {
                  setI(i + 1);
                  setChecked(false);
                }
              }}
              style={btn(ok ? C.green : C.red)}
            >
              {last ? 'Xem kết quả' : 'Câu tiếp theo →'}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '24px 16px 60px',
      }}
    >
      {children}
    </div>
  );
}

