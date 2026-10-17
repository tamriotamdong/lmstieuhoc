// src/utils/wordGenerator.ts
// Beautiful Word document generation based on the "Xem trước PDF" layout and styling,
// with ZIP packing support for class-wide submissions.

import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  VerticalAlign
} from 'docx';

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function formatExportFileName(className: string, stt: string, fullName: string): string {
  const cleanStt = (stt || "01").trim().padStart(2, "0");
  
  const cleanName = removeDiacritics(fullName)
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // Convert "Khối 3 - Lớp 3.5" or similar to "Lop3.5"
  const noDiacriticsClass = removeDiacritics(className).replace(/\s+/g, "");
  let classPart = "Lop";
  
  const matchLop = noDiacriticsClass.match(/Lop([a-zA-Z0-9.]+)/i);
  if (matchLop && matchLop[1]) {
    classPart = "Lop" + matchLop[1];
  } else {
    const matchSimple = noDiacriticsClass.match(/([0-9]+\.?[0-9]*[a-zA-Z]*)/);
    if (matchSimple) {
      classPart = "Lop" + matchSimple[1];
    } else {
      classPart = noDiacriticsClass || "Lop";
    }
  }
  
  return `${classPart}_${cleanStt}_${cleanName}`;
}

export function convertScoreToWords(score: number): string {
  const roundScore = Math.round(score * 10) / 10;
  const scoreMap: Record<number, string> = {
    0: "Không", 0.5: "Không phẩy năm",
    1: "Một", 1.5: "Một phẩy năm",
    2: "Hai", 2.5: "Hai phẩy năm",
    3: "Ba", 3.5: "Ba phẩy năm",
    4: "Bốn", 4.5: "Bốn phẩy năm",
    5: "Năm", 5.5: "Năm phẩy năm",
    6: "Sáu", 6.5: "Sáu phẩy năm",
    7: "Bảy", 7.5: "Bảy phẩy năm",
    8: "Tám", 8.5: "Tám phẩy năm",
    9: "Chín", 9.5: "Chín phẩy năm",
    10: "Mười"
  };
  if (scoreMap[roundScore] !== undefined) {
    return scoreMap[roundScore];
  }
  const integerPart = Math.floor(roundScore);
  const decimalPart = Math.round((roundScore - integerPart) * 10);
  const words = ["Không", "Một", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười"];
  if (decimalPart === 0) {
    return words[integerPart] || String(integerPart);
  }
  return `${words[integerPart] || integerPart} phẩy ${words[decimalPart] || decimalPart}`;
}

// Helper to remove prefixes like "A. ", "B. ", "1.", "a."
function cleanPrefixText(txt: string): string {
  if (!txt) return "";
  return txt.replace(/^[A-Da-d1-9]\.\s*/, "").trim();
}

function normalizeAnsCheck(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .trim();
}

function parseAnswerStringToMap(ansStr: string): Record<string, string> {
  const obj: Record<string, string> = {};
  if (!ansStr) return obj;
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
}

export function generateStudentExamWordHtml(
  examObj: any,
  currentAnswers: Record<string, string>,
  currentScore: number,
  currentStudentName: string,
  currentStudentClass: string,
  currentStudentStt: string
): string {
  const qList = examObj.questions || [];
  const roundedScoreForBox = Math.round(currentScore);
  
  // --- Calculate theory vs practical balance ---
  const hasPractical = examObj.isPracticalEnabled === true;
  
  const getPScoreVal = (idx: number) => {
    const val = currentAnswers?.[`practical_score_p-${idx}`] !== undefined 
      ? currentAnswers[`practical_score_p-${idx}`]
      : (currentAnswers?.[`p${idx}_score`] !== undefined ? currentAnswers[`p${idx}_score`] : undefined);
    return val !== undefined ? Number(val) : 0;
  };
  
  const totalPScoreValue = hasPractical ? (getPScoreVal(1) + getPScoreVal(2) + getPScoreVal(3) + getPScoreVal(4) + getPScoreVal(5)) : 0;
  const totalTScoreValue = hasPractical ? Math.max(0, currentScore - totalPScoreValue) : currentScore;

  const commentStr = hasPractical
    ? (currentScore >= 9.0 
      ? "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết và thực hành xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo." 
      : currentScore >= 7.0 
      ? "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm, kỹ năng thực hành tốt, tích cực và chủ động trong các hoạt động học tập." 
      : currentScore >= 5.0 
      ? "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập thực hành nhiều hơn." 
      : "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm và kỹ năng thực hành cơ bản, cần được hướng dẫn rèn luyện thêm.")
    : (currentScore >= 9.0 
      ? "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo." 
      : currentScore >= 7.0 
      ? "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm tốt, tích cực và chủ động trong các hoạt động học tập." 
      : currentScore >= 5.0 
      ? "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập và ôn tập thêm." 
      : "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm cơ bản, cần được hướng dẫn rèn luyện thêm.");

  let questionsHtml = "";

  qList.forEach((q: any, idx: number) => {
    const studentAns = currentAnswers[q.id] !== undefined ? String(currentAnswers[q.id]) : "Chưa trả lời";
    const correctAnswer = q.correctAnswer ? String(q.correctAnswer) : "";
    
    let isCorrect = false;
    let earnedPoints = 0;
    const qPointsTotal = q.points !== undefined ? Number(q.points) : 1.0;

    if (q.type === 'multiple_choice') {
      isCorrect = studentAns.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
      earnedPoints = isCorrect ? qPointsTotal : 0;
    } else if (q.type === 'true_false') {
      if (q.statements && q.statements.length > 0) {
        const studentTfObj = parseAnswerStringToMap(studentAns);
        const correctTfObj = parseAnswerStringToMap(correctAnswer);
        const pointsPerStatement = qPointsTotal / q.statements.length;
        let matchedCount = 0;

        q.statements.forEach((st: any) => {
          const sLabel = String(st.label || '').trim().toUpperCase();
          if (studentTfObj[sLabel] === correctTfObj[sLabel] && correctTfObj[sLabel] !== undefined) {
            earnedPoints += st.points !== undefined ? Number(st.points) : pointsPerStatement;
            matchedCount++;
          }
        });
        isCorrect = matchedCount === q.statements.length;
      } else {
        const normStudent = normalizeAnsCheck(studentAns);
        const normCorrect = normalizeAnsCheck(correctAnswer);
        isCorrect = normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "");
        earnedPoints = isCorrect ? qPointsTotal : 0;
      }
    } else if (q.type === 'matching') {
      if (q.matchingPairs && q.matchingPairs.length > 0) {
        const studentMatchObj = parseAnswerStringToMap(studentAns);
        const correctMatchObj = parseAnswerStringToMap(correctAnswer);
        const pointsPerPair = qPointsTotal / q.matchingPairs.length;
        let matchedCount = 0;

        q.matchingPairs.forEach((pair: any) => {
          const mId = String(pair.id || '').trim();
          if (studentMatchObj[mId] === correctMatchObj[mId] && correctMatchObj[mId] !== undefined) {
            earnedPoints += pair.points !== undefined ? Number(pair.points) : pointsPerPair;
            matchedCount++;
          }
        });
        isCorrect = matchedCount === q.matchingPairs.length;
      } else {
        const normStudent = normalizeAnsCheck(studentAns);
        const normCorrect = normalizeAnsCheck(correctAnswer);
        isCorrect = normStudent === normCorrect || (normCorrect.includes(normStudent) && normStudent !== "");
        earnedPoints = isCorrect ? qPointsTotal : 0;
      }
    } else if (q.type === 'gap_fill') {
      const studentWords = studentAns.trim().toLowerCase().replace(/\s+/g, ' ');
      const correctWords = correctAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
      isCorrect = studentWords === correctWords || correctWords.includes(studentWords);
      earnedPoints = isCorrect ? qPointsTotal : 0;
    }

    let optionsHtml = "";

    if (q.type === 'multiple_choice' && q.options) {
      optionsHtml = `<table class="mcq-options-table" style="width: 100%; border: none !important; border-width: 0 !important; margin: 4px 0 6px 0; border-collapse: collapse;">`;
      
      const optValA = Array.isArray(q.options) ? q.options[0] : q.options['A'];
      const optValB = Array.isArray(q.options) ? q.options[1] : q.options['B'];
      const optValC = Array.isArray(q.options) ? q.options[2] : q.options['C'];
      const optValCExists = optValC !== undefined;
      const optValD = Array.isArray(q.options) ? q.options[3] : q.options['D'];
      const optValDExists = optValD !== undefined;

      // Row 1: A and B
      optionsHtml += `<tr valign="middle" style="vertical-align: middle !important;">`;
      if (optValA) {
        const isStudentChoice = studentAns.trim().toUpperCase() === 'A';
        const isCorrectChoice = correctAnswer.trim().toUpperCase() === 'A';
        const checkSuffix = isStudentChoice 
          ? (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : ' <span style="color: #dc2626; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">❌</span>') 
          : (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : '');
        optionsHtml += `
          <td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; font-size: 13pt; line-height: 1.35; font-family: 'Times New Roman', serif; background: transparent !important; vertical-align: middle !important;">
            <span style="color: #1e3a8a; font-weight: bold;">A.</span> ${cleanPrefixText(optValA)}${checkSuffix}
          </td>
        `;
      } else {
        optionsHtml += `<td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; background: transparent !important; vertical-align: middle !important;"></td>`;
      }

      if (optValB) {
        const isStudentChoice = studentAns.trim().toUpperCase() === 'B';
        const isCorrectChoice = correctAnswer.trim().toUpperCase() === 'B';
        const checkSuffix = isStudentChoice 
          ? (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : ' <span style="color: #dc2626; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">❌</span>') 
          : (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : '');
        optionsHtml += `
          <td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; font-size: 13pt; line-height: 1.35; font-family: 'Times New Roman', serif; background: transparent !important; vertical-align: middle !important;">
            <span style="color: #1e3a8a; font-weight: bold;">B.</span> ${cleanPrefixText(optValB)}${checkSuffix}
          </td>
        `;
      } else {
        optionsHtml += `<td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; background: transparent !important; vertical-align: middle !important;"></td>`;
      }
      optionsHtml += `</tr>`;

      // Row 2: C and D
      if (optValCExists || optValDExists) {
        optionsHtml += `<tr valign="middle" style="vertical-align: middle !important;">`;
        if (optValC) {
          const isStudentChoice = studentAns.trim().toUpperCase() === 'C';
          const isCorrectChoice = correctAnswer.trim().toUpperCase() === 'C';
          const checkSuffix = isStudentChoice 
            ? (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : ' <span style="color: #dc2626; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">❌</span>') 
            : (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : '');
          optionsHtml += `
            <td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; font-size: 13pt; line-height: 1.35; font-family: 'Times New Roman', serif; background: transparent !important; vertical-align: middle !important;">
              <span style="color: #1e3a8a; font-weight: bold;">C.</span> ${cleanPrefixText(optValC)}${checkSuffix}
            </td>
          `;
        } else {
          optionsHtml += `<td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; background: transparent !important; vertical-align: middle !important;"></td>`;
        }

        if (optValD) {
          const isStudentChoice = studentAns.trim().toUpperCase() === 'D';
          const isCorrectChoice = correctAnswer.trim().toUpperCase() === 'D';
          const checkSuffix = isStudentChoice 
            ? (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : ' <span style="color: #dc2626; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">❌</span>') 
            : (isCorrectChoice ? ' <span style="color: #16a34a; font-weight: bold; font-family: DejaVu Sans, Arial; font-size: 13pt;">✓</span>' : '');
          optionsHtml += `
            <td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; font-size: 13pt; line-height: 1.35; font-family: 'Times New Roman', serif; background: transparent !important; vertical-align: middle !important;">
              <span style="color: #1e3a8a; font-weight: bold;">D.</span> ${cleanPrefixText(optValD)}${checkSuffix}
            </td>
          `;
        } else {
          optionsHtml += `<td valign="middle" style="width: 50%; border: none !important; border-width: 0 !important; padding: 3px 6px; background: transparent !important; vertical-align: middle !important;"></td>`;
        }
        optionsHtml += `</tr>`;
      }

      optionsHtml += `</table>`;
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
        <table style="width: 100%; border-collapse: collapse; margin: 6px 0;">
          <thead>
            <tr valign="middle" style="background-color: #f1f5f9; vertical-align: middle !important;">
              <th valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; text-align: center !important; vertical-align: middle !important;">Nội dung phát biểu</th>
              <th valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; text-align: center !important; vertical-align: middle !important; width: 90px;">Đúng</th>
              <th valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; text-align: center !important; vertical-align: middle !important; width: 90px;">Sai</th>
            </tr>
          </thead>
          <tbody>`;

      statements.forEach((st: any, sidx: number) => {
        const letter = st.label || ['A', 'B', 'C', 'D'][sidx];
        const chosenVal = studentTfObj[letter.toUpperCase()] || "";
        const correctVal = correctTfObj[letter.toUpperCase()] || "";
        const isStCorrect = chosenVal.toLowerCase() === correctVal.toLowerCase();

        let dungCheck = "";
        let saiCheck = "";

        if (chosenVal.toLowerCase() === "đúng" || chosenVal.toLowerCase() === "dung") {
          dungCheck = `<span style="color: ${isStCorrect ? '#16a34a' : '#ef4444'}; font-weight: bold; font-size: 13pt;">X</span>`;
        }
        if (chosenVal.toLowerCase() === "sai") {
          saiCheck = `<span style="color: ${isStCorrect ? '#16a34a' : '#ef4444'}; font-weight: bold; font-size: 13pt;">X</span>`;
        }

        optionsHtml += `
          <tr valign="middle" style="vertical-align: middle !important;">
            <td valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', serif; vertical-align: middle !important;">
              <b>${letter}.</b> ${st.text || ''}
            </td>
            <td valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; vertical-align: middle !important;">${dungCheck}</td>
            <td valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; vertical-align: middle !important;">${saiCheck}</td>
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
        <table style="width: 100%; border-collapse: collapse; margin: 6px 0;">
          <thead>
            <tr valign="middle" style="background-color: #f1f5f9; vertical-align: middle !important;">
              <th valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; text-align: center !important; vertical-align: middle !important; width: 40%;">CỘT A (Khái niệm)</th>
              <th valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; text-align: center !important; vertical-align: middle !important; width: 20%;">Kết nối</th>
              <th valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', Times, serif; text-align: center !important; vertical-align: middle !important; width: 40%;">CỘT B (Mô tả/Vai trò)</th>
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
            ? `<span style="color: #16a34a; font-weight: bold; font-size: 12.5pt;">${leftPair.id} - ${chosenMatchId}</span>`
            : `<span style="color: #dc2626; font-weight: bold; font-size: 12.5pt;">${leftPair.id} - ${chosenMatchId} ❌</span><br/><span style="color: #16a34a; font-size: 11pt;">Đáp án: ${leftPair.id}-${correctMatchId}</span>`;
        } else {
          matchIndicator = `<span style="color: #94a3b8; font-size: 12.5pt;">Chưa ghép</span><br/><span style="color: #16a34a; font-size: 11pt;">Đáp án: ${leftPair.id}-${correctMatchId}</span>`;
        }

        optionsHtml += `
          <tr valign="middle" style="vertical-align: middle !important;">
            <td valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', serif; vertical-align: middle !important;">
              <b>${leftPair.id}.</b> ${cleanPrefixText(leftPair.left)}
            </td>
            <td valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 12.5pt; vertical-align: middle !important;">
              ${matchIndicator}
            </td>
            <td valign="middle" style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12.5pt; font-family: 'Times New Roman', serif; vertical-align: middle !important;">
              <b>${rightPair.id_match || rightPair.id}.</b> ${cleanPrefixText(rightPair.right)}
            </td>
          </tr>
        `;
      });
      optionsHtml += `</tbody></table>`;
    } else if (q.type === 'gap_fill') {
      optionsHtml = "";
    }

    let reviewOutcome = "";
    if (q.type === 'true_false') {
      const studentTfObj = parseAnswerStringToMap(studentAns);
      const correctTfObj = parseAnswerStringToMap(correctAnswer);
      const pointsPerStatement = qPointsTotal / (q.statements?.length || 4);
      const statements = Array.isArray(q.statements) ? q.statements : (q.statements ? Object.values(q.statements) : []);
      const formattedItems: string[] = [];

      statements.forEach((st: any, sidx: number) => {
        const letter = String(st.label || ['A', 'B', 'C', 'D'][sidx]).trim().toUpperCase();
        const chosenVal = studentTfObj[letter] || "";
        const correctVal = correctTfObj[letter] || "";
        const isStCorrect = chosenVal.toLowerCase() === correctVal.toLowerCase();
        const stPoints = st.points !== undefined ? Number(st.points) : pointsPerStatement;

        let displayVal = chosenVal;
        if (displayVal.toLowerCase() === "đúng" || displayVal.toLowerCase() === "dung") {
          displayVal = "Đúng";
        } else if (displayVal.toLowerCase() === "sai") {
          displayVal = "Sai";
        } else {
          displayVal = displayVal || "Chưa chọn";
        }

        if (isStCorrect) {
          formattedItems.push(
            `<span style="color: #16a34a; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 13pt;">${letter}-${displayVal} (${parseFloat(stPoints.toFixed(2))}đ)</span>`
          );
        } else {
          formattedItems.push(
            `<span style="color: #ef4444; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 13pt;">${letter}-${displayVal} (0đ)</span>`
          );
        }
      });

      reviewOutcome = `
        <p style="margin-top: 3px; margin-bottom: 2px; font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.2; color: #000000;">
          <b style="font-family: 'Times New Roman', serif; font-weight: bold; color: #000000;">Học sinh chọn đáp án:</b> ${formattedItems.join(", ")}
        </p>
      `;
    } else if (q.type === 'matching') {
      const studentMatchObj = parseAnswerStringToMap(studentAns);
      const correctMatchObj = parseAnswerStringToMap(correctAnswer);
      const pairs = q.matchingPairs || [];
      const leftItems = [...pairs].sort((a: any, b: any) => String(a.id).localeCompare(String(b.id)));
      const pointsPerPair = qPointsTotal / (leftItems.length || 1);
      const formattedItems: string[] = [];

      leftItems.forEach((leftPair: any) => {
        const mId = String(leftPair.id || '').trim();
        const chosenMatchId = studentMatchObj[mId] || "";
        const correctMatchId = correctMatchObj[mId] || "";
        const isPairCorrect = chosenMatchId.toLowerCase() === correctMatchId.toLowerCase();
        const pairPoints = leftPair.points !== undefined ? Number(leftPair.points) : pointsPerPair;

        const displayMatch = chosenMatchId || "(Trống)";
        if (isPairCorrect) {
          formattedItems.push(
            `<span style="color: #16a34a; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 13pt;">${mId}-${displayMatch} (Đúng: ${parseFloat(pairPoints.toFixed(2))}đ)</span>`
          );
        } else {
          formattedItems.push(
            `<span style="color: #ef4444; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 13pt;">${mId}-${displayMatch} (Sai: 0đ)</span>`
          );
        }
      });

      reviewOutcome = `
        <p style="margin-top: 3px; margin-bottom: 2px; font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.2; color: #000000;">
          <b style="font-family: 'Times New Roman', serif; font-weight: bold; color: #000000;">Học sinh chọn đáp án:</b> ${formattedItems.join(", ")}
        </p>
      `;
    } else {
      if (isCorrect) {
        if (q.type === 'gap_fill') {
          reviewOutcome = `<p style="color: #16a34a; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh trả lời: ${studentAns || "(Trống)"}. ✓ Trả lời đúng</p>`;
        } else {
          reviewOutcome = `<p style="color: #16a34a; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh chọn đáp án ${studentAns}. ✓ Trả lời đúng</p>`;
        }
      } else {
        if (earnedPoints > 0) {
          if (q.type === 'gap_fill') {
            const isUnanswered = !studentAns || studentAns.trim() === "" || studentAns.trim().toLowerCase() === "chưa trả lời" || studentAns.trim().toLowerCase() === "(trống)";
            if (isUnanswered) {
              reviewOutcome = `
                <p style="color: #ef4444; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh chưa trả lời ❌</p>
                <p style="color: #15803d; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">💡 Đáp án đúng: ${correctAnswer}</p>
              `;
            } else {
              reviewOutcome = `
                <p style="color: #ca8a04; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh trả lời: ${studentAns}. Trả lời đúng một phần (${parseFloat(earnedPoints.toFixed(2))} điểm).</p>
                <p style="color: #15803d; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">💡 Đáp án đúng: ${correctAnswer}</p>
              `;
            }
          } else {
            reviewOutcome = `
              <p style="color: #ca8a04; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh chọn đáp án ${studentAns}. Trả lời đúng một phần (${parseFloat(earnedPoints.toFixed(2))} điểm).</p>
              <p style="color: #15803d; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">💡 Đáp án đúng: ${correctAnswer}</p>
            `;
          }
        } else {
          if (q.type === 'gap_fill') {
            const isUnanswered = !studentAns || studentAns.trim() === "" || studentAns.trim().toLowerCase() === "chưa trả lời" || studentAns.trim().toLowerCase() === "(trống)";
            if (isUnanswered) {
              reviewOutcome = `
                <p style="color: #ef4444; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh chưa trả lời ❌</p>
                <p style="color: #15803d; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">💡 Đáp án đúng: ${correctAnswer}</p>
              `;
            } else {
              reviewOutcome = `
                <p style="color: #ef4444; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh trả lời: ${studentAns}. ❌ Trả lời sai.</p>
                <p style="color: #15803d; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">💡 Đáp án đúng: ${correctAnswer}</p>
              `;
            }
          } else if (q.type === 'multiple_choice') {
            reviewOutcome = `<p style="color: #ef4444; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh chọn đáp án ${studentAns}. ❌ Trả lời sai. <span style="color: #15803d;">Đáp án đúng: ${correctAnswer}</span></p>`;
          } else {
            // Default "Tự luận ngắn" or other fallback types
            const isUnanswered = !studentAns || studentAns.trim() === "" || studentAns.trim().toLowerCase() === "chưa trả lời" || studentAns.trim().toLowerCase() === "(trống)";
            if (isUnanswered) {
              reviewOutcome = `
                <p style="color: #ef4444; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh chưa trả lời ❌</p>
                <p style="color: #15803d; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">💡 Gợi ý giải: ${correctAnswer}</p>
              `;
            } else {
              reviewOutcome = `
                <p style="color: #ef4444; font-weight: bold; margin-top: 3px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">Học sinh trả lời: ${studentAns}. ❌ Trả lời sai.</p>
                <p style="color: #15803d; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1.2; font-family: 'Times New Roman', serif; font-size: 13pt;">💡 Gợi ý giải: ${correctAnswer}</p>
              `;
            }
          }
        }
      }
    }

    let explanationHtml = "";
    if (q.answerGuide || q.explanation) {
      const rawExplanation = (q.answerGuide || q.explanation || "").trim();
      if (q.type === 'true_false' || q.type === 'matching') {
        const sentences = rawExplanation
          .split(/\s*[\r\n;]+\s*|(?<=\.)\s+(?=[A-ZĐÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬEỀỂỄẾỆIÌỈĨÍỊOÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢUÙỦŨÚỤƯỪỬỮỨỰYỲỶỸÝY])/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        
        explanationHtml = `
          <div class="explanation-box" style="margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 5px; font-size: 13pt; line-height: 1.35; color: #000000;">
            <b style="font-family: 'Times New Roman', serif; font-weight: bold;">Hướng dẫn giải thích:</b>
            ${sentences.map((line: string) => `<p style="margin-top: 2pt; margin-bottom: 2pt; mso-margin-top-alt: 2pt; mso-margin-bottom-alt: 2pt; font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.35; color: #000000;">• ${line}</p>`).join("")}
          </div>
        `;
      } else {
        explanationHtml = `
          <div class="explanation-box" style="margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 5px; font-size: 13pt; line-height: 1.35; color: #000000; font-family: 'Times New Roman', serif;">
            <b style="font-weight: bold;">Hướng dẫn giải thích:</b> ${rawExplanation}
          </div>
        `;
      }
    }

    questionsHtml += `
      <table class="exam-question-card" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid; border: 1.5pt solid #1e293b;">
        <tr valign="middle" style="vertical-align: middle !important;">
          <td valign="middle" style="padding: 6px 10px; font-family: 'Times New Roman', serif; border: none !important; vertical-align: middle !important;">
            <div style="font-size: 13pt; font-weight: bold; color: #0f172a; margin-bottom: 4px; line-height: 1.35; vertical-align: middle;">
              Câu ${idx + 1} (<span style="color: ${earnedPoints > 0 ? '#16a34a' : '#ef4444'}">${parseFloat(earnedPoints.toFixed(2))}/${qPointsTotal} điểm</span>):
              <span style="font-weight: bold; margin-left: 4px;">${cleanPrefixText(q.questionText)}</span>
            </div>
            
            ${optionsHtml}
            
            ${reviewOutcome}
            
            ${explanationHtml}
          </td>
        </tr>
      </table>
    `;
  });

  return `
    <table class="header-table no-border-table" align="center" style="width: 100%; border: none !important; border-width: 0 !important; margin-top: 0px; margin-bottom: 0px; margin-left: auto; margin-right: auto; text-align: center; border-collapse: collapse;">
      <tr>
        <td align="center" style="width: 48%; text-align: center; border: none !important; border-width: 0 !important; font-size: 13pt; line-height: 1.2; font-family: 'Times New Roman', Times, serif; white-space: nowrap; vertical-align: top; padding: 0;">
          <span style="white-space: nowrap;">${(examObj.district || "ỦY BAN NHÂN DÂN XÃ ĐÔNG THẠNH").toUpperCase()}</span><br/>
          <span style="white-space: nowrap; font-weight: bold;">${(examObj.school || "TIỂU HỌC TRẦN VĂN DANH").toUpperCase()}</span>
        </td>
        <td style="width: 4%; border: none !important; border-width: 0 !important; padding: 0;"></td>
        <td align="center" style="width: 48%; text-align: center; border: none !important; border-width: 0 !important; font-size: 13pt; line-height: 1.2; font-family: 'Times New Roman', Times, serif; white-space: nowrap; vertical-align: top; padding: 0;">
          <span style="white-space: nowrap; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br/>
          <span style="white-space: nowrap; font-weight: bold; text-decoration: none !important;">Độc lập - Tự do - Hạnh phúc</span>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 2px; margin-bottom: 8px;">
      <h2 style="font-size: 13pt; font-family: 'Times New Roman', Times, serif; font-weight: bold; margin: 0; text-transform: uppercase; color: red !important;">
        KIỂM TRA ĐỊNH KỲ CUỐI HỌC KỲ I
      </h2>
      <div style="font-size: 13pt; font-weight: bold; color: #000000; margin-top: 2px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif;">
        MÔN THI: ${examObj.subject?.toUpperCase() || 'TIN HỌC'} (LỚP ${examObj.grade || '3'}) – NĂM HỌC: ${examObj.academicYear || '2025 - 2026'}
      </div>
      <div style="font-size: 13pt; color: #000000; margin-top: 1px; font-family: 'Times New Roman', Times, serif;">
        Thời gian làm bài thi: ${examObj.timeLimit || 35} Phút
      </div>
    </div>

    <div style="text-align: left; font-weight: bold; color: #000000; font-size: 13pt; margin-bottom: 4px; font-family: 'Times New Roman', serif;">
      Thông tin học sinh:
    </div>

    <div style="font-size: 13pt; font-family: 'Times New Roman', serif; text-align: left; margin-bottom: 6px; line-height: 1.2;">
      Học sinh: <b>${currentStudentName}</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lớp: <b>${currentStudentClass}</b>
    </div>

    <table class="score-summary-table" style="width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 2px; line-height: 1.2; page-break-inside: avoid; break-inside: avoid;">
      <tr valign="middle" style="vertical-align: middle !important;">
        <td valign="middle" style="width: 20%; border: 1.5pt solid #0f172a; padding: 6px 8px; text-align: center; font-size: 13pt; vertical-align: middle !important; font-family: 'Times New Roman', serif; line-height: 1.2;">
          <p style="margin: 0; line-height: 1.2;"><b>Điểm</b></p>
          <p style="margin: 0; line-height: 1.2;">
            <span style="font-size: 13pt; font-weight: bold; color: #e11d48; line-height: 1.2;">
              ${roundedScoreForBox}
            </span>
          </p>
          <p style="margin: 0; line-height: 1.2;">
            <span style="font-size: 13pt; font-style: italic; color: #e11d48; font-weight: bold; line-height: 1.2;">
              (${convertScoreToWords(roundedScoreForBox)})
            </span>
          </p>
        </td>
        <td valign="middle" style="width: 80%; border: 1.5pt solid #0f172a; padding: 6px 8px; font-size: 13pt; font-family: 'Times New Roman', serif; text-align: center; vertical-align: middle !important; line-height: 1.2;">
          <p style="margin: 0; line-height: 1.2;"><b>Nhận xét</b></p>
          <p style="margin: 0; line-height: 1.2;">
            <span style="color: #16a34a; font-size: 13pt; line-height: 1.2;">
              ${commentStr}
            </span>
          </p>
        </td>
      </tr>
    </table>

    ${hasPractical ? `
    <div style="font-size: 13pt; font-weight: bold; margin-top: 2px; margin-bottom: 2px; text-transform: uppercase; color: #1e3a8a; font-family: 'Times New Roman', serif;">
      Tổng điểm: <span style="color: red; font-weight: bold;">${(totalTScoreValue + totalPScoreValue).toFixed(1)} điểm</span>
    </div>
    <div style="font-size: 13pt; font-weight: bold; margin-top: 2px; margin-bottom: 6px; text-transform: uppercase; color: #1e3a8a; font-family: 'Times New Roman', serif;">
      I. PHẦN TRẮC NGHIỆM: <span style="color: red; font-weight: bold;">${totalTScoreValue.toFixed(1)} điểm</span>
    </div>
    ` : `
    <div style="font-size: 13pt; font-weight: bold; margin-top: 2px; margin-bottom: 6px; text-transform: uppercase; color: #1e3a8a; font-family: 'Times New Roman', serif;">
      Tổng điểm: <span style="color: red; font-weight: bold;">${totalTScoreValue.toFixed(1)} điểm</span>
    </div>
    `}

    ${questionsHtml}

    ${(() => {
      if (!hasPractical) return "";
      const practicalList = examObj.practical || [
        { id: 'p-1', questionText: 'Câu 1: Nháy đúp chuột khởi động phần mềm soạn thảo MS Word.', imageUrl: '' },
        { id: 'p-2', questionText: 'Câu 2: Thực hiện gõ từ câu thơ "Em là dũng sĩ tin học lớp 3" đúng chuẩn Telex.', imageUrl: '' },
        { id: 'p-3', questionText: 'Câu 3: Sử dụng công cụ vẽ Paint vẽ hình tròn.', imageUrl: '' },
        { id: 'p-4', questionText: 'Câu 4: Tạo thư mục lưu tên em ở ổ đĩa D.', imageUrl: '' },
        { id: 'p-5', questionText: 'Câu 5: Tắt máy tính đúng quy trình an toàn.', imageUrl: '' }
      ];

      const getPScore = (idx: number) => {
        const val = currentAnswers?.[`practical_score_p-${idx}`] !== undefined 
          ? currentAnswers[`practical_score_p-${idx}`]
          : (currentAnswers?.[`p${idx}_score`] !== undefined ? currentAnswers[`p${idx}_score`] : undefined);
        return val !== undefined ? Number(val) : 0;
      };

      const p1Score = getPScore(1);
      const p2Score = getPScore(2);
      const p3Score = getPScore(3);
      const p4Score = getPScore(4);
      const p5Score = getPScore(5);
      
      const totalPScore = p1Score + p2Score + p3Score + p4Score + p5Score;
      const totalMaxPracticalPoints = practicalList.reduce((sum: number, pt: any) => sum + (pt.points !== undefined ? Number(pt.points) : 2.0), 0);

      let practicalTableHtml = `
        <table class="practical-table" valign="middle" style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; vertical-align: middle !important;">
          <thead valign="middle" style="vertical-align: middle !important;">
            <tr valign="middle" style="background-color: #f1f5f9; vertical-align: middle !important;">
              <th valign="middle" align="center" style="width: 10%; border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', Times, serif; font-weight: bold; font-size: 11.5pt;">STT</th>
              <th valign="middle" align="center" style="width: 60%; border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', Times, serif; font-weight: bold; font-size: 11.5pt;">Yêu cầu bài thực hành</th>
              <th valign="middle" align="center" style="width: 15%; border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', Times, serif; font-weight: bold; font-size: 11.5pt;">Thang điểm tối đa</th>
              <th valign="middle" align="center" style="width: 15%; border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', Times, serif; font-weight: bold; font-size: 11.5pt;">Điểm chấm</th>
            </tr>
          </thead>
          <tbody valign="middle" style="vertical-align: middle !important;">
      `;

      practicalList.forEach((pt: any, pIdx: number) => {
        const scoreVal = getPScore(pIdx + 1);
        const maxPoints = pt.points !== undefined ? Number(pt.points) : 2.0;
        const scoreColor = scoreVal >= 1.0 ? '#16a34a' : '#dc2626';
        practicalTableHtml += `
          <tr valign="middle" style="vertical-align: middle !important;">
            <td valign="middle" align="center" style="border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', serif; font-size: 11.5pt;">${pIdx + 1}</td>
            <td valign="middle" align="left" style="border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: left; vertical-align: middle !important; font-family: 'Times New Roman', serif; font-size: 11.5pt;">${pt.questionText}</td>
            <td valign="middle" align="center" style="border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', serif; font-size: 11.5pt;">${maxPoints.toFixed(1)} đ</td>
            <td valign="middle" align="center" style="border: 1.5pt solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', serif; font-size: 11.5pt; font-weight: bold; color: ${scoreColor};">${scoreVal.toFixed(1)} đ</td>
          </tr>
        `;
      });

      practicalTableHtml += `
            <tr valign="middle" style="background-color: #f8fafc; font-weight: bold; vertical-align: middle !important;">
              <td valign="middle" colspan="2" style="border: 1.5pt solid #94a3b8; padding: 8px; font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; text-align: right; vertical-align: middle !important; color: #1e3a8a;"><b>TỔNG ĐIỂM THỰC HÀNH</b></td>
              <td valign="middle" align="center" style="border: 1.5pt solid #94a3b8; padding: 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', Times, serif; font-size: 11.5pt;"><b>${totalMaxPracticalPoints.toFixed(1)} đ</b></td>
              <td valign="middle" align="center" style="border: 1.5pt solid #94a3b8; padding: 8px; text-align: center; vertical-align: middle !important; font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; font-weight: bold; color: #be123c;"><b>${totalPScore.toFixed(1)} đ</b></td>
            </tr>
          </tbody>
        </table>
      `;

      let submissionDetailsHtml = "";
      if (currentAnswers?.practical_image || currentAnswers?.practical_link || currentAnswers?.p1_score !== undefined || currentAnswers?.['practical_score_p-1'] !== undefined) {
        submissionDetailsHtml = `
          <div class="practical-submission-box" style="margin-top: 10px; border-top: 1.5pt solid #0f172a; padding-top: 8px; font-family: 'Times New Roman', serif; page-break-inside: avoid; break-inside: avoid;">
            <p style="margin: 4px 0; font-size: 13pt; font-weight: bold;">Thông tin nộp bài của học sinh:</p>
            ${currentAnswers.practical_link ? `<p style="margin: 3px 0; font-size: 13pt;">• Đường dẫn thực hành: <a href="${currentAnswers.practical_link}" style="color: #1d4ed8;">${currentAnswers.practical_link}</a></p>` : ''}
            ${currentAnswers.practical_image ? `
              <p style="margin: 4px 0; font-size: 13pt; font-weight: bold; color: #1e3a8a; text-align: left;">Hình ảnh minh chứng bài thực hành học sinh nộp:</p>
              <div style="margin-top: 8px; text-align: center;" align="center">
                <img src="${currentAnswers.practical_image}" style="width: 19.00cm; height: 12.50cm; border: 1px solid #94a3b8; border-radius: 6px; object-fit: contain;" alt="Practical submission image"/>
              </div>` : ''}
          </div>
        `;
      }

      return `
        <div class="practical-section-container" style="page-break-inside: avoid; break-inside: avoid;">
          <div style="font-size: 13pt; font-weight: bold; margin-top: 8px; margin-bottom: 6px; text-transform: uppercase; color: #1e3a8a; font-family: 'Times New Roman', Times, serif;">
            II. PHẦN THỰC HÀNH: <span style="color: red; font-weight: bold;">${totalPScore.toFixed(1)} ĐIỂM</span>
          </div>
          <p style="font-size: 12pt; margin-top: 2px; margin-bottom: 6px; font-family: 'Times New Roman', serif;">
            Bảng chi tiết kết quả đánh giá các câu hỏi thực hành của học sinh:
          </p>
          ${practicalTableHtml}
          ${submissionDetailsHtml}
        </div>
      `;
    })()}
  `;
}

