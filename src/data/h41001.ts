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
 * sample paper's PDF; the spoken side comes from its published 听力材料 script. The
 * answers are not repeated here: they live once in `PAPER_PRESETS`, where the
 * whole-paper mode already marks against them — and they were read off this very
 * script, which is why the first key the app shipped turned out to be another paper's.
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
  /**
   * What the recording actually says — the read passage, or the dialogue turn by turn.
   *
   * Told after answering, never before. Knowing you got it wrong teaches nothing; being
   * able to read the sentence you misheard, next to the sound you just heard, is the
   * whole of the repair.
   */
  script: string[];
  /** The 问 line the recording asks; part 1 asks nothing, it prints a statement instead. */
  ask?: string;
  /**
   * The words that settle the answer, quoted from `script` verbatim.
   *
   * A test asserts this really is a substring of the script, so a mis-typed cue cannot
   * ship — it would otherwise be a plausible-looking explanation of the wrong thing.
   */
  cue: string;
}

export const H41001_PAPER_ID = 'H41001';

export const H41001_LISTEN: RealListenQuestion[] = [
  {
    n: 1,
    part: 1,
    statement: '飞机还没起飞。',
    at: [127.13, 150.52],
    script: ['乘客您好，我们很抱歉地通知您，由于天气原因，您乘坐的CA1864航班推迟起飞。'],
    cue: '航班推迟起飞',
  },
  {
    n: 2,
    part: 1,
    statement: '不饿就不要吃早饭。',
    at: [160.54, 180.55],
    script: ['可能是因为忙，没有时间，也许只是觉得不饿，一些人不吃早饭就去上学或上班，时间长了，健康自然会受到影响。'],
    cue: '健康自然会受到影响',
  },
  {
    n: 3,
    part: 1,
    statement: '经理发现了小王的一些缺点。',
    at: [190.56, 211.08],
    script: ['昨天的面试，小王给经理留下了非常好的印象：有礼貌，有信心，有能力，经理几乎没发现他有什么缺点。'],
    cue: '经理几乎没发现他有什么缺点',
  },
  {
    n: 4,
    part: 1,
    statement: '女朋友听过这个笑话。',
    at: [221.15, 242.54],
    script: ['第一次和女朋友约会的时候，他有点儿紧张，于是他决定主动讲一个笑话，刚讲了一半儿，女朋友笑着说：“这个我听过。”'],
    cue: '这个我听过',
  },
  {
    n: 5,
    part: 1,
    statement: '他没有翻译第二部分。',
    at: [252.37, 272.14],
    script: ['刘律师，您的材料我已经翻译完了，不过其中第二部分有一些专业知识我不太了解，您看翻译得是不是准确。'],
    cue: '您的材料我已经翻译完了',
  },
  {
    n: 6,
    part: 1,
    statement: '服务员的京剧唱得很好。',
    at: [282.08, 302.55],
    script: ['让人吃惊的是，这位服务员的京剧竟然唱得非常好，要知道，他只是跟着电视学习京剧，从来没有接受过专门教育。'],
    cue: '京剧竟然唱得非常好',
  },
  {
    n: 7,
    part: 1,
    statement: '王老师现在是教授了。',
    at: [312.53, 328.62],
    script: ['王老师，你太厉害了！刚来这儿工作三年就当了教授，这次你一定得请客啊。'],
    cue: '刚来这儿工作三年就当了教授',
  },
  {
    n: 8,
    part: 1,
    statement: '他想买个大房子。',
    at: [338.63, 357.63],
    script: ['我没什么特别的要求，只要交通方便，周围环境别太吵就行，要有冰箱、洗衣机、空调，当然房租最好别太贵。'],
    cue: '房租最好别太贵',
  },
  {
    n: 9,
    part: 1,
    statement: '他在理发店。',
    at: [367.64, 382.69],
    script: ['你好，我想理个发，稍微短一点儿就可以。一会儿我还有些事要办，所以麻烦你快一点儿。'],
    cue: '我想理个发',
  },
  {
    n: 10,
    part: 1,
    statement: '这个咖啡馆儿很热闹。',
    at: [392.7, 411.56],
    script: ['这个咖啡馆儿虽然不大，有些破旧，但是很安静。偶尔和朋友过来坐坐，听听音乐，喝一杯咖啡，感觉很好。'],
    cue: '但是很安静',
  },
  {
    n: 11,
    part: 2,
    options: ['没纸了', '男的没发', '打印机坏了', '传真机坏了'],
    at: [457.03, 483.23],
    script: [
      '男：我上午发的那份传真你收到了吧？',
      '女：没收到。等等，我看一下，抱歉，没纸了，麻烦您再发一遍吧。',
    ],
    ask: '女的为什么没收到传真？',
    cue: '没纸了',
  },
  {
    n: 12,
    part: 2,
    options: ['将来', '理想', '小说', '职业'],
    at: [499.3, 516.07],
    script: [
      '女：这本小说讲了一个爱情故事，很浪漫，让人特别感动。',
      '男：你们女孩子就是喜欢看这种小说。',
    ],
    ask: '他们在谈论什么？',
    cue: '这本小说讲了一个爱情故事',
  },
  {
    n: 13,
    part: 2,
    options: ['办签证', '去学校', '打网球', '打羽毛球'],
    at: [532.34, 549.6],
    script: [
      '男：明天我们一起去打网球，好吗？',
      '女：我上午要去使馆办签证，我回来以后直接去找你。',
    ],
    ask: '他们明天一起做什么？',
    cue: '我回来以后直接去找你',
  },
  {
    n: 14,
    part: 2,
    options: ['不想出国', '换个箱子', '不符合规定', '早点儿回来'],
    at: [565.92, 583.46],
    script: [
      '女：你这次出国要两个多星期，得多带几件衣服。',
      '男：带这么多东西，恐怕我得换个大一点儿的行李箱。',
    ],
    ask: '男的是什么意思？',
    cue: '换个大一点儿的行李箱',
  },
  {
    n: 15,
    part: 2,
    options: ['变胖了', '很难受', '正在减肥', '工作很辛苦'],
    at: [600.06, 618.74],
    script: [
      '男：你最近瘦了很多，工作很辛苦吗？',
      '女：不是，以前太胖了，我正在减肥。我真的瘦了？',
    ],
    ask: '关于女的，可以知道什么？',
    cue: '我正在减肥',
  },
  {
    n: 16,
    part: 2,
    options: ['是研究生', '参加工作了', '已经毕业了', '在准备考试'],
    at: [635.29, 651.11],
    script: [
      '女：你明年就毕业了，现在开始找工作了吗？',
      '男：没有，我正在准备研究生考试。',
    ],
    ask: '关于男的，可以知道什么？',
    cue: '正在准备研究生考试',
  },
  {
    n: 17,
    part: 2,
    options: ['打扫', '等人', '爬山', '购物'],
    at: [667.4, 684.81],
    script: [
      '男：等等我，我实在爬不动了。',
      '女：真没力气了？那好吧，我们先休息休息，一会儿继续。',
    ],
    ask: '他们最可能在做什么？',
    cue: '我实在爬不动了',
  },
  {
    n: 18,
    part: 2,
    options: ['幽默', '很难过', '很粗心', '没有耐心'],
    at: [700.93, 716.76],
    script: [
      '女：我希望我的男朋友又高又帅，还要非常幽默。',
      '男：你说的是我吗？',
    ],
    ask: '根据对话，可以知道男的怎么样？',
    cue: '还要非常幽默',
  },
  {
    n: 19,
    part: 2,
    options: ['很酸', '很甜', '很咸', '很辣'],
    at: [732.92, 750.69],
    script: [
      '男：今天的汤怎么这么咸啊？',
      '女：啊？对不起，对不起，肯定是我放错了，把盐当成糖了。',
    ],
    ask: '今天的汤怎么样？',
    cue: '怎么这么咸啊',
  },
  {
    n: 20,
    part: 2,
    options: ['他们输了', '他们赢了', '他们放弃了', '他们很愉快'],
    at: [766.96, 782.7],
    script: [
      '女：这场篮球赛太可惜了！我们差一点儿就赢了。',
      '男：只差一分，确实可惜。',
    ],
    ask: '根据对话，可以知道什么？',
    cue: '差一点儿就赢了',
  },
  {
    n: 21,
    part: 2,
    options: ['学钢琴', '去旅游', '做生意', '锻炼身体'],
    at: [799.01, 818.16],
    script: [
      '男：马上要放暑假了，去哪儿玩儿你有什么计划吗？',
      '女：我们班可能要组织大家一起去旅游，还没商量好到底去哪里呢。',
    ],
    ask: '女的暑假有什么打算？',
    cue: '组织大家一起去旅游',
  },
  {
    n: 22,
    part: 2,
    options: ['肚子疼', '感冒了', '觉得热', '穿得太少'],
    at: [834.63, 851.52],
    script: [
      '女：今天天气不是很冷，你怎么穿这么厚？',
      '男：就是因为昨天穿得太少，今天感冒了，不停地咳嗽。',
    ],
    ask: '男的怎么了？',
    cue: '今天感冒了',
  },
  {
    n: 23,
    part: 2,
    options: ['周末', '下周', '两周后', '下个月'],
    at: [868.1, 888.82],
    script: [
      '男：调查结果还没出来吗？估计还要多长时间？',
      '女：按原来的计划大概是两周，但是我们可以提前完成，周末保证可以出来。',
    ],
    ask: '结果什么时候出来？',
    cue: '周末保证可以出来',
  },
  {
    n: 24,
    part: 2,
    options: ['医生', '导游', '卖家具的', '开出租车的'],
    at: [905.34, 921.49],
    script: [
      '女：你好，我在这里买家具，你们负责送吗？',
      '男：当然，我们免费在二十四小时内送到您要求的地方。',
    ],
    ask: '男的是做什么的？',
    cue: '我在这里买家具',
  },
  {
    n: 25,
    part: 2,
    options: ['我不会', '马上来', '没法解释', '解决不了'],
    at: [937.92, 953.43],
    script: [
      '男：小黄，打扰你一下，我这台电脑打不开了。你来帮我看看?',
      '女：好。你等我五分钟。',
    ],
    ask: '女的是什么意思？',
    cue: '你等我五分钟',
  },
  {
    n: 26,
    part: 3,
    options: ['医院', '宾馆', '图书馆', '体育场'],
    at: [1017.03, 1046.58],
    script: [
      '女：姓名、年龄、性别、联系电话，都写在这张表上。',
      '男：好的，是在一楼打针吗？',
      '女：对，一楼，就在对面，一会儿请把这张表交给护士。',
      '男：好的，谢谢你。',
    ],
    ask: '男的最可能在哪儿？',
    cue: '是在一楼打针吗',
  },
  {
    n: 27,
    part: 3,
    options: ['很奇怪', '很随便', '很一般', '很正式'],
    at: [1062.85, 1086.31],
    script: [
      '男：今天穿得很正式啊，有什么事吗？',
      '女：下午的会议邀请了几个外国人，我的任务是翻译。',
      '男：明白了，是那几个校长吧？你们这是国际会议啊。',
      '女：完全正确。',
    ],
    ask: '女的打扮得怎么样？',
    cue: '今天穿得很正式啊',
  },
  {
    n: 28,
    part: 3,
    options: ['撞车了', '车速太慢', '他们是记者', '女的很小心'],
    at: [1102.59, 1128.05],
    script: [
      '女：危险！你开得太快了。',
      '男：好吧，好吧，我开慢点儿。',
      '女：你现在把车停下，我来开，我真受不了你了。',
      '男：你干什么呀？你不是也刚学会几天吗？',
      '女：至少比你开得慢。',
    ],
    ask: '通过对话，可以知道什么？',
    cue: '危险！你开得太快了',
  },
  {
    n: 29,
    part: 3,
    options: ['生病了', '丢了电脑', '忘了密码', '弄坏镜子了'],
    at: [1144.16, 1167.58],
    script: [
      '男：我把电脑的密码忘了，怎么办啊？',
      '女：别着急，我有一个好主意。',
      '男：你有什么办法，快说！',
      '女：重新买个电脑不就行了？',
      '男：我都急死了，你不帮忙，还跟我开玩笑！',
    ],
    ask: '男的怎么了？',
    cue: '我把电脑的密码忘了',
  },
  {
    n: 30,
    part: 3,
    options: ['5点', '下班以后', '明天', '下个星期'],
    at: [1183.95, 1206.61],
    script: [
      '女：附近那家银行几点下班，你知道吗？',
      '男：五点，对，是五点。',
      '女：那来不及了。我本来打算去取点儿钱。',
      '男：明天吧，他们周六也上班。',
    ],
    ask: '女的最可能什么时候去银行？',
    cue: '明天吧',
  },
  {
    n: 31,
    part: 3,
    options: ['两元', '3元5角', '7元', '9元'],
    at: [1222.75, 1240.76],
    script: [
      '男：西红柿新鲜吗？怎么卖？',
      '女：三块五一斤。百分之百新鲜。',
      '男：那我买二斤吧。',
      '女：好，一共七块钱。',
    ],
    ask: '西红柿多少钱一斤？',
    cue: '三块五一斤',
  },
  {
    n: 32,
    part: 3,
    options: ['买手机', '去亲戚家', '交电话费', '找李大夫'],
    at: [1256.92, 1278.71],
    script: [
      '女：你有李大夫的手机号吗？',
      '男：他最近好像换了个号，我没有他的新号。',
      '女：那怎么办呢？我有点儿事要找他。',
      '男：我有他家里的电话，你打他家里电话吧。',
    ],
    ask: '女的想做什么？',
    cue: '我有点儿事要找他',
  },
  {
    n: 33,
    part: 3,
    options: ['毛巾', '帽子', '钥匙', '笔记本'],
    at: [1294.84, 1321.56],
    script: [
      '男：我刚才放这儿的那个蓝色塑料袋呢？你看见了吗？',
      '女：那不是垃圾吗？我扔了。',
      '男：我的天！里面有我新买的一双袜子，还有办公室的钥匙。',
      '女：什么东西都乱放！快点儿，咱俩去楼下垃圾桶看看。',
    ],
    ask: '女的把什么扔了？',
    cue: '还有办公室的钥匙',
  },
  {
    n: 34,
    part: 3,
    options: ['车上', '火车站', '电梯里', '地铁上'],
    at: [1337.94, 1358.4],
    script: [
      '女：最近的交通好像好多了。',
      '男：是，堵车不那么严重了。',
      '女：以前得开一个小时才能到公司，现在四十分钟应该就能到吧?',
      '男：是，差不多。',
    ],
    ask: '他们最可能在哪儿？',
    cue: '以前得开一个小时才能到公司',
  },
  {
    n: 35,
    part: 3,
    options: ['公园', '商店', '洗手间', '公共汽车'],
    at: [1374.58, 1392.52],
    script: [
      '男：请问，哪儿有卖饮料的？',
      '女：公园里没有，你出门往左走，那儿有商店。',
      '男：是北门外？',
      '女：对，北门左边。',
    ],
    ask: '男的在找什么？',
    cue: '哪儿有卖饮料的',
  },
  {
    n: 36,
    part: 3,
    options: ['睡觉', '散散步', '洗个澡', '回忆过去'],
    at: [1408.66, 1440.13],
    script: ['遇到烦恼事时，你应该想一些办法让自己从不高兴的心情中走出来，逐渐地冷静下来。例如去散散步，与熟悉的朋友聊聊有趣的事，阅读几篇比较轻松的文章等。'],
    ask: '怎样可以使心情变好？',
    cue: '例如去散散步',
  },
  {
    n: 37,
    part: 3,
    options: ['要互相关心', '做事要冷静', '运动很重要', '怎样改变心情'],
    at: [1456.62, 1461.94],
    sharesPassage: true,
    script: ['遇到烦恼事时，你应该想一些办法让自己从不高兴的心情中走出来，逐渐地冷静下来。例如去散散步，与熟悉的朋友聊聊有趣的事，阅读几篇比较轻松的文章等。'],
    ask: '这段话主要想告诉我们什么？',
    cue: '让自己从不高兴的心情中走出来',
  },
  {
    n: 38,
    part: 3,
    options: ['脾气好', '爱做梦', '很成功', '工作压力大'],
    at: [1478.36, 1522.04],
    script: ['有一个人很喜欢抽烟，当家人反对时，他总是说：“我工作压力大，让我轻松一会儿吧。”一天，他进门时发现儿子正坐在沙发上抽烟呢。他很生气，大声说：“你怎么可以抽烟呢？”儿子回答：“我学习压力大，让我轻松一会儿吧。”'],
    ask: '关于那个人，可以知道什么？',
    cue: '我工作压力大',
  },
  {
    n: 39,
    part: 3,
    options: ['喝酒', '抽烟', '踢足球', '说假话'],
    at: [1538.48, 1543.39],
    sharesPassage: true,
    script: ['有一个人很喜欢抽烟，当家人反对时，他总是说：“我工作压力大，让我轻松一会儿吧。”一天，他进门时发现儿子正坐在沙发上抽烟呢。他很生气，大声说：“你怎么可以抽烟呢？”儿子回答：“我学习压力大，让我轻松一会儿吧。”'],
    ask: '他不同意儿子做什么？',
    cue: '你怎么可以抽烟呢',
  },
  {
    n: 40,
    part: 3,
    options: ['警察', '司机', '学生', '家长'],
    at: [1559.46, 1590.49],
    script: ['学校旁边的这条路以前路窄车多，我们都很担心孩子的安全，每天中午和下午都要去校门口接孩子。现在情况不一样了，不光路修宽了，还有交警，我们都放心多了。'],
    ask: '说话人是谁？',
    cue: '都要去校门口接孩子',
  },
  {
    n: 41,
    part: 3,
    options: ['变宽了', '比较窄', '禁止停车', '没有红绿灯'],
    at: [1606.81, 1611.66],
    sharesPassage: true,
    script: ['学校旁边的这条路以前路窄车多，我们都很担心孩子的安全，每天中午和下午都要去校门口接孩子。现在情况不一样了，不光路修宽了，还有交警，我们都放心多了。'],
    ask: '那条路现在怎么样？',
    cue: '不光路修宽了',
  },
  {
    n: 42,
    part: 3,
    options: ['失望', '羡慕', '后悔', '激动'],
    at: [1627.81, 1660.56],
    script: ['大家晚上好，我今天没有想到自己能得到这个奖。谢谢，谢谢大家！我，我还要感谢我的父母，还有我的妻子，没有他们的支持和帮助，我不可能站到这里，拿这个奖。'],
    ask: '说话人现在心情怎么样？',
    cue: '没有想到自己能得到这个奖',
  },
  {
    n: 43,
    part: 3,
    options: ['是演员', '结婚了', '很年轻', '没有得奖'],
    at: [1677.0, 1682.44],
    sharesPassage: true,
    script: ['大家晚上好，我今天没有想到自己能得到这个奖。谢谢，谢谢大家！我，我还要感谢我的父母，还有我的妻子，没有他们的支持和帮助，我不可能站到这里，拿这个奖。'],
    ask: '关于说话人，可以知道什么？',
    cue: '还有我的妻子',
  },
  {
    n: 44,
    part: 3,
    options: ['家里', '厨房', '教室', '会议室'],
    at: [1698.86, 1729.95],
    script: ['这个广告可以在广播里做，也可以在电视上做，关键要看我们的顾客是谁，孩子的妈妈是我们最主要的顾客，因此我认为应该选择电视。下面我听听大家的意见。'],
    ask: '说话人最可能在哪儿？',
    cue: '下面我听听大家的意见',
  },
  {
    n: 45,
    part: 3,
    options: ['开会', '参观', '听广播', '看电视'],
    at: [1746.17, 1750.51],
    sharesPassage: true,
    script: ['这个广告可以在广播里做，也可以在电视上做，关键要看我们的顾客是谁，孩子的妈妈是我们最主要的顾客，因此我认为应该选择电视。下面我听听大家的意见。'],
    ask: '他们正在做什么？',
    cue: '下面我听听大家的意见',
  },
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
