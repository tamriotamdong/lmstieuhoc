import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  Activity, 
  Cpu, 
  Download, 
  Copy, 
  ChevronDown, 
  Edit3, 
  Eye, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Undo2,
  Redo2,
  List,
  Search,
  BookMarked,
  MessageSquare,
  Award,
  Trash2,
  Save,
  Plus,
  RefreshCw,
  FileCheck,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SoundEffects } from '../App';
import { INTERNAL_SKKN_LIBRARY, InternalSkkn } from '../data/skknLibrary';

// Custom lightweight Markdown-to-HTML formatter to render the AI responses beautifully in our UI without external libraries
export function formatMarkdownToHtml(mdText: string): string {
  if (!mdText) return "<p class='text-slate-400 italic'>Chưa có nội dung soạn thảo...</p>";
  
  let html = mdText;
  
  // Clean potential dangerous HTML characters to avoid broken raw inserts, but keep basic formatting
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold & Italic markdown support
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Headings - convert to HTML with consistent spacing
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-slate-800 mt-5 mb-2 border-b pb-1">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-black text-[#2454A6] mt-6 mb-3">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-black text-slate-900 border-l-4 border-[#2454A6] pl-3 my-4">$1</h2>');

  // Tables parsing (convert markdown tables into visually structured HTML tables)
  const lines = html.split('\n');
  let inTable = false;
  let tableHeaderParsed = false;
  let tableHtml = '';
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        tableHtml = '<div class="overflow-x-auto my-4 shadow-sm border border-slate-250 rounded-xl"><table class="min-w-full border-collapse" style="width: 100%; border: 1px solid #ddd;"><thead class="bg-slate-100">';
      }
      
      // Separator row
      if (trimmed.match(/^[|\s:\-]+$/)) {
        continue;
      }
      
      if (!tableHeaderParsed) {
        tableHeaderParsed = true;
        tableHtml += '<tr>';
        cells.forEach(cell => {
          tableHtml += `<th class="px-3 py-2 text-left font-bold text-slate-800 border border-slate-300 bg-slate-50 font-serif" style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background-color: #f1f5f9; font-size: 11pt;">${cell}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr class="hover:bg-slate-50/50 transition-colors">';
        cells.forEach(cell => {
          tableHtml += `<td class="px-3 py-2 text-slate-700 border border-slate-200 font-serif" style="border: 1px solid #e2e8f0; padding: 10px; font-size: 11pt; text-align: left; vertical-align: middle;">${cell}</td>`;
        });
        tableHtml += '</tr>';
      }
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table></div>';
        processedLines.push(tableHtml);
        tableHtml = '';
      }
      processedLines.push(line);
    }
  }
  
  if (inTable) {
    tableHtml += '</tbody></table></div>';
    processedLines.push(tableHtml);
  }

  // Handle bullets, numbers and paragraphs
  let inList = false;
  let listHtml = '';
  const finalNumberedAndBulletedLines: string[] = [];

  for (let j = 0; j < processedLines.length; j++) {
    const line = processedLines[j];
    const trimmed = line.trim();

    // Skip table placeholders already compiled
    if (trimmed.startsWith('<div class="overflow-x-auto')) {
      if (inList) {
        inList = false;
        listHtml += '</ul>';
        finalNumberedAndBulletedLines.push(listHtml);
        listHtml = '';
      }
      finalNumberedAndBulletedLines.push(line);
      continue;
    }

    // Unordered List matching
    const bulletMatch = line.match(/^(\s*)([\-\*+])\s+(.*)$/);
    // Numbered List matching
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      const content = bulletMatch[3];
      if (!inList) {
        inList = true;
        listHtml = '<ul class="my-3 pl-6 list-disc space-y-1 text-slate-800 leading-relaxed font-serif" style="margin-top: 10pt; margin-bottom: 10pt; padding-left: 20pt; font-size: 13pt;">';
      }
      listHtml += `<li class="my-1.5 text-slate-800 leading-relaxed font-serif" style="margin-bottom: 6pt; text-align: justify;">${content}</li>`;
    } else if (numMatch) {
      const content = numMatch[3];
      if (!inList) {
        inList = true;
        listHtml = '<ol class="my-3 pl-6 list-decimal space-y-1 text-slate-800 leading-relaxed font-serif" style="margin-top: 10pt; margin-bottom: 10pt; padding-left: 20pt; font-size: 13pt;">';
      }
      listHtml += `<li class="my-1.5 text-slate-800 leading-relaxed font-serif" style="margin-bottom: 6pt; text-align: justify;">${content}</li>`;
    } else {
      if (inList) {
        inList = false;
        if (listHtml.startsWith('<ul')) {
          listHtml += '</ul>';
        } else {
          listHtml += '</ol>';
        }
        finalNumberedAndBulletedLines.push(listHtml);
        listHtml = '';
      }
      finalNumberedAndBulletedLines.push(line);
    }
  }

  if (inList) {
    if (listHtml.startsWith('<ul')) {
      listHtml += '</ul>';
    } else {
      listHtml += '</ol>';
    }
    finalNumberedAndBulletedLines.push(listHtml);
  }

  // Refine Paragraph separation (any non-header, non-list, non-table line that has content becomes a <p> tag)
  const paragraphBlocks = finalNumberedAndBulletedLines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<li') || trimmed.startsWith('<div') || trimmed.startsWith('<table') || trimmed.startsWith('<thead') || trimmed.startsWith('<tbody') || trimmed.startsWith('---')) {
      return line;
    }
    
    // Page break horizontal rule visualizer if '---'
    if (trimmed === '---') {
      return '<hr class="my-8 border-t border-slate-200" style="margin-top: 20pt; margin-bottom: 20pt; border-top: 1px solid #cbd5e1;" />';
    }

    return `<p class="text-slate-800 leading-relaxed font-serif" style="font-family: 'Times New Roman', Times, serif; font-size: 13pt; text-align: justify; text-indent: 1.25cm; margin-bottom: 12pt; line-height: 1.5;">${trimmed}</p>`;
  });

  const finalHtml = paragraphBlocks.filter(b => b !== '').join('\n');
  return finalHtml.replace(/:::color\[([\s\S]*?)\]\{value="([^"]+)"\}:::/gi, '<span style="color: $2">$1</span>');
}

// Convert Rich text / HTML back to clean Markdown to keep state synchronized while editing visually
export function convertHtmlToMarkdown(html: string): string {
  if (!html) return '';
  
  let md = html;
  
  // Convert font and span style color elements into safe Markdown custom directives
  md = md.replace(/<span\s+style="[^"]*?color:\s*([^";]+);?[^"]*?">([\s\S]*?)<\/span>/gi, ':::color[$2]{value="$1"}:::');
  md = md.replace(/<font\s+color="([^"]+)">([\s\S]*?)<\/font>/gi, ':::color[$2]{value="$1"}:::');
  
  // Replace br with newline
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  // Convert custom headers with specific classes back to headings
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
  
  // Bold and strong tags to markdown **
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  
  // Italic to *
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  
  // Lists conversion
  // Match li elements first
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  
  // Strip ul and ol tags
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n');
  
  // Resolve paragraph tags: replace </p> with double newlines
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  
  // Horizontal rules
  md = md.replace(/<hr[^>]*>/gi, '\n---\n');

  // Parse HTML tables into Markdown tables perfectly
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  md = md.replace(tableRegex, (match, tableBody) => {
    let markdownTable = '\n';
    const rows = tableBody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    let hasHeader = false;
    
    rows.forEach((rowHtml: string) => {
      const cells = rowHtml.match(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
      const cellTexts = cells.map((cell: string) => {
        return cell.replace(/<[^>]+>/g, '').trim();
      });
      
      if (cellTexts.length > 0) {
        markdownTable += '| ' + cellTexts.join(' | ') + ' |\n';
        if (rowHtml.includes('<th') && !hasHeader) {
          hasHeader = true;
          const separator = cellTexts.map(() => '---').join(' | ');
          markdownTable += '| ' + separator + ' |\n';
        }
      }
    });
    
    return markdownTable + '\n';
  });

  // Strip other leftover HTML tags
  md = md.replace(/<\/?[^>]+(>|$)/g, "");

  // Convert HTML entities back
  md = md.replace(/&nbsp;/g, ' ')
         .replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/\n{3,}/g, '\n\n');
         
  return md.trim();
}

// Ministry guideline sample frameworks
const MASTER_OUTLINES = [
  {
    id: 'outline_1',
    title: 'Khung Đề cương 1: Đổi mới Phương pháp dạy học & Hoạt động (Theo công văn 2345)',
    description: 'Bám sát Công văn 2345 bồi dưỡng năng lực học sinh thông qua chuỗi hoạt động có chiều sâu.',
    content: `# BÁO CÁO SÁNG KIẾN KINH NGHIỆM ĐỔI MỚI PHƯƠNG PHÁP DẠY HỌC

**MÔN:** [môn học] - **KHỐI LỚP:** [khối lớp]
**TÊN ĐỀ TÀI:** [Tên đề tài]

---

## PHẦN I. ĐẶT VẤN ĐỀ (LÝ DO CHỌN ĐỀ TÀI)
1. Tính cấp thiết của việc đổi mới phương pháp giảng dạy bộ môn [môn học] ở bậc phổ thông.
2. Thực trạng sự hứng thú học tập và năng lực tự chủ của học sinh lớp [khối lớp].
3. Mục tiêu, phạm vi và đối tượng nghiên cứu của sáng kiến này.

## PHẦN II. GIẢI QUYẾT VẤN ĐỀ (THỰC TRẠNG & GIẢI PHÁP)
1. **Phân tích Thực trạng khảo sát trước áp dụng:**
   - Số liệu thống kê kỹ năng học tập thực tiễn.
   - Nguyên nhân và các rào cản từ phía giáo viên và học sinh.
2. **Hệ thống các biện pháp cải tiến sư phạm cốt lõi:**
   - *Biện pháp 1:* Đổi mới hoạt động khởi động, tạo tâm thế học tập hứng khởi.
   - *Biện pháp 2:* Thiết kế nhiệm vụ thực nghiệm hoặc câu hỏi tình huống tư duy.
   - *Biện pháp 3:* Đa dạng hóa hình thức hoạt động nhóm và đánh giá quá trình bài dạy môn [môn học].
3. **Mô tả quy trình triển khai mẫu một bài dạy cụ thể.**

## PHẦN III. THỰC NGHIỆM SƯ PHẠM & ĐÁNH GIÁ HIỆU QUẢ
1. Đối sánh kết quả học tập và thái độ hợp tác trước và sau khi áp dụng sáng kiến.
2. Các minh chứng, sản phẩm học tập tiêu biểu do học sinh thực hiện.

## PHẦN IV. KẾT LUẬN & KIẾN NGHỊ
1. Bài học kinh nghiệm đối với giáo viên tự nghiên cứu.
2. Đề xuất cụ thể với Hội đồng chuyên môn trường và Ban giám hiệu.`
  },
  {
    id: 'outline_2',
    title: 'Khung Đề cương 2: Ứng dụng Công nghệ thông tin & Chuyển đổi số trong dạy học',
    description: 'Tích hợp các nền tảng tương tác số như Canva, Kahoot, AI và học tập kết hợp (Blended Learning) bám sát chương trình hành động GDPT 2018.',
    content: `# BÁO CÁO SÁNG KIẾN KINH NGHIỆM ỨNG DỤNG CÔNG NGHỆ THÔNG TIN & CHUYỂN ĐỔI SỐ

**MÔN:** [môn học] - **KHỐI LỚP:** [khối lớp]
**TÊN ĐỀ TÀI:** [Tên đề tài]

---

## PHẦN I. ĐẶT VẤN ĐỀ
1. Bối cảnh chuyển đổi số quốc gia trong ngành giáo dục và trách nhiệm giáo viên trong thời kỳ mới.
2. Ý nghĩa của việc ứng dụng CNTT, phần mềm tương tác sinh động trong dạy học môn [môn học].
3. Câu hỏi nghiên cứu và nhiệm vụ trọng tâm của đề tài.

## PHẦN II. GIẢI QUYẾT VẤN ĐỀ
1. **Thực trạng học tập và áp dụng công nghệ tại đơn vị:**
   - Cơ sở vật chất phòng máy và năng lực thao tác thiết bị của học sinh lớp [khối lớp].
   - Thói quen lạm dụng hoặc chưa khai thác hiệu quả tài nguyên internet.
2. **Các biện pháp đột phá số hóa:**
   - *Biện pháp 1:* Thiết kế học liệu số tương tác cao bằng Canva và sơ đồ hóa bài giảng.
   - *Biện pháp 2:* Xây dựng hệ thống ôn tập trực tuyến game hóa (Quizizz, Kahoot, Wordwall) kích thích thi đua lành mạnh.
   - *Biện pháp 3:* Tổ chức bài học kết hợp (Blended Learning) giao nhiệm vụ từ trước qua học liệu số tự học.
3. **Kế hoạch bài dạy minh họa có ứng dụng các ứng dụng số.**

## PHẦN III. HIỆU QUẢ THỰC TIỄN
1. Thống kê mức độ cải thiện kỹ năng công nghệ tin học của từng học sinh nhóm lớp.
2. Phản hồi khảo sát của cha mẹ học sinh và đồng nghiệp dự giờ.

## PHẦN IV. KẾT LUẬN & KIẾN NGHỊ`
  },
  {
    id: 'outline_3',
    title: 'Khung Đề cương 3: Phát triển Năng lực & Phẩm chất người học (Mô hình GDPT 2018)',
    description: 'Tập trung sâu sắc vào việc hình thành các cặp phẩm chất (Yêu nước, Nhân ái, Chăm chỉ, Trung thực) và năng lực cốt lõi theo định hướng của Bộ.',
    content: `# BÁO CÁO SÁNG KIẾN KINH NGHIỆM PHÁT TRIỂN NĂNG LỰC & PHẨM CHẤT HỌC SINH

**MÔN:** [môn học] - **KHỐI LỚP:** [khối lớp]
**TÊN ĐỀ TÀI:** [Tên đề tài]

---

## PHẦN I. ĐẶT VẤN ĐỀ (LÝ DO CHỌN ĐỀ TÀI)
1. Định hướng cốt lõi của Chương trình GDPT 2018: chuyển từ truyền thụ kiến thức sang hình thành năng lực, phẩm chất.
2. Lý do cần thiết kế các hoạt động trải nghiệm thực chứng cho môn [môn học] lớp [khối lớp].
3. Giới hạn phạm vi ứng dụng sáng kiến và phương pháp sư phạm chủ đạo.

## PHẦN II. GIẢI QUYẾT VẤN ĐỀ
1. **Khảo sát đặc điểm hành vi phẩm chất học sinh lớp chủ quản:**
   - Biểu hiện tính tự giác, chăm chỉ học tập tự nghiên cứu bài học môn [môn học].
   - Khả năng tự chủ giải quyết khúc mắc bài học.
2. **Biện pháp tổ chức hoạt động tích hợp hình thành phẩm chất:**
   - *Biện pháp 1:* Giáo dục tinh thần trách nhiệm thông qua phân chia nhiệm vụ dự án nhóm cụ thể.
   - *Biện pháp 2:* Xây dựng phương pháp dạy học gắn liền với giải quyết vấn đề thực tế đời sống.
   - *Biện pháp 3:* Đổi mới hình thức kiểm tra đánh giá đồng đẳng (Học sinh tự nhận xét chéo nhau).
3. **Quy trình hoạt động trải nghiệm thực hành chuẩn năng lực học sinh.**

## PHẦN III. KẾT QUẢ ĐỐI SÁNH THỰC TIỄN
1. Bảng đo lường các phẩm chất chủ yếu và các năng lực chung của học sinh trước và sau thử nghiệm áp dụng sáng kiến.
2. Ý nghĩa cải tiến phương pháp giáo dục đối với nhà giáo.

## PHẦN IV. KẾT LUẬN & ĐỀ XUẤT KHOA HỌC`
  },
  {
    id: 'outline_4',
    title: 'Khung Đề cương 4: Tổ chức Trò chơi học tập & Hoạt động trải nghiệm sáng tạo (STEM)',
    description: 'Áp dụng học thuyết kiến tạo "Chơi mà học" thông qua hệ thống trò chơi trí tuệ và hoạt động chế tạo Stem tích hợp liên môn.',
    content: `# BÁO CÁO SÁNG KIẾN KINH NGHIỆM TỔ CHỨC TRÒ CHƠI HỌC TẬP & HOẠT ĐỘNG STEM

**MÔN:** [môn học] - **KHỐI LỚP:** [khối lớp]
**TÊN ĐỀ TÀI:** [Tên đề tài]

---

## PHẦN I. ĐẶT VẤN ĐỀ
1. Tầm quan trọng của phương pháp "Học thông qua Chơi" đối với tâm sinh lý lứa tuổi học sinh [khối lớp].
2. Vai trò bứt phá của các hoạt động tích hợp trải nghiệm STEM liên môn thời kỳ mới.
3. Sự cần thiết của đề tài ứng dụng thực tế trong môn [môn học].

## PHẦN II. NỘI DUNG NGHIÊN CỨU SƯ PHẠM
1. **Thực trạng thái độ tương tác trong giờ học chính khóa:**
   - Tâm lý thờ ơ rụt rè, sợ sai của học sinh khi làm bài tập môn [môn học].
   - Các hình thức tổ chức trò chơi truyền thống đã cũ, kém hấp dẫn.
2. **Hệ thống trò chơi học tập và giải pháp STEM sáng tạo:**
   - *Biện pháp 1:* Xây dựng ngân hàng trò chơi khởi động nhanh "Ice-breaker" 5 phút đầu giờ.
   - *Biện pháp 2:* Thiết kế chuỗi thử thách ôn bài thông qua đóng vai tích lũy huy hiệu số.
   - *Biện pháp 3:* Triển khai dự án STEM tái chế chế tạo học liệu hữu ích cụ thể cho học tập.
3. **Phác thảo kịch bản trò chơi hoạt động hoàn chỉnh tại lớp.**

## PHẦN III. THỰC NGHIỆM SỰ TIẾN BỘ
1. Biểu đồ khảo sát thái độ học tập và mức độ tương tác giữa giáo viên - học sinh.
2. Tác động tích cực đến chỉ số điểm thi định kỳ của lớp học thử nghiệm.

## PHẦN IV. TỔNG KẾT & KIẾN NGHỊ`
  },
  {
    id: 'outline_5',
    title: 'Khung Đề cương 5: Khắc phục khó khăn đặc thù & Hỗ trợ học sinh yếu bộ môn',
    description: 'Chuyên đề giải quyết triệt để rào cản nhận thức, khắc phục lỗi sai phổ biến và phân hóa đối tượng gia tăng tỷ lệ học khá giỏi.',
    content: `# BÁO CÁO SÁNG KIẾN KINH NGHIỆM PHÂN HÓA ĐỐI TƯỢNG & KHẮC PHỤC KHÓ KHĂN HỌC THEO BỘ MÔN

**MÔN:** [môn học] - **KHỐI LỚP:** [khối lớp]
**TÊN ĐỀ TÀI:** [Tên đề tài]

---

## PHẦN I. ĐẶT VẤN ĐỀ (TÍNH CẤP THIẾT)
1. Thách thức phân hóa năng lực sâu sắc trong học tập lớp [khối lớp] môn [môn học] hiện nay.
2. Những rào cản phổ biến và sự sa sút của nhóm học sinh yếu kém.
3. Ý nghĩa thực tiễn của giải pháp cá nhân hóa bồi dưỡng hỗ trợ tại chỗ.

## PHẦN II. GIẢI QUYẾT VẤN ĐỀ
1. **Phân tích nguyên nhân và nhận diện lỗi hay sai của học sinh:**
   - Kết quả trắc nghiệm và chẩn đoán thói quen nhận thức sai sót.
   - Tâm lý tự ti, xa lánh hoặc lười đặt câu hỏi của học sinh.
2. **Các biện pháp can thiệp sư phạm phân hóa và phụ đạo:**
   - *Biện pháp 1:* Biên soạn phiếu học tập cá nhân hóa phân cấp độ từ dễ đến nâng cao.
   - *Biện pháp 2:* Áp dụng mô hình "Đôi bạn cùng tiến" có hướng dẫn thực nghiệm.
   - *Biện pháp 3:* Tổ chức liên kết gia đình đồng hành kèm cặp tháo gỡ điểm nghẽn bộ môn.
3. **Minh họa phương pháp học tập tiến bộ của học sinh điển hình.**

## PHẦN III. KẾT QUẢ THỰC TẾ
1. Số liệu so sánh tỷ lệ học sinh yếu kém giảm rõ rệt và sự gia tăng tinh thần tự học.
2. Sự ghi nhận từ cuộc họp phụ huynh định kỳ cuối năm.

## PHẦN IV. KẾT LUẬN & KHUYẾN NGHỊ CHUNG`
  }
];

// Prefilled popular educational sample SKKN topics for fast-start inspiration
interface SampleTopic {
  title: string;
  desc: string;
}

const SAMPLE_TOPICS_REGISTRY: Record<string, SampleTopic[]> = {
  'Tin học': [
    { title: 'Một số giải pháp ứng dụng sơ đồ tư duy Mindmap nâng cao hiệu quả học tập môn Tin học Tiểu học', desc: 'Sử dụng Canva và Mindmap giúp học sinh ghi nhớ nhanh kiến thức lý thuyết trừu tượng.' },
    { title: 'Biện pháp lồng ghép trò chơi học tập tương tác Kahoot và Quizizz trong tiết thực hành Máy tính', desc: 'Thúc đẩy động lực tự học bài tập thực hành gõ phím và kỹ năng mạng.' },
    { title: 'Đổi mới phương pháp giảng dạy lập trình Scratch thông qua mô hình dự án thực tế tại Khối 4, 5', desc: 'Giúp các em tự sáng tạo và thiết kế sản phẩm trò chơi giáo dục ngắn.' },
    { title: 'Ứng dụng Generative AI và Trí tuệ Nhân tạo hỗ trợ tìm kiếm tài liệu học tập an toàn lớp 5', desc: 'Học sinh làm quen với kỷ nguyên số AI một cách có kiểm soát và đạt chuẩn năng lực tin học.' }
  ],
  'Toán học': [
    { title: 'Sử dụng trò chơi Toán học và Mô hình đồ dùng tự làm nâng cao chất lượng dạy Toán lớp 3', desc: 'Cụ thể hóa số học và hình học trực quan giúp các con hứng thú học tập.' },
    { title: 'Rèn luyện kỹ năng giải bài toán có lời văn thông qua sơ đồ trực quan và câu chuyện thực tế', desc: 'Hỗ trợ khắc phục tình trạng lười đọc đề, phân tích sai dữ kiện của học sinh.' },
    { title: 'Biện pháp phát triển tư duy thuật toán và logic cho học sinh tiểu học qua phân loại số học lớp 4', desc: 'Bồi dưỡng học sinh khá giỏi phát huy tốt năng khiếu tự nhiên.' }
  ],
  'Tiếng Việt': [
    { title: 'Biện pháp rèn kỹ năng viết đoạn văn miêu tả sinh động cho học sinh lớp 4 thông qua sơ đồ hình ảnh', desc: 'Liên kết liên môn nghệ thuật trực quan giúp ngôn ngữ viết dồi dào, phong phú hơn.' },
    { title: 'Ứng dụng phương pháp đóng vai kịch nghệ cải thiện kỹ năng đọc diễn cảm và cảm thụ văn học lớp 5', desc: 'Giáo án tương tác nhập vai nhân vật tăng tương tác thực tế sinh động.' },
    { title: 'Phương pháp rèn viết đúng chính tả, hạn chế lỗi phát âm địa phương cho học sinh lớp 1, 2', desc: 'Thiết lập các trò chơi ghép thẻ chữ chuẩn chỉ và chỉnh sửa phát âm khoa học.' }
  ],
  'Tiếng Anh': [
    { title: 'Một số trò chơi ngôn ngữ sinh động thúc đẩy ghi nhớ từ vựng Tiếng Anh giao tiếp lớp 3', desc: 'Sử dụng thẻ Flashcard và múa rối tương tác nâng cao phát âm phản xạ tự nhiên.' },
    { title: 'Giải pháp nâng cao tinh thần tự tin nói Tiếng Anh trước đám đông thông qua chuỗi thử thách ngắn', desc: 'Giúp học sinh rũ bỏ rụt rè bỡ ngỡ đầu khóa học.' }
  ],
  'Khác': [
    { title: 'Thiết kế hoạt động trải nghiệm thực tế tích hợp giáo dục Stem kết hợp sơ đồ tự học', desc: 'Khơi dậy tiềm năng nghiên cứu, sáng chế mô hình lý thú bám sát Công văn 2345.' },
    { title: 'Biện pháp rèn luyện thói quen tự quản và kỹ năng làm việc nhóm nhỏ hiệu quả của học sinh', desc: 'Nâng cao năng lực tự chủ phát triển phẩm chất cá nhân toàn diện.' }
  ]
};

export default function SkknCreator({ currUser }: { currUser?: any }) {
  // Master navigation tabs
  const [skknTab, setSkknTab] = useState<'create' | 'preview' | 'templates' | 'library' | 'history' | 'dashboard'>('create');
  
  const [activeStage, setActiveStage] = useState<'tieuhoc' | 'thcs' | 'thpt'>('tieuhoc');
  
  // Author & school states synchronised from user profile
  const [authorName, setAuthorName] = useState('');
  const [workUnit, setWorkUnit] = useState('');

  // Auto-sync states from currUser when profile updates
  useEffect(() => {
    if (currUser) {
      if (currUser.fullname) {
        setAuthorName(currUser.fullname);
      }
      if (currUser.school) {
        setWorkUnit(currUser.school);
      }
    }
  }, [currUser]);
  
  // States matching user fields requirement
  const [selectedGrade, setSelectedGrade] = useState('Lớp 3');
  const [selectedSubject, setSelectedSubject] = useState('Tin học');
  const [topicTitle, setTopicTitle] = useState('');
  
  const [currentPromptPhase, setCurrentPromptPhase] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOutline, setSelectedOutline] = useState<string>('');
  
  // Main compiled content editor states
  const [draftContent, setDraftContent] = useState<string>('');
  const [editorActiveTab, setEditorActiveTab] = useState<'preview' | 'rebuttal' | 'logic_audit' | 'evidence'>('preview');

  // AI Suggestions for Evidence (Minh chứng) states
  const [solutionForEvidence, setSolutionForEvidence] = useState('');
  const [isSuggestingEvidence, setIsSuggestingEvidence] = useState(false);
  const [suggestedEvidenceResult, setSuggestedEvidenceResult] = useState('');

  // Refs and synchronization mechanics for WYSIWYG editor
  const editableRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>('');

  const syncVisualChangesToDraft = () => {
    if (editableRef.current) {
      const freshHtml = editableRef.current.innerHTML;
      if (freshHtml !== lastHtmlRef.current) {
        lastHtmlRef.current = freshHtml;
        const md = convertHtmlToMarkdown(freshHtml);
        setDraftContent(md);
      }
    }
  };

  // Refs and synchronization for outer Preview tab editing
  const previewEditableRef = useRef<HTMLDivElement>(null);
  const lastPreviewHtmlRef = useRef<string>('');

  const syncPreviewChangesToDraft = () => {
    if (previewEditableRef.current) {
      const freshHtml = previewEditableRef.current.innerHTML;
      if (freshHtml !== lastPreviewHtmlRef.current) {
        lastPreviewHtmlRef.current = freshHtml;
        const md = convertHtmlToMarkdown(freshHtml);
        setDraftContent(md);
      }
    }
  };

  // Keep visual containers in sync with state updates (e.g. from template loading, AI stream)
  useEffect(() => {
    if (editorActiveTab === 'preview' && editableRef.current) {
      const currentFormattedHtml = formatMarkdownToHtml(draftContent);
      if (document.activeElement !== editableRef.current && editableRef.current.innerHTML !== currentFormattedHtml) {
        editableRef.current.innerHTML = currentFormattedHtml;
        lastHtmlRef.current = currentFormattedHtml;
      }
    }
  }, [draftContent, editorActiveTab]);

  useEffect(() => {
    if (skknTab === 'preview' && previewEditableRef.current) {
      const currentFormattedHtml = formatMarkdownToHtml(draftContent);
      if (document.activeElement !== previewEditableRef.current && previewEditableRef.current.innerHTML !== currentFormattedHtml) {
        previewEditableRef.current.innerHTML = currentFormattedHtml;
        lastPreviewHtmlRef.current = currentFormattedHtml;
      }
    }
  }, [draftContent, skknTab]);
  
  // AI Critique and evaluation responses
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  
  // AI Logic coherence checker states
  const [isAuditing, setIsAuditing] = useState(false);
  const [logicAuditReport, setLogicAuditReport] = useState<string>('');
  
  // Internal Reference Library states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('Tất cả');
  const [filterGrade, setFilterGrade] = useState('Tất cả');
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('lib_01');
  
  // Local storage history of completed SKKNs
  const [savedSkknList, setSavedSkknList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('school_smart_skkn_saved_list_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Historical generated parts within the active session
  const [generationHistory, setGenerationHistory] = useState<{
    id: string;
    phaseName: string;
    promptTitle: string;
    content: string;
    timestamp: string;
  }[]>([]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const saveSkknListToStorage = (list: any[]) => {
    try {
      localStorage.setItem('school_smart_skkn_saved_list_v1', JSON.stringify(list));
      setSavedSkknList(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Stage details consistent with other areas of the application
  const stageGrades: Record<'tieuhoc' | 'thcs' | 'thpt', string[]> = {
    tieuhoc: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
    thcs: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'],
    thpt: ['Lớp 10', 'Lớp 11', 'Lớp 12']
  };

  const stageSubjects: Record<'tieuhoc' | 'thcs' | 'thpt', string[]> = {
    tieuhoc: ['Tin học', 'Toán học', 'Tiếng Việt', 'Tiếng Anh', 'Tự nhiên và Xã hội', 'Đạo đức', 'Công nghệ', 'Âm nhạc', 'Mĩ thuật', 'Giáo dục thể chất'],
    thcs: ['Tin học', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Khoa học tự nhiên', 'Lịch sử và Địa lí', 'Giáo dục công dân', 'Công nghệ'],
    thpt: ['Tin học', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lí', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lí', 'Giáo dục kinh tế và pháp luật', 'Công nghệ']
  };

  // Sync selectors when switching school stages
  useEffect(() => {
    setSelectedGrade(stageGrades[activeStage][0]);
    setSelectedSubject(stageSubjects[activeStage][0]);
  }, [activeStage]);

  // Guidelines data corresponding 100% to the requested prompt workflow
  const FLOW_GUIDELINES = [
    {
      phaseName: 'GIAI ĐOẠN 1: TÌM Ý TƯỞNG',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Khảo sát các đề tài tiềm năng và phân tích các khó khăn thực trạng cốt lõi.',
      prompts: [
        {
          title: 'Đề xuất 20 đề tài tiềm năng',
          content: 'Hãy đề xuất 20 đề tài SKKN cho giáo viên lớp [khối lớp], môn [môn học], bám sát định hướng phát triển phẩm chất và năng lực học sinh.'
        },
        {
          title: 'Phân tích khó khăn học sinh & Gợi ý đề tài',
          content: 'Phân tích những khó khăn phổ biến của học sinh lớp [khối lớp] trong môn [môn học] và đề xuất các đề tài SKKN phù hợp.'
        },
        {
          title: 'Ý kiến thẩm định từ Hội đồng chấm điểm',
          content: 'Đóng vai hội đồng chấm SKKN. Hãy đề xuất các đề tài có tính mới và khả năng được đánh giá cao.'
        },
        {
          title: 'Đề xuất đề tài Chuyển đổi số & Trí tuệ Nhân tạo (AI)',
          content: 'Đề xuất các đề tài SKKN liên quan đến chuyển đổi số và ứng dụng AI trong dạy học.'
        },
        {
          title: 'Đề tài tích hợp đổi mới Công văn 2345',
          content: 'Đề xuất các đề tài SKKN phù hợp với định hướng đổi mới phương pháp dạy học theo Công văn 2345.'
        }
      ]
    },
    {
      phaseName: 'GIAI ĐOẠN 2: XÂY DỰNG ĐỀ CƯƠNG',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Lập dàn ý chi tiết và viết Lý do chọn đề tài đầy sức thuyết phục khoa học.',
      prompts: [
        {
          title: 'Xây dựng lý thuyết đề cương chi tiết',
          content: 'Hãy xây dựng đề cương chi tiết cho đề tài: [Tên đề tài].'
        },
        {
          title: 'Thiết kế mục lục chuẩn cơ cấu tiêu học',
          content: 'Xây dựng mục lục hoàn chỉnh cho SKKN theo cấu trúc thường được sử dụng tại các trường tiểu học.'
        },
        {
          title: 'Phân tích tính cấp thiết của đề tài',
          content: 'Phân tích tính cấp thiết của đề tài: [Tên đề tài] đối với đổi mới dạy học ở trường phổ thông.'
        },
        {
          title: 'Viết Lý do chọn đề tài chuẩn văn phong khoa học',
          content: 'Viết phần lý do chọn đề tài theo văn phong khoa học giáo dục cho chủ đề: [Tên đề tài].'
        },
        {
          title: 'Xác định mục tiêu & Đối tượng phạm vi nghiên cứu',
          content: 'Xác định mục tiêu, đối tượng, phạm vi và phương pháp nghiên cứu khoa học cho đề tài [Tên đề tài].'
        }
      ]
    },
    {
      phaseName: 'GIAI ĐOẠN 3: PHÂN TÍCH THỰC TRẠNG',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Xây dựng số liệu khảo sát, phân tích điểm nghẽn của nội dung hiện hành.',
      prompts: [
        {
          title: 'Phác thảo phần Thực trạng trước áp dụng',
          content: 'Giả sử tôi là giáo viên lớp [khối lớp]. Hãy giúp tôi xây dựng sâu sắc phần thực trạng, khó khăn trước khi áp dụng sáng kiến.'
        },
        {
          title: 'Tạo bảng khảo sát số liệu thực trạng',
          content: 'Hãy tạo bảng khảo sát số liệu định lượng thực trạng trước khi áp dụng sáng kiến giáo dục bài bản.'
        },
        {
          title: 'Xác định các số liệu minh họa cụ thể',
          content: 'Đề xuất các số liệu minh họa, ví dụ phỏng vấn giáo viên và điều tra thực tế phù hợp cho phần thực trạng.'
        },
        {
          title: 'Phân tích nguyên nhân của các hạn chế',
          content: 'Phân tích nguyên nhân nội quan và khách quan dẫn đến những hạn chế, lỗi sai phổ biến trong khảo sát dạy học.'
        }
      ]
    },
    {
      phaseName: 'GIAI ĐOẠN 4: ĐỀ XUẤT GIẢI PHÁP',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Xây dựng các giải pháp sư phạm vượt trội bám sát thực tiễn giáo dục.',
      prompts: [
        {
          title: 'Thiết lập 5 giải pháp cải tiến cốt lõi',
          content: 'Đề xuất 5 giải pháp khoa học cụ thể và mang tính bứt phá thực tiễn để giải quyết vấn đề trong đề tài này.'
        },
        {
          title: 'Mô tả chi tiết quy trình triển khai tại lớp',
          content: 'Mô tả chi tiết và sinh động quy trình các bước triển khai kỹ thuật, phương pháp từng giải pháp đặc hữu tại lớp học.'
        },
        {
          title: 'Xây dựng hoạt động dạy học minh họa giáo án',
          content: 'Đoạn trích chi tiết một hoạt động tổ chức dạy học minh họa giáo án mẫu để chứng minh tính cụ thể của giải pháp sáng kiến.'
        },
        {
          title: 'Tích hợp công cụ số (AI, Canva, Kahoot, STEM)',
          content: 'Gợi ý cách ứng dụng cụ thể công nghệ số, tài nguyên điện tử hoặc mô hình STEM tích hợp vào giải pháp để nâng tầng sáng kiến kinh nghiệm.'
        }
      ]
    },
    {
      phaseName: 'GIAI ĐOẠN 5: HIỆU QUẢ & HOÀN THIỆN',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Báo cáo hiệu quả so sánh trước/sau và hoàn thiện kết luận báo cáo.',
      prompts: [
        {
          title: 'Bảng đối sánh kết quả Trước & Sau áp dụng',
          content: 'Xây dựng bảng số liệu thống kê định lượng và tỷ lệ % đối sánh hiệu quả của học sinh trước và sau khi áp dụng sáng kiến này.'
        },
        {
          title: 'Báo cáo Đánh giá của Đồng nghiệp & Tổ chuyên môn',
          content: 'Đóng vai tổ trưởng chuyên môn và các giáo viên dự giờ, hãy viết báo cáo nhận xét đánh giá khách quan về tính hiệu quả và nhân rộng của sáng kiến.'
        },
        {
          title: 'Viết lý luận Phần Kết luận và Khuyến nghị',
          content: 'Viết phần Kết luận khoa học tóm tắt sáng kiến, chia sẻ bài học kinh nghiệm thiết thân và đề xuất khuyến nghị thiết thực lên cấp phòng sở giáo dục.'
        }
      ]
    }
  ];

  const getSubjectSuggestions = (): SampleTopic[] => {
    return SAMPLE_TOPICS_REGISTRY[selectedSubject] || SAMPLE_TOPICS_REGISTRY['Khác'];
  };

  const aiApiKeyGlobal = localStorage.getItem('personal_gemini_api_key') || '';

  // Select Outline Framework
  const handleSelectOutline = (outlineId: string) => {
    const outline = MASTER_OUTLINES.find(o => o.id === outlineId);
    if (!outline) return;

    SoundEffects.playTing();
    const replaced = outline.content
      .replace(/\[môn học\]/g, selectedSubject)
      .replace(/\[khối lớp\]/g, selectedGrade)
      .replace(/\[Tên đề tài\]/g, topicTitle || "CHỦ ĐỀ GIÁO DỤC ĐỔI MỚI CHUYÊN NGHIỆP");

    setDraftContent(replaced);
    setSelectedOutline(outlineId);
    setEditorActiveTab('preview');
    showToast(`📝 Đã áp dụng khung đề cương mẫu chuẩn! Thầy Cô có thể chỉnh sửa trực tiếp, trực quan ngay tại bảng xem trước dưới đây.`, 'success');
  };

  // Execute AI Prompt calls
  const handleExecutePrompt = async (promptText: string, promptTitle: string) => {
    if (!selectedGrade || !selectedSubject) {
      showToast('⚠️ Thầy Cô vui lòng chọn đầy đủ Khối lớp và Môn học!', 'info');
      return;
    }

    setIsGenerating(true);
    showToast('☕ Trí tuệ AI đang nhận diện đề tài và biên soạn bài viết. Vui lòng đợi trong giây lát...', 'info');

    try {
      const response = await fetch('/api/generate-skkn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': aiApiKeyGlobal
        },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          topicTitle: topicTitle || 'Sáng kiến Giáo dục phổ thông',
          customPrompt: promptText
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi liên lạc hệ thống.');
      }

      const generatedResult = data.result;

      // Save snippet to history
      const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        phaseName: FLOW_GUIDELINES[currentPromptPhase].phaseName,
        promptTitle: promptTitle,
        content: generatedResult,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      
      setGenerationHistory(prev => [newHistoryItem, ...prev]);

      // Handle updating editor
      if (!draftContent) {
        setDraftContent(`# BÁO CÁO SÁNG KIẾN KINH NGHIỆM CHUYÊN SÂU\n**BỘ MÔN:** ${selectedSubject} - **KHỐI LỚP:** ${selectedGrade}\n**ĐỀ TÀI:** ${topicTitle || 'Tự chọn'}\n\n---\n\n## NỘI DUNG SƠ KHỞI BAN ĐẦU\n\n${generatedResult}`);
      } else {
        setDraftContent(prev => prev + `\n\n---\n\n## TIỂU MỤC: ${promptTitle.toUpperCase()}\n\n${generatedResult}`);
      }

      setEditorActiveTab('preview');
      SoundEffects.playKeng();
      showToast('✨ Sáng kiến phân mảnh đã được AI biên soạn và tích hợp vào bản thảo thành công!', 'success');

    } catch (err: any) {
      console.error(err);
      showToast(err.message || '⚠️ Hệ thống bận nâng cấp hoặc Khóa API bị lỗi. Vui lòng thử lại!', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Review and Critique of solutions (AI Phản biện)
  const handleAiRebuttal = async () => {
    if (!draftContent || draftContent.trim().length < 50) {
      showToast('⚠️ Thầy Cô vui lòng soạn đề cương hoặc giải pháp ít nhất 50 từ trước khi Chạy Phản biện!', 'info');
      return;
    }

    setIsReviewing(true);
    setEditorActiveTab('rebuttal');
    showToast('⚖️ AI đang đóng vai Hội đồng thẩm định phản biện các giải pháp. Vui lòng đợi...', 'info');

    try {
      const response = await fetch('/api/generate-skkn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': aiApiKeyGlobal
        },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          topicTitle: topicTitle || 'Chủ đề đổi mới',
          customPrompt: `Bạn hãy đóng vai là một Thành viên Hội đồng Thẩm định kiêm Giám khảo xuất sắc chuyên chấm Sáng kiến Kinh nghiệm (SKKN) giáo dục tiểu học/trung học với hơn 20 năm kinh nghiệm sư phạm. 
Phân tích bản thảo phần giải pháp hiện tại dưới đây và đưa ra nhận xét phản biện mang tính xây dựng cao gồm:
1. ĐIỂM MẠNH NỔI BẬT: Đánh giá cao tính mới sư phạm, tính khả thi thực tiễn, tính logic cấu trúc và liên kết Công văn 2345/GDPT2018.
2. ĐIỂM YẾU, HẠN CHẾ SƯ PHẠM: Thao tác tổ chức còn sơ sài ở đâu? Số liệu khảo sát thực trạng hay minh chứng đã đủ vững chắc chưa?
3. GỢI Ý TỐI ƯU HÓA CHI TIẾT (ĐẠT ĐIỂM SỐ GIẢI NHẤT/GIẢI A): Hướng dẫn viết sâu sắc hơn, cụ thể hóa các số liệu thực chứng mẫu, bổ sung hoạt động công nghệ số hoặc hoạt động nhóm phù hợp với môn học và khối lớp để tăng sức thuyết phục tuyệt đối.

Hãy trình bày bằng tiếng Việt trang trọng, khách quan, mang tính chất cố vấn giáo khoa cao với các thẻ đề mục rõ ràng, biểu bảng minh họa gợi ý nếu cần.

Dưới đây là phần giải pháp/nội dung sáng kiến hiện tại của giáo viên cần phân tích phản biện:
${draftContent}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi phân tích phản biện từ Robot.');
      }

      setReviewFeedback(data.result);
      SoundEffects.playKeng();
      showToast('🧠 Đã hoàn thành bảng tư vấn phản biện chi tiết từ Hội đồng thẩm định AI!', 'success');

    } catch (err: any) {
      console.error(err);
      showToast(err.message || '⚠️ Không thể tiến hành phản biện AI lúc này. Vui lòng thử lại!', 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  // AI Logical Coherence Auditor (Kiểm tra lỗi logic)
  const handleAuditLogic = async () => {
    if (!draftContent || draftContent.trim().length < 50) {
      showToast('⚠️ Thầy Cô vui lòng viết hoặc tạo bản thảo sáng kiến ít nhất 50 từ trước khi Kiểm tra lỗi logic!', 'info');
      return;
    }

    setIsAuditing(true);
    setEditorActiveTab('logic_audit');
    showToast('🔍 AI đang quét bài viết để phân tích liên kết mâu thuẫn Thực trạng - Giải pháp...', 'info');

    try {
      const response = await fetch('/api/audit-skkn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': aiApiKeyGlobal
        },
        body: JSON.stringify({
          content: draftContent,
          subject: selectedSubject,
          grade: selectedGrade,
          topicTitle: topicTitle || 'Chủ đề tự chọn'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi kiểm soát phản biện logic từ Robot.');
      }

      setLogicAuditReport(data.result);
      SoundEffects.playKeng();
      showToast('✨ Đã hoàn thành phân tích lỗi logic và đề xuất viết lại mạch lạc!', 'success');

    } catch (err: any) {
      console.error(err);
      showToast(err.message || '⚠️ Không thể tiến hành kiểm tra logic bằng AI. Vui lòng thử lại!', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  // AI Suggest Evidence for SKKN (AI Gợi ý Minh chứng)
  const handleSuggestEvidence = async () => {
    let textToAnalyze = solutionForEvidence.trim();
    if (!textToAnalyze) {
      if (draftContent && draftContent.trim().length > 10) {
        textToAnalyze = draftContent;
        setSolutionForEvidence(draftContent);
      } else {
        showToast('⚠️ Thầy Cô vui lòng tự nhập nội dung giải pháp hoặc có bản thảo sáng kiến trước khi bấm gợi ý!', 'info');
        return;
      }
    }

    setIsSuggestingEvidence(true);
    setEditorActiveTab('evidence');
    showToast('🔍 AI đang phân tích giải pháp tự động xuất minh chứng giáo dục đặc trưng. Vui lòng đợi...', 'info');

    try {
      const response = await fetch('/api/suggest-evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': aiApiKeyGlobal
        },
        body: JSON.stringify({
          solution: textToAnalyze,
          subject: selectedSubject,
          grade: selectedGrade,
          topicTitle: topicTitle || 'Chủ đề sư phạm tiểu học'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi gợi ý minh chứng từ Robot.');
      }

      setSuggestedEvidenceResult(data.result);
      SoundEffects.playKeng();
      showToast('💡 Đã tải xong các minh chứng khuyên dùng xuất sắc cho giải pháp!', 'success');

    } catch (err: any) {
      console.error(err);
      showToast(err.message || '⚠️ Không thể gợi ý minh chứng lúc này. Vui lòng thử lại!', 'error');
    } finally {
      setIsSuggestingEvidence(false);
    }
  };

  // Compile entire 100% finished SKKN draft at once
  const handleCompileFullSKKN = async () => {
    if (!topicTitle.trim()) {
      showToast('⚠️ Vui lòng nhập hoặc chọn Tên đề tài trước khi viết trọn vẹn!', 'info');
      return;
    }

    setIsGenerating(true);
    showToast('🚀 Đang viết TRỌN VẸN sáng kiến kinh nghiệm chuẩn 100%. Đây là văn bản rất dài, vui lòng đợi 20-40 giây...', 'info');

    try {
      const response = await fetch('/api/generate-skkn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': aiApiKeyGlobal
        },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          topicTitle: topicTitle,
          customPrompt: `Bạn là một Chuyên gia Giáo dục có hơn 20 năm kinh nghiệm sư phạm thực tiễn xuất sắc, đã đạt nhiều giải Sáng kiến Kinh nghiệm cấp Tỉnh/Thành phố và có kinh nghiệm chấm thi SKKN phong phú tại Việt Nam.

Hãy giúp tôi viết TRỌN VẸN và HOÀN CHỈNH 100% một bài báo cáo Sáng kiến Kinh nghiệm đỉnh cao dành cho Giáo viên giảng dạy môn ${selectedSubject} lớp ${selectedGrade} với đề tài chính xác: "${topicTitle}".

Yêu cầu bài viết cần bám sát các chỉ dẫn chất lượng cao sau:
1. Độc đáo, có giá trị đóng góp sư phạm thực tiễn đột phá. Các tình huống giáo dục, câu thoại tương tác, giải pháp cải tiến và số liệu đối chứng phải mang tính chân thực, sâu sắc, không chung chung hời hợt.
2. Trình bày chi tiết, lập luận khoa học, cấu trúc chặt chẽ gồm 3 phần quy chuẩn chính như sau:

- PHẦN I: ĐẶT VẤN ĐỀ (LÝ DO CHỌN ĐỀ TÀI)
  + Trình bày lý luận sư phạm cốt lõi, bối cảnh triển khai Chương trình Giáo dục phổ thông mới (GDPT 2018).
  + Làm rõ tính cấp thiết, các điểm nghẽn, khó khăn thực tế mà cả giáo viên và học sinh gặp phải đối với môn ${selectedSubject} lớp ${selectedGrade}.
  + Phân tích lý do quyết định lựa chọn, nghiên cứu và thực nghiệm đề tài "${topicTitle}".

- PHẦN II: GIẢI QUYẾT VẤN ĐỀ
  1. Thực trạng trước khi áp dụng sáng kiến tại lớp học:
     + Phân tích sâu sắc thuận lợi và những khó khăn đặc thù trong công tác tổ chức giảng dạy thực tế.
     + Xây dựng một bảng thống kê số liệu khảo sát định lượng ban đầu (Về thái độ hứng thú, kỹ năng thao tác, và điểm số kiểm tra chuẩn hóa...) của học sinh lớp thực nghiệm với số lượng học sinh và tỷ lệ % cụ thể để làm cơ sở khoa học đối chứng.
  2. Các giải pháp cải tiến sư phạm cốt lõi (Mô tả thật chi tiết và cặn kẽ 4 giải pháp bứt phá sáng tạo):
     + GIẢI PHÁP 1: Mô tả ý tưởng cốt lõi, công tác chuẩn bị thiết bị dạy học, và quy trình thực hiện cụ thể từng bước tại lớp học kèm ví dụ bài học trực quan sinh động.
     + GIẢI PHÁP 2: Phương pháp đổi mới tổ chức dạy học (Lồng ghép trò chơi học tập rèn trí tuệ, kỹ thuật dạy học tích cực như mảnh ghép, bể cá, khăn trải bàn, đóng vai...).
     + GIẢI PHÁP 3: Tích hợp công nghệ số sáng tạo (Ví dụ Canva thiết kế trực quan, AI hỗ trợ học liệu, các ứng dụng Kahoot, Quizizz tăng động lực, mô hình STEM thực chứng).
     + GIẢI PHÁP 4: Phương án phối hợp mở rộng (Kết nối gia đình, phụ huynh học sinh) kết hợp đa dạng hóa công tác kiểm tra, tự đánh giá và khen thưởng kịp thời tại lớp.
  3. Hiệu quả thực tế của sáng kiến kinh nghiệm sau thời gian áp dụng:
     + Đánh giá sự chuyển biến tích cực, vượt trội về nhận thức hành vi, kỹ năng và mức độ hứng thú tự học của học sinh.
     + Xây dựng BẢNG THỐNG KÊ ĐỐI SÁNH ĐỊNH LƯỢNG trực quan chi tiết (So sánh kết quả Trước khi áp dụng vs Sau khi áp dụng sáng kiến học tập về các tiêu chí Giỏi/Khá/Trung bình/Yếu kèm số học sinh và tỷ lệ % tăng trưởng rõ rệt) để minh chứng mạnh mẽ cho tính khả thi và ưu thế tuyệt đối của đề tài.

- PHẦN III: KẾT LUẬN VÀ KHUYẾN NGHỊ
  1. Kết luận khoa học: Khái quát ngắn gọn ý nghĩa của sáng kiến, rút ra bài học kinh nghiệm tâm huyết thiết thân của người giáo viên, tính linh hoạt dẻo dai ứng dụng thực tế và khả năng nhân rộng sang các khối lớp khác.
  2. Khuyến nghị thực tiễn: Đề xuất các kiến nghị thiết thực, thông thái gửi tới Ban giám hiệu trường tiểu học/trung học, Phòng Giáo dục và Đào tạo, các cơ quan ban ngành để tạo điều kiện đầu tư đổi mới phương pháp giảng dạy tốt nhất.

Hãy viết bằng tiếng Việt với văn phong chuẩn mực sư phạm, câu từ gãy gọn trau chuốt, cách trình bày khoa học bằng Markdown, các tiêu đề rõ ràng, tạo cảm giác vô cùng chuyên nghiệp và thuyết phục tuyệt đối.`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi nhận thư viện từ Gemini.');
      }

      const generatedResult = data.result;

      const headerTitle = `# BÁO CÁO SÁNG KIẾN KINH NGHIỆM ĐẠT GIẢI XUẤT SẮC\n\n**TÊN ĐỀ TÀI:** ${topicTitle.toUpperCase()}\n**Tác giả:** Giáo viên bộ môn ${selectedSubject} - Khối lớp ${selectedGrade}\n**Đơn vị:** Trường Tiểu học Đổi mới Sư phạm số GDPT 2018\n\n---\n\n${generatedResult}`;
      
      setDraftContent(headerTitle);
      
      const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        phaseName: 'BẢN THẢO TOÀN VĂN',
        promptTitle: 'Sáng kiến kinh nghiệm đầy đủ',
        content: generatedResult,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      
      setGenerationHistory(prev => [newHistoryItem, ...prev]);
      setEditorActiveTab('preview');
      SoundEffects.playKeng();
      showToast('🏆 Bản báo cáo sáng kiến kinh nghiệm toàn văn 100% đã được tạo lập!', 'success');

    } catch (err: any) {
      console.error(err);
      showToast(err.message || '⚠️ Lỗi không thể tạo văn bản trọn vẹn. Thầy Cô vui lòng thử lại sau!', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save the current draft state back to history storage
  const handleSaveToHistory = () => {
    if (!draftContent) {
      showToast('⚠️ Thầy Cô vui lòng viết bài hoặc chọn đề tài trước khi lưu!', 'info');
      return;
    }

    SoundEffects.playKeng();
    const timestamp = new Date().toLocaleString('vi-VN');
    const topicName = topicTitle || 'Sáng kiến Kinh nghiệm tự chủ';

    const matchedIdx = savedSkknList.findIndex(item => item.title === topicName && item.subject === selectedSubject && item.grade === selectedGrade);
    let updatedList = [...savedSkknList];

    if (matchedIdx > -1) {
      updatedList[matchedIdx] = {
        ...updatedList[matchedIdx],
        content: draftContent,
        author: authorName,
        workUnit: workUnit,
        updatedAt: timestamp
      };
      showToast('💾 Đã cập nhật sửa đổi sáng kiến hiện tại thành công!', 'success');
    } else {
      const newItem = {
        id: Math.random().toString(36).substring(2, 9),
        title: topicName,
        subject: selectedSubject,
        grade: selectedGrade,
        stage: activeStage,
        content: draftContent,
        author: authorName,
        workUnit: workUnit,
        updatedAt: timestamp
      };
      updatedList = [newItem, ...updatedList];
      showToast('💾 Đã lưu bài Sáng kiến mới vào Lịch sử thành công!', 'success');
    }

    saveSkknListToStorage(updatedList);
  };

  // Delete saved SKKN item
  const handleDeleteSavedSkkn = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEffects.playTing();
    const updated = savedSkknList.filter(item => item.id !== id);
    saveSkknListToStorage(updated);
    showToast('🗑️ Đã xóa bản ghi Sáng kiến kinh nghiệm khởi lập khỏi Lịch sử lưu trữ!', 'success');
  };

  // Import Saved SKKN to current active workspace
  const handleLoadSavedSkkn = (item: any) => {
    SoundEffects.playKeng();
    setTopicTitle(item.title);
    setSelectedSubject(item.subject);
    setSelectedGrade(item.grade);
    setActiveStage(item.stage || 'tieuhoc');
    setDraftContent(item.content);
    setAuthorName(item.author || currUser?.fullname || '');
    setWorkUnit(item.workUnit || currUser?.school || '');
    setSkknTab('create');
    setEditorActiveTab('preview');
    showToast(`🔌 Đã kết nối và nạp nội dung sáng kiến "${item.title}" lên không gian làm việc!`, 'success');
  };

  // Export content to MS Word HTML format
  const handleExportToWord = (targetContent: string = draftContent, docTitle: string = topicTitle) => {
    if (!targetContent) {
      showToast('⚠️ Không có nội dung để biên tập xuất bản!', 'info');
      return;
    }

    try {
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Sáng kiến kinh nghiệm</title>
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
          @page {
            size: 21cm 29.7cm; /* A4 size */
            margin: 2cm 2cm 2cm 2.5cm; /* Standard pedagogical margin rules */
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.50;
            color: #1e293b;
            background-color: #ffffff;
          }
          h1, h2, h3, h4 {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.3;
            color: #1e3a8a;
          }
          h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-top: 18pt;
            margin-bottom: 24pt;
          }
          h2 {
            font-size: 15pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-top: 22pt;
            margin-bottom: 12pt;
            color: #1e3a8a;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 4px;
          }
          h3 {
            font-size: 13.5pt;
            font-weight: bold;
            text-transform: none;
            margin-top: 18pt;
            margin-bottom: 10pt;
            text-align: left;
            color: #2563eb;
          }
          h4 {
            font-size: 13pt;
            font-weight: bold;
            margin-top: 14pt;
            margin-bottom: 6pt;
            text-align: left;
            color: #475569;
          }
          p {
            margin-top: 0;
            margin-bottom: 10pt;
            text-align: justify;
            text-indent: 1.25cm;
            font-size: 13pt;
            line-height: 1.5;
          }
          ul, ol {
            margin-top: 6pt;
            margin-bottom: 10pt;
            padding-left: 20pt;
          }
          li {
            margin-bottom: 6pt;
            text-align: justify;
            font-size: 13pt;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            margin-bottom: 14pt;
          }
          th {
            border: 1px solid #cbd5e1;
            padding: 10px;
            background-color: #f1f5f9;
            font-weight: bold;
            font-size: 11pt;
            text-align: center;
            color: #1e3a8a;
          }
          td {
            border: 1px solid #cbd5e1;
            padding: 10px;
            font-size: 11pt;
            text-align: left;
            vertical-align: middle;
            color: #334155;
          }
          .italic {
            font-style: italic;
          }
          .bold {
            font-weight: bold;
          }
          hr {
            border: none;
            border-top: 1px dashed #cbd5e1;
            margin: 20pt 0;
          }
        </style>
      </head>
      <body>`;
      
      const footer = "</body></html>";
      let rawHtml = formatMarkdownToHtml(targetContent);

      let coverPageHtml = "";
      if (authorName || workUnit) {
        coverPageHtml = `
        <div style="text-align: center; margin-bottom: 40pt; border-bottom: 2px double #cbd5e1; padding-bottom: 20pt; font-family: 'Times New Roman', Times, serif;">
          <p style="font-weight: bold; font-size: 13pt; margin-bottom: 4pt; text-align: center;">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
          <p style="font-weight: bold; font-size: 13pt; text-transform: uppercase; margin-bottom: 40pt; text-align: center;"><b>ĐƠN VỊ: ${workUnit.toUpperCase() || 'TRƯỜNG HỌC'}</b></p>
          <div style="height: 60px;"></div>
          <p style="font-weight: bold; font-size: 16pt; text-transform: uppercase; margin-bottom: 10pt; text-align: center;"><b>BÁO CÁO CHUYÊN ĐỀ SÁNG KIẾN KINH NGHIỆM</b></p>
          <p style="font-style: italic; font-size: 14pt; margin-bottom: 40pt; text-align: center; color: #1e3a8a;">Đề tài: ${docTitle}</p>
          <div style="height: 120px;"></div>
          <table style="width: 80%; border-collapse: collapse; margin-left: auto; margin-right: auto; margin-top: 30pt; border: none;">
            <tr>
              <td style="width: 40%; font-weight: bold; border: none; font-size: 12pt; padding: 6px;">Người thực hiện (Tác giả):</td>
              <td style="width: 60%; border: none; font-size: 12pt; padding: 6px;">${authorName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; border: none; font-size: 12pt; padding: 6px;">Đơn vị công tác:</td>
              <td style="border: none; font-size: 12pt; padding: 6px;">${workUnit}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; border: none; font-size: 12pt; padding: 6px;">Môn giảng dạy:</td>
              <td style="border: none; font-size: 12pt; padding: 6px;">${selectedSubject}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; border: none; font-size: 12pt; padding: 6px;">Khối lớp áp dụng:</td>
              <td style="border: none; font-size: 12pt; padding: 6px;">${selectedGrade}</td>
            </tr>
          </table>
        </div>
        <div style="page-break-after: always; clear: both; height: 1px; overflow: hidden;"></div>
        `;
      }

      // Automatic page break configuration for MS Word (break before major Roman/text parts e.g. PHẦN II, PHẦN III)
      rawHtml = rawHtml.replace(/(<h[23][^>]*>(PHẦN|Phần)\s*(I|II|III|IV|V|HAI|BA|BỐN).*?<\/h[23]>)/gi, '<div style="page-break-before: always; clear: both; height: 1px; overflow: hidden;"></div>$1');
      
      const blob = new Blob([header + coverPageHtml + rawHtml + footer], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedName = docTitle ? docTitle.replace(/[^a-zA-Z0-9 Vietnamese]/g, "") : "Sang_Kien_Kinh_Nghiem";
      link.href = url;
      link.download = `SKKN_Mon_${selectedSubject}_Lop_${selectedGrade}_${sanitizedName.trim().replace(/\s+/g, "_")}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 Tải tệp tài liệu Sáng kiến Kinh nghiệm (file .DOC Word) thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('❌ Không thể kết xuất tệp Word. Thầy Cô vui lòng thử lại!', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 md:px-8 font-sans" id="skkn_module_container">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all max-w-md ${
              toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              toastType === 'info' ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse' :
              'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {toastType === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {toastType === 'info' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />}
            {toastType === 'error' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
            <span className="leading-snug">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Module Header card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Biên Soạn Sáng Kiến Kinh Nghiệm
                <span className="text-[10px] uppercase font-black bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full tracking-wider border border-indigo-200">
                  AI PRO 2026
                </span>
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Chuyên gia cố vấn sư phạm thông minh viết Đề cương, giải pháp đổi mới và Phản biện chất lượng hội đồng thang điểm cao.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCompileFullSKKN}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-950 text-white text-xs font-black shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              VIẾT TRỌN VẸN SKKN KHUNG CHUẨN
            </button>
          </div>
        </div>

        {/* 4 Master Navigation Tabs - Matching Lesson Planner layout */}
        <div className="flex gap-4 border-b border-slate-200 mt-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => { setSkknTab('create'); SoundEffects.playTing(); }}
            className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              skknTab === 'create'
                ? 'border-[#2454A6] text-[#2454A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            📝 Soạn SKKN mới
          </button>
          <button
            type="button"
            onClick={() => { setSkknTab('preview'); SoundEffects.playTing(); }}
            className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              skknTab === 'preview'
                ? 'border-[#2454A6] text-[#2454A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            📄 Xem trước SKKN ({draftContent ? 'Sẵn sàng' : 'Chưa có'})
          </button>
          <button
            type="button"
            onClick={() => { setSkknTab('templates'); SoundEffects.playTing(); }}
            className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              skknTab === 'templates'
                ? 'border-[#2454A6] text-[#2454A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            📚 Khung đề cương & Mẫu
          </button>
          <button
            type="button"
            onClick={() => { setSkknTab('library'); SoundEffects.playTing(); }}
            className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              skknTab === 'library'
                ? 'border-[#2454A6] text-[#2454A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            🏫 Thư viện SKKN nội bộ
          </button>
          <button
            type="button"
            onClick={() => { setSkknTab('history'); SoundEffects.playTing(); }}
            className={`pb-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              skknTab === 'history'
                ? 'border-[#2454A6] text-[#2454A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            ⏳ Lịch sử lưu trữ ({savedSkknList.length})
          </button>
        </div>

        {/* Dynamic content area depending on selected state */}
        <div className="transition-all duration-300">
          
          {/* TAB 1: CREATE SKKN */}
          {skknTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: CRITERIA SELECTOR & STEPPED PROMPTS */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* SELECTORS BOX */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs uppercase font-black text-slate-800 tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Thông tin cơ bản & Đề tài
                    </h2>
                    <span className="text-[10px] font-black text-slate-400">Đồng bộ sư phạm</span>
                  </div>

                  {/* Level picker */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Cấp học giảng dạy</label>
                    <div className="grid grid-cols-3 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                      <button
                        onClick={() => setActiveStage('tieuhoc')}
                        className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                          activeStage === 'tieuhoc' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🎒 Tiểu học
                      </button>
                      <button
                        onClick={() => setActiveStage('thcs')}
                        className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                          activeStage === 'thcs' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🏛️ THCS
                      </button>
                      <button
                        onClick={() => setActiveStage('thpt')}
                        className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                          activeStage === 'thpt' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🏛️ THPT
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Khối lớp selector */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Khối lớp (Menu sổ)</label>
                      <div className="relative">
                        <select
                          value={selectedGrade || 'Lớp 3'}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 appearance-none cursor-pointer"
                        >
                          {stageGrades[activeStage].map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Môn học selector */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Môn học (Menu sổ)</label>
                      <div className="relative">
                        <select
                          value={selectedSubject || 'Tin học'}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 appearance-none cursor-pointer"
                        >
                          {stageSubjects[activeStage].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Người thực hiện & Đơn vị công tác */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Người thực hiện</label>
                      <input
                        type="text"
                        value={authorName || ''}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Họ và tên giáo viên"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Đơn vị công tác</label>
                      <input
                        type="text"
                        value={workUnit || ''}
                        onChange={(e) => setWorkUnit(e.target.value)}
                        placeholder="Trường / Cơ sở giáo dục"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Tên đề tài */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Tên đề tài SKKN (Text)</label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={topicTitle || ''}
                        onChange={(e) => setTopicTitle(e.target.value)}
                        placeholder="Nhập đề tài SKKN mong muốn..."
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 leading-relaxed"
                      />
                      {!topicTitle && (
                        <span className="absolute right-3 bottom-3 flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                          Chọn gợi ý / khung đề cương mẫu
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 20 YEARS CLINICAL EXPERT BENTO ACTION */}
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-5 border border-indigo-900/60 shadow-xl text-white space-y-4 relative overflow-hidden">
                    {/* Background glows */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-550 text-indigo-300 rounded-xl">
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase block">Cố vấn sư phạm 20 năm kinh nghiệm</span>
                        <h3 className="text-xs font-black tracking-tight text-white mt-0.5">VIẾT TRỌN VẸN SÁNG KIẾN KINH NGHIỆM</h3>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                      Chỉ cần chọn Khối lớp, Môn học và nhập/chọn Tên đề tài phía trên. Robot Cố vấn Sư phạm Cao cấp sẽ ngay lập tức biên soạn toàn văn một bài sáng kiến kinh nghiệm hoàn chỉnh chuẩn tiêu chí của Bộ Giáo dục (bao gồm Lý do chọn đề tài, Thực trạng định lượng, 4 Biện pháp giải pháp chi tiết sinh động cùng bảng số liệu so sánh đối chứng trước/sau áp dụng).
                    </p>

                    <button
                      onClick={handleCompileFullSKKN}
                      disabled={isGenerating}
                      className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-amber-600 active:border-b-0 active:translate-y-0.5"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          ĐANG BIÊN SOẠN SKKN HOÀN CHỈNH...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          BẮT ĐẦU VIẾT TRỌN VẸN SÁNG KIẾN CẤP TỐC ✨
                        </>
                      )}
                    </button>
                  </div>

                  {/* CHỌN ĐỀ CƯƠNG MẪU TRIGGERS */}
                  <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-2">
                    <label className="block text-[10px] font-black uppercase text-indigo-800 tracking-wider">
                      📋 Lập đề cương chuẩn (CHỌN ĐỀ CƯƠNG MẪU)
                    </label>
                    <div className="relative">
                      <select
                        value={selectedOutline || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSelectOutline(e.target.value);
                          }
                        }}
                        className="w-full bg-white border border-indigo-200 p-3.5 rounded-xl text-xs font-black text-indigo-800 hover:bg-indigo-50 transition-all focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="" className="font-bold text-slate-500">⚡ Chọn từ 5 Đề cương mẫu chuẩn Bộ GD...</option>
                        {MASTER_OUTLINES.map((outline) => (
                          <option key={outline.id} value={outline.id}>
                            {outline.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-4.5 text-indigo-600 w-4 h-4 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold italic leading-normal">
                      Hệ thống tự động đồng bộ tên Môn học, Khối lớp và thiết kế khung phần phù hợp với quy định.
                    </p>
                  </div>

                  {/* TOPIC SUGGESTIONS FROM REGISTRY */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookMarked className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-black uppercase text-slate-700 tracking-wide">
                        Gợi ý đề tài phổ biến: {selectedSubject}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {getSubjectSuggestions().map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setTopicTitle(topic.title);
                            showToast(`💡 Đã áp dụng mẫu đề tài: "${topic.title}"`, 'success');
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200 transition-all text-[11px] leading-relaxed block cursor-pointer group"
                        >
                          <div className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{topic.title}</div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{topic.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* THE 5 PHASE STEPPED WRITER GUIDE */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs uppercase font-black text-slate-800 tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      Tiến trình biên soạn chi tiết
                    </h2>
                    <div className="flex gap-1">
                      {FLOW_GUIDELINES.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2.5 h-1 md:w-3.5 rounded-full transition-all ${
                            idx === currentPromptPhase ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mini stages nav */}
                  <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-thin">
                    {FLOW_GUIDELINES.map((flow, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setCurrentPromptPhase(idx); SoundEffects.playTing(); }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex-shrink-0 transition-all cursor-pointer ${
                          currentPromptPhase === idx 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-150'
                        }`}
                      >
                        GĐ {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Stage Details */}
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2.5 ${FLOW_GUIDELINES[currentPromptPhase].color}`}>
                    <div className="font-extrabold flex items-center justify-between">
                      <span className="tracking-wide">{FLOW_GUIDELINES[currentPromptPhase].phaseName}</span>
                      <Award className="w-4 h-4 text-current" />
                    </div>
                    <p className="font-semibold text-slate-600 leading-snug">
                      {FLOW_GUIDELINES[currentPromptPhase].description}
                    </p>
                  </div>

                  {/* AI Phản Biện solution-specific section (Phase 4 display overlay) */}
                  {currentPromptPhase === 3 && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200 shadow-inner space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-indigo-700 animate-pulse" />
                            <span className="text-xs font-black text-indigo-900 uppercase">Hội Đồng Thẩm Định AI Phản Biện</span>
                          </div>
                          <span className="text-[9px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-md uppercase">
                            Khuyên dùng
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-indigo-950 leading-relaxed">
                          Nhấn nút dưới để AI đóng vai Hội đồng Giám khảo thẩm định phản biện sâu sắc giải pháp đã viết (Điểm mạnh, lỗi phương pháp, gợi ý tối ưu điểm số tăng chất lượng).
                        </p>
                        
                        <button
                          onClick={handleAiRebuttal}
                          disabled={isGenerating || isReviewing}
                          className="w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isReviewing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              ĐANG THẨM ĐỊNH PHẢN BIỆN...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4" />
                              CHẠY AI PHẢN BIỆN GIẢI PHÁP
                            </>
                          )}
                        </button>
                      </div>

                      {/* AI Gợi ý Minh chứng specific segment (Phase 4 interactive helper) */}
                      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-indigo-100 rounded-2xl p-4 border border-purple-200 shadow-inner space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-700 animate-pulse" />
                            <span className="text-xs font-black text-purple-900 uppercase">AI GỢI Ý MINH CHỨNG SƯ PHẠM</span>
                          </div>
                          <span className="text-[9px] font-black text-white bg-purple-600 px-2 py-0.5 rounded-md uppercase">
                            Tự động
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-purple-950 leading-relaxed">
                          Nhập giải pháp giáo viên bên dưới để AI tự động phân tích và tối ưu hóa danh sách minh chứng sư phạm thực tế (ảnh chụp hoạt động, bảng đối chiếu, khảo sát điểm số...).
                        </p>
                        
                        <div className="space-y-1.5">
                          <textarea
                            rows={3}
                            value={solutionForEvidence || ''}
                            onChange={(e) => setSolutionForEvidence(e.target.value)}
                            placeholder="Nhập giải pháp của Thầy Cô... (hoặc để trống để AI lấy tự động từ bản thảo sáng kiến bên phải)"
                            className="w-full bg-white border border-purple-200/60 p-2.5 rounded-xl text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-snug placeholder:text-slate-400"
                          />
                          <div className="flex justify-between items-center text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                if (draftContent) {
                                  setSolutionForEvidence(draftContent);
                                  showToast('📋 Đã điền nhanh nội dung bản thảo sáng kiến hiện tại!', 'success');
                                  SoundEffects.playTing();
                                } else {
                                  showToast('⚠️ Bản thảo hiện tại trống rỗng!', 'error');
                                }
                              }}
                              className="text-indigo-600 font-extrabold hover:underline"
                            >
                              Lấy nhanh từ Bản thảo
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleSuggestEvidence}
                          disabled={isSuggestingEvidence || isGenerating}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSuggestingEvidence ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              ĐANG PHÂN TÍCH MINH CHỨNG...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-purple-100" />
                              PHÂN TÍCH GỢI Ý MINH CHỨNG AI
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Prompts list */}
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Trình tự Prompt AI Khuyên Dùng
                    </div>
                    {FLOW_GUIDELINES[currentPromptPhase].prompts.map((p, idx) => {
                      const subContent = p.content
                        .replace(/\[môn học\]/g, selectedSubject)
                        .replace(/\[khối lớp\]/g, selectedGrade)
                        .replace(/\[Tên đề tài\]/g, topicTitle || "...");
                      
                      return (
                        <div 
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all text-xs flex flex-col justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors flex items-start gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                              {p.title}
                            </div>
                            <p className="text-[11px] font-medium text-slate-600 leading-normal pl-2.5 italic">
                              "{subContent}"
                            </p>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(subContent);
                                showToast('📋 Đã sao chép prompt giáo án vào bộ nhớ tạm!', 'success');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              Sao chép
                            </button>
                            <button
                              onClick={() => handleExecutePrompt(p.content, p.title)}
                              disabled={isGenerating}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] flex items-center gap-1 transition-all shadow-sm cursor-pointer disabled:opacity-50 whitespace-nowrap"
                            >
                              <Sparkles className="w-3 h-3" />
                              Chạy AI
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: WORKSPACE EDITOR, PREVIEW & AI REBUTTAL */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
                  
                  {/* WORKSPACE NAV */}
                  <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-xs uppercase font-black text-slate-800 tracking-wider">
                        Không gian Biên soạn sáng kiến
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Editor Tabs */}
                      <div className="flex bg-slate-200 p-0.5 rounded-xl border border-slate-300 flex-wrap gap-0.5">
                        <button
                          onClick={() => setEditorActiveTab('preview')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            editorActiveTab === 'preview' 
                              ? 'bg-white text-slate-800 shadow-sm font-extrabold' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Eye className="w-3 h-3 text-[#2454A6]" />
                          Xem sửa trước ✨
                        </button>
                        <button
                          onClick={() => setEditorActiveTab('rebuttal')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            editorActiveTab === 'rebuttal'
                              ? 'bg-red-50 text-indigo-900 shadow-sm font-black'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <MessageSquare className="w-3 h-3 text-indigo-500 animate-pulse" />
                          Phản biện {reviewFeedback && '🔴'}
                        </button>
                        <button
                          onClick={() => setEditorActiveTab('logic_audit')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            editorActiveTab === 'logic_audit'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-sm font-black'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          Lỗi logic {logicAuditReport && '⚠️'}
                        </button>
                        <button
                          onClick={() => setEditorActiveTab('evidence')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            editorActiveTab === 'evidence'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm font-black'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-purple-300" />
                          Gợi ý Minh chứng {suggestedEvidenceResult && '💡'}
                        </button>
                      </div>

                      {/* Utility controllers */}
                      <button
                        onClick={handleAuditLogic}
                        disabled={isAuditing || !draftContent}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-black transition-all flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50 border-b-2 border-amber-600 active:border-b-0 active:translate-y-0.5"
                        title="Quét toàn bộ bài viết tìm mâu thuẫn lập luận bằng AI"
                      >
                        {isAuditing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ĐANG QUÉT MÂU THUẪN...
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            KIỂM TRA LỖI LOGIC ✨
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          syncVisualChangesToDraft();
                          setTimeout(() => {
                            handleSaveToHistory();
                          }, 100);
                        }}
                        disabled={!draftContent}
                        className="px-3 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] font-extrabold transition-all flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                        title="Lưu sáng kiến"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Lưu bản thảo
                      </button>
                      <button
                        onClick={() => {
                          syncVisualChangesToDraft();
                          setTimeout(() => {
                            handleExportToWord(draftContent, topicTitle);
                          }, 100);
                        }}
                        disabled={!draftContent}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold transition-all flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Xuất Word
                      </button>
                    </div>
                  </div>

                  {/* WORKSPACE AREA BY STATE */}
                  <div className="p-5 flex-1 flex flex-col min-h-[480px]">
                    
                    {editorActiveTab === 'preview' && (() => {
                      const executeFormat = (command: string, value: string = '') => {
                        document.execCommand(command, false, value);
                        syncVisualChangesToDraft();
                        SoundEffects.playTing();
                      };

                      return (
                        <div className="flex-1 flex flex-col space-y-4">
                          {/* WYSIWYG rich text toolbar */}
                          <div className="flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl text-xs select-none shadow-sm animate-fade-in">
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                executeFormat('undo');
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 transition-all cursor-pointer"
                              title="Hoàn tác (Ctrl+Z)"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                executeFormat('redo');
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 transition-all cursor-pointer"
                              title="Làm lại (Ctrl+Y)"
                            >
                              <Redo2 className="w-4 h-4" />
                            </button>

                            <div className="w-[1px] h-5 bg-slate-200 mx-1" />

                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                executeFormat('bold');
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 font-extrabold transition-all cursor-pointer"
                              title="Chữ đậm (Ctrl+B)"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                executeFormat('italic');
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 italic transition-all cursor-pointer"
                              title="Chữ nghiêng (Ctrl+I)"
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                executeFormat('underline');
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 underline transition-all cursor-pointer"
                              title="Gạch chân (Ctrl+U)"
                            >
                              U
                            </button>

                            <div className="w-[1px] h-5 bg-slate-200 mx-1" />

                            <div className="flex items-center gap-1.5 pl-1" title="Màu chữ">
                              <span className="text-[11px] font-bold text-slate-500">Màu chữ:</span>
                              <input
                                type="color"
                                defaultValue="#000000"
                                onChange={(e) => {
                                  executeFormat('foreColor', e.target.value);
                                }}
                                className="w-6 h-6 rounded-lg cursor-pointer border border-slate-300 p-0 overflow-hidden bg-transparent"
                              />
                            </div>
                          </div>

                          <div className="text-[11px] font-extrabold text-[#2454A6] bg-[#2454A6]/5 p-2.5 rounded-xl border border-[#2454A6]/20 flex items-center justify-between">
                            <span>✍️ Thầy Cô có thể click đúp hoặc di chuột gõ trực tiếp vào tài liệu bên dưới để sửa chính xác, trực quan!</span>
                            <span className="text-[10px] text-slate-400 font-mono">Đã hỗ trợ phông Times New Roman 13pt</span>
                          </div>

                          {/* Editable Preview Frame */}
                          <div className="flex-1 p-8 rounded-2xl bg-white border border-slate-250 overflow-y-auto max-h-[600px] min-h-[420px] shadow-sm prose prose-slate max-w-none focus-within:border-indigo-400 transition-all">
                            <div 
                              ref={editableRef}
                              contentEditable={true}
                              onBlur={syncVisualChangesToDraft}
                              className="font-serif leading-relaxed text-slate-800 outline-none w-full min-h-[380px] text-left select-text"
                              style={{ 
                                fontFamily: "'Times New Roman', Times, serif", 
                                fontSize: '13pt',
                                lineHeight: '1.5',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {editorActiveTab === 'rebuttal' && (
                      <div className="flex-1 flex flex-col space-y-3">
                        <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl text-white space-y-2 shadow-md">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-indigo-300 animate-bounce" />
                            <h4 className="text-xs font-black tracking-wider uppercase">Báo cáo Phản biện thử Hội đồng Giám khảo AI</h4>
                          </div>
                          <p className="text-[11px] text-slate-350 leading-normal">
                            Đóng vai là Hội đồng Thẩm định chuyên gia cấp sở ngành, để tư vấn điểm yếu, giải pháp bứt phá tối ưu hóa sáng kiến.
                          </p>
                          {draftContent && (
                            <button
                              onClick={handleAiRebuttal}
                              disabled={isReviewing}
                              className="px-3 py-1 bg-indigo-650 hover:bg-indigo-700 rounded-lg text-[10px] font-black flex items-center gap-1 text-white border border-indigo-500 shadow-sm transition-all"
                            >
                              <RefreshCw className="w-3 h-3" /> Tái phân tích cập nhật mới
                            </button>
                          )}
                        </div>

                        <div className="flex-1 p-6 rounded-2xl bg-slate-50 border border-slate-200 overflow-y-auto max-h-[500px] min-h-[350px] shadow-sm">
                          {isReviewing ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                              <span className="text-xs font-bold text-slate-600">Hội đồng AI đang đọc kỹ lưỡng bản thảo của bạn, phân tích phương pháp sư phạm và chuẩn bị báo cáo...</span>
                            </div>
                          ) : reviewFeedback ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="text-[10px] font-black text-slate-400">CHI TIẾT Ý KIẾN THẨM ĐỊNH</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(reviewFeedback);
                                    showToast('📋 Đã sao chép phản hồi phản biện!', 'success');
                                  }}
                                  className="text-[10px] gap-1 text-indigo-750 font-bold hover:underline flex items-center"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy Báo cáo
                                </button>
                              </div>
                              <div 
                                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(reviewFeedback) }} 
                                className="font-serif text-slate-800 bg-white p-5 rounded-xl border border-slate-150 shadow-sm text-sm leading-relaxed"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                              <HelpCircle className="w-12 h-12 text-slate-350" />
                              <span className="text-xs font-black text-slate-800">Chưa có kết quả phản biện nào</span>
                              <span className="text-[11px] text-slate-500 max-w-sm">Hoàn thành khung đề cương ý tưởng sư phạm, sau đó chọn Giai đoạn 4 hoặc bấm "Phản biện Bản thảo này" để Robot Thẩm định đưa ra ý kiến.</span>
                              <button
                                onClick={handleAiRebuttal}
                                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-sm"
                              >
                                <Sparkles className="w-4 h-4" /> Bắt đầu Phản biện ngay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {editorActiveTab === 'logic_audit' && (
                      <div className="flex-1 flex flex-col space-y-3">
                        <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-950 rounded-2xl text-white space-y-2 shadow-md">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-200 animate-bounce" />
                            <h4 className="text-xs font-black tracking-wider uppercase">Hội Đồng Phản Biện Sư Phạm - Rà Soát Lỗi Lập Luận Logic</h4>
                          </div>
                          <p className="text-[11px] text-amber-100 leading-normal">
                            Hệ thống sẽ đối soát liên kết hữu cơ giữa Thực trạng đầu học kỳ và giải pháp triển khai, phát hiện mâu thuẫn thực nghiệm số liệu, đề xuất cách viết lại chuẩn mực học thuật cao.
                          </p>
                          {draftContent && (
                            <button
                              onClick={handleAuditLogic}
                              disabled={isAuditing}
                              className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black flex items-center gap-1 border border-amber-300 shadow-sm transition-all"
                            >
                              <RefreshCw className="w-3 h-3" /> Tải rà soát và cập nhật báo cáo
                            </button>
                          )}
                        </div>

                        <div className="flex-1 p-6 rounded-2xl bg-amber-50/20 border border-amber-200/60 overflow-y-auto max-h-[500px] min-h-[350px] shadow-sm">
                          {isAuditing ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                              <span className="text-xs font-bold text-slate-600">Thành viên ban cố vấn AI đang đối soát kỹ lưỡng các chương mục trong bản sáng kiến...</span>
                            </div>
                          ) : logicAuditReport ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
                                <span className="text-[10px] font-black text-amber-800 flex items-center gap-1">📋 BÁO CÁO PHẢN BIỆN LẬP LUẬN LOGIC</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(logicAuditReport);
                                    showToast('📋 Đã sao chép phản hồi kiểm tra logic!', 'success');
                                  }}
                                  className="text-[10px] gap-1 text-indigo-750 font-bold hover:underline flex items-center cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy Báo cáo
                                </button>
                              </div>
                              <div 
                                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(logicAuditReport) }} 
                                className="font-serif text-slate-800 bg-white p-6 rounded-xl border border-slate-150 shadow-sm text-sm leading-relaxed"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                              <AlertCircle className="w-12 h-12 text-amber-400/80 animate-pulse" />
                              <span className="text-xs font-black text-slate-850">Chưa hoạt hóa kiểm tra mâu thuẫn logic lập luận</span>
                              <span className="text-[11px] text-slate-500 max-w-sm">Bấm nút kích hoạt bên dưới để AI kiểm duyệt và rà dựng báo cáo mâu thuẫn thực nghiệm sư phạm.</span>
                              <button
                                onClick={handleAuditLogic}
                                className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-600 transition-all flex items-center gap-1 shadow-sm border-b-2 border-amber-700"
                              >
                                <Sparkles className="w-4 h-4 animate-spin" /> Quét lỗi logic bài viết bằng AI
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {editorActiveTab === 'evidence' && (
                      <div className="flex-1 flex flex-col space-y-4">
                        <div className="p-4 bg-gradient-to-r from-purple-700 to-indigo-850 rounded-2xl text-white space-y-2 shadow-md">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-200 animate-pulse animate-none" />
                            <h4 className="text-xs font-black tracking-wider uppercase">AI Gợi ý Minh chứng Sư phạm Thực tế</h4>
                          </div>
                          <p className="text-[11px] text-purple-100 leading-normal">
                            Khi Thầy Cô đưa ra giải pháp sáng kiến, Trí tuệ Nhân tạo sẽ tự động gợi ý các tệp minh chứng thực tế cần thiết (Ảnh học sinh thực nghiệm, sơ đồ tự học, bảng đối sánh kết quả trước/sau áp dụng, video clip tiết dạy mẫu...) để củng cố độ tin cậy tuyệt đối với Hội đồng kiểm duyệt.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-12 lg:col-span-5 space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Giải pháp của Thầy Cô</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (draftContent) {
                                      setSolutionForEvidence(draftContent);
                                      showToast('📋 Đã điền nhanh từ bản thảo hiện tại!', 'success');
                                      SoundEffects.playTing();
                                    } else {
                                      showToast('⚠️ Bản thảo trống rỗng. Hãy viết hoặc tạo sáng kiến trước nhé!', 'error');
                                    }
                                  }}
                                  className="text-[10px] text-indigo-600 font-extrabold hover:underline cursor-pointer"
                                >
                                  Lấy từ Bản thảo
                                </button>
                              </div>
                              <textarea
                                rows={6}
                                value={solutionForEvidence || ''}
                                onChange={(e) => setSolutionForEvidence(e.target.value)}
                                placeholder="Hãy dán hoặc tự nhập nội dung giải pháp sư phạm của Thầy Cô vào đây để AI phân tích..."
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 leading-relaxed appearance-none resize-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleSuggestEvidence}
                              disabled={isSuggestingEvidence}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isSuggestingEvidence ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  ĐANG KIẾN TẠO MINH CHỨNG...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  KÍCH HOẠT GỢI Ý MINH CHỨNG
                                </>
                              )}
                            </button>
                          </div>

                          <div className="md:col-span-12 lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 overflow-y-auto max-h-[500px] min-h-[300px] shadow-sm flex flex-col justify-between">
                            {isSuggestingEvidence ? (
                              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 flex-1">
                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                <span className="text-xs font-bold text-slate-600">Trí tuệ nhân tạo đang phân tích giải pháp pháp định lượng để chiêu mộ minh chứng tối ưu...</span>
                              </div>
                            ) : suggestedEvidenceResult ? (
                              <div className="space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                                    <span className="text-[10px] font-black text-purple-800 flex items-center gap-1">💡 MINH CHỨNG KHUYÊN DÙNG ĐƯỢC AI ĐỀ XUẤT</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(suggestedEvidenceResult);
                                        showToast('📋 Đã sao chép gợi ý minh chứng!', 'success');
                                      }}
                                      className="text-[10px] gap-1 text-indigo-750 font-black hover:underline flex items-center cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" /> Copy gợi ý
                                    </button>
                                  </div>
                                  <div 
                                    dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(suggestedEvidenceResult) }} 
                                    className="font-sans text-slate-800 text-xs sm:text-sm leading-relaxed space-y-2.5"
                                  />
                                </div>
                                <div className="border-t border-slate-100 pt-3 mt-4 flex justify-end">
                                  <button
                                    onClick={() => {
                                      setDraftContent(prev => prev + `\n\n---\n\n## 💡 GỢI Ý MINH CHỨNG THỰC TẾ (AI PROPOSED)\n\n${suggestedEvidenceResult}`);
                                      showToast('✨ Đã gắn các gợi ý minh chứng vào cuối Bản thảo của Thầy Cô!', 'success');
                                      SoundEffects.playTing();
                                    }}
                                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" /> Gắn trực tiếp vào Bản thảo
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 flex-1">
                                <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
                                <span className="text-xs font-black text-slate-800">Chưa có gợi ý nào</span>
                                <span className="text-[11px] text-slate-500 max-w-sm">Dán giải pháp sư phạm ở ô trái hoặc bấm \"Lấy từ Bản thảo\" rồi click nút để AI quét tạo lập các mô hình minh chứng tối ưu.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* SESSIONS snippets FLOW LOGS */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs uppercase font-black text-slate-800 tracking-wider flex items-center gap-1.5">
                      <List className="w-4 h-4 text-[#2454A6]" />
                      Phân mảnh thế các đoạn đã tạo ({generationHistory.length})
                    </h2>
                    <button
                      onClick={() => {
                        setGenerationHistory([]);
                        showToast('🧹 Đã xóa lịch sử sinh đoạn của phiên này', 'success');
                      }}
                      disabled={generationHistory.length === 0}
                      className="text-[10px] font-black text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-40"
                    >
                      Dọn dẹp
                    </button>
                  </div>

                  {generationHistory.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold italic">
                      Lịch sử phân mảnh rỗng. Thầy Cô có thể lấy ý tưởng từng giai đoạn sư phạm ở bảng bên trái.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {generationHistory.map((item) => (
                        <div 
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 hover:border-slate-300 transition-all text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] uppercase font-black bg-[#2454A6]/10 text-[#2454A6] px-1.5 py-0.5 rounded-md">
                                {item.phaseName}
                              </span>
                              <span className="font-extrabold text-slate-800">
                                {item.promptTitle}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-medium">{item.timestamp}</span>
                          </div>
                          
                          <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-white/70 p-2 rounded-xl border border-slate-200">
                            {item.content}
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.content);
                                showToast('📋 Đã copy đoạn nội dung!', 'success');
                              }}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                            <button
                              onClick={() => {
                                setDraftContent(prev => {
                                  if (!prev) return item.content;
                                  return prev + `\n\n---\n\n## ${item.promptTitle.toUpperCase()}\n\n` + item.content;
                                });
                                showToast(`➕ Đã chèn đoạn "${item.promptTitle}" vào cuối văn bản biên soạn`, 'success');
                              }}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-150 hover:bg-indigo-100 font-black text-[10px] rounded-lg transition-all flex items-center gap-1"
                            >
                              Chèn vào biên tập
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
              
            </div>
          )}

          {/* TAB 2: DETAILED STANDARD PREVIEW */}
          {skknTab === 'preview' && (() => {
            const executePreviewFormat = (command: string, value: string = '') => {
              document.execCommand(command, false, value);
              syncPreviewChangesToDraft();
              SoundEffects.playTing();
            };

            return (
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <h3 className="text-base font-black text-slate-800">📄 Bản in Sáng Kiến Kinh Nghiệm Chuẩn Sư Phạm</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Được căn chỉnh hoàn chỉnh sang định dạng biểu mẫu văn bản sư phạm tiêu chuẩn của Bộ Giáo Dục: font Times New Roman, cỡ chữ 13pt-14pt, lề chuẩn quốc gia.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSkknTab('create')}
                      className="px-4 py-2 border border-slate-250 hover:bg-slate-100 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
                    >
                      ✏️ Trở lại Soạn thảo
                    </button>
                    <button
                      onClick={() => handleExportToWord(draftContent, topicTitle)}
                      disabled={!draftContent}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" /> Tải tệp Word (.doc)
                    </button>
                  </div>
                </div>

                {draftContent ? (
                  <div className="space-y-4">
                    {/* Visual Editing Indicator Banner */}
                    <div className="text-[11px] font-extrabold text-[#2454A6] bg-[#2454A6]/5 p-3.5 rounded-2xl border border-[#2454A6]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm animate-fade-in text-left leading-relaxed">
                      <span className="flex items-center gap-1.5">
                        ✍️ <b>CHẾ ĐỘ SỬA TRỰC QUAN:</b> Thầy Cô có thể lick chuột hoặc gõ trực tiếp vào màn hình xem trước dưới đây để sửa bản cứng ngay lập tức!
                      </span>
                      <span className="text-[10px] text-[#2454A6] bg-[#2454A6]/10 px-2.5 py-1 rounded-lg font-mono shrink-0">Bản in Times New Roman 13pt / Lề 2.5cm</span>
                    </div>

                    {/* WYSIWYG rich text toolbar matching create tab's toolbar */}
                    <div className="flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl text-xs select-none shadow-sm animate-fade-in">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          executePreviewFormat('undo');
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 transition-all cursor-pointer"
                        title="Hoàn tác (Ctrl+Z)"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          executePreviewFormat('redo');
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 transition-all cursor-pointer"
                        title="Làm lại (Ctrl+Y)"
                      >
                        <Redo2 className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          executePreviewFormat('bold');
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 font-extrabold transition-all cursor-pointer"
                        title="Chữ đậm (Ctrl+B)"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          executePreviewFormat('italic');
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 italic transition-all cursor-pointer"
                        title="Chữ nghiêng (Ctrl+I)"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          executePreviewFormat('underline');
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-xl text-slate-800 underline transition-all cursor-pointer"
                        title="Gạch chân (Ctrl+U)"
                      >
                        U
                      </button>

                      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

                      <div className="flex items-center gap-1.5 pl-1" title="Màu chữ">
                        <span className="text-[11px] font-bold text-slate-500">Màu chữ:</span>
                        <input
                          type="color"
                          defaultValue="#000000"
                          onChange={(e) => {
                            executePreviewFormat('foreColor', e.target.value);
                          }}
                          className="w-6 h-6 rounded-lg cursor-pointer border border-slate-300 p-0 overflow-hidden bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-10 md:p-14 border border-slate-250 shadow-md max-w-full text-justify relative min-h-[800px] font-serif hover:shadow-lg transition-shadow">
                      {/* Decorative VN Ministry Margin Guideline lines indicator */}
                      <div className="absolute left-[2.5cm] top-0 bottom-0 border-l border-indigo-200/40 pointer-events-none hidden md:block" title="Ranh giới Lề trái (2.5cm)" />
                      
                      {/* Cover page block dynamically populated from inputs */}
                      <div 
                        style={{ fontFamily: '"Times New Roman", Times, serif' }} 
                        className="border-b-2 border-slate-300 pb-8 mb-8 text-center select-none"
                      >
                        <p className="font-bold text-[14pt] leading-snug uppercase text-slate-900 tracking-tight text-center">
                          SỞ GIÁO DỤC VÀ ĐÀO TẠO
                        </p>
                        <p className="font-bold text-[13pt] uppercase text-slate-900 text-center mt-1">
                          ĐƠN VỊ: {workUnit.toUpperCase() || '_______________________'}
                        </p>
                        
                        <div className="w-32 h-[1.5px] bg-slate-900 mx-auto my-4" />
                        
                        <div className="h-20" />
                        
                        <h2 className="font-bold text-[16pt] uppercase tracking-normal text-slate-950 leading-normal text-center">
                          BÁO CÁO SÁNG KIẾN KINH NGHIỆM
                        </h2>
                        <p className="italic text-[14pt] text-slate-700 mt-4 max-w-2xl mx-auto text-center font-semibold leading-relaxed">
                          Đề tài: {topicTitle || '_______________________'}
                        </p>
                        
                        <div className="h-28" />
                        
                        <div className="w-[85%] mx-auto mt-10 text-[13pt] space-y-3 pt-6 border-t border-dashed border-slate-200">
                          <div className="grid grid-cols-12 text-left">
                            <span className="col-span-5 font-bold">Người thực hiện (Tác giả):</span>
                            <span className="col-span-7 font-semibold text-slate-800">{authorName || '_______________________'}</span>
                          </div>
                          <div className="grid grid-cols-12 text-left">
                            <span className="col-span-5 font-bold">Đơn vị công tác:</span>
                            <span className="col-span-7 font-semibold text-slate-800">{workUnit || '_______________________'}</span>
                          </div>
                          <div className="grid grid-cols-12 text-left">
                            <span className="col-span-5 font-bold">Môn giảng dạy:</span>
                            <span className="col-span-7 font-semibold text-slate-800">{selectedSubject}</span>
                          </div>
                          <div className="grid grid-cols-12 text-left">
                            <span className="col-span-5 font-bold">Khối lớp áp dụng:</span>
                            <span className="col-span-7 font-semibold text-slate-800">{selectedGrade}</span>
                          </div>
                        </div>
                        
                        <div className="mt-16 text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-xl px-4 py-2 inline-flex items-center gap-1.5 leading-normal">
                          <span>✨ Bìa chuẩn sư phạm được tự động điền từ Thông tin cơ bản</span>
                        </div>
                      </div>

                      {/* Printable page separator */}
                      <div className="flex items-center justify-center gap-2 text-slate-400 select-none pb-8">
                        <div className="h-[1px] bg-dashed bg-slate-200 flex-1 border-t border-dashed" />
                        <span className="text-[10px] font-black uppercase tracking-widest font-sans text-slate-500">BẮT ĐẦU NỘI DUNG SÁNG KIẾN</span>
                        <div className="h-[1px] bg-dashed bg-slate-200 flex-1 border-t border-dashed" />
                      </div>

                      {/* Main Paper printable frame with direct WYSIWYG capability */}
                      <div 
                        ref={previewEditableRef}
                        contentEditable={true}
                        onBlur={syncPreviewChangesToDraft}
                        style={{ 
                          fontFamily: '"Times New Roman", Times, serif', 
                          lineHeight: '1.5', 
                          fontSize: '13pt', 
                          color: '#050505',
                          paddingLeft: '0.5cm',
                          outline: 'none'
                        }}
                        className="prose prose-slate max-w-none prose-p:indent-[1.25cm] prose-p:text-justify outline-none select-text min-h-[700px] cursor-text"
                        suppressContentEditableWarning={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[32px] p-16 border border-slate-100 shadow-sm text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-sm font-black text-slate-800">Chưa có nội dung bản thảo sáng kiến kinh nghiệm</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                      Thầy Cô vui lòng quay lại tab "Soạn SKKN mới" để tiến hành lập đề mục, chạy AI biên tập ý kiến hoặc chọn khung đề cương mẫu chuẩn để bắt đầu!
                    </p>
                    <button
                      onClick={() => setSkknTab('create')}
                      className="mt-4 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-black transition-all shadow-sm"
                    >
                      ⚡ Lập Sáng Kiến Ngay
                    </button>
                  </div>
                )}

              </div>
            );
          })()}

          {/* TAB: STATISTICS DASHBOARD & SCHOOLWIDE TRENDS - REMOVED */}
          {false && (
            <div className="max-w-6xl mx-auto space-y-6 text-left animate-fade-in">
              {/* Header section */}
              <div className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white rounded-[28px] p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-[#FFFDE8] text-amber-900 font-extrabold text-[10px] md:text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    <span>📊</span> PHÂN TÍCH CHUYÊN MÔN TOÀN DIỆN
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase">
                    Báo cáo & Xu hướng Sáng kiến Kinh nghiệm
                  </h3>
                  <p className="text-xs text-blue-100 font-medium">
                    Hệ thống theo dõi tiến độ phát triển khoa học sư phạm, thống kê đề tài nổi bật và đề xuất xu hướng nghiên cứu mới chuẩn theo Thông tư bậc Tiểu học.
                  </p>
                </div>
              </div>

              {/* Personal vs School-wide */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Metric Summary Cards */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Của Thầy Cô (Viết)</span>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-650">{savedSkknList.length}</span>
                      <span className="text-xs font-bold text-slate-500">Sáng kiến</span>
                    </div>
                    <div className="mt-2 text-[10px] font-medium text-emerald-600 flex items-center gap-0.5">
                      <span>✓</span> 100% Lưu ngoại tuyến an toàn
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Của Thầy Cô (Đánh giá cao)</span>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-rose-600">{savedSkknList.filter(s => s.award).length}</span>
                      <span className="text-xs font-bold text-slate-500">Đạt giải / A-B-C</span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-slate-500">
                      Tỷ lệ đạt giải: {savedSkknList.length ? Math.round((savedSkknList.filter(s => s.award).length / savedSkknList.length) * 100) : 0}% Sáng kiến
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Tổng sản lượng toàn trường</span>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-600">142</span>
                      <span className="text-xs font-bold text-slate-500">Đăng ký tham gia</span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-indigo-600">
                      Tăng trưởng: +18.4% so với năm ngoái
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Tỷ lệ xét duyệt Đạt giải A/B/C</span>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-500">82.4%</span>
                      <span className="text-xs font-bold text-slate-500">Hiệu suất tuyển chọn</span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-rose-600">
                      Tổng: 117 Sáng kiến có giải
                    </div>
                  </div>
                </div>

                {/* Left side: subject trend breakdown - school wide */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-1.5">
                        <span>🔥</span> Xu hướng đề tài Sáng kiến theo bộ môn
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                        Biểu đồ hiển thị mật độ số lượng SKKN đăng ký phân theo các tổ chuyên môn học kỳ 2 (Chuẩn Tiểu Học)
                      </p>
                    </div>
                    <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-md uppercase">Toàn trường</span>
                  </div>

                  {/* Horizontal pill bars for subjects */}
                  <div className="space-y-4">
                    {[
                      { subject: 'Tin học (IT) mẫu mới', count: 34, percentage: 88, color: 'from-blue-500 to-indigo-600', trend: 'Tăng mạnh ✨' },
                      { subject: 'Toán học lý thuyết', count: 28, percentage: 72, color: 'from-emerald-500 to-teal-600', trend: 'Ổn định' },
                      { subject: 'Tiếng Việt sư phạm', count: 24, percentage: 62, color: 'from-purple-500 to-indigo-700', trend: 'Ổn định' },
                      { subject: 'Tiếng Anh phản xạ', count: 19, percentage: 49, color: 'from-amber-400 to-orange-500', trend: 'Nổi bật' },
                      { subject: 'Khoa học & Tự nhiên', count: 14, percentage: 36, color: 'from-pink-500 to-rose-600', trend: 'Tạo mới' },
                      { subject: 'Đạo đức / Giáo dục Công dân', count: 12, percentage: 31, color: 'from-cyan-500 to-blue-600', trend: 'Ổn định' },
                      { subject: 'Hoạt động trải nghiệm / Thể chất', count: 11, percentage: 28, color: 'from-slate-400 to-slate-600', trend: 'Giảm nhẹ' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-slate-850 flex items-center gap-1">
                            <span className="inline-block w-2.5 h-2.5 rounded-md bg-gradient-to-r from-indigo-500 to-blue-500" />
                            {item.subject}
                          </span>
                          <div className="space-x-1.5 flex items-center">
                            <span className="font-black text-slate-700">{item.count} SKKN</span>
                            <span className="text-[9px] font-extrabold text-white bg-indigo-600 px-1.5 py-0.5 rounded-md">
                              {item.trend}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div 
                            className={`bg-gradient-to-r ${item.color} h-full rounded-full transition-all duration-1000`} 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Award breakdown - school wide & Popular keywords cloud */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Category Donut simulation */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
                      🏆 Cơ cấu xếp loại chất lượng xét giải (Cấp Quận)
                    </h4>
                    <div className="flex items-center gap-6 py-2">
                      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                        {/* CSS-only concentric ring effect */}
                        <div className="absolute inset-0 rounded-full border-12 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-12 border-amber-500 border-t-transparent border-l-transparent"></div>
                        <div className="absolute inset-0 rounded-full border-12 border-blue-500 border-b-transparent border-r-transparent rotate-45"></div>
                        <div className="absolute inset-0 rounded-full border-12 border-emerald-500 border-r-transparent border-t-transparent -rotate-45"></div>
                        <div className="z-10 flex flex-col items-center">
                          <span className="text-2xl font-black text-slate-800">117</span>
                          <span className="text-[10px] text-slate-400 font-extrabold">Đạt Giải</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-3 h-3 rounded-full bg-emerald-500" />
                          <div className="flex-1 flex justify-between font-extrabold">
                            <span className="text-slate-600">Giải Nhất (A)</span>
                            <span className="text-slate-850">38 Đề tài</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-3 h-3 rounded-full bg-blue-500" />
                          <div className="flex-1 flex justify-between font-extrabold">
                            <span className="text-slate-600">Giải Nhì (B)</span>
                            <span className="text-slate-850">45 Đề tài</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-3 h-3 rounded-full bg-amber-500" />
                          <div className="flex-1 flex justify-between font-extrabold">
                            <span className="text-slate-600">Giải Ba (C)</span>
                            <span className="text-slate-850">34 Đề tài</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-3 h-3 rounded-full bg-slate-200" />
                          <div className="flex-1 flex justify-between font-extrabold text-slate-500">
                            <span className="font-semibold">Bị từ chối</span>
                            <span className="font-bold">25 Đề tài</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hot Topics Keyword Cloud */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-3.5">
                    <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide border-b border-slate-100 pb-2">
                      💡 Xu hướng từ khóa Đề tài Tìm kiếm Nhiều Nhất
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1 font-bold">
                      {[
                        { text: 'Công văn 2345', size: 'text-xs', bg: 'bg-blue-50 text-blue-700 border-blue-100' },
                        { text: 'STEM thông minh', size: 'text-[11px]', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        { text: 'AI trợ giảng', size: 'text-xs font-black', bg: 'bg-purple-50 text-purple-700 border-purple-100 animate-pulse' },
                        { text: 'Chuyển Đổi Số', size: 'text-[11px]', bg: 'bg-indigo-50 text-indigo-700 border-slate-200' },
                        { text: 'Lập trình Scratch lôi cuốn', size: 'text-[11px]', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
                        { text: 'Học tập trải nghiệm', size: 'text-xs', bg: 'bg-rose-50 text-rose-700 border-rose-100' },
                        { text: 'Lớp học hạnh phúc', size: 'text-[10px]', bg: 'bg-teal-50 text-teal-700 border-teal-100' },
                        { text: 'Học sinh đặc biệt', size: 'text-[10px]', bg: 'bg-slate-50 text-slate-600 border-slate-100' },
                        { text: 'Sơ đồ tư duy', size: 'text-[11px]', bg: 'bg-cyan-50 text-cyan-700 border-cyan-100' }
                      ].map((tag, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2.5 py-1 rounded-xl font-bold border transition-all hover:scale-105 cursor-pointer ${tag.size} ${tag.bg}`}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom detail: Top Outstanding Teachers in Writing SKKN */}
                <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-850 uppercase flex items-center gap-1">
                      👑 Kiện tướng sáng kiến kinh nghiệm đoạt giải cao của trường
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">Danh sách học kỳ gần nhất</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px]">
                          <th className="pb-2">Họ & Tên Giáo Viên</th>
                          <th className="pb-2">Tổ chuyên môn / Lớp</th>
                          <th className="pb-2">Tên Đề tài Sáng kiến tiêu biểu</th>
                          <th className="pb-2">Xếp loại</th>
                          <th className="pb-2 text-right">Năm học</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700 font-bold">
                        {[
                          { name: 'Nguyễn Minh Quân (Bạn)', group: 'Tin học - Lớp 3', title: 'Tích hợp Gamification và Robot học tập thông minh kích hoạt tư duy lập trình Scratch', award: 'Giải Xuất Sắc (A)', year: '2025 - 2026' },
                          { name: 'Phạm Thanh Thảo', group: 'Tổ 1 - Lớp 1', title: 'Phương pháp rèn phát âm chuẩn và luyện chữ đẹp thông qua thẻ chuyển động diệu kỳ', award: 'Giải Nhất (A)', year: '2025 - 2026' },
                          { name: 'Lê Văn Bằng', group: 'Tổ 3 - Lớp 3', title: 'Biện pháp áp dụng giáo án sơ đồ tư duy tương tác STEM giúp lôi cuốn học sinh tính toán nhanh', award: 'Giải Nhì (B)', year: '2024 - 2025' },
                          { name: 'Hoàng Kim Chi', group: 'Tổ Ngoại Ngữ - Lớp 5', title: 'Ứng dụng phòng đàm thoại Virtual Class tăng phản xạ giao tiếp nâng tầm tự tin nói tiếng Anh', award: 'Giải Nhất (A)', year: '2024 - 2025' }
                        ].map((tch, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 pb-2">
                            <td className="py-2.5 font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-[10px] flex items-center justify-center font-black">
                                {idx + 1}
                              </span>
                              {tch.name}
                            </td>
                            <td className="py-2.5 text-slate-500 font-medium">{tch.group}</td>
                            <td className="py-2.5 max-w-xs truncate text-slate-800" title={tch.title}>{tch.title}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                                tch.award.includes('(A)') ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-blue-50 text-blue-700 border border-blue-150'
                              }`}>
                                {tch.award}
                              </span>
                            </td>
                            <td className="py-2 text-right text-slate-500 font-semibold">{tch.year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STANDARDIZED TEMPLATES AND BLUEPRINTS */}
          {skknTab === 'templates' && (
            <div className="max-w-5xl mx-auto space-y-6 text-left">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                  <div className="p-3 bg-indigo-50 text-[#2454A6] rounded-2xl">
                    <BookOpen className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">
                      📚 Danh mục 5 Khung đề cương quy chuẩn Bộ Giáo Dục & Đào Tạo
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Tuyển tập hệ thống mục lục giải trình, bố cục khoa học chuẩn mực giúp giáo viên lập đề cương nhanh chóng trong 1 click.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MASTER_OUTLINES.map((outline, idx) => (
                    <div 
                      key={outline.id}
                      className="p-5 rounded-2xl bg-slate-50 hover:bg-white border hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            Khung số 0{idx + 1}
                          </span>
                          <span className="text-[9px] font-black text-slate-400">Chuẩn GDPT 2018</span>
                        </div>
                        
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-indigo-600 line-clamp-1 leading-normal">
                          {outline.title}
                        </h4>
                        
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {outline.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-200/50 flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            // Quick preview outline in a mock alert/toast format
                            navigator.clipboard.writeText(outline.content);
                            showToast(`📋 Đã copy nội dung đề cương: "${outline.title}"`, 'success');
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer"
                        >
                          Copy Đề cương
                        </button>
                        <button
                          onClick={() => handleSelectOutline(outline.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[10px] font-black text-white cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Nạp vào Soạn thảo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bonus tips card on vn educational requirements */}
              <div className="bg-[#2454A6]/5 rounded-3xl p-6 border border-[#2454A6]/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#2454A6]" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">Bí quyết đạt thang điểm tối đa từ Hội đồng Thẩm định</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm leading-relaxed space-y-1">
                    <span className="font-black text-indigo-700">1. Tính mới & Đổi mới</span>
                    <p className="text-slate-500 text-[11px]">Sáng kiến của thầy cô cần đề cấp cụ thể đến chuyển đổi số, áp dụng Canva, trí tuệ nhân tạo (AI) hỗ trợ hoặc mô hình tích hợp STEM để tăng tính thực chứng hiện đại bám sát xu thế Công văn 2345.</p>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm leading-relaxed space-y-1">
                    <span className="font-black text-indigo-700">2. Số liệu khảo sát thực nghiệm</span>
                    <p className="text-slate-500 text-[11px]">Luôn thiết lập bảng tỷ lệ % đối sánh trước và sau rõ ràng trong Giai đoạn 5. Hội đồng Thẩm định thường đánh giá thông qua các con số thống kê kết quả bứt phá tiến bộ thực tế của học sinh lớp.</p>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm leading-relaxed space-y-1">
                    <span className="font-black text-indigo-700">3. Văn phong & Thẩm mỹ in ấn</span>
                    <p className="text-slate-500 text-[11px]">Giữ thái độ rành mạch, dẫn dắt khoa học, không phô trương hoa mỹ. Cần nạp bản in đúng chuẩn căn lề trái rộng 2.5cm (lề chính), font chữ Times New Roman kích cỡ 13pt.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SAVED HISTORY DATABASE */}
          {skknTab === 'history' && (
            <div className="max-w-6xl mx-auto bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    ⏳ Hồ sơ Sáng kiến Kinh nghiệm ({savedSkknList.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Danh sách các sáng kiến kinh nghiệm do Thầy Cô viết và lưu trữ trong bộ nhớ trình duyệt cá nhân an toàn.
                  </p>
                </div>
                {savedSkknList.length > 0 && (
                  <button
                    onClick={() => {
                      if(window.confirm('Thầy Cô có chắc muốn xóa vĩnh viễn toàn bộ lịch sử Sáng kiến đã soạn?')) {
                        saveSkknListToStorage([]);
                        showToast('🧹 Đã dọn sạch hồ sơ sáng kiến thành công', 'success');
                      }
                    }}
                    className="px-3.5 py-1.5 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-red-200"
                  >
                    Xóa toàn bộ
                  </button>
                )}
              </div>

              {savedSkknList.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 text-slate-300 mx-auto rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-slate-850">Lịch sử trống trải</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hiện chưa có bản sáng kiến hoàn chỉnh nào được lưu lại. Thầy Cô có thể bấm nút "Lưu bản thảo" ở góc phải Trình soạn thảo khi soạn bài!
                  </p>
                  <button
                    onClick={() => setSkknTab('create')}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    📝 Bắt đầu Soạn ngay
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-150">
                  <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                    <thead className="bg-slate-50 font-black text-slate-700 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Khối/Môn học</th>
                        <th className="px-5 py-3.5">Tên Đề tài sáng kiến</th>
                        <th className="px-5 py-3.5">Cập nhật lúc</th>
                        <th className="px-5 py-3.5 text-right">Thao tác dữ liệu</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 text-slate-650 font-semibold">
                      {savedSkknList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-55 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wide">
                                🎒 {item.grade}
                              </span>
                              <span className="text-[11px] text-slate-600 font-extrabold">
                                📘 {item.subject}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="max-w-[320px] md:max-w-md lg:max-w-lg font-black text-slate-800 leading-relaxed text-xs break-words">
                              {item.title}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono font-medium">
                            {item.updatedAt}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleLoadSavedSkkn(item)}
                                className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                                title="Nạp vào trình soạn thảo"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Nạp lại
                              </button>
                              <button
                                onClick={() => handleExportToWord(item.content, item.title)}
                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-150 hover:bg-emerald-100 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" /> Word
                              </button>
                              <button
                                onClick={(e) => handleDeleteSavedSkkn(item.id, e)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-150 hover:border-red-300 transition-all cursor-pointer"
                                title="Xóa bản ghi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {skknTab === 'library' && (
            <div className="max-w-6xl mx-auto bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6 text-left">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  🏫 Thư viện Sáng kiến Kinh nghiệm Nội bộ Trường Tiểu học
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Tra cứu các sáng kiến kinh nghiệm tiêu biểu, đã được hội đồng nâng bậc xét duyệt đạt giải cao qua các năm. Thầy cô có thể đọc tham khảo ý tưởng hoặc áp dụng mẫu trực tiếp vào trình soạn tập.
                </p>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-150">
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo từ khóa tên đề tài, tác giả, ý tưởng chính..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="md:col-span-3 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase shrink-0">Môn:</span>
                  <select
                    value={filterSubject || 'Tất cả'}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Tất cả">Tất cả môn học</option>
                    <option value="Toán">Toán</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Đạo đức">Đạo đức</option>
                    <option value="Khoa học">Khoa học</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase shrink-0">Khối:</span>
                  <select
                    value={filterGrade || 'Tất cả'}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Tất cả">Tất cả khối lớp</option>
                    <option value="Lớp 1">Lớp 1</option>
                    <option value="Lớp 2">Lớp 2</option>
                    <option value="Lớp 3">Lớp 3</option>
                    <option value="Lớp 4">Lớp 4</option>
                    <option value="Lớp 5">Lớp 5</option>
                  </select>
                </div>
              </div>

              {/* TWO COLUMNS LAYOUT: LEFT SIDE LIST, RIGHT SIDE DETAIL PREVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT LIST CONTAINER (5 columns) */}
                <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {(() => {
                    const filtered = INTERNAL_SKKN_LIBRARY.filter(item => {
                      const matchesSearch = searchQuery.trim() === '' || 
                        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesSubject = filterSubject === 'Tất cả' || item.subject === filterSubject;
                      const matchesGrade = filterGrade === 'Tất cả' || item.grade === filterGrade;
                      return matchesSearch && matchesSubject && matchesGrade;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500 text-xs font-bold">
                          Không tìm thấy sáng kiến nào khớp với bộ lọc.
                        </div>
                      );
                    }

                    return filtered.map((item) => {
                      const isSelected = selectedLibraryId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedLibraryId(item.id)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-indigo-50/50 border-indigo-400 shadow-sm'
                              : 'bg-white border-slate-150 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase flex items-center gap-0.5">
                              <Award className="w-3 h-3" /> {item.award} ({item.year})
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-400">
                              🎒 {item.grade} • {item.subject}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 leading-normal mb-2 line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                            <span>Tác giả: <strong className="text-slate-700">{item.author}</strong></span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">Xem chi tiết</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* RIGHT DETAIL PREVIEW CONTAINER (7 columns) */}
                <div className="lg:col-span-7 bg-slate-50/50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  {(() => {
                    const activeLib = INTERNAL_SKKN_LIBRARY.find(item => item.id === selectedLibraryId);
                    if (!activeLib) {
                      return (
                        <div className="py-24 text-center text-slate-400 text-xs font-bold">
                          Vui lòng chọn một sáng kiến ở danh sách bên trái để tra cứu chi tiết.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4 text-xs">
                        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
                            <div className="flex gap-1.5 items-center flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                {activeLib.year}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold">
                                {activeLib.award}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              Môn: {activeLib.subject} • Khối: {activeLib.grade}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-[#2454A6] leading-normal font-serif">
                            {activeLib.title}
                          </h3>
                          <div className="text-[11px] text-slate-600 font-semibold">
                            Cán bộ biên soạn: <strong className="text-[#2454A6]">{activeLib.author}</strong>
                          </div>
                        </div>

                        {/* BRIEF SUMMARY SECTION */}
                        <div className="space-y-1 bg-amber-50/30 p-3.5 rounded-xl border border-amber-200">
                          <h4 className="text-[10px] font-black text-amber-850 uppercase tracking-wider flex items-center gap-1 font-serif">
                            <BookMarked className="w-3.5 h-3.5 text-amber-600" /> Tóm lược cốt lõi sáng kiến
                          </h4>
                          <p className="text-[11.5px] text-slate-650 leading-relaxed font-semibold">
                            {activeLib.summary}
                          </p>
                        </div>

                        {/* FULL PREVIEW RENDERING */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-1">
                            <span>BẢN GỐC TOÀN VĂN (MẪU ĐÃ DUYỆT)</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSubject(activeLib.subject);
                                  setSelectedGrade(activeLib.grade);
                                  setTopicTitle(activeLib.title);
                                  setDraftContent(activeLib.content);
                                  setSkknTab('create');
                                  setEditorActiveTab('preview');
                                  SoundEffects.playTing();
                                  showToast('📋 Đã nạp thành công tài liệu thư viện vào trình soạn thảo mới!', 'success');
                                }}
                                className="px-2.5 py-1 bg-[#2454A6] hover:bg-[#1f478a] text-white rounded-lg text-[10px] font-black transition-all flex items-center gap-0.5 cursor-pointer shadow-sm"
                                title="Áp dụng mẫu này để sửa đổi chỉnh sửa"
                              >
                                <Plus className="w-3.5 h-3.5" /> Dùng mẫu này ✨
                              </button>
                              <button
                                onClick={() => handleExportToWord(activeLib.content, activeLib.title)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-all flex items-center gap-0.5 cursor-pointer shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5" /> Xuất Word
                              </button>
                            </div>
                          </div>
                          <div className="p-5 rounded-xl bg-white border border-slate-200 overflow-y-auto max-h-[300px] shadow-inner prose prose-slate">
                            <div 
                              dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(activeLib.content) }} 
                              className="font-serif leading-relaxed text-slate-850"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
