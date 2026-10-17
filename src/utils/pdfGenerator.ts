// pdfGenerator.ts
// Beautiful, robust PDF generator mimicking the modern "Xem trước PDF" interface exactly.

const cleanPrefixText = (str: string): string => {
  if (!str) return '';
  let cleaned = str.trim();
  const regex = /^\s*([A-Da-d0-9]\s*[\.\:\-\)\u2013\u2014]\s*)+/;
  while (regex.test(cleaned)) {
    cleaned = cleaned.replace(regex, '').trim();
  }
  return cleaned;
};

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

import { generateStudentExamWordHtml } from './wordGenerator';

export function generateStudentExamPDFHtml(
  examObj: any,
  currentAnswers: Record<string, string>,
  currentScore: number,
  currentStudentName: string,
  currentStudentClass: string
): string {
  const htmlBody = generateStudentExamWordHtml(
    examObj,
    currentAnswers,
    currentScore,
    currentStudentName,
    currentStudentClass,
    "01"
  );
  return wrapHtmlWithPremiumPrintStyles(htmlBody, `KetQua_KhảoThi_${(currentStudentName || "HocSinh").replace(/\s+/g, "_")}`);
}

// Generate compiled class scorecard PDF (Cover sheet statistics + all students detail reports with page breaks)
export function generateClassSubmissionsPDFHtml(activeReportExam: any, className: string): string {
  if (!activeReportExam) return "<h1>Không có đề thi</h1>";
  
  const subs = activeReportExam.submissions || [];
  const filteredSubs = className === 'all' ? subs : subs.filter((s: any) => s.studentClass === className);
  
  const nowStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Calculate high level metrics
  const totalSubmissions = filteredSubs.length;
  const avgScore = totalSubmissions > 0 
    ? (filteredSubs.reduce((acc: number, cur: any) => acc + (Number(cur.score) || 0), 0) / totalSubmissions).toFixed(1)
    : "0.0";
    
  let excellentCount = 0;
  let goodCount = 0;
  let passCount = 0;
  let failCount = 0;
  
  filteredSubs.forEach((s: any) => {
    const sc = Number(s.score) || 0;
    if (sc >= 9.0) excellentCount++;
    else if (sc >= 7.0) goodCount++;
    else if (sc >= 5.0) passCount++;
    else failCount++;
  });

  let tbodyHtml = "";
  if (filteredSubs.length === 0) {
    tbodyHtml = `
      <tr>
        <td colspan="5" class="table-empty-message">
          Chưa có học sinh nào nộp bài ở bộ lọc này.
        </td>
      </tr>
    `;
  } else {
    filteredSubs.forEach((s: any, idx: number) => {
      const scoreNum = Number(s.score) || 0;
      let rating = "Chưa hoàn thành";
      let badgeClass = "badge-rating-red";
      if (scoreNum >= 9.0) {
        rating = "Hoàn thành xuất sắc";
        badgeClass = "badge-rating-green";
      } else if (scoreNum >= 7.0) {
        rating = "Hoàn thành tốt";
        badgeClass = "badge-rating-blue";
      } else if (scoreNum >= 5.0) {
        rating = "Hoàn thành";
        badgeClass = "badge-rating-amber";
      }

      tbodyHtml += `
        <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-alt'}">
          <td style="text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
          <td style="font-weight: bold; color: #1e293b;">${s.studentName}</td>
          <td style="text-align: center; font-weight: bold; color: #4f46e5;">${s.studentClass}</td>
          <td style="text-align: center; font-weight: 800; color: #be123c; font-size: 13px;">${s.score}/${s.totalMax || activeReportExam.matrixTotalScore || 10}</td>
          <td style="text-align: center;"><span class="badge-rating ${badgeClass}">${rating}</span></td>
        </tr>
      `;
    });
  }

  // Cover Sheet Content
  let coversheetHtml = `
    <div class="coversheet-page">
      <div class="header-container">
        <div class="header-left">
          SỞ GIÁO DỤC VÀ ĐÀO TẠO VIỆT NAM<br/>
          <strong>HẬU CẦN KHẢO THÍ SỐ LMS</strong><br/>
          <span class="separator">-----</span>
        </div>
        <div class="header-right">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
          <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
          <span class="separator">-----</span>
        </div>
      </div>

      <div class="title-container" style="margin-top: 40px; margin-bottom: 20px;">
        <h1 class="main-title">BÁO CÁO THỐNG KÊ KẾT QUẢ KHẢO THÍ ONLINE</h1>
        <p class="main-subtitle" style="font-size: 14pt; margin-top: 6px;">ĐỀ THI: ${activeReportExam.testName.toUpperCase()}</p>
        <p style="font-size: 10.5pt; color: #64748b; font-style: italic; margin-top: 4px;">Lớp xuất báo cáo: ${className === 'all' ? 'Tất cả các lớp' : 'Lớp ' + className}</p>
      </div>

      <!-- Statistics summary boxes -->
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-num">${totalSubmissions}</div>
          <div class="stat-label">Tổng lượt nộp bài</div>
        </div>
        <div class="stat-box">
          <div class="stat-num text-theme-blue">${avgScore}</div>
          <div class="stat-label">Điểm số trung bình</div>
        </div>
        <div class="stat-box">
          <div class="stat-num text-theme-green">${excellentCount}</div>
          <div class="stat-label">Số HS Xuất sắc (≥ 9đ)</div>
        </div>
        <div class="stat-box">
          <div class="stat-num text-theme-orange">${failCount}</div>
          <div class="stat-label">Số HS Chưa hoàn thành</div>
        </div>
      </div>

      <div class="card" style="margin-top: 30px;">
        <h4 class="card-heading" style="margin-bottom: 12px; background-color: #f1f5f9; padding: 10px 14px; border-radius: 8px;">Danh sách kết quả tổng hợp học sinh</h4>
        <table class="grid-table summary-table">
          <thead>
            <tr>
              <th style="width: 7%; text-align: center;">STT</th>
              <th style="width: 38%;">Họ và tên thí sinh</th>
              <th style="width: 15%; text-align: center;">Lớp học</th>
              <th style="width: 18%; text-align: center;">Điểm đạt được</th>
              <th style="width: 22%; text-align: center;">Đánh giá Thông tư 27</th>
            </tr>
          </thead>
          <tbody>
            ${tbodyHtml}
          </tbody>
        </table>
      </div>

      <!-- coversheet signature -->
      <div class="signatures-wrapper" style="margin-top: 50px;">
        <div class="signature-col">
          BỘ PHẬN THỐNG KÊ LMS<br/>
          <span class="sig-note">(Ký tên kỹ thuật số)</span><br/><br/><br/><br/>
          <strong>Hệ Thống Phân Tích Học Tập</strong>
        </div>
        <div class="signature-col text-right">
          GIÁO VIÊN CHỦ NHIỆM / HIỆU TRƯỞNG<br/>
          <span class="sig-note">(Duyệt, ký tên đóng dấu điện tử)</span><br/><br/><br/><br/>
          <strong>Phòng Khảo Thí Tiểu Học</strong>
        </div>
      </div>
    </div>
  `;

  // Compile detailed pages for each student sequentially!
  let detailedSheetsHtml = "";
  if (filteredSubs.length > 0) {
    filteredSubs.forEach((studentSub: any) => {
      const qList = activeReportExam.questions || [];
      let stuQuestionsHtml = "";
      
      qList.forEach((q: any, idx: number) => {
        const studentAns = studentSub.answers[q.id] !== undefined ? String(studentSub.answers[q.id]) : "Chưa trả lời";
        const correctAnswer = q.correctAnswer ? String(q.correctAnswer) : "";
        
        let isCorrect = false;
        if (q.type === 'multiple_choice') {
          isCorrect = studentAns.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
        } else if (q.type === 'true_false' || q.type === 'matching') {
          const normStudent = normalizeAnsCheck(studentAns);
          const normCorrect = normalizeAnsCheck(correctAnswer);
          isCorrect = normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "");
        } else if (q.type === 'gap_fill') {
          const studentWords = studentAns.trim().toLowerCase().replace(/\s+/g, ' ');
          const correctWords = correctAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
          isCorrect = studentWords === correctWords || correctWords.includes(studentWords);
        }

        let optionsHtml = "";
        if (q.type === 'multiple_choice' && q.options) {
          const optKeys = ['A', 'B', 'C', 'D'];
          optionsHtml = `<div class="option-grid">`;
          optKeys.forEach(letter => {
            const idxKey = optKeys.indexOf(letter);
            const optVal = Array.isArray(q.options) ? q.options[idxKey] : q.options[letter];
            if (optVal) {
              const isStudentChoice = studentAns.trim().toUpperCase() === letter;
              const isCorrectChoice = correctAnswer.trim().toUpperCase() === letter;
              
              let choiceClass = "option-box";
              let badgeHtml = "";
              
              if (isStudentChoice) {
                if (isCorrectChoice) {
                  choiceClass += " option-correct";
                  badgeHtml = `<span class="badge-pill badge-pill-green">Lựa chọn của em & Đúng</span>`;
                } else {
                  choiceClass += " option-incorrect";
                  badgeHtml = `<span class="badge-pill badge-pill-red">Lựa chọn của em & Chưa chính xác</span>`;
                }
              } else if (isCorrectChoice) {
                choiceClass += " option-correct-dashed";
                badgeHtml = `<span class="badge-pill badge-pill-green-dashed">Đáp án chuẩn</span>`;
              }
              
              optionsHtml += `
                <div class="${choiceClass}">
                  <div class="option-content">
                    <span class="option-letter">${letter}</span>
                    <span class="option-text">${cleanPrefixText(optVal)}</span>
                  </div>
                  ${badgeHtml}
                </div>
              `;
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
          correctAnswer.split(",").forEach(part => {
            const [lbl, val] = part.split("-");
            if (lbl && val) {
              correctTfObj[lbl.trim().toUpperCase()] = val.trim();
            }
          });

          const statements = (Array.isArray(q.statements) ? q.statements : (q.statements ? Object.values(q.statements) : []));

          optionsHtml = `
            <table class="grid-table">
              <thead>
                <tr valign="middle" style="vertical-align: middle !important;">
                  <th valign="middle" style="vertical-align: middle !important;">Phát biểu học liệu</th>
                  <th valign="middle" style="text-align: center; width: 120px; vertical-align: middle !important;">Học sinh chọn</th>
                  <th valign="middle" style="text-align: center; width: 120px; vertical-align: middle !important;">Đáp án chuẩn</th>
                </tr>
              </thead>
              <tbody>`;

          statements.forEach((st: any, sidx: number) => {
            const letter = st.label || ['A', 'B', 'C', 'D'][sidx];
            const chosenVal = studentTfObj[letter.toUpperCase()] || "Chưa chọn";
            const correctVal = correctTfObj[letter.toUpperCase()] || "Chưa xác định";
            const isStCorrect = chosenVal.toLowerCase() === correctVal.toLowerCase();

            let choiceSpan = "";
            if (chosenVal === "Chưa chọn") {
              choiceSpan = `<span class="text-gray">Chưa chọn</span>`;
            } else if (isStCorrect) {
              choiceSpan = `<span class="text-correct">✔️ Đúng: ${chosenVal}</span>`;
            } else {
              choiceSpan = `<span class="text-incorrect">❌ Sai: ${chosenVal}</span>`;
            }

            const correctSpan = `<span class="text-correct">✔️ ${correctVal}</span>`;

            optionsHtml += `
              <tr valign="middle" style="vertical-align: middle !important;">
                <td valign="middle" style="vertical-align: middle !important;"><strong>${letter}.</strong> ${st.text || ''}</td>
                <td valign="middle" style="text-align: center; font-weight: bold; vertical-align: middle !important;">${choiceSpan}</td>
                <td valign="middle" style="text-align: center; font-weight: bold; vertical-align: middle !important;">${correctSpan}</td>
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
          const correctAnsRaw = correctAnswer || "";
          correctAnsRaw.split(",").forEach(part => {
            const [leftId, rightId] = part.split("-");
            if (leftId && rightId) {
              correctAnswersObj[leftId.trim()] = rightId.trim();
            }
          });

          optionsHtml = `
            <table class="grid-table">
              <thead>
                <tr valign="middle" style="vertical-align: middle !important;">
                  <th valign="middle" style="width: 40%; vertical-align: middle !important;">Cột A (Vế trái)</th>
                  <th valign="middle" style="text-align: center; width: 140px; vertical-align: middle !important;">Học sinh ghép</th>
                  <th valign="middle" style="width: 40%; vertical-align: middle !important;">Cột B (Vế phải)</th>
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
                ? `<span class="text-correct">✔️ ${leftPair.id} - ${chosenMatchId}</span>`
                : `<span class="text-incorrect">❌ ${leftPair.id} - ${chosenMatchId}</span><br/><span style="color: #16a34a; font-size: 8.5pt;">Đáp án: ${leftPair.id}-${correctMatchId}</span>`;
            } else {
              matchIndicator = `<span class="text-gray">Chưa ghép</span><br/><span style="color: #16a34a; font-size: 8.5pt;">Đáp án: ${leftPair.id}-${correctMatchId}</span>`;
            }

            optionsHtml += `
              <tr valign="middle" style="vertical-align: middle !important;">
                <td valign="middle" style="vertical-align: middle !important;"><strong>${leftPair.id}.</strong> ${cleanPrefixText(leftPair.left)}</td>
                <td valign="middle" style="text-align: center; font-weight: bold; width: 140px; vertical-align: middle !important;">${matchIndicator}</td>
                <td valign="middle" style="vertical-align: middle !important;"><strong>${rightPair.id_match || rightPair.id}.</strong> ${cleanPrefixText(rightPair.right)}</td>
              </tr>
            `;
          });
          optionsHtml += `</tbody></table>`;
        } else if (q.type === 'gap_fill') {
          optionsHtml = `
            <div class="gap-fill-container">
              <span class="gap-fill-pill ${isCorrect ? 'gap-fill-correct' : 'gap-fill-incorrect'}">
                ${isCorrect ? '✔️ Trả lời chuẩn: ' : '❌ Trả lời: '} ${studentAns || "(Trống)"}
              </span>
              ${!isCorrect ? `<div style="margin-top: 8px; font-size: 10pt; color: #15803d;">💡 Đáp án học liệu chuẩn xác: <strong class="text-correct-block">${correctAnswer}</strong></div>` : ''}
            </div>
          `;
        }

        stuQuestionsHtml += `
          <div class="question-card">
            <div class="question-header">
              <div class="question-title">
                <span class="question-num-tag">Câu ${idx + 1}:</span> ${cleanPrefixText(q.questionText)}
                <span class="question-meta-points">(${q.points || (10 / qList.length).toFixed(1)}đ)</span>
              </div>
              <span class="outcome-badge ${isCorrect ? 'outcome-correct' : 'outcome-incorrect'}">${isCorrect ? '✔️ Đúng' : '❌ Sai'}</span>
            </div>
            <div class="question-body">
              ${optionsHtml}
              <div class="student-review-metrics">
                <div>• Thí sinh chọn: <strong style="${isCorrect ? 'color: #16a34a;' : 'color: #dc2626;'}">${studentAns}</strong></div>
                <div>• Đáp án chuẩn: <strong style="color: #16a34a;">${correctAnswer}</strong></div>
              </div>
            </div>
          </div>
        `;
      });

      const sScore = Number(studentSub.score) || 0;
      const sCommentStr = sScore >= 9.0 
        ? "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết và thực hành xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo." 
        : sScore >= 7.0 
        ? "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm, kỹ năng thực hành tốt, tích cực và chủ động trong các hoạt động học tập." 
        : sScore >= 5.0 
        ? "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập thực hành nhiều hơn." 
        : "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm và kỹ năng thực hành cơ bản, cần được hướng dẫn rèn luyện thêm.";

      const sRecommStr = sScore >= 9.0
        ? "Tiếp tục nâng cao năng lực tự học chuyên sâu & thử sức giáo trình học liệu Sáng tạo mở rộng."
        : sScore >= 7.0
        ? "Tập trung rà soát các lỗi sơ suất kỹ thuật và hoàn thiện các chủ điểm bài tập tư duy mức độ cao hơn."
        : sScore >= 5.0
        ? "Dành thêm thời gian ôn tập lý thuyết cốt lõi, hoàn thành đầy đủ các bài tập trắc nghiệm và củng cố ghép nối."
        : "Cần GV phụ trách hỗ trợ phụ đạo trực tiếp 1-1, tích cực làm lại đề thi thử tự quản trực tuyến.";

      detailedSheetsHtml += `
        <div class="student-page-break">
          <!-- Official headers -->
          <div class="header-container">
            <div class="header-left">
              SỞ GIÁO DỤC VÀ ĐÀO TẠO VIỆT NAM<br/>
              <strong>BẬT LIÊN KẾT TRƯỜNG THỂ CHẤT SỐ</strong><br/>
              <span class="separator">-----</span>
            </div>
            <div class="header-right">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
              <span class="separator">-----</span>
            </div>
          </div>

          <div class="title-container">
            <h1 class="main-title" style="font-size: 14pt;">BẢN BÁO CÁO PHÂN TÍCH KHẢO THÍ CÁ NHÂN</h1>
            <p class="main-subtitle" style="font-size: 10.5pt;">MÔN: ${activeReportExam.subject || 'TIN HỌC'} - ĐỀ THI: ${activeReportExam.testName}</p>
          </div>

          <div class="card credential-card">
            <h4 class="card-heading">Thông tin thí sinh khảo thí</h4>
            <div class="grid-2-cols">
              <div>Họ và tên học sinh: <strong class="dark-text">${studentSub.studentName}</strong></div>
              <div>Lớp đăng ký: <strong class="dark-text">${studentSub.studentClass}</strong></div>
              <div>Bộ sách liên kết: <strong class="dark-text">${activeReportExam.curriculumBook || activeReportExam.bookSeries || 'Cánh Diều'}</strong></div>
              <div>Mã kết xuất bài làm: <strong class="dark-text">${studentSub.id || 'N/A'}</strong></div>
            </div>
          </div>

          <div class="green-performance-box">
            <div class="points-summary">Số điểm tự động đạt được: ${sScore} / ${activeReportExam.matrixTotalScore || 10} Điểm</div>
            <div class="evaluation-standard">Đánh giá theo Thông tư 27: ${sScore >= 9 ? 'HOÀN THÀNH XUẤT SẮC 🌟' : sScore >= 7 ? 'HOÀN THÀNH TỐT 👍' : sScore >= 5 ? 'HOÀN THÀNH' : 'CHƯA HOÀN THÀNH 📚'}</div>
          </div>

          <div class="commentary-container">
            <h4 class="commentary-title">✍️ Nhận xét từ giáo viên chuyên môn:</h4>
            <p class="commentary-quote">"${sCommentStr}"</p>
            <div class="commentary-rec">
              <strong>• Hướng ôn tập đề xuất:</strong> ${sRecommStr}
            </div>
          </div>

          <div class="survey-heading">📖 BẢN DANH SÁCH CHI TIẾT BÀI LÀM:</div>
          <div class="survey-list">
            ${stuQuestionsHtml}
          </div>

          <div class="signatures-wrapper" style="margin-top: 40px;">
            <div class="signature-col">
              Giám thị trực tuyến phòng máy<br/>
              <span class="sig-note">(Ký thư xác nhận điện tử)</span><br/><br/><br/><br/>
              <strong>Hệ Thống LMS Tự Động</strong>
            </div>
            <div class="signature-col text-right">
              Chữ ký học sinh làm bài<br/>
              <span class="sig-note">(Ký tên và ghi rõ họ tên)</span><br/><br/><br/><br/>
              <strong>${studentSub.studentName}</strong>
            </div>
          </div>

        </div>
      `;
    });
  }

  const compiledHtml = coversheetHtml + detailedSheetsHtml;
  return wrapHtmlWithPremiumPrintStyles(compiledHtml, `Báo_Cáo_Khảo_Thí_Lớp_${className.replace(/\s+/g, "_")}`);
}

function wrapHtmlWithPremiumPrintStyles(bodyContent: string, title: string): string {
  return `
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 1.2cm 1.2cm 1.2cm 1.2cm;
          }
          
          body { 
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            font-size: 10.5pt; 
            line-height: 1.5; 
            color: #1e293b;
            background-color: #fff;
            margin: 0;
            padding: 0;
          }

          /* Structural print controls */
          .student-page-break {
            page-break-before: always;
            padding-top: 20px;
          }

          .coversheet-page {
            page-break-after: always;
            min-height: 90%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          /* Official seals headers */
          .header-container {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
            border-bottom: 1px double #cbd5e1;
            padding-bottom: 12px;
          }
          
          .header-left, .header-right {
            width: 48%;
            text-align: center;
            font-size: 9.5pt;
            color: #334155;
            line-height: 1.4;
          }

          .header-left strong, .header-right strong {
            color: #0f172a;
          }

          .separator {
            font-weight: normal;
            color: #94a3b8;
            margin-top: 4px;
            display: block;
          }

          .sub-date {
            font-style: italic;
            font-size: 8.5pt;
            color: #64748b;
          }

          /* Main titles headings */
          .title-container {
            text-align: center;
            margin-bottom: 25px;
          }

          .main-title {
            font-size: 15pt;
            font-weight: 800;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1e3a8a;
          }

          .main-subtitle {
            font-size: 11pt;
            font-weight: 700;
            color: #475569;
            margin: 6px 0 0 0;
            text-transform: uppercase;
          }

          /* General components style */
          .card {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
          }

          .card-heading {
            font-size: 10.5pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #1e3a8a;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            letter-spacing: 0.5px;
          }

          .grid-2-cols {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 10px;
            font-size: 10pt;
            color: #475569;
          }

          .dark-text {
            color: #0f172a;
          }

          /* Performance summary emerald box */
          .green-performance-box {
            background-color: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 14px;
            text-align: center;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .points-summary {
            font-size: 12.5pt;
            font-weight: 800;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .evaluation-standard {
            font-size: 9.5pt;
            font-weight: 700;
            color: #047857;
            margin-top: 5px;
          }

          /* Commentary violet container */
          .commentary-container {
            background-color: #f5f3ff;
            border-left: 5px solid #4f46e5;
            border-radius: 0 12px 12px 0;
            padding: 14px 16px;
            margin-bottom: 25px;
            page-break-inside: avoid;
          }

          .commentary-title {
            font-size: 10pt;
            font-weight: 800;
            color: #312e81;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .commentary-quote {
            font-size: 10.5pt;
            font-style: italic;
            color: #1e1b4b;
            margin: 0 0 10px 0;
            line-height: 1.5;
            font-weight: 500;
          }

          .commentary-rec {
            font-size: 9.5pt;
            color: #4f46e5;
            border-top: 1px dashed #ddd6fe;
            padding-top: 8px;
          }

          /* Question surveys list */
          .survey-heading {
            font-size: 11pt;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 6px;
          }

          .question-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .question-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
          }

          .question-title {
            font-size: 10.5pt;
            font-weight: 600;
            color: #0f172a;
            line-height: 1.5;
            flex-grow: 1;
          }

          .question-num-tag {
            color: #3b82f6;
            font-weight: 800;
            text-transform: uppercase;
            margin-right: 4px;
          }

          .question-meta-points {
            font-size: 9pt;
            color: #64748b;
            font-weight: normal;
            margin-left: 6px;
          }

          /* Outcome badges */
          .outcome-badge {
            font-size: 8.5pt;
            font-weight: 800;
            padding: 3px 10px;
            border-radius: 9999px;
            white-space: nowrap;
          }

          .outcome-correct {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
          }

          .outcome-incorrect {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
          }

          /* Options choice UI elements */
          .option-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 10px 0 15px 12px;
          }

          .option-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            background-color: #fff;
            font-size: 9.5pt;
          }

          .option-content {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .option-letter {
            width: 22px;
            height: 22px;
            border-radius: 4px;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #475569;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9pt;
          }

          .option-text {
            color: #334155;
          }

          .option-correct {
            background-color: #f0fdf4;
            border-color: #86efac;
            color: #14532d;
          }

          .option-correct .option-letter {
            background-color: #15803d;
            border-color: #166534;
            color: #fff;
          }

          .option-incorrect {
            background-color: #fdf2f2;
            border-color: #fca5a5;
            color: #7f1d1d;
          }

          .option-incorrect .option-letter {
            background-color: #b91c1c;
            border-color: #991b1b;
            color: #fff;
          }

          .option-correct-dashed {
            background-color: #f0fdf4;
            border: 1.5px dashed #10b981;
            color: #14532d;
          }

          .option-correct-dashed .option-letter {
            background-color: #dcfce7;
            border-color: #86efac;
            color: #15803d;
          }

          /* Badges Inside option box */
          .badge-pill {
            font-size: 8pt;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .badge-pill-green {
            background-color: #dcfce7;
            color: #15803d;
          }

          .badge-pill-red {
            background-color: #fee2e2;
            color: #b91c1c;
          }

          .badge-pill-green-dashed {
            background-color: #f0fdf4;
            color: #16a34a;
            border: 1px dashed #10b981;
          }

          /* Grid/Table formatting statement lists */
          .grid-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
            margin: 10px 0 15px 0;
            background-color: #fff;
          }

          .grid-table th {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            font-weight: 700;
            color: #334155;
            padding: 8px 12px;
            font-size: 9.5pt;
            text-align: left;
            vertical-align: middle !important;
          }

          .grid-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            color: #1e293b;
            vertical-align: middle !important;
          }

          .grid-table tr {
            vertical-align: middle !important;
          }

          /* Practical Questions Table vertical alignment */
          .practical-table,
          .practical-table thead,
          .practical-table tbody,
          .practical-table tr,
          .practical-table th,
          .practical-table td,
          .practical-table th *,
          .practical-table td * {
            vertical-align: middle !important;
          }

          .practical-table th,
          .practical-table td {
            vertical-align: middle !important;
            display: table-cell !important;
          }

          .text-correct {
            color: #15803d;
          }

          .text-incorrect {
            color: #b91c1c;
          }

          .text-gray {
            color: #64748b;
          }

          /* Gap fill details */
          .gap-fill-container {
            margin: 10px 0 15px 12px;
          }

          .gap-fill-pill {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 10pt;
            min-width: 180px;
          }

          .gap-fill-correct {
            border: 1px solid #86efac;
            background-color: #f0fdf4;
            color: #15803d;
          }

          .gap-fill-incorrect {
            border: 1px solid #fca5a5;
            background-color: #fdf2f2;
            color: #b91c1c;
          }

          .text-correct-block {
            background-color: #dcfce7;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px dashed #10b981;
            color: #15803d;
          }

          /* metrics and reviews panel at bottom of card */
          .student-review-metrics {
            margin-top: 12px;
            border-top: 1px dashed #e2e8f0;
            padding-top: 10px;
          }

          .status-badge {
            font-size: 7.5pt;
            font-weight: 800;
            padding: 1px 5px;
            border-radius: 3px;
            margin-left: 6px;
          }

          .status-good {
            background-color: #dcfce7;
            color: #166534;
          }

          .status-bad {
            background-color: #fee2e2;
            color: #991b1b;
          }

          /* Answer guide explanation */
          .answer-guide-box {
            margin-top: 12px;
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            border-radius: 0 8px 8px 0;
            padding: 10px 14px;
            font-size: 9.5pt;
          }

          .guide-header {
            font-weight: 800;
            color: #b45309;
            font-size: 8.5pt;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .guide-content {
            color: #451a03;
            font-style: italic;
          }

          /* Signatures columns */
          .signatures-wrapper {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-top: 35px;
            page-break-inside: avoid;
          }

          .signature-col {
            font-size: 10pt;
            font-weight: bold;
            color: #334155;
            line-height: 1.4;
            text-align: center;
          }

          .sig-note {
            font-weight: normal;
            font-style: italic;
            font-size: 8.5pt;
            color: #64748b;
          }

          .text-right {
            text-align: center !important; /* Keep aligned symmetrically */
          }

          /* Coversheet specific stats grid */
          .stats-grid {
            display: grid;
            grid-template-cols: repeat(4, 1fr);
            gap: 12px;
            margin-top: 25px;
          }

          .stat-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            text-align: center;
          }

          .stat-num {
            font-size: 16pt;
            font-weight: 800;
            color: #1e3a8a;
          }

          .stat-label {
            font-size: 8pt;
            color: #64748b;
            font-weight: 600;
            margin-top: 4px;
            text-transform: uppercase;
          }

          .text-theme-blue { color: #2563eb !important; }
          .text-theme-green { color: #16a34a !important; }
          .text-theme-orange { color: #ea580c !important; }

          /* Table for overall scores */
          .summary-table {
            border: none;
            margin: 0;
          }

          .summary-table th {
            background-color: #1e3a8a !important;
            color: #fff !important;
            border-color: #1e40af;
            text-transform: uppercase;
            font-size: 8.5pt;
            letter-spacing: 0.5px;
            font-weight: 700;
          }

          .bg-alt {
            background-color: #f8fafc;
          }

          .badge-rating {
            font-size: 8pt;
            font-weight: bold;
            padding: 3px 8px;
            border-radius: 6px;
            display: inline-block;
          }

          .badge-rating-green { background-color: #dcfce7; color: #166534; }
          .badge-rating-blue { background-color: #dbeafe; color: #1e40af; }
          .badge-rating-amber { background-color: #fef3c7; color: #92400e; }
          .badge-rating-red { background-color: #fee2e2; color: #991b1b; }

          .table-empty-message {
            padding: 20px !important;
            text-align: center;
            color: #64748b;
            font-style: italic;
          }

          @media print {
            body {
              font-size: 10pt;
              padding: 0;
              margin: 0;
              background: #fff;
              color: #000;
            }
            .question-card, .card, .green-performance-box, .commentary-container {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${bodyContent}
      </body>
    </html>
  `;
}

// Robust, fail-safe print executor that works inside sandboxed iframes 
// by dynamically binding a print section into the top-level body and hiding everything else.
export function printExamPDF(htmlContent: string) {
  // 1. Create container for the print elements
  const printDiv = document.createElement("div");
  printDiv.id = "lms-print-section-container";
  printDiv.innerHTML = htmlContent;
  document.body.appendChild(printDiv);

  // 2. Add style sheet rules specifically hidding everything except this print element
  const styleEl = document.createElement("style");
  styleEl.id = "lms-print-media-rules";
  styleEl.innerHTML = `
    @media print {
      body > :not(#lms-print-section-container) {
        display: none !important;
      }
      #lms-print-section-container {
        display: block !important;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background-color: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // 3. Command browser print tool on client thread context
  setTimeout(() => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error("Print execution failed inside window context:", err);
    } finally {
      // 4. Tear down nodes and clear scope resources
      setTimeout(() => {
        if (printDiv.parentNode) printDiv.parentNode.removeChild(printDiv);
        if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      }, 2000);
    }
  }, 250);
}
