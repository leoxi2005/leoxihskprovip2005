/**
 * Hai bộ bài luyện được viết tay, vì không sinh máy được.
 *
 * **Kết hợp từ (搭配)** — thứ mà trắc nghiệm nghĩa ↔ chữ không dạy nổi: 提高 và 增加
 * dịch ra tiếng Việt gần như nhau, nhưng 提高水平 đúng còn 增加水平 sai. Nghĩa tiếng
 * Việt được in sẵn trong đề, nên câu hỏi luôn chỉ có MỘT đáp án: không phải đoán xem
 * người ra đề định nói gì, mà là chọn đúng động từ đi với danh từ đó.
 *
 * **Bắt lỗi sai (改错)** — câu bị chia thành bốn mảnh, một mảnh mang lỗi. Toàn bộ lỗi
 * ở đây là lỗi người Việt thật sự hay mắc (trật tự trạng ngữ, 了 với thói quen, 的/得/地,
 * 离合词 mang tân ngữ), không phải lỗi bịa ra cho đủ số.
 */

export interface Collocation {
  id: string;
  /** Từ đúng. */
  a: string;
  /** Bốn lựa chọn, đã kể cả `a`. */
  opts: string[];
  /** Cụm có chỗ trống, ví dụ `____水平`. */
  frame: string;
  /** Cụm hoàn chỉnh. */
  full: string;
  pin: string;
  /** Nghĩa tiếng Việt của cụm — chính là đề bài. */
  vi: string;
  /** Vì sao ba từ kia không đi được. */
  why: string;
  t: string;
}

export interface FixItem {
  id: string;
  /** Câu bị cắt thành bốn mảnh; đúng một mảnh sai. */
  parts: string[];
  /** Chỉ số mảnh sai. */
  bad: number;
  /** Câu đã sửa. */
  right: string;
  pin: string;
  vi: string;
  why: string;
  t: string;
}

const K = (
  id: string,
  a: string,
  bad: [string, string, string],
  frame: string,
  full: string,
  pin: string,
  vi: string,
  why: string,
): Collocation => ({ id: 'k:' + id, a, opts: [a, ...bad], frame, full, pin, vi, why, t: 'Tổng hợp' });

