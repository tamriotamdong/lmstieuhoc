import { GRADE_4_TINHOC_LESSONS } from './grade4Data';
import { GRADE_5_TINHOC_LESSONS } from './grade5Data';
import { IC3_GRADE_5_LESSONS } from './grade5Ic3Data';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Roles in the system
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface StudentProfile {
  studentId: string;
  userId: string;
  fullname: string;
  school: string;
  gender?: string; // e.g. "Nam" | "Nữ"
  avatar: string; // Emoji
  grade: number; // 3, 4, 5
  className: string; // e.g. "3.1", "4.2"
  xp: number;
  level: number;
  streak: number;
  email?: string; // Optional email address
  lastStudyDate?: string;
  completedLessonsCount: number;
  completedExercisesCount: number;
  badges: string[]; // Badges code e.g. ["nha_tin_hoc_nhi"]
}

export interface TeacherProfile {
  teacherId: string;
  userId: string;
  fullname: string;
  school: string;
  avatar: string; // Emoji
  subject: string; // Tin học, Giáo viên chủ nhiệm, Âm nhạc,...
}

export interface ClassRoom {
  id: string;
  grade: number;
  className: string;
}

export interface StudentRecord {
  id: string;          // Internal react key
  studentId: string;   // HS00001
  fullname: string;
  username: string;
  password?: string;
  gender: string;      // Nam / Nữ
  school: string;
  grade: number;       // 1, 2, 3, 4, 5
  className: string;   // 3.1, 4.2...
  xp: number;          // ⭐ tích lũy
  level: number;
  streak: number;
  avatar?: string;
}

export interface TeacherRecord {
  id: string;          // Internal key
  teacherId: string;   // GV00001
  fullname: string;
  username: string;
  password?: string;
  gender: string;      // Nam / Nữ
  school: string;
  subject: string;     // Tin học, Toán...
  grades: number[];    // Can select multiple
  classes: string[];   // Can select multiple classes
  stars?: number;      // Sao thi đua tích lũy
  xp?: number;
  homeroomClass?: string; // e.g. "3.1"
  homeroomGrade?: number; // e.g. 3
}

export type ProgramType = 'GDPT2018' | 'IC3SPARK' | 'Kết nối tri thức với cuộc sống' | 'Tin học Quốc tế IC3 Spark' | string;

export interface Lesson {
  id: string;
  programType: ProgramType;
  grade: number; // 1, 2, 3, 4, 5
  moduleName?: string; // only for IC3Spark
  topicName: string; // Name of Chapter (e.g. "Chủ đề 1. Máy tính và em")
  lessonNumber: number;
  title: string;
  shortDescription: string;
  videoUrl: string; // embedding url
  pdfUrl: string; // description or link
  infographicUrl: string; // beautiful image/SVG
  illustrationUrl: string; // display cartoon or artwork card
  colorTheme: string; // pastel-pink, pastel-blue, pastel-yellow, pastel-green, pastel-purple, pastel-orange, pastel-red
  subject?: string; // 'tin_hoc' | 'tieng_viet' | 'toan' | 'tieng_anh'
  bookSeries?: string; // e.g. 'Kết nối tri thức với cuộc sống'
}

export interface StudentProgress {
  lessonId: string;
  progressPct: number; // 0 to 100
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Question {
  id: string;
  lessonId: string;
  gameType: 'quiz' | 'true_false' | 'gap_fill' | 'matching' | 'memory' | 'quiz_multi' | 'dropdown_gap_fill' | 'hotspot_image';
  questionText: string;
  options?: string[]; // For quiz: choice fields
  correctAnswer: string; // For quiz: exact string (or A, B, C, D), For true_false: "Đúng" or "Sai", For gap_fill: word string, For matching: "A-1|B-2" JSON
  explanation: string;
  matchingPairs?: { left: string; right: string; id: string; id_match?: string }[]; // Specific for matching
  memoryCards?: { id: string; content: string; matchId: string }[]; // Specific for memory card games
  subject?: string;
  questionImage?: string;
  optionImages?: string[];
  answerImage?: string;
  dropdownOptions?: string[][];
  hotspotRect?: { x: number; y: number; radius: number };
  dropdownGaps?: {
    questionText: string;
    options: string[];
    optionImages?: string[];
    correctAnswer: string;
    questionImage?: string;
  }[];
}

export interface Badge {
  code: string;
  title: string;
  description: string;
  iconEmoji: string;
  xpRequired: number;
  tier: string; // 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương' | 'Huyền Thoại'
}

export interface Level {
  index: number;
  level: string; // e.g. "Cấp độ 5"
  starsRequired: number;
}

export function calculateLevelFromXP(totalCollectedXP: number, levels: Level[]): number {
  if (!levels || levels.length === 0) return 0;
  // Sort descending by stars required
  const sorted = [...levels].sort((a, b) => b.starsRequired - a.starsRequired);
  const matched = sorted.find(lv => totalCollectedXP >= lv.starsRequired);
  if (matched) {
    // Extract level number from matched.level string, like "Cấp độ 5" -> 5
    const match = matched.level.match(/\d+/);
    return match ? parseInt(match[0], 10) : matched.index - 1;
  }
  return 0;
}

export interface ShopItem {
  id: string;
  title: string;
  icon: string;
  cost: number;
  desc: string;
  rarity: 'Thường' | 'Đặc Biệt' | 'Quý' | 'Sử Thi' | 'Huyền Thoại' | 'Thần Thoại' | 'Tối Thượng' | string;
  raritySymbol: string;
  themeClass: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    iconBg: string;
  };
}

export interface LeaderboardEntry {
  fullname: string;
  className: string;
  grade: number;
  xp: number;
  level: number;
  avatar: string;
}

// Initial Mock Core Data
export const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'c11', grade: 1, className: '1.1' },
  { id: 'c12', grade: 1, className: '1.2' },
  { id: 'c13', grade: 1, className: '1.3' },
  { id: 'c14', grade: 1, className: '1.4' },
  { id: 'c15', grade: 1, className: '1.5' },
  { id: 'c21', grade: 2, className: '2.1' },
  { id: 'c22', grade: 2, className: '2.2' },
  { id: 'c23', grade: 2, className: '2.3' },
  { id: 'c24', grade: 2, className: '2.4' },
  { id: 'c25', grade: 2, className: '2.5' },
  { id: 'c31', grade: 3, className: '3.1' },
  { id: 'c32', grade: 3, className: '3.2' },
  { id: 'c33', grade: 3, className: '3.3' },
  { id: 'c34', grade: 3, className: '3.4' },
  { id: 'c35', grade: 3, className: '3.5' },
  { id: 'c41', grade: 4, className: '4.1' },
  { id: 'c42', grade: 4, className: '4.2' },
  { id: 'c43', grade: 4, className: '4.3' },
  { id: 'c44', grade: 4, className: '4.4' },
  { id: 'c45', grade: 4, className: '4.5' },
  { id: 'c51', grade: 5, className: '5.1' },
  { id: 'c52', grade: 5, className: '5.2' },
  { id: 'c53', grade: 5, className: '5.3' },
  { id: 'c54', grade: 5, className: '5.4' },
  { id: 'c55', grade: 5, className: '5.5' },
];

export const INITIAL_BADGES: Badge[] = [
  // Hạng Sao Đồng (Cấp 1–5):
  { code: 'tan_binh_tin', title: 'Tân Binh Tin Học 🌱', description: '⚪ Hạng Đồng (Mốc 1)', iconEmoji: '🌱', xpRequired: 10, tier: 'Đồng' },
  { code: 'voi_luu', title: 'Nhà Lưu Trữ 💾', description: '⚪ Hạng Đồng (Mốc 2)', iconEmoji: '💾', xpRequired: 30, tier: 'Đồng' },
  { code: 'chuyen_gia_an_do', title: 'Chuyên Gia In Ấn 🖨️', description: '⚪ Hạng Đồng (Mốc 3)', iconEmoji: '🖨️', xpRequired: 55, tier: 'Đồng' },
  { code: 'nguoi_ve_bao_mat_khau', title: 'Người Bảo Vệ Mật Khẩu 🔒', description: '⚪ Hạng Đồng (Mốc 4)', iconEmoji: '🔒', xpRequired: 80, tier: 'Đồng' },
  { code: 'thai_dien', title: 'Bưu Tá Điện Tử 📧', description: '⚪ Hạng Đồng (Mốc 5)', iconEmoji: '📧', xpRequired: 110, tier: 'Đồng' },

  // Hạng Sao Bạc (Cấp 6–10):
  { code: 'nha_tham_hiem_web', title: 'Nhà Thám Hiểm Web 🌍', description: '🟢 Hạng Bạc (Mốc 6)', iconEmoji: '🌍', xpRequired: 150, tier: 'Bạc' },
  { code: 'san_thong_tin', title: 'Thợ Săn Thông Tin 🔍', description: '🟢 Hạng Bạc (Mốc 7)', iconEmoji: '🔍', xpRequired: 200, tier: 'Bạc' },
  { code: 'bo_khong_tin', title: 'Bộ Não Tin Học 🧠', description: '🟢 Hạng Bạc (Mốc 8)', iconEmoji: '🧠', xpRequired: 260, tier: 'Bạc' },
  { code: 'ky_lan_cong_nghe', title: 'Kỳ Lân Công Nghệ 🦄', description: '🟢 Hạng Bạc (Mốc 9)', iconEmoji: '🦄', xpRequired: 330, tier: 'Bạc' },
  { code: 'lap_trinh_vien_nhi', title: 'Lập Trình Viên Nhí 🤖', description: '🟢 Hạng Bạc (Mốc 10)', iconEmoji: '🤖', xpRequired: 410, tier: 'Bạc' },

  // Hạng Sao Vàng (Cấp 11–15):
  { code: 'nha_lap_sy', title: 'Nhà Lập Trình Nhí 🚀', description: '🔵 Hạng Vàng (Mốc 11)', iconEmoji: '🚀', xpRequired: 500, tier: 'Vàng' },
  { code: 'kien_truc_su_ma', title: 'Kiến Trúc Sư Mã Lệnh 🏗️', description: '🔵 Hạng Vàng (Mốc 12)', iconEmoji: '🏗️', xpRequired: 600, tier: 'Vàng' },
  { code: 'anh_hung_an_ninh_mang', title: 'Anh Hùng An Ninh Mạng 🛡️', description: '🔵 Hạng Vàng (Mốc 13)', iconEmoji: '🛡️', xpRequired: 720, tier: 'Vàng' },
  { code: 'nha_thong_thai', title: 'Nhà Thông Thái 💡', description: '🔵 Hạng Vàng (Mốc 14)', iconEmoji: '💡', xpRequired: 850, tier: 'Vàng' },
  { code: 'ngoi_sao_tin', title: 'Ngôi Sao Tin Học ⭐', description: '🔵 Hạng Vàng (Mốc 15)', iconEmoji: '⭐', xpRequired: 1000, tier: 'Vàng' },

  // Hạng Kim Cương (Cấp 16–18):
  { code: 'chuyen_gia_tin_nam', title: 'Chuyên Gia Tin Học 🎉', description: '🟣 Hạng Kim Cương (Mốc 16)', iconEmoji: '🎉', xpRequired: 1200, tier: 'Kim Cương' },
  { code: 'hoc_gia_tin_2', title: 'Học Giả Tin Học 🎓', description: '🟣 Hạng Kim Cương (Mốc 17)', iconEmoji: '🎓', xpRequired: 1400, tier: 'Kim Cương' },
  { code: 'dai_su_tin_hoc', title: 'Đại Sứ Tin Học 🏵️', description: '🟣 Hạng Kim Cương (Mốc 18)', iconEmoji: '🏵️', xpRequired: 1650, tier: 'Kim Cương' }
];

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
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  }
];

