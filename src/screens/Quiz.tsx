import { Bar } from '../components/Bar';
import { isChoiceQ, isTileQ, isTypeQ } from '../engine/types';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, CHIP_COLORS, CHIP_LABELS, F, shadow } from '../theme';
import { Feedback } from './quiz/Feedback';
import { MatchBoard } from './quiz/MatchBoard';
import { OptionGrid } from './quiz/OptionGrid';
import { BIG_SPEAKER, SMALL_SPEAKER, hintFor, promptView } from './quiz/prompt';
import { TfRound } from './quiz/TfRound';
import { TileBuilder } from './quiz/TileBuilder';
import { TypeInput } from './quiz/TypeInput';

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: `2px solid ${C.ink}`,
  background: C.card,
  fontSize: 16,
  fontWeight: 800,
  cursor: 'pointer',
  color: C.muted,
} as const;

export function Quiz() {
  const engine = useEngine();
  const st = useGameState();
  const q = engine.cur();
  if (!q) return null;

  const pv = promptView(q, st);
  const endless = st.game === 'endless';
  // The bar counts a checked question as done, so it moves on answer, not on next.
  const pct = Math.round(((st.qi + (st.checked ? 1 : 0)) / st.session.length) * 100);
  const canCheck = engine.canCheck();
  const chipLabel = q.boss
    ? 'ĐẤU TRÙM 🐉'
    : endless
      ? 'SINH TỒN ♾️'
      : q.kind === 'song' && q.yt
        ? 'BÀI HÁT THẬT 🎤'
        : CHIP_LABELS[q.kind];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 180px' }}>
      <div style={{ width: '100%', maxWidth: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={engine.quit} title="Thoát" aria-label="Thoát" style={iconBtn}>
          ✕
        </button>
        {/* An endless run has no end to show progress towards — show the streak instead. */}
        {endless ? (
          <>
            <span
              style={{
                background: C.ink,
                color: C.soft,
                borderRadius: 99,
                padding: '4px 14px',
                fontSize: 15,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              ♾️ {st.score}
            </span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
              {st.best === 0
                ? 'Sai một câu là hết lượt!'
                : st.score > st.best
                  ? '🏆 Đang phá kỷ lục!'
                  : `Kỷ lục ${st.best} · còn ${st.best - st.score + 1} câu nữa`}
            </span>
          </>
        ) : (
          <>
            <Bar
              pct={pct}
              height={16}
              fill="linear-gradient(90deg,#e8a93c,#c94f38)"
              style={{ flex: 1 }}
              label="Tiến độ phiên ôn tập"
            />
            <span style={{ fontSize: 14, fontWeight: 800, color: C.muted }}>
              {st.qi + 1}/{st.session.length}
            </span>
          </>
        )}
        {st.combo >= 2 && (
          <span
            style={{
              background: C.ochre,
              border: `2px solid ${C.ink}`,
              borderRadius: 99,
              padding: '4px 12px',
              fontSize: 14,
              fontWeight: 800,
              animation: 'pulse .8s ease infinite',
            }}
          >
            🔥 ×{st.combo}
          </span>
        )}
        <button
          onClick={engine.toggleMute}
          title="Bật/tắt âm thanh"
          aria-label="Bật/tắt âm thanh"
          aria-pressed={st.muted}
          style={{ ...iconBtn, fontSize: 15 }}
        >
          {st.muted ? '🔇' : '🔊'}
        </button>
        <span
          style={{
            background: C.soft,
            border: `2px solid ${C.ink}`,
            borderRadius: 99,
            padding: '4px 12px',
            fontSize: 14,
            fontWeight: 800,
            color: C.blue,
          }}
        >
          +{st.sessionXp} XP
        </span>
      </div>

      <div style={{ marginTop: 20, animation: 'pop .3s ease' }}>
        <span
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            background: q.boss ? C.bossDark : CHIP_COLORS[q.kind],
            color: '#fff',
            border: `2px solid ${C.ink}`,
            borderRadius: 99,
            padding: '6px 18px',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '.04em',
            boxShadow: shadow(3),
          }}
        >
          {chipLabel}
        </span>
      </div>

      {q.kind === 'song' && q.yt && 'yt' in q.song && (
        <div
          style={{
            width: '100%',
            maxWidth: 640,
            marginTop: 14,
            border: `3px solid ${C.ink}`,
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: shadow(5),
            background: '#000',
          }}
        >
          {/* Keyed by song, not question, so the video keeps playing across lines. */}
          <iframe
            key={q.song.id}
            src={`https://www.youtube.com/embed/${q.song.yt}`}
            title="Bài hát"
            style={{ display: 'block', width: '100%', aspectRatio: '16/9', border: 0 }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}

      {q.boss && (
        <div
          style={{
            width: '100%',
            maxWidth: 800,
            background: C.ink,
            border: `3px solid ${C.ink}`,
            borderRadius: 18,
            padding: '12px 18px',
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 34, animation: 'floaty 2s ease-in-out infinite' }}>🐉</span>
          <div style={{ flex: 1, minWidth: 160, height: 16, background: '#4a3f2f', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                width: st.bossHp + '%',
                height: '100%',
                background: st.bossHp > 40 ? 'linear-gradient(90deg,#8a2d3d,#c94f38)' : C.red,
                borderRadius: 99,
                transition: 'width .4s',
              }}
            />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.soft, whiteSpace: 'nowrap' }}>{st.bossHp} HP</span>
          <span style={{ fontSize: 17, whiteSpace: 'nowrap' }}>
            {'❤️'.repeat(Math.max(0, st.hearts)) + '🖤'.repeat(Math.max(0, 3 - st.hearts))}
          </span>
        </div>
      )}

      {endless && !st.checked && (
        <Bar
          pct={st.tfLeft}
          height={14}
          // Solid red in the last third, as a warning.
          fill={st.tfLeft > 35 ? 'linear-gradient(90deg,#e8a93c,#c94f38)' : C.red}
          transition="width .1s linear"
          style={{ width: '100%', maxWidth: 800, marginTop: 14 }}
          label="Thời gian còn lại"
        />
      )}

      <div
        style={{
          background: C.card,
          border: `3px solid ${C.ink}`,
          borderRadius: 24,
          boxShadow: shadow(6),
          padding: '26px 30px',
          width: '100%',
          maxWidth: 800,
          textAlign: 'center',
          margin: '14px 0 20px',
          animation: 'pop .3s ease',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: C.muted,
            marginBottom: 12,
          }}
        >
          {pv.title}
        </div>

        {q.kind === 'pass' && (
          <div
            style={{
              textAlign: 'left',
              background: C.panel,
              border: `2px solid ${C.line}`,
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontFamily: F.han, fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{q.p.title}</div>
            <div style={{ fontFamily: F.han, fontSize: 21, lineHeight: 1.9, maxHeight: 240, overflow: 'auto' }}>
              {q.p.text}
            </div>
          </div>
        )}

        {pv.speaker !== 'none' && (
          <button
            onClick={engine.playPrompt}
            title="Nghe lại"
            aria-label="Nghe lại"
            style={pv.speaker === 'big' ? BIG_SPEAKER : SMALL_SPEAKER}
          >
            🔊
          </button>
        )}

        <div style={pv.mainStyle}>{pv.main}</div>
        {pv.sub && <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: C.muted2 }}>{pv.sub}</div>}
      </div>

      {isTileQ(q) ? (
        <TileBuilder q={q} st={st} />
      ) : q.kind === 'match' ? (
        <MatchBoard q={q} st={st} />
      ) : q.kind === 'tf' ? (
        <TfRound q={q} st={st} />
      ) : isTypeQ(q) ? (
        <TypeInput st={st} />
      ) : isChoiceQ(q) ? (
        <OptionGrid q={q} st={st} />
      ) : null}

      {st.checked ? (
        <Feedback q={q} st={st} />
      ) : (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            background: C.card,
            borderTop: `3px solid ${C.ink}`,
            padding: '14px 20px',
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>{hintFor(q)}</span>
            {/* Match and lightning have no check step — they grade as you answer. */}
            {q.kind !== 'match' && q.kind !== 'tf' && (
              <button
                onClick={engine.check}
                disabled={!canCheck}
                style={{
                  background: canCheck ? C.ink : C.edge,
                  color: C.soft,
                  border: `3px solid ${C.ink}`,
                  borderRadius: 14,
                  padding: '12px 30px',
                  fontSize: 17,
                  fontWeight: 800,
                  cursor: canCheck ? 'pointer' : 'default',
                  fontFamily: F.ui,
                }}
              >
                Kiểm tra ⏎
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
