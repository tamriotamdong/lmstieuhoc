import React, { useState } from 'react';
import { Award, BookOpen, Clock, Download, Home, Info, Share2, Sparkles, Check, X } from 'lucide-react';
import { generateStudentExamPDFHtml, printExamPDF } from '../utils/pdfGenerator';
import { motion } from 'motion/react';

interface ShareReportViewProps {
  shareReportId: string;
}

export default function ShareReportView({ shareReportId }: ShareReportViewProps) {
  const [copied, setCopied] = useState(false);

  // Load report from local storage
  const reports = JSON.parse(localStorage.getItem('lms_completed_pdf_reports') || '[]');
  const report = reports.find((r: any) => r.id === shareReportId);

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-md border border-slate-200 shadow-xl space-y-4">
          <div className="text-5xl">🔍🕵️‍♂️</div>
          <h2 className="text-xl font-extrabold text-blue-950">Không tìm thấy bảng điểm</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Báo cáo kết quả kiểm tra này không tồn tại trên thiết bị hiện tại hoặc đã bị xóa. Vui lòng kiểm tra lại liên kết liên kết chia sẻ của em nhé!
          </p>
          <button 
            onClick={() => { window.location.href = window.location.pathname; }}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition shadow-3xs cursor-pointer"
          >
            Trở về màn hình chính
          </button>
        </div>
      </div>
    );
  }

  const { studentName, studentClass, score, testName, subject, grade, completedAt, examObj, answers } = report;
  const qList = examObj?.questions || [];

  const handleShare = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const htmlContent = generateStudentExamPDFHtml(
      examObj,
      answers,
      score,
      studentName,
      studentClass
    );
    printExamPDF(htmlContent);
  };

  const getAccuracy = () => {
    let correctCount = 0;
    qList.forEach((q: any) => {
      const studentAns = answers[q.id] !== undefined ? String(answers[q.id]) : "";
      const correctAnswer = q.correctAnswer ? String(q.correctAnswer) : "";
      
      let isCorrect = false;
      if (q.type === 'multiple_choice') {
        isCorrect = studentAns.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
      } else {
        const normStudent = (studentAns || "").trim().toLowerCase().replace(/\s+/g, '');
        const normCorrect = (correctAnswer || "").trim().toLowerCase().replace(/\s+/g, '');
        isCorrect = normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "");
      }
      if (isCorrect) correctCount++;
    });
    return { correctCount, totalCount: qList.length };
  };

  const { correctCount, totalCount } = getAccuracy();

  return (
    <div className="min-h-screen bg-[#F0F4FC] py-8 px-4 sm:px-6 lg:px-8 font-sans select-text">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Floating Actions */}
        <div className="flex justify-between items-center bg-white/70 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/40 shadow-sm">
          <button 
            onClick={() => { window.location.href = window.location.pathname; }}
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ LMS</span>
          </button>
          <div className="flex gap-2 text-xs">
            <button 
              onClick={handleShare}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer shadow-3xs ${copied ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Đã sao chép!' : 'Chia sẻ kết quả'}</span>
            </button>
            <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black flex items-center gap-1 transition shadow-sm cursor-pointer border-b-2 border-rose-900"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất PDF điểm</span>
            </button>
          </div>
        </div>

        {/* Master Card Header */}
        <div className="bg-gradient-to-br from-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-indigo-900">
          <div className="absolute right-0 top-0 text-white/5 font-black text-9xl pointer-events-none select-none translate-x-12 translate-y-2">
            IC3
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase">
                Khảo Thí Số Học Sinh Tiểu Học v22
              </span>
              <span className="bg-yellow-400 text-indigo-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Kết quả chính thức
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">{subject || 'Tin học'} Lớp {grade || 3}</span>
              <h1 className="text-xl sm:text-2xl font-black mt-1 leading-snug">{testName}</h1>
            </div>

            <div className="border-t border-white/10 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
              <div className="space-y-0.5">
                <div className="text-blue-200/80 text-[10px] uppercase font-black">Họ tên thí sinh</div>
                <div className="text-white text-sm font-extrabold">{studentName}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-blue-200/80 text-[10px] uppercase font-black">Lớp khảo thí</div>
                <div className="text-white text-sm font-extrabold">{studentClass}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-blue-200/80 text-[10px] uppercase font-black">Thời gian nộp bài</div>
                <div className="text-white text-sm font-extrabold">{completedAt}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-blue-200/80 text-[10px] uppercase font-black">Sách giáo khoa</div>
                <div className="text-yellow-200 text-sm font-extrabold">{examObj?.curriculumBook || examObj?.bookSeries || 'Cánh Diều'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score & Evaluation Bento Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Circular Score display */}
          <div className="bg-white rounded-3xl p-6 border border-slate-205 shadow-2xs flex flex-col items-center justify-center text-center space-y-3">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Điểm số tự động</div>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="64" cy="64" r="50" 
                  className="stroke-slate-100 fill-none" 
                  strokeWidth="10" 
                />
                <circle 
                  cx="64" cy="64" r="50" 
                  className="stroke-emerald-500 fill-none transition-all duration-1000" 
                  strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 10)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 font-serif leading-none">{score}</span>
                <span className="text-[11px] font-bold text-slate-400 mt-0.5">trên 10đ</span>
              </div>
            </div>
            <span className="text-slate-500 text-[11px] font-black">{correctCount}/{totalCount} câu chính xác</span>
          </div>

          {/* Academic comments */}
          <div className="bg-white rounded-3xl p-6 border border-slate-205 shadow-2xs md:col-span-2 text-left flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 justify-between">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Đánh giá năng lực học viện</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-lg ${
                  score >= 9.0 ? 'bg-emerald-100 text-emerald-850 border-emerald-300' :
                  score >= 7.0 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  score >= 5.0 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {score >= 7.0 ? 'Hoàn thành Tốt' : score >= 5.0 ? 'Hoàn thành' : 'Chưa hoàn thành'}
                </span>
              </div>
              <h3 className="font-extrabold text-[#1E3A8A] text-sm flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500 animate-bounce" /> Nhận xét chi tiết học thuật:
              </h3>
              <p className="text-slate-700 text-xs leading-relaxed font-semibold italic bg-blue-50/40 p-3 rounded-2xl border border-blue-100/50">
                "{score >= 9.0 
                  ? "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết và thực hành xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo." 
                  : score >= 7.0 
                  ? "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm, kỹ năng thực hành tốt, tích cực và chủ động trong các hoạt động học tập." 
                  : score >= 5.0 
                  ? "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập thực hành nhiều hơn." 
                  : "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm và kỹ năng thực hành cơ bản, cần được hướng dẫn rèn luyện thêm."
                }"
              </p>
            </div>
            
            <div className="text-[10px] font-black text-slate-500 border-t border-slate-100 pt-2.5">
              💡 <span className="text-indigo-950">Kế hoạch cải thiện:</span> {score >= 9.0 ? 'Tiếp tục rèn luyện giáo trình nâng cao' : 'Ôn tập học liệu trọng tâm phòng máy & Làm lại đề lý thuyết.'}
            </div>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-205 shadow-2xs space-y-6 text-left">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <h2 className="text-md font-black text-indigo-950 flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Bản Phân Tích Hãy Học Tập Chi Tiết
            </h2>
            <span className="text-[11px] text-slate-400 font-bold">Menu Đề Thi Online</span>
          </div>

          <div className="space-y-6">
            {qList.map((q: any, idx: number) => {
              const studentAns = answers[q.id] !== undefined ? String(answers[q.id]) : "Chưa trả lời";
              const correctAnswer = q.correctAnswer ? String(q.correctAnswer) : "";
              
              let isCorrect = false;
              if (q.type === 'multiple_choice') {
                isCorrect = studentAns.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
              } else {
                const normStudent = (studentAns || "").trim().toLowerCase().replace(/\s+/g, '');
                const normCorrect = (correctAnswer || "").trim().toLowerCase().replace(/\s+/g, '');
                isCorrect = normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "");
              }

              return (
                <div 
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 space-y-3 ${
                    isCorrect 
                      ? 'bg-emerald-50/20 border-emerald-100 shadow-3xs' 
                      : 'bg-rose-50/20 border-rose-100 shadow-3xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-black text-indigo-500 block">
                        Câu hỏi {idx + 1} • {q.points || 0.5} điểm
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {q.questionText}
                      </h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-0.5 shrink-0 select-none ${
                      isCorrect 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isCorrect ? <Check className="w-3 h-3 stroke-2" /> : <X className="w-3 h-3 stroke-2" />}
                      <span>{isCorrect ? 'Đúng' : 'Chưa đúng'}</span>
                    </span>
                  </div>

                  {/* Rendering options with color indications */}
                  {q.type === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {['A', 'B', 'C', 'D'].map((letter) => {
                        const idxKey = ['A', 'B', 'C', 'D'].indexOf(letter);
                        const optionText = Array.isArray(q.options) ? q.options[idxKey] : q.options[letter];
                        if (!optionText) return null;

                        const isStudentChoice = studentAns.trim().toUpperCase() === letter;
                        const isCorrectChoice = correctAnswer.trim().toUpperCase() === letter;

                        let style = "bg-white border-slate-200 text-slate-800";
                        if (isCorrectChoice) {
                          style = "bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold shadow-3xs";
                        } else if (isStudentChoice) {
                          style = "bg-rose-50 border-rose-300 text-rose-950 font-extrabold shadow-3xs";
                        }

                        return (
                          <div 
                            key={letter}
                            className={`p-3 rounded-xl border text-xs flex items-center gap-2 select-none ${style}`}
                          >
                            <span className={`w-5 h-5 rounded-md font-black text-[10px] flex items-center justify-center ${
                              isCorrectChoice 
                                ? 'bg-emerald-600 text-white' 
                                : isStudentChoice 
                                ? 'bg-rose-600 text-white' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {letter}
                            </span>
                            <span className="flex-1 flex justify-between items-center gap-1">
                              <span>{optionText}</span>
                              {isCorrectChoice && <span className="text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded text-[8px] font-black">đáp án đúng</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Written Answers block */}
                  {q.type !== 'multiple_choice' && (
                    <div className="bg-white p-3 rounded-xl border border-slate-201 text-xs space-y-1">
                      <div className="flex flex-wrap gap-x-4">
                        <span className="font-bold text-slate-500">Bài làm học sinh:</span>
                        <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{studentAns || "(Trống)"}</strong>
                      </div>
                      {!isCorrect && (
                        <div className="flex flex-wrap gap-x-4 border-t border-dashed border-slate-100 pt-1 mt-1">
                          <span className="font-bold text-slate-500">Đáp án chính xác:</span>
                          <strong className="text-emerald-700">{correctAnswer}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Answer Guide */}
                  {q.answerGuide && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-[11px] leading-relaxed text-slate-600">
                      <strong className="text-amber-800 text-[9.5px] uppercase block mb-1">🔑 Hướng giải học thuật:</strong>
                      {q.answerGuide}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
