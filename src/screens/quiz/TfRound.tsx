import { Bar } from '../../components/Bar';
import { C, F } from '../../theme';
import type { GameState, TfQ } from '../../engine/types';
import { useEngine } from '../../engine/useEngine';

const btn = (bg: string) => ({
  background: bg,
  color: '#fff',
  border: `3px solid ${C.ink}`,
  borderRadius: 16,
  padding: '16px 36px',
  fontSize: 20,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '4px 4px 0 ' + C.ink,
  fontFamily: F.ui,
});

/** Lightning round: is this really the meaning? 6 seconds, keys 1 / 2. */
export function TfRound({ q, st }: { q: TfQ; st: GameState }) {
  const engine = useEngine();

  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <Bar
        pct={st.tfLeft}
        height={14}
        // Turns solid red in the last third as a warning.
        fill={st.tfLeft > 35 ? 'linear-gradient(90deg,#e8a93c,#c94f38)' : C.red}
        transition="width .1s linear"
        style={{ width: '100%' }}
        label="Thời gian còn lại"
      />
      <div
        style={{
          background: C.card,
          border: `3px solid ${C.ink}`,
          borderRadius: 22,
          boxShadow: '5px 5px 0 ' + C.ink,
          padding: '24px 34px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: F.han, fontSize: 48, fontWeight: 700 }}>{q.w.h}</span>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.muted }}>=</span>
        <span style={{ fontSize: 22, fontWeight: 800, maxWidth: 280, lineHeight: 1.35 }}>{q.shown}</span>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.muted }}>?</span>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button onClick={engine.tfYes} disabled={st.checked} className="lift lift-4" style={btn(C.green)}>
          ✓ Đúng (1)
        </button>
        <button onClick={engine.tfNo} disabled={st.checked} className="lift lift-4" style={btn(C.red)}>
          ✗ Sai (2)
        </button>
      </div>
    </div>
  );
}
