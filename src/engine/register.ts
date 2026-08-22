import { daysUntil } from './plan';
import type { Settings } from './types';

/**
 * The registration deadline.
 *
 * The countdown on the home screen answers "how long until the exam". That is the
 * wrong question for the next few weeks: the exam cannot be sat at all unless the
 * paperwork is in by an earlier, quieter date, and an app that only counts down to
 * exam day stays completely silent through the one window that can be missed.
 *
 * So this is a second countdown, running ahead of the first, and it gets louder as
 * the door closes instead of staying the same size all the way through.
 */

export type RegLevel =
  /** No deadline set, or it is not readable. */
  | 'off'
  /** Đã đăng ký — nhắc nữa là thừa. */
  | 'done'
  /** Còn xa. */
  | 'calm'
  /** Trong tầm nhìn. */
  | 'soon'
  /** Tuần cuối. */
  | 'urgent'
  /** Hôm nay là hạn chót. */
  | 'last'
  /** Đã quá hạn mà chưa đăng ký. */
  | 'missed';

export interface RegStatus {
  level: RegLevel;
  /** Whole days to the deadline. 0 is today; negative once it has passed. */
  daysLeft: number;
  /** Whole days to the exam itself. */
  examDaysLeft: number;
  title: string;
  detail: string;
  /**
   * Deadline is on or after exam day, so at least one of the two is wrong.
   *
   * Worth saying out loud rather than silently ignoring: the usual cause is moving the
   * exam date to a later session and forgetting that the deadline moved with it.
   */
  inconsistent: boolean;
}

/** Còn hơn ngần này ngày thì chỉ là một dòng nhỏ. */
export const CALM_FROM = 30;
/** Từ đây trở đi là tuần cuối, hiện màu báo động. */
export const URGENT_FROM = 7;

const dmy = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

const plural = (n: number): string => (n === 1 ? 'chỉ còn ngày mai' : `còn ${n} ngày`);

/**
 * Where the registration window stands today.
 *
 * Pure: everything comes from the two dates in settings plus the clock, so the banner
 * cannot drift out of step with the countdown next to it.
 */
export function regStatus(settings: Settings): RegStatus {
  const examDaysLeft = daysUntil(settings.examDate);
  const raw = (settings.regDate ?? '').trim();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw + 'T00:00:00'));
  const daysLeft = valid ? daysUntil(raw) : 0;
  const inconsistent = valid && daysLeft >= examDaysLeft && examDaysLeft >= 0;
  const base = { daysLeft, examDaysLeft, inconsistent };

  if (!valid) {
    return { ...base, level: 'off', title: '', detail: '' };
  }

  if (settings.registered) {
    return {
      ...base,
      level: 'done',
      title: '✅ Đã đăng ký thi HSK 4',
      detail:
        examDaysLeft >= 0
          ? `Hồ sơ xong. Còn ${examDaysLeft} ngày tới ngày thi ${dmy(settings.examDate)} — từ giờ chỉ còn việc học.`
          : 'Kỳ thi đã qua. Đặt ngày thi mới trong Cài đặt để bắt đầu lượt đếm ngược tiếp theo.',
    };
  }

  if (daysLeft < 0) {
    return {
      ...base,
      level: 'missed',
      title: `⛔ Hạn đăng ký ${dmy(raw)} đã qua ${-daysLeft} ngày`,
      detail:
        'Nếu bạn đã nộp hồ sơ rồi thì bấm "Tôi đã đăng ký" để tắt nhắc. Nếu chưa, kỳ này không vào được nữa — mở Cài đặt, đặt ngày thi và hạn đăng ký của đợt kế tiếp, lộ trình sẽ tự tính lại.',
    };
  }

  if (daysLeft === 0) {
    return {
      ...base,
      level: 'last',
      title: '🚨 HÔM NAY là hạn chót đăng ký thi HSK 4',
      detail: `Nộp hồ sơ trong hôm nay, trước khi cổng đóng. Hết hôm nay thì ngày thi ${dmy(settings.examDate)} không còn là của bạn nữa.`,
    };
  }

  if (daysLeft <= URGENT_FROM) {
    return {
      ...base,
      level: 'urgent',
      title: `🚨 Hạn đăng ký ${dmy(raw)} — ${plural(daysLeft)}`,
      detail:
        'Tuần cuối rồi. Đăng ký trước đi rồi học tiếp — việc này mất mười lăm phút và không làm lại được sau ngày đó.',
    };
  }

  if (daysLeft <= CALM_FROM) {
    return {
      ...base,
      level: 'soon',
      title: `⏳ Hạn đăng ký ${dmy(raw)} — còn ${daysLeft} ngày`,
      detail: `Đăng ký sớm còn chọn được ca thi. Tải lời nhắc vào lịch điện thoại để không phụ thuộc vào việc hôm đó bạn có mở app hay không.`,
    };
  }

  return {
    ...base,
    level: 'calm',
    title: `📌 Hạn đăng ký ${dmy(raw)} — còn ${daysLeft} ngày`,
    detail: 'Chưa gấp, nhưng nên hẹn vào lịch ngay bây giờ.',
  };
}

