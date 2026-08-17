/**
 * The official HSK 4 sample paper's listening section, question by question.
 *
 * The app's own mock exam is read by the browser's synthesised voice, which is the one
 * thing practice cannot fix: no amount of tuning makes it sound like the studio
 * recording. What can be done is the other way round — take the real recording that
 * ships with the app and cut it into its 45 questions, so a learner can drill one part
 * with the exact voices, pacing and background of the exam.
 *
 * The printed side (the ★ statements and the A–D options) is transcribed from the
 * sample paper's PDF. The answers are not repeated here: they live once in
 * `PAPER_PRESETS`, where the whole-paper mode already marks against them.
 *
 * The timings come from the recording's own answer pauses — silence detection at
 * −35 dB found exactly 49 long gaps, which is 45 questions plus the four worked
 * examples, and the five short 4–5 s clips fall exactly on questions 37, 39, 41, 43 and
 * 45, the second question of each two-question passage. That the structure lines up
 * with the printed paper is what says the cuts are in the right places.
 */

export interface RealListenQuestion {
  /** Question number on the paper, 1–45. */
  n: number;
  part: 1 | 2 | 3;
  /** Part 1 prints a statement to judge true or false. */
  statement?: string;
  /** Parts 2 and 3 print four options. */
  options?: [string, string, string, string];
  /** Start and end of this question inside the recording, in seconds. */
  at: [number, number];
  /**
   * True when the passage was read during the previous question's clip.
   *
   * Questions 36–45 come in pairs over one passage: the recording reads it once, asks,
   * pauses, then asks again. The second question's own clip is just the four-second
   * stem, so it is worth nothing without the passage before it.
   */
  sharesPassage?: boolean;
}

export const H41001_PAPER_ID = 'H41001';

