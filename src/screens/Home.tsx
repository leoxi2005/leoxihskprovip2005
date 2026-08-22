import { DECK, IMAGES, NEW_TOPICS } from '../data';
import { ARCADES, loadBest } from '../engine/arcade';
import { GAME_CARDS } from '../engine/games';
import { LOCKED_UNTIL_CLEAR } from '../engine/plan';
import type { GameId } from '../engine/types';
import { useEngine, useGameState } from '../engine/useEngine';
import { Bar } from '../components/Bar';
import { DailyPlan } from '../components/DailyPlan';
import { Quests } from '../components/Quests';
import { RegisterAlert } from '../components/RegisterAlert';
import { RewardModal } from '../components/RewardModal';
import { SettingsPanel } from '../components/SettingsPanel';
import { SoundCheck } from '../components/SoundCheck';
import { C, F, shadow } from '../theme';

/** Size of the newest batch of words, shown on the ⭐ shortcut that isolates it. */
const NEW_WORD_COUNT = DECK.vocab.filter((v) => (NEW_TOPICS as readonly string[]).includes(v.t)).length;

const STAT_COLORS = [C.red, C.blue, C.green, C.ochre];

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        background: C.soft,
        border: `2px solid ${C.ink}`,
        borderRadius: 16,
        padding: '8px 14px',
        minWidth: 96,
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function Home() {
  const engine = useEngine();
  // topicVer changes when chips are toggled; reading state keeps the counts live.
  useGameState();
  const p = engine.progress();
  const gallery = Object.keys(IMAGES).slice(0, 8);
  // With no topic selected there is nothing to build a session from, so the start
  // controls would silently do nothing. Say so instead.
  const canPlay = engine.pools().vocab.length > 0;
  const best = engine.bestEndless();
  // Kỷ lục các trò chơi, đọc một lần cho cả ba thẻ.
  const arcadeBest = loadBest();
  // Read once: every card asks the same question, and the plan walks the whole deck.
  const planClear = engine.plan().clear;
  const lockedGame = (g: GameId) => !planClear && LOCKED_UNTIL_CLEAR.includes(g);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 680,
          width: '100%',
          background: C.card,
          border: `3px solid ${C.ink}`,
          borderRadius: 28,
          boxShadow: shadow(8),
          padding: '34px 38px 30px',
          textAlign: 'center',
          animation: 'fadeup .5s ease',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 8 }}>
          <div
            style={{
              width: 78,
              height: 78,
              background: C.red,
              border: `3px solid ${C.ink}`,
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadow(4),
              animation: 'floaty 3s ease-in-out infinite',
            }}
          >
            <span style={{ fontFamily: F.han, fontSize: 44, fontWeight: 900, color: '#fff' }}>学</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: '-.01em' }}>HSK Quest</h1>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: C.muted }}>{p.deckLabel}</p>
          </div>
        </header>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '16px 0 6px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              background: C.ink,
              color: C.soft,
              borderRadius: 99,
              padding: '6px 16px',
              fontSize: 14,
              fontWeight: 800,
              boxShadow: shadow(3, '#cbb98f'),
            }}
          >
            ⭐ Cấp {p.level}
          </span>
          <Bar
            pct={p.lvPct}
            fill="linear-gradient(90deg,#3b7ea1,#4f9d5f)"
            style={{ flex: 1, minWidth: 160, maxWidth: 280 }}
            label="Tiến độ lên cấp"
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
            {p.xp - p.lvBase}/{p.lvNext - p.lvBase} XP
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '4px 0 14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              background: C.soft,
              border: `2px solid ${C.ink}`,
              borderRadius: 99,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 800,
              color: '#b07f1f',
            }}
          >
            🎯 Hôm nay
          </span>
          <Bar
            pct={p.goalPct}
            fill="linear-gradient(90deg,#e8a93c,#c94f38)"
            style={{ flex: 1, minWidth: 160, maxWidth: 280 }}
            label="Mục tiêu hôm nay"
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
            {p.dayXp}/{p.goal} XP{p.dayXp >= p.goal ? ' ✓' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '14px 0 18px', flexWrap: 'wrap' }}>
          {(
            [
              [String(p.due), 'Đến hạn'],
              [String(p.newCount), 'Từ mới'],
              [String(p.learned), 'Đã thuộc'],
              [String(p.streak), 'Chuỗi ngày'],
            ] as const
          ).map(([value, label], i) => (
            <Stat key={label} value={value} label={label} color={STAT_COLORS[i]} />
          ))}
        </div>

        <RegisterAlert />
        <DailyPlan />

        <Quests />

        <section
          style={{
            textAlign: 'left',
            background: C.panel,
            border: `2px solid ${C.line}`,
            borderRadius: 18,
            padding: '14px 16px',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 10,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: C.muted,
              }}
            >
              Chọn chủ đề ôn tập
            </span>
            <span style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => engine.selOnly(NEW_TOPICS)}
                title="Chỉ ôn các từ mới của Bài 13–19"
                style={{
                  border: `2px solid ${C.ink}`,
                  background: C.soft,
                  borderRadius: 99,
                  padding: '3px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⭐ Từ mới ({NEW_WORD_COUNT})
              </button>
              <button
                onClick={engine.selAll}
                style={{
                  border: `2px solid ${C.ink}`,
                  background: C.card,
                  borderRadius: 99,
                  padding: '3px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Tất cả
              </button>
              <button
                onClick={engine.selNone}
                style={{
                  border: `2px solid ${C.edge}`,
                  background: C.card,
                  borderRadius: 99,
                  padding: '3px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: C.muted,
                }}
              >
                Bỏ chọn
              </button>
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {engine.topics.map((t) => {
              const on = !!engine.sel[t];
              const count = DECK.vocab.filter((x) => x.t === t).length;
              return (
                <button
                  key={t}
                  onClick={() => engine.toggleTopic(t)}
                  aria-pressed={on}
                  style={{
                    whiteSpace: 'nowrap',
                    border: `2px solid ${on ? C.ink : C.edge}`,
                    background: on ? C.ink : C.card,
                    color: on ? C.soft : C.muted,
                    borderRadius: 99,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: F.ui,
                  }}
                >
                  {t} <span style={{ opacity: 0.65, fontSize: 11 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </section>

        <RewardModal />

        {!canPlay && (
          <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: C.red }}>
            Hãy chọn ít nhất một chủ đề để bắt đầu 👆
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={engine.startSession}
            disabled={!canPlay}
            className={canPlay ? 'lift lift-5' : undefined}
            style={{
              background: canPlay ? C.red : C.edge,
              color: '#fff',
              border: `3px solid ${canPlay ? C.ink : C.edge}`,
              borderRadius: 18,
              padding: '15px 40px',
              fontSize: 20,
              fontWeight: 800,
              cursor: canPlay ? 'pointer' : 'not-allowed',
              boxShadow: canPlay ? shadow(5) : 'none',
            }}
          >
            🚀 Trộn tất cả · {p.sessionSize} câu
          </button>
          <button
            onClick={() => engine.startGame('endless')}
            disabled={!canPlay || lockedGame('endless')}
            title={lockedGame('endless') ? 'Xong nhiệm vụ bắt buộc hôm nay để mở khoá' : 'Phím S'}
            className={canPlay && !lockedGame('endless') ? 'lift lift-5' : undefined}
            style={{
              background: canPlay && !lockedGame('endless') ? C.ink : C.edge,
              color: canPlay && !lockedGame('endless') ? C.soft : '#fff',
              border: `3px solid ${canPlay && !lockedGame('endless') ? C.ink : C.edge}`,
              borderRadius: 18,
              padding: '15px 32px',
              fontSize: 20,
              fontWeight: 800,
              cursor: canPlay && !lockedGame('endless') ? 'pointer' : 'not-allowed',
              boxShadow: canPlay && !lockedGame('endless') ? shadow(5, C.red) : 'none',
            }}
          >
            {lockedGame('endless') ? '🔒' : '♾️'} Sinh Tồn{best > 0 ? ` · KL ${best}` : ''}
          </button>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={engine.openExam}
            className="lift lift-4 lift-static"
            style={{
              background: C.bossDark,
              color: '#fff',
              border: `3px solid ${C.ink}`,
              borderRadius: 16,
              padding: '11px 26px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: shadow(4),
            }}
          >
            📝 Thi thử HSK 4 — 100 câu · 95 phút
          </button>
          <button
            onClick={engine.openBook}
            className="lift lift-4 lift-static"
            style={{
              background: C.card,
              color: C.ink,
              border: `3px solid ${C.ink}`,
              borderRadius: 16,
              padding: '11px 26px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: shadow(4),
            }}
          >
            📒 Sổ tay từ vựng
          </button>
          <button
            onClick={engine.openStats}
            className="lift lift-4 lift-static"
            style={{
              background: C.card,
              color: C.ink,
              border: `3px solid ${C.ink}`,
              borderRadius: 16,
              padding: '11px 26px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: shadow(4),
            }}
          >
            📊 Thống kê
          </button>
        </div>

        <section style={{ textAlign: 'left', margin: '22px 0 0' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              color: C.muted,
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            🎮 Trò chơi — có mạng, có đồng hồ, có kỷ lục
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
            {ARCADES.map((a) => {
              const record = arcadeBest[a.id] ?? 0;
              return (
                <button
                  key={a.id}
                  onClick={() => engine.openArcade(a.id)}
                  disabled={!canPlay}
                  title={`Phím ${a.key.toUpperCase()}`}
                  className={canPlay ? 'lift lift-5' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    background: canPlay ? a.bg : C.edge,
                    color: '#fff',
                    border: `3px solid ${C.ink}`,
                    borderRadius: 20,
                    padding: '14px 16px',
                    cursor: canPlay ? 'pointer' : 'not-allowed',
                    boxShadow: canPlay ? shadow(5) : 'none',
                    fontFamily: F.ui,
                  }}
                >
                  <span style={{ fontSize: 34, lineHeight: 1 }}>{a.icon}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 17, fontWeight: 800 }}>{a.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.9, lineHeight: 1.35 }}>{a.desc}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.85 }}>
                      {record > 0 ? `🏆 Kỷ lục ${record}` : 'Chưa có kỷ lục — chơi thử đi'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ textAlign: 'left', margin: '22px 0 0' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              color: C.muted,
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            Hoặc chọn chế độ ôn 📚
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
            {GAME_CARDS.filter((c) => !c.needsLeech || p.leeches > 0).map((c) => {
              const locked = lockedGame(c.g);
              const on = canPlay && !locked;
              return (
              <button
                key={c.g}
                onClick={() => engine.startGame(c.g)}
                disabled={!on}
                title={locked ? 'Xong nhiệm vụ bắt buộc hôm nay để mở khoá' : `Phím ${c.key.toUpperCase()}`}
                className={on ? 'lift lift-4' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  background: C.card,
                  border: `3px solid ${on ? C.ink : C.edge}`,
                  borderRadius: 18,
                  padding: '14px 10px 12px',
                  cursor: on ? 'pointer' : 'not-allowed',
                  boxShadow: on ? shadow(4) : 'none',
                  opacity: on ? 1 : 0.5,
                  fontFamily: F.ui,
                }}
              >
                <span
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: c.bg,
                    border: `2px solid ${C.ink}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    marginBottom: 4,
                  }}
                >
                  {locked ? '🔒' : c.icon}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{c.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, lineHeight: 1.3 }}>
                  {locked
                    ? 'Xong bài bắt buộc để mở'
                    : c.g === 'leech'
                      ? `${p.leeches} từ đang mắc kẹt`
                      : c.desc}
                </span>
              </button>
              );
            })}
          </div>
        </section>

        {gallery.length > 0 && (
          <section
            style={{
              textAlign: 'left',
              background: C.panel,
              border: `2px solid ${C.line}`,
              borderRadius: 18,
              padding: '14px 16px',
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: C.muted,
                marginBottom: 10,
              }}
            >
              🖼️ Ảnh minh họa AI cho cả {Object.keys(IMAGES).length} từ — xem tất cả trong Sổ tay 📒
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {gallery.map((h) => (
                <div key={h} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      width: 86,
                      height: 86,
                      borderRadius: 14,
                      border: `2px solid ${C.ink}`,
                      boxShadow: shadow(2),
                      backgroundImage: `url("${IMAGES[h]}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <span style={{ fontFamily: F.han, fontSize: 16, fontWeight: 700 }}>{h}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <p style={{ margin: '16px 0 0', fontSize: 13, fontWeight: 600, color: C.muted2 }}>
          Phím tắt in ngay trên mỗi thẻ game · <b>S</b> Sinh Tồn · <b>Enter</b> kiểm tra &amp; chuyển câu ·{' '}
          <b>Backspace</b> xoá
        </p>
        <p style={{ margin: '5px 0 0', fontSize: 12, color: '#b3a488' }}>
          Giọng đọc tiếng Trung chuẩn (zh-CN) — dùng Chrome/Edge để có giọng hay nhất 🔊
        </p>
        <SoundCheck />
        <SettingsPanel />
      </div>
    </div>
  );
}
