/**
 * Đợt "bộ 2" — viết sau khi đọc đề thi thử HSK 4 bộ 2 trên chinesetest.online (16/09/2026).
 *
 * Thứ lấy từ đề đó là **bản đồ**, không phải câu chữ: phần nào hỏi khung ngữ pháp gì,
 * tầng từ vựng nào, gài bẫy kiểu gì. Từ vựng hoá ra không phải chỗ thiếu — 93 từ rút ra
 * từ bộ 2 thì 79 từ deck đã có, 14 từ còn lại phần lớn nằm ngoài 1200 từ đại cương
 * (降温 · 秋季 · 职员 · 消费者 · 读者 · 毕业生). Cái kho THIẾU là **khung câu**, đo bằng
 * số lần xuất hiện trong exam1 + exam2 + weak1 + write1:
 *
 * | Khung bộ 2 hỏi | Có sẵn trong kho |
 * |---|---|
 * | 难道…？ (câu phản vấn) | 1 |
 * | 兼语句 让/请 + người + 通知/提醒 | 3, không câu nào ở 完成句子 |
 * | 对…的理解和支持 · 对…很热情 (对 làm giới từ) | 0 |
 * | 给…提供…条件 (câu hai tân ngữ) | 0 ở 完成句子 |
 * | 比…多了一倍 (bội số) | 4, không câu nào ở 完成句子 |
 * | 竟然 (ngoài dự đoán) | 1 |
 * | 实际上 · 往往 · 按照经验 → 但研究证明 (bác kinh nghiệm) | 0 |
 *
 * **Tình huống và câu chữ ở đây là viết mới, không phải viết lại đề gốc.** Bản đầu của
 * tệp này đã phạm đúng lỗi đó — bảy câu 完成句子 dùng y nguyên bộ mảnh của câu 86–92,
 * mấy câu 排列顺序 giữ nguyên mảnh, và tám đoạn đọc hiểu là cùng chủ đề + cùng lập luận
 * + cùng câu hỏi + cùng đáp án. Luyện trên bản chép lại thì điểm lên là do nhớ đề, và
 * đúng những câu ấy sẽ không xuất hiện ở phòng thi. Giữ lại khung, thay hết nội dung.
 *
 * Ba luật còn lại, cùng với `exam2.ts`, vì đây là chỗ dễ viết dễ dãi nhất:
 *
 * **Mồi nhử phải sai vì một lý do thật**: đúng chữ trong bài nhưng sai chỗ, đúng một nửa,
 * hoặc nói quá (最 · 都 · 一定). Không bao giờ loại được bằng cách nhìn độ dài.
 *
 * **Đoạn 阅读第三部分 phải đủ dài** (90–130 chữ). Đoạn ngắn thì đọc lướt cũng ra, và cái
 * khó thật của phần này — giữ được ý qua một đoạn dài — không bao giờ được luyện.
 *
 * **排列顺序 phải trải đều sáu hoán vị.** Mười câu ở đây đóng góp 4 lần mảnh A đứng đầu,
 * 2 lần B và 4 lần C, vì kho cũ đang lệch (A 19 · B 22 · C 19 trên 60 câu) còn test thì
 * đòi mỗi mảnh dẫn ít nhất `⌊n/3⌋−1` lần. Viết theo đúng thứ tự đọc rồi để `ans: [0,1,2]`
 * là dạy đúng một phản xạ vô dụng ở đề thật.
 */
import type { FillGroup, OrderItem, QaItem, SentItem, TfItem } from '../engine/exam';

/**
 * 听力第一部分 — 判断对错.
 *
 * Bẫy lấy theo bộ 2: 竟然 · 本来…后来 · 难道 · so sánh với quá khứ (比过去…了) và câu
 * châm ngôn — nghe ra chữ thì dễ, giữ đúng CHIỀU của câu mới khó. Năm đúng năm sai để
 * tỉ lệ không đoán được.
 */
