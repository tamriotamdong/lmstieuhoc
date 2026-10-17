import React, { useState } from 'react';
import { 
  Sparkles, 
  Tv, 
  FileText, 
  Smile, 
  MapPin, 
  BookOpen, 
  Download, 
  Lightbulb, 
  FileCheck, 
  ChevronRight,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Lesson, Question, INITIAL_QUESTIONS } from '../types';
import { getQuestionsForLesson } from '../questionBank';

const cleanInputString = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD') // Decompose into base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
};

const get3DIconForLesson = (lessonId: string): string => {
  const map: { [key: string]: string } = {
    'lic3-3-1': '🔌',
    'lic3-3-2': '🖱️',
    'lic3-3-3': '🖥️',
    'lic3-3-4': '📀',
    'lic3-3-5': '📱',
    'lic3-3-6': '🔑',
    'lic3-3-7': '📂',
    'lic3-3-8': '🌐',
    'lic3-3-9': '📡',
    'lic3-3-10': '🌍',
    'lic3-3-11': '🔖',
    'lic3-3-12': '🔎',
    'lic3-3-13': '📜',
    'lic3-3-14': '👤',
    'lic3-3-15': '💬',
    'lic3-3-16': '📣',
    'lic3-3-17': '📋',
    'lic3-3-18': '🛡️',
    'lic3-4-1': '🧠',
    'lic3-4-2': '🖨️',
    'lic3-4-3': '☁️',
    'lic3-4-4': '📁',
    'lic3-4-5': '💾',
    'lic3-4-6': '🌐',
    'lic3-4-7': '📅',
    'lic3-4-8': '📧',
    'lic3-4-9': '📞',
    'lic3-4-10': '👤',
    'lic3-4-11': '🛡️',
    'lic3-4-12': '🔎',
    'lic3-4-13': '🕸️',
    'lic3-4-14': '⌨️',
    'lic3-4-15': '🔒',
    'lic3-4-16': '📊',
    'lic3-4-17': '🧮',
    'lic3-4-18': '🤖',
    'lic3-4-19': '🎨',
    'lic3-4-20': '📜',
    'lic3-4-21': '🖊️',
    'lic3-4-22': '🛡️',
    'lic3-4-23': '🏷️',
    'lic3-4-24': '🎬',
    'lic3-4-25': '⏳',
    'l3-1': '🧠',
    'l3-2': '💻',
    'l3-3': '⚙️',
    'l3-4': '⌨️',
    'l3-5': '🖱️',
    'l3-6': '📁',
    'l3-7': '🎨',
    'l3-8': '📝',
    'l3-9': '🕸️',
    'l3-10': '🛑',
    'l3-11': '🔐',
    'l3-12': '🛠️',
    'l3-13': '🧩',
    'l3-14': '📂',
    'l3-15': '✏️',
    'l3-16': '🤖',
    'l4-1': '📂',
    'l4-2': '🔍',
    'l4-3': '📄',
    'l4-4': '🌐',
    'l4-5': '📧',
    'l4-6': '💬',
    'l4-7': '🖨️',
    'l4-8': '🎵',
    'l4-9': '🤖',
    'l4-10': '🚀',
    'l4-11': '🎬',
    'l4-12': '🎮',
    'l4-13': '🎨',
    'l4-14': '⚖️',
    'l4-15': '🔄',
    'l4-16': '🛡️',
    'l4-17': '🎁',
    'l5-1': '🖥️',
    'l5-2': '🌐',
    'l5-3': '🔎',
    'l5-4': '📂',
    'l5-5': '🛡️',
    'l5-6': '📝',
    'l5-7': '✍️',
    'l5-8a': '🎨',
    'l5-9a': '🎁',
    'l5-8b': '🐰',
    'l5-9b': '📦',
    'l5-10': '➡️',
    'l5-11': '🔄',
    'l5-12': '🔁',
    'l5-13': '⚡',
    'l5-14': '🧱',
    'l5-15': '🧮',
    'l5-16': '🚀',
  };
  return map[lessonId] || '⚡';
};

interface StudentLessonsProps {
  lessons: Lesson[];
  activeGrade: number;
  activeStudyProgress: { [lessonId: string]: number };
  activeSubject?: string;
  setActiveSubject?: (subj: string) => void;
  onUpdateXP: (earnedXP: number, taskName: string) => void;
  onLessonCompleted: (lessonId: string) => void;
  questionsList?: Question[];
}

