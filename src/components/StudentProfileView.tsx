import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trophy, 
  BookOpen, 
  ClipboardCheck, 
  Award, 
  TrendingUp, 
  Play, 
  User, 
  Calendar,
  PenTool,
  Save,
  PlusCircle,
  Trash2,
  Trash,
  Gift
} from 'lucide-react';
import { generateStudentExamPDFHtml, printExamPDF } from '../utils/pdfGenerator';
import { StudentProfile, INITIAL_BADGES, Badge, SHARED_AVATAR_POOL, AvatarOption, LeaderboardEntry, ShopItem, Level } from '../types';
import { INITIAL_SHOP_ITEMS } from '../App';

interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  mood: string;
  content: string;
  colorIndex: number; // 0: Blue, 1: Red, 2: Yellow, 3: Green, 4: Purple
  mediaUrl?: string; // image path or video path
  mediaType?: 'image' | 'video';
  tags?: string[];
}

interface StudentProfileViewProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile | null>>;
  onSelectTab: (tab: string) => void;
  triggerToast: (msg: string) => void;
  purchasedRewards?: string[];
  initialNestedTab?: string;
  setInitialNestedTab?: (tab: string) => void;
  badgesList?: Badge[];
  shopItemsList?: ShopItem[];
  levelsList?: Level[];
}