export const LISTEN1_B2: TfItem[] = [
  {
    say: '我本来打算周末去郊区爬山，后来听说要降温，就改成在家看书了。',
    stmt: '★ 他周末去爬山了。',
    ok: false,
    vi: 'Vốn định cuối tuần ra ngoại ô leo núi, sau nghe nói trời trở lạnh nên đổi thành ở nhà đọc sách. → Anh ấy đã đi leo núi. (SAI — 本来…后来 là đổi kế hoạch)',
  },
  {
    say: '这么多年没见，他竟然还记得我大学时候的外号，让我特别感动。',
    stmt: '★ 他还记得我的外号。',
    ok: true,
    vi: 'Bao năm không gặp, anh ấy thế mà vẫn nhớ biệt danh hồi đại học của tôi. → Anh ấy vẫn nhớ biệt danh. (ĐÚNG — 竟然 là bất ngờ, không phải phủ định)',
  },
  {
    say: '这些材料你难道没检查一遍就交上去了？下次一定要先看看再交。',
    stmt: '★ 他希望对方先检查再交材料。',
    ok: true,
    vi: 'Tài liệu này lẽ nào anh không kiểm tra lại đã nộp? Lần sau nhất định xem trước rồi nộp. → Anh ấy mong đối phương kiểm tra trước khi nộp. (ĐÚNG — 难道 là trách, vế sau mới là yêu cầu)',
  },
  {
    say: '他现在写字比过去工整多了，本子上几乎找不到涂改的地方。',
    stmt: '★ 他的字还是很难看。',
    ok: false,
    vi: 'Giờ chữ anh ấy ngay ngắn hơn trước nhiều, trong vở gần như không tìm thấy chỗ tẩy xoá. → Chữ anh ấy vẫn xấu. (SAI — 比过去…多了 nghĩa là đã khác)',
  },
  {
    say: '别人看到的只是他今天的成绩，很少有人知道他为这件事准备了三年。',
    stmt: '★ 他很快就做成了这件事。',
    ok: false,
    vi: 'Người ta chỉ thấy thành tích hôm nay của anh ấy, ít ai biết anh ấy đã chuẩn bị ba năm. → Anh ấy làm xong việc này rất nhanh. (SAI — 三年 là ngược lại)',
  },
  {
    say: '今年报名参加汉语比赛的学生比去年多了一倍，教室都快坐不下了。',
    stmt: '★ 今年报名的学生比去年多。',
    ok: true,
    vi: 'Năm nay số sinh viên đăng ký thi tiếng Hán gấp đôi năm ngoái, phòng học sắp không đủ chỗ. → Năm nay đông hơn năm ngoái. (ĐÚNG)',
  },
  {
    say: '经理让我通知大家，明天下午两点在三号会议室开会，别迟到。',
    stmt: '★ 会议在明天上午举行。',
    ok: false,
    vi: 'Giám đốc bảo tôi báo mọi người, hai giờ chiều mai họp ở phòng số ba. → Họp vào sáng mai. (SAI — 下午 chứ không phải 上午)',
  },
  {
    say: '学校给我们提供了很好的学习条件，图书馆二十四小时都开着。',
    stmt: '★ 学校的学习条件不错。',
    ok: true,
    vi: 'Trường cấp cho chúng tôi điều kiện học rất tốt, thư viện mở 24 tiếng. → Điều kiện học của trường khá tốt. (ĐÚNG)',
  },
  {
    say: '房东通知我下个月房租要涨，我已经开始找新的房子了。',
    stmt: '★ 他打算继续住在原来的地方。',
    ok: false,
    vi: 'Chủ nhà báo tôi tháng sau tiền nhà tăng, tôi đã bắt đầu tìm nhà mới. → Anh ấy định ở tiếp chỗ cũ. (SAI — 已经开始找新的房子)',
  },
  {
    say: '这次的活动我恐怕去不了，那天要陪父母去医院复查。',
    stmt: '★ 他那天要去医院。',
    ok: true,
    vi: 'Hoạt động lần này tôi e là không đi được, hôm đó phải đưa bố mẹ đi tái khám. → Hôm đó anh ấy phải tới bệnh viện. (ĐÚNG — 恐怕 là từ chối, lý do mới là đáp án)',
  },
];

/**
 * 听力第二部分 — hội thoại hai lượt.
 *
 * Bộ 2 dồn rất nặng vào ba mảng mà kho cũ mỏng: ngân hàng (存/取/付款), việc công sở
 * (加班 · 请假 · 出差), và thời tiết có dự báo (降温 · 刮风). Bốn lựa chọn ở đây luôn
 * cùng trường nghĩa, nên nghe sót một chữ là chọn nhầm chứ không loại trừ được.
 */
