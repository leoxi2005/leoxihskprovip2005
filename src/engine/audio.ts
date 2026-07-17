/** Mandarin TTS via Web Speech API + oscillator sound effects. */

const PREFERRED_VOICE = /Xiaoxiao|Yunxi|Tingting|Ting-Ting|Meijia|Mei-Jia|Huihui|Yaoyao|Lili|普通话/i;

export class Audio {
  muted = false;
  rate = 0.9;

  private voice: SpeechSynthesisVoice | null = null;
  /** Only the newest utterance is allowed to speak; older ones are dropped. */
  private seq = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
      this.voice = null;
    };
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
      clearTimeout(this.timer);
      speechSynthesis.cancel();
      // A short delay lets the cancel settle; Chrome drops utterances queued too soon after.
      this.timer = setTimeout(() => {
        if (seq !== this.seq) return;
        try {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          const v = this.pickVoice();
          if (v) u.voice = v;
          u.lang = 'zh-CN';
          u.rate = this.rate;
          u.pitch = 1;
          speechSynthesis.speak(u);
        } catch {
          /* ignore */
        }
      }, 200);
    } catch {
      /* ignore */
    }
  }

  /** Silence everything pending, e.g. on quit. */
  hush(): void {
    this.seq += 1;
    clearTimeout(this.timer);
    try {
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
