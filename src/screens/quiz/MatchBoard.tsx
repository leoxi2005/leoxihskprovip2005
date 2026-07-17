import type { CSSProperties } from 'react';
import { C, F } from '../../theme';
import type { GameState, MatchQ } from '../../engine/types';
import { useEngine } from '../../engine/useEngine';

const BASE: CSSProperties = {
  position: 'relative',
  border: `3px solid ${C.edge}`,
  background: C.card,
  borderRadius: 16,
  padding: '14px 12px',
  cursor: 'pointer',
  boxShadow: '3px 3px 0 ' + C.edge,
  minHeight: 62,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all .15s',
};

const keyBadge = (done: boolean): CSSProperties => ({
  position: 'absolute',
  top: 6,
  left: 8,
  width: 20,
  height: 20,
  borderRadius: 6,
  background: done ? '#c9bb9c' : C.ink,
  color: C.soft,
  fontSize: 11,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: F.ui,
});

const solved: CSSProperties = {
  background: C.okBg,
  border: `3px solid ${C.green}`,
  boxShadow: 'none',
  opacity: 0.55,
  cursor: 'default',
};

/** 4 hanzi ↔ 4 meanings. Pick a hanzi (keys 1–4), then its meaning (keys 5–8). */
export function MatchBoard({ q, st }: { q: MatchQ; st: GameState }) {
  const engine = useEngine();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 680 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {q.pairs.map((w, i) => {
          const done = !!st.mDone[i];
          const sel = st.mSel === i;
          return (
            <button
              key={w.h}
              onClick={() => engine.pickL(i)}
              disabled={done || st.checked}
              aria-pressed={sel}
              style={{
                ...BASE,
                fontFamily: F.han,
                fontSize: 28,
                fontWeight: 700,
                ...(done
                  ? solved
                  : sel
                    ? { background: C.soft, border: `3px solid ${C.ochre}`, boxShadow: '3px 3px 0 ' + C.ochre }
                    : {}),
              }}
            >
              <span style={keyBadge(done)}>{i + 1}</span>
              {w.h}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {q.rightOrder.map((pi, j) => {
          const done = !!st.mDone[pi];
          return (
            <button
              key={q.pairs[pi].h}
              onClick={() => engine.pickR(j)}
              disabled={done || st.checked}
              style={{
                ...BASE,
                fontFamily: F.ui,
                fontSize: 15,
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.35,
                ...(done ? solved : {}),
              }}
            >
              <span style={keyBadge(done)}>{q.pairs.length + j + 1}</span>
              {q.pairs[pi].m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
