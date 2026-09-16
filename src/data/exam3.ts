/**
 * Đợt "bộ 2" — viết sau khi đọc đề thi thử HSK 4 bộ 2 trên chinesetest.online (16/09/2026).
 *
 * KHÔNG chép câu nào của đề đó. Việc đã làm là đo xem đề ấy hỏi **cái gì**, rồi đối chiếu
 * với kho sẵn có. Từ vựng thì kho đã phủ gần hết: trong 93 từ rút ra từ bộ 2 chỉ có 14 từ
 * nằm ngoài deck, và phần lớn là từ ghép ngoài 1200 từ đại cương (降温 · 收款 · 秋季 ·
 * 职员 · 消费者 · 读者 · 毕业生). Cái kho THIẾU là **khung câu**, đo bằng số lần xuất hiện
 * trong exam1 + exam2 + weak1 + write1:
 *
 * | Khung bộ 2 hỏi | Có sẵn trong kho |
 * |---|---|
 * | 难道…吗 (câu phản vấn) | 1 |
 * | 兼语句 让/请 + người + 通知/做 | 3, không câu nào ở 完成句子 |
 * | 对…的理解和支持 · 对…很热情 (对 làm giới từ) | 0 |
 * | 给…提供…条件 (câu hai tân ngữ) | 0 ở 完成句子 |
 * | 比…多了一倍 (bội số) | 4, không câu nào ở 完成句子 |
 * | 竟然 (ngoài dự đoán) | 1 |
 * | 实际上 · 往往 · 按照经验 → 但研究证明 (bác kinh nghiệm) | 0 |
 *
 * Nên đợt này viết dày vào đúng bảy dòng đó, và ba điều dưới đây được giữ chặt — cùng
 * luật với `exam2.ts`, chép lại ở đây vì đây là chỗ dễ viết dễ dãi nhất:
 *
 * **Mồi nhử phải sai vì một lý do thật**: đúng chữ trong bài nhưng sai chỗ, đúng một nửa,
 * hoặc nói quá (最 · 都 · 一定). Không bao giờ loại được bằng cách nhìn độ dài.
 *
 * **Đoạn 阅读第三部分 phải đủ dài** (88–132 chữ). Đoạn ngắn thì đọc lướt cũng ra, và cái
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
 * Bẫy ở đây đều là bẫy của bộ 2: 竟然 · 本来…后来 · 难道 · so sánh với quá khứ (比过去…了),
 * và câu châm ngôn kiểu 不要总是羡慕别人 — nghe ra chữ thì dễ, giữ đúng CHIỀU của câu mới khó.
 * Nửa đúng nửa sai để tỉ lệ không đoán được.
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
    say: '他现在做事比过去仔细多了，交上来的表格已经三个月没出过错。',
    stmt: '★ 他做事还是很马虎。',
    ok: false,
    vi: 'Giờ anh ấy làm việc cẩn thận hơn trước nhiều, bảng biểu nộp lên ba tháng nay chưa sai lần nào. → Anh ấy vẫn cẩu thả. (SAI — 比过去…多了 nghĩa là đã khác)',
  },
  {
    say: '不要总是羡慕别人的生活，你没看见的是他们为这些付出了多少。',
    stmt: '★ 别人的生活都比自己轻松。',
    ok: false,
    vi: 'Đừng lúc nào cũng ghen tị với cuộc sống người khác, cái bạn không thấy là họ đã đánh đổi bao nhiêu. → Cuộc sống người khác đều nhẹ hơn mình. (SAI — nói quá bằng 都)',
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
    say: '大使馆昨天通知我，我的留学申请已经通过了，下个月就能走。',
    stmt: '★ 他的申请还在等结果。',
    ok: false,
    vi: 'Đại sứ quán hôm qua báo tôi, đơn xin du học đã được duyệt, tháng sau là đi được. → Đơn của anh ấy còn chờ kết quả. (SAI — 已经通过了)',
  },
  {
    say: '我并不是不想帮你搬家，只是那天正好要去机场接一个客户。',
    stmt: '★ 他不愿意帮忙。',
    ok: false,
    vi: 'Không phải tôi không muốn giúp bạn chuyển nhà, chỉ là hôm đó đúng lúc phải ra sân bay đón khách. → Anh ấy không muốn giúp. (SAI — 并不是不 là hai lần phủ định)',
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
    say: ['男：您好，我想把这笔钱存成一年的。', '女：好的，请把身份证给我，再填一下这张表。', '问：男的要做什么？'],
    q: '男的要做什么？',
    opts: ['取钱', '存钱', '换钱', '借钱'],
    ans: 1,
    vi: 'Nam: Chào chị, tôi muốn gửi khoản này kỳ hạn một năm. / Nữ: Vâng, cho tôi xin giấy tờ và điền tờ này. → Gửi tiền. (存 chứ không phải 取)',
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
    say: ['女：你的衬衫还挂在外面呢，干了吗？', '男：还没干，今天没什么阳光。', '问：衬衫为什么还没干？'],
    q: '衬衫为什么还没干？',
    opts: ['刚洗完', '没有阳光', '挂错地方', '天在下雨'],
    ans: 1,
    vi: 'Nữ: Áo anh vẫn treo ngoài kia, khô chưa? / Nam: Chưa khô, hôm nay không có nắng. → Vì không có nắng.',
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
      '问：男的的申请结果怎么样？',
    ],
    q: '男的的申请结果怎么样？',
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
      '男：这个月的销售数量出来了吗？',
      '女：出来了，比上个月多了一倍还多。',
      '男：这么快？是因为打折吗？',
      '女：打折只是一部分原因，主要是我们换了新的广告，引起了很多年轻人的注意。',
      '问：这个月的销售数量怎么样？',
    ],
    q: '这个月的销售数量怎么样？',
    opts: ['和上月差不多', '比上月多一倍还多', '比上月少一点儿', '还没统计出来'],
    ans: 1,
    vi: 'Nam: Số bán tháng này ra chưa? / Nữ: Ra rồi, hơn gấp đôi tháng trước. → Hơn gấp đôi.',
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
      '女：你怎么今天才来？会不是九点开的吗？',
      '男：别提了，我本来八点就出门了，结果地铁出了问题，等了四十分钟。',
      '女：那你打车过来多好。',
      '男：外面正刮大风，一辆空车也没有。下次我还是提前一个小时出门吧。',
      '问：男的为什么迟到了？',
    ],
    q: '男的为什么迟到了？',
    opts: ['起晚了', '地铁出了问题', '走错了路', '忘记开会'],
    ans: 1,
    vi: 'Nữ: Sao giờ anh mới tới? / Nam: Đừng nhắc, tôi ra khỏi nhà từ tám giờ, ai ngờ tàu điện ngầm trục trặc… → Vì tàu điện ngầm gặp sự cố.',
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
 */
