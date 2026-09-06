import type { FillGroup, OrderItem, QaItem } from '../engine/exam';
import type { Confusable } from './extra';
import type { Collocation } from './drills';
import type { Grammar, Vocab } from './types';

/**
 * Đợt CHỮA ĐỀ #1 — dựng từ bài thi thử ngày 06/09/2026 (phần đọc, câu 46–85).
 *
 * Khác mọi đợt trước ở chỗ chọn nội dung: ba đợt `extraN.ts` thêm từ theo chủ đề, còn
 * đợt này không thêm từ mới nào cả — nó chỉ vá đúng những chỗ bài thi vừa chỉ ra.
 * Mười hai câu sai của bài đó không rải đều: chúng dồn vào ba ổ.
 *
 *  1. **选词填空 — chọn nhầm giữa hai từ, và nhầm CHÉO** (6/10 câu sai). Câu 48 điền 尝
 *     vào chỗ của 提醒, câu 49 điền 提醒 vào chỗ của 尝; câu 51 điền 反映 vào chỗ của
 *     肯定, câu 52 điền 肯定 vào chỗ của 反映. Nhầm chéo nghĩa là cả hai từ đều đã "gần
 *     đúng" trong đầu — không thiếu từ, mà thiếu ĐƯỜNG BIÊN giữa hai từ. Thuốc cho
 *     bệnh này là vòng ⚔️ Cặp Dễ Nhầm chứ không phải học lại thẻ từ vựng.
 *  2. **排列顺序 — không đọc dấu hiệu liên từ** (4/10 câu sai). Cả bốn câu sai đều là
 *     câu có cặp liên từ: 不仅仅…而且…, 因为…所以…就…, 无论…还是…都…. Ba mảnh xếp sai
 *     vì đọc theo nghĩa thay vì bám vào chữ nối.
 *  3. **阅读第三部分 — bỏ qua chỗ bẻ ý** (3/20 câu sai). Câu 74 lấy ý ở vế 以前 thay vì
 *     vế sau 然而; câu 76 hỏi "vì sao" mà không bám vế 因为.
 *
 * Nội dung ở đây đổ thẳng vào các vòng chơi đã có (Cặp Dễ Nhầm, Ngữ pháp & Đọc, Kết
 * Hợp Từ) và vào kho đề (阅读第一/二/三部分), nên không cần màn hình mới.
 *
 * Chủ đề `WEAK1_TOPIC` cố tình KHÔNG có từ vựng nào: chủ đề không có chip thì
 * `matchTopic` để mặc định bật, tức nội dung này luôn nằm trong mọi buổi luyện, mà
 * vẫn tra ngược được về gốc là bài thi nào.
 *
 * Thêm mục vào đây xong PHẢI thu lại giọng (`node tools/tts/collect.mjs` rồi
 * `tools/tts/render.py`) — `src/data/tts.test.ts` chặn chuyện quên.
 */
export const WEAK1_TOPIC = 'Chữa đề · 06-09';

/**
 * Chủ đề của mười từ thêm mới — chủ đề NÀY có chip, vì nó có từ vựng.
 *
 * Mười từ đều rút ra từ chính bài thi: hoặc là từ điền sai, hoặc là từ đứng bên kia
 * một cặp dễ nhầm (跟着 của 随着, 答应 của 允许). Deck cũ không có từ nào trong số đó,
 * nên mọi vòng luyện trước giờ chưa từng hỏi tới chúng lần nào.
 */
export const WEAK1_WORD_TOPIC = 'Chữa đề · 10 từ điền sai';

export const WEAK1_VOCAB: Vocab[] = [
  {
    h: '反映',
    p: 'fǎnyìng',
    pos: 'Động từ',
    m: 'phản ánh, nêu lên (với cấp trên)',
    t: WEAK1_WORD_TOPIC,
    ex: '大家反映了不少管理上的问题。',
    exVi: 'Mọi người đã nêu lên không ít vấn đề trong quản lý.',
  },
  {
    h: '反应',
    p: 'fǎnyìng',
    pos: 'Danh từ · Động từ',
    m: 'phản ứng',
    t: WEAK1_WORD_TOPIC,
    ex: '他听到这个消息以后一点儿反应也没有。',
    exVi: 'Nghe tin đó xong anh ấy chẳng có phản ứng gì.',
  },
  {
    h: '保持',
    p: 'bǎochí',
    pos: 'Động từ',
    m: 'giữ, duy trì (một trạng thái)',
    t: WEAK1_WORD_TOPIC,
    ex: '图书馆里请大家保持安静。',
    exVi: 'Trong thư viện xin mọi người giữ yên lặng.',
  },
  {
    h: '而且',
    p: 'érqiě',
    pos: 'Liên từ',
    m: 'mà còn, hơn nữa',
    t: WEAK1_WORD_TOPIC,
    ex: '这里的菜很好吃，而且价格也不贵。',
    exVi: 'Món ở đây ngon, mà giá cũng không đắt.',
  },
  {
    h: '春节',
    p: 'chūnjié',
    pos: 'Danh từ',
    m: 'Tết Nguyên Đán',
    t: WEAK1_WORD_TOPIC,
    ex: '离春节还有一段时间，不少人已经开始准备了。',
    exVi: 'Còn một khoảng nữa mới tới Tết, nhiều người đã bắt đầu chuẩn bị.',
  },
  {
    h: '反而',
    p: "fǎn'ér",
    pos: 'Phó từ',
    m: 'ngược lại còn',
    t: WEAK1_WORD_TOPIC,
    ex: '方向错了，越努力反而离目标越远。',
    exVi: 'Sai hướng thì càng cố lại càng xa mục tiêu.',
  },
  {
    h: '免得',
    p: 'miǎnde',
    pos: 'Liên từ',
    m: 'kẻo, để khỏi',
    t: WEAK1_WORD_TOPIC,
    ex: '最好提前出发，免得路上堵车来不及。',
    exVi: 'Tốt nhất đi sớm, kẻo tắc đường không kịp.',
  },
  {
    h: '代替',
    p: 'dàitì',
    pos: 'Động từ',
    m: 'thay, thay thế',
    t: WEAK1_WORD_TOPIC,
    ex: '这次会议由我代替经理参加。',
    exVi: 'Cuộc họp lần này tôi đi thay giám đốc.',
  },
  {
    h: '跟着',
    p: 'gēnzhe',
    pos: 'Động từ',
    m: 'đi theo (sau ai đó)',
    t: WEAK1_WORD_TOPIC,
    ex: '孩子们跟着老师走进了教室。',
    exVi: 'Bọn trẻ theo cô giáo đi vào lớp.',
  },
  {
    h: '答应',
    p: 'dāying',
    pos: 'Động từ',
    m: 'nhận lời, đồng ý',
    t: WEAK1_WORD_TOPIC,
    ex: '他答应得很爽快，然而到现在也没做。',
    exVi: 'Anh ấy nhận lời rất dứt khoát, nhưng đến giờ vẫn chưa làm.',
  },
];

