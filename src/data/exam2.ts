/**
 * Đợt bổ sung thứ hai cho kho đề — viết vì bốn phần không có gì để rút.
 *
 * Đo trên kho cũ: 听力第一/二/三部分 và 阅读第三部分 đều có ĐÚNG số câu của một đề.
 * "Rút ngẫu nhiên" ở mấy phần đó không rút được gì — buổi luyện thứ hai gặp lại đúng
 * hai mươi câu của buổi thứ nhất, và từ lần thứ ba trở đi thì nó đo trí nhớ về đề chứ
 * không còn đo trình độ. Mục tiêu ở đây là mọi phần đều đạt ít nhất 2.5 lần số câu
 * một đề cần.
 *
 * Ba điều được giữ chặt khi viết, vì đây là chỗ dễ viết dễ dãi nhất:
 *
 * **Đáp án sai phải sai vì lý do thật.** Mồi nhử kiểu "别做计划" cho một đoạn nói về
 * phương hướng thì loại được mà không cần đọc. Mồi nhử ở đây luôn là một trong ba
 * loại: đúng chữ trong bài nhưng sai chỗ, đúng một nửa, hoặc nói quá (最 · 都 · 一定).
 *
 * **Đoạn phải đủ dài.** Đoạn 阅读第三部分 cũ trung bình 70 chữ, đề thật 80–120. Đoạn
 * ngắn thì đọc lướt cũng ra, và phần khó thật của đề — giữ được ý qua một đoạn dài —
 * không bao giờ được luyện.
 *
 * **Bẫy phải là bẫy có thật.** Mỗi câu nhắm vào đúng một luật đã ghi trong `PART_NOTES`:
 * chỗ bẻ ý 但是/其实, phủ định mềm 并不/不见得, ngữ khí 可能 với 一定, ước lượng 左右,
 * và chuyện đổi chủ ngữ. Không viết bẫy bằng cách giấu từ vựng lạ.
 */

import type { FillGroup, OrderItem, QaItem, TfItem } from '../engine/exam';

/** 听力第一部分 — 判断对错. Nửa ĐÚNG nửa SAI, không để đoán được bằng tỉ lệ. */
export const LISTEN1_EXTRA: TfItem[] = [
  {
    say: '这家店的东西质量还不错，就是价格有点儿贵，所以我每次只买一两样。',
    stmt: '★ 他觉得那家店很便宜。',
    ok: false,
    vi: 'Đồ ở tiệm này chất lượng cũng khá, chỉ là giá hơi đắt, nên mỗi lần tôi chỉ mua một hai món. → Anh ấy thấy tiệm đó rẻ. (SAI — 就是 bẻ lại)',
  },
  {
    say: '我并不是不想参加这次活动，只是那天正好要去机场接人。',
    stmt: '★ 他不想参加活动。',
    ok: false,
    vi: 'Không phải tôi không muốn tham gia, chỉ là hôm đó đúng lúc phải ra sân bay đón người. → Anh ấy không muốn tham gia. (SAI — 并不是不 là hai lần phủ định)',
  },
  {
    say: '天气预报说明天可能会下雨，你出门的时候最好带把伞。',
    stmt: '★ 明天一定会下雨。',
    ok: false,
    vi: 'Dự báo nói mai có thể mưa, ra ngoài tốt nhất mang theo ô. → Mai chắc chắn mưa. (SAI — 可能 không phải 一定)',
  },
  {
    say: '我们公司大概有三百人左右，其中一半以上都是刚毕业的年轻人。',
    stmt: '★ 公司差不多有三百人。',
    ok: true,
    vi: 'Công ty chúng tôi khoảng ba trăm người, hơn nửa là người trẻ mới tốt nghiệp. → Công ty có khoảng ba trăm người. (ĐÚNG)',
  },
  {
    say: '那本小说我已经看完了，明天上班的时候还给你，谢谢你借我。',
    stmt: '★ 他还没看完那本小说。',
    ok: false,
    vi: 'Cuốn tiểu thuyết đó tôi đọc xong rồi, mai đi làm trả bạn. → Anh ấy chưa đọc xong. (SAI — 已经…了)',
  },
  {
    say: '要去北京出差的是我同事，我留在公司准备下个月的材料。',
    stmt: '★ 他要去北京出差。',
    ok: false,
    vi: 'Người đi công tác Bắc Kinh là đồng nghiệp tôi, tôi ở lại công ty chuẩn bị tài liệu. → Anh ấy đi công tác Bắc Kinh. (SAI — đổi chủ ngữ)',
  },
  {
    say: '这个周末我打算把房间好好收拾一下，最近实在太乱了，东西到处都是。',
    stmt: '★ 他周末要打扫房间。',
    ok: true,
    vi: 'Cuối tuần tôi định dọn phòng cho tử tế, dạo này bừa quá, đồ đạc khắp nơi. → Cuối tuần anh ấy dọn phòng. (ĐÚNG)',
  },
  {
    say: '我原来打算学法律，后来发现自己更喜欢和数字打交道，就改学了会计。',
    stmt: '★ 他现在学的是会计。',
    ok: true,
    vi: 'Ban đầu tôi định học luật, sau thấy mình thích làm việc với con số hơn nên chuyển sang kế toán. → Giờ anh ấy học kế toán. (ĐÚNG — 后来 mới là hiện tại)',
  },
  {
    say: '只要你按时吃药、多休息，这种感冒一个星期左右就能好，别太担心。',
    stmt: '★ 这种感冒很难好。',
    ok: false,
    vi: 'Chỉ cần uống thuốc đúng giờ, nghỉ nhiều, loại cảm này khoảng một tuần là khỏi. → Loại cảm này khó khỏi. (SAI)',
  },
  {
    say: '今天早上路上太堵了，我差点儿迟到，幸好会议临时推迟了十分钟。',
    stmt: '★ 他今天迟到了。',
    ok: false,
    vi: 'Sáng nay đường kẹt quá, suýt nữa thì muộn, may mà cuộc họp lùi mười phút. → Hôm nay anh ấy đến muộn. (SAI — 差点儿 là suýt, tức không xảy ra)',
  },
  {
    say: '原定下午三点的会议提前到了两点，请大家注意时间，别走错会议室。',
    stmt: '★ 会议时间改到两点了。',
    ok: true,
    vi: 'Cuộc họp dự định 3 giờ chiều dời sớm lên 2 giờ, mọi người chú ý giờ giấc. → Giờ họp đổi sang 2 giờ. (ĐÚNG)',
  },
  {
    say: '经理在会上表扬了小李，说他这次的方案考虑得非常仔细，值得大家学习。',
    stmt: '★ 小李受到了表扬。',
    ok: true,
    vi: 'Giám đốc khen Tiểu Lý trong cuộc họp, nói phương án lần này cậu ấy cân nhắc rất kỹ. → Tiểu Lý được khen. (ĐÚNG)',
  },
  {
    say: '这件衣服原价六百，现在打八折，算下来还不到五百块钱。',
    stmt: '★ 这件衣服现在不到五百。',
    ok: true,
    vi: 'Áo này giá gốc 600, giờ giảm 20%, tính ra chưa tới 500. → Áo này giờ chưa tới 500. (ĐÚNG)',
  },
  {
    say: '大家都以为他很内向，其实熟了以后你会发现，他特别爱开玩笑。',
    stmt: '★ 他不爱说话。',
    ok: false,
    vi: 'Ai cũng tưởng anh ấy hướng nội, thực ra quen rồi mới thấy anh ấy rất thích đùa. → Anh ấy không thích nói. (SAI — 其实 bẻ lại)',
  },
  {
    say: '今天的活动我恐怕去不成了，经理让我留下来把这份报告写完。',
    stmt: '★ 他今天要加班。',
    ok: true,
    vi: 'Hoạt động hôm nay e là tôi không đi được, giám đốc bảo ở lại viết xong báo cáo. → Hôm nay anh ấy phải làm thêm. (ĐÚNG)',
  },
  {
    say: '那部电影虽然有点儿长，但是内容特别感人，我觉得值得去看一次。',
    stmt: '★ 他觉得那部电影不错。',
    ok: true,
    vi: 'Bộ phim đó tuy hơi dài nhưng nội dung rất cảm động, tôi thấy đáng xem một lần. → Anh ấy thấy phim đó hay. (ĐÚNG)',
  },
  {
    say: '这件事跟他没有任何关系，是我自己决定的，你别再怪他了。',
    stmt: '★ 这件事是他决定的。',
    ok: false,
    vi: 'Việc này chẳng liên quan gì tới anh ấy, là tôi tự quyết định, đừng trách anh ấy nữa. → Việc này do anh ấy quyết định. (SAI)',
  },
  {
    say: '我在这儿住了五年，从来没听说过这附近要修地铁站的事情。',
    stmt: '★ 这附近已经有地铁站了。',
    ok: false,
    vi: 'Tôi ở đây năm năm, chưa từng nghe nói gần đây sắp xây ga tàu điện ngầm. → Gần đây đã có ga tàu điện ngầm. (SAI)',
  },
  {
    say: '他一下班就直接去了医院，他母亲这几天住院，需要人照顾。',
    stmt: '★ 他下班后去了医院。',
    ok: true,
    vi: 'Anh ấy vừa tan làm là đi thẳng tới bệnh viện, mẹ anh ấy mấy hôm nay nằm viện cần người chăm. → Tan làm anh ấy đến bệnh viện. (ĐÚNG)',
  },
  {
    say: '我要去趟超市买点儿菜，顺便把这些空瓶子扔了，你有什么要带的吗？',
    stmt: '★ 他要去超市。',
    ok: true,
    vi: 'Tôi ra siêu thị mua ít rau, tiện thể vứt mấy cái chai không. → Anh ấy sẽ đi siêu thị. (ĐÚNG)',
  },
];

