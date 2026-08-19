/**
 * Giọng đọc tiếng Trung của app + hiệu ứng âm thanh.
 *
 * Có hai đường đọc, theo thứ tự ưu tiên:
 *
 * 1. **Bản thu sẵn** trong `public/tts/` — dựng bằng `tools/tts/render.py` với giọng
 *    neural, đọc đúng 3.5 chữ/giây và nghỉ đúng như bản thu chính thức của đề (số đo
 *    ở đầu file đó). Đây mới là thứ giống phòng thi.
 * 2. **Giọng máy của trình duyệt** (Web Speech) — chỉ dùng khi câu đó chưa có bản thu,
 *    hoặc trình duyệt không phát được mp3. Giọng này là giọng của *máy đang mở app*:
 *    máy khác cho giọng khác, và không giọng nào đọc theo nhịp đề thi.
 *
 * `src/data/tts.test.ts` chặn việc thêm nội dung mà quên thu — nếu không, câu mới sẽ
 * lặng lẽ tụt xuống đường (2) giữa một buổi học toàn giọng phòng thi.
 */

import clipKeys from '../data/tts.json';
import { ttsKey } from './tts';

const PREFERRED_VOICE = /Xiaoxiao|Yunxi|Tingting|Ting-Ting|Meijia|Mei-Jia|Huihui|Yaoyao|Lili|普通话/i;

/**
 * Voices that are actually male. The Web Speech API exposes no gender field, so the
 * only handle is the name — these are the shipped Mandarin voices across macOS,
 * Windows and Chrome that read as male.
 */
const MALE_VOICE = /Yunxi|Yunyang|Yunjian|Yunfeng|Yunhao|Kangkang|Zhiyu|Liang/i;

const FEMALE_VOICE = /Xiaoxiao|Xiaoyi|Tingting|Ting-Ting|Huihui|Yaoyao|Meijia|Mei-Jia|Lili|Xiaomo/i;

export type SpeakerRole = 'male' | 'female' | 'narrator';

/** Khoá của những câu đã có bản thu sẵn. Do `tools/tts/render.py` ghi ra. */
const CLIPS = new Set<string>(clipKeys as string[]);

/** Đúng bộ lọc `tools/tts/collect.mjs` dùng khi đặt tên file — lệch là trượt khoá. */
const HAN = /[\u4e00-\u9fff]/;
const spoken = (lines: string[]): string[] => lines.filter((l) => l && HAN.test(l));

/**
 * Strips the 男：/女：/问： label the script carries.
 *
 * The real recording never says these out loud — you hear two different people and a
 * narrator. Reading the labels aloud both wastes listening time and hands over the
 * speaker cue for free, which is one of the things the paper is testing.
 */
export function splitRole(line: string): { role: SpeakerRole; text: string } {
  const m = line.match(/^\s*(男|女|问)\s*[：:]\s*/);
  if (!m) return { role: 'narrator', text: line.trim() };
  const role: SpeakerRole = m[1] === '男' ? 'male' : m[1] === '女' ? 'female' : 'narrator';
  return { role, text: line.slice(m[0].length).trim() };
}

export class Audio {
  muted = false;
  /**
   * 1 = đúng tốc độ đề thi. Bản thu sẵn đã ở nhịp đề, nên đây là hệ số phát lại;
   * mặc định 0.9 là chậm hơn phòng thi một chút, và chế độ thi ép về 1.
   */
  rate = 0.9;

  private voice: SpeechSynthesisVoice | null = null;
  /** Only the newest utterance is allowed to speak; older ones are dropped. */
  private seq = 0;
  private watchdog: ReturnType<typeof setTimeout> | undefined;
  private ctx: AudioContext | null = null;
  private onVisible: (() => void) | undefined;
  /** Một thẻ <audio> dùng lại cho mọi câu — phát câu mới là câu cũ tự dừng. */
  private el: HTMLAudioElement | null = null;
  private canPlayFiles: boolean | null = null;