export const LISTEN2_B2: QaItem[] = [
  {
    say: ['男：您好，我想存一笔钱，存一年定期。', '女：好的，请把证件给我，再填一下这张表。', '问：男的要做什么？'],
    q: '男的要做什么？',
    opts: ['取钱', '存钱', '换钱', '借钱'],
    ans: 1,
    vi: 'Nam: Chào chị, tôi muốn gửi một khoản, kỳ hạn một năm. / Nữ: Vâng, cho tôi xin giấy tờ và điền tờ này. → Gửi tiền. (存 chứ không phải 取)',
  },
  {
    say: ['女：这个月的房租你付了吗？', '男：还没，我一会儿下班顺路去交。', '问：男的打算什么时候付房租？'],
    q: '男的打算什么时候付房租？',
    opts: ['已经付了', '下班以后', '明天上午', '下个月'],
    ans: 1,
    vi: 'Nữ: Tiền nhà tháng này anh trả chưa? / Nam: Chưa, lát tan làm tiện đường đi nộp. → Sau khi tan làm.',
  },
  {
    say: ['男：明天要降温，听说得降十度。', '女：那我把厚外套找出来，孩子也得多穿一件。', '问：他们在说什么？'],
    q: '他们在说什么？',
    opts: ['天气变化', '买新衣服', '孩子生病', '房间太热'],
    ans: 0,
    vi: 'Nam: Mai trở lạnh, nghe nói giảm mười độ. / Nữ: Vậy em lấy áo khoác dày ra, con cũng phải mặc thêm. → Đang nói chuyện thời tiết.',
  },
  {
    say: ['女：你怎么还在公司？都九点了。', '男：这几天在加班，材料后天就要交。', '问：男的为什么还没回家？'],
    q: '男的为什么还没回家？',
    opts: ['在等人', '要加班', '路上堵车', '忘了时间'],
    ans: 1,
    vi: 'Nữ: Sao anh còn ở công ty? Chín giờ rồi. / Nam: Mấy hôm nay tăng ca, tài liệu ngày kia phải nộp. → Vì phải tăng ca.',
  },
  {
    say: ['男：小李明天来上班吗？', '女：他请假了，说家里有点儿事，后天回来。', '问：小李后天做什么？'],
    q: '小李后天做什么？',
    opts: ['继续请假', '回来上班', '去出差', '搬家'],
    ans: 1,
    vi: 'Nam: Mai Tiểu Lý đi làm chứ? / Nữ: Anh ấy xin nghỉ, bảo nhà có việc, ngày kia về. → Ngày kia đi làm lại.',
  },
  {
    say: ['女：经理这个星期不在办公室吗？', '男：他去上海出差了，礼拜天才回来。', '问：经理现在在哪儿？'],
    q: '经理现在在哪儿？',
    opts: ['在办公室', '在上海', '在家里', '在机场'],
    ans: 1,
    vi: 'Nữ: Tuần này giám đốc không ở văn phòng à? / Nam: Anh ấy đi công tác Thượng Hải, chủ nhật mới về. → Đang ở Thượng Hải.',
  },
  {
    say: ['男：窗户开着呢，要不要关上？', '女：先别关，让房间里的空气换一换。', '问：女的是什么意思？'],
    q: '女的是什么意思？',
    opts: ['马上关窗', '暂时不关', '打开空调', '出去走走'],
    ans: 1,
    vi: 'Nam: Cửa sổ đang mở, đóng lại không? / Nữ: Khoan đã, để không khí trong phòng đổi một chút. → Tạm thời chưa đóng. (先别 = hãy khoan)',
  },
  {
    say: ['女：你报名参加下个月的马拉松了吗？', '男：报了，不过我只跑一半，全程实在跑不下来。', '问：关于男的，可以知道什么？'],
    q: '关于男的，可以知道什么？',
    opts: ['没有报名', '要跑全程', '只跑一半', '不喜欢跑步'],
    ans: 2,
    vi: 'Nữ: Anh đăng ký marathon tháng sau chưa? / Nam: Rồi, nhưng tôi chỉ chạy nửa đường, toàn tuyến thật sự không nổi. → Chỉ chạy một nửa.',
  },
  {
    say: ['男：这份材料大使馆什么时候能给结果？', '女：一般两个星期，最近申请的人多，可能要久一点儿。', '问：结果可能会怎么样？'],
    q: '结果可能会怎么样？',
    opts: ['提前出来', '比平时晚', '不会通过', '要重新交'],
    ans: 1,
    vi: 'Nam: Hồ sơ này bao giờ đại sứ quán có kết quả? / Nữ: Thường hai tuần, dạo này người nộp đông, có thể lâu hơn. → Muộn hơn bình thường.',
  },
  {
    say: ['女：会议室的空调怎么一直响？', '男：我下午找人来修，你们先去二楼开会吧。', '问：他们下午在哪儿开会？'],
    q: '他们下午在哪儿开会？',
    opts: ['会议室', '二楼', '经理办公室', '一楼大厅'],
    ans: 1,
    vi: 'Nữ: Điều hoà phòng họp sao cứ kêu thế? / Nam: Chiều tôi gọi người sửa, mọi người lên tầng hai họp trước. → Ở tầng hai.',
  },
  {
    say: ['男：你觉得这个新来的同事怎么样？', '女：做事很仔细，就是有时候太紧张，放松点儿就更好了。', '问：女的觉得新同事怎么样？'],
    q: '女的觉得新同事怎么样？',
    opts: ['很马虎', '很仔细', '没有经验', '不爱说话'],
    ans: 1,
    vi: 'Nam: Em thấy đồng nghiệp mới thế nào? / Nữ: Làm việc rất cẩn thận, chỉ là đôi khi căng thẳng quá. → Rất cẩn thận. (就是 bẻ nhẹ, không đổi ý chính)',
  },
  {
    say: ['女：阳台上的被子还没收吗？', '男：再晒半个小时，今天没什么太阳，干得慢。', '问：被子为什么还没收？'],
    q: '被子为什么还没收？',
    opts: ['刚洗完', '还没干', '要送去洗', '忘在楼下'],
    ans: 1,
    vi: 'Nữ: Chăn ngoài ban công chưa thu à? / Nam: Phơi thêm nửa tiếng, hôm nay không nắng nên lâu khô. → Vì chưa khô.',
  },
  {
    say: ['男：周末我们去郊区走走吧，那边空气好。', '女：好啊，不过得早点儿出发，回来的路上容易堵车。', '问：女的提醒男的注意什么？'],
    q: '女的提醒男的注意什么？',
    opts: ['带上雨伞', '早点儿出发', '别忘了钱包', '多穿衣服'],
    ans: 1,
    vi: 'Nam: Cuối tuần ra ngoại ô đi, ngoài đó không khí tốt. / Nữ: Được, nhưng phải đi sớm, lúc về dễ tắc đường. → Nhắc đi sớm.',
  },
  {
    say: ['女：这个任务这么急，一个人来得及吗？', '男：来不及，我打算请小张一起做。', '问：男的打算怎么办？'],
    q: '男的打算怎么办？',
    opts: ['自己完成', '找人帮忙', '推迟几天', '换个任务'],
    ans: 1,
    vi: 'Nữ: Nhiệm vụ gấp thế, một người kịp không? / Nam: Không kịp, tôi định rủ Tiểu Trương làm cùng. → Tìm người giúp.',
  },
  {
    say: ['男：昨天的考试你觉得难吗？', '女：阅读部分还行，写作那道题我写了一半就没时间了。', '问：女的哪部分没做完？'],
    q: '女的哪部分没做完？',
    opts: ['听力', '阅读', '写作', '全都做完了'],
    ans: 2,
    vi: 'Nam: Bài thi hôm qua em thấy khó không? / Nữ: Phần đọc cũng tạm, câu viết em viết nửa chừng thì hết giờ. → Phần viết chưa xong.',
  },
];