/**
 * 听力第二部分 — 短对话 hai lượt rồi hỏi.
 *
 * Nửa số câu ở đây hỏi 在哪儿 · 做什么的 · 什么关系: đó là dạng không nói thẳng đáp án
 * bao giờ, phải ghép hai ba từ nghề nghiệp lại mà đoán ra. Kho cũ hầu như chỉ hỏi
 * "vừa nói gì", tức chỉ luyện được nghe chữ chứ chưa luyện được nghe ý.
 */
export const LISTEN2_EXTRA: QaItem[] = [
  {
    say: ['男：这个周末一起去看电影怎么样？', '女：这周恐怕不行，我妈从老家来看我。', '问：女的这个周末要做什么？'],
    q: '女的这个周末要做什么？',
    opts: ['看电影', '陪妈妈', '回老家', '加班'],
    ans: 1,
    vi: 'Nam: Cuối tuần đi xem phim nhé? / Nữ: Tuần này e là không được, mẹ tôi từ quê lên thăm. → Cô ấy ở nhà với mẹ. (恐怕 = từ chối)',
  },
  {
    say: ['女：您好，我想取一下钱。', '男：请您先填一下这张表，然后到三号窗口。', '问：他们最可能在哪儿？'],
    q: '他们最可能在哪儿？',
    opts: ['邮局', '医院', '银行', '书店'],
    ans: 2,
    vi: 'Nữ: Chào anh, tôi muốn rút tiền. / Nam: Chị điền vào tờ này rồi ra quầy số ba. → Ở ngân hàng.',
  },
  {
    say: ['男：你的房间怎么这么干净？', '女：昨天下午收拾了整整三个小时呢。', '问：女的昨天下午做什么了？'],
    q: '女的昨天下午做什么了？',
    opts: ['打扫房间', '出去买东西', '在家睡觉', '搬家'],
    ans: 0,
    vi: 'Nam: Sao phòng em sạch thế? / Nữ: Chiều qua em dọn suốt ba tiếng đấy. → Dọn phòng.',
  },
  {
    say: ['女：会议不是三点吗？', '男：改了，提前半个小时，你快点儿。', '问：会议几点开始？'],
    q: '会议几点开始？',
    opts: ['两点', '两点半', '三点', '三点半'],
    ans: 1,
    vi: 'Nữ: Họp không phải 3 giờ à? / Nam: Đổi rồi, sớm lên nửa tiếng. → 2 giờ rưỡi. (phải tự tính)',
  },
  {
    say: ['男：这条裤子多少钱？', '女：原价二百，今天打五折。', '问：这条裤子现在多少钱？'],
    q: '这条裤子现在多少钱？',
    opts: ['五十块', '一百块', '一百五', '二百块'],
    ans: 1,
    vi: 'Nam: Quần này bao nhiêu? / Nữ: Giá gốc 200, hôm nay giảm nửa. → 100 tệ. (打五折 = còn một nửa)',
  },
  {
    say: ['女：你怎么不吃了？', '男：刚才在路上吃了个面包，现在还不太饿。', '问：男的为什么不吃？'],
    q: '男的为什么不吃？',
    opts: ['菜不好吃', '还不饿', '在减肥', '要出门'],
    ans: 1,
    vi: 'Nữ: Sao anh không ăn nữa? / Nam: Nãy trên đường ăn cái bánh mì rồi, giờ chưa đói lắm. → Chưa đói.',
  },
  {
    say: ['男：明天的报告你准备好了吗？', '女：还差最后一部分，今晚肯定能写完。', '问：关于女的报告，可以知道什么？'],
    q: '关于女的报告，可以知道什么？',
    opts: ['还没开始写', '快写完了', '已经交了', '不用写了'],
    ans: 1,
    vi: 'Nam: Báo cáo mai chuẩn bị xong chưa? / Nữ: Còn phần cuối, tối nay chắc chắn xong. → Sắp viết xong.',
  },
  {
    say: ['女：小李今天怎么没来上班？', '男：他请假了，说是牙疼得厉害。', '问：小李为什么没来？'],
    q: '小李为什么没来？',
    opts: ['出差了', '牙疼', '睡过头了', '去旅游了'],
    ans: 1,
    vi: 'Nữ: Sao hôm nay Tiểu Lý không đi làm? / Nam: Cậu ấy xin nghỉ, bảo đau răng dữ lắm. → Vì đau răng.',
  },
  {
    say: ['男：你觉得这个方案怎么样？', '女：想法不错，就是时间安排得太紧了。', '问：女的认为方案有什么问题？'],
    q: '女的认为方案有什么问题？',
    opts: ['想法太旧', '时间太紧', '花钱太多', '人手不够'],
    ans: 1,
    vi: 'Nam: Em thấy phương án này sao? / Nữ: Ý tưởng ổn, chỉ là bố trí thời gian căng quá. → Thời gian quá gấp. (就是 bẻ lại)',
  },
  {
    say: ['女：麻烦您把窗户关一下，风太大了。', '男：好的，我这就关。', '问：女的希望男的做什么？'],
    q: '女的希望男的做什么？',
    opts: ['开窗户', '关窗户', '开空调', '拿件衣服'],
    ans: 1,
    vi: 'Nữ: Phiền anh đóng cửa sổ giúp, gió to quá. / Nam: Vâng, tôi đóng ngay. → Đóng cửa sổ.',
  },
  {
    say: ['男：听说你换工作了？', '女：是啊，新公司离家近多了，走路十分钟就到。', '问：女的为什么换工作？'],
    q: '女的为什么换工作？',
    opts: ['工资更高', '离家近', '同事更好', '工作轻松'],
    ans: 1,
    vi: 'Nam: Nghe nói chị đổi việc? / Nữ: Ừ, công ty mới gần nhà hơn nhiều, đi bộ mười phút. → Vì gần nhà.',
  },
  {
    say: ['女：这个字我总是写错。', '男：多练几遍就记住了，别着急。', '问：男的是什么意思？'],
    q: '男的是什么意思？',
    opts: ['让她多练习', '让她换支笔', '这个字不重要', '他也不会写'],
    ans: 0,
    vi: 'Nữ: Chữ này em cứ viết sai. / Nam: Luyện thêm mấy lần là nhớ thôi, đừng vội. → Bảo cô ấy luyện thêm.',
  },
  {
    say: ['男：您几位？', '女：三位，请问有靠窗的位子吗？', '问：他们最可能在哪儿？'],
    q: '他们最可能在哪儿？',
    opts: ['饭馆', '教室', '车站', '图书馆'],
    ans: 0,
    vi: 'Nam: Dạ mấy người ạ? / Nữ: Ba người, có chỗ cạnh cửa sổ không? → Ở nhà hàng.',
  },
  {
    say: ['女：你怎么还不睡？都十二点了。', '男：等我把这封邮件发出去就睡。', '问：男的在做什么？'],
    q: '男的在做什么？',
    opts: ['看电视', '发邮件', '打电话', '整理房间'],
    ans: 1,
    vi: 'Nữ: Sao anh chưa ngủ? Mười hai giờ rồi. / Nam: Đợi anh gửi xong cái mail này. → Đang gửi mail.',
  },
  {
    say: ['女：这次考试你考得怎么样？', '男：比上次好一点儿，不过还是没及格。', '问：男的这次考试怎么样？'],
    q: '男的这次考试怎么样？',
    opts: ['考得很好', '没及格', '没参加', '第一名'],
    ans: 1,
    vi: 'Nữ: Kỳ này anh thi thế nào? / Nam: Khá hơn lần trước chút, nhưng vẫn chưa đạt. → Chưa đạt. (不过 bẻ lại)',
  },
  {
    say: ['男：我们坐地铁去吧，这个时间路上肯定堵。', '女：好，地铁站就在前面。', '问：他们打算怎么去？'],
    q: '他们打算怎么去？',
    opts: ['开车', '坐地铁', '走路', '坐公共汽车'],
    ans: 1,
    vi: 'Nam: Đi tàu điện ngầm đi, giờ này đường chắc chắn kẹt. / Nữ: Ừ, ga ngay phía trước. → Đi tàu điện ngầm.',
  },
  {
    say: ['女：你的行李箱怎么这么重？', '男：里面都是给家里人带的礼物。', '问：行李箱里主要是什么？'],
    q: '行李箱里主要是什么？',
    opts: ['衣服', '书', '礼物', '吃的'],
    ans: 2,
    vi: 'Nữ: Vali anh sao nặng thế? / Nam: Toàn quà mang về cho người nhà. → Toàn quà.',
  },
  {
    say: ['男：这本书你看了多久？', '女：断断续续看了两个多月才看完。', '问：女的看这本书用了多长时间？'],
    q: '女的看这本书用了多长时间？',
    opts: ['两个星期', '一个月', '两个多月', '半年'],
    ans: 2,
    vi: 'Nam: Cuốn này em đọc bao lâu? / Nữ: Đọc ngắt quãng hơn hai tháng mới xong. → Hơn hai tháng.',
  },
  {
    say: ['女：不好意思，我来晚了。', '男：没关系，我也刚到，还没点菜呢。', '问：关于男的，可以知道什么？'],
    q: '关于男的，可以知道什么？',
    opts: ['等了很久', '他也刚到', '已经吃完了', '不高兴'],
    ans: 1,
    vi: 'Nữ: Xin lỗi, em tới muộn. / Nam: Không sao, anh cũng vừa tới, chưa gọi món. → Anh ấy cũng vừa tới.',
  },
  {
    say: ['男：你怎么看起来这么累？', '女：昨晚照顾孩子，只睡了三个小时。', '问：女的为什么这么累？'],
    q: '女的为什么这么累？',
    opts: ['加班到很晚', '没睡好', '生病了', '刚运动完'],
    ans: 1,
    vi: 'Nam: Sao trông em mệt thế? / Nữ: Tối qua trông con, chỉ ngủ được ba tiếng. → Vì ngủ không đủ.',
  },
  {
    say: ['女：这个箱子太重了，我一个人搬不动。', '男：我来帮你，咱们一起抬。', '问：男的要做什么？'],
    q: '男的要做什么？',
    opts: ['帮女的搬箱子', '叫别人来', '把东西拿出来', '打车'],
    ans: 0,
    vi: 'Nữ: Thùng này nặng quá, em một mình khiêng không nổi. / Nam: Để anh giúp, hai đứa cùng khiêng. → Giúp cô ấy khiêng.',
  },
  {
    say: ['男：您的护照和机票，请拿好。', '女：谢谢，请问登机口在哪边？', '问：他们最可能在哪儿？'],
    q: '他们最可能在哪儿？',
    opts: ['火车站', '机场', '宾馆', '医院'],
    ans: 1,
    vi: 'Nam: Hộ chiếu và vé máy bay của chị đây. / Nữ: Cảm ơn, cho hỏi cửa lên máy bay ở đâu ạ? → Ở sân bay.',
  },
  {
    say: ['女：你怎么不早说？我可以开车送你去。', '男：我以为你今天要加班呢。', '问：男的为什么没找女的？'],
    q: '男的为什么没找女的？',
    opts: ['以为她要加班', '不好意思麻烦她', '她没有车', '忘了她的号码'],
    ans: 0,
    vi: 'Nữ: Sao anh không nói sớm? Em lái xe đưa anh đi được mà. / Nam: Anh tưởng hôm nay em phải làm thêm. → Vì tưởng cô ấy làm thêm.',
  },
  {
    say: ['男：这道题我已经讲了三遍，你还是不明白吗？', '女：对不起老师，我再想想。', '问：他们最可能是什么关系？'],
    q: '他们最可能是什么关系？',
    opts: ['同事', '师生', '医生和病人', '邻居'],
    ans: 1,
    vi: 'Nam: Bài này thầy giảng ba lần rồi, em vẫn chưa hiểu à? / Nữ: Xin lỗi thầy, để em nghĩ lại. → Thầy trò.',
  },
  {
    say: ['女：你尝尝这个，我第一次做。', '男：真看不出来，做得跟饭馆里的一样。', '问：男的觉得这个菜怎么样？'],
    q: '男的觉得这个菜怎么样？',
    opts: ['太咸了', '做得很好', '有点儿凉', '和上次一样'],
    ans: 1,
    vi: 'Nữ: Anh nếm thử đi, em làm lần đầu đấy. / Nam: Không nhìn ra luôn, làm ngon như ngoài hàng. → Anh ấy khen ngon.',
  },
];

