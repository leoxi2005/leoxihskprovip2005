import { useMemo, useRef, useState } from 'react';
import { IMAGES, STORIES } from '../data';
import { useEngine, useGameState } from '../engine/useEngine';
import { StrokeAnimation, type StrokeAnimationHandle } from '../components/StrokeAnimation';
import { C, F, shadow } from '../theme';

export function Notebook() {
  const engine = useEngine();
  const st = useGameState();
  const [query, setQuery] = useState('');
  const strokes = useRef<StrokeAnimationHandle>(null);

  const vocab = engine.pools().vocab;
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return vocab;
    // Match hanzi, pinyin (with or without tone marks) or the Vietnamese meaning.
    const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return vocab.filter(
      (w) =>
        w.h.includes(needle) ||
        plain(w.p).includes(plain(needle)) ||
        plain(w.m).includes(plain(needle)),
    );
  }, [vocab, query]);

  const w = st.bookWord;

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
          Chạm vào từ để xem hoạt hình viết từng nét ✍️, nghe phát âm 🔊 và mẹo nhớ 🧠 · Chấm xanh = đã thuộc, vàng =
          đang học
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))', gap: 10 }}>
          {shown.map((v) => {
            const e = engine.srs['w:' + v.h];
            // Green once the word reaches box 3; amber while it's still in rotation.
            const dot = e ? (e.box >= 3 ? C.green : C.ochre) : C.edge;
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
