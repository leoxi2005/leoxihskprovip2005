import { useEffect, useReducer, useRef, useState } from 'react';
import type { Vocab } from '../../data';
import { arcadeRound } from '../../engine/arcade';
import { useEngine } from '../../engine/useEngine';
import { C, F, shadow } from '../../theme';
import { ArcadeFrame, type GameOver } from './Frame';

/** Vàng ở tầng 1. */
const SEED = 10;
/** Mỗi tầng nhân lên bằng này. */
const GROWTH = 1.6;

/** Đồng hồ siết dần: tầng 1 thong thả, tầng 15 trở đi là phản xạ thuần. */
const floorMs = (floor: number): number => Math.max(3500, 9000 - floor * 380);

/** Vàng đang giữ sau khi qua `floor` tầng. */
const potAt = (floor: number): number => Math.round(SEED * Math.pow(GROWTH, Math.max(0, floor - 1)));

interface Tower {
  round: { word: Vocab; opts: Vocab[] } | null;
  /** Tầng đang đứng, tính từ 1. */
  floor: number;
  picked: number | null;
  pickedOk: boolean;
  over: GameOver | null;
  /** Đã rút được bao nhiêu vàng, 0 nghĩa là mất trắng. */
  banked: number;
  shownAt: number;
  /** Mốc hết giờ của tầng này. */
  deadline: number;
}

/**
 * Tháp Vàng — trò duy nhất trong app mà bạn **tự chọn lúc dừng**.
 *
 * Mỗi tầng leo được nhân số vàng lên 1,6 lần, nhưng một câu sai (hoặc hết giờ) là mất
 * sạch những gì đã tích. Nút "Rút" lúc nào cũng ở đó.
 *
 * Cái hay không nằm ở câu hỏi mà ở **quyết định**: ở tầng 8 bạn đang giữ 270 vàng,
 * leo thêm một tầng thành 430 — và bạn phải tự trả lời câu "mình có thật sự nhớ chắc
 * từ này không?" trước khi bấm. Không chế độ ôn tập nào bắt người học tự đánh giá độ
 * chắc chắn của chính mình, mà đó lại đúng là thứ quyết định điểm trong phòng thi.
 */