/** Mẹo nhớ cho mười từ trên — từ công cụ mà chỉ có nghĩa trơ thì không nhớ nổi. */
export const WEAK1_STORIES: Record<string, string> = {
  反映: '«Phản ánh» — như gương hắt lại. Luôn có tân ngữ: 反映问题 · 反映情况 · 反映意见.',
  反应: '«Phản ứng» — cùng âm fǎnyìng với 反映 nhưng làm DANH TỪ: 反应快 · 有反应.',
  保持: '«Bảo trì» — giữ nguyên cái đang có. Sau nó là TRẠNG THÁI: 安静 · 健康 · 联系.',
  而且: '«Nhi thả» — nối thêm một ý cùng chiều. Hay đi cặp: 不但/不仅…而且…',
  春节: '«Xuân tiết» — cái Tết của mùa xuân, tức Tết Nguyên Đán. 过年 là cách nói khẩu ngữ.',
  反而: '«Phản nhi» — kết quả quay ngược lại lẽ thường. Ba chữ 反 dễ lẫn: 反而 · 反正 · 反映.',
  免得: 'Miễn (免) cho khỏi phải (得) chịu chuyện xấu → kẻo. Luôn nằm ở vế sau.',
  代替: '«Đại thế» — y hệt tiếng Việt "thay thế". 代 là thay mặt, 替 cũng là thay.',
  跟着: '跟 là gót chân — bám gót ai mà đi. Có người đi trước thì mới có 跟着.',
  答应: 'Đáp (答) lại một tiếng (应) → nhận lời. Phải có người xin thì mới có người 答应.',
};

/* -- ⚔️ Cặp Dễ Nhầm ---------------------------------------------------------
 * Mỗi cặp được cho HAI câu, một câu cho mỗi từ. Chỉ luyện chiều "chỗ này điền
 * 提醒" thì vẫn nhầm chéo như cũ, vì chưa bao giờ phải trả lời câu hỏi ngược lại:
 * vậy còn 尝 thì đi vào đâu.
 */
