/**
 * Bẫy số & giờ — phần nghe HSK 4 mất điểm nhiều nhất mà không phải vì thiếu từ.
 *
 * Ba cái bẫy được dựng thẳng vào đây:
 *  - **两 hay 二**: 2 giờ là 两点, 200 là 二百 (hoặc 两百), 12 giờ là 十二点.
 *  - **一百五 hay một trăm linh năm**: 一百五 nói miệng là 150, 105 phải là 一百零五.
 *  - **刻 và 差**: 三点三刻 = 3:45, 差五分三点 = 2:55 — con số nghe được KHÔNG phải
 *    con số cần chọn.
 *
 * Danh sách sinh ra cố định (không có `Math.random`), vì mỗi câu cần một bản thu
 * sẵn: `tools/tts/collect.mjs` phải liệt kê được đúng bằng này câu, không hơn.
 */

export type NumCat = 'time' | 'money' | 'date' | 'count' | 'age' | 'dur';

export interface NumDrill {
  id: string;
  /** Câu tiếng Trung được đọc lên. */
  say: string;
  /** Đáp án, viết bằng số cho khỏi cãi. */
  label: string;
  /** Ba đáp án nhiễu — đều là con số nghe *gần giống*. */
  bad: string[];
  cat: NumCat;
  /** Vì sao cái bẫy này bẫy được. */
  why: string;
  vi: string;
}

const DIG = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** Đọc số 0–99999 theo lối viết chuẩn (二 chứ không phải 两 — chỗ nào cần 两 thì tự thay). */
export function cnNum(n: number): string {
  if (n < 10) return DIG[n];
  if (n < 20) return n === 10 ? '十' : '十' + DIG[n % 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return DIG[t] + '十' + (r ? DIG[r] : '');
  }
  for (const [unit, name] of [
    [10000, '万'],
    [1000, '千'],
    [100, '百'],
  ] as const) {
    if (n >= unit) {
      const head = Math.floor(n / unit);
      const rest = n % unit;
      const h = cnNum(head) + name;
      if (!rest) return h;
      // 105 → 一百零五, 1005 → 一千零五: một chữ 零 cho mọi bậc bị khuyết.
      return h + (rest < unit / 10 ? '零' : '') + cnNum(rest);
    }
  }
  return String(n);
}

/**
 * Cách người ta thật sự đọc số ra miệng: 二万四千 nghe rất sách vở, nói là 两万四千.
 *
 * 二 đứng ngay trước một bậc lớn (百 · 千 · 万) thì đổi thành 两 — trừ hàng chục,
 * nơi 二十 luôn là 二十.
 */
export const spoken = (s: string): string => s.replace(/^二(?=[百千万])/, '两');

/** Giờ đồng hồ: 2 giờ luôn là 两点, không bao giờ là 二点. */
const cnHour = (h: number): string => (h === 2 ? '两' : cnNum(h)) + '点';

const hhmm = (h: number, m: number): string => `${h}:${String(m).padStart(2, '0')}`;

/** Xoay giờ về khoảng 1–12. */
const wrap12 = (h: number): number => ((h + 11) % 12) + 1;

const TIME_FORMS = [
  { m: 0, say: (h: number) => cnHour(h), why: 'Giờ tròn — 2 giờ đọc là 两点, không phải 二点.' },
  { m: 15, say: (h: number) => cnHour(h) + '一刻', why: '一刻 = 15 phút. 三点一刻 là 3:15 chứ không phải 3:01.' },
  { m: 30, say: (h: number) => cnHour(h) + '半', why: '半 = 30 phút. Đừng lẫn với 半个小时 (nửa tiếng đồng hồ).' },
  { m: 45, say: (h: number) => cnHour(h) + '三刻', why: '三刻 = 45 phút, tức gần sang giờ sau rồi.' },
  { m: 20, say: (h: number) => cnHour(h) + '二十分', why: 'Nghe rõ 二十 (20) chứ không phải 十二 (12) — hai chữ đảo nhau.' },
  { m: 12, say: (h: number) => cnHour(h) + '十二分', why: 'Nghe rõ 十二 (12) chứ không phải 二十 (20).' },
] as const;

