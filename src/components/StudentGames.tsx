import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Clock, 
  Car, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw, 
  Trophy, 
  Play,
  MousePointer,
  Keyboard,
  Upload
} from 'lucide-react';
import { INITIAL_QUESTIONS, Question, Game } from '../types';

const RufflePlayerContainer = ({ swfFile, title }: { swfFile: string; title: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    let playerInstance: any = null;

    const initRuffle = async () => {
      try {
        // 1. Check for local file:// protocol which breaks Flash simulation due to browser security boundaries
        if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
          throw new Error('Bạn đang chạy ứng dụng trực tiếp bằng giao thức file:// (nhấp đúp chuột trực tiếp vào file index.html từ ổ đĩa cứng). Trình duyệt của bạn sẽ chặn tải các thành phần mô phỏng Flash giả lập (.wasm / Ruffle) và chặn đọc các tệp cục bộ vì lý do bảo mật. Vui lòng khởi chạy ứng dụng thông qua một máy chủ web (ví dụ: dùng Vite, chạy lệnh "npm run dev", hoặc tải toàn bộ thư mục lên hosting) để chơi trò chơi bình thường!');
        }

        // 2. Ensure ruffle script is loaded
        if (!(window as any).RufflePlayer) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@ruffle-rs/ruffle';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Không thể kết nối đến máy chủ thư viện Flash Player Ruffle. Vui lòng kiểm tra kết nối mạng Internet của thiết bị.'));
            document.head.appendChild(script);
          });
        }

        if (!active) return;

        // 3. Instantiate ruffle player
        const ruffle = (window as any).RufflePlayer.newest();
        const player = ruffle.createPlayer();
        playerInstance = player;

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(player);
          player.style.width = '100%';
          player.style.height = '100%';
          
          if (swfFile.startsWith('blob:') || swfFile.startsWith('data:')) {
            try {
              const response = await fetch(swfFile);
              const arrayBuffer = await response.arrayBuffer();
              await player.load({
                data: arrayBuffer,
                allowScriptAccess: true,
                autoplay: "on",
                backgroundColor: "#0f172a"
              });
            } catch (fetchErr) {
              console.warn('Fallback loading URL directly due to fetch error:', fetchErr);
              await player.load({
                url: swfFile,
                allowScriptAccess: true,
                autoplay: "on",
                backgroundColor: "#0f172a"
              });
            }
          } else {
            await player.load({
              url: swfFile,
              allowScriptAccess: true,
              autoplay: "on",
              backgroundColor: "#0f172a"
            });
          }
          setIsReady(true);
        }
      } catch (err: any) {
        console.error('Ruffle init error:', err);
        setLoadError(err.message || 'Lỗi khởi dựng file SWF.');
      }
    };

    initRuffle();

    return () => {
      active = false;
      if (playerInstance && playerInstance.parentNode) {
        playerInstance.parentNode.removeChild(playerInstance);
      }
    };
  }, [swfFile]);

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
      <div ref={containerRef} className="w-full h-full" />
      {!isReady && !loadError && (
        <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center bg-slate-900/95 text-white p-4 z-10">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-xs font-bold font-mono animate-pulse">⚡ ĐANG KHỞI CHẠY TRÌNH GIẢ LẬP FLASH RUFFLE...</span>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/90 text-rose-150 p-6 text-center z-10">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="font-extrabold text-sm mb-2">Trình giả lập Flash Ruffle gặp sự cố</p>
          <p className="text-xs text-rose-300 font-semibold mb-4 leading-relaxed max-w-md">{loadError}</p>
          <a
            href={swfFile}
            download={title.replace(/\s+/g, '_') + '.swf'}
            className="bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            📥 Tải file .SWF về máy tính để chơi
          </a>
        </div>
      )}
    </div>
  );
};

interface StudentGamesProps {
  onUpdateXP: (earnedXP: number, taskName: string) => void;
  gamesList: Game[];
  activeSubject?: string;
  setActiveSubject?: (subj: string) => void;
  activeGrade?: number;
}