export default function StudentLessons({
  lessons,
  activeGrade,
  activeStudyProgress,
  activeSubject = 'tin_hoc',
  setActiveSubject,
  onUpdateXP,
  onLessonCompleted,
  questionsList
}: StudentLessonsProps) {
  const isGrade3Locked = activeGrade === 3;
  const [activeProgram, setActiveProgram] = useState<string>('Kết nối tri thức với cuộc sống');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number>(activeGrade);

  const [hiddenPrograms, setHiddenPrograms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_hidden_programs');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [hiddenSubjects, setHiddenSubjects] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_hidden_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [gradesList, setGradesList] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('lms_grades_registry');
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
    } catch(e) { return [1, 2, 3, 4, 5]; }
  });

  const [subjectsList, setSubjectsList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_subjects_registry');
      return saved ? JSON.parse(saved) : ['Tin học', 'Tiếng Việt', 'Toán', 'Tiếng Anh'];
    } catch(e) { return ['Tin học', 'Tiếng Việt', 'Toán', 'Tiếng Anh']; }
  });

  React.useEffect(() => {
    const handleSync = () => {
      try {
        const savedProg = localStorage.getItem('lms_hidden_programs');
        if (savedProg) setHiddenPrograms(JSON.parse(savedProg));
        const savedSub = localStorage.getItem('lms_hidden_subjects');
        if (savedSub) setHiddenSubjects(JSON.parse(savedSub));
        const savedGrades = localStorage.getItem('lms_grades_registry');
        if (savedGrades) setGradesList(JSON.parse(savedGrades));
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

  const getSubjectIcon = (slug: string): string => {
    const SUBJECT_ICONS: Record<string, string> = {
      tin_hoc: '💻',
      tieng_viet: '📖',
      toan: '🧮',
      tieng_anh: '🌐',
    };
    return SUBJECT_ICONS[slug] || '📚';
  };

  React.useEffect(() => {
    if (hiddenPrograms.includes(activeProgram)) {
      if (activeProgram === 'Kết nối tri thức với cuộc sống' && !hiddenPrograms.includes('Tin học Quốc tế IC3 Spark')) {
        setActiveProgram('Tin học Quốc tế IC3 Spark');
      } else if (activeProgram === 'Tin học Quốc tế IC3 Spark' && !hiddenPrograms.includes('Kết nối tri thức với cuộc sống')) {
        setActiveProgram('Kết nối tri thức với cuộc sống');
      }
    }
  }, [hiddenPrograms, activeProgram]);

  // Auto-sync filter if active grade level is modified in personal information
  React.useEffect(() => {
    if (activeGrade === 3) {
      setSelectedGradeFilter(3);
    } else {
      setSelectedGradeFilter(activeGrade);
    }
  }, [activeGrade]);

  // Handle auto-syncing of grade filter when the subject is Môn Tin học (since it only has Grades 3, 4, 5)
  React.useEffect(() => {
    if (activeSubject === 'tin_hoc' && selectedGradeFilter < 3) {
      setSelectedGradeFilter(Math.max(3, activeGrade));
    }
  }, [activeSubject, selectedGradeFilter, activeGrade]);

  const activeGradeFilterId = isGrade3Locked ? 3 : selectedGradeFilter;

  // Active Lesson Overlay status
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);
  const [activeModuleTab, setActiveModuleTab] = useState<'video' | 'pdf' | 'infographic' | 'quiz'>('video');
  const [lessonQuestions, setLessonQuestions] = useState<Question[]>([]);

  // Interactive micro quiz state inside active lesson
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [matchingAnswers, setMatchingAnswers] = useState<{ [key: string]: string }>({});

  // Stable shuffled options for matching questions to avoid Hook rule violation or re-shuffling on selection change
  const [shuffledLeftPairs, setShuffledLeftPairs] = useState<any[]>([]);
  const [shuffledRightOptions, setShuffledRightOptions] = useState<any[]>([]);

  // Stable generation of questions once when lesson is opened
  React.useEffect(() => {
    if (openLesson) {
      setLessonQuestions(getQuestionsForLesson(openLesson.id, false, questionsList));
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setQuizScore(0);
      setQuizFinished(false);
      setAnswerSubmitted(false);
      setMatchingAnswers({});
    } else {
      setLessonQuestions([]);
    }
  }, [openLesson, questionsList]);

  // Synchronize matching shuffle when lesson or question changes
  React.useEffect(() => {
    if (!openLesson || lessonQuestions.length === 0) {
      setShuffledLeftPairs([]);
      setShuffledRightOptions([]);
      return;
    }
    const currentQ = lessonQuestions[currentQuizIndex];
    if (currentQ && currentQ.gameType === 'matching' && currentQ.matchingPairs) {
      setShuffledLeftPairs([...currentQ.matchingPairs].sort(() => Math.random() - 0.5));
      setShuffledRightOptions([...currentQ.matchingPairs].sort(() => Math.random() - 0.5));
    } else {
      setShuffledLeftPairs([]);
      setShuffledRightOptions([]);
    }
  }, [openLesson, currentQuizIndex, lessonQuestions]);

  // Group lessons by topic name and subject
  const filteredLessons = lessons.filter(l => {
    if (hiddenPrograms.includes(l.programType)) return false;
    
    const isSubjectMatch = (l.subject || 'tin_hoc') === activeSubject;
    const isGradeMatch = l.grade === activeGradeFilterId;
    
    if (activeSubject === 'tin_hoc') {
      return isSubjectMatch && isGradeMatch && l.programType === activeProgram;
    } else {
      return isSubjectMatch && isGradeMatch;
    }
  });

  // Distinct Chapters/Topics
  const uniqueTopics = Array.from(new Set(filteredLessons.map(l => l.topicName)));

  // Sort topics based on the teacher's configured Số thứ tự (order number)
  try {
    const cachedTopicsStr = localStorage.getItem('admin_topics_list_with_order');
    if (cachedTopicsStr) {
      const cachedTopics = JSON.parse(cachedTopicsStr);
      if (Array.isArray(cachedTopics)) {
        uniqueTopics.sort((a, b) => {
          const topicA = cachedTopics.find(t => t.name === a);
          const topicB = cachedTopics.find(t => t.name === b);
          const orderA = topicA && topicA.order !== undefined ? topicA.order : 999;
          const orderB = topicB && topicB.order !== undefined ? topicB.order : 999;
          return orderA - orderB;
        });
      }
    }
  } catch (e) {
    console.error("Failed to sort student lesson topics", e);
  }

  // Color theme mapping
  const colorMap: { [key: string]: { border: string, bg: string, text: string, hover: string } } = {
    'pastel-pink': { border: 'border-[#FFD3D9]', bg: 'bg-[#FFF0F2]', text: 'text-[#FF6B6B]', hover: 'hover:shadow-[0_8px_16px_rgba(255,107,107,0.15)]' },
    'pastel-blue': { border: 'border-[#C7DFFF]', bg: 'bg-[#EBF3FF]', text: 'text-[#3B82F6]', hover: 'hover:shadow-[0_8px_16px_rgba(59,130,246,0.15)]' },
    'pastel-yellow': { border: 'border-[#FFF5B8]', bg: 'bg-[#FFFDE8]', text: 'text-amber-500', hover: 'hover:shadow-[0_8px_16px_rgba(255,216,77,0.2)]' },
    'pastel-green': { border: 'border-[#D1F5DF]', bg: 'bg-[#EEFBF3]', text: 'text-emerald-500', hover: 'hover:shadow-[0_8px_16px_rgba(94,214,138,0.15)]' },
    'pastel-purple': { border: 'border-[#EAD1FF]', bg: 'bg-[#F7EDFF]', text: 'text-purple-500', hover: 'hover:shadow-[0_8px_16px_rgba(168,85,247,0.15)]' },
    'pastel-orange': { border: 'border-[#FFE0C5]', bg: 'bg-[#FFF5EC]', text: 'text-orange-500', hover: 'hover:shadow-[0_8px_16px_rgba(249,115,22,0.15)]' },
    'pastel-red': { border: 'border-[#FFD6D6]', bg: 'bg-[#FFF2F2]', text: 'text-red-500', hover: 'hover:shadow-[0_8px_16px_rgba(239,68,68,0.15)]' },
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setOpenLesson(lesson);
    setActiveModuleTab('video');
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setAnswerSubmitted(false);
    setMatchingAnswers({});

    // Automatically award study path starter points (+10 XP)
    onUpdateXP(10, `Đã nhấp học lý thuyết: ${lesson.title}`);
  };

  const handleSelectAnswer = (answer: string) => {
    if (answerSubmitted) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = (lessonQuestions: Question[]) => {
    if (!selectedAnswer) return;
    setAnswerSubmitted(true);
    const currentQ = lessonQuestions[currentQuizIndex];
    if (!currentQ) return;
    
    let isCorrect = false;
    if (currentQ.gameType === 'matching') {
      isCorrect = currentQ.matchingPairs?.every(pair => matchingAnswers[pair.id] === pair.id_match) ?? true;
    } else if (currentQ.gameType === 'gap_fill') {
      const answerClean = cleanInputString(selectedAnswer || '');
      const correctClean = cleanInputString(currentQ.correctAnswer || '');
      isCorrect = (answerClean === correctClean);
    } else if (currentQ.gameType === 'quiz_multi') {
      const studentAns = (selectedAnswer || '').split('; ').filter(Boolean).sort().join('; ');
      const correctAns = (currentQ.correctAnswer || '').split('; ').filter(Boolean).sort().join('; ');
      isCorrect = (studentAns === correctAns);
    } else if (currentQ.gameType === 'hotspot_image' && currentQ.hotspotRect) {
      const [clickXStr, clickYStr] = selectedAnswer.split(', ');
      const clickX = parseFloat(clickXStr);
      const clickY = parseFloat(clickYStr);
      const targetX = currentQ.hotspotRect.x;
      const targetY = currentQ.hotspotRect.y;
      
      const dist = Math.sqrt(Math.pow(clickX - targetX, 2) + Math.pow(clickY - targetY, 2));
      const threshold = Math.max(8, (currentQ.hotspotRect.radius / 350) * 100);
      isCorrect = (dist <= threshold);
    } else if (currentQ.gameType === 'dropdown_gap_fill') {
      if (currentQ.dropdownGaps && currentQ.dropdownGaps.length > 0) {
        const studentAns = selectedAnswer || '';
        const correctAns = currentQ.dropdownGaps.map(g => g.correctAnswer).join(';; ');
        isCorrect = (studentAns === correctAns);
      } else {
        isCorrect = (selectedAnswer === currentQ.correctAnswer);
      }
    } else {
      isCorrect = (selectedAnswer === currentQ.correctAnswer);
    }
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = (lessonQuestions: Question[]) => {
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setMatchingAnswers({});
    if (currentQuizIndex + 1 < lessonQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Give full marks reward
      onUpdateXP(20, `Hoàn thành cuộc thi ngắn bài học: ${openLesson?.title}`);
      
      // Update daily quests in local storage!
      try {
        const key = `questsState_v2_${localStorage.getItem('curr_user_fullname') || 'Minh Tâm'}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const quests = JSON.parse(saved);
          const updated = quests.map((q: any) => q.id === 'learn' ? { ...q, current: Math.min(q.target, q.current + 1) } : q);
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Error updating daily quest inside StudentLessons: ', err);
      }

      onLessonCompleted(openLesson?.id || '');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Breadcrumb & Subcategory: Mục con các môn học "Bài học" */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b-2 border-gray-150 pb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-extrabold uppercase select-none">
          <span>BÀI HỌC</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2454A6]">
            {(() => {
              const matchedSub = subjectsList.find(s => getSubjectSlug(s) === activeSubject);
              const displayName = matchedSub ? matchedSub.toUpperCase() : 'TIN HỌC';
              const icon = getSubjectIcon(activeSubject);
              return `MÔN ${displayName} ${icon}`;
            })()}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {subjectsList.map((name) => {
            const slug = getSubjectSlug(name);
            const sub = { id: slug, label: `Môn ${name}`, icon: getSubjectIcon(slug) };
            const isSel = activeSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  if (setActiveSubject) setActiveSubject(sub.id);
                }}
                className={`flex px-3.5 py-1.5 rounded-full text-xs font-black items-center gap-1.5 border transition duration-150 cursor-pointer ${
                  isSel 
                    ? 'bg-[#2454A6] text-white border-[#2454A6] shadow-sm' 
                    : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200 hover:text-slate-800'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade 3 hard lock alert banner */}
      {isGrade3Locked && (
        <div className="bg-[#EFF6FF] border-2 border-[#BFDBFE] p-4.5 rounded-[24px] flex items-start gap-3.5 text-[#1D4ED8] text-xs font-extrabold shadow-sm animate-fade-in">
          <span className="text-3xl select-none leading-none">🔐</span>
          <div>
            <p className="uppercase tracking-wider font-black text-[10px] text-blue-700 leading-none mb-1.5">Bạn là Học sinh Khối lớp 3</p>
            <p className="text-slate-650 font-bold leading-normal">
              Xin chào! Vì bạn là Học sinh <strong className="text-red-900 font-black">Khối lớp 3</strong>, hệ thống đã thông minh giới hạn và tự động chỉ hiển thị các bài học lý thuyết học trình của <strong className="text-red-900 font-black">Lớp 3</strong> để bạn ôn tập đúng trọng tâm nhé.
            </p>
          </div>
        </div>
      )}

      {/* Top Program controls / Subject indicators */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-5 rounded-[24px] shadow-sm border-b-4 border-gray-100">
        
        {/* Toggle standard switch (Only for Computer Science / Tin học) */}
        {activeSubject === 'tin_hoc' ? (
          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            {!hiddenPrograms.includes('Kết nối tri thức với cuộc sống') && (
              <button
                onClick={() => setActiveProgram('Kết nối tri thức với cuộc sống')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-sm tracking-wide border-b-4 transition-all duration-150 ${
                  activeProgram === 'Kết nối tri thức với cuộc sống'
                    ? 'bg-[#2454A6] text-white border-[#1e468a]'
                    : 'bg-gray-100 text-[#2454A6] hover:bg-gray-200/80 border-transparent'
                }`}
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                📚 Kết nối tri thức với cuộc sống
              </button>
            )}
            
            {!hiddenPrograms.includes('Tin học Quốc tế IC3 Spark') && (
              <button
                onClick={() => setActiveProgram('Tin học Quốc tế IC3 Spark')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-sm tracking-wide border-b-4 transition-all duration-150 ${
                  activeProgram === 'Tin học Quốc tế IC3 Spark'
                    ? 'bg-[#3B82F6] text-white border-blue-800'
                    : 'bg-gray-100 text-[#3B82F6] hover:bg-gray-200/80 border-transparent'
                }`}
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                📚 Tin học Quốc tế IC3 Spark
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-blue-50/50 border border-blue-100 px-4.5 py-3 rounded-2xl text-[#1E40AF] text-sm font-black w-full lg:w-auto select-none">
            <span className="text-xl">📚</span>
            <span>Kết nối tri thức với cuộc sống</span>
          </div>
        )}

        {/* Grade buttons for Grades dynamically synchronized */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto text-center justify-center">
          <span className="text-xs font-black text-gray-500 uppercase px-2 hidden sm:inline">Khối lớp:</span>
          {gradesList.filter(g => activeSubject !== 'tin_hoc' || g >= 3).map((gradeNum) => {
            const isDisabled = isGrade3Locked && gradeNum !== 3;
            const isFilterSelected = activeGradeFilterId === gradeNum;
            return (
              <button
                key={gradeNum}
                disabled={isDisabled}
                onClick={() => setSelectedGradeFilter(gradeNum)}
                className={`px-4 h-10 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  isFilterSelected
                    ? 'bg-white text-[#2454A6] shadow-md font-extrabold text-base'
                    : isDisabled
                    ? 'text-gray-300 bg-gray-50/50 cursor-not-allowed opacity-60'
                    : 'text-gray-500 hover:text-[#2454A6] cursor-pointer'
                }`}
                title={isDisabled ? 'Nội dung đã khóa vì bạn thuộc Khối lớp 3' : `Xem bài học Lớp ${gradeNum}`}
              >
                {isDisabled && <span className="text-xs">🔒</span>}
                <span>Lớp {gradeNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chapters curriculum view */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-[24px] p-10 shadow-sm text-center font-bold text-gray-400">
          🌱 Sắp có bài giảng mới của giáo viên tải lên cho mục chương trình này rồi nhé!
        </div>
      ) : (
        <div className="space-y-8">
          {uniqueTopics.map((topic) => {
            const topicLessons = filteredLessons.filter(l => l.topicName === topic);
            
            return (
              <div key={topic} className="space-y-4">
                {/* Chapter Heading Banner similar to Monkey Junior and ClassDojo */}
                <h3 className="text-lg md:text-xl font-black text-[#2454A6] tracking-wide inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border-l-4 border-[#2454A6] rounded-r-lg">
                  📂 {topic}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topicLessons.map((lesson) => {
                    const progress = activeStudyProgress[lesson.id] || 0;
                    const style = colorMap[lesson.colorTheme] || colorMap['pastel-blue'];

                    return (
                      <div 
                        key={lesson.id}
                        onClick={() => handleOpenLesson(lesson)}
                        className={`p-5 rounded-[20px] border-3 ${style.border} ${style.bg} ${style.hover} transition-all duration-300 transform hover:-translate-y-2.5 hover:rotate-1 flex flex-col justify-between min-h-[230px] h-auto shadow-sm relative overflow-hidden group cursor-pointer`}
                      >
                        {/* Background cartoon bubble shape */}
                        <div className="absolute right-0 bottom-0 text-5xl opacity-15 select-none transition group-hover:scale-125 duration-300">
                          {get3DIconForLesson(lesson.id)}
                        </div>

                        {/* Top info row */}
                        <div>
                          <div className="flex justify-between items-start">
                            {activeSubject !== 'tin_hoc' && (
                              <span className="text-xs font-black uppercase text-gray-500 bg-white/60 px-2.5 py-1 rounded-full border border-gray-100">
                                Bài {lesson.lessonNumber}
                              </span>
                            )}
                            
                            {/* Complete icon badges */}
                            {progress === 100 ? (
                              <span className="bg-[#5ED68A]/15 text-[#1db34f] text-[10px] py-1 px-2.5 rounded-full font-black border border-[#5ED68A] flex items-center gap-1">
                                Đã hoàn thành 😍
                              </span>
                            ) : progress > 0 ? (
                              <span className="bg-[#FFD84D]/15 text-[#b28e00] text-[10px] py-1 px-2.5 rounded-full font-black border border-[#FFD84D] flex items-center gap-1">
                                Đang học 😊
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-400 text-[10px] py-1 px-2.5 rounded-full font-black border border-slate-200">
                                Chưa học ☹️
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-[#1e293b] text-base md:text-lg mt-3 group-hover:text-[#2454A6] transition line-clamp-2">
                            {lesson.title}
                          </h4>
                          
                          <p className="text-xs font-bold text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {lesson.shortDescription}
                          </p>
                        </div>

                        {/* Progress and Study Trigger */}
                        <div className="flex items-center justify-between border-t border-gray-200/50 pt-3">
                          <div className="text-left">
                            <span className="text-[10px] font-black text-gray-400 block uppercase">Tiến Độ Học</span>
                            <span className="font-black text-gray-800 text-sm">{progress}%</span>
                          </div>

                          <button 
                            className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200/80 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-sm group-hover:border-[#3B82F6] group-hover:text-[#2454A6]"
                            style={{ fontFamily: 'var(--font-btn)' }}
                          >
                            Học ngay ⭐
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Modal Slide-In for Learning Content Details */}
      {openLesson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-quick">
          <div 
            className="w-full max-w-4xl bg-white rounded-[32px] border-4 border-[#3B82F6] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal custom header */}
            <div className="bg-[#2454A6] text-white p-5 pr-6 flex items-center justify-between border-b-4 border-[#3B82F6]">
              <div>
                <span className="text-xs uppercase bg-white/20 px-3 py-1 rounded-full font-black text-blue-200 tracking-wider">
                  {(openLesson.programType === 'Kết nối tri thức với cuộc sống' || openLesson.programType === 'GDPT2018') ? 'Tin học' : 'IC3 SPARK'} • LỚP {openLesson.grade}
                </span>
                <h3 className="text-xl md:text-2xl font-black mt-1.5" style={{ fontFamily: 'var(--font-title)' }}>
                  {openLesson.title}
                </h3>
              </div>
              <button 
                onClick={() => setOpenLesson(null)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center font-bold text-lg text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Internal Content Tab Selectors */}
            <div className="flex bg-gray-50 border-b border-gray-100 p-2.5 gap-1.5 text-center">
              {[
                { id: 'video', label: '📺 Bài Giảng Video', color: 'text-red-500 bg-red-50' },
                { id: 'pdf', label: '📖 Sách Hướng Dẫn', color: 'text-blue-500 bg-blue-50' },
                { id: 'infographic', label: '🎯 Infographic', color: 'text-amber-500 bg-amber-50' },
                { id: 'quiz', label: '📝 Ôn Luyện (+20 ⭐)', color: 'text-emerald-500 bg-emerald-50' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModuleTab(tab.id as any)}
                  className={`flex-1 py-3 px-1 sm:px-4 rounded-xl font-black text-xs sm:text-sm border-2 transition ${
                    activeModuleTab === tab.id
                      ? 'bg-white border-[#3B82F6] text-[#2454A6] shadow-sm'
                      : 'border-transparent text-gray-500 hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'var(--font-btn)' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Tab panels body with custom scrolling */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Tab: Video tutorial */}
              {activeModuleTab === 'video' && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-[20px] bg-black overflow-hidden shadow-inner border-2 border-slate-100 relative flex items-center justify-center">
                    {(() => {
                      const videoUrl = openLesson.videoUrl || '';
                      const trimmed = videoUrl.trim();
                      if (!trimmed) {
                        return <span className="text-xs font-bold text-slate-500 font-mono">⚠️ Chưa thiết lập bài giảng video</span>;
                      }
                      
                      // Case 1: Raw HTML iframe or video code
                      if (trimmed.startsWith('<iframe') || trimmed.includes('<video')) {
                        let modified = trimmed;
                        if (modified.includes('width=')) {
                          modified = modified.replace(/width="[^"]*"/g, 'width="100%"').replace(/height="[^"]*"/g, 'height="100%"');
                        }
                        return <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: modified }} />;
                      }

                      // Case 2: Direct local video file, mp4 path, or blob URL
                      if (trimmed.startsWith('blob:') || trimmed.match(/\.(mp4|webm|ogg|mov)$/i) || (!trimmed.startsWith('http') && trimmed.includes('.'))) {
                        return (
                          <video 
                            src={trimmed} 
                            controls 
                            className="w-full h-full object-contain bg-slate-900"
                            preload="auto"
                          />
                        );
                      }

                      // Case 3: YouTube standard watch link (convert to embed if needed)
                      let finalUrl = trimmed;
                      if (trimmed.includes('youtube.com/watch?v=')) {
                        const videoId = trimmed.split('v=')[1]?.split('&')[0];
                        if (videoId) {
                          finalUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                      } else if (trimmed.includes('youtu.be/')) {
                        const videoId = trimmed.split('youtu.be/')[1]?.split('?')[0];
                        if (videoId) {
                          finalUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                      }

                      return (
                        <iframe
                          src={finalUrl}
                          title="Video bài học"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    })()}
                  </div>
                  <div className="bg-[#FFFDE8] p-4 rounded-2xl border-2 border-[#FFF5B8] flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-amber-800">Mẹo nhỏ gửi tới em thích học bài:</h4>
                      <p className="text-xs font-semibold text-gray-600 mt-0.5">
                        Em hãy xem kỹ cách hướng dẫn chuyển động, ghi nhớ các bộ phận máy tính và chuẩn bị thật tốt để hoàn thành bài test trắc nghiệm ở tab cuối nhé!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: PDF guide textbook */}
              {activeModuleTab === 'pdf' && (
                <div className="space-y-4">
                  {(() => {
                    const pdfUrl = openLesson.pdfUrl || '';
                    const trimmed = pdfUrl.trim();
                    if (!trimmed) {
                      return (
                        <div className="font-bold text-slate-400 text-center py-12">
                          📚 Tài liệu hướng dẫn đang được bộ phận soạn thảo biên soạn.
                        </div>
                      );
                    }

                    // Case 1: Custom raw HTML embed or iframe code
                    if (trimmed.startsWith('<iframe') || trimmed.startsWith('<embed')) {
                      return <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200" dangerouslySetInnerHTML={{ __html: trimmed }} />;
                    }

                    // Case 2: Local uploaded blob URL
                    if (trimmed.startsWith('blob:')) {
                      return (
                        <div className="space-y-4 w-full animate-fade-in">
                          <div className="w-full bg-emerald-50/60 border-2 border-emerald-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                            <div className="text-5xl">📖</div>
                            <h4 className="font-extrabold text-[#115E59] text-base">Sách Hướng Dẫn Học Tập (.PDF)</h4>
                            <p className="text-xs text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
                              Tài liệu PDF nạp từ máy tính đã sẵn sàng! Do chính sách bảo mật của trình duyệt Chrome đối với môi trường nhúng, trình duyệt có thể chặn hiển thị trực tiếp bên trong khung này. Bạn hãy nhấp vào nút dưới đây để xem trực tuyến trên tab mới hoặc tải xuống!
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 pt-2">
                              <a 
                                href={trimmed}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-[#2454A6] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-md border-b-2 border-blue-800"
                              >
                                🔗 Xem trực tuyến trong Tab mới
                              </a>
                              <a 
                                href={trimmed}
                                download={`${openLesson.title.replace(/\s+/g, '_')}_Giao_Trinh.pdf`}
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-md border-b-2 border-emerald-800 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" /> Tải Sách (.PDF)
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Case 3: Embedded general web webpage or reference link
                    if (trimmed.startsWith('http') && !trimmed.toLowerCase().includes('.pdf') && !trimmed.includes('\n') && !trimmed.includes(' ')) {
                      return (
                        <div className="space-y-4 w-full animate-fade-in">
                          <div className="w-full h-[600px] bg-slate-50 rounded-2xl border-2 border-slate-200 overflow-hidden relative">
                            <iframe 
                              src={trimmed} 
                              className="w-full h-full border-0" 
                              title="Tài liệu liên kết trực tuyến"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                          <div className="text-center">
                            <a 
                              href={trimmed}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-[#2454A6] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-md border-b-4 border-blue-900 active:border-0 cursor-pointer"
                            >
                              🔗 Mở liên kết tài liệu trong Tab mới
                            </a>
                          </div>
                        </div>
                      );
                    }

                    // Case 4: File url or physical PDF link
                    if (trimmed.toLowerCase().includes('.pdf') || (trimmed.startsWith('http') && !trimmed.includes('\n') && !trimmed.includes(' '))) {
                      return (
                        <div className="space-y-4 w-full animate-fade-in">
                          <div className="w-full h-[600px] bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden relative">
                            <object
                              data={trimmed}
                              type="application/pdf"
                              className="w-full h-full"
                            >
                              <iframe 
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(trimmed)}&embedded=true`}
                                className="w-full h-full border-0"
                                title="Sách hướng dẫn đọc trực tuyến"
                              />
                            </object>
                          </div>
                          <div className="text-center">
                            <a 
                              href={trimmed}
                              download={`${openLesson.title.replace(/\s+/g, '_')}_Giao_Trinh.pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-[#5ED68A] hover:bg-emerald-400 text-gray-800 font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-md border-b-4 border-emerald-600 cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Tải Sách hướng dẫn (.PDF)
                            </a>
                          </div>
                        </div>
                      );
                    }

                    // Case 3: Standard text summary fallback
                    return (
                      <div className="bg-slate-50 border-3 border-dashed border-slate-200 p-6 rounded-[20px] text-center space-y-4">
                        <FileText className="w-12 h-12 text-[#2454A6] mx-auto animate-bounce" />
                        <div>
                          <h4 className="font-extrabold text-[#2454A6] text-sm">Nội dung tóm lược của sách hướng dẫn:</h4>
                          <p className="text-xs font-bold text-gray-600 max-w-xl mx-auto whitespace-pre-wrap leading-relaxed mt-2 p-4 bg-white rounded-xl border border-gray-100 text-left">
                            {pdfUrl}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab: Infographic details view */}
              {activeModuleTab === 'infographic' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#FFF5EC] to-amber-50 border-3 border-[#FFE0C5] p-5 rounded-[24px] space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      <h4 className="font-black text-[#F97316]" style={{ fontFamily: 'var(--font-title)' }}>
                        Sơ Đồ Infographic Tóm Tắt Bài Học
                      </h4>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border-2 border-[#FFE0C5] flex flex-col items-center justify-center">
                      {(() => {
                        const infographicUrl = openLesson.infographicUrl || '';
                        const trimmed = infographicUrl.trim();
                        if (!trimmed) {
                          return <div className="text-xs font-bold text-slate-400 py-6">🎨 Hình ảnh khái quát bài giảng chưa được thiết lập.</div>;
                        }

                        // Case 1: Custom raw HTML embed or image tag
                        if (trimmed.startsWith('<iframe') || trimmed.startsWith('<div') || trimmed.includes('<img')) {
                          return <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: trimmed }} />;
                        }

                        // Case 2: Direct static image file or blob asset
                        const isStaticImage = trimmed.startsWith('blob:') || 
                                              trimmed.startsWith('data:image/') || 
                                              trimmed.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);

                        if (isStaticImage) {
                          return (
                            <img 
                              src={trimmed} 
                              alt="Sơ Đồ Infographic" 
                              className="max-h-[600px] max-w-full rounded-2xl object-contain shadow-md border-2 border-[#FFE0C5]" 
                              referrerPolicy="no-referrer"
                            />
                          );
                        }

                        // Case 3: Web-based interactive presentation or embed link
                        if (trimmed.startsWith('http') && !trimmed.includes('\n') && !trimmed.includes(' ')) {
                          return (
                            <div className="w-full h-[550px] rounded-2xl border-2 border-[#FFE0C5] overflow-hidden relative shadow-md bg-white animate-fade-in">
                              <iframe 
                                src={trimmed} 
                                className="w-full h-full border-0" 
                                title="Sơ Đồ Infographic hoạt họa trực tuyến"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          );
                        }

                        // Case 3: Standard text summary fallback
                        return (
                          <div className="w-full text-left font-extrabold text-sm md:text-base text-gray-700 leading-loose whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {infographicUrl}
                          </div>
                        );
                      })()}
                    </div>

                    <p className="text-[11px] font-bold text-gray-400 text-center uppercase tracking-wider">
                      🎨 Sơ đồ độc quyền giúp học sinh học mau thuộc, nhớ cực sâu để thi đấu!
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Practice quizzes */}
              {activeModuleTab === 'quiz' && (
                <div className="space-y-4">
                  {(() => {
                    if (lessonQuestions.length === 0) {
                      return (
                        <div className="text-center py-10 font-bold text-gray-400">
                          🌱 Thật vui! Bài học này không có câu hỏi kiểm tra viết. Em đạt 100% mục này!
                          <button 
                            onClick={() => {
                              onLessonCompleted(openLesson.id);
                              setOpenLesson(null);
                            }}
                            className="bg-[#2454A6] text-white px-4 py-2 mt-4 rounded-xl block mx-auto text-xs"
                          >
                            Hoàn tất bài học ✔️
                          </button>
                        </div>
                      );
                    }

                    if (quizFinished) {
                      return (
                        <div className="bg-[#EEFBF3] border-3 border-[#D1F5DF] p-6 rounded-[24px] text-center space-y-4">
                          <span className="text-5xl inline-block animate-bounce">🎉🏆</span>
                          <h4 className="font-black text-2xl text-emerald-800" style={{ fontFamily: 'var(--font-title)' }}>
                            Chúc mừng em đã hoàn thành!
                          </h4>
                          <p className="text-sm font-extrabold text-gray-600">
                            Em trả lời đúng <span className="text-[#22c55e] text-lg font-black">{quizScore}/{lessonQuestions.length}</span> câu hỏi ôn luyện lý thuyết.
                          </p>
                          <div className="inline-block bg-white text-emerald-800 font-extrabold px-6 py-2.5 rounded-full border-2 border-[#D1F5DF]">
                            ⭐ Đạt thưởng +20 ⭐ học tập thành công!
                          </div>
                          
                          <button
                            onClick={() => {
                              setOpenLesson(null);
                              onLessonCompleted(openLesson.id);
                            }}
                            className="w-full max-w-xs mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-2xl cursor-pointer shadow-md uppercase block mx-auto"
                            style={{ fontFamily: 'var(--font-btn)' }}
                          >
                            Quay lại Bản đồ Học Tập
                          </button>
                        </div>
                      );
                    }

                    const currentQ = lessonQuestions[currentQuizIndex];

                    return (
                      <div className="bg-white rounded-2xl p-4 space-y-5">
                        
                        {/* Progress Step bar */}
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                          <span>Câu hỏi {currentQuizIndex + 1}/{lessonQuestions.length}</span>
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full uppercase text-[10px]">
                            Luyện trí nhớ 🧠
                          </span>
                        </div>

                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${((currentQuizIndex) / lessonQuestions.length) * 100}%` }}
                          ></div>
                        </div>

                        {/* Question Text */}
                        <h4 className={`font-black text-gray-800 leading-relaxed text-left transition-all duration-350 ${(() => {
                          const qText = currentQ.questionText || '';
                          if (qText.length > 130) return 'text-xs sm:text-sm';
                          if (qText.length > 70) return 'text-sm sm:text-base';
                          return 'text-base sm:text-lg md:text-xl';
                        })()}`}>
                          {currentQ.questionText}
                        </h4>

                        {/* Rendering by game layout types */}
                        {currentQ.gameType === 'quiz' && currentQ.options && (
                          <div className="grid grid-cols-1 gap-2.5">
                            {currentQ.options.map((opt) => {
                              const isSelected = selectedAnswer === opt;
                              let statusColors = 'border-gray-200 bg-gray-50 hover:bg-gray-100/50 hover:border-gray-300';
                              
                              if (isSelected) {
                                statusColors = 'border-blue-500 bg-blue-50 text-blue-900';
                              }
                              if (answerSubmitted) {
                                if (opt === currentQ.correctAnswer) {
                                  statusColors = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                                } else if (isSelected) {
                                  statusColors = 'border-red-400 bg-red-50 text-[#991b1b]';
                                }
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleSelectAnswer(opt)}
                                  disabled={answerSubmitted}
                                  className={`w-full text-left rounded-xl border-2 font-extrabold transition-all flex items-center justify-between gap-2.5 ${
                                    opt.length > 100 
                                      ? 'text-[11px] leading-tight p-2.5' 
                                      : opt.length > 50 
                                        ? 'text-xs sm:text-sm p-3' 
                                        : 'text-sm p-3.5 sm:p-4'
                                  } ${statusColors}`}
                                >
                                  <span>{opt}</span>
                                  <span className="shrink-0 font-extrabold flex items-center gap-1">
                                    {answerSubmitted && opt === currentQ.correctAnswer && <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">✔️ Đúng</span>}
                                    {answerSubmitted && isSelected && opt !== currentQ.correctAnswer && <span className="text-xs bg-red-100 text-red-850 px-2.5 py-1 rounded-lg">✕ Sai</span>}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* True False type */}
                        {currentQ.gameType === 'true_false' && (
                          <div className="grid grid-cols-2 gap-4">
                            {['Đúng', 'Sai'].map((val) => {
                              const isSelected = selectedAnswer === val;
                              let statusColors = 'border-gray-200 bg-gray-50 hover:bg-gray-100';
                              
                              if (isSelected) statusColors = 'border-blue-500 bg-blue-50 text-blue-900';
                              if (answerSubmitted) {
                                if (val === currentQ.correctAnswer) {
                                  statusColors = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                                } else if (isSelected) {
                                  statusColors = 'border-red-400 bg-red-50 text-red-800';
                                }
                              }

                              return (
                                <button
                                  key={val}
                                  onClick={() => handleSelectAnswer(val)}
                                  disabled={answerSubmitted}
                                  className={`p-6 rounded-xl border-2 font-black text-lg text-center transition ${statusColors}`}
                                >
                                  {val === 'Đúng' ? '👍 Đúng' : '👎 Sai'}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Fill in blank type */}
                        {currentQ.gameType === 'gap_fill' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={selectedAnswer || ''}
                              onChange={(e) => setSelectedAnswer(e.target.value)}
                              disabled={answerSubmitted}
                              placeholder="Nhập từ chính xác (gõ có dấu hoặc không dấu đều đúng, ví dụ: não hoặc nao)..."
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none font-bold text-center text-lg focus:border-blue-400 focus:bg-white text-[#1e293b]"
                            />
                            <div className="text-[11px] font-bold text-blue-500 mt-1 text-center">
                              💡 Bé có thể gõ có dấu hoặc không dấu đều đúng nhé! (Ví dụ: "não" hoặc "nao" đều đúng)
                            </div>
                            {answerSubmitted && (
                              <div className={`p-3 rounded-xl text-center text-sm font-bold ${
                                cleanInputString(selectedAnswer || '') === cleanInputString(currentQ.correctAnswer)
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-red-50 text-red-800'
                              }`}>
                                {cleanInputString(selectedAnswer || '') === cleanInputString(currentQ.correctAnswer)
                                  ? '🎉 Quá chính xác!'
                                  : `✕ Sai mất rồi! Đáp án đúng là: "${currentQ.correctAnswer}"`}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Dropdown Gap Fill Type */}
                        {currentQ.gameType === 'dropdown_gap_fill' && (
                          <div className="space-y-6 text-center">
                            {currentQ.dropdownGaps && currentQ.dropdownGaps.length > 0 ? (
                              <div className="space-y-5 text-left">
                                {currentQ.dropdownGaps.map((gap, gIdx) => {
                                  const selections = selectedAnswer ? selectedAnswer.split(';; ') : [];
                                  const curVal = selections[gIdx] || '';
                                  const parts = gap.questionText.split('[1]');
                                  
                                  return (
                                    <div key={gIdx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                      <span className="inline-block text-[10px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">Phần {gIdx + 1}</span>
                                      
                                      <div className="text-sm font-bold text-slate-750 flex flex-wrap items-center gap-2">
                                        <span>{parts[0]}</span>
                                        <select
                                          disabled={answerSubmitted}
                                          value={curVal}
                                          onChange={(e) => {
                                            const nextSelections = [...selections];
                                            for (let i = 0; i <= gIdx; i++) {
                                              if (nextSelections[i] === undefined) nextSelections[i] = '';
                                            }
                                            nextSelections[gIdx] = e.target.value;
                                            setSelectedAnswer(nextSelections.join(';; '));
                                          }}
                                          className="px-3 py-1.5 bg-white border-2 border-blue-300 rounded-xl font-extrabold text-blue-700 outline-none focus:border-blue-500 text-xs sm:text-sm cursor-pointer shadow-sm"
                                        >
                                          <option value="">-- Chọn đáp án --</option>
                                          {gap.options?.map((opt, oIdx) => (
                                            <option key={oIdx} value={opt}>{opt}</option>
                                          ))}
                                        </select>
                                        <span>{parts[1]}</span>
                                      </div>

                                      {gap.questionImage && (
                                        <div className="my-2 max-w-[200px] border border-slate-200 rounded-xl overflow-hidden bg-white p-1">
                                          <img src={gap.questionImage} alt="Gợi ý" className="max-h-24 object-contain mx-auto" referrerPolicy="no-referrer" />
                                        </div>
                                      )}

                                      {gap.optionImages && gap.optionImages.some(img => img) && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-2.5 rounded-xl border border-slate-100 justify-start">
                                          {gap.options?.map((opt, oIdx) => {
                                            const img = gap.optionImages?.[oIdx];
                                            if (!img) return null;
                                            const isSelectedOpt = curVal === opt;
                                            return (
                                              <div 
                                                key={oIdx} 
                                                onClick={() => {
                                                  if (!answerSubmitted) {
                                                    const nextSelections = [...selections];
                                                    for (let i = 0; i <= gIdx; i++) {
                                                      if (nextSelections[i] === undefined) nextSelections[i] = '';
                                                    }
                                                    nextSelections[gIdx] = opt;
                                                    setSelectedAnswer(nextSelections.join(';; '));
                                                  }
                                                }}
                                                className={`p-2 border border-2 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 bg-slate-50/50 hover:bg-slate-50 ${
                                                  isSelectedOpt ? 'border-blue-500 bg-blue-50/45' : 'border-slate-100'
                                                }`}
                                              >
                                                <div className="w-12 h-12 rounded overflow-hidden bg-white border flex items-center justify-center">
                                                  <img src={img} alt="" className="max-h-full max-w-full object-contain mx-auto" referrerPolicy="no-referrer" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-600 line-clamp-1">{opt}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {answerSubmitted && (
                                        <div className={`p-2 rounded-xl text-xs font-bold ${
                                          curVal === gap.correctAnswer
                                            ? 'bg-emerald-50 text-emerald-800'
                                            : 'bg-red-50 text-red-800'
                                        }`}>
                                          {curVal === gap.correctAnswer
                                            ? '🎉 Đúng rồi!'
                                            : `✕ Chưa chuẩn! Đáp án đúng là: "${gap.correctAnswer}"`}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <>
                                <div className="text-sm font-bold text-slate-750 bg-blue-50/20 p-4 rounded-xl border border-blue-100">
                                  {(() => {
                                    const parts = currentQ.questionText.split('[1]');
                                    return (
                                      <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base">
                                        <span>{parts[0]}</span>
                                        <select
                                          disabled={answerSubmitted}
                                          value={selectedAnswer || ''}
                                          onChange={(e) => setSelectedAnswer(e.target.value)}
                                          className="px-3 py-1.5 bg-white border-2 border-blue-300 rounded-xl font-extrabold text-blue-700 outline-none focus:border-blue-500 text-xs sm:text-sm cursor-pointer shadow-sm"
                                        >
                                          <option value="">-- Chọn đáp án --</option>
                                          {currentQ.dropdownOptions?.[0]?.map((opt, oIdx) => (
                                            <option key={oIdx} value={opt}>{opt}</option>
                                          ))}
                                        </select>
                                        <span>{parts[1]}</span>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {currentQ.optionImages && currentQ.optionImages.some(img => img) && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-100 justify-center">
                                    {currentQ.dropdownOptions?.[0]?.map((opt, oIdx) => {
                                      const img = currentQ.optionImages?.[oIdx];
                                      if (!img) return null;
                                      const isSelectedOpt = selectedAnswer === opt;
                                      return (
                                        <div 
                                          key={oIdx} 
                                          onClick={() => {
                                            if (!answerSubmitted) setSelectedAnswer(opt);
                                          }}
                                          className={`p-2 border-2 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 bg-slate-50/50 hover:bg-slate-50 ${
                                            isSelectedOpt ? 'border-blue-500 bg-blue-50/45' : 'border-slate-200'
                                          }`}
                                        >
                                          <div className="w-16 h-16 rounded overflow-hidden bg-white border flex items-center justify-center">
                                            <img src={img} alt="" className="max-h-full max-w-full object-contain mx-auto" referrerPolicy="no-referrer" />
                                          </div>
                                          <span className="text-[10px] font-black text-slate-600 line-clamp-1">{opt}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {answerSubmitted && (
                                  <div className={`p-3 rounded-xl text-center text-sm font-bold ${
                                    selectedAnswer === currentQ.correctAnswer
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : 'bg-red-50 text-red-800'
                                  }`}>
                                    {selectedAnswer === currentQ.correctAnswer
                                      ? '🎉 Chính xác!'
                                      : `✕ Sai rồi! Đáp án đúng là: "${currentQ.correctAnswer}"`}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {/* Matching type simplified helper */}
                        {currentQ.gameType === 'matching' && (
                          <div className="space-y-3.5 bg-purple-50/55 p-5 rounded-2xl border-2 border-purple-100 text-left">
                            <h5 className="text-xs font-black text-purple-800 uppercase tracking-wide flex items-center gap-1 flex-row">
                              <span>🔗</span> Hãy ghép các vế tương thích bên dưới (thứ tự đã được đảo ngẫu nhiên):
                            </h5>
                            
                            <div className="space-y-3 mt-3">
                              {shuffledLeftPairs.map((pair) => {
                                const selectedRightId = matchingAnswers[pair.id] || '';
                                return (
                                  <div key={pair.id} className="bg-white p-3.5 rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-6 h-6 bg-purple-600 text-white font-bold rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm">{pair.id}</span>
                                      <span className="text-sm font-extrabold text-[#334155]">{pair.left}</span>
                                    </div>
                                    
                                    <div className="shrink-0 min-w-[200px]">
                                      <select
                                        disabled={answerSubmitted}
                                        value={selectedRightId}
                                        onChange={(e) => {
                                          const nextAnswers = { ...matchingAnswers, [pair.id]: e.target.value };
                                          setMatchingAnswers(nextAnswers);
                                          
                                          // If all pairs have been matched, mark selectedAnswer as "matched" to enable submit button
                                          const allMatched = currentQ.matchingPairs.every(p => !!nextAnswers[p.id]);
                                          if (allMatched) {
                                            setSelectedAnswer('matched');
                                          } else {
                                            setSelectedAnswer(null);
                                          }
                                        }}
                                        className="w-full text-xs font-extrabold text-[#334155] p-2 bg-purple-50/40 rounded-lg outline-none border border-purple-200 focus:border-purple-500 focus:bg-white cursor-pointer"
                                      >
                                        <option value="">-- Chọn ghép nối --</option>
                                        {shuffledRightOptions.map((opt) => (
                                          <option key={opt.id_match} value={opt.id_match}>
                                            {opt.right}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {answerSubmitted && (
                              <div className="mt-4 p-3.5 rounded-xl bg-white border border-purple-150 space-y-2">
                                <span className="text-xs font-black text-purple-800 block uppercase">🔍 Đáp án đúng:</span>
                                <div className="space-y-1.5 parsed-pairs">
                                  {currentQ.matchingPairs?.map((pair) => {
                                    const isMatchCorrect = matchingAnswers[pair.id] === pair.id_match;
                                    return (
                                      <div key={pair.id} className="text-xs font-bold leading-relaxed flex items-center gap-1.5">
                                        <span>{isMatchCorrect ? '✔️' : '❌'}</span>
                                        <span className="text-gray-500 font-extrabold">{pair.left}</span> 
                                        <span className="text-[#334155]">➔ {pair.right}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Explanation logic info */}
                        {answerSubmitted && currentQ.explanation && (
                          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-xs text-left text-[#2454A6] leading-relaxed font-bold">
                            📖 Gợi ý học tập: {currentQ.explanation}
                          </div>
                        )}

                        {/* Next/Verify controllers */}
                        {(() => {
                          const isMultiGapDropdown = currentQ.gameType === 'dropdown_gap_fill' && currentQ.dropdownGaps && currentQ.dropdownGaps.length > 0;
                          const multiGapCount = isMultiGapDropdown ? currentQ.dropdownGaps?.length || 0 : 0;
                          const currentSelections = selectedAnswer ? selectedAnswer.split(';; ') : [];
                          const isMultiGapDropdownIncomplete = isMultiGapDropdown && (currentSelections.length < multiGapCount || currentSelections.some(s => !s));
                          const isAnswerInvalid = !selectedAnswer || isMultiGapDropdownIncomplete;

                          return (
                            <div className="flex justify-end gap-3 pt-2.5">
                              {!answerSubmitted ? (
                                <button
                                  onClick={() => handleSubmitAnswer(lessonQuestions)}
                                  disabled={isAnswerInvalid}
                                  className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition shadow cursor-pointer ${
                                    !isAnswerInvalid 
                                      ? 'bg-[#3B82F6] hover:bg-blue-600 text-white' 
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  Kiểm Tra Kết Quả ✔️
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleNextQuestion(lessonQuestions)}
                                  className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-500 hover:bg-emerald-600 text-white transition shadow cursor-pointer"
                                >
                                  {currentQuizIndex + 1 < lessonQuestions.length ? 'Tiếp Tục ➡️' : 'Kết Thúc Làm Bài 🎉'}
                                </button>
                              )}
                            </div>
                          );
                        })()}

                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
