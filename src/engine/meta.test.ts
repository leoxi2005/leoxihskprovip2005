import { describe, expect, it } from 'vitest';
import { awardStates, kindRightOf, AWARDS, type AwardCtx } from './awards';
import { CHEST_COST, DEFAULT_META, PETS, addCoins, coinsForXp, openChest, type Meta } from './meta';
import { ALL_DONE_BONUS, QUESTS, questCtx, questStates, questsFor } from './quests';
import type { LogRow } from './storage';

const meta = (patch: Partial<Meta> = {}): Meta => ({ ...DEFAULT_META, ...patch });

const row = (kind: LogRow[2], ok: 0 | 1, at = Date.now()): LogRow => [at, 'w:x', kind, ok, 3000];

describe('nhiệm vụ hằng ngày', () => {
  it('mỗi ngày ra đúng ba nhiệm vụ khác nhau', () => {
    for (let d = 0; d < 400; d++) {
      const day = new Date(2026, 0, 1 + d).toDateString();
      const qs = questsFor(day);
      expect(qs, day).toHaveLength(3);
      expect(new Set(qs.map((q) => q.id)).size, day).toBe(3);
    }
  });

  it('cùng một ngày luôn ra cùng một bộ — F5 không đổi được đề', () => {
    const day = new Date(2026, 7, 21).toDateString();
    expect(questsFor(day).map((q) => q.id)).toEqual(questsFor(day).map((q) => q.id));
  });

  it('bộ nhiệm vụ đổi theo ngày chứ không đứng yên', () => {
    const a = questsFor(new Date(2026, 7, 21).toDateString()).map((q) => q.id);
    const b = questsFor(new Date(2026, 7, 22).toDateString()).map((q) => q.id);
    expect(a).not.toEqual(b);
  });

  it('cả kho nhiệm vụ đều có ngày được gọi tới', () => {
    const seen = new Set<string>();
    for (let d = 0; d < 60; d++) {
      questsFor(new Date(2026, 0, 1 + d).toDateString()).forEach((q) => seen.add(q.id));
    }
    expect(seen.size).toBe(QUESTS.length);
  });

  it('đo tiến độ từ chính nhật ký, và chỉ đếm câu đúng', () => {
    const log: LogRow[] = [row('sdict', 1), row('sdict', 1), row('sdict', 0), row('a2h', 1)];
    const ctx = questCtx(log, { maxCombo: 4, games: ['sdict'] }, 120);
    const sdict = QUESTS.find((q) => q.id === 'q:sdict')!;
    expect(sdict.measure(ctx)).toBe(2);
    const listen = QUESTS.find((q) => q.id === 'q:listen')!;
    // Chép chính tả cũng là một dạng nghe, nên nó tính vào cả hai.
    expect(listen.measure(ctx)).toBe(3);
  });

  it('không nhận thưởng được khi chưa xong, và tiến độ không vượt quá đích', () => {
    const day = new Date(2026, 7, 21).toDateString();
    const rows: LogRow[] = Array.from({ length: 200 }, () => row('m2h', 1));
    const states = questStates(day, questCtx(rows, { maxCombo: 0, games: [] }, 0), []);
    for (const s of states) {
      expect(s.at).toBeLessThanOrEqual(s.quest.goal);
      expect(s.claimed).toBe(false);
    }
  });

  it('phần thưởng xong-cả-ba là một con số dương', () => {
    expect(ALL_DONE_BONUS).toBeGreaterThan(0);
  });
});

