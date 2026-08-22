import type { ExamPaper } from '../engine/exam';
// Đuôi `.ts` viết rõ ra là có lý do: `tools/tts/collect.mjs` nạp thẳng tệp này bằng
// Node, mà Node không tự đoán đuôi như Vite. Thiếu đuôi là gãy đường thu giọng đọc.
import { WRITE1_BANK } from './write1.ts';
import { READ1_EXTRA, READ2_EXTRA, WRITE2_EXTRA } from './reading.ts';

/**
 * Mock paper 1 — HSK（四级）模拟试卷.
 *
 * Written to the official blueprint: 45 listening + 40 reading + 15 writing, in the
 * order and the question types the real paper uses. Vocabulary is held inside the
 * HSK 4 syllabus so nothing here is unfair, and the recurring themes are the ones the
 * published papers keep coming back to — work and study, health, travel, shopping,
 * relationships, weather, and city life.
 *
 * Every item carries a Vietnamese translation, because the point of sitting a mock at
 * home is the review afterwards, not the score.
 */
export const EXAM_1: ExamPaper = {
  id: 'hsk4-mock-1',
  title: 'HSK 4 — Đề mô phỏng số 1',

  // 听力第一部分：判断对错 (10)
  listen1: [
    {
      say: '我想去银行取点儿钱，你要是没什么事儿，就跟我一起去吧，正好可以顺便去那家新开的书店看看。',
      stmt: '★ 他打算去银行。',
      ok: true,
      vi: 'Tôi muốn ra ngân hàng rút ít tiền, nếu bạn không bận gì thì đi cùng tôi, tiện thể ghé hiệu sách mới mở xem thử. → Anh ấy định đi ngân hàng. (ĐÚNG)',
    },
    {
      say: '这个周末我不能去爬山了，公司突然安排我去上海出差，可能要待三四天。',
      stmt: '★ 他周末要去爬山。',
      ok: false,
      vi: 'Cuối tuần này tôi không đi leo núi được, công ty đột ngột cử tôi đi công tác Thượng Hải, chắc phải ở lại ba bốn ngày. → Cuối tuần anh ấy đi leo núi. (SAI)',
    },
    {
      say: '医生说我的感冒不太严重，只要按时吃药、多喝热水，休息两天就会好。',
      stmt: '★ 他的病很严重。',
      ok: false,
      vi: 'Bác sĩ nói cảm của tôi không nặng lắm, chỉ cần uống thuốc đúng giờ, uống nhiều nước ấm, nghỉ hai hôm là khỏi. → Bệnh của anh ấy rất nặng. (SAI)',
    },
    {
      say: '虽然这份工作的收入不算高，但是同事们都很友好，我在这里学到了很多东西。',
      stmt: '★ 他对现在的工作比较满意。',
      ok: true,
      vi: 'Tuy thu nhập công việc này không cao, nhưng đồng nghiệp đều rất thân thiện, tôi học được nhiều thứ ở đây. → Anh ấy khá hài lòng với công việc hiện tại. (ĐÚNG)',
    },
    {
      say: '请大家注意，会议时间提前到明天上午九点，地点还是三楼的会议室，别忘了带材料。',
      stmt: '★ 会议推迟了。',
      ok: false,
      vi: 'Xin mọi người chú ý, giờ họp dời sớm lên 9 giờ sáng mai, địa điểm vẫn là phòng họp tầng ba, đừng quên mang tài liệu. → Cuộc họp bị hoãn lại. (SAI)',
    },
    {
      say: '我从小就喜欢弹钢琴，可惜后来学习太忙，已经好几年没有认真练过了。',
      stmt: '★ 他现在经常弹钢琴。',
      ok: false,
      vi: 'Tôi thích chơi piano từ nhỏ, tiếc là sau này học hành bận quá, mấy năm rồi không luyện nghiêm túc. → Bây giờ anh ấy thường chơi piano. (SAI)',
    },
    {
      say: '这家餐厅的菜味道还不错，价格也很便宜，唯一的缺点就是有点儿远。',
      stmt: '★ 那家餐厅离得比较远。',
      ok: true,
      vi: 'Món ăn nhà hàng này khá ngon, giá cũng rẻ, khuyết điểm duy nhất là hơi xa. → Nhà hàng đó khá xa. (ĐÚNG)',
    },
    {
      say: '出门前一定要看看天气预报，最近的天气变化很快，早上还是晴天，下午就下雨了。',
      stmt: '★ 他提醒别人看天气预报。',
      ok: true,
      vi: 'Trước khi ra ngoài nhất định phải xem dự báo thời tiết, dạo này thời tiết đổi rất nhanh, sáng còn nắng chiều đã mưa. → Anh ấy nhắc mọi người xem dự báo thời tiết. (ĐÚNG)',
    },
    {
      say: '我儿子今年刚上大学，专业是计算机，他说将来想做一名工程师。',
      stmt: '★ 他儿子已经毕业了。',
      ok: false,
      vi: 'Con trai tôi năm nay vừa vào đại học, chuyên ngành máy tính, cháu nói tương lai muốn làm kỹ sư. → Con trai anh ấy đã tốt nghiệp. (SAI)',
    },
    {
      say: '别担心，还有二十分钟才开始检票，我们先去买两瓶水，再慢慢过去也来得及。',
      stmt: '★ 时间还来得及。',
      ok: true,
      vi: 'Đừng lo, còn hai mươi phút nữa mới soát vé, mình đi mua hai chai nước rồi thong thả qua vẫn kịp. → Thời gian vẫn còn kịp. (ĐÚNG)',
    },
  ],

  // 听力第二部分：短对话 + 一个问题 (15)
  listen2: [
    {
      say: ['男：你怎么还站在门口？会议九点就开始了。', '女：我在等小李，他说马上就到。', '问：女的在做什么？'],
      q: '女的在做什么？',
      opts: ['开会', '等人', '打电话', '写报告'],
      ans: 1,
      vi: 'Nam: Sao em còn đứng ở cửa? Chín giờ họp rồi. / Nữ: Em đợi anh Lý, anh ấy bảo sắp tới. → Cô ấy đang đợi người.',
    },
    {
      say: ['女：这件衣服我穿着有点儿大。', '男：那我给您换一件小号的吧。', '问：男的可能是做什么的？'],
      q: '男的可能是做什么的？',
      opts: ['医生', '司机', '售货员', '记者'],
      ans: 2,
      vi: 'Nữ: Bộ này tôi mặc hơi rộng. / Nam: Vậy tôi đổi cho chị cỡ nhỏ hơn nhé. → Anh ấy có thể là nhân viên bán hàng.',
    },
    {
      say: ['男：明天的足球比赛你去看吗？', '女：我很想去，可惜要加班。', '问：女的明天要做什么？'],
      q: '女的明天要做什么？',
      opts: ['看比赛', '加班', '去旅游', '陪朋友'],
      ans: 1,
      vi: 'Nam: Trận đấu ngày mai em đi xem không? / Nữ: Em rất muốn nhưng tiếc là phải tăng ca. → Ngày mai cô ấy phải tăng ca.',
    },
    {
      say: ['女：你的房子租金一个月多少？', '男：三千，水电另外算。', '问：他们在谈什么？'],
      q: '他们在谈什么？',
      opts: ['工资', '房租', '路费', '学费'],
      ans: 1,
      vi: 'Nữ: Tiền thuê nhà của anh một tháng bao nhiêu? / Nam: Ba nghìn, điện nước tính riêng. → Họ đang nói về tiền thuê nhà.',
    },
    {
      say: ['男：这次考试你考得怎么样？', '女：比上次好多了，进步很大。', '问：女的这次考试怎么样？'],
      q: '女的这次考试怎么样？',
      opts: ['没及格', '有进步', '和上次一样', '没参加'],
      ans: 1,
      vi: 'Nam: Kỳ thi lần này em làm thế nào? / Nữ: Tốt hơn lần trước nhiều, tiến bộ rõ. → Cô ấy có tiến bộ.',
    },
    {
      say: ['女：外面还在下雨吗？', '男：已经停了，不过风挺大的。', '问：现在天气怎么样？'],
      q: '现在天气怎么样？',
      opts: ['还在下雨', '下雪了', '风比较大', '很暖和'],
      ans: 2,
      vi: 'Nữ: Ngoài trời còn mưa không? / Nam: Tạnh rồi, có điều gió khá to. → Bây giờ gió khá to.',
    },
    {
      say: ['男：我把钥匙忘在办公室了。', '女：那你只好再回去一趟了。', '问：男的怎么了？'],
      q: '男的怎么了？',
      opts: ['丢了钱包', '忘了带钥匙', '迷路了', '生病了'],
      ans: 1,
      vi: 'Nam: Anh để quên chìa khoá ở văn phòng rồi. / Nữ: Vậy anh đành quay lại một chuyến thôi. → Anh ấy quên mang chìa khoá.',
    },
    {
      say: ['女：你觉得这个电影怎么样？', '男：故事挺感动的，就是有点儿长。', '问：男的觉得电影怎么样？'],
      q: '男的觉得电影怎么样？',
      opts: ['很无聊', '很感动但长', '看不懂', '没意思'],
      ans: 1,
      vi: 'Nữ: Anh thấy phim này thế nào? / Nam: Câu chuyện khá cảm động, chỉ là hơi dài. → Anh ấy thấy cảm động nhưng dài.',
    },
    {
      say: ['男：您好，请问李经理在吗？', '女：他出差了，下周三才回来。', '问：李经理什么时候回来？'],
      q: '李经理什么时候回来？',
      opts: ['今天下午', '明天', '下周三', '下个月'],
      ans: 2,
      vi: 'Nam: Xin chào, cho hỏi giám đốc Lý có ở đây không? / Nữ: Anh ấy đi công tác, thứ Tư tuần sau mới về. → Thứ Tư tuần sau.',
    },
    {
      say: ['女：你怎么不多吃点儿？', '男：我在减肥，晚上尽量少吃。', '问：男的为什么吃得少？'],
      q: '男的为什么吃得少？',
      opts: ['不饿', '在减肥', '菜不好吃', '肚子疼'],
      ans: 1,
      vi: 'Nữ: Sao anh không ăn thêm chút nữa? / Nam: Anh đang giảm cân, buổi tối cố ăn ít. → Vì anh ấy đang giảm cân.',
    },
    {
      say: ['男：你的普通话说得真标准。', '女：哪里，我还在努力练习呢。', '问：男的是什么意思？'],
      q: '男的是什么意思？',
      opts: ['表扬女的', '批评女的', '请女的帮忙', '和女的开玩笑'],
      ans: 0,
      vi: 'Nam: Tiếng phổ thông của em nói chuẩn thật. / Nữ: Đâu có, em vẫn đang cố luyện. → Anh ấy đang khen cô ấy.',
    },
    {
      say: ['女：这份材料你什么时候能弄完？', '男：最晚明天中午交给您。', '问：材料什么时候能交？'],
      q: '材料什么时候能交？',
      opts: ['今天晚上', '明天中午前', '后天', '下周'],
      ans: 1,
      vi: 'Nữ: Tài liệu này khi nào anh làm xong? / Nam: Chậm nhất trưa mai nộp cho chị. → Trước trưa mai.',
    },
    {
      say: ['男：去机场坐地铁快还是打车快？', '女：这个时间堵车，还是地铁吧。', '问：女的建议怎么去机场？'],
      q: '女的建议怎么去机场？',
      opts: ['打车', '坐地铁', '坐公共汽车', '走路'],
      ans: 1,
      vi: 'Nam: Đi sân bay đi tàu điện ngầm nhanh hay taxi nhanh? / Nữ: Giờ này tắc đường, đi tàu điện ngầm đi. → Cô ấy khuyên đi tàu điện ngầm.',
    },
    {
      say: ['女：你怎么看起来这么困？', '男：昨晚写报告写到两点。', '问：男的昨晚做什么了？'],
      q: '男的昨晚做什么了？',
      opts: ['看电视', '写报告', '打游戏', '照顾孩子'],
      ans: 1,
      vi: 'Nữ: Sao trông anh buồn ngủ thế? / Nam: Tối qua anh viết báo cáo tới hai giờ. → Anh ấy viết báo cáo.',
    },
    {
      say: ['男：这个箱子太重了，我一个人搬不动。', '女：我来帮你抬一下。', '问：女的要做什么？'],
      q: '女的要做什么？',
      opts: ['帮忙搬东西', '打电话', '去买箱子', '休息一会儿'],
      ans: 0,
      vi: 'Nam: Cái thùng này nặng quá, một mình anh khiêng không nổi. / Nữ: Để em phụ anh khiêng. → Cô ấy giúp khiêng đồ.',
    },
  ],

  // 听力第三部分：长对话 / 短文，每段问一到两个问题 (20)
  listen3: [
    {
      say: [
        '女：听说你打算去北京读研究生？',
        '男：对，我已经报名了，考试在十二月。',
        '女：那你现在每天复习几个小时？',
        '男：至少五个小时，压力挺大的，不过我觉得值得。',
        '问：男的为什么压力大？',
      ],
      q: '男的为什么压力大？',
      opts: ['要准备考试', '要出国工作', '身体不舒服', '找不到工作'],
      ans: 0,
      vi: 'Nữ: Nghe nói anh định lên Bắc Kinh học cao học? / Nam: Đúng, tôi đăng ký rồi, thi vào tháng 12. / Nữ: Vậy giờ mỗi ngày anh ôn mấy tiếng? / Nam: Ít nhất năm tiếng, áp lực khá lớn nhưng tôi thấy đáng. → Vì phải chuẩn bị thi.',
    },
    {
      say: [],
      sameAudio: true,
      q: '男的每天复习多长时间？',
      opts: ['两个小时', '三个小时', '五个小时以上', '一整天'],
      ans: 2,
      vi: 'Mỗi ngày anh ấy ôn ít nhất năm tiếng.',
    },
    {
      say: [
        '男：你的房间收拾得真干净。',
        '女：我每天早上都花十分钟整理一下，习惯了就不觉得麻烦。',
        '男：我也应该养成这个习惯。',
        '女：其实关键不是时间，是坚持。',
        '问：女的每天花多长时间整理房间？',
      ],
      q: '女的每天花多长时间整理房间？',
      opts: ['十分钟', '半个小时', '一个小时', '两个小时'],
      ans: 0,
      vi: 'Nam: Phòng em dọn sạch thật. / Nữ: Sáng nào em cũng bỏ mười phút dọn một chút, quen rồi thì không thấy phiền. / Nam: Anh cũng nên tập thói quen này. / Nữ: Thật ra mấu chốt không phải thời gian mà là kiên trì. → Mười phút.',
    },
    {
      say: [],
      sameAudio: true,
      q: '女的认为最重要的是什么？',
      opts: ['方法', '时间', '坚持', '工具'],
      ans: 2,
      vi: 'Cô ấy cho rằng mấu chốt là sự kiên trì.',
    },
    {
      say: [
        '很多人以为只有年轻人才需要运动，其实老年人更应该坚持锻炼。适当的运动可以让身体更健康，心情也会变好。当然，运动的时间和方式要根据自己的身体情况来安排，不能勉强。',
        '问：这段话主要谈什么？',
      ],
      q: '这段话主要谈什么？',
      opts: ['旅游的好处', '老年人运动', '看病的经验', '天气的变化'],
      ans: 1,
      vi: 'Nhiều người tưởng chỉ người trẻ mới cần vận động, thật ra người già càng nên kiên trì rèn luyện… → Đoạn này nói về việc người già vận động.',
    },
    {
      say: [],
      sameAudio: true,
      q: '根据这段话，运动应该注意什么？',
      opts: ['越多越好', '要看身体情况', '必须去健身房', '只能早上做'],
      ans: 1,
      vi: 'Thời gian và cách vận động phải tuỳ theo tình trạng cơ thể mình.',
    },
    {
      say: [
        '女：这次去云南玩得怎么样？',
        '男：景色特别美，就是没想到那边早晚温差那么大。',
        '女：你带够衣服了吗？',
        '男：没有，到了以后又买了一件外套。',
        '问：男的到云南以后买了什么？',
      ],
      q: '男的到云南以后买了什么？',
      opts: ['帽子', '外套', '鞋子', '雨伞'],
      ans: 1,
      vi: 'Nữ: Chuyến đi Vân Nam thế nào? / Nam: Cảnh rất đẹp, chỉ là không ngờ chênh lệch nhiệt độ sáng tối lớn thế. / Nữ: Anh mang đủ quần áo chưa? / Nam: Chưa, tới nơi phải mua thêm một cái áo khoác. → Áo khoác.',
    },
    {
      say: [],
      sameAudio: true,
      q: '云南给男的留下了什么印象？',
      opts: ['东西很贵', '人很少', '景色很美', '交通不方便'],
      ans: 2,
      vi: 'Cảnh sắc đặc biệt đẹp.',
    },
    {
      say: [
        '男：你怎么把这本书借了这么久？',
        '女：对不起，我一直很忙，忘记还了。',
        '男：图书馆会不会罚款？',
        '女：会，不过不多，一天两毛。',
        '问：女的为什么没还书？',
      ],
      q: '女的为什么没还书？',
      opts: ['书丢了', '太忙忘了', '还没看完', '图书馆关门了'],
      ans: 1,
      vi: 'Nam: Sao em mượn quyển sách này lâu vậy? / Nữ: Xin lỗi, em bận quá nên quên trả. → Vì bận quá nên quên.',
    },
    {
      say: [],
      sameAudio: true,
      q: '图书馆一天罚多少钱？',
      opts: ['两毛', '两块', '五毛', '不罚款'],
      ans: 0,
      vi: 'Một ngày hai hào.',
    },
    {
      say: [
        '如果你想把汉语学好，光背单词是不够的。语言是用来交流的，所以一定要多说、多听。刚开始说错很正常，别害怕别人笑话你。事实上，敢开口的人进步总是最快的。',
        '问：说话人认为学汉语最重要的是什么？',
      ],
      q: '说话人认为学汉语最重要的是什么？',
      opts: ['多背单词', '敢开口说', '多写汉字', '找好老师'],
      ans: 1,
      vi: 'Muốn học tốt tiếng Trung, chỉ học thuộc từ là chưa đủ… người dám mở miệng nói bao giờ cũng tiến bộ nhanh nhất. → Dám mở miệng nói.',
    },
    {
      say: [],
      sameAudio: true,
      q: '说话人对说错的态度是什么？',
      opts: ['很正常', '很丢人', '应该避免', '要马上改'],
      ans: 0,
      vi: 'Mới đầu nói sai là chuyện rất bình thường.',
    },
    {
      say: [
        '女：先生，您的行李超重了，需要另外付费。',
        '男：超了多少？',
        '女：三公斤，一共两百块。',
        '男：好的，能刷卡吗？',
        '问：他们最可能在哪儿？',
      ],
      q: '他们最可能在哪儿？',
      opts: ['银行', '机场', '医院', '学校'],
      ans: 1,
      vi: 'Nữ: Thưa anh, hành lý của anh quá cân, cần trả thêm phí… → Họ có thể đang ở sân bay.',
    },
    {
      say: [],
      sameAudio: true,
      q: '男的要付多少钱？',
      opts: ['一百块', '两百块', '三百块', '不用付'],
      ans: 1,
      vi: 'Tổng cộng hai trăm tệ.',
    },
    {
      say: [
        '男：听说你换工作了？',
        '女：是啊，新公司离家近，走路十五分钟就到。',
        '男：那太方便了，工资呢？',
        '女：跟以前差不多，但是不用再每天挤地铁了。',
        '问：女的换工作主要是因为什么？',
      ],
      q: '女的换工作主要是因为什么？',
      opts: ['工资高', '离家近', '同事好', '工作轻松'],
      ans: 1,
      vi: 'Nam: Nghe nói em đổi việc rồi? / Nữ: Ừ, công ty mới gần nhà, đi bộ mười lăm phút là tới… → Chủ yếu vì gần nhà.',
    },
    {
      say: [],
      sameAudio: true,
      q: '女的现在的工资怎么样？',
      opts: ['高了很多', '低了一些', '和以前差不多', '还没定'],
      ans: 2,
      vi: 'Lương xấp xỉ như trước.',
    },
    {
      say: [
        '现在很多年轻人习惯用手机付款，出门可以不带钱包。这确实方便，但也要注意安全：密码不要太简单，也别把密码告诉别人。另外，手机丢了要马上打电话给银行。',
        '问：这段话主要提醒我们什么？',
      ],
      q: '这段话主要提醒我们什么？',
      opts: ['别用手机付款', '注意支付安全', '多带现金', '常换手机'],
      ans: 1,
      vi: 'Đoạn này chủ yếu nhắc chúng ta chú ý an toàn khi thanh toán.',
    },
    {
      say: [],
      sameAudio: true,
      q: '手机丢了应该怎么做？',
      opts: ['马上通知银行', '换一个密码本', '先告诉朋友', '等两天再说'],
      ans: 0,
      vi: 'Mất điện thoại phải gọi ngay cho ngân hàng.',
    },
    {
      say: [
        '女：这道菜是你自己做的？味道真不错。',
        '男：我照着网上的方法试了三次才成功。',
        '女：真有耐心。',
        '男：做饭跟学习一样，多试几次就会了。',
        '问：男的做这道菜试了几次？',
      ],
      q: '男的做这道菜试了几次？',
      opts: ['一次', '两次', '三次', '五次'],
      ans: 2,
      vi: 'Nam: Anh làm theo cách trên mạng, thử ba lần mới thành công. → Ba lần.',
    },
    {
      say: [],
      sameAudio: true,
      q: '男的认为做饭和什么相似？',
      opts: ['学习', '运动', '工作', '旅游'],
      ans: 0,
      vi: 'Anh ấy cho rằng nấu ăn giống như học tập.',
    },
  ],
  // 阅读第一部分：选词填空，六选五 (10)
  read1: [
    {
      bank: ['①理解', '②热闹', '③交流', '④温度', '⑤实在', '⑥仔细'],
      items: [
        {
          sent: '春节的时候，街上非常（　），到处都是人和灯笼。',
          ans: 1,
          vi: 'Dịp Tết, ngoài phố vô cùng náo nhiệt.',
        },
        { sent: '请你（　）检查一遍，别再出错了。', ans: 5, vi: 'Bạn kiểm tra kỹ lại một lượt, đừng sai nữa.' },
        {
          sent: '虽然我们语言不同，但用手也能简单地（　）。',
          ans: 2,
          vi: 'Tuy khác ngôn ngữ, dùng tay cũng có thể giao lưu đơn giản.',
        },
        { sent: '今天的（　）比昨天低了五度。', ans: 3, vi: 'Nhiệt độ hôm nay thấp hơn hôm qua năm độ.' },
        { sent: '我完全（　）你现在的心情。', ans: 0, vi: 'Tôi hoàn toàn hiểu tâm trạng của bạn lúc này.' },
      ],
    },
    {
      bank: ['①既然', '②专业', '③按时', '④活泼', '⑤积累', '⑥经验'],
      items: [
        { sent: '医生说这种药要（　）吃，不能忘。', ans: 2, vi: 'Bác sĩ nói thuốc này phải uống đúng giờ.' },
        {
          sent: '（　）你已经决定了，我们就支持你。',
          ans: 0,
          vi: 'Đã quyết rồi thì chúng tôi ủng hộ bạn.',
        },
        { sent: '这个孩子性格很（　），见谁都笑。', ans: 3, vi: 'Đứa bé này tính rất hoạt bát.' },
        {
          sent: '学外语最重要的是慢慢（　）词汇。',
          ans: 4,
          vi: 'Học ngoại ngữ quan trọng nhất là tích luỹ từ vựng dần dần.',
        },
        { sent: '他是一名很（　）的翻译。', ans: 1, vi: 'Anh ấy là một phiên dịch rất chuyên nghiệp.' },
      ],
    },
    ...READ1_EXTRA,
  ],

  // 阅读第二部分：排列顺序 (10)
  read2: [
    {
      parts: ['上个周三我去买过一次', '结果白跑了一趟', '后来我才知道，那家店只在周末开门'],
      ans: [0, 1, 2],
      vi: 'Thứ Tư tuần trước tôi đi mua một lần, kết quả đi không công, sau này mới biết quán đó chỉ mở cuối tuần.',
    },
    {
      parts: ['我发现早上的效率比晚上高很多', '用来背单词和听新闻', '所以我决定每天早起半个小时'],
      ans: [0, 2, 1],
      vi: 'Tôi phát hiện buổi sáng hiệu quả hơn buổi tối nhiều, nên quyết định dậy sớm nửa tiếng, để học từ và nghe tin.',
    },
    {
      parts: ['但是他一句也没有抱怨', '那天他从早上八点一直工作到晚上十点', '这让我们都很佩服'],
      ans: [1, 0, 2],
      vi: 'Hôm đó anh ấy làm từ 8 giờ sáng tới 10 giờ tối, nhưng không than một câu, khiến chúng tôi rất nể.',
    },
    {
      parts: ['并且带上上次讨论的材料', '明天上午的会议非常重要', '请大家提前十分钟到会议室'],
      ans: [1, 2, 0],
      vi: 'Cuộc họp sáng mai rất quan trọng, mọi người đến phòng họp sớm 10 phút và mang tài liệu lần trước.',
    },
    {
      parts: ['现在他已经能和中国朋友聊得很开心了', '这都是他每天坚持练习的结果', '刚来中国的时候，他连点菜都不敢'],
      ans: [2, 0, 1],
      vi: 'Mới sang Trung Quốc cậu ấy đến gọi món cũng không dám; giờ đã trò chuyện vui vẻ với bạn Trung Quốc — đều nhờ luyện tập mỗi ngày.',
    },
    {
      parts: ['幸好我听了她的话', '我看了看窗外，果然下起了大雨', '早上出门前妈妈提醒我带伞'],
      ans: [2, 1, 0],
      vi: 'Sáng ra cửa mẹ nhắc mang ô; tôi nhìn ra cửa sổ, quả nhiên mưa to; may mà tôi nghe lời mẹ.',
    },
    {
      parts: ['这套房子离地铁站有点儿远', '因此价格比市中心便宜不少', '对不着急上班的人来说很合适'],
      ans: [0, 1, 2],
      vi: 'Căn này hơi xa ga tàu điện, vì thế giá rẻ hơn trung tâm nhiều, rất hợp với người không vội đi làm.',
    },
    {
      parts: ['他在公园里捡到一个钱包', '第二天他就把钱包送到了警察局', '里面有身份证和一千多块钱'],
      ans: [0, 2, 1],
      vi: 'Anh ấy nhặt được ví trong công viên, bên trong có CMND và hơn nghìn tệ, hôm sau đem nộp đồn công an.',
    },
    {
      parts: ['直到看见他的机票才相信', '一开始我以为他在开玩笑', '他真的要去非洲工作两年'],
      ans: [1, 0, 2],
      vi: 'Ban đầu tôi tưởng anh ấy đùa, tới khi thấy vé máy bay mới tin, anh ấy thật sự sang châu Phi làm việc hai năm.',
    },
    {
      parts: ['这样不但省钱，而且更健康', '越来越多的年轻人开始自己做饭', '虽然要多花一点儿时间'],
      ans: [1, 2, 0],
      vi: 'Ngày càng nhiều người trẻ tự nấu ăn, tuy tốn thêm chút thời gian, nhưng vừa tiết kiệm vừa khoẻ hơn.',
    },
    ...READ2_EXTRA,
  ],

  // 阅读第三部分：短文 + 一到两个问题 (20)
  read3: [
    {
      text: '很多人觉得，只要努力就一定会成功。其实努力只是条件之一，方向同样重要。如果方向错了，越努力反而离目标越远。所以在开始做一件事之前，最好先花点儿时间想清楚自己到底要什么。',
      q: '这段话主要想告诉我们：',
      opts: ['努力没有用', '方向和努力都重要', '成功靠运气', '别做计划'],
      ans: 1,
      vi: 'Nhiều người cho rằng chỉ cần cố gắng là thành công. Thật ra cố gắng chỉ là một điều kiện, phương hướng cũng quan trọng như vậy…',
    },
    {
      text: '',
      sameAudio: true,
      q: '根据上文，做事之前应该：',
      opts: ['先想清楚目标', '先找人帮忙', '马上开始', '多花钱'],
      ans: 0,
      vi: 'Trước khi bắt đầu nên dành thời gian nghĩ rõ mình muốn gì.',
    },
    {
      text: '张老师教了三十年书，学生们都很喜欢他。他上课很少批评人，遇到学生做错题，他总是先问：“你是怎么想的？”他说，理解学生为什么错，比直接告诉他们正确答案更有用。',
      q: '张老师上课有什么特点？',
      opts: ['很严格', '常批评学生', '先问学生的想法', '只讲课本'],
      ans: 2,
      vi: 'Thầy Trương dạy học ba mươi năm… gặp học sinh làm sai, thầy luôn hỏi trước: "Em nghĩ thế nào?"',
    },
    {
      text: '',
      sameAudio: true,
      q: '张老师认为什么更有用？',
      opts: ['多做练习', '理解学生为什么错', '给学生打高分', '让学生自己看书'],
      ans: 1,
      vi: 'Hiểu vì sao học sinh sai thì hữu ích hơn là nói thẳng đáp án.',
    },
    {
      text: '这家小书店开在大学附近，已经二十年了。老板说，现在网上买书更便宜，来店里的人越来越少。但是他还是不想关门，因为每周末都有一群老顾客来这里喝茶、聊天。他说，书店卖的不只是书。',
      q: '来书店的人为什么变少了？',
      opts: ['书太贵了', '大家在网上买书', '书店搬走了', '老板不想开了'],
      ans: 1,
      vi: 'Ông chủ nói bây giờ mua sách trên mạng rẻ hơn, người đến tiệm ngày càng ít.',
    },
    {
      text: '',
      sameAudio: true,
      q: '“书店卖的不只是书”是什么意思？',
      opts: ['书店还卖茶', '书店给人交流的地方', '书店要涨价', '书店要关门'],
      ans: 1,
      vi: 'Ý là tiệm sách còn là nơi để mọi người gặp gỡ, trò chuyện.',
    },
    {
      text: '孩子第一次做一件事的时候，往往做得又慢又不好。这时候父母如果直接帮他做完，孩子就失去了一次学习的机会。让他自己试，哪怕失败几次，他学到的东西也比你替他做要多得多。',
      q: '这段话主要谈：',
      opts: ['孩子的学习成绩', '父母该不该替孩子做事', '怎么选学校', '孩子的健康'],
      ans: 1,
      vi: 'Đoạn này bàn việc cha mẹ có nên làm thay con hay không.',
    },
    {
      text: '',
      sameAudio: true,
      q: '作者认为让孩子自己试：',
      opts: ['浪费时间', '学到的更多', '容易受伤', '没有必要'],
      ans: 1,
      vi: 'Để con tự thử thì học được nhiều hơn là làm thay.',
    },
    {
      text: '我以前特别害怕在很多人面前说话，一站起来就紧张得说不出话。后来同事建议我先在小组里练习，每次只面对五六个人。半年以后，我已经能在公司大会上做报告了。',
      q: '他以前有什么问题？',
      opts: ['不会写报告', '怕当众讲话', '记性不好', '不喜欢同事'],
      ans: 1,
      vi: 'Trước đây tôi rất sợ nói trước đông người…',
    },
    {
      text: '',
      sameAudio: true,
      q: '他是怎么解决的？',
      opts: ['换了工作', '从小组练习开始', '请人代讲', '吃药'],
      ans: 1,
      vi: 'Anh ấy bắt đầu luyện tập trong nhóm nhỏ.',
    },
    {
      text: '有调查发现，睡前玩手机会让人更难入睡。屏幕的光会让大脑以为现在还是白天。所以专家建议，睡觉前一个小时最好把手机放到别的房间，用看书来代替。',
      q: '睡前玩手机为什么不好？',
      opts: ['浪费电', '让人难以入睡', '对眼睛没影响', '让人变胖'],
      ans: 1,
      vi: 'Ánh sáng màn hình khiến não tưởng vẫn là ban ngày, khó ngủ hơn.',
    },
    {
      text: '',
      sameAudio: true,
      q: '专家建议睡前做什么？',
      opts: ['看书', '看电视', '喝咖啡', '跑步'],
      ans: 0,
      vi: 'Chuyên gia khuyên đọc sách thay cho dùng điện thoại.',
    },
    {
      text: '公司新来的小王刚工作两个月，就把我们部门的表格全部重新整理了一遍。以前找一份材料要十几分钟，现在两分钟就能找到。经理在会上专门表扬了他。',
      q: '小王做了什么？',
      opts: ['换了办公室', '重新整理了表格', '招聘了新人', '写了报告'],
      ans: 1,
      vi: 'Tiểu Vương sắp xếp lại toàn bộ biểu mẫu của phòng.',
    },
    {
      text: '',
      sameAudio: true,
      q: '结果怎么样？',
      opts: ['找材料快多了', '大家不习惯', '花了很多钱', '经理不满意'],
      ans: 0,
      vi: 'Kết quả là tìm tài liệu nhanh hơn nhiều.',
    },
    {
      text: '在中国，请客吃饭的时候，客人一般不会把桌上的菜全部吃完。留一点儿表示菜够多、主人很热情。不过现在越来越多的人觉得这样太浪费，所以“光盘行动”慢慢流行起来。',
      q: '以前留下一点儿菜表示什么？',
      opts: ['菜不好吃', '主人很热情', '客人不饿', '要打包'],
      ans: 1,
      vi: 'Để lại chút thức ăn thể hiện món đủ nhiều, chủ nhà hiếu khách.',
    },
    {
      text: '',
      sameAudio: true,
      q: '“光盘行动”是为了：',
      opts: ['减少浪费', '多做菜', '省下时间', '学做饭'],
      ans: 0,
      vi: '"Quang bàn hành động" là để giảm lãng phí.',
    },
    {
      text: '这条路两边原来是农田，十年前修了地铁以后，慢慢开起了商店和饭馆。现在周末的时候，这里比市中心还热闹。房价也从每平方米五千涨到了三万。',
      q: '这条路是什么时候开始变化的？',
      opts: ['去年', '修地铁以后', '开饭馆以前', '五年前'],
      ans: 1,
      vi: 'Con đường này thay đổi từ sau khi làm tàu điện ngầm.',
    },
    {
      text: '',
      sameAudio: true,
      q: '现在这里的房价是原来的多少倍？',
      opts: ['两倍', '三倍', '五倍', '六倍'],
      ans: 3,
      vi: 'Từ 5.000 lên 30.000 một mét vuông — gấp sáu lần.',
    },
    {
      text: '很多人觉得旅行一定要去很远的地方，其实你住的城市里也有你从来没去过的街道。有一个周末，我按照地图走完了家附近的一条老街，发现了三家很有特点的小店。旅行的关键也许不是距离，而是好奇心。',
      q: '作者那个周末做了什么？',
      opts: ['去了外国', '走完了一条老街', '在家休息', '搬了家'],
      ans: 1,
      vi: 'Cuối tuần đó tác giả đi hết một con phố cổ gần nhà.',
    },
    {
      text: '',
      sameAudio: true,
      q: '作者认为旅行的关键是：',
      opts: ['距离远近', '花多少钱', '好奇心', '时间长短'],
      ans: 2,
      vi: 'Tác giả cho rằng mấu chốt của du lịch là sự tò mò.',
    },
  ],

  // 书写第一部分：完成句子 — kho 51 câu, mỗi đề rút 10 (xem write1.ts)
  write1: WRITE1_BANK,

  // 书写第二部分：看图写句子 (5)
  write2: [
    {
      word: '锻炼',
      scene: 'Một người đang chạy bộ trong công viên buổi sáng.',
      sample: '他每天早上都在公园锻炼身体。',
      vi: 'Sáng nào anh ấy cũng rèn luyện sức khoẻ ở công viên.',
    },
    {
      // 打扫 đã có trong WRITE2_EXTRA với cảnh đầy đủ hơn; hai mục cùng một từ nghĩa là
      // rút đề có lần ra hai câu giống nhau, nên chỗ này đổi sang một từ khác.
      word: '擦',
      scene: 'Một người đang lau tấm cửa sổ lớn, dưới chân có xô nước.',
      sample: '他正在擦房间里的窗户。',
      vi: 'Anh ấy đang lau cửa sổ trong phòng.',
    },
    {
      word: '礼物',
      scene: 'Một người đưa hộp quà buộc nơ cho bạn.',
      sample: '他送给我一个生日礼物。',
      vi: 'Anh ấy tặng tôi một món quà sinh nhật.',
    },
    {
      word: '堵车',
      scene: 'Đường phố kẹt cứng xe cộ vào giờ tan tầm.',
      sample: '下班的时候这条路经常堵车。',
      vi: 'Giờ tan tầm con đường này thường tắc.',
    },
    {
      word: '照片',
      scene: 'Cả gia đình đứng chụp ảnh chung trước cửa nhà.',
      sample: '我们一家人一起照了一张照片。',
      vi: 'Cả nhà chúng tôi cùng chụp một tấm ảnh.',
    },
    ...WRITE2_EXTRA,
  ],
};