export const WEAK1_CONFUSABLES: Confusable[] = [
  {
    id: 'c:w1',
    pair: ['随着', '跟着'],
    sent: '人们的心情会____天气的变化而变化。',
    a: '随着',
    full: '人们的心情会随着天气的变化而变化。',
    pin: 'Rénmen de xīnqíng huì suízhe tiānqì de biànhuà ér biànhuà.',
    vi: 'Tâm trạng con người thay đổi theo sự thay đổi của thời tiết.',
    why: '随着 đi với QUÁ TRÌNH (变化 · 发展 · 时间), và khung của nó là 随着…而… — thấy chữ 而 phía sau là chốt. 跟着 tả chuyện bám sau một người/vật cụ thể mà đi, không vào được khung này.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w2',
    pair: ['随着', '跟着'],
    sent: '孩子们____老师走进了教室。',
    a: '跟着',
    full: '孩子们跟着老师走进了教室。',
    pin: 'Háizimen gēnzhe lǎoshī zǒujìn le jiàoshì.',
    vi: 'Bọn trẻ theo cô giáo đi vào lớp.',
    why: 'Chiều ngược lại: có người đi trước và người đi sau thì là 跟着 + NGƯỜI. 随着 không tả chuyện đi lại cụ thể, nó chỉ nối hai sự thay đổi với nhau.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w3',
    pair: ['坚持', '保持'],
    sent: '他____每天早上跑三公里。',
    a: '坚持',
    full: '他坚持每天早上跑三公里。',
    pin: 'Tā jiānchí měitiān zǎoshang pǎo sān gōnglǐ.',
    vi: 'Anh ấy kiên trì mỗi sáng chạy ba cây số.',
    why: '坚持 + VIỆC LÀM lặp đi lặp lại, nhấn ý "làm mãi không bỏ". 保持 đứng trước một TRẠNG THÁI muốn giữ nguyên, không đứng trước một việc làm hằng ngày.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w4',
    pair: ['坚持', '保持'],
    sent: '图书馆里请大家____安静。',
    a: '保持',
    full: '图书馆里请大家保持安静。',
    pin: 'Túshūguǎn lǐ qǐng dàjiā bǎochí ānjìng.',
    vi: 'Trong thư viện xin mọi người giữ yên lặng.',
    why: '安静 · 健康 · 联系 · 距离 đều là trạng thái → 保持. 坚持安静 nghe thành "cố chịu đựng sự im lặng", lệch hẳn ý.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w5',
    pair: ['提醒', '通知'],
    sent: '明天可能下雨，你记得____儿子带雨伞。',
    a: '提醒',
    full: '明天可能下雨，你记得提醒儿子带雨伞。',
    pin: 'Míngtiān kěnéng xiàyǔ, nǐ jìde tíxǐng érzi dài yǔsǎn.',
    vi: 'Mai có thể mưa, nhớ nhắc con mang ô.',
    why: '提醒 = nhắc lại điều người kia VỐN ĐÃ BIẾT nhưng dễ quên, thường giữa hai người thân. 通知 là báo tin chính thức, phải có tin mới và thường từ cơ quan tới nhiều người.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w6',
    pair: ['提醒', '通知'],
    sent: '公司已经____大家明天不用来上班了。',
    a: '通知',
    full: '公司已经通知大家明天不用来上班了。',
    pin: 'Gōngsī yǐjīng tōngzhī dàjiā míngtiān bú yòng lái shàngbān le.',
    vi: 'Công ty đã thông báo mai mọi người không phải đến làm.',
    why: 'Chiều ngược lại: tin MỚI, người báo là tổ chức, người nhận là số đông → 通知. 提醒 không dùng khi người nghe chưa hề biết chuyện.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w7',
    pair: ['尝', '试'],
    sent: '这是你做的饺子？真香！我先____一个。',
    a: '尝',
    full: '这是你做的饺子？真香！我先尝一个。',
    pin: 'Zhè shì nǐ zuò de jiǎozi? Zhēn xiāng! Wǒ xiān cháng yí ge.',
    vi: 'Sủi cảo cậu làm à? Thơm quá! Tớ nếm một cái trước.',
    why: '尝 chỉ dùng cho ĐỒ ĂN THỨC UỐNG — đưa vào miệng xem vị thế nào. Dấu hiệu ngay trong câu: 香 · 好吃 · 味道. 试 không nói được về vị.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w8',
    pair: ['尝', '试'],
    sent: '这件衣服你____一下再决定买不买。',
    a: '试',
    full: '这件衣服你试一下再决定买不买。',
    pin: 'Zhè jiàn yīfu nǐ shì yíxià zài juédìng mǎi bu mǎi.',
    vi: 'Bộ này bạn thử một chút rồi hãy quyết định mua hay không.',
    why: 'Chiều ngược lại: thử MẶC, thử LÀM, thử DÙNG đều là 试 (试衣服 · 试试看). 尝 chỉ nằm trong chuyện ăn uống.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w9',
    pair: ['反映', '反应'],
    sent: '讨论会上大家____了不少管理过程中出现的问题。',
    a: '反映',
    full: '讨论会上大家反映了不少管理过程中出现的问题。',
    pin: 'Tǎolùnhuì shàng dàjiā fǎnyìng le bù shǎo guǎnlǐ guòchéng zhōng chūxiàn de wèntí.',
    vi: 'Trong buổi thảo luận mọi người đã phản ánh không ít vấn đề nảy sinh trong quản lý.',
    why: '反映 là ĐỘNG TỪ có tân ngữ: 反映问题 · 反映情况 · 反映意见 — chuyển thông tin lên trên. 反应 không mang được 问题.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w10',
    pair: ['反映', '反应'],
    sent: '他听到这个消息以后一点儿____也没有。',
    a: '反应',
    full: '他听到这个消息以后一点儿反应也没有。',
    pin: 'Tā tīngdào zhège xiāoxi yǐhòu yìdiǎnr fǎnyìng yě méiyǒu.',
    vi: 'Nghe tin đó xong anh ấy chẳng có phản ứng gì.',
    why: 'Chiều ngược lại: chỗ này cần một DANH TỪ (一点儿……也没有) → 反应 (反应快 · 有反应). Hai từ đọc gần như nhau nhưng khác hẳn vai trong câu.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w11',
    pair: ['肯定', '一定'],
    sent: '经理在会上____了大家这段时间的努力。',
    a: '肯定',
    full: '经理在会上肯定了大家这段时间的努力。',
    pin: 'Jīnglǐ zài huì shàng kěndìng le dàjiā zhè duàn shíjiān de nǔlì.',
    vi: 'Giám đốc đã ghi nhận nỗ lực của mọi người thời gian qua trong cuộc họp.',
    why: '肯定 có HAI vai: phó từ "chắc chắn" (他肯定会来) và động từ "công nhận, ghi nhận" — 肯定+成绩/努力/作用, có 了 và có tân ngữ. 一定 chỉ làm phó từ, không mang tân ngữ được.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w12',
    pair: ['肯定', '一定'],
    sent: '你明天____要来啊，别忘了！',
    a: '一定',
    full: '你明天一定要来啊，别忘了！',
    pin: 'Nǐ míngtiān yídìng yào lái a, bié wàng le!',
    vi: 'Mai cậu nhất định phải đến đấy, đừng quên!',
    why: 'Chiều ngược lại: dặn dò, yêu cầu người khác → 一定要 · 一定别. 肯定 chỉ nói lên suy đoán chắc chắn của CHÍNH người nói, không dùng để dặn ai.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w13',
    pair: ['然而', '而且'],
    sent: '他答应得很爽快，____到现在也没做。',
    a: '然而',
    full: '他答应得很爽快，然而到现在也没做。',
    pin: 'Tā dāying de hěn shuǎngkuai, rán\'ér dào xiànzài yě méi zuò.',
    vi: 'Anh ấy nhận lời rất dứt khoát, nhưng đến giờ vẫn chưa làm.',
    why: '然而 = 但是 của văn viết: bẻ NGƯỢC ý phía trước. 而且 nối thêm một ý CÙNG chiều — hứa nhanh "mà còn" chưa làm thì vô lý.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w14',
    pair: ['允许', '答应'],
    sent: '这个网站____别人看你写的日记。',
    a: '允许',
    full: '这个网站允许别人看你写的日记。',
    pin: 'Zhège wǎngzhàn yǔnxǔ biérén kàn nǐ xiě de rìjì.',
    vi: 'Trang web này cho phép người khác đọc nhật ký bạn viết.',
    why: '允许 = cho phép, chủ thể là bên có QUYỀN (quy định, nhà trường, hệ thống) và không cần người nghe. 答应 là nhận lời với một người cụ thể, phải có ai đó đứng ra xin.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w15',
    pair: ['值得', '应该'],
    sent: '无论从价格还是质量上看，这种盒子都____考虑。',
    a: '值得',
    full: '无论从价格还是质量上看，这种盒子都值得考虑。',
    pin: 'Wúlùn cóng jiàgé háishì zhìliàng shàng kàn, zhè zhǒng hézi dōu zhídé kǎolǜ.',
    vi: 'Dù xét giá hay chất lượng, loại hộp này đều đáng cân nhắc.',
    why: '值得 + việc = "đáng để…", nói về được–mất sau khi cân đo. 应该 nói về nghĩa vụ, không hợp với một câu đang so giá với chất lượng.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'c:w16',
    pair: ['收拾', '打扫'],
    sent: '一会儿有客人要来，快把桌上的书和衣服____一下。',
    a: '收拾',
    full: '一会儿有客人要来，快把桌上的书和衣服收拾一下。',
    pin: 'Yíhuìr yǒu kèrén yào lái, kuài bǎ zhuō shàng de shū hé yīfu shōushi yíxià.',
    vi: 'Lát nữa có khách, mau dọn sách với quần áo trên bàn đi.',
    why: '收拾 = cất đồ về chỗ cho GỌN (收拾房间 · 收拾行李 · 收拾东西). 打扫 là quét lau cho SẠCH bụi bẩn — không ai "quét" một chồng sách cả.',
    t: WEAK1_TOPIC,
  },
];

