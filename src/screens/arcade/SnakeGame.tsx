import { useEffect, useReducer, useRef, useState } from 'react';
import type { Vocab } from '../../data';
import { arcadeRound } from '../../engine/arcade';
import { useEngine } from '../../engine/useEngine';
import { C, F, shadow } from '../../theme';
import { ArcadeFrame, type GameOver } from './Frame';

const COLS = 15;
const ROWS = 12;

interface Cell {
  x: number;
  y: number;
}

interface Token extends Cell {
  word: Vocab;
  ok: boolean;
}

const same = (a: Cell, b: Cell): boolean => a.x === b.x && a.y === b.y;

/** Nhanh dần theo điểm, nhưng có sàn — dưới 110ms thì không còn kịp nghĩ, chỉ còn kịp lái. */
const tickFor = (score: number): number => Math.max(110, 250 - score * 7);

const start = (): Cell[] => [
  { x: 4, y: 6 },
  { x: 3, y: 6 },
  { x: 2, y: 6 },
];

interface Snake {
  body: Cell[];
  dir: Cell;
  /** Hướng vừa bấm, chỉ áp dụng ở nhịp kế — bấm hai phím trong một nhịp không làm rắn tự cắn. */
  queued: Cell | null;
  grow: number;
  tokens: Token[];
  target: Vocab | null;
  score: number;
  lives: number;
  over: GameOver | null;
  shownAt: number;
  flash: 'ok' | 'bad' | null;
  flashAt: number;
}

/**
 * Rắn Săn Chữ.
 *
 * Băng trên hiện NGHĨA tiếng Việt, ba chữ Hán nằm rải trên bàn, đúng một chữ khớp.
 * Vì phải lái tới tận nơi mới ăn được, trò này ép nhớ nghĩa → chữ và **giữ nó trong đầu
 * suốt mấy giây lái** — khác hẳn kiểu chọn một trong bốn ô rồi quên ngay.
 *
 * Đâm tường hay đâm vào mình thì mất một mạng và rắn về giữa bàn, chứ không hết ván ngay:
 * ba mạng là ba lần được chơi lại, còn chết một phát là hết thì chẳng ai học được gì.
 */
