import { useRef, useState } from 'react';
import { exportProgress, importProgress } from '../engine/storage';
import { useEngine, useGameState } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

/**
 * The pace control is deliberately not a plain number box.
 *
 * "How many new words a day" is unanswerable without knowing how many words are left
 * and how many days remain — and both change daily. Auto mode reads those two numbers
 * and works backwards from the exam date; the manual slider stays for anyone who
 * wants to override it, with the shortfall spelled out when they do.
 */

const row = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 0',
  flexWrap: 'wrap' as const,
};

const label = { fontSize: 13, fontWeight: 800, color: C.body, minWidth: 168, textAlign: 'left' as const };

const smallBtn = (bg: string, color: string = C.ink) => ({
  background: bg,
  color,
  border: `2px solid ${C.ink}`,
  borderRadius: 12,
  padding: '7px 16px',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: F.ui,
});

function Slider({
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, minWidth: 130, accentColor: C.red }}
      />
      <span style={{ fontSize: 13, fontWeight: 800, color: C.muted, minWidth: 76 }}>
        {value} {suffix}
      </span>
    </>
  );
}

/**
 * Settings, and the backup controls.
 *
 * Progress lives in `localStorage` and nowhere else, so clearing site data or moving
 * to another machine loses it. Export/import is the only thing standing between the
 * user and months of review history.
 */
export function SettingsPanel() {
  const engine = useEngine();
  useGameState();
  const s = engine.settings;
  const plan = engine.plan();
  const pace = plan.pace;
  const unseen = engine.progress().newCount;
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsk-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    // Revoking immediately can cancel the download in some browsers; a tick is enough.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg('Đã tải tệp sao lưu về máy ✓');
  };

  const upload = async (f: File) => {
    const text = await f.text();
    const res = importProgress(text);
    setMsg(res.msg);
    // The engine caches srs, stats and settings in memory — re-read them from storage.
    if (res.ok) engine.init();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ ...smallBtn(C.card), marginTop: 14 }}>
        ⚙️ Cài đặt &amp; sao lưu tiến trình
      </button>
    );
  }

  return (
    <section
      style={{
        textAlign: 'left',
        background: C.panel,
        border: `2px solid ${C.line}`,
        borderRadius: 18,
        padding: '14px 18px',
        marginTop: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: C.muted }}>
          Cài đặt
        </span>
        <button onClick={() => setOpen(false)} style={smallBtn(C.card)}>
          Đóng
        </button>
      </div>

      <div style={row}>
        <span style={label}>Ngày thi</span>
        <input
          type="date"
          value={s.examDate}
          onChange={(e) => engine.setSettings({ examDate: e.target.value })}
          style={{
            fontFamily: F.ui,
            fontSize: 14,
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: 10,
            border: `2px solid ${C.ink}`,
            background: C.card,
            color: C.ink,
          }}
        />
        <span style={{ fontSize: 12, color: C.muted2, fontWeight: 600 }}>
          Đợt HSK gần nhất: 07/11/2026 (hạn đăng ký 11/10)
        </span>
      </div>

      <div style={{ ...row, alignItems: 'flex-start' }}>
        <span style={label}>Từ mới mỗi ngày</span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            {[true, false].map((auto) => (
              <button
                key={String(auto)}
                onClick={() => engine.setSettings({ autoPace: auto, ...(auto ? {} : { newPerDay: pace.base }) })}
                aria-pressed={s.autoPace === auto}
                style={{
                  border: `2px solid ${s.autoPace === auto ? C.ink : C.edge}`,
                  background: s.autoPace === auto ? C.ink : C.card,
                  color: s.autoPace === auto ? C.soft : C.muted,
                  borderRadius: 99,
                  padding: '4px 14px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: F.ui,
                }}
              >
                {auto ? `Tự động — ${pace.base} từ` : 'Tự đặt'}
              </button>
            ))}
          </div>

          {!s.autoPace && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Slider
                value={s.newPerDay}
                min={3}
                max={40}
                suffix="từ"
                onChange={(v) => engine.setSettings({ newPerDay: v })}
              />
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted2, lineHeight: 1.5 }}>
            {plan.daysLeft < 0
              ? 'Ngày thi đã qua — đặt ngày mới ở trên để tính lại nhịp.'
              : `Còn ${unseen} từ chưa gặp và ${plan.daysLeft} ngày. Lộ trình giảm dần lượng từ mới về cuối, nên nhịp ${pace.base}/ngày phủ được ${pace.capacity} từ chứ không phải ${pace.base * plan.daysLeft}.`}
            {pace.shortfall > 0 && (
              <>
                {' '}
                <b style={{ color: C.badInk }}>
                  {pace.reachable
                    ? `Mức đang đặt hụt ${pace.shortfall} từ — cần ít nhất ${pace.required}/ngày.`
                    : `Ngay cả mức tối đa cũng hụt ${pace.shortfall} từ. Hãy tắt bớt chủ đề bạn đã vững.`}
                </b>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={row}>
        <span style={label}>Số câu mỗi phiên</span>
        <Slider
          value={s.sessionSize}
          min={8}
          max={40}
          suffix="câu"
          onChange={(v) => engine.setSettings({ sessionSize: v })}
        />
      </div>
      <div style={row}>
        <span style={label}>Mục tiêu XP mỗi ngày</span>
        <Slider
          value={s.dailyGoal}
          min={50}
          max={500}
          step={10}
          suffix="XP"
          onChange={(v) => engine.setSettings({ dailyGoal: v })}
        />
      </div>
      <div style={row}>
        <span style={label}>Tốc độ giọng đọc</span>
        <Slider
          value={s.voiceRate}
          min={0.6}
          max={1.2}
          step={0.1}
          suffix="×"
          onChange={(v) => engine.setSettings({ voiceRate: v })}
        />
      </div>
      <div style={row}>
        <span style={label}>Thời gian hiện chữ (Nhớ nhanh)</span>
        <Slider
          value={s.flashMs}
          min={800}
          max={4000}
          step={100}
          suffix="ms"
          onChange={(v) => engine.setSettings({ flashMs: v })}
        />
      </div>

      <div style={{ borderTop: `2px dashed ${C.edge}`, margin: '12px 0 8px' }} />
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: C.body }}>
        💾 Tiến trình chỉ nằm trong trình duyệt này. Xoá cache hoặc đổi máy là mất — hãy xuất tệp sao lưu
        định kỳ.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={download} style={smallBtn(C.green, '#fff')}>
          ⬇️ Xuất tiến trình
        </button>
        <button onClick={() => file.current?.click()} style={smallBtn(C.card)}>
          ⬆️ Nhập từ tệp
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            // Reset so picking the same file twice still fires a change event.
            e.target.value = '';
          }}
        />
        {msg && (
          <span style={{ fontSize: 13, fontWeight: 700, color: C.okInk, boxShadow: shadow(0) }}>{msg}</span>
        )}
      </div>
    </section>
  );
}
