import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users,
  Calendar, 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  Edit2, 
  Sparkles, 
  Award, 
  CheckCircle,
  FileText,
  UserCheck,
  Building,
  GraduationCap,
  ChevronDown,
  Globe,
  Copy,
  Eye,
  FileDown,
  X,
  Search,
  RefreshCw,
  Star
} from 'lucide-react';
import { StudentProfile } from '../types';
import { 
  downloadClassReportWord, 
  downloadClassSubmissionsWordZip, 
  downloadClassScoresExcel,
  downloadClassSubmissionsPdfZip
} from '../utils/wordGenerator';

interface TeacherRecord {
  id: string;
  teacherId: string;
  fullname: string;
  username: string;
  gender: string;
  school: string;
  district?: string;
  subject: string;
  grades: number[];
  classes: string[];
}

interface TeacherDashboardProps {
  currUser: (StudentProfile & { username?: string }) | null;
  teachersList: TeacherRecord[];
}

interface TeachingDiary {
  id: string;
  date: string;
  className: string;
  lessonName: string;
  studentCount: string;
  positives: string;
  negatives: string;
  improvements: string;
  bgColor?: string;
  imageUrl?: string;
  embedLink?: string;
}

export default function TeacherDashboard({ currUser, teachersList }: TeacherDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'homeroom' | 'diary' | 'online_exams'>('profile');

  // --- HOMEROOM CLASS STATES & HELPERS ---
  const [homeroomStudents, setHomeroomStudents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lms_students_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 's1', studentId: 'HS00001', fullname: 'Nguyễn Minh Tâm', birthDate: '15/05/2016', gender: 'Nam', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', avgScore: 8.8, xp: 1250, stars: 18, level: 5, streak: 10, note: 'Chăm chỉ, học tốt môn Tin học' },
      { id: 's2', studentId: 'HS00002', fullname: 'Lê Hoàng Bách', birthDate: '22/08/2016', gender: 'Nam', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', avgScore: 7.6, xp: 985, stars: 12, level: 4, streak: 5, note: 'Tích cực phát biểu' },
      { id: 's3', studentId: 'HS00003', fullname: 'Phạm Ngọc Khánh', birthDate: '10/01/2016', gender: 'Nữ', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', avgScore: 9.2, xp: 1420, stars: 22, level: 5, streak: 12, note: 'Ban cán sự lớp gương mẫu' },
      { id: 's4', studentId: 'HS00004', fullname: 'Trần Văn Cường', birthDate: '05/11/2016', gender: 'Nam', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', avgScore: 6.8, xp: 620, stars: 8, level: 3, streak: 2, note: 'Cần rèn luyện thêm gõ phím' },
      { id: 's5', studentId: 'HS00005', fullname: 'Phạm Hà Phương', birthDate: '30/03/2016', gender: 'Nữ', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', avgScore: 8.5, xp: 1100, stars: 15, level: 4, streak: 7, note: 'Sáng tạo trong vẽ đồ họa' },
      { id: 's6', studentId: 'HS00006', fullname: 'Võ Minh Quân', birthDate: '14/09/2016', gender: 'Nam', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', avgScore: 7.9, xp: 870, stars: 11, level: 4, streak: 4, note: 'Tập trung nghe giảng' }
    ];
  });
  const [homeroomSearch, setHomeroomSearch] = useState('');
  const [homeroomGenderFilter, setHomeroomGenderFilter] = useState('all');
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<any | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<any | null>(null);
  const [activeHomeroomClass, setActiveHomeroomClass] = useState<string>('');

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('lms_students_list');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setHomeroomStudents(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener('lms_settings_changed', handleSync);
    return () => window.removeEventListener('lms_settings_changed', handleSync);
  }, []);

  // --- ONLINE EXAMS STATES & HELPERS ---
  const [panelToast, setPanelToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setPanelToast(msg);
    setTimeout(() => {
      setPanelToast(null);
    }, 4500);
  };

  const [adminOnlineExams, setAdminOnlineExams] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Reload custom exams from localStorage when sub-tab is activated to ensure sync
  useEffect(() => {
    if (activeSubTab === 'online_exams') {
      try {
        setAdminOnlineExams(JSON.parse(localStorage.getItem('lms_custom_exams') || '[]'));
      } catch (e) {}
    }
  }, [activeSubTab]);

  const [selectedAdminExam, setSelectedAdminExam] = useState<any | null>(null);
  const [reportClassFilter, setReportClassFilter] = useState<string>('all');
  const [reportScoreFilter, setReportScoreFilter] = useState<string>('all');
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [tempPracticalGrades, setTempPracticalGrades] = useState<Record<string, number>>({});
  const [tempPracticalImage, setTempPracticalImage] = useState<string>('');
  const [tempPracticalLink, setTempPracticalLink] = useState<string>('');
  const [tempAnswers, setTempAnswers] = useState<Record<string, any>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  const [examToDeleteId, setExamToDeleteId] = useState<string | null>(null);
  const [examToDeleteName, setExamToDeleteName] = useState('');

  const [submissionToDeleteId, setSubmissionToDeleteId] = useState<string | null>(null);
  const [submissionToDeleteName, setSubmissionToDeleteName] = useState('');
  const [submissionToDeleteExamId, setSubmissionToDeleteExamId] = useState<string | null>(null);
  const [examIdToClearAll, setExamIdToClearAll] = useState<string | null>(null);
  const [deletedSubmissionsBackup, setDeletedSubmissionsBackup] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem('lms_deleted_submissions_backup');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [editingExam, setEditingExam] = useState<any | null>(null);

  const formatExamDateTime = (exam: any) => {
    let dateObj: Date | null = null;
    
    if (exam.createdAt) {
      const t = Date.parse(exam.createdAt);
      if (!isNaN(t)) {
        dateObj = new Date(t);
      } else {
        const parts = exam.createdAt.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          dateObj = new Date(year, month, day);
        }
      }
    }
    
    if (!dateObj && exam.id) {
      const match = exam.id.match(/\d+/);
      if (match) {
        const ts = parseInt(match[0], 10);
        if (ts > 1000000000000 && ts < 4000000000000) {
          dateObj = new Date(ts);
        }
      }
    }
  
    if (!dateObj) {
      dateObj = new Date();
    }
  
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
  
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  };

  const getLiveSubScore = (sub: any) => {
    if (!selectedAdminExam) {
      return { theoryScore: 0, totalPracticalScore: 0, totalScore: 0 };
    }
    if (gradingSubId !== sub.id) {
      const tnScore = sub.theoryScore !== undefined 
        ? sub.theoryScore 
        : (sub.totalPracticalScore !== undefined 
          ? (Number(sub.score || 0) - Number(sub.totalPracticalScore || 0)) 
          : Number(sub.score || 0));
      return {
        theoryScore: Number(tnScore),
        totalPracticalScore: Number(sub.totalPracticalScore || 0),
        totalScore: Number(sub.score || 0)
      };
    }

    let sumPrac = 0;
    const finalAnswers = { 
      ...(sub.answers || {}),
      ...tempAnswers,
      practical_image: tempPracticalImage,
      practical_link: tempPracticalLink
    };
    for (let i = 1; i <= 5; i++) {
      const val = tempPracticalGrades[`p-${i}`] || 0;
      sumPrac += val;
    }
    
    const questions = selectedAdminExam.questions || [];
    let computedTheoryScore = 0;
    let totalMaxScore = selectedAdminExam.matrixTotalScore || 10;
    let totalQuestions = questions.length || 1;

    const normalizeAnsCheck = (str: any) => {
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

    questions.forEach((q: any) => {
      const studentAnsInput = finalAnswers[q.id];
      if (studentAnsInput === undefined || studentAnsInput === null || studentAnsInput === '') return;

      const studentAnsStr = String(studentAnsInput);
      const correctAnsStr = String(q.correctAnswer || '');

      if (q.type === 'multiple_choice') {
        if (studentAnsStr.trim().toUpperCase() === correctAnsStr.trim().toUpperCase()) {
          computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
        }
      } else if (q.type === 'true_false') {
        if (q.statements && q.statements.length > 0) {
          const studentTfObj: any = {};
          studentAnsStr.split(",").forEach((part) => {
            const parts = part.split("-");
            if (parts.length >= 2) {
              const lbl = parts[0].trim().toUpperCase();
              const val = parts[1].trim().toLowerCase();
              studentTfObj[lbl] = val;
            }
          });
          
          const correctTfObj: any = {};
          correctAnsStr.split(",").forEach((part) => {
            const parts = part.split("-");
            if (parts.length >= 2) {
              const lbl = parts[0].trim().toUpperCase();
              const val = parts[1].trim().toLowerCase();
              correctTfObj[lbl] = val;
            }
          });

          q.statements.forEach((st: any) => {
            const sLabel = String(st.label || '').trim().toUpperCase();
            if (studentTfObj[sLabel] === correctTfObj[sLabel]) {
              computedTheoryScore += st.points !== undefined ? Number(st.points) : (q.points !== undefined ? Number(q.points) / q.statements.length : 0.25);
            }
          });
        } else {
          const normStudent = normalizeAnsCheck(studentAnsStr);
          const normCorrect = normalizeAnsCheck(correctAnsStr);
          if (normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "")) {
            computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          }
        }
      } else if (q.type === 'matching') {
        if (q.matchingPairs && q.matchingPairs.length > 0) {
          const studentMatchObj: any = {};
          studentAnsStr.split(",").forEach((part) => {
            const parts = part.split("-");
            if (parts.length >= 2) {
              const leftId = parts[0].trim();
              const rightId = parts[1].trim().toLowerCase();
              studentMatchObj[leftId] = rightId;
            }
          });
          
          const correctMatchObj: any = {};
          correctAnsStr.split(",").forEach((part) => {
            const parts = part.split("-");
            if (parts.length >= 2) {
              const leftId = parts[0].trim();
              const rightId = parts[1].trim().toLowerCase();
              correctMatchObj[leftId] = rightId;
            }
          });

          q.matchingPairs.forEach((pair: any) => {
            const mId = String(pair.id || '').trim();
            if (studentMatchObj[mId] === correctMatchObj[mId]) {
              computedTheoryScore += pair.points !== undefined ? Number(pair.points) : (q.points !== undefined ? Number(q.points) / q.matchingPairs.length : 0.5);
            }
          });
        } else {
          const normStudent = normalizeAnsCheck(studentAnsStr);
          const normCorrect = normalizeAnsCheck(correctAnsStr);
          if (normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "")) {
            computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
          }
        }
      } else if (q.type === 'gap_fill') {
        const studentWords = studentAnsStr.trim().toLowerCase().replace(/\s+/g, ' ');
        const correctWords = correctAnsStr.trim().toLowerCase().replace(/\s+/g, ' ');
        if (studentWords === correctWords || correctWords.includes(studentWords)) {
          computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
        }
      }
    });

    const theoryScore = Number(Math.min(totalMaxScore, Math.max(0, computedTheoryScore)).toFixed(2));
    const totalScore = sumPrac + theoryScore;

    return {
      theoryScore,
      totalPracticalScore: sumPrac,
      totalScore
    };
  };

  const [schoolsRegistry, setSchoolsRegistry] = useState<string[]>(() => {
    const saved = localStorage.getItem('lms_schools_registry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      "Tiểu học Trần văn Danh", 
      "Tiểu học Nguyễn Thị Nuôi", 
      "Trường TH Lý Tự Trọng", 
      "Trường TH Nguyễn Huệ"
    ] as string[];
  });

  const [subjectsRegistry, setSubjectsRegistry] = useState<string[]>(() => {
    const saved = localStorage.getItem('lms_subjects_registry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      "Tin học", 
      "Tiếng Việt", 
      "Toán", 
      "Tiếng Anh"
    ] as string[];
  });

  const [classesByGradeRegistry, setClassesByGradeRegistry] = useState<{ [key: number]: string[] }>(() => {
    const saved = localStorage.getItem('lms_classes_by_grade_registry');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      1: ['1.1', '1.2', '1.3', '1.4', '1.5'],
      2: ['2.1', '2.2', '2.3', '2.4', '2.5'],
      3: ['3.1', '3.2', '3.3', '3.4', '3.5'],
      4: ['4.1', '4.2', '4.3', '4.4', '4.5'],
      5: ['5.1', '5.2', '5.3', '5.4', '5.5']
    };
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Local mutable state synced with localStorage that falls back to matchedTeacher
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('teacher_profile_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullname) {
          return {
            teacherId: (parsed.teacherId || '').replace(/^GV:\s*/i, 'GV'),
            fullname: parsed.fullname || '',
            gender: parsed.gender || 'Nữ',
            school: parsed.school || currUser?.school || 'Tiểu học Trần Văn Danh',
            district: parsed.district || 'ỦY BAN NHÂN DÂN QUẬN 1',
            subject: parsed.subject || 'Tin học',
            grades: Array.isArray(parsed.grades) ? parsed.grades : [3, 4, 5],
            classes: Array.isArray(parsed.classes) ? parsed.classes : ['3.1', '3.3', '4.1', '5.2'],
            geminiApiKey: parsed.geminiApiKey || localStorage.getItem('personal_gemini_api_key') || ''
          };
        }
      } catch (e) {
        console.error("Failed to parse saved teacher profile", e);
      }
    }
    
    const matched = teachersList.find(t => t.fullname === currUser?.fullname) || teachersList[0] || {
      teacherId: 'GV00001',
      fullname: currUser?.fullname || 'Cô Hồng Nhung 🌸',
      username: 'teacher',
      gender: 'Nữ',
      school: currUser?.school || 'Tiểu học Trần Văn Danh',
      district: 'ỦY BAN NHÂN DÂN QUẬN 1',
      subject: 'Tin học',
      grades: [3, 4, 5],
      classes: ['3.1', '3.3', '4.1', '5.2']
    };

    return {
      teacherId: matched.teacherId || 'GV00001',
      fullname: matched.fullname || '',
      gender: matched.gender || 'Nữ',
      school: matched.school || 'Tiểu học Trần Văn Danh',
      district: matched.district || 'ỦY BAN NHÂN DÂN QUẬN 1',
      subject: matched.subject || 'Tin học',
      grades: matched.grades || [3, 4, 5],
      classes: matched.classes || ['3.1', '3.3', '4.1', '5.2'],
      geminiApiKey: localStorage.getItem('personal_gemini_api_key') || ''
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const [gradesList, setGradesList] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('lms_grades_registry');
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
    } catch(e) { return [1, 2, 3, 4, 5]; }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedGrades = localStorage.getItem('lms_grades_registry');
        if (savedGrades) setGradesList(JSON.parse(savedGrades));
        const savedSchools = localStorage.getItem('lms_schools_registry');
        if (savedSchools) setSchoolsRegistry(JSON.parse(savedSchools));
        const savedSubjects = localStorage.getItem('lms_subjects_registry');
        if (savedSubjects) setSubjectsRegistry(JSON.parse(savedSubjects));
        const savedClasses = localStorage.getItem('lms_classes_by_grade_registry');
        if (savedClasses) setClassesByGradeRegistry(JSON.parse(savedClasses));
        const savedTeachers = localStorage.getItem('lms_teachers_list');
        if (savedTeachers) {
          const tList = JSON.parse(savedTeachers);
          const me = tList.find((t: any) => t.username === (currUser?.username || 'giaovien1'));
          if (me) setProfile(me);
        }
      } catch(e){}
    };
    window.addEventListener('lms_settings_changed', handleSync);
    return () => window.removeEventListener('lms_settings_changed', handleSync);
  }, [currUser?.username]);

  const handleStartEdit = () => {
    setEditForm({
      ...profile,
      geminiApiKey: localStorage.getItem('personal_gemini_api_key') || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (!editForm.fullname.trim()) {
      alert("Họ và tên không được để trống!");
      return;
    }
    setProfile(editForm);
    localStorage.setItem('teacher_profile_data', JSON.stringify(editForm));
    if (editForm.geminiApiKey !== undefined) {
      localStorage.setItem('personal_gemini_api_key', editForm.geminiApiKey);
    }
    setIsEditing(false);
  };

  const matchedTeacher = profile;

  // Local state for Teaching Diary logs (Retain state real-time with localStorage)
  const [diaries, setDiaries] = useState<TeachingDiary[]>([]);

  useEffect(() => {
    const savedDiaries = localStorage.getItem('teacher_teaching_diaries');
    if (savedDiaries) {
      try {
        setDiaries(JSON.parse(savedDiaries));
      } catch (e) {
        console.error("Failed to parse diaries", e);
      }
    } else {
      // Seed some professional initial diaries
      const initialDiaries: TeachingDiary[] = [
        {
          id: 'diary_1',
          date: '2026-06-08',
          className: 'Lớp 3.1',
          lessonName: 'Bài 1: Thông tin và quyết định (Tiết 1)',
          studentCount: '32/32',
          positives: 'Học sinh rất hào hứng với trò chơi "Lệnh của Robot AI". Phản xạ nhanh, hiểu bài tốt.',
          negatives: 'Một vài em còn nhút nhát chưa dám đứng lên phát biểu ý kiến riêng.',
          improvements: 'Tạo cơ hội chơi theo nhóm nhỏ ở tiết sau để các em nhút nhát dễ hòa nhập hơn.'
        },
        {
          id: 'diary_2',
          date: '2026-06-09',
          className: 'Lớp 3.3',
          lessonName: 'Bài 1: Thông tin và quyết định (Tiết 2)',
          studentCount: '30/32',
          positives: 'Hoạt động trải nghiệm vẽ tranh bằng phần mềm AI "Quick, Draw!" diễn ra vô cùng bùng nổ.',
          negatives: 'Phòng máy bị mất mạng 5 phút đầu giờ gây gián đoạn nhẹ.',
          improvements: 'Chuẩn bị thêm tài liệu tranh ảnh giấy dự phòng nếu phòng máy sự cố kỹ thuật.'
        },
      ];
      setDiaries(initialDiaries);
      localStorage.setItem('teacher_teaching_diaries', JSON.stringify(initialDiaries));
    }
  }, []);

  const saveDiariesToStorage = (newDiaries: TeachingDiary[]) => {
    setDiaries(newDiaries);
    localStorage.setItem('teacher_teaching_diaries', JSON.stringify(newDiaries));
  };

  // Form states for diary creation
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newClass, setNewClass] = useState('Lớp 3.1');
  const [newLesson, setNewLesson] = useState('');
  const [newStudentCount, setNewStudentCount] = useState('32/32');
  const [newPositives, setNewPositives] = useState('');
  const [newNegatives, setNewNegatives] = useState('');
  const [newImprovements, setNewImprovements] = useState('');
  const [newBgColor, setNewBgColor] = useState('bg-white');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newEmbedLink, setNewEmbedLink] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Profile Edit fields states
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.trim()) return;

    if (editingId) {
      const updated = diaries.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            date: newDate,
            className: newClass,
            lessonName: newLesson,
            studentCount: newStudentCount,
            positives: newPositives,
            negatives: newNegatives,
            improvements: newImprovements,
            bgColor: newBgColor,
            imageUrl: newImageUrl,
            embedLink: newEmbedLink
          };
        }
        return item;
      });
      saveDiariesToStorage(updated);
      setEditingId(null);
    } else {
      const newEntry: TeachingDiary = {
        id: `diary_${Date.now()}`,
        date: newDate,
        className: newClass,
        lessonName: newLesson,
        studentCount: newStudentCount,
        positives: newPositives,
        negatives: newNegatives,
        improvements: newImprovements,
        bgColor: newBgColor,
        imageUrl: newImageUrl,
        embedLink: newEmbedLink
      };
      saveDiariesToStorage([newEntry, ...diaries]);
    }

    // Reset inputs
    setNewLesson('');
    setNewPositives('');
    setNewNegatives('');
    setNewImprovements('');
    setNewBgColor('bg-white');
    setNewImageUrl('');
    setNewEmbedLink('');
  };

  const handleEditClick = (diary: TeachingDiary) => {
    setEditingId(diary.id);
    setNewDate(diary.date);
    setNewClass(diary.className);
    setNewLesson(diary.lessonName);
    setNewStudentCount(diary.studentCount);
    setNewPositives(diary.positives || '');
    setNewNegatives(diary.negatives || '');
    setNewImprovements(diary.improvements || '');
    setNewBgColor(diary.bgColor || 'bg-white');
    setNewImageUrl(diary.imageUrl || '');
    setNewEmbedLink(diary.embedLink || '');
    // Smooth transition scroll
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteDiary = (id: string) => {
    const filtered = diaries.filter(d => d.id !== id);
    saveDiariesToStorage(filtered);
    if (deleteConfirmId === id) {
      setDeleteConfirmId(null);
    }
  };

  const handleClearAllSubmissions = (examId: string, confirmed = false) => {
    if (!confirmed) {
      setExamIdToClearAll(examId);
      return;
    }
    const fullList = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    const targetExam = fullList.find((e: any) => e.id === examId);
    if (targetExam && targetExam.submissions && targetExam.submissions.length > 0) {
      const updatedBackup = { ...deletedSubmissionsBackup, [examId]: targetExam.submissions };
      setDeletedSubmissionsBackup(updatedBackup);
      try {
        localStorage.setItem('lms_deleted_submissions_backup', JSON.stringify(updatedBackup));
      } catch (e) {}
    }
    const savedList = fullList.map((e: any) => {
      if (e.id === examId) {
        return { ...e, submissions: [] };
      }
      return e;
    });
    localStorage.setItem('lms_custom_exams', JSON.stringify(savedList));
    setAdminOnlineExams(savedList);
    if (selectedAdminExam?.id === examId) {
      setSelectedAdminExam({ ...selectedAdminExam, submissions: [] });
    }

    // Sync with backend server
    try {
      fetch(`/api/exams/${examId}/clear-submissions`, { method: 'POST' }).catch(() => {});
    } catch (e) {}

    triggerToast("🧹 Đã xóa tất cả lượt nộp bài của đề thi!");
    setExamIdToClearAll(null);
  };

  const handleUndoClearAllSubmissions = (examId: string) => {
    const backup = deletedSubmissionsBackup[examId];
    if (!backup || backup.length === 0) {
      triggerToast("⚠️ Không có dữ liệu bài nộp nào để hoàn tác!");
      return;
    }
    const fullList = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
    const savedList = fullList.map((e: any) => {
      if (e.id === examId) {
        return { ...e, submissions: backup };
      }
      return e;
    });
    localStorage.setItem('lms_custom_exams', JSON.stringify(savedList));
    setAdminOnlineExams(savedList);
    if (selectedAdminExam?.id === examId) {
      setSelectedAdminExam({ ...selectedAdminExam, submissions: backup });
    }

    // Sync with backend server
    try {
      fetch(`/api/exams/${examId}/restore-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: backup })
      }).catch(() => {});
    } catch (e) {}

    const updatedBackup = { ...deletedSubmissionsBackup };
    delete updatedBackup[examId];
    setDeletedSubmissionsBackup(updatedBackup);
    try {
      localStorage.setItem('lms_deleted_submissions_backup', JSON.stringify(updatedBackup));
    } catch (e) {}
    triggerToast("↩️ Đã hoàn tác và khôi phục lại các lượt nộp bài!");
  };

  return (
    <div className="space-y-6 text-left pb-16 animate-fade-in">
      
      {/* Dynamic welcome frame with gradient decoration style */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-[#2454A6] text-white p-6 rounded-[32px] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 text-left">
          <div className="bg-amber-400 text-slate-900 text-[10px] px-3 py-0.5 rounded-full font-black uppercase inline-block border border-amber-300 tracking-wider">
            👩‍🏫 HỒ SƠ GIÁO VIÊN TIỂU HỌC
          </div>
          <h2 className="text-2.5xl md:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-title)' }}>
            Hệ thống Nghiệp vụ Sư phạm Thầy Cô
          </h2>
          <p className="text-xs text-indigo-100 font-semibold max-w-2xl leading-relaxed">
            Xem hồ sơ giảng dạy cá nhân và ghi chú nhật ký sư phạm sau mỗi tiết học giúp tích lũy kỹ năng và tự phản hồi phương pháp giảng dạy tốt nhất.
          </p>
        </div>
        <span className="text-5.5xl select-none animate-pulse">👩‍🏫📔</span>
      </div>

      {/* Styled toggle switch tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-[#2454A6] text-white shadow-md'
              : 'text-gray-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveSubTab('homeroom')}
          className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'homeroom'
              ? 'bg-[#2454A6] text-white shadow-md'
              : 'text-gray-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Lớp chủ nhiệm
        </button>
        <button
          onClick={() => setActiveSubTab('diary')}
          className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'diary'
              ? 'bg-[#2454A6] text-white shadow-md'
              : 'text-gray-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Nhật ký giảng dạy
        </button>
        <button
          onClick={() => setActiveSubTab('online_exams')}
          className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'online_exams'
              ? 'bg-[#2454A6] text-white shadow-md'
              : 'text-gray-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          Đề thi Online
        </button>
      </div>

      {/* RENDER PROFILE SUB-TAB */}
      {activeSubTab === 'profile' && !isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card Left: Avatar Banner & ID Badge */}
          <div className="bg-white rounded-[28px] p-6 border border-slate-150 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-indigo-50 border-4 border-indigo-200 flex items-center justify-center text-5xl shadow-inner select-none animate-bounce">
                {matchedTeacher.gender === 'Nữ' ? '👩‍🏫' : '👨‍🏫'}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                <CheckCircle className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800" style={{ fontFamily: 'var(--font-title)' }}>
                {matchedTeacher.fullname}
              </h3>
              <p className="text-xs font-bold text-[#2454A6] bg-slate-100 px-3 py-1 rounded-full inline-block">
                Mã định danh: {matchedTeacher.teacherId}
              </p>
            </div>

            <div className="w-full border-t border-dashed border-gray-150 pt-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="text-gray-400 font-extrabold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-505" /> Giới tính:
                </span>
                <span className="text-slate-800 font-black">{matchedTeacher.gender}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="text-gray-400 font-extrabold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-505" /> Đặc khu:
                </span>
                <span className="text-slate-800 font-black text-right truncate max-w-[160px]" title={matchedTeacher.district}>
                  {matchedTeacher.district || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="text-gray-400 font-extrabold flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-505" /> Trường học:
                </span>
                <span className="text-slate-800 font-black text-right truncate max-w-[160px]" title={matchedTeacher.school}>
                  {matchedTeacher.school}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="text-gray-400 font-extrabold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-505" /> Bộ môn:
                </span>
                <span className="text-slate-850 font-black">{matchedTeacher.subject}</span>
              </div>
            </div>
          </div>

          {/* Card Right: Academic Management List (Phân công đứng lớp) */}
          <div className="lg:col-span-2 bg-white rounded-[28px] p-6 border border-slate-150 shadow-sm space-y-5 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Nhiệm vụ đào tạo và Phân công chuyên môn
              </h3>
              <button
                onClick={handleStartEdit}
                className="px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh sửa thông tin
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box: Khối lớp phụ trách */}
              <div className="bg-[#F8FAFC] border border-slate-150 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                  📚 Khối lớp giảng dạy
                </span>
                <div className="flex flex-wrap gap-2">
                  {matchedTeacher.grades.map(grade => (
                    <span 
                      key={grade} 
                      className="bg-indigo-50 text-indigo-700 text-xs font-black px-3.5 py-1.5 rounded-xl border border-indigo-150 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                      Khối Lớp {grade}
                    </span>
                  ))}
                </div>
              </div>

              {/* Box: Các lớp phụ trách */}
              <div className="bg-[#F8FAFC] border border-slate-150 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                  🏫 Lớp chủ nhiệm / giảng dạy
                </span>
                <div className="flex flex-wrap gap-2">
                  {matchedTeacher.classes.map(cls => (
                    <span 
                      key={cls} 
                      className="bg-emerald-50 text-emerald-700 text-xs font-black px-3.5 py-1.5 rounded-xl border border-emerald-150 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-505" />
                      Lớp {cls}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Achievement / Stats blocks */}
            <div className="border border-slate-100 rounded-2xl p-4.5 bg-[#FEF9C3]/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 text-slate-900 p-2.5 rounded-xl shadow">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900">Chiến dịch thi đua xuất sắc</h4>
                  <p className="text-[11px] text-amber-700 font-bold leading-tight">
                    Đã hoàn thành xuất sắc khóa Tập huấn Bồi dưỡng Giáo viên Công nghệ số 2345 toàn quốc.
                  </p>
                </div>
              </div>
              <span className="text-xl">🏆</span>
            </div>

            {/* Pedogogical Quote */}
            <div className="italic text-xs text-gray-500 bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
              "Người thầy tốt là người biết khơi nguồn cảm hứng và giúp học sinh kết hợp hài hòa giữa tri thức lý thuyết và thực tiễn đời sống một cách đầy sáng tạo."
            </div>
          </div>

        </div>
      )}

      {/* RENDER PROFILE EDIT FORM SUB-TAB */}
      {activeSubTab === 'profile' && isEditing && (
        <div className="bg-white rounded-[28px] p-6 border border-slate-150 shadow-sm space-y-6 text-left animate-fade-in">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Chỉnh sửa thông tin cá nhân Giáo viên
              </h3>
              <p className="text-xs text-zinc-500 font-semibold mt-1">
                Quản lý hồ sơ giảng dạy và thiết lập API Key Gemini cá nhân độc lập.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#2454A6] hover:bg-[#1a3f80] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition animate-pulse"
              >
                <Save className="w-4 h-4" />
                Lưu hồ sơ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1.5 font-black text-slate-700">Họ và tên thầy cô <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={editForm.fullname || ''}
                onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white"
                placeholder="VD: Cô Hồng Nhung 🌸"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-black text-slate-700">Mã định danh Giáo viên</label>
              <input
                type="text"
                value={editForm.teacherId || ''}
                onChange={(e) => setEditForm({ ...editForm, teacherId: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white"
                placeholder="VD: GV00001"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-black text-slate-700">Giới tính</label>
              <select
                value={editForm.gender || 'Nữ'}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white"
              >
                <option value="Nữ">Nữ 👩‍🏫</option>
                <option value="Nam">Nam 👨‍🏫</option>
                <option value="Khác">Khác 🧑‍🏫</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-black text-slate-700">Đặc khu (xã, huyện)</label>
              <input
                type="text"
                value={editForm.district || ''}
                onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white text-xs"
                placeholder="VD: Ủy ban nhân dân Quận 1"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-black text-slate-700">Trường tiểu học công tác</label>
              <select
                value={editForm.school || ''}
                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white text-xs"
              >
                {schoolsRegistry.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-black text-slate-700">Bộ môn giảng dạy chính</label>
              <select
                value={editForm.subject || ''}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white text-xs"
              >
                {subjectsRegistry.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-black text-slate-700">
                Lớp phụ trách / Giảng dạy (Chọn lớp theo Khối đã tích)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold flex justify-between items-center text-left text-xs text-slate-800"
                >
                  <span className="truncate">
                    {Array.isArray(editForm.classes) && editForm.classes.length > 0 
                      ? editForm.classes.map(c => `Lớp ${c}`).join(', ') 
                      : 'Chọn lớp phụ trách...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
                
                {isClassDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-slate-250 rounded-xl shadow-2xl z-50 p-2.5 space-y-1">
                    {((editForm.grades || []).flatMap(g => classesByGradeRegistry[g] || [])).length === 0 ? (
                      <p className="text-[10px] text-slate-400 p-2 italic font-medium">Hãy chọn ít nhất một Khối lớp ở dưới trước!</p>
                    ) : (
                      (editForm.grades || []).flatMap(g => classesByGradeRegistry[g] || []).map(clsName => {
                        const isSelected = Array.isArray(editForm.classes) && editForm.classes.includes(clsName);
                        return (
                          <label
                            key={clsName}
                            className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-lg cursor-pointer select-none text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const classesArr = Array.isArray(editForm.classes) ? editForm.classes : [];
                                const updatedClasses = isSelected
                                  ? classesArr.filter(c => c !== clsName)
                                  : [...classesArr, clsName].sort();
                                setEditForm({ ...editForm, classes: updatedClasses });
                              }}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 border-slate-300"
                            />
                            <span className="font-extrabold text-slate-800">Lớp {clsName}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-405 font-medium mt-1 block">Sổ xuống các lớp tương ứng với khối học tích ở dưới</span>
            </div>

            <div className="md:col-span-2 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100">
              <label className="block mb-1.5 font-black text-indigo-900 flex flex-wrap justify-between items-center text-xs gap-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  Cài đặt Gemini API Key cá nhân (Sử dụng AI ổn định, mượt mà)
                </span>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] text-[#2454A6] hover:text-indigo-950 hover:underline font-extrabold inline-flex items-center gap-0.5 bg-indigo-100/80 px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  Lấy Khóa API Miễn Phí (Google AI Studio) ↗
                </a>
              </label>
              <input
                type="text"
                value={editForm.geminiApiKey || ''}
                onChange={(e) => setEditForm({ ...editForm, geminiApiKey: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-indigo-400 text-xs"
                placeholder="Cung cấp khóa API Gemini của riêng thầy/cô (ví dụ: AIzaSy...)"
              />
              <p className="text-[11px] text-indigo-600/80 font-semibold mt-1.5 leading-relaxed flex flex-wrap items-center gap-1">
                <span>* Khóa API này chỉ lưu trữ tại trình duyệt riêng trên thiết bị này của thầy cô. Khi soạn kế hoạch bài dạy bằng AI, hệ thống sẽ ưu tiên dùng khóa này của thầy cô để tránh nghẽn mạng chung.</span>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-700 hover:text-indigo-950 hover:underline font-extrabold inline-flex items-center gap-0.5 bg-indigo-100/60 px-1.5 py-0.5 rounded ml-1"
                >
                  Lấy Khóa API Miễn Phí (Google AI Studio) ↗
                </a>
              </p>
            </div>

            <div className="md:col-span-2 border-t border-slate-100 pt-4">
              <label className="block mb-2 font-black text-slate-700">Khối lớp phụ trách giảng dạy</label>
              <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl">
                {gradesList.map((g) => {
                  const isChecked = editForm.grades.includes(g);
                  return (
                    <label key={g} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const nextGrades = isChecked
                            ? editForm.grades.filter(x => x !== g)
                            : [...editForm.grades, g].sort();
                          setEditForm({ ...editForm, grades: nextGrades });
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 border-slate-300"
                      />
                      <span className="text-xs font-black">Khối Lớp {g}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl cursor-pointer text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-6 py-2.5 bg-[#2454A6] hover:bg-[#1a3f80] text-white font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md text-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu thay đổi hồ sơ
            </button>
          </div>
        </div>
      )}

      {/* RENDER HOMEROOM CLASS SUB-TAB */}
      {activeSubTab === 'homeroom' && (() => {
        const assignedClass = profile.homeroomClass || 
          matchedTeacher.homeroomClass || 
          (Array.isArray(profile.classes) && profile.classes[0]) || 
          '3.1';
        
        const effectiveClass = activeHomeroomClass || assignedClass;
        const gradeMatch = effectiveClass.match(/^([1-5])/);
        const effectiveGrade = gradeMatch ? Number(gradeMatch[1]) : (profile.homeroomGrade || profile.grades?.[0] || 3);

        // Filter students in this class
        let classStudents = homeroomStudents.filter(s => {
          const sClass = (s.className || '').trim().toLowerCase();
          const targetClass = effectiveClass.trim().toLowerCase();
          return sClass === targetClass || sClass === `lớp ${targetClass}` || sClass.replace(/^lớp\s*/i, '') === targetClass.replace(/^lớp\s*/i, '');
        });

        // Fallback if none match
        if (classStudents.length === 0) {
          classStudents = homeroomStudents.filter(s => Number(s.grade) === effectiveGrade);
        }
        if (classStudents.length === 0) {
          classStudents = homeroomStudents;
        }

        const totalStudents = classStudents.length;
        const maleCount = classStudents.filter(s => s.gender === 'Nam').length;
        const femaleCount = classStudents.filter(s => s.gender === 'Nữ').length;
        
        const avgScore = totalStudents > 0
          ? (classStudents.reduce((sum, s) => sum + (Number(s.avgScore) || Number(s.score) || 8.0), 0) / totalStudents)
          : 0;

        const passedCount = classStudents.filter(s => (Number(s.avgScore) || Number(s.score) || 8.0) >= 7.0).length;
        const completionRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 100;

        const totalStars = classStudents.reduce((sum, s) => sum + (Number(s.stars) || Math.floor((s.xp || 1000) / 70) || 15), 0);

        // Filtered students for display
        const displayedStudents = classStudents.filter(s => {
          if (homeroomGenderFilter !== 'all' && s.gender !== homeroomGenderFilter) return false;
          if (homeroomSearch.trim()) {
            const q = homeroomSearch.toLowerCase();
            return (
              (s.fullname || '').toLowerCase().includes(q) ||
              (s.studentId || '').toLowerCase().includes(q)
            );
          }
          return true;
        });

        const availableClasses = Array.from(new Set([
          assignedClass,
          ...(profile.classes || []),
          ...(matchedTeacher.classes || []),
          '3.1', '3.2', '4.1', '4.2', '5.1', '5.2'
        ])).filter(Boolean);

        return (
          <div className="space-y-6 text-left animate-fade-in">
            {/* Banner: Khối, Tên lớp, Sĩ số, Tên GVCN, Trường */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-[#2454A6] text-white p-6 rounded-[28px] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-slate-900 text-[10px] px-3 py-0.5 rounded-full font-black uppercase tracking-wider border border-amber-300">
                    🎓 LỚP CHỦ NHIỆM: LỚP {effectiveClass}
                  </span>
                  <span className="bg-white/20 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    Niên khóa: 2025 - 2026
                  </span>
                  {availableClasses.length > 1 && (
                    <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-lg">
                      <span className="text-[10px] font-bold">Xem lớp:</span>
                      <select
                        value={effectiveClass || ''}
                        onChange={(e) => setActiveHomeroomClass(e.target.value)}
                        className="bg-transparent text-white text-xs font-black focus:outline-hidden cursor-pointer"
                      >
                        {availableClasses.map(c => (
                          <option key={c} value={c} className="text-slate-900 font-bold">Lớp {c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-title)' }}>
                  Lớp {effectiveClass} • Khối {effectiveGrade}
                </h2>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-indigo-100 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-300" />
                    GVCN: <strong className="text-white">{profile.fullname}</strong> ({profile.teacherId})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-300" />
                    Trường: <strong className="text-white">{profile.school}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    Sĩ số: <strong className="text-white">{totalStudents}</strong> học sinh ({maleCount} Nam, {femaleCount} Nữ)
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-4xl shadow-inner select-none">
                🏫
              </div>
            </div>

            {/* 4 THẺ THỐNG KÊ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Tổng số học sinh */}
              <div className="bg-white p-5 rounded-[22px] border border-slate-150 shadow-xs flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black shrink-0">
                  👥
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Tổng số học sinh</span>
                  <div className="text-2xl font-black text-slate-900">{totalStudents} <span className="text-xs text-slate-500 font-bold">em</span></div>
                  <p className="text-[11px] text-blue-600 font-bold truncate">
                    {maleCount} Nam • {femaleCount} Nữ
                  </p>
                </div>
              </div>

              {/* Card 2: Điểm TB toàn lớp */}
              <div className="bg-white p-5 rounded-[22px] border border-slate-150 shadow-xs flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-black shrink-0">
                  📊
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Điểm TB toàn lớp</span>
                  <div className="text-2xl font-black text-emerald-700">{avgScore.toFixed(1)} <span className="text-xs text-slate-400 font-bold">/ 10</span></div>
                  <p className="text-[11px] text-emerald-600 font-bold truncate">
                    Xếp loại: Xuất sắc
                  </p>
                </div>
              </div>

              {/* Card 3: Tỷ lệ hoàn thành nhiệm vụ */}
              <div className="bg-white p-5 rounded-[22px] border border-slate-150 shadow-xs flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black shrink-0">
                  🎯
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Tỷ lệ hoàn thành</span>
                  <div className="text-2xl font-black text-indigo-700">{completionRate}%</div>
                  <p className="text-[11px] text-indigo-600 font-bold truncate">
                    {passedCount}/{totalStudents} đạt chuẩn học tập
                  </p>
                </div>
              </div>

              {/* Card 4: Tổng sao / Khen thưởng */}
              <div className="bg-white p-5 rounded-[22px] border border-slate-150 shadow-xs flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-black shrink-0">
                  🌟
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Tổng sao tích lũy</span>
                  <div className="text-2xl font-black text-amber-600">{totalStars} <span className="text-xs text-slate-400 font-bold">⭐</span></div>
                  <p className="text-[11px] text-amber-600 font-bold truncate">
                    Phong trào thi đua tốt
                  </p>
                </div>
              </div>

            </div>

            {/* Ô TÌM KIẾM HỌC SINH & BỘ LỌC */}
            <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh theo Mã HS, Họ và tên..."
                    value={homeroomSearch || ''}
                    onChange={(e) => setHomeroomSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={homeroomGenderFilter || 'all'}
                  onChange={(e) => setHomeroomGenderFilter(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="all">Tất cả giới tính</option>
                  <option value="Nam">Học sinh Nam</option>
                  <option value="Nữ">Học sinh Nữ</option>
                </select>
              </div>

              {(homeroomSearch || homeroomGenderFilter !== 'all') && (
                <button
                  onClick={() => {
                    setHomeroomSearch('');
                    setHomeroomGenderFilter('all');
                  }}
                  className="px-3 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition cursor-pointer shrink-0"
                >
                  Xóa bộ lọc ×
                </button>
              )}
            </div>

            {/* BẢNG DANH SÁCH HỌC SINH */}
            <div className="bg-white rounded-[24px] border border-slate-150 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase border-b border-slate-150 text-[10px] tracking-wider">
                      <th className="py-3.5 px-3 text-center w-12">STT</th>
                      <th className="py-3.5 px-3">Mã định danh (ID)</th>
                      <th className="py-3.5 px-3 text-center">Giới tính</th>
                      <th className="py-3.5 px-3">Họ và tên</th>
                      <th className="py-3.5 px-3">Ngày sinh</th>
                      <th className="py-3.5 px-3">Tên đăng nhập</th>
                      <th className="py-3.5 px-3">Mật khẩu</th>
                      <th className="py-3.5 px-3">Ghi chú</th>
                      <th className="py-3.5 px-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-bold">
                    {displayedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400 italic font-semibold">
                          Không tìm thấy học sinh nào trong Lớp {effectiveClass} khớp với tìm kiếm!
                        </td>
                      </tr>
                    ) : (
                      displayedStudents.map((stu: any, idx: number) => {
                        return (
                          <tr key={stu.id || stu.studentId || idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 text-center text-slate-400 font-extrabold text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-indigo-700 text-[11px]">
                              {stu.studentId || stu.id || `HS${1000 + idx + 1}`}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                stu.gender === 'Nam'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-pink-50 text-pink-700 border border-pink-200'
                              }`}>
                                {stu.gender === 'Nam' ? '👦 Nam' : '👧 Nữ'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-black text-slate-900 block">{stu.fullname}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-medium text-[11px]">
                              {stu.birthDate || '15/05/2016'}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-700 text-[11px]">
                              {stu.username || `hocsinh_${stu.studentId || idx + 1}`}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold">
                                {stu.password || '123456'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-[11px] max-w-[160px] truncate" title={stu.notes || stu.note || ''}>
                              {stu.notes || stu.note || '—'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedStudentForDetail(stu)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                  title="Xem chi tiết học sinh"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setSelectedStudentForEdit(JSON.parse(JSON.stringify(stu)))}
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition cursor-pointer"
                                  title="Chỉnh sửa thông tin học sinh"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setStudentToDelete(stu)}
                                  className="px-2.5 py-1 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1"
                                  title="Xóa học sinh khỏi danh sách lớp"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL XEM CHI TIẾT HỌC SINH */}
            {selectedStudentForDetail && (
              <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedStudentForDetail.gender === 'Nam' ? '👦' : '👧'}</span>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{selectedStudentForDetail.fullname}</h4>
                        <p className="text-[10px] text-slate-400 font-bold font-mono">Mã HS: {selectedStudentForDetail.studentId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStudentForDetail(null)}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-bold">Lớp chủ nhiệm:</span>
                      <strong className="text-slate-800">Lớp {selectedStudentForDetail.className || effectiveClass}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-bold">Ngày sinh:</span>
                      <strong className="text-slate-800">{selectedStudentForDetail.birthDate || '15/05/2016'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-bold">Giới tính:</span>
                      <strong className="text-slate-800">{selectedStudentForDetail.gender}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-bold">Điểm trung bình:</span>
                      <strong className="text-emerald-700 text-sm font-black">
                        {(Number(selectedStudentForDetail.avgScore) || Number(selectedStudentForDetail.score) || 8.0).toFixed(1)} / 10
                      </strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-bold">Số sao khen thưởng:</span>
                      <strong className="text-amber-600 font-black">
                        ⭐ {Number(selectedStudentForDetail.stars) || Math.floor((selectedStudentForDetail.xp || 1000) / 70) || 15} sao
                      </strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-bold">Điểm XP tích lũy:</span>
                      <strong className="text-indigo-600 font-black">{selectedStudentForDetail.xp || 1250} XP</strong>
                    </div>
                    <div className="py-2">
                      <span className="text-slate-400 font-bold block mb-1">Ghi chú nhận xét của GVCN:</span>
                      <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 italic leading-relaxed">
                        {selectedStudentForDetail.note || 'Học sinh ngoan ngoãn, hoàn thành tốt nhiệm vụ học tập trên lớp, chấp hành nghiêm chỉnh nội quy trường học.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedStudentForDetail(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs transition cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL CHỈNH SỬA THÔNG TIN HỌC SINH */}
            {selectedStudentForEdit && (
              <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-indigo-600" />
                      Chỉnh sửa thông tin học sinh
                    </h4>
                    <button
                      onClick={() => setSelectedStudentForEdit(null)}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const updated = {
                        ...selectedStudentForEdit,
                        avgScore: Number(selectedStudentForEdit.avgScore) || 8.0,
                        stars: Number(selectedStudentForEdit.stars) || 15
                      };
                      const nextList = homeroomStudents.map((s: any) => {
                        if (s.id === updated.id || s.studentId === updated.studentId) {
                          return { ...s, ...updated };
                        }
                        return s;
                      });
                      setHomeroomStudents(nextList);
                      try {
                        localStorage.setItem('lms_students_list', JSON.stringify(nextList));
                        window.dispatchEvent(new CustomEvent('lms_settings_changed'));
                      } catch (err) {}
                      setSelectedStudentForEdit(null);
                      triggerToast(`✅ Đã cập nhật thành công thông tin học sinh "${updated.fullname}"!`);
                    }}
                    className="space-y-3.5 text-xs font-bold text-slate-700"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Mã học sinh (ID)</label>
                        <input
                          type="text"
                          value={selectedStudentForEdit.studentId || ''}
                          onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, studentId: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Tên đăng nhập</label>
                        <input
                          type="text"
                          value={selectedStudentForEdit.username || ''}
                          onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, username: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Họ và tên học sinh *</label>
                        <input
                          type="text"
                          required
                          value={selectedStudentForEdit.fullname || ''}
                          onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, fullname: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Mật khẩu</label>
                        <input
                          type="text"
                          value={selectedStudentForEdit.password || ''}
                          onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, password: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Ngày sinh</label>
                        <input
                          type="text"
                          placeholder="dd/mm/yyyy"
                          value={selectedStudentForEdit.birthDate || ''}
                          onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, birthDate: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Giới tính</label>
                        <select
                          value={selectedStudentForEdit.gender || 'Nam'}
                          onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, gender: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Điểm TB (0-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={selectedStudentForEdit.avgScore !== undefined ? selectedStudentForEdit.avgScore : 8.0}
                        onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, avgScore: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 uppercase text-[10px] font-black mb-1">Ghi chú / Nhận xét của GVCN</label>
                      <textarea
                        rows={2}
                        value={selectedStudentForEdit.note || ''}
                        onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, note: e.target.value })}
                        placeholder="Nhập nhận xét thái độ, rèn luyện của học sinh..."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForEdit(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#2454A6] hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Lưu thông tin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL XÁC NHẬN XÓA HỌC SINH */}
            {studentToDelete && (
              <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                    🗑️
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Xóa học sinh khỏi lớp?</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Thầy Cô có chắc chắn muốn xóa em <strong className="text-slate-800">{studentToDelete.fullname}</strong> ({studentToDelete.studentId}) khỏi danh sách lớp {effectiveClass}?
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      onClick={() => setStudentToDelete(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={() => {
                        const target = studentToDelete;
                        const nextList = homeroomStudents.filter((s: any) => s.id !== target.id && s.studentId !== target.studentId);
                        setHomeroomStudents(nextList);
                        try {
                          localStorage.setItem('lms_students_list', JSON.stringify(nextList));
                          window.dispatchEvent(new CustomEvent('lms_settings_changed'));
                        } catch (err) {}
                        setStudentToDelete(null);
                        triggerToast(`🗑️ Đã xóa học sinh "${target.fullname}" khỏi danh sách!`);
                      }}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs cursor-pointer transition shadow-xs"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* RENDER DIARY SUB-TAB */}
      {activeSubTab === 'diary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Create Note (Column Left) */}
          <div className="lg:col-span-5 bg-white rounded-[28px] p-5 border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-md font-black text-slate-800 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
              <FileText className="w-4.5 h-4.5 text-[#2454A6]" />
              {editingId ? 'Cập Nhật Nhật Ký Giảng Dạy' : 'Viết Nhật Ký Tiết Học'}
            </h3>

            <form onSubmit={handleAddDiary} className="space-y-3 text-xs font-bold text-slate-700">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-black">Ngày dạy</label>
                  <input
                    type="date"
                    value={newDate || ''}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-black">Lớp học</label>
                  <select
                    value={newClass || ''}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white"
                  >
                    {matchedTeacher.classes.map(c => (
                      <option key={c} value={`Lớp ${c}`}>Lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-black">Sĩ số (Có mặt/Vắng)</label>
                  <input
                    type="text"
                    value={newStudentCount || ''}
                    onChange={(e) => setNewStudentCount(e.target.value)}
                    placeholder="VD: 32/32"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-black">Môn dạy</label>
                  <input
                    type="text"
                    disabled
                    value={matchedTeacher.subject || ''}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-black">Tên bài học <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newLesson || ''}
                  onChange={(e) => setNewLesson(e.target.value)}
                  placeholder="VD: Bài 1: Thông tin và quyết định (Tiết 1)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white focus:border-[#2454A6]"
                />
              </div>

              <div>
                <label className="block mb-1 font-black text-emerald-800">✅ Ưu điểm (Điểm sáng buổi học)</label>
                <textarea
                  value={newPositives || ''}
                  onChange={(e) => setNewPositives(e.target.value)}
                  placeholder="Học sinh tập trung, tích cực, tổ chức trò chơi rất hào hứng..."
                  className="w-full h-18 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:bg-white focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-black text-rose-800">❌ Điểm hạn chế (Nếu có)</label>
                <textarea
                  value={newNegatives || ''}
                  onChange={(e) => setNewNegatives(e.target.value)}
                  placeholder="Một vài em nhỏ chưa làm chủ được thao tác vẽ máy hình..."
                  className="w-full h-18 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:bg-white focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-black text-indigo-800">💡 Giải pháp điều chỉnh cải tiến</label>
                <textarea
                  value={newImprovements || ''}
                  onChange={(e) => setNewImprovements(e.target.value)}
                  placeholder="Sắp xếp cán sự tin học kèm các em yếu trong tiết thực hành sau..."
                  className="w-full h-18 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:bg-white focus:border-[#2454A6] resize-none"
                />
              </div>

              {/* Color, Image, and Link selection custom area */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-3.5">
                <div>
                  <span className="block mb-1.5 font-bold text-slate-700">🎨 Chọn màu nền bài viết</span>
                  <div className="flex gap-2.5">
                    {[
                      { bg: 'bg-white', border: 'border-slate-300', label: 'Trắng' },
                      { bg: 'bg-emerald-50/70', border: 'border-emerald-200', label: 'Lá' },
                      { bg: 'bg-rose-50/70', border: 'border-rose-200', label: 'Đào' },
                      { bg: 'bg-blue-50/70', border: 'border-blue-200', label: 'Biển' },
                      { bg: 'bg-amber-50/70', border: 'border-amber-200', label: 'Vàng' },
                      { bg: 'bg-violet-50/70', border: 'border-violet-200', label: 'Tím' },
                    ].map((opt) => (
                      <button
                        key={opt.bg}
                        type="button"
                        onClick={() => setNewBgColor(opt.bg)}
                        title={opt.label}
                        className={`w-7 h-7 rounded-full ${opt.bg} ${opt.border} border-2 relative flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 ${newBgColor === opt.bg ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                      >
                        {newBgColor === opt.bg && <span className="text-[10px] text-slate-800">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700">🖼️ Đính kèm hình ảnh</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setNewImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-[#2454A6]/10 file:text-[#2454A6] hover:file:bg-[#2454A6]/20 file:cursor-pointer"
                    />
                    {newImageUrl && (
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('')}
                        className="text-rose-500 hover:text-rose-600 font-bold text-[10px] shrink-0"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                  {newImageUrl && (
                    <div className="mt-2 relative border border-slate-200 rounded-xl overflow-hidden max-h-[100px] w-24 bg-white">
                      <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700">🔗 Nhúng Link (Hình ảnh hoặc Video)</label>
                  <input
                    type="url"
                    value={newEmbedLink || ''}
                    onChange={(e) => setNewEmbedLink(e.target.value)}
                    placeholder="https://example.com/illustration.png hoặc link Youtube..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#2454A6] text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setNewLesson('');
                      setNewPositives('');
                      setNewNegatives('');
                      setNewImprovements('');
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2454A6] hover:bg-[#1a3f80] text-white font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Cập nhật nhật ký' : 'Lưu vào nhật ký'}
                </button>
              </div>

            </form>
          </div>

          {/* List Diaries Logs (Column Right) */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-5 border border-slate-150 shadow-sm space-y-4 max-h-[660px] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-md font-black text-slate-800 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-title)' }}>
                📓 Sổ Nhật Ký Giảng Dạy ({diaries.length})
              </span>
              <span className="text-[10px] bg-indigo-50 text-[#2454A6] font-black px-2.5 py-1 rounded-full border border-indigo-150">
                Lưu trữ trình duyệt
              </span>
            </div>

            {diaries.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <span className="text-4xl block">🎑</span>
                <p className="text-xs font-black">Chưa có nhật ký nào được ghi lại</p>
                <p className="text-[11px] font-medium max-w-xs mx-auto">Thầy Cô vui lòng ghi lại tiến độ giảng dạy và nội dung cần khắc phục để củng cố chuyên môn nhé!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {diaries.map(diary => (
                  <div 
                    key={diary.id}
                    className={`border border-slate-155 rounded-2xl p-4 space-y-3 hover:shadow-md transition relative text-xs ${diary.bgColor || 'bg-slate-50'}`}
                  >
                    
                    {/* Action header buttons */}
                    <div className="absolute right-3 top-3.5 flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(diary)}
                        className="p-1.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                        title="Chỉnh sửa nhật ký"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      
                      {deleteConfirmId === diary.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 border border-rose-200 rounded-xl animate-pulse">
                          <button
                            type="button"
                            onClick={() => handleDeleteDiary(diary.id)}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-sm"
                          >
                            Xóa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(diary.id)}
                          className="p-1.5 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Xóa nhật ký"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Metadata Header line */}
                    <div className="flex flex-wrap gap-2 items-center text-[11px] font-bold text-gray-500 text-left">
                      <span className="bg-white border rounded-lg px-2 py-0.5">{diary.date}</span>
                      <span className="bg-[#E1F2FF] text-[#2454A6] rounded-lg px-2.5 py-0.5 font-black">{diary.className}</span>
                      <span className="bg-[#E6F4EA] text-[#137333] rounded-lg px-2.5 py-0.5 font-black">Sĩ số: {diary.studentCount}</span>
                    </div>

                    <h4 className="font-extrabold text-[#2454A6] text-[13px] text-left leading-normal pr-16" style={{ fontFamily: 'var(--font-title)' }}>
                      {diary.lessonName}
                    </h4>

                    {/* Description Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5 text-[11px] leading-relaxed">
                      
                      <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl text-left space-y-0.5">
                        <span className="font-black text-emerald-800 block uppercase tracking-wide text-[9.5px]">👍 Ưu điểm nổi bật</span>
                        <p className="text-slate-700 font-medium">{diary.positives || 'Không có ghi chú.'}</p>
                      </div>

                      <div className="bg-rose-50/75 border border-rose-100 p-2.5 rounded-xl text-left space-y-0.5">
                        <span className="font-black text-rose-800 block uppercase tracking-wide text-[9.5px]">⚠️ Điểm hạn chế</span>
                        <p className="text-slate-700 font-medium">{diary.negatives || 'Không có ghi chú.'}</p>
                      </div>

                      <div className="bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-xl text-left space-y-0.5">
                        <span className="font-black text-indigo-800 block uppercase tracking-wide text-[9.5px]">💡 Hướng cải tiến</span>
                        <p className="text-slate-700 font-medium">{diary.improvements || 'Không có ghi chú.'}</p>
                      </div>

                    </div>

                    {/* Media Attachments */}
                    {diary.imageUrl && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 shadow-sm max-h-[220px] bg-white">
                        <img 
                          src={diary.imageUrl} 
                          alt="Đính kèm" 
                          className="w-full h-full object-contain max-h-[220px]" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                    )}

                    {diary.embedLink && (
                      <div className="mt-2.5 flex items-center gap-2 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100">
                        <span className="text-sm shrink-0">🔗</span>
                        <div className="text-left truncate">
                          <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wide">Liên kết đính kèm:</span>
                          <a 
                            href={diary.embedLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="block text-[#2454A6] hover:underline font-extrabold text-[10px] truncate"
                          >
                            {diary.embedLink}
                          </a>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* RENDER ONLINE EXAMS SUB-TAB */}
      {activeSubTab === 'online_exams' && (
        <div className="space-y-6">
          
          {/* Header Block */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span>🌐</span> ĐỀ THI ONLINE & CA THI ĐẤU
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Xem danh sách phòng thi đấu, theo dõi trực tuyến điểm số học sinh, chấm điểm thực hành Ngăn 2 và xuất báo cáo kết quả tự động.
              </p>
            </div>
            
            <button
              onClick={() => {
                try {
                  const refreshed = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
                  setAdminOnlineExams(refreshed);
                  triggerToast("🔄 Đã làm mới danh sách phòng thi trực tuyến!");
                } catch (e) {}
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border border-slate-200/80 cursor-pointer transition flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới danh sách
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên đề, môn học..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filter School */}
              <div>
                <select
                  value={filterSchool || 'all'}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">Tất cả Trường học</option>
                  {Array.from(new Set(adminOnlineExams.map(e => e.school).filter(Boolean))).map((sch: any) => (
                    <option key={sch} value={sch}>{sch}</option>
                  ))}
                </select>
              </div>

              {/* Filter Subject */}
              <div>
                <select
                  value={filterSubject || 'all'}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">Tất cả Môn học</option>
                  {Array.from(new Set(adminOnlineExams.map(e => e.subject).filter(Boolean))).map((sub: any) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Filter Class */}
              <div>
                <select
                  value={filterClass || 'all'}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">Tất cả Khối lớp</option>
                  {[3, 4, 5].map((g) => (
                    <option key={g} value={String(g)}>Khối lớp {g}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Clear Filter button if filters are active */}
            {(searchQuery || filterSchool !== 'all' || filterSubject !== 'all' || filterClass !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterSchool('all');
                  setFilterSubject('all');
                  setFilterClass('all');
                  triggerToast("🧹 Đã làm sạch các bộ lọc tìm kiếm!");
                }}
                className="px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-black rounded-lg hover:bg-rose-100 transition cursor-pointer"
              >
                Xóa tất cả bộ lọc ×
              </button>
            )}
          </div>

          {/* Exams List Table */}
          <div className="bg-white rounded-[28px] border border-slate-150 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-slate-400 font-extrabold uppercase border-b border-slate-150 text-[10px] tracking-wider">
                    <th className="py-4 px-4 text-center w-12">STT</th>
                    <th className="py-4 px-4">Tên bài thi & Phòng</th>
                    <th className="py-4 px-4">Môn & Khối</th>
                    <th className="py-4 px-4">Giáo viên</th>
                    <th className="py-4 px-4">Link thi trực tiếp</th>
                    <th className="py-4 px-4 text-center">Thời gian tạo</th>
                    <th className="py-4 px-4 text-center">Số câu</th>
                    <th className="py-4 px-4 text-center">Bài đã nộp</th>
                    <th className="py-4 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-705 font-bold">
                  {(() => {
                    const teacherId = (profile.teacherId || matchedTeacher.teacherId || (currUser as any)?.teacherId || (currUser as any)?.id || '').trim();
                    const teacherFullname = (profile.fullname || matchedTeacher.fullname || currUser?.fullname || '').trim().toLowerCase();
                    const teacherSubject = (profile.subject || matchedTeacher.subject || '').trim().toLowerCase();

                    let filtered = adminOnlineExams.filter((exam: any) => {
                      const isCreator = (exam.creatorId && exam.creatorId === teacherId) ||
                                        (exam.creatorName && exam.creatorName.trim().toLowerCase() === teacherFullname);
                      const isAssigned = Array.isArray(exam.assignedTeacherIds) && (
                        (Boolean(teacherId) && exam.assignedTeacherIds.includes(teacherId)) ||
                        (Boolean((matchedTeacher as any)?.id) && exam.assignedTeacherIds.includes((matchedTeacher as any).id)) ||
                        (Array.isArray(exam.assignedTeacherNames) && Boolean(teacherFullname) && exam.assignedTeacherNames.some((n: string) => n && n.trim().toLowerCase() === teacherFullname))
                      );

                      return isCreator || isAssigned;
                    });
                    
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      filtered = filtered.filter(e => 
                        (e.testName || "").toLowerCase().includes(q) || 
                        (e.subject || "").toLowerCase().includes(q) || 
                        (e.creatorName || "").toLowerCase().includes(q)
                      );
                    }
                    if (filterSchool !== 'all') {
                      filtered = filtered.filter(e => e.school === filterSchool);
                    }
                    if (filterSubject !== 'all') {
                      filtered = filtered.filter(e => e.subject === filterSubject);
                    }
                    if (filterClass !== 'all') {
                      filtered = filtered.filter(e => String(e.grade) === filterClass);
                    }

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400 italic font-semibold text-[13px]">
                            Chưa tìm thấy đề thi trực tuyến nào khớp với tiêu chuẩn tìm kiếm của Thầy Cô!
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((exam: any, idx: number) => {
                      const examLink = `${window.location.origin}${window.location.pathname}?takeExamId=${exam.id}`;
                      const isCreator = (exam.creatorId && exam.creatorId === teacherId) ||
                                        (exam.creatorName && exam.creatorName.trim().toLowerCase() === teacherFullname);
                      const isAssigned = Array.isArray(exam.assignedTeacherIds) && (
                        (Boolean(teacherId) && exam.assignedTeacherIds.includes(teacherId)) ||
                        (Boolean((matchedTeacher as any)?.id) && exam.assignedTeacherIds.includes((matchedTeacher as any).id)) ||
                        (Array.isArray(exam.assignedTeacherNames) && Boolean(teacherFullname) && exam.assignedTeacherNames.some((n: string) => n && n.trim().toLowerCase() === teacherFullname))
                      );

                      return (
                        <tr key={exam.id || idx} className="hover:bg-slate-50/50 transition-colors text-slate-800">
                          
                          <td className="py-3 px-4 text-center text-slate-400 font-extrabold text-[11px]">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="block font-black text-slate-900 leading-snug">{exam.testName || exam.topic}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isCreator && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[9.5px] font-black border border-amber-200">
                                    👑 Người tạo
                                  </span>
                                )}
                                {isAssigned && !isCreator && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[9.5px] font-black border border-purple-200">
                                    🌟 Được phân công chấm
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9.5px] font-black border border-indigo-100 font-mono">
                                  🔑 PHÒNG: {exam.accessCode || 'TỰ DO'}
                                </span>
                                {exam.isPracticalEnabled !== false && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[9.5px] font-black border border-purple-100">
                                    🛠️ NGĂN 2: THỰC HÀNH
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="block text-slate-700 font-extrabold text-[11px]">{exam.subject}</span>
                              <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-extrabold">
                                Lớp {exam.grade}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600 text-[11.5px] font-semibold">
                            {exam.creatorName || matchedTeacher.fullname}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 max-w-xs">
                              <input
                                type="text"
                                readOnly
                                value={examLink || ''}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                className="bg-slate-50 border border-slate-200 text-[10px] font-mono px-2 py-1 rounded-lg w-full truncate text-indigo-900 font-bold"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(examLink);
                                  triggerToast("📋 Đã sao chép link phòng thi trực tuyến!");
                                }}
                                className="p-1 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 font-black text-[9.5px] shrink-0 transition"
                                title="Sao chép"
                              >
                                Sao chép
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-[10.5px] text-slate-400 whitespace-nowrap">
                            {formatExamDateTime(exam)}
                          </td>

                          <td className="py-3 px-4 text-center font-extrabold text-[11.5px] text-slate-700">
                            {(exam.questions || []).length} câu
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedAdminExam(exam);
                                setReportClassFilter('all');
                                setReportScoreFilter('all');
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border tracking-tight transition ${
                                (exam.submissions || []).length > 0
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 cursor-pointer'
                              }`}
                            >
                              {(exam.submissions || []).length} bài
                            </button>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <button
                                onClick={() => {
                                  setSelectedAdminExam(exam);
                                  setReportClassFilter('all');
                                  setReportScoreFilter('all');
                                }}
                                className="px-3 py-1 bg-[#2454A6] hover:bg-indigo-700 text-white font-extrabold text-[10.5px] rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" /> Báo cáo
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* REPORTS MODAL DRAWER OVERLAY */}
          {selectedAdminExam && (
            <div className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fade-in text-left">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 px-6 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">💡 BÁO CÁO KẾT QUẢ DỰ THI TRỰC TUYẾN</span>
                    <h3 className="text-base font-black truncate max-w-2xl text-white">
                      {selectedAdminExam.testName || selectedAdminExam.topic}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAdminExam(null);
                      setGradingSubId(null);
                    }}
                    className="p-1.5 bg-slate-750 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content - Scrollable split panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* LEFT PANEL (Report list, filters, graphs) */}
                    <div className="lg:col-span-7 space-y-5">
                      
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-center">
                          <span className="block text-[10px] uppercase text-blue-600 font-black">Tổng số lượt</span>
                          <strong className="text-xl font-black text-[#1e3a8a]">{(selectedAdminExam.submissions || []).length} bài</strong>
                        </div>
                        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-center">
                          <span className="block text-[10px] uppercase text-emerald-600 font-black">Điểm cao nhất</span>
                          <strong className="text-xl font-black text-emerald-800">
                            {(() => {
                              const subs = selectedAdminExam.submissions || [];
                              if (subs.length === 0) return '---';
                              const scores = subs.map((s: any) => s.score);
                              return Math.max(...scores) + 'đ';
                            })()}
                          </strong>
                        </div>
                        <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl text-center">
                          <span className="block text-[10px] uppercase text-purple-600 font-black">Điểm trung bình</span>
                          <strong className="text-xl font-black text-purple-800">
                            {(() => {
                              const subs = selectedAdminExam.submissions || [];
                              if (subs.length === 0) return '---';
                              const sum = subs.reduce((acc: number, cur: any) => acc + (cur.score || 0), 0);
                              return (sum / subs.length).toFixed(1) + 'đ';
                            })()}
                          </strong>
                        </div>
                      </div>

                      {/* Share Link Info */}
                      <div className="bg-amber-50/75 border border-amber-200 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs leading-relaxed font-bold">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="text-[9.5px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                            <span>🔗</span> Link thi tự do dành cho Học sinh:
                          </div>
                          <div className="font-mono text-[10.5px] text-indigo-950 bg-white border border-amber-200 px-2 py-1 rounded truncate select-all">
                            {`${window.location.origin}${window.location.pathname}?takeExamId=${selectedAdminExam.id}`}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?takeExamId=${selectedAdminExam.id}`);
                            triggerToast("📋 Đã sao chép link thi tự do!");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl font-black text-[10px] transition cursor-pointer shrink-0 text-center animate-pulse"
                        >
                          Sao chép Link
                        </button>
                      </div>

                      {/* Export Options & Report Filters */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9.5px] uppercase font-black text-slate-400 mb-1">🏷️ Lọc theo Lớp</label>
                            <select
                              value={reportClassFilter || 'all'}
                              onChange={(e) => setReportClassFilter(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            >
                              <option value="all">Tất cả các lớp</option>
                              {Array.from(
                                new Set((selectedAdminExam.submissions || []).map((s: any) => s.studentClass).filter(Boolean))
                              ).map((clsname: any) => (
                                <option key={clsname} value={clsname}>Lớp {clsname}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9.5px] uppercase font-black text-slate-400 mb-1">📊 Lọc theo Điểm số</label>
                            <select
                              value={reportScoreFilter || 'all'}
                              onChange={(e) => setReportScoreFilter(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            >
                              <option value="all">Tất cả các điểm</option>
                              <option value="above5">Trên 5 điểm (Từ 5đ trở lên)</option>
                              <option value="below5">Dưới 5 điểm (Dưới 5đ)</option>
                            </select>
                          </div>
                        </div>

                        {/* Export Action Buttons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          <button
                            onClick={() => {
                              try {
                                downloadClassReportWord(selectedAdminExam, reportClassFilter, reportScoreFilter);
                                triggerToast("📊 Đã xuất báo cáo chất lượng Word thành công!");
                              } catch (err: any) {
                                triggerToast(`❌ Lỗi xuất báo cáo: ${err.message}`);
                              }
                            }}
                            className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Xuất Báo cáo
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                await downloadClassSubmissionsWordZip(selectedAdminExam, reportClassFilter);
                                triggerToast("📦 Đã tải tệp ZIP bài nộp Word!");
                              } catch (err: any) {
                                triggerToast(`❌ Lỗi tải ZIP bài nộp: ${err.message}`);
                              }
                            }}
                            className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Xuất File Word
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                triggerToast("⏳ Đang khởi tạo bản chuyển đổi PDF...");
                                await downloadClassSubmissionsPdfZip(selectedAdminExam, reportClassFilter);
                                triggerToast("📦 Đã tải tệp ZIP bài nộp PDF!");
                              } catch (err: any) {
                                triggerToast(`❌ Lỗi tải ZIP bài nộp PDF: ${err.message}`);
                              }
                            }}
                            className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                            title="Xuất File Word kết quả rồi chuyển sang File PDF và tải về"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Xuất File PDF
                          </button>

                          <button
                            onClick={async () => {
                              if (selectedAdminExam) {
                                if (!selectedAdminExam.submissions || selectedAdminExam.submissions.length === 0) {
                                  triggerToast("⚠️ Không có học sinh nào nộp bài để xuất điểm!");
                                  return;
                                }
                                try {
                                  await downloadClassScoresExcel(selectedAdminExam, reportClassFilter);
                                  triggerToast("🟢 Xuất bảng điểm Excel thành công!");
                                } catch (err: any) {
                                  triggerToast(`❌ Lỗi xuất Excel: ${err.message}`);
                                }
                              }
                            }}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                          >
                            🟢 Xuất Điểm (.xlsx)
                          </button>
                        </div>
                      </div>

                      {/* Submissions List Header & Action Toolbar */}
                      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                        <span className="text-[11px] font-black text-slate-700 uppercase">
                          📋 Danh sách bài nộp ({selectedAdminExam.submissions?.length || 0})
                        </span>
                        <div className="flex items-center gap-1.5">
                          {deletedSubmissionsBackup[selectedAdminExam.id] && deletedSubmissionsBackup[selectedAdminExam.id].length > 0 && (
                            <button
                              onClick={() => handleUndoClearAllSubmissions(selectedAdminExam.id)}
                              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10.5px] font-black rounded-xl transition cursor-pointer border border-amber-300 flex items-center gap-1 active:scale-95 shadow-3xs"
                              title="Hoàn tác khôi phục lại các bài nộp đã xóa"
                            >
                              ↩️ Hoàn tác
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Submissions List Table */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs max-h-[305px] overflow-y-auto scrollbar-thin">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/95 backdrop-blur-xs text-slate-500 font-extrabold uppercase border-b border-slate-200 text-[9px] tracking-wider sticky top-0 z-10 shadow-2xs">
                              <th className="py-2.5 px-3 text-center w-12">STT</th>
                              <th className="py-2.5 px-3">Học sinh</th>
                              <th className="py-2.5 px-3">Lớp học</th>
                              <th className="py-2.5 px-3 text-center">Trắc nghiệm</th>
                              <th className="py-2.5 px-3 text-center">Thực hành</th>
                              <th className="py-2.5 px-3 text-center">Tổng điểm</th>
                              <th className="py-2.5 px-3 text-center">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-705 font-bold">
                            {(() => {
                              let subs = selectedAdminExam.submissions || [];
                              if (reportClassFilter !== 'all') {
                                subs = subs.filter((s: any) => s.studentClass === reportClassFilter);
                              }
                              if (reportScoreFilter === 'above5') {
                                subs = subs.filter((s: any) => Number(s.score) >= 5);
                              } else if (reportScoreFilter === 'below5') {
                                subs = subs.filter((s: any) => Number(s.score) < 5);
                              }

                              if (subs.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                      Chưa ghi nhận dữ liệu bài nộp nào từ học sinh khớp bộ lọc!
                                    </td>
                                  </tr>
                                );
                              }

                              return subs.map((sub: any, sIdx: number) => {
                                const isSelectedForGrading = gradingSubId === sub.id;
                                const { theoryScore, totalPracticalScore, totalScore } = getLiveSubScore(sub);
                                return (
                                  <tr key={sub.id || sIdx} className={`hover:bg-slate-50/40 transition-colors ${isSelectedForGrading ? 'bg-indigo-50/40' : ''}`}>
                                    <td className="py-2.5 px-3 text-center text-slate-400 font-extrabold">{sub.studentStt || sIdx + 1}</td>
                                    <td className="py-2.5 px-3 text-slate-900 font-black">{sub.studentName}</td>
                                    <td className="py-2.5 px-3 text-slate-500">{sub.studentClass || 'Tự do'}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-[10px]">{theoryScore.toFixed(1)}đ</td>
                                    <td className="py-2.5 px-3 text-center">
                                      {selectedAdminExam.isPracticalEnabled === false ? (
                                        <span className="text-slate-300">—</span>
                                      ) : sub.totalPracticalScore !== undefined ? (
                                        <span className="px-1.5 py-0.5 rounded-sm bg-purple-50 text-purple-700 text-[10px]">{totalPracticalScore.toFixed(1)}đ</span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 text-[9px] animate-pulse">Chưa chấm</span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className={`px-1.5 py-0.5 rounded-sm text-[10.5px] font-black ${
                                        totalScore >= 8 ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                                        totalScore >= 5 ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                                        'bg-red-50 text-red-700 border border-red-150'
                                      }`}>
                                        {totalScore.toFixed(1)}đ
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <div className="flex items-center gap-1 justify-center">
                                        <button
                                          onClick={() => {
                                            if (gradingSubId === sub.id) {
                                              setGradingSubId(null);
                                            } else {
                                              setGradingSubId(sub.id);
                                              const tempGrades: Record<string, number> = {};
                                              for (let i = 1; i <= 5; i++) {
                                                const pKey = `p-${i}`;
                                                tempGrades[pKey] = Number(sub.answers?.[`practical_score_p-${i}`]) || 0;
                                              }
                                              setTempPracticalGrades(tempGrades);
                                              setTempPracticalImage(sub.answers?.practical_image || '');
                                              setTempPracticalLink(sub.answers?.practical_link || '');
                                              setTempAnswers(sub.answers || {});
                                            }
                                          }}
                                          className={`px-2 py-1 rounded-md text-[9px] font-extrabold border transition ${
                                            isSelectedForGrading
                                              ? 'bg-amber-100 border-amber-300 text-amber-700'
                                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-250 text-emerald-750'
                                          }`}
                                        >
                                          {isSelectedForGrading ? 'Hủy chọn' : 'Chấm điểm'}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>

                    </div>

                    {/* RIGHT PANEL - GRADING INTERFACE */}
                    <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-150 lg:pl-6 pt-5 lg:pt-0">
                      
                      {(() => {
                        if (!gradingSubId) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <span className="text-4xl mb-2 select-none">👩‍🏫</span>
                              <h4 className="font-black text-slate-700 text-sm">Chưa có bài thi nào được chọn</h4>
                              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                                Hãy bấm nút <span className="font-bold text-slate-600">"Chấm điểm"</span> ở danh sách bên trái để tải chi tiết bài làm, kiểm tra hình ảnh minh chứng và cộng điểm thực hành.
                              </p>
                            </div>
                          );
                        }

                        const sub = (selectedAdminExam.submissions || []).find((s: any) => s.id === gradingSubId);
                        if (!sub) return null;

                        const { theoryScore, totalPracticalScore, totalScore } = getLiveSubScore(sub);

                        return (
                          <div className="bg-slate-50 border border-slate-200 rounded-[20px] p-5 space-y-5 h-full overflow-y-auto">
                            
                            <div className="border-b border-slate-250/60 pb-3 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black text-slate-400">CHẤM BÀI CHI TIẾT</span>
                                <span className="text-xs font-black text-indigo-600">Lớp {sub.studentClass || 'Tự do'}</span>
                              </div>
                              <h4 className="text-base font-black text-slate-900 mt-0.5">{sub.studentName}</h4>
                            </div>

                            {/* Live Scores Summary Badge */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center shadow-3xs">
                                <span className="block text-[8px] uppercase font-black text-slate-400">Trắc nghiệm</span>
                                <span className="text-xs font-black text-slate-700">{theoryScore.toFixed(2)}đ</span>
                              </div>
                              <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center shadow-3xs">
                                <span className="block text-[8px] uppercase font-black text-slate-400">Thực hành</span>
                                <span className="text-xs font-black text-purple-700">{totalPracticalScore.toFixed(1)}đ</span>
                              </div>
                              <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center shadow-3xs">
                                <span className="block text-[8px] uppercase font-black text-slate-400">TỔNG ĐIỂM</span>
                                <span className="text-xs font-black text-emerald-700">{totalScore.toFixed(1)}đ</span>
                              </div>
                            </div>

                            {/* Practical Work Review */}
                            {selectedAdminExam.isPracticalEnabled !== false && (
                              <div className="space-y-4">
                                
                                <div className="space-y-1 text-left">
                                  <span className="font-black text-slate-500 uppercase tracking-wide text-[9px] block">📂 Link tệp / Sản phẩm thực hành:</span>
                                  {tempPracticalLink ? (
                                    <a
                                      href={tempPracticalLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block p-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10.5px] font-bold text-indigo-700 hover:underline truncate"
                                    >
                                      🔗 {tempPracticalLink}
                                    </a>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px] block">Học sinh không đính kèm liên kết sản phẩm.</span>
                                  )}
                                </div>

                                {sub.answers?.practical_file && (
                                  <div className="space-y-1 text-left">
                                    <span className="font-black text-slate-500 uppercase tracking-wide text-[9px] block">📊 Tệp bài làm PowerPoint:</span>
                                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xl">📊</span>
                                        <span className="text-xs font-black text-amber-900 truncate">
                                          {sub.answers?.practical_file_name || 'BaiThucHanh.pptx'}
                                        </span>
                                      </div>
                                      <a
                                        href={sub.answers.practical_file}
                                        download={sub.answers?.practical_file_name || 'BaiThucHanh.pptx'}
                                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black transition shadow-2xs shrink-0"
                                      >
                                        📥 Tải về
                                      </a>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-1 text-left">
                                  <span className="font-black text-slate-500 uppercase tracking-wide text-[9px] block">🖼️ Ảnh minh chứng thực hành:</span>
                                  {tempPracticalImage ? (
                                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-3xs bg-white max-h-[160px] flex items-center justify-center">
                                      <img
                                        src={tempPracticalImage}
                                        alt="Minh chứng"
                                        className="max-h-[160px] object-contain w-full"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px] block">Học sinh không chụp ảnh minh chứng thực hành.</span>
                                  )}
                                </div>

                                {/* Grade Inputs */}
                                <div className="space-y-2 bg-white border border-slate-200 p-3 rounded-xl shadow-3xs text-left">
                                  <span className="font-black text-slate-500 uppercase tracking-wide text-[9px] block mb-2">📋 Điểm các tiêu chí thực hành:</span>
                                  {[1, 2, 3, 4, 5].map((idx) => {
                                    const pKey = `p-${idx}`;
                                    return (
                                      <div key={idx} className="flex items-center justify-between text-xs font-bold py-1 border-b border-slate-100 last:border-0">
                                        <span className="text-slate-600">Câu {idx} (Tối đa 1đ)</span>
                                        <input
                                          type="number"
                                          min={0}
                                          max={1}
                                          step={0.25}
                                          value={tempPracticalGrades[pKey] !== undefined ? tempPracticalGrades[pKey] : 0}
                                          onChange={(e) => {
                                            const val = Math.min(1, Math.max(0, Number(e.target.value) || 0));
                                            setTempPracticalGrades(prev => ({ ...prev, [pKey]: val }));
                                          }}
                                          className="w-16 p-1 text-center border border-slate-200 rounded text-xs font-bold font-mono"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>

                              </div>
                            )}

                            {/* Save Button */}
                            <button
                              onClick={() => {
                                let sumPrac = 0;
                                const finalAnswers = {
                                  ...(sub.answers || {}),
                                  ...tempAnswers,
                                  practical_image: tempPracticalImage,
                                  practical_link: tempPracticalLink
                                };
                                for (let i = 1; i <= 5; i++) {
                                  const val = tempPracticalGrades[`p-${i}`] || 0;
                                  finalAnswers[`practical_score_p-${i}`] = String(val);
                                  sumPrac += val;
                                }

                                const questions = selectedAdminExam.questions || [];
                                let computedTheoryScore = 0;
                                let totalMaxScore = selectedAdminExam.matrixTotalScore || 10;
                                let totalQuestions = questions.length || 1;

                                const normalizeAnsCheck = (str: any) => {
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

                                questions.forEach((q: any) => {
                                  const studentAnsInput = finalAnswers[q.id];
                                  if (studentAnsInput === undefined || studentAnsInput === null || studentAnsInput === '') return;

                                  const studentAnsStr = String(studentAnsInput);
                                  const correctAnsStr = String(q.correctAnswer || '');

                                  if (q.type === 'multiple_choice') {
                                    if (studentAnsStr.trim().toUpperCase() === correctAnsStr.trim().toUpperCase()) {
                                      computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
                                    }
                                  } else if (q.type === 'true_false') {
                                    if (q.statements && q.statements.length > 0) {
                                      const studentTfObj: any = {};
                                      studentAnsStr.split(",").forEach((part) => {
                                        const parts = part.split("-");
                                        if (parts.length >= 2) {
                                          const lbl = parts[0].trim().toUpperCase();
                                          const val = parts[1].trim().toLowerCase();
                                          studentTfObj[lbl] = val;
                                        }
                                      });
                                      
                                      const correctTfObj: any = {};
                                      correctAnsStr.split(",").forEach((part) => {
                                        const parts = part.split("-");
                                        if (parts.length >= 2) {
                                          const lbl = parts[0].trim().toUpperCase();
                                          const val = parts[1].trim().toLowerCase();
                                          correctTfObj[lbl] = val;
                                        }
                                      });

                                      q.statements.forEach((st: any) => {
                                        const sLabel = String(st.label || '').trim().toUpperCase();
                                        if (studentTfObj[sLabel] === correctTfObj[sLabel]) {
                                          computedTheoryScore += st.points !== undefined ? Number(st.points) : (q.points !== undefined ? Number(q.points) / q.statements.length : 0.25);
                                        }
                                      });
                                    } else {
                                      const normStudent = normalizeAnsCheck(studentAnsStr);
                                      const normCorrect = normalizeAnsCheck(correctAnsStr);
                                      if (normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "")) {
                                        computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
                                      }
                                    }
                                  } else if (q.type === 'matching') {
                                    if (q.matchingPairs && q.matchingPairs.length > 0) {
                                      const studentMatchObj: any = {};
                                      studentAnsStr.split(",").forEach((part) => {
                                        const parts = part.split("-");
                                        if (parts.length >= 2) {
                                          const leftId = parts[0].trim();
                                          const rightId = parts[1].trim().toLowerCase();
                                          studentMatchObj[leftId] = rightId;
                                        }
                                      });
                                      
                                      const correctMatchObj: any = {};
                                      correctAnsStr.split(",").forEach((part) => {
                                        const parts = part.split("-");
                                        if (parts.length >= 2) {
                                          const leftId = parts[0].trim();
                                          const rightId = parts[1].trim().toLowerCase();
                                          correctMatchObj[leftId] = rightId;
                                        }
                                      });

                                      q.matchingPairs.forEach((pair: any) => {
                                        const mId = String(pair.id || '').trim();
                                        if (studentMatchObj[mId] === correctMatchObj[mId]) {
                                          computedTheoryScore += pair.points !== undefined ? Number(pair.points) : (q.points !== undefined ? Number(q.points) / q.matchingPairs.length : 0.5);
                                        }
                                      });
                                    } else {
                                      const normStudent = normalizeAnsCheck(studentAnsStr);
                                      const normCorrect = normalizeAnsCheck(correctAnsStr);
                                      if (normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "")) {
                                        computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
                                      }
                                    }
                                  } else if (q.type === 'gap_fill') {
                                    const studentWords = studentAnsStr.trim().toLowerCase().replace(/\s+/g, ' ');
                                    const correctWords = correctAnsStr.trim().toLowerCase().replace(/\s+/g, ' ');
                                    if (studentWords === correctWords || correctWords.includes(studentWords)) {
                                      computedTheoryScore += q.points !== undefined ? Number(q.points) : (totalMaxScore / totalQuestions);
                                    }
                                  }
                                });

                                const theoryScore = Number(Math.min(totalMaxScore, Math.max(0, computedTheoryScore)).toFixed(2));
                                const totalScore = sumPrac + theoryScore;

                                const updatedList = adminOnlineExams.map((ex: any) => {
                                  if (ex.id === selectedAdminExam.id) {
                                    const updatedSubs = ex.submissions.map((sSub: any) => {
                                      if (sSub.id === sub.id) {
                                        return {
                                          ...sSub,
                                          score: totalScore,
                                          theoryScore: theoryScore,
                                          totalPracticalScore: sumPrac,
                                          answers: finalAnswers
                                        };
                                      }
                                      return sSub;
                                    });
                                    return { ...ex, submissions: updatedSubs };
                                  }
                                  return ex;
                                });

                                localStorage.setItem('lms_custom_exams', JSON.stringify(updatedList));
                                setAdminOnlineExams(updatedList);
                                const matchEx = updatedList.find(e => e.id === selectedAdminExam.id);
                                if (matchEx) {
                                  setSelectedAdminExam(matchEx);
                                  // Sync to backend
                                  fetch('/api/exams', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(matchEx)
                                  }).catch(e => console.error("Failed to sync graded exam to server:", e));
                                }
                                setGradingSubId(null);
                                triggerToast(`✓ Đã lưu chấm điểm (Tổng: ${totalScore.toFixed(1)}đ, Trắc nghiệm: ${theoryScore}đ) thành công!`);
                              }}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                            >
                              💾 Lưu kết quả chấm điểm
                            </button>

                          </div>
                        );
                      })()}

                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* EDIT ONLINE EXAM MODAL */}
          {editingExam && (
            <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-8 animate-fade-in text-left flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
                  <div className="flex items-center gap-3 text-amber-600">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h3 className="text-base font-black tracking-tight uppercase text-slate-800">Hiệu chỉnh Đề thi Online</h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">Sửa đổi cấu hình phòng thi trực tuyến trực tiếp</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingExam(null)}
                    className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-bold text-slate-700">
                  {/* Row 1: Tên đề thi */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Tên đề thi / Chủ đề:</label>
                    <input
                      type="text"
                      value={editingExam.testName || editingExam.topic || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingExam({ ...editingExam, testName: val, topic: val });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Row 2: Môn học, Khối, Thời gian */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Môn học:</label>
                      <input
                        type="text"
                        value={editingExam.subject || ''}
                        onChange={(e) => setEditingExam({ ...editingExam, subject: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Khối lớp:</label>
                      <select
                        value={editingExam.grade || 3}
                        onChange={(e) => setEditingExam({ ...editingExam, grade: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      >
                        <option value={3}>Khối 3</option>
                        <option value={4}>Khối 4</option>
                        <option value={5}>Khối 5</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Thời gian làm bài (phút):</label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={editingExam.timeLimit || 40}
                        onChange={(e) => setEditingExam({ ...editingExam, timeLimit: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Mã bảo mật, Thực hành ngăn 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Mã bảo mật phòng (Mã phòng thi):</label>
                      <input
                        type="text"
                        placeholder="Trống = Công khai"
                        value={editingExam.accessCode || ''}
                        onChange={(e) => setEditingExam({ ...editingExam, accessCode: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Chế độ Thực hành Ngăn 2:</label>
                      <select
                        value={editingExam.isPracticalEnabled === true ? 'true' : 'false'}
                        onChange={(e) => {
                          const enabled = e.target.value === 'true';
                          setEditingExam({ 
                            ...editingExam, 
                            isPracticalEnabled: enabled,
                            practical: enabled ? (editingExam.practical || [
                              { id: 'p-1', desc: 'Thao tác kỹ thuật chính xác, đúng quy trình', maxPoints: 5 },
                              { id: 'p-2', desc: 'Sản phẩm hoàn chỉnh, thẩm mỹ và sáng tạo', maxPoints: 5 }
                            ]) : undefined
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="false">Tắt thực hành (Chỉ Lý thuyết Trắc nghiệm)</option>
                        <option value="true">Bật thực hành (Tự luận/Nộp bài thực hành ở Ngăn 2)</option>
                      </select>
                    </div>
                  </div>

                  {/* Section: List of Questions */}
                  {editingExam.questions && editingExam.questions.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1">
                        ❓ DANH SÁCH CÂU HỎI TRẮC NGHIỆM ({editingExam.questions.length})
                      </h4>
                      <div className="space-y-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                        {editingExam.questions.map((q: any, qIdx: number) => (
                          <div key={q.id || qIdx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-black text-indigo-900 border-b border-slate-100 pb-1.5">
                              <span>Câu {qIdx + 1} ({q.type === 'multiple_choice' ? 'Trắc nghiệm đơn' : q.type === 'true_false' ? 'Đúng/Sai' : q.type === 'matching' ? 'Nối chéo' : 'Điền khuyết'})</span>
                              <span>Điểm: {q.points || 1} đ</span>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-slate-400">Nội dung câu hỏi:</label>
                              <input
                                type="text"
                                value={q.question || ''}
                                onChange={(e) => {
                                  const updatedQs = [...editingExam.questions];
                                  updatedQs[qIdx].question = e.target.value;
                                  setEditingExam({ ...editingExam, questions: updatedQs });
                                }}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white"
                              />
                            </div>

                            {/* Options if Multiple Choice */}
                            {q.type === 'multiple_choice' && q.options && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt: string, optIdx: number) => (
                                  <div key={optIdx} className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                    <input
                                      type="text"
                                      value={opt || ''}
                                      onChange={(e) => {
                                        const updatedQs = [...editingExam.questions];
                                        const updatedOpts = [...updatedQs[qIdx].options];
                                        updatedOpts[optIdx] = e.target.value;
                                        updatedQs[qIdx].options = updatedOpts;
                                        setEditingExam({ ...editingExam, questions: updatedQs });
                                      }}
                                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-700 focus:bg-white"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Correct Answer */}
                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-400">Đáp án đúng:</label>
                                {q.type === 'multiple_choice' ? (
                                  <select
                                    value={q.correctAnswer || 'A'}
                                    onChange={(e) => {
                                      const updatedQs = [...editingExam.questions];
                                      updatedQs[qIdx].correctAnswer = e.target.value;
                                      setEditingExam({ ...editingExam, questions: updatedQs });
                                    }}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-800"
                                  >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                  </select>
                                ) : q.type === 'true_false' ? (
                                  <select
                                    value={String(q.correctAnswer ?? true)}
                                    onChange={(e) => {
                                      const updatedQs = [...editingExam.questions];
                                      updatedQs[qIdx].correctAnswer = e.target.value === 'true';
                                      setEditingExam({ ...editingExam, questions: updatedQs });
                                    }}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-800"
                                  >
                                    <option value="true">Đúng (True)</option>
                                    <option value="false">Sai (False)</option>
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={q.correctAnswer || ''}
                                    onChange={(e) => {
                                      const updatedQs = [...editingExam.questions];
                                      updatedQs[qIdx].correctAnswer = e.target.value;
                                      setEditingExam({ ...editingExam, questions: updatedQs });
                                    }}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-800"
                                  />
                                )}
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-400">Điểm số:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={q.points || 1}
                                  onChange={(e) => {
                                    const updatedQs = [...editingExam.questions];
                                    updatedQs[qIdx].points = Number(e.target.value);
                                    setEditingExam({ ...editingExam, questions: updatedQs });
                                  }}
                                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-800"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section: Practical Criteria if Enabled */}
                  {editingExam.isPracticalEnabled === true && editingExam.practical && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1">
                        🛠️ TIÊU CHÍ CHẤM ĐIỂM THỰC HÀNH NGĂN 2
                      </h4>
                      <div className="space-y-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-150">
                        {editingExam.practical.map((p: any, pIdx: number) => (
                          <div key={p.id || pIdx} className="grid grid-cols-12 gap-3 items-center">
                            <span className="col-span-1 text-[11px] text-indigo-950 font-black">TC{pIdx + 1}</span>
                            <div className="col-span-8">
                              <input
                                type="text"
                                value={p.desc || ''}
                                onChange={(e) => {
                                  const updatedPrac = [...editingExam.practical];
                                  updatedPrac[pIdx].desc = e.target.value;
                                  setEditingExam({ ...editingExam, practical: updatedPrac });
                                }}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                                placeholder="Nhập tiêu chí thực hành"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={p.maxPoints || 5}
                                onChange={(e) => {
                                  const updatedPrac = [...editingExam.practical];
                                  updatedPrac[pIdx].maxPoints = Number(e.target.value);
                                  setEditingExam({ ...editingExam, practical: updatedPrac });
                                }}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                                placeholder="Điểm tối đa"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 text-xs font-bold rounded-b-3xl">
                  <button
                    onClick={() => setEditingExam(null)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl cursor-pointer transition active:scale-95"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      // Recalculate matrix total score if needed
                      let matrixTotalScore = editingExam.matrixTotalScore || 10;
                      if (editingExam.questions && editingExam.questions.length > 0) {
                        matrixTotalScore = editingExam.questions.reduce((acc: number, q: any) => acc + (q.points || 1), 0);
                      }
                      const finalExam = { ...editingExam, matrixTotalScore };

                      const updated = adminOnlineExams.map(e => e.id === finalExam.id ? finalExam : e);
                      localStorage.setItem('lms_custom_exams', JSON.stringify(updated));
                      setAdminOnlineExams(updated);
                      
                      // Push to server-side DB if applicable
                      fetch(`/api/exams/${finalExam.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(finalExam)
                      }).catch(e => console.error("Failed to update exam on server:", e));

                      triggerToast("🟢 Cập nhật đề thi online thành công!");
                      setEditingExam(null);
                    }}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl border-b-2 border-amber-900 cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM DELETE EXAM MODAL */}
          {examToDeleteId && (
            <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-fade-in text-left">
                <div className="flex items-center gap-3 text-rose-600 mb-4">
                  <span className="text-3xl">🗑️</span>
                  <h3 className="text-lg font-black tracking-tight uppercase">Xác nhận xóa đề thi</h3>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Bạn có chắc chắn muốn xóa phòng thi trực tuyến <span className="font-extrabold text-slate-800">"{examToDeleteName}"</span>? Hành động này sẽ xóa vĩnh viễn đề thi và tất cả lượt nộp bài liên quan.
                </p>
                <div className="flex justify-end gap-2 text-xs font-bold">
                  <button
                    onClick={() => { setExamToDeleteId(null); setExamToDeleteName(''); }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      const updated = adminOnlineExams.filter(e => e.id !== examToDeleteId);
                      localStorage.setItem('lms_custom_exams', JSON.stringify(updated));
                      setAdminOnlineExams(updated);
                      if (selectedAdminExam?.id === examToDeleteId) {
                        setSelectedAdminExam(null);
                      }
                      
                      fetch(`/api/exams/${examToDeleteId}`, {
                        method: 'DELETE'
                      }).catch(e => console.error("Failed server deletion:", e));

                      triggerToast("🗑️ Đã xóa đề thi trực tuyến thành công!");
                      setExamToDeleteId(null);
                      setExamToDeleteName('');
                    }}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-b-2 border-rose-900 cursor-pointer"
                  >
                    Xóa vĩnh viễn
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM DELETE SUBMISSION MODAL */}
          {submissionToDeleteId && (
            <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-fade-in text-left">
                <div className="flex items-center gap-3 text-rose-600 mb-4">
                  <span className="text-3xl">⚠️</span>
                  <h3 className="text-lg font-black tracking-tight uppercase">Xác nhận xóa lượt thi</h3>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Bạn có chắc chắn muốn xóa bài làm của học sinh <span className="font-extrabold text-slate-800">"{submissionToDeleteName}"</span>? Học sinh này sẽ có thể vào thi lại đề này.
                </p>
                <div className="flex justify-end gap-2 text-xs font-bold">
                  <button
                    onClick={() => { setSubmissionToDeleteId(null); setSubmissionToDeleteName(''); setSubmissionToDeleteExamId(null); }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      if (submissionToDeleteExamId) {
                        const exam = adminOnlineExams.find(e => e.id === submissionToDeleteExamId);
                        if (exam) {
                          const updatedSubs = (exam.submissions || []).filter((s: any) => s.id !== submissionToDeleteId);
                          const revisedExam = { ...exam, submissions: updatedSubs };
                          const fullList = JSON.parse(localStorage.getItem('lms_custom_exams') || '[]');
                          const savedList = fullList.map((e: any) => e.id === submissionToDeleteExamId ? revisedExam : e);

                          localStorage.setItem('lms_custom_exams', JSON.stringify(savedList));
                          setAdminOnlineExams(savedList);
                          if (selectedAdminExam?.id === submissionToDeleteExamId) {
                            setSelectedAdminExam(revisedExam);
                          }
                          triggerToast("✓ Đã xóa bài nộp của học sinh thành công!");
                        }
                      }
                      setSubmissionToDeleteId(null);
                      setSubmissionToDeleteName('');
                      setSubmissionToDeleteExamId(null);
                    }}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-b-2 border-rose-900 cursor-pointer"
                  >
                    Có, Xóa bài nộp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM CLEAR ALL SUBMISSIONS MODAL */}
          {examIdToClearAll && (
            <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-fade-in text-left">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                  <span className="text-3xl">🧹</span>
                  <h3 className="text-lg font-black tracking-tight uppercase">Xác nhận xóa tất cả lượt nộp</h3>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Bạn có chắc chắn muốn xóa toàn bộ kết quả và lịch sử nộp bài thi của các học sinh trong đề thi này? (Bạn có thể nhấn nút <span className="font-extrabold text-amber-700">"Hoàn tác"</span> để khôi phục lại sau nếu cần).
                </p>
                <div className="flex justify-end gap-2 text-xs font-bold">
                  <button
                    onClick={() => setExamIdToClearAll(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => handleClearAllSubmissions(examIdToClearAll, true)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-b-2 border-rose-900 cursor-pointer"
                  >
                    Xóa tất cả lượt nộp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification Popups */}
          {panelToast && (
            <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 text-white border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm animate-slide-in font-bold text-xs">
              <span>🔔</span>
              <span>{panelToast}</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
