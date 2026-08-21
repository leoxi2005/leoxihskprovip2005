import { useEffect, useReducer, useRef, useState } from 'react';
import type { Vocab } from '../../data';
import { STARS_PER_TIER, TIERS, applyDuel, arcadeRound, loadRank, saveRank, type Rank } from '../../engine/arcade';
import { useEngine } from '../../engine/useEngine';
import { C, F, shadow } from '../../theme';
import { ArcadeFrame, type GameOver } from './Frame';

/** Ai đúng đủ ngần này câu trước thì thắng. */
const GOAL = 10;
/** Trả lời sai bị khoá tay ngần này — đủ để đối thủ vượt lên, chưa đủ để mất trận. */
const PENALTY_MS = 1600;
/**
 * Đếm ngược trước khi vào trận.
 *
 * Không có nó thì đồng hồ của đối thủ chạy ngay lúc màn hình hiện ra: người chơi còn
 * đang đọc câu đầu thì đã bị dẫn trước mấy điểm, và trận thua đó không nói lên điều gì
 * về việc họ nhớ từ hay không.
 */
const COUNTDOWN_MS = 3000;

interface Duel {
  round: { word: Vocab; opts: Vocab[] } | null;
  /** Số câu đúng của người chơi. */
  me: number;
  bot: number;
  /** Đáp án vừa chọn, để tô màu một nhịp. */
  picked: number | null;
  pickedOk: boolean;
  /** Bị khoá tay tới thời điểm này. */
  lockUntil: number;
  over: GameOver | null;
  won: boolean;
  promoted: boolean;
  demoted: boolean;
  rank: Rank;
  shownAt: number;
  /** Mốc đối thủ trả lời câu kế. */
  botAt: number;
  /** Mốc trận thật sự bắt đầu — trước đó là đếm ngược. */
  startAt: number;
}

/**
 * Đấu Chữ — đua 10 câu với một đối thủ máy, có hạng để leo.
 *
 * Đây là trò duy nhất trong app mà bạn **thua một người khác** chứ không thua đồng hồ.
 * Điểm số thì chỉ có thể tăng, còn hạng thì tụt được — và cái có thể mất mới là cái
 * người ta quay lại giữ. Đối thủ mạnh dần theo hạng (Đồng trả lời 5,2 giây và sai 28%;
 * Cao Thủ trả lời 2,1 giây và gần như không sai), nên leo lên là thật sự phải khá hơn
 * chứ không phải cày đủ số trận.
 *
 * Đối thủ không nhìn màn hình của bạn: nó chỉ có một cái đồng hồ và một tỉ lệ đúng.
 * Làm nó "phản ứng" theo tốc độ người chơi thì mọi trận đều sát nút, mà một trận lúc
 * nào cũng sát nút thì thắng cũng chẳng có nghĩa gì.
 */