export const READ1_B2: FillGroup[] = [
  {
    bank: ['①并且', '②任务', '③引起', '④部分', '⑤偶尔', '⑥否则'],
    items: [
      {
        sent: '人和人之间要是长期缺少交流，很容易（　）不必要的误会。',
        ans: 2,
        vi: 'Người với người nếu lâu ngày thiếu trao đổi, rất dễ gây ra hiểu lầm không cần thiết.',
      },
      {
        sent: '这次的（　）看起来复杂，其实关键只有一个：先弄清楚客户到底要什么。',
        ans: 1,
        vi: 'Nhiệm vụ lần này trông phức tạp, thật ra mấu chốt chỉ một: làm rõ khách hàng thực sự muốn gì.',
      },
      {
        sent: '他不但自己按时完成了工作，（　）还帮新来的同事改了材料。',
        ans: 0,
        vi: 'Anh ấy không những hoàn thành việc đúng hạn, mà còn giúp đồng nghiệp mới sửa tài liệu.',
      },
      {
        sent: '那本小说里写的故事，大（　）都是作者自己经历过的。',
        ans: 3,
        vi: 'Những câu chuyện trong cuốn tiểu thuyết đó, phần lớn là do chính tác giả trải qua.',
      },
      {
        sent: '除了周末，他大部分时间都在教室，（　）也去图书馆看看杂志。',
        ans: 4,
        vi: 'Ngoài cuối tuần, phần lớn thời gian anh ấy ở lớp, thỉnh thoảng cũng ra thư viện xem tạp chí.',
      },
    ],
  },
  {
    dialogue: true,
    bank: ['①挂', '②干', '③报名', '④郊区', '⑤提供', '⑥热情'],
    items: [
      {
        sent: 'A：我那件白衬衫呢？你放哪儿了？\nB：洗了，在阳台上（　）着呢，还没干。',
        ans: 0,
        vi: 'A: Cái áo trắng của tôi đâu? B: Giặt rồi, đang treo ngoài ban công, chưa khô.',
      },
      {
        sent: 'A：去植物园的一共十二位，现在还有人要（　）吗？\nB：算我一个，我明天正好没事。',
        ans: 2,
        vi: 'A: Đi vườn thực vật tổng cộng mười hai người, giờ còn ai muốn đăng ký không? B: Tính tôi một suất.',
      },
      {
        sent: 'A：这两年城里越来越多人喜欢到（　）过周末。\nB：是啊，那边空气新鲜，环境也安静。',
        ans: 3,
        vi: 'A: Hai năm nay càng nhiều người trong phố thích ra ngoại ô nghỉ cuối tuần. B: Ừ, ngoài đó không khí trong lành.',
      },
      {
        sent: 'A：这家店的服务员对客人特别（　）。\nB：所以我每次来都愿意多坐一会儿。',
        ans: 5,
        vi: 'A: Nhân viên quán này với khách rất nhiệt tình. B: Nên lần nào tới tôi cũng muốn ngồi lâu hơn.',
      },
      {
        sent: 'A：学校能不能给留学生（　）一间练习室？\nB：我去问问，应该没什么问题。',
        ans: 4,
        vi: 'A: Trường có thể cấp cho lưu học sinh một phòng tập không? B: Tôi đi hỏi thử, chắc không vấn đề gì.',
      },
    ],
  },
];