export function downloadWordDocument(htmlContent: string, fileName: string) {
  const documentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Result Report</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 21.0cm 29.7cm; /* A4 Paper */
          margin: 1.0cm 1.5cm 1.0cm 1.5cm; /* Top: 1.0 cm; Bottom: 1.0 cm; Left: 1.50 cm; Right: 1.50 cm */
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body, p, div, li, td, th, blockquote, span, h1, h2, h3, h4, h5, h6 {
          font-family: "Times New Roman", "Time New Roman", Times, serif !important;
          font-size: 12.5pt !important;
          margin-top: 3pt !important;
          margin-bottom: 3pt !important;
          mso-margin-top-alt: 3pt !important;
          mso-margin-bottom-alt: 3pt !important;
        }
        body {
          font-family: "Times New Roman", Times, serif;
          font-size: 12.5pt;
          line-height: 1.4;
          color: #0f172a;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 12px 0;
        }
        th, td {
          border: 1px solid #94a3b8;
          padding: 6px 10px;
          text-align: left;
          vertical-align: middle;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
        }
        .text-center {
          text-align: center;
        }
        .font-bold {
          font-weight: bold;
        }
        h1, h2, h3, h4 {
          font-family: "Times New Roman", "Time New Roman", Times, serif !important;
          color: #1e3a8a;
          margin-top: 15px;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body style="font-family:'Times New Roman', Times, serif; font-size:12.5pt;">
      <div class="Section1" style="font-family:'Times New Roman', Times, serif; font-size:12.5pt;">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;

  const cleanFileNameHelper = (name: string): string => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-zA-Z0-9_.-]/g, "_")
      .replace(/__+/g, "_");
  };

  const cleanedName = cleanFileNameHelper(fileName);

  const blob = new Blob(['\ufeff' + documentHtml], {
    type: 'application/vnd.ms-word;charset=utf-8'
  });
  
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = cleanedName.endsWith('.doc') ? cleanedName : `${cleanedName}.doc`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function cleanClassNameForFile(cls: string): string {
  if (!cls || cls.toLowerCase() === 'all') return "CaLop";
  const normalized = removeDiacritics(cls).replace(/\s+/g, "");
  if (/^lop/i.test(normalized)) {
    return "Lop" + normalized.slice(3);
  }
  return "Lop" + normalized;
}

