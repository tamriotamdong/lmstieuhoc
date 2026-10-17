import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, SendHorizonal, ChevronDown, ChevronUp } from 'lucide-react';
import { StudentProfile } from '../types';

interface ContactViewProps {
  studentProfile?: StudentProfile | null;
}

export default function ContactView({ studentProfile }: ContactViewProps) {
  const [emotion, setEmotion] = useState<'happy' | 'neutral' | 'sad'>('happy');
  const [parentContact, setParentContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [lastMailto, setLastMailto] = useState('');
  const [lastGmailUrl, setLastGmailUrl] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [lastSentDetails, setLastSentDetails] = useState({ to: 'tamrio.tinhoc@gmail.com', subject: '', body: '' });
  const [openQA, setOpenQA] = useState<number | null>(null);

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField('');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentContact.trim() || !message.trim()) return;

    // Construct pre-filled email to tamrio.tinhoc@gmail.com
    const emailSubject = `[LMS Tin học] Tâm thư góp ý từ học sinh ${studentProfile?.fullname || ''}`;
    const emailBody = `Chào Quản trị viên LMS Tin học,\n\nEm gửi bức tâm thư này qua LMS Tin học:\n\n- Tên học sinh: ${studentProfile?.fullname || 'Học sinh chưa đổi tên'}\n- Trường học: ${studentProfile?.school || 'Chưa đổi trường'}\n- Lớp học: Lớp ${studentProfile?.className || 'Chưa cung cấp lớp'}\n- Địa chỉ Email của em: ${studentProfile?.email || 'Học sinh chưa điền email thông tin cá nhân'}\n- Cảm xúc học tập hôm nay: ${
      emotion === 'happy' ? '😍 Rất vui thích!' : emotion === 'neutral' ? '🙂 Bình thường thôi' : '🙁 Hơi khó nuốt!'
    }\n- Liên hệ của Bố Mẹ: ${parentContact}\n- Nội dung lời nhắn:\n"${message}"\n\nChúc các thầy cô luôn vui khỏe!`;

    const mailtoUrl = `mailto:tamrio.tinhoc@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=tamrio.tinhoc@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    setLastMailto(mailtoUrl);
    setLastGmailUrl(gmailUrl);
    setLastSentDetails({
      to: 'tamrio.tinhoc@gmail.com',
      subject: emailSubject,
      body: emailBody
    });

    // Synchronously open the Gmail Compose page in a new window/tab as requested by the user
    let opened = false;
    try {
      const composeWindow = window.open(gmailUrl, '_blank');
      if (composeWindow) {
        opened = true;
      }
    } catch (err) {
      console.warn("Direct Gmail Web open blocked:", err);
    }

    // Fallback: If it's blocked, try standard mailto location assignment
    if (!opened) {
      try {
        window.location.href = mailtoUrl;
      } catch (err) {
        console.warn("mailto fallback blocked:", err);
      }
    }

    setIsSent(true);
    setParentContact('');
    setMessage('');
  };

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* 1. Header Banner - Pink to Orange Gradient */}
      <div className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] text-white p-7 rounded-[32px] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="bg-white/20 text-white text-[11px] px-3.5 py-0.5 rounded-full font-black uppercase inline-block border border-white/25">
            📢 Gắn kết Yêu thương
          </div>
          <h2 className="text-2xl md:text-3.5xl font-black text-white" style={{ fontFamily: 'var(--font-title)' }}>
            Nhắn Gửi những góp ý đến Quản trị viên!
          </h2>
          <p className="text-xs md:text-sm text-pink-50 font-semibold max-w-2xl leading-relaxed">
            Bé gặp bài tập khó? Hay muốn đóng góp một ý tưởng bài giảng thú vị? Hãy gửi lời nhắn siêu dễ thương của mình tới thầy cô ngay nhé!
          </p>
        </div>
        <span className="text-5xl self-end md:self-auto select-none mt-2 md:mt-0">✉️</span>
      </div>

      {/* 2. Main content columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Thông Tin Nhà Trường */}
        <div className="bg-white rounded-[28px] p-5 border border-gray-150 shadow-sm space-y-4 flex flex-col justify-between" id="school-info-panel">
          <div>
            <h3 className="text-md font-extrabold text-[#1d4ed8] border-b-2 border-blue-500/70 pb-2 mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-title)' }}>
              Thông Tin Liên hệ
            </h3>

            <div className="space-y-3.5">
              {/* Phone entry */}
              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[13px] text-gray-800">Đường dây nóng (Hotline)</h4>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">0898.025.590 (Thầy Tâm Rio)</p>
                </div>
              </div>

              {/* Email entry */}
              <div className="flex gap-3 items-center">
                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[13px] text-gray-800">Thư hỗ trợ học sinh (Email)</h4>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">tamrio.tinhoc@gmail.com</p>
                </div>
              </div>

              {/* Address entry */}
              <div className="flex gap-3 items-start">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[13px] text-gray-800">Địa chỉ liên hệ</h4>
                  <p className="text-xs font-bold text-gray-500 mt-0.5 leading-relaxed">
                    Trường Tiểu học Trần Văn Danh, Xã Đông Thạnh, Thành phố Hồ Chí Minh
                  </p>
                </div>
              </div>

              {/* Thêm mục hỏi đáp ở dưới "Địa chỉ liên hệ" */}
              <div className="border-t border-gray-150 pt-2.5 mt-2 space-y-1.5">
                <h5 className="font-black text-[12px] text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> Hỏi Đáp Nhanh (Q&A)
                </h5>
                <div className="space-y-1 text-[12px] leading-tight">
                  {[
                    {
                      q: "Làm sao gửi email góp ý?",
                      a: "Bé chỉ cần điền đầy đủ cảm xúc, thông tin liên hệ và lời nhắn ở khung bên phải rồi bấm gửi. LMS sẽ tự khởi chạy hoặc cung cấp đường dẫn để bé mở trực tiếp ứng dụng Gmail/Outlook gửi đi cực dễ dàng."
                    },
                    {
                      q: "Bé làm sao tích lũy được nhiều Sao ⭐?",
                      a: "Bé hãy tích cực học trực tuyến hàng ngày, đọc kỹ các bài lý thuyết, trả lời chính xác các câu hỏi Bài tập và thi đấu Trò chơi để gom thật nhiều sao nhé."
                    },
                    {
                      q: "Làm sao thay đổi Thông tin cá nhân?",
                      a: "Bé hãy di chuyển sang mục \"Học sinh\" 👤 ở thanh bên trái, chọn thẻ \"Thông tin cá nhân\". Muốn thay đổi ảnh đại diện hay chọn các khối lớp khác, bé nhấp vào nút \"Đổi Avatar & Lớp\" nhé."
                    }
                  ].map((item, idx) => {
                    const isOpen = openQA === idx;
                    return (
                      <div key={idx} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden leading-tight transition-all duration-200">
                        <button
                          type="button"
                          onClick={() => setOpenQA(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-1.5 px-2.5 text-left font-extrabold text-[#2454A6] hover:bg-slate-100/50 transition cursor-pointer text-[12px]"
                        >
                          <span>Q: {item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-indigo-650 shrink-0 ml-1" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-2.5 pb-2 pt-0.5 text-[12px] font-medium text-gray-500 border-t border-dashed border-gray-150 animate-fade-in leading-normal text-left">
                            A: {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom box - Bạn Biết Chưa? */}
          <div className="bg-[#EFF6FF] p-3 rounded-[22px] border border-blue-100 mt-2 text-left">
            <h4 className="font-extrabold text-[12px] text-blue-800 flex items-center gap-1 uppercase tracking-wide leading-none">
              <span className="text-sm">❓</span> Bạn biết chưa?
            </h4>
            <p className="text-[12px] font-semibold text-blue-700/80 mt-1 leading-normal">
              Tài khoản Học sinh của bé tự lưu trữ dữ liệu an toàn trên hệ thống đám mây. Thầy cô giáo sẽ nhận báo cáo kết quả tự động hàng ngày qua trang quản trị Giáo viên.
            </p>
          </div>
        </div>

        {/* Right column: Bức Thư Nhỏ Gửi Mascot Tin Học */}
        <div className="bg-white rounded-[28px] p-6 border border-gray-150 shadow-sm lg:col-span-2 space-y-5" id="parent-message-form">
          <div className="flex items-center gap-2 border-b pb-3 mb-2">
            <SendHorizonal className="w-5 h-5 text-pink-500" />
            <h3 className="text-md font-extrabold text-[#111827]" style={{ fontFamily: 'var(--font-title)' }}>
              Bức Thư Nhỏ Gửi Admin LMS Tin Học
            </h3>
          </div>

          {isSent && (
            <div className="bg-[#ECFDF5] border-2 border-[#5ED68A] text-slate-800 p-5 rounded-3xl font-bold text-xs space-y-4 animate-fade-in shadow-md">
              <div>
                <p className="font-extrabold text-[15px] text-[#065F46] flex items-center gap-1.5 mb-1">
                  🎉 Soạn thư góp ý thành công!
                </p>
                <p className="text-[#047857] text-[11px] font-semibold leading-relaxed">
                  Vì lý do bảo mật của trình duyệt, email không thể tự ý gửi đi từ máy của em mà không có sự đồng ý của em hoặc bố mẹ. Bé hãy click chọn một trong các cách dễ dàng dưới đây để gửi thư đến hòm thư <strong className="text-emerald-950 font-black">tamrio.tinhoc@gmail.com</strong> nhé:
                </p>
              </div>

              {/* Grid of methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Method 1: Gmail Web client */}
                <div className="bg-red-50/50 hover:bg-red-50 border border-red-200 p-3 rounded-2xl flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-red-600 bg-red-100/60 px-2 py-0.5 rounded font-black uppercase">Cách 1: Tiện lợi</span>
                    <h4 className="font-extrabold text-xs text-red-800 mt-1">Gửi bằng Website Gmail</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Phù hợp khi bé dùng trình duyệt Chrome/Edge và đã đăng nhập tài khoản Google.</p>
                  </div>
                  <a
                    href={lastGmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#EA4335] hover:bg-[#d62f22] text-white font-black text-[11px] py-1.5 px-3 rounded-xl border-b-2 border-red-700 transition tracking-wide text-center uppercase"
                  >
                    🌐 MỞ TRONG WEB GMAIL
                  </a>
                </div>

                {/* Method 2: Default Mail App */}
                <div className="bg-blue-50/50 hover:bg-blue-50 border border-blue-200 p-3 rounded-2xl flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded font-black uppercase">Cách 2: Ứng dụng</span>
                    <h4 className="font-extrabold text-xs text-blue-800 mt-1">Gửi bằng Mail Thiết Bị</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Kích hoạt ứng dụng như Outlook, Apple Mail trên iPad hay Máy tính.</p>
                  </div>
                  <a
                    href={lastMailto}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-black text-[11px] py-1.5 px-3 rounded-xl border-b-2 border-blue-950 transition tracking-wide text-center uppercase"
                  >
                    📧 MỞ NATIVE MAIL APP
                  </a>
                </div>
              </div>

              {/* Method 3: Copy to clipboard */}
              <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded font-black uppercase">Cách 3: Chắc chắn nhất 🌟</span>
                  <h4 className="font-extrabold text-xs text-slate-800 mt-1">Sao chép thông tin để gửi thủ công</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Bé tự mở bất kỳ hộp thư nào của mình, rồi dán (Paste) các thông tin điền sẵn cực kỳ nhanh chóng:</p>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* Copy Email Recipient */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white p-2 border border-slate-200 rounded-xl">
                    <span className="text-gray-400 font-extrabold w-24 shrink-0 text-left">1. Người nhận:</span>
                    <span className="text-slate-800 font-black truncate text-left flex-1 font-mono">tamrio.tinhoc@gmail.com</span>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(lastSentDetails.to, 'to')}
                      className={`px-2.5 py-1 text-[9.5px] font-black rounded-lg border transition shrink-0 cursor-pointer ${
                        copiedField === 'to' ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {copiedField === 'to' ? 'Đã chép! ✔️' : 'Sao chép 📋'}
                    </button>
                  </div>

                  {/* Copy Subject */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white p-2 border border-slate-200 rounded-xl">
                    <span className="text-gray-400 font-extrabold w-24 shrink-0 text-left">2. Tiêu đề thư:</span>
                    <span className="text-slate-800 font-black truncate text-left flex-1 font-sans">{lastSentDetails.subject}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(lastSentDetails.subject, 'subject')}
                      className={`px-2.5 py-1 text-[9.5px] font-black rounded-lg border transition shrink-0 cursor-pointer ${
                        copiedField === 'subject' ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {copiedField === 'subject' ? 'Đã chép! ✔️' : 'Sao chép 📋'}
                    </button>
                  </div>

                  {/* Copy ContentBody */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 bg-white p-2 border border-slate-200 rounded-xl">
                    <span className="text-gray-400 font-extrabold w-24 shrink-0 pt-1 text-left justify-start">3. Lời nhắn:</span>
                    <span className="text-slate-500 font-medium line-clamp-2 text-left flex-1 whitespace-pre-wrap text-[10.5px] bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-0.5 sm:mt-0">{lastSentDetails.body}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(lastSentDetails.body, 'body')}
                      className={`px-2.5 py-1 text-[9.5px] font-black rounded-lg border transition shrink-0 self-center cursor-pointer ${
                        copiedField === 'body' ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {copiedField === 'body' ? 'Đã chép! ✔️' : 'Sao chép 📋'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Close / return button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-black text-[10.5px] py-1 px-3.5 rounded-xl transition cursor-pointer"
                >
                  ↩️ SOẠN THƯ GÓP Ý KHÁC
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Emotion picker block */}
            <div className="space-y-2">
              <span className="block text-xs font-extrabold text-gray-600">
                Cảm xúc học Tin học hôm nay của bé là:
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sentiment Option 1: Happy */}
                <button
                  type="button"
                  onClick={() => setEmotion('happy')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border ${
                    emotion === 'happy'
                      ? 'border-2 border-[#EC4899] bg-[#FFF1F2] text-[#EC4899] scale-[1.02] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  <span className="text-3xl mb-1.5">😍</span>
                  <span className="text-xs font-extrabold">Rất vui thích!</span>
                </button>

                {/* Sentiment Option 2: Neutral */}
                <button
                  type="button"
                  onClick={() => setEmotion('neutral')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border ${
                    emotion === 'neutral'
                      ? 'border-2 border-[#EC4899] bg-[#FFF1F2] text-[#EC4899] scale-[1.02] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  <span className="text-3xl mb-1.5">🙂</span>
                  <span className="text-xs font-extrabold">Bình thường thôi</span>
                </button>

                {/* Sentiment Option 3: Sad */}
                <button
                  type="button"
                  onClick={() => setEmotion('sad')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border ${
                    emotion === 'sad'
                      ? 'border-2 border-[#EC4899] bg-[#FFF1F2] text-[#EC4899] scale-[1.02] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  <span className="text-3xl mb-1.5">🙁</span>
                  <span className="text-xs font-extrabold">Hơi khó nuốt!</span>
                </button>
              </div>
            </div>

            {/* Parent contact block */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700">
                Địa chỉ email hoặc Số điện thoại của Bố Mẹ (Để nhận phản hồi):
              </label>
              <input
                type="text"
                required
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="| Ví dụ: bome@gmail.com, 0987..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:border-pink-400 font-semibold text-xs outline-hidden transition shadow-2xs focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Content block */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700">
                Nội dung lời nhắn bé muốn gửi viết vào đây nhé:
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Thầy cô ơi, giúp con làm bài vẽ tam giác đều trong Scratch lớp 5 với ạ..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:border-pink-400 font-medium text-xs outline-hidden transition shadow-2xs focus:ring-1 focus:ring-pink-400"
              ></textarea>
            </div>

            {/* Submit button bar */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#EC4899] hover:bg-[#D946EF] text-white font-black text-xs py-3.5 px-6 rounded-2xl border-b-4 border-[#C026D3] active:border-b-0 active:translate-y-0.5 tracking-wide transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase"
              >
                Gửi bức tâm thư này đi! ❤️
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* 3. Soft Pink Footer Note */}
      <div className="bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] rounded-[24px] py-4 px-6 text-center text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs">
        <span>✨ Các thầy cô chúc bé luôn chăm ngoan, giữ niềm đam mê nghiên cứu sáng tạo số tuyệt đỉnh nha! ❤️</span>
      </div>

    </div>
  );
}
