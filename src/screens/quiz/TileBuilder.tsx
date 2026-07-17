import { C, F } from '../../theme';
import type { AnyTileQ, GameState } from '../../engine/types';
import { useEngine } from '../../engine/useEngine';

/**
 * Build the answer from tiles — hanzi for `write`, whole words for `order`.
 * Tapping a filled slot returns that tile to the tray.
 */
export function TileBuilder({ q, st }: { q: AnyTileQ; st: GameState }) {
  const engine = useEngine();
  const wide = q.kind === 'order';

  return (
    <>
      <div
        style={{
          background: C.soft,
          border: `3px dashed #cbb98f`,
          borderRadius: 18,
          padding: '14px 30px',
          marginBottom: 20,
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
          maxWidth: 760,
        }}
      >
        {Array.from({ length: q.tlen }, (_, i) => {
          const ch = st.typed[i];
          return (
            <button
              key={i}
              onClick={() => engine.removeSlot(i)}
              title={ch ? 'Bấm để bỏ chữ này ra' : ''}
              disabled={!ch || st.checked}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '0 4px',
                fontFamily: F.han,
                fontSize: 40,
                fontWeight: 700,
                color: ch ? C.ink : '#cbb98f',
                cursor: ch && !st.checked ? 'pointer' : 'default',
                lineHeight: 1.2,
              }}
            >
              {ch || '＿'}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 760 }}>
        {q.tiles.map((ch, i) => {
          const used = st.usedTiles.includes(i);
          return (
            <button
              key={i}
              onClick={() => engine.pick(i)}
              disabled={st.checked}
              style={{
                position: 'relative',
                minWidth: wide ? 64 : 72,
                height: wide ? 64 : 72,
                padding: wide ? '0 18px' : 0,
                borderRadius: 16,
                border: `3px solid ${used ? C.line : C.ink}`,
                background: used ? '#f2ead8' : C.card,
                color: used ? '#c9bb9c' : C.ink,
                fontFamily: F.han,
                fontSize: wide ? 26 : 32,
                fontWeight: 700,
                cursor: used ? 'default' : 'pointer',
                boxShadow: used ? 'none' : '3px 3px 0 ' + C.ink,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 5,
                  left: 7,
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  background: used ? '#c9bb9c' : C.ink,
                  color: C.soft,
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: F.ui,
                }}
              >
                {i + 1}
              </span>
              {ch}
            </button>
          );
        })}
      </div>

      <button
        onClick={engine.undo}
        style={{
          marginTop: 18,
          background: C.card,
          border: `2px solid ${C.ink}`,
          borderRadius: 12,
          padding: '8px 18px',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          color: C.muted,
        }}
      >
        ⌫ Xoá (Backspace)
      </button>
    </>
  );
}
