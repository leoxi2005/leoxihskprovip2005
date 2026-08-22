/**
 * Kho bổ sung cho phần ĐỌC và 书写第二部分.
 *
 * Hai chỗ được sửa cho khớp đề thật:
 *
 * **阅读第一部分 — nhóm thứ hai phải là HỘI THOẠI.** Trong đề thật, năm câu 46–50 là
 * câu đơn, còn năm câu 51–55 là *đối thoại hai lượt*: A nói một câu, B đáp một câu, và
 * chỗ trống nằm trong một trong hai lượt đó. Khó hơn hẳn câu đơn — phải đọc lượt kia
 * mới biết chỗ trống cần từ gì. Bản cũ để cả hai nhóm đều là câu đơn, tức bỏ mất đúng
 * một nửa độ khó của phần này.
 *
 * **Kho phải lớn hơn một đề.** Trước đây mỗi phần có đúng số câu của một đề, nên "rút
 * đề" không rút được gì: lần thi thứ hai vẫn y hệt lần đầu.
 *
 * Bảng luôn có SÁU từ cho NĂM chỗ trống — thừa đúng một từ, y như đề thật. Từ thừa
 * không phải để cho có: nó luôn là một từ gần nghĩa hoặc cùng loại với một chỗ trống
 * nào đó, nên đoán mò theo kiểu loại trừ sẽ trượt.
 */
import type { FillGroup, OrderItem, PicItem } from '../engine/exam';

export const READ1_EXTRA: FillGroup[] = [
  // -- câu đơn, dạng câu 46–50 ---------------------------------------------
  {
    bank: ['①严重', '②污染', '③商量', '④详细', '⑤打扰', '⑥禁止'],
    items: [
      {
        sent: '工厂排出的废水让这条河（　）得很厉害。',
        ans: 1,
        vi: 'Nước thải nhà máy làm con sông này ô nhiễm rất nặng.',
      },
      { sent: '这件事我得先跟家里人（　）一下再决定。', ans: 2, vi: 'Việc này tôi phải bàn với người nhà đã rồi mới quyết.' },
      { sent: '请您把当时的情况说得再（　）一点儿。', ans: 3, vi: 'Xin ông kể tình hình lúc đó chi tiết hơn một chút.' },
      { sent: '图书馆里（　）大声说话，请大家注意。', ans: 5, vi: 'Trong thư viện cấm nói to, xin mọi người chú ý.' },
      { sent: '他的病比我们原来想的还要（　）。', ans: 0, vi: 'Bệnh của anh ấy còn nặng hơn chúng tôi tưởng.' },
    ],
  },

  // -- hội thoại, dạng câu 51–55 -------------------------------------------
  {
    dialogue: true,
    bank: ['①温度', '②合适', '③陪', '④来得及', '⑤后悔', '⑥推迟'],
    items: [
      {
        sent: 'A：这件西服你觉得怎么样？\nB：颜色挺好的，就是大小不太（　）。',
        ans: 1,
        vi: 'A: Bộ vest này anh thấy sao? — B: Màu đẹp đấy, mỗi tội cỡ hơi không vừa.',
      },
      {
        sent: 'A：都七点了，你怎么还不出发？\nB：别着急，现在走完全（　）。',
        ans: 3,
        vi: 'A: Bảy giờ rồi sao còn chưa đi? — B: Đừng vội, giờ đi vẫn hoàn toàn kịp.',
      },
      {
        sent: 'A：外面冷不冷？我要不要加件衣服？\nB：今天（　）只有五度，多穿点儿吧。',
        ans: 0,
        vi: 'A: Ngoài trời lạnh không? — B: Hôm nay nhiệt độ có năm độ thôi, mặc thêm vào.',
      },
      {
        sent: 'A：会议不是定在三点吗？\nB：（　）到明天上午了，通知刚发。',
        ans: 5,
        vi: 'A: Họp chẳng phải ba giờ à? — B: Dời sang sáng mai rồi, thông báo vừa gửi.',
      },
      {
        sent: 'A：明天我自己去医院检查就行。\nB：还是我（　）你去吧，路上也好照顾。',
        ans: 2,
        vi: 'A: Mai tôi tự đi khám được. — B: Để tôi đi cùng, dọc đường còn tiện chăm.',
      },
    ],
  },
  {
    dialogue: true,
    bank: ['①肯定', '②收拾', '③招聘', '④耐心', '⑤打折', '⑥专门'],
    items: [
      {
        sent: 'A：行李（　）好了吗？出租车快到了。\nB：还差几件衣服，马上就好。',
        ans: 1,
        vi: 'A: Hành lý soạn xong chưa? — B: Còn mấy bộ đồ, sắp xong rồi.',
      },
      {
        sent: 'A：这个包怎么比上次便宜这么多？\nB：现在（　），只要原价的一半。',
        ans: 4,
        vi: 'A: Sao cái túi này rẻ hơn hẳn lần trước? — B: Đang giảm giá, chỉ còn nửa giá gốc.',
      },
      {
        sent: 'A：你怎么这么确定他会来？\nB：他昨天答应过我，（　）会来。',
        ans: 0,
        vi: 'A: Sao cậu chắc anh ấy sẽ đến thế? — B: Hôm qua anh ấy hứa rồi, chắc chắn sẽ đến.',
      },
      {
        sent: 'A：教小孩子写字真不容易。\nB：是啊，得特别有（　）才行。',
        ans: 3,
        vi: 'A: Dạy trẻ con viết chữ đúng là không dễ. — B: Ừ, phải rất kiên nhẫn mới được.',
      },
      {
        sent: 'A：今天怎么有空过来？\nB：我（　）来看看你，没别的事。',
        ans: 5,
        vi: 'A: Hôm nay sao rảnh qua chơi? — B: Tôi đến thăm cậu thôi, không có việc gì khác.',
      },
    ],
  },
];

