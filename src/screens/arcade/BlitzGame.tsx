import { useCallback, useEffect, useRef, useState } from 'react';
import type { Vocab } from '../../data';
import { useEngine } from '../../engine/useEngine';
import { shuffle } from '../../engine/questions';
import { C, F, shadow } from '../../theme';
import { ArcadeFrame, type GameOver } from './Frame';

/** Sáu cặp trên bàn cùng lúc — mười hai ô, vừa đủ để phải quét mắt chứ chưa rối. */
const PAIRS = 6;
const START_MS = 45000;
/** Trần đồng hồ: nối giỏi mấy cũng không được phép dồn thành một ván không bao giờ hết. */
const CAP_MS = 60000;
const WRONG_MS = 2500;

interface Tile {
  id: number;
  word: Vocab;
  kind: 'h' | 'm';
  /** Đang biến mất. */
  gone?: boolean;
}

/** Nối nhanh liên tiếp thì được cộng nhiều giờ hơn — đây là chỗ combo có ích thật. */
const bonusMs = (combo: number): number => 900 + Math.min(combo, 8) * 220;

/**
 * Nối Chữ Cấp Tốc.
 *
 * Chế độ Ghép Cặp có sẵn trong app chơi từng bàn bốn cặp, không đồng hồ, xong bàn thì
 * nghỉ. Trò này ngược lại: bàn không bao giờ hết, chỉ có đồng hồ hết. Nối đúng được
 * **cộng giờ**, nên chơi giỏi là kéo dài được ván — vòng lặp "thêm một cặp nữa" mà một
 * phiên có độ dài cố định không tạo ra được.
 *
 * Nối sai chỉ mất giờ, không tụt hộp SRS: trong một ván bấm giờ, bấm nhầm ô bên cạnh
 * là chuyện của ngón tay chứ không phải của trí nhớ.
 */
