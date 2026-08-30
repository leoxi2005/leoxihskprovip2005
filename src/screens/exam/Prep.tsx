import { useEffect, useMemo, useState } from 'react';
import { STORIES } from '../../data';
import type { ExamQ, PartId } from '../../engine/exam';
import { guideFor } from '../../engine/exam';
import {
  buildCheck,
  buildPrep,
  toggleShaky,
  type CheckQ,
  type CheckRound,
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
          <CheckStep
            pack={pack}
            part={part}
            onMiss={(h) => !marks.shaky.includes(h) && flag(h)}
            onSay={(s) => engine.audio.speak(s)}
          />
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

/**
 * Bộ kiểm tra nhiều vòng, chạy hết từ và hết ngữ pháp của buổi luyện.
 *
 * Bản đầu là sáu câu hỏi nghĩa rồi thôi — quá ít để trả lời được câu hỏi duy nhất
 * đáng hỏi ở đây: vào đề bây giờ thì có đọc/nghe nổi không. Giờ mỗi từ đi qua ba
 * chiều (nhìn chữ → nghĩa, nghe âm → chữ, có nghĩa → nhớ chữ), thêm vòng điền từ
 * vào câu và vòng ngữ pháp của phần.
 *
 * Vòng nào cũng nhảy vào giữa chừng được và cũng bỏ qua được: bắt làm xong bốn mươi
 * câu mới cho vào đề là cách chắc chắn nhất để người ta thôi bấm vào phần luyện.
 */
function CheckStep({
  pack,
  part,
  onMiss,
  onSay,
}: {
  pack: ReturnType<typeof buildPrep>;
  part: PartId;
  onMiss: (h: string) => void;
  onSay: (s: string) => void;
}) {
  const rounds = useMemo<CheckRound[]>(() => buildCheck(pack, part), [pack, part]);
  const [at, setAt] = useState(0);
  /** Điểm đã chốt của từng vòng, để chip trên đầu nói được vòng nào đã xong. */
  const [scores, setScores] = useState<Record<string, { right: number; of: number }>>({});

  if (!rounds.length) {
    return (
      <p style={{ fontSize: 14, fontWeight: 600, color: C.body, marginTop: 16 }}>
        Không có từ nào để kiểm tra — vào luyện thôi.
      </p>
    );
  }

  const round = rounds[Math.min(at, rounds.length - 1)];
  const total = rounds.reduce((n, r) => n + r.qs.length, 0);
  const answered = Object.values(scores).reduce((n, s) => n + s.of, 0);

  return (
    <>
      <div style={{ ...heading, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>{rounds.length} vòng · {total} câu, phủ hết từ và ngữ pháp của đề này</span>
        <span style={{ textTransform: 'none' }}>đã làm {answered}/{total}</span>
      </div>

      {/* -- chọn vòng -- */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
        {rounds.map((r, k) => {
          const s = scores[r.id];
          const here = k === at;
          return (
            <button
              key={r.id}
              onClick={() => setAt(k)}
              style={{
                border: `2px solid ${C.ink}`,
                background: here ? C.ink : s ? C.okBg : C.card,
                color: here ? C.soft : C.ink,
                borderRadius: 99,
                padding: '5px 13px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: F.ui,
              }}
            >
              {r.label}
              <span style={{ opacity: 0.75, fontWeight: 700 }}>
                {s ? ` ${s.right}/${s.of}` : ` · ${r.qs.length}`}
              </span>
            </button>
          );
        })}
      </div>

      <Round
        key={round.id}
        round={round}
        onSay={onSay}
        onMiss={onMiss}
        onDone={(right) => setScores((m) => ({ ...m, [round.id]: { right, of: round.qs.length } }))}
        next={rounds[at + 1]?.label}
        onNext={() => setAt(at + 1)}
      />
    </>
  );
}

/** Một vòng: chạy hết câu của nó, rồi cho làm lại đúng mấy câu vừa sai. */
function Round({
  round,
  onSay,
  onMiss,
  onDone,
  next,
  onNext,
}: {
  round: CheckRound;
  onSay: (s: string) => void;
  onMiss: (h: string) => void;
  onDone: (right: number) => void;
  next?: string;
  onNext: () => void;
}) {
  /** Danh sách đang chạy — làm lại thì thay bằng đúng mấy câu sai. */
  const [qs, setQs] = useState<CheckQ[]>(round.qs);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<CheckQ[]>([]);
  const [done, setDone] = useState(false);

  const q = qs[Math.min(i, qs.length - 1)];

  /*
   * Câu nghe tự phát ngay khi hiện ra.
   *
   * Không tự phát thì mỗi câu mất một cú bấm chỉ để bắt đầu, và người làm sẽ ngồi
   * nhìn bốn lựa chọn chữ Hán trước khi nghe — thành ra đoán bằng mắt, đúng thứ vòng
   * này sinh ra để chặn.
   */
  useEffect(() => {
    if (!done && q?.kind === 'listen' && q.say) onSay(q.say);
    // Theo VỊ TRÍ chứ không theo nội dung câu: làm lại mấy câu sai có thể mở đúng
    // vào từ vừa hỏi, mà `q.h` không đổi thì hiệu ứng không chạy — câu đầu im tiếng.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, qs, done]);

  const answer = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.ans) setRight((n) => n + 1);
    else {
      setMissed((m) => [...m, q]);
      if (q.h) onMiss(q.h);
    }
    // Nghe xong thì đọc lại từ vừa hiện chữ — chỗ nối âm với mặt chữ nằm đúng ở đây.
    if (q.kind === 'listen' && q.say) onSay(q.say);
  };

  const advance = () => {
    if (i + 1 < qs.length) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    setDone(true);
    onDone(right);
  };

  const retryMissed = () => {
    setQs(missed);
    setMissed([]);
    setI(0);
    setPicked(null);
    setRight(0);
    setDone(false);
  };

  if (done) {
    const all = right === qs.length;
    return (
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: all ? C.okInk : C.gold }}>
          {right}/{qs.length} đúng
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.body, maxWidth: 470, margin: '8px auto 0', lineHeight: 1.55 }}>
          {all
            ? 'Vòng này sạch. Sang vòng sau hoặc vào đề — gặp lại mấy từ này trong câu ngay bây giờ là lúc nhớ chắc nhất.'
            : 'Mấy câu vừa sai đã được đánh dấu "chưa thuộc" ở bước ①. Làm lại riêng chúng một lượt rồi hãy đi tiếp.'}
        </p>
        <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          {missed.length > 0 && (
            <button onClick={retryMissed} style={{ ...btn(C.ochre, C.ink), padding: '9px 18px', fontSize: 14 }}>
              ↺ Làm lại {missed.length} câu sai
            </button>
          )}
          {next && (
            <button onClick={onNext} style={{ ...btn(C.ink, C.soft), padding: '9px 18px', fontSize: 14 }}>
              {next} →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ ...heading, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', margin: '4px 0 8px' }}>
        <span>{PROMPT[round.id]}</span>
        <span style={{ textTransform: 'none' }}>
          {i + 1}/{qs.length} · đúng {right}
        </span>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 12.5, fontWeight: 600, color: C.muted2 }}>{round.hint}</p>

      <div
        style={{
          background: C.panel,
          border: `2px solid ${C.ink}`,
          borderRadius: 18,
          padding: '18px 20px',
          textAlign: 'center',
        }}
      >
        {q.kind === 'listen' ? (
          <>
            <button
              onClick={() => q.say && onSay(q.say)}
              style={{ ...btn(C.blue), padding: '13px 30px', fontSize: 17 }}
            >
              🔊 Nghe lại
            </button>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.muted2, marginTop: 9 }}>
              {picked === null ? 'Chỉ có tiếng — chọn chữ Hán đúng.' : q.sub}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                // Vòng ③ hỏi bằng NGHĨA tiếng Việt — đề bài chỗ này không phải chữ Hán.
                fontFamily: q.kind === 'recall' ? F.ui : F.han,
                fontSize: q.big ? 40 : q.kind === 'recall' ? 24 : 21,
                fontWeight: 800,
                lineHeight: 1.5,
              }}
            >
              {q.prompt}
            </div>
            {q.sub && (
              <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginTop: 4 }}>{q.sub}</div>
            )}
            {q.say && q.kind !== 'mean' && (
              <button
                onClick={() => q.say && onSay(q.say)}
                style={{
                  marginTop: 9,
                  border: `2px solid ${C.edge}`,
                  background: 'transparent',
                  color: C.muted,
                  borderRadius: 99,
                  padding: '3px 13px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: F.ui,
                }}
              >
                🔊 Nghe câu
              </button>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8, marginTop: 12 }}>
        {q.opts.map((o, k) => {
          const chosen = picked === k;
          const reveal = picked !== null;
          const good = k === q.ans;
          return (
            <button
              key={o + k}
              disabled={reveal}
              onClick={() => answer(k)}
              style={{
                border: `2px solid ${reveal && good ? C.green : chosen ? C.red : C.ink}`,
                background: reveal && good ? C.okBg : chosen ? C.badBg : C.card,
                color: C.ink,
                borderRadius: 14,
                padding: '11px 14px',
                fontSize: q.hanOpts ? 18 : 14,
                fontWeight: 700,
                cursor: reveal ? 'default' : 'pointer',
                fontFamily: q.hanOpts ? F.han : F.ui,
                textAlign: q.hanOpts ? 'center' : 'left',
              }}
            >
              {o}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          {q.note && (
            <div
              onClick={() => q.say && onSay(q.say)}
              style={{
                flex: 1,
                minWidth: 220,
                fontSize: 13,
                fontWeight: 600,
                color: C.body,
                lineHeight: 1.5,
                cursor: q.say ? 'pointer' : 'default',
              }}
            >
              {q.note}
            </div>
          )}
          <button onClick={advance} style={btn(C.ink, C.soft)}>
            {i + 1 < qs.length ? 'Câu tiếp →' : 'Xong vòng này'}
          </button>
        </div>
      )}
    </>
  );
}

/** Câu hỏi in trên đầu mỗi vòng — nói rõ đang phải làm gì với cái đang hiện ra. */
const PROMPT: Record<CheckRound['id'], string> = {
  mean: 'Từ này nghĩa là gì?',
  listen: 'Vừa nghe thấy từ nào?',
  recall: 'Nghĩa này là chữ nào?',
  usage: 'Điền từ nào vào chỗ trống?',
  grammar: 'Câu này hiểu thế nào?',
};

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
