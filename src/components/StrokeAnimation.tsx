import HanziWriter from 'hanzi-writer';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { C, F } from '../theme';

export interface StrokeAnimationHandle {
  /** Replay every character in order. */
  play: () => void;
}

const CJK = /[㐀-鿿]/;

/**
 * Stroke-order animation, one box per hanzi. Radicals are drawn in red.
 * Character outlines are fetched on demand by hanzi-writer.
 */
export function StrokeAnimation({ word, ref }: { word: string; ref?: Ref<StrokeAnimationHandle> }) {
  const host = useRef<HTMLDivElement>(null);
  const writers = useRef<HanziWriter[]>([]);
  const cancelled = useRef(false);

  const play = () => {
    cancelled.current = false;
    let i = 0;
    const step = () => {
      if (cancelled.current || i >= writers.current.length) return;
      const w = writers.current[i];
      w.hideCharacter();
      w.animateCharacter({
        onComplete: () => {
          i++;
          setTimeout(step, 250);
        },
      });
    };
    step();
  };

  useImperativeHandle(ref, () => ({ play }));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    cancelled.current = false;
    el.innerHTML = '';

    writers.current = word
      .split('')
      .filter((c) => CJK.test(c))
      .map((c) => {
        const box = document.createElement('div');
        box.style.cssText = `width:110px;height:110px;background:${C.soft};border:2px dashed #cbb98f;border-radius:14px`;
        el.appendChild(box);
        try {
          return HanziWriter.create(box, c, {
            width: 106,
            height: 106,
            padding: 8,
            strokeColor: C.ink,
            radicalColor: C.red,
            outlineColor: '#e8dfc8',
            showCharacter: false,
            strokeAnimationSpeed: 1.1,
            delayBetweenStrokes: 90,
          });
        } catch {
          // No stroke data for this character — show it as plain text instead.
          box.textContent = c;
          box.style.font = `700 60px ${F.han}`;
          box.style.display = 'flex';
          box.style.alignItems = 'center';
          box.style.justifyContent = 'center';
          return null;
        }
      })
      .filter((w): w is HanziWriter => w !== null);

    play();
    return () => {
      cancelled.current = true;
      writers.current = [];
      if (el) el.innerHTML = '';
    };
  }, [word]);

  return <div ref={host} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0 12px' }} />;
}
