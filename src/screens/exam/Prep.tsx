import { useMemo, useState } from 'react';
import { STORIES } from '../../data';
import type { ExamQ, PartId } from '../../engine/exam';
import { guideFor } from '../../engine/exam';
import {
  buildPrep,
  makeCheck,
  toggleShaky,
  type CheckQ,
  type PrepMarks,
  type PrepWord,
} from '../../engine/prep';
import { KEYS, laneId, load, save } from '../../engine/storage';
import { useEngine } from '../../engine/useEngine';
import { C, F, shadow } from '../../theme';

type Step = 'words' | 'grammar' | 'check';

const STEPS: { id: Step; label: string }[] = [
  { id: 'words', label: '① Từ vựng' },
  { id: 'grammar', label: '② Ngữ pháp' },
  { id: 'check', label: '③ Kiểm tra nhanh' },
];

const btn = (bg: string, color = '#fff') => ({
  background: bg,
  color,
  border: `3px solid ${C.ink}`,
  borderRadius: 14,
  padding: '11px 24px',
  fontSize: 15,
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
  padding: '20px 24px',
  width: '100%',
  maxWidth: 880,
} as const;

const heading = {
  fontSize: 12.5,
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '.06em',
  color: C.muted,
  margin: '20px 0 8px',
};

/** Nhãn cấp độ của một từ — đủ để biết nên ngạc nhiên hay không khi thấy nó lạ. */
const LEVEL_TAG: Record<number, { text: string; bg: string }> = {
  3: { text: 'HSK 3', bg: C.blue },
  4: { text: 'HSK 4', bg: C.red },
};

/**
 * Ôn từ và ngữ pháp của đúng buổi luyện sắp tới.
 *
 * Đứng giữa trang hướng dẫn và câu hỏi đầu tiên, và đó là toàn bộ lý do nó tồn tại:
 * ôn từ ở một màn hình khác, một lúc khác thì lúc vào đề vẫn không nhận ra chữ. Ở
 * đây, từ vừa xem xong là gặp lại ngay trong câu — cùng một buổi, cùng một câu văn.
 *
 * Ba bước, và bước nào cũng bỏ qua được. Bắt học xong mới cho làm bài là cách chắc
 * chắn nhất để người ta thôi bấm vào phần luyện.
 */
export function Prep({
  part,
  qs,
  onStart,
  onBack,
}: {
  part: PartId;
  qs: { q: ExamQ }[];
  onStart: () => void;
  onBack: () => void;
}) {
  const engine = useEngine();
  const guide = guideFor(part);

  const [marks, setMarks] = useState<PrepMarks>(() => load<PrepMarks>(KEYS.prep, { shaky: [] }));
  /**
   * Bảng ôn dựng MỘT lần cho cả buổi.
   *
   * Có `marks` trong đây thì mỗi lần bấm "chưa thuộc" là danh sách tự xếp lại và thẻ
   * nhảy đi chỗ khác ngay dưới ngón tay. Nên chỉ đọc dấu đã lưu lúc mở màn hình.
   */
  const pack = useMemo(
    () => buildPrep(part, qs, new Set(load<PrepMarks>(KEYS.prep, { shaky: [] }).shaky)),
    [part, qs],
  );

  const [step, setStep] = useState<Step>('words');
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState<Set<string>>(new Set());

  const flag = (h: string) => {
    setMarks((m) => {
      const next = toggleShaky(m, h);
      save(KEYS.prep, next);
      return next;
    });
  };

  const at = STEPS.findIndex((s) => s.id === step);
  const next = STEPS[at + 1];

  return (
    <Shell>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onBack} style={{ ...btn(C.card, C.ink), padding: '6px 14px', fontSize: 13 }}>
            ← Cách làm
          </button>
          <span style={{ flex: 1 }} />
          <button onClick={onStart} style={{ ...btn(C.card, C.muted), padding: '6px 14px', fontSize: 12.5, boxShadow: 'none' }}>
            Bỏ qua, vào luyện luôn →
          </button>
        </div>

        <h2 style={{ margin: '12px 0 2px', fontSize: 24, fontWeight: 800 }}>
          Ôn trước khi luyện
        </h2>
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: C.gold }}>
          <span style={{ fontFamily: F.han }}>{guide.id}</span> · {guide.vi}
        </p>
        <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: C.muted2, lineHeight: 1.55 }}>
          Tất cả những gì ở đây được lấy ra từ <b>đúng {qs.length} câu bạn sắp làm</b> — không phải một
          danh sách chung. Xem xong là gặp lại ngay trong câu.
        </p>

        {/* -- tabs -- */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              style={{
                border: `2px solid ${C.ink}`,
                background: step === s.id ? C.ink : C.panel,
                color: step === s.id ? C.soft : C.body,
                borderRadius: 99,
                padding: '6px 15px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: F.ui,
                boxShadow: step === s.id ? shadow(2, C.edge) : 'none',
                opacity: i > at ? 0.75 : 1,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {step === 'words' && (
          <WordStep
            words={pack.words}
            hide={hide}
            setHide={setHide}
            shown={shown}
            reveal={(h) => setShown((s) => new Set(s).add(h))}
            shaky={marks.shaky}
            onFlag={flag}
            onSay={(h) => engine.audio.speak(h)}
            srsBox={(h) => engine.srs[laneId('w:' + h, 'recog')]?.box ?? null}
          />
        )}

        {step === 'grammar' && <GrammarStep pack={pack} onSay={(s) => engine.audio.speak(s)} />}

        {step === 'check' && (
          <CheckStep words={pack.words} onMiss={(h) => !marks.shaky.includes(h) && flag(h)} />
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22, flexWrap: 'wrap' }}>
          {next ? (
            <button onClick={() => setStep(next.id)} style={btn(C.ink, C.soft)}>
              {next.label} →
            </button>
          ) : null}
          <button onClick={onStart} style={btn(C.red)}>
            Luyện {qs.length} câu ▶
          </button>
        </div>
      </div>
    </Shell>
  );
}

// -- step 1: words ----------------------------------------------------------

function WordStep({
  words,
  hide,
  setHide,
  shown,
  reveal,
  shaky,
  onFlag,
  onSay,
  srsBox,
}: {
  words: PrepWord[];
  hide: boolean;
  setHide: (v: boolean) => void;
  shown: Set<string>;
  reveal: (h: string) => void;
  shaky: string[];
  onFlag: (h: string) => void;
  onSay: (h: string) => void;
  srsBox: (h: string) => number | null;
}) {
  if (!words.length) {
    return (
      <p style={{ ...heading, textTransform: 'none', fontSize: 14, color: C.body }}>
        Mấy câu này không có từ nào trên HSK 2 — vào luyện thẳng được rồi.
      </p>
    );
  }

  const keyCount = words.filter((w) => w.isKey).length;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', ...heading }}>
        <span>{words.length} từ trong đề này</span>
        <button
          onClick={() => setHide(!hide)}
          style={{
            border: `2px solid ${C.ink}`,
            background: hide ? C.ochre : C.panel,
            color: C.ink,
            borderRadius: 99,
            padding: '4px 13px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: F.ui,
            textTransform: 'none',
            letterSpacing: 0,
          }}
        >
          {hide ? '👁 Đang che nghĩa — bấm thẻ để lật' : '🙈 Che nghĩa để tự kiểm tra'}
        </button>
      </div>

      {keyCount > 0 && (
        <p style={{ margin: '0 0 10px', fontSize: 12.5, fontWeight: 700, color: C.gold }}>
          ⭐ {keyCount} từ có dấu sao chính là đáp án của một câu nào đó — thuộc mấy từ này là ăn điểm trực tiếp.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10 }}>
        {words.map((w) => {
          const open = !hide || shown.has(w.v.h);
          const flagged = shaky.includes(w.v.h);
          const box = srsBox(w.v.h);
          const tag = LEVEL_TAG[w.level];
          return (
            <div
              key={w.v.h}
              onClick={() => (hide && !open ? reveal(w.v.h) : onSay(w.v.h))}
              style={{
                background: flagged ? C.badBg : C.panel,
                border: `2px solid ${flagged ? C.red : C.ink}`,
                borderRadius: 16,
                padding: '11px 14px',
                cursor: 'pointer',
                boxShadow: shadow(2, C.edge),
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontFamily: F.han, fontSize: 25, fontWeight: 800, lineHeight: 1.15 }}>
                  {w.v.h}
                </span>
                {w.isKey && <span title="Là đáp án của một câu">⭐</span>}
                <span style={{ flex: 1 }} />
                {box === null && (
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.muted2 }}>chưa gặp</span>
                )}
                {tag && (
                  <span
                    style={{
                      background: tag.bg,
                      color: '#fff',
                      borderRadius: 99,
                      padding: '1px 7px',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {tag.text}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.gold }}>{w.v.p}</div>

              {open ? (
                <>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.body, marginTop: 2 }}>
                    <span style={{ color: C.muted2, fontSize: 11.5 }}>{w.v.pos} · </span>
                    {w.v.m}
                  </div>
                  {w.v.ex && (
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 5, lineHeight: 1.45 }}>
                      <span style={{ fontFamily: F.han }}>{w.v.ex}</span>
                      {w.v.exVi && <div style={{ fontStyle: 'italic' }}>{w.v.exVi}</div>}
                    </div>
                  )}
                  {STORIES[w.v.h] && (
                    <div style={{ fontSize: 11.5, color: C.purple, marginTop: 5, fontWeight: 700 }}>
                      💡 {STORIES[w.v.h]}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.muted2, marginTop: 6 }}>
                  Bấm để xem nghĩa
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFlag(w.v.h);
                }}
                style={{
                  marginTop: 8,
                  border: `2px solid ${flagged ? C.red : C.edge}`,
                  background: flagged ? C.red : 'transparent',
                  color: flagged ? '#fff' : C.muted,
                  borderRadius: 99,
                  padding: '2px 11px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: F.ui,
                }}
              >
                {flagged ? '✓ Đã đánh dấu chưa thuộc' : '+ Chưa thuộc'}
              </button>
            </div>
          );
        })}
      </div>

      <p style={{ margin: '12px 0 0', fontSize: 12, fontWeight: 600, color: C.muted2, lineHeight: 1.5 }}>
        Bấm vào thẻ để nghe đọc. Từ đánh dấu "chưa thuộc" sẽ được đẩy lên đầu bảng ôn ở những lần luyện sau.
      </p>
    </>
  );
}