/**
 * 听力第三部分 — hai câu hỏi trên MỘT đoạn.
 *
 * Câu thứ hai của mỗi cụm mang cờ `sameAudio` và `say` rỗng: nó mượn đoạn của câu
 * đứng ngay trước. Thứ tự trong mảng này vì thế là thứ tự bắt buộc, không phải cách
 * bày cho gọn — `drawPaper` rút theo cụm và sẽ không bao giờ tách chúng ra.
 *
 * Đoạn ở đây dài 75–100 chữ, dài hơn kho cũ (trung bình 67). Đoạn ngắn thì nghe được
 * một hai từ khoá là đoán ra, nên cái khó thật của phần này — giữ được mạch qua một
 * đoạn dài rồi mới trả lời — chưa bao giờ được luyện.
 */
export const LISTEN3_EXTRA: QaItem[] = [
  {
    say: [
      '女：你这次去云南玩儿了几天？',
      '男：本来打算待一个星期，结果只待了四天就回来了。',
      '女：怎么这么快？是不是天气不好？',
      '男：天气挺好的，主要是公司临时有个会，让我提前回去。不过风景真的很美，下次一定要多待几天。',
      '问：男的这次在云南待了多久？',
    ],
    q: '男的这次在云南待了多久？',
    opts: ['三天', '四天', '一个星期', '半个月'],
    ans: 1,
    vi: 'Nữ: Chuyến này anh đi Vân Nam chơi mấy hôm? / Nam: Vốn định ở một tuần, cuối cùng mới bốn ngày đã về… → Bốn ngày.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的为什么提前回来？',
    opts: ['天气不好', '公司有会', '身体不舒服', '没钱了'],
    ans: 1,
    vi: 'Chủ yếu vì công ty đột xuất có cuộc họp nên bảo anh ấy về sớm.',
  },
  {
    say: [
      '男：听说你开始跑步了？坚持多久了？',
      '女：三个月了，一开始只能跑十分钟，现在能跑半个小时。',
      '男：真厉害。是为了减肥吗？',
      '女：一开始是，后来发现睡眠变好了，心情也好，就一直跑下来了。',
      '问：女的现在一次能跑多长时间？',
    ],
    q: '女的现在一次能跑多长时间？',
    opts: ['十分钟', '二十分钟', '半个小时', '一个小时'],
    ans: 2,
    vi: 'Nam: Nghe nói em bắt đầu chạy bộ? Được bao lâu rồi? / Nữ: Ba tháng, lúc đầu chỉ chạy được mười phút, giờ chạy được nửa tiếng.',
  },
  {
    say: [],
    sameAudio: true,
    q: '女的为什么一直坚持跑步？',
    opts: ['为了减肥', '睡眠和心情都变好了', '医生要求的', '和朋友约好的'],
    ans: 1,
    vi: 'Ban đầu là để giảm cân, về sau thấy ngủ ngon hơn, tâm trạng cũng tốt nên chạy tiếp. (后来 mới là lý do hiện tại)',
  },
  {
    say: [
      '很多人以为搬到大城市工作，收入高了生活就一定会更好。其实并不一定。房租、交通、吃饭样样都贵，算下来剩不了多少。',
      '更重要的是，在大城市每天上下班可能要花两三个小时，这些时间本来可以用来休息或者陪家人。所以选择在哪儿工作，不能只看工资那个数字。',
      '问：这段话主要谈什么？',
    ],
    q: '这段话主要谈什么？',
    opts: [
      '大城市工资很高',
      '选工作不能只看工资',
      '小城市房租便宜',
      '每个人都该去大城市',
    ],
    ans: 1,
    vi: 'Nhiều người tưởng lên thành phố lớn làm việc, lương cao thì sống chắc chắn tốt hơn. Thực ra không hẳn… → Chọn việc không thể chỉ nhìn lương.',
  },
  {
    say: [],
    sameAudio: true,
    q: '在大城市上下班可能要花多长时间？',
    opts: ['半个小时', '一个小时', '两三个小时', '一整天'],
    ans: 2,
    vi: 'Ở thành phố lớn mỗi ngày đi làm về có thể mất hai ba tiếng.',
  },
  {
    say: [
      '女：这个房子你打算租多久？',
      '男：先签一年吧，如果住得习惯再续。',
      '女：房租一个月多少？',
      '男：三千二，比我原来住的贵五百，不过这儿离地铁站近，走五分钟就到，算下来其实更划算。',
      '问：这个房子一个月房租多少？',
    ],
    q: '这个房子一个月房租多少？',
    opts: ['两千七', '三千', '三千二', '三千五'],
    ans: 2,
    vi: 'Nữ: Nhà này anh định thuê bao lâu? / Nam: Ký một năm trước đã… Ba nghìn hai, đắt hơn chỗ cũ năm trăm.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的为什么觉得这儿更划算？',
    opts: ['房租便宜', '房子更大', '离地铁站近', '可以短租'],
    ans: 2,
    vi: 'Vì gần ga tàu điện ngầm, đi bộ năm phút là tới.',
  },
  {
    say: [
      '男：你女儿今年上几年级了？',
      '女：五年级。最近我在考虑要不要给她报个画画班。',
      '男：她自己想学吗？',
      '女：她挺感兴趣的，可是每周末都要去，我担心太累。我想还是先问问她的意见，别勉强。',
      '问：女的在考虑什么事？',
    ],
    q: '女的在考虑什么事？',
    opts: ['给女儿报画画班', '给女儿换学校', '周末去旅游', '让女儿多休息'],
    ans: 0,
    vi: 'Nam: Con gái chị năm nay lớp mấy? / Nữ: Lớp năm. Dạo này tôi đang cân nhắc có nên cho cháu học lớp vẽ không.',
  },
  {
    say: [],
    sameAudio: true,
    q: '女的打算怎么做？',
    opts: ['马上报名', '先问女儿的意见', '让丈夫决定', '等明年再说'],
    ans: 1,
    vi: 'Cô ấy muốn hỏi ý kiến con trước, không ép.',
  },
  {
    say: [
      '有个年轻人去应聘，面试时经理问他：“你有什么缺点？”他想了想，老老实实地说自己做事有点儿慢，因为总想把每个细节都做对。',
      '结果他被录用了。经理后来说，很多人会把缺点说成优点，只有他真的在回答问题。诚实本身就是一种能力。',
      '问：那个年轻人是怎么回答的？',
    ],
    q: '那个年轻人是怎么回答的？',
    opts: [
      '说自己没有缺点',
      '老实说自己做事慢',
      '把缺点说成优点',
      '没有回答'
    ],
    ans: 1,
    vi: 'Có một người trẻ đi phỏng vấn… anh ấy thành thật nói mình làm việc hơi chậm vì luôn muốn làm đúng từng chi tiết.',
  },
  {
    say: [],
    sameAudio: true,
    q: '经理为什么录用他？',
    opts: ['他做事很快', '他很诚实', '他经验丰富', '他要求的工资低'],
    ans: 1,
    vi: 'Giám đốc nói chỉ có anh ấy thật sự trả lời câu hỏi — thành thật bản thân nó là một năng lực.',
  },
  {
    say: [
      '女：你怎么把手机放在包里不看？',
      '男：我最近在试一个办法，吃饭的时候不看手机。',
      '女：有效果吗？',
      '男：有。以前一顿饭要吃四十分钟，一边看一边吃；现在二十分钟就吃完了，而且能尝出菜的味道了。',
      '问：男的最近在试什么办法？',
    ],
    q: '男的最近在试什么办法？',
    opts: ['吃饭时不看手机', '每天少吃一顿', '换一个新手机', '自己做饭'],
    ans: 0,
    vi: 'Nữ: Sao anh để điện thoại trong túi không xem? / Nam: Dạo này anh thử một cách: lúc ăn cơm không xem điện thoại.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的现在吃一顿饭要多长时间？',
    opts: ['十分钟', '二十分钟', '半个小时', '四十分钟'],
    ans: 1,
    vi: 'Trước kia một bữa ăn 40 phút, giờ 20 phút là xong.',
  },
  {
    say: [
      '男：这份材料你复印了几份？',
      '女：五份。会议一共七个人，够吗？',
      '男：那还差两份。另外，麻烦你把上次讨论的那张表也一起带上。',
      '女：好，我现在就去，大概十分钟回来。',
      '问：女的还要再复印几份？',
    ],
    q: '女的还要再复印几份？',
    opts: ['一份', '两份', '五份', '七份'],
    ans: 1,
    vi: 'Nam: Tài liệu này em photo mấy bản? / Nữ: Năm bản. Cuộc họp bảy người, đủ không? / Nam: Vậy thiếu hai bản.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的还让女的做什么？',
    opts: ['带一张表', '通知大家', '订会议室', '打印报告'],
    ans: 0,
    vi: 'Ngoài ra còn nhờ cô ấy mang theo cái bảng đã thảo luận lần trước.',
  },
  {
    say: [
      '现在很多人习惯睡前躺在床上看手机，觉得这样能放松。研究发现，事情往往相反：手机的光会让大脑以为还是白天，反而更难入睡。',
      '如果你也有睡不着的问题，可以试着把手机放在离床远一点儿的地方，睡前半个小时不再看。坚持一段时间，很多人都说效果明显。',
      '问：睡前看手机为什么不好？',
    ],
    q: '睡前看手机为什么不好？',
    opts: [
      '会让眼睛疼',
      '会让人更难睡着',
      '会花很多钱',
      '会吵到别人'
    ],
    ans: 1,
    vi: 'Ánh sáng điện thoại khiến não tưởng vẫn là ban ngày, ngược lại càng khó ngủ.',
  },
  {
    say: [],
    sameAudio: true,
    q: '这段话建议怎么做？',
    opts: ['睡前半小时不看手机', '换一个亮度低的手机', '睡前喝点儿热牛奶', '早点儿起床'],
    ans: 0,
    vi: 'Khuyên để điện thoại xa giường và nửa tiếng trước khi ngủ thì không xem nữa.',
  },
  {
    say: [
      '女：你昨天面试怎么样？',
      '男：还行吧，就是有个问题没答好。',
      '女：什么问题？',
      '男：他们问我为什么想来这家公司，我说得太一般了。其实我准备了很久，紧张的时候全忘了。',
      '问：男的觉得面试哪里没做好？',
    ],
    q: '男的觉得面试哪里没做好？',
    opts: ['迟到了', '有个问题没答好', '穿得不合适', '材料没带全'],
    ans: 1,
    vi: 'Nữ: Hôm qua anh phỏng vấn thế nào? / Nam: Cũng được, chỉ là có một câu trả lời chưa tốt.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的为什么没答好？',
    opts: ['没有准备', '一紧张忘了', '没听清问题', '不想去这家公司'],
    ans: 1,
    vi: 'Thực ra anh ấy chuẩn bị rất lâu, nhưng lúc căng thẳng quên sạch.',
  },
  {
    say: [
      '男：这条路怎么又修了？上个月不是刚修过吗？',
      '女：这次是修下面的水管，不是修路面。',
      '男：那要修到什么时候？我每天上班都得绕路。',
      '女：通知上说大概两个星期，不过我看恐怕不止。',
      '问：这次为什么修路？',
    ],
    q: '这次为什么修路？',
    opts: ['路面坏了', '修下面的水管', '要加宽', '要种树'],
    ans: 1,
    vi: 'Nam: Sao đường này lại sửa? Tháng trước chẳng vừa sửa xong à? / Nữ: Lần này sửa ống nước bên dưới, không phải sửa mặt đường.',
  },
  {
    say: [],
    sameAudio: true,
    q: '女的觉得要修多长时间？',
    opts: ['一个星期', '正好两个星期', '可能不止两个星期', '一个月'],
    ans: 2,
    vi: 'Thông báo nói khoảng hai tuần, nhưng cô ấy e là không dừng ở đó. (恐怕不止)',
  },
  {
    say: [
      '很多父母担心孩子输在起跑线上，从小就给他们报很多班。可是有专家提醒，孩子的时间被排得太满，反而没有机会去发现自己真正喜欢什么。',
      '一个整天被安排的孩子，长大以后可能什么都会一点儿，却说不出自己想做什么。留一点儿空白，有时候比多上一个班更有用。',
      '问：专家提醒了什么？',
    ],
    q: '专家提醒了什么？',
    opts: [
      '应该多报几个班',
      '时间排太满反而不好',
      '孩子应该早点儿工作',
      '父母不该管孩子'
    ],
    ans: 1,
    vi: 'Chuyên gia nhắc: thời gian của trẻ bị xếp kín quá, ngược lại không còn cơ hội khám phá mình thật sự thích gì.',
  },
  {
    say: [],
    sameAudio: true,
    q: '这段话认为留空白有什么好处？',
    opts: ['能省钱', '让孩子发现自己喜欢什么', '让父母轻松', '成绩会更好'],
    ans: 1,
    vi: 'Chừa lại một khoảng trống đôi khi hữu ích hơn học thêm một lớp.',
  },
  {
    say: [
      '女：你这个自行车骑了多少年了？',
      '男：快十年了吧，是我上大学时候买的。',
      '女：还能骑吗？要不换个新的？',
      '男：修一修还能骑好几年。而且骑习惯了，换新的反而不舒服。',
      '问：男的这辆自行车是什么时候买的？',
    ],
    q: '男的这辆自行车是什么时候买的？',
    opts: ['去年', '上大学的时候', '工作以后', '刚搬家的时候'],
    ans: 1,
    vi: 'Nữ: Xe đạp này anh đi bao nhiêu năm rồi? / Nam: Gần mười năm, mua hồi học đại học.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的为什么不想换新的？',
    opts: ['没钱', '骑习惯了', '新的太贵', '很快要搬家'],
    ans: 1,
    vi: 'Sửa một chút là đi thêm mấy năm nữa, hơn nữa quen rồi, đổi mới lại thấy không thoải mái.',
  },
  {
    say: [
      '男：你们公司现在还招人吗？',
      '女：招，不过要求比去年高了。以前只要有两年经验就行，现在要三年以上。',
      '男：那我可能不太合适。',
      '女：也不一定，你可以先把简历发过来，有的岗位主要看能力，经验差一点儿也没关系。',
      '问：现在应聘要求有什么变化？',
    ],
    q: '现在应聘要求有什么变化？',
    opts: ['要求学历更高', '经验要三年以上', '要会外语', '要能出差'],
    ans: 1,
    vi: 'Nữ: Có tuyển, nhưng yêu cầu cao hơn năm ngoái. Trước chỉ cần hai năm kinh nghiệm, giờ phải trên ba năm.',
  },
  {
    say: [],
    sameAudio: true,
    q: '女的建议男的怎么做？',
    opts: ['先发简历过来', '再等一年', '换个行业', '直接来面试'],
    ans: 0,
    vi: 'Cô ấy khuyên cứ gửi CV trước, có vị trí chủ yếu xem năng lực.',
  },
  {
    say: [
      '女：这次活动一共来了多少人？',
      '男：报名的有八十个，实际来了六十多。',
      '女：怎么少了这么多？',
      '男：那天下大雨，路上不好走。不过来的人都说很值得，好几个还问下次什么时候办。',
      '问：那天实际来了多少人？',
    ],
    q: '那天实际来了多少人？',
    opts: ['四十多', '六十多', '八十个', '一百个'],
    ans: 1,
    vi: 'Nữ: Hoạt động lần này bao nhiêu người tới? / Nam: Đăng ký tám mươi, thực tế tới hơn sáu mươi.',
  },
  {
    say: [],
    sameAudio: true,
    q: '来的人对这次活动的看法是：',
    opts: ['觉得很值得', '觉得太长了', '觉得地点不好', '不想再来'],
    ans: 0,
    vi: 'Người tới đều nói rất đáng, mấy người còn hỏi lần sau khi nào tổ chức.',
  },
];