export function SnakeGame() {
  const engine = useEngine();
  const [pool] = useState(() => engine.pools().vocab);
  const [, force] = useReducer((n: number) => n + 1, 0);

  const g = useRef<Snake>({
    body: start(),
    dir: { x: 1, y: 0 },
    queued: null,
    grow: 0,
    tokens: [],
    target: null,
    score: 0,
    lives: 3,
    over: null,
    shownAt: Date.now(),
    flash: null,
    flashAt: 0,
  });

  /** Rải ba chữ vào ô trống. */
  const deal = () => {
    const round = arcadeRound(pool, 3);
    if (!round) return;
    const taken = g.current.body.slice();
    const placed: Token[] = [];
    for (const word of round.opts) {
      for (let tries = 0; tries < 200; tries++) {
        const c = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        if (taken.some((t) => same(t, c))) continue;
        taken.push(c);
        placed.push({ ...c, word, ok: word.h === round.word.h });
        break;
      }
    }
    g.current.target = round.word;
    g.current.tokens = placed;
    g.current.shownAt = Date.now();
  };

  const end = () => {
    const score = g.current.score;
    g.current.over = { score, ...engine.arcadeFinish('snake', score) };
  };

  const hurt = () => {
    g.current.flash = 'bad';
    g.current.flashAt = Date.now();
    g.current.lives -= 1;
    if (g.current.lives <= 0) end();
  };

  const respawn = () => {
    g.current.body = start();
    g.current.dir = { x: 1, y: 0 };
    g.current.queued = null;
    g.current.grow = 0;
  };

  const retry = () => {
    g.current = { ...g.current, score: 0, lives: 3, over: null, flash: null };
    respawn();
    deal();
    force();
  };

  const turn = (x: number, y: number) => {
    const d = g.current.dir;
    // Quay ngoắt 180° là tự đâm vào cổ mình — bỏ qua, đó không phải điều người chơi muốn.
    if (d.x === -x && d.y === -y) return;
    g.current.queued = { x, y };
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') turn(0, -1);
      else if (k === 'arrowdown' || k === 's') turn(0, 1);
      else if (k === 'arrowleft' || k === 'a') turn(-1, 0);
      else if (k === 'arrowright' || k === 'd') turn(1, 0);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    deal();
    force();
    let timer = 0;
    // setTimeout dây chuyền chứ không phải setInterval: nhịp đổi theo điểm, mà một
    // setInterval đã đặt thì không đổi chu kỳ được.
    const tick = () => {
      const s = g.current;
      timer = window.setTimeout(tick, tickFor(s.score));
      if (s.over || document.hidden) return;

      if (s.queued) {
        s.dir = s.queued;
        s.queued = null;
      }
      const head = { x: s.body[0].x + s.dir.x, y: s.body[0].y + s.dir.y };
      const wall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
      if (wall || s.body.some((c) => same(c, head))) {
        engine.audio.wrong();
        hurt();
        if (!s.over) {
          respawn();
          deal();
        }
        return force();
      }

      const eaten = s.tokens.find((t) => same(t, head));
      if (eaten) {
        engine.arcadeAnswer(eaten.word, eaten.ok, Date.now() - s.shownAt, 'm2h');
        if (eaten.ok) {
          s.grow += 2;
          s.score += 1;
          s.flash = 'ok';
          s.flashAt = Date.now();
          s.body = [head, ...s.body];
          deal();
          return force();
        }
        hurt();
        s.tokens = s.tokens.filter((t) => !same(t, head));
      }

      s.body = [head, ...s.body];
      if (s.grow > 0) s.grow--;
      else s.body.pop();
      if (s.flash && Date.now() - s.flashAt > 250) s.flash = null;
      force();
    };
    timer = window.setTimeout(tick, tickFor(0));
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = g.current;
  const bg = s.flash === 'ok' ? '#e9f5e6' : s.flash === 'bad' ? '#fbe7e2' : C.panel;

  return (
    <ArcadeFrame
      id="snake"
      score={s.score}
      lives={s.lives}
      hud={
        <span style={{ fontSize: 12, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap' }}>
          ←↑↓→ hoặc WASD
        </span>
      }
      over={s.over}
      onRetry={retry}
    >
      {/* Bàn quyết định bề ngang (theo chiều cao × tỉ lệ ô), băng đề bám theo bàn —
          nên cả hai luôn bằng nhau dù màn hình rộng cỡ nào. */}
      <div style={{ width: 'fit-content', margin: '0 auto', maxWidth: '100%' }}>
      <div
        style={{
          background: C.ink,
          color: C.soft,
          border: `3px solid ${C.ink}`,
          borderRadius: '20px 20px 0 0',
          padding: '12px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', opacity: 0.7 }}>
          ĂN CHỮ MANG NGHĨA NÀY
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.3 }}>{s.target?.m ?? '…'}</div>
      </div>

      <div
        style={{
          position: 'relative',
          // Cao trước, rộng suy ra từ tỉ lệ ô: khoá bề ngang bằng 100% thì trên màn
          // hình rộng bàn cao gần nghìn pixel, phải cuộn mới thấy hết con rắn.
          height: 'clamp(320px, 62vh, 720px)',
          aspectRatio: `${COLS} / ${ROWS}`,
          background: bg,
          border: `3px solid ${C.ink}`,
          borderTop: 'none',
          borderRadius: '0 0 20px 20px',
          boxShadow: shadow(6),
          overflow: 'hidden',
          backgroundImage: `linear-gradient(${C.line} 1px,transparent 1px),linear-gradient(90deg,${C.line} 1px,transparent 1px)`,
          backgroundSize: `${100 / COLS}% ${100 / ROWS}%`,
          transition: 'background-color .15s',
        }}
      >
        {s.tokens.map((t) => (
          <div
            key={t.word.h}
            style={{
              position: 'absolute',
              left: (t.x / COLS) * 100 + '%',
              top: (t.y / ROWS) * 100 + '%',
              width: 100 / COLS + '%',
              height: 100 / ROWS + '%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.han,
              fontSize: 'min(2.6vh, 22px)',
              fontWeight: 700,
              color: C.ink,
              background: C.soft,
              border: `2px solid ${C.ochre}`,
              borderRadius: 10,
              boxSizing: 'border-box',
            }}
          >
            {t.word.h}
          </div>
        ))}

        {s.body.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (c.x / COLS) * 100 + '%',
              top: (c.y / ROWS) * 100 + '%',
              width: 100 / COLS + '%',
              height: 100 / ROWS + '%',
              background: i === 0 ? C.ink : C.green,
              border: `2px solid ${C.ink}`,
              borderRadius: i === 0 ? 10 : 8,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'min(2.4vh, 20px)',
            }}
          >
            {i === 0 ? '🐍' : ''}
          </div>
        ))}
      </div>

      </div>

      {/* Bàn phím mũi tên trên màn hình, cho điện thoại. */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,56px)', gap: 6 }}>
          {(['', '↑', '', '←', '↓', '→'] as const).map((label, i) => {
            if (!label) return <span key={i} />;
            const move = { '↑': [0, -1], '↓': [0, 1], '←': [-1, 0], '→': [1, 0] }[label];
            return (
              <button
                key={i}
                onClick={() => turn(move[0], move[1])}
                aria-label={'Lái ' + label}
                style={{
                  height: 48,
                  border: `2px solid ${C.ink}`,
                  borderRadius: 12,
                  background: C.card,
                  fontSize: 20,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: shadow(2),
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </ArcadeFrame>
  );
}
