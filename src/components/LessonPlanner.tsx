import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  ChevronDown, 
  Check, 
  HelpCircle, 
  RefreshCw, 
  BookOpen, 
  Cpu, 
  FileText, 
  Upload, 
  Trash2, 
  Copy, 
  CheckSquare, 
  Square, 
  Gamepad2, 
  Monitor, 
  FileDown, 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  Undo,
  Pencil,
  Eye,
  Settings,
  Info,
  History,
  Plus,
  Minimize2,
  ExternalLink,
  Printer,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SoundEffects } from '../App';

interface AttachedFile {
  name: string;
  type: string;
  size: string;
  base64: string;
}

export interface ResourceRecommendation {
  id: string;
  title: string;
  type: 'pdf' | 'ppt' | 'video' | 'worksheet';
  size?: string;
  source: string;
  desc: string;
  downloadUrl: string;
}

export const SUPPLEMENTAL_RESOURCES: Record<string, ResourceRecommendation[]> = {
  'Tin học': [
    {
      id: 'res-th1',
      title: 'Thiết kế bài giảng điện tử PowerPoint (Nâng cao)',
      type: 'ppt',
      size: '4.5 MB',
      source: 'Hành trang số - Nhà xuất bản Giáo dục Việt Nam',
      desc: 'Kho Slide lý thuyết tích hợp nhân vật Rô-bốt, có đố vui giúp HS hào hứng học thông tin số.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    },
    {
      id: 'res-th2',
      title: 'Tài liệu hướng dẫn Giáo viên Tin học (Phát triển Năng lực)',
      type: 'pdf',
      size: '2.1 MB',
      source: 'Sách Tập Huấn - NXB Giáo dục Việt Nam',
      desc: 'Sách hướng dẫn cách triển khai bài học, câu đố kéo thả và các trò chơi vận động nhóm.',
      downloadUrl: 'https://taphuan.nxbgd.vn'
    },
    {
      id: 'res-th3',
      title: 'Phiếu bài tập trắc nghiệm & Tư duy máy tính Kết nối tri thức',
      type: 'worksheet',
      size: '800 KB',
      source: 'Thư viện Học liệu số Sư phạm',
      desc: 'Học liệu thiết kế chuẩn để in ấn phân phát cho học sinh rèn luyện làm bài tập cá nhân.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    },
    {
      id: 'res-th4',
      title: 'Video hoạt họa: Ba dạng thông tin cơ bản quanh em',
      type: 'video',
      source: 'Học liệu số trực tuyến KNTT',
      desc: 'Video dài 2 phút diễn tả âm thanh học tập trực quan giúp trẻ dễ dàng ghi nhớ bài học.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    }
  ],
  'Toán học': [
    {
      id: 'res-m1',
      title: 'Bộ phiếu học tập Toán số học & Tính nhanh thực tế',
      type: 'worksheet',
      size: '1.2 MB',
      source: 'Hành trang số KNTT',
      desc: 'Phiếu rèn luyện kỹ năng thực hành tính nhẩm thông qua sơ đồ bối cảnh cửa hàng tạp hóa.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    },
    {
      id: 'res-m2',
      title: 'Slide bài trình chiếu hình học trực gian và đo lường',
      type: 'ppt',
      size: '3.8 MB',
      source: 'Hành trang số - NXB Giáo dục Việt Nam',
      desc: 'Slide cắt ghép hình ảnh đồ họa trực quan chuyển động sinh động giúp HS nhận biết dễ dàng.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    },
    {
      id: 'res-m3',
      title: 'Vở bài tập toán nâng cao & Thử thách rèn luyện số',
      type: 'pdf',
      size: '3.1 MB',
      source: 'Thư viện Sách Giáo viên KNTT',
      desc: 'Tuyển tập các kịch bản thử thách tư duy toán cho giáo viên lựa chọn làm giàu giáo án.',
      downloadUrl: 'https://taphuan.nxbgd.vn'
    }
  ],
  'Tiếng Việt': [
    {
      id: 'res-tv1',
      title: 'Bộ tranh ảnh trực quan bối cảnh Ngày khai trường',
      type: 'worksheet',
      size: '15 MB',
      source: 'Hành trang số Giáo dục Việt Nam',
      desc: 'Bộ sưu tập hình ảnh tả cảnh Ngày tựu trường đặc trưng, giúp truyền đạt ngữ cảnh bài tốt nhất.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    },
    {
      id: 'res-tv2',
      title: 'Slide bài giảng thiết kế PowerPoint rèn đọc diễn cảm Ngày gặp lại',
      type: 'ppt',
      size: '4.9 MB',
      source: 'Sách giáo khoa điện tử Kết nối tri thức',
      desc: 'Bài giảng sẵn có để Giáo viên sử dụng tương tác, tích hợp ô chữ rèn luyện từ vựng cho các em.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    }
  ],
  'Ngữ văn': [
    {
      id: 'res-nv1',
      title: 'Video đọc diễn cảm tác phẩm Bài học đường đời đầu tiên',
      type: 'video',
      source: 'Kho học liệu điện tử Kết nối tri thức',
      desc: 'Phim/video đọc diễn cảm giúp nâng cao trải nghiệm thẩm âm và cảm thụ văn học của HS.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    },
    {
      id: 'res-nv3',
      title: 'Sách giáo khoa điện tử và bài tập luyện viết sáng tạo văn học',
      type: 'pdf',
      size: '3.0 MB',
      source: 'Tập huấn giáo viên THCS/THPT',
      desc: 'Hướng dẫn giáo viên triển khai kịch bản đóng vai nhân vật Dế Mèn cực kỳ sâu sắc.',
      downloadUrl: 'https://taphuan.nxbgd.vn'
    }
  ],
  'Tiếng Anh': [
    {
      id: 'res-eng1',
      title: 'Audio mp3 Listening files standard pronunciation grade 3/4/5',
      type: 'video',
      source: 'Hành trang số KNTT Global Success',
      desc: 'Tập tin âm thanh nghe đọc chính thức của bộ sách Global Success chuẩn Bộ giáo dục.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    },
    {
      id: 'res-eng2',
      title: 'Interactive English Flashcards for Grammar and Vocab',
      type: 'ppt',
      size: '7.4 MB',
      source: 'KNTT Global Success materials',
      desc: 'Bài giảng trò chơi ghép tranh học từ vựng tiếng Anh theo nhóm rất dễ triển khai.',
      downloadUrl: 'https://hanhtrangso.nxbgd.vn'
    }
  ]
};

export interface SavedLessonPlan {
  id: string;
  createdAt: string;
  title: string;
  grade: string;
  subject: string;
  duration: string;
  stage: 'tieuhoc' | 'thcs' | 'thpt';
  studentCount: string;
  competencies: string[];
  tools: string[];
  methods: string[];
  techInputs: string;
  gameInputs: string;
  lessonContent: string;
  plan: string;
  aiAutoCompetency: boolean;
  aiPowerup: boolean;
  aiAutoTools: boolean;
  aiAutoTech: boolean;
  aiAutoGames: boolean;
  aiAutoMethods: boolean;
  status?: 'draft' | 'needs_edit' | 'approved' | 'taught';
  isBasic?: boolean;
  isGDPT2018?: boolean;
  periods?: PeriodConfig[];
}

export interface ActivityConfig {
  id: string;
  name: string;
}

export interface PeriodConfig {
  id: string;
  name: string;
  activities: ActivityConfig[];
}

export interface LessonTemplate {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  studentCount: string;
  stage: 'tieuhoc' | 'thcs' | 'thpt';
  competencies: string[];
  tools: string[];
  methods: string[];
  techInputs: string;
  gameInputs: string;
  lessonContent: string;
  aiAutoCompetency: boolean;
  aiPowerup: boolean;
  aiAutoTools: boolean;
  aiAutoTech: boolean;
  aiAutoGames: boolean;
  aiAutoMethods: boolean;
}

const LESSON_TEMPLATES: LessonTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Thông tin và quyết định',
    subject: 'Tin học',
    grade: 'Lớp 3',
    duration: '2 Tiết',
    studentCount: 'Vừa (20-35 HS)',
    stage: 'tieuhoc',
    competencies: ['Năng lực số', 'Giao tiếp và hợp tác', 'Tự chủ và tự học', 'Giải quyết vấn đề và sáng tạo', 'Tin học'],
    tools: ['Máy chiếu', 'Phiếu học tập', 'Sách giáo khoa'],
    methods: ['Vấn đáp', 'Thực hành', 'Trò chơi'],
    techInputs: 'Sử dụng Padlet hoặc ứng dụng kéo thả trực quan để học sinh phân loại thông tin và quyết định.',
    gameInputs: 'Trò chơi đóng vai "Trọng tài thông thái": Phân tích nhanh tình huống giao thông thực tế để quyết định qua đường hay dừng lại.',
    lessonContent: 'Tìm hiểu mối quan hệ giữa thông tin nhận biết và quyết định hành vi. Nhận diện nguồn thông tin hữu ích trong cuộc sống quanh em.',
    aiAutoCompetency: false,
    aiPowerup: true,
    aiAutoTools: false,
    aiAutoTech: false,
    aiAutoGames: false,
    aiAutoMethods: false
  },
  {
    id: 'tpl-2',
    title: 'Tính giá trị của biểu thức số',
    subject: 'Toán học',
    grade: 'Lớp 3',
    duration: '1 Tiết',
    studentCount: 'Đông (35-50 HS)',
    stage: 'tieuhoc',
    competencies: ['Tính toán', 'Giải quyết vấn đề và sáng tạo', 'Tự chủ và tự học'],
    tools: ['Bảng phụ', 'Phiếu học tập', 'Sách giáo khoa'],
    methods: ['Thực hành', 'Vấn đáp', 'Trò chơi'],
    techInputs: 'Ứng dụng website Quizizz kiểm tra tính nhẩm thần tốc của học sinh sau bài học lý thuyết.',
    gameInputs: 'Trò chơi "Rung chuông vàng": Học sinh giải nhanh biểu thức trong vòng 15 giây để tìm ra nhà toán học vô địch.',
    lessonContent: 'Nguyên tắc tính giá trị biểu thức số có dấu ngoặc và không có dấu ngoặc tròn. Thứ tự ưu tiên nhân chia trước, cộng trừ sau.',
    aiAutoCompetency: false,
    aiPowerup: false,
    aiAutoTools: false,
    aiAutoTech: false,
    aiAutoGames: false,
    aiAutoMethods: false
  },
  {
    id: 'tpl-3',
    title: 'Ngày gặp lại (Bài đọc mở đầu)',
    subject: 'Tiếng Việt',
    grade: 'Lớp 3',
    duration: '2 Tiết',
    studentCount: 'Vừa (20-35 HS)',
    stage: 'tieuhoc',
    competencies: ['Ngôn ngữ', 'Thẩm mỹ', 'Tự chủ và tự học', 'Giao tiếp và hợp tác'],
    tools: ['Tranh ảnh', 'Sách giáo khoa', 'Mô hình'],
    methods: ['Khám phá', 'Vấn đáp', 'Đóng vai'],
    techInputs: 'Sử dụng bản đồ tư duy trực quan để thống kê các cảm xúc và kỷ niệm vui tươi ngày đầu nhập học.',
    gameInputs: 'Trò chơi "Hộp quà bí ẩn": Rút thăm trả lời câu hỏi đọc hiểu về nội dung văn bản Ngày gặp lại.',
    lessonContent: 'Rèn luyện kỹ năng đọc diễn cảm, ngắt nghỉ đúng câu nhạc điệu bài thơ. Nhận biết và tìm kiếm từ ngữ chỉ sự vật, cảm xúc mùa hè.',
    aiAutoCompetency: false,
    aiPowerup: false,
    aiAutoTools: false,
    aiAutoTech: false,
    aiAutoGames: false,
    aiAutoMethods: false
  },
  {
    id: 'tpl-4',
    title: 'Phần cứng và phần mềm máy tính',
    subject: 'Tin học',
    grade: 'Lớp 4',
    duration: '1 Tiết',
    studentCount: 'Vừa (20-35 HS)',
    stage: 'tieuhoc',
    competencies: ['Năng lực số', 'Thẩm mỹ', 'Tự chủ và tự học', 'Tin học'],
    tools: ['Máy tính', 'Phiếu học tập', 'Bảng phụ', 'Sách giáo khoa'],
    methods: ['Trực quan', 'Thảo luận nhóm', 'Vấn đáp'],
    techInputs: 'Xem hoạt họa 3D quy trình hệ điều hành khởi động phần cứng và kích hoạt các phần mềm con.',
    gameInputs: 'Trò chơi "Ai là ai?": Học sinh phân loại thẻ bài từ vựng (Chuột, Bàn phím, Windows, Paint) vào đúng cột phần cứng/phần mềm.',
    lessonContent: 'Định nghĩa cơ bản phần cứng và phần mềm. Vai trò bổ trợ khăng khít của chúng để máy tính hoạt động trơn tru.',
    aiAutoCompetency: false,
    aiPowerup: true,
    aiAutoTools: false,
    aiAutoTech: false,
    aiAutoGames: false,
    aiAutoMethods: false
  },
  {
    id: 'tpl-5',
    title: 'Tính diện tích hình tam giác',
    subject: 'Toán học',
    grade: 'Lớp 5',
    duration: '1 Tiết',
    studentCount: 'Vừa (20-35 HS)',
    stage: 'tieuhoc',
    competencies: ['Tính toán', 'Giải quyết vấn đề và sáng tạo', 'Tự chủ và tự học'],
    tools: ['Mô hình', 'Dụng cụ thí nghiệm', 'Phiếu học tập', 'Sách giáo khoa'],
    methods: ['Thực hành', 'Trực quan', 'Vấn đáp'],
    techInputs: 'Sử dụng mô phỏng Geogebra cắt ghép mô hình tam giác thành hình chữ nhật trực quan sống động.',
    gameInputs: 'Trò chơi "Mảnh ghép kỳ diệu": Ghép cặp chiều cao và độ dài đáy tương ứng để tìm diện tích chính xác nhanh nhất.',
    lessonContent: 'Công thức tính diện tích hình tam giác (S = a * h / 2). Kỹ năng vẽ đường cao từ các đỉnh tam giác nhọn, tam giác vuông.',
    aiAutoCompetency: false,
    aiPowerup: false,
    aiAutoTools: false,
    aiAutoTech: false,
    aiAutoGames: false,
    aiAutoMethods: false
  },
  {
    id: 'tpl-6',
    title: 'Tìm thông tin đáng tin cậy trên Internet',
    subject: 'Tin học',
    grade: 'Lớp 5',
    duration: '2 Tiết',
    studentCount: 'Vừa (20-35 HS)',
    stage: 'tieuhoc',
    competencies: ['Năng lực số', 'Giải quyết vấn đề và sáng tạo', 'Tin học'],
    tools: ['Máy chiếu', 'Phiếu học tập', 'Sách giáo khoa'],
    methods: ['Vấn đáp', 'Thảo luận nhóm', 'Trò chơi'],
    techInputs: 'Sử dụng trình duyệt lớp học để duyệt thử các bài viết, học cách nhìn tên miền uy tín (.gov.vn, .edu.vn).',
    gameInputs: 'Trò chơi "Thám tử mạng": Phân tích 3 mẩu tin cực nóng xem nguồn nào là tin giả, nguồn nào là sự thật tin cậy.',
    lessonContent: 'Tiêu chí đánh giá độ tin cậy của thông tin trên mạng Internet. Tác hại cực đoan của tin giả và quy tắc chia sẻ thông tin an toàn.',
    aiAutoCompetency: false,
    aiPowerup: true,
    aiAutoTools: false,
    aiAutoTech: false,
    aiAutoGames: false,
    aiAutoMethods: false
  },
  {
    id: 'tpl-7',
    title: 'Bài học đường đời đầu tiên (Tìm hiểu truyện đồng thoại)',
    subject: 'Ngữ văn',
    grade: 'Lớp 6',
    duration: '2 Tiết',
    studentCount: 'Vừa (20-35 HS)',
    stage: 'thcs',
    competencies: ['Ngôn ngữ', 'Thẩm mỹ', 'Tự chủ và tự học', 'Giao tiếp và hợp tác'],
    tools: ['Sách giáo khoa', 'Tranh ảnh', 'Video clip'],
    methods: ['Khám phá', 'Đóng vai', 'Vấn đáp'],
    techInputs: 'Trình chiếu phim hoạt hình chuyển thể Dế Mèn phiêu lưu ký để học sinh cảm nhận và xây dựng lối đọc truyện tương tác.',
    gameInputs: 'Trò chơi "Mặt nạ cảm xúc": Học sinh nhập vai nhân vật Dế Mèn tự thoại giải bày nỗi ân hận sau cái chết thương tâm của Dế Choắt.',
    lessonContent: 'Phân tích tính cách kiêu căng của Dế Mèn và biến cố dẫn tới Bài học đường đời đầu tiên. Đặc điểm chính của thể loại truyện đồng thoại.',
    aiAutoCompetency: false,
    aiPowerup: false,
    aiAutoTools: false,
    aiAutoTech: false,
    aiAutoGames: false,
    aiAutoMethods: false
  }
];

// Helper to clean up LaTeX arrow artifacts like <$\rightarrow$>, $\rightarrow$, \rightarrow, etc.
export const cleanLatexArrows = (text: string): string => {
  if (!text) return "";
  let t = text;

  // Right arrows
  t = t.replace(/<\s*[\$\\]*\s*(?:rightarrow|to)\s*[\$\\]*\s*>/gi, "→");
  t = t.replace(/&lt;\s*[\$\\]*\s*(?:rightarrow|to)\s*[\$\\]*\s*&gt;/gi, "→");
  t = t.replace(/\$\s*\\(?:rightarrow|to)\s*\$/gi, "→");
  t = t.replace(/\\(?:rightarrow|to)\b/gi, "→");
  t = t.replace(/&rarr;/gi, "→");

  // Left arrows
  t = t.replace(/<\s*[\$\\]*\s*leftarrow\s*[\$\\]*\s*>/gi, "←");
  t = t.replace(/&lt;\s*[\$\\]*\s*leftarrow\s*[\$\\]*\s*&gt;/gi, "←");
  t = t.replace(/\$\s*\\leftarrow\s*\$/gi, "←");
  t = t.replace(/\\leftarrow\b/gi, "←");
  t = t.replace(/&larr;/gi, "←");

  // Double right arrows
  t = t.replace(/<\s*[\$\\]*\s*Rightarrow\s*[\$\\]*\s*>/gi, "⇒");
  t = t.replace(/&lt;\s*[\$\\]*\s*Rightarrow\s*[\$\\]*\s*&gt;/gi, "⇒");
  t = t.replace(/\$\s*\\Rightarrow\s*\$/gi, "⇒");
  t = t.replace(/\\Rightarrow\b/gi, "⇒");
  t = t.replace(/&rArr;/gi, "⇒");

  // Left-right arrows
  t = t.replace(/<\s*[\$\\]*\s*leftrightarrow\s*[\$\\]*\s*>/gi, "↔");
  t = t.replace(/&lt;\s*[\$\\]*\s*leftrightarrow\s*[\$\\]*\s*&gt;/gi, "↔");
  t = t.replace(/\$\s*\\leftrightarrow\s*\$/gi, "↔");
  t = t.replace(/\\leftrightarrow\b/gi, "↔");
  t = t.replace(/&harr;/gi, "↔");

  // Double left-right arrows
  t = t.replace(/<\s*[\$\\]*\s*Leftrightarrow\s*[\$\\]*\s*>/gi, "⇔");
  t = t.replace(/&lt;\s*[\$\\]*\s*Leftrightarrow\s*[\$\\]*\s*&gt;/gi, "⇔");
  t = t.replace(/\$\s*\\Leftrightarrow\s*\$/gi, "⇔");
  t = t.replace(/\\Leftrightarrow\b/gi, "⇔");
  t = t.replace(/&hArr;/gi, "⇔");

  // Clean ASCII arrow in diagram transitions e.g. [A] -> [B]
  t = t.replace(/([\]\)\wÀ-ỹ])\s*[-=]+>\s*([\[\(\wÀ-ỹ])/g, "$1 → $2");
  t = t.replace(/\s*[-=]{1,3}>\s*/g, " → ");
  t = t.replace(/&rarr;/gi, "→");
  t = t.replace(/&#8594;/gi, "→");
  t = t.replace(/&rArr;/gi, "⇒");
  t = t.replace(/&#8658;/gi, "⇒");

  return t;
};

// Loại bỏ Xuống dòng (enter) thông minh trong cột "Hoạt động của giáo viên" theo yêu cầu
export const applySmartTeacherNewlines = (text: string): string => {
  if (!text) return "";
  // Loại bỏ hoàn toàn xuống dòng (enter) thông minh, giữ nguyên văn bản tự nhiên theo yêu cầu người dùng
  return text;
};

// Helper to bold pedagogical methods (phương pháp trực quan, phương pháp vấn đáp, ...)
export const boldPedagogicalMethods = (text: string): string => {
  if (!text) return "";
  let res = text;
  // Convert markdown bold **phương pháp ...** to <strong>phương pháp ...</strong>
  res = res.replace(/\*\*(phương pháp[^*]+?)\*\*/gi, '<strong>$1</strong>');

  const methods = [
    "trực quan", "vấn đáp", "thảo luận nhóm", "thảo luận cặp đôi", "thảo luận",
    "giải quyết vấn đề", "nêu và giải quyết vấn đề", "đóng vai", "trò chơi học tập",
    "trò chơi", "thực hành - luyện tập", "thực hành trải nghiệm", "thực hành",
    "gợi mở", "dạy học hợp tác", "bàn tay nặn bột", "quan sát", "làm mẫu",
    "dạy học dự án", "dự án", "đàm thoại", "động não", "dạy học tích cực", "thực nghiệm"
  ];
  methods.sort((a, b) => b.length - a.length);

  const pattern = new RegExp(`(?<!<strong>)(phương pháp(?:\\s+(?:sư phạm|dạy học)?)?\\s+(?:${methods.join("|")}))(?![^<]*<\\/strong>)`, "gi");
  res = res.replace(pattern, "<strong>$1</strong>");

  return res;
};

// Helper to bold knowledge boxes (Hộp kiến thức, Hộp kiến thức cốt lõi, ...)
export const boldKnowledgeBox = (text: string): string => {
  if (!text) return "";
  let res = text;
  res = res.replace(/\*\*(Hộp\s+kiến\s+thức[^*]*?)\*\*/gi, '<strong>$1</strong>');
  res = res.replace(/(?<!<strong>)\b(Hộp\s+kiến\s+thức(?:\s+cốt\s+lõi|\s+ghi\s+nhớ)?)\b(?![^<]*<\/strong>)/gi, '<strong>$1</strong>');
  return res;
};

// Helper to bold and quote digital technology applications ("Wordwall", "Kahoot", ...) and learning games ("Ai nhanh hơn", "Rung chuông vàng", ...)
export const boldTechAppsAndGames = (text: string): string => {
  if (!text) return "";
  let res = text;

  // List of educational games
  const games = [
    "Ai nhanh hơn", "Rung chuông vàng", "Hộp quà bí mật", "Mảnh ghép kì diệu", "Mảnh ghép kỳ diệu",
    "Hộp quà bí ẩn", "Vòng quay may mắn", "Ong non tìm việc", "Ong tìm mật", "Đố vui",
    "Vượt chướng ngại vật", "Giải cứu đại dương", "Bức tranh bí ẩn", "Hái hoa dân chủ",
    "Truy tìm kho báu", "Nhà thông thái nhí", "Đố bạn", "Đường lên đỉnh Olympia",
    "Ai là triệu phú", "Tiếp sức", "Ai là ai", "Thám tử mạng", "Mặt nạ cảm xúc",
    "Khởi động vui học", "Làm theo hiệu lệnh"
  ];

  // List of digital apps and websites
  const apps = [
    "Kahoot", "Quizizz", "Padlet", "Canva", "Wordwall", "GeoGebra", "Liveworksheets",
    "PowerPoint", "Google Forms", "Mentimeter", "Blooket", "Nearpod", "Quizlet",
    "ClassDojo", "Edpuzzle", "Scratch", "Plickers", "Gimkit", "Baamboozle"
  ];

  // First convert markdown bold **...**
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const allItems = [...games, ...apps];
  allItems.sort((a, b) => b.length - a.length);

  allItems.forEach(item => {
    const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Normalize existing: <strong>"item"</strong> or <strong>item</strong> or "item" or bare item
    res = res.replace(new RegExp(`<strong>\\s*(?:["“”']|&quot;)?\\s*(${escaped})\\s*(?:["“”']|&quot;)?\\s*<\\/strong>`, 'gi'), `<strong>"${item}"</strong>`);
    res = res.replace(new RegExp(`(?<!<strong>)(?:["“”]|&quot;)\\s*(${escaped})\\s*(?:["“”]|&quot;)(?!<\\/strong>)`, 'gi'), `<strong>"${item}"</strong>`);
    res = res.replace(new RegExp(`(?<!(?:<strong>\\s*["“”]?|["“”]|&quot;))\\b(${escaped})\\b(?!(?:\\s*["“”]?<\\/strong>|["“”]|&quot;))`, 'gi'), `<strong>"${item}"</strong>`);
  });

  return res;
};

// Helper to bold lesson title or section when leading into the lesson, methods, knowledge boxes, apps, and games
export const boldLessonTitleInLeadIn = (text: string): string => {
  if (!text) return "";
  let res = text;

  // Convert markdown bold **...** to <strong>...</strong> if present
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Format pedagogical methods (phương pháp trực quan, phương pháp vấn đáp, ...)
  res = boldPedagogicalMethods(res);

  // Format knowledge boxes (Hộp kiến thức, ...)
  res = boldKnowledgeBox(res);

  // Format digital technology applications and learning games
  res = boldTechAppsAndGames(res);

  // 1. "phần 3: Sử dụng máy tính đúng cách" -> bold only title: "phần 3: <strong>Sử dụng máy tính đúng cách</strong>"
  // Keep "phần 3:" / "Phần 3:" regular, bold the part name after it
  res = res.replace(/(?:^|[^\wÀ-ỹ])((?:phần|Phần|PHẦN|mục|Mục)\s*\d+[:\.\s]+)(?:([“"\'‘][^"”\'’]+[”"\'’])|([^<“"”\'\.\,\!\?\n\r]+?(?=(?:\s+(?:và ghi|để|nhằm|theo|lên bảng|vào vở))|[\.\,\!\?\(<]|(?:<br\s*\/?>)|(?:\s*<\/)|$)))/gi, (match, prefix, quoted, plain) => {
    if (match.includes('<strong>')) return match;
    const target = (quoted || plain || '').trim();
    if (!target) return match;
    const leading = match.substring(0, match.indexOf(prefix));
    return `${leading}${prefix}<strong>${target}</strong>`;
  });

  // 2. "Bài 2: Xử lý thông tin" -> bold the whole "Bài 2: Xử lý thông tin": "<strong>Bài 2: Xử lý thông tin</strong>"
  res = res.replace(/(?:^|[^\wÀ-ỹ])((?:Bài|BÀI)\s*\d+[:\.\s]+(?:[“"\'‘][^"”\'’]+[”"\'’]|[^<“"”\'\.\,\!\?\n\r]+?(?=(?:\s+(?:và ghi|để|nhằm|theo|lên bảng|vào vở))|[\.\,\!\?\(<]|(?:<br\s*\/?>)|(?:\s*<\/)|$)))/gi, (match, fullLesson) => {
    if (match.includes('<strong>')) return match;
    const target = fullLesson.trim();
    if (target.length <= 5) return match;
    const leading = match.substring(0, match.indexOf(fullLesson));
    return `${leading}<strong>${target}</strong>`;
  });

  // 3. Lead-in context without "Bài X:" (e.g. "dẫn dắt vào bài mới: Xử lý thông tin" or "dẫn dắt vào bài học mới Tiết 2: Ba dạng thông tin thường gặp"):
  const isLeadIn = /dẫn dắt|vào bài|bài mới|bài học mới|tựa bài|tên bài|giới thiệu bài/i.test(res);
  if (isLeadIn) {
    res = res.replace(/((?:dẫn dắt vào bài học mới|dẫn dắt vào bài mới|dẫn dắt vào bài|dẫn dắt sang)[^\:]*?:\s*)(?:([“"\'‘][^"”\'’]+[”"\'’])|([^<\.\n\r]+?(?=(?:\s+(?:và ghi|để|nhằm|theo|lên bảng|vào vở))|[\.\n\r<]|(?:<br\s*\/?>)|$)))/gi, (match, prefix, quoted, plain) => {
      if (match.includes('<strong>')) return match;
      const target = (quoted || plain || '').trim();
      if (target.length > 2) {
        return `${prefix}<strong>${target}</strong>`;
      }
      return match;
    });
  }

  // Clean up nested strong tags if any
  res = res.replace(/<strong>\s*<strong>(.*?)<\/strong>\s*<\/strong>/gi, '<strong>$1</strong>');
  return res;
};

export const fixLessonTitlePeriodSpacing = (htmlOrText: string): string => {
  if (!htmlOrText) return '';
  let res = htmlOrText;

  // 1. In red header paragraphs: ensure "BÀI *: ... (TIẾT *)" has exact single space
  res = res.replace(/<p([^>]*)>\s*(?:<strong[^>]*>)?\s*(BÀI\s*\d+[\.:\s]+[^<]+?)\s*\((?:TIẾT|tiết)\s*(\d+)\)\s*(?:<\/strong>)?<\/p>/gi, (_m, attrs, titlePart, tietNum) => {
    const cleanTitle = titlePart.trim().toUpperCase().replace(/\s*\((?:TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*\d*\)\s*$/i, '').trim();
    let updatedAttrs = attrs;
    if (updatedAttrs.includes('color:')) {
      updatedAttrs = updatedAttrs.replace(/color:\s*[^;]+;/i, 'color: #c00000;');
    } else if (updatedAttrs.includes('style="')) {
      updatedAttrs = updatedAttrs.replace('style="', 'style="color: #c00000; ');
    } else {
      updatedAttrs += ' style="color: #c00000;"';
    }
    return `<p${updatedAttrs}><strong style="color: #c00000;">${cleanTitle} (TIẾT ${tietNum})</strong></p>`;
  });

  // 2. In red header paragraphs with "(1 TIẾT)"
  res = res.replace(/<p([^>]*)>\s*(?:<strong[^>]*>)?\s*(BÀI\s*\d+[\.:\s]+[^<]+?)\s*\((\d+)\s*(?:TIẾT|tiết)\)\s*(?:<\/strong>)?<\/p>/gi, (_m, attrs, titlePart, tietCount) => {
    const cleanTitle = titlePart.trim().toUpperCase().replace(/\s*\((?:TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*\d*\)\s*$/i, '').trim();
    let updatedAttrs = attrs;
    if (updatedAttrs.includes('color:')) {
      updatedAttrs = updatedAttrs.replace(/color:\s*[^;]+;/i, 'color: #c00000;');
    } else if (updatedAttrs.includes('style="')) {
      updatedAttrs = updatedAttrs.replace('style="', 'style="color: #c00000; ');
    } else {
      updatedAttrs += ' style="color: #c00000;"';
    }
    return `<p${updatedAttrs}><strong style="color: #c00000;">${cleanTitle} (${tietCount} TIẾT)</strong></p>`;
  });

  // 3. Any HTML closing tag immediately touching "(TIẾT *)"
  // e.g. "</strong>(TIẾT 1)" -> "</strong> (TIẾT 1)"
  res = res.replace(/(<\/strong>|<\/span>|<\/b>|<\/em>)\s*\((TIẾT|Tiết|tiết)\s*(\d+)\)/gi, '$1 (TIẾT $3)');

  // 4. Text or HTML: any word/character directly touching "(TIẾT *)" or "(Tiết *)" -> insert space
  // e.g. "THÔNG TIN(TIẾT 1)" -> "THÔNG TIN (TIẾT 1)"
  // e.g. "QUYẾT ĐỊNH(TIẾT 1)" -> "QUYẾT ĐỊNH (TIẾT 1)"
  res = res.replace(/([^\s\n>])\s*\((TIẾT|Tiết|tiết)\s*(\d+)\)/gi, '$1 (TIẾT $3)');

  // 5. Any word/character touching "(1 TIẾT)" or "(X TIẾT)" -> insert space
  res = res.replace(/([^\s\n>])\s*\((\d+)\s*(TIẾT|Tiết|tiết)\)/gi, '$1 ($2 TIẾT)');

  // 6. Any "(TIẾT1)" without space inside -> "(TIẾT 1)"
  res = res.replace(/\((TIẾT|Tiết|tiết)(\d+)\)/gi, '(TIẾT $2)');

  // 7. Normalize teaching tools phrases in HTML
  res = res.replace(/Phòng\s*thực\s*hành\s*máy\s*tính(?:\s*hoạt\s*động\s*tốt)?/gi, "Phòng máy tính");
  res = res.replace(/Máy\s*tính\s*thực\s*hành/gi, "Phòng máy tính");
  res = res.replace(/Bài\s*giảng(?:\s*điện\s*tử)?\s+(?:BÀI|Bài)\s*\d+[\.\:\s][^,;\.\n\r<]*/gi, "Bài giảng điện tử");
  res = res.replace(/Bài\s*giảng\s+(?:BÀI|Bài)\s*[^,;\.\n\r<]*/gi, "Bài giảng điện tử");
  res = res.replace(/Tranh\s*ảnh\s*(?:phóng\s*to\s*)?(?:các\s+)?Hình\s*([\d,\s\.\-–và]+)\s*SGK\s*Trang\s*\*,\s*([\d,\s\.\-–và]+)\s*(SGK\s*Trang\s*[\d,\s\.\-–và]+)/gi, 
    (_m, f1, f2, pages) => `Tranh ảnh Hình ${f1.trim().replace(/,\s*$/, "")}, ${f2.trim().replace(/^,\s*/, "")} ${pages.trim()}`
  );

  return res;
};

export const ensureAllSelectedQualities = (secIText: string, qualitiesList: string[] = ['Chăm chỉ', 'Trách nhiệm', 'Trung thực'], isAiAutoCompetency = false): string => {
  if (!secIText || isAiAutoCompetency || !qualitiesList || qualitiesList.length === 0) return secIText;
  let text = secIText;

  const defaultDescriptions: Record<string, string> = {
    'Chăm chỉ': 'Tích cực tham gia các hoạt động học tập, chăm chú quan sát và hoàn thành nhiệm vụ bài học.',
    'Trách nhiệm': 'Có trách nhiệm trong hoạt động nhóm, hoàn thành nhiệm vụ được phân công và giữ gìn đồ dùng học tập.',
    'Trung thực': 'Thật thà, khách quan trong việc chia sẻ ý kiến, báo cáo trung thực kết quả bài làm và đánh giá sản phẩm của bạn.',
    'Nhân ái': 'Biết tôn trọng, lắng nghe và sẵn sàng chia sẻ, giúp đỡ bạn bè trong giờ học.',
    'Yêu nước': 'Yêu thích việc tìm hiểu kiến thức môn học, có ý thức giữ gìn và phát huy các giá trị tốt đẹp.'
  };

  const pcMatch = text.match(/(?:^|\n)(?:#{1,6}\s*)?3\.\s*Phẩm\s*chất:?/i);
  if (!pcMatch) return text;

  for (const q of qualitiesList) {
    const qRegex = new RegExp(`(?:^|\\n)[\\s\\-\\+\\*•]*\\**${q}\\**`, 'i');
    if (!qRegex.test(text)) {
      const desc = defaultDescriptions[q] || `Nêu cao tinh thần ${q.toLowerCase()} trong các hoạt động học tập.`;
      const injection = `\n- **${q}:** ${desc}`;
      
      const nextSecMatch = text.search(/(?:\n|^)(?:#{1,6}\s*)?(?:II\.\s*|II\b)/i);
      if (nextSecMatch !== -1) {
        text = text.substring(0, nextSecMatch).trimEnd() + injection + '\n\n' + text.substring(nextSecMatch).trimStart();
      } else {
        text = text.trimEnd() + injection;
      }
    }
  }

  return text;
};

export const formatTeacherToolsString = (
  rawTeacherText: string,
  toolsList: string[] = [],
  subject = "Tin học",
  grade = "3",
  isAiAutoTools = false
): string => {
  const cleanSubject = subject.replace(/^Môn\s*học\s*:\s*/i, "").trim() || "Tin học";
  const cleanGradeStr = grade.replace(/^Lớp\s*/i, "").trim() || "3";
  const hasSGK = toolsList.some(t => t.toLowerCase().includes("sách giáo khoa") || t.toLowerCase().includes("sgk"));

  let content = rawTeacherText.trim();
  // Strip outer tags if any
  content = content.replace(/<\/?[^>]+(>|$)/g, "");
  // Strip book series in parentheses e.g. (Kết nối tri thức với cuộc sống), (Kết nối tri thức), (Chân trời sáng tạo), (Cánh diều)
  content = content.replace(/\s*\((?:bộ sách\s*)?(?:Kết nối tri thức(?: với cuộc sống)?|Chân trời sáng tạo|Cánh diều)[^)]*\)/gi, "");
  // Strip trailing periods, commas
  content = content.replace(/[\.\s,;]+$/, "").trim();

  // 1 & 2: "Phòng thực hành máy tính hoạt động tốt" & "Máy tính thực hành" -> "Phòng máy tính"
  content = content.replace(/Phòng\s*thực\s*hành\s*máy\s*tính(?:\s*hoạt\s*động\s*tốt)?/gi, "Phòng máy tính");
  content = content.replace(/Máy\s*tính\s*thực\s*hành/gi, "Phòng máy tính");

  // 4: "Bài giảng BÀI 4. LÀM VIỆC VỚI MÁY TÍNH (TIẾT 2)," -> "Bài giảng điện tử"
  content = content.replace(/Bài\s*giảng(?:\s*điện\s*tử)?\s+(?:BÀI|Bài)\s*\d+[\.\:\s][^,;\.\n\r<]*/gi, "Bài giảng điện tử");
  content = content.replace(/Bài\s*giảng\s+(?:BÀI|Bài)\s*[^,;\.\n\r<]*/gi, "Bài giảng điện tử");

  // 3: "Tranh ảnh Hình 26 SGK Trang *, 27, 28, 29, 30 SGK Trang 22, 23, 24" -> "Tranh ảnh Hình 26, 27, 28, 29, 30 SGK Trang 22, 23, 24"
  content = content.replace(/Tranh\s*ảnh\s*(?:phóng\s*to\s*)?(?:các\s+)?Hình\s*([\d,\s\.\-–và]+)\s*SGK\s*Trang\s*\*,\s*([\d,\s\.\-–và]+)\s*(SGK\s*Trang\s*[\d,\s\.\-–và]+)/gi, 
    (_m, f1, f2, pages) => {
      return `Tranh ảnh Hình ${f1.trim().replace(/,\s*$/, "")}, ${f2.trim().replace(/^,\s*/, "")} ${pages.trim()}`;
    }
  );

  // Strip "trong SGK [Môn] [Lớp]" before pages
  content = content.replace(/\s*trong\s+(?:SGK|sách giáo khoa)(?:\s+[a-zA-ZÀ-ỹ\s]+)?(?:\s+\d+)?(?=\s*(?:Trang|trang|[\.,;]|$))/gi, "");
  content = content.replace(/\s*trong\s+(?:SGK|sách giáo khoa)\b/gi, "");

  // Transform "tranh ảnh phóng to Hình 22, 23, 24, 25" -> "Tranh ảnh Hình 22, 23, 24, 25 SGK Trang *" (or Trang X if specified)
  content = content.replace(/(?:tranh\s*ảnh\s*phóng\s*to|Tranh\s*ảnh\s*phóng\s*to|tranh\s*ảnh|Tranh\s*ảnh)\s+(?:các\s+)?(Hình\s+[\d,\s\.\-–và]+)([^,;\.\n\r<]*)/gi, 
    (_m, fig, extra) => {
      const cleanFig = fig.trim().replace(/,\s*$/, "");
      const pageMatch = (extra || "").match(/(?:trang|Trang)\s*([\d,\s\-và]+)/i);
      if (pageMatch) {
        return `Tranh ảnh ${cleanFig} SGK Trang ${pageMatch[1].trim()}`;
      } else {
        return `Tranh ảnh ${cleanFig} SGK Trang *`;
      }
    }
  );

  // If there is any remaining "trong SGK"
  content = content.replace(/\s*trong SGK\s+[^\(\n\r,;]+/gi, "");
  content = content.replace(/\s*trong SGK\b/gi, "");

  // Split into existing items
  let existingItems = content ? content.split(/[,;]\s+/).map(i => i.trim()).filter(Boolean) : [];

  // Normalize items in existingItems:
  existingItems = existingItems.map(item => {
    let it = item.trim();
    if (/Phòng\s*thực\s*hành\s*máy\s*tính/i.test(it) || /Máy\s*tính\s*thực\s*hành/i.test(it)) {
      return "Phòng máy tính";
    }
    if (/^Bài\s*giảng\s+(?:BÀI|Bài)\b/i.test(it) || /^Bài\s*giảng(?:\s*điện\s*tử)?\s+(?:BÀI|Bài)\b/i.test(it)) {
      return "Bài giảng điện tử";
    }
    it = it.replace(/Tranh\s*ảnh\s*(?:phóng\s*to\s*)?(?:các\s+)?Hình\s*([\d,\s\.\-–và]+)\s*SGK\s*Trang\s*\*,\s*([\d,\s\.\-–và]+)\s*(SGK\s*Trang\s*[\d,\s\.\-–và]+)/gi, 
      (_m, f1, f2, pages) => `Tranh ảnh Hình ${f1.trim().replace(/,\s*$/, "")}, ${f2.trim().replace(/^,\s*/, "")} ${pages.trim()}`
    );
    return it;
  });

  // If in manual mode, handle SGK filter
  if (!isAiAutoTools) {
    if (!hasSGK) {
      existingItems = existingItems.filter(i => !/^(?:sách\s*giáo\s*khoa|sgk)\b/i.test(i));
    } else {
      let foundSGK = false;
      existingItems = existingItems.map(i => {
        if (/^(?:sách\s*giáo\s*khoa|sgk)\b/i.test(i)) {
          foundSGK = true;
          return `Sách giáo khoa ${cleanSubject} ${cleanGradeStr}`;
        }
        return i;
      });
      if (!foundSGK) {
        existingItems.unshift(`Sách giáo khoa ${cleanSubject} ${cleanGradeStr}`);
      }
    }
  }

  const resultItems = [...existingItems];
  const hasItemMatching = (pattern: RegExp) => resultItems.some(i => pattern.test(i));

  // If in manual mode, ensure all items in toolsList appear
  if (!isAiAutoTools) {
    toolsList.forEach(tool => {
      const tTrim = tool.trim();
      if (!tTrim) return;
      const tLower = tTrim.toLowerCase();

      if (tLower === "máy chiếu" || tLower.includes("máy chiếu")) {
        if (!hasItemMatching(/máy\s*chiếu/i)) {
          resultItems.push("Máy chiếu");
        }
      } else if (tLower.includes("bài giảng")) {
        if (!hasItemMatching(/bài\s*giảng/i)) {
          resultItems.push("Bài giảng điện tử");
        }
      } else if (tLower.includes("máy tính") || tLower === "máy tính") {
        if (!hasItemMatching(/máy\s*tính|phòng\s*máy\s*tính/i)) {
          resultItems.push("Máy tính");
        }
      } else if (tLower.includes("tranh ảnh")) {
        if (!hasItemMatching(/tranh\s*ảnh/i)) {
          resultItems.push("Tranh ảnh SGK Trang *");
        }
      } else if (tLower.includes("sách giáo khoa") || tLower.startsWith("sgk")) {
        if (!hasItemMatching(/sách\s*giáo\s*khoa|sgk/i)) {
          resultItems.push(`Sách giáo khoa ${cleanSubject} ${cleanGradeStr}`);
        }
      } else {
        if (!resultItems.some(i => i.toLowerCase().includes(tLower))) {
          resultItems.push(tTrim);
        }
      }
    });
  }

  // Deduplicate case-insensitively and filter out digital apps and learning games
  const deduped: string[] = [];
  resultItems.forEach(item => {
    let cleanItem = item.trim().replace(/^[\s,;]+|[\s,;]+$/g, "");
    if (!cleanItem) return;
    const l = cleanItem.toLowerCase();
    // Exclude tech applications and learning games per user requirement
    if (l.includes('ứng dụng') || l.includes('công nghệ số') || l.includes('trò chơi')) return;
    if (/(?:kahoot|quizizz|padlet|canva|wordwall|geogebra|liveworksheets|nearpod|mentimeter|blooket|gimkit|baamboozle|quizlet)/i.test(l)) return;
    if (/(?:ai nhanh hơn|rung chuông vàng|hộp quà bí mật|mảnh ghép kì diệu|mảnh ghép kỳ diệu|hộp quà bí ẩn|ô cửa bí mật|vòng quay may mắn|ai là triệu phú|ai là ai|thám tử mạng|mặt nạ cảm xúc)/i.test(l)) return;

    cleanItem = cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1);
    if (!deduped.some(d => d.toLowerCase() === cleanItem.toLowerCase())) {
      deduped.push(cleanItem);
    }
  });

  // If in AI auto mode and list is empty, provide default fallback
  if (isAiAutoTools && deduped.length === 0) {
    deduped.push("Máy chiếu", "Bài giảng điện tử", "Máy tính", "Tranh ảnh SGK Trang *");
  }

  // Sort by standard pedagogical order
  const getToolOrder = (item: string): number => {
    const l = item.toLowerCase();
    if (l.startsWith('sách giáo khoa') || l.startsWith('sgk')) return 1;
    if (l.includes('máy chiếu') || l.includes('tivi') || l.includes('ti vi')) return 2;
    if (l.includes('bài giảng')) return 3;
    if (l.includes('phòng máy tính')) return 4;
    if (l.includes('máy tính')) return 5;
    if (l.includes('tranh ảnh')) return 6;
    if (l.includes('phiếu bài tập') || l.includes('phiếu học tập')) return 7;
    return 8;
  };

  deduped.sort((a, b) => getToolOrder(a) - getToolOrder(b));

  return deduped.join(", ");
};

export const cleanSectionIIText = (
  secIIText: string, 
  toolsList: string[] = [], 
  subject = "Tin học", 
  grade = "3",
  isAiAutoTools = false
): string => {
  if (!secIIText) return secIIText;
  const cleanSubject = subject.replace(/^Môn\s*học\s*:\s*/i, "").trim() || "Tin học";
  const cleanGradeStr = grade.replace(/^Lớp\s*/i, "").trim() || "3";

  let lines = secIIText.split('\n');
  let hasGv = false;
  let hasHs = false;

  // Filter out any standalone lines mentioning apps or games from Section II
  lines = lines.filter(line => {
    const l = line.toLowerCase().trim();
    if (/^[\-\*\+]?\s*(?:ứng dụng|công nghệ số|trò chơi)\b/i.test(l)) return false;
    if (/(?:kahoot|quizizz|padlet|canva|wordwall|geogebra|liveworksheets|nearpod|mentimeter|blooket|gimkit|baamboozle|quizlet)/i.test(l) && !l.includes("giáo viên")) return false;
    if (/(?:ai nhanh hơn|rung chuông vàng|hộp quà bí mật|mảnh ghép kì diệu|mảnh ghép kỳ diệu|hộp quà bí ẩn|ô cửa bí mật|vòng quay may mắn|ai là triệu phú|ai là ai|thám tử mạng|mặt nạ cảm xúc)/i.test(l) && !l.includes("giáo viên")) return false;
    return true;
  });

  lines = lines.map(line => {
    let trimmed = line.trim();
    const lowercaseTrimmed = trimmed.toLowerCase();

    if (lowercaseTrimmed.includes("giáo viên") && !lowercaseTrimmed.startsWith("ii.") && !lowercaseTrimmed.includes("đối với giáo viên và học sinh")) {
      hasGv = true;
      const gvIndex = lowercaseTrimmed.indexOf("giáo viên");
      let rest = trimmed.substring(gvIndex + "giáo viên".length);
      rest = rest.replace(/^[\s\:\*\-\+\=]+/g, '').trim();

      const formatted = formatTeacherToolsString(rest, toolsList, cleanSubject, cleanGradeStr, isAiAutoTools);
      return `- Giáo viên: ${formatted}.`;
    }

    if (lowercaseTrimmed.includes("học sinh") && !lowercaseTrimmed.startsWith("ii.") && !lowercaseTrimmed.includes("đối với giáo viên và học sinh")) {
      hasHs = true;
      return `- Học sinh: SGK ${cleanSubject} ${cleanGradeStr}, VBT ${cleanSubject} ${cleanGradeStr}, vở ghi, dụng cụ học tập.`;
    }

    return line;
  });

  if (!hasGv) {
    const formatted = formatTeacherToolsString("", toolsList, cleanSubject, cleanGradeStr, isAiAutoTools);
    lines.push(`- Giáo viên: ${formatted}.`);
  }
  if (!hasHs) {
    lines.push(`- Học sinh: SGK ${cleanSubject} ${cleanGradeStr}, VBT ${cleanSubject} ${cleanGradeStr}, vở ghi, dụng cụ học tập.`);
  }

  return lines.join('\n');
};

export default function LessonPlanner() {
  // Tabs for School Stages
  const [activeStage, setActiveStage] = useState<'tieuhoc' | 'thcs' | 'thpt'>('tieuhoc');

  // Local state for Gemini API key to avoid 429 quota exhaustion or retry blocks
  const [personalApiKey, setPersonalApiKey] = useState(() => localStorage.getItem('personal_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Input states
  const [selectedGrade, setSelectedGrade] = useState('Lớp 3');
  const [selectedSubject, setSelectedSubject] = useState('Tin học');
  const [lessonDuration, setLessonDuration] = useState('2 Tiết');
  const [studentCountSize, setStudentCountSize] = useState('Vừa (20-35 HS)');
  const [selectedCurriculumBook, setSelectedCurriculumBook] = useState('Kết nối tri thức với cuộc sống');
  const [lessonChapter, setLessonChapter] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');

  const stageGrades: Record<'tieuhoc' | 'thcs' | 'thpt', string[]> = {
    tieuhoc: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
    thcs: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'],
    thpt: ['Lớp 10', 'Lớp 11', 'Lớp 12']
  };

  const stageSubjects: Record<'tieuhoc' | 'thcs' | 'thpt', string[]> = {
    tieuhoc: ['Tin học', 'Toán học', 'Tiếng Việt', 'Tiếng Anh', 'Tự nhiên và Xã hội', 'Đạo đức', 'Công nghệ', 'Âm nhạc', 'Mĩ thuật', 'Giáo dục thể chất'],
    thcs: ['Tin học', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Khoa học tự nhiên', 'Lịch sử và Địa lí', 'Giáo dục công dân', 'Công nghệ'],
    thpt: ['Tin học', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lí', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lí', 'Giáo dục kinh tế và pháp luật', 'Công nghệ']
  };

  const SPECIFIC_COMPETENCIES = ['Khoa học', 'Công nghệ', 'Tin học', 'Ngôn ngữ', 'Tính toán', 'Thẩm mỹ', 'Thể chất'];

  const getSubjectSpecificCompetency = (subject: string): string => {
    const s = (subject || '').toLowerCase();
    if (s.includes('tin học')) return 'Tin học';
    if (s.includes('công nghệ')) return 'Công nghệ';
    if (s.includes('thể chất') || s.includes('gdtc')) return 'Thể chất';
    if (s.includes('khoa học') || s.includes('tự nhiên') || s.includes('vật lí') || s.includes('hóa học') || s.includes('sinh học') || s.includes('địa lí') || s.includes('lịch sử')) return 'Khoa học';
    if (s.includes('toán')) return 'Tính toán';
    if (s.includes('tiếng') || s.includes('văn')) return 'Ngôn ngữ';
    if (s.includes('âm nhạc') || s.includes('mĩ thuật') || s.includes('mỹ thuật')) return 'Thẩm mỹ';
    return 'Tin học';
  };

  const getDefaultCompetencies = (subject: string): string[] => {
    const base = ['Tự chủ và tự học', 'Giao tiếp và hợp tác', 'Giải quyết vấn đề và sáng tạo', 'Năng lực số'];
    const specific = getSubjectSpecificCompetency(subject);
    if (specific && !base.includes(specific)) {
      return [...base, specific];
    }
    return base;
  };

  useEffect(() => {
    setSelectedGrade(stageGrades[activeStage][0]);
    setSelectedSubject(stageSubjects[activeStage][0]);
  }, [activeStage]);
  
  // Interactive Competencies (Năng lực cần phát triển)
  const [aiAutoCompetency, setAiAutoCompetency] = useState(false);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(() =>
    getDefaultCompetencies('Tin học')
  );
  const [customCompetency, setCustomCompetency] = useState('');

  const SPECIFIC_COMPETENCIES_LIST = [
    'Năng lực AI (theo QĐ 3439)',
    'Năng lực số',
    'Ngôn ngữ',
    'Tính toán',
    'Khoa học',
    'Công nghệ',
    'Tin học',
    'Thẩm mỹ',
    'Thể chất'
  ];

  const GENERAL_COMPETENCIES_LIST = [
    'Tự chủ và tự học',
    'Giao tiếp và hợp tác',
    'Giải quyết vấn đề và sáng tạo'
  ];

  const QUALITIES_LIST = [
    'Chăm chỉ',
    'Trách nhiệm',
    'Trung thực',
    'Nhân ái',
    'Yêu nước'
  ];

  const [selectedQualities, setSelectedQualities] = useState<string[]>([
    'Chăm chỉ', 'Trách nhiệm', 'Trung thực'
  ]);

  const toggleQuality = (q: string) => {
    setSelectedQualities(prev =>
      prev.includes(q) ? prev.filter(item => item !== q) : [...prev, q]
    );
  };

  const availableCompetencies = [
    ...SPECIFIC_COMPETENCIES_LIST,
    ...GENERAL_COMPETENCIES_LIST
  ];

  const toggleCompetency = (comp: string) => {
    if (comp === 'Năng lực AI (theo QĐ 3439)') {
      const willSelect = !selectedCompetencies.includes(comp);
      setAiPowerup(willSelect);
    }
    setSelectedCompetencies(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  // Auto-select subject-specific competency when selectedSubject changes
  useEffect(() => {
    const newSpecific = getSubjectSpecificCompetency(selectedSubject);
    setSelectedCompetencies(prev => {
      const withoutSpecifics = prev.filter(c => !SPECIFIC_COMPETENCIES.includes(c));
      const base = withoutSpecifics.length > 0 ? withoutSpecifics : ['Tự chủ và tự học', 'Giao tiếp và hợp tác', 'Giải quyết vấn đề và sáng tạo', 'Năng lực số'];
      if (!base.includes(newSpecific)) {
        return [...base, newSpecific];
      }
      return base;
    });
  }, [selectedSubject]);

  // AI Power-up (Năng lực Trí tuệ nhân tạo - AI)
  const [aiPowerup, setAiPowerup] = useState(false);

  // Teaching Tools (Đồ dùng dạy học)
  const [aiAutoTools, setAiAutoTools] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'Máy chiếu', 'Bài giảng điện tử', 'Máy tính', 'Tranh ảnh'
  ]);
  const [customTools, setCustomTools] = useState('');

  const availableTools = [
    'Máy chiếu', 'Bài giảng điện tử', 'Máy tính', 'Tranh ảnh', 'Sách giáo khoa', 'Tivi', 
    'Phiếu bài tập', 'Mô hình', 'Video clip', 'Bảng phụ', 'Thẻ từ', 'Dụng cụ thí nghiệm'
  ];

  // Technology & Games
  const [aiAutoTech, setAiAutoTech] = useState(false);
  const [techInputs, setTechInputs] = useState('');
  const [aiAutoGames, setAiAutoGames] = useState(false);
  const [gameInputs, setGameInputs] = useState('');

  // Teaching Methods (Phương pháp dạy học)
  const [aiAutoMethods, setAiAutoMethods] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([
    'Vấn đáp', 'Giải quyết vấn đề', 'Thực hành', 'Trò chơi'
  ]);
  const [customMethods, setCustomMethods] = useState('');

  const availableMethods = [
    'Vấn đáp', 'Giải quyết vấn đề', 'Thực hành', 'Trò chơi', 
    'Thảo luận nhóm', 'Trực quan', 'Dự án', 'Đóng vai', 'Kể chuyện', 'Khám phá'
  ];

  // Lesson Content Outline
  const [lessonContent, setLessonContent] = useState('');
  const [isLookingUpObjectives, setIsLookingUpObjectives] = useState(false);
  const [lastLookedUpTitle, setLastLookedUpTitle] = useState('');
  const [lookupSourceBadge, setLookupSourceBadge] = useState<string | null>(null);

  // Attached files list
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation result states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationPercent, setGenerationPercent] = useState(0);
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editablePlanText, setEditablePlanText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentPlanIsBasic, setCurrentPlanIsBasic] = useState(false);
  const [currentPlanIsGDPT2018, setCurrentPlanIsGDPT2018] = useState(true);
  const [currentPlanIsGDPT2018Detailed, setCurrentPlanIsGDPT2018Detailed] = useState(false);
  const [leftActiveTab, setLeftActiveTab] = useState<'preview' | 'edit'>('preview');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationTheme, setPresentationTheme] = useState<'light' | 'dark'>('dark');
  const [presentationFontSize, setPresentationFontSize] = useState<number>(20); // ideal larger projection size

  // Core Visual Editable States
  const [visualHtmlContent, setVisualHtmlContent] = useState<string>('');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const latestHtmlRef = useRef<string>('');
  const debounceTimeoutRef = useRef<any>(null);

  // Filters for Saved Lesson Plans History
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Lesson Plans History States
  const [savedHistory, setSavedHistory] = useState<SavedLessonPlan[]>([]);
  const [plannerTab, setPlannerTab] = useState<'create' | 'basic' | 'gdpt2018' | 'gdpt2018-detailed' | 'detailed' | 'preview-plan' | 'templates' | 'history'>('gdpt2018');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Layout customization states
  const [layoutHeaderStyle, setLayoutHeaderStyle] = useState<'standard' | 'simple'>('standard');
  const [layoutCustomObjectiveName, setLayoutCustomObjectiveName] = useState('I. YÊU CẦU CẦN ĐẠT');
  const [layoutCustomToolsName, setLayoutCustomToolsName] = useState('II. ĐỒ DÙNG DẠY HỌC');
  const [layoutCustomActivitiesName, setLayoutCustomActivitiesName] = useState('III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU');
  const [layoutCustomAdjustmentName, setLayoutCustomAdjustmentName] = useState('IV. ĐIỀU CHỈNH SAU BÀI DẠY');
  const [layoutIncludeQuiz, setLayoutIncludeQuiz] = useState(false);
  const [layoutIncludeHomework, setLayoutIncludeHomework] = useState(false);
  const [layoutIncludeAssessment, setLayoutIncludeAssessment] = useState(false);
  const [layoutExcludeSubActivities, setLayoutExcludeSubActivities] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lesson_planner_exclude_sub_activities');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleExcludeSubActivities = (val: boolean) => {
    SoundEffects.playTing();
    setLayoutExcludeSubActivities(val);
    localStorage.setItem('lesson_planner_exclude_sub_activities', String(val));
    showToast(val ? '🔒 Đã chuyển sang chế độ Chỉ soạn các Hoạt động lớn (không cần hoạt động nhỏ)!' : '🔓 Sẵn sàng soạn đầy đủ các hoạt động phụ.');
  };

  // New customizable template fields requested by user
  const [layoutCustomITCompetency, setLayoutCustomITCompetency] = useState('Năng lực đặc thù');
  const [layoutCustomGeneralCompetency, setLayoutCustomGeneralCompetency] = useState('Năng lực chung');
  const [layoutCustomQualities, setLayoutCustomQualities] = useState('Phẩm chất');
  const [layoutCustomPeriod1, setLayoutCustomPeriod1] = useState('TIẾT 1');
  const [layoutCustomPeriod2, setLayoutCustomPeriod2] = useState('TIẾT 2');
  const [layoutCustomActivity1, setLayoutCustomActivity1] = useState('Hoạt động 1: Khởi động, kết nối');
  const [layoutCustomActivity2, setLayoutCustomActivity2] = useState('Hoạt động 2: Khám phá, hình thành kiến thức');
  const [layoutCustomActivity3, setLayoutCustomActivity3] = useState('Hoạt động 3: Luyện tập, thực hành');
  const [layoutCustomActivity4, setLayoutCustomActivity4] = useState('Hoạt động 4: Vận dụng, trải nghiệm sáng tạo');

  // Period and Activity customizations (📅 QUẢN LÝ TIẾT DẠY mỗi tiết sẽ thêm 4 hoạt động)
  const [layoutPeriods, setLayoutPeriods] = useState<PeriodConfig[]>(() => {
    const defaultPeriods = [
      {
        id: 'p1', 
        name: 'TIẾT 1', 
        activities: [
          { id: 'p1_a1', name: 'Hoạt động 1: Khởi động, kết nối' },
          { id: 'p1_a2', name: 'Hoạt động 2: Khám phá, hình thành kiến thức' },
          { id: 'p1_a3', name: 'Hoạt động 3: Luyện tập, thực hành' },
          { id: 'p1_a4', name: 'Hoạt động 4: Vận dụng, trải nghiệm sáng tạo' }
        ]
      },
      {
        id: 'p2', 
        name: 'TIẾT 2', 
        activities: [
          { id: 'p2_a1', name: 'Hoạt động 1: Khởi động ôn tập Tiết 1 (Trò chơi Quiz ôn bài)' },
          { id: 'p2_a2', name: 'Hoạt động 2: Khám phá sâu, mở rộng đề tài' },
          { id: 'p2_a3', name: 'Hoạt động 3: Luyện tập, thực hành thực dụng' },
          { id: 'p2_a4', name: 'Hoạt động 4: Vận dụng hành động số sáng tạo' }
        ]
      },
      {
        id: 'p3',
        name: 'TIẾT 3',
        activities: [
          { id: 'p3_a1', name: 'Hoạt động 1: Khởi động ôn tập Tiết 2 (Trò chơi Quiz ôn bài)' },
          { id: 'p3_a2', name: 'Hoạt động 2: Khám phá phát triển và giải bài tập' },
          { id: 'p3_a3', name: 'Hoạt động 3: Luyện tập chuyên đề, thực hành' },
          { id: 'p3_a4', name: 'Hoạt động 4: Trải nghiệm liên kết thế giới thực tế' }
        ]
      },
      {
        id: 'p4',
        name: 'TIẾT 4',
        activities: [
          { id: 'p4_a1', name: 'Hoạt động 1: Khởi động ôn tập Tiết 3 (Trò chơi Quiz ôn bài)' },
          { id: 'p4_a2', name: 'Hoạt động 2: Đánh giá tư duy phân tích học tập' },
          { id: 'p4_a3', name: 'Hoạt động 3: Luyện tập tổng hợp liên chương' },
          { id: 'p4_a4', name: 'Hoạt động 4: Vận dụng công nghệ thông minh số' }
        ]
      }
    ];

    try {
      const saved = localStorage.getItem('lesson_planner_custom_periods_2145_v3'); // updated suffix to migrate immediately
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return defaultPeriods;
  });

  const [enableCustomPeriods, setEnableCustomPeriods] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lesson_planner_enable_custom_periods_2145');
      return saved !== 'false'; // Defaults to true if not set
    } catch {
      return true;
    }
  });

  const handleToggleCustomPeriods = (val: boolean) => {
    SoundEffects.playTing();
    setEnableCustomPeriods(val);
    localStorage.setItem('lesson_planner_enable_custom_periods_2145', String(val));
    showToast(val ? '📅 Đã kích hoạt tính năng Quản lý tiết dạy & Hoạt động!' : '📴 Đã tắt thiết lập tiết dạy tự chọn (Hệ thống sẽ tự phân phối mặc định).');
  };

  const handleAddPeriod = () => {
    SoundEffects.playTing();
    const nextNum = layoutPeriods.length + 1;
    const act1Name = nextNum >= 2 
      ? `Hoạt động 1: Khởi động ôn tập Tiết ${nextNum - 1} (Trò chơi Quiz ôn bài)` 
      : `Hoạt động 1: Khởi động, kết nối`;
    const newPeriod: PeriodConfig = {
      id: `period_${Date.now()}`,
      name: `TIẾT ${nextNum}`,
      activities: [
        { id: `act_${Date.now()}_1`, name: act1Name },
        { id: `act_${Date.now()}_2`, name: `Hoạt động 2: Khám phá, hình thành kiến thức` },
        { id: `act_${Date.now()}_3`, name: `Hoạt động 3: Luyện tập, thực hành` },
        { id: `act_${Date.now()}_4`, name: `Hoạt động 4: Vận dụng, trải nghiệm sáng tạo` }
      ]
    };
    const updated = [...layoutPeriods, newPeriod];
    setLayoutPeriods(updated);
    localStorage.setItem('lesson_planner_custom_periods_2145_v3', JSON.stringify(updated));
    showToast(`➕ Đã tạo thêm Tiết dạy ${nextNum} thành công!`);
  };

  const handleRemovePeriod = (periodId: string) => {
    SoundEffects.playTing();
    const updated = layoutPeriods.filter(p => p.id !== periodId);
    setLayoutPeriods(updated);
    localStorage.setItem('lesson_planner_custom_periods_2145_v3', JSON.stringify(updated));
    showToast(`🗑️ Đã xóa một tiết dạy khỏi cấu trúc.`);
  };

  const handleUpdatePeriodName = (periodId: string, name: string) => {
    const updated = layoutPeriods.map(p => {
      if (p.id === periodId) return { ...p, name };
      return p;
    });
    setLayoutPeriods(updated);
    localStorage.setItem('lesson_planner_custom_periods_2145_v3', JSON.stringify(updated));
  };

  const handleAddActivityToPeriod = (periodId: string) => {
    SoundEffects.playTing();
    const updated = layoutPeriods.map(p => {
      if (p.id === periodId) {
        const nextIdx = p.activities.length + 1;
        return {
          ...p,
          activities: [
            ...p.activities,
            { id: `act_${Date.now()}_${nextIdx}`, name: `Hoạt động ${nextIdx}: Tên hoạt động mới` }
          ]
        };
      }
      return p;
    });
    setLayoutPeriods(updated);
    localStorage.setItem('lesson_planner_custom_periods_2145_v3', JSON.stringify(updated));
    showToast(`➕ Đã thêm hoạt động mới.`);
  };

  const handleRemoveActivityFromPeriod = (periodId: string, actId: string) => {
    SoundEffects.playTing();
    const updated = layoutPeriods.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          activities: p.activities.filter(a => a.id !== actId)
        };
      }
      return p;
    });
    setLayoutPeriods(updated);
    localStorage.setItem('lesson_planner_custom_periods_2145_v3', JSON.stringify(updated));
    showToast(`🗑️ Đã xóa một hoạt động.`);
  };

  const handleUpdateActivityName = (periodId: string, actId: string, name: string) => {
    const updated = layoutPeriods.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          activities: p.activities.map(a => {
            if (a.id === actId) return { ...a, name };
            return a;
          })
        };
      }
      return p;
    });
    setLayoutPeriods(updated);
    localStorage.setItem('lesson_planner_custom_periods_2145_v3', JSON.stringify(updated));
  };

  // Hook to parse and handle shared/imported lesson plans from query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
        if (decoded) {
          if (decoded.t) setLessonTitle(decoded.t);
          if (decoded.g) setSelectedGrade(decoded.g);
          if (decoded.s) setSelectedSubject(decoded.s);
          if (decoded.d) setLessonDuration(decoded.d);
          if (decoded.st) setActiveStage(decoded.st);
          if (decoded.sc) setStudentCountSize(decoded.sc);
          if (decoded.c) setSelectedCompetencies(decoded.c);
          if (decoded.tl) setSelectedTools(decoded.tl);
          if (decoded.m) setSelectedMethods(decoded.m);
          if (decoded.ti) setTechInputs(decoded.ti);
          if (decoded.gi) setGameInputs(decoded.gi);
          if (decoded.lc) setLessonContent(decoded.lc);
          
          if (decoded.lh) setLayoutHeaderStyle(decoded.lh);
          if (decoded.co) setLayoutCustomObjectiveName(decoded.co);
          if (decoded.ct) setLayoutCustomToolsName(decoded.ct);
          if (decoded.ca) setLayoutCustomActivitiesName(decoded.ca);
          if (decoded.iq !== undefined) setLayoutIncludeQuiz(decoded.iq);
          if (decoded.ih !== undefined) setLayoutIncludeHomework(decoded.ih);
          if (decoded.ia !== undefined) setLayoutIncludeAssessment(decoded.ia);

          if (decoded.pl) {
            setGeneratedLessonPlan(decoded.pl);
            setEditablePlanText(decoded.pl);
            
            const isHtml = decoded.pl.trim().startsWith('<div') || decoded.pl.trim().includes('style=');
            const sharedHtml = isHtml 
              ? fixLessonTitlePeriodSpacing(decoded.pl) 
              : renderLessonPlanToHtml(decoded.pl, decoded.t || lessonTitle, decoded.s || selectedSubject, decoded.g || selectedGrade, decoded.d || lessonDuration);
            const sanitizedHtml = fixLessonTitlePeriodSpacing(sharedHtml);
            setVisualHtmlContent(sanitizedHtml);
            latestHtmlRef.current = sanitizedHtml;
            setUndoStack([sanitizedHtml]);
            setRedoStack([]);
            
            setShowResultModal(true);
          }
          
          // Show toast alert
          setToastMessage("📥 Đã tải thành công giáo án chia sẻ từ đồng nghiệp!");
          setTimeout(() => {
            setToastMessage(null);
          }, 4000);
          
          // Clean parameters in URL cleanly without page reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error("Error loading shared plan:", e);
      }
    }
  }, []);

  useEffect(() => {
    const historicalPlans = localStorage.getItem('lesson_plan_history_2345');
    if (historicalPlans) {
      try {
        setSavedHistory(JSON.parse(historicalPlans));
      } catch (e) {
        console.error("Error loading lesson plan history:", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleViewHistoryItem = (item: SavedLessonPlan) => {
    setLessonTitle(item.title);
    setSelectedGrade(item.grade);
    setSelectedSubject(item.subject);
    setLessonDuration(item.duration);
    setActiveStage(item.stage);
    setStudentCountSize(item.studentCount);
    setSelectedCompetencies(item.competencies || []);
    setSelectedTools(item.tools || []);
    setSelectedMethods(item.methods || []);
    setTechInputs(item.techInputs || '');
    setGameInputs(item.gameInputs || '');
    setLessonContent(item.lessonContent || '');
    setAiAutoCompetency(item.aiAutoCompetency ?? true);
    setAiPowerup(item.aiPowerup ?? true);
    setAiAutoTools(item.aiAutoTools ?? true);
    setAiAutoTech(item.aiAutoTech ?? true);
    setAiAutoGames(item.aiAutoGames ?? true);
    setAiAutoMethods(item.aiAutoMethods ?? true);
    setCurrentPlanIsBasic(!!item.isBasic);
    if (item.periods) {
      setLayoutPeriods(item.periods);
    }

    setGeneratedLessonPlan(item.plan);
    setEditablePlanText(item.plan);

    // Initialize visual editing states for the opened history item
    const isHtml = item.plan.trim().startsWith('<div') || item.plan.trim().includes('style=');
    const loadedHtml = isHtml 
      ? fixLessonTitlePeriodSpacing(item.plan) 
      : renderLessonPlanToHtml(item.plan, item.title, item.subject, item.grade, item.duration);
    const sanitizedHtml = fixLessonTitlePeriodSpacing(loadedHtml);
    setVisualHtmlContent(sanitizedHtml);
    latestHtmlRef.current = sanitizedHtml;
    setUndoStack([sanitizedHtml]);
    setRedoStack([]);

    setShowResultModal(true);
    SoundEffects.playTing();
    showToast(`👁️ Đang mở giáo án: ${item.title}`);
  };

  const handleRestoreHistoryItem = (item: SavedLessonPlan) => {
    setLessonTitle(item.title);
    setSelectedGrade(item.grade);
    setSelectedSubject(item.subject);
    setLessonDuration(item.duration);
    setActiveStage(item.stage);
    setStudentCountSize(item.studentCount);
    setSelectedCompetencies(item.competencies || []);
    setSelectedTools(item.tools || []);
    setSelectedMethods(item.methods || []);
    setTechInputs(item.techInputs || '');
    setGameInputs(item.gameInputs || '');
    setLessonContent(item.lessonContent || '');
    setAiAutoCompetency(item.aiAutoCompetency ?? true);
    setAiPowerup(item.aiPowerup ?? true);
    setAiAutoTools(item.aiAutoTools ?? true);
    setAiAutoTech(item.aiAutoTech ?? true);
    setAiAutoGames(item.aiAutoGames ?? true);
    setAiAutoMethods(item.aiAutoMethods ?? true);
    setCurrentPlanIsBasic(!!item.isBasic);
    setCurrentPlanIsGDPT2018(!!item.isGDPT2018);
    if (item.periods) {
      setLayoutPeriods(item.periods);
    }

    setGeneratedLessonPlan(item.plan);
    setEditablePlanText(item.plan);

    // Initialize HTML and undo/redo stacks
    const isHtml = item.plan.trim().startsWith('<div') || item.plan.trim().includes('style=');
    const loadedHtml = isHtml 
      ? fixLessonTitlePeriodSpacing(item.plan) 
      : renderLessonPlanToHtml(item.plan, item.title, item.subject, item.grade, item.duration);
    const sanitizedHtml = fixLessonTitlePeriodSpacing(loadedHtml);
    setVisualHtmlContent(sanitizedHtml);
    latestHtmlRef.current = sanitizedHtml;
    setUndoStack([sanitizedHtml]);
    setRedoStack([]);

    setPlannerTab('preview-plan');
    SoundEffects.playTing();
    showToast(`📋 Đã khôi phục các thông số bài học & văn bản: ${item.title}`);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedHistory.filter(h => h.id !== id);
    setSavedHistory(updated);
    localStorage.setItem('lesson_plan_history_2345', JSON.stringify(updated));
    showToast(`🗑️ Đã xóa giáo án lưu trữ khỏi lịch sử.`);
  };

  const handleUpdateStatus = (id: string, newStatus: SavedLessonPlan['status']) => {
    const updated = savedHistory.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setSavedHistory(updated);
    localStorage.setItem('lesson_plan_history_2345', JSON.stringify(updated));
    showToast("💾 Đã lưu thay đổi trạng thái tiến độ!");
  };

  const handleShareLessonPlan = (item: SavedLessonPlan) => {
    try {
      const shareObj = {
        t: item.title,
        g: item.grade,
        s: item.subject,
        d: item.duration,
        st: item.stage,
        sc: item.studentCount,
        c: item.competencies,
        tl: item.tools,
        m: item.methods,
        ti: item.techInputs,
        gi: item.gameInputs,
        lc: item.lessonContent,
        pl: item.plan,
        lh: item.id.startsWith('tpl-') ? 'standard' : 'standard',
        co: 'I. YÊU CẦU CẦN ĐẠT',
        ct: 'II. ĐỒ DÙNG DẠY HỌC',
        ca: 'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU'
      };
      
      const jsonString = JSON.stringify(shareObj);
      const enc = btoa(unescape(encodeURIComponent(jsonString)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${enc}`;
      
      navigator.clipboard.writeText(shareUrl);
      showToast("🔗 Đã sao chép link chia sẻ vào bộ nhớ tạm! Thầy Cô có thể gửi ngay cho đồng nghiệp.");
    } catch (e) {
      console.error(e);
      showToast("❌ Không thể tạo liên kết chia sẻ.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(item => item !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const toggleMethod = (method: string) => {
    if (selectedMethods.includes(method)) {
      setSelectedMethods(selectedMethods.filter(item => item !== method));
    } else {
      setSelectedMethods([...selectedMethods, method]);
    }
  };

  // Drag & Drop File Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data prefix like "data:image/png;base64,"
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList) => {
    const updated = [...attachedFiles];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 8 * 1024 * 1024) {
        showToast(`❌ File ${file.name} vượt quá giới hạn 8MB!`);
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        updated.push({
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          base64: base64
        });
      } catch (err) {
        console.error("Lỗi mã hóa file:", err);
      }
    }
    setAttachedFiles(updated);
    SoundEffects.playTing();
    showToast(`📎 Đã tải lên ${files.length} tệp tài liệu thành công!`);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleAddResourceToTools = (resTitle: string) => {
    if (!selectedTools.includes(resTitle)) {
      setSelectedTools([...selectedTools, resTitle]);
      setToastMessage(`➕ Đã trích dẫn "${resTitle}" vào Đồ dùng dạy học!`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    } else {
      setToastMessage(`ℹ️ "${resTitle}" đã có sẵn trong Đồ dùng dạy học.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }
  };

  // Tra cứu tự động mục tiêu "Sau bài học này em sẽ" từ taphuan.nxbgd.vn
  const handleLookupObjectives = async (overrideTitle?: string, isAuto = false) => {
    const title = (overrideTitle !== undefined ? overrideTitle : lessonTitle).trim();
    if (!title || title.length < 3) {
      if (!isAuto) showToast('⚠️ Vui lòng nhập Tên bài học trước khi tra cứu!');
      return;
    }
    if (isAuto && title === lastLookedUpTitle) return;

    setIsLookingUpObjectives(true);
    try {
      const personalKey = personalApiKey || localStorage.getItem('personal_gemini_api_key') || '';
      const resp = await fetch('/api/lookup-lesson-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(personalKey ? { 'x-gemini-key': personalKey } : {})
        },
        body: JSON.stringify({
          title,
          grade: selectedGrade,
          subject: selectedSubject
        })
      });

      const data = await resp.json();
      if (data && data.success && data.objectives) {
        setLessonContent(data.objectives);
        setLastLookedUpTitle(title);
        setLookupSourceBadge(data.source || 'taphuan.nxbgd.vn');
        showToast(`✨ Đã tự động điền mục "Sau bài học này em sẽ" từ taphuan.nxbgd.vn!`);
      }
    } catch (err: any) {
      console.warn("Lookup taphuan objectives error:", err);
    } finally {
      setIsLookingUpObjectives(false);
    }
  };

  // Tự động kích hoạt tra cứu taphuan.nxbgd.vn khi Tên bài học thay đổi ở Thẻ Giáo án Cơ bản, GDPT 2018 và Chi tiết
  useEffect(() => {
    if (plannerTab !== 'basic' && plannerTab !== 'detailed' && plannerTab !== 'gdpt2018' && plannerTab !== 'gdpt2018-detailed') return;
    const trimmed = lessonTitle.trim();
    if (trimmed.length < 4) return;
    if (trimmed === lastLookedUpTitle) return;

    const timer = setTimeout(() => {
      handleLookupObjectives(trimmed, true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [lessonTitle, plannerTab, selectedGrade, selectedSubject, lastLookedUpTitle]);

  const handleResetForm = () => {
    setLessonTitle('');
    setSelectedGrade('Lớp 3');
    setSelectedSubject('Tin học');
    setLessonDuration('1 Tiết');
    setStudentCountSize('Vừa (20-35 HS)');
    setSelectedCurriculumBook('Kết nối tri thức với cuộc sống');
    setLessonChapter('');
    setSelectedCompetencies(getDefaultCompetencies('Tin học'));
    setSelectedTools(['Máy chiếu', 'Bài giảng điện tử', 'Máy tính', 'Tranh ảnh']);
    setSelectedMethods(['Vấn đáp', 'Giải quyết vấn đề', 'Thực hành', 'Trò chơi']);
    setTechInputs('');
    setGameInputs('');
    setLessonContent('');
    setCustomCompetency('');
    setCustomTools('');
    setCustomMethods('');
    setAttachedFiles([]);
    setGeneratedLessonPlan(null);
    showToast('🔄 Đã làm mới form soạn bài!');
  };

  // Submit and call server-side endpoint
  const handleGeneratePlan = async (type: 'basic' | 'gdpt2018' | 'gdpt2018-detailed' | 'detailed' = 'gdpt2018') => {
    if (!lessonTitle.trim()) {
      showToast('⚠️ Vui lòng nhập Tên bài học trước khi tạo!');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    setGeneratedLessonPlan(null);
    setCurrentPlanIsBasic(type === 'basic' || type === 'gdpt2018' || type === 'gdpt2018-detailed');

    // Animation progress stages simulation
    const steps = [
      'Đang phân tích định quy chuẩn Công văn 2345...',
      'Đang tham chiếu tài liệu SGK đính kèm...',
      'Đang tích hợp Năng lực Trí tuệ nhân tạo (AI)...',
      'Đang xây dựng thiết bị và công cụ hỗ trợ...',
      'Đang dệt các hoạt động Khởi động - Luyện tập - Trải nghiệm...',
      'Đang hoàn thiện Kế hoạch bài dạy chuyên nghiệp...'
    ];

    let currentStepIndex = 0;
    setGenerationStep(steps[currentStepIndex]);
    setGenerationPercent(5);

    const stepInterval = setInterval(() => {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        setGenerationStep(steps[currentStepIndex]);
      }
    }, 2800);

    const progressInterval = setInterval(() => {
      setGenerationPercent((prev) => {
        if (prev >= 98) return prev;
        const diff = 100 - prev;
        const inc = Math.max(1, Math.round(diff * 0.04));
        return prev + inc;
      });
    }, 250);

    try {
      // Prepare effective periods: in Basic mode (or if custom periods is disabled), strictly enforce the periods matching lessonDuration with 4 activities per period
      const numPeriods = parseInt(lessonDuration.replace(/\D/g, '')) || 1;
      const autoBasicPeriods: PeriodConfig[] = [];
      for (let p = 1; p <= numPeriods; p++) {
        const isPeriod2OrMore = p >= 2;
        const warmupName = isPeriod2OrMore
          ? (aiAutoGames || gameInputs.trim()
              ? `Khởi động - Trò chơi Ôn tập kiến thức Tiết ${p - 1} (5 phút)`
              : `Khởi động - Ôn tập kiến thức Tiết ${p - 1} và kết nối bài mới (5 phút)`)
          : (aiAutoGames || gameInputs.trim()
              ? `Khởi động - Trò chơi Khởi động dựa vào tài liệu đính kèm (5 phút)`
              : `Khởi động - Quan sát tranh/tình huống khởi động trong tài liệu đính kèm (5 phút)`);
        autoBasicPeriods.push({
          id: `period_${p}`,
          name: `TIẾT ${p}`,
          activities: [
            { id: `act_${p}_1`, name: warmupName },
            { id: `act_${p}_2`, name: `Khám phá - Nội dung cốt lõi từ tài liệu đính kèm (18 phút)` },
            { id: `act_${p}_3`, name: `Luyện tập - Bài tập thực hành từ tài liệu đính kèm (7 phút)` },
            { id: `act_${p}_4`, name: `Vận dụng - Tình huống vận dụng từ tài liệu đính kèm (5 phút)` }
          ]
        });
      }

      const effectivePeriods = (type === 'basic' || type === 'gdpt2018' || !enableCustomPeriods) ? autoBasicPeriods : layoutPeriods;

      // Build parameters payload
      const payload = {
        stage: activeStage,
        grade: selectedGrade,
        subject: selectedSubject,
        duration: lessonDuration,
        studentCount: studentCountSize,
        title: lessonTitle,
        curriculumBook: type === 'gdpt2018' ? 'Kết nối tri thức với cuộc sống' : selectedCurriculumBook,
        chapter: lessonChapter,
        topic: lessonChapter,
        aiAutoCompetency,
        competencies: selectedCompetencies,
        specificCompetencies: selectedCompetencies.filter(c => SPECIFIC_COMPETENCIES_LIST.includes(c)),
        generalCompetencies: selectedCompetencies.filter(c => GENERAL_COMPETENCIES_LIST.includes(c)),
        qualities: selectedQualities,
        customCompetency,
        aiPowerup,
        aiAutoTools,
        tools: selectedTools,
        customTools,
        aiAutoTech,
        techInputs,
        aiAutoGames,
        gameInputs,
        aiAutoMethods,
        methods: selectedMethods,
        customMethods,
        lessonContent,
        images: attachedFiles.map(f => ({ name: f.name, type: f.type, data: f.base64 })),
        layoutOptions: {
          headerStyle: layoutHeaderStyle,
          customObjectiveName: layoutCustomObjectiveName,
          customToolsName: layoutCustomToolsName,
          customActivitiesName: layoutCustomActivitiesName,
          customAdjustmentName: layoutCustomAdjustmentName,
          includeQuiz: layoutIncludeQuiz,
          includeHomework: layoutIncludeHomework,
          includeAssessment: layoutIncludeAssessment,
          excludeSubActivities: layoutExcludeSubActivities,
          customITCompetency: layoutCustomITCompetency,
          customGeneralCompetency: layoutCustomGeneralCompetency,
          customQualities: layoutCustomQualities,
          customPeriod1: layoutCustomPeriod1,
          customPeriod2: layoutCustomPeriod2,
          customActivity1: layoutCustomActivity1,
          customActivity2: layoutCustomActivity2,
          customActivity3: layoutCustomActivity3,
          customActivity4: layoutCustomActivity4,
          periods: effectivePeriods,
          isBasic: type === 'basic' || type === 'gdpt2018' || type === 'gdpt2018-detailed',
          isGDPT2018: type === 'gdpt2018' || type === 'gdpt2018-detailed',
          isGDPT2018Detailed: type === 'gdpt2018-detailed',
          mode: type === 'gdpt2018-detailed' ? 'gdpt2018_detailed' : type
        }
      };

      const personalKey = personalApiKey || localStorage.getItem('personal_gemini_api_key') || '';

      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': personalKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Máy chủ phản hồi lỗi!');
      }

      const data = await response.json();
      
      if (!data.plan || !data.plan.trim() || data.plan.includes('Không có kết quả trả về từ Gemini')) {
        throw new Error('AI chưa trả về nội dung giáo án hoàn chỉnh. Thầy Cô vui lòng bấm "Soạn giáo án" để tạo lại!');
      }

      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setGenerationPercent(100);

      // Clean up LaTeX arrow artifacts everywhere
      let cleanPlan = cleanLatexArrows(data.plan);

      // Normalize space between lesson title and period (e.g. "QUYẾT ĐỊNH(TIẾT 1)" -> "QUYẾT ĐỊNH (TIẾT 1)")
      cleanPlan = cleanPlan.replace(/([^\s\n>])\((TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*(\d*)\)/gi, (_m, p1, p2, p3) => {
        return p3 ? `${p1} (${p2} ${p3})` : `${p1} (${p2})`;
      });
      cleanPlan = cleanPlan.replace(/\((TIẾT|Tiết|tiết)(\d+)\)/gi, "($1 $2)");
      cleanPlan = cleanPlan.replace(/([^\s\n>])\s*\((\d+)\s*(TIẾT|Tiết|tiết)\)/gi, "$1 ($2 $3)");

      // Clean redundant rows or noise lines between TIẾT header and Activity 1 in GDPT 2018 for all periods
      cleanPlan = cleanPlan
        .replace(/(###\s*TIẾT\s*[2-9][^\n]*\n)(?:[\s\S]*?)(?=#{1,6}\s*(?:\d+[\.\:]\s*)?Hoạt\s*động\s*1)/gi, (match, tietHeader) => {
          return tietHeader + '\n';
        });

      // Ensure "I. YÊU CẦU CẦN ĐẠT ### 1. Năng lực đặc thù" is split into two separate lines
      cleanPlan = cleanPlan
        .replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*|\s+)?1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, (type === 'gdpt2018' || type === 'gdpt2018-detailed') ? "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù" : "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù:")
        .replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*)+/gi, "I. YÊU CẦU CẦN ĐẠT:\n");

      // Normalize teaching tools phrases
      cleanPlan = cleanPlan.replace(/Phòng\s*thực\s*hành\s*máy\s*tính(?:\s*hoạt\s*động\s*tốt)?/gi, "Phòng máy tính");
      cleanPlan = cleanPlan.replace(/Máy\s*tính\s*thực\s*hành/gi, "Phòng máy tính");
      cleanPlan = cleanPlan.replace(/Bài\s*giảng(?:\s*điện\s*tử)?\s+(?:BÀI|Bài)\s*\d+[\.\:\s][^,;\.\n\r<]*/gi, "Bài giảng điện tử");
      cleanPlan = cleanPlan.replace(/Bài\s*giảng\s+(?:BÀI|Bài)\s*[^,;\.\n\r<]*/gi, "Bài giảng điện tử");
      cleanPlan = cleanPlan.replace(/Tranh\s*ảnh\s*(?:phóng\s*to\s*)?(?:các\s+)?Hình\s*([\d,\s\.\-–và]+)\s*SGK\s*Trang\s*\*,\s*([\d,\s\.\-–và]+)\s*(SGK\s*Trang\s*[\d,\s\.\-–và]+)/gi, 
        (_m, f1, f2, pages) => `Tranh ảnh Hình ${f1.trim().replace(/,\s*$/, "")}, ${f2.trim().replace(/^,\s*/, "")} ${pages.trim()}`
      );

      // Bold digital applications and learning games in cleanPlan
      const appAndGameKeywords = [
        'Kahoot', 'Quizizz', 'Padlet', 'Canva', 'Wordwall', 'GeoGebra', 'Liveworksheets',
        'Ai nhanh hơn', 'Rung chuông vàng', 'Hộp quà bí mật', 'Mảnh ghép kì diệu'
      ];
      if (techInputs && techInputs.trim() && !techInputs.startsWith('VD:')) {
        appAndGameKeywords.push(techInputs.trim().replace(/^['"“]+|['"”]+$/g, ''));
      }
      if (gameInputs && gameInputs.trim() && !gameInputs.startsWith('Mô tả')) {
        appAndGameKeywords.push(gameInputs.trim().replace(/^['"“]+|['"”]+$/g, ''));
      }
      appAndGameKeywords.sort((a, b) => b.length - a.length);

      appAndGameKeywords.forEach(kw => {
        const cleanKw = kw.trim();
        if (!cleanKw || cleanKw.length < 2) return;
        const escaped = cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<!\\*\\*)\\b(${escaped})\\b(?!\\*\\*)`, 'gi');
        cleanPlan = cleanPlan.replace(regex, '**$1**');
      });
      cleanPlan = cleanPlan.replace(/\*{4,}/g, '**');

      // Ensure Section II teaching tools are formatted and include all selected tools in cleanPlan (strictly NO tech apps or games in Section II)
      cleanPlan = cleanPlan.replace(/(?:^|\n)(#{1,6}\s*II\.\s*(?:ĐỒ\s*DÙNG|THIẾT\s*BỊ)\s*DẠY\s*HỌC[\s\S]*?)(?=(?:^|\n)#{1,6}\s*III|\n---|\n===|$)/gi, (match) => {
        return cleanSectionIIText(match, selectedTools, selectedSubject, selectedGrade, aiAutoTools);
      });

      setGeneratedLessonPlan(cleanPlan);
      setEditablePlanText(cleanPlan);
      setCurrentPlanIsBasic(type === 'basic');
      setCurrentPlanIsGDPT2018(type === 'gdpt2018' || type === 'gdpt2018-detailed');
      setCurrentPlanIsGDPT2018Detailed(type === 'gdpt2018-detailed');

      // Initialize visual edit states with newly generated content
      const generatedHtml = renderLessonPlanToHtml(cleanPlan, lessonTitle, selectedSubject, selectedGrade, lessonDuration, false, type === 'basic', (type === 'gdpt2018' || type === 'gdpt2018-detailed'), lessonChapter, selectedQualities, selectedTools, aiAutoCompetency, aiAutoTools);
      const sanitizedHtml = fixLessonTitlePeriodSpacing(generatedHtml);
      setVisualHtmlContent(sanitizedHtml);
      latestHtmlRef.current = sanitizedHtml;
      setUndoStack([sanitizedHtml]);
      setRedoStack([]);

      // Save to History List
      const newPlan: SavedLessonPlan = {
        id: Date.now().toString(),
        createdAt: new Date().toLocaleString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }),
        title: lessonTitle,
        grade: selectedGrade,
        subject: selectedSubject,
        duration: lessonDuration,
        stage: activeStage,
        studentCount: studentCountSize,
        competencies: selectedCompetencies,
        tools: selectedTools,
        methods: selectedMethods,
        techInputs: techInputs,
        gameInputs: gameInputs,
        lessonContent: lessonContent,
        plan: data.plan,
        aiAutoCompetency,
        aiPowerup,
        aiAutoTools,
        aiAutoTech,
        aiAutoGames,
        aiAutoMethods,
        status: 'draft',
        isBasic: type === 'basic',
        isGDPT2018: type === 'gdpt2018',
        periods: effectivePeriods
      };

      const updated = [newPlan, ...savedHistory];
      setSavedHistory(updated);
      localStorage.setItem('lesson_plan_history_2345', JSON.stringify(updated));

      setShowResultModal(true);
      SoundEffects.playKeng();
      showToast('🎉 Đã soạn thành công Giáo án Chuẩn Quốc gia Công văn 2345!');
    } catch (err: any) {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      console.error(err);
      const errMsg = err.message || 'Gặp lỗi trong quá trình kết nối với AI Studio. Vui lòng thử lại!';
      setGenerationError(errMsg);
      showToast('❌ ' + errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(editablePlanText);
    setCopied(true);
    showToast('📋 Đã sao chép nội dung giáo án vào bộ nhớ tạm!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Push changes to undo stack
  const pushToUndo = (newHtml: string) => {
    setUndoStack(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === newHtml) {
        return prev;
      }
      return [...prev, newHtml];
    });
    setRedoStack([]);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      latestHtmlRef.current = currentHtml;
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        pushToUndo(currentHtml);
        
        // Keep the raw text state synced in the background for exports/checks
        const temp = document.createElement('div');
        temp.innerHTML = currentHtml;
        const plainText = temp.innerText || temp.textContent || '';
        setEditablePlanText(plainText);
      }, 700);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];
      
      setUndoStack(prev => prev.slice(0, prev.length - 1));
      setRedoStack(prev => [...prev, currentState]);
      
      setVisualHtmlContent(previousState);
      latestHtmlRef.current = previousState;
      if (editorRef.current) {
        editorRef.current.innerHTML = previousState;
      }
      
      const temp = document.createElement('div');
      temp.innerHTML = previousState;
      const plainText = temp.innerText || temp.textContent || '';
      setEditablePlanText(plainText);
      
      SoundEffects.playTing();
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      
      setRedoStack(prev => prev.slice(0, prev.length - 1));
      setUndoStack(prev => [...prev, nextState]);
      
      setVisualHtmlContent(nextState);
      latestHtmlRef.current = nextState;
      if (editorRef.current) {
        editorRef.current.innerHTML = nextState;
      }
      
      const temp = document.createElement('div');
      temp.innerHTML = nextState;
      const plainText = temp.innerText || temp.textContent || '';
      setEditablePlanText(plainText);
      
      SoundEffects.playTing();
    }
  };

  // Modern copy for excellente standard Word format (Hội thi giáo viên giỏi)
  const handleCopyRichText = async () => {
    try {
      const htmlToCopy = latestHtmlRef.current || visualHtmlContent || renderLessonPlanToHtml(editablePlanText, lessonTitle, selectedSubject, selectedGrade, lessonDuration);
      
      const tempElement = document.createElement('div');
      tempElement.innerHTML = htmlToCopy;
      const plainText = tempElement.innerText || tempElement.textContent || '';
      
      const blobHtml = new Blob([htmlToCopy], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      
      const dataToClipboard = [
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        })
      ];
      
      await navigator.clipboard.write(dataToClipboard);
      showToast('✨ Đã sao chép nhanh với định dạng chuẩn Hội thi Giáo viên Giỏi! Thầy Cô có thể dán vào Word (Ctrl+V) ngay.');
    } catch (err) {
      console.error(err);
      navigator.clipboard.writeText(editablePlanText);
      showToast('📋 Đã sao chép nội dung giáo án thành công!');
    }
  };

  interface ComplianceResult {
    score: number;
    status: 'excellent' | 'warning' | 'danger';
    details: {
      id: string;
      title: string;
      passed: boolean;
      message: string;
      suggestion: string;
    }[];
  }

  const checkTaphuanCompliance = (
    text: string, 
    titleStr: string, 
    subjectStr: string, 
    gradeStr: string, 
    excludeSub: boolean
  ): ComplianceResult => {
    if (!text) {
      return { score: 100, status: 'excellent', details: [] };
    }

    const details: ComplianceResult['details'] = [];
    let score = 100;

    // 1. Check current curiculum textbook
    const hasBook = text.toLowerCase().includes("kết nối tri thức với cuộc sống");
    details.push({
      id: 'book',
      title: 'Học liệu "Kết nối tri thức"',
      passed: hasBook,
      message: hasBook 
        ? 'Giáo án sổ tay bám sát SGK Kết nối tri thức với cuộc sống.' 
        : 'Thiếu định vị căn cứ Bộ sách khoa học Kết nối tri thức.',
      suggestion: 'Thêm dòng bổ sung căn cứ Bộ sách để các bên thanh tra dễ kiểm tra.'
    });
    if (!hasBook) score -= 15;

    // 2. Check training portal verification link
    const hasPortal = text.toLowerCase().includes("taphuan.nxbgd.vn");
    details.push({
      id: 'portal',
      title: 'Cổng tập huấn taphuan.nxbgd.vn',
      passed: hasPortal,
      message: hasPortal 
        ? 'Đối chiếu dữ liệu đồng bộ thành công bám sát taphuan.nxbgd.vn.' 
        : 'Chưa có chú giải liên kết cổng kiểm định Nhà xuất bản taphuan.nxbgd.vn.',
      suggestion: 'Tích hợp nguồn: "Cổng thông tin tập huấn taphuan.nxbgd.vn" vào phần đầu giáo án để liên thông học liệu.'
    });
    if (!hasPortal) score -= 15;

    // 3. Check Capitalization rules after colons
    let colonLowercaseCount = 0;
    const lines = text.split('\n');
    lines.forEach(l => {
      const match = l.match(/:\s+([a-zà-ỹ])/);
      if (match) {
        if (!l.includes('http') && !l.includes('//') && !l.includes('style=')) {
          colonLowercaseCount++;
        }
      }
    });

    const capPassed = colonLowercaseCount === 0;
    details.push({
      id: 'cap',
      title: 'Quy tắc chính tả hành chính (Viết hoa sau dấu `:`)',
      passed: capPassed,
      message: capPassed 
        ? 'Hoàn hảo! Viết hoa toàn bộ chữ cái đầu sau dấu hai chấm.' 
        : `Phát hiện ${colonLowercaseCount} lỗi chữ thường ngay sau dấu hai chấm.`,
      suggestion: 'Đảm bảo tự động viết hoa chữ cái đầu tiên ngay sau dấu hai chấm (Ví dụ: - Giáo viên: Máy projector v.v.).'
    });
    if (!capPassed) score -= Math.min(colonLowercaseCount * 3, 15);

    // 4. Illegal competency headers "Năng lực tin học"
    const hasIllegalCompetency = text.includes("- Năng lực tin học:") || text.includes("- Năng lực tin học");
    details.push({
      id: 'competency',
      title: 'Phân mục Năng lực đặc thù (CV 2345)',
      passed: !hasIllegalCompetency,
      message: !hasIllegalCompetency 
        ? 'Phần danh mục năng lực đặc thù tách bạch rõ rệt và tối ưu đề mục.' 
        : 'Phát hiện tiêu đề con thừa thãi "Năng lực tin học" lặp lại trong I.1.',
      suggestion: 'Loại bỏ tiêu đề "Năng lực tin học:", hãy bắt đầu trực tiếp bằng dấu gạch ngang mô tả để đạt chuẩn.'
    });
    if (hasIllegalCompetency) score -= 15;

    // 5. Training Portal Content Alignment
    const normalizedText = text.toLowerCase();
    const gradeNum = gradeStr.replace(/\D/g, "");
    const gradeKeyword = `lớp ${gradeNum}`;
    const hasGradeAlign = normalizedText.includes(gradeKeyword);
    details.push({
      id: 'grade_align',
      title: 'Phân bổ trình độ theo chương trình cải cách',
      passed: hasGradeAlign,
      message: hasGradeAlign 
        ? `Nội dung giáo án được phân bổ đúng trình độ chương trình môn học Lớp ${gradeNum}.` 
        : `Chưa chỉ định rõ học sinh Lớp bồi dưỡng mục tiêu (${gradeStr}) trong kịch bản hoạt động.`,
      suggestion: `Chèn thêm cụm từ chỉ định cấp học giáo án (Ví dụ: môn học ở Lớp ${gradeNum}) để ban giám thị dễ theo dõi.`
    });
    if (!hasGradeAlign) score -= 10;

    // 6. Sub-activities check when toggled
    let hasSubactivitiesInText = false;
    lines.forEach(l => {
      const s = l.trim().toLowerCase();
      if (s.startsWith("hoạt động") && (
        s.match(/hoạt động \d+[\.\-\/]\d+/) !== null || 
        s.match(/hoạt động \d+[a-z]/) !== null ||
        s.match(/hoạt động [a-z]\b/) !== null
      )) {
        hasSubactivitiesInText = true;
      }
    });

    const subCheckPassed = !excludeSub || !hasSubactivitiesInText;
    details.push({
      id: 'sub_exclusion',
      title: 'Cơ cấu mức độ hoạt động chính',
      passed: subCheckPassed,
      message: subCheckPassed 
        ? 'Duy trì trọn vẹn hoạt động lớn, không vụn vặt rườm rà.' 
        : 'Phát hiện có hoạt động phụ lồng ghép (Hoạt động 1.1, 1.2..) gây chia lẻ giáo trình.',
      suggestion: 'Nên dùng các dấu cộng / gạch đầu dòng thay vì ghi đính nhãn Hoạt động phụ số học sinh nhỏ lẻ.'
    });
    if (!subCheckPassed) score -= 10;

    // 7. Check warm up review game for Tiết 2+
    const hasTiết2 = text.toLowerCase().includes("tiết 2");
    const hasWarmUpGame = normalizedText.includes("trò chơi ôn tập") || normalizedText.includes("ở tiết 1") || normalizedText.includes("bài cũ") || normalizedText.includes("ôn tập kiến thức");
    const gameCheckPassed = !hasTiết2 || hasWarmUpGame;
    
    details.push({
      id: 'tiết2_game',
      title: 'Liên thông Khởi động: Trò chơi ôn tập bài Tiết trước',
      passed: gameCheckPassed,
      message: gameCheckPassed 
        ? 'Thực hiện trò chơi phong phú ôn tập bài Tiết 1 ngay khi khởi động mở màn Tiết 2.' 
        : 'Bắt đầu Tiết 2 mà không thiết lập trò chơi ôn bài cũ để tạo tính liền mạch học tập.',
      suggestion: 'Thêm hoạt động trò chơi ("Ai nhanh ai đúng", "Mảnh ghép may mắn") ôn tập kiến thức Tiết 1 ở trang mở đầu Tiết 2.'
    });
    if (!gameCheckPassed) score -= 15;

    score = Math.max(0, Math.min(100, score));
    let status: ComplianceResult['status'] = 'excellent';
    if (score < 85) status = 'warning';
    if (score < 60) status = 'danger';

    return { score, status, details };
  };

  const handleQuickFixRule = (ruleId: string) => {
    SoundEffects.playTing();
    let text = editablePlanText;
    let success = false;
    let message = "";

    switch (ruleId) {
      case 'book':
        if (!text.toLowerCase().includes("kết nối tri thức với cuộc sống")) {
          text = `**Căn cứ chương trình cải cách:** Bộ sách "Kết nối tri thức với cuộc sống" của Nhà xuất bản Giáo dục Việt Nam.\n${text}`;
          success = true;
          message = "Đã chèn bổ sung căn cứ bộ sách Kết nối tri thức!";
        }
        break;
      case 'portal':
        if (!text.toLowerCase().includes("taphuan.nxbgd.vn")) {
          text = `**Tham khảo học liệu tập huấn:** Cổng thông tin taphuan.nxbgd.vn để liên kết hoạt động chuẩn bám sát.\n${text}`;
          success = true;
          message = "Đã đồng bộ quy chuẩn xuất bản taphuan.nxbgd.vn!";
        }
        break;
      case 'cap':
        // Fix colons followed by lowercase letters (including Vietnamese letters)
        text = text.replace(/:\s+([a-zà-ỹa-zđ])/gi, (match, letter) => {
          return `: ${letter.toUpperCase()}`;
        });
        success = true;
        message = "Đã sửa hoàn loạt quy tắc viết hoa sau dấu hai chấm!";
        break;
      case 'competency':
        text = text.replace(/- Năng lực tin học:\s*\n/gi, "");
        text = text.replace(/- Năng lực tin học\s*\n/gi, "");
        text = text.replace(/- Năng lực tin học:\s*/gi, "");
        text = text.replace(/- Năng lực tin học\s*/gi, "");
        success = true;
        message = "Đã tinh gọn bỏ đề mục năng lực lặp lại!";
        break;
      case 'grade_align':
        const gradeNum = selectedGrade.replace(/\D/g, "") || "3";
        if (!text.toLowerCase().includes(`lớp ${gradeNum}`)) {
          text = text.replace(/kế hoạch bài dạy/i, `Kế hoạch bài dạy (Chuẩn mực bồi dưỡng Học sinh Lớp ${gradeNum})`);
          success = true;
          message = `Đã bổ sung mục tiêu Lớp ${gradeNum} vào tiêu đề!`;
        }
        break;
      case 'sub_exclusion':
        text = text.replace(/\bHoạt động \d+[\.\-\/]\d+\b/gi, "- ");
        text = text.replace(/\bHoạt động \d+[a-z]\b/gi, "- ");
        success = true;
        message = "Đã quy đổi các hoạt động phụ rườm rà thành gạch đầu dòng gọn gàng!";
        break;
      case 'tiết2_game':
        const gameBlock = `\n- Trò chơi ôn tập nhanh Khởi động: Trò chơi Quiz trắc nghiệm vui "Bí mật rừng xanh" (gồm 3-5 câu hỏi lựa chọn sinh động ôn tập tri thức Tiết 1 kết nối bài mới).\n- Thầy Cô tổ chức cho đại diện học sinh đối đáp giành điểm số kịch tính.\n`;
        const tiết2Idx = text.toLowerCase().indexOf("tiết 2");
        if (tiết2Idx !== -1) {
          const nextNewLine = text.indexOf("\n", tiết2Idx);
          if (nextNewLine !== -1) {
            text = text.slice(0, nextNewLine) + "\n**Khởi động ôn tập kiến thức Tiết trước:**" + gameBlock + text.slice(nextNewLine);
            success = true;
            message = "Đã tích hợp Trò chơi khởi động ôn tập kiến thức Tiết 1 vào đầu Tiết 2!";
          }
        } else {
          text = `**Khởi động ôn học cũ:**\n- Tổ chức Trò chơi Quiz ôn tập nhanh tri thức đã tích lũy ở Tiết 1.\n${text}`;
          success = true;
          message = "Đã tích hợp Trò chơi khởi động ôn tập kiến thức Tiết trước!";
        }
        break;
      default:
        break;
    }

    if (success) {
      setEditablePlanText(text);
      showToast(`⚡ Sửa nhanh thành công: ${message}`);
    } else {
      showToast(`ℹ️ Không có lỗi lệch chuẩn nào được phát hiện, hoặc lỗi đã được sửa trước đó.`);
    }
  };

  const highlightNonAlignedPhrases = (textInput: string): string => {
    if (!textInput) return textInput;
    let res = textInput;

    // 1. Highlight generic activity triggers with exact suggestions from taphuan.nxbgd.vn
    // "làm bài tập" / "giải bài tập" / "luyện tập" without specifying actual workbook or task
    res = res.replace(/\b(làm bài tập|giải bài tập)\b/gi, (match) => {
      return `<strong style="background-color: #fee2e2; border-bottom: 2px dashed #ef4444; color: #991b1b; padding: 1px 4px; border-radius: 4px; cursor: help; font-weight: bold;" title="⚠️ GỢI Ý TỪ TAPHUAN.NXBGD.VN: Cần chỉ định cụ thể tên bài tập luyện tập / nhiệm vụ ở trang sách giáo khoa Kết nối tri thức để giáo án có độ định vị học liệu chính xác!">${match} <span style="font-size: 9px; color: #ef4444; font-family: monospace;">[!] Ghi rõ bài SGK</span></strong>`;
    });

    // 2. Highlight generic teaching aids and visual observation
    // "quan sát tranh" / "quan sát hình" / "chiếu tranh" / "chiếu hình ảnh" without specific graphics
    res = res.replace(/\b(quan sát tranh|quan sát hình|chiếu tranh|chiếu hình ảnh)\b/gi, (match) => {
      return `<strong style="background-color: #fee2e2; border-bottom: 2px dashed #ef4444; color: #991b1b; padding: 1px 4px; border-radius: 4px; cursor: help; font-weight: bold;" title="⚠️ LỖI BÁM SÁT SGK: Cần nêu rõ nhân vật hoặc hình vẽ trực quan cụ thể (như bạn Minh, An, Khoa, hoặc chú Rô-bốt ngộ nghĩnh) từ trang tập huấn taphuan.nxbgd.vn để tăng tính sinh động!">${match} <span style="font-size: 9px; color: #ef4444; font-family: monospace;">[!] Mô tả tranh SGK</span></strong>`;
    });

    // 3. Highlight generic hook transitions
    res = res.replace(/\b(giới thiệu bài mới|bắt đầu bài mới|dẫn dắt vào bài mới)\b/gi, (match) => {
      return `<strong style="background-color: #fee2e2; border-bottom: 2px dashed #ef4444; color: #991b1b; padding: 1px 4px; border-radius: 4px; cursor: help; font-weight: bold;" title="⚠️ SƯ PHẠM ĐỔI MỚI (taphuan.nxbgd.vn): Khuyên dùng trực tiếp câu hỏi tình huống mẫu khởi đầu của bài, hoặc tổ chức trò chơi kết nối tri thức sinh động để mở đầu tự nhiên!">${match} <span style="font-size: 9px; color: #ef4444; font-family: monospace;">[!] Gợi ý tập huấn</span></strong>`;
    });

    // 4. Highlight generic "sách giáo khoa" when not accompanied by "Kết nối tri thức"
    res = res.replace(/\b(sách giáo khoa|sgk)(?!\s*(?:Kết nối tri thức|KNTT))/gi, (match) => {
      return `<strong style="background-color: #fee2e2; border-bottom: 2px dashed #ef4444; color: #991b1b; padding: 1px 4px; border-radius: 4px; cursor: help; font-weight: bold;" title="⚠️ CHƯA RÕ NGUỒN: Nên ghi rõ là 'Sách giáo khoa Kết nối tri thức với cuộc sống' để chuẩn thương hiệu chất lượng">${match} <span style="font-size: 9px; color: #ef4444; font-family: monospace;">[?] Ghi rõ Kết nối tri thức</span></strong>`;
    });

    return res;
  };

  // Tự động suy luận hành động của Học sinh đối xứng tương ứng theo hàng ngang của Giáo viên
  const deriveSymmetricHsAction = (gvText: string, actTitleLine: string = ""): string => {
    const gv = (gvText || "").toLowerCase();
    const act = (actTitleLine || "").toLowerCase();

    if (gv.includes("tranh") || gv.includes("hình ảnh") || gv.includes("quan sát") || gv.includes("chiếu") || gv.includes("màn hình") || gv.includes("video") || gv.includes("sơ đồ")) {
      return "Học sinh quan sát tranh, chú ý lắng nghe và chuẩn bị trả lời câu hỏi.";
    }
    if (gv.includes("câu hỏi") || gv.includes("đặt câu hỏi") || gv.includes("hỏi") || gv.includes("gợi mở") || gv.includes("tìm câu trả lời") || gv.includes("phát biểu") || gv.includes("trả lời")) {
      return "Học sinh suy nghĩ, tìm câu trả lời và tự tin phát biểu ý kiến.";
    }
    if (gv.includes("thực hành") || gv.includes("máy tính") || gv.includes("thao tác") || gv.includes("bài tập") || gv.includes("phần mềm") || gv.includes("chuột") || gv.includes("bàn phím") || gv.includes("luyện tập")) {
      return "Học sinh quan sát thao tác mẫu và thực hành trực tiếp trên máy tính theo hướng dẫn.";
    }
    if (gv.includes("thảo luận") || gv.includes("nhóm") || gv.includes("chia sẻ") || gv.includes("phiếu") || gv.includes("đại diện")) {
      return "Học sinh tích cực thảo luận nhóm, thống nhất ý kiến và đại diện báo cáo kết quả.";
    }
    if (gv.includes("lắng nghe") || gv.includes("giới thiệu") || gv.includes("chốt") || gv.includes("kết luận") || gv.includes("ghi bài") || gv.includes("hộp kiến thức") || gv.includes("nhắc lại") || gv.includes("dặn dò") || gv.includes("tổng kết")) {
      return "Học sinh tập trung lắng nghe, nhắc lại kiến thức trọng tâm và ghi chép vào vở.";
    }
    if (gv.includes("trò chơi") || gv.includes("quiz") || gv.includes("đố vui") || act.includes("khởi động")) {
      return "Học sinh hào hứng tham gia trò chơi khởi động, trả lời câu hỏi ôn tập.";
    }
    if (act.includes("khám phá")) {
      return "Học sinh quan sát tranh, thảo luận tìm hiểu kiến thức mới và tương tác cùng giáo viên.";
    }
    if (act.includes("luyện tập")) {
      return "Học sinh hoàn thành bài tập thực hành theo yêu cầu của giáo viên.";
    }
    if (act.includes("vận dụng")) {
      return "Học sinh liên hệ thực tế bản thân và gia đình để giải quyết nhiệm vụ sáng tạo.";
    }
    return "Học sinh tập trung lắng nghe, quan sát và tích cực thực hiện nhiệm vụ được giao.";
  };

  const renderLessonPlanToHtml = (
    text: string, 
    titleStr = "Thông tin và quyết định", 
    subjectStr = "Tin học", 
    gradeStr = "3", 
    durationStr = "1 tiết", 
    isWordExport = false, 
    isBasicPlan = currentPlanIsBasic, 
    isGDPT2018Plan = currentPlanIsGDPT2018 || plannerTab === 'gdpt2018', 
    chapterStr = lessonChapter,
    qualitiesParam: string[] = selectedQualities,
    toolsParam: string[] = selectedTools,
    aiAutoCompParam: boolean = aiAutoCompetency,
    aiAutoToolsParam: boolean = aiAutoTools
  ): string => {
    if (!text) return "";

    const isSubActivityTitle = (str: string): boolean => {
      const s = str.trim().toLowerCase();
      return s.startsWith("hoạt động") && (
        s.match(/hoạt động \d+[\.\-\/]\d+/) !== null || 
        s.match(/hoạt động \d+[a-z]/) !== null ||
        s.match(/hoạt động \d+\s+[a-z]/) !== null ||
        s.match(/hoạt động [a-z]\b/) !== null ||
        s.match(/hoạt động [ivx]+[\.\s:]/) !== null
      );
    };

    const cleanTeacherScript = (text: string): string => {
      let t = text;
      t = t.replace(/["“”«»]/g, '');
      t = t.replace(/^(?:-\s*|\+\s*|\*\s*)?(?:GV|Giáo viên|Cô|Thầy)\s*(?:đặt câu hỏi|hỏi|yêu cầu|hướng dẫn|nêu vấn đề|nói|cho biết)?\s*:\s*/gi, '');
      // Strip conversational greeting fluff at the beginning
      t = t.replace(/^(?:Chào đón các con|Chào các con|Chào các em|Chào cả lớp)[^.!?]+[.!?]\s*/i, '');
      t = t.replace(/^(?:Bây giờ|Tiếp theo)(?:,\s*|\s+)(?:chúng ta|thầy cô|cả lớp)[^.!?]+[.!?]\s*/i, '');
      t = t.replace(/\s+/g, ' ').trim();
      return t;
    };

    const cleanStudentScript = (hsText: string, gvContext: string, actTitle: string): string => {
      let t = hsText;
      t = t.replace(/["“”«»]/g, '');
      t = t.replace(/^(?:-\s*|\+\s*|\*\s*)?(?:HS|Học sinh|Học Sinh|họcsinh|hoc sinh)\s*(?:trả lời|đáp|nói)?\s*:\s*/gi, '');
      t = t.replace(/^(?:Dạ thưa cô|Dạ thưa thầy|Thưa cô|Thưa thầy|Em thưa cô|Em thưa thầy)[,\.]?\s*/gi, '');
      
      // If student text is empty, derive a specific, realistic classroom action
      if (!t.trim()) {
        const gvLower = (gvContext + " " + actTitle).toLowerCase();
        if (gvLower.includes("sơ đồ")) {
          return "Học sinh lắng nghe và quan sát sơ đồ.";
        } else if (gvLower.includes("ghi bài") || gvLower.includes("tựa bài") || gvLower.includes("tựa đề")) {
          return "Học sinh ghi tựa bài vào vở.";
        } else if (gvLower.includes("quan sát") || gvLower.includes("tranh") || gvLower.includes("hình") || gvLower.includes("ảnh") || gvLower.includes("video")) {
          return "Học sinh quan sát tranh.";
        } else if (gvLower.includes("thảo luận") || gvLower.includes("nhóm") || gvLower.includes("đôi") || gvLower.includes("trao đổi")) {
          return "Học sinh tích cực thảo luận nhóm, chia sẻ ý kiến với bạn.";
        } else if (gvLower.includes("thực hành") || gvLower.includes("máy") || gvLower.includes("thao tác")) {
          return "Học sinh quan sát và thực hành trên máy tính.";
        } else if (gvLower.includes("khởi động") || gvLower.includes("trò chơi") || gvLower.includes("game")) {
          return "Học sinh hào hứng tham gia trò chơi.";
        } else if (gvLower.includes("hỏi") || gvLower.includes("câu hỏi") || gvLower.includes("nêu") || gvLower.includes("trả lời")) {
          return "Học sinh tìm câu trả lời.";
        } else if (gvLower.includes("chốt") || gvLower.includes("kết luận") || gvLower.includes("hướng dẫn")) {
          return "Học sinh tập trung lắng nghe giáo viên hướng dẫn.";
        } else {
          return "Học sinh lắng nghe.";
        }
      }

      t = t.replace(/\s+/g, ' ').trim();
      return t;
    };

    const renderSectionIVBlock = (title: string, customLines?: string[]) => {
      let goodLine = "Học sinh tích cực tham gia các hoạt động, nắm chắc kiến thức trọng tâm của tiết học.";
      let adjustLine = "Tiếp tục động viên, hỗ trợ kịp thời các em học sinh thao tác còn lúng túng.";

      if (customLines && customLines.length > 0) {
        const validLines = customLines.map(l => l.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').trim()).filter(Boolean);
        if (validLines.length >= 2) {
          goodLine = validLines[0];
          adjustLine = validLines[1];
        } else if (validLines.length === 1) {
          goodLine = validLines[0];
        }
      }

      const titleColor = isGDPT2018Plan ? 'color: #c00000;' : '';

      return `
        <div style="margin-top: 18px; margin-bottom: 22px; font-family: 'Times New Roman', Times, serif; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; line-height: 1.25; mso-line-height-rule: exactly;">
          <p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase; ${titleColor}"><strong style="${titleColor}">${title.toUpperCase()}</strong></p>
          <p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; margin-bottom: 6px; text-align: justify; line-height: 1.25;">- Những điều đã thực hiện tốt: ${goodLine.replace(/^(?:Những điều đã thực hiện tốt|Thực hiện tốt)\s*:\s*/i, '')}</p>
          <p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; margin-bottom: 6px; text-align: justify; line-height: 1.25;">- Những điều cần rút kinh nghiệm: ${adjustLine.replace(/^(?:Những điều cần rút kinh nghiệm|Rút kinh nghiệm)\s*:\s*/i, '')}</p>
        </div>
      `;
    };

    // Pre-process raw markdown to ensure capitalized first letter after colons and clean LaTeX arrows
    let processedText = cleanLatexArrows(text);
    // Normalize "I. YÊU CẦU CẦN ĐẠT ### 1. Năng lực đặc thù" -> "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù"
    processedText = processedText.replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*|\s+)?1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, isGDPT2018Plan ? "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù" : "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù:");
    processedText = processedText.replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*)+/gi, "I. YÊU CẦU CẦN ĐẠT:\n");
    // Replace "HS" safely with "Học sinh" in the raw text so that all occurrences of HS become Học sinh (unbolded)
    processedText = processedText.replace(/\bHS\b/g, "Học sinh");
    processedText = processedText.replace(/:\s+([a-zàáâãèéêìíòóôõùúýăđĩũơưăâêôơưà-ỹa-zA-Z])/g, (match, letter) => `: ${letter.toUpperCase()}`);

    const cleanGradeStr = (gradeStr || '3').replace(/lớp\s*/i, '').trim();

    const findIndexCaseless = (source: string, sub: string, fromIndex = 0): number => {
      return source.toLowerCase().indexOf(sub.toLowerCase(), fromIndex);
    };

    // Parse duration number: e.g. "3 Tiết" -> 3
    const parsedDurationNum = parseInt(String(durationStr || '1').replace(/\D/g, '')) || 1;

    const extractSectionsFromRaw = (rawText: string) => {
      // Find Section I: "I. YÊU CẦU CẦN ĐẠT"
      let idxI = findIndexCaseless(rawText, "I. YÊU CẦU");
      if (idxI === -1) idxI = findIndexCaseless(rawText, "I. YÊU");
      if (idxI === -1) idxI = findIndexCaseless(rawText, "I. MỤC TIÊU");
      if (idxI === -1) idxI = rawText.indexOf("I.");

      // Find Section II: "II. ĐỒ DÙNG DẠY HỌC" (strictly searched after idxI)
      const afterI = idxI !== -1 ? idxI : 0;
      let idxII = findIndexCaseless(rawText, "II. ĐỒ DÙNG", afterI);
      if (idxII === -1) idxII = findIndexCaseless(rawText, "II. THIẾT BỊ", afterI);
      if (idxII === -1) idxII = findIndexCaseless(rawText, "II. THIẾT", afterI);
      if (idxII === -1) idxII = rawText.indexOf("II.", afterI);

      // Find Section III: "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" (strictly searched after idxII)
      const afterII = idxII !== -1 ? idxII : afterI;
      let idxIII = findIndexCaseless(rawText, "III. CÁC HOẠT ĐỘNG", afterII);
      if (idxIII === -1) idxIII = findIndexCaseless(rawText, "III. TIẾN TRÌNH", afterII);
      if (idxIII === -1) idxIII = findIndexCaseless(rawText, "III. TIẾN", afterII);
      if (idxIII === -1) idxIII = rawText.indexOf("III.", afterII);
      if (idxIII === -1) {
        // Fallback: look for "TIẾT p:" or "Hoạt động 1" if "III." was omitted by AI
        const act1Match = rawText.slice(afterII).search(/(?:^|\n)(?=#{1,6}\s*(?:TIẾT\s*\d+|(?:\d+[\.\:]\s*)?Hoạt\s*động\s*1\b))/i);
        if (act1Match !== -1) {
          idxIII = afterII + act1Match;
        }
      }

      // Find Section IV: "IV. ĐIỀU CHỈNH SAU BÀI DẠY" (strictly searched after idxIII)
      const afterIII = idxIII !== -1 ? idxIII : afterII;
      let idxIV = findIndexCaseless(rawText, layoutCustomAdjustmentName, afterIII);
      if (idxIV === -1) idxIV = findIndexCaseless(rawText, "IV. ĐIỀU CHỈNH", afterIII);
      if (idxIV === -1) idxIV = findIndexCaseless(rawText, "IV. ĐIỀU", afterIII);
      if (idxIV === -1) idxIV = rawText.indexOf("IV.", afterIII);
      if (idxIV === -1) idxIV = rawText.indexOf("VII.", afterIII);

      let secI = "";
      let secII = "";
      let secIII = "";
      let secIV = "";

      if (idxI !== -1) {
        if (idxII !== -1 && idxII > idxI) {
          secI = rawText.substring(idxI, idxII);
          if (idxIII !== -1 && idxIII > idxII) {
            secII = rawText.substring(idxII, idxIII);
            if (idxIV !== -1 && idxIV > idxIII) {
              secIII = rawText.substring(idxIII, idxIV);
              secIV = rawText.substring(idxIV);
            } else {
              secIII = rawText.substring(idxIII);
            }
          } else {
            secII = rawText.substring(idxII);
          }
        } else {
          secI = rawText.substring(idxI);
        }
      } else {
        if (idxIII !== -1) {
          secIII = (idxIV !== -1 && idxIV > idxIII) ? rawText.substring(idxIII, idxIV) : rawText.substring(idxIII);
          if (idxIV !== -1 && idxIV > idxIII) secIV = rawText.substring(idxIV);
        } else {
          secIII = rawText;
        }
      }

      return { secI, secII, secIII, secIV };
    };

    // Find boundaries of each period in processedText (Tiết 2, Tiết 3, Tiết 4...)
    const periodBoundaries: { periodNum: number; index: number }[] = [];
    
    for (let p = 2; p <= Math.max(parsedDurationNum, 4); p++) {
      // Must match a REAL period transition:
      // Option A: after a line break or separator (---), a "KẾ HOẠCH BÀI DẠY" block specifying (TIẾT p) or (Tiết p)
      const regexA = new RegExp(
        `(?:\\n[\\t ]*[-=~_]{3,}[\\t ]*\\n|^[\\t ]*[-=~_]{3,}[\\t ]*\\n|\\n{2,})(?=[#\\s]*KẾ\\s*HOẠCH\\s*BÀI\\s*DẠY[\\s\\S]{1,800}?(?:\\(TIẾT\\s*${p}\\)|\\(Tiết\\s*${p}\\)|TIẾT\\s*${p}\\b))`,
        'i'
      );
      // Option B: A page break separator line followed within 300 chars by period heading
      const regexB = new RegExp(
        `(?:\\n[\\t ]*[-=~_]{3,}[\\t ]*\\n)(?=[\\s\\S]{0,300}?(?:\\(TIẾT\\s*${p}\\)|\\(Tiết\\s*${p}\\)|TIẾT\\s*${p}\\b))`,
        'i'
      );
      // Option C: A standalone markdown heading with TIẾT p
      const regexC = new RegExp(
        `(?:\\n[\\t ]*[-=~_]{3,}[\\t ]*\\n|\\n{2,}|^)(?=#{1,6}\\s*(?:TIẾT\\s*${p}|Tiết\\s*${p})\\s*[:\\-\\n])`,
        'i'
      );

      let pIndex = -1;
      const mA = processedText.match(regexA);
      if (mA && mA.index !== undefined && mA.index > 150) {
        pIndex = mA.index;
      } else {
        const mB = processedText.match(regexB);
        if (mB && mB.index !== undefined && mB.index > 150) {
          pIndex = mB.index;
        } else {
          const mC = processedText.match(regexC);
          if (mC && mC.index !== undefined && mC.index > 150) {
            pIndex = mC.index;
          }
        }
      }

      if (pIndex !== -1) {
        periodBoundaries.push({ periodNum: p, index: pIndex });
      }
    }

    if (periodBoundaries.length === 0 && parsedDurationNum >= 2) {
      const altSplitRegex = /\n\s*[-=~_]{3,}\s*\n/g;
      let m: RegExpExecArray | null;
      let pCounter = 2;
      while ((m = altSplitRegex.exec(processedText)) !== null) {
        if (m.index > 200) {
          periodBoundaries.push({ periodNum: pCounter, index: m.index });
          pCounter++;
        }
      }
    }

    periodBoundaries.sort((a, b) => a.index - b.index);

    let period1Raw = processedText;
    interface SubsequentPeriodInfo {
      periodNum: number;
      rawText: string;
      sections: { secI: string; secII: string; secIII: string; secIV: string };
    }
    const subsequentPeriods: SubsequentPeriodInfo[] = [];

    if (periodBoundaries.length > 0) {
      period1Raw = processedText.substring(0, periodBoundaries[0].index).trim();
      for (let i = 0; i < periodBoundaries.length; i++) {
        const cur = periodBoundaries[i];
        const next = periodBoundaries[i + 1];
        const raw = processedText.substring(cur.index, next ? next.index : undefined).replace(/^[\s\-=~_]+/, '').trim();
        subsequentPeriods.push({
          periodNum: cur.periodNum,
          rawText: raw,
          sections: extractSectionsFromRaw(raw)
        });
      }
    }

    // Ensure all requested periods up to parsedDurationNum exist in subsequentPeriods
    if (parsedDurationNum >= 2) {
      for (let p = 2; p <= parsedDurationNum; p++) {
        if (!subsequentPeriods.some(sp => sp.periodNum === p)) {
          subsequentPeriods.push({
            periodNum: p,
            rawText: "",
            sections: { secI: "", secII: "", secIII: "", secIV: "" }
          });
        }
      }
      subsequentPeriods.sort((a, b) => a.periodNum - b.periodNum);
    }

    const p1 = extractSectionsFromRaw(period1Raw);
    let textSecI = p1.secI;
    let textSecII = p1.secII;
    let textSecIII = p1.secIII;
    let textSecIV = p1.secIV;

    const p2 = subsequentPeriods.find(sp => sp.periodNum === 2)?.sections || null;
    let period2Raw = subsequentPeriods.find(sp => sp.periodNum === 2)?.rawText || "";

    const formatMarkdownBlock = (txt: string, bulletChar = "-") => {
      // Split any inline "I. YÊU CẦU CẦN ĐẠT ### 1. Năng lực đặc thù" into separate lines
      txt = txt.replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*|\s+)?1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, isGDPT2018Plan ? "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù" : "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù:");
      txt = txt.replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*)+/gi, "I. YÊU CẦU CẦN ĐẠT:\n");
      const lines = txt.split('\n');
      let html = "";
      lines.forEach(line => {
        let trimmed = line.trim();
        if (!trimmed) return;
        
        if (trimmed.toLowerCase().includes("kế hoạch bài dạy") || trimmed.toLowerCase().includes("bài dạy:")) {
          return;
        }

        // Section I: "I. YÊU CẦU CẦN ĐẠT:"
        if (trimmed.match(/^(?:#{1,6}\s*)?(?:<strong[^>]*>)?\s*I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT/i)) {
          const colorAttr = isGDPT2018Plan ? 'color: #c00000;' : '';
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 15px; margin-bottom: 6px; line-height: 1.25; mso-line-height-rule: exactly; ${colorAttr}"><strong style="${colorAttr}">I. YÊU CẦU CẦN ĐẠT:</strong></p>`;
          return;
        }

        // Subsection 1: "1. Năng lực đặc thù" (Blue #0070c0 for GDPT 2018, no colon)
        if (trimmed.match(/^(?:#{1,6}\s*)?(?:<strong[^>]*>)?\s*1\.\s*Năng\s*lực\s*đặc\s*thù/i)) {
          const colorAttr = isGDPT2018Plan ? 'color: #0070c0;' : '';
          const label = isGDPT2018Plan ? '1. Năng lực đặc thù' : '1. Năng lực đặc thù:';
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; ${colorAttr}"><strong style="${colorAttr}">${label}</strong></p>`;
          return;
        }

        // Subsection 2: "2. Năng lực chung" (Blue #0070c0 for GDPT 2018, no colon)
        if (trimmed.match(/^(?:#{1,6}\s*)?(?:<strong[^>]*>)?\s*2\.\s*Năng\s*lực\s*chung/i)) {
          const colorAttr = isGDPT2018Plan ? 'color: #0070c0;' : '';
          const label = isGDPT2018Plan ? '2. Năng lực chung' : '2. Năng lực chung:';
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; ${colorAttr}"><strong style="${colorAttr}">${label}</strong></p>`;
          return;
        }

        // Subsection 3: "3. Phẩm chất" (Blue #0070c0 for GDPT 2018, no colon)
        if (trimmed.match(/^(?:#{1,6}\s*)?(?:<strong[^>]*>)?\s*3\.\s*Phẩm\s*chất/i)) {
          const colorAttr = isGDPT2018Plan ? 'color: #0070c0;' : '';
          const label = isGDPT2018Plan ? '3. Phẩm chất' : '3. Phẩm chất:';
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; ${colorAttr}"><strong style="${colorAttr}">${label}</strong></p>`;
          return;
        }

        // Normalize 1. Năng lực đặc thù môn Tin học: -> 1. Năng lực đặc thù
        trimmed = trimmed.replace(/^([#\s\*]*1\.\s*Năng lực đặc thù)(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/i, isGDPT2018Plan ? '1. Năng lực đặc thù' : '1. Năng lực đặc thù:');
        trimmed = trimmed.replace(/^([#\s\*]*\d+\.\s*Năng lực đặc thù)(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/i, isGDPT2018Plan ? '$1' : '$1:');

        // Check for AI competency label:
        const aiCompRegex = /^(?:[#\s\-\*\+•]|\*\*-)?\s*(?:\*\*)?(-?\s*(?:Năng lực Trí tuệ nhân tạo \(AI\)(?:\s*\([^\)]*\))?|Năng lực AI(?:\s*\([^\)]*\))?))(?:\*\*)?\s*:\s*(.*)$/i;
        const aiMatch = trimmed.match(aiCompRegex);
        if (aiMatch) {
          const hasAiSelected = selectedCompetencies.some(c => c.toLowerCase().includes('ai') || c.includes('3439')) || aiPowerup;
          if (!hasAiSelected) {
            return;
          }
          let label = aiMatch[1].trim().replace(/^-\s*/, '');
          const body = aiMatch[2].trim()
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- ${label}:</strong> ${body}</p>`;
          return;
        }

        // Check for specific competency labels that MUST have bold formatting:
        // - Năng lực số (...):
        // - Tự chủ và tự học:
        // - Giao tiếp và hợp tác:
        // - Giải quyết vấn đề và sáng tạo:
        const compItemRegex = /^(?:[#\s\-\*\+•]|\*\*-)?\s*(?:\*\*)?(-?\s*(?:Năng lực số(?:\s*\([^\)]*\))?|Tự chủ và tự học|Giao tiếp và hợp tác|Giải quyết vấn đề và sáng tạo|Năng lực tự chủ và tự học|Năng lực giao tiếp và hợp tác|Năng lực giải quyết vấn đề và sáng tạo))(?:\*\*)?\s*:\s*(.*)$/i;
        const compMatch = trimmed.match(compItemRegex);
        if (compMatch) {
          let label = compMatch[1].trim().replace(/^-\s*/, '');
          if (label.toLowerCase() === "năng lực tự chủ và tự học") label = "Tự chủ và tự học";
          if (label.toLowerCase() === "năng lực giao tiếp và hợp tác") label = "Giao tiếp và hợp tác";
          if (label.toLowerCase() === "năng lực giải quyết vấn đề và sáng tạo") label = "Giải quyết vấn đề và sáng tạo";
          const body = compMatch[2].trim()
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- ${label}:</strong> ${body}</p>`;
          return;
        }

        if (trimmed.startsWith('#')) {
          let cleanHeader = trimmed.replace(/^[#\s\*]+/, '').trim();
          cleanHeader = cleanHeader.replace(/^1\.\s*Năng lực đặc thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/i, isGDPT2018Plan ? '1. Năng lực đặc thù' : '1. Năng lực đặc thù:');
          if (cleanHeader.startsWith("I.") || cleanHeader.startsWith("II.") || cleanHeader.startsWith("III.") || cleanHeader.startsWith("IV.")) {
            // Guarantee large headers are inside strong tags
            const displayHeader = cleanHeader
              .replace(/II\.\s*THIẾT\s*BỊ\s*DẠY\s*HỌC\s*VÀ\s*HỌC\s*LIỆU:?/gi, isGDPT2018Plan ? "II. ĐỒ DÙNG DẠY HỌC" : "II. ĐỒ DÙNG DẠY HỌC:")
              .replace(/II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:?/gi, isGDPT2018Plan ? "II. ĐỒ DÙNG DẠY HỌC" : "II. ĐỒ DÙNG DẠY HỌC:")
              .replace(/III\.\s*TIẾN\s*TRÌNH\s*DẠY\s*HỌC:?/gi, isGDPT2018Plan ? "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" : "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:")
              .replace(/III\.\s*CÁC\s*HOẠT\s*ĐỘNG\s*DẠY\s*HỌC\s*CHỦ\s*YẾU:?/gi, isGDPT2018Plan ? "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" : "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:");
            const colorAttr = (isGDPT2018Plan && (cleanHeader.startsWith("I.") || cleanHeader.startsWith("II.") || cleanHeader.startsWith("III."))) ? 'color: #c00000;' : '';
            html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 15px; margin-bottom: 5px; line-height: 1.25; mso-line-height-rule: exactly; ${colorAttr}"><strong style="${colorAttr}">${displayHeader}</strong></p>`;
            return;
          } else {
            html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 10px; margin-bottom: 3px; line-height: 1.25; mso-line-height-rule: exactly;"><strong>${cleanHeader}</strong></p>`;
            return;
          }
        } else if (trimmed.match(/^\d+\.\s/)) {
          let cleanNumHeader = trimmed
            .replace(/^1\.\s*Năng lực đặc thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/i, isGDPT2018Plan ? '1. Năng lực đặc thù' : '1. Năng lực đặc thù:')
            .replace(/^2\.\s*Năng lực chung:?/i, isGDPT2018Plan ? '2. Năng lực chung' : '2. Năng lực chung:')
            .replace(/^3\.\s*Phẩm chất:?/i, isGDPT2018Plan ? '3. Phẩm chất' : '3. Phẩm chất:');
          const colorAttr = (isGDPT2018Plan && (cleanNumHeader.includes("Năng lực") || cleanNumHeader.includes("Phẩm chất"))) ? 'color: #0070c0;' : '';
          const formatted = cleanNumHeader.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 10px; margin-bottom: 5px; line-height: 1.25; mso-line-height-rule: exactly; ${colorAttr}"><strong style="${colorAttr}">${formatted}</strong></p>`;
          return;
        } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('+')) {
          const cleanBullet = trimmed.substring(1).replace(/^[#\s\-\*\+]+/g, '').trim();
          if (!cleanBullet) return;
          const formatted = cleanBullet
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;${bulletChar} ${formatted}</p>`;
        } else {
          const formatted = trimmed
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          html += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">${formatted}</p>`;
        }
      });
      return html;
    };

    const cleanSubjectDisplay = (subjectStr || 'Tin học').replace(/^Môn\s*học\s*:\s*/i, '').trim();
    const cleanGradeDisplay = (gradeStr || '3').replace(/^Lớp\s*/i, '').trim();
    // 1. Văn bản "Môn học: Tin học - Lớp *" thay đổi thành "Tin học - Lớp *". Định dạng chữ In hoa
    const displaySubjectAndGrade = `${cleanSubjectDisplay} - LỚP ${cleanGradeDisplay}`.toUpperCase();

    // 2. Thêm dòng "Chủ đề *" bên dưới dòng "Môn học - Lớp *". Định dạng chữ In hoa. Ví dụ: CHỦ ĐỀ 1. MÁY TÍNH VÀ EM.
    let resolvedTopic = (chapterStr || '').trim();
    if (!resolvedTopic && text) {
      const topicInContentMatch = text.match(/(?:^|\n)(?:#{1,6}\s*|\*\*|\*)?(?:Chủ\s*đề|CHỦ\s*ĐỀ)\s*([^\n\r]+)/i);
      if (topicInContentMatch) {
        resolvedTopic = topicInContentMatch[0].replace(/^[#\s\*]+/, '').trim();
      }
    }
    if (!resolvedTopic) {
      const lowerTitle = (titleStr || '').toLowerCase();
      const isIT = cleanSubjectDisplay.toLowerCase().includes('tin');
      if (isIT) {
        if (lowerTitle.includes('internet') || lowerTitle.includes('mạng')) {
          resolvedTopic = 'CHỦ ĐỀ 2. MẠNG MÁY TÍNH VÀ INTERNET';
        } else if (lowerTitle.includes('sắp xếp') || lowerTitle.includes('thư mục') || lowerTitle.includes('lưu trữ') || lowerTitle.includes('tìm kiếm')) {
          resolvedTopic = 'CHỦ ĐỀ 3. TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN';
        } else if (lowerTitle.includes('an toàn') || lowerTitle.includes('đạo đức') || lowerTitle.includes('văn hoá') || lowerTitle.includes('pháp luật') || lowerTitle.includes('cá nhân')) {
          resolvedTopic = 'CHỦ ĐỀ 4. ĐẠO ĐỨC, PHÁP LUẬT VÀ VĂN HOÁ TRONG MÔI TRƯỜNG SỐ';
        } else if (lowerTitle.includes('vẽ') || lowerTitle.includes('trình chiếu') || lowerTitle.includes('soạn thảo') || lowerTitle.includes('ứng dụng') || lowerTitle.includes('thực hành bàn phím')) {
          resolvedTopic = 'CHỦ ĐỀ 5. TIN HỌC ỨNG DỤNG';
        } else if (lowerTitle.includes('thuật toán') || lowerTitle.includes('nhiệm vụ') || lowerTitle.includes('giải quyết')) {
          resolvedTopic = 'CHỦ ĐỀ 6. GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH';
        } else {
          resolvedTopic = 'CHỦ ĐỀ 1. MÁY TÍNH VÀ EM';
        }
      } else {
        resolvedTopic = 'CHỦ ĐỀ 1. MÁY TÍNH VÀ EM';
      }
    } else {
      // Standardize format: ensure "CHỦ ĐỀ X. ..." uppercase format
      resolvedTopic = resolvedTopic.replace(/^(?:Chủ\s*đề|CHỦ\s*ĐỀ)\s*(\d+)[\.:\-\s]+(.*)$/i, 'CHỦ ĐỀ $1. $2');
      if (!resolvedTopic.toUpperCase().startsWith('CHỦ ĐỀ')) {
        resolvedTopic = `CHỦ ĐỀ: ${resolvedTopic}`;
      }
      resolvedTopic = resolvedTopic.toUpperCase();
    }
    const displayTopic = resolvedTopic;

    // 3. Văn bản "Bài 2: Xử lý thông tin (Tiết 1)" đổi thành định dạng in hoa.
    let cleanLessonTitle = (titleStr || "Thông tin và quyết định")
      .replace(/^Bài\s*dạy\s*:\s*/i, '')
      .replace(/\s*-\s*Số\s*tiết\s*:\s*.*$/i, '')
      .replace(/\s*\((?:TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*\d*\)\s*$/i, '')
      .trim();

    let formattedLessonTitle = cleanLessonTitle;
    const baiMatch = cleanLessonTitle.match(/^(Bài\s*\d+)[\.:\s]+(.*)$/i);
    if (baiMatch) {
      formattedLessonTitle = `${baiMatch[1]}: ${baiMatch[2].trim()}`;
    } else if (cleanLessonTitle.toLowerCase().includes("thông tin") && cleanLessonTitle.toLowerCase().includes("quyết định")) {
      formattedLessonTitle = `Bài 1: ${cleanLessonTitle}`;
    } else if (cleanLessonTitle.toLowerCase().includes("xử lý thông tin")) {
      formattedLessonTitle = `Bài 2: ${cleanLessonTitle}`;
    }

    const is1Tiet = durationStr.toLowerCase().includes('1 tiết') || durationStr.trim() === '1' || durationStr.toLowerCase().includes('1t');
    const formattedLessonTitleUpper = formattedLessonTitle.toUpperCase().replace(/\s*\((?:TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*\d*\)\s*$/i, '').trim();
    const displayLessonTitleTiet1 = is1Tiet ? `${formattedLessonTitleUpper} (1 TIẾT)` : `${formattedLessonTitleUpper} (TIẾT 1)`;

    const renderPeriodFullHeader = (periodNum: number, rawSecI?: string, rawSecII?: string, headingTitle?: string) => {
      let h = "";
      // Hard page break for Word & Print
      if (isWordExport) {
        // For Word (.doc/.docx): Use a clean section break and define Section p.
        h += `</div><!-- END Section${periodNum - 1} -->\n`;
        h += `<br clear="all" style="page-break-before: always; mso-break-type: section-break;" />\n`;
        h += `<div class="Section${periodNum} tiet${periodNum}-container" style="page: Section${periodNum}; clear: both; margin-top: 0; padding-top: 0;">`;
      } else {
        h += `<div class="page-break" style="page-break-before: always; break-before: page; clear: both;"></div>`;
        if (isGDPT2018Plan) {
          h += `<div class="tiet${periodNum}-page-setup-badge print:hidden" style="margin: 20px 0 15px 0; padding: 10px 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 11.5pt; color: #15803d; font-family: 'Times New Roman', Times, serif; display: flex; justify-content: space-between; align-items: center;">`;
          h += `<span>📄 <strong>TIẾT ${periodNum}</strong> — Định dạng khổ giấy: <strong>A4</strong> (Layout &rarr; Size: A4)</span>`;
          h += `<span>📐 <strong>Cài đặt Lề trang (Page Setup &rarr; Margins)</strong>: Top: 1,5 cm; Bottom: 1,5 cm; Left: 1,75 cm; Right: 1,75 cm</span>`;
          h += `</div>`;
        }
        h += `<div class="Section${periodNum} tiet${periodNum}-container tiet${periodNum}-page-container" style="clear: both; margin-top: 25px; padding-top: 20px; border-top: 2px dashed #9ca3af;">`;
      }
      
      // Khối thông tin đầu bài học
      h += `<div style="text-align: center; margin-bottom: 25px; line-height: 1.25; mso-line-height-rule: exactly;">`;
      h += `<h2 style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">KẾ HOẠCH BÀI DẠY</strong></h2>`;
      h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 5px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly;">${displaySubjectAndGrade}</p>`;
      h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 3px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${displayTopic}</strong></p>`;
      h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 3px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${formattedLessonTitleUpper} (TIẾT ${periodNum})</strong></p>`;
      h += `</div>`;

      // Mục I. YÊU CẦU CẦN ĐẠT
      if (rawSecI && rawSecI.trim().length > 30) {
        let customSecI = ensureAllSelectedQualities(rawSecI, qualitiesParam, aiAutoCompParam);
        customSecI = customSecI
          .replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*|\s+)?1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, isGDPT2018Plan ? "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù" : "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù:")
          .replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*)+/gi, "I. YÊU CẦU CẦN ĐẠT:\n")
          .replace(/I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*/gi, "I. YÊU CẦU CẦN ĐẠT:\n")
          .replace("1. Đối với Giáo viên:", "<strong>1. Giáo viên</strong>")
          .replace("2. Đối với Học sinh:", "<strong>2. Học sinh</strong>")
          .replace(/1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, isGDPT2018Plan ? "1. Năng lực đặc thù" : "1. Năng lực đặc thù:")
          .replace(/2\.\s*Năng\s*lực\s*chung:?/gi, isGDPT2018Plan ? "2. Năng lực chung" : "2. Năng lực chung:")
          .replace(/3\.\s*Phẩm\s*chất:?/gi, isGDPT2018Plan ? "3. Phẩm chất" : "3. Phẩm chất:");
        h += formatMarkdownBlock(customSecI, "-");
      } else {
        const hasAiComp = selectedCompetencies.some(c => c.toLowerCase().includes("ai") || c.includes("3439")) || aiPowerup;
        const hasTeamwork = selectedCompetencies.some(c => c.toLowerCase().includes("nhóm") || c.toLowerCase().includes("hợp tác") || c.toLowerCase().includes("giao tiếp"));
        const hasSelfStudy = selectedCompetencies.some(c => c.toLowerCase().includes("tự chủ") || c.toLowerCase().includes("tự học"));
        const hasProblemSolving = selectedCompetencies.some(c => c.toLowerCase().includes("giải quyết vấn đề") || c.toLowerCase().includes("sáng tạo"));
        const hasDigitalComp = selectedCompetencies.some(c => c.toLowerCase().includes("số") || c.toLowerCase().includes("tin học"));

        h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 15px; margin-bottom: 6px; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">I. YÊU CẦU CẦN ĐẠT:</strong></p>`;
        h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${isGDPT2018Plan ? '1. Năng lực đặc thù' : '1. Năng lực đặc thù:'}</strong></p>`;
        
        // Dynamically provide subject-based competencies
        const isSubjectMath = cleanSubjectDisplay.toLowerCase().includes("toán");
        const isSubjectVietnamese = cleanSubjectDisplay.toLowerCase().includes("tiếng việt") || cleanSubjectDisplay.toLowerCase().includes("văn");
        const isSubjectIT = cleanSubjectDisplay.toLowerCase().includes("tin");

        if (isSubjectMath) {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Năng lực tư duy và lập luận toán học: Nhận biết và phân tích được các yếu tố toán học trọng tâm trong Tiết ${periodNum}.</p>`;
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Năng lực giải quyết vấn đề toán học: Vận dụng được kiến thức đã học để giải quyết các bài toán và tình huống thực tiễn Tiết ${periodNum}.</p>`;
        } else if (isSubjectVietnamese) {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Năng lực ngôn ngữ: Đọc đúng, hiểu nội dung văn bản và phát triển kĩ năng nói, viết phù hợp trong Tiết ${periodNum}.</p>`;
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Năng lực văn học: Biết cảm nhận vẻ đẹp của ngôn từ và hình ảnh trong bài học Tiết ${periodNum}.</p>`;
        } else if (isSubjectIT) {
          if (periodNum === 2) {
            h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Nhận biết và phân biệt được ba dạng thông tin thường gặp: dạng chữ, dạng hình ảnh, dạng âm thanh thông qua hình ảnh và ví dụ trong đời sống.</p>`;
            h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Nêu được các ví dụ cụ thể về ba dạng thông tin thường gặp trong học tập và sinh hoạt hàng ngày.</p>`;
            h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Biết tiếp nhận và phân loại thông tin dưới các dạng khác nhau để xử lý tình huống và đưa ra quyết định phù hợp.</p>`;
          } else {
            h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Thực hành thu nhận, phân loại và xử lý các dạng thông tin trong học tập và sinh hoạt hàng ngày.</p>`;
            h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Vận dụng kiến thức thông tin và quyết định để giải quyết các bài tập thực hành và tình huống thực tế của Tiết ${periodNum}.</p>`;
            h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Rèn luyện kỹ năng quan sát, phân tích và diễn đạt thông tin rõ ràng, chính xác.</p>`;
          }
        } else {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Nêu được các kiến thức, kĩ năng trọng tâm của môn ${cleanSubjectDisplay} trong Tiết ${periodNum}.</p>`;
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Vận dụng kiến thức bài học môn ${cleanSubjectDisplay} vào các tình huống thực tiễn và giải quyết nhiệm vụ học tập của Tiết ${periodNum}.</p>`;
        }

        if (hasAiComp) {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- Năng lực AI (theo QĐ 3439): Bước đầu nhận biết máy tính và các thiết bị số thông minh có thể thu nhận, phân loại và xử lý các dạng thông tin tương tự như con người trong Tiết ${periodNum}.</p>`;
        }
        if (hasDigitalComp) {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Năng lực số:</strong> Bước đầu biết sử dụng thiết bị số để quan sát hình ảnh, lắng nghe âm thanh và tiếp nhận thông tin phục vụ học tập Tiết ${periodNum}.</p>`;
        }

        h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${isGDPT2018Plan ? '2. Năng lực chung' : '2. Năng lực chung:'}</strong></p>`;
        if (hasSelfStudy || (!hasTeamwork && !hasProblemSolving)) {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Tự chủ và tự học:</strong> Tự giác tìm hiểu các dạng thông tin trong SGK, chủ động quan sát tranh ảnh và hoàn thành phiếu học tập cá nhân Tiết ${periodNum}.</p>`;
        }
        if (hasTeamwork || (!hasSelfStudy && !hasProblemSolving)) {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Giao tiếp và hợp tác:</strong> Tích cực trao đổi, thảo luận nhóm để tìm kiếm và chia sẻ các kết quả học tập Tiết ${periodNum}.</p>`;
        }
        if (hasProblemSolving || (!hasSelfStudy && !hasTeamwork)) {
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Giải quyết vấn đề và sáng tạo:</strong> Biết phân tích tình huống thực tế để giải quyết nhiệm vụ học tập Tiết ${periodNum}.</p>`;
        }

        h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${isGDPT2018Plan ? '3. Phẩm chất' : '3. Phẩm chất:'}</strong></p>`;
        const qualityFallbackDescs: Record<string, string> = {
          'Chăm chỉ': `Tích cực tham gia các hoạt động học tập, chăm chú quan sát và hoàn thành bài tập Tiết ${periodNum}.`,
          'Trách nhiệm': `Có trách nhiệm trong hoạt động nhóm, hoàn thành nhiệm vụ được phân công trong Tiết ${periodNum}.`,
          'Trung thực': `Thật thà, khách quan trong việc chia sẻ ý kiến và đánh giá kết quả của bạn trong Tiết ${periodNum}.`,
          'Nhân ái': `Biết tôn trọng, lắng nghe và sẵn sàng chia sẻ, giúp đỡ bạn bè trong Tiết ${periodNum}.`,
          'Yêu nước': `Yêu thích việc tìm hiểu kiến thức môn học trong Tiết ${periodNum}.`
        };
        const activeQualities = (qualitiesParam && qualitiesParam.length > 0) ? qualitiesParam : ['Chăm chỉ', 'Trách nhiệm', 'Trung thực'];
        activeQualities.forEach(q => {
          const desc = qualityFallbackDescs[q] || `Nêu cao tinh thần ${q.toLowerCase()} trong Tiết ${periodNum}.`;
          h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;- <strong>${q}:</strong> ${desc}</p>`;
        });
      }

      // Mục II. ĐỒ DÙNG DẠY HỌC
      if (rawSecII && rawSecII.trim().length > 20) {
        let customSecII = cleanSectionIIText(rawSecII, toolsParam, cleanSubjectDisplay, cleanGradeStr, aiAutoToolsParam);
        customSecII = customSecII
          .replace(/II\.\s*THIẾT\s*BỊ\s*DẠY\s*HỌC\s*VÀ\s*HỌC\s*LIỆU:?/gi, isGDPT2018Plan ? "II. ĐỒ DÙNG DẠY HỌC" : "II. ĐỒ DÙNG DẠY HỌC:")
          .replace(/II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:?/gi, isGDPT2018Plan ? "II. ĐỒ DÙNG DẠY HỌC" : "II. ĐỒ DÙNG DẠY HỌC:");
        h += formatMarkdownBlock(customSecII, "-");
      } else {
        const teacherToolsFinal = formatTeacherToolsString("", toolsParam, cleanSubjectDisplay, cleanGradeStr, aiAutoToolsParam);
        h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 15px; margin-bottom: 6px; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${isGDPT2018Plan ? 'II. ĐỒ DÙNG DẠY HỌC' : 'II. ĐỒ DÙNG DẠY HỌC:'}</strong></p>`;
        h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Giáo viên:</strong> ${teacherToolsFinal}.</p>`;
        h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Học sinh:</strong> SGK ${cleanSubjectDisplay} ${cleanGradeStr}, VBT ${cleanSubjectDisplay} ${cleanGradeStr}, vở ghi, dụng cụ học tập.</p>`;
      }

      // Mục III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
      h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${isGDPT2018Plan ? 'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU' : 'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:'}</strong></p>`;
      
      const defaultTitle = periodNum === 2 
        ? `TIẾT 2: BA DẠNG THÔNG TIN THƯỜNG GẶP` 
        : (periodNum === 3 ? `TIẾT 3: THỰC HÀNH VÀ TRẢI NGHIỆM VỀ THÔNG TIN` : `TIẾT ${periodNum}: ${cleanLessonTitle.toUpperCase().trim()}`);
      const subTitleToUse = headingTitle || defaultTitle;
      h += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin-top: 15px; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif; width: 100%; line-height: 1.25; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${subTitleToUse}</strong></p>`;
      
      return h;
    };

    const renderTiet2FullHeader = (rawTiet2I?: string, rawTiet2II?: string, tiet2HeadingTitle?: string) => {
      return renderPeriodFullHeader(2, rawTiet2I, rawTiet2II, tiet2HeadingTitle);
    };

    let planHtml = "";
    planHtml += `<div style="text-align: center; margin-bottom: 25px; line-height: 1.25; mso-line-height-rule: exactly;">`;
    planHtml += `<h2 style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">KẾ HOẠCH BÀI DẠY</strong></h2>`;
    planHtml += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 5px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly;">${displaySubjectAndGrade}</p>`;
    planHtml += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 3px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${displayTopic}</strong></p>`;
    planHtml += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; text-align: center; margin: 3px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${displayLessonTitleTiet1}</strong></p>`;
    planHtml += `</div>`;

    if (textSecI) {
      let customSecI = ensureAllSelectedQualities(textSecI, qualitiesParam, aiAutoCompParam);
      customSecI = customSecI
        .replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*|\s+)?1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, isGDPT2018Plan ? "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù" : "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù:")
        .replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*)+/gi, "I. YÊU CẦU CẦN ĐẠT:\n")
        .replace(/I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*/gi, "I. YÊU CẦU CẦN ĐẠT:\n")
        .replace("1. Đối với Giáo viên:", "<strong>1. Giáo viên</strong>")
        .replace("2. Đối với Học sinh:", "<strong>2. Học sinh</strong>")
        .replace(/1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, isGDPT2018Plan ? "1. Năng lực đặc thù" : "1. Năng lực đặc thù:")
        .replace(/2\.\s*Năng\s*lực\s*chung:?/gi, isGDPT2018Plan ? "2. Năng lực chung" : "2. Năng lực chung:")
        .replace(/3\.\s*Phẩm\s*chất:?/gi, isGDPT2018Plan ? "3. Phẩm chất" : "3. Phẩm chất:");
      planHtml += formatMarkdownBlock(customSecI, "-");
    }
    
    if (textSecII) {
      // Clean and sanitize Section II according to toolsParam
      let customSecII = cleanSectionIIText(textSecII, toolsParam, cleanSubjectDisplay, cleanGradeStr, aiAutoToolsParam);
      customSecII = customSecII
        .replace(/II\.\s*THIẾT\s*BỊ\s*DẠY\s*HỌC\s*VÀ\s*HỌC\s*LIỆU:?/gi, isGDPT2018Plan ? "II. ĐỒ DÙNG DẠY HỌC" : "II. ĐỒ DÙNG DẠY HỌC:")
        .replace(/II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:?/gi, isGDPT2018Plan ? "II. ĐỒ DÙNG DẠY HỌC" : "II. ĐỒ DÙNG DẠY HỌC:");

      planHtml += formatMarkdownBlock(customSecII, "-");
    }

    if (textSecIII) {
      const linesIII = textSecIII.trim().split('\n');
      const firstLineIII = linesIII[0];
      const cleanSectionHeading = isGDPT2018Plan ? "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" : "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:";
      planHtml += `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; font-weight: bold; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${cleanSectionHeading}</strong></p>`;

      const activitiesPart = textSecIII.substring(firstLineIII.length);
      const cleanStepsText = activitiesPart.trim();
      
      // Split on major section delimiters and genuine top-level activities:
      // 1. Divider line: --- or ===
      // 2. KẾ HOẠCH BÀI DẠY (for Tiết 2)
      // 3. TIẾT headings: TIẾT 2, Tiết 2, etc.
      // 4. Section IV/V headings: IV. ĐIỀU CHỈNH, etc.
      // 5. Genuine top-level lesson activities starting on a new line:
      //    - Must be prefixed by markdown heading: #{1,6}\s*(?:\d+[\.\:]\s*)?(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+
      //    - OR numbered activity with colon/dash: (?:\d+[\.\:]\s*)(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+\s*[\:\-]
      //    - OR activity with colon/dash: (?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+\s*[\:\-]\s*(?:Khởi động|Khám phá|Luyện tập|Vận dụng|Thực hành|Củng cố|[A-ZÀ-Ỹ])
      //    CRITICAL: Never split on in-text references like "Hoạt động 1 (trang 5 SGK)" or "...đọc nội dung Hoạt động 1"!
      const blocks = cleanStepsText.split(/\n(?=(?:[-=~_]{3,}|\bKẾ HOẠCH BÀI DẠY\b|(?:#{1,6}\s*|\*\*|\*)?(?:TIẾT\s*[1-9]|Tiết\s*[1-9])|(?:#{1,6}\s*|\*\*|\*)?(?:IV|V)\.\s*ĐIỀU\s*CHỈNH|\bĐiều chỉnh sau bài dạy|\bIV\.\s*ĐÁNH\s*GIÁ|#{1,6}\s*(?:\d+[\.\:]\s*)?(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+|(?:\d+[\.\:]\s*)(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+\s*[\:\-]|(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+\s*[\:\-]\s*(?:Khởi động|Khám phá|Luyện tập|Vận dụng|Thực hành|Củng cố|[A-ZÀ-Ỹ])))/i);
      
      if (blocks.length > 0) {
        let isTableOpen = false;
        let hasTiet2 = false;
        let tiet2SeenAct1 = false;
        let tiet1IvRendered = false;
        let tiet2IvRendered = false;

        const openTable = () => {
          const msoInsideH = isGDPT2018Plan ? 'none' : '1.0pt solid windowtext';
          let h = `<table class="lesson-plan-table" style="width: 100%; border-collapse: collapse !important; font-family: 'Times New Roman', Times, serif; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-top: 15px; margin-bottom: 15px; line-height: 1.25; mso-line-height-rule: exactly; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; border: 1.0pt solid windowtext; mso-border-alt: solid windowtext 1.0pt; mso-border-insideh: ${msoInsideH}; mso-border-insidev: 1.0pt solid windowtext; page-break-inside: auto;">`;
          h += `<thead>`;
          h += `<tr style="page-break-inside: avoid; mso-yfti-tblheader: yes; page-break-after: avoid;">`;
          h += `<th style="border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #F2F2F2; text-align: center; font-weight: bold; width: 55%; text-transform: uppercase; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'} !important; font-family: 'Times New Roman', Times, serif; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; line-height: 1.25; mso-line-height-rule: exactly;">Hoạt động của Giáo viên</th>`;
          h += `<th style="border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #F2F2F2; text-align: center; font-weight: bold; width: 45%; text-transform: uppercase; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'} !important; font-family: 'Times New Roman', Times, serif; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; line-height: 1.25; mso-line-height-rule: exactly;">Hoạt động của Học sinh</th>`;
          h += `</tr>`;
          h += `</thead>`;
          h += `<tbody>`;
          isTableOpen = true;
          return h;
        };

        const closeTable = () => {
          if (isTableOpen) {
            isTableOpen = false;
            return `</tbody></table>`;
          }
          return "";
        };

        // Determine if some block is TIẾT 1, and scan if we have any TIẾT at all
        let hasAnyTiet = false;
        let tiet1Index = -1;
        let tiet1Content = "";

        for (let i = 0; i < blocks.length; i++) {
          const trimmedBlock = blocks[i].trim();
          const generalTietMatch = trimmedBlock.match(/(?:^|\n)(?:[-=~_]{3,}\s*)?(?:#{1,6}\s*|\*\*|\*\s*)?(TIẾT\s*\d+|Tiết\s*\d+)(.*)/i);
          if (generalTietMatch && !trimmedBlock.toLowerCase().includes("hoạt động")) {
            hasAnyTiet = true;
            const numMatch = generalTietMatch[1].match(/\d+/);
            if (numMatch && numMatch[0] === "1") {
              tiet1Index = i;
              const tietPrefix = generalTietMatch[1].toUpperCase().trim();
              const rawSubTitle = generalTietMatch[2].replace(/^[\s*:\-]+/g, '').trim();
              const cleanSubTitle = rawSubTitle ? rawSubTitle.toUpperCase() : titleStr.toUpperCase().trim();
              tiet1Content = `${tietPrefix}: ${cleanSubTitle}`;
              break;
            }
          }
        }

        // If TIẾT 1 is present, render it immediately below Section III title
        if (tiet1Index !== -1 && tiet1Content) {
          const displayHeading = is1Tiet ? `${cleanLessonTitle.toUpperCase().trim()} (1 TIẾT)` : tiet1Content;
          planHtml += `<p style="font-size: 12.5pt; font-weight: bold; text-align: center; margin-top: 15px; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif; width: 100%; line-height: 1.25; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${displayHeading}</strong></p>`;
        } else if (!hasAnyTiet) {
          // Fallback: if no TIẾT was generated at all, automatically place "TIẾT 1: <TÊN BÀI DẠY>" under Section III
          const defaultTietTitle = is1Tiet ? `${cleanLessonTitle.toUpperCase().trim()} (1 TIẾT)` : `TIẾT 1: ${cleanLessonTitle.toUpperCase().trim()}`;
          planHtml += `<p style="font-size: 12.5pt; font-weight: bold; text-align: center; margin-top: 15px; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif; width: 100%; line-height: 1.25; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">${defaultTietTitle}</strong></p>`;
        }

        // Helper to clean prefixes robustly and eliminate any duplicate labels like "+ GV: | - GV:" or "- GV: + GV:"
        const cleanPrefix = (str: string): string => {
          let res = str.trim();
          res = res.replace(/^\|\s*/, '').replace(/\s*\|$/, '');
          let prev = "";
          while (prev !== res) {
            prev = res;
            res = res.replace(/^\|\s*/, '');
            res = res.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').trim();
            res = res.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();
            res = res.replace(/^(?:GV|Giáo viên|HS|Học sinh|Học Sinh)\s*[:\-\|]\s*/i, '').trim();
            res = res.replace(/^(?:[\+\-\*\|]\s*)?(?:GV|Giáo viên|HS|Học sinh|Học Sinh)\s*[:\-\|]?\s*/i, '').trim();
            res = res.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();
          }
          return res;
        };

        const hasAiSelected = selectedCompetencies.some(c => c.toLowerCase().includes('ai') || c.includes('3439')) || aiPowerup;

        const formatSubLine = (str: string, isGvCell: boolean): string => {
          if (!str) return '';
          let raw = str
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          
          if (!hasAiSelected) {
            raw = raw.replace(/\s*\(\s*Tích hợp AI\s*(?:-\s*[^)]+)?\)/gi, '');
            raw = raw.replace(/\s*Tích hợp AI\s*[:\-]/gi, '');
          }
          
          // Check if line specifies a Step (e.g. "Bước 1: ...", "+ Bước 1: ...", "- Bước 1: ...", "+ **Bước 1:** ...")
          const stepMatch = raw.match(/^(?:[\+\-\*#\s\d\.]*)?(?:<strong[^>]*>)?\s*(Bước\s*(\d+)(?:\s*\([^)]+\))?)\s*(?:<\/strong>)?\s*[:\.\-]?\s*(?:<\/strong>)?\s*(.*)/i);
          if (stepMatch) {
            let stepName = stepMatch[1].replace(/<\/?strong>/gi, '').trim();
            if (!hasAiSelected) {
              stepName = stepName.replace(/\s*\(\s*Tích hợp AI\s*(?:-\s*[^)]+)?\)/gi, '').trim();
            }
            let stepRest = stepMatch[3].trim();
            stepRest = stepRest.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();
            let cleanedRest = cleanPrefix(stepRest);
            cleanedRest = cleanedRest.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();
            cleanedRest = cleanedRest.replace(/^(?:GV|Giáo viên|HS|Học sinh|Học Sinh)\s*[:\-\|]?\s*/i, '').trim();
            cleanedRest = cleanedRest.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();
            
            // Format "Bước *" as bold: <strong>Bước 1:</strong>
            const boldStep = `<strong>${stepName}:</strong>`;
            if (isGvCell) {
              let gvLine = `+ ${boldStep} GV ${cleanedRest}`;
              gvLine = boldLessonTitleInLeadIn(gvLine);
              gvLine = applySmartTeacherNewlines(gvLine);
              return gvLine;
            } else {
              let hsLine = `- ${boldStep} HS ${cleanedRest}`;
              hsLine = boldLessonTitleInLeadIn(hsLine);
              return hsLine;
            }
          }

          let cleaned = cleanPrefix(raw);
          if (!cleaned) return '';
          cleaned = cleaned.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();
          cleaned = cleaned.replace(/^(?:GV|Giáo viên|HS|Học sinh|Học Sinh)\s*[:\-\|]?\s*/i, '').trim();
          cleaned = cleaned.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();

          // Ensure any "Bước *" inside normal sentences is bolded
          cleaned = cleaned.replace(/(?<!<strong>)\b(Bước\s*\d+(?:\s*\([^)]+\))?[:\.]?)\b(?!<\/strong>)/gi, '<strong>$1</strong>');

          if (isGDPT2018Plan || isBasicPlan || raw.includes('Bước') || raw.startsWith('+') || raw.startsWith('-')) {
            // Strictly enforce:
            // - GV [nội dung] (NO colon)
            // - HS [nội dung] (NO colon)
            if (isGvCell) {
              let gvLine = `- GV ${cleaned}`;
              gvLine = boldLessonTitleInLeadIn(gvLine);
              gvLine = applySmartTeacherNewlines(gvLine);
              return gvLine;
            } else {
              let hsLine = `- HS ${cleaned}`;
              hsLine = boldLessonTitleInLeadIn(hsLine);
              return hsLine;
            }
          } else {
            if (isGvCell) {
              let gvLine = `<strong>- GV:</strong> ${cleaned}`;
              gvLine = boldLessonTitleInLeadIn(gvLine);
              gvLine = applySmartTeacherNewlines(gvLine);
              return gvLine;
            } else {
              let hsLine = `<strong>- HS:</strong> ${cleaned}`;
              hsLine = boldLessonTitleInLeadIn(hsLine);
              return hsLine;
            }
          }
        };

        // Helper to check if a line belongs to GV
        const isGvLine = (l: string): boolean => {
          const tl = l.trim();
          return !!(
            tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:GV|Giáo viên)\s*[:\-\|]/i) ||
            tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:GV|Giáo viên)\s+(?:tổ chức|quy định|đặt câu hỏi|dẫn dắt|yêu cầu|hướng dẫn|giao|kết luận|chốt|trình chiếu|chuẩn hóa|giới thiệu|gọi|nhắc nhở|dặn dò)/i) ||
            tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:(?:\*\*|\*)?Bước\s*\d+[^:]*:(?:\*\*|\*)?\s*)?(?:GV|Giáo viên)\b/i) ||
            tl.match(/^\+\s*(?:(?:\*\*|\*)?Bước\s*\d+|GV\b)/i) ||
            tl.match(/^(?:\*\*|\*)?Bước\s*\d+[^:]*:(?:\*\*|\*)?\s*GV\b/i)
          );
        };

        // Helper to check if a line belongs to HS
        const isHsLine = (l: string): boolean => {
          const tl = l.trim();
          return !!(
            tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:HS|Học sinh|Học Sinh|họcsinh|hoc sinh)\s*[:\-\|]/i) ||
            tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:HS|Học sinh)\s+(?:lắng nghe|hào hứng|thực hiện|suy nghĩ|mở SGK|trả lời|thảo luận|làm bài|quan sát|tiếp thu|chia sẻ|xung phong|đối chiếu|tự sửa|nhận nhiệm vụ)/i) ||
            tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:(?:\*\*|\*)?Bước\s*\d+[^:]*:(?:\*\*|\*)?\s*)?(?:HS|Học sinh)\b/i) ||
            tl.match(/^\-\s*(?:(?:\*\*|\*)?Bước\s*\d+|HS\b)/i) ||
            tl.match(/^(?:\*\*|\*)?Bước\s*\d+[^:]*:(?:\*\*|\*)?\s*HS\b/i)
          );
        };

        // Pair GV and HS lines symmetrically
        interface SymmetricPair {
          gv: string;
          hs: string;
        }

        const buildSymmetricPairs = (
          rawGvLines: string[],
          rawHsLines: string[],
          actTitle: string,
          isGDPT2018: boolean,
          isBasic: boolean,
          startStepNum = 1
        ): SymmetricPair[] => {
          const hasSteps = rawGvLines.some(l => /Bước\s*\d+/i.test(l)) || rawHsLines.some(l => /Bước\s*\d+/i.test(l));

          const formatSubLineNoStep = (str: string, isGvCell: boolean): string => {
            let cleaned = cleanPrefix(str);
            cleaned = cleaned.replace(/^(?:(?:\*\*|\*)?Bước\s*\d+(?:\s*\([^)]+\))?[:\.\-]*(?:\*\*|\*)?\s*)+/gi, '').trim();
            cleaned = cleaned.replace(/^(?:GV|Giáo viên|HS|Học sinh|Học Sinh)\s*[:\-\|]?\s*/i, '').trim();
            if (!cleaned) return '';
            if (isGvCell) {
              let gvLine = `- GV ${cleaned}`;
              gvLine = boldLessonTitleInLeadIn(gvLine);
              gvLine = applySmartTeacherNewlines(gvLine);
              return gvLine;
            } else {
              let hsLine = `- HS ${cleaned}`;
              hsLine = boldLessonTitleInLeadIn(hsLine);
              return hsLine;
            }
          };

          if (hasSteps) {
            interface StepGroup {
              stepNum: number;
              stepLabel: string;
              lines: string[];
            }

            const groupLinesByStep = (lines: string[]): Map<number, StepGroup> => {
              const map = new Map<number, StepGroup>();
              let currentStep = startStepNum;
              let currentLabel = `Bước ${currentStep}`;
              let maxStepEncountered = startStepNum - 1;
              const seenStepNums = new Set<number>();

              lines.forEach(line => {
                const m = line.match(/(?:<strong[^>]*>)?\s*(Bước\s*(\d+)(?:\s*\([^)]+\))?)/i);
                if (m) {
                  let rawNum = parseInt(m[2], 10);
                  // Renumber if duplicate/restarted step number encountered within activity
                  if (seenStepNums.has(rawNum) && rawNum <= maxStepEncountered) {
                    currentStep = maxStepEncountered + 1;
                    currentLabel = `Bước ${currentStep}`;
                  } else {
                    currentStep = rawNum;
                    currentLabel = m[1].replace(/<\/?strong>/gi, '').trim();
                  }
                  seenStepNums.add(currentStep);
                  if (currentStep > maxStepEncountered) {
                    maxStepEncountered = currentStep;
                  }
                }
                if (!map.has(currentStep)) {
                  map.set(currentStep, { stepNum: currentStep, stepLabel: currentLabel, lines: [] });
                }
                map.get(currentStep)!.lines.push(line);
              });
              return map;
            };

            const gvMap = groupLinesByStep(rawGvLines);
            const hsMap = groupLinesByStep(rawHsLines);

            const allStepNums = Array.from(new Set([...Array.from(gvMap.keys()), ...Array.from(hsMap.keys())])).sort((a, b) => a - b);
            if (allStepNums.length === 0) allStepNums.push(startStepNum);

            const pairs: SymmetricPair[] = [];
            allStepNums.forEach(stepNum => {
              const gvGroup = gvMap.get(stepNum);
              const hsGroup = hsMap.get(stepNum);
              const label = gvGroup?.stepLabel || hsGroup?.stepLabel || `Bước ${stepNum}`;

              let gvFormatted = "";
              if (gvGroup && gvGroup.lines.length > 0) {
                // Ensure only the FIRST line has the "Bước X:" header to prevent repeating Bước 1 in the same cell
                gvFormatted = gvGroup.lines.map((l, lineIdx) => {
                  return lineIdx === 0 ? formatSubLine(l, true) : formatSubLineNoStep(l, true);
                }).filter(Boolean).join('<br/>');
              } else {
                gvFormatted = `+ <strong>${label}:</strong> GV hướng dẫn học sinh thực hiện nhiệm vụ học tập.`;
              }

              let hsFormatted = "";
              if (hsGroup && hsGroup.lines.length > 0) {
                // Ensure only the FIRST line has the "Bước X:" header to prevent repeating Bước 1 in the same cell
                hsFormatted = hsGroup.lines.map((l, lineIdx) => {
                  return lineIdx === 0 ? formatSubLine(l, false) : formatSubLineNoStep(l, false);
                }).filter(Boolean).join('<br/>');
              } else {
                const derived = deriveSymmetricHsAction(gvFormatted, actTitle);
                hsFormatted = `- <strong>${label}:</strong> HS ${derived}`;
              }

              if (isBasic && !isGDPT2018) {
                gvFormatted = cleanTeacherScript(gvFormatted);
                hsFormatted = cleanStudentScript(hsFormatted, gvFormatted, actTitle);
              }

              if (!isWordExport) {
                if (gvFormatted) gvFormatted = highlightNonAlignedPhrases(gvFormatted);
                if (hsFormatted) hsFormatted = highlightNonAlignedPhrases(hsFormatted);
              }

              pairs.push({ gv: gvFormatted, hs: hsFormatted });
            });

            return pairs;
          }

          // Line by line pairing for non-step activities
          const maxLen = Math.max(rawGvLines.length, rawHsLines.length, 1);
          const pairs: SymmetricPair[] = [];

          for (let i = 0; i < maxLen; i++) {
            const rawGv = rawGvLines[i];
            const rawHs = rawHsLines[i];

            let gvFormatted = rawGv ? formatSubLine(rawGv, true) : '';
            let hsFormatted = rawHs ? formatSubLine(rawHs, false) : '';

            if (!gvFormatted && hsFormatted) {
              gvFormatted = isGDPT2018
                ? "- GV Giáo viên quan sát, theo dõi và hỗ trợ học sinh thực hiện nhiệm vụ."
                : "<strong>- GV:</strong> Giáo viên quan sát, theo dõi và hỗ trợ học sinh thực hiện nhiệm vụ.";
            }

            if (!hsFormatted && gvFormatted) {
              const derived = deriveSymmetricHsAction(gvFormatted, actTitle);
              hsFormatted = isGDPT2018 ? `- HS ${derived}` : `<strong>- HS:</strong> ${derived}`;
            }

            if (isBasic && !isGDPT2018) {
              if (gvFormatted) gvFormatted = cleanTeacherScript(gvFormatted);
              if (hsFormatted) hsFormatted = cleanStudentScript(hsFormatted, gvFormatted, actTitle);
            }

            if (!isWordExport) {
              if (gvFormatted) gvFormatted = highlightNonAlignedPhrases(gvFormatted);
              if (hsFormatted) hsFormatted = highlightNonAlignedPhrases(hsFormatted);
            }

            if (gvFormatted || hsFormatted) {
              pairs.push({ gv: gvFormatted, hs: hsFormatted });
            }
          }

          return pairs;
        };

        // Helper to identify genuine main lesson activities (e.g. "Hoạt động 1: Khởi động", "Hoạt động 2: Khám phá")
        const isMainActivity = (rawTitle: string): boolean => {
          const clean = rawTitle.replace(/^[#\s\*:\-]+/g, '').trim();
          const lower = clean.toLowerCase();
          
          // Must NOT be textbook exercise, SGK page reference, or situation
          if (lower.includes("trang") || lower.includes("sgk") || lower.includes("sách giáo khoa") || lower.includes("tình huống")) {
            return false;
          }
          // Must NOT be teacher/student role or step
          if (/^(?:gv|giáo viên|hs|học sinh|bước|\+\s*bước|\-\s*bước)/i.test(clean)) {
            return false;
          }
          // Must NOT be Mục tiêu or Cách tiến hành
          if (lower.startsWith("mục tiêu") || lower.startsWith("cách tiến hành") || lower.startsWith("thời lượng") || lower.startsWith("sản phẩm")) {
            return false;
          }

          const hasActKeyword = /^(?:\d+[\.\:]\s*)?(?:hoạt động|activity)\s*\d+/i.test(clean);
          const hasPedagogicalStage = /khởi động|khám phá|luyện tập|vận dụng|thực hành|củng cố|trải nghiệm/i.test(lower);
          
          if (hasActKeyword) {
            if (/^(?:\d+[\.\:]\s*)?(?:hoạt động|activity)\s*\d+\s*(?:\([^)]+\)\s*)?[\:\-]/i.test(clean) || hasPedagogicalStage) {
              return true;
            }
            if (/^#{1,6}\s+/i.test(rawTitle.trim()) && (hasPedagogicalStage || clean.length < 50)) {
              return true;
            }
          } else if (hasPedagogicalStage && (clean.startsWith("1.") || clean.startsWith("2.") || clean.startsWith("3.") || clean.startsWith("4.") || /^#{1,6}\s+/i.test(rawTitle.trim()))) {
            return true;
          }
          return false;
        };

        // Helper to check if a line is a sub-section / sub-heading (e.g. "1. Thông tin và quyết định:", "2. Ba dạng thông tin thường gặp:", "a) Khái niệm:")
        const isSubSectionHeader = (txt: string): boolean => {
          const clean = txt.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').replace(/[\*\:_]+$/g, '').trim();
          const lower = clean.toLowerCase();
          if (lower.startsWith("gv") || lower.startsWith("giáo viên") || lower.startsWith("hs") || lower.startsWith("học sinh") || lower.startsWith("mục tiêu") || lower.startsWith("cách tiến hành")) {
            return false;
          }
          if (lower.includes("trang") || lower.includes("sgk") || lower.includes("sách giáo khoa") || lower.includes("tình huống")) {
            return false;
          }
          // Reject questions, quotes, directives, and student prompts (such as "2. 'Em hãy cho biết...'")
          if (clean.includes('?') || clean.startsWith('"') || clean.startsWith('“') || clean.startsWith("'") || clean.endsWith('"') || clean.endsWith('”')) {
            return false;
          }
          if (/^(?:\d+[\.\:]|[a-d]\))\s*["“'‘]?(?:em hãy|hãy|cho biết|nêu|tại sao|vì sao|theo em|câu hỏi|bài tập|thảo luận|quan sát|hãy cho biết|chỉ ra|báo cáo|chia sẻ)/i.test(clean)) {
            return false;
          }
          if (clean.length > 55) {
            return false;
          }
          return (
            /^(?:\d+[\.\:]|[a-d]\))\s+[A-ZÀ-Ỹ]/i.test(clean) ||
            /^(?:Mục|Phần)\s*\d+[\.\:]?\s*/i.test(clean)
          );
        };

        interface ActivitySubSection {
          subTitle?: string;
          gvLines: string[];
          hsLines: string[];
        }

        interface PreparedSubSection {
          subTitle?: string;
          hasSubTitle: boolean;
          pairs: SymmetricPair[];
        }

        blocks.forEach((block, index) => {
          const trimmedBlock = block.trim();
          if (!trimmedBlock) return;

          // Skip the TIẾT 1 block since it was already rendered at the very top of Section III
          if (index === tiet1Index) return;

          // Check if block represents an embedded Section IV heading
          const isIvBlock = trimmedBlock.match(/^(?:#{1,6}\s*|\*\*|\*)?(?:IV\.\s*ĐIỀU\s*CHỈNH|Điều chỉnh sau bài dạy)/i);
          if (isIvBlock) {
            planHtml += closeTable();
            const ivLines = trimmedBlock.split('\n').slice(1);
            if (!tiet1IvRendered && !hasTiet2) {
              const secTitle = "IV. ĐIỀU CHỈNH SAU BÀI DẠY";
              planHtml += renderSectionIVBlock(secTitle, ivLines);
              tiet1IvRendered = true;
            } else if (hasTiet2 && !tiet2IvRendered) {
              planHtml += renderSectionIVBlock("IV. ĐIỀU CHỈNH SAU BÀI DẠY", ivLines);
              planHtml += `</div><!-- END TIET 2 -->`;
              tiet2IvRendered = true;
            }
            return;
          }

          // If block represents a Lesson Period heading (TIẾT 2, TIẾT 3, etc.)
          const tietMatch = trimmedBlock.match(/(?:^|\n)(?:[-=~_]{3,}\s*)?(?:#{1,6}\s*|\*\*|\*\s*)?(TIẾT\s*([2-9])|Tiết\s*([2-9]))(.*)/i);
          const isTietBlock = (
            tietMatch || 
            ((trimmedBlock.includes("---") || trimmedBlock.toLowerCase().includes("kế hoạch bài dạy")) && (trimmedBlock.toLowerCase().includes("tiết 2") || trimmedBlock.toLowerCase().includes("(tiết 2)") || trimmedBlock.toLowerCase().includes("tiết 3") || trimmedBlock.toLowerCase().includes("(tiết 3)"))) ||
            (trimmedBlock.toLowerCase().startsWith("tiết ") || trimmedBlock.toLowerCase().startsWith("### tiết "))
          ) && !trimmedBlock.toLowerCase().includes("hoạt động 1") && !trimmedBlock.toLowerCase().includes("hoạt động 2");

          if (isTietBlock) {
            // Safely close the ongoing sub-table for previous period
            planHtml += closeTable();
            if (!tiet1IvRendered) {
              planHtml += renderSectionIVBlock("IV. ĐIỀU CHỈNH SAU BÀI DẠY");
              tiet1IvRendered = true;
            }
            hasTiet2 = true;
            tiet2SeenAct1 = false;
            const targetPeriodNum = tietMatch ? parseInt(tietMatch[2] || tietMatch[3] || "2", 10) : 2;
            let fullTietTitle = `TIẾT ${targetPeriodNum}: ${cleanLessonTitle.toUpperCase().trim()}`;
            if (tietMatch) {
              const tietPrefix = (tietMatch[1] || `TIẾT ${targetPeriodNum}`).toUpperCase().trim();
              const rawSubTitle = (tietMatch[4] || "").replace(/^[\s*:\-]+/g, '').trim();
              const cleanSubTitle = rawSubTitle ? rawSubTitle.toUpperCase() : cleanLessonTitle.toUpperCase().trim();
              fullTietTitle = `${tietPrefix}: ${cleanSubTitle}`;
            }

            planHtml += renderPeriodFullHeader(targetPeriodNum, undefined, undefined, fullTietTitle);
            return;
          }

          // Skip markdown table noise, instructions, or separator blocks
          const lowerBlock = trimmedBlock.toLowerCase();
          if (
            /^(?:[-=~_]{3,}|\s*)$/.test(trimmedBlock) ||
            lowerBlock.includes("bảng gồm 2 cột") ||
            lowerBlock.includes("bảng 2 cột") ||
            /^(?:hoạt động của giáo viên\s*\|\s*hoạt động của học sinh)/i.test(trimmedBlock.replace(/^[#\s\*:\-|]+/g, '').trim())
          ) {
            return;
          }

          // Discard noise lines
          const blockLines = trimmedBlock.split('\n');
          const firstLine = blockLines[0].replace(/^[#\s\*:\-]+/g, '').trim();
          const firstLineLower = firstLine.toLowerCase();

          // For Tiết 2: strictly check and delete any redundant rows / preamble lying above "1. Hoạt động 1: *"
          if (hasTiet2 && !tiet2SeenAct1) {
            const isAct1 = /^(?:\d+[\.\:]\s*)?(?:hoạt\s*động|HOẠT\s*ĐỘNG|activity)\s*1\b/i.test(firstLine);
            if (!isAct1) {
              return; // Discard any redundant block / header / notes above "1. Hoạt động 1: *" in Tiết 2!
            }
            tiet2SeenAct1 = true;
          }

          // Check if this block is pseudo-activity noise (e.g. "Hoạt động 1 (trang 5 SGK)... - Mục tiêu: ... - Cách tiến hành:")
          const isPseudoActivityNoise = (
            (firstLineLower.includes("trang") || firstLineLower.includes("sgk") || firstLineLower.includes("tình huống")) &&
            (firstLineLower.includes("hoạt động") || firstLineLower.includes("activity"))
          ) || (
            firstLineLower.startsWith("mục tiêu") || firstLineLower.startsWith("- mục tiêu") ||
            firstLineLower.startsWith("cách tiến hành") || firstLineLower.startsWith("- cách tiến hành")
          );

          // If table not open yet, open it
          if (!isTableOpen) {
            planHtml += openTable();
          }

          const isRealAct = isMainActivity(blockLines[0]);

          // If it's pseudo-activity noise, check if there are real GV/HS steps in this block
          if (isPseudoActivityNoise && !isRealAct) {
            const hasRealSteps = blockLines.some(l => {
              const tl = l.trim().toLowerCase();
              return (
                !tl.includes("trang") &&
                !tl.includes("sgk") &&
                !tl.startsWith("mục tiêu") &&
                !tl.startsWith("cách tiến hành") &&
                (tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:GV|HS|Giáo viên|Học sinh|Bước)\b/i) || tl.startsWith("+") || tl.startsWith("-"))
              );
            });
            if (!hasRealSteps) {
              return; // Completely drop this noise block!
            }
          }

          // If neither real activity nor contains GV/HS steps, check if it's just a section header
          const hasAnyStepInBlock = blockLines.some(l => {
            const tl = l.trim();
            return tl.match(/^(?:\-\s*|\+\s*|\*\s*)?(?:GV|HS|Giáo viên|Học sinh|Bước)\b/i);
          });

          if (!isRealAct && !hasAnyStepInBlock) {
            const cleanRowHeader = trimmedBlock.replace(/^(?:&bull;|[#\s\*:\-])+/g, '').trim();
            if (
              !cleanRowHeader || 
              cleanRowHeader === "|" || 
              cleanRowHeader.toLowerCase() === "cách tiến hành" ||
              cleanRowHeader.toLowerCase().startsWith("mục tiêu") ||
              cleanRowHeader.toLowerCase().includes("trang") ||
              cleanRowHeader.toLowerCase().includes("sgk") ||
              /^(?:[\d\s\.\,\;\:\-\*]|&bull;|&nbsp;)+$/.test(cleanRowHeader) ||
              cleanRowHeader.replace(/[^a-zA-ZÀ-ỹ]/g, '').length < 3
            ) {
              return;
            }

            planHtml += `<tr>`;
            planHtml += `<td colspan="2" style="border: 1px solid black; padding: 10px; background-color: #F9F9F9; font-weight: bold; font-size: 12.5pt; text-align: left;">`;
            planHtml += cleanRowHeader.replace(/\n/g, '<br/>');
            planHtml += `</td>`;
            planHtml += `</tr>`;
            return;
          }

          let actTitleLine = isRealAct ? firstLine : "";
          let col2Lines: string[] = [];
          let col1Lines: string[] = [];
          let isCollectingGoal = false;
          const bodyLines = isRealAct ? blockLines.slice(1) : blockLines;
          
          bodyLines.forEach(l => {
            const tl = l.trim();
            if (!tl) return;
            
            const isGoalHeader = tl.match(/^(?:-\s*)?(?:\*\*|\*)?(?:Mục tiêu|Yêu cầu cần đạt|Objectives?|Goals?)(?:\*\*|\*)?\s*[\:\-]?/i);
            const isProcedureHeader = tl.match(/^(?:-\s*)?(Exchange|-\s*)?(?:\*\*|\*)?(?:Cách tiến hành|Tiến trình|Các bước tiến hành|Procedures?|Methods?)(?:\*\*|\*)?\s*[\:\-]?/i);
            
            if (isGoalHeader) {
               isCollectingGoal = true;
               const contentAfterHeader = tl.replace(/^(?:-\s*)?(?:\*\*|\*)?(?:Mục tiêu|Yêu cầu cần đạt|Objectives?|Goals?)(?:\*\*|\*)?\s*[\:\-]?\s*/i, '').trim();
               if (contentAfterHeader) {
                 col2Lines.push(contentAfterHeader);
               }
            } else if (isProcedureHeader) {
               isCollectingGoal = false;
               const contentAfterHeader = tl.replace(/^(?:-\s*)?(Exchange|-\s*)?(?:\*\*|\*)?(?:Cách tiến hành|Tiến trình|Các bước tiến hành|Procedures?|Methods?)(?:\*\*|\*)?\s*[\:\-]?\s*/i, '').trim();
               if (contentAfterHeader) {
                 col1Lines.push(contentAfterHeader);
               }
            } else {
               if (isCollectingGoal) {
                 col2Lines.push(tl);
               } else {
                 col1Lines.push(l);
               }
            }
          });

          let col2Content = "";
          if (col2Lines.length > 0) {
            col2Content = col2Lines.map(line => {
              const cleanLine = line.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').trim();
              return cleanLine ? `+ ${cleanLine}` : '';
            }).filter(ln => ln !== '').join('<br/>');
          }

          if (isRealAct && !col2Content) {
            if (actTitleLine.toLowerCase().includes("khởi động")) {
              col2Content = "+ Kích thích sự tò mò, dẫn dắt học sinh vào khái niệm bài học qua hình ảnh minh họa trong SGK.";
            } else if (actTitleLine.toLowerCase().includes("khám phá")) {
              col2Content = "+ Giúp học sinh hiểu và nắm bắt kiến thức trọng tâm bài học thông qua các ví dụ thực tế.";
            } else if (actTitleLine.toLowerCase().includes("luyện tập")) {
              col2Content = "+ Củng cố và rèn luyện kỹ năng giải quyết bài tập liên quan đến nội dung bài học.";
            } else if (actTitleLine.toLowerCase().includes("vận dụng")) {
              col2Content = "+ Liên hệ thực tế bản thân và gia đình để giải quyết tình huống thực tiễn.";
            } else {
              col2Content = "+ Học sinh biết áp dụng kiến thức cốt lõi vào thực tế bài học.";
            }
          }

          // Only render top-level Activity title, Mục tiêu, and Cách tiến hành rows for genuine activities
          if (isRealAct) {
            // Ensure activity title includes duration
            let finalActTitle = actTitleLine;
            if (isGDPT2018Plan) {
              finalActTitle = finalActTitle.replace(/^(?!\d+[\.\:]\s*)(?:Hoạt\s*động|HOẠT\s*ĐỘNG)\s*(\d+)/i, '$1. Hoạt động $1');
              finalActTitle = finalActTitle.replace(/^(\d+\.\s*Hoạt\s*động\s*\d+)\s*[\:\-]?\s*/i, '$1: ');
            }
            if (!/\(\s*\d+\s*(?:phút|p)\s*\)/i.test(finalActTitle)) {
              const lowerTitle = finalActTitle.toLowerCase();
              if (lowerTitle.includes("khởi động")) {
                finalActTitle += " (5 phút)";
              } else if (lowerTitle.includes("khám phá")) {
                finalActTitle += " (18 phút)";
              } else if (lowerTitle.includes("luyện tập") || lowerTitle.includes("thực hành")) {
                finalActTitle += " (7 phút)";
              } else if (lowerTitle.includes("vận dụng")) {
                finalActTitle += " (5 phút)";
              }
            }

            // Full-width Activity Header row spanning both columns 
            planHtml += `<tr style="page-break-inside: avoid;">`;
            planHtml += `<td colspan="2" style="border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: ${isGDPT2018Plan ? '#ffffff' : '#F2F2F2'}; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}">`;
            planHtml += `<strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${finalActTitle}</strong>`;
            planHtml += `</td>`;
            planHtml += `</tr>`;

            // Mục tiêu row spanning both columns
            const goals = col2Content.split('<br/>').map(g => g.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').trim()).filter(Boolean);
            const goalsText = goals.length > 0 ? goals.join('; ') : "Học sinh hiểu và nắm vững kiến thức cốt lõi của hoạt động.";
            planHtml += `<tr style="page-break-inside: avoid;">`;
            planHtml += `<td colspan="2" style="border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #FAFAFA; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
            planHtml += `<strong>- Mục tiêu:</strong> ${goalsText}`;
            planHtml += `</td>`;
            planHtml += `</tr>`;

            // Cách tiến hành banner row spanning both columns - viền 1px solid black rõ ràng, liền mạch
            planHtml += `<tr style="page-break-inside: avoid;">`;
            planHtml += `<td colspan="2" style="border: 1px solid black; border-bottom: 1px solid black; mso-border-alt: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #FDFDFD; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
            planHtml += `<strong>- Cách tiến hành:</strong>`;
            planHtml += `</td>`;
            planHtml += `</tr>`;
          }

          // Structure activity content into clean sub-sections (no redundant fragmented rows)
          const subSections: ActivitySubSection[] = [];
          let currentSub: ActivitySubSection = { gvLines: [], hsLines: [] };

          col1Lines.forEach(l => {
            const lineText = l.trim();
            if (!lineText) return;

            // Check if line is a markdown table row with pipe '|'
            if (lineText.includes('|')) {
              const parts = lineText.split('|').map(p => p.trim()).filter(p => p !== '');
              if (parts.length >= 2) {
                const p1 = parts[0];
                const p2 = parts[1];
                if (/hoạt động của (?:giáo viên|gv)/i.test(p1) && /hoạt động của (?:học sinh|hs)/i.test(p2)) {
                  return;
                }
                if (p1) currentSub.gvLines.push(p1);
                if (p2) currentSub.hsLines.push(p2);
                return;
              }
            }

            // Check GV/HS lines FIRST - never strip them or lose Bước 1!
            if (isGvLine(lineText)) {
              currentSub.gvLines.push(lineText);
              return;
            }
            if (isHsLine(lineText)) {
              currentSub.hsLines.push(lineText);
              return;
            }

            // 1. Discard lines that are only numbers, punctuation, list bullets, or noise
            if (
              /^(?:[\d\s\.\,\;\:\-\*\|=+~_#]|&bull;|&nbsp;)+$/.test(lineText) ||
              /^(?:\d+[\.\;\:\)]\s*)+$/.test(lineText) ||
              /^(?:[-=~_]{3,}|\s*)$/.test(lineText)
            ) {
              return;
            }

            // 2. Skip sub-activity title lines when requested
            if (layoutExcludeSubActivities && isSubActivityTitle(lineText)) {
              return;
            }

            // 3. De-noise general terms, pseudo-activity titles, "Mục tiêu", or "Cách tiến hành" appearing between steps
            const deNoised = lineText.toLowerCase().replace(/^(?:&bull;|[#\s\-\*\+=•:])+/g, '').trim();
            if (
              deNoised === "cách tiến hành" ||
              deNoised === "- cách tiến hành" ||
              deNoised.startsWith("cách tiến hành") ||
              deNoised.startsWith("- cách tiến hành") ||
              deNoised === "" ||
              deNoised.startsWith("mục tiêu") ||
              deNoised.startsWith("- mục tiêu") ||
              deNoised.startsWith("thời lượng") ||
              deNoised.startsWith("sản phẩm") ||
              deNoised.startsWith("nội dung") ||
              /^(?:hoạt động của (?:giáo viên|gv)\s*\|\s*hoạt động của (?:học sinh|hs))$/i.test(deNoised) ||
              /^[-=:|\s]+$/.test(lineText)
            ) {
              return;
            }

            // Discard orphaned numbered question lines, quotes, or prompts that create redundant rows in activity tables (e.g. 2. "Em hãy cho biết...")
            const cleanCandidate = lineText.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').trim();
            if (
              /^(?:\d+[\.\:]|[a-d]\))\s*["“'‘]?(?:em hãy|hãy|cho biết|nêu|tại sao|vì sao|theo em|câu hỏi|bài tập|thảo luận|quan sát|hãy cho biết|chỉ ra)/i.test(cleanCandidate) ||
              /^\d+[\.\:]\s*["“'‘]/.test(cleanCandidate) ||
              (cleanCandidate.includes('?') && /^(?:\d+[\.\:]|[a-d]\))\s*/.test(cleanCandidate))
            ) {
              return; // Eliminate redundant question row!
            }

            // 4. Check if line is a sub-section header (e.g. "1. Thông tin và quyết định:", "2. Ba dạng...", "a) Khái niệm:")
            if (isSubSectionHeader(lineText)) {
              const cleanSub = lineText.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').replace(/\*\*/g, '').trim();
              const lettersOnly = cleanSub.replace(/[^a-zA-ZÀ-ỹ]/g, '');
              if (lettersOnly.length >= 3) {
                if (currentSub.gvLines.length > 0 || currentSub.hsLines.length > 0) {
                  subSections.push(currentSub);
                }
                currentSub = { subTitle: cleanSub, gvLines: [], hsLines: [] };
                return;
              }
            }

            // Redundant noise line between steps or continuation note:
            const plainText = lineText.replace(/^(?:&bull;|[#\s\-\*\+=•:])+/g, '').trim();
            if (/^[\d\s\.\,\;\:\-\*]+$/.test(plainText) || plainText.replace(/[^a-zA-ZÀ-ỹ]/g, '').length < 3) {
              return; // Discard redundant line between steps!
            }
            // Append continuation line to previous item if exists, otherwise add to GV
            if (currentSub.hsLines.length > 0 && currentSub.gvLines.length === 0) {
              currentSub.hsLines[currentSub.hsLines.length - 1] += "<br/>" + lineText;
            } else if (currentSub.gvLines.length > 0) {
              currentSub.gvLines[currentSub.gvLines.length - 1] += "<br/>" + lineText;
            } else {
              currentSub.gvLines.push(lineText);
            }
          });

          // Push the final sub-section
          if (currentSub.gvLines.length > 0 || currentSub.hsLines.length > 0) {
            subSections.push(currentSub);
          }

          // Fallback if empty
          const validSubSections = subSections.filter(sub => sub.gvLines.length > 0 || sub.hsLines.length > 0);
          if (validSubSections.length === 0) {
            validSubSections.push({
              gvLines: ["Giáo viên hướng dẫn và giao nhiệm vụ học tập cho học sinh."],
              hsLines: ["Học sinh chú ý lắng nghe và tích cực thực hiện nhiệm vụ."]
            });
          }

          // Pre-calculate all symmetric pairs across all validSubSections for this activity
          const preparedSubs: PreparedSubSection[] = [];
          let totalPairsInAct = 0;
          let runningStepNum = 1;

          validSubSections.forEach((sub) => {
            const cleanSubTitle = sub.subTitle ? sub.subTitle.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').trim() : '';
            const lowerSub = cleanSubTitle.toLowerCase();
            const hasRealLetters = cleanSubTitle.replace(/[^a-zA-ZÀ-ỹ]/g, '').length >= 3;
            const isInvalidSub = (
              !cleanSubTitle ||
              !hasRealLetters ||
              cleanSubTitle.length > 55 ||
              cleanSubTitle.includes('?') ||
              cleanSubTitle.startsWith('"') ||
              cleanSubTitle.startsWith('“') ||
              /^(?:\d+[\.\:]|[a-d]\))\s*["“'‘]?(?:em hãy|hãy|cho biết|nêu|tại sao|vì sao|theo em|câu hỏi|bài tập)/i.test(cleanSubTitle) ||
              /^[\d\s\.\;\:\-\*]+$/.test(cleanSubTitle) ||
              lowerSub.includes("trang") ||
              lowerSub.includes("sgk") ||
              lowerSub.includes("tình huống") ||
              lowerSub.startsWith("mục tiêu") ||
              lowerSub.startsWith("cách tiến hành") ||
              lowerSub.startsWith("hoạt động")
            );

            const pairs = buildSymmetricPairs(sub.gvLines, sub.hsLines, actTitleLine, isGDPT2018Plan, isBasicPlan, runningStepNum);
            runningStepNum += pairs.length;
            totalPairsInAct += pairs.length;
            preparedSubs.push({
              subTitle: cleanSubTitle,
              hasSubTitle: !isInvalidSub && !!cleanSubTitle,
              pairs
            });
          });

          let currentPairIdx = 0;
          preparedSubs.forEach(pSub => {
            if (pSub.hasSubTitle && pSub.subTitle) {
              const subTopBorder = isGDPT2018Plan ? 'none' : '1px solid black';
              const subBottomBorder = isGDPT2018Plan ? 'none' : '1px solid black';
              const subMsoTop = isGDPT2018Plan ? 'none' : 'solid windowtext 1.0pt';
              const subMsoBottom = isGDPT2018Plan ? 'none' : 'solid windowtext 1.0pt';
              planHtml += `<tr style="page-break-inside: avoid;">`;
              planHtml += `<td colspan="2" style="border-top: ${subTopBorder}; border-bottom: ${subBottomBorder}; border-left: 1px solid black; border-right: 1px solid black; mso-border-top-alt: ${subMsoTop}; mso-border-bottom-alt: ${subMsoBottom}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #F8F8F8; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
              planHtml += `<strong>${pSub.subTitle}</strong>`;
              planHtml += `</td>`;
              planHtml += `</tr>`;
            }

            pSub.pairs.forEach(pair => {
              currentPairIdx++;
              const isLast = (currentPairIdx === totalPairsInAct);
              const bottomBorder = isLast ? '1px solid black' : 'none';
              const topBorder = 'none';
              const msoBottomBorder = isLast ? 'solid windowtext 1.0pt' : 'none';
              const leftBorderHs = '1px solid black';

              planHtml += `<tr valign="top" style="vertical-align: top; page-break-inside: avoid;">`;
              planHtml += `<td valign="top" style="border-top: ${topBorder}; border-bottom: ${bottomBorder}; border-left: 1px solid black; border-right: 1px solid black; mso-border-top-alt: none; mso-border-bottom-alt: ${msoBottomBorder}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; vertical-align: top; width: 55%; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">${pair.gv}</td>`;
              planHtml += `<td valign="top" style="border-top: ${topBorder}; border-bottom: ${bottomBorder}; border-left: ${leftBorderHs}; border-right: 1px solid black; mso-border-top-alt: none; mso-border-bottom-alt: ${msoBottomBorder}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; vertical-align: top; width: 45%; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">${pair.hs}</td>`;
              planHtml += `</tr>`;
            });
          });
        });

        planHtml += closeTable();

        // Ensure Tiết 1 has Section IV if not already rendered
        if (!tiet1IvRendered) {
          const secTitle = "IV. ĐIỀU CHỈNH SAU BÀI DẠY";
          const p1IvLines = textSecIV ? textSecIV.split('\n').slice(1) : undefined;
          planHtml += renderSectionIVBlock(secTitle, p1IvLines);
          tiet1IvRendered = true;
        }

        // Render all subsequent periods (Tiết 2, Tiết 3, ..., Tiết parsedDurationNum)
        if (parsedDurationNum >= 2 || subsequentPeriods.length > 0) {
          subsequentPeriods.forEach(sp => {
            const pNum = sp.periodNum;
            if (pNum > parsedDurationNum && !sp.rawText) return;

            let periodRendered = false;
            let fullPeriodTitle = "";
            const pSubMatch = sp.rawText.match(new RegExp(`(?:^|\\n)(?:#{1,6}\\s*|\\*\\*|\\*)?(TIẾT\\s*${pNum}\\s*[:\\-][^\\n\\r]+)`, "i"));
            if (pSubMatch) {
              fullPeriodTitle = pSubMatch[1].replace(/^[#\s\*]+/, '').trim().toUpperCase();
            } else {
              const isInfoLesson = cleanLessonTitle.toLowerCase().includes("thông tin") || cleanLessonTitle.toLowerCase().includes("quyết định") || text.toLowerCase().includes("thông tin và quyết định");
              if (isInfoLesson) {
                if (pNum === 2) fullPeriodTitle = "TIẾT 2: BA DẠNG THÔNG TIN THƯỜNG GẶP";
                else if (pNum === 3) fullPeriodTitle = "TIẾT 3: THỰC HÀNH VÀ TRẢI NGHIỆM VỀ THÔNG TIN";
                else fullPeriodTitle = `TIẾT ${pNum}: ${cleanLessonTitle.toUpperCase().trim()}`;
              } else {
                fullPeriodTitle = `TIẾT ${pNum}: ${cleanLessonTitle.toUpperCase().trim()}`;
              }
            }

            // Check if AI generated activities for this period
            const hasRealActivities = Boolean(
              sp.sections.secIII &&
              sp.sections.secIII.trim().length > 60 &&
              /(?:hoạt\s*động|activity)\s*\d+/i.test(sp.sections.secIII)
            );

            if (hasRealActivities) {
              periodRendered = true;
              planHtml += renderPeriodFullHeader(pNum, sp.sections.secI, sp.sections.secII, fullPeriodTitle);
              planHtml += openTable();

              const pLinesIII = sp.sections.secIII.trim().split('\n');
              const pFirstLine = pLinesIII[0];
              const pCleanStepsText = sp.sections.secIII.substring(pFirstLine.length).trim();

              const pAct1Search = pCleanStepsText.search(/(?:^|\n)(?=#{1,6}\s*(?:\d+[\.\:]\s*)?(?:Hoạt\s*động|HOẠT\s*ĐỘNG|Activity)\s*1\b|(?:\d+[\.\:]\s*)(?:Hoạt\s*động|HOẠT\s*ĐỘNG|Activity)\s*1\b|(?:Hoạt\s*động|HOẠT\s*ĐỘNG|Activity)\s*1\s*[\:\-])/i);
              const pCleanTextFromAct1 = pAct1Search !== -1 ? pCleanStepsText.substring(pAct1Search).trim() : pCleanStepsText;

              let pBlocks = pCleanTextFromAct1.split(/\n(?=(?:[-=~_]{3,}|\bKẾ HOẠCH BÀI DẠY\b|(?:#{1,6}\s*|\*\*|\*)?(?:TIẾT\s*[1-9]|Tiết\s*[1-9])|(?:#{1,6}\s*|\*\*|\*)?(?:IV|V)\.\s*ĐIỀU\s*CHỈNH|\bĐiều chỉnh sau bài dạy|\bIV\.\s*ĐÁNH\s*GIÁ|#{1,6}\s*(?:\d+[\.\:]\s*)?(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+|(?:\d+[\.\:]\s*)(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+\s*[\:\-]|(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+\s*[\:\-]\s*(?:Khởi động|Khám phá|Luyện tập|Vận dụng|Thực hành|Củng cố|[A-ZÀ-Ỹ])))/i);

              const firstAct1Index = pBlocks.findIndex(b => {
                const fb = b.trim().toLowerCase();
                return fb.includes("hoạt động 1") || fb.includes("activity 1");
              });
              if (firstAct1Index > 0) {
                pBlocks = pBlocks.slice(firstAct1Index);
              }

              pBlocks.forEach(pBlock => {
                const trimmedBlock = pBlock.trim();
                if (!trimmedBlock) return;
                const lowerBlock = trimmedBlock.toLowerCase();
                if (
                  /^(?:[-=~_]{3,}|\s*)$/.test(trimmedBlock) ||
                  lowerBlock.includes("bảng gồm 2 cột") ||
                  lowerBlock.includes("bảng 2 cột") ||
                  lowerBlock.startsWith("iv.") ||
                  lowerBlock.includes("điều chỉnh sau bài dạy") ||
                  /^(?:hoạt động của giáo viên\s*\|\s*hoạt động của học sinh)/i.test(trimmedBlock.replace(/^[#\s\*:\-|]+/g, '').trim())
                ) {
                  return;
                }

                let blockLines = trimmedBlock.split('\n');
                const actTitleIdx = blockLines.findIndex(l => isMainActivity(l) || /^(?:#{1,6}\s*)?(?:\d+[\.\:]\s*)?(?:Hoạt\s*động|HOẠT\s*ĐỘNG|Activity)\s*\d+/i.test(l.trim()));
                if (actTitleIdx > 0) {
                  blockLines = blockLines.slice(actTitleIdx);
                }

                const pFirst = blockLines[0].replace(/^[#\s\*:\-]+/g, '').trim();
                if (!isMainActivity(blockLines[0]) && !blockLines.some(l => isGvLine(l) || isHsLine(l))) {
                  return;
                }

                let pActTitle = pFirst;
                const pTitleMatch = pFirst.match(/^((?:\d+[\.\:]\s*)?(?:Hoạt động|HOẠT ĐỘNG|Activity)\s*\d+(?:\s*\([^)]+\))?[\:\-]?\s*[^\n\r]*)/i);
                if (pTitleMatch) {
                  pActTitle = pTitleMatch[1];
                }
                pActTitle = pActTitle.replace(/[\*\:_]+$/g, '').trim();
                if (isGDPT2018Plan) {
                  pActTitle = pActTitle.replace(/^(?!\d+[\.\:]\s*)(?:Hoạt\s*động|HOẠT\s*ĐỘNG)\s*(\d+)/i, '$1. Hoạt động $1');
                  pActTitle = pActTitle.replace(/^(\d+\.\s*Hoạt\s*động\s*\d+)\s*[\:\-]?\s*/i, '$1: ');
                }

                let pGoalText = "Học sinh hiểu và nắm vững kiến thức cốt lõi của hoạt động.";
                const pGoalMatch = trimmedBlock.match(/(?:^|\n)\s*[-*•]?\s*Mục tiêu\s*[:\-]\s*([^\n\r]+)/i);
                if (pGoalMatch) {
                  pGoalText = pGoalMatch[1].trim();
                }

                planHtml += `<tr style="page-break-inside: avoid;">`;
                planHtml += `<td colspan="2" style="border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: ${isGDPT2018Plan ? '#ffffff' : '#F2F2F2'}; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}">`;
                planHtml += `<strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${pActTitle}</strong>`;
                planHtml += `</td>`;
                planHtml += `</tr>`;

                planHtml += `<tr style="page-break-inside: avoid;">`;
                planHtml += `<td colspan="2" style="border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #FAFAFA; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
                planHtml += `<strong>- Mục tiêu:</strong> ${pGoalText}`;
                planHtml += `</td>`;
                planHtml += `</tr>`;

                planHtml += `<tr style="page-break-inside: avoid;">`;
                planHtml += `<td colspan="2" style="border: 1px solid black; border-bottom: 1px solid black; mso-border-alt: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #FDFDFD; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
                planHtml += `<strong>- Cách tiến hành:</strong>`;
                planHtml += `</td>`;
                planHtml += `</tr>`;

                const subs: ActivitySubSection[] = [];
                let currentSub: ActivitySubSection = { gvLines: [], hsLines: [] };

                blockLines.slice(1).forEach(l => {
                  const lineText = l.trim();
                  if (!lineText) return;
                  if (isGvLine(lineText)) {
                    currentSub.gvLines.push(lineText);
                    return;
                  }
                  if (isHsLine(lineText)) {
                    currentSub.hsLines.push(lineText);
                    return;
                  }
                  if (isSubSectionHeader(lineText)) {
                    const cleanSub = lineText.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').replace(/\*\*/g, '').trim();
                    if (currentSub.gvLines.length > 0 || currentSub.hsLines.length > 0) {
                      subs.push(currentSub);
                    }
                    currentSub = { subTitle: cleanSub, gvLines: [], hsLines: [] };
                  }
                });
                if (currentSub.gvLines.length > 0 || currentSub.hsLines.length > 0) {
                  subs.push(currentSub);
                }
                if (subs.length === 0) {
                  subs.push({
                    gvLines: [`Giáo viên hướng dẫn và giao nhiệm vụ học tập Tiết ${pNum} cho học sinh.`],
                    hsLines: ["Học sinh chú ý lắng nghe và tích cực thực hiện nhiệm vụ."]
                  });
                }

                const preparedSubs: PreparedSubSection[] = [];
                let totalPairs = 0;
                subs.forEach(sub => {
                  const cleanSubTitle = sub.subTitle ? sub.subTitle.replace(/^(?:&bull;|[#\s\-\*\+=•])+/g, '').trim() : '';
                  const pairs = buildSymmetricPairs(sub.gvLines, sub.hsLines, pActTitle, isGDPT2018Plan, isBasicPlan);
                  totalPairs += pairs.length;
                  preparedSubs.push({
                    subTitle: cleanSubTitle,
                    hasSubTitle: !!cleanSubTitle,
                    pairs
                  });
                });

                let pairIdx = 0;
                preparedSubs.forEach(pSub => {
                  if (pSub.hasSubTitle && pSub.subTitle) {
                    const subTopBorder = isGDPT2018Plan ? 'none' : '1px solid black';
                    const subBottomBorder = isGDPT2018Plan ? 'none' : '1px solid black';
                    const subMsoTop = isGDPT2018Plan ? 'none' : 'solid windowtext 1.0pt';
                    const subMsoBottom = isGDPT2018Plan ? 'none' : 'solid windowtext 1.0pt';
                    planHtml += `<tr style="page-break-inside: avoid;">`;
                    planHtml += `<td colspan="2" style="border-top: ${subTopBorder}; border-bottom: ${subBottomBorder}; border-left: 1px solid black; border-right: 1px solid black; mso-border-top-alt: ${subMsoTop}; mso-border-bottom-alt: ${subMsoBottom}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #F8F8F8; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
                    planHtml += `<strong>${pSub.subTitle}</strong>`;
                    planHtml += `</td>`;
                    planHtml += `</tr>`;
                  }

                  pSub.pairs.forEach(pair => {
                    pairIdx++;
                    const isLast = (pairIdx === totalPairs);
                    const bottomBorder = isLast ? '1px solid black' : 'none';
                    const topBorder = 'none';
                    const msoBottomBorder = isLast ? 'solid windowtext 1.0pt' : 'none';
                    const leftBorderHs = '1px solid black';

                    planHtml += `<tr valign="top" style="vertical-align: top; page-break-inside: avoid;">`;
                    planHtml += `<td valign="top" style="border-top: ${topBorder}; border-bottom: ${bottomBorder}; border-left: 1px solid black; border-right: 1px solid black; mso-border-top-alt: none; mso-border-bottom-alt: ${msoBottomBorder}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; vertical-align: top; width: 55%; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">${pair.gv}</td>`;
                    planHtml += `<td valign="top" style="border-top: ${topBorder}; border-bottom: ${bottomBorder}; border-left: ${leftBorderHs}; border-right: 1px solid black; mso-border-top-alt: none; mso-border-bottom-alt: ${msoBottomBorder}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; vertical-align: top; width: 45%; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">${pair.hs}</td>`;
                    planHtml += `</tr>`;
                  });
                });
              });

              planHtml += closeTable();
              const pIvLines = sp.sections.secIV ? sp.sections.secIV.split('\n').slice(1) : undefined;
              planHtml += renderSectionIVBlock("IV. ĐIỀU CHỈNH SAU BÀI DẠY", pIvLines);
              planHtml += `</div><!-- END TIET ${pNum} -->`;
            }

            // Fallback synthesis if this period was not generated by AI or had insufficient content
            if (!periodRendered && pNum <= parsedDurationNum) {
              planHtml += renderPeriodFullHeader(pNum, undefined, undefined, fullPeriodTitle);
              planHtml += openTable();

              const isInfoLesson = cleanLessonTitle.toLowerCase().includes("thông tin") || cleanLessonTitle.toLowerCase().includes("quyết định") || text.toLowerCase().includes("thông tin và quyết định");
              
              const periodActivities = (pNum === 2 && isInfoLesson) ? [
                {
                  title: "Hoạt động 1: Khởi động (5 phút)",
                  goal: "Ôn lại kiến thức tiết 1 và tạo tâm thế hào hứng bước vào nội dung mới Tiết 2 qua trò chơi tương tác.",
                  rows: [
                    {
                      gv: 'GV tổ chức trò chơi "AI thông minh" (hoặc trò chơi liên kết): GV đóng vai robot, yêu cầu HS cung cấp thông tin bằng các dạng khác nhau để robot thực hiện hành động.',
                      hs: "HS hào hứng tham gia trò chơi, tích cực truyền thông tin cho robot."
                    },
                    {
                      gv: 'GV đặt câu hỏi gợi mở kết nối: "Các em đã cung cấp thông tin cho thầy bằng những dạng nào?"',
                      hs: 'HS suy nghĩ và trả lời: "Bằng lời nói, bằng chữ viết hoặc bằng hành động/hình ảnh ạ."'
                    },
                    {
                      gv: "GV nhận xét và dẫn dắt vào bài học mới Tiết 2: Ba dạng thông tin thường gặp.",
                      hs: "HS lắng nghe, mở SGK Tiết 2 và ghi tên bài vào vở."
                    }
                  ]
                },
                {
                  title: "Hoạt động 2: Khám phá - Ba dạng thông tin thường gặp (15 phút)",
                  goal: "HS nhận biết và phân biệt được ba dạng thông tin thường gặp: dạng chữ, dạng hình ảnh, dạng âm thanh thông qua tranh ảnh và ví dụ trong đời sống.",
                  rows: [
                    {
                      gv: "+ Bước 1: GV yêu cầu HS quan sát Hình 1, Hình 2, Hình 3 (trang 6, 7 SGK) về ba dạng thông tin thường gặp (trang sách truyện, biển báo giao thông, tiếng còi xe).",
                      hs: "- Bước 1: HS mở SGK, đọc thông tin và quan sát kỹ các hình ảnh theo hướng dẫn của GV."
                    },
                    {
                      gv: '+ Bước 2: Sử dụng phương pháp vấn đáp: "Con người thường tiếp nhận thông tin dưới những dạng nào? Hãy kể tên từng dạng thông tin trong các hình ảnh trên?"',
                      hs: '- Bước 2: HS xung phong trả lời câu hỏi của GV: "Ba dạng thông tin thường gặp là dạng chữ, dạng hình ảnh và dạng âm thanh."'
                    },
                    {
                      gv: '+ Bước 3: GV trình chiếu bảng ví dụ/phiếu học tập, yêu cầu HS thảo luận cặp đôi: "Tìm thêm các ví dụ thực tế trong lớp học và đời sống về từng dạng thông tin trên."',
                      hs: '- Bước 3: HS thảo luận cặp đôi tích cực và hoàn thành điền vào bảng ví dụ: chữ trên bảng (dạng chữ), tranh ảnh (dạng hình ảnh), tiếng trống trường (dạng âm thanh).'
                    },
                    {
                      gv: "+ Bước 4: GV chốt kiến thức bằng sơ đồ:\nBa dạng thông tin thường gặp: [Dạng chữ (sách, báo)] → [Dạng hình ảnh (tranh vẽ, biển chỉ dẫn)] → [Dạng âm thanh (tiếng chuông, tiếng nói)].",
                      hs: "- Bước 4: HS quan sát sơ đồ trên máy chiếu, khắc sâu quy trình và kiến thức cốt lõi."
                    }
                  ]
                },
                {
                  title: "Hoạt động 3: Luyện tập (10 phút)",
                  goal: "Củng cố kiến thức và rèn luyện kỹ năng thực hành phân loại các dạng thông tin của Tiết 2.",
                  rows: [
                    {
                      gv: "+ Bước 1: GV giao bài tập trong SGK (hoặc phiếu học tập): nối các tình huống (đồng hồ báo thức, dòng chữ thông báo, bức ảnh gia đình) với dạng thông tin tương ứng.",
                      hs: "- Bước 1: HS nhận nhiệm vụ, mở SGK làm bài tập cá nhân vào vở."
                    },
                    {
                      gv: "+ Bước 2: GV gọi đại diện học sinh báo cáo kết quả bài tập.",
                      hs: "- Bước 2: Đại diện HS tự tin trình bày kết quả, đối chiếu bài làm cùng bạn."
                    },
                    {
                      gv: "+ Bước 3: GV hướng dẫn nhận xét, chuẩn hóa kiến thức và chốt đáp án đúng.",
                      hs: "- Bước 3: HS chú ý lắng nghe, tự sửa bài vào vở."
                    },
                    {
                      gv: "+ Bước 4 (Tích hợp AI): GV giới thiệu thêm tính năng thông minh: máy tính và robot thông minh (AI) cũng có thể đọc chữ, nhận diện hình ảnh và nghe giọng nói tương tự con người.",
                      hs: "- Bước 4: HS hào hứng theo dõi, mở rộng vốn hiểu biết về ứng dụng công nghệ trong học tập."
                    }
                  ]
                },
                {
                  title: "Hoạt động 4: Vận dụng (5 phút)",
                  goal: "HS biết ứng dụng kiến thức Tiết 2 vào thực tế cuộc sống.",
                  rows: [
                    {
                      gv: 'GV giao nhiệm vụ thực tế: "Trên đường đi học về hoặc ở nhà, các em hãy quan sát xem mình gặp những dạng thông tin nào (đèn tín hiệu giao thông, tiếng còi xe, biển chỉ dẫn)?"',
                      hs: "HS suy nghĩ và chia sẻ dự định cùng thông tin căn cứ của bản thân."
                    },
                    {
                      gv: "GV khuyến khích HS về nhà tìm hiểu thêm các thiết bị thông minh (AI) biết nhận thông tin để hoạt động và dặn dò chuẩn bị bài học tiếp theo.",
                      hs: "HS tiếp thu nhiệm vụ vận dụng thực tế tại gia đình và ghi nhớ dặn dò của GV."
                    }
                  ]
                }
              ] : (pNum === 3 && isInfoLesson) ? [
                {
                  title: "Hoạt động 1: Khởi động (5 phút)",
                  goal: "Tạo hứng thú và kết nối kiến thức các dạng thông tin ở Tiết 2 sang hoạt động thực hành Tiết 3.",
                  rows: [
                    {
                      gv: 'GV tổ chức trò chơi "Ai nhanh hơn": Chiếu hình ảnh các tình huống thực tế và yêu cầu HS nhận diện nhanh dạng thông tin tương ứng.',
                      hs: "HS hào hứng tham gia trả lời nhanh và chính xác."
                    },
                    {
                      gv: "GV nhận xét và giới thiệu nội dung thực hành của Tiết 3.",
                      hs: "HS lắng nghe, mở SGK và ghi bài vào vở."
                    }
                  ]
                },
                {
                  title: "Hoạt động 2: Luyện tập - Thực hành phân loại và xử lý thông tin (15 phút)",
                  goal: "HS thực hành phân loại thông tin và vận dụng đưa ra quyết định phù hợp trong các bài tập tình huống SGK.",
                  rows: [
                    {
                      gv: "+ Bước 1: GV giao các bài tập thực hành trong SGK hoặc phiếu bài tập nâng cao cho các nhóm.",
                      hs: "- Bước 1: HS đọc kỹ đề bài, quan sát tình huống và tiếp nhận nhiệm vụ."
                    },
                    {
                      gv: "+ Bước 2: GV hướng dẫn các nhóm thảo luận, phân tích các dạng thông tin và phương án quyết định.",
                      hs: "- Bước 2: Các nhóm thảo luận sôi nổi, ghi lại kết quả vào bảng nhóm hoặc phiếu học tập."
                    },
                    {
                      gv: "+ Bước 3: GV mời đại diện các nhóm báo cáo kết quả và tổ chức nhận xét chéo giữa các nhóm.",
                      hs: "- Bước 3: Đại diện nhóm trình bày tự tin, các nhóm khác theo dõi và đóng góp ý kiến."
                    },
                    {
                      gv: "+ Bước 4: GV chuẩn hóa kiến thức, tuyên dương các nhóm làm tốt và chốt lại kỹ năng cốt lõi.",
                      hs: "- Bước 4: HS chú ý lắng nghe, ghi chép và hoàn thiện bài làm."
                    }
                  ]
                },
                {
                  title: "Hoạt động 3: Vận dụng thực tế và trải nghiệm sáng tạo (10 phút)",
                  goal: "Học sinh vận dụng các dạng thông tin để giải quyết vấn đề thực tế trong học tập và sinh hoạt.",
                  rows: [
                    {
                      gv: "+ Bước 1: GV nêu tình huống thực tế: Thiết kế một biển báo hoặc thông báo đơn giản kết hợp cả dạng chữ và dạng hình ảnh cho lớp học.",
                      hs: "- Bước 1: HS suy nghĩ, trao đổi theo cặp về ý tưởng thiết kế biển báo."
                    },
                    {
                      gv: "+ Bước 2: GV hỗ trợ, gợi ý học sinh cách kết hợp thông tin rõ ràng, dễ hiểu.",
                      hs: "- Bước 2: HS thực hiện phác thảo ý tưởng vào giấy nháp hoặc bảng con."
                    },
                    {
                      gv: "+ Bước 3 (Tích hợp AI): GV giới thiệu thêm ứng dụng AI tạo hình ảnh và nhận diện giọng nói hỗ trợ con người trong đời sống số.",
                      hs: "- Bước 3: HS chăm chú theo dõi và hào hứng khám phá công nghệ mới."
                    }
                  ]
                },
                {
                  title: "Hoạt động 4: Củng cố và đánh giá kết quả (5 phút)",
                  goal: "Hệ thống hóa toàn bộ kiến thức của bài học qua các tiết và dặn dò chuẩn bị bài mới.",
                  rows: [
                    {
                      gv: "GV tóm tắt nội dung cốt lõi của bài học qua sơ đồ tư duy, nhận xét tinh thần học tập của cả lớp.",
                      hs: "HS quan sát sơ đồ, khắc sâu kiến thức toàn bài."
                    },
                    {
                      gv: "GV dặn dò học sinh hoàn thiện bài tập và chuẩn bị bài cho tiết học tiếp theo.",
                      hs: "HS ghi nhớ dặn dò của GV."
                    }
                  ]
                }
              ] : [
                {
                  title: "Hoạt động 1: Khởi động (5 phút)",
                  goal: `Tạo hứng thú học tập và kết nối kiến thức tiết ${pNum - 1} vào bài học mới Tiết ${pNum} qua trò chơi.`,
                  rows: [
                    {
                      gv: `GV tổ chức trò chơi nhanh hoặc đặt câu hỏi kết nối kiến thức đã học ở Tiết ${pNum - 1} vào Tiết ${pNum}.`,
                      hs: "HS hào hứng tham gia trò chơi, trả lời câu hỏi và tiếp nhận nhiệm vụ mới."
                    },
                    {
                      gv: `GV nhận xét và dẫn dắt vào bài học mới Tiết ${pNum}.`,
                      hs: `HS lắng nghe, mở SGK Tiết ${pNum} và ghi tên bài vào vở.`
                    }
                  ]
                },
                {
                  title: `Hoạt động 2: ${pNum >= 3 ? 'Luyện tập - Thực hành chuyên sâu' : 'Khám phá - ' + cleanLessonTitle} (15 phút)`,
                  goal: `Học sinh ${pNum >= 3 ? 'thực hành và vận dụng' : 'khám phá, hình thành'} kiến thức trọng tâm của Tiết ${pNum} môn ${cleanSubjectDisplay}.`,
                  rows: [
                    {
                      gv: `+ Bước 1: GV yêu cầu HS quan sát nội dung, tranh ảnh và tình huống trong SGK của Tiết ${pNum}.`,
                      hs: "- Bước 1: HS mở SGK, đọc thông tin và quan sát tranh ảnh theo hướng dẫn của GV."
                    },
                    {
                      gv: `+ Bước 2: Sử dụng phương pháp vấn đáp: GV đặt các câu hỏi gợi mở để làm rõ kiến thức trọng tâm của Tiết ${pNum}.`,
                      hs: "- Bước 2: HS suy nghĩ, trao đổi và xung phong trả lời câu hỏi của GV."
                    },
                    {
                      gv: '+ Bước 3: GV giao nhiệm vụ thảo luận cặp đôi/nhóm để giải quyết tình huống hoặc điền phiếu học tập.',
                      hs: "- Bước 3: HS thảo luận nhóm tích cực, chia sẻ ý kiến và hoàn thành nhiệm vụ được giao."
                    },
                    {
                      gv: `+ Bước 4: GV chốt kiến thức bằng sơ đồ hoặc bảng tóm tắt nội dung trọng tâm của Tiết ${pNum}.`,
                      hs: "- Bước 4: HS quan sát sơ đồ, khắc sâu quy trình và kiến thức cốt lõi."
                    }
                  ]
                },
                {
                  title: `Hoạt động 3: ${pNum >= 3 ? 'Vận dụng thực tế' : 'Luyện tập'} (10 phút)`,
                  goal: `Củng cố kiến thức và rèn luyện kỹ năng thực hành bài tập Tiết ${pNum}.`,
                  rows: [
                    {
                      gv: `+ Bước 1: GV giao bài tập trong SGK hoặc phiếu bài tập rèn luyện kỹ năng cho HS trong Tiết ${pNum}.`,
                      hs: "- Bước 1: HS nhận nhiệm vụ, mở SGK làm bài tập cá nhân vào vở."
                    },
                    {
                      gv: "+ Bước 2: GV gọi đại diện học sinh báo cáo kết quả bài tập.",
                      hs: "- Bước 2: Đại diện HS tự tin trình bày kết quả, đối chiếu bài làm cùng bạn."
                    },
                    {
                      gv: "+ Bước 3: GV nhận xét, chuẩn hóa kiến thức và chốt đáp án đúng.",
                      hs: "- Bước 3: HS chú ý lắng nghe, tự sửa bài vào vở."
                    },
                    {
                      gv: "+ Bước 4 (Tích hợp AI): GV mở rộng liên hệ thực tiễn hoặc ứng dụng công nghệ số phù hợp với nội dung bài học.",
                      hs: "- Bước 4: HS chú ý theo dõi, mở rộng hiểu biết về ứng dụng công nghệ số."
                    }
                  ]
                },
                {
                  title: `Hoạt động 4: ${pNum >= 3 ? 'Củng cố và đánh giá' : 'Vận dụng'} (5 phút)`,
                  goal: `Vận dụng kiến thức Tiết ${pNum} vào giải quyết tình huống thực tế và liên hệ đời sống.`,
                  rows: [
                    {
                      gv: "GV giao nhiệm vụ thực tế và hướng dẫn học sinh liên hệ vận dụng kiến thức vào cuộc sống.",
                      hs: "HS suy nghĩ và chia sẻ ý kiến vận dụng của bản thân."
                    },
                    {
                      gv: "GV nhận xét tiết học, dặn dò học sinh chuẩn bị bài học tiếp theo.",
                      hs: "HS chú ý lắng nghe, ghi nhớ dặn dò của GV."
                    }
                  ]
                }
              ];

              periodActivities.forEach(act => {
                let pActTitle = act.title;
                if (isGDPT2018Plan) {
                  pActTitle = pActTitle.replace(/^(?!\d+[\.\:]\s*)(?:Hoạt\s*động|HOẠT\s*ĐỘNG)\s*(\d+)/i, '$1. Hoạt động $1');
                  pActTitle = pActTitle.replace(/^(\d+\.\s*Hoạt\s*động\s*\d+)\s*[\:\-]?\s*/i, '$1: ');
                }
                planHtml += `<tr>`;
                planHtml += `<td colspan="2" style="border: 1px solid black; padding: 5px 8px; background-color: ${isGDPT2018Plan ? '#ffffff' : '#F2F2F2'}; font-weight: bold; font-size: ${isGDPT2018Plan ? '13pt' : '12.5pt'}; text-align: left; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}">`;
                planHtml += `<strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${pActTitle}</strong>`;
                planHtml += `</td>`;
                planHtml += `</tr>`;

                planHtml += `<tr style="page-break-inside: avoid;">`;
                planHtml += `<td colspan="2" style="border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #FAFAFA; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
                planHtml += `<strong>- Mục tiêu:</strong> ${act.goal.replace(/^\+\s*/, '')}`;
                planHtml += `</td>`;
                planHtml += `</tr>`;

                planHtml += `<tr style="page-break-inside: avoid;">`;
                planHtml += `<td colspan="2" style="border: 1px solid black; border-bottom: 1px solid black; mso-border-alt: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #FDFDFD; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
                planHtml += `<strong>- Cách tiến hành:</strong>`;
                planHtml += `</td>`;
                planHtml += `</tr>`;

                interface SubSectionItem {
                  subTitle?: string;
                  gvLines: string[];
                  hsLines: string[];
                }
                const pSubs: SubSectionItem[] = [];
                let curSub: SubSectionItem = { gvLines: [], hsLines: [] };

                act.rows.forEach(r => {
                  const rowAny = r as any;
                  if (rowAny.isSubSection && rowAny.subTitle) {
                    if (curSub.gvLines.length > 0 || curSub.hsLines.length > 0 || curSub.subTitle) {
                      pSubs.push(curSub);
                    }
                    curSub = { subTitle: rowAny.subTitle, gvLines: [], hsLines: [] };
                  } else {
                    if (r.gv) curSub.gvLines.push(r.gv);
                    if (r.hs) curSub.hsLines.push(r.hs);
                  }
                });
                if (curSub.gvLines.length > 0 || curSub.hsLines.length > 0 || curSub.subTitle) {
                  pSubs.push(curSub);
                }

                interface PrepSubItem {
                  subTitle?: string;
                  pairs: SymmetricPair[];
                }
                const prepSubs: PrepSubItem[] = [];
                let totalActPairs = 0;
                pSubs.forEach(sub => {
                  const pairs = buildSymmetricPairs(sub.gvLines, sub.hsLines, act.title, isGDPT2018Plan, isBasicPlan);
                  totalActPairs += pairs.length;
                  prepSubs.push({
                    subTitle: sub.subTitle,
                    pairs
                  });
                });

                let curActPairIdx = 0;
                prepSubs.forEach(sub => {
                  if (sub.subTitle) {
                    const subTopBorder = isGDPT2018Plan ? 'none' : '1px solid black';
                    const subBottomBorder = isGDPT2018Plan ? 'none' : '1px solid black';
                    const subMsoTop = isGDPT2018Plan ? 'none' : 'solid windowtext 1.0pt';
                    const subMsoBottom = isGDPT2018Plan ? 'none' : 'solid windowtext 1.0pt';
                    planHtml += `<tr style="page-break-inside: avoid;">`;
                    planHtml += `<td colspan="2" style="border-top: ${subTopBorder}; border-bottom: ${subBottomBorder}; border-left: 1px solid black; border-right: 1px solid black; mso-border-top-alt: ${subMsoTop}; mso-border-bottom-alt: ${subMsoBottom}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; background-color: #F8F8F8; font-weight: bold; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: left; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">`;
                    planHtml += `<strong>${sub.subTitle}</strong>`;
                    planHtml += `</td>`;
                    planHtml += `</tr>`;
                  }

                  sub.pairs.forEach(pair => {
                    curActPairIdx++;
                    const isLast = (curActPairIdx === totalActPairs);
                    const bottomBorder = isLast ? '1px solid black' : 'none';
                    const topBorder = 'none';
                    const msoBottomBorder = isLast ? 'solid windowtext 1.0pt' : 'none';
                    const leftBorderHs = '1px solid black';

                    planHtml += `<tr valign="top" style="vertical-align: top; page-break-inside: avoid;">`;
                    planHtml += `<td valign="top" style="border-top: ${topBorder}; border-bottom: ${bottomBorder}; border-left: 1px solid black; border-right: 1px solid black; mso-border-top-alt: none; mso-border-bottom-alt: ${msoBottomBorder}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; vertical-align: top; width: 55%; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">${pair.gv}</td>`;
                    planHtml += `<td valign="top" style="border-top: ${topBorder}; border-bottom: ${bottomBorder}; border-left: ${leftBorderHs}; border-right: 1px solid black; mso-border-top-alt: none; mso-border-bottom-alt: ${msoBottomBorder}; mso-border-left-alt: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext 1.0pt; padding: 5px 8px; font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; text-align: justify; vertical-align: top; width: 45%; line-height: 1.25; font-family: 'Times New Roman', Times, serif; mso-line-height-rule: exactly; margin: 0pt; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt;">${pair.hs}</td>`;
                    planHtml += `</tr>`;
                  });
                });
              });

              planHtml += closeTable();
              planHtml += renderSectionIVBlock("IV. ĐIỀU CHỈNH SAU BÀI DẠY");
              planHtml += `</div><!-- END TIET ${pNum} -->`;
            }
          });
        }
      } else {
        planHtml += formatMarkdownBlock(textSecIII);
      }
    }

    if (textSecIV && !planHtml.includes("IV. ĐIỀU CHỈNH SAU BÀI DẠY")) {
      let customSecIV = textSecIV;
      customSecIV = customSecIV.replace(layoutCustomAdjustmentName, `<strong>${layoutCustomAdjustmentName}</strong>`);
      if (layoutCustomAdjustmentName !== "IV. ĐIỀU CHỈNH SAU BÀI DẠY") {
        customSecIV = customSecIV.replace("IV. ĐIỀU CHỈNH SAU BÀI DẠY", "<strong>IV. ĐIỀU CHỈNH SAU BÀI DẠY</strong>");
      }
      planHtml += formatMarkdownBlock(customSecIV, "-");
    }

    // Signatures removed as requested by the user
    
    // Post-processing string replacements for bolding, spacing, and specific replacements:
    let finalHtml = planHtml;

    // Clean up empty lines or double elements to ensure no empty rows/paragraphs
    finalHtml = finalHtml.replace(/<p[^>]*>\s*(?:&nbsp;|<br\/?>)?\s*<\/p>/gi, "");
    finalHtml = finalHtml.replace(/<tr>\s*<td[^>]*>\s*(?:&nbsp;|<br\/?>)?\s*<\/td>\s*<\/tr>/gi, "");

    // Clean up empty or noise table rows that only contain numbers, punctuation, or whitespace (e.g. "1.", "2.", "1.; 2.;")
    finalHtml = finalHtml.replace(/<tr>\s*<td[^>]*>\s*(?:&nbsp;|<br\/?>|[\d\s\.\;\:\-\*]+)?\s*<\/td>(?:\s*<td[^>]*>\s*(?:&nbsp;|<br\/?>|[\d\s\.\;\:\-\*]+)?\s*<\/td>)?\s*<\/tr>/gi, "");
    finalHtml = finalHtml.replace(/<tr>\s*<td[^>]*>\s*<strong>\s*[\d\s\.\;\:\-\*]+\s*<\/strong>\s*<\/td>\s*<\/tr>/gi, "");

    // Clean up residual/redundant pseudo-activity rows between steps (e.g. "Hoạt động 1 (trang 5 SGK)...", "- Mục tiêu:...", "- Cách tiến hành:")
    finalHtml = finalHtml.replace(/<tr>\s*<td colspan="2"[^>]*><strong>\s*(?:Hoạt động|HOẠT ĐỘNG)\s*\d+[^<]*(?:trang|SGK|sách giáo khoa|tình huống)[^<]*<\/strong>\s*<\/td>\s*<\/tr>\s*<tr>\s*<td colspan="2"[^>]*><strong>- Mục tiêu:<\/strong>[^<]*<\/td>\s*<\/tr>\s*<tr>\s*<td colspan="2"[^>]*><strong>- Cách tiến hành:<\/strong>\s*<\/td>\s*<\/tr>/gi, "");
    finalHtml = finalHtml.replace(/<tr>\s*<td colspan="2"[^>]*><strong>- Mục tiêu:<\/strong>\s*Học sinh biết áp dụng kiến thức cốt lõi vào thực tế bài học\.?\s*<\/td>\s*<\/tr>\s*<tr>\s*<td colspan="2"[^>]*><strong>- Cách tiến hành:<\/strong>\s*<\/td>\s*<\/tr>/gi, "");
    finalHtml = finalHtml.replace(/<tr>\s*<td colspan="2"[^>]*><strong>\s*(?:Hoạt động|HOẠT ĐỘNG)\s*\d+[^<]*(?:trang|SGK|sách giáo khoa|tình huống)[^<]*<\/strong>\s*<\/td>\s*<\/tr>/gi, "");

    // Ensure all paragraphs and cells inside tables have 0pt spacing before/after:
    finalHtml = finalHtml.replace(/<table[\s\S]*?<\/table>/gi, (tableMatch) => {
      return tableMatch.replace(/<p\b([^>]*)>/gi, (pMatch, attrs) => {
        if (attrs.includes('style="')) {
          return pMatch.replace(/style="([^"]*)"/i, 'style="$1; margin: 0pt !important; margin-top: 0pt !important; margin-bottom: 0pt !important; mso-para-margin: 0pt !important; mso-para-margin-top: 0pt !important; mso-para-margin-bottom: 0pt !important;"');
        } else {
          return `<p style="margin: 0pt !important; margin-top: 0pt !important; margin-bottom: 0pt !important; mso-para-margin: 0pt !important; mso-para-margin-top: 0pt !important; mso-para-margin-bottom: 0pt !important;" ${attrs}>`;
        }
      });
    });

    // Apply exact line-height spacing
    const lhValue = isWordExport ? "1.25" : "1.5";
    finalHtml = `<style>
      table.lesson-plan-table, table.lesson-plan-table tr, table.lesson-plan-table td, table.lesson-plan-table th {
        border-collapse: collapse;
        mso-para-margin: 0pt !important;
        mso-para-margin-top: 0pt !important;
        mso-para-margin-bottom: 0pt !important;
      }
      table.lesson-plan-table td, table.lesson-plan-table th, table.lesson-plan-table p, table.lesson-plan-table div {
        margin: 0pt !important;
        margin-top: 0pt !important;
        margin-bottom: 0pt !important;
        mso-para-margin: 0pt !important;
        mso-para-margin-top: 0pt !important;
        mso-para-margin-bottom: 0pt !important;
      }
    </style><div style="line-height: ${lhValue}; mso-line-height-rule: exactly; font-family: 'Times New Roman', Times, serif;">${finalHtml}</div>`;

    // 1. Double check the level II header colon:
    if (!isGDPT2018Plan) {
      finalHtml = finalHtml.replace(/II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:?/gi, "II. ĐỒ DÙNG DẠY HỌC:");
      finalHtml = finalHtml.replace(/II\.\s*THIẾT\s*BỊ\s*DẠY\s*HỌC\s*VÀ\s*HỌC\s*LIỆU:?/gi, "II. ĐỒ DÙNG DẠY HỌC:");
      finalHtml = finalHtml.replace(/II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC::/g, "II. ĐỒ DÙNG DẠY HỌC:");
      finalHtml = finalHtml.replace(/<strong>\s*(II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:)\s*<\/strong>/gi, "$1");
      finalHtml = finalHtml.replace(/(II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:)/gi, "<strong>$1</strong>");
    } else {
      finalHtml = finalHtml.replace(/II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:?/gi, "II. ĐỒ DÙNG DẠY HỌC");
      finalHtml = finalHtml.replace(/II\.\s*THIẾT\s*BỊ\s*DẠY\s*HỌC\s*VÀ\s*HỌC\s*LIỆU:?/gi, "II. ĐỒ DÙNG DẠY HỌC");
      finalHtml = finalHtml.replace(/II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC::/g, "II. ĐỒ DÙNG DẠY HỌC");
      finalHtml = finalHtml.replace(/<strong>\s*(II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC)\s*<\/strong>/gi, "$1");
      finalHtml = finalHtml.replace(/(II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC)/gi, "<strong>$1</strong>");
    }

    // 2. Map Teacher & Student list items inside lists with leading hyphens and strong tags, as requested:
    // This targets only elements preceded by bullet symbols to avoid bolding/prefixing general paragraph text containing "Học sinh" or "Giáo viên".
    finalHtml = finalHtml.replace(/(?:&nbsp;&nbsp;-\s+|-\s+|•\s+|&bull;\s+)Giáo\s*viên\s*:/gi, "<strong>- Giáo viên:</strong>");
    finalHtml = finalHtml.replace(/(?:&nbsp;&nbsp;-\s+|-\s+|•\s+|&bull;\s+)Học\s*sinh\s*:/gi, "<strong>- Học sinh:</strong>");

    // 3. Keep specific terms always bolded
    const boldTermsDesc = [
      "Năng lực giao tiếp và hợp tác",
      "Năng lực giải quyết vấn đề",
      "Năng lực tự chủ và tự học",
      "Năng lực AI (theo QĐ 3439)",
      "Những điều cần rút kinh nghiệm",
      "Những điều đã thực hiện tốt",
      "Năng lực tin học",
      "Trách nhiệm",
      "Trung thực",
      "Chăm chỉ"
    ];

    boldTermsDesc.forEach(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Clean up previous wrappers if they somehow cause double nesting
      finalHtml = finalHtml.replace(new RegExp(`<strong>\\s*(${escaped})\\s*</strong>`, "gi"), "$1");
      finalHtml = finalHtml.replace(new RegExp(`<b>\\s*(${escaped})\\s*</b>`, "gi"), "$1");
      // Formally wrap in strong tag
      finalHtml = finalHtml.replace(new RegExp(escaped, "g"), `<strong>${kw}</strong>`);
    });

    // 4. Force specific elements to be normal/unbolded (even inside parent strong zones)
    const unboldTerms = [
      "Máy tính, máy chiếu, bài giảng điện tử",
      "Sách giáo khoa Tin học 3, vở ghi"
    ];

    unboldTerms.forEach(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Strip outer wrapping tags
      finalHtml = finalHtml.replace(new RegExp(`<strong>\\s*(${escaped})\\s*</strong>`, "gi"), "$1");
      finalHtml = finalHtml.replace(new RegExp(`<b>\\s*(${escaped})\\s*</b>`, "gi"), "$1");
      // Force unbolding inline
      finalHtml = finalHtml.replace(new RegExp(escaped, "g"), `<span style="font-weight: normal !important; font-style: normal;">${kw}</span>`);
    });

    // Clean up empty lines or double elements to ensure no empty rows/paragraphs
    finalHtml = finalHtml.replace(/<p[^>]*>\s*(?:&nbsp;|<br\/?>)?\s*<\/p>/gi, "");
    finalHtml = finalHtml.replace(/<tr>\s*<td[^>]*>\s*(?:&nbsp;|<br\/?>)?\s*<\/td>\s*<\/tr>/gi, "");

    // Clean up empty or noise table rows that only contain numbers, punctuation, or whitespace (e.g. "1.", "2.", "1.; 2.;")
    finalHtml = finalHtml.replace(/<tr>\s*<td[^>]*>\s*(?:&nbsp;|<br\/?>|[\d\s\.\;\:\-\*]+)?\s*<\/td>(?:\s*<td[^>]*>\s*(?:&nbsp;|<br\/?>|[\d\s\.\;\:\-\*]+)?\s*<\/td>)?\s*<\/tr>/gi, "");
    finalHtml = finalHtml.replace(/<tr>\s*<td[^>]*>\s*<strong>\s*[\d\s\.\;\:\-\*]+\s*<\/strong>\s*<\/td>\s*<\/tr>/gi, "");

    // Eliminate any redundant row containing stray questions, quotes, or "Em hãy cho biết..." (e.g. 2. "Em hãy cho biết...")
    finalHtml = finalHtml.replace(/<tr[^>]*>\s*<td[^>]*colspan="2"[^>]*>\s*(?:<strong[^>]*>)?\s*\d+[\.\:]\s*["“'‘]?[^<]*?(?:em hãy|hãy cho biết|cho biết|\?)[^<]*?(?:<\/strong>)?\s*<\/td>\s*<\/tr>/gi, "");
    finalHtml = finalHtml.replace(/<tr[^>]*>\s*<td[^>]*colspan="2"[^>]*>\s*(?:<strong[^>]*>)?\s*["“'‘][^<]*?(?:em hãy|hãy cho biết|cho biết|\?)[^<]*?(?:<\/strong>)?\s*<\/td>\s*<\/tr>/gi, "");

    // Deduplicate repeated "Bước 1" or any "Bước *" on the same line or in adjacent sentences in the same cell
    finalHtml = finalHtml.replace(/(<strong>\s*Bước\s*\d+[^<]*<\/strong>)\s*(?:[-–—:]\s*)?(?:<strong>)?\s*(?:Bước\s*\d+[^<:]*[:\.]?)\s*(?:<\/strong>)?/gi, '$1');
    finalHtml = finalHtml.replace(/([+–-]\s*<strong>Bước\s*\d+[^<]*<\/strong>\s*(?:GV|HS))\s*(?:Bước\s*\d+[^<:]*[:\.]?)\s*/gi, '$1 ');

    // Clean up any stray colons after GV and HS in GDPT 2018
    if (isGDPT2018Plan) {
      finalHtml = finalHtml.replace(/(?:<strong>)?\+\s*GV\s*:\s*(?:<\/strong>)?/gi, "- GV ");
      finalHtml = finalHtml.replace(/(?:<strong>)?-\s*GV\s*:\s*(?:<\/strong>)?/gi, "- GV ");
      finalHtml = finalHtml.replace(/(?:<strong>)?-\s*HS\s*:\s*(?:<\/strong>)?/gi, "- HS ");
      finalHtml = finalHtml.replace(/(?:<strong>)?\+\s*HS\s*:\s*(?:<\/strong>)?/gi, "- HS ");
      finalHtml = finalHtml.replace(/([+–-]\s*Bước\s*\d+[^:]*:\s*GV)\s*:\s*/gi, "$1 ");
      finalHtml = finalHtml.replace(/([+–-]\s*Bước\s*\d+[^:]*:\s*HS)\s*:\s*/gi, "$1 ");
    }

    // Normalize AI Competency label strictly:
    finalHtml = finalHtml.replace(/Năng lực Trí tuệ nhân tạo \(AI\)\s*(?:\(theo QĐ 3439(?:\/QĐ-BGDĐT)?\))?:?/gi, "Năng lực AI (theo QĐ 3439):");
    finalHtml = finalHtml.replace(/Năng lực AI \(theo QĐ 3439\/QĐ-BGDĐT\):?/gi, "Năng lực AI (theo QĐ 3439):");
    finalHtml = finalHtml.replace(/Năng lực AI \(theo QĐ 3439\):::?/gi, "Năng lực AI (theo QĐ 3439):");

    // Ensure all "Bước *" text has bold formatting
    finalHtml = finalHtml.replace(/(?<!<strong>)\b(Bước\s*\d+(?:\s*\([^)]+\))?)(?!<\/strong>)([:\.\-])?/gi, (_match, step, colon) => {
      const c = colon || ':';
      return `<strong>${step}${c}</strong>`;
    });
    finalHtml = finalHtml.replace(/<strong>\s*<strong>(Bước\s*\d+[^<]*)<\/strong>\s*<\/strong>/gi, "<strong>$1</strong>");
    finalHtml = finalHtml.replace(/<strong>(Bước\s*\d+[^<]*):<\/strong>:/gi, "<strong>$1:</strong>");

    // Ensure "IV. ĐIỀU CHỈNH SAU BÀI DẠY" never has (TIẾT *) or (TIẾT 1) or (TIẾT 2) anywhere
    finalHtml = finalHtml.replace(/IV\.\s*ĐIỀU\s*CHỈNH\s*SAU\s*BÀI\s*DẠY\s*\([^)]*\)/gi, "IV. ĐIỀU CHỈNH SAU BÀI DẠY");
    finalHtml = finalHtml.replace(/IV\.\s*ĐIỀU\s*CHỈNH\s*SAU\s*BÀI\s*DẠY\s*\(TIẾT\s*[^)]*\)/gi, "IV. ĐIỀU CHỈNH SAU BÀI DẠY");

    // Normalize space between lesson title and period (e.g. "QUYẾT ĐỊNH(TIẾT 1)" -> "QUYẾT ĐỊNH (TIẾT 1)")
    finalHtml = fixLessonTitlePeriodSpacing(finalHtml);

    // 1. Văn bản "Môn học: Tin học - Lớp *" thay đổi thành "Tin học - Lớp *". Định dạng chữ In hoa
    finalHtml = finalHtml.replace(/<p([^>]*)>\s*(?:Môn\s*học\s*:\s*)?([^\n\r<]+?\s*-\s*Lớp\s*[^<]+)<\/p>/gi, (match, attrs, content) => {
      return `<p${attrs} style="font-size: 12.5pt; font-weight: bold; text-align: center; margin: 5px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly;">${content.toUpperCase()}</p>`;
    });
    // "Bài dạy: Bài 1. Thông tin và quyết định - Số tiết: 2 Tiết" -> "Bài 1. Thông tin và quyết định (Tiết 1)"
    finalHtml = finalHtml.replace(/Bài\s*dạy\s*:\s*([^<]+?)\s*-\s*Số\s*tiết\s*:\s*\d+\s*(?:Tiết|tiết)/gi, "$1 (Tiết 1)");
    finalHtml = finalHtml.replace(/Bài\s*dạy\s*:\s*([^<]+?)\s*-\s*Số\s*tiết\s*:\s*\d+/gi, "$1 (Tiết 1)");
    // 3. Văn bản "Bài 2: Xử lý thông tin (Tiết 1)" đổi thành định dạng in hoa có khoảng cách chuẩn:
    finalHtml = finalHtml.replace(/(Bài\s*\d+[\.:\s]+[^<\n\r]+?)\s*\((?:Tiết|tiết|TIẾT)\s*(\d+)\)/gi, (_m, titlePart, tietNum) => {
      const cleanTitle = titlePart.trim().toUpperCase();
      return `${cleanTitle} (TIẾT ${tietNum})`;
    });

    if (isGDPT2018Plan) {
      // 1. "KẾ HOẠCH BÀI DẠY" -> color: #c00000 (Red)
      finalHtml = finalHtml.replace(/(<h[1-4][^>]*>|<p[^>]*>)(?:<strong[^>]*>)?\s*(KẾ\s*HOẠCH\s*BÀI\s*DẠY)\s*(?:<\/strong>)?(<\/[hp][1-4]?>)/gi, (_m, _openTag, text) => {
        return `<h2 style="font-size: 14pt; font-weight: bold; text-align: center; margin: 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; color: #c00000;"><strong style="color: #c00000;">${text}</strong></h2>`;
      });

      // 2. Dòng Chủ đề "CHỦ ĐỀ 1. MÁY TÍNH VÀ EM" -> color: #0070c0 (Blue)
      finalHtml = finalHtml.replace(/<p([^>]*)>\s*(?:<strong[^>]*>)?\s*(CHỦ\s*ĐỀ\s*[^<]+?)\s*(?:<\/strong>)?<\/p>/gi, (_m, attrs, topicText) => {
        return `<p${attrs} style="font-size: 14pt; font-weight: bold; text-align: center; margin: 3px 0 0 0; text-transform: uppercase; line-height: 1.25; mso-line-height-rule: exactly; color: #0070c0;"><strong style="color: #0070c0;">${topicText}</strong></p>`;
      });

      // 3. Tên Bài học & Tiết dạy "BÀI 2: XỬ LÝ THÔNG TIN (TIẾT 1)" -> color: #c00000 (Red)
      finalHtml = finalHtml.replace(/<p([^>]*)>\s*(?:<strong[^>]*>)?\s*(BÀI\s*\d+[\.:\s]+[^<]+?)\s*\((?:TIẾT|tiết)\s*(\d+)\)\s*(?:<\/strong>)?<\/p>/gi, (_m, attrs, titlePart, tietNum) => {
        const cleanTitle = titlePart.trim().toUpperCase().replace(/\s*\((?:TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*\d*\)\s*$/i, '').trim();
        let updatedAttrs = attrs;
        if (updatedAttrs.includes('color:')) {
          updatedAttrs = updatedAttrs.replace(/color:\s*[^;]+;/i, 'color: #c00000;');
        } else if (updatedAttrs.includes('style="')) {
          updatedAttrs = updatedAttrs.replace('style="', 'style="color: #c00000; ');
        } else {
          updatedAttrs += ' style="color: #c00000;"';
        }
        return `<p${updatedAttrs}><strong style="color: #c00000;">${cleanTitle} (TIẾT ${tietNum})</strong></p>`;
      });

      // Special Rule: Replace any inline "I. YÊU CẦU CẦN ĐẠT ### 1. Năng lực đặc thù" with two separate lines/blocks
      finalHtml = finalHtml.replace(/(?:<p[^>]*>)?\s*(?:<strong[^>]*>)?\s*I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:<\/strong>)?\s*(?:###|##|#|\s)+\s*(?:<strong[^>]*>)?\s*1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?\s*(?:<\/strong>)?\s*(?:<\/p>)?/gi, 
        `<p style="font-size: 14pt; font-weight: bold; margin-top: 15px; margin-bottom: 6px; line-height: 1.25; mso-line-height-rule: exactly; color: #c00000;"><strong style="color: #c00000;">I. YÊU CẦU CẦN ĐẠT:</strong></p>\n<p style="font-size: 14pt; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; color: #0070c0;"><strong style="color: #0070c0;">1. Năng lực đặc thù</strong></p>`);

      // Clean up any remaining "###" or trailing hashes after "I. YÊU CẦU CẦN ĐẠT"
      finalHtml = finalHtml.replace(/(I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT:?)\s*(?:###|##|#)+/gi, '$1');

      // 4. "I. YÊU CẦU CẦN ĐẠT:" -> color: #c00000 (Red)
      // Fix any double colons "::" or multiple colons so it strictly remains "I. YÊU CẦU CẦN ĐẠT:"
      finalHtml = finalHtml.replace(/(?:<strong[^>]*>)?\s*I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:<\/strong>)?[:\s]*/gi, `<strong style="color: #c00000;">I. YÊU CẦU CẦN ĐẠT:</strong> `);
      finalHtml = finalHtml.replace(/(<strong style="color: #c00000;">I\. YÊU CẦU CẦN ĐẠT:<\/strong>)\s*:+/gi, '$1');
      finalHtml = finalHtml.replace(/I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT\s*::+/gi, 'I. YÊU CẦU CẦN ĐẠT:');

      // 5, 6, 7. "1. Năng lực đặc thù", "2. Năng lực chung", "3. Phẩm chất" -> color: #0070c0 (Blue) (NO colon)
      finalHtml = finalHtml.replace(/(?:<strong[^>]*>)?\s*1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?\s*(?:<\/strong>)?/gi, `<strong style="color: #0070c0;">1. Năng lực đặc thù</strong>`);
      finalHtml = finalHtml.replace(/(?:<strong[^>]*>)?\s*2\.\s*Năng\s*lực\s*chung:?\s*(?:<\/strong>)?/gi, `<strong style="color: #0070c0;">2. Năng lực chung</strong>`);
      finalHtml = finalHtml.replace(/(?:<strong[^>]*>)?\s*3\.\s*Phẩm\s*chất:?\s*(?:<\/strong>)?/gi, `<strong style="color: #0070c0;">3. Phẩm chất</strong>`);

      // Ensure if "I. YÊU CẦU CẦN ĐẠT:" and "1. Năng lực đặc thù" are in the same block/line, split them
      finalHtml = finalHtml.replace(/(<strong style="color: #c00000;">I\. YÊU CẦU CẦN ĐẠT:<\/strong>)\s*(?:<\/p>\s*<p[^>]*>)?\s*(<strong style="color: #0070c0;">1\.\s*Năng\s*lực\s*đặc\s*thù:?<\/strong>)/gi,
        `$1</p>\n<p style="font-size: 14pt; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; color: #0070c0;"><strong style="color: #0070c0;">1. Năng lực đặc thù</strong></p>`);

      // Ensure <p> tags enclosing "I. YÊU CẦU CẦN ĐẠT:" have color: #c00000
      finalHtml = finalHtml.replace(/<p([^>]*)>\s*(<strong style="color: #c00000;">I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT:<\/strong>)/gi, (_m, attrs, content) => {
        let updatedAttrs = attrs;
        if (updatedAttrs.includes('color:')) {
          updatedAttrs = updatedAttrs.replace(/color:\s*[^;]+;/i, 'color: #c00000;');
        } else if (updatedAttrs.includes('style="')) {
          updatedAttrs = updatedAttrs.replace('style="', 'style="color: #c00000; ');
        } else {
          updatedAttrs += ' style="color: #c00000;"';
        }
        return `<p${updatedAttrs}>${content}`;
      });

      // Ensure <p> tags enclosing "1. Năng lực đặc thù" have color: #0070c0
      finalHtml = finalHtml.replace(/<p([^>]*)>\s*(<strong style="color: #0070c0;">1\.\s*Năng\s*lực\s*đặc\s*thù:?<\/strong>)/gi, (_m, attrs, _content) => {
        let updatedAttrs = attrs;
        if (updatedAttrs.includes('color:')) {
          updatedAttrs = updatedAttrs.replace(/color:\s*[^;]+;/i, 'color: #0070c0;');
        } else if (updatedAttrs.includes('style="')) {
          updatedAttrs = updatedAttrs.replace('style="', 'style="color: #0070c0; ');
        } else {
          updatedAttrs += ' style="color: #0070c0;"';
        }
        return `<p${updatedAttrs}><strong style="color: #0070c0;">1. Năng lực đặc thù</strong>`;
      });

      // Ensure <p> tags enclosing "2. Năng lực chung" have color: #0070c0
      finalHtml = finalHtml.replace(/<p([^>]*)>\s*(<strong style="color: #0070c0;">2\.\s*Năng\s*lực\s*chung:?<\/strong>)/gi, (_m, attrs, _content) => {
        let updatedAttrs = attrs;
        if (updatedAttrs.includes('color:')) {
          updatedAttrs = updatedAttrs.replace(/color:\s*[^;]+;/i, 'color: #0070c0;');
        } else if (updatedAttrs.includes('style="')) {
          updatedAttrs = updatedAttrs.replace('style="', 'style="color: #0070c0; ');
        } else {
          updatedAttrs += ' style="color: #0070c0;"';
        }
        return `<p${updatedAttrs}><strong style="color: #0070c0;">2. Năng lực chung</strong>`;
      });

      // Ensure <p> tags enclosing "3. Phẩm chất" have color: #0070c0
      finalHtml = finalHtml.replace(/<p([^>]*)>\s*(<strong style="color: #0070c0;">3\.\s*Phẩm\s*chất:?<\/strong>)/gi, (_m, attrs, _content) => {
        let updatedAttrs = attrs;
        if (updatedAttrs.includes('color:')) {
          updatedAttrs = updatedAttrs.replace(/color:\s*[^;]+;/i, 'color: #0070c0;');
        } else if (updatedAttrs.includes('style="')) {
          updatedAttrs = updatedAttrs.replace('style="', 'style="color: #0070c0; ');
        } else {
          updatedAttrs += ' style="color: #0070c0;"';
        }
        return `<p${updatedAttrs}><strong style="color: #0070c0;">3. Phẩm chất</strong>`;
      });

      // 8. "II. ĐỒ DÙNG DẠY HỌC" -> color: #c00000 (Red) (NO colon)
      finalHtml = finalHtml.replace(/(?:<strong[^>]*>)?\s*II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:?\s*(?:<\/strong>)?/gi, `<strong style="color: #c00000;">II. ĐỒ DÙNG DẠY HỌC</strong>`);

      // 9. "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" -> color: #c00000 (Red) (NO colon)
      finalHtml = finalHtml.replace(/(?:<strong[^>]*>)?\s*III\.\s*CÁC\s*HOẠT\s*ĐỘNG\s*DẠY\s*HỌC\s*CHỦ\s*YẾU:?\s*(?:<\/strong>)?/gi, `<strong style="color: #c00000;">III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU</strong>`);

      // 10. TIẾT [SỐ]: [TÊN NỘI DUNG] "TIẾT 1: CON NGƯỜI XỬ LÝ THÔNG TIN" -> color: #c00000 (Red)
      finalHtml = finalHtml.replace(/<p([^>]*)>\s*(?:<strong[^>]*>)?\s*(TIẾT\s*\d+\s*:\s*[^<]+?)\s*(?:<\/strong>)?<\/p>/gi, (_m, attrs, tietText) => {
        return `<p${attrs} style="font-size: 14pt; font-weight: bold; text-align: center; margin-top: 15px; margin-bottom: 12px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif; width: 100%; line-height: 1.25; color: #c00000;"><strong style="color: #c00000;">${tietText.toUpperCase()}</strong></p>`;
      });

      // 11, 12, 13, 14. "1. Hoạt động 1: *", "2. Hoạt động 2: *", "3. Hoạt động 3: *", "4. Hoạt động 4: *" -> color: #0070c0 (chữ màu xanh dương), nền trắng (#ffffff)
      finalHtml = finalHtml.replace(/(<td[^>]*colspan="2"[^>]*>)\s*(?:<strong[^>]*>)?\s*(?:(\d+)\.\s*)?(?:Hoạt\s*động|HOẠT\s*ĐỘNG)\s*(\d+)([\:\-\s][^<]*?)(?:<\/strong>)?\s*(<\/td>)/gi, (_m, openTd, pNum, actNum, rest, closeTd) => {
        const num = pNum || actNum;
        let cleanRest = rest.trim();
        if (cleanRest.startsWith(':') || cleanRest.startsWith('-')) {
          cleanRest = cleanRest.substring(1).trim();
        }
        let updatedTd = openTd;
        if (updatedTd.includes('color:')) {
          updatedTd = updatedTd.replace(/color:\s*[^;]+;/i, 'color: #0070c0;');
        } else {
          updatedTd = updatedTd.replace('style="', 'style="color: #0070c0; ');
        }
        if (updatedTd.includes('background-color:')) {
          updatedTd = updatedTd.replace(/background-color:\s*[^;]+;/i, 'background-color: #ffffff;');
        } else {
          updatedTd = updatedTd.replace('style="', 'style="background-color: #ffffff; ');
        }
        return `${updatedTd}<strong style="color: #0070c0;">${num}. Hoạt động ${actNum}: ${cleanRest}</strong>${closeTd}`;
      });

      // Also support standalone paragraph activity headers
      finalHtml = finalHtml.replace(/(<p[^>]*>)\s*(?:<strong[^>]*>)?\s*(?:(\d+)\.\s*)?(?:Hoạt\s*động|HOẠT\s*ĐỘNG)\s*(\d+)([\:\-\s][^<]*?)(?:<\/strong>)?\s*(<\/p>)/gi, (_m, openP, pNum, actNum, rest, closeP) => {
        const num = pNum || actNum;
        let cleanRest = rest.trim();
        if (cleanRest.startsWith(':') || cleanRest.startsWith('-')) {
          cleanRest = cleanRest.substring(1).trim();
        }
        let updatedP = openP;
        if (updatedP.includes('color:')) {
          updatedP = updatedP.replace(/color:\s*[^;]+;/i, 'color: #0070c0;');
        } else {
          updatedP = updatedP.replace('style="', 'style="color: #0070c0; ');
        }
        return `${updatedP}<strong style="color: #0070c0;">${num}. Hoạt động ${actNum}: ${cleanRest}</strong>${closeP}`;
      });

      // 15. "IV. ĐIỀU CHỈNH SAU BÀI DẠY" -> color: #c00000 (Red)
      finalHtml = finalHtml.replace(/(?:<strong[^>]*>)?\s*IV\.\s*ĐIỀU\s*CHỈNH\s*SAU\s*BÀI\s*DẠY:?\s*(?:<\/strong>)?/gi, `<strong style="color: #c00000;">IV. ĐIỀU CHỈNH SAU BÀI DẠY</strong>`);

      // Toàn bộ văn bản khi xuất ra có font Times New Roman; font size: 14pt
      finalHtml = finalHtml.replace(/font-size:\s*[\d\.]+pt/gi, 'font-size: 14pt');
      finalHtml = finalHtml.replace(/font-family:\s*[^;]+;/gi, "font-family: 'Times New Roman', Times, serif;");
    }

    // Global cleanup: prevent any double colons anywhere in section I
    finalHtml = finalHtml.replace(/I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT\s*::+/gi, 'I. YÊU CẦU CẦN ĐẠT:');
    finalHtml = finalHtml.replace(/(I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:<\/strong>)?)\s*:+/gi, '$1');
    finalHtml = finalHtml.replace(/(?:<p[^>]*>)?\s*(?:<strong[^>]*>)?\s*I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:<\/strong>)?\s*(?:###|##|#|\s)+\s*(?:<strong[^>]*>)?\s*1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?\s*(?:<\/strong>)?\s*(?:<\/p>)?/gi, 
      `<p style="font-size: 13pt; font-weight: bold; margin-top: 15px; margin-bottom: 6px; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #c00000;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #c00000;' : ''}">I. YÊU CẦU CẦN ĐẠT:</strong></p>\n<p style="font-size: 13pt; font-weight: bold; margin-top: 8px; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly; ${isGDPT2018Plan ? 'color: #0070c0;' : ''}"><strong style="${isGDPT2018Plan ? 'color: #0070c0;' : ''}">${isGDPT2018Plan ? '1. Năng lực đặc thù' : '1. Năng lực đặc thù:'}</strong></p>`);

    if (isGDPT2018Plan) {
      finalHtml = finalHtml.replace(/(<strong style="color: #0070c0;">1\.\s*Năng\s*lực\s*đặc\s*thù):?(<\/strong>):?/gi, '$1$2');
      finalHtml = finalHtml.replace(/(<strong style="color: #0070c0;">2\.\s*Năng\s*lực\s*chung):?(<\/strong>):?/gi, '$1$2');
      finalHtml = finalHtml.replace(/(<strong style="color: #0070c0;">3\.\s*Phẩm\s*chất):?(<\/strong>):?/gi, '$1$2');
      finalHtml = finalHtml.replace(/(<strong style="color: #c00000;">II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC):?(<\/strong>):?/gi, '$1$2');
      finalHtml = finalHtml.replace(/(<strong style="color: #c00000;">III\.\s*CÁC\s*HOẠT\s*ĐỘNG\s*DẠY\s*HỌC\s*CHỦ\s*YẾU):?(<\/strong>):?/gi, '$1$2');
    }

    if (finalHtml.includes('class="tiet2-container') && !finalHtml.includes('<!-- END TIET 2 -->')) {
      finalHtml += '</div><!-- END TIET 2 -->';
    }

    // Clean up Section II "ĐỒ DÙNG DẠY HỌC"
    // 1. Transform any "tranh ảnh phóng to Hình 22, 23, 24, 25" -> "Tranh ảnh Hình 22, 23, 24, 25 SGK Trang *"
    finalHtml = finalHtml.replace(/(?:tranh\s*ảnh\s*phóng\s*to|Tranh\s*ảnh\s*phóng\s*to)\s+(?:các\s+)?(Hình\s+[\d,\s\.\-–và]+)([^,;\.\n\r<]*)/gi, 
      (_m, fig, extra) => {
        const cleanFig = fig.trim().replace(/,\s*$/, "");
        const pageMatch = (extra || "").match(/(?:trang|Trang)\s*(\d+)/i);
        if (pageMatch) {
          return `Tranh ảnh ${cleanFig} SGK Trang ${pageMatch[1]}`;
        } else {
          return `Tranh ảnh ${cleanFig} SGK Trang *`;
        }
      }
    );
    finalHtml = finalHtml.replace(/\s*trong SGK\s+[^\(\n\r,<]+(?:\s*\([^)]*\))?/gi, '');
    finalHtml = finalHtml.replace(/\s*trong SGK\b/gi, '');

    // 2. Remove book series names in parentheses anywhere in Section II
    finalHtml = finalHtml.replace(/(\s*\(bộ sách\s*(?:Kết nối tri thức|Chân trời sáng tạo|Cánh diều)[^)]*\)|\s*\((?:Kết nối tri thức với cuộc sống|Kết nối tri thức|Chân trời sáng tạo|Cánh diều)\))/gi, '');

    // 3. Guarantee that 100% of selected tools in toolsParam appear in every "- Giáo viên:" paragraph
    finalHtml = finalHtml.replace(/(<p[^>]*>\s*(?:&nbsp;)*\s*(?:<strong[^>]*>)?\s*-\s*Giáo\s*viên:\s*(?:<\/strong>)?)([\s\S]*?)(<\/p>)/gi, 
      (_m, _prefix, content, _suffix) => {
        const formatted = formatTeacherToolsString(content, toolsParam, cleanSubjectDisplay, cleanGradeStr);
        return `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Giáo viên:</strong> ${formatted}.</p>`;
      }
    );

    // 4. Fixed Student materials line:
    finalHtml = finalHtml.replace(/<p([^>]*)>\s*(?:&nbsp;)*\s*(?:<strong[^>]*>)?\s*-\s*Học\s*sinh:[^<]+(?:<\/strong>)?<\/p>/gi, 
      `<p style="font-size: ${isGDPT2018Plan ? '14pt' : '12.5pt'}; margin-left: 20px; text-align: justify; margin-bottom: 4px; line-height: 1.25; mso-line-height-rule: exactly;">&nbsp;&nbsp;<strong>- Học sinh:</strong> SGK ${cleanSubjectDisplay} ${cleanGradeStr}, VBT ${cleanSubjectDisplay} ${cleanGradeStr}, vở ghi, dụng cụ học tập.</p>`
    );

    finalHtml = boldLessonTitleInLeadIn(finalHtml);
    finalHtml = fixLessonTitlePeriodSpacing(finalHtml);

    return finalHtml;
  };

  const handleDownloadDoc = () => {
    try {
      const isGDPT = currentPlanIsGDPT2018 || plannerTab === 'gdpt2018';
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Kế hoạch bài dạy${isGDPT ? ' - GDPT 2018' : ' - Bám sát Công văn 2345'}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 21.0cm 29.7cm;
            margin: ${isGDPT ? '1.5cm 1.75cm 1.5cm 1.75cm' : '1.2in 1in 1.2in 1in'};
            mso-margin-top-alt: ${isGDPT ? '1.5cm' : '1.2in'};
            mso-margin-bottom-alt: ${isGDPT ? '1.5cm' : '1.2in'};
            mso-margin-left-alt: ${isGDPT ? '1.75cm' : '1in'};
            mso-margin-right-alt: ${isGDPT ? '1.75cm' : '1in'};
            mso-page-orientation: portrait;
          }
          @page Section1 {
            size: 21.0cm 29.7cm;
            margin: ${isGDPT ? '1.5cm 1.75cm 1.5cm 1.75cm' : '1.2in 1in 1.2in 1in'};
            mso-margin-top-alt: ${isGDPT ? '1.5cm' : '1.2in'};
            mso-margin-bottom-alt: ${isGDPT ? '1.5cm' : '1.2in'};
            mso-margin-left-alt: ${isGDPT ? '1.75cm' : '1in'};
            mso-margin-right-alt: ${isGDPT ? '1.75cm' : '1in'};
            mso-header-margin: 36.0pt;
            mso-footer-margin: 36.0pt;
            mso-paper-source: 0;
          }
          div.Section1 {
            page: Section1;
          }
          @page Section2 {
            size: 21.0cm 29.7cm;
            mso-page-orientation: portrait;
            margin: 1.5cm 1.75cm 1.5cm 1.75cm;
            mso-margin-top-alt: 1.5cm;
            mso-margin-bottom-alt: 1.5cm;
            mso-margin-left-alt: 1.75cm;
            mso-margin-right-alt: 1.75cm;
            mso-header-margin: 36.0pt;
            mso-footer-margin: 36.0pt;
            mso-paper-source: 0;
          }
          div.Section2 {
            page: Section2;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.25;
            mso-line-height-rule: exactly;
            font-size: ${isGDPT ? '14pt' : '13pt'};
            margin: 0;
            padding: 0;
          }
          h1, h2, h3, h4 {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.25;
            mso-line-height-rule: exactly;
            margin-top: 12pt;
            margin-bottom: 6pt;
            font-size: ${isGDPT ? '14pt' : '13pt'};
          }
          p, td, th, div, span {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.25;
            mso-line-height-rule: exactly;
            margin: 6pt 0;
            text-align: justify;
            font-size: ${isGDPT ? '14pt' : '13pt'};
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
          .right { text-align: right; }
          .page-break { page-break-before: always !important; mso-break-type: section-break !important; clear: both !important; }
          .Section2, .tiet2-container, .tiet2-page-container { page-break-before: auto !important; mso-break-type: none !important; clear: both !important; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 15px;
            font-size: ${isGDPT ? '14pt' : '13pt'};
            font-family: "Times New Roman", Times, serif;
            line-height: 1.25;
            mso-line-height-rule: exactly;
            page-break-inside: auto !important;
            border: 1.0pt solid windowtext;
            mso-border-alt: solid windowtext 1.0pt;
            mso-border-insideh: ${isGDPT ? 'none' : '1.0pt solid windowtext'};
            mso-border-insidev: 1.0pt solid windowtext;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-before: auto !important;
            page-break-after: auto !important;
          }
          thead {
            display: table-header-group;
            mso-yfti-tblheader: yes;
          }
          th { border: 1px solid black; mso-border-alt: solid windowtext 1.0pt; }
          th, td {
            padding: 5px 8px;
            vertical-align: top;
            font-size: ${isGDPT ? '14pt' : '12.5pt'};
            font-family: "Times New Roman", Times, serif;
            line-height: 1.25;
            mso-line-height-rule: exactly;
            margin: 0pt !important;
            margin-top: 0pt !important;
            margin-bottom: 0pt !important;
            mso-para-margin: 0pt !important;
            mso-para-margin-top: 0pt !important;
            mso-para-margin-bottom: 0pt !important;
          }
          table p, table td p, table th p, table div {
            margin: 0pt !important;
            margin-top: 0pt !important;
            margin-bottom: 0pt !important;
            mso-para-margin: 0pt !important;
            mso-para-margin-top: 0pt !important;
            mso-para-margin-bottom: 0pt !important;
            line-height: 1.25 !important;
            mso-line-height-rule: exactly !important;
            font-size: ${isGDPT ? '14pt' : '12.5pt'} !important;
            font-family: "Times New Roman", Times, serif !important;
          }
        </style>
      </head>
      <body>
        <div class="Section1">`;
      
      const footer = "</div></body></html>";
      let planHtml = renderLessonPlanToHtml(editablePlanText, lessonTitle, selectedSubject, selectedGrade, lessonDuration, true, currentPlanIsBasic, isGDPT);

      if (isGDPT) {
        planHtml = planHtml.replace(/font-size:\s*[\d\.]+pt/gi, 'font-size: 14pt');
        planHtml = planHtml.replace(/font-family:\s*[^;]+;/gi, "font-family: 'Times New Roman', Times, serif;");
        planHtml = planHtml.replace(/(HOẠT ĐỘNG CỦA GIÁO VIÊN|HOẠT ĐỘNG CỦA HỌC SINH|Hoạt động của Giáo viên|Hoạt động của Học sinh|HOẠT ĐỘNG DẠY HỌC|YÊU CẦU CẦN ĐẠT)/gi, `<span style="font-size: 14pt !important; font-family: 'Times New Roman', Times, serif;">$1</span>`);
      } else {
        planHtml = planHtml.replace(/(HOẠT ĐỘNG CỦA GIÁO VIÊN|HOẠT ĐỘNG CỦA HỌC SINH|Hoạt động của Giáo viên|Hoạt động của Học sinh|HOẠT ĐỘNG DẠY HỌC|YÊU CẦU CẦN ĐẠT)/gi, `<span style="font-size: 12.5pt !important; font-family: 'Times New Roman', Times, serif;">$1</span>`);
      }

      const blob = new Blob([header + planHtml + footer], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedName = lessonTitle.trim() ? lessonTitle.replace(/[^a-zA-Z0-9 Vietnamese]/g, "") : (isGDPT ? "GiaoAn_GDPT2018" : "GiaoAn_2345");
      link.href = url;
      link.download = `${isGDPT ? 'Giao_An_GDPT2018' : 'Giao_An_2345'}_Mon_${(selectedSubject || 'TinHoc').replace(/\s+/g, '')}_Lop_${selectedGrade || 3}_${sanitizedName.replace(/\s+/g, "_")}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`📥 Đã tải xuống file ${isGDPT ? 'Giáo án GDPT 2018' : 'Giáo án Word 2345'} chuẩn MS Word thành công!`);
    } catch (err) {
      console.error(err);
      showToast('❌ Gặp sự cố kết xuất file Word. Thầy Cô vui lòng thử lại!');
    }
  };

  const handlePrintPdf = () => {
    try {
      const isGDPT = currentPlanIsGDPT2018 || plannerTab === 'gdpt2018';
      let planHtml = renderLessonPlanToHtml(editablePlanText, lessonTitle, selectedSubject, selectedGrade, lessonDuration, true, currentPlanIsBasic, isGDPT);
      
      if (isGDPT) {
        planHtml = planHtml.replace(/font-size:\s*[\d\.]+pt/gi, 'font-size: 14pt');
        planHtml = planHtml.replace(/font-family:\s*[^;]+;/gi, "font-family: 'Times New Roman', Times, serif;");
        planHtml = planHtml.replace(/(HOẠT ĐỘNG CỦA GIÁO VIÊN|HOẠT ĐỘNG CỦA HỌC SINH|Hoạt động của Giáo viên|Hoạt động của Học sinh|HOẠT ĐỘNG DẠY HỌC|YÊU CẦU CẦN ĐẠT)/gi, `<span style="font-size: 14pt !important; font-family: 'Times New Roman', Times, serif;">$1</span>`);
      } else {
        planHtml = planHtml.replace(/(HOẠT ĐỘNG CỦA GIÁO VIÊN|HOẠT ĐỘNG CỦA HỌC SINH|Hoạt động của Giáo viên|Hoạt động của Học sinh|HOẠT ĐỘNG DẠY HỌC|YÊU CẦU CẦN ĐẠT)/gi, `<span style="font-size: 12.5pt !important; font-family: 'Times New Roman', Times, serif;">$1</span>`);
      }

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        showToast('❌ Không thể kết nối với bộ in của trình duyệt.');
        return;
      }

      iframeDoc.write(`
        <html>
          <head>
            <meta charset="utf-8">
            <title>Kế hoạch bài dạy - ${lessonTitle}</title>
            <style>
              @page {
                size: a4;
                margin: ${isGDPT ? '15mm 17.5mm 15mm 17.5mm' : '20mm 20mm 20mm 25mm'};
              }
              body {
                font-family: "Times New Roman", Times, serif;
                line-height: 1.25;
                font-size: ${isGDPT ? '14pt' : '13pt'};
                color: #000;
                padding: ${isGDPT ? '0' : '10px'};
                margin: 0;
              }
              h1, h2, h3, h4, .title {
                font-family: "Times New Roman", Times, serif;
                line-height: 1.25;
                margin-top: 12pt;
                margin-bottom: 6pt;
                font-size: ${isGDPT ? '14pt' : '13pt'};
              }
              p, td, th, div, span {
                font-family: "Times New Roman", Times, serif;
                line-height: 1.25;
                text-align: justify;
                font-size: ${isGDPT ? '14pt' : '13pt'};
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .italic { font-style: italic; }
              .right { text-align: right; }
              .tiet2-container, .tiet2-page-container, .page-break {
                page-break-before: always !important;
                break-before: page !important;
                clear: both !important;
              }
              @media print {
                .tiet2-container, .tiet2-page-container, .page-break {
                  page-break-before: always !important;
                  break-before: page !important;
                  border-top: none !important;
                  padding-top: 0 !important;
                  margin-top: 0 !important;
                }
              }
              table {
                width: 100%;
                border-collapse: collapse !important;
                margin-top: 15px;
                margin-bottom: 15px;
                page-break-inside: auto;
                border: 1px solid black;
              }
              tr {
                page-break-inside: avoid !important;
                page-break-after: auto;
              }
              thead {
                display: table-header-group !important;
              }
              th {
                border: 1px solid black;
              }
              th, td {
                padding: 5px 8px;
                vertical-align: top;
                font-size: ${isGDPT ? '14pt' : '12.5pt'};
                font-family: "Times New Roman", Times, serif;
                margin: 0pt !important;
                margin-top: 0pt !important;
                margin-bottom: 0pt !important;
                line-height: 1.25 !important;
                border: 1px solid black;
              }
              table p, table td p, table th p, table div {
                margin: 0pt !important;
                margin-top: 0pt !important;
                margin-bottom: 0pt !important;
                line-height: 1.25 !important;
                font-size: ${isGDPT ? '14pt' : '12.5pt'} !important;
                font-family: "Times New Roman", Times, serif !important;
              }
            </style>
          </head>
          <body>
            ${planHtml}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);

      showToast('🖨️ Đã chuẩn bị tài liệu PDF! Đang hiển thị giao diện xem trước & in ấn...');
    } catch (err) {
      console.error(err);
      showToast('❌ Gặp lỗi trong quá trình chuẩn bị tệp PDF.');
    }
  };

  return (
    <div className="space-y-6 text-left pb-16 relative">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -45 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -42 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Banner - Emerald/Indigo Modern Tech Banner */}
      <div className="bg-gradient-to-r from-[#2454A6] via-[#3B82F6] to-[#10b981] text-white p-6 rounded-[32px] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="bg-white/20 text-white text-[10px] px-3 py-0.5 rounded-full font-black uppercase inline-block border border-white/20 tracking-wider">
            👩‍🏫 AI Assistant for Teachers
          </div>
          <h2 className="text-2.5xl md:text-3.5xl font-black text-white" style={{ fontFamily: 'var(--font-title)' }}>
            Hệ thống Soạn Giáo án Tiểu học chuẩn 2345
          </h2>
          <p className="text-xs text-blue-50 font-semibold max-w-3xl leading-relaxed">
            Công nghệ trí tuệ nhân tạo Gemini giúp Thầy Cô tự động xuất bản giáo án lý thuyết, thực hành, bổ trợ trực tuyến, tích hợp năng lực tư duy số & Game hóa một cách chuyên nghiệp nhất!
          </p>
        </div>
        <span className="text-5.5xl self-end md:self-auto select-none mt-2 md:mt-0 animate-pulse">📝🤖</span>
      </div>

      {/* 1.5. NXB GD Training Book Reference Card */}
      {plannerTab !== 'gdpt2018' && (
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-4 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-sm">
          <span className="text-3xl select-none">📚</span>
          <div className="space-y-1">
            <p className="text-xs font-black text-[#2454A6] uppercase tracking-wider flex items-center gap-2">
              Tham khảo Sách Giáo Khoa chuẩn "Kết nối tri thức với cuộc sống"
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Trình soạn thảo bám sát tuyệt đối nội dung thuộc chương trình môn học. Thầy Cô có thể tra cứu sách trực tiếp tại cổng thông tin tập huấn của Nhà xuất bản Giáo dục Việt Nam:{" "}
              <a 
                href="https://taphuan.nxbgd.vn/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#2454A6] hover:text-blue-800 font-extrabold underline inline-flex items-center gap-1 transition-all"
              >
                taphuan.nxbgd.vn
              </a>
            </p>
          </div>
        </div>
      )}

      {/* 1.6. Master Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex gap-3 sm:gap-5 border-b border-slate-200 mt-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => { 
            setPlannerTab('gdpt2018'); 
            setSelectedCurriculumBook('Kết nối tri thức với cuộc sống');
            SoundEffects.playTing(); 
          }}
          className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            plannerTab === 'gdpt2018'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          🎓 Giáo án GDPT 2018
        </button>
        <button
          type="button"
          onClick={() => { setPlannerTab('detailed'); SoundEffects.playTing(); }}
          className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            plannerTab === 'detailed'
              ? 'border-[#2454A6] text-[#2454A6]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          📑 Giáo án Chi tiết
        </button>
        <button
          type="button"
          onClick={() => { setPlannerTab('preview-plan'); SoundEffects.playTing(); }}
          className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            plannerTab === 'preview-plan'
              ? 'border-[#2454A6] text-[#2454A6]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          📄 Xem trước giáo án
        </button>
        <button
          type="button"
          onClick={() => { setPlannerTab('history'); SoundEffects.playTing(); }}
          className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            plannerTab === 'history'
              ? 'border-[#2454A6] text-[#2454A6]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          ⏳ Lịch sử giáo án ({savedHistory.length})
        </button>
      </div>

      {plannerTab === 'history' ? (
        <div className="max-w-7xl mx-auto bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 text-left">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                ⏳ Lịch sử giáo án chuẩn 2345 đã soạn
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Danh sách bài dạy Thầy Cô đã tạo trên trình duyệt này. Có thể chỉnh sửa hoặc xuất Word lại nhanh chóng.
              </p>
            </div>
            
            {savedHistory.length > 0 && (
              <div className="flex items-center gap-2">
                {showDeleteConfirm ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSavedHistory([]);
                        localStorage.removeItem('lesson_plan_history_2345');
                        setShowDeleteConfirm(false);
                        showToast("🗑️ Đã xóa sạch toàn bộ lịch sử giáo án.");
                        SoundEffects.playTing();
                      }}
                      className="px-4 py-2 font-black text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5 bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xác nhận xóa sạch!
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2 font-black text-xs rounded-xl cursor-pointer transition bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 font-black text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa tất cả lịch sử
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filters Bar Row */}
          {savedHistory.length > 0 && (
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Lọc theo Khối lớp</label>
                <select
                  value={filterGrade}
                  onChange={(e) => { setFilterGrade(e.target.value); SoundEffects.playTing(); }}
                  className="w-full bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#2454A6]"
                >
                  <option value="all">Tất cả Khối lớp</option>
                  <option value="Lớp 1">Lớp 1</option>
                  <option value="Lớp 2">Lớp 2</option>
                  <option value="Lớp 3">Lớp 3</option>
                  <option value="Lớp 4">Lớp 4</option>
                  <option value="Lớp 5">Lớp 5</option>
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Lớp 3 Ic3 Spark">Lớp 3 IC3 Spark</option>
                  <option value="Lớp 4 Ic3 Spark">Lớp 4 IC3 Spark</option>
                  <option value="Lớp 5 Ic3 Spark">Lớp 5 IC3 Spark</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Lọc theo Môn học</label>
                <select
                  value={filterSubject}
                  onChange={(e) => { setFilterSubject(e.target.value); SoundEffects.playTing(); }}
                  className="w-full bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#2454A6]"
                >
                  <option value="all">Tất cả Môn học</option>
                  <option value="Tin học">Tin học</option>
                  <option value="Toán học">Toán học</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Tự nhiên và Xã hội">Tự nhiên và Xã hội</option>
                  <option value="Đạo đức">Đạo đức</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Âm nhạc">Âm nhạc</option>
                  <option value="Mĩ thuật">Mĩ thuật</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                  <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                  <option value="Lịch sử và Địa lí">Lịch sử & Địa lí</option>
                  <option value="Vật lí">Vật lí</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Sinh học">Sinh học</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tìm theo Chủ đề / Từ khóa</label>
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Nhập tên bài dạy, chủ đề, từ khóa..."
                  className="w-full bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-705 outline-none focus:border-[#2454A6] placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {savedHistory.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <span className="text-6xl select-none block">🗂️</span>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-700">Chưa tìm thấy giáo án lịch sử</h4>
                <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                  Các bài dạy sau khi được biên soạn và xuất bản thành công sẽ tự động lưu lại ở trang này để Thầy Cô tái bản và chỉnh sửa bất cứ lúc nào!
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setPlannerTab('gdpt2018'); SoundEffects.playTing(); }}
                className="px-5 py-3 bg-[#2454A6] hover:bg-blue-800 text-white font-black text-xs rounded-2xl cursor-pointer shadow-sm transition"
              >
                🎓 Soạn Bài Dạy Đầu Tiên Ngay
              </button>
            </div>
          ) : (() => {
            const getFilteredHistory = () => {
              return savedHistory.filter(item => {
                const matchesGrade = filterGrade === 'all' || item.grade.toLowerCase() === filterGrade.toLowerCase();
                const matchesSubject = filterSubject === 'all' || item.subject.toLowerCase() === filterSubject.toLowerCase();
                const matchesSearch = filterSearch.trim() === '' || 
                  item.title.toLowerCase().includes(filterSearch.toLowerCase()) || 
                  (item.lessonContent && item.lessonContent.toLowerCase().includes(filterSearch.toLowerCase()));
                return matchesGrade && matchesSubject && matchesSearch;
              });
            };
            const filteredList = getFilteredHistory();

            if (filteredList.length === 0) {
              return (
                <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
                  <span className="text-5xl select-none block">🔍</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-700">Không tìm thấy kết quả</h4>
                    <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                      Không có giáo án lịch sử nào khớp với bộ lọc hiện tại của Thầy Cô. Hãy thử nhập từ khóa khác hoặc xóa lọc!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterGrade('all');
                      setFilterSubject('all');
                      setFilterSearch('');
                      SoundEffects.playTing();
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50 border border-slate-150 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9.5px] font-black uppercase text-[#2454A6] bg-blue-100 px-2 py-0.5 rounded-md">
                          {item.subject}
                        </span>
                        <span className="text-[9.5px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.grade}
                        </span>
                        <span className="text-[9.5px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                          {item.duration || '1 Tiết'}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="text-gray-400 hover:text-rose-500 p-1 hover:bg-slate-200 rounded-lg transition"
                        title="Xóa giáo án này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        📅 Ngày soạn: {item.createdAt}
                      </p>
                    </div>

                    <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed line-clamp-3">
                      {item.lessonContent || "Không có tóm tắt nội dung đặc biệt."}
                    </p>

                    {/* Integrated Quick Review colors section */}
                    <div className="pt-3 border-t border-slate-200/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Trạng thái:</span>
                        <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${
                          item.status === 'taught' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'approved' ? 'bg-emerald-100/80 text-emerald-700' :
                          item.status === 'needs_edit' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-200/80 text-slate-600'
                        }`}>
                          {item.status === 'taught' ? 'Đã dạy' :
                           item.status === 'approved' ? 'Đã duyệt' :
                           item.status === 'needs_edit' ? 'Cần sửa' :
                           'Nháp'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9.5px] font-black text-slate-400 pr-1">Duyệt nhanh:</span>
                        {/* Circle Draft */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'draft'); }}
                          className={`w-4 h-4 rounded-full bg-slate-400 border transition hover:scale-110 flex items-center justify-center cursor-pointer ${
                            (!item.status || item.status === 'draft') ? 'ring-2 ring-slate-600 ring-offset-1 border-white shadow-sm' : 'border-slate-300'
                          }`}
                          title="Nháp"
                        >
                          {(!item.status || item.status === 'draft') && <span className="text-[8px] font-black text-white">✓</span>}
                        </button>

                        {/* Circle Needs Edit */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'needs_edit'); }}
                          className={`w-4 h-4 rounded-full bg-amber-500 border transition hover:scale-110 flex items-center justify-center cursor-pointer ${
                            item.status === 'needs_edit' ? 'ring-2 ring-amber-600 ring-offset-1 border-white shadow-sm' : 'border-amber-300'
                          }`}
                          title="Cần chỉnh sửa"
                        >
                          {item.status === 'needs_edit' && <span className="text-[8px] font-black text-white">✓</span>}
                        </button>

                        {/* Circle Approved */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'approved'); }}
                          className={`w-4 h-4 rounded-full bg-[#10b981] border transition hover:scale-110 flex items-center justify-center cursor-pointer ${
                            item.status === 'approved' ? 'ring-2 ring-emerald-600 ring-offset-1 border-white shadow-sm' : 'border-slate-300'
                          }`}
                          title="Đã duyệt"
                        >
                          {item.status === 'approved' && <span className="text-[8px] font-black text-white">✓</span>}
                        </button>

                        {/* Circle Taught */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'taught'); }}
                          className={`w-4 h-4 rounded-full bg-[#2454A6] border transition hover:scale-110 flex items-center justify-center cursor-pointer ${
                            item.status === 'taught' ? 'ring-2 ring-blue-700 ring-offset-1 border-white shadow-sm' : 'border-slate-300'
                          }`}
                          title="Đã dạy"
                        >
                          {item.status === 'taught' && <span className="text-[8px] font-black text-white">✓</span>}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleViewHistoryItem(item)}
                      className="flex-1 min-w-[90px] py-2 px-2.5 bg-[#2454A6] hover:bg-blue-800 text-white text-[11px] font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border-b-2 border-blue-900"
                    >
                      <Eye className="w-3 h-3" />
                      Xem/Word
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRestoreHistoryItem(item)}
                      className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                      title="Nạp thông số"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sửa tiếp
                    </button>
                  </div>
                </div>
              ))}
            </div>
            );
          })()}
        </div>
      ) : plannerTab === 'preview-plan' ? (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {/* Header Action Row */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-left">
            <div className="space-y-1 w-full md:w-auto">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                📝 Trình soạn thảo Giáo án trực quan 2345
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Thầy Cô gõ chỉnh sửa nội dung, thêm xóa hàng cột bảng biểu trực tiếp bên dưới. Hệ thống tự lưu vào bộ nhớ đệm!
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Undo / Redo in visual_plan toolbar */}
              <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl mr-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length <= 1}
                  title="Hoàn tác chỉnh sửa (Undo)"
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    undoStack.length > 1
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95 shadow-xs'
                      : 'bg-slate-100 text-slate-350 border-transparent cursor-not-allowed'
                  }`}
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Khôi phục thao tác (Redo)"
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    redoStack.length > 0
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95 shadow-xs'
                      : 'bg-slate-100 text-slate-350 border-transparent cursor-not-allowed'
                  }`}
                >
                  <Undo className="w-3.5 h-3.5 scale-x-[-1]" />
                </button>
              </div>

              {/* Copy standard */}
              <button
                type="button"
                onClick={handleCopyRichText}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 active:scale-95 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Sao chép nội dung với đầy đủ bảng biểu, màu sắc để dán trực tiếp vào MS Word giữ nguyên định dạng"
              >
                <Copy className="w-3.5 h-3.5" />
                Sao chép định dạng
              </button>
              
              {/* Export Word */}
              <button
                type="button"
                onClick={handleDownloadDoc}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-750 active:scale-95 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                Tải file Word (.doc)
              </button>
            </div>
          </div>

          {/* Core visual document page */}
          {!visualHtmlContent ? (
            <div className="bg-white border border-slate-150 rounded-[32px] p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto">
              <span className="text-5xl select-none block">📭</span>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-700">Chưa có giáo án đang hoạt động</h4>
                <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                  Thầy Cô chưa tạo giáo án nào trong phiên làm việc này. Hãy quay lại mục <strong>"Giáo án Cơ bản"</strong> hoặc <strong>"Giáo án Chi tiết"</strong> để thiết lập thông tin môn và bắt đầu soạn, hoặc khôi phục nhanh từ tab <strong>"Lịch sử giáo án"</strong>.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => { setPlannerTab('gdpt2018'); SoundEffects.playTing(); }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-sm transition"
                >
                  🎓 Soạn Giáo án GDPT 2018
                </button>
                <button
                  type="button"
                  onClick={() => { setPlannerTab('detailed'); SoundEffects.playTing(); }}
                  className="px-4 py-2.5 bg-[#2454A6] hover:bg-blue-800 text-white font-black text-xs rounded-xl cursor-pointer shadow-sm transition"
                >
                  📑 Soạn Giáo án Chi tiết
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 sm:p-5 rounded-[24px] border border-slate-150 shadow-inner">
              <div 
                ref={editorRef}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onInput={handleEditorInput}
                className="bg-white border border-slate-200 p-8 md:p-12 rounded-[16px] shadow-sm text-slate-950 select-text outline-none focus:outline-none min-h-[600px] text-left" 
                style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: (plannerTab === 'gdpt2018' || currentPlanIsGDPT2018) ? '14pt' : '13pt', lineHeight: '1.45' }}
                dangerouslySetInnerHTML={{ __html: visualHtmlContent }}
              />
            </div>
          )}
        </div>
      ) : plannerTab === 'templates' ? (
        <div className="max-w-4xl mx-auto bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6 text-left">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Settings className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                ⚙️ Thiết lập mẫu giáo án tùy chỉnh
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Tùy biến cấu trúc đề mục, cặp năng lực, phẩm chất, và các hoạt động giảng dạy chi tiết theo ý muốn của Thầy Cô.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* KIỂU TIÊU ĐỀ & KHUNG SƯ PHẠM CHÍNH */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-4">
              <h4 className="text-xs font-black text-[#2454A6] uppercase tracking-wider flex items-center gap-1.5">
                🌐 KIỂU TIÊU ĐỀ & KHUNG SƯ PHẠM CHÍNH
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">Kiểu tiêu đề giáo án</label>
                  <select
                    value={layoutHeaderStyle}
                    onChange={(e: any) => setLayoutHeaderStyle(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:border-indigo-450 focus:outline-none"
                  >
                    <option value="standard">Trang trọng (Cộng hòa xã hội...)</option>
                    <option value="simple">Đầy đủ (Kế hoạch bài dạy: Môn + Bài học)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">Tiêu đề Mục tiêu (Phần I)</label>
                  <input
                    type="text"
                    value={layoutCustomObjectiveName}
                    onChange={(e) => setLayoutCustomObjectiveName(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:border-indigo-450 focus:outline-none"
                    placeholder="VD: I. YÊU CẦU CẦN ĐẠT"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">Tiêu đề Đồ dùng dạy học (Phần II)</label>
                  <input
                    type="text"
                    value={layoutCustomToolsName}
                    onChange={(e) => setLayoutCustomToolsName(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:border-indigo-455 focus:outline-none"
                    placeholder="VD: II. ĐỒ DÙNG DẠY HỌC"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">Tiêu đề Tiến trình dạy học (Phần III)</label>
                  <input
                    type="text"
                    value={layoutCustomActivitiesName}
                    onChange={(e) => setLayoutCustomActivitiesName(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:border-indigo-455 focus:outline-none"
                    placeholder="VD: III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">Tiêu đề Điều chỉnh bài dạy (Phần IV)</label>
                  <input
                    type="text"
                    value={layoutCustomAdjustmentName}
                    onChange={(e) => setLayoutCustomAdjustmentName(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:border-indigo-455 focus:outline-none"
                    placeholder="VD: IV. ĐIỀU CHỈNH SAU BÀI DẠY"
                  />
                </div>
              </div>
            </div>

            {/* CẤU TRÚC NĂNG LỰC & PHẨM CHẤT */}
            <div className="bg-indigo-50/40 rounded-2xl p-5 border border-indigo-100/60 space-y-4">
              <h4 className="text-xs font-black text-indigo-850 uppercase tracking-wider flex items-center gap-1.5">
                ✏️ CẤU TRÚC NĂNG LỰC & PHẨM CHẤT (PHẦN I)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">1. Năng lực đặc thù</label>
                  <input
                    type="text"
                    value={layoutCustomITCompetency}
                    onChange={(e) => setLayoutCustomITCompetency(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:border-indigo-455 focus:outline-none"
                    placeholder="VD: 1. Năng lực đặc thù"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">Năng lực chung</label>
                  <input
                    type="text"
                    value={layoutCustomGeneralCompetency}
                    onChange={(e) => setLayoutCustomGeneralCompetency(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:border-indigo-455 focus:outline-none"
                    placeholder="VD: Năng lực chung"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide block">Phẩm chất</label>
                  <input
                    type="text"
                    value={layoutCustomQualities}
                    onChange={(e) => setLayoutCustomQualities(e.target.value)}
                    className="w-full text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:border-indigo-455 focus:outline-none"
                    placeholder="VD: Phẩm chất"
                  />
                </div>
              </div>
            </div>

            {/* 📅 QUẢN LÝ TIẾT DẠY & HOẠT ĐỘNG (DỰA TRÊN YÊU CẦU DỰ ÁN) */}
            <div className="bg-amber-50/40 rounded-2xl p-6 border border-amber-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    📅 QUẢN LÝ TIẾT DẠY & HOẠT ĐỘNG
                  </h4>
                  <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                    Tùy biến số lượng tiết học và chi tiết hoạt động trong từng tiết.
                  </p>
                </div>
                
                <div className="flex items-center gap-4 bg-amber-100/50 px-3 py-1.5 rounded-xl border border-amber-200/60 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-black text-amber-950 uppercase tracking-wider">Trạng thái:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleCustomPeriods(!enableCustomPeriods)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        enableCustomPeriods ? 'bg-[#2454A6]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          enableCustomPeriods ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {enableCustomPeriods && (
                    <button
                      type="button"
                      onClick={handleAddPeriod}
                      className="px-2.5 py-1.5 bg-[#2454A6] hover:bg-blue-800 text-white font-bold text-[10.5px] rounded-lg transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                      Thêm Tiết học
                    </button>
                  )}
                </div>
              </div>

              {enableCustomPeriods ? (
                <div className="space-y-4">
                  {layoutPeriods.map((period, pIdx) => (
                    <div key={period.id} className="bg-white border-2 border-amber-100 rounded-xl p-4.5 space-y-4 shadow-sm hover:border-amber-250 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/30 p-2 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-black text-amber-800 shrink-0 uppercase tracking-wider">Tên tiết:</span>
                          <input
                            type="text"
                            value={period.name}
                            onChange={(e) => handleUpdatePeriodName(period.id, e.target.value)}
                            className="w-full text-xs font-bold border-b border-transparent hover:border-amber-300 focus:border-amber-500 focus:outline-none bg-transparent py-0.5 px-1 text-slate-850"
                            placeholder={`Ví dụ: TIẾT ${pIdx + 1}`}
                          />
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleAddActivityToPeriod(period.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 text-[10.5px] font-black rounded-md transition-all flex items-center gap-0.5 cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3" />
                            Thêm Hoạt động
                          </button>
                          {layoutPeriods.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePeriod(period.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all border border-rose-200 cursor-pointer active:scale-95"
                              title="Xóa Tiết này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5 pl-3 border-l-2 border-dotted border-amber-200">
                        {period.activities.map((act, actIdx) => (
                          <div key={act.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 hover:bg-slate-100/50 transition-all">
                            <span className="text-[10px] w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-700 rounded-full font-bold shrink-0">
                              {actIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={act.name}
                              onChange={(e) => handleUpdateActivityName(period.id, act.id, e.target.value)}
                              className="flex-1 text-xs font-bold bg-transparent focus:outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-400 py-0.5 px-1 text-slate-800"
                              placeholder={`Hoạt động ${actIdx + 1}: Tên hoạt động...`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveActivityFromPeriod(period.id, act.id)}
                              className="text-slate-400 hover:text-rose-650 p-1 hover:bg-rose-50 rounded-lg transition-all cursor-pointer active:scale-95"
                              title="Xóa hoạt động này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {period.activities.length === 0 && (
                          <p className="text-[11px] text-slate-400 font-semibold italic py-1 pl-1">
                            Chưa có hoạt động nào trong tiết này. Bấm vào nút "Thêm Hoạt động" ở trên để bổ sung.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-100/70 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-500">
                    <span className="text-sm">📴</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-700">Tùy biến tiết học & danh mục hoạt động đang tắt</h5>
                  <p className="text-[11px] text-slate-450 font-semibold leading-relaxed max-w-lg mx-auto">
                    Kế hoạch bài dạy sẽ được phân bổ **Hoàn toàn tự động** tương ứng với Thời lượng tiết dạy đã chọn (Ví dụ: 1 tiết, 2 tiết, 3 tiết...) bám sát phân phối chương trình thực tế của bộ sách **Kết nối tri thức với cuộc sống** thông dụng.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                SoundEffects.playTing();
                setPlannerTab('basic');
                showToast("💾 Đã lưu và kích hoạt mẫu giáo án tùy chỉnh!");
              }}
              className="px-6 py-2.5 bg-[#2454A6] hover:bg-blue-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md select-none border-b-2 border-blue-900"
            >
              <span>Áp dụng & Soạn ngay</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex flex-col gap-6 items-stretch">
            
            {/* Left Panel: Parameters Form */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6 w-full">
            
            {/* Level Tabs (Tiểu Học / THCS / THPT) & Standard Pill Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => { setActiveStage('tieuhoc'); SoundEffects.playTing(); }}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeStage === 'tieuhoc'
                      ? 'bg-[#2454A6] text-white shadow-sm'
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  🎒 Tiểu học
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveStage('thcs'); SoundEffects.playTing(); }}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeStage === 'thcs'
                      ? 'bg-[#2454A6] text-white shadow-sm'
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  🏫 THCS
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveStage('thpt'); SoundEffects.playTing(); }}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeStage === 'thpt'
                      ? 'bg-[#2454A6] text-white shadow-sm'
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  🏛️ THPT
                </button>
              </div>
              
              {plannerTab !== 'gdpt2018' && (
                <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-black animate-pulse ${
                  plannerTab === 'detailed'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    plannerTab === 'detailed'
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`} />
                  {plannerTab === 'detailed' 
                    ? '📑 GIÁO ÁN CHI TIẾT - CHUẨN CÔNG VĂN 2345 MỞ RỘNG (CHIA CỘT GV & HS)' 
                    : '📝 GIÁO ÁN CƠ BẢN - BÁM SÁT CHUẨN CÔNG VĂN 2345 (HOẠT ĐỘNG CỐT LÕI)'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Lớp Selector */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Lớp</label>
              <div className="relative">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6] appearance-none"
                >
                  {stageGrades[activeStage].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Môn Học Selector */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Môn học</label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6] appearance-none"
                >
                  {stageSubjects[activeStage].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Bộ Sách Selector */}
            {plannerTab !== 'gdpt2018' && (
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Bộ sách giáo khoa</label>
                <div className="relative">
                  <select
                    value={selectedCurriculumBook}
                    onChange={(e) => setSelectedCurriculumBook(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6] appearance-none"
                  >
                    <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                    <option value="Cánh Diều">Cánh Diều</option>
                    <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                    <option value="Cùng học để phát triển năng lực">Cùng học để phát triển năng lực</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Số Tiết Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Số tiết dạy</label>
                {(plannerTab === 'basic' || plannerTab === 'gdpt2018') && (
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    Quy định số tiết
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6] appearance-none"
                >
                  <option>1 Tiết</option>
                  <option>2 Tiết</option>
                  <option>3 Tiết</option>
                  <option>4 Tiết</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Chủ đề / Chương (Tùy chọn) */}
            {plannerTab !== 'gdpt2018' && (
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Chủ đề / Chương (nếu có)</label>
                <input
                  type="text"
                  value={lessonChapter}
                  onChange={(e) => setLessonChapter(e.target.value)}
                  placeholder="VD: Chủ đề 1: Máy tính và em"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6]"
                />
              </div>
            )}

            {/* Số lượng học sinh Selector */}
            {plannerTab !== 'gdpt2018' && (
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Sĩ số lớp lý tưởng</label>
                <div className="relative">
                  <select
                    value={studentCountSize}
                    onChange={(e) => setStudentCountSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6] appearance-none"
                  >
                    <option>Nhỏ (&lt; 20 HS)</option>
                    <option>Vừa (20-35 HS)</option>
                    <option>Lớn (&gt; 35 HS)</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Lesson Title Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Tên bài học <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-extrabold font-mono">Bắt buộc</span>
            </div>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="VD: Chủ đề 1 - Làm quen với thư mục, tệp và tệp lệnh máy tính"
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6]"
            />
          </div>

          {/* Interactive Competencies Form Section */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                🎯 Năng lực cần phát triển
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-[#2ba0ee]">AI tự đề xuất</span>
                <button
                  type="button"
                  onClick={() => setAiAutoCompetency(!aiAutoCompetency)}
                  className="focus:outline-none"
                >
                  {aiAutoCompetency ? (
                    <div className="bg-[#2454A6] text-white p-0.5 rounded-full flex items-center justify-end w-12 h-6 transition-all">
                      <span className="text-[9px] font-mono font-black pr-1 select-none text-[8.5px]">BẬT</span>
                      <div className="bg-white w-4.5 h-4.5 rounded-full shadow-sm" />
                    </div>
                  ) : (
                    <div className="bg-slate-300 text-slate-600 p-0.5 rounded-full flex items-center justify-start w-12 h-6 transition-all">
                      <div className="bg-white w-4.5 h-4.5 rounded-full shadow-sm" />
                      <span className="text-[9px] font-mono font-black pl-1 select-none text-[8.5px]">TẮT</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Content: AI Auto vs Category Selection */}
            {aiAutoCompetency ? (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2454A6] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[#2454A6]">Công cụ AI Flash 3 preview tự động phân tích & đề xuất:</p>
                  <p className="text-[11.5px] text-blue-800 leading-relaxed">
                    Dựa vào <strong className="text-blue-950 font-bold">"Tài liệu đính kèm minh họa"</strong> hoặc <strong className="text-blue-950 font-bold">"Tra cứu trang taphuan.nxbgd.vn"</strong> (ưu tiên <strong className="text-blue-950 font-bold">"Tài liệu đính kèm minh họa"</strong> nếu có) để đưa ra các năng lực cần phát triển phù hợp nhất với giáo án của bài học đó.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                {/* 1. Năng lực đặc thù */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                      1. Năng lực đặc thù
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">(Tự động theo môn hoặc tùy chọn)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SPECIFIC_COMPETENCIES_LIST.map((comp) => {
                      const isSelected = selectedCompetencies.includes(comp);
                      return (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => toggleCompetency(comp)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50 text-[#2454A6] border-blue-300 shadow-xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          {comp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Năng lực chung */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
                    2. Năng lực chung
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {GENERAL_COMPETENCIES_LIST.map((comp) => {
                      const isSelected = selectedCompetencies.includes(comp);
                      return (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => toggleCompetency(comp)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          {comp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Phẩm chất */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                      3. Phẩm chất
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">(Ưu tiên theo tài liệu đính kèm hoặc taphuan.nxbgd.vn)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUALITIES_LIST.map((qual) => {
                      const isSelected = selectedQualities.includes(qual);
                      return (
                        <button
                          key={qual}
                          type="button"
                          onClick={() => toggleQuality(qual)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-amber-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          {qual}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub text input */}
                <input
                  type="text"
                  value={customCompetency}
                  onChange={(e) => setCustomCompetency(e.target.value)}
                  placeholder="Nhập thêm năng lực/phẩm chất cụ thể khác (ngăn cách bằng dấu phẩy)..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2454A6]"
                />
              </div>
            )}
          </div>

          {/* Đồ dùng dạy học framework selection */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                🛠️ Đồ dùng dạy học
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-emerald-600">AI tự đề xuất</span>
                <button
                  type="button"
                  onClick={() => setAiAutoTools(!aiAutoTools)}
                  className="focus:outline-none"
                >
                  {aiAutoTools ? (
                    <div className="bg-emerald-600 text-white p-0.5 rounded-full flex items-center justify-end w-12 h-6 transition-all">
                      <span className="text-[9px] font-mono font-black pr-1 select-none text-[8.5px]">BẬT</span>
                      <div className="bg-white w-4.5 h-4.5 rounded-full shadow-sm" />
                    </div>
                  ) : (
                    <div className="bg-slate-300 text-slate-600 p-0.5 rounded-full flex items-center justify-start w-12 h-6 transition-all">
                      <div className="bg-white w-4.5 h-4.5 rounded-full shadow-sm" />
                      <span className="text-[9px] font-mono font-black pl-1 select-none text-[8.5px]">TẮT</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {aiAutoTools ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-700">Công cụ AI Flash 3 preview tự động đưa ra các Đồ dùng dạy học phù hợp:</p>
                  <p className="text-[11.5px] text-emerald-800 leading-relaxed">
                    Dựa vào <strong className="text-emerald-950 font-bold">"Tài liệu đính kèm minh họa"</strong> hoặc <strong className="text-emerald-950 font-bold">"Tra cứu trang taphuan.nxbgd.vn"</strong> (ưu tiên <strong className="text-emerald-950 font-bold">"Tài liệu đính kèm minh họa"</strong> nếu có) để đưa ra các Đồ dùng dạy học (chỉ thay đổi với mục giáo viên) phù hợp nhất với giáo án của bài học đó.<br/>
                    • <strong>Đối với Giáo viên:</strong> Đề xuất đồ dùng phù hợp nhất (Máy chiếu, Bài giảng điện tử, Máy tính, Tranh ảnh SGK Trang * với số trang và hình cụ thể nếu có...).<br/>
                    • <strong>Đối với Học sinh:</strong> SGK {selectedSubject} {selectedGrade.replace(/lớp\s*/i, '').trim() || '3'}, VBT {selectedSubject} {selectedGrade.replace(/lớp\s*/i, '').trim() || '3'}, vở ghi, dụng cụ học tập.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableTools.map((tool) => {
                    const isSelected = selectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleTool(tool)}
                        className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border flex items-center gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 scale-102' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-250'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        {tool}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={customTools}
                  onChange={(e) => setCustomTools(e.target.value)}
                  placeholder="Nhập thêm thiết bị giáo cụ phát sinh khác..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </>
            )}
          </div>

          {/* 2 Side-by-Side Cards: Tech Tools & Educational Games */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Column Left: Ứng dụng công nghệ số */}
            <div className="border border-purple-100 rounded-2xl p-4 bg-purple-50/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-purple-600" />
                  Ứng dụng công nghệ số
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-purple-700">AI tự đề xuất</span>
                  <button
                    type="button"
                    onClick={() => setAiAutoTech(!aiAutoTech)}
                    className="focus:outline-none cursor-pointer"
                    title={aiAutoTech ? "Tắt AI tự đề xuất" : "Bật AI tự đề xuất"}
                  >
                    {aiAutoTech ? (
                      <div className="bg-purple-600 text-white p-0.5 rounded-full flex items-center justify-end w-10.5 h-5.5 transition-all">
                        <span className="text-[8.5px] font-black pr-1 select-none scale-90">BẬT</span>
                        <div className="bg-white w-4.2 h-4.2 rounded-full shadow-sm" />
                      </div>
                    ) : (
                      <div className="bg-slate-300 text-slate-600 p-0.5 rounded-full flex items-center justify-start w-10.5 h-5.5 transition-all">
                        <div className="bg-white w-4.2 h-4.2 rounded-full shadow-sm" />
                        <span className="text-[8.5px] font-black pl-1 select-none scale-90">TẮT</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {aiAutoTech ? (
                <div className="p-3 bg-purple-50/90 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-purple-800">Công cụ AI Flash 3 preview tự động phân tích & đề xuất:</p>
                    <p className="text-[11.5px] text-purple-900 leading-relaxed">
                      Dựa vào <strong className="text-purple-950 font-bold">"Tài liệu đính kèm minh họa"</strong> hoặc <strong className="text-purple-950 font-bold">"Tra cứu trang taphuan.nxbgd.vn"</strong> (ưu tiên <strong className="text-purple-950 font-bold">"Tài liệu đính kèm minh họa"</strong> nếu có) để đưa ra các ứng dụng công nghệ số phù hợp (Kahoot, Quizizz, Padlet, Canva, Wordwall, GeoGebra và nhiều ứng dụng khác) để tích hợp vào hoạt động của giáo án (<strong className="text-purple-950 font-bold">không thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC"</strong>). Tên ứng dụng trong bảng <strong className="text-purple-950 font-bold">"KẾT QUẢ KẾ HOẠCH BÀI DẠY"</strong> có định dạng chữ đậm và được để trong " ". Ví dụ: <strong className="text-purple-950 font-bold">"Wordwall"</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea
                    value={techInputs}
                    onChange={(e) => setTechInputs(e.target.value)}
                    placeholder="Nhập tên ứng dụng hoặc trang web ứng dụng (VD: Kahoot, Quizizz, Padlet, Canva, Liveworksheets, Wordwall, GeoGebra...)"
                    className="w-full h-24 p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 resize-none font-mono"
                  />
                  <p className="text-[10.5px] text-purple-700 leading-relaxed font-semibold">
                    💡 Công cụ AI Flash 3 preview sẽ dựa vào <strong className="font-bold">"Tài liệu đính kèm minh họa"</strong> hoặc <strong className="font-bold">"Tra cứu trang taphuan.nxbgd.vn"</strong> (ưu tiên tài liệu đính kèm nếu có) để đưa <strong className="font-bold">"Tên ứng dụng hoặc trang web ứng dụng"</strong> bạn đã nhập tích hợp vào hoạt động của giáo án (<strong className="font-bold">không thêm vào mục "II. ĐỒ DÙNG DẠY HỌC"</strong>). Tên ứng dụng trong bảng <strong className="font-bold">"KẾT QUẢ KẾ HOẠCH BÀI DẠY"</strong> có định dạng chữ đậm và được để trong " ". Ví dụ: <strong className="font-bold">"Wordwall"</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Column Right: Kết hợp trò chơi học tập */}
            <div className="border border-orange-100 rounded-2xl p-4 bg-orange-50/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-900 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-orange-650" />
                  Kết hợp trò chơi học tập
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-orange-800">AI tự đề xuất</span>
                  <button
                    type="button"
                    onClick={() => setAiAutoGames(!aiAutoGames)}
                    className="focus:outline-none cursor-pointer"
                    title={aiAutoGames ? "Tắt AI tự đề xuất" : "Bật AI tự đề xuất"}
                  >
                    {aiAutoGames ? (
                      <div className="bg-[#2454A6] text-white p-0.5 rounded-full flex items-center justify-end w-10.5 h-5.5 transition-all">
                        <span className="text-[8.5px] font-black pr-1 select-none scale-90">BẬT</span>
                        <div className="bg-white w-4.2 h-4.2 rounded-full shadow-sm" />
                      </div>
                    ) : (
                      <div className="bg-slate-300 text-slate-600 p-0.5 rounded-full flex items-center justify-start w-10.5 h-5.5 transition-all">
                        <div className="bg-white w-4.2 h-4.2 rounded-full shadow-sm" />
                        <span className="text-[8.5px] font-black pl-1 select-none scale-90">TẮT</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {aiAutoGames ? (
                <div className="p-3 bg-orange-50/90 border border-orange-200 rounded-xl text-xs text-orange-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-orange-800">Công cụ AI Flash 3 preview tự động phân tích & đề xuất:</p>
                    <p className="text-[11.5px] text-orange-900 leading-relaxed">
                      Dựa vào <strong className="text-orange-950 font-bold">"Tài liệu đính kèm minh họa"</strong> hoặc <strong className="text-orange-950 font-bold">"Tra cứu trang taphuan.nxbgd.vn"</strong> (ưu tiên <strong className="text-orange-950 font-bold">"Tài liệu đính kèm minh họa"</strong> nếu có) để đưa ra các trò chơi học tập phù hợp (Ai nhanh hơn, Rung chuông vàng, Hộp quà bí mật, Mảnh ghép kì diệu và nhiều trò chơi khác) để tích hợp vào hoạt động của giáo án (<strong className="text-orange-950 font-bold">không thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC"</strong>). Tên trò chơi trong bảng <strong className="text-orange-950 font-bold">"KẾT QUẢ KẾ HOẠCH BÀI DẠY"</strong> có định dạng chữ đậm và được để trong " ". Ví dụ: <strong className="text-orange-950 font-bold">"Ai nhanh hơn"</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea
                    value={gameInputs}
                    onChange={(e) => setGameInputs(e.target.value)}
                    placeholder="Nhập tên trò chơi hoặc mô tả trò chơi (VD: Trò chơi 'Ai nhanh hơn', 'Rung chuông vàng', 'Hộp quà bí mật', 'Mảnh ghép kì diệu'...)"
                    className="w-full h-24 p-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-650 resize-none font-mono"
                  />
                  <p className="text-[10.5px] text-orange-800 leading-relaxed font-semibold">
                    💡 Công cụ AI Flash 3 preview sẽ dựa vào <strong className="font-bold">"Tài liệu đính kèm minh họa"</strong> hoặc <strong className="font-bold">"Tra cứu trang taphuan.nxbgd.vn"</strong> (ưu tiên tài liệu đính kèm nếu có) để đưa <strong className="font-bold">"Tên trò chơi hoặc Mô tả trò chơi"</strong> bạn đã nhập tích hợp vào hoạt động của giáo án (<strong className="font-bold">không thêm vào mục "II. ĐỒ DÙNG DẠY HỌC"</strong>). Tên trò chơi trong bảng <strong className="font-bold">"KẾT QUẢ KẾ HOẠCH BÀI DẠY"</strong> có định dạng chữ đậm và được để trong " ". Ví dụ: <strong className="font-bold">"Ai nhanh hơn"</strong>.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Phương pháp dạy học tag selection */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                🏫 Phương pháp sư phạm
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-600">AI tự đề xuất</span>
                <button
                  type="button"
                  onClick={() => setAiAutoMethods(!aiAutoMethods)}
                  className="focus:outline-none cursor-pointer"
                  title={aiAutoMethods ? "Tắt AI tự đề xuất" : "Bật AI tự đề xuất"}
                >
                  {aiAutoMethods ? (
                    <div className="bg-[#2454A6] text-white p-0.5 rounded-full flex items-center justify-end w-12 h-6 transition-all">
                      <span className="text-[9px] font-mono font-black pr-1 select-none text-[8.5px]">BẬT</span>
                      <div className="bg-white w-4.5 h-4.5 rounded-full shadow-sm" />
                    </div>
                  ) : (
                    <div className="bg-slate-300 text-slate-600 p-0.5 rounded-full flex items-center justify-start w-12 h-6 transition-all">
                      <div className="bg-white w-4.5 h-4.5 rounded-full shadow-sm" />
                      <span className="text-[9px] font-mono font-black pl-1 select-none text-[8.5px]">TẮT</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {aiAutoMethods ? (
              <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2454A6] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[#2454A6]">Công cụ AI Flash 3 preview tự động phân tích & đề xuất:</p>
                  <p className="text-[11.5px] text-blue-800 leading-relaxed">
                    Dựa vào <strong className="text-blue-950 font-bold">"Tài liệu đính kèm minh họa"</strong> hoặc <strong className="text-blue-950 font-bold">"Tra cứu trang taphuan.nxbgd.vn"</strong> (ưu tiên <strong className="text-blue-950 font-bold">"Tài liệu đính kèm minh họa"</strong> nếu có) để đưa ra các phương pháp sư phạm phù hợp nhất với giáo án của bài học đó.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11.5px] text-slate-600 leading-relaxed font-semibold">
                  Khi chọn các tùy chọn thì công cụ AI Flash 3 preview sẽ tích hợp các phương pháp sư phạm đó vào các <strong className="text-slate-800 font-bold">"Hoạt động dạy học"</strong> trong giáo án phù hợp nhất:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {availableMethods.map((m) => {
                    const isSelected = selectedMethods.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMethod(m)}
                        className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border flex items-center gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300 scale-102' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-250'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        {m}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={customMethods}
                  onChange={(e) => setCustomMethods(e.target.value)}
                  placeholder="Nhập thêm phương pháp sư phạm sáng tạo phát sinh khác..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Lesson Content details outline text area with taphuan.nxbgd.vn helper block */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 label-section">
              <label className="block text-xs font-black text-slate-700 normal-case flex items-center gap-1.5">
                <span>Nội dung cốt lõi của bài học (Yêu cầu cụ thể của Thầy Cô)</span>
                {lookupSourceBadge && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    ✓ Chuẩn taphuan.nxbgd.vn
                  </span>
                )}
              </label>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleLookupObjectives(undefined, false)}
                  disabled={isLookingUpObjectives}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-[#2454A6] hover:bg-[#1b4080] disabled:bg-slate-300 px-2.5 py-1 rounded-lg transition-all shadow-sm cursor-pointer"
                  title="Tự động tra cứu mục tiêu 'Sau bài học này em sẽ' từ taphuan.nxbgd.vn"
                >
                  {isLookingUpObjectives ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang tra cứu...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tra cứu taphuan.nxbgd.vn</span>
                    </>
                  )}
                </button>

                <a 
                  href="https://taphuan.nxbgd.vn/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 text-[10.5px] font-black text-[#2454A6] hover:underline bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-all w-fit"
                >
                  Mở SGK ↗
                </a>
              </div>
            </div>

            <textarea
              id="core-lesson-content-input"
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Nhập nội dung bài học, lí thuyết khái niệm trọng tâm hoặc chỉ tiêu SGK cụ thể cần AI soạn bám sát chi tiết..."
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6] resize-y"
            />
          </div>

          </div> {/* Closing Left Panel bg-white rounded-[32px] ... */}

          {/* Right Panel: Multimedia Snapshots & Administrative Guidance */}
          <div className="space-y-6 w-full">
            
            {/* Attached documents (SGK/Ảnh giáo án cũ) zone */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4 text-left">
              <label className="block text-xs font-black text-slate-700 normal-case">
                Tài liệu đính kèm minh họa (Ảnh SGK, PPT, Word mẫu, PDF SGK)
              </label>
              
              <div className="bg-sky-50 text-slate-750 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 border border-sky-150">
                <Info className="w-4.5 h-4.5 text-sky-600 shrink-0 mt-0.5" />
                <span>Thầy Cô nên tải lên Ảnh chụp trang sách khoa hoặc dàn ý sơ bộ để AI thiết lập bám sát tốt nhất!</span>
              </div>

              {/* Drag drop box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDragging 
                    ? 'bg-[#F3F6FD]/70 border-[#2454A6]' 
                    : 'bg-white border-slate-205 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-7 h-7 text-[#2ba0ee] animate-bounce" />
                <div className="text-center">
                  <p className="text-xs font-black text-slate-700">Nhấn hoặc kéo thả tệp trang sách tại đây</p>
                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">PNG, JPG, PDF tối đa 8MB (Nhiều tệp một lúc)</p>
                </div>
              </div>

              {/* List of files */}
              {attachedFiles.length > 0 && (
                <div className="grid grid-cols-1 gap-2 pt-1 animate-fade-in">
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-[#F3F6FD]/80 border border-blue-150 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#2454A6] shrink-0" />
                        <div className="truncate text-left text-[11px] font-black text-slate-800">
                          <p className="truncate leading-tight">{f.name}</p>
                          <p className="text-[9.5px] text-gray-400 font-bold">{f.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeAttachedFile(i); }}
                        className="text-rose-500 hover:text-rose-600 p-1.5 focus:outline-none hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons footer inside form */}
            <div className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
              {/* Collapsible Gemini API Key panel to prevent 429 quota exhaustion */}
              <div className="border border-indigo-100 rounded-2xl p-4 bg-slate-50/60 max-w-full text-left space-y-1">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="flex items-center gap-2 text-xs font-black text-indigo-900 hover:text-indigo-750 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#eab308] animate-pulse shrink-0" />
                    <span>{personalApiKey ? '🔑 Đã lưu Gemini API Key cá nhân' : '🔑 Khai báo Gemini API Key cá nhân (Tránh lỗi nghẽn 429)'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${showKeyInput ? 'rotate-180' : ''}`} />
                  </button>
                  {personalApiKey && !showKeyInput && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">Đang hoạt động</span>
                  )}
                </div>
                {showKeyInput ? (
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={personalApiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPersonalApiKey(val);
                          localStorage.setItem('personal_gemini_api_key', val);
                        }}
                        placeholder="Nhập khóa API Gemini của riêng thầy/cô (ví dụ: AIzaSy...)"
                        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-indigo-400 text-xs"
                      />
                      {personalApiKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setPersonalApiKey('');
                            localStorage.removeItem('personal_gemini_api_key');
                          }}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-150 text-[#e11d48] border border-red-200 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <p className="text-[10.5px] text-zinc-550 font-medium leading-relaxed">
                      * Khóa API cá nhân này được lưu hoàn toàn bảo mật tại trình duyệt của thầy cô. Quý Thầy/Cô có thể tạo khóa hoàn toàn miễn phí chỉ trong 20 giây:
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-650 hover:underline font-extrabold ml-1 inline-flex items-center gap-0.5"
                      >
                        Lấy Khóa API Miễn Phí (Google AI Studio) ↗
                      </a>
                    </p>
                  </div>
                ) : !personalApiKey ? (
                  <p className="text-[10px] text-zinc-400 font-medium pl-6 leading-relaxed">
                    * AI dệt giáo án dùng chung hệ thống có thể bị chậm hay báo quá tải giờ cao điểm. Quý Thầy Cô nên lấy API Key miễn phí tự khai báo để bẻ gãy mọi giới hạn.
                  </p>
                ) : null}
              </div>

              {generationError && (
                <div id="lesson-planner-api-error-alert" className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left space-y-2 mb-2">
                  <div className="flex items-start gap-2 text-red-700">
                    <span className="text-lg shrink-0">⚠️</span>
                    <div className="space-y-1">
                      <h5 className="text-xs font-black">XẢY RA SỰ CỐ KHI GỌI CO-PILOT AI</h5>
                      <p className="text-[11px] leading-relaxed font-semibold text-red-650">{generationError}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 border border-red-100 rounded-xl p-3 space-y-2.5 mt-2">
                    <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">
                      Đường truyền thử nghiệm miễn phí dùng chung hiện tại đã tạm thời kẹt hoặc hết lượt gọi trong ngày. Thầy Cô có thể lấy một <strong>Khóa API Gemini cá nhân hoàn toàn miễn phí</strong> từ Google AI Studio trong 20 giây để dán trực tiếp vào đây để tiếp tục tạo học liệu không giới hạn:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={personalApiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPersonalApiKey(val);
                          localStorage.setItem('personal_gemini_api_key', val);
                        }}
                        placeholder="Dán Khóa API Gemini tại đây (AIzaSy...)"
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-red-450 text-[11px] text-slate-750 placeholder-slate-400"
                      />
                      {personalApiKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setPersonalApiKey('');
                            localStorage.removeItem('personal_gemini_api_key');
                          }}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-[#e11d48] border border-red-200 rounded-lg text-[10.5px] font-bold cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-650 hover:underline font-extrabold inline-flex items-center gap-0.5"
                      >
                        Lấy Khóa API Miễn Phí của Thầy Cô ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => setGenerationError(null)}
                        className="text-slate-500 hover:text-slate-800 font-bold"
                      >
                        Đóng thông báo ×
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-205 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm lại
                </button>
                
                {plannerTab === 'gdpt2018' ? (
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleGeneratePlan('gdpt2018')}
                    className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-b-4 border-indigo-900 hover:brightness-105 active:border-b-0 disabled:opacity-50 shadow-md transition"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
                    🎓 Tạo Kế hoạch bài dạy GDPT 2018 (Gemini Flash 3)
                  </button>
                ) : plannerTab === 'detailed' ? (
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleGeneratePlan('detailed')}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#2454A6] via-blue-600 to-indigo-600 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-b-4 border-[#1b3d79] hover:brightness-105 active:border-b-0 disabled:opacity-50 shadow-md transition"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
                    ✨ Tạo giáo án chi tiết (Chuẩn 2 vai chia cột)
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleGeneratePlan('basic')}
                    className="flex-1 py-3.5 bg-gradient-to-r from-teal-600 to-[#10b981] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-b-4 border-emerald-700 hover:brightness-105 active:border-b-0 disabled:opacity-50 shadow-md transition"
                  >
                    <BookOpen className="w-5 h-5 text-yellow-200" />
                    📝 Tạo giáo án cơ bản (Bám sát SGK)
                  </button>
                )}
              </div>

              {/* Descriptions block */}
              {plannerTab !== 'gdpt2018' && (
                <div className="pt-2 border-t border-slate-100/50 text-[11px] text-slate-500 leading-normal">
                  {plannerTab === 'basic' ? (
                    <div className="flex items-start gap-2.5 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60">
                      <span className="w-2 h-2 rounded-full bg-teal-500 mt-1 shrink-0" />
                      <div>
                        <strong className="text-teal-900 block mb-0.5 font-black">Giáo án cơ bản:</strong>
                        <span className="text-slate-650">Bám sát 100% file tài liệu đính kèm minh họa. Đầy đủ các tiết (Tiết 2 có đầy đủ các mục, hoạt động như Tiết 1). Mỗi tiết gồm đúng <strong>4 hoạt động chuẩn</strong> có thời gian cụ thể: <em>1. Khởi động - * (5 phút); 2. Khám phá - * (18 phút); 3. Luyện tập - * (7 phút); 4. Vận dụng - * (5 phút)</em>. Bảng 2 cột chuẩn Công văn 2345 (GV 55%, HS 45%), tiêu đề "Tin học - Lớp 3", "Bài 1. ... (Tiết 1)", và "IV. ĐIỀU CHỈNH SAU BÀI DẠY".</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 bg-blue-50/40 p-3 rounded-xl border border-blue-100/60">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div>
                        <strong className="text-blue-900 block mb-0.5 font-black">Giáo án chi tiết:</strong>
                        <span className="text-slate-650">Đầy đủ các bước, phân rã kịch bản chi tiết 2 vai đối thoại song hành giữa <strong>Giáo viên & Học sinh</strong> (máy tự chia cấu trúc 2 cột), phục vụ dự giờ, thao giảng giáo viên dạy giỏi.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
      )}

      {/* Real-time Loader Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-950/85 z-[999] flex flex-col items-center justify-center p-6 text-center animate-fade-in backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-emerald-500 animate-spin" />
              <Sparkles className="w-8 h-8 text-yellow-300 absolute animate-bounce" />
            </div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Hệ thống AI đang khởi dựng...</h4>
            
            <div className="space-y-1 w-full text-left">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 tracking-wider">
                <span>TIẾN ĐỘ ĐỐI CHIẾU SGK KẾT NỐI TRI THỨC:</span>
                <span className="text-emerald-400 text-xs font-black">{generationPercent}%</span>
              </div>
              <div className="h-3 w-full bg-slate-950/80 p-0.5 rounded-full border border-slate-800 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#2454A6] via-[#10B981] to-[#FBBF24] h-full rounded-full transition-all duration-300 shadow-md"
                  style={{ width: `${generationPercent}%` }}
                />
              </div>
            </div>

            <p className="text-[11.5px] text-emerald-400 font-mono font-bold leading-normal">{generationStep}</p>
            <p className="text-[10px] text-gray-500">Học liệu taphuan.nxbgd.vn và SGK đang được liên thông hoàn thiện.</p>
          </div>
        </div>
      )}

      {/* Spectacular Generated Result Modal (When showResultModal is true) */}
      <AnimatePresence>
        {showResultModal && (
          <div className="fixed inset-0 bg-slate-950/75 z-[9990] flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border rounded-[32px] shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden text-slate-800"
            >
              {/* Header bar */}
              <div className="bg-gradient-to-r from-[#2454A6] to-[#10b981] p-5 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider">KẾT QUẢ KẾ HOẠCH BÀI DẠY</span>
                    <h3 className="text-base font-black leading-tight">
                      {((plannerTab === 'gdpt2018' || currentPlanIsGDPT2018) ? 'Giáo án GDPT 2018: ' : 'Giáo án Chuẩn 2345: ')}
                      {(() => {
                        let clean = (lessonTitle || '').trim()
                          .replace(/^Bài\s*dạy\s*:\s*/i, '')
                          .replace(/\s*-\s*Số\s*tiết\s*:\s*.*$/i, '')
                          .replace(/\s*\((?:TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*\d*\)/gi, '')
                          .trim();
                        if (!clean) return 'Kế hoạch bài dạy';
                        const is1Tiet = lessonDuration.toLowerCase().includes('1 tiết') || lessonDuration.trim() === '1' || (lessonDuration.includes('1') && !lessonDuration.includes('2') && !lessonDuration.includes('3'));
                        const isGDPT = plannerTab === 'gdpt2018' || currentPlanIsGDPT2018;
                        if (isGDPT) {
                          const baiMatch = clean.match(/^(Bài\s*\d+)[\.:\s]+(.*)$/i);
                          let formatted = clean;
                          if (baiMatch) {
                            formatted = `${baiMatch[1]}: ${baiMatch[2].trim()}`;
                          } else if (clean.toLowerCase().includes("thông tin") && clean.toLowerCase().includes("quyết định")) {
                            formatted = `Bài 1: ${clean}`;
                          } else if (clean.toLowerCase().includes("xử lý thông tin")) {
                            formatted = `Bài 2: ${clean}`;
                          }
                          formatted = formatted.toUpperCase();
                          return is1Tiet ? `${formatted} (1 TIẾT)` : `${formatted} (TIẾT 1)`;
                        }
                        return is1Tiet ? `${clean} (1 TIẾT)` : clean;
                      })()}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Split layout: 65% preview / 35% compliance audit */}
              {(() => {
                const compResult = checkTaphuanCompliance(editablePlanText, lessonTitle, selectedSubject, selectedGrade, layoutExcludeSubActivities);
                return (
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
                    {/* Left section: Document Preview / Editorial Sheets */}
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 border-r border-slate-200">
                      {/* Visual Actions Toolbar right above preview area */}
                      <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          {/* Undo / Redo buttons */}
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mr-2">
                            <button
                              type="button"
                              onClick={handleUndo}
                              disabled={undoStack.length <= 1}
                              title="Hoàn tác chỉnh sửa (Undo)"
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                undoStack.length > 1
                                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95 shadow-xs'
                                  : 'bg-slate-100 text-slate-350 border-transparent cursor-not-allowed'
                              }`}
                            >
                              <Undo className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleRedo}
                              disabled={redoStack.length === 0}
                              title="Khôi phục thao tác (Redo)"
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                redoStack.length > 0
                                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95 shadow-xs'
                                  : 'bg-slate-100 text-slate-350 border-transparent cursor-not-allowed'
                              }`}
                            >
                              <Undo className="w-3.5 h-3.5 scale-x-[-1]" />
                            </button>
                          </div>

                          <div className="text-xs font-black text-slate-600">
                            ✍️ Trình biên soạn trực tiếp, trực quan trên trang (nhấp vào chữ bên dưới để sửa)
                          </div>
                        </div>

                        <div className="text-[10px] font-black text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span>KIỂM ĐỊNH TỰ ĐỘNG</span>
                        </div>
                      </div>

                      <div className="flex-1 p-5 md:p-6 overflow-y-auto text-left scrollbar-thin bg-slate-100">
                        <div 
                          ref={editorRef}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onInput={handleEditorInput}
                          className="bg-white border border-slate-200 p-8 md:p-12 rounded-[24px] shadow-sm text-slate-950 select-text outline-none focus:outline-none min-h-[600px]" 
                          style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: (plannerTab === 'gdpt2018' || currentPlanIsGDPT2018) ? '14pt' : '13pt', lineHeight: '1.45' }}
                          dangerouslySetInnerHTML={{ __html: visualHtmlContent }}
                        />
                      </div>
                    </div>

                    {/* Right section: taphuan.nxbgd.vn Compliance Auditor (Hidden in GDPT 2018 tab) */}
                    {(plannerTab !== 'gdpt2018' && !currentPlanIsGDPT2018) && (
                    <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
                      {/* Sidebar title */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <h4 className="text-[11px] font-black tracking-widest text-[#2454A6] uppercase">ĐỐI CHIẾU TAPHUAN.NXBGD.VN</h4>
                          </div>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">HỌC LIỆU CHUẨN</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">
                          Cơ chế kiểm soát thông minh đối chiếu với dữ liệu chương trình sách hiện hành Kết nối tri thức.
                        </p>
                      </div>

                      {/* Compliance circle gauge */}
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                          {/* Circle indicator */}
                          <svg className="w-14 h-14 transform -rotate-90">
                            <circle cx="28" cy="28" r="24" className="stroke-slate-200 fill-none stroke-[4]" />
                            <circle 
                              cx="28" 
                              cy="28" 
                              r="24" 
                              className="fill-none stroke-[4] transition-all duration-500" 
                              strokeDasharray={2 * Math.PI * 24}
                              strokeDashoffset={2 * Math.PI * 24 * (1 - compResult.score / 100)}
                              strokeLinecap="round"
                              style={{
                                stroke: compResult.score >= 85 ? '#10b981' : compResult.score >= 60 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </svg>
                          <span className="absolute font-black text-xs text-slate-900">{compResult.score}%</span>
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-[9px] font-extrabold text-slate-400 uppercase">ĐỦ TIÊU CHUẨN KNTT</div>
                          <div className="text-[12.5px] font-black text-slate-850 leading-tight">
                            {compResult.score >= 85 
                              ? '🏆 Giáo án đạt chuẩn Xuất sắc' 
                              : compResult.score >= 60 
                                ? '⚠️ Cần điều chỉnh một số ý' 
                                : '🚨 Cảnh báo lệch chuẩn!'}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                            {compResult.score >= 85 
                              ? 'Giáo án tuân thủ hoàn hảo CV 2345 và chuẩn học liệu taphuan.nxbgd.vn.'
                              : 'Vui lòng bổ sung hoặc điều chỉnh theo các khuyến nghị để tránh lệch lạc.'}
                          </p>
                        </div>
                      </div>

                      {/* Items audit list */}
                      <div className="flex-1 p-4 space-y-3">
                        {compResult.details.map((item) => (
                          <div 
                            key={item.id} 
                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 text-[11px] transition-all ${
                              item.passed 
                                ? 'bg-emerald-50/20 border-emerald-100/70 text-slate-700' 
                                : 'bg-amber-50/35 border-amber-200/50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-extrabold text-slate-800 leading-snug">{item.title}</span>
                              {item.passed ? (
                                <span className="text-[8.5px] font-black uppercase text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded shrink-0">HỢP CHUẨN</span>
                              ) : (
                                <span className="text-[8.5px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">CẢNH BÁO LỆCH LẠC</span>
                              )}
                            </div>
                            <p className="text-slate-650 text-[10.5px] leading-normal font-normal mt-0.5">{item.message}</p>
                            {!item.passed && (
                              <div className="mt-2 space-y-1.5">
                                <div className="p-2 bg-amber-150/40 border border-amber-200/50 rounded-lg text-[10px] text-amber-900 leading-normal font-semibold">
                                  <span className="font-bold">💡 Khắc phục học liệu: </span>
                                  {item.suggestion}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleQuickFixRule(item.id)}
                                  className="w-full py-1.5 bg-[#2454A6] hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition shadow-xs flex items-center justify-center gap-1 uppercase tracking-wider"
                                >
                                  ⚡ Sửa nhanh
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Sidebar Footer help reference */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                        <a 
                          href="https://taphuan.nxbgd.vn" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-blue-600 hover:underline font-extrabold inline-flex items-center justify-center gap-1"
                        >
                          <span>Tra cứu sách giáo khoa tại taphuan.nxbgd.vn</span>
                          <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                        </a>
                      </div>
                    </div>
                    )}
                  </div>
                );
              })()}

              {/* Footer controllers */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadDoc}
                  className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition border-b-4 border-emerald-800 active:border-b-0 active:translate-y-0.5"
                >
                  <FileDown className="w-4 h-4 stroke-[3]" />
                  Xuất file Word (.doc)
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
