import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Sparkles, 
  Plus, 
  Trash2, 
  Download, 
  FileDown, 
  Printer, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  X,
  Info,
  PenTool,
  Image as ImageIcon,
  Sliders,
  FileText,
  Table
} from 'lucide-react';
import { SoundEffects } from '../App';
import JSZip from 'jszip';
import { parseOklchAndReplace, safeHtml2Canvas } from './Utilities';

interface QuestionGroup {
  id: string;
  questionType: string;
  difficulty: string;
  quantity: number;
  pointsPerQuestion: number;
}

interface GeneratedQuestion {
  id: string;
  type: string;
  difficulty: string;
  questionText: string;
  options?: string[];
  statements?: { label: string; text: string; answer: string }[];
  matchingPairs?: { id: string; left: string; id_match: string; right: string }[];
  correctAnswer?: string;
  points: number;
  answerGuide: string;
}

const formatPoints = (pts: number) => {
  if (pts === undefined || pts === null) return "0";
  if (pts % 1 === 0) {
    return pts.toFixed(0);
  }
  return parseFloat(pts.toFixed(2)).toString();
};

const cleanTrueFalseAns = (str: string) => {
  if (!str) return '';
  return str.replace(/\[\s*\]/g, '').replace(/\[/g, '').replace(/\]/g, '').trim();
};

const cleanPrefix = (str: string): string => {
  if (!str) return '';
  let cleaned = str.trim();
  const regex = /^\s*([A-Da-d0-9]\s*[\.\:\-\)\u2013\u2014]\s*)+/;
  while (regex.test(cleaned)) {
    cleaned = cleaned.replace(regex, '').trim();
  }
  return cleaned;
};

const renderMcqAnswerText = (q: any): string => {
  if (!q.correctAnswer) return '';
  const ansLetter = q.correctAnswer.trim();
  const letterMatch = ansLetter.match(/^([A-Da-d0-9])/);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    const idx = ['A', 'B', 'C', 'D'].indexOf(letter);
    if (idx !== -1 && q.options && q.options[idx]) {
      return `${letter}. ${cleanPrefix(q.options[idx])}`;
    }
  }
  return cleanPrefix(ansLetter);
};