// -- step 2: grammar --------------------------------------------------------

function GrammarStep({
  pack,
  onSay,
}: {
  pack: ReturnType<typeof buildPrep>;
  onSay: (s: string) => void;
}) {
  return (
    <>
      <div style={heading}>Ngữ pháp phần này kiểm tra</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {pack.notes.map((n) => (
          <div
            key={n.name}
            style={{
              background: C.panel,
              border: `2px solid ${C.ink}`,
              borderRadius: 16,
              padding: '12px 15px',
            }}
          >
            <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{n.name}</div>
            {n.formula && (
              <div
                style={{
                  fontFamily: F.han,
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.blue,
                  background: C.card,
                  border: `2px dashed ${C.edge}`,
                  borderRadius: 10,
                  padding: '6px 10px',
                  margin: '7px 0',
                  lineHeight: 1.6,
                }}
              >
                {n.formula}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: C.body, lineHeight: 1.55, marginTop: 4 }}>
              {n.why}
            </div>
            {n.eg.map((e) => (
              <div key={e.cn} style={{ marginTop: 7, fontSize: 13, lineHeight: 1.5 }}>
                <span
                  onClick={() => onSay(e.cn)}
                  style={{ fontFamily: F.han, fontWeight: 700, color: C.ink, cursor: 'pointer' }}
                >
                  {e.cn}
                </span>
                <div style={{ color: C.muted, fontStyle: 'italic', fontSize: 12.5 }}>{e.vi}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {pack.points.length > 0 && (
        <>
          <div style={heading}>Điểm ngữ pháp có mặt trong chính mấy câu này</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {pack.points.map((g) => (
              <div
                key={g.id}
                style={{
                  background: C.card,
                  border: `2px solid ${C.edge}`,
                  borderRadius: 14,
                  padding: '10px 14px',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 800, color: C.gold }}>{g.name}</div>
                <div
                  onClick={() => onSay(g.full)}
                  style={{ fontFamily: F.han, fontSize: 15, fontWeight: 700, marginTop: 4, cursor: 'pointer' }}
                >
                  {g.full}
                </div>
                <div style={{ fontSize: 12, color: C.muted2, fontWeight: 600 }}>{g.pin}</div>
                <div style={{ fontSize: 12.5, color: C.body, fontStyle: 'italic', marginTop: 2 }}>{g.vi}</div>
                {g.expl && (
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 5, lineHeight: 1.5 }}>{g.expl}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// -- step 3: the quick check ------------------------------------------------

function CheckStep({ words, onMiss }: { words: PrepWord[]; onMiss: (h: string) => void }) {
  const qs = useMemo<CheckQ[]>(() => makeCheck(words), [words]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);

  if (!qs.length) {
    return (
      <p style={{ fontSize: 14, fontWeight: 600, color: C.body, marginTop: 16 }}>
        Không có từ nào để kiểm tra — vào luyện thôi.
      </p>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: right === qs.length ? C.okInk : C.gold }}>
          {right}/{qs.length} đúng
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.body, maxWidth: 460, margin: '8px auto 0', lineHeight: 1.55 }}>
          {right === qs.length
            ? 'Từ đã nằm trong đầu rồi. Giờ vào đề là để luyện KỸ THUẬT làm bài, không phải luyện từ.'
            : 'Mấy từ vừa sai đã được đánh dấu "chưa thuộc". Lướt lại bước ① một lượt rồi hãy vào đề — gặp lại chúng trong câu ngay bây giờ là lúc nhớ chắc nhất.'}
        </p>
      </div>
    );
  }

  const q = qs[i];
  const last = i + 1 >= qs.length;

  return (
    <>
      <div style={{ ...heading, display: 'flex', justifyContent: 'space-between' }}>
        <span>Nhớ nghĩa của từ nào rồi?</span>
        <span style={{ textTransform: 'none' }}>
          {i + 1}/{qs.length} · đúng {right}
        </span>
      </div>

      <div
        style={{
          background: C.panel,
          border: `2px solid ${C.ink}`,
          borderRadius: 18,
          padding: '18px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: F.han, fontSize: 40, fontWeight: 800 }}>{q.v.h}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.gold, marginTop: 2 }}>{q.v.p}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8, marginTop: 12 }}>
        {q.opts.map((o, k) => {
          const chosen = picked === k;
          const reveal = picked !== null;
          const good = k === q.ans;
          return (
            <button
              key={o}
              disabled={reveal}
              onClick={() => {
                setPicked(k);
                if (good) setRight((n) => n + 1);
                else onMiss(q.v.h);
              }}
              style={{
                border: `2px solid ${reveal && good ? C.green : chosen ? C.red : C.ink}`,
                background: reveal && good ? C.okBg : chosen ? C.badBg : C.card,
                color: C.ink,
                borderRadius: 14,
                padding: '11px 14px',
                fontSize: 14,
                fontWeight: 700,
                cursor: reveal ? 'default' : 'pointer',
                fontFamily: F.ui,
                textAlign: 'left',
              }}
            >
              {o}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button
            onClick={() => {
              if (last) setDone(true);
              else {
                setI(i + 1);
                setPicked(null);
              }
            }}
            style={btn(C.ink, C.soft)}
          >
            {last ? 'Xong' : 'Từ tiếp theo →'}
          </button>
        </div>
      )}
    </>
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