/**
 * 听力第三部分 — hội thoại dài, HAI câu trên một lần phát.
 *
 * Câu thứ hai mang `sameAudio` và `say: []`; engine tự đi ngược lên câu mang đoạn để
 * dựng bản thu (xem `audioFor` trong engine/exam.ts). Xáo lẻ hai câu này là câu sau
 * mất đề — nên chúng luôn phải đứng liền nhau và đúng thứ tự.
 */
export const LISTEN3_B2: QaItem[] = [
  {
    say: [
      '女：你上个月去大使馆办的留学申请，有消息了吗？',
      '男：昨天通知我了，说材料都通过了，九月份就能走。',
      '女：太好了！那你去哪个城市？',
      '男：南京。学校还给我提供了半年的住宿，条件比我想的好多了。',
      '问：男的申请留学的结果怎么样？',
    ],
    q: '男的申请留学的结果怎么样？',
    opts: ['还在等', '通过了', '被拒绝了', '材料不全'],
    ans: 1,
    vi: 'Nữ: Đơn du học anh nộp ở đại sứ quán tháng trước có tin chưa? / Nam: Hôm qua báo rồi, hồ sơ qua hết… → Đã được duyệt.',
  },
  {
    say: [],
    sameAudio: true,
    q: '学校给男的提供了什么？',
    opts: ['半年的住宿', '一年的学费', '一份工作', '免费的机票'],
    ans: 0,
    vi: 'Trường cấp cho anh ấy chỗ ở nửa năm, điều kiện tốt hơn anh ấy tưởng.',
  },
  {
    say: [
      '男：这个月的销售数量统计出来了吗？',
      '女：出来了，比上个月多了一倍还多。',
      '男：这么快？是因为打折吗？',
      '女：打折只是一部分原因，主要是我们换了新的广告，引起了很多年轻人的注意。',
      '问：这个月的销售数量怎么样？',
    ],
    q: '这个月的销售数量怎么样？',
    opts: ['和上月差不多', '比上月多一倍还多', '比上月少一点儿', '还没统计出来'],
    ans: 1,
    vi: 'Nam: Số bán tháng này thống kê ra chưa? / Nữ: Ra rồi, hơn gấp đôi tháng trước. → Hơn gấp đôi.',
  },
  {
    say: [],
    sameAudio: true,
    q: '女的认为主要原因是什么？',
    opts: ['商品打折', '换了新广告', '价格降低', '天气变化'],
    ans: 1,
    vi: 'Giảm giá chỉ là một phần, chính là vì đổi quảng cáo mới, thu hút nhiều người trẻ. (打折 có được nhắc nhưng không phải nguyên nhân chính)',
  },
  {
    say: [
      '女：你怎么今天才来？会议不是九点开始吗？',
      '男：别提了，我本来八点就出门了，结果地铁出了问题，等了四十分钟。',
      '女：那你打车过来多好。',
      '男：外面正刮大风，一辆空车也没有。下次我还是提前一个小时出门吧。',
      '问：男的为什么迟到了？',
    ],
    q: '男的为什么迟到了？',
    opts: ['起晚了', '地铁出了问题', '走错了路', '忘记开会'],
    ans: 1,
    vi: 'Nữ: Sao giờ anh mới tới? Họp chẳng phải chín giờ à? / Nam: Đừng nhắc, tôi ra khỏi nhà từ tám giờ, ai ngờ tàu điện ngầm trục trặc… → Vì tàu điện ngầm gặp sự cố.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的打算以后怎么做？',
    opts: ['改坐出租车', '提前一小时出门', '在公司附近住', '不参加会议'],
    ans: 1,
    vi: 'Lần sau anh ấy sẽ ra khỏi nhà sớm hơn một tiếng.',
  },
  {
    say: [
      '男：听说你开始学着做饭了？',
      '女：对，以前我一进厨房就紧张，现在已经能做四五个菜了。',
      '男：进步真快。是跟谁学的？',
      '女：网上看的。其实做饭没那么难，关键是要养成习惯，一个星期做三次，两个月就不一样了。',
      '问：女的觉得学做饭的关键是什么？',
    ],
    q: '女的觉得学做饭的关键是什么？',
    opts: ['有人教', '养成习惯', '买好工具', '看菜谱'],
    ans: 1,
    vi: 'Nữ: Thật ra nấu ăn không khó thế, mấu chốt là tạo được thói quen… → Tạo thói quen.',
  },
  {
    say: [],
    sameAudio: true,
    q: '女的现在能做几个菜？',
    opts: ['一两个', '四五个', '十几个', '一个也不会'],
    ans: 1,
    vi: 'Giờ cô ấy đã nấu được bốn năm món.',
  },
  {
    say: [
      '女：你昨天怎么没去看那个演出？票都买了。',
      '男：姐姐提醒过我，但我还是给忘了，等想起来的时候已经来不及了。',
      '女：太可惜了，演出特别精彩。',
      '男：是啊，我以后得把重要的事都写在手机上，光靠记是不行的。',
      '问：男的昨天为什么没去？',
    ],
    q: '男的昨天为什么没去？',
    opts: ['没买到票', '忘记了', '要加班', '身体不舒服'],
    ans: 1,
    vi: 'Nam: Chị tôi có nhắc rồi mà tôi vẫn quên, tới lúc nhớ ra thì đã muộn. → Vì quên mất.',
  },
  {
    say: [],
    sameAudio: true,
    q: '男的以后打算怎么办？',
    opts: ['让别人提醒', '把事情写下来', '少参加活动', '早点儿出门'],
    ans: 1,
    vi: 'Sau này anh ấy sẽ ghi việc quan trọng vào điện thoại, chỉ nhớ trong đầu là không được.',
  },
  {
    say: [
      '男：你们公司现在有多少人？',
      '女：三百人左右，其中一半以上是刚毕业的年轻人。',
      '男：这么年轻？那经验够吗？',
      '女：刚开始确实差一些，不过公司给每个新人安排了一位老同事带，半年下来大部分都能独立负责任务了。',
      '问：关于女的公司，可以知道什么？',
    ],
    q: '关于女的公司，可以知道什么？',
    opts: ['一共三十人', '年轻人占一半以上', '不招新人', '都是老同事'],
    ans: 1,
    vi: 'Công ty khoảng ba trăm người, hơn một nửa là người trẻ mới tốt nghiệp. → Người trẻ chiếm hơn nửa.',
  },
  {
    say: [],
    sameAudio: true,
    q: '公司用什么办法解决经验的问题？',
    opts: ['只招有经验的人', '让老同事带新人', '把任务分得很小', '让新人多加班'],
    ans: 1,
    vi: 'Công ty xếp mỗi người mới một đồng nghiệp cũ kèm, nửa năm là phần lớn tự đảm nhiệm được.',
  },
];

