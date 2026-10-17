import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { generateStudentExamPDFHtml } from '../utils/pdfGenerator';
import { downloadWordDocument, downloadClassSubmissionsWordZip, generateStudentExamWordHtml, formatExportFileName, downloadStudentExamPdf, downloadClassSubmissionsPdfZip } from '../utils/wordGenerator';
import { INITIAL_LESSONS } from '../types';
import { 
  Globe, 
  Clock, 
  User, 
  Trash2, 
  Copy, 
  CheckCircle, 
  ChevronRight, 
  BarChart, 
  Lock, 
  BookOpen, 
  Check, 
  X,
  RefreshCw,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface OnlineExamsViewProps {
  role?: string;
  currUser?: any;
  directTakeExamId?: string;
  activeSubject?: string;
}

const cleanPrefix = (str: string): string => {
  if (!str) return '';
  let cleaned = str.trim();
  const regex = /^\s*([A-Da-d0-9]\s*[\.\:\-\)\u2013\u2014]\s*)+/;
  while (regex.test(cleaned)) {
    cleaned = cleaned.replace(regex, '').trim();
  }
  return cleaned;
};

const shuffleArray = (array: any[]): any[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function OnlineExamsView({ role = 'teacher', currUser, directTakeExamId, activeSubject }: OnlineExamsViewProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [activeReportExam, setActiveReportExam] = useState<any | null>(null);
  
  // Student States
  const [activeTakeExam, setActiveTakeExam] = useState<any | null>(null);
  const [studentStt, setStudentStt] = useState('01');
  const [studentName, setStudentName] = useState(currUser?.fullname || '');
  const [attemptedStartExam, setAttemptedStartExam] = useState(false);
  const [studentGradeSelect, setStudentGradeSelect] = useState<string>(() => {
    try {
      const savedGrades = localStorage.getItem('lms_grades_registry');
      const grades = savedGrades ? (JSON.parse(savedGrades) as number[]) : [1, 2, 3, 4, 5];
      const savedHidden = localStorage.getItem('lms_hidden_grades');
      const hidden = savedHidden ? (JSON.parse(savedHidden) as number[]) : [];
      const visible = grades.filter(g => !hidden.includes(g));
      if (visible.length > 0) return `Khối ${visible[0]}`;
    } catch(e){}
    return 'Khối 3';
  });
  const [studentClassSelect, setStudentClassSelect] = useState<string>(() => {
    try {
      const savedGrades = localStorage.getItem('lms_grades_registry');
      const grades = savedGrades ? (JSON.parse(savedGrades) as number[]) : [1, 2, 3, 4, 5];
      const savedHidden = localStorage.getItem('lms_hidden_grades');
      const hidden = savedHidden ? (JSON.parse(savedHidden) as number[]) : [];
      const visible = grades.filter(g => !hidden.includes(g));
      const activeGrade = visible[0] || 3;

      const savedClasses = localStorage.getItem('lms_classes_by_grade_registry');
      const classesByGrade = savedClasses ? JSON.parse(savedClasses) : {
        1: ['1.1', '1.2', '1.3', '1.4', '1.5'],
        2: ['2.1', '2.2', '2.3', '2.4', '2.5'],
        3: ['3.1', '3.2', '3.3', '3.4', '3.5'],
        4: ['4.1', '4.2', '4.3', '4.4', '4.5'],
        5: ['5.1', '5.2', '5.3', '5.4', '5.5']
      };
      const classes = classesByGrade[activeGrade] || [];
      const savedHiddenClasses = localStorage.getItem('lms_hidden_classes');
      const hiddenClasses = savedHiddenClasses ? JSON.parse(savedHiddenClasses) : [];

      const visibleClasses = classes.filter((cls: string) => !hiddenClasses.includes(`${activeGrade}-${cls}`));
      if (visibleClasses.length > 0) return visibleClasses[0];
    } catch(e) {}
    return '3.1';
  });
  const [studentClass, setStudentClass] = useState(() => {
    return currUser?.className || `${studentGradeSelect} - Lớp ${studentClassSelect}`;
  });
  const [enteredCode, setEnteredCode] = useState('');
  const [isExamConfigPhase, setIsExamConfigPhase] = useState(true);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Premium Sharing and Preview States
  const [lastSavedReportId, setLastSavedReportId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Directly edit online exam details & classroom report filters
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [detailedEditingExam, setDetailedEditingExam] = useState<any | null>(null);
  const [editTestName, setEditTestName] = useState<string>('');
  const [editTimeLimit, setEditTimeLimit] = useState<number>(45);
  const [editAccessCode, setEditAccessCode] = useState<string>('');
  const [selectedReportClass, setSelectedReportClass] = useState<string>('all');
  const [examIdToDelete, setExamIdToDelete] = useState<string | null>(null);
  const [examIdToClear, setExamIdToClear] = useState<string | null>(null);
  const [deletedSubmissionsBackup, setDeletedSubmissionsBackup] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem('lms_deleted_submissions_backup');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Dynamic dynamic registry of classes synchronized with ADMIN data
  const [adminClassesRegistry, setAdminClassesRegistry] = useState<{ [key: number]: string[] }>(() => {
    try {
      const saved = localStorage.getItem('lms_classes_by_grade_registry');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      1: ['1.1', '1.2', '1.3', '1.4', '1.5'],
      2: ['2.1', '2.2', '2.3', '2.4', '2.5'],
      3: ['3.1', '3.2', '3.3', '3.4', '3.5'],
      4: ['4.1', '4.2', '4.3', '4.4', '4.5'],
      5: ['5.1', '5.2', '5.3', '5.4', '5.5']
    };
  });

  // Lesson Programs and Grade selection state
  const isGrade3Locked = currUser?.grade === 3;
  const [activeProgram, setActiveProgram] = useState<string>('Kết nối tri thức với cuộc sống');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number>(() => currUser?.grade || 3);

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

  const [hiddenGrades, setHiddenGrades] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('lms_hidden_grades');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [hiddenClasses, setHiddenClasses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_hidden_classes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedProg = localStorage.getItem('lms_hidden_programs');
        if (savedProg) setHiddenPrograms(JSON.parse(savedProg));
        const savedSub = localStorage.getItem('lms_hidden_subjects');
        if (savedSub) setHiddenSubjects(JSON.parse(savedSub));
        const savedGrades = localStorage.getItem('lms_grades_registry');
        if (savedGrades) setGradesList(JSON.parse(savedGrades));
        const savedClasses = localStorage.getItem('lms_classes_by_grade_registry');
        if (savedClasses) setAdminClassesRegistry(JSON.parse(savedClasses));
        const savedHiddenGrades = localStorage.getItem('lms_hidden_grades');
        if (savedHiddenGrades) setHiddenGrades(JSON.parse(savedHiddenGrades));
        const savedHiddenClasses = localStorage.getItem('lms_hidden_classes');
        if (savedHiddenClasses) setHiddenClasses(JSON.parse(savedHiddenClasses));
      } catch(e){}
    };
    window.addEventListener('lms_settings_changed', handleSync);
    return () => window.removeEventListener('lms_settings_changed', handleSync);
  }, []);

  useEffect(() => {
    // If current grade selection is hidden or not in gradesList, reset it
    const activeGrades = gradesList.filter(g => !hiddenGrades.includes(g));
    const currentGradeNum = parseInt(studentGradeSelect.match(/\d+/)?.[0] || '3');
    
    let targetGradeNum = currentGradeNum;
    let targetGradeSelect = studentGradeSelect;

    if (!activeGrades.includes(currentGradeNum)) {
      if (activeGrades.length > 0) {
        targetGradeNum = activeGrades[0];
        targetGradeSelect = `Khối ${targetGradeNum}`;
        setStudentGradeSelect(targetGradeSelect);
      }
    }

    const classesOfGrade = adminClassesRegistry[targetGradeNum] || [];
    const visibleClasses = classesOfGrade.filter(cls => !hiddenClasses.includes(`${targetGradeNum}-${cls}`));
    
    if (!visibleClasses.includes(studentClassSelect)) {
      if (visibleClasses.length > 0) {
        setStudentClassSelect(visibleClasses[0]);
        setStudentClass(`${targetGradeSelect} - Lớp ${visibleClasses[0]}`);
      } else {
        setStudentClassSelect('A');
        setStudentClass(`${targetGradeSelect} - Lớp A`);
      }
    }
  }, [gradesList, hiddenGrades, adminClassesRegistry, hiddenClasses, studentGradeSelect, studentClassSelect]);

  useEffect(() => {
    if (hiddenPrograms.includes(activeProgram)) {
      if (activeProgram === 'Kết nối tri thức với cuộc sống' && !hiddenPrograms.includes('Tin học Quốc tế IC3 Spark')) {
        setActiveProgram('Tin học Quốc tế IC3 Spark');
      } else if (activeProgram === 'Tin học Quốc tế IC3 Spark' && !hiddenPrograms.includes('Kết nối tri thức với cuộc sống')) {
        setActiveProgram('Kết nối tri thức với cuộc sống');
      }
    }
  }, [hiddenPrograms, activeProgram]);

  // Auto-sync filter if active grade level is modified in personal information
  useEffect(() => {
    if (currUser?.grade === 3) {
      setSelectedGradeFilter(3);
    } else {
      setSelectedGradeFilter(currUser?.grade || 3);
    }
  }, [currUser?.grade]);

  // Handle auto-syncing of grade filter when the subject is Môn Tin học (since it only has Grades 3, 4, 5)
  useEffect(() => {
    const actSub = activeSubject || 'tin_hoc';
    if (actSub === 'tin_hoc' && selectedGradeFilter < 3) {
      setSelectedGradeFilter(Math.max(3, currUser?.grade || 3));
    }
  }, [activeSubject, selectedGradeFilter, currUser?.grade]);

  const activeGradeFilterId = isGrade3Locked ? 3 : selectedGradeFilter;

  // Load lessons list to extract topics/chapters
  const [lessonsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lms_lessons_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((l: any) => ({
            ...l,
            subject: l.id?.startsWith('lic3-') ? 'tin_hoc' : l.subject,
            programType: l.programType === 'GDPT2018' || l.programType === 'GDPT 2018' 
              ? 'Kết nối tri thức với cuộc sống' 
              : l.programType === 'IC3SPARK' || l.programType === 'IC3 SPARK'
                ? 'Tin học Quốc tế IC3 Spark'
                : l.programType
          }));
        }
      }
    } catch (e) {}
    return INITIAL_LESSONS;
  });

  // Class and Grade dynamic filtering menus
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');

  // Active Test Execution States
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [practicalImage, setPracticalImage] = useState<string>('');
  const [practicalLink, setPracticalLink] = useState<string>('');
  const [practicalFile, setPracticalFile] = useState<string>('');
  const [practicalFileName, setPracticalFileName] = useState<string>('');
  const [practicalFileType, setPracticalFileType] = useState<string>('');
  const practicalFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMatchingLeft, setSelectedMatchingLeft] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toast Notification System
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const processPracticalFile = (file: File) => {
    const validExts = ['.png', '.jpeg', '.jpg', '.bmp', '.pptx', '.ppt'];
    const fileName = file.name.toLowerCase();
    const isValid = validExts.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      triggerToast("⚠️ Vui lòng chọn tệp ảnh (.png, .jpeg, .bmp) hoặc bài thuyết trình PowerPoint (.pptx)!");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      triggerToast("⚠️ Dung lượng tệp quá lớn! Vui lòng chọn tệp dưới 50MB.");
      return;
    }

    const isImg = file.type.startsWith('image/') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.bmp');
    setPracticalFileName(file.name);
    setPracticalFileType(isImg ? 'image' : 'pptx');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (isImg) {
        setPracticalImage(base64);
        setPracticalFile(base64);
      } else {
        setPracticalImage('');
        setPracticalFile(base64);
      }

      // Proactively upload file to server to obtain permanent lightweight URL
      try {
        const uploadRes = await fetch('/api/upload-practical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            fileName: file.name,
            fileType: isImg ? 'image' : 'pptx'
          })
        });
        if (uploadRes.ok) {
          const resData = await uploadRes.json();
          if (resData && resData.url) {
            setPracticalFile(resData.url);
            if (isImg) {
              setPracticalImage(resData.url);
            }
          }
        }
      } catch (err) {
        console.warn("Upload practical file background notice:", err);
      }

      triggerToast(`📎 Đã đính kèm tệp bài tập: ${file.name}`);
      playTing();
    };
    reader.readAsDataURL(file);
  };

  const handlePracticalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPracticalFile(file);
    }
  };

  const playKeng = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav");
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const playTing = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Load exams from localStorage
  const loadExams = () => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    } catch (e) {
      list = [];
    }
    if (list.length === 0) {
      list = [
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
      localStorage.setItem('lms_custom_exams', JSON.stringify(list));
    }
    
    // Ensure all loaded exams have a shortCode (4 letters, 4 numbers)
    let updated = false;
    list = list.map((exam: any) => {
      if (!exam.shortCode) {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        let l = '';
        for (let i = 0; i < 4; i++) {
          l += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        let d = '';
        for (let i = 0; i < 4; i++) {
          d += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        exam.shortCode = l + d;
        updated = true;
      }
      return exam;
    });
    if (updated) {
      localStorage.setItem('lms_custom_exams', JSON.stringify(list));
    }
    
    setExams(list);
    return list;
  };

  // Sync custom exams with server database
  const syncExamsWithServer = async () => {
    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    } catch (e) {
      localList = [];
    }

    try {
      const res = await fetch('/api/exams');
      if (res.ok) {
        const serverList = await res.json();
        // Merge server list and local list based on unique IDs
        const mergedMap = new Map();
        localList.forEach((ex: any) => {
          if (ex && ex.id) mergedMap.set(ex.id, ex);
        });
        
        serverList.forEach((serverEx: any) => {
          if (serverEx && serverEx.id) {
            const localEx = mergedMap.get(serverEx.id);
            if (localEx) {
              const subMap = new Map();
              (localEx.submissions || []).forEach((s: any) => {
                if (s && s.id) subMap.set(s.id, s);
              });
              (serverEx.submissions || []).forEach((s: any) => {
                if (s && s.id) subMap.set(s.id, s);
              });
              const mergedSubmissions = Array.from(subMap.values());
              
              mergedMap.set(serverEx.id, {
                ...localEx,
                ...serverEx,
                submissions: mergedSubmissions
              });
            } else {
              mergedMap.set(serverEx.id, serverEx);
            }
          }
        });
        
        let mergedList = Array.from(mergedMap.values());
        
        // Ensure all loaded exams have a shortCode (4 letters, 4 numbers)
        let updated = false;
        mergedList = mergedList.map((exam: any) => {
          if (!exam.shortCode) {
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            const digits = '0123456789';
            let l = '';
            for (let i = 0; i < 4; i++) {
              l += letters.charAt(Math.floor(Math.random() * letters.length));
            }
            let d = '';
            for (let i = 0; i < 4; i++) {
              d += digits.charAt(Math.floor(Math.random() * digits.length));
            }
            exam.shortCode = l + d;
            updated = true;
          }
          return exam;
        });

        localStorage.setItem('lms_custom_exams', JSON.stringify(mergedList));
        setExams(mergedList);
        return mergedList;
      }
    } catch (err) {
      console.error("Failed to sync custom exams with server:", err);
    }

    return loadExams();
  };

  useEffect(() => {
    syncExamsWithServer();
  }, []);

  useEffect(() => {
    const initSync = async () => {
      const loadedList = await syncExamsWithServer();
      if (directTakeExamId && loadedList.length > 0) {
        const match = loadedList.find((ex: any) => 
          ex.id === directTakeExamId || 
          ex.shortCode === directTakeExamId ||
          (ex.shortCode && ex.shortCode.toLowerCase() === directTakeExamId.toLowerCase())
        );
        if (match) {
          setActiveTakeExam(match);
          setStudentAnswers({});
          setEnteredCode('');
          setIsExamConfigPhase(true);
          setShowResultOverlay(false);
          setStudentName('');
          setStudentStt('');
          setAttemptedStartExam(false);

          // Prepopulate based on matching's grade
          const matchedGradeNum = match.grade || 3;
          const availableClasses = adminClassesRegistry[matchedGradeNum] || [];
          const initialCls = availableClasses[0] || `${matchedGradeNum}.1`;
          setStudentGradeSelect(`Khối ${matchedGradeNum}`);
          setStudentClassSelect(initialCls);
          setStudentClass(`Khối ${matchedGradeNum} - Lớp ${initialCls}`);
        }
      }
    };
    initSync();
  }, [directTakeExamId]);

  // Timer Effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmitExam(true); // Auto-submit when time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  // Copy join details
  const handleCopyAccess = (exam: any) => {
    const directUrl = `${window.location.origin}${window.location.pathname}?takeExamId=${exam.id}`;
    navigator.clipboard.writeText(directUrl);
    triggerToast(`✨ Đã sao chép liên kết phòng thi tự do thành công: ${directUrl}`);
    playTing();
  };

  // Delete Exam
  const handleDeleteExam = (id: string, confirmed = false) => {
    if (!confirmed) {
      setExamIdToDelete(id);
      return;
    }
    const list = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    const filtered = list.filter((ex: any) => ex.id !== id);
    localStorage.setItem('lms_custom_exams', JSON.stringify(filtered));
    setExams(filtered);
    triggerToast("🗑️ Đã xóa đề thi khỏi hệ thống!");
    playKeng();
    if (activeReportExam?.id === id) setActiveReportExam(null);
    setExamIdToDelete(null);
  };

  // Clear all submissions for an exam
  const handleClearSubmissions = (examId: string, confirmed = false) => {
    if (!confirmed) {
      setExamIdToClear(examId);
      return;
    }
    const list = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    const targetExam = list.find((e: any) => e.id === examId);
    if (targetExam && targetExam.submissions && targetExam.submissions.length > 0) {
      const updatedBackup = { ...deletedSubmissionsBackup, [examId]: targetExam.submissions };
      setDeletedSubmissionsBackup(updatedBackup);
      try {
        localStorage.setItem('lms_deleted_submissions_backup', JSON.stringify(updatedBackup));
      } catch (e) {}
    }
    const updated = list.map((e: any) => {
      if (e.id === examId) {
        return { ...e, submissions: [] };
      }
      return e;
    });
    localStorage.setItem('lms_custom_exams', JSON.stringify(updated));
    setExams(updated);
    const activeReport = updated.find((e: any) => e.id === examId);
    if (activeReport) setActiveReportExam(activeReport);
    triggerToast("🧹 Đã xóa tất cả lượt nộp bài của ca thi!");
    playKeng();
    setExamIdToClear(null);
  };

  // Undo clear submissions
  const handleUndoClearSubmissions = (examId: string) => {
    const backup = deletedSubmissionsBackup[examId];
    if (!backup || backup.length === 0) {
      triggerToast("⚠️ Không có dữ liệu bài nộp nào để hoàn tác!");
      return;
    }
    const list = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    const updated = list.map((e: any) => {
      if (e.id === examId) {
        return { ...e, submissions: backup };
      }
      return e;
    });
    localStorage.setItem('lms_custom_exams', JSON.stringify(updated));
    setExams(updated);
    const activeReport = updated.find((e: any) => e.id === examId);
    if (activeReport) setActiveReportExam(activeReport);

    const updatedBackup = { ...deletedSubmissionsBackup };
    delete updatedBackup[examId];
    setDeletedSubmissionsBackup(updatedBackup);
    try {
      localStorage.setItem('lms_deleted_submissions_backup', JSON.stringify(updatedBackup));
    } catch (e) {}

    triggerToast("↩️ Đã hoàn tác và khôi phục lại các lượt nộp bài!");
    playKeng();
  };

  // Save inline exam edits (directly edit duration and access code)
  const handleSaveExamEdits = (examId: string) => {
    const list = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    const updated = list.map((e: any) => {
      if (e.id === examId) {
        return {
          ...e,
          testName: editTestName.trim() || e.testName,
          timeLimit: Number(editTimeLimit) || 45,
          accessCode: editAccessCode.trim()
        };
      }
      return e;
    });
    localStorage.setItem('lms_custom_exams', JSON.stringify(updated));
    setExams(updated);
    setEditingExamId(null);
    triggerToast("📝 Đã lưu hiệu chỉnh phòng thi trực tuyến thành công!");
    playTing();
  };

  // Export class-based Word submissions as a single ZIP of individual Word files
  const handleExportClassSubmissionsWordZip = async (className: string) => {
    if (!activeReportExam) return;
    try {
      triggerToast(`📥 Đang kết xuất bộ tệp Word học tập lớp ${className === 'all' ? 'Tất cả' : className} thành file ZIP...`);
      playTing();
      
      await downloadClassSubmissionsWordZip(activeReportExam, className);
      triggerToast(`✓ Đã tải xuống file ZIP tệp Word lớp ${className === 'all' ? 'Tất cả' : className}!`);
    } catch (err: any) {
      console.error("Lỗi xuất ZIP thống kê học sinh:", err);
      triggerToast(`❌ Lỗi: ${err.message || "Không thể tải file ZIP."}`);
    }
  };

  // Export class-based PDF submissions as a single ZIP of individual PDF files
  const handleExportClassSubmissionsPdfZip = async (className: string) => {
    if (!activeReportExam) return;
    try {
      triggerToast(`📥 Đang kết xuất bộ tệp PDF học tập lớp ${className === 'all' ? 'Tất cả' : className} thành file ZIP...`);
      playTing();
      
      await downloadClassSubmissionsPdfZip(activeReportExam, className);
      triggerToast(`✓ Đã tải xuống file ZIP tệp PDF lớp ${className === 'all' ? 'Tất cả' : className}!`);
    } catch (err: any) {
      console.error("Lỗi xuất ZIP thống kê học sinh PDF:", err);
      triggerToast(`❌ Lỗi: ${err.message || "Không thể tải file ZIP."}`);
    }
  };

  // Student enters Take Exam phase
  const handlePrepareTakeExam = (exam: any) => {
    setActiveTakeExam(exam);
    setStudentAnswers({});
    setEnteredCode('');
    setIsExamConfigPhase(true);
    setShowResultOverlay(false);
    setIsReviewMode(false);
    setAttemptedStartExam(false);
    setPracticalImage('');
    setPracticalLink('');
    setPracticalFile('');
    setPracticalFileName('');
    setPracticalFileType('');
    playTing();
  };

  // Launch Active Testing Clock
  const handleStartExamCountdown = () => {
    setAttemptedStartExam(true);
    if (!studentStt.trim()) {
      triggerToast("⚠️ Vui lòng điền Số thứ tự để tiếp tục thi.");
      return;
    }
    if (!studentName.trim()) {
      triggerToast("⚠️ Vui lòng điền Họ tên học sinh để tiếp tục thi.");
      return;
    }
    if (activeTakeExam.accessCode && enteredCode.trim().toUpperCase() !== activeTakeExam.accessCode.toUpperCase()) {
      triggerToast("❌ Sai mã ca thi/Mã phòng! Vui lòng kiểm tra lại thiết lập.");
      return;
    }
    setIsExamConfigPhase(false);
    setTimeLeft((activeTakeExam.timeLimit || 45) * 60);
    setTimerActive(true);
    playKeng();

    if (activeTakeExam.isShuffleEnabled) {
      const shuffled = shuffleArray(activeTakeExam.questions || []);
      setActiveTakeExam(prev => ({
        ...prev,
        questions: shuffled
      }));
    }
  };

  // Student Submits Exam
  const handleSubmitExam = (force = false) => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    const questions = activeTakeExam.questions || [];
    let correctPointsSum = 0;
    let totalMaxScore = activeTakeExam.matrixTotalScore || 10;
    let totalQuestions = questions.length || 1;

    const normalizeAnsCheck = (str: string) => {
      return (str || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/,/g, '')
        .replace(/-/g, '')
        .replace(/đ/g, 'd')
        .replace(/ú/g, 'u')
        .trim();
    };

    const parseAnswerStringToMap = (ansStr: string) => {
      const obj: Record<string, string> = {};
      if (!ansStr) return obj;
      // Split on comma, pipe, or semicolon
      const parts = ansStr.split(/[|,;]/);
      parts.forEach((part: string) => {
        const dashIdx = part.indexOf("-");
        if (dashIdx !== -1) {
          const key = part.slice(0, dashIdx).trim().toUpperCase();
          const val = part.slice(dashIdx + 1).trim().toLowerCase();
          if (key) {
            obj[key] = val;
          }
        }
      });
      return obj;
    };

    questions.forEach((q: any) => {
      const studentAnsInput = studentAnswers[q.id];
      if (studentAnsInput === undefined || studentAnsInput === null || studentAnsInput === '') return;

      const studentAnsStr = String(studentAnsInput);
      const correctAnsStr = String(q.correctAnswer || '');

      if (q.type === 'multiple_choice') {
        if (studentAnsStr.trim().toUpperCase() === correctAnsStr.trim().toUpperCase()) {
          correctPointsSum += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
        }
      } else if (q.type === 'true_false') {
        if (q.statements && q.statements.length > 0) {
          const studentTfObj = parseAnswerStringToMap(studentAnsStr);
          const correctTfObj = parseAnswerStringToMap(correctAnsStr);
          
          const qPointsTotal = q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          const pointsPerStatement = qPointsTotal / q.statements.length;

          q.statements.forEach((st: any) => {
            const sLabel = String(st.label || '').trim().toUpperCase();
            if (studentTfObj[sLabel] === correctTfObj[sLabel] && correctTfObj[sLabel] !== undefined) {
              correctPointsSum += st.points !== undefined ? Number(st.points) : pointsPerStatement;
            }
          });
        } else {
          const normStudent = normalizeAnsCheck(studentAnsStr);
          const normCorrect = normalizeAnsCheck(correctAnsStr);
          if (normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "")) {
            correctPointsSum += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          }
        }
      } else if (q.type === 'matching') {
        if (q.matchingPairs && q.matchingPairs.length > 0) {
          const studentMatchObj = parseAnswerStringToMap(studentAnsStr);
          const correctMatchObj = parseAnswerStringToMap(correctAnsStr);

          const qPointsTotal = q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          const pointsPerPair = qPointsTotal / q.matchingPairs.length;

          q.matchingPairs.forEach((pair: any) => {
            const mId = String(pair.id || '').trim();
            if (studentMatchObj[mId] === correctMatchObj[mId] && correctMatchObj[mId] !== undefined) {
              correctPointsSum += pair.points !== undefined ? Number(pair.points) : pointsPerPair;
            }
          });
        } else {
          const normStudent = normalizeAnsCheck(studentAnsStr);
          const normCorrect = normalizeAnsCheck(correctAnsStr);
          if (normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "")) {
            correctPointsSum += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          }
        }
      } else if (q.type === 'gap_fill') {
        const studentWords = studentAnsStr.trim().toLowerCase().replace(/\s+/g, ' ');
        const correctWords = correctAnsStr.trim().toLowerCase().replace(/\s+/g, ' ');
        if (studentWords === correctWords || correctWords.includes(studentWords)) {
          correctPointsSum += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
        }
      } else if (q.type === 'quiz_multi' || q.type === 'multiple_choice_multi' || q.gameType === 'quiz_multi' || q.gameType === 'multiple_choice_multi') {
        const normalizeMultiSelect = (ans: string) => {
          return ans.split(/[|,;]/)
            .map(x => x.trim().toUpperCase())
            .filter(Boolean)
            .sort()
            .join(',');
        };
        const studentNorm = normalizeMultiSelect(studentAnsStr);
        const correctNorm = normalizeMultiSelect(correctAnsStr);
        if (studentNorm === correctNorm && correctNorm !== "") {
          correctPointsSum += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
        }
      } else if (q.type === 'dropdown_gap_fill' || q.gameType === 'dropdown_gap_fill') {
        if (q.dropdownGaps && q.dropdownGaps.length > 0) {
          const studentTfObj = parseAnswerStringToMap(studentAnsStr);
          const qPointsTotal = q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          const pointsPerGap = qPointsTotal / q.dropdownGaps.length;

          q.dropdownGaps.forEach((gap: any, gIdx: number) => {
            const gapLabel = `[${gIdx + 1}]`;
            const studentChoice = (studentTfObj[gapLabel] || studentAnsStr).trim().toLowerCase();
            const correctChoice = String(gap.correctAnswer || '').trim().toLowerCase();
            if (studentChoice === correctChoice && correctChoice !== "") {
              correctPointsSum += pointsPerGap;
            }
          });
        } else {
          const studentChoice = studentAnsStr.trim().toLowerCase();
          const correctChoice = correctAnsStr.trim().toLowerCase();
          if (studentChoice === correctChoice && correctChoice !== "") {
            correctPointsSum += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          }
        }
      } else if (q.type === 'hotspot_image' || q.gameType === 'hotspot_image') {
        const coords = studentAnsStr.split(',').map(num => parseFloat(num.trim()));
        const clickX = coords[0];
        const clickY = coords[1];
        const targetX = q.hotspotRect?.x || 50;
        const targetY = q.hotspotRect?.y || 50;
        const radius = q.hotspotRect?.radius || 30;

        if (!isNaN(clickX) && !isNaN(clickY)) {
          const distance = Math.sqrt(Math.pow(clickX - targetX, 2) + Math.pow(clickY - targetY, 2));
          // Tolerance is proportional to the custom image bounds, we'll accept clicks within ~10% visual offset
          if (distance <= 10) {
            correctPointsSum += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          }
        }
      }
    });

    const finalScore = Number(Math.min(totalMaxScore, Math.max(0, correctPointsSum)).toFixed(2));
    setCalculatedScore(finalScore);
    setShowResultOverlay(true);
    setIsReviewMode(true);
    playKeng();

    // Persist submission record directly into that custom exam's submissions array
    try {
      const list = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
      const newSub = {
        id: `sub-${Date.now()}`,
        studentName: studentName,
        studentClass: studentClass,
        studentStt: studentStt,
        score: finalScore,
        theoryScore: finalScore,
        totalMax: totalMaxScore,
        completedAt: new Date().toLocaleString('vi-VN'),
        answers: {
          ...studentAnswers,
          practical_image: practicalImage,
          practical_link: practicalLink,
          practical_file: practicalFile,
          practical_file_name: practicalFileName,
          practical_file_type: practicalFileType,
          p1_score: 0,
          p2_score: 0,
          p3_score: 0,
          p4_score: 0,
          p5_score: 0
        }
      };

      // 1. Post submission to the server first
      fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: activeTakeExam.id,
          submission: newSub
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.practicalFileUrl) {
          newSub.answers.practical_file = data.practicalFileUrl;
        }
        if (data && data.practicalImageUrl) {
          newSub.answers.practical_image = data.practicalImageUrl;
        }
      })
      .catch(err => console.error("Error submitting exam to server:", err));

      // 2. Safe local state and localStorage persistence
      const updatedList = list.map((ex: any) => {
        if (ex.id === activeTakeExam.id) {
          const subs = ex.submissions || [];
          return { ...ex, submissions: [newSub, ...subs] };
        }
        return ex;
      });

      // Guard against quota exceeded error
      try {
        localStorage.setItem('lms_custom_exams', JSON.stringify(updatedList));
      } catch (quotaErr) {
        console.warn("Storage quota reached, storing stripped version locally:", quotaErr);
        try {
          const lightweightList = updatedList.map((ex: any) => ({
            ...ex,
            submissions: (ex.submissions || []).map((s: any) => {
              if (!s.answers) return s;
              const a = { ...s.answers };
              if (typeof a.practical_file === 'string' && a.practical_file.startsWith('data:')) {
                a.practical_file = `[Đã lưu tệp ${a.practical_file_name || 'PowerPoint'} lên hệ thống]`;
              }
              if (typeof a.practical_image === 'string' && a.practical_image.startsWith('data:')) {
                a.practical_image = '';
              }
              return { ...s, answers: a };
            })
          }));
          localStorage.setItem('lms_custom_exams', JSON.stringify(lightweightList));
        } catch (e2) {
          console.error("Critical localStorage quota:", e2);
        }
      }

      setExams(updatedList);
      window.dispatchEvent(new Event('lms_settings_changed'));
      triggerToast("✅ Đã nộp bài thi thành công! Hệ thống đã ghi nhận bài làm của em.");
    } catch (err) {
      console.error("Lưu bài nộp trực tuyến lỗi:", err);
      triggerToast("⚠️ Có lỗi khi lưu bài thi vào bộ nhớ cục bộ, hệ thống đang đồng bộ...");
    }
  };

  // Export submissions to a beautiful XLSX file
  const handleExportScoresToExcel = (examObj: any) => {
    if (!examObj || !examObj.submissions || examObj.submissions.length === 0) {
      triggerToast("⚠️ Không có học sinh nào nộp bài để xuất điểm!");
      return;
    }

    try {
      const dataRows = examObj.submissions.map((sub: any, idx: number) => {
        const p1 = sub.answers?.p1_score !== undefined ? Number(sub.answers.p1_score) : 0;
        const p2 = sub.answers?.p2_score !== undefined ? Number(sub.answers.p2_score) : 0;
        const p3 = sub.answers?.p3_score !== undefined ? Number(sub.answers.p3_score) : 0;
        const p4 = sub.answers?.p4_score !== undefined ? Number(sub.answers.p4_score) : 0;
        const p5 = sub.answers?.p5_score !== undefined ? Number(sub.answers.p5_score) : 0;
        const practicalScore = examObj.isPracticalEnabled === true ? (p1 + p2 + p3 + p4 + p5) : 0;
        
        const theoryScore = sub.theoryScore !== undefined ? sub.theoryScore : sub.score;

        return {
          "STT": sub.studentStt || String(idx + 1).padStart(2, '0'),
          "Họ tên": sub.studentName || '',
          "Lớp": sub.studentClass || '',
          "Điểm trắc nghiệm": theoryScore,
          "Điểm thực hành": practicalScore,
          "Tổng điểm": sub.score
        };
      });

      dataRows.sort((a: any, b: any) => {
        const classComp = String(a["Lớp"]).localeCompare(String(b["Lớp"]));
        if (classComp !== 0) return classComp;
        return Number(a["STT"]) - Number(b["STT"]);
      });

      const worksheet = XLSX.utils.json_to_sheet(dataRows);
      
      const colWidths = [
        { wch: 6 },
        { wch: 26 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 14 }
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng Điểm");

      const safeName = examObj.testName.replace(/[^a-zA-Z0-9À-ỹ\s-_]/g, '');
      const fileName = `BANG_DIEM_${safeName.toUpperCase().replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      triggerToast("💚 Xuất bảng điểm Excel thành công!");
      playKeng();
    } catch (err: any) {
      console.error("Lỗi xuất Excel:", err);
      triggerToast(`❌ Lỗi xuất Excel: ${err.message}`);
    }
  };

  // Export completed test result and points as Word Document
  const handleExportResultWord = async (
    customAnswers?: Record<string, string>,
    customScore?: number,
    customStudentName?: string,
    customStudentClass?: string,
    customExamObject?: any,
    customStudentStt?: string
  ) => {
    const examObj = customExamObject || activeTakeExam || activeReportExam;
    if (!examObj) return;

    try {
      const currentAnswers = customAnswers || studentAnswers || {};
      const currentScore = customScore !== undefined ? customScore : calculatedScore;
      const currentStudentName = customStudentName || studentName || "Học sinh";
      const currentStudentClass = customStudentClass || studentClass || "Chưa chọn lớp";
      const currentStudentStt = customStudentStt || studentStt || "01";

      // Apply consistent styling and layout via our helper
      const htmlContent = generateStudentExamWordHtml(
        examObj,
        currentAnswers,
        currentScore,
        currentStudentName,
        currentStudentClass,
        currentStudentStt
      );
      
      triggerToast("📥 Bản Word kết quả khảo thí đang được tải xuống...");
      const finalFileName = formatExportFileName(currentStudentClass, currentStudentStt, currentStudentName);
      downloadWordDocument(htmlContent, finalFileName);

      // Save this student scorecard to completed reports database so they survive refreshes and can be shared
      const reportId = `report-${Date.now()}`;
      const newReportRecord = {
        id: reportId,
        studentName: currentStudentName,
        studentClass: currentStudentClass,
        score: currentScore,
        testId: examObj.id,
        testName: examObj.testName,
        subject: examObj.subject || 'Tin học',
        grade: examObj.grade || 3,
        completedAt: new Date().toLocaleDateString('vi-VN') + " " + new Date().toLocaleTimeString('vi-VN'),
        examObj,
        answers: currentAnswers,
      };

      try {
        const savedReports = JSON.parse(localStorage.getItem('lms_completed_pdf_reports') || '[]');
        const duplicate = savedReports.find((r: any) => 
          r.studentName === currentStudentName && 
          r.testId === examObj.id && 
          r.score === currentScore
        );
        if (!duplicate) {
          const updatedReports = [newReportRecord, ...savedReports];
          localStorage.setItem('lms_completed_pdf_reports', JSON.stringify(updatedReports));
        }
        setLastSavedReportId(reportId);
      } catch (err) {
        console.error("Lưu báo cáo điểm thất bại:", err);
      }
      return; // Bypassing legacy dead code below
    } catch (e) {
      console.error(e);
      triggerToast("❌ Có lỗi xảy ra khi xuất kết quả!");
      return;
    }


    // Historical legacy generator fallback (Bypassed)
    try {
      const qList = examObj.questions || [];
      const currentAnswers = customAnswers || studentAnswers || {};
      const currentScore = customScore !== undefined ? customScore : calculatedScore;
      const currentStudentName = customStudentName || studentName || "Học sinh";
      const currentStudentClass = customStudentClass || studentClass || "Chưa chọn lớp";

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
      
      const normalizeAnsCheck = (str: string) => {
        return (str || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/,/g, '')
          .replace(/-/g, '')
          .replace(/đ/g, 'd')
          .replace(/ú/g, 'u')
          .trim();
      };

      let questionsHtml = "";
      qList.forEach((q: any, idx: number) => {
        const studentAns = currentAnswers[q.id] !== undefined ? String(currentAnswers[q.id]) : "Chưa trả lời";
        const correctAns = q.correctAnswer ? String(q.correctAnswer) : "";
        
        let isCorrect = false;
        if (q.type === 'multiple_choice') {
          isCorrect = studentAns.trim().toUpperCase() === correctAns.trim().toUpperCase();
        } else if (q.type === 'true_false' || q.type === 'matching') {
          const normStudent = normalizeAnsCheck(studentAns);
          const normCorrect = normalizeAnsCheck(correctAns);
          isCorrect = normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "");
        } else if (q.type === 'gap_fill') {
          const studentWords = studentAns.trim().toLowerCase().replace(/\s+/g, ' ');
          const correctWords = correctAns.trim().toLowerCase().replace(/\s+/g, ' ');
          isCorrect = studentWords === correctWords || correctWords.includes(studentWords);
        }

        let optionsHtml = "";
        if (q.type === 'multiple_choice' && q.options) {
          const optKeys = ['A', 'B', 'C', 'D'];
          optionsHtml = `<div style="margin: 8px 0; padding-left: 20px;">`;
          optKeys.forEach(letter => {
            const idxKey = optKeys.indexOf(letter);
            const optVal = Array.isArray(q.options) ? q.options[idxKey] : q.options[letter];
            if (optVal) {
              const isStudentChoice = studentAns === letter;
              const isCorrectChoice = correctAns === letter;
              let choiceStyle = "color: #334155;";
              let icon = "";
              if (isStudentChoice) {
                if (isCorrectChoice) {
                  choiceStyle = "color: #15803d; font-weight: bold; background-color: #f0fdf4; padding: 2px 5px; border-radius: 4px;";
                  icon = "<span style='color: #15803d; margin-right: 5px; font-weight: bold;'>✔️</span> ";
                } else {
                  choiceStyle = "color: #b91c1c; font-weight: bold; text-decoration: line-through; background-color: #fef2f2; padding: 2px 5px; border-radius: 4px;";
                  icon = "<span style='color: #b91c1c; margin-right: 5px; font-weight: bold;'>❌</span> ";
                }
              } else if (isCorrectChoice) {
                choiceStyle = "color: #15803d; font-weight: bold; background-color: #f0fdf4; padding: 2px 5px; border-radius: 4px; border: 1px dashed #22c55e;";
                icon = "<span style='color: #15803d; margin-right: 5px; font-weight: bold;'>✔️ (Đáp án đúng)</span> ";
              }
              optionsHtml += `<div style="${choiceStyle} margin-bottom: 5px;">${icon}<strong>${letter}.</strong> ${optVal}</div>`;
            }
          });
          optionsHtml += `</div>`;
        } else if (q.type === 'true_false') {
          const studentTfObj: Record<string, string> = {};
          studentAns.split(",").forEach(part => {
            const [lbl, val] = part.split("-");
            if (lbl && val) {
              studentTfObj[lbl.trim().toUpperCase()] = val.trim();
            }
          });

          const correctTfObj: Record<string, string> = {};
          correctAns.split(",").forEach(part => {
            const [lbl, val] = part.split("-");
            if (lbl && val) {
              correctTfObj[lbl.trim().toUpperCase()] = val.trim();
            }
          });

          const statements = (Array.isArray(q.statements) ? q.statements : (q.statements ? Object.values(q.statements) : []));

          optionsHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; page-break-inside: avoid;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; font-size: 11pt;">
                <th style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; width: 50%;">Phát biểu học liệu</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 25%;">Học sinh chọn</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 25%;">Đáp án chuẩn</th>
              </tr>
            </thead>
            <tbody>`;

          statements.forEach((st: any, sidx: number) => {
            const letter = st.label || ['A', 'B', 'C', 'D'][sidx];
            const chosenVal = studentTfObj[letter.toUpperCase()] || "Chưa chọn";
            const correctVal = correctTfObj[letter.toUpperCase()] || "Chưa xác định";
            const isStCorrect = chosenVal.toLowerCase() === correctVal.toLowerCase();

            let indicator = "";
            if (chosenVal === "Chưa chọn") {
              indicator = `<span style="color: #64748b;">Chưa chọn</span>`;
            } else if (isStCorrect) {
              indicator = `<span style="color: #15803d; font-weight: bold;">✔️ ${chosenVal}</span>`;
            } else {
              indicator = `<span style="color: #b91c1c; font-weight: bold; text-decoration: line-through;">❌ ${chosenVal}</span>`;
            }

            const correctCell = `<span style="color: #15803d; font-weight: bold; background-color: #f0fdf4; padding: 2px 5px; border-radius: 4px;">✔️ ${correctVal}</span>`;

            optionsHtml += `
              <tr style="font-size: 11pt;">
                <td style="border: 1px solid #cbd5e1; padding: 6px;"><strong>${letter}.</strong> ${st.text || ''}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${indicator}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${correctCell}</td>
              </tr>
            `;
          });
          optionsHtml += `</tbody></table>`;
        } else if (q.type === 'matching') {
          const pairs = q.matchingPairs || [];
          const leftItems = [...pairs].sort((a: any, b: any) => String(a.id).localeCompare(String(b.id)));
          const rightItems = [...pairs].sort((a: any, b: any) => String(a.id_match || '').toLowerCase().localeCompare(String(b.id_match || '').toLowerCase()));
          
          const currentAnswersObj: Record<string, string> = {};
          studentAns.split(",").forEach(part => {
            const [leftId, rightId] = part.split("-");
            if (leftId && rightId) {
              currentAnswersObj[leftId.trim()] = rightId.trim();
            }
          });

          const correctAnswersObj: Record<string, string> = {};
          const correctAnsRaw = q.correctAnswer || "";
          correctAnsRaw.split(",").forEach(part => {
            const [leftId, rightId] = part.split("-");
            if (leftId && rightId) {
              correctAnswersObj[leftId.trim()] = rightId.trim();
            }
          });

          optionsHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; page-break-inside: avoid;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; font-size: 11pt;">
                <th style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; width: 40%;">Cột A (Vế trái)</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 25%;">Học sinh ghép</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; width: 35%;">Cột B (Vế phải)</th>
              </tr>
            </thead>
            <tbody>`;

          leftItems.forEach((leftPair: any, pidx: number) => {
            const rightPair = rightItems[pidx] || leftPair;
            const chosenMatchId = currentAnswersObj[leftPair.id] || "";
            const correctMatchId = correctAnswersObj[leftPair.id] || "";
            const isPairCorrect = chosenMatchId.toLowerCase() === correctMatchId.toLowerCase();
            
            let matchIndicator = "";
            if (chosenMatchId) {
              matchIndicator = isPairCorrect 
                ? `<span style="color: #15803d; font-weight: bold;">✔️ ${leftPair.id} - ${chosenMatchId}</span>`
                : `<span style="color: #b91c1c; font-weight: bold; text-decoration: line-through;">❌ ${leftPair.id} - ${chosenMatchId}</span> <br/> <span style="color: #15803d; font-size: 9.5pt; font-weight: bold;">(Đúng: ${leftPair.id}-${correctMatchId})</span>`;
            } else {
              matchIndicator = `<span style="color: #dc2626;">Chưa ghép (Đúng: ${correctMatchId})</span>`;
            }

            optionsHtml += `
              <tr style="font-size: 11pt;">
                <td style="border: 1px solid #cbd5e1; padding: 6px;"><strong>${leftPair.id}.</strong> ${leftPair.left}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${matchIndicator}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;"><strong>${rightPair.id_match || rightPair.id}.</strong> ${rightPair.right}</td>
              </tr>
            `;
          });
          optionsHtml += `</tbody></table>`;
        } else if (q.type === 'gap_fill') {
          optionsHtml = `<div style="margin: 8px 0; padding-left: 10px;">
            <span style="display: inline-block; border: 1px solid #cbd5e1; padding: 6px 12px; background-color: #f8fafc; border-radius: 6px; min-width: 150px; font-weight: bold; color: ${isCorrect ? '#15803d' : '#b91c1c'}">
              Trả lời: ${studentAns}
            </span>
          </div>`;
        }

        questionsHtml += `
          <div style="margin-bottom: 22px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1; page-break-inside: avoid;">
            <div style="font-weight: bold; margin-bottom: 8px;">
              Câu ${idx + 1}: ${q.questionText} <span style="font-size: 11pt; color: #475569;">(${q.points || (10 / qList.length).toFixed(1)} điểm)</span>
            </div>
            ${optionsHtml}
            <div style="margin-top: 6px; font-size: 11.5pt;">
              <div style="margin-bottom: 4px;">
                • Bài làm học sinh: <strong style="${isCorrect ? 'color: #15803d;' : 'color: #b91c1c;'}">${studentAns}</strong>
                ${isCorrect ? ' <span style="color: #15803d; font-weight: bold;">(Đúng ✔️)</span>' : ' <span style="color: #b91c1c; font-weight: bold;">(Chưa chính xác ❌)</span>'}
              </div>
              ${!isCorrect ? `<div>• Đáp án chuẩn xác: <strong style="color: #1e3a8a;">${correctAns}</strong></div>` : ''}
              ${q.answerGuide ? `<div style="color: #475569; font-style: italic; margin-top: 5px; font-size: 11pt; background-color: #f8fafc; padding: 8px; border-radius: 4px; border-left: 3px solid #f59e0b;">🔑 Giải thích bài giải: ${q.answerGuide}</div>` : ''}
            </div>
          </div>
        `;
      });

      const commentStr = currentScore >= 9.0 
        ? "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết và thực hành xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo." 
        : currentScore >= 7.0 
        ? "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm, kỹ năng thực hành tốt, tích cực và chủ động trong các hoạt động học tập." 
        : currentScore >= 5.0 
        ? "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập thực hành nhiều hơn." 
        : "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm và kỹ năng thực hành cơ bản, cần được hướng dẫn rèn luyện thêm.";

      const recommStr = currentScore >= 9.0
        ? "Tiếp tục nâng cao năng lực tự học chuyên sâu & thử sức giáo trình học liệu Sáng tạo mở rộng."
        : currentScore >= 7.0
        ? "Tập trung rà soát các lỗi sơ suất kỹ thuật và hoàn thiện các chủ điểm bài tập tư duy mức độ cao hơn."
        : currentScore >= 5.0
        ? "Dành thêm thời gian ôn tập lý thuyết cốt lõi, hoàn thành đầy đủ các bài tập trắc nghiệm và củng cố ghép nối."
        : "Cần GV phụ trách hỗ trợ phụ đạo trực tiếp 1-1, tích cực làm lại đề thi thử tự quản trực tuyến.";

      iframeDoc.open();
      iframeDoc.write(`
        <html>
          <head>
            <title>KetQua_ThiOnline_${currentStudentName.replace(/\s+/g, "_")}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
              @page {
                size: A4;
                margin: 1.5cm 1.5cm 1.5cm 1.5cm;
              }
              body { 
                font-family: "Times New Roman", Times, serif; 
                font-size: 13pt; 
                line-height: 1.45; 
                color: #000;
                background-color: #fff;
                margin: 0;
                padding: 0;
              }
              .header-table {
                width: 100%;
                border: none;
                margin-bottom: 25px;
              }
              .title {
                text-align: center;
                font-size: 16pt;
                font-weight: bold;
                margin-top: 10px;
                margin-bottom: 5px;
                text-transform: uppercase;
              }
              .subtitle {
                text-align: center;
                font-size: 12pt;
                font-weight: bold;
                letter-spacing: 1px;
                margin-bottom: 25px;
              }
              .info-box {
                margin-bottom: 25px;
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 15px;
                border-radius: 8px;
              }
              .score-banner {
                background-color: #f0fdf4;
                border: 2px solid #16a34a;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                margin-bottom: 20px;
                page-break-inside: avoid;
              }
              .score-banner-title {
                font-size: 15pt;
                font-weight: bold;
                color: #14532d;
              }
            </style>
          </head>
          <body>
            <table class="header-table">
              <tr>
                <td style="width: 45%; text-align: center; font-weight: bold; font-size: 11pt;">
                  SỞ GIÁO DỤC VÀ ĐÀO TẠO VIỆT NAM<br>
                  BẬT LIÊN KẾT TRƯỜNG THỂ CHẤT SỐ<br>
                  -----
                </td>
                <td style="text-align: center; font-weight: bold; font-size: 11pt;">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
                  Độc lập - Tự do - Hạnh phúc<br>
                  Trực tuyến, ngày ${new Date().toLocaleDateString('vi-VN')}<br>
                  -----
                </td>
              </tr>
            </table>

            <div class="title mb-3">BẢN THỐNG KÊ KẾT QUẢ KHẢO THÍ SỐ</div>
            <div class="subtitle">MÔN HỌC: ${examObj.subject ? examObj.subject.toUpperCase() : 'TIN HỌC TIỂU HỌC'} - LỚP: ${examObj.grade || 3}</div>

            <div class="info-box">
              <div style="font-weight: bold; font-size: 13.5pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px; color: #1e293b;">THÔNG TIN HỌC SINH KHẢO THÍ:</div>
              <table style="width: 100%; border: none;">
                <tr>
                  <td style="padding: 3px 0; width: 50%;">Họ và tên thí sinh: <strong>${currentStudentName}</strong></td>
                  <td style="padding: 3px 0;">Ngày sinh / Mã định danh: <strong>Học viên số hóa</strong></td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Lớp đăng ký học tập: <strong>${currentStudentClass}</strong></td>
                  <td style="padding: 3px 0;">Đề thi: <strong>${examObj.testName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Sách giáo khoa: <strong>${examObj.bookSeries || 'Cánh Diều'}</strong></td>
                  <td style="padding: 3px 0;">Thời lượng phòng máy: <strong>${examObj.timeLimit || 40} phút</strong></td>
                </tr>
              </table>
            </div>

            <div class="score-banner">
              <div class="score-banner-title">
                SỐ ĐIỂM TỰ ĐỘNG ĐẠT ĐƯỢC: ${currentScore} / ${examObj.matrixTotalScore || 10} ĐIỂM
              </div>
              <div style="font-size: 11.5pt; color: #15803d; margin-top: 5px; font-weight: bold;">
                ĐÁNH GIÁ NĂNG LỰC (TT27): ${currentScore >= 9 ? 'Hoàn thành Xuất sắc' : currentScore >= 7 ? 'Hoàn thành Tốt' : currentScore >= 5 ? 'Hoàn thành' : 'Chưa hoàn thành'}
              </div>
            </div>

            <div style="margin-bottom: 25px; background-color: #f8fafc; border-left: 5px solid #1e3a8a; padding: 15px; border-radius: 4px; page-break-inside: avoid;">
              <div style="font-weight: bold; font-size: 13pt; color: #1e3a8a; margin-bottom: 8px;">✍️ NHẬN XÉT CHI TIẾT TỪ GIÁO VIÊN CHUYÊN MÔN:</div>
              <div style="font-style: italic; font-size: 12pt; color: #334155; margin-bottom: 6px;">
                "${commentStr}"
              </div>
              <div style="font-size: 11pt; color: #475569; margin-top: 8px;">
                <strong>• Định hướng kế hoạch ôn tập:</strong> ${recommStr}
              </div>
            </div>

            <div style="font-weight: bold; font-size: 14pt; margin-bottom: 15px; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; color: #1e3a8a;">
              BẢN ĐÁNH GIÁ CHI TIẾT ĐÁP ÁN CUỘC KHẢO THÍ
            </div>

            <div style="margin-top: 15px;">
              ${questionsHtml}
            </div>

            <table style="width: 100%; border: none; margin-top: 35px; page-break-inside: avoid;">
              <tr>
                <td style="width: 50%; text-align: center; font-style: italic;">
                  Giám thị phòng máy trực tuyến<br>
                  (Ký tên, ghi rõ chữ điện tử)<br><br><br><br>
                  <strong>Hệ Thống Tự Động LMS Giáo Dục</strong>
                </td>
                <td style="text-align: center; font-weight: bold;">
                  Thí sinh tham gia khảo thí<br>
                  (Ký tên và ghi rõ họ tên)<br><br><br><br>
                  <strong>${currentStudentName}</strong>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `);
      iframeDoc.close();
      triggerToast("📥 Bản PDF kết quả khảo thí và nhận xét học thuật đang được khởi tạo...");

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }, 3000);
        } catch (printErr) {
          console.error("Outer print triggered error inside result PDF:", printErr);
          window.print();
        }
      }, 600);
    } catch (e) {
      console.error(e);
      triggerToast("❌ Có lỗi xảy ra khi xuất kết quả!");
    }
  };

  // Export completed test result and points as PDF Document
  const handleExportResultPdf = async (
    customAnswers?: Record<string, string>,
    customScore?: number,
    customStudentName?: string,
    customStudentClass?: string,
    customExamObject?: any,
    customStudentStt?: string
  ) => {
    const examObj = customExamObject || activeTakeExam || activeReportExam;
    if (!examObj) return;

    try {
      const currentAnswers = customAnswers || studentAnswers || {};
      const currentScore = customScore !== undefined ? customScore : calculatedScore;
      const currentStudentName = customStudentName || studentName || "Học sinh";
      const currentStudentClass = customStudentClass || studentClass || "Chưa chọn lớp";
      const currentStudentStt = customStudentStt || studentStt || "01";

      triggerToast("⏳ Đang chuẩn bị xuất tệp PDF...");
      playTing();

      await downloadStudentExamPdf(
        examObj,
        currentAnswers,
        currentScore,
        currentStudentName,
        currentStudentClass,
        currentStudentStt
      );

      triggerToast("✓ Đã tải xuống file PDF kết quả học sinh!");
    } catch (err: any) {
      console.error("Lỗi xuất PDF thống kê học sinh:", err);
      triggerToast(`❌ Lỗi: ${err.message || "Không thể tải file PDF."}`);
    }
  };

  const handleSelectOption = (qId: string, optionLetter: string) => {
    setStudentAnswers(prev => ({
      ...prev,
      [qId]: optionLetter
    }));
    playTing();
  };

  const handleMatchingInteractive = (qId: string, leftText: string, rightText: string) => {
    // Stores matching connections like "A-1"
    setStudentAnswers(prev => ({
      ...prev,
      [qId]: `${leftText} - ${rightText}`
    }));
    playTing();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 bg-slate-900 border border-slate-705 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-450 shrink-0" />
          <span className="text-xs font-black">{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-[#1e3a8a] to-[#1e40af] text-white p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="bg-white/20 text-white text-[10px] px-3 py-0.5 rounded-full font-black uppercase inline-block border border-white/20 tracking-wider">
            🌐 Live LMS Online Testing Room
          </div>
          <h2 className="text-2.5xl md:text-3.5xl font-black text-white leading-tight">
            Cổng Luyện Thi & Khảo Sát Trực Tuyến
          </h2>
          <p className="text-xs text-indigo-50 font-medium max-w-3xl leading-relaxed">
            Hệ thống quản lý phòng thi ảo, tự thu nhận câu trả lời của học trò, tự chấm điểm số thông tin chuẩn quy chế đào tạo Bộ GD&ĐT!
          </p>
        </div>
        <span className="text-5.5xl select-none animate-pulse shrink-0">💻🏅</span>
      </div>

      {/* 2. Top Grade indicators */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 bg-white p-5 rounded-[24px] shadow-sm border-b-4 border-gray-100 mt-2">
        {/* Grade buttons for Grades dynamically synchronized */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto text-center justify-center">
          <span className="text-xs font-black text-gray-500 uppercase px-2 hidden sm:inline">Khối lớp:</span>
          {gradesList.filter(g => (activeSubject || 'tin_hoc') !== 'tin_hoc' || g >= 3).map((gradeNum) => {
            const isDisabled = isGrade3Locked && gradeNum !== 3;
            const isFilterSelected = activeGradeFilterId === gradeNum;
            return (
              <button
                key={gradeNum}
                disabled={isDisabled}
                onClick={() => { setSelectedGradeFilter(gradeNum); playTing(); }}
                className={`px-4 h-10 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  isFilterSelected
                    ? 'bg-white text-[#2454A6] shadow-md font-extrabold text-base cursor-pointer'
                    : isDisabled
                    ? 'text-gray-300 bg-gray-50/50 cursor-not-allowed opacity-60'
                    : 'text-gray-500 hover:text-[#2454A6] cursor-pointer'
                }`}
                title={isDisabled ? 'Nội dung đã khóa vì bạn thuộc Khối lớp 3' : `Xem đề thi Lớp ${gradeNum}`}
              >
                {isDisabled && <span className="text-xs">🔒</span>}
                <span>Lớp {gradeNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. List of Active Exams grouped by Topics */}
      {(() => {
        // Group lessons by topic name and subject
        const filteredLessons = lessonsList.filter(l => {
          const subNorm = (l.subject || 'tin_hoc').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
          const actSub = (activeSubject || 'tin_hoc').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/_/g, " ");
          const isSubjectMatch = (actSub.includes('tin') && subNorm.includes('tin')) ||
            (actSub.includes('viet') && subNorm.includes('viet')) ||
            (actSub.includes('toan') && subNorm.includes('toan')) ||
            (actSub.includes('anh') && subNorm.includes('anh')) ||
            subNorm.includes(actSub) || actSub.includes(subNorm);
          const isGradeMatch = l.grade === activeGradeFilterId;
          return isSubjectMatch && isGradeMatch;
        });

        // Distinct Chapters/Topics
        const uniqueTopics = Array.from(new Set(filteredLessons.map(l => l.topicName)));

        // Sort topics based on the teacher's configured order
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
        } catch (e) {}

        const displayTopics = uniqueTopics.length > 0 ? uniqueTopics : ["Chủ đề chung / Khảo sát định kỳ"];

        const filteredExams = exams.filter((ex: any) => {
          const matchGrade = ex.grade?.toString() === activeGradeFilterId.toString();
          const matchSubject = (() => {
            const subNorm = (ex.subject || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
            const actSub = (activeSubject || 'tin_hoc').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/_/g, " ");
            if (actSub.includes('tin') && subNorm.includes('tin')) return true;
            if (actSub.includes('viet') && subNorm.includes('viet')) return true;
            if (actSub.includes('toan') && subNorm.includes('toan')) return true;
            if (actSub.includes('anh') && subNorm.includes('anh')) return true;
            return subNorm.includes(actSub) || actSub.includes(subNorm);
          })();
          const matchCurriculum = true;

          const matchTeacher = (() => {
            const creator = ex.creatorUsername || 'admin';
            const creatorIsAdmin = creator === 'admin';
            
            if (role === 'admin') {
              // Admin sees only admin-created exams
              return creatorIsAdmin;
            }
            
            if (role === 'teacher') {
              // Teacher sees only their own exams
              return creator === currUser?.username || ex.creatorName === currUser?.fullname;
            }
            
            if (role === 'student' || role === 'user' || !role) {
              // Student sees exams created by admin OR exams created by the teacher of that student's specific class
              if (creatorIsAdmin) {
                return true;
              }
              // Check if the student's class matches the teacher's configured classes
              try {
                const teachersListStr = localStorage.getItem('lms_teachers_list');
                const teachers = teachersListStr ? JSON.parse(teachersListStr) : [];
                const matchedTeacher = teachers.find((t: any) => t.username === creator || t.fullname === ex.creatorName);
                if (matchedTeacher && matchedTeacher.classes) {
                  const studentClassNorm = (currUser?.className || '').toLowerCase().trim();
                  if (!studentClassNorm) return false;
                  
                  return matchedTeacher.classes.some((tc: string) => {
                    const tcNorm = tc.toLowerCase().trim();
                    if (!tcNorm) return false;
                    return studentClassNorm.includes(tcNorm) || tcNorm.includes(studentClassNorm) || 
                           studentClassNorm.replace(/[^a-zA-Z0-9]/g, '') === tcNorm.replace(/[^a-zA-Z0-9]/g, '');
                  });
                }
              } catch (e) {
                console.error("Error matching teacher class for student visibility:", e);
              }
              return false;
            }
            
            return true;
          })();

          return matchGrade && matchSubject && matchCurriculum && matchTeacher;
        });

        const getExamTopic = (ex: any) => {
          if (ex.topicName) return ex.topicName;
          if (ex.topic) return ex.topic;
          
          const normalizedTestName = (ex.testName || '').toLowerCase();
          
          // Try matching by lesson title
          for (const lesson of filteredLessons) {
            const titleClean = (lesson.title || '').toLowerCase();
            const lessonContent = titleClean.includes(':') ? titleClean.split(':')[1].trim() : titleClean;
            if (lessonContent && normalizedTestName.includes(lessonContent)) {
              return lesson.topicName;
            }
          }

          // Try matching by lesson number
          for (const lesson of filteredLessons) {
            if (lesson.lessonNumber) {
              const baiStr1 = `bài ${lesson.lessonNumber}`;
              const baiStr2 = `bài 0${lesson.lessonNumber}`;
              if (normalizedTestName.includes(baiStr1) || normalizedTestName.includes(baiStr2)) {
                return lesson.topicName;
              }
            }
          }

          if (uniqueTopics.length > 0) {
            return uniqueTopics[0];
          }

          return "Chủ đề chung / Khảo sát định kỳ";
        };

        // If there are absolutely no exams, show the full empty state
        if (filteredExams.length === 0) {
          return (
            <div className="py-16 text-center space-y-3 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm mt-4">
              <div className="text-6xl select-none">📥</div>
              <h4 className="text-sm font-bold text-slate-400">Không tìm thấy đề thi trực tuyến phù hợp bộ lọc</h4>
              <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                Vui lòng lọc theo các nhóm khối khác hoặc tạo đề thi trực tuyến trong tab <strong>"Tạo bài kiểm tra"</strong>.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-8 mt-4">
            {displayTopics.map((topic) => {
              const topicExams = filteredExams.filter(ex => getExamTopic(ex) === topic);
              
              if (topicExams.length === 0) return null; // Only show topics that have exams!

              return (
                <div key={topic} className="space-y-4 bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs">
                  {/* Chapter/Topic Heading Banner */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm md:text-base font-black text-[#2454A6] tracking-wide inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border-l-4 border-[#2454A6] rounded-r-lg">
                      📂 {topic}
                    </h3>
                    <span className="text-[10.5px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {topicExams.length} đề thi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {topicExams.map((ex) => (
                      <div 
                        key={ex.id}
                        className="p-4 bg-slate-50 hover:bg-white rounded-[24px] border border-slate-205 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative group text-left"
                      >
                        
                        {/* Badge headers info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-105">
                              {ex.subject || 'LMS Exam'}
                            </span>
                            <span className="text-[10.5px] font-mono text-slate-400 italic">
                              Lớp {ex.grade || 3} • {(() => {
                                if (!ex.createdAt) return '';
                                let dateObj: Date | null = null;
                                const t = Date.parse(ex.createdAt);
                                if (!isNaN(t)) {
                                  dateObj = new Date(t);
                                } else {
                                  const parts = ex.createdAt.split('/');
                                  if (parts.length === 3) {
                                    const day = parseInt(parts[0], 10);
                                    const month = parseInt(parts[1], 10) - 1;
                                    const year = parseInt(parts[2], 10);
                                    dateObj = new Date(year, month, day);
                                  }
                                }
                                if (!dateObj && ex.id) {
                                  const match = ex.id.match(/\d+/);
                                  if (match) {
                                    const ts = parseInt(match[0], 10);
                                    if (ts > 1000000000000 && ts < 4000000000000) {
                                      dateObj = new Date(ts);
                                    }
                                  }
                                }
                                if (!dateObj) return ex.createdAt;
                                const hours = String(dateObj.getHours()).padStart(2, '0');
                                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                                const day = String(dateObj.getDate()).padStart(2, '0');
                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                const year = dateObj.getFullYear();
                                return `${hours}:${minutes}, ${day}/${month}/${year}`;
                              })()}
                            </span>
                          </div>
                          
                          <h3 className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
                            {ex.testName}
                          </h3>

                          <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                            SGK: {ex.curriculumBook}
                          </p>

                          <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                            <span>📅 Ngày, giờ tạo:</span>
                            <span className="font-mono text-[10.5px] font-extrabold text-indigo-750">
                              {(() => {
                                if (!ex.createdAt) return 'Vừa xong';
                                let dateObj: Date | null = null;
                                const t = Date.parse(ex.createdAt);
                                if (!isNaN(t)) {
                                  dateObj = new Date(t);
                                } else {
                                  const parts = ex.createdAt.split('/');
                                  if (parts.length === 3) {
                                    const day = parseInt(parts[0], 10);
                                    const month = parseInt(parts[1], 10) - 1;
                                    const year = parseInt(parts[2], 10);
                                    dateObj = new Date(year, month, day);
                                  }
                                }
                                if (!dateObj && ex.id) {
                                  const match = ex.id.match(/\d+/);
                                  if (match) {
                                    const ts = parseInt(match[0], 10);
                                    if (ts > 1000000000000 && ts < 4000000000000) {
                                      dateObj = new Date(ts);
                                    }
                                  }
                                }
                                if (!dateObj) return ex.createdAt;
                                const hours = String(dateObj.getHours()).padStart(2, '0');
                                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                                const day = String(dateObj.getDate()).padStart(2, '0');
                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                const year = dateObj.getFullYear();
                                return `${hours}:${minutes} - ${day}/${month}/${year}`;
                              })()}
                            </span>
                          </p>

                          {editingExamId === ex.id ? (
                            <div className="space-y-2 bg-indigo-50/50 p-2.5 text-xs text-left rounded-xl border border-indigo-200">
                              <div className="font-black text-[9.5px] uppercase text-indigo-700 tracking-wider">Hiệu chỉnh nhanh phòng</div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500">Tên bài thi:</label>
                                <input
                                  type="text"
                                  value={editTestName || ''}
                                  onChange={(e) => setEditTestName(e.target.value)}
                                  className="w-full p-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                                  placeholder="Nhập tên bài thi"
                                />
                              </div>
                              <div className="flex gap-2 items-center">
                                <label className="text-[10px] font-bold text-slate-500 shrink-0">Thời gian (phút):</label>
                                <input
                                  type="number"
                                  value={editTimeLimit ?? 45}
                                  onChange={(e) => setEditTimeLimit(Number(e.target.value))}
                                  className="w-16 p-1 text-xs font-bold border border-slate-350 rounded bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                                  min="1"
                                  max="180"
                                />
                              </div>
                              <div className="flex gap-2 items-center">
                                <label className="text-[10px] font-bold text-slate-500 shrink-0">Mã phòng:</label>
                                <input
                                  type="text"
                                  value={editAccessCode || ''}
                                  onChange={(e) => setEditAccessCode(e.target.value)}
                                  className="flex-1 p-1 text-xs font-bold border border-slate-350 rounded bg-white text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                  placeholder="Trống = Công khai"
                                />
                              </div>
                              <div className="flex gap-1.5 pt-1">
                                <button
                                  onClick={() => handleSaveExamEdits(ex.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black cursor-pointer transition shadow-3xs"
                                >
                                  Lưu lại
                                </button>
                                <button
                                  onClick={() => setEditingExamId(null)}
                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-12 gap-2 pt-1 font-mono text-[10.5px] text-slate-600 bg-white/60 p-2 rounded-xl">
                              <div className="col-span-6 flex items-center gap-1.5 font-sans font-bold">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                                <span>{ex.questions?.length || 0} câu hỏi</span>
                              </div>
                              <div className="col-span-6 flex items-center gap-1.5 font-sans font-bold">
                                <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span>{ex.timeLimit || 45} phút</span>
                                {(role === 'teacher' || role === 'admin') && (
                                  <button
                                    onClick={() => {
                                      setEditingExamId(ex.id);
                                      setEditTestName(ex.testName || '');
                                      setEditTimeLimit(ex.timeLimit || 45);
                                      setEditAccessCode(ex.accessCode || '');
                                      playTing();
                                    }}
                                    className="ml-auto text-blue-700 hover:text-blue-900 text-[10px] underline hover:no-underline font-extrabold cursor-pointer shrink-0"
                                  >
                                    ✏️ Sửa trực tiếp
                                  </button>
                                )}
                              </div>
                              {(role === 'teacher' || role === 'admin') && (
                                <div className="col-span-12 flex flex-col gap-1 text-[10px] text-indigo-750 font-sans font-bold">
                                  <div className="flex items-center gap-1 truncate">
                                    <Lock className="w-3.5 h-3.5 shrink-0" />
                                    <span>Mã phòng:</span>
                                    <span className="font-mono bg-indigo-50 px-1 border border-indigo-100 rounded text-[11px] truncate">
                                      {ex.accessCode || 'Công khai'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-750">
                                    <span className="text-gray-400">Link thi:</span>
                                    <span className="font-mono bg-blue-50 px-1 border border-blue-100 rounded text-[10.5px] truncate max-w-[150px]">
                                      {window.location.origin}{window.location.pathname}?takeExamId={ex.id}
                                    </span>
                                    <button 
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyAccess(ex); }}
                                      className="ml-1 text-blue-600 hover:text-blue-800 underline font-black cursor-pointer whitespace-nowrap"
                                    >
                                      Sao chép
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons list */}
                        <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-1 w-full pt-1 overflow-x-auto scrollbar-none">
                            {/* Left: Take Exam button */}
                            <button
                              type="button"
                              onClick={() => handlePrepareTakeExam(ex)}
                              className="px-3 py-1.5 bg-[#2454a6] hover:bg-blue-700 text-white font-extrabold rounded-xl text-[10.5px] flex items-center gap-1 cursor-pointer transition shadow-2xs hover:scale-102 active:scale-98 shrink-0 border-0"
                            >
                              ⚡ Vào Thi Ngay
                            </button>

                            {/* Right: Teacher Actions */}
                            <div className="flex items-center gap-1 shrink-0">

                              
                              {(role === 'teacher' || role === 'admin') && (
                                <>
                                  {role === 'admin' && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDetailedEditingExam(JSON.parse(JSON.stringify(ex))); playTing(); }}
                                      className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 border border-amber-200 rounded-lg text-[10.5px] font-black cursor-pointer transition flex items-center gap-1 shrink-0"
                                      title="Biên soạn chi tiết đề & câu hỏi"
                                    >
                                      ⚙️ Sửa Đề
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveReportExam(ex); playTing(); }}
                                    className={`px-2 py-1.5 rounded-lg border text-[10.5px] font-black transition cursor-pointer flex items-center gap-1 shrink-0 ${
                                      activeReportExam?.id === ex.id 
                                        ? 'bg-purple-100 text-purple-750 border-purple-300 font-bold' 
                                        : 'bg-slate-100 hover:bg-purple-50 text-purple-600 hover:text-purple-700 border-slate-200'
                                    }`}
                                    title="Xem thống kê điểm học sinh"
                                  >
                                    <BarChart className="w-3.5 h-3.5" />
                                    <span>Báo cáo</span>
                                    {ex.submissions?.length > 0 && (
                                      <span className="text-[9.5px] bg-purple-250 text-purple-800 px-1 rounded-full">{ex.submissions.length}</span>
                                    )}
                                  </button>
                                  
                                  {role === 'admin' && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteExam(ex.id); }}
                                      className="p-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition cursor-pointer"
                                      title="Xóa phòng thi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* 4. TEACHER REPORT DASHBOARD (CỬA SỔ NỔI CHIẾM 80% MÀN HÌNH) */}
      {activeReportExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-5xl md:w-[80vw] bg-white rounded-[32px] border-2 border-purple-200 shadow-2xl p-6 md:p-8 space-y-6 text-left animate-scale-up max-h-[90vh] overflow-y-auto flex flex-col scrollbar-thin">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-purple-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <BarChart className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">📊 Báo cáo kết quả: {activeReportExam.testName}</h3>
                  <p className="text-xs text-slate-400 font-bold">Môn học: {activeReportExam.subject} | Khối: {activeReportExam.grade} | SGK: {activeReportExam.curriculumBook}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveReportExam(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition border border-slate-300 flex items-center gap-1 cursor-pointer active:scale-95"
              >
                ✕ Đóng báo cáo
              </button>
            </div>

            {/* Aggregated Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Tổng lượt nộp bài</div>
                <div className="text-2xl font-black text-purple-900 mt-1">{activeReportExam.submissions?.length || 0} Học sinh</div>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Điểm số trung bình</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {activeReportExam.submissions?.length > 0 
                    ? (activeReportExam.submissions.reduce((sum: number, s: any) => sum + (Number(s.score) || 0), 0) / activeReportExam.submissions.length).toFixed(1)
                    : "0.0"
                  } / 10đ
                </div>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Trạng thái Ngăn 2 (Thực hành)</div>
                <div className="text-sm font-black text-indigo-700 mt-2">
                  {activeReportExam.isPracticalEnabled === true ? "🟢 ĐANG BẬT" : "🔴 ĐÃ TẮT"}
                </div>
              </div>
            </div>

            {/* Link thi tự do không tài khoản */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-slate-700 text-xs font-bold leading-relaxed">
              <div className="min-w-0 flex-1 space-y-0.5 text-left font-sans">
                <div className="text-[9.5px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                  <span>🔗</span> Link thi tự do không tài khoản:
                </div>
                <div className="font-mono text-[10.5px] text-indigo-950 bg-white border border-amber-200/60 px-2.5 py-1.5 rounded truncate font-bold select-all">
                  {`${window.location.origin}${window.location.pathname}?takeExamId=${activeReportExam.id}`}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0 items-center justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?takeExamId=${activeReportExam.id}`);
                    triggerToast("📋 Đã sao chép link tự do!");
                    playTing();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl font-black text-[10.5px] transition cursor-pointer"
                >
                  Sao chép
                </button>
                <a
                  href={`${window.location.origin}${window.location.pathname}?takeExamId=${activeReportExam.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white px-3.5 py-2 rounded-xl font-black text-[10.5px] shadow-3xs transition cursor-pointer no-underline text-center"
                >
                  🚀 Truy cập
                </a>
              </div>
            </div>

            {/* Filters and Actions ribbon container */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">Lọc kết quả theo Lớp:</span>
                  <select
                    value={selectedReportClass || 'all'}
                    onChange={(e) => {
                      setSelectedReportClass(e.target.value);
                      playTing();
                    }}
                    className="p-2 w-48 text-xs font-black border border-purple-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="all">Tất cả các lớp</option>
                    {Array.from(new Set((activeReportExam.submissions || []).map((s: any) => s.studentClass))).sort().map((cls: any) => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TWO MASSIVE EXPORT BUTTONS SITTING SIDE BY SIDE */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => handleExportScoresToExcel(activeReportExam)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition border-b-4 border-emerald-800 flex items-center gap-2 active:scale-95"
                  title="Xuất bảng điểm ra file Excel chuyên nghiệp (.xlsx)"
                >
                  🟢 Xuất Điểm (.xlsx)
                </button>
                
                {activeReportExam.submissions?.length > 0 && (
                  <button
                    onClick={() => handleExportClassSubmissionsWordZip(selectedReportClass)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer transition border-b-4 border-blue-800 flex items-center gap-2 active:scale-95"
                    title="Tải File Word cả lớp thành file ZIP chứa các tệp Word"
                  >
                    📦 Tải Word ZIP Lớp
                  </button>
                )}

                {activeReportExam.submissions?.length > 0 && (
                  <button
                    onClick={() => handleExportClassSubmissionsPdfZip(selectedReportClass)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer transition border-b-4 border-rose-800 flex items-center gap-2 active:scale-95"
                    title="Tải File PDF cả lớp thành file ZIP chứa các tệp PDF"
                  >
                    📕 Tải PDF ZIP Lớp
                  </button>
                )}

                {deletedSubmissionsBackup[activeReportExam.id] && deletedSubmissionsBackup[activeReportExam.id].length > 0 && (
                  <button
                    onClick={() => handleUndoClearSubmissions(activeReportExam.id)}
                    className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-black rounded-xl transition cursor-pointer border border-amber-300 flex items-center gap-1.5 active:scale-95 shadow-3xs"
                    title="Hoàn tác khôi phục lại các bài nộp đã xóa"
                  >
                    ↩️ Hoàn tác
                  </button>
                )}

                {activeReportExam.submissions?.length > 0 && (
                  <button
                    onClick={() => handleClearSubmissions(activeReportExam.id)}
                    className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl transition cursor-pointer border border-rose-200 active:scale-95 flex items-center gap-1.5"
                    title="Xóa tất cả lượt nộp của đề thi"
                  >
                    🧹 Xóa tất cả lượt nộp
                  </button>
                )}
              </div>
            </div>

            {/* BẢNG ĐIỂM CHI TIẾT DANH SÁCH HỌC SINH */}
            <div className="flex-1 space-y-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                📋 Bảng điểm thi của học sinh
              </h4>
              
              <div className="space-y-3">
                {(() => {
                  const filteredSubmissions = selectedReportClass === 'all' 
                    ? (activeReportExam.submissions || []) 
                    : (activeReportExam.submissions || []).filter((s: any) => s.studentClass === selectedReportClass);

                  if (filteredSubmissions.length === 0) {
                    return (
                      <div className="py-12 text-center text-xs text-gray-400 italic bg-slate-50 rounded-2xl border border-dashed">
                        Chưa có học sinh nào nộp bài ở bộ lọc này.
                      </div>
                    );
                  }

                  return filteredSubmissions.map((sub: any, sIdx: number) => {
                    const studentUniqueId = sub.id;
                    return (
                      <div 
                        key={studentUniqueId}
                        className="bg-white border border-slate-200 rounded-[22px] overflow-hidden shadow-2xs hover:border-purple-300 transition-all flex flex-col"
                      >
                        {/* Student summary row */}
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-[11px]">
                                {sub.studentStt || String(sIdx + 1).padStart(2, '0')}
                              </span>
                              <span className="font-extrabold text-[#0f172a] text-sm hover:underline cursor-pointer">
                                {sub.studentName}
                              </span>
                              <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded-full text-purple-800 font-bold border border-purple-200">
                                Lớp {sub.studentClass}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-bold">
                              Nộp bài lúc: {sub.completedAt}
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <button
                              onClick={() => {
                                handleExportResultWord(
                                  sub.answers,
                                  sub.score,
                                  sub.studentName,
                                  sub.studentClass,
                                  activeReportExam,
                                  sub.studentStt
                                );
                                playTing();
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 px-3 py-1.5 border border-indigo-200 rounded-xl text-xs cursor-pointer font-black transition flex items-center gap-1.5"
                              title="Tải File Word kết quả học sinh"
                            >
                              📝 Tải Word
                            </button>

                            <button
                              onClick={() => {
                                handleExportResultPdf(
                                  sub.answers,
                                  sub.score,
                                  sub.studentName,
                                  sub.studentClass,
                                  activeReportExam,
                                  sub.studentStt
                                );
                                playTing();
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 border border-rose-200 rounded-xl text-xs cursor-pointer font-black transition flex items-center gap-1.5"
                              title="Tải File PDF kết quả học sinh"
                            >
                              📕 Tải PDF
                            </button>

                            <div className="bg-white border rounded-xl py-1 px-3 flex items-center gap-2 self-stretch">
                              <span className="text-[10px] text-slate-400 uppercase font-black shrink-0">Lượt Gốc:</span>
                              <strong className="text-xs text-indigo-800 font-mono">{sub.theoryScore !== undefined ? sub.theoryScore : sub.score}đ</strong>
                              {activeReportExam.isPracticalEnabled === true && (
                                <>
                                  <span className="text-[10px] text-slate-400 uppercase font-black shrink-0 border-l pl-2">Thực hành:</span>
                                  <strong className="text-xs text-emerald-600 font-mono">
                                    {((sub.answers?.p1_score || 0) + (sub.answers?.p2_score || 0) + (sub.answers?.p3_score || 0) + (sub.answers?.p4_score || 0) + (sub.answers?.p5_score || 0)).toFixed(2)}đ
                                  </strong>
                                </>
                              )}
                              <span className="text-[10px] text-slate-400 uppercase font-black shrink-0 border-l pl-2">Tổng:</span>
                              <strong className="text-sm font-serif text-rose-600 font-black">{sub.score} <span className="text-[9.5px] font-bold text-slate-400 font-sans">/ 10đ</span></strong>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Graded segment for practical task (Ngăn 2) */}
                        {activeReportExam.isPracticalEnabled === true && (
                          <div className="border-t border-slate-200 p-4 bg-indigo-50/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10.5px] font-black uppercase text-indigo-950 flex items-center gap-1">
                                <span>🛠️</span> CHẤM ĐIỂM NGĂN 2 (THỰC HÀNH CỦA EM):
                              </span>
                              <div className="text-[11px] font-bold text-slate-500">
                                {sub.answers?.practical_link ? (
                                  <span className="text-[#2563eb] break-all border border-[#bfdbfe] bg-[#eff6ff] px-2 py-0.5 rounded-lg mr-2">
                                    🔗 Link: <a href={sub.answers.practical_link} target="_blank" rel="noreferrer" className="underline">{sub.answers.practical_link}</a>
                                  </span>
                                ) : <span className="text-amber-500 mr-2">Không nộp Link</span>}
                                {sub.answers?.practical_image ? (
                                  <span className="text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-lg cursor-pointer" onClick={() => window.open(sub.answers.practical_image, '_blank')}>
                                    🖼️ Có hình ảnh (Nhấp để phóng to)
                                  </span>
                                ) : <span className="text-amber-500">Không nộp Ảnh</span>}
                              </div>
                            </div>

                            {/* Practical score inputs form */}
                            <div className="grid grid-cols-5 gap-2 pb-2">
                              {[1, 2, 3, 4, 5].map((num) => {
                                const defaultPracticalTaskText = activeReportExam.practical?.[num - 1]?.questionText || `Câu ${num}...`;
                                const maxTaskPts = activeReportExam.practical?.[num - 1]?.points !== undefined ? Number(activeReportExam.practical[num - 1].points) : 2.0;
                                return (
                                  <div key={num} className="bg-white border rounded-xl p-2.5 shadow-2xs space-y-1 text-center">
                                    <div className="text-[10px] font-black text-indigo-900 uppercase">Câu {num} (Tối đa {maxTaskPts}đ)</div>
                                    <div className="text-[8.5px] text-slate-400 font-serif leading-tight line-clamp-2 h-6" title={defaultPracticalTaskText}>
                                      {defaultPracticalTaskText}
                                    </div>
                                    <input 
                                      type="number"
                                      step="0.25"
                                      min="0"
                                      max={maxTaskPts}
                                      value={sub.answers?.[`p${num}_score`] !== undefined ? sub.answers[`p${num}_score`] : 0}
                                      onChange={(e) => {
                                        const value = Math.min(maxTaskPts, Math.max(0, Number(Number(e.target.value).toFixed(2))));
                                        // Update memory client object so they see live changes before clicking save!
                                        const targetSubIndex = activeReportExam.submissions.findIndex((item: any) => item.id === sub.id);
                                        if (targetSubIndex !== -1) {
                                          const copySubsubmissions = [...activeReportExam.submissions];
                                          const copySub = { ...copySubsubmissions[targetSubIndex] };
                                          copySub.answers = {
                                            ...copySub.answers,
                                            [`p${num}_score`]: value
                                          };
                                          // Recalculate total score
                                          const termSc = copySub.theoryScore !== undefined ? copySub.theoryScore : copySub.score;
                                          const p1 = copySub.answers?.p1_score !== undefined ? Number(copySub.answers.p1_score) : 0;
                                          const p2 = copySub.answers?.p2_score !== undefined ? Number(copySub.answers.p2_score) : 0;
                                          const p3 = copySub.answers?.p3_score !== undefined ? Number(copySub.answers.p3_score) : 0;
                                          const p4 = copySub.answers?.p4_score !== undefined ? Number(copySub.answers.p4_score) : 0;
                                          const p5 = copySub.answers?.p5_score !== undefined ? Number(copySub.answers.p5_score) : 0;
                                          copySub.score = Number((termSc + p1 + p2 + p3 + p4 + p5).toFixed(2));
                                          copySubsubmissions[targetSubIndex] = copySub;
                                          setActiveReportExam({
                                            ...activeReportExam,
                                            submissions: copySubsubmissions
                                          });
                                        }
                                      }}
                                      className="w-full text-center text-xs font-bold p-1 bg-slate-50 border rounded-lg"
                                      placeholder="Điểm"
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            {/* Save modifications */}
                            <div className="text-right">
                              <button
                                onClick={() => {
                                  // Persist updated scores into localStorage
                                  try {
                                    const examDatabase = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
                                    const updatedDatabase = examDatabase.map((ex: any) => {
                                      if (ex.id === activeReportExam.id) {
                                        return {
                                          ...ex,
                                          submissions: activeReportExam.submissions
                                        };
                                      }
                                      return ex;
                                    });
                                    localStorage.setItem('lms_custom_exams', JSON.stringify(updatedDatabase));
                                    setExams(updatedDatabase);
                                    triggerToast(`✓ Đã lưu chấm điểm thực hành cho học sinh ${sub.studentName}!`);
                                    playKeng();
                                  } catch (err: any) {
                                    triggerToast(`❌ Lỗi lưu điểm: ${err.message}`);
                                  }
                                }}
                                className="px-3.5 py-1 bg-[#2454a6] hover:bg-blue-700 text-white rounded-lg text-[10.5px] font-black cursor-pointer transition shadow-2xs active:scale-95"
                              >
                                💾 Lưu Điểm Chấm
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. DETAILED EXAM CONFIGURATION & GRANULAR QUESTION EDITOR MODAL */}
      {detailedEditingExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-5xl md:w-[80vw] bg-white rounded-[32px] border-2 border-amber-200 shadow-2xl p-6 md:p-8 space-y-6 text-left animate-scale-up max-h-[90vh] overflow-y-auto flex flex-col scrollbar-thin">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-amber-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <span>⚙️</span>
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">⚙️ Hiệu chỉnh chi tiết đề &amp; câu hỏi</h3>
                  <p className="text-xs text-slate-400 font-bold">Thầy Cô đang hiệu chỉnh phòng thi: {detailedEditingExam.testName}</p>
                </div>
              </div>
              <button 
                onClick={() => setDetailedEditingExam(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition border border-slate-300 flex items-center gap-1 cursor-pointer active:scale-95"
              >
                ✕ Hủy bỏ
              </button>
            </div>

            {/* Split layout inside editorial panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 pr-1">
              {/* Left Column (8 cols): Question compartmental editors (Ngăn 1 & Ngăn 2) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* COMPARTMENT 1: NGĂN 1 - CẤU HÌNH CÂU HỎI TRẮC NGHIỆM */}
                <div className="bg-slate-50/50 p-5 border border-slate-200 rounded-[28px] space-y-5">
                  <div className="border-b border-slate-250 pb-2.5">
                    <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-blue-200 font-sans font-bold">
                      Ngăn 1: Trắc nghiệm khách quan
                    </span>
                    <h4 className="text-md font-black text-slate-800 mt-1 uppercase">📝 Biên soạn nội dung &amp; Điểm số chi tiết</h4>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {(detailedEditingExam.questions || []).map((q: any, qIdx: number) => {
                      return (
                        <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-3xs relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = (detailedEditingExam.questions || []).filter((item: any) => item.id !== q.id);
                              setDetailedEditingExam({ ...detailedEditingExam, questions: updatedQuestions });
                              triggerToast("✓ Đã xóa câu hỏi khỏi bộ đề!");
                              playTing();
                            }}
                            className="absolute top-2 right-2 text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Index & Type */}
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-slate-100 border text-[10.5px] font-black flex items-center justify-center">
                              {qIdx + 1}
                            </span>
                            <span className="text-[10px] uppercase font-black text-slate-400">
                              Loại: {q.type === 'multiple_choice' ? 'Trắc nghiệm 4 đáp án' : q.type === 'true_false' ? 'Đúng / Sai' : q.type === 'matching' ? 'Nối cột' : q.type === 'gap_fill' ? 'Điền khuyết' : 'Câu hỏi khác'}
                            </span>
                          </div>

                          {/* Question text */}
                          <div className="space-y-1 text-xs font-bold text-slate-700">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Nội dung câu hỏi:</label>
                            <textarea
                              rows={2}
                              value={q.questionText || ''}
                              onChange={(e) => {
                                const copyQ = [...detailedEditingExam.questions];
                                copyQ[qIdx].questionText = e.target.value;
                                setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                              }}
                              className="w-full text-xs font-semibold p-2 bg-slate-50 border rounded-xl"
                            />
                          </div>

                          {/* Case 1: multiple_choice option values */}
                          {q.type === 'multiple_choice' && (
                            <div className="space-y-2 text-xs font-bold">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Các lựa chọn phương án:</span>
                              <div className="grid grid-cols-2 gap-2">
                                {(q.options || ['','','','']).map((opt: string, oIdx: number) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  return (
                                    <div key={letter} className="flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded-md bg-indigo-50 border text-[10px] font-extrabold flex items-center justify-center shrink-0">{letter}</span>
                                      <input
                                        type="text"
                                        value={opt || ''}
                                        onChange={(e) => {
                                          const copyQ = [...detailedEditingExam.questions];
                                          const copyOptions = [...(copyQ[qIdx].options || ['', '', '', ''])];
                                          copyOptions[oIdx] = e.target.value;
                                          copyQ[qIdx].options = copyOptions;
                                          setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                        }}
                                        className="flex-1 p-1.5 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-800"
                                        placeholder={`Lựa chọn ${letter}`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-xl mt-1 text-xs">
                                <div className="flex items-center gap-1">
                                  <span>Đáp án đúng:</span>
                                  <select
                                    value={q.correctAnswer || 'A'}
                                    onChange={(e) => {
                                      const copyQ = [...detailedEditingExam.questions];
                                      copyQ[qIdx].correctAnswer = e.target.value;
                                      setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                    }}
                                    className="p-1 border rounded bg-white text-xs font-bold w-16"
                                  >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>Điểm:</span>
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    value={q.points !== undefined ? q.points : 0.25}
                                    onChange={(e) => {
                                      const copyQ = [...detailedEditingExam.questions];
                                      copyQ[qIdx].points = Number(e.target.value);
                                      setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                    }}
                                    className="p-1 border rounded bg-white text-xs font-extrabold w-16 text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Case 2: true_false lists with individual points & statement deletions! */}
                          {q.type === 'true_false' && (
                            <div className="space-y-2 text-xs font-bold bg-purple-50/30 p-3 rounded-xl border border-purple-100">
                              <span className="text-[10px] text-purple-900 uppercase tracking-widest block font-black">Các phát biểu Đúng / Sai (&amp; Điểm số từng ý):</span>
                              
                              <div className="space-y-2">
                                {(q.statements || []).map((st: any, sIdx: number) => {
                                  return (
                                    <div key={st.label || sIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                                      <span className="w-5 h-5 rounded-md bg-purple-100 border text-[10.5px] font-black flex items-center justify-center shrink-0 uppercase">{st.label}</span>
                                      
                                      <input
                                        type="text"
                                        value={st.text || ''}
                                        onChange={(e) => {
                                          const copyQ = [...detailedEditingExam.questions];
                                          const copySts = [...(copyQ[qIdx].statements || [])];
                                          copySts[sIdx].text = e.target.value;
                                          copyQ[qIdx].statements = copySts;
                                          setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                        }}
                                        className="flex-1 p-1 bg-slate-50 border rounded text-xs min-w-0 font-semibold text-slate-800"
                                        placeholder="Nội dung phát biểu..."
                                      />

                                      <div className="flex items-center gap-1 shrink-0">
                                        <select
                                          value={st.answer || 'Đúng'}
                                          onChange={(e) => {
                                            const copyQ = [...detailedEditingExam.questions];
                                            const copySts = [...(copyQ[qIdx].statements || [])];
                                            copySts[sIdx].answer = e.target.value;
                                            
                                            // Recalculate global q.correctAnswer
                                            copyQ[qIdx].correctAnswer = copySts.map((stmt: any) => `${stmt.label.trim().toUpperCase()}-${stmt.answer || 'Đúng'}`).join(', ');
                                            setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                          }}
                                          className="p-1 border rounded bg-slate-50 text-xs text-indigo-750 font-bold"
                                        >
                                          <option value="Đúng">Đúng</option>
                                          <option value="Sai">Sai</option>
                                        </select>

                                        <input
                                          type="number"
                                          step="0.25"
                                          min="0"
                                          placeholder="Điểm"
                                          title="Điểm số ý này"
                                          value={st.points !== undefined ? st.points : 0.25}
                                          onChange={(e) => {
                                            const copyQ = [...detailedEditingExam.questions];
                                            const copySts = [...(copyQ[qIdx].statements || [])];
                                            copySts[sIdx].points = Number(e.target.value);
                                            
                                            // Sum them and set q.points
                                            copyQ[qIdx].points = copySts.reduce((sum, item) => sum + (item.points !== undefined ? Number(item.points) : 0.25), 0);
                                            setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                          }}
                                          className="p-1 text-center border rounded bg-white text-xs text-rose-600 font-extrabold w-12"
                                        />

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const copyQ = [...detailedEditingExam.questions];
                                            const copySts = (copyQ[qIdx].statements || []).filter((_: any, idx: number) => idx !== sIdx);
                                            // Re-label leftover statements
                                            copySts.forEach((stmt: any, newIdx: number) => {
                                              stmt.label = String.fromCharCode(65 + newIdx); // A, B, C, D
                                            });
                                            copyQ[qIdx].statements = copySts;
                                            
                                            // Recalculate global q.correctAnswer & points sum
                                            copyQ[qIdx].correctAnswer = copySts.map((stmt: any) => `${stmt.label.trim().toUpperCase()}-${stmt.answer || 'Đúng'}`).join(', ');
                                            copyQ[qIdx].points = copySts.reduce((sum, item) => sum + (item.points !== undefined ? Number(item.points) : 0.25), 0);
                                            setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                            triggerToast("✓ Đã xóa bớt câu phát biểu!");
                                          }}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0 cursor-pointer"
                                          title="Xóa bớt phát biểu"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="pt-1.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copyQ = [...detailedEditingExam.questions];
                                    const copySts = [...(copyQ[qIdx].statements || [])];
                                    const nextLabel = String.fromCharCode(65 + copySts.length);
                                    copySts.push({
                                      label: nextLabel,
                                      text: "Phát biểu mới...",
                                      answer: "Đúng",
                                      points: 0.25
                                    });
                                    copyQ[qIdx].statements = copySts;
                                    copyQ[qIdx].correctAnswer = copySts.map((stmt: any) => `${stmt.label.trim().toUpperCase()}-${stmt.answer || 'Đúng'}`).join(', ');
                                    copyQ[qIdx].points = copySts.reduce((sum, item) => sum + (item.points !== undefined ? Number(item.points) : 0.25), 0);
                                    setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                    triggerToast("✓ Đã thêm một phát biểu mới!");
                                  }}
                                  className="px-2 py-1 bg-purple-600 hover:bg-purple-705 text-white rounded text-[10px] font-black cursor-pointer transition uppercase"
                                >
                                  ➕ Thêm phát biểu (ý) mới
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Case 3: matching lists with individual points & row deletions! */}
                          {q.type === 'matching' && (
                            <div className="space-y-2 text-xs font-bold bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                              <span className="text-[10px] text-amber-900 uppercase tracking-widest block font-black">Các cặp ghép cột trái/phải (&amp; Điểm số từng ý):</span>
                              
                              <div className="space-y-2">
                                {(q.matchingPairs || []).map((pair: any, pIdx: number) => {
                                  return (
                                    <div key={pair.id || pIdx} className="flex flex-col sm:flex-row items-center gap-1.5 p-2 bg-white rounded-lg border border-slate-100">
                                      <input
                                        type="text"
                                        value={pair.left || ''}
                                        onChange={(e) => {
                                          const copyQ = [...detailedEditingExam.questions];
                                          const copyPairs = [...(copyQ[qIdx].matchingPairs || [])];
                                          copyPairs[pIdx].left = e.target.value;
                                          copyQ[qIdx].matchingPairs = copyPairs;
                                          setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                        }}
                                        className="w-1/3 p-1 bg-slate-50 border rounded text-[11px] font-semibold text-slate-800"
                                        placeholder="Cột bên trái..."
                                      />
                                      
                                      <span className="text-slate-400">↔</span>

                                      <input
                                        type="text"
                                        value={pair.right || ''}
                                        onChange={(e) => {
                                          const copyQ = [...detailedEditingExam.questions];
                                          const copyPairs = [...(copyQ[qIdx].matchingPairs || [])];
                                          copyPairs[pIdx].right = e.target.value;
                                          copyQ[qIdx].matchingPairs = copyPairs;
                                          setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                        }}
                                        className="flex-1 p-1 bg-slate-50 border rounded text-[11px] min-w-0 font-semibold text-slate-800"
                                        placeholder="Cột bên phải tương ứng..."
                                      />

                                      <div className="flex items-center gap-1 shrink-0">
                                        <input
                                          type="number"
                                          step="0.25"
                                          min="0"
                                          placeholder="Điểm"
                                          title="Điểm số cặp khớp này"
                                          value={pair.points !== undefined ? pair.points : 0.5}
                                          onChange={(e) => {
                                            const copyQ = [...detailedEditingExam.questions];
                                            const copyPairs = [...(copyQ[qIdx].matchingPairs || [])];
                                            copyPairs[pIdx].points = Number(e.target.value);
                                            
                                            // Recalculated sum
                                            copyQ[qIdx].points = copyPairs.reduce((sum, item) => sum + (item.points !== undefined ? Number(item.points) : 0.5), 0);
                                            setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                          }}
                                          className="p-1 text-center border rounded bg-white text-xs text-rose-600 font-extrabold w-12"
                                        />

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const copyQ = [...detailedEditingExam.questions];
                                            const copyPairs = (copyQ[qIdx].matchingPairs || []).filter((_: any, idx: number) => idx !== pIdx);
                                            // Re-id remaining couples
                                            copyPairs.forEach((item: any, newIdx: number) => {
                                              item.id = String(newIdx + 1);
                                              item.id_match = String.fromCharCode(97 + newIdx); // a, b, c, d
                                            });
                                            copyQ[qIdx].matchingPairs = copyPairs;
                                            
                                            // Recalculate global points sum & correctAnswer
                                            copyQ[qIdx].correctAnswer = copyPairs.map((item: any) => `${item.id}-${item.id_match}`).join(', ');
                                            copyQ[qIdx].points = copyPairs.reduce((sum, item) => sum + (item.points !== undefined ? Number(item.points) : 0.5), 0);
                                            setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                            triggerToast("✓ Đã xóa cặp ghép vế nối.");
                                          }}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0 cursor-pointer"
                                          title="Xóa cặp này"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="pt-1.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copyQ = [...detailedEditingExam.questions];
                                    const copyPairs = [...(copyQ[qIdx].matchingPairs || [])];
                                    const nextNum = copyPairs.length + 1;
                                    const nextChar = String.fromCharCode(97 + copyPairs.length); // a, b, c, d
                                    copyPairs.push({
                                      id: String(nextNum),
                                      left: `Vế bên trái ${nextNum}`,
                                      id_match: nextChar,
                                      right: `Vế bên phải ${nextChar}`,
                                      points: 0.5
                                    });
                                    copyQ[qIdx].matchingPairs = copyPairs;
                                    copyQ[qIdx].correctAnswer = copyPairs.map((item: any) => `${item.id}-${item.id_match}`).join(', ');
                                    copyQ[qIdx].points = copyPairs.reduce((sum, item) => sum + (item.points !== undefined ? Number(item.points) : 0.5), 0);
                                    setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                    triggerToast("✓ Đã thêm một cặp ghép cột!");
                                  }}
                                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-black cursor-pointer transition uppercase"
                                >
                                  ➕ Thêm cặp ghép mới
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Case 4: Gap Fill */}
                          {q.type === 'gap_fill' && (
                            <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-xl text-xs">
                              <div className="flex-1">
                                <span className="text-[9.5px] uppercase text-slate-400">Đáp án chuẩn điền chỗ trống:</span>
                                <input
                                  type="text"
                                  value={q.correctAnswer || ''}
                                  onChange={(e) => {
                                    const copyQ = [...detailedEditingExam.questions];
                                    copyQ[qIdx].correctAnswer = e.target.value;
                                    setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                  }}
                                  className="w-full p-1 border rounded bg-white mt-1 font-bold"
                                />
                              </div>
                              <div className="shrink-0">
                                <span className="text-[9.5px] uppercase text-slate-400 block">Số điểm:</span>
                                <input
                                  type="number"
                                  step="0.25"
                                  min="0"
                                  value={q.points !== undefined ? q.points : 1.0}
                                  onChange={(e) => {
                                    const copyQ = [...detailedEditingExam.questions];
                                    copyQ[qIdx].points = Number(e.target.value);
                                    setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                                  }}
                                  className="p-1 border rounded bg-white mt-1 w-16 text-center font-bold"
                                />
                              </div>
                            </div>
                          )}

                          {/* Answer guide edit */}
                          <div className="space-y-1 text-xs">
                            <span className="text-[9.5px] text-slate-400 uppercase">Lý giải / Hướng dẫn đáp án:</span>
                            <input
                              type="text"
                              value={q.answerGuide || ''}
                              onChange={(e) => {
                                const copyQ = [...detailedEditingExam.questions];
                                copyQ[qIdx].answerGuide = e.target.value;
                                setDetailedEditingExam({ ...detailedEditingExam, questions: copyQ });
                              }}
                              className="w-full text-xs p-1.5 bg-slate-50 border rounded-lg"
                              placeholder="Nhập lý giải cho học sinh xem sau khi hoàn thành..."
                            />
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COMPARTMENT 2: NGĂN 2 - THỰC HÀNH TỰ LUYỆN (EDIT & IMAGE CONFIGURATION) */}
                {detailedEditingExam.isPracticalEnabled === true && (
                  <div className="bg-slate-50/50 p-5 border border-slate-200 rounded-[28px] space-y-5">
                    <div className="border-b border-slate-250 pb-2.5">
                      <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-amber-200 font-sans font-bold">
                        Ngăn 2: Thực hành tự luyện máy tính
                      </span>
                      <h4 className="text-md font-black text-slate-800 mt-1 uppercase">🛠️ Minh họa hình ảnh &amp; 5 câu thực hành</h4>
                    </div>

                    {/* TWO OPTION METHOD FOR UPLOADING ILLUSTRATION IMAGE OR EMBEDDING LINK */}
                    <div className="bg-white p-4 border border-slate-200 rounded-2xl space-y-4">
                      <div>
                        <h5 className="text-xs font-black text-[#1e3a8a] uppercase">🖼️ Khung hình ảnh để minh họa bài thực hành (Phần 2)</h5>
                        <p className="text-[10px] text-slate-400 font-medium font-bold">Hình ảnh này sẽ hiện trên đầu các câu hỏi ở Ngăn 2 để định hướng minh họa cho học sinh làm theo.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Phương án 1: Nhúng link */}
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                          <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Phương án 1: Nhúng liên kết ảnh (.png, .jpeg, .bmp)</span>
                          <input
                            type="text"
                            value={detailedEditingExam.practicalIllustrationImage || ''}
                            onChange={(e) => setDetailedEditingExam({ ...detailedEditingExam, practicalIllustrationImage: e.target.value })}
                            placeholder="Dán liên kết ảnh trực tiếp vào đây..."
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>

                        {/* Phương án 2: Tải tệp trực tiếp */}
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                          <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Phương án 2: Tải ảnh từ máy tính</span>
                          <input
                            type="file"
                            accept=".png,.jpeg,.jpg,.bmp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
                                if (!allowedTypes.includes(file.type)) {
                                  triggerToast("❌ Sai định dạng ảnh! Vui lòng chọn .png, .jpeg hoặc .bmp!");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setDetailedEditingExam({ ...detailedEditingExam, practicalIllustrationImage: reader.result as string });
                                  triggerToast("✓ Đã tải ảnh minh họa lên hoàn thành!");
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      {/* Image Preview */}
                      {detailedEditingExam.practicalIllustrationImage && (
                        <div className="p-2 border rounded-xl bg-slate-50 flex flex-col justify-center items-center h-48 relative overflow-hidden group">
                          <img
                            src={detailedEditingExam.practicalIllustrationImage}
                            alt="Minh họa bài làm"
                            className="max-h-full max-w-full object-contain rounded"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setDetailedEditingExam({ ...detailedEditingExam, practicalIllustrationImage: '' })}
                            className="absolute top-2 right-2 bg-rose-600 text-white font-black px-2 py-1 rounded text-[9px] cursor-pointer hover:bg-rose-700"
                          >
                            Xóa ảnh minh họa
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Renamed edited 5 practical tasks block */}
                    <div className="bg-white p-4 border border-slate-200 rounded-2xl space-y-3">
                      <h5 className="text-xs font-black text-slate-800 uppercase">📝 Nội dung 5 Câu hỏi Thực hành (Câu 1 đến Câu 5)</h5>
                      <p className="text-[10px] text-slate-450 italic font-medium">Chỉnh sửa nội dung các câu hỏi thực hành của bài làm ở Ngăn 2:</p>
                      
                      <div className="space-y-3">
                        {(() => {
                          const practicalList = detailedEditingExam.practical || [
                            { id: 'p-1', questionText: 'Nháy đúp chuột khởi động phần mềm soạn thảo MS Word.', imageUrl: '' },
                            { id: 'p-2', questionText: 'Thực hiện gõ từ câu thơ "Em là dũng sĩ tin học lớp 3" đúng chuẩn Telex.', imageUrl: '' },
                            { id: 'p-3', questionText: 'Sử dụng công cụ vẽ Paint vẽ hình tròn.', imageUrl: '' },
                            { id: 'p-4', questionText: 'Tạo thư mục lưu tên em ở ổ đĩa D.', imageUrl: '' },
                            { id: 'p-5', questionText: 'Tắt máy tính đúng quy trình an toàn.', imageUrl: '' }
                          ];

                          return practicalList.map((pt: any, pIdx: number) => {
                            const num = pIdx + 1;
                            return (
                              <div key={pt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1 text-xs">
                                <label className="text-[10.5px] font-black text-indigo-900 uppercase">Câu {num}:</label>
                                <textarea
                                  rows={2}
                                  value={pt.questionText || ''}
                                  onChange={(e) => {
                                    const copyP = [...practicalList];
                                    copyP[pIdx] = { ...copyP[pIdx], questionText: e.target.value };
                                    setDetailedEditingExam({ ...detailedEditingExam, practical: copyP });
                                  }}
                                  className="w-full text-xs font-semibold p-2 bg-white border border-slate-205 rounded-lg focus:outline-none text-slate-800"
                                  placeholder={`Nội dung Câu ${num} thực hành...`}
                                />
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Right Column (4 cols): Main Info settings & toggle buttons */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4 text-xs font-bold text-slate-700">
                  <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Thông tin chung phòng thi</h4>
                  
                  {/* Tên bài thi */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Tên bài kiểm tra:</label>
                    <input
                      type="text"
                      value={detailedEditingExam.testName || ''}
                      onChange={(e) => setDetailedEditingExam({ ...detailedEditingExam, testName: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-350 rounded-lg text-xs font-bold"
                    />
                  </div>

                  {/* Khối lớp */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Khối lớp:</label>
                    <select
                      value={detailedEditingExam.grade || 3}
                      onChange={(e) => setDetailedEditingExam({ ...detailedEditingExam, grade: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-350 rounded-lg text-xs cursor-pointer font-bold"
                    >
                      <option value={3}>Lớp 3</option>
                      <option value={4}>Lớp 4</option>
                      <option value={5}>Lớp 5</option>
                    </select>
                  </div>

                  {/* Sách giáo khoa */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Bộ sách giáo khoa:</label>
                    <input
                      type="text"
                      value={detailedEditingExam.curriculumBook || 'Kết nối tri thức với cuộc sống'}
                      onChange={(e) => setDetailedEditingExam({ ...detailedEditingExam, curriculumBook: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-350 rounded-lg text-xs font-bold"
                    />
                  </div>

                  {/* Môn học */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Môn học:</label>
                    <input
                      type="text"
                      value={detailedEditingExam.subject || 'Tin học'}
                      onChange={(e) => setDetailedEditingExam({ ...detailedEditingExam, subject: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-350 rounded-lg text-xs font-bold"
                    />
                  </div>

                  {/* Mã phòng thi */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Mã bảo mật phòng:</label>
                    <input
                      type="text"
                      value={detailedEditingExam.accessCode || ''}
                      onChange={(e) => setDetailedEditingExam({ ...detailedEditingExam, accessCode: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-350 rounded-lg text-xs font-mono font-bold"
                      placeholder="Trống = Công khai"
                    />
                  </div>

                  {/* Thời gian làm bài */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Thời gian làm bài (Phút):</label>
                    <input
                      type="number"
                      value={detailedEditingExam.timeLimit || 45}
                      onChange={(e) => setDetailedEditingExam({ ...detailedEditingExam, timeLimit: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-350 rounded-lg text-xs font-bold"
                      min={1}
                      max={180}
                    />
                  </div>

                  {/* TOGGLE FOR NGĂN 2 MODE (BẬT/TẮT CHẾ ĐỘ NGÂN 2) */}
                  <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-indigo-950 uppercase">Ngăn 2 (Thực hành)</span>
                      <button
                        type="button"
                        onClick={() => {
                          const stateVal = detailedEditingExam.isPracticalEnabled === true ? false : true;
                          setDetailedEditingExam({ ...detailedEditingExam, isPracticalEnabled: stateVal });
                          triggerToast(stateVal ? "🟢 Đã BẬT tích hợp chế độ thực hành Ngăn 2!" : "🔴 Đã TẮT bớt phần thực hành Ngăn 2!");
                          playTing();
                        }}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg border cursor-pointer transition ${
                          detailedEditingExam.isPracticalEnabled === true
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-slate-200 text-slate-650 border-slate-350'
                        }`}
                      >
                        {detailedEditingExam.isPracticalEnabled === true ? 'Đang Bật 🟢' : 'Đang Tắt 🔴'}
                      </button>
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-bold leading-relaxed">
                      Thiết lập cấu hình cho phép học sinh nộp bài minh chứng thực hành (ảnh, link) và tự luyện trực tiếp đề bài.
                    </p>
                  </div>
                </div>

                {/* Confirm Save Modifications Action Button */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Persist updated structures to localStorage
                      try {
                        const dbExams = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
                        const updated = dbExams.map((ex: any) => {
                          if (ex.id === detailedEditingExam.id) {
                            return {
                              ...detailedEditingExam,
                              practical: detailedEditingExam.practical || [
                                { id: 'p-1', questionText: 'Nháy đúp chuột khởi động phần mềm soạn thảo MS Word.', imageUrl: '' },
                                { id: 'p-2', questionText: 'Thực hiện gõ từ câu thơ "Em là dũng sĩ tin học lớp 3" đúng chuẩn Telex.', imageUrl: '' },
                                { id: 'p-3', questionText: 'Sử dụng công cụ vẽ Paint vẽ hình tròn.', imageUrl: '' },
                                { id: 'p-4', questionText: 'Tạo thư mục lưu tên em ở ổ đĩa D.', imageUrl: '' },
                                { id: 'p-5', questionText: 'Tắt máy tính đúng quy trình an toàn.', imageUrl: '' }
                              ]
                            };
                          }
                          return ex;
                        });
                        localStorage.setItem('lms_custom_exams', JSON.stringify(updated));
                        setExams(updated);
                        setDetailedEditingExam(null);
                        triggerToast("💚 Đã lưu cấu hình phòng thi & đề kiểm tra thành công!");
                        playKeng();
                      } catch (err: any) {
                        triggerToast(`❌ Lỗi lưu đề: ${err.message}`);
                      }
                    }}
                    className="flex-1 py-3 bg-[#2454a6] hover:bg-[#1a3e7c] text-white font-black rounded-2xl cursor-pointer shadow-md text-xs tracking-wider text-center border-b-4 border-blue-900 transition active:scale-95 uppercase"
                  >
                    💾 Lưu cấu hình hoàn thành
                  </button>
                  <button
                    onClick={() => setDetailedEditingExam(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl border cursor-pointer text-xs transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. ACTIVE STUDENT TESTING CONTAINER MODAL */}
      {activeTakeExam && (
        <div className="fixed inset-0 bg-indigo-950/50 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto select-none">
          <div className={`w-full bg-white rounded-[32px] overflow-hidden shadow-2xl animate-scale-up border border-indigo-100 flex flex-col text-left transition-all duration-300 ${
            isExamConfigPhase ? 'max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh]' : 'max-w-6xl max-h-[92vh]'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-6 text-white flex flex-row justify-between items-center gap-6 transition-colors duration-200 ${isReviewMode ? 'bg-emerald-700' : 'bg-[#2454a6]'}`}>
              <div className="min-w-0 flex-1">
                {isReviewMode ? (
                  <span className="bg-yellow-400 text-blue-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-yellow-300 font-sans font-bold whitespace-nowrap">
                    👁️ Chế độ xem chi tiết bài làm
                  </span>
                ) : (
                  <span className="bg-yellow-400 text-blue-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-yellow-300 font-sans font-bold whitespace-nowrap">
                    Nội dung bài thi
                  </span>
                )}
                <h3 className="text-sm sm:text-base md:text-xl font-bold mt-2 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis" title={activeTakeExam.testName}>
                  {activeTakeExam.testName}
                </h3>
                <p className="text-xs text-blue-100 italic opacity-95 whitespace-nowrap overflow-hidden text-ellipsis">
                  Môn học: {activeTakeExam.subject} / Khối: {activeTakeExam.grade} - Sách {activeTakeExam.curriculumBook}
                </p>
              </div>
              <button 
                onClick={() => {
                  setActiveTakeExam(null);
                  setTimerActive(false);
                  setIsReviewMode(false);
                  if (directTakeExamId) {
                    window.location.href = window.location.pathname;
                  }
                }}
                className={`px-3 md:px-4 py-2.5 text-white font-extrabold rounded-xl border flex items-center gap-1.5 cursor-pointer text-xs transition shadow-sm shrink-0 whitespace-nowrap ${isReviewMode ? 'bg-emerald-800 hover:bg-emerald-900 border-emerald-600' : 'bg-rose-600 hover:bg-rose-700 border-rose-500'}`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isReviewMode ? 'THOÁT XEM CHI TIẾT' : 'THOÁT PHÒNG THI'}</span>
              </button>
            </div>

            {/* Config & Verification Phase before launching the exam */}
            {isExamConfigPhase ? (
              <div className="px-6 py-4 md:py-5 space-y-4 max-w-xl mx-auto text-center flex-1 overflow-y-auto">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-indigo-950">Phòng thi trực tuyến</h3>
                  <p className="text-xs text-gray-400 italic">Vui lòng điền đầy đủ thông tin học sinh dưới đây để kích hoạt đề thi:</p>
                  {attemptedStartExam && !studentStt.trim() && (
                    <div className="text-xs text-rose-600 font-extrabold mt-1">
                      ⚠️ Vui lòng nhập số thứ tự
                    </div>
                  )}
                  {attemptedStartExam && !studentName.trim() && (
                    <div className="text-xs text-rose-600 font-extrabold mt-1">
                      ⚠️ Vui lòng nhập Họ tên học sinh
                    </div>
                  )}
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Số thứ tự</label>
                    <input 
                      type="text" 
                      value={studentStt || ''}
                      onChange={(e) => setStudentStt(e.target.value)}
                      placeholder="Nhập số thứ tự trong danh sách của học sinh (Ví dụ: 01, 15...)"
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Họ & Tên Học sinh</label>
                    <input 
                      type="text" 
                      value={studentName || ''}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nhập tên đầy đủ của học sinh..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#2454A6]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Khối lớp</label>
                      <select 
                        value={studentGradeSelect || 'Khối 3'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudentGradeSelect(val);
                          const gradeNum = parseInt(val.match(/\d+/)?.[0] || '3');
                          const availableClasses = adminClassesRegistry[gradeNum] || [];
                          const visibleClasses = availableClasses.filter(cls => !hiddenClasses.includes(`${gradeNum}-${cls}`));
                          const firstClass = visibleClasses[0] || 'A';
                          setStudentClassSelect(firstClass);
                          setStudentClass(`${val} - Lớp ${firstClass}`);
                        }}
                        className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:bg-white focus:border-[#2454A6]"
                      >
                        {gradesList
                          .filter(gNum => !hiddenGrades.includes(Number(gNum)))
                          .sort((a, b) => Number(a) - Number(b))
                          .map(gNum => (
                            <option key={gNum} value={`Khối ${gNum}`}>Khối {gNum}</option>
                          ))
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Lớp học</label>
                      <select 
                        value={studentClassSelect || 'A'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudentClassSelect(val);
                          setStudentClass(`${studentGradeSelect} - Lớp ${val}`);
                        }}
                        className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:bg-white focus:border-[#2454A6]"
                      >
                        {(() => {
                          const gradeNum = parseInt(studentGradeSelect.match(/\d+/)?.[0] || '3');
                          const classes = adminClassesRegistry[gradeNum] || [];
                          const visibleClasses = classes.filter(cls => !hiddenClasses.includes(`${gradeNum}-${cls}`));
                          if (visibleClasses.length === 0) {
                            return <option value="A">Lớp A</option>;
                          }
                          return visibleClasses.map(cls => (
                            <option key={cls} value={cls}>Lớp {cls}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  </div>

                  {activeTakeExam.accessCode && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-rose-700 uppercase tracking-wider">Mã Phòng Thi</label>
                        <span className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1 animate-pulse">
                          <Lock className="w-3 h-3" /> Yêu cầu mã phòng thi
                        </span>
                      </div>
                      <input 
                        type="text" 
                        value={enteredCode || ''}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        placeholder="Mã thi do Giáo viên cung cấp..."
                        className="w-full p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-black text-rose-800 focus:outline-none focus:bg-white focus:border-rose-500 font-mono tracking-widest uppercase"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3 text-xs">
                  <button
                    onClick={() => {
                      setActiveTakeExam(null);
                      if (directTakeExamId) {
                        window.location.href = window.location.pathname;
                      }
                    }}
                    className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleStartExamCountdown}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer transition shadow-sm"
                  >
                    🔓 Vào làm bài thi
                  </button>
                </div>
              </div>
            ) : (
              
              /* TESTING SESSION ACTIVE ENVIRONMENT */
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* Questions content scroll column */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin select-text">
                  
                  {/* PHẦN I: TRẮC NGHIỆM BANNER */}
                  <div className="bg-blue-50 border border-blue-200/80 p-5 rounded-[22px] text-left">
                    <span className="bg-blue-600 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full">
                      Phần I: Trắc nghiệm
                    </span>
                    <h3 className="text-sm font-black text-blue-900 mt-1 uppercase">📝 Các câu hỏi trắc nghiệm</h3>
                  </div>

                  {activeTakeExam.questions?.map((q: any, qIdx: number) => {
                    const isSelected = studentAnswers[q.id] !== undefined;
                    return (
                      <div 
                        key={q.id}
                        id={`question-card-${q.id}`}
                        className={`p-6 rounded-[24px] border transition-all duration-300 relative space-y-4 ${
                          isSelected 
                            ? 'bg-blue-50/30 border-blue-200 shadow-3xs' 
                            : 'bg-white border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
                              <span className="text-blue-700 font-extrabold mr-1">Câu {qIdx + 1} ({q.points !== undefined ? q.points : 0.5} điểm):</span>
                              {q.questionText}
                            </h4>
                            {/* Render image under the question if present */}
                            {q.imageUrl && (
                              <div className="mt-2.5 max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex p-1 justify-center">
                                <img src={q.imageUrl} alt="Ảnh câu hỏi" className="max-h-56 object-contain" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rendering options based on question types */}
                        
                        {/* 1. Multiple Choice options list */}
                        {q.type === 'multiple_choice' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {['A', 'B', 'B', 'C', 'D'].filter((v, i, self) => self.indexOf(v) === i).map((letter) => {
                              const idx = ['A', 'B', 'C', 'D'].indexOf(letter);
                              const optionText = q.options 
                                ? (Array.isArray(q.options) ? q.options[idx] : q.options[letter])
                                : '';
                              if (!optionText) return null;
                              
                              const isCurrentSelect = studentAnswers[q.id] === letter;
                              const isCorrectOption = q.correctAnswer === letter;
                              const optionImage = q.optionImages?.[idx];
                              
                              let btnClass = "bg-slate-50 border-slate-205 text-slate-800 hover:bg-blue-50/50 hover:border-blue-300";
                              let circleClass = "bg-white text-slate-600 border border-slate-200";

                              if (isReviewMode) {
                                if (isCorrectOption) {
                                  btnClass = "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-3xs";
                                  circleClass = "bg-emerald-600 text-white font-mono";
                                } else if (isCurrentSelect) {
                                  btnClass = "bg-rose-50 border-rose-400 text-rose-950 line-through opacity-80 shadow-3xs";
                                  circleClass = "bg-rose-600 text-white font-mono";
                                } else {
                                  btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                                  circleClass = "bg-slate-100 text-slate-400 border border-slate-200";
                                }
                              } else {
                                if (isCurrentSelect) {
                                  btnClass = "bg-blue-600 text-white border-blue-700 shadow-sm";
                                  circleClass = "bg-white/20 text-white";
                                }
                              }

                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, letter)}
                                  disabled={showResultOverlay || isReviewMode}
                                  className={`p-3.5 rounded-xl border text-left text-[14px] font-semibold flex flex-col gap-2 cursor-pointer transition-all ${btnClass}`}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <span className={`w-6 h-6 rounded-lg font-black font-mono text-[11.5px] flex items-center justify-center shrink-0 ${circleClass}`}>
                                      {letter}
                                    </span>
                                    <span className="flex-1 flex justify-between items-center gap-1">
                                      <span>{cleanPrefix(optionText)}</span>
                                      {isReviewMode && isCorrectOption && <span className="text-emerald-605 font-black text-[10px] ml-1 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded select-none">✔️ ĐÚNG</span>}
                                      {isReviewMode && isCurrentSelect && !isCorrectOption && <span className="text-rose-605 font-black text-[10px] ml-1 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded select-none">❌ SAI</span>}
                                    </span>
                                  </div>
                                  {optionImage && (
                                    <div className="w-full mt-1 border border-slate-200 rounded-md overflow-hidden bg-white p-1 flex justify-center">
                                      <img src={optionImage} alt={`Lựa chọn ${letter}`} className="max-h-32 object-contain" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 2. True False list statement toggles */}
                        {q.type === 'true_false' && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs text-[14px] max-w-2xl pt-1">
                            <table className="w-full text-left border-collapse font-sans text-slate-800">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[12px]">
                                  <th className="p-2.5">Phát biểu học liệu</th>
                                  <th className="p-2.5 text-center w-28">Đúng</th>
                                  <th className="p-2.5 text-center w-28">Sai</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(Array.isArray(q.statements) ? q.statements : (q.statements ? Object.values(q.statements) : [])).map((st: any, sidx: number) => {
                                  const letter = st.label || ['A', 'B', 'C', 'D'][sidx];
                                  
                                  const studentTfObj: Record<string, string> = {};
                                  const studentAnsRaw = studentAnswers[q.id] || "";
                                  studentAnsRaw.split(",").forEach(part => {
                                    const [lbl, val] = part.split("-");
                                    if (lbl && val) {
                                      studentTfObj[lbl.trim().toUpperCase()] = val.trim();
                                    }
                                  });

                                  const correctTfObj: Record<string, string> = {};
                                  const correctAnsRaw = q.correctAnswer || "";
                                  correctAnsRaw.split(",").forEach(part => {
                                    const [lbl, val] = part.split("-");
                                    if (lbl && val) {
                                      correctTfObj[lbl.trim().toUpperCase()] = val.trim();
                                    }
                                  });

                                  const chosenVal = studentTfObj[letter.toUpperCase()] || "";
                                  const correctVal = correctTfObj[letter.toUpperCase()] || "";

                                  const setOptionVal = (val: string) => {
                                    studentTfObj[letter.toUpperCase()] = val;
                                    const resultParts = (Array.isArray(q.statements) ? q.statements : Object.values(q.statements || {})).map((st2: any, s2idx: number) => {
                                      const l2 = st2.label || ['A', 'B', 'C', 'D'][s2idx];
                                      const selectedTf = studentTfObj[l2.toUpperCase()];
                                      return selectedTf ? `${l2}-${selectedTf}` : "";
                                    }).filter(Boolean);
                                    
                                    setStudentAnswers(prev => ({
                                      ...prev,
                                      [q.id]: resultParts.join(", ")
                                    }));
                                    playTing();
                                  };

                                  let dungBtnClass = "";
                                  if (isReviewMode) {
                                    if (correctVal === "Đúng") {
                                      dungBtnClass = "bg-emerald-600 text-white shadow-xs pointer-events-none font-bold";
                                    } else if (chosenVal === "Đúng") {
                                      dungBtnClass = "bg-rose-600 text-white shadow-xs line-through opacity-80 pointer-events-none font-bold";
                                    } else {
                                      dungBtnClass = "bg-slate-50 text-slate-350 border border-slate-100 pointer-events-none opacity-40";
                                    }
                                  } else {
                                    dungBtnClass = chosenVal === "Đúng" 
                                      ? "bg-indigo-600 text-white shadow-xs" 
                                      : "bg-slate-100 hover:bg-indigo-50 text-slate-700";
                                  }

                                  let saiBtnClass = "";
                                  if (isReviewMode) {
                                    if (correctVal === "Sai") {
                                      saiBtnClass = "bg-emerald-600 text-white shadow-xs pointer-events-none font-bold";
                                    } else if (chosenVal === "Sai") {
                                      saiBtnClass = "bg-rose-600 text-white shadow-xs line-through opacity-80 pointer-events-none font-bold";
                                    } else {
                                      saiBtnClass = "bg-slate-50 text-slate-350 border border-slate-100 pointer-events-none opacity-40";
                                    }
                                  } else {
                                    saiBtnClass = chosenVal === "Sai" 
                                      ? "bg-rose-600 text-white shadow-xs" 
                                      : "bg-slate-100 hover:bg-rose-50 text-slate-700";
                                  }

                                  return (
                                    <tr key={sidx} className="border-b last:border-0 hover:bg-slate-50/55">
                                      <td className="p-2.5 font-medium text-slate-800">
                                        <strong>{letter}.</strong> {st.text}
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <button
                                          type="button"
                                          disabled={showResultOverlay || isReviewMode}
                                          onClick={() => setOptionVal("Đúng")}
                                          className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition cursor-pointer min-w-[70px] ${dungBtnClass}`}
                                        >
                                          Đúng {isReviewMode && (
                                            correctVal === "Đúng" 
                                              ? (chosenVal === "Đúng" ? "✔️" : "💡") 
                                              : (chosenVal === "Đúng" ? "❌" : "")
                                          )}
                                        </button>
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <button
                                          type="button"
                                          disabled={showResultOverlay || isReviewMode}
                                          onClick={() => setOptionVal("Sai")}
                                          className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition cursor-pointer min-w-[70px] ${saiBtnClass}`}
                                        >
                                          Sai {isReviewMode && (
                                            correctVal === "Sai" 
                                              ? (chosenVal === "Sai" ? "✔️" : "💡") 
                                              : (chosenVal === "Sai" ? "❌" : "")
                                          )}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* 3. Gap Fill text inputs */}
                        {q.type === 'gap_fill' && (() => {
                          const studentVal = (studentAnswers[q.id] || "").trim();
                          const correctVal = (q.correctAnswer || "").trim();
                          
                          const studentWords = studentVal.toLowerCase().replace(/\s+/g, ' ');
                          const correctWords = correctVal.toLowerCase().replace(/\s+/g, ' ');
                          const isGapCorrect = studentWords === correctWords || correctWords.includes(studentWords);
                          
                          return (
                            <div className="pt-2 space-y-2">
                              <input 
                                type="text"
                                value={studentAnswers[q.id] || ''}
                                onChange={(e) => setStudentAnswers({ ...studentAnswers, [q.id]: e.target.value })}
                                disabled={showResultOverlay || isReviewMode}
                                placeholder="Điền từ hoặc số thích hợp vào chỗ trống..."
                                className={`w-full sm:max-w-md p-3 border rounded-xl text-[14px] font-bold focus:outline-none transition ${
                                  isReviewMode 
                                    ? (isGapCorrect 
                                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-3xs" 
                                        : "bg-rose-50 border-rose-400 text-rose-950 line-through shadow-3xs")
                                    : "bg-slate-50 border-slate-205 focus:bg-white focus:border-blue-500 text-slate-800"
                                }`}
                              />
                              {isReviewMode && (
                                <div className="text-xs">
                                  {isGapCorrect ? (
                                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">✔️ Câu trả lời hoàn hảo!</span>
                                  ) : (
                                    <div className="text-rose-700 font-extrabold flex flex-col gap-1">
                                      <span>❌ Chưa chính xác.</span>
                                      <span className="text-indigo-900 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl inline-block max-w-sm mt-0.5">
                                        💡 Học liệu chuẩn: <strong className="text-emerald-750 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono">{correctVal}</strong>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* 4. Column Matching connections */}
                        {q.type === 'matching' && (
                          <div className="space-y-3 pt-2 max-w-4xl">
                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-3xs text-[14px]">
                              <table className="w-full text-left border-collapse font-sans text-slate-800">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[12px]">
                                    <th className="p-2.5 border-r border-slate-200">CỘT A (Vế trái)</th>
                                    <th className="p-2.5 border-r border-slate-200 text-center w-56">MỤC GHÉP NỐI</th>
                                    <th className="p-2.5">CỘT B (Vế phải)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    const rawPairs = Array.isArray(q.matchingPairs) ? q.matchingPairs : (q.matchingPairs ? Object.values(q.matchingPairs) : []);
                                    const leftItems = [...rawPairs].sort((a, b) => String(a.id).localeCompare(String(b.id)));
                                    const rightItems = [...rawPairs].sort((a, b) => String(a.id_match || '').toLowerCase().localeCompare(String(b.id_match || '').toLowerCase()));
                                    
                                    return leftItems.map((leftPair: any, pidx: number) => {
                                      const rightPair = rightItems[pidx] || leftPair;
                                      
                                      const currentAnswersObj: Record<string, string> = {};
                                      const ansRaw = studentAnswers[q.id] || "";
                                      ansRaw.split(",").forEach(part => {
                                        const [leftId, rightId] = part.split("-");
                                        if (leftId && rightId) {
                                          currentAnswersObj[leftId.trim()] = rightId.trim();
                                        }
                                      });

                                      const correctAnswersObj: Record<string, string> = {};
                                      const correctAnsRaw = q.correctAnswer || "";
                                      correctAnsRaw.split(",").forEach(part => {
                                        const [leftId, rightId] = part.split("-");
                                        if (leftId && rightId) {
                                          correctAnswersObj[leftId.trim()] = rightId.trim();
                                        }
                                      });

                                      const chosenMatchId = currentAnswersObj[leftPair.id] || "";
                                      const correctMatchId = correctAnswersObj[leftPair.id] || "";
                                      const isPairCorrect = chosenMatchId.trim().toUpperCase() === correctMatchId.trim().toUpperCase();

                                      return (
                                        <tr key={pidx} className="border-b last:border-0 hover:bg-slate-50/50">
                                          <td className="p-2.5 border-r border-slate-150 font-bold">
                                            <div>{leftPair.id}. {cleanPrefix(leftPair.left)}</div>
                                            {leftPair.leftImage && (
                                              <div className="mt-1.5 max-w-[140px] border border-slate-200 rounded p-1 bg-white flex justify-center">
                                                <img src={leftPair.leftImage} alt="Hình ảnh cột A" className="max-h-20 object-contain mx-auto" referrerPolicy="no-referrer" />
                                              </div>
                                            )}
                                          </td>
                                          <td className="p-2.5 border-r border-slate-150 text-center">
                                            <div className="flex flex-col items-center gap-1 p-1">
                                              <select
                                                value={chosenMatchId || ''}
                                                onChange={(e) => {
                                                  const selectedLetter = e.target.value;
                                                  currentAnswersObj[leftPair.id] = selectedLetter;
                                                  
                                                  const resultParts = leftItems.map((p: any) => {
                                                    const matchLetter = currentAnswersObj[p.id];
                                                    return matchLetter ? `${p.id}-${matchLetter}` : "";
                                                  }).filter(Boolean);
                                                  
                                                  setStudentAnswers(prev => ({
                                                    ...prev,
                                                    [q.id]: resultParts.join(", ")
                                                  }));
                                                  playTing();
                                                }}
                                                disabled={showResultOverlay || isReviewMode}
                                                className={`p-1.5 border rounded-lg font-bold text-[14px] outline-none transition ${
                                                  isReviewMode 
                                                    ? (isPairCorrect 
                                                        ? "bg-emerald-50 border-emerald-400 text-emerald-900" 
                                                        : "bg-rose-50 border-rose-400 text-rose-900")
                                                    : "bg-white text-slate-900 border-slate-300 focus:border-blue-500"
                                                }`}
                                              >
                                                <option value="">-- Chọn vế đúng --</option>
                                                {rightItems.map((p2: any, p2idx: number) => (
                                                  <option key={p2idx} value={p2.id_match}>
                                                    {p2.id_match}. {cleanPrefix(p2.right)}
                                                  </option>
                                                ))}
                                              </select>
                                              {isReviewMode && (
                                                isPairCorrect 
                                                  ? <span className="text-[9.5px] text-emerald-600 font-black flex items-center gap-0.5">✔️ Chính xác</span>
                                                  : <span className="text-[9.5px] text-rose-600 font-black flex flex-col items-center gap-0.5">
                                                      <span>❌ Chưa đúng</span>
                                                      <span className="text-emerald-850 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded text-[8.5px] font-bold">💡 Đáp án: {leftPair.id}-{correctMatchId}</span>
                                                    </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="p-2.5">
                                            <div><strong className="text-blue-700">{rightPair.id_match}.</strong> {cleanPrefix(rightPair.right)}</div>
                                            {rightPair.rightImage && (
                                              <div className="mt-1.5 max-w-[140px] border border-slate-200 rounded p-1 bg-white flex justify-center">
                                                <img src={rightPair.rightImage} alt="Hình ảnh cột B" className="max-h-20 object-contain mx-auto" referrerPolicy="no-referrer" />
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    });
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 4.5. Multiple Choice - Multi selection */}
                        {(q.type === 'quiz_multi' || q.type === 'multiple_choice_multi' || q.gameType === 'quiz_multi' || q.gameType === 'multiple_choice_multi') && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {['A', 'B', 'C', 'D'].map((letter, idx) => {
                              const optionText = q.options[idx];
                              if (!optionText) return null;
                              const selectedList = (studentAnswers[q.id] || "").split(',').map((x: string) => x.trim()).filter(Boolean);
                              const isCurrentSelect = selectedList.includes(letter);
                              
                              const correctLetters = (q.correctAnswer || "").split(/[,;]/).map((x: string) => x.trim().toUpperCase());
                              const isCorrectOption = correctLetters.includes(letter);
                              const optionImage = q.optionImages?.[idx];

                              let btnClass = "bg-slate-50 border-slate-205 text-slate-800 hover:bg-blue-50/50 hover:border-blue-300";
                              let circleClass = "bg-white text-slate-600 border border-slate-200";

                              if (isReviewMode) {
                                if (isCorrectOption) {
                                  btnClass = "bg-green-50 border-green-400 text-green-950 shadow-3xs";
                                  circleClass = "bg-green-600 text-white font-mono";
                                } else if (isCurrentSelect) {
                                  btnClass = "bg-rose-50 border-rose-400 text-rose-950 line-through opacity-80 shadow-3xs";
                                  circleClass = "bg-rose-600 text-white font-mono";
                                } else {
                                  btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                                  circleClass = "bg-slate-100 text-slate-400 border border-slate-200";
                                }
                              } else {
                                if (isCurrentSelect) {
                                  btnClass = "bg-blue-600 text-white border-blue-700 shadow-sm animate-scale-up";
                                  circleClass = "bg-white/20 text-white";
                                }
                              }

                              const handleToggle = () => {
                                let newList;
                                if (selectedList.includes(letter)) {
                                  newList = selectedList.filter((x: string) => x !== letter);
                                } else {
                                  newList = [...selectedList, letter];
                                }
                                setStudentAnswers({
                                  ...studentAnswers,
                                  [q.id]: newList.sort().join(', ')
                                });
                                playTing();
                              };

                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={handleToggle}
                                  disabled={showResultOverlay || isReviewMode}
                                  className={`p-3.5 rounded-xl border text-left text-[14px] font-semibold flex flex-col gap-2 cursor-pointer transition-all ${btnClass}`}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <span className={`w-6 h-6 rounded-lg font-black font-mono text-[11.5px] flex items-center justify-center shrink-0 ${circleClass}`}>
                                      {letter}
                                    </span>
                                    <span className="flex-1 flex justify-between items-center gap-1">
                                      <span>{cleanPrefix(optionText)}</span>
                                      {isReviewMode && isCorrectOption && <span className="text-green-605 font-black text-[10px] ml-1 bg-green-100 border border-green-300 px-1.5 py-0.5 rounded select-none">✔️ ĐÚNG</span>}
                                      {isReviewMode && isCurrentSelect && !isCorrectOption && <span className="text-rose-605 font-black text-[10px] ml-1 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded select-none">❌ SAI</span>}
                                    </span>
                                  </div>
                                  {optionImage && (
                                    <div className="w-full mt-1 border border-slate-200 rounded-md overflow-hidden bg-white p-1 flex justify-center">
                                      <img src={optionImage} alt={`Lựa chọn ${letter}`} className="max-h-32 object-contain" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 4.6. Dropdown Gap Fill */}
                        {(q.type === 'dropdown_gap_fill' || q.gameType === 'dropdown_gap_fill') && q.dropdownGaps && q.dropdownGaps.length > 0 && (
                          <div className="space-y-4 pt-2">
                            {q.dropdownGaps.map((gap: any, gIdx: number) => {
                              const gapLabel = `[${gIdx + 1}]`;
                              
                              const parseMapLocal = (ansStr: string) => {
                                const obj: Record<string, string> = {};
                                if (!ansStr) return obj;
                                ansStr.split(/[|,;]/).forEach((part: string) => {
                                  const dashIdx = part.indexOf("-");
                                  if (dashIdx !== -1) {
                                    const key = part.slice(0, dashIdx).trim().toUpperCase();
                                    const val = part.slice(dashIdx + 1).trim();
                                    if (key) obj[key] = val;
                                  }
                                });
                                return obj;
                              };

                              const studentTfObj = parseMapLocal(studentAnswers[q.id] || "");
                              const currentChoice = studentTfObj[gapLabel] || "";

                              const correctChoice = String(gap.correctAnswer || '').trim();
                              const isGapCorrect = currentChoice.toLowerCase() === correctChoice.toLowerCase();

                              const handleSelectGap = (val: string) => {
                                studentTfObj[gapLabel] = val;
                                const resultParts = q.dropdownGaps.map((_: any, idx2: number) => {
                                  const lbl2 = `[${idx2 + 1}]`;
                                  const selVal = studentTfObj[lbl2];
                                  return selVal ? `${lbl2}-${selVal}` : "";
                                }).filter(Boolean);

                                setStudentAnswers({
                                  ...studentAnswers,
                                  [q.id]: resultParts.join(", ")
                                });
                                playTing();
                              };

                              const gapText = gap.questionText || "";
                              const parts = gapText.split(gapLabel);

                              return (
                                <div key={gIdx} className="bg-slate-50/60 p-4 border border-slate-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                                  <div className="text-[14px] font-bold text-slate-800 leading-relaxed flex flex-wrap items-center gap-1.5">
                                    <span className="text-indigo-600 font-extrabold mr-1">Khoảng trống {gIdx + 1}:</span>
                                    {parts.length > 1 ? (
                                      <>
                                        <span>{parts[0]}</span>
                                        <select
                                          value={currentChoice || ''}
                                          onChange={(e) => handleSelectGap(e.target.value)}
                                          disabled={showResultOverlay || isReviewMode}
                                          className={`px-2.5 py-1.5 border rounded-lg font-black text-xs outline-none transition cursor-pointer ${
                                            isReviewMode 
                                              ? (isGapCorrect 
                                                  ? "bg-green-50 border-green-400 text-green-900" 
                                                  : "bg-rose-50 border-rose-400 text-rose-900")
                                              : "bg-white text-slate-900 border-slate-300 focus:border-blue-500"
                                          }`}
                                        >
                                          <option value="">-- Chọn từ --</option>
                                          {gap.options.map((opt: string, oIdx: number) => (
                                            <option key={oIdx} value={opt}>{opt}</option>
                                          ))}
                                        </select>
                                        <span>{parts[1]}</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>{gapText}</span>
                                        <select
                                          value={currentChoice || ''}
                                          onChange={(e) => handleSelectGap(e.target.value)}
                                          disabled={showResultOverlay || isReviewMode}
                                          className={`px-2.5 py-1.5 border rounded-lg font-black text-xs outline-none transition cursor-pointer ${
                                            isReviewMode 
                                              ? (isGapCorrect 
                                                  ? "bg-green-50 border-green-400 text-green-900" 
                                                  : "bg-rose-50 border-rose-400 text-rose-900")
                                              : "bg-white text-slate-900 border-slate-300 focus:border-blue-500"
                                          }`}
                                        >
                                          <option value="">-- Chọn từ --</option>
                                          {gap.options.map((opt: string, oIdx: number) => (
                                            <option key={oIdx} value={opt}>{opt}</option>
                                          ))}
                                        </select>
                                      </>
                                    )}
                                  </div>

                                  {isReviewMode && (
                                    <div className="text-[11px] shrink-0 font-extrabold">
                                      {isGapCorrect ? (
                                        <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">✔️ Đúng</span>
                                      ) : (
                                        <div className="flex flex-col gap-1 items-end">
                                          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">❌ Chưa đúng</span>
                                          <span className="text-green-800">Đáp án: <strong className="font-mono bg-green-50 px-1 py-0.5 rounded">{correctChoice}</strong></span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 4.7. Hotspot Image */}
                        {(q.type === 'hotspot_image' || q.gameType === 'hotspot_image') && (
                          <div className="space-y-3 pt-2">
                            <p className="text-xs text-rose-650 font-extrabold">🎯 Em hãy nhấp chuột trực tiếp lên hình ảnh dưới đây để chọn vị trí đúng:</p>
                            
                            <div className="relative border border-slate-250 rounded-2xl overflow-hidden bg-slate-50 p-2 max-w-xl mx-auto flex justify-center">
                              <div className="relative inline-block select-none cursor-crosshair">
                                <img 
                                  src={q.questionImage || q.imageUrl} 
                                  alt="Câu hỏi hotspot" 
                                  onClick={(e) => {
                                    if (showResultOverlay || isReviewMode) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                    setStudentAnswers({
                                      ...studentAnswers,
                                      [q.id]: `${x.toFixed(1)}, ${y.toFixed(1)}`
                                    });
                                    playTing();
                                  }}
                                  className="max-h-80 object-contain rounded-lg transition-transform hover:brightness-102"
                                  referrerPolicy="no-referrer"
                                />

                                {/* Render current student click reticle */}
                                {(() => {
                                  const studentAns = studentAnswers[q.id];
                                  if (!studentAns) return null;
                                  const [xStr, yStr] = studentAns.split(',');
                                  const xVal = parseFloat(xStr);
                                  const yVal = parseFloat(yStr);
                                  if (isNaN(xVal) || isNaN(yVal)) return null;

                                  return (
                                    <div 
                                      className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center animate-pulse z-10"
                                      style={{ left: `${xVal}%`, top: `${yVal}%` }}
                                    >
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-md ${
                                        isReviewMode 
                                          ? 'bg-rose-500 border-white'
                                          : 'bg-indigo-600 border-white'
                                      }`}>
                                        📍
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Render correct answer hotspot in review mode */}
                                {isReviewMode && q.hotspotRect && (
                                  <div 
                                    className="absolute rounded-full border-2 border-green-500 bg-green-500/20 flex items-center justify-center shadow-lg"
                                    style={{
                                      left: `${q.hotspotRect.x}%`,
                                      top: `${q.hotspotRect.y}%`,
                                      width: `${q.hotspotRect.radius}px`,
                                      height: `${q.hotspotRect.radius}px`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                    title="Đáp án đúng ở đây"
                                  >
                                    <span className="text-[10px] bg-green-600 text-white font-extrabold px-1 rounded shadow-xs select-none">Mục tiêu</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {isReviewMode && (
                              <div className="text-center text-xs mt-2">
                                <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-extrabold">
                                  💡 Tọa độ mục tiêu: X: {q.hotspotRect?.x || 50}%, Y: {q.hotspotRect?.y || 50}% (Bán kính: {q.hotspotRect?.radius || 30}px)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. Essay / Tự luận */}
                        {(q.type === 'essay' || q.type === 'short_answer' || q.type === 'essay_short_answer') && (
                          <div className="space-y-1.5 pt-2 max-w-4xl">
                            <span className="text-[11px] uppercase font-black text-indigo-700 block">Nhập bài làm tự luận của em:</span>
                            <textarea
                              value={studentAnswers[q.id] || ''}
                              disabled={showResultOverlay || isReviewMode}
                              onChange={(e) => setStudentAnswers({ ...studentAnswers, [q.id]: e.target.value })}
                              placeholder="Trình bày bài làm tự luận chi tiết của em vào đây..."
                              className="w-full text-[13px] font-bold px-4 py-3 bg-slate-50 border rounded-xl border-slate-205 focus:bg-white focus:border-blue-500 outline-none min-h-[120px] transition-all text-slate-800"
                            />
                          </div>
                        )}

                        {/* Display Pedagogical answer guides after student nộp bài */}
                        {(showResultOverlay || isReviewMode) && (
                          <div className="mt-4 p-4 rounded-xl border text-xs leading-relaxed transition-all space-y-2 select-text bg-amber-50/50 border-amber-200">
                            <div className="flex items-center gap-1">
                              <span className="text-md">💡</span>
                              <span className="font-extrabold text-amber-850 uppercase">Đáp án chuẩn & Hướng dẫn:</span>
                            </div>
                            {q.type !== 'essay' && q.type !== 'short_answer' && q.type !== 'essay_short_answer' && (
                              <p className="font-bold text-indigo-950">Đáp án đúng: <span className="bg-white px-2 py-0.5 border rounded uppercase font-mono tracking-wider">{q.correctAnswer}</span></p>
                            )}
                            <p className="font-semibold text-gray-600">{q.answerGuide || "Đáp án chuẩn xác theo chương trình học."}</p>
                          </div>
                        )}

                      </div>
                    );
                  })}

                  {/* PHẦN THỰC HÀNH (CÂU HỎI THỰC HÀNH VÀ ĐÍNH KÈM TỆP TIN BÀI LÀM) */}
                   {activeTakeExam.isPracticalEnabled === true && (
                     <div className="bg-slate-50 border border-slate-200 rounded-[28px] p-6 space-y-6">
                       <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                         <div>
                           <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                             Phần II. Thực hành
                           </span>
                           <h3 className="text-md font-black text-slate-800 mt-1 uppercase">🛠️ Các câu hỏi thực hành máy tính</h3>
                         </div>
                         <span className="text-[10.5px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-3xs">
                           🔒 Phần II. Thực hành do giáo viên chấm bài
                         </span>
                       </div>
 
                       <p className="text-xs text-blue-600 font-bold leading-relaxed">
                         Em hãy thực hiện các thao tác này trực tiếp trên máy tính của mình. Sau khi hoàn thành, em có thể thông báo cho Thầy/Cô hoặc đính kèm tệp tin bài tập thực hành (ảnh chụp bài làm hoặc tệp PowerPoint) bên dưới để Thầy/Cô trực tiếp kiểm tra và chấm điểm nhé!
                       </p>

                      {/* ILLUSTRATION IMAGE SHOWN FOR STUDENTS ABOVE PRACTICAL TASK 1 */}
                      {activeTakeExam.practicalIllustrationImage && (
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl space-y-2 text-center">
                          <span className="text-[10px] uppercase font-black text-indigo-900 tracking-wider block text-left">🖼️ Hình ảnh minh họa bài làm thực hành:</span>
                          <div className="flex justify-center items-center h-64 overflow-hidden bg-slate-50 rounded-xl p-2 border">
                            <img
                              src={activeTakeExam.practicalIllustrationImage}
                              alt="Hình ảnh thực hành minh họa"
                              className="max-h-full max-w-full object-contain rounded"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {(activeTakeExam.practical || [
                          { id: 'p-1', questionText: 'Nháy đúp chuột khởi động phần mềm soạn thảo MS Word.', imageUrl: '' },
                          { id: 'p-2', questionText: 'Thực hiện gõ từ câu thơ "Em là dũng sĩ tin học lớp 3" đúng chuẩn Telex.', imageUrl: '' },
                          { id: 'p-3', questionText: 'Sử dụng công cụ vẽ Paint vẽ hình tròn.', imageUrl: '' },
                          { id: 'p-4', questionText: 'Tạo thư mục lưu tên em ở ổ đĩa D.', imageUrl: '' },
                          { id: 'p-5', questionText: 'Tắt máy tính đúng quy trình an toàn.', imageUrl: '' }
                        ]).map((pTask: any, pIdx: number) => {
                          let cleanText = pTask.questionText || '';
                          cleanText = cleanText.replace(/^Bài thực hành số \d+:\s*/i, '');
                          cleanText = cleanText.replace(/^Câu \d+:\s*/i, '');
                          return (
                            <div key={pTask.id} className="bg-white p-4 border border-slate-205 rounded-xl flex items-start gap-3">
                              <div className="flex-1 text-left">
                                <p className="text-xs font-bold text-slate-800 leading-normal">
                                  Câu {pIdx + 1}: {cleanText}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* CHỨC NĂNG ĐÍNH KÈM TỆP TIN BÀI TẬP THỰC HÀNH */}
                      <div className="bg-white border-2 border-dashed border-amber-300 rounded-2xl p-5 space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📎</span>
                              <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-tight">
                                Đính kèm tệp tin bài tập thực hành
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Tải ảnh lên (.png; .jpeg; .bmp) hoặc file bài trình chiếu PowerPoint (.pptx)
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9.5px] bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200">
                              Định dạng: .PNG, .JPEG, .BMP, .PPTX
                            </span>
                          </div>
                        </div>

                        {/* Hidden Native File Input */}
                        <input
                          ref={practicalFileInputRef}
                          type="file"
                          accept=".png,.jpeg,.jpg,.bmp,.pptx,.ppt,image/png,image/jpeg,image/bmp,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                          className="hidden"
                          disabled={showResultOverlay || isReviewMode}
                          onChange={handlePracticalFileUpload}
                        />

                        {/* If file is attached */}
                        {(practicalFile || practicalImage) ? (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-3 min-w-0">
                              {(practicalFileType === 'image' || practicalImage) ? (
                                <div 
                                  className="w-16 h-16 rounded-xl border border-amber-300 overflow-hidden bg-white shrink-0 flex items-center justify-center cursor-zoom-in shadow-2xs group relative" 
                                  onClick={() => window.open(practicalImage || practicalFile, '_blank')}
                                  title="Nhấp để xem ảnh kích thước gốc"
                                >
                                  <img src={practicalImage || practicalFile} alt="Minh chứng" className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-orange-100 border border-orange-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                                  <span className="text-2xl">📊</span>
                                  <span className="text-[9px] font-black text-orange-800 uppercase">PPTX</span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                                    {(practicalFileType === 'image' || practicalImage) ? 'Ảnh bài làm' : 'Tệp PowerPoint'}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 truncate block max-w-xs">
                                    {practicalFileName || ((practicalFileType === 'image' || practicalImage) ? 'BaiThucHanh.png' : 'BaiThucHanh.pptx')}
                                  </span>
                                </div>
                                <span className="text-[10.5px] text-emerald-700 font-bold block mt-1">
                                  ✓ Tệp tin đã được đính kèm và sẽ gửi kèm bài thi cho giáo viên
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {practicalFile && practicalFileType !== 'image' && (
                                <a
                                  href={practicalFile}
                                  download={practicalFileName || 'BaiThucHanh.pptx'}
                                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-3xs"
                                >
                                  📥 Tải về kiểm tra
                                </a>
                              )}
                              {!(showResultOverlay || isReviewMode) && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => practicalFileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer shadow-3xs"
                                  >
                                    Đổi tệp khác
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPracticalFile('');
                                      setPracticalImage('');
                                      setPracticalFileName('');
                                      setPracticalFileType('');
                                      if (practicalFileInputRef.current) practicalFileInputRef.current.value = '';
                                      triggerToast('🗑️ Đã gỡ bỏ tệp đính kèm');
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer shadow-3xs"
                                    title="Xóa tệp này"
                                  >
                                    ✕ Xóa
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : !(showResultOverlay || isReviewMode) ? (
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const droppedFile = e.dataTransfer.files?.[0];
                              if (droppedFile) {
                                processPracticalFile(droppedFile);
                              }
                            }}
                            className="border-2 border-dashed border-slate-250 bg-slate-50/70 hover:bg-amber-50/40 rounded-xl p-5 transition text-center space-y-2.5 cursor-pointer"
                            onClick={() => practicalFileInputRef.current?.click()}
                          >
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shadow-3xs">
                                🖼️
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl shadow-3xs">
                                📊
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                Nhấp vào đây để chọn tệp hoặc kéo thả tệp vào khung này
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Cho phép tải ảnh (.png; .jpeg; .bmp) hoặc bài thuyết trình (.pptx) tối đa 25MB
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  practicalFileInputRef.current?.click();
                                }}
                                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-extrabold shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                              >
                                📎 Tải ảnh lên (.png, .jpeg, .bmp) hoặc file PPTX
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs italic text-left">
                            Học sinh không đính kèm tệp bài tập thực hành nào trong bài thi này.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                    {/* Review mode display of what was submitted */}
                    {(isReviewMode || showResultOverlay) && (practicalImage || practicalLink || practicalFile) && (
                      <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-4 space-y-2 text-left">
                        <h4 className="text-[11px] font-black uppercase text-indigo-900">📂 Minh chứng bài thực hành của em đã gửi đi:</h4>
                        <div className="flex flex-wrap gap-4 items-center mt-1">
                          {practicalImage && (
                            <div>
                              <span className="text-[10px] bg-indigo-100/70 border border-indigo-200 px-1.5 py-0.5 rounded text-indigo-850 mr-2">Ảnh:</span>
                              <img src={practicalImage} className="max-h-24 rounded border border-slate-200 cursor-zoom-in" alt="Minh chứng đã gửi" onClick={() => window.open(practicalImage, '_blank')} />
                            </div>
                          )}
                          {practicalFile && practicalFileType !== 'image' && (
                            <div className="bg-white border border-amber-200 p-2.5 rounded-xl flex items-center gap-2.5 shadow-3xs">
                              <span className="text-2xl">📊</span>
                              <div>
                                <div className="text-[11px] font-bold text-amber-900 truncate max-w-[200px]">
                                  {practicalFileName || 'BaiThucHanh.pptx'}
                                </div>
                                <span className="text-[9px] text-amber-700 font-medium">Tệp PowerPoint đính kèm</span>
                              </div>
                              <a
                                href={practicalFile}
                                download={practicalFileName || 'BaiThucHanh.pptx'}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold ml-1 transition"
                              >
                                📥 Tải về
                              </a>
                            </div>
                          )}
                          {practicalLink && (
                            <div>
                              <span className="text-[10px] bg-indigo-100/70 border border-indigo-200 px-1.5 py-0.5 rounded text-indigo-850 mr-1.5">Liên kết:</span>
                              <a href={practicalLink} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline text-xs font-black truncate block max-w-sm">
                                {practicalLink}
                              </a>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-indigo-600 block italic font-semibold mt-1">✓ Thầy Cô sẽ chấm điểm chi tiết bài thực hành này của em trên trang Quản lý.</span>
                      </div>
                    )}

                </div>

                {/* Right static navigation dashboard sidepanel */}
                <div className="w-full md:w-80 bg-slate-100/80 border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between shrink-0">
                  
                  {/* Info components */}
                  <div className="space-y-5">
                    
                    {/* User profile ID */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-205 shadow-2xs space-y-2 text-xs">
                      <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Bài thi của em</div>
                      <div className="font-extrabold text-[#2454a6] text-sm truncate">{studentName}</div>
                      <div className="text-slate-500 font-bold">Lớp: {studentClass.replace(/^(Khối\s+\d+\s+-\s+)?(Lớp\s+)?/i, '')}</div>
                    </div>

                    {/* Timer Widget */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-205 shadow-2xs text-center space-y-2">
                      <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Đồng hồ đếm ngược</div>
                      
                      <div className="py-1">
                        <span className={`text-4xl font-black font-mono tracking-tight ${timeLeft < 60 ? 'text-red-500 animate-pulse animate-duration-500' : 'text-slate-800'}`}>
                          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                          {(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <span className="text-[10px] italic text-slate-400 font-bold block">Tự động nộp bài khi hết giờ</span>
                    </div>

                    {/* Submit / Finish Controllers - Repositioned right below the countdown timer */}
                    <div className="space-y-2">
                      {!showResultOverlay ? (
                        <button
                          onClick={() => setShowSubmitConfirmModal(true)}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl cursor-pointer transition border-b-4 border-emerald-950 active:border-b-0 shadow-md uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-101 active:scale-99"
                        >
                          🖲️ Nộp bài & Chấm điểm
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExportResultWord()}
                            className="w-full py-3 bg-red-650 hover:bg-red-750 text-white font-black text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 uppercase tracking-wide shadow-sm border border-red-700 font-sans"
                          >
                            📊 Tải Bài Thi & Điểm số (Word)
                          </button>
                          <button
                            onClick={() => {
                              setActiveTakeExam(null);
                              setShowResultOverlay(false);
                              if (directTakeExamId) {
                                window.location.href = window.location.pathname;
                              }
                            }}
                            className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition text-center uppercase tracking-wider"
                          >
                            ✓ Hoàn tất phòng thi
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Numbered Jump list grids */}
                    <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[10px] font-black uppercase text-slate-400">Số câu hỏi ({activeTakeExam.questions?.length})</div>
                      <div className="grid grid-cols-4 gap-2">
                        {activeTakeExam.questions?.map((q: any, idx: number) => {
                          const isAnswered = studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== '';
                          return (
                            <a
                              key={q.id}
                              href={`#question-card-${q.id}`}
                              className={`p-2 rounded-xl text-center text-xs font-black border transition-all ${
                                isAnswered
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-3xs'
                                  : 'bg-white border-slate-300 text-slate-650 hover:bg-slate-50'
                              }`}
                            >
                              {idx + 1}
                            </a>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. OVERLAY DIALOG FOR EXAM RESULTS AND SCORE DISPLAY */}
      {showResultOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 max-w-md w-full text-center space-y-6 animate-scale-up border-4 border-emerald-500" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
            <div className="text-6xl animate-bounce">🏆⭐</div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-indigo-950 uppercase">Kết Quả Nộp Bài Trực Tuyến</h3>
              <p className="text-xs text-red-600 font-bold">Hệ thống đã ghi nhận điểm thành công!</p>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none" />
              <div className="text-[12px] text-emerald-600 uppercase font-black tracking-widest mb-1">Điểm số đạt được</div>
              <div className="text-6xl font-black text-emerald-600 leading-none">
                {calculatedScore}
              </div>
              <span className="text-xs font-bold text-emerald-500">Thang điểm: {activeTakeExam?.matrixTotalScore || 10}đ</span>
              {activeTakeExam?.isPracticalEnabled && (
                <div className="mt-2 text-xs text-blue-600 font-extrabold block">
                  Đây chỉ là điểm của phần trắc nghiệm. Em hãy làm bài thực hành để đạt được điểm tốt nhất nhé. Cố lên nào!
                </div>
              )}
            </div>

            {/* BÁO ĐIỂM & ĐÁNH GIÁ SƯ PHẠM CHUẨN THÔNG TƯ 27 (TT27/BGDĐT) */}
            <div className="p-4 rounded-2xl border text-left space-y-2 bg-indigo-50/20 border-indigo-200 text-xs">
              <div className="flex items-center justify-between font-bold uppercase text-[10px]">
                <span className="text-indigo-900 font-bold">Đánh giá chuẩn TT27:</span>
                <span className={`px-2.5 py-0.5 rounded-full border ${
                  calculatedScore >= 9.0 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : calculatedScore >= 7.0 
                  ? 'bg-blue-100 text-blue-800 border-blue-300' 
                  : calculatedScore >= 5.0 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {calculatedScore >= 7.0 ? 'Hoàn thành tốt' : calculatedScore >= 5.0 ? 'Hoàn thành' : 'Chưa hoàn thành'}
                </span>
              </div>
              <p className={`leading-relaxed font-bold ${
                calculatedScore >= 5.0 ? 'text-emerald-650 text-green-600' : 'text-red-600'
              }`}>
                {calculatedScore >= 9.0 
                  ? "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết và thực hành xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo." 
                  : calculatedScore >= 7.0 
                  ? "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm, kỹ năng thực hành tốt, tích cực và chủ động trong các hoạt động học tập." 
                  : calculatedScore >= 5.0 
                  ? "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập thực hành nhiều hơn." 
                  : "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm và kỹ năng thực hành cơ bản, cần được hướng dẫn rèn luyện thêm."
                }
              </p>
            </div>

            <div className="text-[13px] font-bold text-blue-600 leading-relaxed bg-slate-50 p-4 rounded-xl border text-left">
              🎉 Xin chúc mừng <strong>{studentName}</strong> đã hoàn thành bài thi môn <strong>{activeTakeExam?.subject}</strong> Lớp <strong>{activeTakeExam?.grade}</strong>! Hệ thống đã ghi nhận kết quả thi trực tuyến của em.
            </div>

            {/* PHẦN THƯỞNG CHO HỌC SINH ĐẠT ĐIỂM CAO */}
            {activeTakeExam?.rewardEnabled && calculatedScore >= (activeTakeExam?.rewardMinScore ?? 8) && activeTakeExam?.rewardGameLink && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center space-y-2 shadow-md">
                <div className="font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5">
                  🎉 PHẦN THƯỞNG CHO EM 🎁
                </div>
                <p className="text-[11px] font-medium opacity-95 leading-relaxed">
                  Em đã làm bài trên {activeTakeExam?.rewardMinScore} điểm! Hãy nhấp vào nút bên dưới để nhận phần quà của mình.
                </p>
                <a
                  href={activeTakeExam?.rewardGameLink}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-2 bg-white text-orange-600 hover:bg-orange-50 font-black text-xs rounded-xl shadow-sm transition active:scale-95 uppercase tracking-wide cursor-pointer"
                >
                  🎮 Chơi Trò Chơi Ngay! 🚀
                </a>
              </div>
            )}

            <div className="space-y-2 pt-2">
              {activeTakeExam?.showDetailedSolution && (
                <button
                  type="button"
                  onClick={() => {
                    setShowResultOverlay(false);
                    setIsReviewMode(true);
                    playTing();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[14px] rounded-xl cursor-pointer transition border-b-4 border-emerald-950 active:border-b-0 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  👁️ Xem chi tiết bài làm
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTakeExam(null);
                  setTimerActive(false);
                  setShowResultOverlay(false);
                  setIsExamConfigPhase(true);
                  setStudentName(''); // clear details for the next candidate
                  if (directTakeExamId) {
                    window.location.href = window.location.pathname;
                  }
                }}
                className="w-full py-3 bg-[#2454a6] hover:bg-blue-700 text-white font-extrabold text-[14px] rounded-xl cursor-pointer transition border-b-4 border-blue-900 active:border-b-0 uppercase tracking-wide"
              >
                Thoát 🚪
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Delete Exam Confirmation Modal */}
      {examIdToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <span className="text-3xl">🗑️</span>
              <h3 className="text-lg font-black tracking-tight uppercase">Xác nhận xóa phòng thi</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa phòng thi trực tuyến này khỏi hệ thống? Tất cả lịch sử điểm số nộp bài liên quan sẽ bị xóa bỏ vĩnh viễn và không thể phục hồi!
            </p>
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setExamIdToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExam(examIdToDelete, true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl border-b-2 border-red-900"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Submissions Confirmation Modal */}
      {examIdToClear && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <span className="text-3xl">🧹</span>
              <h3 className="text-lg font-black tracking-tight uppercase">Làm sạch bảng điểm</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Bạn có chắc chắn muốn dọn sạch toàn bộ kết quả và lịch sử nộp bài thi của các học sinh trong phòng thi này?
            </p>
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setExamIdToClear(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleClearSubmissions(examIdToClear, true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl border-b-2 border-amber-900"
              >
                Dọn sạch ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-fade-in text-center space-y-4">
            <div className="flex flex-col items-center gap-2 text-indigo-950">
              <span className="text-4xl">📝</span>
              <h3 className="text-lg font-black tracking-tight uppercase">Xác nhận nộp bài</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed font-bold">
              Bạn có chắc chắn muốn nộp bài?
            </p>
            <div className="flex justify-center gap-3 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                Quay lại làm tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirmModal(false);
                  handleSubmitExam(false);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer border-b-2 border-emerald-900"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