/* -- 📚 Ngữ pháp: đúng những khung câu làm hỏng 排列顺序 --------------------- */
export const WEAK1_GRAMMAR: Grammar[] = [
  {
    id: 'g:w1',
    a: '随着',
    opts: ['随着', '跟着', '按照', '通过'],
    sent: '人们的心情会____天气的变化而变化。',
    full: '人们的心情会随着天气的变化而变化。',
    pin: 'Rénmen de xīnqíng huì suízhe tiānqì de biànhuà ér biànhuà.',
    vi: 'Tâm trạng con người thay đổi theo sự thay đổi của thời tiết.',
    name: 'Cặp 随着…而… — "… theo …"',
    expl: '随着 + DANH TỪ chỉ sự vận động (变化 · 发展 · 时间 · 提高), vế sau bắt buộc có 而 + động từ. Nhìn thấy 而……变化 ở cuối câu là chỗ trống đầu câu gần như chắc chắn điền 随着.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w2',
    a: '而且',
    opts: ['而且', '但是', '因为', '于是'],
    sent: '茶不仅仅是一种饮料，____还是一种文化。',
    full: '茶不仅仅是一种饮料，而且还是一种文化。',
    pin: 'Chá bùjǐnjǐn shì yì zhǒng yǐnliào, érqiě háishì yì zhǒng wénhuà.',
    vi: 'Trà không chỉ là một thức uống, mà còn là một nền văn hoá.',
    name: 'Cặp 不仅仅…而且还… — "không chỉ… mà còn…"',
    expl: 'Hai vế đi CÙNG chiều (đều nâng trà lên), nên không thể là 但是. Trong 排列顺序: mảnh có 不仅(仅) đứng trước, mảnh có 而且/并且 + 还/也 đứng ngay sau nó.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w3',
    a: '无论',
    opts: ['无论', '不但', '尽管', '既然'],
    sent: '____从价格方面看，还是从材料的质量上看，这种盒子都是值得考虑的。',
    full: '无论从价格方面看，还是从材料的质量上看，这种盒子都是值得考虑的。',
    pin: 'Wúlùn cóng jiàgé fāngmiàn kàn, háishì cóng cáiliào de zhìliàng shàng kàn, zhè zhǒng hézi dōu shì zhídé kǎolǜ de.',
    vi: 'Dù xét về giá hay xét về chất lượng vật liệu, loại hộp này đều đáng cân nhắc.',
    name: 'Cặp 无论…还是…，都… — "dù… hay…, đều…"',
    expl: 'Ba mảnh khoá cứng vào nhau: 无论 mở đầu, 还是 ở giữa, và mảnh có 都/也 luôn là mảnh CUỐI vì nó là câu kết luận. Đọc ra chữ 都 là xong bài, không cần hiểu hết nghĩa.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w4',
    a: '所以',
    opts: ['所以', '但是', '虽然', '不过'],
    sent: '因为不同的颜色表示不同的性格，____你喜欢哪种颜色，就说明你是哪种性格的人。',
    full: '因为不同的颜色表示不同的性格，所以你喜欢哪种颜色，就说明你是哪种性格的人。',
    pin: 'Yīnwèi bùtóng de yánsè biǎoshì bùtóng de xìnggé, suǒyǐ nǐ xǐhuan nǎ zhǒng yánsè, jiù shuōmíng nǐ shì nǎ zhǒng xìnggé de rén.',
    vi: 'Vì màu sắc khác nhau thể hiện tính cách khác nhau, nên bạn thích màu nào cũng cho thấy bạn là người tính cách thế nào.',
    name: 'Chuỗi 因为…所以…，就… — lý do luôn đứng TRƯỚC',
    expl: 'Vế 因为 nêu quy luật chung, vế 所以 áp quy luật ấy vào trường hợp cụ thể, mảnh có 就 chốt kết luận. Thứ tự này không đảo được: 就 không bao giờ đứng trước 所以.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w5',
    a: '然而',
    opts: ['然而', '而且', '于是', '因此'],
    sent: '以前，日记是写给自己看的，____现在更多的年轻人愿意让别人看到。',
    full: '以前，日记是写给自己看的，然而现在更多的年轻人愿意让别人看到。',
    pin: 'Yǐqián, rìjì shì xiě gěi zìjǐ kàn de, rán\'ér xiànzài gèng duō de niánqīngrén yuànyì ràng biérén kàn dào.',
    vi: 'Trước kia nhật ký là viết cho mình đọc, tuy nhiên nay càng nhiều người trẻ muốn cho người khác xem.',
    name: 'Liên từ 然而 — "tuy nhiên" (văn viết)',
    expl: '然而 báo rằng ý ĐỨNG SAU mới là ý tác giả. Đề đọc hiểu hỏi "hiện nay thế nào" thì đáp án nằm ở vế sau 然而; lấy ý ở vế 以前 là đúng cái bẫy được gài.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w6',
    a: '免得',
    opts: ['免得', '因为', '无论', '于是'],
    sent: '最好提前半个小时出发，____路上堵车来不及。',
    full: '最好提前半个小时出发，免得路上堵车来不及。',
    pin: 'Zuìhǎo tíqián bàn ge xiǎoshí chūfā, miǎnde lùshang dǔchē láibují.',
    vi: 'Tốt nhất đi sớm nửa tiếng, kẻo tắc đường không kịp.',
    name: 'Liên từ 免得 — "kẻo, để khỏi"',
    expl: '免得 + chuyện XẤU muốn tránh, và luôn nằm ở vế SAU. Cùng luật với 否则 (nếu không thì…): mảnh mở bằng hai từ này không bao giờ là mảnh đầu.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w7',
    a: '于是',
    opts: ['于是', '虽然', '无论', '不但'],
    sent: '这道题我看了半天也没弄懂，____就去问了同桌。',
    full: '这道题我看了半天也没弄懂，于是就去问了同桌。',
    pin: 'Zhè dào tí wǒ kàn le bàntiān yě méi nòng dǒng, yúshì jiù qù wèn le tóngzhuō.',
    vi: 'Bài này tôi nhìn mãi không hiểu, thế là đi hỏi bạn cùng bàn.',
    name: 'Liên từ 于是 — "thế là"',
    expl: '于是 nối VIỆC LÀM tiếp theo sau một tình huống, và vế của nó thường lược luôn chủ ngữ. Hai dấu hiệu ấy cộng lại: mảnh mở bằng 于是 chắc chắn không đứng đầu.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w8',
    a: '反而',
    opts: ['反而', '反正', '反映', '仍然'],
    sent: '如果方向错了，越努力____离目标越远。',
    full: '如果方向错了，越努力反而离目标越远。',
    pin: 'Rúguǒ fāngxiàng cuò le, yuè nǔlì fǎn\'ér lí mùbiāo yuè yuǎn.',
    vi: 'Nếu sai hướng thì càng cố lại càng xa mục tiêu.',
    name: 'Phó từ 反而 — "ngược lại còn"',
    expl: '反而 báo một kết quả NGƯỢC với lẽ thường (cố gắng lẽ ra phải gần đích hơn). Đừng lẫn ba chữ 反: 反而 ngược lại · 反正 đằng nào cũng · 反映 phản ánh.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w9',
    a: '肯定',
    opts: ['肯定', '一定', '必须', '的确'],
    sent: '经理在会上____了大家这段时间的努力。',
    full: '经理在会上肯定了大家这段时间的努力。',
    pin: 'Jīnglǐ zài huì shàng kěndìng le dàjiā zhè duàn shíjiān de nǔlì.',
    vi: 'Giám đốc đã ghi nhận nỗ lực của mọi người thời gian qua trong cuộc họp.',
    name: 'Động từ 肯定 — "khẳng định, ghi nhận"',
    expl: 'Có 了 và có tân ngữ thì chỗ trống phải là ĐỘNG TỪ, mà trong bốn từ này chỉ 肯定 làm được động từ. Vai kia của nó là phó từ: 他肯定会来 = chắc chắn cậu ấy sẽ đến.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'g:w10',
    a: '提醒',
    opts: ['提醒', '提高', '提供', '提前'],
    sent: '明天可能下雨，你记得____儿子带雨伞。',
    full: '明天可能下雨，你记得提醒儿子带雨伞。',
    pin: 'Míngtiān kěnéng xiàyǔ, nǐ jìde tíxǐng érzi dài yǔsǎn.',
    vi: 'Mai có thể mưa, nhớ nhắc con mang ô.',
    name: 'Khung 提醒 + NGƯỜI + việc',
    expl: 'Sau chỗ trống là một NGƯỜI rồi mới đến việc — khung ấy chỉ 提醒 vào được. Cả họ nhà 提 hay bị xếp chung một bảng: 提醒 nhắc · 提高 nâng cao · 提供 cung cấp · 提前 dời sớm.',
    t: WEAK1_TOPIC,
  },
];

