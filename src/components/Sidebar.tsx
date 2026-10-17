import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Map, 
  BookOpen, 
  ClipboardCheck, 
  Gamepad2, 
  Award, 
  Gift, 
  PhoneCall, 
  Menu, 
  Sparkles,
  User,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Wrench,
  Globe,
  FileText
} from 'lucide-react';
import { Badge, StudentProfile, UserRole, INITIAL_BADGES } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubject?: string;
  setActiveSubject?: (subj: string) => void;
  grade?: number;
  classNameStr?: string;
  currUser?: StudentProfile | null;
  role?: UserRole;
  onLogout?: () => void;
  totalCollectedXP?: number;
  badgesList?: Badge[];
  adminActiveTab?: 'students' | 'teachers' | 'lessons' | 'questions' | 'badges' | 'levels' | 'rewards' | 'games' | 'lesson_planner' | 'profile' | 'general_management';
  setAdminActiveTab?: (tab: 'students' | 'teachers' | 'lessons' | 'questions' | 'badges' | 'levels' | 'rewards' | 'games' | 'lesson_planner' | 'profile' | 'general_management') => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  activeSubject = 'tin_hoc',
  setActiveSubject,
  grade, 
  classNameStr,
  currUser,
  role = 'student',
  onLogout,
  totalCollectedXP,
  badgesList,
  adminActiveTab,
  setAdminActiveTab
}: SidebarProps) {
  // 2. Sub-accordion state specifically for the lessons selection list
  const [lessonsExpanded, setLessonsExpanded] = useState(activeTab === 'lessons');
  const [exercisesExpanded, setExercisesExpanded] = useState(activeTab === 'exercises');
  const [onlineExamsExpanded, setOnlineExamsExpanded] = useState(activeTab === 'online_exams');
  const [gamesExpanded, setGamesExpanded] = useState(activeTab === 'games');

  const [hiddenSubjects, setHiddenSubjects] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_hidden_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [hiddenPrograms, setHiddenPrograms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_hidden_programs');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [menuConfig, setMenuConfig] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lms_menu_config');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [subjectsList, setSubjectsList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_subjects_registry');
      return saved ? JSON.parse(saved) : ['Tin học', 'Tiếng Việt', 'Toán', 'Tiếng Anh'];
    } catch(e) { return ['Tin học', 'Tiếng Việt', 'Toán', 'Tiếng Anh']; }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedProg = localStorage.getItem('lms_hidden_programs');
        if (savedProg) setHiddenPrograms(JSON.parse(savedProg));
        const savedSub = localStorage.getItem('lms_hidden_subjects');
        if (savedSub) setHiddenSubjects(JSON.parse(savedSub));
        const savedMenu = localStorage.getItem('lms_menu_config');
        if (savedMenu) setMenuConfig(JSON.parse(savedMenu));
        const savedSubRegistry = localStorage.getItem('lms_subjects_registry');
        if (savedSubRegistry) setSubjectsList(JSON.parse(savedSubRegistry));
      } catch(e){}
    };
    window.addEventListener('lms_settings_changed', handleSync);
    return () => window.removeEventListener('lms_settings_changed', handleSync);
  }, []);

  const getSubjectSlug = (name: string): string => {
    if (!name) return 'tin_hoc';
    return name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");
  };

  const getSubjectIconAndColor = (slug: string) => {
    const SUBJECT_ICONS: Record<string, string> = {
      tin_hoc: '💻',
      tieng_viet: '📖',
      toan: '🧮',
      tieng_anh: '🌐',
    };
    const SUBJECT_COLORS: Record<string, string> = {
      tin_hoc: 'bg-[#5ED68A]',
      tieng_viet: 'bg-[#FF6B6B]',
      toan: 'bg-[#FFD84D]',
      tieng_anh: 'bg-[#3B82F6]',
    };
    return {
      icon: SUBJECT_ICONS[slug] || '📚',
      color: SUBJECT_COLORS[slug] || 'bg-indigo-400',
    };
  };

  const dynamicSubjects = subjectsList.map(name => {
    const slug = getSubjectSlug(name);
    const { icon, color } = getSubjectIconAndColor(slug);
    return {
      id: slug,
      label: `Môn ${name}`,
      icon,
      color,
    };
  });

  const isSubjectHidden = (subjCodeOrName: string): boolean => {
    const nameLower = subjCodeOrName.toLowerCase();
    let name = subjCodeOrName;
    if (nameLower === 'tin_hoc' || nameLower === 'tin học') name = 'Tin học';
    else if (nameLower === 'tieng_viet' || nameLower === 'tiếng việt') name = 'Tiếng Việt';
    else if (nameLower === 'toan' || nameLower === 'toán') name = 'Toán';
    else if (nameLower === 'tieng_anh' || nameLower === 'tiếng anh') name = 'Tiếng Anh';
    return hiddenSubjects.includes(name);
  };

  // Intelligent auto-expansion effect when tabs shift externally
  useEffect(() => {
    if (activeTab === 'lessons') {
      setLessonsExpanded(true);
    }
    if (activeTab === 'exercises') {
      setExercisesExpanded(true);
    }
    if (activeTab === 'online_exams') {
      setOnlineExamsExpanded(true);
    }
    if (activeTab === 'games') {
      setGamesExpanded(true);
    }
  }, [activeTab]);

  // Grouped Menu Items depending on active authorization role and dynamically customized via menuConfig
  const getMergedMenuConfig = () => {
    const defaultModules = [
      { id: 'home', label: 'Trang chủ', student: true, teacher: true, admin: true },
      { id: 'student', label: 'Học sinh', student: true, teacher: false, admin: false },
      { id: 'teacher_dashboard', label: 'Giáo viên', student: false, teacher: true, admin: false },
      { id: 'admin', label: 'Quản lý', student: false, teacher: false, admin: true },
      { id: 'lesson_planner', label: 'Soạn giáo án', student: false, teacher: true, admin: true },
      { id: 'skkn_creator', label: 'Viết SKKN', student: false, teacher: true, admin: true },
      { id: 'game_creator', label: 'Tạo trò chơi', student: false, teacher: true, admin: true },
      { id: 'test_creator', label: 'Tạo đề thi', student: false, teacher: true, admin: true },
      { id: 'online_exams', label: 'Đề thi Online', student: true, teacher: true, admin: true },
      { id: 'utilities', label: 'Tiện ích', student: false, teacher: true, admin: true },
      { id: 'lessons', label: 'Bài học', student: true, teacher: false, admin: true },
      { id: 'exercises', label: 'Bài tập', student: true, teacher: false, admin: true },
      { id: 'games', label: 'Trò chơi', student: true, teacher: false, admin: true },
      { id: 'achievements', label: 'Thành tích', student: true, teacher: true, admin: true },
      { id: 'rewards', label: 'Phần thưởng', student: true, teacher: true, admin: true },
      { id: 'contact', label: 'Liên hệ', student: true, teacher: true, admin: true }
    ];
    if (!menuConfig || menuConfig.length === 0) return defaultModules;
    return menuConfig;
  };

  const ICON_MAP: Record<string, any> = {
    home: Home,
    student: User,
    teacher_dashboard: User,
    admin: Shield,
    lesson_planner: GraduationCap,
    skkn_creator: FileText,
    game_creator: Gamepad2,
    test_creator: ClipboardCheck,
    online_exams: Globe,
    utilities: Wrench,
    lessons: BookOpen,
    exercises: ClipboardCheck,
    games: Gamepad2,
    achievements: Award,
    rewards: Gift,
    contact: PhoneCall,
  };

  const COLOR_MAP: Record<string, string> = {
    home: 'text-amber-400',
    student: 'text-emerald-400',
    teacher_dashboard: 'text-blue-400',
    admin: 'text-indigo-400',
    lesson_planner: 'text-emerald-400',
    skkn_creator: 'text-sky-400',
    game_creator: 'text-orange-455',
    test_creator: 'text-purple-400',
    online_exams: 'text-indigo-400',
    utilities: 'text-rose-455',
    lessons: 'text-pink-405',
    exercises: 'text-[#a78bfa]',
    games: 'text-red-400',
    achievements: 'text-yellow-300',
    rewards: 'text-orange-400',
    contact: 'text-sky-300',
  };

  const [customMenuExpanded, setCustomMenuExpanded] = useState<Record<string, boolean>>({});

  const studyItems = getMergedMenuConfig()
    .filter(item => {
      if (role === 'admin') return item.admin !== false;
      if (role === 'teacher') return item.teacher !== false;
      return item.student !== false;
    })
    .map(item => ({
      id: item.id,
      label: item.label,
      icon: ICON_MAP[item.id] || Sparkles,
      color: COLOR_MAP[item.id] || 'text-indigo-400',
      children: (item.children || []).filter((child: any) => {
        if (role === 'admin') return child.admin !== false;
        if (role === 'teacher') return child.teacher !== false;
        return child.student !== false;
      })
    }));

  // Helper values derived for student rankings & badges
  let activeTier = 'Đồng ⚪';
  let highestBadgeName = 'Tân Bình Tin học 🌱';

  if (currUser) {
    const checkXP = typeof totalCollectedXP === 'number' ? totalCollectedXP : currUser.xp;
    const earnedBadges = (badgesList || INITIAL_BADGES).filter(b => checkXP >= b.xpRequired);
    if (earnedBadges.length > 0) {
      const highestBadge = earnedBadges[earnedBadges.length - 1];
      highestBadgeName = highestBadge.title;
      activeTier = highestBadge.tier === 'Đồng' ? 'Hạng Đồng ️🥉'
                 : highestBadge.tier === 'Bạc' ? 'Hạng Bạc ️🥈'
                 : highestBadge.tier === 'Vàng' ? 'Hạng Vàng ️🥇'
                 : highestBadge.tier === 'Kim Cương' ? 'Hạng Kim Cương 💎'
                 : 'Hạng Huyền Thoại 👑';
    }
  }

  // Render a single menuItem
  const renderMenuItem = (item: { id: string; label: string; icon: React.ComponentType<any>; color: string; children?: any[] }) => {
    const IconComponent = item.icon;
    
    // Dynamic tab highlighting for admin view synchronization
    let isActive = activeTab === item.id || Boolean(item.children?.some(c => c.id === activeTab));
    const isAdminOrTeacher = role === 'admin' || role === 'teacher';
    if (isAdminOrTeacher && activeTab === 'admin') {
      if (item.id === 'lessons' && adminActiveTab === 'lessons') {
        isActive = true;
      } else if (item.id === 'exercises' && adminActiveTab === 'questions') {
        isActive = true;
      } else if (item.id === 'games' && adminActiveTab === 'games') {
        isActive = true;
      } else if (item.id === 'rewards' && adminActiveTab === 'rewards') {
        isActive = true;
      } else if (item.id === 'admin' && (adminActiveTab === 'students' || adminActiveTab === 'teachers' || adminActiveTab === 'badges' || adminActiveTab === 'levels' || adminActiveTab === 'profile' || adminActiveTab === 'general_management')) {
        isActive = true;
      } else if (item.id === 'lesson_planner' && adminActiveTab === 'lesson_planner') {
        isActive = true;
      }
    }

    const isLessons = item.id === 'lessons';
    const isExercises = item.id === 'exercises';
    const isOnlineExams = item.id === 'online_exams';
    const isGames = item.id === 'games';

    return (
      <div key={item.id} className="space-y-1">
        <button
          id={`sidebar-tab-${item.id}`}
          onClick={() => {
            const isAdmin = role === 'admin';
            if (isAdmin && item.id === 'lessons') {
              setActiveTab('admin');
              if (setAdminActiveTab) {
                setAdminActiveTab('lessons');
              }
            } else if (isAdmin && item.id === 'exercises') {
              setActiveTab('admin');
              if (setAdminActiveTab) {
                setAdminActiveTab('questions');
              }
            } else if (isAdmin && item.id === 'games') {
              setActiveTab('admin');
              if (setAdminActiveTab) {
                setAdminActiveTab('games');
              }
            } else if (isAdmin && item.id === 'rewards') {
              setActiveTab('admin');
              if (setAdminActiveTab) {
                setAdminActiveTab('rewards');
              }
            } else if (isAdmin && item.id === 'admin') {
              setActiveTab('admin');
              if (setAdminActiveTab) {
                setAdminActiveTab('students');
              }
            } else if (item.id === 'lesson_planner') {
              setActiveTab('lesson_planner');
            } else if (item.id === 'skkn_creator') {
              setActiveTab('skkn_creator');
            } else if (item.id === 'teacher_dashboard') {
              setActiveTab('teacher_dashboard');
            } else if (item.id === 'game_creator') {
              setActiveTab('game_creator');
            } else if (item.id === 'test_creator') {
              setActiveTab('test_creator');
            } else {
              setActiveTab(item.id);
            }
            if (isLessons) {
              setLessonsExpanded(prev => !prev);
            }
            if (isExercises) {
              setExercisesExpanded(prev => !prev);
            }
            if (isOnlineExams) {
              setOnlineExamsExpanded(prev => !prev);
            }
            if (isGames) {
              setGamesExpanded(prev => !prev);
            }
            if (item.children && item.children.length > 0) {
              setCustomMenuExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }));
            }
          }}
          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-2xl text-left font-bold transition-all duration-200 ease-out border-b-2 ${
            isActive
              ? 'bg-white text-[#2454A6] scale-[1.01] shadow-sm border-white/85'
              : 'text-white hover:bg-white/10 hover:translate-x-0.5 border-transparent'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${isActive ? 'bg-[#F3F6FD]' : 'bg-white/10'}`}>
            <IconComponent className={`w-4 h-4 ${item.color}`} />
          </div>
          <span className="text-[14px] tracking-wide capitalize" style={{ fontFamily: 'var(--font-btn)' }}>
            {item.label}
          </span>

          {isLessons && (
            <div className="ml-auto text-current opacity-70">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${lessonsExpanded ? 'rotate-180' : 'rotate-0'}`} />
            </div>
          )}

          {isExercises && (
            <div className="ml-auto text-current opacity-70">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${exercisesExpanded ? 'rotate-180' : 'rotate-0'}`} />
            </div>
          )}

          {isOnlineExams && (
            <div className="ml-auto text-current opacity-70">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${onlineExamsExpanded ? 'rotate-180' : 'rotate-0'}`} />
            </div>
          )}

          {isGames && (
            <div className="ml-auto text-current opacity-70">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${gamesExpanded ? 'rotate-180' : 'rotate-0'}`} />
            </div>
          )}

          {item.children && item.children.length > 0 && !isLessons && !isExercises && !isOnlineExams && !isGames && (
            <div className="ml-auto text-current opacity-70">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${customMenuExpanded[item.id] ? 'rotate-180' : 'rotate-0'}`} />
            </div>
          )}
        </button>

        {/* Sub-items list for 'lessons' (Môn Tin học, Tiếng Việt, Toán, Tiếng Anh) */}
        {isLessons && lessonsExpanded && (
          <div className="pl-5 pr-2 my-1 space-y-1 bg-white/5 py-2 rounded-2xl border border-white/10 animate-fade-in">
            {dynamicSubjects.filter(sub => !isSubjectHidden(sub.id)).map((sub) => {
              const isSubActive = isActive && activeSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab('lessons');
                    if (setActiveSubject) setActiveSubject(sub.id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-[14px] font-black transition-all cursor-pointer ${
                    isSubActive 
                      ? 'bg-white text-[#2454A6] shadow-sm font-extrabold border-l-4 border-l-[#5ED68A]' 
                      : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm select-none">{sub.icon}</span>
                  <span className="truncate">{sub.label}</span>
                  {isSubActive && (
                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${sub.color}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-items list for 'exercises' (Môn Tin học, Tiếng Việt, Toán, Tiếng Anh) */}
        {isExercises && exercisesExpanded && (
          <div className="pl-5 pr-2 my-1 space-y-1 bg-white/5 py-2 rounded-2xl border border-white/10 animate-fade-in">
            {dynamicSubjects.filter(sub => !isSubjectHidden(sub.id)).map((sub) => {
              const isSubActive = isActive && activeSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab('exercises');
                    if (setActiveSubject) setActiveSubject(sub.id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-[14px] font-black transition-all cursor-pointer ${
                    isSubActive 
                      ? 'bg-white text-[#2454A6] shadow-sm font-extrabold border-l-4 border-l-[#5ED68A]' 
                      : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm select-none">{sub.icon}</span>
                  <span className="truncate">{sub.label}</span>
                  {isSubActive && (
                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${sub.color}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-items list for 'online_exams' (Môn Tin học, Tiếng Việt, Toán, Tiếng Anh) */}
        {isOnlineExams && onlineExamsExpanded && (
          <div className="pl-5 pr-2 my-1 space-y-1 bg-white/5 py-2 rounded-2xl border border-white/10 animate-fade-in">
            {dynamicSubjects.filter(sub => !isSubjectHidden(sub.id)).map((sub) => {
              const isSubActive = isActive && activeSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab('online_exams');
                    if (setActiveSubject) setActiveSubject(sub.id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-[14px] font-black transition-all cursor-pointer ${
                    isSubActive 
                      ? 'bg-white text-[#2454A6] shadow-sm font-extrabold border-l-4 border-l-[#5ED68A]' 
                      : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm select-none">{sub.icon}</span>
                  <span className="truncate">{sub.label}</span>
                  {isSubActive && (
                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${sub.color}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-items list for 'games' (Môn Tin học, Tiếng Việt, Toán, Tiếng Anh) */}
        {isGames && gamesExpanded && (
          <div className="pl-5 pr-2 my-1 space-y-1 bg-white/5 py-2 rounded-2xl border border-white/10 animate-fade-in">
            {dynamicSubjects.filter(sub => !isSubjectHidden(sub.id)).map((sub) => {
              const isSubActive = isActive && activeSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab('games');
                    if (setActiveSubject) setActiveSubject(sub.id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-[14px] font-black transition-all cursor-pointer ${
                    isSubActive 
                      ? 'bg-white text-[#2454A6] shadow-sm font-extrabold border-l-4 border-l-[#5ED68A]' 
                      : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm select-none">{sub.icon}</span>
                  <span className="truncate">{sub.label}</span>
                  {isSubActive && (
                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${sub.color}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-items list for custom category menu with children */}
        {item.children && item.children.length > 0 && customMenuExpanded[item.id] && (
          <div className="pl-6 pr-2 my-1 space-y-1 bg-white/5 py-2 rounded-2xl border border-white/10 animate-fade-in">
            {item.children.map((child: any) => {
              const isChildActive = activeTab === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => {
                    setActiveTab(child.id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-[13.5px] font-black transition-all cursor-pointer ${
                    isChildActive
                      ? 'bg-white text-[#2454A6] shadow-sm font-extrabold border-l-4 border-l-[#FFD84D]'
                      : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <span className="truncate">{child.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      id="side-nav" 
      className="fixed top-0 left-0 bg-[#2454A6] text-white w-[260px] h-screen flex flex-col shadow-2xl z-20 border-r-4 border-[#3B82F6]"
    >
      {/* Brand Header */}
      <div className="p-5 border-b-2 border-[#3B82F6] flex flex-col items-center justify-center text-center gap-2 shrink-0">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-bounce" />
          <span className="font-extrabold text-[10px] tracking-widest text-[#FFD84D]">LMS Tiểu học</span>
        </div>
        <h2 className="text-xl font-black tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] whitespace-nowrap">
          Kết nối <span className="text-[#5ED68A]">Tri thức</span> 🎓
        </h2>
      </div>

      {/* Navigation List of Menu Items with Smart Sub-Accordion for Lessons */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {studyItems.map(renderMenuItem)}
      </nav>

      {/* Stylized Active Student Profile & Logout Card */}
      {currUser && (
        <div className="p-3 shrink-0 border-t border-[#3B82F6] bg-[#1e468a]/45">
          <div className="bg-white text-slate-800 p-2.5 rounded-[22px] border border-blue-200 shadow-xl flex flex-col gap-1.5">
            
            {/* Top row with Avatar and Details */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-150 border-2 border-sky-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
                {currUser.avatar || '🐱'}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <span className="text-[9px] font-black text-gray-400 block tracking-wider uppercase leading-none mb-0.5">
                  {role === 'admin' ? 'Quản trị viên 👑' : role === 'teacher' ? 'Giáo viên 👩‍🏫' : 'Học sinh 👦'}
                </span>
                <span className="text-[13px] font-extrabold text-[#2454A6] block leading-none truncate" style={{ fontFamily: 'var(--font-title)' }}>
                  {currUser.fullname}
                </span>
                <span className="inline-block bg-[#E1F2FF] text-[#2454A6] text-[9.5px] font-black px-2 py-0.5 rounded-full mt-0.5 border border-[#B8DFFF] leading-none">
                  {currUser.className ? `Lớp ${currUser.className}` : 'Lớp Học'}
                </span>
              </div>
            </div>

            {/* Sub-group displaying Hạng & Huy hiệu cao nhất */}
            <div className="text-[12px] space-y-0.5 bg-slate-50 border border-gray-100 p-1.5 rounded-xl text-left font-bold">
              <div className="flex justify-between">
                <span className="text-gray-400 text-[12px]">Chiến binh:</span>
                <span className="text-[#d97706] font-black leading-none text-[12px]">{activeTier}</span>
              </div>
              <div className="flex justify-between items-center gap-1">
                <span className="text-gray-400 shrink-0 leading-none text-[12px]">Huy hiệu:</span>
                <span className="text-indigo-600 font-extrabold truncate leading-none text-[12px]" title={highestBadgeName}>{highestBadgeName}</span>
              </div>
            </div>

            {/* Divider Line */}
            <hr className="border-gray-100 my-0.2" />

            {/* Bottom Row containing Stars Accumulation + Quick Sign Out Button */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-600 text-xs flex items-center gap-1 select-none leading-none">
                Tích lũy: {currUser.xp} ⭐
              </span>
              
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-black text-xs hover:bg-rose-50 px-2 rounded-lg cursor-pointer transition duration-150 leading-none py-1 border border-transparent hover:border-rose-250 animate-pulse"
                >
                  <span>[→ Thoát</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Real humbler tiny footer */}
          <div className="text-[11px] text-white font-bold text-center mt-2 select-none tracking-wide leading-none drop-shadow-sm">
            Giáo viên Tin học - Tiểu học Trần Văn Danh
          </div>
        </div>
      )}
    </div>
  );
}