export function BlitzGame() {
  const engine = useEngine();
  // Chốt danh sách từ lúc mở trò. `engine.pools()` dựng mảng mới mỗi lần gọi, nên để
  // nó vào dependency là mỗi lần vẽ lại bàn lại được xếp lại một lần.
  const [pool] = useState(() => engine.pools().vocab);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [bad, setBad] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [left, setLeft] = useState(START_MS);
  const [over, setOver] = useState<GameOver | null>(null);

  const seq = useRef(0);
  const shownAt = useRef(Date.now());
  const running = useRef(true);
  const scoreRef = useRef(0);
  // Ô đang chọn cũng giữ ở ref, không chỉ ở state: hai cú chạm sát nhau rơi vào cùng
  // một nhịp render thì cú thứ hai vẫn đọc được cú thứ nhất.
  const selRef = useRef<number | null>(null);
  // Đồng hồ giữ luôn ở ref: `StrictMode` gọi hàm cập nhật state hai lần, mà hết giờ
  // là một hiệu ứng thật (cộng XP, ghi kỷ lục) — chạy hai lần là cộng đôi.
  const leftRef = useRef(START_MS);

  /** Một từ chưa có mặt trên bàn. */
  const freshWord = useCallback(
    (taken: Set<string>): Vocab | null => {
      const free = pool.filter((v) => !taken.has(v.h) && v.m);
      return free.length ? free[Math.floor(Math.random() * free.length)] : null;
    },
    [pool],
  );

  const makeBoard = useCallback((): Tile[] => {
    const taken = new Set<string>();
    const out: Tile[] = [];
    for (let i = 0; i < PAIRS; i++) {
      const w = freshWord(taken);
      if (!w) break;
      taken.add(w.h);
      out.push({ id: seq.current++, word: w, kind: 'h' });
      out.push({ id: seq.current++, word: w, kind: 'm' });
    }
    return shuffle(out);
  }, [freshWord]);

  const end = useCallback(() => {
    running.current = false;
    const final = scoreRef.current;
    setOver({ score: final, ...engine.arcadeFinish('blitz', final) });
  }, [engine]);

  const retry = useCallback(() => {
    running.current = true;
    scoreRef.current = 0;
    setScore(0);
    setCombo(0);
    leftRef.current = START_MS;
    setLeft(START_MS);
    choose(null);
    setBad([]);
    setOver(null);
    setTiles(makeBoard());
    shownAt.current = Date.now();
  }, [makeBoard]);

  useEffect(() => {
    setTiles(makeBoard());
    shownAt.current = Date.now();
    return () => {
      running.current = false;
    };
  }, [makeBoard]);

  useEffect(() => {
    if (over) return;
    const id = setInterval(() => {
      if (!running.current || document.hidden) return;
      leftRef.current = Math.max(0, leftRef.current - 100);
      setLeft(leftRef.current);
      if (leftRef.current <= 0) end();
    }, 100);
    return () => clearInterval(id);
  }, [over, end]);

  const choose = (id: number | null) => {
    selRef.current = id;
    setSel(id);
  };

  const tap = (t: Tile) => {
    if (over || t.gone) return;
    if (selRef.current === null) {
      choose(t.id);
      engine.audio.pick();
      return;
    }
    if (selRef.current === t.id) return choose(null);
    const first = tiles.find((x) => x.id === selRef.current);
    if (!first) return choose(t.id);

    const matched = first.word.h === t.word.h && first.kind !== t.kind;
    if (matched) {
      engine.arcadeAnswer(t.word, true, Date.now() - shownAt.current, 'match');
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      leftRef.current = Math.min(CAP_MS, leftRef.current + bonusMs(nextCombo));
      setLeft(leftRef.current);
      choose(null);
      shownAt.current = Date.now();

      // Hai ô vừa dọn được thay bằng một cặp mới ngay tại chỗ, nên bàn không bao giờ vơi.
      setTiles((list) => {
        const taken = new Set(list.filter((x) => x.id !== first.id && x.id !== t.id).map((x) => x.word.h));
        const w = freshWord(taken);
        if (!w) return list.filter((x) => x.id !== first.id && x.id !== t.id);
        const born: Tile[] = [
          { id: seq.current++, word: w, kind: 'h' },
          { id: seq.current++, word: w, kind: 'm' },
        ];
        let k = 0;
        return list.map((x) => (x.id === first.id || x.id === t.id ? born[k++] : x));
      });
    } else {
      // Chỉ ghi vào nhật ký, không tụt hộp — xem ghi chú đầu tệp.
      const hanzi = first.kind === 'h' ? first : t.kind === 'h' ? t : null;
      if (hanzi) engine.arcadeAnswer(hanzi.word, false, Date.now() - shownAt.current, 'match', true);
      setCombo(0);
      setBad([first.id, t.id]);
      setTimeout(() => setBad([]), 320);
      choose(null);
      leftRef.current = Math.max(0, leftRef.current - WRONG_MS);
      setLeft(leftRef.current);
    }
  };

  const secs = (left / 1000).toFixed(1);
  const low = left < 10000;

  return (
    <ArcadeFrame
      id="blitz"
      score={score}
      lives={null}
      hud={
        <>
          {combo >= 2 && (
            <span
              style={{
                background: C.ochre,
                border: `2px solid ${C.ink}`,
                borderRadius: 99,
                padding: '3px 10px',
                fontSize: 13,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              🔥 ×{combo}
            </span>
          )}
          <span
            style={{
              background: low ? C.red : C.soft,
              color: low ? '#fff' : C.ink,
              border: `2px solid ${C.ink}`,
              borderRadius: 99,
              padding: '4px 14px',
              fontSize: 15,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              animation: low ? 'pulse .8s ease infinite' : undefined,
            }}
          >
            ⏱ {secs}s
          </span>
        </>
      }
      over={over}
      onRetry={retry}
    >
      <div
        style={{
          background: C.card,
          border: `3px solid ${C.ink}`,
          borderRadius: 24,
          boxShadow: shadow(6),
          padding: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: 10,
        }}
      >
        {tiles.map((t) => {
          const isSel = sel === t.id;
          const isBad = bad.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => tap(t)}
              style={{
                minHeight: 74,
                borderRadius: 16,
                border: `3px solid ${isBad ? C.red : isSel ? C.ochre : C.edge}`,
                background: isBad ? C.badBg : isSel ? C.soft : C.panel,
                boxShadow: `3px 3px 0 ${isBad ? C.red : isSel ? C.ochre : C.edge}`,
                cursor: 'pointer',
                padding: '10px 12px',
                fontFamily: t.kind === 'h' ? F.han : F.ui,
                fontSize: t.kind === 'h' ? 30 : 15,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1.35,
                animation: isBad ? 'shake .3s ease' : 'pop .2s ease',
              }}
            >
              {t.kind === 'h' ? t.word.h : t.word.m}
            </button>
          );
        })}
      </div>

      <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 700, color: C.muted, textAlign: 'center' }}>
        Nối đúng được cộng giờ (combo càng cao cộng càng nhiều) · nối sai mất 2,5 giây
      </p>
    </ArcadeFrame>
  );
}