/**
 * 阅读第一部分 — 选词填空.
 *
 * Bảng sáu từ, năm câu, luôn thừa đúng một từ — chỗ thừa là thứ giữ cho ô cuối không
 * được cho không. Mọi từ trong bảng đều phải nằm trong `DECK.vocab` (bảng ôn trước khi
 * luyện cắt câu bằng chính deck, từ lạ sẽ rơi khỏi bảng). Chỗ trống viết bằng `（　）`.
 *
 * Hai luật nhỏ học được khi sửa bản đầu: **từ đáp án của câu này không được nằm sẵn
 * trong câu khác** (bản đầu để 大部分 trong một câu trong khi 部分 là đáp án của câu
 * trên), và **đừng mượn khung 不但…并且** — đề thật ghép 不但 với 而且, luyện sai là
 * mang cả phản xạ sai vào phòng thi.
 */
export const READ1_B2: FillGroup[] = [
  {
    bank: ['①并且', '②任务', '③引起', '④部分', '⑤偶尔', '⑥否则'],
    items: [
      {
        sent: '他上课时随口说的那句话，（　）了同学们很长时间的讨论。',
        ans: 2,
        vi: 'Câu anh ấy buột miệng nói trong giờ đã làm cả lớp bàn tán rất lâu.',
      },
      {
        sent: '这周的（　）不算重，但每一项都要按时交。',
        ans: 1,
        vi: 'Nhiệm vụ tuần này không nặng, nhưng mục nào cũng phải nộp đúng hạn.',
      },
      {
        sent: '这种材料又轻又结实，（　）价格也不算贵。',
        ans: 0,
        vi: 'Loại vật liệu này vừa nhẹ vừa chắc, hơn nữa giá cũng không đắt.',
      },
      {
        sent: '会议的前一（　）讲计划，后面才谈具体怎么做。',
        ans: 3,
        vi: 'Phần đầu cuộc họp nói về kế hoạch, phía sau mới bàn cách làm cụ thể.',
      },
      {
        sent: '他平时不怎么看电视，（　）陪爷爷看一场足球。',
        ans: 4,
        vi: 'Bình thường anh ấy ít xem tivi, thỉnh thoảng mới ngồi xem bóng đá với ông.',
      },
    ],
  },
  {
    dialogue: true,
    bank: ['①挂', '②干', '③报名', '④郊区', '⑤提供', '⑥热情'],
    items: [
      {
        sent: 'A：墙上（　）着的那张照片是哪年拍的？\nB：我毕业那年，算起来快十年了。',
        ans: 0,
        vi: 'A: Tấm ảnh treo trên tường chụp năm nào vậy? B: Năm tôi tốt nghiệp, tính ra gần mười năm rồi.',
      },
      {
        sent: 'A：周六的汉语角还能（　）吗？\nB：能，名单下班前交就行。',
        ans: 2,
        vi: 'A: Câu lạc bộ tiếng Hán thứ bảy còn đăng ký được không? B: Được, danh sách nộp trước giờ tan làm là được.',
      },
      {
        sent: 'A：房间里能不能给客人（　）一把伞？\nB：可以，门口柜子里还有几把。',
        ans: 4,
        vi: 'A: Trong phòng có thể để sẵn cho khách một cây dù không? B: Được, trong tủ ngoài cửa còn mấy cây.',
      },
      {
        sent: 'A：昨天那位售货员真（　）。\nB：是啊，帮我换了三次尺码也没嫌麻烦。',
        ans: 5,
        vi: 'A: Cô bán hàng hôm qua nhiệt tình thật. B: Ừ, đổi size cho tôi ba lần mà không hề tỏ ra phiền.',
      },
      {
        sent: 'A：外面的被子（　）了吗？\nB：还差一点儿，再晒半个小时吧。',
        ans: 1,
        vi: 'A: Chăn ngoài kia khô chưa? B: Còn thiếu chút nữa, phơi thêm nửa tiếng đi.',
      },
    ],
  },
];

/**
 * 阅读第二部分 — 排列顺序.
 *
 * Mỗi câu gài đúng một mối nối của bộ 2: 竟然 · 只要…就 · 虽然…但是 · 本来…但是 ·
 * 因为…所以 · 提醒→忘→来不及 · câu định nghĩa A 是 B · mệnh đề làm chủ ngữ. Tình huống
 * viết mới; vị trí các mảnh xếp theo hạn ngạch ghi ở đầu tệp, không theo thứ tự đọc.
 */