export function cleanSubjectForFile(subj: string): string {
  if (!subj) return "TinHoc";
  return removeDiacritics(subj).replace(/[^a-zA-Z0-9]/g, "");
}

export function cleanTestNameForFile(testName: string): string {
  if (!testName) return "DeThi";
  const simplified = testName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accent marks
    .replace(/[^a-zA-Z0-9Đđ_]/g, ""); // strip characters that aren't letters, numbers, underscores, or Đ/đ
  return simplified;
}

export function formatClassExportFileName(className: string, subject: string, testName: string): string {
  const classPart = cleanClassNameForFile(className);
  const subjectPart = cleanSubjectForFile(subject);
  const testPart = cleanTestNameForFile(testName);
  return `${classPart}_${subjectPart}_${testPart}`;
}

export function formatExcelScoreFileName(className: string, subject: string, testName: string): string {
  const classPart = cleanClassNameForFile(className);
  const subjectPart = cleanSubjectForFile(subject);
  const testPart = cleanTestNameForFile(testName);
  return `BangDiem_${classPart}_${subjectPart}_${testPart}`;
}

export async function downloadClassSubmissionsWordZip(examObj: any, className: string): Promise<void> {
  const zip = new JSZip();
  const submissions = examObj.submissions || [];
  const filteredSubs = className === 'all' 
    ? submissions 
    : submissions.filter((s: any) => s.studentClass === className);

  if (filteredSubs.length === 0) {
    throw new Error(`Không có dũng sỹ nào nộp bài thuộc bộ lọc lớp "${className}"`);
  }

  filteredSubs.forEach((studentSub: any) => {
    const htmlBody = generateStudentExamWordHtml(
      examObj,
      studentSub.answers || {},
      Number(studentSub.score) || 0,
      studentSub.studentName,
      studentSub.studentClass,
      studentSub.studentStt || "01"
    );

    const documentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Ket Qua Thi - ${studentSub.studentName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 21.0cm 29.7cm; /* A4 Paper */
            margin: 1.0cm 1.5cm 1.0cm 1.5cm; /* Top: 1.0 cm; Bottom: 1.0 cm; Left: 1.50 cm; Right: 1.50 cm */
            mso-header-margin: 36.0pt;
            mso-footer-margin: 36.0pt;
            mso-paper-source: 0;
          }
          div.Section1 {
            page: Section1;
          }
          body, p, div, li, td, th, blockquote, span, h1, h2, h3, h4, h5, h6 {
            font-family: "Times New Roman", "Time New Roman", Times, serif !important;
            margin-top: 3pt !important;
            margin-bottom: 3pt !important;
            mso-margin-top-alt: 3pt !important;
            mso-margin-bottom-alt: 3pt !important;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.4;
            color: #0f172a;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 12px 0;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 10px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
          }
        </style>
      </head>
      <body style="font-family:'Times New Roman', Times, serif; font-size:13pt;">
        <div class="Section1" style="font-family:'Times New Roman', Times, serif;">
          ${htmlBody}
        </div>
      </body>
      </html>
    `;

    const fileName = formatExportFileName(studentSub.studentClass, studentSub.studentStt || "01", studentSub.studentName);
    zip.file(`${fileName}.doc`, '\ufeff' + documentHtml);
  });

  const content = await zip.generateAsync({ type: "blob" });
  
  // Format ZIP filename following class_subject_exam format exactly
  const zipFileName = `${formatClassExportFileName(className, examObj.subject || 'TinHoc', examObj.testName)}.zip`;
  
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = zipFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function convertHtmlToPdfBlob(htmlBody: string): Promise<Blob> {
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "0";
  tempContainer.style.width = "816px"; // Standard width for A4 (96 DPI * 8.5 inches = 816px)
  tempContainer.style.background = "#ffffff";
  tempContainer.style.color = "#0f172a";
  tempContainer.style.paddingLeft = "58px"; // Left margin proportional to A4 (1.5cm / 21cm * 816px)
  tempContainer.style.paddingRight = "58px"; // Right margin proportional to A4 (1.5cm / 21cm * 816px)
  tempContainer.style.paddingTop = "39px"; // Top margin proportional to A4 (1.0cm / 21cm * 816px)
  tempContainer.style.paddingBottom = "39px"; // Bottom margin proportional to A4 (1.0cm / 21cm * 816px)
  tempContainer.style.fontFamily = "'Times New Roman', Times, serif";
  tempContainer.style.boxSizing = "border-box";
  
  tempContainer.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        background-color: #ffffff;
        color: #0f172a;
        margin: 0;
        padding: 0;
      }
      body, p, div, li, td, th, blockquote, span, h1, h2, h3, h4, h5, h6 {
        font-family: "Times New Roman", "Time New Roman", Times, serif !important;
        font-size: 12.5pt !important;
        line-height: 1.45 !important;
      }
      p, div, li {
        margin-top: 3px !important;
        margin-bottom: 3px !important;
      }
      table {
        border-collapse: collapse;
        width: 100% !important;
        margin: 5px 0 !important;
      }
      .exam-question-card {
        margin-bottom: 12px !important;
      }
      .exam-question-card td {
        padding: 8px 12px !important;
      }
      table.header-table, table.header-table td, table.header-table th, table.no-border-table, table.no-border-table td, table.mcq-options-table, table.mcq-options-table td {
        border: none !important;
        border-width: 0 !important;
      }
      table.mcq-options-table {
        margin: 5px 0 6px 0 !important;
      }
      table.mcq-options-table td {
        padding: 4px 6px !important;
        line-height: 1.4 !important;
      }
      .explanation-box {
        margin-top: 6px !important;
        padding-top: 6px !important;
        line-height: 1.4 !important;
      }
      th, td {
        border: 1px solid #94a3b8 !important;
        padding: 4px 8px !important;
        text-align: left;
        vertical-align: middle !important;
      }
      table.header-table td, table.header-table th {
        vertical-align: top !important;
      }
      table:not(.header-table) tr, table:not(.header-table) th, table:not(.header-table) td {
        vertical-align: middle !important;
      }
      .score-summary-table td, .exam-question-card td {
        vertical-align: middle !important;
      }
      .practical-table, .practical-table tr, .practical-table td, .practical-table th, .practical-table td > *, .practical-table th > * {
        vertical-align: middle !important;
      }
      td > p, th > p, td > div, th > div {
        vertical-align: middle !important;
      }
      th {
        background-color: #f1f5f9 !important;
        font-weight: bold;
      }
      .text-center {
        text-align: center !important;
      }
      .font-bold {
        font-weight: bold !important;
      }
      h1, h2, h3, h4 {
        color: #1e3a8a !important;
        margin-top: 6px !important;
        margin-bottom: 4px !important;
      }
      a {
        color: #1d4ed8 !important;
        text-decoration: underline !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
    </style>
    <div style="width: 100%;">
      ${htmlBody}
    </div>
  `;
  
  document.body.appendChild(tempContainer);
  
  try {
    // Dynamic page break adjustment:
    // A4 height in pixels for the container:
    const pageHeightPx = Math.floor(tempContainer.offsetWidth * (297 / 210));
    
    // Find all question cards, practical containers, score summaries, and tables
    const breakableElements = Array.from(
      tempContainer.querySelectorAll<HTMLElement>(
        ".exam-question-card, .score-summary-table, .practical-table, .practical-section-container, .practical-submission-box"
      )
    );

    breakableElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = tempContainer.getBoundingClientRect();
      const elementTop = rect.top - containerRect.top;
      const elementHeight = rect.height;
      const elementBottom = elementTop + elementHeight;

      const pageNum = Math.floor(elementTop / pageHeightPx);
      const pageBottom = (pageNum + 1) * pageHeightPx;

      // If element starts before pageBottom but ends after pageBottom, and fits on a single page:
      // Push it to start cleanly at top of next page!
      if (elementTop < pageBottom && elementBottom > (pageBottom - 10) && elementHeight < pageHeightPx) {
        const spacerHeight = Math.ceil(pageBottom - elementTop) + 6;
        const spacer = document.createElement("div");
        spacer.className = "pdf-page-break-spacer";
        spacer.style.height = `${spacerHeight}px`;
        spacer.style.width = "100%";
        spacer.style.display = "block";
        el.parentNode?.insertBefore(spacer, el);
      }
    });

    const canvas = await html2canvas(tempContainer, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        // Enforce vertical alignment on question and practical tables and all their rows & cells
        const styleTag = clonedDoc.createElement('style');
        styleTag.textContent = `
          .practical-table,
          .practical-table thead,
          .practical-table tbody,
          .practical-table tr,
          .practical-table th,
          .practical-table td,
          .practical-table th *,
          .practical-table td *,
          table:not(.header-table) th,
          table:not(.header-table) td,
          table:not(.header-table) tr,
          .score-summary-table th,
          .score-summary-table td,
          .score-summary-table tr {
            vertical-align: middle !important;
          }
          .practical-table th,
          .practical-table td {
            vertical-align: middle !important;
            display: table-cell !important;
          }
        `;
        clonedDoc.head?.appendChild(styleTag);

        const tables = clonedDoc.querySelectorAll('table');
        tables.forEach((tbl) => {
          if (!tbl.classList.contains('header-table')) {
            tbl.style.setProperty('vertical-align', 'middle', 'important');
            tbl.setAttribute('valign', 'middle');
          }
        });
        const rows = clonedDoc.querySelectorAll('tr');
        rows.forEach((r: any) => {
          const isHeader = r.closest('.header-table');
          if (!isHeader) {
            r.style.setProperty('vertical-align', 'middle', 'important');
            r.setAttribute('valign', 'middle');
          }
        });
        const cells = clonedDoc.querySelectorAll('th, td');
        cells.forEach((c: any) => {
          const isHeader = c.closest('.header-table');
          if (!isHeader) {
            c.style.setProperty('vertical-align', 'middle', 'important');
            c.setAttribute('valign', 'middle');
            // Remove top/bottom margin of inner blocks that push text away from vertical middle
            const innerBlocks = c.querySelectorAll('p, div, span, b, strong, em');
            innerBlocks.forEach((b: any) => {
              b.style.setProperty('vertical-align', 'middle', 'important');
              b.setAttribute('valign', 'middle');
              if (b.tagName === 'P' || b.tagName === 'DIV') {
                b.style.marginTop = '0px';
                b.style.marginBottom = '0px';
              }
            });
          }
        });

        // Dedicated pass for the practical questions table
        const practicalAll = clonedDoc.querySelectorAll('.practical-table, .practical-table thead, .practical-table tbody, .practical-table tr, .practical-table th, .practical-table td');
        practicalAll.forEach((el: any) => {
          el.setAttribute('valign', 'middle');
          el.style.setProperty('vertical-align', 'middle', 'important');
        });
        const practicalCellsOnly = clonedDoc.querySelectorAll('.practical-table th, .practical-table td');
        practicalCellsOnly.forEach((c: any) => {
          c.setAttribute('valign', 'middle');
          c.style.setProperty('vertical-align', 'middle', 'important');
          c.style.setProperty('display', 'table-cell', 'important');
          const inners = c.querySelectorAll('*');
          inners.forEach((inEl: any) => {
            inEl.setAttribute('valign', 'middle');
            inEl.style.setProperty('vertical-align', 'middle', 'important');
            inEl.style.setProperty('margin-top', '0px', 'important');
            inEl.style.setProperty('margin-bottom', '0px', 'important');
          });
        });
      }
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    // Map interactive links from tempContainer to jsPDF link annotations
    const links = tempContainer.querySelectorAll("a");
    const containerRect = tempContainer.getBoundingClientRect();
    const scale = imgWidth / containerRect.width; // pixels to mm conversion scale

    links.forEach((link: HTMLAnchorElement) => {
      const href = link.getAttribute("href") || link.href;
      if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
        const rects = link.getClientRects();
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i];
          const relativeLeft = rect.left - containerRect.left;
          const relativeTop = rect.top - containerRect.top;
          const w = rect.width;
          const h = rect.height;

          const pdfX = relativeLeft * scale;
          const pdfY = relativeTop * scale;
          const pdfW = w * scale;
          const pdfH = h * scale;

          // Find which page the link lies on
          const pageIndex = Math.floor(pdfY / pageHeight);
          const localY = pdfY % pageHeight;

          const totalPages = Math.ceil(imgHeight / pageHeight);
          if (pageIndex < totalPages) {
            pdf.setPage(pageIndex + 1); // 1-indexed page
            pdf.link(pdfX, localY, pdfW, pdfH, { url: href });
          }
        }
      }
    });
    
    return pdf.output("blob");
  } finally {
    document.body.removeChild(tempContainer);
  }
}