/**
 * 阅读第一部分 — 选词填空, mỗi nhóm sáu từ cho năm chỗ trống.
 *
 * Từ thừa luôn là từ GẦN NGHĨA hoặc cùng từ loại với một chỗ trống nào đó, không phải
 * một từ vu vơ. Thừa một từ vu vơ thì bảng sáu từ thành bảng năm từ, và chỗ trống cuối
 * cùng tự điền lấy.
 *
 * Ba nhóm hội thoại ở đây là dạng câu 51–55: chỗ trống nằm ở một lượt nói, manh mối
 * nằm ở lượt kia. Kho cũ nghiêng về câu đơn (3–2), giờ cân lại thành 5–5 để rút ra
 * lần nào cũng gặp đủ hai dạng.
 */
export const READ1_EXTRA2: FillGroup[] = [
  {
    bank: ['①随着', '②增加', '③提高', '④由于', '⑤适应', '⑥养成'],
    items: [
      { sent: '（　）年龄的增长，他对很多事情看得越来越开了。', ans: 0, vi: 'Cùng với tuổi tác, anh ấy nhìn nhiều chuyện thoáng hơn.' },
      { sent: '（　）天气原因，今天下午的航班全部取消了。', ans: 3, vi: 'Do thời tiết, toàn bộ chuyến bay chiều nay bị huỷ.' },
      { sent: '这几年来这儿旅游的人（　）了三倍还多。', ans: 1, vi: 'Mấy năm nay khách du lịch tới đây tăng hơn ba lần.' },
      { sent: '刚来的时候很不习惯，过了半年才慢慢（　）。', ans: 4, vi: 'Mới sang rất không quen, nửa năm sau mới dần thích nghi.' },
      { sent: '他从小就（　）了每天读书的好习惯。', ans: 5, vi: 'Anh ấy từ nhỏ đã tạo được thói quen đọc sách mỗi ngày.' },
    ],
  },
  {
    bank: ['①逐渐', '②仍然', '③竟然', '④到底', '⑤难道', '⑥其实'],
    items: [
      { sent: '吃了药以后，他的咳嗽（　）好了起来。', ans: 0, vi: 'Uống thuốc xong, cơn ho anh ấy dần đỡ.' },
      { sent: '都过了这么多年，他（　）记得我爱吃什么。', ans: 2, vi: 'Bao nhiêu năm rồi, anh ấy thế mà vẫn nhớ tôi thích ăn gì.' },
      { sent: '这件事你（　）想怎么办？给个话吧。', ans: 3, vi: 'Việc này rốt cuộc anh muốn làm sao? Cho một câu đi.' },
      { sent: '我劝了他半天，他（　）不听，还是走了。', ans: 1, vi: 'Tôi khuyên mãi, anh ấy vẫn không nghe, vẫn cứ đi.' },
      { sent: '大家都以为他不会来，（　）他早就到了。', ans: 5, vi: 'Ai cũng tưởng anh ấy không đến, thực ra anh ấy tới từ lâu rồi.' },
    ],
  },
  {
    dialogue: true,
    bank: ['①负责', '②按照', '③商量', '④详细', '⑤打扰', '⑥禁止'],
    items: [
      {
        sent: 'A：这个项目谁来（　）？\nB：暂时还没定，明天开会再说。',
        ans: 0,
        vi: 'A: Dự án này ai phụ trách? B: Tạm thời chưa quyết, mai họp bàn tiếp.',
      },
      {
        sent: 'A：您能说得再（　）一点儿吗？我没听明白。\nB：好，我从头再讲一遍。',
        ans: 3,
        vi: 'A: Anh nói chi tiết hơn chút được không? Tôi chưa hiểu. B: Được, tôi kể lại từ đầu.',
      },
      {
        sent: 'A：这事儿我一个人拿不定主意。\nB：那咱们晚上跟大家（　）一下。',
        ans: 2,
        vi: 'A: Việc này mình tôi không quyết được. B: Vậy tối nay bàn với mọi người.',
      },
      {
        sent: 'A：不好意思，（　）您一下，请问三号楼怎么走？\nB：往前走，第二个路口向左拐。',
        ans: 4,
        vi: 'A: Xin lỗi làm phiền, cho hỏi toà số 3 đi lối nào? B: Đi thẳng, ngã rẽ thứ hai quẹo trái.',
      },
      {
        sent: 'A：这份材料要写多少字？\nB：（　）通知上的要求，不少于八百字。',
        ans: 1,
        vi: 'A: Tài liệu này viết bao nhiêu chữ? B: Theo yêu cầu trong thông báo, không dưới tám trăm chữ.',
      },
    ],
  },
  {
    dialogue: true,
    bank: ['①来得及', '②差不多', '③恐怕', '④正好', '⑤顺便', '⑥至少'],
    items: [
      {
        sent: 'A：现在出发还（　）吗？电影七点开始。\nB：来得及，开车二十分钟就到。',
        ans: 0,
        vi: 'A: Giờ đi còn kịp không? Phim bảy giờ chiếu. B: Kịp, lái xe hai mươi phút là tới.',
      },
      {
        sent: 'A：明天的活动你能来吗？\nB：（　）不行，我得去机场接人。',
        ans: 2,
        vi: 'A: Mai anh tới được không? B: E là không được, tôi phải ra sân bay đón người.',
      },
      {
        sent: 'A：这两件衣服哪件好看？\nB：（　），我觉得都不错。',
        ans: 1,
        vi: 'A: Hai bộ này bộ nào đẹp? B: Xêm xêm, tôi thấy đều được.',
      },
      {
        sent: 'A：你要去超市吗？\nB：对，（　）帮你把这些快递取回来。',
        ans: 4,
        vi: 'A: Anh ra siêu thị à? B: Ừ, tiện thể lấy mấy kiện hàng về cho em.',
      },
      {
        sent: 'A：这个方案要准备多久？\nB：（　）也得两个星期，急不了。',
        ans: 5,
        vi: 'A: Phương án này chuẩn bị bao lâu? B: Ít nhất cũng phải hai tuần, không vội được.',
      },
    ],
  },
  {
    dialogue: true,
    bank: ['①味道', '②温度', '③材料', '④换', '⑤价格', '⑥厉害'],
    items: [
      {
        sent: 'A：这个汤怎么样？\nB：（　）不错，就是有点儿咸。',
        ans: 0,
        vi: 'A: Canh này thế nào? B: Vị được đấy, chỉ hơi mặn.',
      },
      {
        sent: 'A：面包怎么没烤好？\nB：烤箱的（　）没调对，我再试一次。',
        ans: 1,
        vi: 'A: Sao bánh nướng chưa được? B: Nhiệt độ lò chỉnh chưa đúng, để tôi thử lại.',
      },
      {
        sent: 'A：这次的报告为什么退回来了？\nB：（　）不全，还差两份证明。',
        ans: 2,
        vi: 'A: Sao báo cáo lần này bị trả về? B: Tài liệu chưa đủ, còn thiếu hai giấy chứng nhận.',
      },
      {
        sent: 'A：这个方案还能用吗？\nB：不行了，得（　）一份新的。',
        ans: 3,
        vi: 'A: Phương án này còn dùng được không? B: Không được rồi, phải đổi một bản mới.',
      },
      {
        sent: 'A：他这次跑了多少？\nB：二十公里，真（　）。',
        ans: 5,
        vi: 'A: Lần này cậu ấy chạy bao nhiêu? B: Hai mươi cây, đúng là ghê thật.',
      },
    ],
  },
];