/* -- 🧲 Kết Hợp Từ: từ nào đi với danh từ nào ------------------------------- */
export const WEAK1_COLLOCATIONS: Collocation[] = [
  {
    id: 'k:w1',
    a: '反映',
    opts: ['反映', '反应', '表现', '接受'],
    frame: '向公司____情况',
    full: '向公司反映情况',
    pin: 'xiàng gōngsī fǎnyìng qíngkuàng',
    vi: 'phản ánh tình hình lên công ty',
    why: '反映 + 情况 · 问题 · 意见 — đưa thông tin lên trên. 反应 là phản ứng, không mang được 情况; 表现 là thể hiện ra bên ngoài.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'k:w2',
    a: '反应',
    opts: ['反应', '反映', '反正', '反对'],
    frame: '他的____很快',
    full: '他的反应很快',
    pin: 'tā de fǎnyìng hěn kuài',
    vi: 'phản ứng của anh ấy rất nhanh',
    why: 'Sau 他的 phải là DANH TỪ, mà trong nhóm này chỉ 反应 làm danh từ được (有反应 · 反应快). 反映 là động từ, 反正 là phó từ.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'k:w3',
    a: '坚持',
    opts: ['坚持', '保持', '支持', '维持'],
    frame: '____锻炼',
    full: '坚持锻炼',
    pin: 'jiānchí duànliàn',
    vi: 'kiên trì tập luyện',
    why: '坚持 + việc làm lặp lại: 坚持锻炼 · 坚持学习 · 坚持下去. 保持 chỉ đi với trạng thái, không đi với một việc làm.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'k:w4',
    a: '保持',
    opts: ['保持', '坚持', '保护', '保存'],
    frame: '____安静',
    full: '保持安静',
    pin: 'bǎochí ānjìng',
    vi: 'giữ yên lặng',
    why: '保持 + trạng thái: 安静 · 健康 · 联系 · 距离. 保护 là che chở khỏi bị hại, 保存 là cất giữ cho khỏi hỏng.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'k:w5',
    a: '提醒',
    opts: ['提醒', '提高', '提供', '提前'],
    frame: '____他带材料',
    full: '提醒他带材料',
    pin: 'tíxǐng tā dài cáiliào',
    vi: 'nhắc anh ấy mang tài liệu',
    why: 'Chỉ 提醒 nhận được khung "＋ người ＋ việc". 提供 đi với vật (提供帮助 · 提供机会), 提前 đi với thời gian.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'k:w6',
    a: '允许',
    opts: ['允许', '答应', '同意', '接受'],
    frame: '这里不____抽烟',
    full: '这里不允许抽烟',
    pin: 'zhèlǐ bù yǔnxǔ chōuyān',
    vi: 'ở đây không cho phép hút thuốc',
    why: 'Chủ thể là một NƠI/quy định chứ không phải người, nên là 允许. 答应 · 同意 đều cần một người cụ thể đứng ra xin và một người gật đầu.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'k:w7',
    a: '值得',
    opts: ['值得', '应该', '需要', '必须'],
    frame: '____考虑',
    full: '值得考虑',
    pin: 'zhídé kǎolǜ',
    vi: 'đáng để cân nhắc',
    why: '值得 + việc = đáng bỏ công/tiền ra, luôn có ý cân đo được–mất: 值得考虑 · 值得学习 · 值得一去. 应该 · 必须 nói về nghĩa vụ.',
    t: WEAK1_TOPIC,
  },
  {
    id: 'k:w8',
    a: '尝',
    opts: ['尝', '试', '用', '换'],
    frame: '____一口菜',
    full: '尝一口菜',
    pin: 'cháng yì kǒu cài',
    vi: 'nếm một miếng thức ăn',
    why: 'Lượng từ 口 chỉ dùng cho chuyện ăn uống, mà chuyện ăn uống thì động từ là 尝. 试 là thử làm/thử mặc, không đi với 一口.',
    t: WEAK1_TOPIC,
  },
];