export const IC3_GRADE_3_LESSONS: Lesson[] = [
  {
    id: 'lic3-3-1',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Hệ điều hành và Phần cứng',
    lessonNumber: 1,
    title: 'Bài 1: Tìm hiểu phần cứng cơ bản của máy tính',
    shortDescription: 'Nhận biết các linh kiện bộ phận bên trong và bên ngoài máy tính có thể sờ hoặc nhìn thấy được.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 1:\n- Phần cứng (Hardware) là tất cả các thiết bị vật lý bên ngoài và bên trong có thể chạm tới.\n- CPU (Central Processing Unit) là bộ vi xử lý trung tâm, đóng vai trò bộ não của máy tính.\n- Bo mạch chủ (Mainboard) kết nối toàn bộ linh kiện phần cứng.\n- Ổ đĩa cứng (HDD, SSD) dùng để lưu trữ dữ liệu lâu bền.',
    infographicUrl: '🔌 PHẦN CỨNG MÁY TÍNH (Hardware):\n🧠 CPU: Bộ não xử lý siêu tốc\n🔧 Bo Mạch Chủ: Xương sườn kết nối\n💾 HDD/SSD: Kho lưu trữ tài liệu bền lâu',
    illustrationUrl: '🎨 Minh họa: Các con chip 3D rực rỡ và bảng mạch chủ màu sắc sinh động.',
    colorTheme: 'pastel-pink'
  },
  {
    id: 'lic3-3-2',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Hệ điều hành và Phần cứng',
    lessonNumber: 2,
    title: 'Bài 2: Các thiết bị nhập và thiết bị xuất cơ bản',
    shortDescription: 'Làm quen các thiết bị nhận thông tin vào và phát dữ liệu ra bên ngoài như bàn phím, con chuột, màn hình, máy in.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 2:\n- Thiết bị nhập (Input devices): Bàn phím (Keyboard), Con chuột (Mouse), Míc-rô (Microphone), Máy quét (Scanner).\n- Thiết bị xuất (Output devices): Màn hình (Monitor), Máy chiếu (Projector), Máy in (Printer), Loa (Speaker).\n- Cổng kết nối phổ biến: USB Type A, USB-C (đầu đảo ngược dễ cắm), HDMI, VGA.',
    infographicUrl: '📥 NHẬP: Bàn phím ⌨️ | Chuột 🖱️ | Micro 🎙️\n📤 XUẤT: Màn hình 🖥️ | Loa 🔊 | Máy in 🖨️\n🔌 KẾT NỐI: Cổng USB-C đảo ngược đa năng!',
    illustrationUrl: '🎨 Minh họa: Thiết bị chuột quang, míc-rô và loa vi tính 3D bay múa ngộ nghĩnh.',
    colorTheme: 'pastel-blue'
  },
  {
    id: 'lic3-3-3',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Hệ điều hành và Phần cứng',
    lessonNumber: 3,
    title: 'Bài 3: Tìm hiểu các loại máy tính',
    shortDescription: 'Khám phá sự khác biệt, điểm mạnh yếu của máy tính để bàn, máy tính xách tay, máy tính bảng và điện thoại thông minh.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 3:\n- Máy tính để bàn (Desktop): Lắp ráp từ nhiều linh kiện (case, monitor, keyboard, mouse), giá rẻ hơn với cấu hình cao, khó di chuyển.\n- Máy tính xách tay (Laptop): Tích hợp sẵn bàn phím, touchpad, màn hình và pin, cơ động tốt.\n- Máy tính bảng (Tablet): Màn hình cảm ứng lớn, nhẹ hơn laptop.\n- Điện thoại thông minh (Smartphone): Nhỏ gọn, hỗ trợ nghe gọi, định vị vẽ 3D, kết nối di động.',
    infographicUrl: '🖥️ Desktop: Mạnh mẽ, đặt cố định một chỗ\n💻 Laptop: Gập mở xách đi khắp muôn nơi\n📱 Tablet: Màn hình chạm to rực rỡ\n📞 Smartphone: Nhỏ xinh bỏ gọn trong túi!',
    illustrationUrl: '🎨 Minh họa: Các mẫu thiết bị công nghệ 3D nằm xếp cạnh các biểu tượng sóng Wifi dễ thương.',
    colorTheme: 'pastel-yellow'
  },
  {
    id: 'lic3-3-4',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Hệ điều hành và Phần cứng',
    lessonNumber: 4,
    title: 'Bài 4: Tìm hiểu về phần mềm và ứng dụng',
    shortDescription: 'Phân biệt phần mềm hệ thống với phần mềm ứng dụng, phần mềm ứng dụng trên web với ứng dụng di động.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 4:\n- Phần mềm hệ thống: Điều khiển máy tính (ví dụ: trình quản lý phân vùng, trình điều khiển đồ họa).\n- Phần mềm ứng dụng: Giúp con người làm việc cụ thể (Trình duyệt, Microsoft Word, PowerPoint, trò chơi).\n- Phần mềm nguồn mở (Open Source): Miễn phí, cho phép chỉnh sửa mã nguồn, hỗ trợ từ cộng đồng rộng lớn.\n- Ứng dụng Desktop chạy trực tiếp, ứng dụng di động gọn nhẹ, ứng dụng web chỉ cần mở trình duyệt.',
    infographicUrl: '📀 PHẦN MỀM (Software):\n⚙️ Phần mềm hệ thống: Giúp máy tính vận hành\n🎨 Phần mềm ứng dụng: Giúp học sinh học tập giải trí\n🔓 Nguồn Mở: Miễn phí & tự do học tập sáng tạo!',
    illustrationUrl: '🎨 Minh họa: Đĩa cài đặt 3D rực rỡ với các ký hiệu lập trình bay múa vui vẻ.',
    colorTheme: 'pastel-green'
  },
  {
    id: 'lic3-3-5',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Hệ điều hành và Phần cứng',
    lessonNumber: 5,
    title: 'Bài 5: Tìm hiểu về hệ điều hành',
    shortDescription: 'Hiểu vai trò của Hệ điều hành, phân biệt các hệ điều hành phổ biến và hệ điều hành nguồn mở/đóng.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 5:\n- Hệ điều hành (Operating System): Là chương trình điều quản lý mọi phần cứng máy tính và giao tiếp with các thiết bị ngoại vi.\n- Công việc chính: Quản lý thiết bị phần cứng, kiểm soát thông tin liên lạc, quản trị tập tin, tương tác giao diện người dùng.\n- Hệ điều hành mã nguồn đóng: Windows, iOS, macOS.\n- Hệ điều hành mã nguồn mở: Linux, Android.',
    infographicUrl: '⚙️ HỆ ĐIỀU HÀNH (OS):\n🖥️ Quản lý mọi linh kiện vật lý\n📁 Quản trị hồ sơ tập tin ngăn nắp\n💻 Windows & macOS (Đóng) 🆚 Linux & Android (Mở!)',
    illustrationUrl: '🎨 Minh họa: Logo Windows, Android và quả táo Apple xếp tròn quanh bánh răng chuyển động 3D.',
    colorTheme: 'pastel-purple'
  },
  {
    id: 'lic3-3-6',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Hệ điều hành và Phần cứng',
    lessonNumber: 6,
    title: 'Bài 6: Tài khoản đăng nhập và các tác vụ điều hướng',
    shortDescription: 'Tìm hiểu về tài khoản quản trị Admin so với người dùng thông thường, và thiết lập mật khẩu mạnh bảo vệ dữ liệu.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 6:\n- Tài khoản người dùng (User Accounts):\n  + Tài khoản Quản trị viên (Administrator): Được toàn quyền cài phần mềm, đổi thiết lập hệ thống.\n  + Tài khoản Thông thường (Standard User): Sử dụng phần mềm, không được cài đặt thay đổi lớn gây hại an toàn.\n- Nguyên tắc mật khẩu mạnh an toàn: Có ít nhất 8 ký tự, gồm cả chữ hoa, chữ thường, chữ số và ký hiệu đặc biệt.',
    infographicUrl: '🔑 BẢO MẬT USER ACCOUNTS:\n👑 Administrator: Toàn quyền truy cập\n🧑 Standard User: Học sinh đăng nhập an toàn\n🛡️ Mật khẩu mạnh: >= 8 ký tự với chữ số & dấu đặc biệt!',
    illustrationUrl: '🎨 Minh họa: Chiếc khiên vàng 3D sáng lấp lánh với cụm ổ khóa to lớn bền chắc.',
    colorTheme: 'pastel-orange'
  },
  {
    id: 'lic3-3-7',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Hệ điều hành và Phần cứng',
    lessonNumber: 7,
    title: 'Bài 7: Quản lí tập tin và sao lưu dự phòng',
    shortDescription: 'Học cách đặt tên tệp tin chuẩn quy định, tận dụng thư mục thu hẹp tài liệu và bảo lưu an toàn thông tin.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 7:\n- Thư mục (Folder) là chiếc hộp ảo chứa các tệp tin lưu trữ gọn gàng khoa học.\n- Quy tắc đặt tên tệp tin (File Naming):\n  + Độ dài tệp tối đa 255 ký tự.\n  + Không chứa ký tự đặc biệt cấm: \\ / : * ? " < > |\n  + Định dạng ngày tháng khoa học nhất: YYYY-MM-DD hoặc MMDDYY.\n  + Tránh khoảng trống kép liên tục.',
    infographicUrl: '📂 QUẢN LÝ TIỆN LỢI:\n🚫 Không dùng ký tự đặc biệt: \\ / : * ? " < > |\n📅 Định dạng thông minh: Năm-Tháng-Ngày (2026-06-09)\n📦 Đựng tệp gọn gàng bên trong các Thư mục!',
    illustrationUrl: '🎨 Minh họa: Các cặp hồ sơ và thư mục kẹp tài liệu 3D đầy sắc màu đẹp mắt.',
    colorTheme: 'pastel-red'
  },
  {
    id: 'lic3-3-8',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 2. Mạng và Internet',
    lessonNumber: 8,
    title: 'Bài 8: Tìm hiểu về mạng và cơ sở hạ tầng',
    shortDescription: 'Hiểu thế nào là mạng kết nối thông tin, vai trò của bộ định tuyến, bộ chuyển đổi sóng modem.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 8:\n- Mạng máy tính (Network): Kết nối các thiết bị để chia sẻ thông tin.\n- Network Adapter: Bộ điều hợp mạng kết nối vật lý đầu cuối.\n- Thiết bị trung gian:\n  + Modem: Chuyển đổi tín hiệu tương tự sang tín hiệu số và ngược lại.\n  + Router (Bộ định tuyến): Chuyển tiếp các gói dữ liệu giữa các mạng khác nhau.\n  + DSL, Cáp quang: Dịch vụ truyền tải dữ liệu siêu nhanh.',
    infographicUrl: '🌐 MẠNG MÁY TÍNH & INTERNET:\n🔌 Network Adapter: Thiết bị bám cổng nối mạng\n🔋 Modem: Chuyển đổi mã hóa tín hiệu\n📶 Router: Người đưa tin chuyển gói dữ liệu siêu nhanh!',
    illustrationUrl: '🎨 Minh họa: Các nút thiết bị liên kết với nhau bằng sợi dây phát sáng lộng lẫy 3D.',
    colorTheme: 'pastel-pink'
  },
  {
    id: 'lic3-3-9',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 2. Mạng và Internet',
    lessonNumber: 9,
    title: 'Bài 9: Tìm hiểu về kết nối mạng không dây',
    shortDescription: 'Phân biệt mạng không dây (Wi-Fi) và có dây (Ethernet), các bước đơn giản khắc phục lỗi mất mạng.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 9:\n- Mạng không dây (Wi-Fi) linh hoạt, cơ động cao nhưng băng thông dễ hao hụt qua tường.\n- Mạng có dây (Ethernet) nhanh hơn, trễ cực thấp, bảo mật tuyệt vời.\n- Khắc phục sự cố mất mạng cơ bản:\n  + Kiểm tra giắc cắm vật lý có chặt không.\n  + Sử dụng lệnh ipconfig để kiểm tra địa chỉ IP.\n  + Sử dụng lệnh ping để kiểm tra kết nối tới máy chủ internet.',
    infographicUrl: '📶 KẾT NỐI KHÔNG DÂY (Wi-Fi):\n⚡ Wifi: Cơ động tiện lợi 🆚 Ethernet: Có dây tốc độ cao và cực kỳ ổn định!\n🛠️ Sửa mạng: Cắm lại jack -> Dùng lệnh ping -> Kiểm tra router Wi-Fi!',
    illustrationUrl: '🎨 Minh họa: Cột thu phát sóng Wifi 3D tỏa ra các vòng tròn ánh sáng màu cam.',
    colorTheme: 'pastel-orange'
  },
  {
    id: 'lic3-3-10',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 3. Trình duyệt và Tìm kiếm',
    lessonNumber: 10,
    title: 'Bài 10: Trình duyệt Web và duyệt web ẩn danh',
    shortDescription: 'Tìm hiểu cách lướt Web an toàn với các nút điều hướng cơ bản và chế độ duyệt ẩn danh bảo mật.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 10:\n- Trình duyệt Web (Web Browser): Phần mềm giúp truy cập và xem các trang web.\n- Các nút điều hướng cơ bản: Back (quay lại), Forward (đi tới), Refresh (tải lại trang).\n- Chế độ ẩn danh (Incognito/Private): Chế độ duyệt web không ghi lại lịch sử lướt web, không lưu cookie hay tệp dữ liệu tạm thời.\n- Cookie: Đoạn văn bản nhỏ lưu trữ thông tin trạng thái hoạt động của người dùng trên trang web.',
    infographicUrl: '🌍 TRÌNH DUYỆT WEB (Browser):\n🔙 Back/Forward: Đi tới đi lui lịch sử lướt web | 🔄 Refresh: Tải lại trang khi bị lỗi\n🕶️ Ẩn danh: Duyệt web bảo mật, không lưu lịch sử hay cookie!',
    illustrationUrl: '🎨 Minh họa: Trái đất 3D bao quanh bởi một dải lụa bay lượn tượng trưng cho World Wide Web.',
    colorTheme: 'pastel-yellow'
  },
  {
    id: 'lic3-3-11',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 3. Trình duyệt và Tìm kiếm',
    lessonNumber: 11,
    title: 'Bài 11: Các trình duyệt Web phổ biến và quản lí bookmark',
    shortDescription: 'Nhận diện các thương hiệu trình duyệt hàng đầu và thành thạo lưu trang yêu thích Bookmark.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 11:\n- Các trình duyệt web phổ biến hiện nay: Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari, Opera.\n- Bookmark / Favorite: Là tính năng đánh dấu ghi lại địa chỉ trang web em yêu thích để lần sau chỉ cần bấm một click là mở được ngay.\n- Thanh Bookmark (Bookmarks Bar): Nơi xếp gọn gàng các đường dẫn trang hay dùng trên Chrome, Edge.',
    infographicUrl: '⭐ ĐÁNH DẤU TRANG (Bookmark):\n🔥 Đang xem bài học hay -> Bấm Bookmark để lưu trữ!\n🌐 Trình duyệt phổ dụng: Google Chrome, Safari, MS Edge, Firefox!',
    illustrationUrl: '🎨 Minh họa: Một biểu tượng ngôi sao vàng 3D khổng lồ hạnh phúc đang mỉm cười.',
    colorTheme: 'pastel-green'
  },
  {
    id: 'lic3-3-12',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 3. Trình duyệt và Tìm kiếm',
    lessonNumber: 12,
    title: 'Bài 12: Tìm kiếm thông tin và thu hẹp phạm vi tìm kiếm',
    shortDescription: 'Hiểu cơ chế hoạt động của công cụ tìm kiếm và các dấu đặc biệt để thu hẹp tìm chính xác thứ cần tìm.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 12:\n- Công cụ tìm kiếm (Search Engines) như Google, Bing, Yahoo hoạt động qua 3 bước: Crawl (Thu thập dữ liệu), Index (Lập chỉ mục lưu kho), Rank (Xếp hạng phân loại).\n- Cách thu hẹp từ khóa tìm nâng cao:\n  + Dùng dấu ngoặc kép: "từ khóa" để tìm chính xác cụm từ.\n  + Dùng dấu trừ: -can_tranh để loại trừ từ bỏ đi.\n  + Dùng dấu ngã: ~tu_khoa để tìm thêm từ đồng nghĩa.',
    infographicUrl: '🔍 TÌM KIẾM CHI TIẾT (Search Engines):\n🕷️ Crawl (Bò bắt dữ liệu) -> 📂 Index (Đánh chỉ mục) -> 🏆 Rank (Xếp hạng từ 1-10!)\n🤫 Mẹo: Thêm dấu "..." tìm chính xác cụm từ!',
    illustrationUrl: '🎨 Minh họa: Một chiếc kính lúp 3D bự lấp lánh soi sáng dấu chấm hỏi xanh dương dễ thương.',
    colorTheme: 'pastel-purple'
  },
  {
    id: 'lic3-3-13',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Đạo đức và An toàn trực tuyến',
    lessonNumber: 13,
    title: 'Bài 13: Tài sản công cộng và giấy phép Creative Commons',
    shortDescription: 'Tìm hiểu về tài sản số, bản quyền, nguyên tắc sử dụng hợp lý Fair Use và các ký hiệu giấy phép Creative Commons.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 13:\n- Miền công cộng (Public Domain): Các tác phẩm đã hết hạn bảo hộ bản quyền hoặc nhà văn hóa hiến dâng tự do.\n- Giấy phép quốc tế Creative Commons (CC):\n  + CC-BY: Phải ghi danh tác giả gốc.\n  + CC-BY-NC: Không dùng cho mục đích thương mại kiếm tiền.\n  + CC-BY-SA: Chia sẻ tương tự bản quyền cũ.\n  + CC-BY-ND: Không phái sinh, không cắt sửa tác phẩm.\n- Bản quyền bảo hộ sáng tạo thường kéo dài khá lâu từ 50-100 năm sau khi tác giả qua đời.\n- Sử dụng hợp lý (Fair Use) cho phép trích một góc nhỏ phục vụ học tập giảng dạy.',
    infographicUrl: '📜 BẢN QUYỀN & CREATIVE COMMONS:\n🏷️ CC-BY: Thêm tên tác giả gốc!\n🚫 CC-BY-NC: Không kiếm tiền thương mại\n🏫 Fair Use: Trích dẫn học tập ngắn gọn an toàn!',
    illustrationUrl: '🎨 Minh họa: Bản sắc phong bản quyền 3D cổ kính kẹp chiếc bút lông sáng ngời.',
    colorTheme: 'pastel-orange'
  },
  {
    id: 'lic3-3-14',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Đạo đức và An toàn trực tuyến',
    lessonNumber: 14,
    title: 'Bài 14: Danh tính kỹ thuật số',
    shortDescription: 'Bảo vệ hồ sơ định danh số, nhận thức rõ dấu chân kỹ thuật số và bảo mật thông tin PII.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 14:\n- Danh tính kỹ thuật số (Digital Identity): Toồn bộ hoạt động hiển thị của em trên internet.\n- Dấu chân kỹ thuật số (Digital Footprint): Vết tích để lại vĩnh viễn sau mỗi bình luận, nút thích, tải ứng dụng mạng.\n- Thông tin nhận dạng cá nhân PII (Personally Identifiable Information) nhạy cảm cần giữ bí mật: Số ID định danh, vân tay sinh học, địa chỉ nhà, thẻ ngân hàng.\n- Có thể dùng biệt danh (alias/pseudonym) lành mạnh để tự vệ trên internet.',
    infographicUrl: '👤 DANH TÍNH TRỰC TUYẾN:\n⚠️ Digital Footprint: Dấu chân số vĩnh viễn trên mạng!\n🔒 Bí mật PII: Giữ kín số ID, địa chỉ nhà, điện thoại!\n🧑 Biệt danh (pseudonym): Tên giả thông minh chống bắt nạt!',
    illustrationUrl: '🎨 Minh họa: Dấu chân phát sáng 3D in trên vũ trụ đầy sao lấp lánh.',
    colorTheme: 'pastel-red'
  },
  {
    id: 'lic3-3-15',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Đạo đức và An toàn trực tuyến',
    lessonNumber: 15,
    title: 'Bài 15: Các hành vi trực tuyến',
    shortDescription: 'Rèn luyện ứng xử văn minh lịch sự trên môi trường trực tuyến và các bước viết bài báo cáo khoa học.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 15:\n- Lịch thiệp ứng xử trực tuyến:\n  + Khi xảy ra cãi cọ, hãy dừng lại tự nghỉ ngơi vài phút.\n  + Tránh bình luận ác ý mang tính kích động.\n  + Rời khỏi phòng trò chuyện độc hại và báo ngay cho người lớn.\n- Các bước quan trọng khi viết nghiên cứu:\n  + Bước 1: Quyết định chủ đề cụ thể định hướng.\n  + Bước 2: Liệt kê các tài nguyên tìm lấy ở đâu.\n  + Bước 3: Lập kế hoạch thời gian triển khai chi tiết.',
    infographicUrl: '🤝 HÀNH VI VĂN MINH MẠNG:\n🛑 Cãi vã? Hãy tạm dừng 5 phút và đi uống nước!\n🚯 Nói KHÔNG với bình luận trêu chọc ác ý\n🏫 Báo ngay thầy cô hoặc cha mẹ khi bị đe dọa!',
    illustrationUrl: '🎨 Minh họa: Các icon bắt tay nhau vây quanh trái tim màu hồng 3D ấm áp.',
    colorTheme: 'pastel-pink'
  },
  {
    id: 'lic3-3-16',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Đạo đức và An toàn trực tuyến',
    lessonNumber: 16,
    title: 'Bài 16: Một số mạng truyền thông xã hội phổ biến',
    shortDescription: 'Nhận mặt các trang mạng xã hội nổi trội ngày nay và nắm bắt các nút gửi hòm thư điện tử.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 16:\n- Mạng truyền thông xã hội phổ biến: Facebook (kết nối người quen), Instagram (ảnh rực rỡ), Twitter (bản tin ngắn), Snapchat (tin tự xóa).\n- Khái niệm email hữu dụng:\n  + CC: Gửi bản sao công khai cho người khác giám sát.\n  + BCC: Gửi bản sao bí mật giấu kín danh tính người nhận khác.\n  + Reply: Trả lời riêng tác giả thư.\n  + Reply All: Trả lời tất cả những ai có tên trong thư.\n  + Forward: Chuyển tiếp bức thư nguyên vẹn sang cho người bạn mới.',
    infographicUrl: '📣 MẠNG XÃ HỘI & EMAIL:\n👥 Social: Facebook, Instagram, Twitter (X)...\n📧 CC: Bản sao công khai 🆚 BCC: Bản sao bí mật\n🔄 Forward: Chuyển tiếp thư nhanh sang bạn bè học tốt!',
    illustrationUrl: '🎨 Minh họa: Phong thư giấy màu xanh dương 3D bay nhẹ thướt tha.',
    colorTheme: 'pastel-blue'
  },
  {
    id: 'lic3-3-17',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Đạo đức và An toàn trực tuyến',
    lessonNumber: 17,
    title: 'Bài 17: Các nguyên tắc và chính sách khi tham gia mạng xã hội - Phần 1',
    shortDescription: 'Tìm hiểu về quy định sử dụng được chấp nhận AUP và hành vi loại trừ ngôn từ cấm kỵ.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 17:\n- Chính sách sử dụng được chấp nhận AUP (Acceptable Use Policy): Bản giao kèo về các điều học sinh được và không được làm khi truy cập internet trường học.\n- Vi phạm AUP dẫn tới hậu quả nặng: Trừng phạt kỷ luật học đường, bị hạn chế thiết bị đăng nhập.\n- Ngôn từ bao hàm (Inclusive language): Dùng từ trung tính, tôn trọng tất cả bạn bè, tránh phân biệt đối xử.\n- Giới hạn tuổi đăng ký tài khoản tự lập: Facebook từ 13 tuổi trở lên, LinkedIn từ 16 tuổi trở lên.',
    infographicUrl: '📋 CHÍNH SÁCH AUP TRƯỜNG HỌC:\n🤝 AUP: Bộ luật hành vi văn minh mạng nhà trường\n🚫 Vi phạm: Sẽ bị tước quyền dùng máy tính thực hành!\nInclusive language: Tôn trọng sự khác biệt của bạn học!',
    illustrationUrl: '🎨 Minh họa: Quyển sách hiến pháp vàng 3D tỏa ra ánh sáng lấp lánh.',
    colorTheme: 'pastel-yellow'
  },
  {
    id: 'lic3-3-18',
    subject: 'tin_hoc',
    programType: 'IC3SPARK',
    grade: 3,
    moduleName: 'Module 2. Các trình duyệt và cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Đạo đức và An toàn trực tuyến',
    lessonNumber: 18,
    title: 'Bài 18: Các nguyên tắc và chính sách khi tham gia mạng xã hội - Phần 2',
    shortDescription: 'Nhận diện vấn nạn bắt nạt mạng trực tuyến Cyberbullying, các luật bảo đảm an toàn thông tin trường lớp.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Bài 18:\n- Bắt nạt qua mạng (Cyberbullying): Việc chửi bới, phân tán tin đồn gièm pha, đe dọa bạn bè thông qua thiết bị công nghệ số.\n- Biện pháp tự vệ trước Cyberbullying:\n  + Chụp màn hình lưu bằng chứng cụ thể.\n  + Báo cáo chặn ngay nick xấu.\n  + Tuyệt đối không trả đòn chửi rủa lại.\n- Trường học và cơ quan có quy chế mạng nội bộ chặt chẽ để bảo vệ an toàn danh dự cho tất cả thành viên.',
    infographicUrl: '🛑 CHỐNG BẮT NẠT MẠNG (Cyberbullying):\n📸 Ghi lại bằng chứng (Chụp màn hình) -> 🚫 Chặn nick thô tục\n🗣️ Lập tức tâm sự với cha mẹ hoặc giáo viên chủ nhiệm!\n🔒 Tuyệt đối không tung thông tin cá nhân lên hội nhóm!',
    illustrationUrl: '🎨 Minh họa: Chiếc biển báo đỏ dừng lại 3D vây quanh những biểu tượng trò chuyện.',
    colorTheme: 'pastel-green'
  }
];