/**
 * 阅读第二部分 — 排列顺序.
 *
 * Mỗi câu gài đúng một mối nối của bộ 2: 竟然 · 只要…就 · 虽然…但 · 本来…但是 ·
 * 因为…所以 · 提醒→忘记→来不及 · câu định nghĩa A 是 B. Vị trí các mảnh xếp theo hạn
 * ngạch ghi ở đầu tệp, không theo thứ tự đọc.
 */
export const READ2_B2: OrderItem[] = [
  {
    parts: ['妈妈说我小时候最怕去医院', '一看见穿白衣服的人就哭', '她怎么也没想到我长大会当护士'],
    ans: [0, 1, 2],
    vi: 'Mẹ bảo hồi nhỏ tôi sợ nhất là đi bệnh viện, cứ thấy người mặc áo trắng là khóc, mẹ không ngờ lớn lên tôi lại làm y tá.',
  },
  {
    parts: ['昨天姐姐提醒我去报名', '但我还是给忘了', '结果现在申请也来不及了'],
    ans: [0, 1, 2],
    vi: 'Hôm qua chị nhắc tôi đi đăng ký, nhưng tôi vẫn quên mất, kết quả bây giờ nộp cũng không kịp.',
  },
  {
    parts: ['老师对学生的一个微笑', '它会让学生觉得自己被看见了', '其实是一种肯定和欣赏'],
    ans: [0, 2, 1],
    vi: 'Một nụ cười của thầy dành cho học trò thật ra là sự công nhận và trân trọng, nó khiến học trò thấy mình được nhìn thấy.',
  },
  {
    parts: ['张老师是专门教汉语语法的', '都说她讲得特别清楚', '那些上过她课的学生'],
    ans: [0, 2, 1],
    vi: 'Cô Trương chuyên dạy ngữ pháp tiếng Hán, những sinh viên từng học lớp cô đều nói cô giảng cực rõ.',
  },
  {
    parts: ['虽然只能切水果', '那不过是一把很小的刀', '所以别指望用它切大块的肉'],
    ans: [1, 0, 2],
    vi: 'Đó chẳng qua là con dao rất nhỏ, tuy gọt được hoa quả nhưng đừng mong dùng nó thái miếng thịt to.',
  },
  {
    parts: ['付款的地方也排起了长队', '因为很多名牌商品都在打折', '所以购物的人特别多'],
    ans: [1, 2, 0],
    vi: 'Vì nhiều hàng hiệu đang giảm giá nên người mua sắm rất đông, chỗ thanh toán cũng xếp hàng dài.',
  },
  {
    parts: ['并且愿意为那个目标一直努力', '那他迟早会做成一些事情', '一个人只要有了清楚的目标'],
    ans: [2, 0, 1],
    vi: 'Một người chỉ cần có mục tiêu rõ ràng, lại chịu nỗ lực vì mục tiêu đó, thì sớm muộn cũng làm được việc.',
  },
  {
    parts: ['但是超市门口的广告太吸引人了', '结果一下子拿了满满一车', '他们本来没打算买这些东西'],
    ans: [2, 0, 1],
    vi: 'Họ vốn không định mua mấy thứ này, nhưng quảng cáo ngoài cửa siêu thị hấp dẫn quá, cuối cùng chất đầy cả xe đẩy.',
  },
  {
    parts: ['这少数人才是真正值得珍惜的朋友', '只有很少的人会问你飞得累不累', '当大多数人都在问你飞得高不高的时候'],
    ans: [2, 1, 0],
    vi: 'Khi phần đông đều hỏi bạn bay có cao không, chỉ rất ít người hỏi bạn bay có mệt không — số ít ấy mới là bạn đáng trân trọng.',
  },
  {
    parts: ['现在连点菜都不用看菜单', '没想到他竟然三个月就适应了', '刚来的时候他一句汉语也不会说'],
    ans: [2, 1, 0],
    vi: 'Lúc mới sang anh ấy không nói nổi một câu tiếng Hán, không ngờ ba tháng đã quen, giờ gọi món còn chẳng cần xem thực đơn.',
  },
];

