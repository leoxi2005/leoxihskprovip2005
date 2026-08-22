import { describe, expect, it } from 'vitest';
import { CALM_FROM, URGENT_FROM, escIcsText, regEvents, regIcs, regStatus } from './register';
import { DEFAULT_REG_DATE, DEFAULT_SETTINGS, type Settings } from './types';

const iso = (offsetDays: number): string => {
  const d = new Date(Date.now() + offsetDays * 864e5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const S = (over: Partial<Settings> = {}): Settings => ({
  ...DEFAULT_SETTINGS,
  examDate: iso(60),
  regDate: iso(30),
  ...over,
});

const STAMP = Date.parse('2026-08-22T06:00:00Z');

describe('registration countdown', () => {
  it('gets louder as the window closes', () => {
    expect(regStatus(S({ regDate: iso(CALM_FROM + 1) })).level).toBe('calm');
    expect(regStatus(S({ regDate: iso(CALM_FROM) })).level).toBe('soon');
    expect(regStatus(S({ regDate: iso(URGENT_FROM + 1) })).level).toBe('soon');
    expect(regStatus(S({ regDate: iso(URGENT_FROM) })).level).toBe('urgent');
    expect(regStatus(S({ regDate: iso(1) })).level).toBe('urgent');
    expect(regStatus(S({ regDate: iso(0) })).level).toBe('last');
    expect(regStatus(S({ regDate: iso(-1) })).level).toBe('missed');
  });

  it('still counts the deadline day itself as open', () => {
    const today = regStatus(S({ regDate: iso(0) }));
    expect(today.daysLeft).toBe(0);
    expect(today.level).not.toBe('missed');
    expect(today.title).toContain('HÔM NAY');
  });

  it('goes quiet for good once registration is done', () => {
    // Kể cả ở mốc gào to nhất — một lời nhắc còn kêu sau khi việc đã xong là lời
    // nhắc mà lần sau người ta bỏ qua.
    for (const d of [CALM_FROM + 5, URGENT_FROM, 0, -3]) {
      const s = regStatus(S({ regDate: iso(d), registered: true }));
      expect(s.level).toBe('done');
      expect(s.title).not.toContain('🚨');
    }
  });

  it('hides itself rather than guessing when no deadline is set', () => {
    expect(regStatus(S({ regDate: '' })).level).toBe('off');
    expect(regStatus(S({ regDate: 'sắp tới' })).level).toBe('off');
    expect(regStatus(S({ regDate: '2026-13-45' })).level).toBe('off');
  });

  it('flags a deadline that is not before the exam', () => {
    expect(regStatus(S({ regDate: iso(70), examDate: iso(60) })).inconsistent).toBe(true);
    expect(regStatus(S({ regDate: iso(60), examDate: iso(60) })).inconsistent).toBe(true);
    expect(regStatus(S({ regDate: iso(30), examDate: iso(60) })).inconsistent).toBe(false);
  });

  it('ships the real deadline for the 07/11/2026 paper out of the box', () => {
    expect(DEFAULT_SETTINGS.regDate).toBe(DEFAULT_REG_DATE);
    expect(DEFAULT_SETTINGS.registered).toBe(false);
    expect(Date.parse(DEFAULT_SETTINGS.regDate)).toBeLessThan(Date.parse(DEFAULT_SETTINGS.examDate));
  });
});

describe('calendar file', () => {
  const ics = regIcs(S({ regDate: '2026-10-11', examDate: '2026-11-07' }), STAMP);

  it('carries both dates and a working alarm ladder', () => {
    expect(ics).toContain('DTSTART:20261011T090000');
    expect(ics).toContain('DTSTART:20261107T080000');
    // Nhắc nhiều mốc: một lời nhắc duy nhất đúng hôm hết hạn đến quá muộn để làm gì.
    for (const t of ['-P14D', '-P7D', '-P2D', '-PT1H']) expect(ics).toContain(`TRIGGER:${t}`);
    expect((ics.match(/BEGIN:VALARM/g) ?? []).length).toBe(6);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2);
  });

  it('uses floating local time so a travelling phone still rings at 9am', () => {
    // Không 'Z', không TZID: hạn nộp hồ sơ là một sự kiện của lịch địa phương.
    expect(ics).not.toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics).not.toContain('TZID');
  });

  it('is a well-formed file: CRLF, wrapped envelope, no line over 75 octets', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('folds without splitting a Vietnamese character or an emoji', () => {
    // Dòng gập ra phải ghép lại đúng chuỗi ban đầu — gập theo chỉ số chuỗi thay vì
    // theo octet sẽ cắt đôi một ký tự nhiều byte và làm hỏng cả file.
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain('⚠️ HẠN CHÓT đăng ký thi HSK 4');
    expect(unfolded).toContain('📝 Ngày thi HSK 4');
    expect(unfolded).not.toContain('�');
  });

  it('escapes the characters that would otherwise end a field early', () => {
    // Dấu phẩy và chấm phẩy đứng trần sẽ kết thúc giá trị sớm và biến phần sau thành
    // tham số rác. Backslash phải đi trước, nếu không nó escape lại chính dấu vừa thêm.
    expect(escIcsText('a,b')).toBe('a\\,b');
    expect(escIcsText('a;b')).toBe('a\\;b');
    expect(escIcsText('a\\b')).toBe('a\\\\b');
    expect(escIcsText('a\nb')).toBe('a\\nb');
    expect(escIcsText('a\\,b')).toBe('a\\\\\\,b');
  });

  it('names both events readably, and lists them in date order', () => {
    const [reg, exam] = regEvents(S({ regDate: '2026-10-11', examDate: '2026-11-07' }));
    expect(reg.start < exam.start).toBe(true);
    expect(reg.uid).not.toBe(exam.uid);
  });

  it('is deterministic, so re-downloading updates the same calendar entry', () => {
    const a = regIcs(S({ regDate: '2026-10-11', examDate: '2026-11-07' }), STAMP);
    const b = regIcs(S({ regDate: '2026-10-11', examDate: '2026-11-07' }), STAMP);
    expect(a).toBe(b);
    expect(a).toContain('UID:hskq-reg-2026-10-11@hsk-quest');
  });
});
