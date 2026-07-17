/** Mandarin TTS via Web Speech API + oscillator sound effects. */

const PREFERRED_VOICE = /Xiaoxiao|Yunxi|Tingting|Ting-Ting|Meijia|Mei-Jia|Huihui|Yaoyao|Lili|普通话/i;

export class Audio {
  muted = false;
  rate = 0.9;

  private voice: SpeechSynthesisVoice | null = null;
  /** Only the newest utterance is allowed to speak; older ones are dropped. */
  private seq = 0;
  private watchdog: ReturnType<typeof setTimeout> | undefined;
  private ctx: AudioContext | null = null;
  private onVisible: (() => void) | undefined;

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

  /** Detaches listeners — pair with `GameEngine.dispose`. */
  destroy(): void {
    clearTimeout(this.watchdog);
    if (this.onVisible) document.removeEventListener('visibilitychange', this.onVisible);
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
    if (typeof speechSynthesis === 'undefined' || !text || this.muted) return;
    this.seq += 1;
    const seq = this.seq;
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
   * Hands one utterance to the synth and watches that it actually starts.
   *
   * Chrome drops utterances on the floor in two known ways: the queue can be left
   * `paused` (typically after the tab was hidden mid-speech), swallowing everything
   * queued after it; and a `speak()` issued too close to a `cancel()` can vanish
   * without firing any event. `resume()` covers the first. The watchdog covers the
   * second — if nothing is speaking or pending shortly after, the utterance was lost,
   * so try once more. Without this the app just goes quiet until a reload.
   */
  private utter(text: string, seq: number, mayRetry: boolean): void {
    try {
      // Harmless when not paused, and the only way back when it is.
      speechSynthesis.resume();

      const u = new SpeechSynthesisUtterance(text);
      const v = this.pickVoice();
      if (v) u.voice = v;
      u.lang = 'zh-CN';
      u.rate = this.rate;
      u.pitch = 1;

      let started = false;
      u.onstart = () => (started = true);
      // "interrupted"/"canceled" are our own cancel() — expected, not a failure.
      u.onerror = (e) => {
        if (mayRetry && seq === this.seq && e.error !== 'interrupted' && e.error !== 'canceled') {
          this.utter(text, seq, false);
        }
      };

      speechSynthesis.speak(u);

      this.watchdog = setTimeout(() => {
        if (!mayRetry || seq !== this.seq || started) return;
        if (!speechSynthesis.speaking && !speechSynthesis.pending) {
          // Silently swallowed — one retry, and never loop on it.
          speechSynthesis.cancel();
          this.utter(text, seq, false);
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
