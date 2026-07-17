import { DECK, type Vocab } from '../data';
import { OOPS, PRAISE } from '../theme';
import { Audio } from './audio';
import { ttsFor } from './questions';
import { buildSession, endlessBatch, nextFinale, pools, topicsOf, type TopicSel } from './session';
import {
  DEFAULT_STATS,
  KEYS,
  load,
  loadRaw,
  migrateSrs,
  nextEntry,
  save,
  saveRaw,
  type SrsMap,
} from './storage';
import {
  DEFAULT_SETTINGS,
  isChoiceQ,
  isTileQ,
  type GameId,
  type GameState,
  type Question,
  type Settings,
  type Stats,
} from './types';

const FRESH = {
  sel: -1,
  typed: [] as string[],
  usedTiles: [] as number[],
  typedText: '',
  checked: false,
  mSel: -1,
  mDone: [] as boolean[],
  mWrong: {} as Record<string, 1>,
  tfLeft: 100,
  flashOn: true,
};

const INITIAL: GameState = {
  ready: false,
  mode: 'home',
  game: 'mix',
  qi: 0,
  session: [],
  score: 0,
  best: 0,
  dead: false,
  correct: false,
  combo: 0,
  sessionXp: 0,
  right: 0,
  wrong: 0,
  missed: [],
  fbMsg: '',
  topicVer: 0,
  muted: false,
  light: false,
  bossHp: 100,
  hearts: 3,
  bookWord: null,
  ...FRESH,
};

/** Lightning round allows 6s per question. */
const TF_MS = 6000;

/**
 * Endless mode's clock: generous at first, then tightening a little per answer down
 * to a floor. Slow enough to think early, fast enough that a long run gets tense.
 */
const ENDLESS_START_MS = 9000;
const ENDLESS_STEP_MS = 200;
const ENDLESS_FLOOR_MS = 3500;
const endlessMs = (score: number) => Math.max(ENDLESS_FLOOR_MS, ENDLESS_START_MS - score * ENDLESS_STEP_MS);

/**
 * Owns all game state and side effects (timers, speech, SRS writes). Framework-free
 * and observable — React subscribes via `useEngine`.
 */
export class GameEngine {
  state: GameState = INITIAL;
  settings: Settings = DEFAULT_SETTINGS;
  audio = new Audio();
  srs: SrsMap = {};
  stats: Stats = DEFAULT_STATS;
  topics: string[] = [];
  sel: TopicSel = {};

  private listeners = new Set<() => void>();
  private tfInt: ReturnType<typeof setInterval> | undefined;
  private tfNext: ReturnType<typeof setTimeout> | undefined;
  private flashT: ReturnType<typeof setTimeout> | undefined;
  /** Set by the quiz screen so `type`/`dict` questions can focus the input. */
  focusInput: (() => void) | undefined;
  /** Set by the confetti layer. */
  burst: (n: number) => void = () => {};

  // -- store ----------------------------------------------------------------

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getState = (): GameState => this.state;

