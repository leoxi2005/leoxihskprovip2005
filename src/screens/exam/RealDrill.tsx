import { useEffect, useMemo, useRef, useState } from 'react';
import { H41001_LISTEN, H41001_PARTS } from '../../data/h41001';
import { optionsFor, type BuiltinPaper, type KeyAnswer } from '../../engine/realpaper';
import { C, F, shadow } from '../../theme';

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
  padding: '22px 26px',
  width: '100%',
  maxWidth: 720,
} as const;

type Phase = 'intro' | 'run' | 'done';

/** Part 1's answers are true/false; "đáp án là T" means nothing to a learner. */
const show = (a: KeyAnswer | null): string => (a === 'T' ? '✓' : a === 'F' ? '✗' : (a ?? '—'));

/**
 * One listening part of the real paper, drilled with the real recording.
 *
 * The whole-paper mode is a sitting: thirty minutes, no stopping, marked at the end.
 * This is the opposite and deliberately so — one question at a time, replay as often as
 * you like, right or wrong told immediately. Hearing the same sentence four times until
 * it resolves is how listening actually improves; the exam-conditions run is for
 * checking whether it has.
 */
export function RealDrill({
  part,
  paper,
  onExit,
}: {
  part: 1 | 2 | 3;
  paper: BuiltinPaper;
  onExit: () => void;
}) {
  const items = useMemo(() => H41001_LISTEN.filter((q) => q.part === part), [part]);
  const meta = H41001_PARTS.find((p) => p.part === part)!;

  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [given, setGiven] = useState<(KeyAnswer | null)[]>(() => Array(items.length).fill(null));
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);

  const audioEl = useRef<HTMLAudioElement | null>(null);
  /** Where the clip being played has to stop; the recording runs on past it otherwise. */
  const stopAt = useRef<number | null>(null);

  const q = items[i];
  const answer = paper.key[q.n - 1];
  const picked = given[i];

  const play = (at: [number, number]) => {
    const el = audioEl.current;
    if (!el) return;
    stopAt.current = at[1];
    const seek = () => {
      el.currentTime = at[0];
      void el.play().catch(() => undefined);
    };
    // Seeking before the browser has read the file's duration silently does nothing,
    // and the first clip is always asked for while the 20 MB is still arriving.
    if (el.readyState >= 1) seek();
    else el.addEventListener('loadedmetadata', seek, { once: true });
  };

  const stop = () => {
    stopAt.current = null;
    audioEl.current?.pause();
  };

  // Each question plays itself on arrival: the tap that answered the previous one is
  // the gesture browsers require, so nothing is left waiting for a second press.
  useEffect(() => {
    if (phase === 'run') play(q.at);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  const pick = (o: KeyAnswer) => {
    if (picked) return;
    stop();
    setGiven((a) => {
      const out = a.slice();
      out[i] = o;
      return out;
    });
  };

  const next = () => {
    if (i + 1 < items.length) setI(i + 1);
    else setPhase('done');
  };

  const right = given.filter((g, k) => g === paper.key[items[k].n - 1]).length;

  const restart = () => {
    setGiven(Array(items.length).fill(null));
    setI(0);
    setPhase('run');
  };

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
      {/* Mounted for every phase: remounting it would drop the buffered recording and
          re-download 20 MB between questions. */}
      <audio
        ref={audioEl}
        src={paper.url}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setBroken(true)}
        onTimeUpdate={(e) => {
          const at = stopAt.current;
          if (at !== null && e.currentTarget.currentTime >= at) stop();
        }}
      />

      {phase === 'intro' && (
        <div style={card}>
          <button onClick={onExit} style={{ ...btn(C.card, C.ink), padding: '6px 14px', fontSize: 13 }}>
            ← Quay lại
          </button>
          <h2 style={{ margin: '14px 0 2px', fontSize: 25, fontWeight: 800 }}>{meta.title}</h2>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.muted }}>
            {meta.sub} · {items.length} câu
          </div>

          <div
            style={{
              background: C.soft,
              border: `2px solid ${C.ink}`,
              borderRadius: 14,
              padding: '12px 16px',
              margin: '14px 0 4px',
              fontSize: 14,
              fontWeight: 700,
              color: C.body,
              lineHeight: 1.65,
            }}
          >
            🎧 <b>Giọng thu thật của đề</b> — cắt ra từ bản thu {paper.name}. Không phải giọng máy:
            đúng người thật, đúng tốc độ, đúng tiếng ồn nền của phòng thu.
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: C.body, lineHeight: 1.65 }}>{meta.how}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.muted2, lineHeight: 1.6 }}>
            Ở đây được nghe lại thoải mái và chấm ngay từng câu — cố ý khác phòng thi. Muốn đúng
            luật thi thì quay ra bấm “Làm cả đề”.
          </p>

          <div style={{ marginTop: 16 }}>
            <button onClick={() => setPhase('run')} style={btn(C.red)}>
              Bắt đầu ▶
            </button>
          </div>
        </div>
      )}

      {phase === 'run' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={onExit} style={{ ...btn(C.card, C.ink), padding: '6px 14px', fontSize: 13 }}>
              ← Thoát
            </button>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: C.muted }}>
              câu {q.n} · {i + 1}/{items.length}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
              margin: '16px 0 4px',
            }}
          >
            <button onClick={() => (playing ? stop() : play(q.at))} style={btn(playing ? C.ochre : C.green)}>
              {playing ? '⏸ Dừng' : '🔁 Nghe lại'}
            </button>
            {q.sharesPassage && (
              <button
                onClick={() => play(items[i - 1].at)}
                style={{ ...btn(C.card, C.ink), padding: '9px 16px', fontSize: 14 }}
              >
                🔁 Nghe lại cả đoạn
              </button>
            )}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: broken ? C.badInk : C.muted2, lineHeight: 1.6 }}>
            {broken
              ? 'Không mở được file nghe. Kiểm tra mạng rồi vào lại.'
              : q.sharesPassage
                ? 'Câu này hỏi tiếp về đoạn vừa rồi — băng chỉ đọc câu hỏi, không đọc lại đoạn.'
                : 'Nghe xong mới chọn. Nghe lại bao nhiêu lần cũng được, đây là lúc để luyện.'}
          </div>

          {q.statement && (
            <div
              style={{
                margin: '18px 0 6px',
                fontSize: 26,
                fontWeight: 800,
                fontFamily: F.han,
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              ★ {q.statement}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              // Two per row like the answer sheet, so the four options read as a block
              // rather than three-then-one.
              gridTemplateColumns: q.options ? 'repeat(auto-fit,minmax(280px,1fr))' : '1fr 1fr',
              gap: 10,
              marginTop: 14,
            }}
          >
            {optionsFor(q.n - 1).map((o, k) => {
              const isPicked = picked === o;
              const isKey = answer === o;
              const shade = !picked
                ? { bg: C.card, ink: C.ink, edge: C.ink }
                : isKey
                  ? { bg: C.okBg, ink: C.okInk, edge: C.green }
                  : isPicked
                    ? { bg: C.badBg, ink: C.badInk, edge: C.red }
                    : { bg: C.card, ink: C.muted, edge: C.edge };
              return (
                <button
                  key={o}
                  onClick={() => pick(o)}
                  style={{
                    background: shade.bg,
                    color: shade.ink,
                    border: `3px solid ${shade.edge}`,
                    borderRadius: 14,
                    padding: '12px 16px',
                    fontSize: q.options ? 17 : 22,
                    fontWeight: 800,
                    fontFamily: q.options ? F.han : F.ui,
                    cursor: picked ? 'default' : 'pointer',
                    textAlign: 'left',
                    boxShadow: picked ? 'none' : shadow(2),
                  }}
                >
                  {q.options ? `${o}  ${q.options[k]}` : o === 'T' ? '✓ Đúng' : '✗ Sai'}
                </button>
              );
            })}
          </div>

          {picked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: picked === answer ? C.okInk : C.badInk,
                }}
              >
                {picked === answer ? '✓ Đúng rồi' : `✗ Sai — đáp án là ${show(answer)}`}
              </span>
              <span style={{ flex: 1 }} />
              <button onClick={next} style={btn(C.ink, C.soft)}>
                {i + 1 < items.length ? 'Câu tiếp →' : 'Xem kết quả →'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div style={{ ...card, textAlign: 'center' }}>
          <h2
            style={{
              margin: '0 0 4px',
              fontSize: 30,
              fontWeight: 800,
              color: right >= items.length * 0.6 ? C.okInk : C.badInk,
            }}
          >
            {right}/{items.length} đúng
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: C.muted }}>
            {meta.title} · {paper.name}
          </p>

          {right < items.length && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {items.map((it, k) =>
                given[k] === paper.key[it.n - 1] ? null : (
                  <span
                    key={it.n}
                    style={{
                      background: C.badBg,
                      border: `2px solid ${C.red}`,
                      borderRadius: 10,
                      padding: '4px 10px',
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.badInk,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {it.n}. {show(given[k])} → {show(paper.key[it.n - 1])}
                  </span>
                ),
              )}
            </div>
          )}

          <p style={{ fontSize: 13, fontWeight: 600, color: C.body, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.65 }}>
            Câu sai thì quay lại nghe riêng câu đó vài lần, tới lúc nghe ra chỗ mình bỏ lỡ. Nghe
            hiểu được một câu đã trượt còn hơn làm thêm một phần mới.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            <button onClick={restart} style={btn(C.ink, C.soft)}>
              Luyện lại phần này
            </button>
            <button onClick={onExit} style={btn(C.card, C.ink)}>
              ← Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
