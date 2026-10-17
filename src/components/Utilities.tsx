import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench,
  Timer as TimerIcon,
  Clock as ClockIcon,
  RotateCw,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
  PenTool,
  Compass,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SoundEffects } from '../App';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper function to resolve the html2canvas error:
// "Attempting to parse an unsupported color function 'oklch' or 'oklab'"
// This translates all oklch() and oklab() color spaces to standard rgb/rgba.
export function parseOklchAndReplace(cssText: string): string {
  if (!cssText) return '';
  let replaced = cssText;

  const oklabToRgbRaw = (L: number, okl_a: number, okl_b: number) => {
    const l_ = L + 0.3963377774 * okl_a + 0.2158037573 * okl_b;
    const m_ = L - 0.1055613458 * okl_a - 0.0638541728 * okl_b;
    const s_ = L - 0.0894841775 * okl_a - 1.2914855480 * okl_b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    let r_ = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g_ = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b_ = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    const gamma = (x: number) => {
      return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };

    let r = Math.min(255, Math.max(0, Math.round(gamma(r_) * 255)));
    let g = Math.min(255, Math.max(0, Math.round(gamma(g_) * 255)));
    let b = Math.min(255, Math.max(0, Math.round(gamma(b_) * 255)));

    return { r, g, b };
  };

  // 1. Convert oklch(...) and oklab(...)
  const regex = /(oklch|oklab)\(([^)]+)\)/gi;
  replaced = replaced.replace(regex, (match, type, content) => {
    try {
      const parts = content.trim().split(/[\s,/]+/);
      if (parts.length >= 3) {
        const lStr = parts[0];
        const p2Str = parts[1];
        const p3Str = parts[2];
        const aStr = parts[3];

        let L = parseFloat(lStr);
        if (lStr.includes('%')) L /= 100;
        if (L > 1) L /= 100;

        let alpha = 1;
        if (aStr) {
          if (aStr.includes('%')) {
            alpha = parseFloat(aStr) / 100;
          } else {
            alpha = parseFloat(aStr);
          }
        }

        let okl_a = 0;
        let okl_b = 0;

        if (type.toLowerCase() === 'oklch') {
          let C = parseFloat(p2Str);
          if (p2Str.includes('%')) C /= 100;
          const H = parseFloat(p3Str);
          const h_rad = (isNaN(H) ? 0 : H * Math.PI) / 180;
          okl_a = C * Math.cos(h_rad);
          okl_b = C * Math.sin(h_rad);
        } else {
          okl_a = parseFloat(p2Str);
          okl_b = parseFloat(p3Str);
        }

        const { r, g, b } = oklabToRgbRaw(L, okl_a, okl_b);
        if (alpha === 1) {
          return `rgb(${r},${g},${b})`;
        } else {
          return `rgba(${r},${g},${b},${alpha})`;
        }
      }
    } catch (e) {}
    return 'rgb(255,255,255)';
  });

  // 2. Convert color(oklch ...) and color(oklab ...)
  const colorRegex = /color\((oklch|oklab)\s+([^)]+)\)/gi;
  replaced = replaced.replace(colorRegex, (match, type, content) => {
    try {
      const parts = content.trim().split(/[\s,/]+/);
      if (parts.length >= 3) {
        const lStr = parts[0];
        const p2Str = parts[1];
        const p3Str = parts[2];
        const aStr = parts[3];

        let L = parseFloat(lStr);
        if (lStr.includes('%')) L /= 100;
        if (L > 1) L /= 100;

        let alpha = 1;
        if (aStr) {
          if (aStr.includes('%')) {
            alpha = parseFloat(aStr) / 100;
          } else {
            alpha = parseFloat(aStr);
          }
        }

        let okl_a = 0;
        let okl_b = 0;

        if (type.toLowerCase() === 'oklch') {
          let C = parseFloat(p2Str);
          if (p2Str.includes('%')) C /= 100;
          const H = parseFloat(p3Str);
          const h_rad = (isNaN(H) ? 0 : H * Math.PI) / 180;
          okl_a = C * Math.cos(h_rad);
          okl_b = C * Math.sin(h_rad);
        } else {
          okl_a = parseFloat(p2Str);
          okl_b = parseFloat(p3Str);
        }

        const { r, g, b } = oklabToRgbRaw(L, okl_a, okl_b);
        if (alpha === 1) {
          return `rgb(${r},${g},${b})`;
        } else {
          return `rgba(${r},${g},${b},${alpha})`;
        }
      }
    } catch (e) {}
    return 'rgb(255,255,255)';
  });

  return replaced;
}

export function safeHtml2Canvas(element: HTMLElement, options: any = {}): Promise<HTMLCanvasElement> {
  const userOnClone = options.onclone;
  const originalGetComputedStyle = window.getComputedStyle;
  
  // Temporarily patch window.getComputedStyle so modern browsers returning computed oklch() or oklab() colors are handled cleanly
  window.getComputedStyle = function (el, pseudoElt) {
    const style = originalGetComputedStyle.call(this, el, pseudoElt);
    return new Proxy(style, {
      get(target, prop) {
        const val = target[prop as any];
        if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
          return parseOklchAndReplace(val);
        }
        if (typeof val === 'function') {
          if (prop === 'getPropertyValue') {
            return function (propName: string) {
              const originalVal = target.getPropertyValue(propName);
              if (originalVal && (originalVal.includes('oklch') || originalVal.includes('oklab') || originalVal.includes('color('))) {
                return parseOklchAndReplace(originalVal);
              }
              return originalVal;
            };
          }
          return val.bind(target);
        }
        return val;
      }
    });
  };
  
  options.onclone = (clonedDoc: Document, clonedEl: HTMLElement) => {
    // 1. Process style tags in cloned doc
    const styleTags = clonedDoc.getElementsByTagName('style');
    for (let i = 0; i < styleTags.length; i++) {
      const tag = styleTags[i];
      if (tag.textContent && (tag.textContent.includes('oklch') || tag.textContent.includes('oklab') || tag.textContent.includes('color('))) {
        tag.textContent = parseOklchAndReplace(tag.textContent);
      }
    }

    // 2. Process inline styles in cloned doc
    const allElements = clonedDoc.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const elem = allElements[i] as HTMLElement;
      if (elem.style) {
        const inlineStyle = elem.getAttribute('style');
        if (inlineStyle && (inlineStyle.includes('oklch') || inlineStyle.includes('oklab') || inlineStyle.includes('color('))) {
          elem.setAttribute('style', parseOklchAndReplace(inlineStyle));
        }
      }
    }

    // 3. Process dynamic stylesheet rules safely
    for (let i = 0; i < clonedDoc.styleSheets.length; i++) {
      const sheet = clonedDoc.styleSheets[i];
      try {
        if (sheet.cssRules) {
          // Rule arrays could be large, but filtering oklch makes it solid
        }
      } catch (e) {
        // block CORS errors
      }
    }

    if (userOnClone) {
      userOnClone(clonedDoc, clonedEl);
    }
  };

  try {
    const promise = html2canvas(element, options);
    promise.finally(() => {
      window.getComputedStyle = originalGetComputedStyle;
    });
    return promise;
  } catch (err) {
    window.getComputedStyle = originalGetComputedStyle;
    throw err;
  }
}

type UtilityTab = 'timer' | 'clock' | 'writing' | 'writing_creator' | 'random_number' | 'lucky_wheel' | 'dice' | 'qr_generator' | 'avatar_blue_tick' | 'number_to_text' | 'bmi_calc' | 'invitation_poster';

