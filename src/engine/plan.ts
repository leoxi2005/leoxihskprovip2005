import { guideFor, partOfDay } from './exam';
import type { GameId, Kind, Settings } from './types';
import { todayByKind, startOfDay } from './stats';
import type { LogRow } from './storage';

/**
 * The countdown study plan.
 *
 * Everything here is derived from two numbers — days left and what today's log
 * already contains — so the plan is always live: skip a day and tomorrow's plan
 * rebuilds around the backlog rather than repeating yesterday's.
 */

export type PhaseId = 'build' | 'grammar' | 'papers' | 'taper' | 'done';

export interface Phase {
  id: PhaseId;
  name: string;
  /** Phase applies while `daysLeft` is at or above this. */
  from: number;
  goal: string;
}

/**
 * Four phases, sized off how the exam actually rewards preparation: vocabulary has to
 * be in place early because it needs the most repetitions to stick, papers come last
 * because they only measure what is already there, and the final week adds nothing new
 * — cramming vocabulary into the week before an exam is the one move that reliably
 * costs marks, since new words crowd the review queue at exactly the wrong moment.
 */
export const PHASES: Phase[] = [
  {
    id: 'build',
    name: 'Giai đoạn 1 — Nạp từ vựng',
    from: 50,
    goal: 'Phủ hết 600 từ HSK 4 và giữ hàng đợi ôn không phình. Từ mới mỗi ngày ở mức cao nhất.',
  },
  {
    id: 'grammar',
    name: 'Giai đoạn 2 — Ngữ pháp & đọc hiểu',
    from: 21,
    goal: 'Chuyển trọng tâm sang câu và đoạn: 把/被/比, bổ ngữ, liên từ, đọc hiểu và điền từ.',
  },
  {
    id: 'papers',
    name: 'Giai đoạn 3 — Luyện đề',
    from: 7,
    goal: 'Đề thi thử hằng tuần, bấm giờ thật, và sửa kỹ từng câu sai.',
  },
  {
    id: 'taper',
    name: 'Giai đoạn 4 — Rà soát',
    from: 0,
    goal: 'Không nạp từ mới nữa. Chỉ ôn từ đến hạn, từ khắc tinh và đọc lại đề đã sai.',
  },
];

export const phaseFor = (daysLeft: number): Phase =>
  daysLeft < 0 ? { ...PHASES[3], id: 'done', name: 'Đã qua ngày thi' } : PHASES.find((p) => daysLeft >= p.from)!;

/** Whole days from today to the exam. Negative once it has passed. */
export function daysUntil(examDate: string): number {
  const target = Date.parse(examDate + 'T00:00:00');
  if (Number.isNaN(target)) return 0;
  return Math.round((startOfDay(new Date(target)) - startOfDay(new Date())) / 864e5);
}

/** How many new words the plan wants today, which tapers as the exam approaches. */
export function newPerDayFor(phase: PhaseId, setting: number): number {
  switch (phase) {
    case 'build':
      return setting;
    case 'grammar':
      return Math.max(4, Math.round(setting * 0.6));
    case 'papers':
      return Math.max(2, Math.round(setting * 0.3));
    default:
      // Nothing new in the last week: a word met now cannot reach a stable box in time,
      // and it would push genuinely due words out of the queue.
      return 0;
  }
}

export const MIN_NEW = 3;
export const MAX_NEW = 40;

/**
 * Total new words a given base pace delivers between now and the exam.
 *
 * Not `daysLeft × base`: the plan tapers deliberately, so a pace of 12 buys nowhere
 * near 12 a day averaged over the run. Exam day itself is excluded — nobody learns
 * vocabulary on the morning of the paper.
 */
export function paceCapacity(base: number, daysLeft: number): number {
  let total = 0;
  for (let d = Math.max(0, daysLeft); d >= 1; d--) total += newPerDayFor(phaseFor(d).id, base);
  return total;
}

export interface Pace {
  /** The base pace in use today. */
  base: number;
  /** Smallest base that still covers every unseen word in time. */
  required: number;
  /** Words `base` will deliver before the exam. */
  capacity: number;
  /** False when even the maximum pace cannot cover the deck in the days left. */
  reachable: boolean;
  /** Words that will not be reached at `base`. Zero when on track. */
  shortfall: number;
}