/**
 * 阅读第三部分 — đoạn văn + câu hỏi.
 *
 * Bộ 2 đi theo bốn kiểu đoạn, kho cũ chỉ có hai kiểu đầu: ① giải nghĩa một khái niệm,
 * ② lời khuyên có đánh số, ③ **bác lại kinh nghiệm chung** (按照经验人们认为…但研究证明),
 * ④ mẩu chuyện có đuôi hài. Đợt này viết đủ bốn. Cặp hai câu dùng `sameAudio` và phải
 * đứng liền nhau.
 */
export const READ3_B2: QaItem[] = [
  {
    text: '什么叫“及时雨”？其实不难理解。地里干了很久，正着急的时候下了一场雨，这场雨就来得特别是时候。人也一样：你手头的事情正卡住，谁也帮不上，这时候有个朋友走过来说一句“我来”，那这个朋友就是你的“及时雨”。所以这三个字说的不只是雨，更是那种来得正好的帮助。',
    q: '这段话主要想告诉我们什么？',
    opts: ['“及时雨”的意思', '雨水对农业很重要', '应该多交朋友', '遇事要靠自己'],
    ans: 0,
    vi: 'Đoạn giải nghĩa cụm 及时雨: cơn mưa đến đúng lúc, và người bạn đến đúng lúc. → Nói về nghĩa của cụm từ này.',
    expl: '“多交朋友” là lời khuyên đoạn không đưa ra — đúng chữ trong bài nhưng sai ý chính.',
  },
  {
    text: '按照经验，很多人认为夏天出门应该穿白色的衣服，因为白色看起来凉快。但有研究证明，在太阳最厉害的时候，穿红色反而更能挡住对皮肤有害的那部分光。这并不是说白色不好，只是提醒我们：有些经验听起来很有道理，实际上并没有被认真检查过。',
    q: '根据这段话，可以知道：',
    opts: ['红色比白色好看', '白色对皮肤最好', '经验有时候不可靠', '夏天不应该出门'],
    ans: 2,
    vi: 'Nghiên cứu cho thấy màu đỏ chắn tia hại tốt hơn; ý đoạn là kinh nghiệm chung đôi khi chưa được kiểm chứng.',
    expl: 'Bẫy ở đây là 最 — đoạn chỉ nói 红色 hơn ở một điểm, không nói 白色 tốt nhất hay tệ.',
  },
  {
    text: '新闻里出现的数字，目的是把事情说清楚，所以它们必须准确。少写一个零和多写一个零，读者得到的印象完全不同。正因为这样，做新闻的人对数字往往比对句子更小心：句子写得不好看，别人只是不爱读；数字写错了，那就是把错的东西交给了相信你的人。',
    q: '新闻中的数字：',
    opts: ['不容易理解', '可以随便使用', '比句子更好写', '不能出错'],
    ans: 3,
    vi: 'Số liệu trong tin tức phải chính xác; viết sai là đưa cái sai cho người tin mình. → Không được sai.',
  },
  {
    text: '人们一般认为，成年人每天应该睡够七到八个小时。但也有人只睡五六个小时，白天照样有精神，工作也不受影响。所以睡多久并没有一个所有人都适合的数字，真正值得注意的不是时间的长短，而是第二天醒来以后的状态。',
    q: '根据这段话，睡觉时间：',
    opts: ['越长越好', '越短越好', '因人而不同', '必须是八小时'],
    ans: 2,
    vi: 'Không có con số hợp với tất cả mọi người; cái đáng chú ý là trạng thái sau khi thức dậy. → Tuỳ từng người.',
    expl: 'Hai lựa chọn 越长越好 / 越短越好 đều là nói quá — đoạn bác cả hai.',
  },
  {
    text: '我朋友在公交车上丢过好几次钱包。有一天他想了个办法：出门前把几张废纸折好放进一个信封，专门放在最容易被拿走的那个口袋里。那天下午，信封果然不见了。第二天他刚上车不久，就发现口袋里又有东西——正是昨天那个信封，上面还写着一行字：“请别开这种玩笑，谢谢配合。”',
    q: '根据这段话，可以知道：',
    opts: ['朋友找回了钱包', '小偷被骗了一次', '信封里装着钱', '朋友认识那个小偷'],
    ans: 1,
    vi: 'Người bạn nhét giấy vụn vào phong bì làm mồi; tên trộm lấy xong hôm sau trả lại kèm mấy chữ. → Tên trộm bị lừa một vố.',
  },
  {
    text: '有些人喜欢不停地换工作，他们总觉得下一份一定比现在这份好。实际上，适应一个新环境、弄懂它的规矩，一般需要一年左右。不到一年就走，等于每次都只经历了最难受的那一段，把最有意思的部分留给了别人。当然这不是说不能换，而是说换之前最好先问问自己：我到底是在找更好的工作，还是在躲现在的困难。',
    q: '有些人经常换工作是因为他们：',
    opts: ['能力不够', '总觉得下一份更好', '身体不好', '喜欢认识新同事'],
    ans: 1,
    vi: 'Họ luôn cho rằng công việc tiếp theo nhất định tốt hơn cái hiện tại.',
  },
  {
    text: '',
    sameAudio: true,
    q: '作者认为换工作之前应该：',
    opts: ['先找好下一家', '问清楚工资', '想清楚自己在躲什么', '至少工作五年'],
    ans: 2,
    vi: 'Tác giả khuyên trước khi nhảy việc hãy tự hỏi: mình đang tìm việc tốt hơn hay đang trốn cái khó hiện tại.',
  },
  {
    text: '关于读书，有两点值得注意。第一，要养成愿意读下去的习惯，读得多了，看事情的角度自然就多了。第二，也是更容易被忽略的一点：不要把书上写的全部当成对的。作者也会有自己的位置和限制，他说的不一定适合你的情况。否则读得越多，反而越不会自己想问题。',
    q: '根据这段话，读书要：',
    opts: ['完全相信作者', '多做读书笔记', '有自己的看法', '读得越快越好'],
    ans: 2,
    vi: 'Ý thứ hai: đừng coi mọi thứ trong sách là đúng, nếu không đọc càng nhiều càng không tự nghĩ được. → Phải có chính kiến.',
  },
  {
    text: '',
    sameAudio: true,
    q: '根据这段话，阅读可以让人：',
    opts: ['很快变富', '看问题的角度变多', '更有耐心', '不再需要老师'],
    ans: 1,
    vi: 'Ý thứ nhất: đọc nhiều thì góc nhìn tự nhiên nhiều hơn.',
  },
  {
    text: '一种奶茶能受欢迎，光好喝是不够的。现在卖得最好的那几种，往往在颜色上也下了功夫：杯子是透明的，一层一层看得清清楚楚，年轻人拿在手里就想拍一张照片发出去。对做生意的人来说，这等于顾客替你做了广告。所以有人说，这几年的饮料，一半是卖给嘴的，一半是卖给眼睛的。',
    q: '根据这段话，那几种奶茶卖得好是因为：',
    opts: ['价格特别便宜', '味道和样子都讲究', '只在网上卖', '广告花了很多钱'],
    ans: 1,
    vi: 'Không chỉ ngon mà còn chú trọng màu sắc, ly trong suốt để chụp ảnh. → Cả vị lẫn hình thức.',
    expl: '广告花了很多钱 ngược với ý đoạn: chính khách hàng làm quảng cáo hộ.',
  },
  {
    text: '',
    sameAudio: true,
    q: '“一半是卖给眼睛的”是什么意思？',
    opts: ['看起来好看也很重要', '眼睛比嘴更重要', '奶茶对眼睛好', '只能看不能喝'],
    ans: 0,
    vi: 'Câu đó nói: trông đẹp mắt cũng là một nửa lý do bán được.',
  },
  {
    text: '学校旁边那家小书店开了二十多年。老板不认识几个作家，却记得住常来的每一个人喜欢什么。有学生要考试了，他会从柜台下面拿出一本旧参考书说“这个先拿去用”。后来网上买书越来越方便，店里的人少了一半，但那些毕业多年的人回来，还是会专门绕过去看一眼。老板说，卖书这件事，他早就不指望赚钱了，只是习惯了每天开门。',
    q: '关于那家书店，可以知道什么？',
    opts: ['老板很会做生意', '老板记得客人的喜好', '书店已经关门了', '书店只卖参考书'],
    ans: 1,
    vi: 'Ông chủ không biết mấy nhà văn nhưng nhớ từng khách quen thích gì.',
  },
];