export default function StudentGames({ 
  onUpdateXP, 
  gamesList,
  activeSubject = 'tin_hoc',
  setActiveSubject,
  activeGrade = 3
}: StudentGamesProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeCustomGame, setActiveCustomGame] = useState<Game | null>(null);

  const isGrade3Locked = activeGrade === 3;
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number>(activeGrade);

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

  useEffect(() => {
    const handleSync = () => {
      try {
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

  useEffect(() => {
    if (activeGrade) {
      setSelectedGradeFilter(activeGrade);
    }
  }, [activeGrade]);

  useEffect(() => {
    if (activeSubject === 'tin_hoc' && selectedGradeFilter < 3) {
      setSelectedGradeFilter(3);
    }
  }, [activeSubject, selectedGradeFilter]);

  const activeGradeFilterId = isGrade3Locked ? 3 : selectedGradeFilter;

  const getQuizPool = () => {
    const pool = INITIAL_QUESTIONS.filter(q => q.gameType === 'quiz' && (q.subject === activeSubject || !q.subject));
    return pool.length > 0 ? pool : INITIAL_QUESTIONS.filter(q => q.gameType === 'quiz');
  };

  // 1. MEMORY MATCH CARDS STATE
  const [cards, setCards] = useState<{ id: number; emoji: string; matched: boolean; flipped: boolean; matchId: string }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryFinished, setMemoryFinished] = useState(false);

  // 2. SPEED QUIZ STATE
  const [speedQuestions, setSpeedQuestions] = useState<Question[]>([]);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(20);
  const [speedFinished, setSpeedFinished] = useState(false);
  const [speedAnsSelected, setSpeedAnsSelected] = useState<string | null>(null);

  // 3. WHO WANTS TO BE A MILLIONAIRE STATE
  const [millionIndex, setMillionIndex] = useState(0);
  const [millionFinished, setMillionFinished] = useState(false);
  const [millionScore, setMillionScore] = useState(0);
  const [millionAnsSelected, setMillionAnsSelected] = useState<string | null>(null);
  const [millionIsCorrect, setMillionIsCorrect] = useState<boolean | null>(null);

  // 4. LUCKY WHEEL SPIN STATE
  const [wheelDegree, setWheelDegree] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // 5. RACING CAR STATE (Dua xe Tin hoc!)
  const [carX, setCarX] = useState(50); // percentage position 0 - 100
  const [roadObjects, setRoadObjects] = useState<{ id: number; name: string; emoji: string; isCorrect: boolean; top: number; x: number }[]>([]);
  const [racingScore, setRacingScore] = useState(0);
  const [racingFinished, setRacingFinished] = useState(false);

  // 6. MOUSE PRACTICE STATE
  const [mouseScore, setMouseScore] = useState(0);
  const [mouseTimeLeft, setMouseTimeLeft] = useState(30);
  const [mouseFinished, setMouseFinished] = useState(false);
  const [mouseTargets, setMouseTargets] = useState<{ id: number; x: number; y: number; type: 'click' | 'double_click' | 'hover'; emoji: string; text: string; bg: string }[]>([]);

  // 7. KEYBOARD PRACTICE STATE
  const [keyboardScore, setKeyboardScore] = useState(0);
  const [keyboardTimeLeft, setKeyboardTimeLeft] = useState(30);
  const [keyboardFinished, setKeyboardFinished] = useState(false);
  const [keyboardKeys, setKeyboardKeys] = useState<{ id: number; char: string; x: number; y: number; color: string; speed: number }[]>([]);

  // Start Mouse Game Helper
  const startMouseGame = () => {
    setMouseScore(0);
    setMouseTimeLeft(30);
    setMouseFinished(false);
    setMouseTargets([]);
    setActiveGame('mouse_practice');
  };

  // Start Keyboard Game Helper
  const startKeyboardGame = () => {
    setKeyboardScore(0);
    setKeyboardTimeLeft(30);
    setKeyboardFinished(false);
    setKeyboardKeys([]);
    setActiveGame('keyboard_practice');
  };

  // Mouse game timers and spawners
  useEffect(() => {
    let timer: any;
    let spawner: any;
    if (activeGame === 'mouse_practice' && !mouseFinished) {
      // Countdown timer
      timer = setInterval(() => {
        setMouseTimeLeft(prev => {
          if (prev <= 1) {
            setMouseFinished(true);
            onUpdateXP(30, 'Vượt thử thách luyện chuột Nhanh tay lẹ mắt');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Target spawner interval
      spawner = setInterval(() => {
        setMouseTargets(prev => {
          if (prev.length >= 6) return prev;
          const MOUSE_SYMBOLS = [
            { emoji: '🖱️', text: 'Nhấp chuột', type: 'click' as const, bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-400 text-indigo-700' },
            { emoji: '⌨️', text: 'Nhấp đúp!', type: 'double_click' as const, bg: 'bg-red-50 hover:bg-red-100 border-red-400 text-red-700 font-extrabold' },
            { emoji: '🖥️', text: 'Rê chuột', type: 'hover' as const, bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-700' },
            { emoji: '💾', text: 'Nhấp chuột', type: 'click' as const, bg: 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-700' },
            { emoji: '💡', text: 'Nhấp đúp!', type: 'double_click' as const, bg: 'bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-400 text-fuchsia-700 font-extrabold' },
            { emoji: '🔌', text: 'Rê chuột', type: 'hover' as const, bg: 'bg-teal-50 hover:bg-teal-100 border-teal-400 text-teal-700' },
          ];
          const choice = MOUSE_SYMBOLS[Math.floor(Math.random() * MOUSE_SYMBOLS.length)];
          return [...prev, {
            id: Date.now() + Math.random(),
            x: 5 + Math.random() * 80, // 5% to 85%
            y: 10 + Math.random() * 70, // 10% to 80%
            type: choice.type,
            emoji: choice.emoji,
            text: choice.text,
            bg: choice.bg,
          }];
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [activeGame, mouseFinished]);

  // Keyboard game timers and spawners & event handlers
  useEffect(() => {
    let timer: any;
    let mover: any;
    let spawner: any;

    if (activeGame === 'keyboard_practice' && !keyboardFinished) {
      // Countdown timer
      timer = setInterval(() => {
        setKeyboardTimeLeft(prev => {
          if (prev <= 1) {
            setKeyboardFinished(true);
            onUpdateXP(30, 'Vượt thử thách luyện phím Người hùng bàn phím');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Key movement ticker (every 120ms)
      mover = setInterval(() => {
        setKeyboardKeys(prev => 
          prev.map(k => ({ ...k, y: k.y + k.speed })).filter(k => k.y < 92)
        );
      }, 120);

      // Spawner ticker (every 1.1s)
      spawner = setInterval(() => {
        const chars = 'ASDFJKLQWERTYUIOPZXCVBNM';
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        const colors = [
          'bg-rose-500 border-rose-600 shadow-rose-300 text-white',
          'bg-sky-500 border-sky-600 shadow-sky-300 text-white',
          'bg-emerald-500 border-emerald-600 shadow-emerald-300 text-white',
          'bg-amber-500 border-amber-600 shadow-amber-300 text-gray-800',
          'bg-purple-500 border-purple-600 shadow-purple-300 text-white',
          'bg-indigo-500 border-indigo-600 shadow-indigo-300 text-white',
          'bg-pink-500 border-pink-600 shadow-pink-300 text-white'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setKeyboardKeys(prev => {
          if (prev.length >= 8) return prev;
          return [...prev, {
            id: Date.now() + Math.random(),
            char: randomChar,
            x: 8 + Math.random() * 80,
            y: 0,
            color: randomColor,
            speed: 2.5 + Math.random() * 3, // speed of falling
          }];
        });
      }, 1100);

      // Physical keyboard typing event listener
      const handlePhysicalKey = (e: KeyboardEvent) => {
        const pressedChar = e.key.toUpperCase();
        setKeyboardKeys(prev => {
          // Find lowest active matching key on screen
          const match = [...prev]
            .filter(k => k.char === pressedChar)
            .sort((a, b) => b.y - a.y)[0];
          if (match) {
            setKeyboardScore(sc => sc + 1);
            onUpdateXP(3, `Gõ đúng phím: ${pressedChar}`);
            return prev.filter(k => k.id !== match.id);
          }
          return prev;
        });
      };

      window.addEventListener('keydown', handlePhysicalKey);
      return () => {
        clearInterval(timer);
        clearInterval(mover);
        clearInterval(spawner);
        window.removeEventListener('keydown', handlePhysicalKey);
      };
    }
  }, [activeGame, keyboardFinished]);

  const handleInteractMouseTarget = (targetId: number, type: 'click' | 'double_click' | 'hover') => {
    setMouseScore(s => s + 1);
    onUpdateXP(3, `Luyện chuột thành công: ${type === 'click' ? 'Click' : type === 'double_click' ? 'Click Đúp' : 'Rê chuột'}`);
    setMouseTargets(prev => prev.filter(t => t.id !== targetId));
  };

  // Load Speed questions once selected
  const startSpeedQuiz = () => {
    const pool = getQuizPool();
    setSpeedQuestions(pool);
    setSpeedIndex(0);
    setSpeedScore(0);
    setSpeedTimer(20);
    setSpeedFinished(false);
    setSpeedAnsSelected(null);
    setActiveGame('speed_quiz');
  };

  useEffect(() => {
    let timer: any;
    if (activeGame === 'speed_quiz' && !speedFinished) {
      if (speedTimer > 0) {
        timer = setTimeout(() => setSpeedTimer(prev => prev - 1), 1000);
      } else {
        // Next or finish due to timeout
        handleNextSpeedQuestion();
      }
    }
    return () => clearTimeout(timer);
  }, [speedTimer, activeGame, speedFinished]);

  const handleSpeedAnswerSelect = (opt: string) => {
    if (speedAnsSelected) return;
    setSpeedAnsSelected(opt);
    const currQ = speedQuestions[speedIndex];
    if (opt === currQ.correctAnswer) {
      setSpeedScore(prev => prev + 1);
      onUpdateXP(10, 'Trả lời đúng 1 câu Speed Quiz');
    }
  };

  const handleNextSpeedQuestion = () => {
    setSpeedAnsSelected(null);
    setSpeedTimer(20);
    if (speedIndex + 1 < speedQuestions.length) {
      setSpeedIndex(prev => prev + 1);
    } else {
      setSpeedFinished(true);
      onUpdateXP(30, 'Hoàn thành đấu trường Speed Quiz');
    }
  };

  // Memory card initialize
  const startMemoryGame = () => {
    const list = [
      { emoji: '🖥️ Màn hình', matchId: 'A' },
      { emoji: 'Chuột vẽ 🖱️', matchId: 'B' },
      { emoji: 'Phím gõ ⌨️', matchId: 'C' },
      { emoji: 'CPU Não ⚙️', matchId: 'D' },
      { emoji: 'Dùng để hiển thị', matchId: 'A' },
      { emoji: 'Dùng để di chuyển click', matchId: 'B' },
      { emoji: 'Dùng gõ chữ số', matchId: 'C' },
      { emoji: 'Tính toán dữ liệu', matchId: 'D' },
    ];
    // Shuffling
    const shuffled = list
      .map((item, idx) => ({ ...item, id: idx, matched: false, flipped: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setSelectedCards([]);
    setMemoryFinished(false);
    setActiveGame('memory_cards');
  };

  const handleCardClick = (id: number) => {
    if (selectedCards.length >= 2 || cards[id].flipped || cards[id].matched) return;

    // flip current
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const first = cards[newSelected[0]];
      const second = cards[id];

      if (first.matchId === second.matchId) {
        // Matched
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === newSelected[0] || c.id === id ? { ...c, matched: true } : c
          ));
          setSelectedCards([]);
          // Check complete
          const isAllCompleted = cards.every(c => 
            c.id === newSelected[0] || c.id === id ? true : c.matched
          );
          if (isAllCompleted) {
            setMemoryFinished(true);
            onUpdateXP(40, 'Vượt ải trò chơi ghép cặp Trí Nhớ');
          }
        }, 500);
      } else {
        // Discrepancy, flip back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === newSelected[0] || c.id === id ? { ...c, flipped: false } : c
          ));
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  // Millionaire game controllers
  const startMillionaire = () => {
    setMillionIndex(0);
    setMillionFinished(false);
    setMillionScore(0);
    setMillionAnsSelected(null);
    setMillionIsCorrect(null);
    setActiveGame('millionaire');
  };

  const handleMillionAnswer = (opt: string) => {
    if (millionAnsSelected) return;
    setMillionAnsSelected(opt);
    const pool = getQuizPool();
    const currQ = pool[millionIndex];
    const correct = opt === currQ.correctAnswer;
    setMillionIsCorrect(correct);
    if (correct) {
      setMillionScore(prev => prev + 1);
      onUpdateXP(15, 'Trắc nghiệm triệu phú nhí đúng');
    }
  };

  const handleNextMillion = (poolLength: number) => {
    setMillionAnsSelected(null);
    setMillionIsCorrect(null);
    if (millionIndex + 1 < poolLength) {
      setMillionIndex(prev => prev + 1);
    } else {
      setMillionFinished(true);
      onUpdateXP(50, 'Chúc mừng chinh phục cúp Ai là triệu phú!');
    }
  };

  // Lucky wheel spin
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelResult(null);
    
    // Choose random reward
    const rewards = [
      'Cúp Đồng 🥉 và +10 ⭐',
      'Cúp Bạc 🥈 và +20 ⭐',
      'Mèo Con May Mắn 🐱 và +30 ⭐',
      'Cúp Vàng 🥇 và +50 ⭐',
      'Cơ Hội Học Bài 📚 và +10 ⭐',
      'Duy Trì Streak 🔥 và +15 ⭐'
    ];
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const addedDegrees = 1800 + randomIndex * (360 / rewards.length);

    setWheelDegree(prev => prev + addedDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      const res = rewards[randomIndex];
      setWheelResult(res);
      // Give points
      const pointsMap: { [key: number]: number } = { 0: 10, 1: 20, 2: 30, 3: 50, 4: 10, 5: 15 };
      onUpdateXP(pointsMap[randomIndex] || 10, `Lượt quay may mắn: ${res}`);
    }, 4000);
  };

  // Racing Car setup (Dua xe Tin hoc). Drive car safely by avoiding false components!
  const startRacing = () => {
    setCarX(50);
    setRacingScore(0);
    setRacingFinished(false);
    // Create random components blocks
    setRoadObjects([
      { id: 1, name: 'Chuột máy tính', emoji: '🖱️', isCorrect: true, top: 20, x: 20 },
      { id: 2, name: 'Bánh mỳ ngọt', emoji: '🍞', isCorrect: false, top: 40, x: 50 },
      { id: 3, name: 'Bàn phím nhảy', emoji: '⌨️', isCorrect: true, top: 60, x: 80 },
      { id: 4, name: 'Quả dưa hấu', emoji: '🍉', isCorrect: false, top: 80, x: 40 }
    ]);
    setActiveGame('racing');
  };

  const handleCollectRoadObj = (obj: any) => {
    // Check hit logic
    if (obj.isCorrect) {
      setRacingScore(prev => prev + 1);
      onUpdateXP(20, `Chú xe đua nhặt trúng thiết bị Tin Học: ${obj.name}`);
    } else {
      alert(`⚠️ Ối! Bạn nhặt nhầm quả/đồ ăn "${obj.name}" rồi. Đây không phải linh kiện Tin học nhé!`);
    }
    // Remove object
    setRoadObjects(prev => prev.filter(item => item.id !== obj.id));
    if (roadObjects.length <= 1) {
      setRacingFinished(true);
      onUpdateXP(30, 'Hoàn thành đường đua CS Racing');
    }
  };

  const handlePlayGame = (game: Game) => {
    if (game.builtinKey) {
      if (game.builtinKey === 'mouse_practice') {
        startMouseGame();
      } else if (game.builtinKey === 'keyboard_practice') {
        startKeyboardGame();
      } else if (game.builtinKey === 'memory_cards') {
        startMemoryGame();
      } else if (game.builtinKey === 'speed_quiz') {
        startSpeedQuiz();
      } else if (game.builtinKey === 'millionaire') {
        startMillionaire();
      } else if (game.builtinKey === 'lucky_wheel') {
        setActiveGame('lucky_wheel');
      } else if (game.builtinKey === 'racing') {
        startRacing();
      }
    } else {
      setActiveGame(game.id);
      setActiveCustomGame(game);
    }
  };

  const getGameEmoji = (game: Game) => {
    if (game.builtinKey === 'memory_cards') return '🧩';
    if (game.builtinKey === 'speed_quiz') return '⏱️';
    if (game.builtinKey === 'millionaire') return '🏆';
    if (game.builtinKey === 'lucky_wheel') return '🎡';
    if (game.builtinKey === 'racing') return '🏎️';
    if (game.category === 'Trò chơi luyện chuột') return '🖱️';
    if (game.category === 'Trò chơi luyện phím') return '⌨️';
    return '🎮';
  };

  // Filter games based on subject and grade
  const displayedGames = (gamesList || []).filter(g => {
    // legacy or undefined subject defaults to 'tin_hoc'
    const gameSub = g.subject || 'tin_hoc';
    const isSubMatch = gameSub === activeSubject;
    const isGradeMatch = g.grade === undefined || g.grade === activeGradeFilterId;
    return isSubMatch && isGradeMatch && g.status === 'Đang hoạt động';
  });

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Top Banner introducing gamified zones */}
      <div className="bg-[#2454A6] text-white p-6 rounded-[28px] shadow-sm border-b-6 border-[#1e468a] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="bg-orange-500 text-xs px-3 py-1 rounded-full font-black uppercase inline-block animate-bounce mb-1">
            Đấu Trường Trò Chơi 🎮
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wide font-title" style={{ fontFamily: 'var(--font-title)' }}>
            CHƠI GAME HAY - RINH ⭐ KHỦNG!
          </h2>
          <p className="text-xs md:text-sm text-blue-100 font-bold max-w-xl">
            Vừa chơi vừa học giúp em thuộc lòng các linh thuật Scratch, thiết bị máy tính, mạng Internet dễ dàng. Mỗi bài chơi đều giúp em tích luỹ điểm thưởng cực cao!
          </p>
        </div>
        <span className="text-4xl md:text-5xl select-none">⚡🎯</span>
      </div>

      {/* Breadcrumb & Subcategory: Mục con các môn học "Trò chơi" */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b-2 border-gray-150 pb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-extrabold uppercase select-none">
          <span>SÂN CHƠI TRÒ CHƠI</span>
          <span className="text-gray-300">/</span>
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
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-[#2454A6]'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade filter switches similar to StudentLessons */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-5 rounded-[24px] shadow-sm border-b-4 border-gray-100">
        <div className="flex items-center gap-2.5 bg-blue-50/50 border border-blue-100 px-4.5 py-3 rounded-2xl text-[#1E40AF] text-sm font-black w-full lg:w-auto select-none">
          <span className="text-xl">🏆</span>
          <span>Học Trình Trò Chơi Lớp {activeGradeFilterId}</span>
        </div>

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
                title={isDisabled ? 'Nội dung đã khóa vì bạn thuộc Khối lớp 3' : `Xem trò chơi Lớp ${gradeNum}`}
              >
                {isDisabled && <span className="text-xs">🔒</span>}
                <span>Lớp {gradeNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!activeGame ? (
        <div className="space-y-10">
          {activeSubject === 'tin_hoc' ? (
            <div className="space-y-10">
              {/* COMPARTMENT 1: mouse */}
              {displayedGames.some(g => g.category === 'Trò chơi luyện chuột') && (
                <div className="rounded-3xl p-6 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-blue-50/20 space-y-4">
                  <div className="border-b pb-2.5 border-indigo-250 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="font-extrabold text-[#2454A6] text-base sm:text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
                        🖱️ Trò chơi luyện Chuột
                      </h4>
                      <p className="text-[11px] text-gray-500 font-bold mt-0.5">Rèn luyện phản xạ liên quan đến Click đơn, Double-click và rê chuột khéo léo!</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedGames.filter(g => g.category === 'Trò chơi luyện chuột').map(g => (
                      <div key={g.id} className="bg-white rounded-[24px] overflow-hidden shadow-md border-3 border-indigo-200 flex flex-col justify-between hover:translate-y-[-5px] transition duration-300">
                        <div className="p-5 space-y-3">
                          <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-2xl">
                            {getGameEmoji(g)}
                          </div>
                          <h3 className="text-lg font-black text-gray-800 uppercase line-clamp-1" style={{ fontFamily: 'var(--font-title)' }}>
                            {g.title}
                          </h3>
                          <p className="text-xs font-semibold text-gray-500 leading-relaxed line-clamp-3">
                            {g.description || 'Chưa cập nhật mô tả chi tiết cho trò chơi này.'}
                          </p>
                          <div className="flex items-center gap-1 bg-amber-50 rounded-xl px-2.5 py-1 w-fit text-[10px] font-black text-amber-700 border border-amber-200">
                            Phần thưởng: {g.reward} ⭐
                          </div>
                        </div>
                        <div className="p-4 bg-indigo-50 border-t border-indigo-100">
                          <button 
                            onClick={() => handlePlayGame(g)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl uppercase transition shadow-sm cursor-pointer"
                          >
                            Chơi ngay ▶️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPARTMENT 2: keyboard */}
              {displayedGames.some(g => g.category === 'Trò chơi luyện phím') && (
                <div className="rounded-3xl p-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/20 space-y-4">
                  <div className="border-b pb-2.5 border-emerald-250 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="font-extrabold text-emerald-800 text-base sm:text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
                        ⌨️ Trò chơi luyện Phím
                      </h4>
                      <p className="text-[11px] text-gray-500 font-bold mt-0.5">Luyện gõ bàn phím tốc độ cao, gõ chữ chính xác rèn luyện nhanh tay lẹ mắt!</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedGames.filter(g => g.category === 'Trò chơi luyện phím').map(g => (
                      <div key={g.id} className="bg-white rounded-[24px] overflow-hidden shadow-md border-3 border-emerald-200 flex flex-col justify-between hover:translate-y-[-5px] transition duration-300">
                        <div className="p-5 space-y-3">
                          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-2xl">
                            {getGameEmoji(g)}
                          </div>
                          <h3 className="text-lg font-black text-gray-800 uppercase line-clamp-1" style={{ fontFamily: 'var(--font-title)' }}>
                            {g.title}
                          </h3>
                          <p className="text-xs font-semibold text-gray-500 leading-relaxed line-clamp-3">
                            {g.description || 'Chưa cập nhật mô tả chi tiết cho trò chơi này.'}
                          </p>
                          <div className="flex items-center gap-1 bg-amber-50 rounded-xl px-2.5 py-1 w-fit text-[10px] font-black text-amber-700 border border-amber-200">
                            Phần thưởng: {g.reward} ⭐
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50 border-t border-emerald-100">
                          <button 
                            onClick={() => handlePlayGame(g)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl uppercase transition shadow-sm cursor-pointer"
                          >
                            Chơi ngay ▶️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPARTMENT 3: general practice */}
              {displayedGames.some(g => g.category === 'Trò chơi luyện tập') && (
                <div className="rounded-3xl p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/20 space-y-4">
                  <div className="border-b pb-2.5 border-orange-255 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="font-extrabold text-orange-850 text-base sm:text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
                        📚 Trò chơi luyện tập Tổng hợp
                      </h4>
                      <p className="text-[11px] text-gray-500 font-bold mt-0.5">Các đấu trường tư duy tổng hợp: Ghép linh kiện, trắc nghiệm nhanh, triệu phú bộc phá sao vàng!</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedGames.filter(g => g.category === 'Trò chơi luyện tập').map(g => (
                      <div key={g.id} className="bg-white rounded-[24px] overflow-hidden shadow-md border-3 border-orange-200 flex flex-col justify-between hover:translate-y-[-5px] transition duration-300">
                        <div className="p-5 space-y-3">
                          <div className="w-12 h-12 bg-orange-50 border border-orange-255 rounded-2xl flex items-center justify-center text-2xl">
                            {getGameEmoji(g)}
                          </div>
                          <h3 className="text-lg font-black text-gray-800 uppercase line-clamp-1" style={{ fontFamily: 'var(--font-title)' }}>
                            {g.title}
                          </h3>
                          <p className="text-xs font-semibold text-gray-500 leading-relaxed line-clamp-3">
                            {g.description || 'Chưa cập nhật mô tả chi tiết cho trò chơi này.'}
                          </p>
                          <div className="flex items-center gap-1 bg-amber-50 rounded-xl px-2.5 py-1 w-fit text-[10px] font-black text-amber-700 border border-amber-200">
                            Phần thưởng: {g.reward} ⭐
                          </div>
                        </div>
                        <div className="p-4 bg-orange-50 border-t border-orange-100">
                          <button 
                            onClick={() => handlePlayGame(g)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3 rounded-xl uppercase transition shadow-sm cursor-pointer"
                          >
                            Chơi ngay ▶️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {displayedGames.length === 0 && (
                <div className="bg-white rounded-[24px] p-10 shadow-sm text-center font-bold text-gray-400">
                  🌱 Chưa có trò chơi trực quan nào hoạt động cho ôn tập Khối lớp này của môn Tin học. Giáo viên đang soạn thảo trò chơi tương tác mới nhé!
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/20 space-y-4 animate-fade-in">
              <div className="border-b pb-2.5 border-orange-250 flex items-center justify-between">
                <h4 className="font-extrabold text-orange-850 text-base sm:text-lg flex items-center gap-2 font-title" style={{ fontFamily: 'var(--font-title)' }}>
                  🎮 Hoạt động Trò chơi Trí tuệ & Thực hành
                </h4>
              </div>
              {displayedGames.length === 0 ? (
                <div className="bg-white rounded-[24px] p-10 text-center font-bold text-gray-400">
                  🌱 Chưa có trò chơi trực quan nào hoạt động cho bộ môn {activeSubject === 'toan' ? 'Môn Toán' : activeSubject === 'tieng_viet' ? 'Môn Tiếng Việt' : 'Môn Tiếng Anh'} Lớp {activeGradeFilterId} này. Quay lại sau nhé!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedGames.map(g => (
                    <div key={g.id} className="bg-white rounded-[24px] overflow-hidden shadow-md border-3 border-orange-200 flex flex-col justify-between hover:translate-y-[-5px] transition duration-300">
                      <div className="p-5 space-y-3">
                        <div className="w-12 h-12 bg-orange-50 border border-orange-255 rounded-2xl flex items-center justify-center text-2xl">
                          {getGameEmoji(g)}
                        </div>
                        <h3 className="text-lg font-black text-gray-800 uppercase line-clamp-1" style={{ fontFamily: 'var(--font-title)' }}>
                          {g.title}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 leading-relaxed line-clamp-3">
                          {g.description || 'Chưa cập nhật mô tả chi tiết cho trò chơi này.'}
                        </p>
                        <div className="flex items-center gap-1 bg-amber-50 rounded-xl px-2.5 py-1 w-fit text-[10px] font-black text-amber-700 border border-amber-200">
                          Phần thưởng: {g.reward} ⭐
                        </div>
                      </div>
                      <div className="p-4 bg-orange-50 border-t border-[#FFF2E0]">
                        <button 
                          onClick={() => handlePlayGame(g)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3 rounded-xl uppercase transition shadow-sm cursor-pointer"
                        >
                          Chơi ngay ▶️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Render Selected active Mini Game panels with back/quit triggers */
        <div className="bg-white rounded-[28px] border-4 border-[#3B82F6] p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-gray-100">
            <button 
              onClick={() => setActiveGame(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs px-4  py-2 rounded-xl transition"
            >
              ⬅️ Thoát Game khác
            </button>
            <h3 className="text-lg font-black text-[#2454A6] uppercase tracking-wide">
              {activeGame === 'memory_cards' && '🧩 Trò chơi lật thẻ trí nhớ'}
              {activeGame === 'speed_quiz' && '⏱️ Trò chơi trắc nghiệm tốc độ'}
              {activeGame === 'millionaire' && '🏆 Ai là triệu phú tin học'}
              {activeGame === 'lucky_wheel' && '🎡 Vòng quay may mắn nhí'}
              {activeGame === 'racing' && '🏎️ Đường đua thiết bị tin học'}
              {activeGame === 'mouse_practice' && '🎯 Nhấp chuột nhanh tay'}
              {activeGame === 'keyboard_practice' && '🚀 Người hùng bàn phím'}
            </h3>
            <span className="text-2xl">🎮</span>
          </div>

          {/* Game Panel implementation: MOUSE PRACTICE */}
          {activeGame === 'mouse_practice' && (
            <div className="space-y-6 text-center">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-2 font-black text-xs text-indigo-800">
                <span>🎯 Điểm tích lũy: {mouseScore} dũng sĩ</span>
                <span className="flex items-center gap-1.5 bg-white border border-indigo-300 px-3 py-1 rounded-full text-red-650 animate-pulse">
                  <Clock className="w-4 h-4 animate-spin text-red-600" />
                  Thời gian còn: {mouseTimeLeft} giây
                </span>
              </div>

              {mouseFinished ? (
                <div className="bg-[#EEFBF3] border-2 border-[#D1F5DF] p-8 rounded-2xl space-y-4 max-w-md mx-auto">
                  <span className="text-5xl inline-block animate-bounce">🏆⭐</span>
                  <h4 className="font-extrabold text-xl text-emerald-800">Hoàn Thành Thử Thách Luyện Chuột!</h4>
                  <p className="text-xs text-gray-650 font-bold leading-relaxed">
                    Tuyệt cú mèo! Em đã nhấp chuột chính xác được <strong className="text-lg text-[#2454A6] font-black">{mouseScore}</strong> vật phẩm công nghệ!
                  </p>
                  <div className="bg-white text-emerald-700 font-bold border border-emerald-300 text-xs inline-block px-4 py-2 rounded-full">
                    ⭐ Đạt thưởng +30 ⭐ lấp lánh!
                  </div>
                  <button 
                    onClick={startMouseGame}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl uppercase transition shadow-sm cursor-pointer"
                  >
                    Chơi lại vòng mới 🔄
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-96 bg-slate-900 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-inner">
                  {/* Grid background representation */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-35"></div>

                  <p className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] text-indigo-300/80 font-black tracking-wider uppercase select-none pointer-events-none text-center">
                    Bàn thực hành di chuột học sinh 🖥️<br/>
                    (Click vào các linh kiện đơn, double-click đỏ, hoặc rê chuột xanh)
                  </p>

                  {mouseTargets.length === 0 && (
                    <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none select-none text-center animate-pulse">
                      Đang kết nối cổng linh kiện... 🔌
                    </div>
                  )}

                  {mouseTargets.map((target) => (
                    <div
                      key={target.id}
                      className="absolute animate-fade-in select-none"
                      style={{ top: `${target.y}%`, left: `${target.x}%` }}
                    >
                      {target.type === 'click' && (
                        <button
                          onClick={() => handleInteractMouseTarget(target.id, 'click')}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 shadow-md cursor-pointer transition transform active:scale-95 ${target.bg}`}
                        >
                          <span className="text-2xl">{target.emoji}</span>
                          <span className="text-[10px] font-black">{target.text}</span>
                        </button>
                      )}

                      {target.type === 'double_click' && (
                        <button
                          onDoubleClick={() => handleInteractMouseTarget(target.id, 'double_click')}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border-3 border-rose-500 shadow-md cursor-pointer transition transform active:scale-90 animate-bounce ${target.bg}`}
                          title="Nhấp đúp chuột chuột nhanh nhé!"
                        >
                          <span className="text-2xl animate-pulse">{target.emoji}</span>
                          <span className="text-[9px] font-extrabold uppercase text-rose-600 animate-pulse bg-white border border-rose-200 px-1.5 py-0.5 rounded-full">Kích Đúp! 🎯</span>
                        </button>
                      )}

                      {target.type === 'hover' && (
                        <div
                          onMouseEnter={() => handleInteractMouseTarget(target.id, 'hover')}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-emerald-400 shadow-md transition transform scale-110 active:scale-95 cursor-crosshair animate-pulse ${target.bg}`}
                        >
                          <span className="text-2xl animate-spin">{target.emoji}</span>
                          <span className="text-[9px] font-bold text-emerald-800 bg-white border border-emerald-200 px-1.5 py-0.5 rounded-full">Rê qua đây 🛸</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Game Panel implementation: KEYBOARD PRACTICE */}
          {activeGame === 'keyboard_practice' && (
            <div className="space-y-6 text-center">
              <div className="bg-emerald-55 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-2 font-black text-xs text-emerald-800">
                <span>🔥 Điểm gõ đúng: {keyboardScore} phím</span>
                <span className="flex items-center gap-1.5 bg-white border border-emerald-350 px-3 py-1 rounded-full text-red-650 animate-pulse">
                  <Clock className="w-4 h-4 animate-spin text-red-600" />
                  Thời gian còn: {keyboardTimeLeft} giây
                </span>
              </div>

              {keyboardFinished ? (
                <div className="bg-[#EEFBF3] border-2 border-[#D1F5DF] p-8 rounded-2xl space-y-4 max-w-md mx-auto">
                  <span className="text-5xl inline-block animate-bounce">🏆⌨️</span>
                  <h4 className="font-extrabold text-xl text-emerald-800">Người Hùng Bàn Phím Đỉnh Cao!</h4>
                  <p className="text-xs text-gray-650 font-bold leading-relaxed">
                    Tuyệt cú mèo! Em đã chinh phục gõ chính xác được <strong className="text-lg text-emerald-600 font-extrabold">{keyboardScore}</strong> nút phím chữ cái!
                  </p>
                  <div className="bg-white text-emerald-700 font-bold border border-emerald-300 text-xs inline-block px-4 py-2 rounded-full">
                    ⭐ Đạt thưởng +30 ⭐ vinh quang!
                  </div>
                  <button 
                    onClick={startKeyboardGame}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl uppercase transition shadow-sm cursor-pointer"
                  >
                    Chơi lại vòng mới 🔄
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full h-80 bg-slate-950 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-inner">
                    <p className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[9px] text-emerald-300/60 font-black tracking-widest uppercase select-none pointer-events-none text-center leading-relaxed">
                      Đấu trường phím chữ đang rơi ⌨️<br/>
                      (Ấn phím cơ tương ứng trên máy tính hoặc nhấp vào phím bay dưới đây!)
                    </p>

                    {keyboardKeys.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-extrabold text-xs pointer-events-none select-none">
                        Chuẩn bị tiếp sóng phím gõ... 📡
                      </div>
                    )}

                    {keyboardKeys.map((k) => (
                      <button
                        key={k.id}
                        onClick={() => {
                          setKeyboardScore(sc => sc + 1);
                          onUpdateXP(3, `Gõ phím click: ${k.char}`);
                          setKeyboardKeys(prev => prev.filter(item => item.id !== k.id));
                        }}
                        className={`absolute w-10 h-10 border-2 rounded-xl flex items-center justify-center font-black text-sm select-none shadow-md transition transform hover:scale-125 cursor-pointer hover:border-white duration-100 ${k.color}`}
                        style={{ top: `${k.y}%`, left: `${k.x}%` }}
                      >
                        {k.char}
                      </button>
                    ))}
                  </div>

                  {/* On-screen quick references helpful guidelines */}
                  <div className="bg-gray-50 border border-gray-150 p-3 rounded-xl text-left font-semibold">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase mb-1">Mẹo nhỏ gõ phím:</p>
                    <p className="text-[11px] text-gray-600 font-bold leading-relaxed">
                      💡 Đặt sẵn hai bàn tay ở các phím hàng cơ sở <strong className="text-[#2454A6]">A - S - D - F</strong> và <strong className="text-[#2454A6]">J - K - L - ;</strong> để gõ thần tốc nhất mà không cần nhìn bàn phím nhé!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Game Panel implementation: 1. MEMORY CARDS */}
          {activeGame === 'memory_cards' && (
            <div className="space-y-6 text-center">
              <p className="text-xs text-gray-500 font-extrabold">Chào mừng dũng sỹ! Hãy nhấp đôi thẻ có liên quan mật thiết để phá đảo:</p>
              
              {memoryFinished ? (
                <div className="bg-[#EEFBF3] border-2 border-[#D1F5DF] p-8 rounded-2xl space-y-4 max-w-md mx-auto">
                  <span className="text-5xl inline-block animate-bounce">🏆🌟</span>
                  <h4 className="font-extrabold text-xl text-emerald-800">Trí Nhớ Đỉnh Cao!</h4>
                  <p className="text-xs text-gray-600 font-bold">Em đã lật thành công hết toàn bộ 4 cặp thẻ bài thiết bị máy tính cực nhanh!</p>
                  <div className="bg-white text-emerald-700 font-bold text-xs inline-block px-4 py-2 rounded-full">
                    ⭐ Đạt thưởng +40 ⭐ vàng!
                  </div>
                  <button 
                    onClick={startMemoryGame}
                    className="w-full bg-[#2454A6] text-white py-3 rounded-xl"
                  >
                    Chơi lại vòng mới
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {cards.map((card, idx) => {
                    const isOpen = card.flipped || card.matched;
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCardClick(idx)}
                        className={`h-24 rounded-2xl font-black text-center text-xs sm:text-sm p-2 transition-all duration-300 transform active:scale-95 border-3 cursor-pointer ${
                          card.matched 
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-60' 
                            : isOpen
                            ? 'bg-blue-50 border-blue-400 text-blue-900 rotate-0'
                            : 'bg-gradient-to-br from-[#2454A6] to-blue-500 border-[#3B82F6] text-white -rotate-1'
                        }`}
                      >
                        {isOpen ? card.emoji : '❓'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Game Panel: 2. SPEED QUIZ */}
          {activeGame === 'speed_quiz' && (
            <div className="max-w-xl mx-auto space-y-6 text-center">
              {speedFinished ? (
                <div className="bg-red-50 border-2 border-[#FFD3D9] p-8 rounded-2xl space-y-4">
                  <span className="text-5xl inline-block animate-bounce">⏱️🔥</span>
                  <h4 className="font-extrabold text-xl text-red-800">Hoàn Thành Thử Thách!</h4>
                  <p className="text-xs text-gray-600 font-bold">Điểm số trắc nghiệm tốc độ của em là:</p>
                  <span className="text-2xl font-black text-red-500 block">{speedScore}/{speedQuestions.length} câu đúng</span>
                  <div className="bg-white text-red-600 border border-red-200 font-bold text-xs inline-block px-4 py-2 rounded-full">
                    ⭐ Cộng hưởng +30 ⭐ bùng cháy!
                  </div>
                  <button 
                    onClick={startSpeedQuiz}
                    className="w-full bg-[#FF6B6B] text-white py-3 rounded-xl"
                  >
                    Chơi lại Speed
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center bg-red-50 p-3 rounded-xl text-xs font-bold text-red-700 border border-red-200 pl-4">
                    <span>Đã đúng: {speedScore} Câu</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 animate-spin text-red-700" />
                      Thời gian còn: {speedTimer} giây
                    </span>
                  </div>

                  {speedQuestions[speedIndex] && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-extrabold text-gray-800 text-base">{speedQuestions[speedIndex].questionText}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {speedQuestions[speedIndex].options?.map((opt) => {
                          const isSelected = speedAnsSelected === opt;
                          const isCorrect = opt === speedQuestions[speedIndex].correctAnswer;
                          let btnStyle = 'bg-white border-gray-200 hover:border-gray-400';
                          if (speedAnsSelected) {
                            if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800';
                            else if (isSelected) btnStyle = 'bg-red-50 border-red-400 text-red-800';
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => handleSpeedAnswerSelect(opt)}
                              disabled={speedAnsSelected !== null}
                              className={`w-full text-left p-3.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-3">
                    <button 
                      onClick={handleNextSpeedQuestion}
                      disabled={!speedAnsSelected}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase ${
                        speedAnsSelected ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {speedIndex + 1 < speedQuestions.length ? 'Tiếp tục ➡️' : 'Kết quả'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Game Panel: 3. MILLIONAIRE */}
          {activeGame === 'millionaire' && (
            <div className="max-w-xl mx-auto space-y-6">
              {millionFinished ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 p-8 rounded-2xl text-center space-y-4">
                  <span className="text-5xl inline-block animate-bounce">👑🏆</span>
                  <h4 className="font-extrabold text-xl text-yellow-800">Nhà triệu phú tin học!</h4>
                  <p className="text-xs text-gray-600 font-semibold">Em lọt top bảng vàng lý thuyết với số câu đúng là:</p>
                  <span className="text-2xl font-black text-amber-600 block">{millionScore} Câu chính xác</span>
                  <div className="bg-white text-[#2454A6] font-bold text-xs inline-block px-4 py-2 rounded-full border border-yellow-200">
                    ⭐ Đạt siêu vinh danh +50 ⭐!
                  </div>
                  <button 
                    onClick={startMillionaire}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 py-3 rounded-xl font-bold"
                  >
                    Bắt đầu lại cuộc đua
                  </button>
                </div>
              ) : (
                (() => {
                  const pool = getQuizPool();
                  const currQ = pool[millionIndex];
                  return (
                    <div className="space-y-4">
                      {/* Ladder Progress headers */}
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black uppercase">
                        {pool.map((_, i) => (
                          <div 
                            key={i} 
                            className={`p-1.5 rounded-lg border ${
                              millionIndex === i 
                                ? 'bg-amber-200 border-amber-400 text-amber-900 animate-pulse'
                                : millionIndex > i
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-gray-100 border-transparent text-gray-400'
                            }`}
                          >
                            Mốc {i + 1}
                          </div>
                        ))}
                      </div>

                      {currQ && (
                        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl border-4 border-amber-300 space-y-5 shadow-2xl">
                          <span className="text-[#FFD84D] font-extrabold text-xs block text-center tracking-widest uppercase">
                            Câu hỏi triệu phú mốc {millionIndex + 1}
                          </span>
                          <h4 className="font-extrabold text-center text-sm md:text-base leading-relaxed">
                            {currQ.questionText}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {currQ.options?.map((opt) => {
                              const isSelected = millionAnsSelected === opt;
                              let btnStyle = 'bg-blue-950/80 border-blue-800 hover:border-amber-300 hover:bg-blue-900';
                              if (millionAnsSelected) {
                                if (opt === currQ.correctAnswer) {
                                  btnStyle = 'bg-emerald-600 border-emerald-400 text-white';
                                } else if (isSelected) {
                                  btnStyle = 'bg-red-600 border-red-400 text-white';
                                }
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleMillionAnswer(opt)}
                                  disabled={millionAnsSelected !== null}
                                  className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition ${btnStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {millionIsCorrect !== null && (
                            <div className="text-center pt-3 font-black text-sm">
                              {millionIsCorrect ? (
                                <span className="text-[#5ED68A] animate-pulse">🎉 Tuyệt vời! Chính xác rồi! 🥇</span>
                              ) : (
                                <span className="text-red-400">🚨 OÁP! Sai mất rồi. Bấm "Tiếp" để đi tiếp nhé!</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleNextMillion(pool.length)}
                        disabled={!millionAnsSelected}
                        className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wide cursor-pointer transition ${
                          millionAnsSelected ? 'bg-amber-400 text-gray-900 hover:bg-amber-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {millionIndex + 1 < pool.length ? 'Chuyển sang mốc tiếp theo ➡️' : 'Kết thúc triệu phú'}
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* Game Panel: 4. LUCKY WHEEL SPIN */}
          {activeGame === 'lucky_wheel' && (
            <div className="max-w-md mx-auto text-center space-y-6">
              <p className="text-xs text-gray-500 font-extrabold">Xoay bánh xe may mắn để rinh vô số điểm tích luỹ vinh quang!</p>
              
              {/* Spinning visual box */}
              <div className="relative w-64 h-64 mx-auto bg-white rounded-full border-8 border-amber-300 shadow-xl overflow-hidden flex items-center justify-center">
                {/* Pointer wheel index represent */}
                <div className="absolute top-0 w-6 h-6 bg-red-500 clip-triangle z-10 transform translate-y-[-5px]"></div>
                
                {/* Visual wheel circles */}
                <div 
                  className="w-full h-full rounded-full transition-transform duration-4000 ease-out relative"
                  style={{ 
                    transform: `rotate(${wheelDegree}deg)`,
                    backgroundImage: 'conic-gradient(#FFF0F2 0deg 60deg, #EBF3FF 60deg 120deg, #FFFDE8 120deg 180deg, #EEFBF3 180deg 240deg, #F7EDFF 240deg 300deg, #FFF5EC 300deg 360deg)'
                  }}
                >
                  {/* Wheel sectors texts */}
                  <div className="absolute inset-0 flex items-center justify-center font-black select-none text-[10px] text-gray-700">
                    <span className="absolute transform rotate-30 translate-y-[-80px]">+10 ⭐</span>
                    <span className="absolute transform rotate-90 translate-y-[-80px]">+20 ⭐</span>
                    <span className="absolute transform rotate-150 translate-y-[-80px]">+30 ⭐</span>
                    <span className="absolute transform rotate-210 translate-y-[-80px]">+50 ⭐</span>
                    <span className="absolute transform rotate-270 translate-y-[-80px]">+10 ⭐</span>
                    <span className="absolute transform rotate-330 translate-y-[-80px]">+15 ⭐</span>
                  </div>
                </div>

                {/* Central spinner core element */}
                <button 
                  onClick={handleSpinWheel}
                  disabled={isSpinning}
                  className="absolute w-16 h-16 bg-[#2454A6] hover:bg-blue-800 text-[#FFD84D] font-black text-sm rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer z-20"
                >
                  {isSpinning ? 'SPIN!' : 'QUAY'}
                </button>
              </div>

              {wheelResult && (
                <div className="bg-[#EEFBF3] border-2 border-emerald-300 p-4 rounded-xl text-center font-black text-emerald-800 text-sm animate-bounce">
                  🎉 Chúc mừng Em! Đạt phần thưởng: <br/>{wheelResult}
                </div>
              )}
            </div>
          )}

          {/* Game Panel: 5. RACING CAR GAME */}
          {activeGame === 'racing' && (
            <div className="max-w-xl mx-auto space-y-6">
              <p className="text-xs text-gray-500 font-extrabold text-center">
                 Dùng nút Trái ⬅️ / Phải ➡️ chuyển hướng bánh xe và nhấp trực tiếp vào đúng Linh kiện Tin học bên lề đường để ăn điểm! Né xa đồ ăn trái cây ra nhé!
              </p>

              {racingFinished ? (
                <div className="bg-[#EEFBF3] border-2 border-emerald-300 p-8 rounded-2xl text-center space-y-4">
                  <span className="text-5xl inline-block animate-bounce">🏎️🏆</span>
                  <h4 className="font-extrabold text-xl text-emerald-800">Về Đích Thành Công!</h4>
                  <p className="text-xs text-gray-600 font-bold">Điểm nhặt đồ của em trên xa lộ Tin Học:</p>
                  <span className="text-2xl font-black text-[#2454A6] block">{racingScore} linh kiện thiết bị hữu ích</span>
                  <div className="bg-white text-emerald-700 font-bold text-xs inline-block px-4 py-2 rounded-full border border-emerald-200">
                    ⭐ Tích tụ thăng hoa +30 ⭐!
                  </div>
                  <button 
                    onClick={startRacing}
                    className="w-full bg-[#5ED68A] text-gray-800 py-3 rounded-xl font-bold"
                  >
                    Vào ván đua mới
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-gray-500 bg-gray-100 p-3 rounded-lg border border-gray-200">
                    <span>Linh kiện thu hoạch: {racingScore} cái</span>
                    <span>Nhiệm vụ: Click vật phẩm Tin Học phía dưới</span>
                  </div>

                  {/* Virtual Racing highway asphalt strip */}
                  <div className="bg-slate-800 h-64 rounded-2xl relative overflow-hidden border-4 border-slate-700 flex flex-col justify-end">
                    
                    {/* Highway dashed center lane paint marks */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-4 w-1.5 h-6 bg-white opacity-40 animate-pulse"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-20 w-1.5 h-6 bg-white opacity-40 animate-pulse"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-36 w-1.5 h-6 bg-white opacity-40 animate-pulse"></div>

                    {/* Road objects/Spawning blocks kids can interact with */}
                    {roadObjects.map((obj) => (
                      <button 
                        key={obj.id}
                        onClick={() => handleCollectRoadObj(obj)}
                        className="absolute bg-white/95 hover:bg-yellow-50 p-2.5 rounded-xl border border-gray-300 shadow-md flex items-center gap-1.5 transform hover:scale-110 active:scale-95 transition-all text-[11px] font-extrabold z-10 cursor-pointer"
                        style={{ top: `${obj.top}%`, left: `${obj.x}%` }}
                      >
                        <span className="text-lg">{obj.emoji}</span>
                        <span>{obj.name}</span>
                      </button>
                    ))}

                    {/* Cute player racing red sports car at the bottom */}
                    <div 
                      className="absolute bottom-4 h-12 w-10 flex items-center justify-center text-3xl transition-all duration-300 ease-out z-20 pointer-events-none"
                      style={{ left: `calc(${carX}% - 20px)` }}
                    >
                      🚀
                    </div>
                  </div>

                  {/* Driving controls arrows */}
                  <div className="flex justify-center gap-4 text-center">
                    <button 
                      onClick={() => setCarX(prev => Math.max(10, prev - 20))}
                      className="bg-gray-100 hover:bg-gray-200 p-4 rounded-xl font-bold border border-gray-300"
                    >
                      ⬅️ Sang Trái
                    </button>
                    <button 
                      onClick={() => setCarX(prev => Math.min(90, prev + 20))}
                      className="bg-gray-100 hover:bg-gray-200 p-4 rounded-xl font-bold border border-gray-300"
                    >
                      Sang Phải ➡️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Game Panel implementor */}
          {activeCustomGame && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <h4 className="font-extrabold text-[#2454A6] text-base mb-1">
                  🎯 Đang chơi: {activeCustomGame.title}
                </h4>
                <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                  {activeCustomGame.description || 'Không có mô tả chi tiết cho trò chơi này.'}
                </p>
              </div>

              {activeCustomGame.gameAreaType === 'swf' && (
                <div className="space-y-4">
                  <div className="w-full aspect-video bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                    <RufflePlayerContainer 
                      swfFile={activeCustomGame.swfFile || ""} 
                      title={activeCustomGame.title} 
                    />
                  </div>
                </div>
              )}

              {activeCustomGame.gameAreaType === 'link' && (
                <div className="space-y-4">
                  <div className="w-full aspect-video bg-white rounded-3xl border-4 border-indigo-200 shadow-xl overflow-hidden relative">
                    <iframe
                      src={activeCustomGame.externalLink}
                      className="w-full h-full border-0 absolute inset-0"
                      allow="autoplay; fullscreen; geolocation"
                      referrerPolicy="no-referrer"
                      title={activeCustomGame.title}
                    />
                  </div>
                  <div className="text-center">
                    <a
                      href={activeCustomGame.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      🔗 Mở trong Cửa sổ Mới (Nếu không tải được game)
                    </a>
                  </div>
                </div>
              )}

              {activeCustomGame.gameAreaType === 'html' && (
                <div className="space-y-4">
                  <div className="w-full bg-slate-50 p-6 rounded-3xl border-4 border-slate-200 shadow-inner min-h-[450px]">
                    <div 
                      dangerouslySetInnerHTML={{ __html: activeCustomGame.htmlCode || "" }} 
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Reward claim section */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🎁</span>
                  <div>
                    <div className="font-extrabold text-amber-800 text-xs sm:text-sm">Hoàn thành thử thách trò chơi!</div>
                    <p className="text-[10px] text-gray-500 font-bold">Sau khi em hoàn thành chơi xong game, hãy nhấp quà tặng phía dưới để nhận SAO vàng tinh học nhé.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateXP(30, `Vượt qua trò chơi: ${activeCustomGame.title}`);
                    alert(`🎉 Tuyệt vời! Em đã nhận được ${activeCustomGame.reward || "+30⭐"} sao thưởng thành công!`);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-[#2454A6] font-black text-xs px-5 py-2.5 rounded-xl border-b-4 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all shadow-sm cursor-pointer"
                >
                  Nhận {activeCustomGame.reward || "+30⭐"} thưởng ⭐
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