export const IC3_GRADE_4_LESSONS: Lesson[] = [
  {
    id: 'lic3-4-1',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Phần cứng và Thiết bị',
    lessonNumber: 1,
    title: 'Bài 1: Phần cứng máy tính & Bộ vi xử lý',
    shortDescription: 'Tìm hiểu về bộ não CPU, bộ xử lý đồ họa GPU và cách phân biệt các cổng VGA, DVI, HDMI, cổng USB cùng đầu bấm mạng RJ45 Cat 5/6/7.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 1:\n- CPU: Bộ não trung tâm xử lý dữ liệu của máy tính.\n- GPU: Bộ xử lý đồ họa chuyên nghiệp, tối ưu trò chơi và hoạt hình 3D.\n- Phân biệt cổng kết nối:\n  + Cổng VGA (Màu xanh dương): Truyền hình ảnh dạng tương tự analog cũ.\n  + Cổng DVI (Màu trắng): Truyền hình ảnh kỹ thuật số chất lượng tốt.\n  + Cổng HDMI (Nhỏ gọn dẹt): Truyền cả âm thanh lẫn hình ảnh sắc nét.\n  + Cáp Ethernet (cổng RJ45): Dùng kết nối Internet dây (các chuẩn Cat 5, Cat 5e, Cat 6, Cat 7).',
    infographicUrl: '🧠 CPU: Bộ não máy tính | 🎨 GPU: Xử lý hoạt hình 3D rực sắc\n📺 VGA: Cổng xanh dương cũ | 🔌 HDMI: Hình ảnh & Âm thanh chung một cáp\n🌐 Cáp RJ45: Kết nối mạng dây thần tốc!',
    illustrationUrl: '🎨 Minh họa: Mặt sau thân máy tính 3D với màu sắc sinh động minh họa các cổng kết nối.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-2',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Phần cứng và Thiết bị',
    lessonNumber: 2,
    title: 'Bài 2: Thiết lập, kết nối và tùy chỉnh máy in',
    shortDescription: 'Làm quen các loại máy in phun, laser, plotter, đa năng và học cách kết nối cổng USB, đặt máy in mặc định Default Printer.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 2:\n- Các loại máy in phổ quát:\n  + Máy in phun Inkjet: Phun mực nước lỏng lên giấy, phù hợp in ảnh sặc sỡ.\n  + Máy in Laser: Dùng tia sáng laser thiêu bột mực khô lên giấy, tốc độ cực nhanh.\n  + Máy in Plotters: Thiết bị vẽ bản vẽ kỹ thuật lớn, sơ đồ địa lý rộng lớn.\n  + Máy in đa năng All-in-one: Tích hợp in, copy, quét văn bản scan và fax.\n- Đặt mặc định Default Printer: Thiết lập một máy in ưu tiên để nhận ngay lệnh in tự động.',
    infographicUrl: '🖨️ MÁY IN PHUN: Mực nước rực rỡ | ⚡ MÁY IN LASER: Tốc độ bắn tia chớp\n🏗️ PLOTTER: Vẽ bản vẽ kiến trúc to đùng | 📌 DEFAULT PRINTER: Gán mặc định in tức thì!',
    illustrationUrl: '🎨 Minh họa: Chú máy in Laser 3D ngộ nghĩnh đang đẩy ra trang giấy sắc nét.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-3',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 1. Phần cứng và Thiết bị',
    lessonNumber: 3,
    title: 'Bài 3: Điện toán đám mây & Tùy chỉnh hệ thống',
    shortDescription: 'Tìm hiểu mô hình điện toán đám mây SaaS, IaaS, PaaS, ưu nhược điểm; thiết lập độ sáng màn hình, Night light, Ease of Access và 7 quy tắc thiết kế.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 3:\n- Điện toán đám mây (Cloud Computing):\n  + SaaS: Sử dụng phần mềm trực tuyến (ví dụ Gmail, Office 365).\n  + PaaS: Cung cấp nền tảng phát triển lập trình.\n  + IaaS: Cung cấp cơ sở hạ tầng, ổ cứng, máy chủ ảo.\n- Thiết lập phần cứng (Windows Settings):\n  + Brightness (Độ sáng), Night light (ánh sáng ấm bảo vệ mắt khi tối).\n  + Master Volume (Âm lượng tổng).\n  + Ease of Access (Hỗ trợ người khuyết tật về thị giác, thính giác).\n- 7 Nguyên tắc thiết kế phần cứng phổ quát: Sử dụng công bằng, tính linh hoạt, đơn giản, thông tin cảm nhận rõ ràng, khả năng chịu lỗi sa sẩy, nỗ lực ít tốn sức lực, không gian chứa vừa cơ thể.',
    infographicUrl: '☁️ CLOUD COMPUTING (SaaS, PaaS, IaaS) -> Lưu trữ vô biên!\n🔆 NIGHT LIGHT: Chế độ ban đêm bảo vệ mắt | 🎛️ EASiness: 7 Nguyên tắc vàng thiết kế tinh giản tiện ích!',
    illustrationUrl: '🎨 Minh họa: Chiếc đám mây 3D xanh pastel dịu mát kết nối với các thiết bị thông minh.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-4',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 2. Hệ thống lưu trữ và quản lý tập tin',
    lessonNumber: 4,
    title: 'Bài 4: Quản lý tệp tin và cây thư mục',
    shortDescription: 'Quản lý thư mục con, hiểu đường dẫn (File’s Path), cấu trúc tệp tin, nén giữ dữ liệu (.zip, .rar) và phân biệt quyền Read-Write.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 4:\n- Thư mục con (Subfolder): Thư mục nằm bên trong thư mục khác để phân chia dữ liệu ngăn nắp.\n- Đường dẫn đường tệp (Path): Ví dụ C:\\TinHoc4\\BaiTap.docx. Cho biết vị trí chính xác của tệp.\n- Nén tệp tin (.zip, .rar): Gom nhiều tệp gom lại làm nhỏ dung lượng để gửi đi nhanh hơn.\n- Quyền truy cập tệp tin:\n  + Quyền Read (Đọc): Chỉ được mở xem, không được chỉnh sửa.\n  + Quyền Write (Ghi): Được chỉnh sửa, xóa và thay thế dữ liệu.',
    infographicUrl: '📁 CÂY THƯ MỤC: Ngăn nắp, gọn gàng | 📍 PATH: Bản đồ tìm tệp chuẩn xác\n🤐 NÉN FILE (.zip, .rar): Thu nhỏ nhanh gọn | 🛡️ READ-WRITE: Quyền hạn kiểm soát văn minh!',
    illustrationUrl: '🎨 Minh họa: Cây thư mục 3D màu vàng xếp chồng như các ngăn tủ xinh xắn.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-5',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 1. Máy tính căn bản (Computing Fundamentals)',
    topicName: 'Chương 2. Hệ thống lưu trữ và quản lý tập tin',
    lessonNumber: 5,
    title: 'Bài 5: Lưu trữ cục bộ & Lưu trữ trực tuyến',
    shortDescription: 'Phân biệt thiết bị lưu trữ cục bộ (HDD, SSD, thẻ SD) với không gian mạng trực tuyến (Google Drive, OneDrive) và cách kết nối an toàn.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 5:\n- Lưu trữ cục bộ (Local Storage): Dữ liệu ghi trên thiết bị vật lý nằm ngay trong máy hoặc cắm dây trực tiếp như ổ cứng HDD, thẻ SD, USB flash.\n- Lưu trữ điện toán đám mây (Cloud Storage): Dữ liệu gửi lên không gian lưu trữ từ xa trên Internet như Google Drive, Microsoft OneDrive, Dropbox.\n- Ưu điểm của Cloud: Truy cập dữ liệu mọi lúc mọi nơi bằng mọi thiết bị thông minh chỉ cần có sóng Internet; an toàn đề phòng máy tính hư hỏng.',
    infographicUrl: '💾 LƯU TRỮ CỤC BỘ: HDD, USB, Thẻ nhớ cắm chạy vù vù\n☁️ LƯU TRỮ ĐÁM MÂY: Google Drive, OneDrive - Xem mọi nơi, cất mọi thời!',
    illustrationUrl: '🎨 Minh họa: Chiếc USB 3D bạc phối xanh sáng lấp lánh đang truyền dữ liệu lên trời mây.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-6',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 3. Trình duyệt Web và giao tiếp số',
    lessonNumber: 6,
    title: 'Bài 6: Khám phá trình duyệt Web và Gmail',
    shortDescription: 'Cài đặt Firefox, Chrome và tìm hiểu các tính năng: Autofill, Security, Search Engine, AutoComplete, AutoCorrect và đăng ký tài khoản Gmail.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 6:\n- Cài đặt thiết lập trình duyệt:\n  + Autofill: Tự động điền nhanh họ tên, địa chỉ vào biểu mẫu giúp bé đỡ mất thời gian gõ đi gõ lại.\n  + Security and Privacy: Chế độ bảo mật chặn mã độc, bảo mật danh tính trực tuyến.\n  + AutoComplete: Tự gợi ý hoàn thiện từ đang gõ dở trên thanh tìm kiếm.\n  + AutoCorrect: Sửa lỗi chính tả tự động.\n- Gmail: Tạo địa chỉ email an toàn của riêng em dưới sự hỗ trợ giám sát của phụ huynh.',
    infographicUrl: '🌐 TRÌNH DUYỆT XỊN: Chrome, Firefox | ✍️ AUTOFILL: Điền dữ liệu một click\n🔒 AN TOÀN TRỰC TUYẾN: Chặn virus độc hại | ✉️ GMAIL: Cổng liên thông trường lớp!',
    illustrationUrl: '🎨 Minh họa: Quả địa cầu Chrome 3D sặc sỡ quay tròn ôm quanh phong bì thư Gmail.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-7',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 3. Trình duyệt Web và giao tiếp số',
    lessonNumber: 7,
    title: 'Bài 7: Lịch kỹ thuật số & Quản lý tác vụ',
    shortDescription: 'Tìm hiểu về Outlook Calendar, Google Calendar, cách lập cuộc hẹn (Appointment), thiết lập lặp lại và chia sẻ lịch trình tới bạn học.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 7:\n- Lịch kỹ thuật số (Digital Calendar): Google Calendar, Microsoft Outlook giúp quản lý học tập gọn gàng.\n- Các khái niệm cốt lõi:\n  + Cuộc hẹn (Appointment): Sự nghiệp học tập, dã ngoại được ghi nhớ giờ giấc cụ thể.\n  + Cuộc hẹn định lặp định kỳ (Recurring Appointment): Hoạt động diễn ra lặp lại đều đặn mỗi tuần (ví dụ thời khóa biểu tiết Tin học thứ Hai hàng tuần).\n  + Chia sẻ lịch: Gửi lịch dã ngoại lớp học cho các bạn cùng biết hẹn.\n  + Task (Tác vụ): Các đầu việc tự nhắc nhở cần hoàn thành (ví dụ như "Làm bài tập IC3").',
    infographicUrl: '📅 LỊCH SỐ Google & Outlook: Khỏi lo nhớ nhớ quên quên!\n🔁 RECURRING: Lặp lại đều tăm tắp hằng tuần | 🚀 TASK: Checklist tích xanh khi hoàn tất!',
    illustrationUrl: '🎨 Minh họa: Tờ lịch block 3D nghiêng 45 độ rục rỡ có đánh dấu ngôi sao vàng.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-8',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 3. Trình duyệt Web và giao tiếp số',
    lessonNumber: 8,
    title: 'Bài 8: Giao tiếp thư điện tử chuyên nghiệp',
    shortDescription: 'Quy tắc giao tiếp Email, hiểu rõ các khái niệm To, Cc, Bcc, Subject, chữ ký, File đính kèm để liên lạc lịch sự.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 8:\n- Các thành phần quan trọng của một Email thư điện tử:\n  + To (Người nhận chính): Điền địa chỉ của người chịu trách nhiệm chính đọc thư.\n  + Cc (Carbon Copy - Đồng gửi): Gửi bản sao cho những người cần nắm thông tin giám sát rộng đường.\n  + Bcc (Blind Carbon Copy - Gửi bí mật): Gửi bản sao đặc biệt không cho những người nhận khác trong nhóm biết có sự tồn tại của người nhận này.\n  + Subject (Tiêu đề): Tên khái quát ngắn gọn lý do gửi thư dứt khoát.\n  + Body (Nội dung chính): Chứa lời xưng hô, nội dung bày tỏ lịch sự, lời chào cuối thư.\n  + Chữ ký (Signature) & Tệp đính kèm (Attachment - file chia sẻ hình, Word, Excel).',
    infographicUrl: '📧 SOẠN THƯ CHUẨN: 👥 To: Nhận chính | 📋 CC: Kèm theo rõ ràng\n🤫 BCC: Bản gửi bí ẩn tinh tế | ✍️ SIGNATURE: Chữ ký độc quyền thương hiệu cá nhân!',
    illustrationUrl: '🎨 Minh họa: Cánh chim thư bồ câu trắng 3D ngậm phong bao bạc chứa tài liệu dán kín.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-9',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 3. Trình duyệt Web và giao tiếp số',
    lessonNumber: 9,
    title: 'Bài 9: Gặp mặt trực tuyến & Hội nghị học đường',
    shortDescription: 'Thực hành các cuộc gọi qua Internet VoIP, làm thảo luận Video Conferencing với Zoom, Teams, Skype, sử dụng Forum và Live Streaming.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 9:\n- Giao tiếp thời gian thực trực tuyến:\n  + Cuộc gọi qua Internet VoIP (Voice over IP): Tiết kiệm cước phí viễn thông truyền thống.\n  + Thảo luận Video họp trực tuyến: Zoom, Skype, Microsoft Teams cho lớp học ảo tụ họp mọi phương trời dẹp tan khoảng cách.\n  + Diễn đàn (Forum): Nơi gửi bài đăng thảo luận không theo thời gian thực để mọi người bình luận trao đổi kiến thức sâu sắc.\n  + Live Streaming: Phát hình trực tiếp thực tế qua sóng mạng truyền thông để hàng ngàn bạn nhỏ cùng theo dõi.',
    infographicUrl: '📞 VoIP: Điện thoại sóng mạng trong lành | 💻 VIDEO MEETING: Zoom & Teams mượt mà\n🗣️ FORUM: Diễn đàn học thuật rôm rả | 🎥 LIVE STREAMING: Sóng truyền trực tiếp nét căng!',
    illustrationUrl: '🎨 Minh họa: Chú tai nghe 3D kèm mic màu hồng pastel đặt nghiêng bên quả cầu pha lê.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-10',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 3. Cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Quy tắc ứng xử và danh tính số',
    lessonNumber: 10,
    title: 'Bài 10: Danh tính kĩ thuật số trên không gian mạng',
    shortDescription: 'Phân tích sự khác biệt giữa danh tính trực tuyến cá nhân và danh tính nghề nghiệp, cách dùng biệt danh Alias bảo mật an toàn.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 10:\n- Danh tính số (Digital Identity): Toàn bộ thông tin cá nhân và vết chân hoạt động của em lưu lại trên mạng.\n- Phân nhóm danh tính:\n  + Danh tính cá nhân (Personal Profile): Chia sẻ ảnh dã ngoại, sở thích với người thân, bạn bè thân thiết.\n  + Danh tính học tập/nghề nghiệp (Professional Profile): Trưng bày thành tích, bài làm xuất sắc, dự án khoa học chỉn chu để thầy cô đánh giá cực cao.\n- Alias (Biệt danh bí danh): Tên giả đặt trên mạng giúp bé bảo vệ thông tin gốc tránh bị kẻ xấu mò tìm quấy rầy.',
    infographicUrl: '👤 IDENTITY ONLINE: 🏡 Cá nhân ấm cúng 🆚 🏫 Học đường trang nghiêm\n🛡️ ALIAS (Biệt danh bảo bối): Không lo rò rỉ dữ liệu thật ra ngoài!',
    illustrationUrl: '🎨 Minh họa: Đầu người hoạt hình 3D đeo kính râm dán râu giả vô cùng vui tươi rực rỡ.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-11',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 3. Cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 4. Quy tắc ứng xử và danh tính số',
    lessonNumber: 11,
    title: 'Bài 11: Quy tắc ứng xử văn minh và an toàn số',
    shortDescription: 'Hiểu luật Netiquette, phòng tránh vấn nạn bắt nạt mạng, lừa đảo Catfishing, trạng thái lo âu FOMO và cập nhật xu hướng công nghệ.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 11:\n- Netiquette: Quy tắc lịch thiệp ứng xử, giữ hòa khí tế nhị khi viết bình luận hay nhắn tin trên mạng.\n- Vấn nạn và cách ứng phó:\n  + Catfishing (Giả danh lừa đảo): Kẻ xấu tạo nick giả, ảnh giả để trò chuyện dụ dỗ trẻ em. Hãy cảnh giác cao độ!\n  + FOMO (Fear of Missing Out - Hội chứng sợ bỏ lỡ): Việc nghiện xem mạng liên tục vì lo bạn bè có trò vui mà mình không biết. Nên điều tiết thời gian nghỉ ngơi học tập cân đối.\n- Cách xử trí khi bị bắt nạt qua mạng: Tuyệt đối không đôi co, chụp màn hình lưu bằng chứng cụ thể và lập tức cấp báo cho ba mẹ.',
    infographicUrl: '🤝 NETIQUETTE: Cư xử lịch thiệp số một | 🐱 CATFISHING: Tránh xa bẫy giả danh\n🚫 FOMO: Gấp ipad, đi dạo thể dục cùng bạn bè | 📸 CHỤP MÀN HÌNH: Lưu vết báo thầy cô!',
    illustrationUrl: '🎨 Minh họa: Biển báo chấm than đỏ 3D nhấp nháy phát sáng bảo vệ trẻ thơ an toàn.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-12',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 3. Cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 5. Tìm kiếm thông tin và cơ sở dữ liệu',
    lessonNumber: 12,
    title: 'Bài 12: Tìm kiếm thông tin & Toán tử Boolean',
    shortDescription: 'Sử dụng các kỹ xảo thu hẹp kết quả tìm kiếm thông qua từ khóa (Keyword) chuẩn và các toán tử AND, OR, NOT lọc kết quả thông thái.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 12:\n- Công cụ tìm kiếm (Search Engines): Google, Microsoft Bing là cánh cổng tri thức khổng lồ.\n- Kỹ thuật lọc kết quả Boolean:\n  + Toán tử AND: Yêu cầu cả hai từ khóa cùng xuất hiện (ví dụ: máy in AND laser), giúp kết quả chính xác cao.\n  + Toán tử OR: Cho phép một trong hai từ khóa có mặt (ví dụ: máy tính OR ipad), tăng độ mở vùng kết quả rộng.\n  + Toán tử NOT / Dấu trừ: Loại trừ từ khóa không mong muốn đi kèm để tránh lạc đề (ví dụ: quả táo NOT điện thoại).',
    infographicUrl: '🔎 TÌM KIẾM BOOSTER:\n➕ AND: Bắt buộc song hành | ➖ NOT: Tránh xa phiền phức\n🔀 OR: Một trong hai đều được duyệt - Trở thành nhà thông thái truy tìm!',
    illustrationUrl: '🎨 Minh họa: Chiếc kính lúp 3D phóng to một mảnh bản đồ kho báu cổ kính.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-13',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 3. Cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 5. Tìm kiếm thông tin và cơ sở dữ liệu',
    lessonNumber: 13,
    title: 'Bài 13: Trang Web tĩnh, trang Web động và cơ sở dữ liệu',
    shortDescription: 'Phân tích sự khác nhau giữa trang Web tĩnh và Web động, luồng yêu cầu phản hồi từ máy chủ và cách điền biểu mẫu Form trực tuyến.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 13:\n- Trang Web tĩnh (Static Web): Nội dung cố định từ trước, mọi người mở ra đều thấy chữ và ảnh hoàn toàn giống nhau (được xếp từ file HTML đơn giản).\n- Trang Web động (Dynamic Web): Nội dung thay đổi sống động tùy theo yêu cầu của học sinh, thời gian hay dữ liệu lịch sử (ví dụ trang web xem phim, trang thương mại, lms này).\n- Cơ chế Client-Server:\n  + Request (Yêu cầu): Học sinh điền tên vào biểu mẫu ấn gửi lên máy chủ.\n  + Response (Phản hồi): Máy chủ truy vấn Cơ sở dữ liệu và trả về kết quả cá thể hóa cụ thể mượt mà.',
    infographicUrl: '🕸️ WEB TĨNH: Giấy báo tường cố định 🆚 WEB ĐỘNG: Hoạt hình biến ảo cực ngầu\n📥 REQUEST: Điền Form gửi lệnh | 📤 RESPONSE: Máy chủ hồi đáp triệt để tài nguyên!',
    illustrationUrl: '🎨 Minh họa: Server rack máy chủ 3D màu bạc chứa các hộc đèn led nhấp nháy liên hoàn.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-14',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 6. Microsoft Office căn bản',
    lessonNumber: 14,
    title: 'Bài 14: Những thao tác biên tập chung trong bộ Office',
    shortDescription: 'Làm chủ các thao tác hữu ích hỗ trợ làm bài nhanh: Undo, Redo, Repeat, Cut, Copy, Paste và phân chia rạch ròi giữa lệnh Save và Save As.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 14:\n- Quy tắc soạn thảo văn phòng chuẩn mực:\n  + Undo (Ctrl + Z): Hủy bỏ hành động vừa làm sai để quay lại lúc trước tức khắc.\n  + Redo (Ctrl + Y): Hủy bỏ lệnh vừa Undo để phục hồi.\n  + Repeat: Lặp lại hành động gõ phím vừa thực hiện.\n  + Cut (Ctrl + X) / Copy (Ctrl + C) / Paste (Ctrl + V): Sắp đặt tài liệu di chuyển đoạn văn thích dụng.\n- Bản chất lưu trữ:\n  + Save (Ctrl + S): Ghi đè cập nhật đè nội dung mới lên tệp tin đang mở.\n  + Save As (F12): Lưu tệp tin thành một bản sao mới kính coong, định dạng khác hoặc vị trí khác.',
    infographicUrl: '⌨️ OFFICE SHORTCUTS:\n↩️ UNDO: Ctrl+Z phục hồi quá khứ | 🔁 REDO: Ctrl+Y tiến tới tương lai\n📂 SAVE: Ctrl+S đè cũ | 📝 SAVE AS: Nhân bản tệp mới to tanh bành!',
    illustrationUrl: '🎨 Minh họa: Chiếc kéo 3D và khay giấy dán hồ hoạt hình nhí nhảnh.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-15',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 6. Microsoft Office căn bản',
    lessonNumber: 15,
    title: 'Bài 15: Cài đặt khóa mật khẩu, AutoSave và in ấn',
    shortDescription: 'Mã hóa tài liệu bằng Password bảo vệ nội dung, bật tính năng AutoSave phòng rủi ro mất điện và chuẩn bị thiết lập trang in Print.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 15:\n- Bảo vệ tài liệu (Document Protection): Thiết lập mật khẩu (Encrypt with Password) tại mục File > Info. Người khác không biết mật khẩu sẽ không thể tò mò xem được.\n- AutoSave / AutoRecover: Cho phép phần mềm tự động sao lưu dự phòng bài làm của em sau mỗi 10 phút. Nếu máy chẳng may sập nguồn, bé vẫn lấy lại được bài vẽ dễ dàng!\n- Thiết lập in ấn (Print Layout):\n  + Margin: Căn độ lề trang cách ranh giới.\n  + Orientation: Khổ dọc Portrait hoặc khổ ngang Landscape bắt mắt.',
    infographicUrl: '🔒 PASSWORD: Điền mã khóa ngực vàng bảo mật | ⏱️ AUTOSAVE: Tự lưu bài chu toàn vô hại\n🖨️ PRINT: Chỉnh lề tinh tươm -> Cầm bản xịn trên tay!',
    illustrationUrl: '🎨 Minh họa: Ổ khóa vàng ròng 3D khổng lồ ôm chặt lấy mộc file Word phát ra vầng hào quang.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-16',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 7. Bảng tính Microsoft Excel nâng cao',
    lessonNumber: 16,
    title: 'Bài 16: Làm quen sổ tính Workbook và Worksheet',
    shortDescription: 'Nắm bắt các khái niệm bảng tính Excel, cấu trúc hàng cột, địa chỉ ô tính kết hợp, ô kích hoạt Active Cell, thanh Formula Bar.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 16:\n- Bản chất Microsoft Excel:\n  + Workbook (Sổ tính): Một tệp tin Excel hoàn chỉnh chứa nhiều trang làm việc.\n  + Worksheet (Trang tính): Một lưới kẻ ô chứa bảng dữ liệu.\n- Thành viên lưới hàng cột bảng tính:\n  + Ô tính Cell: Giao diện giao thoa giữa Cột (A, B, C...) và Hàng (1, 2, 3...). Tên ô: địa chỉ cột đặt trước, hàng đặt sau (Ví dụ: B4).\n  + Active Cell: Ô đang được viền lề xanh nổi bật để bé sẵn sàng gõ chữ.\n  + Name Box (Hộp địa chỉ): Chứa địa chỉ ô hiện hành.\n  + Formula Bar (Thanh công thức): Nơi hiển thị công thức thuật toán sâu chuỗi.',
    infographicUrl: '📊 EXCEL BASEMENT:\n📚 WORKBOOK: Cả quyển sách 🆚 📄 WORKSHEET: Từng trang giấy kẻ ô\n🟩 ACTIVE CELL: Ô xanh viền chuẩn bị nhập liệu | 📍 NAME BOX: Định vị hành tọa ô!',
    illustrationUrl: '🎨 Minh họa: Chiếc bảng Excel 3D kẻ lưới màu xanh lá đầy khoa học hiện đại.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-17',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 7. Bảng tính Microsoft Excel nâng cao',
    lessonNumber: 17,
    title: 'Bài 17: Phân loại dữ liệu và định dạng ô tính Excel',
    shortDescription: 'Phân loại 3 nhóm dữ liệu Text, Value, Formula và các phương pháp căn lề Alignment, đổi Font phông nền, đổi màu dữ liệu số.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 17:\n- 3 Kiểu dữ liệu đưa vào Excel:\n  + Thư mục Text Entry (Văn bản): Mặc định tự căn theo lề trái.\n  + Số mục Value (Giá trị): Mặc định tự động nép căn lề phải để dễ thẳng hàng tính toán cộng trừ.\n  + Công thức Formula (Bắt đầu với dấu bằng =): Ví dụ =A1+B1, để Excel lập biên lập máy tính.\n- Thiết lập định dạng chuyên nghiệp:\n  + Căn lề dọc/ngang (Alignment: Top, Center, Bottom, Left, Right).\n  + Định dạng loại số: Hiển thị tiền tệ $, số thập phân, phần trăm % rõ ràng.',
    infographicUrl: '🔢 DỮ LIỆU EXCEL:\n✍️ TEXT: Chữ tự trái | 🔢 VALUE: Số tự phải | 🟰 FORMULA: Công thức khơi mào bằng dấu bằng =\n🎨 FORMAT CARD: Căn thẳng tắp, đổi màu phông lung linh!',
    illustrationUrl: '🎨 Minh họa: Biểu đồ cột 3D nhiều sắc màu tươi tắn nhô cao lên từ mặt giấy Excel.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-18',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 7. Bảng tính Microsoft Excel nâng cao',
    lessonNumber: 18,
    title: 'Bài 18: Thao tác trang tính & Khám phá Macro',
    shortDescription: 'Kỹ năng quản lý Sheet: đổi tên, thêm mới, hóa kiếp xóa bỏ hoặc di dời; thấu tỏ khái niệm Macro tự động và kích hoạt Developer tab.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 18:\n- Quản lý trang tính (Sheet Management): Phải chuột lên Sheet Tab để Rename (Đổi tên), Insert (Thêm mới), Delete (Xóa hẳn), Move or Copy (Chuyển trang).\n- Macro trong Excel: Một công cụ ghi lại chuỗi thao tác lặp đi lặp lại để em kích hoạt chạy hàng loạt bằng 1 phím tắt, giúp tiết kiệm thời gian.\n- Developer tab (Thẻ nhà phát triển): Thẻ ẩn mặc định, cần bật trong hệ thống Option của Excel để lập trình và kích hoạt bảo mật chống virus trong tệp đính kèm Macro dính bẫy độc hại.',
    infographicUrl: '📁 SHEET MANAGER: Nhân bản di dời sheet mượt mắt\n🤖 MACRO: Robot tự động hóa việc nhàm chán | ⚙️ DEV TAB: Thần bùa lập trình gia tốc!',
    illustrationUrl: '🎨 Minh họa: Chiếc bánh răng răng truyền 3D kết nối các trang lưới xanh lục.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-19',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 8. Soạn thảo văn bản MS Word nâng cao',
    lessonNumber: 19,
    title: 'Bài 19: Định dạng nhanh văn bản bằng Style',
    shortDescription: 'Hiểu về ứng dụng thực tiễn của khái niệm Style trong thiết kế văn bản, sử dụng Quick Styles Gallery và cách sửa đổi Modify Styles.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 19:\n- Style (Kiểu định dạng có sẵn): Tập hợp toàn bộ phông chữ, kích thước, màu sắc và giãn dòng đã được các nhà thiết kế tạo sẵn.\n- Lợi ích của Style: Giúp áp dụng kiểu đồng loạt lên sách vở cực nhanh, giữ sự trang trọng thống nhất cho đồ án của em.\n- Quick Styles Gallery: Thư viện hiển thị nằm ngay trên thẻ Home giúp Click chọn siêu nhanh.\n- Modify Style: Nhấp phải chuột lên mẫu Style chọn Modify để đổi phông chữ và kích thước theo sở thích cá nhân.',
    infographicUrl: '🎨 STYLE MANAGER:\n✨ QUICK STYLES GALLERY: Đắp khuôn mẫu tuyệt tác trong 1 nốt nhạc!\n🛠️ MODIFY: Sửa một lần -> Toàn bộ đề mục tự ngóc đầu đổi dạng siêu ngầu!',
    illustrationUrl: '🎨 Minh họa: Giá cọ vẽ sơn màu hồng 3D sặc sỡ phủ đầy văn thô.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-20',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 8. Soạn thảo văn bản MS Word nâng cao',
    lessonNumber: 20,
    title: 'Bài 20: Chèn Header-Footer & Tạo mục lục tự động',
    shortDescription: 'Gán văn đề ở đầu trang (Header), cuối trang (Footer), đánh số trang tự động và xây dựng Table of Contents cho bài báo cáo trôi chảy.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 20:\n- Tiêu đề đầu và chân trang (Header & Footer):\n  + Header: Chữ ghi nhớ ở đầu trang dải lặp lại xuyên suốt.\n  + Footer: Chữ ở chân trang, hay kết hợp đánh số trang tự động (Page Number).\n- Table of Contents (Mục lục tự động): Giúp tự động liệt kê tất cả các tên chương đề mục lớn nhỏ có trong bài kèm số trang của chúng. Thầy cô chỉ cần rà lướt qua hoặc Ctrl+Click để mở thẳng trang cần đọc cực hay. Có thể Update Table mỗi khi bé viết thêm bài.',
    infographicUrl: '📜 HEADER-FOOTER: Khung viền văn sỹ chuyên nghiệp\n🔝 ĐÁNH SỐ TRANG: Tự chạy tăng dần | 📋 TABLE OF CONTENTS: Bản đồ toàn diện rà sách!',
    illustrationUrl: '🎨 Minh họa: Cuộn giấy vàng cổ điển 3D cuộn tròn xòe ra mục lục lục bảo khoa học.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-21',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 8. Soạn thảo văn bản MS Word nâng cao',
    lessonNumber: 21,
    title: 'Bài 21: Theo dõi các chỉnh sửa với Track Changes',
    shortDescription: 'Làm việc đồng tác giả, phát hiện nét gạch ngang (chữ bị xóa), gạch chân (chữ thêm) và cách xem All/Simple/No Markup, Accept/Reject.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 21:\n- Track Changes: Tính năng ghi chú lưu vết toàn bộ sửa đổi của người khác đóng góp vào bài viết của em.\n- Các định dạng hiển thị sự thay đổi:\n  + Chữ bị xóa: Sẽ bị gạch ngang bôi đỏ (Strikethrough).\n  + Chữ được thêm vào: Sẽ được gạch chân bôi màu (Underline).\n- 4 Lựa chọn hiển thị Markup:\n  + Simple Markup (Chỉ dẫn đỏ lề).\n  + All Markup (Hiện rõ mồn một các vết chém).\n  + No Markup (Nhìn sạch sẽ như đã sửa xong).\n  + Original (Quay về bản trắng sơ khai trước khi sửa).\n- Thao tác gật đầu duyệt: Click chọn Accept (Đồng ý sửa đổi) hoặc Reject (Từ chối, phục hồi cũ).',
    infographicUrl: '🖊️ TRACK CHANGES: Máy camera ghi vết thần kỳ!\n📌 ALL MARKUP: Xem tần tật | 📌 SIMPLE: Gọn dường mắt\n✔️ ACCEPT: Đồng chí duyệt sửa | ❌ REJECT: Gạt đi lấy lại cũ!',
    illustrationUrl: '🎨 Minh họa: Chiếc bút lông chim màu đỏ 3D đang quẹt những nét gạch lưu vết mềm mại.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-22',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 3. Cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 9. Sở hữu trí tuệ, Bản quyền và Trình chiếu',
    lessonNumber: 22,
    title: 'Bài 22: Sở hữu trí tuệ, Bản quyền & Chống đạo văn',
    shortDescription: 'Nhận thức khái niệm sở hữu trí tuệ (Intellectual Property), đăng ký bản quyền thương mại (Copyright) và quy tắc tránh đạo văn (Plagiarism).',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 22:\n- Sở hữu trí tuệ (Intellectual Property): Các phát minh, bài thơ, phần mềm của trí óc sáng tạo con người.\n- Bản quyền (Copyright ©): Quyền hợp pháp ngăn cản người khác sao chép tác phẩm bất hợp pháp mà chưa được cho phép.\n- Plagiarism (Đạo văn): Hành vi ăn cắp ý tưởng, bài viết, công sức của người khác đem dính nhãn tên mình để nộp lấy điểm học tập. Đây là vi phạm đạo đức nghiêm trọng. Bé cần trích dẫn (Citation) nguồn rõ ràng để thể hiện lòng tôn trọng!',
    infographicUrl: '🛡️ INTELLECTUAL PROPERTY: Quyền tài trí phát kiến | © COPYRIGHT: Bản quyền giữ tôn nghiêm\n🚫 NO PLAGIARISM: Chống đạo văn ăn cắp tri thức - Trích dẫn nguồn để bé sống xanh!',
    illustrationUrl: '🎨 Minh họa: Khớp khiên giáp đỏ 3D vàng ôm chữ C bảo vệ bản quyền rực rỡ.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-23',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 3. Cuộc sống trực tuyến (Living Online)',
    topicName: 'Chương 9. Sở hữu trí tuệ, Bản quyền và Trình chiếu',
    lessonNumber: 23,
    title: 'Bài 23: Tài nguyên công cộng & Giấy phép Creative Commons',
    shortDescription: 'Nhận diện tài nguyên phạm vi công cộng (Public Domain) miễn phí và phân biệt các loại giấy phép thông dụng: CC BY, CC BY-SA, CC BY-NC...',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 23:\n- Phạm vi công cộng (Public Domain): Các tác phẩm hết hạn bảo trì hoặc hiến dâng vô điều kiện, bé có thể sao chép, chế tác hoàn toàn miễn phí.\n- Giấy phép liên doanh Creative Commons (Giấy phép CC):\n  + CC BY (Ghi công): Có thể dùng chế tác nhưng phải ghi rõ tên tác giả.\n  + CC BY-SA (Chia sẻ tương tự): Tác phẩm phái sinh phải dùng chung giấy phép cũ.\n  + CC BY-NC (Phi thương mại): Được dùng học tập, cấm dùng bán lấy tiền.\n  + CC BY-ND (Không phái sinh): Chỉ được dùng nguyên bản gốc, cấm chế cháo cắt ghép.',
    infographicUrl: '🆓 PUBLIC DOMAIN: Xài tẹt ga vô tư | 🏷️ CC CREATIVE COMMONS: Giấy phép chia sẻ số\n🧑‍🎨 CC BY: Ghi nguồn công lao | 🚫 CC BY-NC: Không buôn thương mại!',
    illustrationUrl: '🎨 Minh họa: Hai bàn tay 3D xanh lá ôm giữ nâng niu biểu tượng chữ C thon thả.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-24',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 9. Sở hữu trí tuệ, Bản quyền và Trình chiếu',
    lessonNumber: 24,
    title: 'Bài 24: Thiết kế trình chiếu & Hiệu ứng hoạt hình',
    shortDescription: 'Quản lý Selection Pane đổi tên các vật mẫu, ẩn/hiện, chọn lọc các nhóm hiệu ứng tinh hoa Entrance, Exit và Emphasis, Motion Paths.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 24:\n- Giao diện thiết kế hoạt hình trong PowerPoint:\n  + Selection Pane (Ngăn lựa chọn): Bản liệt kê toàn bộ tên đồ vật, chữ, hình có trên Slide. Giúp em đổi tên vật để không nhầm, ẩn bớt vật vướng víu hoặc khóa sập di dời trái phép.\n  + Khối hiệu ứng sinh động mượt đầu:\n    * Entrance (Ngôi sao xanh): Cách đối tượng tiến chào bước vào sân khấu.\n    * Exit (Ngôi sao đỏ): Cách đối tượng rút chào bay biến mất.\n    * Emphasis (Ngôi sao vàng): Hiệu ứng rung bần bật, nhấp nháy làm điểm nhấn lôi cuốn người coi.',
    infographicUrl: '🎯 SELECTION PANE: Bản điều phối đồ vật 3D | 🟢 ENTRANCE: Tiến chào rạng rỡ\n🔴 EXIT: Lùi bước bay tiêu | 🟡 EMPHASIS: Rung động tập trung sự để ý gắt gao!',
    illustrationUrl: '🎨 Minh họa: Bảng vẽ màu PowerPoint 3D nhô ra các chấm tròn chuyển động sặc sỡ.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc'
  },
  {
    id: 'lic3-4-25',
    programType: 'IC3SPARK',
    grade: 4,
    moduleName: 'Module 2. Các ứng dụng chính (Key Applications)',
    topicName: 'Chương 9. Sở hữu trí tuệ, Bản quyền và Trình chiếu',
    lessonNumber: 25,
    title: 'Bài 25: Tùy chỉnh hoạt hình nâng cao & Slide Transitions',
    shortDescription: 'Căn chỉnh ngăn quản lý Animation Pane, cài thời lượng Timing: Start, After/With Previous, chèn nhạc nền, nút Trigger và Slide Transitions.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu học tập Bài 25:\n- Làm chủ thời lượng hoạt hình nâng cao:\n  + Animation Pane: Ngăn chứa thứ tự chạy từ câu 1 đến câu cuối.\n  + Timing: Start (On Click - theo click chuột; With Previous - chạy song hành đồng thời; After Previous - chạy nối đuôi từ từ sau khi vật trước dừng lại).\n  + Duration: Quãng thời gian chuyển động nhanh hay chậm.\n  + Delay: Sau bao nhiêu lâu chuẩn bị mới bấm nổ súng chạy.\n  + Trigger: Thiết lập đặc biệt, hiệu ứng chỉ bắt đầu khi học sinh nhấp chuột vào đúng vật định vị.\n  + Slide Transitions: Hiệu ứng chuyển động mượt mà khi đổi trang slide.',
    infographicUrl: '⏳ ANIMATION PANE: Trọng tài thời lượng | ⚡ START OPTIONS: On click, With, After\n🔔 TRIGGER: Nhấp đúng điểm nổ | 🚀 SLIDE TRANSITION: Đổi trang lật slide mượt bay!',
    illustrationUrl: '🎨 Minh họa: Chiếc đồng hồ cát bọc vàng 3D đang thỏ thả chảy giữa vùng mây tím.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lic3-exam-hk1-g3',
    programType: 'Kết nối tri thức với cuộc sống',
    grade: 3,
    topicName: 'Kiểm tra định kỳ Cuối HKI',
    lessonNumber: 1,
    title: 'Kiểm tra định kỳ Cuối HKI',
    shortDescription: 'Bài kiểm tra định kỳ học kỳ I môn Tin học nhằm đánh giá toàn diện các kiến thức đã học.',
    videoUrl: '',
    pdfUrl: 'Tài liệu hướng dẫn:\n- Đánh giá năng lực sử dụng máy tính học kỳ I.\n- Trọng tâm lý thuyết và thực hành cơ bản.',
    infographicUrl: '📋 ÔN TẬP: Khái niệm thông tin, các bộ phận của máy tính, kỹ năng sử dụng chuột và bàn phím.',
    illustrationUrl: '🎨 Minh họa: Phòng máy tính nhà trường sẵn sàng cho kỳ kiểm tra.',
    colorTheme: 'pastel-blue',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'lic3-exam-hk2-g3',
    programType: 'Kết nối tri thức với cuộc sống',
    grade: 3,
    topicName: 'Kiểm tra định kỳ Cuối HKII',
    lessonNumber: 1,
    title: 'Kiểm tra định kỳ Cuối HKII',
    shortDescription: 'Bài kiểm tra định kỳ học kỳ II môn Tin học đánh giá tổng kết kiến thức cả năm học.',
    videoUrl: '',
    pdfUrl: 'Tài liệu hướng dẫn:\n- Tổng kết nội dung học kỳ II.\n- Kỹ năng xử lý văn bản, trình chiếu cơ bản và thuật toán đơn giản.',
    infographicUrl: '📋 ÔN TẬP: Tạo thư mục, vẽ hình cơ bản, lập trình kéo thả Scratch đơn giản và an toàn internet.',
    illustrationUrl: '🎨 Minh họa: Các bạn nhỏ hân hoan hoàn thành xuất sắc bài kiểm tra cuối năm.',
    colorTheme: 'pastel-pink',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'lic3-exam-hk1-g4',
    programType: 'Kết nối tri thức với cuộc sống',
    grade: 4,
    topicName: 'Kiểm tra định kỳ Cuối HKI',
    lessonNumber: 1,
    title: 'Kiểm tra định kỳ Cuối HKI',
    shortDescription: 'Bài kiểm tra định kỳ học kỳ I môn Tin học Lớp 4 đánh giá kỹ năng lý thuyết và thực hành phần cứng, phần mềm.',
    videoUrl: '',
    pdfUrl: 'Tài liệu hướng dẫn:\n- Khảo sát các kỹ năng sử dụng trình duyệt web, tìm kiếm thông tin.\n- Soạn thảo văn bản nâng cao.',
    infographicUrl: '📋 ÔN TẬP: Tìm kiếm thông tin trên internet, trình bày trang soạn thảo văn bản, căn lề và định dạng bảng biểu.',
    illustrationUrl: '🎨 Minh họa: Bản đồ tư duy ôn tập học kỳ I trực quan sinh động.',
    colorTheme: 'pastel-yellow',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'lic3-exam-hk2-g4',
    programType: 'Kết nối tri thức với cuộc sống',
    grade: 4,
    topicName: 'Kiểm tra định kỳ Cuối HKII',
    lessonNumber: 1,
    title: 'Kiểm tra định kỳ Cuối HKII',
    shortDescription: 'Bài kiểm tra định kỳ học kỳ II môn Tin học Lớp 4 đánh giá tổng hợp phần trình chiếu và lập trình Scratch cơ bản.',
    videoUrl: '',
    pdfUrl: 'Tài liệu hướng dẫn:\n- Đánh giá khả năng thiết kế trang trình chiếu MS PowerPoint.\n- Xây dựng chương trình Scratch hoạt cảnh chuyển động.',
    infographicUrl: '📋 ÔN TẬP: Thiết kế slide thuyết trình, tạo hiệu ứng chuyển động và các lệnh lặp, rẽ nhánh trong Scratch.',
    illustrationUrl: '🎨 Minh họa: Chú mèo Scratch nhảy múa chào mừng kỳ thi học kỳ II thành công.',
    colorTheme: 'pastel-purple',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'lic3-exam-hk1-g5',
    programType: 'Kết nối tri thức với cuộc sống',
    grade: 5,
    topicName: 'Kiểm tra định kỳ Cuối HKI',
    lessonNumber: 1,
    title: 'Kiểm tra định kỳ Cuối HKI',
    shortDescription: 'Bài kiểm tra định kỳ học kỳ I môn Tin học Lớp 5 đánh giá kiến thức mạng máy tính, email và soạn thảo nâng cao.',
    videoUrl: '',
    pdfUrl: 'Tài liệu hướng dẫn:\n- Kỹ năng gửi và nhận thư điện tử (Email) an toàn.\n- Quản lý tệp tin và thư mục trên đám mây.',
    infographicUrl: '📋 ÔN TẬP: Cấu trúc thư điện tử, quy tắc ứng xử trên mạng xã hội, chia sẻ tệp tin và tìm kiếm thông tin học tập nâng cao.',
    illustrationUrl: '🎨 Minh họa: Các bạn học sinh đang gửi email thảo luận nhóm sôi nổi.',
    colorTheme: 'pastel-green',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'lic3-exam-hk2-g5',
    programType: 'Kết nối tri thức với cuộc sống',
    grade: 5,
    topicName: 'Kiểm tra định kỳ Cuối HKII',
    lessonNumber: 1,
    title: 'Kiểm tra định kỳ Cuối HKII',
    shortDescription: 'Bài kiểm tra định kỳ học kỳ II môn Tin học Lớp 5 đánh giá tổng kết thuật toán, cấu trúc dữ liệu và lập trình Scratch phức tạp.',
    videoUrl: '',
    pdfUrl: 'Tài liệu hướng dẫn:\n- Đánh giá khả năng phân tích và thiết kế thuật toán.\n- Viết chương trình Scratch vẽ hình học đa giác hoặc trò chơi đơn giản.',
    infographicUrl: '📋 ÔN TẬP: Khái niệm thuật toán, biến số, cấu trúc lặp lồng nhau và vẽ hình học nghệ thuật trong Scratch.',
    illustrationUrl: '🎨 Minh họa: Robot lập trình thông minh tự động vẽ các hoa văn đẹp mắt.',
    colorTheme: 'pastel-indigo',
    subject: 'tin_hoc',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  ...GRADE_3_TINHOC_LESSONS,

  // LỚP 4 - GDPT 2018
  ...GRADE_4_TINHOC_LESSONS,

  // LỚP 5 - GDPT 2018
  ...GRADE_5_TINHOC_LESSONS,

  // IC3 SPARK - LỚP 3
  ...IC3_GRADE_3_LESSONS,
  // IC3 SPARK - LỚP 4
  ...IC3_GRADE_4_LESSONS,
  // IC3 SPARK - LỚP 5
  ...IC3_GRADE_5_LESSONS,

  // ==================== MÔN TIẾNG VIỆT (Grade 1 to 5) ====================
  {
    id: 'tv-1',
    programType: 'GDPT2018',
    grade: 1,
    topicName: 'Chủ đề 1: Em lớn khôn từng ngày',
    lessonNumber: 1,
    title: 'Bài 1: Làm quen âm A a và B b',
    shortDescription: 'Học cách phát âm chuẩn, nhận biết mặt chữ viết thường và viết hoa của chữ A và chữ B.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Tiếng Việt Lớp 1:\n- Lớp 1 học cách phát âm âm /a/, âm /b/ và nghép vần ba.\n- Tập tô nét chữ viết thường a, b tròn trịa xinh xắn.',
    infographicUrl: '🅰️ Chữ A: Quả ca, quả na, con gà, bông hoa...\n🅱️ Chữ B: Con bướm, quả bóng, em bé, quả bơ...\n✨ Hãy cùng bé ghép vần b - a - ba thật nhanh nhé!',
    illustrationUrl: '🎨 Minh họa: Em bé cầm bảng chữ cái A B đầy màu sắc vui vẻ dạo chơi vườn hoa.',
    colorTheme: 'pastel-pink',
    subject: 'tieng_viet',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'tv-2',
    programType: 'GDPT2018',
    grade: 2,
    topicName: 'Chủ đề 1: Em yêu trường lớp',
    lessonNumber: 1,
    title: 'Bài 1: Ngày hôm qua đâu rồi?',
    shortDescription: 'Tìm hiểu sâu ý nghĩa bài thơ: Thời gian trôi đi không lấy lại được, chỉ có học tập chăm chỉ mới giữ lại thời gian trong hạt lúa, trang sách.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu Tiếng Việt Lớp 2:\n- Đọc diễn cảm bài thơ chính xác và truyền cảm.\n- Tìm những từ ngữ chỉ thời gian ấm áp, câu thơ nhắn gửi bé siêng năng học bài để gặt hái hoa thơm quả ngọt.',
    infographicUrl: '📅 Ngày hôm qua ở lại:\n🌸 Trong hạt lúa mẹ trồng \n📖 Trong trang vở hồng của bé \n🌟 Thời gian là báu vật, em hãy quý trọng mỗi giây phút học tập nhé!',
    illustrationUrl: '🎨 Minh họa: Cánh đồng lúa vàng óng ả và quyển vở học trò thơm mùi mực mới dưới tia nắng ấm.',
    colorTheme: 'pastel-pink',
    subject: 'tieng_viet',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'tv-3',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 1: Những trải nghiệm thú vị',
    lessonNumber: 1,
    title: 'Bài 1: Ngày gặp lại',
    shortDescription: 'Luyện tập đọc hiểu cảm xúc bồi hồi, sướng vui của các bạn học sinh tiểu học ngày đầu tiên tựu trường gặp lại thầy cô bạn cũ.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu Tiếng Việt Lớp 3:\n- Đọc trôi chảy toàn bài Ngày gặp lại, trả lời các câu hỏi về cảm xúc ngày tựu trường.\n- Viết đoạn văn ngắn 5-7 câu kể về kỷ niệm mùa hè đáng nhớ nhất của em.',
    infographicUrl: '🎒 NGÀY GẶP LẠI:\n🤝 Kết nối bạn bè thân thiết\n🎓 Nghe thầy cô hướng dẫn bài mới\n🌱 Viết mục tiêu nỗ lực học tập cho cả năm học sắp tới!',
    illustrationUrl: '🎨 Minh họa: Trường tiểu học rực rỡ cờ hoa đỏ thắm đón chào học sinh mang balô khấp khởi.',
    colorTheme: 'pastel-pink',
    subject: 'tieng_viet',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'tv-4',
    programType: 'GDPT2018',
    grade: 4,
    topicName: 'Chủ đề 1: Mỗi người một vẻ',
    lessonNumber: 1,
    title: 'Bài 1: Điều kì diệu',
    shortDescription: 'Khám phá bài đọc về sự độc đáo của từng học sinh: Có bạn cao, bạn thấp, bạn vẽ đẹp, bạn hát hay, tất cả tạo nên một thế giới rực rỡ.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu Tiếng Việt Lớp 4:\n- Phân tích thông điệp: Hãy trân trọng nét đẹp và tài năng riêng của bản thân lẫn bạn bè xung quanh.\n- Luyện tập tìm danh từ, động từ chỉ nét tính cách độc đáo.',
    infographicUrl: '🌈 ĐIỀU KỲ DIỆU:\n🌟 Tôn trọng sự khác biệt\n🤝 Đoàn kết, yêu thương vô điều kiện\n🌸 Ai cũng là bông hoa tuyệt vời nhất tỏa hương thơm riêng!',
    illustrationUrl: '🎨 Minh họa: Các em nhỏ đa dạng vùng miền nắm chặt tay tạo thành vòng tròn lớn dưới cầu vồng rực rỡ.',
    colorTheme: 'pastel-pink',
    subject: 'tieng_viet',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'tv-5',
    programType: 'GDPT2018',
    grade: 5,
    topicName: 'Chủ đề 1: Tổ quốc thân yêu',
    lessonNumber: 1,
    title: 'Bài 1: Thơ gửi các học sinh',
    shortDescription: 'Hiểu bối cảnh lịch sử và tinh thần quật khởi học tập mà Bác Hồ nhắn gửi các cháu học sinh nhân ngày khai trường đầu tiên năm 1945.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu Tiếng Việt Lớp 5:\n- Lý giải câu nói bất hủ: "Non sông Việt Nam có trở nên tươi đẹp hay không... chính là nhờ một phần lớn ở công học tập của các em".\n- Rèn luyện kỹ năng tóm tắt đoạn văn luận điểm ý nghĩa sâu sắc.',
    infographicUrl: '🇻🇳 THƯ GỬI CÁC HỌC SINH:\n🚀 Nhiệm vụ vẻ vang kiến thiết đất nước\n🧠 Ra sức học tập, rèn luyện đạo đức\n🏅 Đưa non sông sánh vai với các cường quốc năm châu!',
    illustrationUrl: '🎨 Minh họa: Bác Hồ kính yêu mỉm cười ấm áp bên cạnh các em thiếu nhi mặc khăn quàng đỏ tươi.',
    colorTheme: 'pastel-pink',
    subject: 'tieng_viet',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },

  // ==================== MÔN TOÁN (Grade 1 to 5) ====================
  {
    id: 'm-1',
    programType: 'GDPT2018',
    grade: 1,
    topicName: 'Chủ đề 1: Nhận biết số lượng',
    lessonNumber: 1,
    title: 'Bài 1: Các số từ 1 đến 5',
    shortDescription: 'Làm quen đếm số lượng đồ vật, động vật quen thuộc và viết chính xác chữ số từ 1 đến 5.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu Toán Lớp 1:\n- Đếm ngón tay, đếm bông hoa, đếm bàn ghế trong lớp học.\n- Tập viết số 1, 2, 3, 4, 5 đúng độ cao, độ rộng ly vở ô vuông.',
    infographicUrl: '🔢 ĐẾM ĐỒ VẬT THẬT VUI:\n🎈 1 quả bóng hơi\n🐱 2 chú mèo mướp\n🐧 3 chú chim cánh cụt\n🚗 4 chiếc xe ô tô con\n⭐ 5 ngôi sao lấp lánh',
    illustrationUrl: '🎨 Minh họa: Các con vật hoạt hình biểu diễn xiếc vui nhộn bên những chữ số khổng lồ vô cùng dễ thương.',
    colorTheme: 'pastel-yellow',
    subject: 'toan',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'm-2',
    programType: 'GDPT2018',
    grade: 2,
    topicName: 'Chủ đề 1: Ôn tập phép cộng, phép trừ',
    lessonNumber: 1,
    title: 'Bài 1: Phép cộng có nhớ trong phạm vi 100',
    shortDescription: 'Học cách thực hiện phép toán cộng dạng đặt tính thẳng hàng, cộng từ phải sang trái có nhớ cực kỳ cẩn thận.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu giảng dạy Toán Lớp 2:\n- Ví dụ phép toán: 38 + 25 = ?\n- Cách thực hiện: 8 cộng 5 bằng 13, viết 3 nhớ 1. 3 cộng 2 bằng 5, thêm 1 bằng 6. Kết quả là 63.',
    infographicUrl: '📊 PHÉP CỘNG CÓ NHỚ:\n🧮 Đặt tính thẳng cột: Hàng đơn vị thẳng đơn vị, hàng chục thẳng chục.\n⚡ Nhớ cộng thêm 1 sang hàng chục khi tính toán nhé bé ơi!',
    illustrationUrl: '🎨 Minh họa: Bảng phấn trường học cổ điển vẽ các cột số màu xanh tươi phối màu hài hòa.',
    colorTheme: 'pastel-yellow',
    subject: 'toan',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'm-3',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Chủ đề 1: Ôn tập và bổ sung',
    lessonNumber: 1,
    title: 'Bài 1: Ôn tập các số phạm vi 1000',
    shortDescription: 'Tìm hiểu sâu về cấu trúc hàng trăm, hàng chục, hàng đơn vị và cách so sánh các số lớn tới 1000.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu lý thuyết Toán Lớp 3:\n- Cấu tạo số gồm Trăm, Chục và Đơn vị. Ví dụ: 352 = 300 + 50 + 2.\n- So sánh số: So sánh hàng trăm trước, rồi tới hàng chục, sau cùng là hàng đơn vị.',
    infographicUrl: '🔢 CẤU TẠO SỐ HỌC:\n💯 Số 425 gồm:\n⭐ 4 trăm (400)\n⭐ 2 chục (20)\n⭐ 5 đơn vị (5)\n➡️ Dễ dàng viết thành tổng: 400 + 20 + 5',
    illustrationUrl: '🎨 Minh họa: Các khối rubik số học 3D xinh xắn được xếp ngay ngắn thành từng chồng.',
    colorTheme: 'pastel-yellow',
    subject: 'toan',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'm-4',
    programType: 'GDPT2018',
    grade: 4,
    topicName: 'Chủ đề 1: Luyện tập số tự nhiên nâng cao',
    lessonNumber: 1,
    title: 'Bài 1: Các số trong phạm vi 100 000',
    shortDescription: 'Khám phá cách đọc, viết chữ số lên tới 5 chữ số có hàng chục nghìn chính xác, áp dụng giải toán thực tế.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu hướng dẫn Toán Lớp 4:\n- Học cấu tạo lớp đơn vị và lớp nghìn.\n- Ví dụ: 45 281 đọc là "Bốn mươi lăm nghìn hai trăm tám mươi mốt".',
    infographicUrl: '🏛️ HÀNG CHỮ SỐ LỚN:\n⭐ Chục nghìn | Nghìn | Trăm | Chục | Đơn vị\n✨ Đọc số to bằng cách ngắt cụm 3 số cuối từ phải qua để chính xác nhất!',
    illustrationUrl: '🎨 Minh họa: Ngôi nhà số học khổng lồ rực rỡ với các phòng ban đặt tên từng hàng chữ số.',
    colorTheme: 'pastel-yellow',
    subject: 'toan',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'm-5',
    programType: 'GDPT2018',
    grade: 5,
    topicName: 'Chủ đề 1: Phân số thực tế',
    lessonNumber: 1,
    title: 'Bài 1: Ôn tập phân số và tính chất cơ bản',
    shortDescription: 'Củng cố vững chắc khái niệm tử số, mẫu số và tính chất nhân chia cùng một số ở cả tử số lẫn mẫu số để tìm phân số bằng nhau.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'Tài liệu Toán Lớp 5:\n- Nhân cả tử và mẫu với số khác 0: Phân số mới bằng phân số cũ.\n- Rút gọn phân số bằng cách chia cả tử và mẫu cho ước số chung lớn nhất.',
    infographicUrl: '🍕 TÍNH CHẤT CƠ BẢN PHÂN SỐ:\n🍰 1/2 cái bánh = 2/4 cái bánh = 4/8 cái bánh\n✨ Khi nhân hoặc chia cả Tử số và Mẫu số với cùng một số tự nhiên khác 0, ta được phân số mới hoàn toàn BẰNG phân số ban đầu!',
    illustrationUrl: '🎨 Minh họa: Những chiếc bánh pizza đầy sắc màu được chia thành nhiều lát bằng nhau cực kỳ bắt mắt.',
    colorTheme: 'pastel-yellow',
    subject: 'toan',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },

  // ==================== MÔN TIẾNG ANH (Grade 1 to 5) ====================
  {
    id: 'en-1',
    programType: 'GDPT2018',
    grade: 1,
    topicName: 'Unit 1: In the school playground',
    lessonNumber: 1,
    title: 'Lesson 1: Say Hello and practice /b/ sound',
    shortDescription: 'Learn simple English greeting: "Hello", "Hi" and explore words starting with the letter B sound.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'English Grade 1 Global Success:\n- Practice English conversation: "Hello, Ba!" - "Hello, Bill!"\n- Vocabulary words: book, bike, ball, boy.',
    infographicUrl: '🇬🇧 ENGLISH TIME - GRAE 1:\n👋 Hello! / Hi!\n📙 Book (Quyển sách) | 🚲 Bike (Xe đạp)\n🔴 Ball (Quả bóng) | 👦 Boy (Cậu bé)',
    illustrationUrl: '🎨 Minh họa: Các bạn học sinh nhỏ nô đùa trong sân trường rực nắng ấm.',
    colorTheme: 'pastel-blue',
    subject: 'tieng_anh',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'en-2',
    programType: 'GDPT2018',
    grade: 2,
    topicName: 'Unit 1: At the camp',
    lessonNumber: 1,
    title: 'Lesson 1: Camping vocabulary',
    shortDescription: 'Learn useful camping vocabulary to talk about tents, torches, campfires, and exciting activities.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'English Grade 2 Global Success:\n- Sentence structure: "What do you see?" - "I see a tent."\n- Keywords: tent, torch, teapot, cat.',
    infographicUrl: '🏕️ CAMPING THRILL:\n⛺ Tent (Cái lều)\n🔦 Torch (Đèn pin)\n🍵 Teapot (Ấm pha trà)\n🗣️ Let\'s speak: "I have a torch in my hand!"',
    illustrationUrl: '🎨 Minh họa: Khung cảnh núi đồi hoang dã với lửa trại ấm áp cháy lung linh dưới đêm sao.',
    colorTheme: 'pastel-blue',
    subject: 'tieng_anh',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'en-3',
    programType: 'GDPT2018',
    grade: 3,
    topicName: 'Unit 1: Hello again',
    lessonNumber: 1,
    title: 'Lesson 1: Talk about your nationality',
    shortDescription: 'Ask and answer about people countries of origin using the sentence structure: "Where are you from?"',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'English Grade 3 Global Success:\n- Country vocabulary: Vietnam, England, America, Japan.\n- Dialogue: "Where are you from, Lucy?" - "I\'m from England."',
    infographicUrl: '🌍 WHERE ARE YOU FROM?\n🇻🇳 I\'m from Vietnam.\n🇬🇧 I\'m from England.\n🇺🇸 I\'m from America.\n🇯🇵 I\'m from Japan.',
    illustrationUrl: '🎨 Minh họa: Các bạn thú ngộ nghĩnh mặc trang phục truyền thống của nhiều quốc gia khác nhau.',
    colorTheme: 'pastel-blue',
    subject: 'tieng_anh',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'en-4',
    programType: 'GDPT2018',
    grade: 4,
    topicName: 'Unit 1: My friends',
    lessonNumber: 1,
    title: 'Lesson 1: Describing hobbies and activities',
    shortDescription: 'Express your hobbies and ask your friends about theirs using the pattern: "What is your hobby?" - "I like..."',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'English Grade 4 Global Success:\n- Reading hobby words: swimming, dancing, singing, drawing, cooking.\n- Structure: "I like swimming." - "She likes drawing."',
    infographicUrl: '🎨 MY FAVORITE HOBBIES:\n🏊 Swimming (Bơi lội) | 🕺 Dancing (Nhảy)\n🎶 Singing (Ca hát) | ✍️ Drawing (Vẽ tranh)\n🗣️ Ask: "- What do you like doing? - I like dancing!"',
    illustrationUrl: '🎨 Minh họa: Một phòng câu lạc bộ nghệ thuật cho các bé tự do vẽ tranh, chơi đàn nhạc vui tươi.',
    colorTheme: 'pastel-blue',
    subject: 'tieng_anh',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  },
  {
    id: 'en-5',
    programType: 'GDPT2018',
    grade: 5,
    topicName: 'Unit 1: All about me',
    lessonNumber: 1,
    title: 'Lesson 1: Speak about future careers',
    shortDescription: 'Create a stellar short self-introduction presentation, and discuss what jobs you hope to have in the future.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'English Grade 5 Global Success (Kết nối tri thức):\n- Career vocabulary: doctor, pilot, teacher, engineer, scientist.\n- Speaking pattern: "- Why would you like to be a pilot? - Because I want to fly planes!"',
    infographicUrl: '🚀 FUTURE CAREERS:\n🩺 Doctor (Bác sĩ) | 👨‍✈️ Pilot (Phi công)\n📐 Engineer (Kỹ sư) | 🔬 Scientist (Nhà khoa học)\n🗣️ Pattern: "In the future, I want to be a scientist to discover new things!"',
    illustrationUrl: '🎨 Minh họa: Một tên lửa bay lượn trên hành tinh xa với phi hành gia gấu đáng yêu.',
    colorTheme: 'pastel-blue',
    subject: 'tieng_anh',
    bookSeries: 'Kết nối tri thức với cuộc sống'
  }
];

// Mock database index of questions for our games
export const INITIAL_QUESTIONS: Question[] = [
  // Bài 1: Thông tin và quyết định (Lớp 3)
  {
    id: 'q1',
    lessonId: 'l3-1',
    gameType: 'quiz',
    questionText: 'Khi đi trên đường, em thấy đèn tín hiệu giao thông chuyển sang ĐỎ. Thông tin này giúp em đưa ra quyết định gì?',
    options: [
      'A. Tiếp tục chạy xe thật nhanh qua làn đường',
      'B. Dừng lại an toàn trước vạch quy định',
      'C. Rẽ trái mà không cần nhìn đường',
      'D. Đứng xuống dắt bộ xe qua làn đường ngược lại'
    ],
    correctAnswer: 'B. Dừng lại an toàn trước vạch quy định',
    explanation: 'Chính xác! Đèn đỏ báo hiệu tất cả phương tiện cần dừng lại để đảm bảo an toàn giao thông đấy!'
  },
  {
    id: 'q2',
    lessonId: 'l3-1',
    gameType: 'true_false',
    questionText: 'Nghe tiếng còi báo thức từ đồng hồ kêu "reng reng" vào buổi sáng mang lại thông tin cho em biết đã đến giờ thức dậy chuẩn bị đi học.',
    correctAnswer: 'Đúng',
    explanation: 'Đúng vậy! Âm thanh reo là thông tin giúp em đưa ra quyết định thức dậy đúng giờ.'
  },
  {
    id: 'q3',
    lessonId: 'l3-2',
    gameType: 'gap_fill',
    questionText: 'Thứ tiếp nhận mọi tín hiệu hình ảnh, âm thanh từ các giác quan và đưa ra suy nghĩ xử lý ở con người là bộ ...',
    correctAnswer: 'não',
    explanation: 'Giỏi quá! Bộ não chính là trung tâm chỉ huy xử lý mọi thông tin thu nhận được ở cơ thể con người.'
  },
  {
    id: 'q4',
    lessonId: 'l3-3',
    gameType: 'matching',
    questionText: 'Hãy nối chính xác các thiết bị máy tính với chức năng tương ứng của chúng!',
    correctAnswer: 'A-1|B-2|C-3|D-4',
    explanation: 'Quá siêu! Em đã nắm cực kỳ vững chức năng của Chuột, Bàn phím, Thân máy và Màn hình rồi!',
    matchingPairs: [
      { id: 'A', left: 'Bàn phím (Keyboard)', right: 'Dùng gõ chữ và số để nhập dữ liệu', id_match: '1' },
      { id: 'B', left: 'Màn hình (Monitor)', right: 'Hiển thị hình ảnh rực rỡ sinh động', id_match: '2' },
      { id: 'C', left: 'Thân máy (Computer Case)', right: 'Là nơi chứa bộ não thực hiện tính toán xử lý', id_match: '3' },
      { id: 'D', left: 'Chuột máy tính (Mouse)', right: 'Giúp em dễ dàng di chuyển con trỏ, click nút', id_match: '4' }
    ] as any
  },
  {
    id: 'q5',
    lessonId: 'l3-3',
    gameType: 'memory',
    questionText: 'Hãy lật thẻ để ghép các cặp thiết bị Tin học dễ thương!',
    correctAnswer: 'matched',
    explanation: 'Chúc mừng em! Trí nhớ tuyệt hảo giúp em ghép toàn bộ cặp thiết bị!',
    memoryCards: [
      { id: 'm1', content: '🖱️ Chuột', matchId: 'pair1' },
      { id: 'm2', content: 'Dùng để click và chọn', matchId: 'pair1' },
      { id: 'm3', content: '⌨️ Bàn phím', matchId: 'pair2' },
      { id: 'm4', content: 'Dùng để gõ chữ và số', matchId: 'pair2' },
      { id: 'm5', content: '🖥️ Màn hình', matchId: 'pair3' },
      { id: 'm6', content: 'Dùng để hiển thị hình ảnh', matchId: 'pair3' },
      { id: 'm7', content: '⚡ Bộ xử lý CPU', matchId: 'pair4' },
      { id: 'm8', content: 'Bộ não chính trong thân máy', matchId: 'pair4' }
    ]
  },

  // Bài Scratch (Lớp 5)
  {
    id: 'q6',
    lessonId: 'l5-1',
    gameType: 'quiz',
    questionText: 'Trong lập trình Scratch, nhân vật mặc định đầu tiên xuất hiện để đón chào các em là con gì?',
    options: [
      'A. Chú Cún tinh nghịch',
      'B. Chú Mèo vàng ngộ nghĩnh',
      'C. Chú Chim cánh cụt',
      'D. Chú Gấu trúc mập mạp'
    ],
    correctAnswer: 'B. Chú Mèo vàng ngộ nghĩnh',
    explanation: 'Đúng rồi! Đó chính là linh thú Mèo Scratch vui nhộn đấy!'
  },
  {
    id: 'q7',
    lessonId: 'l5-1',
    gameType: 'true_false',
    questionText: 'Các khối lệnh di chuyển của Scratch có màu xanh dương cobalt (Move blocks) giúp nhân vật có thể tiến lên, xoay tròn hoặc nhảy múa.',
    correctAnswer: 'Đúng',
    explanation: 'Chính xác! Màu sắc giúp em dễ dàng ghi nhớ và phân loại nhóm lệnh lập trình cực nhanh.'
  }
];

// Helper functions for CSV export/import
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      let cell = val === null || val === undefined ? '' : String(val);
      // Escape commas and double quotes
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  );
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    // Basic CSV parser to handle values with quotes/commas
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim().replace(/^"|"$/g, ''));
    
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = cols[index] || '';
    });
    return obj;
  });
}

