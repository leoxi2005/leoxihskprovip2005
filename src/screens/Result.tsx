import { Bar } from '../components/Bar';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

function Stat({ value, label, bg, color }: { value: string; label: string; bg: string; color: string }) {
  return (
    <div style={{ background: bg, border: `2px solid ${C.ink}`, borderRadius: 16, padding: '10px 18px', minWidth: 96 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

/**
 * The line under the endless-run headline. `best` is the record as it stood when the
 * run started, so a beaten record still has the old number to compare against.
 * Beating it takes one more than the record, hence the +1.
 */
export function endlessSub(score: number, best: number): string {
  if (best === 0 && score === 0) return 'Sai một câu là hết lượt — thử lại xem được bao nhiêu nhé!';
  if (best === 0) return `Chuỗi đầu tiên của bạn: ${score}. Giờ thì phá nó đi 😤`;
  if (score > best) return `Bạn vừa vượt kỷ lục cũ (${best}) — chuỗi mới: ${score}`;
  if (best - score === 0) return 'Hoà kỷ lục! Chỉ cần thêm 1 câu nữa thôi 😤';
  return `Còn ${best - score + 1} câu nữa là phá kỷ lục ${best}`;
}

const bigBtn = (bg: string, color: string) => ({
  background: bg,
  color,
  border: `3px solid ${C.ink}`,
  borderRadius: 16,
  padding: '14px 32px',
  fontSize: 18,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: shadow(4),
});

export function Result() {
  const engine = useEngine();
  const st = useGameState();
  const p = engine.progress();
  const total = st.right + st.wrong;
  const acc = total ? Math.round((st.right / total) * 100) : 0;
  const endless = st.game === 'endless';
  // `best` was read when the run started, so it still holds the mark that was beaten.
  const record = endless && st.score > st.best;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          background: C.card,
          border: `3px solid ${C.ink}`,
          borderRadius: 28,
          boxShadow: shadow(8),
          padding: '34px 38px',
          textAlign: 'center',
          animation: 'fadeup .5s ease',
        }}
      >
        <div style={{ fontSize: 60, animation: 'floaty 3s ease-in-out infinite' }}>{endless ? '♾️' : '🏆'}</div>
        <h2 style={{ margin: '8px 0 4px', fontSize: 30, fontWeight: 800 }}>
          {endless
            ? record && st.best > 0
              ? '🏆 KỶ LỤC MỚI!'
              : record
                ? `♾️ Chuỗi ${st.score}!`
                : '加油! Thử lại nào!'
            : acc >= 90
              ? '完美! Xuất sắc!'
              : acc >= 70
                ? '很好! Làm tốt lắm!'
                : '加油! Cố lên nhé!'}
        </h2>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.muted }}>
          {endless ? endlessSub(st.score, st.best) : 'Bạn đã hoàn thành phiên ôn tập'}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
          {endless ? (
            <>
              <Stat value={String(st.score)} label="Chuỗi" bg={C.okBg} color={C.green} />
              <Stat value={String(Math.max(st.best, st.score))} label="Kỷ lục" bg={C.soft} color={C.ochre} />
              <Stat value={'+' + st.sessionXp} label="XP" bg="#e7f0f6" color={C.blue} />
            </>
          ) : (
            <>
              <Stat value={String(st.right)} label="Đúng" bg={C.okBg} color={C.green} />
              <Stat value={String(st.wrong)} label="Sai" bg={C.badBg} color={C.red} />
              <Stat value={acc + '%'} label="Chính xác" bg={C.soft} color={C.ochre} />
              <Stat value={'+' + st.sessionXp} label="XP" bg="#e7f0f6" color={C.blue} />
            </>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '0 0 18px',
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
            🎯 Mục tiêu ngày
          </span>
          <Bar
            pct={p.goalPct}
            fill="linear-gradient(90deg,#e8a93c,#c94f38)"
            style={{ flex: 1, minWidth: 160, maxWidth: 260 }}
            label="Mục tiêu hôm nay"
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
            {p.dayXp}/{p.goal} XP{p.dayXp >= p.goal ? ' ✓' : ''}
          </span>
        </div>

        {st.missed.length > 0 && (
          <div
            style={{
              textAlign: 'left',
              background: C.soft,
              border: `2px solid ${C.ink}`,
              borderRadius: 16,
              padding: '14px 18px',
              marginBottom: 20,
              maxHeight: 220,
              overflow: 'auto',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: C.muted,
                marginBottom: 8,
              }}
            >
              Cần ôn lại
            </div>
            {st.missed.map((m) => (
              <div
                key={m.h}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  padding: '5px 0',
                  borderBottom: '1px dashed #d8c9a6',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontFamily: F.han, fontSize: 22, fontWeight: 700 }}>{m.h}</span>
                <span style={{ fontWeight: 800, color: C.gold, fontSize: 14 }}>{m.p}</span>
                <span style={{ fontSize: 14, color: C.body, fontWeight: 600 }}>{m.m}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Enter replays the mode you were in — the point of endless is the next run. */}
          <button
            onClick={() => engine.startGame(st.game)}
            className="lift lift-4 lift-static"
            style={bigBtn(C.red, '#fff')}
          >
            {endless ? '♾️ Chơi lại (Enter)' : '⚡ Ôn tiếp (Enter)'}
          </button>
          <button onClick={engine.goHome} className="lift lift-4 lift-static" style={bigBtn(C.card, C.ink)}>
            🏠 Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
