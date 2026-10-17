import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  Award, 
  Map, 
  BookOpen, 
  Gamepad2, 
  ClipboardCheck, 
  GitCommit, 
  CheckCircle,
  Gem,
  Store,
  Compass,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

import { 
  UserRole, 
  StudentProfile, 
  INITIAL_LESSONS, 
  INITIAL_QUESTIONS, 
  INITIAL_BADGES, 
  Lesson, 
  Question,
  SHARED_AVATAR_POOL,
  ShopItem,
  Level,
  Badge,
  Game,
  calculateLevelFromXP,
  StudentRecord,
  TeacherRecord
} from './types';

// Importing our modular sub-components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginRegister from './components/LoginRegister';
import StudentHome from './components/StudentHome';
import StudentLessons from './components/StudentLessons';
import StudentGames from './components/StudentGames';
import ContactView from './components/ContactView';
import AdminPanel from './components/AdminPanel';
import StudentProfileView from './components/StudentProfileView';
import StudentExercises from './components/StudentExercises';
import TeacherDashboard from './components/TeacherDashboard';
import LessonPlanner from './components/LessonPlanner';
import SkknCreator from './components/SkknCreator';
import GameCreator from './components/GameCreator';
import TestCreator from './components/TestCreator';
import Utilities from './components/Utilities';
import OnlineExamsView from './components/OnlineExamsView';
import ShareReportView from './components/ShareReportView';

import { motion } from 'motion/react';

export class SoundEffects {
  private static ctx: AudioContext | null = null;

  private static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tiếng 'tinh' khi nhận sao
  public static playTing() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // High pitched sweet sound resembling 'tinh'
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1700, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio play restricted or failed:', e);
    }
  }

  // Tiếng 'keng' khi hoàn thành bài học / thử thách / lên cấp / huy hiệu
  public static playKeng() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.12); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now); // D6
      osc2.frequency.setValueAtTime(1760, now + 0.12); // A6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Tiếng vỗ tay reo hò khích lệ khích lệ học sinh trả lời đúng
  public static playCheer() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // 1. Giọng reo hò tổng hợp (Cheer crowd tone)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const cheerGain = this.ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.9);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(330, now);
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(330, now + 1.0);
      
      cheerGain.gain.setValueAtTime(0.001, now);
      cheerGain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      cheerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      
      osc1.connect(cheerGain);
      osc2.connect(cheerGain);
      cheerGain.connect(this.ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);

      // 2. Tiếng vỗ tay giòn giã (Snappy physical hand claps series)
      for (let i = 0; i < 22; i++) {
        const clapDelay = i * 0.05 + Math.random() * 0.02;
        const clapOsc = this.ctx.createOscillator();
        const clapGain = this.ctx.createGain();
        
        clapOsc.type = 'triangle';
        const freq = 550 + Math.random() * 850;
        clapOsc.frequency.setValueAtTime(freq, now + clapDelay);
        clapOsc.frequency.exponentialRampToValueAtTime(80, now + clapDelay + 0.04);
        
        clapGain.gain.setValueAtTime(0.15, now + clapDelay);
        clapGain.gain.exponentialRampToValueAtTime(0.001, now + clapDelay + 0.055);
        
        clapOsc.connect(clapGain);
        clapGain.connect(this.ctx.destination);
        
        clapOsc.start(now + clapDelay);
        clapOsc.stop(now + clapDelay + 0.06);
      }
    } catch (e) {
      console.warn('Cheer audio play failed:', e);
    }
  }
}

// Particle Fireworks Effect for Level Up or Badge Unlocking using motion/react
const Fireworks = () => {
  const particles = Array.from({ length: 160 });
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden bg-transparent">
      {particles.map((_, i) => {
        // Multi-centered fireworks sources to spawn from multiple coordinates across the screen
        const centers = ['25%', '50%', '75%'];
        const leftSource = centers[i % centers.length];
        const topSource = i % 2 === 0 ? '35%' : '45%';
        const angle = (i * 360) / (160 / centers.length) + Math.random() * 15;
        const speed = 150 + Math.random() * 280;
        const color = `hsl(${Math.random() * 360}, 100%, 65%)`;
        const size = 6 + Math.random() * 8;
        const delay = Math.random() * 0.45;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full shadow-[0_0_10px_currentColor]"
            style={{
              backgroundColor: color,
              color: color,
              width: size,
              height: size,
              left: leftSource,
              top: topSource,
            }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0.9, 0.4, 0],
              scale: [1, 1.8, 0.9, 0],
              x: Math.cos((angle * Math.PI) / 180) * speed,
              y: Math.sin((angle * Math.PI) / 180) * speed + 220, // deeper gravitational falling
            }}
            transition={{
              duration: 2.8 + Math.random() * 1.5,
              ease: 'easeOut',
              delay
            }}
          />
        );
      })}
    </div>
  );
};