/**
 * 阅读第二部分 — 排列顺序.
 *
 * Mỗi câu ở đây được viết sao cho có ÍT NHẤT MỘT dấu hiệu cứng quyết định thứ tự:
 * một đại từ không thể mở đoạn, một vế sau của cặp liên từ, một mảnh thiếu chủ ngữ,
 * hoặc một mốc thời gian. Ba mảnh xếp thế nào cũng đọc xuôi thì đó không phải câu hỏi,
 * đó là chuyện may rủi — và kho cũ có mấy câu như vậy.
 */
export const READ2_EXTRA2: OrderItem[] = [
  {
    parts: ['一直走到楼下', '他才发现自己带错了钥匙', '只好又回公司拿了一趟'],
    ans: [0, 1, 2],
    vi: 'Đi bộ mãi xuống tới dưới nhà, anh ấy mới phát hiện cầm nhầm chìa khoá, đành quay lại công ty lấy một chuyến.',
  },
  {
    parts: ['他每天晚上都复习到十一点', '整整坚持了两个月', '所以这次考试成绩比上次好了很多'],
    ans: [0, 1, 2],
    vi: 'Tối nào cậu ấy cũng ôn tới mười một giờ, kiên trì suốt hai tháng, nên điểm kỳ này khá hơn lần trước nhiều.',
  },
  {
    parts: ['虽然价格贵了一点儿', '但是穿起来特别舒服', '这双鞋是我上个月买的'],
    ans: [2, 0, 1],
    vi: 'Đôi giày này tôi mua tháng trước, tuy giá hơi đắt nhưng đi rất thoải mái.',
  },
  {
    parts: ['我在门口等了半个小时', '结果一个人也没来', '后来才知道地点改了'],
    ans: [0, 1, 2],
    vi: 'Tôi đứng đợi ở cửa nửa tiếng, kết quả chẳng ai tới, sau mới biết địa điểm đã đổi.',
  },
  {
    parts: ['每天早上六点起床跑步', '身体一直很不错', '这个习惯他保持了十几年'],
    ans: [0, 2, 1],
    vi: 'Sáu giờ sáng nào cũng dậy chạy bộ, thói quen ấy anh ấy giữ hơn mười năm, sức khoẻ luôn rất tốt.',
  },
  {
    parts: ['这个问题想了一个下午也没有结果', '于是我决定先把它放一放', '第二天早上反而一下子就想通了'],
    ans: [0, 1, 2],
    vi: 'Vấn đề đó nghĩ cả buổi chiều không ra, nên tôi quyết định gác lại; sáng hôm sau lại nghĩ thông ngay.',
  },
  {
    parts: ['自从上次因为迟到被批评以后', '他就再也没有迟到过', '每天都提前二十分钟出门'],
    ans: [0, 1, 2],
    vi: 'Từ lần bị phê bình vì đến muộn, anh ấy không bao giờ muộn nữa, ngày nào cũng ra khỏi nhà sớm hai mươi phút.',
  },
  {
    parts: ['我们才顺利找到了那家小店', '它开在一条很窄的巷子里', '按照地图上标的路线'],
    ans: [2, 0, 1],
    vi: 'Theo tuyến đường đánh dấu trên bản đồ, chúng tôi mới tìm được tiệm nhỏ đó; nó nằm trong một con hẻm rất hẹp.',
  },
  {
    parts: ['妹妹从小就喜欢画画', '现在已经是一名设计师了', '大学也选了这个专业'],
    ans: [0, 2, 1],
    vi: 'Em gái tôi từ nhỏ đã thích vẽ, đại học cũng chọn ngành này, giờ đã là một nhà thiết kế.',
  },
  {
    parts: ['每做完一件就划掉一件', '否则很容易忘记重要的事情', '我习惯把当天要做的事写下来'],
    ans: [2, 0, 1],
    vi: 'Tôi quen ghi ra những việc phải làm trong ngày, xong việc nào gạch việc đó, nếu không rất dễ quên việc quan trọng.',
  },
  {
    parts: ['这让全家人都松了一口气', '医生说只是普通的感冒', '并不像我们想的那么严重'],
    ans: [1, 2, 0],
    vi: 'Bác sĩ nói chỉ là cảm thường, không nghiêm trọng như nhà tôi tưởng, khiến cả nhà thở phào.',
  },
  {
    parts: ['他花了三个月才把它修好', '那台电脑已经用了八年', '很多零件都买不到了'],
    ans: [1, 2, 0],
    vi: 'Cái máy tính đó dùng tám năm rồi, nhiều linh kiện không mua được nữa, anh ấy mất ba tháng mới sửa xong.',
  },
  {
    parts: ['因此这条路每天早上都特别堵', '附近有三所学校', '还有一个很大的市场'],
    ans: [1, 2, 0],
    vi: 'Gần đó có ba trường học và một cái chợ rất lớn, vì thế con đường này sáng nào cũng kẹt kinh khủng.',
  },
  {
    parts: ['我一开始完全听不懂', '连问路都要用手比划', '刚到那个城市的时候'],
    ans: [2, 0, 1],
    vi: 'Lúc mới tới thành phố đó tôi hoàn toàn không nghe hiểu, đến hỏi đường cũng phải ra dấu bằng tay.',
  },
  {
    parts: ['她还是坚持每周去看他一次', '尽管路上要坐两个小时的车', '一坚持就是五年'],
    ans: [1, 0, 2],
    vi: 'Dù đi đường mất hai tiếng xe, cô ấy vẫn tuần nào cũng tới thăm ông một lần, và kiên trì suốt năm năm.',
  },
  {
    parts: ['这才是他真正想说的话', '前面那些都只是客气', '你要听最后一句'],
    ans: [2, 1, 0],
    vi: 'Bạn phải nghe câu cuối; mấy câu trước chỉ là khách sáo, câu đó mới là điều anh ấy thật sự muốn nói.',
  },
  {
    parts: ['价格反而比网上还便宜一些', '我原以为商场里的东西一定贵', '没想到那天正好赶上打折'],
    ans: [1, 2, 0],
    vi: 'Tôi vốn tưởng đồ trong trung tâm thương mại chắc chắn đắt, không ngờ hôm đó đúng dịp giảm giá, giá lại rẻ hơn cả trên mạng.',
  },
  {
    parts: ['只要有一个人先开口', '气氛马上就轻松起来了', '刚开始大家都有点儿紧张'],
    ans: [2, 0, 1],
    vi: 'Lúc đầu ai cũng hơi căng thẳng, chỉ cần một người mở lời trước là không khí liền dễ chịu hẳn.',
  },
  {
    parts: ['他把那本书送给了我', '临走的那天', '并且在第一页写了几句话'],
    ans: [1, 0, 2],
    vi: 'Hôm sắp đi, anh ấy tặng tôi cuốn sách đó, và viết mấy câu ở trang đầu.',
  },
  {
    parts: ['所以我从来不在饿的时候去超市', '总会买回一大堆用不着的东西', '肚子饿的时候逛超市'],
    ans: [2, 1, 0],
    vi: 'Đi siêu thị lúc bụng đói thì bao giờ cũng mua về cả đống thứ không cần, nên tôi không bao giờ đi siêu thị lúc đói.',
  },
  {
    parts: ['这个消息让办公室里的人都很吃惊', '他在这家公司工作了十五年', '上个月却突然辞职了'],
    ans: [1, 2, 0],
    vi: 'Anh ấy làm ở công ty này mười lăm năm, tháng trước lại đột ngột nghỉ việc, tin đó khiến cả văn phòng rất ngạc nhiên.',
  },
  {
    parts: ['其中一半以上都是外地来的游客', '这个小镇每年接待的客人超过十万', '当地人反而不太出门'],
    ans: [1, 0, 2],
    vi: 'Thị trấn nhỏ này mỗi năm đón hơn mười vạn khách, hơn nửa là khách phương xa, dân địa phương lại ít ra ngoài.',
  },
  {
    parts: ['第二天早上就好多了', '昨天晚上我头疼得厉害', '吃了药很早就睡了'],
    ans: [1, 2, 0],
    vi: 'Tối qua tôi đau đầu dữ dội, uống thuốc rồi ngủ rất sớm, sáng hôm sau đã đỡ nhiều.',
  },
  {
    parts: ['不但要看菜好不好吃', '选一家饭馆的时候', '还要看服务和环境'],
    ans: [1, 0, 2],
    vi: 'Khi chọn một nhà hàng, không chỉ xem món có ngon không, mà còn phải xem dịch vụ và không gian.',
  },
  {
    parts: ['结果全家人都跟着紧张起来', '妈妈担心我赶不上火车', '一大早就把我叫醒了'],
    ans: [1, 2, 0],
    vi: 'Mẹ lo tôi lỡ tàu nên sáng sớm đã gọi tôi dậy, kết quả cả nhà cũng căng thẳng theo.',
  },
  {
    parts: ['我才明白他为什么那么努力', '直到后来去了他家', '看到墙上贴满了他弟弟的照片'],
    ans: [1, 2, 0],
    vi: 'Mãi tới khi tới nhà anh ấy, thấy trên tường dán đầy ảnh em trai, tôi mới hiểu vì sao anh ấy cố gắng đến vậy.',
  },
  {
    parts: ['因为那时候还没有电梯', '每天要爬六层楼', '我们以前住在这栋楼的顶层'],
    ans: [2, 1, 0],
    vi: 'Trước kia nhà tôi ở tầng trên cùng toà này, ngày nào cũng leo sáu tầng, vì hồi đó chưa có thang máy.',
  },
  {
    parts: ['他反而觉得更有意思了', '这道题连老师都讲错过一次', '别人都说太难放弃了'],
    ans: [1, 2, 0],
    vi: 'Bài này đến thầy còn giảng sai một lần, người khác đều bảo khó quá rồi bỏ, cậu ấy lại thấy thú vị hơn.',
  },
  {
    parts: ['否则到时候一定手忙脚乱', '出发前一天把东西都收拾好', '这是我旅行时的习惯'],
    ans: [2, 1, 0],
    vi: 'Đây là thói quen khi đi du lịch của tôi: hôm trước khi đi phải xếp đồ xong xuôi, nếu không tới lúc đó chắc chắn cuống hết cả lên.',
  },
  {
    parts: ['我们的关系反而比以前更好了', '毕业以后大家都去了不同的城市', '但是每年至少见一次面'],
    ans: [1, 2, 0],
    vi: 'Sau khi tốt nghiệp mỗi người đi một thành phố, nhưng mỗi năm gặp nhau ít nhất một lần, quan hệ lại còn tốt hơn trước.',
  },
];