function timeDrills(): NumDrill[] {
  const hours = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12];
  const out: NumDrill[] = [];
  hours.forEach((h, i) => {
    const f = TIME_FORMS[i % TIME_FORMS.length];
    out.push({
      id: `n:t${h}-${f.m}`,
      say: '现在是' + f.say(h) + '。',
      label: hhmm(h, f.m),
      // Ba cái nhiễu: lệch giờ, lệch phút, và đảo hai chữ số của phút.
      bad:
        f.m === 0
          ? [hhmm(wrap12(h + 1), 0), hhmm(h, 30), hhmm(h, 15)]
          : [
              hhmm(wrap12(h + 1), f.m),
              hhmm(h, 0),
              hhmm(h, (f.m % 10) * 10 + Math.floor(f.m / 10)),
            ],
      cat: 'time',
      why: f.why,
      vi: 'Bây giờ là ' + hhmm(h, f.m),
    });
  });
  // 差 — con số nghe được là giờ SẮP tới, không phải giờ hiện tại.
  [4, 8, 10].forEach((h) => {
    out.push({
      id: `n:tc${h}`,
      say: '差五分' + cnHour(h) + '。',
      label: hhmm(wrap12(h - 1), 55),
      bad: [hhmm(h, 5), hhmm(h, 0), hhmm(wrap12(h - 1), 5)],
      cat: 'time',
      why: `差五分${cnHour(h)} = "còn năm phút nữa tới ${h} giờ" = ${hhmm(wrap12(h - 1), 55)}. Giờ nghe được là giờ CHƯA tới.`,
      vi: `Còn năm phút nữa là ${h} giờ`,
    });
  });
  return out;
}

/** Tiền: bẫy 一百五 (150) với 一百零五 (105), và một bậc hụt giữa 千 với 万. */
const MONEY: { n: number; bad: number[]; why: string }[] = [
  { n: 105, bad: [150, 15, 1050], why: '一百五 nói miệng là 150. Muốn nói 105 thì bắt buộc phải có 零: 一百零五.' },
  { n: 150, bad: [105, 15, 1500], why: '一百五十 thường rút thành 一百五 — nuốt mất chữ 十 nhưng vẫn là 150.' },
  { n: 230, bad: [23, 203, 2300], why: 'Hàng trăm đọc 两百 hay 二百 đều được; còn 二十 thì chỉ là 20.' },
  { n: 1200, bad: [1002, 120, 12000], why: '一千二 = 1200. Không có chữ 零 nghĩa là không có bậc nào bị khuyết.' },
  { n: 1002, bad: [1200, 1020, 102], why: 'Có 零 là dấu hiệu bậc trăm bị khuyết: 一千零二 = 1002.' },
  { n: 35, bad: [53, 350, 305], why: '三十五 (35) và 五十三 (53) chỉ khác thứ tự hai chữ.' },
  { n: 88, bad: [808, 880, 168], why: '八十八 = 88; 八百八 mới là 880.' },
  { n: 560, bad: [506, 56, 5600], why: '五百六 = 560, chữ 十 bị nuốt nhưng giá trị không đổi.' },
  { n: 10500, bad: [1500, 105000, 10050], why: '一万零五百 — chữ 零 báo rằng bậc nghìn bị khuyết.' },
  { n: 24000, bad: [2400, 240000, 20400], why: '两万四 = 24.000. 万 là bậc CHỤC NGHÌN, hụt một bậc là sai mười lần.' },
];

const dong = (n: number): string => n.toLocaleString('vi-VN') + ' tệ';