export const H41001_LISTEN: RealListenQuestion[] = [
  { n: 1, part: 1, statement: '飞机还没起飞。', at: [127.13, 150.52] },
  { n: 2, part: 1, statement: '不饿就不要吃早饭。', at: [160.54, 180.55] },
  { n: 3, part: 1, statement: '经理发现了小王的一些缺点。', at: [190.56, 211.08] },
  { n: 4, part: 1, statement: '女朋友听过这个笑话。', at: [221.15, 242.54] },
  { n: 5, part: 1, statement: '他没有翻译第二部分。', at: [252.37, 272.14] },
  { n: 6, part: 1, statement: '服务员的京剧唱得很好。', at: [282.08, 302.55] },
  { n: 7, part: 1, statement: '王老师现在是教授了。', at: [312.53, 328.62] },
  { n: 8, part: 1, statement: '他想买个大房子。', at: [338.63, 357.63] },
  { n: 9, part: 1, statement: '他在理发店。', at: [367.64, 382.69] },
  { n: 10, part: 1, statement: '这个咖啡馆儿很热闹。', at: [392.7, 411.56] },

  { n: 11, part: 2, options: ['没纸了', '男的没发', '打印机坏了', '传真机坏了'], at: [457.03, 483.23] },
  { n: 12, part: 2, options: ['将来', '理想', '小说', '职业'], at: [499.3, 516.07] },
  { n: 13, part: 2, options: ['办签证', '去学校', '打网球', '打羽毛球'], at: [532.34, 549.6] },
  { n: 14, part: 2, options: ['不想出国', '换个箱子', '不符合规定', '早点儿回来'], at: [565.92, 583.46] },
  { n: 15, part: 2, options: ['变胖了', '很难受', '正在减肥', '工作很辛苦'], at: [600.06, 618.74] },
  { n: 16, part: 2, options: ['是研究生', '参加工作了', '已经毕业了', '在准备考试'], at: [635.29, 651.11] },
  { n: 17, part: 2, options: ['打扫', '等人', '爬山', '购物'], at: [667.4, 684.81] },
  { n: 18, part: 2, options: ['幽默', '很难过', '很粗心', '没有耐心'], at: [700.93, 716.76] },
  { n: 19, part: 2, options: ['很酸', '很甜', '很咸', '很辣'], at: [732.92, 750.69] },
  { n: 20, part: 2, options: ['他们输了', '他们赢了', '他们放弃了', '他们很愉快'], at: [766.96, 782.7] },
  { n: 21, part: 2, options: ['学钢琴', '去旅游', '做生意', '锻炼身体'], at: [799.01, 818.16] },
  { n: 22, part: 2, options: ['肚子疼', '感冒了', '觉得热', '穿得太少'], at: [834.63, 851.52] },
  { n: 23, part: 2, options: ['周末', '下周', '两周后', '下个月'], at: [868.1, 888.82] },
  { n: 24, part: 2, options: ['医生', '导游', '卖家具的', '开出租车的'], at: [905.34, 921.49] },
  { n: 25, part: 2, options: ['我不会', '马上来', '没法解释', '解决不了'], at: [937.92, 953.43] },

  { n: 26, part: 3, options: ['医院', '宾馆', '图书馆', '体育场'], at: [1017.03, 1046.58] },
  { n: 27, part: 3, options: ['很奇怪', '很随便', '很一般', '很正式'], at: [1062.85, 1086.31] },
  { n: 28, part: 3, options: ['撞车了', '车速太慢', '他们是记者', '女的很小心'], at: [1102.59, 1128.05] },
  { n: 29, part: 3, options: ['生病了', '丢了电脑', '忘了密码', '弄坏镜子了'], at: [1144.16, 1167.58] },
  { n: 30, part: 3, options: ['5点', '下班以后', '明天', '下个星期'], at: [1183.95, 1206.61] },
  { n: 31, part: 3, options: ['两元', '3元5角', '7元', '9元'], at: [1222.75, 1240.76] },
  { n: 32, part: 3, options: ['买手机', '去亲戚家', '交电话费', '找李大夫'], at: [1256.92, 1278.71] },
  { n: 33, part: 3, options: ['毛巾', '帽子', '钥匙', '笔记本'], at: [1294.84, 1321.56] },
  { n: 34, part: 3, options: ['车上', '火车站', '电梯里', '地铁上'], at: [1337.94, 1358.4] },
  { n: 35, part: 3, options: ['公园', '商店', '洗手间', '公共汽车'], at: [1374.58, 1392.52] },
  { n: 36, part: 3, options: ['睡觉', '散散步', '洗个澡', '回忆过去'], at: [1408.66, 1440.13] },
  { n: 37, part: 3, options: ['要互相关心', '做事要冷静', '运动很重要', '怎样改变心情'], at: [1456.62, 1461.94], sharesPassage: true },
  { n: 38, part: 3, options: ['脾气好', '爱做梦', '很成功', '工作压力大'], at: [1478.36, 1522.04] },
  { n: 39, part: 3, options: ['喝酒', '抽烟', '踢足球', '说假话'], at: [1538.48, 1543.39], sharesPassage: true },
  { n: 40, part: 3, options: ['警察', '司机', '学生', '家长'], at: [1559.46, 1590.49] },
  { n: 41, part: 3, options: ['变宽了', '比较窄', '禁止停车', '没有红绿灯'], at: [1606.81, 1611.66], sharesPassage: true },
  { n: 42, part: 3, options: ['失望', '羡慕', '后悔', '激动'], at: [1627.81, 1660.56] },
  { n: 43, part: 3, options: ['是演员', '结婚了', '很年轻', '没有得奖'], at: [1677.0, 1682.44], sharesPassage: true },
  { n: 44, part: 3, options: ['家里', '厨房', '教室', '会议室'], at: [1698.86, 1729.95] },
  { n: 45, part: 3, options: ['开会', '参观', '听广播', '看电视'], at: [1746.17, 1750.51], sharesPassage: true },
];

/** The three listening parts, as the paper divides them. */
export const H41001_PARTS: { part: 1 | 2 | 3; title: string; sub: string; how: string }[] = [
  {
    part: 1,
    title: '听力第一部分',
    sub: 'Nghe · Phán đoán đúng sai',
    how: 'Nghe một đoạn ngắn rồi quyết định câu in trên đề đúng hay sai. Bẫy hay gặp: câu in đổi một chữ so với băng — nghe kỹ chỗ phủ định và chỗ thời gian.',
  },
  {
    part: 2,
    title: '听力第二部分',
    sub: 'Nghe · Đối thoại ngắn',
    how: 'Hai người nói mỗi người một câu, rồi mới hỏi. Đọc trước bốn đáp án ngay khi chưa phát: biết trước đang hỏi gì thì nghe mới có đích.',
  },
  {
    part: 3,
    title: '听力第三部分',
    sub: 'Nghe · Đối thoại dài & đoạn văn',
    how: 'Câu 26–35 mỗi đoạn một câu hỏi. Câu 36–45 là năm đoạn, mỗi đoạn hỏi hai câu — đoạn chỉ đọc một lần rồi hỏi liền hai câu, nên phải nhớ ý chứ không kịp nghe lại.',
  },
];