  private setState(patch: Partial<GameState>, cb?: () => void): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
    cb?.();
  }

  // -- lifecycle ------------------------------------------------------------

  init(): void {
    this.settings = { ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) };
    this.audio.rate = this.settings.voiceRate;
    this.stats = { ...DEFAULT_STATS, ...load(KEYS.stats, {}) };
    this.srs = migrateSrs(load<SrsMap>(KEYS.srs, {}));
    this.topics = topicsOf();

    const saved = load<TopicSel | null>(KEYS.topics, null);
    this.sel = saved ?? Object.fromEntries(this.topics.map((t) => [t, true]));

    this.setState({ ready: true, muted: loadRaw(KEYS.muted) === '1' });
    this.audio.muted = this.state.muted;
  }

  dispose(): void {
    this.clearTimers();
    this.audio.hush();
  }

  setSettings(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    this.audio.rate = this.settings.voiceRate;
    save(KEYS.settings, this.settings);
    this.setState({});
  }

  private clearTimers(): void {
    clearInterval(this.tfInt);
    clearTimeout(this.tfNext);
    clearTimeout(this.flashT);
  }

  // -- navigation -----------------------------------------------------------

  cur = (): Question | undefined => this.state.session[this.state.qi];

  goHome = (): void => {
    this.audio.hush();
    this.clearTimers();
    this.setState({ mode: 'home', bookWord: null });
  };

  openBook = (): void => this.setState({ mode: 'book', bookWord: null });
  closeBookWord = (): void => this.setState({ bookWord: null });

  bookPick = (w: Vocab): void => {
    this.setState({ bookWord: w });
    this.audio.speak(w.h);
  };

  quit = (): void => {
    this.audio.hush();
    this.clearTimers();
    this.setState({ mode: 'home' });
  };

  toggleMute = (): void => {
    const muted = !this.state.muted;
    this.audio.muted = muted;
    if (muted) this.audio.hush();
    saveRaw(KEYS.muted, muted ? '1' : '0');
    this.setState({ muted });
  };

  // -- topics ---------------------------------------------------------------

  private saveTopics(): void {
    save(KEYS.topics, this.sel);
    this.setState({ topicVer: this.state.topicVer + 1 });
  }

  selAll = (): void => {
    this.topics.forEach((t) => (this.sel[t] = true));
    this.saveTopics();
  };

  selNone = (): void => {
    this.topics.forEach((t) => (this.sel[t] = false));
    this.saveTopics();
  };

  toggleTopic = (t: string): void => {
    this.sel[t] = !this.sel[t];
    this.saveTopics();
  };

  pools = () => pools(this.sel);

  // -- session --------------------------------------------------------------

  startSession = (): void => this.startGame('mix');

  startGame = (g: GameId): void => {
    const session = buildSession(g, this.sel, this.srs, this.settings);
    if (!session.length) return;
    this.clearTimers();
    this.setState(
      {
        ...FRESH,
        mode: 'quiz',
        game: g,
        session,
        qi: 0,
        correct: false,
        combo: 0,
        sessionXp: 0,
        right: 0,
        wrong: 0,
        missed: [],
        fbMsg: '',
        // Only "mix" earns a finale round; single-mode sessions end when they end.
        light: g !== 'mix',
        bossHp: 100,
        hearts: 3,
        score: 0,
        best: this.bestEndless(),
        dead: false,
      },
      () => this.onShow(),
    );
  };

  /** Personal best for endless mode. */
  bestEndless = (): number => load(KEYS.best, 0);

  /** Runs when a question first appears: auto-audio, focus, and per-kind timers. */
  private onShow(): void {
    const q = this.cur();
    if (!q) return;
    const auto = this.settings.autoPlayAudio;

    if (q.kind === 'song') {
      // The real song is sung by its video — TTS must never talk over it. Chants have
      // no audio of their own, so those get read with a pause at the blank.
      if (q.yt) this.audio.hush();
      else this.audio.speak(q.line.cn.split(q.line.blank).join('……'));
      return;
    }
    if (q.kind === 'a2h' || q.kind === 'dict' || q.kind === 'tf') {
      this.audio.speak(q.kind === 'tf' ? q.w.h : q.word.h);
    } else if (auto && (q.kind === 'h2m' || q.kind === 'write' || q.kind === 'type')) {
      this.audio.speak(q.word.h);
    } else {
      this.audio.hush();
    }

    if (q.kind === 'type' || q.kind === 'dict') setTimeout(() => this.focusInput?.(), 80);

    if (q.kind === 'flash') {
      clearTimeout(this.flashT);
      this.setState({ flashOn: true });
      this.flashT = setTimeout(
        () => this.setState({ flashOn: false }),
        Math.max(800, this.settings.flashMs),
      );
    }

    if (q.kind === 'tf') this.runClock(TF_MS, () => this.answerTF(null));
    else if (this.state.game === 'endless') {
      this.runClock(endlessMs(this.state.score), () => this.timeUp());
    }
  }

  /**
   * Drives the countdown bar. Pauses while the tab is hidden — otherwise a run would
   * expire unseen while you're in another tab.
   */
  private runClock(total: number, onZero: () => void): void {
    this.clearTimers();
    let remain = total;
    this.tfInt = setInterval(() => {
      if (document.hidden) return;
      remain -= 100;
      if (remain <= 0) onZero();
      else this.setState({ tfLeft: Math.round((remain / total) * 100) });
    }, 100);
  }

  /** Endless mode: the clock ran out, which ends the run. */
  private timeUp(): void {
    const st = this.state;
    if (st.checked || st.game !== 'endless') return;
    this.clearTimers();
    this.audio.wrong();
    this.setState({
      checked: true,
      correct: false,
      dead: true,
      combo: 0,
      wrong: st.wrong + 1,
      tfLeft: 0,
      fbMsg: '⏰ Hết giờ! Chuỗi dừng ở ' + st.score,
    });
  }

  next = (): void => {
    const st = this.state;
    this.clearTimers();
    const q = this.cur();

    // Boss round ends the moment either side runs out.
    if (q?.boss && (st.bossHp <= 0 || st.hearts <= 0)) return this.finish();
    // An endless run is over the instant it dies, however many questions are queued.
    if (st.game === 'endless' && st.dead) return this.finish();

    if (st.qi + 1 >= st.session.length) {
      if (!st.light) {
        const finale = nextFinale(this.pools().vocab);
        if (finale.length >= 4) {
          this.audio.finale();
          this.setState(
            {
              ...FRESH,
              session: [...st.session, ...finale],
              light: true,
              qi: st.qi + 1,
              bossHp: 100,
              hearts: 3,
            },
            () => this.onShow(),
          );
          return;
        }
      }
      return this.finish();
    }
    this.setState({ ...FRESH, qi: st.qi + 1 }, () => this.onShow());
  };

  private finish(): void {
    if (this.state.game === 'endless' && this.state.score > this.bestEndless()) {
      save(KEYS.best, this.state.score);
    }
    const s = this.stats;
    const today = new Date().toDateString();
    if (s.last !== today) {
      const yesterday = new Date(Date.now() - 864e5).toDateString();
      s.streak = s.last === yesterday ? (s.streak || 0) + 1 : 1;
      s.last = today;
    }
    if (s.dayDate !== today) {
      s.dayDate = today;
      s.dayXp = 0;
    }
    s.dayXp += this.state.sessionXp;
    s.xp = (s.xp || 0) + this.state.sessionXp;
    save(KEYS.stats, s);
    this.audio.hush();
    this.setState({ mode: 'result' });
    setTimeout(() => this.burst(120), 200);
  }

  // -- answering ------------------------------------------------------------

  private grade(id: string, ok: boolean): void {
    this.srs[id] = nextEntry(this.srs[id], ok);
    save(KEYS.srs, this.srs);
  }

  /** Select an option, or place a tile for `write`/`order`. */
  pick = (i: number): void => {
    const q = this.cur();
    if (this.state.checked || !q) return;

    if (isTileQ(q)) {
      const { typed, usedTiles } = this.state;
      const pos = usedTiles.indexOf(i);
      if (pos >= 0) {
        // Tapping a placed tile takes it back out.
        this.audio.pick();
        this.setState({
          typed: typed.filter((_, k) => k !== pos),
          usedTiles: usedTiles.filter((_, k) => k !== pos),
        });
        return;
      }
      if (typed.length >= q.tlen) return;
      this.audio.pick();
      this.setState({ typed: [...typed, q.tiles[i]], usedTiles: [...usedTiles, i] });
      return;
    }
    this.audio.pick();
    this.setState({ sel: i });
  };

  undo = (): void => {
    const { typed, usedTiles, checked } = this.state;
    if (checked || !typed.length) return;
    this.setState({ typed: typed.slice(0, -1), usedTiles: usedTiles.slice(0, -1) });
  };

  removeSlot = (k: number): void => {
    const { typed, usedTiles, checked } = this.state;
    if (checked || k >= typed.length) return;
    this.audio.pick();
    this.setState({
      typed: typed.filter((_, i) => i !== k),
      usedTiles: usedTiles.filter((_, i) => i !== k),
    });
  };

  setTyped = (typedText: string): void => {
    if (!this.state.checked) this.setState({ typedText });
  };

  playPrompt = (): void => {
    const q = this.cur();
    if (q) this.audio.speak(ttsFor(q));
  };

  /** Whether the current answer is complete enough to check. */
  canCheck(): boolean {
    const q = this.cur();
    const st = this.state;
    if (!q) return false;
    if (isTileQ(q)) return st.typed.length > 0;
    if (q.kind === 'type' || q.kind === 'dict') return st.typedText.trim().length > 0;
    return st.sel >= 0;
  }

  check = (): void => {
    const q = this.cur();
    const st = this.state;
    // Match and lightning grade themselves as you answer.
    if (!q || q.kind === 'match' || q.kind === 'tf' || st.checked) return;

    let ok: boolean;
    if (isTileQ(q)) {
      if (!st.typed.length) return;
      ok = st.typed.join('') === q.ansStr;
    } else if (q.kind === 'type' || q.kind === 'dict') {
      if (!st.typedText.trim()) return;
      ok = st.typedText.trim() === q.word.h;
    } else if (isChoiceQ(q)) {
      if (st.sel < 0) return;
      ok = st.sel === q.ans;
    } else {
      return;
    }

    if (!q.re && q.id) this.grade(q.id, ok);

    const combo = ok ? st.combo + 1 : 0;
    let gain = ok ? (q.re ? 5 : 10) + Math.min(combo, 6) : 0;
    let bonusMsg = '';
    if (ok && combo > 0 && combo % 5 === 0) {
      gain += 15;
      bonusMsg = 'COMBO ×' + combo + '! +15 XP · ';
    }

    const missed = st.missed.slice();
    const session = st.session;
    if (!ok) {
      if ('word' in q && !missed.some((m) => m.h === q.word.h)) missed.push(q.word);
      if (q.kind === 'gram' && !missed.some((m) => m.h === q.g.a)) {
        missed.push({ h: q.g.a, p: q.g.pin, m: q.g.name });
      }
      // Wrong answers come back later in the same session, worth less and not re-graded.
      if (!q.re && !q.boss) session.push({ ...q, re: true });
    }

    const patch: Partial<GameState> = {};
    if (q.boss) {
      if (ok) {
        const dmg = 18 + Math.min(combo, 5) * 3;
        const hp = Math.max(0, st.bossHp - dmg);
        patch.bossHp = hp;
        gain += 4;
        bonusMsg = '💥 -' + dmg + ' HP! ' + bonusMsg;
        if (hp <= 0) {
          gain += 50;
          bonusMsg = '🐉 HẠ GỤC TRÙM! +50 XP · ';
        }
      } else {
        patch.hearts = st.hearts - 1;
        bonusMsg =
          patch.hearts <= 0 ? '💔 Hết tim — trùm thắng lần này! · ' : '🐉 Trùm tấn công! Mất 1 tim · ';
      }
    }

    if (st.game === 'endless') {
      if (ok) {
        // Survive → the run grows by one more question. Nothing is queued ahead, so
        // the session length is literally the score.
        patch.score = st.score + 1;
        patch.session = [...session, ...endlessBatch(this.sel, this.srs, 1)];
        if (patch.score > st.best) bonusMsg = '🏆 KỶ LỤC MỚI! · ' + bonusMsg;
      } else {
        // One mistake ends it — that's the whole tension of the mode.
        patch.dead = true;
        bonusMsg = '💀 Chuỗi dừng ở ' + st.score + ' · ';
      }
    }

    if (ok) {
      this.audio.right(combo);
      this.burst(q.boss && patch.bossHp !== undefined && patch.bossHp <= 0 ? 150 : combo >= 5 ? 90 : 35);
    } else {
      this.audio.wrong();
    }
    // Reading a whole passage aloud after every question would be noise, and the real
    // song is already playing — speaking over either is worse than staying quiet.
    // Both stay reachable through the 🔊 replay button.
    if (q.kind !== 'pass' && !(q.kind === 'song' && q.yt)) this.audio.speak(ttsFor(q));

    const msgs = ok ? PRAISE : OOPS;
    this.setState({
      checked: true,
      correct: ok,
      combo,
      sessionXp: st.sessionXp + gain,
      right: st.right + (ok ? 1 : 0),
      wrong: st.wrong + (ok ? 0 : 1),
      missed,
      session,
      fbMsg: bonusMsg + msgs[Math.floor(Math.random() * msgs.length)],
      ...patch,
    });
  };

  // -- lightning ------------------------------------------------------------

  /** `null` = the timer ran out. */
  answerTF = (val: boolean | null): void => {
    const q = this.cur();
    const st = this.state;
    if (!q || q.kind !== 'tf' || st.checked) return;
    this.clearTimers();

    const timeout = val === null;
    const ok = !timeout && val === q.isTrue;
    const combo = ok ? st.combo + 1 : 0;
    const gain = ok ? 16 + Math.min(combo, 6) : 0;
    const missed = st.missed.slice();
    if (!ok && !missed.some((m) => m.h === q.w.h)) missed.push(q.w);

    if (ok) {
      this.audio.right(combo);
      this.burst(30);
    } else if (!timeout) {
      this.audio.wrong();
    }
    // A timeout stays silent — no buzzer, no reading — and waits for Enter.
    if (!timeout) this.audio.speak(q.w.h);

    this.setState({
      checked: true,
      correct: ok,
      combo,
      sessionXp: st.sessionXp + gain,
      right: st.right + (ok ? 1 : 0),
      wrong: st.wrong + (ok ? 0 : 1),
      missed,
      fbMsg: ok ? '⚡ Nhanh như chớp!' : timeout ? '⏰ Hết giờ! Bấm Enter để tiếp tục' : '哎呀! Chưa đúng',
    });
    if (!timeout) this.tfNext = setTimeout(() => this.next(), 1400);
  };

  tfYes = (): void => this.answerTF(true);
  tfNo = (): void => this.answerTF(false);

  // -- match ----------------------------------------------------------------

  pickL = (i: number): void => {
    const q = this.cur();
    if (!q || q.kind !== 'match' || this.state.checked || this.state.mDone[i]) return;
    this.audio.pick();
    this.setState({ mSel: this.state.mSel === i ? -1 : i });
  };

  pickR = (j: number): void => {
    const q = this.cur();
    const st = this.state;
    if (!q || q.kind !== 'match' || st.checked) return;
    const i = st.mSel;
    if (i < 0) return;
    const pairIdx = q.rightOrder[j];
    if (st.mDone[pairIdx]) return;

    if (pairIdx === i) {
      const mDone = st.mDone.slice();
      mDone[i] = true;
      this.audio.tone(660 + i * 60, 0, 0.12, 'triangle', 0.12);
      this.audio.speak(q.pairs[i].h);
      if (mDone.filter(Boolean).length >= q.pairs.length) return this.completeMatch(mDone);
      this.setState({ mDone, mSel: -1 });
    } else {
      // A miss is remembered for grading but doesn't end the board.
      this.audio.wrong();
      this.setState({ mWrong: { ...st.mWrong, [q.pairs[i].h]: 1 }, mSel: -1 });
    }
  };

  private completeMatch(mDone: boolean[]): void {
    const q = this.cur();
    const st = this.state;
    if (!q || q.kind !== 'match') return;

    let okAll = true;
    let gain = 0;
    const missed = st.missed.slice();
    q.pairs.forEach((w) => {
      const ok = !st.mWrong[w.h];
      this.grade('w:' + w.h, ok);
      if (ok) gain += 6;
      else {
        okAll = false;
        if (!missed.some((m) => m.h === w.h)) missed.push(w);
      }
    });

    const combo = okAll ? st.combo + 1 : 0;
    if (okAll) {
      gain += 8;
      this.audio.right(combo);
      this.burst(60);
    } else {
      this.audio.tone(392, 0, 0.2, 'triangle', 0.1);
    }
    const nErr = Object.keys(st.mWrong).length;
    this.setState({
      checked: true,
      correct: okAll,
      mDone,
      combo,
      sessionXp: st.sessionXp + gain,
      right: st.right + (okAll ? 1 : 0),
      wrong: st.wrong + (okAll ? 0 : 1),
      missed,
      fbMsg: okAll ? '完美! Ghép đúng cả 4 cặp 🎉' : 'Ghép xong — có ' + nErr + ' từ bị nhầm',
    });
  }

  // -- keyboard -------------------------------------------------------------

  handleKey = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    const el = e.target as HTMLElement | null;

    const { mode, checked, ready } = this.state;
    if (!ready) return;

    // Inside a text field, only the quiz's Enter is ours — and never mid-IME-composition,
    // where Enter is how you accept a candidate. Escape gives the field back.
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      if (e.key === 'Escape') el.blur();
      if (mode === 'quiz' && e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        if (checked) this.next();
        else this.check();
      }
      return;
    }

    if (mode === 'book') {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        if (this.state.bookWord) this.closeBookWord();
        else this.setState({ mode: 'home' });
      }
      return;
    }

    if ((mode === 'home' || mode === 'result') && e.key === 'Enter') {
      // Without this, a button left focused by an earlier click also fires its own
      // click on Enter — starting a session and then acting again on top of it.
      e.preventDefault();
      // From the result screen, Enter replays the mode just played.
      return mode === 'result' ? this.startGame(this.state.game) : this.startSession();
    }

    if (mode === 'home') {
      // 1–9 follow the card order; the 10th card takes 0, and endless has its own key
      // because it sits with the primary buttons rather than in the grid.
      const games: GameId[] = ['boss', 'tf', 'write', 'listen', 'match', 'flash', 'read', 'song', 'mysong'];
      const gi = parseInt(e.key, 10);
      if (!isNaN(gi) && gi >= 1 && gi <= games.length) return this.startGame(games[gi - 1]);
      if (e.key === '0') return this.startGame('confuse');
      if (e.key === 's' || e.key === 'S') return this.startGame('endless');
    }

    if (mode !== 'quiz') return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (checked) this.next();
      else this.check();
      return;
    }
    if (checked) return;
    if (e.key === 'Backspace') return this.undo();

    const n = parseInt(e.key, 10);
    if (isNaN(n) || n < 1) return;
    const q = this.cur();
    if (!q) return;

    if (q.kind === 'tf') {
      if (n === 1) this.tfYes();
      else if (n === 2) this.tfNo();
      return;
    }
    if (q.kind === 'match') {
      // Left column takes 1–4, right column continues at 5–8.
      if (n <= q.pairs.length) this.pickL(n - 1);
      else if (n <= q.pairs.length * 2) this.pickR(n - 1 - q.pairs.length);
      return;
    }
    const max = isTileQ(q) ? q.tiles.length : 'opts' in q ? q.opts.length : 0;
    if (n <= max) this.pick(n - 1);
  };

  // -- derived --------------------------------------------------------------

  /** Home screen counters over the currently selected topics. */
  progress() {
    const P = this.pools();
    const now = Date.now();
    const ids = [
      ...P.vocab.map((v) => 'w:' + v.h),
      ...P.grammar.map((g) => g.id),
      ...P.sentences.map((s) => s.id),
      ...P.passages.map((p) => p.id),
      ...P.orders.map((o) => o.id),
    ];
    let due = 0;
    let learned = 0;
    let seen = 0;
    ids.forEach((id) => {
      const e = this.srs[id];
      if (!e) return;
      seen++;
      if (e.due <= now) due++;
      if (e.box >= 3) learned++;
    });

    const today = new Date().toDateString();
    const dayXp = this.stats.dayDate === today ? this.stats.dayXp || 0 : 0;
    const goal = Math.max(50, this.settings.dailyGoal);
    const xp = this.stats.xp || 0;
    // Level curve: each level costs progressively more XP (level n starts at 60n²).
    const level = 1 + Math.floor(Math.sqrt(xp / 60));
    const lvBase = 60 * (level - 1) * (level - 1);
    const lvNext = 60 * level * level;

    return {
      due,
      learned,
      newCount: ids.length - seen,
      streak: this.stats.streak || 0,
      xp,
      level,
      lvBase,
      lvNext,
      lvPct: Math.min(100, Math.round(((xp - lvBase) / (lvNext - lvBase)) * 100)),
      dayXp,
      goal,
      goalPct: Math.min(100, Math.round((dayXp / goal) * 100)),
      sessionSize: Math.max(8, Math.min(40, this.settings.sessionSize)),
      deckLabel: `${DECK.vocab.length} từ · ${DECK.grammar.length} ngữ pháp · ${DECK.passages.length} bài đọc`,
    };
  }
}
