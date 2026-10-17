import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Download, 
  Play, 
  BookOpen, 
  Check, 
  ChevronRight, 
  ChevronDown,
  Trophy,
  Gift,
  HelpCircle,
  Star,
  Users,
  Volume2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { SoundEffects } from '../App';
import { INITIAL_QUESTIONS } from '../types';
import { getQuestionsForLesson } from '../questionBank';
import pptxgen from 'pptxgenjs';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

type GameMode = 
  | 'lucky_wheel' 
  | 'millionaire' 
  | 'secret_grid' 
  | 'treasure_hunt' 
  | 'balloon_pop' 
  | 'car_racing' 
  | 'memory' 
  | 'magic_hat' 
  | 'olympia' 
  | 'lucky_gift';

interface GameCreatorProps {
  role?: string;
}

const DEFAULT_BACKGROUNDS = [
  { id: 'slate', name: 'Bóng đêm huyền bí 🌌', value: 'bg-slate-900 border-slate-800' },
  { id: 'ocean', name: 'Đại dương xanh thẳm 🌊', value: 'bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-950 border-blue-900' },
  { id: 'forest', name: 'Rừng xanh cổ tích 🌳', value: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-stone-950 border-emerald-900' },
  { id: 'sunset', name: 'Hoàng hôn rực rỡ 🌅', value: 'bg-gradient-to-br from-amber-950 via-rose-900 to-slate-950 border-rose-950' },
  { id: 'space', name: 'Vũ trụ lấp lánh ✨', value: 'bg-gradient-to-br from-purple-950 via-indigo-950 to-black border-purple-900' }
];

export default function GameCreator({ role }: GameCreatorProps) {
  const isAdmin = role === 'admin' || localStorage.getItem('lms_current_role') === 'admin';

  // Local state for Gemini API key to avoid 429 quota exhaustion or retry blocks
  const [personalApiKey, setPersonalApiKey] = useState(() => localStorage.getItem('personal_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [backgroundsCatalog, setBackgroundsCatalog] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lms_game_backgrounds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BACKGROUNDS;
  });

  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('slate');
  const [newBgName, setNewBgName] = useState('');
  const [newBgFile, setNewBgFile] = useState<string>('');

  const handleAdminBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBgFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomBg = () => {
    if (!newBgName.trim()) {
      triggerToast('⚠️ Vui lòng nhập tên cho hình nền mới!');
      return;
    }
    if (!newBgFile) {
      triggerToast('⚠️ Vui lòng tải lên tập tin hình nền!');
      return;
    }

    const newBg = {
      id: `custom_${Date.now()}`,
      name: newBgName,
      value: newBgFile,
      isCustom: true
    };

    const updated = [...backgroundsCatalog, newBg];
    setBackgroundsCatalog(updated);
    localStorage.setItem('lms_game_backgrounds', JSON.stringify(updated));
    setSelectedBackgroundId(newBg.id);
    setNewBgName('');
    setNewBgFile('');
    triggerToast('🎉 Admin đã tải lên hình nền mặc định thành công!');
    SoundEffects.playKeng();
  };

  const handleDeleteBg = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const bg = backgroundsCatalog.find(b => b.id === id);
    if (!bg) return;
    if (!bg.isCustom) {
      triggerToast('⚠️ Không thể xoá hình nền hệ thống mặc định!');
      return;
    }
    const updated = backgroundsCatalog.filter(b => b.id !== id);
    setBackgroundsCatalog(updated);
    localStorage.setItem('lms_game_backgrounds', JSON.stringify(updated));
    if (selectedBackgroundId === id) {
      setSelectedBackgroundId('slate');
    }
    triggerToast('🗑️ Đã xoá hình nền thành công!');
    SoundEffects.playTing();
  };

  const [gameType, setGameType] = useState<GameMode>('lucky_wheel');
  const [gameTitle, setGameTitle] = useState('Vòng quay may mắn điểm thưởng 🎡');
  const [timeLimit, setTimeLimit] = useState(15);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [memoryCardCount, setMemoryCardCount] = useState<number>(8);
  const [manualQuestionType, setManualQuestionType] = useState<'choice' | 'true_false'>('choice');

  // --- NEW CUSTOM GAME STATES ---
  // 1. Lucky Wheel Custom
  const [wheelFlow, setWheelFlow] = useState<'spin_first' | 'answer_first'>('spin_first');
  const [wheelSlicesInput, setWheelSlicesInput] = useState<string>("+10 Điểm, Nhân đôi x2, Mất lượt, +20 Điểm, May mắn 💎, +50 Điểm, Thêm lượt, Chia đôi");
  const [wheelSlicesCount, setWheelSlicesCount] = useState<number>(8);

  const handleSlicesCountChange = (count: number) => {
    setWheelSlicesCount(count);
    const list = wheelSlicesInput.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length > count) {
      setWheelSlicesInput(list.slice(0, count).join(', '));
    } else {
      const updatedList = [...list];
      while (updatedList.length < count) {
        updatedList.push(`+${(updatedList.length + 1) * 10} Điểm`);
      }
      setWheelSlicesInput(updatedList.join(', '));
    }
  };

  const handleSliceChange = (idx: number, val: string) => {
    const list = wheelSlicesInput.split(',').map(s => s.trim());
    while (list.length < 12) {
      list.push("");
    }
    list[idx] = val;
    setWheelSlicesInput(list.filter((s, i) => i < wheelSlicesCount && s !== undefined).join(', '));
  };

  // 2. Secret Grid Custom
  const [secretGridSize, setSecretGridSize] = useState<number>(9);
  const [secretCoverImage, setSecretCoverImage] = useState<string>("https://images.unsplash.com/photo-1543002588-bfa74002ed7e");
  const [secretCorrectAnswer, setSecretCorrectAnswer] = useState<string>('SÁCH GIÁO KHOA');
  const [secretGuessInput, setSecretGuessInput] = useState<string>('');
  const [showSecretAnswerSim, setShowSecretAnswerSim] = useState<boolean>(false);

  // 3. Treasure Hunt Custom
  const [treasureIslands, setTreasureIslands] = useState<string[]>(["⚓ Khởi Hành", "🏝️ Ải Hoàng Hôn", "🏝️ Vịnh San Hô", "🏝️ Đảo Hải Tặc", "💎 Hang Kho Báu"]);
  const [treasureStartIcon, setTreasureStartIcon] = useState<string>("⚓");
  const [treasurePointIcon, setTreasurePointIcon] = useState<string>("🏝️");
  const [treasureChestIcon, setTreasureChestIcon] = useState<string>("💎");
  const [treasureShipIcon, setTreasureShipIcon] = useState<string>("🚢");
  const [treasureMapTitle, setTreasureMapTitle] = useState<string>("🗺️ HẢI TRÌNH TRUY TÌM KHO BÁU");

  // 4. Balloon Pop Custom
  const [balloonCount, setBalloonCount] = useState<number>(6);

  // 5. Memory Match Custom
  const [memoryPairs, setMemoryPairs] = useState<Array<{ question: string; answer: string }>>([
    { question: "Màn hình 📺", answer: "Hiển thị thông tin" },
    { question: "Bàn phím ⌨️", answer: "Nhập dữ liệu chữ" },
    { question: "Chuột máy 🖱️", answer: "Điều khiển con trỏ" },
    { question: "Loa phát 🔊", answer: "Phát ra âm thanh" },
    { question: "CPU 🧠", answer: "Bộ não xử lý phần cứng" },
    { question: "Internet 🌐", answer: "Mạng toàn cầu kết nối" }
  ]);

  // 6. Magic Hat Custom
  const [magicHatKeyword, setMagicHatKeyword] = useState<string>('TINHOC');
  const [magicHatTurnsAvailable, setMagicHatTurnsAvailable] = useState<number>(0);
  const [magicHatWordGuess, setMagicHatWordGuess] = useState<string>('');

  // Subjects & Grade Filter for automatic loading
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('tin_hoc');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number>(3);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');

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

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedProg = localStorage.getItem('lms_hidden_programs');
        if (savedProg) setHiddenPrograms(JSON.parse(savedProg));
        const savedSub = localStorage.getItem('lms_hidden_subjects');
        if (savedSub) setHiddenSubjects(JSON.parse(savedSub));
      } catch(e){}
    };
    window.addEventListener('lms_settings_changed', handleSync);
    return () => window.removeEventListener('lms_settings_changed', handleSync);
  }, []);

  const [customBgColor, setCustomBgColor] = useState<string>('#1e1b4b');
  const [questionColor, setQuestionColor] = useState<string>('#38bdf8');
  const [answerColor, setAnswerColor] = useState<string>('#ffffff');

  useEffect(() => {
    if (selectedSubjectFilter !== 'tin_hoc') {
      setSelectedProgramFilter('Kết nối tri thức với cuộc sống');
    } else {
      setSelectedProgramFilter('all');
    }
  }, [selectedSubjectFilter]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lms_lessons_list');
      if (saved) setLessonsList(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  // Local question bank state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      question: "Thiết bị nào sau đây dùng để nhập dữ liệu vào máy tính?",
      options: ["Bàn phím và Chuột", "Màn hình hiển thị", "Máy in màu", "Loa phát thanh"],
      correctAnswer: 0
    },
    {
      question: "Để bảo vệ mật khẩu tài khoản cá nhân, em nên làm gì?",
      options: ["Chia sẻ cho bạn thân", "Đặt mật khẩu mạnh và giữ bí mật", "Viết lên bảng lớp", "Không cần đặt mật khẩu"],
      correctAnswer: 1
    },
    {
      question: "Đâu là một dạng thông tin cơ bản trong đời sống?",
      options: ["Dạng chữ, hình ảnh, âm thanh", "Dạng mùi vị thức ăn", "Dạng cảm xúc", "Dạng nhiệt độ"],
      correctAnswer: 0
    },
    {
      question: "Phần mềm Microsoft Word dùng để làm gì?",
      options: ["Lập trình trò chơi", "Xem phim hoạt hình", "Soạn thảo văn bản", "Vẽ tranh phong cảnh"],
      correctAnswer: 2
    },
    {
      question: "Trí tuệ nhân tạo (AI) viết tắt của từ tiếng Anh nào?",
      options: ["Artificial Intelligence", "Active Internet", "Auto Information", "Apple Intel"],
      correctAnswer: 0
    }
  ]);

  const [currentQ, setCurrentQ] = useState('');
  const [currentOpt1, setCurrentOpt1] = useState('');
  const [currentOpt2, setCurrentOpt2] = useState('');
  const [currentOpt3, setCurrentOpt3] = useState('');
  const [currentOpt4, setCurrentOpt4] = useState('');
  const [currentAns, setCurrentAns] = useState(0);

  // Playground simulation states
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayIndex, setActivePlayIndex] = useState(0);
  const [playScore, setPlayScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // --- Specific states for 10 individual games ---
  // 1. Lucky Wheel state
  const [wheelDegree, setWheelDegree] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinMultiplier, setSpinMultiplier] = useState<number>(1);
  const [hasSpunThisTurn, setHasSpunThisTurn] = useState(false);

  // 2. Millionaire lifelines
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [audienceUsed, setAudienceUsed] = useState(false);
  const [phoneUsed, setPhoneUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [audienceStats, setAudienceStats] = useState<{ [key: number]: number } | null>(null);
  const [phoneAdvice, setPhoneAdvice] = useState<string | null>(null);

  // 3. Secret Grid (Mở ô cửa bí mật)
  const [revealedSecretDoors, setRevealedSecretDoors] = useState<boolean[]>(Array(9).fill(false));
  const [activeGridChoice, setActiveGridChoice] = useState<number | null>(null);
  const [secretKeyword, setSecretKeyword] = useState('MÁY VI TÍNH');
  const [secretConceptWord, setSecretConceptWord] = useState('');
  const [didGuessSecret, setDidGuessSecret] = useState(false);

  // 4. Treasure Hunt state
  const [treasureIslandIndex, setTreasureIslandIndex] = useState(0);

  // 5. Balloon Pop state
  const [popBalloons, setPopBalloons] = useState<Array<{ id: number; color: string; popped: boolean; score: number }>>([]);
  const [activeBalloonIdx, setActiveBalloonIdx] = useState<number | null>(null);

  // 6. Car Racing (Đội A và Đội B)
  const [racingPosA, setRacingPosA] = useState(0);
  const [racingPosB, setRacingPosB] = useState(0);
  const [activeRacingTeam, setActiveRacingTeam] = useState<'A' | 'B'>('A');

  // 7. Memory Match local cards
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [selectedMemoryIndices, setSelectedMemoryIndices] = useState<number[]>([]);

  // 8. Chiếc nón kỳ diệu (Wheel of Fortune)
  const [fortuneWord, setFortuneWord] = useState('TRAIDAT');
  const [fortuneRevealedLetters, setFortuneRevealedLetters] = useState<string[]>([]);
  const [fortunePointer, setFortunePointer] = useState<string>('200 Điểm');
  const [fortuneSolved, setFortuneSolved] = useState(false);

  // 9. Olympia Kids state
  const [olympiaRound, setOlympiaRound] = useState<'khoi_dong' | 'chong_ngai_vat' | 'tang_toc' | 've_dich'>('khoi_dong');
  const [olympiaCorrectCount, setOlympiaCorrectCount] = useState(0);
  const [olympiaStarOfHope, setOlympiaStarOfHope] = useState(false);

  // 10. Gift Boxes state
  const [giftBoxes, setGiftBoxes] = useState<Array<{ id: number; reward: string; opened: boolean; val: number }>>([]);
  const [activeGiftIdx, setActiveGiftIdx] = useState<number | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const titles: { [key in GameMode]: string } = {
      lucky_wheel: "Vòng quay may mắn điểm thưởng 🎡",
      millionaire: "Ai là triệu phú Trí tuệ 🏆",
      secret_grid: "Mở ô cửa bí mật khám phá tranh ẩn 🖼️",
      treasure_hunt: "Hành trình truy tìm kho báu Đại dương 🏴‍☠️",
      balloon_pop: "Bắn bóng kiến thức nổ rực rỡ 🎈",
      car_racing: "Đường đua trả lời siêu tốc nhóm 🏎️",
      memory: "Ghép cặp trí nhớ thuật ngữ bài giảng 🧩",
      magic_hat: "Chiếc nón kỳ diệu đoán từ vựng 👒",
      olympia: "Đường lên đỉnh Olympia nhí học đường ⛰️",
      lucky_gift: "Hộp quà bí mật nhận điểm thưởng 🎁"
    };
    setGameTitle(titles[gameType] || 'Trò chơi Giáo dục');
  }, [gameType]);

  // Synchronize student simulation state in real-time when inputs/setup values are edited
  useEffect(() => {
    setSecretKeyword(secretCorrectAnswer || 'MÁY VI TÍNH');
    setFortuneWord((magicHatKeyword || 'TINHOC').trim().toUpperCase());
    setRevealedSecretDoors(Array(Number(secretGridSize) || 9).fill(false));
    
    const colors = ["#F43F5E", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#14B8A6"];
    const finalBalloonCount = Number(balloonCount) || 6;
    setPopBalloons(Array.from({ length: finalBalloonCount }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      popped: false,
      score: (i + 1) * 10
    })));
  }, [secretCorrectAnswer, secretGridSize, magicHatKeyword, balloonCount, gameType, quizQuestions]);

  const handleRandomFromExercises = () => {
    let allQs: any[] = [];
    try {
      const saved = localStorage.getItem('lms_questions_list');
      if (saved) allQs = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    
    if (allQs.length === 0) allQs = INITIAL_QUESTIONS;

    let lessons: any[] = [];
    try {
      const savedL = localStorage.getItem('lms_lessons_list');
      if (savedL) lessons = JSON.parse(savedL);
    } catch (e) {}

    const matchedLessons = lessons.filter((l: any) => {
      if (hiddenPrograms.includes(l.programType)) return false;
      const matchGrade = Number(l.grade) === Number(selectedGradeFilter);
      const matchSubject = !l.subject || l.subject === selectedSubjectFilter;
      const matchProgram = selectedProgramFilter === 'all' || 
        l.programType === selectedProgramFilter ||
        (selectedProgramFilter === 'Tin học Quốc tế' && (l.programType === 'Tin học Quốc tế IC3 Spark' || l.programType === 'IC3SPARK' || l.programType === 'IC3 SPARK'));
      return matchGrade && matchSubject && matchProgram;
    });

    let mergedPool: any[] = [];
    if (selectedLessonFilter !== 'all') {
      mergedPool = getQuestionsForLesson(selectedLessonFilter, true, allQs);
    } else {
      matchedLessons.forEach((l: any) => {
        mergedPool.push(...getQuestionsForLesson(l.id, true, allQs));
      });
      if (mergedPool.length === 0) {
        mergedPool = allQs.filter(q => {
          const qSubject = q.subject || 'tin_hoc';
          const qGrade = Number(q.grade) || 3;
          return qSubject === selectedSubjectFilter && qGrade === Number(selectedGradeFilter);
        });
      }
    }

    const filtered = mergedPool.filter(q => q.options && q.options.length >= 2);
    if (filtered.length === 0) {
      triggerToast(`⚠️ Không tìm thấy câu hỏi tương thích. Hãy bổ sung ở mục Bài tập.`);
      return;
    }

    const parsedNum = Number(numQuestions);
    const mQuestions = isNaN(parsedNum) || parsedNum <= 0 ? 5 : parsedNum;
    const chosen = [...filtered].sort(() => Math.random() - 0.5).slice(0, mQuestions);
    setQuizQuestions(chosen.map((q: any) => {
      const opts = q.options.map((o: string) => o.replace(/^[A-D]\.\s*/, '').trim());
      return {
        question: q.questionText,
        options: opts.length >= 4 ? opts.slice(0, 4) : [...opts, "Đáp án khác", "Chưa đúng"].slice(0, 4),
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
      };
    }));
    triggerToast(`🎉 Thành công! Nạp ${chosen.length} câu đố từ Kho bài giảng.`);
    SoundEffects.playKeng();
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQ.trim()) {
      triggerToast('⚠️ Điền nội dung câu hỏi!');
      return;
    }
    const finalOpts = manualQuestionType === 'true_false' 
      ? ["Đúng", "Sai", "Chưa rõ", "N/A"]
      : [currentOpt1 || "Đáp án A", currentOpt2 || "Đáp án B", currentOpt3 || "Đáp án C", currentOpt4 || "Đáp án D"];

    setQuizQuestions([...quizQuestions, {
      question: currentQ,
      options: finalOpts,
      correctAnswer: Number(currentAns)
    }]);
    setCurrentQ('');
    setCurrentOpt1('');
    setCurrentOpt2('');
    setCurrentOpt3('');
    setCurrentOpt4('');
    triggerToast('➕ Đã bổ sung câu hỏi mới!');
    SoundEffects.playTing();
  };

  const handleDeleteQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleAIGenerateQuestions = async () => {
    if (!aiTopic.trim()) {
      triggerToast('⚠️ Nhập chủ đề thiết kế bằng AI!');
      return;
    }
    const parsedNum = Number(numQuestions);
    const mQuestions = isNaN(parsedNum) || parsedNum <= 0 ? 5 : parsedNum;
    setGenerationError(null);
    setIsGenerating(true);
    try {
      const personalKey = personalApiKey || localStorage.getItem('personal_gemini_api_key') || '';
      const response = await fetch('/api/generate-game-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': personalKey
        },
        body: JSON.stringify({
          topic: aiTopic,
          grade: `Lớp ${selectedGradeFilter}`,
          subject: selectedSubjectFilter === 'tin_hoc' ? 'Tin học' : 'Khoa học',
          numQuestions: mQuestions
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Máy chủ phản hồi lỗi!');
      }

      const data = await response.json();
      if (data.questionBank && data.questionBank.length > 0) {
        setQuizQuestions(data.questionBank.slice(0, mQuestions));
        triggerToast(`🤖 AI Gemini đã biên soạn xong ${data.questionBank.length} câu hỏi đỉnh cao!`);
        SoundEffects.playKeng();
      } else {
        triggerToast('⚠️ Phản hồi từ AI chưa tương thích, vui lòng nhập thủ công.');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Gặp sự cố không mong muốn.';
      setGenerationError(errMsg);
      triggerToast('❌ ' + errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadMemoryGame = () => {
    const pairsCount = (Number(memoryCardCount) || 8) / 2;
    let pool: Array<{ t: string; d: string }> = [];
    
    // Fill from custom memoryPairs
    if (memoryPairs && memoryPairs.length > 0) {
      memoryPairs.forEach(p => {
        pool.push({ t: p.question, d: p.answer });
      });
    }

    // Fallback if empty or too small
    const fallback = [
      { t: "Màn hình 📺", d: "Hiển thị thông tin" },
      { t: "Bàn phím ⌨️", d: "Nhập dữ liệu chữ" },
      { t: "Chuột máy 🖱️", d: "Điều khiển con trỏ" },
      { t: "Loa phát 🔊", d: "Phát ra âm thanh" },
      { t: "CPU 🧠", d: "Bộ não xử lý phần cứng" },
      { t: "Internet 🌐", d: "Mạng toàn cầu kết nối" }
    ];

    let i = 0;
    if (pool.length === 0) {
      pool = fallback;
    }
    while (pool.length < pairsCount) {
      pool.push(pool[i % pool.length]);
      i++;
    }
    pool = pool.slice(0, pairsCount);
    
    let list: any[] = [];
    pool.forEach((p, index) => {
      list.push({ id: `t-${index}`, text: p.t, matchId: index, matched: false, flipped: false });
      list.push({ id: `d-${index}`, text: p.d, matchId: index, matched: false, flipped: false });
    });
    setMemoryCards(list.sort(() => Math.random() - 0.5));
  };

  const handlePlayTest = () => {
    setIsPlaying(true);
    setActivePlayIndex(0);
    setPlayScore(0);
    setIsDone(false);
    setSelectedAns(null);

    // Reset Wheel
    setHasSpunThisTurn(false);
    setSpinMultiplier(1);

    // Reset Millionaire
    setFiftyFiftyUsed(false);
    setAudienceUsed(false);
    setPhoneUsed(false);
    setHiddenOptions([]);
    setAudienceStats(null);
    setPhoneAdvice(null);

    // Reset Secret Grid
    setRevealedSecretDoors(Array(Number(secretGridSize) || 9).fill(false));
    setActiveGridChoice(null);
    setDidGuessSecret(false);
    setSecretKeyword(secretCorrectAnswer || 'MÁY VI TÍNH');
    setSecretGuessInput('');

    // Reset Treasure Hunt
    setTreasureIslandIndex(0);

    // Reset Balloon
    const colors = ["#F43F5E", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#14B8A6"];
    const finalBalloonCount = Number(balloonCount) || 6;
    setPopBalloons(Array.from({ length: finalBalloonCount }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      popped: false,
      score: (i + 1) * 10
    })));
    setActiveBalloonIdx(null);

    // Reset Racing
    setRacingPosA(0);
    setRacingPosB(0);
    setActiveRacingTeam('A');

    // Reset Chiếc nón kỳ diệu
    setFortuneWord((magicHatKeyword || 'TINHOC').trim().toUpperCase());
    setFortuneRevealedLetters([]);
    setFortuneSolved(false);
    setMagicHatTurnsAvailable(0);
    setMagicHatWordGuess('');

    // Reset Olympia
    setOlympiaRound('khoi_dong');
    setOlympiaCorrectCount(0);
    setOlympiaStarOfHope(false);

    // Reset Gift box
    const prizes = ["+10 Điểm", "Trả lời câu đố", "Nhân đôi x2", "+15 Điểm", "Trả lời câu đố"];
    setGiftBoxes(prizes.map((p, i) => ({
      id: i,
      reward: p,
      opened: false,
      val: p.includes("x2") ? 2 : p.includes("+15") ? 15 : 10
    })));
    setActiveGiftIdx(null);

    if (gameType === 'memory') loadMemoryGame();
    SoundEffects.playKeng();
  };

  // Memory card logic handler
  const handleMemoryCardClick = (idx: number) => {
    if (selectedMemoryIndices.length >= 2 || memoryCards[idx].flipped || memoryCards[idx].matched) return;
    
    const updated = [...memoryCards];
    updated[idx].flipped = true;
    setMemoryCards(updated);

    const active = [...selectedMemoryIndices, idx];
    setSelectedMemoryIndices(active);

    if (active.length === 2) {
      const [first, second] = active;
      if (memoryCards[first].matchId === memoryCards[second].matchId) {
        setTimeout(() => {
          const matchCards = [...memoryCards];
          matchCards[first].matched = true;
          matchCards[second].matched = true;
          setMemoryCards(matchCards);
          setSelectedMemoryIndices([]);
          setPlayScore(s => s + 20);
          SoundEffects.playKeng();

          if (matchCards.every(c => c.matched)) setTimeout(() => setIsDone(true), 1000);
        }, 600);
      } else {
        setTimeout(() => {
          const resetCards = [...memoryCards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setMemoryCards(resetCards);
          setSelectedMemoryIndices([]);
        }, 1200);
      }
    }
  };

  const handleSelectLocalAns = (idx: number) => {
    if (selectedAns !== null) return;
    const q = quizQuestions[activePlayIndex];
    if (!q) return;
    setSelectedAns(idx);
    const correct = idx === q.correctAnswer;

    if (correct) {
      let increment = 10;
      if (gameType === 'lucky_wheel') increment = 10 * spinMultiplier;
      setPlayScore(s => s + increment);
      SoundEffects.playKeng();
      SoundEffects.playCheer();

      // Advanced game steps on correct
      if (gameType === 'treasure_hunt') setTreasureIslandIndex(prev => Math.min(treasureIslands.length - 1, prev + 1));
      if (gameType === 'car_racing') {
        if (activeRacingTeam === 'A') setRacingPosA(p => Math.min(100, p + 25));
        else setRacingPosB(p => Math.min(100, p + 25));
      }
      if (gameType === 'secret_grid' && activeGridChoice !== null) {
        const updateGrid = [...revealedSecretDoors];
        updateGrid[activeGridChoice] = true;
        setRevealedSecretDoors(updateGrid);
      }
      if (gameType === 'olympia') {
        setOlympiaCorrectCount(c => c + 1);
        setPlayScore(s => s + (olympiaStarOfHope ? 20 : 10));
      }
    } else {
      SoundEffects.playTing();
    }
  };

  const handleNextLocalQ = () => {
    setSelectedAns(null);
    setHiddenOptions([]);
    setAudienceStats(null);
    setPhoneAdvice(null);
    setHasSpunThisTurn(false);
    setSpinMultiplier(1);
    setActiveGridChoice(null);
    setActiveBalloonIdx(null);
    setActiveGiftIdx(null);
    setOlympiaStarOfHope(false);

    // Handle racing team rotation
    if (gameType === 'car_racing') {
      setActiveRacingTeam(prev => prev === 'A' ? 'B' : 'A');
    }

    if (activePlayIndex < quizQuestions.length - 1) {
      setActivePlayIndex(activePlayIndex + 1);
    } else {
      setIsDone(true);
    }
  };

  // Spin Lucky Wheel simulation
  const handleSpinWheel = () => {
    if (isSpinning || hasSpunThisTurn) return;
    setIsSpinning(true);
    SoundEffects.playTing();
    const multipliers = [1, 2, 3, 5, 1, 2, 3, 10];
    const randomIndex = Math.floor(Math.random() * multipliers.length);
    const step = 360 / multipliers.length;
    const newDeg = wheelDegree + 1440 + (randomIndex * step);
    setWheelDegree(newDeg);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpunThisTurn(true);
      const chosenMult = multipliers[randomIndex];
      setSpinMultiplier(chosenMult);
      if (chosenMult > 2) {
        triggerToast(`🎡 Vòng quay quay trúng ô nhân hệ số x${chosenMult} cho câu đố tiếp theo!`);
      }
      SoundEffects.playKeng();
    }, 2500);
  };

  // Millionaire lifelines
  const handleUse5050 = () => {
    if (fiftyFiftyUsed || selectedAns !== null) return;
    const q = quizQuestions[activePlayIndex];
    if (!q) return;
    setFiftyFiftyUsed(true);
    const wr: number[] = [];
    q.options.forEach((_, idx) => { if (idx !== q.correctAnswer) wr.push(idx); });
    setHiddenOptions(wr.sort(() => Math.random() - 0.5).slice(0, 2));
    SoundEffects.playTing();
  };

  const handleUseAudience = () => {
    if (audienceUsed || selectedAns !== null) return;
    const q = quizQuestions[activePlayIndex];
    if (!q) return;
    setAudienceUsed(true);
    const correct = q.correctAnswer;
    const stats: { [key: number]: number } = { 0: 5, 1: 5, 2: 5, 3: 5 };
    stats[correct] = 70;
    let remaining = 15;
    [0, 1, 2, 3].forEach(idx => {
      if (idx !== correct) {
        const gain = Math.floor(Math.random() * remaining);
        stats[idx] += gain;
        remaining -= gain;
      }
    });
    setAudienceStats(stats);
    SoundEffects.playTing();
  };

  const handleUsePhone = () => {
    if (phoneUsed || selectedAns !== null) return;
    const q = quizQuestions[activePlayIndex];
    if (!q) return;
    setPhoneUsed(true);
    const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer];
    setPhoneAdvice(`Mình cực kỳ tự tin đáp án đúng là ${correctLetter}. Bạn nên tin mình 99%!`);
    SoundEffects.playTing();
  };

  // Secret door click
  const handleDoorClick = (num: number) => {
    if (revealedSecretDoors[num]) return;
    setActiveGridChoice(num);
    setSelectedAns(null);
    SoundEffects.playTing();
  };

  const handleGuessSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretConceptWord.trim().toUpperCase() === secretKeyword.trim().toUpperCase()) {
      setDidGuessSecret(true);
      setPlayScore(s => s + 50);
      setRevealedSecretDoors(Array(9).fill(true));
      SoundEffects.playKeng();
      triggerToast("🎉 Xuất sắc! Bạn đã giải mã thành công bí mật phía sau bức ảnh ẩn!");
    } else {
      triggerToast("❌ Chưa đúng rồi! Hãy mở thêm nhiều ô cửa gợi ý hơn nhé.");
    }
  };

  // Balloon shooter pop click
  const handleBalloonClick = (idx: number) => {
    if (popBalloons[idx].popped) return;
    const updated = [...popBalloons];
    updated[idx].popped = true;
    setPopBalloons(updated);
    setActiveBalloonIdx(idx);
    setSelectedAns(null);
    SoundEffects.playKeng();
  };

  // Chiếc nón đoán chữ logic
  const handleGuessLetter = (char: string) => {
    if (fortuneRevealedLetters.includes(char) || fortuneSolved) return;
    const nextArr = [...fortuneRevealedLetters, char];
    setFortuneRevealedLetters(nextArr);
    SoundEffects.playTing();

    // Check if word is fully revealed
    const wordClean = fortuneWord.toUpperCase();
    const solved = wordClean.split('').every(letter => letter === ' ' || nextArr.includes(letter));
    if (solved) {
      setFortuneSolved(true);
      setPlayScore(s => s + 100);
      SoundEffects.playKeng();
      triggerToast("🌟 Bạn đã đoán chính xác từ khóa cứu cánh!");
    }
  };

  // Olympia Kids stage triggers
  const handleOlympiaNextRound = () => {
    SoundEffects.playKeng();
    if (olympiaRound === 'khoi_dong') setOlympiaRound('chong_ngai_vat');
    else if (olympiaRound === 'chong_ngai_vat') setOlympiaRound('tang_toc');
    else if (olympiaRound === 'tang_toc') setOlympiaRound('ve_dich');
    else setIsDone(true);
  };

  // Open Gift Box
  const handleOpenGiftBox = (idx: number) => {
    if (giftBoxes[idx].opened) return;
    const updated = [...giftBoxes];
    updated[idx].opened = true;
    setGiftBoxes(updated);
    setActiveGiftIdx(idx);

    const gift = giftBoxes[idx];
    if (gift.reward.includes("Điểm")) {
      setPlayScore(s => s + gift.val);
      SoundEffects.playKeng();
    } else if (gift.reward.includes("x2")) {
      setPlayScore(s => s * 2);
      SoundEffects.playKeng();
    } else {
      // Challenge Question
      setSelectedAns(null);
      SoundEffects.playTing();
    }
  };

  // Output self-contained local HTML5 code structure
  const handleExportHTML = () => {
    const currentBg = backgroundsCatalog.find(b => b.id === selectedBackgroundId);
    let bodyBackgroundStyle = 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)';
    if (selectedBackgroundId === 'custom_solid') {
      bodyBackgroundStyle = customBgColor;
    } else if (currentBg && currentBg.isCustom) {
      bodyBackgroundStyle = `url(${currentBg.value}) center/cover no-repeat fixed`;
    } else if (currentBg) {
      if (currentBg.id === 'slate') {
        bodyBackgroundStyle = '#090d16';
      } else if (currentBg.id === 'ocean') {
        bodyBackgroundStyle = 'linear-gradient(135deg, #0c1a30 0%, #172554 100%)';
      } else if (currentBg.id === 'forest') {
        bodyBackgroundStyle = 'linear-gradient(135deg, #062f1d 0%, #022c22 100%)';
      } else if (currentBg.id === 'sunset') {
        bodyBackgroundStyle = 'linear-gradient(135deg, #4c0519 0%, #1e293b 100%)';
      } else if (currentBg.id === 'space') {
        bodyBackgroundStyle = 'linear-gradient(135deg, #1e1b4b 0%, #030712 100%)';
      }
    }

    // Auto-detect color contrast:
    const isLightSolid = selectedBackgroundId === 'custom_solid' && (() => {
      const hex = customBgColor.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
      }
      return false;
    })();

    const finalQuestionColor = isLightSolid ? '#1e293b' : questionColor;
    const finalAnswerColor = isLightSolid ? '#0a0f1d' : answerColor;
    const finalCardBg = isLightSolid ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)';
    const finalCardBorder = isLightSolid ? 'border-slate-300' : 'border-indigo-500/30';
    const finalCardTextColor = isLightSolid ? 'text-slate-800' : 'text-white';

    const slices = wheelSlicesInput.split(',').map(s => s.trim()).filter(Boolean);

    const htmlCode = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${gameTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background: ${bodyBackgroundStyle};
      min-height: 100vh;
      width: 100vw;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
  </style>
</head>
<body class="flex flex-col bg-slate-950 p-4 min-h-screen w-screen overflow-x-hidden">

  <div id="game-box" class="w-full flex-1 flex flex-col justify-between rounded-[24px] border ${finalCardBorder} p-4 md:p-8 shadow-2xl backdrop-blur-md transition-all ${finalCardTextColor}" style="background: ${finalCardBg}">
    
    <!-- Header info -->
    <div class="flex justify-between items-center border-b border-slate-700/20 pb-4 mb-4">
      <div>
        <span class="bg-amber-500 text-slate-100 font-extrabold px-3 py-1 rounded-full text-[9px] uppercase shadow tracking-wider">
          ${gameType === 'lucky_wheel' ? '🎡 Vòng quay' : gameType === 'secret_grid' ? '🖼️ Ô cửa bí mật' : gameType === 'treasure_hunt' ? '⚓ Truy tìm kho báu' : gameType === 'balloon_pop' ? '🎈 Bắn bóng bay' : gameType === 'memory' ? '🧩 Ghép cặp thẻ' : gameType === 'magic_hat' ? '👒 Chiếc nón kỳ diệu' : '🎮 Trò chơi'} Học Tập
        </span>
        <h1 class="font-extrabold text-sm sm:text-base mt-1 opacity-95">${gameTitle}</h1>
      </div>
      <div class="text-right">
        <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          Điểm số: <span id="local-points">0</span> ⭐
        </span>
      </div>
    </div>

    <!-- Side-by-side Responsive Grid with 70% model and 30% questions -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch flex-1">
      
      <!-- Simulation/Game Panel - Left Side (70% space on wide screens) -->
      <div class="lg:col-span-7 space-y-4 flex flex-col justify-between">
        <div id="interactive-simulation-panel" class="w-full flex-1 flex items-center justify-center">
          <!-- Injected dynamically per gameType -->
        </div>

        <!-- Dynamic On-Screen Toast Element underneath the game -->
        <div id="toast-container" class="p-3 bg-slate-900/95 border-2 border-indigo-500/50 text-[#38bdf8] text-xs text-center font-black rounded-2xl hidden transition-all duration-300 shadow-xl shadow-indigo-500/10"></div>
      </div>

      <!-- Quiz Card Viewport - Right Side (30% space on wide screens) -->
      <div id="quiz-container" class="lg:col-span-3 space-y-4 lg:border-l border-slate-700/20 lg:pl-6 pt-4 lg:pt-0 flex flex-col justify-center">
        <div class="flex justify-between items-center text-slate-500 text-[10px]">
          <span class="font-bold uppercase tracking-wider" id="quiz-indicator">CÂU HỎI SỐ 1</span>
          <span class="bg-slate-700/10 px-2 py-0.5 rounded font-black">Thời gian: ${timeLimit} giây</span>
        </div>

        <p class="font-black text-sm md:text-base leading-relaxed text-center py-2" id="question-text" style="color: ${finalQuestionColor}"></p>

        <div class="grid grid-cols-1 gap-2" id="options-box">
          <!-- Option buttons go here -->
        </div>
      </div>

    </div>

    <!-- Bottom actions -->
    <div class="flex justify-end pt-3 border-t border-slate-700/10 mt-4">
      <button id="next-btn" class="hidden px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer">
        Tiếp Tục ➡️
      </button>
    </div>

  </div>

  <script>
    // Embedded game configuration data parameters
    const gameType = "${gameType}";
    const gameTitle = "${gameTitle}";
    const quizQuestions = ${JSON.stringify(quizQuestions)};
    const limitSecs = ${timeLimit};
    const wheelFlow = "${wheelFlow}";
    const wheelSlices = ${JSON.stringify(slices)};
    const secretGridSize = ${secretGridSize};
    const secretKeyword = "${secretCorrectAnswer}".trim().toUpperCase();
    const secretCoverImage = "${secretCoverImage}";
    const treasureIslands = ${JSON.stringify(treasureIslands)};
    const treasureChestIcon = "${treasureChestIcon}";
    const treasurePointIcon = "${treasurePointIcon}";
    const treasureStartIcon = "${treasureStartIcon}";
    const treasureShipIcon = "${treasureShipIcon}";
    const treasureTitle = "${treasureMapTitle}";
    const balloonCount = ${balloonCount};
    const memoryCardCount = ${memoryCardCount};
    const memoryPairs = ${JSON.stringify(memoryPairs)};
    const magicHatWord = "${magicHatKeyword}".trim().toUpperCase();

    // Active state dynamics variables
    let currentIdx = 0;
    let score = 0;
    let multiplier = 1;
    let selectedAns = null;
    let hasSpunThisTurn = false;
    let isSpinning = false;
    let wheelDeg = 0;

    // Secret grid variables
    let revealedDoors = Array(secretGridSize).fill(false);
    let didGuessSecret = false;
    let electedDoorIndex = null;

    // Treasure variables
    let treasureIndex = 0;

    // Balloon variables
    let balloons = Array.from({ length: balloonCount }).map((_, i) => ({
      id: i,
      color: ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'][i % 8],
      popped: false
    }));

    // Memory matching cards
    let memoryCards = [];
    let selectedMemoryIndices = [];

    // Magic Hat
    let revealedLetters = [];
    let magicHatTurns = 0;
    let fortuneSolved = false;

    // Millionaire states
    let fiftyFiftyUsedHTML = false;
    let audienceUsedHTML = false;
    let phoneUsedHTML = false;
    let hiddenOptionsHTML = [];
    let audienceStatsHTML = null;
    let phoneAdviceHTML = null;

    // Car Racing states
    let racingPosAHTML = 0;
    let racingPosBHTML = 0;
    let activeRacingTeamHTML = 'A';

    // Olympia states
    let olympiaRoundHTML = 'khoi_dong';
    let olympiaCorrectHTML = 0;

    function triggerToast(txt) {
      const container = document.getElementById('toast-container');
      if (container) {
        container.innerHTML = txt;
        container.classList.remove('hidden');
        if (window.toastTimeout) clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => {
          container.classList.add('hidden');
        }, 4500);
      } else {
        console.log(txt);
      }
    }

    function startRichFireworks() {
      const canvas = document.createElement('canvas');
      canvas.id = 'fireworks-canvas';
      canvas.className = 'fixed inset-0 pointer-events-none w-full h-full z-50';
      document.body.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      let animationId;
      
      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      class Particle {
        constructor(x, y, color) {
          this.x = x;
          this.y = y;
          this.color = color;
          this.angle = Math.random() * Math.PI * 2;
          this.speed = Math.random() * 9 + 4;
          this.gravity = 0.08;
          this.resistance = 0.96;
          this.vx = Math.cos(this.angle) * this.speed;
          this.vy = Math.sin(this.angle) * this.speed;
          this.alpha = 1;
          this.decay = Math.random() * 0.0035 + 0.0015; // stay active significantly longer
          this.size = Math.random() * 4 + 1.5;
        }
        draw() {
          ctx.save();
          ctx.globalAlpha = this.alpha;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = this.color;
          ctx.fill();
          ctx.restore();
        }
        update() {
          this.vx *= this.resistance;
          this.vy *= this.resistance;
          this.vy += this.gravity;
          this.x += this.vx;
          this.y += this.vy;
          this.alpha -= this.decay;
        }
      }

      class Firework {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = canvas.height;
          this.targetY = Math.random() * (canvas.height * 0.55) + canvas.height * 0.05;
          this.speed = Math.random() * 12 + 10;
          this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
          this.vx = Math.cos(this.angle) * this.speed * -1;
          this.vy = Math.sin(this.angle) * this.speed * -1;
          const colors = ['#FF2A6D', '#05D9E8', '#F5A623', '#7ED321', '#F8E71C', '#BD10E0', '#9013FE', '#00FF66', '#FF3366', '#00FFFF', '#FFCC00', '#EC4899', '#3B82F6', '#10B981'];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.exploded = false;
        }
        draw() {
          if (this.exploded) return;
          ctx.save();
          ctx.beginPath();
          ctx.arc(this.x, this.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 18;
          ctx.shadowColor = this.color;
          ctx.fill();
          ctx.restore();
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += 0.035;
          if (this.vy >= 0 || this.y <= this.targetY) {
            this.exploded = true;
            this.explode();
          }
        }
        explode() {
          const count = Math.floor(Math.random() * 100) + 160; // multi-particle dense sparks
          for (let i = 0; i < count; i++) {
            particlesPool.push(new Particle(this.x, this.y, this.color));
          }
        }
      }

      const fireworksPool = [];
      const particlesPool = [];

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.22) { // 2.5x more fireworks launches concurrently
          fireworksPool.push(new Firework());
        }

        for (let i = fireworksPool.length - 1; i >= 0; i--) {
          fireworksPool[i].update();
          fireworksPool[i].draw();
          if (fireworksPool[i].exploded) {
            fireworksPool.splice(i, 1);
          }
        }

        for (let i = particlesPool.length - 1; i >= 0; i--) {
          particlesPool[i].update();
          particlesPool[i].draw();
          if (particlesPool[i].alpha <= 0) {
            particlesPool.splice(i, 1);
          }
        }

        animationId = requestAnimationFrame(loop);
      }

      loop();

      setTimeout(() => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }, 45000); // 45 seconds persistent screen duration
    }

    function initInteractiveLayout() {
      const panel = document.getElementById('interactive-simulation-panel');
      panel.innerHTML = '';

      if (gameType === 'lucky_wheel') {
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-amber-500 block tracking-wider uppercase">\${gameTitle}</span>
            
            <div class="relative w-80 h-80 mx-auto my-2 shrink-0">
              <div id="wheel-spinning-circle" class="w-full h-full rounded-full border-4 border-white/80 relative flex items-center justify-center transition-all duration-[2500ms] overflow-hidden shadow-2xl"
                   style="background: conic-gradient(from 0deg, \${wheelSlices.map((_, idx) => {
                     const colorsList = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#6366F1', '#D946EF'];
                     const color = colorsList[idx % colorsList.length];
                     const from = idx * (360 / wheelSlices.length);
                     const to = (idx + 1) * (360 / wheelSlices.length);
                     return \`\${color} \${from}deg \${to}deg\`;
                   }).join(', ')});">
                
                <div class="absolute w-20 h-20 bg-slate-900 rounded-full border-4 border-white flex flex-col items-center justify-center text-white text-[11px] z-10 font-black shadow-xl">
                  <span>XOAY</span>
                  <span class="text-sky-400 text-sm" id="wheel-center-multiplier">\${multiplier}x</span>
                </div>

                \${wheelSlices.map((slice, i) => {
                  const deg = i * (360 / wheelSlices.length) + (180 / wheelSlices.length);
                  return \`
                    <div class="absolute text-white font-black text-[11px] text-center select-none tracking-tight leading-tight"
                         style="transform: rotate(\${deg}deg) translateY(-105px); width: 72px;">
                      \${slice}
                    </div>
                  \`;
                }).join('')}
              </div>
              <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-yellow-400 z-20 filter drop-shadow"></div>
            </div>

            <div class="text-xs font-bold text-slate-400 text-center py-1" id="wheel-status-text">
              \${wheelFlow === 'spin_first' ? '👉 Vui lòng QUAY VÒNG QUAY trước để lấy hệ số thưởng!' : '👉 Trả lời đúng hệ thống sẽ cấp lượt quay!'}
            </div>

            <button id="spin-wheel-btn" class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow cursor-pointer uppercase tracking-wider" \${isSpinning || hasSpunThisTurn || (wheelFlow === 'answer_first' && selectedAns === null) ? 'disabled style="opacity: 0.35; cursor: not-allowed"' : ''}>
              Quay Ngay 🎡
            </button>
          </div>
        \`;

        document.getElementById('spin-wheel-btn').onclick = () => {
          if (isSpinning || hasSpunThisTurn) return;
          if (wheelFlow === 'answer_first' && selectedAns === null) {
            triggerToast("Hãy trả lời câu đố trước!");
            return;
          }
          isSpinning = true;
          const extraDeg = 720 + Math.floor(Math.random() * 360);
          wheelDeg += extraDeg;
          
          const wheel = document.getElementById('wheel-spinning-circle');
          wheel.style.transform = \`rotate(\${wheelDeg}deg)\`;

          setTimeout(() => {
            isSpinning = false;
            hasSpunThisTurn = true;
            const mults = [1, 2, 3, 5, 10];
            multiplier = mults[Math.floor(Math.random() * mults.length)];
            document.getElementById('wheel-center-multiplier').innerText = multiplier + "x";
            if (multiplier > 2) {
              document.getElementById('wheel-status-text').className = "text-[#10b981] text-xs font-black animate-bounce";
              document.getElementById('wheel-status-text').innerText = "🎉 Cực đỉnh! Nhận hệ số nhân điểm x" + multiplier + "!";
            } else {
              document.getElementById('wheel-status-text').className = "text-slate-400 text-xs font-bold";
              document.getElementById('wheel-status-text').innerText = "👉 Hệ số nhân điểm x" + multiplier + " đã được áp dụng.";
            }
            document.getElementById('spin-wheel-btn').disabled = true;
            document.getElementById('spin-wheel-btn').style.opacity = "0.35";
            document.getElementById('spin-wheel-btn').style.cursor = "not-allowed";
          }, 2600);
        };
      }

      else if (gameType === 'secret_grid') {
        const cols = Math.ceil(Math.sqrt(secretGridSize));
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <div class="flex justify-between items-center text-[10px] font-bold text-teal-400">
              <span class="font-black text-xs uppercase">🖼️ TRUY TÌM Ô CỬA BÍ MẬT</span>
              <span class="bg-indigo-900/30 px-2.5 py-1 rounded-full text-indigo-300 font-extrabold text-[9px]">Cần lật 25% làm cơ sở</span>
            </div>

            <div class="relative w-80 h-80 mx-auto overflow-hidden rounded-2xl border-4 border-slate-700 bg-cover bg-center shadow-2xl justify-center shrink-0" 
                 style="background-image: url('\${secretCoverImage}');">
              <div id="doors-container" class="absolute inset-0 grid gap-0.5 p-0.5 bg-slate-950/25 backdrop-blur-[0.5px]" style="grid-template-columns: repeat(\${cols}, minmax(0, 1fr));">
                \${Array.from({ length: secretGridSize }).map((_, i) => {
                  const opened = revealedDoors[i];
                  const active = (i === electedDoorIndex);
                  return \`
                    <button id="door-btn-\${i}" class="rounded text-lg font-black border border-white/10 flex items-center justify-center transition-all \${opened ? 'opacity-0 pointer-events-none' : active ? 'bg-amber-500 border-white text-white scale-95 shadow-lg animate-pulse' : 'bg-slate-900/95 border-slate-850 hover:bg-slate-800 text-slate-200'}" onclick="handleDoorLat(\${i})">
                      \${opened ? '' : i + 1}
                    </button>
                  \`;
                }).join('')}
              </div>
            </div>

            <div id="secret-guess-form-container" class="space-y-2">
              <div class="flex gap-1.5 justify-center max-w-sm mx-auto">
                <input type="text" id="secret-word-input" class="bg-slate-950/80 border border-slate-700 px-3 py-1.5 flex-1 text-xs rounded-xl focus:ring-1 focus:ring-indigo-500 text-white font-bold" placeholder="Đoán từ khoá ẩn sau ảnh...">
                <button onclick="submitSecretGuess()" class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer">ĐOÁN 🎯</button>
                <button onclick="revealSecretAnswerHTML()" class="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white font-black text-xs rounded-xl shadow cursor-pointer" id="secret-ans-reveal-html" disabled>Đáp án 🔑</button>
              </div>
              <div id="secret-answering-box" class="hidden p-2 bg-cyan-950/60 border border-cyan-500 text-cyan-300 font-black rounded-xl text-xs text-center uppercase tracking-wide">
                🔑 Đáp án chuẩn: \${secretKeyword}
              </div>
              <p id="secret-lock-helper" class="text-[9px] text-orange-400 font-bold italic">🔒 Mở tối thiểu 25% số ô để đoán từ khóa!</p>
            </div>
          </div>
        \`;
        updateSecretLockHelper();
      }

      else if (gameType === 'treasure_hunt') {
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-cyan-400 block tracking-widest uppercase">\${treasureTitle}</span>
            <div class="flex items-center justify-around bg-slate-950/90 py-5 px-3 rounded-2xl text-xs gap-3.5 relative overflow-hidden flex-1 min-h-[140px] border border-slate-800">
              \${treasureIslands.map((island, idx) => {
                const active = idx === treasureIndex;
                const isStart = idx === 0;
                const isChest = idx === treasureIslands.length - 1;
                const icon = active ? "🚢" : (isStart ? treasureStartIcon : (isChest ? treasureChestIcon : treasurePointIcon));
                return \`
                  \${idx > 0 ? '<span class="text-slate-750 font-black text-sm">➡️</span>' : ''}
                  <div class="flex flex-col items-center gap-1.5">
                    <span class="text-4xl transition-all duration-300 \${active ? 'text-5xl animate-bounce filter drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] scale-110' : 'opacity-30'}">\${icon}</span>
                    <span class="text-[10px] font-black \${active ? 'text-sky-400 underline decoration-sky-550' : 'text-slate-500'}">\${island}</span>
                  </div>
                \`;
              }).join('')}
            </div>
            <p class="text-[10px] text-slate-400 font-bold">Hãy mở tiếp câu đố và trả lời chính xác để Thuyền của bạn cập bến đảo rực lửa tiếp theo!</p>
          </div>
        \`;
      }

      else if (gameType === 'balloon_pop') {
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-rose-400 uppercase font-black block">🎈 BẮN BÓNG BAY TĂNG ĐIỂM SỐ</span>
            <div class="flex flex-wrap justify-center gap-3.5 py-4 flex-1 items-center">
              \${balloons.map((b, i) => {
                return \`
                  <button id="balloon-btn-\${i}" class="w-16 h-20 flex flex-col items-center justify-center rounded-b-full transition-all duration-300 relative cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
                          style="background-color: \${b.popped ? '#131924' : b.color}; border: \${b.popped ? '2px dotted #374151' : '2px solid rgba(255,255,255,0.2)'}" onclick="popBalloonElement(\${i})">
                    <span class="text-4xl select-none \${b.popped ? 'hidden' : 'animate-bounce'}">🎈</span>
                    \${b.popped ? '<span class="text-slate-600 text-xs font-bold">💥 Bùm</span>' : ''}
                  </button>
                \`;
              }).join('')}
            </div>
            <p class="text-[10px] text-slate-400 font-bold">Mỗi quả bóng bay khi lật nổ sẽ giúp tăng thêm cơ số điểm và niềm vui học tập!</p>
          </div>
        \`;
      }

      else if (gameType === 'memory') {
        if (memoryCards.length === 0) {
          const pairsCount = memoryCardCount / 2;
          let pool = [];
          if (memoryPairs && memoryPairs.length > 0) {
            memoryPairs.forEach((p, idx) => {
              pool.push({ text: p.question, matchId: idx });
              pool.push({ text: p.answer, matchId: idx });
            });
          }
          while(pool.length < memoryCardCount) {
            const id = Math.random();
            pool.push({ text: "Cặp Thẻ A", matchId: id });
            pool.push({ text: "Cặp Thẻ B", matchId: id });
          }
          memoryCards = pool.slice(0, memoryCardCount).map((item, idx) => ({
            id: idx,
            text: item.text,
            matchId: item.matchId,
            flipped: false,
            matched: false
          })).sort(() => Math.random() - 0.5);
        }

        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-emerald-400 font-extrabold uppercase tracking-wider block">🧩 GHÉP CẶP ĐỐI ỨNG TRÍ TUỆ</span>
            <div class="grid grid-cols-4 gap-2.5 pt-2 flex-1 items-center">
              \${memoryCards.map((c, i) => {
                const matched = c.matched;
                const flipped = c.flipped;
                const visual = (flipped || matched) ? c.text : "🧩";
                let style = 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600';
                if (matched) style = 'bg-emerald-950/20 border-emerald-500 text-emerald-300 opacity-40 scale-95';
                else if (flipped) style = 'bg-slate-800 border-orange-500 text-white rotate-2 shadow-lg';
                return \`
                  <button id="mem-card-\${i}" class="aspect-[4/3] min-h-[72px] border rounded-xl p-2 text-[10px] font-extrabold line-clamp-3 leading-snug transition-all duration-300 cursor-pointer \${style}" onclick="clickMemoryCard(\${i})">
                    \${visual}
                  </button>
                \`;
              }).join('')}
            </div>
            <p class="text-[9.5px] text-slate-400 font-bold">👉 Hãy click lật tìm 2 thẻ chứa nội dung chính xác / định nghĩa giống hệt nhau!</p>
          </div>
        \`;
      }

      else if (gameType === 'magic_hat') {
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <div class="flex justify-between items-center text-[10px] font-bold">
              <span class="text-yellow-400 animate-pulse text-xs font-black uppercase">👒 CHIẾC NÓN DIỆU KỲ ĐOÁN TỪ</span>
              <span class="bg-indigo-950 border border-indigo-800 px-3 py-1 rounded-full text-indigo-300 font-extrabold">Lượt lật chữ: <span class="text-emerald-400" id="magic-hat-turns">\${magicHatTurns}</span> Lượt</span>
            </div>

            <div class="flex gap-1.5 justify-center py-3 flex-wrap">
              \${magicHatWord.split('').map((letter, i) => {
                const isRev = revealedLetters.includes(letter) || letter === ' ';
                return \`
                  <div class="w-9 h-11 bg-white text-slate-950 flex items-center justify-center font-black rounded-lg text-lg border border-slate-350 shadow-md">
                    \${isRev ? letter : "_"}
                  </div>
                \`;
              }).join('')}
            </div>

            \${fortuneSolved ? \`
              <div class="p-3.5 bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-black rounded-xl text-xs uppercase shadow text-center">
                🎉 Tuyệt tác! Khóa chữ đã được giải mã thành công!
              </div>
            \` : \`
              <div class="space-y-3.5">
                <div class="flex flex-col text-left bg-slate-950/60 p-2.5 border border-slate-850 rounded-xl gap-1.5">
                  <span class="text-[9.5px] text-[#A78BFA] font-black">🎯 ĐOÁN NHANH TOÀN BỘ TỪ KHÓA:</span>
                  <div class="flex gap-1.5">
                    <input type="text" id="magic-word-guess" class="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl text-[10px] px-3 py-1 font-bold" placeholder="Nhập toàn bộ từ đoán...">
                    <button onclick="submitMagicKeywordSolve()" class="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black rounded-xl text-[10px] shadow cursor-pointer">ĐOÁN 🔑</button>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <span class="text-[9px] block text-slate-400 font-bold" id="magic-turns-desc">🔒 Hãy trả lời câu hỏi dưới để mở khóa bàn phím chữ cái!</span>
                  <div class="flex flex-wrap gap-1 justify-center max-w-sm mx-auto">
                    \${'A B C D E G H I K L M N O P Q R S T U V X Y'.split(' ').map(char => {
                      const revealed = revealedLetters.includes(char);
                      return \`
                        <button id="magic-char-btn-\${char}" class="w-6 h-6 bg-indigo-900 border border-indigo-750 hover:bg-indigo-800 text-white rounded flex items-center justify-center font-black text-[10px] cursor-pointer" onclick="guessMagicLetter('\${char}')" \${magicHatTurns === 0 || revealed ? 'disabled style="opacity:0.3; cursor: not-allowed"' : ''}>
                          \${char}
                        </button>
                      \`;
                    }).join('')}
                  </div>
                </div>
              </div>
            \`}
          </div>
        \`;
        updateMagicTurnsDesc();
      }

      else if (gameType === 'millionaire') {
        const milestones = [
          "150.000.000 ⭐👑", "85.000.000 ⭐", "50.000.000 ⭐", "30.000.000 ⭐", "22.000.000 ⭐",
          "14.000.000 ⭐", "10.000.000 ⭐", "6.000.000 ⭐", "3.000.000 ⭐", "2.000.000 ⭐",
          "1.000.000 ⭐", "600.000 ⭐", "400.000 ⭐", "300.000 ⭐", "200.000 ⭐"
        ];
        
        let statsHTML = '';
        if (audienceStatsHTML) {
          statsHTML = \`
            <div class="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5 text-left text-[11px] animate-fade-in my-2">
              <span class="font-extrabold text-sky-400 block pb-1 border-b border-sky-950">🗣️ BIỂU ĐỒ Ý KIẾN KHÁN GIẢ:</span>
              \${Object.entries(audienceStatsHTML).map(([idx, pct]) => \`
                <div class="flex items-center gap-2">
                  <span class="w-8 font-extrabold text-slate-300">A-D\${['A','B','C','D'][Number(idx)]}:</span>
                  <div class="flex-1 bg-slate-850 h-3 rounded overflow-hidden">
                    <div style="width: \${pct}%" class="bg-sky-500 h-full"></div>
                  </div>
                  <span class="w-8 font-black text-emerald-400 text-right">\text{\${pct}%}</span>
                </div>
              \`).join('')}
            </div>
          \`;
        }
        
        let phoneHTML = '';
        if (phoneAdviceHTML) {
          phoneHTML = \`
            <div class="p-3 bg-slate-900 border border-slate-700 text-amber-300 font-extrabold rounded-xl text-xs text-left animate-fade-in my-2">
              📞 KHUYÊN TỪ CỐ VẤN: <span class="text-white font-semibold">\${phoneAdviceHTML}</span>
            </div>
          \`;
        }

        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-blue-400 uppercase tracking-widest block">🏆 AI LÀ TRIỆU PHÚ TRÍ TUỆ</span>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-1">
              
              <!-- Left side: Milestones Ladder -->
              <div class="bg-slate-950 p-3 rounded-2xl border border-blue-900/50 space-y-1 text-left">
                <span class="font-extrabold text-[9px] text-[#A78BFA] block mb-2 tracking-wider uppercase">THANG ĐIỂM TRIỆU PHÚ</span>
                <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                  \${milestones.map((m, idx) => {
                    const level = 15 - idx;
                    const isPassed = level <= currentIdx;
                    const isActive = level === currentIdx + 1;
                    const style = isActive 
                      ? 'bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow scale-105' 
                      : (isPassed ? 'text-emerald-400 font-extrabold' : 'text-slate-500');
                    return \`
                      <div class="flex justify-between items-center \${style}">
                        <span>Câu \${level}:</span>
                        <span>\${m}</span>
                      </div>
                    \`;
                  }).join('')}
                </div>
              </div>

              <!-- Right side: Lifelines and actions -->
              <div class="space-y-3">
                <span class="font-extrabold text-[10px] text-slate-400 block tracking-wider uppercase">QUYỀN TRỢ GIÚP TRIỆU PHÚ</span>
                <div class="grid grid-cols-3 gap-2">
                  <button id="lifeline-fifty-btn" class="py-2.5 bg-slate-800 border \${fiftyFiftyUsedHTML ? 'opacity-30 border-slate-800 cursor-not-allowed' : 'border-orange-500 hover:border-orange-400 hover:bg-slate-750 text-orange-200'} rounded-xl font-bold text-[11px] cursor-pointer" \${fiftyFiftyUsedHTML ? 'disabled' : ''}>
                    50:50 ⚖️
                  </button>
                  <button id="lifeline-audience-btn" class="py-2.5 bg-slate-800 border \${audienceUsedHTML ? 'opacity-30 border-slate-800 cursor-not-allowed' : 'border-orange-500 hover:border-orange-400 hover:bg-slate-750 text-orange-200'} rounded-xl font-bold text-[11px] cursor-pointer" \${audienceUsedHTML ? 'disabled' : ''}>
                    Hỏi Lớp 🗣️
                  </button>
                  <button id="lifeline-phone-btn" class="py-2.5 bg-slate-800 border \${phoneUsedHTML ? 'opacity-30 border-slate-800 cursor-not-allowed' : 'border-orange-500 hover:border-orange-400 hover:bg-slate-750 text-orange-200'} rounded-xl font-bold text-[11px] cursor-pointer" \${phoneUsedHTML ? 'disabled' : ''}>
                    Cố Vấn 📞
                  </button>
                </div>
                
                \${statsHTML}
                \${phoneHTML}
              </div>

            </div>

            <p class="text-[10px] text-slate-400 font-bold">Hãy nhấp đáp án đúng bên phải để tích lũy tiền thưởng cực đỉnh!</p>
          </div>
        \`;

        // Bind click events
        document.getElementById('lifeline-fifty-btn').onclick = () => {
          if (fiftyFiftyUsedHTML || selectedAns !== null) return;
          fiftyFiftyUsedHTML = true;
          const q = quizQuestions[currentIdx];
          const wr = [];
          q.options.forEach((_, idx) => { if (idx !== q.correctAnswer) wr.push(idx); });
          hiddenOptionsHTML = wr.sort(() => Math.random() - 0.5).slice(0, 2);
          
          const box = document.getElementById('options-box');
          if (box) {
            hiddenOptionsHTML.forEach(idx => {
              const btn = box.children[idx];
              if (btn) {
                btn.style.opacity = '0.15';
                btn.style.pointerEvents = 'none';
              }
            });
          }
          initInteractiveLayout();
        };

        document.getElementById('lifeline-audience-btn').onclick = () => {
          if (audienceUsedHTML || selectedAns !== null) return;
          audienceUsedHTML = true;
          const correct = quizQuestions[currentIdx].correctAnswer;
          const stats = { 0: 5, 1: 5, 2: 5, 3: 5 };
          stats[correct] = 70;
          let remaining = 15;
          [0, 1, 2, 3].forEach(idx => {
            if (idx !== correct) {
              const gain = Math.floor(Math.random() * remaining);
              stats[idx] += gain;
              remaining -= gain;
            }
          });
          audienceStatsHTML = stats;
          initInteractiveLayout();
        };

        document.getElementById('lifeline-phone-btn').onclick = () => {
          if (phoneUsedHTML || selectedAns !== null) return;
          phoneUsedHTML = true;
          const correctLetter = ['A', 'B', 'C', 'D'][quizQuestions[currentIdx].correctAnswer];
          phoneAdviceHTML = \`MÌNH CỰC KỲ TIN TƯỞNG đáp án đúng ở câu hỏi này là \${correctLetter}. Hãy chốt ngay đi bạn!\`;
          initInteractiveLayout();
        };
      }

      else if (gameType === 'car_racing') {
        const pA = racingPosAHTML || 0;
        const pB = racingPosBHTML || 0;
        const activeTeam = activeRacingTeamHTML || 'A';
        
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-rose-400 tracking-widest block uppercase">🏎️ ĐƯỜNG ĐUA TRÍ TUỆ ĐỐI KHÁNG</span>
            
            <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 flex-1 flex flex-col justify-center">
              
              <!-- Track Segment Red Team A -->
              <div class="space-y-1.5 relative text-left">
                <div class="flex justify-between items-center text-[10px] font-bold text-rose-400">
                  <span>🚗 Đội Đỏ (A)</span>
                  <span class="bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded">\${pA}% Về Đích</span>
                </div>
                <div class="relative w-full bg-slate-900 h-10 rounded-xl border border-slate-850 overflow-hidden flex items-center px-2">
                  <!-- Dashed lane separator -->
                  <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-800"></div>
                  <!-- Running car Red emoji -->
                  <div class="absolute transition-all duration-[1000ms] ease-out text-2xl" style="left: calc(\${(pA/100) * 85}% + 10px);">
                    🏎️🔴
                  </div>
                  <!-- Finish flag indicator -->
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">🏁</div>
                </div>
              </div>

              <!-- Track Segment Blue Team B -->
              <div class="space-y-1.5 relative text-left">
                <div class="flex justify-between items-center text-[10px] font-bold text-sky-400">
                  <span>🚙 Đội Xanh (B)</span>
                  <span class="bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded">\${pB}% Về Đích</span>
                </div>
                <div class="relative w-full bg-slate-900 h-10 rounded-xl border border-slate-850 overflow-hidden flex items-center px-2">
                  <!-- Dashed lane separator -->
                  <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-800"></div>
                  <!-- Running car Blue emoji -->
                  <div class="absolute transition-all duration-[1000ms] ease-out text-2xl" style="left: calc(\dots{(pB/100) * 85}% + 10px);">
                    🏎️🔵
                  </div>
                  <!-- Finish flag indicator -->
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">🏁</div>
                </div>
              </div>

            </div>

            <div class="py-2.5 px-6 \${activeTeam === 'A' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-sky-500/10 border-sky-500/20 text-sky-300'} border rounded-xl font-black text-xs text-center">
              LƯỢT TRẢ LỜI: <span class="uppercase underline">\${activeTeam === 'A' ? '🎯 Đội Đỏ A' : '🎯 Đội Xanh B'}</span>
            </div>

            <p class="text-[9.5px] text-slate-500 leading-relaxed font-bold">👉 Trả lời chuẩn xác giúp Xe đua tăng tốc thêm +25%! Trục quay hoán đổi đội thông minh sau mỗi câu hỏi.</p>
          </div>
        \`;
      }

      else if (gameType === 'olympia') {
        const round = olympiaRoundHTML || 'khoi_dong';
        const roundNames = {
          'khoi_dong': '1. Khởi động 🚀',
          'chong_ngai_vat': '2. Vượt CNV 🌀',
          'tang_toc': '3. Tăng tốc ⏳',
          've_dich': '4. Về đích 🏁'
        };
        
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-green-400 tracking-widest block uppercase">⛰️ ĐƯỜNG LÊN ĐỈNH OLYMPIA</span>
            
            <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 flex-1 flex flex-col justify-center">
              <div class="flex flex-wrap justify-between gap-1 text-[10px] font-bold pb-2 border-b border-slate-800">
                \${Object.entries(roundNames).map(([key, name]) => {
                  const isActive = (key === round);
                  return \`
                    <span class="\${isActive ? 'text-yellow-400 scale-105 font-black' : 'text-slate-500 font-semibold'}">\${name}</span>
                  \`;
                }).join('')}
              </div>

              <!-- Progress Climber Map -->
              <div class="relative w-full bg-slate-900 h-28 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2">
                <span class="text-3xl animate-bounce">🧗</span>
                <p class="text-slate-400 text-[10px] font-bold mt-2">Vị trí nhà leo núi: <span class="text-emerald-400 font-extrabold">\${olympiaCorrectHTML * 10}m</span> độ cao</p>
                <div class="w-full bg-slate-850 h-2.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                  <div class="bg-emerald-500 h-full transition-all duration-500" style="width: \dots{Math.min(100, olympiaCorrectHTML * 12.5)}%"></div>
                </div>
              </div>
            </div>

            <!-- Control Box Actions inside html export -->
            <div class="flex gap-2 items-center justify-center">
              <button id="olympia-next-round-btn" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10.5px] rounded-xl shadow cursor-pointer uppercase tracking-wider">
                Lên Vòng Tiếp 🚀
              </button>
            </div>
            
            <p class="text-[9px] text-slate-500 font-semibold">Tích lũy điểm số bằng cách chinh phục các vòng xuất sắc nhất!</p>
          </div>
        \`;

        document.getElementById('olympia-next-round-btn').onclick = () => {
          const rounds = ['khoi_dong', 'chong_ngai_vat', 'tang_toc', 've_dich'];
          const currentRoundIdx = rounds.indexOf(round);
          const nextIdx = (currentRoundIdx + 1) % rounds.length;
          olympiaRoundHTML = rounds[nextIdx];
          initInteractiveLayout();
        };
      }

      else if (gameType === 'lucky_gift') {
        if (!window.giftBoxesHTML) {
          window.giftBoxesHTML = [
            { id: 1, opened: false, reward: '🎁 Hộp 1' },
            { id: 2, opened: false, reward: '🎁 Hộp 2' },
            { id: 3, opened: false, reward: '🎁 Hộp 3' },
            { id: 4, opened: false, reward: '🎁 Hộp 4' }
          ];
        }
        
        panel.innerHTML = \`
          <div class="bg-slate-900/40 p-5 rounded-3xl border border-slate-700/20 text-center space-y-4 w-full flex flex-col justify-between flex-1">
            <span class="text-xs font-black text-amber-500 tracking-widest block uppercase">🎁 HỘP QUÀ SINH HOẠT MAY MẮN</span>
            
            <div class="grid grid-cols-2 gap-3 justify-center max-w-sm mx-auto flex-1 items-center">
              \${window.giftBoxesHTML.map((g, idx) => \`
                <button id="gift-box-btn-\${idx}" class="py-6 px-10 bg-gradient-to-b \${g.opened ? 'from-slate-800 to-slate-900 text-amber-400 text-xs' : 'from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-500'} rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 duration-100" \${g.opened ? 'disabled' : ''}>
                  <span class="text-3xl">\${g.opened ? '🎉' : '🎁'}</span>
                  <span class="text-[10px] font-black">\${g.opened ? g.reward : \`Hộp số \${g.id}\`}</span>
                </button>
              \`).join('')}
            </div>

            <p class="text-[9px] text-slate-500 font-semibold">Nhấn ô quà để mở nhận các điểm số / báu vật / tràng cười bất ngờ!</p>
          </div>
        \`;

        window.giftBoxesHTML.forEach((g, idx) => {
          const btn = document.getElementById(\`gift-box-btn-\${idx}\`);
          if (btn) {
            btn.onclick = () => {
              if (window.giftBoxesHTML[idx].opened) return;
              const rewards = ['+50 Điểm ⭐', 'X2 Điểm 🌟', '+100 Điểm 💥', 'Lượt quay 🎡'];
              window.giftBoxesHTML[idx].opened = true;
              window.giftBoxesHTML[idx].reward = rewards[idx % rewards.length];
              
              if (idx === 0 || idx === 2) {
                score += (idx === 0 ? 50 : 100);
              }
              document.getElementById('local-points').innerText = score;
              initInteractiveLayout();
            };
          }
        });
      }
    }

    // Door handlers
    window.handleDoorLat = function(i) {
      if (revealedDoors[i]) return;
      electedDoorIndex = i;
      currentIdx = i % quizQuestions.length;
      initInteractiveLayout();
      renderQuestion();
    }

    function updateSecretLockHelper() {
      const lockHelper = document.getElementById('secret-lock-helper');
      const input = document.getElementById('secret-word-input');
      const revealBtn = document.getElementById('secret-ans-reveal-html');
      if (!lockHelper) return;

      const totalOpened = revealedDoors.filter(Boolean).length;
      const required = Math.ceil(secretGridSize * 0.25);

      if (totalOpened >= required) {
        lockHelper.className = "text-[8.5px] text-emerald-400 font-bold italic";
        lockHelper.innerText = "⭐ Bạn đã mở đủ 25%. Bạn được phép đoán nội dung ảnh nền!";
        input.disabled = false;
        if (revealBtn) revealBtn.disabled = false;
      } else {
        lockHelper.className = "text-[8.5px] text-orange-400 font-bold italic";
        lockHelper.innerText = "🔒 Mở lật ít nhất " + required + " ô (" + totalOpened + " đã lật) để mở khoá đoán!";
        input.disabled = true;
        if (revealBtn) revealBtn.disabled = true;
      }
    }

    window.submitSecretGuess = function() {
      const val = document.getElementById('secret-word-input').value.trim().toUpperCase();
      if (val === secretKeyword) {
        didGuessSecret = true;
        score += 50;
        document.getElementById('local-points').innerText = score;
        triggerToast("🎉 Chính xác! Bạn đã đoán đúng ảnh tranh nền ẩn! Nhận ngay +50 Điểm!");
        initInteractiveLayout();
      } else {
        triggerToast("❌ Chưa đúng! Hãy suy luận thêm từ các ô còn lại!");
      }
    }

    window.revealSecretAnswerHTML = function() {
      const box = document.getElementById('secret-answering-box');
      if (box) {
        if (box.classList.contains('hidden')) {
          box.classList.remove('hidden');
        } else {
          box.classList.add('hidden');
        }
      }
    }

    // Balloon pop
    window.popBalloonElement = function(i) {
      balloons[i].popped = true;
      initInteractiveLayout();
    }

    // Memory cards click solver
    window.clickMemoryCard = function(idx) {
      if (selectedMemoryIndices.length >= 2 || memoryCards[idx].flipped || memoryCards[idx].matched) return;
      
      memoryCards[idx].flipped = true;
      selectedMemoryIndices.push(idx);
      initInteractiveLayout();

      if (selectedMemoryIndices.length === 2) {
        const [first, second] = selectedMemoryIndices;
        if (memoryCards[first].matchId === memoryCards[second].matchId) {
          setTimeout(() => {
            memoryCards[first].matched = true;
            memoryCards[second].matched = true;
            score += 20;
            document.getElementById('local-points').innerText = score;
            selectedMemoryIndices = [];
            initInteractiveLayout();
          }, 800);
        } else {
          setTimeout(() => {
            memoryCards[first].flipped = false;
            memoryCards[second].flipped = false;
            selectedMemoryIndices = [];
            initInteractiveLayout();
          }, 1100);
        }
      }
    }

    // Magic fortune
    window.guessMagicLetter = function(char) {
      if (magicHatTurns <= 0) return;
      magicHatTurns--;
      if (magicHatWord.includes(char)) {
        if (!revealedLetters.includes(char)) {
          revealedLetters.push(char);
          score += 15;
          document.getElementById('local-points').innerText = score;
        }
      }
      // check win
      const won = magicHatWord.split('').every(c => revealedLetters.includes(c) || c === ' ');
      if (won) {
        fortuneSolved = true;
      }
      initInteractiveLayout();
    }

    window.submitMagicKeywordSolve = function() {
      const val = document.getElementById('magic-word-guess').value.trim().toUpperCase();
      if (val === magicHatWord) {
        fortuneSolved = true;
        score += 100;
        document.getElementById('local-points').innerText = score;
        revealedLetters = magicHatWord.split('');
        triggerToast("🎉 Tuyệt đỉnh! Bạn đã đoán trúng từ khoá Chiếc nón kỳ diệu! (+100 Điểm)");
        initInteractiveLayout();
      } else {
        triggerToast("❌ Chưa đúng từ khoá kỳ diệu! Hãy cân nhắc giải mã thêm các từ đơn lẻ!");
      }
    }

    function updateMagicTurnsDesc() {
      const desc = document.getElementById('magic-turns-desc');
      if (!desc) return;
      if (magicHatTurns > 0) {
        desc.innerText = "🌟 Bạn đang tích lũy " + magicHatTurns + " lượt. Nhấp bảng chữ bên dưới để lật mở!";
        desc.className = "text-[8.5px] block text-emerald-400 font-bold";
      } else {
        desc.innerText = "🔒 Chữ cái bị khóa. Hãy trả lời đúng câu hỏi trắc nghiệm bên dưới để nhận thêm lượt!";
        desc.className = "text-[8.5px] block text-orange-400 font-bold";
      }
    }

    function renderQuestion() {
      if (currentIdx >= quizQuestions.length) {
        setTimeout(() => {
          try {
            startRichFireworks();
          } catch(e) { console.error(e); }
        }, 200);
        document.getElementById('game-box').innerHTML = \`
          <div class="text-center py-12 space-y-4">
            <span class="text-5xl block">🏆👑🎉</span>
            <h1 class="text-2xl font-black text-amber-500 uppercase tracking-widest">Trò Chơi Hoàn Tất</h1>
            <p class="text-lg font-bold opacity-80">Tuyệt vời! Bạn đã kết thúc toàn bộ chặng thử thách học tập.</p>
            <div class="inline-block px-8 py-3 bg-emerald-500 text-slate-950 font-black text-2xl rounded-2xl shadow-lg border-b-4 border-emerald-700">
              Tổng điểm: \${score} Điểm ⭐
            </div>
            <div class="pt-4">
              <button onclick="window.location.reload()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer">
                Chơi lại lượt mới 🔄
              </button>
            </div>
          </div>
        \`;
        return;
      }
      
      selectedAns = null;
      hasSpunThisTurn = false;
      document.getElementById('next-btn').classList.add('hidden');

      if (gameType === 'secret_grid' && electedDoorIndex === null) {
        document.getElementById('quiz-indicator').innerText = "CHƯA CHỌN Ô CỬA BIỆT";
        document.getElementById('question-text').innerHTML = \`
          <div class="p-5 text-center text-slate-400 font-extrabold text-xs bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/30">
            🔒 Vui lòng nhấp chọn lật 1 ô cửa chưa mở ở bên trái để hiển thị thử thách học hỏi!
          </div>
        \`;
        document.getElementById('options-box').innerHTML = '';
        return;
      }
      
      const q = quizQuestions[currentIdx];
      if (!q) return;
      document.getElementById('quiz-indicator').innerText = "CÂU HỎI SỐ " + (currentIdx + 1) + " / " + quizQuestions.length;
      document.getElementById('question-text').innerText = q.question;
      
      const box = document.getElementById('options-box');
      box.innerHTML = '';
      
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-3.5 rounded-2xl border bg-slate-850/50 border-slate-700 text-xs font-bold transition-all flex items-center gap-3 cursor-pointer hover:bg-slate-800 hover:border-slate-500";
        btn.innerHTML = \`<span class="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700/40 text-slate-300 font-black">\${['A','B','C','D'][idx]}</span> <span>\${opt}</span>\`;
        
        btn.onclick = () => {
          if (selectedAns !== null) return;
          
          if (gameType === 'lucky_wheel' && wheelFlow === 'spin_first' && !hasSpunThisTurn) {
            triggerToast("⚠️ Vui lòng SPIN quay bánh răng nhận nhân hệ số trước!");
            return;
          }

          selectedAns = idx;
          
          // Disable options
          const children = box.children;
          for(let c of children) {
            c.disabled = true;
            c.style.opacity = "0.45";
          }
          
          if (idx === q.correctAnswer) {
            btn.className = "w-full text-left p-3.5 rounded-2xl border bg-emerald-950/40 border-emerald-500 text-xs font-black flex items-center gap-3 transition-all";
            btn.style.opacity = "1";
            
            // Increment logic per game type
            const earned = 10 * multiplier;
            score += earned;
            
            if (gameType === 'treasure_hunt') {
              treasureIndex = Math.min(treasureIslands.length - 1, treasureIndex + 1);
            }
            else if (gameType === 'magic_hat') {
              magicHatTurns++;
            }
            else if (gameType === 'secret_grid') {
              if (electedDoorIndex !== null) {
                revealedDoors[electedDoorIndex] = true;
                electedDoorIndex = null;
              }
            }
            else if (gameType === 'balloon_pop') {
              const unpopped = balloons.find(b => !b.popped);
              if (unpopped) {
                unpopped.popped = true;
                score += 15;
              }
            }
            
            triggerToast("🎉 Chính xác! Bạn được cộng +" + earned + " Điểm!");
          } else {
            btn.className = "w-full text-left p-3.5 rounded-2xl border bg-rose-950/40 border-rose-500 text-xs font-black flex items-center gap-3 transition-all";
            btn.style.opacity = "1";
            
            const correctBtn = children[q.correctAnswer];
            correctBtn.className = "w-full text-left p-3.5 rounded-2xl border bg-emerald-950/40 border-emerald-500 text-xs font-black flex items-center gap-3 transition-all";
            correctBtn.style.opacity = "1";
            
            if (gameType === 'secret_grid') {
              electedDoorIndex = null;
            }
            
            triggerToast("❌ Chưa đúng! Đáp án chuẩn là " + ['A','B','C','D'][q.correctAnswer]);
          }

          document.getElementById('local-points').innerText = score;
          document.getElementById('next-btn').classList.remove('hidden');
          initInteractiveLayout();
        };
        box.appendChild(btn);
      });

      // Reset multiplier if spin-first is configured
      if (gameType === 'lucky_wheel') {
        if (wheelFlow === 'spin_first') {
          multiplier = 1;
        }
      } else {
        multiplier = 1;
      }

      initInteractiveLayout();
    }

    document.getElementById('next-btn').onclick = () => {
      currentIdx++;
      renderQuestion();
    };

    // Begin execution flow
    renderQuestion();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Game_${gameType}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("📥 Xuất file mã nguồn HTML thành công!");
    SoundEffects.playKeng();
  };

  // PPTX Generator using pptxgenjs
  const handleExportPPTX = () => {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';

    const cleanHexForPptx = (hex: string) => {
      if (!hex) return 'FFFFFF';
      return hex.replace('#', '').trim();
    };

    const qColorClean = cleanHexForPptx(questionColor);
    const aColorClean = cleanHexForPptx(answerColor);

    let slideBgColor = '1E1B4B'; // default dark blue
    if (selectedBackgroundId === 'custom_solid') {
      slideBgColor = cleanHexForPptx(customBgColor);
    } else {
      const currentBg = backgroundsCatalog.find(b => b.id === selectedBackgroundId);
      if (currentBg) {
        if (currentBg.id === 'slate') slideBgColor = '090D16';
        else if (currentBg.id === 'ocean') slideBgColor = '0C1A30';
        else if (currentBg.id === 'forest') slideBgColor = '062F1D';
        else if (currentBg.id === 'sunset') slideBgColor = '4C0519';
        else if (currentBg.id === 'space') slideBgColor = '1E1B4B';
      }
    }

    // Slide 1: Welcome/Title slide
    let slideIntro = pptx.addSlide();
    slideIntro.background = { color: slideBgColor };
    slideIntro.addText(gameTitle, {
      x: 0.5, y: 1.2, w: 9.0, h: 1.0,
      fontSize: 28, bold: true, color: 'fbbf24', align: 'center'
    });
    slideIntro.addText(`Môn học: ${selectedSubjectFilter === 'tin_hoc' ? 'Tin học' : 'Bài học liên môn'} - Lớp ${selectedGradeFilter}`, {
      x: 0.5, y: 2.4, w: 9.0, h: 0.5,
      fontSize: 16, color: 'FFFFFF', align: 'center'
    });
    slideIntro.addText(`Hướng dẫn: Bấm F5 để trình chiếu và nhấp vào phương án để chơi trực quan.`, {
      x: 0.5, y: 3.8, w: 9.0, h: 1.0,
      fontSize: 13, color: '93C5FD', italic: true, align: 'center'
    });

    // Generate Question and Feedback Loop Slides (Static hyperlinked deck representation)
    quizQuestions.forEach((q, qidx) => {
      // Question Slide
      let qSlide = pptx.addSlide();
      qSlide.background = { color: slideBgColor };
      
      // Center title text to avoid drift alignment issues
      qSlide.addText(`BỘ CÂU HỎI TRÒ CHƠI - CÂU ${qidx + 1}`, {
        x: 0.5, y: 0.3, w: 9.0, h: 0.4,
        fontSize: 12, bold: true, color: '38BDF8', align: 'center'
      });
      
      // Center question text with nice margins to avoid shifting
      qSlide.addText(q.question, {
        x: 0.5, y: 0.8, w: 9.0, h: 1.2,
        fontSize: 20, bold: true, color: qColorClean, align: 'center', valign: 'middle'
      });

      // Render 4 choices - mathematically centered and spaced
      const positions = [
        { x: 0.5, y: 2.3 },
        { x: 5.2, y: 2.3 },
        { x: 0.5, y: 3.7 },
        { x: 5.2, y: 3.7 }
      ];

      q.options.forEach((opt, oidx) => {
        const alphabet = ['A', 'B', 'C', 'D'][oidx];
        const pos = positions[oidx];

        // Symmetrical container styling
        qSlide.addText(`${alphabet}. ${opt}`, {
          x: pos.x, y: pos.y, w: 4.3, h: 1.1,
          fontSize: 13, bold: true, color: aColorClean,
          fill: { color: '312E81' },
          line: { color: '4338CA', width: 2 },
          align: 'center',
          valign: 'middle'
        });
      });
    });

    // Save File
    pptx.writeFile({ fileName: `Slide_Tro_Choi_${gameType}_${Date.now()}.pptx` })
      .then(() => {
        triggerToast("📥 Tạo slide PowerPoint (pptx) thành công!");
        SoundEffects.playKeng();
      })
      .catch(err => {
        console.error(err);
        triggerToast("❌ Lỗi xuất PowerPoint");
      });
  };

  const currentBg = backgroundsCatalog.find(b => b.id === selectedBackgroundId) || backgroundsCatalog[0];

  return (
    <div className="space-y-6 text-left pb-16 animate-fade-in text-xs">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 animate-scale-up border-l-4 border-l-orange-500 font-bold max-w-sm text-xs">
          <span>🔔</span>
          <span className="leading-normal">{toast}</span>
        </div>
      )}

      {/* Decorative top title banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white p-6 rounded-[32px] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            🎪 MULTIMEDIA GAME CENTER
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-title)' }}>
            Hệ thống Tạo Trò chơi Sư phạm Class Master
          </h2>
          <p className="text-xs text-orange-50 font-semibold max-w-2xl leading-normal">
            Chọn 1 trong 10 game giáo dục kinh điển, đồng bộ kho bài giảng, soản thảo nhanh bằng AI. Xuất nhanh trang HTML5 chạy độc lập và PowerPoint (pptx) chất lượng cao!
          </p>
        </div>
        <span className="text-5xl select-none animate-bounce">🎮🎁</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step panel (Left column) */}
        <div className="lg:col-span-8 bg-white rounded-[28px] p-6 border border-slate-150 shadow-sm space-y-6">
          
          {/* Step 1: Chọn mẫu Game */}
          <div className="space-y-3">
            <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-xs">1</span>
              Bước 1: Chọn phong cách Thể loại Trò chơi lớp học
            </span>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {[
                { id: 'lucky_wheel', label: 'Vòng quay may mắn', icon: '🎡' },
                { id: 'millionaire', label: 'Ai là triệu phú', icon: '🏆' },
                { id: 'secret_grid', label: 'Ô cửa bí mật', icon: '🖼️' },
                { id: 'treasure_hunt', label: 'Truy tìm kho báu', icon: '🏴‍☠️' },
                { id: 'balloon_pop', label: 'Bắn bóng kiến thức', icon: '🎈' },
                { id: 'car_racing', label: 'Đua xe trả lời', icon: '🏎️' },
                { id: 'memory', label: 'Ghép cặp trí nhớ', icon: '🧩' },
                { id: 'magic_hat', label: 'Chiếc nón kỳ diệu', icon: '👒' },
                { id: 'olympia', label: 'Đỉnh Olympia nhí', icon: '⛰️' },
                { id: 'lucky_gift', label: 'Hộp quà bí mật', icon: '🎁' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { setGameType(g.id as GameMode); SoundEffects.playTing(); }}
                  className={`p-3 rounded-xl border-2 text-center space-y-1 cursor-pointer transition-all ${
                    gameType === g.id
                      ? 'border-orange-500 bg-orange-50/20 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-orange-200'
                  }`}
                >
                  <span className="text-2xl block">{g.icon}</span>
                  <h4 className="font-extrabold text-slate-800 text-[10.5px] leading-tight-none">{g.label}</h4>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Cài đặt câu hỏi */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-xs">2</span>
              Bước 2: Hệ thống ngân hàng câu hỏi học tập
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block mb-1 font-bold text-[10px] text-gray-500">Tên trò chơi hiển thị</label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-[11px]"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold text-[10px] text-gray-500">Thời gian trả lời (s)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-[11px]"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold text-[10px] text-gray-500">Cơ số câu đố (Nhập số)</label>
                <input
                  type="text"
                  value={numQuestions || ''}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    setNumQuestions(isNaN(parsed) ? 0 : parsed);
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-[11px]"
                  placeholder="Nhập số câu hỏi, vd: 5"
                />
              </div>
            </div>

            {/* --- DETAILED CONFIGURATION FOR INDIVIDUAL GAMES --- */}
            <div className="bg-orange-50/20 border border-orange-200 p-4 rounded-xl space-y-4">
              <span className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                ⚙️ Cài đặt đặc trưng riêng của Trò chơi: <span className="text-orange-600 underline font-black uppercase text-[10px]">{
                  gameType === 'lucky_wheel' ? 'Vòng Quay May Mắn' :
                  gameType === 'secret_grid' ? 'Ô Cửa Bí Mật' :
                  gameType === 'treasure_hunt' ? 'Truy Tìm Kho Báu' :
                  gameType === 'balloon_pop' ? 'Bắn Bóng Kiến Thức' :
                  gameType === 'memory' ? 'Ghép Cặp Trí Nhớ' :
                  gameType === 'magic_hat' ? 'Chiếc Nón Kỳ Diệu' : 'Cấu hình tiêu chuẩn'
                }</span>
              </span>

              {gameType === 'lucky_wheel' && (
                <div className="space-y-3 text-[11px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Luồng chơi vòng quay</label>
                      <select
                        value={wheelFlow}
                        onChange={(e) => setWheelFlow(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="spin_first">🎡 Quay vòng quay trước khi trả lời câu đố</option>
                        <option value="answer_first">📝 Trả lời câu hỏi rồi mới được quay thưởng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-700 font-bold">Chọn số lượng phần nhãn trên vòng quay (Từ 1 đến 12)</label>
                      <select
                        value={wheelSlicesCount}
                        onChange={(e) => handleSlicesCountChange(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                          <option key={n} value={n}>{n} phần</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic inputs based on slices count */}
                  <div className="border border-slate-150 p-2.5 rounded-lg bg-white space-y-2 mt-2">
                    <span className="font-extrabold text-slate-700 text-[10px] block">✏️ Điền văn bản nhãn lên từng phần trên vòng quay:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Array.from({ length: wheelSlicesCount }).map((_, idx) => {
                        const list = wheelSlicesInput.split(',').map(s => s.trim());
                        const currentVal = list[idx] || "";
                        return (
                          <div key={idx} className="space-y-0.5">
                            <label className="text-[9px] text-slate-400 font-extrabold">Phần {idx + 1}:</label>
                            <input
                              type="text"
                              value={currentVal}
                              onChange={(e) => handleSliceChange(idx, e.target.value)}
                              placeholder={`Phần ${idx + 1}`}
                              className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold text-center bg-slate-50"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[9.5px] text-orange-600 font-bold italic">
                    💡 Điền nhãn để hiển thị trực tiếp lên từng phần của vòng quay may mắn! Có thể điền điểm như: +10 Điểm, +20 Điểm hoặc hệ số nhân như: Nhân đôi x2, x3.
                  </p>
                </div>
              )}

              {gameType === 'secret_grid' && (
                <div className="space-y-3 text-[11px]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Số lượng ô cửa bí mật</label>
                      <select
                        value={secretGridSize}
                        onChange={(e) => setSecretGridSize(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value={4}>4 ô cửa (2x2)</option>
                        <option value={9}>9 ô cửa (3x3)</option>
                        <option value={12}>12 ô cửa (3x4)</option>
                        <option value={16}>16 ô cửa (4x4)</option>
                        <option value={20}>20 ô cửa (4x5)</option>
                        <option value={25}>25 ô cửa (5x5)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Nội dung đáp án khi mở gợi ý</label>
                      <input
                        type="text"
                        value={secretCorrectAnswer}
                        onChange={(e) => setSecretCorrectAnswer(e.target.value)}
                        placeholder="VD: MÁY VI TÍNH"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Cộng hình nền ẩn (URL hoặc tải file lên)</label>
                      <input
                        type="text"
                        value={secretCoverImage}
                        onChange={(e) => setSecretCoverImage(e.target.value)}
                        placeholder="Nhập đường dẫn ảnh..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold">Hoặc tải file ảnh lên trực tiếp:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setSecretCoverImage(event.target.result as string);
                              triggerToast('🖼️ Đã cập nhật ảnh nền ẩn ô cửa thành công!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-600 block"
                    />
                  </div>
                  <p className="text-[9.5px] text-orange-600 font-bold">
                    💡 Học sinh chỉ được phép đoán đáp án khi đã lật mở tối thiểu 25% số ô cửa bí ẩn trên! Điều này gia tăng kịch tính bài giảng.
                  </p>
                </div>
              )}

              {gameType === 'treasure_hunt' && (
                <div className="space-y-3 text-[11px]">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Tiêu đề bản đồ</label>
                      <input
                        type="text"
                        value={treasureMapTitle}
                        onChange={(e) => setTreasureMapTitle(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Icon thuyền hải hành 🚢</label>
                      <input
                        type="text"
                        value={treasureShipIcon}
                        onChange={(e) => setTreasureShipIcon(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Icon khởi hành</label>
                      <input
                        type="text"
                        value={treasureStartIcon}
                        onChange={(e) => setTreasureStartIcon(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Icon đảo trung gian</label>
                      <input
                        type="text"
                        value={treasurePointIcon}
                        onChange={(e) => setTreasurePointIcon(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Icon kho báu cuối</label>
                      <input
                        type="text"
                        value={treasureChestIcon}
                        onChange={(e) => setTreasureChestIcon(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 p-2.5 rounded-lg bg-white space-y-2">
                    <span className="font-extrabold text-slate-700 text-[10px] block">🌴 Danh sách Đảo Hải Trình (Sửa trực tiếp tên đảo):</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {treasureIslands.map((island, index) => (
                        <div key={index} className="flex gap-1 items-center">
                          <span className="text-[10px] text-slate-400 font-extrabold min-w-10">Mốc {index + 1}:</span>
                          <input
                            type="text"
                            value={island}
                            onChange={(e) => {
                              const updated = [...treasureIslands];
                              updated[index] = e.target.value;
                              setTreasureIslands(updated);
                            }}
                            className="flex-1 p-1 border border-slate-200 rounded text-xs font-bold bg-slate-50"
                          />
                          {treasureIslands.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = treasureIslands.filter((_, i) => i !== index);
                                setTreasureIslands(updated);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTreasureIslands([...treasureIslands, "🏝️ Đảo Kỳ Bí mới"]);
                      }}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[9.5px] rounded cursor-pointer mt-1 inline-block"
                    >
                      + Thêm Đảo Mới
                    </button>
                  </div>
                </div>
              )}

              {gameType === 'balloon_pop' && (
                <div className="space-y-1 text-[11px]">
                  <label className="block font-bold text-slate-700">Số lượng bóng bay hiển thị</label>
                  <input
                    type="number"
                    value={balloonCount}
                    onChange={(e) => setBalloonCount(Number(e.target.value))}
                    min={2}
                    max={12}
                    className="w-32 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <p className="text-[9.5px] text-slate-500 italic">
                    Nhập số bóng bay giáo viên muốn kích lật. Học sinh bấm vào bóng bay để bùng câu đố!
                  </p>
                </div>
              )}

              {gameType === 'memory' && (
                <div className="space-y-3 text-[11px]">
                  <div>
                    <label className="block mb-1 font-bold text-slate-700">Số lượng ô lật ghép cặp trí tuệ</label>
                    <select
                      value={memoryCardCount}
                      onChange={(e) => setMemoryCardCount(Number(e.target.value))}
                      className="w-48 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value={4}>4 ô (2 Cặp đối ứng)</option>
                      <option value={6}>6 ô (3 Cặp đối ứng)</option>
                      <option value={8}>8 ô (4 Cặp đối ứng)</option>
                      <option value={10}>10 ô (5 Cặp đối ứng)</option>
                      <option value={12}>12 ô (6 Cặp đối ứng)</option>
                      <option value={16}>16 ô (8 Cặp đối ứng)</option>
                    </select>
                  </div>

                  <div className="border border-slate-200 p-3 rounded-lg bg-white space-y-2">
                    <span className="font-extrabold text-slate-700 text-[10px] block">📝 Biên tập các cặp Thẻ Lật (Ghép cặp):</span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {memoryPairs.map((pair, index) => (
                        <div key={index} className="grid grid-cols-12 gap-1.5 items-center">
                          <span className="col-span-1 text-slate-400 font-extrabold text-[10px]">Cặp {index + 1}:</span>
                          <input
                            type="text"
                            value={pair.question}
                            onChange={(e) => {
                              const updated = [...memoryPairs];
                              updated[index].question = e.target.value;
                              setMemoryPairs(updated);
                            }}
                            placeholder="Từ khoá vế A"
                            className="col-span-5 p-1 border border-slate-200 rounded text-xs font-bold"
                          />
                          <input
                            type="text"
                            value={pair.answer}
                            onChange={(e) => {
                              const updated = [...memoryPairs];
                              updated[index].answer = e.target.value;
                              setMemoryPairs(updated);
                            }}
                            placeholder="Nội dung khớp đống vế B"
                            className="col-span-5 p-1 border border-slate-200 rounded text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMemoryPairs(memoryPairs.filter((_, i) => i !== index));
                            }}
                            className="col-span-1 text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer text-center"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMemoryPairs([...memoryPairs, { question: "Từ mới 🧩", answer: "Khớp đúng 💡" }]);
                      }}
                      className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-[9.5px] rounded cursor-pointer mt-1 inline-block"
                    >
                      + Thêm Cặp Đối Ứng Mới
                    </button>
                  </div>
                </div>
              )}

              {gameType === 'magic_hat' && (
                <div className="space-y-3 text-[11px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold text-slate-700 font-bold uppercase text-orange-900">Từ khóa giải mật (Không chứa dấu cách, không viết dấu tiếng Việt)</label>
                      <input
                        type="text"
                        value={magicHatKeyword}
                        onChange={(e) => setMagicHatKeyword(e.target.value.trim().toUpperCase().replace(/[^A-Z0-9]/gi, ''))}
                        placeholder="VD: MAYTINH"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-black tracking-widest text-indigo-700"
                      />
                    </div>
                  </div>
                  <p className="text-[9.5px] text-orange-600 font-bold">
                    💡 Quy tắc sư phạm nâng cao: Học sinh phải trả lời CHÍNH XÁC một câu quế trắc nghiệm dưới để nhận +1 lượt lật mở chữ cái! Rèn luyện trí tuệ kết hợp ôn tập sâu sắc.
                  </p>
                </div>
              )}
            </div>

            {/* Conditional Quiz Creation Tools (Hidden only for Ghép cặp trí tuệ) */}
            {gameType !== 'memory' && (
              <div className="space-y-4">
                {/* Auto pool trigger */}
                <div className="border border-purple-250 bg-purple-50/10 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase">ĐỒNG BỘ KHO GIÁO ÁN</span>
                    <button
                      type="button"
                      onClick={handleRandomFromExercises}
                      className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] rounded-xl cursor-pointer shadow-sm animate-pulse"
                    >
                      🎲 Nạp ngẫu nhiên từ Bài tập
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10.5px]">
                    <div>
                      <label className="block mb-0.5 font-bold text-gray-400">Môn học</label>
                      <select
                        value={selectedSubjectFilter}
                        onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px]"
                      >
                        <option value="tin_hoc">💻 Môn Tin học</option>
                        <option value="toan">📐 Môn Toán học</option>
                        <option value="tieng_anh">🇳🇿 Môn Tiếng Anh</option>
                        <option value="tieng_viet">📖 Môn Tiếng Việt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-0.5 font-bold text-gray-400">Khối lớp</label>
                      <select
                        value={selectedGradeFilter}
                        onChange={(e) => setSelectedGradeFilter(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px]"
                      >
                        <option value={1}>Lớp 1</option>
                        <option value={2}>Lớp 2</option>
                        <option value={3}>Lớp 3</option>
                        <option value={4}>Lớp 4</option>
                        <option value={5}>Lớp 5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-0.5 font-bold text-gray-400">Chương trình</label>
                      <select
                        value={selectedProgramFilter}
                        onChange={(e) => setSelectedProgramFilter(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px]"
                      >
                        {selectedSubjectFilter === 'tin_hoc' ? (
                          <>
                            <option value="all">Tất cả loại</option>
                            {!hiddenPrograms.includes('Kết nối tri thức với cuộc sống') && (
                              <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức</option>
                            )}
                            <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                            <option value="Cánh diều">Cánh diều</option>
                            {!hiddenPrograms.includes('Tin học Quốc tế IC3 Spark') && (
                              <option value="Tin học Quốc tế">Tin học Quốc tế</option>
                            )}
                          </>
                        ) : (
                          !hiddenPrograms.includes('Kết nối tri thức với cuộc sống') && (
                            <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức</option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-0.5 font-bold text-gray-400">Tên bài học</label>
                      <select
                        value={selectedLessonFilter}
                        onChange={(e) => {
                          const lId = e.target.value;
                          setSelectedLessonFilter(lId);
                          if (lId !== 'all') {
                            const found = (lessonsList || []).find((l: any) => l.id === lId);
                            if (found) {
                              setAiTopic(found.title);
                            }
                          }
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px]"
                      >
                        <option value="all">Tất cả Bài học sẵn có</option>
                        {(lessonsList || [])
                          .filter((l: any) => {
                            const matchGrade = Number(l.grade) === Number(selectedGradeFilter);
                            const matchSubject = !l.subject || l.subject === selectedSubjectFilter;
                            const matchProgram = selectedProgramFilter === 'all' || 
                              l.programType === selectedProgramFilter ||
                              (selectedProgramFilter === 'Tin học Quốc tế' && (l.programType === 'Tin học Quốc tế IC3 Spark' || l.programType === 'IC3SPARK' || l.programType === 'IC3 SPARK'));
                            return matchGrade && matchSubject && matchProgram;
                          })
                          .map((l: any) => (
                            <option key={l.id} value={l.id}>
                              {l.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI smart builder */}
                <div className="bg-indigo-50/30 border border-indigo-150 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-black text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-650" />
                    AI Copilot: Tự động lên ý tưởng câu đố thông tin
                  </span>
                  <p className="text-[10px] text-gray-500">
                    Gõ nhanh chủ đề bài học muốn ra đố, Gemini AI sẽ tự động đóng cấu trúc trắc nghiệm đúng chuẩn!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="VD: Cách phòng tránh kẻ giả mạo trên mạng xã hội..."
                      className="flex-1 p-2 border border-slate-200 rounded-xl font-semibold text-[11px] focus:outline-none focus:border-indigo-500 bg-white"
                    />
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleAIGenerateQuestions}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-black rounded-xl text-[10.5px] disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer bg-indigo-600"
                    >
                      {isGenerating ? "Đang soạn..." : "Soạn bằng AI 🤖"}
                    </button>
                  </div>

                  {generationError && (
                    <div id="game-creator-api-error-alert" className="bg-red-50 border border-red-200 rounded-xl p-3 text-left space-y-2 mt-1">
                      <div className="flex items-start gap-1.5 text-red-700">
                        <span className="text-sm shrink-0">⚠️</span>
                        <div className="space-y-0.5">
                          <h5 className="text-[10px] font-black uppercase">LỖI KẾT NỐI AI CO-PILOT</h5>
                          <p className="text-[10px] leading-relaxed font-semibold text-red-650">{generationError}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/70 border border-red-100 rounded-lg p-2.5 space-y-2">
                        <p className="text-[9.5px] text-slate-600 font-medium leading-relaxed">
                          Hệ thống AI miễn phí tạm thời kẹt/hết quota. Thầy Cô vui lòng nhập <strong>Khóa API Gemini cá nhân miễn phí</strong> để bẻ khóa ngay:
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="password"
                            value={personalApiKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPersonalApiKey(val);
                              localStorage.setItem('personal_gemini_api_key', val);
                            }}
                            placeholder="Dán mã API Key tại đây (AIzaSy...)"
                            className="flex-1 p-1.5 bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:border-red-400 text-[10px] text-slate-750 placeholder-slate-400"
                          />
                          {personalApiKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setPersonalApiKey('');
                                localStorage.removeItem('personal_gemini_api_key');
                              }}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-[#e11d48] border border-red-200 rounded-md text-[9.5px] font-bold cursor-pointer"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[9px] pt-0.5">
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-650 hover:underline font-extrabold inline-flex items-center gap-0.5"
                          >
                            Lấy Khóa API Miễn Phí ↗
                          </a>
                          <button
                            type="button"
                            onClick={() => setGenerationError(null)}
                            className="text-slate-500 hover:text-slate-800 font-bold"
                          >
                            Đóng ×
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collapsible Gemini API Key panel to prevent 429 quota exhaustion */}
                  <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50 mt-1">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-550 hover:text-indigo-600 cursor-pointer text-left"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{personalApiKey ? '🔑 Đã lưu API Key riêng' : '🔑 Khóa Gemini API Key cá nhân (Không nghẽn)'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform shrink-0 ${showKeyInput ? 'rotate-180' : ''}`} />
                      </button>
                      {personalApiKey && !showKeyInput && (
                        <span className="text-[8.5px] bg-emerald-50 text-emerald-600 border border-emerald-250 px-2 py-0.5 rounded-full font-bold">Đang dùng</span>
                      )}
                    </div>
                    {showKeyInput && (
                      <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-1.5 text-left">
                        <div className="flex gap-1.5">
                          <input
                            type="password"
                            value={personalApiKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPersonalApiKey(val);
                              localStorage.setItem('personal_gemini_api_key', val);
                            }}
                            placeholder="Nhập khóa API Gemini của riêng thầy cô..."
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-mono text-[10px] focus:outline-none"
                          />
                          {personalApiKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setPersonalApiKey('');
                                localStorage.removeItem('personal_gemini_api_key');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#e11d48] border border-red-200 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center justify-between">
                          <span>* Khóa bảo mật lưu tại trình duyệt này.</span>
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-600 hover:underline font-extrabold"
                          >
                            Lấy API Key Miễn Phí ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add manual question tool */}
                <div className="border border-slate-200 p-4 rounded-xl space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-extrabold text-slate-800 text-[11px]">🛠️ Biên tập thủ công</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold">
                      <button
                        type="button"
                        onClick={() => setManualQuestionType('choice')}
                        className={`px-2 py-1 rounded-md ${manualQuestionType === 'choice' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}
                      >
                        Trắc nghiệm
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualQuestionType('true_false')}
                        className={`px-2 py-1 rounded-md ${manualQuestionType === 'true_false' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}
                      >
                        Đúng / Sai
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-[10.5px]">
                    <div>
                      <label className="block mb-0.5 font-bold text-gray-400">Câu hỏi hoặc thử thách</label>
                      <input
                        type="text"
                        value={currentQ}
                        onChange={(e) => setCurrentQ(e.target.value)}
                        placeholder="VD: Phần mềm hỗ trợ gõ tiếng Việt có dấu nào phổ biến nhất?"
                        className="w-full p-2 border border-slate-200 rounded-xl"
                      />
                    </div>

                    {manualQuestionType === 'choice' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={currentOpt1}
                          onChange={(e) => setCurrentOpt1(e.target.value)}
                          placeholder="Đáp án A"
                          className="p-1.5 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          value={currentOpt2}
                          onChange={(e) => setCurrentOpt2(e.target.value)}
                          placeholder="Đáp án B"
                          className="p-1.5 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          value={currentOpt3}
                          onChange={(e) => setCurrentOpt3(e.target.value)}
                          placeholder="Đáp án C"
                          className="p-1.5 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          value={currentOpt4}
                          onChange={(e) => setCurrentOpt4(e.target.value)}
                          placeholder="Đáp án D"
                          className="p-1.5 border border-slate-200 rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block mb-0.5 font-bold text-gray-400">Đáp án chính xác</label>
                        <select
                          value={currentAns}
                          onChange={(e) => setCurrentAns(Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-200 rounded-lg font-bold"
                        >
                          <option value={0}>Đáp án A {manualQuestionType === 'true_false' ? '(Đúng)' : ''}</option>
                          <option value={1}>Đáp án B {manualQuestionType === 'true_false' ? '(Sai)' : ''}</option>
                          <option value={2}>Đáp án C</option>
                          <option value={3}>Đáp án D</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const eventMock = { preventDefault: () => {} } as React.FormEvent;
                          handleAddQuestion(eventMock);
                        }}
                        className="px-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg text-[10px] self-end h-9 cursor-pointer"
                      >
                        Thêm câu đố
                      </button>
                    </div>
                  </div>
                </div>

                {/* List current quiz items */}
                <div className="space-y-1.5 border border-slate-150 p-3 rounded-xl text-left bg-slate-50/50">
                  <div className="flex justify-between items-center border-b pb-1 mb-1">
                    <span className="font-extrabold text-[#3b82f6] text-[10.5px]">
                      Danh sách câu đố đang nạp ({quizQuestions.length})
                    </span>
                    {quizQuestions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuizQuestions([]);
                          triggerToast("🗑️ Đã xoá tất cả câu hỏi trong danh sách!");
                          SoundEffects.playTing();
                        }}
                        className="text-[9.5px] font-black text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-600 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-rose-200"
                      >
                        🗑️ Xoá tất cả
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10.5px] border-b pb-1">
                        <span className="font-semibold line-clamp-1">{idx + 1}. {q.question}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(idx)}
                          className="text-rose-500 p-1 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Play Live simulation Side layout (Right column) */}
        <div className="lg:col-span-4 space-y-5">
          <div
            className={`border rounded-[28px] p-5 text-white min-h-[480px] flex flex-col justify-between shadow-2xl relative transition-all ${
              selectedBackgroundId === 'custom_solid'
                ? 'border-[#3b82f6]'
                : currentBg.isCustom
                ? 'border-orange-500'
                : `${currentBg.value}`
            }`}
            style={
              selectedBackgroundId === 'custom_solid'
                ? { backgroundColor: customBgColor }
                : currentBg.isCustom
                ? {
                    backgroundImage: `url(${currentBg.value})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : undefined
            }
          >
            
            <div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <span className="font-extrabold text-[#38bdf8] uppercase text-[9.5px] tracking-wider flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4 text-sky-400 animate-pulse" />
                  Mô phỏng tương tác học sinh
                </span>
                <span className="bg-white/10 text-white font-extrabold px-2.5 py-1 rounded-full text-[9px] border border-white/10">
                  {playScore} Điểm ⭐
                </span>
              </div>

              {isPlaying ? (
                isDone ? (
                  <div className="text-center py-16 space-y-4 animate-scale-up">
                    <span className="text-4xl block">🎉👑🏆</span>
                    <h4 className="font-black text-sm text-yellow-400 uppercase">Hoàn thành thử thách</h4>
                    <p className="text-2xl font-black text-[#5ED68A]">{playScore} Điểm</p>
                    <button
                      onClick={handlePlayTest}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-bold cursor-pointer"
                    >
                      Mở lượt chơi mới 🔄
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs items-start">
                    {/* Left Column: Interactive Simulation Component */}
                    <div className="lg:col-span-5 space-y-4">
                     
                    {/* Lucky Wheel Active View */}
                    {gameType === 'lucky_wheel' && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-purple-500/20 text-center space-y-3">
                        <span className="font-bold text-[9px] text-[#A78BFA] uppercase block">
                          🎡 VÒNG QUAY ĐIỂM SỐ NHÂN ({wheelFlow === 'spin_first' ? 'Quay trước trả lời' : 'Trả lời rồi quay'})
                        </span>
                        
                        {/* Interactive SVG/CSS Conic Wheel with texts labeled directly on it */}
                        <div className="relative w-36 h-36 mx-auto my-2">
                          <div 
                            className="w-full h-full rounded-full border-4 border-white/60 relative flex items-center justify-center text-[8px] font-black transition-all duration-[2500ms] overflow-hidden"
                            style={{
                              transform: `rotate(${wheelDegree}deg)`,
                              background: `conic-gradient(from 0deg, ${(() => {
                                const slices = wheelSlicesInput.split(',').map(s => s.trim()).filter(Boolean);
                                return slices.map((_, idx) => {
                                  const colorsList = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#06B6D4", "#6366F1", "#D946EF"];
                                  const color = colorsList[idx % colorsList.length];
                                  const from = idx * (360 / slices.length);
                                  const to = (idx + 1) * (360 / slices.length);
                                  return `${color} ${from}deg ${to}deg`;
                                }).join(', ');
                              })()})`
                            }}
                          >
                            <div className="absolute w-12 h-12 bg-slate-900 rounded-full border-2 border-white flex flex-col items-center justify-center text-white text-[7px] z-10 font-bold">
                              <span>Xoay</span>
                              <span className="text-[#38bdf8]">{spinMultiplier}x</span>
                            </div>

                            {/* Rotate slice texts onto slices */}
                            {wheelSlicesInput.split(',').map(s => s.trim()).filter(Boolean).map((slice, i, arr) => {
                              const deg = i * (360 / arr.length) + (180 / arr.length);
                              return (
                                <div 
                                  key={i} 
                                  className="absolute text-white font-extrabold text-[7px] text-center select-none pointer-events-none tracking-tight-none leading-none-tight"
                                  style={{
                                    transform: `rotate(${deg}deg) translateY(-46px)`,
                                    width: '38px',
                                  }}
                                >
                                  {slice}
                                </div>
                              );
                            })}
                          </div>
                          {/* Needle Indicator */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-yellow-400 z-20"></div>
                        </div>

                        {/* Instruction Flow Helper */}
                        <div className="text-[10px] py-1 text-slate-300 font-bold">
                          {wheelFlow === 'spin_first' ? (
                            !hasSpunThisTurn ? (
                              <span className="text-rose-400 animate-pulse">👉 Bấm quay vòng để kéo hệ số trước khi nhấp đáp án!</span>
                            ) : (
                              <span className="text-emerald-400">
                                {spinMultiplier > 2 
                                  ? `✅ Đã nhận hệ số x${spinMultiplier}! Trả lời câu đố phía dưới.`
                                  : "✅ Đã sẵn sàng! Trả lời câu đố phía dưới."
                                }
                              </span>
                            )
                          ) : (
                            selectedAns !== null ? (
                              quizQuestions[activePlayIndex].correctAnswer === selectedAns ? (
                                !hasSpunThisTurn ? (
                                  <span className="text-yellow-400 animate-bounce">🎉 Trả lời đúng! Hãy quay vòng để nhận Hệ Số nhân thưởng!</span>
                                ) : (
                                  <span className="text-emerald-400">
                                    {spinMultiplier > 2 
                                      ? `⭐ Đã nhận thưởng x${spinMultiplier}! Nhấp kế tiếp để tiếp tục.`
                                      : "⭐ Đã hoàn thành thử thách! Nhấp kế tiếp để tiếp tục."
                                    }
                                  </span>
                                )
                              ) : (
                                <span className="text-slate-400">❌ Rất tiếc, trả lời sai mất cơ hội quay thưởng câu này.</span>
                              )
                            ) : (
                              <span className="text-slate-300">👉 Nhấp đúng câu hỏi bên dưới trước để kích hoạt lượt quay!</span>
                            )
                          )}
                        </div>

                        <button
                          onClick={handleSpinWheel}
                          disabled={
                            isSpinning || 
                            hasSpunThisTurn || 
                            (wheelFlow === 'answer_first' && (selectedAns === null || quizQuestions[activePlayIndex].correctAnswer !== selectedAns))
                          }
                          className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-30 text-[10px] font-black rounded-lg cursor-pointer text-white shadow"
                        >
                          {isSpinning ? "🎰 Đang xoáy..." : hasSpunThisTurn ? `Đã quay (${spinMultiplier}X)` : "Quay Ngay 🎡"}
                        </button>
                      </div>
                    )}
 
                    {/* Millionaire Lifelines */}
                    {gameType === 'millionaire' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-blue-500/20 space-y-2">
                        <span className="font-bold text-[9.5px] text-zinc-400 block tracking-wider">LỰA CHỌN TRỢ GIÚP TRIỆU PHÚ</span>
                        <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold">
                          <button
                            onClick={handleUse5050}
                            disabled={fiftyFiftyUsed}
                            className={`p-1 border rounded ${fiftyFiftyUsed ? 'opacity-30 border-slate-800' : 'border-orange-500 text-orange-200'}`}
                          >
                            50:50 ⚖️
                          </button>
                          <button
                            onClick={handleUseAudience}
                            disabled={audienceUsed}
                            className={`p-1 border rounded ${audienceUsed ? 'opacity-30 border-slate-800' : 'border-orange-500 text-orange-200'}`}
                          >
                            Hỏi Lớp 🗣️
                          </button>
                          <button
                            onClick={handleUsePhone}
                            disabled={phoneUsed}
                            className={`p-1 border rounded ${phoneUsed ? 'opacity-30 border-slate-800' : 'border-orange-500 text-orange-200'}`}
                          >
                            Tư Vấn 📞
                          </button>
                        </div>
                        {phoneAdvice && (
                          <div className="p-2 bg-slate-900 rounded text-amber-300 font-bold leading-normal text-[9.5px]">
                            {phoneAdvice}
                          </div>
                        )}
                        {audienceStats && (
                          <div className="bg-slate-900 p-2 rounded space-y-1 text-[9px]">
                            {Object.entries(audienceStats).map(([idx, pct]) => (
                              <div key={idx} className="flex justify-between text-sky-300">
                                <span>Đáp án {['A','B','C','D'][Number(idx)]}:</span>
                                <strong>{pct}% khuyên chọn</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
 
                    {/* Mở ô cửa bí mật */}
                    {gameType === 'secret_grid' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-teal-500/10 text-center space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-teal-400 uppercase">
                            🖼️ Ô cửa bí ẩn ({revealedSecretDoors.filter(Boolean).length}/{secretGridSize} lật)
                          </span>
                          <span className="text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded">
                            Cần mở: {Math.ceil(secretGridSize * 0.25)} ô để đoán
                          </span>
                        </div>
                        
                        {/* Image hidden container */}
                        <div 
                          className="relative w-44 h-44 mx-auto overflow-hidden rounded-xl border-2 border-slate-700 bg-cover bg-center shadow-lg transition-all" 
                          style={{ backgroundImage: `url(${secretCoverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e'})` }}
                        >
                          <div 
                            className="absolute inset-0 grid gap-0 p-0 bg-slate-950/20 backdrop-blur-[0.5px]" 
                            style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(secretGridSize))}, minmax(0, 1fr))` }}
                          >
                            {Array.from({ length: secretGridSize }).map((_, i) => (
                              <button
                                key={i}
                                disabled={revealedSecretDoors[i] || activeGridChoice === i || didGuessSecret}
                                onClick={() => handleDoorClick(i)}
                                className={`rounded-none text-xs font-black border flex items-center justify-center transition-all ${
                                  revealedSecretDoors[i] 
                                  ? 'opacity-0 scale-90 pointer-events-none' 
                                  : activeGridChoice === i
                                    ? 'bg-amber-500 border-white text-white scale-95 shadow-inner'
                                    : 'bg-slate-900 border-slate-800/40 hover:bg-slate-800 text-slate-300'
                                }`}
                              >
                                {revealedSecretDoors[i] ? '' : i + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        {didGuessSecret ? (
                          <div className="p-2 bg-emerald-900/30 border border-emerald-500 text-emerald-400 font-extrabold rounded-lg text-[10px]">
                            🎉 Bạn đã đoán đúng từ khóa: <span className="underline uppercase">{secretKeyword}</span>! (+50 Điểm)
                          </div>
                        ) : (
                          <form onSubmit={handleGuessSecretSubmit} className="space-y-1.5">
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={secretConceptWord}
                                onChange={(e) => setSecretConceptWord(e.target.value)}
                                disabled={revealedSecretDoors.filter(Boolean).length < Math.ceil(secretGridSize * 0.25)}
                                placeholder={
                                  revealedSecretDoors.filter(Boolean).length < Math.ceil(secretGridSize * 0.25)
                                    ? `🔑 Mở ít nhất ${Math.ceil(secretGridSize * 0.25)} ô để đoán...`
                                    : "Đoán tranh nền ẩn..."
                                }
                                className="bg-slate-900 border border-slate-700 px-2 py-1 flex-1 text-[10px] text-white rounded focus:outline-none disabled:opacity-40 disabled:bg-slate-950"
                              />
                              <button
                                type="submit"
                                disabled={revealedSecretDoors.filter(Boolean).length < Math.ceil(secretGridSize * 0.25)}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white font-bold px-3 py-1 rounded text-[10px] cursor-pointer"
                              >
                                Đoán 🎯
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowSecretAnswerSim(!showSecretAnswerSim)}
                                disabled={revealedSecretDoors.filter(Boolean).length < Math.ceil(secretGridSize * 0.25)}
                                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                              >
                                {showSecretAnswerSim ? "Ẩn KH 🔒" : "Đáp án 🔑"}
                              </button>
                            </div>
                            {showSecretAnswerSim && (
                              <div className="p-1.5 bg-cyan-950/40 border border-cyan-500 text-cyan-300 font-black rounded-lg text-[10px] text-center uppercase tracking-wide">
                                🔑 Đáp án: {secretCorrectAnswer}
                              </div>
                            )}
                            {revealedSecretDoors.filter(Boolean).length < Math.ceil(secretGridSize * 0.25) && (
                              <p className="text-[8px] text-orange-400 font-bold italic">
                                🔒 Vui lòng trả lời câu hỏi để lật mở tối thiểu 25% nội dung ô cửa bí mật!
                              </p>
                            )}
                          </form>
                        )}
                      </div>
                    )}
 
                    {/* Treasure Hunt */}
                    {gameType === 'treasure_hunt' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-teal-500/20 text-center space-y-2">
                        <span className="text-[10px] text-cyan-400 font-black block tracking-wider mb-2 uppercase">{treasureMapTitle}</span>
                        <div className="flex flex-wrap items-center justify-between bg-slate-900 p-2.5 rounded-lg text-[10px] relative overflow-hidden gap-1.5">
                          {treasureIslands.map((island, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-slate-600 font-bold">➡️</span>}
                              <div className="flex flex-col items-center">
                                <span className={`text-xl transition-all ${idx === treasureIslandIndex ? 'text-2xl animate-bounce filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'opacity-40'}`}>
                                  {idx === treasureIslandIndex ? treasureShipIcon : (idx === 0 ? treasureStartIcon : (idx === treasureIslands.length - 1 ? treasureChestIcon : treasurePointIcon))}
                                </span>
                                <span className={`text-[8.5px] font-bold ${idx === treasureIslandIndex ? 'text-sky-300 underline' : 'text-slate-400'}`}>{island}</span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
 
                    {/* Balloon pop */}
                    {gameType === 'balloon_pop' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-sky-500/20 text-center space-y-2">
                        <span className="text-[10px] text-rose-400 uppercase font-black block">🎈 Bắn bóng kiến thức ({popBalloons.filter(b=>b.popped).length}/{balloonCount} đã nổ)</span>
                        <div className="flex flex-wrap justify-center gap-1.5 py-2">
                          {popBalloons.map((b, i) => (
                            <button
                              key={b.id}
                              disabled={b.popped}
                              onClick={() => handleBalloonClick(i)}
                              className="w-10 h-12 flex flex-col items-center justify-center rounded-b-full transition-all relative cursor-pointer active:scale-90"
                              style={{ 
                                backgroundColor: b.popped ? '#161e2e' : b.color,
                                border: b.popped ? '2px dotted #374151' : '2px solid rgba(255,255,255,0.1)'
                              }}
                            >
                              {!b.popped ? (
                                <span className="text-white font-extrabold text-[10px] select-none scale-125 animate-pulse">🎈</span>
                              ) : (
                                <span className="text-slate-600 text-[8px]">💥</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
 
                    {/* Car Racing */}
                    {gameType === 'car_racing' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/25 space-y-2 text-center">
                        <span className="text-[10px] text-pink-400 block tracking-widest font-black uppercase">🏎️ ĐƯỜNG ĐUA ĐỘI NHÓM ĐỐI KHÁNG</span>
                        
                        <div className="space-y-1.5 bg-slate-900 p-2 rounded-lg text-left text-[9.5px]">
                          <div>
                            <span className="flex justify-between">
                              <strong className="text-rose-400">🔴 Đội đỏ (Team A):</strong>
                              <span>{racingPosA}% Về đích</span>
                            </span>
                            <div className="w-full bg-slate-800 h-2 rounded mt-0.5 overflow-hidden">
                              <div className="bg-rose-500 h-full" style={{ width: `${racingPosA}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <span className="flex justify-between">
                              <strong className="text-sky-400">🔵 Đội xanh (Team B):</strong>
                              <span>{racingPosB}% Về đích</span>
                            </span>
                            <div className="w-full bg-slate-800 h-2 rounded mt-0.5 overflow-hidden">
                              <div className="bg-sky-500 h-full" style={{ width: `${racingPosB}%` }}></div>
                            </div>
                          </div>
                        </div>
 
                        <div className="bg-slate-900 p-2 rounded font-bold text-[9.5px] text-amber-400 text-center">
                          Lượt Trả Lời: <span className="underline">{activeRacingTeam === 'A' ? "Đội Đột Phá Red A" : "Đội Kiến Tạo Blue B"}</span>
                        </div>
                      </div>
                    )}
 
                    {/* Lật thẻ trí nhớ */}
                    {gameType === 'memory' && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-emerald-400 font-extrabold block">🧩 MÔ PHỎNG LẬT THẺ TRÍ NHỚ TRÙNG KHỚP</span>
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {memoryCards.map((card, idx) => (
                            <button
                              key={card.id}
                              onClick={() => handleMemoryCardClick(idx)}
                              className={`aspect-square border rounded p-1.5 text-[8.5px] font-extrabold line-clamp-3 leading-tight transition-all duration-300 ${
                                card.matched 
                                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300 opacity-45 scale-95 pointer-events-none' 
                                : card.flipped 
                                  ? 'bg-slate-850 border-orange-500 text-white font-extrabold rotate-3' 
                                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-500'
                              }`}
                            >
                              {card.flipped || card.matched ? card.text : "?"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
 
                    {/* Chiếc nón kỳ diệu */}
                    {gameType === 'magic_hat' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/20 text-center space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-yellow-400 font-extrabold uppercase">👒 CHIẾC NÓN ĐOÁN TỪ KHÓA</span>
                          <span className="bg-indigo-900 px-2 py-0.5 text-indigo-300 font-black rounded">
                            Lượt đoán: {magicHatTurnsAvailable} lượt
                          </span>
                        </div>
                        
                        {/* Word puzzle grid */}
                        <div className="flex gap-1 justify-center py-1">
                          {fortuneWord.split('').map((letter, i) => {
                            const isRevealed = fortuneRevealedLetters.includes(letter) || letter === ' ';
                            return (
                              <div key={i} className="w-7 h-9 bg-white text-slate-900 flex items-center justify-center font-black rounded text-sm border border-slate-300 shadow">
                                {isRevealed ? letter : "_"}
                              </div>
                            );
                          })}
                        </div>

                        {fortuneSolved ? (
                          <div className="p-2 bg-emerald-900/30 border border-emerald-500 text-emerald-400 font-black text-[10px] rounded animate-pulse">
                            🎉 Từ khóa chính xác là: {fortuneWord}! Bạn thật xuất sắc!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex flex-col gap-1 text-left bg-slate-900 p-2 rounded">
                              <span className="text-[9px] text-[#A78BFA] font-bold">🎯 ĐOÁN NHANH TOÀN BỘ TỪ KHÓA:</span>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={magicHatWordGuess}
                                  onChange={(e) => setMagicHatWordGuess(e.target.value.trim().toUpperCase())}
                                  placeholder="Nhập toàn bộ từ đoán..."
                                  className="flex-1 bg-slate-950 border border-slate-700 text-white rounded text-[10px] px-1.5 py-0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (magicHatWordGuess.trim() === fortuneWord.toUpperCase()) {
                                      setFortuneSolved(true);
                                      setPlayScore(s => s + 100);
                                      setFortuneRevealedLetters(fortuneWord.split(''));
                                      triggerToast("🎉 Hoàn hảo! Bạn đoán trúng từ khóa cứu cánh!");
                                      SoundEffects.playKeng();
                                    } else {
                                      triggerToast("❌ Chưa đúng, tiếp tục chơi để mở thêm chữ gợi ý!");
                                    }
                                  }}
                                  className="px-2.5 py-0.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black rounded text-[9px] cursor-pointer"
                                >
                                  Lời giải 🔑
                                </button>
                              </div>
                            </div>

                            {/* Letter picking row */}
                            <div className="space-y-1">
                              <span className="text-[8.5px] block text-slate-400 font-semibold">
                                {magicHatTurnsAvailable > 0 
                                  ? `🌟 Bạn có ${magicHatTurnsAvailable} lượt. Bấm chữ bên dưới để lật!`
                                  : "🔒 Chữ bị Khóa. Trả lời đúng câu hỏi trắc nghiệm bên dưới để lấy lượt mở chữ!"
                                }
                              </span>
                              <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                                {'A B C D E G H I K L M N O P Q R S T U V X Y'.split(' ').map((char) => (
                                  <button
                                    key={char}
                                    disabled={magicHatTurnsAvailable === 0 || fortuneRevealedLetters.includes(char) || fortuneSolved}
                                    onClick={() => {
                                      setMagicHatTurnsAvailable(prev => Math.max(0, prev - 1));
                                      handleGuessLetter(char);
                                    }}
                                    className="w-5 h-5 bg-indigo-900 border disabled:opacity-30 border-indigo-750 text-white rounded flex items-center justify-center font-extrabold text-[9px] cursor-pointer"
                                  >
                                    {char}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
 
                    {/* Olympia Kids */}
                    {gameType === 'olympia' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/20 text-center space-y-2">
                        <span className="text-[10px] text-green-400 uppercase font-black block">⛰️ CHUYÊN TRANG ĐƯỜNG LÊN ĐỈNH OLYMPIA</span>
                        
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className={olympiaRound === 'khoi_dong' ? 'text-yellow-400 font-black mb-1' : 'opacity-40'}>1. Khởi động 🚀</span>
                          <span className={olympiaRound === 'chong_ngai_vat' ? 'text-yellow-400 font-black mb-1' : 'opacity-40'}>2. Vướng CNV 🌀</span>
                          <span className={olympiaRound === 'tang_toc' ? 'text-yellow-400 font-black mb-1' : 'opacity-40'}>3. Tăng tốc ⏳</span>
                          <span className={olympiaRound === 've_dich' ? 'text-yellow-400 font-black mb-1' : 'opacity-40'}>4. Về đích 🏁</span>
                        </div>

                        <div className="bg-slate-900 p-2 rounded text-[10px] text-emerald-300 flex justify-between items-center font-bold">
                          <span>Điểm số tích lũy: {playScore} ⭐</span>
                          <button
                            type="button"
                            onClick={handleOlympiaNextRound}
                            className="bg-emerald-600 px-2 py-0.5 rounded text-white text-[9px]"
                          >
                            Lên vòng tiếp
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Hộp quà bí mật */}
                    {gameType === 'lucky_gift' && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/20 text-center space-y-2">
                        <span className="text-[10px] text-amber-500 font-black uppercase block">🎁 Lựa chọn hộp quà chứa báu vật</span>
                        <div className="flex gap-2 justify-center py-2">
                          {giftBoxes.map((g, i) => (
                            <button
                              key={g.id}
                              disabled={g.opened}
                              onClick={() => handleOpenGiftBox(i)}
                              className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg relative cursor-pointer active:scale-95 duration-200 border-2 ${
                                g.opened 
                                ? 'bg-orange-950/20 border-amber-900 text-[10px] text-amber-400' 
                                : 'bg-red-800 border-red-500 hover:border-yellow-400'
                              }`}
                            >
                              {g.opened ? g.reward.substring(0, 4) : "🎁"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    </div>

                    {/* Right Column: Quiz Question and Answers / Dynamic Placeholder warnings */}
                    <div className="lg:col-span-7 space-y-4 lg:border-l lg:border-white/10 lg:pl-4">

                    {/* Standard question card during challenges */}
                    {activeGridChoice !== null || activeBalloonIdx !== null || activeGiftIdx !== null || ['lucky_wheel', 'millionaire', 'treasure_hunt', 'car_racing', 'magic_hat', 'olympia'].includes(gameType) ? (
                      quizQuestions[activePlayIndex] ? (
                        <div className="space-y-3 pt-2 border-t border-slate-800">
                          <div className="flex justify-between items-center text-gray-500 text-[9.5px]">
                            <span>Câu Hỏi Số {activePlayIndex + 1}</span>
                            <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded">Thời gian: {timeLimit}s</span>
                          </div>
                          
                          <p className="font-extrabold leading-relaxed" style={{ color: questionColor }}>
                            {quizQuestions[activePlayIndex].question}
                          </p>

                          <div className="grid grid-cols-1 gap-1.5">
                            {quizQuestions[activePlayIndex].options.map((opt, oidx) => {
                              if (hiddenOptions.includes(oidx)) return <div key={oidx} className="h-8 opacity-5"></div>;
                              
                              let cl = 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800';
                              if (selectedAns !== null) {
                                if (oidx === quizQuestions[activePlayIndex].correctAnswer) {
                                  cl = 'bg-emerald-900 border-emerald-500 text-emerald-200 font-bold';
                                } else if (selectedAns === oidx) {
                                  cl = 'bg-rose-900 border-rose-500 text-rose-200 font-bold';
                                } else {
                                  cl = 'bg-slate-950/50 text-slate-500 border-slate-950 opacity-40';
                                }
                              }

                              return (
                                <button
                                  key={oidx}
                                  disabled={selectedAns !== null}
                                  onClick={() => handleSelectLocalAns(oidx)}
                                  className={`w-full text-left px-2.5 py-2 border rounded-xl text-[10px] leading-relaxed transition ${cl}`}
                                  style={selectedAns === null ? { color: answerColor } : undefined}
                                >
                                  {['A','B','C','D'][oidx]}. {opt}
                                </button>
                              );
                            })}
                          </div>

                          {selectedAns !== null && (
                            <div className="flex justify-between items-end pt-2 border-t border-slate-850">
                              <span className={`font-black text-[9.5px] ${selectedAns === quizQuestions[activePlayIndex].correctAnswer ? 'text-emerald-400':'text-rose-400'}`}>
                                {selectedAns === quizQuestions[activePlayIndex].correctAnswer ? "✓ CHÍNH XÁC YÊU CẦU":"❌ CHƯA CHÍNH XÁC"}
                              </span>
                              <button
                                onClick={handleNextLocalQ}
                                className="px-3 py-1.5 bg-white text-slate-950 font-black rounded-lg text-[10px]"
                              >
                                Tiếp theo ➜
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center rounded-2xl bg-rose-950/20 border border-rose-900/40">
                          <p className="text-xs font-black text-rose-400">⚠️ Danh sách câu hỏi trống!</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">Vui lòng quay lại biên soạn thêm ít nhất 1 câu hỏi.</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        {gameType === 'secret_grid' && (
                          <div className="p-5 text-center text-slate-300 font-extrabold text-xs bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/30">
                            🔒 Vui lòng nhấp chọn lật 1 ô cửa chưa mở ở bên trái để hiển thị thử thách học hỏi!
                          </div>
                        )}
                        {gameType === 'balloon_pop' && (
                          <div className="p-5 text-center text-slate-300 font-extrabold text-xs bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/30">
                            🎈 Hãy chọn bắn hoặc bóp nổ 1 quả bong bóng bất kỳ ở bên trái để nhận câu hỏi!
                          </div>
                        )}
                        {gameType === 'lucky_gift' && (
                          <div className="p-5 text-center text-[#93c5fd] font-extrabold text-xs bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/30">
                            🎁 Hãy chọn mở 1 hộp quà sắc màu may mắn phía bên trái!
                          </div>
                        )}
                        {!['secret_grid', 'balloon_pop', 'lucky_gift'].includes(gameType) && "Hãy thực hiện tương tác!"}
                      </div>
                    )}

                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-4">
                  <span className="text-4xl select-none animate-pulse">🎪🏁🎈🏆🎡</span>
                  <div>
                    <h5 className="font-extrabold text-slate-300 text-[11px]">Bấm nút bắt đầu chạy thử</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                      Nhấn nút <strong className="text-orange-400 font-black">Chạy thử Game (Preview)</strong> phía trái để mô phỏng toàn bộ hoạt động của học sinh ngay trên hệ thống.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Step 3: Xuất bản và Slide */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handlePlayTest}
              className="flex-1 py-3 bg-[#3b82f6] hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow border-b-4 border-blue-900 active:border-0"
            >
              <Play className="w-4 h-4" />
              Chạy thử ngay (Playground) 🕹️
            </button>
            <button
              type="button"
              onClick={handleExportHTML}
              className="flex-1 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow border-b-4 border-emerald-800 active:border-0"
            >
              <Download className="w-4 h-4" />
              Xuất tệp game HTML5 📦
            </button>
          </div>

          {/* Background images catalog / selector */}
          <div className="bg-white border border-slate-200 p-5 rounded-[28px] shadow-sm space-y-4 text-left font-sans">
            <span className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5 border-b pb-2">
              <ImageIcon className="w-4 h-4 text-orange-500 animate-pulse" />
              Giao diện chọn Nền trò chơi học tập
            </span>
            <p className="text-[10px] text-gray-500 leading-normal">
              Lựa chọn phong cách thẩm mỹ cho trò chơi. Phông nền đã chọn sẽ áp dụng vào phòng chơi trực tiếp và tệp game HTML5 xuất bản.
            </p>

            {/* Grid of presets */}
            <div className="grid grid-cols-2 gap-2">
              {backgroundsCatalog.map((bg) => (
                <div
                  key={bg.id}
                  onClick={() => { setSelectedBackgroundId(bg.id); SoundEffects.playTing(); }}
                  className={`relative p-2 rounded-xl border-2 cursor-pointer text-left transition-all ${
                    selectedBackgroundId === bg.id
                      ? 'border-orange-500 bg-orange-50/10'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-slate-700 block truncate max-w-[80px]">{bg.name}</span>
                    {bg.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteBg(bg.id, e)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        title="Xoá nền này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 h-6 w-full rounded border border-slate-200 overflow-hidden flex items-center justify-center text-[8px] font-black text-white">
                    {bg.isCustom ? (
                      <img src={bg.value} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`w-full h-full ${bg.value}`} />
                    )}
                  </div>
                </div>
              ))}
              <div
                key="custom_solid"
                onClick={() => { setSelectedBackgroundId('custom_solid'); SoundEffects.playTing(); }}
                className={`relative p-2 rounded-xl border-2 cursor-pointer text-left transition-all ${
                  selectedBackgroundId === 'custom_solid'
                    ? 'border-orange-500 bg-orange-50/10'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-slate-700 block truncate">🎨 Màu tự chọn</span>
                </div>
                <div
                  style={{ backgroundColor: customBgColor }}
                  className="mt-1 h-6 w-full rounded border border-slate-200 overflow-hidden"
                />
              </div>
            </div>

            {/* Text color and custom solid color picking */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 mt-2 text-left">
              <span className="font-extrabold text-slate-800 text-[10px] block border-b pb-1">🎨 Tùy chỉnh Phông nền & Màu chữ Trò chơi</span>
              <div className="grid grid-cols-1 gap-2.5 text-[9.5px]">
                <div>
                  <label className="block mb-0.5 font-bold text-gray-500">Màu phông nền</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => {
                        setCustomBgColor(e.target.value);
                        setSelectedBackgroundId('custom_solid');
                      }}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                    />
                    <input
                      type="text"
                      value={customBgColor}
                      onChange={(e) => {
                        setCustomBgColor(e.target.value);
                        setSelectedBackgroundId('custom_solid');
                      }}
                      className="w-full text-[9px] font-mono p-1 border border-slate-200 rounded text-center bg-white text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-0.5 font-bold text-gray-500">Màu chữ Câu hỏi</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={questionColor}
                      onChange={(e) => setQuestionColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                    />
                    <input
                      type="text"
                      value={questionColor}
                      onChange={(e) => setQuestionColor(e.target.value)}
                      className="w-full text-[9px] font-mono p-1 border border-slate-200 rounded text-center bg-white text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-0.5 font-bold text-gray-500">Màu chữ Đáp án</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={answerColor}
                      onChange={(e) => setAnswerColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                    />
                    <input
                      type="text"
                      value={answerColor}
                      onChange={(e) => setAnswerColor(e.target.value)}
                      className="w-full text-[9px] font-mono p-1 border border-slate-200 rounded text-center bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admin-only Upload feature */}
            {isAdmin && (
              <div className="bg-orange-50/10 border border-orange-200 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1 font-extrabold text-[10px] text-orange-700">
                  <Upload className="w-3.5 h-3.5 mt-0.5 animate-bounce" />
                  QUẢN TRỊ VIÊN: TẢI LÊN NỀN MẶC ĐỊNH MỚI
                </div>
                <p className="text-[9.5px] text-gray-500 leading-relaxed">
                  Tải lên nền mặc định (PNG/JPG) làm tài nguyên chung cho cả trường.
                </p>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Tên phông nền (Ví dụ: Giáng Sinh 🎄)"
                    value={newBgName}
                    onChange={(e) => setNewBgName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-[9.5px] bg-white font-semibold text-slate-800"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdminBgUpload}
                    className="w-full text-[9px] text-gray-400 bg-white border border-slate-100 rounded-lg p-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBg}
                    className="w-full py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-lg text-[10px] shadow-sm cursor-pointer"
                  >
                    Tải lên 🚀
                  </button>
                </div>
                {newBgFile && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500">Xem trước:</span>
                    <img src={newBgFile} className="h-8 w-16 object-cover rounded border border-slate-200" alt="" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl text-[9px] text-slate-400 leading-normal border border-slate-850">
            📌 <strong>Mẹo tích hợp PowerPoint:</strong> Copy tệp HTML5 hoặc kéo slide PPTX tải về chèn thẳng vào slide bằng thẻ nạp <span className="text-white font-mono font-bold">Developer {"→"} Web Browser</span> để đồng bộ mượt mà!
          </div>

        </div>

      </div>

    </div>
  );
}