export const READ2_B2: OrderItem[] = [
  {
    parts: ['我把行李放在门口就去洗手了', '回来的时候箱子已经不见了', '后来才知道是妹妹帮我搬进屋的'],
    ans: [0, 1, 2],
    vi: 'Tôi để hành lý ở cửa rồi đi rửa tay, lúc quay lại thì vali đã không còn, sau mới biết là em gái mang vào nhà giúp.',
  },
  {
    parts: ['同事一大早就提醒过我交表', '可我一忙起来就给忘了', '等想起来的时候办公室已经锁门了'],
    ans: [0, 1, 2],
    vi: 'Đồng nghiệp nhắc tôi nộp biểu từ sáng sớm, thế mà bận lên là quên bẵng, đến lúc nhớ ra thì văn phòng đã khoá cửa.',
  },
  {
    parts: ['一句及时的“谢谢”', '它不花一分钱', '其实是最便宜的礼物'],
    ans: [0, 2, 1],
    vi: 'Một tiếng "cảm ơn" đúng lúc thật ra là món quà rẻ nhất, nó không tốn một xu.',
  },
  {
    parts: ['李医生看病特别有耐心', '没有一个说他态度不好', '在他那儿排过队的病人'],
    ans: [0, 2, 1],
    vi: 'Bác sĩ Lý khám bệnh cực kỳ kiên nhẫn, những bệnh nhân từng xếp hàng chỗ ông không ai nói ông thái độ kém.',
  },
  {
    parts: ['但是离家只有两站路', '这份工作虽然工资一般', '算下来反而比以前轻松'],
    ans: [1, 0, 2],
    vi: 'Công việc này tuy lương bình thường nhưng cách nhà có hai bến, tính ra lại nhẹ hơn trước.',
  },
  {
    parts: ['平时半小时的路走了一个半小时', '因为昨晚下了一场大雪', '今天路上的车都开得特别慢'],
    ans: [1, 2, 0],
    vi: 'Vì tối qua tuyết rơi lớn nên hôm nay xe trên đường đều chạy rất chậm, quãng đường thường nửa tiếng đi mất tiếng rưỡi.',
  },
  {
    parts: ['哪怕一次只有十分钟', '一年下来也是不小的进步', '一件事只要每天做一点儿'],
    ans: [2, 0, 1],
    vi: 'Một việc chỉ cần mỗi ngày làm một chút, dù mỗi lần chỉ mười phút, một năm cũng là tiến bộ không nhỏ.',
  },
  {
    parts: ['但是店员介绍得太认真了', '最后拿着两个包走了出来', '我本来只打算进去看一眼'],
    ans: [2, 0, 1],
    vi: 'Tôi vốn chỉ định vào ngó một cái, nhưng nhân viên giới thiệu nhiệt tình quá, cuối cùng xách hai cái túi đi ra.',
  },
  {
    parts: ['陪他练了三年的那个人', '却很少有人记得', '大家都记得比赛那天站在台上的人'],
    ans: [2, 1, 0],
    vi: 'Ai cũng nhớ người đứng trên bục hôm thi đấu, nhưng rất ít người nhớ người đã tập cùng anh ấy suốt ba năm.',
  },
  {
    parts: ['后来还真的骑完了三百公里', '今年竟然报名参加了长途骑行', '他去年连自行车都骑不稳'],
    ans: [2, 1, 0],
    vi: 'Năm ngoái anh ấy còn đạp xe chưa vững, năm nay lại đăng ký đi xe đạp đường dài, rồi đạp hết ba trăm cây số thật.',
  },
];

/**
 * 阅读第三部分 — đoạn văn + câu hỏi.
 *
 * Bộ 2 đi theo bốn kiểu đoạn, kho cũ chỉ có hai kiểu đầu: ① giải nghĩa một khái niệm,
 * ② lời khuyên có đánh số, ③ **bác lại kinh nghiệm chung** (按照经验人们认为…但研究证明),
 * ④ mẩu chuyện có đuôi. Đợt này viết đủ bốn, chủ đề mới. Cặp hai câu dùng `sameAudio`
 * và phải đứng liền nhau.
 */
