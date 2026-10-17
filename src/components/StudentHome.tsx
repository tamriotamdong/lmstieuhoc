import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Award, 
  MapPin, 
  BookOpen, 
  Clipboard, 
  Gamepad2, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  User,
  School,
  CheckSquare,
  Calendar,
  Check,
  LogOut
} from 'lucide-react';
import { Badge, StudentProfile, LeaderboardEntry, Lesson, INITIAL_BADGES, Level, ShopItem } from '../types';
import { INITIAL_SHOP_ITEMS } from '../App';

export const PASTEL_THEMES = [
  {
    name: 'hồng',
    bg: 'bg-[#FFF0F2]',
    bgHover: 'hover:bg-[#FFE2E6]',
    border: 'border-[#FFD3D9]',
    text: 'text-[#9B1C31]',
    lightText: 'text-[#A24B5D]',
    badgeBg: 'bg-[#FFA6B7]/20',
    titleColor: 'text-[#9B1C31]',
    btnBg: 'bg-[#FF8DA1] hover:bg-[#FF738E]',
    btnBorder: 'border-[#E26980]',
    accentBg: 'bg-[#FFE2E6]',
  },
  {
    name: 'xanh dương',
    bg: 'bg-[#EBF3FF]',
    bgHover: 'hover:bg-[#D8ECFF]',
    border: 'border-[#C7DFFF]',
    text: 'text-[#1A569B]',
    lightText: 'text-[#336AA6]',
    badgeBg: 'bg-[#BEE0FF]/50',
    titleColor: 'text-[#1A569B]',
    btnBg: 'bg-[#42A5F5] hover:bg-[#29B6F6]',
    btnBorder: 'border-[#1E88E5]',
    accentBg: 'bg-[#D8ECFF]',
  },
  {
    name: 'vàng',
    bg: 'bg-[#FFFDE8]',
    bgHover: 'hover:bg-[#FFF9CE]',
    border: 'border-[#FFF5B8]',
    text: 'text-[#826000]',
    lightText: 'text-[#99791F]',
    badgeBg: 'bg-[#FDE047]/20',
    titleColor: 'text-[#826000]',
    btnBg: 'bg-[#F59E0B] hover:bg-[#D97706]',
    btnBorder: 'border-[#B45309]',
    accentBg: 'bg-[#FFF9CE]',
  },
  {
    name: 'xanh lá',
    bg: 'bg-[#EEFBF3]',
    bgHover: 'hover:bg-[#E0F8E9]',
    border: 'border-[#D1F5DF]',
    text: 'text-[#0F6F3A]',
    lightText: 'text-[#2B8A5A]',
    badgeBg: 'bg-[#A7F3D0]/20',
    titleColor: 'text-[#0F6F3A]',
    btnBg: 'bg-[#10B981] hover:bg-[#059669]',
    btnBorder: 'border-[#047857]',
    accentBg: 'bg-[#E0F8E9]',
  },
  {
    name: 'tím',
    bg: 'bg-[#F7EDFF]',
    bgHover: 'hover:bg-[#F2DEFF]',
    border: 'border-[#EAD1FF]',
    text: 'text-[#67308F]',
    lightText: 'text-[#8452AA]',
    badgeBg: 'bg-[#E9D5FF]/30',
    titleColor: 'text-[#67308F]',
    btnBg: 'bg-[#A78BFA] hover:bg-[#8B5CF6]',
    btnBorder: 'border-[#7C3AED]',
    accentBg: 'bg-[#F2DEFF]',
  },
  {
    name: 'cam',
    bg: 'bg-[#FFF5EC]',
    bgHover: 'hover:bg-[#FFEBD9]',
    border: 'border-[#FFE0C5]',
    text: 'text-[#B24E00]',
    lightText: 'text-[#C66A23]',
    badgeBg: 'bg-[#FED7AA]/30',
    titleColor: 'text-[#B24E00]',
    btnBg: 'bg-[#FF9E59] hover:bg-[#FF8333]',
    btnBorder: 'border-[#E06611]',
    accentBg: 'bg-[#FFEBD9]',
  },
  {
    name: 'đỏ',
    bg: 'bg-[#FFF2F2]',
    bgHover: 'hover:bg-[#FFE5E5]',
    border: 'border-[#FFD6D6]',
    text: 'text-[#C51D1D]',
    lightText: 'text-[#D44747]',
    badgeBg: 'bg-[#FEE2E2]/40',
    titleColor: 'text-[#C51D1D]',
    btnBg: 'bg-[#EF4444] hover:bg-[#DC2626]',
    btnBorder: 'border-[#B91C1C]',
    accentBg: 'bg-[#FFE5E5]',
  }
];

interface StudentHomeProps {
  profile: StudentProfile;
  role?: string;
  lessons: Lesson[];
  activeStudyProgress: { [lessonId: string]: number }; // percentage
  onSelectLesson: (lessonId: string) => void;
  onSelectTab: (tab: string) => void;
  onSelectTabAndSubtab?: (tab: string, subtab: string) => void;
  onUpdateXP?: (earnedXP: number, taskName: string) => void;
  onLogout?: () => void;
  totalCollectedXP?: number;
  purchasedRewards?: string[];
  onBuyReward?: (itemId: string, costXP: number, name: string) => void;
  badgesList?: Badge[];
  levelsList?: Level[];
  shopItemsList?: ShopItem[];
}