export default function Utilities() {
  const [activeUtil, setActiveUtil] = useState<UtilityTab | null>(null);

  // PASTEL_THEMES similar to Các Trạm Học Tập
  const UTIL_STATIONS = [
    {
      id: 'timer' as UtilityTab,
      title: 'ĐỒNG HỒ BẤM GIỜ / ĐẾM NGƯỢC',
      desc: 'Thiết kế lật số Flip-Clock trực quan cao cấp, hỗ trợ thiết lập giây phút cho thi đua.',
      emoji: '⏱️',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#bbf7d0]',
        bg: 'bg-[#f0fdf4]',
        bgHover: 'hover:bg-[#dcfce7]',
        text: 'text-[#166534]',
        lightText: 'text-[#15803d]/80',
        badgeBg: 'bg-[#dcfce7]',
        btnBg: 'bg-[#22c55e]',
        btnBorder: 'border-[#15803d]',
      }
    },
    {
      id: 'clock' as UtilityTab,
      title: 'ĐỒNG HỒ DẠY HỌC TƯƠNG TÁC',
      desc: 'Mô phỏng đồng hồ kim chất lượng cao, có chu kỳ ngày đêm và phím tăng giảm thông minh.',
      emoji: '🕒',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#fed7aa]',
        bg: 'bg-[#fff7ed]',
        bgHover: 'hover:bg-[#ffedd5]',
        text: 'text-[#9a3412]',
        lightText: 'text-[#c2410c]/80',
        badgeBg: 'bg-[#ffedd5]',
        btnBg: 'bg-[#f97316]',
        btnBorder: 'border-[#c2410c]',
      }
    },
    {
      id: 'writing_creator' as UtilityTab,
      title: 'TẠO FILE TẬP VIẾT',
      desc: 'Bảng thiết kế bài tập viết trực quan. Nhập chữ mẫu, di chuyển, phóng to thu nhỏ và chỉnh sửa tự do trên dòng o-ly.',
      emoji: '📝',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#fca5af]',
        bg: 'bg-[#fff1f2]',
        bgHover: 'hover:bg-[#ffe4e6]',
        text: 'text-[#be123c]',
        lightText: 'text-[#e11d48]/80',
        badgeBg: 'bg-[#ffe4e6]',
        btnBg: 'bg-[#f43f5e]',
        btnBorder: 'border-[#be123c]',
      }
    },
    {
      id: 'random_number' as UtilityTab,
      title: 'QUAY SỐ NGẪU NHIÊN',
      desc: 'Quay số trúng thưởng, gọi tên học sinh ngẫu nhiên theo khoảng giới hạn tùy chọn.',
      emoji: '🔢',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#fed7aa]',
        bg: 'bg-[#fff7ed]',
        bgHover: 'hover:bg-[#ffedd5]',
        text: 'text-[#9a3412]',
        lightText: 'text-[#c2410c]/80',
        badgeBg: 'bg-[#ffedd5]',
        btnBg: 'bg-[#f97316]',
        btnBorder: 'border-[#c2410c]',
      }
    },
    {
      id: 'lucky_wheel' as UtilityTab,
      title: 'VÒNG QUAY MAY MẮN',
      desc: 'Vòng quay may mắn gọi tên bài học hoặc chọn phần thưởng khích lệ điểm số học tập.',
      emoji: '🎡',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#e9d5ff]',
        bg: 'bg-[#faf5ff]',
        bgHover: 'hover:bg-[#f3e8ff]',
        text: 'text-[#6b21a8]',
        lightText: 'text-[#7e22ce]/80',
        badgeBg: 'bg-[#f3e8ff]',
        btnBg: 'bg-[#a855f7]',
        btnBorder: 'border-[#7e22ce]',
      }
    },
    {
      id: 'dice' as UtilityTab,
      title: 'ĐỔ XÚC XẮC THỰC TẾ',
      desc: 'Mô phỏng gieo súc sắc ngẫu nhiên, âm thanh sôi nổi vui vẻ cho trò chơi học thuật.',
      emoji: '🎲',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#bbf7d0]',
        bg: 'bg-[#f0fdf4]',
        bgHover: 'hover:bg-[#dcfce7]',
        text: 'text-[#166534]',
        lightText: 'text-[#15803d]/80',
        badgeBg: 'bg-[#dcfce7]',
        btnBg: 'bg-[#22c55e]',
        btnBorder: 'border-[#15803d]',
      }
    },
    {
      id: 'qr_generator' as UtilityTab,
      title: 'LUYỆN TẠO MÃ QR TỰ ĐỘNG',
      desc: 'Mã hóa liên kết bài học, Wifi, Số điện thoại hoặc văn bản thành mã QR tải về ngay.',
      emoji: '🔍',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#93c5fd]',
        bg: 'bg-[#eff6ff]',
        bgHover: 'hover:bg-[#dbeafe]',
        text: 'text-[#1e3a8a]',
        lightText: 'text-[#1d4ed8]/80',
        badgeBg: 'bg-[#dbeafe]',
        btnBg: 'bg-[#3b82f6]',
        btnBorder: 'border-[#1d4ed8]',
      }
    },
    {
      id: 'avatar_blue_tick' as UtilityTab,
      title: 'TẠO AVATAR VIỀN MÀU & TICK XANH',
      desc: 'Tự động bo viền cầu vồng/vàng kim sành điệu kết hợp chèn tick xanh xịn xò vào ảnh lớp học.',
      emoji: '🎨',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#fef08a]',
        bg: 'bg-[#fefce8]',
        bgHover: 'hover:bg-[#fef9c3]',
        text: 'text-[#854d0e]',
        lightText: 'text-[#a16207]/80',
        badgeBg: 'bg-[#fef9c3]',
        btnBg: 'bg-[#eab308]',
        btnBorder: 'border-[#a16207]',
      }
    },
    {
      id: 'number_to_text' as UtilityTab,
      title: 'ĐỔI SỐ THÀNH CHỮ',
      desc: 'Dịch chuyển dễ dàng con số tài chính thành chữ đọc chuẩn sư phạm Việt Nam.',
      emoji: '🗣️',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#fecdd3]',
        bg: 'bg-[#fff5f5]',
        bgHover: 'hover:bg-[#ffe4e6]',
        text: 'text-[#9f1239]',
        lightText: 'text-[#be123c]/80',
        badgeBg: 'bg-[#ffe4e6]',
        btnBg: 'bg-[#f43f5e]',
        btnBorder: 'border-[#be123c]',
      }
    },
    {
      id: 'bmi_calc' as UtilityTab,
      title: 'BẢNG TÍNH CHỈ SỐ BMI SỨC KHỎE',
      desc: 'Hỗ trợ tính toán nhanh chỉ số cơ thể học sinh tiểu học, cảnh báo thể chất gầy béo.',
      emoji: '📊',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#a7f3d0]',
        bg: 'bg-[#ecfdf5]',
        bgHover: 'hover:bg-[#d1fae5]',
        text: 'text-[#065f46]',
        lightText: 'text-[#047857]/80',
        badgeBg: 'bg-[#d1fae5]',
        btnBg: 'bg-[#10b981]',
        btnBorder: 'border-[#047857]',
      }
    },
    {
      id: 'invitation_poster' as UtilityTab,
      title: 'TẠO THƯ MỜI HỌP PHỤ HUYNH',
      desc: 'Thiết kế thư mời họp phụ huynh A4 ngang chuẩn thẩm mỹ Pastel thanh lịch, dễ thương.',
      emoji: '✉️',
      action: 'MỞ TIỆN ÍCH',
      theme: {
        border: 'border-[#fbcfe8]',
        bg: 'bg-[#fdf2f8]',
        bgHover: 'hover:bg-[#fce7f3]',
        text: 'text-[#9d174d]',
        lightText: 'text-[#db2777]/80',
        badgeBg: 'bg-[#fce7f3]',
        btnBg: 'bg-[#ec4899]',
        btnBorder: 'border-[#be185d]',
      }
    }
  ];

  /* ---------------------- SHARED TOAST STUFF ---------------------- */
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className={`space-y-8 text-left pb-16 relative ${activeUtil !== 'writing' ? 'times-font' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playpen+Sans:wght@300;400;700&family=Great+Vibes&display=swap');
        
        .times-font {
          font-family: 'Times New Roman', Times, serif;
        }

        .vietnamese-grid-pattern {
          background-size: 20px 20px;
          background-image: 
          linear-gradient(to right, rgba(37, 99, 235, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(37, 99, 235, 0.3) 1px, transparent 1px);
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Hero Header bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 p-6 md:p-8 rounded-[32px] text-white space-y-2 relative overflow-hidden border border-blue-500/10">
        <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-2.5">
          <Wrench className="w-6 h-6 text-indigo-200" />
          <span className="text-xs font-black tracking-widest text-[#93c5fd] uppercase">GÓC TRỢ LÝ SƯ PHẠM</span>
        </div>
        <h2 className="text-lg md:text-xl font-black font-sans tracking-tight">TRẠM CÔNG CỤ TIỆN ÍCH DẠY HỌC TƯƠNG TÁC</h2>
        <p className="text-[11px] md:text-xs text-indigo-200/90 font-medium max-w-2xl leading-relaxed">
          Nơi tổng hợp các tiện ích dạy học tương tác thông minh hàng đầu cho Thầy Cô giáo tiểu học, hỗ trợ gieo xúc xắc, thiết lập đồng hồ, và thiết kế bài tập viết o-ly trực quan kéo thả.
        </p>
      </div>

      {/* TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-extrabold text-[11px] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800"
          >
            <span>✨</span> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Utility Workspace Panel Or Station Select Cards list */}
      {activeUtil ? (
        <div className="space-y-6">
          {/* Top Return navigation row */}
          <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm">
            <button 
              onClick={() => { setActiveUtil(null); SoundEffects.playTing(); }} 
              className="flex items-center gap-2 text-xs font-black text-blue-650 hover:text-blue-800 transition cursor-pointer"
            >
              ← QUAY LẠI TRẠM SƯ PHẠM TIỆN ÍCH
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase font-sans">
              <span>Đang mở:</span>
              <span className="text-slate-800 font-extrabold underline decoration-blue-500 bg-slate-50 px-2 py-0.5 rounded-lg border">
                {UTIL_STATIONS.find(s => s.id === activeUtil)?.title}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs animate-fade-in animate-duration-300">
            {activeUtil === 'timer' && <StopwatchAndCountdown showToast={showToast} />}
            {activeUtil === 'clock' && <TeachingClock showToast={showToast} />}
            {activeUtil === 'writing' && <HandwritingPracticeSheet />}
            {activeUtil === 'writing_creator' && <InteractiveWritingCreator showToast={showToast} />}
            {activeUtil === 'random_number' && <RandomNumberGenerator showToast={showToast} />}
            {activeUtil === 'lucky_wheel' && <LuckyWheel showToast={showToast} />}
            {activeUtil === 'dice' && <DiceRoller showToast={showToast} />}
            {activeUtil === 'qr_generator' && <QrGenerator showToast={showToast} />}
            {activeUtil === 'avatar_blue_tick' && <CombinedAvatarCreator showToast={showToast} />}
            {activeUtil === 'number_to_text' && <NumberToText showToast={showToast} />}
            {activeUtil === 'bmi_calc' && <BmiCalculator showToast={showToast} />}
            {activeUtil === 'invitation_poster' && <InvitationPosterCreator showToast={showToast} />}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in animate-duration-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2" style={{ fontFamily: 'var(--font-title)' }}>
              🎯 CÁC TIỆN ÍCH SƯ PHẠM TƯƠNG TÁC LỚP HỌC
            </h3>
          </div>

          <div className="bg-[#FFFDE8] p-5 rounded-[24px] border-4 border-[#FFF5B8] shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {UTIL_STATIONS.map((station) => (
                <div 
                  key={station.id} 
                  className={`p-5 bg-white rounded-3xl flex flex-col justify-between items-center text-center shadow-xs h-full transition-transform duration-200 hover:-translate-y-1.5 border-3 cursor-pointer ${station.theme.border} hover:${station.theme.bg}`}
                  onClick={() => { setActiveUtil(station.id); SoundEffects.playTing(); }}
                >
                  <div className={`w-12 h-12 rounded-full ${station.theme.badgeBg} ${station.theme.text} flex items-center justify-center text-xl mb-3 border ${station.theme.border} self-center shadow-xs`}>
                    {station.emoji}
                  </div>
                  <div className="mb-4 flex-1 flex flex-col justify-center">
                    <h4 className={`text-[12px] font-black uppercase mb-1.5 font-sans ${station.theme.text}`}>{station.title}</h4>
                    <p className={`text-[11.5px] font-semibold leading-normal ${station.theme.lightText}`}>
                      {station.desc}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveUtil(station.id); SoundEffects.playTing(); }}
                    className={`w-full py-2.5 rounded-xl text-[11px] font-black uppercase text-center transition border-b-4 active:border-b-0 cursor-pointer mt-auto ${station.theme.btnBg} ${station.theme.btnBorder} text-white shadow-xs`}
                  >
                    {station.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* 1. STOPWATCH & COUNTDOWN                                                  */
/* ========================================================================= */
interface UtilProps {
  showToast: (msg: string) => void;
}

function StopwatchAndCountdown({ showToast }: UtilProps) {
  const [totalSeconds, setTotalSeconds] = useState(60); // 1 minute default
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (interval) clearInterval(interval);
            SoundEffects.playKeng();
            showToast("🔔 Đã hết thời gian bám giờ thi đấu học tập!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, showToast]);

  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;

  const handleAdjustMin = (amount: number) => {
    if (isRunning) return;
    const currentMin = Math.floor(totalSeconds / 60);
    const currentSec = totalSeconds % 60;
    const newMin = Math.max(0, currentMin + amount);
    setTotalSeconds(newMin * 60 + currentSec);
    SoundEffects.playTing();
  };

  const handleAdjustSec = (amount: number) => {
    if (isRunning) return;
    const currentMin = Math.floor(totalSeconds / 60);
    const currentSec = totalSeconds % 60;
    let newSec = currentSec + amount;
    let newMin = currentMin;
    if (newSec >= 60) {
      newSec = 0;
      newMin += 1;
    } else if (newSec < 0) {
      newSec = 59;
      newMin = Math.max(0, newMin - 1);
    }
    setTotalSeconds(newMin * 60 + newSec);
    SoundEffects.playTing();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalSeconds(60);
    SoundEffects.playTing();
  };

  const handleExportHtml = () => {
    SoundEffects.playKeng();
    const filename = "dong_ho_bam_gio.html";
    const title = "ĐỒNG HỒ ĐẾM NGƯỢC STANDALONE";
    const elementHtml = `
      <div class="max-w-md mx-auto bg-white p-8 rounded-[32px] shadow-2xl border-4 border-slate-900 border-b-8 text-center" style="font-family: 'Times New Roman', Times, serif;">
        <h3 class="text-2xl font-black text-slate-800 tracking-wider uppercase mb-6">⏱️ ĐỒNG HỒ THI ĐẤU TIỂU HỌC</h3>
        
        <div class="flex items-center gap-4 justify-center mb-8">
          <!-- Phút card -->
          <div class="relative bg-slate-900 text-white rounded-2xl w-28 h-28 flex flex-col items-center justify-center shadow-lg border border-slate-800 overflow-hidden">
            <div class="absolute inset-x-0 top-1/2 h-0.5 bg-slate-950/70"></div>
            <span id="minBox" class="text-5xl font-black font-mono relative z-10">01</span>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Phút</span>
          </div>

          <span class="text-4xl font-black text-slate-400 relative bottom-2 animate-pulse">:</span>

          <!-- Giây card -->
          <div class="relative bg-slate-900 text-white rounded-2xl w-28 h-28 flex flex-col items-center justify-center shadow-lg border border-slate-800 overflow-hidden">
            <div class="absolute inset-x-0 top-1/2 h-0.5 bg-slate-950/70"></div>
            <span id="secBox" class="text-5xl font-black font-mono relative z-10 text-red-500">00</span>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Giây</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-2xl mb-6 border font-bold text-slate-750">
          <div class="flex items-center justify-center gap-1.5">
            <span class="text-xs">Phút:</span>
            <button onclick="changeMin(-1)" class="w-8 h-8 bg-sky-100 text-sky-800 rounded-full font-black text-sm border hover:bg-sky-200 cursor-pointer">▼</button>
            <span id="labelMinVal" class="w-8 text-sm font-mono font-black text-slate-900">1</span>
            <button onclick="changeMin(1)" class="w-8 h-8 bg-sky-100 text-sky-800 rounded-full font-black text-sm border hover:bg-sky-200 cursor-pointer">▲</button>
          </div>
          <div class="flex items-center justify-center gap-1.5">
            <span class="text-xs">Giây:</span>
            <button onclick="changeSec(-1)" class="w-8 h-8 bg-sky-100 text-sky-800 rounded-full font-black text-sm border hover:bg-sky-200 cursor-pointer">▼</button>
            <span id="labelSecVal" class="w-8 text-sm font-mono font-black text-slate-900">0</span>
            <button onclick="changeSec(1)" class="w-8 h-8 bg-sky-100 text-sky-800 rounded-full font-black text-sm border hover:bg-sky-200 cursor-pointer">▲</button>
          </div>
        </div>

        <div class="flex gap-3">
          <button id="btnStart" onclick="toggleTimer()" class="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase rounded-xl tracking-wider shadow cursor-pointer">KHỞI CHẠY</button>
          <button onclick="resetTimer()" class="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase rounded-xl tracking-wider shadow cursor-pointer">LÀM MỚI</button>
        </div>
      </div>

      <script>
        let m = 1, s = 0, isRun = false, timer = null;

        function updateUI() {
          document.getElementById('minBox').innerText = String(m).padStart(2,'0');
          document.getElementById('secBox').innerText = String(s).padStart(2,'0');
          document.getElementById('labelMinVal').innerText = m;
          document.getElementById('labelSecVal').innerText = s;
        }

        function changeMin(v) {
          if (isRun) return;
          m = Math.max(0, m + v);
          updateUI();
        }

        function changeSec(v) {
          if (isRun) return;
          s = Math.max(0, s + v);
          if (s >= 60) { s = 0; m++; }
          updateUI();
        }

        function toggleTimer() {
          const btn = document.getElementById('btnStart');
          if (isRun) {
            clearInterval(timer);
            isRun = false;
            btn.innerText = "TIẾP TỤC";
            btn.className = "flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase rounded-xl tracking-wider shadow cursor-pointer";
          } else {
            isRun = true;
            btn.innerText = "TẠM DỪNG";
            btn.className = "flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase rounded-xl tracking-wider shadow cursor-pointer";
            timer = setInterval(() => {
              if (s === 0) {
                if (m === 0) {
                  clearInterval(timer);
                  isRun = false;
                  alert("🔔 Đã hết thời gian!");
                  resetTimer();
                  return;
                }
                m--; s = 59;
              } else {
                s--;
              }
              updateUI();
            }, 1000);
          }
        }

        function resetTimer() {
          clearInterval(timer);
          isRun = false;
          m = 1; s = 0;
          document.getElementById('btnStart').innerText = "KHỞI CHẠY";
          document.getElementById('btnStart').className = "flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase rounded-xl tracking-wider shadow cursor-pointer";
          updateUI();
        }
      </script>
    `;

    // Trigger full utility download file helper
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #f8fafc; padding: 2.5rem; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Times New Roman', serif; }
  </style>
</head>
<body>
  ${elementHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("💾 Đã tải xuống file HTML đồng hồ độc lập thành công!");
  };

  const handleExportMp4 = () => {
    const secsToRecord = totalSeconds;
    const totalFrames = secsToRecord * 30; // 30 FPS
    
    showToast(`🎬 Đang chuẩn bị và render Video bộ đếm Full HD 1080p (${secsToRecord} giây)...`);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx || !canvas.captureStream) {
        throw new Error("Trình duyệt không hỗ trợ captureStream!");
      }
      
      const stream = canvas.captureStream(30);
      
      // Dynamically probe for a supported MIME type
      let options: MediaRecorderOptions = {};
      const mimeTypes = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      
      let selectedMime = 'video/webm';
      for (const mime of mimeTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
          options = { mimeType: mime };
          selectedMime = mime;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const fileExt = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dong_ho_dem_nguoc_full_hd.${fileExt}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`💾 Đã xuất xong lưu video đếm ngược Full HD (.${fileExt}) thành công!`);
      };
      
      mediaRecorder.start();
      let frame = 0;
      
      const interval = setInterval(() => {
        // Draw high resolution Full HD background
        const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1920, 1080);

        // Subtle grid decorative bg lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1920; i += 60) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke();
        }
        for (let j = 0; j < 1080; j += 60) {
          ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(1920, j); ctx.stroke();
        }

        // Header Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText("ĐỒNG HỒ ĐẾM NGƯỢC THI ĐẤU", 960, 200);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 32px sans-serif';
        ctx.fillText("TIỆN ÍCH DÀNH CHO LỚP HỌC TIỂU HỌC VIỆT NAM", 960, 280);

        // Calculate current countdown numbers based on frame count
        const currentSecsLeft = Math.max(0, secsToRecord - Math.floor(frame / 30));
        const currentMin = Math.floor(currentSecsLeft / 60);
        const currentSec = currentSecsLeft % 60;

        // Minutes box position
        const boxY = 380;
        const boxWidth = 320;
        const boxHeight = 360;
        const minBoxX = 580;
        const secBoxX = 1020;

        // Render Minutes Card
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(minBoxX, boxY, boxWidth, boxHeight, 32);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Horizontal split line minutes
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.7)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(minBoxX, boxY + boxHeight / 2);
        ctx.lineTo(minBoxX + boxWidth, boxY + boxHeight / 2);
        ctx.stroke();

        // Render Seconds Card
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(secBoxX, boxY, boxWidth, boxHeight, 32);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Horizontal split line seconds
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.7)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(secBoxX, boxY + boxHeight / 2);
        ctx.lineTo(secBoxX + boxWidth, boxY + boxHeight / 2);
        ctx.stroke();

        // Colon element in the center : (blink every half second)
        const isColonVisible = Math.floor(frame / 15) % 2 === 0;
        if (isColonVisible) {
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 120px sans-serif';
          ctx.fillText(":", 960, boxY + boxHeight / 2 + 25);
        }

        // Draw the Text values
        // Minutes value
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 180px monospace';
        ctx.fillText(String(currentMin).padStart(2, '0'), minBoxX + boxWidth / 2, boxY + boxHeight / 2 + 65);

        // Seconds value
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 180px monospace';
        ctx.fillText(String(currentSec).padStart(2, '0'), secBoxX + boxWidth / 2, boxY + boxHeight / 2 + 65);

        // Draw Text labels underneath inside cards
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText("PHÚT", minBoxX + boxWidth / 2, boxY + boxHeight - 30);
        ctx.fillText("GIÂY", secBoxX + boxWidth / 2, boxY + boxHeight - 30);

        // Draw neon glowing dynamic progress bar at the bottom
        const progressPercent = secsToRecord > 0 ? (currentSecsLeft / secsToRecord) : 0;
        const barWidth = 1200;
        const barHeight = 24;
        const barX = (1920 - barWidth) / 2;
        const barY = 820;

        // Track bg container
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 12);
        ctx.fill();

        // Filled tracking bar
        const fillWidth = barWidth * progressPercent;
        if (fillWidth > 0) {
          ctx.fillStyle = '#10b981'; // vibrant neon green
          ctx.beginPath();
          ctx.roundRect(barX, barY, fillWidth, barHeight, 12);
          ctx.fill();
        }

        // Show watermarks and instruction footer
        ctx.fillStyle = '#475569';
        ctx.font = '500 24px sans-serif';
        ctx.fillText("Xuất bản chất lượng cao từ Tiện ích Sư phạm Tiểu học", 960, 920);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(interval);
          mediaRecorder.stop();
        }
      }, 33);
    } catch(err: any) {
      console.warn("MediaRecorder issue:", err);
      showToast("⚠️ Trình duyệt của Bác bị giới hạn quyền hoặc chưa hỗ trợ ghi canvas trong iframe. Bác hãy mở ứng dụng ở Tab mới để xuất trơn tru nhé!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 text-center">
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">⏱️ ĐỒNG HỒ BÁM GIỜ / ĐẾM NGƯỢC HỌC TẬP</h4>
        <p className="text-[10px] text-slate-500">Thiết kế dải flip lật số cơ học bộc lộ tính trực quan hỗ trợ rèn thi đua lớp học.</p>
      </div>

      {/* Two giant flip boxes matching 2.DongHoBamGio.PNG */}
      <div className="flex items-center gap-4 justify-center relative bg-white py-2">
        {/* Phút Card */}
        <div className="relative bg-slate-900 text-white rounded-3xl w-28 h-32 flex flex-col items-center justify-center shadow-lg border border-slate-850 overflow-hidden">
          {/* Horizontal flip line separator */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-950/70 z-20"></div>
          <span className="text-6xl font-black font-mono relative z-10 text-white select-none">
            {min.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">PHÚT</span>
        </div>

        <span className="text-4xl font-black text-slate-400 animate-pulse select-none">:</span>

        {/* Giây Card */}
        <div className="relative bg-slate-900 text-white rounded-3xl w-28 h-32 flex flex-col items-center justify-center shadow-lg border border-slate-850 overflow-hidden">
          {/* Horizontal flip line separator */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-950/70 z-20"></div>
          <span className="text-6xl font-black font-mono relative z-10 text-rose-500 select-none">
            {sec.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">GIÂY</span>
        </div>
      </div>

      {/* Config rows stepper with down/up arrows */}
      <div className="flex bg-slate-50 border p-3 rounded-2xl justify-around items-center font-bold text-xs text-slate-705">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[10.5px] uppercase">Phút:</span>
          <button 
            onClick={() => handleAdjustMin(-1)} 
            className="w-7 h-7 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full font-black flex items-center justify-center border border-sky-100 cursor-pointer active:scale-90"
          >
            ▼
          </button>
          <span className="w-6 text-sm font-mono font-black">{min}</span>
          <button 
            onClick={() => handleAdjustMin(1)} 
            className="w-7 h-7 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full font-black flex items-center justify-center border border-sky-100 cursor-pointer active:scale-90"
          >
            ▲
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[10.5px] uppercase">Giây:</span>
          <button 
            onClick={() => handleAdjustSec(-1)} 
            className="w-7 h-7 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full font-black flex items-center justify-center border border-sky-100 cursor-pointer active:scale-90"
          >
            ▼
          </button>
          <span className="w-6 text-sm font-mono font-black">{sec}</span>
          <button 
            onClick={() => handleAdjustSec(1)} 
            className="w-7 h-7 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full font-black flex items-center justify-center border border-sky-100 cursor-pointer active:scale-90"
          >
            ▲
          </button>
        </div>
      </div>

      {/* Main control buttons row: Bat dau, Tiep tuc, Ket thuc */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          onClick={() => { setIsRunning(true); SoundEffects.playTing(); }} 
          disabled={isRunning || totalSeconds === 0}
          className="flex-1 py-3 bg-[#facc15] hover:bg-yellow-500 text-slate-900 font-black text-xs uppercase rounded-full shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          Bắt đầu
        </button>
        
        <button 
          onClick={() => { setIsRunning(!isRunning); SoundEffects.playTing(); }} 
          disabled={totalSeconds === 0}
          className={`flex-1 py-3 ${isRunning ? 'bg-[#db093c] hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-black text-xs uppercase rounded-full shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50`}
        >
          {isRunning ? "Tạm dừng ⏸️" : "Tiếp tục ▶️"}
        </button>

        <button 
          onClick={handleReset} 
          className="flex-1 py-3 bg-[#1e293b] hover:bg-slate-850 text-white font-black text-xs uppercase rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
        >
          Kết thúc
        </button>
      </div>

      {/* Exporters footer layout row */}
      <div className="flex gap-2 pt-2 border-t justify-center text-[10px] font-black">
        <button 
          onClick={handleExportHtml} 
          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-150 transition flex items-center gap-1 cursor-pointer"
        >
          📥 Xuất HTML độc lập
        </button>
        <button 
          onClick={handleExportMp4} 
          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-150 transition flex items-center gap-1 cursor-pointer"
        >
          🎬 Xuất video .mp4
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 2. ANALOG TEACHING CLOCK                                                  */
/* ========================================================================= */
function TeachingClock({ showToast }: UtilProps) {
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(15);
  const clockContainerRef = useRef<HTMLDivElement>(null);

  const calculateAngle = (val: number, max: number) => (val / max) * 360;

  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const handleDownloadClock = () => {
    SoundEffects.playKeng();
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center and scale layout
    const cx = 256;
    const cy = 256;
    const r = 230;

    // Smooth and beautiful Anti-Aliased Graphics
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw background outer rim
    ctx.strokeStyle = '#334155'; // Slate-700
    ctx.lineWidth = 14;
    ctx.fillStyle = '#e0f2fe'; // bg-[#e0f2fe] Sky clear blue
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw outer secondary border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 10, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw minute / ticks
    ctx.fillStyle = '#0f172a';
    for (let idx = 0; idx < 60; idx++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((idx * 6 * Math.PI) / 180);
      const isFive = idx % 5 === 0;
      const tickLen = isFive ? 14 : 6;
      const tickWidth = isFive ? 4 : 1.5;
      ctx.fillRect(-tickWidth / 2, -r + 12, tickWidth, tickLen);
      ctx.restore();
    }

    // Draw numbers 1-12 centered symmetrically
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const numDist = r - 45;
    const testNums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    testNums.forEach((num, idx) => {
      const angle = (idx * 30 * Math.PI) / 180;
      const nx = cx + numDist * Math.sin(angle);
      const ny = cy - numDist * Math.cos(angle);
      ctx.fillText(num.toString(), nx, ny);
    });

    // Draw Hour Hand
    const hrAngle = (((hour % 12) + minute / 60) * 30 * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(hrAngle);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(0, -110);
    ctx.stroke();
    // Inner white indicator line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -95);
    ctx.stroke();
    ctx.restore();

    // Draw Minute Hand (Kim phút ngắn lại 2 size)
    const minAngle = (minute * 6 * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(minAngle);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(0, -127); // Shortened by 2 sizes
    ctx.stroke();
    // Inner white indicator line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -117);
    ctx.stroke();
    ctx.restore();

    // Draw Dual red center pin cap
    ctx.fillStyle = '#dc2626'; // red-600
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Trigger vector image download
    const link = document.createElement('a');
    link.download = `dong_ho_day_hoc_${hour}h${minute}m.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("💾 Tải ảnh đồng hồ vector siêu nét thành công!");
  };

  return (
    <div className="max-w-md mx-auto text-center p-4 space-y-6">
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">🕒 ĐỒNG HỒ DẠY HỌC KIM TƯƠNG TÁC</h4>
        <p className="text-[10px] text-slate-500">Giúp các thầy cô truyền đạt trực quan cách đọc múi giờ, số giờ, số phút từng bước.</p>
      </div>

      {/* Clock Face Panel Area to screenshot */}
      <div 
        ref={clockContainerRef} 
        id="clock-capture-face"
        className="relative w-64 h-64 mx-auto rounded-full border-8 border-slate-700 bg-[#e0f2fe] shadow-lg flex items-center justify-center select-none"
      >
        {/* Clock marks / minute ticks */}
        {Array.from({ length: 60 }).map((_, idx) => (
          <div 
            key={idx} 
            className="absolute bg-slate-850"
            style={{
              bottom: '50%',
              left: '50%',
              width: idx % 5 === 0 ? '3px' : '1px',
              height: idx % 5 === 0 ? '8px' : '4px',
              transformOrigin: '0 114px',
              transform: `translateX(-50%) rotate(${idx * 6}deg) translateY(-114px)`
            }}
          />
        ))}

        {/* Display dial numbers 1-12 centered symmetrically around the outer circle inside ticks */}
        {numbers.map((num, idx) => {
          const angle = (idx * 30 * Math.PI) / 180;
          const x = 50 + 36 * Math.sin(angle);
          const y = 50 - 36 * Math.cos(angle);
          return (
            <div 
              key={num} 
              className="absolute font-serif text-[18px] font-black text-slate-900 text-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {num}
            </div>
          );
        })}

        {/* Dual Red center cap with white centerpiece dot */}
        <div className="absolute w-4.5 h-4.5 bg-red-600 rounded-full z-40 flex items-center justify-center shadow">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>

        {/* Hour Hand (Thick elegant tapered pointer vector shape) */}
        <div 
          className="absolute w-2 h-16 bg-slate-900 origin-bottom rounded-full z-20 pointer-events-none"
          style={{ 
            bottom: '50%',
            transform: `rotate(${calculateAngle((hour % 12) + minute / 60, 12)}deg)` 
          }}
        >
          {/* Inner accent strip */}
          <div className="w-0.5 h-10 bg-white mx-auto mt-2 rounded"></div>
        </div>

        {/* Minute Hand (Kim phút ngắn lại 2 size) */}
        <div 
          className="absolute w-1.5 h-14 bg-slate-900 origin-bottom rounded-full z-25 pointer-events-none"
          style={{ 
            bottom: '50%',
            transform: `rotate(${calculateAngle(minute, 60)}deg)` 
          }}
        >
          {/* Inner accent strip */}
          <div className="w-0.5 h-9 bg-white mx-auto mt-1.5 rounded"></div>
        </div>
      </div>

      {/* Symmetrically grouped controls based on purple badges in 3.DongHo.PNG */}
      <div className="flex flex-col gap-3 max-w-sm mx-auto font-black text-xs">
        
        {/* Readout label box */}
        <div className="bg-slate-50 border p-3 rounded-2xl flex items-center justify-between text-slate-850 px-4">
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Thời gian hiện tại:</span>
          <span className="text-lg font-black font-mono text-slate-900 underline decoration-indigo-500 underline-offset-4">
            {hour.toString().padStart(2, '0')} : {minute.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Purple controls row */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Hour config block: [v] Giờ [^] */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-1.5 rounded-xl text-indigo-900">
            <button 
              onClick={() => { setHour(h => (h - 1 + 24) % 24); SoundEffects.playTing(); }} 
              className="w-7 h-7 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▼
            </button>
            <span className="uppercase text-[10px] tracking-wide font-extrabold font-serif">Giờ</span>
            <button 
              onClick={() => { setHour(h => (h + 1) % 24); SoundEffects.playTing(); }} 
              className="w-7 h-7 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▲
            </button>
          </div>

          {/* Minute config block: [v] Phút [^] */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-1.5 rounded-xl text-indigo-900">
            <button 
              onClick={() => { setMinute(m => (m - 1 + 60) % 60); SoundEffects.playTing(); }} 
              className="w-7 h-7 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▼
            </button>
            <span className="uppercase text-[10px] tracking-wide font-extrabold font-serif">Phút</span>
            <button 
              onClick={() => { setMinute(m => (m + 1) % 60); SoundEffects.playTing(); }} 
              className="w-7 h-7 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▲
            </button>
          </div>

          {/* Plus-5 units config: [v] Phút+5 [^] */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-1.5 rounded-xl text-indigo-900">
            <button 
              onClick={() => { setMinute(m => (m - 5 + 60) % 60); SoundEffects.playTing(); }} 
              className="w-7 h-7 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▼
            </button>
            <span className="uppercase text-[9px] tracking-wide font-extrabold font-serif">Phút+5</span>
            <button 
              onClick={() => { setMinute(m => (m + 5) % 60); SoundEffects.playTing(); }} 
              className="w-7 h-7 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ▲
            </button>
          </div>
        </div>

        {/* Action item download image */}
        <button 
          onClick={handleDownloadClock} 
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white uppercase rounded-xl shadow cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5"
        >
          📥 Tải ảnh đồng hồ xuống
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 3. WRITING SHEET                                                          */
/* ========================================================================= */
function HandwritingPracticeSheet() {
  const [text, setText] = useState('Em rèn viết chữ đẹp chăm ngoan học giỏi nghe lời cô giáo dạy');
  const [fontSize, setFontSize] = useState(32);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [inkColor, setInkColor] = useState<'blue'|'red'|'black'>('blue');
  const [fontFamily, setFontFamily] = useState<string>('HP001_4_hang_bold');
  const [drawingMode, setDrawingMode] = useState<'type'|'draw'|'both'>('both');
  const [brushSize, setBrushSize] = useState(3);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Resize canvas handler to sync high DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [drawingMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (drawingMode === 'type') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = inkColor === 'blue' ? '#1d4ed8' : inkColor === 'red' ? '#dc2626' : '#1e293b';
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawingMode === 'type') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        SoundEffects.playTing();
      }
    }
  };

  const handleExportPdf = async () => {
    SoundEffects.playKeng();
    const area = document.getElementById('handwriting-pdf-area');
    const drawCanvas = canvasRef.current;
    if (area) {
      // Create high-res screenshot
      const htmlCanvas = await safeHtml2Canvas(area, { scale: 2 });
      
      // Draw canvas sketch markups on top of layout snapshot
      if (drawCanvas) {
        const destCtx = htmlCanvas.getContext('2d');
        if (destCtx) {
          const areaRect = area.getBoundingClientRect();
          const drawRect = drawCanvas.getBoundingClientRect();
          
          const scaleX = htmlCanvas.width / areaRect.width;
          const scaleY = htmlCanvas.height / areaRect.height;
          
          const xOffset = (drawRect.left - areaRect.left) * scaleX;
          const yOffset = (drawRect.top - areaRect.top) * scaleY;
          const targetWidth = drawRect.width * scaleX;
          const targetHeight = drawRect.height * scaleY;
          
          // Render drawn strokes beautifully
          destCtx.drawImage(drawCanvas, xOffset, yOffset, targetWidth, targetHeight);
        }
      }

      const imgData = htmlCanvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (htmlCanvas.height * imgWidth) / htmlCanvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('baisoan_luyen_viet_chu_oly.pdf');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-rose-600 uppercase tracking-wider">✍️ LUYỆN VIẾT CHỮ TRÊN GIẤY 4 Ô LY</h4>
          <p className="text-[10px] text-slate-500">Đặt nội dung luyện chữ viết calligraph trực tiếp lên ô ly chuẩn của học sinh.</p>
        </div>
        <button 
          onClick={handleExportPdf} 
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer border-b-2 border-emerald-950 active:scale-95"
        >
          <Printer className="w-4.5 h-4.5" /> Xuất bản PDF 📄
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Settings column left side */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 border space-y-4 text-xs font-bold text-slate-705">
          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase tracking-wide text-slate-500 block">Nội dung rèn chữ (nhập tại đây hoặc click gõ trực tiếp lên giấy):</span>
            <textarea 
              value={text || ''} 
              onChange={(e) => setText(e.target.value)} 
              rows={4} 
              className="w-full text-xs font-semibold p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white resize-y" 
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase tracking-wide text-slate-500 block">Chọn Font chữ sư phạm ✍️:</span>
            <select
              value={fontFamily || 'HP001_4_hang_bold'}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full text-xs font-black p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="HP001_4_hang_bold">Font HP001 4 Hàng (Chữ Đậm) ⭐</option>
              <option value="HP0014HB">Font HP001 4 Hàng (Chữ Thường) ⭐</option>
              <option value="Dancing Script">Font Dancing Script (Nét thanh nét đậm) 🌹</option>
              <option value="Times New Roman">Font Chữ Standard (Times New Roman) 📄</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase tracking-wide text-slate-500 block">Chế độ tương tác:</span>
            <div className="grid grid-cols-3 gap-1">
              <button 
                onClick={() => { setDrawingMode('type'); SoundEffects.playTing(); }} 
                className={`py-1.5 text-[9.5px] rounded-lg border font-black uppercase transition ${drawingMode === 'type' ? 'bg-rose-600 border-rose-500 text-white shadow-xs' : 'bg-white text-slate-700'}`}
              >
                Chỉ Nhập ⌨️
              </button>
              <button 
                onClick={() => { setDrawingMode('draw'); SoundEffects.playTing(); }} 
                className={`py-1.5 text-[9.5px] rounded-lg border font-black uppercase transition ${drawingMode === 'draw' ? 'bg-rose-600 border-rose-500 text-white shadow-xs' : 'bg-white text-slate-700'}`}
              >
                Chỉ Vẽ 🖌️
              </button>
              <button 
                onClick={() => { setDrawingMode('both'); SoundEffects.playTing(); }} 
                className={`py-1.5 text-[9.5px] rounded-lg border font-black uppercase transition ${drawingMode === 'both' ? 'bg-rose-600 border-rose-500 text-white shadow-xs' : 'bg-white text-slate-700'}`}
              >
                Cả hai 🌟
              </button>
            </div>
          </div>

          {drawingMode !== 'type' && (
            <div className="space-y-3 p-3 bg-white border border-rose-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-800">Cỡ nét vẽ tay: {brushSize}px</span>
                <input 
                  type="range" 
                  min={1} 
                  max={10} 
                  value={brushSize ?? 3} 
                  onChange={(e) => setBrushSize(Number(e.target.value))} 
                  className="w-24 accent-rose-600 cursor-pointer" 
                />
              </div>
              <button
                onClick={clearCanvas}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition uppercase"
              >
                🧹 Xóa nét viết tay tự do
              </button>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[10.5px] uppercase tracking-wide text-gray-400 block">Cỡ chữ nét bút viết ({fontSize}px):</span>
            <input type="range" min={24} max={48} value={fontSize ?? 32} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-rose-600 cursor-pointer" />
          </div>

          <div className="space-y-2">
            <span className="text-[10.5px] uppercase tracking-wide text-gray-400 block">Khoảng cách chữ ({letterSpacing}px):</span>
            <input type="range" min={0} max={18} value={letterSpacing ?? 0} onChange={e => setLetterSpacing(Number(e.target.value))} className="w-full accent-rose-600 cursor-pointer" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase text-gray-400">Màu mực rèn viết:</span>
            <div className="flex gap-2">
              <button onClick={() => setInkColor('blue')} className={`flex-1 py-1.5 text-[10.5px] rounded-xl border font-black uppercase transition-all ${inkColor === 'blue' ? 'bg-blue-600 border-blue-500 text-white shadow-sm' : 'bg-white text-blue-600 border-blue-150 hover:bg-slate-100'}`}>Xanh</button>
              <button onClick={() => setInkColor('red')} className={`flex-1 py-1.5 text-[10.5px] rounded-xl border font-black uppercase transition-all ${inkColor === 'red' ? 'bg-red-650 border-red-500 text-white shadow-sm' : 'bg-white text-red-500 border-red-150 hover:bg-slate-100'}`}>Đỏ</button>
              <button onClick={() => setInkColor('black')} className={`flex-1 py-1.5 text-[10.5px] rounded-xl border font-black uppercase transition-all ${inkColor === 'black' ? 'bg-slate-900 border-slate-750 text-white shadow-sm' : 'bg-white text-slate-800 border-slate-150 hover:bg-slate-100'}`}>Đen</button>
            </div>
          </div>
        </div>

        {/* Live paper writing grid area */}
        <div className="lg:col-span-8">
          <div 
            id="handwriting-pdf-area" 
            className="relative border-4 border-slate-300 bg-[#fffbeb] p-8 rounded-[32px] shadow-lg max-h-[580px] overflow-y-auto"
          >
            {/* School header lines */}
            <div className="flex justify-between font-serif text-[12px] font-black text-rose-800/80 mb-6">
              <span>Trường Tiểu học: Thi Chuân</span>
              <span>Lớp rèn nét chữ: ...................</span>
            </div>

            <div className="text-center font-bold tracking-widest text-rose-800 text-[18px] uppercase mb-1 font-serif">
              ✍️ BÀI VIẾT LUYỆN CHỮ SƯ PHẠM
            </div>
            <div className="text-center text-[10.5px] font-serif text-slate-400 tracking-wide mb-8 underline underline-offset-4 decoration-rose-200">
              Học sinh rèn nét chữ: .............................................................. Ngày nộp bài rèn: ....../....../2026
            </div>

            {/* Standard Vietnamese 4-grid line pattern */}
            <div className="relative min-h-[512px] pb-6">
              {/* Rows of handwriting guidelines */}
              <div className="flex flex-col gap-0 w-full relative">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="relative w-full h-[64px] border-b border-[#fca5af]/95 select-none pb-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(to bottom, rgba(239, 68, 68, 0.15) 1px, transparent 1px),
                        linear-gradient(to right, rgba(239, 68, 68, 0.22) 1px, transparent 1px)
                      `,
                      backgroundSize: '16px 16px'
                    }}
                  >
                    {/* Secondary middle dashed division rows */}
                    <div className="absolute inset-x-0 top-[16px] h-0 cursor-not-allowed border-t border-dashed border-[#fca5af]/40"></div>
                    <div className="absolute inset-x-0 top-[32px] h-0 cursor-not-allowed border-t border-dashed border-[#fca5af]/40"></div>
                    <div className="absolute inset-x-0 top-[48px] h-0 cursor-not-allowed border-t border-dashed border-[#fca5af]/40"></div>
                  </div>
                ))}
              </div>

              {/* Directly interactive free-hand sketching canvas on top */}
              {drawingMode !== 'type' && (
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-[32px] top-[148px] z-20 w-[90%] h-[320px] bg-transparent cursor-crosshair border border-dashed border-rose-300/20"
                />
              )}

              {/* Direct interactive transparent typing area */}
              {drawingMode !== 'draw' && (
                <textarea
                  value={text || ''}
                  onChange={e => setText(e.target.value)}
                  placeholder="Nhấn tại đây để sửa chữ hoặc rèn thử nội dung mới trực tiếp trên nền giấy..."
                  className="absolute inset-[32px] top-[148px] bg-transparent outline-none focus:ring-0 resize-none select-text focus:border-0 border-0 p-0 text-left font-normal select-all z-10 mr-4"
                  style={{
                    fontFamily: `"${fontFamily}", "Dancing Script", "Times New Roman", cursive, sans-serif`,
                    fontSize: `${fontSize}px`,
                    lineHeight: '64px',
                    letterSpacing: `${letterSpacing}px`,
                    color: inkColor === 'blue' ? '#1d4ed8' : inkColor === 'red' ? '#dc2626' : '#1e293b',
                    overflowY: 'hidden',
                    width: 'calc(100% - 64px)'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 4. RANDOM NUMBER GENERATOR                                                */
/* ========================================================================= */
function RandomNumberGenerator({ showToast }: UtilProps) {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [isNoDuplicates, setIsNoDuplicates] = useState(true);
  const [evenOddFilter, setEvenOddFilter] = useState<'all' | 'even' | 'odd'>('all');
  const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');
  const [delay, setDelay] = useState(4);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([14]);
  const [isRolling, setIsRolling] = useState(false);

  const handleGo = () => {
    if (min >= max) {
      showToast("⚠️ Số nhỏ nhất phải nhỏ hơn Số lớn nhất!");
      return;
    }
    setIsRolling(true);
    SoundEffects.playTing();
    let rollCount = 0;
    const maxRolls = 15;
    const interval = setInterval(() => {
      const mockResult: number[] = [];
      for (let i = 0; i < count; i++) {
        mockResult.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      setCurrentNumbers(mockResult);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        const pool: number[] = [];
        for (let i = min; i <= max; i++) {
          if (evenOddFilter === 'even' && i % 2 !== 0) continue;
          if (evenOddFilter === 'odd' && i % 2 === 0) continue;
          pool.push(i);
        }

        if (pool.length === 0) {
          for (let i = min; i <= max; i++) pool.push(i);
        }

        const finalResults: number[] = [];
        if (isNoDuplicates) {
          const shuffled = [...pool].sort(() => Math.random() - 0.5);
          finalResults.push(...shuffled.slice(0, count));
        } else {
          for (let i = 0; i < count; i++) {
            finalResults.push(pool[Math.floor(Math.random() * pool.length)]);
          }
        }

        if (sortBy === 'asc') {
          finalResults.sort((a, b) => a - b);
        } else if (sortBy === 'desc') {
          finalResults.sort((a, b) => b - a);
        }

        setCurrentNumbers(finalResults.length > 0 ? finalResults : [Math.floor(Math.random() * (max - min + 1)) + min]);
        setIsRolling(false);
        SoundEffects.playKeng();
        showToast("🎉 Kết quả quay số ngẫu nhiên đã xong!");
      }
    }, 100);
  };

  const handleStop = () => {
    setIsRolling(false);
  };

  const setRangeQuick = (minVal: number, maxVal: number) => {
    setMin(minVal);
    setMax(maxVal);
    SoundEffects.playTing();
    showToast(`🎯 Đã áp dụng khoảng nhanh từ ${minVal} đến ${maxVal}!`);
  };

  return (
    <div className="bg-[#1e293b]/95 p-6 rounded-[28px] border-4 border-slate-700 shadow-xl max-w-xl mx-auto space-y-6 text-white text-center">
      <div className="space-y-1">
        <h4 className="text-[13px] font-black tracking-widest text-[#93c5fd] uppercase">QUAY SỐ NGẪU NHIÊN 🔢</h4>
        <p className="text-[10px] text-slate-400">Cấu hình linh hoạt các thông số quay số chẵn lẻ phân chia học sinh</p>
      </div>

      {/* Display box */}
      <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-3xl min-h-[140px] flex items-center justify-center shadow-inner relative">
        <span className="text-[80px] font-black text-rose-500 font-mono tracking-tight leading-none">
          {currentNumbers.join(', ')}
        </span>
      </div>

      {/* Row range settings */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">LẤY SỐ LƯỢNG:</span>
          <input 
            type="number" 
            value={count ?? 1} 
            onChange={e => setCount(Math.max(1, parseInt(e.target.value)||1))} 
            className="w-14 bg-slate-850 p-2 text-center rounded-xl border border-slate-750 text-white font-extrabold focus:outline-none" 
          />
        </div>
        <span className="text-[11px] font-bold text-slate-400">TỪ</span>
        <input 
          type="number" 
          value={min ?? 1} 
          onChange={e => setMin(parseInt(e.target.value)||0)} 
          className="w-16 bg-slate-850 p-2 text-center rounded-xl border border-slate-750 text-white font-extrabold focus:outline-none" 
        />
        <span className="text-[11px] font-bold text-slate-400">ĐẾN</span>
        <input 
          type="number" 
          value={max ?? 100} 
          onChange={e => setMax(parseInt(e.target.value)||100)} 
          className="w-20 bg-slate-850 p-2 text-center rounded-xl border border-slate-750 text-white font-extrabold focus:outline-none" 
        />
      </div>

      {/* Dropdowns filters row */}
      <div className="flex flex-wrap gap-2 justify-center">
        <select 
          value={isNoDuplicates ? 'unique' : 'dup'} 
          onChange={e => setIsNoDuplicates(e.target.value === 'unique')} 
          className="bg-slate-850 border border-slate-750 text-white text-[11px] font-extrabold px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="unique">Không trùng lặp</option>
          <option value="dup">Có trùng lặp</option>
        </select>

        <select 
          value={evenOddFilter || 'all'} 
          onChange={e => setEvenOddFilter(e.target.value as any)} 
          className="bg-slate-850 border border-slate-750 text-white text-[11px] font-extrabold px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="all">Chẵn lẻ (Tất cả)</option>
          <option value="even">Chỉ số Chẵn</option>
          <option value="odd">Chỉ số Lẻ</option>
        </select>

        <select 
          value={sortBy || 'none'} 
          onChange={e => setSortBy(e.target.value as any)} 
          className="bg-slate-850 border border-slate-750 text-white text-[11px] font-extrabold px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="none">Không sắp xếp</option>
          <option value="asc">Sắp xếp Tăng dần</option>
          <option value="desc">Sắp xếp Giảm dần</option>
        </select>
      </div>

      {/* Wait delay row */}
      <div className="flex flex-wrap gap-2.5 justify-center items-center text-xs">
        <div className="flex items-center bg-slate-850 border border-slate-750 rounded-xl px-2.5 py-1 text-[11px] font-extrabold gap-1.5 text-white">
          <span>Thời gian cuộn:</span>
          <input 
            type="number" 
            min={1} 
            max={10} 
            value={delay ?? 4} 
            onChange={e => setDelay(parseInt(e.target.value)||4)} 
            className="w-8 bg-transparent border-none text-center text-white focus:outline-none font-bold" 
          />
          <span>giây</span>
        </div>
        <button 
          onClick={() => setIsSoundOn(!isSoundOn)} 
          className={`p-2 rounded-xl border transition cursor-pointer ${isSoundOn ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-850 border-slate-800 text-slate-500'}`}
        >
          {isSoundOn ? '🔊 Có nhạc' : '🔇 Tắt âm'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-5 pt-2">
        <button 
          onClick={() => {
            SoundEffects.playTing();
            const standaloneHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Quay Số Ngẫu Nhiên Offline - Trạm Học Tập</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Times New Roman', Times, serif; }
  </style>
</head>
<body class="bg-slate-900 min-h-screen flex items-center justify-center p-4">
  <div class="bg-slate-800 border-4 border-slate-700 text-white p-8 rounded-[32px] shadow-2xl max-w-lg w-full text-center space-y-6">
    <div>
      <h1 class="text-xl font-black text-blue-400 uppercase tracking-widest">QUAY SỐ NGẪU NHIÊN 🔢</h1>
      <p class="text-xs text-slate-400">Dành cho Thầy cô chủ nhiệm & Học sinh rèn luyện</p>
    </div>

    <!-- Display result -->
    <div class="bg-slate-950 p-8 rounded-2xl min-h-[120px] flex items-center justify-center shadow-inner">
      <span id="number-display" class="text-6xl font-black text-rose-500 font-mono tracking-tight">-</span>
    </div>

    <!-- Settings grid -->
    <div class="grid grid-cols-2 gap-4 text-xs font-bold text-left text-slate-350 bg-slate-900/50 p-4 rounded-xl">
      <div>
        <label class="block mb-1">Số lượng kết quả:</label>
        <input type="number" id="count-input" value="1" min="1" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono" />
      </div>
      <div>
        <label class="block mb-1">Thời gian cuộn (s):</label>
        <input type="number" id="delay-input" value="3" min="1" max="10" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono" />
      </div>
      <div>
        <label class="block mb-1">Từ số:</label>
        <input type="number" id="min-input" value="1" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono" />
      </div>
      <div>
        <label class="block mb-1">Đến số:</label>
        <input type="number" id="max-input" value="100" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono" />
      </div>
    </div>

    <!-- Buttons triggers -->
    <div class="flex items-center justify-center gap-4 pt-2">
      <button id="roll-btn" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black uppercase text-xs rounded-full shadow-lg transition-all cursor-pointer">Bắt đầu Quay</button>
      <button id="stop-btn" class="px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black uppercase text-xs rounded-full shadow-lg transition-all cursor-pointer">Dừng</button>
    </div>

    <!-- Quick ranges -->
    <div class="flex flex-wrap gap-1.5 justify-center pt-4 border-t border-slate-700/80">
      <button onclick="setRange(1, 10)" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] uppercase rounded-full font-bold">1-10</button>
      <button onclick="setRange(1, 100)" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] uppercase rounded-full font-bold">1-100</button>
      <button onclick="setRange(1, 500)" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] uppercase rounded-full font-bold">1-500</button>
    </div>
  </div>

  <script>
    let isRolling = false;
    let rollInterval = null;

    function setRange(min, max) {
      document.getElementById('min-input').value = min;
      document.getElementById('max-input').value = max;
    }

    document.getElementById('roll-btn').onclick = function() {
      if (isRolling) return;
      
      const min = parseInt(document.getElementById('min-input').value) || 0;
      const max = parseInt(document.getElementById('max-input').value) || 100;
      const count = parseInt(document.getElementById('count-input').value) || 1;
      const delay = parseInt(document.getElementById('delay-input').value) || 3;

      if (min >= max) {
        alert('Số nhỏ nhất phải nhỏ hơn Số lớn nhất!');
        return;
      }

      isRolling = true;
      let durationLeft = delay * 10; // in 100ms ticks

      rollInterval = setInterval(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
          temp.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        document.getElementById('number-display').innerText = temp.join(', ');
        durationLeft--;

        if (durationLeft <= 0) {
          clearInterval(rollInterval);
          isRolling = false;
        }
      }, 100);
    };

    document.getElementById('stop-btn').onclick = function() {
      if (rollInterval) clearInterval(rollInterval);
      isRolling = false;
    };
  </script>
</body>
</html>`;
            const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "quay_so_ngau_nhien_offline.html";
            link.click();
            showToast("💾 Đã xuất file HTML Offline thành công!");
          }} 
          className="flex flex-col items-center bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-xl border border-slate-700 py-2.5 px-4 cursor-pointer text-[10px] font-extrabold uppercase"
        >
          📥
          <span>Xuất HTML</span>
        </button>
        <button 
          onClick={handleGo} 
          disabled={isRolling}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white font-black text-xs uppercase flex items-center justify-center rounded-full shadow-lg transition-all cursor-pointer"
        >
          {isRolling ? '...' : 'Go'}
        </button>
        <button 
          onClick={handleStop} 
          className="w-16 h-16 bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white font-extrabold text-lg flex items-center justify-center rounded-full shadow-lg transition-all cursor-pointer"
        >
          ⏸
        </button>
      </div>

      {/* Quick ranges */}
      <div className="flex flex-wrap gap-1.5 justify-center pt-2 border-t border-slate-800/80">
        {["1-5", "1-10", "1-100", "1-200", "1-500", "1-1000", "1-3000"].map((rangeStr) => {
          const [minVal, maxVal] = rangeStr.split('-').map(Number);
          return (
            <button 
              key={rangeStr} 
              onClick={() => setRangeQuick(minVal, maxVal)} 
              className="px-3 py-1 bg-slate-805 bg-slate-800 hover:bg-slate-700 text-slate-350 font-extrabold text-[10px] rounded-full transition-colors cursor-pointer border border-slate-700 hover:text-white"
            >
              Đặt {rangeStr}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 5. VÒNG QUAY MAY MẮN (LUCKY WHEEL)                                        */
/* ========================================================================= */
const WHEEL_THEMES = {
  drinking: ["Uống 1 ly", "Nhấp môi", "Uống nửa ly", "Qua lượt", "Chỉ định", "Đồng khởi"],
  lunch: ["Cơm tấm", "Phở bò", "Bún chả", "Bún riêu", "Gà rán", "Pizza", "Hủ tiếu"],
  dating: ["Xem phim", "Cà phê", "Trà sữa", "Dạo hồ Tây", "Ăn tối", "Về nhà nghỉ ngợi"],
  evenodd: ["Chẵn", "Lẻ"],
  billing: ["Bạn trả", "Tôi trả", "Chia đôi", "Chủ xị", "Free", "Quay lại"],
  dignity: ["Siêu tốt", "Tốt", "Bình thường", "Tệ", "Siêu tệ"],
  names: ["Tuấn", "Thông", "Sơn", "Dũng", "Phong", "Lan", "Thành", "Thuận", "Trang", "Giang", "Tuyên", "Linh"],
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  colors: ["Đỏ", "Xanh lá", "Xanh dương", "Vàng", "Cam", "Tím", "Hồng"],
  rewards: ["Giải nhất", "Giải nhì", "Giải ba", "Khuyến khích", "Chúc may mắn"]
};

function LuckyWheel({ showToast }: UtilProps) {
  const [itemsText, setItemsText] = useState("Tuấn\nThông\nSơn\nDũng\nPhong\nLan\nThành\nThuận\nTrang\nGiang\nTuyên\nLinh");
  const [wheelSpeed, setWheelSpeed] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningItem, setWinningItem] = useState<string | null>(null);

  const items = itemsText.split('\n').map(s => s.trim()).filter(Boolean);

  const applyPreset = (key: keyof typeof WHEEL_THEMES) => {
    setItemsText(WHEEL_THEMES[key].join('\n'));
    SoundEffects.playTing();
    showToast(`🎡 Đã tải danh sách chủ đề: ${key}!`);
  };

  const shuffleItems = () => {
    const arr = [...items];
    arr.sort(() => Math.random() - 0.5);
    setItemsText(arr.join('\n'));
    SoundEffects.playTing();
  };

  const sortItems = (asc: boolean) => {
    const arr = [...items];
    if (asc) arr.sort((a,b) => a.localeCompare(b));
    else arr.sort((a,b) => b.localeCompare(a));
    setItemsText(arr.join('\n'));
    SoundEffects.playTing();
  };

  const handleSpin = () => {
    if (items.length < 2) {
      showToast("⚠️ Vui lòng nhập tối thiểu 2 mục để vẽ vòng quay!");
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setWinningItem(null);
    SoundEffects.playTing();

    // Set rotation Target
    const extraRot = 1440 + Math.random() * 360;
    const nextRot = rotation + extraRot;
    setRotation(nextRot);

    setTimeout(() => {
      setIsSpinning(false);
      SoundEffects.playKeng();

      // Math calculates winner
      const remainder = nextRot % 360;
      const pointerAngle = (360 + 270 - remainder) % 360;
      const segmentSize = 360 / items.length;
      const targetIndex = Math.floor(pointerAngle / segmentSize);
      const winner = items[targetIndex % items.length];
      setWinningItem(winner);
      showToast(`🏆 Chúc mừng người trúng cử: ${winner}!`);
    }, 4000);
  };

  // Generate nice SVG segment colors
  const segmentColors = ["#ef4444","#f97316","#f59e0b","#10b981","#3b82f6","#6366f1","#8b5cf6","#ec4899"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-800 items-start">
      
      {/* Visual Canvas Wheel Area */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 space-y-6 bg-slate-50 rounded-[28px] border border-slate-205">
        <div className="relative w-64 h-64 border-8 border-slate-800 rounded-full flex items-center justify-center bg-white shadow-xl">
          
          {/* Svg rendering circle slices */}
          <motion.div 
            className="w-full h-full"
            style={{ transformOrigin: 'center center' }}
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: "easeOut" }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-hidden rounded-full">
              {items.map((it, idx) => {
                const total = items.length;
                const angle = 360 / total;
                const startAngle = idx * angle;
                const endAngle = startAngle + angle;

                // SVG coordinates conversion helper
                const rad = Math.PI / 180;
                const x1 = 100 + 100 * Math.cos(startAngle * rad);
                const y1 = 100 + 100 * Math.sin(startAngle * rad);
                const x2 = 100 + 100 * Math.cos(endAngle * rad);
                const y2 = 100 + 100 * Math.sin(endAngle * rad);

                const d = total === 1 ? "M 100 100 m -100 0 a 100 100 0 1 0 200 0 a 100 100 0 1 0 -200 0" : `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;
                const textAngle = startAngle + angle / 2;
                const tx = 100 + 60 * Math.cos(textAngle * rad);
                const ty = 100 + 60 * Math.sin(textAngle * rad);

                const sliceColor = segmentColors[idx % segmentColors.length];

                return (
                  <g key={idx}>
                    <path d={d} fill={sliceColor} stroke="#ffffff" strokeWidth="1" />
                    <text 
                      x={tx} 
                      y={ty} 
                      fill="#ffffff" 
                      fontSize="7" 
                      fontWeight="black"
                      textAnchor="middle"
                      transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                    >
                      {it.substring(0, 10)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Central Spin Blue Button indicator */}
          <button 
            type="button"
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-20 w-16 h-16 rounded-full bg-blue-600 border-4 border-white text-white font-black text-[12px] shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            QUAY
          </button>

          {/* Top Indicator Triangle Arrow */}
          <div className="absolute top-[-10px] left-[50%] -translate-x-[50%] z-20 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-red-600"></div>
        </div>

        {/* Dynamic score label */}
        {winningItem && (
          <div className="bg-amber-100 p-3.5 rounded-2xl border border-amber-300 text-center animate-bounce">
            <span className="text-[10px] font-bold text-amber-700 block uppercase">KẾT QUẢ QUAY THƯỞNG:</span>
            <span className="text-sm font-black text-slate-900">{winningItem} 🏆✨</span>
          </div>
        )}

        <div className="flex justify-between items-center w-full grow text-[10.5px] font-bold text-slate-550 pt-2 border-t">
          <span>Hệ quản trị quay 1.0</span>
          <span>VN 🇻🇳 | EN 🇬🇧</span>
        </div>
      </div>

      {/* Editor Content sidebar (Right) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl border space-y-3 font-semibold text-slate-700">
          <div className="flex items-center justify-between">
            <label className="text-[11.5px] uppercase text-slate-900 font-extrabold flex items-center gap-1.5">
              📝 DANH SÁCH MỤC QUAY ({items.length})
            </label>
            <div className="flex gap-1">
              <button onClick={shuffleItems} className="px-2 py-0.5 bg-white border text-[10px] rounded hover:bg-slate-100 italic">Trộn</button>
              <button onClick={() => sortItems(true)} className="px-2 py-0.5 bg-white border text-[10px] rounded hover:bg-slate-100 font-mono">A-Z</button>
            </div>
          </div>

          <textarea 
            value={itemsText || ''} 
            onChange={(e) => setItemsText(e.target.value)} 
            rows={5} 
            placeholder="Nhập danh sách học sinh, mỗi người một dòng"
            className="w-full text-xs font-semibold p-3 text-slate-800 bg-white border border-slate-205 rounded-xl outline-none focus:ring-1 focus:ring-blue-600" 
          />
        </div>

        {/* Theme presets selection panel */}
        <div className="bg-white p-4 rounded-2xl border space-y-3">
          <h5 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest">
            Chọn chủ đề mẫu có sẵn:
          </h5>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => applyPreset('names')} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg transition">Tên học sinh 🧑‍🎓</button>
            <button onClick={() => applyPreset('rewards')} className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg transition">Phần thưởng 🎁</button>
            <button onClick={() => applyPreset('lunch')} className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg transition">Món ăn trưa 🍜</button>
            <button onClick={() => applyPreset('dating')} className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-black rounded-lg transition">Rủ rê bạn bè ☕</button>
            <button onClick={() => applyPreset('dignity')} className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-black rounded-lg transition">Nhân phẩm 👑</button>
            <button onClick={() => applyPreset('letters')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black rounded-lg transition">Chữ cái A-Z 🔠</button>
          </div>

          <button 
            type="button"
            onClick={() => {
              SoundEffects.playKeng();
              const itemsList = items.length > 0 ? items : ["Học sinh A", "Học sinh B", "Học sinh C"];
              const serializedItems = JSON.stringify(itemsList);
              const wheelStandalone = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Vòng Quay May Mắn Offline - Trạm Học Tập</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Times New Roman', Times, serif; }
  </style>
</head>
<body class="bg-gradient-to-br from-indigo-900 to-indigo-950 min-h-screen text-slate-800 flex flex-col items-center justify-center p-4">
  <div class="bg-white p-8 rounded-[36px] shadow-2xl max-w-2xl w-full text-center space-y-6 border-4 border-indigo-400">
    <div class="space-y-1">
      <h1 class="text-2xl font-black text-indigo-900 uppercase tracking-widest">🎡 VÒNG QUAY MAY MẮN OFFLINE</h1>
      <p class="text-xs text-slate-500">Ứng dụng offline hỗ trợ dạy học & lựa chọn học viên ngẫu nhiên</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <!-- Wheel Column -->
      <div class="flex flex-col items-center justify-center relative">
        <div class="relative w-64 h-64 border-8 border-slate-800 rounded-full flex items-center justify-center bg-white shadow-xl overflow-hidden">
          <canvas id="wheel-canvas" width="256" height="256" class="w-full h-full transition-transform duration-[4000ms] ease-out"></canvas>
          <button id="spin-btn" class="absolute z-35 w-14 h-14 rounded-full bg-blue-600 border-4 border-white text-white font-black text-xs shadow-lg hover:bg-blue-750 transition flex items-center justify-center cursor-pointer">QUAY</button>
          <!-- Pointer -->
          <div class="absolute top-[-4px] left-[50%] -translate-x-[50%] z-30 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-red-600"></div>
        </div>
        <div id="result-box" class="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl hidden font-black text-sm animate-bounce">
          🏆 Người trúng: <span id="winner-name"></span>
        </div>
      </div>

      <!-- Settings Column -->
      <div class="space-y-3 text-left">
        <label class="block text-xs font-black text-slate-400 uppercase tracking-wider">Danh sách học sinh (Mỗi dòng 1 tên):</label>
        <textarea id="items-textarea" rows="8" class="w-full p-3 font-semibold text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50">${itemsText}</textarea>
        <button id="update-btn" class="w-full py-2 bg-indigo-650 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition cursor-pointer">CẬP NHẬT DANH SÁCH</button>
      </div>
    </div>
  </div>

  <script>
    let items = ${serializedItems};
    const colors = ["#ef4444","#f97316","#f59e0b","#10b981","#3b82f6","#6366f1","#8b5cf6","#ec4899"];
    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    let currentRotation = 0;
    let isSpinning = false;

    function drawWheel() {
      const numSegments = items.length;
      const angle = 2 * Math.PI / numSegments;
      ctx.clearRect(0, 0, 256, 256);
      
      for (let i = 0; i < numSegments; i++) {
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.arc(128, 128, 128, i * angle, (i + 1) * angle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(128, 128);
        ctx.rotate(i * angle + angle / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(items[i].substring(0, 10), 115, 4);
        ctx.restore();
      }
    }

    document.getElementById('update-btn').onclick = function() {
      const text = document.getElementById('items-textarea').value;
      items = text.split('\\n').map(s => s.trim()).filter(Boolean);
      if (items.length < 2) {
        alert("Vui lòng có ít nhất 2 mục!");
        items = ["A", "B"];
      }
      drawWheel();
    };

    document.getElementById('spin-btn').onclick = function() {
      if (isSpinning) return;
      isSpinning = true;
      document.getElementById('result-box').classList.add('hidden');

      const extraRot = 1440 + Math.random() * 360;
      currentRotation += extraRot;
      
      canvas.style.transform = \`rotate(\${currentRotation}deg)\`;

      setTimeout(() => {
        isSpinning = false;
        const remainder = currentRotation % 360;
        const pointerAngle = (360 + 270 - remainder) % 360;
        const segmentSize = 360 / items.length;
        const winnerIndex = Math.floor(pointerAngle / segmentSize) % items.length;
        
        document.getElementById('winner-name').innerText = items[winnerIndex];
        document.getElementById('result-box').classList.remove('hidden');
      }, 4000);
    };

    drawWheel();
  </script>
</body>
</html>`;
              const blob = new Blob([wheelStandalone], { type: 'text/html;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = "vong_quay_may_man_offline.html";
              link.click();
              showToast("🎡 Đã xuất file Vòng quay Luckydraw offline!");
            }}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            📥 Xuất HTML Offline Vòng quay 🎡
          </button>
        </div>
      </div>

    </div>
  );
}

/* ========================================================================= */
/* 6. DICE ROLLER (ĐỖ XÚC XẮC)                                               */
/* ========================================================================= */
function DiceRoller({ showToast }: UtilProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [results, setResults] = useState<number[]>([4]);

  const handleRoll = () => {
    setIsRolling(true);
    SoundEffects.playTing();
    let ticks = 0;
    const interval = setInterval(() => {
      const tempRes: number[] = [];
      for(let i=0; i<diceCount; i++){
        tempRes.push(Math.floor(Math.random() * 6) + 1);
      }
      setResults(tempRes);
      ticks++;

      if (ticks >= 8) {
        clearInterval(interval);
        setIsRolling(false);
        SoundEffects.playKeng();
        showToast(`🎲 Tổng điểm xúc xắc nhận được: ${tempRes.reduce((s,v)=>s+v,0)}!`);
      }
    }, 100);
  };

  // Render dice face dots inside a modern 2.5D square container
  const renderDiceFace = (val: number, idx: number) => {
    const dotsMap: { [key: number]: number[] } = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    return (
      <div 
        key={idx} 
        className={`w-20 h-20 bg-gradient-to-br from-rose-500 to-red-650 text-white rounded-2xl relative shadow-md flex items-center justify-center border-b-4 border-red-900 transition-all ${isRolling ? 'animate-bounce' : ''}`}
      >
        <div className="grid grid-cols-3 gap-2 w-14 h-14 items-center justify-items-center">
          {Array.from({ length: 9 }).map((_, dotIdx) => {
            const hasDot = dotsMap[val]?.includes(dotIdx);
            return (
              <div 
                key={dotIdx} 
                className={`w-3 h-3 rounded-full ${hasDot ? 'bg-white shadow-xs' : 'bg-transparent'}`}
                style={{ opacity: hasDot ? 1 : 0 }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 text-center text-slate-800">
      <div className="space-y-1">
        <h4 className="text-[13px] font-black text-rose-600 uppercase tracking-widest">ĐỔ XÚC XẮC THUẦN CHẤT 🎲</h4>
        <p className="text-[10px] text-slate-500">Mô phỏng đổ súc sắc trọn vẹn âm thanh, chọn số quân xúc xắc</p>
      </div>

      {/* Select dice numbers dropdown */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border p-3 rounded-xl max-w-xs mx-auto">
        <span>Chọn số xúc xắc:</span>
        <select 
          value={diceCount ?? 1} 
          onChange={e => setDiceCount(Number(e.target.value))}
          className="bg-white border rounded p-1 font-mono font-extrabold focus:outline-none"
        >
          <option value={1}>🎲 x 1 xúc xắc</option>
          <option value={2}>🎲 x 2 xúc xắc</option>
          <option value={3}>🎲 x 3 xúc xắc</option>
          <option value={4}>🎲 x 4 xúc xắc</option>
        </select>
      </div>

      {/* Dice renders container */}
      <div className="bg-slate-100 p-8 rounded-3xl border flex items-center justify-center gap-4 min-h-[140px] shadow-inner">
        {results.map((val, idx) => renderDiceFace(val, idx))}
      </div>

      {/* Trigger Button */}
      <div className="space-y-4">
        <button 
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg border-b-4 border-blue-900 active:border-b-0 cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          Đổ xúc xắc 🔄
        </button>

        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-red-650 text-white font-black text-sm rounded-full flex items-center justify-center">
            {results.reduce((s, v) => s + v, 0)}
          </div>
          <span className="text-xs font-black text-slate-550 uppercase tracking-wider">Tổng điểm đổ</span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 7. QR CODE GENERATOR                                                      */
/* ========================================================================= */
function QrGenerator({ showToast }: UtilProps) {
  const [qrType, setQrType] = useState<'text' | 'website' | 'wifi' | 'email' | 'phone' | 'event'>('website');
  const [inputValue, setInputValue] = useState('https://aistudio.google.com');
  const [wifiSSID, setWifiSSID] = useState('LopTieuHocVuiVe');
  const [wifiPassword, setWifiPassword] = useState('12345678');
  const [wifiEncr, setWifiEncr] = useState('WPA');
  
  // Custom states for newly added QR types
  const [emailAddress, setEmailAddress] = useState('viethung.teacher@gmail.com');
  const [emailSubject, setEmailSubject] = useState('Học tập lớp 4A');
  const [emailBody, setEmailBody] = useState('Chào thầy, em gửi bài tập về nhà của tuần này.');
  const [phoneNumber, setPhoneNumber] = useState('0912345678');
  const [eventTitle, setEventTitle] = useState('Hội Thao Học Đường');
  const [eventLocation, setEventLocation] = useState('Khu thể chất đa năng');
  const [eventStart, setEventStart] = useState('2026-06-30T08:00');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final enc string depending on type
  useEffect(() => {
    let textToEncode = inputValue;
    if (qrType === 'wifi') {
      textToEncode = `WIFI:S:${wifiSSID};T:${wifiEncr};P:${wifiPassword};;`;
    } else if (qrType === 'email') {
      textToEncode = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    } else if (qrType === 'phone') {
      textToEncode = `tel:${phoneNumber}`;
    } else if (qrType === 'event') {
      const startClean = eventStart ? eventStart.replace(/[-:]/g, "").replace("T", "T") : "20260630T080000";
      textToEncode = `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${startClean}00\nLOCATION:${eventLocation}\nEND:VEVENT`;
    }

    if (canvasRef.current && textToEncode.trim().length > 0) {
      QRCode.toCanvas(canvasRef.current, textToEncode, {
        width: 220,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [qrType, inputValue, wifiSSID, wifiPassword, wifiEncr, emailAddress, emailSubject, emailBody, phoneNumber, eventTitle, eventLocation, eventStart]);

  const handleDownloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `Ma_QR_${qrType}_Lop_Hoc.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      SoundEffects.playTing();
      showToast("💾 Đã tải xuống tệp ảnh mã QR thành công!");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left text-slate-850">
      
      {/* Left Column for Live Canvas Preview */}
      <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-slate-50 border rounded-2xl gap-4">
        <canvas ref={canvasRef} className="bg-white border rounded-lg p-2 shadow-sm shrink-0 w-[220px] h-[220px]" />
        
        <button 
          onClick={handleDownloadQR}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase rounded-xl shadow cursor-pointer text-center"
        >
          ⬇️ TẢI ẢNH MÃ QR VỀ MÁY
        </button>
      </div>

      {/* Right Column for Settings Form */}
      <div className="md:col-span-8 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800">🔍 CÔNG CỤ TẠO MÃ QR</h4>
          <p className="text-[10px] text-slate-500">Mã hóa liên kết bài học trực tuyến, Wifi lớp học, thông tin liên lạc hoặc sự kiện trường học chỉ trong nháy mắt.</p>
        </div>

        {/* Tab Selection pills styled with bright blue and white text for high contrast */}
        <div className="grid grid-cols-3 sm:grid-cols-6 bg-slate-100 p-1 rounded-xl border border-slate-205 gap-1 shadow-2xs">
          <button 
            type="button"
            onClick={() => { setQrType('website'); setInputValue('https://'); SoundEffects.playTing(); }}
            className={`py-1.5 text-[9.5px] font-black rounded-lg uppercase transition-all cursor-pointer text-center ${qrType === 'website' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200/50'}`}
          >
            Web
          </button>
          <button 
            type="button"
            onClick={() => { setQrType('text'); setInputValue('Thông báo lớp học'); SoundEffects.playTing(); }}
            className={`py-1.5 text-[9.5px] font-black rounded-lg uppercase transition-all cursor-pointer text-center ${qrType === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200/50'}`}
          >
            Chữ
          </button>
          <button 
            type="button"
            onClick={() => { setQrType('wifi'); SoundEffects.playTing(); }}
            className={`py-1.5 text-[9.5px] font-black rounded-lg uppercase transition-all cursor-pointer text-center ${qrType === 'wifi' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200/50'}`}
          >
            Wifi
          </button>
          <button 
            type="button"
            onClick={() => { setQrType('email'); SoundEffects.playTing(); }}
            className={`py-1.5 text-[9.5px] font-black rounded-lg uppercase transition-all cursor-pointer text-center ${qrType === 'email' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200/50'}`}
          >
            Email
          </button>
          <button 
            type="button"
            onClick={() => { setQrType('phone'); SoundEffects.playTing(); }}
            className={`py-1.5 text-[9.5px] font-black rounded-lg uppercase transition-all cursor-pointer text-center ${qrType === 'phone' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200/50'}`}
          >
            SĐT
          </button>
          <button 
            type="button"
            onClick={() => { setQrType('event'); SoundEffects.playTing(); }}
            className={`py-1.5 text-[9.5px] font-black rounded-lg uppercase transition-all cursor-pointer text-center ${qrType === 'event' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200/50'}`}
          >
            Sự kiện
          </button>
        </div>

        {/* Dynamic form block based on type selection */}
        {qrType === 'wifi' && (
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Tên mạng Wifi (SSID)</label>
              <input type="text" value={wifiSSID || ''} onChange={e => setWifiSSID(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Mật khẩu</label>
              <input type="password" value={wifiPassword || ''} onChange={e => setWifiPassword(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Mã hóa bảo mật</label>
              <select value={wifiEncr || 'WPA'} onChange={e => setWifiEncr(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Không mật khẩu</option>
              </select>
            </div>
          </div>
        )}

        {qrType === 'email' && (
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Địa chỉ Email người nhận</label>
              <input type="email" value={emailAddress || ''} onChange={e => setEmailAddress(e.target.value)} placeholder="teacher@school.edu.vn" className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Tiêu đề Email</label>
              <input type="text" value={emailSubject || ''} onChange={e => setEmailSubject(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Nội dung thư mẫu</label>
              <textarea value={emailBody || ''} onChange={e => setEmailBody(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 h-16 resize-none" />
            </div>
          </div>
        )}

        {qrType === 'phone' && (
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Số điện thoại liên lạc</label>
              <input type="text" value={phoneNumber || ''} onChange={e => setPhoneNumber(e.target.value)} placeholder="09xxxxxxxx" className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
          </div>
        )}

        {qrType === 'event' && (
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Tên sự kiện / Lịch thao giảng</label>
              <input type="text" value={eventTitle || ''} onChange={e => setEventTitle(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Địa điểm tổ chức</label>
              <input type="text" value={eventLocation || ''} onChange={e => setEventLocation(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-550 block uppercase">Thời gian bắt đầu</label>
              <input type="datetime-local" value={eventStart || ''} onChange={e => setEventStart(e.target.value)} className="w-full p-2 text-xs font-semibold bg-white border rounded-lg focus:outline-none" />
            </div>
          </div>
        )}

        {(qrType === 'website' || qrType === 'text') && (
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-550 block uppercase">
              {qrType === 'website' ? 'Địa chỉ Website phục vụ học liệu (URL)' : 'Nội dung thông tin văn bản'}
            </label>
            <input 
              type="text" 
              value={inputValue || ''} 
              onChange={e => setInputValue(e.target.value)} 
              placeholder={qrType === 'website' ? 'https://example.com' : 'Nhập tin nhắn...'}
              className="w-full p-2.5 text-xs font-semibold bg-slate-50 border border-slate-205 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600" 
            />
          </div>
        )}
      </div>

    </div>
  );
}

/* ========================================================================= */
/* 8. COMBINED AVATAR CREATOR (TẠO AVATAR VIỀN MÀU & TICK XANH)              */
/* ========================================================================= */
const PRESET_GRADIENTS = [
  { name: "Cầu vồng Instagram", styles: ["#f9ce34", "#ee2a7b", "#6228d7"] },
  { name: "Sunset Hoàng hôn", styles: ["#ff9966", "#ff5e62"] },
  { name: "Vàng Hoàng Gia Gold", styles: ["#bf953f", "#fcf6ba", "#b38728", "#fbf5b7"] },
  { name: "Sóng Biển Oceanic", styles: ["#4568dc", "#b06ab3"] },
  { name: "Băng Đăng Neon Blue", styles: ["#00f2fe", "#4facfe"] },
  { name: "Nhiệt Đới Tropical", styles: ["#12c2e9", "#c471ed", "#f64f59"] },
];

function CombinedAvatarCreator({ showToast }: UtilProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [badgeType, setBadgeType] = useState<'none' | 'blue_tick' | 'shield' | 'red_tick' | 'vn_star'>('blue_tick');
  const [borderType, setBorderType] = useState<'none' | number>('none');
  const [borderThickness, setBorderThickness] = useState<number>(20);
  const [isCircleCrop, setIsCircleCrop] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawUnifiedAvatar = () => {
    if (!profileImage || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const W = 512;
      const H = 512;
      ctx.clearRect(0, 0, W, H);

      // Save global canvas context
      ctx.save();

      // Mask circle/square crop
      if (isCircleCrop) {
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W / 2 - 2, 0, Math.PI * 2);
        ctx.clip();
      }

      // Draw Gradient Border if active
      if (borderType !== 'none') {
        const gradObj = PRESET_GRADIENTS[Number(borderType)];
        const grad = ctx.createLinearGradient(0, 0, W, H);
        gradObj.styles.forEach((color, idx) => {
          grad.addColorStop(idx / (gradObj.styles.length - 1), color);
        });

        // Fill entire backdrop area with gradient
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner mask for the actual photo
        ctx.save();
        ctx.beginPath();
        const innerRadius = Math.max(10, W / 2 - borderThickness);
        ctx.arc(W / 2, H / 2, innerRadius, 0, Math.PI * 2);
        ctx.clip();
      }

      // Draw uploaded profile photo
      ctx.drawImage(img, 0, 0, W, H);

      // Restore outer ring clip if border was drawn
      if (borderType !== 'none') {
        ctx.restore();
      }

      // Draw default sleek circle outline if NO border was selected
      if (isCircleCrop && borderType === 'none') {
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W / 2 - 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W / 2 - 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      ctx.restore(); // Restore global canvas context

      // Overlay selected badge graphics
      if (badgeType !== 'none') {
        ctx.save();
        
        // Position badge on bottom-right area
        const badgeX = 392;
        const badgeY = 392;
        const badgeRadius = 48;

        // White base backdrop for contrast
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        if (badgeType === 'blue_tick') {
          // Twitter Blue Tick Badge
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#1d9bf0';
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(badgeX - 14, badgeY - 2);
          ctx.lineTo(badgeX - 3, badgeY + 10);
          ctx.lineTo(badgeX + 16, badgeY - 12);
          ctx.stroke();
        } else if (badgeType === 'shield') {
          // Green Shield Verified Badge
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(badgeX, badgeY - 18);
          ctx.lineTo(badgeX + 14, badgeY - 9);
          ctx.lineTo(badgeX + 14, badgeY + 9);
          ctx.quadraticCurveTo(badgeX, badgeY + 22, badgeX, badgeY + 22);
          ctx.quadraticCurveTo(badgeX - 14, badgeY + 9, badgeX - 14, badgeY + 9);
          ctx.lineTo(badgeX - 14, badgeY - 9);
          ctx.closePath();
          ctx.fill();
        } else if (badgeType === 'red_tick') {
          // Intense Red Verified Badge
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(badgeX - 12, badgeY - 2);
          ctx.lineTo(badgeX - 3, badgeY + 8);
          ctx.lineTo(badgeX + 14, badgeY - 12);
          ctx.stroke();
        } else if (badgeType === 'vn_star') {
          // Vietnam National Star Banner Badge
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#da251d';
          ctx.fill();

          // Gold Star geometry draw
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          const outerR = 20;
          const innerR = 8;
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(
              badgeX + outerR * Math.cos((18 + i * 72) * Math.PI / 180 - Math.PI / 2),
              badgeY + outerR * Math.sin((18 + i * 72) * Math.PI / 180 - Math.PI / 2)
            );
            ctx.lineTo(
              badgeX + innerR * Math.cos((54 + i * 72) * Math.PI / 180 - Math.PI / 2),
              badgeY + innerR * Math.sin((54 + i * 72) * Math.PI / 180 - Math.PI / 2)
            );
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }
    };
    img.src = profileImage;
  };

  useEffect(() => {
    if (profileImage) {
      drawUnifiedAvatar();
    }
  }, [profileImage, badgeType, borderType, borderThickness, isCircleCrop]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        SoundEffects.playTing();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `Avatar_Premium_Sieu_Chat.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
      SoundEffects.playKeng();
      showToast("📸 Tải thành công Avatar Viền màu & Tick xanh của em!");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left text-slate-800">
      {/* Col 1: Preview Window Grid */}
      <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-slate-50 border rounded-3xl gap-4">
        {profileImage ? (
          <canvas 
            ref={canvasRef} 
            width={512} 
            height={512} 
            className="w-[240px] h-[240px] border rounded-full bg-slate-200 shadow-lg" 
          />
        ) : (
          <div className="w-[240px] h-[240px] border-4 border-dashed border-slate-350 rounded-full flex flex-col items-center justify-center text-center p-4 text-slate-400 bg-white">
            <span className="text-4xl animate-bounce">🎨</span>
            <p className="text-[11px] font-black uppercase mt-3">Chưa chọn ảnh</p>
            <p className="text-[9px] text-slate-400 max-w-[180px] mt-1">Vui lòng tải ảnh đại diện lên để thiết lập viền màu và huy hiệu!</p>
          </div>
        )}

        <button 
          onClick={handleDownload}
          disabled={!profileImage}
          className={`w-full py-3 rounded-2xl font-black text-xs text-white uppercase text-center shadow-md transition ${
            profileImage 
              ? 'bg-[#2563eb] hover:bg-blue-700 hover:shadow-lg cursor-pointer transform active:scale-95' 
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          TẢI AVATAR PHIÊN BẢN CHÍNH THỨC ⬇️
        </button>
      </div>

      {/* Col 2: Interactive Controls Suite */}
      <div className="md:col-span-7 space-y-5">
        <div className="space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-300/30">
          <h4 className="text-sm font-black text-slate-800 font-sans flex items-center gap-1.5">
            🌟 KHUNG VIỀN ĐA SẮC & HUY HIỆU XÁC MINH LỚP HỌC
          </h4>
          <p className="text-[10px] text-slate-500 leading-normal">
            Công cụ gộp 2-trong-1 siêu cấp: Tự do khoác lên Avatar của em chiếc viền màu Gradient hiện đại, lôi cuốn kết hợp chèn dấu tích xanh bản quyền cực xịn.
          </p>
        </div>

        {/* Action Button: File selector */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <label className="text-[10.5px] uppercase tracking-wide text-indigo-805 font-black block">
            Bước 1: Tải ảnh đại diện của em lên:
          </label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] rounded-xl border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              📂 Tải Ảnh Từ Thiết Bị (Zalo/FB...)
            </button>
            {profileImage && (
              <button 
                type="button"
                onClick={() => { setProfileImage(null); SoundEffects.playTing(); }}
                className="px-3 py-2 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200"
              >
                Xóa ảnh
              </button>
            )}
          </div>
        </div>

        {/* Select Border Color preset */}
        <div className="space-y-2.5">
          <label className="text-[10.5px] uppercase tracking-wide text-gray-400 block font-black">
            Bước 2: Chọn phong cách khung viền màu:
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            <button 
              onClick={() => { setBorderType('none'); SoundEffects.playTing(); }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                borderType === 'none' 
                  ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-150 font-black' 
                  : 'bg-white hover:border-slate-300'
              }`}
            >
              <div className="font-extrabold text-slate-800">❌ Không viền màu</div>
              <div className="text-[9px] text-slate-400 mt-1">Để ảnh trơn hoặc mộc mạc</div>
            </button>

            {PRESET_GRADIENTS.map((item, idx) => (
              <button 
                key={item.name}
                onClick={() => { setBorderType(idx); SoundEffects.playTing(); }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  borderType === idx 
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-150 font-black' 
                    : 'bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-slate-800 truncate">{item.name}</div>
                {/* Visual preview dot colors */}
                <div className="flex gap-1 mt-1.5">
                  {item.styles.slice(0, 3).map((col) => (
                    <div key={col} className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: col }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thickness slider slider */}
        {borderType !== 'none' && (
          <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-1.5">
            <div className="flex justify-between items-center text-[10.5px] uppercase tracking-wide font-black text-slate-650">
              <span>Độ dày viền màu:</span>
              <span className="text-blue-700 font-extrabold">{borderThickness}px</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="40" 
              value={borderThickness ?? 16} 
              onChange={(e) => setBorderThickness(Number(e.target.value))}
              className="w-full cursor-pointer accent-blue-600" 
            />
          </div>
        )}

        {/* Choose Badge overlay */}
        <div className="space-y-2.5">
          <label className="text-[10.5px] uppercase tracking-wide text-gray-400 block font-black">
            Bước 3: Chọn dấu xác minh (Huy hiệu góc dưới):
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {[
              { id: 'none', name: '🚫 Không gắn tick', desc: 'Không chèn huy hiệu' },
              { id: 'blue_tick', name: '✔️ Tick xanh Twitter', desc: 'Màu xanh dương uy tín' },
              { id: 'shield', name: '🛡️ Bảo vệ xanh lá', desc: 'Bảo mật khiên kiên cố' },
              { id: 'red_tick', name: '🔴 Tick đỏ rực rỡ', desc: 'Huy hiệu mốc đặc biệt' },
              { id: 'vn_star', name: '⭐ Cờ đỏ Sao vàng', desc: 'Niềm tự hào học sinh VN' }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => { setBadgeType(item.id as any); SoundEffects.playTing(); }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  badgeType === item.id 
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-150 font-black' 
                    : 'bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-extrabold text-slate-800">{item.name}</div>
                <div className="text-[9px] text-slate-450 italic mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Options Bo viền tròn */}
        <div className="flex flex-col gap-1.5 border-t pt-3.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isCircleCrop} 
              onChange={(e) => setIsCircleCrop(e.target.checked)}
              className="accent-blue-600 cursor-pointer h-4 w-4" 
            />
            <span className="text-[11.5px] font-bold text-slate-705">Tự động Bo tròn Avatar góc lưu (Khuyên dùng cho Facebook/Zalo)</span>
          </label>
          <p className="text-[10px] text-slate-405 leading-normal">
            💡 Lưu ý nhỏ: Toàn bộ quá trình tạo, phối màu viền và lồng ghép tick dấu đều được xử lý 100% cục bộ ở trên điện thoại/máy tính của em, đảm bảo độ bảo mật tối đa cho hình ảnh cá nhân!
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 10. NUMBER TO TEXT (ĐỔI CHỮ SỐ THÀNH CHỮ)                                 */
/* ========================================================================= */
function NumberToText({ showToast }: UtilProps) {
  const [amount, setAmount] = useState<number>(200000);
  const [styleType, setStyleType] = useState<'capitalize' | 'lowercase' | 'uppercase'>('capitalize');

  const convertViNumber = (num: number): string => {
    const dv = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const block = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

    if (num === 0) return "không đồng";

    let s = "";
    let temp = Math.abs(num);

    const readThreeDigits = (n: number, showZero: boolean): string => {
      let hundred = Math.floor(n / 100);
      let ten = Math.floor((n % 100) / 10);
      let single = n % 10;
      let out = "";

      if (hundred > 0 || showZero) {
        out += dv[hundred] + " trăm ";
      }

      if (ten === 0) {
        if (single > 0 && (hundred > 0 || showZero)) {
          out += "lẻ " + dv[single];
        }
      } else if (ten === 1) {
        out += "mười ";
        if (single === 5) out += "lăm";
        else if (single > 0) out += dv[single];
      } else {
        out += dv[ten] + " mươi ";
        if (single === 1) out += "mốt";
        else if (single === 5) out += "lăm";
        else if (single > 0) out += dv[single];
      }
      return out.trim();
    };

    let idx = 0;
    while (temp > 0) {
      let res = temp % 1000;
      if (res > 0) {
        let blockStr = readThreeDigits(res, temp >= 1000);
        s = blockStr + " " + block[idx] + " " + s;
      }
      temp = Math.floor(temp / 1000);
      idx++;
    }

    return s.trim() + " đồng";
  };

  const getTranslatedText = (): string => {
    let out = convertViNumber(amount);

    if (styleType === 'uppercase') return out.toUpperCase();
    if (styleType === 'lowercase') return out.toLowerCase();
    
    // Capitalize first character
    return out.charAt(0).toUpperCase() + out.slice(1);
  };

  const textVal = getTranslatedText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textVal);
    SoundEffects.playKeng();
    showToast("📋 Đã sao chép nội dung chữ vào khay nhớ tạm!");
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 text-slate-850 text-left">
      <div className="space-y-1 text-center">
        <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">ĐỔI SỐ THÀNH CHỮ 🗣️</h4>
        <p className="text-[10px] text-slate-500">Giúp thầy cô chuyển nhanh từ số học phí thành chữ ghi biên nhận hoặc kế toán.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 font-sans font-bold text-xs text-slate-700">
          <span>Nhập số tiền chuyển đổi:</span>
          <input 
            type="number" 
            value={amount ?? 0} 
            onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))} 
            className="w-full text-xs font-mono font-black p-3 bg-slate-50 border rounded-xl outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white" 
          />
        </div>

        <div className="space-y-1.5 font-sans font-bold text-xs text-slate-700">
          <span>Kiểu chuyển đổi chữ:</span>
          <select 
            value={styleType || 'capitalize'} 
            onChange={e => setStyleType(e.target.value as any)}
            className="w-full text-xs font-bold p-3 bg-slate-50 border rounded-xl"
          >
            <option value="capitalize">Chữ đầu viết hoa</option>
            <option value="uppercase">VIẾT HOA TOÀN BỘ</option>
            <option value="lowercase">viết thường toàn bộ</option>
          </select>
        </div>
      </div>

      {/* Box output results */}
      <div className="bg-slate-900 border text-rose-400 p-5 rounded-2xl min-h-[100px] flex items-center justify-between shadow-inner relative gap-3">
        <div className="text-xs font-semibold leading-relaxed grow text-sky-450 text-sky-400">
          {textVal}
        </div>
        
        {/* Buttons right copy/read */}
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={handleCopy} className="p-2.5 py-1.5 bg-blue-650 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg transition cursor-pointer">
            Copy 📋
          </button>
        </div>
      </div>

    </div>
  );
}

/* ========================================================================= */
/* 11. CHILDREN BMI CALCULATOR                                               */
/* ========================================================================= */
function BmiCalculator({ showToast }: UtilProps) {
  const [age, setAge] = useState<number>(9);
  const [height, setHeight] = useState<number>(126);
  const [weight, setWeight] = useState<number>(45);

  const calculatedBMI = height > 0 ? (weight / Math.pow(height / 100, 2)) : 0;

  // Pediatric BMI Classification standard
  const getBmiClassification = (bmi: number): { text: string; col: string; offset: number } => {
    if (bmi < 15.5) return { text: "Suy dinh dưỡng gầy còm", col: "text-blue-500", offset: 15 };
    if (bmi >= 15.5 && bmi < 18.5) return { text: "Thiếu cân / Tạng gầy nhẹ", col: "text-sky-500", offset: 35 };
    if (bmi >= 18.5 && bmi < 24.0) return { text: "Thể trạng cân đối khỏe mạnh", col: "text-green-600", offset: 55 };
    if (bmi >= 24.0 && bmi < 28.0) return { text: "Thừa cân / Nguy cơ béo phì", col: "text-yellow-600", offset: 75 };
    return { text: "Béo phì / Cần kiểm soát ăn uống", col: "text-red-650", offset: 95 };
  };

  const bmiMeta = getBmiClassification(calculatedBMI);

  return (
    <div className="max-w-xl mx-auto space-y-6 text-slate-800 text-center">
      <div className="space-y-1">
        <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest">BẢNG TÍNH CHỈ SỐ BMI TRẺ EM 📊</h4>
        <p className="text-[10px] text-slate-500">Bám chỉ số sinh học WHO định vị tình trạng béo phì gầy còm học đường của trẻ em 2-20 tuổi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Needle Gauge Display Dial */}
        <div className="bg-slate-50 border p-5 rounded-[24px] flex flex-col items-center justify-center gap-3">
          <div className="relative w-40 h-24 overflow-hidden flex items-end justify-center">
            {/* Semantic background meter semi circle */}
            <div className="absolute top-0 bottom-0 left-0 right-0 rounded-t-full border-[18px] border-b-0 border-slate-300"></div>
            {/* Color zones */}
            <div className="absolute top-0 bottom-0 left-0 right-0 rounded-t-full border-[18px] border-b-0 border-transparent" style={{ borderImage: "linear-gradient(to right, #3b82f6 20%, #10b981 20% 60%, #eab308 60% 80%, #ef4444 80%) 1" }}></div>

            {/* Pointer Needle */}
            <div 
              className="absolute w-1 h-14 bg-slate-900 origin-bottom transition-all duration-700 rounded-full"
              style={{
                bottom: '0',
                transform: `rotate(${Math.min(90, Math.max(-90, (calculatedBMI - 20) * 8))}deg)`
              }}
            />
            {/* Inner center dot */}
            <div className="absolute bottom-[-6px] w-4.5 h-4.5 bg-slate-900 rounded-full border border-white z-10"></div>
          </div>

          <div className="space-y-1 w-full px-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Chỉ số BMI tính được:</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{calculatedBMI.toFixed(1)}</span>
            <span className="text-[11.5px] font-black block uppercase tracking-wide bg-blue-600 text-white p-3 rounded-xl whitespace-pre-line leading-relaxed shadow-sm">
              {`${age} tuổi - BMI ${calculatedBMI.toFixed(1)}\n${bmiMeta.text}`}
            </span>
          </div>
        </div>

        {/* Inputs panel */}
        <div className="space-y-4 text-left font-bold text-xs text-slate-750">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <span>Độ tuổi (2-20):</span>
              <select value={age ?? 9} onChange={e => setAge(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg">
                {Array.from({ length: 19 }).map((_, idx) => (
                  <option key={idx + 2} value={idx + 2}>{idx + 2} tuổi</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <span>Cao (cm):</span>
              <input type="number" value={height ?? 130} onChange={e => setHeight(Math.max(1, Number(e.target.value)))} className="w-full p-2 bg-slate-50 border rounded-lg font-mono" />
            </div>

            <div className="space-y-1">
              <span>Cân nặng (kg):</span>
              <input type="number" value={weight ?? 28} onChange={e => setWeight(Math.max(1, Number(e.target.value)))} className="w-full p-2 bg-slate-50 border rounded-lg font-mono" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                SoundEffects.playKeng();
                showToast(`🎯 Chỉ số thể tích trẻ: ${calculatedBMI.toFixed(1)} - ${bmiMeta.text}`);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10.5px] rounded-xl tracking-wider active:scale-95 transition cursor-pointer"
            >
              Tính BMI Trẻ em (Lướt tuổi &lt;= 20) 📊
            </button>

            <button 
              onClick={() => {
                SoundEffects.playTing();
                const bmiStandalone = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bảng tính chỉ số BMI Học đường - Trạm Học Tập</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Times New Roman', Times, serif; }
  </style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 text-slate-800">
  <div class="bg-white border-2 border-slate-200 p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6">
    <div class="space-y-1">
      <h1 class="text-xl font-black text-rose-600 uppercase tracking-widest">BẢNG TÍNH CHỈ SỐ BMI TRẺ EM 📊</h1>
      <p class="text-xs text-slate-500">Giám sát tình trạng thể chất học sinh offline bậc tiểu học và trung học</p>
    </div>

    <!-- Gauge display -->
    <div class="bg-slate-50 border p-6 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div class="relative w-40 h-24 overflow-hidden flex items-end justify-center">
        <div class="absolute inset-0 rounded-t-full border-[18px] border-b-0 border-slate-200"></div>
        <div id="needle" class="absolute w-1 h-14 bg-slate-900 origin-bottom transition-transform duration-500 rounded-full" style="bottom: 0; transform: rotate(0deg)"></div>
        <div class="absolute bottom-[-6px] w-4 h-4 bg-slate-900 rounded-full border border-white"></div>
      </div>
      <div>
        <span class="text-[10px] text-gray-400 font-extrabold uppercase block">BMI Hiện tại:</span>
        <span id="bmi-val" class="text-2xl font-black text-slate-950 block font-mono">15.0</span>
        <div id="badge" class="mt-2 text-xs font-black bg-blue-600 text-white p-2.5 rounded-xl whitespace-pre-line leading-relaxed shadow-sm">
          -
        </div>
      </div>
    </div>

    <!-- Inputs -->
    <div class="grid grid-cols-3 gap-2.5 text-xs font-bold text-left text-slate-700">
      <div>
        <label class="block mb-1">Độ tuổi:</label>
        <input type="number" id="age-input" value="9" min="2" max="20" class="w-full bg-slate-50 border rounded-lg p-2 font-mono" />
      </div>
      <div>
        <label class="block mb-1">Chiều cao (cm):</label>
        <input type="number" id="height-input" value="126" min="50" class="w-full bg-slate-50 border rounded-lg p-2 font-mono" />
      </div>
      <div>
        <label class="block mb-1">Cân nặng (kg):</label>
        <input type="number" id="weight-input" value="45" min="5" class="w-full bg-slate-50 border rounded-lg p-2 font-mono" />
      </div>
    </div>

    <button id="calc-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl shadow cursor-pointer">TÍNH TOÁN BMI OFFLINE</button>
  </div>

  <script>
    function classify(bmi) {
      if (bmi < 15.5) return "Suy dinh dưỡng gầy còm";
      if (bmi >= 15.5 && bmi < 18.5) return "Thiếu cân / Tạng gầy nhẹ";
      if (bmi >= 18.5 && bmi < 24.0) return "Thể trạng cân đối khỏe mạnh";
      if (bmi >= 24.0 && bmi < 28.0) return "Thừa cân / Nguy cơ béo phì";
      return "Béo phì / Cần kiểm soát ăn uống";
    }

    function runCalc() {
      const age = parseInt(document.getElementById('age-input').value) || 9;
      const height = parseFloat(document.getElementById('height-input').value) || 120;
      const weight = parseFloat(document.getElementById('weight-input').value) || 30;

      const bmi = weight / Math.pow(height / 100, 2);
      document.getElementById('bmi-val').innerText = bmi.toFixed(1);

      const status = classify(bmi);
      document.getElementById('badge').innerText = \`\${age} tuổi - BMI \${bmi.toFixed(1)}\\n\${status}\`;

      const angle = Math.min(90, Math.max(-90, (bmi - 20) * 8));
      document.getElementById('needle').style.transform = \`rotate(\${angle}deg)\`;
    }

    document.getElementById('calc-btn').onclick = runCalc;
    runCalc();
  </script>
</body>
</html>`;
                const blob = new Blob([bmiStandalone], { type: 'text/html;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = "bmi_suc_khoe_oly_offline.html";
                link.click();
                showToast("📉 Đã xuất file tính chỉ số BMI trẻ em!");
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] rounded-xl tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              📥 Xuất file HTML Offline 📊
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

/* ========================================================================= */
/* 12. STUDENT INTERACTIVE CALCULATOR (CÔNG CỤ TÍNH TOÁN)                    */
/* ========================================================================= */
function StudentCalculator({ showToast }: UtilProps) {
  return <InteractiveWritingCreator showToast={showToast} />;
}

/* ========================================================================= */
/* 12. INTERACTIVE WRITING WORKSHEET CREATOR (TẠO FILE TẬP VIẾT DI CHUYỂN)     */
/* ========================================================================= */

interface InteractiveTextItem {
  id: string;
  text: string;
  x: number;          // Percent coordinates (0-100)
  y: number;          // Percent coordinates (0-100)
  fontSize: number;   // Font size in pixels
  fontFamily: string; // 'HP001_4_hang_bold' | 'HP0014HB' | 'Dancing Script' | 'Times New Roman'
  inkColor: string;   // Ink color hex
  isTrace: boolean;   // If true, opacity is low for tracing exercises
}

function InteractiveWritingCreator({ showToast }: UtilProps) {
  const [items, setItems] = useState<InteractiveTextItem[]>([
    { id: '1', text: 'a b c d đ e ê', x: 8, y: 15, fontSize: 32, fontFamily: 'HP001_4_hang_bold', inkColor: '#2563eb', isTrace: false },
    { id: '2', text: 'a b c d đ e ê', x: 8, y: 28, fontSize: 32, fontFamily: 'HP001_4_hang_bold', inkColor: '#64748b', isTrace: true },
    { id: '3', text: 'luyện chữ hữu ích', x: 8, y: 44, fontSize: 36, fontFamily: 'HP0014HB', inkColor: '#2563eb', isTrace: false },
    { id: '4', text: 'luyện chữ hữu ích', x: 8, y: 57, fontSize: 36, fontFamily: 'HP0014HB', inkColor: '#64748b', isTrace: true },
    { id: '5', text: 'Chăm ngoan học giỏi', x: 8, y: 73, fontSize: 40, fontFamily: 'Dancing Script', inkColor: '#dc2626', isTrace: false },
  ]);

  const [newText, setNewText] = useState<string>('Oly Học Sinh');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Custom headers
  const [exerciseTitle, setExerciseTitle] = useState<string>('BÀI TẬP RÈN CHỮ SƯ PHẠM');
  const [schoolLabel, setSchoolLabel] = useState<string>('Trường: ..............................................................');
  const [studentInfoLabel, setStudentInfoLabel] = useState<string>('Lớp: ......................... Họ và tên: ..............................................................');
  const [gridColor, setGridColor] = useState<'cyan' | 'pink'>('cyan');

  // Drag states utilizing pointer events
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const itemStartPos = useRef({ x: 0, y: 0 });
  const paperRef = useRef<HTMLDivElement>(null);

  // Export as PDF standard page
  const handleExportPdf = async () => {
    if (!paperRef.current) return;
    try {
      showToast("⚙️ Đang chụp chiếu và biên soạn file PDF chuyên nghiệp...");
      const canvas = await safeHtml2Canvas(paperRef.current, {
        scale: 3, // Premium quality 300%+ DPI resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Giay_Tap_Viet_Hoc_Sinh.pdf`);
      SoundEffects.playKeng();
      showToast("🎉 Đã lưu bài tập viết dưới dạng file PDF chuẩn in ấn thành công!");
    } catch (err) {
      console.error(err);
      showToast("❌ Không thể tạo file PDF. Thử lại!");
    }
  };

  // Add customized text element to sheet
  const handleAddItem = () => {
    if (!newText.trim()) return;
    const newItem: InteractiveTextItem = {
      id: Date.now().toString(),
      text: newText,
      x: 15,
      y: Math.min(85, 12 + items.length * 10), // Cascade downward
      fontSize: 32,
      fontFamily: 'HP001_4_hang_bold',
      inkColor: '#2563eb',
      isTrace: false,
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
    setNewText('');
    SoundEffects.playTing();
    showToast("📝 Đã thêm khối chữ mới! Kéo thả khối chữ trên dòng kẻ o-ly để căn chỉnh.");
  };

  // Pointer Down initiate drag
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, item: InteractiveTextItem) => {
    setActiveDragId(item.id);
    setSelectedId(item.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    itemStartPos.current = { x: item.x, y: item.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  // Pointer Move calculate position relative to parent bounding sheet
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDragId || !paperRef.current) return;
    const parentRect = paperRef.current.getBoundingClientRect();
    const dxPx = e.clientX - dragStartPos.current.x;
    const dyPx = e.clientY - dragStartPos.current.y;

    // Convert pixel offset to paper sheet percentage layout
    const dxPct = (dxPx / parentRect.width) * 100;
    const dyPct = (dyPx / parentRect.height) * 100;

    setItems(prev => prev.map(item => {
      if (item.id === activeDragId) {
        // Clamp to avoid escaping sheet margins (5% to 92%)
        return {
          ...item,
          x: Math.max(2, Math.min(90, itemStartPos.current.x + dxPct)),
          y: Math.max(5, Math.min(93, itemStartPos.current.y + dyPct))
        };
      }
      return item;
    }));
  };

  // Release capture
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDragId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setActiveDragId(null);
    }
  };

  // Update selected item values
  const handleUpdateSelectedItem = <K extends keyof InteractiveTextItem>(key: K, value: InteractiveTextItem[K]) => {
    if (!selectedId) return;
    setItems(prev => prev.map(item => {
      if (item.id === selectedId) {
        return { ...item, [key]: value };
      }
      return item;
    }));
  };

  // Duplicate word component for repetitive drills
  const handleDuplicateItem = (item: InteractiveTextItem) => {
    const duplicated: InteractiveTextItem = {
      ...item,
      id: Date.now().toString() + "-clone",
      y: Math.min(92, item.y + 6), // Place right below
    };
    setItems(prev => [...prev, duplicated]);
    setSelectedId(duplicated.id);
    SoundEffects.playTing();
    showToast("📋 Nhân bản từ rèn chữ thành công!");
  };

  // Delete word component
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedId === id) setSelectedId(null);
    SoundEffects.playKeng();
    showToast("🗑️ Đã xóa khối chữ!");
  };

  // Clean whole worksheets
  const handleClearAll = () => {
    if (window.confirm("Bác có chắc chắn muốn xóa tất cả từ viết bảng để thiết kế lại?")) {
      setItems([]);
      setSelectedId(null);
      showToast("✨ Đã xóa sạch bảng!");
    }
  };

  // Export as Image/JPG standard resolution
  const handleExportPng = async () => {
    if (!paperRef.current) return;
    try {
      showToast("⚙️ Đang chụp ảnh dòng giấy rèn chữ...");
      const canvas = await safeHtml2Canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `Giay_Tap_Viet_Oly_Interactive.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      SoundEffects.playKeng();
      showToast("🎉 Tải ảnh bài rèn chữ ô-ly chất lượng cao thành công!");
    } catch (err) {
      console.error(err);
      showToast("❌ Không thể xuất ảnh từ giấy ô-ly. Thử lại!");
    }
  };

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in-down">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
        <div>
          <h4 className="text-sm font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            📝 TẠO FILE TẬP VIẾT
          </h4>
          <p className="text-[10px] text-slate-500 max-w-xl font-sans">
            Công nghệ thiết kế bài tập viết chuyên nghiệp. Thầy Cô có thể nhập văn bản, gõ mẫu chữ, căn chỉnh nét và kéo thả di chuyển góc ở bất kỳ địa điểm nào trên giấy để sinh bài tập rèn chữ đẹp.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleExportPng}
            disabled={items.length === 0}
            className={`px-3 py-2 text-xs font-black rounded-xl border flex items-center gap-1.5 transition uppercase ${
              items.length > 0 
                ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700 active:scale-95 cursor-pointer' 
                : 'bg-slate-200 text-slate-450 border-slate-300 cursor-not-allowed'
            }`}
          >
            📸 Xuất Ảnh PNG
          </button>
          <button 
            type="button"
            onClick={handleExportPdf}
            disabled={items.length === 0}
            className={`px-3 py-2 text-xs font-black rounded-xl border flex items-center gap-1.5 transition uppercase ${
              items.length > 0 
                ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 active:scale-95 cursor-pointer' 
                : 'bg-slate-200 text-slate-450 border-slate-300 cursor-not-allowed'
            }`}
          >
            📄 Xuất PDF chuẩn
          </button>
          <button 
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2 text-xs font-bold text-slate-605 bg-slate-100 hover:bg-slate-200 rounded-xl border cursor-pointer border-slate-300 transition"
          >
            Xóa sạch bảng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel 1: Left Dashboard Side controller */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50 border rounded-2xl p-4 text-xs font-serif leading-relaxed text-slate-700 font-sans">
          
          {/* Quick instructions widget */}
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/50 space-y-1">
            <span className="text-[10.5px] font-black text-amber-805 uppercase">💡 Cách thiết kế trực quan:</span>
            <ul className="list-disc pl-4 text-[9.5px] text-slate-600 space-y-0.5">
              <li>Gõ mẫu chữ trong ô bên dưới rồi nhấn <b>"Thêm Chữ Mới"</b>.</li>
              <li>Sử dụng chuột/tay để <b>nhấn giữ - kéo thả di chuyển khối chữ</b> trên trang giấy bên phải để sắp xếp.</li>
              <li><b>Click một từ</b> để chỉnh sửa, đổi cỡ phông chữ hoặc kích hoạt nét mờ cho bé đồ chữ viết theo!</li>
            </ul>
          </div>

          {/* Creation input box */}
          <div className="space-y-1.5 p-3.5 bg-white border rounded-xl shadow-xs">
            <span className="text-[10px] font-black text-slate-500 uppercase">1. Tạo chữ mẫu mới:</span>
            <input 
              type="text" 
              value={newText || ''} 
              onChange={(e) => setNewText(e.target.value)} 
              placeholder="Nhập chữ mẫu, vần hoặc từ..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-rose-400 font-bold" 
            />
            <button 
              type="button"
              onClick={handleAddItem}
              className="w-full py-2 bg-rose-600 text-white font-black text-xs uppercase hover:bg-rose-700 rounded-xl transition cursor-pointer"
            >
              ➕ THÊM CHỮ LÊN GIẤY ✍️
            </button>
          </div>

          {/* SELECTED ITEM DESIGN PANEL */}
          {selectedItem ? (
            <div className="p-3.5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-2 border-indigo-200 rounded-xl space-y-3 shadow-xs animate-fade-in">
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-[10px] font-black text-indigo-700 uppercase">🖌️ Chỉnh sửa chữ đang chọn:</span>
                <span className="bg-indigo-100 text-indigo-850 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Đã click chọn</span>
              </div>

              {/* Edit text value inputs */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase">Sửa nội dung chữ:</span>
                <input 
                  type="text" 
                  value={selectedItem.text || ''} 
                  onChange={(e) => handleUpdateSelectedItem('text', e.target.value)}
                  className="w-full text-xs font-black p-2 bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-800" 
                />
              </div>

              {/* Direct Input for Font Size (No slider) */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase">Kích thước chữ (Có thể điền):</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="12" 
                    max="150" 
                    value={selectedItem.fontSize ?? 32} 
                    onChange={(e) => handleUpdateSelectedItem('fontSize', Math.max(12, Math.min(150, Number(e.target.value) || 32)))}
                    className="w-20 text-xs p-2 bg-white border border-slate-250 rounded-lg text-slate-800 font-extrabold text-center focus:outline-none focus:ring-1 focus:ring-indigo-400" 
                  />
                  <button 
                    type="button"
                    onClick={() => handleUpdateSelectedItem('fontSize', Math.max(12, (selectedItem.fontSize || 32) - 1))}
                    className="w-10 h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-lg text-xs flex items-center justify-center border cursor-pointer active:scale-95 transition-all"
                  >
                    ▼ Giảm
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleUpdateSelectedItem('fontSize', Math.min(150, (selectedItem.fontSize || 32) + 1))}
                    className="w-10 h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-lg text-xs flex items-center justify-center border cursor-pointer active:scale-95 transition-all"
                  >
                    ▲ Tăng
                  </button>
                </div>
              </div>

              {/* Font Family selector */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase">Kiểu Font chữ sư phạm:</span>
                <select 
                  value={selectedItem.fontFamily || 'HP001_4_hang_bold'}
                  onChange={(e) => handleUpdateSelectedItem('fontFamily', e.target.value)}
                  className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg text-slate-705 font-extrabold focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="HP001_4_hang_bold">HP001 4 Hàng (Chữ Đậm) ⭐</option>
                  <option value="HP0014HB">HP001 4 Hàng (Chữ Thường) ⭐</option>
                  <option value="'HP001 5 hàng', 'HP001_5_hang', serif">HP001 5 hàng 📝</option>
                  <option value="'HP001 4H', 'HP001_4H', serif">HP001 4H 📝</option>
                  <option value="'HP001 5H', 'HP001_5H', serif">HP001 5H 📝</option>
                  <option value="'HP001 4H Normal', 'HP001_4H_Normal', serif">HP001 4H Normal 📝</option>
                  <option value="'HL Hoctro', 'HL_Hoctro', cursive">HL Hoctro 🎒</option>
                  <option value="'UTM Avo', 'Avo', sans-serif">UTM Avo 🅰️</option>
                  <option value="'SVN-Avo', 'Avo', sans-serif">SVN-Avo 🅰️</option>
                  <option value="Dancing Script">Dancing Script (Uốn lượn) 🖌️</option>
                  <option value="Times New Roman">Tiêu chuẩn (Times New Roman) 📄</option>
                </select>
              </div>

              {/* Color list selector */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase">Chọn màu mực viết:</span>
                <div className="flex gap-2 pt-1">
                  {[
                    { hex: '#2563eb', name: 'Mực Xanh dương' },
                    { hex: '#dc2626', name: 'Mực Đỏ sẫm' },
                    { hex: '#1e293b', name: 'Mực Đen mực' },
                    { hex: '#059669', name: 'Mực Xanh lá' }
                  ].map(c => (
                    <button 
                      key={c.hex} 
                      type="button"
                      onClick={() => handleUpdateSelectedItem('inkColor', c.hex)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border cursor-pointer transition ${selectedItem.inkColor === c.hex ? 'ring-2 ring-indigo-500 scale-110 border-white' : 'border-slate-350 opacity-80'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Net Mo (Tracing look checkbox) */}
              <div className="pt-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="chk-trace"
                  checked={selectedItem.isTrace} 
                  onChange={(e) => handleUpdateSelectedItem('isTrace', e.target.checked)}
                  className="accent-indigo-650 h-4 w-4 cursor-pointer" 
                />
                <label htmlFor="chk-trace" className="text-[10px] font-black text-slate-700 cursor-pointer uppercase">
                  Nét mờ nhạt (Đắp đường cho bé tập tô đồ)
                </label>
              </div>

              {/* Duplicate & Copy buttons */}
              <div className="flex gap-2 pt-2 border-t mt-2">
                <button 
                  type="button"
                  onClick={() => handleDuplicateItem(selectedItem)}
                  className="flex-1 py-1.5 bg-indigo-100 hover:bg-indigo-150 text-indigo-700 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer"
                >
                  📋 Nhân bản chữ
                </button>
                <button 
                  type="button"
                  onClick={() => handleDeleteItem(selectedItem.id)}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-extrabold uppercase transition border border-rose-200 cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-100/50 rounded-xl text-[10px] text-slate-500 italic text-center font-sans">
              👉 Bác chưa chọn từ nào. Hãy nhấn trực tiếp lên chữ bất kỳ trên tờ giấy để kích hoạt chỉnh sửa nâng cao!
            </div>
          )}

          {/* Layout worksheet preferences */}
          <div className="space-y-3 p-3.5 bg-white border rounded-xl shadow-xs border-slate-200">
            <span className="text-[10px] font-black text-slate-500 uppercase">⚙️ Thiết lập dòng giấy & đề bài:</span>
            
            <div className="space-y-1">
              <span className="text-[9.5px] uppercase tracking-wide text-slate-450 font-black">Màu đường lưới ô ly học sư phạm:</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => { setGridColor('cyan'); SoundEffects.playTing(); }}
                  className={`py-1 rounded-lg border text-center transition cursor-pointer font-bold text-[10px] ${gridColor === 'cyan' ? 'bg-cyan-50 border-cyan-400 text-cyan-800' : 'bg-white text-slate-700'}`}
                >
                  💠 Xanh ngọc lục bảo
                </button>
                <button 
                  type="button"
                  onClick={() => { setGridColor('pink'); SoundEffects.playTing(); }}
                  className={`py-1 rounded-lg border text-center transition cursor-pointer font-bold text-[10px] ${gridColor === 'pink' ? 'bg-pink-50 border-pink-400 text-pink-850' : 'bg-white text-slate-700'}`}
                >
                  🌸 Phấn hồng sư phạm
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-455 block uppercase font-black">Đề bài (Có thể gõ trực tiếp):</span>
              <input 
                type="text" 
                value={exerciseTitle || ''} 
                onChange={(e) => setExerciseTitle(e.target.value)} 
                className="w-full p-2 border border-slate-250 bg-slate-50 rounded-lg font-bold" 
              />
            </div>

            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-455 block uppercase font-black">Trường học:</span>
              <input 
                type="text" 
                value={schoolLabel || ''} 
                onChange={(e) => setSchoolLabel(e.target.value)} 
                className="w-full p-2 border border-slate-250 bg-slate-50 rounded-lg font-bold text-[10px]" 
                placeholder="Ví dụ: Trường Tiểu học Nguyễn Trãi"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-455 block uppercase font-black">Nhãn thông tin học sinh:</span>
              <input 
                type="text" 
                value={studentInfoLabel || ''} 
                onChange={(e) => setStudentInfoLabel(e.target.value)} 
                className="w-full p-2 border border-slate-250 bg-slate-50 rounded-lg font-bold text-[10px]" 
              />
            </div>
          </div>

        </div>

        {/* Panel 2: Interactive grid paper space */}
        <div className="lg:col-span-8 flex justify-center bg-slate-400/20 rounded-3xl p-4 overflow-x-auto min-h-[500px]">
          
          {/* Printable Layout Target Grid */}
          <div 
            ref={paperRef}
            onPointerMove={handlePointerMove}
            className="w-[660px] h-[920px] bg-white text-slate-800 border-2 border-slate-300 shadow-2xl rounded-sm p-8 relative flex flex-col items-stretch overflow-hidden select-none"
          >
            {/* Lề đỏ đứng dọc bên trái truyền thống vở viết tiểu học Việt Nam */}
            <div className="absolute left-[75px] top-0 bottom-0 w-[1.5px] bg-red-400 opacity-60 z-10 pointer-events-none" />

            {/* Vietnamese 4-ly background grid space (màu xanh nhạt / hồng) - exact 21 rows */}
            <div 
              className="absolute inset-x-0 pointer-events-none opacity-[0.55]"
              style={{
                top: '120px',
                height: '756px',
                backgroundImage: `
                  linear-gradient(${gridColor === 'cyan' ? 'rgba(14, 165, 233, 0.7)' : 'rgba(244, 63, 94, 0.7)'} 1.5px, transparent 1.5px),
                  linear-gradient(${gridColor === 'cyan' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(251, 113, 133, 0.25)'} 1px, transparent 1px),
                  linear-gradient(90deg, ${gridColor === 'cyan' ? 'rgba(14, 165, 233, 0.7)' : 'rgba(244, 63, 94, 0.7)'} 1.5px, transparent 1.5px),
                  linear-gradient(90deg, ${gridColor === 'cyan' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(251, 113, 133, 0.25)'} 1px, transparent 1px)
                `,
                backgroundSize: '100% 36px, 100% 9px, 36px 100%, 9px 100%',
                backgroundPosition: '0px 0px'
              }}
            />

            {/* Custom Paper Head area - centerview without smart station or redundant headers */}
            <div className="relative z-10 border-b border-dashed border-slate-300 pb-2 flex flex-col gap-2 font-sans pt-1">
              <div className="flex justify-between items-center text-[11px] font-serif italic text-slate-700">
                <input 
                  type="text"
                  value={schoolLabel || ''}
                  onChange={(e) => setSchoolLabel(e.target.value)}
                  className="bg-transparent border-none outline-none w-[48%] font-extrabold focus:bg-slate-100"
                />
                <input 
                  type="text"
                  value={studentInfoLabel || ''}
                  onChange={(e) => setStudentInfoLabel(e.target.value)}
                  className="bg-transparent border-none outline-none w-[48%] text-right font-extrabold focus:bg-slate-100"
                />
              </div>
              
              <div className="text-center mt-2.5">
                <input 
                  type="text"
                  value={exerciseTitle || ''}
                  onChange={(e) => setExerciseTitle(e.target.value)}
                  className="w-full text-center bg-transparent border-none outline-none text-base font-black text-rose-600 focus:bg-slate-50 border-b border-b-rose-200/50 uppercase select-text"
                />
              </div>
            </div>

            {/* Drag sheet workspace area */}
            <div className="flex-1 relative mt-[15px] select-none">
              {items.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-350 p-6 pointer-events-none z-0">
                  <span className="text-5xl mb-2">📋</span>
                  <p className="font-sans text-[11px] font-extrabold uppercase">Giấy Đang Trống</p>
                  <p className="font-sans text-[9px] max-w-[280px]">Vui lòng nhập mẫu tự viết ở bảng điều khiển bên trái, rồi nhấn nút màu hồng để đưa chữ lên giấy ô ly.</p>
                </div>
              )}

              {/* Render dynamic positionable items labels onto grid coordinates */}
              {items.map((item) => (
                <div
                  key={item.id}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  onPointerUp={handlePointerUp}
                  className={`absolute p-2 rounded cursor-grab select-none active:cursor-grabbing border ${
                    selectedId === item.id 
                      ? 'border-indigo-400 bg-indigo-50/25 shadow-sm z-30' 
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50/50 z-20'
                  }`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    touchAction: 'none'
                  }}
                >
                  <span 
                    className="select-none inline-block whitespace-nowrap leading-none transition-opacity"
                    style={{
                      fontFamily: item.fontFamily,
                      fontSize: `${item.fontSize}px`,
                      color: item.inkColor,
                      opacity: item.isTrace ? 0.35 : 1.0,
                    }}
                  >
                    {item.text}
                  </span>

                  {/* Context utility buttons on item frame wrapper */}
                  {selectedId === item.id && (
                    <div className="absolute top-[-26px] right-2 bg-indigo-650 text-white flex items-center rounded shadow-md border border-indigo-700 z-40 text-[9px] font-sans py-0.5 leading-none">
                      <button 
                        type="button"
                        title="Kéo thả di chuyển khối chữ"
                        className="px-1.5 py-0.5 border-r border-indigo-700 flex items-center justify-center font-bold"
                      >
                        ✥ Kéo
                      </button>
                      <button 
                        type="button"
                        title="Sao chép khối chữ nhanh"
                        onClick={(e) => { e.stopPropagation(); handleDuplicateItem(item); }}
                        className="px-1.5 py-0.5 border-r border-indigo-700 flex items-center justify-center font-bold text-teal-200"
                      >
                        Nhân bản
                      </button>
                      <button 
                        type="button"
                        title="Xóa chữ"
                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                        className="px-1.5 py-0.5 text-rose-350 hover:text-rose-100 font-black"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Paper Margin lines footer */}
            <div className="pt-2 border-t border-slate-200 mt-auto flex justify-between select-text relative z-10 text-[8.5px] font-sans text-slate-400">
              <span>Trang: 1/1</span>
              <span>Học sinh tích cực rèn luyện chữ đẹp mỗi ngày</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function ZombieCalculator({ showToast }: UtilProps) {
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [isNewInput, setIsNewInput] = useState(true);
  const [memory, setMemory] = useState<number>(0);

  const handleDigit = (digit: string) => {
    SoundEffects.playTing();
    if (isNewInput) {
      if (digit === '.') {
        setDisplay('0.');
      } else {
        setDisplay(digit);
      }
      setIsNewInput(false);
    } else {
      if (digit === '.' && display.includes('.')) return;
      setDisplay((prev) => (prev === '0' && digit !== '.' ? digit : prev + digit));
    }
  };

  const handleOperator = (op: string) => {
    SoundEffects.playTing();
    const current = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(current);
    } else if (operation) {
      const result = calculate(prevVal, current, operation);
      setPrevVal(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setFormula(`${prevVal !== null && operation ? prevVal : current} ${op}`);
    setIsNewInput(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (prevVal === null || !operation) return;
    SoundEffects.playKeng();
    const current = parseFloat(display);
    const result = calculate(prevVal, current, operation);
    
    const newEntry = `${prevVal} ${operation} ${current} = ${result}`;
    setHistory(prev => [newEntry, ...prev].slice(0, 10));
    
    setFormula('');
    setDisplay(String(result));
    setPrevVal(null);
    setOperation(null);
    setIsNewInput(true);
    showToast(`🧮 Đã tính toán xong: ${result}`);
  };

  const handleClear = () => {
    SoundEffects.playTing();
    setDisplay('0');
    setFormula('');
    setPrevVal(null);
    setOperation(null);
    setIsNewInput(true);
  };

  const handleBackspace = () => {
    SoundEffects.playTing();
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
      setIsNewInput(true);
    }
  };

  const handlePercent = () => {
    SoundEffects.playTing();
    const current = parseFloat(display);
    const result = current / 100;
    setDisplay(String(result));
    setIsNewInput(true);
  };

  const handleMemory = (type: 'MC' | 'MR' | 'M+' | 'M-') => {
    SoundEffects.playTing();
    const current = parseFloat(display);
    if (type === 'MC') {
      setMemory(0);
      showToast("🧹 Bộ nhớ đệm xóa sạch!");
    } else if (type === 'MR') {
      setDisplay(String(memory));
      setIsNewInput(true);
      showToast(`💾 Đã gọi bộ nhớ: ${memory}`);
    } else if (type === 'M+') {
      setMemory(prev => prev + current);
      showToast(`➕ Cộng thêm ${current} vào bộ nhớ`);
    } else if (type === 'M-') {
      setMemory(prev => prev - current);
      showToast(`➖ Trừ bớt ${current} khởi bộ nhớ`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-850">
      
      <div className="text-center space-y-1">
        <h4 className="text-sm font-black text-blue-800 uppercase tracking-widest">🧮 CÔNG CỤ TÍNH TOÁN BỎ TÚI</h4>
        <p className="text-[10px] text-slate-500">Máy tính mini sư phạm giúp bé làm quen các trò chơi cộng trừ nhân chia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Physical Calculator Box */}
        <div className="md:col-span-7 bg-slate-100 p-5 rounded-[32px] border-4 border-slate-300 shadow-xl max-w-sm mx-auto w-full">
          <div className="space-y-4">
            
            {/* Liquid Crystal Display Screen */}
            <div className="bg-[#1e293b] text-emerald-400 p-4 rounded-2xl text-right font-mono border-2 border-slate-400/50 shadow-inner relative overflow-hidden">
              <div className="absolute top-1 left-2 text-[8px] text-slate-500 uppercase tracking-wider">CASIO SMART v2.0</div>
              {memory !== 0 && <div className="absolute top-1 right-2 text-[9px] text-yellow-400 font-extrabold uppercase">M</div>}
              
              <div className="text-slate-500 text-[10px] h-4 tracking-wider truncate mb-1 pr-1 font-bold">
                {formula || "\u00A0"}
              </div>
              
              <div className="text-3xl font-black truncate tracking-tight pr-1">
                {display}
              </div>
            </div>

            {/* Memory Actions Row */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-black uppercase">
              {['MC', 'MR', 'M+', 'M-'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleMemory(btn as any)}
                  className="py-1 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 rounded-lg border border-slate-300 transition-colors shadow-2xs text-center cursor-pointer"
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Buttons Matrix Grid */}
            <div className="grid grid-cols-4 gap-2.5 font-bold">
              {/* CLEAR & UTILS */}
              <button onClick={handleClear} className="py-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-black text-xs rounded-xl border-b-2 border-rose-800 cursor-pointer shadow-xs">C</button>
              <button onClick={handleBackspace} className="py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-xs rounded-xl border-b-2 border-amber-800 cursor-pointer shadow-xs">⌫</button>
              <button onClick={handlePercent} className="py-3 bg-slate-300 hover:bg-slate-400 text-slate-800 font-black text-xs rounded-xl border-b-2 border-slate-400 cursor-pointer shadow-xs">%</button>
              <button onClick={() => handleOperator('÷')} className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl border-b-2 border-blue-900 cursor-pointer shadow-xs">÷</button>

              {/* ROW 1 */}
              <button onClick={() => handleDigit('7')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">7</button>
              <button onClick={() => handleDigit('8')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">8</button>
              <button onClick={() => handleDigit('9')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">9</button>
              <button onClick={() => handleOperator('×')} className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl border-b-2 border-blue-900 cursor-pointer shadow-xs">×</button>

              {/* ROW 2 */}
              <button onClick={() => handleDigit('4')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">4</button>
              <button onClick={() => handleDigit('5')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">5</button>
              <button onClick={() => handleDigit('6')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">6</button>
              <button onClick={() => handleOperator('-')} className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl border-b-2 border-blue-900 cursor-pointer shadow-xs">-</button>

              {/* ROW 3 */}
              <button onClick={() => handleDigit('1')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">1</button>
              <button onClick={() => handleDigit('2')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">2</button>
              <button onClick={() => handleDigit('3')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">3</button>
              <button onClick={() => handleOperator('+')} className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl border-b-2 border-blue-900 cursor-pointer shadow-xs">+</button>

              {/* ROW 4 */}
              <button onClick={() => handleDigit('0')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs col-span-2">0</button>
              <button onClick={() => handleDigit('.')} className="py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-black rounded-xl border-b-2 border-slate-200 cursor-pointer shadow-xs">.</button>
              <button onClick={handleEqual} className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl border-b-2 border-emerald-950 cursor-pointer shadow-xs">=</button>
            </div>

          </div>
        </div>

        {/* Audit Log / History list */}
        <div className="md:col-span-5 bg-slate-50 p-5 rounded-[24px] border border-slate-200/80 h-full min-h-[300px] flex flex-col justify-between">
          <div className="space-y-3">
            <h5 className="text-[11.5px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b pb-2">
              📜 LỊCH SỬ PHÉP TÍNH GẦN ĐÂY
            </h5>
            
            {history.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-white p-2 px-3 rounded-xl border border-slate-200/60 font-mono text-[11px] font-bold text-slate-700 flex justify-between items-center animate-fade-in shadow-2xs">
                    <span>{item}</span>
                    <button 
                      onClick={() => {
                        SoundEffects.playTing();
                        const parts = item.split(' = ');
                        if (parts[1]) {
                          setDisplay(parts[1]);
                          setIsNewInput(true);
                          showToast("📋 Đã tải kết quả lên màn hình!");
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700 font-black uppercase text-[9px] hover:underline"
                    >
                      Dùng sô
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <span className="text-3xl">📝</span>
                <p className="text-[10px] font-bold uppercase tracking-wide">Chưa có hoạt động tính toán nào</p>
                <p className="text-[9px] px-4 font-semibold text-slate-450">Tất cả phép cộng trừ nhân chia sẽ lưu giữ ở đây</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setHistory([]);
                SoundEffects.playTing();
                showToast("🧹 Đã xóa lịch sử!");
              }}
              disabled={history.length === 0}
              className={`w-full py-2 text-[10px] font-black uppercase rounded-lg border text-center transition ${history.length > 0 ? 'bg-white hover:bg-slate-100 text-slate-500 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed border-transparent'}`}
            >
              XÓA LỊCH SỬ CỤC BỘ
            </button>

            <button
              onClick={() => {
                SoundEffects.playKeng();
                const calcStandalone = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Công cụ tính toán bỏ túi - Trạm Học Tập</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Times New Roman', Times, serif; }
  </style>
</head>
<body class="bg-slate-550 bg-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white border-2 border-slate-350 p-6 rounded-[32px] shadow-xl max-w-sm w-full text-center space-y-4">
    <div>
      <h2 class="text-sm font-black text-blue-800 uppercase tracking-widest">🧮 MÁY TÍNH BỎ TÚI OFFLINE</h2>
      <p class="text-[10px] text-slate-500">Hỗ trợ các phép tính cộng, trừ, nhân, chia cơ bản</p>
    </div>

    <!-- LCD Display -->
    <div class="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-right font-mono border-2 border-slate-400/50 shadow-inner">
      <div id="formula" class="text-slate-500 text-[10px] h-4 truncate"></div>
      <div id="display" class="text-3xl font-black truncate">0</div>
    </div>

    <!-- Buttons matrix -->
    <div class="grid grid-cols-4 gap-2 text-xs font-bold">
      <button onclick="clearCalc()" class="py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-xs">C</button>
      <button onclick="backspace()" class="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs">⌫</button>
      <button onclick="percent()" class="py-3 bg-slate-300 hover:bg-slate-400 text-slate-850 rounded-xl shadow-xs">%</button>
      <button onclick="setOp('/')" class="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">÷</button>

      <button onclick="pressDigit('7')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">7</button>
      <button onclick="pressDigit('8')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">8</button>
      <button onclick="pressDigit('9')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">9</button>
      <button onclick="setOp('*')" class="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">×</button>

      <button onclick="pressDigit('4')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">4</button>
      <button onclick="pressDigit('5')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">5</button>
      <button onclick="pressDigit('6')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">6</button>
      <button onclick="setOp('-')" class="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">-</button>

      <button onclick="pressDigit('1')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">1</button>
      <button onclick="pressDigit('2')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">2</button>
      <button onclick="pressDigit('3')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">3</button>
      <button onclick="setOp('+')" class="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">+</button>

      <button onclick="pressDigit('0')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs col-span-2">0</button>
      <button onclick="pressDigit('.')" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-805 rounded-xl shadow-xs">.</button>
      <button onclick="calculate()" class="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs">=</button>
    </div>
  </div>

  <script>
    let currentInput = "0";
    let formula = "";
    let activeOp = null;
    let prevVal = null;
    let nextInputReset = true;

    const displayEl = document.getElementById('display');
    const formulaEl = document.getElementById('formula');

    function updateUI() {
      displayEl.innerText = currentInput;
      formulaEl.innerText = formula;
    }

    function pressDigit(digit) {
      if (nextInputReset) {
        currentInput = digit === '.' ? '0.' : digit;
        nextInputReset = false;
      } else {
        if (digit === '.' && currentInput.includes('.')) return;
        currentInput = currentInput === '0' && digit !== '.' ? digit : currentInput + digit;
      }
      updateUI();
    }

    function setOp(op) {
      const current = parseFloat(currentInput);
      if (prevVal === null) {
        prevVal = current;
      } else if (activeOp) {
        prevVal = runMath(prevVal, current, activeOp);
      }
      activeOp = op;
      formula = prevVal + " " + op;
      nextInputReset = true;
      updateUI();
    }

    function runMath(a, b, op) {
      switch(op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 0;
        default: return b;
      }
    }

    function calculate() {
      if (prevVal === null || !activeOp) return;
      const current = parseFloat(currentInput);
      const result = runMath(prevVal, current, activeOp);
      formula = "";
      currentInput = String(result);
      prevVal = null;
      activeOp = null;
      nextInputReset = true;
      updateUI();
    }

    function clearCalc() {
      currentInput = "0";
      formula = "";
      activeOp = null;
      prevVal = null;
      nextInputReset = true;
      updateUI();
    }

    function backspace() {
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = "0";
        nextInputReset = true;
      }
      updateUI();
    }

    function percent() {
      const current = parseFloat(currentInput);
      currentInput = String(current / 100);
      nextInputReset = true;
      updateUI();
    }
  </script>
</body>
</html>`;
                const blob = new Blob([calcStandalone], { type: 'text/html;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = "may_tinh_bo_tui_offline.html";
                link.click();
                showToast("🧮 Đã xuất file máy tính cầm tay sư phạm offline!");
              }}
              className="w-full py-2 text-[10px] font-black uppercase rounded-lg border text-center transition bg-indigo-650 hover:bg-indigo-750 text-white cursor-pointer"
            >
              📥 Xuất HTML Máy tính 🧮
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// =========================================================================
// 12. INVITATION POSTER CREATOR
// =========================================================================
import { InvitationPosterCreator as ModularInvitationPosterCreator } from './InvitationPosterCreator';

export function InvitationPosterCreator({ showToast }: UtilProps) {
  return <ModularInvitationPosterCreator showToast={showToast} />;
}

export function LegacyInvitationPosterCreatorHidden({ showToast }: UtilProps) {
  // Input fields state
  const [ubnd, setUbnd] = useState('ỦY BAN NHÂN DÂN QUẬN THANH XUÂN');
  const [school, setSchool] = useState('TRƯỜNG TIỂU HỌC NGUYỄN TRÃI');
  const [motto1, setMotto1] = useState('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');
  const [motto2, setMotto2] = useState('Độc lập - Tự do - Hạnh phúc');
  const [title, setTitle] = useState('GIẤY MỜI');
  const [subtitle, setSubtitle] = useState('Trân trọng kính mời Ông (Bà)');
  const [className, setClassName] = useState('4A1');
  
  // Attendee names
  const [isDottedLine, setIsDottedLine] = useState(true);
  const [parentName, setParentName] = useState('Nguyễn Văn Hùng (Phụ huynh em Nguyễn Minh Khánh)');

  const [subject, setSubject] = useState('BUỔI HỌP PHỤ HUYNH HỌC SINH');
  const [purpose, setPurpose] = useState('Họp bàn định hướng chiến lược học tập Kỳ II & Tổng kết hoạt động phong trào của lớp');
  const [time, setTime] = useState('08 giờ 30 phút, ngày 24 tháng 05 năm 2026');
  const [location, setLocation] = useState('Phòng học lớp 4A1, Tầng 3, Nhà B');
  const [quote, setQuote] = useState('Sự đồng hành của Quý phụ huynh là nguồn động lực lớn cho các con!');
  const [teacherName, setTeacherName] = useState('Cô Nguyễn Ánh Tuyết');
  const [teacherSign, setTeacherSign] = useState('Ánh Tuyết');
  const [isSignatureOn, setIsSignatureOn] = useState(true);

  // Styling presets
  const [paletteId, setPaletteId] = useState<'pink' | 'peach' | 'mint' | 'purple'>('pink');
  const [borderStyle, setBorderStyle] = useState<'corners' | 'gold_frame' | 'doodles'>('corners');
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [isCursiveSign, setIsCursiveSign] = useState(true);

  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const QUOTE_PRESETS = [
    'Sự đồng hành của Quý phụ huynh là nguồn động lực lớn cho các con!',
    'Mỗi ngày đến trường là một ngày vui, cùng cha mẹ dìu dắt tương lai của con.',
    'Gia đình và lớp học là đôi cánh giúp con bay cao, bay xa hơn nữa.',
    'Sự tin tưởng và phối hợp của quý vị chính là chìa khóa mở lối thành công cho các học trò.'
  ];

  const PALETTES = {
    pink: {
      name: 'Hồng Đào Pastel',
      bgGrad: 'from-[#fff5f6] to-[#ffe4e6]',
      cardBg: 'from-[#ffffff] to-[#fff1f3]',
      titleGrad: 'from-[#ec4899] via-[#f43f5e] to-[#db2777]',
      themeTextColor: 'text-[#881337]',
      mottoColor: 'text-rose-500',
      labelColor: 'bg-[#fff1f2] text-rose-700',
      borderColor: 'border-pink-200',
      badgeBg: 'bg-[#fee2e2] text-rose-800 border-rose-300',
      primaryBtn: 'bg-rose-500 hover:bg-rose-600',
      accentColor: '#db2777',
      flowerBg: '#fda4af',
      leafBg: '#86efac'
    },
    peach: {
      name: 'Cam Đào Ấm Áp',
      bgGrad: 'from-[#fffbf0] to-[#ffdcb3]',
      cardBg: 'from-[#ffffff] to-[#fff6ec]',
      titleGrad: 'from-[#f97316] via-[#ea580c] to-[#c2410c]',
      themeTextColor: 'text-[#7c2d12]',
      mottoColor: 'text-orange-600',
      labelColor: 'bg-[#fff7ed] text-orange-700',
      borderColor: 'border-amber-200',
      badgeBg: 'bg-[#ffedd5] text-[#7c2d12] border-amber-300',
      primaryBtn: 'bg-orange-500 hover:bg-orange-600',
      accentColor: '#ea580c',
      flowerBg: '#fed7aa',
      leafBg: '#a7f3d0'
    },
    mint: {
      name: 'Xanh Mint Tươi Mát',
      bgGrad: 'from-[#f0fdf4] to-[#ccfbf1]',
      cardBg: 'from-[#ffffff] to-[#f0fdf4]',
      titleGrad: 'from-[#10b981] via-[#059669] to-[#047857]',
      themeTextColor: 'text-[#064e3b]',
      mottoColor: 'text-emerald-600',
      labelColor: 'bg-[#ecfdf5] text-emerald-700',
      borderColor: 'border-emerald-200',
      badgeBg: 'bg-[#d1fae5] text-emerald-800 border-emerald-300',
      primaryBtn: 'bg-emerald-500 hover:bg-emerald-600',
      accentColor: '#10b981',
      flowerBg: '#a7f3d0',
      leafBg: '#cbd5e1'
    },
    purple: {
      name: 'Oải Hương Thơ Mộng',
      bgGrad: 'from-[#faf5ff] to-[#f3e8ff]',
      cardBg: 'from-[#ffffff] to-[#f5f3ff]',
      titleGrad: 'from-[#8b5cf6] via-[#7c3aed] to-[#5b21b6]',
      themeTextColor: 'text-[#4c1d95]',
      mottoColor: 'text-purple-600',
      labelColor: 'bg-[#f5f3ff] text-purple-700',
      borderColor: 'border-purple-200',
      badgeBg: 'bg-[#f3e8ff] text-purple-800 border-purple-300',
      primaryBtn: 'bg-purple-500 hover:bg-purple-600',
      accentColor: '#8b5cf6',
      flowerBg: '#d8b4fe',
      leafBg: '#a7f3d0'
    }
  };

  const currentPal = PALETTES[paletteId];

  const handleExportPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    SoundEffects.playTing();
    try {
      const canvas = await safeHtml2Canvas(posterRef.current, {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `thu_moi_hop_phu_huynh_lop_${className.replace(/\s+/g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast("📸 Đã tải xuống thư mời dạng ảnh PNG HD siêu nét thành công!");
    } catch (err) {
      console.error(err);
      showToast("❌ Lỗi xuất ảnh thư mời!");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    SoundEffects.playKeng();
    try {
      const canvas = await safeHtml2Canvas(posterRef.current, {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`thu_moi_hop_phu_huynh_lop_${className.replace(/\s+/g, '')}.pdf`);
      showToast("📄 Đã xuất bản file PDF A4 ngang chất lượng cao sẵn sàng để in!");
    } catch (err) {
      console.error(err);
      showToast("❌ Lỗi xuất PDF!");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setUbnd('ỦY BAN NHÂN DÂN QUẬN THANH XUÂN');
    setSchool('TRƯỜNG TIỂU HỌC NGUYỄN TRÃI');
    setClassName('4A1');
    setSubject('BUỔI HỌP PHỤ HUYNH HỌC SINH');
    setPurpose('Họp bàn định hướng chiến lược học tập Kỳ II & Tổng kết hoạt động phong trào của lớp');
    setTime('08 giờ 30 phút, ngày 24 tháng 05 năm 2026');
    setLocation('Phòng học lớp 4A1, Tầng 3, Nhà B');
    setQuote('Sự đồng hành của Quý phụ huynh là nguồn động lực lớn cho các con!');
    setTeacherName('Cô Nguyễn Ánh Tuyết');
    setTeacherSign('Ánh Tuyết');
    setIsDottedLine(true);
    setPaletteId('pink');
    setBorderStyle('corners');
    setCustomImgUrl('');
    setIsSignatureOn(true);
    SoundEffects.playTing();
    showToast("🔄 Khôi phục giao diện thư mời mẫu thành công!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-805">
      {/* Description header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="space-y-1">
          <h4 className="text-base font-black text-pink-600 uppercase tracking-wider flex items-center gap-2">
            ✉️ CÔNG CỤ TẠO THƯ MỜI HỌP PHỤ HUYNH A4
          </h4>
          <p className="text-[11px] text-slate-500 font-semibold leading-normal">
            Trình soạn thảo trực quan hỗ trợ Thầy Cô tạo thư mời, giấy mời họp phụ huynh đẹp mắt, xuất tệp ảnh PNG HD hoặc PDF in ấn khổ A4 ngang.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 border rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> ĐẶT LẠI MẪU 🔄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: EDITABLE CONTROLS FORM */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-5 shadow-2xs max-h-[780px] overflow-y-auto text-left">
          
          {/* Aesthetic presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              🎨 LỰA CHỌN TÔNG MÀU PASTEL (CHỦ ĐỀ)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setPaletteId(key);
                    SoundEffects.playTing();
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-black transition-all flex flex-col justify-between cursor-pointer ${
                    paletteId === key 
                      ? 'border-slate-900 bg-white shadow-xs ring-2 ring-slate-950/10' 
                      : 'border-slate-200 bg-slate-100 hover:bg-white text-slate-600'
                  }`}
                >
                  <span className="text-[11px]">{PALETTES[key].name}</span>
                  <div className="flex gap-1 mt-1">
                    <span className="w-4 h-4 rounded-full bg-pink-100 border text-[9px] flex items-center justify-center">🌸</span>
                    <span className="w-4 h-4 rounded-full bg-orange-100 border text-[9px] flex items-center justify-center">🔸</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-100 border text-[9px] flex items-center justify-center">🍃</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Border Frame Styles selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              🏞️ KIỂU KHUNG VIỀN TRANG TRÍ (A4 FRAME)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'corners', name: '🌸 Góc Hoa Pastel' },
                { id: 'gold_frame', name: '👑 Khung Thần Tiên' },
                { id: 'doodles', name: '🎒 Doodle Lớp Học' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setBorderStyle(style.id as any);
                    SoundEffects.playTing();
                  }}
                  className={`py-2 px-1 rounded-lg border text-center text-[10.5px] font-black transition cursor-pointer ${
                    borderStyle === style.id 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* School Headers Form input */}
          <div className="space-y-3.5 bg-white p-3.5 rounded-2xl border border-slate-150-10">
            <h5 className="text-[11px] font-black text-rose-600 uppercase border-b pb-1 flex items-center gap-1">
              🏢 THÔNG TIN BAN GIÁM HIỆU / TRƯỜNG PHÒNG
            </h5>
            
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">1. UBND Xã / Huyện chủ quản:</span>
              <input
                type="text"
                value={ubnd || ''}
                onChange={(e) => setUbnd(e.target.value.toUpperCase())}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-slate-900 uppercase"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">2. Tên Trường Tiểu học / THCS:</span>
              <input
                type="text"
                value={school || ''}
                onChange={(e) => setSchool(e.target.value.toUpperCase())}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-slate-900 uppercase"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">3. Quốc hiệu (Dòng 1):</span>
              <input
                type="text"
                value={motto1 || ''}
                onChange={(e) => setMotto1(e.target.value.toUpperCase())}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-950 uppercase text-[10px]"
              />
            </div>
          </div>

          {/* Details Form inputs */}
          <div className="space-y-3.5 bg-white p-3.5 rounded-2xl border border-slate-150-10">
            <h5 className="text-[11px] font-black text-rose-600 uppercase border-b pb-1">
              ✍️ THỜI GIAN, LỚP HỌC & ĐỊA ĐIỂM HỌP
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Tên lớp:</span>
                <input
                  type="text"
                  value={className || ''}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ví dụ: 4A1"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-slate-950"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Tiêu đề Giấy mời:</span>
                <input
                  type="text"
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg font-black text-slate-800 focus:outline-none focus:border-slate-950"
                />
              </div>
            </div>

            {/* Parent specification toggle */}
            <div className="space-y-2 border-t pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase">Tên Phụ huynh mời:</span>
                <label className="flex items-center gap-1 text-[10px] font-extrabold text-blue-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDottedLine}
                    onChange={(e) => {
                      setIsDottedLine(e.target.checked);
                      SoundEffects.playTing();
                    }}
                    className="cursor-pointer"
                  />
                  <span>Dòng kẻ trống (Để ghi tay)</span>
                </label>
              </div>
              
              {!isDottedLine && (
                <input
                  type="text"
                  value={parentName || ''}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="VD: Ông Nguyễn Văn An (Phụ huynh em Vy)"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900 animate-fade-in"
                />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">Nội dung / Chủ đề buổi họp:</span>
              <textarea
                value={purpose || ''}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900 leading-normal"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">Thời gian họp xác định:</span>
              <input
                type="text"
                value={time || ''}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">Địa điểm (Phòng học):</span>
              <input
                type="text"
                value={location || ''}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Inspirational quotes selection block */}
          <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-slate-150-10">
            <span className="text-[10px] font-black text-slate-500 uppercase flex justify-between items-center">
              💬 LỰA CHỌN CÂU TRÍCH DẪN / THÔNG ĐIỆP
            </span>
            <select
              value={quote || ''}
              onChange={(e) => {
                setQuote(e.target.value);
                SoundEffects.playTing();
              }}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
            >
              {QUOTE_PRESETS.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
              <option value="custom">-- Tự soạn câu thông điệp khác --</option>
            </select>
            {quote === 'custom' || !QUOTE_PRESETS.includes(quote) ? (
              <textarea
                value={quote === 'custom' ? '' : (quote || '')}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Nhập lời nhắn gửi phụ huynh ý nghĩa của riêng Thầy Cô..."
                rows={2}
                className="w-full text-xs p-2 border border-amber-300 rounded-lg text-slate-800 focus:outline-none mt-1 shadow-sm"
              />
            ) : null}
          </div>

          {/* Teacher Cursive Sign block */}
          <div className="space-y-3.5 bg-white p-3.5 rounded-2xl border border-slate-150-10">
            <div className="flex items-center justify-between border-b pb-1">
              <h5 className="text-[11px] font-black text-rose-600 uppercase">
                ✒️ CHỮ KÝ GIÁO VIÊN CHỦ NHIỆM
              </h5>
              <label className="flex items-center gap-1 text-[10.5px] font-extrabold text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSignatureOn}
                  onChange={(e) => {
                    setIsSignatureOn(e.target.checked);
                    SoundEffects.playTing();
                  }}
                  className="cursor-pointer"
                />
                <span>Hiện chữ ký mẫu</span>
              </label>
            </div>

            {isSignatureOn && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Tên ký (Cursive):</span>
                  <input
                    type="text"
                    value={teacherSign || ''}
                    onChange={(e) => setTeacherSign(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg text-rose-600 font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Họ và Tên đầy đủ:</span>
                  <input
                    type="text"
                    value={teacherName || ''}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Alternative Picture option block */}
          <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-slate-150-10">
            <span className="text-[10px] font-black text-slate-500 uppercase block">
              📸 ẢNH MINH HỌA AO DÀI THẦY CÔ
            </span>
            <input
              type="text"
              value={customImgUrl || ''}
              onChange={(e) => setCustomImgUrl(e.target.value)}
              placeholder="Dán link ảnh online nếu muốn tự thay thế chibi mẫu..."
              className="w-full text-[11px] p-2 border border-slate-250 rounded-lg focus:outline-none text-slate-650"
            />
            <p className="text-[9px] text-slate-400 font-medium">
              *Mặc định hệ thống vẽ Chibi của một cô giáo mặc Áo Dài hồng ấm cúng, tinh xảo bằng Vector SVG cực dễ thương.
            </p>
          </div>

        </div>

        {/* RIGHT PANEL: A4 LANDSCAPE INTERACTIVE LIVE PREVIEW CARD */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              👁️ MÀU SẮC THỂ HIỆN THỰC TẾ TRÊN KHỔ GIẤY A4 NGANG
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700/80 rounded border uppercase">
              Tỷ lệ 1.414 : 1
            </span>
          </div>

          {/* Container supporting printing boundaries */}
          <div className="w-full overflow-x-auto pb-4 rounded-3xl">
            {/* The A4 Landscape Live Card */}
            <div
              id="print-area"
              ref={posterRef}
              className={`w-[840px] h-[594px] min-w-[840px] rounded-[32px] relative overflow-hidden bg-gradient-to-br p-7 border-2 transition-all duration-300 ${currentPal.bgGrad} ${currentPal.borderColor} select-none shadow-xl`}
              style={{
                boxSizing: 'border-box',
                fontFamily: "'Times New Roman', Times, serif"
              }}
            >
              
              {/* LARGE DECORATIVE CORNER FLOWER ASSETS OR FRAMES */}
              {borderStyle === 'corners' && (
                <>
                  {/* Top-Left Corner */}
                  <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none opacity-85 z-10">
                    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" opacity="0.95">
                      <circle cx="20" cy="20" r="14" fill={currentPal.flowerBg} />
                      <circle cx="34" cy="20" r="10" fill="#fff1f2" />
                      <circle cx="20" cy="34" r="10" fill="#fff1f2" />
                      <circle cx="30" cy="30" r="12" fill={currentPal.accentColor} />
                      <circle cx="25" cy="25" r="4" fill="#fef08a" />
                      
                      <circle cx="65" cy="20" r="8" fill="#cbd5e1" />
                      <path d="M 30 18 Q 72 8 85 24" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 18 30 Q 8 72 24 85" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 60 20 Q 75 35 65 45 Q 50 35 60 20" fill={currentPal.leafBg} />
                      <path d="M 20 60 Q 35 75 45 65 Q 35 50 20 60" fill={currentPal.leafBg} />
                    </svg>
                  </div>
                  {/* Top-Right Corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-85 z-10 rotate-90">
                    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
                      <circle cx="20" cy="20" r="14" fill={currentPal.flowerBg} />
                      <circle cx="34" cy="20" r="10" fill="#fff1f2" />
                      <circle cx="20" cy="34" r="10" fill="#fff1f2" />
                      <circle cx="30" cy="30" r="12" fill={currentPal.accentColor} />
                      <circle cx="25" cy="25" r="4" fill="#fef08a" />
                      <path d="M 30 18 Q 72 8 85 24" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 18 30 Q 8 72 24 85" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 60 20 Q 75 35 65 45 Q 50 35 60 20" fill={currentPal.leafBg} />
                      <path d="M 20 60 Q 35 75 45 65 Q 35 50 20 60" fill={currentPal.leafBg} />
                    </svg>
                  </div>
                  {/* Bottom-Left Corner */}
                  <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none opacity-85 z-10 -rotate-90">
                    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
                      <circle cx="20" cy="20" r="14" fill={currentPal.flowerBg} />
                      <circle cx="34" cy="20" r="10" fill="#fff1f2" />
                      <circle cx="20" cy="34" r="10" fill="#fff1f2" />
                      <circle cx="30" cy="30" r="12" fill={currentPal.accentColor} />
                      <circle cx="25" cy="25" r="4" fill="#fef08a" />
                      <path d="M 30 18 Q 72 8 85 24" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 18 30 Q 8 72 24 85" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 60 20 Q 75 35 65 45 Q 50 35 60 20" fill={currentPal.leafBg} />
                      <path d="M 20 60 Q 35 75 45 65 Q 35 50 20 60" fill={currentPal.leafBg} />
                    </svg>
                  </div>
                  {/* Bottom-Right Corner */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-85 z-10 rotate-180">
                    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
                      <circle cx="20" cy="20" r="14" fill={currentPal.flowerBg} />
                      <circle cx="34" cy="20" r="10" fill="#fff1f2" />
                      <circle cx="20" cy="34" r="10" fill="#fff1f2" />
                      <circle cx="30" cy="30" r="12" fill={currentPal.accentColor} />
                      <circle cx="25" cy="25" r="4" fill="#fef08a" />
                      <path d="M 30 18 Q 72 8 85 24" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 18 30 Q 8 72 24 85" stroke={currentPal.flowerBg} strokeWidth="2.5" />
                      <path d="M 60 20 Q 75 35 65 45 Q 50 35 60 20" fill={currentPal.leafBg} />
                      <path d="M 20 60 Q 35 75 45 65 Q 35 50 20 60" fill={currentPal.leafBg} />
                    </svg>
                  </div>
                </>
              )}

              {/* Internal card background wrapper with large border outline framing */}
              <div 
                className={`w-full h-full bg-gradient-to-br ${currentPal.cardBg} rounded-2xl flex flex-col justify-between p-6 relative overflow-hidden ${
                  borderStyle === 'gold_frame' 
                    ? 'border-4 border-[#f59e0b] border-double shadow-inner' 
                    : borderStyle === 'doodles' 
                    ? 'border-4 border-dashed border-slate-300 shadow-inner' 
                    : 'border border-pink-100/30'
                }`}
              >
                
                {/* Decorative Soft Doodle background elements for aesthetics */}
                {borderStyle === 'doodles' && (
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="200" r="15" fill="none" stroke="#000" strokeWidth="2" />
                      <rect x="750" y="80" width="30" height="30" rx="5" fill="none" stroke="#000" strokeWidth="2" />
                      <path d="M 200 40 L 230 50 L 215 70 Z" fill="none" stroke="#000" strokeWidth="2" />
                      <path d="M 500 500 Q 520 480 540 510" fill="none" stroke="#000" strokeWidth="2" />
                      <path d="M 100 500 Q 120 470 150 490" fill="none" stroke="#000" strokeWidth="2" />
                    </svg>
                  </div>
                )}

                {/* 1. STATEFUL ROOT HEADER ROW (Standard Vietnamese administrative headers) */}
                <div className="flex justify-between items-start text-center border-b border-rose-100/50 pb-2 z-10">
                  <div className="space-y-0.5 text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-tight">{ubnd}</p>
                    <p className={`text-[11px] font-black uppercase tracking-wide ${currentPal.themeTextColor} leading-tight`}>
                      {school}
                    </p>
                  </div>
                  
                  <div className="space-y-0.5 text-right">
                    <p className="text-[10px] font-extrabold text-slate-800 tracking-wider leading-tight uppercase">{motto1}</p>
                    <p className="text-[10.5px] font-black text-slate-600 leading-tight italic tracking-wide">{motto2}</p>
                    <div className="w-24 h-0.5 bg-rose-300 opacity-60 ml-auto mt-0.5 rounded-full"></div>
                  </div>
                </div>

                {/* 2. MAIN SPLIT BODY GRID: LEFT ILLUSTRATION & RIGHT CONTENT */}
                <div className="grid grid-cols-12 gap-5 items-center flex-1 my-2 z-10 text-left">
                  
                  {/* Left Side: Beautiful custom Chibi animation vector or custom URL illustration */}
                  <div className="col-span-4 flex flex-col items-center justify-center relative">
                    {customImgUrl ? (
                      <div className="w-[195px] h-[195px] rounded-[36px] overflow-hidden border-4 border-white shadow-md bg-rose-50/50 flex items-center justify-center">
                        <img 
                          src={customImgUrl} 
                          alt="Custom Minh Hoa"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      /* High-Quality Embedded Responsive Vector SVG matching description */
                      <div className="w-[200px] h-[200px] hover:scale-105 transition-transform duration-300">
                        <svg viewBox="0 0 400 400" className="w-full h-full max-h-[300px]" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="200" cy="200" r="170" fill={paletteId === 'pink' ? 'url(#pinkGra)' : paletteId === 'peach' ? 'url(#peachGra)' : paletteId === 'mint' ? 'url(#mintGra)' : 'url(#purpleGra)'} opacity="0.16" />
                          <defs>
                            <linearGradient id="pinkGra" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="100%" stopColor="#f43f5e" />
                            </linearGradient>
                            <linearGradient id="peachGra" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#ea580c" />
                            </linearGradient>
                            <linearGradient id="mintGra" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <linearGradient id="purpleGra" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                          </defs>
                          
                          {/* Teacher in soft pink ao dai */}
                          <g transform="translate(140, 50)">
                            {/* long matching hairs */}
                            <path d="M 40 40 Q 15 60 20 130 Q 25 160 35 190" fill="#2d221e" />
                            <path d="M 80 40 Q 105 60 100 130 Q 95 160 85 190" fill="#2d221e" />
                            
                            {/* flows */}
                            <path d="M 28 178 Q 15 240, 10 320" fill="#fbcfe8" opacity="0.5"/>
                            <path d="M 92 178 Q 105 240, 110 320" fill="#fbcfe8" opacity="0.5"/>

                            {/* Dress body */}
                            <path d="M 30 160 Q 60 152 90 160 L 115 320 L 5 320 Z" fill="#fbcfe8" />
                            <path d="M 48 145 Q 60 155 72 145 L 60 162 Z" fill="#fecdd3" />

                            {/* white ao dai pants */}
                            <path d="M 33 315 L 43 335 L 53 315 Z" fill="#ffffff" />
                            <path d="M 67 315 L 77 335 L 87 315 Z" fill="#ffffff" />

                            {/* Arms & holding books naturally */}
                            <path d="M 32 165 C 10 190, 5 210, 15 225 C 22 230, 28 220, 25 210" fill="#fbcfe8" />
                            <path d="M 88 165 C 110 190, 115 210, 105 225 C 98 230, 92 220, 95 210" fill="#fbcfe8" />
                            
                            <circle cx="18" cy="223" r="6.5" fill="#ffe4e6" />
                            <circle cx="102" cy="223" r="6.5" fill="#ffe4e6" />
                            
                            {/* Blue detailed hand book */}
                            <rect x="34" y="210" width="52" height="34" rx="4" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1.5" />
                            <line x1="60" y1="210" x2="60" y2="244" stroke="#3b82f6" strokeWidth="1.5" />
                            <path d="M 56 220 Q 60 216 64 220 L 60 225 Z" fill="#fecdd3" />
                            <path d="M 38 215 H 55 M 38 223 H 55 M 38 231 H 55 M 65 215 H 82 M 65 223 H 82 M 65 231 H 82" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />

                            {/* Head & elegant face details */}
                            <rect x="52" y="128" width="16" height="20" fill="#ffe4e6" />
                            <circle cx="60" cy="110" r="32" fill="#ffe4e6" />
                            
                            <circle cx="48" cy="111" r="3" fill="#1e293b" />
                            <circle cx="72" cy="111" r="3" fill="#1e293b" />
                            <path d="M 43 103 Q 48 99 53 104" fill="none" stroke="#27272a" strokeWidth="1.5" />
                            <path d="M 67 103 Q 72 99 77 104" fill="none" stroke="#27272a" strokeWidth="1.5" />
                            
                            <ellipse cx="44" cy="118" rx="6" ry="3.5" fill="#ec4899" opacity="0.32" />
                            <ellipse cx="76" cy="118" rx="6" ry="3.5" fill="#ec4899" opacity="0.32" />
                            <path d="M 54 120 Q 60 125 66 120" fill="none" stroke="#a01122" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Hair bang/flower clip */}
                            <path d="M 28 110 C 28 50, 92 50, 92 110 Q 92 113 90 120 C 85 110, 80 95, 60 98 C 45 95, 35 110, 30 120" fill="#3f2e27" />
                            <path d="M 78 85 Q 82 81 86 85 Q 90 89 86 93 Q 82 97 78 93 Z" fill="#ec4899" />
                            <circle cx="82" cy="89" r="2.5" fill="#fef08a" />
                          </g>

                          {/* Left student (Boy reading) */}
                          <g transform="translate(45, 175)">
                            <path d="M 15 110 Q 30 100 45 110 L 50 180 L 10 180 Z" fill="#3b82f6" />
                            <path d="M 20 110 L 30 120 L 40 110 H 20" fill="#ffffff" />
                            <circle cx="18" cy="180" r="6" fill="#18181b" />
                            <circle cx="42" cy="180" r="6" fill="#18181b" />
                            <circle cx="30" cy="75" r="24" fill="#fff1f2" />
                            <circle cx="22" cy="76" r="2.5" fill="#1e293b" />
                            <circle cx="38" cy="76" r="2.5" fill="#1e293b" />
                            <path d="M 25 83 Q 30 87 35 83" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="18" cy="81" r="3" fill="#fda4af" opacity="0.6" />
                            <circle cx="42" cy="81" r="3" fill="#fda4af" opacity="0.6" />
                            <path d="M 6 75 C 6 35, 54 35, 54 75 Q 54 78 50 82 C 45 68, 35 60, 30 65 Q 25 60, 15 65 C 10 60, 8 72, 6 82" fill="#18181b" />
                            <path d="M 12 115 Q 30 135 48 115" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                            <rect x="20" y="115" width="20" height="15" rx="2" fill="#f59e0b" />
                          </g>

                          {/* Right student (Girl reading) */}
                          <g transform="translate(245, 175)">
                            <path d="M 15 110 Q 30 100 45 110 L 52 180 L 8 180 Z" fill="#fbbf24" />
                            <path d="M 20 110 L 30 120 L 40 110 H 20" fill="#ffffff" />
                            <circle cx="18" cy="180" r="6" fill="#18181b" />
                            <circle cx="42" cy="180" r="6" fill="#18181b" />
                            <circle cx="30" cy="75" r="24" fill="#fff1f2" />
                            <circle cx="21" cy="76" r="2.5" fill="#1e293b" />
                            <circle cx="39" cy="76" r="2.5" fill="#1e293b" />
                            <path d="M 25 83 Q 30 88 35 83" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="17" cy="81" r="3" fill="#fda4af" opacity="0.6" />
                            <circle cx="43" cy="81" r="3" fill="#fda4af" opacity="0.6" />
                            <path d="M 6 75 C 6 35, 54 35, 54 75 Q 54 78 50 82 C 45 68, 35 60, 30 65 Q 25 60, 15 65 C 10 60, 8 72, 6 82" fill="#450a0a" />
                            <path d="M 8 60 Q -5 50 -10 70 Q -8 80 5 70" fill="#450a0a" />
                            <path d="M 52 60 Q 65 50 70 70 Q 68 80 55 70" fill="#450a0a" />
                            <circle cx="6" cy="62" r="3.5" fill="#dc2626" />
                            <circle cx="54" cy="62" r="3.5" fill="#dc2626" />
                            <path d="M 12 115 Q 30 135 48 115" fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
                            <rect x="22" y="116" width="18" height="15" rx="2" fill="#10b981" />
                          </g>

                          {/* Paper airplane, hearts, stars */}
                          <g opacity="0.8">
                            <path d="M 60 70 L 80 65 L 72 78 L 70 73 Z" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            <path d="M 320 60 C 315 55, 310 65, 320 70 C 330 65, 325 55, 320 60 Z" fill="#f472b6" />
                            <path d="M 125 105 Q 130 98 135 105 L 130 113 Z" fill="#fb7185" />
                            <path d="M 275 105 Q 280 98 285 105 L 280 113 Z" fill="#fb7185" />
                            <polygon points="100,50 102,54 106,55 103,58 104,62 100,60 96,62 97,58 94,55 98,54" fill="#fef08a" />
                            <polygon points="290,50 292,54 296,55 293,58 294,62 290,60 286,62 287,58 284,55 288,54" fill="#fef08a" />
                          </g>
                        </svg>
                      </div>
                    )}

                    {/* Cute classroom quote floating ribbon banner below illustration */}
                    <div className="mt-3.5 bg-yellow-50 px-3.5 py-2.5 rounded-2xl border border-amber-200/90 shadow-2xs max-w-[190px] text-center rotate-[-1deg] relative">
                      <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-rose-500 rounded-full w-2 h-2"></div>
                      <p className="text-[10px] font-bold text-amber-900 leading-normal italic" style={{ fontFamily: "'Playpen Sans', cursive" }}>
                        “{quote}”
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Professional Parent invitation information blocks */}
                  <div className="col-span-8 space-y-4 pl-4 text-left border-l border-rose-100/40">
                    
                    {/* The GIẤY MỜI main Title with glorious white border outline & shiny glow bottom-shadow */}
                    <div className="space-y-1.5 text-center">
                      <h3 
                        className="text-[44px] tracking-widest font-sans font-black uppercase inline-block bg-gradient-to-r bg-clip-text text-transparent [paint-order:stroke_fill] [-webkit-text-stroke:5px_white] drop-shadow-[0_4px_10px_rgba(236,72,153,0.38)]"
                        style={{ 
                          backgroundImage: `linear-gradient(to right, ${currentPal.accentColor}, #f43f5e)`,
                          textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff'
                        }}
                      >
                        {title}
                      </h3>
                      
                      {/* Secondary class tag */}
                      <p className="text-xs font-black tracking-wider text-slate-500">
                        PHỤ HUYNH HỌC SINH LỚP: <span className={`text-sm px-2.5 py-0.5 rounded-full ${currentPal.badgeBg} border shadow-2xs font-extrabold ml-1`}>{className}</span>
                      </p>
                    </div>

                    {/* Sub-title ribbon text banner */}
                    <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-pink-100 p-2 rounded-xl text-center shadow-3xs relative my-2">
                      <span className="text-[11.5px] font-black uppercase tracking-wider text-slate-800">
                        {subtitle}
                      </span>
                    </div>

                    {/* Dynamic typed representative name OR formal write-in line state */}
                    <div className="space-y-1 text-center py-1">
                      {isDottedLine ? (
                        <div className="space-y-1">
                          <p className="text-[13px] font-black tracking-wide text-slate-800">
                            Kính mời Ông (Bà): <span className="font-serif italic text-rose-500 font-black">.................................................................................................</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold italic">(Thầy Cô hoặc học sinh có thể ghi tên viết tay trân trọng vào mẫu in)</p>
                        </div>
                      ) : (
                        <p className="text-[13.5px] font-black text-rose-800/90 leading-tight">
                          Kính mời Ông (Bà): <span className="underline decoration-pink-300 font-serif italic text-base font-black px-2 text-slate-900">{parentName}</span>
                        </p>
                      )}
                    </div>

                    {/* Purpose and interactive Detail Rows (Time & Location) */}
                    <div className="bg-white/80 p-3 rounded-2xl border border-rose-100/50 space-y-2.5 shadow-3xs relative">
                      
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tới tham dự:</span>
                        <p className={`text-[12px] font-extrabold ${currentPal.themeTextColor} leading-snug`}>
                          ✨ {subject.toUpperCase()}
                        </p>
                        {purpose && (
                          <p className="text-[10.5px] text-slate-600 font-semibold italic pl-4 border-l-2 border-pink-300/60 mt-0.5 leading-normal">
                            Nội dung: {purpose}
                          </p>
                        )}
                      </div>

                      {/* Info blocks side by side */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        {/* Time box */}
                        <div className="bg-rose-50/40 p-2 rounded-xl border border-rose-50 flex items-start gap-2">
                          <span className="text-xl">⏰</span>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-rose-600/80 uppercase tracking-wider block">Thời Gian</span>
                            <span className="text-[10px] font-bold text-slate-850 leading-relaxed block">{time}</span>
                          </div>
                        </div>

                        {/* Location box */}
                        <div className="bg-rose-50/40 p-2 rounded-xl border border-rose-50 flex items-start gap-2">
                          <span className="text-xl">📍</span>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-rose-600/80 uppercase tracking-wider block">Địa Điểm</span>
                            <span className="text-[10px] font-bold text-slate-850 leading-relaxed block">{location}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                {/* 3. FOOTER ROW: INSPIRATIONAL QUOTE & SIGNATURE DETAILS */}
                <div className="flex md:flex-row justify-between items-end border-t border-rose-100/40 pt-1.5 z-10 text-left">
                  <div className="text-left space-y-1 pl-1 opacity-90">
                    <p className="text-[9.5px] font-sans font-bold text-slate-400">
                      Rất hân hạnh được đón tiếp Quý phụ huynh!
                    </p>
                    <p className="text-[10px] font-serif font-bold text-rose-600/70 italic flex items-center gap-1">
                      <span>🌸</span> Đẹp đẽ - Lịch sự - Thẩm mỹ học sư phạm
                    </p>
                  </div>

                  {/* Cursive cursive stamp signature right aligned matching authentic design */}
                  {isSignatureOn && (
                    <div className="text-center pr-3 space-y-0.5 animate-fade-in min-w-[200px]">
                      <span className="text-[10px] font-black uppercase text-slate-500 block">GIÁO VIÊN CHỦ NHIỆM</span>
                      <span className="text-[9px] text-slate-400 italic block">(Đã ký xác nhận)</span>
                      
                      {/* Interactive signature container */}
                      <div className="h-10 flex items-center justify-center relative py-1">
                        {isCursiveSign ? (
                          <span 
                            className="text-2xl font-black text-rose-600 uppercase transform rotate-[-3deg] select-none scale-105"
                            style={{ fontFamily: "'Great Vibes', cursive" }}
                          >
                            {teacherSign || 'Anh Tuyet'}
                          </span>
                        ) : (
                          <span 
                            className="text-lg font-black text-red-650 opacity-90 scale-110 tracking-widest border border-dashed border-red-200 px-3 rounded-md"
                            style={{ fontFamily: "'Dancing Script', cursive" }}
                          >
                            {teacherSign || 'Tuyet'}
                          </span>
                        )}
                        <span className="absolute bottom-1 right-8 text-[9px] font-black text-red-600/20 uppercase tracking-widest border border-dashed border-red-500/20 px-1 rounded transform rotate-[15deg]">ORIGINAL STAFF</span>
                      </div>

                      <span className="text-[11.5px] font-extrabold text-slate-850 block font-serif">
                        {teacherName}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Action Trigger Buttons for Generating and Printing */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
              ✨ THỰC THI KHỞI TẠO & XUẤT FILE IN ẤN (A4)
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className="py-3 bg-[#1e293b] hover:bg-slate-850 text-white font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                📸 Tải ảnh thư mời PNG (HD/4K)
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="py-3 bg-[#e11d48] hover:bg-rose-700 text-white font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                📄 Tải file in PDF A4 (Ngang)
              </button>
            </div>

            <div className="border-t pt-3 flex flex-col sm:flex-row gap-3 justify-between items-center text-[10.5px] font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-slate-600">
                ⭐ Thư viện xuất: <strong className="font-extrabold text-rose-500">html2canvas + jsPDF</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                ✔️ Định dạng xuất chuẩn 297mm x 210mm tỉ lệ A4
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
