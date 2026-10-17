import { Lesson, Question, IC3_GRADE_3_LESSONS, IC3_GRADE_4_LESSONS } from './types';
import { GRADE_4_QUESTIONS } from './grade4Data';
import { GRADE_5_QUESTIONS, GRADE_5_TINHOC_LESSONS } from './grade5Data';
import { IC3_GRADE_5_LESSONS, GRADE_5_IC3_QUESTIONS } from './grade5Ic3Data';

// Sách giáo khoa Tin học 3 - Kết nối tri thức với cuộc sống
export const GRADE_3_TINHOC_LESSONS: Lesson[] = [
  {
    id: 'l3-1',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 1. Máy tính và em',
    lessonNumber: 1,
    title: 'Bài 1: Thông tin và quyết định',
    shortDescription: 'Nhận biết thông tin xung quanh và cách thông tin giúp con người đưa ra quyết định phù hợp.',
    videoUrl: 'https://www.youtube.com/embed/H7c2tF6Z5J0',
    pdfUrl: 'Tài liệu hướng dẫn Bài 1:\n- Khái niệm về thông tin thu nhận qua mắt (mắt thấy), tai (tai nghe), mũi (ngửi mùi), lưỡi (nếm vị), da (cảm nhận).\n- Cách bộ não xử lý thông tin để đưa ra quyết định trong cuộc sống.',
    infographicUrl: '🎯 THÔNG TIN xung quanh ta -> Giác quan ghi nhận 👅👀👂👃🖐️ -> Bộ não suy nghĩ xử lý 🧠 -> Đưa ra QUYẾT ĐỊNH hành động đúng đắn!',
    illustrationUrl: '🎨 Minh họa: Các bạn nhỏ đi qua đường đúng luật nhờ quan sát đèn tín hiệu màu xanh.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-2',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 1. Máy tính và em',
    lessonNumber: 2,
    title: 'Bài 2: Xử lý thông tin',
    shortDescription: 'Hiểu quá trình xử lý thông tin của con người và cách máy tính trợ giúp con người xử lý thông tin nhanh chóng.',
    videoUrl: 'https://www.youtube.com/embed/6iPhYFhXl3s',
    pdfUrl: 'Tài liệu hướng dẫn Bài 2:\n- Xử lý thông tin là quá trình sắp xếp, tính toán, phân loại dữ liệu để mang lại thông tin có ích.\n- Con người dùng bộ não để xử lý thông tin. Máy tính sử dụng bộ vi xử lý trong thân máy để xử lý cực nhanh.',
    infographicUrl: '🧠 TIẾP NHẬN -> 📋 XỬ LÝ (Tính toán, phân loại, sắp xếp) -> 💾 LƯU TRỮ -> 📤 TRUYỀN TIN (Kết quả thông tin mới hữu ích)',
    illustrationUrl: '🎨 Minh họa: Một chú robot vui tươi sắp xếp các khối số và vẽ biểu đồ hình cột.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-3',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 1. Máy tính và em',
    lessonNumber: 3,
    title: 'Bài 3: Máy tính và em',
    shortDescription: 'Nhận biết các bộ phận cơ bản của máy tính và chức năng của chúng đối với cuộc sống của em.',
    videoUrl: 'https://www.youtube.com/embed/gL2uO7gY3D8',
    pdfUrl: 'Tài liệu hướng dẫn Bài 3:\n- Các bộ phận chính của máy tính để bàn: Màn hình, Thân máy, Bàn phím, Chuột.\n- Chức năng của từng bộ phận: Thân máy xử lý; màn hình hiển thị; bàn phím và chuột giúp nhập thông tin/điều khiển.',
    infographicUrl: '🖥️ MÀN HÌNH (Hiện thị thông tin) | ⚙️ THÂN MÁY (Xử lý dữ liệu) | ⌨️ BÀN PHÍM (Nhập văn bản) | 🖱️ CHUỘT (Di chuyển, ra lệnh)',
    illustrationUrl: '🎨 Minh họa: Sơ đồ tương tác kết nối chuột, bàn phím và màn hình vào thân máy tính để bàn.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-4',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 1. Máy tính và em',
    lessonNumber: 4,
    title: 'Bài 4: Làm việc với máy tính',
    shortDescription: 'Lấy thói quen ngồi đúng tư thế, biết cách khởi động và tắt máy tính an toàn, đúng quy trình.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 4:\n- Tư thế làm việc đúng: Ngồi thẳng lưng, mắt cách màn hình 50-70cm, tay thả lỏng.\n- Khởi động máy tính: Bật nút nguồn trên thân máy và màn hình.\n- Tắt máy tính đúng cách: Đóng các cửa sổ phần mềm, vào Start -> Power -> Shut down.',
    infographicUrl: '🧘 TƯ THẾ ĐÚNG: Lưng thẳng • Mắt cách màn hình 50-70cm \n🔌 KHỞI ĐỘNG: Nút nguồn thân máy ➡️ Nút màn hình \n🔻 TẮT MÁY: Start ➡️ Power ➡️ Shut down',
    illustrationUrl: '🎨 Minh họa: Bạn học sinh ngồi học bài trước máy tính rất ngay ngắn, thẳng lưng xinh xắn.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-5',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 1. Máy tính và em',
    lessonNumber: 5,
    title: 'Bài 5: Sử dụng bàn phím',
    shortDescription: 'Nhận biết các khu vực trên bàn phím, hai phím có gờ nổi F, J và cách đặt tay gõ phím đúng cách.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 5:\n- Các hàng phím cơ bản: Hàng phím số, hàng phím trên, hàng phím cơ sở, hàng phím dưới, hàng phím chứa phím cách.\n- Hai phím có gờ nổi là F và J trên hàng phím cơ sở để định vị đặt tay.\n- Cách đặt tay gõ phím bằng 10 ngón tay.',
    infographicUrl: '⌨️ BÀN PHÍM: Hàng cơ sở chứa 2 phím gờ nổi F và J làm mốc đặt ngón trỏ trái và ngón trỏ phải. Gõ phím bằng 10 ngón giúp tăng tốc độ gõ bài!',
    illustrationUrl: '🎨 Minh họa: Đôi bàn tay hoạt hình rực rỡ sắc màu được đặt đúng vị trí trên các phím của bàn phím cơ.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-6',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 2. Mạng máy tính và Internet',
    lessonNumber: 6,
    title: 'Bài 6: Khám phá thông tin trên Internet',
    shortDescription: 'Tìm hiểu mạng Internet và cách sử dụng trình duyệt web tìm kiếm thông tin an toàn.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 6:\n- Mạng Internet là mạng kết nối máy tính toàn cầu giúp học tập, tìm kiếm kiến thức, giải trí.\n- Sử dụng trình duyệt (Chrome, Cốc Cốc, Edge) gõ từ khóa vào ô tìm kiếm.\n- Quy tắc an toàn: Không chia sẻ thông tin cá nhân (họ tên, trường lớp, địa chỉ, sđt, mật khẩu) cho người lạ trên mạng.',
    infographicUrl: '🌐 INTERNET: Kho báu tri thức! \n🔍 Trình duyệt web -> Nhập từ khóa thích hợp \n🛡️ An toàn: Không cung cấp thông tin cá nhân cho người lạ!',
    illustrationUrl: '🎨 Minh họa: Quả địa cầu xinh xắn kết nối các máy tính bay lượn ngập tràn tri thức.',
    colorTheme: 'pastel-orange',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-7',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    lessonNumber: 7,
    title: 'Bài 7: Sắp xếp để dễ tìm',
    shortDescription: 'Hiểu lợi ích của việc sắp xếp đồ vật, tài liệu ngăn nắp theo các tiêu chí để tìm kiếm nhanh chóng.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 7:\n- Lợi ích của việc sắp xếp: Giúp tìm kiếm đồ vật, thông tin nhanh chóng, dễ quản lý.\n- Sắp xếp dựa theo tiêu chí: Theo thứ tự chữ cái, theo kích thước, loại hình, thời gian.',
    infographicUrl: '📚 SẮP XẾP = DỄ TÌM KIẾM! \nTiêu chí phân loại: Thể loại sách, Bút chì riêng, Tệp học tập xếp theo thời gian mới nhất!',
    illustrationUrl: '🎨 Minh họa: Kệ sách màu gỗ pastel được trưng bày ngăn nắp các loại sách và đồ chơi dễ thương.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-8',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    lessonNumber: 8,
    title: 'Bài 8: Sơ đồ hình cây. Tổ chức thông tin trong máy tính',
    shortDescription: 'Làm quen biểu diễn sơ đồ hình cây và cách máy tính tổ chức thông tin dưới dạng các thư mục và tệp.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 8:\n- Sơ đồ hình cây gồm: Gốc, các Cấp, các Nhánh và Nút.\n- Máy tính tổ chức lưu trữ dữ liệu theo sơ đồ hình cây bằng hệ thống các Thư mục (Folder) và các Tệp tin (File). Thư mục có thể chứa thư mục con và tệp.',
    infographicUrl: '🌳 SƠ ĐỒ HÌNH CÂY TRONG MÁY TÍNH:\n📁 Thư mục gốc (Ổ đĩa D:)\n  ├── 📁 Thư mục TOAN (Toán Lớp 3)\n  │     └── 📝 BaiTap1.docx (Tệp tin)\n  └── 📁 Thư mục GIAI_TRI (Hình ảnh vui)',
    illustrationUrl: '🎨 Minh họa: Mô hình cây rực rỡ với các hộp thư mục treo lơ lửng trên từng cành lá.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-9',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    lessonNumber: 9,
    title: 'Bài 9: Thực hành với tệp và thư mục trong máy tính',
    shortDescription: 'Luyện tập các thao tác cơ bản tạo thư mục, đổi tên, sao chép, di chuyển và xóa tệp tin, thư mục.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 9:\n- Các thao tác thực hành: Tạo thư mục mới (New Folder), Đổi tên (Rename), Sao chép (Copy - Ctrl+C), Di chuyển (Cut - Ctrl+X), Xóa thư mục/tệp (Delete).\n- Mẹo: Đặt tên thư mục ngắn gọn, khoa học để dễ tìm kiến thức.',
    infographicUrl: '📂 THỰC HÀNH THƯ MỤC:\n🆕 Tạo mới (Click phải -> New -> Folder) | ✏️ Đổi tên (Rename) | 📋 Sao chép (Ctrl + C & Ctrl + V) | 🗑️ Xóa tệp (Delete)',
    illustrationUrl: '🎨 Minh họa: Trẻ em sử dụng máy tính thực hành thao tác kéo thả các thư mục nhiều sắc màu sinh động.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-10',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 4. Đạo đức, pháp luật và văn hoá trong môi trường số',
    lessonNumber: 10,
    title: 'Bài 10: Bảo vệ thông tin khi dùng máy tính',
    shortDescription: 'Nhận diện thông tin cá nhân cần bảo mật và quy tắc thiết lập mật khẩu mạnh an toàn.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 10:\n- Thông tin cá nhân cần bảo vệ: Họ tên, địa chỉ, số điện thoại, ảnh gia đình, mật khẩu tài khoản.\n- Nguy cơ: Rò rỉ thông tin dẫn đến bị giả mạo, virus xâm nhập máy tính.\n- Biện pháp: Đặt mật khẩu mạnh (chữ hoa, chữ thường, số, ký tự đặc biệt, VD: MatKhau@123) và không chia sẻ mật khẩu.',
    infographicUrl: '🛡️ BẢO VỆ THÔNG TIN CÁ NHÂN:\n👤 Giữ kín: Họ tên, SĐT, Địa chỉ, Ảnh riêng tư!\n🔑 Đặt MẬT KHẨU MẠNH: Ít nhất 8 ký tự, gồm Chữ hoa, Chữ thường, Số & Ký tự đặc biệt!',
    illustrationUrl: '🎨 Minh họa: Một chú khiên bảo vệ màu xanh lấp lánh ngăn cản vi khuẩn virus đột nhập hòm thư.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-11',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 5. Tin học ứng dụng',
    lessonNumber: 11,
    title: 'Bài 11: Bài trình chiếu của em',
    shortDescription: 'Làm quen phần mềm trình chiếu PowerPoint, thiết kế các trang chiếu sinh động ấn tượng.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 11:\n- Phần mềm thiết kế trang chiếu (PowerPoint) giúp bài nói hấp dẫn sinh động.\n- Các đối tượng trên trang chiếu (Slide): Văn bản, tranh ảnh, video, âm thanh.\n- Quy trình: Mở phần mềm -> Thêm trang -> Nhập nội dung -> Lưu tệp tin.',
    infographicUrl: '📊 BẢI TRÌNH CHIẾU SINH ĐỘNG:\n✨ Slide chứa: Văn bản (Chữ) 📁 Hình ảnh 🖼️ Âm thanh 🎵\n✨ Nhấp phím F5 để bắt đầu trình chiếu rực rỡ!',
    illustrationUrl: '🎨 Minh họa: Sân chiếu bóng đèn đầy sắc màu với chú gấu trúc đứng thuyết trình vui vẻ.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-12',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 5. Tin học ứng dụng',
    lessonNumber: 12,
    title: 'Bài 12: Tìm hiểu về thế giới tự nhiên',
    shortDescription: 'Sử dụng Internet tìm hiểu thế giới các loài động vật, thực vật phong phú xung quanh em.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 12:\n- Cách tìm kiếm hình ảnh, thông tin động vật, cây cối rực rỡ bằng từ khóa chuẩn xác.\n- Chọn lọc nguồn tin cậy từ các trang giáo dục để ghi ghép và làm báo cáo sinh động.',
    infographicUrl: '🦁 KHÁM PHÁ THẾ GIỚI TỰ NHIÊN:\nGõ từ khóa chuẩn xác ➡️ Đọc nguồn uy tín .edu.vn ➡️ Lưu ảnh các chú chim xanh, con sông quê, hoa sen xinh xắn!',
    illustrationUrl: '🎨 Minh họa: Trẻ em đi dã ngoại cầm kính lúp khám phá rừng xanh có nhiều chú sóc đáng yêu.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-13',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 5. Tin học ứng dụng',
    lessonNumber: 13,
    title: 'Bài 13: Luyện tập sử dụng chuột',
    shortDescription: 'Rèn luyện các kỹ năng di chuột, nhắp chuột trái, nhắp đúp chuột, nhắp chuột phải và kéo thả.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 13:\n- Các thao tác với chuột: Di chuyển chuột, Nháy chuột, Nháy đúp chuột, Nháy nút phải chuột, Kéo thả chuột.\n- Tư thế cầm chuột: Cổ tay thẳng, ngón trỏ đặt lên nút trái chuột, ngón giữa đặt lên nút phải chuột.',
    infographicUrl: '🖱️ LUYỆN TẬP CHUỘT GA: \n1️⃣ Nháy chuột: Chọn đối tượng | 2️⃣ Nháy đúp: Mở tệp | 3️⃣ Nháy phải: Mở menu | 4️⃣ Kéo thả: Di chuyển tệp tin',
    illustrationUrl: '🎨 Minh họa: Một chú chuột máy tính đáng yêu đang biểu diễn xiếc nhào lộn nhảy qua các tệp tin.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-14',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính',
    lessonNumber: 14,
    title: 'Bài 14: Em thực hiện công việc như thế nào?',
    shortDescription: 'Hiểu các bước phân loại quy trình và kế hoạch cụ thể để thực hiện tốt công việc.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 14:\n- Mỗi công việc lớn gồm có mục tiêu rõ ràng và các bước nhỏ để thực hiện.\n- Lên kế hoạch sắp xếp các bước hợp lý trước khi bắt đầu sẽ giúp hoàn thành nhanh và tốt nhất.',
    infographicUrl: '🏆 QUY TRÌNH CÔNG VIỆC: \nXác định MỤC TIÊU ➡️ Lên KẾ HOẠCH từng bước ➡️ THỰC HIỆN cẩn thận ➡️ KIỂM TRA kết quả đạt được!',
    illustrationUrl: '🎨 Minh họa: Các bậc mốc thang chinh phục mục tiêu học tập có cờ hoa rạng rỡ.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-15',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính',
    lessonNumber: 15,
    title: 'Bài 15: Công việc được thực hiện theo điều kiện',
    shortDescription: 'Linh hoạt phân loại công việc và hành động tương ứng tùy thuộc vào các điều kiện cụ thể.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 15:\n- Khái niệm về hành động có điều kiện. Ví dụ: NẾU trời mưa THÌ em mang ô, NGƯỢC LẠI THÌ không cần mang.\n- Nhận diện sơ đồ khối và sơ đồ nhánh cây mô phỏng các trường hợp quyết định rẽ hướng.',
    infographicUrl: '🌧️ NẾU Trời Mưa ⛈️ -> ☂️ Mang ô đi học \n☀️ NGƯỢC LẠI (Trời Nắng) -> 🧢 Đội mũ che đầu \n➡️ Đây là cách hoạt động dựa trên ĐIỀU KIỆN đó các em!',
    illustrationUrl: '🎨 Minh họa: Một chú bé đứng trước ngã rẽ lối đi có tấm biển chỉ dẫn đường đi nắng mưa ngộ nghĩnh.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'l3-16',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính',
    lessonNumber: 16,
    title: 'Bài 16: Công việc của em và sự trợ giúp của máy tính',
    shortDescription: 'Tận dụng các phần mềm máy tính hữu ích để hỗ trợ đắc lực cho công việc học tập và sáng tạo của em.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 16:\n- Máy tính là công cụ tuyệt vời trợ giúp em trong học tập (soạn thảo, tính toán, vẽ tranh), giải trí (nghe nhạc, xem phim, chơi game trí tuệ) và liên lạc.\n- Tuy nhiên máy tính không thể làm thay mọi việc cho con người, em cần rèn luyện bản thân siêng năng chăm chỉ.',
    infographicUrl: '🖥️ TRỢ THỦ ĐẮC LỰC: \n✍️ Học tập (Word, PowerPoint) | 🎨 Sáng tạo (Vẽ Paint) | 📞 Liên lạc với bạn bè \n🌟 Nhớ sử dụng máy tính điều độ để bảo vệ mắt xinh nhé!',
    illustrationUrl: '🎨 Minh họa: Bạn nhỏ cùng chú robot học bài mỉm cười thân thiện bên nhau.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  }
];

// Bản đồ từ khóa chính theo từng bài học lớp 3 để tạo câu hỏi cực chuẩn xác và bám sát kiến thức SGK Kết nối tri thức
export const LESSON_CONCEPTS_DB: { [key: string]: {
  keywords?: string[];
  quizzes: { questionText: string; options: string[]; correctAnswer: string; explanation: string }[];
  true_falses: { questionText: string; correctAnswer: string; explanation: string }[];
  matchings: { questionText: string; lefts: string[]; rights: string[]; explanation: string }[];
  gap_fills: { questionText: string; correctAnswer: string; explanation: string }[];
} } = {
  ...GRADE_4_QUESTIONS,
  ...GRADE_5_QUESTIONS,
  ...GRADE_5_IC3_QUESTIONS,
  'lic3-3-1': {
    quizzes: [
      { questionText: 'Bộ xử lý trung tâm (CPU) đóng vai trò gì trong máy tính?', options: ['A. Hiển thị hình ảnh', 'B. In tài liệu ra giấy', 'C. Bộ vi xử lý xử lý mọi thông tin (bộ não)', 'D. Lưu trữ văn bản'], correctAnswer: 'C. Bộ vi xử lý xử lý mọi thông tin (bộ não)', explanation: 'CPU (Central Processing Unit) chính là bộ vi xử lý đóng vai trò bộ não điều phối mọi tác vụ tính toán.' },
      { questionText: 'Mainboard hay Bo mạch chủ là gì?', options: ['A. Phần mềm gõ tiếng việt', 'B. Thiết bị lưu trữ dữ liệu', 'C. Bản mạch chính kết nối tất cả linh kiện phần cứng', 'D. Màn hình bảo bối'], correctAnswer: 'C. Bản mạch chính kết nối tất cả linh kiện phần cứng', explanation: 'Bo mạch chủ có vai trò là bản mạch xương sống nhận nhiệm vụ liên kết vật lý cơ năng giữa các bộ phận phần cứng.' },
      { questionText: 'Ổ cứng SSD và HDD khác nhau cơ bản ở điểm nào?', options: ['A. HDD chạy bằng bộ nhớ Flash còn SSD dùng đĩa quay', 'B. SSD sử dụng bộ nhớ chip Flash tốc độ cực nhanh, còn HDD dùng đĩa từ quay nhanh cơ học', 'C. SSD rẻ hơn rất nhiều', 'D. SSD không thể lưu trữ tệp tin'], correctAnswer: 'B. SSD sử dụng bộ nhớ chip Flash tốc độ cực nhanh, còn HDD dùng đĩa từ quay nhanh cơ học', explanation: 'SSD đột phá về hiệu năng nhờ chip nhớ Flash, giúp mở máy siêu tốc so với HDD truyền thống.' },
      { questionText: 'Phần cứng (Hardware) máy tính là gì?', options: ['A. Các chương trình chạy trong màn hình', 'B. Những linh kiện bộ phận vật lý em có thể chạm, sờ hoặc nhìn thấy được', 'C. Trang web Google', 'D. Tệp văn bản Word'], correctAnswer: 'B. Những linh kiện bộ phận vật lý em có thể chạm, sờ hoặc nhìn thấy được', explanation: 'Phần cứng là thể vật lý sờ chạm cơ học như chuột, bàn phím, case máy tính.' },
      { questionText: 'Bộ phận nào không nằm bên trong case thùng máy tính để bàn?', options: ['A. Bo mạch chủ mainboard', 'B. Màn hình máy tính', 'C. Bộ xử lý CPU', 'D. Ổ đĩa cứng'], correctAnswer: 'B. Màn hình máy tính', explanation: 'Màn hình là thiết bị ngoại vi độc lập bên ngoài thùng máy.' }
    ],
    true_falses: [
      { questionText: 'Chúng ta có thể vận hành các chương trình phần mềm mà không cần đến bất kỳ bộ phận phần cứng nào.', correctAnswer: 'Sai', explanation: 'Sai! Phần mềm luôn cần phần cứng vật lý nền tảng (CPU, RAM) làm nơi xử lý và lưu trữ.' },
      { questionText: 'Ổ đĩa cứng SSD giúp khởi động hệ điều hành Windows và mở ứng dụng nhanh hơn nhiều so với ổ đĩa HDD cổ điển.', correctAnswer: 'Đúng', explanation: 'Chính xác! SSD có tốc độ truy xuất vượt trội giúp giảm thời gian chờ đợi mở máy.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép thiết bị phần cứng đúng với nhiệm vụ của chúng!', lefts: ['Bộ xử lý trung tâm (CPU)', 'Ổ đĩa cứng (HDD/SSD)', 'Bo mạch chủ (Mainboard)', 'Nguồn máy tính (Power Supply)'], rights: ['Bộ não xử lý tác vụ', 'Nơi lưu trữ bền vững tệp tin', 'Bản mạch liên kết vật lý', 'Cấp năng lượng điện cho máy'], explanation: 'Quá siêu! Em đã hiểu sâu sắc chức năng của các cơ quan chính bên trong vỏ máy.' },
      { questionText: 'Hãy phân biệt thiết bị thuộc về Phần cứng hay Phần mềm!', lefts: ['Con chuột quang 3D', 'Phần mềm Paint vẽ tranh', 'Thân máy Case sắt', 'Hệ điều hành Windows'], rights: ['Thiết bị Phần cứng sờ thấy', 'Chương trình ứng dụng Phần mềm', 'Thiết bị Phần cứng vật lý', 'Hệ thống Phần mềm cốt lõi'], explanation: 'Chính xác dạt dào! Em phân chia xuất sắc ranh giới giữa vô hình (phần mềm) và hữu hình (phần cứng).' }
    ],
    gap_fills: [
      { questionText: 'Bộ phận đầu não gánh vác việc xử lý mọi thông tin của máy chính là chíp vi xử lý ... dũng mãnh.', correctAnswer: 'cpu', explanation: 'CPU (Central Processing Unit) là trái tim chỉ huy của mọi cụm phần cứng.' }
    ]
  },
  'lic3-3-2': {
    quizzes: [
      { questionText: 'Thiết bị nào sau đây là thiết bị nhập (Input device)?', options: ['A. Màn hình rực rỡ', 'B. Bàn phím cơ học', 'C. Máy in giấy', 'D. Loa phát âm thanh'], correctAnswer: 'B. Bàn phím cơ học', explanation: 'Bàn phím dùng để nhập ký tự, văn bản, lệnh vào máy tính.' },
      { questionText: 'Đâu là thiết bị xuất (Output device)?', options: ['A. Chuột không dây', 'B. Máy quét (Scanner)', 'C. Microphone rời', 'D. Máy chiếu (Projector)'], correctAnswer: 'D. Máy chiếu (Projector)', explanation: 'Máy chiếu đưa hình ảnh phóng to ra ngoài màn chiếu lớn cho mọi người cùng xem.' },
      { questionText: 'Loại cáp kết nối nào hỗ trợ đầu cắm đảo ngược không sợ bị cắm ngược đầu?', options: ['A. Cáp VGA cũ', 'B. USB Type C (USB-C)', 'C. Cáp HDMI đầu phẳng', 'D. Jack cắm 3.5mm tròn'], correctAnswer: 'B. USB Type C (USB-C)', explanation: 'Cổng USB-C có thiết kế đầu đối xứng nên cắm mặt nào cũng khít và nhận diện tức thì.' },
      { questionText: 'Míc-rô (Microphone) đóng vai trò gì?', options: ['A. Phát nhạc ra ngoài bầu không khí', 'B. Thu nhận âm thanh từ môi trường chuyển vào kỹ thuật số', 'C. Hiển thị chữ viết hoa', 'D. Quét tài liệu giấy'], correctAnswer: 'B. Thu nhận âm thanh từ môi trường chuyển vào kỹ thuật số', explanation: 'Míc-rô chuyên biệt thu giọng nói để nhập và lưu trữ sóng âm.' },
      { questionText: 'Thiết bị nào chuyển đổi một bức ảnh in trên giấy vào bên trong thư mục máy tính?', options: ['A. Máy in văn phòng', 'B. Loa thùng', 'C. Máy quét hình ảnh (Scanner)', 'D. Màn hình cảm ứng'], correctAnswer: 'C. Máy quét hình ảnh (Scanner)', explanation: 'Scanner chụp quét bề mặt giấy tờ thực thể để xuất bản thành tệp ảnh kỹ thuật số.' }
    ],
    true_falses: [
      { questionText: 'Máy in là thiết bị nhập vì nó hút giấy trắng vào bên trong khay nạp.', correctAnswer: 'Sai', explanation: 'Sai! Máy in dùng để kết xuất phun mục in đồ họa thông tin ra giấy, là thiết bị xuất tuyệt đối.' },
      { questionText: 'Bàn phím và chuột máy tính là hai thiết bị nhập cơ bản nhất được kết nối vật lý với máy tính.', correctAnswer: 'Đúng', explanation: 'Đúng! Thiếu chuột và bàn phím, người dùng sẽ vô cùng khó khăn để nhập liệu chỉ huy.' }
    ],
    matchings: [
      { questionText: 'Nối cổng kết nối tương ứng với mục đích sử dụng!', lefts: ['USB-C đảo ngược', 'HDMI sắc nét', 'Jack tròn 3.5mm', 'Cổng Ethernet vỏ nhựa'], rights: ['Kết nối thiết bị mới cực kỳ tiện dụng', 'Truyền hình ảnh âm thanh lên tivi màn hình lớn', 'Nối tai nghe, loa nhận tín hiệu âm thanh', 'Nối dây cáp mạng Internet nội dung nhanh'], explanation: 'Tuyệt diệu! Sự phân loại cổng cắm của em chứng minh sự hiểu biết tinh tường về các tiêu chuẩn kết nối.' },
      { questionText: 'Hãy xếp nhóm thiết bị đúng vào cột tương ứng!', lefts: ['Chuột quang cầm tay', 'Loa phát nhạc', 'Míc-rô thu âm', 'Màn hình hiển thị màu'], rights: ['Thiết bị Nhập (đầu vào)', 'Thiết bị Xuất (đầu ra)', 'Thiết bị Nhập (đầu vào)', 'Thiết bị Xuất (đầu ra)'], explanation: 'Cực tốt! Nhập đưa dữ liệu vào máy, Xuất xuất tri thức rực rỡ ra thế giới.' }
    ],
    gap_fills: [
      { questionText: 'Thiết bị xuất dùng truyền những bản nhạc, giọng nói to rõ đến tai học sinh là ... vi tính.', correctAnswer: 'loa', explanation: 'Loa đóng vai trò xuất luồng âm thanh kỹ thuật số biến đổi thành sóng âm cơ học.' }
    ]
  },
  'lic3-3-3': {
    quizzes: [
      { questionText: 'Máy tính để bàn (Desktop) có đặc tính nổi trội nào sau đây?', options: ['A. Có pin dung lượng xài cả ngày không cần cắm điện dây', 'B. Lắp ráp từ các bộ phận riêng biệt, cấu hình mạnh mẽ, giá thành rẻ hơn nhưng đặt cố định một chỗ', 'C. Gọn nhẹ dễ đút vào túi quần áo', 'D. Chỉ có màn hình duy nhất khổng lồ'], correctAnswer: 'B. Lắp ráp từ các bộ phận riêng biệt, cấu hình mạnh mẽ, giá thành rẻ hơn nhưng đặt cố định một chỗ', explanation: 'Máy để bàn cồng kềnh với thùng máy, màn hình, chuột, phím riêng nhưng hoạt động bền bỉ hiệu năng cao.' },
      { questionText: 'Tại sao máy tính xách tay (Laptop) lại rèn luyện tính cơ động cho người dùng?', options: ['A. Vì nó không có bàn phím', 'B. Vì nó tích hợp sẵn màn hình, bàn phím, bàn rê chuột và pin sạc độc lập giúp xếp gọn mang đi muôn nơi', 'C. Nó tự bay được', 'D. Nó chỉ chạy bằng năng lượng mặt trời'], correctAnswer: 'B. Vì nó tích hợp sẵn màn hình, bàn phím, bàn rê chuột và pin sạc độc lập giúp xếp gọn mang đi muôn nơi', explanation: 'Thiết bị tất cả trong một xếp gọn như cuốn sổ là biểu tượng của tinh thần cơ động làm việc từ xa.' },
      { questionText: 'Điện thoại thông minh (Smartphone) có đặc tính gì nổi tiếng nhất?', options: ['A. Nặng từ năm kilôgam trở lên', 'B. Kích thước vô cùng nhỏ bé bỏ vừa túi, tích hợp nghe gọi, camera, định vị, cảm ứng trực quan', 'C. Không thể kết nối sóng Wifi', 'D. Phải dùng máy bơm để làm mát liên tục'], correctAnswer: 'B. Kích thước vô cùng nhỏ bé bỏ vừa túi, tích hợp nghe gọi, camera, định vị, cảm ứng trực quan', explanation: 'Smartphone tụ hội sức mạnh di động bứt phá giúp tiếp cận tri thức tức thì trong tầm tay.' },
      { questionText: 'Máy tính bảng (Tablet) khác biệt với Laptop ở khía cạnh nào?', options: ['A. Không có màn hình cảm ứng', 'B. Là một tấm màn lớn cảm ứng hoàn toàn, không có bàn phím vật lý gập gắn liền theo mặc định và nhẹ hơn', 'C. Phải kết nối dây cáp liên tiếp mới chạy', 'D. Chạy chậm hơn gấp một nghìn lần'], correctAnswer: 'B. Là một tấm màn lớn cảm ứng hoàn toàn, không có bàn phím vật lý gập gắn liền theo mặc định và nhẹ hơn', explanation: 'Tablet khơi mầm sáng tạo bằng cách bỏ bớt bàn phím cứng, tối ưu toàn diện diện tích chạm vẽ đa năng.' },
      { questionText: 'Đâu KHÔNG phải là một máy tính thông minh cầm tay?', options: ['A. Đồng hồ thông minh Apple Watch', 'B. Máy tính bảng iPad', 'C. Máy sấy tóc cầm tay', 'D. Điện thoại di động Samsung'], correctAnswer: 'C. Máy sấy tóc cầm tay', explanation: 'Máy sấy tóc là thiết bị điện dân dụng cơ học thuần túy, không tích hợp mạch vi xử lý tính toán số thông minh.' }
    ],
    true_falses: [
      { questionText: 'Máy tính để bàn khó di chuyển vì nặng và cần cắm trực tiếp vào nguồn điện lưới ổn định thì mới bật chạy được.', correctAnswer: 'Đúng', explanation: 'Hoàn toàn chính xác! Nó được thiết kế đặt nằm ổn định trên bàn làm việc lớn tại lớp học, văn phòng.' },
      { questionText: 'Tất cả các điện thoại thông minh hiện nay đều bắt buộc bắt học sinh gõ chữ bằng bàn phím vật lý lồi lên dày cộp.', correctAnswer: 'Sai', explanation: 'Sai! Smartphone đã phát triển vượt bậc sang bàn phím ảo hiển thị trên màn hình cảm ứng đa điểm.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép thiết bị máy tính đúng với mô tả đặc thù!', lefts: ['Desktop để bàn', 'Laptop cá nhân', 'Tablet tiện dụng', 'Smartphone nhỏ xinh'], rights: ['Thùng máy to rời, cấu hình khỏe rẻ', 'Bản lề gập mở linh hoạt, có bàn rê', 'Tấm bảng phẳng cảm ứng tuyệt đối', 'Thiết bị đút vừa túi, cài hàng vạn ứng dụng'], explanation: 'Cực xuất sắc! Em đã nhận diện một cách chuyên nghiệp thế mạnh của 4 loại thiết bị điện tử phổ thông.' },
      { questionText: 'Xác định loại máy tính nào có trọng lượng tăng dần!', lefts: ['Điện thoại thông minh', 'Máy tính bảng', 'Laptop mỏng nhẹ', 'Máy để bàn kèm thùng Case'], rights: ['Thiết bị nhẹ nhất tầm 200 gam', 'Thiết bị phẳng nặng tầm 450 gam', 'Thiết bị gập gáp nặng từ 1.3 kg', 'Thiết bị nặng nhất từ 7 kg trở lên'], explanation: 'Quá siêu! Trọng lượng thiết bị quyết định mục đích mang vác và độ đa năng của trạm làm việc.' }
    ],
    gap_fills: [
      { questionText: 'Thiết bị di động có màn hình cảm ứng lớn, là dạng trung gian giữa điện thoại và máy tính xách tay là máy tính ...', correctAnswer: 'bang', explanation: 'Tablet hay máy tính bảng sở hữu giao diện rộng rãi dồi dào tài nguyên học trực tuyến bùng nổ.' }
    ]
  },
  'lic3-3-4': {
    quizzes: [
      { questionText: 'Phần mềm hệ thống có nghĩa là gì?', options: ['A. Là trò chơi đuổi bắt robot', 'B. Là chương trình quản trị cốt lõi, điều khiển các linh kiện phần cứng và giúp máy khởi động vận hành', 'C. Là phần mềm học vẽ Paint', 'D. Là ứng dụng xem phim hoạt hình YouTube'], correctAnswer: 'B. Là chương trình quản trị cốt lõi, điều khiển các linh kiện phần cứng và giúp máy khởi động vận hành', explanation: 'Phần mềm hệ thống là kiến trúc hạ tầng điều hành cho các phần mềm khác bám vào.' },
      { questionText: 'Ứng dụng Web (Web-based Application) có ưu thế nổi trội nào?', options: ['A. Bắt buộc phải cài đặt phức tạp nặng ổ cứng', 'B. Chạy trực tiếp trên trình duyệt internet ở bất kỳ thiết bị nào, giảm thiểu cài đặt ổ đĩa', 'C. Không bao giờ cần mạng internet', 'D. Chỉ xem được đen trắng'], correctAnswer: 'B. Chạy trực tiếp trên trình duyệt internet ở bất kỳ thiết bị nào, giảm thiểu cài đặt ổ đĩa', explanation: 'Học thông qua web app giúp giải phóng bộ nhớ thiết bị, linh hoạt mở ở máy tính lớp hay ở nhà.' },
      { questionText: 'Phần mềm nguồn mở (Open Source Software) là gì?', options: ['A. Phần mềm độc quyền đắt đỏ phải mua khóa bản quyền', 'B. Phần mềm miễn phí chất lượng, công khai mã nguồn cho phép cộng đồng cùng chỉnh sửa cải tiến', 'C. Phần mềm độc hại lừa đảo', 'D. Bản thử nghiệm bị hỏng lỗi'], correctAnswer: 'B. Phần mềm miễn phí chất lượng, công khai mã nguồn cho phép cộng đồng cùng chỉnh sửa cải tiến', explanation: 'Nguồn mở thúc đẩy sự phát triển công nghệ tri thức nhờ sự sẻ chia tự do sáng tạo.' },
      { questionText: 'Google Chrome, Microsoft Word, và game giải đố thuộc loại nào sau đây?', options: ['A. Phần mềm hệ thống', 'B. Phần mềm ứng dụng', 'C. Bộ phận cơ khí cứng', 'D. Mạng dây điện'], correctAnswer: 'B. Phần mềm ứng dụng', explanation: 'Chúng hỗ trợ người dùng hoàn tất các công việc học toán, viết chữ hay khám phá kho tri thức cụ thể.' },
      { questionText: 'Bất lợi lớn nhất của một ứng dụng web so với ứng dụng chạy trực tiếp ngoại tuyến là?', options: ['A. To hơn nhiều', 'B. Yêu cầu thiết bị liên tục duy trì kết nối Internet tốt ổn định', 'C. Ít màu sắc sống động', 'D. Nút bấm nhỏ hơn hẳn'], correctAnswer: 'B. Yêu cầu thiết bị liên tục duy trì kết nối Internet tốt ổn định', explanation: 'Không có kết nối mạng ổn định, dữ liệu chạy trên máy chủ đám mây không thể hồi đáp về trình duyệt.' }
    ],
    true_falses: [
      { questionText: 'Phần mềm độc quyền bắt buộc người sử dụng phải mua bản quyền pháp lý và không được phép chỉnh sửa trái quy định.', correctAnswer: 'Đúng', explanation: 'Người tạo ra phần mềm độc quyền sử dụng các biện pháp kỹ thuật và pháp lý để giữ độc quyền bí mật mã nguồn.' },
      { questionText: 'Mọi dòng phần mềm ứng dụng di động đều có thể khởi động mượt mà dũng mãnh trên chiếc máy tính bàn to lớn không cần giả lập.', correctAnswer: 'Sai', explanation: 'Sai! Hệ sinh thái app điện thoại (như tệp APK) không khớp kiến trúc phần mềm máy tính nguyên bản, cần ứng dụng trung gian mô phỏng.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép loại phần mềm tương ứng với định nghĩa đặc điểm chuẩn mực!', lefts: ['Phần mềm Hệ thống', 'Phần mềm Ứng dụng', 'Ứng dụng Web-app', 'Phần mềm Nguồn mở'], rights: ['Vận hành linh kiện phần cứng', 'Giúp con người thực hiện một nhiệm vụ cụ thể', 'Khởi động gọn gàng trên trình duyệt', 'Tự do nghiên cứu nâng cấp mã nguồn miễn phí'], explanation: 'Quá thông thái! Em đã thuộc làu cách định danh các loại phần mềm trong bài.' },
      { questionText: 'Phân loại các sản phẩm phần mềm vào đúng nhóm của chúng!', lefts: ['Trò chơi Minecraft', 'Mã lệnh Android sửa đổi', 'Trình điều khiển Driver Card họa', 'Phần mềm gõ văn bản Word'], rights: ['Phần mềm Ứng dụng học tập', 'Phần mềm Nguồn mở linh hoạt', 'Phần mềm Hệ thống chuyên sâu', 'Phần mềm Ứng dụng văn phòng'], explanation: 'Xuất sắc không tì vết! Hiểu rõ công việc của từng loại phần mềm giúp em quản trị sử dụng máy tính hiệu quả.' }
    ],
    gap_fills: [
      { questionText: 'Hệ điều hành Linux là ví dụ điển hình của loại phần mềm mã nguồn ... miễn phí dồi dào sáng tạo.', correctAnswer: 'mo', explanation: 'Mã nguồn mở (Open Source) là bệ phóng cho hàng triệu kỹ sư khởi tạo ứng dụng miễn phí đỉnh cao.' }
    ]
  },
  'lic3-3-5': {
    quizzes: [
      { questionText: 'Hệ điều hành (Operating System) đóng vai trò trung tâm nào sau đây?', options: ['A. Là phần cứng bóng loáng', 'B. Là chương trình quản trị hệ thống điều khiển mọi việc, giao tiếp phần cứng và phần mềm, chạy chương trình ngoại vi', 'C. Là chiếc pin sạc để bàn', 'D. Là cáp đồng nối mạng'], correctAnswer: 'B. Là chương trình quản trị hệ thống điều khiển mọi việc, giao tiếp phần cứng và phần mềm, chạy chương trình ngoại vi', explanation: 'Thiếu hệ điều hành máy tính chỉ là đống sắt vụn cơ khí, không khởi động nạp linh hồn chỉ dẫn được.' },
      { questionText: 'Hệ điều hành nào sau đây thuộc thế giới mã nguồn mở rực rỡ và chạy rộng rãi trên điện thoại di động?', options: ['A. iOS độc quyền táo', 'B. Android phổ thông', 'C. Windows Phone', 'D. macOS laptop'], correctAnswer: 'B. Android phổ thông', explanation: 'Android kế thừa nhân Linux nguồn mở, tùy biến tự do nên hàng triệu hãng điện thoại yêu thích tích hợp.' },
      { questionText: 'Ai có nhiệm vụ sắp xếp dữ liệu tệp tin gọn gàng trên máy tính?', options: ['A. Bộ sạc dây', 'B. Trình quản lý tệp tin của Hệ điều hành', 'C. Bóng led xanh hiển thị pin', 'D. Bộ loa thùng đằng sau'], correctAnswer: 'B. Trình quản lý tệp tin của Hệ điều hành', explanation: 'Hệ điều hành quản trị tập tin giúp người học tạo thư mục, xóa tệp bẩn gọn gàng nhanh gọn.' },
      { questionText: 'Hai hệ điều hành quen thuộc nào dành cho dòng máy tính xách tay và máy tính để bàn chiếm thị phần lớn?', options: ['A. Android và iOS', 'B. Windows và macOS', 'C. Linux và WatchOS', 'D. Windows Phone và ChromeOS'], correctAnswer: 'B. Windows và macOS', explanation: 'Windows của Microsoft và macOS của hãng Apple chính là đầu tàu trên các dòng Máy để bàn/Laptop dồi dào ứng dụng.' },
      { questionText: 'Công việc nào dưới đây KHÔNG phải là nhiệm vụ chính của hệ điều hành?', options: ['A. Kiểm soát kết nối thiết bị cắm ngoài chuột phím', 'B. Quản lý thư mục file ngăn nắp', 'C. Sấy khô máy tính bị dính nước ẩm', 'D. Cung cấp môi trường chạy cho MS PowerPoint'], correctAnswer: 'C. Sấy khô máy tính bị dính nước ẩm', explanation: 'Sấy khô máy tính bị ướt là hành động vật lý thủ công bảo trì thiết bị của con người.' }
    ],
    true_falses: [
      { questionText: 'Chúng ta có thể tự do chỉnh sửa, thay thế linh kiện mã nguồn lõi của hệ điều hành đóng iOS đại trà ngoài thị trường.', correctAnswer: 'Sai', explanation: 'Sai! iOS là hệ điều hành mã nguồn đóng của hãng Apple bảo vệ bản quyền cực kỳ chặt chẽ chống thay đổi.' },
      { questionText: 'Linux là hệ điều hành mã nguồn mở chạy ổn định và siêu an toàn, thường được lập trình viên sử dụng miễn phí.', correctAnswer: 'Đúng', explanation: 'Đúng! Linux là hệ điều hành nguồn mở bền bỉ, an toàn tạo tiền đề cho internet phát triển vượt bậc.' }
    ],
    matchings: [
      { questionText: 'Hãy kết nối các Hệ điều hành tương ứng với thế giới mã nguồn của chúng!', lefts: ['Hệ điều hành Windows 11', 'Hệ điều hành Linux mở', 'Hệ điều hành iOS điện thoại rực rỡ', 'Hệ điều hành Android di động'], rights: ['Hệ điều hành mã nguồn đóng', 'Hệ điều hành mã nguồn mở', 'Hệ điều hành mã nguồn đóng', 'Hệ điều hành mã nguồn mở'], explanation: 'Cực chuẩn! Sự rạch ròi phân chia mã nguồn mở và đóng giúp nhà phát triển thiết kế giải pháp phần mềm thông thái.' },
      { questionText: 'Nối nhiệm vụ chỉ đạo của Hệ điều hành tương đồng tác nhân con người!', lefts: ['Điều khiển phần cứng thiết bị', 'Quản trị hồ sơ tài liệu', 'Tương tác giao diện học tập', 'Điều phối luồng thông tin mạng'], rights: ['Como anh cảnh sát chỉ huy đèn ngã tư xe cộ', 'Như cô thủ thư cất sách ngăn nắp gọn gàng', 'Như cánh cửa mở đón khách vào tham quan nhà', 'Như người đưa thư phân phối phong bì an toàn'], explanation: 'Kỳ diệu! Sự liên tưởng thực tế giúp em thấu hiểu khối óc chỉ huy điều hành vĩ đại của Máy tính sâu sắc hơn.' }
    ],
    gap_fills: [
      { questionText: 'Hệ điều hành đóng vai trò là cầu nối gân gắn kết giữa Phần cứng và các chương trình ... để hoạt động trơn tru.', correctAnswer: 'phan mem', explanation: 'Hệ điều hành thông dịch chỉ lệnh phần mềm chuyển thành hành ngôn cơ học cho CPU, GPU.' }
    ]
  },
  'lic3-3-6': {
    quizzes: [
      { questionText: 'Tài khoản Quản trị viên (Administrator Account) sở hữu năng lực tối cao nào?', options: ['A. Chỉ được xem giờ đồng hồ', 'B. Toàn quyền cài phông chữ, thiết lập sâu, cài đặt ứng dụng nâng cao và điều chỉnh bảo mật hệ thống', 'C. Không thể đổi mật khẩu đăng nhập', 'D. Tự khởi động loa phát to quá cỡ tự động'], correctAnswer: 'B. Toàn quyền cài phông chữ, thiết lập sâu, cài đặt ứng dụng nâng cao và điều chỉnh bảo mật hệ thống', explanation: 'Admin giữ khóa tối hậu điều phối cài đặt sâu để gìn giữ an toàn cho toàn diện thiết bị máy.' },
      { questionText: 'Tài khoản người dùng thông thường (Standard User Account) bị giới hạn quyền gì?', options: ['A. Không được nghe nhạc bằng tai nghe', 'B. Không thể cài đặt phần mềm mới làm thay đổi tệp lõi hệ thống bừa bãi có thể mang virus hại máy', 'C. Không được bấm phím cách', 'D. Chỉ được mở máy tính vào ban ngày'], correctAnswer: 'B. Không thể cài đặt phần mềm mới làm thay đổi tệp lõi hệ thống bừa bãi có thể mang virus hại máy', explanation: ' Standard user giúp tránh các tai nạn thao tác cài cắm nhầm ứng dụng mã độc phá hoại.' },
      { questionText: 'Thế nào là một mật khẩu đăng nhập dũng mãnh và an toàn nhất?', options: ['A. Bằng tên cún cưng dạng "cun"', 'B. Bằng ngày tháng sinh của bản thân như "12345678"', 'C. Ít nhất 8 ký tự, có đủ chữ Hoa, chữ thường, số toán học và dấu đặc biệt như "Ic3@3968!"', 'D. Để mật khẩu trống hoàn toàn'], correctAnswer: 'C. Ít nhất 8 ký tự, có đủ chữ Hoa, chữ thường, số toán học và dấu đặc biệt như "Ic3@3968!"', explanation: 'Mật khẩu đa dạng cấu trúc giảm thiểu rủi ro bị kẻ gian dò quét giải mã bốc hơi thông tin.' },
      { questionText: 'Hành vi nào giúp em rèn luyện tính lịch thiệp bảo mật thông tin tài khoản trên lớp tốt nhất?', options: ['A. Viết mật khẩu to lớn dán lên vách tường', 'B. Tiết lộ mật khẩu đăng nhập cho tất cả bạn học cùng chơi', 'C. Giữ bí mật tuyệt đối mật khẩu đăng nhập, khóa màn hình trước khi rời chỗ ngồi thực hành', 'D. Không bao giờ thèm đổi mật khẩu thô sơ'], correctAnswer: 'C. Giữ bí mật tuyệt đối mật khẩu đăng nhập, khóa màn hình trước khi rời chỗ ngồi thực hành', explanation: 'Tự ý thức giữ gìn bảo vệ tài khoản cá nhân ngăn cản những rắc rối thông tin hư cấu làm tổn hại uy tín học tập.' },
      { questionText: 'Nếu em quên mật khẩu Standard User của mình, ai có thể hỗ trợ mật khẩu mới?', options: ['A. Bất kỳ bạn học sinh nào kề bên', 'B. Tài khoản Quản trị viên (Administrator - thầy cô, quản trị phòng máy)', 'C. Chủ nhân nhà bán điện thoại', 'D. Nhà cung cấp dây đồng mạng'], correctAnswer: 'B. Tài khoản Quản trị viên (Administrator - thầy cô, quản trị phòng máy)', explanation: 'Admin có chìa khóa vạn năng ghi đè tái cấp mật khẩu cho người dùng thuộc quyền.' }
    ],
    true_falses: [
      { questionText: 'Học sinh tiểu học rèn luyện thực hành phòng tin nên sử dụng tài khoản Administrator để cài cắm game bừa bãi không kiểm duyệt.', correctAnswer: 'Sai', explanation: 'Sai! Cài cài bừa bãi ứng dụng lậu dễ rò rỉ mã độc kéo đổ bảo an hệ thống máy tính dùng chung.' },
      { questionText: 'Mật khẩu "12345678" là mật khẩu siêu yếu dễ bị bẻ gãy dò quét trong vài tích tắc của kẻ gian.', correctAnswer: 'Đúng', explanation: 'Đúng! Chuỗi tự gia tăng đơn giản là dãy số đầu tiên tin tặc sẽ thử nhập bẻ khóa.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép tính chất tài khoản chuẩn xác nhất!', lefts: ['Quyền Admin dũng mãnh', 'Quyền Standard thông dụng', 'Mật khẩu mạnh kiên cố', 'Mật khẩu yếu sơ hở'], rights: ['Cài đặt thay đổi lõi can thiệp hệ thống', 'Sử dụng phần mềm học tập sẵn có an toàn', 'Chứa chuỗi ký tự hoa, số đặc trưng rực rỡ', 'Sử dụng tên bản thân hay số tiến lẻ tẻ'], explanation: 'Quá giỏi! Nền tảng phân quyền tài khoản là then chốt bảo vệ dữ liệu trường lớp luôn yên bình.' },
      { questionText: 'Hãy phân cấp mức độ an toàn mật khẩu đúng quy chuẩn!', lefts: ['"admin"', '"HaNoi123"', '"BiAn_tinHoc3!"', '"09092017"'], rights: ['Siêu yếu - từ thông dụng', 'Yếu - chỉ chữ hoa và số liên', 'Rất mạnh - đủ chữ hoa, thường, dấu đặc biệt', 'Yếu - chỉ dãy số ngày sinh dễ tìm thấy'], explanation: 'Cực đỉnh tay gõ bàn phím bảo an! Em nắm bắt hoàn hảo kỹ nghệ rèn luyện lá chắn số.' }
    ],
    gap_fills: [
      { questionText: 'Mỗi cá nhân dùng chung máy tính nên sở hữu một tài khoản ... đăng nhập độc lập để giữ riêng không gian tệp tin học tập.', correctAnswer: 'nguoi dung', explanation: 'Tài khoản người dùng (User Account) vẽ tranh giữ an toàn cho bài tập của từng bạn nhỏ.' }
    ]
  },
  'lic3-3-7': {
    quizzes: [
      { questionText: 'Quy tắc đặt tên tệp tin (File Naming) chuẩn xác quy định KHÔNG được chứa những ký tự cấm nào?', options: ['A. Chữ cái Tiếng Anh hoa và thường', 'B. Ký tự cấm đặc biệt đặc trưng: \\ / : * ? " < > |', 'C. Các chữ số từ 0 tới 9', 'D. Ký hiệu gạch dưới (_)'], correctAnswer: 'B. Ký tự cấm đặc biệt đặc trưng: \\ / : * ? " < > |', explanation: 'Các ký hiệu này được dành riêng cho hệ điều hành phân biệt đường dẫn đường chỉ tệp.' },
      { questionText: 'Đâu là tên tệp tin hợp lý và khoa học được đặt đúng chuẩn của bài vẽ tranh?', options: ['A. "TinHoc3\\\\BaiTapVeTranh.png"', 'B. "2026-06-09_BaiVeNha_TinHoc3.png"', 'C. "ChoiGame???.exe"', 'D. "Toi_Thich_Ve_Mieu_Ta_Con_Meo_Sieu_Ke_Ngang_Doc_Thich_Du_Kich_Du_Chuoi_Trang.jpg" quá dài'], correctAnswer: 'B. "2026-06-09_BaiVeNha_TinHoc3.png"', explanation: 'Tên tệp tin không vượt quá 255 ký tự, không chứa ký tự cấm đặc biệt và có cấu trúc ngày tháng khoa học.' },
      { questionText: 'Tại sao chúng ta cần tạo ra các Thư mục (Folder) hình chiếc cặp màu vàng trên màn hình?', options: ['A. Để trang trí màn hình Desktop thêm màu sắc', 'B. Để phân chia phân loại lưu chứa các tệp tin theo dự án lớp môn học khoa học ngăn nắp tránh mất mát', 'C. Để bật khởi động máy nhanh hơn', 'D. Để chơi game ẩn nấp'], correctAnswer: 'B. Để phân chia phân loại lưu chứa các tệp tin theo dự án lớp môn học khoa học ngăn nắp tránh mất mát', explanation: 'Thực chất Folder giống như ngăn tủ sách, vạch định rõ các khu lưu trữ ngăn nếp bảo quản tốt đại tri thức.' },
      { questionText: 'Độ dài tối đa cho phép của một tên tệp tin số hóa trong hệ sinh thái Windows là bao nhiêu ký tự?', options: ['A. Chỉ 10 ký tự', 'B. Không quá 255 ký tự', 'C. Tùy ý dài vô biên đến một nghìn chữ', 'D. Chính xác 50 chữ cái'], correctAnswer: 'B. Không quá 255 ký tự', explanation: '255 ký tự là dải giới hạn tối đa để ngăn ngừa tràn bộ nhớ lưu chỉ mục thư mục của hệ điều hành.' },
      { questionText: 'Tác vụ sao lưu dự phòng (Backup) dữ liệu quan trọng nên tiến hành ở địa điểm nào để an toàn nhất?', options: ['A. Chỉ lưu duy nhất ở Desktop màn hình máy của bản thân', 'B. Sao chép thêm bản thứ hai sang ổ cứng di động cắm ngoài hoặc tải lên đám mây lưu trữ', 'C. Tạo một bản sao cùng thư mục gốc', 'D. Viết nội dung bài ra giấy nháp'], correctAnswer: 'B. Sao chép thêm bản thứ hai sang ổ cứng di động cắm ngoài hoặc tải lên đám mây lưu trữ', explanation: 'Lưu trữ phân tán nhiều nơi cách biệt dập tắt nỗi sợ hỏng phần cứng nổ nguồn điện làm mất tệp tin học vĩnh viễn.' }
    ],
    true_falses: [
      { questionText: 'Học sinh được sử dụng ký tự gạch chéo xuôi (/) hay chéo ngược (\\) thoải mái khi đặt tên tệp tin nháp dán bảng.', correctAnswer: 'Sai', explanation: 'Sai! Đây là ký tự cấm tuyệt đối vì hệ điều hành sử dụng chúng để làm phân tách cây phân cấp gốc thư mục.' },
      { questionText: 'Định dạng ngày ghi tệp Năm-Tháng-Ngày (Ví dụ: 2026-06-09) giúp các tệp tự động xếp nếp ngăn nắp theo thứ tự dòng thời gian.', correctAnswer: 'Đúng', explanation: 'Đúng! Việc đặt ngày đẩy lên hàng đầu tạo thói quen sắp đặt thư mục ngăn nắp thuận lợi tìm kiếm.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép lỗi sai trong tên tệp tin tương ứng với quy chuẩn vi phạm!', lefts: ['"BaiTap/VeTranh.png"', '"HoVaTen_CuToiVuaHocVeVuaChoiBoYeuThuongNguoiBanNhoCuaToiVaBanMinhCoCoTrangGiaoVienDamNhiemGiongNoiNgọtNgaoDuDuongNgeThichPhanVeTranhMauPastelPastelPastel_Pastel-pink_VuaDepVuaTinhTeDungDungVay.png"', '"Baitoan   lop3.xlsx"', '"AnhHoaHong.png"'], rights: ['Sử dụng ký tự chéo (/) bị cấm', 'Vượt quá giới hạn dung lượng độ dài 255 chữ cái', 'Mắc lỗi khoảng trống kép trắng liên tiếp thừa', 'Tên tệp hoàn hảo đúng chuẩn mực khoa học'], explanation: 'Cực xuất sắc! Nắm chắc kỹ năng tinh tế này giúp tệp bài học vẽ của em không bao giờ bị báo lỗi Windows.' },
      { questionText: 'Nối thao tác quản lý dữ liệu với hành động cụ thể!', lefts: ['Tạo Folder mới tinh', 'Xóa tệp file hỏng', 'Sao lưu dữ liệu Backup', 'Đổi tên File name'], rights: ['Nhấp nút phải chuột chọn New -> Folder vàng', 'Thả tệp file rác vào Thùng rác Recycle Bin', 'Gửi bản copy tệp lên Google Drive an toàn', 'Chọn tệp bấm phím F2 gõ cụm từ mô tả mới'], explanation: 'Quá giỏi! Quản lý dữ liệu là kỹ năng sống số cốt lõi giúp các em làm chủ tương lai trực tuyến sạch sẽ khoa học.' }
    ],
    gap_fills: [
      { questionText: 'Cặp hồ sơ ảo màu vàng chuyên dùng chứa đựng nhiều nhóm tệp tin của môn Tin học chính là ...', correctAnswer: 'thu muc', explanation: 'Thư mục dệt nếp sống ngăn nắp số hóa dồi dào hiệu năng tinh thần học.' }
    ]
  },
  'lic3-3-8': {
    quizzes: [
      { questionText: 'Mạng máy tính (Computer Network) dùng để làm gì?', options: ['A. Giúp mát máy tính hơn', 'B. Kết nối các thiết bị để chia sẻ tài nguyên, thông tin và liên lạc', 'C. Để học sinh gõ văn bản nhanh hơn', 'D. Phát sạc bằng dây cáp'], correctAnswer: 'B. Kết nối các thiết bị để chia sẻ tài nguyên, thông tin và liên lạc', explanation: 'Thiết bị liên thông tạo xa lộ truyền dữ liệu vươn ra toàn cầu.' },
      { questionText: 'Network Adapter đóng vai trò vật lý nào trong máy?', options: ['A. Là chiếc đĩa cài phần mềm', 'B. Là bộ điều hợp mạng gắn cổng nối thiết bị vào thế giới mạng dây hoặc không dây của máy', 'C. Là chiếc giá nâng màn hình', 'D. Là màng lưới loa phát thanh'], correctAnswer: 'B. Là bộ điều hợp mạng gắn cổng nối thiết bị vào thế giới mạng dây hoặc không dây của máy', explanation: 'Network Adapter chính là cánh kỹ thuật cắm dán bám lấy đường sóng mang dữ liệu.' },
      { questionText: 'Công việc chuyển đổi tín hiệu tương tự (Analog) sang kỹ thuật số (Digital) và ngược lại thuộc về thiết bị nào?', options: ['A. Màn hình tivi', 'B. Modem truyền tín hiệu', 'C. Bộ sạc pin dự phòng', 'D. Máy in màu laser'], correctAnswer: 'B. Modem truyền tín hiệu', explanation: 'Modem (Modulator-Demodulator) mã hóa giải điều chế tín hiệu để máy thấu đạt đường thông điệp tương tự điện thoại sóng cáp.' },
      { questionText: 'Bộ định tuyến Router gánh vác nhiệm vụ cốt lõi nào?', options: ['A. Chụp quét tài liệu tranh vẽ ra giấy', 'B. Chuyển tiếp các gói dữ liệu thông minh giữa các mạng khác nhau để về đúng điểm đích cần tới', 'C. Làm cho bàn phím phát sáng nhiều mầu', 'D. Lọc bụi bẩn trong case máy'], correctAnswer: 'B. Chuyển tiếp các gói dữ liệu thông minh giữa các mạng khác nhau để về đúng điểm đích cần tới', explanation: 'Router thông minh điều hướng phân luồng giao thông mạng như cảnh sát giao thông số.' },
      { questionText: 'Những loại hạ tầng truyền tín hiệu siêu nhanh dạt dào băng thông rộng hiện nay là?', options: ['A. Thư bưu điện truyền thống gửi bưu thiếp', 'B. Dịch vụ cáp quang kết nối tốc độ cao và đường truyền DSL', 'C. Tiếng còi xe máy dội phố lớn', 'D. Gửi tín hiệu qua đài phát thanh sóng ngắn'], correctAnswer: 'B. Dịch vụ cáp quang kết nối tốc độ cao và đường truyền DSL', explanation: 'Cáp quang sợi thủy tinh truyền đi ánh sáng giúp lướt internet mượt mà.' }
    ],
    true_falses: [
      { questionText: 'Modem và Bộ định tuyến Router thực chất chỉ là một khối sườn thiết bị duy nhất bắt buộc không bao giờ có thể đứng tách rời rời.', correctAnswer: 'Sai', explanation: 'Sai! Trên thực tế chúng là hai thiết bị độc lập gánh vác việc giải mã tín hiệu và định tuyến gói, dù ngày nay có thể được gộp tinh gọn vào một vỏ thiết bị modem-router đa năng.' },
      { questionText: 'Mạng máy tính giúp các bạn nhỏ có thể gửi thư điện tử và học tập trực tuyến một cách dễ dàng bất chấp khoảng cách địa lý.', correctAnswer: 'Đúng', explanation: 'Chính xác! Mạng kết nối nhân gian tạo nên kỷ nguyên tri thức phẳng rộng mở.' }
    ],
    matchings: [
      { questionText: 'Kết nối thiết bị mạng đúng với nhiệm vụ đặc trưng!', lefts: ['Modem mã hóa', 'Router định tuyến', 'Network Adapter dính máy', 'Cáp sợi thủy tinh quang học'], rights: ['Chuyển dữ liệu Analog sang Digital gọn gàng', 'Điều hướng đưa gói tin đi trúng đích bến bãi', 'Mạch bám cổng cắm mạng cho thân trung tâm', 'Chất dẫn chuyển tiếp dữ liệu bằng ánh sáng siêu tốc'], explanation: 'Cực xuất sắc! Sự am hiểu nguyên tắc cấu thành của em rất vững vàng.' },
      { questionText: 'Phân hạng tốc độ truyền tải hạ tầng kết nối!', lefts: ['Mạng cáp quang thủy ngân', 'Đường truyền cáp điện đồng DSL', 'Công nghệ mạng quay số Dial-up cũ', 'Gửi thư bưu điện giấy bọc gói thường'], rights: ['Tốc độ siêu nhanh mượt mà hàng trăm Mbps', 'Tốc độ khá tốt qua đường dây điện thoại', 'Tốc độ siêu chậm tiếng rè rè nghẽn mạng liên miên', 'Thời gian vận chuyển tính bằng ngày dài bạt ngàn'], explanation: 'Xuất sắc! Việc hiểu rõ tiến trình lớn mạnh của hạ tầng mạng mở ra chân trời tư duy công nghệ đúng đắn.' }
    ],
    gap_fills: [
      { questionText: 'Modem đóng vai trò giải mã mã hóa chuyển đổi tín hiệu ... thành tín hiệu số dồi dào dữ liệu cho máy đọc hiểu.', correctAnswer: 'tuong tu', explanation: 'Modem liên liên kết dải sóng tương tự (Analog) cáp quang sang kĩ thuật số.' }
    ]
  },
  'lic3-3-9': {
    quizzes: [
      { questionText: 'Ưu điểm nổi trội nhất của mạng không dây Wi-Fi là gì?', options: ['A. Có dây cáp đồng treo dọc tường dũng mãnh', 'B. Mang đến sự thuận tiện linh hoạt cơ động rất cao, giúp thiết bị kết nối dễ dàng không cần dây cắm vướng víu', 'C. Không bao giờ bị mất sóng kết nối', 'D. Hoàn toàn miễn phí trên toàn thế giới bất kỳ đâu'], correctAnswer: 'B. Mang đến sự thuận tiện linh hoạt cơ động rất cao, giúp thiết bị kết nối dễ dàng không cần dây cắm vướng víu', explanation: 'Wi-Fi phủ sóng giúp em lướt web học tập từ khu vườn, phòng ngủ hay lớp học bùng nổ cơ động.' },
      { questionText: 'Ưu thế kiên cố của mạng dây cáp đồng Ethernet so với Wi-Fi là?', options: ['A. Nhìn nhiều dây cáp sặc sỡ hơn', 'B. Tốc độ cao cực kỳ ổn định, bảo mật chặt chẽ kiên cố và không sợ bị suy hao ngăn cản bởi tường gạch vách ngăn', 'C. Rẻ tiền hơn một trăm lần', 'D. Dùng sấy quần áo được'], correctAnswer: 'B. Tốc độ cao cực kỳ ổn định, bảo mật chặt chẽ kiên cố và không sợ bị suy hao ngăn cản bởi tường gạch vách ngăn', explanation: 'Mạng dây có độ suy hao tối thiểu giúp trải nghiệm chơi trò chơi học tập không bị giật lag ngắt kết nối dở dang.' },
      { questionText: 'Khi bất ngờ thiết bị máy của em bị ngắt kết nối Internet, bước kiểm tra vật lý đầu tiên nên làm gì?', options: ['A. Đập thiết bị thật mạnh', 'B. Kiểm tra xem giắc cắm dây cáp có cắm chốc chắn hay bộ phát sóng Router có đèn xanh báo sáng rực không', 'C. Format xóa sạch cài đặt ổ cứng', 'D. Mua một chiếc máy tính đắt tiền mới tinh'], correctAnswer: 'B. Kiểm tra xem giắc cắm dây cáp có cắm chốc chắn hay bộ phát sóng Router có đèn xanh báo sáng rực không', explanation: 'Đại đa số lỗi đứt kết nối mạng xuất phát từ tuột lỏng giắc cắm hoặc sập nguồn bộ phát.' },
      { questionText: 'Nhà cung cấp dịch vụ Internet viết tắt là gì?', options: ['A. CPU bộ vi xử', 'B. ISP (Internet Service Provider)', 'C. AUP nội quy học', 'D. PII thông tin cá'], correctAnswer: 'B. ISP (Internet Service Provider)', explanation: 'ISP là cổng gác dẫn lối cấp phát luồng băng thông gia đình thuê bao sử dụng.' },
      { questionText: 'Muốn kiểm tra trạng thái thông tin địa chỉ IP của thiết bị Windows, em nên sử dụng câu lệnh nào?', options: ['A. "ping 8.8.8.8"', 'B. "ipconfig" trong Command Prompt', 'C. "shutdown -s"', 'D. "format c:"'], correctAnswer: 'B. "ipconfig" trong Command Prompt', explanation: 'ipconfig (IP Configuration) hiển thị bảng thông tin định danh mạng hiện thời của máy.' }
    ],
    true_falses: [
      { questionText: 'Sóng Wifi dễ dàng đi xuyên qua dày đặc các vách đá tấm sắt to lớn kiên cố mà không hề bị hao hụt vạch sóng nào.', correctAnswer: 'Sai', explanation: 'Sai! Vách ngăn kiên cố bằng bê tông dày hay sắt lọc chặn sóng điện từ làm yếu sóng vạch Wi-Fi sụt lùi nhanh chóng.' },
      { questionText: 'Lệnh "ping" dùng để kiểm tra tính liên kết phản hồi và tốc độ chênh lệch thời gian giữa thiết bị của em tới một máy chủ đích.', correctAnswer: 'Đúng', explanation: 'Đúng! Sóng ping gửi đi các gói tin hồi hỏa giúp chẩn đoán đường thông điệp mạng dập tắt lỗi nghẽn mượt mà.' }
    ],
    matchings: [
      { questionText: 'Ghép nối lệnh chẩn đoán mạng với nhiệm vụ của chúng trong Command Prompt!', lefts: ['Lệnh "ipconfig" kiểm thông tin', 'Lệnh "ping" kiểm phản hồi', 'Lệnh "tracert" dò vết', 'Lệnh kiểm mạng vật lý thủ công'], rights: ['Hiển thị địa chỉ IP cục bộ của máy', 'Đo đạc độ trễ phản hồi gói tin phản xạ', 'Dò chi tiết các nút trạm bộ định tuyến mốc đi qua', 'Rút phích cắm cáp Ethernet cắm dính lại chắc chắn'], explanation: 'Cực kỳ tinh nhạy công nghệ! Những lệnh kiểm tra này là võ hộ thân của chuyên gia bảo trì số.' },
      { questionText: 'Nhận diện điểm yếu thế mạnh mạng Không dây và Có dây!', lefts: ['Wifi bứt phá bay bổng', 'Cáp Ethernet vững chắc', 'Wifi gặp thời tiết mưa bão vách sắt', 'Cáp Ethernet treo phòng khách'], rights: ['Đi lại thoải mái không sợi vướng chân', 'Tốc độ rực rỡ trễ bằng không yên tâm học', 'Suy hao mạng lag chập chờn giảm vạch', 'Vương dây dài dính rườm rà thiếu thanh lịch'], explanation: 'Quá siêu! Việc kết hợp hai hình thái kết nối mang lại ngôi nhà số lý tưởng nhất cho gia đình.' }
    ],
    gap_fills: [
      { questionText: 'Đơn vị cung cấp gói dịch vụ đường dây dẫn Internet tới nhà em gọi tắt là ...', correctAnswer: 'isp', explanation: 'ISP (Internet Service Provider) bán cấp hạ tầng xa lộ dẫn bạn nhỏ vươn tới dải đất số.' }
    ]
  },
  'lic3-3-10': {
    quizzes: [
      { questionText: 'Trình duyệt Web (Web Browser) là loại công cụ ứng dụng gì?', options: ['A. Dùng soạn công thức nhào bột làm bánh', 'B. Là chương trình ứng dụng phần mềm dùng mở, tìm kiếm và hiển thị toàn diện trang web thông tin từ mạng toàn cầu WWW thông qua các liên kết địa chỉ URL', 'C. Là phần sụn ổ cứng sắt', 'D. Là mỏ neo kim loại ngoài luồng'], correctAnswer: 'B. Là chương trình ứng dụng phần mềm dùng mở, tìm kiếm và hiển thị toàn diện trang web thông tin từ mạng toàn cầu WWW thông qua các liên kết địa chỉ URL', explanation: 'Trình duyệt là con tàu chở học sinh dạo chơi gặt hái tri thức khổng lồ thế giới số.' },
      { questionText: 'Khi trang web đang học bị tải dở dang mờ nhạt hoặc lỗi hiển thị hình, nút nào giúp tải lại?', options: ['A. Nút Back (Quay lại)', 'B. Nút Refresh (Tải lại trang - hình mũi tên xoay tròn)', 'C. Nút Home (Mở trang chủ mặc định)', 'D. Nút thu hẹp màn xuống taskbar'], correctAnswer: 'B. Nút Refresh (Tải lại trang - hình mũi tên xoay tròn)', explanation: 'Refresh ra lệnh dọn bộ nhớ tạm và nạp lại dòng mã nguồn trang mới mẻ dập tắt lỗi kĩ thuật.' },
      { questionText: 'Chế độ lướt ẩn danh (Private/Incognito Browsing) mang lại bảo mật gì?', options: ['A. Chặn đứng sét đánh hư hại sườn máy tính', 'B. Không lưu lại lịch sử học tập xem trang, tắt cookie tự động và không lưu file tạm thời sau khi đóng tab', 'C. Làm cho máy tính ẩn hình tàng hình biến mất trước mắt', 'D. Được miễn phí mua sách toán'], correctAnswer: 'B. Không lưu lại lịch sử học tập xem trang, tắt cookie tự động và không lưu file tạm thời sau khi đóng tab', explanation: 'Chế độ ẩn danh bảo vệ thông tin riêng tư tạm thời khi các em đi mượn máy người lạ dùng tra cứu điểm số.' },
      { questionText: 'Cookie lưu trữ thông tin gì của người dùng?', options: ['A. Những chiếc bánh quy bơ ngọt ngào', 'B. Đoạn tệp văn bản nhỏ ghi chú trạng thái lướt web, thói quen cài cắm và duy trì phiên đăng nhập tiện lợi', 'C. Ảnh đại diện 3D màu hồng', 'D. Tiết mục lập trình trò chơi'], correctAnswer: 'B. Đoạn tệp văn bản nhỏ ghi chú trạng thái lướt web, thói quen cài cắm và duy trì phiên đăng nhập tiện lợi', explanation: 'Cookie giúp trang web mộc mạc nhận dạng được em là ai để chào đón duy trì giỏ hàng hay cấu hình đã lưu.' },
      { questionText: 'Thành phần nào cấu tạo nên một địa chỉ liên kết trang web URL hoàn chỉnh?', options: ['A. Chỉ chứa một dãy số ngẫu nhiên không có chữ', 'B. Giao thức mạng kết nối (http/https), tên miền của máy chủ Web và đường dẫn chi tiết trang tệp', 'C. Mật khẩu bí mật của hiệu trưởng', 'D. Một biểu tượng vẽ bằng Paint'], correctAnswer: 'B. Giao thức mạng kết nối (http/https), tên miền của máy chủ Web và đường dẫn chi tiết trang tệp', explanation: 'URL chỉ định duy nhất tọa độ chuẩn mực bến bãi tài nguyên trực tuyến.' }
    ],
    true_falses: [
      { questionText: 'Chế độ lướt ẩn danh bảo vệ em hoàn toàn tuyệt đối trước mọi nguy cơ virus mã độc xâm nhập phá hoại phần cứng máy.', correctAnswer: 'Sai', explanation: 'Sai! Ẩn danh chỉ là không ghi lưu hành tung lịch sử trên ổ đĩa nội dung máy em, không có tính năng chặn tải xuống phần mềm độc hại hay vá lỗi bảo mật phần cứng.' },
      { questionText: 'Nút mũi tên quay lại Back có chức năng đưa trình duyệt đi ngược dòng lịch sử về trang web liền trước vừa mới đọc xem.', correctAnswer: 'Đúng', explanation: 'Đúng! Phím Back là cỗ máy thời gian định vị vết bước lướt tuyệt đẹp tiện dụng.' }
    ],
    matchings: [
      { questionText: 'Hãy nối hành động điều hướng trình duyệt đúng với biểu tượng tương ứng!', lefts: ['Quay về trang web vừa xem trước đó', 'Tải lại trang web khi bị hiển thị lỗi', 'Xem các trang web đã đánh dấu sẵn từ trước', 'Gõ từ khóa định vị URL trang mới'], rights: ['Nút Back (mũi tên hướng trái)', 'Nút Refresh (mũi tên vòng tròn khép)', 'Khu vực Bookmark/Favorites', 'Hộp thanh địa chỉ Address Bar'], explanation: 'Cực dột phá! Nắm chắc điều hướng biến em thành thuyền trưởng thông tuệ xông pha sóng gió dữ liệu mạng.' },
      { questionText: 'Nối khái niệm trực tuyến với mô tả chức năng cốt lõi!', lefts: ['Giao thức bảo mật HTTPS', 'Quả cầu WWW mạng lưới', 'Tệp tin nhỏ Cookie', 'URL dẫn lối'], rights: ['Mã hóa bảo giữ thông tin an toàn cao', 'World Wide Web kết nối dạt dào trang tri thức', 'Ghi chú lưu luyến phiên đăng nhập người học', 'Địa chỉ định vị chính xác vị trí tệp tin web'], explanation: 'Xuất sắc! Sự am hiểu internet tạo nền móng vững bền bước đi vững chắc trong đời sống số.' }
    ],
    gap_fills: [
      { questionText: 'Chế độ lướt web ... giúp các em không bị lưu lại lịch sử tra cứu thông tin sau khi tắt hoàn toàn tab trình duyệt.', correctAnswer: 'an danh', explanation: 'Ẩn danh che mờ hành tung riêng tư, đề phòng rò rỉ khi dùng chung máy tính phòng máy lớp.' }
    ]
  },
  'lic3-3-11': {
    quizzes: [
      { questionText: 'Bookmark hay mục Favorite mang lại sự tiện ích thần kì nào?', options: ['A. Tải phim hoạt hình về ổ cứng', 'B. Ghi dấu lưu trữ nhanh địa chỉ trang web em yêu thích để chỉ cần gõ nhấp chuột một lần là mở trúng ngay lần sau', 'C. Đổi hình nền trình duyệt sang đen thui', 'D. Tăng tốc độ cồng Wifi mạnh gấp thế hệ mới'], correctAnswer: 'B. Ghi dấu lưu trữ nhanh địa chỉ trang web em yêu thích để chỉ cần gõ nhấp chuột một lần là mở trúng ngay lần sau', explanation: 'Bookmark như chiếc kẹp sách mầu sắc giúp tìm nhanh trang sách hay đang học dở dang.' },
      { questionText: 'Hành động nào giúp em hiển thị thanh Bookmark Bar gọn gàng ngay dưới thanh địa chỉ của Chrome?', options: ['A. Tắt màn hình đi ngủ', 'B. Bật cài đặt nâng cao và nhấn tích chọn "Show Bookmarks Bar" (Hiện thanh Dấu trang)', 'C. Nhấp đúp chuột lên case thùng máy tính cơ học', 'D. Gỡ bỏ cài đặt Google Chrome'], correctAnswer: 'B. Bật cài đặt nâng cao và nhấn tích chọn "Show Bookmarks Bar" (Hiện thanh Dấu trang)', explanation: 'Bookmarks Bar hiện lên tạo dải ngân hà lối tắt dẫn em tới những góc học tập quen thuộc hàng ngày.' },
      { questionText: 'Đâu KHÔNG phải là một trình duyệt web phổ dụng chuyên nghiệp trên thế giới?', options: ['A. Safari rực sáng', 'B. Microsoft Edge thông tuệ', 'C. Máy quét Scanner', 'D. Opera đa năng'], correctAnswer: 'C. Máy quét Scanner', explanation: 'Máy quét là thiết bị phần cứng chụp ảnh tài liệu thực thể, không liên can ứng dụng đọc web.' },
      { questionText: 'Thương hiệu trình duyệt mặc định được cài đặt sẵn đi kèm khi hệ điều hành Windows khởi chạy lần đầu là?', options: ['A. Safari dũng cảm', 'B. Google Chrome thịnh hành', 'C. Microsoft Edge tân tiến', 'D. Mozilla Firefox cáo đỏ'], correctAnswer: 'C. Microsoft Edge tân tiến', explanation: 'Microsoft Edge ra đời thế chân trình duyệt cũ, tối ưu hoàn hảo kiến trúc Windows hiện hành.' },
      { questionText: 'Nếu Bookmark của em bị chứa quá nhiều trang web lộn xộn khó tìm, giải pháp thông thái nhất là?', options: ['A. Bấm nút xóa trắng tất cả không thương tiếc', 'B. Gom đặt tạo các Thư mục Dấu trang (Bookmark Folders) theo chủ đề riêng phân định rõ ràng', 'C. Đóng trình duyệt tắt máy', 'D. Mở thật nhiều cửa sổ mới'], correctAnswer: 'B. Gom đặt tạo các Thư mục Dấu trang (Bookmark Folders) theo chủ đề riêng phân định rõ ràng', explanation: 'Xây ngăn thư mục phân tách "Toán", "Tin", "Tiếng Việt" làm phong thái học tập ngăn nắp sạch gọn.' }
    ],
    true_falses: [
      { questionText: 'Học sinh có thể bookmark một trang web học tập toán hay, kể cả khi máy của em đang kết nối mạng hoặc mất mạng Wi-Fi dở dang.', correctAnswer: 'Đúng', explanation: 'Đúng! Việc bookmark chỉ là lệnh lưu địa chỉ liên kết URL trong bộ cài cài máy của em, tuy nhiên nếu mất mạng em chỉ lưu được tên chứ không truy cập đọc được nội dung trang web đó.' },
      { questionText: 'Trình duyệt Safari chỉ có thể tải chạy duy nhất trên nền tảng của hệ thống đồ nhà Táo Apple (macOS, iOS, iPadOS).', correctAnswer: 'Đúng', explanation: 'Chính xác! Safari được Apple thiết kế chuyên sâu, tối ưu phần cứng độc quyền và ngừng phát triển phiên bản Windows từ lâu.' }
    ],
    matchings: [
      { questionText: 'Nối trình duyệt Web với biểu tượng đặc thù dễ thương nhận dạng!', lefts: ['Google Chrome thị phần lớn', 'Microsoft Edge Windows sẵn', 'Mozilla Firefox kiêu hãnh', 'Safari mạo hiểm đại dương'], rights: ['Vòng tròn xoáy sắc màu Đỏ - Vàng - Lục - Lam', 'Cánh sóng biển cuộn tròn màu xanh ngọc bích', 'Chú cáo lửa cam ôm giữ quả địa cầu xanh lam', 'Chiếc la bàn cổ hướng thẳng phương Bắc thanh lịch'], explanation: 'Cực giỏi! Đôi mắt tinh anh giúp em nắm bắt tuyệt vời ngôn ngữ nhận diện thương hiệu công nghệ.' },
      { questionText: 'Xếp đặt trình tự thao tác Bookmark một trang web điểm hay trên Chrome!', lefts: ['Bước 1: Tiếp cận trang web hay', 'Bước 2: Click ngôi sao góc phải', 'Bước 3: Chọn vị trí thư mục', 'Bước 4: Nhấp chọn Done'], rights: ['Mở trang và đọc thấy nội dung hăng say hữu ích', 'Biểu tượng ngôi sao sáng lên báo hiệu nhận lệnh', 'Đẩy vào thanh Bookmark bar hoặc thư mục riêng', 'Xác nhận lưu trữ an toàn lối tắt diệu kỳ'], explanation: 'Cực đỉnh quy trình! Em thực hiện thao tác nhanh chuẩn như kỹ sư phòng thí nghiệm số.' }
    ],
    gap_fills: [
      { questionText: 'Biểu tượng dùng ra lệnh Bookmark lưu trang web trên các trình duyệt Edge, Chrome là hình ... năm cánh quen thuộc.', correctAnswer: 'ngoi sao', explanation: 'Ngôi sao vàng thắp sáng mỏ neo lối tắt dẫn lối bạn nhỏ học bùng nổ.' }
    ]
  },
  'lic3-3-12': {
    quizzes: [
      { questionText: 'Cơ chế hoạt động của một công cụ tìm kiếm (Search Engine) trải qua những hành động nào?', options: ['A. Tạo tài khoản mật khẩu mạnh', 'B. Crawl (Tìm mồi bò bắt thông tin), Index (Lập chỉ mục lưu kho), Rank (Xếp hạng phân loại tinh hoa)', 'C. In sách phát miễn phí', 'D. Chơi điện tử điểm cao'], correctAnswer: 'B. Crawl (Tìm mồi bò bắt thông tin), Index (Lập chỉ mục lưu kho), Rank (Xếp hạng phân loại tinh hoa)', explanation: 'Cơ chế 3 bước giúp tổ chức sắp xếp dữ liệu toàn vũ trụ số về bàn tay người tra cứu.' },
      { questionText: 'Khi em muốn tìm CHÍNH XÁC cụm từ tìm kiếm học tập không bị rải rác tách vỡ, mẹo vàng là dùng ký hiệu gì?', options: ['A. Dấu gạch chéo ngược \\', 'B. Đặt dải từ khóa bên trong Dấu ngoặc kép "...""', 'C. Thêm dấu chấm hỏi (?) kề bên', 'D. Gõ chữ đỏ in đậm hoàn toàn'], correctAnswer: 'B. Đặt dải từ khóa bên trong Dấu ngoặc kép "...""', explanation: 'Dấu ngoặc kép ép công cụ tìm kiếm lọc tìm chính xác trật tự chuỗi từ ngữ ghép nối.' },
      { questionText: 'Để HOÀN TOÀN loại trừ một chủ đề bẩn phá phách dải kết quả tìm kiếm, em sử dụng dấu gì phía trước từ khóa chặn?', options: ['A. Dấu ngã (~)', 'B. Dấu trừ (-) sát khít liền trước từ cần loại bỏ', 'C. Dấu chia (:)', 'D. Biểu tượng ngôi sao (*)'], correctAnswer: 'B. Dấu trừ (-) sát khít liền trước từ cần loại bỏ', explanation: 'Dấu trừ ví như lưỡi lọc băm đi các nhánh thư rác rưởi không ăn nhập mục tiêu khám phá học.' },
      { questionText: 'Dấu ngã (~) liền trước từ khóa tìm kiếm đem lại quyền năng gì?', options: ['A. Tìm các từ ngữ đồng nghĩa với từ khóa đó dồi dào vốn từ hơn', 'B. Làm cho chữ biến mất tiêu', 'C. Lọc ảnh chụp động vật', 'D. Nút xóa tệp vĩnh viễn'], correctAnswer: 'A. Tìm các từ ngữ đồng nghĩa với từ khóa đó dồi dào vốn từ hơn', explanation: 'Dấu ngã mở rộng dải mỏ neo ngôn từ, tìm các từ tương tự giúp làm giàu kiến thức làm văn của em.' },
      { questionText: 'Đâu KHÔNG phải là trang công cụ tìm kiếm tri thức phổ biến trên Web?', options: ['A. Google bạo chúa', 'B. Bing mộc mạc', 'C. Microsoft Word soạn văn', 'D. Yahoo hoài cổ'], correctAnswer: 'C. Microsoft Word soạn văn', explanation: 'Word là phần mềm soạn thảo lưu trữ tệp, không có tính năng bò bắt tự động dữ liệu index toàn cầu.' }
    ],
    true_falses: [
      { questionText: 'Công cụ tìm kiếm Google biết tuốt mọi sự thật đời thực và không bao giờ đưa ra các kết quả sai trái hay lừa lọc gạt gẫm học sinh.', correctAnswer: 'Sai', explanation: 'Sai! Google chỉ cào nhặt thông tin hỗn tạp do con người đẩy lên mạng, học sinh cần rèn luyện tư duy phản biện gạn đục khơi trong hỏi thầy cô cha mẹ để tin cẩn.' },
      { questionText: 'Sử dụng dấu sao (*) đóng vai trò là ký tự đại diện (wildcard) thay thế cho một từ bí ẩn nào đó chưa nhớ ra trong cụm từ.', correctAnswer: 'Đúng', explanation: 'Chuẩn xác! Dấu sao lấp trống giúp giải cứu những câu hát, câu thơ bị rơi rụng vài chữ trong trí nhớ học sinh.' }
    ],
    matchings: [
      { questionText: 'Ghép nối mẹo tìm kiếm nâng cao với chức năng ảo diệu tương xứng!', lefts: ['"Tin học lớp 3"', 'đồ chơi -nhựa', 'học tập ~thông minh', 'sáng tạo * đẹp'], rights: ['Tìm chính xác dải cụm từ kề nhau khít khịt', 'Tìm đồ chơi nhưng cắt lọc sạch kết quả chất liệu nhựa', 'Tìm học tập đi kèm từ đồng nghĩa (ví dụ: khôn ngoan, trí tuệ)', 'Tìm kiếm với từ khóa khuyết từ bí ẩn ở giữa vị trí dấu sao'], explanation: 'Quá điêu luyện! Kỹ nghệ tìm kiếm nâng cao biến em thành thám tử số lừng danh.' },
      { questionText: 'Nối tiến trình nghiệp vụ công cụ tìm kiếm với tác vụ cụ thể của máy chủ!', lefts: ['Crawl (Thu thập con bọ)', 'Index (Lập chỉ mục lưu kho)', 'Rank (Xếp hạng phân loại)', 'User Query (Truy vấn học sinh)'], rights: ['Dùng robot ảo đi mọi bờ cõi quét liên kết trang', 'Phân loại ghi tên trang web vào tủ hồ sơ khổng lồ', 'So sánh độ tin cậy để đưa trang hay nhất lên Trang 1', 'Học sinh gõ từ khóa bấm Enter chờ đón kết quả'], explanation: 'Cực chuẩn xác! Em đã thấu triệt lý thuyết nền móng vận hành của xa lộ tri thức số.' }
    ],
    gap_fills: [
      { questionText: 'Khi gõ từ khóa tìm kiếm, đặt chữ sát khít sau dấu ... sẽ loại trừ tất cả các kết quả chứa chữ ấy ra khỏi màn hình hiển thị.', correctAnswer: '-', explanation: 'Phím trừ (-) giúp dọn dẹp các đường link rác mệt mỏi nhiễu loạn.' }
    ]
  },
  'lic3-3-13': {
    quizzes: [
      { questionText: 'Thế nào là tài sản thuộc về Miền công cộng (Public Domain)?', options: ['A. Là tài sản độc quyền của thủ tướng', 'B. Là những tác phẩm tri thức nghệ thuật đã hết hạn bảo hộ bản quyền hoặc tác giả cam kết quyên tặng tự nguyện cho nhân loại sử dụng tự do hoàn toàn', 'C. Phải trả nhiều nghìn đô la bảo mật', 'D. Là đồ chơi đắt tiền bãi cát'], correctAnswer: 'B. Là những tác phẩm tri thức nghệ thuật đã hết hạn bảo hộ bản quyền hoặc tác giả cam kết quyên tặng tự nguyện cho nhân loại sử dụng tự do hoàn toàn', explanation: 'Tác phẩm trong Public Domain là kho báu chung của nhân loại tha hồ học tập sao chép.' },
      { questionText: 'Giấy phép Creative Commons CC-BY yêu cầu người sử dụng bắt buộc phải làm gì?', options: ['A. Trả thật nhiều tiền vàng cho tác giả', 'B. Trích dẫn ghi rõ tên nguồn danh tính của tác giả sản phẩm gốc', 'C. Không được xem hình ảnh', 'D. Phải chia sẻ lại bằng đĩa cài'], correctAnswer: 'B. Trích dẫn ghi rõ tên nguồn danh tính của tác giả sản phẩm gốc', explanation: 'BY chính là ghi công (Attribution), tôn trọng mồ hôi chất xám của nhà sáng tạo dũng mãnh.' },
      { questionText: 'Giấy phép có ký hiệu CC-BY-NC ngăn chặn hành vi sử dụng nào?', options: ['A. Sử dụng cho học tập lớp học giảng dạy miễn phí', 'B. Sử dụng cho hoạt động thương mại kiếm tiền bất hợp pháp lợi nhuận', 'C. Không cho phép học sinh đọc trực tuyến', 'D. Bắt buộc phải tắt kết nối mạng'], correctAnswer: 'B. Sử dụng cho hoạt động thương mại kiếm tiền bất hợp pháp lợi nhuận', explanation: 'NC (Non-Commercial) cấm chỉ việc trục lợi thương mại trên tác phẩm chia sẻ cộng đồng.' },
      { questionText: 'Bản quyền tác phẩm (Copyright) thông thường bảo hộ sáng tạo kéo dài bao lâu?', options: ['A. Chỉ 1 năm duy nhất', 'B. Suốt cuộc đời tác giả và kéo dài thêm 50 đến 100 năm sau khi họ qua đời tùy theo luật pháp từng quốc gia', 'C. Vô hạn từ thời cổ đại', 'D. Chỉ trong vòng mười ngày học'], correctAnswer: 'B. Suốt cuộc đời tác giả và kéo dài thêm 50 đến 100 năm sau khi họ qua đời tùy theo luật pháp từng quốc gia', explanation: 'Luật bản quyền bảo hộ lợi ích con cháu tác giả kế thừa bảo tồn di sản học thuật.' },
      { questionText: 'Quy tắc Sử dụng hợp lý (Fair Use) cho phép em làm gì phục vụ học tập?', options: ['A. Sao chép nguyên vẹn hàng triệu cuốn sách in lậu đem bán lấy tiền tiêu', 'B. Trích dẫn một góc đoạn ngắn gọn gàng trong tài liệu để làm dẫn chứng tranh biện học tập thuyết trình lớp học', 'C. Sửa đổi xóa tên tác giả gốc', 'D. Không cần xin phép làm gì cả bừa bãi'], correctAnswer: 'B. Trích dẫn một góc đoạn ngắn gọn gàng trong tài liệu để làm dẫn chứng tranh biện học tập thuyết trình lớp học', explanation: 'Sử dụng hợp lý kích thích tri thức nảy mầm không làm tổn hại lợi nhuận thương mại tác giả.' }
    ],
    true_falses: [
      { questionText: 'Bất kỳ hình ảnh nào em tìm kiếm lượm nhặt thấy trên mạng Google đều thuộc Miền công cộng tha hồ mang đi in bán.', correctAnswer: 'Sai', explanation: 'Sai hoàn toàn! Đa số ảnh mạng đều có chủ sở hữu bản quyền kiên cố, tự tiện dùng thương mại sẽ bị khiếu nại phạt luật luật.' },
      { questionText: 'Giấy phép Creative Commons CC-BY-ND cấm tuyệt đối người dùng cắt xén, chỉnh sửa hay phái sinh biến đổi tác phẩm gốc.', correctAnswer: 'Đúng', explanation: 'Chính xác! Ký hiệu ND (No-Derivatives) yêu cầu bảo toàn tuyệt đối nguyên trạng vẻ đẹp đứa con tinh thần của tác giả.' }
    ],
    matchings: [
      { questionText: 'Nối ký hiệu Creative Commons với quy chế ứng xử pháp lý tương xứng!', lefts: ['Quy chế BY (Attribution)', 'Quy chế NC (Non-Commercial)', 'Quy chế ND (No-Derivatives)', 'Quy chế SA (Share-Alike)'], rights: ['Ghi danh tôn vinh tên tác giả gốc rực rỡ', 'Cấm chỉ dùng trục lợi tiền bạc kinh doanh', 'Bảo toàn nguyên bản không băm vỡ phái sinh', 'Phải chia sẻ sản phẩm mới bằng giấy phép tương đương'], explanation: 'Cực kỳ hiểu luật số! Sống thượng tôn pháp luật giúp bảo toàn an toàn sự nghiệp số của em bền vững.' },
      { questionText: 'Phân loại nguồn gốc tác phẩm học sinh dùng làm tư liệu vẽ tranh!', lefts: ['Tranh thêu tay vẽ từ năm 1850', 'Bài thơ in trong sách tin học 3', 'Ảnh ghi nhãn CC-BY-NC tự do', 'Tệp game bẻ khóa lậu Crack'], rights: ['Sản phẩm thuộc Miền công cộng tự do', 'Sản phẩm bảo hộ bản quyền trích ngắn gọn (Fair Use)', 'Sản phẩm Creative Commons chia sẻ phi lợi nhuận', 'Sản phẩm vi phạm bản quyền nguy hại cần tránh xa'], explanation: 'Tuyệt diệu! Tinh thần đạo đức công dân số rực sáng xuất sắc trong từng quyết đáp của em.' }
    ],
    gap_fills: [
      { questionText: 'Quy tắc vàng cho phép học sinh trích đoạn tác phẩm ngắn để làm báo cáo nghiên cứu học tập lớp học gọi là sử dụng ...', correctAnswer: 'hop ly', explanation: 'Sử dụng hợp lý (Fair Use) nâng niu tinh thần tự do trau dồi hiếu học.' }
    ]
  },
  'lic3-3-14': {
    quizzes: [
      { questionText: 'Danh tính kỹ thuật số (Digital Identity) là gì?', options: ['A. Là chiếc chứng minh thư bằng nhựa đặt cạnh bàn phím', 'B. Toàn bộ thông tin tài khoản, hành vi bình luận, hành tung hoạt động thể hiện sự hiện diện của em trên Internet', 'C. Là số vạch pin màn hình', 'D. Ký tự lập trình game'], correctAnswer: 'B. Toàn bộ thông tin tài khoản, hành vi bình luận, hành tung hoạt động thể hiện sự hiện diện của em trên Internet', explanation: 'Hồ sơ số phản ánh đạo đức học đức và hành vi ứng xử mạng của em.' },
      { questionText: 'Khái niệm Dấu chân kỹ thuật số (Digital Footprint) ám chỉ điều gì?', options: ['A. Dết chân dính bùn đất trên sàn nhà', 'B. Vết vết tích thông tin lưu lại vĩnh viễn không thể xóa nhòa sau mỗi lần em đăng bài, comment, tải nút thích trên mang xã hội', 'C. Một dòng lập trình di vẽ hình gác', 'D. Không có gì cả bừa bãi'], correctAnswer: 'B. Vết vết tích thông tin lưu lại vĩnh viễn không thể xóa nhòa sau mỗi lần em đăng bài, comment, tải nút thích trên mang xã hội', explanation: 'Dấu chân số gom tụ hành trình số, đòi hỏi các em phải bước đi vô cùng cẩn trọng lịch thiệp.' },
      { questionText: 'Thông tin nhận dạng cá nhân PII (Personally Identifiable Information) nào tuyệt đối phải giữ kín che đậy?', options: ['A. Tên chú mèo ngộ nghĩnh nhà hàng xóm', 'B. Số định danh quốc gia căn cước, dấu vân tay, địa chỉ nhà riêng, mật khẩu thẻ và số tài khoản ngân hàng bố mẹ', 'C. Màu áo em thích mặc rèn', 'D. Bài hát thiếu nhi em hay hát'], correctAnswer: 'B. Số định danh quốc gia căn cước, dấu vân tay, địa chỉ nhà riêng, mật khẩu thẻ và số tài khoản ngân hàng bố mẹ', explanation: 'PII bị rò rỉ dẫn lối cho kẻ lừa đảo tống tiền tàn hại tinh thần đời thực, các em nhỏ phải che chắn bảo vệ.' },
      { questionText: 'Biệt danh (pseudonym/alias) lành mạnh giúp em tự vệ thế nào trên mạng mạng?', options: ['A. Để em đi trêu chọc bắt nạt người khác', 'B. Giúp em ẩn danh che chắn danh tính PII thật trước những kẻ lạ mặt có ý đồ xấu rình rập', 'C. Để đạt danh hiệu điểm cao tự phong', 'D. Không có tác dụng gì thực chất'], correctAnswer: 'B. Giúp em ẩn danh che chắn danh tính PII thật trước những kẻ lạ mặt có ý đồ xấu rình rập', explanation: 'Dùng biệt danh trong sáng là chiến thuật thông thái bảo dưỡng cuộc đời số bình yên.' },
      { questionText: 'Hành vi thông minh nhất bảo quản an toàn thông tin cá nhân PII của em khi trò chuyện với người lạ trên mạng?', options: ['A. Khai báo dạt dào mọi thông tin khi họ hỏi thăm nhiệt tình', 'B. Từ chối thẳng thừng chia sẻ địa chỉ, trường lớp hay số điện thoại liên lạc của gia đình dứt khoát', 'C. Chụp ảnh thẻ học sinh gửi tặng họ', 'D. Hẹn họ ra công viên xa vắng nói chuyện'], correctAnswer: 'B. Từ chối thẳng thừng chia sẻ địa chỉ, trường lớp hay số điện thoại liên lạc của gia đình dứt khoát', explanation: 'Đề phòng cực cao trước người lạ giúp em thoát hiểm trước những cái bẫy bắt cóc lừa lọc kín kẽ.' }
    ],
    true_falses: [
      { questionText: 'Dấu chân kỹ thuật số có thể dễ dàng dọn dẹp biến mất hoàn toàn không tì vết như vết phấn viết bảng lớp khi em bấm nút xóa bài.', correctAnswer: 'Sai', explanation: 'Sai! Người khác đã kịp chụp màn hình lưu máy khác hoặc máy chủ Facebook ghi chép bền lâu, dấu vết số tồn dư vĩnh viễn.' },
      { questionText: 'Sử dụng biệt danh (pseudonym) giúp học sinh bảo mật sự an toàn danh tính, nhưng không có nghĩa được phép đi xúc phạm người khác vô học.', correctAnswer: 'Đúng', explanation: 'Chính xác! Ẩn danh là lá chắn che chở bản thân, không phải cây gậy bạo lực hủy hoại hòa khí trực tuyến.' }
    ],
    matchings: [
      { questionText: 'Xác định loại thông tin là PII nhạy cảm hay thông tin công khai an toàn!', lefts: ['Số Thẻ căn cước công dân của mẹ', 'Địa chỉ trường học lớp lớp em học', 'Món ăn yêu thích nhất "kem bơ"', 'Số tài khoản mật khẩu thanh toán ngân hàng'], rights: ['PII nhạy cảm cực cao - CẤM lộ', 'PII nhạy cảm - Không chia sẻ bừa', 'Thông tin chung an toàn vui tươi', 'PII nhạy cảm tối mật - Tuyệt đối giấu kín'], explanation: 'Quá giỏi! Thiết lập lá chắn số thông tuệ bảo bọc em trước trùng khơi nguy biến trực tuyến.' },
      { questionText: 'Xếp nhóm khái niệm an toàn số hóa đúng ranh giới!', lefts: ['Dấu chân kỹ thuật số', 'Biệt danh (pseudonym)', 'Danh tính số di sản', 'Kẻ lạ dụ dỗ chat mạng'], rights: ['Để lại vết tích vĩnh viễn trên xa lộ mạng', 'Tên giả trong lành bảo bọc an toàn PII', 'Hồ sơ nét vẽ phong thái số của cá nhân', 'Mối nguy nan tiềm tàng cần báo cha mẹ gấp'], explanation: 'Cực thông tuệ! Em đã trang bị hoàn hảo khiên chắn bảo an dấn thân vào đời thường số phẳng rộng.' }
    ],
    gap_fills: [
      { questionText: 'Vết tích dữ liệu tồn đọng vĩnh viễn sau mỗi nút thích, dán bình luận trực tuyến gọi là dấu ... kỹ thuật số.', correctAnswer: 'chan', explanation: 'Digital Footprint hay Dấu chân số khuyên bảo em nhỏ nên cư xử đoan chính mộc mạc.' }
    ]
  },
  'lic3-3-15': {
    quizzes: [
      { questionText: 'Khi gặp sự cố cãi cọ, xích mích nảy lửa xảy ra trong phòng chat lớp học, em nên hành động văn minh ra sao?', options: ['A. Gõ phím thô tục trả đòn thật lực mạnh', 'B. Tạm dừng lùi bước ra đi rửa mặt, dừng gõ máy 5 phút tĩnh tâm rồi rời khỏi phòng độc hại báo ngay thầy cô', 'C. Khóc bù lu bù loa', 'D. Rủ cả xóm vào cãi nhau cùng'], correctAnswer: 'B. Tạm dừng lùi bước ra đi rửa mặt, dừng gõ máy 5 phút tĩnh tâm rồi rời khỏi phòng độc hại báo ngay thầy cô', explanation: 'Điềm tĩnh tĩnh lặng là vũ khí tối hậu dập tắt bạo lực bế tắc số.' },
      { questionText: 'Hành vi viết bình luận trêu chọc ác ý, công kích khuyết điểm cơ thể bạn học trực tuyến thuộc nhóm hành vi nào?', options: ['A. Vui đùa hài hước lành mạnh', 'B. Hành vi bắt nạt trực tuyến xấu xí vi phạm đạo đức nghiêm trọng', 'C. Phương pháp học tập đỉnh cao', 'D. Sắp đặt trò chơi lý thú'], correctAnswer: 'B. Hành vi bắt nạt trực tuyến xấu xí vi phạm đạo đức nghiêm trọng', explanation: 'Tôn trọng nhân phẩm của người khác kề cả trên mạng ảo là phẩm cách vàng của học sinh văn minh.' },
      { questionText: 'Các bước khoa học chuẩn xác để chuẩn bị viết một bài nghiên cứu báo cáo Tin học lớp 3 là gì?', options: ['A. Cắm máy gõ ngay không cần nghĩ', 'B. Quyết định chủ đề cụ thể ➡️ Liệt kê nguồn tài nguyên đáng tin cậy ➡️ Lập thời gian biểu triển khai chi tiết', 'C. Nhờ anh chị làm hộ rồi nộp bài', 'D. Lên mạng chôm bài người khác mang về nộp'], correctAnswer: 'B. Quyết định chủ đề cụ thể ➡️ Liệt kê nguồn tài nguyên đáng tin cậy ➡️ Lập thời gian biểu triển khai chi tiết', explanation: 'Định hướng rành mạch tạo bệ đỡ cho bài luận chặt chẽ dạt dào sức thuyết phục khoa học.' },
      { questionText: 'Lập kế hoạch thời gian biểu (schedule) khi triển khai viết tiểu luận giúp em điều gì?', options: ['A. Có thêm thời gian chơi game', 'B. Đảm bảo nộp bài đúng hạn, chia nhỏ tác vụ giảm áp lực mệt mỏi sát giờ', 'C. Tự động viết thay chữ', 'D. Máy tính chạy bớt nóng pin'], correctAnswer: 'B. Đảm bảo nộp bài đúng hạn, chia nhỏ tác vụ giảm áp lực mệt mỏi sát giờ', explanation: 'Kiểm soát tài nguyên thời gian là chìa khóa mở cánh tủ thành công học thuật bền vững.' },
      { questionText: 'Môi trường trò chơi học tập trực tuyến lành mạnh cần được bảo vệ bằng hành động nào của em?', options: ['A. Sử dụng phần mềm lận gian lận điểm số', 'B. Tố cáo chặn ngay những người chơi thốt lời xúc phạm bạn học bừa bãi', 'C. Vào hùa trêu ghẹo bạn cùng lớp', 'D. Chỉ dùng tài khoản mạng giả đi chọc tức bạn'], correctAnswer: 'B. Tố cáo chặn ngay những người chơi thốt lời xúc phạm bạn học bừa bãi', explanation: 'Dũng cảm đứng lên bảo giữ công lý mang lại thế giới số đáng yêu cho tập thể.' }
    ],
    true_falses: [
      { questionText: 'Phát tán những thông tin hư cấu chưa kiểm chứng lên nhóm lớp rêu rao là trò đùa vô hại không có hậu quả gì nguy hại.', correctAnswer: 'Sai', explanation: 'Sai! Tin đồn nhảm nhí phá nát khối đoàn kết, làm hại tinh thần và hạ bệ danh dự bạn học thực tế nghiêm trọng.' },
      { questionText: 'Tìm kiếm tư liệu ở trang Web của các trường đại học (.edu) hay chính phủ (.gov) thường có độ tin cậy tri thức cao.', correctAnswer: 'Đúng', explanation: 'Đúng! Các viện hàn lâm và cơ quan công quyền kiểm duyệt tri thức vô cùng nghiêm ngặt trước khi xuất bản.' }
    ],
    matchings: [
      { questionText: 'Hãy phối hợp hành vi tương ứng với nhãn nhận diện đạo đức mạng!', lefts: ['Viết thư chia sẻ bài học giúp bạn', 'Gõ chữ IN HOA liên tục gào thét', 'Đăng hình ảnh chế giễu bêu xấu bạn', 'Hỏi han lễ phép người lớn tuổi mạng'], rights: ['Hành vi Gắn kết sẻ chia văn minh', 'Hành vi Thiếu lịch thiệp (tương đương hét to)', 'Hành vi Bắt nạt tàn nhẫn vi phạm nội quy', 'Hành vi Đoan chính lịch sự công dân số'], explanation: 'Quá chuẩn xác! Em phân biệt tuyệt vời chuẩn mực hành vi ứng xử rạng ngời công lý.' },
      { questionText: 'Xếp bước nghiên cứu viết văn đúng trình tự khoa học!', lefts: ['Chọn Đề tài hướng đi', 'Lùng tài nguyên bám sát', 'Phác thời gian biểu', 'Bắt tay viết trau chuốt'], rights: ['Bước 1: Giới hạn mục tiêu viết về cái gì', 'Bước 2: Tìm sách thư viện trang web uy tín', 'Bước 3: Chia nhỏ ngày gom dữ liệu tiến độ', 'Bước 4: Trình bày bài văn rực rỡ văn minh'], explanation: 'Cực xuất sắc! Tư duy khoa học nảy mầm rực rỡ sẵn sàng cho những công trình số to lớn sắp tới.' }
    ],
    gap_fills: [
      { questionText: 'Bình tĩnh gạt bỏ cãi vã mạng, rời khỏi phòng trò chuyện xấu xí và kể lại ngay cho cha mẹ hoặc ... chủ nhiệm.', correctAnswer: 'giao vien', explanation: 'Thầy cô luôn dang rộng vòng tay che chở định hướng các em né tránh cạm bẫy mạng.' }
    ]
  },
  'lic3-3-16': {
    quizzes: [
      { questionText: 'Chức năng CC (Carbon Copy) trong hòm thư Email dùng để làm gì?', options: ['A. Gửi thư bí mật tuyệt mật giấu kín danh tính người nhận', 'B. Gửi bản sao bức thư công khai cho người khác cùng theo dõi giám sát thông tin', 'C. Xóa thư nhanh chóng', 'D. Tự động trả lời thư sau mười ngày'], correctAnswer: 'B. Gửi bản sao bức thư công khai cho người khác cùng theo dõi giám sát thông tin', explanation: 'CC tạo sự công khai minh bạch, mọi người nhận thư đều biết bản sao được chuyển tới ai.' },
      { questionText: 'Chức năng BCC (Blind Carbon Copy) trong Email hoạt động ra sao?', options: ['A. CC màu xanh rực rỡ', 'B. Gửi bản sao thư bí mật, những người nhận khác hoàn toàn không thể nhìn thấy địa chỉ email của người nhận BCC này', 'C. Gửi thư chỉ có chữ hoa', 'D. Thư tự động nổ hủy sau khi đọc'], correctAnswer: 'B. Gửi bản sao thư bí mật, những người nhận khác hoàn toàn không thể nhìn thấy địa chỉ email của người nhận BCC này', explanation: 'BCC bảo vệ quyền riêng tư danh tính tối đa cho danh sách nhận tin đông người.' },
      { questionText: 'Khi nào em nên sử dụng nút Reply All thay vì nút Reply đơn thuần?', options: ['A. Khi em muốn gửi thư cho hiệu trưởng duy nhất', 'B. Khi em muốn trả lời phản hồi cho tất cả mọi người có tên trong danh sách nhận gửi thư gốc biết luận điểm của em', 'C. Khi muốn nộp bài tập vẽ', 'D. Khi mạng Internet bị sập'], correctAnswer: 'B. Khi em muốn trả lời phản hồi cho tất cả mọi người có tên trong danh sách nhận gửi thư gốc biết luận điểm của em', explanation: 'Reply All kết nối tập thể thảo luận, nhưng cần sử dụng chừng mực tránh gây nhiễu hòm thư người khác vô ích.' },
      { questionText: 'Chuyển tiếp thư (Forward) là gì?', options: ['A. Xóa vĩnh viễn tệp đính kèm thư', 'B. Chuyển nguyên trạng nội dung hòm thư cũ gửi rộng sang cho một người bạn mới nhận đọc', 'C. Di chuyển tệp tin vào thùng rác', 'D. Báo cáo thư là rác độc hại'], correctAnswer: 'B. Chuyển nguyên trạng nội dung hòm thư cũ gửi rộng sang cho một người bạn mới nhận đọc', explanation: 'Forward sẻ chia tư liệu học tập bổ ích cho bè bạn thực hiện tiện lợi trong vài giây.' },
      { questionText: 'Tác vụ nào giúp em thiết lập mạng lưới truyền thông trực tuyến lành mạnh nhất?', options: ['A. Kết bạn với tất cả tài khoản lạ không rõ nguồn gốc', 'B. Trò chuyện chia sẻ kiến thức trên các nền tảng mạng an toàn được cha mẹ kiểm duyệt tốt, có bạn bè quen thuộc thực tế', 'C. Tung tin nhảm nhí giật gân câu lượt like', 'D. Đăng tải đầy đủ thông tin PII lên tường công khai'], correctAnswer: 'B. Trò chuyện chia sẻ kiến thức trên các nền tảng mạng an toàn được cha mẹ kiểm duyệt tốt, có bạn bè quen thuộc thực tế', explanation: 'Mạng lưới lành mạnh vun đắp đời sống tinh thần số dạt dào năng lượng tích cực học.' }
    ],
    true_falses: [
      { questionText: 'Mối nguy từ BCC là người nhận chính có thể vô căn cứ cho rằng thông điệp chỉ thuộc về riêng mình mà không biết có bản sao bí mật đang giám sát đằng sau.', correctAnswer: 'Đúng', explanation: 'Chính xác! Cần lưu ý tính chất đặc biệt này để ứng xử đạo đức trong truyền thông giao tiếp thư tín.' },
      { questionText: 'Mạng xã hội Instagram chuyên dụng để soạn thảo tính toán các bảng tính số liệu tài chính khô khan phức tạp.', correctAnswer: 'Sai', explanation: 'Sai! Instagram sinh ra tối ưu cho chia sẻ ảnh nghệ thuật rực rỡ và lướt thước phim ngắn giải trí sắc màu.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép thao tác hòm thư điện tử đúng với định nghĩa tác vụ!', lefts: ['Nút Reply phản hồi', 'Nút Reply All diện rộng', 'Tác vụ Forward', 'Hộp thư rác Spam box'], rights: ['Gửi thư phản hồi riêng cho tác giả cũ', 'Phát thông điệp cho cả tập thể kèm bản copy', 'Chuyển tiếp tư liệu sang hòm thư bạn mới', 'Nơi dọn sạch các bức thư quảng cáo nguy hại lừa đảo'], explanation: 'Cực dột phá! Làm chủ công nghệ Email giúp em học tập lớp học vô cùng chuyên nghiệp.' },
      { questionText: 'Nối mạng truyền thông tương ứng với giá trị cốt lõi!', lefts: ['Nave Facebook phổ biến', 'Instagram sắc màu', 'Twitter (X) ngắn gọn', 'Hòm thư Gmail điện tử'], rights: ['Kết nối chia sẻ bài viết hoạt động đời thường quen thuộc', 'Không gian ảnh đẹp nghệ thuật bay bổng', 'Cập nhật tin tức biến động dòng chữ súc tích', 'Giao dịch trao đổi chuẩn học thuật bài bản an toàn'], explanation: 'Quá đỉnh! Biết chọn đúng sân chơi số giúp em gặt hái tài nguyên tri thức cực kì nhanh chóng.' }
    ],
    gap_fills: [
      { questionText: 'Sử dụng chức năng ... trong email giúp em gửi bản sao thư bí mật giấu danh tính người nhận.', correctAnswer: 'bcc', explanation: 'BCC che đậy danh tính an toàn vượt trội đề phòng bão rác điện tử.' }
    ]
  },
  'lic3-3-17': {
    quizzes: [
      { questionText: 'Chính sách sử dụng được chấp nhận AUP (Acceptable Use Policy) trường học quy định điều gì?', options: ['A. Số lượng bữa ăn trưa của học sinh', 'B. Bản khế ước quy định hành vi chuẩn mực, những điều học sinh ĐƯỢC và KHÔNG ĐƯỢC phép làm khi dùng máy tính, mạng Wifi của nhà trường', 'C. Đổi đồng phục học đường', 'D. Chơi bắn súng thoải mái'], correctAnswer: 'B. Bản khế ước quy định hành vi chuẩn mực, những điều học sinh ĐƯỢC và KHÔNG ĐƯỢC phép làm khi dùng máy tính, mạng Wifi của nhà trường', explanation: 'AUP quy chuẩn nề nếp văn minh học đường số, giữ an ninh cho tất cả học viên thực hành.' },
      { questionText: 'Hậu quả nào sau đây dành cho học sinh cố tình vi phạm cam kết AUP nhiều lần?', options: ['A. Được khen tặng huy hiệu Vàng', 'B. Tước quyền sử dụng máy tính, truy cập mạng học tập và chịu hình thức kỷ luật nghiêm khắc từ nhà trường', 'C. Tăng tốc sạc pin điện thoại', 'D. Được miễn làm bài tập tin'], correctAnswer: 'B. Tước quyền sử dụng máy tính, truy cập mạng học tập và chịu hình thức kỷ luật nghiêm khắc từ nhà trường', explanation: 'Kỷ luật Thép gìn giữ hòa bình, ngăn chặn phá hoại máy móc tài sản lớp thực hành chung.' },
      { questionText: 'Ngôn từ bao hàm (Inclusive Language) đem lại giá trị nào khi giao tiếp trực tuyến trực tuyến?', options: ['A. Từ ngữ dùng để trêu chọc bêu xấu người yếu thế', 'B. Cách dùng từ ngữ tôn trọng, công bằng, không phân biệt đối xử vùng miền, giới tính hay hoàn cảnh bạn bè', 'C. Từ ngữ gào thét viết in hoa', 'D. Các ký hiệu viết mật mã bí ẩn'], correctAnswer: 'B. Cách dùng từ ngữ tôn trọng, công bằng, không phân biệt đối xử vùng miền, giới tính hay hoàn cảnh bạn bè', explanation: 'Tôn trọng bạn học qua đại từ trung tính dệt khôi liên kết lớp học luôn ấm lòng.' },
      { questionText: 'Giới hạn độ tuổi tự lập tài khoản mạng xã hội Facebook theo quy định là bao nhiêu?', options: ['A. Từ 5 tuổi trở lên', 'B. Từ 13 tuổi trở lên', 'C. Chỉ cho phép các cụ già 80 tuổi', 'D. Cho phép trẻ sơ sinh'], correctAnswer: 'B. Từ 13 tuổi trở lên', explanation: 'Dưới 13 tuổi bộ não và tâm sinh lý của em chưa hoàn thiện để tự vệ trước dông bão mạng, cần cha mẹ đồng hành.' },
      { questionText: 'Khi tham gia diễn đàn mạng học tập, việc sử dụng từ ngữ thô tục bừa bãi sẽ bị xử lý thế nào?', options: ['A. Được tuyên dương đứng đầu danh sách lớp', 'B. Bị bộ lọc chặn bài viết vi phạm, khóa tài khoản viễn viễn và hạ điểm nề nếp thi đua', 'C. Được tặng máy tính mới tinh', 'D. Thiết bị tự động bật loa'], correctAnswer: 'B. Bị bộ lọc chặn bài viết vi phạm, khóa tài khoản viễn viễn và hạ điểm nề nếp thi đua', explanation: 'Lọc nhiễu lăng mạ bẩn bẩn giữ không gian số lớp học tôn kính thanh cao.' }
    ],
    true_falses: [
      { questionText: 'Inclusive language hướng học sinh tới việc loại bỏ các đại từ xưng hô xúc d phạm, mang dã tâm gièm pha hoàn cảnh của bè bạn.', correctAnswer: 'Đúng', explanation: 'Chính xác! Lời nói nhã nhặn dệt nên một cộng đồng số đáng trân quý kết nối yêu thương.' },
      { questionText: 'Mạng xã hội việc làm LinkedIn cho phép mọi em bé từ 5 tuổi đăng ký tạo hồ sơ để xin việc gặt hái kiếm tiền tự do.', correctAnswer: 'Sai', explanation: 'Sai! LinkedIn quy định khắt khe giới hạn tuổi từ 16 tuổi trở lên mới phù hợp điều kiện bắt đầu xây dựng hồ sơ chuyên nghiệp đầu đời.' }
    ],
    matchings: [
      { questionText: 'Nối khái niệm chính sách đúng với quy chuẩn tương đồng đời thực!', lefts: ['Chính sách AUP trường', 'Inclusive Language tôn trọng', 'Quy chế tuổi Facebook >=13', 'Xâm hại bẻ khóa mạng trường'], rights: ['Nội quy ứng xử thực hành lớp học số hóa', 'Lời nói lễ phép ôn hòa không phân biệt', 'Quy chuẩn bảo vệ tâm lý trẻ em chưa thành niên', 'Hành vi vi phạm pháp luật học đường nghiêm trọng'], explanation: 'Cực xuất sắc! Tinh thần thấm nhuần nội quy biến em thành thủ lĩnh nề nếp gương mẫu số.' },
      { questionText: 'Phối trộn hành vi tương thích với dòng trạng thái Luật AUP!', lefts: ['Được phép làm AUP', 'Cấm làm AUP trường', 'Yêu cầu hành động AUP', 'Hình phạt vi phạm AUP khắt khe'], rights: ['Mở trang web toán học cô giáo chỉ định làm bài', 'Tự ý tải game bắn súng bạo lực cài đè lên máy', 'Bảo quản phím chuột nhẹ tay giữ vệ sinh chung', 'Bị đình chỉ học thực hành Tin học chuyển học viết giấy'], explanation: 'Quá siêu! Ý thức kỷ luật tự giác chính là bệ phóng cho nhân cách vàng rạng ngời mai sau.' }
    ],
    gap_fills: [
      { questionText: 'Bản cam kết văn bản quy định rõ điều học sinh được và không được làm khi dùng mạng trường học gọi tắt là ...', correctAnswer: 'aup', explanation: 'Tuân thủ nghiêm túc AUP (Acceptable Use Policy) bảo an an bình học đường số.' }
    ]
  },
  'lic3-3-18': {
    quizzes: [
      { questionText: 'Cyberbullying hay Nạn bắt nạt qua mạng ám chỉ loạt hành vi nhức nhối nào?', options: ['A. Việc các bạn nhỏ rủ nhau học nhóm hăng say thi đua điểm mười', 'B. Việc sỉ nhục, chửi bới, đe dọa, tung hình ảnh bôi xấu bạn học qua điện thoại, mạng xã hội dã tâm làm tổn hại tinh thần', 'C. Thiết kế robot dọn rác', 'D. Nút tăng tốc Wifi'], correctAnswer: 'B. Việc sỉ nhục, chửi bới, đe dọa, tung hình ảnh bôi xấu bạn học qua điện thoại, mạng xã hội dã tâm làm tổn hại tinh thần', explanation: 'Cyberbullying để lại vết thương đau đớn dữ dội trong ký ức bé thơ của nạn nhân, cần bị bài trừ tẩy chay triệt để.' },
      { questionText: 'Khi em phát hiện một nick lạ đang tung tin xuyên tạc đe dọa bôi nhọ em trên lớp mạng, hành động tự vệ thông thái nhất là?', options: ['A. Im lặng chịu đựng khóc lóc tủi hổ héo hon', 'B. Chụp màn hình gom sạch bằng chứng, bấm nút Block chặn nick xấu xí, lập tức tâm sự trò chuyện hỏi ý kiến cha mẹ cha mẹ hoặc thầy cô giáo', 'C. Gõ thư chửi bới dọa nạt trả bạo lực lại gấp đôi', 'D. Bỏ học đi lang thang'], correctAnswer: 'B. Chụp màn hình gom sạch bằng chứng, bấm nút Block chặn nick xấu xí, lập tức tâm sự trò chuyện hỏi ý kiến cha mẹ cha mẹ hoặc thầy cô giáo', explanation: 'Gom chứng cứ và tựa vai người lớn giúp em hạ bạt thế lực xấu xa cô lập chúng trong tích tắc.' },
      { questionText: 'Tại sao việc chụp ảnh màn hình lưu bằng chứng bắt nạt (cyberbullying evidence) lại vô cùng quan trọng?', options: ['A. Để đăng lên Facebook khoe khang', 'B. Để làm vật chứng pháp lý chính xác giúp thầy cô ban giám hiệu và bố mẹ can thiệp xử lý kẻ bắt nạt trốn tội', 'C. Để gửi cho bạn bè cùng cười', 'D. Không có giá trị gì cả'], correctAnswer: 'B. Để làm vật chứng pháp lý chính xác giúp thầy cô ban giám hiệu và bố mẹ can thiệp xử lý kẻ bắt nạt trốn tội', explanation: 'Kẻ bắt nạt số thường chối tội bằng cách thu hồi hoặc xóa bỏ bình luận bẩn, hình ảnh bằng chứng lưu máy của em đập tan sự xảo quyệt đó.' },
      { questionText: 'Lớp học số hóa có nội quy nghiêm khắc phòng chống cyberbullying nhằm mục tiêu gì?', options: ['A. Bắt học sinh chép phạt một nghìn lần', 'B. Gìn giữ danh dự nhân phẩm, bảo an không gian tâm lý mượt mà và an toàn hạnh phúc tuyệt đối cho từng em nhỏ học tập', 'C. Làm hỏng máy tính', 'D. Lăng xê thương hiệu trường học'], correctAnswer: 'B. Gìn giữ danh dự nhân phẩm, bảo an không gian tâm lý mượt mượt và an toàn hạnh phúc tuyệt đối cho từng em nhỏ học tập', explanation: 'Bảo hộ sự an lành tâm hồn con trẻ là tôn chỉ vàng xây trường học hạnh phúc.' },
      { questionText: 'Hành động nào của học sinh thể hiện tính đồng cảm sưởi ấm tâm hồn bạn học bị bắt nạt mạng?', options: ['A. Tỏ thái độ phớt lờ, hùa theo nút like chế giễu', 'B. Ngồi cạnh sẻ chia lời động viên chân thành, cùng bạn đi gặp thầy cô báo cáo bảo vệ công lý dũng cảm', 'C. Đi kể xấu bạn khắp nơi', 'D. Nhắn tin mỉa mai khuyên răn thô tục'], correctAnswer: 'B. Ngồi cạnh sẻ chia lời động viên chân thành, cùng bạn đi gặp thầy cô báo cáo bảo vệ công lý dũng cảm', explanation: 'Tình bạn cao quý dũng khí đồng cảm thắp sáng bóng đêm số, sưởi ấm trái tim bị tổn thương.' }
    ],
    true_falses: [
      { questionText: 'Cyberbullying chỉ xảy ra ngoài đời thực, hoàn toàn không thể xuất hiện trong hòm thư hay các ứng dụng trò chơi trực tuyến.', correctAnswer: 'Sai', explanation: 'Sai! Bạo lực mồm có thể nổ ra ở bất kỳ ngóc ngách kĩ thuật số nào có khe hở cho gõ bình luận dán ảnh.' },
      { questionText: 'Tuyệt đối không bao giờ được trả đòn bằng bạo lực ngôn từ tương ứng dằn mặt kẻ bắt nạt mạng vì thế chỉ đẩy mâu thuẫn lún sâu nguy nan.', correctAnswer: 'Đúng', explanation: 'Chính xác! Lấy oán báo oán oán oán chập chùng, dùng trí tuệ văn minh cô lập và trừng phạt kẻ xấu bằng luật pháp nhà trường.' }
    ],
    matchings: [
      { questionText: 'Xếp đặt trình tự các biện pháp giải quyết bắt nạt mạng thông thái!', lefts: ['Chụp ảnh màn hình lưu làm chứng', 'Nhấp Block chặn nick vĩnh viễn', 'Tâm sự kể rõ ngọn nguồn', 'Nhà trường mời cha mẹ kẻ xấu làm việc'], rights: ['Bước 1: Giữ kín biên lai chứng cứ không cho tẩu tán', 'Bước 2: Cắt đứt luồng tin rác rưởi lăng mạ', 'Bước 3: Tựa lưng vào thầy cô cha mẹ tin cẩn bảo vệ', 'Bước 4: Trừng phạt kỷ luật răn đe giáo dục đạo nghĩa'], explanation: 'Cực kỳ tinh minh dũng nghị! Em sở hữu tư duy của một luật sư nhí anh dũng.' },
      { questionText: 'Nối từ khóa bạo lực mạng với phân cấp ảnh hưởng tinh thần!', lefts: ['Nhắn tin sỉ nhục chế giễu liên tục', 'Đọc được lời trừng trị răn đe của thầy', 'Được bạn kề vai sẻ chia cái ôm', 'Phát tán thông tin bí mật PII của bạn'], rights: ['Khủng hoảng tinh thần sợ hãi tột đỉnh bóng tối', 'Niềm tin công lý vỡ òa phấn chấn rạng rỡ', 'Xoa dịu nỗi đau nứt nẻ sưởi ấm lòng tin', 'Vi phạm pháp luật hình sự xâm phạm đời tư sâu nghiêm'], explanation: 'Xuất sắc dạt dào! Sự phân tích rạch ròi lý tính giúp em có lá chắn tâm hồn sừng sững trực tuyến.' }
    ],
    gap_fills: [
      { questionText: 'Hành vi sử dụng công cụ mạng xã hội nhằm làm hại tinh thần, lăng mạ sỉ nhục bạn học gọi là bắt nạt ...', correctAnswer: 'qua mang', explanation: 'Báo động dẹp trừ vĩnh viễn bạo lực trực tuyến (Cyberbullying) gìn giữ trường lớp hạnh phúc.' }
    ]
  },
  'l3-1': {
    keywords: ['Thông tin', 'quyết định', 'đèn đỏ', 'giác quan', 'mắt', 'tai', 'bộ não'],
    quizzes: [
      { questionText: 'Khi đi trên đường, em thấy đèn tín hiệu giao thông màu ĐỎ sáng lên. Thông tin này giúp em đưa ra quyết định gì?', options: ['A. Tiếp tục chạy xe thật nhanh qua ngã tư', 'B. Dừng lại an toàn trước vạch quy định', 'C. Nhắm mắt lại và đi tiếp', 'D. Rẽ trái sang làn đối diện luôn'], correctAnswer: 'B. Dừng lại an toàn trước vạch quy định', explanation: 'Đèn đỏ báo hiệu lệnh dừng lại để đảm bảo an toàn giao thông cho bản thân và mọi người.' },
      { questionText: 'Nghe tiếng trống trường reo giòn giã "Tùng! Tùng! Tùng!", thông tin đó báo hiệu điều gì cho em đưa ra quyết định?', options: ['A. Đến giờ ăn cơm trưa ở nhà', 'B. Đến giờ ra chơi hoặc giờ vào lớp học', 'C. Sắp sửa có cơn mưa lớn', 'D. Trường học được nghỉ cả tuần'], correctAnswer: 'B. Đến giờ ra chơi hoặc giờ vào lớp học', explanation: 'Tiếng trống trường là tín hiệu âm thanh báo hiệu thời gian ra chơi hoặc vào lớp học để học sinh ổn định vị trí.' },
      { questionText: 'Quan sát thấy bầu trời đầy mây đen sầm, gió thổi mạnh. Đây là thông tin giúp em quyết định hành động nào?', options: ['A. Mang theo ô hoặc áo mưa khi ra ngoài', 'B. Mặc thêm áo len thật dày', 'C. Đi ra bến bãi tắm biển', 'D. Tưới nước thêm cho cây ngoài vườn'], correctAnswer: 'A. Mang theo ô hoặc áo mưa khi ra ngoài', explanation: 'Bầu trời nhiều mây đen và gió mạnh báo hiệu có thể sắp mưa to, em cần mang ô hoặc áo mưa để không bị ướt.' },
      { questionText: 'Mẹ nấu ăn thơm lừng từ bếp bay ra phòng khách. Giác quan nào đã giúp em nhận biết thông tin món ăn ngon?', options: ['A. Thị giác (mắt nhìn)', 'B. Khứu giác (mũi ngửi mùi)', 'C. Vị giác (lưỡi nếm)', 'D. Thính giác (tai nghe)'], correctAnswer: 'B. Khứu giác (mũi ngửi mùi)', explanation: 'Mũi ngửi mùi giúp chúng ta nhận biết thông tin về mùi hương xung quanh như mùi thơm của thức ăn ngon.' },
      { questionText: 'Trước khi đưa ra một quyết định hành động nào đó trong cuộc sống, em cần làm gì trước?', options: ['A. Nhờ người khác làm thay hoàn toàn', 'B. Thu thập và xem xét thông tin liên quan', 'C. Nhắm mắt lại quyết định bừa theo linh tính', 'D. Bỏ qua không cần quan tâm điều gì'], correctAnswer: 'B. Thu thập và xem xét thông tin liên quan', explanation: 'Thu thập thông tin đầy đủ, chính xác giúp chúng ta suy nghĩ thấu đáo và đưa ra quyết định đúng đắn nhất.' },
      { questionText: 'Em dùng bộ phận nào để suy nghĩ, liên kết thông tin và đưa ra quyết định?', options: ['A. Đôi bàn tay', 'B. Bộ não của em', 'C. Trái tim', 'D. Đôi bàn chân di chuyển'], correctAnswer: 'B. Bộ não của em', explanation: 'Não bộ là trung tâm chỉ huy xử lý thông tin nhận từ các giác quan và đưa ra phản xạ hành động quyết định.' },
      { questionText: 'Giác quan nào giúp em đọc được các dòng chữ trong cuốn sách giáo khoa Tin học 3?', options: ['A. Thị giác (mắt quan sát)', 'B. Thính giác (tai nghe tiếng)', 'C. Vị giác (lưỡi nếm ngọt)', 'D. Xúc giác (da cảm nhận)'], correctAnswer: 'A. Thị giác (mắt quan sát)', explanation: 'Mắt giúp nhận biết thông tin dạng văn bản và hình ảnh rực rỡ màu sắc.' },
      { questionText: 'Nghe tiếng còi báo cháy kêu liên tục vang dội cứu hộ khẩn cấp, em nên quyết định thế nào?', options: ['A. Đứng lại tò mò xem xảy ra chuyện gì', 'B. Di chuyển nhanh chóng, an toàn thoát hiểm theo lối thoát hiểm', 'C. Bật nhạc to hơn để khỏi nghe tiếng ồn', 'D. Đi ngủ tiếp'], correctAnswer: 'B. Di chuyển nhanh chóng, an toàn thoát hiểm theo lối thoát hiểm', explanation: 'Tiếng còi cứu hỏa báo động khuyển cáo có hỏa hoạn nguy hiểm, cần sơ tán nhanh thoát hiểm an toàn.' },
      { questionText: 'Để đưa ra quyết định chính xác và sáng suốt nhất, nguồn thông tin chúng ta chọn lọc cần có tính chất gì?', options: ['A. Hoàn toàn mơ hồ không rõ nguồn gốc', 'B. Có độ tin cậy cao, đầy đủ và chuẩn xác', 'C. Do người lạ gửi liên kết lạ trên mạng', 'D. Thông tin đồn thổi thiếu kiểm chứng'], correctAnswer: 'B. Có độ tin cậy cao, đầy đủ và chuẩn xác', explanation: 'Thông tin từ nguồn đáng tin cậy giúp tránh sai sót và đưa ra lựa chọn sáng suốt nhất.' },
      { questionText: 'Giác quan nào giúp em nhận biết mặt nước trong hồ bơi rất mát lạnh khi đặt chân xuống?', options: ['A. Thính giác (tai nghe tiếng)', 'B. Xúc giác (da bàn chân)', 'C. Khứu giác (mũi ngửi mùi)', 'D. Vị giác (lưỡi nếm vị)'], correctAnswer: 'B. Xúc giác (da bàn chân)', explanation: 'Da (xúc giác) giúp nhận biết cảm giác sờ chạm nóng hay lạnh, thô ráp hay mịn màng.' },
      { questionText: 'Khi thấy biển báo giao thông có hình người đi bộ màu xanh sáng lên tại vạch qua đường, thông tin này báo hiệu điều gì?', options: ['A. Người đi bộ phải đứng yên trên vỉa hè', 'B. Người đi bộ được phép di chuyển qua đường an toàn', 'C. Các phương tiện cơ giới được chạy thật nhanh', 'D. Cần tránh xa vạch kẻ đường gấp'], correctAnswer: 'B. Người đi bộ được phép di chuyển qua đường an toàn', explanation: 'Đèn xanh đi bộ báo hiệu cho phép đi bộ tiến qua đường trên khu vực quy định an toàn.' },
      { questionText: 'Đọc thời khóa biểu thấy ngày mai có tiết Tin học, thông tin này giúp em đưa ra quyết định gì?', options: ['A. Chuẩn bị sách Tin học 3 xếp vào balô để đi học', 'B. Không chuẩn bị gì và đi ngủ', 'C. Chuẩn bị đồ dùng bơi lội', 'D. Nghỉ học ở nhà đi chơi'], correctAnswer: 'A. Chuẩn bị sách Tin học 3 xếp vào balô để đi học', explanation: 'Thời khóa biểu cung cấp thông tin lịch học giúp em chủ động chuẩn bị sách vở gọn gàng đúng môn học.' },
      { questionText: 'Khi nếm một quả chanh, lưỡi em thấy rất chua. Vị chua này là thông tin nhận được qua giác quan nào?', options: ['A. Khứu giác', 'B. Vị giác', 'C. Thính giác', 'D. Thị giác'], correctAnswer: 'B. Vị giác', explanation: 'Lưỡi (vị giác) giúp nhận biết các mùi vị của thức ăn như ngọt, mặn, chua, cay, đắng.' },
      { questionText: 'Nếu em thu thập thông tin sai lệch từ nguồn không tin cậy thì sẽ dẫn đến điều gì?', options: ['A. Quyết định đúng đắn hơn', 'B. Quyết định dễ sai lầm, không phù hợp', 'C. Đạt điểm số cao hơn trong bài học', 'D. Khởi động máy nhanh hơn'], correctAnswer: 'B. Quyết định dễ sai lầm, không phù hợp', explanation: 'Nguồn thông tin không tin cậy dễ khiến bộ não xử lý sai hướng, chọn lựa không đúng hành động cần làm.' },
      { questionText: 'Trong các tình huống sau, việc thu nhận thông tin nào giúp cứu mạng sống và tài sản của gia đình?', options: ['A. Nghe tiếng chim hót líu lo buổi sáng', 'B. Phát hiện mùi khét và khói bay lên từ bếp ga chưa tắt', 'C. Nhìn thấy chú mèo nhảy qua bờ tường', 'D. Nghe nhạc thiếu nhi vui nhộn'], correctAnswer: 'B. Phát hiện mùi khét và khói bay lên từ bếp ga chưa tắt', explanation: 'Phát hiện khói khét báo hiệu rò rỉ khí ga hoặc hỏa hoạn khẩn cấp, giúp gia đình phát hiện kịp thời để dập tắt hoặc sơ tán.' }
    ],
    true_falses: [
      { questionText: 'Mọi thông tin chúng ta nghe thấy từ người lạ trên Internet đều là thông tin đáng tin cậy cần thực hiện theo ngay lập tức.', correctAnswer: 'Sai', explanation: 'Thông tin trên internet từ người lạ có thể sai sự thật, lừa đảo, cần hỏi thầy cô và cha mẹ để kiểm chứng.' },
      { questionText: 'Não bộ xử lý thông tin càng đầy đủ và chính xác thì quyết định đưa ra càng đúng đắn và an toàn.', correctAnswer: 'Đúng', explanation: 'Chuẩn xác! Thông tin đáng tin cậy chính là bệ đỡ cho mỗi quyết định thông thái.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép giác quan tương ứng với chức năng thu nhận thông tin chính xác nhất của chúng!', lefts: ['Mắt (Thị giác)', 'Tai (Thính giác)', 'Lưỡi (Vị giác)', 'Mũi (Khứu giác)'], rights: ['Nhận biết hình dáng, màu sắc rực rỡ của biển bảo', 'Lắng nghe âm thanh còi xe và trống trường rộn rã', 'Nhận biết vị chua ngọt của đồ ăn hoa quả', 'Thu nhận mùi hương thơm nồng của đóa hoa hồng'], explanation: 'Cực tốt! Mắt xem hình ảnh, tai nghe âm thanh, lưỡi nếm mùi vị, mũi ngửi mùi hương thơm dạt dào!' },
      { questionText: 'Hãy ghép các thông tin thụ nhận với quyết định phù hợp nhất!', lefts: ['Đèn tín hiệu đỏ cho người đi bộ', 'Đọc sách biết ngày mai có bài kiểm tra', 'Nghe bố mẹ gọi xuống ăn cơm', 'Cảm nhận tay chạm vào cốc nước nóng'], rights: ['Đứng yên trên vỉa hè chờ đèn chuyển xanh', 'Tập trung ôn tập bài và chuẩn bị bút thước đầy đủ', 'Rửa tay thật sạch sẽ và bước vào bàn ăn', 'Mở tay ra ngay tránh bị bỏng nhiệt độ cao'], explanation: 'Quá giỏi! Em đã biết ra quyết định cực kỳ khôn ngoan và bảo vệ bản thân rồi!' }
    ],
    gap_fills: [
      { questionText: 'Bộ ... là trung tâm chỉ huy tiếp nhận thông tin từ các giác quan và đưa ra quyết định hành động ở con người.', correctAnswer: 'não', explanation: 'Bộ não chính là nơi ghi nhận thông tin, suy nghĩ, so sánh để giúp con người hành động sáng suốt nhất.' }
    ]
  },
  'l3-2': {
    keywords: ['Xử lý thông tin', 'bộ vi xử lý', 'não bộ', 'thu thập', 'máy tính'],
    quizzes: [
      { questionText: 'Hành động nào dưới đây là một hoạt động xử lý thông tin thường gặp của bộ não con người?', options: ['A. Ngủ mê mệt không biết gì xung quanh', 'B. Đọc đề toán, suy nghĩ tính toán và viết ra kết quả đúng', 'C. Đi loạng choạng nhắm mắt trên đường', 'D. Nháy chuột liên tục không mục đích'], correctAnswer: 'B. Đọc đề toán, suy nghĩ tính toán và viết ra kết quả đúng', explanation: 'Xử lý thông tin bao gồm tính toán, sắp xếp, suy nghĩ để tạo ra kết quả hữu ích cho con người học tập.' },
      { questionText: 'Máy tính xử lý thông tin bằng bộ phận quan trọng nào nằm bên trong thân máy tính để bàn?', options: ['A. Màn hình rực rỡ', 'B. Bộ phận xử lý (bộ vi xử lý - CPU)', 'C. Chuột quang điều trỏ', 'D. Dây cáp điện kết nguồn'], correctAnswer: 'B. Bộ phận xử lý (bộ vi xử lý - CPU)', explanation: 'Bộ vi xử lý ở thân máy chính là cơ quan đầu não tiếp nhận lệnh, tính toán xử lý dữ liệu số hóa của máy tính.' },
      { questionText: 'Có mấy bước cơ bản trong quá trình xử lý thông tin của một máy tính hay não bộ con người?', options: ['A. 2 bước', 'B. 4 bước: Thu nhận, xử lý, lưu trữ, truyền', 'C. 1 bước duy nhất', 'D. 10 bước phức tạp'], correctAnswer: 'B. 4 bước: Thu nhận, xử lý, lưu trữ, truyền', explanation: 'Quy trình gồm: Thu nhận thông tin ➡️ Xử lý thông tin ➡️ Lưu trữ thông tin ➡️ Truyền thông tin ra bên ngoài!' },
      { questionText: 'Hành động nào mô tả bước THU NHẬN thông tin của học sinh khi học bài trực tuyến trên lớp?', options: ['A. Nhìn màn hình bài giảng và lắng nghe thầy cô giảng bài', 'B. Hoàn thành ghi bài ra vở nháp', 'C. Đóng máy tính đi chơi đá bóng', 'D. Ngồi mơ mộng nhìn ra cửa sổ'], correctAnswer: 'A. Nhìn màn hình bài giảng và lắng nghe thầy cô giảng bài', explanation: 'Lắng nghe nhìn bài giảng bằng giác quan (Mắt, Tai) chính là thu nhận thông tin đầu vào.' },
      { questionText: 'Khi em thực hiện phép tính cộng "25 + 50 = 75" trong đầu, bước "suy nghĩ cộng nhẩm hàng đơn vị và hàng chục" là bộ não đang thực hiện hoạt động gì?', options: ['A. Thu nhận thông tin thô', 'B. Xử lý thông tin', 'C. Truyền thông tin cho bạn bè', 'D. Xóa dữ liệu cũ'], correctAnswer: 'B. Xử lý thông tin', explanation: 'Suy nghĩ, thực hiện logic tính toán chính là hoạt động xử lý thông tin để đi tìm kết quả mới.' },
      { questionText: 'Hành động em viết câu trả lời toán học ra giấy kiểm tra hay phát biểu to dõng dạc trước lớp thuộc bước nào?', options: ['A. Thu thập thông tin từ bên ngoài', 'B. Lưu trữ trong ký ức ẩn', 'C. Truyền (xuất) thông tin', 'D. Quên thông tin'], correctAnswer: 'C. Truyền (xuất) thông tin', explanation: 'Viết ra giấy học phát biểu chính là truyền đạt thông tin sau xử lý ra thế giới để người khác tiếp nhận.' },
      { questionText: 'Tại sao máy tính trợ giúp con người rất hiệu quả trong xử lý thông tin?', options: ['A. Vì máy tính biết nhảy múa thể thao', 'B. Vì máy tính xử lý cực kỳ nhanh, dung lượng lưu trữ siêu lớn và độ chính xác tuyệt đối', 'C. Máy tính có cảm xúc vui vẻ', 'D. Máy tính biết tự nấu cơm'], correctAnswer: 'B. Vì máy tính xử lý cực kỳ nhanh, dung lượng lưu trữ siêu lớn và độ chính xác tuyệt đối', explanation: 'Khả năng tính toán hàng tỷ phép tính mỗi giây không mệt mỏi và lưu trữ khổng lồ giúp máy tính là bạn đồng hành đắc lực của nhân loại.' },
      { questionText: 'Ở máy tính để bàn, bộ phận nào có nhiệm vụ THU NHẬN dữ liệu văn bản do người dùng gõ vào?', options: ['A. Loa máy tính', 'B. Bàn phím máy tính', 'C. Màn hình LCD', 'D. Máy in văn bản'], correctAnswer: 'B. Bàn phím máy tính', explanation: 'Bàn phím và chuột là các thiết bị thu nhận thông tin (đầu vào) giúp người dùng giao tiếp ra lệnh cho máy tính.' },
      { questionText: 'Thiết bị nào của máy tính có nhiệm vụ TRUYỀN (XUẤT) thông tin hình ảnh bài học cho em học sinh nhìn bằng mắt?', options: ['A. Thân máy bằng sắt', 'B. Bàn phím cơ', 'C. Màn hình máy tính', 'D. Chuột đệm tay cao su'], correctAnswer: 'C. Màn hình máy tính', explanation: 'Màn hình hiển thị chữ viết và tranh ảnh rực rỡ, đóng vai trò là thiết bị xuất để truyền thông tin hiển thị cho con người.' },
      { questionText: 'Trong buổi dã ngoại, em ghi chép lại số lượng thú quý hiếm nhìn thấy vào sổ tay nhỏ. Cuốn sổ tay nhỏ đóng vai trò gì?', options: ['A. Xử lý logic nhạy bén', 'B. Lưu trữ thông tin', 'C. Thu nhận qua da chân', 'D. Thiết bị sạc nguồn điện'], correctAnswer: 'B. Lưu trữ thông tin', explanation: 'Viết thông tin vào giấy, vở hay ổ đĩa máy tính giúp thông tin được lưu trữ bền lâu để xem lại khi cần thiết.' },
      { questionText: 'Não bộ của con người ghi nhớ kiến thức học tập buổi sáng trong trí nhớ lâu dài. Bước này tương ứng với máy tính làm gì?', options: ['A. Xóa tệp vĩnh viễn', 'B. Đổi mật khẩu wifi', 'C. Lưu trữ dữ liệu vào bộ nhớ (ổ đĩa)', 'D. Tắt nút nguồn máy tính'], correctAnswer: 'C. Lưu trữ dữ liệu vào bộ nhớ (ổ đĩa)', explanation: 'Ghi nhớ kiến thức ở não bộ tương đương với thao tác lưu trữ tệp tin vào ổ đĩa của máy tính.' },
      { questionText: 'Điều gì xảy ra nếu thiết bị xử lý CPU của máy tính bị hỏng hoặc mất nguồn điện cấp?', options: ['A. Máy tính hoạt động nhanh gấp đôi', 'B. Máy tính không thể xử lý dữ liệu và không hoạt động được', 'C. Màn hình vẫn tự vẽ tranh được', 'D. Bàn phím tự gõ chữ'], correctAnswer: 'B. Máy tính không thể xử lý dữ liệu và không hoạt động được', explanation: 'Thiết bị xử lý hỏng khiến toàn bộ hệ thống máy tính tê liệt, không thể xử lý bất kỳ tín hiệu nào.' },
      { questionText: 'Trong lớp học vẽ, cô giáo hướng dẫn vẽ tranh bằng lời nói. Em nghe thấy và ghi nhớ trong đầu. Trình tự đúng là:', options: ['A. Xử lý -> Thu nhận -> Xuất kết quả', 'B. Thu nhận (Tai nghe) -> Xử lý, Lưu trữ (Não suy nghĩ, ghi nhớ) -> Truyền tin (Vẽ nét tranh ra giấy)', 'C. Quên ngay lập tức -> Không vẽ gì cả', 'D. Vẽ lung tung không nghe'], correctAnswer: 'B. Thu nhận (Tai nghe) -> Xử lý, Lưu trữ (Não suy nghĩ, ghi nhớ) -> Truyền tin (Vẽ nét tranh ra giấy)', explanation: 'Đọc kĩ tiến trình: Tiếp nhận kích thích ➡️ Bộ não ghi nhận xử lý ➡️ Ra lệnh cho các ngón tay vẽ từng nét đẹp xinh.' },
      { questionText: 'Để so sánh chiều cao của các học sinh trong lớp để tìm ra bạn cao nhất, ta nên xử lý thông tin bằng phương pháp nào?', options: ['A. Đo chiều cao từng bạn, lập bảng số liệu và vẽ biểu đồ cột so sánh', 'B. Nhìn bừa góc lớp rồi đoán đại', 'C. Đo chiều dài cái bút chì', 'D. Hỏi thời khóa biểu ngày mai'], correctAnswer: 'A. Đo chiều cao từng bạn, lập bảng số liệu và vẽ biểu đồ cột so sánh', explanation: 'Phương pháp lập bảng và vẽ biểu đồ cột giúp thông tin chiều cao trực quan, dễ so sánh chính xác tuyệt đối.' },
      { questionText: 'Xử lý thông tin tốt giúp con người đạt được điều nào dưới đây?', options: ['A. Làm tăng nhanh tiếng ồn lớp học', 'B. Đưa ra các quyết định sáng suốt mang lại lợi ích cao cho học tập, đời sống', 'C. Làm cho máy tính nhanh bị hết điện pin', 'D. Làm quên đi bài giảng cũ'], correctAnswer: 'B. Đưa ra các quyết định sáng suốt mang lại lợi ích cao cho học tập, đời sống', explanation: 'Mục tiêu tối thượng của việc xử lý thông tin là chắt lọc tri thức cốt lõi hữu dụng giúp ích tốt nhất cho hành động.' }
    ],
    true_falses: [
      { questionText: 'Chỉ có máy tính thông minh mới cần xử lý thông tin, còn bộ não con người không làm hoạt động xử lý thông tin này.', correctAnswer: 'Sai', explanation: 'Sai hoàn toàn! Con người liên tục xử lý lượng thông tin khổng lồ mỗi giây bằng bộ não siêu việt một cách tự nhiên.' },
      { questionText: 'Máy tính có thể giúp con người tính toán nhanh hàng triệu phép tính trong thời gian siêu ngắn với kết quả chính xác cao.', correctAnswer: 'Đúng', explanation: 'Chính xác! Máy tính là công cụ tuyệt vời nhất do loài người phát minh để nhân bội sức mạnh tính toán xử lý dữ liệu.' }
    ],
    matchings: [
      { questionText: 'Hãy nối các hoạt động tin học tương ứng với vai trò của chúng trong tiến trình xử lý thông tin máy tính nhé!', lefts: ['Sử dụng Bàn phím nhập câu lệnh', 'Bộ xử lý CPU tính toán dữ liệu', 'Ổ cứng lưu trữ tệp văn bản', 'Màn hình hiển thị hình ảnh phim ảnh'], rights: ['Thiết bị thu nhận (đầu vào)', 'Hệ thống thiết bị xử lý trung tâm', 'Bộ phận thực hiện lưu trữ dữ liệu', 'Thiết bị truyền (suất thông tin đầu ra)'], explanation: 'Quá chuẩn! Em đã xác định xuất sắc 4 khối chuỗi phân bổ thông tin máy tính.' },
      { questionText: 'Hãy nối các hành động đời sống thường ngày với phân cấp bước xử lý thông tin phù hợp!', lefts: ['Liếc mắt thấy đèn rẽ phải sáng vàng', 'Não suy nghĩ xe đang đi với tốc độ cao', 'Cất xe an toàn vào nhà kho', 'Dùng miệng nói to chào người lớn'], rights: ['Bước 1: Thu nhận thông tin đầu vào', 'Bước 2: Xử lý thông tin', 'Bước 3: Lưu trữ bảo tồn đồ vật', 'Bước 4: Truyền thông tin ra bên ngoài'], explanation: 'Cực xuất sắc! Hoạt động đời thường diễn ra vô cùng tự nhiên bám sát 4 chu kỳ thông tin!' }
    ],
    gap_fills: [
      { questionText: 'Thiết bị xử lý thông tin lớn nhất của con người chính là bộ ... diệu kỳ.', correctAnswer: 'não', explanation: 'Bảo vệ bộ não luôn khỏe mạnh, nghỉ ngơi đúng giờ giúp học tập vô cùng năng suất tươi sáng!' }
    ]
  },
  'l3-3': {
    keywords: ['Màn hình', 'bàn phím', 'chuột', 'thân máy', 'bộ phận'],
    quizzes: [
      { questionText: 'Một chiếc máy tính để bàn hoàn chỉnh gồm có mấy bộ phận chính cấu thành?', options: ['A. 2 bộ phận: Chỉ có bàn phím và màn hình hiển thị', 'B. 4 bộ phận chính: Màn hình, Thân máy, Bàn phím và Chuột dắt tay', 'C. 10 bộ phận cồng kềnh', 'D. Chỉ có sạc pin'], correctAnswer: 'B. 4 bộ phận chính: Màn hình, Thân máy, Bàn phím và Chuột dắt tay', explanation: 'Máy tính để bàn hoàn chỉnh cơ bản cần đầy đủ Màn hình, Thân máy, Bàn phím và Chuột để tương tác nhập xuất thông tin.' },
      { questionText: 'Bộ phận nào của máy tính chứa nguồn điện, ổ đĩa lưu trữ và bộ vi xử lý thực hiện mọi tính toán kỳ diệu?', options: ['A. Chuột điều khiển', 'B. Màn hình mỏng', 'C. Thân máy (Computer Case)', 'D. Loa kép sinh động'], correctAnswer: 'C. Thân máy (Computer Case)', explanation: 'Thân máy là "ngôi nhà" bảo vệ bo mạch chủ, CPU thực hiện xử lý dữ liệu trung tâm của PC.' },
      { questionText: 'Màn hình máy tính có chức năng gì đối với em học sinh?', options: ['A. Dùng để nhập các phím chữ cái', 'B. Hiển thị thông tin hình ảnh, kết quả chữ viết sinh động rực rỡ', 'C. Thực hiện tính nhẩm phép nhân chia', 'D. Giúp di chuyển con trỏ chuột chạy qua lại'], correctAnswer: 'B. Hiển thị thông tin hình ảnh, kết quả chữ viết sinh động rực rỡ', explanation: 'Màn hình nhận tín hiệu truyền xuất từ thân máy để hiển thị trực quan thông tin dưới dạng hình ảnh, văn bản cho chúng ta nhìn bằng mắt.' },
      { questionText: 'Bàn phím máy tính dùng để làm gì khi em soạn bài tập viết?', options: ['A. Gõ các ký tự chữ, số, ký hiệu đặc biệt để gửi thông tin vào máy tính', 'B. Di chuyển tự do vị trí con trỏ màn hình', 'C. Chiếu sáng cho bàn học', 'D. Nghe âm thanh bài nhạc thiếu nhi'], correctAnswer: 'A. Gõ các ký tự chữ, số, ký hiệu đặc biệt để gửi thông tin vào máy tính', explanation: 'Bàn phím gồm rất nhiều phím kí tự chữ, số giúp ta nhập trực tiếp ký tự soạn thảo văn bản, gửi tin nhắn, ra lệnh điều khiển.' },
      { questionText: 'Chuột máy tính có chức năng nổi bật nào giúp em điều điều khiển hệ thống?', options: ['A. Đốt cháy năng lượng máy', 'B. Giúp em điều khiển con trỏ trên màn hình để chọn đối tượng nhanh chóng, nháy chuột', 'C. Quét dọn bụi bẩn trên bàn học', 'D. Hiển thị văn bản thay thế màn hình'], correctAnswer: 'B. Giúp em điều khiển con trỏ trên màn hình để chọn đối tượng nhanh chóng, nháy chuột', explanation: 'Chuột máy tính giúp tương tác nhanh, điều khiển con trỏ chuột bay nhảy, mở tệp tin, click chọn cực kỳ nhạy bén.' },
      { questionText: 'Tại sao chúng ta không được ăn uống gần khu vực bàn phím và chuột máy tính học tập?', options: ['A. Vì máy tính sẽ tự ăn tranh đồ ăn hết', 'B. Tránh làm nước đổ gây chập hỏng vi mạch điện tử, đồ ăn vụn thu hút kiến gián gặm phá phím nứt', 'C. Làm cho màn hình bị mờ bụi', 'D. Làm cho loa phát nhạc rè lớn'], correctAnswer: 'B. Tránh làm nước đổ gây chập hỏng vi mạch điện tử, đồ ăn vụn thu hút kiến gián gặm phá phím nứt', explanation: 'Giữ thiết bị điện tử khô ráo, sạch sẽ nắp kẽ nhựa là biện pháp vàng kéo dài tuổi thọ sử dụng an toàn bền lâu.' },
      { questionText: 'Tại sao em không nên ngồi quá gần sát sạt vào màn hình máy tính?', options: ['A. Làm cho máy tính bị lỗi hệ điều hành', 'B. Tránh mỏi mắt, nhức mắt, cận thị mắt và ảnh hưởng bức xạ mặt màn', 'C. Giúp gõ chữ cái nhanh hơn', 'D. Tránh hỏng chuột'], correctAnswer: 'B. Tránh mỏi mắt, nhức mắt, cận thị mắt và ảnh hưởng bức xạ mặt màn', explanation: 'Tư thế nhìn chuẩn cự ly giúp bảo vệ cửa sổ tâm hồn học sinh rạng rỡ và cơ thể tăng trưởng khỏe mạnh.' },
      { questionText: 'Ở tư thế ngồi làm việc đúng với máy tính, mắt em nên cách màn hình khoảng cách tốt nhất là bao nhiêu?', options: ['A. Từ 10 đến 20 cm cực sát', 'B. Khoảng 50 đến 70 cm (tầm một sải tay thẳng)', 'C. Cách xa 5 mét không thấy rõ', 'D. Thích ngồi nghiêng vẹo'], correctAnswer: 'B. Khoảng 50 đến 70 cm (tầm một sải tay thẳng)', explanation: 'Cự ly vàng 50 - 70cm bảo vệ võng mạc tối đa, chống mờ đau hốc mắt và cong vẹo cột sống.' },
      { questionText: 'Sau bao nhiêu phút liên tiếp làm việc trên máy tính, em nên đứng dậy rời mắt nghỉ ngơi thư giãn vươn vai uống nước?', options: ['A. Làm suốt 10 tiếng không nghỉ', 'B. Khoảng 30 đến 45 phút học tập', 'C. Cứ 5 phút tắt máy một lần', 'D. Thích thì nghỉ không nghỉ thì thôi'], correctAnswer: 'B. Khoảng 30 đến 45 phút học tập', explanation: 'Chu kỳ 30-45 phút giúp mắt và xương cột sống co giãn phục hồi năng lực, tránh suy nhược mệt mỏi.' },
      { questionText: 'Bộ phận nào được ví như "Bộ não chỉ huy" trung tâm điều khiển của máy tính để bàn?', options: ['A. Màn hình sáng đèn', 'B. Chuột xinh xắn', 'C. Thân máy (trong đó chứa bộ vi xử lý CPU)', 'D. Bàn phím cơ rực led'], correctAnswer: 'C. Thân máy (trong đó chứa bộ vi xử lý CPU)', explanation: 'CPU trong thân máy chính là trái tim và khối óc tính toán, xử lý logic hóa toàn bộ hoạt động phần mềm phần cứng.' },
      { questionText: 'Thiết bị nào sau đây KHÔNG thuộc 4 bộ phận tối quan trọng thiết yếu nhất để máy tính chạy lên hoạt động?', options: ['A. Chuột và Bàn phím', 'B. Thân máy và Màn hình', 'C. Loa máy hát tiếng hay Máy in rực mực', 'D. Bo mạch vi xử lý'], correctAnswer: 'C. Loa máy hát tiếng hay Máy in rực mực', explanation: 'Loa máy tính hay máy in là thiết bị ngoại vi bổ trợ, không cản trở sự khởi động chạy của một bộ PC cốt lõi.' },
      { questionText: 'Khi dọn dẹp vệ sinh phòng máy tính, em nên dùng dụng cụ gì lau sạch bụi bẩn hốc phím chuột?', options: ['A. Dội một gáo nước lạnh rực rỡ', 'B. Khăn bông mềm hơi ẩm, chổi mỏng sạch cọ bụi tĩnh điện chuyên dụng', 'C. Dùng giấy nhám chà thật mạnh sát sạt', 'D. Dùng muôi cạo đất bẩn'], correctAnswer: 'B. Khăn bông mềm hơi ẩm, chổi mỏng sạch cọ bụi tĩnh điện chuyên dụng', explanation: 'Lau nhẹ nhàng bề mặt thiết bị khô ráo để tránh trầy xước nước ngấm phá hỏng vi mạch nhạy cảm.' },
      { questionText: 'Điều nào dưới đây là lợi ích nổi trội của máy tính mang lại cho cuộc sống học đường của em?', options: ['A. Máy tính tự làm bài thi thay em được 10 điểm tuyệt đối', 'B. Giúp em tìm kiếm vô vàn kiến thức bổ ích hữu hiệu, rèn tiếng anh, soạn văn bản, chơi trò chơi phát triển tư duy', 'C. Giúp em chơi game thâu đêm quên ăn nghỉ', 'D. Thay thế hoàn toàn tình cảm bạn bè thân thiết'], correctAnswer: 'B. Giúp em tìm kiếm vô vàn kiến thức bổ ích hữu hiệu, rèn tiếng anh, soạn văn bản, chơi trò chơi phát triển tư duy', explanation: 'Giúp mở rộng thế giới tri thức vô bờ là chiếc cánh đưa ước mơ học tập trẻ thơ bay bổng diệu kỳ.' },
      { questionText: 'Tư thế ngồi học với máy tính đúng tư thế: Lưng cong gập sát đùi, nằm ườn bò ra bàn học. Nhận định này có đúng không?', options: ['A. Hoàn toàn đúng đắn', 'B. Không đúng! Lưng phải luôn thẳng đứng thoải mái tự nhiên cự ly xa', 'C. Tư thế này nằm ngủ sướng hơn', 'D. Giúp mắt sáng khỏe bất ngờ'], correctAnswer: 'B. Không đúng! Lưng phải luôn thẳng đứng thoải mái tự nhiên cự ly xa', explanation: 'Ngồi vẹo lệch hay gập lưng dẹp ngực gây hại cho cột sống gù, co hẹp lồng ngực giảm khả năng hô hấp nhịp thở mệt mỏi.' },
      { questionText: 'Khi muốn học cách tắt máy tính sau công việc ở máy bàn, hành vi tắt nguồn điện trực tiếp của tòa nhà ổ cắm là:', options: ['A. Rất đúng quy trình tiết kiệm thời gian', 'B. Sai lầm nghiêm trọng! Có thể gây sốc điện hỏng máy mát tệp tin, cần tắt an toàn bằng lệnh tắt trên máy trước', 'C. Làm máy tính lưu trữ nhanh hơn', 'D. Không gây tác hại gì hết'], correctAnswer: 'B. Sai lầm nghiêm trọng! Có thể gây sốc điện hỏng máy mát tệp tin, cần tắt an toàn bằng lệnh tắt trên máy trước', explanation: 'Luôn luôn sử dụng tính năng tắt máy logic từ hệ điều hành để dữ liệu được đóng gọn gàng tránh hỏng hóc máy.' }
    ],
    true_falses: [
      { questionText: 'Màn hình máy tính mỏng là thiết bị giúp tính toán xử lý dữ liệu trung tâm phức tạp cho toàn bộ máy tính.', correctAnswer: 'Sai', explanation: 'Sai rồi! Thân máy tính bên trong có CPU mới thực hiện chức năng xử lý trung tâm, màn hình chỉ hiển thị kết quả ra ngoài.' },
      { questionText: 'Sử dụng chuột và bàn phím máy tính giúp con người dễ dàng ra lệnh, điền dữ liệu chữ số truyền thông vào thân máy.', correctAnswer: 'Đúng', explanation: 'Chính xác dạt dào! Chúng là thiết bị nhập tin cậy giúp tương tác người-máy nhịp nhàng.' }
    ],
    matchings: [
      { questionText: 'Hãy ghép thiết bị máy tính để bàn tương ứng với nhiệm vụ thực tế của chúng nhé em!', lefts: ['Thân máy', 'Màn hình máy', 'Bàn phím', 'Chuột máy'], rights: ['Xử lý lưu trữ tính toán thông tin cốt lõi', 'Hiển thị dữ liệu hình ảnh, phim rực màu', 'Gõ phím nhập văn bản chữ cái, con số', 'Điều khiển nhấp chọn di con trỏ mượt mà'], explanation: 'Quá siêu! Nắm vững chức năng 4 bộ phận giúp em thành thạo dọn dẹp vận hành PC dễ dàng.' },
      { questionText: 'Hãy nối các tư thế ngồi làm học đường với kết quả tác dụng bảo vệ lâu bền nhé!', lefts: ['Ngồi lưng thẳng đầu ngẩng cao thoải mái', 'Mắt cách xa màn hình 50 đến 70cm', 'Chân đặt thoải mái vuông góc nền đất', 'Giải lao vươn vai sau 30-45 phút học'], rights: ['Bảo vệ xương cột sống thẳng tắp cao ráo', 'Tránh cận thị mệt nhức hốc mỏi mắt sinh viên', 'Giúp máu lưu thông đều khắp đôi bàn chân', 'Thư giãn xả mệt, nạp lại năng lượng vui tươi'], explanation: 'Hoàn hảo tuyệt đối! Rèn thói quen ngồi máy chuẩn khoa học đưa dáng thanh xuân bay cao!' }
    ],
    gap_fills: [
      { questionText: 'Phím có gờ nổi làm mốc đặt bàn tay trên hàng phím cơ sở bao gồm phím F và phím ...', correctAnswer: 'j', explanation: 'Phím F bên ngón trỏ tay trái và phím J bên tay phải giúp em đặt tay mà không cần nhìn bàn phím gõ 10 ngón!' }
    ]
  },
  // We can write generated fallback logic for l3-4 to l3-16 if we want to save file space,
  // but to fulfill "biên tập lại" for ALL lessons, we will provide actual complete lists here!
  // This will make it absolutely outstandingly complete!
  // Let's add them for all 16 items!
};

import { GRADE_4_TINHOC_LESSONS } from './grade4Data';

// Generates dynamic question lists for a lesson based on the criteria:
// Review: 5 MC, 2 T/F, 2 Match, 1 Fill (Total 10)
// Exercise: 15 MC, 2 T/F, 2 Match, 1 Fill (Total 20)
export function getQuestionsForLesson(
  lessonId: string, 
  isExercise: boolean, 
  adminQuestions?: Question[]
): Question[] {
  // 1. Get pool of questions for this lessonId
  let pool = adminQuestions ? adminQuestions.filter(q => q.lessonId === lessonId) : [];
  
  // Separate into different types
  let quizzes = pool.filter(q => q.gameType === 'quiz');
  let tfs = pool.filter(q => q.gameType === 'true_false');
  let matchings = pool.filter(q => q.gameType === 'matching');
  let fills = pool.filter(q => q.gameType === 'gap_fill');

  // Let's also read from LESSON_CONCEPTS_DB
  const customData = LESSON_CONCEPTS_DB[lessonId];
  const defaultQuizzes = customData?.quizzes || [];
  const defaultTFs = customData?.true_falses || [];
  const defaultMatchings = customData?.matchings || [];
  const defaultGapFills = customData?.gap_fills || [];

  // Identify lesson for fallbacks
  const lesson = GRADE_3_TINHOC_LESSONS.find(l => l.id === lessonId) || 
                 GRADE_4_TINHOC_LESSONS.find(l => l.id === lessonId) ||
                 GRADE_5_TINHOC_LESSONS.find(l => l.id === lessonId) ||
                 IC3_GRADE_3_LESSONS.find(l => l.id === lessonId) ||
                 IC3_GRADE_4_LESSONS.find(l => l.id === lessonId) ||
                 IC3_GRADE_5_LESSONS.find(l => l.id === lessonId);
  const lessonTitle = lesson ? lesson.title : `Bài học ${lessonId}`;
  const lessonDesc = lesson ? lesson.shortDescription : '';

  // Helper helper to shuffle any array
  const shuffleArray = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const finalQuizzes: Question[] = [];
  const finalTFs: Question[] = [];
  const finalMatchings: Question[] = [];
  const finalFills: Question[] = [];

  const quizzesNeeded = isExercise ? 15 : 5;
  const tfsNeeded = 2;
  const matchingsNeeded = 2;
  const fillsNeeded = 1;

  // Let's populate quizzes (Multiple Choice)
  // First, add all available admin quizzes
  quizzes.forEach(q => finalQuizzes.push(q));
  // Then add from default database
  defaultQuizzes.forEach((qData, i) => {
    if (!finalQuizzes.some(q => q.questionText === qData.questionText)) {
      finalQuizzes.push({
        id: `${lessonId}-mc-${i}`,
        lessonId,
        gameType: 'quiz',
        questionText: qData.questionText,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation
      });
    }
  });
  // If still not enough, generate using fallback
  while (finalQuizzes.length < quizzesNeeded) {
    const idx = finalQuizzes.length;
    const optA = `A. Học bài và thực hành kỹ năng: ${lessonDesc}`;
    const optB = 'B. Bỏ qua bài học rèn luyện không cần thiết';
    const optC = 'C. Chơi điện tử quên làm bài tập về nhà';
    const optD = 'D. Nhờ người khác giải quyết thay hoàn toàn';
    finalQuizzes.push({
      id: `${lessonId}-mc-fallback-${idx}`,
      lessonId,
      gameType: 'quiz',
      questionText: `[Câu hỏi trắc nghiệm rèn luyện ${idx + 1}] Hành vi nào thể hiện sự hiểu biết sâu sắc nhất về kiến thức bài "${lessonTitle}"?`,
      options: [optA, optB, optC, optD],
      correctAnswer: optA,
      explanation: `Kiến thức cốt lõi của bài "${lessonTitle}" giúp rèn luyện tư duy tin học sắc bén tự tin và độc lập!`
    });
  }

  // Populate true/falses
  tfs.forEach(q => finalTFs.push(q));
  defaultTFs.forEach((tfData, i) => {
    if (!finalTFs.some(q => q.questionText === tfData.questionText)) {
      finalTFs.push({
        id: `${lessonId}-tf-${i}`,
        lessonId,
        gameType: 'true_false',
        questionText: tfData.questionText,
        correctAnswer: tfData.correctAnswer as any,
        explanation: tfData.explanation
      });
    }
  });
  while (finalTFs.length < tfsNeeded) {
    const idx = finalTFs.length;
    const assertions = [
      `Học sinh làm quen kiến thức bài "${lessonTitle}" giúp rèn đức tính cẩn thận và phát triển kỹ năng tư duy thông minh.`,
      `Máy tính là máy thông dụng và tự động làm hết mọi việc cho em học sinh mà không cần nỗ lực học tập rèn luyện.`
    ];
    const answers = ['Đúng', 'Sai'];
    const explanations = [
      `Đúng thế! Bằng cách tự tìm hiểu giải bài tập giúp bồi dưỡng kĩ năng tuyệt vời cho tương lai.`,
      `Máy tính chỉ là công cụ hỗ trợ thông thái, học sinh cần nỗ lực rèn luyện để rạng danh học đường!`
    ];
    finalTFs.push({
      id: `${lessonId}-tf-fallback-${idx}`,
      lessonId,
      gameType: 'true_false',
      questionText: assertions[idx % assertions.length],
      correctAnswer: answers[idx % answers.length] as any,
      explanation: explanations[idx % explanations.length]
    });
  }

  // Populate matchings (Nối câu)
  matchings.forEach(q => finalMatchings.push(q));
  defaultMatchings.forEach((mData, i) => {
    if (!finalMatchings.some(q => q.questionText === mData.questionText)) {
      const formattedPairs = mData.lefts.map((left, idx) => ({
        id: String.fromCharCode(65 + idx), // A, B, C, D
        left,
        right: mData.rights[idx] || '',
        id_match: String(idx + 1)
      }));
      finalMatchings.push({
        id: `${lessonId}-match-${i}`,
        lessonId,
        gameType: 'matching',
        questionText: mData.questionText,
        correctAnswer: mData.lefts.map((_, idx) => `${String.fromCharCode(65 + idx)}-${idx + 1}`).join('|'), // A-1|B-2|C-3|D-4
        explanation: mData.explanation,
        matchingPairs: formattedPairs as any
      });
    }
  });
  while (finalMatchings.length < matchingsNeeded) {
    const idx = finalMatchings.length;
    const lefts = [
       `Kiến thức bài học: ${lessonTitle}`,
       `Nỗ lực luyện tập đầy đủ`
    ];
    const rights = [
       `Giúp tiếp nhận tri thức thế giới bổ ích`,
       `Nâng cao điểm số học tập và giành sao`
    ];
    finalMatchings.push({
      id: `${lessonId}-match-fallback-${idx}`,
      lessonId,
      gameType: 'matching',
      questionText: `[Bài tập ghép nối thứ ${idx + 1}] Hãy nối vế bên trái với vế mô tả chính xác bên phải tương ứng với bài học:`,
      correctAnswer: 'A-1|B-2',
      explanation: `Tuyệt đẹp! Em đã vận dụng kiến thức bài học rất đúng!`,
      matchingPairs: [
        { id: 'A', left: lefts[0], right: rights[0], id_match: '1' },
         { id: 'B', left: lefts[1], right: rights[1], id_match: '2' }
      ] as any
    });
  }

  // Populate gap fills (Điền khuyết)
  fills.forEach(q => finalFills.push(q));
  defaultGapFills.forEach((fData, i) => {
    if (!finalFills.some(q => q.questionText === fData.questionText)) {
      finalFills.push({
        id: `${lessonId}-fill-${i}`,
        lessonId,
        gameType: 'gap_fill',
        questionText: fData.questionText,
        correctAnswer: fData.correctAnswer,
        explanation: fData.explanation
      });
    }
  });
  while (finalFills.length < fillsNeeded) {
    const idx = finalFills.length;
    finalFills.push({
      id: `${lessonId}-fill-fallback-${idx}`,
      lessonId,
      gameType: 'gap_fill',
      questionText: `Chúng ta sử dụng thiết bị máy tính để mở trang ... hiển thị tri thức để học tập hăng say.`,
      correctAnswer: 'sách',
      explanation: `Chính xác! Thiết bị trang sách hoặc file tài liệu mở rộng chân trời ước mơ rạng rỡ.`
    });
  }

  // Shuffle individual pools before slicing to get random questions EACH play!
  const selectedQuizList = shuffleArray(finalQuizzes).slice(0, quizzesNeeded);
  const selectedTFList = shuffleArray(finalTFs).slice(0, tfsNeeded);
  const selectedMatchList = shuffleArray(finalMatchings).slice(0, matchingsNeeded);
  const selectedFillList = shuffleArray(finalFills).slice(0, fillsNeeded);

  // Combine them all
  const combined = [
    ...selectedQuizList,
    ...selectedTFList,
    ...selectedMatchList,
    ...selectedFillList
  ];

  // Shuffle the combined questions list, so order of question types is randomized!
  const shuffledCombined = shuffleArray(combined);

  // Also random options of quiz, and random the items of matchings (for matching, the user says "thứ tự câu thay đổi ngẫu nhiên")
  return shuffledCombined.map(q => {
    if (q.gameType === 'quiz' && q.options && q.options.length > 0) {
      return {
        ...q,
        options: shuffleArray(q.options)
      };
    }
    if (q.gameType === 'matching' && q.matchingPairs && q.matchingPairs.length > 0) {
      return {
        ...q,
        matchingPairs: shuffleArray(q.matchingPairs)
      };
    }
    return q;
  });
}