export default function StudentHome({
  profile,
  role = 'student',
  lessons,
  activeStudyProgress,
  onSelectLesson,
  onSelectTab,
  onSelectTabAndSubtab,
  onUpdateXP,
  onLogout,
  totalCollectedXP,
  purchasedRewards = [],
  onBuyReward,
  badgesList,
  levelsList,
  shopItemsList
}: StudentHomeProps) {
  const [leaderboardFilter, setLeaderboardFilter] = useState<'class' | 'grade' | 'school'>('class');
  const [shopRarityFilter, setShopRarityFilter] = useState<string>('Tất cả');

  const getDisplayName = (fullname: string) => {
    let name = fullname.replace(/\s*\(Bạn\)\s*/g, '').replace(/👋/g, '').trim();
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts.slice(-2).join(' ');
    }
    return name;
  };

  const studentDisplayName = profile ? getDisplayName(profile.fullname) : 'Minh Tâm';

  // Helper values derived for student rankings & badges in home view
  let homeActiveTier = 'Đồng ⚪';
  let homeHighestBadgeName = 'Tân Bình Tin học 🌱';
  let totalEarnedBadges = 5;

  if (profile) {
    const checkXP = typeof totalCollectedXP === 'number' ? totalCollectedXP : profile.xp;
    const earnedBadges = (badgesList || INITIAL_BADGES).filter(b => checkXP >= b.xpRequired);
    totalEarnedBadges = earnedBadges.length;
    if (earnedBadges.length > 0) {
      const highestBadge = earnedBadges[earnedBadges.length - 1];
      homeHighestBadgeName = highestBadge.title;
      homeActiveTier = highestBadge.tier === 'Đồng' ? 'Hạng Đồng ️🥉'
                 : highestBadge.tier === 'Bạc' ? 'Hạng Bạc ️🥈'
                 : highestBadge.tier === 'Vàng' ? 'Hạng Vàng ️🥇'
                 : highestBadge.tier === 'Kim Cương' ? 'Hạng Kim Cương 💎'
                 : 'Hạng Huyền Thoại 👑';
    }
  }

  // --- REAL-TIME TICKING CLOCK ---
  const [currentClockTime, setCurrentClockTime] = useState<Date>(new Date());
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentClockTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formatClockTimeVal = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatClockDateVal = (date: Date) => {
    const daysName = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayName = daysName[date.getDay()];
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  // --- INTERACTIVE SUB-SYSTEM: DAILY CHECK-IN (ĐIỂM DANH HÀNG NGÀY) ---
  const currentDayOfWeekIdx = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const weekDaysStr = ['Chủ nhật ☀️', 'Thứ 2 📅', 'Thứ 3 📅', 'Thứ 4 📅', 'Thứ 5 📅', 'Thứ 6 📅', 'Thứ 7 📅'];
  const [checkedDays, setCheckedDays] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(`checkedDays_${profile.fullname}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [false, false, false, false, false, false, false];
  });
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`checkedDays_${profile.fullname}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed[currentDayOfWeekIdx];
      }
    } catch (e) {}
    return false;
  });

  const handleCheckInToday = () => {
    if (hasCheckedInToday) return;
    
    const newChecked = [...checkedDays];
    newChecked[currentDayOfWeekIdx] = true;
    setCheckedDays(newChecked);
    setHasCheckedInToday(true);
    localStorage.setItem(`checkedDays_${profile.fullname}`, JSON.stringify(newChecked));
    
    if (onUpdateXP) {
      onUpdateXP(10, `Điểm danh chuyên cần ${weekDaysStr[currentDayOfWeekIdx].split(' ')[0]}`);
    }
  };

  // --- INTERACTIVE SUB-SYSTEM: DAILY QUESTS (NHIỆM VỤ HÀNG NGÀY) ---
  const [showQuestsModal, setShowQuestsModal] = useState<boolean>(false);
  const [isQuestsGiftClaimed, setIsQuestsGiftClaimed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`questsClaimed_${profile?.fullname}`);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const [questsState, setQuestsState] = useState<{
    id: string;
    name: string;
    type: string;
    emoji: string;
    current: number;
    target: number;
    points: number;
    suffix: string;
  }[]>(() => {
    try {
      const saved = localStorage.getItem(`questsState_v2_${profile?.fullname}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    if (role === 'teacher') {
      return [
        { id: 'attendance', name: 'Điểm danh hàng ngày', type: 'attendance', emoji: '📅', current: 0, target: 1, points: 5, suffix: '' },
        { id: 'create_lesson', name: 'Tạo một giáo án', type: 'create_lesson', emoji: '📘', current: 0, target: 1, points: 10, suffix: '' },
        { id: 'create_game', name: 'Tạo một trò chơi', type: 'create_game', emoji: '🎮', current: 0, target: 1, points: 10, suffix: '' },
        { id: 'create_test', name: 'Tạo một bài kiểm tra', type: 'create_test', emoji: '📝', current: 0, target: 1, points: 10, suffix: '' },
      ];
    }
    return [
      { id: 'attendance', name: 'Điểm danh hàng ngày', type: 'attendance', emoji: '📅', current: 0, target: 1, points: 5, suffix: '' },
      { id: 'learn', name: 'Học một bài học', type: 'learn', emoji: '📘', current: 0, target: 1, points: 10, suffix: '' },
      { id: 'exercise', name: 'Làm một bài tập', type: 'exercise', emoji: '📋', current: 0, target: 1, points: 10, suffix: '' },
    ];
  });

  // Synchronize quests from localStorage on mount, profile change, or modal opening
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`questsState_v2_${profile?.fullname}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasTeacherQuest = parsed.some((q: any) => q.id === 'create_lesson' || q.id === 'create_game' || q.id === 'create_test');
        if (role === 'teacher' && !hasTeacherQuest) {
          const freshTeacherQuests = [
            { id: 'attendance', name: 'Điểm danh hàng ngày', type: 'attendance', emoji: '📅', current: 0, target: 1, points: 5, suffix: '' },
            { id: 'create_lesson', name: 'Tạo một giáo án', type: 'create_lesson', emoji: '📘', current: 0, target: 1, points: 10, suffix: '' },
            { id: 'create_game', name: 'Tạo một trò chơi', type: 'create_game', emoji: '🎮', current: 0, target: 1, points: 10, suffix: '' },
            { id: 'create_test', name: 'Tạo một bài kiểm tra', type: 'create_test', emoji: '📝', current: 0, target: 1, points: 10, suffix: '' },
          ];
          setQuestsState(freshTeacherQuests);
          localStorage.setItem(`questsState_v2_${profile?.fullname}`, JSON.stringify(freshTeacherQuests));
        } else if (role !== 'teacher' && hasTeacherQuest) {
          const freshStudentQuests = [
            { id: 'attendance', name: 'Điểm danh hàng ngày', type: 'attendance', emoji: '📅', current: 0, target: 1, points: 5, suffix: '' },
            { id: 'learn', name: 'Học một bài học', type: 'learn', emoji: '📘', current: 0, target: 1, points: 10, suffix: '' },
            { id: 'exercise', name: 'Làm một bài tập', type: 'exercise', emoji: '📋', current: 0, target: 1, points: 10, suffix: '' },
          ];
          setQuestsState(freshStudentQuests);
          localStorage.setItem(`questsState_v2_${profile?.fullname}`, JSON.stringify(freshStudentQuests));
        } else {
          setQuestsState(parsed);
        }
      } else {
        if (role === 'teacher') {
          const freshTeacherQuests = [
            { id: 'attendance', name: 'Điểm danh hàng ngày', type: 'attendance', emoji: '📅', current: 0, target: 1, points: 5, suffix: '' },
            { id: 'create_lesson', name: 'Tạo một giáo án', type: 'create_lesson', emoji: '📘', current: 0, target: 1, points: 10, suffix: '' },
            { id: 'create_game', name: 'Tạo một trò chơi', type: 'create_game', emoji: '🎮', current: 0, target: 1, points: 10, suffix: '' },
            { id: 'create_test', name: 'Tạo một bài kiểm tra', type: 'create_test', emoji: '📝', current: 0, target: 1, points: 10, suffix: '' },
          ];
          setQuestsState(freshTeacherQuests);
          localStorage.setItem(`questsState_v2_${profile?.fullname}`, JSON.stringify(freshTeacherQuests));
        } else {
          const freshStudentQuests = [
            { id: 'attendance', name: 'Điểm danh hàng ngày', type: 'attendance', emoji: '📅', current: 0, target: 1, points: 5, suffix: '' },
            { id: 'learn', name: 'Học một bài học', type: 'learn', emoji: '📘', current: 0, target: 1, points: 10, suffix: '' },
            { id: 'exercise', name: 'Làm một bài tập', type: 'exercise', emoji: '📋', current: 0, target: 1, points: 10, suffix: '' },
          ];
          setQuestsState(freshStudentQuests);
          localStorage.setItem(`questsState_v2_${profile?.fullname}`, JSON.stringify(freshStudentQuests));
        }
      }
    } catch (e) {
      console.error('Error loading quests from local storage:', e);
    }
  }, [showQuestsModal, profile?.fullname, role]);

  // Active running task inside modal: null | 'learn' | 'exercise' | 'game'
  const [activeTaskRunning, setActiveTaskRunning] = useState<string | null>(null);

  // States for 'learn' mini tutorial slides
  const [learnStep, setLearnStep] = useState<number>(1);

  // States for 'exercise' 1-item quiz
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean | null>(null);

  // States for 'game' keyboard challenge
  const [typingGameKeys, setTypingGameKeys] = useState<string[]>([]);
  const [typingGameIndex, setTypingGameIndex] = useState<number>(0);
  const [typingGameSuccess, setTypingGameSuccess] = useState<boolean>(false);

  // React strictly to check-in component to auto-complete attendance task
  useEffect(() => {
    if (hasCheckedInToday) {
      setQuestsState(prev => {
        const isDone = prev.some(q => q.id === 'attendance' && q.current >= q.target);
        if (isDone) return prev;
        const updated = prev.map(q => q.id === 'attendance' ? { ...q, current: q.target } : q);
        localStorage.setItem(`questsState_v2_${profile?.fullname}`, JSON.stringify(updated));
        return updated;
      });
    }
  }, [hasCheckedInToday, profile?.fullname]);

  // Keys challenge input listener
  useEffect(() => {
    if (activeTaskRunning !== 'game' || typingGameSuccess) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        const targetChar = typingGameKeys[typingGameIndex];
        if (key === targetChar) {
          const nextIndex = typingGameIndex + 1;
          if (nextIndex >= typingGameKeys.length) {
            setTypingGameSuccess(true);
          } else {
            setTypingGameIndex(nextIndex);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTaskRunning, typingGameKeys, typingGameIndex, typingGameSuccess]);

  const handleIncrementQuest = (questId: string) => {
    const updated = questsState.map(q => {
      if (q.id === questId) {
        if (q.current < q.target) {
          const nextVal = q.current + 1;
          if (nextVal === q.target) {
            if (onUpdateXP) {
              onUpdateXP(q.points, `Hoàn thành nhiệm vụ: ${q.name}`);
            }
          }
          return { ...q, current: nextVal };
        }
      }
      return q;
    });
    setQuestsState(updated);
    localStorage.setItem(`questsState_v2_${profile?.fullname}`, JSON.stringify(updated));
  };

  const startQuestTask = (questId: string) => {
    if (questId === 'attendance') {
      if (!hasCheckedInToday) {
        handleCheckInToday();
      } else {
        handleIncrementQuest('attendance');
      }
    } else if (questId === 'learn') {
      setShowQuestsModal(false);
      onSelectTab('lessons');
      alert('🌟 Thầy Cô đang chuyển bé mến yêu đến trang "Bài học" tập luyện lý thuyết và thực hành gõ 10 ngón tay nhé! Chúc bé thật vui vẻ!');
    } else if (questId === 'exercise') {
      setShowQuestsModal(false);
      onSelectTab('exercises');
      alert('🌟 Thầy Cô đang chuyển bé mến yêu đến trang "Bài tập" tranh tài trắc nghiệm thông thái nhé!');
    } else if (questId === 'game') {
      setShowQuestsModal(false);
      onSelectTab('games');
      alert('🌟 Thầy Cô đang chuyển bé mến yêu đến "Phòng game gõ phím" để giải trí rèn phản xạ nhé!');
    } else if (questId === 'create_lesson') {
      setShowQuestsModal(false);
      onSelectTab('lesson_planner');
      handleIncrementQuest('create_lesson');
      alert('👩‍🏫 Hệ thống đang đưa Thầy/Cô đến trang "Soạn giáo án" chuyên nghiệp nhé!');
    } else if (questId === 'create_game') {
      setShowQuestsModal(false);
      onSelectTab('game_creator');
      handleIncrementQuest('create_game');
      alert('👩‍🏫 Hệ thống đang đưa Thầy/Cô đến trang "Tạo trò chơi" sinh động, hấp dẫn nhé!');
    } else if (questId === 'create_test') {
      setShowQuestsModal(false);
      onSelectTab('test_creator');
      handleIncrementQuest('create_test');
      alert('👩‍🏫 Hệ thống đang đưa Thầy/Cô đến trang "Tạo bài kiểm tra" tự động hóa nhé!');
    }
  };

  const finishQuestTask = (questId: string) => {
    handleIncrementQuest(questId);
    setActiveTaskRunning(null);
  };

  const handleClaimDailyGift = () => {
    if (isQuestsGiftClaimed) return;
    const allCompleted = questsState.every(q => q.current >= q.target);
    if (!allCompleted) {
      alert('Bé cần hoàn thành tất cả nhiệm vụ để nhận hộp quà nhé! Hãy chọn làm những nhiệm vụ chưa xong.');
      return;
    }
    
    setIsQuestsGiftClaimed(true);
    localStorage.setItem(`questsClaimed_${profile?.fullname}`, 'true');
    if (onUpdateXP) {
      onUpdateXP(20, 'Nhận quà Nhiệm vụ Hằng Ngày 🎁');
    }
    alert('🎉 Tuyệt vời! Bé đã nhận được hộp quà Nhiệm vụ Hằng ngày trị giá +20 Sao Vàng! 🌟 Hoan hô bé!');
  };

  const completedQuestsCount = questsState.filter(q => q.current >= q.target).length;

  // Interactive sample leaderboard
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

  // Get current filtered rankings pool
  const currentLeaderboard = mockLeaderboards[leaderboardFilter].sort((a,b) => b.xp - a.xp);

  // Filter lessons for the student's assigned Grade level
  const myLessons = lessons.filter(l => l.grade === profile.grade);

  // SVG beautiful curved Chart progress points representation: Let's assume daily learning track points
  const progressChartPoints = [
    { day: 'Thứ 2', xp: Math.max(20, profile.xp - 120) },
    { day: 'Thứ 3', xp: Math.max(50, profile.xp - 80) },
    { day: 'Thứ 4', xp: Math.max(100, profile.xp - 40) },
    { day: 'Thứ 5', xp: profile.xp }
  ];

  // SVG curved path calculator
  const width = 450;
  const height = 140;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...progressChartPoints.map(p => p.xp), 100);
  const minVal = 0;

  const pointsString = progressChartPoints.map((p, idx) => {
    const x = padding + (idx / (progressChartPoints.length - 1)) * chartWidth;
    const y = height - padding - ((p.xp - minVal) / (maxVal - minVal || 1)) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const isTeacherOrAdmin = role === 'teacher' || role === 'admin';

  const stations = isTeacherOrAdmin ? [
    {
      id: "station-card-lessons",
      title: "Soạn Giáo Án",
      emoji: "📖",
      desc: "Soạn giáo án thông thái chuẩn 2345 bám sát sách giáo dục tiểu học bằng AI!",
      action: "Soạn Giáo Án ngay",
      onClick: () => onSelectTab('lesson_planner'),
      disabled: false,
    },
    {
      id: "station-card-exercises",
      title: "Viết Sáng Kiến",
      emoji: "💡",
      desc: "Trợ lý ảo hỗ trợ lập đề cương, chạy phản biện logic, hoàn thiện SKKN!",
      action: "Viết Sáng Kiến ngay",
      onClick: () => onSelectTab('skkn_creator'),
      disabled: false,
    },
    {
      id: "station-card-typing-game",
      title: "Tạo Trò Chơi",
      emoji: "🎮",
      desc: "Chế tác nhanh các trò chơi học tập vui nhộn để thu hút học sinh tích cực!",
      action: "Tạo Trò Chơi ngay",
      onClick: () => onSelectTab('game_creator'),
      disabled: false,
    },
    {
      id: "station-card-test-creator",
      title: "Tạo Đề Thi",
      emoji: "🧮",
      desc: "Kiến tạo các đề ôn tập, trắc nghiệm nhanh đánh giá sát lực học tập học sinh!",
      action: "Tạo Đề Thi ngay",
      onClick: () => onSelectTab('test_creator'),
      disabled: false,
    },
    {
      id: "station-card-achievements",
      title: "Thành tích",
      emoji: "🏆",
      desc: "Bảng vàng vinh danh những nỗ lực học tập vượt bậc của tập thể học sinh!",
      action: "Xem Thành tích ngay",
      onClick: () => onSelectTab('achievements'),
      disabled: false,
    },
    {
      id: "station-card-rewards",
      title: "Phần thưởng",
      emoji: "🎁",
      desc: "Xem và quản lý kho quà thưởng, đổi điểm sao lấy phần quà kích lệ học tập!",
      action: "Xem Phần thưởng ngay",
      onClick: () => onSelectTab('rewards'),
      disabled: false,
    }
  ] : [
    {
      id: "station-card-lessons",
      title: "Khám phá Bài học",
      emoji: "📖",
      desc: "Có rất nhiều Bài học đang chờ đợi bạn khám phá đấy!",
      action: "Học Bài Thôi",
      onClick: () => onSelectTab('lessons'),
      disabled: false,
    },
    {
      id: "station-card-exercises",
      title: "Thử thách Bài tập",
      emoji: "🧮",
      desc: "Hàng trăm câu đố luyện trí, vượt qua để nhận sao lấp lánh!",
      action: "Luyện Đề Nào",
      onClick: () => onSelectTab('exercises'),
      disabled: false,
    },
    {
      id: "station-card-typing-game",
      title: "Phòng chơi Game",
      emoji: "⌨️",
      desc: "Chơi game giải trí và tăng hứng thú trong học tập nào!",
      action: "Chơi Game Thôi",
      onClick: () => onSelectTab('games'),
      disabled: false,
    },
    {
      id: "station-card-rewards",
      title: "Cửa hàng quà tặng",
      emoji: "🏅",
      desc: "Đổi sao tích lũy lấy những Avatar dễ thương độc đáo nhé!",
      action: "Đổi Quà Thôi",
      onClick: () => onSelectTab('rewards'),
      disabled: false,
    },
    {
      id: "station-card-profile",
      title: "Góc học tập của bé",
      emoji: "🦊",
      desc: "Xem chi tiết tiến độ, đổi hình đại diện ngầu và kho huy hiệu!",
      action: "Xem Hồ Sơ",
      onClick: () => onSelectTab('student'),
      disabled: false,
    },
    {
      id: "station-card-achievements",
      title: "Đấu trường thành tích",
      emoji: "🏆",
      desc: "Chinh phục các cột mốc vinh quang và so tài cùng bạn bè!",
      action: "Vào Bảng Vàng",
      onClick: () => onSelectTab('achievements'),
      disabled: false,
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 animate-fade-in text-[#334155] items-start">
      
      {/* LEFT COLUMN: Main Learning Center Flow (8/12 layout) */}
      <div className="lg:col-span-8 space-y-6 text-left" id="student-main-left-column">
        
        {/* A. High Contrast Hero Banner */}
        <div className="bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white rounded-[28px] p-6 relative overflow-hidden shadow-md min-h-[220px] flex flex-col justify-between" id="hero-banner-card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>

          <div className="relative z-10 space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#FFFDE8] text-amber-900 font-extrabold text-[10px] md:text-xs uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm animate-pulse">
              <span>🎓</span> {isTeacherOrAdmin ? "CỔNG CHUYÊN MÔN AI - SMART LỚP HỌC HẠNH PHÚC" : "HỌC VUI MỖI NGÀY, ĐIỂM 10 TRAO TAY!"}
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight uppercase" style={{ fontFamily: 'var(--font-title)' }}>
              {isTeacherOrAdmin ? "Trợ lý học thuật chuyên sâu" : "Chào mừng bạn đến với"} <br />
              {isTeacherOrAdmin ? "Trường chuyên môn Smart" : "Thế giới tri thức!"}
            </h2>
            <div className="text-sm sm:text-base md:text-lg font-extrabold text-blue-50 leading-snug">
              {isTeacherOrAdmin ? "Kính chào Thầy Cô" : "Chào bé mến yêu"}, <span className="text-yellow-300 font-black">{studentDisplayName}</span> {profile?.avatar || '🦊'}!
            </div>
            <p className="text-xs md:text-sm text-blue-50 font-medium leading-relaxed">
              {isTeacherOrAdmin 
                ? "Chào mừng Thầy Cô quay trở lại hôm nay. Hệ trợ lý ảo AI luôn đồng hành hỗ trợ soạn giáo án 2345 chuẩn chỉ, thúc đẩy rèn luyện viết các sáng kiến kinh nghiệm đoạt giải cao."
                : `Hôm nay bạn muốn khám phá bài học lí thú nào? Hãy chọn một tính năng bên dưới hoặc xem chương trình học siêu hấp dẫn của Lớp ${profile?.grade || 3} nhé!`
              }
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 mt-6">
            {isTeacherOrAdmin ? (
              <>
                <button 
                  onClick={() => onSelectTab('lesson_planner')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer border-b-4 border-yellow-600 active:border-b-0 active:translate-y-0.5"
                >
                  Soạn giáo án ngay
                </button>
                <button 
                  onClick={() => onSelectTab('skkn_creator')}
                  className="bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer border-b-4 border-slate-300 active:border-b-0 active:translate-y-0.5 flex items-center gap-1.5"
                >
                  Viết Sáng kiến
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onSelectTab('lessons')}
                  className="bg-[#FFF200] hover:bg-yellow-500 text-slate-900 font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer border-b-4 border-yellow-600 active:border-b-0 active:translate-y-0.5"
                >
                  Xem bài học ngay 👉
                </button>
                <button 
                  onClick={() => onSelectTab('exercises')}
                  className="bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer border-b-4 border-slate-300 active:border-b-0 active:translate-y-0.5 flex items-center gap-1.5"
                >
                  <span>🏅</span> Làm bài tập nhận Huy hiệu
                </button>
              </>
            )}
          </div>
        </div>

        {/* B. Các Trạm Học Tập Section */}
        <div id="tram-hoc-tap-section">
          <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2 mb-3.5" style={{ fontFamily: 'var(--font-title)' }}>
            <span className="text-xl">🎯</span> {isTeacherOrAdmin ? "Các Trạm Chuyên Môn" : "Các Trạm Học Tập"}
          </h3>
          
          <div className="bg-[#FFFDE8] p-5 rounded-[24px] border-4 border-[#FFF5B8] shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stations.map((station, index) => {
                const theme = PASTEL_THEMES[index % 7];
                return (
                  <div 
                    key={station.id} 
                    className={`p-4 rounded-3xl flex flex-col justify-between items-center text-center shadow-xs h-full transition-transform duration-200 hover:-translate-y-1.5 border-3 ${theme.border} ${theme.bg} ${theme.bgHover}`}
                    id={station.id}
                  >
                    <div className={`w-10 h-10 rounded-full ${theme.badgeBg} ${theme.text} flex items-center justify-center text-xl mb-2 border ${theme.border} self-center`}>
                      {station.emoji}
                    </div>
                    <div className="mb-3 flex-1 flex flex-col justify-center text-center">
                      <h4 className={`text-xs font-black uppercase mb-1 ${theme.text}`}>{station.title}</h4>
                      <p className={`text-[12px] ${theme.lightText} font-semibold leading-normal`}>
                        {station.desc}
                      </p>
                    </div>
                    <button 
                      onClick={station.onClick}
                      disabled={station.disabled}
                      className={`w-full py-2 rounded-xl text-[11px] font-black uppercase text-center transition border-b-4 active:border-b-0 cursor-pointer mt-auto ${
                        station.disabled
                          ? 'bg-gray-200 text-gray-400 border-transparent border-b-0 cursor-not-allowed'
                          : `${theme.btnBg} ${theme.btnBorder} text-white`
                      }`}
                    >
                      {station.action}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* C. Học Tiếp Bài Học Trước / Tiện Ích */}
        {isTeacherOrAdmin ? (
          <div id="continue-learning-section">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base md:text-lg font-black text-[#1A569B] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
                <span>🔧</span> Tiện ích sư phạm
              </h3>
              <button 
                onClick={() => onSelectTab('utilities')}
                className="text-[#1A569B] hover:underline font-extrabold text-xs flex items-center gap-1 select-none cursor-pointer"
              >
                Tất cả tiện ích →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#EEFBF3] p-5 rounded-[24px] border-4 border-[#D1F5DF] shadow-md">
              {[
                {
                  id: "util-class-wheel",
                  title: "Vòng Quay May Mắn Gọi Tên",
                  badge: "🎮 Tải nhanh",
                  desc: "Vòng quay ngẫu nhiên bắt mắt giúp Thầy Cô gọi học sinh phát biểu hào hứng, công bằng nhất.",
                  bg: "bg-white",
                  border: "border-slate-100",
                  text: "text-emerald-700",
                  btnText: "Mở Vòng quay 🎡"
                },
                {
                  id: "util-mark-scale",
                  title: "Máy Tính Điểm & Đánh Giá",
                  badge: "🧮 Đơn giản",
                  desc: "Nhập điểm và quy đổi nhanh chóng, hỗ trợ ghi nhận kết quả đánh giá theo tiến độ học lực học tập.",
                  bg: "bg-white",
                  border: "border-slate-100",
                  text: "text-blue-700",
                  btnText: "Mở Tính điểm 📊"
                },
                {
                  id: "util-timetable",
                  title: "Trợ Lý Sắp Xếp Thời Khóa Biểu",
                  badge: "📅 Chuẩn 2345",
                  desc: "Xác lập khung phân phối chương trình, ca dạy, trực tuần thông minh và xuất bản dễ nhìn.",
                  bg: "bg-white",
                  border: "border-slate-100",
                  text: "text-purple-700",
                  btnText: "Xếp lịch dạy 🗓️"
                }
              ].map((util, index) => {
                const theme = PASTEL_THEMES[index % 7];
                return (
                  <div 
                    key={util.id} 
                    className={`flex flex-col p-4 bg-white rounded-2xl border-3 ${theme.border} duration-150 justify-between shadow-xs`}
                  >
                    <div className="text-left space-y-1.5 mb-4">
                      <span className={`inline-block text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.text}`}>
                        {util.badge}
                      </span>
                      <h4 className={`font-black text-sm text-slate-800 tracking-wide block leading-snug`}>
                        {util.title}
                      </h4>
                      <p className={`text-[12px] text-slate-500 font-semibold leading-normal`}>
                        {util.desc}
                      </p>
                    </div>
                    <button 
                      onClick={() => onSelectTab('utilities')}
                      className={`w-full text-white border-b-4 ${theme.btnBorder} active:border-b-0 active:translate-y-0.5 py-2 rounded-xl text-xs font-black tracking-wide transition cursor-pointer hover:shadow-xs shrink-0 ${theme.btnBg}`}
                    >
                      {util.btnText}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div id="continue-learning-section">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base md:text-lg font-black text-[#1A569B] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
                <span>📘</span> Học Tiếp Bài Học Trước
              </h3>
              <button 
                onClick={() => onSelectTab('lessons')}
                className="text-[#1A569B] hover:underline font-extrabold text-xs flex items-center gap-1 select-none cursor-pointer"
              >
                Tất cả bài học →
              </button>
            </div>

            <div className="space-y-3 bg-[#EEFBF3] p-5 rounded-[24px] border-4 border-[#D1F5DF] shadow-md">
              {myLessons.slice(0, 3).map((lesson, index) => {
                const progress = activeStudyProgress[lesson.id] || 0;
                const theme = PASTEL_THEMES[index % 7];
                return (
                  <div 
                    key={lesson.id} 
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 ${theme.bg} ${theme.bgHover} rounded-2xl border-3 ${theme.border} duration-150 break-words gap-4 animate-fade-in shadow-xs`}
                    id={`lesson-item-row-${lesson.id}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 text-left">
                      <div className={`w-12 h-12 rounded-xl ${theme.badgeBg} ${theme.text} flex items-center justify-center text-2xl shrink-0 border ${theme.border}`}>
                        📖
                      </div>
                      <div className="min-w-0 flex-1">
                        <span 
                          className={`font-black uppercase tracking-wider ${theme.lightText} block mb-0.5`}
                          style={{ fontSize: index === 2 ? '12px' : '11px' }}
                        >
                          {lesson.topicName || "Chủ đề 1. Máy tính và em"}
                        </span>
                        <h4 className={`font-black text-sm ${theme.text} tracking-wide block truncate`}>
                          Bài {lesson.lessonNumber}: {lesson.title.replace(/^Bài\s*\d+\s*:\s*/i, '')}
                        </h4>
                        <p className={`text-[12px] ${theme.lightText} font-semibold leading-normal truncate max-w-xl`}>
                          {lesson.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end sm:justify-start">
                      <div className="text-right flex flex-col items-center justify-center">
                        <span className={`block text-[10px] text-center font-black uppercase ${theme.lightText} tracking-wider`} style={{ fontSize: '10px', textAlign: 'center' }}>Tiến độ</span>
                        <span className={`block text-sm text-center font-black ${theme.text}`} style={{ textAlign: 'center' }}>{progress}%</span>
                      </div>
                      <button 
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`text-white border-b-4 ${theme.btnBorder} active:border-b-0 active:translate-y-0.5 px-4 py-2 rounded-xl text-xs font-black tracking-wide transition cursor-pointer hover:shadow-xs shrink-0 ${theme.btnBg}`}
                      >
                        Học ngay 📖
                      </button>
                    </div>
                  </div>
                );
              })}
              {myLessons.length === 0 && (
                <p className="text-xs font-bold text-gray-400 py-6 text-center">
                  Không tìm thấy bài học nào phù hợp với lớp của em!
                </p>
              )}
            </div>
          </div>
        )}

        {/* D. Trắc Nghiệm Bài Tập Nhanh / Tạo trò chơi */}
        {isTeacherOrAdmin ? (
          <div id="quick-quizzes-section">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base md:text-lg font-black text-[#826000] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
                <span>🎮</span> Kiến tạo Trò chơi học tập
              </h3>
              <button 
                onClick={() => onSelectTab('game_creator')}
                className="text-[#826000] hover:underline font-extrabold text-xs flex items-center gap-1 select-none cursor-pointer"
              >
                Trình thiết chế game →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F7EDFF] p-5 rounded-[24px] border-4 border-[#EAD1FF] shadow-md">
              {[
                {
                  id: "game-preview-scratch",
                  title: "Truy Tìm Kho Báu Lập Trình",
                  badge: "🎨 Robot mầm non",
                  desc: "Học sinh sử dụng mũi tên sơ đồ khối dẫn dắt Doraemon lách bẫy, hoàn thành bài tập Scratch.",
                  bg: "bg-white",
                  border: "border-purple-200"
                },
                {
                  id: "game-preview-typing",
                  title: "Đua Xe Gõ Chữ Siêu Tốc",
                  badge: "⌨️ Nhập liệu nhanh",
                  desc: "Mỗi từ khoá nhập đúng sẽ đẩy xe tăng tốc bứt phá bám đuổi địch thủ về đích ngoạn mục.",
                  bg: "bg-white",
                  border: "border-amber-200"
                },
                {
                  id: "game-preview-builder",
                  title: "Hòn Đảo Phép Thuật STEM",
                  badge: "🧠 Câu hỏi vượt ải",
                  desc: "Chinh phục các câu đố logic, tích hợp kiến thức tự nhiên xã hội để mở khóa bí ẩn hoang đảo.",
                  bg: "bg-white",
                  border: "border-blue-200"
                }
              ].map((gm, index) => {
                const theme = PASTEL_THEMES[(index + 4) % 7];
                return (
                  <div 
                    key={gm.id} 
                    className={`flex flex-col p-4 bg-white rounded-2xl border-3 ${theme.border} duration-150 justify-between shadow-xs`}
                  >
                    <div className="text-left space-y-1.5 mb-4">
                      <span className={`inline-block text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.text}`}>
                        {gm.badge}
                      </span>
                      <h4 className={`font-black text-sm text-slate-800 tracking-wide block leading-snug`}>
                        {gm.title}
                      </h4>
                      <p className={`text-[12px] text-slate-500 font-semibold leading-normal`}>
                        {gm.desc}
                      </p>
                    </div>
                    <button 
                      onClick={() => onSelectTab('game_creator')}
                      className={`w-full text-white border-b-4 ${theme.btnBorder} active:border-b-0 active:translate-y-0.5 py-2 rounded-xl text-xs font-black tracking-wide transition cursor-pointer hover:shadow-xs shrink-0 ${theme.btnBg}`}
                    >
                      Thiết kế nhanh ngay 🎮
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div id="quick-quizzes-section">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base md:text-lg font-black text-[#826000] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
                <span>📋</span> Trắc Nghiệm Bài Tập
              </h3>
              <button 
                onClick={() => onSelectTab('exercises')}
                className="text-[#826000] hover:underline font-extrabold text-xs flex items-center gap-1 select-none cursor-pointer"
              >
                Danh sách bài tập →
              </button>
            </div>

            <div className="space-y-3 bg-[#F7EDFF] p-5 rounded-[24px] border-4 border-[#EAD1FF] shadow-md">
              {myLessons.slice(0, 3).map((lesson, index) => {
                const theme = PASTEL_THEMES[(index + 4) % 7];
                return (
                  <div 
                    key={lesson.id} 
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 ${theme.bg} ${theme.bgHover} rounded-2xl border-3 ${theme.border} duration-150 break-words gap-4 animate-fade-in shadow-xs`}
                    id={`quick-exercise-row-${lesson.id}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 text-left">
                      <div className={`w-12 h-12 rounded-xl ${theme.badgeBg} ${theme.text} flex items-center justify-center text-2xl shrink-0 border ${theme.border}`}>
                        📋
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[12px] font-black uppercase tracking-wider ${theme.lightText} block mb-0.5`}>
                          {lesson.topicName || "Chủ đề 1. Máy tính và em"}
                        </span>
                        <h4 className={`font-black text-sm ${theme.text} tracking-wide block truncate`}>
                          Bài {lesson.lessonNumber}: {lesson.title.replace(/^Bài\s*\d+\s*:\s*/i, '')}
                        </h4>
                        <p className={`text-[12px] ${theme.lightText} font-semibold leading-normal truncate max-w-xl`}>
                          Đố vui lý thuyết, luyện kĩ năng siêu phàm nhận thưởng sao vàng của em nào!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end sm:justify-start">
                      <div className="text-right">
                        <span className={`block text-[8px] font-black uppercase ${theme.lightText} tracking-wider`}>Nhận Thưởng</span>
                        <span className="block text-xs font-black text-amber-500">+20 ⭐</span>
                      </div>
                      <button 
                        onClick={() => onSelectTab('exercises')}
                        className={`text-white border-b-4 ${theme.btnBorder} active:border-b-0 active:translate-y-0.5 px-4 py-2 rounded-xl text-xs font-black tracking-wide transition cursor-pointer hover:shadow-xs shrink-0 ${theme.btnBg}`}
                      >
                        Làm bài 🧮
                      </button>
                    </div>
                  </div>
                );
              })}
              {myLessons.length === 0 && (
                <p className="text-xs font-bold text-gray-400 py-6 text-center">
                  Không tìm thấy bài học nào phù hợp với lớp của em!
                </p>
              )}
            </div>
          </div>
        )}






        {/* E. Cửa Hàng Danh Hiệu */}
        <div id="title-shop-section" className="mt-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base md:text-lg font-black text-orange-600 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
              <span>🎁</span> Cửa hàng Danh Hiệu
            </h3>
            <button 
              onClick={() => onSelectTab('rewards')}
              className="text-orange-600 hover:underline font-extrabold text-xs flex items-center gap-1 select-none cursor-pointer"
            >
              Vào cửa hàng đầy đủ →
            </button>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-lg border-4 border-[#FDBA74] text-left">
            <p className="text-[12px] text-gray-400 font-bold mb-3.5">
              Dùng điểm thưởng ⭐ thu thập được để quy đổi các danh hiệu & avatar siêu xinh xắn nhé!
            </p>

            {/* Lọc độ hiếm */}
            <div className="mb-4">
              <span className="text-[12px] font-black text-slate-700 block mb-2 uppercase tracking-wide">
                🔍 Lọc độ hiếm:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Tất cả', 'Thường', 'Đặc Biệt', 'Quý', 'Sử Thi', 'Huyền Thoại', 'Thần Thoại', 'Tối Thượng'].map((rarityOpt) => {
                  const isActive = shopRarityFilter === rarityOpt;
                  const colors: Record<string, string> = {
                    'Tất cả': 'border-slate-300 text-slate-700 hover:bg-slate-50',
                    'Thường': 'border-slate-200 text-slate-600 hover:bg-slate-50',
                    'Đặc Biệt': 'border-emerald-200 text-emerald-700 hover:bg-emerald-50/50',
                    'Quý': 'border-blue-200 text-blue-700 hover:bg-blue-50/50',
                    'Sử Thi': 'border-purple-200 text-purple-700 hover:bg-purple-50/50',
                    'Huyền Thoại': 'border-yellow-300 text-yellow-800 hover:bg-yellow-50/50',
                    'Thần Thoại': 'border-rose-200 text-rose-700 hover:bg-rose-50/50',
                    'Tối Thượng': 'border-amber-300 text-amber-900 bg-linear-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100'
                  };
                  const activeColors: Record<string, string> = {
                    'Tất cả': 'bg-slate-600 text-white border-slate-700',
                    'Thường': 'bg-slate-500 text-white border-slate-600',
                    'Đặc Biệt': 'bg-emerald-600 text-white border-emerald-700',
                    'Quý': 'bg-blue-600 text-white border-blue-700',
                    'Sử Thi': 'bg-purple-600 text-white border-purple-700',
                    'Huyền Thoại': 'bg-yellow-500 text-white border-yellow-600',
                    'Thần Thoại': 'bg-rose-600 text-white border-rose-700',
                    'Tối Thượng': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-orange-600'
                  };
                  return (
                    <button
                      key={rarityOpt}
                      onClick={() => setShopRarityFilter(rarityOpt)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition cursor-pointer select-none active:scale-95 ${
                        isActive ? activeColors[rarityOpt] : colors[rarityOpt]
                      }`}
                    >
                      {rarityOpt}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const currentShopList = shopItemsList || INITIAL_SHOP_ITEMS;
              const filteredItems = shopRarityFilter === 'Tất cả'
                ? currentShopList
                : currentShopList.filter((item) => item.rarity === shopRarityFilter);

              if (filteredItems.length === 0) {
                return (
                  <p className="text-xs font-bold text-gray-400 py-6 text-center w-full">
                    Không tìm thấy danh hiệu nào thuộc độ hiếm này!
                  </p>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {filteredItems.slice(0, 6).map((item) => {
                    const isBought = purchasedRewards?.includes(item.id);
                    const canAfford = profile.xp >= item.cost;
                    
                    return (
                      <div 
                        key={item.id} 
                        className="p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl flex flex-col justify-between items-center text-center border border-orange-100 hover:bg-orange-50/10 transition duration-155"
                      >
                        <div className="w-11 h-11 rounded-full bg-orange-50 text-[#C2410C] flex items-center justify-center text-xl mb-2 border border-orange-100 shadow-xs relative shrink-0">
                          <span>{item.icon}</span>
                          <span className="absolute -top-1 -right-1 text-[8px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full font-black uppercase">
                            {item.rarity}
                          </span>
                        </div>

                        {/* Title & Desc Container with perfect centering under the icon */}
                        <div className="mb-2.5 flex-1 flex flex-col justify-center items-center text-center w-full">
                          <h4 className="text-xs font-black text-slate-800 mb-0.5 text-center truncate max-w-[150px]" title={item.title}>
                            {item.title}
                          </h4>
                          <p className="text-[12.5px] text-blue-600 font-bold leading-normal text-center line-clamp-2" title={item.desc}>
                            {item.desc}
                          </p>
                        </div>

                        <div className="w-full space-y-2 mt-auto">
                          <div className="flex items-center justify-center gap-1 bg-amber-50/60 border border-amber-100 rounded-lg py-0.5 px-2 mx-auto w-fit text-xs font-black text-amber-700">
                            <span>{item.cost}</span>
                            <span className="text-amber-500">⭐</span>
                          </div>

                          <button 
                            onClick={() => {
                              if (isBought) {
                                alert("Em đã sở hữu phần quà này rồi! Hãy vào mục 'Thông tin cá nhân' để chọn làm ảnh đại diện nhen!");
                                return;
                              }
                              if (onBuyReward) {
                                onBuyReward(item.id, item.cost, item.title);
                              }
                            }}
                            className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase text-center transition border-b-2 active:border-b-0 cursor-pointer ${
                              isBought
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-250 cursor-default'
                                : canAfford
                                  ? 'bg-orange-500 hover:bg-orange-600 border-orange-700 text-white'
                                  : 'bg-gray-105 text-gray-400 border-transparent cursor-not-allowed'
                            }`}
                          >
                            {isBought ? 'Đã đổi ✔️' : 'Đổi Quà 🎁'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Widgets Board (4/12 layout) */}
      <div className="lg:col-span-4 space-y-6 text-left" id="student-main-right-widgets">
        
        {/* Real-time Clock on "Cách nhận điểm ⭐ Thưởng" */}
        <div className="bg-[#eff6ff] rounded-[24px] p-4 border-2 border-blue-200 text-center shadow-xs flex flex-col items-center justify-center space-y-1">
          <div className="text-2xl font-black text-[#1e40af] font-mono tracking-wider flex items-center justify-center gap-1.5">
            <span className="text-xl">⏰</span>
            <span style={{ fontFamily: 'Times New Roman' }}>{formatClockTimeVal(currentClockTime)}</span>
          </div>
          <div className="text-xs font-black text-blue-700/85 flex items-center justify-center gap-1.5 uppercase tracking-wide">
            <span className="text-sm">📆</span>
            <span>{formatClockDateVal(currentClockTime)}</span>
          </div>
        </div>

        {/* Điểm danh nhận thưởng Card */}
        <div className="bg-[#FFF0F2] rounded-[24px] p-5 border-4 border-[#FFD3D9] shadow-sm space-y-3" id="attendance-checkin-widget-card">
          <h4 className="font-extrabold text-[#9B1C31] text-sm flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
            <span className="text-lg">🎁</span> Điểm danh nhận thưởng
          </h4>
          <p className="text-xs text-[#A24B5D] font-bold leading-relaxed">
            Đăng nhập hằng ngày để nhận quà nào bé mến yêu! Nhấn nút bên dưới để nhận thêm sao lấp lánh nhé!
          </p>
          <button 
            onClick={handleCheckInToday}
            disabled={hasCheckedInToday}
            className={`w-full py-3 rounded-2xl text-xs font-black uppercase text-center transition border-b-4 active:border-b-0 cursor-pointer ${
              hasCheckedInToday
                ? 'bg-gray-200 text-gray-400 border-transparent border-b-0 cursor-not-allowed'
                : 'bg-[#FF8DA1] hover:bg-[#FF738E] border-[#E26980] text-white shadow-xs'
            }`}
          >
            {hasCheckedInToday ? 'Đã nhận thưởng hôm nay rồi ✔️' : 'Điểm danh nhận +10 Sao Vàng 🌟'}
          </button>
        </div>

        {/* Bảng Nhiệm vụ hằng ngày */}
        <div className="bg-[#EEF2FF] rounded-[24px] p-5 border-4 border-[#D8E1FF] shadow-sm space-y-3.5" id="daily-status-update-board-card">
          <div className="relative text-center pb-2.5 border-b-2 border-[#D8E1FF]/40">
            <h4 className="font-extrabold text-[#1C3D9F] text-base uppercase tracking-wider flex items-center justify-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
              NHIỆM VỤ HẰNG NGÀY
            </h4>
          </div>

          <div className="space-y-3">
            {questsState.map((q) => {
              const isCompleted = q.current >= q.target;
              
              // Custom styles matching the request image
              let iconBg = "bg-[#FFF0F2] border-[#FFD3D9]";
              let questEmoji = q.emoji;
              if (q.id === "attendance") {
                iconBg = "bg-[#FFF0F2] border-[#FFD3D9]";
                questEmoji = "📅";
              } else if (q.id === "learn" || q.id === "create_lesson") {
                iconBg = "bg-[#EBF3FF] border-[#C7DFFF]";
                questEmoji = "📘";
              } else if (q.id === "exercise" || q.id === "create_test") {
                iconBg = "bg-[#EEFBF3] border-[#D1F5DF]";
                questEmoji = "📝";
              } else if (q.id === "create_game") {
                iconBg = "bg-[#FFFDE8] border-[#FFF5B8]";
                questEmoji = "🎮";
              }

              const displayPoints = q.points;

              return (
                <div key={q.id} className="bg-white p-3 md:p-3.5 rounded-[20px] flex items-center justify-between gap-2.5 shadow-sm border border-slate-100/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-[16px] ${iconBg} flex items-center justify-center text-xl shrink-0 border`}>
                      {questEmoji}
                    </div>
                    <div className="min-w-0 text-left">
                      <h5 className="font-extrabold text-slate-800 text-[14px] tracking-tight line-clamp-1">
                        {q.name}
                      </h5>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                        {q.current}/{q.target}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] text-[9px] font-black border border-[#FFE0B2] flex items-center gap-0.5 shrink-0">
                      +{displayPoints} <span className="text-amber-500 font-bold">⭐</span>
                    </span>

                    {isCompleted ? (
                      <span className="bg-gray-100 text-gray-400 px-2.5 py-1.5 rounded-full text-[9px] font-black shrink-0 border border-transparent">
                        ĐÃ XONG ✔️
                      </span>
                    ) : (
                      <button
                        onClick={() => startQuestTask(q.id)}
                        className="bg-[#10B981] hover:bg-[#059669] text-white border-b-2 border-[#047857] active:border-b-0 active:translate-y-[1px] font-black text-[9px] uppercase px-2.5 py-1.5 rounded-full cursor-pointer transition shrink-0"
                      >
                        {q.id === 'attendance' ? 'ĐIỂM DANH 🎁' : 'LÀM NGAY 🚀'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1.5">
            <button
              onClick={handleClaimDailyGift}
              disabled={isQuestsGiftClaimed}
              className={`w-full py-3 rounded-[20px] text-xs font-black uppercase text-center transition border-b-4 active:border-b-0 flex items-center justify-center gap-2 cursor-pointer ${
                isQuestsGiftClaimed
                  ? 'bg-gray-200 text-gray-400 border-transparent border-b-0 cursor-not-allowed'
                  : 'bg-[#92A3FD] hover:bg-[#7D91FC] border-[#687DF8] text-white shadow-xs'
              }`}
            >
              {isQuestsGiftClaimed ? '🎁 ĐÃ NHẬN QUÀ HÀNG NGÀY!' : '🎁 NHẬN QUÀ HÀNG NGÀY!'}
            </button>
          </div>

          <p className="text-[12px] text-center text-slate-500 font-bold leading-normal mt-1 block px-2">
            Em hãy nhấn nút <span className="text-[#10B981] font-black">Làm ngay 🚀</span> hoặc <span className="text-[#10B981] font-black">Điểm danh 🎁</span> để hoàn thành các thử thách nhé!
          </p>
        </div>

        {/* Cách Nhận Điểm ⭐ Thưởng Card based on image mockup */}
        <div className="bg-[#E0F2FE] rounded-[24px] p-5 border border-[#93C5FD] shadow-sm space-y-3.5" id="ways-to-earn-stars-card">
          <h4 className="font-extrabold text-[#1D4ED8] text-sm flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
            <span className="text-lg">🎯</span> Cách Nhận Điểm <span className="text-amber-500 font-bold">⭐</span> Thưởng
          </h4>
          
          <div className="space-y-2.5">
            {/* Row 1 */}
            <div className="bg-white px-4 py-2.5 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-blue-100/50 flex items-center gap-2">
              <span className="text-base">📚</span>
              <span className="text-xs font-semibold text-slate-800">
                <span className="text-[#EF4444] font-black text-sm pr-1">+10</span> <span className="text-amber-500 font-bold">⭐</span> khi hoàn thành một Bài học.
              </span>
            </div>
            {/* Row 2 */}
            <div className="bg-white px-4 py-2.5 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-blue-100/50 flex items-center gap-2">
              <span className="text-base">📝</span>
              <span className="text-xs font-semibold text-slate-800">
                <span className="text-[#059669] font-black text-sm pr-1">+10</span> <span className="text-amber-500 font-bold">⭐</span> khi hoàn thành một Bài tập.
              </span>
            </div>
            {/* Row 3 */}
            <div className="bg-white px-4 py-2.5 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-blue-100/50 flex items-center gap-2">
              <span className="text-base">🏁</span>
              <span className="text-xs font-semibold text-slate-800">
                <span className="text-[#D97706] font-black text-sm pr-1">+5</span> <span className="text-amber-500 font-bold">⭐</span> khi hoàn thành một Trò chơi.
              </span>
            </div>
          </div>
        </div>

        {/* Widget 1: Real Leaderboard Wrapped in Blue Border */}
        <div className="bg-white rounded-[24px] p-5 shadow-lg border-4 border-[#3B82F6] flex flex-col justify-between text-left" id="ranking-list-card">
          <div>
            <div className="text-center mb-4 pb-2 border-b-2 border-gray-100">
              <span className="text-3xl animate-bounce inline-block">🏆</span>
              <h3 className="text-base font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: 'var(--font-title)' }}>
                Bảng Xếp Hạng
              </h3>
              <p className="text-[12px] text-gray-400 font-bold">Hãy tích lũy thật nhiều ⭐ để thăng hạng nhé!</p>
            </div>

            {/* Filter tab buttons for rankings: Class, Grade, School */}
            <div className="grid grid-cols-3 gap-1 bg-[#F3F6FD] p-1 rounded-xl mb-4 text-center">
              {[
                { id: 'class', label: 'BXH Lớp' },
                { id: 'grade', label: 'BXH Khối' },
                { id: 'school', label: 'BXH Trường' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLeaderboardFilter(item.id as any)}
                  className={`py-1 rounded-lg font-black text-[11px] transition uppercase cursor-pointer ${
                    leaderboardFilter === item.id 
                      ? 'bg-[#3B82F6] text-white shadow-xs' 
                      : 'text-gray-500 hover:text-[#3B82F6]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Render rank item list */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {currentLeaderboard.map((user, idx) => {
                const colors = [
                  'bg-[#FFFAEB] border-yellow-300 text-yellow-800', // Rank 1
                  'bg-slate-50 border-slate-300 text-gray-700', // Rank 2
                  'bg-orange-50 border-orange-200 text-orange-850' // Rank 3
                ];
                const medalSymbol = ['🥇', '🥈', '🥉'];
                const badgeStyle = colors[idx] || 'bg-[#F3F6FD] border-[#E2E8F0] text-gray-500';

                return (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition ${
                      user.fullname.includes('(Bạn)') 
                        ? 'bg-blue-50 border-[#3B82F6]' 
                        : 'bg-white border-transparent'
                    }`}
                  >
                    {/* Rank Index and medals representation */}
                    <div className={`w-6 h-6 flex items-center justify-center font-black rounded-lg text-xs ${badgeStyle}`}>
                      {medalSymbol[idx] || idx + 1}
                    </div>

                    {/* Left Emoji Profile */}
                    <span className="text-lg bg-gray-50 p-1 rounded-md">{user.avatar}</span>
                    
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-extrabold text-[12px] text-gray-800 truncate leading-tight">{user.fullname}</h4>
                      <span className="text-[11px] font-medium text-gray-500 mt-1 block leading-tight">Lớp {user.className} • Cấp {user.level}</span>
                    </div>

                    <div className="text-right shrink-0 flex items-center justify-end gap-0.5 font-black text-[14px] text-slate-800">
                      <span>{user.xp} ⭐</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút Xem Bảng xếp hạng */}
            <button
              onClick={() => {
                if (typeof onSelectTabAndSubtab === 'function') {
                  onSelectTabAndSubtab('student', 'ranks');
                } else {
                  onSelectTab('student');
                }
              }}
              className="mt-4 w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-xs py-2.5 px-4 rounded-xl border-b-4 border-[#1E40AF] active:border-b-0 active:translate-y-0.5 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              id="view-leaderboard-btn"
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              Xem Bảng xếp hạng 🏆
            </button>
          </div>
        </div>

        {/* Widget 2: Medals Collection wrapped in yellow border */}
        <div className="bg-white rounded-[24px] p-5 shadow-lg border-4 border-[#FDE68A] flex flex-col justify-between text-left" id="medals-board-card">
          <div>
            <div className="flex items-center justify-between mb-3 border-b-2 border-gray-100 pb-2">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1 tracking-wide uppercase" style={{ fontFamily: 'var(--font-title)' }}>
                🏅 Bộ Sưu Tập Huy Hiệu
              </h3>
              <span className="text-[9.5px] font-black text-yellow-800 bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-yellow-205">
                {totalEarnedBadges}/20 Đạt
              </span>
            </div>
            
            <p className="text-[12px] text-gray-400 font-bold mb-3">
              Tích lũy thật nhiều ⭐ để thắp sáng các huy hiệu nhé!
            </p>

            {/* Hạng & Huy hiệu hiện tại section - Không dùng thẻ card, thiết kế 2 hàng khác màu */}
            <div className="space-y-1.5 mb-4 pl-3.5 py-1 border-l-4 border-yellow-400">
              <div className="text-xs font-bold text-slate-700">
                Chiến binh: <span className="text-amber-600 font-black text-[13px]">{homeActiveTier}</span>
              </div>
              <div className="text-xs font-bold text-slate-700">
                Huy Hiệu: <span className="text-indigo-600 font-black text-[13px]">{homeHighestBadgeName}</span>
              </div>
            </div>

            <div className="space-y-3 font-semibold text-[10.5px]">
              {[
                {
                  title: 'Hạng Đồng ️🥉️',
                  code: 'Đồng',
                  colorClass: 'bg-amber-500',
                  textEarnclass: 'text-amber-700'
                },
                {
                  title: 'Hạng Bạc 🥈',
                  code: 'Bạc',
                  colorClass: 'bg-emerald-500',
                  textEarnclass: 'text-emerald-700'
                },
                {
                  title: 'Hạng Vàng 🥇️',
                  code: 'Vàng',
                  colorClass: 'bg-blue-500',
                  textEarnclass: 'text-[#3b82f6]'
                },
                {
                  title: 'Hạng Kim Cương 💎',
                  code: 'Kim Cương',
                  colorClass: 'bg-purple-500',
                  textEarnclass: 'text-purple-700'
                },
                {
                  title: 'Hạng Huyền Thoại 👑',
                  code: 'Huyền Thoại',
                  colorClass: 'bg-yellow-600',
                  textEarnclass: 'text-yellow-700'
                }
              ].map((tierItem, tierIdx) => {
                const checkXP = typeof totalCollectedXP === 'number' ? totalCollectedXP : (profile ? profile.xp : 0);
                const tierBadges = (badgesList || INITIAL_BADGES).filter(b => b.tier === tierItem.code);
                const earnedInTier = tierBadges.filter(b => profile ? checkXP >= b.xpRequired : false).length;
                const isCompleted = earnedInTier === tierBadges.length;

                return (
                  <div key={tierItem.code} className={`space-y-1 ${tierIdx > 0 ? 'pt-1.5 border-t border-dashed border-gray-100' : ''}`}>
                    <div className="flex justify-between items-center text-gray-500 font-bold text-[10px]">
                      <span className="text-[12px]">{tierItem.title}</span>
                      <span className={`${isCompleted ? tierItem.textEarnclass : 'text-slate-400'} font-black`}>
                        {earnedInTier}/{tierBadges.length} {isCompleted ? 'Xong' : ''}
                      </span>
                    </div>

                    {/* Segmented progress bar as requested: __ __ __ __ __ */}
                    <div className="flex gap-1 h-2 w-full">
                      {Array.from({ length: tierBadges.length }).map((_, idx) => {
                        const isFilled = idx < earnedInTier;
                        return (
                          <div
                            key={idx}
                            className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                              isFilled ? tierItem.colorClass : 'bg-gray-150'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Badge icons emojis row */}
                    <div className="flex gap-1.5 text-base pt-0.5">
                      {tierBadges.map((badge) => {
                        const isEarned = profile ? checkXP >= badge.xpRequired : false;
                        return (
                          <span
                            key={badge.code}
                            title={`${badge.title} (${badge.description})`}
                            className={`transition-all duration-300 ${
                              isEarned ? 'opacity-100 scale-100' : 'opacity-25 filter grayscale select-none'
                            }`}
                          >
                            {badge.iconEmoji}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => {
                if (onSelectTabAndSubtab) {
                  onSelectTabAndSubtab('student', 'badges');
                } else {
                  onSelectTab('student');
                }
              }}
              className="mt-5 w-full bg-[#EAB308] hover:bg-[#CA8A04] border-b-4 border-[#854D0E] active:border-b-0 active:translate-y-0.5 text-white py-2.5 rounded-xl font-black text-xs text-center cursor-pointer uppercase transition tracking-wide shadow-xs"
              style={{ fontFamily: 'var(--font-btn)' }}
            >
              🏆 Vào Bộ sưu tập Huy Hiệu
            </button>
          </div>
        </div>

      </div>

      {/* --- NHIỆM VỤ HẰNG NGÀY POP-UP MODAL (ĐÚNG PHONG CÁCH ẢNH MINH HỌA) --- */}
      {showQuestsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#F0F5FF] w-full max-w-sm rounded-[32px] p-6 text-center shadow-2xl relative border-4 border-white animate-scale-up">
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowQuestsModal(false);
                setActiveTaskRunning(null);
              }}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-xs transition cursor-pointer select-none"
              title="Đóng"
            >
              ✕
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-extrabold text-[#2454A6] mb-5 uppercase tracking-wide" style={{ fontFamily: 'var(--font-title)' }}>
              Nhiệm vụ hàng ngày
            </h3>

            {/* If NO active task is running, show normal list */}
            {activeTaskRunning === null ? (
              <>
                {/* List of Tasks */}
                <div className="space-y-3.5 mb-6">
                  {questsState.map((q) => {
                    const isCompleted = q.current >= q.target;
                    return (
                      <div 
                        key={q.id}
                        className="bg-white p-3.5 rounded-2xl flex items-center justify-between shadow-2xs border border-blue-50/55 transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-3 text-left">
                          {/* Left icon wrapper */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                            isCompleted 
                              ? 'bg-[#EDFBF2] text-emerald-500' 
                              : q.id === 'attendance'
                                ? 'bg-[#FFF0F2] text-[#FF8DA1]'
                                : q.id === 'learn' || q.id === 'create_lesson'
                                  ? 'bg-[#E8F4FF] text-[#42A5F5]'
                                  : q.id === 'exercise' || q.id === 'create_test'
                                    ? 'bg-[#FFFBE5] text-[#F59E0B]'
                                    : 'bg-[#EDFBF2] text-[#10B981]' /* game & create_game */
                          }`}>
                            {isCompleted ? (
                              <span className="text-emerald-500 font-bold">✔️</span>
                            ) : (
                              <span>{q.emoji}</span>
                            )}
                          </div>

                          {/* Info labels */}
                          <div>
                            <div className="font-extrabold text-xs text-slate-800 leading-snug">
                              {q.name}
                            </div>
                            <div className={`text-[10px] font-bold mt-0.5 ${
                              isCompleted ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                              {q.current} / {q.target}{q.suffix} {isCompleted ? '(Hoàn thành)' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Right bonus pill & Action */}
                        <div className="flex items-center gap-1.5 font-sans">
                          {!isCompleted ? (
                            <>
                              <span className="bg-[#FFF4E6] text-[#F97316] font-extrabold text-[10px] px-2 py-0.5 rounded-md flex items-center justify-center shrink-0">
                                +{q.points} ⭐
                              </span>
                              <button
                                onClick={() => startQuestTask(q.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-black transition cursor-pointer shadow-2xs uppercase antialiased"
                                title="Làm nhiệm vụ này"
                              >
                                {q.id === 'attendance' ? 'Điểm danh 🎁' : 'Làm ngay 🚀'}
                              </button>
                            </>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold text-[9.5px] px-2 py-0.5 rounded-full select-none">
                              Xong ✨
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Reward Action Button */}
                <button
                  onClick={handleClaimDailyGift}
                  disabled={isQuestsGiftClaimed}
                  className={`w-full py-3 px-6 rounded-2xl text-xs md:text-sm font-extrabold text-white uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 border-b-4 ${
                    isQuestsGiftClaimed
                      ? 'bg-gray-300 text-gray-500 border-transparent cursor-not-allowed border-b-0'
                      : questsState.every(q => q.current >= q.target)
                        ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 border-orange-600 active:border-b-0 active:translate-y-0.5 cursor-pointer'
                        : 'bg-indigo-300 border-indigo-400 hover:bg-indigo-400 cursor-pointer active:border-b-0 active:translate-y-0.5'
                  }`}
                >
                  {isQuestsGiftClaimed ? (
                    <>🎉 Đã nhận quà hôm nay!</>
                  ) : (
                    <>🎁 Nhận quà hàng ngày!</>
                  )}
                </button>
                
                {/* Guide hint */}
                {!isQuestsGiftClaimed && !questsState.every(q => q.current >= q.target) && (
                  <p className="text-[10px] text-slate-400 mt-3 font-bold leading-normal">
                    Em hãy nhấn nút <span className="text-[#10B981] font-black">Làm ngay 🚀</span> hoặc <span className="text-[#10B981] font-black">Điểm danh 🎁</span> để hoàn thành các thử thách nhé!
                  </p>
                )}
              </>
            ) : null}

            {/* LEARN SUB-SYSTEM */}
            {activeTaskRunning === 'learn' && (
              <div className="space-y-4 text-left">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <h4 className="font-extrabold text-[#2454A6] text-xs uppercase mb-1.5 flex items-center gap-1.5">
                    <span>📘</span> Học bài: {learnStep === 1 ? '1. Tư thế ngồi học mười ngón' : '2. Quy tắc gõ 10 ngón tay'}
                  </h4>
                  {learnStep === 1 ? (
                    <p className="text-xs font-bold leading-relaxed text-slate-700">
                      ⚡ <strong>Tư thế:</strong> Ngồi thẳng lưng, vai thả lỏng, mắt cách màn hình từ 50 - 80 cm.<br />
                      ⚡ <strong>Chân:</strong> Đặt vuông góc trên mặt đất để không bị mỏi.<br />
                      ⚡ <strong>Tay:</strong> Cổ tay thẳng khi đặt trên bàn phím.
                    </p>
                  ) : (
                    <p className="text-xs font-bold leading-relaxed text-slate-700">
                      ⚡ <strong>Hàng cơ sở:</strong> Luôn đặt các ngón ở hàng phím chính (F và J có gờ nổi làm mốc).<br />
                      ⚡ <strong>Phân chia:</strong> Mỗi ngón tay sẽ phụ trách một vùng phím cố định.<br />
                      ⚡ <strong>Ghi nhớ:</strong> Cố gắng nhìn màn hình mà không cúi nhìn bàn phím nhé bé!
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  {learnStep === 1 ? (
                    <button
                      onClick={() => setLearnStep(2)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs text-center border-b-4 border-blue-800 cursor-pointer transition active:border-b-0 active:translate-y-0.5"
                    >
                      Tiếp theo ➔
                    </button>
                  ) : (
                    <button
                      onClick={() => finishQuestTask('learn')}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs text-center border-b-4 border-emerald-800 cursor-pointer transition active:border-b-0 active:translate-y-0.5"
                    >
                      Hoàn thành bài học! 🎉
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTaskRunning(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs text-center cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* EXERCISE QUIZ SUB-SYSTEM */}
            {activeTaskRunning === 'exercise' && (
              <div className="space-y-4 text-left">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <span className="bg-amber-400 text-amber-950 text-[9px] px-2 py-0.5 rounded-full font-black uppercase inline-block mb-1">
                    Trắc nghiệm nhanh
                  </span>
                  <h4 className="font-black text-slate-800 text-xs leading-normal">
                    Để sao chép (Copy) nhanh một đoạn văn bản hoặc hình ảnh, em dùng phím tắt thần kỳ nào?
                  </h4>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'A. Ctrl + X (Để cắt/di dời)', isCorrect: false },
                    { label: 'B. Ctrl + C (Để sao chép)', isCorrect: true },
                    { label: 'C. Ctrl + V (Để dán đè lên)', isCorrect: false },
                  ].map((option, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    let optBg = 'bg-white border-gray-200 hover:bg-slate-50';
                    if (isSelected) {
                      optBg = isQuizCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-200 text-rose-800';
                    }
                    return (
                      <button
                        key={idx}
                        disabled={isQuizCorrect === true}
                        onClick={() => {
                          setSelectedQuizOption(idx);
                          setIsQuizCorrect(option.isCorrect);
                        }}
                        className={`w-full p-2.5 text-left rounded-xl border-2 transition text-xs font-black cursor-pointer flex justify-between items-center ${optBg}`}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-black shrink-0">
                            {option.isCorrect ? '🍀 Đúng rồi!' : '❌ Sai rồi'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {isQuizCorrect && (
                  <p className="text-center text-xs font-black text-emerald-500 animate-pulse">
                    🎉 Hoan hô! Em đã chọn đáp án hoàn toàn chính xác!
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    disabled={!isQuizCorrect}
                    onClick={() => finishQuestTask('exercise')}
                    className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs text-center border-b-4 uppercase transition active:border-b-0 active:translate-y-0.5 ${
                      isQuizCorrect
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-800 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 border-transparent cursor-not-allowed'
                    }`}
                  >
                    Nhận điểm bài tập ⭐
                  </button>
                  <button
                    onClick={() => setActiveTaskRunning(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs text-center cursor-pointer"
                  >
                    Hỏi sau
                  </button>
                </div>
              </div>
            )}

            {/* TYPING GAME QUIZ SUB-SYSTEM */}
            {activeTaskRunning === 'game' && (
              <div className="space-y-4 text-center">
                <div className="bg-indigo-55 p-4 rounded-2xl border border-indigo-200 text-left">
                  <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase inline-block mb-1">
                    Thử thách phản xạ
                  </span>
                  <p className="text-xs font-extrabold text-indigo-900 leading-relaxed">
                    Bé hãy nhấn/nhấp chuột vào các phím xuất hiện trên màn hình hoặc gõ phím thật nhanh để diệt quái vật bảo vệ vương quốc nhé!
                  </p>
                </div>

                {!typingGameSuccess ? (
                  <div className="space-y-4">
                    {/* Display letters with highlight */}
                    <div className="flex justify-center gap-2 items-center">
                      {typingGameKeys.map((k, idx) => {
                        const isActive = idx === typingGameIndex;
                        const isDone = idx < typingGameIndex;
                        return (
                          <div
                            key={idx}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all ${
                              isActive
                                ? 'bg-indigo-600 text-white border-indigo-750 scale-110 animate-bounce'
                                : isDone
                                  ? 'bg-emerald-500 text-white border-emerald-600 opacity-65'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            {k}
                          </div>
                        );
                      })}
                    </div>

                    {/* Cute Virtual Keypad for mouse clicks or mobile touch! */}
                    <div className="bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
                      <p className="text-[9.5px] text-slate-400 font-bold mb-1.5 uppercase">
                        Gõ bàn phím vật lý hoặc nhấp vào phím:
                      </p>
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {typingGameKeys.map((k, idx) => {
                          const isDone = idx < typingGameIndex;
                          const isActive = idx === typingGameIndex;
                          return (
                            <button
                              key={idx}
                              disabled={isDone}
                              onClick={() => {
                                if (isActive) {
                                  const nextIndex = typingGameIndex + 1;
                                  if (nextIndex >= typingGameKeys.length) {
                                    setTypingGameSuccess(true);
                                  } else {
                                    setTypingGameIndex(nextIndex);
                                  }
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold cursor-pointer transition ${
                                isDone
                                  ? 'bg-emerald-200 text-emerald-700 border-emerald-350'
                                  : isActive
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 scale-105 shadow-xs'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              {k}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <span className="text-4xl block animate-bounce">🏆</span>
                    <p className="text-xs font-black text-emerald-600 leading-relaxed uppercase">
                      Chiến thắng! Quái vật đã bị đẩy lùi!
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    disabled={!typingGameSuccess}
                    onClick={() => finishQuestTask('game')}
                    className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs text-center border-b-4 uppercase transition active:border-b-0 active:translate-y-0.5 ${
                      typingGameSuccess
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-800 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 border-transparent cursor-not-allowed'
                    }`}
                  >
                    Hoàn tất trò chơi! 🎮
                  </button>
                  <button
                    onClick={() => setActiveTaskRunning(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs text-center cursor-pointer"
                  >
                    Thoát
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
