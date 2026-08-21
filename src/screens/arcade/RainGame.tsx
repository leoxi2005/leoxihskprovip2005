import { useEffect, useReducer, useRef, useState } from 'react';
import type { Vocab } from '../../data';
import { arcadeRound } from '../../engine/arcade';
import { useEngine } from '../../engine/useEngine';
import { C, F, shadow } from '../../theme';
import { ArcadeFrame, type GameOver } from './Frame';

/**
 * Chiều cao sân, tính theo màn hình chứ không phải một con số cố định.
 *
 * Bản đầu khoá cứng 420px: trên màn hình rộng thì sân thành một cái tem, chữ bé tí và
 * chẳng có cảm giác gì là đang chơi.
 */
const BOARD_H = 'clamp(360px, 66vh, 780px)';
/** Chiều cao mà mọi con số tốc độ bên dưới được chỉnh theo. */
const REF_H = 480;

interface Drop {
  key: number;
  word: Vocab;
  target: boolean;
  /** Phần trăm bề ngang. */
  x: number;
  y: number;
  /** Pixel mỗi giây. */
  vy: number;
  /** Vừa bị bắt — giữ lại một nhịp để nhìn thấy nó nổ. */
  hit: 'ok' | 'bad' | null;
  /** Mốc thời gian để dọn quân đã nổ. */
  hitAt: number;
}

interface Rain {
  drops: Drop[];
  target: Vocab | null;
  score: number;
  lives: number;
  over: GameOver | null;
  /** Mốc bắt đầu lượt, để đo thời gian trả lời. */
  shownAt: number;
  /** Mốc rung màn hình. */
  shakeAt: number;
  seq: number;
}

/** Mỗi 4 chữ bắt được thì lên một cấp: rơi nhanh hơn và đông hơn. */
const levelOf = (score: number): number => Math.floor(score / 4);
const dropCount = (level: number): number => Math.min(6, 3 + Math.floor(level / 2));

/**
 * Tốc độ rơi, tính theo chiều cao SÂN chứ không theo pixel tuyệt đối.
 *
 * Sân cao gấp đôi mà tốc độ giữ nguyên thì mỗi chữ có gấp đôi thời gian rơi, tức là
 * màn hình càng to trò càng dễ. Nhân theo tỉ lệ thì thời gian rơi giữ nguyên trên mọi máy.
 */
const fallSpeed = (level: number, h: number): number => (44 + level * 8) * (h / REF_H);

/** Cạnh một quân chữ, co giãn theo sân. */
const tileSize = (h: number): number => Math.max(58, Math.min(104, h * 0.15));

/**
 * Mưa Chữ — trò tìm-và-bắt.
 *
 * Nghĩa tiếng Việt hiện trên băng, mấy chữ Hán rơi xuống, đúng một chữ khớp. Cái khó
 * không phải nhớ nghĩa mà là **tìm ra nó giữa những chữ khác trước khi nó chạm đất** —
 * đúng thứ mất điểm ở phần đọc của đề thật, nơi bốn đáp án nằm cạnh nhau và đồng hồ đang chạy.
 *
 * Bắt nhầm mất một mạng. Để chữ đích rơi mất cũng mất một mạng, nhưng lượt đó KHÔNG bị
 * tụt hộp SRS: nhìn sót một chữ đang rơi là lỗi phản xạ, không phải bằng chứng rằng bạn quên từ.
 *
 * Toàn bộ trạng thái nằm trong một `ref` và mỗi khung hình gọi `force()` để vẽ lại.
 * Không dùng `setState` trong vòng lặp là có lý do: `StrictMode` gọi hàm cập nhật hai
 * lần, mà ở đây mỗi lần cập nhật có kèm hiệu ứng thật (trừ mạng, ghi SRS) — chạy hai
 * lần là mất hai mạng cho một chữ.
 */