function moneyDrills(): NumDrill[] {
  return MONEY.map(({ n, bad, why }) => ({
    id: `n:m${n}`,
    say: `一共是${spoken(cnNum(n))}块。`,
    label: dong(n),
    bad: bad.map(dong),
    cat: 'money' as const,
    why,
    vi: `Tất cả là ${n.toLocaleString('vi-VN')} tệ`,
  }));
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_VI = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

function dateDrills(): NumDrill[] {
  const out: NumDrill[] = [];
  const days: [number, number][] = [
    [8, 15],
    [10, 1],
    [3, 12],
    [12, 20],
    [5, 4],
    [11, 7],
  ];
  days.forEach(([mo, d]) => {
    out.push({
      id: `n:d${mo}-${d}`,
      say: `会议在${cnNum(mo)}月${cnNum(d)}号。`,
      label: `${d}/${mo}`,
      bad: [`${mo}/${d}`, `${d}/${wrap12(mo + 1)}`, `${d < 10 ? d + 10 : d % 10}/${mo}`],
      cat: 'date',
      why: 'Tiếng Trung nói THÁNG trước NGÀY sau — 八月十五号 là 15/8, không phải 8/15.',
      vi: `Cuộc họp vào ngày ${d} tháng ${mo}`,
    });
  });
  [2, 4, 0, 6].forEach((w) => {
    out.push({
      id: `n:w${w}`,
      say: `我们星期${WEEK[w]}见。`,
      label: WEEK_VI[w],
      bad: [WEEK_VI[(w + 1) % 7], WEEK_VI[(w + 6) % 7], WEEK_VI[(w + 3) % 7]],
      cat: 'date',
      why: '星期二 là THỨ BA (số đếm bắt đầu từ thứ hai), còn 星期日/星期天 mới là Chủ nhật.',
      vi: `Chúng ta gặp nhau vào ${WEEK_VI[w].toLowerCase()}`,
    });
  });
  return out;
}

/** Số lượng lớn: 万 là bậc chục nghìn, chỗ người Việt hay hụt đúng một bậc. */
const COUNTS: { n: number; say: string; bad: number[]; why: string }[] = [
  { n: 30000, say: '三万', bad: [3000, 300000, 30300], why: '万 = 10.000, nên 三万 là 30.000 chứ không phải 3.000.' },
  { n: 1800, say: '一千八百', bad: [1080, 18000, 180], why: '一千八 là cách rút gọn của 一千八百 = 1800.' },
  { n: 250, say: '两百五十', bad: [205, 2500, 25], why: '两百五 cũng là 250 — chữ 十 bị nuốt không làm đổi giá trị.' },
  { n: 120000, say: '十二万', bad: [12000, 1200000, 102000], why: '十二万 = 120.000, hơn 12.000 đúng một bậc.' },
  { n: 4500, say: '四千五百', bad: [4050, 45000, 450], why: '四千五 = 4500, không phải 4050.' },
];

function countDrills(): NumDrill[] {
  return COUNTS.map(({ n, say, bad, why }) => ({
    id: `n:c${n}`,
    say: `这个城市有${say}人。`,
    label: n.toLocaleString('vi-VN') + ' người',
    bad: bad.map((b) => b.toLocaleString('vi-VN') + ' người'),
    cat: 'count' as const,
    why,
    vi: `Thành phố này có ${n.toLocaleString('vi-VN')} người`,
  }));
}

/** Thời lượng: 三个小时 (ba tiếng) khác hẳn 三点 (ba giờ). */
function durDrills(): NumDrill[] {
  const cases: [string, string, string, string[]][] = [
    ['三个半小时', '3 tiếng rưỡi', '三个半小时 = 3,5 TIẾNG. 三点半 mới là 3 giờ rưỡi.', ['3 giờ 30', '2 tiếng rưỡi', '30 phút']],
    ['半个小时', 'nửa tiếng', '半个小时 = 30 phút. 半 đứng trước 个 là "một nửa của một đơn vị".', ['1 tiếng rưỡi', '8 tiếng', '15 phút']],
    ['一个多小时', 'hơn 1 tiếng', '多 sau số = "hơn". 一个多小时 là hơn một tiếng, chưa tới hai.', ['1 tiếng đúng', 'gần 1 tiếng', 'hơn 10 tiếng']],
    ['四十分钟', '40 phút', '分钟 là THỜI LƯỢNG phút; 四十分 (không có 钟) là phút thứ 40 của một giờ nào đó.', ['14 phút', '4 phút', '4 tiếng']],
    ['两天半', '2 ngày rưỡi', '半 đứng SAU đơn vị: 两天半 = 2,5 ngày. 半天 lại là "nửa ngày".', ['nửa ngày', '2 ngày', '12 ngày']],
  ];
  return cases.map(([say, label, why, bad], i) => ({
    id: `n:u${i}`,
    say: `路上花了${say}。`,
    label,
    bad,
    cat: 'dur' as const,
    why,
    vi: `Đi đường mất ${label}`,
  }));
}

function ageDrills(): NumDrill[] {
  const cases: [number, string][] = [
    [28, '二十八 — nghe kỹ chữ đầu, 二十八 (28) và 八十二 (82) chỉ khác thứ tự.'],
    [82, '八十二 = 82. Đảo hai chữ là ra 二十八 (28).'],
    [19, '十九 = 19; 九十 mới là 90.'],
    [45, '四十五 = 45; đảo lại thành 五十四 (54) là mất điểm ngay.'],
  ];
  return cases.map(([n, why]) => ({
    id: `n:a${n}`,
    say: `他今年${cnNum(n)}岁。`,
    label: n + ' tuổi',
    bad: [
      Number(String(n).split('').reverse().join('')) + ' tuổi',
      n + 10 + ' tuổi',
      n + 1 + ' tuổi',
    ],
    cat: 'age',
    why,
    vi: `Năm nay anh ấy ${n} tuổi`,
  }));
}

/**
 * Toàn bộ đề bẫy số, thứ tự cố định.
 *
 * Cố định là điều kiện bắt buộc: mỗi câu ứng với đúng một file mp3 trong `public/tts`.
 */
export const NUM_DRILLS: NumDrill[] = [
  ...timeDrills(),
  ...moneyDrills(),
  ...dateDrills(),
  ...countDrills(),
  ...durDrills(),
  ...ageDrills(),
];

export const NUM_CAT_LABEL: Record<NumCat, string> = {
  time: 'Giờ giấc',
  money: 'Tiền bạc',
  date: 'Ngày tháng',
  count: 'Số lượng',
  age: 'Tuổi tác',
  dur: 'Thời lượng',
};
