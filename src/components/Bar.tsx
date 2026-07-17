import type { CSSProperties } from 'react';
import { C } from '../theme';

interface BarProps {
  /** 0–100 */
  pct: number;
  fill: string;
  height?: number;
  /** TF timer needs a linear, near-instant transition instead of the default ease. */
  transition?: string;
  style?: CSSProperties;
  label?: string;
}

/** The pill progress bar used for level, daily goal, question progress and the TF timer. */
export function Bar({ pct, fill, height = 12, transition = 'width .35s', style, label }: BarProps) {
  return (
    <div
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-valuenow={label ? Math.round(pct) : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      style={{
        height,
        background: C.track,
        border: `2px solid ${C.ink}`,
        borderRadius: 99,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ width: pct + '%', height: '100%', background: fill, borderRadius: 99, transition }} />
    </div>
  );
}