export function RainGame() {
  const engine = useEngine();
  // Chốt danh sách từ ngay lúc mở trò: `engine.pools()` dựng mảng mới mỗi lần gọi,
  // để nó vào dependency là mỗi khung hình lại thay bàn một lần.
  const [pool] = useState(() => engine.pools().vocab);
  const [, force] = useReducer((n: number) => n + 1, 0);

  const boxRef = useRef<HTMLDivElement | null>(null);
  /** Chiều cao sân thật, đo từ DOM — mọi phép tính rơi đều dựa vào con số này. */
  const hRef = useRef(REF_H);

  const g = useRef<Rain>({
    drops: [],
    target: null,
    score: 0,
    lives: 3,
    over: null,
    shownAt: Date.now(),
    shakeAt: 0,
    seq: 0,
  });

  const spawn = (level: number) => {
    const round = arcadeRound(pool, dropCount(level));
    if (!round) return;
    const h = hRef.current;
    const tile = tileSize(h);
    const v = fallSpeed(level, h);
    const lanes = round.opts.length;
    g.current.target = round.word;
    g.current.shownAt = Date.now();
    g.current.drops = round.opts.map((word, i) => ({
      key: g.current.seq++,
      word,
      target: word.h === round.word.h,
      // Một chữ một làn, lệch ngẫu nhiên trong làn để bàn không thành một hàng thẳng.
      x: ((i + 0.5) / lanes) * 100 + (Math.random() * 8 - 4),
      y: -tile - i * (tile * 0.85) - Math.random() * 40,
      vy: v * (0.88 + Math.random() * 0.28),
      hit: null,
      hitAt: 0,
    }));
  };

  const end = () => {
    const score = g.current.score;
    g.current.over = { score, ...engine.arcadeFinish('rain', score) };
    g.current.drops = [];
  };

  const loseLife = () => {
    g.current.shakeAt = Date.now();
    g.current.lives -= 1;
    if (g.current.lives <= 0) end();
  };

  const retry = () => {
    g.current = { ...g.current, drops: [], score: 0, lives: 3, over: null, shakeAt: 0 };
    spawn(0);
    force();
  };

  const grab = (d: Drop) => {
    const s = g.current;
    if (s.over || d.hit) return;
    engine.arcadeAnswer(d.word, d.target, Date.now() - s.shownAt, 'm2h');
    d.hit = d.target ? 'ok' : 'bad';
    d.hitAt = Date.now();
    if (d.target) {
      s.score += 1;
      // Những chữ còn lại biến mất ngay, chỉ giữ lại quân vừa bắt cho thấy nó xanh.
      s.drops = [d];
      s.target = null;
    } else {
      loseLife();
    }
    force();
  };

  // Đo sân và đo lại mỗi khi cửa sổ đổi cỡ.
  useEffect(() => {
    const measure = () => {
      const h = boxRef.current?.clientHeight;
      if (h) hRef.current = h;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    spawn(0);
    force();
    let raf = 0;
    let prev = performance.now();
    // Dùng rAF nên tab bị ẩn là mọi thứ đứng lại — chữ không được phép rơi mất khi
    // người chơi đang ở tab khác.
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const s = g.current;
      if (s.over) return;

      let missed = false;
      const alive: Drop[] = [];
      for (const d of s.drops) {
        // Quân đã nổ nằm lại 200ms cho thấy rồi mới biến mất.
        if (d.hit) {
          if (Date.now() - d.hitAt < 200) alive.push(d);
          continue;
        }
        d.y += d.vy * dt;
        if (d.y > hRef.current) {
          if (d.target) missed = true;
          continue;
        }
        alive.push(d);
      }
      s.drops = alive;

      if (missed) {
        // Rơi mất chữ đích: ghi nhật ký nhưng không tụt hộp.
        if (s.target) engine.arcadeAnswer(s.target, false, Date.now() - s.shownAt, 'm2h', true);
        s.target = null;
        s.drops = [];
        loseLife();
      }
      // Bàn sạch và chưa thua thì rải lượt mới.
      if (!s.over && !s.target && s.drops.every((d) => d.hit)) spawn(levelOf(s.score));
      force();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // Chạy đúng một lần: vòng lặp tự đọc trạng thái mới nhất qua `g.current`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = g.current;
  const level = levelOf(s.score);
  const tile = tileSize(hRef.current);

  return (
    <ArcadeFrame
      id="rain"
      score={s.score}
      lives={s.lives}
      hud={
        <span style={{ fontSize: 13, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap' }}>
          Cấp {level + 1}
        </span>
      }
      over={s.over}
      onRetry={retry}
    >
      <div
        key={s.shakeAt}
        ref={boxRef}
        style={{
          background: 'linear-gradient(180deg,#eaf1f6,#fdf8ec)',
          border: `3px solid ${C.ink}`,
          borderRadius: 24,
          boxShadow: shadow(6),
          height: BOARD_H,
          position: 'relative',
          overflow: 'hidden',
          animation: s.shakeAt ? 'shake .3s ease' : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: C.ink,
            color: C.soft,
            padding: '12px 16px',
            textAlign: 'center',
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', opacity: 0.7 }}>
            BẮT CHỮ MANG NGHĨA NÀY
          </div>
          <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.3 }}>{s.target?.m ?? '…'}</div>
        </div>

        {s.drops.map((d) => (
          <button
            key={d.key}
            onClick={() => grab(d)}
            style={{
              position: 'absolute',
              left: d.x + '%',
              top: d.y,
              transform: 'translateX(-50%)',
              // Bề ngang co theo chữ: 乒乓球 ba chữ mà ép vào ô vuông là tràn ra ngoài.
              minWidth: tile,
              height: tile,
              padding: '0 12px',
              whiteSpace: 'nowrap',
              borderRadius: 16,
              border: `3px solid ${C.ink}`,
              background: d.hit === 'ok' ? C.green : d.hit === 'bad' ? C.red : C.card,
              color: d.hit ? '#fff' : C.ink,
              fontFamily: F.han,
              fontSize: Math.round(tile * 0.42),
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: shadow(3),
            }}
          >
            {d.word.h}
          </button>
        ))}

        {/* Vạch đáy: chữ đích chạm vạch này là mất một mạng. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            background: `repeating-linear-gradient(90deg,${C.red} 0 14px,${C.ochre} 14px 28px)`,
          }}
        />
      </div>
    </ArcadeFrame>
  );
}