/** 44 cụm cố định hay ra trong đề HSK 4. */
export const COLLOCATIONS: Collocation[] = [
  K('shuiping', '提高', ['增长', '长高', '升高'], '____水平', '提高水平', 'tígāo shuǐpíng', 'nâng cao trình độ',
    '水平 · 成绩 · 能力 · 质量 đều đi với 提高. 增长 dùng cho con số (增长百分之十), 长高 là người cao lên.'),
  K('jingyan', '积累', ['收集', '存放', '储蓄'], '____经验', '积累经验', 'jīlěi jīngyàn', 'tích luỹ kinh nghiệm',
    '积累 là gom dần theo thời gian. 收集 là sưu tầm vật thể, 储蓄 chỉ dùng cho tiền.'),
  K('zhuyi', '引起', ['发生', '出现', '举行'], '____注意', '引起注意', 'yǐnqǐ zhùyì', 'gây chú ý',
    '引起 + 注意 · 兴趣 · 讨论 — có chủ thể tác động. 发生 · 出现 là tự nó xảy ra, không ai gây ra cả.'),
  K('xiguan', '养成', ['长成', '做成', '变成'], '____习惯', '养成习惯', 'yǎngchéng xíguàn', 'tạo thói quen',
    '养成 chỉ đi với 习惯 (và 性格). 变成 là biến thành thứ khác hẳn.'),
  K('zhaohu', '打', ['做', '说', '开'], '____招呼', '打招呼', 'dǎ zhāohu', 'chào hỏi',
    '打招呼 · 打电话 · 打折 · 打针 — 打 ở đây không còn nghĩa "đánh", phải nhớ nguyên cụm.'),
  K('wenti', '解决', ['完成', '结束', '消失'], '____问题', '解决问题', 'jiějué wèntí', 'giải quyết vấn đề',
    '完成 đi với 任务 · 作业 (thứ được giao). 问题 thì phải 解决.'),
  K('renwu', '完成', ['解决', '结束', '达到'], '____任务', '完成任务', 'wánchéng rènwu', 'hoàn thành nhiệm vụ',
    'Ngược với câu trên: 任务 · 作业 · 计划 đi với 完成. 达到 đi với 目的 · 水平.'),
  K('bisai', '参加', ['加入', '进入', '出发'], '____比赛', '参加比赛', 'cānjiā bǐsài', 'tham gia cuộc thi',
    '参加 + hoạt động (比赛 · 会议 · 考试). 加入 + tổ chức (加入公司), không dùng cho một sự kiện.'),
  K('guiding', '遵守', ['保持', '坚持', '接受'], '____规定', '遵守规定', 'zūnshǒu guīdìng', 'tuân thủ quy định',
    '规定 · 纪律 · 交通规则 đi với 遵守. 坚持 là kiên trì làm gì đó, không dùng cho luật lệ.'),
  K('huanjing', '保护', ['保存', '保留', '保险'], '____环境', '保护环境', 'bǎohù huánjìng', 'bảo vệ môi trường',
    '保存 là cất giữ cho khỏi hỏng (保存文件), 保留 là giữ lại phần nào đó — cả hai đều không bảo vệ được môi trường.'),
  K('yali', '减轻', ['降落', '减肥', '取消'], '____压力', '减轻压力', 'jiǎnqīng yālì', 'giảm bớt áp lực',
    '减轻 + 压力 · 负担 · 疼痛 — làm cho nhẹ đi. 降落 là máy bay hạ cánh.'),
  K('yinxiang', '留下', ['放下', '记下', '写下'], '给他____了好印象', '留下印象', 'liúxià yìnxiàng', 'để lại ấn tượng',
    '印象 luôn đi với 留下 (给……留下……印象). 记下 là ghi lại vào sổ.'),
  K('xuqiu', '满足', ['完成', '达到', '实现'], '____需求', '满足需求', 'mǎnzú xūqiú', 'đáp ứng nhu cầu',
    '需求 · 要求 · 条件 đi với 满足. 实现 đi với 理想 · 梦想 · 愿望.'),
  K('jianyi', '提出', ['说出', '拿出', '举出'], '____建议', '提出建议', 'tíchū jiànyì', 'đưa ra đề nghị',
    '提出 + 建议 · 意见 · 问题 · 要求. 拿出 là lấy vật thể ra khỏi túi.'),
  K('lianxi', '保持', ['坚持', '留下', '接受'], '____联系', '保持联系', 'bǎochí liánxì', 'giữ liên lạc',
    '保持 là giữ nguyên một trạng thái: 保持联系 · 保持安静 · 保持健康.'),
  K('bianhua', '发生', ['举行', '进行', '参加'], '____变化', '发生变化', 'fāshēng biànhuà', 'xảy ra thay đổi',
    '发生 + 变化 · 事故 · 问题 — chuyện tự xảy đến. 举行 cần người đứng ra tổ chức.'),
  K('shijian', '浪费', ['消费', '花费', '节约'], '____时间', '浪费时间', 'làngfèi shíjiān', 'lãng phí thời gian',
    '浪费 mang nghĩa xấu: dùng mà không được gì. 花费时间 chỉ là "tốn thời gian", không chê trách.'),
  K('jiaqi', '度过', ['通过', '经过', '走过'], '____假期', '度过假期', 'dùguò jiàqī', 'trải qua kỳ nghỉ',
    '度过 dùng cho khoảng THỜI GIAN (度过假期 · 度过童年). 经过 · 通过 là đi qua một chỗ.'),
  K('paidui', '排', ['站', '等', '列'], '____队', '排队', 'pái duì', 'xếp hàng',
    '排队 là một cụm cố định. 站 chỉ là đứng, không mang nghĩa xếp thành hàng chờ tới lượt.'),
  K('wanxiao', '开', ['做', '说', '打'], '____玩笑', '开玩笑', 'kāi wánxiào', 'nói đùa',
    '开玩笑 · 开会 · 开车 — 开 trong các cụm này không phải "mở".'),
  K('qingjia', '请', ['要', '借', '拿'], '____假', '请假', 'qǐng jià', 'xin nghỉ phép',
    '请假 là 离合词: xin phép nghỉ. 要假 · 借假 không tồn tại.'),
  K('jiaban', '加', ['多', '长', '增'], '____班', '加班', 'jiā bān', 'tăng ca',
    '加班 = làm thêm ngoài giờ. Đây là một từ, không ghép tự do được.'),
  K('chuchai', '出', ['去', '走', '上'], '____差', '出差', 'chū chāi', 'đi công tác',
    '出差 · 出发 · 出门 — 出 mở đầu nhiều cụm cố định về việc rời chỗ.'),
  K('dazhe', '打', ['减', '降', '做'], '____折', '打折', 'dǎ zhé', 'giảm giá',
    '打折 là giảm giá theo phần trăm. 打八折 = bán 80% giá gốc, tức GIẢM 20% — chỗ này rất hay bị hiểu ngược.'),
  K('guahao', '挂', ['排', '取', '写'], '____号', '挂号', 'guà hào', 'lấy số khám bệnh',
    '挂号 là thủ tục đăng ký khám ở bệnh viện Trung Quốc, luôn đi với 挂.'),
  K('xingqu', '感', ['有意思', '喜欢', '爱好'], '对中文很____兴趣', '对……感兴趣', 'gǎn xìngqù', 'có hứng thú với',
    'Kết cấu cố định 对……感兴趣. 有意思 là "thú vị" — nói về SỰ VẬT chứ không nói về người.'),
  K('sanbu', '散', ['走', '行', '跑'], '____步', '散步', 'sàn bù', 'đi dạo',
    '散步 là đi dạo thong thả. 跑步 là chạy bộ — cùng chữ 步 nhưng khác hẳn.'),
  K('dayin', '打印', ['印刷', '复印', '写下'], '____文件', '打印文件', 'dǎyìn wénjiàn', 'in tài liệu',
    '打印 là in từ máy tính ra. 复印 là photo lại bản có sẵn, 印刷 là in ấn công nghiệp.'),
  K('huodong', '举办', ['打开', '建立', '表演'], '____活动', '举办活动', 'jǔbàn huódòng', 'tổ chức hoạt động',
    '举办 · 举行 + 活动 · 比赛 · 婚礼. 建立 đi với 关系 · 公司.'),
  K('chenggong', '取得', ['拿到', '收到', '获取'], '____成功', '取得成功', 'qǔdé chénggōng', 'đạt được thành công',
    '取得 + 成功 · 成绩 · 进步 — thứ vô hình do nỗ lực mà có. 收到 là nhận được vật gì người khác gửi.'),
  K('jineng', '掌握', ['拿住', '抓住', '握住'], '____技能', '掌握技能', 'zhǎngwò jìnéng', 'nắm vững kỹ năng',
    '掌握 + 技能 · 知识 · 方法. Ba từ kia đều là cầm nắm bằng tay thật.'),
  K('zuoyong', '起', ['做', '打', '生'], '____作用', '起作用', 'qǐ zuòyòng', 'có tác dụng',
    '起作用 · 起床 · 起飞 — 起 trong các cụm này là "phát sinh, bắt đầu có".'),
  K('tiaojian', '符合', ['适合', '合适', '一样'], '____条件', '符合条件', 'fúhé tiáojiàn', 'phù hợp điều kiện',
    '符合 + 条件 · 要求 · 标准 (đúng với chuẩn đã đặt ra). 合适 là tính từ, không mang tân ngữ.'),
  K('anpai', '安排', ['整理', '收拾', '排列'], '____时间', '安排时间', 'ānpái shíjiān', 'sắp xếp thời gian',
    '安排 là bố trí việc/lịch. 收拾 · 整理 là dọn dẹp đồ vật thật.'),
  K('zhuajin', '抓紧', ['拿紧', '握紧', '赶紧'], '____时间', '抓紧时间', 'zhuājǐn shíjiān', 'tranh thủ thời gian',
    '抓紧时间 = tranh thủ, khẩn trương. 赶紧 là phó từ, không đứng trước 时间 làm động từ được.'),
  K('weisheng', '打扫', ['收拾', '整理', '打扮'], '____卫生', '打扫卫生', 'dǎsǎo wèishēng', 'làm vệ sinh',
    '打扫 + 卫生 · 房间 · 教室. 打扮 là trang điểm cho người.'),
  K('ganqing', '增进', ['增加', '提高', '长大'], '____感情', '增进感情', 'zēngjìn gǎnqíng', 'tăng thêm tình cảm',
    '增进 + 感情 · 了解 · 友谊 — thứ trừu tượng giữa người với người. 增加 dùng cho cái đếm được.'),
  K('gangqin', '弹', ['打', '踢', '拉'], '____钢琴', '弹钢琴', 'tán gāngqín', 'chơi piano',
    'Mỗi nhạc cụ có động từ riêng: 弹钢琴 · 拉小提琴 · 打鼓 · 吹笛子.'),
  K('zuqiu', '踢', ['打', '弹', '拉'], '____足球', '踢足球', 'tī zúqiú', 'đá bóng',
    'Bóng dùng chân thì 踢, dùng tay thì 打: 踢足球 nhưng 打篮球 · 打乒乓球.'),
  K('lanqiu', '打', ['踢', '弹', '拉'], '____篮球', '打篮球', 'dǎ lánqiú', 'chơi bóng rổ',
    'Cùng là bóng nhưng bóng rổ dùng tay nên là 打, không phải 踢.'),
  K('bowuguan', '参观', ['访问', '看望', '拜访'], '____博物馆', '参观博物馆', 'cānguān bówùguǎn', 'tham quan bảo tàng',
    '参观 dùng cho NƠI CHỐN (博物馆 · 工厂 · 学校). 拜访 · 看望 dùng cho NGƯỜI.'),
  K('laoshi', '拜访', ['参观', '游览', '旅游'], '____老师', '拜访老师', 'bàifǎng lǎoshī', 'đến thăm thầy cô',
    'Ngược với câu trên: đối tượng là người thì 拜访 · 看望, không dùng 参观.'),
  K('xingli', '收拾', ['打扫', '整齐', '干净'], '____行李', '收拾行李', 'shōushi xíngli', 'soạn hành lý',
    '收拾 là xếp đồ vào chỗ của nó. 整齐 · 干净 là tính từ, không mang tân ngữ.'),
  K('kunnan', '遇到', ['看到', '找到', '得到'], '____困难', '遇到困难', 'yùdào kùnnan', 'gặp khó khăn',
    '遇到 là gặp phải điều không hẹn trước (困难 · 问题 · 麻烦). 得到 là nhận được thứ mình muốn.'),
];

