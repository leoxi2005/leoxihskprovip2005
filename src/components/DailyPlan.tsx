import { PHASES } from '../engine/plan';
import { loadLog } from '../engine/storage';
import { secondsPerQuestion, streakFrom, todayCount } from '../engine/stats';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

const pct = (done: number, target: number): number =>
  target <= 0 ? 100 : Math.min(100, Math.round((done / target) * 100));

const chip = (bg: string, color: string) => ({
  background: bg,
  color,
  border: `1.5px solid ${C.line}`,
  borderRadius: 99,
  padding: '3px 12px',
  whiteSpace: 'nowrap' as const,
});

/**
 * The countdown and today's required work.
 *
 * This sits above everything else on the home screen on purpose: with a fixed exam
 * date, the only question that matters when you open the app is "what do I owe today",
 * and the answer has to be visible before any of the games are.
 */
export function DailyPlan() {
  const engine = useEngine();
  useGameState();
  const plan = engine.plan();
  const log = loadLog();
  const today = todayCount(log);
  const streak = streakFrom(log);
  const past = plan.daysLeft < 0;
  // Measured from the learner's own answers once there are enough of them.
  const minutes = Math.max(1, Math.round((plan.questions * secondsPerQuestion(log)) / 60));

  return (
    <section
      style={{
        textAlign: 'left',
        background: plan.clear ? C.okBg : C.card,
        border: `3px solid ${plan.clear ? C.green : C.ink}`,
        borderRadius: 20,
        boxShadow: shadow(5, plan.clear ? C.green : C.ink),
        padding: '16px 18px',
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: past ? C.muted : C.red, lineHeight: 1 }}>
          {past ? '—' : plan.daysLeft}
        </span>
        <span style={{ fontSize: 15, fontWeight: 800 }}>
          {past ? 'Ngày thi đã qua — đặt ngày mới trong Cài đặt' : `ngày nữa tới HSK 4`}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: C.muted }}>
          🔥 {streak} ngày liên tiếp · hôm nay {today.n} câu
        </span>
      </div>

      <div style={{ fontSize: 13, fontWeight: 800, color: C.gold, marginTop: 6 }}>{plan.phase.name}</div>
      <div style={{ fontSize: 13, color: C.body, fontWeight: 600, lineHeight: 1.5, marginBottom: 8 }}>
        {plan.phase.goal}
      </div>

      {/* What today actually costs, and whether the pace still reaches the exam. */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          fontSize: 12.5,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {/* Auto pace can demand more than anyone will actually sit through. Saying so
            beats letting the plan quietly become the thing you avoid opening. */}
        <span style={chip(minutes > 60 ? C.badBg : C.soft, minutes > 60 ? C.badInk : C.body)}>
          📋 Hôm nay ≈ {plan.questions} câu · ~{minutes} phút
          {minutes > 60 ? ' — nặng, cân nhắc tắt bớt chủ đề' : ''}
        </span>
        <span style={chip(C.soft, C.body)}>
          ⚙️ Nhịp {plan.pace.base} từ/ngày{engine.settings.autoPace ? ' (tự động)' : ''}
        </span>
        {!plan.pace.reachable ? (
          <span style={chip(C.badBg, C.badInk)}>
            ⚠️ Còn {plan.pace.shortfall} từ không kịp phủ — nên tắt bớt chủ đề
          </span>
        ) : plan.pace.shortfall > 0 ? (
          <span style={chip(C.badBg, C.badInk)}>
            ⚠️ Nhịp hiện tại hụt {plan.pace.shortfall} từ — cần {plan.pace.required}/ngày
          </span>
        ) : (
          <span style={chip(C.okBg, C.okInk)}>✓ Đúng nhịp phủ hết trước ngày thi</span>
        )}
      </div>

      {plan.tasks.map((t) => {
        const done = t.done >= t.target;
        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
              borderTop: `1px solid ${C.line}`,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 18, width: 22 }}>{done ? '✅' : t.required ? '🔴' : '⚪'}</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: done ? C.okInk : C.ink }}>
                {t.label}{' '}
                <span style={{ color: C.muted, fontWeight: 700 }}>
                  {t.target > 0 && `${Math.min(t.done, t.target)}/${t.target}`}
                  {t.required ? ' · bắt buộc' : ''}
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.muted2, fontWeight: 600, lineHeight: 1.4 }}>{t.detail}</div>
              <div
                style={{
                  height: 6,
                  background: C.track,
                  borderRadius: 99,
                  overflow: 'hidden',
                  marginTop: 5,
                  maxWidth: 320,
                }}
              >
                <div
                  style={{
                    width: pct(t.done, t.target) + '%',
                    height: '100%',
                    background: done ? C.green : 'linear-gradient(90deg,#e8a93c,#c94f38)',
                    transition: 'width .3s',
                  }}
                />
              </div>
            </div>
            {!done && (t.game || t.exam) && (
              <button
                onClick={() => (t.exam ? engine.openExam() : engine.startGame(t.game!))}
                style={{
                  background: C.ink,
                  color: C.soft,
                  border: `2px solid ${C.ink}`,
                  borderRadius: 12,
                  padding: '7px 16px',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: F.ui,
                  whiteSpace: 'nowrap',
                }}
              >
                Làm ngay →
              </button>
            )}
          </div>
        );
      })}

      <div
        style={{
          marginTop: 10,
          fontSize: 12.5,
          fontWeight: 700,
          color: plan.clear ? C.okInk : C.badInk,
          lineHeight: 1.5,
        }}
      >
        {plan.clear
          ? '🎉 Xong nhiệm vụ bắt buộc hôm nay — mọi chế độ đã mở khoá. Học thêm là điểm cộng.'
          : '🔒 Học qua nhạc · 绝弦的美 · Sinh Tồn · Đấu Trùm bị khoá cho tới khi xong các mục 🔴. Các chế độ ôn tập vẫn mở.'}
      </div>

      {/* The whole roadmap, so a bad week can be read against the plan rather than felt as failure. */}
      <details style={{ marginTop: 8 }}>
        <summary style={{ fontSize: 12.5, fontWeight: 800, color: C.muted, cursor: 'pointer' }}>
          Xem toàn bộ lộ trình 4 giai đoạn
        </summary>
        <div style={{ marginTop: 6 }}>
          {PHASES.map((p) => (
            <div
              key={p.id}
              style={{
                fontSize: 12.5,
                lineHeight: 1.5,
                marginBottom: 5,
                color: p.id === plan.phase.id ? C.ink : C.muted2,
                fontWeight: p.id === plan.phase.id ? 800 : 600,
              }}
            >
              <b>{p.name}</b> (từ D-{p.from === 0 ? '6' : p.from}) — {p.goal}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
