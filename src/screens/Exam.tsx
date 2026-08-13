import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IMAGES } from '../data';
import { EXAM_1 } from '../data/exam1';
import {
  EXAM_SPEC,
  PASS_MARK,
  flatten,
  isAutoGraded,
  isRight,
  passageFor,
  score,
  sectionRanges,
  writtenMatches,
  type ExamAnswer,
  type ExamQ,
  type SectionId,
  type SelfMark,
} from '../engine/exam';
import { KEYS, load, save } from '../engine/storage';
import { useEngine } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

type Phase = 'intro' | 'sitting' | 'review';

const PAPER = EXAM_1;
const QS = flatten(PAPER);
const RANGES = sectionRanges(QS);
const SEC_OF = (i: number): SectionId => QS[i].section;

/** `mm:ss`, and never negative — a stopped clock reads 00:00, not −00:03. */
const clock = (ms: number): string => {
  const t = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

interface ExamLogRow {
  at: number;
  paper: string;
  total: number;
  sections: number[];
}

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
} as const;

export function Exam() {
  const engine = useEngine();
  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>(() => Array(QS.length).fill(null));
  const [marks, setMarks] = useState<SelfMark[]>(() => Array(QS.length).fill(undefined));
  const [left, setLeft] = useState(0);
  /** Questions whose recording has already played — the paper plays each one once. */
  const played = useRef(new Set<number>());

  const section = SEC_OF(i);
  const spec = EXAM_SPEC.find((s) => s.id === section)!;
  const { q } = QS[i];

  // -- the clock ------------------------------------------------------------

  const enterSection = useCallback((id: SectionId) => {
    const s = EXAM_SPEC.find((x) => x.id === id)!;
    setLeft(s.minutes * 60000);
  }, []);

  const finish = useCallback(() => {
    engine.audio.hush();
    setPhase('review');
    setI(0);
  }, [engine]);

  /**
   * Each section runs on its own clock, exactly as the paper does. Running out does
   * not end the exam — it moves you on to the next section with whatever you have,
   * which is the part candidates most need to rehearse.
   */
  const nextSection = useCallback(() => {
    const order: SectionId[] = ['listen', 'read', 'write'];
    const at = order.indexOf(SEC_OF(i));
    const next = order[at + 1];
    if (!next) return finish();
    setI(RANGES[next][0]);
    enterSection(next);
  }, [i, finish, enterSection]);

  useEffect(() => {
    if (phase !== 'sitting') return;
    const t = setInterval(() => {
      setLeft((ms) => {
        if (ms <= 1000) return 0;
        return ms - 1000;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'sitting' && left === 0) nextSection();
    // `nextSection` is intentionally left out: including it re-fires on every index
    // change, which would skip sections the moment you navigate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  // -- listening ------------------------------------------------------------

  /**
   * Plays a listening item's recording, once and only once.
   *
   * The real HSK 4 plays every listening item a single time and prints no replay
   * button; a mock that let you re-listen would rehearse a test that does not exist.
   */
  useEffect(() => {
    if (phase !== 'sitting' || section !== 'listen') return;
    if (played.current.has(i)) return;
    played.current.add(i);
    const lines = q.kind === 'tf' ? [q.item.say] : q.kind === 'qa' ? (q.item.say ?? []) : [];
    if (!lines.length) return;
    // One utterance with ellipses between turns: chaining separate calls is unreliable
    // because each `speak` cancels the one before it.
    engine.audio.speak(lines.join('……'));
  }, [i, phase, section, q, engine]);

  // -- answering ------------------------------------------------------------

  const setAnswer = (v: ExamAnswer) =>
    setAnswers((a) => {
      const out = a.slice();
      out[i] = v;
      return out;
    });

  const setMark = (at: number, v: boolean) =>
    setMarks((m) => {
      const out = m.slice();
      out[at] = v;
      return out;
    });

  const result = useMemo(
    () => (phase === 'review' ? score(QS, answers, marks) : null),
    [phase, answers, marks],
  );

  // The paper is only worth logging once it has been marked all the way through.
  const pendingMarks = useMemo(
    () => QS.filter((x, k) => !isAutoGraded(x.q) && marks[k] === undefined).length,
    [marks],
  );

  const logged = useRef(false);
  useEffect(() => {
    if (phase !== 'review' || !result || pendingMarks > 0 || logged.current) return;
    logged.current = true;
    const rows = load<ExamLogRow[]>(KEYS.exam, []);
    save(KEYS.exam, [
      ...rows,
      { at: Date.now(), paper: PAPER.id, total: result.total, sections: result.sections.map((s) => s.points) },
    ]);
  }, [phase, result, pendingMarks]);

  // -- screens --------------------------------------------------------------

  if (phase === 'intro') {
    return (
      <Shell>
        <div style={{ ...card, maxWidth: 720 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800 }}>📝 {PAPER.title}</h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.muted }}>
            Mô phỏng đúng cấu trúc đề HSK（四级）— kỳ thi ĐHSP TP.HCM tổ chức. 100 câu · 95 phút · 300 điểm ·
            đạt {PASS_MARK} điểm.
          </p>

          {EXAM_SPEC.map((s) => (
            <div
              key={s.id}
              style={{
                background: C.panel,
                border: `2px solid ${C.line}`,
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 10,
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                <span style={{ fontFamily: F.han }}>{s.cn}</span> · {s.vi} —{' '}
                {s.parts.reduce((n, p) => n + p.count, 0)} câu · {s.minutes} phút · {s.points} điểm
              </div>
              {s.parts.map((p) => (
                <div key={p.cn} style={{ fontSize: 13, color: C.body, marginTop: 4, fontWeight: 600 }}>
                  <span style={{ fontFamily: F.han }}>{p.cn}</span> ({p.count} câu) — {p.task}
                </div>
              ))}
            </div>
          ))}

          <div
            style={{
              background: C.soft,
              border: `2px dashed ${C.red}`,
              borderRadius: 14,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: C.badInk,
              textAlign: 'left',
              margin: '14px 0',
            }}
          >
            ⚠️ Như đề thật: <b>mỗi câu nghe CHỈ MỘT LẦN</b>, không có nút nghe lại. Hết giờ một phần là tự
            động chuyển sang phần sau. Không có phản hồi đúng/sai cho tới khi nộp bài.
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                played.current.clear();
                logged.current = false;
                setAnswers(Array(QS.length).fill(null));
                setMarks(Array(QS.length).fill(undefined));
                setI(0);
                enterSection('listen');
                setPhase('sitting');
              }}
              style={btn(C.red)}
            >
              Bắt đầu thi ▶
            </button>
            <button onClick={engine.goHome} style={btn(C.card, C.ink)}>
              ← Về trang chủ
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  if (phase === 'review' && result) {
    return (
      <Shell>
        <div style={{ ...card, maxWidth: 860, width: '100%' }}>
          <h2 style={{ margin: '0 0 2px', fontSize: 30, fontWeight: 800 }}>
            {result.passed ? '🎉 ĐẠT' : '📉 CHƯA ĐẠT'} — {result.total}/300
          </h2>
          <p style={{ margin: '0 0 14px', fontWeight: 700, color: C.muted, fontSize: 14 }}>
            Cần {PASS_MARK} để đỗ · bỏ trống {result.blank} câu
            {pendingMarks > 0 && ` · còn ${pendingMarks} câu phần Viết bạn cần tự chấm bên dưới`}
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
            {result.sections.map((s, k) => (
              <div
                key={s.id}
                style={{
                  background: C.soft,
                  border: `2px solid ${C.ink}`,
                  borderRadius: 16,
                  padding: '10px 18px',
                  minWidth: 130,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: s.points >= 60 ? C.green : C.red }}>
                  {s.points}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
                  {EXAM_SPEC[k].vi} · {s.right}/{s.count}
                </div>
              </div>
            ))}
          </div>

          <ReviewList qs={QS} answers={answers} marks={marks} onMark={setMark} />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            <button onClick={() => setPhase('intro')} style={btn(C.ink, C.soft)}>
              Thi lại đề này
            </button>
            <button onClick={engine.goHome} style={btn(C.card, C.ink)}>
              ← Về trang chủ
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // -- sitting --------------------------------------------------------------

  const lowTime = left < 5 * 60000;
  const answered = answers.filter((a) => a !== null && a !== '').length;

  return (
    <Shell>
      <div style={{ width: '100%', maxWidth: 860 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 14,
            background: C.card,
            border: `3px solid ${C.ink}`,
            borderRadius: 18,
            padding: '10px 16px',
          }}
        >
          <span style={{ fontFamily: F.han, fontSize: 20, fontWeight: 900 }}>{spec.cn}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.muted }}>{q.part}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>
            Câu {i + 1}/{QS.length} · đã làm {answered}
          </span>
          <span
            style={{
              background: lowTime ? C.red : C.ink,
              color: C.soft,
              borderRadius: 99,
              padding: '5px 16px',
              fontSize: 18,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              animation: lowTime ? 'pulse 1s ease infinite' : undefined,
            }}
          >
            ⏱ {clock(left)}
          </span>
        </div>

        <div style={{ ...card, minHeight: 260 }}>
          <QuestionView
            q={q}
            at={i}
            answer={answers[i]}
            onAnswer={setAnswer}
            passage={q.kind === 'qa' ? passageFor(QS, i) : undefined}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap' }}>
          <button onClick={() => setI((k) => Math.max(RANGES[section][0], k - 1))} style={btn(C.card, C.ink)}>
            ← Câu trước
          </button>
          <button onClick={nextSection} style={btn(C.soft, C.ink)}>
            {section === 'write' ? 'Nộp bài ✓' : 'Kết thúc phần này →'}
          </button>
          <button
            onClick={() => setI((k) => Math.min(RANGES[section][1], k + 1))}
            style={btn(section === 'listen' ? C.purple : C.blue)}
          >
            Câu sau →
          </button>
        </div>

        {/* Only the current section's grid: the paper does not let you work ahead. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, justifyContent: 'center' }}>
          {QS.slice(RANGES[section][0], RANGES[section][1] + 1).map((_, k) => {
            const at = RANGES[section][0] + k;
            const done = answers[at] !== null && answers[at] !== '';
            return (
              <button
                key={at}
                onClick={() => setI(at)}
                aria-label={`Câu ${at + 1}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: `2px solid ${at === i ? C.ink : C.edge}`,
                  background: at === i ? C.ochre : done ? C.okBg : C.card,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: F.ui,
                  color: C.ink,
                }}
              >
                {at + 1}
              </button>
            );
          })}
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

function QuestionView({
  q,
  at,
  answer,
  onAnswer,
  passage,
}: {
  q: ExamQ;
  at: number;
  answer: ExamAnswer;
  onAnswer: (v: ExamAnswer) => void;
  passage?: string;
}) {
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
                <button key={t} onClick={() => onAnswer(v)} style={{ ...optionBtn(answer === v), fontFamily: F.ui, textAlign: 'center' }}>
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
            <button key={k} onClick={() => onAnswer(k)} style={optionBtn(answer === k)}>
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
                onClick={() => onAnswer(k)}
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
          <div style={{ ...han, fontSize: 22 }}>{q.group.items[q.at].sent}</div>
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
                    onAnswer(picked.includes(String(k)) ? picked.replace(String(k), '') : picked + k)
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
            {q.item.words.map((w) => (
              <span
                key={w}
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
          <Writing at={at} value={typeof answer === 'string' ? answer : ''} onAnswer={onAnswer} />
        </>
      );

    case 'pic': {
      const img = q.item.img ? IMAGES[q.item.img] : IMAGES[q.item.word];
      return (
        <>
          <Note>Nhìn tranh (hoặc mô tả) và dùng từ cho sẵn viết MỘT câu.</Note>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '14px 0', flexWrap: 'wrap' }}>
            {img ? (
              <div
                role="img"
                aria-label={q.item.scene}
                style={{
                  width: 150,
                  height: 150,
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
          <Writing at={at} value={typeof answer === 'string' ? answer : ''} onAnswer={onAnswer} />
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
function Writing({ at, value, onAnswer }: { at: number; value: string; onAnswer: (v: string) => void }) {
  return (
    <textarea
      key={at}
      value={value}
      onChange={(e) => onAnswer(e.target.value)}
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

function ReviewList({
  qs,
  answers,
  marks,
  onMark,
}: {
  qs: typeof QS;
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

function ReviewBody({ q, answer }: { q: ExamQ; answer: ExamAnswer }) {
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
          <div style={han}>
            {it.sent.replace('（　）', `（${q.group.bank[it.ans]}）`)}
          </div>
          <div style={vi}>{it.vi}</div>
        </>
      );
    }
    case 'order':
      return (
        <>
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