/* --- Lời nhắc mang ra khỏi app ------------------------------------------------ */

/**
 * Escaping per RFC 5545 §3.3.11: backslash first, or it re-escapes what follows.
 */
export const escIcsText = (s: string): string =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/**
 * Content lines fold at 75 octets, and the split must not land inside a UTF-8
 * character — Vietnamese and the emoji in these summaries are multi-byte, so folding
 * by string index would hand the calendar app a broken file.
 */
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  // Octets already committed to the line being built. Continuation lines start at 1
  // because each carries a leading space that counts against the same 75.
  let n = 0;
  for (const ch of line) {
    const w = enc.encode(ch).length;
    if (n + w > 75) {
      out.push(cur);
      cur = '';
      n = 1;
    }
    cur += ch;
    n += w;
  }
  out.push(cur);
  return out.join('\r\n ');
}

const stampOf = (ms: number): string => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, '');

/** `2026-10-11` + `09:00` → `20261011T090000`, floating local time. */
const local = (iso: string, hhmm: string): string =>
  iso.replace(/-/g, '') + 'T' + hhmm.replace(':', '') + '00';

export interface IcsEvent {
  uid: string;
  start: string;
  end: string;
  summary: string;
  description: string;
  /** RFC 5545 durations, negative = before the event. */
  alarms: string[];
}

/**
 * The two events, as data, so the tests can read them without parsing text.
 *
 * Times are **floating local** (no `Z`, no `TZID`): the deadline is a local-calendar
 * fact, and a phone that travels should still ring at nine in the morning wherever it
 * is rather than at whatever hour the original timezone maps to.
 */
export function regEvents(settings: Settings): IcsEvent[] {
  const reg = settings.regDate;
  const exam = settings.examDate;
  return [
    {
      uid: `hskq-reg-${reg}@hsk-quest`,
      start: local(reg, '09:00'),
      end: local(reg, '10:00'),
      summary: '⚠️ HẠN CHÓT đăng ký thi HSK 4',
      description: `Hôm nay là ngày cuối nộp hồ sơ cho kỳ thi HSK 4 ngày ${dmy(exam)}. Đăng ký tại chinesetest.cn hoặc trực tiếp ở điểm thi.`,
      // Bốn mốc, không phải một: một lời nhắc duy nhất đúng ngày hết hạn là lời nhắc
      // đến sau khi bạn đã bận cả ngày. Hai tuần để chuẩn bị giấy tờ, một tuần để
      // đặt lịch, hai ngày để làm, và một tiếng trước để chốt.
      alarms: ['-P14D', '-P7D', '-P2D', '-PT1H'],
    },
    {
      uid: `hskq-exam-${exam}@hsk-quest`,
      start: local(exam, '08:00'),
      end: local(exam, '11:00'),
      summary: '📝 Ngày thi HSK 4',
      description: 'Mang CCCD và giấy báo dự thi. Có mặt trước giờ thi 30 phút.',
      alarms: ['-P1D', '-PT12H'],
    },
  ];
}

/**
 * A calendar file for the deadline.
 *
 * The app can only remind you on a day you happen to open it, which is exactly the
 * assumption that fails for a once-a-year date. Handing the reminder to the phone's
 * own calendar is the only version of this feature that still works if the app is
 * never opened again — or if the browser storage holding these settings is cleared.
 *
 * `stamp` is passed in rather than read from the clock so the output is testable.
 */
export function regIcs(settings: Settings, stamp: number): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HSK Quest//Nhac dang ky HSK 4//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const e of regEvents(settings)) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${stampOf(stamp)}`,
      `DTSTART:${e.start}`,
      `DTEND:${e.end}`,
      `SUMMARY:${escIcsText(e.summary)}`,
      `DESCRIPTION:${escIcsText(e.description)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
    );
    for (const t of e.alarms) {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `TRIGGER:${t}`,
        `DESCRIPTION:${escIcsText(e.summary)}`,
        'END:VALARM',
      );
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
