/**
 * Ngữ pháp mà TỪNG PHẦN của đề thật sự kiểm tra, viết tay.
 *
 * Ở riêng một file vì `tools/tts/collect.mjs` phải đọc được nó để thu giọng cho mấy
 * câu ví dụ: bảng ôn đọc chúng lên, mà collect chạy bằng Node thì không import nổi
 * `prep.ts` (nó kéo theo `src/data/index.ts`, chỗ có `import.meta.env` của Vite).
 * Bảng nằm ở đây thì cả hai bên dùng chung một nguồn, không phải chép lại.
 */

import type { PartId } from './exam';

export interface PartNote {
  /** Tên điểm ngữ pháp, tiếng Việt. */
  name: string;
  /** Công thức hoặc khung câu, viết bằng chữ Hán. */
  formula?: string;
  /** Vì sao nó quyết định điểm ở phần này. */
  why: string;
  /** Ví dụ: câu chữ Hán và nghĩa. */
  eg: { cn: string; vi: string }[];
}

/**
 * Ngữ pháp mà từng phần thật sự KIỂM TRA.
 *
 * Không suy ra từ dữ liệu được, và cũng không nên: cái quyết định điểm 排列顺序 không
 * phải là câu ấy chứa từ gì, mà là luật "đại từ không mở đoạn". Đây là những luật đó,
 * viết cho người Việt học — chọn theo lỗi người Việt hay mắc, không phải theo sách
 * ngữ pháp muốn dạy gì.
 */