export const READ3_B2: QaItem[] = [
  {
    text: '做生意的人常说“回头客”。第一次进店的人，可能只是路过，也可能是被门口的牌子吸引住了；但第二次还愿意来的，才是真的认可你。所以一家店好不好，不看一天进来多少人，而看有多少人肯再来一次。这三个字听着简单，其实是给一家店打的最直接的分数。',
    q: '这段话主要谈的是：',
    opts: ['“回头客”的意思', '怎么开一家店', '广告有什么用', '顾客爱买什么'],
    ans: 0,
    vi: 'Đoạn giải nghĩa cụm 回头客: người quay lại lần hai mới là thước đo thật của một cửa hàng.',
    expl: '“怎么开一家店” là chuyện đoạn không bàn — đúng trường nghĩa nhưng sai ý chính.',
  },
  {
    text: '按照经验，很多人跑完步喜欢马上坐下来，觉得这样恢复得快。但有研究发现，跑完以后再慢慢走上五到十分钟，心跳降得更稳，第二天腿也不那么酸。这并不是说坐下有多大害处，只是提醒我们：让身体当时觉得舒服的做法，不一定就是对身体最好的做法。',
    q: '根据这段话，跑完步以后：',
    opts: ['应该马上坐下', '最好慢走几分钟', '不能马上喝水', '要立刻洗个澡'],
    ans: 1,
    vi: 'Nghiên cứu cho thấy đi bộ chậm 5–10 phút sau khi chạy thì nhịp tim hạ ổn hơn, hôm sau chân đỡ mỏi.',
    expl: '“马上坐下” chính là cái kinh nghiệm đoạn văn bác lại — đúng chữ trong bài nhưng ngược chiều.',
  },
  {
    text: '说明书里的字为什么总写得那么死板？因为它不是给人欣赏的，是给人照着做的。一句话要是有两种理解，用的人就可能装错一次；写得再漂亮，出了错也等于白写。所以写说明书的人第一件事不是想怎么好看，而是把每一句都读一遍，看它会不会被理解成别的意思。',
    q: '写说明书最重要的是：',
    opts: ['写得好看', '不能有两种理解', '越短越好', '用词要高级'],
    ans: 1,
    vi: 'Câu chữ trong hướng dẫn sử dụng phải không thể hiểu thành hai nghĩa, vì người ta làm theo chứ không thưởng thức.',
  },
  {
    text: '学外语要不要先把语法学清楚，一直有两种说法。有人不弄明白规则就不敢开口，也有人先说了大半年，回头再看语法，才发现原来是这么回事。这两条路都有人走得通。所以真正的问题不在先后，而在你是哪一种人：怕出错的人先学规则会更踏实，怕枯燥的人先开口才坚持得下来。',
    q: '根据这段话，学外语：',
    opts: ['必须先学好语法', '先开口的人学得更快', '两条路都走得通', '语法可以不用学'],
    ans: 2,
    vi: 'Có người không nắm rõ quy tắc thì không dám mở miệng, có người nói trước rồi mới quay lại xem ngữ pháp — cả hai đường đều có người đi tới.',
    expl: '“先开口的人学得更快” — đoạn không hề so nhanh chậm, chỉ nói cả hai đường đều đi được.',
  },
  {
    text: '很多人一收到消息就想马上回，好像晚一分钟就是不礼貌。实际上，急着发出去的那句话，往往正是最没想清楚的一句。真要紧的事，对方等你十分钟不会出问题；不要紧的事，本来也不值得你停下手里的活儿。把“马上回”换成“想好了再回”，一天下来会安静很多。',
    q: '作者认为收到消息：',
    opts: ['必须马上回', '想清楚再回也不晚', '最好不要回', '只回重要的人'],
    ans: 1,
    vi: 'Câu trả lời vội thường là câu chưa nghĩ kỹ; việc quan trọng thì đợi mười phút không sao.',
  },
  {
    text: '关于背生词，有两点比“背了多少个”更要紧。第一，别只记意思，最好连着一整句话一起记——一个词单独放在脑子里，真要用的时候想不起来该放在哪儿。第二，宁可每天十个、天天不断，也别留到周末一口气背两百个。忘记这件事是按天算的，不是按次算的。',
    q: '作者认为背生词应该：',
    opts: ['一次背得越多越好', '连着句子一起记', '只记中文意思', '留到周末集中背'],
    ans: 1,
    vi: 'Ý thứ nhất: đừng chỉ nhớ nghĩa, hãy nhớ cả câu — từ đứng một mình thì lúc dùng không biết đặt vào đâu.',
  },
  {
    text: '',
    sameAudio: true,
    q: '根据这段话，可以知道：',
    opts: ['每天坚持比一次突击好', '生词不需要复习', '背得快的人记得牢', '应该先学完语法'],
    ans: 0,
    vi: 'Ý thứ hai: thà mỗi ngày mười từ đều đặn còn hơn dồn hai trăm từ vào cuối tuần — quên tính theo ngày, không theo lần.',
  },
  {
    text: '去年冬天的一个下午，我在地铁口等雨停，旁边一位老人问我要去哪儿。我说就前面两站路。他把自己的伞递过来，说他在这儿等儿子，一会儿就上车，用不着。我问该怎么还给他，他摆摆手说：“下次你也这么给别人就行。”那把伞我用了一个冬天，后来在一个下雨天，交给了一个抱着孩子的姑娘。',
    q: '老人为什么把伞给“我”？',
    opts: ['他要回家了', '他在等人，用不着伞', '他本来就认识“我”', '他想把伞卖掉'],
    ans: 1,
    vi: 'Ông cụ đợi con ở đó, lát nữa lên xe nên không cần dù.',
  },
  {
    text: '',
    sameAudio: true,
    q: '最后那把伞：',
    opts: ['还给了老人', '被“我”弄丢了', '给了另一个人', '一直放在家里'],
    ans: 2,
    vi: 'Một hôm mưa, "tôi" đưa cây dù cho một cô gái đang bế con — đúng điều ông cụ dặn.',
  },
  {
    text: '现在很多饭馆的菜单上，每道菜都配一张照片。有人以为这只是给看不懂菜名的人准备的，其实还有更要紧的一层：照片让人更快做决定。菜单上字一多，人就容易翻来翻去；有了图，十秒钟就能指一个。对饭馆来说，客人坐下到点完菜的时间短了，一张桌子一天就能多接待几拨人。',
    q: '菜单上放照片主要是为了：',
    opts: ['让菜看起来更贵', '帮客人快点做决定', '节省纸张', '吸引小孩子'],
    ans: 1,
    vi: 'Có ảnh thì mười giây là chỉ được một món, không lật tới lật lui.',
    expl: '“让菜看起来更贵” là chuyện đoạn không nói — mồi nhử nghe hợp lý nhưng không có trong bài.',
  },
  {
    text: '',
    sameAudio: true,
    q: '照片对饭馆的好处是：',
    opts: ['能多卖贵的菜', '一张桌子能接待更多客人', '不用请服务员', '菜能做得更快'],
    ans: 1,
    vi: 'Thời gian từ lúc ngồi xuống tới lúc gọi xong món ngắn lại, một bàn mỗi ngày tiếp được nhiều lượt hơn.',
  },
  {
    text: '学校旁边那家小书店开了二十多年。老板说不出几个作家的名字，却记得住常来的每一个人喜欢什么。有学生要考试了，他会从柜台下面摸出一本旧参考书说“这个先拿去用”。后来网上买书越来越方便，店里的人少了一半，可那些毕业多年的人回来，还是会专门绕过去看一眼。老板说，卖书这件事他早就不指望赚钱了，只是习惯了每天开门。',
    q: '关于那家书店，可以知道什么？',
    opts: ['老板很会做生意', '老板记得客人的喜好', '书店已经关门了', '书店只卖参考书'],
    ans: 1,
    vi: 'Ông chủ không kể nổi tên mấy nhà văn nhưng nhớ từng khách quen thích gì.',
  },
];