const F = (
  id: string,
  parts: [string, string, string, string],
  bad: number,
  right: string,
  pin: string,
  vi: string,
  why: string,
): FixItem => ({ id: 'x:' + id, parts, bad, right, pin, vi, why, t: 'Tổng hợp' });

/** 36 câu sai — mỗi câu một lỗi kinh điển của người Việt học tiếng Trung. */
export const FIXES: FixItem[] = [
  F('ba-neg', ['我', '把作业', '没', '做完。'], 2, '我没把作业做完。', 'Wǒ méi bǎ zuòyè zuò wán.',
    'Tôi chưa làm xong bài tập.',
    'Trong câu 把, phủ định 没 / 不 phải đứng TRƯỚC 把, không được chen vào giữa 把 và động từ.'),
  F('le-habit', ['我', '每天', '喝了', '一杯咖啡。'], 2, '我每天喝一杯咖啡。', 'Wǒ měi tiān hē yì bēi kāfēi.',
    'Mỗi ngày tôi uống một ly cà phê.',
    '了 đánh dấu một việc đã hoàn tất một lần. Đi với 每天 (thói quen lặp lại) thì không dùng 了.'),
  F('de-adv', ['他', '跑', '的', '很快。'], 2, '他跑得很快。', 'Tā pǎo de hěn kuài.', 'Anh ấy chạy rất nhanh.',
    'Bổ ngữ trạng thái sau động từ dùng 得. 的 dùng để nối định ngữ với danh từ (我的书).'),
  F('de-di', ['他', '高兴', '的', '说了一句。'], 2, '他高兴地说了一句。', 'Tā gāoxìng de shuō le yí jù.',
    'Anh ấy vui vẻ nói một câu.',
    'Trạng ngữ đứng trước động từ dùng 地. Ba chữ này đọc giống nhau nhưng vị trí khác hẳn: 的 + danh từ, 地 + động từ, 得 sau động từ.'),
  F('time-pos', ['我', '去中国', '明年', '学习。'], 2, '我明年去中国学习。', 'Wǒ míngnián qù Zhōngguó xuéxí.',
    'Sang năm tôi đi Trung Quốc học.',
    'Từ chỉ thời gian đứng TRƯỚC động từ, không đứng sau như tiếng Việt.'),
  F('place-pos', ['他', '每天', '工作', '在银行。'], 3, '他每天在银行工作。', 'Tā měi tiān zài yínháng gōngzuò.',
    'Hằng ngày anh ấy làm việc ở ngân hàng.',
    'Cụm 在 + nơi chốn đứng TRƯỚC động từ. Tiếng Việt nói "làm việc ở ngân hàng", tiếng Trung nói "ở ngân hàng làm việc".'),
  F('mw-book', ['我', '买了', '一个', '书。'], 2, '我买了一本书。', 'Wǒ mǎi le yì běn shū.', 'Tôi mua một quyển sách.',
    'Sách dùng lượng từ 本. 个 không phải lượng từ vạn năng — 一本书 · 一件事 · 一条路 · 一张纸.'),
  F('bi-hen', ['他', '比我', '很', '高。'], 2, '他比我高得多。', 'Tā bǐ wǒ gāo de duō.', 'Anh ấy cao hơn tôi nhiều.',
    'Câu so sánh 比 không dùng 很 · 非常 · 特别. Muốn nhấn mạnh thì thêm 得多 · 多了 · 一点儿 vào SAU tính từ.'),
  F('youdianr', ['今天', '一点儿', '冷,', '多穿点吧。'], 1, '今天有点儿冷，多穿点吧。', 'Jīntiān yǒudiǎnr lěng.',
    'Hôm nay hơi lạnh, mặc thêm chút đi.',
    '有点儿 + tính từ, đứng TRƯỚC, mang ý than phiền. 一点儿 đứng SAU tính từ để so sánh: 冷一点儿.'),
  F('zai-you', ['昨天', '他', '再', '来了一次。'], 2, '昨天他又来了一次。', 'Zuótiān tā yòu lái le yí cì.',
    'Hôm qua anh ấy lại đến một lần nữa.',
    'Việc đã xảy ra rồi lặp lại dùng 又. 再 dành cho việc CHƯA xảy ra: 明天再来.'),
  F('yinwei-suoyi', ['因为', '下雨,', '但是', '我没去。'], 2, '因为下雨，所以我没去。', 'Yīnwèi xià yǔ, suǒyǐ wǒ méi qù.',
    'Vì trời mưa nên tôi không đi.',
    '因为 đi cặp với 所以. Cặp 虽然……但是 mới là cặp nhượng bộ.'),
  F('suiran-danshi', ['虽然', '他很努力,', '所以', '没考好。'], 2, '虽然他很努力，但是没考好。',
    'Suīrán tā hěn nǔlì, dànshì méi kǎo hǎo.', 'Tuy anh ấy rất cố gắng nhưng thi không tốt.',
    '虽然 đi cặp với 但是 · 可是. Dùng 所以 là đảo ngược ý câu.'),
  F('hui-neng', ['我', '能', '说汉语,', '但说得不好。'], 1, '我会说汉语，但说得不好。', 'Wǒ huì shuō Hànyǔ.',
    'Tôi biết nói tiếng Trung nhưng nói không hay.',
    'Kỹ năng học mà biết thì dùng 会. 能 nói về khả năng/điều kiện lúc đó: 我今天不能来.'),
  F('ba-bare', ['我', '把', '那本书', '看。'], 3, '我把那本书看完了。', 'Wǒ bǎ nà běn shū kàn wán le.',
    'Tôi đã đọc xong quyển sách đó.',
    'Động từ trong câu 把 không được đứng trơ trọi — phải có 了 · 完 · 好 hoặc bổ ngữ phía sau, vì 把 nhấn mạnh KẾT QUẢ xử lý.'),
  F('shide', ['他', '是', '昨天', '来。'], 3, '他是昨天来的。', 'Tā shì zuótiān lái de.', 'Anh ấy đến hôm qua đấy.',
    'Kết cấu 是……的 nhấn mạnh thời gian/nơi chốn/cách thức của việc đã xảy ra — thiếu 的 là câu cụt.'),
  F('liang-er', ['我', '有', '二', '个哥哥。'], 2, '我有两个哥哥。', 'Wǒ yǒu liǎng ge gēge.', 'Tôi có hai anh trai.',
    'Đứng trước lượng từ thì dùng 两, không dùng 二. 二 chỉ dùng khi đếm số hoặc trong số nhiều chữ số (十二).'),
  F('duration', ['我', '学了', '汉语', '两年。'], 3, '我学了两年汉语。', 'Wǒ xué le liǎng nián Hànyǔ.',
    'Tôi học tiếng Trung hai năm rồi.',
    'Bổ ngữ thời lượng chen vào GIỮA động từ và tân ngữ, không đứng cuối câu như tiếng Việt.'),
  F('meiyou-le', ['我', '没有', '去过', '长城了。'], 3, '我没有去过长城。', 'Wǒ méiyǒu qù guo Chángchéng.',
    'Tôi chưa từng đi Vạn Lý Trường Thành.',
    '没有 và 了 không đứng chung trong một câu — 了 báo việc đã xong, 没有 báo việc chưa xảy ra.'),
  F('tai-le', ['这件衣服', '太', '贵,', '我不买了。'], 1, '这件衣服太贵了，我不买了。', 'Zhè jiàn yīfu tài guì le.',
    'Cái áo này đắt quá, tôi không mua nữa.',
    '太 hầu như luôn đi kèm 了 ở cuối vế: 太贵了 · 太好了 · 太累了.'),
  F('bei-result', ['房间', '被', '他', '打扫。'], 3, '房间被他打扫干净了。', 'Fángjiān bèi tā dǎsǎo gānjìng le.',
    'Căn phòng đã được anh ấy dọn sạch.',
    'Câu 被 cũng như câu 把: động từ phải có kết quả đi kèm (干净了 · 完了 · 走了).'),
  F('qichuang-le', ['我', '每天', '六点', '起床了。'], 3, '我每天六点起床。', 'Wǒ měi tiān liù diǎn qǐ chuáng.',
    'Hằng ngày tôi dậy lúc sáu giờ.',
    'Lại là 了 với thói quen. 每天 · 常常 · 总是 đều không đi với 了.'),
  F('jile', ['这个', '电影', '很', '有意思极了。'], 2, '这个电影有意思极了。', 'Zhège diànyǐng yǒu yìsi jí le.',
    'Bộ phim này thú vị cực kỳ.',
    '极了 đã là mức cao nhất rồi, không chồng thêm 很 · 非常 nữa.'),
  F('zhengzai', ['他', '正在', '看书', '着。'], 3, '他正在看书呢。', 'Tā zhèngzài kàn shū ne.',
    'Anh ấy đang đọc sách.',
    'Kết cấu là 正在……呢. 着 dùng cho trạng thái kéo dài (门开着), không dùng chung với 正在 + tân ngữ.'),
  F('kuaiyao', ['火车', '快要', '开,', '我们快跑!'], 1, '火车快要开了，我们快跑！', 'Huǒchē kuàiyào kāi le.',
    'Tàu sắp chạy rồi, chạy nhanh lên!',
    '快要……了 · 就要……了 luôn có 了 đóng cuối. Thiếu 了 là thiếu nửa kết cấu.'),
  F('jianmian', ['我', '见面', '了', '他。'], 3, '我跟他见面了。', 'Wǒ gēn tā jiàn miàn le.', 'Tôi đã gặp anh ấy.',
    '见面 là 离合词 (bản thân đã có tân ngữ 面), không mang thêm tân ngữ. Người phải đi với 跟/和 đứng trước.'),
  F('jiehun', ['他', '结婚', '了', '我的同事。'], 3, '他跟我的同事结婚了。', 'Tā gēn wǒ de tóngshì jié hūn le.',
    'Anh ấy cưới đồng nghiệp của tôi.',
    'Cùng lỗi 离合词: 结婚 · 帮忙 · 聊天 · 毕业 đều không mang tân ngữ trực tiếp.'),
  F('biye', ['他', '毕业', '了', '北京大学。'], 3, '他从北京大学毕业了。', 'Tā cóng Běijīng Dàxué bì yè le.',
    'Anh ấy tốt nghiệp Đại học Bắc Kinh.',
    '毕业 cũng là 离合词. Trường học phải đi với 从……毕业.'),
  F('yijing', ['我', '已经', '吃', '饭。'], 2, '我已经吃过饭了。', 'Wǒ yǐjīng chī guo fàn le.', 'Tôi ăn cơm rồi.',
    '已经 gần như luôn kéo theo 了 ở cuối câu, thường kèm 过 khi nói về việc đã trải qua.'),
  F('de-neg', ['他', '汉语', '说', '不得好。'], 3, '他汉语说得不好。', 'Tā Hànyǔ shuō de bù hǎo.',
    'Anh ấy nói tiếng Trung không hay.',
    'Phủ định của bổ ngữ trạng thái là 得不…, không phải 不得…: 说得不好 · 跑得不快 · 睡得不早.'),
  F('budan', ['他', '不但', '会说英语,', '但是也会说法语。'], 3, '他不但会说英语，而且还会说法语。',
    'Tā búdàn huì shuō Yīngyǔ, érqiě hái huì shuō Fǎyǔ.', 'Anh ấy không những biết tiếng Anh mà còn biết tiếng Pháp.',
    '不但 đi cặp với 而且 · 还 · 也 (ý thêm vào). 但是 là ý ngược lại — dùng vào đây là bẻ gãy logic câu.'),
  F('name-order', ['你', '想', '什么时候', '去中国吗?'], 3, '你想什么时候去中国？', 'Nǐ xiǎng shénme shíhou qù Zhōngguó?',
    'Bạn muốn đi Trung Quốc khi nào?',
    'Câu đã có từ để hỏi (什么时候 · 谁 · 哪儿) thì không thêm 吗 nữa — một câu chỉ hỏi bằng một cách.'),
  F('yuelaiyue', ['天气', '越', '冷', '了。'], 1, '天气越来越冷了。', 'Tiānqì yuè lái yuè lěng le.',
    'Trời càng ngày càng lạnh.',
    '越来越 là kết cấu ba chữ liền, không rút gọn thành 越 được. 越……越…… lại cần hai vế: 越吃越想吃.'),
  F('gen-dui', ['老师', '跟', '我们', '很好。'], 1, '老师对我们很好。', 'Lǎoshī duì wǒmen hěn hǎo.',
    'Thầy giáo rất tốt với chúng tôi.',
    '跟 dùng khi hai bên cùng làm (跟他说话). Còn thái độ hướng về ai thì dùng 对: 对……好 · 对……感兴趣.'),
  F('cai-jiu', ['他', '八点', '就来,', '迟到了半小时。'], 2, '他八点才来，迟到了半小时。', 'Tā bā diǎn cái lái.',
    'Tám giờ anh ấy mới đến, muộn nửa tiếng.',
    '就 là "sớm hơn mong đợi", 才 là "muộn hơn mong đợi". Câu nói về việc đến muộn thì phải dùng 才.'),
  F('zhengli', ['请', '把这些材料', '整理', '一整齐。'], 3, '请把这些材料整理整齐。', 'Qǐng bǎ zhèxiē cáiliào zhěnglǐ zhěngqí.',
    'Xin hãy sắp xếp mấy tài liệu này cho gọn.',
    'Bổ ngữ kết quả gắn thẳng vào động từ, không chen 一 vào giữa.'),
  F('dou-duo', ['我们班', '的学生', '都', '很多。'], 2, '我们班的学生很多。', 'Wǒmen bān de xuésheng hěn duō.',
    'Lớp tôi có rất nhiều học sinh.',
    '都 nghĩa là "từng người đều…", nên không đi với 多 · 少 vốn nói về TỔNG THỂ. Nói 学生都很多 là nói "mỗi học sinh đều nhiều".'),
];