export const PART_NOTES: Record<PartId, PartNote[]> = {
  '听力第一部分': [
    {
      name: 'Từ chuyển ý: 但是 · 不过 · 其实 · 可是',
      why: 'Đoạn ghi âm hay nói một ý rồi bẻ lại. Câu ★ gần như luôn hỏi Ý SAU chỗ bẻ, còn ý trước chỗ bẻ chính là cái bẫy.',
      eg: [
        { cn: '这家饭馆很有名，不过我觉得一般。', vi: 'Quán này nổi tiếng, nhưng tôi thấy bình thường.' },
        { cn: '他其实并不喜欢跑步。', vi: 'Thực ra anh ấy không hề thích chạy bộ.' },
      ],
    },
    {
      name: 'Phủ định mềm: 并不 · 不太 · 没什么 · 不见得',
      why: 'Đây là chỗ ĐÚNG/SAI lật. Nghe ra từ khoá mà bỏ qua một chữ 不 phía trước là mất trọn câu.',
      eg: [
        { cn: '他并不是不想去，只是没时间。', vi: 'Không phải anh ấy không muốn đi, chỉ là không có thời gian.' },
        { cn: '这个办法不见得管用。', vi: 'Cách này chưa chắc đã hiệu quả.' },
      ],
    },
    {
      name: 'Ước lượng: 左右 · 差不多 · 大概 · 至少 · 将近',
      why: 'Câu ★ hay đổi con số đi một chút. 三十岁左右 không phải 三十岁, và cũng không sai — phải nghe cả từ ước lượng chứ không chỉ nghe con số.',
      eg: [
        { cn: '会议大概开了两个小时。', vi: 'Cuộc họp kéo dài khoảng hai tiếng.' },
        { cn: '这条路至少要走半个小时。', vi: 'Con đường này đi ít nhất nửa tiếng.' },
      ],
    },
    {
      name: 'Đã xong hay chưa: 已经…了 · 还没…呢 · 过',
      formula: '已经 + 动词 + 了 · 还没 + 动词 + 呢 · 动词 + 过',
      why: 'Câu ★ hay lật đúng chỗ này: băng nói "chưa làm", câu in ra "đã làm rồi". Một chữ 没 với một chữ 了 quyết định cả câu.',
      eg: [
        { cn: '我已经把票买好了。', vi: 'Tôi đã mua vé xong rồi.' },
        { cn: '这部电影我还没看过呢。', vi: 'Bộ phim này tôi vẫn chưa xem.' },
      ],
    },
    {
      name: 'Chắc chắn hay chỉ là có thể: 可能 · 也许 · 应该 · 一定 · 肯定',
      why: 'Băng nói "có lẽ", câu ★ in thành "chắc chắn" — đó là câu SAI, dù nội dung còn lại đúng hết. Bẫy này ra đều đặn.',
      eg: [
        { cn: '他可能已经到家了。', vi: 'Có lẽ anh ấy đã về tới nhà.' },
        { cn: '明天肯定会下雨。', vi: 'Ngày mai chắc chắn sẽ mưa.' },
      ],
    },
    {
      name: 'Ai là người làm việc đó',
      why: 'Cách lật rẻ tiền nhất mà đề vẫn dùng: giữ nguyên sự việc, đổi mỗi chủ ngữ. Nghe đúng nội dung vẫn sai câu nếu không để ý ai làm.',
      eg: [
        { cn: '要去留学的是我妹妹，不是我。', vi: 'Người đi du học là em gái tôi, không phải tôi.' },
        { cn: '这个决定是经理做的。', vi: 'Quyết định này là do giám đốc đưa ra.' },
      ],
    },
  ],

  '听力第二部分': [
    {
      name: 'Câu hỏi hỏi VỀ AI',
      formula: '男的… / 女的… / 关于…，可以知道什么？',
      why: 'Hai người nói, nhưng câu hỏi chỉ hỏi một. Nghe đúng nội dung mà trả lời nhầm người là lỗi mất điểm nhiều nhất ở phần này.',
      eg: [
        { cn: '女的最可能是做什么的？', vi: 'Người nữ có khả năng làm nghề gì?' },
        { cn: '关于男的，可以知道什么？', vi: 'Về người nam, có thể biết được điều gì?' },
      ],
    },
    {
      name: 'Nghe TỪ ĐỂ HỎI trước đã: 为什么 · 怎么 · 什么时候 · 多长时间 · 哪儿',
      why: 'Câu hỏi đọc sau đoạn thoại, nhưng bốn đáp án thì in sẵn trên đề. Liếc đáp án là đoán được sẽ hỏi gì, rồi chỉ săn đúng thứ đó.',
      eg: [
        { cn: '男的为什么不去参加？', vi: 'Vì sao người nam không đi tham gia?' },
        { cn: '他们要等多长时间？', vi: 'Họ phải đợi bao lâu?' },
      ],
    },
    {
      name: 'Lời từ chối gián tiếp: 恐怕 · 再说吧 · 改天 · 不太方便',
      why: 'Tiếng Trung ít nói "không" thẳng. 我再看看 nghĩa là từ chối, không phải đồng ý — bốn đáp án luôn có một cái bẫy đúng chữ nghĩa mà sai ý.',
      eg: [
        { cn: '今天恐怕不行，改天吧。', vi: 'Hôm nay e là không được, hôm khác nhé.' },
        { cn: '这个周末我不太方便。', vi: 'Cuối tuần này tôi hơi bất tiện.' },
      ],
    },
    {
      name: 'Số và giờ phải TÍNH mới ra: 差一刻 · 半 · 提前 · 推迟 · 打折',
      formula: '差一刻八点 = 7:45 · 八点半 = 8:30 · 推迟半小时 = cộng thêm 30 phút',
      why: 'Đáp án gần như không bao giờ là con số vừa nghe. Băng cho mốc gốc và mức thay đổi, người làm phải tự cộng trừ.',
      eg: [
        { cn: '会议推迟到下午三点。', vi: 'Cuộc họp lùi đến ba giờ chiều.' },
        { cn: '这件衣服打八折，二百块。', vi: 'Áo này giảm 20%, còn hai trăm tệ.' },
      ],
    },
    {
      name: 'Đoán nơi chốn và nghề nghiệp qua từ khoá',
      formula: '挂号 · 打针 · 大夫 → 医院 · 结账 · 点菜 → 饭馆 · 登机 · 护照 → 机场',
      why: 'Câu 在哪儿 và 做什么的 không bao giờ nói thẳng tên chỗ. Nó rải hai ba từ nghề nghiệp rồi để người nghe tự ghép.',
      eg: [
        { cn: '您先去挂号，然后在这儿等大夫。', vi: 'Anh đi lấy số trước, rồi đợi bác sĩ ở đây. → bệnh viện' },
        { cn: '请问几位？这是菜单。', vi: 'Dạ mấy người ạ? Đây là thực đơn. → nhà hàng' },
      ],
    },
    {
      name: 'Bổ ngữ xu hướng và kết quả: 起来 · 下去 · 完 · 好 · 到',
      why: 'Nó đổi hẳn nghĩa động từ. 看 là nhìn, 看到 là nhìn thấy, 看起来 là trông có vẻ — đáp án thường nằm ở đúng cái đuôi này.',
      eg: [
        { cn: '他看起来很累。', vi: 'Trông anh ấy có vẻ rất mệt.' },
        { cn: '这本书我还没看完。', vi: 'Quyển sách này tôi vẫn chưa đọc xong.' },
      ],
    },
  ],

  '听力第三部分': [
    {
      name: 'Cặp quan hệ đọc lướt qua tai: 虽然…但是 · 不但…而且 · 因为…所以 · 只要…就',
      why: 'Đoạn dài thì không nhớ nổi từng chữ, nhưng nhớ được BỘ KHUNG. Nghe ra cặp liên từ là biết đoạn đang đi về đâu và câu hỏi sẽ hỏi vế nào.',
      eg: [
        { cn: '虽然价格贵了点儿，但是质量确实好。', vi: 'Tuy giá hơi đắt, nhưng chất lượng đúng là tốt.' },
        { cn: '他不但会说汉语，而且说得很流利。', vi: 'Anh ấy không chỉ biết nói tiếng Trung mà còn nói rất trôi chảy.' },
      ],
    },
    {
      name: 'Chỉ thời gian trong đoạn: 后来 · 从那以后 · 一…就… · 原来',
      why: 'Đoạn dài hay kể một chuyện có TRƯỚC và SAU. Đáp án sai thường là tình trạng lúc trước, đáp án đúng là lúc sau.',
      eg: [
        { cn: '原来他不喜欢做饭，后来慢慢习惯了。', vi: 'Ban đầu anh ấy không thích nấu ăn, về sau dần quen.' },
        { cn: '他一下班就直接去了医院。', vi: 'Anh ấy vừa tan làm là đi thẳng tới bệnh viện.' },
      ],
    },
    {
      name: 'Nguyên nhân và mục đích: 为了 · 由于 · 因此 · 于是',
      formula: '为了 + mục đích，+ hành động · 由于 + nguyên nhân，因此 + kết quả',
      why: 'Hai câu hỏi trên một đoạn thì gần như luôn có một câu hỏi 为什么. Đáp án nằm ngay sau mấy từ này, không nằm ở đâu khác.',
      eg: [
        { cn: '为了准时到，他五点就出发了。', vi: 'Để đến đúng giờ, anh ấy khởi hành từ năm giờ.' },
        { cn: '由于天气原因，航班被取消了。', vi: 'Do thời tiết, chuyến bay đã bị huỷ.' },
      ],
    },
    {
      name: 'Câu điều kiện: 只要…就… · 只有…才… · 无论…都… · 除非',
      why: '只要 là "chỉ cần" (điều kiện đủ), 只有 là "chỉ có" (điều kiện cần) — nghe lướt thì hai cái giống hệt nhau, mà đáp án đúng lại nằm đúng ở chỗ khác nhau ấy.',
      eg: [
        { cn: '只要坚持，就一定会有进步。', vi: 'Chỉ cần kiên trì, chắc chắn sẽ tiến bộ.' },
        { cn: '只有多练习才能提高水平。', vi: 'Chỉ có luyện nhiều mới nâng được trình độ.' },
      ],
    },
    {
      name: 'Đại từ chỉ lại: 这样 · 那件事 · 其中 · 前者',
      why: 'Đoạn dài dùng đại từ để khỏi nhắc lại. Không bám được "cái đó là cái gì" thì nửa sau đoạn nghe thành vô nghĩa, dù nghe rõ từng chữ.',
      eg: [
        { cn: '他一直这样鼓励自己。', vi: 'Anh ấy luôn tự động viên mình như thế.' },
        { cn: '这几个方法中，其中一个特别有效。', vi: 'Trong mấy cách này, có một cách đặc biệt hiệu quả.' },
      ],
    },
    {
      name: 'Câu nêu quan điểm: 我觉得 · 在我看来 · 应该 · 值得',
      why: 'Hai câu hỏi trên một đoạn thì gần như chắc chắn một câu hỏi sự việc, một câu hỏi quan điểm người nói. Câu quan điểm nằm ở đúng mấy khung này.',
      eg: [
        { cn: '在我看来，这件事值得再商量。', vi: 'Theo tôi, việc này đáng bàn lại.' },
        { cn: '我觉得年轻人应该多试试。', vi: 'Tôi thấy người trẻ nên thử nhiều hơn.' },
      ],
    },
  ],
  '阅读第一部分': [
    {
      name: 'Nhìn chỗ trống đoán TỪ LOẠI trước khi đọc bảng từ',
      formula: '很 / 非常 + ____ → tính từ · ____ + 地 → tính từ · 地 + ____ → động từ · 一个 ____ → danh từ',
      why: 'Sáu từ cho năm chỗ. Loại theo từ loại thường chỉ còn một hai ứng viên cho mỗi chỗ, nhanh hơn hẳn đọc nghĩa từng từ.',
      eg: [
        { cn: '街上非常（热闹）。', vi: 'Ngoài phố rất náo nhiệt. → sau 非常 phải là tính từ' },
        { cn: '请你（仔细）检查一遍。', vi: 'Bạn kiểm tra kỹ lại một lượt. → trước động từ là trạng ngữ' },
      ],
    },
    {
      name: 'Kết hợp từ cố định (搭配)',
      formula: '提高水平 · 积累经验 · 引起注意 · 养成习惯 · 解决问题 · 完成任务 · 遵守规定',
      why: 'Đây mới là thứ phần này thật sự hỏi. 提高 và 增加 dịch ra tiếng Việt gần như nhau, nhưng chỉ một cái đi được với 水平.',
      eg: [
        { cn: '学外语最重要的是慢慢（积累）词汇。', vi: 'Học ngoại ngữ quan trọng nhất là tích luỹ từ vựng dần dần.' },
        { cn: '这件事（引起）了大家的注意。', vi: 'Việc này đã gây được sự chú ý của mọi người.' },
      ],
    },
    {
      name: 'Lượng từ đi cố định với danh từ',
      formula: '一场比赛 · 一份工作 · 一条建议 · 一次机会 · 一篇文章 · 一台电脑',
      why: 'Chỗ trống là lượng từ thì chỉ cần nhìn danh từ đứng sau là ra, không cần hiểu cả câu. Ngược lại, chỗ trống là danh từ thì lượng từ đứng trước đã loại giúp bốn từ.',
      eg: [
        { cn: '他给了我一（条）很好的建议。', vi: 'Anh ấy cho tôi một lời khuyên rất hay.' },
        { cn: '这是一（次）难得的机会。', vi: 'Đây là một cơ hội hiếm có.' },
      ],
    },
    {
      name: 'Vị trí của phó từ: sau chủ ngữ, trước động từ',
      formula: '主语 + 竟然/到底/却/反而/终于 + 动词',
      why: 'Nếu chỗ trống nằm đúng giữa chủ ngữ và động từ thì từ cần điền gần như chắc chắn là phó từ — loại ngay mọi danh từ và tính từ trong bảng.',
      eg: [
        { cn: '他（竟然）忘了自己的生日。', vi: 'Anh ấy thế mà lại quên sinh nhật của chính mình.' },
        { cn: '我（到底）该怎么办？', vi: 'Rốt cuộc tôi nên làm thế nào?' },
      ],
    },
    {
      name: 'Chỗ trống là liên từ thì manh mối nằm ở VẾ SAU',
      formula: '既然…就… · 即使…也… · 无论…都… · 不但…而且…',
      why: 'Liên từ đi thành cặp. Vế sau còn nguyên chữ 就 · 也 · 都 · 而且, và mỗi chữ ấy chỉ đi được với một liên từ ở vế trước.',
      eg: [
        { cn: '（既然）你已经决定了，就别再犹豫。', vi: 'Đã quyết rồi thì đừng do dự nữa.' },
        { cn: '（即使）很忙，他也坚持锻炼。', vi: 'Cho dù rất bận, anh ấy vẫn kiên trì tập luyện.' },
      ],
    },
    {
      name: 'Nhóm hội thoại (câu 51–55): chỗ trống trả lời lượt kia',
      why: 'Năm câu sau là đối thoại hai lượt. Chỗ trống nằm ở một lượt nhưng manh mối nằm ở lượt còn lại — đọc mỗi lượt có chỗ trống thì đoán mò.',
      eg: [
        { cn: 'A：你怎么才来？ B：路上（堵车）了。', vi: 'A: Sao giờ mới tới? B: Trên đường kẹt xe.' },
        { cn: 'A：这个（价格）能便宜点儿吗？ B：已经是最低价了。', vi: 'A: Giá này bớt chút được không? B: Đây đã là giá thấp nhất rồi.' },
      ],
    },
  ],

  '阅读第二部分': [
    {
      name: 'Đại từ không bao giờ mở đoạn: 他 · 她 · 它 · 这 · 那 · 其中',
      why: 'Luật chắc nhất của phần này. Mảnh nào bắt đầu bằng đại từ thì phải có mảnh khác đứng trước để giới thiệu người/vật đó — loại nó khỏi vị trí đầu là xong một phần ba bài.',
      eg: [
        { cn: '① 他就这样成了我们的邻居 ② 去年夏天来了一位新同事', vi: '→ ② trước ①, vì 他 phải có người để chỉ.' },
        { cn: '① 它的味道特别香 ② 妈妈今天做了一道新菜', vi: '→ ② trước ①, vì 它 phải có món để chỉ.' },
      ],
    },
    {
      name: 'Mảnh mở đoạn giới thiệu ĐẦY ĐỦ',
      formula: '有一天… · 从前… · 我有一个朋友… · 去年冬天… · danh từ đầy đủ + 是…',
      why: 'Mặt kia của luật đại từ. Mảnh nào gọi tên người/vật lần đầu bằng danh từ đầy đủ, hoặc mở bằng một mốc thời gian, thì đó là mảnh đầu.',
      eg: [
        { cn: '我有一个朋友，他特别喜欢旅游。', vi: 'Tôi có một người bạn, cậu ấy rất thích du lịch.' },
        { cn: '去年冬天，我去了一趟北京。', vi: 'Mùa đông năm ngoái, tôi có đi Bắc Kinh một chuyến.' },
      ],
    },
    {
      name: 'Liên từ chỉ ra vế của nó: 但是 · 所以 · 而且 · 于是 · 因此 · 结果',
      formula: '因为…→ 所以… · 虽然…→ 但是… · 不但…→ 而且…',
      why: 'Mảnh mang vế SAU của cặp thì chắc chắn không đứng đầu, và mảnh mang vế TRƯỚC thì chắc chắn không đứng cuối. Hai đầu chốt lại là ra thứ tự.',
      eg: [
        { cn: '① 所以我决定明年再考一次 ② 这次成绩不太理想', vi: '→ ② trước ①.' },
        { cn: '① 虽然只学了半年 ② 但是他已经能简单交流了', vi: '→ ① trước ②.' },
      ],
    },
    {
      name: 'Mảnh THIẾU chủ ngữ phải đi sau mảnh CÓ chủ ngữ',
      why: 'Tiếng Trung lược chủ ngữ khi nó vừa được nhắc. Một mảnh mở thẳng bằng động từ hoặc bằng 于是 · 结果 thì không thể là câu đầu, vì chưa ai biết đang nói về ai.',
      eg: [
        { cn: '① 于是决定重新开始 ② 他发现自己走错了方向', vi: '→ ② trước ①.' },
        { cn: '① 还买了不少纪念品 ② 我们在那儿玩了三天', vi: '→ ② trước ①.' },
      ],
    },
    {
      name: 'Dấu hiệu của mảnh CUỐI: 因此 · 这就是 · 结果 · 最后',
      why: 'Câu chốt lại ý hoặc nêu kết quả thì không còn gì đi sau nó nữa. Xác định được mảnh cuối cùng lúc với mảnh đầu là ba mảnh chỉ còn một cách xếp.',
      eg: [
        { cn: '这就是我一直坚持下来的原因。', vi: 'Đó chính là lý do tôi kiên trì được tới giờ.' },
        { cn: '结果那天我们谁也没去成。', vi: 'Kết quả là hôm đó chẳng ai đi được.' },
      ],
    },
    {
      name: 'Mốc thời gian và trình tự: 首先 · 然后 · 后来 · 最后 · 一…就…',
      why: 'Khi không có đại từ lẫn liên từ thì trình tự thời gian là manh mối còn lại. Câu có 后来 · 最后 gần như luôn là mảnh cuối.',
      eg: [
        { cn: '最后大家都同意了这个方案。', vi: 'Cuối cùng mọi người đều đồng ý phương án này.' },
        { cn: '首先要了解情况，然后再做决定。', vi: 'Trước hết phải nắm tình hình, rồi mới quyết định.' },
      ],
    },
  ],

  '阅读第三部分': [
    {
      name: 'Câu hỏi 根据这段话 / 这段话主要谈 → tìm câu CHỦ ĐỀ',
      why: 'Loại câu này không hỏi chi tiết. Ý chính nằm ở câu đầu hoặc câu cuối đoạn; đáp án nào chỉ đúng một chi tiết giữa đoạn là bẫy.',
      eg: [
        { cn: '这段话主要想告诉我们什么？', vi: 'Đoạn văn chủ yếu muốn nói với chúng ta điều gì?' },
        { cn: '根据这段话，可以知道什么？', vi: 'Theo đoạn văn, có thể biết được điều gì?' },
      ],
    },
    {
      name: 'Chỗ bẻ ý mang đáp án: 但是 · 然而 · 其实 · 相反',
      why: 'Trong một đoạn ngắn, tác giả viết 但是 là để nói cái đứng sau. Câu hỏi hỏi quan điểm thì gần như luôn lấy vế sau.',
      eg: [
        { cn: '很多人以为便宜没好货，其实并不一定。', vi: 'Nhiều người nghĩ rẻ thì không tốt, thực ra không hẳn.' },
        { cn: '他看上去很严肃，然而非常好相处。', vi: 'Trông anh ấy nghiêm nghị, nhưng lại rất dễ gần.' },
      ],
    },
    {
      name: 'Đáp án diễn đạt lại, không chép nguyên văn',
      why: 'Đáp án đúng thường là câu nói lại bằng từ khác; đáp án chép đúng chữ trong bài lại hay là bẫy vì nó chép sai chỗ. Đối chiếu Ý, đừng đối chiếu chữ.',
      eg: [
        { cn: '文中：价格并不便宜 → 选项：这东西比较贵', vi: 'Bài: giá không rẻ → Đáp án: món này khá đắt.' },
        { cn: '文中：他从来没迟到过 → 选项：他很守时', vi: 'Bài: anh ấy chưa từng đến muộn → Đáp án: anh ấy rất đúng giờ.' },
      ],
    },
    {
      name: 'Câu hỏi chỉ đại từ: đáp án nằm ở câu NGAY TRƯỚC',
      formula: '"这里的它 / 这 / 那 指的是…"',
      why: 'Không cần đọc lại cả đoạn. Đại từ trong tiếng Trung chỉ lùi về gần nhất — tìm danh từ gần nhất đứng trước nó là xong.',
      eg: [
        { cn: '文中画线词语"它"指的是什么？', vi: 'Từ được gạch chân "nó" trong bài chỉ cái gì?' },
        { cn: '第二句中的"这样做"指的是？', vi: '"Làm như vậy" ở câu thứ hai là chỉ việc gì?' },
      ],
    },
    {
      name: 'Loại đáp án nói QUÁ: 最 · 都 · 一定 · 永远 · 所有 · 从来不',
      why: 'Bài đọc HSK viết rất chừng mực (很多人 · 有些 · 往往). Đáp án nào tuyệt đối hoá thì gần như chắc chắn sai, kể cả khi nó dùng đúng từ của bài.',
      eg: [
        { cn: '文中：很多人喜欢 → 选项：所有人都喜欢', vi: 'Bài: nhiều người thích → Đáp án: mọi người đều thích. → nói quá, loại.' },
        { cn: '文中：这个办法往往有效 → 选项：这个办法一定有效', vi: 'Bài: cách này thường hiệu quả → Đáp án: cách này chắc chắn hiệu quả. → loại.' },
      ],
    },
    {
      name: 'Bài thuyết minh đi theo khung: 现象 → 原因 → 建议',
      why: 'Đoạn nêu một hiện tượng, giải thích vì sao, rồi khuyên nên làm gì. Câu hỏi "tác giả khuyên điều gì" luôn lấy ở phần cuối, đừng tìm ở giữa.',
      eg: [
        { cn: '所以，睡前最好别看手机。', vi: 'Vì vậy, trước khi ngủ tốt nhất đừng xem điện thoại.' },
        { cn: '因此，我们应该多给孩子一些时间。', vi: 'Do đó, chúng ta nên cho trẻ thêm thời gian.' },
      ],
    },
  ],

  '书写第一部分': [
    {
      name: 'Khung trật tự câu tiếng Trung',
      formula: '主语 + 时间 + 地点 + 方式/程度 + 动词 + 补语 + 宾语',
      why: 'Đây là toàn bộ phần này. Người Việt hay đặt thời gian và địa điểm ra SAU động từ theo thói quen tiếng Việt — 我去昨天学校 sai, 我昨天去学校 đúng.',
      eg: [
        { cn: '我昨天在图书馆看了三个小时书。', vi: 'Hôm qua tôi đọc sách ba tiếng ở thư viện.' },
        { cn: '他们下午在办公室开会。', vi: 'Chiều nay họ họp ở văn phòng.' },
      ],
    },
    {
      name: 'Câu chữ 把',
      formula: '主语 + 把 + 宾语 + 动词 + 其他成分',
      why: 'Thấy 把 trong đống mảnh là biết ngay khung câu. Bắt buộc phải có thành phần sau động từ (了 · 完 · 好 · 在… ) — 我把书看 là câu chưa xong.',
      eg: [
        { cn: '请把窗户关上。', vi: 'Làm ơn đóng cửa sổ lại.' },
        { cn: '他把钥匙放在桌子上了。', vi: 'Anh ấy để chìa khoá trên bàn.' },
      ],
    },
    {
      name: 'Câu bị động 被',
      formula: '受事 + 被 (+ 施事) + 动词 + 其他成分',
      why: 'Cùng một bộ mảnh, 把 và 被 đảo ngược ai làm ai chịu. Nhìn nhầm là viết ra câu đúng ngữ pháp nhưng ngược nghĩa.',
      eg: [
        { cn: '我的自行车被人骑走了。', vi: 'Xe đạp của tôi bị người ta đạp đi mất.' },
        { cn: '那份材料被他复印了三份。', vi: 'Tập tài liệu đó bị anh ấy photo thành ba bản.' },
      ],
    },
    {
      name: 'Bổ ngữ trình độ với 得',
      formula: '动词 + 得 + 形容词 · 动词 + 宾语 + 动词 + 得 + 形容词',
      why: 'Có tân ngữ thì phải lặp lại động từ: 他说汉语说得很好, không phải 他说汉语得很好. Đây là lỗi kinh điển và đề rất hay cho mảnh 得.',
      eg: [
        { cn: '她跳舞跳得非常好。', vi: 'Cô ấy nhảy rất đẹp.' },
        { cn: '这道题他解释得很清楚。', vi: 'Bài này anh ấy giải thích rất rõ ràng.' },
      ],
    },
    {
      name: 'Câu so sánh 比 và 是…的',
      formula: 'A + 比 + B + 形容词 (+ 一点儿/多了/得多) · 是 + 时间/地点/方式 + 动词 + 的',
      why: '比 không đi với 很 · 非常 (他比我很高 sai). Còn 是…的 là để nhấn khi nào/ở đâu/bằng cách nào — hai mảnh 是 và 的 luôn kẹp lấy phần được nhấn.',
      eg: [
        { cn: '今天比昨天冷得多。', vi: 'Hôm nay lạnh hơn hôm qua nhiều.' },
        { cn: '我是坐地铁来的。', vi: 'Tôi đến bằng tàu điện ngầm.' },
      ],
    },
    {
      name: 'Thứ tự định ngữ trước danh từ',
      formula: '限定 + 数量 + 形容词 + 的 + 名词',
      why: 'Mảnh 的 nói cho biết nó dính vào danh từ nào. 这三本很有意思的书 — đảo bất kỳ chỗ nào trong dãy này là mất điểm.',
      eg: [
        { cn: '那是我买的两件新衣服。', vi: 'Đó là hai bộ đồ mới tôi mua.' },
        { cn: '这是一个很难得的机会。', vi: 'Đây là một cơ hội rất hiếm có.' },
      ],
    },
  ],

  '书写第二部分': [
    {
      name: 'Chọn khung câu theo TỪ LOẠI của từ cho sẵn',
      formula: '名词 → 这/那 + 量词 + 名词 + 很… · 动词 → 主语 + 动词 + 宾语 + 了 · 形容词 → 主语 + 很/非常 + 形容词 · 量词 → 数字 + 量词 + 名词',
      why: 'Không cần nghĩ ra câu hay. Xác định từ loại rồi đổ vào khung là ra một câu đúng ngữ pháp trong mười giây — mà chấm thì chấm đúng/sai ngữ pháp.',
      eg: [
        { cn: '（镜子）→ 她正在照镜子。', vi: '(cái gương) → Cô ấy đang soi gương.' },
        { cn: '（干净）→ 这个房间非常干净。', vi: '(sạch sẽ) → Căn phòng này rất sạch.' },
      ],
    },
    {
      name: 'Đủ thành phần: chủ ngữ + động từ + dấu câu',
      why: 'Câu thiếu chủ ngữ hoặc thiếu dấu chấm bị trừ, dù ý đúng với tranh. Đây là điểm mất oan nhất của cả bài thi.',
      eg: [
        { cn: '正在打篮球。→ 他正在打篮球。', vi: 'Thiếu chủ ngữ → thêm 他.' },
        { cn: '孩子们很开心 → 孩子们很开心。', vi: 'Thiếu dấu câu → thêm 。' },
      ],
    },
    {
      name: 'Cụm chỉ tiến trình để tả tranh: 正在…呢 · 着 · 了',
      formula: '主语 + 正在 + 动词 + 宾语 + 呢 · 主语 + 动词 + 着 + 宾语',
      why: 'Tranh luôn chụp một khoảnh khắc đang diễn ra. 正在…呢 và …着 là hai khung an toàn nhất, dùng được với gần như mọi bức tranh.',
      eg: [
        { cn: '孩子们正在公园里玩儿呢。', vi: 'Bọn trẻ đang chơi trong công viên.' },
        { cn: '他手里拿着一把伞。', vi: 'Trên tay anh ấy cầm một chiếc ô.' },
      ],
    },
    {
      name: 'Lượng từ hay dùng khi tả tranh',
      formula: '一杯咖啡 · 一双鞋 · 一台电脑 · 一场雨 · 一束花 · 一张照片',
      why: 'Tranh gần như luôn có một vật đếm được. Dùng sai lượng từ là lỗi ngữ pháp bị trừ thẳng, mà nhớ sáu cụm này là đủ cho hầu hết đề.',
      eg: [
        { cn: '桌子上放着一杯咖啡。', vi: 'Trên bàn có một tách cà phê.' },
        { cn: '他昨天买了一双新鞋。', vi: 'Hôm qua anh ấy mua một đôi giày mới.' },
      ],
    },
    {
      name: 'Động từ li hợp KHÔNG mang tân ngữ trực tiếp',
      formula: '帮忙 · 见面 · 散步 · 聊天 · 结婚 · 请假 → 帮 + 谁 + 一个忙 · 跟 + 谁 + 见面',
      why: 'Từ cho sẵn hay rơi vào nhóm này, và người Việt phản xạ viết 帮忙他 · 见面他 — sai ngữ pháp, mất điểm dù ý đúng tranh.',
      eg: [
        { cn: '我帮了他一个忙。', vi: 'Tôi đã giúp anh ấy một việc. (không viết 帮忙他)' },
        { cn: '我们昨天跟老师见面了。', vi: 'Hôm qua chúng tôi gặp thầy. (không viết 见面老师)' },
      ],
    },
    {
      name: 'Bổ ngữ 得 để tả mức độ trong tranh',
      formula: '主语 + 动词 + 得 + 很/非常 + 形容词',
      why: 'Tranh tả một hành động ĐANG ở mức nào đó — chạy nhanh, cười vui, ngủ say. 得 là khung ngắn nhất diễn được điều đó mà vẫn chắc ngữ pháp.',
      eg: [
        { cn: '他跑得非常快。', vi: 'Anh ấy chạy rất nhanh.' },
        { cn: '孩子笑得很开心。', vi: 'Đứa bé cười rất vui.' },
      ],
    },
  ],
};
