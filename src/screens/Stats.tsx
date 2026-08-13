import { useMemo } from 'react';
import { DECK } from '../data';
import { KEYS, load, loadLog } from '../engine/storage';
import { byKind, forecast, recentDays, streakFrom, topMissed } from '../engine/stats';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, CHIP_LABELS, F, shadow } from '../theme';

interface ExamLogRow {
  at: number;
  paper: string;
  total: number;
  sections: number[];
}

const HEAT_DAYS = 91;

/** Five steps of green, so a light day still reads as a day. */
const heatColor = (n: number): string =>
  n === 0 ? C.track : n < 10 ? '#cfe4cb' : n < 30 ? '#9fcd97' : n < 60 ? '#6fb268' : C.green;

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const panel = {
  background: C.card,
  border: `3px solid ${C.ink}`,
  borderRadius: 20,
  boxShadow: shadow(4),
  padding: '16px 18px',
  marginBottom: 16,
  textAlign: 'left' as const,
};

const h2 = { margin: '0 0 4px', fontSize: 17, fontWeight: 800 } as const;
const sub = { margin: '0 0 12px', fontSize: 12.5, fontWeight: 600, color: C.muted2, lineHeight: 1.5 } as const;

export function Stats() {
  const engine = useEngine();
  useGameState();

  const log = useMemo(() => loadLog(), []);
  const days = useMemo(() => recentDays(log, HEAT_DAYS), [log]);
  const kinds = useMemo(() => byKind(log), [log]);
  const missed = useMemo(() => topMissed(log, 20), [log]);
  const ahead = useMemo(() => forecast(engine.srs, 7), [engine.srs]);
  const exams = useMemo(() => load<ExamLogRow[]>(KEYS.exam, []), []);
  const streak = useMemo(() => streakFrom(log), [log]);

  /** SRS id → something a human recognises. */
  const nameOf = useMemo(() => {
    const map = new Map<string, string>();
    DECK.vocab.forEach((v) => map.set('w:' + v.h, `${v.h} (${v.p}) — ${v.m}`));
    DECK.grammar.forEach((g) => map.set(g.id, `Ngữ pháp: ${g.name || g.a}`));
    DECK.sentences.forEach((s) => map.set(s.id, `Câu: ${s.cn}`));
    DECK.passages.forEach((p) => map.set(p.id, `Đoạn văn: ${p.title}`));
    DECK.orders.forEach((o) => map.set(o.id, `Sắp xếp: ${o.vi}`));
    return map;
  }, []);

  const total = log.length;
  const right = log.reduce((n, r) => n + r[3], 0);

  return (
    <div style={{ minHeight: '100vh', maxWidth: 900, margin: '0 auto', padding: '20px 16px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={engine.goHome}
          aria-label="Về trang chủ"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `2px solid ${C.ink}`,
            background: C.card,
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            color: C.muted,
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>📊 Thống kê</h2>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>
          {total} lượt trả lời · đúng {total ? Math.round((right / total) * 100) : 0}% · chuỗi {streak} ngày
        </span>
      </div>

      {total === 0 && (
        <div style={panel}>
          <p style={{ margin: 0, fontWeight: 700, color: C.body }}>
            Chưa có dữ liệu. Nhật ký bắt đầu ghi từ lần ôn tiếp theo — làm một phiên rồi quay lại đây.
          </p>
        </div>
      )}

      {/* Heatmap ---------------------------------------------------------- */}
      <section style={panel}>
        <h3 style={h2}>Lịch học 13 tuần gần nhất</h3>
        <p style={sub}>
          Mỗi ô là một ngày, càng đậm càng nhiều câu. Điều quyết định kết quả không phải ngày học nhiều
          nhất, mà là số ô trống.
        </p>
        <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
          {/* One column per week, days running down — the shape everyone already reads. */}
          {Array.from({ length: Math.ceil(HEAT_DAYS / 7) }, (_, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {days.slice(w * 7, w * 7 + 7).map((d) => (
                <div
                  key={d.day}
                  title={`${new Date(d.day).toLocaleDateString('vi-VN')} — ${d.n} câu${
                    d.n ? `, đúng ${Math.round((d.right / d.n) * 100)}%` : ''
                  }`}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: heatColor(d.n),
                    border: `1px solid ${C.line}`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', fontSize: 11, color: C.muted }}>
          <span>Ít</span>
          {[0, 5, 20, 45, 80].map((n) => (
            <span
              key={n}
              style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(n), border: `1px solid ${C.line}` }}
            />
          ))}
          <span>Nhiều</span>
          <span style={{ marginLeft: 10 }}>{WEEKDAYS.join(' · ')} theo chiều dọc</span>
        </div>
      </section>

      {/* Forecast --------------------------------------------------------- */}
      <section style={panel}>
        <h3 style={h2}>Dự báo 7 ngày tới</h3>
        <p style={sub}>
          Số mục sẽ tới hạn ôn mỗi ngày. Cột hôm nay đã gộp cả phần tồn đọng — nếu nó cao bất thường, hãy
          giảm “từ mới mỗi ngày” vài hôm cho hàng đợi xẹp xuống.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 120 }}>
          {ahead.map((d) => {
            const max = Math.max(1, ...ahead.map((x) => x.due));
            return (
              <div key={d.offset} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>{d.due}</div>
                <div
                  style={{
                    height: Math.round((d.due / max) * 78) + 2,
                    background: d.offset === 0 ? C.red : C.blue,
                    border: `2px solid ${C.ink}`,
                    borderRadius: 8,
                    marginTop: 3,
                  }}
                />
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted2, marginTop: 4 }}>
                  {d.offset === 0 ? 'Hôm nay' : `+${d.offset}`}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Accuracy by kind -------------------------------------------------- */}
      {kinds.length > 0 && (
        <section style={panel}>
          <h3 style={h2}>Tỉ lệ đúng theo dạng bài</h3>
          <p style={sub}>Xếp từ yếu nhất lên trên — đây là nơi nên dồn thời gian, không phải dạng bạn đã giỏi.</p>
          {kinds.map((k) => (
            <div key={k.kind} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <span style={{ fontSize: 12, fontWeight: 800, width: 210, color: C.body }}>
                {CHIP_LABELS[k.kind] ?? k.kind}
              </span>
              <div style={{ flex: 1, height: 12, background: C.track, borderRadius: 99, overflow: 'hidden' }}>
                <div
                  style={{
                    width: (k.pct ?? 0) + '%',
                    height: '100%',
                    background: (k.pct ?? 0) >= 80 ? C.green : (k.pct ?? 0) >= 60 ? C.ochre : C.red,
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.muted, width: 78, textAlign: 'right' }}>
                {k.pct}% · {k.n}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Most missed ------------------------------------------------------- */}
      {missed.length > 0 && (
        <section style={panel}>
          <h3 style={h2}>20 mục hay sai nhất</h3>
          <p style={sub}>Gộp cả hai làn nhận diện và tái tạo — một từ chỉ xuất hiện một lần ở đây.</p>
          {missed.map((m, i) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '6px 0',
                borderTop: i ? `1px solid ${C.line}` : undefined,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: C.muted, width: 22 }}>{i + 1}</span>
              <span style={{ flex: 1, fontFamily: F.han, fontSize: 15, fontWeight: 700 }}>
                {nameOf.get(m.id) ?? m.id}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.badInk, whiteSpace: 'nowrap' }}>
                sai {m.wrong}/{m.n}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Exam history ------------------------------------------------------ */}
      <section style={panel}>
        <h3 style={h2}>Lịch sử thi thử</h3>
        {exams.length === 0 ? (
          <p style={{ ...sub, marginBottom: 0 }}>
            Chưa làm đề nào. Điểm đề thử là chỉ số dự báo tốt nhất cho kết quả thật — nên làm đề đầu tiên
            sớm để biết mình đang ở đâu.
          </p>
        ) : (
          exams
            .slice()
            .reverse()
            .map((e, i) => (
              <div
                key={e.at}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: '6px 0',
                  borderTop: i ? `1px solid ${C.line}` : undefined,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, width: 92 }}>
                  {new Date(e.at).toLocaleDateString('vi-VN')}
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: e.total >= 180 ? C.okInk : C.badInk, width: 76 }}>
                  {e.total}/300
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.body }}>
                  Nghe {e.sections[0]} · Đọc {e.sections[1]} · Viết {e.sections[2]}
                </span>
              </div>
            ))
        )}
      </section>
    </div>
  );
}