describe('vàng và rương', () => {
  it('XP đổi ra vàng, phiên nào cũng được ít nhất một đồng', () => {
    expect(coinsForXp(0)).toBe(1);
    expect(coinsForXp(240)).toBe(30);
  });

  it('cộng vàng thì tổng-đã-kiếm cũng lên theo', () => {
    const m = addCoins(meta({ coins: 10, earned: 10 }), 25);
    expect(m.coins).toBe(35);
    expect(m.earned).toBe(35);
  });

  it('tiêu vàng KHÔNG làm tổng-đã-kiếm tụt xuống', () => {
    const m = addCoins(meta({ coins: 100, earned: 100 }), -CHEST_COST);
    expect(m.coins).toBe(100 - CHEST_COST);
    expect(m.earned).toBe(100);
  });

  it('mở rương luôn trừ đúng một rương và trả về một phần thưởng', () => {
    for (let i = 0; i <= 100; i++) {
      const { meta: after, reward } = openChest(meta({ chests: 3 }), i / 100);
      expect(after.chests).toBe(2);
      expect(after.opened).toBe(1);
      expect(reward.title.length).toBeGreaterThan(0);
    }
  });

  it('không bao giờ trả về một linh thú đã có', () => {
    const owned = PETS.slice(0, 5).map((p) => p.id);
    for (let i = 0; i <= 100; i++) {
      const { reward } = openChest(meta({ chests: 1, pets: owned }), i / 100);
      if (reward.pet) expect(owned).not.toContain(reward.pet.id);
    }
  });

  it('rồng chỉ ra khi mười một con kia đã đủ', () => {
    const almost = PETS.filter((p) => p.id !== 'dragon' && p.id !== 'cat').map((p) => p.id);
    for (let i = 0; i <= 100; i++) {
      const { reward } = openChest(meta({ chests: 1, pets: almost }), i / 100);
      if (reward.pet) expect(reward.pet.id).toBe('cat');
    }
    const all = PETS.filter((p) => p.id !== 'dragon').map((p) => p.id);
    const got = Array.from({ length: 101 }, (_, i) => openChest(meta({ chests: 1, pets: all }), i / 100))
      .map((r) => r.reward.pet?.id)
      .filter(Boolean);
    expect(got).toContain('dragon');
  });

  it('đủ bộ linh thú rồi thì rương vẫn ra thứ khác chứ không hụt', () => {
    const all = PETS.map((p) => p.id);
    for (let i = 0; i <= 100; i++) {
      const { reward } = openChest(meta({ chests: 1, pets: all }), i / 100);
      expect(reward.pet).toBeUndefined();
      expect(['coins', 'freeze', 'boost']).toContain(reward.kind);
    }
  });
});

describe('huy hiệu', () => {
  const ctx = (patch: Partial<AwardCtx> = {}): AwardCtx => ({
    xp: 0,
    level: 1,
    streak: 0,
    learned: 0,
    answers: 0,
    right: 0,
    bestEndless: 0,
    bestCombo: 0,
    pets: 0,
    chestsOpened: 0,
    coinsEarned: 0,
    kindRight: new Map(),
    examBest: 0,
    days: 0,
    ...patch,
  });

  it('mã huy hiệu không trùng nhau', () => {
    expect(new Set(AWARDS.map((a) => a.id)).size).toBe(AWARDS.length);
  });

  it('mới bắt đầu thì chưa có cái nào đạt', () => {
    for (const a of awardStates(ctx({ level: 1 }))) {
      expect(a.done, a.award.id).toBe(false);
      expect(a.pct).toBeGreaterThanOrEqual(0);
      expect(a.pct).toBeLessThan(100);
    }
  });

  it('tiến độ bị chặn ở đích, không hiện 4000/800', () => {
    const s = awardStates(ctx({ learned: 4000 })).find((a) => a.award.id === 'a:learn3')!;
    expect(s.at).toBe(800);
    expect(s.pct).toBe(100);
    expect(s.done).toBe(true);
  });

  it('đếm số lượt đúng theo dạng câu từ nhật ký', () => {
    const log: LogRow[] = [row('sdict', 1), row('sdict', 0), row('num', 1), row('num', 1)];
    const m = kindRightOf(log);
    expect(m.get('sdict')).toBe(1);
    expect(m.get('num')).toBe(2);
    const s = awardStates(ctx({ kindRight: m })).find((a) => a.award.id === 'a:listen')!;
    expect(s.at).toBe(3);
  });
});