/**
 * 书写第一部分 — 完成句子.
 *
 * Đây là phần đợt này nhắm chính: bảy khung của bộ 2 mà kho cũ gần như không có ở dạng
 * xếp câu. Bản đầu của tệp này dùng y nguyên bộ mảnh của câu 86–92 đề gốc — đã thay hết
 * tình huống, giữ lại đúng khung.
 *
 * Không bao giờ có mảnh thừa: mảnh nào cho là phải dùng hết, đúng một lần. `accept[0]`
 * là đáp án mẫu và bằng đúng các mảnh ghép lại; những mục sau là cách viết khác cũng
 * chấp nhận (người học GÕ câu trả lời, nên thêm 了 hay đổi vị trí đều có thể xảy ra).
 */
export const WRITE1_B2: SentItem[] = [
  {
    words: ['难道', '这件事', '你', '一点儿也', '不知道'],
    accept: ['难道这件事你一点儿也不知道？', '这件事难道你一点儿也不知道？'],
    vi: 'Lẽ nào chuyện này anh không hay biết gì sao? (难道 mở câu phản vấn, đứng đầu câu hoặc ngay sau chủ đề)',
  },
  {
    words: ['通知', '客户', '老板让小李', '会议改到下周'],
    accept: ['老板让小李通知客户会议改到下周。'],
    vi: 'Sếp bảo Tiểu Lý báo khách hàng cuộc họp dời sang tuần sau. (兼语句: 让 + người + động từ, 通知 lại mang tân ngữ riêng)',
  },
  {
    words: ['这次活动的', '对', '关心和帮助', '感谢大家'],
    accept: ['感谢大家对这次活动的关心和帮助。'],
    vi: 'Cảm ơn mọi người đã quan tâm và giúp đỡ cho hoạt động lần này. (对…的 + danh từ: cả cụm làm tân ngữ)',
  },
  {
    words: ['取消了', '下个月的', '公司', '通知我', '出差'],
    accept: ['公司通知我下个月的出差取消了。'],
    vi: 'Công ty báo tôi chuyến công tác tháng sau đã bị huỷ. (兼语句 + cả mệnh đề làm tân ngữ)',
  },
  {
    words: ['比去年', '这家店', '今年的顾客', '多了一倍'],
    accept: ['这家店今年的顾客比去年多了一倍。'],
    vi: 'Khách của quán này năm nay gấp đôi năm ngoái. (比 + đối tượng + tính từ + 了 + bội số — bội số đứng SAU)',
  },
  {
    words: ['对', '那位', '留学生', '特别热情', '老师'],
    accept: ['那位老师对留学生特别热情。'],
    vi: 'Thầy giáo đó rất nhiệt tình với lưu học sinh. (对 + người + tính từ, không dùng 跟)',
  },
  {
    words: ['提供', '给客人', '免费的', '这家饭馆', '茶水'],
    accept: ['这家饭馆给客人提供免费的茶水。', '这家饭馆给客人提供了免费的茶水。'],
    vi: 'Quán này phục vụ khách nước trà miễn phí. (给 + người đứng TRƯỚC động từ 提供)',
  },
  {
    words: ['引起', '这件小事', '竟然', '这么大的', '误会'],
    accept: ['这件小事竟然引起这么大的误会。', '这件小事竟然引起了这么大的误会。'],
    vi: 'Chuyện nhỏ thế mà lại gây ra hiểu lầm lớn đến vậy. (竟然 đứng sau chủ ngữ, trước động từ)',
  },
  {
    words: ['把', '重要的事', '写在', '我习惯', '本子上'],
    accept: ['我习惯把重要的事写在本子上。'],
    vi: 'Tôi quen ghi việc quan trọng vào sổ. (把 + tân ngữ + 写在 + nơi chốn; 习惯 đứng trước cả cụm 把)',
  },
  {
    words: ['否则', '出发', '得早点儿', '路上会堵车', '我们'],
    accept: ['我们得早点儿出发，否则路上会堵车。'],
    vi: 'Chúng ta phải đi sớm chút, nếu không dọc đường sẽ tắc. (否则 mở vế sau)',
  },
];

/*
 * 书写第二部分 KHÔNG có trong đợt này. Mỗi mục 看图写句子 bắt buộc phải có ảnh cảnh thật
 * trong `/img2` (test `gives every 看图写句子 item a scene picture` chặn), mà kho ảnh chỉ
 * có đúng 20 tấm cho 20 từ đang dùng. Phần này cũng không phải chỗ thiếu: 20 mục = 4 lần
 * số câu một đề. Muốn thêm thì phải dựng ảnh trước, rồi mới viết từ.
 */