/**
 * 书写第一部分 — 完成句子.
 *
 * Đây là phần đợt này nhắm chính: bảy khung của bộ 2 mà kho cũ gần như không có ở dạng
 * xếp câu. Không bao giờ có mảnh thừa — mảnh nào cho là phải dùng hết, đúng một lần.
 * `accept[0]` là đáp án mẫu và bằng đúng các mảnh ghép lại.
 */
export const WRITE1_B2: SentItem[] = [
  {
    words: ['调查', '你没有', '一下', '难道', '先'],
    accept: ['难道你没有先调查一下？', '你难道没有先调查一下？'],
    vi: 'Lẽ nào anh không điều tra trước một chút sao? (难道 mở câu phản vấn, 先 đứng trước động từ)',
  },
  {
    words: ['通知', '下午两点开会', '校长让我', '大家'],
    accept: ['校长让我通知大家下午两点开会。'],
    vi: 'Hiệu trưởng bảo tôi báo mọi người hai giờ chiều họp. (兼语句: 让 + người + động từ, 通知 lại mang tân ngữ riêng)',
  },
  {
    words: ['我们工作的', '对', '理解和支持', '非常感谢您'],
    accept: ['非常感谢您对我们工作的理解和支持。'],
    vi: 'Rất cảm ơn ngài đã thấu hiểu và ủng hộ công việc của chúng tôi. (对…的 + danh từ: cả cụm làm tân ngữ)',
  },
  {
    words: ['通过了', '我的', '大使馆', '通知我', '申请', '留学'],
    accept: ['大使馆通知我我的留学申请通过了。', '大使馆通知我，我的留学申请通过了。'],
    vi: 'Đại sứ quán báo tôi đơn du học của tôi đã được duyệt. (兼语句 + mệnh đề làm tân ngữ)',
  },
  {
    words: ['比前年', '今年的', '毕业生数量', '多了一倍'],
    accept: ['今年的毕业生数量比前年多了一倍。'],
    vi: 'Số sinh viên tốt nghiệp năm nay gấp đôi năm kia. (比 + đối tượng + tính từ + 了 + bội số — bội số đứng SAU)',
  },
  {
    words: ['餐厅的', '对', '我们', '很热情', '服务员'],
    accept: ['餐厅的服务员对我们很热情。'],
    vi: 'Nhân viên nhà hàng rất nhiệt tình với chúng tôi. (对 + người + tính từ, không dùng 跟)',
  },
  {
    words: ['提供', '给我们', '很好', '的', '学校', '条件'],
    accept: ['学校给我们提供很好的条件。', '学校给我们提供了很好的条件。'],
    vi: 'Trường cấp cho chúng tôi điều kiện rất tốt. (给 + người đứng TRƯỚC động từ 提供)',
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