/**
 * The smallest pace that still finishes the deck, given the taper.
 *
 * Monotonic in `base`, so a plain scan is both correct and cheap.
 */
export function requiredPace(unseen: number, daysLeft: number): number {
  for (let n = MIN_NEW; n < MAX_NEW; n++) {
    if (paceCapacity(n, daysLeft) >= unseen) return n;
  }
  return MAX_NEW;
}

export function paceFor(unseen: number, daysLeft: number, settings: Settings): Pace {
  const required = requiredPace(unseen, daysLeft);
  const base = settings.autoPace
    ? required
    : Math.max(MIN_NEW, Math.min(MAX_NEW, settings.newPerDay));
  const capacity = paceCapacity(base, daysLeft);
  return {
    base,
    required,
    capacity,
    reachable: paceCapacity(MAX_NEW, daysLeft) >= unseen,
    shortfall: Math.max(0, unseen - capacity),
  };
}

export interface PlanTask {
  id: string;
  label: string;
  /** Why it is on today's list. */
  detail: string;
  /** Which mode clears it. */
  game?: GameId;
  /** Opens the mock exam instead of a game. */
  exam?: boolean;
  target: number;
  done: number;
  /** Must be finished before the free-play modes unlock. */
  required: boolean;
}

export interface DayPlan {
  daysLeft: number;
  phase: Phase;
  tasks: PlanTask[];
  /** Required tasks all finished. */
  clear: boolean;
  /** A mock exam is scheduled for today. */
  examDay: boolean;
  pace: Pace;
  /** Roughly how many questions today's required work comes to. */
  questions: number;
}

const sum = (m: Map<Kind, number>, kinds: Kind[]): number =>
  kinds.reduce((n, k) => n + (m.get(k) ?? 0), 0);

export interface PlanInput {
  settings: Settings;
  log: LogRow[];
  /** Items due right now, across the selected topics. */
  due: number;
  /** Words never met, across the selected topics. */
  unseen: number;
  /** Words flagged as leeches. */
  leeches: number;
  /** New words already introduced today. */
  newToday: number;
}

/**
 * Today's list.
 *
 * Only the first three entries are required — a plan that demands everything every day
 * is a plan that gets abandoned in week two. The rest are offered, not enforced.
 */