export async function downloadStudentExamPdf(
  examObj: any,
  currentAnswers: Record<string, string>,
  currentScore: number,
  currentStudentName: string,
  currentStudentClass: string,
  currentStudentStt: string
): Promise<void> {
  const htmlBody = generateStudentExamWordHtml(
    examObj,
    currentAnswers,
    currentScore,
    currentStudentName,
    currentStudentClass,
    currentStudentStt
  );
  
  const blob = await convertHtmlToPdfBlob(htmlBody);
  const finalFileName = formatExportFileName(currentStudentClass, currentStudentStt, currentStudentName);
  
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalFileName.endsWith('.pdf') ? finalFileName : `${finalFileName}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function downloadClassSubmissionsPdfZip(examObj: any, className: string): Promise<void> {
  const zip = new JSZip();
  const submissions = examObj.submissions || [];
  const filteredSubs = className === 'all' 
    ? submissions 
    : submissions.filter((s: any) => s.studentClass === className);

  if (filteredSubs.length === 0) {
    throw new Error(`Không có dũng sỹ nào nộp bài thuộc bộ lọc lớp "${className}"`);
  }

  for (let i = 0; i < filteredSubs.length; i++) {
    const studentSub = filteredSubs[i];
    const htmlBody = generateStudentExamWordHtml(
      examObj,
      studentSub.answers || {},
      Number(studentSub.score) || 0,
      studentSub.studentName,
      studentSub.studentClass,
      studentSub.studentStt || "01"
    );

    const pdfBlob = await convertHtmlToPdfBlob(htmlBody);
    const fileName = formatExportFileName(studentSub.studentClass, studentSub.studentStt || "01", studentSub.studentName);
    zip.file(`${fileName}.pdf`, pdfBlob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const zipFileName = `PDF_${formatClassExportFileName(className, examObj.subject || 'TinHoc', examObj.testName)}.zip`;
  
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = zipFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatClassNameForReport(clsName: string): string {
  let c = clsName || 'Tự do';
  if (c.includes(' - ')) {
    const parts = c.split(' - ');
    let right = parts[1].trim();
    if (!right.toLowerCase().startsWith('lớp')) {
      right = 'Lớp ' + right;
    }
    return right;
  }
  if (c !== 'Tự do' && !c.toLowerCase().startsWith('lớp')) {
    return 'Lớp ' + c;
  }
  return c;
}

export type ExcelExportType = 'default' | 'score_hki' | 'score_hkii' | 'summary_hki' | 'summary_hkii';

export const formatClassNameOnly = (rawClass: string, fallbackGrade?: number | string): string => {
  if (!rawClass) return '';
  let str = String(rawClass).trim();
  // Remove "Khối X - " or "Khối X -"
  str = str.replace(/^Khối\s*\d+\s*[-–—:]\s*/i, '');
  // Remove "Lớp " or "Lớp: "
  str = str.replace(/^Lớp\s*[:\s]*/i, '');
  str = str.trim();

  // If it's a bare number like "1" or "2" and we have a grade like 3, format as "3.1"
  if (/^\d+$/.test(str) && fallbackGrade) {
    const g = String(fallbackGrade).trim();
    if (!str.startsWith(g)) {
      str = `${g}.${str}`;
    }
  }
  return str;
};

export async function downloadClassScoresExcel(
  examObj: any, 
  reportClassFilter: string, 
  exportType: ExcelExportType = 'default'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  let sheetName = 'Bảng Điểm';
  if (exportType === 'score_hki') sheetName = 'Bảng Điểm HKI';
  else if (exportType === 'score_hkii') sheetName = 'Bảng Điểm HKII';
  else if (exportType === 'summary_hki') sheetName = 'Bảng Tổng Hợp HKI';
  else if (exportType === 'summary_hkii') sheetName = 'Bảng Tổng Hợp HKII';

  const worksheet = workbook.addWorksheet(sheetName);

  if (exportType === 'score_hki' || exportType === 'score_hkii') {
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Mã học sinh', key: 'studentId', width: 14 },
      { header: 'Họ và tên', key: 'name', width: 26 },
      { header: 'Ngày sinh', key: 'dob', width: 14 },
      { header: 'Mức đạt được', key: 'level', width: 15 },
      { header: 'Điểm KTĐK', key: 'score', width: 14 },
      { header: 'Mã nhận xét', key: 'commentCode', width: 14 },
      { header: 'Nội dung nhận xét', key: 'comment', width: 45 },
      { header: 'Thời điểm đánh giá', key: 'period', width: 20 }
    ];
  } else if (exportType === 'summary_hki' || exportType === 'summary_hkii') {
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Họ và tên', key: 'name', width: 26 },
      { header: 'Lớp', key: 'class', width: 12 },
      { header: 'Điểm trắc nghiệm', key: 'theory', width: 18 },
      { header: 'Điểm thực hành', key: 'practical', width: 18 },
      { header: 'Tổng điểm', key: 'total', width: 14 },
      { header: 'Mức đạt được', key: 'level', width: 15 }
    ];
  } else {
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Họ tên', key: 'name', width: 28 },
      { header: 'Lớp', key: 'class', width: 12 },
      { header: 'Điểm trắc nghiệm', key: 'theory', width: 18 },
      { header: 'Điểm thực hành', key: 'practical', width: 18 },
      { header: 'Tổng điểm', key: 'total', width: 14 }
    ];
  }

  let submissions = examObj.submissions || [];
  if (reportClassFilter !== 'all') {
    submissions = submissions.filter((s: any) => s.studentClass === reportClassFilter);
  }

  const sortedSubs = [...submissions].sort((a: any, b: any) => {
    const classComp = String(a.studentClass || '').localeCompare(String(b.studentClass || ''));
    if (classComp !== 0) return classComp;
    const sttA = Number(a.studentStt || 0);
    const sttB = Number(b.studentStt || 0);
    if (!isNaN(sttA) && !isNaN(sttB) && sttA !== 0 && sttB !== 0) {
      return sttA - sttB;
    }
    return String(a.studentStt || '').localeCompare(String(b.studentStt || ''));
  });

  const hasPractical = examObj.isPracticalEnabled === true;

  const getStudentComment = (sub: any, scoreVal: number) => {
    if (sub.teacherComment && String(sub.teacherComment).trim()) return String(sub.teacherComment).trim();
    if (sub.comment && String(sub.comment).trim()) return String(sub.comment).trim();
    if (hasPractical) {
      if (scoreVal >= 9) return "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết và thực hành xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo.";
      if (scoreVal >= 7) return "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm, kỹ năng thực hành tốt, tích cực và chủ động trong các hoạt động học tập.";
      if (scoreVal >= 5) return "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập thực hành nhiều hơn.";
      return "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm và kỹ năng thực hành cơ bản, cần được hướng dẫn rèn luyện thêm.";
    } else {
      if (scoreVal >= 9) return "Hoàn thành tốt. Học sinh nắm vững kiến thức lý thuyết xuất sắc, có năng lực tự học và giải quyết vấn đề sáng tạo.";
      if (scoreVal >= 7) return "Hoàn thành tốt. Học sinh nắm vững kiến thức trọng tâm tốt, tích cực và chủ động trong các hoạt động học tập.";
      if (scoreVal >= 5) return "Hoàn thành. Học sinh cơ bản đạt được các kiến thức, kỹ năng cơ bản của môn học, cần tăng cường luyện tập và ôn tập thêm.";
      return "Chưa hoàn thành. Học sinh chưa nắm vững lý thuyết trọng tâm cơ bản, cần được hướng dẫn rèn luyện thêm.";
    }
  };

  sortedSubs.forEach((sub: any, idx: number) => {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0, p5 = 0;
    if (sub.answers) {
      p1 = sub.answers.p1_score !== undefined ? Number(sub.answers.p1_score) : (sub.answers[`practical_score_p-1`] !== undefined ? Number(sub.answers[`practical_score_p-1`]) : 0);
      p2 = sub.answers.p2_score !== undefined ? Number(sub.answers.p2_score) : (sub.answers[`practical_score_p-2`] !== undefined ? Number(sub.answers[`practical_score_p-2`]) : 0);
      p3 = sub.answers.p3_score !== undefined ? Number(sub.answers.p3_score) : (sub.answers[`practical_score_p-3`] !== undefined ? Number(sub.answers[`practical_score_p-3`]) : 0);
      p4 = sub.answers.p4_score !== undefined ? Number(sub.answers.p4_score) : (sub.answers[`practical_score_p-4`] !== undefined ? Number(sub.answers[`practical_score_p-4`]) : 0);
      p5 = sub.answers.p5_score !== undefined ? Number(sub.answers.p5_score) : (sub.answers[`practical_score_p-5`] !== undefined ? Number(sub.answers[`practical_score_p-5`]) : 0);
    }

    const practicalSum = examObj.isPracticalEnabled === true ? (p1 + p2 + p3 + p4 + p5) : 0;
    const practicalAvg = sub.totalPracticalScore !== undefined ? sub.totalPracticalScore : (examObj.isPracticalEnabled === true ? practicalSum : 0);
    
    const theoryScore = sub.theoryScore !== undefined 
      ? sub.theoryScore 
      : (sub.totalPracticalScore !== undefined 
        ? (Number(sub.score || 0) - Number(sub.totalPracticalScore || 0)) 
        : Number(sub.score || 0));

    const rawScore = Number(sub.score || 0);
    const roundedScore = Math.round(rawScore);

    // Mức đạt được HKI: T (9, 10), H (5, 6, 7, 8), C (1, 2, 3, 4)
    // Mức đạt được HKII: T (7, 8, 9, 10), H (5, 6), C (1, 2, 3, 4)
    let levelHkI = 'C';
    if (roundedScore >= 9) levelHkI = 'T';
    else if (roundedScore >= 5) levelHkI = 'H';
    else levelHkI = 'C';

    let levelHkII = 'C';
    if (roundedScore >= 7) levelHkII = 'T';
    else if (roundedScore >= 5) levelHkII = 'H';
    else levelHkII = 'C';

    const formattedStt = sub.studentStt || String(idx + 1).padStart(2, '0');
    const formattedName = sub.studentName || '';
    const formattedClass = sub.studentClass || '';
    const commentText = getStudentComment(sub, rawScore);

    if (exportType === 'score_hki') {
      worksheet.addRow({
        stt: formattedStt,
        studentId: '',
        name: formattedName,
        dob: '',
        level: levelHkI,
        score: roundedScore,
        commentCode: '',
        comment: commentText,
        period: 'CK1'
      });
    } else if (exportType === 'score_hkii') {
      worksheet.addRow({
        stt: formattedStt,
        studentId: '',
        name: formattedName,
        dob: '',
        level: levelHkII,
        score: roundedScore,
        commentCode: '',
        comment: commentText,
        period: 'CK2'
      });
    } else if (exportType === 'summary_hki') {
      worksheet.addRow({
        stt: formattedStt,
        name: formattedName,
        class: formatClassNameOnly(formattedClass, examObj.grade),
        theory: Number(theoryScore).toFixed(1).replace(/\.0$/, '') + 'đ',
        practical: examObj.isPracticalEnabled === false ? '—' : Number(practicalAvg).toFixed(1).replace(/\.0$/, '') + 'đ',
        total: roundedScore + 'đ',
        level: levelHkI
      });
    } else if (exportType === 'summary_hkii') {
      worksheet.addRow({
        stt: formattedStt,
        name: formattedName,
        class: formatClassNameOnly(formattedClass, examObj.grade),
        theory: Number(theoryScore).toFixed(1).replace(/\.0$/, '') + 'đ',
        practical: examObj.isPracticalEnabled === false ? '—' : Number(practicalAvg).toFixed(1).replace(/\.0$/, '') + 'đ',
        total: roundedScore + 'đ',
        level: levelHkII
      });
    } else {
      worksheet.addRow({
        stt: formattedStt,
        name: formattedName,
        class: formatClassNameOnly(formattedClass, examObj.grade),
        theory: Number(theoryScore).toFixed(1).replace(/\.0$/, '') + 'đ',
        practical: examObj.isPracticalEnabled === false ? '—' : Number(practicalAvg).toFixed(1).replace(/\.0$/, '') + 'đ',
        total: Number(sub.score || 0).toFixed(1).replace(/\.0$/, '') + 'đ'
      });
    }
  });

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: 'Times New Roman',
        size: 13,
        bold: rowNumber === 1
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };

      if (rowNumber === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' }
        };
      }

      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  let typePrefix = '';
  if (exportType === 'score_hki') typePrefix = 'Diem_HKI_';
  else if (exportType === 'score_hkii') typePrefix = 'Diem_HKII_';
  else if (exportType === 'summary_hki') typePrefix = 'TongHop_HKI_';
  else if (exportType === 'summary_hkii') typePrefix = 'TongHop_HKII_';

  const finalFileName = typePrefix + formatExcelScoreFileName(
    reportClassFilter, 
    examObj.subject || 'TinHoc', 
    examObj.testName
  ) + ".xlsx";

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadClassReportWord(examObj: any, classNameFilter: string, scoreFilter: string): void {
  const submissions = examObj.submissions || [];
  
  // Filter by Class
  let filtered = classNameFilter === 'all' 
    ? submissions 
    : submissions.filter((s: any) => s.studentClass === classNameFilter);
    
  // Filter by Score
  if (scoreFilter === 'above5') {
    filtered = filtered.filter((s: any) => Number(s.score) >= 5);
  } else if (scoreFilter === 'below5') {
    filtered = filtered.filter((s: any) => Number(s.score) < 5);
  }
  
  // High level stats
  const totalCount = filtered.length;
  
  let count10 = 0;
  let count9 = 0;
  let count8 = 0;
  let count7 = 0;
  let count6 = 0;
  let count5 = 0;
  let countBelow5 = 0;

  filtered.forEach((s: any) => {
    const sc = Number(s.score) || 0;
    if (sc === 10) count10++;
    else if (sc >= 9 && sc < 10) count9++;
    else if (sc >= 8 && sc < 9) count8++;
    else if (sc >= 7 && sc < 8) count7++;
    else if (sc >= 6 && sc < 7) count6++;
    else if (sc >= 5 && sc < 6) count5++;
    else if (sc < 5) countBelow5++;
  });

  const pct10 = totalCount > 0 ? ((count10 / totalCount) * 100).toFixed(0) : "0";
  const pct9 = totalCount > 0 ? ((count9 / totalCount) * 100).toFixed(0) : "0";
  const pct8 = totalCount > 0 ? ((count8 / totalCount) * 100).toFixed(0) : "0";
  const pct7 = totalCount > 0 ? ((count7 / totalCount) * 100).toFixed(0) : "0";
  const pct6 = totalCount > 0 ? ((count6 / totalCount) * 100).toFixed(0) : "0";
  const pct5 = totalCount > 0 ? ((count5 / totalCount) * 100).toFixed(0) : "0";
  const pctBelow5 = totalCount > 0 ? ((countBelow5 / totalCount) * 100).toFixed(0) : "0";

  // Header Table
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${(examObj.district || "ỦY BAN NHÂN DÂN XÃ ĐÔNG THẠNH").toUpperCase()}\n`, font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${(examObj.school || "TIỂU HỌC TRẦN VĂN DANH").toUpperCase()}`, font: "Times New Roman", size: 24, bold: true })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 5, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [] })]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT\n", font: "Times New Roman", size: 24, bold: true }),
                  new TextRun({ text: "NAM Độc lập - Tự do - Hạnh phúc", font: "Times New Roman", size: 24, bold: true })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Split title into 3 separate paragraphs each on their own line/row as requested
  const titleParagraph1 = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
    children: [
      new TextRun({
        text: "BÁO CÁO KẾT QUẢ BÀI THI TRỰC TUYẾN",
        font: "Times New Roman",
        size: 28, // 14pt (28 in dxa size)
        bold: true,
        color: "0284C7" // Blue as in BaoCao.pdf
      })
    ]
  });

  const titleParagraph2 = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100 },
    children: [
      new TextRun({
        text: `ĐỀ THI: ${examObj.testName.toUpperCase()}`,
        font: "Times New Roman",
        size: 24, // 12pt (24 in dxa size)
        bold: true,
      })
    ]
  });

  const titleParagraph3 = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 150 },
    children: [
      new TextRun({
        text: `Khối ${examObj.grade} - ${classNameFilter === 'all' ? 'Tất cả các lớp' : formatClassNameForReport(classNameFilter)}`,
        font: "Times New Roman",
        size: 24, // 12pt (24 in dxa size)
      })
    ]
  });

  // Section 1 Header
  const section1Header = new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: "I. THỐNG KÊ SƠ BỘ",
        font: "Times New Roman",
        size: 24, // 12pt (24 in dxa size)
        bold: true,
      })
    ]
  });

  // Stats Table (2 Columns)
  const statsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Tổng số học sinh trong báo cáo: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${totalCount} học sinh`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Số học sinh đạt 7 điểm: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${count7} (${pct7}%)`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Số học sinh đạt 10 điểm: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${count10} (${pct10}%)`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Số học sinh đạt 6 điểm: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${count6} (${pct6}%)`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Số học sinh đạt 9 điểm: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${count9} (${pct9}%)`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Số học sinh đạt 5 điểm: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${count5} (${pct5}%)`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Số học sinh đạt 8 điểm: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${count8} (${pct8}%)`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "• Số học sinh dưới 5 điểm: ", font: "Times New Roman", size: 24 }),
                  new TextRun({ text: `${countBelow5} (${pctBelow5}%)`, font: "Times New Roman", size: 24, bold: true, color: "000000" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Section 2 Header
  const section2Header = new Paragraph({
    spacing: { before: 300, after: 100 },
    children: [
      new TextRun({
        text: "II. DANH SÁCH CHI TIẾT ĐIỂM SỐ",
        font: "Times New Roman",
        size: 24, // 12pt (24 in dxa size)
        bold: true,
      })
    ]
  });

  // Student Table with double border style to 100% match BaoCao.pdf double rule table lines
  const borderThinStyle = { style: BorderStyle.DOUBLE, size: 12, color: '000000' };

  const headerCols = [
    { textLines: ["STT"], pct: 8 },
    { textLines: ["Họ và tên"], pct: 25 },
    { textLines: ["Lớp học"], pct: 15 },
    { textLines: ["Điểm", "Lý thuyết"], pct: 15 },
    { textLines: ["Điểm", "Thực hành"], pct: 15 },
    { textLines: ["Tổng điểm"], pct: 12 },
    { textLines: ["Xếp loại"], pct: 15 }
  ];

  const tableHeaderCells = headerCols.map(col => new TableCell({
    width: { size: col.pct, type: WidthType.PERCENTAGE },
    borders: {
      top: borderThinStyle,
      left: borderThinStyle,
      bottom: borderThinStyle,
      right: borderThinStyle
    },
    shading: { fill: 'FFFFFF' },
    margins: { top: 120, bottom: 120, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: col.textLines.map(lineText => new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: lineText,
          font: "Times New Roman",
          size: 24, // 12pt (24 in dxa size)
          bold: true
        })
      ]
    }))
  }));

  const tableRows = [
    new TableRow({ children: tableHeaderCells })
  ];

  if (filtered.length === 0) {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 7,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: borderThinStyle,
              left: borderThinStyle,
              bottom: borderThinStyle,
              right: borderThinStyle
            },
            margins: { top: 120, bottom: 120, left: 100, right: 100 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Chưa ghi nhận dữ liệu kết quả học tập ở bộ lọc đã chọn!",
                    font: "Times New Roman",
                    size: 24 // 12pt (24 in dxa size)
                  })
                ]
              })
            ]
          })
        ]
      })
    );
  } else {
    filtered.forEach((s: any, idx: number) => {
      const scoreNum = Number(s.score) || 0;
      let rating = "Chưa hoàn thành";
      let ratingColor = "EF4444"; // Red for incomplete
      
      if (scoreNum >= 9.0) {
        rating = "Hoàn thành tốt"; // Classic Vietnamese primary standard equivalent, let's keep robust
        ratingColor = "16A34A";
      } else if (scoreNum >= 5.0) {
        rating = "Hoàn thành";
        ratingColor = "16A34A";
      }
      
      // Fallback matching rating from PDF exactly
      if (scoreNum >= 5.0) {
        rating = "Hoàn thành";
        ratingColor = "16A34A";
      } else {
        rating = "Chưa hoàn thành";
        ratingColor = "EF4444";
      }

      const ltScore = s.theoryScore !== undefined ? s.theoryScore : (scoreNum - (s.totalPracticalScore || 0));
      const thScore = s.totalPracticalScore || 0;

      const rowCells = [
        { text: String(idx + 1), align: AlignmentType.CENTER, bold: false, color: "000000" },
        { text: s.studentName, align: AlignmentType.CENTER, bold: true, color: "000000" }, // Student Name is centered and bold in BaoCao.pdf
        { text: formatClassNameForReport(s.studentClass), align: AlignmentType.CENTER, bold: false, color: "000000" },
        { text: `${Number(ltScore).toFixed(1)}đ`, align: AlignmentType.CENTER, bold: false, color: "000000" },
        { text: `${Number(thScore).toFixed(1)}đ`, align: AlignmentType.CENTER, bold: false, color: "000000" },
        { text: `${scoreNum.toFixed(1)}đ`, align: AlignmentType.CENTER, bold: true, color: "EF4444" }, // Red as in BaoCao.pdf
        { text: rating, align: AlignmentType.CENTER, bold: true, color: ratingColor } // Green/Red as in BaoCao.pdf
      ].map(cellInfo => new TableCell({
        borders: {
          top: borderThinStyle,
          left: borderThinStyle,
          bottom: borderThinStyle,
          right: borderThinStyle
        },
        margins: { top: 120, bottom: 120, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: cellInfo.align,
            children: [
              new TextRun({
                text: cellInfo.text,
                font: "Times New Roman",
                size: 24, // 12pt (24 in dxa size)
                bold: cellInfo.bold,
                color: cellInfo.color
              })
            ]
          })
        ]
      }));

      tableRows.push(new TableRow({ children: rowCells }));
    });
  }

  const studentsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });

  // Signatures Table (No Borders)
  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Người báo cáo \n\n\n\n",
                    font: "Times New Roman",
                    size: 24, // 12pt (24 in dxa size)
                    bold: true,
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Hiệu trưởng",
                    font: "Times New Roman",
                    size: 24, // 12pt (24 in dxa size)
                    bold: true,
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "(Ký và ghi rõ họ tên đóng dấu)",
                    font: "Times New Roman",
                    size: 24, // 12pt (24 in dxa size)
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Create document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 567,     // ~1cm
            bottom: 567,  // ~1cm
            left: 850,    // ~1.5cm
            right: 850,   // ~1.5cm
          }
        }
      },
      children: [
        headerTable,
        new Paragraph({ spacing: { before: 200 } }),
        titleParagraph1,
        titleParagraph2,
        titleParagraph3,
        new Paragraph({ spacing: { after: 100 } }),
        section1Header,
        statsTable,
        new Paragraph({
          children: [
            new TextRun({
              text: "", // Blank line (correctly exactly 1 blank line space)
              font: "Times New Roman",
              size: 24
            })
          ]
        }),
        section2Header,
        studentsTable,
        new Paragraph({ spacing: { before: 400 } }),
        signaturesTable
      ]
    }]
  });

  const classPart = cleanClassNameForFile(classNameFilter);
  const subjectPart = cleanSubjectForFile(examObj.subject || 'TinHoc');
  const testPart = cleanTestNameForFile(examObj.testName);
  const finalFileName = `BaoCao_${classPart}_${subjectPart}_${testPart}.docx`;

  Packer.toBlob(doc).then((blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  });
}
