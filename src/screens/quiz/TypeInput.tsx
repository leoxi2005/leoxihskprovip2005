import { useEffect, useRef } from 'react';
import { C, F } from '../../theme';
import type { GameState } from '../../engine/types';
import { useEngine } from '../../engine/useEngine';

/** Free-text hanzi answer, typed with the OS Chinese IME. */
export function TypeInput({ st }: { st: GameState }) {
  const engine = useEngine();
  const ref = useRef<HTMLInputElement>(null);

  // The engine decides when to focus (on each new type/dict question).
  useEffect(() => {
    engine.focusInput = () => ref.current?.focus();
    return () => {
      engine.focusInput = undefined;
    };
  }, [engine]);

  const bd = st.checked ? (st.correct ? C.green : C.red) : C.ink;
  const bg = st.checked ? (st.correct ? C.okBg : C.badBg) : C.card;

  return (
    <div style={{ width: '100%', maxWidth: 760, display: 'flex', justifyContent: 'center' }}>
      <input
        ref={ref}
        value={st.typedText}
        onChange={(e) => engine.setTyped(e.target.value)}
        placeholder="输入汉字…"
        aria-label="Gõ chữ Hán"
        autoComplete="off"
        spellCheck={false}
        readOnly={st.checked}
        style={{
          fontFamily: F.han,
          fontSize: 44,
          fontWeight: 700,
          textAlign: 'center',
          width: '100%',
          maxWidth: 420,
          padding: '14px 20px',
          border: `3px solid ${bd}`,
          borderRadius: 18,
          background: bg,
          color: C.ink,
          outline: 'none',
          boxShadow: `4px 4px 0 ${bd}`,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
