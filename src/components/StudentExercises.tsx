import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight,
  HelpCircle,
  Clock,
  ClipboardCheck,
  Award,
  CheckCircle2,
  BookOpen,
  TrendingUp
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

interface StudentExercisesProps {
  lessons: Lesson[];
  activeGrade: number;
  activeStudyProgress: { [lessonId: string]: number };
  activeSubject: string;
  setActiveSubject: (subj: string) => void;
  onUpdateXP: (earnedXP: number, taskName: string) => void;
  onExerciseCompleted: (lessonId: string) => void;
  questionsList: Question[];
}

export default function StudentExercises({
  lessons,
  activeGrade,
  activeStudyProgress,
  activeSubject = 'tin_hoc',
  setActiveSubject,
  onUpdateXP,
  onExerciseCompleted,
  questionsList
}: StudentExercisesProps) {
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

  // Auto-sync filter if active grade is 3
  React.useEffect(() => {
    if (activeGrade === 3) {
      setSelectedGradeFilter(3);
    } else {
      setSelectedGradeFilter(activeGrade);
    }
  }, [activeGrade]);

  // Adjust filter when Computer Science is chosen (minimum grade 3)
  React.useEffect(() => {
    if (activeSubject === 'tin_hoc' && selectedGradeFilter < 3) {
      setSelectedGradeFilter(Math.max(3, activeGrade));
    }
  }, [activeSubject, selectedGradeFilter, activeGrade]);

  const activeGradeFilterId = isGrade3Locked ? 3 : selectedGradeFilter;

  // Active quiz state
  const [openExercise, setOpenExercise] = useState<Lesson | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [matchingAnswers, setMatchingAnswers] = useState<{ [key: string]: string }>({});

  // Stable shuffled options for matching questions to avoid Hook rule violation or re-shuffling on selection change
  const [shuffledLeftPairs, setShuffledLeftPairs] = useState<any[]>([]);
  const [shuffledRightOptions, setShuffledRightOptions] = useState<any[]>([]);

  // Filter lessons
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

  // Distinct chapter topics
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
    console.error("Failed to sort student exercise topics", e);
  }

  // Color theme mapping for matching subject background
  const colorMap: { [key: string]: { border: string, bg: string, text: string, hover: string } } = {
    'pastel-pink': { border: 'border-[#FFD3D9]', bg: 'bg-[#FFF0F2]', text: 'text-[#FF6B6B]', hover: 'hover:shadow-[0_8px_16px_rgba(255,107,107,0.15)]' },
    'pastel-blue': { border: 'border-[#C7DFFF]', bg: 'bg-[#EBF3FF]', text: 'text-[#3B82F6]'  , hover: 'hover:shadow-[0_8px_16px_rgba(59,130,246,0.15)]' },
    'pastel-yellow': { border: 'border-[#FFF5B8]', bg: 'bg-[#FFFDE8]', text: 'text-amber-500', hover: 'hover:shadow-[0_8px_16px_rgba(255,216,77,0.2)]' },
    'pastel-green': { border: 'border-[#D1F5DF]', bg: 'bg-[#EEFBF3]', text: 'text-emerald-500', hover: 'hover:shadow-[0_8px_16px_rgba(94,214,138,0.15)]' },
    'pastel-purple': { border: 'border-[#EAD1FF]', bg: 'bg-[#F7EDFF]', text: 'text-purple-500', hover: 'hover:shadow-[0_8px_16px_rgba(168,85,247,0.15)]' },
    'pastel-orange': { border: 'border-[#FFE0C5]', bg: 'bg-[#FFF5EC]', text: 'text-[#FA8231]', hover: 'hover:shadow-[0_8px_16px_rgba(250,130,49,0.15)]' },
    'pastel-red': { border: 'border-[#FFD6D6]', bg: 'bg-[#FFF2F2]', text: 'text-red-500', hover: 'hover:shadow-[0_8px_16px_rgba(239,68,68,0.15)]' },
  };

  const handleStartExercise = (lesson: Lesson) => {
    setOpenExercise(lesson);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setAnswerSubmitted(false);
    setMatchingAnswers({});
  };

  const handleSelectAnswer = (answer: string) => {
    if (answerSubmitted) return;
    setSelectedAnswer(answer);
  };

  const currentQuestions = React.useMemo(() => {
    if (!openExercise) return [];
    // Centralize randomized quiz generation using getQuestionsForLesson
    return getQuestionsForLesson(openExercise.id, true, questionsList);
  }, [openExercise, questionsList]);

  // Synchronize matching shuffle when lesson or question changes
  React.useEffect(() => {
    if (!openExercise) {
      setShuffledLeftPairs([]);
      setShuffledRightOptions([]);
      return;
    }
    const currentQ = currentQuestions[currentQuizIndex];
    if (currentQ && currentQ.gameType === 'matching' && currentQ.matchingPairs) {
      setShuffledLeftPairs([...currentQ.matchingPairs].sort(() => Math.random() - 0.5));
      setShuffledRightOptions([...currentQ.matchingPairs].sort(() => Math.random() - 0.5));
    } else {
      setShuffledLeftPairs([]);
      setShuffledRightOptions([]);
    }
  }, [openExercise, currentQuizIndex, currentQuestions]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setAnswerSubmitted(true);
    const currentQ = currentQuestions[currentQuizIndex];
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

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setMatchingAnswers({});
    if (currentQuizIndex + 1 < currentQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Award score XP
      onUpdateXP(20, `Hoàn thành bài tập luyện tập: ${openExercise?.title}`);
      
      // Update daily quests in local storage!
      try {
        const key = `questsState_v2_${localStorage.getItem('curr_user_fullname') || 'Minh Tâm'}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const quests = JSON.parse(saved);
          const updated = quests.map((q: any) => q.id === 'exercise' ? { ...q, current: Math.min(q.target, q.current + 1) } : q);
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Error updating daily quest inside StudentExercises: ', err);
      }

      if (openExercise) {
        onExerciseCompleted(openExercise.id);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Subject switcher bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b-2 border-gray-150 pb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-extrabold uppercase select-none">
          <span>BÀI TẬP</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-purple-600">
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
                onClick={() => setActiveSubject(sub.id)}
                className={`flex px-3.5 py-1.5 rounded-full text-xs font-black items-center gap-1.5 border transition duration-150 cursor-pointer ${
                  isSel 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
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

      {/* Grade Lock Alert banner matching the main visual design guidelines */}
      {isGrade3Locked && (
        <div className="bg-[#FAF5FF] border-2 border-[#EAD1FF] p-4.5 rounded-[24px] flex items-start gap-3.5 text-purple-700 text-xs font-extrabold shadow-sm animate-fade-in">
          <span className="text-3xl select-none leading-none">🔐</span>
          <div>
            <p className="uppercase tracking-wider font-black text-[10px] text-purple-600 leading-none mb-1.5">Mục Bài Tập Khối lớp 3</p>
            <p className="text-slate-650 font-bold leading-normal">
              Chào bạn! Vì bạn là Học sinh <strong className="text-purple-900 font-black">Khối lớp 3</strong>, hệ thống đã đồng bộ hiển thị các danh mục bài tập ôn luyện trí tuệ tương ứng của <strong className="text-purple-900 font-black">Khối 3</strong> để bạn thử sức giành sao nha.
            </p>
          </div>
        </div>
      )}

      {/* Selector Control Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-5 rounded-[24px] shadow-sm border-b-4 border-gray-100">
        
        {/* Connection series options */}
        {activeSubject === 'tin_hoc' ? (
          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            {!hiddenPrograms.includes('Kết nối tri thức với cuộc sống') && (
              <button
                onClick={() => setActiveProgram('Kết nối tri thức với cuộc sống')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-sm tracking-wide border-b-4 transition-all duration-150 ${
                  activeProgram === 'Kết nối tri thức với cuộc sống'
                    ? 'bg-purple-600 text-white border-purple-800'
                    : 'bg-gray-100 text-purple-600 hover:bg-gray-200/80 border-transparent'
                }`}
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                📝 Kết nối tri thức với cuộc sống
              </button>
            )}
            
            {!hiddenPrograms.includes('Tin học Quốc tế IC3 Spark') && (
              <button
                onClick={() => setActiveProgram('Tin học Quốc tế IC3 Spark')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-sm tracking-wide border-b-4 transition-all duration-150 ${
                  activeProgram === 'Tin học Quốc tế IC3 Spark'
                    ? 'bg-blue-600 text-white border-blue-800'
                    : 'bg-gray-100 text-blue-600 hover:bg-gray-200/80 border-transparent'
                }`}
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                📝 Tin học Quốc tế IC3 Spark
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-purple-50/50 border border-purple-150 px-4.5 py-3 rounded-2xl text-purple-800 text-sm font-black w-full lg:w-auto select-none">
            <span className="text-xl">📝</span>
            <span>Kết nối tri thức với cuộc sống</span>
          </div>
        )}

        {/* Grade selectors */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto text-center justify-center">
          <span className="text-xs font-black text-gray-500 uppercase px-2 hidden sm:inline">Khối lớp bài tập:</span>
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
                    ? 'bg-white text-purple-600 shadow-md font-extrabold text-base'
                    : isDisabled
                    ? 'text-gray-300 bg-gray-50/50 cursor-not-allowed opacity-60'
                    : 'text-gray-500 hover:text-purple-600 cursor-pointer'
                }`}
                title={isDisabled ? 'Nội dung khóa vì bạn ở khối lớp 3' : `Xem bài tập Lớp ${gradeNum}`}
              >
                {isDisabled && <span className="text-xs">🔒</span>}
                <span>Lớp {gradeNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapters content list split by theme */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-[24px] p-10 shadow-sm text-center font-bold text-gray-400">
          🌱 Giáo viên chưa cập nhật bài tập ôn tập mới cho phần này. Hãy ghé lại sau nhé!
        </div>
      ) : (
        <div className="space-y-8">
          {uniqueTopics.map((topic) => {
            const topicLessons = filteredLessons.filter(l => l.topicName === topic);
            
            return (
              <div key={topic} className="space-y-4 animate-fade-in">
                {/* Chapter title header banner identical to Lesson layout */}
                <h3 className="text-lg md:text-xl font-black text-purple-700 tracking-wide inline-flex items-center gap-2 px-3 py-1 bg-purple-50/50 border-l-4 border-purple-500 rounded-r-lg">
                  📂 {topic}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topicLessons.map((lesson) => {
                    const progress = activeStudyProgress[lesson.id] || 0;
                    const isDone = progress === 100;
                    const style = colorMap[lesson.colorTheme] || colorMap['pastel-blue'];

                    return (
                      <div 
                        key={lesson.id}
                        onClick={() => handleStartExercise(lesson)}
                        className={`p-5 rounded-[20px] border-3 ${style.border} ${style.bg} ${style.hover} transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between min-h-[230px] h-auto shadow-sm relative overflow-hidden group cursor-pointer`}
                      >
                        {/* Interactive floating 3D emoji */}
                        <div className="absolute -right-2 -bottom-2 text-6xl opacity-20 select-none transition-all duration-500 group-hover:opacity-40 group-hover:scale-130 group-hover:-rotate-12 filter drop-shadow-[2px_10px_10px_rgba(0,0,0,0.15)]">
                          {get3DIconForLesson(lesson.id)}
                        </div>

                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[13px] font-black uppercase text-[#6B21A8] bg-white/70 px-2.5 py-1 rounded-full border border-purple-100">
                              Trạng Thái bài tập
                            </span>
                            
                            {isDone ? (
                              <span className="bg-[#5ED68A]/15 text-[#1db34f] text-[13px] py-1 px-2.5 rounded-full font-black border border-[#5ED68A] flex items-center gap-1">
                                Hoàn thành ✔️
                              </span>
                            ) : progress > 0 ? (
                              <span className="bg-[#FFD84D]/15 text-[#b28e00] text-[13px] py-1 px-2.5 rounded-full font-black border border-[#FFD84D] flex items-center gap-1">
                                Đang làm 😊
                              </span>
                            ) : (
                              <span className="bg-slate-150/60 text-slate-400 text-[13px] py-1 px-2.5 rounded-full font-black border border-slate-200">
                                Chưa làm ☹️
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-slate-800 text-base md:text-lg mt-3 group-hover:text-purple-700 transition line-clamp-2">
                            {lesson.title}
                          </h4>
                          
                          <p className="text-xs font-bold text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            Củng cố kiến thức: {lesson.shortDescription}
                          </p>
                        </div>

                        {/* Bottom action bar */}
                        <div className="flex items-center justify-between border-t border-gray-250/20 pt-3 z-10">
                          <div className="text-left">
                            <span className="text-[10px] font-black text-gray-400 block uppercase">Điểm thưởng</span>
                            <span className="font-black text-amber-500 text-xs sm:text-sm">⭐ +20 Sao ⭐</span>
                          </div>

                          <button 
                            className={`font-black text-xs px-4 py-2.5 rounded-xl transition shadow-sm border-b-3 ${
                              isDone 
                                ? 'bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-400 text-[11px]' 
                                : 'bg-purple-600 text-white border-purple-800 hover:bg-purple-700 active:border-b-0'
                            }`}
                            style={{ fontFamily: 'var(--font-btn)' }}
                          >
                            {isDone ? 'Làm lại 🔄' : 'Làm bài tập ✏️'}
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

      {/* Interactive Exercise Pop-up Modal */}
      {openExercise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-quick">
          <div 
            className="w-full max-w-2xl bg-white rounded-[32px] border-4 border-purple-500 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-purple-700 text-white p-5 pr-6 flex items-center justify-between border-b-4 border-purple-800">
              <div>
                <span className="text-xs uppercase bg-white/20 px-3 py-1 rounded-full font-black text-purple-200 tracking-wider">
                  Luyện tập • Khối lớp {openExercise.grade}
                </span>
                <h3 className="text-lg md:text-xl font-black mt-1.5" style={{ fontFamily: 'var(--font-title)' }}>
                  Bài tập: {openExercise.title}
                </h3>
              </div>
              <button 
                onClick={() => setOpenExercise(null)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center font-bold text-sm text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content area with custom scrolling */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {quizFinished ? (
                <div className="bg-[#EEFBF3] border-3 border-[#D1F5DF] p-6 rounded-[24px] text-center space-y-4 animate-scale-up">
                  <span className="text-5xl inline-block animate-bounce">🎉🏆</span>
                  <h4 className="font-black text-2xl text-emerald-800" style={{ fontFamily: 'var(--font-title)' }}>
                    Xuất sắc! Em đã hoàn thành bài tập!
                  </h4>
                  <p className="text-sm font-extrabold text-gray-600">
                    Kết quả đúng: <span className="text-emerald-500 text-lg font-black">{quizScore}/{currentQuestions.length}</span> câu. 
                    Điểm số đạt được: <span className="text-purple-600 text-xl font-black">{(quizScore * 0.5).toFixed(1)}/10.0</span> điểm (0.5 điểm mỗi câu).
                  </p>
                  <div className="inline-block bg-white text-emerald-800 font-extrabold px-6 py-2.5 rounded-full border-2 border-[#D1F5DF] shadow-sm">
                    ⭐ Đạt sao thưởng +20 ⭐ học tập thành công!
                  </div>
                  
                  <button
                    onClick={() => {
                      setOpenExercise(null);
                    }}
                    className="w-full max-w-xs mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-2xl cursor-pointer shadow-md uppercase block mx-auto transition"
                    style={{ fontFamily: 'var(--font-btn)' }}
                  >
                    Quay lại bảng Bài Tập
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl space-y-5 p-5 md:p-6 border border-slate-100 shadow-sm animate-fade-in">
                  {/* Question Title */}
                  <h4 className={`font-black text-gray-800 leading-relaxed text-left transition-all duration-350 ${(() => {
                    const qText = currentQuestions[currentQuizIndex]?.questionText || '';
                    if (qText.length > 130) return 'text-xs sm:text-sm';
                    if (qText.length > 70) return 'text-sm sm:text-base';
                    return 'text-base sm:text-lg md:text-xl';
                  })()}`}>
                    {currentQuestions[currentQuizIndex]?.questionText}
                  </h4>

                  {currentQuestions[currentQuizIndex]?.questionImage && currentQuestions[currentQuizIndex]?.gameType !== 'hotspot_image' && (
                    <div className="my-3 max-w-full sm:max-w-md mx-auto border border-slate-200 rounded-2xl overflow-hidden bg-white p-2 shadow-sm">
                      <img 
                        src={currentQuestions[currentQuizIndex].questionImage} 
                        alt="Hình ảnh câu hỏi" 
                        className="max-h-56 object-contain block mx-auto rounded-xl" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  )}

                  {/* Game views by type */}
                  {(() => {
                    const currentQ = currentQuestions[currentQuizIndex];
                    if (!currentQ) return null;

                    return (
                      <div className="mt-4 flex-1">
                        {currentQ.gameType === 'quiz' && currentQ.options && (
                          <div className="grid grid-cols-1 gap-2.5">
                            {currentQ.options.map((opt, oIdx) => {
                              const isSelected = selectedAnswer === opt;
                              let statusColors = 'border-gray-200 bg-gray-50 hover:bg-gray-100/50 hover:border-gray-300 text-slate-705';
                              
                              if (isSelected) {
                                statusColors = 'border-purple-500 bg-purple-50 text-purple-900';
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
                                  className={`w-full text-left rounded-xl border-2 font-extrabold transition-all flex flex-col gap-1.5 p-3.5 sm:p-4 cursor-pointer ${statusColors}`}
                                >
                                  <div className="flex items-center justify-between gap-2.5 w-full">
                                    <span>{opt}</span>
                                    <span className="shrink-0 font-extrabold flex items-center gap-1">
                                      {answerSubmitted && opt === currentQ.correctAnswer && <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">✔️ Đúng</span>}
                                      {answerSubmitted && isSelected && opt !== currentQ.correctAnswer && <span className="text-xs bg-red-100 text-red-850 px-2.5 py-1 rounded-lg">✕ Sai</span>}
                                    </span>
                                  </div>
                                  {currentQ.optionImages && currentQ.optionImages[oIdx] && (
                                    <div className="max-w-[120px] max-h-[80px] rounded border border-gray-150 overflow-hidden bg-white mt-1">
                                      <img src={currentQ.optionImages[oIdx]} alt="" className="max-h-full max-w-full object-contain mx-auto" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {currentQ.gameType === 'quiz_multi' && currentQ.options && (
                          <div className="grid grid-cols-1 gap-2.5">
                            {currentQ.options.map((opt, oIdx) => {
                              const selections = selectedAnswer ? selectedAnswer.split('; ') : [];
                              const isSelected = selections.includes(opt);
                              let statusColors = 'border-gray-200 bg-gray-50 hover:bg-gray-100/50 hover:border-gray-300 text-slate-705';
                              
                              if (isSelected) {
                                statusColors = 'border-purple-500 bg-purple-50 text-purple-900';
                              }
                              
                              if (answerSubmitted) {
                                const correctList = currentQ.correctAnswer ? currentQ.correctAnswer.split('; ') : [];
                                const isCorrectOpt = correctList.includes(opt);
                                if (isCorrectOpt) {
                                  statusColors = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                                } else if (isSelected) {
                                  statusColors = 'border-red-400 bg-red-50 text-red-800';
                                }
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    if (answerSubmitted) return;
                                    const nextSelections = isSelected 
                                      ? selections.filter(s => s !== opt)
                                      : [...selections, opt];
                                    setSelectedAnswer(nextSelections.length > 0 ? nextSelections.join('; ') : null);
                                  }}
                                  className={`w-full text-left rounded-xl border-2 font-extrabold transition-all flex flex-col gap-2 p-3.5 cursor-pointer ${statusColors}`}
                                >
                                  <div className="flex items-center justify-between gap-2.5 w-full">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        readOnly
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
                                      />
                                      <span className="text-sm">{opt}</span>
                                    </div>
                                    <span className="shrink-0 font-extrabold flex items-center gap-1">
                                      {answerSubmitted && currentQ.correctAnswer?.includes(opt) && <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">✔️ Đúng</span>}
                                      {answerSubmitted && isSelected && !currentQ.correctAnswer?.includes(opt) && <span className="text-xs bg-red-100 text-red-850 px-2.5 py-1 rounded-lg">✕ Sai</span>}
                                    </span>
                                  </div>
                                  {currentQ.optionImages && currentQ.optionImages[oIdx] && (
                                    <div className="max-w-[120px] max-h-[80px] rounded border border-gray-150 overflow-hidden bg-white mt-1">
                                      <img src={currentQ.optionImages[oIdx]} alt="" className="max-h-full max-w-full object-contain mx-auto" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {currentQ.gameType === 'true_false' && (
                          <div className="grid grid-cols-2 gap-4">
                            {['Đúng', 'Sai'].map((val) => {
                              const isSelected = selectedAnswer === val;
                              let statusColors = 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-slate-705';
                              
                              if (isSelected) statusColors = 'border-purple-500 bg-purple-50 text-purple-900';
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
                                  className={`p-6 rounded-xl border-2 font-black text-lg text-center transition cursor-pointer ${statusColors}`}
                                >
                                  {val === 'Đúng' ? '👍 Đúng' : '👎 Sai'}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {currentQ.gameType === 'gap_fill' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={selectedAnswer || ''}
                              onChange={(e) => setSelectedAnswer(e.target.value)}
                              disabled={answerSubmitted}
                              placeholder="Nhập từ chính xác (gõ có dấu hoặc không dấu)"
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none font-bold text-center text-lg focus:border-purple-400 focus:bg-white text-slate-805"
                            />
                            <div className="text-[11px] font-bold text-indigo-500 mt-1 text-center">
                              💡 Bé có thể gõ có dấu hoặc không dấu đều đúng nhé! 
                            </div>

                            {/* Render option images for gap_fill if any exists */}
                            {currentQ.optionImages && currentQ.optionImages[0] && (
                              <div className="my-3 max-w-[120px] mx-auto border rounded overflow-hidden bg-white p-1">
                                <img src={currentQ.optionImages[0]} alt="Gợi ý đáp án" className="max-h-16 object-contain mx-auto" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            {answerSubmitted && (
                              <div className={`p-3 rounded-xl text-center text-sm font-bold ${
                                cleanInputString(selectedAnswer || '') === cleanInputString(currentQ.correctAnswer)
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-red-50 text-red-800'
                              }`}>
                                {cleanInputString(selectedAnswer || '') === cleanInputString(currentQ.correctAnswer)
                                  ? '🎉 Quá chính xác!'
                                  : `✕ Chưa chuẩn! Đáp án đúng là: "${currentQ.correctAnswer?.split(' | ')[0]}"`}
                              </div>
                            )}
                          </div>
                        )}

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
                                      <span className="inline-block text-[10px] font-extrabold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md">Phần {gIdx + 1}</span>
                                      
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
                                          className="px-3 py-1.5 bg-white border-2 border-purple-300 rounded-xl font-extrabold text-purple-700 outline-none focus:border-purple-500 text-xs sm:text-sm cursor-pointer shadow-sm"
                                        >
                                          {[
                                            <option key="default" value="">-- Chọn đáp án --</option>,
                                            ...(gap.options || []).map((opt, oIdx) => (
                                              <option key={opt + '-' + oIdx} value={opt}>{opt}</option>
                                            ))
                                          ]}
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
                                                className={`p-2 border-2 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 bg-slate-50/50 hover:bg-slate-50 ${
                                                  isSelectedOpt ? 'border-purple-500 bg-purple-50/40' : 'border-slate-100'
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
                                <div className="text-sm font-bold text-slate-750 bg-purple-50/40 p-4 rounded-xl border border-purple-100">
                                  {(() => {
                                    const parts = currentQ.questionText.split('[1]');
                                    return (
                                      <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base">
                                        <span>{parts[0]}</span>
                                        <select
                                          disabled={answerSubmitted}
                                          value={selectedAnswer || ''}
                                          onChange={(e) => setSelectedAnswer(e.target.value)}
                                          className="px-3 py-1.5 bg-white border-2 border-purple-300 rounded-xl font-extrabold text-purple-700 outline-none focus:border-purple-500 text-xs sm:text-sm cursor-pointer shadow-sm"
                                        >
                                          {[
                                            <option key="default" value="">-- Chọn đáp án --</option>,
                                            ...(currentQ.dropdownOptions?.[0] || []).map((opt, oIdx) => (
                                              <option key={opt + '-' + oIdx} value={opt}>{opt}</option>
                                            ))
                                          ]}
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
                                            isSelectedOpt ? 'border-purple-500 bg-purple-50/40' : 'border-slate-200'
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

                        {currentQ.gameType === 'hotspot_image' && (
                          <div className="space-y-3.5 text-center">
                            <div className="text-xs font-extrabold text-blue-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                              🎯 Nhấp trực tiếp vào điểm chính xác trên hình ảnh dưới đây để chọn!
                            </div>
                            <div 
                              className="relative max-w-[380px] mx-auto border-2 border-slate-200 rounded-2xl overflow-hidden cursor-crosshair select-none bg-slate-100"
                              onClick={(e) => {
                                if (answerSubmitted) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                                const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                                setSelectedAnswer(`${clickX.toFixed(2)}, ${clickY.toFixed(2)}`);
                              }}
                            >
                              <img 
                                src={currentQ.questionImage} 
                                alt="Điểm nóng" 
                                className="w-full h-auto max-h-[300px] object-contain block mx-auto" 
                                referrerPolicy="no-referrer" 
                              />
                              {selectedAnswer && (
                                <div 
                                  className="absolute w-8 h-8 -ml-4 -mt-4 bg-purple-500/30 border-2 border-purple-700 rounded-full animate-ping flex items-center justify-center pointer-events-none"
                                  style={{ left: `${parseFloat(selectedAnswer.split(', ')[0])}%`, top: `${parseFloat(selectedAnswer.split(', ')[1])}%` }}
                                />
                              )}
                              {selectedAnswer && (
                                <div 
                                  className="absolute w-5 h-5 -ml-2.5 -mt-2.5 bg-purple-600 border border-white rounded-full flex items-center justify-center font-black text-[9px] text-white pointer-events-none shadow"
                                  style={{ left: `${parseFloat(selectedAnswer.split(', ')[0])}%`, top: `${parseFloat(selectedAnswer.split(', ')[1])}%` }}
                                >
                                  📍
                                </div>
                              )}
                              {answerSubmitted && currentQ.hotspotRect && (
                                <div 
                                  className="absolute w-12 h-12 -ml-6 -mt-6 border-4 border-emerald-500 rounded-full bg-emerald-500/10 flex items-center justify-center pointer-events-none"
                                  style={{ left: `${currentQ.hotspotRect.x}%`, top: `${currentQ.hotspotRect.y}%` }}
                                >
                                  <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1 font-black leading-none py-0.5">Tâm</span>
                                </div>
                              )}
                            </div>

                            {answerSubmitted && (
                              <div className={`p-3 rounded-xl text-center text-sm font-bold ${
                                (() => {
                                  if (!selectedAnswer || !currentQ.hotspotRect) return false;
                                  const [xStr, yStr] = selectedAnswer.split(', ');
                                  const dist = Math.sqrt(Math.pow(parseFloat(xStr) - currentQ.hotspotRect.x, 2) + Math.pow(parseFloat(yStr) - currentQ.hotspotRect.y, 2));
                                  const threshold = Math.max(8, (currentQ.hotspotRect.radius / 350) * 100);
                                  return dist <= threshold;
                                })()
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-red-50 text-red-800'
                              }`}>
                                {(() => {
                                  if (!selectedAnswer || !currentQ.hotspotRect) return false;
                                  const [xStr, yStr] = selectedAnswer.split(', ');
                                  const dist = Math.sqrt(Math.pow(parseFloat(xStr) - currentQ.hotspotRect.x, 2) + Math.pow(parseFloat(yStr) - currentQ.hotspotRect.y, 2));
                                  const threshold = Math.max(8, (currentQ.hotspotRect.radius / 350) * 100);
                                  return dist <= threshold;
                                })()
                                  ? '🎉 Nhắm bắn cực chuẩn xác!'
                                  : '✕ Điểm nhấp của bạn chưa chính xác! Hãy quan sát vị trí tâm đúng.'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Fallbacks or explanations inside matching pairs */}
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
                                        {[
                                          <option key="default" value="">-- Chọn ghép nối --</option>,
                                          shuffledRightOptions.map((opt, rIdx) => (
                                            <option key={(opt.id_match || '') + '-' + rIdx} value={opt.id_match}>
                                              {opt.right}
                                            </option>
                                          ))
                                        ]}
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

                        {/* Interactive Explanation */}
                        {answerSubmitted && currentQ.explanation && (
                          <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 text-xs text-left text-purple-700 leading-relaxed font-bold">
                            💡 Gợi ý học tập: {currentQ.explanation}
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
                                  onClick={handleSubmitAnswer}
                                  disabled={isAnswerInvalid}
                                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wide transition shadow cursor-pointer ${
                                    !isAnswerInvalid 
                                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  Kiểm Tra Kết Quả ✔️
                                </button>
                              ) : (
                                <button
                                  onClick={handleNextQuestion}
                                  className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wide bg-emerald-500 hover:bg-emerald-600 text-white transition shadow cursor-pointer"
                                >
                                  {currentQuizIndex + 1 < currentQuestions.length ? 'Tiếp Tục ➡️' : 'Kết Thúc & Nhận Thưởng ⭐️'}
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
