import { useMemo, useRef, useState } from 'react';
import { DECK, IMAGES, STORIES } from '../data';
import { isLeech, laneId } from '../engine/storage';
import { useEngine, useGameState } from '../engine/useEngine';
import { StrokeAnimation, type StrokeAnimationHandle } from '../components/StrokeAnimation';
import { C, F, shadow } from '../theme';

type FilterId = 'all' | 'due' | 'learning' | 'learned' | 'unseen' | 'leech';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'due', label: '⏰ Đến hạn' },
  { id: 'learning', label: '🟡 Đang học' },
  { id: 'learned', label: '🟢 Đã thuộc' },
  { id: 'unseen', label: '⚪ Chưa gặp' },
  { id: 'leech', label: '🔥 Hay sai' },
];

export function Notebook() {
  const engine = useEngine();
  const st = useGameState();
  const [query, setQuery] = useState('');
  const strokes = useRef<StrokeAnimationHandle>(null);

  const [filter, setFilter] = useState<FilterId>('all');
  const vocab = engine.pools().vocab;

  /** Both lanes of a word, and what they add up to for filtering and sorting. */
  const stateOf = (h: string) => {
    const rec = engine.srs[laneId('w:' + h, 'recog')];
    const rcl = engine.srs[laneId('w:' + h, 'recall')];
    return {
      rec,
      rcl,
      unseen: !rec && !rcl,
      learned: (rec?.box ?? 0) >= 3 && (rcl?.box ?? 0) >= 3,
      leech: isLeech(rec) || isLeech(rcl),
      lapses: (rec?.lapses ?? 0) + (rcl?.lapses ?? 0),
      // A word with only one lane scheduled is still due when that lane is.
      due: Math.min(rec?.due ?? Infinity, rcl?.due ?? Infinity),
    };
  };

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // Match hanzi, pinyin (with or without tone marks) or the Vietnamese meaning.
    const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const now = Date.now();

    let list = needle
      ? vocab.filter(
          (w) =>
            w.h.includes(needle) ||
            plain(w.p).includes(plain(needle)) ||
            plain(w.m).includes(plain(needle)),
        )
      : vocab;

    if (filter !== 'all') {
      list = list.filter((w) => {
        const s = stateOf(w.h);
        switch (filter) {
          case 'unseen':
            return s.unseen;
          case 'learning':
            return !s.unseen && !s.learned;
          case 'learned':
            return s.learned;
          case 'leech':
            return s.leech;
          case 'due':
            return s.due <= now;
        }
      });
    }

    // Sorted by how soon each word comes back, so the top of the list is the work.
    if (filter === 'due' || filter === 'learning') {
      list = list.slice().sort((a, b) => stateOf(a.h).due - stateOf(b.h).due);
    } else if (filter === 'leech') {
      list = list.slice().sort((a, b) => stateOf(b.h).lapses - stateOf(a.h).lapses);
    }
    return list;
    // `engine.srs` is mutated in place rather than replaced, so `topicVer` is what
    // actually changes when progress moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocab, query, filter, st.topicVer]);

  const w = st.bookWord;

  /**
   * Other words in the deck built from one of this word's characters.
   *
   * Hanzi are reused relentlessly, and seeing 通过 next to 经过 is what turns two
   * separate memorisations into one.
   */
  const family = useMemo(() => {
    if (!w) return [];
    const chars = [...new Set(w.h.split(''))];
    return DECK.vocab.filter((v) => v.h !== w.h && chars.some((c) => v.h.includes(c))).slice(0, 12);
  }, [w]);

  return (
    <>
      <div style={{ minHeight: '100vh', maxWidth: 900, margin: '0 auto', padding: '20px 16px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button
            onClick={engine.goHome}
            aria-label="Về trang chủ"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: `2px solid ${C.ink}`,
              background: C.card,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              color: C.muted,
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>📒 Sổ tay từ vựng</h2>
          <span
            style={{
              background: C.soft,
              border: `2px solid ${C.ink}`,
              borderRadius: 99,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 800,
              color: C.muted,
            }}
          >
            {shown.length} từ
          </span>
        </div>

        <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: C.muted2 }}>
          Chạm vào từ để xem hoạt hình viết từng nét ✍️, nghe phát âm 🔊 và mẹo nhớ 🧠 · Chấm xanh = thuộc cả
          hai chiều (đọc &amp; viết), vàng = đang học, đỏ = hay sai, xám = chưa gặp
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm chữ Hán, pinyin hoặc nghĩa…"
          aria-label="Tìm từ"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: 14,
            padding: '11px 16px',
            fontFamily: F.ui,
            fontSize: 15,
            fontWeight: 600,
            color: C.ink,
            background: C.card,
            border: `2px solid ${C.ink}`,
            borderRadius: 99,
            outline: 'none',
            boxShadow: shadow(3, C.edge),
          }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              style={{
                border: `2px solid ${filter === f.id ? C.ink : C.edge}`,
                background: filter === f.id ? C.ink : C.card,
                color: filter === f.id ? C.soft : C.muted,
                borderRadius: 99,
                padding: '5px 14px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: F.ui,
              }}
            >
              {f.label}
            </button>
          ))}
          {/* Straight from a filtered list into a session on it — the point of filtering. */}
          {filter === 'leech' && shown.length > 0 && (
            <button
              onClick={() => engine.startGame('leech')}
              style={{
                border: `2px solid ${C.ink}`,
                background: C.red,
                color: '#fff',
                borderRadius: 99,
                padding: '5px 16px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: F.ui,
              }}
            >
              Ôn ngay {shown.length} từ này →
            </button>
          )}
          {filter === 'due' && shown.length > 0 && (
            <button
              onClick={() => engine.startSession()}
              style={{
                border: `2px solid ${C.ink}`,
                background: C.green,
                color: '#fff',
                borderRadius: 99,
                padding: '5px 16px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: F.ui,
              }}
            >
              Ôn ngay →
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))', gap: 10 }}>
          {shown.map((v) => {
            const s = stateOf(v.h);
            // Green once both lanes are mature, amber while either is still in rotation.
            const dot = s.leech ? C.red : s.unseen ? C.edge : s.learned ? C.green : C.ochre;
            return (
              <button
                key={v.h}
                onClick={() => engine.bookPick(v)}
                className="lift lift-3 lift-static"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  background: C.card,
                  border: `2px solid ${C.ink}`,
                  borderRadius: 16,
                  padding: '14px 10px',
                  cursor: 'pointer',
                  boxShadow: shadow(3, C.edge),
                  fontFamily: F.ui,
                  textAlign: 'center',
                }}
              >
                <span
                  style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 99, background: dot }}
                />
                <span style={{ fontFamily: F.han, fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{v.h}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{v.p}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#5f5340', lineHeight: 1.3 }}>{v.m}</span>
              </button>
            );
          })}
        </div>

        {!shown.length && (
          <p style={{ textAlign: 'center', color: C.muted, fontWeight: 700, marginTop: 40 }}>
            Không tìm thấy từ nào 🔍
          </p>
        )}
      </div>

      {w && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={w.h}
          onClick={engine.closeBookWord}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(45,36,25,.55)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.card,
              border: `3px solid ${C.ink}`,
              borderRadius: 24,
              boxShadow: shadow(8),
              padding: '24px 28px',
              maxWidth: 560,
              width: '100%',
              maxHeight: '92vh',
              overflow: 'auto',
              textAlign: 'center',
              animation: 'pop .25s ease',
              position: 'relative',
            }}
          >
            <button
              onClick={engine.closeBookWord}
              aria-label="Đóng"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                borderRadius: 12,
                border: `2px solid ${C.ink}`,
                background: C.card,
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                color: C.muted,
              }}
            >
              ✕
            </button>

            <StrokeAnimation ref={strokes} word={w.h} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{w.p}</span>
              <button
                onClick={() => engine.audio.speak(w.h)}
                title="Nghe"
                aria-label="Nghe"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  border: `2px solid ${C.ink}`,
                  background: C.soft,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: shadow(2),
                }}
              >
                🔊
              </button>
              <button
                onClick={() => strokes.current?.play()}
                style={{
                  border: `2px solid ${C.ink}`,
                  background: C.soft,
                  borderRadius: 99,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: shadow(2),
                }}
              >
                ▶ Viết lại từng nét
              </button>
            </div>

            <div style={{ fontSize: 17, fontWeight: 700, color: C.body, marginTop: 12 }}>
              {(w.pos ? w.pos + ' · ' : '') + w.m}
            </div>

            {STORIES[w.h] && (
              <div
                style={{
                  background: C.soft,
                  border: '2px dashed #cbb98f',
                  borderRadius: 14,
                  padding: '12px 16px',
                  marginTop: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#7d6c4e',
                  textAlign: 'left',
                }}
              >
                🧠 {STORIES[w.h]}
              </div>
            )}

            {w.ex && (
              <div
                style={{
                  background: C.panel,
                  border: `2px solid ${C.line}`,
                  borderRadius: 14,
                  padding: '12px 16px',
                  marginTop: 12,
                  textAlign: 'left',
                }}
              >
                <div style={{ fontFamily: F.han, fontSize: 18, fontWeight: 700, lineHeight: 1.7 }}>{w.ex}</div>
                {w.exVi && (
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.muted2, marginTop: 4 }}>{w.exVi}</div>
                )}
              </div>
            )}

            {family.length > 0 && (
              <div style={{ marginTop: 14, textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    color: C.muted,
                    marginBottom: 6,
                  }}
                >
                  🔗 Từ họ hàng — dùng chung chữ Hán
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {family.map((f) => (
                    <button
                      key={f.h}
                      onClick={() => engine.bookPick(f)}
                      title={f.m}
                      style={{
                        border: `2px solid ${C.edge}`,
                        background: C.card,
                        borderRadius: 12,
                        padding: '5px 12px',
                        cursor: 'pointer',
                        fontFamily: F.han,
                        fontSize: 16,
                        fontWeight: 700,
                        color: C.ink,
                      }}
                    >
                      {f.h}
                      <span style={{ fontFamily: F.ui, fontSize: 11, color: C.muted, marginLeft: 6 }}>{f.m}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {IMAGES[w.h] && (
              <div
                role="img"
                aria-label="Ảnh minh họa"
                style={{
                  width: '100%',
                  maxWidth: 340,
                  height: 190,
                  margin: '14px auto 0',
                  borderRadius: 16,
                  border: `2px solid ${C.ink}`,
                  boxShadow: shadow(3),
                  backgroundImage: `url("${IMAGES[w.h]}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