/** 阅读第二部分 — thêm mười đoạn ba vế, cùng độ dài với đề thật. */
export const READ2_EXTRA: OrderItem[] = [
  {
    parts: ['没想到刚出门就下起了大雨', '只好回家在客厅里锻炼', '我昨天本来打算去公园跑步'],
    ans: [2, 0, 1],
    vi: 'Hôm qua tôi vốn định ra công viên chạy bộ, không ngờ vừa ra khỏi cửa thì mưa to, đành về nhà tập trong phòng khách.',
  },
  {
    parts: ['所以决定明年再考一次', '成绩出来以后他有点儿失望', '这次考试他只差三分'],
    ans: [2, 1, 0],
    vi: 'Kỳ thi lần này anh ấy chỉ thiếu ba điểm, có kết quả rồi anh hơi thất vọng, nên quyết định sang năm thi lại.',
  },
  {
    parts: ['刚来这个城市的时候我很不适应', '后来慢慢地就习惯了', '现在反而不想离开了'],
    ans: [0, 1, 2],
    vi: 'Mới đến thành phố này tôi rất không quen, sau đó dần dần cũng quen, giờ lại chẳng muốn đi nữa.',
  },
  {
    parts: ['因为经理临时有事', '大家可以先去吃午饭', '会议就推迟到了下午两点'],
    ans: [0, 2, 1],
    vi: 'Vì giám đốc bận đột xuất nên cuộc họp dời tới hai giờ chiều, mọi người có thể đi ăn trưa trước.',
  },
  {
    parts: ['于是就去问了同桌', '这道题我看了半天也没弄懂', '结果比自己一个人看快得多'],
    ans: [1, 0, 2],
    vi: 'Bài này tôi nhìn mãi vẫn không hiểu, thế là đi hỏi bạn cùng bàn, kết quả nhanh hơn hẳn tự xem một mình.',
  },
  {
    parts: ['所以每天都有很多人来排队', '这家店的位置不太好找', '但是味道确实不错'],
    ans: [1, 2, 0],
    vi: 'Quán này vị trí hơi khó tìm, nhưng vị đúng là ngon, nên ngày nào cũng đông người xếp hàng.',
  },
  {
    parts: ['每年只有春节才回来一次', '所以我们已经很久没见面了', '他大学毕业以后就去了南方工作'],
    ans: [2, 0, 1],
    vi: 'Anh ấy tốt nghiệp đại học rồi đi miền Nam làm việc, mỗi năm chỉ về một lần dịp Tết, nên chúng tôi lâu rồi không gặp.',
  },
  {
    parts: ['免得路上堵车来不及', '最好提前半个小时出发', '从这儿到机场大概要一个小时'],
    ans: [2, 1, 0],
    vi: 'Từ đây ra sân bay mất khoảng một tiếng, tốt nhất đi sớm nửa tiếng, kẻo tắc đường không kịp.',
  },
  {
    parts: ['第一次见到他是在图书馆', '上个月在超市又碰见了他', '我才知道原来他就住在我家楼上'],
    ans: [0, 1, 2],
    vi: 'Lần đầu gặp anh ấy là ở thư viện, tháng trước lại gặp ở siêu thị, tôi mới biết hoá ra anh ấy ở ngay tầng trên nhà tôi.',
  },
  {
    parts: ['很多人减肥失败并不是因为懒', '否则很难坚持下去', '而是因为一开始目标就定得太高'],
    ans: [0, 2, 1],
    vi: 'Nhiều người giảm cân thất bại không phải vì lười, mà vì ngay từ đầu đặt mục tiêu quá cao, nếu không thì rất khó kiên trì.',
  },
];

