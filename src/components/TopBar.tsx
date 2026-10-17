import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Award, 
  LogOut, 
  Settings, 
  Users, 
  Bookmark, 
  BookOpen,
  Bell,
  Check,
  Trash2
} from 'lucide-react';
import { UserRole, INITIAL_BADGES, Badge } from '../types';

interface TopBarProps {
  fullname: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  role: UserRole;
  onLogout: () => void;
  onRoleSwitch: (role: UserRole) => void;
  onOpenAvatarModal?: () => void;
  totalCollectedXP?: number;
  badgesList?: Badge[];
}

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  type: 'attendance' | 'task' | 'general';
}

export default function TopBar({
  fullname,
  avatar,
  level,
  xp,
  streak,
  role,
  onLogout,
  onRoleSwitch,
  onOpenAvatarModal,
  totalCollectedXP,
  badgesList
}: TopBarProps) {
  const [isOpenNotification, setIsOpenNotification] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: 'notify-1',
      title: '📅 Nhắc nhở điểm danh chuyên cần',
      content: 'Hãy học tập hàng ngày để tích cực tích lũy chuỗi chuyên cần liên tiếp và nhận thêm nhiều điểm sao!',
      time: 'Vừa xong',
      isRead: false,
      type: 'attendance'
    },
    {
      id: 'notify-2',
      title: '📝 Nhiệm vụ học tập hằng ngày',
      content: 'Hoàn thành ít nhất một đề trắc nghiệm hoặc một trò chơi phần cứng kỳ thú ngày hôm nay bạn nhé.',
      time: 'Hôm nay',
      isRead: false,
      type: 'task'
    },
    {
      id: 'notify-3',
      title: '🦄 Khám phá kho Linh thú hộ mệnh',
      content: 'Cửa hàng vừa cập nhật thêm hàng loạt báu vật avatar sống động. Mau dùng Sao tích lũy để quy đổi nào!',
      time: 'Mới cập nhật',
      isRead: true,
      type: 'general'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleRemoveNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getGreeting = () => {
    let highestBadge = 'Tân Binh Tin Học 🌱';
    if (role === 'teacher') {
      highestBadge = 'Thầy/Cô 💼';
    } else if (role === 'admin') {
      highestBadge = 'Quản trị viên 👑';
    } else {
      const checkXP = typeof totalCollectedXP === 'number' ? totalCollectedXP : xp;
      const earnedBadges = (badgesList || INITIAL_BADGES).filter(b => checkXP >= b.xpRequired);
      if (earnedBadges.length > 0) {
        highestBadge = earnedBadges[earnedBadges.length - 1].title;
      }
    }

    const badgeSpan = <span className="text-red-600 font-black">{highestBadge}</span>;

    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    if (hour >= 5 && hour < 11) {
      return (
        <>
          Buổi sáng an lành nhé ☀️! {badgeSpan}
        </>
      );
    } else if (hour >= 11 && (hour < 13 || (hour === 13 && minutes < 30))) {
      return (
        <>
          Buổi trưa vui vẻ nhé 🌤️! {badgeSpan}
        </>
      );
    } else if ((hour === 13 && minutes >= 30) || (hour > 13 && hour < 18)) {
      return (
        <>
          Buổi chiều thư giản nhé ☕! {badgeSpan}
        </>
      );
    } else if (hour >= 18 && hour < 22) {
      return (
        <>
          Buổi tối bình yên nhé 🌙! {badgeSpan}
        </>
      );
    } else {
      return (
        <>
          Nghỉ ngơi sớm nhé 😴! {badgeSpan}
        </>
      );
    }
  };

  return (
    <div 
      id="top-bar" 
      className="h-[76px] bg-white border-b-4 border-[#EBF3FF] flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm"
    >
      {/* Role Indicator & App Greeting */}
      <div className="flex items-center gap-3">
        <div className="text-xs md:text-sm font-extrabold text-gray-800 leading-snug">
          {getGreeting()}
        </div>
        
        {/* Role Badge pill */}
        <span className={`text-[13px] font-black normal-case tracking-normal px-2.5 py-0.5 rounded-full border-2 shrink-0 ${
          role === 'admin' 
            ? 'bg-[#FF6B6B]/15 text-[#FF6B6B] border-[#FF6B6B]' 
            : role === 'teacher'
            ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]'
            : 'bg-[#5ED68A]/15 text-[#22c55e] border-[#5ED68A]'
        }`}>
          {role === 'admin' ? '👨‍💼 Admin' : role === 'teacher' ? '👩‍🏫 Giáo viên' : '🧒 Học sinh'}
        </span>
      </div>

      {/* Gamified Health & Level stats (shown always, adaptive for children) */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Streak score */}
        <div 
          id="streak-box" 
          title="Số ngày học tập liên tiếp của bạn"
          className="flex items-center gap-1.5 bg-[#FFF2F2] hover:bg-[#FFE5E5] border-2 border-[#FFD6D6] px-3.5 py-1.5 rounded-2xl cursor-help transition-all transform hover:scale-105 active:scale-95"
        >
          <span className="font-extrabold text-[#FF6B6B] text-xs md:text-sm" style={{ fontFamily: 'var(--font-btn)' }}>
            🔥 {streak} ngày
          </span>
        </div>

        {/* XP score */}
        <div 
          id="xp-box" 
          title="Tổng điểm tích luỹ đạt được"
          className="flex items-center gap-1.5 bg-[#FFFDE8] hover:bg-[#FFFAC7] border-2 border-[#FFF5B8] px-3.5 py-1.5 rounded-2xl cursor-help transition-all transform hover:scale-105 active:scale-95"
        >
          <span className="font-extrabold text-[#d97706] text-xs md:text-sm" style={{ fontFamily: 'var(--font-btn)' }}>
           ⭐ {xp} sao
          </span>
        </div>

        {/* Level Indicator */}
        <div 
          id="level-box" 
          title="Cấp độ hoạt động hiện tại"
          className="flex items-center gap-1.5 bg-[#EEFBF3] hover:bg-[#E1FAF0] border-2 border-[#D1F5DF] px-3.5 py-1.5 rounded-2xl cursor-help transition-all transform hover:scale-105 active:scale-95"
        >
          <Award className="w-5 h-5 text-emerald-500" />
          <span className="font-extrabold text-[#16a34a]" style={{ fontFamily: 'var(--font-btn)' }}>
            Cấp độ {level}
          </span>
        </div>

        {/* Dynamic & Animated Notifications Bell Dropdown */}
        <div className="relative" id="notification-bell-container">
          <button
            id="notification-bell-btn"
            onClick={() => setIsOpenNotification(!isOpenNotification)}
            className={`w-11 h-11 rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center relative ${
              isOpenNotification 
                ? 'bg-blue-50 border-[#3B82F6] text-[#3B82F6]' 
                : 'bg-[#F8FAFC] hover:bg-slate-100 border-gray-200 text-gray-500'
            }`}
            title="Nhấp để xem danh sách Nhắc nhở"
          >
            <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-[bounce_2.5s_infinite]' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpenNotification && (
            <div 
              id="notification-popover"
              className="absolute right-0 mt-3.5 w-80 sm:w-96 bg-white rounded-3xl border-3 border-[#EBF3FF] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
            >
              {/* Popover Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b-2 border-gray-150 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔔</span>
                  <span className="font-black text-xs md:text-sm text-[#1D4ED8] uppercase tracking-wide">Nhắc Nhở Học Tập</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-extrabold text-[#3B82F6] hover:text-[#2563EB] bg-white px-2.5 py-1 rounded-lg border border-blue-100 shadow-2xs hover:shadow-xs transition"
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              {/* Notification List Panel */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 transition hover:bg-slate-50 flex gap-3 text-left relative ${
                        !item.isRead ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* Custom Category Mascot Icon */}
                      <span className="text-2xl pt-0.5 shrink-0 select-none">
                        {item.type === 'attendance' ? '🔥' : item.type === 'task' ? '✍️' : '🎁'}
                      </span>

                      {/* Content block */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-extrabold leading-snug ${!item.isRead ? 'text-blue-900' : 'text-slate-700'}`}>
                            {item.title}
                          </h4>
                          <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 font-bold">
                          {item.content}
                        </p>

                        {/* Actions Inside Notification Item */}
                        <div className="flex items-center justify-end gap-3.5 pt-1.5 border-t border-dashed border-slate-100/65 mt-2">
                          <button
                            onClick={(e) => handleToggleRead(item.id, e)}
                            className="text-[10px] font-extrabold text-[#3B82F6] hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            {item.isRead ? 'Chưa đọc ✉️' : 'Đã đọc ✓'}
                          </button>
                          <button
                            onClick={(e) => handleRemoveNotification(item.id, e)}
                            className="text-[10px] font-extrabold text-rose-450 hover:text-rose-600 hover:underline cursor-pointer"
                          >
                            Xóa ✕
                          </button>
                        </div>
                      </div>

                      {/* Red unread circle dot */}
                      {!item.isRead && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 px-6 text-center text-slate-400 space-y-2">
                    <span className="text-3xl block">🎉</span>
                    <p className="text-xs font-bold text-slate-500">Bé đã xem hết các thông báo rồi! Mỗi ngày cố gắng nhé!</p>
                  </div>
                )}
              </div>

              {/* Popover Footer instructions */}
              <div className="p-3 bg-slate-50/80 border-t border-gray-150 flex items-center justify-between text-[10px] text-gray-400 font-extrabold">
                <span className="text-slate-500">🌟 Đừng bỏ quên chuỗi vàng chuyên cần nhé!</span>
                <button 
                  onClick={() => setIsOpenNotification(false)}
                  className="font-black text-[#3B82F6] hover:underline"
                >
                  Đóng ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar Interactive button */}
        <div className="flex items-center gap-2 pl-2 border-l-2 border-gray-100">
          <button 
            id="avatar-trigger-btn"
            onClick={onOpenAvatarModal}
            className="w-11 h-11 rounded-2xl border-3 border-[#3B82F6] flex items-center justify-center text-2xl bg-[#EBF3FF] hover:bg-[#C7DFFF] shadow-md transition-all active:scale-90"
            title="Nhấp để thay đổi ảnh đại diện (avatar)"
          >
            {avatar}
          </button>

          {/* Quick exit button */}
          <button 
            id="logout-btn"
            onClick={onLogout}
            className="p-2.5 rounded-2xl hover:bg-[#FF6B6B]/15 text-[#FF6B6B] border border-transparent hover:border-[#FFD6D6] transition-all"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