/* -- 阅读第一部分: đúng hai bảng từ đã làm hỏng bài, và một bảng "chiều ngược" -- */
export const WEAK1_FILL: FillGroup[] = [
  {
    // Bảng câu 46–50 của chính đề đã làm: 随着 · 尝 · 春节 · 坚持 · 收拾 · 提醒.
    bank: ['①随着', '②尝', '③春节', '④坚持', '⑤收拾', '⑥提醒'],
    items: [
      {
        sent: '（　）科学技术的发展，人们的生活越来越方便了。',
        ans: 0,
        vi: 'Cùng với sự phát triển của khoa học kỹ thuật, cuộc sống ngày càng tiện lợi.',
      },
      { sent: '汤好了，你先（　）一口，看看咸不咸。', ans: 1, vi: 'Canh xong rồi, nếm một miếng xem có mặn không.' },
      {
        sent: '他已经（　）锻炼三年了，一天也没停过。',
        ans: 3,
        vi: 'Anh ấy đã kiên trì tập luyện ba năm, chưa nghỉ ngày nào.',
      },
      { sent: '走之前把桌子上的东西（　）干净。', ans: 4, vi: 'Trước khi đi dọn sạch đồ trên bàn.' },
      { sent: '出门前妈妈又（　）了我一次，让我别忘了带钥匙。', ans: 5, vi: 'Trước khi ra cửa mẹ nhắc tôi thêm lần nữa, đừng quên mang chìa khoá.' },
    ],
  },
  {
    // Bảng câu 51–55 của chính đề: 反映 · 陪 · 温度 · 堵车 · 来得及 · 肯定.
    dialogue: true,
    bank: ['①反映', '②陪', '③温度', '④堵车', '⑤来得及', '⑥肯定'],
    items: [
      {
        sent: 'A：这些瓶子的数量对吧？\nB：我都仔细检查过了，（　）没问题。',
        ans: 5,
        vi: 'A: Số chai này đúng chứ? — B: Tôi kiểm tra kỹ hết rồi, chắc chắn không có vấn đề.',
      },
      {
        sent: 'A：讨论会开得顺利吗？\nB：顺利，大家（　）了不少管理上的问题。',
        ans: 0,
        vi: 'A: Buổi thảo luận thuận lợi chứ? — B: Thuận lợi, mọi người phản ánh khá nhiều vấn đề quản lý.',
      },
      {
        sent: 'A：你怎么现在才到？\nB：路上（　）了半个多小时。',
        ans: 3,
        vi: 'A: Sao giờ cậu mới tới? — B: Trên đường tắc hơn nửa tiếng.',
      },
      {
        sent: 'A：一个人去医院我有点儿紧张。\nB：别怕，明天我（　）你去。',
        ans: 1,
        vi: 'A: Đi viện một mình tôi hơi lo. — B: Đừng sợ, mai tôi đi cùng bạn.',
      },
      {
        sent: 'A：现在出发还（　）吗？\nB：放心，电影八点才开始。',
        ans: 4,
        vi: 'A: Giờ đi còn kịp không? — B: Yên tâm, tám giờ phim mới chiếu.',
      },
    ],
  },
  {
    // Chiều ngược lại của đúng những cặp đã nhầm — chỗ này điền TỪ CÒN LẠI.
    bank: ['①通知', '②反应', '③保持', '④试', '⑤整理', '⑥而且'],
    items: [
      {
        sent: '公司已经（　）大家明天不用来上班了。',
        ans: 0,
        vi: 'Công ty đã thông báo mai mọi người không phải đi làm.',
      },
      { sent: '听到这个消息以后，他一点儿（　）也没有。', ans: 1, vi: 'Nghe tin đó xong anh ấy chẳng có phản ứng gì.' },
      { sent: '运动以后也要（　）好的饮食习惯。', ans: 2, vi: 'Sau khi vận động cũng phải giữ thói quen ăn uống tốt.' },
      { sent: '这双鞋你（　）一下，合适再买。', ans: 3, vi: 'Đôi giày này bạn thử xem, vừa thì hãy mua.' },
      { sent: '开会前我把这些材料重新（　）了一遍。', ans: 4, vi: 'Trước cuộc họp tôi sắp xếp lại đống tài liệu này một lượt.' },
    ],
  },
];