export const INITIAL_GAMES: Game[] = [
  {
    id: 'TC00001',
    title: '🎯 Nhấp Chuột Nhanh Tay',
    category: 'Trò chơi luyện chuột',
    reward: '+30⭐',
    status: 'Đang hoạt động',
    description: 'Nhanh tay nhấp chuột trái, kích đúp hoặc rê chuột di chuyển chính xác theo đúng yêu cầu để phá kỷ lục nhận sao thưởng!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'mouse_practice',
    subject: 'tin_hoc',
    grade: 3
  },
  {
    id: 'TC00002',
    title: '🚀 Người Hùng Bàn Phím',
    category: 'Trò chơi luyện phím',
    reward: '+30⭐',
    status: 'Đang hoạt động',
    description: 'Nhập đúng các nút chữ cái hoặc ký tự rực rỡ đang rơi rụng từ trên cao để làm nổ hạt bụi dọn sạch bàn học tập nhé!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'keyboard_practice',
    subject: 'tin_hoc',
    grade: 3
  },
  {
    id: 'TC00003',
    title: '🧩 Lật Thẻ Trí Nhớ',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/đôi',
    status: 'Đang hoạt động',
    description: 'Nhấp chuột để lật và ghép các đôi thẻ có mối liên quan giữa Thiết bị & Chức năng tương ứng. Rèn luyện sự nhanh mắt!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'memory_cards',
    subject: 'tin_hoc',
    grade: 3
  },
  {
    id: 'TC00004',
    title: '🎯 Trắc Nghiệm Nhanh',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/câu',
    status: 'Đang hoạt động',
    description: 'Đếm ngược 20 giây cho mỗi đáp án! Bạn cần suy nghĩ cực tốc cứu hộ robot trả lời câu hỏi xuất sắc nhất.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'speed_quiz',
    subject: 'tin_hoc',
    grade: 4
  },
  {
    id: 'TC00005',
    title: '🏎️ Đua Xe Tin Học',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/món',
    status: 'Đang hoạt động',
    description: 'Lái xe thông minh dọc quốc lộ an toàn! Nhấp xe thu nhặt đúng linh kiện thiết bị Tin học và né xa các vật cản đồ ăn.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'racing',
    subject: 'tin_hoc',
    grade: 4
  },
  {
    id: 'TC00006',
    title: '💰 Ai Là Triệu Phú Nhí',
    category: 'Trò chơi luyện tập',
    reward: '+20⭐/mốc',
    status: 'Đang hoạt động',
    description: 'Chinh phục bậc thang học tập với câu hỏi kinh điển! Vượt qua các mốc điểm và rinh cúp giải thưởng dũng sỹ.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'millionaire',
    subject: 'tin_hoc',
    grade: 5
  },
  {
    id: 'TC00007',
    title: '🎡 Vòng Quay May Mắn',
    category: 'Trò chơi luyện tập',
    reward: '+10-50⭐',
    status: 'Đang hoạt động',
    description: 'Bạn tích luỹ được nhiều lượt may mắn sau khi hoàn thành bài học? Hãy xoay kim để nhận ngẫu nhiên điểm ⭐ khủng.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'lucky_wheel',
    subject: 'tin_hoc',
    grade: 5
  },
  
  // Math (Toán) Games
  {
    id: 'TC_M_1',
    title: '🎡 Vòng Quay Số Học Lớp 1',
    category: 'Trò chơi luyện tập',
    reward: '+10-50⭐',
    status: 'Đang hoạt động',
    description: 'Xoay kim nhận thưởng sao lấp lánh và tranh tài rèn luyện tính toán đếm số từ 1 đến 5!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'lucky_wheel',
    subject: 'toan',
    grade: 1
  },
  {
    id: 'TC_M_2',
    title: '🧩 Lật Thẻ Phép Cộng Lớp 2',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/đôi',
    status: 'Đang hoạt động',
    description: 'Ghép đôi các phép toán cộng có nhớ trong phạm vi 100 với kết quả tương ứng chính xác nhất nhé.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'memory_cards',
    subject: 'toan',
    grade: 2
  },
  {
    id: 'TC_M_3',
    title: '⏱️ Đấu Trường Trắc Nghiệm Lớp 3',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/câu',
    status: 'Đang hoạt động',
    description: 'Suy nghĩ cực nhanh chọn đúng đáp án cho các câu hỏi về số trong phạm vi 1000 trong vòng 20 giây!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'speed_quiz',
    subject: 'toan',
    grade: 3
  },
  {
    id: 'TC_M_4',
    title: '🏆 Triệu Phú Số To Lớp 4',
    category: 'Trò chơi luyện tập',
    reward: '+20⭐/mốc',
    status: 'Đang hoạt động',
    description: 'Bộc phá kiến thức về các số trong phạm vi 100 000 để giành cúp dũng sĩ triệu phú nhí.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'millionaire',
    subject: 'toan',
    grade: 4
  },
  {
    id: 'TC_M_5',
    title: '🏎️ Đua Xe Phân Số Lớp 5',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/món',
    status: 'Đang hoạt động',
    description: 'Lái xe khéo léo thu lượm đúng các phân số bằng nhau và tránh xa chướng ngại vật!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'racing',
    subject: 'toan',
    grade: 5
  },

  // Vietnamese (Tiếng Việt) Games
  {
    id: 'TC_TV_1',
    title: '⏱️ Đố Vui Tìm Chữ Lớp 1',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/câu',
    status: 'Đang hoạt động',
    description: 'Trắc nghiệm phản xạ nhanh nhận biết âm A, B và ghép vần cùng bé ba ba.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'speed_quiz',
    subject: 'tieng_viet',
    grade: 1
  },
  {
    id: 'TC_TV_2',
    title: '🧩 Ghép Thẻ Trực Tuyến Lớp 2',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/đôi',
    status: 'Đang hoạt động',
    description: 'Luyện lật và ghép các đôi thẻ từ ngữ chỉ thời gian với nhau thật nhanh mắt.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'memory_cards',
    subject: 'tieng_viet',
    grade: 2
  },
  {
    id: 'TC_TV_3',
    title: '🎡 Vòng Quay Vần Việt Lớp 3',
    category: 'Trò chơi luyện tập',
    reward: '+10-50⭐',
    status: 'Đang hoạt động',
    description: 'Vòng quay may mắn nhận điểm thưởng sau khi vượt qua các bài đọc hiểu Tiếng Việt Lớp 3.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'lucky_wheel',
    subject: 'tieng_viet',
    grade: 3
  },
  {
    id: 'TC_TV_4',
    title: '🏆 Triệu Phú Ngữ Pháp Lớp 4',
    category: 'Trò chơi luyện tập',
    reward: '+20⭐/mốc',
    status: 'Đang hoạt động',
    description: 'Thách thức bản thân với câu hỏi ngữ pháp tìm danh từ, động từ dũng sĩ triệu phú.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'millionaire',
    subject: 'tieng_viet',
    grade: 4
  },
  {
    id: 'TC_TV_5',
    title: '🏎️ Đua Xe Tập Đọc Lớp 5',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/món',
    status: 'Đang hoạt động',
    description: 'Điều khiển xe thu nhặt đúng các từ láy và từ ghép Tiếng Việt trên đường đi.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'racing',
    subject: 'tieng_viet',
    grade: 5
  },

  // English (Tiếng Anh) Games
  {
    id: 'TC_EN_1',
    title: '⏱️ Alphabet Fun Quiz Grade 1',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/câu',
    status: 'Đang hoạt động',
    description: 'Fast quiz on alphabet sounds /b/ and simple greetings: Hello, Hi, Bye!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'speed_quiz',
    subject: 'tieng_anh',
    grade: 1
  },
  {
    id: 'TC_EN_2',
    title: '🧩 Word Memory Challenge Grade 2',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/đôi',
    status: 'Đang hoạt động',
    description: 'Match English vocabulary words with their meanings in this fun memory game.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'memory_cards',
    subject: 'tieng_anh',
    grade: 2
  },
  {
    id: 'TC_EN_3',
    title: '🎡 Fortune Word Spin Grade 3',
    category: 'Trò chơi luyện tập',
    reward: '+10-50⭐',
    status: 'Đang hoạt động',
    description: 'Spin to win star points and test your vocabulary with basic topics.',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'lucky_wheel',
    subject: 'tieng_anh',
    grade: 3
  },
  {
    id: 'TC_EN_4',
    title: '🏆 English Master Trivia Grade 4',
    category: 'Trò chơi luyện tập',
    reward: '+20⭐/mốc',
    status: 'Đang hoạt động',
    description: 'Climb the ladder of English knowledge of adjectives and structures to claim the cup!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'millionaire',
    subject: 'tieng_anh',
    grade: 4
  },
  {
    id: 'TC_EN_5',
    title: '🏎️ Speeding Verbs Grade 5',
    category: 'Trò chơi luyện tập',
    reward: '+5⭐/món',
    status: 'Đang hoạt động',
    description: 'Drive the educational racing car to collect clean English action verbs!',
    gameAreaType: 'link',
    externalLink: 'built-in',
    builtinKey: 'racing',
    subject: 'tieng_anh',
    grade: 5
  }
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // ⚪ THƯỜNG (Tân binh)
  {
    id: 'gift_bike',
    title: '🚴 Xe Đạp Thần Tốc',
    icon: '🚴',
    cost: 16,
    desc: 'Phương tiện rèn luyện sức khỏe dẻo dai hằng ngày của bé.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_cup_heart',
    title: '♥️ Trái Tim Hồng',
    icon: '♥️',
    cost: 18,
    desc: 'Lòng nhân ái chứa đựng tình yêu thương của bé dành cho mọi người.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_happy_cat',
    title: '😺 Mèo Vui Vẻ',
    icon: '😺',
    cost: 20,
    desc: 'Chú mèo tinh nghịch mang nụ cười giòn giã đến mọi ngóc ngách.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_puppy',
    title: '🐶 Cún Con Học Bài',
    icon: '🐶',
    cost: 22,
    desc: 'Người bạn trung thành luôn túc trực kế bên động viên bé làm bài.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_bunny',
    title: '🐰 Thỏ Trắng Nhảy Nhót',
    icon: '🐰',
    cost: 24,
    desc: 'Thỏ ngọc đáng yêu nhảy tưng bừng chúc mừng bé hoàn thành bài tập.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_mouse',
    title: '🐭 Chuột Nhỏ Nhanh Trí',
    icon: '🐭',
    cost: 26,
    desc: 'Chú chuột thông minh lanh lợi giúp bé click chuột siêu nhanh nhẹn.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_hamster',
    title: '🐹 Hamster Ham Ăn',
    icon: '🐹',
    cost: 28,
    desc: 'Cục bông biết đi lúc nào cũng nhai nhóp nhép siêu kute phô mai que.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_koala',
    title: '🐨 Gấu Koala Ú',
    icon: '🐨',
    cost: 30,
    desc: 'Thích leo cây bạch đàn ngủ khò khò nhưng học Tin học rất đỉnh.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_cow',
    title: '🐮 Bò Sữa Chăm Chỉ',
    icon: '🐮',
    cost: 32,
    desc: 'Chăm chỉ gặm cỏ để vắt sữa ngọt ngào bồi dưỡng trí tuệ lập trình.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_pig',
    title: '🐷 Heo Hồng Ú Nu',
    icon: '🐷',
    cost: 34,
    desc: 'Ủn ỉn gõ bàn phím nhịp nhàng phát ra bài hát vui nhộn.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_frog',
    title: '🐸 Ếch Ộp Hiếu Động',
    icon: '🐸',
    cost: 35,
    desc: 'Ngồi đài sen nhảy xa vạn dặm vươn tới trời mây tri thức bao la.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },

  // 🟢 ĐẶC BIỆT (Bổ sung thêm)
  {
    id: 'gift_horse_rider',
    title: '🏇 Kỵ Sĩ Đua Ngựa',
    icon: '🏇',
    cost: 52,
    desc: 'Xốc tới phía trước with tốc độ phi mã giành lấy vương miện học tập.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_fox',
    title: '🦊 Cáo Đỏ Thông Thái',
    icon: '🦊',
    cost: 55,
    desc: 'Cáo thông minh giải quyết mọi câu đố thuật toán phức tạp nhất.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_bear',
    title: '🐻 Gấu Nâu Dũng Mãnh',
    icon: '🐻',
    cost: 58,
    desc: 'Lấy mật ong ngọt lịm thưởng cho tinh thần bền chí luyện thi của em.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_panda',
    title: '🐼 Báo Trúc Đáng Yêu',
    icon: '🐼',
    cost: 62,
    desc: 'Gấu trúc ôm tre dễ thương nhất lớp vô đối trong môn gõ bàn phím.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_boar',
    title: '🐗 Lợn Rừng Húc Lỗi',
    icon: '🐗',
    cost: 65,
    desc: 'Húc bay mọi bức tường ngăn cản sự sáng tạo của bé yêu Tin học.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_monkey',
    title: '🐵 Khỉ Con Nhanh Nhảu',
    icon: '🐵',
    cost: 68,
    desc: 'Leo trèo nhanh thoăn thoắt chuyền cành cây tư duy siêu mượt.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_goat',
    title: '🐏 Cừu Đực Dũng Cảm',
    icon: '🐏',
    cost: 72,
    desc: 'Bộ lông bồng bềnh ấp ủ ước mơ kiến tạo công nghệ vĩ đại của trẻ thơ.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },

  // 🔵 QUÝ (Bổ sung thêm)
  {
    id: 'gift_tiger_gold',
    title: '🐯 Hổ Vàng Mạnh Mẽ',
    icon: '🐯',
    cost: 125,
    desc: 'Chúa sơn lâm bảo hộ dũng sĩ vững tay chèo vượt trăm ải điểm 10.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_lion_pride',
    title: '🦁 Sư Tử Kiêu Hùng',
    icon: '🦁',
    cost: 130,
    desc: 'Bờm vàng oai vệ tượng trưng cho tinh thần dẫn đầu bảng xếp hạng.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_wolf_lone',
    title: '🐺 Sói Xám Hoang Dã',
    icon: '🐺',
    cost: 135,
    desc: 'Lòng kiên trì bền bỉ không ngại đêm thâu làm chủ thế giới thuật toán.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_gorilla',
    title: '🦍 Gorilla Kình Lực',
    icon: '🦍',
    cost: 142,
    desc: 'Mãnh thú siêu cường bảo hộ, tháo dỡ gỡ rối code cực nhanh chóng.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_deer',
    title: '🦌 Tuần Lộc Giáng Sinh',
    icon: '🦌',
    cost: 145,
    desc: 'Phương tiện chở đầy rương vàng chứa ngàn sao may mắn tặng cho bé ngoan.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_eagle',
    title: '🦅 Đại Bàng Tung Cánh',
    icon: '🦅',
    cost: 155,
    desc: 'Lướt gió chín tầng mây mang tầm mắt bao quát kiến thức dồi dào tối tân.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_chicken_cute',
    title: '🐣 Gà Con Sơ Sinh',
    icon: '🐣',
    cost: 160,
    desc: 'Chui ra từ vỏ trứng chúc bé có những khởi sắc vượt bậc lấp lánh thi cử.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_penguin',
    title: '🐧 Cánh Cụt Bắc Cực',
    icon: '🐧',
    cost: 170,
    desc: 'Quý ông lịch lãm diện vest đen trượt băng mang lại điểm số siêu mượt.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_whale',
    title: '🐬 Cá Heo Đại Dương',
    icon: '🐬',
    cost: 180,
    desc: 'Cá heo nhào lộn nâng đôi cánh trí tuệ Tin học của em bay bổng mênh mông.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },

  // 🟣 SỬ THI (Bổ sung thêm)
  {
    id: 'gift_octopus_epic',
    title: '🐙 Bạch Tuộc Huyền Bí',
    icon: '🐙',
    cost: 250,
    desc: 'Trùm thủy quái tám vòi gõ tám phím cực chất siêu hạng thần tốc.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_crab_shell',
    title: '🦀 Cua Ngọc Cờ Đỏ',
    icon: '🦀',
    cost: 280,
    desc: 'Cặp càng chắc khỏe giải quyết triệt để lỗi bug ngáng chân bé gõ phím.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_turtle',
    title: '🐢 Rùa Biển Trường Thọ',
    icon: '🐢',
    cost: 310,
    desc: 'Bền bỉ dẻo dai giong buồm ra khơi, chậm mà chắc giành chiến thắng rực rỡ.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_butterfly',
    title: '🦋 Bướm Lam Thiên Thần',
    icon: '🦋',
    cost: 320,
    desc: 'Vũ điệu rực rỡ sắc thắm tiếp sức sáng tạo thiết kế đồ họa đỉnh cao.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_bee_honey',
    title: '🐝 Ong Mật Chăm Chỉ',
    icon: '🐝',
    cost: 350,
    desc: 'Bay tìm mật ngọt đúc kết bông hoa vàng 10 tròn trĩnh hiếu học.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_snail_speed',
    title: '🐌 Ốc Sên Thần Tốc',
    icon: '🐌',
    cost: 370,
    desc: 'Tuy mang vỏ ốc nặng nề nhưng luôn kiên nhẫn vượt ngàn dặm học tập.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_sun_bright',
    title: '🌞 Thái Dương Rực Hồng',
    icon: '🌞',
    cost: 400,
    desc: 'Ánh dương rạng ngời xua tan nỗi sầu khó học, sưởi ấm ước mơ trẻ thơ.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },

  // 🟠 HUYỀN THOẠI (Bổ sung thêm)
  {
    id: 'gift_flower',
    title: '🌺 Hoa Dâm Bụt',
    icon: '🌺',
    cost: 490,
    desc: 'Quà tặng xinh đẹp lưu niệm tô sắc cho tủ đồ lưu niệm của bé ngoan.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_snowman',
    title: '⛄ Người Tuyết Ấm Áp',
    icon: '⛄',
    cost: 520,
    desc: 'Chế tạo người tuyết thông thái dẫn đường khám phá tài nguyên số học đường.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_biohazard',
    title: '☣️ Dấu Ấn Bảo Mật',
    icon: '☣️',
    cost: 620,
    desc: 'Giải mã được ký tự bảo mật cao cấp nhất vượt qua bức tường an ninh ảo.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_emblem_royalty',
    title: '⚜️ Vương Huy Hoàng Gia',
    icon: '⚜️',
    cost: 720,
    desc: 'Phù hiệu đẳng cấp đánh dấu tên tuổi lọt vào tháp vinh danh Tin học.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },

  // 🌱 Tân Binh gốc
  {
    id: 'gift_rookie',
    title: '🌱 Tân Binh',
    icon: '🌱',
    cost: 15,
    desc: 'Avatar Tân binh chập chững bước đi đầu tiên trong thế giới Tin học bí ẩn.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_footprint',
    title: '🐾 Dấu Chân Động Vật',
    icon: '🐾',
    cost: 20,
    desc: 'Dấu chân tí hon của các em thú cưng dễ thương lưu lại trên bàn phím.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_bronze',
    title: '🥉 Đồng',
    icon: '🥉',
    cost: 25,
    desc: 'Chứng nhận nỗ lực rèn luyện hoàn thành các bài học tích cực ban đầu.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_silver',
    title: '🥈 Bạc',
    icon: '🥈',
    cost: 30,
    desc: 'Huy hiệu Bạc lấp lánh khẳng định quyết tâm chinh phục mốc bài tập khó.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },
  {
    id: 'gift_gold',
    title: '🥇 Vàng',
    icon: '🥇',
    cost: 35,
    desc: 'Danh hiệu Vàng quý giá dành tặng cho thợ gõ chuyên nghiệp chăm học.',
    rarity: 'Thường',
    raritySymbol: '⚪ Thường',
    themeClass: {
      bg: 'bg-white hover:shadow-slate-200',
      border: 'border-slate-200 hover:border-slate-350',
      text: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-250',
      iconBg: 'bg-slate-50 border-slate-100'
    }
  },

  // 🟢 ĐẶC BIỆT (Nhân tài & Cảnh sát)
  {
    id: 'gift_genius',
    title: '🎓 Thiên Tài',
    icon: '🎓',
    cost: 50,
    desc: 'Avatar trí tuệ bộc phá, tăng khả năng tư duy logic cho dũng sĩ.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_detective',
    title: '🔍 Thám Tử',
    icon: '🔍',
    cost: 60,
    desc: 'Kính lúp thám tử đi săn lùng lỗi sai lầm hoặc lỗi bug lập trình siêu đẳng.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_prodigy',
    title: '🏅 Thần đồng',
    icon: '🏅',
    cost: 70,
    desc: 'Giải thưởng cao nhất biểu dương những học sinh xuất chúng về trí lực.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_teacher',
    title: '👨‍🏫 Giáo Viên',
    icon: '👨‍🏫',
    cost: 80,
    desc: 'Biểu tượng người đưa đò thầm lặng truyền đạt tri thức Tin học bổ ích.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_doctor',
    title: '👨‍⚕️ Bác Sĩ',
    icon: '👨‍⚕️',
    cost: 90,
    desc: 'Bác sĩ sửa chữa phần mềm, diệt virus hồi phục năng lượng cho máy tính.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },
  {
    id: 'gift_police',
    title: '👮 Cảnh Sát',
    icon: '👮',
    cost: 100,
    desc: 'Cảnh sát an ninh mạng tuần tra bảo vệ an toàn cho bé trên Internet.',
    rarity: 'Đặc Biệt',
    raritySymbol: '🟢 Đặc Biệt',
    themeClass: {
      bg: 'bg-white hover:shadow-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-350',
      text: 'text-emerald-900',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50/55 border-emerald-100'
    }
  },

  // 🔵 QUÝ (Đỉnh cao & Vũ trụ)
  {
    id: 'gift_robot',
    title: '🤖 Robot',
    icon: '🤖',
    cost: 120,
    desc: 'Rô-bốt tự động hóa kéo thả khối lệnh Scratch thông minh, trợ thủ học tập.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_astronaut',
    title: '👨‍🚀 Phi Hành Gia',
    icon: '👨‍🚀',
    cost: 140,
    desc: 'Hộ tống các dũng sĩ bay lượn lơ lửng ngoài vũ trụ tri thức Tin học bao la.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_earth',
    title: '🌍 Trái Đất',
    icon: '🌍',
    cost: 160,
    desc: 'Hành tinh xanh nơi chúng ta học tập trực tuyến, kết nối cùng bạn bè năm châu.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-255 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_moon',
    title: '🌙 Mặt Trăng',
    icon: '🌙',
    cost: 180,
    desc: 'Ánh trăng dịu mát dẫn lối đồng hành cùng những đêm tự học hiệu quả.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },
  {
    id: 'gift_star',
    title: '⭐ Ngôi Sao',
    icon: '⭐',
    cost: 200,
    desc: 'Ngôi sao may mắn rực rỡ bảo hộ vinh quang luôn thuộc về học sinh siêng năng.',
    rarity: 'Quý',
    raritySymbol: '🔵 Quý',
    themeClass: {
      bg: 'bg-white hover:shadow-blue-105',
      border: 'border-blue-250 hover:border-blue-400',
      text: 'text-blue-900',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50/55 border-blue-100'
    }
  },

  // 🟣 SỬ THI (Vũ trụ & Không gian)
  {
    id: 'gift_comet',
    title: '☄️ Sao Chổi',
    icon: '☄️',
    cost: 240,
    desc: 'Thiên sứ tốc độ xẹt qua tầm mắt mang lại muôn vàn phép màu may mắn.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_meteor',
    title: '🌠 Thiên Thạch',
    icon: '🌠',
    cost: 270,
    desc: 'Khung thạch vũ trụ đem lại nguồn năng lượng bùng nổ, bứt phá bài thi vượt trội.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_satellite',
    title: '🛰️ Vệ Tinh',
    icon: '🛰️',
    cost: 300,
    desc: 'Vệ tinh truyền sóng mạng internet tốc độ vũ bão, không sợ giật lag khi làm bài tập.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_rocket',
    title: '🚀 Tên Lửa',
    icon: '🚀',
    cost: 330,
    desc: 'Động cơ phản lực đẩy tốc độ tích lũy sao của bé bay cao vút lên trời xanh.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_ufo',
    title: '🛸 Tàu Không Gian',
    icon: '🛸',
    cost: 360,
    desc: 'Chiến hạm bay của người ngoài hành tinh mang văn minh vũ trụ vượt cấp.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },
  {
    id: 'gift_galaxy',
    title: '🌌 Thiên Hà',
    icon: '🌌',
    cost: 400,
    desc: 'Vòng xoáy hành tinh tráng lệ chứa đựng hàng tỷ tinh thể tri thức rực rỡ học đường.',
    rarity: 'Sử Thi',
    raritySymbol: '🟣 Sử Thi',
    themeClass: {
      bg: 'bg-white hover:shadow-purple-105',
      border: 'border-purple-250 hover:border-purple-400',
      text: 'text-purple-900',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50/55 border-purple-100'
    }
  },

  // 🟠 HUYỀN THOẠI (Không gian & Anh hùng & Thần thú)
  {
    id: 'gift_wizard',
    title: '🧙 Pháp Sư',
    icon: '🧙',
    cost: 450,
    desc: 'Bậc thầy ảo thuật chế tạo nước thần nhân đôi may mắn kéo dài cả tuần lễ.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_archer',
    title: '🏹 Cung Thủ',
    icon: '🏹',
    cost: 500,
    desc: 'Mũi tên sấm sét dẫn đường bắn bách phát bách trúng trực diện hồng tâm bài học.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_shield_knight',
    title: '🛡️ Khiên Hiệp Sĩ',
    icon: '🛡️',
    cost: 550,
    desc: 'Khiên phòng ngự thép bảo vệ dũng sĩ an toàn trước mọi lỗi sai sót ngẫu nhiên.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_warrior',
    title: '⚔️ Chiến Binh',
    icon: '⚔️',
    cost: 600,
    desc: 'Thanh kiếm thép dũng mãnh chém tan những rào cản bài tập thử thách siêu hóc búa.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_princess',
    title: '👸 Công Chúa',
    icon: '👸',
    cost: 650,
    desc: 'Nàng công chúa kiêu sa bảo hộ mang lại 150% điểm tinh linh cho học sinh giỏi.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_prince',
    title: '👑 Hoàng Tử',
    icon: '👑',
    cost: 700,
    desc: 'Vương miện danh vọng hoàng tộc tôn vinh sự lãnh đạo xuất sắc trong học nhóm.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_dragon_knight',
    title: '🐲 Kỵ Sĩ Rồng',
    icon: '🐲',
    cost: 750,
    desc: 'Mãnh thú rồng lửa phun trào sức mạnh lý thuyết, thi đâu đỗ đó không sợ nản chí.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },
  {
    id: 'gift_dino',
    title: '🦖 Khủng long',
    icon: '🦖',
    cost: 800,
    desc: 'Khủng long bạo chúa uy lực dọn sạch chướng ngại vật giúp bé ung dung tiến bước học tập.',
    rarity: 'Huyền Thoại',
    raritySymbol: '🟠 Huyền Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-amber-100',
      border: 'border-amber-250 hover:border-amber-400',
      text: 'text-amber-955',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50/55 border-amber-100'
    }
  },

  // 🔴 THẦN THOẠI (Anh hùng & Thần thú)
  {
    id: 'gift_fairy',
    title: '🧚 Tiên Nhỏ',
    icon: '🧚',
    cost: 900,
    desc: 'Đôi cánh lấp lánh ban phép lành dọn dẹp lỗi lầm thắp sáng bài thi tuyệt trần.',
    rarity: 'Thần Thoại',
    raritySymbol: '🔴 Thần Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-rose-100',
      border: 'border-rose-250 hover:border-rose-450',
      text: 'text-rose-900',
      badge: 'bg-rose-50 text-rose-750 border-rose-200',
      iconBg: 'bg-rose-50/55 border-rose-100'
    }
  },
  {
    id: 'gift_unicorn',
    title: '🦄 Kỳ Lân',
    icon: '🦄',
    cost: 1000,
    desc: 'Thần thú một sừng lộng lẫy mang hào quang sắc cầu vồng ấm áp cho lớp học.',
    rarity: 'Thần Thoại',
    raritySymbol: '🔴 Thần Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-rose-100',
      border: 'border-rose-250 hover:border-rose-450',
      text: 'text-rose-900',
      badge: 'bg-rose-50 text-rose-750 border-rose-200',
      iconBg: 'bg-rose-50/55 border-rose-100'
    }
  },
  {
    id: 'gift_light_spirit',
    title: '🌟 Tinh Linh Ánh Sáng',
    icon: '🌟',
    cost: 1100,
    desc: 'Tinh thể rực rỡ thu hút mọi điểm tốt, mang may mắn thi cử viên mãn cho bé cưng.',
    rarity: 'Thần Thoại',
    raritySymbol: '🔴 Thần Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-rose-100',
      border: 'border-rose-250 hover:border-rose-450',
      text: 'text-rose-900',
      badge: 'bg-rose-50 text-rose-750 border-rose-200',
      iconBg: 'bg-rose-50/55 border-rose-100'
    }
  },
  {
    id: 'gift_phoenix',
    title: '🔥 Phượng Hoàng',
    icon: '🔥',
    cost: 1200,
    desc: 'Cánh chim lửa huyền học biểu trưng cho tinh thần học tập quật khởi, kiên quyết bền chí.',
    rarity: 'Thần Thoại',
    raritySymbol: '🔴 Thần Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-rose-100',
      border: 'border-rose-250 hover:border-rose-450',
      text: 'text-rose-900',
      badge: 'bg-rose-50 text-rose-750 border-rose-200',
      iconBg: 'bg-rose-50/55 border-rose-100'
    }
  },
  {
    id: 'gift_dragon_king',
    title: '🐉 Long Vương',
    icon: '🐉',
    cost: 1300,
    desc: 'Vua rồng uy nghiêm chốn đại dương mở mang bể tri thức sâu rộng mênh mông.',
    rarity: 'Thần Thoại',
    raritySymbol: '🔴 Thần Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-rose-100',
      border: 'border-rose-250 hover:border-rose-450',
      text: 'text-rose-900',
      badge: 'bg-rose-50 text-rose-750 border-rose-200',
      iconBg: 'bg-rose-50/55 border-rose-100'
    }
  },
  {
    id: 'gift_guardian_gem',
    title: '💎 Thần Hộ Mệnh',
    icon: '💎',
    cost: 1400,
    desc: 'Viên ngọc thần cất giấu sức mạnh bảo vệ kết quả học, duy trì streak học không đứt gãy.',
    rarity: 'Thần Thoại',
    raritySymbol: '🔴 Thần Thoại',
    themeClass: {
      bg: 'bg-white hover:shadow-rose-100',
      border: 'border-rose-250 hover:border-rose-450',
      text: 'text-rose-900',
      badge: 'bg-rose-50 text-rose-750 border-rose-200',
      iconBg: 'bg-rose-50/55 border-rose-100'
    }
  },

  // 👑 TỐI THƯỢNG
  {
    id: 'gift_cup_champion',
    title: '🏆 Quán Quân',
    icon: '🏆',
    cost: 1800,
    desc: 'Phần thưởng tối thượng, đỉnh phong vinh quanh tối cao duy nhất của dũng sĩ tin học giỏi nhất!',
    rarity: 'Tối Thượng',
    raritySymbol: '👑 Tối Thượng',
    themeClass: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-yellow-100',
      border: 'border-yellow-350 hover:border-yellow-500',
      text: 'text-yellow-950 font-black',
      badge: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
      iconBg: 'bg-yellow-100 border-yellow-200'
    }
  }
];

export default function App() {
  // Current authenticated user session profile
  const [currUser, setCurrUser] = useState<StudentProfile | null>(null);
  const [role, setRole] = useState<UserRole>('student');

  // Modular collections of lessons and questions editable by admin
  const [lessonsList, setLessonsList] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('lms_lessons_list');
    const rawLessons = saved ? JSON.parse(saved) : INITIAL_LESSONS;
    
    // Migrate program types on both stored and default files
    const migratedRaw: Lesson[] = rawLessons.map((l: any) => {
      let subj = l.id?.startsWith('lic3-') ? 'tin_hoc' : l.subject;
      let prog = l.programType === 'GDPT2018' || l.programType === 'GDPT 2018' 
        ? 'Kết nối tri thức với cuộc sống' 
        : l.programType === 'IC3SPARK' || l.programType === 'IC3 SPARK'
          ? 'Tin học Quốc tế IC3 Spark'
          : l.programType;
      
      let topic = l.topicName;
      if (prog === 'Kết nối tri thức với cuộc sống' && (subj === 'tin_hoc' || subj === 'Tin học')) {
        const norm = (topic || '').toLowerCase().trim();
        if (norm.includes('chủ đề 5')) {
          topic = 'Chủ đề 5: Tin học Ứng dụng';
        } else if (norm.includes('chủ đề 6')) {
          topic = 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính';
        }
      }
      
      return {
        ...l,
        subject: subj,
        programType: prog,
        topicName: topic
      };
    });

    const merged = [...migratedRaw];
    INITIAL_LESSONS.forEach(l => {
      let subj = l.id?.startsWith('lic3-') ? 'tin_hoc' : l.subject;
      let prog = l.programType === 'GDPT2018' || l.programType === 'GDPT 2018'
        ? 'Kết nối tri thức với cuộc sống'
        : l.programType === 'IC3SPARK' || l.programType === 'IC3 SPARK'
          ? 'Tin học Quốc tế IC3 Spark'
          : l.programType;

      let topic = l.topicName;
      if (prog === 'Kết nối tri thức với cuộc sống' && (subj === 'tin_hoc' || subj === 'Tin học')) {
        const norm = (topic || '').toLowerCase().trim();
        if (norm.includes('chủ đề 5')) {
          topic = 'Chủ đề 5: Tin học Ứng dụng';
        } else if (norm.includes('chủ đề 6')) {
          topic = 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính';
        }
      }

      const mappedL = {
        ...l,
        subject: subj,
        programType: prog,
        topicName: topic
      };
      if (!merged.some(m => m.id === mappedL.id)) {
        merged.push(mappedL);
      } else {
        // Update items in raw lessons if their programType is outdated, if they are missing subject, or if it's an IC3 lesson
        const idx = merged.findIndex(m => m.id === mappedL.id);
        if (
          merged[idx].programType === 'GDPT2018' || 
          merged[idx].programType === 'IC3SPARK' ||
          !merged[idx].subject ||
          mappedL.id.startsWith('lic3-')
        ) {
          merged[idx] = mappedL;
        }
      }
    });

    localStorage.setItem('lms_lessons_list', JSON.stringify(merged));
    return merged;
  });
  const [questionsList, setQuestionsList] = useState<Question[]>(() => {
    const saved = localStorage.getItem('lms_questions_list');
    if (!saved) return INITIAL_QUESTIONS;
    const parsed: Question[] = JSON.parse(saved);
    const merged = [...parsed];
    INITIAL_QUESTIONS.forEach(q => {
      if (!merged.some(m => m.id === q.id)) {
        merged.push(q);
      }
    });
    return merged;
  });

  // Dynamic lists for Badge, Level and Reward systems
  const [badgesList, setBadgesList] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('lms_badges_list');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [levelsList, setLevelsList] = useState<Level[]>(() => {
    const saved = localStorage.getItem('lms_levels_list');
    if (saved) return JSON.parse(saved);
    const defaults: Level[] = [
      { index: 1, level: "Cấp độ 0", starsRequired: 0 },
      { index: 2, level: "Cấp độ 1", starsRequired: 100 }
    ];
    for (let i = 2; i <= 100; i++) {
      defaults.push({ index: i + 1, level: `Cấp độ ${i}`, starsRequired: (i - 1) * 200 });
    }
    return defaults;
  });

  const [shopItemsList, setShopItemsList] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem('lms_shop_items_list');
    return saved ? JSON.parse(saved) : INITIAL_SHOP_ITEMS;
  });

  const [gamesList, setGamesList] = useState<Game[]>(() => {
    const saved = localStorage.getItem('lms_games_list');
    return saved ? JSON.parse(saved) : INITIAL_GAMES;
  });

  const [studentsList, setStudentsList] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('lms_students_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: StudentRecord) => ({
            ...s,
            studentId: (s.studentId || '').replace(/^HS:\s*/i, 'HS')
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 's1', studentId: 'HS00001', fullname: 'Nguyễn Minh Tâm', username: 'hocsinh', password: '123', gender: 'Nam', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', xp: 1250, level: 5, streak: 10 },
      { id: 's2', studentId: 'HS00002', fullname: 'Lê Hoàng Bách', username: 'linhang_01', password: '123', gender: 'Nam', school: 'Tiểu học Trần văn Danh', grade: 3, className: '3.1', xp: 985, level: 4, streak: 5 },
      { id: 's3', studentId: 'HS00003', fullname: 'Phạm Ngọc Khánh', username: 'tuetrang', password: '123', gender: 'Nữ', school: 'Tiểu học Nguyễn Thị Nuôi', grade: 4, className: '4.2', xp: 852, level: 4, streak: 3 },
      { id: 's4', studentId: 'HS00004', fullname: 'Trần Văn Cường', username: 'van_cuong', password: '123', gender: 'Nam', school: 'Trường TH Nguyễn Huệ', grade: 5, className: '5.2', xp: 195, level: 1, streak: 1 },
      { id: 's5', studentId: 'HS00005', fullname: 'Phạm Hà Phương', username: 'haphuong_05', password: '123', gender: 'Nữ', school: 'Trường TH Lý Tự Trọng', grade: 4, className: '4.1', xp: 320, level: 2, streak: 2 }
    ];
  });

  const [teachersList, setTeachersList] = useState<TeacherRecord[]>(() => {
    const saved = localStorage.getItem('lms_teachers_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: TeacherRecord) => ({
            ...t,
            teacherId: (t.teacherId || '').replace(/^GV:\s*/i, 'GV')
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 't1', teacherId: 'GV00001', fullname: 'Thầy Tâm Rio 👑', username: 'admin', password: '123', gender: 'Nam', school: 'Tiểu học Trần văn Danh', subject: 'Tin học', grades: [3, 4, 5], classes: ['3.1', '3.2', '4.1', '5.1', '5.2'] },
      { id: 't2', teacherId: 'GV00002', fullname: 'Cô Hồng Nhung 🌸', username: 'teacher', password: '123', gender: 'Nữ', school: 'Tiểu học Trần văn Danh', subject: 'Tin học', grades: [3], classes: ['3.1', '3.3'] },
      { id: 't3', teacherId: 'GV00003', fullname: 'Cô Linh Lan', username: 'linhlan', password: '123', gender: 'Nữ', school: 'Tiểu học Nguyễn Thị Nuôi', subject: 'Toán', grades: [4, 5], classes: ['4.2', '5.2'] }
    ];
  });

  // Automatically save configuration lists whenever modified
  React.useEffect(() => {
    localStorage.setItem('lms_badges_list', JSON.stringify(badgesList));
  }, [badgesList]);

  React.useEffect(() => {
    localStorage.setItem('lms_levels_list', JSON.stringify(levelsList));
  }, [levelsList]);

  React.useEffect(() => {
    localStorage.setItem('lms_shop_items_list', JSON.stringify(shopItemsList));
  }, [shopItemsList]);

  React.useEffect(() => {
    localStorage.setItem('lms_games_list', JSON.stringify(gamesList));
  }, [gamesList]);

  React.useEffect(() => {
    localStorage.setItem('lms_students_list', JSON.stringify(studentsList));
  }, [studentsList]);

  React.useEffect(() => {
    localStorage.setItem('lms_teachers_list', JSON.stringify(teachersList));
  }, [teachersList]);

  React.useEffect(() => {
    localStorage.setItem('lms_lessons_list', JSON.stringify(lessonsList));
  }, [lessonsList]);

  React.useEffect(() => {
    localStorage.setItem('lms_questions_list', JSON.stringify(questionsList));
  }, [questionsList]);

  // Bidirectional Synchronization of Active Student Profile Session
  React.useEffect(() => {
    if (currUser && role === 'student') {
      setStudentsList(prev => {
        const index = prev.findIndex(s => s.username === currUser.username);
        if (index !== -1) {
          const match = prev[index];
          if (
            match.xp !== currUser.xp ||
            match.level !== currUser.level ||
            match.fullname !== currUser.fullname ||
            match.className !== currUser.className ||
            match.grade !== currUser.grade ||
            match.school !== currUser.school ||
            match.avatar !== currUser.avatar
          ) {
            const updated = [...prev];
            updated[index] = {
              ...match,
              xp: currUser.xp,
              level: currUser.level,
              fullname: currUser.fullname,
              className: currUser.className,
              grade: currUser.grade,
              school: currUser.school,
              avatar: currUser.avatar || match.avatar || '👦'
            };
            return updated;
          }
        }
        return prev;
      });
    }
  }, [currUser, role]);

  React.useEffect(() => {
    if (currUser && role === 'student') {
      const activeInDb = studentsList.find(s => s.username === currUser.username);
      if (!activeInDb) {
        setCurrUser(null);
        setRole('student');
        setActiveTab('home');
        triggerToast("⚠️ Tài khoản của em đã bị xoá khỏi hệ thống bởi Giáo viên hoặc Admin.");
      } else {
        if (
          currUser.xp !== activeInDb.xp ||
          currUser.level !== activeInDb.level ||
          currUser.fullname !== activeInDb.fullname ||
          currUser.className !== activeInDb.className ||
          currUser.grade !== activeInDb.grade ||
          currUser.school !== activeInDb.school ||
          currUser.avatar !== (activeInDb.avatar || currUser.avatar)
        ) {
          setCurrUser(prev => {
            if (!prev) return null;
            return {
              ...prev,
              xp: activeInDb.xp,
              level: activeInDb.level,
              fullname: activeInDb.fullname,
              className: activeInDb.className,
              grade: activeInDb.grade,
              school: activeInDb.school,
              avatar: activeInDb.avatar || prev.avatar || '👦'
            };
          });
        }
      }
    }
  }, [studentsList]);

  React.useEffect(() => {
    if (currUser && role === 'teacher') {
      const activeInDb = teachersList.find(t => t.username === currUser.username);
      if (!activeInDb) {
        setCurrUser(null);
        setRole('student');
        setActiveTab('home');
        triggerToast("⚠️ Tài khoản Giáo viên của quý Thầy/Cô đã bị xóa bởi quản trị viên.");
      } else {
        if (
          currUser.fullname !== activeInDb.fullname ||
          currUser.school !== activeInDb.school ||
          currUser.subject !== activeInDb.subject ||
          JSON.stringify(currUser.grades || []) !== JSON.stringify(activeInDb.grades || []) ||
          JSON.stringify(currUser.classes || []) !== JSON.stringify(activeInDb.classes || [])
        ) {
          setCurrUser(prev => {
            if (!prev) return null;
            return {
              ...prev,
              fullname: activeInDb.fullname,
              school: activeInDb.school,
              subject: activeInDb.subject,
              grades: activeInDb.grades || [],
              classes: activeInDb.classes || []
            };
          });
        }
      }
    }
  }, [teachersList]);

  // Active page selector state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [localTakeExamId, setLocalTakeExamId] = useState<string | null>(null);

  // Active subject selector state ('tin_hoc', 'tieng_viet', 'toan', 'tieng_anh')
  const [activeSubject, setActiveSubject] = useState<string>('tin_hoc');

  // Track student lesson progresses { [lessonId]: percentage }
  const [activeStudyProgress, setActiveStudyProgress] = useState<{ [lessonId: string]: number }>({
    'l3-1': 90, // mock initial preloaded value
    'l3-2': 0,
    'l3-3': 0,
    'l4-1': 0
  });

  // Floating notifications banner alerts
  const [toast, setToast] = useState<{ message: string; type?: 'normal' | 'level_up' | 'badge' } | null>(null);

  // Avatar changing modal trigger
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Synchronized subtab/nested tab for Student Profile view
  const [studentNestedTab, setStudentNestedTab] = useState<string>('progress');

  // Synchronized subtab/nested tab for Admin Panel view
  const [adminActiveTab, setAdminActiveTab] = useState<'students' | 'teachers' | 'lessons' | 'questions' | 'badges' | 'levels' | 'rewards' | 'games' | 'lesson_planner' | 'profile' | 'general_management'>('students');

  // Rewards store item redemption state
  const [purchasedRewards, setPurchasedRewards] = useState<string[]>([]);
  const [shopFilter, setShopFilter] = useState<string>('ALL');
  const [shopSearch, setShopSearch] = useState<string>('');

  // Synchronize student level dynamically based on totalCollectedXP and configured levels List
  React.useEffect(() => {
    if (currUser) {
      const totalSpent = purchasedRewards.reduce((sum, id) => {
        const item = shopItemsList.find(s => s.id === id);
        return sum + (item ? item.cost : 0);
      }, 0);
      const totalCollected = currUser.xp + totalSpent;
      const computedLevel = calculateLevelFromXP(totalCollected, levelsList);
      if (currUser.level !== computedLevel) {
        setCurrUser(prev => prev ? { ...prev, level: computedLevel } : null);
      }
    }
  }, [currUser?.xp, purchasedRewards, levelsList, shopItemsList]);

  // Auto-switch active subject if current subject is hidden
  React.useEffect(() => {
    const checkAndSwitchSubject = () => {
      try {
        const savedHidden = localStorage.getItem('lms_hidden_subjects');
        const hiddenSubs = savedHidden ? JSON.parse(savedHidden) : [];
        if (Array.isArray(hiddenSubs)) {
          const subMap: { [key: string]: string } = {
            'tin_hoc': 'Tin học',
            'tieng_viet': 'Tiếng Việt',
            'toan': 'Toán',
            'tieng_anh': 'Tiếng Anh'
          };
          const currentSubName = subMap[activeSubject];
          if (currentSubName && hiddenSubs.includes(currentSubName)) {
            // Find first non-hidden subject
            const order = ['tin_hoc', 'tieng_viet', 'toan', 'tieng_anh'];
            const firstVisible = order.find(sub => !hiddenSubs.includes(subMap[sub]));
            if (firstVisible) {
              setTimeout(() => {
                setActiveSubject(firstVisible);
              }, 0);
            }
          }
        }
      } catch (e) {}
    };

    checkAndSwitchSubject();
    window.addEventListener('lms_settings_changed', checkAndSwitchSubject);
    return () => window.removeEventListener('lms_settings_changed', checkAndSwitchSubject);
  }, [activeSubject]);

  // Show Toast wrapper
  const triggerToast = (msg: string, type: 'normal' | 'level_up' | 'badge' = 'normal') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Login session initializer
  const handleLoginSuccess = (data: {
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
  }) => {
    setRole(data.role);

    if (data.role === 'student') {
      const sMatch = studentsList.find(s => s.username === data.username);
      const initialXP = sMatch ? sMatch.xp : (data.xp !== undefined ? data.xp : 120);
      const initialLevel = sMatch ? sMatch.level : (data.level !== undefined ? data.level : calculateLevelFromXP(initialXP, levelsList));
      const initialStreak = sMatch ? sMatch.streak : (data.streak !== undefined ? data.streak : 1);

      setCurrUser({
        studentId: sMatch ? sMatch.studentId : `s_${Date.now()}`,
        userId: sMatch ? sMatch.id : `u_${Date.now()}`,
        fullname: data.fullname,
        school: data.school || 'Trường tiểu học Kim Đồng',
        gender: data.gender || 'Nam',
        avatar: data.avatar || '👦',
        grade: data.grade || 3,
        className: data.className || '3.1',
        xp: initialXP,
        level: initialLevel,
        streak: initialStreak,
        completedLessonsCount: 1,
        completedExercisesCount: 0,
        badges: badgesList.filter(b => initialXP >= b.xpRequired).map(b => b.code)
      });

      if (!sMatch) {
        setStudentsList(prev => {
          if (prev.some(s => s.username === data.username)) return prev;
          const newStudentIdNum = prev.length + 1;
          const formattedHSKey = `HS${String(newStudentIdNum).padStart(5, '0')}`;
          return [
            ...prev,
            {
              id: `u_${Date.now()}`,
              studentId: formattedHSKey,
              fullname: data.fullname,
              username: data.username,
              password: '123',
              gender: data.gender || 'Nam',
              school: data.school || 'Trường tiểu học Kim Đồng',
              grade: data.grade || 3,
              className: data.className || '3.1',
              xp: initialXP,
              level: initialLevel,
              streak: initialStreak,
              avatar: data.avatar || '👦'
            }
          ];
        });
      }
    } else {
      const tMatch = teachersList.find(t => t.username === data.username);
      setCurrUser({
        fullname: data.fullname,
        school: data.school || 'Trường tiểu học Kim Đồng',
        avatar: data.avatar || (data.role === 'admin' ? '😎' : '👩‍🏫'),
        grade: data.grade || 5,
        className: data.className || 'Tổ Tin Học',
        role: data.role,
        xp: 1000,
        level: 10,
        streak: 5,
        badges: []
      } as any);

      if (!tMatch && data.role === 'teacher') {
        setTeachersList(prev => {
          if (prev.some(t => t.username === data.username)) return prev;
          const newTeacherIdNum = prev.length + 1;
          const formattedGVKey = `GV${String(newTeacherIdNum).padStart(5, '0')}`;
          return [
            ...prev,
            {
              id: `t_${Date.now()}`,
              teacherId: formattedGVKey,
              fullname: data.fullname,
              username: data.username,
              password: '123',
              gender: data.gender || 'Nữ',
              school: data.school || 'Trường tiểu học Kim Đồng',
              subject: data.subject || 'Tin học',
              grades: [data.grade || 3],
              classes: [data.className || '3.1']
            }
          ];
        });
      }
    }

    setActiveTab('home');
    triggerToast(`🎉 Đăng nhập thành công! Chào ${data.role === 'admin' ? 'Quản trị viên' : data.role === 'teacher' ? 'Thầy Cô' : 'Dũng sỹ'} ${data.fullname}!`);
  };

  // Score multiplier tracker
  const handleUpdateXP = (earnedXP: number, taskName: string) => {
    if (!currUser) return;
    
    setCurrUser(prev => {
      if (!prev) return null;
      const newXP = prev.xp + earnedXP;
      const totalSpent = purchasedRewards.reduce((sum, id) => {
        const item = shopItemsList.find(s => s.id === id);
        return sum + (item ? item.cost : 0);
      }, 0);
      const newLevel = calculateLevelFromXP(newXP + totalSpent, levelsList);
      
      let badgeList = [...prev.badges];
      // Automatically unlock badges based on score dynamics from the 20-level badges list
      badgesList.forEach(badge => {
        if (newXP + totalSpent >= badge.xpRequired && !badgeList.includes(badge.code)) {
          badgeList.push(badge.code);
          triggerToast(`🏆 Hoàn thành Huy hiệu: [${badge.title}] nhé!`, 'badge');
          SoundEffects.playKeng();
        }
      });

      const hasLevelUp = newLevel > prev.level;
      if (hasLevelUp) {
        triggerToast(`🎉 Thăng Cấp độ mới! Bạn đạt cấp độ ${newLevel} rồi! 🏆`, 'level_up');
        SoundEffects.playKeng();
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        badges: badgeList
      };
    });

    if (earnedXP > 0) {
      SoundEffects.playTing();
      triggerToast(`⭐ +${earnedXP} ⭐: ${taskName}`, 'normal');
    } else {
      triggerToast(`${taskName}`, 'normal');
    }

    // Automatically update the daily quest counters in local storage
    try {
      const fullname = currUser?.fullname || 'Minh Tâm';
      const key = `questsState_v2_${fullname}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const quests = JSON.parse(saved);
        let updated = [...quests];
        let hasChanges = false;
        
        const taskLower = taskName.toLowerCase();
        if (
          taskLower.includes('trò chơi') || 
          taskLower.includes('cs racing') || 
          taskLower.includes('người hùng bàn phím') || 
          taskLower.includes('nhanh tay lẹ mắt') || 
          taskLower.includes('speed quiz') || 
          taskLower.includes('triệu phú') ||
          taskLower.includes('quay may mắn')
        ) {
          updated = updated.map(q => q.id === 'game' ? { ...q, current: Math.min(q.target, q.current + 1) } : q);
          hasChanges = true;
        } else if (
          taskLower.includes('lý thuyết') || 
          taskLower.includes('bài học') ||
          taskLower.includes('tìm hiểu')
        ) {
          updated = updated.map(q => q.id === 'learn' ? { ...q, current: Math.min(q.target, q.current + 1) } : q);
          hasChanges = true;
        } else if (
          taskLower.includes('bài tập') ||
          taskLower.includes('luyện đề') ||
          taskLower.includes('vượt thử thách')
        ) {
          updated = updated.map(q => q.id === 'exercise' ? { ...q, current: Math.min(q.target, q.current + 1) } : q);
          hasChanges = true;
        }
        
        if (hasChanges) {
          localStorage.setItem(key, JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error('Error updating daily quests in handleUpdateXP:', e);
    }
  };

  // Complete lesson tracker
  const handleLessonCompleted = (lessonId: string) => {
    if (!currUser) return;
    
    // Set progress to 100%
    setActiveStudyProgress(prev => ({
      ...prev,
      [lessonId]: 100
    }));

    setCurrUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completedLessonsCount: prev.completedLessonsCount + 1
      };
    });

    SoundEffects.playKeng();
    triggerToast(`🎖️ Tuyệt hảo! Hãy rinh cúp giải thưởng cho khối Lớp ${currUser.grade}!`, 'normal');
  };

  // Complete exercise tracker
  const handleExerciseCompleted = (lessonId: string) => {
    if (!currUser) return;
    
    // Set progress to 100%
    setActiveStudyProgress(prev => ({
      ...prev,
      [lessonId]: 100
    }));

    setCurrUser(prev => {
      if (!prev) return null;
      const alreadyDone = activeStudyProgress[lessonId] >= 90;
      return {
        ...prev,
        completedExercisesCount: alreadyDone ? prev.completedExercisesCount : prev.completedExercisesCount + 1
      };
    });

    SoundEffects.playKeng();
    triggerToast(`🎖️ Tuyệt vời! Bạn đã hoàn thành Bài tập và nâng cao học trình!`, 'normal');
  };

  // Swapping avatar profile icons
  const handleChangeAvatar = (emoji: string) => {
    if (!currUser) return;
    setCurrUser(prev => prev ? { ...prev, avatar: emoji } : null);
    setIsAvatarModalOpen(false);
    triggerToast(`🎨 Đổi ảnh đại diện (avatar) thành: ${emoji} thành công!`);
  };

  // Rewards Purchase store handler
  const handleBuyRewardItem = (itemId: string, costXP: number, name: string) => {
    if (!currUser) return;
    if (currUser.xp < costXP) {
      alert(`⚠️ Hự! Bé chưa có đủ điểm tích luỹ ⭐ để sở hữu món quà này. Cố gắng làm thêm bài tập nhé!`);
      return;
    }
    setCurrUser(prev => prev ? { ...prev, xp: prev.xp - costXP } : null);
    setPurchasedRewards(prev => [...prev, itemId]);
    triggerToast(`🎁 Đã quy đổi thành công phần quà: ${name}!`);
  };

  // Logout reset session helper
  const handleLogout = () => {
    setCurrUser(null);
    setActiveTab('home');
    triggerToast('Đã đăng xuất thành công! Hẹn gặp lại em nhé! 👋');
  };

  // Role quick swap controller
  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    triggerToast(`👤 Đã chuyển đổi chế độ xem sang: ${newRole === 'admin' ? 'Quản trị' : newRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}`);
  };

  // Check if we are directly loading a candidate examination room via short link (4 letters, 4 numbers)
  let directShortExamId: string | null = null;
  if (typeof window !== 'undefined') {
    const pathMatch = window.location.pathname.match(/^\/([a-zA-Z]{4})([0-9]{4})$/);
    if (pathMatch) {
      const code = (pathMatch[1] + pathMatch[2]).toLowerCase();
      directShortExamId = code;
    }
  }

  if (directShortExamId) {
    return (
      <div className="w-full min-h-screen bg-slate-50 overflow-y-auto font-sans">
        <OnlineExamsView 
          role="student" 
          currUser={currUser || { fullname: '', className: '' }} 
          directTakeExamId={directShortExamId} 
        />
      </div>
    );
  }

  // Check if we are directly loading a candidate examination room via share link
  const takeExamIdParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('takeExamId') : null;
  if (takeExamIdParam) {
    return (
      <div className="w-full min-h-screen bg-slate-50 overflow-y-auto font-sans">
        <OnlineExamsView 
          role="student" 
          currUser={currUser || { fullname: '', className: '' }} 
          directTakeExamId={takeExamIdParam} 
        />
      </div>
    );
  }

  // Check if we are directly loading a shared student scorecard / result page
  const shareReportIdParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('shareReportId') : null;
  if (shareReportIdParam) {
    return (
      <ShareReportView shareReportId={shareReportIdParam} />
    );
  }

  // Renders login screen if no profile authenticated
  if (!currUser) {
    return (
      <LoginRegister 
        onLoginSuccess={handleLoginSuccess} 
        studentsList={studentsList}
        teachersList={teachersList}
      />
    );
  }

  // Filter lessons belonging to registered grade
  const totalSpentXP = purchasedRewards.reduce((sum, id) => {
    const item = shopItemsList.find(s => s.id === id);
    return sum + (item ? item.cost : 0);
  }, 0);
  const totalCollectedXP = currUser.xp + totalSpentXP;

  const gradeLessons = lessonsList.filter(l => l.grade === currUser.grade);

  return (
    <div className="min-h-screen bg-[#F3F6FD] font-sans antialiased text-gray-800 relative">
      
      {/* 1. TOAST NOTIFICATION CORNER */}
      {toast && (
        <>
          {(toast.type === 'level_up' || toast.type === 'badge') && <Fireworks />}
          <motion.div
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 font-bold text-xs sm:text-sm border-2 pointer-events-none max-w-sm rounded-2xl shadow-xl px-5 py-3 ${
              toast.type === 'level_up'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-300 text-white ring-4 ring-yellow-400/20'
                : toast.type === 'badge'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-350 text-white ring-4 ring-indigo-400/20'
                : 'bg-slate-900/95 text-white border-white/10'
            }`}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={
              toast.type === 'level_up' || toast.type === 'badge'
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: [0, -7, 7, -7, 7, -5, 5, -3, 3, 0], // Shake animation!
                  }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              toast.type === 'level_up' || toast.type === 'badge'
                ? {
                    x: { duration: 0.75, ease: 'easeInOut' },
                    default: { duration: 0.25 }
                  }
                : { duration: 0.25 }
            }
          >
            <span className="text-xl">
              {toast.type === 'level_up' ? '👑' : toast.type === 'badge' ? '🏆' : '🌟'}
            </span>
            <span>{toast.message}</span>
          </motion.div>
        </>
      )}

      {/* 2. MAIN APPLICATION CONTENT SHELL WITH SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        grade={role === 'student' ? currUser.grade : undefined}
        currUser={currUser}
        role={role}
        onLogout={handleLogout}
        totalCollectedXP={totalCollectedXP}
        badgesList={badgesList}
        adminActiveTab={adminActiveTab}
        setAdminActiveTab={setAdminActiveTab}
      />

      {/* 3. RIGHT HAND VIEW SECTION PANEL */}
      <div className="pl-[260px] min-h-screen flex flex-col transition-all duration-300">
        
        {/* Upper persistent bar */}
        <TopBar
          fullname={currUser.fullname}
          avatar={currUser.avatar}
          level={currUser.level}
          xp={currUser.xp}
          streak={currUser.streak}
          role={role}
          onLogout={handleLogout}
          onRoleSwitch={handleRoleSwitch}
          onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          totalCollectedXP={totalCollectedXP}
          badgesList={badgesList}
        />

        {/* Dynamic Inner Layout Body based on selected left item */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          
          {/* TAB: HOME PAGE */}
          {activeTab === 'home' && (
            <StudentHome
              profile={currUser}
              role={role}
              lessons={lessonsList}
              activeStudyProgress={activeStudyProgress}
              onSelectLesson={(lessonId) => {
                // Find and load lesson details
                const findL = lessonsList.find(l => l.id === lessonId);
                if (findL) {
                  setActiveTab('lessons');
                }
              }}
              onSelectTab={setActiveTab}
              onSelectTabAndSubtab={(tab, subtab) => {
                setActiveTab(tab);
                setStudentNestedTab(subtab);
              }}
              onUpdateXP={handleUpdateXP}
              onLogout={handleLogout}
              totalCollectedXP={totalCollectedXP}
              purchasedRewards={purchasedRewards}
              onBuyReward={handleBuyRewardItem}
              badgesList={badgesList}
              shopItemsList={shopItemsList}
              levelsList={levelsList}
            />
          )}

          {/* TAB: STUDENT PROFILE & PROGRESS VIEW */}
          {activeTab === 'student' && (
            <StudentProfileView
               profile={currUser}
               setProfile={setCurrUser}
               onSelectTab={setActiveTab}
               triggerToast={triggerToast}
               purchasedRewards={purchasedRewards}
               initialNestedTab={studentNestedTab}
               setInitialNestedTab={setStudentNestedTab}
               badgesList={badgesList}
               shopItemsList={shopItemsList}
               levelsList={levelsList}
            />
          )}

          {/* TAB: CURRICULUM LESSONS LIST */}
          {activeTab === 'lessons' && (
            <StudentLessons
              lessons={lessonsList}
              activeGrade={currUser ? (role === 'admin' ? 5 : currUser.grade) : 3}
              activeStudyProgress={activeStudyProgress}
              activeSubject={activeSubject}
              setActiveSubject={setActiveSubject}
              onUpdateXP={handleUpdateXP}
              onLessonCompleted={handleLessonCompleted}
              questionsList={questionsList}
            />
          )}

          {/* TAB: EXERCISES TRIVIA PANEL */}
          {activeTab === 'exercises' && (
            <StudentExercises
              lessons={lessonsList}
              activeGrade={currUser ? (role === 'admin' ? 5 : currUser.grade) : 3}
              activeStudyProgress={activeStudyProgress}
              activeSubject={activeSubject}
              setActiveSubject={setActiveSubject}
              onUpdateXP={handleUpdateXP}
              onExerciseCompleted={handleExerciseCompleted}
              questionsList={questionsList}
            />
          )}

          {/* TAB: EDUCATIONAL GAMES PLAYGROUND */}
          {activeTab === 'games' && (
            <StudentGames
              onUpdateXP={handleUpdateXP}
              gamesList={gamesList}
              activeSubject={activeSubject}
              setActiveSubject={setActiveSubject}
              activeGrade={currUser ? (role === 'admin' ? 5 : currUser.grade) : 3}
            />
          )}

          {/* TAB: ACHIEVEMENT BADGES AND REWARDS */}
          {activeTab === 'achievements' && currUser && (() => {
            const totalSpentXP = purchasedRewards.reduce((sum, id) => {
              const item = shopItemsList.find(s => s.id === id);
              return sum + (item ? item.cost : 0);
            }, 0);
            const totalCollectedXP = currUser.xp + totalSpentXP;
            const totalBadgesEarned = badgesList.filter(b => totalCollectedXP >= b.xpRequired).length;

            return (
              <div className="space-y-8 animate-fade-in text-left">
                <div className="bg-[#FFFDE8] border-3 border-[#FFF5B8] p-6 rounded-[28px] text-center space-y-1">
                  <span className="text-4xl animate-bounce inline-block">🏆</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-800" style={{ fontFamily: 'var(--font-title)' }}>
                    SẢNH DANH VỌNG HUY HIỆU HỌC TẬP
                  </h3>
                  <p className="text-xs text-gray-500 font-bold max-w-md mx-auto">
                    Khám phá danh sách các huy chương em đạt được và cố gắng học tập chuyên cần để rinh đủ các Avatar huy hiệu nhé!
                  </p>
                  
                  {/* Added Total XP collected info and aligned badge counters */}
                  <div className="flex flex-col items-center justify-center gap-3 mt-4 max-w-2xl mx-auto">
                    <div className="bg-[#E0F2FE] text-[#0369A1] text-xs font-black px-4 py-2 rounded-2xl border border-[#BAE6FD] shadow-xs w-full max-w-md text-center">
                      🌟 Tổng sao đã thu thập: <span className="font-extrabold text-blue-700 text-sm">{totalCollectedXP}</span> (Gồm có: {currUser.xp} hiện tại | Đã đổi quà: {totalSpentXP})
                    </div>
                    <div className="bg-amber-100 text-[#92400E] text-xs font-black px-4 py-2 rounded-2xl border border-amber-300 shadow-xs w-full max-w-md text-center">
                      🏆 Đã đạt được: <span className="text-amber-700 font-extrabold">{totalBadgesEarned} / {badgesList.length}</span> Huy hiệu dũng sĩ 🌟
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      title: 'Hạng Đồng 🥉️',
                      code: 'Đồng',
                      bgGradient: 'from-amber-50/50 to-orange-50/20 border-amber-200',
                      titleColor: 'text-amber-800',
                      badgeText: 'text-amber-700 bg-amber-100',
                      badges: badgesList.filter((b) => b.tier === 'Đồng')
                    },
                    {
                      title: 'Hạng Bạc 🥈️',
                      code: 'Bạc',
                      bgGradient: 'from-emerald-50/50 to-green-50/20 border-green-200',
                      titleColor: 'text-emerald-800',
                      badgeText: 'text-emerald-700 bg-emerald-100',
                      badges: badgesList.filter((b) => b.tier === 'Bạc')
                    },
                    {
                      title: 'Hạng Vàng 🥇',
                      code: 'Vàng',
                      bgGradient: 'from-blue-50/50 to-indigo-50/20 border-blue-250',
                      titleColor: 'text-blue-800',
                      badgeText: 'text-blue-700 bg-blue-100',
                      badges: badgesList.filter((b) => b.tier === 'Vàng')
                    },
                    {
                      title: 'Hạng Kim Cương 💎️',
                      code: 'Kim Cương',
                      bgGradient: 'from-purple-50/50 to-fuchsia-50/20 border-purple-200',
                      titleColor: 'text-purple-800',
                      badgeText: 'text-purple-700 bg-purple-100',
                      badges: badgesList.filter((b) => b.tier === 'Kim Cương')
                    },
                    {
                      title: 'Hạng Huyền Thoại 👑',
                      code: 'Huyền Thoại',
                      bgGradient: 'from-yellow-100/40 to-amber-50/10 border-yellow-300 shadow-md',
                      titleColor: 'text-amber-955',
                      badgeText: 'text-yellow-800 bg-yellow-250',
                      badges: badgesList.filter((b) => b.tier === 'Huyền Thoại')
                    }
                  ].map((tierItem) => {
                    const earnedCount = tierItem.badges.filter(b => totalCollectedXP >= b.xpRequired).length;
                    return (
                      <div key={tierItem.code} className={`rounded-3xl p-6 border-2 bg-gradient-to-br ${tierItem.bgGradient} space-y-4`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 border-gray-200/50">
                          <div>
                            <h4 className={`font-black text-md sm:text-lg ${tierItem.titleColor}`} style={{ fontFamily: 'var(--font-title)' }}>
                              {tierItem.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 font-bold mt-0.5">Thăng hạng Sao để thắp sáng toàn bộ huy hiệu dũng sĩ!</p>
                          </div>
                          <span className={`px-3.5 py-1 rounded-full text-xs font-black self-start sm:self-center ${tierItem.badgeText}`}>
                            Gặt hái: {earnedCount} / {tierItem.badges.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          {tierItem.badges.map((badge) => {
                            const isEarned = totalCollectedXP >= badge.xpRequired;
                            return (
                              <div 
                                key={badge.code}
                                className={`rounded-2xl p-4 border text-center flex flex-col justify-between items-center gap-3 transition-all duration-300 bg-white ${
                                  isEarned 
                                    ? 'border-[#FFD84D] shadow-sm hover:scale-[1.03] hover:shadow-md' 
                                    : 'border-gray-150 opacity-60'
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-3xl shadow-xs border ${
                                  isEarned ? 'bg-[#FFFDF2] border-yellow-300' : 'bg-gray-55 border-gray-100'
                                }`}>
                                  {badge.iconEmoji}
                                </div>

                                <div>
                                  <h5 className="font-extrabold text-[12px] text-slate-800 leading-tight">{badge.title}</h5>
                                  <p className="text-[9px] text-gray-400 font-extrabold mt-1 leading-snug">{badge.description}</p>
                                </div>

                                <div className="w-full">
                                  {isEarned ? (
                                    <span className="inline-block w-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-black text-[9px] py-1 rounded-full uppercase tracking-wider">
                                      🛡️ Đã Sở Hữu
                                    </span>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <span className="inline-block w-full bg-gray-50 text-gray-400 font-bold text-[9px] py-1 rounded-full uppercase border border-gray-100">
                                        🔒 Chưa Đạt
                                      </span>
                                      <span className="block text-[9px] text-[#FF6B6B] font-extrabold">Đòi hỏi {badge.xpRequired} ⭐</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* TAB: XP GIFT REDEEM STORE */}
          {activeTab === 'rewards' && (() => {
            const rarityTabs = [
              { key: 'ALL', label: '🌈 Tất Cả', activeClass: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white' },
              { key: 'Thường', label: '⚪ Thường', activeClass: 'bg-slate-500 text-white' },
              { key: 'Đặc Biệt', label: '🟢 Đặc Biệt', activeClass: 'bg-emerald-500 text-white' },
              { key: 'Quý', label: '🔵 Quý', activeClass: 'bg-blue-500 text-white' },
              { key: 'Sử Thi', label: '🟣 Sử Thi', activeClass: 'bg-purple-500 text-white' },
              { key: 'Huyền Thoại', label: '🟠 Huyền Thoại', activeClass: 'bg-amber-500 text-white' },
              { key: 'Thần Thoại', label: '🔴 Thần Thoại', activeClass: 'bg-rose-500 text-white' },
              { key: 'Tối Thượng', label: '👑 Tối Thượng', activeClass: 'bg-yellow-500 text-slate-900 font-extrabold shadow-sm' }
            ];

            const filteredItems = INITIAL_SHOP_ITEMS.filter((item) => {
              const matchesSearch = 
                item.title.toLowerCase().includes(shopSearch.toLowerCase()) || 
                item.desc.toLowerCase().includes(shopSearch.toLowerCase());
              const matchesFilter = shopFilter === 'ALL' || item.rarity === shopFilter;
              return matchesSearch && matchesFilter;
            });

            return (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Header Banner */}
                <div className="bg-[#FFF5EC] border-3 border-[#FFE0C5] p-6 rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="bg-orange-500 text-white text-[11px] px-3 py-0.5 rounded-full font-black uppercase inline-block">
                      Cửa Hàng Quà Độc Quyền 🎁
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-orange-850" style={{ fontFamily: 'var(--font-title)' }}>
                      Quy đổi ⭐ Nhận quà Avatar
                    </h3>
                    <p className="text-xs text-gray-500 font-bold max-w-md leading-relaxed">
                      Sử dụng số điểm thưởng dũng sỹ ⭐ tích lũy được từ việc làm bài tập để sở hữu các phần quà đặc quyền cực kỳ độc lạ!
                    </p>
                    <p className="text-xs text-amber-600 font-extrabold mt-1 leading-relaxed">
                      ✨ Mách nhỏ: Em có thể sử dụng những Avatar đã đổi này làm ảnh đại diện tại "Thông tin cá nhân" đấy!
                    </p>
                  </div>
                  {/* Score balance wrapper */}
                  <div className="bg-white px-5 py-2.5 rounded-2xl border-2 border-orange-200 font-black text-orange-600 text-center shadow-sm shrink-0">
                    <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider mb-0.5">Sao tích lũy:</span>
                    <span className="block text-2xl text-[#2454A6]">{currUser.xp} ⭐</span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center bg-white p-4 rounded-2xl border-3 border-gray-150 shadow-xs">
                  {/* Search box */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="🔍 Tìm tên quà Avatar..."
                      value={shopSearch || ''}
                      onChange={(e) => setShopSearch(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border-2 border-gray-200 bg-slate-50 focus:bg-white focus:border-orange-350 outline-hidden transition"
                    />
                    {shopSearch && (
                      <button 
                        onClick={() => setShopSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-black text-xs w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter pill tabs */}
                  <div className="flex flex-wrap gap-1.5 justify-start xl:justify-end">
                    {rarityTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setShopFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer border-2 ${
                          shopFilter === tab.key 
                            ? `${tab.activeClass} border-transparent shadow-xs-soft` 
                            : 'bg-white border-gray-200 hover:bg-slate-50 text-slate-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid of Items */}
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => {
                      const isBought = purchasedRewards.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          className={`${item.themeClass.bg} p-6 rounded-[24px] border-3 ${item.themeClass.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}
                        >
                          {/* Rarity Tag */}
                          <div className="absolute top-4 right-4">
                            <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${item.themeClass.badge}`}>
                              {item.raritySymbol}
                            </span>
                          </div>

                          {/* Mascot View */}
                          <div className="text-center space-y-3 pt-4">
                            <span className={`text-5xl mx-auto w-16 h-16 flex items-center justify-center rounded-[20px] border shadow-xs ${item.themeClass.iconBg}`}>
                              {item.icon}
                            </span>
                            <h4 className={`font-black text-sm ${item.themeClass.text}`}>{item.title}</h4>
                            <p className="text-[12.5px] font-bold text-blue-600 leading-normal min-h-[34px]">{item.desc}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-between items-center mt-5 pt-4 border-t border-dashed border-gray-150">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Sao cần:</span>
                              <span className="font-extrabold text-orange-600 text-sm mt-1">{item.cost} ⭐</span>
                            </div>
                            
                            {isBought ? (
                              <span className="bg-emerald-50 text-emerald-700 font-black text-[10px] px-3 py-1.5 rounded-xl border border-emerald-200 uppercase flex items-center gap-1">
                                Đã sở hữu ✔️
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBuyRewardItem(item.id, item.cost, item.title)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] px-3.5 py-2 rounded-xl border-b-3 border-orange-700 active:border-b-0 cursor-pointer shadow-xs transition-all active:translate-y-0.5"
                              >
                                Đổi Quà 🎁
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border-3 border-dashed border-gray-250 rounded-[32px] p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
                    <span className="text-5xl block">🥺</span>
                    <h4 className="font-black text-lg text-slate-700" style={{ fontFamily: 'var(--font-title)' }}>
                      Không tìm thấy Avatar phù hợp!
                    </h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      Bé hãy thử tìm kiếm từ khóa khác hoặc bấm nút bên dưới để khôi phục xem toàn bộ danh hiệu Avatar nhé!
                    </p>
                    <button 
                      onClick={() => { setShopFilter('ALL'); setShopSearch(''); }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer border-b-4 border-orange-700 active:border-b-0 active:translate-y-0.5 shadow-sm"
                    >
                      Xem toàn bộ Avatar 🌈
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB: SUPPORT CONTACT INQUIRIES */}
          {activeTab === 'contact' && (
            <ContactView studentProfile={currUser} />
          )}

          {/* TAB: ADMINISTRATOR SYSTEM BACKEND */}
          {activeTab === 'admin' && (
            <AdminPanel
              lessonsList={lessonsList}
              setLessonsList={setLessonsList}
              questionsList={questionsList}
              setQuestionsList={setQuestionsList}
              onUpdateXP={handleUpdateXP}
              badgesList={badgesList}
              setBadgesList={setBadgesList}
              levelsList={levelsList}
              setLevelsList={setLevelsList}
              shopItemsList={shopItemsList}
              setShopItemsList={setShopItemsList}
              gamesList={gamesList}
              setGamesList={setGamesList}
              students={studentsList}
              setStudents={setStudentsList}
              teachers={teachersList}
              setTeachers={setTeachersList}
              adminActiveTab={adminActiveTab}
              setAdminActiveTab={setAdminActiveTab}
              currUser={currUser}
            />
          )}

          {/* TAB: TEACHER SPECIFIC DASHBOARD */}
          {activeTab === 'teacher_dashboard' && (
            <TeacherDashboard
              currUser={currUser}
              teachersList={teachersList}
            />
          )}

          {/* TAB: AI LESSON PLANNER */}
          {activeTab === 'lesson_planner' && (
            <LessonPlanner />
          )}

          {/* TAB: SKKN CREATOR */}
          {activeTab === 'skkn_creator' && (
            <SkknCreator currUser={currUser} />
          )}

          {/* TAB: INTERACTIVE GAME CREATOR */}
          {activeTab === 'game_creator' && (
            <GameCreator role={role} />
          )}

          {/* TAB: TESTS & EVALUATION CREATOR */}
          {activeTab === 'test_creator' && (
            <TestCreator onTabChange={setActiveTab} setLocalTakeExamId={setLocalTakeExamId} currUser={currUser} />
          )}

          {/* TAB: ONLINE EXAMS PORTAL */}
          {activeTab === 'online_exams' && (
            <OnlineExamsView 
              role={role}
              currUser={currUser}
              activeSubject={activeSubject}
              directTakeExamId={localTakeExamId}
            />
          )}

          {/* TAB: CLASSROOM UTILITIES */}
          {activeTab === 'utilities' && (
            <Utilities />
          )}



        </main>
      </div>

      {/* FOOTER FLOATING PROFILE CHANGE MODAL */}
      {isAvatarModalOpen && currUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-4 border-[#3B82F6] overflow-hidden shadow-2xl p-6 md:p-8 w-full max-w-xl relative">
            <h3 className="text-lg md:text-xl font-black text-[#2454A6] mb-1 uppercase text-center" style={{ fontFamily: 'var(--font-title)' }}>
              Thay đổi ảnh đại diện (Avatar) 🤖
            </h3>
            <p className="text-xs font-bold text-gray-400 text-center mb-4">Mời em chọn nhân vật Avatar đại diện đồng hành cùng em:</p>
            
            {/* Live description card of the current active avatar */}
            {(() => {
              const activeOpt = SHARED_AVATAR_POOL.find(a => a.emoji === currUser.avatar);
              return activeOpt ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex items-center gap-3 mb-4 text-left transition-all">
                  <span className="text-3.5xl select-none leading-none animate-pulse">{activeOpt.emoji}</span>
                  <div>
                    <span className="text-[9px] text-amber-700 font-extrabold uppercase tracking-wider block leading-none mb-1">Avatar đang đồng hành cùng em</span>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{activeOpt.label}</p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Complete grid of all avatars, borderless/clear style (không cần viền xung quanh) */}
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-150 mb-5 max-h-72 overflow-y-auto">
              {SHARED_AVATAR_POOL.map((item) => {
                const isSelected = currUser.avatar === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    onClick={() => handleChangeAvatar(item.emoji)}
                    title={item.label}
                    className={`w-11 h-11 flex items-center justify-center text-3xl transition-all cursor-pointer relative select-none rounded-xl bg-transparent hover:bg-slate-200/60 hover:scale-120 ${
                      isSelected ? 'bg-[#FEF9C3] scale-120 z-10' : ''
                    }`}
                    style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                  >
                    {item.emoji}
                    {isSelected && (
                      <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-[#22C55E] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-black ring-2 ring-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-3 rounded-2xl uppercase transition cursor-pointer"
            >
              Hủy bỏ & đóng lại ❌
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
