import { DECK, DEFAULT_OFF_TOPICS, type Vocab } from '../data';
import { OOPS, PRAISE } from '../theme';
import { Audio } from './audio';
import { DICT_PASS, diffChars } from './diff';
import { hanOnly } from './segment';
import { arcadeForKey, arcadeXp, saveBest, type ArcadeId } from './arcade';
import { gameForKey } from './games';
import { AWARDS, awardStates, kindRightOf, studyDays, type AwardCtx, type AwardState } from './awards';
import {
  CHEST_COST,
  DEFAULT_META,
  PETS,
  addCoins,
  coinsForXp,
  loadMeta,
  openChest,
  saveMeta,
  type Meta,
} from './meta';
import { ALL_DONE_BONUS, questCtx, questStates, type QuestState } from './quests';
import { LOCKED_UNTIL_CLEAR, dayPlan, newPerDayFor, type DayPlan } from './plan';
import { ttsFor } from './questions';
import { buildSession, endlessBatch, nextFinale, pools, topicsOf, type TopicSel } from './session';
import {
  DEFAULT_STATS,
  KEYS,
  appendLog,
  gradeId,
  isLeech,
  isSlow,
  laneId,
  load,
  loadLog,
  loadRaw,
  migrateSrs,
  migrateVoiceRate,
  newBudget,
  nextEntry,
  save,
  saveRaw,
  seedRecallLanes,
  type SrsMap,
} from './storage';
import {
  DEFAULT_SETTINGS,
  isChoiceQ,
  isTileQ,
  isTypeQ,
  type GameId,
  type GameState,
  type Kind,
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
  boost: false,
  coinsWon: 0,
  reward: null,
  metaVer: 0,
  arcade: null,
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
  meta: Meta = DEFAULT_META;
  topics: string[] = [];
  sel: TopicSel = {};

  private listeners = new Set<() => void>();
  /** When the current question first appeared — the clock behind the slow/fast split. */
  private shownAt = 0;
  private tfInt: ReturnType<typeof setInterval> | undefined;
  private tfNext: ReturnType<typeof setTimeout> | undefined;
  private flashT: ReturnType<typeof setTimeout> | undefined;
  /** Set by the quiz screen so `type`/`dict` questions can focus the input. */
  focusInput: (() => void) | undefined;
  /** Set by the song player: sings one lyric line and stops. */
  playLine: ((from: number, to: number, rate?: number) => void) | undefined;
  /** Set by the song player: stops playback entirely. */
  stopSong: (() => void) | undefined;
  /** A line asked for before the screen attached its player. */
  private pendingLine: [number, number, number] | null = null;
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
    this.settings = migrateVoiceRate({ ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) });
    this.audio.rate = this.settings.voiceRate;
    this.stats = { ...DEFAULT_STATS, ...load(KEYS.stats, {}) };
    this.meta = loadMeta();
    this.srs = seedRecallLanes(migrateSrs(load<SrsMap>(KEYS.srs, {})));
    this.topics = topicsOf();

    // Topics default to on; a saved choice wins where it has one. Spreading in
    // that order is what makes topics added after a player's last visit show up
    // — with a plain `saved ??` they would be missing keys, i.e. silently off.
    // The exception is the HSK 1–2 base, which is bundled for completeness rather
    // than for drilling and would otherwise eat the daily new-word budget.
    const off = new Set(DEFAULT_OFF_TOPICS);
    const saved = load<TopicSel | null>(KEYS.topics, null);
    this.sel = { ...Object.fromEntries(this.topics.map((t) => [t, !off.has(t)])), ...saved };

    this.setState({ ready: true, muted: loadRaw(KEYS.muted) === '1' });
    this.audio.muted = this.state.muted;
  }

  dispose(): void {
    this.clearTimers();
    this.audio.hush();
    this.audio.destroy();
  }

  setSettings(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    this.audio.rate = this.settings.voiceRate;
    save(KEYS.settings, this.settings);
    this.setState({});
  }

  /** Everything that makes noise or ticks: speech, the song, and the timers. */
  private hushAll(): void {
    this.audio.hush();
    this.stopSong?.();
    this.clearTimers();
  }

  private clearTimers(): void {
    clearInterval(this.tfInt);
    clearTimeout(this.tfNext);
    clearTimeout(this.flashT);
  }

  // -- navigation -----------------------------------------------------------

  cur = (): Question | undefined => this.state.session[this.state.qi];

  goHome = (): void => {
    this.hushAll();
    this.setState({ mode: 'home', bookWord: null });
  };

  openBook = (): void => this.setState({ mode: 'book', bookWord: null });

  openExam = (): void => {
    this.hushAll();
    this.setState({ mode: 'exam' });
  };

  openStats = (): void => {
    this.hushAll();
    this.setState({ mode: 'stats' });
  };
  closeBookWord = (): void => this.setState({ bookWord: null });

  bookPick = (w: Vocab): void => {
    this.setState({ bookWord: w });
    this.audio.speak(w.h);
  };

  quit = (): void => {
    this.hushAll();
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

  /** Narrow to exactly `only` — the one-tap way to drill a single batch of words. */
  selOnly = (only: readonly string[]): void => {
    const wanted = new Set(only);
    this.topics.forEach((t) => (this.sel[t] = wanted.has(t)));
    this.saveTopics();
  };

  toggleTopic = (t: string): void => {
    this.sel[t] = !this.sel[t];
    this.saveTopics();
  };

  pools = () => pools(this.sel);

  // -- session --------------------------------------------------------------

  startSession = (): void => this.startGame('mix');

  /** Today's study plan, rebuilt from the log on every read so it is never stale. */
  plan = (): DayPlan => {
    const p = this.progress();
    return dayPlan({
      settings: this.settings,
      log: loadLog(),
      due: p.due,
      unseen: p.newCount,
      leeches: p.leeches,
      newToday: p.newPerDay - p.newLeft,
    });
  };

  /** Whether a mode is being held back until today's required work is done. */
  isLocked = (g: GameId): boolean => LOCKED_UNTIL_CLEAR.includes(g) && !this.plan().clear;

  startGame = (g: GameId): void => {
    // No lock check here on purpose: locking is a choice made where the user picks a
    // mode (the home screen and the keyboard), not a property of starting a session.
    // The plan owns the pace: it works out how fast the deck has to be covered, then
    // tapers that to nothing in the final week. The session builder needs the number
    // that comes out of both steps, not the raw setting.
    const plan = this.plan();
    const perDay = newPerDayFor(plan.phase.id, plan.pace.base);
    const session = buildSession(g, this.sel, this.srs, { ...this.settings, newPerDay: perDay });
    if (!session.length) return;
    // Bùa XP tiêu ngay lúc mở phiên, không đợi tới lúc chấm: người chơi phải thấy nó
    // đang bật trong suốt phiên thì mới có cảm giác đang tiêu một thứ đáng giá.
    const boost = this.meta.boost > 0;
    if (boost) {
      this.meta = { ...this.meta, boost: this.meta.boost - 1 };
      saveMeta(this.meta);
    }
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
        boost,
        coinsWon: 0,
        reward: null,
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
    this.shownAt = Date.now();
    const auto = this.settings.autoPlayAudio;

    if (q.kind === 'song') {
      // The real song is sung by its video — TTS must never talk over it. Chants have
      // no audio of their own, so those get read with a pause at the blank.
      if (q.yt) {
        this.audio.hush();
        this.singLine(q);
      } else {
        this.audio.speak(q.line.cn.split(q.line.blank).join('……'));
      }
      return;
    }
    // Bài nghe thì luôn phát, bất kể cài đặt tự phát: không nghe thì không có đề.
    if (q.kind === 'a2h' || q.kind === 'dict' || q.kind === 'tf') {
      this.audio.speak(q.kind === 'tf' ? q.w.h : q.word.h);
    } else if (q.kind === 'sdict' || q.kind === 'num') {
      this.audio.speak(ttsFor(q));
    } else if (auto && (q.kind === 'h2m' || q.kind === 'write' || q.kind === 'type')) {
      this.audio.speak(q.word.h);
    } else {
      this.audio.hush();
    }

    if (q.kind === 'type' || q.kind === 'dict' || q.kind === 'sdict') {
      setTimeout(() => this.focusInput?.(), 80);
    }

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
    let thawed = false;
    if (s.last !== today) {
      const yesterday = new Date(Date.now() - 864e5).toDateString();
      const twoDaysAgo = new Date(Date.now() - 2 * 864e5).toDateString();
      if (s.last === yesterday) {
        s.streak = (s.streak || 0) + 1;
      } else if (s.last === twoDaysAgo && this.meta.freezes > 0) {
        // Nghỉ đúng một ngày và còn băng: chuỗi được cứu. Chỉ cứu một ngày — nghỉ
        // hai ngày liền thì đó không còn là lỡ nữa.
        this.meta = { ...this.meta, freezes: this.meta.freezes - 1 };
        s.streak = (s.streak || 0) + 1;
        thawed = true;
      } else {
        s.streak = 1;
      }
      s.last = today;
    }
    if (s.dayDate !== today) {
      s.dayDate = today;
      s.dayXp = 0;
    }
    s.dayXp += this.state.sessionXp;
    s.xp = (s.xp || 0) + this.state.sessionXp;
    save(KEYS.stats, s);

    const coins = coinsForXp(this.state.sessionXp);
    const games = this.meta.games.includes(this.state.game)
      ? this.meta.games
      : [...this.meta.games, this.state.game];
    this.meta = addCoins({ ...this.meta, day: today, games }, coins);
    saveMeta(this.meta);

    this.hushAll();
    this.setState({
      mode: 'result',
      coinsWon: coins,
      metaVer: this.state.metaVer + 1,
      fbMsg: thawed ? '🧊 Một viên băng vừa tan ra để giữ chuỗi ngày của bạn!' : this.state.fbMsg,
    });
    setTimeout(() => this.burst(120), 200);
  }

  // -- trò chơi -------------------------------------------------------------

  openArcade = (id: ArcadeId): void => {
    this.hushAll();
    this.setState({ mode: 'arcade', arcade: id });
  };

  /**
   * Một lượt trả lời trong trò chơi.
   *
   * Chấm SRS như mọi chế độ khác — bốn lựa chọn và vài giây suy nghĩ là một bằng
   * chứng thật. Riêng lượt hết giờ (`timeout`) chỉ ghi nhật ký chứ không tụt hộp:
   * chữ rơi mất vì bạn còn đang nhìn chỗ khác thì đó là lỗi phản xạ, không phải
   * bằng chứng rằng bạn quên từ.
   */
  arcadeAnswer = (word: Vocab, ok: boolean, ms: number, kind: Kind, timeout = false): void => {
    const id = 'w:' + word.h;
    if (timeout) {
      appendLog([[Date.now(), gradeId(id, kind), kind, 0, ms]]);
    } else {
      this.grade(id, ok, kind, ms);
    }
    if (ok) this.audio.right(1);
    else this.audio.wrong();
  };

  /** Hết ván: cộng XP, cộng vàng, ghi kỷ lục. */
  arcadeFinish = (id: ArcadeId, score: number): { xp: number; coins: number; record: boolean } => {
    const xp = arcadeXp(score);
    const record = saveBest(id, score);
    const s = this.stats;
    const today = new Date().toDateString();
    if (s.dayDate !== today) {
      s.dayDate = today;
      s.dayXp = 0;
    }
    s.dayXp += xp;
    s.xp = (s.xp || 0) + xp;
    save(KEYS.stats, s);

    const coins = coinsForXp(xp);
    this.meta = addCoins({ ...this.meta, day: today }, coins);
    saveMeta(this.meta);
    if (record) this.burst(120);
    this.setState({ metaVer: this.state.metaVer + 1 });
    return { xp, coins, record };
  };

  // -- vàng, rương, nhiệm vụ ------------------------------------------------

  /** Ba nhiệm vụ của hôm nay, kèm tiến độ đọc thẳng từ nhật ký. */
  quests = (): QuestState[] => {
    const today = new Date().toDateString();
    const dayXp = this.stats.dayDate === today ? this.stats.dayXp || 0 : 0;
    const ctx = questCtx(loadLog(), this.meta, dayXp);
    return questStates(today, ctx, this.meta.claimed);
  };

  /** Nhận thưởng một nhiệm vụ đã xong. Xong cả ba thì được thêm một rương. */
  claimQuest = (id: string): void => {
    const states = this.quests();
    const hit = states.find((q) => q.quest.id === id);
    if (!hit || !hit.done || hit.claimed) return;
    let m = addCoins({ ...this.meta, claimed: [...this.meta.claimed, id] }, hit.quest.coins);
    const allDone = states.every((q) => q.done) && !m.bonusTaken;
    if (allDone) {
      m = addCoins({ ...m, bonusTaken: true, chests: m.chests + 1 }, ALL_DONE_BONUS);
    }
    this.meta = m;
    saveMeta(m);
    this.audio.tone(880, 0, 0.14, 'triangle', 0.14);
    this.audio.tone(1320, 0.1, 0.18, 'triangle', 0.12);
    this.burst(allDone ? 90 : 30);
    this.setState({ metaVer: this.state.metaVer + 1 });
  };

  /** Đổi vàng lấy một rương. */
  buyChest = (): void => {
    if (this.meta.coins < CHEST_COST) return;
    this.meta = { ...this.meta, coins: this.meta.coins - CHEST_COST, chests: this.meta.chests + 1 };
    saveMeta(this.meta);
    this.audio.pick();
    this.setState({ metaVer: this.state.metaVer + 1 });
  };

  /** Mở một rương và mở hộp thoại khoe phần thưởng. */
  openChest = (): void => {
    if (this.meta.chests <= 0) return;
    const { meta, reward } = openChest(this.meta);
    this.meta = meta;
    saveMeta(meta);
    this.audio.finale();
    this.burst(reward.kind === 'pet' ? 120 : 60);
    this.setState({ reward, metaVer: this.state.metaVer + 1 });
  };

  closeReward = (): void => this.setState({ reward: null });

  /** Huy hiệu, tính lại từ nhật ký mỗi lần đọc nên không bao giờ cũ. */
  awards = (): AwardState[] => {
    const log = loadLog();
    const p = this.progress();
    const exam = load<{ best?: Record<string, number> }>(KEYS.exam, {});
    const examBest = Math.max(0, ...Object.values(exam.best ?? {}), 0);
    const ctx: AwardCtx = {
      xp: p.xp,
      level: p.level,
      streak: p.streak,
      learned: p.learned,
      answers: log.length,
      right: log.filter((r) => r[3] === 1).length,
      bestEndless: this.bestEndless(),
      bestCombo: this.meta.bestCombo,
      pets: this.meta.pets.length,
      chestsOpened: this.meta.opened,
      coinsEarned: this.meta.earned,
      kindRight: kindRightOf(log),
      examBest,
      days: studyDays(log),
    };
    return awardStates(ctx);
  };

  /** Bao nhiêu huy hiệu đã đạt trên tổng số. */
  awardCount = (): [number, number] => [this.awards().filter((a) => a.done).length, AWARDS.length];

  /** Linh thú đang sở hữu, theo thứ tự trong bộ sưu tập. */
  petsOwned = () => PETS.filter((p) => this.meta.pets.includes(p.id));

  // -- answering ------------------------------------------------------------

  /** How long the current question has been on screen. */
  private elapsed = (): number => Math.max(0, Date.now() - this.shownAt);

  /**
   * Grades one answer against the lane its kind belongs to, and logs it.
   *
   * A correct-but-slow answer still promotes the box but buys a shorter interval —
   * hesitating is the shape of knowledge that is about to be lost.
   */
  private grade(id: string, ok: boolean, kind: Kind, ms: number): void {
    const key = gradeId(id, kind);
    this.srs[key] = nextEntry(this.srs[key], ok, isSlow(kind, ms));
    save(KEYS.srs, this.srs);
    appendLog([[Date.now(), key, kind, ok ? 1 : 0, ms]]);
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

  /**
   * Attaches the song player. The first question of a song session is shown before
   * the screen has mounted, so whatever it asked for is flushed here — otherwise the
   * song opens on silence and only starts working from the second line.
   */
  attachPlayer(
    playLine: (from: number, to: number, rate?: number) => void,
    stopSong: () => void,
  ): void {
    this.playLine = playLine;
    this.stopSong = stopSong;
    const pending = this.pendingLine;
    this.pendingLine = null;
    if (pending) playLine(...pending);
  }

  detachPlayer(): void {
    this.playLine = undefined;
    this.stopSong = undefined;
    this.pendingLine = null;
  }

  /**
   * Sings the line this question is about, then stops. Safe to call before either the
   * screen or the YouTube player is ready — the request is held until it can run.
   */
  private singLine(q: Question, rate = 1): void {
    if (q.kind !== 'song' || !q.yt || q.line.t === undefined || q.line.end === undefined) return;
    if (!this.playLine) {
      this.pendingLine = [q.line.t, q.line.end, rate];
      return;
    }
    this.playLine(q.line.t, q.line.end, rate);
  }

  /** The 🔊 button: hear the prompt again. */
  playPrompt = (): void => {
    const q = this.cur();
    if (!q) return;
    // For the real song, "listen again" means the singer, not a robot reading over her.
    if (q.kind === 'song' && q.yt) this.singLine(q);
    else this.audio.speak(ttsFor(q));
  };

  /** Replay the sung line slowly — the trick every song-teaching channel leans on. */
  playSlow = (): void => {
    const q = this.cur();
    if (q) this.singLine(q, 0.75);
  };

  /** True when the current question is a line of the real song. */
  isSungLine(): boolean {
    const q = this.cur();
    return q?.kind === 'song' && !!q.yt && q.line.t !== undefined;
  }

  /** Whether the current answer is complete enough to check. */
  canCheck(): boolean {
    const q = this.cur();
    const st = this.state;
    if (!q) return false;
    if (isTileQ(q)) return st.typed.length > 0;
    if (isTypeQ(q)) return st.typedText.trim().length > 0;
    return st.sel >= 0;
  }

  check = (): void => {
    const q = this.cur();
    const st = this.state;
    // Match and lightning grade themselves as you answer.
    if (!q || q.kind === 'match' || q.kind === 'tf' || st.checked) return;

    let ok: boolean;
    /** Điểm chép chính tả, 0–1 — chỉ câu `sdict` mới có. */
    let part: number | undefined;
    if (isTileQ(q)) {
      if (!st.typed.length) return;
      ok = st.typed.join('') === q.ansStr;
    } else if (q.kind === 'sdict') {
      if (!st.typedText.trim()) return;
      // Chép chính tả chấm theo tỉ lệ chữ đúng: sai một chữ trong câu chín chữ không
      // phải là "không nghe được gì", và chấm nó thành 0 thì lần sau chẳng ai dám gõ dài.
      part = diffChars(hanOnly(st.typedText), q.sent).score;
      ok = part >= DICT_PASS;
    } else if (q.kind === 'type' || q.kind === 'dict') {
      if (!st.typedText.trim()) return;
      ok = st.typedText.trim() === q.word.h;
    } else if (isChoiceQ(q)) {
      if (st.sel < 0) return;
      ok = st.sel === q.ans;
    } else {
      return;
    }

    const ms = this.elapsed();
    if (!q.re && q.id) this.grade(q.id, ok, q.kind, ms);

    const combo = ok ? st.combo + 1 : 0;
    let gain = ok ? (q.re ? 5 : 10) + Math.min(combo, 6) : 0;
    let bonusMsg = '';
    // Gần đúng vẫn được công: chép trúng 7/9 chữ thì mất điểm SRS nhưng vẫn có XP.
    if (part !== undefined) {
      if (!ok && part >= 0.5) gain = Math.round(6 * part);
      bonusMsg = `✍️ ${Math.round(part * 100)}% số chữ · `;
    }
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

    if (st.boost) gain *= 2;
    if (combo > this.meta.maxCombo) this.meta = { ...this.meta, maxCombo: combo };
    if (combo > this.meta.bestCombo) this.meta = { ...this.meta, bestCombo: combo };

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

    // Two options on a six-second clock is a coin flip dressed as a question, so the
    // lightning round never moves an SRS box. It is still logged: the stats screen
    // wants to know which words go wrong under time pressure.
    if (q.id && !timeout) {
      appendLog([[Date.now(), gradeId(q.id, 'tf'), 'tf', ok ? 1 : 0, this.elapsed()]]);
    }

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
    // One board is one sitting, so every pair on it shares the board's elapsed time.
    const ms = Math.round(this.elapsed() / Math.max(1, q.pairs.length));
    q.pairs.forEach((w) => {
      const ok = !st.mWrong[w.h];
      this.grade('w:' + w.h, ok, 'match', ms);
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

    if (mode === 'book' || mode === 'stats') {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        if (this.state.bookWord) this.closeBookWord();
        else this.setState({ mode: 'home' });
      }
      return;
    }
    // The exam owns its own keyboard: a stray Escape must not end a timed paper.
    if (mode === 'exam') return;

    if ((mode === 'home' || mode === 'result') && e.key === 'Enter') {
      // Without this, a button left focused by an earlier click also fires its own
      // click on Enter — starting a session and then acting again on top of it.
      e.preventDefault();
      // From the result screen, Enter replays the mode just played.
      return mode === 'result' ? this.startGame(this.state.game) : this.startSession();
    }

    if (mode === 'home') {
      const arc = arcadeForKey(e.key);
      if (arc) return this.openArcade(arc);
      // Shortcuts live on the cards themselves, so this can never disagree with the
      // key printed on the button. Endless keeps its own — it sits above the grid.
      const g = e.key.toLowerCase() === 's' ? 'endless' : gameForKey(e.key);
      // A shortcut must not be a way around the day's plan — the grid greys these out.
      if (g && !this.isLocked(g)) return this.startGame(g);
    }

    // Bàn phím trong trò chơi là của chính trò đó (mũi tên lái rắn, số bắt chữ),
    // nên ở đây chỉ giữ đúng một phím: thoát.
    if (mode === 'arcade') return;

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
    let due = 0;
    let learned = 0;
    let newCount = 0;
    let leeches = 0;

    // A word is only "learned" once both lanes are mature — being able to read 通过
    // while still unable to write it is half a word, and the counter should say so.
    P.vocab.forEach((v) => {
      const rec = this.srs[laneId('w:' + v.h, 'recog')];
      const rcl = this.srs[laneId('w:' + v.h, 'recall')];
      if (!rec && !rcl) newCount++;
      // One word never contributes more than one to the due count, however many of
      // its lanes are ready — the number has to mean "words to review".
      if ((rec && rec.due <= now) || (rcl && rcl.due <= now)) due++;
      if ((rec?.box ?? 0) >= 3 && (rcl?.box ?? 0) >= 3) learned++;
      if (isLeech(rec) || isLeech(rcl)) leeches++;
    });

    const others = [
      ...P.grammar.map((g) => g.id),
      ...P.sentences.map((s) => s.id),
      ...P.passages.map((p) => p.id),
      ...P.orders.map((o) => o.id),
    ];
    others.forEach((id) => {
      const e = this.srs[id];
      if (!e) return newCount++;
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
      newCount,
      leeches,
      newLeft: newBudget(Math.max(3, Math.min(40, this.settings.newPerDay))),
      newPerDay: Math.max(3, Math.min(40, this.settings.newPerDay)),
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