export function TowerGame() {
  const engine = useEngine();
  const [pool] = useState(() => engine.pools().vocab);
  const [, force] = useReducer((n: number) => n + 1, 0);

  const g = useRef<Tower>({
    round: null,
    floor: 1,
    picked: null,
    pickedOk: false,
    over: null,
    banked: 0,
    shownAt: Date.now(),
    deadline: Date.now() + floorMs(1),
  });

  const deal = () => {
    const r = arcadeRound(pool, 4);
    if (!r) return;
    const s = g.current;
    s.round = r;
    s.picked = null;
    s.shownAt = Date.now();
    s.deadline = Date.now() + floorMs(s.floor);
  };

  const finish = (banked: number) => {
    const s = g.current;
    s.banked = banked;
    if (banked > 0) engine.arcadeBank(banked);
    // Điểm của trò này là SỐ TẦNG, không phải số vàng: vàng còn phụ thuộc lúc rút,
    // còn tầng thì đúng là leo được tới đâu.
    s.over = { score: s.floor - 1, ...engine.arcadeFinish('tower', s.floor - 1) };
    if (banked > 0) engine.burst(100);
  };

  const retry = () => {
    g.current = { ...g.current, floor: 1, picked: null, over: null, banked: 0 };
    deal();
    force();
  };

  const cashOut = () => {
    const s = g.current;
    if (s.over || s.floor <= 1) return;
    engine.audio.finale();
    finish(potAt(s.floor));
  };

  const pick = (i: number) => {
    const s = g.current;
    if (s.over || !s.round || s.picked !== null) return;
    const chosen = s.round.opts[i];
    const ok = chosen.h === s.round.word.h;
    engine.arcadeAnswer(chosen, ok, Date.now() - s.shownAt, 'm2h');
    s.picked = i;
    s.pickedOk = ok;
    if (ok) {
      s.floor += 1;
      setTimeout(() => {
        if (!g.current.over) {
          deal();
          force();
        }
      }, 320);
    } else {
      setTimeout(() => finish(0), 500);
    }
    force();
  };

  useEffect(() => {
    deal();
    force();
    const id = setInterval(() => {
      const s = g.current;
      if (s.over) return;
      // Tab bị ẩn thì đẩy hạn chót lùi ra: rời máy một phút về thấy mất sạch vàng là
      // thua vì cái tab, không phải vì không nhớ từ.
      if (document.hidden) {
        s.deadline += 100;
        return;
      }
      if (s.picked === null && Date.now() > s.deadline) {
        if (s.round) engine.arcadeAnswer(s.round.word, false, floorMs(s.floor), 'm2h', true);
        engine.audio.wrong();
        s.picked = -1;
        finish(0);
      }
      force();
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = g.current;
  const pot = potAt(s.floor);
  const next = potAt(s.floor + 1);
  const total = floorMs(s.floor);
  const left = Math.max(0, s.deadline - Date.now());
  const pct = Math.round((left / total) * 100);

  return (
    <ArcadeFrame
      id="tower"
      score={s.floor - 1}
      lives={null}
      hud={
        <span
          style={{
            background: '#f7e6b8',
            color: C.gold,
            border: `2px solid ${C.ink}`,
            borderRadius: 99,
            padding: '4px 14px',
            fontSize: 14,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          🪙 {pot} đang treo
        </span>
      }
      over={s.over}
      onRetry={retry}
    >
      <div
        style={{
          background: C.card,
          border: `3px solid ${C.ink}`,
          borderRadius: 24,
          boxShadow: shadow(6),
          padding: 'clamp(14px, 2.4vh, 26px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 'clamp(20px,3vh,28px)', fontWeight: 800 }}>🗼 Tầng {s.floor}</span>
          <div
            style={{
              flex: 1,
              minWidth: 160,
              height: 16,
              background: C.track,
              border: `2px solid ${C.ink}`,
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: pct + '%',
                height: '100%',
                background: pct > 35 ? 'linear-gradient(90deg,#e8a93c,#c94f38)' : C.red,
                transition: 'width .1s linear',
              }}
            />
          </div>
          <button
            onClick={cashOut}
            disabled={s.floor <= 1 || !!s.over}
            style={{
              background: s.floor > 1 ? C.green : C.edge,
              color: '#fff',
              border: `3px solid ${C.ink}`,
              borderRadius: 14,
              padding: '10px 22px',
              fontSize: 16,
              fontWeight: 800,
              fontFamily: F.ui,
              cursor: s.floor > 1 ? 'pointer' : 'default',
              boxShadow: s.floor > 1 ? shadow(3) : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            💰 Rút {pot} vàng
          </button>
        </div>

        <div
          style={{
            textAlign: 'center',
            margin: 'clamp(10px, 2.4vh, 26px) 0',
            padding: 'clamp(10px, 2vh, 22px)',
            background: C.panel,
            border: `2px solid ${C.line}`,
            borderRadius: 18,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', color: C.muted }}>
            ĐÚNG THÌ LÊN TẦNG {s.floor + 1} — {next} VÀNG · SAI LÀ MẤT SẠCH
          </div>
          <div style={{ fontSize: 'clamp(24px, 4.4vh, 40px)', fontWeight: 800, lineHeight: 1.3 }}>
            {s.round?.word.m ?? '…'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'clamp(8px,1.5vh,16px)' }}>
          {s.round?.opts.map((o, i) => {
            const isPick = s.picked === i;
            const bd = isPick ? (s.pickedOk ? C.green : C.red) : C.edge;
            return (
              <button
                key={o.h}
                onClick={() => pick(i)}
                style={{
                  minHeight: 'clamp(72px, 12vh, 130px)',
                  borderRadius: 18,
                  border: `3px solid ${bd}`,
                  background: isPick ? (s.pickedOk ? C.okBg : C.badBg) : C.panel,
                  boxShadow: `3px 3px 0 ${bd}`,
                  fontFamily: F.han,
                  fontSize: 'clamp(26px, 4.6vh, 46px)',
                  fontWeight: 700,
                  color: C.ink,
                  cursor: 'pointer',
                  animation: isPick && !s.pickedOk ? 'shake .3s ease' : undefined,
                }}
              >
                {o.h}
              </button>
            );
          })}
        </div>
      </div>

      {s.over && (
        <p
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 800,
            color: '#fff',
            zIndex: 21,
            margin: 0,
          }}
        >
          {s.banked > 0 ? `💰 Rút an toàn ${s.banked} vàng` : '💥 Mất sạch số vàng đang treo'}
        </p>
      )}
    </ArcadeFrame>
  );
}