export default function StudentProfileView({ 
  profile, 
  setProfile, 
  onSelectTab, 
  triggerToast,
  purchasedRewards = [],
  initialNestedTab,
  setInitialNestedTab,
  badgesList,
  shopItemsList,
  levelsList
}: StudentProfileViewProps) {
  // Nested Tabs inside Student View: 'progress' | 'badges' | 'ranks' | 'info' | 'diary'
  const [nestedTab, setNestedTab] = useState<string>(initialNestedTab || 'progress');

  const totalSpentXP = (purchasedRewards || []).reduce((sum, id) => {
    const item = (shopItemsList || INITIAL_SHOP_ITEMS).find(s => s.id === id);
    return sum + (item ? item.cost : 0);
  }, 0);
  const totalCollectedXP = profile.xp + totalSpentXP;
  const badgesCount = (badgesList || INITIAL_BADGES).filter(b => totalCollectedXP >= b.xpRequired).length;

  // Sync state if initialNestedTab changes from parent
  useEffect(() => {
    if (initialNestedTab && initialNestedTab !== nestedTab) {
      setNestedTab(initialNestedTab);
    }
  }, [initialNestedTab]);

  // Sync back to parent when nestedTab changes internally
  useEffect(() => {
    if (setInitialNestedTab && nestedTab !== initialNestedTab) {
      setInitialNestedTab(nestedTab);
    }
  }, [nestedTab, setInitialNestedTab, initialNestedTab]);

  // Custom Exams and Results states for Studen Online Practice
  const [customExams, setCustomExams] = useState<any[]>([]);
  const [personalExamResults, setPersonalExamResults] = useState<any[]>([]);

  // Active test runner states
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(600); // 10 minutes
  const [examTimerOn, setExamTimerOn] = useState(false);

  useEffect(() => {
    // Load existing or seed default exams
    const storedExams = localStorage.getItem('lms_custom_exams');
    let exams: any[] = [];
    if (storedExams) {
      try {
        exams = JSON.parse(storedExams);
      } catch (err) {
        exams = [];
      }
    }
    
    // Seed default if empty
    if (exams.length === 0) {
      exams = [
        {
          id: 'exam-seed-1',
          testName: 'Đề ôn tập Bài 1: Thông tin và Quyết định (Lớp 3)',
          subject: 'Tin học',
          grade: 3,
          curriculumBook: 'Kết nối tri thức với cuộc sống',
          questions: [
            {
              id: 'q-s1',
              type: 'multiple_choice',
              difficulty: 'Nhận biết',
              questionText: 'Những điều giúp ta hiểu biết về sự vật, hiện tượng được gọi là gì?',
              options: ['Quyết định', 'Thông tin', 'Hành động', 'Suy nghĩ'],
              correctAnswer: 'B',
              points: 2.5,
              answerGuide: 'Thông tin là những điều giúp ta hiểu biết về sự vật, hiện tượng xung quanh và về chính mình.'
            },
            {
              id: 'q-s2',
              type: 'multiple_choice',
              difficulty: 'Nhận biết',
              questionText: 'Bộ phận nào giúp con người nhận biết thế giới xung quanh?',
              options: ['Giác quan', 'Chân tay', 'Quần áo', 'Sách vở'],
              correctAnswer: 'A',
              points: 2.5,
              answerGuide: 'Con người nhận biết thế giới xung quanh thông qua các năm giác quan như mắt, tai, mũi...'
            },
            {
              id: 'q-s3',
              type: 'multiple_choice',
              difficulty: 'Thông hiểu',
              questionText: 'Để thu thập thông tin bằng cách nhìn, chúng ta sử dụng giác quan nào?',
              options: ['Tai', 'Mũi', 'Mắt', 'Lưỡi'],
              correctAnswer: 'C',
              points: 2.5,
              answerGuide: 'Mắt giúp quan sát hình ảnh màu sắc xung quanh.'
            },
            {
              id: 'q-s4',
              type: 'multiple_choice',
              difficulty: 'Vận dụng',
              questionText: 'Khi thấy đèn tín hiệu giao thông cho người đi bộ chuyển sang màu đỏ, em quyết định làm gì?',
              options: ['Chạy thật nhanh qua đường', 'Dừng lại chờ đèn xanh', 'Đi bộ từ từ qua đường', 'Quay đầu xe chạy lại'],
              correctAnswer: 'B',
              points: 2.5,
              answerGuide: 'Đèn đỏ báo hiệu dừng lại để đi bộ qua đường an toàn.'
            }
          ],
          matrixTotalScore: 10,
          mcCount: 4,
          essayCount: 0,
          createdAt: '12/06/2026'
        },
        {
          id: 'exam-seed-2',
          testName: 'Đề trắc nghiệm 15 phút Bài 3: Máy tính và em (Lớp 3)',
          subject: 'Tin học',
          grade: 3,
          curriculumBook: 'Cánh Diều',
          questions: [
            {
              id: 'q-s2-1',
              type: 'multiple_choice',
              difficulty: 'Nhận biết',
              questionText: 'Thành phần nào được ví như bộ não điều khiển mọi hoạt động của máy tính?',
              options: ['Màn hình', 'Bàn phím', 'Thân máy (CPU)', 'Chuột'],
              correctAnswer: 'C',
              points: 2.5,
              answerGuide: 'Thân máy chứa bộ vi xử lý thực hiện mọi tính toán và điều khiển hoạt động.'
            },
            {
              id: 'q-s2-2',
              type: 'multiple_choice',
              difficulty: 'Nhận biết',
              questionText: 'Thiết bị nào sau đây dùng để nhập thông tin hoặc văn bản vào máy tính?',
              options: ['Màn hình', 'Loa', 'Bàn phím', 'Trình thám hiểm'],
              correctAnswer: 'C',
              points: 2.5,
              answerGuide: 'Bàn phím dùng để nhập các ký tự chữ số vào máy tính.'
            },
            {
              id: 'q-s2-3',
              type: 'multiple_choice',
              difficulty: 'Thông hiểu',
              questionText: 'Màn hình máy tính có chức năng gì?',
              options: ['Xử lý thông tin', 'Hiển thị kết quả hình ảnh, chữ viết', 'Nhập dữ liệu điều khiển', 'Lưu trữ thông tin vĩnh viễn'],
              correctAnswer: 'B',
              points: 2.5,
              answerGuide: 'Màn hình dùng hiển thị thông tin trả về từ hệ điều hành.'
            },
            {
              id: 'q-s2-4',
              type: 'multiple_choice',
              difficulty: 'Vận dụng',
              questionText: 'Trước khi bắt đầu làm việc hoặc học tập trên máy tính để bàn, bộ phận nào giúp em di chuyển con trỏ trên màn hình?',
              options: ['Phím cách', 'Thân máy', 'Màn hình', 'Con chuột'],
              correctAnswer: 'D',
              points: 2.5,
              answerGuide: 'Chuột giúp di chuyển và ra lệnh điều hướng con trỏ.'
            }
          ],
          matrixTotalScore: 10,
          mcCount: 4,
          essayCount: 0,
          createdAt: '11/06/2026'
        }
      ];
      localStorage.setItem('lms_custom_exams', JSON.stringify(exams));
    }
    setCustomExams(exams);

    // Load test results
    const storedResults = localStorage.getItem('lms_personal_exam_results');
    if (storedResults) {
      try {
        setPersonalExamResults(JSON.parse(storedResults));
      } catch (e) {
        setPersonalExamResults([]);
      }
    }
  }, []);

  const handleStartExam = (exam: any) => {
    setActiveExam(exam);
    setStudentAnswers({});
    setExamSubmitted(false);
    setExamTimeLeft(600);
    setExamTimerOn(true);
    triggerToast(`🏁 Bắt đầu làm bài thi: ${exam.testName}!`);
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    
    setExamSubmitted(true);
    setExamTimerOn(false);

    // Calculate score
    let correctCount = 0;
    activeExam.questions.forEach((q: any) => {
      const isMc = q.type === 'multiple_choice';
      if (isMc) {
        if (studentAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      } else {
        if (studentAnswers[q.id] && studentAnswers[q.id].trim().length > 3) {
          correctCount++;
        }
      }
    });

    const finalScore = Number(((correctCount / (activeExam.questions.length || 1)) * 10).toFixed(2));
    const xpReward = Math.round(finalScore * 10);

    // Save result log
    const resultRecord = {
      id: `res-${Date.now()}`,
      testId: activeExam.id,
      testName: activeExam.testName,
      subject: activeExam.subject || "Tin học",
      grade: activeExam.grade || 3,
      studentName: profile.fullname || "Học sinh",
      className: profile.className || "3.1",
      score: finalScore,
      totalQuestions: activeExam.questions.length,
      correctCount: correctCount,
      xpAwarded: xpReward,
      submittedAt: new Date().toLocaleString("vi-VN")
    };

    const newResults = [resultRecord, ...personalExamResults];
    setPersonalExamResults(newResults);
    localStorage.setItem('lms_personal_exam_results', JSON.stringify(newResults));

    // Update student level profile points (XP) and exercises count
    const updatedXP = profile.xp + xpReward;
    const updatedExCount = profile.completedExercisesCount + 1;
    
    // Support and trigger badges calculation if applicable
    const updatedProfile = {
      ...profile,
      xp: updatedXP,
      completedExercisesCount: updatedExCount
    };
    
    setProfile(updatedProfile);
    // Write profile back to overall students records database
    try {
      const allStudents = JSON.parse(localStorage.getItem('fpt_lms_students') || '[]');
      const finalStList = allStudents.map((st: any) => {
        if (st.studentId === profile.studentId) {
          return {
            ...st,
            xp: updatedXP,
            completedExercisesCount: updatedExCount
          };
        }
        return st;
      });
      localStorage.setItem('fpt_lms_students', JSON.stringify(finalStList));
    } catch (dbErr) {
      console.error(dbErr);
    }

    triggerToast(`🎉 Hoàn tất nộp bài thi! Em ghi danh được ${finalScore}đ và nhận +${xpReward} XP!`);
  };

  useEffect(() => {
    let timerId: any;
    if (examTimerOn && examTimeLeft > 0 && !examSubmitted) {
      timerId = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev <= 1) {
            setExamSubmitted(true);
            setExamTimerOn(false);
            // Auto submit
            setTimeout(() => handleSubmitExam(), 10);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [examTimerOn, examTimeLeft, examSubmitted, activeExam, studentAnswers]);

  // Beautiful requested pastel combinations
  const PASTEL_THEMES = React.useMemo(() => [
    { bg: 'bg-[#FFF0F5]/90 hover:bg-[#FFE5EC]/90', text: 'text-[#C71585]' }, // Hồng pastel
    { bg: 'bg-[#E3F2FD]/90 hover:bg-[#D0E8FF]/90', text: 'text-[#1565C0]' }, // Xanh dương pastel
    { bg: 'bg-[#FFFDE7]/90 hover:bg-[#FFF9C4]/90', text: 'text-[#E65100]' }, // Vàng pastel
    { bg: 'bg-[#E8F5E9]/90 hover:bg-[#C8E6C9]/90', text: 'text-[#2E7D32]' }, // Xanh lá pastel
    { bg: 'bg-[#F3E5F5]/90 hover:bg-[#E1BEE7]/90', text: 'text-[#6A1B9A]' }, // Tím pastel
    { bg: 'bg-[#FFF3E0]/90 hover:bg-[#FFE0B2]/90', text: 'text-[#D84315]' }, // Cam pastel
    { bg: 'bg-[#FFEBEE]/90 hover:bg-[#FFCDD2]/90', text: 'text-[#C62828]' }, // Đỏ pastel
  ], []);

  // Stable randomized borders for the 6 Bento cards
  const bentoBorders = React.useMemo(() => {
    const borders = [
      'border-[#FFB7C5]', // Hồng border
      'border-[#90CAF9]', // Xanh dương border
      'border-[#FFF59D]', // Vàng border
      'border-[#A5D6A7]', // Xanh lá border
      'border-[#CE93D8]', // Tím border
      'border-[#FFCC80]', // Cam border
      'border-[#EF9A9A]', // Đỏ border
    ];
    return [...borders].sort(() => 0.5 - Math.random());
  }, []);

  // Stable randomized borders for the purchased rewards
  const purchasedRewardBorders = React.useMemo(() => {
    const borders = [
      'border-[#FFB7C5]',
      'border-[#90CAF9]',
      'border-[#FFF59D]',
      'border-[#A5D6A7]',
      'border-[#CE93D8]',
      'border-[#FFCC80]',
      'border-[#EF9A9A]',
    ];
    // Create plenty of borders to match potential reward lengths
    const repeated = [...borders, ...borders, ...borders, ...borders];
    return repeated.sort(() => 0.5 - Math.random());
  }, []);

  // Input editing states for Profile Updates
  const [editFullname, setEditFullname] = useState(profile.fullname || '');
  const [editSchool, setEditSchool] = useState(profile.school || '');
  const [editGender, setEditGender] = useState(profile.gender || 'Nam');
  const [editClassName, setEditClassName] = useState(profile.className || '');
  const [editGrade, setEditGrade] = useState<number>(profile.grade || 3);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '👦');
  const [editEmail, setEditEmail] = useState(profile.email || '');

  // Dropdown list states initialized dynamically
  const [schoolsList, setSchoolsList] = useState<string[]>(() => {
    const list = ["Tiểu học Trần văn Danh", "Tiểu học Nguyễn Thị Nuôi"];
    const current = profile.school?.trim();
    if (current && !list.some(s => s.toLowerCase() === current.toLowerCase())) {
      list.push(current);
    }
    return list;
  });

  const [classesList, setClassesList] = useState<string[]>(() => {
    const grade = profile.grade || 3;
    const list = [`${grade}.1`, `${grade}.2`, `${grade}.3`, `${grade}.4`, `${grade}.5`].map(c => c.trim());
    const current = profile.className?.trim();
    if (current) {
      const cleanCurrent = current.replace(/^Lớp\s+/i, '').trim();
      if (!list.some(c => c.toLowerCase() === cleanCurrent.toLowerCase())) {
        list.push(cleanCurrent);
      }
    }
    return list;
  });

  // State to track showing inputs for additions
  const [showAddSchoolInput, setShowAddSchoolInput] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const [showAddClassInput, setShowAddClassInput] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  // Handler functions for adding items
  const handleAddSchool = () => {
    const trimmed = newSchoolName.trim();
    if (trimmed) {
      if (!schoolsList.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
        setSchoolsList(prev => [...prev, trimmed]);
      }
      setEditSchool(trimmed);
      setNewSchoolName("");
      setShowAddSchoolInput(false);
    }
  };

  const handleAddClass = () => {
    const trimmed = newClassName.trim();
    if (trimmed) {
      if (!classesList.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        setClassesList(prev => [...prev, trimmed]);
      }
      setEditClassName(trimmed);
      setNewClassName("");
      setShowAddClassInput(false);
    }
  };

  // Sync edits if profile updates from outside
  useEffect(() => {
    setEditFullname(profile.fullname || '');
    setEditSchool(profile.school || '');
    setEditGender(profile.gender || 'Nam');
    setEditClassName(profile.className || '');
    setEditGrade(profile.grade || 3);
    setSelectedAvatar(profile.avatar || '👦');
    setEditEmail(profile.email || '');

    const sch = profile.school?.trim();
    if (sch) {
      setSchoolsList(prev => {
        if (!prev.some(s => s.toLowerCase() === sch.toLowerCase())) {
          return [...prev, sch];
        }
        return prev;
      });
    }

    const cls = profile.className?.trim();
    if (cls) {
      setClassesList(prev => {
        if (!prev.some(c => c.toLowerCase() === cls.toLowerCase())) {
          return [...prev, cls];
        }
        return prev;
      });
    }
  }, [profile]);

  // Diary logs state
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([
    {
      id: 'd1',
      title: 'Web app học tiếng anh Đăng Duy',
      date: '13:22 27/5/2026',
      mood: '🌟 Rất vui',
      content: 'Ba làm cho trải nghiệm. Không nặng điểm số ở trường lớp',
      colorIndex: 0, // Blue-ish
      mediaUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=400',
      mediaType: 'image',
      tags: ['app', 'tienganh']
    },
    {
      id: 'd2',
      title: 'Hôm nay bé học được từ Apple 🍎',
      date: '08:29 27/5/2026',
      mood: '🌟 Rất vui',
      content: 'Apple là quả táo màu đỏ. Bé rất thích ăn quả táo giòn ngọt của mẹ mua. #apple #traicay',
      colorIndex: 1, // Red/Pink-ish
      mediaUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
      mediaType: 'image',
      tags: ['apple', 'traicay']
    },
    {
      id: 'd3',
      title: 'Nhạc tiếng Anh vui nhộn 🎵',
      date: '10:28 26/5/2026',
      mood: '🌟 Rất vui',
      content: 'Bài hát Hello Song siêu hay, bé nhẩm hát theo Dino rất vui: Hello, hello, how are you? #nhac #tienganh #hello',
      colorIndex: 0, // Blue-ish
      mediaUrl: 'https://img.youtube.com/vi/ALcL3MuU4xQ/hqdefault.jpg',
      mediaType: 'video',
      tags: ['nhac', 'tienganh', 'hello']
    }
  ]);

  // New diary input states
  const [newDiaryTitle, setNewDiaryTitle] = useState('Cảm thấy: Rất vui vẻ 🌟');
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [newDiaryMood, setNewDiaryMood] = useState('🌟 Rất vui');
  const [newDiaryColorIndex, setNewDiaryColorIndex] = useState(0); // 0 to 4
  const [newDiaryMediaUrl, setNewDiaryMediaUrl] = useState('');
  const [newDiaryMediaType, setNewDiaryMediaType] = useState<'image' | 'video'>('image');
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);

  // Leaderboard data mock
  const [leaderboardFilter, setLeaderboardFilter] = useState<'class' | 'grade' | 'school'>('class');
  const mockLeaderboards: { [key: string]: LeaderboardEntry[] } = {
    class: [
      { fullname: `${profile.fullname} (Bạn) 👋`, className: profile.className, grade: profile.grade, xp: profile.xp, level: profile.level, avatar: profile.avatar },
      { fullname: 'Lê Hoàng Bách', className: profile.className, grade: profile.grade, xp: 980, level: 4, avatar: '😎' },
      { fullname: 'Phạm Ngọc Khánh', className: profile.className, grade: profile.grade, xp: 850, level: 4, avatar: '🐼' },
      { fullname: 'Nguyễn Anh Thư', className: profile.className, grade: profile.grade, xp: 710, level: 3, avatar: '🐱' },
      { fullname: 'Đỗ Tuấn Minh', className: profile.className, grade: profile.grade, xp: 620, level: 3, avatar: '🦊' },
    ],
    grade: [
      { fullname: 'Nguyễn Bảo Linh', className: `${profile.grade}.3`, grade: profile.grade, xp: 1450, level: 6, avatar: '🚀' },
      { fullname: 'Lê Hoàng Bách', className: `${profile.grade}.1`, grade: profile.grade, xp: 980, level: 4, avatar: '😎' },
      { fullname: `${profile.fullname} (Bạn) 👋`, className: profile.className, grade: profile.grade, xp: profile.xp, level: profile.level, avatar: profile.avatar },
      { fullname: 'Phạm Ngọc Khánh', className: `${profile.grade}.2`, grade: profile.grade, xp: 850, level: 4, avatar: '🐼' },
      { fullname: 'Vũ Hải Đăng', className: `${profile.grade}.4`, grade: profile.grade, xp: 820, level: 4, avatar: '🦖' },
    ],
    school: [
      { fullname: 'Nguyễn Bảo Linh', className: '5.3', grade: 5, xp: 1450, level: 6, avatar: '🚀' },
      { fullname: 'Phùng Tiến Đạt', className: '5.1', grade: 5, xp: 1320, level: 6, avatar: '🤖' },
      { fullname: `${profile.fullname} (Bạn) 👋`, className: profile.className, grade: profile.grade, xp: profile.xp, level: profile.level, avatar: profile.avatar },
      { fullname: 'Hoàng Thùy Dương', className: '4.5', grade: 4, xp: 1100, level: 5, avatar: '🦊' },
      { fullname: 'Lê Hoàng Bách', className: '3.1', grade: 3, xp: 980, level: 4, avatar: '😎' },
    ]
  };

  const currentLeaderboard = mockLeaderboards[leaderboardFilter].sort((a, b) => b.xp - a.xp);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullname.trim()) {
      alert('Tên của bé không thể để trống nhé!');
      return;
    }
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fullname: editFullname,
        school: editSchool,
        gender: editGender,
        className: editClassName,
        grade: editGrade,
        avatar: selectedAvatar,
        email: editEmail
      };
    });
    triggerToast('🎨 Hoàn thành cập nhật thông tin dũng sĩ thành công!');
  };

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiaryContent.trim()) {
      alert('Em hãy viết nội dung nhật ký trước nhé!');
      return;
    }

    // Extract hashtags dynamically (e.g., #apple #test -> ['apple', 'test'])
    const hashtags: string[] = [];
    const hashRegex = /#([\w\u00C0-\u1EF9]+)/g;
    let match;
    while ((match = hashRegex.exec(newDiaryContent)) !== null) {
      if (match[1] && !hashtags.includes(match[1])) {
        hashtags.push(match[1].toLowerCase());
      }
    }

    if (editingDiaryId) {
      // Update existing
      setDiaryList(prev => prev.map(item => {
        if (item.id === editingDiaryId) {
          return {
            ...item,
            title: newDiaryTitle || 'Cảm thấy: Rất vui vẻ 🌟',
            content: newDiaryContent,
            mood: newDiaryMood,
            colorIndex: newDiaryColorIndex,
            mediaUrl: newDiaryMediaUrl || undefined,
            mediaType: newDiaryMediaUrl ? newDiaryMediaType : undefined,
            tags: hashtags.length > 0 ? hashtags : item.tags
          };
        }
        return item;
      }));
      setEditingDiaryId(null);
      triggerToast('💾 Đã cập nhật trang nhật ký học tập thành công!');
    } else {
      // Create new
      const now = new Date();
      const formattedDate = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      
      const entry: DiaryEntry = {
        id: `diary_${Date.now()}`,
        title: newDiaryTitle || 'Cảm thấy: Rất vui vẻ 🌟',
        date: formattedDate,
        mood: newDiaryMood,
        content: newDiaryContent,
        colorIndex: newDiaryColorIndex,
        mediaUrl: newDiaryMediaUrl ? newDiaryMediaUrl : undefined,
        mediaType: newDiaryMediaUrl ? newDiaryMediaType : undefined,
        tags: hashtags
      };

      setDiaryList(prev => [entry, ...prev]);
      triggerToast('📓 Thêm trang nhật ký học tập mới thành công! Thật tuyệt vời!');
    }

    // Reset fields
    setNewDiaryTitle('Cảm thấy: Rất vui vẻ 🌟');
    setNewDiaryContent('');
    setNewDiaryMood('🌟 Rất vui');
    setNewDiaryColorIndex(0);
    setNewDiaryMediaUrl('');
    setNewDiaryMediaType('image');
  };

  const handleEditDiary = (diary: DiaryEntry) => {
    setEditingDiaryId(diary.id);
    setNewDiaryTitle(diary.title || '');
    setNewDiaryContent(diary.content);
    setNewDiaryMood(diary.mood);
    setNewDiaryColorIndex(diary.colorIndex);
    setNewDiaryMediaUrl(diary.mediaUrl || '');
    setNewDiaryMediaType(diary.mediaType || 'image');
    
    // Scroll smoothly to form container
    const formSection = document.getElementById('diary-entry-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryList(prev => prev.filter(item => item.id !== id));
    triggerToast('🗑️ Đã xóa thẻ nhật ký học tập!');
  };

  // Helper variables for statistics calculations
  const totalStarPoints = profile.xp;
  const theoreticalProgressPct = Math.min(100, Math.round((profile.completedLessonsCount / 9) * 100));
  const exerciseProgressPct = Math.min(100, Math.round((profile.completedExercisesCount / 4) * 100));

  // Resolved lists of purchased rewards
  const purchasedGifts = (purchasedRewards || []).map(id => {
    const item = INITIAL_SHOP_ITEMS.find(item => item.id === id);
    if (item) return item;
    
    // Fallbacks
    const fallbackItems: Record<string, any> = {
      'pet_cat': { id: 'pet_cat', title: 'Mèo Máy Doraemon 🤖🐱', icon: '🤖🐱', cost: 100, desc: 'Mở khóa đặc quyền ảnh đại diện chú mèo máy thông thái.', rarity: 'Quý', raritySymbol: '🔵 Quý', themeClass: { bg: 'bg-white hover:shadow-blue-105', border: 'border-blue-250 hover:border-blue-400', text: 'text-blue-900', badge: 'bg-blue-50 text-blue-700 border-blue-200', iconBg: 'bg-blue-50/55 border-blue-100' } },
      'pet_dino': { id: 'pet_dino', title: 'Khủng Long Khổng Lồ 🦖', icon: '🦖', cost: 150, desc: 'Chú khủng long bạo chúa siêu tọc mạch trợ lý Tin học.', rarity: 'Huyền Thoại', raritySymbol: '🟠 Huyền Thoại', themeClass: { bg: 'bg-white hover:shadow-amber-100', border: 'border-amber-250 hover:border-amber-400', text: 'text-amber-955', badge: 'bg-amber-50 text-amber-700 border-amber-200', iconBg: 'bg-amber-50/55 border-amber-100' } },
      'shield_gold': { id: 'shield_gold', title: 'Khiên Bảo Vệ Stream 🛡️', icon: '🛡️', cost: 200, desc: 'Hộp sâm bảo hộ bảo hiểm giữ vững streak học dũng sĩ 5 ngày.', rarity: 'Đặc Biệt', raritySymbol: '🟢 Đặc Biệt', themeClass: { bg: 'bg-white hover:shadow-emerald-100', border: 'border-emerald-200 hover:border-emerald-350', text: 'text-emerald-900', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-50/55 border-emerald-100' } },
      'cup_super': { id: 'cup_super', title: 'Cúp Vương Miện 👑', icon: '👑', cost: 300, desc: 'Vinh hiển lấp lánh đính thẳng vào trang cá nhân khoe bạn bè!', rarity: 'Thần Thoại', raritySymbol: '🔴 Thần Thoại', themeClass: { bg: 'bg-white hover:shadow-rose-100', border: 'border-rose-250 hover:border-rose-450', text: 'text-rose-900', badge: 'bg-rose-50 text-rose-750 border-rose-200', iconBg: 'bg-rose-50/55 border-rose-100' } }
    };
    
    return fallbackItems[id] || {
      id,
      title: `Avatar #${id}`,
      icon: '🎁',
      desc: 'Quà tặng dũng sĩ học tập sở hữu.',
      rarity: 'Thường',
      raritySymbol: '⚪ Thường',
      themeClass: { bg: 'bg-white hover:shadow-slate-200', border: 'border-slate-200 hover:border-slate-350', text: 'text-slate-800', badge: 'bg-slate-100 text-slate-700 border-slate-250', iconBg: 'bg-slate-50 border-slate-100' }
    };
  });

  return (
    <div id="student-profile-view" className="space-y-6 pb-12 animate-fade-in text-left text-[#334155]">
      
      {/* SECTION 1: MASTER METRIC PURPLE-PINK HERO BANNER (As shown in screenshot) */}
      <div 
        id="student-hero-banner"
        className="w-full rounded-[24px] bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#EC4899] p-6 text-white overflow-hidden shadow-lg relative flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Abstract vector backdrops */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>

        {/* Mascot & Information block */}
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
          {/* Circular Mascot with tag level */}
          <div className="relative">
            <div className="w-[110px] h-[110px] bg-white rounded-full flex items-center justify-center text-[84px] shadow-md border-4 border-white leading-none">
              {profile.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#FFF000] border-3 border-white text-dark font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm text-slate-900">
              #{profile.level}
            </div>
          </div>

          <div>
            <span className="inline-block bg-white/10 backdrop-blur-sm text-yellow-200 border border-white/20 px-3 py-0.5 rounded-full text-xs font-black tracking-wide uppercase mb-1">
              Học sinh Tiểu học
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight flex items-center justify-center sm:justify-start gap-1" style={{ fontFamily: 'var(--font-title)' }}>
              Xin chào {profile.fullname} 👋
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-sm font-bold text-purple-100">
              <span className="flex items-center gap-1.5 bg-black/10 px-3.5 py-1 rounded-full">
                🏫 Lớp: <span className="text-white font-extrabold">{profile.className}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/10 px-3.5 py-1 rounded-full">
                ⭐ Điểm tích lũy: <span className="text-yellow-300 font-extrabold">{profile.xp} ⭐</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: "Bản Sắc" / "Bản thân" */}
        <div className="relative z-10">
          <button 
            onClick={() => setNestedTab('info')}
            className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border-2 border-white/30 rounded-2xl px-5 py-2.5 font-bold text-sm tracking-wide shadow-md flex items-center gap-1.5 cursor-pointer"
            style={{ fontFamily: 'var(--font-btn)' }}
          >
            <PenTool className="w-4 h-4 text-yellow-300 animate-pulse" />
            Đổi Avatar & Lớp
          </button>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE SUB-GRID TABS (Tiến độ, Huy hiệu, Bảng xếp hạng, Nhật ký) */}
      <div className="bg-[#E8F8EE] rounded-3xl p-3 shadow-md border border-[#C2EED4] max-w-full flex overflow-x-auto gap-1">
        {[
          { id: 'progress', label: 'Tiến độ & Thống kê', icon: TrendingUp },
          { id: 'badges', label: 'Bộ sưu tập Huy hiệu', icon: Award },
          { id: 'purchased_rewards', label: 'Bộ sưu tập Phần Thưởng', icon: Gift },
          { id: 'ranks', label: 'Bảng Xếp Hạng', icon: Trophy },
          { id: 'info', label: 'Thông tin cá nhân', icon: User },
          { id: 'diary', label: 'Nhật ký Học tập', icon: PenTool },
          { id: 'test_history', label: 'Lịch sử Kiểm tra (PDF)', icon: ClipboardCheck }
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isActive = nestedTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setNestedTab(subTab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-[14px] whitespace-nowrap transition-all cursor-pointer border ${
                isActive 
                  ? 'bg-[#FFF0F5] text-[#2454A6] border-[#FFD1E6] shadow-sm' 
                  : 'text-gray-500 hover:text-[#2454A6] hover:bg-white/50 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-btn)' }}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2454A6]' : 'text-gray-400'}`} />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 3: TAB SPECIFIC CONTENT BLOCKS */}
      <div className="w-full">
        
        {/* SUB TAB 1: TUYỆT PHẨM BENTO TIẾN ĐỘ & THỐNG KÊ */}
        {nestedTab === 'progress' && (
          <div className="space-y-6">
            
            {/* Elegant Header Alert with Start Learning Button */}
            <div className="bg-white border border-blue-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
              <div>
                <h3 className="font-extrabold text-lg text-[#2454A6]" style={{ fontFamily: 'var(--font-title)' }}>
                  Chào mừng bạn nhỏ đến với phòng học của Tiến sĩ Zero!
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-1 max-w-2xl leading-normal">
                  Hôm nay em học lớp {profile.className}. Hãy thắp sáng các ngôi sao để nhận Huy hiệu và đổi thưởng nha!
                </p>
              </div>

              <button
                onClick={() => onSelectTab('lessons')}
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-md border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 transition duration-150 flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                <Play className="w-4 h-4 fill-white text-white animate-pulse" />
                Bắt đầu học 🚀
              </button>
            </div>

            {/* Layout Bento for the 5 Stats Card (Matches the visual pattern in screenshot) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* CARD 1: ĐIỂM TÍCH LŨY (Col span 4) - Hồng pastel */}
              <div className={`lg:col-span-4 ${PASTEL_THEMES[0].bg} rounded-3xl p-6 shadow-sm border-2 ${bentoBorders[0]} flex flex-col justify-between min-h-[190px]`}>
                <div className="flex items-start gap-4">
                  <div className="bg-[#FFFCE8] border border-yellow-200 p-3 rounded-2xl">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2454A6] text-base leading-snug">Điểm tích lũy</h4>
                    <span className="text-[12px] text-gray-400 font-bold">Tổng số Sao vàng gặt hái được</span>
                  </div>
                </div>

                <div className="my-3 text-left">
                  <span className="block text-3xl font-black text-amber-500 leading-tight">
                    {totalStarPoints} <span className="text-base font-bold text-gray-405">Sao chiến vương</span>
                  </span>
                </div>

                <div className="border-t border-gray-200/50 pt-3 text-[12px] text-gray-500 font-bold leading-normal">
                  Tích lũy bằng cách trả lời câu hỏi trắc nghiệm, hoàn thành các trò chơi phần cứng/phần mềm.
                </div>
              </div>

              {/* CARD 2: BÀI HỌC HOÀN THÀNH (Col span 4) - Xanh dương pastel */}
              <div className={`lg:col-span-4 ${PASTEL_THEMES[1].bg} rounded-3xl p-6 shadow-sm border-2 ${bentoBorders[1]} flex flex-col justify-between min-h-[190px]`}>
                <div className="flex items-start gap-4">
                  <div className="bg-[#EBF7FF] border border-blue-200 p-3 rounded-2xl">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2454A6] text-base leading-snug">Bài học hoàn thành</h4>
                    <span className="text-[12px] text-gray-400 font-bold">Số tiết giảng lý thuyết đã đọc</span>
                  </div>
                </div>

                <div className="my-3 text-left">
                  <span className="block text-3xl font-black text-blue-500 leading-tight">
                    {profile.completedLessonsCount} <span className="text-base font-bold text-gray-405">Chương bài</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#3B82F6] h-full rounded-full" style={{ width: `${theoreticalProgressPct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                    <span className="text-[12px]">Tiến độ chương</span>
                    <span className="text-[12px]">Đạt: {theoreticalProgressPct}%</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: BÀI TẬP TRẮC NGHIỆM (Col span 4) - Vàng pastel */}
              <div className={`lg:col-span-4 ${PASTEL_THEMES[2].bg} rounded-3xl p-6 shadow-sm border-2 ${bentoBorders[2]} flex flex-col justify-between min-h-[190px]`}>
                <div className="flex items-start gap-4">
                  <div className="bg-[#FAF5FF] border border-purple-200 p-3 rounded-2xl">
                    <ClipboardCheck className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2454A6] text-base leading-snug">Bài tập trắc nghiệm</h4>
                    <span className="text-[12px] text-gray-400 font-bold">Tổng số đề luyện thi vượt ải</span>
                  </div>
                </div>

                <div className="my-3 text-left">
                  <span className="block text-3xl font-black text-[#8B5CF6] leading-tight">
                    {profile.completedExercisesCount} <span className="text-base font-bold text-gray-450">Trận đấu</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#A78BFA] h-full rounded-full" style={{ width: `${exerciseProgressPct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                    <span className="text-[12px]">Luyện thi chuyên đề</span>
                    <span className="text-[12px]">Hoàn thành: {exerciseProgressPct}%</span>
                  </div>
                </div>
              </div>

              {/* CARD 4: HUY HIỆU ĐẠT ĐƯỢC (Col span 4) - Xanh lá pastel */}
              <div className={`lg:col-span-4 ${PASTEL_THEMES[3].bg} rounded-3xl p-6 shadow-sm border-2 ${bentoBorders[3]} flex flex-col justify-between min-h-[190px]`}>
                <div className="flex items-start gap-4">
                  <div className="bg-[#FFF1F2] border border-rose-200 p-3 rounded-2xl">
                    <Award className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2454A6] text-base leading-snug">Huy hiệu đạt được</h4>
                    <span className="text-[12px] text-gray-400 font-bold">Danh hiệu cao quý thắp sáng</span>
                  </div>
                </div>

                <div className="my-3 text-left">
                  <span className="block text-3xl font-black text-rose-500 leading-tight">
                    {badgesCount} / 20 <span className="text-base font-bold text-gray-405">Huy hiệu dũng sĩ 🌟</span>
                  </span>
                </div>

                <div className="border-t border-gray-200/50 pt-3 text-[12px] text-gray-500 font-semibold leading-normal">
                  Khi nhận đủ điểm tích lũy ⭐, hệ thống sẽ tự động thắp sáng các Huy hiệu dũng sĩ Tin học tương ứng!
                </div>
              </div>

              {/* CARD 5: TIẾN ĐỘ HỌC TẬP (Col span 8) - Tím pastel */}
              <div className={`lg:col-span-8 ${PASTEL_THEMES[4].bg} rounded-3xl p-6 shadow-sm border-2 ${bentoBorders[4]} flex flex-col justify-between min-h-[190px]`}>
                <div className="flex items-start gap-4">
                  <div className="bg-[#EEFBF3] border border-emerald-200 p-3 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2454A6] text-base leading-snug">Tiến độ học tập</h4>
                    <span className="text-[12px] text-gray-400 font-bold">Tổng chỉ số hoàn thành chương trình</span>
                  </div>
                </div>

                <div className="my-2 text-left">
                  <span className="block text-3xl font-black text-emerald-500 leading-tight">
                    {theoreticalProgressPct}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-gray-200 h-3 items-center rounded-full overflow-hidden">
                    <div className="bg-[#5ED68A] h-full rounded-full shadow-[0_0_8px_#5ED68A]" style={{ width: `${theoreticalProgressPct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 text-[10px]">
                    <span className="text-emerald-700 text-[12px]">Khuyên học: Mỗi ngày giải 1 đề để thông thạo máy tính tốt hơn nữa nhé!</span>
                    <span className="text-gray-500 font-black whitespace-nowrap text-[12px]">Bài hoàn tất: {profile.completedLessonsCount}/9</span>
                  </div>
                </div>
              </div>

              {/* CARD 6: BỘ SƯU TẬP PHẦN THƯỜNG ĐÃ ĐỔI (Col span 12) - Cam pastel */}
              <div className={`lg:col-span-12 ${PASTEL_THEMES[5].bg} rounded-3xl p-6 shadow-sm border-2 ${bentoBorders[5]} flex flex-col justify-between`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#FFF5EC] border border-orange-200 p-2.5 rounded-2xl shrink-0">
                      <Gift className="w-6 h-6 text-orange-500 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#2454A6] text-base leading-snug">Bộ Sưu Tập Phần Thưởng Đã Đổi 🎁</h4>
                      <span className="text-[12px] text-gray-400 font-bold">Các báu vật Avatar nhí sở hữu bằng cách quy đổi Star ⭐ và có thể chọn làm Avatar mới tại Thông tin cá nhân</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setNestedTab('purchased_rewards')}
                    className="text-xs font-black text-orange-600 hover:text-orange-700 bg-orange-50 border border-orange-100 hover:bg-orange-100 px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Xem Chi Tiết Kho Báu 🔍
                  </button>
                </div>

                {purchasedGifts.length > 0 ? (
                  <div className="mt-5">
                    {/* Small preview of owned rewards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {purchasedGifts.map((item, idx) => {
                        const paletteIdx = idx % PASTEL_THEMES.length;
                        const theme = PASTEL_THEMES[paletteIdx];
                        const border = purchasedRewardBorders[idx % purchasedRewardBorders.length];
                        return (
                          <div 
                            key={`${item.id}_${idx}`}
                            className={`p-3 rounded-2xl border-2 ${border} ${theme.bg} flex flex-col items-center text-center cursor-help transition hover:scale-105 shadow-2xs`}
                            title={item.desc}
                          >
                            <span className="text-3xl mb-1">{item.icon}</span>
                            <span className="text-[11px] font-black text-slate-700 truncate w-full">{item.title}</span>
                            <span className="text-[9px] text-[#A855F7] mt-0.5 uppercase tracking-wide font-black block">{item.rarity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-5 bg-orange-50/40 border border-dashed border-orange-250 rounded-2xl text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <p className="text-xs text-orange-850 font-black">🥺 Em chưa đổi Avatar quà tặng nào cả!</p>
                      <p className="text-[12px] text-gray-400 font-bold mt-0.5">Luyện tập gõ phím thật nhiều để tích lũy thêm Sao dũng sỹ ⭐ và đổi quà độc lạ nhé!</p>
                    </div>
                    <button 
                      onClick={() => onSelectTab('rewards')}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl border-b-3 border-orange-700 active:border-b-0 active:translate-y-0.5 cursor-pointer shadow-xs transition"
                    >
                      Ghé Cửa Hàng Đổi Quà 🎁
                    </button>
                  </div>
                )}
              </div>

              {/* NEW SECTION: PHÒNG THI ONLINE & HỌC BẠ KẾT QUẢ ĐÁNH GIÁ TRỰC TUYẾN */}
              <div className="lg:col-span-12 space-y-6">
                
                {/* 1. Header block */}
                <div className="bg-gradient-to-r from-[#2454a6] to-indigo-800 rounded-3xl p-6 text-white text-left shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 my-1">
                    <span className="bg-yellow-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Phòng rèn luyện trực tuyến</span>
                    <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-title)' }}>
                      Vượt Ải Đề Thi Online - Đổi Sao Tích Lũy ⭐
                    </h3>
                    <p className="text-xs text-blue-100 max-w-xl">
                      Toàn bộ các đề kiểm tra được tạo bởi Thầy Cô hoặc Trí Tuệ Nhân Tạo AI đều được lưu trữ tại thư viện thi đấu dưới đây. Hoàn tất mỗi đề thi để thắp sáng ngôi sao, tăng sức mạnh tư duy Tin học của em!
                    </p>
                  </div>
                  
                  <div className="flex gap-4 shrink-0 bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
                    <div>
                      <span className="block text-xl font-extrabold text-yellow-300">{personalExamResults.length}</span>
                      <span className="text-[10px] uppercase font-black tracking-wider text-blue-100">Đã nộp</span>
                    </div>
                    <div className="border-l border-white/20 pl-4">
                      <span className="block text-xl font-extrabold text-emerald-300">
                        {personalExamResults.length > 0 
                          ? (personalExamResults.reduce((acc, curr) => acc + curr.score, 0) / personalExamResults.length).toFixed(1)
                          : '0.0'
                        }
                      </span>
                      <span className="text-[10px] uppercase font-black tracking-wider text-blue-100">Điểm TB</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* LEFT: THƯ VIỆN ĐỀ THI ĐÃ CÓ / ĐỀ KIỂM TRA ĐỔI SAO */}
                  <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-sm text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-[#2454a6] text-base" style={{ fontFamily: 'var(--font-title)' }}>
                        🎒 Thư Viện Đề Thi Có Sẵn ({customExams.length})
                      </h4>
                      <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Sách Giáo Khoa 2018</span>
                    </div>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {customExams.map((exam) => {
                        const hasTaken = personalExamResults.some(r => r.testId === exam.id);
                        const takenCount = personalExamResults.filter(r => r.testId === exam.id).length;
                        return (
                          <div 
                            key={exam.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              hasTaken 
                                ? 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300' 
                                : 'bg-slate-50/40 border-slate-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-[#2454a6] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                                  {exam.subject || 'Tin học'} - Khối {exam.grade || 3}
                                </span>
                                <span className="bg-orange-500 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                                  {exam.questions?.length || 0} câu hỏi
                                </span>
                                {hasTaken && (
                                  <span className="bg-emerald-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                    ✓ Đã đạt ({takenCount} lần)
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-[13px] text-indigo-950 leading-tight">
                                {exam.testName}
                              </h5>
                              <p className="text-[11px] text-gray-400 font-medium">
                                Nguồn: {exam.curriculumBook || 'Hệ thống'} • Thang điểm: 10 • Tạo ngày: {exam.createdAt || 'Mới đây'}
                              </p>
                            </div>

                            <button
                              onClick={() => handleStartExam(exam)}
                              className="px-4 py-2 text-white bg-[#2454a6] hover:bg-indigo-700 font-extrabold text-xs rounded-xl shadow-xs transition duration-150 shrink-0 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              Làm bài ⚡
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT: HỌC BẠ ĐIỂM SỐ CHUYÊN CẦN / KẾT QUẢ ĐÃ LÀM */}
                  <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-sm text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-[#2454a6] text-base" style={{ fontFamily: 'var(--font-title)' }}>
                        📊 Học Bạ Điểm Số & Lịch Sử Thi Online
                      </h4>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Cập nhật tự động</span>
                    </div>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {personalExamResults.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                          <span className="text-4xl">📚</span>
                          <p className="text-xs font-bold text-gray-400">Em chưa thực hiện bài thi trực tuyến nào cả!</p>
                          <p className="text-[11px] text-gray-400">Hãy chọn một đề thi bên trái và làm bài thi tự luận/trắc nghiệm ngay.</p>
                        </div>
                      ) : (
                        personalExamResults.map((res) => {
                          const isHigh = res.score >= 8;
                          const isLow = res.score < 5;
                          return (
                            <div 
                              key={res.id}
                              className="p-3.5 rounded-2xl border border-gray-150 bg-slate-50/50 flex items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-0">
                                <h5 className="font-extrabold text-[12.5px] text-gray-800 truncate" title={res.testName}>
                                  {res.testName}
                                </h5>
                                <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
                                  <span className="font-bold text-slate-500">
                                    Thí sinh: {res.studentName} ({res.className})
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500 font-mono">
                                    {res.submittedAt}
                                  </span>
                                </div>
                                <p className="text-[10px] text-purple-600 font-black flex items-center gap-1 mt-0.5">
                                  ⭐ Tiền thưởng: +{res.xpAwarded} Sao tích lũy đã cộng học bạ
                                </p>
                              </div>

                              <div className="flex flex-col items-center shrink-0 pr-1">
                                <span className={`text-xl font-serif font-black ${
                                  isHigh ? 'text-emerald-600' : isLow ? 'text-red-500' : 'text-blue-600'
                                }`}>
                                  {res.score}đ
                                </span>
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">
                                  {res.correctCount}/{res.totalQuestions || 4} Đúng
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* ACTIVE EXAM RUNNING OVERLAY MODAL */}
              {activeExam && (
                <div className="fixed inset-0 bg-indigo-950/50 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-2xl border border-indigo-100 max-h-[92vh] flex flex-col text-left">
                    
                    {/* Header banner */}
                    <div className="p-6 bg-[#2454a6] text-white flex justify-between items-center">
                      <div>
                        <span className="bg-yellow-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Phòng Thi Trực Tuyến Học Sinh</span>
                        <h3 className="text-xl font-bold mt-1 tracking-tight">{activeExam.testName}</h3>
                        <p className="text-xs text-blue-100 italic opacity-90">Học sinh: {profile.fullname} / Lớp: {profile.className} / Sách: {activeExam.curriculumBook || 'Tổng hợp'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (!examSubmitted) {
                            if (window.confirm("⚠️ Em đang làm dở bài thi, em có thực sự muốn thoát không?")) {
                              setActiveExam(null);
                              setExamTimerOn(false);
                            }
                          } else {
                            setActiveExam(null);
                            setExamTimerOn(false);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-black text-sm cursor-pointer transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal body */}
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50">
                      
                      {/* Left helper tools */}
                      <div className="md:col-span-4 space-y-4">
                        
                        {/* Student Badge Card */}
                        <div className="bg-white p-5 rounded-3xl border border-indigo-150/60 shadow-sm space-y-3">
                          <div className="text-[11px] font-black text-blue-900 tracking-wider uppercase">Thẻ thông tin sinh viên</div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="block text-[10px] font-bold text-gray-500 uppercase">Họ Tên Thí Sinh:</span>
                              <div className="bg-slate-50 p-2.5 rounded-xl text-indigo-900 font-extrabold text-[12.5px] border border-gray-150">
                                {profile.fullname}
                              </div>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-gray-500 uppercase">Lớp học hiện tại:</span>
                              <div className="bg-slate-50 p-2.5 rounded-xl text-indigo-900 font-extrabold text-[12.5px] border border-gray-150">
                                Lớp {profile.className}
                              </div>
                            </div>
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400">MÃ HỌC SINH:</span>
                              <strong className="font-mono text-xs tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                                {profile.studentId || 'HS-001'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Timer */}
                        <div className="bg-white p-5 rounded-3xl border border-indigo-150/60 shadow-sm text-center space-y-2">
                          <div className="text-[11px] font-black text-indigo-900 tracking-wider uppercase">Tổng thời gian thi còn lại</div>
                          
                          <div className="py-2">
                            <span className={`text-4xl font-extrabold font-mono tracking-tight ${examTimeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#2454a6]'}`}>
                              {Math.floor(examTimeLeft / 60).toString().padStart(2, '0')}:
                              {(examTimeLeft % 60).toString().padStart(2, '0')}
                            </span>
                          </div>

                          <span className="text-[11px] italic text-slate-400 block pt-1.5 border-t border-slate-100">
                            {examSubmitted 
                              ? "✓ Đã hoàn tất & Đã sửa lỗi câu trả lời!" 
                              : "Chú ý: Hệ thống sẽ tự nộp bài kiểm tra khi thời gian chạy hết!"
                            }
                          </span>
                        </div>

                        {/* Result card instantly visible */}
                        {examSubmitted && (
                          <div className="bg-emerald-50 text-emerald-800 p-5 rounded-3xl border border-emerald-200 animate-scale-up text-center space-y-4">
                            <div className="text-xs font-black uppercase text-emerald-700">KẾT QUẢ ĐÁNH GIÁ CHUNG</div>
                            
                            <div>
                              <div className="text-4xl font-black font-serif text-[#16a34a]">
                                {(() => {
                                  let correctCount = 0;
                                  activeExam.questions.forEach((q: any) => {
                                    const isMc = q.type === 'multiple_choice';
                                    if (isMc) {
                                      if (studentAnswers[q.id] === q.correctAnswer) {
                                        correctCount++;
                                      }
                                    } else {
                                      if (studentAnswers[q.id] && studentAnswers[q.id].trim().length > 3) {
                                        correctCount++;
                                      }
                                    }
                                  });
                                  const score = (correctCount / (activeExam.questions.length || 1)) * 10;
                                  return Number(score.toFixed(2));
                                })()}đ
                              </div>
                              <div className="text-[10px] font-bold text-emerald-600 tracking-wide mt-1">Chuẩn thang điểm: 10 / 10đ</div>
                            </div>

                            <div className="text-xs font-medium px-4 py-3 bg-white rounded-2xl border border-emerald-100 leading-snug">
                              {(() => {
                                let correctCount = 0;
                                activeExam.questions.forEach((q: any) => {
                                  const isMc = q.type === 'multiple_choice';
                                  if (isMc) {
                                    if (studentAnswers[q.id] === q.correctAnswer) {
                                      correctCount++;
                                    }
                                  } else {
                                    if (studentAnswers[q.id] && studentAnswers[q.id].trim().length > 3) {
                                      correctCount++;
                                    }
                                  }
                                });
                                const score = (correctCount / (activeExam.questions.length || 1)) * 10;
                                return score >= 8 ? (
                                  <span>🌟 <b>Tuyệt Diệu!</b> Em đạt kết quả xuất sắc. Hãy giữ vững phong độ học tập Tin học siêu đỉnh nhé!</span>
                                ) : score >= 5 ? (
                                  <span>👍 <b>Rất Tốt!</b> Em đã nắm vững các ý niệm cốt lõi. Xem hướng dẫn chấm bên cạnh để gặt tối đa điểm 10.</span>
                                ) : (
                                  <span>📚 <b>Hãy Rèn Luyện Thêm!</b> Em đã gặt hái kết quả tạm ổn, hãy chăm chỉ luyện tập sách giáo khoa hơn nữa.</span>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Right digital question canvas */}
                      <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-indigo-150/60 shadow-sm overflow-y-auto max-h-[75vh] space-y-6">
                        {activeExam.questions.map((q: any, idx: number) => {
                          const isMc = q.type === 'multiple_choice';
                          const ans = studentAnswers[q.id];
                          const isCorrect = ans === q.correctAnswer;
                          return (
                            <div 
                              key={q.id}
                              className={`p-4.5 rounded-2xl border transition-all ${
                                examSubmitted 
                                  ? isMc
                                    ? isCorrect 
                                      ? 'bg-emerald-50/40 border-emerald-300' 
                                      : 'bg-rose-50/40 border-rose-300'
                                    : 'bg-emerald-50/40 border-emerald-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="w-6.5 h-6.5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                
                                <div className="space-y-3 flex-1 text-left">
                                  <p className="font-extrabold text-[13.5px] text-slate-900 leading-snug">
                                    {q.questionText} <span className="text-[11px] font-normal text-slate-400">({q.points || 2.5}đ - {q.difficulty || 'Nhận biết'})</span>
                                  </p>

                                  {isMc ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                      {q.options?.map((opt: string, oidx: number) => {
                                        const optL = ['A','B','C','D'][oidx];
                                        const isSelected = ans === optL;
                                        const isCorrectL = q.correctAnswer === optL;
                                        
                                        return (
                                          <button
                                            key={oidx}
                                            disabled={examSubmitted}
                                            onClick={() => {
                                              setStudentAnswers({
                                                ...studentAnswers,
                                                [q.id]: optL
                                              });
                                            }}
                                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer select-none ${
                                              examSubmitted 
                                                ? isSelected
                                                  ? isCorrectL
                                                    ? 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-xs'
                                                    : 'bg-rose-500 border-rose-600 text-white font-bold shadow-xs'
                                                  : isCorrectL
                                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold'
                                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                                : isSelected
                                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                                                  : 'border-slate-200 bg-slate-50/30 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'
                                            }`}
                                          >
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                              isSelected ? 'bg-[#2454a6] text-white' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                              {optL}
                                            </span>
                                            <span className="leading-tight">{opt}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <textarea
                                        value={ans || ''}
                                        disabled={examSubmitted}
                                        onChange={(e) => {
                                          setStudentAnswers({
                                            ...studentAnswers,
                                            [q.id]: e.target.value
                                          });
                                        }}
                                        placeholder="Em gõ câu trả lời giải thích tự luận vào đây nhé..."
                                        className="w-full text-xs font-medium px-4 py-3 bg-slate-50 border rounded-xl border-slate-200 focus:bg-white outline-none min-h-[80px]"
                                      />
                                    </div>
                                  )}

                                  {/* Auto scoring guides explanations */}
                                  {examSubmitted && (
                                    <div className="bg-amber-50/40 border-l-4 border-amber-500/80 p-3.5 rounded-r-xl text-[11.5px] leading-relaxed space-y-1 mt-2.5">
                                      <div className="font-black text-amber-800 tracking-wider text-[10px]">💡 HƯỚNG DẪN GIẢI CHI TIẾT:</div>
                                      <p className="text-slate-700 italic font-sans">{q.answerGuide || 'Suy nghĩ & trả lời theo hướng dẫn chuẩn giáo dục.'}</p>
                                    </div>
                                  )}
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Bottom action bar */}
                    <div className="p-4 border-t bg-slate-50 flex justify-between items-center px-6">
                      <span className="text-xs font-semibold text-slate-500">
                        Tiến trình em làm: {Object.keys(studentAnswers).length} / {activeExam.questions.length} câu đã giải xong
                      </span>
                      
                      <div className="flex gap-2">
                        {!examSubmitted ? (
                          <button
                            onClick={() => {
                              if (Object.keys(studentAnswers).length === 0) {
                                triggerToast("⚠️ Em cần nhấp lựa chọn đáp án trước khi bấm nộp bài!");
                                return;
                              }
                              handleSubmitExam();
                            }}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            Nộp bài chấm thi ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setStudentAnswers({});
                              setExamSubmitted(false);
                              setExamTimeLeft(600);
                              setExamTimerOn(true);
                              triggerToast("🔄 Hệ thống đã đặt lại đề thi! Bắt đầu lại.");
                            }}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
                          >
                            Làm lại đề này 🔄
                          </button>
                        )}
                        <button
                          onClick={() => setActiveExam(null)}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-xs transition cursor-pointer"
                        >
                          Đóng phòng thi
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* SUB TAB 2: BỘ SƯU TẬP HUY HIỆU */}
        {nestedTab === 'badges' && (
          <div className="space-y-8 text-left">
            <div className="bg-[#FAFAFE] border border-gray-150 p-5 rounded-3xl text-center">
              <h3 className="font-extrabold text-[#2454A6]" style={{ fontFamily: 'var(--font-title)' }}>🏆 Tủ trưng bày Huy hiệu</h3>
              <p className="text-xs text-gray-400 font-bold mt-1">
                Tích luỹ thêm thật nhiều điểm ⭐ rực rỡ để thắp sáng các huân chương dũng sĩ nhé các bạn nhỏ!
              </p>
              
              {/* Added: "Tổng sao đã thu thập:" and count */}
              <div className="flex flex-col items-center justify-center gap-3 mt-4 max-w-2xl mx-auto">
                <div className="bg-[#E0F2FE] text-[#0369A1] text-xs font-black px-4 py-2 rounded-2xl border border-[#BAE6FD] shadow-xs w-full max-w-md">
                  🌟 Tổng sao đã thu thập: <span className="font-extrabold text-blue-700 text-sm">{totalCollectedXP}</span> (Gồm có: {profile.xp} hiện tại | Đã đổi quà: {totalSpentXP})
                </div>
                <div className="bg-amber-100 text-[#92400E] text-xs font-black px-4 py-2 rounded-2xl border border-amber-300 shadow-xs w-full max-w-md">
                  🏆 Đã đạt được: <span className="text-amber-700 font-extrabold">{badgesCount} / 20</span> Huy hiệu dũng sĩ 🌟
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: 'Hạng Đồng 🥉️',
                  code: 'Đồng',
                  bgGradient: 'from-amber-50/50 to-orange-50/20 border-amber-200',
                  titleColor: 'text-amber-800',
                  badgeText: 'text-amber-700 bg-amber-100',
                  badges: (badgesList || INITIAL_BADGES).filter((b) => b.tier === 'Đồng')
                },
                {
                  title: 'Hạng Bạc 🥈️',
                  code: 'Bạc',
                  bgGradient: 'from-emerald-50/50 to-green-50/20 border-green-200',
                  titleColor: 'text-emerald-800',
                  badgeText: 'text-emerald-700 bg-emerald-100',
                  badges: (badgesList || INITIAL_BADGES).filter((b) => b.tier === 'Bạc')
                },
                {
                  title: 'Hạng Vàng 🥇',
                  code: 'Vàng',
                  bgGradient: 'from-blue-50/50 to-indigo-50/20 border-blue-200',
                  titleColor: 'text-blue-800',
                  badgeText: 'text-blue-700 bg-blue-100',
                  badges: (badgesList || INITIAL_BADGES).filter((b) => b.tier === 'Vàng')
                },
                {
                  title: 'Hạng Kim Cương 💎️',
                  code: 'Kim Cương',
                  bgGradient: 'from-purple-50/50 to-fuchsia-50/20 border-purple-200',
                  titleColor: 'text-purple-800',
                  badgeText: 'text-purple-700 bg-purple-100',
                  badges: (badgesList || INITIAL_BADGES).filter((b) => b.tier === 'Kim Cương')
                },
                {
                  title: 'Hạng Huyền Thoại 👑',
                  code: 'Huyền Thoại',
                  bgGradient: 'from-yellow-100/40 to-amber-50/10 border-yellow-300 shadow-md',
                  titleColor: 'text-amber-955',
                  badgeText: 'text-yellow-800 bg-yellow-250',
                  badges: (badgesList || INITIAL_BADGES).filter((b) => b.tier === 'Huyền Thoại')
                }
              ].map((tierItem) => {
                const earnedCount = tierItem.badges.filter(b => totalCollectedXP >= b.xpRequired).length;
                return (
                  <div key={tierItem.code} className={`rounded-3xl p-6 border-2 bg-gradient-to-br ${tierItem.bgGradient} space-y-4`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 border-gray-200/50">
                      <div>
                        <h4 className={`font-black text-base sm:text-lg ${tierItem.titleColor}`} style={{ fontFamily: 'var(--font-title)' }}>
                          {tierItem.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-bold mt-0.5">Tích lũy sao vàng lấp lánh để thắp sáng Huy hiệu danh dự!</p>
                      </div>
                      <span className={`px-3.5 py-1 rounded-full text-xs font-black self-start sm:self-center ${tierItem.badgeText}`}>
                        Đạt được: {earnedCount} / {tierItem.badges.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {tierItem.badges.map((badge) => {
                        const isEarned = totalCollectedXP >= badge.xpRequired;
                        return (
                          <div 
                            key={badge.code}
                            className={`rounded-2xl p-4 border text-center flex flex-col justify-between items-center gap-3 transition-all duration-300 bg-white ${
                              isEarned 
                                ? 'border-[#FFD84D] shadow-sm hover:scale-[1.03] hover:shadow-md' 
                                : 'border-gray-150 opacity-60'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-3xl shadow-xs border ${
                              isEarned ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-100'
                            }`}>
                              {badge.iconEmoji}
                            </div>

                            <div>
                              <h5 className="font-extrabold text-[12px] text-slate-800 leading-tight">{badge.title}</h5>
                              <p className="text-[9px] text-gray-400 font-bold mt-1 leading-snug">{badge.description}</p>
                            </div>

                            <div className="w-full">
                              {isEarned ? (
                                <span className="inline-block w-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-black text-[9px] py-1 rounded-full uppercase tracking-wider">
                                  🛡️ Đã Sở Hữu
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-block w-full bg-gray-50 text-gray-400 font-bold text-[9px] py-1 rounded-full uppercase border border-gray-100">
                                    🔒 Chưa Đạt
                                  </span>
                                  <span className="block text-[9px] text-[#FF6B6B] font-extrabold">Đòi hỏi {badge.xpRequired} ⭐</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB TAB: BỘ SƯU TẬP PHẦN THƯỜNG CHI TIẾT */}
        {nestedTab === 'purchased_rewards' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-[#FFF5EC] border-3 border-[#FFE0C5] p-6 rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-orange-500 text-white text-[11px] px-3 py-0.5 rounded-full font-black uppercase inline-block">
                  Kho Báu Avatar 🦄
                </span>
                <h3 className="text-xl md:text-2xl font-black text-orange-850" style={{ fontFamily: 'var(--font-title)' }}>
                  Bộ sưu tập Phần thưởng của Bé
                </h3>
                <p className="text-xs text-gray-500 font-bold max-w-lg leading-relaxed">
                  Toàn bộ các linh vật tinh nghịch, Avatar thông thái và vật phẩm Tin học mà em đã tích sao quy đổi được!
                  <span className="block mt-1 text-amber-600 font-extrabold">
                    ✨ Mách nhỏ: Em có thể sử dụng những Avatar đã đổi này làm ảnh đại diện tại "Thông tin cá nhân" đấy!
                  </span>
                </p>
              </div>

              <div className="bg-white px-5 py-2.5 rounded-2xl border-2 border-orange-200 font-black text-orange-600 text-center shadow-sm shrink-0">
                <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider mb-0.5">Sở hữu:</span>
                <span className="block text-2xl text-[#2454A6]">{purchasedGifts.length} 🎁</span>
              </div>
            </div>

            {purchasedGifts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {purchasedGifts.map((item, idx) => {
                  const paletteIdx = idx % PASTEL_THEMES.length;
                  const theme = PASTEL_THEMES[paletteIdx];
                  const border = purchasedRewardBorders[idx % purchasedRewardBorders.length];
                  return (
                    <div 
                      key={`${item.id}_${idx}`}
                      className={`${theme.bg} p-6 rounded-[24px] border-3 ${border} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}
                    >
                      {/* Rarity Tag */}
                      <div className="absolute top-4 right-4">
                        <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${item.themeClass.badge}`}>
                          {item.raritySymbol || item.rarity}
                        </span>
                      </div>

                      {/* Mascot View */}
                      <div className="text-center space-y-3 pt-4">
                        <span className={`text-5xl mx-auto w-24 h-24 flex items-center justify-center rounded-full border-4 shadow-md bg-white ${border} leading-none select-none`}>
                          {item.icon}
                        </span>
                        <h4 className={`font-black text-sm text-slate-800`}>{item.title}</h4>
                        <p className="text-[12.5px] font-bold text-blue-600 leading-normal min-h-[34px]">{item.desc}</p>
                      </div>

                      {/* Extra Badge item detail */}
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-150 text-center">
                        <span className="inline-block bg-slate-100/80 text-slate-700 text-[10px] font-black px-3 py-1 rounded-lg">
                          🎉 Đã quy đổi với {item.cost} ⭐
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border-3 border-dashed border-gray-250 rounded-[32px] p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
                <span className="text-5xl block animate-bounce">🎁 ✨</span>
                <h4 className="font-black text-lg text-slate-700" style={{ fontFamily: 'var(--font-title)' }}>
                  Kho báu còn trống trải quá!
                </h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Em ơi, hãy bấm nút "Ghé Cửa Hàng" phía dưới để xem và dùng điểm Sao dũng sỹ ⭐ đổi lấy các phần quà giá trị nhé!
                </p>
                <button 
                  onClick={() => onSelectTab('rewards')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer border-b-4 border-orange-700 active:border-b-0 active:translate-y-0.5 shadow-sm"
                >
                  Ghé cửa hàng quy đổi sao 🎁
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUB TAB 3: BẢNG XẾP HẠNG SAO */}
        {nestedTab === 'ranks' && (
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="text-center bg-[#FFFCE8] border border-yellow-200 p-5 rounded-3xl">
              <span className="text-3xl animate-bounce inline-block">👑</span>
              <h3 className="font-extrabold text-amber-900" style={{ fontFamily: 'var(--font-title)' }}>Bảng Xếp Hạng Chiến Binh Nhí</h3>
              <p className="text-xs text-gray-500 font-bold mt-1">Cố gắng trả lời nhanh cùng phản xạ vàng để ghi danh bảng vàng nhé!</p>
            </div>

            {/* Selection scope metrics */}
            <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-2xl text-center">
              {[
                { id: 'class', label: 'BXH Lớp' },
                { id: 'grade', label: 'BXH Khối' },
                { id: 'school', label: 'BXH Trường' }
              ].map((scope) => (
                <button
                  key={scope.id}
                  onClick={() => setLeaderboardFilter(scope.id as any)}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    leaderboardFilter === scope.id 
                      ? 'bg-[#2454A6] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>

            {/* List entries */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-2">
              {currentLeaderboard.map((user, idx) => {
                const colors = [
                  'bg-[#FFFAEB] border-yellow-300 text-yellow-800', // Rank 1
                  'bg-slate-50 border-slate-300 text-gray-700', // Rank 2
                  'bg-orange-50 border-orange-200 text-orange-850' // Rank 1
                ];
                const medalSymbol = ['🥇', '🥈', '🥉'];
                const badgeStyle = colors[idx] || 'bg-[#F3F6FD] border-[#E2E8F0] text-gray-500';

                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between gap-4 p-2 rounded-2xl border transition ${
                      user.fullname.includes('(Bạn)') 
                        ? 'bg-blue-50/70 border-[#3B82F6]' 
                        : 'bg-white border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Index and medals representation */}
                      <div className={`w-7 h-7 flex items-center justify-center font-black rounded-lg text-xs border ${badgeStyle}`}>
                        {medalSymbol[idx] || idx + 1}
                      </div>

                      {/* Left Emoji Profile */}
                      <span className="text-xl bg-gray-50 p-1.5 rounded-lg border border-gray-200/50 block">{user.avatar}</span>
                      
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-extrabold text-[11px] text-gray-800 truncate leading-tight">{user.fullname}</h4>
                        <span className="text-[11px] font-medium text-gray-500 mt-1 block leading-tight">Lớp {user.className} • Cấp {user.level}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center justify-end gap-0.5 font-black text-[14px]">
                      <span>{user.xp} ⭐</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB TAB 4: THAY ĐỔI THÔNG TIN VÀ CHỌN AVATAR */}
        {nestedTab === 'info' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 max-w-xl mx-auto">
            <h3 className="font-extrabold text-lg text-[#2454A6] mb-2 text-center" style={{ fontFamily: 'var(--font-title)' }}>
              ✏️ Thay đổi Thông tin
            </h3>
            <p className="text-xs text-gray-400 font-semibold mb-6 text-center">Các em chỉnh sửa thông tin lớp, khối trường và chọn ảnh đại diện Avatar mới.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Box 1: Fullname & Gender dropdown next to it */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2 text-left space-y-1">
                  <label className="text-xs font-extrabold text-gray-500 pl-1">Họ và Tên học sinh:</label>
                  <input 
                    type="text"
                    value={editFullname || ''}
                    onChange={(e) => setEditFullname(e.target.value)}
                    className="w-full text-sm font-bold bg-[#F3F6FD] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] focus:bg-white transition-all text-slate-700 h-11.5"
                    placeholder="Nhập họ và tên nhí..."
                  />
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs font-extrabold text-gray-500 pl-1">Giới tính:</label>
                  <select
                    value={editGender || 'Nam'}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full text-sm font-bold bg-[#F3F6FD] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] focus:bg-white transition-all text-slate-700 h-11.5"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Box 2: School */}
              <div className="text-left space-y-1 block">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-xs font-extrabold text-gray-500">Trường Tiểu học:</label>
                  {!showAddSchoolInput && (
                    <button
                      type="button"
                      onClick={() => setShowAddSchoolInput(true)}
                      className="text-[#2454A6] hover:text-[#1D4ED8] font-black text-[11px] hover:underline"
                    >
                      + Thêm Trường mới
                    </button>
                  )}
                </div>
                
                {showAddSchoolInput ? (
                  <div className="flex gap-2 items-center mt-1 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Nhập tên trường tiểu học mới..."
                      value={newSchoolName || ''}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      className="flex-1 text-sm font-bold bg-[#FFFBEB] border-2 border-[#FBBF24] rounded-2xl px-4 py-2.5 outline-none text-slate-705"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddSchool}
                      className="bg-emerald-500 hover:bg-emerald-600 border-b-3 border-emerald-700 active:border-b-0 text-white font-black text-xs px-4 py-2.5 rounded-2xl cursor-pointer shadow-sm active:translate-y-0.5 transition"
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSchoolInput(false);
                        setNewSchoolName("");
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-black text-xs px-4 py-2.5 rounded-2xl cursor-pointer transition"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <select
                    value={editSchool || ''}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className="w-full text-sm font-bold bg-[#F3F6FD] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] focus:bg-white transition-all text-slate-700 h-11.5"
                  >
                    <option value="" disabled>-- Chọn trường học --</option>
                    {schoolsList.map((schoolOption) => (
                      <option key={schoolOption} value={schoolOption}>
                        {schoolOption}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Box 4: Grade Choice */}
                <div className="text-left space-y-1">
                  <label className="text-xs font-extrabold text-gray-400 pl-1">Khối lớp học (Đã khóa):</label>
                  <select
                    disabled
                    value={editGrade || 3}
                    onChange={(e) => {
                      const newG = Number(e.target.value);
                      setEditGrade(newG);
                      // Update classesList options dynamically to use the new grade numbers
                      const newList = [`${newG}.1`, `${newG}.2`, `${newG}.3`, `${newG}.4`, `${newG}.5`].map(c => c.trim());
                      setClassesList(newList);
                      setEditClassName(`${newG}.1`);
                    }}
                    className="w-full text-sm font-bold bg-[#E2E8F0]/60 border border-gray-200 rounded-2xl px-4 py-3 outline-none text-gray-400 cursor-not-allowed opacity-65 h-11.5 select-none"
                  >
                    <option value={1}>Khối Lớp 1</option>
                    <option value={2}>Khối Lớp 2</option>
                    <option value={3}>Khối Lớp 3</option>
                    <option value={4}>Khối Lớp 4</option>
                    <option value={5}>Khối Lớp 5</option>
                  </select>
                </div>

                {/* Box 3: Class name */}
                <div className="text-left space-y-1">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-xs font-extrabold text-gray-500">Tên lớp học:</label>
                    {!showAddClassInput && (
                      <button
                        type="button"
                        onClick={() => setShowAddClassInput(true)}
                        className="text-[#2454A6] hover:text-[#1D4ED8] font-black text-[11px] hover:underline"
                      >
                        + Thêm Lớp mới
                      </button>
                    )}
                  </div>

                  {showAddClassInput ? (
                    <div className="flex gap-2 items-center mt-1 animate-fade-in">
                      <input
                        type="text"
                        placeholder="Ví dụ: 3.4..."
                        value={newClassName || ''}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="flex-1 text-sm font-bold bg-[#FFFBEB] border-2 border-[#FBBF24] rounded-2xl px-3 py-2.5 outline-none text-slate-705"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddClass}
                        className="bg-emerald-500 hover:bg-emerald-600 border-b-3 border-emerald-700 active:border-b-0 text-white font-black text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer shadow-sm active:translate-y-0.5 transition"
                      >
                        Thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddClassInput(false);
                          setNewClassName("");
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-black text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer transition"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editClassName ? editClassName.replace(/^Lớp\s+/i, '') : ''}
                      onChange={(e) => setEditClassName(e.target.value.replace(/^Lớp\s+/i, ''))}
                      className="w-full text-sm font-bold bg-[#F3F6FD] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] focus:bg-white transition-all text-slate-700 h-11.5"
                    >
                      <option value="" disabled>-- Chọn lớp học --</option>
                      {classesList.map((classOption) => {
                        const cleanVal = classOption.replace(/^Lớp\s+/i, '');
                        return (
                          <option key={cleanVal} value={cleanVal}>
                            Lớp {cleanVal}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>

              {/* Box 5: Optional Email Address */}
              <div className="text-left space-y-1">
                <label className="text-xs font-extrabold text-gray-500 pl-1">Địa chỉ Email:</label>
                <input 
                  type="email"
                  value={editEmail || ''}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-sm font-bold bg-[#F3F6FD] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] focus:bg-white transition-all text-slate-700"
                  placeholder="Gợi ý: email của bố mẹ hoặc của bé (Không bắt buộc)..."
                />
              </div>

              {/* Avatar Choosing Box */}
              {(() => {
                const customAvatarPool = [
                  ...SHARED_AVATAR_POOL,
                  ...purchasedGifts.map(gift => ({
                    emoji: gift.icon,
                    label: `${gift.title} (Avatar Phần thưởng đổi được)`
                  }))
                ].filter((item, index, self) => self.findIndex(i => i.emoji === item.emoji) === index);

                return (
                  <div className="text-left space-y-2.5 pt-2 block">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-xs font-extrabold text-gray-500">Chọn Avatar: Dùng ⭐ mua thêm Avatar tại Cửa hàng Phần thưởng nhé!</label>
                      <span className="text-[10px] text-gray-400 font-extrabold bg-[#F3F6FD] px-2.5 py-0.5 rounded-full border border-gray-150 animate-fade-in">Tổng: {customAvatarPool.length} Avatar</span>
                    </div>

                    {/* Frame containing all avatars fully, without outlines or borders (không cần viền xung quanh) */}
                    <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 bg-[#F8FAFC] p-3.5 rounded-[24px] border border-gray-150">
                      {customAvatarPool.map((item) => {
                        const isSelected = selectedAvatar === item.emoji;
                        return (
                          <button
                            key={item.emoji}
                            type="button"
                            onClick={() => setSelectedAvatar(item.emoji)}
                            title={item.label}
                            className={`w-11 h-11 flex items-center justify-center text-3xl transition-all cursor-pointer relative select-none rounded-xl bg-transparent hover:bg-[#F1F5F9] hover:scale-120 ${
                              isSelected ? 'bg-[#FEF9C3]/80 scale-120 z-10' : ''
                            }`}
                            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                          >
                            {item.emoji}
                            {isSelected && (
                              <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-[#22C55E] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-black ring-2 ring-white">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Notes/Ghi chú section for the picked avatar */}
                    {(() => {
                      const currentOpt = customAvatarPool.find(a => a.emoji === selectedAvatar);
                      return currentOpt ? (
                        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center gap-3 transition-all duration-300 mt-4 mb-2">
                          <span className="text-3xl select-none leading-none animate-pulse">{currentOpt.emoji}</span>
                          <div className="text-left">
                            <span className="text-[9px] text-amber-700 uppercase font-extrabold tracking-wider block leading-none mb-1">Ghi chú về hình đại diện này</span>
                            <p className="text-xs font-bold text-slate-850 leading-tight">{currentOpt.label}</p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-xs mt-4"
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                <Save className="w-4 h-4 text-white" />
                Lưu lại thay đổi thông tin 💾
              </button>
            </form>
          </div>
        )}

        {/* SUB TAB 5: NHẬT KÝ HỌC TẬP (Mỗi ngày viết 1 trang) */}
        {nestedTab === 'diary' && (
          <div className="space-y-6 text-left animate-fade-in pb-10">
            
            {/* Header section matching top of the screenshot */}
            <div className="text-left mb-6">
              <h2 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
                Nhật ký & Ghi chú của Bé 📝
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1.5 leading-normal">
                Bé hoặc bố mẹ có thể viết nhật ký học tập, ghi chú từ vựng, lưu giữ hình ảnh và video đáng yêu tại đây nha!
              </p>
            </div>

            {/* Form writing new diary logs */}
            <div id="diary-entry-form" className="bg-[#F0F8FF]/80 backdrop-blur-sm rounded-3xl p-6.5 shadow-md border-2 border-blue-105 relative">
              <div className="flex items-center gap-2 pb-3.5 border-b border-blue-100/30 mb-4">
                <span className="text-amber-500 text-lg animate-pulse">✍️</span>
                <h3 className="font-extrabold text-sm text-blue-950 uppercase tracking-wide">
                  {editingDiaryId ? 'Cập nhật nhật ký' : 'Viết nhật ký mới'}
                </h3>
              </div>

              <form onSubmit={handleAddDiary} className="space-y-4">
                {/* Title select dropdown */}
                <div className="text-left space-y-1">
                  <select
                    value={newDiaryTitle || 'Cảm thấy: Rất vui vẻ 🌟'}
                    onChange={(e) => setNewDiaryTitle(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                  >
                    <option value="Cảm thấy: Rất vui vẻ 🌟">Cảm thấy: Rất vui vẻ 🌟</option>
                    <option value="Cảm thấy: Tràn đầy năng lượng ⚡">Cảm thấy: Tràn đầy năng lượng ⚡</option>
                    <option value="Cảm thấy: Mệt mỏi 😴">Cảm thấy: Mệt mỏi 😴</option>
                    <option value="Cảm thấy: Buồn ngủ 🥱">Cảm thấy: Buồn ngủ 🥱</option>
                    <option value="Cảm thấy: Tập trung 🧐">Cảm thấy: Tập trung 🧐</option>
                    <option value="Cảm thấy: Hào hứng 🤩">Cảm thấy: Hào hứng 🤩</option>
                    <option value="Cảm thấy: Đói quá 😋">Cảm thấy: Đói quá 😋</option>
                    <option value="Cảm thấy: Thất vọng 😢">Cảm thấy: Thất vọng 😢</option>
                    <option value="Cảm thấy: Căng thẳng 🥵">Cảm thấy: Căng thẳng 🥵</option>
                    <option value="Cảm thấy: Buồn chán 😒">Cảm thấy: Buồn chán 😒</option>
                  </select>
                </div>

                {/* Content input */}
                <div className="text-left space-y-1">
                  <textarea
                    rows={4}
                    value={newDiaryContent || ''}
                    onChange={(e) => setNewDiaryContent(e.target.value)}
                    placeholder="Hôm nay bé học được từ gì vui? Viết cảm nghĩ vào đây nhé... (ví dụ: #tuvung #dongvat)"
                    className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700 leading-relaxed"
                  />
                </div>

                {/* Color note picker */}
                <div className="flex flex-col gap-4 pt-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
                    <span>Chọn màu nền Bài viết:</span>
                    <div className="flex items-center gap-2.5">
                      {[
                        { index: 0, text: 'Blue', border: 'border-blue-400', bg: 'bg-[#EBF5FF]', dot: 'bg-blue-400' },
                        { index: 1, text: 'Red', border: 'border-red-400', bg: 'bg-[#FFF0F2]', dot: 'bg-red-400' },
                        { index: 2, text: 'Yellow', border: 'border-amber-400', bg: 'bg-[#FFF9E6]', dot: 'bg-amber-400' },
                        { index: 3, text: 'Green', border: 'border-emerald-400', bg: 'bg-[#EEFBF3]', dot: 'bg-emerald-400' },
                        { index: 4, text: 'Purple', border: 'border-violet-400', bg: 'bg-[#F2EFFF]', dot: 'bg-violet-400' }
                      ].map((c) => (
                        <button
                          key={c.index}
                          type="button"
                          onClick={() => setNewDiaryColorIndex(c.index)}
                          className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer border flex items-center justify-center ${c.bg} ${
                            newDiaryColorIndex === c.index 
                              ? `${c.border} ring-4 ring-blue-105 scale-110 shadow-sm` 
                              : 'border-slate-300 hover:scale-105'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attachment Block matching draft */}
                  <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-white/70 space-y-3 shadow-none">
                    <div className="text-[11px] font-black text-rose-500 uppercase tracking-wide">
                      📍 Đính kèm hình ảnh hoặc video bài học:
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('diary-image-upload')?.click()}
                        className="bg-blue-500 text-white font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-sm active:translate-y-0.5 cursor-pointer hover:bg-blue-600"
                      >
                        🖼️ Tải Ảnh Lên
                      </button>

                      <span className="text-[11px] text-gray-400 font-bold ml-1.5">
                        Hoặc dán URL media ở dưới
                      </span>
                    </div>

                    <input
                      type="text"
                      value={newDiaryMediaUrl || ''}
                      onChange={(e) => {
                        setNewDiaryMediaUrl(e.target.value);
                        // Auto-detect type
                        if (e.target.value.includes('youtube') || e.target.value.includes('youtu.be') || e.target.value.endsWith('.mp4') || e.target.value.endsWith('.mov')) {
                          setNewDiaryMediaType('video');
                        } else {
                          setNewDiaryMediaType('image');
                        }
                      }}
                      placeholder="Dán link ảnh hoặc video (Youtube/MP4) trực tiếp..."
                      className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-300 transition-all text-slate-800"
                    />

                    {/* Hidden inputs */}
                    <input
                      id="diary-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setNewDiaryMediaUrl(reader.result as string);
                            setNewDiaryMediaType('image');
                            triggerToast('🖼️ Đính kèm ảnh thành công!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <input
                      id="diary-video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setNewDiaryMediaUrl(reader.result as string);
                            setNewDiaryMediaType('video');
                            triggerToast('🎥 Đính kèm video thành công!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {/* Extra clear helpers */}
                    {newDiaryMediaUrl && (
                      <div className="flex items-center justify-between bg-blue-50/50 p-2.5 rounded-xl text-xs">
                        <span className="text-gray-500 font-bold truncate max-w-md">
                          Đã đính kèm {newDiaryMediaType === 'image' ? '🖼️ Ảnh' : '🎥 Video'}: {newDiaryMediaUrl.startsWith('data:') ? '(Ảnh tự chụp)' : newDiaryMediaUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewDiaryMediaUrl('')}
                          className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer hover:underline text-xs"
                        >
                          Xóa đính kèm ❌
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button wrapper */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 transition-all duration-100 flex items-center gap-1.5 uppercase tracking-wide cursor-pointer shadow-sm"
                  >
                    <span>💾</span>
                    {editingDiaryId ? 'Lưu nhật ký' : 'Lưu nhật ký'}
                  </button>
                </div>
              </form>
            </div>

            {/* List and Grid of Diaries */}
            <div className="space-y-4 pt-4">
              <h4 className="font-extrabold text-[#2454A6] text-sm flex items-center gap-2 pl-1.5 uppercase">
                <span>📒</span>
                Nhật ký học tập của bé
              </h4>

              {diaryList.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold text-xs">
                  Chưa có trang nhật ký học tập nào. Bé hãy viết nhật ký đầu tiên phía trên nhé!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {diaryList.map((diary) => {
                    // Extract styles based on background colour index
                    const cardTheme = [
                      { bg: 'bg-[#EBF5FF]', border: 'border-[#BEE3FF] border-2', text: 'text-blue-900', labelBg: 'bg-blue-100/50 text-blue-800' }, // Blue
                      { bg: 'bg-[#FFF0F2]', border: 'border-[#FFD2D9] border-2', text: 'text-rose-900', labelBg: 'bg-rose-100/50 text-rose-800' }, // Red/Pink
                      { bg: 'bg-[#FFF9E6]', border: 'border-[#FDE68A] border-2', text: 'text-amber-900', labelBg: 'bg-amber-10-5 text-amber-900' }, // Yellow
                      { bg: 'bg-[#EEFBF3]', border: 'border-[#C6F6D5] border-2', text: 'text-emerald-900', labelBg: 'bg-emerald-100/50 text-emerald-800' }, // Green
                      { bg: 'bg-[#F2EFFF]', border: 'border-[#DDD6FE] border-2', text: 'text-indigo-900', labelBg: 'bg-indigo-100/50 text-indigo-800' } // Purple
                    ][diary.colorIndex || 0] || { bg: 'bg-white', border: 'border-gray-200 border-2', text: 'text-slate-800', labelBg: 'bg-gray-100' };

                    return (
                      <div 
                        key={diary.id}
                        className={`${cardTheme.bg} ${cardTheme.border} p-5 rounded-3xl shadow-sm relative flex flex-col justify-between transition duration-200 hover:scale-[1.01] hover:shadow-md text-left`}
                      >
                        <div>
                          {/* Title and Date line */}
                          <div className="flex items-start justify-between gap-2.5 mb-2.5">
                            <h5 className="font-extrabold text-[13px] text-slate-800 leading-tight">
                              {diary.title || 'Nhật ký học tập'}
                            </h5>
                            <span className="text-[9px] font-bold text-gray-400 shrink-0 mt-0.5">
                              {diary.date}
                            </span>
                          </div>

                          {/* Decorative small divider line */}
                          <div className="border-t border-slate-300/30 my-2" />

                          {/* Content summary */}
                          <p className="text-[12px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                            {diary.content}
                          </p>

                          {/* Attached Media container */}
                          {diary.mediaUrl && (
                            <div className="rounded-2xl overflow-hidden border border-slate-205 mb-4 shadow-sm relative bg-black/5 flex items-center justify-center select-none">
                              {diary.mediaType === 'video' ? (
                                <div className="relative w-full aspect-video flex items-center justify-center">
                                  <img 
                                    src={diary.mediaUrl} 
                                    alt="Video thumbnail"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover" 
                                  />
                                  {/* YouTube Sim play button matching draft */}
                                  <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition cursor-pointer">
                                    <div className="w-14 h-10 bg-red-650 hover:bg-red-700 rounded-2xl flex items-center justify-center shadow-lg transform duration-150 hover:scale-[1.1]">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-0.5">
                                        <path d="M8 5.14v14c0 .86.94 1.36 1.66.9l10-7a1 1 0 000-1.8l-10-7A1 1 0 008 5.14z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full aspect-[4/3] overflow-hidden">
                                  <img 
                                    src={diary.mediaUrl} 
                                    alt="Diary photo"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card bottom area containing tags and action buttons */}
                        <div className="flex items-end justify-between mt-1 pt-1.5 gap-2 border-t border-slate-300/10">
                          {/* Tags block on left side */}
                          <div className="flex flex-wrap gap-1 md:max-w-[60%]">
                            {diary.tags && diary.tags.length > 0 ? (
                              diary.tags.map(tag => (
                                <span 
                                  key={tag} 
                                  className="text-[10px] font-black text-blue-500 hover:underline cursor-pointer"
                                >
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              // Try to find custom hashtags in description directly otherwise
                              diary.content.match(/#([\w\u00C0-\u1EF9]+)/g)?.map((tag, i) => (
                                <span 
                                  key={i} 
                                  className="text-[10px] font-black text-blue-500 hover:underline cursor-pointer animate-fade-in"
                                >
                                  {tag}
                                </span>
                              ))
                            )}
                          </div>

                          {/* Edit / Delete action buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEditDiary(diary)}
                              className="bg-blue-500 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg active:translate-y-0.5 border-b border-blue-700 hover:bg-blue-600 cursor-pointer transition flex items-center justify-center gap-0.5 shadow-sm"
                            >
                              <span>✏️</span> Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteDiary(diary.id)}
                              className="bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg active:translate-y-0.5 border-b border-red-700 hover:bg-red-600 cursor-pointer transition flex items-center justify-center gap-0.5 shadow-sm"
                            >
                              <span>🗑️</span> Xóa
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUB TAB 6: LỊCH SỬ KIỂM TRA (PDF) */}
        {nestedTab === 'test_history' && (
          <div className="space-y-6 text-left animate-fade-in pb-10">
            
            <div className="text-left mb-6">
              <h2 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
                Lịch sử Kiểm tra & Bảng điểm PDF 📊
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1.5 leading-normal">
                Nơi lưu trữ tất cả các báo cáo điểm số khảo thí và định hướng nhận xét học tập của bé. Bé có thể in lại bản gốc hoặc chia sẻ trực tuyến cho bố mẹ tại đây nha!
              </p>
            </div>

            <TestHistoryList studentName={profile.fullname} studentGrade={profile.grade} />

          </div>
        )}

      </div>

    </div>
  );
}

// -------------------------------------------------------------
// HELPER COMPONENT: TestHistoryList
// Displays a visual grid of exported scorecards, with search, visual bars, printing, and share links
// -------------------------------------------------------------
function TestHistoryList({ studentName, studentGrade }: { studentName: string; studentGrade?: number }) {
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lms_completed_pdf_reports') || '[]');
      // Filter reports matching this user’s name or show all if name is empty
      const filtered = saved.filter((r: any) => 
        !studentName || r.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()
      );
      setReports(filtered);
    } catch (e) {
      console.error("Lỗi lấy lịch sử bảng điểm lms_completed_pdf_reports:", e);
    }
  }, [studentName]);

  const handlePrint = (report: any) => {
    const htmlContent = generateStudentExamPDFHtml(
      report.examObj,
      report.answers,
      report.score,
      report.studentName,
      report.studentClass
    );
    printExamPDF(htmlContent);
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}${window.location.pathname}?shareReportId=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredReports = reports.filter((r: any) => 
    r.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex gap-2">
        <input 
          type="text"
          placeholder="🔍 Tìm kiếm đề thi đã kiểm tra..."
          value={searchTerm || ''}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white border border-slate-200 px-4 py-3.5 text-xs font-bold rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition text-slate-800"
        />
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-[#F0F8FF]/80 p-8 rounded-3xl border-2 border-slate-200 text-center space-y-2">
          <div className="text-4xl">📁📭</div>
          <h4 className="font-extrabold text-[#1E3A8A] text-sm">Chưa có lịch sử kiểm tra mẫu</h4>
          <p className="text-slate-505 font-medium max-w-sm mx-auto leading-relaxed">
            Học viên chưa hoàn thành bài thi số nào trực tuyến trên tài khoản này. Hãy chuyển sang phần đề thi thử trực tuyến hoặc làm bài thi của lớp ngay nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const isGold = report.score >= 9.0;
            const isSilver = report.score >= 7.0 && report.score < 9.0;
            const isBronze = report.score >= 5.0 && report.score < 7.0;

            let badgeStyle = "bg-slate-100 text-slate-705 border-slate-200";
            let badgeText = "Hoàn thành";
            if (isGold) {
              badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold";
              badgeText = "Xuất sắc (Gold) ⭐";
            } else if (isSilver) {
              badgeStyle = "bg-blue-100 text-blue-800 border-blue-300 font-extrabold";
              badgeText = "Khá tốt (Silver) 🥈";
            } else if (isBronze) {
              badgeStyle = "bg-amber-100 text-amber-800 border-amber-300 font-extrabold";
              badgeText = "Đạt (Bronze) 🥉";
            }

            return (
              <div 
                key={report.id}
                className="bg-white p-5 rounded-2xl border border-slate-205 hover:border-blue-400 transition shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="text-[10px] uppercase font-black text-indigo-500 block">
                      {report.subject || 'Tin học'} Lớp {report.grade || studentGrade || 3}
                    </span>
                    <span className={`text-[9px] uppercase px-2 py-0.5 border rounded-lg ${badgeStyle}`}>
                      🏆 {badgeText}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-blue-950 text-sm leading-tight">{report.testName}</h4>
                  <div className="text-[11px] font-semibold text-slate-400 flex justify-between">
                    <span>Nộp ngày: {report.completedAt}</span>
                    <span className="text-[#2454a6] font-black">Lớp: {report.studentClass}</span>
                  </div>
                </div>

                {/* Score progress track */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[9.5px] uppercase font-black text-slate-400">Điểm số báo cáo</span>
                    <div className="text-sm font-extrabold text-slate-800">{report.score} / 10đ</div>
                  </div>
                  <div className="w-1/2 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isGold ? 'bg-emerald-500' : isSilver ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${report.score * 10}%` }}
                    />
                  </div>
                </div>

                {/* Print and Share controls */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => handlePrint(report)}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition flex items-center justify-center gap-1 border-b-2 border-rose-900"
                  >
                    📥 Tải PDF Gốc
                  </button>
                  <button 
                    onClick={() => handleCopyLink(report.id)}
                    className={`py-2.5 text-[11px] font-extrabold rounded-lg cursor-pointer transition flex items-center justify-center gap-1 border ${copiedId === report.id ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-[#2454a6] border-slate-205 hover:bg-slate-50'}`}
                  >
                    🔗 {copiedId === report.id ? 'Đã sao chép!' : 'Gửi cho bố mẹ'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
