import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
  Lock, 
  BookOpen, 
  MapPin, 
  Users, 
  GraduationCap
} from 'lucide-react';
import { UserRole, StudentRecord, TeacherRecord } from '../types';

interface LoginRegisterProps {
  onLoginSuccess: (data: {
    username: string;
    role: UserRole;
    fullname: string;
    school: string;
    gender?: string;
    avatar: string;
    grade: number;
    className: string;
    subject?: string;
    xp?: number;
    level?: number;
    streak?: number;
  }) => void;
  studentsList: StudentRecord[];
  teachersList: TeacherRecord[];
}

export default function LoginRegister({ onLoginSuccess, studentsList, teachersList }: LoginRegisterProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isUpdateInfo, setIsUpdateInfo] = useState(false);
  const [role, setRole] = useState<UserRole>('student');

  // Login & Register standard credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Info profile variables
  const [fullname, setFullname] = useState('');
  const [schoolsList, setSchoolsList] = useState<string[]>(() => {
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
  const [subjectsList, setSubjectsList] = useState<string[]>(() => {
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

  useEffect(() => {
    localStorage.setItem('lms_schools_registry', JSON.stringify(schoolsList));
  }, [schoolsList]);

  useEffect(() => {
    localStorage.setItem('lms_subjects_registry', JSON.stringify(subjectsList));
  }, [subjectsList]);

  const [school, setSchool] = useState(() => schoolsList[0] || 'Tiểu học Trần văn Danh');
  const [gender, setGender] = useState('Nam'); // Default is Nam (Boys)
  const [showAddSchoolInput, setShowAddSchoolInput] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [avatar, setAvatar] = useState('👦');
  const [grade, setGrade] = useState<number>(3);
  const [className, setClassName] = useState('3.1');
  const [subject, setSubject] = useState(() => subjectsList[0] || 'Tin học');

  // Custom class list state
  const [customClasses, setCustomClasses] = useState<{ [key: number]: string[] }>({
    1: ['1.1', '1.2', '1.3', '1.4', '1.5'],
    2: ['2.1', '2.2', '2.3', '2.4', '2.5'],
    3: ['3.1', '3.2', '3.3', '3.4', '3.5'],
    4: ['4.1', '4.2', '4.3', '4.4', '4.5'],
    5: ['5.1', '5.2', '5.3', '5.4', '5.5']
  });
  const [newClassInput, setNewClassInput] = useState('');

  const avaterOptions = ['👦', '👧', '👨', '👩', '🌱', '🌞', '🌙', '⭐'];

  const handleAddSchool = () => {
    const trimmed = newSchoolName.trim();
    if (trimmed) {
      if (!schoolsList.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
        setSchoolsList(prev => [...prev, trimmed]);
      }
      setSchool(trimmed);
      setNewSchoolName("");
      setShowAddSchoolInput(false);
    }
  };

  const handleAddNewClass = () => {
    if (!newClassInput.trim()) return;
    const cleanInput = newClassInput.trim();
    setCustomClasses(prev => ({
      ...prev,
      [grade]: [...prev[grade], cleanInput]
    }));
    setClassName(cleanInput);
    setNewClassInput('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const typedUser = username.trim().toLowerCase();
    const typedPass = password.trim();

    if (!typedUser || !typedPass) {
      setErrorMsg('Vui lòng gõ đầy đủ tên đăng nhập và mật khẩu nhé!');
      return;
    }

    // 1. Try matching teachers (including admin)
    const matchTeacher = teachersList.find(t => t.username.trim().toLowerCase() === typedUser && (t.password || '123').trim() === typedPass);
    if (matchTeacher) {
      const isSystemAdmin = matchTeacher.username === 'admin';
      onLoginSuccess({
        username: matchTeacher.username,
        role: isSystemAdmin ? 'admin' : 'teacher',
        fullname: matchTeacher.fullname,
        school: matchTeacher.school,
        avatar: isSystemAdmin ? '😎' : '👩‍🏫',
        grade: matchTeacher.grades[0] || 5,
        className: matchTeacher.classes[0] || 'Tổ Tin Học',
        subject: matchTeacher.subject
      });
      return;
    }

    // 2. Try matching students
    const matchStudent = studentsList.find(s => s.username.trim().toLowerCase() === typedUser && (s.password || '123').trim() === typedPass);
    if (matchStudent) {
      onLoginSuccess({
        username: matchStudent.username,
        role: 'student',
        fullname: matchStudent.fullname,
        school: matchStudent.school,
        avatar: matchStudent.avatar || '👦',
        grade: matchStudent.grade,
        className: matchStudent.className,
        gender: matchStudent.gender,
        xp: matchStudent.xp,
        level: matchStudent.level,
        streak: matchStudent.streak
      });
      return;
    }

    // 3. Fallback
    if (typedUser === 'admin') {
      onLoginSuccess({
        username: 'admin',
        role: 'admin',
        fullname: 'Thầy Tâm Rio 👑',
        school: 'Tiểu học Trần văn Danh',
        avatar: '😎',
        grade: 5,
        className: 'Tối Thượng'
      });
    } else if (typedUser === 'teacher') {
      onLoginSuccess({
        username: 'teacher',
        role: 'teacher',
        fullname: 'Cô Hồng Nhung 🌸',
        school: 'Tiểu học Trần văn Danh',
        avatar: '👩‍🏫',
        grade: 3,
        className: '3.1',
        subject: 'Tin học'
      });
    } else if (typedUser === 'hocsinh') {
      onLoginSuccess({
        username: 'hocsinh',
        role: 'student',
        fullname: 'Nguyễn Minh Tâm',
        school: 'Tiểu học Trần văn Danh',
        avatar: '👦',
        grade: 3,
        className: '3.1',
        gender: 'Nam'
      });
    } else {
      setIsUpdateInfo(true);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng tạo tên đăng nhập và mật khẩu nhé!');
      return;
    }
    // Set view to update fields
    setIsUpdateInfo(true);
  };

  const handleGoogleLogin = () => {
    // Simulate smart direct Google OAuth
    setFullname('Nguyễn Minh Khang');
    setSchool('Trường Tiểu Học Nguyễn Bỉnh Khiêm');
    setAvatar('🚀');
    setIsUpdateInfo(true);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim()) {
      alert('Em hãy nhập Họ và tên của mình vào nhé!');
      return;
    }

    onLoginSuccess({
      username: username || 'google_user',
      role,
      fullname,
      school,
      gender,
      avatar,
      grade,
      className,
      subject
    });
  };

  return (
    <div 
      className="min-h-screen bg-[#F3F6FD] flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(#DBEAFE 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
    >
      {/* Decorative Floating Balloons */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce duration-1000 opacity-20 select-none">🎈</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce duration-1500 opacity-20 select-none">🎉</div>
      <div className="absolute top-1/4 right-1/6 text-5xl animate-bounce duration-3000 opacity-20 select-none">☁️</div>
      <div className="absolute bottom-1/4 left-1/6 text-5xl animate-bounce duration-2000 opacity-20 select-none">☁️</div>

      {/* Main card box Container */}
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-[0_16px_40px_rgba(36,84,166,0.12)] border-4 border-[#3B82F6] overflow-hidden p-6 md:p-8 z-10 transition-all">
        
        {/* Step 1: Login or Register panel */}
        {!isUpdateInfo ? (
          <div>
            {/* Mascot Heading */}
            <div className="text-center mb-6">
              <span className="text-5xl animate-bounce inline-block">🤖</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#2454A6] mt-2 tracking-wide" style={{ fontFamily: 'var(--font-title)' }}>
                {isRegister ? 'Tạo Tài Khoản Mới' : 'Học mà chơi - Chơi mà học'}
              </h2>
              <p className="text-sm text-gray-500 font-bold mt-1">
                {isRegister ? 'Đăng ký để cùng lưu điểm ⭐, nhận cúp huy hiệu' : 'Chào mừng em đến với Kho học liệu Tiểu học!'}
              </p>
            </div>

            {/* Quick credentials instructions */}
            <div className="bg-[#EBF3FF] p-3 rounded-2xl border-2 border-[#C7DFFF] text-xs font-bold text-gray-700 mb-6 flex flex-col gap-1">
              <div className="text-[#2454A6] mb-1">💡 Đăng nhập nhanh tài khoản mẫu:</div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => { setUsername('hocsinh'); setPassword('123'); setRole('student'); }} 
                  className="bg-white/80 hover:bg-white hover:text-blue-700 px-2.5 py-1 rounded-xl border border-[#C7DFFF] transition text-center"
                >
                  👦 Học Sinh
                </button>
                <button 
                  onClick={() => { setUsername('teacher'); setPassword('123'); setRole('teacher'); }}
                  className="bg-white/80 hover:bg-white hover:text-blue-700 px-2.5 py-1 rounded-xl border border-[#C7DFFF] transition text-center"
                >
                  👩 Giáo Viên
                </button>
                <button 
                  onClick={() => { setUsername('admin'); setPassword('123'); setRole('admin'); }}
                  className="bg-white/80 hover:bg-white hover:text-red-700 px-2.5 py-1 rounded-xl border border-[#C7DFFF] transition text-center"
                >
                  👑 Quản Trị Viên
                </button>
              </div>
            </div>

            {/* Google Authentication login button */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 bg-white border-3 border-[#C7DFFF] text-[#2454A6] hover:bg-blue-50 py-3 rounded-2xl font-extrabold text-base transition-all duration-200 transform active:scale-97 mb-4 shadow-[0_4px_0_#C7DFFF]"
              style={{ fontFamily: 'var(--font-btn)' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.11-.3-.21-.63-.21-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Đăng nhập bằng tài khoản Google 
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t-2 border-gray-100"></div>
              <span className="px-3 text-xs font-black uppercase text-gray-400">Hoặc dùng tên đăng nhập</span>
              <div className="flex-grow border-t-2 border-gray-100"></div>
            </div>

            {/* Error badge alerts */}
            {errorMsg && (
              <div className="bg-[#FFF2F2] border-2 border-[#FFD6D6] text-[#FF6B6B] px-4 py-2.5 rounded-2xl font-bold text-center text-sm mb-4">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1 text-left">
                  Tên đăng nhập (Username)
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: minhtam278, hoc_sinh278, hocsinh_255"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-[#3B82F6] outline-none font-bold text-base transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1 text-left">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu học tập..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-[#3B82F6] outline-none font-bold text-base transition-all"
                  />
                </div>
              </div>

              {/* Account selective role for registration updates */}
              {isRegister && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1 text-left">
                    Em đăng ký tài khoản với tư cách gì?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'student', title: 'Học sinh 👦' },
                      { id: 'teacher', title: 'Giáo viên 👩' },
                      { id: 'admin', title: 'Quản trị viên 👑' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setRole(item.id as UserRole)}
                        className={`py-2 rounded-xl border-3 font-extrabold text-[#2454A6] transition ${
                          role === item.id 
                            ? 'bg-[#EBF3FF] border-[#3B82F6]' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#5ED68A] hover:bg-[#4bcc7a] text-[#2454A6] py-4 rounded-2xl font-black text-lg border-b-6 border-[#44b06a] hover:border-b-4 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0.5 shadow-md flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                <Sparkles className="w-5 h-5 text-[#2454A6]" />
                {isRegister ? 'Đăng Ký Tài khoản' : 'Vào Học Ngay Thôi!'}
              </button>
            </form>

            {/* Toggle Login/Resgister linkages */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-sm font-black text-[#2454A6] hover:underline"
              >
                {isRegister ? 'Đã có tài khoản rồi? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký ngay'}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Informative Profile Updating (Học sinh | Giáo viên | Admin) */
          <div>
            <div className="text-center mb-6">
              <span className="text-5xl inline-block animate-bounce">{avatar}</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#2454A6] mt-2 tracking-wide uppercase" style={{ fontFamily: 'var(--font-title)' }}>
                Cập Nhật Thông Tin
              </h2>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Lớp học vui vẻ cần biết chính xác thông tin để hiển thị bảng xếp hạng
              </p>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              {/* Common Name input with Gender dropdown next to it */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2 text-left space-y-1">
                  <label className="block text-slate-500 mb-1 pl-1 text-[11px] font-extrabold uppercase tracking-wider text-left leading-none mt-1">
                    Họ và Tên học sinh:
                  </label>
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    className="w-full text-sm font-bold bg-[#F3F6FD] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] focus:bg-white transition-all text-slate-700 h-11.5"
                  />
                </div>
                <div className="text-left space-y-1">
                  <label className="block text-slate-500 mb-1 pl-1 text-[11px] font-extrabold uppercase tracking-wider text-left leading-none mt-1">
                    Giới tính:
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-sm font-bold bg-[#F3F6FD] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] focus:bg-white transition-all text-slate-700 h-11.5"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Avatar Emoji selecting options */}
              <div className="text-left space-y-2.5">
                <div className="flex items-center justify-between pl-1 mt-1.5">
                  <label className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider leading-none">
                    Chọn hình đại diện yêu thích (Avatar):
                  </label>
                  <span className="text-[10px] text-gray-400 font-extrabold bg-[#F3F6FD] px-2.5 py-0.5 rounded-full border border-gray-150 leading-none">
                    Tổng: {avaterOptions.length}
                  </span>
                </div>
                
                {/* Frame containing all registration avatars without outlines or borders (không viền) */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-[#F8FAFC] p-3.5 rounded-[24px] border border-gray-150">
                  {avaterOptions.map((emoji) => {
                    const isSelected = avatar === emoji;
                    return (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className={`w-11 h-11 flex items-center justify-center text-3xl transition-all cursor-pointer relative select-none rounded-xl bg-transparent hover:bg-slate-200/50 hover:scale-120 ${
                          isSelected ? 'bg-amber-100/80 scale-120 z-10' : ''
                        }`}
                        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                      >
                        {emoji}
                        {isSelected && (
                          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-[#22C55E] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-black ring-2 ring-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic rendering depending on selected active role */}
              {role === 'student' && (
                <>
                  {/* Student School name */}
                  <div className="text-left space-y-1 block">
                    <div className="flex justify-between items-center pl-1">
                      <label className="text-sm font-bold text-gray-700">Trường tiểu học đang theo học:</label>
                      {!showAddSchoolInput && (
                        <button
                          type="button"
                          onClick={() => setShowAddSchoolInput(true)}
                          className="text-[#2454A6] hover:text-[#1D4ED8] font-black text-[11px] hover:underline cursor-pointer"
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
                          value={newSchoolName}
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
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full text-sm font-bold bg-gray-50 border-3 border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-[#3B82F6] transition-all text-slate-700 h-12"
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

                  {/* Student Grade & Class details as requested */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1 pl-1 text-left">
                        Học sinh khối học:
                      </label>
                      <select
                        value={grade ?? 3}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setGrade(val);
                          // select default class
                          setClassName(customClasses[val]?.[0] || '1');
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-[#3B82F6] outline-none font-bold text-base transition-all"
                      >
                        <option value="1">Khối lớp 1</option>
                        <option value="2">Khối lớp 2</option>
                        <option value="3">Khối lớp 3</option>
                        <option value="4">Khối lớp 4</option>
                        <option value="5">Khối lớp 5</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1 pl-1 text-left">
                        Tên lớp cụ thể:
                      </label>
                      <select
                        value={className || (customClasses[grade]?.[0] || '3.1')}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-[#3B82F6] outline-none font-bold text-base transition-all"
                      >
                        {(customClasses[grade] || []).map((c) => (
                          <option key={c} value={c}>Lớp {c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Add customized extra class name input dynamically */}
                  <div className="bg-[#FFFDE8] p-3 rounded-2xl border-2 border-[#FFF5B8] space-y-1.5">
                    <span className="text-xs font-black text-amber-700 block">➕ Thêm lớp học mới nếu không tìm thấy:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newClassInput || ''}
                        onChange={(e) => setNewClassInput(e.target.value)}
                        placeholder={`Gõ tên lớp (ví dụ: ${grade}.6)`}
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewClass}
                        className="bg-[#2454A6] hover:bg-blue-800 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition"
                      >
                        Thêm lớp
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Teacher Profiles fields */}
              {role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 pl-1 text-left">
                      Trường tiểu học công tác:
                    </label>
                    <input
                      type="text"
                      value={school || ''}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="Nhập tên trường tiểu học giảng dạy..."
                      className="w-full px-4 py-3 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-[#3B82F6] outline-none font-bold text-base transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 pl-1 text-left">
                      Bộ môn giảng dạy:
                    </label>
                    <select
                      value={subject || ''}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-[#3B82F6] outline-none font-bold text-base transition-all"
                    >
                      {subjectsList.map((subj) => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Save Information profiles button */}
              <button
                type="submit"
                className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-lg border-b-6 border-blue-800 hover:border-b-4 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0.5 shadow-md flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-btn)' }}
              >
                Lưu Thông Tin ✔️
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
