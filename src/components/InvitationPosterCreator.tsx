import React, { useState, useRef } from 'react';
import { 
  RotateCcw,
  Download,
  Check,
  Sparkles,
  Printer,
  Clock,
  MapPin,
  Image as ImageIcon,
  Type,
  Calendar,
  Layers,
  Heart,
  Smile
} from 'lucide-react';
import { motion } from 'motion/react';
import { SoundEffects } from '../App';
import { safeHtml2Canvas } from './Utilities';
import { jsPDF } from 'jspdf';

interface UtilProps {
  showToast: (msg: string) => void;
}

export function InvitationPosterCreator({ showToast }: UtilProps) {
  // Shared inputs states
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

  // Styling and template selection
  const [templateId, setTemplateId] = useState<string>('t2');
  const [paletteId, setPaletteId] = useState<'pink' | 'peach' | 'mint' | 'purple'>('pink');
  const [borderStyle, setBorderStyle] = useState<'corners' | 'gold_frame' | 'doodles'>('corners');
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [sigFont, setSigFont] = useState<string>('kingston');

  // Secondary elements requested by the mock prompts
  const [watermarkText, setWatermarkText] = useState('phamphuongchi.com');
  const [bottomMessage, setBottomMessage] = useState('Kính mong quý phụ huynh sắp xếp thời gian đến tham dự đầy đủ và đúng giờ! Trân trọng cảm ơn!');
  const [balloonTexts, setBalloonTexts] = useState<string[]>(['KẾT NỐI', 'CHIA SẺ', 'ĐỒNG HÀNH']);
  const [speechBubble, setSpeechBubble] = useState('Đồng hành – Thấu hiểu – Cùng phát triển');

  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'preset' | 'basic' | 'content' | 'footer'>('preset');

  const TEMPLATES = [
    { id: 't2', name: '✉️ Phấn Hồng & Navy', ratio: '4:3', desc: 'Phục hưng học đường, hoa hồng góc nhã nhặn, chữ đại diện.' },
    { id: 't3', name: '🌈 Sắc Màu Lớp Học', ratio: '4:3', desc: 'Có cờ đuôi nheo, bóng bay chữ nổi, cô giáo nổi bật vàng cam.' },
    { id: 't4', name: '🎨 Màu Nước Nắng Ấm', ratio: '4:3', desc: 'Cổ tích học trò mộc mạc, có tòa nhà trường tiểu học ngói đỏ.' },
    { id: 't7', name: '🧸 Chibi Học Đường 3D', ratio: '4:3', desc: 'Cô giáo cuốn hút với áo dài đỏ và sọc nền pastel mây mỏng.' },
    { id: 't9', name: '💜 Thơ Mộng Tím 3D', ratio: '4:3', desc: 'Cô giáo duyên dáng áo dài trắng tinh khôi, mây trắng bồng bềnh.' },
  ];

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
      titleGrad: 'from-[#db2777] to-[#9d174d]',
      themeTextColor: 'text-rose-950 font-extrabold',
      mottoColor: 'text-rose-950',
      labelColor: 'bg-rose-100 text-rose-950',
      borderColor: 'border-pink-300',
      badgeBg: 'bg-rose-100 text-rose-950 border-rose-400',
      primaryBtn: 'bg-rose-600 hover:bg-rose-700',
      accentColor: '#9d174d',
      flowerBg: '#fda4af',
      leafBg: '#86efac'
    },
    peach: {
      name: 'Cam Đào Ấm Áp',
      bgGrad: 'from-[#fffbf0] to-[#ffdcb3]',
      cardBg: 'from-[#ffffff] to-[#fff6ec]',
      titleGrad: 'from-[#ea580c] to-[#9a3412]',
      themeTextColor: 'text-amber-950 font-extrabold',
      mottoColor: 'text-amber-950',
      labelColor: 'bg-amber-100 text-amber-950',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-100 text-amber-950 border-amber-400',
      primaryBtn: 'bg-orange-600 hover:bg-orange-700',
      accentColor: '#9a3412',
      flowerBg: '#fed7aa',
      leafBg: '#a7f3d0'
    },
    mint: {
      name: 'Xanh Mint Tươi Mát',
      bgGrad: 'from-[#f0fdf4] to-[#ccfbf1]',
      cardBg: 'from-[#ffffff] to-[#f0fdf4]',
      titleGrad: 'from-[#059669] to-[#064e42]',
      themeTextColor: 'text-emerald-950 font-extrabold',
      mottoColor: 'text-emerald-950',
      labelColor: 'bg-emerald-100 text-[#064e42]',
      borderColor: 'border-emerald-300',
      badgeBg: 'bg-emerald-100 text-[#064e42] border-emerald-400',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700',
      accentColor: '#064e42',
      flowerBg: '#a7f3d0',
      leafBg: '#cbd5e1'
    },
    purple: {
      name: 'Oải Hương Thơ Mộng',
      bgGrad: 'from-[#faf5ff] to-[#f3e8ff]',
      cardBg: 'from-[#ffffff] to-[#f5f3ff]',
      titleGrad: 'from-[#7c3aed] to-[#4c1d95]',
      themeTextColor: 'text-[#2e1065] font-extrabold',
      mottoColor: 'text-[#2e1065]',
      labelColor: 'bg-[#f3e8ff] text-[#2e1065]',
      borderColor: 'border-purple-300',
      badgeBg: 'bg-[#f3e8ff] text-[#2e1065] border-purple-400',
      primaryBtn: 'bg-purple-600 hover:bg-purple-700',
      accentColor: '#4c1d95',
      flowerBg: '#d8b4fe',
      leafBg: '#a7f3d0'
    }
  };

  const currentPal = PALETTES[paletteId];

  // When switching a template, we apply defaults to unify but also match prompt visuals
  const applyTemplatePreset = (tid: string) => {
    setTemplateId(tid);
    SoundEffects.playTing();
    
    if (tid === 't2') {
      // Prompt 3
      setPaletteId('pink');
      setBorderStyle('corners');
      setUbnd('ỦY BAN NHÂN DÂN PHƯỜNG TIÊN PHONG');
      setSchool('TRƯỜNG TIỂU HỌC NGUYỄN TRÃI');
      setClassName('4A1');
      setTitle('GIẤY MỜI');
      setSubtitle('Trân trọng kính mời Ông (Bà)');
      setSubject('BUỔI HỌP PHỤ HUYNH HỌC SINH');
      setQuote('Sự đồng hành của Quý phụ huynh là nguồn động lực lớn cho các con!');
      setTeacherName('Cô Nguyễn Ánh Tuyết');
      setTeacherSign('Ánh Tuyết');
      setBottomMessage('Kính mong quý phụ huynh sắp xếp thời gian đến tham dự đầy đủ và đúng giờ! Trân trọng cảm ơn!');
    } else if (tid === 't3') {
      // Prompt 4
      setPaletteId('peach');
      setBorderStyle('doodles');
      setUbnd('ỦY BAN NHÂN DÂN PHƯỜNG HOA MAI');
      setSchool('TRƯỜNG TIỂU HỌC NGUYỄN TRÃI');
      setClassName('4A1');
      setTitle('GIẤY MỜI');
      setSubtitle('TRÂN TRỌNG KÍNH MỜI ÔNG (BÀ)');
      setSubject('BUỔI HỌP PHỤ HUYNH HỌC SINH');
      setQuote('Đồng hành – Thấu hiểu – Cùng phát triển');
      setSpeechBubble('Đồng hành – Thấu hiểu – Cùng phát triển');
      setTeacherName('Cô Nguyễn Ánh Tuyết');
      setTeacherSign('Ánh Tuyết');
      setBottomMessage('Kính mong quý phụ huynh sắp xếp thời gian đến tham dự đầy đủ và đúng giờ! Trân trọng cảm ơn!');
    } else if (tid === 't4') {
      // Prompt 5 & 6
      setPaletteId('mint');
      setBorderStyle('corners');
      setUbnd('ỦY BAN NHÂN DÂN');
      setSchool('TRƯỜNG TIỂU HỌC ĐỨC TRÍ');
      setClassName('3B');
      setTitle('GIẤY MỜI');
      setSubtitle('Trân trọng kính mời!');
      setSubject('BUỔI HỌP PHỤ HUYNH');
      setPurpose('Họp bàn định hướng chiến lược học tập Kỳ II & Tổng kết hoạt động phong trào của lớp');
      setTime('08 giờ 30 phút, ngày 24 tháng 05 năm 2026');
      setLocation('Phòng học lớp 3B, Tầng 2, Nhà Đa Năng');
      setQuote('Kính mong quý phụ huynh sắp xếp thời gian đến tham dự đầy đủ và đúng giờ!');
      setTeacherName('Chi Chi Đồng Hành');
      setTeacherSign('Chi Chi');
      setWatermarkText('phamphuongchi.com');
      setBottomMessage('Kính mong quý phụ huynh sắp xếp thời gian đến tham dự đầy đủ và đúng giờ! Trân trọng cảm ơn!');
    } else if (tid === 't7' || tid === 't9') {
      // Prompt 8, 9, 10
      setPaletteId(tid === 't7' ? 'pink' : 'purple');
      setBorderStyle('corners');
      setUbnd('ỦY BAN NHÂN DÂN');
      setSchool('TRƯỜNG THCS CHÂU QUẾ HẠ');
      setClassName('9A');
      setTitle('GIẤY MỜI');
      setSubtitle('HỌP PHỤ HUYNH CUỐI NĂM');
      setSubject('BUỔI HỌP PHỤ HUYNH CUỐI NĂM');
      setPurpose('Để cùng nhìn lại hành trình học tập và sự trưởng thành của các bé. Sự hiện diện của Quý phụ huynh là niềm vinh dự của nhà trường!');
      setTime('8h30 sáng , Chủ nhật, Ngày 21 tháng 5 năm 2026');
      setLocation('Phòng học lớp 9A, Trường THCS Châu Quế Hạ');
      setQuote('Rất mong nhận được sự quan tâm và tham dự đầy đủ của Quý phụ huynh!');
      setTeacherName('Cô Phạm Thuỷ');
      setTeacherSign('Cô Phạm Thuỷ');
      setBottomMessage('Rất mong nhận được sự quan tâm và tham dự đầy đủ của quý phụ huynh!');
    }
  };

  const handleExportPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    SoundEffects.playTing();
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      const canvas = await safeHtml2Canvas(posterRef.current, {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `thu_moi_hop_phu_huynh_lop_${className.replace(/\s+/g, '') || 'a4'}.png`;
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
      if (document.fonts) {
        await document.fonts.ready;
      }
      const canvas = await safeHtml2Canvas(posterRef.current, {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 280; // horizontal fit inside A4 landscape page width beautifully
      const pdfHeight = 210; // full fits height
      const pdf = new jsPDF('l', 'mm', 'a4');
      const xOffset = (297 - pdfWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, 0, pdfWidth, pdfHeight);
      pdf.save(`thu_moi_hop_phu_huynh_${className.replace(/\s+/g, '') || '4_3'}.pdf`);
      showToast("📄 Đã xuất bản file PDF A4 4:3 chất lượng cao sẵn sàng để in!");
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
    setTemplateId('t2');
    setSigFont('kingston');
    SoundEffects.playTing();
    showToast("🔄 Khôi phục giao diện thư mời mẫu thành công!");
  };

  // Determine width and height class based on ratio: all templates changed to 4:3 ratio exactly
  const aspectClass = "w-[800px] h-[600px]";

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* HTML Font imports to inject beautifully styled fonts to Canvas */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Playpen+Sans:wght@700&family=Pacifico&family=Pinyon+Script&family=Montserrat:wght@900&family=Playfair+Display:ital,wght@0,700;1,700&family=Caveat:wght@700&family=Fredoka:wght@600&family=Alex+Brush&family=Sacramento&display=swap');
          
          .font-kingston { font-family: 'Alex Brush', 'Times New Roman', Georgia, cursive, serif; }
          .font-hamstring { font-family: 'Dancing Script', 'Times New Roman', Georgia, cursive, serif; }
          .font-janelotus { font-family: 'Great Vibes', 'Times New Roman', Georgia, cursive, serif; }
          
          .font-playpen { font-family: 'Times New Roman', Times, serif; }
          .font-pacifico { font-family: 'Times New Roman', Times, serif; }
          .font-montserrat { font-family: 'Times New Roman', Times, serif; }
          .font-playfair { font-family: 'Times New Roman', Times, serif; }
          .font-fredoka { font-family: 'Times New Roman', Times, serif; }
          
          .rainbow-text {
            background-image: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7, #ec4899);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: 950;
          }
          
          .mint-text {
            color: #064e42;
          }
          .gold-title {
            color: #d97706;
            text-shadow: 2px 2px 0px #fff, -2px -2px 0px #fff;
          }
        `}
      </style>

      {/* Description header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="space-y-1">
          <h4 className="text-base font-black text-pink-600 uppercase tracking-wider flex items-center gap-2">
            ✉️ CÔNG CỤ TẠO THƯ MỜI HỌP PHỤ HUYNH CHUYÊN NGHIỆP
          </h4>
          <p className="text-[11px] text-slate-500 font-semibold leading-normal">
            Trình thiết kế trực quan hỗ trợ Thầy Cô tạo giấy mời họp phụ huynh mầm non, tiểu học, trung học. Xuất PNG HD hoặc PDF in ấn khổ A4 ngang.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> ĐẶT LẠI MẪU 🔄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: EDITABLE CONTROLS FORM */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-5 shadow-xs max-h-[820px] overflow-y-auto text-left">
          
          {/* Tabs for easy forms organization */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setActiveTab('preset'); SoundEffects.playTing(); }}
              className={`flex-1 py-2 text-center text-xs font-black border-b-2 transition-all ${
                activeTab === 'preset' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🎨 Mẫu Đẹp
            </button>
            <button
              onClick={() => { setActiveTab('basic'); SoundEffects.playTing(); }}
              className={`flex-1 py-1.5 text-center text-xs font-black border-b-2 transition-all ${
                activeTab === 'basic' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🏢 Trường Học
            </button>
            <button
              onClick={() => { setActiveTab('content'); SoundEffects.playTing(); }}
              className={`flex-1 py-1.5 text-center text-xs font-black border-b-2 transition-all ${
                activeTab === 'content' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ✍️ Nội Dung
            </button>
            <button
              onClick={() => { setActiveTab('footer'); SoundEffects.playTing(); }}
              className={`flex-1 py-1.5 text-center text-xs font-black border-b-2 transition-all ${
                activeTab === 'footer' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ✒️ Chữ Ký
            </button>
          </div>

          {/* TAB 1: PRESET STYLES & TEMPLATE SELECTOR */}
          {activeTab === 'preset' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                  🌟 CHỌN MẪU THƯ MỜI CHUYÊN BIỆT (TỶ LỆ CHUẨN 4:3)
                </label>
                <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplatePreset(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                        templateId === t.id 
                          ? 'border-pink-400 bg-pink-50/70 shadow-sm ring-2 ring-pink-300' 
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900">{t.name}</span>
                          <span className="px-1.5 py-0.5 bg-slate-200/60 rounded text-[9px] font-bold text-slate-600">{t.ratio}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight font-medium">{t.desc}</p>
                      </div>
                      <div className="flex items-center">
                        {templateId === t.id ? (
                          <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">✓</span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-slate-300 bg-white"></span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aesthetic presets */}
              <div className="space-y-2 border-t pt-3">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  🎨 TÔNG MÀU CHỦ ĐẠO (ĐỔI NHANH HOA VĂN)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setPaletteId(key);
                        SoundEffects.playTing();
                      }}
                      className={`p-2 rounded-xl border text-left text-xs font-black transition-all flex flex-col justify-between cursor-pointer ${
                        paletteId === key 
                          ? 'border-slate-930 bg-white shadow-xs ring-2 ring-slate-900/10' 
                          : 'border-slate-200 bg-slate-100 hover:bg-white text-slate-600'
                      }`}
                    >
                      <span className="text-[11px] font-extrabold">{PALETTES[key].name}</span>
                      <div className="flex gap-1 mt-1">
                        <span className="w-4.5 h-4.5 rounded-full bg-rose-100 border text-[9px] flex items-center justify-center">🌸</span>
                        <span className="w-4.5 h-4.5 rounded-full bg-orange-100 border text-[9px] flex items-center justify-center">🔸</span>
                        <span className="w-4.5 h-4.5 rounded-full bg-emerald-100 border text-[9px] flex items-center justify-center">🍃</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Frame Styles selection */}
              <div className="space-y-2 border-t pt-3">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  🏞️ KIỂU KHUNG VIỀN TRANG TRÍ (A4 FRAME STYLE)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'corners', name: '🌸 Góc Hoa Sữa' },
                    { id: 'gold_frame', name: '👑 Khung Thần Tiên' },
                    { id: 'doodles', name: '🎒 Doodle Lớp Học' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setBorderStyle(style.id as any);
                        SoundEffects.playTing();
                      }}
                      className={`py-2 px-1 rounded-lg border text-center text-[10px] font-black transition cursor-pointer ${
                        borderStyle === style.id 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BASIC ADMINISTRATIVE INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-3.5 bg-white p-3.5 rounded-2xl border border-slate-100 animate-fade-in text-xs">
              <h5 className="text-[11px] font-black text-rose-600 uppercase border-b pb-1 flex items-center gap-1">
                🏢 THÔNG TIN HÀNH CHÍNH TRƯỜNG LỚP
              </h5>
              
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">1. UBND Xã / Huyện chủ quản:</span>
                <input
                  type="text"
                  value={ubnd}
                  onChange={(e) => setUbnd(e.target.value.toUpperCase())}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-slate-900 uppercase"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">2. Tên Trường Tiểu học / THCS:</span>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value.toUpperCase())}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-slate-900 uppercase"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">3. Tên lớp học:</span>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1 border-t pt-2.5">
                <span className="text-[10px] font-black text-slate-500 uppercase">5. Quốc hiệu (Dòng 1):</span>
                <input
                  type="text"
                  value={motto1}
                  onChange={(e) => setMotto1(e.target.value.toUpperCase())}
                  className="w-full text-[10px] p-2 border border-slate-250 rounded-lg text-slate-800 focus:outline-none uppercase"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">6. Tiêu ngữ độc lập (Dòng 2):</span>
                <input
                  type="text"
                  value={motto2}
                  onChange={(e) => setMotto2(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: POSTR CONTENT AND TIMES */}
          {activeTab === 'content' && (
            <div className="space-y-3.5 bg-white p-3.5 rounded-2xl border border-slate-100 animate-fade-in text-xs">
              <h5 className="text-[11px] font-black text-rose-600 uppercase border-b pb-1">
                ✍️ CHI TIẾT NỘI DUNG GIẤY MỜI
              </h5>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Tựa đề lớn:</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-250 rounded-lg font-black text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Tựa biểu ngữ phụ:</span>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-250 rounded-lg font-bold text-slate-850 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Mời Phụ huynh đích danh:</span>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-blue-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDottedLine}
                      onChange={(e) => {
                        setIsDottedLine(e.target.checked);
                        SoundEffects.playTing();
                      }}
                      className="cursor-pointer font-bold"
                    />
                    <span>Chừa trống kẻ tay</span>
                  </label>
                </div>
                
                {!isDottedLine && (
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Hùng"
                    className="w-full text-xs p-2 border border-pink-300 rounded-lg text-slate-800 focus:outline-none animate-fade-in"
                  />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Chủ nhật/Mục đích (Subject):</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Mô tả nội vụ buổi họp:</span>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg text-slate-800 focus:outline-none leading-normal"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Thời gian họp chính thức:</span>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Địa điểm (Phòng học):</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MOCK QUOTE & SIGNATURE DETAILS */}
          {activeTab === 'footer' && (
            <div className="space-y-3.5 bg-white p-3.5 rounded-2xl border border-slate-100 animate-fade-in text-xs">
              <h5 className="text-[11px] font-black text-rose-600 uppercase border-b pb-1">
                ✒️ LỜI CHÚC & CHỮ KÝ GIÁO VIÊN
              </h5>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">1. Lời nhắn truyền cảm hứng (quote):</span>
                <select
                  value={quote}
                  onChange={(e) => {
                    setQuote(e.target.value);
                    SoundEffects.playTing();
                  }}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg bg-slate-50 focus:outline-none"
                >
                  {QUOTE_PRESETS.map((q, i) => (
                    <option key={i} value={q}>{q}</option>
                  ))}
                  <option value="custom">-- Tự nhập lời nhắn khác --</option>
                </select>
                {(quote === 'custom' || !QUOTE_PRESETS.includes(quote)) && (
                  <textarea
                    value={quote === 'custom' ? '' : quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Nhập lời nhắn gửi riêng thương yêu..."
                    rows={2}
                    className="w-full text-xs p-2 border border-amber-300 rounded-lg text-slate-800 focus:outline-none mt-1 shadow-2xs"
                  />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">2. Thư dặn dò cuối thư (Bottom Note):</span>
                <textarea
                  value={bottomMessage}
                  onChange={(e) => setBottomMessage(e.target.value)}
                  placeholder="Nhập lời dặn dò..."
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-250 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-2 border-t pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Họ tên GVCN:</span>
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
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Tên chữ ký (Cursive):</span>
                        <input
                          type="text"
                          value={teacherSign}
                          onChange={(e) => setTeacherSign(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-250 rounded-lg text-rose-600 font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Họ tên đầy đủ:</span>
                        <input
                          type="text"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-250 rounded-lg text-slate-800 font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Kiểu font chữ ký giáo viên:</span>
                      <select
                        value={sigFont}
                        onChange={(e) => {
                          setSigFont(e.target.value);
                          SoundEffects.playTing();
                        }}
                        className="w-full text-xs p-2 border border-slate-250 rounded-lg bg-slate-100 hover:bg-white text-slate-700 font-black focus:outline-none focus:border-slate-900 transition-colors cursor-pointer"
                      >
                        <option value="kingston">✍️ TQ Kingston (Cổ điển bay bổng)</option>
                        <option value="hamstring">🖋️ SVN Hamstring (Thanh lịch tự nhiên)</option>
                        <option value="janelotus">🌸 SVN Janelotus (Uốn lượn quý phái)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Alternative Picture file upload or link input */}
              <div className="space-y-2 border-t pt-2.5">
                <span className="text-[10px] font-black text-slate-500 uppercase block">
                  📸 TỰ THAY THẾ ẢNH CHI BI / AO DÀI:
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-xl py-3 px-2 bg-pink-50/20 cursor-pointer transition-all hover:bg-pink-50/50">
                      <span className="text-[11px] font-black text-pink-600 flex items-center gap-1.5 justify-center">
                        📂 Chọn ảnh từ thiết bị...
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setCustomImgUrl(reader.result);
                                SoundEffects.playTing();
                                showToast("📸 Đã tải ảnh lên thành công!");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {customImgUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomImgUrl('');
                          SoundEffects.playTing();
                          showToast("🗑️ Đã xóa ảnh tự chọn!");
                        }}
                        className="px-3 py-3 bg-red-100 hover:bg-red-200 text-red-750 font-black rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 block mb-1">Hoặc dán Link URL ảnh trực tuyến:</span>
                    <input
                      type="text"
                      value={customImgUrl.startsWith('data:') ? '' : customImgUrl}
                      onChange={(e) => setCustomImgUrl(e.target.value)}
                      placeholder="Dán link ảnh (https://...) nếu có..."
                      className="w-full text-[11px] p-2 border border-slate-250 rounded-lg focus:outline-none text-slate-650"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANEL: LIVE PREVIEW IN STANDARD RATIO CONTAINER */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              👁️ MÀU SẮC THỂ HIỆN THỰC TẾ TRÊN KHỔ GIẤY A4 HOẶC 4:3, 3:2
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded border uppercase">
              Tỷ lệ: {TEMPLATES.find(t=>t.id === templateId)?.ratio}
            </span>
          </div>

          {/* Container supporting scale previews or scrolling */}
          <div className="w-full overflow-x-auto pb-4 rounded-3xl border border-slate-200 p-2 bg-slate-100">
            {/* The Landscape Live Poster Div */}
            <div
              id="print-area"
              ref={posterRef}
              className={`min-w-[800px] rounded-[28px] relative overflow-hidden bg-gradient-to-br p-6 border-4 transition-all duration-300 ${aspectClass} ${currentPal.bgGrad} ${currentPal.borderColor} select-none shadow-xl`}
              style={{
                boxSizing: 'border-box',
                fontFamily: "'Times New Roman', Times, serif"
              }}
            >
              
              {/* FLOATING DECORATIONS ACCORDING TO TEMPLATE */}
              {/* Top Corners Flowers for T1 & T2 */}
              {(templateId === 't1' || templateId === 't2' || templateId === 't4' || templateId === 't5' || templateId === 't6') && borderStyle === 'corners' && (
                <>
                  <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none z-10 opacity-90">
                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                      <circle cx="15" cy="15" r="10" fill={currentPal.flowerBg} />
                      <circle cx="28" cy="15" r="8" fill="#ffffff" opacity="0.8" />
                      <circle cx="15" cy="28" r="8" fill="#ffffff" opacity="0.8"/>
                      <circle cx="24" cy="24" r="9" fill={currentPal.accentColor} />
                      <circle cx="20" cy="20" r="3" fill="#fef08a" />
                      <path d="M 15 50 Q 8 68 20 80" stroke={currentPal.flowerBg} strokeWidth="2" fill="none" />
                      <path d="M 50 15 Q 68 8 80 20" stroke={currentPal.flowerBg} strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none z-10 opacity-90 scale-x-[-1]">
                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                      <circle cx="15" cy="15" r="10" fill={currentPal.flowerBg} />
                      <circle cx="28" cy="15" r="8" fill="#ffffff" opacity="0.8" />
                      <circle cx="15" cy="28" r="8" fill="#ffffff" opacity="0.8" />
                      <circle cx="24" cy="24" r="9" fill={currentPal.accentColor} />
                      <circle cx="20" cy="20" r="3" fill="#fef08a" />
                      <path d="M 15 50 Q 8 68 20 80" stroke={currentPal.flowerBg} strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </>
              )}

              {/* Colorful MINI FLAGS (Prompt 4 style) */}
              {(templateId === 't3') && (
                <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none z-20 flex justify-between px-16">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const colors = ['bg-[#ff6b6b]', 'bg-[#feca57]', 'bg-[#1dd1a1]', 'bg-[#54a0ff]', 'bg-[#ff9ff3]', 'bg-[#5f27cd]'];
                    return (
                      <div 
                        key={i} 
                        className={`w-6 h-8 ${colors[i % colors.length]} rounded-b-full shadow-xs transform origin-top rotate-[2deg] -translate-y-1 border border-white/55`}
                        style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Blue bows, leaves, mây trắng on T7, T8, T9 (3:2 Prompt 8, 9, 10 style) */}
              {(templateId === 't7' || templateId === 't8' || templateId === 't9') && (
                <>
                  {/* Blue bows on top corners */}
                  <div className="absolute top-4 left-4 z-20 pointer-events-none text-blue-500 scale-125">🎀</div>
                  <div className="absolute top-4 right-4 z-20 pointer-events-none text-blue-500 scale-125 scale-x-[-1]">🎀</div>
                  {/* Decorative clouds */}
                  <div className="absolute top-10 left-28 opacity-45 pointer-events-none text-2xl">🇺🇳☁️</div>
                  <div className="absolute top-6 right-36 opacity-45 pointer-events-none text-2xl">☁️</div>
                  <div className="absolute bottom-20 left-10 opacity-30 pointer-events-none text-xl">☁️</div>
                </>
              )}

              {/* CARD CONTAINER WRAPPER WITH DECORATIVE FRAMING */}
              <div 
                className={`w-full h-full bg-gradient-to-br ${currentPal.cardBg} rounded-2xl flex flex-col justify-between p-5 relative overflow-hidden ${
                  borderStyle === 'gold_frame' 
                    ? 'border-4 border-[#d97706] border-double shadow-inner' 
                    : borderStyle === 'doodles' 
                    ? 'border-4 border-dashed border-pink-200 shadow-inner' 
                    : 'border-2 border-slate-200/40 shadow-inner'
                }`}
              >
                
                {/* 1. STATEFUL ADMINISTRATIVE TOP LINE */}
                <div className="flex justify-between items-start border-b border-rose-100/40 pb-1.5 z-10">
                  <div className="space-y-0.5 text-center flex flex-col items-center justify-start flex-1">
                    <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wide leading-tight break-words max-w-[280px]">
                      {ubnd}
                    </p>
                    <p className={`text-[11.5px] font-extrabold uppercase tracking-wide ${currentPal.themeTextColor} leading-tight break-words max-w-[280px]`}>
                      {school}
                    </p>
                    <div className="w-16 h-0.5 bg-rose-300/65 mt-0.5 rounded-full"></div>
                  </div>
                  
                  {/* School Year badge removed as per request */}

                  <div className="space-y-0.5 text-center flex flex-col items-center justify-start flex-1">
                    <p className="text-[9.5px] font-black text-slate-800 tracking-wider leading-tight uppercase break-words max-w-[280px]">
                      {motto1}
                    </p>
                    <p className="text-[10px] font-bold text-slate-600 leading-tight italic tracking-wide break-words max-w-[280px]">
                      {motto2}
                    </p>
                    <div className="w-20 h-0.5 bg-rose-300 opacity-60 mt-0.5 rounded-full"></div>
                  </div>
                </div>

                {/* 2. BODY GRID VIEW */}
                <div className="grid grid-cols-12 gap-4 items-center flex-1 my-2 z-10 text-left">
                  
                  {/* Left Column: Chibi anime illustrations */}
                  <div className="col-span-4 flex flex-col items-center justify-center relative">
                    {customImgUrl ? (
                      <div className="w-[180px] h-[180px] rounded-[32px] overflow-hidden border-4 border-white shadow-md bg-rose-50/50 flex items-center justify-center">
                        <img 
                          src={customImgUrl} 
                          alt="Custom Hoa"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      /* RENDER BEAUTIFUL SVG VECTOR ILLUSTRATIONS FOR DIRECTIVE PROMPTS */
                      <div className="w-[190px] h-[190px] hover:scale-105 transition-transform duration-300">
                        <svg viewBox="0 0 400 400" className="w-full h-full max-h-[290px]" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="200" cy="200" r="160" fill={paletteId === 'pink' ? 'url(#pinkG)' : paletteId === 'peach' ? 'url(#peachG)' : paletteId === 'mint' ? 'url(#mintG)' : 'url(#purpleG)'} opacity="0.22" />
                          <defs>
                            <linearGradient id="pinkG" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="100%" stopColor="#f43f5e" />
                            </linearGradient>
                            <linearGradient id="peachG" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#ea580c" />
                            </linearGradient>
                            <linearGradient id="mintG" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <linearGradient id="purpleG" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                            
                            {/* 3D clay-render gradients */}
                            <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
                              <stop offset="0%" stopColor="#ffeee8" />
                              <stop offset="85%" stopColor="#ffd3c4" />
                              <stop offset="100%" stopColor="#fca790" />
                            </radialGradient>
                            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#451a03" />
                              <stop offset="40%" stopColor="#311100" />
                              <stop offset="100%" stopColor="#1a0600" />
                            </linearGradient>
                            <linearGradient id="eyeShine" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="100%" stopColor="#cbd5e1" />
                            </linearGradient>
                            <filter id="soft3DShadow" x="-10%" y="-10%" width="120%" height="120%">
                              <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.25" />
                            </filter>
                          </defs>

                          {/* Render School Building in Background for watercolor Mẫu 4 */}
                          {(templateId === 't4') && (
                            <g transform="translate(10, 80)" opacity="0.45" filter="url(#soft3DShadow)">
                              {/* Central School Building with Gold Roof / Green Roof */}
                              <rect x="100" y="80" width="180" height="120" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="4" />
                              <polygon points="90,80 290,80 190,30" fill="#b91c1c" />
                              {/* National flag */}
                              <rect x="185" y="10" width="3" height="25" fill="#64748b" />
                              <rect x="188" y="10" width="15" height="10" fill="#dc2626" />
                              <polygon points="195,15 196,17 199,17 197,18 198,20 195,19 192,20 193,18 191,17 194,17" fill="#facc15" />
                              {/* Windows */}
                              <rect x="120" y="100" width="30" height="25" fill="#bae6fd" rx="2" />
                              <rect x="230" y="100" width="30" height="25" fill="#bae6fd" rx="2" />
                              {/* Main door */}
                              <rect x="175" y="140" width="30" height="60" fill="#e2e8f0" />
                              {/* Trees around */}
                              <circle cx="60" cy="150" r="28" fill="#15803d" />
                              <circle cx="330" cy="150" r="28" fill="#15803d" />
                              <rect x="54" y="160" width="12" height="40" fill="#78350f" />
                              <rect x="324" y="160" width="12" height="40" fill="#78350f" />
                            </g>
                          )}

                          {/* TEACHER CHARACTER */}
                          <g transform="translate(140, 50)" filter="url(#soft3DShadow)">
                            {/* Hair back */}
                            <path d="M 40 40 Q 12 60 18 135 Q 22 165 32 195" fill="url(#hairGrad)" />
                            <path d="M 80 40 Q 108 60 102 135 Q 98 165 88 195" fill="url(#hairGrad)" />
                            
                            <path d="M 28 178 Q 15 240, 10 320" fill="#fbcfe8" opacity="0.3"/>
                            <path d="M 92 178 Q 105 240, 110 320" fill="#fbcfe8" opacity="0.3"/>

                            {/* Ao dai body with Colors mapped by Prompts */}
                            {/* T3 is bright orange, T7 is red, T9 is white, others are soft pink */}
                            <path 
                              d="M 30 160 Q 60 152 90 160 L 115 320 L 5 320 Z" 
                              fill={
                                templateId === 't3' ? '#ea580c' : 
                                templateId === 't7' ? '#ef4444' : 
                                templateId === 't9' ? '#f4f4f5' : '#ec4899'
                              } 
                              stroke={templateId === 't9' ? '#cbd5e1' : 'none'}
                              strokeWidth={1.5}
                            />
                            <path 
                              d="M 48 145 Q 60 155 72 145 L 60 162 Z" 
                              fill={templateId === 't9' ? '#e4e4e7' : '#ffd1d1'} 
                            />

                            {/* White pants */}
                            <path d="M 33 315 L 43 335 L 53 315 Z" fill="#ffffff" />
                            <path d="M 67 315 L 77 335 L 87 315 Z" fill="#ffffff" />

                            {/* Hands & holding green books naturally as per watercolor storybook prompt */}
                            <path 
                              d="M 32 165 C 10 190, 5 210, 15 225 C 22 230, 28 220, 25 210" 
                              fill={
                                templateId === 't3' ? '#ea580c' : 
                                templateId === 't7' ? '#ef4444' : 
                                templateId === 't9' ? '#f4f4f5' : '#ec4899'
                              } 
                            />
                            <path 
                              d="M 88 165 C 110 190, 115 210, 105 225 C 98 230, 92 220, 95 210" 
                              fill={
                                templateId === 't3' ? '#ea580c' : 
                                templateId === 't7' ? '#ef4444' : 
                                templateId === 't9' ? '#f4f4f5' : '#ec4899'
                              } 
                            />
                            
                            <circle cx="18" cy="223" r="6" fill="#ffd3c4" />
                            <circle cx="102" cy="223" r="6" fill="#ffd3c4" />
                            
                            {/* Books - Green books for watercolor prompt */}
                            <rect 
                              x="34" y="210" width="52" height="34" rx="4" 
                              fill={(templateId === 't4') ? '#059669' : '#3b82f6'} 
                              stroke={(templateId === 't4') ? '#064e3b' : '#1d4ed8'} 
                              strokeWidth="1.5" 
                            />
                            <line x1="60" y1="210" x2="60" y2="244" stroke="#ffffff" strokeWidth="1.5" />
                            
                            {/* Face details */}
                            <rect x="52" y="128" width="16" height="20" fill="url(#faceGrad)" />
                            <circle cx="60" cy="112" r="30" fill="url(#faceGrad)" />
                            
                            {/* Sparkling 3D kawaii eyes */}
                            <circle cx="48" cy="111" r="5" fill="#1e293b" />
                            <circle cx="47" cy="109" r="2" fill="url(#eyeShine)" />
                            <circle cx="49" cy="113" r="1" fill="#ffffff" />
                            
                            <circle cx="72" cy="111" r="5" fill="#1e293b" />
                            <circle cx="71" cy="109" r="2" fill="url(#eyeShine)" />
                            <circle cx="73" cy="113" r="1" fill="#ffffff" />
                            
                            <path d="M 43 103 Q 48 97 53 103" fill="none" stroke="#100806" strokeWidth="2" strokeLinecap="round" />
                            <path d="M 67 103 Q 72 97 77 103" fill="none" stroke="#100806" strokeWidth="2" strokeLinecap="round" />
                            
                            {/* Cute blushing cheeks */}
                            <circle cx="42" cy="118" r="4.5" fill="#ff6b8b" opacity="0.65" />
                            <circle cx="78" cy="118" r="4.5" fill="#ff6b8b" opacity="0.65" />
                            <path d="M 55 120 Q 60 125 65 120" fill="none" stroke="#9d174d" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Hair front */}
                            <path d="M 28 110 C 28 48, 92 48, 92 110 Q 92 113 90 120 C 85 110, 80 95, 60 98 C 45 95, 35 110, 30 120" fill="url(#hairGrad)" />
                            <circle cx="82" cy="85" r="4.5" fill="#f43f5e" />
                          </g>

                          {/* LEFT SIDE CHIBI BOY */}
                          <g transform="translate(45, 175)" filter="url(#soft3DShadow)">
                            <path d="M 15 110 Q 30 100 45 110 L 50 180 L 10 180 Z" fill="#2563eb" />
                            <path d="M 20 110 L 30 120 L 40 110 H 20" fill="#ffffff" />
                            {/* red scarf */}
                            <polygon points="26,110 30,123 34,110" fill="#dc2626" />
                            <polygon points="30,121 24,136 32,130" fill="#dc2626" />
                            <circle cx="18" cy="180" r="6" fill="#18181b" />
                            <circle cx="42" cy="180" r="6" fill="#18181b" />
                            
                            <circle cx="30" cy="75" r="24" fill="url(#faceGrad)" />
                            
                            {/* Twinkly child eyes */}
                            <circle cx="21" cy="76" r="4.5" fill="#1f2937" />
                            <circle cx="20" cy="74" r="1.8" fill="#ffffff" />
                            <circle cx="22" cy="78" r="0.8" fill="#ffffff" />
                            
                            <circle cx="39" cy="76" r="4.5" fill="#1f2937" />
                            <circle cx="38" cy="74" r="1.8" fill="#ffffff" />
                            <circle cx="40" cy="78" r="0.8" fill="#ffffff" />
                            
                            <path d="M 25 83 Q 30 87 35 83" fill="none" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="17" cy="81" r="4" fill="#ff6b8b" opacity="0.6" />
                            <circle cx="43" cy="81" r="4" fill="#ff6b8b" opacity="0.6" />
                            
                            {/* Hair */}
                            <path d="M 6 75 C 6 35, 54 35, 54 75 Q 54 78 50 82 C 45 68, 35 60, 30 65 Q 25 60, 15 65 C 10 60, 8 72, 6 82" fill="#1e1b4b" />
                            <path d="M 12 115 Q 30 135 48 115" fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                            <rect x="20" y="115" width="20" height="15" rx="2" fill="#d97706" />
                          </g>

                          {/* RIGHT SIDE CHIBI GIRL */}
                          <g transform="translate(245, 175)" filter="url(#soft3DShadow)">
                            <path d="M 15 110 Q 30 100 45 110 L 52 180 L 8 180 Z" fill="#ea580c" />
                            <path d="M 20 110 L 30 120 L 40 110 H 20" fill="#ffffff" />
                            {/* red scarf */}
                            <polygon points="26,110 30,123 34,110" fill="#dc2626" />
                            <circle cx="18" cy="180" r="6" fill="#18181b" />
                            <circle cx="42" cy="180" r="6" fill="#18181b" />
                            
                            <circle cx="30" cy="75" r="24" fill="url(#faceGrad)" />
                            
                            {/* Twinkly girl eyes */}
                            <circle cx="21" cy="76" r="4.5" fill="#1f2937" />
                            <circle cx="20" cy="74" r="1.8" fill="#ffffff" />
                            <circle cx="22" cy="78" r="0.8" fill="#ffffff" />
                            
                            <circle cx="39" cy="76" r="4.5" fill="#1f2937" />
                            <circle cx="38" cy="74" r="1.8" fill="#ffffff" />
                            <circle cx="40" cy="78" r="0.8" fill="#ffffff" />
                            
                            <path d="M 25 83 Q 30 88 35 83" fill="none" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="17" cy="81" r="4" fill="#ff6b8b" opacity="0.6" />
                            <circle cx="43" cy="81" r="4" fill="#ff6b8b" opacity="0.6" />
                            
                            {/* Hair */}
                            <path d="M 6 75 C 6 35, 54 35, 54 75 Q 54 78 50 82 C 45 68, 35 60, 30 65 Q 25 60, 15 65 C 10 60, 8 72, 6 82" fill="#4c0519" />
                            <circle cx="6" cy="62" r="3.5" fill="#db2777" />
                            <circle cx="54" cy="62" r="3.5" fill="#db2777" />
                            <path d="M 12 115 Q 30 135 48 115" fill="none" stroke="#eab308" strokeWidth="8" strokeLinecap="round" />
                            <rect x="22" y="116" width="18" height="15" rx="2" fill="#059669" />
                          </g>

                          {/* Decorative stars, paper airplanes and doodles */}
                          <g opacity="0.85">
                            <path d="M 60 70 L 80 65 L 72 78 L 70 73 Z" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            <circle cx="320" cy="70" r="7" fill="#ec4899" />
                            <circle cx="80" cy="140" r="5" fill="#10b981" />
                            <polygon points="100,45 102,49 106,50 103,53 104,57 100,55 96,57 97,53 94,50 98,49" fill="#eab308" />
                            <polygon points="290,45 292,49 296,50 293,53 294,57 290,55 286,57 287,53 284,50 288,49" fill="#eab308" />
                          </g>
                        </svg>
                      </div>
                    )}

                    {/* Speech bubble / quote display below illustration */}
                    {quote && (
                      <div className="mt-3 bg-white/90 px-3 py-2 rounded-2xl border border-amber-200/95 shadow-sm max-w-[190px] text-center rotate-[-1deg] relative z-10 w-full">
                        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full w-2 h-2"></div>
                        <p className="text-[10.5px] font-bold text-amber-900 leading-normal italic">
                          “{quote}”
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Professional Invitation details */}
                  <div className="col-span-8 space-y-2.5 pl-3 text-left border-l border-rose-100/40 relative flex flex-col justify-center">
                    
                    {/* GIẤY MỜI MAIN TITLE WITH DYNAMIC STYLING CHOSEN BY TEMPLATES */}
                    <div className="text-center w-full flex flex-col items-center justify-center">
                      {templateId === 't3' ? (
                        /* Prompt 4 Rainbow 3D styled title - modified to prevent html2canvas background-clip bugs */
                        <h3 
                          className="text-4xl font-extrabold uppercase tracking-wider text-[#e11d48] py-1 inline-block"
                          style={{ 
                            fontFamily: "'Times New Roman', Times, serif",
                            textShadow: '2px 2px 0px #fef08a, -1px -1px 0px #fff'
                          }}
                        >
                          {title} 🎨
                        </h3>
                      ) : templateId === 't7' ? (
                        /* Prompt 8 Gold yellow uppercase style header - Bỏ chữ "HỌP PHỤ HUYNH CUỐI NĂM HỌC" bên dưới */
                        <h3 
                          className="text-[38px] tracking-wider font-extrabold uppercase gold-title py-1 inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                          style={{ fontFamily: "'Times New Roman', Times, serif" }}
                        >
                          {title}
                        </h3>
                      ) : templateId === 't9' ? (
                        /* Prompt 10 Thơ mộng tím 3D - Bỏ chữ "HỌP PHỤ HUYNH CUỐI NĂM HỌC" bên dưới */
                        <h3 
                          className="text-[40px] tracking-wider font-black py-1 inline-block text-[#581c87]"
                          style={{ fontFamily: "'Times New Roman', Times, serif" }}
                        >
                          {title}
                        </h3>
                      ) : templateId === 't2' ? (
                        /* Phấn hồng và Navy - Đổi màu chữ "giấy mời" sang Navy sang trọng */
                        <h3 
                          className="text-[40px] tracking-wider font-black uppercase inline-block text-[#172554] drop-shadow-[0_2px_4px_rgba(23,37,84,0.1)] py-1"
                          style={{ 
                            fontFamily: "'Times New Roman', Times, serif",
                            textShadow: '1px 1px 0px #fff, -1px -1px 0px #fff'
                          }}
                        >
                          {title}
                        </h3>
                      ) : templateId === 't4' ? (
                        /* Màu nước nắng ấm - Đổi màu chữ "giấy mời" sang màu nắng ấm / đỏ gạch ấm áp */
                        <h3 
                          className="text-[40px] tracking-wider font-black uppercase inline-block text-[#b91c1c] drop-shadow-[0_2px_4px_rgba(185,28,28,0.1)] py-1"
                          style={{ 
                            fontFamily: "'Times New Roman', Times, serif",
                            textShadow: '1px 1px 0px #fff, -1px -1px 0px #fff'
                          }}
                        >
                          {title}
                        </h3>
                      ) : (
                        /* Default Classic gradient beautiful title */
                        <h3 
                          className="text-[40px] tracking-wider font-black uppercase inline-block bg-gradient-to-r bg-clip-text text-transparent [paint-order:stroke_fill] [-webkit-text-stroke:4px_white] drop-shadow-[0_4px_8px_rgba(236,72,153,0.3)]"
                          style={{ 
                            backgroundImage: `linear-gradient(to right, ${currentPal.accentColor}, #f43f5e)`,
                            textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff',
                            fontFamily: "'Times New Roman', Times, serif"
                          }}
                        >
                          {title}
                        </h3>
                      )}
                      
                      {/* Secondary class tag - centered flex wrapper */}
                      <p className="text-[11px] font-black tracking-wider text-slate-500 mt-1 uppercase flex items-center justify-center gap-1">
                        PHỤ HUYNH HỌC SINH LỚP: <span className={`text-[12.5px] px-3.5 py-0.5 rounded-full ${currentPal.badgeBg} border shadow-2xs font-extrabold flex items-center justify-center`}>{className}</span>
                      </p>
                    </div>
 
                    {/* Subtitle / Under Title display - centered perfectly for HTML2Canvas */}
                    <div className="w-full bg-gradient-to-r from-rose-50/70 via-pink-50/70 to-rose-50/70 border border-pink-100/50 p-1.5 rounded-xl flex items-center justify-center shadow-3xs text-center">
                      <span className="text-[12.5px] font-bold uppercase tracking-wider text-slate-850 block w-full text-center">
                        {subtitle}
                      </span>
                    </div>

                    {/* Parent specificity dotted write-in line OR typed state */}
                    {!isDottedLine && parentName && (
                      <div className="text-center py-0.5 w-full">
                        <p className="text-[13px] font-black text-rose-900 leading-tight">
                          Kính mời Ông (Bà): <span className="underline decoration-pink-300 font-serif italic text-[14.5px] font-black px-2 text-slate-900">{parentName}</span>
                        </p>
                      </div>
                    )}

                    {/* Purpose, Time, Location Box */}
                    <div className="bg-white/95 p-2.5 rounded-2xl border border-rose-100/40 space-y-1.5 shadow-3xs relative w-full">
                      <div className="space-y-0.5 animate-fade-in text-left">
                        <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Tới tham dự:</span>                      
                      {/* Secondary class tag */}
                      <p className={`text-[12px] font-extrabold ${currentPal.themeTextColor} leading-tight`}>
                        ✨ {subject.toUpperCase()}
                      </p>
                      {purpose && (
                        <p className="text-[10px] text-rose-950 font-bold italic pl-2.5 border-l-2 border-pink-400 mt-1 leading-relaxed break-words whitespace-normal bg-orange-50/15 py-0.5 rounded">
                          Nội dung họp: {purpose}
                        </p>
                      )}
                    </div>

                      {/* Info block grids */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        {/* Time box design */}
                        <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-50/50 flex items-start gap-1.5">
                          <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[8.5px] font-bold text-rose-600 uppercase block tracking-wider">Thời Gian</span>
                            <span className="text-[9.5px] font-bold text-slate-800 leading-tight block">{time}</span>
                          </div>
                        </div>

                        {/* Location box design */}
                        <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-50/50 flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[8.5px] font-bold text-emerald-600 uppercase block tracking-wider">Địa Điểm</span>
                            <span className="text-[9.5px] font-bold text-slate-800 leading-tight block">{location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side Balloon Labels (Prompt 4 specific colorful keywords) */}
                    {(templateId === 't3') && (
                      <div className="absolute right-[-15px] top-[140px] flex flex-col gap-1.5 opacity-90 scale-90 z-20 pointer-events-none">
                        {balloonTexts.map((txt, i) => {
                          const colors = ['bg-rose-400 text-white border-rose-500', 'bg-emerald-400 text-white border-emerald-500', 'bg-blue-400 text-white border-blue-500'];
                          return (
                            <div key={i} className={`px-2 py-0.5 rounded-full border text-[8px] font-black tracking-widest uppercase shadow-xs ${colors[i % colors.length]} text-center rotate-[4deg]`}>
                              🎈 {txt}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                </div>

                {/* 3. FOOTER ROW: ADMONITIONS & SIGNATURES */}
                <div className="flex justify-between items-end border-t border-rose-100/30 pt-2 z-10 text-left">
                  <div className="text-left space-y-1 pl-1 max-w-[480px]">
                    <p className="text-[10px] font-bold text-slate-700 leading-tight">
                      {bottomMessage}
                    </p>
                  </div>

                  {/* Teacher signed certification stamp */}
                  {isSignatureOn && (
                    <div className="text-center pr-3 space-y-0.5 min-w-[210px]">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">GIÁO VIÊN CHỦ NHIỆM</span>
                      <span className="text-[8px] text-slate-400 italic block">(Đã ký xác nhận)</span>
                      
                      {/* Cursive text area */}
                      <div className="h-10 flex items-center justify-center relative">
                        <span 
                          className={`text-3.5xl text-[#0b3c8f] transform rotate-[-2deg] select-none scale-105 ${
                            sigFont === 'kingston' ? 'font-kingston' : 
                            sigFont === 'hamstring' ? 'font-hamstring' : 
                            sigFont === 'janelotus' ? 'font-janelotus' : 'font-kingston'
                          }`}
                          style={{
                            fontWeight: 'normal',
                            textShadow: '0.5px 0.5px 0px rgba(11,60,143,0.1)'
                          }}
                        >
                          {teacherSign || 'Ánh Tuyết'}
                        </span>
                        <span className="absolute bottom-0 right-4 text-[8px] font-black text-red-600/10 uppercase tracking-widest border border-dashed border-red-500/15 px-1 rounded transform rotate-[12deg] select-none pointer-events-none">STAFF ONLY</span>
                      </div>

                      <span className="text-[11px] font-black text-slate-800 block font-serif">
                        {teacherName}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Action Trigger Buttons for PDFs */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              ✨ THỰC THI KHỞI TẠO & XUẤT TẬP TIN IN ẤN CHUẨN
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className="py-3 bg-[#1e293b] hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            <div className="border-t pt-3 flex flex-col sm:flex-row gap-3 justify-between items-center text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-slate-600">
                ⭐ Thư viện vẽ: <strong className="font-extrabold text-pink-600">html2canvas + jsPDF</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                ✔️ Bảo lưu tỷ lệ gốc ({aspectClass.includes('594px') ? 'A4 1.414:1' : aspectClass.includes('600px') ? '4:3' : '3:2'}) tránh nhòe chữ!
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