export interface AvatarOption {
  emoji: string;
  label: string;
}

export const SHARED_AVATAR_POOL: AvatarOption[] = [
  { emoji: '👦', label: 'Cậu bé dũng sĩ dũng cảm' },
  { emoji: '👧', label: 'Cô bé thông minh sáng tạo' },
  { emoji: '👨', label: 'Bố / Bạn nam sinh trưởng thành' },
  { emoji: '👩', label: 'Mẹ / Bạn nữ sinh dịu dàng' },
  { emoji: '🌱', label: 'Mầm cây nhỏ hi vọng' },
  { emoji: '🌞', label: 'Mặt trời ấm áp rực rỡ' },
  { emoji: '🌙', label: 'Mặt trăng dịu hiền lấp lánh' },
  { emoji: '⭐', label: 'Ngôi sao may mắn rạng ngời' }
];

export interface Game {
  id: string; // e.g. "TC00001"
  title: string;
  category: string; // e.g. 'Trò chơi luyện chuột', 'Trò chơi luyện phím', 'Trò chơi luyện tập'
  reward: string; // e.g., "+5⭐"
  status: 'Đang hoạt động' | 'Tạm khóa';
  description: string;
  gameAreaType: 'swf' | 'link' | 'html';
  swfFile?: string;
  externalLink?: string;
  htmlCode?: string;
  builtinKey?: string; // Match which built-in game to execute
  subject?: string; // e.g., 'tin_hoc' | 'tieng_viet' | 'toan' | 'tieng_anh'
  grade?: number; // e.g., 1 | 2 | 3 | 4 | 5
  topic?: string; // e.g., 'Chủ đề 1...'
}

