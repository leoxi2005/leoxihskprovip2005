import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EXAM_1 } from '../data/exam1';
import {
  EXAM_SPEC,
  PART_GUIDES,
  PASS_MARK,
  flatten,
  isAutoGraded,
  partQuestions,
  passageFor,
  score,
  sectionRanges,
  type DrillBest,
  type ExamAnswer,
  type PartId,
  type SectionId,
  type SelfMark,
} from '../engine/exam';
import { PartDrill } from './exam/PartDrill';
import { QuestionView, ReviewList } from './exam/Question';
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
  /** Set while practising a single part instead of sitting the whole paper. */
  const [drill, setDrill] = useState<PartId | null>(null);
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

  if (drill) return <PartDrill part={drill} onExit={() => setDrill(null)} />;

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

          <PartMenu onPick={setDrill} />

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


/**
 * The eight parts of the paper, each openable on its own.
 *
 * Sitting 95 minutes cold is the wrong first move: it measures you before you have
 * been taught the technique for any single part. This is the way in.
 */
function PartMenu({ onPick }: { onPick: (id: PartId) => void }) {
  const best = load<DrillBest>(KEYS.drill, {});

  return (
    <section style={{ textAlign: 'left', margin: '18px 0 4px' }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          color: C.muted,
          marginBottom: 4,
        }}
      >
        Hoặc luyện từng phần một
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: C.muted2, lineHeight: 1.5 }}>
        Mỗi phần có hướng dẫn cách làm và bẫy hay dính, rồi luyện riêng phần đó — chấm ngay từng câu,
        không bấm giờ.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
        {PART_GUIDES.map((g) => {
          const b = best[g.id];
          const pct = b && b.count ? Math.round((b.right / b.count) * 100) : null;
          return (
            <button
              key={g.id}
              onClick={() => onPick(g.id)}
              className="lift lift-3 lift-static"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                background: C.card,
                border: `2px solid ${C.ink}`,
                borderRadius: 14,
                padding: '10px 14px',
                cursor: 'pointer',
                boxShadow: shadow(3, C.edge),
                fontFamily: F.ui,
                textAlign: 'left',
              }}
            >
              <span style={{ fontFamily: F.han, fontSize: 15, fontWeight: 800 }}>{g.id}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.body }}>{g.vi}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: pct === null ? C.muted2 : pct >= 60 ? C.okInk : C.badInk }}>
                {partQuestions(QS, g.id).length} câu
                {pct === null ? ' · chưa luyện' : ` · tốt nhất ${b!.right}/${b!.count} (${pct}%)`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