  constructor() {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
      this.voice = null;
    };
    // Coming back to a hidden tab is the usual way Chrome's queue ends up stuck
    // paused; nudging it here means the next word speaks instead of vanishing.
    this.onVisible = () => {
      if (document.hidden) return;
      try {
        speechSynthesis.resume();
      } catch {
        /* ignore */
      }
    };
    document.addEventListener('visibilitychange', this.onVisible);
  }

  /** Dừng bản thu đang phát, nếu có. */
  private stopClip(): void {
    if (!this.el) return;
    try {
      this.el.onerror = null;
      this.el.pause();
    } catch {
      /* ignore */
    }
  }

  /** Detaches listeners — pair with `GameEngine.dispose`. */
  destroy(): void {
    clearTimeout(this.watchdog);
    this.stopClip();
    if (this.onVisible) document.removeEventListener('visibilitychange', this.onVisible);
  }

  /**
   * Địa chỉ bản thu sẵn của một câu, hoặc null nếu câu đó chưa được thu.
   *
   * Có để màn kiểm tra âm thanh thử đúng đường mà app dùng thật, thay vì thử giọng
   * máy rồi kết luận nhầm là "máy không đọc được".
   */
  clipUrl(text: string): string | null {
    const key = ttsKey(text);
    return CLIPS.has(key) ? `${import.meta.env.BASE_URL}tts/${key}.mp3` : null;
  }

  /** Có bao nhiêu câu đã thu sẵn. */
  get clipCount(): number {
    return CLIPS.size;
  }

  /**
   * Máy này có nghe được tiếng Trung từ app không — bằng bản thu sẵn hoặc giọng máy.
   *
   * Từ khi có bản thu sẵn, "máy không cài giọng tiếng Trung" không còn là câu chuyện
   * chết người nữa, nên cảnh báo trong lúc học phải hỏi câu này chứ không hỏi riêng
   * giọng máy.
   */
  canSpeak(): boolean {
    return (this.useFiles() && CLIPS.size > 0) || this.hasChineseVoice();
  }

  /** True when the browser has no Mandarin voice at all — nothing to hear, ever. */
  hasChineseVoice(): boolean {
    if (typeof speechSynthesis === 'undefined') return false;
    const vs = speechSynthesis.getVoices() || [];
    // An empty list usually means the voices simply haven't loaded yet, so don't
    // accuse the browser of missing Chinese until it has told us what it has.
    return !vs.length || vs.some((v) => /^zh/i.test(v.lang));
  }

  private pickVoice(): SpeechSynthesisVoice | null {
    if (this.voice) return this.voice;
    if (typeof speechSynthesis === 'undefined') return null;
    const vs = speechSynthesis.getVoices() || [];
    this.voice =
      vs.find((v) => PREFERRED_VOICE.test(v.name) && /zh/i.test(v.lang)) ||
      vs.find((v) => v.lang === 'zh-CN' || v.lang === 'zh_CN') ||
      vs.find((v) => /^zh/i.test(v.lang)) ||
      null;
    return this.voice;
  }

  speak(text: string): void {
    if (!text || this.muted) return;
    this.seq += 1;
    const seq = this.seq;
    // Bản thu sẵn trước: đúng giọng, đúng nhịp đề, và giống nhau trên mọi máy.
    if (this.playClip(ttsKey(text), this.rate, () => this.speakSynth(text, seq))) return;
    this.speakSynth(text, seq);
  }

  /** Đường dự phòng: nhờ giọng máy của trình duyệt đọc. */
  private speakSynth(text: string, seq: number): void {
    if (typeof speechSynthesis === 'undefined') return;
    if (seq !== this.seq) return;
    try {
      clearTimeout(this.watchdog);
      speechSynthesis.resume();
      // A cancel() issued right before speak() is what makes Chrome drop utterances,
      // so only cancel when there is actually something to stop.
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      // Speak inside the click or keypress that led here. Safari rejects speech that
      // isn't part of a user gesture, and says nothing about it — anything deferred
      // through a setTimeout is silently dropped, which is silence with no error.
      this.utter(text, seq, true);
    } catch {
      /* ignore */
    }
  }

  /**
   * Trình duyệt này có phát nổi mp3 không.
   *
   * Hỏi thẳng `canPlayType` chứ không đoán theo tên trình duyệt: jsdom trong bài test
   * trả về chuỗi rỗng — nó thật sự không phát được gì — nên test chạy đúng đường giọng
   * máy như trước, còn trình duyệt thật thì trả 'probably'/'maybe'.
   */
  private useFiles(): boolean {
    if (this.canPlayFiles !== null) return this.canPlayFiles;
    let ok = false;
    try {
      const probe = document.createElement('audio');
      ok = typeof probe.canPlayType === 'function' && !!probe.canPlayType('audio/mpeg');
    } catch {
      ok = false;
    }
    this.canPlayFiles = ok;
    return ok;
  }

  /**
   * Phát một câu đã thu sẵn. Trả về false khi câu đó chưa có bản thu — lúc đó phía
   * gọi tự chuyển sang giọng máy.
   *
   * `onFail` dành cho trường hợp file có trong bản kê nhưng tải hỏng (mạng đứt giữa
   * chừng, cache lỗi): thà nghe giọng máy còn hơn ngồi im.
   */
  private playClip(key: string, rate: number, onFail: () => void): boolean {
    if (!this.useFiles() || !CLIPS.has(key)) return false;
    try {
      // Đang có giọng máy dở dang thì cắt, kẻo hai giọng chồng lên nhau.
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    try {
      const el = this.el ?? (this.el = document.createElement('audio'));
      const seq = this.seq;
      el.pause();
      el.onerror = () => {
        if (seq === this.seq) onFail();
      };
      el.src = `${import.meta.env.BASE_URL}tts/${key}.mp3`;
      // Chậm lại mà đổi cao độ thì nghe như giọng khác; giữ nguyên cao độ.
      el.preservesPitch = true;
      (el as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
      el.playbackRate = Math.max(0.5, Math.min(2, rate));
      el.currentTime = 0;
      const p = el.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          if (seq === this.seq) onFail();
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  /** Every distinct Mandarin voice the browser offers. */
  private zhVoices(): SpeechSynthesisVoice[] {
    if (typeof speechSynthesis === 'undefined') return [];
    return (speechSynthesis.getVoices() || []).filter((v) => /^zh/i.test(v.lang));
  }

  /** A separate voice per speaker, where the system actually has one. */
  private voiceFor(role: SpeakerRole): SpeechSynthesisVoice | null {
    const vs = this.zhVoices();
    if (role === 'male') {
      const male = vs.find((v) => MALE_VOICE.test(v.name));
      if (male) return male;
    }
    if (role === 'female') {
      const female = vs.find((v) => FEMALE_VOICE.test(v.name));
      if (female) return female;
    }
    return this.pickVoice();
  }

  /**
   * Pitch fallback for the common case of a machine with only one Mandarin voice.
   *
   * Not an impression of a man and a woman — just enough separation that you can tell
   * the turns apart, which is the cue the real recording gives you for free.
   */
  private pitchFor(role: SpeakerRole, distinctVoices: boolean): number {
    if (distinctVoices) return 1;
    return role === 'male' ? 0.75 : role === 'female' ? 1.2 : 1;
  }

  /**
   * Reads a listening item the way the paper presents it: one turn per speaker, with
   * the 男/女/问 labels stripped and a different voice (or pitch) for each.
   *
   * `minRate` exists for the exam, which must never play slower than natural even if
   * the learner has turned the practice voice down.
   */
  speakDialogue(lines: string[], minRate = 0): void {
    if (!lines.length || this.muted) return;
    this.seq += 1;
    const seq = this.seq;
    const rate = Math.max(this.rate, minRate);
    // Cả lượt nghe là MỘT file: hai giọng và các khoảng nghỉ giữa lượt đã nằm sẵn
    // trong đó, đúng như băng thi — ghép ở đây thì mỗi máy lại ra một nhịp khác.
    const key = ttsKey(spoken(lines).join('\n'));
    if (this.playClip(key, rate, () => this.dialogueSynth(lines, rate, seq))) return;
    this.dialogueSynth(lines, rate, seq);
  }

  /** Đường dự phòng cho lượt nghe: ghép từng lượt bằng giọng máy. */
  private dialogueSynth(lines: string[], rate: number, seq: number): void {
    if (typeof speechSynthesis === 'undefined' || seq !== this.seq) return;
    const parts = lines.map(splitRole).filter((p) => p.text);
    if (!parts.length) return;

    const roles = new Set(parts.map((p) => p.role));
    const voices = new Map([...roles].map((r) => [r, this.voiceFor(r)]));
    // Distinct only if the roles genuinely landed on different voices.
    const distinct = new Set([...voices.values()].map((v) => v?.name ?? '')).size > 1;

    try {
      clearTimeout(this.watchdog);
      speechSynthesis.resume();
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      parts.forEach((p, i) => {
        // Only the first line gets the watchdog: once the queue is running, `pending`
        // is true and the "nothing happened" check would fire on every later line.
        this.utter(p.text, seq, i === 0, {
          voice: voices.get(p.role) ?? null,
          pitch: this.pitchFor(p.role, distinct),
          rate,
        });
      });
    } catch {
      /* ignore */
    }
  }

  /**
   * Hands one utterance to the synth and watches that it actually starts.
   *
   * Chrome drops utterances on the floor in two known ways: the queue can be left
   * `paused` (typically after the tab was hidden mid-speech), swallowing everything
   * queued after it; and a `speak()` issued too close to a `cancel()` can vanish
   * without firing any event. `resume()` covers the first. The watchdog covers the
   * second — if nothing is speaking or pending shortly after, the utterance was lost,
   * so try once more. Without this the app just goes quiet until a reload.
   */
  private utter(
    text: string,
    seq: number,
    mayRetry: boolean,
    opts?: { voice: SpeechSynthesisVoice | null; pitch: number; rate: number },
  ): void {
    try {
      // Harmless when not paused, and the only way back when it is.
      speechSynthesis.resume();

      const u = new SpeechSynthesisUtterance(text);
      const v = opts ? opts.voice : this.pickVoice();
      if (v) u.voice = v;
      u.lang = 'zh-CN';
      u.rate = opts?.rate ?? this.rate;
      u.pitch = opts?.pitch ?? 1;

      let started = false;
      u.onstart = () => (started = true);
      // "interrupted"/"canceled" are our own cancel() — expected, not a failure.
      u.onerror = (e) => {
        if (mayRetry && seq === this.seq && e.error !== 'interrupted' && e.error !== 'canceled') {
          this.utter(text, seq, false, opts);
        }
      };

      speechSynthesis.speak(u);

      this.watchdog = setTimeout(() => {
        if (!mayRetry || seq !== this.seq || started) return;
        if (!speechSynthesis.speaking && !speechSynthesis.pending) {
          // Silently swallowed — one retry, and never loop on it.
          speechSynthesis.cancel();
          this.utter(text, seq, false, opts);
        }
      }, 400);
    } catch {
      /* ignore */
    }
  }

  /** Silence everything pending, e.g. on quit. */
  hush(): void {
    this.seq += 1;
    clearTimeout(this.watchdog);
    this.stopClip();
    try {
      // cancel() on a paused queue leaves it paused, and the next speak() would be
      // swallowed — resume first so the synth is left in a usable state.
      speechSynthesis.resume();
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }

  private audioCtx(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    // Safari hands back a context that is born "suspended" and stays that way until
    // resumed inside a user gesture — every sound is silently dropped until then.
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', vol = 0.15): void {
    if (this.muted) return;
    const a = this.audioCtx();
    if (!a) return;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, a.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + at + dur);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start(a.currentTime + at);
    osc.stop(a.currentTime + at + dur + 0.05);
  }

  pick(): void {
    this.tone(520, 0, 0.07, 'triangle', 0.07);
  }

  /** Rising arpeggio, plus a fanfare on every 5th combo. */
  right(combo: number): void {
    [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.09, 0.18, 'triangle', 0.13));
    if (combo > 0 && combo % 5 === 0) {
      [784, 988, 1175, 1319].forEach((f, i) => this.tone(f, 0.32 + i * 0.08, 0.15, 'triangle', 0.11));
    }
  }

  wrong(): void {
    this.tone(196, 0, 0.22, 'sawtooth', 0.09);
    this.tone(147, 0.12, 0.3, 'sawtooth', 0.09);
  }

  /** Played when a session earns its bonus finale round. */
  finale(): void {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.07, 0.14, 'triangle', 0.12));
  }
}