export function DuelGame() {
  const engine = useEngine();
  const [pool] = useState(() => engine.pools().vocab);
  const [, force] = useReducer((n: number) => n + 1, 0);

  const g = useRef<Duel>({
    round: null,
    me: 0,
    bot: 0,
    picked: null,
    pickedOk: false,
    lockUntil: 0,
    over: null,
    won: false,
    promoted: false,
    demoted: false,
    rank: loadRank(),
    shownAt: Date.now(),
    botAt: 0,
    startAt: Date.now() + COUNTDOWN_MS,
  });

  const tier = () => TIERS[Math.min(g.current.rank.tier, TIERS.length - 1)];

  /** Hẹn giờ cho lượt trả lời kế của đối thủ, có xê dịch để nhịp không đều như máy. */
  const scheduleBot = () => {
    const t = tier();
    const from = Math.max(Date.now(), g.current.startAt);
    g.current.botAt = from + t.botMs * (0.75 + Math.random() * 0.5);
  };

  const deal = () => {
    const r = arcadeRound(pool, 4);
    if (!r) return;
    g.current.round = r;
    g.current.picked = null;
    g.current.shownAt = Date.now();
  };

  const end = (won: boolean) => {
    const s = g.current;
    const { rank, promoted, demoted } = applyDuel(s.rank, won);
    saveRank(rank);
    s.rank = rank;
    s.won = won;
    s.promoted = promoted;
    s.demoted = demoted;
    s.over = { score: s.me, ...engine.arcadeFinish('duel', s.me) };
    if (won) engine.burst(promoted ? 150 : 80);
  };

  const retry = () => {
    g.current = {
      ...g.current,
      me: 0,
      bot: 0,
      picked: null,
      lockUntil: 0,
      over: null,
      promoted: false,
      demoted: false,
      rank: loadRank(),
      startAt: Date.now() + COUNTDOWN_MS,
    };
    deal();
    scheduleBot();
    force();
  };

  const pick = (i: number) => {
    const s = g.current;
    if (s.over || !s.round || s.picked !== null || Date.now() < s.lockUntil) return;
    if (Date.now() < s.startAt) return;
    const chosen = s.round.opts[i];
    const ok = chosen.h === s.round.word.h;
    engine.arcadeAnswer(chosen, ok, Date.now() - s.shownAt, 'm2h');
    s.picked = i;
    s.pickedOk = ok;
    if (ok) {
      s.me += 1;
      if (s.me >= GOAL) {
        end(true);
        return force();
      }
      setTimeout(() => {
        deal();
        force();
      }, 260);
    } else {
      // Sai thì mất lượt: tay bị khoá một nhịp rưỡi và câu vẫn nằm đó.
      s.lockUntil = Date.now() + PENALTY_MS;
      setTimeout(() => {
        if (!g.current.over) {
          g.current.picked = null;
          force();
        }
      }, PENALTY_MS);
    }
    force();
  };

  useEffect(() => {
    deal();
    scheduleBot();
    force();
    const id = setInterval(() => {
      const s = g.current;
      if (s.over || document.hidden) return;
      if (Date.now() < s.startAt) return force();
      if (Date.now() < s.botAt) return;
      // Đối thủ trả lời: đúng hay sai chỉ do tỉ lệ của hạng quyết định.
      if (Math.random() < tier().botAcc) {
        s.bot += 1;
        if (s.bot >= GOAL) {
          end(false);
          return force();
        }
      }
      scheduleBot();
      force();
    }, 120);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = g.current;
  const t = tier();
  const locked = Date.now() < s.lockUntil;
  const waiting = Date.now() < s.startAt;
  const countdown = Math.ceil((s.startAt - Date.now()) / 1000);

  return (
    <ArcadeFrame
      id="duel"
      score={s.me}
      lives={null}
      hud={
        <span
          style={{
            background: t.color,
            color: '#fff',
            border: `2px solid ${C.ink}`,
            borderRadius: 99,
            padding: '4px 14px',
            fontSize: 13,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {t.icon} {t.name} {'★'.repeat(s.rank.stars) + '☆'.repeat(STARS_PER_TIER - s.rank.stars)}
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
        {/* Hai thanh đua, chồng lên nhau để nhìn phát biết đang hơn hay kém. */}
        {(
          [
            ['🧑 Bạn', s.me, 'linear-gradient(90deg,#4f9d5f,#7bbd6a)'],
            [`${t.icon} Đối thủ ${t.name}`, s.bot, 'linear-gradient(90deg,#8a2d3d,#c94f38)'],
          ] as const
        ).map(([label, n, fill]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, width: 150, whiteSpace: 'nowrap' }}>{label}</span>
            <div
              style={{
                flex: 1,
                height: 22,
                background: C.track,
                border: `2px solid ${C.ink}`,
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: (n / GOAL) * 100 + '%',
                  height: '100%',
                  background: fill,
                  borderRadius: 99,
                  transition: 'width .3s',
                }}
              />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, width: 46, textAlign: 'right' }}>
              {n}/{GOAL}
            </span>
          </div>
        ))}

        <div
          style={{
            textAlign: 'center',
            margin: 'clamp(12px, 3vh, 30px) 0',
            padding: 'clamp(10px, 2vh, 22px)',
            background: locked ? C.badBg : C.panel,
            border: `2px solid ${locked ? C.red : C.line}`,
            borderRadius: 18,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', color: C.muted }}>
            {waiting
              ? 'SẴN SÀNG CHƯA?'
              : locked
                ? 'SAI RỒI — MẤT LƯỢT MỘT NHỊP'
                : 'CHỌN CHỮ HÁN ĐÚNG VỚI NGHĨA'}
          </div>
          <div style={{ fontSize: 'clamp(24px, 4.4vh, 40px)', fontWeight: 800, lineHeight: 1.3 }}>
            {waiting ? countdown : (s.round?.word.m ?? '…')}
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
                disabled={locked || waiting}
                style={{
                  minHeight: 'clamp(72px, 12vh, 130px)',
                  borderRadius: 18,
                  border: `3px solid ${bd}`,
                  background: isPick ? (s.pickedOk ? C.okBg : C.badBg) : C.panel,
                  boxShadow: `3px 3px 0 ${bd}`,
                  fontFamily: F.han,
                  fontSize: 'clamp(26px, 4.6vh, 46px)',
                  fontWeight: 700,
                  // Đếm ngược thì che chữ đi: nhìn trước đáp án ba giây là trận không còn là đua nữa.
                  color: waiting ? 'transparent' : C.ink,
                  cursor: locked || waiting ? 'default' : 'pointer',
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
            fontSize: 14,
            fontWeight: 800,
            color: '#fff',
            zIndex: 21,
            margin: 0,
          }}
        >
          {s.promoted
            ? `🎉 LÊN HẠNG ${TIERS[s.rank.tier].name.toUpperCase()}!`
            : s.demoted
              ? `↓ Tụt xuống hạng ${TIERS[s.rank.tier].name}`
              : s.won
                ? `Thắng! ${'★'.repeat(s.rank.stars)}${'☆'.repeat(STARS_PER_TIER - s.rank.stars)}`
                : `Thua — ${'★'.repeat(s.rank.stars)}${'☆'.repeat(STARS_PER_TIER - s.rank.stars)}`}
        </p>
      )}
    </ArcadeFrame>
  );
}
