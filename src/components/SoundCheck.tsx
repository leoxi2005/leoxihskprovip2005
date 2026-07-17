import { useState } from 'react';
import { useEngine } from '../engine/useEngine';
import { C, F, shadow } from '../theme';

type Result = 'chưa chạy' | 'đang chạy' | 'ok' | 'lỗi';

interface Report {
  muted: boolean;
  voices: string[];
  /** What the browser reported back about the test utterance. */
  speech: Result;
  speechNote: string;
  beep: boolean;
}

/**
 * Silence has too many possible causes to guess at from the outside: the app's own
 * mute, no Mandarin voice installed, a browser that blocks speech, or the synth
 * getting wedged. This asks the browser directly and says which one it is.
 */
export function SoundCheck() {
  const engine = useEngine();
  const [open, setOpen] = useState(false);
  const [r, setR] = useState<Report | null>(null);

  async function run() {
    setOpen(true);
    const report: Report = {
      muted: engine.state.muted,
      voices: [],
      speech: 'đang chạy',
      speechNote: '',
      beep: false,
    };
    setR({ ...report });

    // A beep proves the browser can make sound at all, independent of speech.
    try {
      engine.audio.tone(660, 0, 0.25, 'triangle', 0.14);
      report.beep = true;
    } catch {
      report.beep = false;
    }

    if (typeof speechSynthesis === 'undefined') {
      report.speech = 'lỗi';
      report.speechNote = 'Trình duyệt này không hỗ trợ đọc tiếng (Web Speech API).';
      setR({ ...report });
      return;
    }

    // The list is filled in asynchronously; give it a moment before judging.
    let voices = speechSynthesis.getVoices();
    if (!voices.length) {
      await new Promise((res) => {
        speechSynthesis.addEventListener('voiceschanged', res as EventListener, { once: true });
        setTimeout(res, 1500);
      });
      voices = speechSynthesis.getVoices();
    }
    report.voices = voices.filter((v) => /^zh/i.test(v.lang)).map((v) => `${v.name} (${v.lang})`);
    setR({ ...report });

    if (!report.voices.length) {
      report.speech = 'lỗi';
      report.speechNote = 'Máy không có giọng tiếng Trung nào.';
      setR({ ...report });
      return;
    }

    // Speak straight at the synth — bypassing the app's own mute and queue, so the
    // result says something about the browser rather than about our code.
    const outcome = await new Promise<{ ok: boolean; note: string }>((res) => {
      try {
        speechSynthesis.resume();
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('你好');
        u.lang = 'zh-CN';
        u.rate = 0.9;
        let started = false;
        u.onstart = () => {
          started = true;
          res({ ok: true, note: 'Trình duyệt đã phát tiếng.' });
        };
        u.onerror = (e) =>
          res({ ok: false, note: `Trình duyệt báo lỗi: ${(e as SpeechSynthesisErrorEvent).error}` });
        speechSynthesis.speak(u);
        setTimeout(() => {
          if (!started) {
            res({
              ok: false,
              note: 'Trình duyệt nhận lệnh nhưng không phát gì — engine đọc đang bị kẹt.',
            });
          }
        }, 2500);
      } catch (e) {
        res({ ok: false, note: 'Không gọi được lệnh đọc: ' + String(e) });
      }
    });
    report.speech = outcome.ok ? 'ok' : 'lỗi';
    report.speechNote = outcome.note;
    setR({ ...report });
  }

  const line = (label: string, value: string, bad: boolean) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '4px 0', flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 800, color: C.muted, minWidth: 150, textAlign: 'left' }}>{label}</span>
      <span style={{ fontWeight: 700, color: bad ? C.red : C.body, textAlign: 'left', flex: 1 }}>{value}</span>
    </div>
  );

  return (
    <>
      <button
        onClick={run}
        style={{
          background: C.card,
          border: `2px solid ${C.edge}`,
          borderRadius: 99,
          padding: '6px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          color: C.muted,
          fontFamily: F.ui,
          marginTop: 10,
        }}
      >
        🔊 Không nghe thấy tiếng? Bấm để kiểm tra
      </button>

      {open && r && (
        <div
          role="dialog"
          aria-label="Kiểm tra âm thanh"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(45,36,25,.55)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.card,
              border: `3px solid ${C.ink}`,
              borderRadius: 22,
              boxShadow: shadow(6),
              padding: '22px 24px',
              maxWidth: 520,
              width: '100%',
              textAlign: 'left',
              animation: 'pop .25s ease',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800 }}>🔊 Kiểm tra âm thanh</h3>

            {line('Bíp thử', r.beep ? 'đã phát — bạn có nghe tiếng "bíp" không?' : 'không phát được', !r.beep)}
            {line(
              'App có tắt tiếng?',
              r.muted ? 'CÓ — đây là nguyên nhân' : 'không',
              r.muted,
            )}
            {line(
              'Giọng tiếng Trung',
              r.voices.length ? `${r.voices.length} giọng: ${r.voices.slice(0, 3).join(', ')}` : 'KHÔNG CÓ',
              !r.voices.length,
            )}
            {line(
              'Đọc thử 你好',
              r.speech === 'đang chạy' ? 'đang thử…' : r.speechNote,
              r.speech === 'lỗi',
            )}

            <div
              style={{
                marginTop: 14,
                background: C.soft,
                border: `2px dashed ${C.edge}`,
                borderRadius: 14,
                padding: '12px 14px',
                fontSize: 14,
                fontWeight: 700,
                color: C.body,
                lineHeight: 1.5,
              }}
            >
              {r.muted
                ? '→ App đang tắt tiếng. Bấm nút đỏ "Đang tắt tiếng" ở góc trên phải khi vào học để bật lại.'
                : !r.voices.length
                  ? '→ Máy chưa có giọng tiếng Trung. Trên Mac: Cài đặt hệ thống → Trợ năng → Nội dung đọc → Giọng nói hệ thống → Quản lý giọng nói → tải giọng Tiếng Trung (Trung Quốc đại lục).'
                  : r.speech === 'ok'
                    ? '→ Trình duyệt phát tiếng bình thường. Nếu tai bạn vẫn không nghe thấy gì: kiểm tra âm lượng máy, và bấm chuột phải lên tab Chrome xem có đang "Mute site" không.'
                    : r.speech === 'lỗi'
                      ? '→ Engine đọc của trình duyệt đang kẹt. Đóng hẳn Chrome rồi mở lại (không chỉ tải lại trang). Nếu vẫn vậy, thử Chrome ở cửa sổ ẩn danh.'
                      : '→ Đang kiểm tra…'}
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 14,
                background: C.ink,
                color: C.soft,
                border: 'none',
                borderRadius: 12,
                padding: '10px 22px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: F.ui,
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