/* -- 阅读第二部分: mọi bài đều xoay quanh MỘT cặp liên từ ------------------- */
export const WEAK1_ORDER: OrderItem[] = [
  {
    parts: ['茶不仅仅是一种饮料', '它在中国有着几千年的历史', '而且还是一种文化'],
    ans: [0, 2, 1],
    vi: 'Trà không chỉ là thức uống, mà còn là một nền văn hoá, nó có lịch sử mấy nghìn năm ở Trung Quốc.',
  },
  {
    parts: ['因为不同的颜色表示不同的性格', '所以你喜欢哪种颜色', '就说明你是哪种性格的人'],
    ans: [0, 1, 2],
    vi: 'Vì màu khác nhau thể hiện tính cách khác nhau, nên bạn thích màu nào cũng cho biết bạn là người thế nào.',
  },
  {
    parts: ['因为工作的需要', '对当地的文化有一些简单的了解', '所以我去过那里几次'],
    ans: [0, 2, 1],
    vi: 'Vì nhu cầu công việc nên tôi đã tới đó mấy lần, hiểu sơ qua văn hoá địa phương.',
  },
  {
    parts: ['还是从材料的质量上看', '无论从价格方面看', '这种盒子都是值得考虑的'],
    ans: [1, 0, 2],
    vi: 'Dù xét về giá hay chất lượng vật liệu, loại hộp này đều đáng cân nhắc.',
  },
  {
    parts: ['他每天早上都去公园跑步', '这个习惯已经坚持了十年', '无论刮风还是下雨'],
    ans: [2, 0, 1],
    vi: 'Dù mưa hay gió, sáng nào anh ấy cũng ra công viên chạy, thói quen ấy đã giữ mười năm.',
  },
  {
    parts: ['反而笑着说没关系', '不但没有生气', '他听完我的解释以后'],
    ans: [2, 1, 0],
    vi: 'Nghe tôi giải thích xong, anh ấy không những không giận mà còn cười bảo không sao.',
  },
  {
    parts: ['以前人们习惯去商店买东西', '然而现在越来越多的人在网上买', '因为这样又快又便宜'],
    ans: [0, 1, 2],
    vi: 'Trước kia người ta quen ra cửa hàng mua đồ, nay ngày càng nhiều người mua trên mạng, vì vừa nhanh vừa rẻ.',
  },
  {
    parts: ['最好提前出发', '否则很容易迟到', '从这儿到机场要一个多小时'],
    ans: [2, 0, 1],
    vi: 'Từ đây ra sân bay hơn một tiếng, tốt nhất đi sớm, nếu không rất dễ muộn.',
  },
  {
    parts: ['第二天果然好多了', '于是就决定先回家休息', '他发现自己有点儿发烧'],
    ans: [2, 1, 0],
    vi: 'Anh ấy thấy mình hơi sốt, thế là quyết định về nhà nghỉ trước, hôm sau quả nhiên đỡ hẳn.',
  },
  {
    parts: ['但是味道确实不错', '虽然这家店的位置不太好找', '所以每天都有很多人来排队'],
    ans: [1, 0, 2],
    vi: 'Tuy quán này hơi khó tìm nhưng vị đúng là ngon, nên ngày nào cũng đông người xếp hàng.',
  },
];

