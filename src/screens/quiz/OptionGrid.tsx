import type { CSSProperties } from 'react';
import { C, F } from '../../theme';
import type { AnyChoiceQ, GameState } from '../../engine/types';
import { useEngine } from '../../engine/useEngine';

const KEY_BADGE: CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 10,
  width: 22,
  height: 22,
  borderRadius: 7,
  background: C.ink,
  color: C.soft,
  fontSize: 12,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: F.ui,
};

/** 2×2 grid of answer options; after checking, the right one goes green and the rest fade. */
export function OptionGrid({ q, st }: { q: AnyChoiceQ; st: GameState }) {
  const engine = useEngine();
  const hanziOpt =
    q.kind === 'm2h' || q.kind === 'a2h' || q.kind === 'gram' || q.kind === 'pass' || q.kind === 'song' || q.kind === 'conf';
  const meaningQ = q.kind === 'h2m' || q.kind === 'flash';
  // Sentence meanings are long — one per row, left-aligned.
  const left = q.kind === 'sent';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: left ? '1fr' : 'repeat(auto-fit,minmax(240px,1fr))',
        gap: 14,
        width: '100%',
        maxWidth: 800,
      }}
    >
      {q.opts.map((o, i) => {
        const isSel = st.sel === i;
        const isAns = i === q.ans;
        let bg: string = C.card;
        let bd: string = C.edge;
        let op = 1;
        let boxShadow = '3px 3px 0 ' + C.edge;

        if (!st.checked && isSel) {
          bg = C.soft;
          bd = C.ochre;
          boxShadow = '3px 3px 0 ' + C.ochre;
        }
        if (st.checked) {
          if (isAns) {
            bg = C.okBg;
            bd = C.green;
            boxShadow = '3px 3px 0 ' + C.green;
          } else if (isSel) {
            bg = C.badBg;
            bd = C.red;
            boxShadow = '3px 3px 0 ' + C.red;
          } else {
            op = 0.45;
            boxShadow = 'none';
          }
        }

        let main: string;
        if (meaningQ || q.kind === 'sent') main = typeof o === 'string' ? o : o.m;
        else if (q.kind === 'gram' || q.kind === 'pass' || q.kind === 'conf') main = o as string;
        else main = (o as { h: string }).h;

        // Revealing pinyin only after the check keeps it from giving the answer away.
        let sub = '';
        if (st.checked && typeof o !== 'string') {
          if (q.kind === 'm2h' || q.kind === 'a2h') sub = o.p + ' · ' + o.m;
          else if (meaningQ) sub = o.h + ' · ' + o.p;
        }

        return (
          <button
            key={i}
            onClick={() => engine.pick(i)}
            disabled={st.checked}
            aria-pressed={isSel}
            style={{
              position: 'relative',
              background: bg,
              border: `3px solid ${bd}`,
              borderRadius: 18,
              padding: left ? '16px 18px 16px 46px' : '18px 16px',
              cursor: st.checked ? 'default' : 'pointer',
              opacity: op,
              boxShadow,
              textAlign: left ? 'left' : 'center',
              transition: 'all .15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: left ? 'flex-start' : 'center',
              justifyContent: 'center',
              minHeight: 66,
              animation: st.checked && isSel && !st.correct ? 'shake .3s ease' : 'none',
            }}
          >
            <span style={KEY_BADGE}>{i + 1}</span>
            <span
              style={
                hanziOpt
                  ? {
                      fontFamily: F.han,
                      fontSize: q.kind === 'm2h' || q.kind === 'a2h' || q.kind === 'conf' ? 30 : 23,
                      fontWeight: 700,
                      color: C.ink,
                      lineHeight: 1.4,
                    }
                  : {
                      fontFamily: F.ui,
                      fontSize: left ? 15 : 17,
                      fontWeight: 700,
                      color: C.ink,
                      lineHeight: 1.45,
                    }
              }
            >
              {main}
            </span>
            {sub && (
              <span style={{ display: 'block', fontSize: 14, color: '#5e8f5a', fontWeight: 700, marginTop: 6 }}>
                {sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
