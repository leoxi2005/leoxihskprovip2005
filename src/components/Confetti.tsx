import { useEffect, useRef } from 'react';
import { useEngine } from '../engine/useEngine';

const COLORS = ['#c94f38', '#e8a93c', '#4f9d5f', '#3b7ea1', '#d67bb0'];

/**
 * A fixed overlay the engine can fire pieces into. Pieces are raw DOM nodes that
 * remove themselves — bursts are frequent and shouldn't churn React state.
 */
export function Confetti() {
  const engine = useEngine();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    engine.burst = (n: number) => {
      const host = ref.current;
      if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      for (let i = 0; i < n; i++) {
        const d = document.createElement('div');
        const s = 6 + Math.random() * 8;
        d.style.cssText =
          'position:absolute;top:-20px;left:' +
          Math.random() * 100 +
          '%;width:' +
          s +
          'px;height:' +
          s * 0.6 +
          'px;background:' +
          COLORS[i % 5] +
          ';border-radius:2px;transform:rotate(' +
          Math.random() * 360 +
          'deg);animation:fall ' +
          (0.9 + Math.random() * 0.9) +
          's linear forwards';
        host.appendChild(d);
        const t = setTimeout(() => {
          d.remove();
          timers.delete(t);
        }, 1900);
        timers.add(t);
      }
    };
    return () => {
      engine.burst = () => {};
      timers.forEach(clearTimeout);
    };
  }, [engine]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 99 }}
    />
  );
}