/* -- 阅读第三部分: đáp án nằm sau chỗ bẻ ý, hoặc sau chữ 因为 ---------------- */
export const WEAK1_READ3: QaItem[] = [
  {
    text: '以前，人们写信主要是为了传递消息。然而现在，几秒钟就能把消息发到对方手机上，写信更多是为了表达感情——一封手写的信，收到的人会留很久。',
    q: '现在人们写信主要是为了：',
    opts: ['传递消息', '表达感情', '练习写字', '节约时间'],
    ans: 1,
    vi: 'Trước kia viết thư chủ yếu để truyền tin. Nhưng nay tin nhắn vài giây là tới, viết thư nhiều hơn là để bày tỏ tình cảm.',
    expl: 'Chữ 然而 chia đoạn làm hai. Câu hỏi có chữ 现在 → chỉ đọc vế SAU 然而. Đáp án "传递消息" là chuyện của vế 以前 — đúng cái bẫy.',
  },
  {
    text: '怎样才能说一口流利的外语呢？如果你有一定的语言基础和经济条件，那么出国是最好的选择，因为语言环境对学习语言有重要的作用。',
    q: '去国外学外语是因为：',
    opts: ['语言环境好', '经济条件好', '有语言基础', '学习更认真'],
    ans: 0,
    vi: 'Làm sao nói ngoại ngữ trôi chảy? Nếu có nền tảng và điều kiện kinh tế thì ra nước ngoài là lựa chọn tốt nhất, vì môi trường ngôn ngữ có tác dụng quan trọng.',
    expl: 'Câu hỏi có chữ 因为 thì đáp án phải nằm sau chữ 因为 trong đoạn. 语言基础 và 经济条件 là ĐIỀU KIỆN để đi được, không phải LÝ DO đi.',
  },
  {
    text: '过去，很多人把照片放在相册里，只给家人和朋友看。然而现在，人们更愿意把照片放到网上，让更多不认识的人也能看到自己的生活。',
    q: '现在人们把照片放到网上是为了：',
    opts: ['保存得更久', '让更多人看到', '节约地方', '方便打印'],
    ans: 1,
    vi: 'Trước kia người ta để ảnh trong album chỉ cho người nhà xem; nay thích đưa lên mạng để nhiều người lạ cũng thấy được cuộc sống của mình.',
    expl: 'Cùng một khuôn với câu trên: 然而 → lấy vế sau. Đáp án gần như chép lại nguyên cụm 让更多……看到 trong đoạn.',
  },
  {
    text: '为了让这次活动更热闹，大家做了分工：小马负责报名，小牛每天早上给参加的人送牛奶，猴子打算给孩子们讲故事。',
    q: '小牛负责为大家：',
    opts: ['报名', '送牛奶', '填写地址', '讲故事'],
    ans: 1,
    vi: 'Để hoạt động vui hơn, mọi người chia việc: Tiểu Mã lo đăng ký, Tiểu Ngưu sáng nào cũng đưa sữa, Khỉ định kể chuyện cho bọn trẻ.',
    expl: 'Đoạn có NHIỀU người, mỗi người một việc. Loại câu này chỉ sai khi đọc lướt: phải bám đúng cái tên câu hỏi nhắc tới rồi mới đọc phần sau tên đó.',
  },
  {
    text: '以前，日记是写给自己看的。然而现在，更多的年轻人喜欢把自己的日记放到网站上，希望和更多的人交流。',
    q: '现在许多年轻人写日记：',
    opts: ['写得很短', '代替交流', '只在网上写', '允许别人看'],
    ans: 3,
    vi: 'Trước kia nhật ký là viết cho mình đọc. Nhưng nay càng nhiều người trẻ thích đưa nhật ký lên mạng, mong giao lưu với nhiều người hơn.',
    expl: 'Bẫy ở chữ 只. Đoạn viết 更多的年轻人 — nhiều hơn, chứ không phải "chỉ". Đáp án C nằm đúng nửa đoạn có đáp án và chép đúng chữ 网上, nhưng tuyệt đối hoá thì loại. D là cách nói lại của 放到网站上、和更多的人交流.',
  },
  {
    text: '很多人觉得早睡早起的人身体一定更好。其实并不完全是这样，睡眠时间够不够、质量高不高，往往比几点睡更重要。',
    q: '根据这段话，可以知道：',
    opts: ['早睡的人一定健康', '睡眠质量很重要', '所有人都应该早起', '睡得越久越好'],
    ans: 1,
    vi: 'Nhiều người cho rằng người ngủ sớm dậy sớm chắc chắn khoẻ hơn. Thật ra không hẳn: ngủ đủ hay không, chất lượng cao hay không, thường quan trọng hơn mấy giờ đi ngủ.',
    expl: 'Ba đáp án sai đều đeo một chữ tuyệt đối: 一定 · 所有…都 · 越…越. Đoạn văn thì viết rất chừng mực (其实并不完全 · 往往). Cứ chọn câu nói vừa phải nhất.',
  },
  {
    text: '很多人以为运动的时间越长效果越好。其实并不是这样，每次运动四十分钟左右就够了，时间太长身体反而受不了。',
    q: '根据这段话，运动时间太长会：',
    opts: ['效果更好', '让身体受不了', '更容易坚持', '影响心情'],
    ans: 1,
    vi: 'Nhiều người tưởng tập càng lâu càng tốt. Thực ra không phải, mỗi lần khoảng bốn mươi phút là đủ, lâu quá cơ thể lại chịu không nổi.',
    expl: 'Hai dấu hiệu cùng chỉ về một chỗ: 其实 bẻ lại ý "nhiều người tưởng", 反而 báo kết quả ngược. Đáp án luôn nằm sau hai chữ đó.',
  },
  {
    text: '这家书店晚上十点才关门。虽然书的价格和别的书店差不多，但是这里可以坐下来慢慢看，还能喝杯咖啡，所以下班以后来的人特别多。',
    q: '人们喜欢来这家书店，主要因为：',
    opts: ['书更便宜', '关门早', '可以坐下来看书', '离家近'],
    ans: 2,
    vi: 'Hiệu sách này mười giờ tối mới đóng cửa. Tuy giá sách cũng như nơi khác, nhưng ở đây ngồi đọc thong thả được, còn có cà phê, nên tan làm rất đông người tới.',
    expl: 'Vế 虽然 nói giá "cũng như nơi khác" — tức KHÔNG rẻ hơn, loại luôn đáp án A. Lý do thật nằm ở vế 但是, rồi 所以 chốt lại.',
  },
];