/**
 * 阅读第三部分 — đoạn văn rồi hai câu hỏi.
 *
 * Đoạn ở đây dài 85–120 chữ; kho cũ trung bình 70, mà đề thật là 80–120. Đoạn ngắn
 * thì đọc lướt qua cũng bắt được từ khoá, nên phần khó thật — giữ được ý qua một đoạn
 * dài và phân biệt ý chính với chi tiết — không bao giờ được luyện tới.
 *
 * Mỗi cụm cố ý hỏi hai tầng khác nhau: một câu hỏi CHI TIẾT (đáp án nằm ở một câu cụ
 * thể) và một câu hỏi Ý CHÍNH hoặc suy ra. Hỏi hai câu chi tiết thì cụm đó chỉ đo được
 * khả năng dò chữ.
 */
export const READ3_EXTRA2: QaItem[] = [
  {
    text: '朋友最近换了工作，工资比原来少了两成，但他说自己从来没这么轻松过。以前他每天要开三个会，晚上还得回邮件，一年到头几乎没有完整的周末。现在他六点准时下班，能陪孩子吃饭，周末还重新开始打篮球。他说，钱当然重要，但一个人一天只有二十四个小时，把时间花在哪儿，其实比挣多少更能决定生活的样子。',
    q: '朋友换工作后有什么变化？',
    opts: ['工资更高了', '每天开会更多', '有时间陪孩子了', '周末还要加班'],
    ans: 2,
    vi: 'Bạn tôi mới đổi việc, lương ít hơn hai phần mười nhưng nói chưa bao giờ thấy nhẹ nhõm thế… giờ sáu giờ tan làm đúng giờ, được ăn cơm với con.',
  },
  {
    text: '',
    sameAudio: true,
    q: '这段话主要想说明：',
    opts: [
      '工资越高越好',
      '怎么花时间比挣多少更重要',
      '换工作一定会更轻松',
      '不应该加班',
    ],
    ans: 1,
    vi: 'Tiền dĩ nhiên quan trọng, nhưng dùng thời gian vào đâu mới quyết định dáng vẻ cuộc sống.',
  },
  {
    text: '我奶奶今年八十二岁，还坚持每天写日记。她写的都是很小的事：今天买了什么菜，谁来看过她，院子里的花开了几朵。有一次我问她，这些事值得记吗？她说，人年纪大了，记性会越来越差，可是翻开本子，那一天就又回来了。她已经写满了三十多本，最早的一本是我出生那年开始的。',
    q: '奶奶的日记主要写什么？',
    opts: ['很重要的大事', '生活中的小事', '给孙子的话', '每天的天气'],
    ans: 1,
    vi: 'Bà tôi viết toàn chuyện rất nhỏ: hôm nay mua rau gì, ai tới thăm, hoa ngoài sân nở mấy bông.',
  },
  {
    text: '',
    sameAudio: true,
    q: '奶奶为什么坚持写日记？',
    opts: [
      '为了练字',
      '翻开本子那一天就回来了',
      '医生建议的',
      '想出一本书',
    ],
    ans: 1,
    vi: 'Bà nói tuổi già trí nhớ kém dần, nhưng mở cuốn sổ ra thì ngày hôm đó lại quay về.',
  },
  {
    text: '很多人学外语时最怕开口，担心说错被人笑话。其实在真正的交流中，对方关心的是你想表达什么，而不是你的语法有没有错。有位老师做过一个统计：学生在课堂上说错的句子，一个月以后有八成他们自己都记不清了，但那些开过口的学生，进步明显比只听不说的快。害怕犯错，往往才是学得慢的真正原因。',
    q: '很多人学外语时最怕什么？',
    opts: ['记不住单词', '开口说话', '写文章', '听不懂'],
    ans: 1,
    vi: 'Nhiều người học ngoại ngữ sợ nhất là mở miệng, sợ nói sai bị cười.',
  },
  {
    text: '',
    sameAudio: true,
    q: '根据这段话，学得慢的真正原因是：',
    opts: ['没有天分', '语法不好', '害怕犯错', '老师教得不好'],
    ans: 2,
    vi: 'Sợ mắc lỗi mới thường là nguyên nhân thật sự khiến học chậm.',
  },
  {
    text: '这家面馆开了四十年，店面很小，只有六张桌子，中午常常要排队。老板从来不做广告，也不肯开分店。有人劝他把生意做大，他说自己一天只能煮那么多碗面，多了就保证不了味道。他宁愿少赚一点儿，也不想让老顾客吃到不如从前的面。四十年里，来吃面的人换了一代又一代，味道却一直没变。',
    q: '老板为什么不肯开分店？',
    opts: [
      '没有钱',
      '担心保证不了味道',
      '找不到合适的地方',
      '快要退休了',
    ],
    ans: 1,
    vi: 'Ông chủ nói một ngày chỉ nấu được bấy nhiêu bát, nhiều hơn thì không đảm bảo được vị.',
  },
  {
    text: '',
    sameAudio: true,
    q: '关于这家面馆，可以知道什么？',
    opts: ['店面很大', '常常需要排队', '经常做广告', '刚开了两年'],
    ans: 1,
    vi: 'Tiệm rất nhỏ, chỉ sáu cái bàn, buổi trưa thường phải xếp hàng.',
  },
  {
    text: '搬家的时候，我从箱子底下翻出一个旧笔记本，是大学时记的。上面写着当时的计划：三十岁以前要去十个国家，学会弹吉他，写完一本小说。到今天为止，我只去了四个国家，吉他买了两年还在角落里放着，小说连开头都没写。可是那天我并没有觉得难过，因为本子上没写的那些事，比如遇见我妻子，反而成了这些年最好的部分。',
    q: '笔记本上写的是什么？',
    opts: ['大学时的计划', '每天的花费', '同学的地址', '老师讲的内容'],
    ans: 0,
    vi: 'Trên đó ghi kế hoạch hồi ấy: trước ba mươi tuổi đi mười nước, học đàn guitar, viết xong một cuốn tiểu thuyết.',
  },
  {
    text: '',
    sameAudio: true,
    q: '作者那天为什么没有难过？',
    opts: [
      '计划都完成了',
      '没写的事成了最好的部分',
      '他已经忘了那些计划',
      '他打算重新开始',
    ],
    ans: 1,
    vi: 'Vì những việc không ghi trong sổ — như gặp vợ anh — lại thành phần hay nhất mấy năm qua.',
  },
  {
    text: '公司上个月开始试行一个新规定：每天下午三点到四点，办公室里不许开会，也不许互相打扰。一开始很多人不习惯，觉得一个小时能做什么。两个月以后统计发现，大家加班的时间平均减少了三成。原因很简单：一整块不被打断的时间，做出来的活儿比分成十次做的强得多。',
    q: '公司的新规定是什么？',
    opts: [
      '每天提前一小时下班',
      '下午三点到四点不开会不打扰',
      '每周开一次大会',
      '中午必须休息',
    ],
    ans: 1,
    vi: 'Mỗi ngày từ 3 đến 4 giờ chiều, trong văn phòng không được họp, cũng không được làm phiền nhau.',
  },
  {
    text: '',
    sameAudio: true,
    q: '这个规定带来了什么结果？',
    opts: ['加班时间减少了三成', '大家更爱开会了', '公司多招了人', '工资提高了'],
    ans: 0,
    vi: 'Hai tháng sau thống kê cho thấy thời gian làm thêm trung bình giảm ba phần mười.',
  },
  {
    text: '很多人以为孩子不爱读书是因为懒。有位图书管理员观察了几年，发现常常是另一个原因：他们手边根本没有合适的书。给一个八岁的孩子一本厚厚的名著，他翻两页就放下了，然后大人说他坐不住。后来这位管理员在书架最下面一层放了一批薄薄的、有很多图的书，那一年借书的孩子多了一倍还不止。',
    q: '图书管理员发现孩子不读书常常是因为：',
    opts: ['太懒', '手边没有合适的书', '不认识字', '家里太吵'],
    ans: 1,
    vi: 'Người quản thư phát hiện thường là vì bên cạnh các em không hề có cuốn sách phù hợp.',
  },
  {
    text: '',
    sameAudio: true,
    q: '他做了什么以后借书的孩子变多了？',
    opts: [
      '在最下面一层放薄的、图多的书',
      '延长了开门时间',
      '请老师来讲课',
      '把名著放在最前面',
    ],
    ans: 0,
    vi: 'Ông đặt ở tầng dưới cùng của giá sách một loạt sách mỏng, nhiều tranh.',
  },
  {
    text: '我以前一直觉得，只要东西还能用，就不该扔。结果家里的柜子越来越满，找一样东西要翻半天。去年我试着定了一条规则：一样东西如果一年没用过，就送人或者扔掉。头一次清理特别难受，扔的时候总觉得以后可能用得上。但半年过去，我一次也没想起来那些东西是什么，倒是找东西的时间少了一大半。',
    q: '作者以前的柜子为什么越来越满？',
    opts: [
      '买的东西太多',
      '觉得能用的就不该扔',
      '柜子太小',
      '家里人多'
    ],
    ans: 1,
    vi: 'Trước kia tác giả luôn nghĩ đồ còn dùng được thì không nên vứt.',
  },
  {
    text: '',
    sameAudio: true,
    q: '按新规则做了半年，结果怎么样？',
    opts: [
      '很后悔扔掉了那些东西',
      '找东西的时间少了很多',
      '又买回了一样的东西',
      '柜子还是很满',
    ],
    ans: 1,
    vi: 'Nửa năm trôi qua anh không nhớ nổi những thứ đó là gì, ngược lại thời gian tìm đồ giảm quá nửa.',
  },
  {
    text: '一位教了三十年数学的老师说，他最不喜欢听到学生说“我没有数学脑子”。他说，这句话最大的问题不是对不对，而是说完以后人就停下来了。他班上有个学生，初一时几乎每次都不及格，但从来不说这句话，只是一道一道地问。三年以后这个学生考进了全市最好的高中。老师说，慢不可怕，可怕的是先给自己下结论。',
    q: '那位老师最不喜欢听到学生说什么？',
    opts: [
      '这道题太难了',
      '我没有数学脑子',
      '我不想做作业',
      '老师讲得太快'
    ],
    ans: 1,
    vi: 'Ông ghét nhất nghe học sinh nói "em không có đầu óc toán".',
  },
  {
    text: '',
    sameAudio: true,
    q: '老师认为这句话的最大问题是：',
    opts: [
      '说完以后人就停下来了',
      '这句话不礼貌',
      '会影响别的同学',
      '说的人成绩一定差',
    ],
    ans: 0,
    vi: 'Vấn đề lớn nhất không phải đúng hay sai, mà là nói xong thì người ta dừng lại.',
  },
  {
    text: '有个关于时间的实验很有意思：让两组人做同样的事，第一组被告知要花二十分钟，第二组被告知要花一个小时。结果第一组平均用了二十五分钟，第二组用了将近一个小时。事情本身没有变，变的只是他们心里给自己定的时间。所以有经验的人做计划时，往往会故意把时间定得紧一点儿。',
    q: '实验中两组人有什么不同？',
    opts: [
      '做的事情不一样',
      '被告知的时间不一样',
      '人数不一样',
      '用的工具不一样',
    ],
    ans: 1,
    vi: 'Hai nhóm làm cùng một việc, chỉ khác nhau ở thời gian được thông báo.',
  },
  {
    text: '',
    sameAudio: true,
    q: '有经验的人做计划时常常怎么做？',
    opts: [
      '把时间定得松一点儿',
      '把时间定得紧一点儿',
      '不做计划',
      '让别人定时间',
    ],
    ans: 1,
    vi: 'Người có kinh nghiệm khi lập kế hoạch thường cố ý đặt thời gian chặt hơn một chút.',
  },
  {
    text: '这条街上原来有二十几家小店，卖菜的、修鞋的、配钥匙的都有。这两年房租涨得厉害，一半以上都关了门，换成了几家看起来很漂亮的咖啡馆。有位住了三十年的老人说，街还是那条街，可是从前他下楼十分钟就能把一天要办的事办完，现在得坐两站公交去别的地方修鞋。',
    q: '这两年这条街发生了什么变化？',
    opts: [
      '开了更多小店',
      '一半以上的小店关了门',
      '房租降了',
      '路加宽了',
    ],
    ans: 1,
    vi: 'Hai năm nay tiền thuê tăng dữ, hơn nửa các tiệm nhỏ đã đóng cửa, thay bằng mấy quán cà phê.',
  },
  {
    text: '',
    sameAudio: true,
    q: '那位老人觉得现在有什么不方便？',
    opts: [
      '修鞋要坐两站公交',
      '咖啡太贵了',
      '路上人太多',
      '晚上太吵',
    ],
    ans: 0,
    vi: 'Giờ ông phải đi hai bến xe buýt sang chỗ khác để sửa giày.',
  },
  {
    text: '刚工作的时候，我以为把事情做完就算完成任务。后来一位老同事教了我一个习惯：每件事做完，花两分钟写下三行字——做了什么、遇到了什么问题、下次怎么改。一开始我觉得这是浪费时间。一年以后翻回去看，才发现同样的错误我几乎没有犯过第二次。那两分钟省下来的，是后面好几个小时。',
    q: '老同事教的习惯是什么？',
    opts: [
      '每天早点儿上班',
      '做完事写三行字',
      '多问领导',
      '把任务分给别人',
    ],
    ans: 1,
    vi: 'Mỗi việc làm xong, dành hai phút ghi ba dòng: đã làm gì, gặp vấn đề gì, lần sau sửa thế nào.',
  },
  {
    text: '',
    sameAudio: true,
    q: '一年以后作者发现了什么？',
    opts: [
      '同样的错误几乎没犯第二次',
      '写字变快了',
      '同事们都在学他',
      '工资涨了',
    ],
    ans: 0,
    vi: 'Một năm sau lật lại xem, anh mới thấy cùng một lỗi hầu như không mắc lần thứ hai.',
  },
  {
    text: '很多广告喜欢用“最”这个字：最好、最快、最便宜。有调查发现，这样的说法反而容易让人不信。相反，那些老老实实说“我们的产品在某一点上做得不错，但另一点还比不上别人”的广告，买的人更多。原因很简单：人们早就习惯了被夸张的话包围，一句听起来诚实的话，反而显得难得。',
    q: '调查发现用“最”这个字会怎么样？',
    opts: [
      '让人更想买',
      '容易让人不信',
      '让产品显得便宜',
      '没有任何影响',
    ],
    ans: 1,
    vi: 'Khảo sát cho thấy cách nói kiểu đó ngược lại dễ khiến người ta không tin.',
  },
  {
    text: '',
    sameAudio: true,
    q: '什么样的广告买的人更多？',
    opts: [
      '说自己什么都最好的',
      '承认自己有不如别人的地方的',
      '价格最低的',
      '出现次数最多的',
    ],
    ans: 1,
    vi: 'Những quảng cáo thật thà nhận mình có điểm chưa bằng người khác lại được mua nhiều hơn.',
  },
  {
    text: '我家附近有个公园，每天早上都有一群老人在那儿唱歌。有一次下大雨，我以为他们不会来了，结果撑着伞还是来了七八个。我问其中一位，雨这么大何必呢。他笑着说，来了几年，认识的人比在单位三十年认识的还多，一天不来就觉得少点儿什么。对他们来说，唱歌其实只是一个理由。',
    q: '那天下大雨，来的老人有多少？',
    opts: ['一个也没有', '两三个', '七八个', '二十多个'],
    ans: 2,
    vi: 'Kết quả vẫn có bảy tám người che ô tới.',
  },
  {
    text: '',
    sameAudio: true,
    q: '根据这段话，老人们来公园主要是为了：',
    opts: [
      '锻炼身体',
      '和熟人见面',
      '学唱歌',
      '躲雨',
    ],
    ans: 1,
    vi: 'Với họ, hát thực ra chỉ là một cái cớ — điều chính là gặp những người quen.',
  },
  {
    text: '手机上的地图确实方便，但有个副作用很少被人注意：用得越多，对一个城市的方向感反而越差。有研究让两组人走同一条路，一组看手机，一组只看纸质地图。一个星期以后请他们把路线画出来，看纸质地图的那组画得准确得多。研究者说，人只有在自己判断方向的时候，脑子里才会真正建起一张地图。',
    q: '研究让两组人做了什么？',
    opts: [
      '走同一条路，用不同的地图',
      '比赛谁走得快',
      '画自己家附近的地图',
      '记住十个地名',
    ],
    ans: 0,
    vi: 'Nghiên cứu cho hai nhóm đi cùng một con đường, một nhóm xem điện thoại, một nhóm chỉ xem bản đồ giấy.',
  },
  {
    text: '',
    sameAudio: true,
    q: '研究者认为脑子里建起地图的条件是：',
    opts: [
      '多看手机',
      '自己判断方向',
      '走得慢一点儿',
      '有人带路',
    ],
    ans: 1,
    vi: 'Người ta chỉ khi tự phán đoán phương hướng thì trong đầu mới thật sự dựng lên một tấm bản đồ.',
  },
];