export function dayPlan(input: PlanInput): DayPlan {
  const { settings, log, due, unseen, leeches, newToday } = input;
  const daysLeft = daysUntil(settings.examDate);
  const phase = phaseFor(daysLeft);
  const k = todayByKind(log);
  const pace = paceFor(unseen, daysLeft, settings);

  const newTarget = Math.min(unseen, newPerDayFor(phase.id, pace.base));
  // Two mock papers a week once the papers phase starts, one a fortnight before that.
  const examDay =
    phase.id === 'papers' ? daysLeft % 3 === 0 : phase.id === 'grammar' ? daysLeft % 7 === 0 : false;

  const tasks: PlanTask[] = [
    {
      id: 'due',
      label: 'Ôn hết từ đến hạn',
      detail:
        due > 0
          ? `${due} mục đã tới hạn. Bỏ qua hôm nay thì mai chúng dồn lại — đây là việc quan trọng nhất trong ngày.`
          : 'Không còn gì tới hạn. Hàng đợi của bạn đang sạch 🎉',
      game: 'mix',
      target: due,
      // Dựng câu và chép chính tả cũng chấm đúng từ đó ở làn tái tạo, nên chúng
      // gỡ được hàng đợi y như gõ chữ — bỏ ra ngoài là bắt học lại lần nữa.
      done: Math.min(
        due,
        sum(k, ['m2h', 'h2m', 'a2h', 'flash', 'type', 'dict', 'write', 'match', 'build', 'sdict']),
      ),
      required: true,
    },
    {
      id: 'new',
      label: newTarget > 0 ? `Học ${newTarget} từ mới` : 'Không nạp từ mới',
      detail:
        newTarget > 0
          ? `Còn ${unseen} từ chưa gặp. Ở nhịp này bạn phủ hết trước ngày thi.`
          : 'Giai đoạn này không nạp từ mới — từ học bây giờ không kịp vào trí nhớ dài hạn.',
      game: 'mix',
      target: newTarget,
      done: Math.min(newTarget, newToday),
      required: newTarget > 0,
    },
    {
      id: 'listen',
      label: 'Luyện nghe 15 câu',
      detail:
        'Nghe là phần đầu tiên của đề và chỉ được nghe một lần — nó cần luyện mỗi ngày, không phải luyện dồn.',
      game: 'listen',
      target: 15,
      done: sum(k, ['a2h', 'dict', 'sdict', 'num']),
      required: true,
    },
  ];

  if (phase.id === 'build') {
    tasks.push({
      id: 'tone',
      label: 'Thanh điệu 15 câu',
      detail: 'Sai thanh điệu là lỗi tốn điểm nhất của người Việt ở phần nghe. Sửa sớm rẻ hơn sửa muộn.',
      game: 'tone',
      target: 15,
      done: k.get('tone') ?? 0,
      required: false,
    });
  }

  if (phase.id === 'grammar' || phase.id === 'papers') {
    tasks.push({
      id: 'read',
      label: 'Ngữ pháp & đọc hiểu',
      detail: 'Đọc hiểu chiếm 40/100 câu và là phần dễ kéo điểm lên nhất khi từ vựng đã vững.',
      game: 'read',
      target: 12,
      done: sum(k, ['gram', 'sent', 'pass', 'order', 'conf', 'cloze', 'fix', 'build', 'collo']),
      required: true,
    });
    tasks.push({
      id: 'cloze',
      label: 'Điền từ vào câu',
      detail: '选词填空 là dạng đầu của phần Đọc — nó kiểm tra từ trong ngữ cảnh, không phải từ đơn lẻ.',
      game: 'cloze',
      target: 10,
      done: k.get('cloze') ?? 0,
      required: false,
    });
  }

  if (leeches > 0) {
    tasks.push({
      id: 'leech',
      label: `Gỡ ${Math.min(leeches, 10)} từ khắc tinh`,
      detail: `${leeches} từ đã sai từ 6 lần trở lên. Chúng ăn thời gian ôn nhiều hơn bất kỳ từ nào khác.`,
      game: 'leech',
      target: Math.min(leeches, 10),
      done: 0,
      required: false,
    });
  }

  // Offered every day, never required: it rotates so a week touches all eight parts,
  // and it is the way in for someone who has not sat a full paper yet.
  const part = guideFor(partOfDay(daysLeft));
  tasks.push({
    id: 'part',
    label: `Luyện ${part.vi}`,
    detail: `${part.id} — có hướng dẫn cách làm và bẫy hay dính. Mỗi ngày một phần khác nhau, một tuần là chạm hết tám phần của đề.`,
    exam: true,
    target: 1,
    done: 0,
    required: false,
  });

  if (examDay) {
    tasks.push({
      id: 'exam',
      label: 'Làm một đề thi thử',
      detail: 'Bấm giờ thật, ngồi liền 95 phút, không tra cứu. Điểm số chỉ có nghĩa khi điều kiện giống thật.',
      exam: true,
      target: 1,
      done: 0,
      required: false,
    });
  }

  return {
    daysLeft,
    phase,
    tasks,
    clear: tasks.every((t) => !t.required || t.done >= t.target),
    examDay,
    pace,
    // Only the required tasks: the optional ones are offered, not owed, and folding
    // them in would make every day look heavier than it is.
    questions: tasks.filter((t) => t.required).reduce((n, t) => n + t.target, 0),
  };
}

/**
 * Modes held back until the day's required work is done.
 *
 * These are the ones that are fun but teach least per minute — the songs, the survival
 * run, the boss fight. Every mode that actually clears the queue stays open, so the
 * lock can never stop you from studying.
 */
export const LOCKED_UNTIL_CLEAR: GameId[] = ['song', 'mysong', 'endless', 'boss'];