/**
 * 书写第二部分 — thêm mười lăm đề.
 *
 * Đề thật cho một bức ảnh và một từ, phải đặt câu dùng đúng từ đó. App không có ảnh
 * nên tả cảnh bằng tiếng Việt: cùng một ràng buộc (câu phải hợp cảnh VÀ chứa từ cho
 * sẵn), chỉ khác cách trình bày.
 */
export const WRITE2_EXTRA: PicItem[] = [
  { word: '道歉', scene: 'Một người cúi đầu xin lỗi đồng nghiệp vì đến muộn.', sample: '他为迟到的事向同事道歉。', vi: 'Anh ấy xin lỗi đồng nghiệp vì chuyện đến muộn.' },
  { word: '打印', scene: 'Một nhân viên đứng cạnh máy in đang in tài liệu.', sample: '她正在打印会议要用的材料。', vi: 'Cô ấy đang in tài liệu dùng cho cuộc họp.' },
  { word: '排队', scene: 'Nhiều người xếp thành hàng dài trước quầy bán vé.', sample: '大家正在门口排队买票。', vi: 'Mọi người đang xếp hàng mua vé ở cửa.' },
  { word: '后悔', scene: 'Một người đứng trú mưa, nhìn trời, mặt tiếc nuối.', sample: '他很后悔今天没带伞出门。', vi: 'Anh ấy rất hối hận vì hôm nay ra ngoài không mang ô.' },
  { word: '表演', scene: 'Mấy đứa trẻ mặc đồ diễn đang biểu diễn trên sân khấu.', sample: '孩子们正在台上表演节目。', vi: 'Bọn trẻ đang biểu diễn tiết mục trên sân khấu.' },
  { word: '参观', scene: 'Một nhóm học sinh đi theo hướng dẫn viên trong bảo tàng.', sample: '我们明天要去参观博物馆。', vi: 'Ngày mai chúng tôi đi tham quan bảo tàng.' },
  { word: '修理', scene: 'Một người thợ đang sửa chiếc xe đạp bị hỏng bánh.', sample: '师傅正在修理我的自行车。', vi: 'Bác thợ đang sửa xe đạp cho tôi.' },
  { word: '加班', scene: 'Văn phòng đã tối, còn một người ngồi trước máy tính.', sample: '他这个星期几乎天天加班。', vi: 'Tuần này gần như ngày nào anh ấy cũng tăng ca.' },
  { word: '散步', scene: 'Hai vợ chồng già đi chậm trong công viên buổi chiều.', sample: '他们吃完饭常去公园散步。', vi: 'Ăn cơm xong họ hay ra công viên đi dạo.' },
  { word: '讨论', scene: 'Mấy học sinh ngồi quanh bàn, chỉ vào vở và tranh luận.', sample: '同学们正在教室里讨论这个问题。', vi: 'Các bạn đang thảo luận vấn đề này trong lớp.' },
  { word: '打扫', scene: 'Một người cầm chổi dọn phòng khách bừa bộn.', sample: '妈妈正在打扫客厅的卫生。', vi: 'Mẹ đang dọn dẹp phòng khách.' },
  { word: '提醒', scene: 'Một người dán giấy nhớ lên màn hình máy tính.', sample: '请你明天早上提醒我开会。', vi: 'Sáng mai nhắc tôi đi họp nhé.' },
  { word: '尝', scene: 'Một người đưa thìa canh mời người bên cạnh nếm thử.', sample: '你尝尝这个汤的味道怎么样。', vi: 'Bạn nếm thử xem món canh này vị thế nào.' },
  { word: '举办', scene: 'Sân trường treo băng rôn, học sinh đang chạy thi.', sample: '学校下个星期举办运动会。', vi: 'Tuần sau trường tổ chức hội thao.' },
  { word: '迷路', scene: 'Một người cầm điện thoại đứng giữa ngã tư, nhìn quanh.', sample: '我在这个城市里迷路了。', vi: 'Tôi bị lạc đường trong thành phố này.' },
];