export default function TestCreator({ onTabChange, setLocalTakeExamId, currUser }: { onTabChange?: (tab: string) => void; setLocalTakeExamId?: (examId: string | null) => void; currUser?: any }) {
  // Local state for Gemini API key to avoid 429 quota exhaustion or retry blocks
  const [personalApiKey, setPersonalApiKey] = useState(() => localStorage.getItem('personal_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // General Information States
  const [districtZone, setDistrictZone] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.district) return parsed.district;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });
  
  const [workSchool, setWorkSchool] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.school) return parsed.school;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });

  useEffect(() => {
    const handleSyncProfile = () => {
      try {
        const saved = localStorage.getItem('teacher_profile_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.district) setDistrictZone(parsed.district);
          if (parsed.school) setWorkSchool(parsed.school);
        }
      } catch (e) {
        console.error(e);
      }
    };

    handleSyncProfile();
    window.addEventListener('focus', handleSyncProfile);
    return () => window.removeEventListener('focus', handleSyncProfile);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('teacher_profile_data');
      let profileObj: any = {};
      if (saved) {
        profileObj = JSON.parse(saved);
      }
      // Only set if they actually changed to avoid infinite loop
      if (profileObj.district !== districtZone || profileObj.school !== workSchool) {
        const updated = {
          ...profileObj,
          district: districtZone,
          school: workSchool
        };
        localStorage.setItem('teacher_profile_data', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  }, [districtZone, workSchool]);

  const [subject, setSubject] = useState('Tin học');
  const [grade, setGrade] = useState('Lớp 3');
  const [curriculumBook, setCurriculumBook] = useState('Kết nối tri thức với cuộc sống');
  const [testName, setTestName] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  
  // Custom uploaded image state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Layout Tab: 'manual' | 'matrix_create'
  const [activeTab, setActiveTab] = useState<'manual' | 'matrix_create'>('manual');
  
  // Score Scale: Fixed at 10 as requested (Remove Thang diem 100 button in template)
  const [scoreScale, setScoreScale] = useState<10>(10);

  // States for dynamic image scaling (from 0.DeKiemTra.PNG layout)
  const [imageSize, setImageSize] = useState<number>(250);
  const [isCenteredImage, setIsCenteredImage] = useState<boolean>(false);

  // File Input Ref for loading files from PC
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Question Groups (Initialized exactly like the DemoDeKiemTra.pdf)
  const [groups, setGroups] = useState<QuestionGroup[]>([
    {
      id: "group-1",
      questionType: "Trắc nghiệm",
      difficulty: "Nhận biết",
      quantity: 5,
      pointsPerQuestion: 0.25
    },
    {
      id: "group-2",
      questionType: "Đúng - Sai",
      difficulty: "Nhận biết",
      quantity: 2,
      pointsPerQuestion: 0.25
    },
    {
      id: "group-3",
      questionType: "Nối cột",
      difficulty: "Nhận biết",
      quantity: 2,
      pointsPerQuestion: 0.25
    },
    {
      id: "group-4",
      questionType: "Điền khuyết",
      difficulty: "Nhận biết",
      quantity: 1,
      pointsPerQuestion: 0.25
    }
  ]);

  // Matrix rows state (for 'Tự tạo ma trận' functionality according to Circular 27 with cognitive levels of knowledge)
  const [matrixRows, setMatrixRows] = useState<any[]>([
    {
      id: "row-1",
      topicName: "Chủ đề 1: Máy tính và em",
      lessonName: "Bài 1: Thông tin và quyết định",
      m1: { mcq: 0, essay: 0 },
      m2: { mcq: 0, essay: 0 },
      m3: { mcq: 0, essay: 0 },
      m4: { mcq: 0, essay: 0 },
      qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
    },
    {
      id: "row-2",
      topicName: "Chủ đề 1: Máy tính và em",
      lessonName: "Bài 2: Xử lý thông tin",
      m1: { mcq: 0, essay: 0 },
      m2: { mcq: 0, essay: 0 },
      m3: { mcq: 0, essay: 0 },
      m4: { mcq: 0, essay: 0 },
      qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
    },
    {
      id: "row-3",
      topicName: "Chủ đề 1: Máy tính và em",
      lessonName: "Bài 3: Máy tính và em",
      m1: { mcq: 0, essay: 0 },
      m2: { mcq: 0, essay: 0 },
      m3: { mcq: 0, essay: 0 },
      m4: { mcq: 0, essay: 0 },
      qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
    }
  ]);

  const [matrixMcqPoint, setMatrixMcqPoint] = useState<number>(0.5);
  const [matrixEssayPoint, setMatrixEssayPoint] = useState<number>(1.0);
  const [isMatrixCreated, setIsMatrixCreated] = useState<boolean>(false);
  const [isMatrixProcessing, setIsMatrixProcessing] = useState<boolean>(false);

  // Helper to retrieve safely adjusted question types (constrained by total cognitive questions)
  const getSafeQTypes = (row: any) => {
    const currentQTypes = row.qTypes || { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0, essay: 0 };
    const rowMcqQty = (Number(row.m1?.mcq) || 0) + (Number(row.m2?.mcq) || 0) + (Number(row.m3?.mcq) || 0);
    const rowEssayQty = (Number(row.m1?.essay) || 0) + (Number(row.m2?.essay) || 0) + (Number(row.m3?.essay) || 0);
    
    let mcq = currentQTypes.mcq !== undefined ? currentQTypes.mcq : 0;
    let trueFalse = currentQTypes.trueFalse || 0;
    let gapFill = currentQTypes.gapFill || 0;
    let matching = currentQTypes.matching || 0;
    
    // Default any unallocated MCQ questions to "Trắc nghiệm 4 đáp án" (mcq)
    const allocatedTotal = mcq + trueFalse + gapFill + matching;
    if (allocatedTotal < rowMcqQty) {
      mcq += (rowMcqQty - allocatedTotal);
    }
    
    // Essay (Tự luận) is automatically set to the sum of essay questions
    let essay = rowEssayQty;
    
    let sumMcq = mcq + trueFalse + gapFill + matching;
    if (sumMcq > rowMcqQty) {
      while (sumMcq > rowMcqQty) {
        if (matching > 0) { matching--; sumMcq--; }
        else if (gapFill > 0) { gapFill--; sumMcq--; }
        else if (trueFalse > 0) { trueFalse--; sumMcq--; }
        else if (mcq > 0) { mcq--; sumMcq--; }
        else break;
      }
    }
    return { mcq, trueFalse, gapFill, matching, essay };
  };

  // Compute total MCQ and Essay questions in the matrix across M1, M2, M3
  const m1McqTotal = matrixRows.reduce((acc, row) => acc + (Number(row.m1?.mcq) || 0), 0);
  const m1EssayTotal = matrixRows.reduce((acc, row) => acc + (Number(row.m1?.essay) || 0), 0);
  const m2McqTotal = matrixRows.reduce((acc, row) => acc + (Number(row.m2?.mcq) || 0), 0);
  const m2EssayTotal = matrixRows.reduce((acc, row) => acc + (Number(row.m2?.essay) || 0), 0);
  const m3McqTotal = matrixRows.reduce((acc, row) => acc + (Number(row.m3?.mcq) || 0), 0);
  const m3EssayTotal = matrixRows.reduce((acc, row) => acc + (Number(row.m3?.essay) || 0), 0);

  const matrixMcqQty = m1McqTotal + m2McqTotal + m3McqTotal;
  const matrixEssayQty = m1EssayTotal + m2EssayTotal + m3EssayTotal;
  const totalQuestions = matrixMcqQty + matrixEssayQty;

  // Compute total dynamic score in the matrix based on Mcq point and Essay point configuration
  const m1TotalScore = (m1McqTotal * matrixMcqPoint) + (m1EssayTotal * matrixEssayPoint);
  const m2TotalScore = (m2McqTotal * matrixMcqPoint) + (m2EssayTotal * matrixEssayPoint);
  const m3TotalScore = (m3McqTotal * matrixMcqPoint) + (m3EssayTotal * matrixEssayPoint);

  const matrixTotalScore = m1TotalScore + m2TotalScore + m3TotalScore;
  const isMatrixScaleValid = Math.abs(matrixTotalScore - scoreScale) < 0.001;

  const handleAddMatrixRow = () => {
    setMatrixRows([
      ...matrixRows,
      {
        id: `row-${Date.now()}`,
        topicName: `Chủ đề ${matrixRows.length + 1}: Nhập tên chủ đề...`,
        lessonName: `Bài mới: Nhập tên bài học...`,
        m1: { mcq: 0, essay: 0 },
        m2: { mcq: 0, essay: 0 },
        m3: { mcq: 0, essay: 0 },
        m4: { mcq: 0, essay: 0 },
        qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
      }
    ]);
    triggerToast("➕ Đã thêm một dòng bài học Ma trận mới!");
    SoundEffects.playTing();
  };

  const handleIncrementQType = (rowId: string, typeKey: 'mcq' | 'trueFalse' | 'gapFill' | 'matching') => {
    setMatrixRows(prevRows => prevRows.map(r => {
      if (r.id !== rowId) return r;
      const currentQTypes = r.qTypes || { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 };
      const lessonTotalQty = (Number(r.m1?.mcq) || 0) + (Number(r.m1?.essay) || 0) + 
                             (Number(r.m2?.mcq) || 0) + (Number(r.m2?.essay) || 0) + 
                             (Number(r.m3?.mcq) || 0) + (Number(r.m3?.essay) || 0);
      const allocatedTypes = (currentQTypes.mcq || 0) + (currentQTypes.trueFalse || 0) + 
                             (currentQTypes.gapFill || 0) + (currentQTypes.matching || 0);
      
      if (allocatedTypes >= lessonTotalQty) {
        triggerToast("⚠️ Tổng số câu của các dạng đã đạt tối đa số câu ở các mức độ!");
        return r;
      }
      
      return {
        ...r,
        qTypes: {
          ...currentQTypes,
          [typeKey]: (currentQTypes[typeKey] || 0) + 1
        }
      };
    }));
  };

  const handleDecrementQType = (rowId: string, typeKey: 'mcq' | 'trueFalse' | 'gapFill' | 'matching') => {
    setMatrixRows(prevRows => prevRows.map(r => {
      if (r.id !== rowId) return r;
      const currentQTypes = r.qTypes || { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 };
      const nextVal = Math.max(0, (currentQTypes[typeKey] || 0) - 1);
      return {
        ...r,
        qTypes: {
          ...currentQTypes,
          [typeKey]: nextVal
        }
      };
    }));
  };

  const parseLessonContentToMatrix = (content: string) => {
    if (!content || !content.trim()) {
      return [
        {
          id: "row-1",
          topicName: "Chủ đề 1: Máy tính và em",
          lessonName: "Bài 1: Thông tin và quyết định",
          m1: { mcq: 0, essay: 0 },
          m2: { mcq: 0, essay: 0 },
          m3: { mcq: 0, essay: 0 },
          m4: { mcq: 0, essay: 0 },
          qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
        }
      ];
    }

    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const rows: any[] = [];
    let currentTopic = "Chủ đề 1: Máy tính và em";
    let lessonCounter = 1;

    for (const line of lines) {
      const isTopic = line.toLowerCase().includes('chủ đề') || line.toLowerCase().startsWith('chủ đề');
      if (isTopic) {
        currentTopic = line;
        continue;
      }

      const isLesson = line.toLowerCase().includes('bài') || line.toLowerCase().startsWith('bài');
      if (isLesson) {
        rows.push({
          id: `row-${Math.random().toString(36).substr(2, 9)}`,
          topicName: currentTopic,
          lessonName: line,
          m1: { mcq: 0, essay: 0 },
          m2: { mcq: 0, essay: 0 },
          m3: { mcq: 0, essay: 0 },
          m4: { mcq: 0, essay: 0 },
          qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
        });
        lessonCounter++;
      } else {
        if (line.length > 3) {
          rows.push({
            id: `row-${Math.random().toString(36).substr(2, 9)}`,
            topicName: currentTopic,
            lessonName: `Bài ${lessonCounter}: ${line}`,
            m1: { mcq: 0, essay: 0 },
            m2: { mcq: 0, essay: 0 },
            m3: { mcq: 0, essay: 0 },
            m4: { mcq: 0, essay: 0 },
            qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
          });
          lessonCounter++;
        }
      }
    }

    if (rows.length === 0) {
      return [
        {
          id: "row-1",
          topicName: "Chủ đề 1: Máy tính và em",
          lessonName: "Bài 1: Thông tin và quyết định",
          m1: { mcq: 0, essay: 0 },
          m2: { mcq: 0, essay: 0 },
          m3: { mcq: 0, essay: 0 },
          m4: { mcq: 0, essay: 0 },
          qTypes: { mcq: 0, trueFalse: 0, gapFill: 0, matching: 0 }
        }
      ];
    }

    return rows;
  };

  const handleAutoCreateMatrix = () => {
    if (!testName || !testName.trim()) {
      triggerToast("⚠️ Vui lòng nhập Tên Bài thi trước khi tạo ma trận!");
      SoundEffects.playTing();
      return;
    }
    if (!lessonContent || !lessonContent.trim()) {
      triggerToast("⚠️ Vui lòng nhập Nội dung bài học trước khi tạo ma trận!");
      SoundEffects.playTing();
      return;
    }

    setIsMatrixProcessing(true);
    SoundEffects.playTing();
    setTimeout(() => {
      const parsedRows = parseLessonContentToMatrix(lessonContent);
      setMatrixRows(parsedRows);
      setIsMatrixCreated(true);
      setIsMatrixProcessing(false);
      triggerToast("✨ Đã thiết lập Ma trận Thông tư 27 tự động thành công!");
      SoundEffects.playKeng();
    }, 1200);
  };

  const handleRemoveMatrixRow = (id: string) => {
    if (matrixRows.length === 1) {
      triggerToast("⚠️ Phải giữ lại ít nhất 1 dòng bài học trong ma trận!");
      return;
    }
    setMatrixRows(matrixRows.filter(r => r.id !== id));
    SoundEffects.playTing();
  };

  const updateMatrixTopicName = (oldName: string, newName: string) => {
    setMatrixRows(matrixRows.map(row => {
      if (row.topicName === oldName) {
        return { ...row, topicName: newName };
      }
      return row;
    }));
  };

  // States for generating / testing results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Source of generation state to correctly map part 1 matrix
  const [examSourceTab, setExamSourceTab] = useState<'manual' | 'matrix_create'>('manual');

  // Online Exam lobby & practice state variables
  const [showOnlineExamModal, setShowOnlineExamModal] = useState(false);
  const [onlineCourseCode, setOnlineCourseCode] = useState('');
  const [onlineStudentName, setOnlineStudentName] = useState('Nguyễn Văn Tuấn');
  const [onlineStudentClass, setOnlineStudentClass] = useState(() => {
    try {
      const savedClasses = localStorage.getItem('lms_classes_by_grade_registry');
      const classesByGrade = savedClasses ? JSON.parse(savedClasses) : {};
      const classes3 = classesByGrade[3] || [];
      if (classes3.length > 0) return classes3[0];
    } catch(e){}
    return '3.1';
  });
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [onlineTimeLeft, setOnlineTimeLeft] = useState(600); // 10 minutes default
  const [onlineSubmitted, setOnlineSubmitted] = useState(false);
  const [onlineTimerActive, setOnlineTimerActive] = useState(false);

  // Custom online configuration state hooks based on ThiOnline.PNG
  const [showOnlineConfigModal, setShowOnlineConfigModal] = useState(false);
  const [configTestName, setConfigTestName] = useState('');
  const [configDuration, setConfigDuration] = useState(45);
  const [configShowAnswers, setConfigShowAnswers] = useState(true);
  const [configSecurityLimit, setConfigSecurityLimit] = useState(false);
  const [configAccessCode, setConfigAccessCode] = useState('');

  useEffect(() => {
    let timerId: any = null;
    if (onlineTimerActive && onlineTimeLeft > 0 && !onlineSubmitted) {
      timerId = setInterval(() => {
        setOnlineTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setOnlineSubmitted(true);
            setOnlineTimerActive(false);
            triggerToast("⏰ Hết giờ làm bài! Hệ thống tự động nộp bài.");
            SoundEffects.playKeng();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [onlineTimerActive, onlineTimeLeft, onlineSubmitted]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Add new group card
  const handleAddNewGroup = () => {
    const newId = `group-${Date.now()}`;
    setGroups([
      ...groups,
      {
        id: newId,
        questionType: "Trắc nghiệm",
        difficulty: "Nhận biết",
        quantity: 5,
        pointsPerQuestion: 0.25
      }
    ]);
    triggerToast("➕ Đã thêm một nhóm cấu hình câu hỏi mới!");
    SoundEffects.playTing();
  };

  // Remove group card
  const handleRemoveGroup = (id: string) => {
    if (groups.length === 1) {
      triggerToast("⚠️ Cần giữ lại ít nhất 1 nhóm cấu trúc câu hỏi!");
      return;
    }
    setGroups(groups.filter(g => g.id !== id));
    SoundEffects.playTing();
  };

  // Update group properties
  const updateGroup = (id: string, field: keyof QuestionGroup, value: any) => {
    setGroups(groups.map(g => {
      if (g.id === id) {
        return { ...g, [field]: value };
      }
      return g;
    }));
  };

  // Compute total dynamic score
  const totalScore = groups.reduce((sum, g) => sum + (Number(g.quantity) * Number(g.pointsPerQuestion)), 0);
  const isScaleValid = Math.abs(totalScore - scoreScale) < 0.001;

  // Handle image attachment from computer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        triggerToast("📷 Đã tải lên ảnh học liệu thành công!");
        SoundEffects.playTing();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Start Generating Exam (BẮT ĐẦU TẠO ĐỀ THI)
  const handleStartGenerateExam = async () => {
    if (!testName.trim()) {
      triggerToast("⚠️ Vui lòng nhập Tên Bài thi trước khi tạo đề!");
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    SoundEffects.playTing();
    setExamSourceTab(activeTab);

    let mcCount = 0;
    let essayCount = 0;
    let topicDescription = lessonContent;

    if (!topicDescription.trim() && !attachedImage) {
      topicDescription = `Khảo sát và thiết kế câu hỏi bám sát tiêu đề bài học: "${testName}"`;
    }

    let multipleChoiceCount = 0;
    let trueFalseCount = 0;
    let matchingCount = 0;
    let gapFillCount = 0;
    let shortEssayCount = 0;

    if (activeTab === 'manual') {
      groups.forEach(g => {
        if (g.questionType.includes("Trắc nghiệm") || g.questionType.includes("4 phương án")) {
          multipleChoiceCount += g.quantity;
          mcCount += g.quantity;
        } else if (g.questionType.includes("Đúng") || g.questionType.includes("Đúng Sai")) {
          trueFalseCount += g.quantity;
          essayCount += g.quantity;
        } else if (g.questionType.includes("Nối cột")) {
          matchingCount += g.quantity;
          essayCount += g.quantity;
        } else if (g.questionType.includes("Điền khuyết")) {
          gapFillCount += g.quantity;
          essayCount += g.quantity;
        } else if (g.questionType.includes("Tự luận")) {
          shortEssayCount += g.quantity;
          essayCount += g.quantity;
        }
      });
    } else {
      matrixRows.forEach(row => {
        const safeTypes = getSafeQTypes(row);
        multipleChoiceCount += safeTypes.mcq;
        trueFalseCount += safeTypes.trueFalse;
        gapFillCount += safeTypes.gapFill;
        matchingCount += safeTypes.matching;
        shortEssayCount += safeTypes.essay || 0;

        const rowTotalCognitive = (Number(row.m1?.mcq) || 0) + (Number(row.m1?.essay) || 0) +
                                  (Number(row.m2?.mcq) || 0) + (Number(row.m2?.essay) || 0) +
                                  (Number(row.m3?.mcq) || 0) + (Number(row.m3?.essay) || 0);
        const allocatedToFormats = safeTypes.mcq + safeTypes.trueFalse + safeTypes.gapFill + safeTypes.matching + (safeTypes.essay || 0);
        if (rowTotalCognitive > allocatedToFormats) {
          shortEssayCount += (rowTotalCognitive - allocatedToFormats);
        }
      });

      mcCount = multipleChoiceCount;
      essayCount = trueFalseCount + gapFillCount + matchingCount + shortEssayCount;
      
      // Embed Matrix structural configuration in content description prompt for accurate educational targeting
      topicDescription += `\n[MA TRẬN ĐỀ THI THEO THÔNG TƯ 27 (MỨC 1, 2, 3)]:\n` + matrixRows.map(row => {
        const safeTypes = getSafeQTypes(row);
        return `- '${row.topicName} - ${row.lessonName}': 
          + Mức 1 (Nhận biết): Trắc nghiệm (${row.m1?.mcq || 0} câu), Tự luận (${row.m1?.essay || 0} câu)
          + Mức 2 (Thông hiểu): Trắc nghiệm (${row.m2?.mcq || 0} câu), Tự luận (${row.m2?.essay || 0} câu)
          + Mức 3 (Vận dụng): Trắc nghiệm (${row.m3?.mcq || 0} câu), Tự luận (${row.m3?.essay || 0} câu)
          + Phân bổ định dạng câu: Trắc nghiệm (${safeTypes.mcq} câu), Đúng/Sai (${safeTypes.trueFalse} câu), Điền khuyết (${safeTypes.gapFill} câu), Nối cột (${safeTypes.matching} câu)`;
      }).join('\n');
    }

    if (multipleChoiceCount === 0 && trueFalseCount === 0 && matchingCount === 0 && gapFillCount === 0 && shortEssayCount === 0) {
      triggerToast("⚠️ Ma trận / Nhóm cấu trúc trống rỗng! Hãy cấu hình số câu lớn hơn 0.");
      setIsGenerating(false);
      return;
    }

    try {
      const personalKey = personalApiKey || localStorage.getItem('personal_gemini_api_key') || '';
      const response = await fetch('/api/generate-exam-problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': personalKey
        },
        body: JSON.stringify({
          topic: topicDescription,
          grade: grade,
          subject: subject,
          curriculumBook: curriculumBook,
          testName: testName,
          groups: groups, // Pass manual configurations to the server
          mcCount: mcCount,
          essayCount: essayCount,
          multipleChoiceCount,
          trueFalseCount,
          matchingCount,
          gapFillCount,
          shortEssayCount
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Dịch vụ mạng tạo bài kiểm tra AI tạm thời quá tải.");
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        let mapped: GeneratedQuestion[] = [];

        if (activeTab === 'manual') {
          let indexCount = 1;
          let pool = [...data.questions];

          groups.forEach((group) => {
            let targetType = "multiple_choice";
            if (group.questionType.includes("Đúng") || group.questionType.includes("Đúng Sai")) {
              targetType = "true_false";
            } else if (group.questionType.includes("Nối cột")) {
              targetType = "matching";
            } else if (group.questionType.includes("Điền khuyết") || group.questionType.includes("Khuyết")) {
              targetType = "gap_fill";
            } else if (group.questionType.includes("Tự luận")) {
              targetType = "essay";
            }

            // Extract matching candidates from pool
            let candidatesOfType: any[] = [];
            pool.forEach((q, idx) => {
              if (q.type === targetType) {
                candidatesOfType.push({ question: q, originalIndex: idx });
              }
            });

            const takenCandidates = candidatesOfType.slice(0, group.quantity);
            const taken = takenCandidates.map(c => c.question);

            // Remove taken from pool from end to start to preserve index matching
            const sortedIndices = takenCandidates.map(c => c.originalIndex).sort((a, b) => b - a);
            sortedIndices.forEach(idx => {
              pool.splice(idx, 1);
            });

            // Construct placeholders if candidates in pool are insufficient
            while (taken.length < group.quantity) {
              if (targetType === "multiple_choice") {
                taken.push({
                  type: "multiple_choice",
                  questionText: `Câu hỏi Trắc nghiệm bổ sung về nội dung kiến thức bài học: "${testName}"`,
                  options: ["Phương án A khách quan", "Phương án B khách quan", "Phương án C khách quan", "Phương án D khách quan"],
                  correctAnswer: "A",
                  answerGuide: "Xem phân tích lý thuyết sách giáo khoa tin học."
                });
              } else if (targetType === "true_false") {
                taken.push({
                  type: "true_false",
                  questionText: `Xét tính chính xác của các nhận định dưới đây về chủ đề "${testName || 'Tin học'}":`,
                  statements: [
                    { label: "A", text: "Khẳng định cơ bản 1 phù hợp hệ thống chương trình học.", answer: "Đúng" },
                    { label: "B", text: "Khẳng định cơ bản 2 không đúng thực tế bài giảng.", answer: "Sai" }
                  ],
                  correctAnswer: "A-Đúng, B-Sai",
                  answerGuide: "Yêu cầu Đúng mỗi ý được 0.25đ."
                });
              } else if (targetType === "matching") {
                taken.push({
                  type: "matching",
                  questionText: `Ghép đôi tương tích định nghĩa ở cột A với vai trò ở cột B:`,
                  matchingPairs: [
                    { id: "1", left: "Khái niệm kiến thức 1", id_match: "a", right: "Nghĩa chức năng tương hợp 1" },
                    { id: "2", left: "Khái niệm kiến thức 2", id_match: "b", right: "Nghĩa chức năng tương hợp 2" }
                  ],
                  correctAnswer: "1-a, 2-b",
                  answerGuide: "Nối tương hợp phù hợp ngữ nghĩa."
                });
              } else if (targetType === "gap_fill") {
                taken.push({
                  type: "gap_fill",
                  questionText: `Điền từ thích hợp vào chỗ trống để được kết luận khoa học: "Khi đưa ra quyết định ta cần cân nhắc kỹ các ___ thu nhận được."`,
                  correctAnswer: "thông tin",
                  answerGuide: "Từ khóa chính xác cần điền: thông tin"
                });
              } else {
                taken.push({
                  type: "essay",
                  questionText: `Trình bày ý kiến cá nhân hoặc phân tích sự hiểu biết của em đối với: "${testName}"`,
                  correctAnswer: "Học sinh tự luận trình bày rõ ràng kiến thức.",
                  answerGuide: "Yêu cầu viết rõ 2-3 ý lý giải chi tiết."
                });
              }
            }

            taken.forEach((q: any) => {
              mapped.push({
                id: `q-${indexCount++}`,
                type: q.type,
                difficulty: group.difficulty,
                questionText: q.questionText,
                options: q.options,
                statements: q.statements,
                matchingPairs: q.matchingPairs,
                correctAnswer: q.correctAnswer,
                points: Number(group.pointsPerQuestion),
                answerGuide: q.answerGuide || "Đáp án chuẩn xác theo chương trình học."
              });
            });
          });
        } else {
          // Matrix mode standard splits
          let indexCount = 1;
          mapped = data.questions.map((q: any) => {
            const isObjective = q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'matching' || q.type === 'gap_fill';
            const matchedPoints = isObjective ? matrixMcqPoint : matrixEssayPoint;
            return {
              id: `q-${indexCount++}`,
              type: q.type,
              difficulty: q.difficulty || (isObjective ? 'Thông hiểu' : 'Vận dụng'),
              questionText: q.questionText,
              options: q.options,
              statements: q.statements,
              matchingPairs: q.matchingPairs,
              correctAnswer: q.correctAnswer,
              points: matchedPoints,
              answerGuide: q.answerGuide || "Đáp án chuẩn xác theo chương trình học."
            };
          });
        }

        setGeneratedQuestions(mapped);
        setShowPreviewModal(true);
        triggerToast("🎉 Robot AI đã biên soạn đề thi & ma trận thành công!");
        SoundEffects.playKeng();
      } else {
        triggerToast("⚠️ Định dạng phản hồi trống rỗng, vui lòng bấm cấu hình thử lại!");
      }

    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || err;
      setGenerationError(errMsg);
      triggerToast(`❌ Lỗi kết nối AI: ${errMsg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportWord = () => {
    const formatPedagogicalNotes = (notes: string) => {
      if (!notes) return '';
      const parts = notes.split(/(?<=\.)\s+/);
      const cleanedParts = parts.map(p => p.trim()).filter(p => p.length > 0);
      if (cleanedParts.length === 0) return '';
      return '<br/>' + cleanedParts.join('<br/>');
    };

    try {
      const sectionsExist = {
        multiple_choice: generatedQuestions.some(q => q.type === 'multiple_choice'),
        true_false: generatedQuestions.some(q => q.type === 'true_false'),
        matching: generatedQuestions.some(q => q.type === 'matching'),
        gap_fill: generatedQuestions.some(q => q.type === 'gap_fill'),
        essay: generatedQuestions.some(q => q.type === 'essay')
      };

      const sectionTitles: Record<string, string> = {};
      const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];
      let rIdx = 0;

      if (sectionsExist.multiple_choice) {
        sectionTitles.multiple_choice = `${romanNumerals[rIdx++]}. PHẦN TRẮC NGHIỆM`;
      }
      if (sectionsExist.true_false) {
        sectionTitles.true_false = `${romanNumerals[rIdx++]}. PHẦN ĐÚNG - SAI`;
      }
      if (sectionsExist.matching) {
        sectionTitles.matching = `${romanNumerals[rIdx++]}. PHẦN NỐI CỘT (CẶP ĐÔI)`;
      }
      if (sectionsExist.gap_fill) {
        sectionTitles.gap_fill = `${romanNumerals[rIdx++]}. PHẦN ĐIỀN KHUYẾT`;
      }
      if (sectionsExist.essay) {
        sectionTitles.essay = `${romanNumerals[rIdx++]}. PHẦN TỰ LUẬN TRÌNH BÀY`;
      }

      const docHeader = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${testName || 'Export_Word_GDPT'}</title>
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
            @page WordSection1 {
              size: 595.3pt 841.9pt; /* Standard A4 paper */
              margin: 56.7pt 56.7pt 56.7pt 56.7pt; /* 2.0 cm margins on all borders */
              mso-header-margin: 36.0pt;
              mso-footer-margin: 36.0pt;
              mso-paper-source: 0;
            }
            div.WordSection1 {
              page: WordSection1;
            }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              line-height: 1.45; 
              font-size: 12.5pt; 
              color: #000000;
              background-color: #ffffff;
            }
            h1 { text-align: center; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; margin-top: 15px; margin-bottom: 2px; text-transform: uppercase; font-weight: bold; }
            h2 { font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; font-weight: bold; margin-top: 20px; margin-bottom: 8px; border-bottom: 1.5px solid black; padding-bottom: 2px; text-transform: uppercase; }
            p { margin: 0 0 6px 0; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; text-align: justify; line-height: 1.45; }
            .italic { font-style: italic; }
            .bold { font-weight: bold; }
            .text-center { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
            td, th { padding: 6px 8px; vertical-align: top; font-family: 'Times New Roman', Times, serif; font-size: 12.5pt; }
            .bordered-table th, .bordered-table td { border: 1px solid black; }
          </style>
        </head>
        <body>
          <div class="WordSection1">
      `;

      const docFooter = `</div></body></html>`;
      
      let bodyHtml = `
        <table style="width: 100%; border: none; border-collapse: collapse; margin-bottom: 25px;" align="center">
          <tr>
            <td nowrap style="width: 45%; border: none; text-align: center; font-family: 'Times New Roman', serif; font-size: 12.5pt; white-space: nowrap;">
              ${(districtZone || "ỦY BAN NHÂN DÂN .......").toUpperCase()} <br/>
              <strong>${(workSchool || "TRƯỜNG TIỂU HỌC ..........").toUpperCase()}</strong>
              <hr style="width: 100px; border: 0.5px solid black; margin-top: 5px;"/>
            </td>
            <td nowrap style="width: 55%; border: none; text-align: center; font-family: 'Times New Roman', serif; font-size: 12.5pt; font-weight: bold; white-space: nowrap;">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
              <span style="font-size: 12.5pt; font-weight: normal; text-decoration: underline; white-space: nowrap;">Độc lập - Tự do - Hạnh phúc</span>
            </td>
          </tr>
        </table>

        <h1>${testName.toUpperCase() || 'ĐỀ KIỂM TRA ĐỊNH KỲ'}</h1>
        <div class="text-center italic" style="font-size: 12.5pt; margin-top: 5px; font-family: 'Times New Roman', serif;">
          Môn thi: ${subject} (${grade}) - Sách: ${curriculumBook} <br/>
          Thời gian làm bài thi: 35 Phút
        </div>
        <br/>
        
        <table style="width: 100%; border: 1px solid black; border-collapse: collapse; margin-bottom: 20px;" align="center">
          <tr>
            <td style="padding: 10px; border: 1px solid black; font-family: 'Times New Roman', serif; font-size: 12.5pt; vertical-align: top; width: 70%;">
              <strong>Họ và tên học sinh:</strong> ................................................................<br/>
              <strong>Lớp:</strong> .....................................................................................
            </td>
            <td style="text-align: center; width: 30%; border: 1px solid black; padding: 10px; font-family: 'Times New Roman', serif; font-size: 12.5pt; vertical-align: middle;">
              <strong>Điểm số đạt:</strong><br/>
              <span style="font-size: 12.5pt; font-weight: bold;">....... / ${scoreScale} Đ</span>
            </td>
          </tr>
        </table>
      `;

      // 1. Multiple Choice Questions
      const mcQs = generatedQuestions.filter(q => q.type === 'multiple_choice');
      if (mcQs.length > 0) {
        bodyHtml += `<h2>${sectionTitles.multiple_choice}</h2>`;
        mcQs.forEach((q, idx) => {
          bodyHtml += `
            <p><span class="bold">Câu ${idx + 1} (${formatPoints(q.points)} điểm): ${q.questionText}</span></p>
            <table style="width: 100%; border: none; margin: 4px 0;">
              <tr>
                <td style="width: 50%; border: none; padding: 4px 10px; font-size: 12.5pt; font-family: 'Times New Roman', serif;"><span class="bold" style="color: #1e40af;">A.</span> ${cleanPrefix(q.options?.[0] || '')}</td>
                <td style="width: 50%; border: none; padding: 4px 10px; font-size: 12.5pt; font-family: 'Times New Roman', serif;"><span class="bold" style="color: #1e40af;">B.</span> ${cleanPrefix(q.options?.[1] || '')}</td>
              </tr>
              <tr>
                <td style="width: 50%; border: none; padding: 4px 10px; font-size: 12.5pt; font-family: 'Times New Roman', serif;"><span class="bold" style="color: #1e40af;">C.</span> ${cleanPrefix(q.options?.[2] || '')}</td>
                <td style="width: 50%; border: none; padding: 4px 10px; font-size: 12.5pt; font-family: 'Times New Roman', serif;"><span class="bold" style="color: #1e40af;">D.</span> ${cleanPrefix(q.options?.[3] || '')}</td>
              </tr>
            </table>
            <br/>
          `;
        });
      }

      // 2. True / False Questions
      const tfQs = generatedQuestions.filter(q => q.type === 'true_false');
      if (tfQs.length > 0) {
        bodyHtml += `<h2>${sectionTitles.true_false}</h2>`;
        tfQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + idx + 1;
          bodyHtml += `
            <p><span class="bold">Câu ${offsetIdx} (${formatPoints(q.points)} điểm): ${q.questionText}</span></p>
            <table class="bordered-table" style="width: 100%; border: 1px solid black; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px;">
              <thead>
                <tr style="background-color: #F2F2F2; font-weight: bold; font-family: 'Times New Roman', serif;">
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Nội dung phát biểu</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: center; width: 100px;">Đúng</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: center; width: 100px;">Sai</th>
                </tr>
              </thead>
              <tbody>
          `;
          
          const statements = q.statements && q.statements.length > 0 ? q.statements : [];
          statements.forEach((st: any, sidx: number) => {
            const letter = ['A', 'B', 'C', 'D'][sidx] || String.fromCharCode(65 + sidx);
            bodyHtml += `
                <tr>
                  <td style="border: 1px solid black; padding: 8px; font-family: 'Times New Roman', serif; font-size: 12.5pt;">
                    <strong style="color: #1e40af;">${letter}.</strong> ${st.text}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; text-align: center; font-size: 12.5pt;">&nbsp;</td>
                  <td style="border: 1px solid black; padding: 8px; text-align: center; font-size: 12.5pt;">&nbsp;</td>
                </tr>
            `;
          });
          
          bodyHtml += `
              </tbody>
            </table>
            <br/>
          `;
        });
      }

      // 3. Matching / Connecting Column Questions (3 columns)
      const matchQs = generatedQuestions.filter(q => q.type === 'matching');
      if (matchQs.length > 0) {
        bodyHtml += `<h2>${sectionTitles.matching}</h2>`;
        matchQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + tfQs.length + idx + 1;
          const leftHeader = q.questionText.toLowerCase().includes("giác quan") ? "(Giác quan)" : "(Khái niệm)";
          const rightHeader = q.questionText.toLowerCase().includes("chức năng") ? "(Chức năng)" : "(Mô tả/Vai trò)";
          bodyHtml += `
            <p><span class="bold">Câu ${offsetIdx} (${formatPoints(q.points)} điểm): ${q.questionText}</span></p>
            <table class="bordered-table" style="width: 100%; border: 1px solid black; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px;">
              <thead>
                <tr style="background-color: #F2F2F2; font-weight: bold; font-family: 'Times New Roman', serif;">
                  <th style="border: 1px solid black; padding: 8px; text-align: center; width: 40%;">CỘT A ${leftHeader}</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: center; width: 20%;">Kết nối</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: center; width: 40%;">CỘT B ${rightHeader}</th>
                </tr>
              </thead>
              <tbody>
          `;
          
          const pairs = q.matchingPairs || [];
          const leftItems = [...pairs].sort((a, b) => String(a.id).localeCompare(String(b.id)));
          const rightItems = [...pairs].sort((a, b) => String(a.id_match || '').toLowerCase().localeCompare(String(b.id_match || '').toLowerCase()));
          
          for (let i = 0; i < pairs.length; i++) {
            const leftItem = leftItems[i];
            const rightItem = rightItems[i];
            if (!leftItem || !rightItem) continue;
            bodyHtml += `
                <tr>
                  <td style="border: 1px solid black; padding: 8px; font-family: 'Times New Roman', serif; font-size: 12.5pt;">
                    ${leftItem.id}. ${cleanPrefix(leftItem.left)}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; text-align: center; font-family: 'Times New Roman', serif; font-size: 12.5pt; font-weight: bold; color: #1e40af;">
                    ${leftItem.id} - .......
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-family: 'Times New Roman', serif; font-size: 12.5pt;">
                    ${rightItem.id_match}. ${cleanPrefix(rightItem.right)}
                  </td>
                </tr>
            `;
          }
          
          bodyHtml += `
              </tbody>
            </table>
            <br/>
          `;
        });
      }

      // 4. Fill-in-the-gaps / Gap-fill Questions
      const gapQs = generatedQuestions.filter(q => q.type === 'gap_fill');
      if (gapQs.length > 0) {
        bodyHtml += `<h2>${sectionTitles.gap_fill}</h2>`;
        gapQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + tfQs.length + matchQs.length + idx + 1;
          bodyHtml += `
            <p><span class="bold">Câu ${offsetIdx} (${formatPoints(q.points)} điểm):</span> ${q.questionText}</p>
            <br/>
          `;
        });
      }

      // 5. Essay Questions
      const essayQs = generatedQuestions.filter(q => q.type === 'essay');
      if (essayQs.length > 0) {
        bodyHtml += `<h2>${sectionTitles.essay}</h2>`;
        essayQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + tfQs.length + matchQs.length + gapQs.length + idx + 1;
          bodyHtml += `
            <p><span class="bold">Câu ${offsetIdx} (${formatPoints(q.points)} điểm): ${q.questionText}</span></p>
            <p style="height: 120px; font-size: 12.5pt;">................................................................................................................................................................................................</p>
            <br/>
          `;
        });
      }

      // Page Break & Answers section
      bodyHtml += `
        <br/><br/>
        <div style="page-break-before: always;"></div>
        <h1 class="text-center" style="text-align: center;">🔑 ĐÁP ÁN & BARÊM ĐIỂM CHI TIẾT</h1>
        <br/>
      `;

      if (mcQs.length > 0) {
        bodyHtml += `<h2 style="text-align: left;">ĐÁP ÁN PHẦN TRẮC NGHIỆM</h2>`;
        mcQs.forEach((q, idx) => {
          bodyHtml += `
            <p style="text-align: left;"><span class="bold">Câu ${idx + 1}:</span> Đáp án chính xác: <span class="bold" style="color: #1e40af;">${renderMcqAnswerText(q)}</span> (${formatPoints(q.points)} điểm).<br/>
            <strong>Hướng dẫn giải thích:</strong> ${q.answerGuide || 'Học sinh chọn phương án đúng tương ứng.'}</p>
            <br/>
          `;
        });
      }

      if (tfQs.length > 0) {
        bodyHtml += `<h2 style="text-align: left;">ĐÁP ÁN PHẦN ĐÚNG - SAI</h2>`;
        tfQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + idx + 1;
          let detailGuide = "";
          if (q.statements && q.statements.length > 0) {
            detailGuide = q.statements.map((st: any, sidx: number) => {
              const letter = ['A', 'B', 'C', 'D'][sidx] || String.fromCharCode(65 + sidx);
              return `&bull; Nhận định ${letter}: <strong>${cleanTrueFalseAns(st.answer || 'Đúng')}</strong> - ${st.text}`;
            }).join('<br/>');
          } else {
            detailGuide = `Đáp án Đúng/Sai: ${cleanTrueFalseAns(q.correctAnswer || '')}`;
          }
          bodyHtml += `
            <p style="text-align: left;"><span class="bold">Câu ${offsetIdx} (${formatPoints(q.points)} điểm):</span> Hướng dẫn đáp án Đúng/Sai chi tiết:<br/>
            ${detailGuide}<br/>
            <strong>Ghi chú sư phạm:</strong> ${formatPedagogicalNotes(q.answerGuide || 'Xác định tính chính xác từng khẳng định liên hệ bài học.')}</p>
            <br/>
          `;
        });
      }

      if (matchQs.length > 0) {
        bodyHtml += `<h2 style="text-align: left;">ĐÁP ÁN PHẦN NỐI CỘT</h2>`;
        matchQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + tfQs.length + idx + 1;
          let matchingGuide = "";
          if (q.correctAnswer) {
            matchingGuide = q.correctAnswer.split(/[,;]\s*/).map(p => `&bull; Ghép nối tương ứng: <strong>${cleanTrueFalseAns(p)}</strong>`).join('<br/>');
          } else {
            matchingGuide = `Đáp án: ${cleanTrueFalseAns(q.correctAnswer || '')}`;
          }
          bodyHtml += `
            <p style="text-align: left;"><span class="bold">Câu ${offsetIdx} (${formatPoints(q.points)} điểm):</span> Hướng dẫn chấm nối cột:<br/>
            ${matchingGuide}<br/>
            <strong>Ghi chú:</strong> ${formatPedagogicalNotes(q.answerGuide || '')}</p>
            <br/>
          `;
        });
      }

      if (gapQs.length > 0) {
        bodyHtml += `<h2 style="text-align: left;">ĐÁP ÁN PHẦN ĐIỀN KHUYẾT</h2>`;
        gapQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + tfQs.length + matchQs.length + idx + 1;
          bodyHtml += `
            <p style="text-align: left;"><span class="bold">Câu ${offsetIdx} (${formatPoints(q.points)} điểm):</span> Đáp án: <span class="bold" style="color: #1e40af;">${cleanTrueFalseAns(q.correctAnswer || '')}</span>.<br/>
            <strong>HƯỚNG DẪN CHẤM CHI TIẾT:</strong> ${q.answerGuide || 'Điền chính xác từ khóa cốt lõi.'}</p>
            <br/>
          `;
        });
      }

      if (essayQs.length > 0) {
        bodyHtml += `<h2>ĐÁP ÁN PHẦN TỰ LUẬN TRÌNH BÀY</h2>`;
        essayQs.forEach((q, idx) => {
          const offsetIdx = mcQs.length + tfQs.length + matchQs.length + gapQs.length + idx + 1;
          bodyHtml += `
            <p><span class="bold">Câu ${offsetIdx}:</span> ${q.questionText}</p>
            <p class="bold">HƯỚNG DẪN CHẤM CHI TIẾT & PHÂN PHỐI ĐIỂM:</p>
            <p class="italic">${q.answerGuide || 'Giáo viên chấm linh hoạt theo ý trình bày khoa học của học sinh.'}</p>
            <br/>
          `;
        });
      }

      const completeHtml = docHeader + bodyHtml + docFooter;

      const cleanFileNameHelper = (name: string): string => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-zA-Z0-9_.-]/g, "_")
          .replace(/__+/g, "_");
      };

      const cleanedName = cleanFileNameHelper(testName);

      const blob = new Blob(['\ufeff' + completeHtml], { type: 'application/vnd.ms-word;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanedName.endsWith('.doc') ? cleanedName : `${cleanedName}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('📥 Đã xuất thành công Đề thi Word (.doc) 12,5pt chuẩn Bộ GD&ĐT!');
    } catch (e) {
      console.error(e);
      triggerToast('❌ Lỗi xuất file Word.');
    }
  };

  const handleExportPDF = async () => {
    const printElement = document.getElementById("print-word-zone");
    if (!printElement) {
      triggerToast("⚠️ Không tìm thấy vùng dữ liệu để xuất PDF!");
      return;
    }

    setIsGenerating(true);
    triggerToast("📄 Đang biên soạn file PDF chất lượng cao, vui lòng đợi...");

    try {
      const { jsPDF } = await import("jspdf");

      // Temporarily hide action overlay tags (like .no-print classes)
      const noPrintEls = printElement.querySelectorAll(".no-print");
      const originalDisplays = Array.from(noPrintEls).map((el: any) => el.style.display);
      noPrintEls.forEach((el: any) => el.style.display = "none");

      // Set fixed background and styles for clean canvas translation
      const originalStyle = printElement.getAttribute("style") || "";
      printElement.setAttribute("style", `${originalStyle}; width: 850px; background: white;`);

      // Sleep briefly to yield thread and let style apply
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await safeHtml2Canvas(printElement, {
        scale: 2, // 2x density for crystal clear text
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const clonedPrintEl = clonedDoc.getElementById("print-word-zone");
          const originalPrintEl = document.getElementById("print-word-zone");

          if (clonedPrintEl && originalPrintEl) {
            const clonedElements = Array.from(clonedPrintEl.querySelectorAll("*"));
            const originalElements = Array.from(originalPrintEl.querySelectorAll("*"));

            clonedElements.unshift(clonedPrintEl);
            originalElements.unshift(originalPrintEl);

            const propertiesToInline = [
              "position", "top", "left", "right", "bottom", "z-index",
              "display", "flex-direction", "flex-wrap", "justify-content", "align-items", "gap",
              "grid-template-columns", "grid-template-rows", "grid-column", "grid-row",
              "width", "height", "max-width", "max-height", "min-width", "min-height",
              "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
              "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
              "background-color", "background-image", "background-size", "background-position", "background-repeat",
              "border", "border-top", "border-bottom", "border-left", "border-right",
              "border-width", "border-top-width", "border-bottom-width", "border-left-width", "border-right-width",
              "border-style", "border-top-style", "border-bottom-style", "border-left-style", "border-right-style",
              "border-color", "border-top-color", "border-bottom-color", "border-left-color", "border-right-color",
              "border-radius", "box-shadow", "opacity",
              "color", "font-family", "font-size", "font-weight", "line-height", "text-align", "vertical-align",
              "text-decoration", "text-transform", "letter-spacing", "word-break", "white-space"
            ];

            clonedElements.forEach((clonedNode, idx) => {
              const originalNode = originalElements[idx];
              if (originalNode && clonedNode instanceof HTMLElement && originalNode instanceof HTMLElement) {
                try {
                  const computed = window.getComputedStyle(originalNode);
                  propertiesToInline.forEach((prop) => {
                    const camelProp = prop.replace(/-./g, (x) => x[1].toUpperCase());
                    let value = computed.getPropertyValue(prop) || (computed as any)[camelProp];
                    if (value) {
                      if (typeof value === "string" && (value.includes("oklch") || value.includes("oklab") || value.includes("color("))) {
                        value = parseOklchAndReplace(value);
                      }
                      clonedNode.style.setProperty(prop, value);
                    }
                  });
                } catch (e) {
                  // Ignore
                }
              }
            });

            // Do a sweep on all cloned nodes to clean up any raw inline style attributes containing oklch/oklab
            clonedElements.forEach((clonedNode) => {
              if (clonedNode instanceof HTMLElement) {
                try {
                  const rawStyle = clonedNode.getAttribute("style");
                  if (rawStyle && (rawStyle.includes("oklch") || rawStyle.includes("oklab") || rawStyle.includes("color("))) {
                    clonedNode.setAttribute("style", parseOklchAndReplace(rawStyle));
                  }
                } catch (e) {
                  // Ignore
                }
              }
            });

            // Clean inline stylesheets (replace raw OKLCH/OKLAB references)
            const styleTags = clonedDoc.querySelectorAll("style");
            styleTags.forEach((style) => {
              try {
                let cssText = style.innerHTML;
                if (cssText && (cssText.includes("oklch") || cssText.includes("oklab") || cssText.includes("color("))) {
                  cssText = parseOklchAndReplace(cssText);
                  style.innerHTML = cssText;
                }
              } catch (styleErr) {
                // Ignore
              }
            });

            // Prevent fetching of raw untranslated production stylesheet files that crash html2canvas with oklch errors
            const linkTags = clonedDoc.querySelectorAll("link[rel='stylesheet']");
            linkTags.forEach((tag) => {
              try {
                tag.remove();
              } catch (lErr) {}
            });
          }
        }
      });

      // Restore original styles & displays
      printElement.setAttribute("style", originalStyle);
      noPrintEls.forEach((el: any, idx) => {
        el.style.display = originalDisplays[idx] || "";
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Create PDF standard A4 canvas dimensions
      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();

      // Fit canvas image proportionally inside the PDF columns
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let remainingHeight = imgHeight;
      let yOffset = 0;

      // Draw first page
      doc.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight, undefined, "FAST");
      remainingHeight -= pdfHeight;

      // Render subsequent pages as overflowing content demands
      while (remainingHeight > 0) {
        yOffset = remainingHeight - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight, undefined, "FAST");
        remainingHeight -= pdfHeight;
      }

      const rawName = testName.replace(/\s+/g, "_") || "De_thi_song_ngu_AI";
      doc.save(`${rawName}.pdf`);
      triggerToast("🎉 Đã xuất bản thành công File PDF học liệu chuẩn Bộ GD&ĐT!");
      SoundEffects.playKeng();
    } catch (err: any) {
      console.error("Lỗi xuất PDF qua jsPDF:", err);
      triggerToast("❌ Không thể kết xuất PDF bằng công cụ AI. Thay thế bằng in trình duyệt...");
      // Fallback
      handlePrintPDF();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    const printElement = document.getElementById("print-word-zone");
    if (!printElement) {
      triggerToast("⚠️ Không tìm thấy vùng in dữ liệu để xuất PDF!");
      return;
    }
    
    // Create isolated iframe for high resolution paper size print
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      window.print();
      return;
    }
    
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>${testName || 'De_kiem_tra'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
            body { 
              font-family: "Times New Roman", Times, Baskerville, Georgia, serif; 
              font-size: 14pt; 
              line-height: 1.45; 
              padding: 1.5cm; 
              color: #000;
              background-color: #fff;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-family: "Times New Roman", serif;
              font-size: 13pt;
              margin: 15px 0;
            }
            th, td { 
              border: 1.5px solid #000; 
              padding: 6px 10px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .text-center { text-align: center; }
            .bg-slate-100 { background-color: #f5f5f5; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .border-double { border-bottom-style: double; }
            .space-y-4 > * + * { margin-top: 15px; }
            .space-y-6 > * + * { margin-top: 25px; }
            .pb-4 { padding-bottom: 8px; }
            .pt-4 { padding-top: 15px; }
            .pl-2 { padding-left: 8px; }
            .pl-3 { padding-left: 12px; }
            .pl-4 { padding-left: 16px; }
            .mt-6 { margin-top: 20px; }
            .mt-8 { margin-top: 30px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .gap-2 { gap: 8px; }
            .gap-2\\.5 { gap: 10px; }
            .p-2 { padding: 8px; }
            .border { border: 1.5px solid #000; }
            .rounded-xl { border-radius: 8px; }
            .italic { font-style: italic; }
            .shrink-0 { flex-shrink: 0; }
            .flex { display: flex; }
            .gap-1\\.5 { gap: 6px; }
            .border-l-2 { border-left: 2px solid #000; }
            .border-l-4 { border-left: 4px solid #2454a6; }
            .text-indigo-950 { color: #1e1b4b; }
            
            /* Custom CSS formatting specifically for official layouts */
            .official-header {
              display: flex;
              justify-content: space-between;
              font-size: 11pt;
              margin-bottom: 20px;
              font-family: "Times New Roman", serif;
              line-height: 1.3;
            }
            .no-print { display: none !important; }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <div>
            ${printElement.innerHTML}
          </div>
          <script>
            // Remove unnecessary UI panels before browser print
            const panels = document.querySelectorAll(".no-print");
            panels.forEach(p => p.remove());
            
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(() => {
                window.frameElement.remove();
              }, 1200);
            };
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();
  };

  const handleSaveOnlineExamToSystem = () => {
    if (!configTestName.trim()) {
      triggerToast("⚠️ Xin vui lòng điền Tên bài kiểm tra!");
      return;
    }
    
    const customExams = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    const newExam = {
      id: `exam-${Date.now()}`,
      testName: configTestName,
      subject: subject,
      grade: Number(String(grade).replace(/[^0-9]/g, '')) || 3,
      curriculumBook: curriculumBook,
      questions: generatedQuestions,
      timeLimit: Number(configDuration),
      showAnswerOnSubmit: configShowAnswers,
      accessCode: configSecurityLimit ? configAccessCode : '',
      createdAt: new Date().toISOString(),
      submissions: [],
      creatorName: currUser?.fullname || "Ban Quản Trị",
      creatorUsername: currUser?.username || "admin",
      isPracticalEnabled: false
    };
    
    customExams.unshift(newExam);
    localStorage.setItem('lms_custom_exams', JSON.stringify(customExams));
    fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExam)
    }).catch(err => console.error("Error saving manual exam to server:", err));
    
    // Initialize interactive online exam states to take the exam immediately
    setStudentAnswers({});
    setOnlineSubmitted(false);
    setOnlineTimeLeft(Number(configDuration) * 60);
    setOnlineTimerActive(true);
    setOnlineCourseCode(configSecurityLimit && configAccessCode ? configAccessCode : 'IC3-FREE');
    
    setShowOnlineConfigModal(false);
    setShowPreviewModal(false);
    
    if (onTabChange && setLocalTakeExamId) {
      setLocalTakeExamId(newExam.id);
      onTabChange('online_exams');
      triggerToast("🎉 Đã tạo phòng thi thành công và chuyển sang giao diện Phòng thi trực tuyến!");
    } else {
      setShowOnlineExamModal(true); // Open the practice exam taker view immediately
      triggerToast("🎉 Đã tạo đề thi Online thành công và bắt đầu thi trực tuyến!");
    }
    SoundEffects.playKeng();
  };

  const renderMatrixCell = (row: any, level: 'm1' | 'm2' | 'm3' | 'm4') => {
    const isMcqSelected = (row[level]?.mcq || 0) > 0;
    const isEssaySelected = (row[level]?.essay || 0) > 0;
    
    return (
      <td className="p-2 border border-slate-200 bg-white align-middle text-center">
        <div className="flex flex-col gap-1.5 justify-center items-center">
          {/* MCQ */}
          <div className={`flex items-center justify-between gap-1 px-1.5 py-1 rounded-lg border w-full max-w-[90px] transition-all ${
            isMcqSelected ? 'bg-green-200 border-green-300 text-blue-800 shadow-3xs' : 'bg-green-100 border-green-200 text-blue-700'
          }`}>
            <span className="text-[9.5px] font-black uppercase text-blue-800">TN:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const nextVal = Math.max(0, (row[level]?.mcq || 0) - 1);
                  setMatrixRows(matrixRows.map(r => r.id === row.id ? { ...r, [level]: { ...r[level], mcq: nextVal } } : r));
                }}
                className="w-3.5 h-3.5 rounded bg-white hover:bg-green-200 border border-green-300 flex items-center justify-center font-black text-blue-800 cursor-pointer text-[10px]"
              >
                -
              </button>
              <span className="w-3 text-center font-bold font-mono text-[11px] text-blue-800">{row[level]?.mcq || 0}</span>
              <button
                type="button"
                onClick={() => {
                  const nextVal = (row[level]?.mcq || 0) + 1;
                  setMatrixRows(matrixRows.map(r => r.id === row.id ? { ...r, [level]: { ...r[level], mcq: nextVal } } : r));
                }}
                className="w-3.5 h-3.5 rounded bg-white hover:bg-green-200 border border-green-300 flex items-center justify-center font-black text-blue-800 cursor-pointer text-[10px]"
              >
                +
              </button>
            </div>
          </div>

          {/* Essay */}
          <div className={`flex items-center justify-between gap-1 px-1.5 py-1 rounded-lg border w-full max-w-[90px] transition-all ${
            isEssaySelected ? 'bg-yellow-100 border-yellow-200 text-red-700 shadow-3xs' : 'bg-yellow-50 border-yellow-100 text-red-600'
          }`}>
            <span className="text-[9.5px] font-black uppercase text-red-700">TL:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const nextVal = Math.max(0, (row[level]?.essay || 0) - 1);
                  setMatrixRows(matrixRows.map(r => r.id === row.id ? { ...r, [level]: { ...r[level], essay: nextVal } } : r));
                }}
                className="w-3.5 h-3.5 rounded bg-white hover:bg-yellow-200 border border-yellow-250 flex items-center justify-center font-black text-red-700 cursor-pointer text-[10px]"
              >
                -
              </button>
              <span className="w-3 text-center font-bold font-mono text-[11px] text-red-700">{row[level]?.essay || 0}</span>
              <button
                type="button"
                onClick={() => {
                  const nextVal = (row[level]?.essay || 0) + 1;
                  setMatrixRows(matrixRows.map(r => r.id === row.id ? { ...r, [level]: { ...r[level], essay: nextVal } } : r));
                }}
                className="w-3.5 h-3.5 rounded bg-white hover:bg-yellow-200 border border-yellow-250 flex items-center justify-center font-black text-red-700 cursor-pointer text-[10px]"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </td>
    );
  };

  const sectionsExist = {
    multiple_choice: generatedQuestions.some(q => q.type === 'multiple_choice'),
    true_false: generatedQuestions.some(q => q.type === 'true_false'),
    matching: generatedQuestions.some(q => q.type === 'matching'),
    gap_fill: generatedQuestions.some(q => q.type === 'gap_fill'),
    essay: generatedQuestions.some(q => q.type === 'essay')
  };

  const sectionTitles: Record<string, string> = {};
  const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];
  let previewRIdx = 0;

  if (sectionsExist.multiple_choice) {
    sectionTitles.multiple_choice = `${romanNumerals[previewRIdx++]}. PHẦN TRẮC NGHIỆM 4 PHƯƠNG ÁN`;
  }
  if (sectionsExist.true_false) {
    sectionTitles.true_false = `${romanNumerals[previewRIdx++]}. PHẦN ĐÚNG - SAI`;
  }
  if (sectionsExist.matching) {
    sectionTitles.matching = `${romanNumerals[previewRIdx++]}. PHẦN NỐI CỘT`;
  }
  if (sectionsExist.gap_fill) {
    sectionTitles.gap_fill = `${romanNumerals[previewRIdx++]}. PHẦN ĐIỀN KHUYẾT`;
  }
  if (sectionsExist.essay) {
    sectionTitles.essay = `${romanNumerals[previewRIdx++]}. PHẦN TỰ LUẬN TRÌNH BÀY CHI TIẾT`;
  }

  return (
    <div className="space-y-6 text-left pb-16 animate-fade-in text-[12px] text-slate-700 bg-slate-50/50 p-1 md:p-4 rounded-3xl min-h-screen">
      
      {/* Dynamic Toast feedback */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce text-xs border border-slate-700">
          <span className="text-emerald-400">✨</span> {toast}
        </div>
      )}

      {/* Main Container Layout matching the image exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: THÔNG TIN CHUNG */}
        <div id="thong-tin-chung" className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Header Title with Info Circle */}
            <div className="flex items-center gap-2 text-[#2454a6] font-black text-sm border-b border-slate-100 pb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <span className="tracking-wide uppercase text-slate-800 text-[13.5px]">Thông Tin Chung</span>
            </div>

            <div className="space-y-4 text-xs font-bold">
              
              {/* Grid for WORK SCHOOL and DISTRICT ZONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-slate-650 text-[10.5px]">Đặc khu (xã, huyện)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ:扩大 ỦY BAN NHÂN DÂN QUẬN 1"
                    value={districtZone || ''}
                    onChange={(e) => setDistrictZone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50/70 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-650 rounded-xl font-bold text-slate-800 focus:outline-none transition-all placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-slate-650 text-[10.5px]">Trường công tác</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: TRƯỜNG TIỂU HỌC NGUYỄN HUỆ"
                    value={workSchool || ''}
                    onChange={(e) => setWorkSchool(e.target.value)}
                    className="w-full p-2.5 bg-slate-50/70 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-650 rounded-xl font-bold text-slate-800 focus:outline-none transition-all placeholder:font-normal"
                  />
                </div>
              </div>
              
              {/* Grid for SUBJECT and GRADE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-slate-650 text-[10.5px]">Môn học <span className="text-red-500 font-bold">*</span></label>
                  <select
                    value={subject || 'Tin học'}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50/70 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-650 rounded-xl font-bold text-slate-800 focus:outline-none transition-all"
                  >
                    <option value="Tin học">Tin học</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-slate-650 text-[10.5px]">{`Khối Lớp`}</label>
                  <select
                    value={grade || 'Lớp 3'}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2.5 bg-slate-50/70 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-650 rounded-xl font-bold text-slate-800 focus:outline-none transition-all"
                  >
                    <option value="Lớp 1">Lớp 1</option>
                    <option value="Lớp 2">Lớp 2</option>
                    <option value="Lớp 3">Lớp 3</option>
                    <option value="Lớp 4">Lớp 4</option>
                    <option value="Lớp 5">Lớp 5</option>
                  </select>
                </div>
              </div>

              {/* Curriculum SGK selection */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-slate-650 text-[10.5px]">Bộ Sách Giáo Khoa</label>
                <select
                  value={curriculumBook || 'Kết nối tri thức với cuộc sống'}
                  onChange={(e) => setCurriculumBook(e.target.value)}
                  className="w-full p-2.5 bg-slate-50/70 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-650 rounded-xl font-bold text-slate-800 focus:outline-none transition-all"
                >
                  <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                  <option value="Cánh diều">Cánh diều</option>
                  <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                </select>
              </div>

              {/* Test Exam Title with star */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-slate-650 text-[10.5px]">Tên Bài thi <span className="text-red-500 font-bold">*</span></label>
                <input
                  type="text"
                  required
                  value={testName || ''}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra 15 phút, Thi giữa kì 1, Đề thi thử..."
                  className="w-full p-3 bg-slate-50/70 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-650 rounded-xl font-bold text-slate-855 placeholder:text-gray-400/80 focus:outline-none transition-all"
                />
              </div>

              {/* Lesson Target Content with edit tool */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-slate-850 font-black text-xs">
                  <PenTool className="w-4 h-4 text-blue-600" />
                  <span className="uppercase text-slate-800 text-[10.5px] tracking-wide">Nội dung bài học <span className="text-red-500 font-bold">*</span></span>
                </div>
                
                <div className="relative border border-slate-200 bg-slate-50/40 rounded-2xl focus-within:ring-1 focus-within:ring-blue-600 focus-within:bg-white transition-all overflow-hidden p-1">
                  <textarea
                    required
                    value={lessonContent || ''}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Nhập yêu cầu chi tiết nội dung bài học hoặc tải ảnh SGK chứa nội dung bài học"
                    className="w-full min-h-[140px] max-h-[220px] p-3 text-xs bg-transparent border-none outline-none font-semibold text-slate-800 placeholder:text-slate-400 leading-relaxed resize-y focus:outline-none focus:ring-0"
                  />
                  
                  {/* Embedded mock uploader inside textarea at bottom-right */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                    {attachedImage && (
                      <div className="relative group w-8 h-8 rounded-lg overflow-hidden border border-slate-300">
                        <img src={attachedImage} className="w-full h-full object-cover" alt="Sgk reference" />
                        <button 
                          type="button"
                          onClick={() => setAttachedImage(null)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                          title="Remove image"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={triggerImageUpload}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200/60 shadow-sm transition-all focus:outline-none flex items-center gap-1 cursor-pointer"
                      title="Đính kèm ảnh SGK từ máy tính"
                    >
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CẤU TRÚC ĐỀ & MA TRẬN */}
        <div id="cau-truc-de" className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          
          {/* Header Title with Pen Tool & Tab Selectors */}
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2454a6] font-black text-sm">
                <PenTool className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="tracking-wide uppercase text-slate-800 text-[13.5px]">Cấu trúc Đề thi & Ma trận</span>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-50 text-[#1e3a8a] py-1 px-3 rounded-full text-[10px] font-extrabold border border-indigo-150">
                <span>Thang điểm 10</span>
              </div>
            </div>

            {/* Toggle tabs for Manual groups vs Automatic Matrix */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveTab('manual'); SoundEffects.playTing(); }}
                className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${activeTab === 'manual' ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Cấu hình Nhóm Thủ công 📋
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('matrix_create'); SoundEffects.playTing(); }}
                className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${activeTab === 'matrix_create' ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Tự tạo Ma trận Đề thi 📊
              </button>
            </div>
          </div>

          {activeTab === 'manual' ? (
            <div className="space-y-4">
              {/* Subsection header with controls */}
              <div className="flex items-center justify-between gap-3">
                <span className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider">Danh sách nhóm câu hỏi</span>
                
                {/* Add group button */}
                <button
                  onClick={handleAddNewGroup}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10.5px] shadow-sm cursor-pointer transition-all uppercase tracking-wider active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm nhóm mới
                </button>
              </div>

              {/* Group Configuration cards structured as 2-column grid as requested */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {groups.map((group, index) => (
                  <div 
                    key={group.id} 
                    className="relative border-2 border-slate-150 bg-slate-50/55 rounded-2xl p-4 space-y-3 shadow-2xs hover:border-blue-400 focus-within:border-blue-400 transition-all text-slate-705 font-bold text-xs"
                  >
                    {/* Delete group pill */}
                    <button
                      onClick={() => handleRemoveGroup(group.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
                      title="Xóa nhóm này"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="text-[10.5px] text-blue-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <span>Nhóm {index + 1}: {group.questionType === "Đúng - Sai" ? "Đúng Sai" : group.questionType}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* LOẠI CÂU HỎI */}
                      <div className="space-y-1">
                        <label className="block text-[9.5px] uppercase tracking-wider text-slate-500">Loại câu hỏi</label>
                        <select
                          value={group.questionType}
                          onChange={(e) => updateGroup(group.id, 'questionType', e.target.value)}
                          className="w-full text-xs font-black p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Trắc nghiệm">Trắc nghiệm</option>
                          <option value="Đúng - Sai">Đúng - Sai</option>
                          <option value="Nối cột">Nối cột</option>
                          <option value="Điền khuyết">Điền khuyết</option>
                          <option value="Tự luận ngắn">Tự luận ngắn</option>
                        </select>
                      </div>

                      {/* MỨC ĐỘ KIẾN THỨC */}
                      <div className="space-y-1">
                        <label className="block text-[9.5px] uppercase tracking-wider text-slate-500">Mức độ kiến thức</label>
                        <select
                          value={group.difficulty}
                          onChange={(e) => updateGroup(group.id, 'difficulty', e.target.value)}
                          className="w-full text-xs font-black p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Nhận biết">Nhận biết</option>
                          <option value="Thông hiểu">Thông hiểu</option>
                          <option value="Vận dụng">Vận dụng</option>
                        </select>
                      </div>

                      {/* QUANTITY */}
                      <div className="flex items-center justify-between bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/40">
                        <label className="block text-[9.5px] uppercase tracking-wider text-[#1e3a8a] font-bold">Số câu</label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (group.quantity > 1) {
                                updateGroup(group.id, 'quantity', group.quantity - 1);
                              }
                            }}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-150 border border-slate-200 flex items-center justify-center font-black text-slate-705 cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={group.quantity}
                            onChange={(e) => updateGroup(group.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="text-xs font-black text-blue-750 font-mono w-14 text-center bg-white border border-slate-200 rounded-lg p-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-2xs"
                          />
                          <button
                            onClick={() => updateGroup(group.id, 'quantity', group.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-150 border border-slate-200 flex items-center justify-center font-black text-slate-705 cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* WEIGHT SCORE */}
                      <div className="flex items-center justify-between bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/40">
                        <label className="block text-[9.5px] uppercase tracking-wider text-amber-900 font-bold">Số điểm</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const step = 0.25;
                              if (group.pointsPerQuestion > step) {
                                updateGroup(group.id, 'pointsPerQuestion', Number((group.pointsPerQuestion - step).toFixed(2)));
                              }
                            }}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-150 border border-slate-200 flex items-center justify-center font-black text-slate-705 cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            max="10"
                            value={group.pointsPerQuestion}
                            onChange={(e) => updateGroup(group.id, 'pointsPerQuestion', Math.max(0.25, parseFloat(e.target.value) || 0.25))}
                            className="text-xs font-black text-amber-900 font-mono w-14 text-center bg-white border border-slate-200 rounded-lg p-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const step = 0.25;
                              updateGroup(group.id, 'pointsPerQuestion', Number((group.pointsPerQuestion + step).toFixed(2)));
                            }}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-150 border border-slate-200 flex items-center justify-center font-black text-slate-705 cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Automatic Matrix setup card matching 1.TaoMaTran.png */
            <div className="space-y-6 animate-fade-in py-2">
              <div className="w-full max-w-md mx-auto bg-blue-50/15 border-2 border-blue-100 rounded-[32px] p-8 shadow-3xs flex flex-col items-center justify-center text-center space-y-6">
                {/* Center Document Icon in Circle */}
                <div className="w-16 h-16 rounded-full bg-blue-100/70 flex items-center justify-center shadow-2xs border border-blue-200/20">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>

                {/* Title */}
                <h4 className="text-blue-900 font-black text-lg tracking-tight">
                  Tự tạo theo Thông tư 27
                </h4>

                {/* Description Paragraph */}
                <p className="text-slate-500 font-semibold text-[11.5px] leading-relaxed max-w-sm">
                  Hệ thống sẽ tự động thiết lập ma trận và tạo đề thi bám sát cấu trúc định dạng đề thi theo Thông tư số 27/2020/TT-BGDĐT (Tiểu học) của Bộ Giáo dục và Đào tạo.
                </p>

                {/* Button $ Tạo ma trận */}
                <button
                  type="button"
                  onClick={handleAutoCreateMatrix}
                  disabled={isMatrixProcessing}
                  className={`py-3 px-8 text-white font-black rounded-2xl text-[12.5px] tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 hover:shadow-lg ${
                    isMatrixProcessing
                      ? 'bg-slate-300 text-slate-500 cursor-wait'
                      : isMatrixCreated
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-[#2454a6] hover:bg-blue-700'
                  }`}
                >
                  {isMatrixProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang phân bổ ma trận...
                    </>
                  ) : isMatrixCreated ? (
                    <>
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-100" />
                      Đã tạo thành công!
                    </>
                  ) : (
                    <>
                      <span className="font-extrabold text-[13px]">$</span> Tạo ma trận
                    </>
                  )}
                </button>

                {isMatrixCreated && (
                  <div className="text-[10.5px] text-emerald-700 bg-emerald-50/60 border border-emerald-100 px-4 py-2.5 rounded-2xl w-full text-center font-extrabold animate-fade-in space-y-1">
                    <p>✓ Đã thiết lập Ma trận Thông tư 27 tự động ({matrixTotalScore.toFixed(1)}đ) thành công!</p>
                    <p className="text-slate-500 font-normal">Quý Thầy/Cô có thể nhấn nút <strong>Bắt đầu tạo đề thi</strong> bên dưới để biên soạn đề ngay.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {activeTab === 'matrix_create' && isMatrixCreated && (
        <div className="mt-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-[#2454a6] font-black text-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#2454a6]">
                <Table className="w-5 h-5" />
              </div>
              <span className="tracking-wide uppercase text-slate-800 text-[14px]">MA TRẬN ĐỀ THI (CÓ THỂ SỬA TRỰC TIẾP)</span>
            </div>
            <button
              type="button"
              onClick={handleAddMatrixRow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-md"
            >
              <Plus className="w-4 h-4" /> THÊM CHỦ ĐỀ
            </button>
          </div>

          {/* Score Settings Panel */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-3xs">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-[11px] uppercase tracking-wide border-b border-slate-200/40 pb-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>CÀI ĐẶT ĐIỂM SỐ</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* MCQ Points */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Điểm trắc nghiệm
                </label>
                <div className="relative flex items-center max-w-xs">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    value={matrixMcqPoint}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setMatrixMcqPoint(isNaN(val) ? 0 : Math.round(val * 100) / 100);
                    }}
                    className="w-full text-xs font-black text-blue-800 bg-white border border-slate-250 rounded-xl p-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-2xs"
                  />
                  <div className="absolute right-1.5 flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMatrixMcqPoint(prev => Number((prev + 0.25).toFixed(2)));
                      }}
                      className="p-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 focus:outline-none cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMatrixMcqPoint(prev => Math.max(0, Number((prev - 0.25).toFixed(2))));
                      }}
                      className="p-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 focus:outline-none cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Essay Points */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Điểm tự luận / Loại câu khác
                </label>
                <div className="relative flex items-center max-w-xs">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    value={matrixEssayPoint}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setMatrixEssayPoint(isNaN(val) ? 0 : Math.round(val * 100) / 100);
                    }}
                    className="w-full text-xs font-black text-amber-800 bg-white border border-slate-250 rounded-xl p-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-2xs"
                  />
                  <div className="absolute right-1.5 flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMatrixEssayPoint(prev => Number((prev + 0.25).toFixed(2)));
                      }}
                      className="p-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-600 focus:outline-none cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMatrixEssayPoint(prev => Math.max(0, Number((prev - 0.25).toFixed(2))));
                      }}
                      className="p-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-600 focus:outline-none cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table container */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-3xs">
            <table className="w-full text-left text-[11.5px] border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase">
                  <th className="p-4 w-[12%] text-center border-r border-slate-200 bg-slate-50 text-[10px]">CHỦ ĐỀ KIẾN THỨC</th>
                  <th className="p-4 w-[20%] border-r border-slate-200 bg-slate-50">BÀI HỌC</th>
                  <th className="p-3 text-center border-r border-slate-200 bg-slate-50">MỨC 1 (NHẬN BIẾT)</th>
                  <th className="p-3 text-center border-r border-slate-200 bg-slate-50">MỨC 2 (THÔNG HIỂU)</th>
                  <th className="p-3 text-center border-r border-slate-200 bg-slate-50">MỨC 3 (VẬN DỤNG)</th>
                  <th className="p-4 text-center border-r border-slate-200 bg-slate-50 w-[100px]">TỔNG SỐ CÂU</th>
                  <th className="p-4 text-center w-[50px] bg-slate-50"></th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const groups: { [key: string]: any[] } = {};
                  matrixRows.forEach(row => {
                    const topic = row.topicName || "Chủ đề chưa đặt tên";
                    if (!groups[topic]) {
                      groups[topic] = [];
                    }
                    groups[topic].push(row);
                  });

                  return Object.entries(groups).map(([topicName, rows], groupIdx) => {
                    return rows.flatMap((row, rowIdx) => {
                      const rowMcqQty = (Number(row.m1?.mcq) || 0) + (Number(row.m2?.mcq) || 0) + (Number(row.m3?.mcq) || 0);
                      const rowEssayQty = (Number(row.m1?.essay) || 0) + (Number(row.m2?.essay) || 0) + (Number(row.m3?.essay) || 0);
                      const rowTotalQty = rowMcqQty + rowEssayQty;

                      const safeQTypes = getSafeQTypes(row);

                      return [
                        <tr key={row.id} className="border-b border-slate-200/50 hover:bg-slate-50/10 bg-white">
                          {rowIdx === 0 && (
                            <td 
                              rowSpan={rows.length * 2} 
                              className="p-2 border-r border-b border-slate-200 font-extrabold text-slate-800 text-[11px] bg-slate-50/20 align-middle text-center w-[12%]"
                            >
                              <textarea
                                value={topicName}
                                rows={2}
                                onChange={(e) => {
                                  const nextVal = e.target.value;
                                  setMatrixRows(matrixRows.map(r => r.topicName === topicName ? { ...r, topicName: nextVal } : r));
                                }}
                                className="bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-1 w-full text-center resize-none font-extrabold text-slate-800 focus:outline-none transition-all text-xs"
                              />
                            </td>
                          )}
                          
                          <td className="p-4 border-r border-slate-200 align-middle">
                            <input
                              type="text"
                              value={row.lessonName}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                setMatrixRows(matrixRows.map(r => r.id === row.id ? { ...r, lessonName: nextVal } : r));
                              }}
                              className="bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-1.5 w-full font-bold text-slate-700 focus:outline-none transition-all text-xs"
                            />
                          </td>

                          {renderMatrixCell(row, 'm1')}
                          {renderMatrixCell(row, 'm2')}
                          {renderMatrixCell(row, 'm3')}

                          <td className="p-4 border-r border-slate-200 align-middle text-center font-extrabold text-slate-800">
                            <div className="text-[13px] font-black text-slate-900">{rowTotalQty}</div>
                          </td>

                          <td className="p-4 align-middle text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMatrixRow(row.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Xóa bài học này"
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>,

                        <tr key={`${row.id}-types`} className="border-b border-slate-200 bg-slate-50/30">
                          <td colSpan={6} className="p-1.5 pl-4 align-middle border-r border-slate-200">
                            <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mr-1 shrink-0">Dạng câu:</span>
                              
                              {/* MCQ (Trắc nghiệm) */}
                              <div className="flex items-center gap-1 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded-full shadow-3xs shrink-0">
                                <span className="text-[10px] font-bold text-slate-600">Trắc nghiệm:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrementQType(row.id, 'mcq')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10.5px] font-black text-blue-700 w-3 text-center font-mono">{safeQTypes.mcq}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrementQType(row.id, 'mcq')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* True/False (Đúng / Sai) */}
                              <div className="flex items-center gap-1 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded-full shadow-3xs shrink-0">
                                <span className="text-[10px] font-bold text-slate-600">Đúng/Sai:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrementQType(row.id, 'trueFalse')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10.5px] font-black text-emerald-700 w-3 text-center font-mono">{safeQTypes.trueFalse}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrementQType(row.id, 'trueFalse')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Gap fill (Điền khuyết) */}
                              <div className="flex items-center gap-1 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded-full shadow-3xs shrink-0">
                                <span className="text-[10px] font-bold text-slate-600">Điền khuyết:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrementQType(row.id, 'gapFill')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10.5px] font-black text-amber-700 w-3 text-center font-mono">{safeQTypes.gapFill}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrementQType(row.id, 'gapFill')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Matching (Nối cột) */}
                              <div className="flex items-center gap-1 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded-full shadow-3xs shrink-0">
                                <span className="text-[10px] font-bold text-slate-600">Nối cột:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrementQType(row.id, 'matching')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10.5px] font-black text-violet-700 w-3 text-center font-mono">{safeQTypes.matching}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrementQType(row.id, 'matching')}
                                    className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Essay (Tự luận) */}
                              <div className="flex items-center gap-1 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded-full shadow-3xs shrink-0">
                                <span className="text-[10px] font-bold text-slate-600">Tự luận:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10.5px] font-black text-rose-700 w-3 text-center font-mono">{safeQTypes.essay || 0}</span>
                                </div>
                              </div>

                              {/* Limit Info Badge */}
                              <div className="ml-auto text-[9.5px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                Phân bổ: {(safeQTypes.mcq + safeQTypes.trueFalse + safeQTypes.gapFill + safeQTypes.matching + safeQTypes.essay)} / {rowTotalQty} câu
                              </div>
                            </div>
                          </td>
                        </tr>
                      ];
                    });
                  });
                })()}
              </tbody>
              <tfoot>
                {/* TỔNG SỐ CÂU HỎI */}
                <tr className="bg-slate-50/40 border-t-2 border-b border-slate-200 font-bold text-slate-800">
                  <td colSpan={2} className="p-4 text-left font-black uppercase text-[11px] text-slate-900 border-r border-slate-200">
                    TỔNG SỐ CÂU HỎI
                  </td>
                  {/* M1 Total */}
                  <td className="p-3 border-r border-slate-200 text-center text-[11px] font-bold">
                    <div className="flex flex-col gap-0.5 justify-center items-center text-slate-500 font-semibold text-[10px]">
                      <div>TN: {m1McqTotal}</div>
                      <div>TL: {m1EssayTotal}</div>
                      <div className="w-12 h-[1px] bg-slate-200 my-1"></div>
                      <div className="text-blue-700 font-black text-[12px]">Tổng {m1McqTotal + m1EssayTotal}</div>
                    </div>
                  </td>
                  {/* M2 Total */}
                  <td className="p-3 border-r border-slate-200 text-center text-[11px] font-bold">
                    <div className="flex flex-col gap-0.5 justify-center items-center text-slate-500 font-semibold text-[10px]">
                      <div>TN: {m2McqTotal}</div>
                      <div>TL: {m2EssayTotal}</div>
                      <div className="w-12 h-[1px] bg-slate-200 my-1"></div>
                      <div className="text-blue-700 font-black text-[12px]">Tổng {m2McqTotal + m2EssayTotal}</div>
                    </div>
                  </td>
                  {/* M3 Total */}
                  <td className="p-3 border-r border-slate-200 text-center text-[11px] font-bold">
                    <div className="flex flex-col gap-0.5 justify-center items-center text-slate-500 font-semibold text-[10px]">
                      <div>TN: {m3McqTotal}</div>
                      <div>TL: {m3EssayTotal}</div>
                      <div className="w-12 h-[1px] bg-slate-200 my-1"></div>
                      <div className="text-blue-700 font-black text-[12px]">Tổng {m3McqTotal + m3EssayTotal}</div>
                    </div>
                  </td>
                  {/* Overall Total count */}
                  <td className="p-4 border-r border-slate-200 text-center font-black text-blue-700 text-[20px] align-middle">
                    {matrixMcqQty + matrixEssayQty}
                  </td>
                  <td className="bg-slate-50/40"></td>
                </tr>

                {/* TỔNG ĐIỂM (ĐIỂM) */}
                <tr className="bg-slate-50/40 border-b border-slate-200 font-black text-slate-900">
                  <td colSpan={2} className="p-4 text-left font-black uppercase text-[11px] text-slate-900 border-r border-slate-200">
                    TỔNG ĐIỂM (ĐIỂM)
                  </td>
                  <td className="p-4 border-r border-slate-200 text-center text-blue-800 font-extrabold text-[13px]">
                    {m1TotalScore.toFixed(2)}
                  </td>
                  <td className="p-4 border-r border-slate-200 text-center text-blue-800 font-extrabold text-[13px]">
                    {m2TotalScore.toFixed(2)}
                  </td>
                  <td className="p-4 border-r border-slate-200 text-center text-blue-800 font-extrabold text-[13px]">
                    {m3TotalScore.toFixed(2)}
                  </td>
                  <td className="p-4 border-r border-slate-200 text-center font-black text-slate-900 text-[14px]">
                    {matrixTotalScore.toFixed(2)}
                  </td>
                  <td className="bg-slate-50/40"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 3 Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {/* Bento 1: M1 */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 shadow-3xs">
              <span className="text-blue-600 font-black text-[10.5px] uppercase tracking-wider">NHẬN BIẾT (M1)</span>
              <span className="text-slate-800 font-black text-2xl">{m1TotalScore.toFixed(2)} <span className="text-sm font-semibold text-slate-500">điểm</span></span>
              <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-extrabold px-3 py-1 rounded-full">
                Tỉ lệ {((m1TotalScore / (scoreScale || 10)) * 100).toFixed(0)}%
              </span>
            </div>

            {/* Bento 2: M2 */}
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 shadow-3xs">
              <span className="text-emerald-600 font-black text-[10.5px] uppercase tracking-wider">THÔNG HIỂU (M2)</span>
              <span className="text-slate-800 font-black text-2xl">{m2TotalScore.toFixed(2)} <span className="text-sm font-semibold text-slate-500">điểm</span></span>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full">
                Tỉ lệ {((m2TotalScore / (scoreScale || 10)) * 100).toFixed(0)}%
              </span>
            </div>

            {/* Bento 3: M3 */}
            <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 shadow-3xs">
              <span className="text-amber-600 font-black text-[10.5px] uppercase tracking-wider">VẬN DỤNG (M3)</span>
              <span className="text-slate-800 font-black text-2xl">{m3TotalScore.toFixed(2)} <span className="text-sm font-semibold text-slate-500">điểm</span></span>
              <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full">
                Tỉ lệ {((m3TotalScore / (scoreScale || 10)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROL & STATUS PANEL */}
      <div id="lower-submission-zone" className="mt-8 flex flex-col items-center justify-center space-y-4">
        
        {/* Total current score display pill */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tổng điểm cấu hình đề kiểm tra</span>
          <div className="bg-white border-2 border-indigo-100 rounded-full px-8 py-2 shadow-2xs">
            <span className={`text-[21px] font-extrabold pb-0.5 tracking-tight ${
              activeTab === 'matrix_create' 
                ? (isMatrixCreated && isMatrixScaleValid ? 'text-emerald-600' : 'text-red-500 font-black animate-pulse')
                : (isScaleValid ? 'text-emerald-600' : 'text-red-500 font-black animate-pulse')
            }`}>
              {activeTab === 'matrix_create' ? matrixTotalScore.toFixed(2) : totalScore.toFixed(2)}
            </span>
            <span className="text-slate-400 font-bold text-sm"> / {scoreScale}</span>
          </div>
        </div>

        {/* Dynamic score balance warnings */}
        {activeTab === 'manual' && !isScaleValid && (
          <div className="bg-red-50 text-red-600 font-extrabold px-6 py-2.5 rounded-2xl border border-red-100 text-center max-w-xl animate-fade-in text-[11px] shadow-sm">
            ⚠️ Tổng điểm tất cả các nhóm phải khớp tuyệt đối bằng {scoreScale}đ. Hiện tại là {totalScore.toFixed(2)}đ. Vui lòng cấu hình lại số lượng câu hỏi hoặc giá trị mỗi câu.
          </div>
        )}

        {activeTab === 'matrix_create' && !isMatrixCreated && (
          <div className="bg-yellow-50 text-yellow-700 font-extrabold px-6 py-2.5 rounded-2xl border border-yellow-100 text-center max-w-xl animate-fade-in text-[11px] shadow-sm">
            ⚠️ Vui lòng nhấn nút "Tạo ma trận" ở trên để hệ thống tự động thiết lập ma trận Thông tư 27 trước khi tạo đề.
          </div>
        )}

        {((activeTab === 'manual' && isScaleValid) || (activeTab === 'matrix_create' && isMatrixCreated && isMatrixScaleValid)) && (
          <div className="bg-emerald-50 text-emerald-700 font-extrabold px-6 py-2 rounded-2xl border border-emerald-200 text-center text-[10.5px]">
            🌱 Cấu trúc điểm số hoàn hảo! Hệ thống đã sẵn sàng phát hành tệp học liệu đề thi chuẩn AI.
          </div>
        )}

        {generationError && (
          <div id="test-creator-api-error-alert" className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left space-y-2 mb-3 max-w-xl w-full mx-auto">
            <div className="flex items-start gap-2 text-red-700">
              <span className="text-lg shrink-0">⚠️</span>
              <div className="space-y-1">
                <h5 className="text-xs font-black">XẢY RA SỰ CỐ KHI GỌI CO-PILOT AI</h5>
                <p className="text-[11px] leading-relaxed font-semibold text-red-650">{generationError}</p>
              </div>
            </div>
            
            <div className="bg-white/80 border border-red-100 rounded-xl p-3 space-y-2.5 mt-2">
              <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">
                Đường truyền thử nghiệm miễn phí dùng chung hiện tại đã tạm thời nghẽn hoặc đạt hạn ngạch tối đa trong ngày. Thầy Cô có thể lấy một <strong>Khóa API Gemini cá nhân hoàn toàn miễn phí</strong> từ Google AI Studio trong 20 giây để dán trực tiếp vào đây để tiếp tục tạo đề thi và ma trận học liệu không giới hạn:
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

        {/* Collapsible Gemini API Key panel to prevent 429 quota exhaustion */}
        <div className="border border-indigo-150 rounded-2xl p-4 bg-indigo-50/20 max-w-xl w-full mx-auto text-left space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex items-center gap-2 text-xs font-black text-indigo-900 hover:text-indigo-750 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#eab308] animate-pulse shrink-0" />
              <span>{personalApiKey ? '🔑 Đã cấu hình Gemini API Key cá nhân' : '🔑 Cài đặt Gemini API Key cá nhân (Khuyên dùng)'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${showKeyInput ? 'rotate-180' : ''}`} />
            </button>
            {personalApiKey && !showKeyInput && (
              <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold shrink-0">Đang hoạt động</span>
            )}
          </div>
          {showKeyInput ? (
            <div className="space-y-2 border-t border-slate-100 pt-2.5">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={personalApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPersonalApiKey(val);
                    localStorage.setItem('personal_gemini_api_key', val);
                  }}
                  placeholder="Cung cấp khóa API Gemini của riêng thầy/cô (ví dụ: AIzaSy...)"
                  className="flex-1 p-3 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-indigo-400 text-xs"
                />
                {personalApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setPersonalApiKey('');
                      localStorage.removeItem('personal_gemini_api_key');
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#e11d48] border border-red-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <p className="text-[11px] text-indigo-600/80 font-semibold leading-relaxed">
                * Khóa API cá nhân giúp Thầy/Cô biên soạn đề thi siêu tốc, mượt mà mà không lo quá tải hay hết lượt sử dụng thử hệ thống.
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-650 hover:underline font-extrabold ml-1.5 inline-flex items-center gap-0.5"
                >
                  Nhận Khóa API Miễn Phí Tại Google AI Studio ↗
                </a>
              </p>
            </div>
          ) : !personalApiKey ? (
            <p className="text-[11px] text-[#6b7280] font-medium leading-relaxed pl-6">
              * Khóa API giúp tăng tốc độ xử lý và bẻ gãy mọi giới hạn sử dụng AI chung gánh tải. Thầy Cô có thể lấy khóa hoàn toàn miễn phí từ Google.
            </p>
          ) : (
            <p className="text-[11px] text-emerald-600 font-extrabold pl-6">
              ✓ Đang sử dụng Khóa API cá nhân của quý Thầy/Cô.
            </p>
          )}
        </div>

        {/* Main Solid Creator Action Button */}
        <button
          onClick={handleStartGenerateExam}
          disabled={
            isGenerating || 
            (activeTab === 'matrix_create' && (!isMatrixCreated || !isMatrixScaleValid)) ||
            (activeTab === 'manual' && !isScaleValid)
          }
          className={`px-12 py-4 rounded-full font-black text-sm uppercase tracking-wider shadow-lg flex items-center gap-3 transition-all ${
            isGenerating 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
              : ((activeTab === 'matrix_create' && isMatrixCreated && isMatrixScaleValid) || (activeTab === 'manual' && isScaleValid))
                ? 'bg-[#2454a6] hover:bg-blue-800 text-white transform hover:-translate-y-0.5 cursor-pointer' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none opacity-85'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Đang phân tích dữ liệu AI...
            </>
          ) : (
            <>
              Bắt đầu tạo đề thi <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

      </div>

      {/* PREVIEW AND EXPORT MODAL WINDOW */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-5xl bg-gradient-to-br from-emerald-800 via-sky-900 to-indigo-950 rounded-[32px] p-6 shadow-2xl animate-scale-up border border-emerald-500/20 max-h-[92vh] overflow-hidden flex flex-col gap-5 text-left">
            
            {/* Control Bar representing 0.DeKiemTra.PNG toolbar floating above the sheet */}
            <div className="p-4 bg-slate-900/95 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-black">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-sans tracking-wide uppercase">KÍCH THƯỚC ẢNH:</span>
                  <input 
                    type="range" 
                    min={100} 
                    max={500} 
                    value={imageSize} 
                    onChange={(e) => setImageSize(Number(e.target.value))}
                    className="w-28 sm:w-40 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-sky-400 font-mono">{imageSize}px</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCenteredImage(!isCenteredImage);
                    triggerToast(isCenteredImage ? "📄 Đã căn trái tài liệu ảnh!" : "📄 Đã căn giữa cân bằng tài liệu ảnh!");
                    SoundEffects.playTing();
                  }}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-[10.5px] ${
                    isCenteredImage ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700'
                  }`}
                >
                  📄 Cân bằng ảnh
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
                <button 
                  onClick={handleExportWord} 
                  className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl shadow-md border-b-4 border-blue-900 active:border-b-0 cursor-pointer transition-all flex items-center gap-1"
                >
                  🔵 Tải Word (.doc)
                </button>
                <button 
                  onClick={() => {
                    if (generatedQuestions.length === 0) {
                      triggerToast("⚠️ Hệ thống chưa biên soạn đề thi AI. Vui lòng bấm tạo đề trước!");
                      return;
                    }
                    setConfigTestName(testName);
                    setConfigDuration(45);
                    setConfigShowAnswers(true);
                    setConfigSecurityLimit(false);
                    setConfigAccessCode(`IC3-${Math.floor(10000 + Math.random() * 90000)}`);
                    setShowOnlineConfigModal(true);
                  }} 
                  className="px-4 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl shadow-md border-b-4 border-purple-950 active:border-b-0 cursor-pointer transition-all flex items-center gap-1"
                >
                  🟣 Tạo đề thi online
                </button>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 px-3 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10.5px] border border-slate-700 cursor-pointer transition"
                >
                  Đóng ✕
                </button>
              </div>
            </div>
            <div 
              className="bg-white rounded-[24px] p-6 md:p-10 overflow-y-auto flex-1 space-y-8 text-black leading-relaxed shadow-inner" 
              id="print-word-zone"
              style={{ fontFamily: "'Times New Roman', Times, Baskerville, Georgia, serif", fontSize: "14pt" }}
            >
              
              {/* Document Header Title */}
              <div className="text-center pb-4 border-b-2 border-double border-slate-900">
                <div className="flex items-center justify-center gap-2 text-[14pt] font-bold text-black uppercase tracking-tight font-serif">
                  <span>🗎 THÀNH PHẨM HỌC LIỆU BAO GỒM 4 PHẦN CHUẨN</span>
                </div>
                <div className="text-[11pt] font-serif italic text-gray-600 mt-1">
                  (Khung ma trận khảo thí, bản đặc tả câu hỏi, đề thi minh họa và hướng dẫn chấm điểm)
                </div>
              </div>

              {/* LƯU Ý QUAN TRỌNG */}
              <div className="text-center p-3 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-xl text-[12pt] mb-6 no-print">
                ⚠️ LƯU Ý QUAN TRỌNG: Vui lòng kiểm tra kỹ lại nội dung đề bài trước khi sử dụng thực tế.
              </div>

              {/* PHẦN 1: MA TRẬN ĐỀ */}
              <div className="space-y-4 pt-4">
                <div className="font-bold text-lg uppercase tracking-tight text-center pb-1 border-b border-gray-300">
                  PHẦN 1: MA TRẬN ĐỀ KIỂM TRA ĐÁP ÁN CHUẨN
                </div>
                <p className="text-[12.5px] italic text-gray-7  00 text-center">
                  (Môn học: {subject}, Lớp học: {grade}, Hệ thống sách giáo khoa: {curriculumBook})
                </p>

                {/* Unified Professional Matrix table according to DemoDeKiemTra.pdf page 1 */}
                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full text-center border-collapse text-[10pt]">
                    <thead>
                      <tr className="bg-[#f0f4fa] font-bold uppercase text-black text-[9pt]">
                        <th className="p-2 border border-black" rowSpan={2}>CHỦ ĐỀ</th>
                        <th className="p-2 border border-black" rowSpan={2}>BÀI HỌC</th>
                        <th className="p-2 border border-black" rowSpan={2}>MỨC ĐỘ VẬN DỤNG</th>
                        <th className="border border-black p-2" colSpan={4}>CÁC LOẠI CÂU HỎI</th>
                        <th className="p-2 border border-black" rowSpan={2}>TỔNG SỐ CÂU</th>
                        <th className="p-2 border border-black" rowSpan={2}>ĐIỂM SỐ</th>
                      </tr>
                      <tr className="bg-[#f0f4fa] font-bold uppercase text-black text-[8pt]">
                        <th className="p-1 border border-black">TRẮC NGHIỆM 4 PHƯƠNG ÁN</th>
                        <th className="p-1 border border-black">ĐÚNG - SAI</th>
                        <th className="p-1 border border-black">NỐI CỘT</th>
                        <th className="p-1 border border-black">ĐIỀN KHUYẾT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const levels = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];
                        const mRows = levels.map((lvl) => {
                          const mcq = generatedQuestions.filter(q => q.difficulty === lvl && q.type === 'multiple_choice').length;
                          const tf = generatedQuestions.filter(q => q.difficulty === lvl && q.type === 'true_false').length;
                          const matching = generatedQuestions.filter(q => q.difficulty === lvl && q.type === 'matching').length;
                          const gap = generatedQuestions.filter(q => q.difficulty === lvl && q.type === 'gap_fill').length;
                          const total = mcq + tf + matching + gap;
                          const points = generatedQuestions.filter(q => q.difficulty === lvl).reduce((sum, q) => sum + q.points, 0);
                          return { level: lvl, mcq, tf, matching, gap, total, points };
                        });
                        return (
                          <>
                            {mRows.map((row, idx) => (
                              <tr key={row.level} className="text-[10pt] text-black bg-white hover:bg-slate-50/55">
                                {idx === 0 && (
                                  <td className="p-2 border border-black text-left font-bold font-serif align-middle" rowSpan={4}>
                                    {subject === 'Tin học' ? 'Chủ đề 1: Máy tính và em' : `Chủ đề: ${subject}`}
                                  </td>
                                )}
                                {idx === 0 && (
                                  <td className="p-2 border border-black text-left font-serif align-middle" rowSpan={4}>
                                    {testName || 'Bài 1: Thông tin và quyết định'}
                                  </td>
                                )}
                                <td className="p-2 border border-black font-semibold text-left">{row.level}</td>
                                <td className="p-2 border border-black">{row.mcq}</td>
                                <td className="p-2 border border-black">{row.tf}</td>
                                <td className="p-2 border border-black">{row.matching}</td>
                                <td className="p-2 border border-black">{row.gap}</td>
                                <td className="p-2 border border-black font-bold">{row.total}</td>
                                <td className="p-2 border border-black font-bold text-[#1e3a8a]">{row.points.toFixed(2)}</td>
                              </tr>
                            ))}
                            {/* Summary row */}
                            <tr className="bg-[#f0f4fa] font-bold text-[10.5pt] text-black">
                              <td colSpan={3} className="p-2 border border-black text-right uppercase font-bold">Tổng cộng chung:</td>
                              <td className="p-2 border border-black">{generatedQuestions.filter(q => q.type === 'multiple_choice').length}</td>
                              <td className="p-2 border border-black">{generatedQuestions.filter(q => q.type === 'true_false').length}</td>
                              <td className="p-2 border border-black">{generatedQuestions.filter(q => q.type === 'matching').length}</td>
                              <td className="p-2 border border-black">{generatedQuestions.filter(q => q.type === 'gap_fill').length}</td>
                              <td className="p-2 border border-black text-center">{generatedQuestions.length} câu</td>
                              <td className="p-2 border border-black text-right text-red-650 font-black">{generatedQuestions.reduce((s, q) => s + q.points, 0).toFixed(2)} / {scoreScale}đ</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Bảng thống kê tỷ lệ % điểm số */}
                <div className="mt-4 pt-2">
                  <p className="font-bold underline text-[12.5px] text-slate-800 mb-2 font-sans uppercase tracking-wide">
                    📌 Bảng thống kê tỷ lệ % điểm số theo mức độ năng lực:
                  </p>
                  <div className="overflow-x-auto max-w-lg border border-black rounded-lg">
                    <table className="w-full text-center border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-gray-100 font-bold uppercase text-black">
                          <th className="p-2 border border-black text-left">MỨC ĐỘ NHẬN THỨC</th>
                          <th className="p-2 border border-black">KÝ HIỆU</th>
                          <th className="p-2 border border-black">SỐ ĐIỂM SỐ</th>
                          <th className="p-2 border border-black">TỈ LỆ % PHÂN PHỐI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const levels = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];
                          const codeMap: Record<string, string> = {
                            "Nhận biết": "NB",
                            "Thông hiểu": "TH",
                            "Vận dụng": "VD",
                            "Vận dụng cao": "VDC"
                          };
                          const totalScoreVal = generatedQuestions.reduce((s, q) => s + q.points, 0) || 10.0;
                          return levels.map((lvl) => {
                            const pts = generatedQuestions.filter(q => q.difficulty === lvl).reduce((s, q) => s + q.points, 0);
                            const pct = Math.round((pts / totalScoreVal) * 100) || 0;
                            return (
                              <tr key={lvl} className="hover:bg-slate-50 text-slate-800">
                                <td className="p-2 border border-black text-left font-serif font-semibold">{lvl}</td>
                                <td className="p-2 border border-black font-mono font-bold">{codeMap[lvl] || ''}</td>
                                <td className="p-2 border border-black font-mono">{pts.toFixed(2)}đ</td>
                                <td className="p-2 border border-black font-mono font-black text-blue-700">{pct}%</td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* PHẦN 2: ĐỀ BÀI KIỂM TRA */}
              <div className="space-y-6 pt-6 border-t-2 border-black break-before-page">
                
                {/* School Standardized Header */}
                <div className="grid grid-cols-2 text-[11pt] border-b pb-4 leading-normal font-sans">
                  <div className="text-left font-bold space-y-0.5">
                    <div className="uppercase">{districtZone || "ỦY BAN NHÂN DÂN ......."}</div>
                    <div className="uppercase">{workSchool || "TRƯỜNG TIỂU HỌC .........."}</div>
                    <div className="font-normal text-[10pt] italic">Mã kiểm định chất lượng: AI-999-DOC</div>
                  </div>
                  <div className="text-center font-bold space-y-0.5 animate-fade-in">
                    <div className="uppercase underline">ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA KỲ I</div>
                    <div>Năm học: 2026 - 2027</div>
                    <div className="font-semibold text-blue-750">Môn học: {subject} - Lớp: {grade}</div>
                    <div className="font-normal text-[10pt] italic">Thời gian làm bài: 45 phút</div>
                  </div>
                </div>

                <div className="text-center space-y-1.5 mt-2 font-serif">
                  <div className="font-bold text-lg uppercase tracking-wider">
                    PHẦN 2: ĐỀ BÀI KIỂM TRÁ CHI TIẾT
                  </div>
                  <div className="text-[11pt] italic text-slate-700">
                    Môn: {subject} - Lớp: {grade} (Bộ sách {curriculumBook}) - Chủ đề: {subject === 'Tin học' ? 'Máy tính và em' : 'Theo chương trình'}
                  </div>
                  <div className="text-[11pt] italic font-semibold text-slate-800">
                    Bài 1. {testName || 'Thông tin và quyết định'}
                  </div>
                  <div className="text-[10pt] italic">
                    (Đề thi gồm có {generatedQuestions.length} câu hỏi tự động thiết lập theo cấu cấu năng lực)
                  </div>
                </div>

                {/* Candidate Info Block */}
                <div className="border-2 border-black p-4 text-[13pt] rounded-md font-serif space-y-3">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">Họ và tên học sinh: ............................................................................</div>
                    <div className="w-48">Lớp: .............................</div>
                  </div>
                  <div>
                    <div>Điểm số đạt: ....... / 10 Đ</div>
                  </div>
                </div>

                {/* Attached học liệu Image */}
                {attachedImage && (
                  <div className={`p-2 bg-slate-50 border border-slate-200 rounded-2xl flex ${isCenteredImage ? 'justify-center' : 'justify-start'} no-print`}>
                    <div 
                      className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white"
                      style={{ width: `${imageSize}px` }}
                    >
                      <img 
                        src={attachedImage} 
                        className="w-full h-auto object-contain" 
                        alt="Học liệu kèm đề" 
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-center font-sans text-[8px] font-bold text-slate-400 p-0.5 bg-slate-50">
                        Học liệu trực quan ({imageSize}px)
                      </p>
                    </div>
                  </div>
                )}

                {/* I. PHẦN TRẮC NGHIỆM 4 PHƯƠNG ÁN */}
                {generatedQuestions.filter(q => q.type === 'multiple_choice').length > 0 && (
                  <div className="space-y-6 pt-2 font-serif">
                    <div className="font-bold text-[12pt] border-b border-black pb-1 uppercase">
                      {sectionTitles.multiple_choice}
                    </div>
                    {generatedQuestions.filter(q => q.type === 'multiple_choice').map((q, idx) => (
                      <div key={q.id} className="space-y-2 pl-1.5 leading-relaxed">
                        <div className="font-bold text-slate-900">
                          Câu {idx + 1} ({q.points.toFixed(2)} điểm): {q.questionText}
                        </div>
                        {/* Styled option boxes matching the DemoDeKiemTra.pdf page 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 pt-1 font-serif text-[11pt]">
                          {q.options?.map((opt, oidx) => (
                            <div key={oidx} className="bg-[#f8faff] border border-[#eef3ff] rounded-xl p-3 px-4 flex gap-2 items-center shadow-2xs hover:border-blue-200 hover:bg-[#f3f7ff]">
                              <span className="font-bold text-[#1e40af] shrink-0">{['A','B','C','D'][oidx]}.</span>
                              <span className="text-slate-800">{cleanPrefix(opt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* II. PHẦN TRẮC NGHIỆM ĐÚNG SAI */}
                {generatedQuestions.filter(q => q.type === 'true_false').length > 0 && (
                  <div className="space-y-6 pt-4 font-serif">
                    <div className="font-bold text-[12pt] border-b border-black pb-1 uppercase">
                      {sectionTitles.true_false}
                    </div>
                    {generatedQuestions.filter(q => q.type === 'true_false').map((q, idx) => {
                      const offsetIdx = generatedQuestions.filter(q2 => q2.type === 'multiple_choice').length + idx + 1;
                      return (
                        <div key={q.id} className="space-y-3 pl-1.5 leading-relaxed">
                          <div className="font-bold text-slate-900">
                            Câu {offsetIdx} ({q.points.toFixed(2)} điểm): {q.questionText}
                          </div>
                          {/* Styled deep-green header table representing the custom Đúng/Sai table layout */}
                          <div className="border border-green-800 rounded-xl overflow-hidden shadow-sm max-w-4xl text-[11pt]">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#1b5e20] text-white font-bold">
                                  <th className="p-3 border-b border-green-900">Nội dung</th>
                                  <th className="p-3 text-center w-24 border-b border-green-900 border-l border-green-950/20">Đúng</th>
                                  <th className="p-3 text-center w-24 border-b border-green-900 border-l border-green-950/20">Sai</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(q.statements && q.statements.length > 0 ? q.statements : [
                                  { label: "A", text: "Phát biểu kiểm nghiệm lý thuyết môn học tương ứng.", answer: "Đúng" },
                                  { label: "B", text: "Phát biểu chứa các thông tin mâu thuẫn để thử thách.", answer: "Sai" }
                                ]).map((st: any, sidx: number) => (
                                  <tr key={sidx} className="border-b border-gray-200 bg-white hover:bg-green-50/20 text-gray-800">
                                    <td className="p-3 flex items-start gap-1 font-serif text-[11.5pt]">
                                      <span className="font-bold text-green-800">{st.label ? `${st.label}.` : `${['A','B','C','D'][sidx]}.`}</span>
                                      <span>{st.text}</span>
                                    </td>
                                    <td className="p-3 text-center border-l border-slate-100">
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-350 bg-stone-50 mx-auto flex items-center justify-center transition hover:border-[#1b5e20]">
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-700 opacity-0" />
                                      </div>
                                    </td>
                                    <td className="p-3 text-center border-l border-slate-100">
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-350 bg-stone-50 mx-auto flex items-center justify-center transition hover:border-red-650">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 opacity-0" />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* III. PHẦN NỐI CỘT */}
                {generatedQuestions.filter(q => q.type === 'matching').length > 0 && (
                  <div className="space-y-6 pt-4 font-serif">
                    <div className="font-bold text-[12pt] border-b border-black pb-1 uppercase">
                      {sectionTitles.matching}
                    </div>
                    {generatedQuestions.filter(q => q.type === 'matching').map((q, idx) => {
                      const offsetIdx = generatedQuestions.filter(q2 => q2.type === 'multiple_choice' || q2.type === 'true_false').length + idx + 1;
                      const pairs = q.matchingPairs || [];
                      const leftHeader = q.questionText.toLowerCase().includes("giác quan") ? "(GIÁC QUAN)" : "(THÔNG TIN)";
                      const rightHeader = q.questionText.toLowerCase().includes("chức năng") ? "(CHỨC NĂNG)" : "(QUYẾT ĐỊNH)";
                      return (
                        <div key={q.id} className="space-y-3 pl-1.5 leading-relaxed">
                          <div className="font-bold text-slate-900 font-serif text-[12pt]">
                            Câu {offsetIdx} ({q.points.toFixed(2)} điểm): {q.questionText}
                          </div>
                          {/* Beautiful three-subcolumn matching panels as requested */}
                          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs max-w-4xl text-[11pt]">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#f0f4fa] text-slate-800 font-extrabold border-b border-slate-300">
                                  <th className="p-3 w-[40%] border-r border-slate-300 text-center uppercase">CỘT A {leftHeader}</th>
                                  <th className="p-3 w-[20%] border-r border-slate-300 text-center uppercase">Kết nối</th>
                                  <th className="p-3 w-[40%] text-center uppercase">CỘT B {rightHeader}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const leftItems = [...pairs].sort((a, b) => String(a.id).localeCompare(String(b.id)));
                                  const rightItems = [...pairs].sort((a, b) => String(a.id_match || '').toLowerCase().localeCompare(String(b.id_match || '').toLowerCase()));
                                  return leftItems.map((leftItem: any, pidx: number) => {
                                    const rightItem = rightItems[pidx] || leftItem;
                                    return (
                                      <tr key={pidx} className="border-b border-slate-100 bg-white hover:bg-slate-50/30">
                                        <td className="p-3 border-r border-slate-200 font-serif text-slate-850">
                                          {leftItem.id}. {cleanPrefix(leftItem.left)}
                                        </td>
                                        <td className="p-3 border-r border-slate-200 text-center font-bold text-blue-800 font-mono">
                                          {leftItem.id} - .......
                                        </td>
                                        <td className="p-3 font-serif text-slate-850">
                                          {rightItem.id_match}. {cleanPrefix(rightItem.right)}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* IV. PHẦN ĐIỀN KHUYẾT */}
                {generatedQuestions.filter(q => q.type === 'gap_fill').length > 0 && (
                  <div className="space-y-6 pt-4 font-serif">
                    <div className="font-bold text-[12pt] border-b border-black pb-1 uppercase">
                      {sectionTitles.gap_fill}
                    </div>
                    {generatedQuestions.filter(q => q.type === 'gap_fill').map((q, idx) => {
                      const offsetIdx = generatedQuestions.filter(q2 => q2.type === 'multiple_choice' || q2.type === 'true_false' || q2.type === 'matching').length + idx + 1;
                      return (
                        <div key={q.id} className="space-y-2 pl-1.5 leading-relaxed font-serif text-[12pt]">
                          <div className="font-bold text-slate-900">
                            Câu {offsetIdx} ({q.points.toFixed(2)} điểm): {q.questionText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* V. PHẦN TỰ LUẬN KIẾN THỨC NÂNG CAO */}
                {generatedQuestions.filter(q => q.type === 'essay').length > 0 && (
                  <div className="space-y-6 pt-4 font-serif">
                    <div className="font-bold text-[12pt] border-b border-black pb-1 uppercase">
                      {sectionTitles.essay}
                    </div>
                    {generatedQuestions.filter(q => q.type === 'essay').map((q, idx) => {
                      const offsetIdx = generatedQuestions.filter(q2 => !['essay'].includes(q2.type)).length + idx + 1;
                      return (
                        <div key={q.id} className="space-y-2.5 pl-1.5 leading-relaxed font-serif">
                          <div className="font-bold text-slate-900">
                            Câu {offsetIdx} ({q.points.toFixed(2)} điểm): {q.questionText}
                          </div>
                          <div className="text-gray-400 italic py-6 select-none bg-gray-50/50 border-l-4 border-slate-305 pl-4 rounded font-serif text-[11.5pt]">
                            Học sinh làm bài: ................................................................................................................................................................
                            <br />
                            ...................................................................................................................................................................................
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PHẦN 3: ĐÁP ÁN CHUẨN XÁC */}
              <div className="space-y-6 pt-6 border-t-2 border-black break-before-page">
                <div className="font-bold text-lg uppercase tracking-tight text-center pb-1 border-b border-gray-300">
                  PHẦN 3: ĐÁP ÁN CHUẨN XÁC VÀ PHÂN PHỐI LÝ GIẢI
                </div>
                
                {/* 1. Bảng đáp án trắc nghiệm 4 phương án */}
                {generatedQuestions.filter(q => q.type === 'multiple_choice').length > 0 && (
                  <div className="space-y-3 font-serif">
                    <p className="font-bold text-[11.5pt] underline uppercase tracking-wide text-slate-800">
                      1. Bảng đáp án trắc nghiệm 4 phương án:
                    </p>
                    <div className="overflow-x-auto max-w-md border-2 border-black">
                      <table className="w-full text-center border-collapse text-[11.5pt] font-bold">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border border-black text-center w-16">CÂU</th>
                            {generatedQuestions.filter(q => q.type === 'multiple_choice').map((_, cidx) => (
                              <th key={cidx} className="p-2 border border-black text-center">{cidx + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="p-2 border border-black text-center text-slate-705">Đ.Á</td>
                            {generatedQuestions.filter(q => q.type === 'multiple_choice').map((q, cidx) => {
                              const match = (q.correctAnswer || 'A').trim().match(/^([A-Da-d0-9])/);
                              const ansLetter = match ? match[1].toUpperCase() : (q.correctAnswer || 'A');
                              return (
                                <td key={cidx} className="p-2 border border-black text-center text-emerald-800 text-[13pt] font-black">{ansLetter}</td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Detailed justifying feedback matching the Demo exam sheet */}
                <div className="space-y-4 pt-3 font-serif text-[11.5pt]">
                  <p className="font-bold text-[11.5pt] underline uppercase tracking-wide text-slate-800">
                    2. Giải nghĩa chi tiết từng câu hỏi hệ thống học tập:
                  </p>
                  
                  {generatedQuestions.map((q, idx) => (
                    <div key={q.id} className="border-l-2 border-slate-300 pl-4 py-0.5">
                      <strong className="text-slate-900">Câu {idx + 1} [{q.difficulty}]:</strong>{' '}
                      <span className="text-gray-950">
                        Đáp án chính xác: <strong>
                          {q.type === 'multiple_choice' 
                            ? renderMcqAnswerText(q) 
                            : (q.correctAnswer || 'Đáp án tự do')}
                        </strong>.
                      </span>{' '}
                      <span className="text-slate-755 italic font-sans text-[11px] block mt-1 bg-stone-50 p-2 border border-stone-100 rounded-lg">
                        <strong>Lý giải của AI:</strong> {q.answerGuide || 'Giải nghĩa bám sát khái niệm cơ bản chuẩn hóa giáo khoa.'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PHẦN 4: HƯỚNG DẪN CHẤM BÀI VÀ BIỂU ĐIỂM CHI TIẾT */}
              <div className="space-y-6 pt-6 border-t-2 border-black break-before-page">
                <div className="font-bold text-lg uppercase tracking-tight text-center pb-1 border-b border-gray-300">
                  PHẦN 4: HƯỚNG DẪN CHẤM BÀI CHI TIẾT & BIỂU ĐIỂM
                </div>

                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full text-left border-collapse text-[10pt] font-serif leading-relaxed text-black">
                    <thead>
                      <tr className="bg-gray-100 font-bold text-center text-black border-b border-black uppercase text-[9.5pt]">
                        <th className="p-2.5 border-r border-black w-14">PHẦN</th>
                        <th className="p-2.5 border-r border-black w-14">CÂU</th>
                        <th className="p-2.5 border-r border-black w-20">MỨC ĐỘ</th>
                        <th className="p-2.5 border-r border-black w-32">LOẠI CÂU HỎI</th>
                        <th className="p-2.5 border-r border-black">HƯỚNG DẪN CHẤM / BIỂU ĐIỂM CHI TIẾT</th>
                        <th className="p-2.5 text-right w-20">ĐIỂM SỐ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedQuestions.map((q, idx) => {
                        let shortSection = "I";
                        let shortType = "Trắc nghiệm";
                        if (q.type === 'true_false') {
                          shortSection = "II";
                          shortType = "Đúng/Sai";
                        } else if (q.type === 'matching') {
                          shortSection = "III";
                          shortType = "Nối cột";
                        } else if (q.type === 'gap_fill') {
                          shortSection = "IV";
                          shortType = "Điền khuyết";
                        } else if (q.type === 'essay') {
                          shortSection = "V";
                          shortType = "Tự luận";
                        }

                        let scoringGuide = q.answerGuide || "Chọn đúng đáp án chuẩn.";
                        if (q.type === 'true_false') {
                          scoringGuide = "Đúng mỗi lựa chọn ý (A, B, C, D) được cộng 0.25 điểm tròn.";
                        } else if (q.type === 'matching') {
                          scoringGuide = "Ghép cặp nối cột đúng quy định nhận trọn vẹn điểm cho mỗi cặp.";
                        } else if (q.type === 'gap_fill') {
                          scoringGuide = `Học sinh điền chính xác từ khóa: "${q.correctAnswer || 'thông tin'}" đạt điểm tối đa.`;
                        } else if (q.type === 'multiple_choice') {
                          scoringGuide = `Chọn đúng đáp án khách quan: [${q.correctAnswer || 'A'}].`;
                        }

                        return (
                          <tr key={q.id} className="border-b border-black text-slate-900 bg-white hover:bg-slate-50/40 text-[9.5pt]">
                            <td className="p-2 border-r border-black text-center font-bold font-sans">{shortSection}</td>
                            <td className="p-2 border-r border-black text-center font-bold">{idx + 1}</td>
                            <td className="p-2 border-r border-black text-center">{q.difficulty === 'Nhận biết' ? 'NB' : q.difficulty === 'Thông hiểu' ? 'TH' : 'VD'}</td>
                            <td className="p-2 border-r border-black font-semibold text-center">{shortType}</td>
                            <td className="p-2 border-r border-black">{scoringGuide}</td>
                            <td className="p-2 text-right font-mono font-bold">{q.points.toFixed(2)}đ</td>
                          </tr>
                        );
                      })}
                      {/* Subtotal evaluation score row */}
                      <tr className="bg-gray-100 font-bold text-[10.5pt] text-black border-t border-black">
                        <td colSpan={5} className="p-2.5 border-r border-black text-right uppercase">
                          Tổng điểm học liệu (Khảo thí vàng Bộ GD&ĐT):
                        </td>
                        <td className="p-2.5 text-right text-red-700 font-mono font-black text-[12pt]">
                          {generatedQuestions.reduce((s, q) => s + q.points, 0).toFixed(2)}đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

              {/* Interactive footer links with Word export inside the modal but below paper sheet */}
              <div className="p-4 border-t border-slate-250 flex flex-wrap gap-2 justify-end bg-slate-50 rounded-b-[24px]">
                <button
                  onClick={handleExportWord}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center gap-2 cursor-pointer transition shadow-sm text-xs"
                >
                  <FileDown className="w-4 h-4" /> Tải Word (.doc)
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng xem trước
                </button>
              </div>

            </div>

          </div>
        )}

      {/* CUSTOM ONLINE CONFIGURATION MODAL (ThiOnline.PNG) */}
      {showOnlineConfigModal && (
        <div className="fixed inset-0 bg-[#0c1020]/50 backdrop-blur-sm flex items-center justify-center p-4 z-55">
          <div className="w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl border-4 border-indigo-500 animate-scale-up text-left">
            <div className="p-6 bg-gradient-to-r from-indigo-700 to-blue-600 text-white flex justify-between items-center">
              <div>
                <span className="bg-yellow-400 text-blue-950 text-[10.5px] font-black uppercase px-2.5 py-1 rounded-full border border-yellow-300">
                  Thiết lập đề thi Online
                </span>
                <h3 className="text-lg font-black mt-2">Cấu Hình Phòng Khảo Thí Trực Tuyến</h3>
              </div>
              <button 
                onClick={() => setShowOnlineConfigModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-bold text-slate-700">
              
              {/* Tên bài thi */}
              <div className="space-y-1.5">
                <label className="block tracking-wide text-slate-600 uppercase text-[10.5px]">Tên Bài Thi / Đề Thi Trực Tuyến</label>
                <input 
                  type="text"
                  value={configTestName || ''}
                  onChange={(e) => setConfigTestName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-205 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 text-xs font-extrabold"
                  placeholder="Nhập tên hiển thị phòng thi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Thời gian làm bài */}
                <div className="space-y-1.5">
                  <label className="block tracking-wide text-slate-600 uppercase text-[10.5px]">Thời gian làm bài (Phút)</label>
                  <input 
                    type="number"
                    value={configDuration ?? 45}
                    onChange={(e) => setConfigDuration(Number(e.target.value) || 15)}
                    className="w-full p-3 bg-slate-50 border border-slate-205 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 text-xs font-extrabold"
                    min={5}
                    max={180}
                  />
                </div>

                {/* Sĩ số dự kiến */}
                <div className="space-y-1.5">
                  <label className="block tracking-wide text-slate-600 uppercase text-[10.5px]">Sĩ số tham gia tối đa</label>
                  <input 
                    type="text"
                    value="Không giới hạn"
                    disabled
                    className="w-full p-3 bg-slate-100 border border-slate-205 rounded-xl text-slate-400 text-xs font-extrabold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Toggles/options */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={configShowAnswers}
                    onChange={(e) => setConfigShowAnswers(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-550 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-slate-800 font-extrabold">Hiển thị đáp án ngay khi nộp bài</span>
                    <p className="text-[10px] text-gray-450 font-semibold normal-case">Học sinh được xem lời giải nghĩa sư phạm từ AI sau khi bấm nộp bài.</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={configSecurityLimit}
                    onChange={(e) => setConfigSecurityLimit(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-550 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-slate-800 font-extrabold">Bật mã phòng bảo mật (Ca thi an toàn)</span>
                    <p className="text-[10px] text-gray-450 font-semibold normal-case">Học sinh bắt buộc nhập đúng mã phòng thi mới được bắt đầu làm bài.</p>
                  </div>
                </label>
              </div>

              {/* Mã bảo mật */}
              {configSecurityLimit && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-200/55 rounded-2xl space-y-2 animate-scale-up">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] uppercase font-black text-indigo-700 tracking-wide">Mã Truy Cập Phòng Thi</span>
                    <button 
                      type="button"
                      onClick={() => setConfigAccessCode(`IC3-${Math.floor(10000 + Math.random() * 90000)}`)}
                      className="text-[10px] text-indigo-550 hover:underline"
                    >
                      Tạo mã ngẫu nhiên mới 🔄
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={configAccessCode || ''}
                    onChange={(e) => setConfigAccessCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-white border border-indigo-200 text-indigo-900 focus:outline-none focus:border-indigo-600 rounded-xl font-mono text-sm tracking-widest font-black uppercase text-center"
                    placeholder="VD: IC3-12A4"
                  />
                </div>
              )}

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-205 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowOnlineConfigModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl text-xs cursor-pointer transition"
              >
                Hủy cấu hình
              </button>
              <button
                onClick={handleSaveOnlineExamToSystem}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer transition shadow-sm"
              >
                Xác nhận tạo phòng thi 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE ONLINE PRACTICE EXAM MODAL */}
      {showOnlineExamModal && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-2xl animate-scale-up border border-indigo-100 max-h-[92vh] flex flex-col text-left">
            
            {/* Header banner */}
            <div className="p-6 bg-[#2454a6] text-white flex justify-between items-center">
              <div>
                <span className="bg-yellow-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Phòng Thi Tự Luyện Online</span>
                <h3 className="text-xl font-bold mt-1 tracking-tight">{testName}</h3>
                <p className="text-xs text-blue-100 italic opacity-90">Môn học: {subject} / Khối: {grade} - Sách {curriculumBook}</p>
              </div>
              <button 
                onClick={() => {
                  setShowOnlineExamModal(false);
                  setOnlineTimerActive(false);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-black text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Exam Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50">
              
              {/* Left sidebar widgets (Timer, info, score stats) */}
              <div className="md:col-span-4 space-y-4">
                
                {/* ID Card Widget */}
                <div className="bg-white p-5 rounded-2xl border border-indigo-200/50 shadow-xs space-y-3">
                  <div className="text-[11px] font-extrabold text-blue-900 tracking-wider uppercase">Thẻ dự thi học sinh</div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Họ tên Thí sinh:</label>
                      <input 
                        type="text" 
                        value={onlineStudentName || ''} 
                        onChange={(e) => setOnlineStudentName(e.target.value)}
                        disabled={onlineSubmitted}
                        className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-indigo-900 bg-slate-50 border-gray-205 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Lớp học:</label>
                      <input 
                        type="text" 
                        value={onlineStudentClass || ''} 
                        onChange={(e) => setOnlineStudentClass(e.target.value)}
                        disabled={onlineSubmitted}
                        className="w-full mt-1 px-3 py-2 border rounded-xl font-bold text-indigo-900 bg-slate-50 border-gray-205 focus:bg-white outline-none"
                      />
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400">MÃ LỚP THI:</span>
                      <strong className="font-mono text-sm tracking-wide text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{onlineCourseCode}</strong>
                    </div>
                  </div>
                </div>

                {/* Timer Clock widget */}
                <div className="bg-white p-5 rounded-2xl border border-indigo-200/50 shadow-xs text-center space-y-2">
                  <div className="text-[11px] font-extrabold text-blue-900 tracking-wider uppercase">Thời gian còn lại</div>
                  
                  <div className="py-2">
                    <span className={`text-3xl font-black font-mono tracking-tight ${onlineTimeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                      {Math.floor(onlineTimeLeft / 60).toString().padStart(2, '0')}:
                      {(onlineTimeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="text-[11px] italic text-slate-500">
                    {onlineSubmitted 
                      ? "✓ Đã nộp bài đánh giá!" 
                      : "Trực tuyến: Hệ thống ghi nhận tự động nộp bài khi hết giờ."
                    }
                  </div>
                </div>

                {/* Score Summary box after submission */}
                {onlineSubmitted && (
                  <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-200 animate-scale-up text-center space-y-3">
                    <div className="text-xs font-black uppercase text-emerald-700">KẾT QUẢ ĐÁNH GIÁ CHUNG</div>
                    
                    <div>
                      <div className="text-4xl font-black font-serif text-emerald-600">
                        {(() => {
                          let correctCount = 0;
                          generatedQuestions.forEach(q => {
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
                          const ratio = correctCount / (generatedQuestions.length || 1);
                          return Number((ratio * scoreScale).toFixed(2));
                        })()}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-500">Thang điểm chuẩn: {scoreScale}đ</div>
                    </div>

                    <div className="text-xs font-medium px-4 py-2 bg-white rounded-xl border border-emerald-100 leading-snug">
                      {(() => {
                        let correctCount = 0;
                        generatedQuestions.forEach(q => {
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
                        const scoreVal = (correctCount / (generatedQuestions.length || 1)) * scoreScale;
                        return scoreVal >= (scoreScale * 0.8) ? (
                          <span>🌟 <b>Xuất sắc!</b> Em đã nắm vững tuyệt đối khối lượng kiến thức của bài này!</span>
                        ) : scoreVal >= (scoreScale * 0.5) ? (
                          <span>👍 <b>Khá tốt!</b> Hãy xem lại các giải thích chi tiết bên dưới để đạt điểm 10 tuyệt đối.</span>
                        ) : (
                          <span>📚 <b>Cần cố gắng!</b> Hãy học lại lý thuyết và làm thêm các bài tập tự luyện.</span>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>

              {/* Right panel: Digital Test Sheet */}
              <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-indigo-200/40 shadow-xs overflow-y-auto max-h-[75vh] space-y-6">
                
                {generatedQuestions.map((q, idx) => {
                  const isMc = q.type === 'multiple_choice';
                  const studentAnswer = studentAnswers[q.id];
                  const isCorrect = studentAnswer === q.correctAnswer;
                  
                  return (
                    <div 
                      key={q.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        onlineSubmitted 
                          ? isMc
                            ? isCorrect 
                              ? 'bg-emerald-50/40 border-emerald-300' 
                              : 'bg-rose-50/40 border-rose-300'
                            : 'bg-emerald-50/40 border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-3 flex-1">
                          <p className="font-extrabold text-[13px] text-slate-900 leading-snug">
                            {q.questionText} <span className="text-[11px] font-normal text-slate-400">({q.points.toFixed(2)}đ)</span>
                          </p>

                          {/* Options if MCQ */}
                          {isMc ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.options?.map((opt, oidx) => {
                                const optLetter = ['A','B','C','D'][oidx];
                                const isSelected = studentAnswer === optLetter;
                                const isCorrectLetter = q.correctAnswer === optLetter;
                                
                                return (
                                  <button
                                    key={oidx}
                                    disabled={onlineSubmitted}
                                    onClick={() => {
                                      setStudentAnswers({
                                        ...studentAnswers,
                                        [q.id]: optLetter
                                      });
                                      SoundEffects.playTing();
                                    }}
                                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer select-none ${
                                      onlineSubmitted 
                                        ? isSelected
                                          ? isCorrectLetter
                                            ? 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-xs'
                                            : 'bg-rose-500 border-rose-600 text-white font-bold shadow-xs'
                                          : isCorrectLetter
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
                                      {optLetter}
                                    </span>
                                    <span className="leading-tight">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            /* Written input for Essay / Gap Fill */
                            <div className="space-y-1">
                              <textarea
                                value={studentAnswer || ''}
                                disabled={onlineSubmitted}
                                onChange={(e) => {
                                  setStudentAnswers({
                                    ...studentAnswers,
                                    [q.id]: e.target.value
                                  });
                                }}
                                placeholder="Nhập câu trả lời chi tiết của em vào đây..."
                                className="w-full text-xs font-medium px-4 py-3 bg-slate-50 border rounded-xl border-slate-200 focus:bg-white outline-none min-h-[80px]"
                              />
                            </div>
                          )}

                          {/* Submissions solutions explanations after submit button click */}
                          {onlineSubmitted && (
                            <div className="bg-amber-50/40 border-l-4 border-amber-500/80 p-3 rounded-r-xl text-[11.5px] leading-relaxed space-y-1 mt-2">
                              <div className="font-bold text-amber-800">💡 HƯỚNG DẪN BÀI GIẢI:</div>
                              <p className="text-slate-755 italic font-sans">{q.answerGuide || 'Đáp án đang được giáo viên phê chuẩn tự động.'}</p>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>

            {/* Bottom action drawer */}
            <div className="p-4 border-t bg-slate-50 flex justify-between items-center px-6">
              <span className="text-xs font-semibold text-slate-500">
                Tiến độ làm bài: {Object.keys(studentAnswers).length} / {generatedQuestions.length} câu đã trả lời
              </span>
              <div className="flex gap-2">
                {!onlineSubmitted ? (
                  <button
                    onClick={() => {
                      if (Object.keys(studentAnswers).length === 0) {
                        triggerToast("⚠️ Em chưa trả lời câu hỏi nào!");
                        return;
                      }
                      setOnlineSubmitted(true);
                      setOnlineTimerActive(false);
                      triggerToast("🎉 Em đã hoàn thành và nộp bài thi thành công!");
                      SoundEffects.playKeng();
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    Nộp bài thi ✓
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setStudentAnswers({});
                      setOnlineSubmitted(false);
                      setOnlineTimeLeft(600);
                      setOnlineTimerActive(true);
                      triggerToast("🔄 Thí sinh bắt đầu thi lại từ đầu.");
                      SoundEffects.playTing();
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
                  >
                    Thi lại 🔄
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowOnlineExamModal(false);
                    setOnlineTimerActive(false);
                  }}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-xs transition cursor-pointer"
                >
                  Thoát phòng thi
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
