import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import JSZip from "jszip";

dotenv.config();

// Helper to extract text from attached files (.docx, .pptx, .txt)
async function extractTextFromAttachment(name: string, type: string, base64Data: string): Promise<string> {
  const lowerName = (name || '').toLowerCase();
  try {
    if (lowerName.endsWith('.docx') || type?.includes('wordprocessingml') || type?.includes('msword')) {
      const buffer = Buffer.from(base64Data, 'base64');
      const zip = await JSZip.loadAsync(buffer);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const text = docXml
          .replace(/<w:p[^>]*>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/\n\s*\n+/g, '\n')
          .trim();
        return text;
      }
    } else if (lowerName.endsWith('.pptx') || type?.includes('presentationml')) {
      const buffer = Buffer.from(base64Data, 'base64');
      const zip = await JSZip.loadAsync(buffer);
      const slideFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
      let pptxText = '';
      for (const sf of slideFiles) {
        const xml = await zip.file(sf)?.async('text');
        if (xml) {
          const slideNum = sf.replace(/\D/g, '');
          const sText = xml
            .replace(/<a:p[^>]*>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/\n\s*\n+/g, '\n')
            .trim();
          if (sText) {
            pptxText += `\n[Slide ${slideNum}]:\n${sText}\n`;
          }
        }
      }
      return pptxText.trim();
    } else if (lowerName.endsWith('.txt') || type === 'text/plain') {
      return Buffer.from(base64Data, 'base64').toString('utf-8');
    }
  } catch (err) {
    console.warn(`Could not extract text from file ${name}:`, err);
  }
  return '';
}

// Initialize the GoogleGenAI client only when needed. Use lazy initialization
function getGoogleGenAIClient(customKey?: string): GoogleGenAI {
  const key = customKey?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Extract detailed error information from Google GenAI SDK exceptions
function extractErrorInfo(error: any) {
  const msgParts: string[] = [];
  if (error.message) msgParts.push(String(error.message));
  if (typeof error.toString === 'function') {
    try {
      msgParts.push(error.toString());
    } catch (_) {}
  }
  
  // Serialize the whole error just in case it is a nested Google API error object
  let serialized = "";
  try {
    serialized = JSON.stringify(error);
    msgParts.push(serialized);
  } catch (_) {}

  // Parse JSON embedded in error.message if present
  let parsedJsonError: any = null;
  if (typeof error?.message === 'string' && error.message.trim().startsWith('{')) {
    try {
      parsedJsonError = JSON.parse(error.message);
    } catch (_) {}
  }

  const fullText = msgParts.join(" ").toLowerCase();

  // Try parsing status codes from various properties
  const status = 
    error.status || 
    error.statusCode || 
    error.code || 
    error.error?.code || 
    error.error?.status ||
    parsedJsonError?.error?.code ||
    parsedJsonError?.error?.status;
  
  const isQuota = 
    status === 429 || 
    status === "429" ||
    status === "RESOURCE_EXHAUSTED" ||
    fullText.includes("429") || 
    fullText.includes("quota") || 
    fullText.includes("limit") || 
    fullText.includes("resource_exhausted") ||
    fullText.includes("exceeded");

  const isOverloaded = 
    status === 503 || 
    status === "503" ||
    status === "UNAVAILABLE" ||
    fullText.includes("503") || 
    fullText.includes("unavailable") || 
    fullText.includes("demand") || 
    fullText.includes("overload");

  const isPermissionDenied = 
    status === 403 || 
    status === "403" ||
    status === "PERMISSION_DENIED" ||
    fullText.includes("403") || 
    fullText.includes("permission_denied") || 
    fullText.includes("denied");

  const isMissingKey = 
    fullText.includes("apikey") || 
    fullText.includes("api_key") || 
    fullText.includes("key is not defined") || 
    fullText.includes("invalid key");

  const isNotFound =
    status === 404 ||
    status === "404" ||
    status === "NOT_FOUND" ||
    fullText.includes("404") ||
    fullText.includes("not_found") ||
    fullText.includes("no longer available") ||
    fullText.includes("not found");

  let cleanMsg = error.message || (typeof error === 'string' ? error : 'Dịch vụ AI phản hồi lỗi hệ thống');
  if (parsedJsonError?.error?.message) {
    cleanMsg = parsedJsonError.error.message;
  }

  return {
    message: cleanMsg,
    isQuota,
    isOverloaded,
    isPermissionDenied,
    isMissingKey,
    isNotFound
  };
}

// Safely parse JSON from model responses which may include markdown code blocks or trailing thoughts
function cleanJSONString(raw: string): string {
  let result = "";
  let inString = false;
  let escape = false;
  
  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      result += char;
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  // Repair trailing commas: e.g. , } -> } and , ] -> ]
  let cleaned = result.replace(/,\s*([\]}])/g, '$1');
  
  // Repair missing commas between objects or arrays
  cleaned = cleaned.replace(/}\s*{/g, '},{');
  cleaned = cleaned.replace(/]\s*\[/g, '],[');
  
  return cleaned;
}

function tryRepairTruncatedJSON(text: string): string {
  let inString = false;
  let escape = false;
  const stack: string[] = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}') {
      if (stack[stack.length - 1] === '{') {
        stack.pop();
      }
    } else if (char === ']') {
      if (stack[stack.length - 1] === '[') {
        stack.pop();
      }
    }
  }
  
  let repaired = text;
  if (inString) {
    repaired += '"';
  }
  
  repaired = repaired.trim();
  while (repaired.endsWith(',') || repaired.endsWith(':') || repaired.match(/,\s*$/) || repaired.match(/:\s*$/)) {
    repaired = repaired.replace(/[\s,:]+$/, '');
  }
  
  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') {
      repaired += '}';
    } else if (last === '[') {
      repaired += ']';
    }
  }
  
  return repaired;
}

function safeParseJSON(text: string): any {
  const cleaned = cleanJSONString(text.trim());
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try our high-precision brace-matching JSON extractor first
    const extracted = extractFirstJSONBlock(cleaned);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch (e) {
        // Fallback to other heuristics if brace matcher didn't produce valid JSON
      }
    }

    // Try codeblock extraction
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        // Continue to brace/bracket locator
      }
    }

    // Locate the first '{' and last '}' to isolate the JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // Continue
      }
    }

    // Locate the first '[' and last ']' to isolate a JSON array
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const candidate = cleaned.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // Continue
      }
    }

    // Attempt to repair truncation if all else fails
    try {
      const repaired = tryRepairTruncatedJSON(cleaned);
      return JSON.parse(repaired);
    } catch (e) {
      // Throw original error
    }

    throw err;
  }
}

// Robustly find and isolate the first fully-balanced JSON object/array from a text response
function extractFirstJSONBlock(text: string): string | null {
  const startBrace = text.indexOf('{');
  const startBracket = text.indexOf('[');
  if (startBrace === -1 && startBracket === -1) return null;
  
  const startIdx = (startBrace !== -1 && startBracket !== -1) 
    ? Math.min(startBrace, startBracket) 
    : (startBrace !== -1 ? startBrace : startBracket);
    
  let inString = false;
  let escape = false;
  const stack: string[] = [];
  
  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (char === '{' || char === '[') {
      stack.push(char);
      continue;
    }
    if (char === '}') {
      const last = stack.pop();
      if (stack.length === 0) {
        return text.substring(startIdx, i + 1);
      }
      continue;
    }
    if (char === ']') {
      const last = stack.pop();
      if (stack.length === 0) {
        return text.substring(startIdx, i + 1);
      }
      continue;
    }
  }
  return null;
}

// Safely extract text from any Gemini response structure (single/multi-part, candidates, or direct text getter)
function extractGeminiText(response: any): string {
  if (!response) return "";
  if (typeof response.text === "string" && response.text.trim()) {
    return response.text.trim();
  }
  if (Array.isArray(response.candidates) && response.candidates.length > 0) {
    for (const cand of response.candidates) {
      if (cand?.content?.parts && Array.isArray(cand.content.parts)) {
        const textParts = cand.content.parts
          .map((p: any) => (typeof p.text === "string" ? p.text : ""))
          .filter((t: string) => t.trim().length > 0);
        if (textParts.length > 0) {
          return textParts.join("\n").trim();
        }
      }
      if (typeof cand?.text === "string" && cand.text.trim()) {
        return cand.text.trim();
      }
    }
  }
  return "";
}

// Helper to call generateContent with automatic retry and model fallback in case of high demand, timeouts, or 503/429 errors
async function generateContentWithFallback(
  client: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  }
) {
  // Ordered fallback models list to ensure maximum uptime, intelligence & reliability:
  // 1. gemini-3-flash-preview: AI Flash 3 preview model requested for lesson plan generation.
  // 2. gemini-3.8-flash: Standard reasoning model.
  // 3. gemini-3.6-flash: Flagship Flash model.
  // 4. gemini-flash-lite-latest: High throughput, rock solid availability.
  // 5. gemini-3.5-flash: Proven stable alternative Flash model.
  // 6. gemini-3.1-flash-lite-preview: Fast lightweight preview model.
  // 7. gemini-flash-latest: Stable alias.
  const modelsToTry = [
    "gemini-3-flash-preview",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-latest"
  ];

  // Sanitize incoming model: prevent deprecated models or unsupported versions (gemini-2.5 is discontinued for new users)
  let requestedModel = params.model;
  if (
    !requestedModel ||
    requestedModel.includes("gemini-2.5") ||
    requestedModel.includes("gemini-2.0") ||
    requestedModel.includes("gemini-1.5")
  ) {
    requestedModel = "gemini-3.6-flash";
  }

  // If a custom external model is specified and not in our list, try it first
  if (requestedModel && !modelsToTry.includes(requestedModel)) {
    modelsToTry.unshift(requestedModel);
  } else if (requestedModel && modelsToTry.includes(requestedModel) && modelsToTry[0] !== requestedModel) {
    const idx = modelsToTry.indexOf(requestedModel);
    modelsToTry.splice(idx, 1);
    modelsToTry.unshift(requestedModel);
  }

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] Attempting content generation with model: ${modelName} (Attempt ${attempt}/${maxAttempts})`);
        
        // Build a completely fresh parameter object to prevent mutated references or unexpected behaviors
        const cleanParams = {
          contents: params.contents,
          config: params.config ? { ...params.config } : undefined,
          model: modelName,
        };

        const response = await client.models.generateContent(cleanParams);
        
        // Validate that response actually contains non-empty text
        const text = extractGeminiText(response);
        if (!text) {
          const reason = response?.candidates?.[0]?.finishReason || "NO_TEXT_RETURNED";
          console.warn(`[Gemini Warn] Model ${modelName} returned empty text (${reason}). Retrying next model.`);
          throw new Error(`Model ${modelName} returned empty text (${reason})`);
        }
        
        // Ensure response.text has the extracted text
        if (!response.text) {
          Object.defineProperty(response, 'text', { value: text, configurable: true, writable: true });
        }
        return response;
      } catch (error: any) {
        lastError = error;
        const errInfo = extractErrorInfo(error);
        const reason = errInfo.isOverloaded 
          ? "High demand / 503" 
          : (errInfo.isQuota ? "Quota exceeded / 429" : (errInfo.isNotFound ? "Not found / 404" : "Temporary latency"));
        console.log(`[Gemini Info] Model ${modelName} (Attempt ${attempt}/${maxAttempts}) notice: ${reason}.`);
        
        // Failover instantly on discontinued/not found (404) or quota exhaustion (429) without retrying the same model
        if (errInfo.isNotFound || errInfo.isQuota) {
          console.log(`[Gemini Info] Model ${modelName} unavailable (${reason}). Swapping to next model immediately.`);
          break;
        }

        // On 503 (high demand spike), if first attempt, wait 1200ms and try attempt 2 for this model
        if (errInfo.isOverloaded) {
          if (attempt < maxAttempts) {
            console.log(`[Gemini Info] Model ${modelName} 503 demand spike. Retrying in 1200ms...`);
            await new Promise((resolve) => setTimeout(resolve, 1200));
          } else {
            console.log(`[Gemini Info] Model ${modelName} still overloaded. Swapping to next model.`);
            break;
          }
          continue;
        }

        const isTransient = 
          errInfo.message.toLowerCase().includes("rate limit") || 
          errInfo.message.toLowerCase().includes("timeout") || 
          errInfo.message.toLowerCase().includes("fetch failed");

        if (isTransient && attempt < maxAttempts) {
          const delay = attempt * 800;
          console.log(`[Gemini Info] Transient latency. Retrying ${modelName} in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    if (modelName !== modelsToTry[modelsToTry.length - 1]) {
      console.log(`[Gemini Info] Model ${modelName} was not successful. Activating alternate model: ${modelsToTry[modelsToTry.indexOf(modelName) + 1]}`);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Emergency recovery attempt on gemini-flash-lite-latest with backoff if all models encountered spikes
  if (lastError && extractErrorInfo(lastError).isOverloaded) {
    console.log(`[Gemini Info] All models encountered high demand spikes. Performing final recovery backoff with gemini-flash-lite-latest...`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const emergencyRes = await client.models.generateContent({
        contents: params.contents,
        config: params.config ? { ...params.config } : undefined,
        model: "gemini-flash-lite-latest",
      });
      const text = extractGeminiText(emergencyRes);
      if (text) {
        if (!emergencyRes.text) {
          Object.defineProperty(emergencyRes, 'text', { value: text, configurable: true, writable: true });
        }
        return emergencyRes;
      }
    } catch (emergencyErr) {
      console.error("[Gemini Info] Final emergency recovery failed:", emergencyErr);
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing support with extra 100MB limit for PowerPoint and media uploads
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // Ensure uploads directory exists for practical submissions
  const UPLOADS_PRACTICAL_DIR = path.join(process.cwd(), "uploads", "practical");
  if (!fs.existsSync(UPLOADS_PRACTICAL_DIR)) {
    fs.mkdirSync(UPLOADS_PRACTICAL_DIR, { recursive: true });
  }
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Helper to persist base64 data to disk and return static URL
  const saveBase64ToFile = (base64Str: string, originalName?: string, defaultExt: string = 'bin'): string => {
    try {
      if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:')) {
        return base64Str;
      }
      const matches = base64Str.match(/^data:([A-Za-z0-9\-+\/.]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return base64Str;
      }
      const mimeType = matches[1].toLowerCase();
      const buffer = Buffer.from(matches[2], 'base64');
      
      let ext = defaultExt;
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) ext = 'pptx';
      else if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('bmp')) ext = 'bmp';
      else if (originalName && originalName.includes('.')) {
        ext = originalName.split('.').pop() || defaultExt;
      }

      const safeBaseName = (originalName || 'file')
        .replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9.-]/g, '_')
        .substring(0, 50);
      const cleanFileName = safeBaseName.toLowerCase().endsWith(`.${ext}`) ? safeBaseName : `${safeBaseName}.${ext}`;
      const savedFileName = `${Date.now()}_${cleanFileName}`;
      const fullPath = path.join(UPLOADS_PRACTICAL_DIR, savedFileName);
      fs.writeFileSync(fullPath, buffer);
      return `/uploads/practical/${savedFileName}`;
    } catch (e) {
      console.error("Error saving base64 to file:", e);
      return base64Str;
    }
  };

  // API Routes (FIRST, before dev server middleware)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Học Tin học Tiểu học LMS Server is fully operational! 🤖" });
  });

  // File path for exams persistence
  const EXAMS_FILE = path.join(process.cwd(), "custom-exams.json");

  // Helper to read exams
  const readExamsFromFile = (): any[] => {
    try {
      if (fs.existsSync(EXAMS_FILE)) {
        const content = fs.readFileSync(EXAMS_FILE, "utf-8");
        return JSON.parse(content || "[]");
      }
    } catch (e) {
      console.error("Error reading custom-exams.json:", e);
    }
    return [];
  };

  // Helper to write exams
  const writeExamsToFile = (exams: any[]) => {
    try {
      fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing custom-exams.json:", e);
    }
  };

  // API to get all custom exams
  app.get("/api/exams", (req, res) => {
    try {
      const exams = readExamsFromFile();
      res.json(exams);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load exams" });
    }
  });

  // API to save a custom exam
  app.post("/api/exams", (req, res) => {
    try {
      const newExam = req.body;
      if (!newExam || !newExam.id) {
        return res.status(400).json({ error: "Invalid exam object" });
      }
      const exams = readExamsFromFile();
      // Remove duplicate if already exists
      const filtered = exams.filter((ex: any) => ex.id !== newExam.id);
      filtered.unshift(newExam);
      writeExamsToFile(filtered);
      res.json({ status: "ok", exam: newExam });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to save exam" });
    }
  });

  // API to update a custom exam by ID
  app.put("/api/exams/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updatedExam = req.body;
      if (!updatedExam || !id) {
        return res.status(400).json({ error: "Exam ID and exam object are required" });
      }
      const exams = readExamsFromFile();
      const updatedList = exams.map((ex: any) => ex.id === id ? { ...ex, ...updatedExam } : ex);
      writeExamsToFile(updatedList);
      res.json({ status: "ok", exam: updatedExam });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update exam" });
    }
  });

  // API to delete a custom exam
  app.delete("/api/exams/:id", (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Exam ID is required" });
      }
      const exams = readExamsFromFile();
      const filtered = exams.filter((ex: any) => ex.id !== id);
      writeExamsToFile(filtered);
      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete exam" });
    }
  });

  // API to explicitly upload a practical file (PowerPoint / Image)
  app.post("/api/upload-practical", (req, res) => {
    try {
      const { base64, fileName, fileType } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "Dữ liệu base64 không tồn tại" });
      }
      const savedUrl = saveBase64ToFile(base64, fileName, fileType === 'pptx' ? 'pptx' : 'png');
      res.json({
        status: "ok",
        url: savedUrl,
        fileName: fileName || 'BaiThucHanh.pptx'
      });
    } catch (e: any) {
      console.error("Lỗi tải tệp thực hành lên máy chủ:", e);
      res.status(500).json({ error: e.message || "Tải tệp thực hành thất bại" });
    }
  });

  // API to submit answers / add a submission to an exam
  app.post("/api/exams/submit", (req, res) => {
    try {
      const { examId, submission } = req.body;
      if (!examId || !submission) {
        return res.status(400).json({ error: "Exam ID and submission are required" });
      }

      // Automatically convert any large base64 practical files into disk URLs to keep exams file light & safe
      if (submission.answers) {
        if (submission.answers.practical_file && typeof submission.answers.practical_file === 'string' && submission.answers.practical_file.startsWith('data:')) {
          submission.answers.practical_file = saveBase64ToFile(
            submission.answers.practical_file,
            submission.answers.practical_file_name || 'BaiThucHanh.pptx',
            'pptx'
          );
        }
        if (submission.answers.practical_image && typeof submission.answers.practical_image === 'string' && submission.answers.practical_image.startsWith('data:')) {
          submission.answers.practical_image = saveBase64ToFile(
            submission.answers.practical_image,
            'MinhChungThucHanh.png',
            'png'
          );
        }
      }

      const exams = readExamsFromFile();
      const updated = exams.map((ex: any) => {
        if (ex.id === examId) {
          const subs = ex.submissions || [];
          return {
            ...ex,
            submissions: [submission, ...subs]
          };
        }
        return ex;
      });
      writeExamsToFile(updated);
      res.json({ 
        status: "ok", 
        practicalFileUrl: submission.answers?.practical_file,
        practicalImageUrl: submission.answers?.practical_image
      });
    } catch (e: any) {
      console.error("Error submitting exam:", e);
      res.status(500).json({ error: e.message || "Failed to submit exam" });
    }
  });

  // API to clear all submissions of an exam
  app.post("/api/exams/:id/clear-submissions", (req, res) => {
    try {
      const { id } = req.params;
      const exams = readExamsFromFile();
      const updated = exams.map((ex: any) => {
        if (String(ex.id) === String(id)) {
          return {
            ...ex,
            submissions: []
          };
        }
        return ex;
      });
      writeExamsToFile(updated);
      res.json({ status: "ok", message: "All submissions cleared successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to clear submissions" });
    }
  });

  // API to delete a single submission
  app.post("/api/exams/:id/delete-submission", (req, res) => {
    try {
      const { id } = req.params;
      const { submissionId } = req.body;
      const exams = readExamsFromFile();
      const updated = exams.map((ex: any) => {
        if (String(ex.id) === String(id)) {
          return {
            ...ex,
            submissions: (ex.submissions || []).filter((s: any) => String(s.id) !== String(submissionId))
          };
        }
        return ex;
      });
      writeExamsToFile(updated);
      res.json({ status: "ok", message: "Submission deleted successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete submission" });
    }
  });

  // API to restore submissions (Undo action)
  app.post("/api/exams/:id/restore-submissions", (req, res) => {
    try {
      const { id } = req.params;
      const { submissions } = req.body;
      const exams = readExamsFromFile();
      const updated = exams.map((ex: any) => {
        if (String(ex.id) === String(id)) {
          return {
            ...ex,
            submissions: Array.isArray(submissions) ? submissions : []
          };
        }
        return ex;
      });
      writeExamsToFile(updated);
      res.json({ status: "ok", message: "Submissions restored successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to restore submissions" });
    }
  });

function getFallbackTaphuanObjectives(title: string, grade: string = "Lớp 3", subject: string = "Tin học"): string {
  const t = (title || "").toLowerCase();
  let bullets: string[] = [];

  if (t.includes("thư mục") || t.includes("tệp") || t.includes("file") || t.includes("folder")) {
    bullets = [
      "- Nhận biết và phân biệt được tệp và thư mục trên máy tính.",
      "- Thực hiện được các thao tác cơ bản: tạo, đổi tên, sao chép, di chuyển và xóa tệp, thư mục.",
      "- Hình thành thói quen sắp xếp tệp và thư mục trong máy tính một cách khoa học, ngăn nắp."
    ];
  } else if (t.includes("thông tin") || t.includes("quyết định") || t.includes("dữ liệu")) {
    bullets = [
      "- Nhận biết được thông tin thu nhận qua các giác quan và dạng thông tin thường gặp (chữ, hình ảnh, âm thanh).",
      "- Nêu được ví dụ về thông tin giúp con người đưa ra quyết định đúng đắn.",
      "- Biết trân trọng và chia sẻ thông tin hữu ích, chính xác với bạn bè và gia đình."
    ];
  } else if (t.includes("máy tính") || t.includes("chuột") || t.includes("bàn phím") || t.includes("phần cứng") || t.includes("phần mềm")) {
    bullets = [
      "- Nhận biết được các bộ phận cơ bản của máy tính (thân máy, màn hình, bàn phím, chuột) và vai trò của chúng.",
      "- Thực hiện đúng tư thế ngồi, các thao tác cầm chuột và gõ phím cơ bản đúng kỹ thuật.",
      "- Có ý thức giữ gìn, bảo vệ thiết bị máy tính và tuân thủ nội quy phòng thực hành."
    ];
  } else if (t.includes("internet") || t.includes("mạng") || t.includes("trang web") || t.includes("tìm kiếm") || t.includes("an toàn")) {
    bullets = [
      "- Nhận biết được Internet là mạng toàn cầu kết nối các máy tính và kho thông tin khổng lồ.",
      "- Thực hiện được việc tìm kiếm thông tin đơn giản bằng từ khóa trên trình duyệt web.",
      "- Nêu được một số quy tắc cơ bản bảo vệ thông tin cá nhân và sử dụng Internet an toàn, lành mạnh."
    ];
  } else if (t.includes("soạn thảo") || t.includes("văn bản") || t.includes("word") || t.includes("gõ tiếng việt")) {
    bullets = [
      "- Khởi động được phần mềm soạn thảo văn bản, gõ được chữ tiếng Việt có dấu đúng quy tắc (Telex hoặc Vni).",
      "- Thực hiện được các thao tác định dạng ký tự cơ bản (phông chữ, cỡ chữ, kiểu chữ, màu chữ) và căn lề đoạn văn bản.",
      "- Biết chèn hình ảnh minh họa phù hợp và lưu tệp văn bản vào đúng thư mục học tập."
    ];
  } else if (t.includes("trình chiếu") || t.includes("powerpoint") || t.includes("trang chiếu") || t.includes("bài giảng")) {
    bullets = [
      "- Tạo được bài trình chiếu đơn giản gồm trang tiêu đề và các trang nội dung.",
      "- Chèn được văn bản, hình ảnh minh họa và áp dụng hiệu ứng chuyển trang sinh động, hợp lý.",
      "- Tự tin thuyết trình ngắn gọn trước lớp về chủ đề bài trình chiếu của nhóm mình."
    ];
  } else if (t.includes("bảng tính") || t.includes("excel") || t.includes("dữ liệu") || t.includes("hàm")) {
    bullets = [
      "- Nhận biết được các thành phần chính của cửa sổ bảng tính: bảng tính, trang tính, hàng, cột, ô tính.",
      "- Nhập và định dạng được dữ liệu số, dữ liệu văn bản vào các ô tính theo yêu cầu.",
      "- Sử dụng được các phép tính số học cơ bản (+, -, *, /) hoặc hàm tính tổng (SUM), trung bình (AVERAGE) đơn giản."
    ];
  } else if (t.includes("scratch") || t.includes("lập trình") || t.includes("thuật toán") || t.includes("nhân vật") || t.includes("lệnh")) {
    bullets = [
      "- Mô tả được các bước thực hiện của một thuật toán hoặc công việc thường ngày theo trình tự logic.",
      "- Làm quen với môi trường lập trình trực quan, chọn được sân khấu, thêm và đổi trang phục cho nhân vật.",
      "- Lắp ráp được các khối lệnh chuyển động, âm thanh và điều khiển để tạo chương trình hoạt hình hoặc trò chơi đơn giản."
    ];
  } else if (t.includes("sơ đồ tư duy") || t.includes("bản đồ tư duy") || t.includes("mindmap")) {
    bullets = [
      "- Nhận biết được sơ đồ tư duy là công cụ trực quan giúp ghi nhớ và tổ chức thông tin mạch lạc.",
      "- Tạo được sơ đồ tư duy đơn giản với chủ đề chính và các nhánh con triển khai ý tưởng.",
      "- Vận dụng sơ đồ tư duy vào việc ôn tập và tóm tắt bài học trong các môn học khác."
    ];
  } else {
    bullets = [
      `- Nêu được các khái niệm và kiến thức trọng tâm cốt lõi của bài học "${title.trim()}".`,
      `- Thực hiện được các thao tác kỹ năng cơ bản theo hướng dẫn của SGK Kết nối tri thức với cuộc sống.`,
      `- Vận dụng được kiến thức đã học vào thực tế học tập và đời sống hằng ngày.`
    ];
  }

  return `Sau bài học này em sẽ:\n${bullets.join('\n')}`;
}

  // AI Tra cứu chuẩn taphuan.nxbgd.vn cho mục "Sau bài học này em sẽ"
  app.post("/api/lookup-lesson-objectives", async (req, res) => {
    const { title, grade, subject } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tên bài học là bắt buộc." });
    }

    try {
      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      const prompt = `Bạn là chuyên gia thẩm định chương trình GDPT 2018 và tài liệu tập huấn SGK Nhà xuất bản Giáo dục Việt Nam (taphuan.nxbgd.vn) cho bộ sách "Kết nối tri thức với cuộc sống".
Nhiệm vụ: Dựa vào Tên bài học: "${title.trim()}", Môn học: "${subject || 'Tin học'}", Khối lớp: "${grade || 'Lớp 3'}", hãy tra cứu chính xác mục "Sau bài học này em sẽ" (hoặc Yêu cầu cần đạt cốt lõi mở đầu bài học) theo chuẩn SGK Kết nối tri thức trên trang taphuan.nxbgd.vn.
Quy định định dạng trả về DUY NHẤT:
Bắt đầu bằng dòng:
Sau bài học này em sẽ:
- [Yêu cầu cần đạt 1 cụ thể, súc tích chuẩn SGK Kết nối tri thức]
- [Yêu cầu cần đạt 2 cụ thể, súc tích chuẩn SGK Kết nối tri thức]
- [Yêu cầu cần đạt 3 cụ thể, súc tích chuẩn SGK Kết nối tri thức]

TUYỆT ĐỐI KHÔNG thêm lời chào, không giải thích lý do, không thêm định dạng Markdown thừa thãi khác. Chỉ trả về đúng văn bản mục "Sau bài học này em sẽ:".`;

      const aiPromise = generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI lookup timed out")), 35000)
      );

      const response = (await Promise.race([aiPromise, timeoutPromise])) as any;

      const objectives = response.text?.trim() || "";
      if (objectives && objectives.includes("Sau bài học này em sẽ")) {
        return res.json({ success: true, objectives, title, source: 'ai' });
      }
      // Fallback if AI response was empty or malformed
      const fallback = getFallbackTaphuanObjectives(title, grade, subject);
      return res.json({ success: true, objectives: fallback, title, source: 'curriculum_fallback' });
    } catch (e: any) {
      const errInfo = extractErrorInfo(e);
      console.info("Lookup lesson objectives notice (using curriculum fallback):", errInfo.message);
      const fallback = getFallbackTaphuanObjectives(title, grade, subject);
      return res.json({ success: true, objectives: fallback, title, source: 'curriculum_fallback' });
    }
  });

  // AI-Assisted Lesson Plan Generator
  app.post("/api/generate-lesson-plan", async (req, res) => {
    try {
      const {
        stage,
        grade,
        subject,
        duration,
        studentCount,
        title: rawTitle,
        curriculumBook = 'Kết nối tri thức với cuộc sống',
        chapter = '',
        topic = '',
        aiAutoCompetency,
        competencies,
        customCompetency,
        specificCompetencies,
        customSpecificCompetency,
        generalCompetencies,
        customGeneralCompetency,
        qualities,
        customQualities,
        aiPowerup,
        aiAutoTools,
        tools,
        customTools,
        aiAutoTech,
        techInputs,
        aiAutoGames,
        gameInputs,
        aiAutoMethods,
        methods,
        customMethods,
        lessonContent,
        images,
        layoutOptions
      } = req.body;

      if (!rawTitle) {
        return res.status(400).json({ error: "Lesson title is required." });
      }

      // Normalize space between lesson title and period (e.g. "QUYẾT ĐỊNH(TIẾT 1)" -> "QUYẾT ĐỊNH (TIẾT 1)")
      let title = (rawTitle || "").toString().trim();
      title = title.replace(/([^\s\n>])\s*\((TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*(\d*)\)/gi, (_m, p1, p2, p3) => {
        return p3 ? `${p1} (${p2} ${p3})` : `${p1} (${p2})`;
      });
      title = title.replace(/\((TIẾT|Tiết|tiết)(\d+)\)/gi, "($1 $2)");
      title = title.replace(/\((\d+)(TIẾT|Tiết|tiết)\)/gi, "($1 $2)");
      title = title.replace(/([^\s\n>])\s{2,}\((TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)/gi, "$1 ($2");

      // Extract base title without trailing period suffix for template generation
      const baseTitleWithoutPeriod = title
        .replace(/\s*\((?:TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*\d*\)\s*$/gi, '')
        .replace(/\s*\([^\)]*(?:tiết|tiet)[^\)]*\)\s*$/i, '')
        .trim();
      const displayBaseTitleUpper = (baseTitleWithoutPeriod.toLowerCase().startsWith('bài') ? baseTitleWithoutPeriod : `BÀI 1: ${baseTitleWithoutPeriod}`).toUpperCase();

      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      // Process attachments: extract text from docx/pptx/txt, prepare inlineData for images/pdf
      const imageInlineDataParts: any[] = [];
      const extractedTextSections: string[] = [];

      if (images && Array.isArray(images) && images.length > 0) {
        for (const file of images) {
          const lowerName = (file.name || '').toLowerCase();
          const fileType = (file.type || '').toLowerCase();
          const isDocx = lowerName.endsWith('.docx') || fileType.includes('wordprocessingml') || fileType.includes('msword');
          const isPptx = lowerName.endsWith('.pptx') || fileType.includes('presentationml');
          const isTxt = lowerName.endsWith('.txt') || fileType === 'text/plain';

          if (isDocx || isPptx || isTxt) {
            const extracted = await extractTextFromAttachment(file.name, file.type, file.data);
            if (extracted) {
              extractedTextSections.push(`--- NỘI DUNG TÀI LIỆU ĐÍNH KÈM [${file.name}]: ---\n${extracted}`);
            }
          } else {
            // Assume image or pdf
            const rawData = file.data || '';
            const cleanBase64 = rawData.includes(';base64,') ? rawData.split(';base64,')[1] : rawData;
            let mime = file.type || 'image/png';
            if (lowerName.endsWith('.pdf')) mime = 'application/pdf';
            else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mime = 'image/jpeg';
            else if (lowerName.endsWith('.png')) mime = 'image/png';
            else if (lowerName.endsWith('.webp')) mime = 'image/webp';

            if (cleanBase64 && cleanBase64.trim().length > 0) {
              imageInlineDataParts.push({
                inlineData: {
                  data: cleanBase64.trim(),
                  mimeType: mime
                }
              });
            }
          }
        }
      }

      const hasAttachments = imageInlineDataParts.length > 0 || extractedTextSections.length > 0;

      // 1. Năng lực đặc thù (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản")
      const mergedSpecificComp = [...(specificCompetencies || [])];
      if (customSpecificCompetency) {
        mergedSpecificComp.push(customSpecificCompetency.trim());
      }
      let specificCompetencyStatement = "";
      if (aiAutoCompetency) {
        specificCompetencyStatement = `BẬT tùy chọn "AI tự đề xuất": Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để tự động đưa ra các yêu cầu cần đạt về năng lực đặc thù của môn ${subject} - Lớp ${grade} phù hợp nhất với giáo án của bài học. TUYỆT ĐỐI KHÔNG ép buộc chỉ lấy các tùy chọn đã chọn trước đó. Nêu rõ từng chỉ báo hành vi đạt được của học sinh, gạch đầu dòng rõ ràng từng ý.`;
      } else {
        const specList = mergedSpecificComp.length > 0 ? mergedSpecificComp.join(', ') : "Năng lực số, Sử dụng và quản lý phương tiện CNTT, Nhận biết các dạng thông tin";
        specificCompetencyStatement = `AI BIÊN SOẠN THEO CÁC MỤC ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN": ${specList}. Bám sát nội dung bài học, nêu rõ từng chỉ báo hành vi đạt được của học sinh (gạch đầu dòng rõ ràng từng ý).`;
      }

      // 2. Năng lực chung (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản")
      const cleanedCompetencies = (competencies || []).filter((c: string) => !c.toLowerCase().includes('trí tuệ nhân tạo') && !c.toLowerCase().includes('3439'));
      const mergedGeneralComp = generalCompetencies && generalCompetencies.length > 0 ? [...generalCompetencies] : [...cleanedCompetencies];
      if (customGeneralCompetency) {
        mergedGeneralComp.push(customGeneralCompetency.trim());
      } else if (customCompetency && !customCompetency.toLowerCase().includes('3439')) {
        mergedGeneralComp.push(customCompetency.trim());
      }
      let generalCompetencyStatement = "";
      if (aiAutoCompetency) {
        generalCompetencyStatement = `BẬT tùy chọn "AI tự đề xuất": Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để tự động đưa ra các năng lực chung phù hợp nhất với hoạt động dạy học của bài học (Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo). TUYỆT ĐỐI KHÔNG ép buộc chỉ lấy các tùy chọn đã chọn trước đó.`;
      } else {
        const genList = mergedGeneralComp.length > 0 ? mergedGeneralComp.join(', ') : "Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo";
        generalCompetencyStatement = `AI BIÊN SOẠN THEO CÁC MỤC ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN": ${genList}. Nêu rõ biểu hiện cụ thể của học sinh gắn liền với các hoạt động học tập trong bài học này ứng với từng năng lực chung được chọn.`;
      }

      // 3. Phẩm chất (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản")
      const mergedQualities = [...(qualities || [])];
      if (customQualities) {
        mergedQualities.push(customQualities.trim());
      }
      let qualitiesStatement = "";
      if (aiAutoCompetency) {
        qualitiesStatement = `BẬT tùy chọn "AI tự đề xuất": Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để tự động đưa ra các phẩm chất phù hợp nhất được thể hiện trong bài học. TUYỆT ĐỐI KHÔNG ép buộc chỉ lấy các tùy chọn đã chọn trước đó.`;
      } else {
        const qList = mergedQualities.length > 0 ? mergedQualities.join(', ') : "Chăm chỉ, Trách nhiệm, Trung thực";
        qualitiesStatement = `AI BIÊN SOẠN THEO CÁC MỤC ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN": ${qList}. Mô tả biểu hiện cụ thể của học sinh gắn liền với các hoạt động học tập, làm việc nhóm và bảo quản thiết bị trong bài học này đối với từng phẩm chất được chọn (viết hoa chữ cái đầu sau dấu hai chấm).`;
      }

      const competencyStatement = `Năng lực đặc thù: ${specificCompetencyStatement} | Năng lực chung: ${generalCompetencyStatement} | Phẩm chất: ${qualitiesStatement}`;

      // Năng lực Trí tuệ nhân tạo (AI): tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản")
      let aiCompetencyStatement = "";
      if (aiPowerup) {
        aiCompetencyStatement = `BẮT BUỘC có thêm mục: "- **Năng lực AI (theo QĐ 3439):** tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số (theo QĐ 3439) (AI biên soạn theo các mục đã chọn tại thẻ 'giáo án cơ bản')". Mô tả học sinh bước đầu làm quen, nhận biết vai trò của AI và công nghệ số thông minh trong việc thu nhận, xử lý thông tin an toàn, có trách nhiệm.`;
      } else {
        aiCompetencyStatement = `[LƯU Ý CỰC KỲ QUAN TRỌNG]: Tùy chọn Năng lực AI đang TẮT. TUYỆT ĐỐI KHÔNG ĐƯỢC XUẤT HIỆN 'Năng lực AI (theo QĐ 3439)' hay bất kỳ nội dung nào nhắc đến AI/Trí tuệ nhân tạo trong Yêu cầu cần đạt hay trong bất kỳ hoạt động nào của giáo án!`;
      }

      // II. ĐỒ DÙNG DẠY HỌC (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản")
      const mergedTools = [...(tools || [])];
      if (customTools) {
        mergedTools.push(customTools.trim());
      }
      let toolsStatement = "";
      if (aiAutoTools) {
        toolsStatement = `BẬT tùy chọn "AI tự đề xuất": Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các Đồ dùng dạy học (chỉ thay đổi với mục giáo viên) phù hợp nhất với giáo án của bài học. TUYỆT ĐỐI KHÔNG ép buộc chỉ lấy các tùy chọn đã chọn thủ công trước đó. TUYỆT ĐỐI KHÔNG thêm hoặc tích hợp ứng dụng công nghệ số hay trò chơi học tập vào mục "II. ĐỒ DÙNG DẠY HỌC". Mục học sinh luôn giữ chuẩn cố định: "- Học sinh: SGK ${subject} ${grade}, VBT ${subject} ${grade}, vở ghi, dụng cụ học tập."`;
      } else {
        const toolsList = mergedTools.length > 0 ? mergedTools.join(', ') : "Máy chiếu, Phiếu học tập, Sách giáo khoa";
        toolsStatement = `AI BIÊN SOẠN THEO CÁC MỤC ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN": Phân định rõ "- Giáo viên:" và "- Học sinh:" theo đúng danh sách đồ dùng đã chọn: "${toolsList}". TUYỆT ĐỐI KHÔNG thêm hoặc tích hợp ứng dụng công nghệ số hay trò chơi học tập vào mục "II. ĐỒ DÙNG DẠY HỌC".`;
      }

      // Ứng dụng công nghệ số phù hợp với bài học trong giáo án
      const cleanedTech = (techInputs?.trim() && !techInputs.startsWith('VD:')) ? techInputs.trim() : "";
      let techStatement = "";
      if (aiAutoTech) {
        techStatement = `BẬT tùy chọn "AI tự đề xuất": Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các ứng dụng công nghệ số phù hợp (như **"Kahoot"**, **"Quizizz"**, **"Padlet"**, **"Canva"**, **"Wordwall"**, **"GeoGebra"** và các ứng dụng khác phù hợp bài học) để tích hợp vào các hoạt động của giáo án. BẮT BUỘC: KHÔNG thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC". Tên ứng dụng trong bảng "KẾT QUẢ KẾ HOẠCH BÀI DẠY" BẮT BUỘC có định dạng chữ đậm và được để trong " " (ví dụ: **"Wordwall"**, **"Kahoot"**, **"Quizizz"**, **"Padlet"**, **"Canva"**, **"GeoGebra"**).`;
      } else if (cleanedTech) {
        techStatement = `Người dùng nhập "Tên ứng dụng hoặc trang web ứng dụng" ("${cleanedTech}"): Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để tích hợp ứng dụng "${cleanedTech}" vào trong hoạt động của giáo án. BẮT BUỘC: KHÔNG thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC". Tên ứng dụng trong bảng "KẾT QUẢ KẾ HOẠCH BÀI DẠY" BẮT BUỘC có định dạng chữ đậm và được để trong " " (ví dụ: **"${cleanedTech.replace(/^['"“”]+|['"“”]+$/g, '')}"**).`;
      } else {
        techStatement = `Tùy chọn Ứng dụng công nghệ số đang TẮT và không có dữ liệu nhập. Không đưa các ứng dụng công nghệ số trực tuyến vào giáo án.`;
      }

      // Kết hợp trò chơi học tập phù hợp với bài học trong giáo án
      const cleanedGame = (gameInputs?.trim() && !gameInputs.startsWith('Mô tả')) ? gameInputs.trim() : "";
      let gamesStatement = "";
      if (aiAutoGames) {
        gamesStatement = `BẬT tùy chọn "AI tự đề xuất": Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các trò chơi học tập phù hợp (như **"Ai nhanh hơn"**, **"Rung chuông vàng"**, **"Hộp quà bí mật"**, **"Mảnh ghép kì diệu"** và các trò chơi khác phù hợp bài học) để tích hợp vào các hoạt động của giáo án (như Khởi động, Luyện tập hoặc Vận dụng). BẮT BUỘC: KHÔNG thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC". Tên trò chơi trong bảng "KẾT QUẢ KẾ HOẠCH BÀI DẠY" BẮT BUỘC có định dạng chữ đậm và được để trong " " (ví dụ: **"Ai nhanh hơn"**, **"Rung chuông vàng"**, **"Hộp quà bí mật"**, **"Mảnh ghép kì diệu"**).`;
      } else if (cleanedGame) {
        gamesStatement = `Người dùng nhập "Tên trò chơi hoặc Mô tả trò chơi" ("${cleanedGame}"): Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để tích hợp trò chơi "${cleanedGame}" vào trong hoạt động của giáo án. BẮT BUỘC: KHÔNG thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC". Tên trò chơi trong bảng "KẾT QUẢ KẾ HOẠCH BÀI DẠY" BẮT BUỘC có định dạng chữ đậm và được để trong " " (ví dụ: **"${cleanedGame.replace(/^['"“”]+|['"“”]+$/g, '')}"**).`;
      } else {
        gamesStatement = `Tùy chọn Trò chơi học tập đang TẮT. Không biến hoạt động thành trò chơi nếu không cần thiết, tập trung vào quan sát và bài tập trong SGK.`;
      }

      // Phương pháp sư phạm phù hợp với bài học trong giáo án
      const mergedMethods = [...(methods || [])];
      if (customMethods) {
        mergedMethods.push(customMethods.trim());
      }
      let methodsStatement = "";
      if (aiAutoMethods) {
        methodsStatement = `BẬT tùy chọn "AI tự đề xuất": Sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các phương pháp sư phạm phù hợp nhất với giáo án của bài học đó (như **phương pháp vấn đáp**, **phương pháp trực quan**, **phương pháp thảo luận nhóm**, **phương pháp giải quyết vấn đề**, **phương pháp thực hành**...). Thể hiện rõ các phương pháp này trong tiến trình các hoạt động của GV và HS. Tên phương pháp sư phạm BẮT BUỘC định dạng chữ đậm.`;
      } else {
        const methodsList = mergedMethods.length > 0 ? mergedMethods.join(', ') : "Vấn đáp, Trực quan, Giải quyết vấn đề, Thực hành, Trò chơi";
        methodsStatement = `Khi chọn các tùy chọn (${methodsList}): Sử dụng công cụ AI Flash 3 preview tích hợp các phương pháp sư phạm đó vào các "Hoạt động dạy học" trong giáo án phù hợp nhất (ghi rõ bước sử dụng và hành động của GV/HS thể hiện rõ các phương pháp này). Tên phương pháp sư phạm BẮT BUỘC định dạng chữ đậm.`;
      }

      // Determine periods strictly based on duration for basic plans or if periods array is not provided
      const parsedDurationNum = parseInt(String(duration || '1').replace(/\D/g, '')) || 1;
      let periods = layoutOptions?.periods;
      const isLesson1Info = title.toLowerCase().includes("thông tin") || title.toLowerCase().includes("quuyết định") || title.toLowerCase().includes("thong tin");
      if (layoutOptions?.isBasic || !periods || !Array.isArray(periods) || periods.length === 0) {
        periods = [];
        for (let p = 1; p <= parsedDurationNum; p++) {
          const isPeriod2OrMore = p >= 2;
          const warmupName = isPeriod2OrMore
            ? (aiAutoGames || cleanedGame
                ? `Khởi động - Trò chơi Ôn tập kiến thức Tiết ${p - 1} (5 phút)`
                : `Khởi động - Ôn tập kiến thức Tiết ${p - 1} và kết nối bài mới (5 phút)`)
            : (aiAutoGames || cleanedGame
                ? `Khởi động - Trò chơi Khởi động dựa vào tài liệu đính kèm (5 phút)`
                : `Khởi động - Quan sát tranh/tình huống khởi động trong tài liệu đính kèm (5 phút)`);
          
          let exploreName = `Khám phá - Nội dung cốt lõi từ tài liệu đính kèm (18 phút)`;
          let practiceName = `Luyện tập - Bài tập thực hành từ tài liệu đính kèm (7 phút)`;
          let applyName = `Vận dụng - Tình huống vận dụng từ tài liệu đính kèm (5 phút)`;
          let periodTitle = `TIẾT ${p}`;

          if (isLesson1Info) {
            if (p === 1) {
              periodTitle = `TIẾT 1: THÔNG TIN VÀ QUYẾT ĐỊNH`;
              exploreName = `Khám phá - Tìm hiểu thông tin và quyết định (18 phút)`;
              practiceName = `Luyện tập - Bài tập về thông tin và quyết định (7 phút)`;
              applyName = `Vận dụng - Tình huống thông tin và quyết định (5 phút)`;
            } else if (p === 2) {
              periodTitle = `TIẾT 2: BA DẠNG THÔNG TIN THƯỜNG GẶP`;
              exploreName = `Khám phá - Ba dạng thông tin thường gặp (18 phút)`;
              practiceName = `Luyện tập - Nhận biết các dạng thông tin (7 phút)`;
              applyName = `Vận dụng - Tìm thông tin xung quanh em (5 phút)`;
            } else if (p === 3) {
              periodTitle = `TIẾT 3: THỰC HÀNH VÀ TRẢI NGHIỆM VỀ THÔNG TIN`;
              exploreName = `Khám phá - Thực hành thu nhận và xử lý thông tin (18 phút)`;
              practiceName = `Luyện tập - Xử lý thông tin và giải quyết vấn đề (7 phút)`;
              applyName = `Vận dụng - Thông tin và quyết định trong đời sống (5 phút)`;
            } else if (p === 4) {
              periodTitle = `TIẾT 4: ÔN TẬP VÀ VẬN DỤNG SÁNG TẠO`;
              exploreName = `Khám phá - Mở rộng kiến thức và kỹ năng số (18 phút)`;
              practiceName = `Luyện tập - Bài tập tổng hợp (7 phút)`;
              applyName = `Vận dụng - Dự án nhỏ thực hành số (5 phút)`;
            }
          }

          periods.push({
            id: `period_${p}`,
            name: periodTitle,
            activities: [
              { id: `act_${p}_1`, name: warmupName },
              { id: `act_${p}_2`, name: exploreName },
              { id: `act_${p}_3`, name: practiceName },
              { id: `act_${p}_4`, name: applyName }
            ]
          });
        }
      }

      let periodPlanInstructions = "";
      let activitiesPrompt = "";

      if (periods && Array.isArray(periods) && periods.length > 0) {
        // Build periodPlanInstructions dynamically based on layoutOptions.periods
        periodPlanInstructions = `\n[YÊU CẦU THỜI LƯỢNG & ĐỒNG BỘ TIẾT DẠY CỰC KỲ NGHIÊM NGẶT]: Bài học này gồm đúng ${periods.length} tiết dạy theo trường dữ liệu "Số tiết dạy" (${duration}). Bạn phải phân chia rõ rệt các tiết dạy:\n`;
        for (const period of periods) {
          const actListStr = period.activities.map((act, index) => `Hoạt động ${index + 1}: ${act.name}`).join(", ");
          periodPlanInstructions += `- **${period.name}**: Gồm 4 hoạt động học tập liên tục: ${actListStr}. Ghi rõ tiêu đề định dạng '#### ${period.name}: <Tên chủ đề/Nội dung chính>' trước khi đi vào danh sách hoạt động học tập của tiết học đó.\n`;
        }
        periodPlanInstructions += `Hãy thiết kế kịch bản hoạt động học tập liên tục, bám sát đúng thứ tự các hoạt động mà Thầy Cô cấu hình, bám sâu tài liệu đính kèm.\n`;

        // Build activitiesPrompt dynamically from the configured periods and activities
        let promptParts: string[] = [];
        
        if (layoutOptions?.isBasic) {
          promptParts.push(`      BẮT BUỘC: Soạn Giáo án theo chuẩn Công văn 2345 dưới dạng **GIÁO ÁN CƠ BẢN** (ĐẶC BIỆT: Bám sát 100% file tài liệu đính kèm minh họa, Tiết 2 có bố cục và cấu trúc giống Tiết 1 100%, đối xứng hoàn hảo theo hàng ngang giữa Hoạt động của Giáo viên và Hoạt động của Học sinh).
      
      QUY TẮC BẮT BUỘC 1: BÁM SÁT TUYỆT ĐỐI NỘI DUNG TÀI LIỆU ĐÍNH KÈM MINH HỌA (ẢNH SGK, PPT, WORD MẪU):
      - Toàn bộ nội dung giáo án ở CẢ HAI TIẾT (tên bài, tên các đề mục 1, 2, a, b, các câu hỏi gợi mở, bài tập thực hành trên máy tính, bài tập vận dụng, hình vẽ minh họa, nhân vật Rô-bốt, Minh, An, Khoa...) PHẢI BÁM SÁT TUYỆT ĐỐI 100% nội dung của tệp tài liệu đính kèm do Thầy Cô tải lên.
      - VÍ DỤ CỤ THỂ ĐỐI VỚI BÀI 1 "THÔNG TIN VÀ QUYẾT ĐỊNH":
        + Tiết 1: Chủ đề "Thông tin và quyết định".
        + Tiết 2: BẮT BUỘC tiêu đề và nội dung là "Ba dạng thông tin thường gặp" (gồm thông tin dạng chữ, dạng hình ảnh, dạng âm thanh). Tuyệt đối không được bỏ sót phần "Ba dạng thông tin thường gặp" này!
      - Tuyệt đối không tự bịa đặt hay lấy kiến thức từ bài học khác ngoài tài liệu đính kèm.

      QUY TẮC BẮT BUỘC 2: BIÊN SOẠN ĐẦY ĐỦ CẤU TRÚC ĐẦU TIẾT 2 GIỐNG HỆT TIẾT 1 NẰM TRÊN BẢNG "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:":
      - BẮT BUỘC ĐƯA TOÀN BỘ NỘI DUNG TIẾT 2 SANG TRANG MỚI (chèn dòng phân tách '---' hoặc '[SANG TRANG MỚI]').
      - Đầu Tiết 2 PHẢI CÓ ĐẦY ĐỦ CẤU TRÚC GIỐNG HỆT TIẾT 1 nằm ngay trên bảng "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:" như sau:
        + Khối thông tin đầu bài học:
          KẾ HOẠCH BÀI DẠY
          ${subject.toUpperCase()} - LỚP ${(grade.replace(/lớp\s*/i, '') || '3').toUpperCase()}
          ${chapter ? chapter.toUpperCase() : 'CHỦ ĐỀ 1. MÁY TÍNH VÀ EM'}
          ${displayBaseTitleUpper} (TIẾT 2)
        + Mục I. YÊU CẦU CẦN ĐẠT (dành riêng cho Tiết 2):
          1. Năng lực đặc thù: (AI biên soạn chi tiết các yêu cầu cần đạt trọng tâm của Tiết 2 theo nội dung tài liệu đính kèm và các năng lực đã chọn).
          2. Năng lực chung: (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản": Năng lực tự chủ và tự học, Năng lực giao tiếp và hợp tác, Năng lực giải quyết vấn đề và sáng tạo; nếu có chọn Năng lực AI theo QĐ 3439 thì thêm vào đây).
          3. Phẩm chất: (Chăm chỉ, Trách nhiệm, Trung thực).
        + Mục II. ĐỒ DÙNG DẠY HỌC (dành riêng cho Tiết 2):
          - Giáo viên: Đầy đủ Đồ dùng của Giáo viên cho Tiết 2 (máy tính, máy chiếu, bài giảng điện tử, tranh ảnh, video minh họa).
          - Học sinh: Đầy đủ Đồ dùng của Học sinh cho Tiết 2 (Sách giáo khoa, vở ghi, đồ dùng học tập).
        + Mục III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:
          Tiêu đề Mục III và tiêu đề phân tiết: '#### TIẾT 2: [Tên bài/Chủ đề của Tiết 2]' (Ví dụ: '#### TIẾT 2: BA DẠNG THÔNG TIN THƯỜNG GẶP').
      - Tiết 2 có đầy đủ tuần tự 4 hoạt động độc lập tương tự Tiết 1:
        1. Hoạt động 1: Khởi động - * (5 phút)
        2. Hoạt động 2: Khám phá - * (18 phút)
        3. Hoạt động 3: Luyện tập - * (7 phút)
        4. Hoạt động 4: Vận dụng - * (5 phút)
      - Trong mỗi hoạt động của Tiết 2 đều phải có đầy đủ 2 thành phần bắt buộc:
        * - **Mục tiêu:** [Nêu rõ mục tiêu cần đạt cụ thể của hoạt động đó]
        * - **Cách tiến hành:** (kèm các cặp đối thoại song hành chuẩn bảng 2 cột đối xứng giữa "- GV:" và "- HS:")
      - Kết thúc Tiết 2 BẮT BUỘC có đầy đủ mục:
        '#### IV. ĐIỀU CHỈNH SAU BÀI DẠY'
        với 2 đề mục con phản ánh thực tế sư phạm của Tiết 2:
        - Những điều đã thực hiện tốt: [Nội dung thực hiện tốt của Tiết 2]
        - Những điều cần rút kinh nghiệm: [Nội dung rút kinh nghiệm của Tiết 2]

      QUY TẮC BẮT BUỘC 3: HOẠT ĐỘNG CỦA GIÁO VIÊN VÀ HỌC SINH PHẢI NGẮN GỌN, ĐỦ Ý:
      - Hoạt động của giáo viên: Ngắn gọn, đủ ý. Đi thẳng vào câu hỏi hoặc nhiệm vụ cụ thể, không dùng lời dẫn lê thê chào đón học sinh hay lời nói rườm rà.
        * Ví dụ: Thay vì viết "Các con hãy nhìn vào mục 1 trong SGK. Tiếng chuông báo thức đã cho Minh biết điều gì? Từ điều đó Minh đã làm gì?" thì viết thành "Tiếng chuông báo thức đã cho Minh biết điều gì? Từ điều đó Minh đã làm gì?".
      - Hoạt động của học sinh: Ngắn gọn. Sử dụng các câu hoạt động ngắn gọn, chuẩn mực như:
        * "Học sinh lắng nghe."
        * "Học sinh ghi tựa bài vào vở."
        * "Học sinh quan sát tranh."
        * "Học sinh tích cực thảo luận nhóm."
        * "Học sinh tìm câu trả lời."
        * "Học sinh chia sẻ ý kiến với bạn."
        * "Học sinh lắng nghe và quan sát sơ đồ."
        * "Học sinh tập trung lắng nghe giáo viên hướng dẫn."

      QUY TẮC BẮT BUỘC 4: HOẠT ĐỘNG 2 KHÁM PHÁ CÓ THỂ CÓ CÁC MỤC CON (1., 2.):
      - Dựa vào tài liệu đính kèm minh họa (Ảnh SGK, PPT, Word mẫu) mà Hoạt động 2: Khám phá có thể chia thành các mục con (1., 2.).
      - Tiêu đề mục con được ghi trên một dòng riêng biệt, sau đó là các cặp dòng đối thoại "- GV:" và "- HS:" tương ứng.
      - Ví dụ về Bài 1 "Thông tin và quyết định":
        Ở Tiết 1:
        ##### Hoạt động 2: Khám phá - Tìm hiểu thông tin và quyết định (18 phút)
        - **Mục tiêu:** Nhận biết được thông tin thu nhận và quyết định được đưa ra trong các tình huống.
        - **Cách tiến hành:**
        1. Tìm hiểu thông tin và quyết định:
        - GV: Tiếng chuông báo thức đã cho Minh biết điều gì? Từ điều đó Minh đã làm gì?
        - HS: Học sinh quan sát tranh và tìm câu trả lời.
        - GV: Nhận xét câu trả lời của học sinh và chốt kiến thức: Thông tin giúp con người đưa ra quyết định phù hợp.
        - HS: Học sinh tập trung lắng nghe giáo viên hướng dẫn, ghi bài vào vở.
        2. Vai trò của thông tin trong quyết định:
        - GV: Trong tình huống bạn An nhìn thấy trời mưa, thông tin là gì và quyết định là gì?
        - HS: Học sinh tích cực thảo luận nhóm, chia sẻ ý kiến với bạn.
        - GV: Nhận xét và chốt nội dung về vai trò của thông tin trong quyết định.
        - HS: Học sinh lắng nghe và quan sát sơ đồ.
        Ở Tiết 2:
        ##### Hoạt động 2: Khám phá - Ba dạng thông tin thường gặp (18 phút)
        - **Mục tiêu:** Nhận biết và phân biệt được ba dạng thông tin thường gặp: dạng chữ, dạng hình ảnh, dạng âm thanh.
        - **Cách tiến hành:**
        1. Ba dạng thông tin thường gặp:
        - GV: Chiếu các hình ảnh minh họa trong SGK (sách truyện chữ, biển báo giao thông hình ảnh, tiếng còi xe âm thanh). Con người tiếp nhận thông tin dưới những dạng nào?
        - HS: Học sinh quan sát tranh và tìm câu trả lời: dạng chữ, dạng hình ảnh và dạng âm thanh.
        - GV: Nhận xét và chốt ba dạng thông tin thường gặp.
        - HS: Học sinh lắng nghe, ghi bài vào vở.
        2. Nhận biết và ví dụ về các dạng thông tin thường gặp:
        - GV: Yêu cầu học sinh tìm thêm các ví dụ xung quanh lớp học về từng dạng thông tin.
        - HS: Học sinh tích cực thảo luận nhóm, chia sẻ ý kiến với bạn.
        - GV: Nhận xét, chuẩn hóa kiến thức và khen ngợi các nhóm.
        - HS: Học sinh tập trung lắng nghe giáo viên hướng dẫn.

      QUY TẮC BẮT BUỘC 5: CÁC NỘI DUNG XUẤT HIỆN HAY KHÔNG DỰA VÀO CÁC TÙY CHỌN Ở THẺ "GIÁO ÁN CƠ BẢN":
      - Năng lực cần phát triển: ${competencyStatement}
      - Năng lực Trí tuệ nhân tạo (AI): ${aiCompetencyStatement}
      - Đồ dùng dạy học: ${toolsStatement}
      - Ứng dụng công nghệ số: ${techStatement}
      - Kết hợp trò chơi học tập: ${gamesStatement}
      - Phương pháp sư phạm: ${methodsStatement}

      QUY ĐỊNH ĐẶT TÊN VÀ THỜI GIAN CỦA TỪNG HOẠT ĐỘNG:
      Mỗi hoạt động BẮT BUỘC phải có nội dung dựa vào file Tài liệu đính kèm minh họa và thời gian của hoạt động đó (tính bằng phút) đặt trong dấu ngoặc đơn:
      + Hoạt động 1: Khởi động - * (* phút)
      + Hoạt động 2: Khám phá - * (* phút)
      + Hoạt động 3: Luyện tập - * (* phút)
      + Hoạt động 4: Vận dụng - * (* phút)

      ĐẢM BẢO 100% HOẠT ĐỘNG PHẢI NẰM TRONG BẢNG VÀ KHÔNG GẶP LỖI BỐ CỤC:
      + Cấu trúc mỗi hoạt động:
        Dòng 1: Tiêu đề hoạt động kèm thời gian (Ví dụ: "##### Hoạt động 1: Khởi động - Quan sát tranh dẫn nhập (5 phút)").
        Dòng 2: "- **Mục tiêu:** [Nội dung mục tiêu cụ thể]"
        Dòng 3: "- **Cách tiến hành:**"
        Các dòng tiếp theo: Nếu trong Hoạt động Khám phá có mục nhỏ, hãy ghi dòng tiêu đề mục nhỏ trên một dòng riêng (Ví dụ: "1. Thông tin và quyết định:"). Sau đó là các cặp dòng xen kẽ giữa:
        * "- GV:" (hoặc "- Giáo viên:"): Hoạt động của giáo viên (cột 55%). Ngắn gọn, đủ ý, đi thẳng vào câu hỏi hoặc thao tác cụ thể.
        * "- HS:" (hoặc "- Học sinh:"): Hoạt động của học sinh (cột 45%). Ngắn gọn, đối xứng tương ứng theo hàng ngang với hoạt động của giáo viên.
      + Cứ mỗi dòng "- GV:" PHẢI CÓ ngay 1 dòng "- HS:" tương ứng tiếp theo để dựng bảng 2 cột đối xứng hoàn hảo.
      + TUYỆT ĐỐI CẤM KỴ: Không dùng ký tự sọc đứng "|" để vẽ bảng Markdown. Hệ thống tự động chuyển các cặp "- GV:" và "- HS:" thành bảng 2 cột chuẩn mực Công văn 2345.`);

          for (const period of periods) {
            const isPeriod2OrMore = period.name.toLowerCase().includes("tiết 2") || period.name.toLowerCase().includes("tiet 2") || parseInt(period.name.replace(/\D/g, "")) >= 2;
            promptParts.push(`\n      #### ${period.name}: [Tên bài học/Chủ đề của ${period.name} bám sát tài liệu đính kèm]`);
            
            for (let actIdx = 0; actIdx < period.activities.length; actIdx++) {
              const activity = period.activities[actIdx];
              const actLower = activity.name.toLowerCase();
              const isWarmup = actLower.includes("khởi động") || actLower.includes("kết nối");
              const isExplore = actLower.includes("khám phá") || actLower.includes("hình thành") || actLower.includes("kiến thức") || actLower.includes("lý thuyết");
              const isPractice = actLower.includes("luyện tập") || actLower.includes("thực hành") || actLower.includes("bài tập");
              const isApply = actLower.includes("vận dụng") || actLower.includes("trải nghiệm") || actLower.includes("sáng tạo");

              let actTitleHeader = "";
              let sampleGoal = "";
              let sampleProceed = "";

              if (isWarmup) {
                if (isPeriod2OrMore) {
                  if (aiAutoGames || cleanedGame) {
                    actTitleHeader = `##### Hoạt động 1: Khởi động - Trò chơi Ôn tập kiến thức Tiết trước (5 phút)`;
                    sampleGoal = `Tái hiện kiến thức trọng tâm của Tiết trước thông qua trò chơi ${cleanedGame || "Ôn tập"} nhằm tạo tâm thế hào hứng và kết nối mượt mà vào nội dung mới của ${period.name}.`;
                    sampleProceed = `        - GV: Giáo viên tổ chức trò chơi ${cleanedGame || "Ôn tập"} (câu hỏi đố vui nhanh ôn lại kiến thức cốt lõi của Tiết trước), trình chiếu câu hỏi lên màn hình.
        - HS: Học sinh hào hứng tham gia trò chơi, tích cực suy nghĩ và chọn đáp án nhanh.
        - GV: Giáo viên chấm điểm thi đua, khen thưởng tập thể và dẫn dắt chuyển tiếp sang nội dung mới của ${period.name}.
        - HS: Học sinh tập trung lắng nghe, mở sách vở sẵn sàng bước vào bài học.`;
                  } else {
                    actTitleHeader = `##### Hoạt động 1: Khởi động - Ôn tập kiến thức Tiết trước và kết nối bài mới (5 phút)`;
                    sampleGoal = `Tái hiện và củng cố kiến thức trọng tâm của Tiết 1 thông qua câu hỏi tình huống từ tài liệu đính kèm, tạo tâm thế học tập và kết nối tự nhiên vào bài mới của ${period.name}.`;
                    sampleProceed = `        - GV: Giáo viên nêu câu hỏi củng cố hoặc trình chiếu lại hình ảnh/nội dung trọng tâm của Tiết 1, đặt câu hỏi gợi mở kết nối bài mới.
        - HS: Học sinh quan sát, suy nghĩ và tích cực xung phong trả lời câu hỏi.
        - GV: Giáo viên nhận xét, khen ngợi và dẫn dắt liên hệ trực tiếp vào nội dung bài học của ${period.name}.
        - HS: Học sinh tập trung lắng nghe, mở SGK/tài liệu bài học sẵn sàng tiếp thu bài mới.`;
                  }
                } else {
                  actTitleHeader = `##### Hoạt động 1: Khởi động - [Nội dung cụ thể dựa vào tranh ảnh/tình huống khởi động trong file tài liệu đính kèm] (5 phút)`;
                  sampleGoal = `Tạo không khí lớp học sôi nổi, kết nối bối cảnh, câu hỏi khởi động hoặc bức tranh dẫn nhập trong cuốn SGK "Kết nối tri thức với cuộc sống" môn ${subject} lớp ${grade}.`;
                  sampleProceed = `        - GV: Giáo viên chiếu hình ảnh khởi động trong SGK/tài liệu đính kèm lên màn hình và đặt câu hỏi gợi mở cho học sinh.
        - HS: Học sinh quan sát tranh, chú ý lắng nghe câu hỏi của giáo viên.
        - GV: Giáo viên hướng dẫn học sinh suy nghĩ, gọi đại diện phát biểu và nhận xét nhanh.
        - HS: Học sinh suy nghĩ, tìm câu trả lời và tự tin phát biểu ý kiến.
        - GV: Giáo viên khen ngợi, chốt ý và ghi tựa đề bài học mới lên bảng.
        - HS: Học sinh tập trung lắng nghe, ghi bài vào vở.`;
                }
              } else if (isExplore) {
                actTitleHeader = `##### Hoạt động 2: Khám phá - [Nội dung cụ thể dựa vào đề mục trong file tài liệu đính kèm] (18 phút)`;
                sampleGoal = `Hướng dẫn học sinh quan sát tranh ảnh trực quan và các đề mục của tài liệu đính kèm/bộ sách Kết nối tri thức (An, Minh, Khoa hoặc nhân vật Rô-bốt), thảo luận câu hỏi để rút ra kết luận nội dung bài giảng, ghi to hộp kiến thức cốt lõi.`;
                sampleProceed = `        1. [Đề mục khám phá 1 từ tài liệu đính kèm]:
        - GV: Giáo viên yêu cầu học sinh mở SGK quan sát hình ảnh cốt lõi và giao nhiệm vụ thảo luận nhóm.
        - HS: Học sinh quan sát tranh ảnh trong SGK, thảo luận nhóm sôi nổi theo yêu cầu.
        - GV: Giáo viên theo dõi, hướng dẫn các nhóm tháo gỡ khó khăn và gọi đại diện trình bày.
        - HS: Học sinh đại diện nhóm báo cáo kết quả thảo luận, các nhóm khác lắng nghe phản biện.
        - GV: Giáo viên nhận xét, chốt hộp kiến thức cốt lõi lên bảng.
        - HS: Học sinh tập trung lắng nghe, nhắc lại kiến thức trọng tâm và ghi vào vở.`;
              } else if (isPractice) {
                actTitleHeader = `##### Hoạt động 3: Luyện tập - [Nội dung cụ thể bài tập thực hành/câu hỏi trong file tài liệu đính kèm] (7 phút)`;
                sampleGoal = `Rèn luyện kỹ năng thực hành, trực tiếp giải câu hỏi trắc nghiệm hoặc làm bài thực hành máy tính theo mẫu in trên tài liệu đính kèm / SGK "Kết nối tri thức với cuộc sống".`;
                sampleProceed = `        - GV: Giáo viên nêu yêu cầu bài tập và hướng dẫn thao tác thực hành mẫu theo tài liệu đính kèm.
        - HS: Học sinh chú ý quan sát thao tác mẫu và lắng nghe hướng dẫn.
        - GV: Giáo viên yêu cầu học sinh thực hành cá nhân hoặc nhóm đôi, quan sát uốn nắn kịp thời.
        - HS: Học sinh trực tiếp thực hành thao tác trên máy tính theo yêu cầu của giáo viên.
        - GV: Giáo viên nhận xét bài làm của học sinh, tuyên dương các bạn hoàn thành tốt.
        - HS: Học sinh lắng nghe nhận xét, rút kinh nghiệm và lưu bài làm cẩn thận.`;
              } else if (isApply) {
                actTitleHeader = `##### Hoạt động 4: Vận dụng - [Nội dung cụ thể tình huống vận dụng trong file tài liệu đính kèm] (5 phút)`;
                sampleGoal = `Mở rộng tri thức liên hệ thực tiễn tốt từ thử thách Vận dụng cuối bài trong tài liệu đính kèm để tự tin ứng dụng vào gia đình và đời sống hằng ngày.`;
                sampleProceed = `        - GV: Giáo viên giao nhiệm vụ thử thách vận dụng thực tế bám sát bài học.
        - HS: Học sinh lắng nghe nhiệm vụ, liên hệ thực tế bản thân và gia đình để trả lời.
        - GV: Giáo viên nhận xét ý kiến học sinh, tổng kết tiết học và dặn dò ôn bài ở nhà.
        - HS: Học sinh tập trung lắng nghe, ghi nhớ dặn dò của giáo viên.`;
              } else {
                actTitleHeader = `##### Hoạt động ${actIdx + 1}: ${activity.name} ([Số] phút)`;
                sampleGoal = `Phát triển năng lực tư duy sáng tạo của học sinh trong phạm vi bài học ${title}.`;
                sampleProceed = `        - GV: Giáo viên tổ chức hoạt động học tập tích cực, giao việc cụ thể bám sát bài học.
        - HS: Học sinh tập trung lắng nghe và tích cực thực hiện nhiệm vụ được giao.
        - GV: Giáo viên nhận xét, đánh giá kết quả và chốt kiến thức trọng tâm.
        - HS: Học sinh chú ý lắng nghe, ghi nhận và hoàn thiện nội dung bài học.`;
              }

              promptParts.push(`\n      ${actTitleHeader}
      - **Mục tiêu:** ${sampleGoal}
      - **Cách tiến hành (Chi tiết hành động cốt lõi của giáo viên và học sinh):**
${sampleProceed}`);
            }

            // Thêm Điều chỉnh sau bài dạy ở cuối mỗi Tiết (cả Tiết 1 và Tiết 2)
            promptParts.push(`\n      #### IV. ĐIỀU CHỈNH SAU BÀI DẠY
      - Những điều đã thực hiện tốt: [Giáo viên tự nhận xét ngắn gọn về mức độ tiếp thu của học sinh trong ${period.name}]
      - Những điều cần rút kinh nghiệm: [Giáo viên tự nhận xét rút kinh nghiệm về phân bổ thời gian hoặc phương pháp cho ${period.name}]`);
          }
        } else {
          // DETAILED PLAN (Giáo án chi tiết chia bảng hai cột)
          promptParts.push(`      BẮT BUỘC: Soạn Giáo án theo chuẩn Công văn 2345 dưới dạng **GIÁO ÁN CHI TIẾT THAO GIẢNG / DỰ GIỜ GIÁO VIÊN GIỎI** xuất sắc nhất.
      - BỐ CỤC CỐ ĐỊNH 100% TRONG MỖI HOẠT ĐỘNG: Trong tất cả các hoạt động dạy học (Khởi động, Khám phá, Luyện tập, Vận dụng), phần 'Cách tiến hành' BẮT BUỘC phải viết dưới dạng kịch bản bắt đầu bằng các dòng gạch đầu dòng xen kẽ giữa tiền tố "- GV:" và "- Học sinh:".
      - CỘT "HOẠT ĐỘNG CỦA GIÁO VIÊN" (CỘT CHIẾM 55%): Cột này chỉ hiển thị hoạt động của giáo viên! Bắt đầu bằng tiền tố "- GV:".
      - CỘT "HOẠT ĐỘNG CỦA HỌC SINH" (CỘT CHIẾM 45%): Hoạt động của học sinh phải được chuyển sang cột "Hoạt động của Học sinh". Dựa vào hoạt động của giáo viên đề ra mà hoạt động của học sinh đối xứng tương ứng theo hàng ngang của cột. Bắt đầu bằng tiền tố "- Học sinh:" hoặc "- HS:".
      - TIÊU CHUẨN XUẤT SẮC CỦA BỘ SÁCH KNTT (ĐẠT CHUẨN TỪ 90% TRỞ LÊN): Giáo án được xây dựng dựa trên tiêu chuẩn khắt khe nhất của Hội đồng Thẩm định, bám sát phương châm phát triển phẩm chất - năng lực của GDPT 2018 và bộ sách "Kết nối tri thức với cuộc sống". Toàn bộ nội dung học phải sinh động, thực tế, tránh lý thuyết suông rập khuôn.
      - QUY ĐỊNH BẮT BUỘC LỜI DẪN CHI TIẾT CỦA GIÁO VIÊN: Khi chuyển tiếp hoặc giao việc, Giáo viên TUYỆT ĐỐI KHÔNG ĐƯỢC dùng các mô tả chung chung như "GV dẫn dắt học sinh", "GV giới thiệu bài", "GV chốt lý thuyết". Thay vào đó, bạn PHẢI VIẾT NGUYÊN VĂN LỜI THOẠI CHI TIẾT (Lời dẫn trực tiếp giàu cảm xúc, dí dỏm, mang tính khơi gợi súc tích) bắt đầu bằng tiền tố "- GV:" để thầy cô có thể đọc trực tiếp trên lớp.
      - TUYỆT ĐỐI KHÔNG ĐƯỢC TRỐNG HOẠT ĐỘNG HỌC SINH: Mỗi câu hỏi hay yêu cầu hướng dẫn của Giáo viên ("- GV:") đều phải có câu trả lời hoặc hành động cụ thể song hành tương ứng của Học sinh ("- Học sinh:") đi kèm.
      - THÊM "IV. ĐIỀU CHỈNH SAU BÀI DẠY" Ở CUỐI MỖI TIẾT (Cuối Tiết 1 và Cuối Tiết 2):
        Sau khi kết thúc 4 hoạt động của mỗi tiết, bắt buộc thêm mục:
        '#### IV. ĐIỀU CHỈNH SAU BÀI DẠY'
        - Những điều đã thực hiện tốt: [Giáo viên tự nhận xét ngắn gọn]
        - Những điều cần rút kinh nghiệm: [Giáo viên tự nhận xét ngắn gọn]
      - TIẾT 2 CÓ BỐ CỤC ĐẦY ĐỦ GIỐNG TIẾT 1: Gồm tiêu đề Tiết 2, đủ 4 hoạt động (Khởi động ôn tập, Khám phá, Luyện tập, Vận dụng) và cuối Tiết 2 có Điều chỉnh sau bài dạy.
      - TĂNG CƯỜNG TÌNH HUỐNG & VÍ DỤ GỢI MỞ BÁM SÁT THỰC TẾ: Trong mỗi hoạt động (đặc biệt là Khởi động và Khám phá), phải lồng ghép ít nhất 2 tình huống học tập phát sinh thực tế hoặc câu chuyện nhỏ đời thường gần gũi với lứa tuổi, kèm ví dụ trực quan sinh động (gắn liền với sơ đồ, tranh vẽ, hoặc hoạt động nhóm của An, Minh, Khoa, Rô-bốt) để khơi gợi bài học tự nhiên nhất.
      - Cách thức thiết lập: Sử dụng các dòng gạch đầu dòng xen kẽ giữa tiền tố "- GV:" và "- Học sinh:" ở phần Cách tiến hành. Hệ thống sẽ tự động ghép thành bảng HTML 2 cột (GV 55%, HS 45%) chuyên nghiệp nhất.
      - TUYỆT ĐỐI CẤM KỴ: Không tự ý tạo khung bảng bằng ký tự Markdown sọc đứng "|". Quy trình sẽ tự động dệt list sang bảng.`);

          for (const period of periods) {
            const isPeriod2OrMore = period.name.toLowerCase().includes("tiết 2") || period.name.toLowerCase().includes("tiet 2") || parseInt(period.name.replace(/\D/g, "")) >= 2;
            promptParts.push(`\n      #### ${period.name}: [Tên bài học/Chủ đề của tiết]`);
            
            for (let actIdx = 0; actIdx < period.activities.length; actIdx++) {
              const activity = period.activities[actIdx];
              const actLower = activity.name.toLowerCase();
              const isWarmup = actLower.includes("khởi động") || actLower.includes("kết nối");

              if (isPeriod2OrMore && isWarmup) {
                promptParts.push(`\n      ##### ${activity.name} (Gồm trò chơi khởi động ôn tập nhanh đầu Tiết 2)`);
              } else {
                promptParts.push(`\n      ##### ${activity.name}`);
              }
              
              let sampleGoal = "";
              let sampleScript = "";
              
              if (isWarmup) {
                if (isPeriod2OrMore) {
                  sampleGoal = `Tạo tâm thế sảng khoái và khơi gợi kiến thức cũ của Tiết 1 bài ${title} thông qua trò chơi khởi động nhanh trò chơi ôn tập (Ví dụ: Trò chơi Quiz 3-5 câu trắc nghiệm thú vị bám bài cũ).`;
                  sampleScript = `        - GV: Các con ơi! Hôm nay bước sang Tiết 2 của bài học "${title}", Thầy/Cô đã chuẩn bị một thử thách siêu hấp dẫn mang tên "Danh sư nhí". Luật chơi là các con sẽ xem câu hỏi trên máy chiếu và có 15 giây suy nghĩ để giơ tay trả lời nhanh. Câu hỏi thứ nhất của Thầy/Cô là...
        - Học sinh: Cả lớp rào rào vỗ tay hào hứng, nhanh tay hướng mắt lên màn hình, tích cực giơ tay tranh quyền phát biểu và đưa ra các đáp án đúng cho bài cũ.
        - GV: Rất tuyệt vời! Các con ghi nhớ bài cũ cực kỳ siêu đẳng. Thầy/Cô tặng mỗi bạn một sticker may mắn và tuyên dương cả lớp. Bây giờ chúng ta cùng bước tiếp vào nội chung cực kỳ kỳ thú tiếp theo của Tiết 2 nhé!
        - Học sinh: Học sinh nhận phần thưởng trong không khí ngập tràn tiếng cười, mở vở ghi chép tiêu đề phần học tiếp theo của bài.`;
                } else {
                  sampleGoal = `Tạo tâm thế học tập hứng khởi, kết nối bối cảnh bài học và dắt tay học sinh vào bài mới thông qua trò chơi sinh động hoặc bức tranh dẫn nhập SGK Kết nối tri thức.`;
                  sampleScript = `        - GV: Chào đón các con đến với tiết học ngày hôm nay! Để khởi động bài mới thật hoành tráng, Thầy/Cô mời cả lớp quan sát bức tranh vẽ tình huống thú vị ở đầu trang sách giáo khoa. Hãy xem nhân vật thông thái nào quen thuộc của chúng ta đang xuất hiện và thách đố điều gì nhỉ?
        - Học sinh: Cả lớp đồng thanh reo hò: "Thưa Thầy/Cô, đó là nhân vật Rô-bốt đáng yêu ạ!". Học sinh thích tập trung hướng mắt lên màn hình máy chiếu do GV hiển thị.
        - GV: Chính xác! Vậy bạn Rô-bốt đang trò chuyện thế nào với các bạn Minh, An trong tranh và tò mò về điều gì? Chúng ta cùng thảo luận nhóm đôi khám phá nhé!
        - Học sinh: Đại diện một số nhóm tự tin đứng dậy phát biểu, đưa ra các nhận xét ban đầu rất sáng tạo liên đới với tiêu đề bài học mới.
        - GV: Thầy/Cô khen ngợi cách suy lý vô cùng sắc bén của các con và chính thức dẫn dắt duyên dáng ghi tựa đề bài học mới lên bảng.
        - Học sinh: Học sinh vui vẻ lấy vở ghi bài và ghi chép tiêu đề bài mới thật nắn nót, ngay ngắn.`;
                }
              } else if (actLower.includes("khám phá") || actLower.includes("hình thành") || actLower.includes("kiến thức") || actLower.includes("lý thuyết")) {
                sampleGoal = `Giúp học sinh tự lĩnh hội tri thức mới một cách sâu sắc thông qua việc quan sát hình minh họa trực quan, sơ đồ khái niệm đặc thù của bộ sách "Kết nối tri thức với cuộc sống" và tự lực thảo luận nội dung đề mục.`;
                sampleScript = `        - GV: Bây giờ, hành trình chinh phục đỉnh núi tri thức mới bắt đầu! Thầy/Cô giao việc cho các nhóm 4: Các con hãy mở sách giáo khoa trang này ra, chăm chú quan sát bức tranh minh họa/bảng số liệu trực quan cực kỳ thú vị (mô tả rõ các hình vẽ sơ đồ khái niệm thiết kế đặc thù của bài này). Các con có 3 phút thảo luận nhóm để trả lời hai câu hỏi gợi ý thâm sâu sau đây...
        - Học sinh: Các nhóm hăng say tụ hội làm việc, phân công nhóm trưởng ghi phiếu, cùng chỉ tay vào hình vẽ trong sách giáo khoa sôi nổi phân tích, phản biện đa chiều về câu hỏi giáo viên giao.
        - GV: Di chuyển linh hoạt giữa các nhóm, quan sát, mỉm cười khích lệ các em nhút nhát và tinh tế tháo gỡ khó khăn cho các nhóm còn đang ngập ngừng.
        - Học sinh: Trực diện trao đổi cùng Thầy/Cô, vượt qua rào cản nhận thức và hoàn thành phiếu học tập của nhóm mình đúng hạn.
        - GV: Gõ chuông hết giờ! Thầy/Cô mời đại diện nhóm xuất sắc nhất trình bày sản phẩm, các bạn nhóm khác lưu ý phản biện, nhận xét chéo lịch sự nhé.
        - Học sinh: Đại diện nhóm đứng dậy trình bày tự tin, gãy gọn sản phẩm thảo luận thiết thực bám sát tranh sách giáo khoa. Học sinh nhóm khác hăng say đối thoại phản biện.
        - GV: Tổng kết, nhận xét quá trình làm việc độc lập sáng tạo hoàn hảo của học sinh, rút ra bài học chính thống chuẩn khoa học và đọc thật vang nội dung Hộp ghi nhớ kiến thức bản quyền của SGK "Kết nối tri thức với cuộc sống" để cả lớp đóng khung lưu bài.
        - Học sinh: Trân trọng lắng nghe lời chốt thông thái từ Thầy/Cô, ghi chép vắn tắt đề mục và nghiêm túc đóng khung Hộp kiến thức ghi nhớ lung linh vào vở học.`;
              } else if (actLower.includes("luyện tập") || actLower.includes("thực hành") || actLower.includes("bài tập")) {
                sampleGoal = `Giúp học sinh thực hành, rèn luyện kỹ năng tư duy thông qua giải quyết trực tiếp các câu hỏi luyện tập trực quan hoặc bài thực hành máy tính mẫu có sẵn trong SGK Kết nối tri thức.`;
                sampleScript = `        - GV: Để củng cố thật chắc tri thức vừa học, chúng ta cùng giải tỏa năng lượng bằng phần Luyện tập nào! Thầy/Cô mời cả lớp quan sát câu hỏi luyện tập hoặc bài tập thực hành số mấy có trong trang sách giáo khoa. Các con hãy làm việc độc lập (hoặc nhóm đôi) giải bài tập này hoặc thực hiện đúng từng bước thao tác kỹ thuật máy tính theo sách giáo khoa hướng dẫn nhé!
        - Học sinh: Học sinh tập trung cao độ, tự tay viết bài giải tỉ mỉ vào vở bài tập hoặc thao tác tay nhịp nhàng trên chuột phím máy tính bám sát hướng dẫn trực quan trong trang sách cực kỳ chuyên nghiệp.
        - GV: Đi quanh lớp kiểm tra, hướng dẫn sửa sai sư phạm kịp thời cho các em học sinh có kỹ năng yếu, gợi mở nhẹ nhàng khích lệ tinh thần tự học tự làm của trẻ.
        - Học sinh: Đón nhận nụ cười ấm áp của Thầy/Cô, tự sửa sai các thao tác lỗi và hào hứng hoàn thành xuất sắc yêu cầu luyện tập thực tế.
        - GV: Đã đến lúc nghiệm thu sản phẩm! Thầy/Cô gọi 2 bạn xung phong nhanh nhất chiếu bài lên màn hình tương tác hoặc bảng lớp, tổ chức cho cả lớp nhận xét góp ý xây dựng.
        - Học sinh: Học sinh quan sát, chỉ ra phát hiện sửa bài mẫu của bạn, thảo luận sôi nổi phản biện kiến thức với tinh thần xây dựng học hỏi.
        - GV: Chốt hướng dẫn lý tưởng, chấm điểm thưởng thi đua nỗ lực thực hành xuất sắc và kết luận chuẩn đáp án để học sinh bổ sung sửa đổi vào vở.
        - Học sinh: Tự kiểm tra bài viết của mình, chủ động sửa sang các điểm thiếu sót và ghi nhớ sâu sắc cách giải quyết bài đúng đắn.`;
              } else if (actLower.includes("vận dụng") || actLower.includes("trải nghiệm") || actLower.includes("sáng tạo")) {
                sampleGoal = `Ứng dụng sáng tạo tri thức bài học vào đời sống thực tiễn bám sát Thử thách Vận dụng cuối bài của sách giáo khoa "Kết nối tri thức với cuộc sống" để chia sẻ cùng gia đình.`;
                sampleScript = `        - GV: Các con đã học tập cực kỳ thông minh! Để bài học hôm nay thực sự có ích trong đời sống, Thầy/Cô giao một thử thách vô cùng độc đáo từ mục Vận dụng cuối bài trong sách giáo khoa Kết nối tri thức. Các con hãy kết hợp bài học hôm nay để tự đề xuất phương án và sáng tạo sản phẩm thực thực tế bối cảnh hằng ngày của gia đình mình nhé!
        - Học sinh: Cả lớp háo hức ghi nhận thử thách vận dụng, liên hệ với tình huống thực tiễn sinh sống của chính bản thân và suy nghĩ ý tưởng giải quyết thâm thúy.
        - GV: Sau khi dặn dặn xong vận dụng, Thầy/Cô tổ chức thêm trò chơi Rung chuông vàng hoặc Đố vui chốt nhanh kiến thức bài học trong 3 phút, khen thưởng nồng nhiệt đội thi chiến thắng hôm nay!
        - Học sinh: Cháy hết mình tham gia trò chơi, hò reo mừng chiến thắng, tiếp thu bài học một cách tự nhiên và sảng khoái nhất.
        - GV: Nhận xét tinh thần thái độ, ý thức kỷ luật tiết học dự giờ xuất sắc của cả lớp, khen ngợi các cá nhân nổi bật, dặn dò các con chuẩn bị bài tiếp theo bám sát taphuan.nxbgd.vn trước khi kết thúc tiết dạy mẫu mực.
        - Học sinh: Ghi nhớ kỹ lưỡng lời dặn yêu thương của Thầy/Cô và hân hoan chào Thầy/Cô khi kết thúc một tiết dạy tràn ngập hứng khởi học tập.`;
              } else {
                sampleGoal = `Củng cố nâng cao năng lực định hướng phát triển phẩm chất toàn diện cho học sinh bám bài ${title}.`;
                sampleScript = `        - GV: Giáo viên giao nhiệm vụ và dẫn dắt học sinh khám phá sâu thêm bài học bám sát chương trình.
        - Học sinh: Học sinh trao đổi thảo luận nhiệt tình theo nhóm đôi, ghi kết quả lên phiếu bài cá nhân.
        - GV: Giáo viên nhận xét nỗ lực, phân tích chốt kiến thức chuẩn chỉnh.
        - Học sinh: Học sinh ghi chép tri thức hoàn chỉnh lưu lại vào vở.`;
              }

              promptParts.push(`      - **Mục tiêu:** ${sampleGoal}
      - **Cách tiến hành:**
${sampleScript}`);
            }

            // Thêm Điều chỉnh sau bài dạy ở cuối mỗi Tiết
            promptParts.push(`\n      #### IV. ĐIỀU CHỈNH SAU BÀI DẠY
      - Những điều đã thực hiện tốt: [Giáo viên tự nhận xét ngắn gọn về mức độ tiếp thu của học sinh trong ${period.name}]
      - Những điều cần rút kinh nghiệm: [Giáo viên tự nhận xét rút kinh nghiệm về phân bổ thời gian hoặc phương pháp cho ${period.name}]`);
          }
        }
        
        activitiesPrompt = promptParts.join("\n");
      } else {
        // FALLBACK: construct original static content if periods are not supplied or are invalid
        const parsedDurationNum = parseInt(duration) || 1;
        if (parsedDurationNum === 1) {
          periodPlanInstructions = `\n[YÊU CẦU THỜI LƯỢNG 1 TIẾT]: Vì bài học này chỉ diễn ra trong thời lượng là 1 Tiết (35-40 phút), hãy trình bày 4 hoạt động liên tục thuộc đúng 1 tiết duy nhất. Ghi rõ tiêu đề định dạng '#### TIẾT 1: <Tên hoạt động/Nội dung chính>' (ví dụ: #### TIẾT 1: THÔNG TIN VÀ QUYẾT ĐỊNH) ở đầu trước khi đi vào Hoạt động 1.\n`;
        } else if (parsedDurationNum === 2) {
          periodPlanInstructions = `\n[YÊU CẦU THỜI LƯỢNG 2 TIẾT BỐ CỤC ĐẦY ĐỦ CẢ 2 TIẾT]: Rất quan trọng! Bài học diễn ra trong 2 Tiết, cả 2 Tiết đều phải có bố cục đầy đủ gồm 4 hoạt động và mục Điều chỉnh sau bài dạy:
  - TIẾT 1: Ghi '#### TIẾT 1: <Tên bài học/Chủ đề Tiết 1>' gồm đầy đủ 4 hoạt động:
    + Hoạt động 1: Khởi động - Quan sát tranh/tình huống khởi động trong tài liệu đính kèm (5 phút)
    + Hoạt động 2: Khám phá - Nội dung cốt lõi từ tài liệu đính kèm (18 phút)
    + Hoạt động 3: Luyện tập - Bài tập thực hành từ tài liệu đính kèm (7 phút)
    + Hoạt động 4: Vận dụng - Tình huống vận dụng từ tài liệu đính kèm (5 phút)
    + Cuối Tiết 1: Bắt buộc có '#### IV. ĐIỀU CHỈNH SAU BÀI DẠY'
  - TIẾT 2: Bố cục đầy đủ giống Tiết 1. Ghi '#### TIẾT 2: <Tên bài học/Chủ đề Tiết 2>' gồm đầy đủ 4 hoạt động:
    + Hoạt động 1: Khởi động - Trò chơi Ôn tập kiến thức Tiết 1 (5 phút)
    + Hoạt động 2: Khám phá - Thực hành mở rộng kiến thức trên máy tính (18 phút)
    + Hoạt động 3: Luyện tập - Báo cáo và nhận xét sản phẩm (7 phút)
    + Hoạt động 4: Vận dụng - Liên hệ thực tế đời sống và dặn dò (5 phút)
    + Cuối Tiết 2: Bắt buộc có '#### IV. ĐIỀU CHỈNH SAU BÀI DẠY'
  Viết kịch bản hoạt động phong phú, chuẩn mực cho từng tiết để giáo viên dễ theo dõi.\n`;
        } else if (parsedDurationNum === 3) {
          periodPlanInstructions = `\n[YÊU CẦU THỜI LƯỢNG 3 TIẾT]: Rất quan trọng! Bài học diễn ra trong 3 Tiết:
  - TIẾT 1: gồm Hoạt động 1 (Khởi động) và Hoạt động 2 (Khám phá lý thuyết phần 1). Hãy viết ở định dạng: '#### TIẾT 1: <Tên hoạt động/Nội dung chính>' ở đầu trước Hoạt động 1.
  - TIẾT 2: gồm Khám phá lý thuyết phần 2 và Hoạt động 3 (Luyện tập, thực hành). Hãy viết ở định dạng: '#### TIẾT 2: <Tên hoạt động/Nội dung chính>' ở đầu trước Hoạt động 3.
  - TIẾT 3: gồm Hoạt động 4 (Vận dụng, trải nghiệm sáng tạo). Hãy viết ở định dạng: '#### TIẾT 3: <Tên hoạt động/Nội dung chính>' ở đầu trước Hoạt động 4.
  Viết kịch bản hoạt động phong phú và cụ thể cho từng tiết để giáo viên dễ theo dõi.\n`;
        } else {
          periodPlanInstructions = `\n[YÊU CẦU THỜI LƯỢNG MULTI-TIẾT]: Rất quan trọng! Hãy phân chia bài học tương ứng với số lượng ${duration} tiết, ghi rõ tiêu đề phụ ở định dạng: '#### TIẾT X: <Tên hoạt động/Nội dung chính>' ở đầu trước các nhóm hoạt động của tiết học tương ứng.\n`;
        }

        if (layoutOptions?.isBasic) {
          activitiesPrompt = `      BẮT BUỘC: Soạn Giáo án theo chuẩn Công văn 2345 dưới dạng **GIÁO ÁN CƠ BẢN** (ĐẶC BIỆT: Các hoạt động phải cực kỳ ngắn gọn, súc tích và CHI TIẾT CHỈ TẬP TRUNG vào hoạt động của Giáo viên).
        - TIÊU CHÍ CỐT LÕI: Giáo án cơ bản tinh gọn, không rườm rà. Tập trung tối đa vào các thao tác sư phạm, gợi ý khai thác tranh ảnh SGK "Kết nối tri thức với cuộc sống", câu hỏi đặt vấn đề, cách giao nhiệm vụ, và các chốt lý thuyết bản quyền của riêng Giáo viên. Loại bỏ hoàn toàn kịch bản hội thoại dài dòng.
        - TUYỆT ĐỐI CẤM KỴ: Không tự ý tạo khung bảng hay vẽ kí tự sọc đứng. Không dùng các từ viết tắt hay tiền tố GV:, HS: ở đầu câu.

        #### ${layoutOptions?.customActivity1 || 'Hoạt động 1: Khởi động, kết nối'}
        - **Mục tiêu:** Tạo tâm thế hứng khởi, bám sát hoàn toàn với tình huống khởi động thực tế mẫu/câu hỏi dẫn dắt khởi môn của SGK "Kết nối tri thức với cuộc sống" bài học này. Mô tả chi tiết việc học sinh quan sát tranh ảnh khởi đầu đặc thù trong SGK Kết nối tri thức. Nếu có trò chơi "${gameInputs}" hãy mô tả GV tổ chức chơi để khởi động.
        - **Cách tiến hành (Chi tiết hành động của giáo viên):**
          - Giáo viên tổ chức trò chơi ôn luyện thú vị liên hệ bài học cũ hoặc chiếu bài giảng trò chơi khởi động để học sinh hăng say tham gia.
          - Giáo viên tổ chức cho học sinh bám tài liệu trong sách "Kết nối tri thức với cuộc sống" (hoặc chiếu hình ảnh từ trang tập huấn taphuan.nxbgd.vn), hướng dẫn các con quan sát bức tranh vẽ dẫn nhập và đặt câu hỏi gợi mở liên quan.
          - Giáo viên nhận xét nhanh ý kiến học sinh, chốt câu trả lời và khéo léo giới thiệu bài học mới, ghi tựa đề bài lên bảng bộ.

        #### ${layoutOptions?.customActivity2 || 'Hoạt động 2: Khám phá, hình thành kiến thức'}
        - **Mục tiêu:** Hướng dẫn Học sinh tự lĩnh hội lý thuyết mới một cách sinh động thông qua khám phá các ĐỀ MỤC CHUẨN và TRANH ẢNH MINH HỌA của bài học trong cuốn SGK "Kết nối tri thức với cuộc sống", ghi nhớ các hộp kiến thức chính xác của bản gốc.
        - **Cách tiến hành (Chi tiết hành động của giáo viên):**
          - Giáo viên giao nhiệm vụ học tập chính yếu và chi tiết hướng dẫn Học sinh quan sát hình vẽ minh họa, sơ đồ khái niệm thiết yếu in trong sách giáo khoa.
          - Giáo viên nêu hệ thống câu đố hoặc câu hỏi dẫn dắt, định hướng học sinh tự trao đổi thảo luận nhóm nhỏ để thấu hiểu lý thuyết cốt lõi của đề mục.
          - Giáo viên tổng kết, chuẩn hóa lý thuyết chính thống bám sát chi tiết nội dung SGK Kết nối tri thức, sau đó ghi bảng hoặc chỉ định học sinh đóng khung hộp kiến thức ghi nhớ cốt lõi vào vở chép.

        #### ${layoutOptions?.customActivity3 || 'Hoạt động 3: Luyện tập, thực hành'}
        - **Mục tiêu:** Giao nhiệm vụ, câu hỏi rèn luyện, hoặc tổ chức thực hành trực tiếp dựa trên đúng bộ câu hỏi, bài tập kèm tranh vẽ mẫu "Luyện tập" ở cuối bài học của SGK "Kết nối tri thức với cuộc sống".
        - **Cách tiến hành (Chi tiết hành động của giáo viên):**
          - Giáo viên giao các nội dung bài tập củng cố lý thuyết hoặc nhiệm vụ thực hành máy tính có trong SGK bài học hiện hành.
          - Giáo viên đi quanh lớp quan sát tỉ mỉ, đưa ra các câu hỏi phụ để gợi mở tư duy, kịp thời hướng dẫn và sửa lỗi kỹ năng trực tiếp cho học sinh.
          - Giáo viên chỉ định học sinh phát biểu đáp án hoặc trình bày sản phẩm học tập trên bảng, sau đó nhận xét nhận xét bổ sung, tuyên dương sáng tạo và chuẩn hóa đáp án chuẩn xác.

        #### ${layoutOptions?.customActivity4 || 'Hoạt động 4: Vận dụng, trải nghiệm sáng tạo'}
        - **Mục tiêu:** Hướng dẫn học sinh đưa tri thức vào ứng dụng thực tế ngoài giờ học thông qua thực hiện bài tập mở rộng, phân tích tình huống thử thách ở mục "Vận dụng" cuối bài của bộ sách "Kết nối tri thức với cuộc sống".
        - **Cách tiến hành (Chi tiết hành động của giáo viên):**
          - Giáo viên giao nhiệm vụ hay các tình huống thử thách mở rộng in ở cuối bài sách giáo khoa, hướng dẫn các con phương pháp tự liên hệ thực tiễn và tham khảo thêm tại taphuan.nxbgd.vn để ứng dụng trong đời sống.
          - Giáo viên tổ chức củng cố nhanh bằng một trò chơi đố vui ngắn tóm tắt kiến thức của bài học vừa qua.
          - Giáo viên nhận xét nỗ lực của tập thể lớp trong cả tiết học, tuyên dương tinh thần học tập nhiệt tình và hướng dẫn chuẩn bị bài cho buổi tiếp theo trước khi kết thúc tiết dạy.`;
        } else {
          activitiesPrompt = `      BẮT BUỘC: Soạn Giáo án theo chuẩn Công văn 2345 dưới dạng **GIÁO ÁN CHI TIẾT THAO GIẢNG / DỰ GIỜ GIÁO VIÊN GIỎI** xuất sắc nhất.
          - BỐ CỤC CỐ ĐỊNH 100% TRONG MỖI HOẠT ĐỘNG: Phần 'Cách tiến hành' của cả 4 hoạt động BẮT BUỘC phải viết dưới dạng kịch bản đối thoại trực tiếp bắt đầu bằng các dòng gạch đầu dòng xen kẽ nối tiếp nhau rõ nghĩa quy củ giữa "- GV:" và "- Học sinh:". TUYỆT ĐỐI không viết đoạn văn mô tả trần thuật chung chung không chia vai. Mỗi hoạt động bắt buộc có đầy đủ cả 2 khung là Hoạt động Giáo viên ("- GV:") và Hoạt động Học sinh ("- Học sinh:").
          - TUYỆT ĐỐI CẤM KỴ / KHÔNG ĐƯỢC TỰ Ý tạo bảng sọc hay vẽ khung bảng bằng kí tự đứng \`|\` kiểu Markdown. Bạn chỉ viết văn bản chữ thông thường và danh sách dạng gạch đầu dòng và hệ thống của chúng tôi sẽ tự động dệt list sang bảng HTML.
          - YÊU CẦU ĐẶC BIỆT DỰ GIỜ GIỎI (ĐẠT CHUẨN TỪ 90% TRỞ LÊN): Kịch bản giáo án chi tiết này phải hoàn hảo 100% mô tả một khung cảnh tiết dạy mẫu sinh động, đầy ắp lời thoại trực tiếp và các tình huống sư phạm lôi cuốn thực tế.
          - QUY ĐỊNH BẮT BUỘC LỜI DẪN CHI TIẾT CỦA GIÁO VIÊN: Khi chuyển tiếp hoặc giao việc, Giáo viên TUYỆT ĐỐI KHÔNG ĐƯỢC dùng các mô tả chung chung như "GV dẫn dắt học sinh", "GV giới thiệu bài", "GV chỉ dẫn". Thay vào đó, bạn PHẢI VIẾT NGUYÊN VĂN LỜI THOẠI CHI TIẾT (Lời dẫn trực tiếp giàu cảm xúc, dí dỏm trong dấu nháy kép) bắt đầu bằng "- GV:" để thầy cô đọc trực tiếp trên lớp.
          - TUYỆT ĐỐI KHÔNG ĐƯỢC TRỐNG HOẠT ĐỘNG HỌC SINH: Mỗi câu hỏi hay yêu cầu hướng dẫn của Giáo viên ("- GV:") đều phải có câu trả lời hoặc hành động cụ thể song hành tương ứng của Học sinh ("- Học sinh:") đi kèm.
          - TĂNG CƯỜNG TÌNH HUỐNG & VÍ DỤ GỢI MỞ BÁM SÁT THỰC TẾ: Trong mỗi hoạt động, lồng ghép ít nhất 2 tình huống học tập phát sinh thực tế đời thường, kèm ví dụ trực quan sinh động (gắn liền với nhân vật An, Minh, Khoa, Rô-bốt của cuốn SGK Kết nối tri thức).
          - Tiến trình kịch bản đối thoại song hành: Viết thật tỉ mỉ, cụ thể sự phân vai rõ rệt:
            * "- GV:": Giáo viên thảo luận hóm hỉnh với lời dẫn chân thực cụ thể, hướng dẫn tỉ mỉ bám sát sách, khen thưởng kịp thời.
            * "- Học sinh:": Học sinh hăng hái trả lời sáng tạo, trao đổi nhóm sôi nổi xôn xao, nhận xét đồng đẳng tích cực.
          Hãy viết ít nhất 3-4 cặp đối đáp "- GV:" và "- Học sinh:" xen kẽ chi tiết cho mỗi hoạt động để giáo án đầy đặn và hoàn hảo nhất.

        Hãy viết kịch bản chi tiết cho cả 4 hoạt động sau dưới dạng văn văn sư phạm truyền cảm hứng, bám sát sách giáo khoa "Kết nối tri thức với cuộc sống".
        YÊU CẦU ĐẶC BIỆT: Trong phần "- Cách tiến hành:", bạn BẮT BUỘC phải viết kịch bản đối thoại sư phạm chi tiết dạng các DÒNG GẠCH ĐẦU DÒNG xen kẽ nối tiếp nhau rõ nghĩa quy củ giữa "- GV:" và "- Học sinh:" để có thể trích xuất thành bảng hai cột tương ứng 100%:
          - GV: [Ghi rõ hoạt động tổ chức trò chơi hoặc giao nhiệm vụ đầu giờ của giáo viên hóm hỉnh]
          - Học sinh: [Ghi hành động học sinh reo mừng, quan sát tranh ảnh sách hoặc thảo luận hoàn thành trò chơi]
        Hãy viết ít nhất 3 cặp đôi "GV:" - "Học sinh:" xen kẽ cho mỗi hoạt động để giáo án đầy đặn và chuyên nghiệp nhất!

        #### ${layoutOptions?.customActivity1 || 'Hoạt động 1: Khởi động, kết nối'}
        - **Mục tiêu:** Tạo tâm thế hứng khởi, bám sát hoàn toàn với tình huống khởi động thực tế mẫu/câu hỏi dẫn dắt khởi môn của SGK "Kết nối tri thức với cuộc sống" bài học này. Mô tả chi tiết việc học sinh quan sát tranh ảnh khởi đầu đặc thù trong SGK Kết nối tri thức. ${(aiAutoGames || cleanedGame) ? `Nếu có trò chơi "${cleanedGame || 'Khởi động'}" hãy mô tả GV tổ chức chơi để khởi động.` : 'Tuyệt đối không sử dụng trò chơi học tập khởi động nếu giáo viên tắt tùy chọn.'}
        - **Cách tiến hành:**
          - GV: "Chào đón các con học sinh yêu quý đến với buổi học đầy ắp tiếng cười hôm nay! Các con ơi, để mở đầu bài học một cách thật bùng nổ, Thầy/Cô mang đến một tình huống nhỏ như sau..." [Hãy viết chi tiết lời thoại trực tiếp của giáo viên dẫn dắt tình huống thú vị, đưa ví dụ thực tế liên hệ đời sống sinh động].
          - Học sinh: [Cả lớp đồng thanh reo hò hứng sướng, hướng ánh mắt long lanh quan sát tranh ảnh mở đầu trong sách giáo khoa mô tả bạn An, Minh hay Rô-bốt hóm hỉnh].
          - GV: "Thầy/Cô đố cả lớp từ ví dụ tình huống tuyệt vời trên, có con nào nảy sinh sáng kiến hay câu trả lời cho hộp câu đố này chưa?" [Lời thoại gợi ý dẫn bài sinh động].
          - Học sinh: [Học sinh thi đua giơ tay, tự tin đưa ra kiến giải thông thái hết sức ngộ nghĩnh và sâu sắc].
          - GV: "Câu trả lời của con xuất sắc chạm mốc 10 điểm! Thầy/Cô vô cùng khâm phục. Hãy cùng ghi nhận bài học thú vị hôm nay nào..." [Lời thoại ngọt ngào dứt khoát dẫn thẳng vào bài mới và ghi bảng].
          - Học sinh: [Học sinh hân hoan ghi tựa bài mới vào vở thật nắn nót, sạch sẽ].

        #### ${layoutOptions?.customActivity2 || 'Hoạt động 2: Khám phá, hình thành kiến thức'}
        - **Mục tiêu:** Giúp Học sinh lĩnh hội lý thuyết kiến thức mới cực kỳ sinh động thông qua khám phá các ĐỀ MỤC CHUẨN và TRANH ẢNH MINH HỌA của bài giảng trong cuốn SGK "Kết nối tri thức với cuộc sống", kèm hộp nhận thức ghi nhớ của bản gốc.
        - **Cách tiến hành:**
          - GV: "Bây giờ chúng ta sẽ cùng đặt chân lên đảo Khám phá! Thầy/Cô giao nhiệm vụ cho các nhóm như sau..." [Hãy viết chi tiết lời thoại trực tiếp của giáo viên giao nhiệm vụ cụ thể bám sát các đề mục tranh ảnh chuẩn của sách giáo khoa Kết nối tri thức với cuộc sống].
          - Học sinh: [Ổn định cơ cấu nhóm, hăng say quan sát hình minh họa, bảng biểu sinh động trong sách giáo khoa Kết nối tri thức để thảo luận hoàn thiện phiếu bài học].
          - GV: "Thầy/Cô thấy nhóm 1 đang thảo luận vô cùng sôi nổi, các con đã phát hiện ra điều gì thú vị trong bức tranh của bạn An và Minh chưa?" [Giáo viên di chuyển nhịp nhàng giữa các nhóm, nở nụ cười uốn nắn và mớm tri thức bằng các ví dụ trực quan dễ hiểu, gỡ khó tình huống lý thuyết phát sinh một cách ân cần].
          - Học sinh: [Đại diện nhóm đứng dậy trình bày tự tin sản phẩm thảo luận, các nhóm bạn chăm chú lắng nghe, hào hứng đặt câu hỏi phản biện đóng góp ý kiến].
          - GV: "Thầy/Cô vô cùng mãn nguyện trước trí tuệ siêu phàm của lớp mình! Chúng ta cùng chốt hạ viên ngọc kiến thức ghi nhớ cốt lõi nhé..." [Giáo viên tổng hợp, đúc rút lý thuyết chính thức bám sát SGK và ghi bảng hộp kiến thức cốt lõi].
          - Học sinh: [Học sinh lắng nghe GV chuẩn hóa lý thuyết chính thống và đóng khung hộp ghi chép vào vở thật cẩn thận, ngăn nắp].

        #### ${layoutOptions?.customActivity3 || 'Hoạt động 3: Luyện tập, thực hành'}
        - **Mục tiêu:** Học sinh thực thi bài tập, trả lời các nội dung định hướng, hoặc tiến hành thực hành trên máy tính dựa trên đúng bộ câu hỏi, bài tập kèm tranh vẽ phụ đề "Luyện tập" ở cuối bài học của SGK "Kết nối tri thức với cuộc sống".
        - **Cách tiến hành:**
          - GV: "Có tri thức trong tay, các dũng sĩ nhí hãy xông pha thách thức Đấu trường Luyện tập! Các con hãy cùng xử lý bài tập/nhiệm vụ số..." [Hãy viết giáo viên giao các bài củng cố lý thuyết hoặc bài tập Luyện tập có trong sách giáo khoa chi tiết với lời dẫn ngọt ngào].
          - Học sinh: [Tập trung cao độ giải quyết bài tập trong sách vào vở bài tập hoặc rèn luyện thực hành phím chuột trên máy tính theo đúng giáo trình].
          - GV: "Thầy/Cô thấy con ngồi rất chuẩn tư thế đấy, thẳng lưng lên một chút con nhé. Có gặp vướng mắc gì ở bước thực hành số 2 này không để Thầy/Cô chỉ dẫn lại nào?" [Giáo viên đi quanh lớp quan sát nụ cười nâng đỡ và chỉ dẫn, sửa sai tận tình cho từng học sinh].
          - Học sinh: [Tiếp thu bài nhanh chóng, tự hoàn thành bài thực hành tròn trịa, rực rỡ và báo cáo kết quả tự tin].
          - GV: "Thời gian đã điểm! Thầy/Cô mời dũng sĩ nhanh nhẹn nhất xung phong chiếu sản phẩm của mình lên màn hình tương tác nhé!" [Giáo viên nhận xét, chốt đáp án đúng và tuyên dương cộng sao thi đua].
          - Học sinh: [Vui sướng vỗ tay, tự khắc ghi kiến thức và hoàn tất chuẩn hóa, chữa bài tập vào vở].

        #### ${layoutOptions?.customActivity4 || 'Hoạt động 4: Vận dụng, trải nghiệm sáng tạo'}
        - **Mục tiêu:** Đưa kiến thức vào ứng dụng thực tế thông qua việc thực hiện bài tập/tình huống khám phá mở rộng, phân tích tranh thử thách trong mục "Vận dụng" ở cuối bài học của sách giáo khoa "Kết nối tri thức với cuộc sống" để liên hệ gia đình/đời sống.
        - **Cách tiến hành:**
          - GV: "Thách thức đỉnh cao cuối ngày: Huấn luyện kỹ năng thực tiễn từ mục Vận dụng! Thầy/Cô giao cho các con nhiệm vụ thú vị sau..." [Giáo viên giao thử thách vận dụng của sách giáo khoa liên hệ đời sống thực tiễn phong phú].
          - Học sinh: [Đồng thanh ghi nhận nhiệm vụ, nghiên cứu tự liên hệ đời sống bản thân, suy nghĩ tìm các giải pháp vận dụng thiết thực].
          - GV: "Để ăn mừng một buổi học thắng lợi, Thầy/Cô mời các dũng sĩ cùng tham gia tranh tài một trò chơi đố vui siêu tốc nhé!" [Giáo viên tổ chức trò chơi củng cố lý thú như Rung Chuông Vàng, Ai là Triệu Phú để chốt nhanh bài học sinh động].
          - Học sinh: [Bùng nổ năng lượng chơi hết mình, hò vang sung sướng chào đón kỷ niệm đáng nhớ].
          - GV: "Tiết học của chúng ta trôi qua thật kỳ diệu! Thầy/Cô đánh giá cao tinh thần tự học xuất sắc của cả lớp nỗ lực 100%. Về nhà các con nhớ hoàn tất vận dụng và ngó trước bài học của tiết tiếp theo nhé. Chào tạm biệt các con học sinh ngoan!" [Lời dặn dò dạt dào yêu thương sư phạm].
          - Học sinh: [Cúi chào Giáo viên chuẩn tác phong học đường nghiêm trang, sắp xếp gọn gàng ngăn nắp sách vở hân hoan ra về].`;
        }
      }

      let attachmentsContext = "";
      if (extractedTextSections.length > 0) {
        attachmentsContext = `
================================================================================
TÀI LIỆU ĐÍNH KÈM MINH HỌA (ẢNH SGK, PPT, WORD MẪU) - NGUỒN CĂN CỨ TỐI THƯỢNG BẮT BUỘC BÁM SÁT 100%:
Thầy Cô đã tải lên tệp tài liệu đính kèm minh họa. Bạn PHẢI BÁM SÁT TUYỆT ĐỐI 100% nội dung sau đây cho CẢ HAI TIẾT (đọc trọn vẹn toàn bộ các trang, tên bài, thứ tự đề mục 1, 2, a, b, các hoạt động khám phá, câu hỏi, bài tập, tình huống):
- ĐẶC BIỆT ĐỐI VỚI TIẾT 2: Tiết 2 BẮT BUỘC phải bám sát chính xác các trang tiếp theo / nửa sau bài học trong tài liệu đính kèm hoặc sách giáo khoa (các đề mục kiến thức tiếp nối, câu hỏi, tranh ảnh và bài tập luyện tập, vận dụng tương ứng với Tiết 2 của bài học đó). Tuyệt đối không được bỏ sót kiến thức của tài liệu đính kèm và không làm sai lệch kiến thức!
${extractedTextSections.join('\n\n')}
================================================================================\n`;
      } else if (imageInlineDataParts.length > 0) {
        attachmentsContext = `
================================================================================
TÀI LIỆU ĐÍNH KÈM MINH HỌA (HÌNH ẢNH TRANG SGK / TÀI LIỆU MINH HỌA) - BÁM SÁT 100%:
Thầy Cô đã gửi kèm hình ảnh chụp trang SGK / tài liệu minh họa (được đính kèm trong yêu cầu này). Bạn PHẢI quan sát kỹ hình ảnh, đọc nội dung chữ, các đề mục, tranh vẽ và bài tập trong hình ảnh để soạn giáo án BÁM SÁT TUYỆT ĐỐI 100% theo ảnh đó cho CẢ HAI TIẾT!
- ĐẶC BIỆT ĐỐI VỚI TIẾT 2: BẮT BUỘC phải khai thác chính xác các trang ảnh tiếp theo, đề mục kiến thức và bài tập thuộc nửa sau bài học từ tài liệu đính kèm. Tuyệt đối không được bỏ sót!
================================================================================\n`;
      }

      const pedagogicalRules = layoutOptions?.isBasic
        ? `QUY TẮC SƯ PHẠM VÀNG CHO TRÌNH SOẠN THẢO AI (FLASH 3 PREVIEW) - GIÁO ÁN CƠ BẢN (ĐẠT CHUẨN XUẤT SẮC CÔNG VĂN 2345):
0. **NGUYÊN TẮC BÁM SÁT CHƯƠNG TRÌNH & ƯU TIÊN TÀI LIỆU ĐÍNH KÈM**:
   - Trình soạn thảo AI (Flash 3 preview) bám sát tuyệt đối nội dung thuộc chương trình môn học. Có thể tra cứu sách trực tiếp tại cổng thông tin tập huấn của Nhà xuất bản Giáo dục Việt Nam: taphuan.nxbgd.vn.
   - NẾU CÓ TÀI LIỆU ĐÍNH KÈM MINH HỌA (ẢNH SGK, PPT, WORD MẪU) THÌ TRÌNH SOẠN THẢO AI (FLASH 3 PREVIEW) ƯU TIÊN BÁM SÁT TUYỆT ĐỐI NỘI DUNG THEO TÀI LIỆU ĐÍNH KÈM MINH HỌA (ẢNH SGK, PPT, WORD MẪU) 100%.
1. **BIÊN SOẠN CÁC MỤC THEO ĐÚNG TÙY CHỌN ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN"**:
   - 1. Năng lực đặc thù: AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản".
   - 2. Năng lực chung: AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản".
   - 3. Phẩm chất: AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản".
   - II. ĐỒ DÙNG DẠY HỌC: AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản".
   - Ứng dụng công nghệ số: Phù hợp với bài học trong giáo án (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản").
   - Kết hợp trò chơi học tập: Phù hợp với bài học trong giáo án (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản").
   - Phương pháp sư phạm: Phù hợp với bài học trong giáo án (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản").
   - Năng lực Trí tuệ nhân tạo (AI): tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản").
2. **HOẠT ĐỘNG CỦA GIÁO VIÊN: NGẮN GỌN, ĐỦ Ý, ĐI THẲNG VÀO CÂU HỎI HOẶC THAO TÁC CỤ THỂ**:
   - Đi thẳng vào câu hỏi hoặc nhiệm vụ giao cho học sinh. Không dùng lời dẫn rườm rà, lê thê chào đón học sinh hay lời thoại mang tính kịch bản sân khấu dài dòng.
   - Ví dụ: Thay vì viết "Các con hãy nhìn vào mục 1 trong SGK. Tiếng chuông báo thức đã cho Minh biết điều gì? Từ điều đó Minh đã làm gì?" thì viết thành "Tiếng chuông báo thức đã cho Minh biết điều gì? Từ điều đó Minh đã làm gì?".
3. **HOẠT ĐỘNG CỦA HỌC SINH: NGẮN GỌN, ĐÚNG HÀNH ĐỘNG HỌC TẬP**:
   - Sử dụng các câu hoạt động ngắn gọn, chuẩn mực như: "Học sinh lắng nghe.", "Học sinh ghi tựa bài vào vở.", "Học sinh quan sát tranh.", "Học sinh tích cực thảo luận nhóm.", "Học sinh tìm câu trả lời.", "Học sinh chia sẻ ý kiến với bạn.", "Học sinh lắng nghe và quan sát sơ đồ.", "Học sinh tập trung lắng nghe giáo viên hướng dẫn."
4. **BÁM SÁT TUYỆT ĐỐI NỘI DUNG TÀI LIỆU ĐÍNH KÈM MINH HỌA (ẢNH SGK, PPT, WORD MẪU)**:
   - Với Bài 1 "Thông tin và quyết định": Tiết 1 bám sát chủ đề "Thông tin và quyết định" (gồm các mục con: 1. Tìm hiểu thông tin và quyết định, 2. Vai trò của thông tin trong quyết định). Tiết 2 BẮT BUỘC có nội dung "Ba dạng thông tin thường gặp" (dạng chữ, dạng hình ảnh, dạng âm thanh) với tiêu đề "#### TIẾT 2: BA DẠNG THÔNG TIN THƯỜNG GẶP". Tuyệt đối không được bỏ sót!
5. **BIÊN SOẠN ĐẦY ĐỦ CẤU TRÚC ĐẦU TIẾT 2 GIỐNG HỆT TIẾT 1 VÀ ĐƯA SANG TRANG MỚI**:
   - Bắt buộc đưa toàn bộ nội dung Tiết 2 sang trang mới (dùng dòng '---' hoặc phân tiết rõ ràng).
   - Đầu Tiết 2 nằm trên bảng "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:" phải có đầy đủ:
     + Khối thông tin đầu bài học: KẾ HOẠCH BÀI DẠY / Môn học: ${subject} - Lớp ${grade} / ${title} (Tiết 2)
     + Mục I. YÊU CẦU CẦN ĐẠT: Đầy đủ 1. Năng lực đặc thù (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản"); 2. Năng lực chung (AI biên soạn theo các mục đã chọn tại thẻ "giáo án cơ bản"); 3. Phẩm chất (Chăm chỉ, Trách nhiệm, Trung thực).
     + Mục II. ĐỒ DÙNG DẠY HỌC: Đầy đủ Đồ dùng của Giáo viên và Học sinh cho Tiết 2.
     + Mục III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU: Bảng 4 hoạt động của Tiết 2.
     + Mục IV. ĐIỀU CHỈNH SAU BÀI DẠY: Những điều đã thực hiện tốt, Những điều cần rút kinh nghiệm.
6. **HOẠT ĐỘNG 2 KHÁM PHÁ CÓ CÁC MỤC CON (1., 2.) DỰA THEO TÀI LIỆU ĐÍNH KÈM**:
   - Tiêu đề mục con được ghi trên một dòng riêng biệt (ví dụ: "1. Tìm hiểu thông tin và quyết định:"), sau đó là các cặp dòng đối thoại "- GV:" và "- HS:" tương ứng.`
        : `QUY TẮC SƯ PHẠM VÀNG ĐẠT TIÊU CHUẨN XUẤT SẮC (ĐIỂM ĐÁNH GIÁ >= 90% TRÊN TOÀN QUỐC):
0. **NGUYÊN TẮC BÁM SÁT CHƯƠNG TRÌNH & ƯU TIÊN TÀI LIỆU ĐÍNH KÈM**:
   - Trình soạn thảo AI (Flash 3 preview) bám sát tuyệt đối nội dung thuộc chương trình môn học. Có thể tra cứu sách trực tiếp tại cổng thông tin tập huấn của Nhà xuất bản Giáo dục Việt Nam: taphuan.nxbgd.vn.
   - NẾU CÓ TÀI LIỆU ĐÍNH KÈM MINH HỌA (ẢNH SGK, PPT, WORD MẪU) THÌ TRÌNH SOẠN THẢO AI (FLASH 3 PREVIEW) ƯU TIÊN BÁM SÁT TUYỆT ĐỐI NỘI DUNG THEO TÀI LIỆU ĐÍNH KÈM MINH HỌA (ẢNH SGK, PPT, WORD MẪU) 100%.
1. **LỜI THOẠI KHƠI MỞ DẪN DẮT CHI TIẾT ĐẾN TỪNG CÂU CHỮ**: Đối với tất cả hoạt động, phần Cách tiến hành KHÔNG ĐƯỢC dùng các mô tả trần thuật chung chung hoặc viết tắt như "GV gọi...", "GV hỏi...", "GV giới thiệu...". Thay vào đó, bạn **bắt buộc phải ghi nguyên văn kịch bản lời thoại, lời dẫn dắt chi tiết trực tiếp rất truyền cảm hứng của Giáo viên** (Đặt trong dấu ngoặc kép hoặc định dạng GV: "..."). Giáo viên luôn có câu nói kết nối chuyển ý hết sức ngọt ngào, hóm hỉnh cho từng hoạt động nhỏ khiến cả tiết học trôi chảy liên tục như một thước phim điện ảnh sư phạm hấp dẫn học sinh.
2. **KẾT CẤU CHỨA NHIỀU TÌNH HUỐNG THỰC TẾ & VÍ DỤ GỢI MỞ BÁM SÁT CHƯƠNG TRÌNH**:
   - Ở mỗi hoạt động dạy học (Đặc biệt là Khởi động và Khám phá), bạn cần lồng ghép tối thiểu 2 tình huống học tập phát sinh thực tế đời thường, gần gũi và ngộ nghĩnh đối với lứa tuổi Tiểu học (ví dụ: các thắc mắc vui nhộn, cuộc trò chuyện thực tế gắn liền với các nhân vật quen thuộc An, Minh, Khoa, bạn Nam, bạn Mai và bạn Rô-bốt thông minh của bộ sách Kết nối tri thức để kích hoạt trí tò mò của học sinh dẫn vào chủ đề).
   - Mỗi khái niệm lý thuyết cốt lõi đưa ra phải được minh họa bằng ít nhất 2 ví dụ trực quan sinh động (ví dụ: mô tả trực quan bức tranh của SGK, hộp thông tin, bàn phím màu sắc, chuột máy tính hay các ứng dụng phần mềm quen thuộc) để học sinh dễ dàng hình dung và tự rút ra kiến thức tự học.
3. **KỊCH BẢN ĐỐI THOẠI SONG HÀNH BẢNG 2 CỘT DÀY DẶN**: Toàn bộ Cách tiến hành trong giáo án chi tiết phải có tiến trình đối thoại cực kỳ chi tiết, sinh động giữa "- GV:" và "- Học sinh:". Mỗi hoạt động lớn tối thiểu phải có 3-4 cặp đối thoại "- GV:" - "- Học sinh:" xen kẽ nhau dài dặn, sâu sắc, lột tả được không khí lớp học sôi động, học sinh hào hứng phát biểu và phản biện lẫn nhau lịch sự khoa học.`;

      const isGDPT2018Detailed = layoutOptions?.mode === 'gdpt2018_detailed' || layoutOptions?.isGDPT2018Detailed;
      const isGDPT2018 = layoutOptions?.mode === 'gdpt2018' || layoutOptions?.isGDPT2018 || isGDPT2018Detailed;
      const isBasic = (layoutOptions?.isBasic || layoutOptions?.mode === 'basic') && !isGDPT2018;

      const cleanGradeNum = String(grade || '').replace(/lớp\s*/i, '').trim() || '3';
      const defaultSgk = `Sách giáo khoa ${subject} ${cleanGradeNum}`;
      const defaultLecture = 'Bài giảng điện tử';

      // GDPT 2018: Năng lực đặc thù
      const gdptSpecificList: string[] = [];
      if (Array.isArray(specificCompetencies) && specificCompetencies.length > 0) {
        gdptSpecificList.push(...specificCompetencies);
      } else if (Array.isArray(competencies)) {
        const specMatches = competencies.filter((c: string) =>
          ['năng lực ai (theo qđ 3439)', 'năng lực số', 'ngôn ngữ', 'tính toán', 'khoa học', 'công nghệ', 'tin học', 'thẩm mỹ', 'thể chất'].includes(c.toLowerCase())
        );
        gdptSpecificList.push(...specMatches);
      }
      if (aiPowerup && !gdptSpecificList.some(c => c.toLowerCase().includes('3439'))) {
        gdptSpecificList.unshift('Năng lực AI (theo QĐ 3439)');
      }
      if (customSpecificCompetency?.trim()) {
        gdptSpecificList.push(customSpecificCompetency.trim());
      }
      if (gdptSpecificList.length === 0) {
        const sub = subject.toLowerCase();
        if (sub.includes('tin học')) gdptSpecificList.push('Tin học', 'Năng lực số');
        else if (sub.includes('thể chất') || sub.includes('gdtc')) gdptSpecificList.push('Thể chất');
        else if (sub.includes('toán')) gdptSpecificList.push('Tính toán');
        else if (sub.includes('tiếng việt')) gdptSpecificList.push('Ngôn ngữ');
        else if (sub.includes('khoa học') || sub.includes('tự nhiên')) gdptSpecificList.push('Khoa học');
        else if (sub.includes('công nghệ')) gdptSpecificList.push('Công nghệ');
        else if (sub.includes('mỹ thuật') || sub.includes('âm nhạc')) gdptSpecificList.push('Thẩm mỹ');
        else gdptSpecificList.push('Năng lực số');
      }

      const is1Tiet = parsedDurationNum === 1 || String(duration || '').toLowerCase().includes('1 tiết');

      const hasAiOption = gdptSpecificList.some(c => c.toLowerCase().includes('3439') || c.toLowerCase().includes('năng lực ai')) || Boolean(aiPowerup);
      const hasDigitalOption = Boolean(aiAutoCompetency) || gdptSpecificList.some(c => c.toLowerCase().includes('năng lực số') || c.toLowerCase().includes('số'));

      let gdptSpecificPrompt = "";
      if (aiAutoCompetency) {
        gdptSpecificPrompt = `(BẬT tùy chọn "AI tự đề xuất" Năng lực cần phát triển: Công cụ AI Flash 3 preview BẮT BUỘC dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các Năng lực cần phát triển phù hợp nhất với giáo án của bài học môn ${subject} lớp ${grade}. Không phụ thuộc vào các tùy chọn thủ công đã chọn. Các yêu cầu bắt đầu bằng động từ hành động: Nêu được, Nhận biết được, Phân biệt được, Thực hiện được...):
- [Nêu yêu cầu cần đạt cụ thể 1 của môn ${subject}: bắt đầu bằng động từ hành động Nêu được, Nhận biết được, Phân biệt được, Trình bày được... bám sát SGK / tài liệu đính kèm]
- [Nêu yêu cầu cần đạt cụ thể 2 của môn ${subject}: Nhận biết được... trong các ví dụ cụ thể bám sát SGK / tài liệu đính kèm]
- [Nêu yêu cầu cần đạt cụ thể 3 bám sát nội dung bài học...]
${hasAiOption ? `- **Năng lực AI (${cleanGradeNum}.Mã chủ đề.STT)**: [BẮT BUỘC sử dụng công cụ AI Flash 3 preview tích hợp Năng lực AI theo quy ước mã hóa QĐ 2422/QĐ-BGDĐT: [Lớp].[Mã chủ đề].[Số thứ tự], ví dụ "**Năng lực AI (${cleanGradeNum}.A1.2)**: ...". Trong đó [Lớp] là ${cleanGradeNum}; [Mã chủ đề] gồm chữ in hoa A, B, C, D chỉ mạch nội dung chính kèm chữ số chỉ chủ đề thành phần; [Số thứ tự] là số tự nhiên 1, 2, 3... cho nội dung cốt lõi hoặc thêm tiền tố MR trước số thứ tự đối với nội dung mở rộng như ${cleanGradeNum}.A1.MR1. Nêu rõ yêu cầu cần đạt tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số phù hợp nhất với bài học]` : ''}
${hasDigitalOption ? `- **Năng lực số ([Miền].[Thành phần].[Mức độ][Chỉ báo])**: [BẮT BUỘC sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên tài liệu đính kèm) để đưa ra năng lực số phù hợp bài học theo quy ước mã hóa Thông tư 02/2025/TT-BGDĐT: [Miền năng lực].[Năng lực thành phần].[Mức độ].[Chỉ báo cụ thể], ví dụ "**Năng lực số (1.1.CB1a)**: ...". Trong đó [Miền năng lực] từ 1 đến 6; [Năng lực thành phần] là chữ số; [Mức độ] là CB, NC hoặc bậc 1-8; [Chỉ báo cụ thể] là chữ thường a, b, c...]` : ''}`;
      } else {
        const lines: string[] = [];
        lines.push(`(Tích hợp vào mục "1. Năng lực đặc thù" với các tùy chọn đã chọn sau: ${gdptSpecificList.join('; ')}):`);
        lines.push(`- [Nêu yêu cầu cần đạt trọng tâm của môn ${subject} lớp ${cleanGradeNum} bám sát nội dung bài học, bắt đầu bằng động từ hành động: Nêu được, Nhận biết được, Phân biệt được, Thực hiện được...]`);
        lines.push(`- [Nêu yêu cầu cần đạt cụ thể 2 bám sát SGK / tài liệu đính kèm...]`);
        if (hasAiOption) {
          lines.push(`- **Năng lực AI (${cleanGradeNum}.Mã chủ đề.STT)**: [BẮT BUỘC sử dụng công cụ AI Flash 3 preview tích hợp Năng lực AI vào mục "1. Năng lực đặc thù" theo quy ước mã hóa QĐ 2422/QĐ-BGDĐT: [Lớp].[Mã chủ đề].[Số thứ tự], ví dụ "**Năng lực AI (${cleanGradeNum}.A1.2)**: ...". Trong đó [Lớp] là ${cleanGradeNum}; [Mã chủ đề] gồm chữ in hoa A, B, C, D chỉ mạch nội dung chính kèm chữ số chỉ chủ đề thành phần; [Số thứ tự] là số tự nhiên 1, 2, 3... cho nội dung cốt lõi hoặc thêm tiền tố MR trước số thứ tự đối với nội dung mở rộng như ${cleanGradeNum}.A1.MR1. Nêu rõ yêu cầu cần đạt tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số phù hợp nhất với bài học]`);
        }
        if (hasDigitalOption) {
          lines.push(`- **Năng lực số ([Miền].[Thành phần].[Mức độ][Chỉ báo])**: [BẮT BUỘC sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên tài liệu đính kèm) để đưa ra năng lực số phù hợp với bài học theo quy ước mã hóa Thông tư 02/2025/TT-BGDĐT: [Miền năng lực].[Năng lực thành phần].[Mức độ].[Chỉ báo cụ thể], ví dụ "**Năng lực số (1.1.CB1a)**: ...". Trong đó [Miền năng lực] từ 1 đến 6 (Khai thác dữ liệu/thông tin, Giao tiếp và hợp tác, Sáng tạo nội dung số, An toàn, Giải quyết vấn đề, Trí tuệ nhân tạo); [Năng lực thành phần] là chữ số; [Mức độ] là CB, NC hoặc bậc 1-8; [Chỉ báo cụ thể] là chữ thường a, b, c...]`);
        }
        const otherSpecs = gdptSpecificList.filter(c => !c.toLowerCase().includes('3439') && !c.toLowerCase().includes('ai') && !c.toLowerCase().includes('số'));
        if (otherSpecs.length > 0) {
          lines.push(`- [Biểu hiện cụ thể của năng lực đặc thù: ${otherSpecs.join(', ')} gắn liền với nội dung bài học]`);
        }
        gdptSpecificPrompt = lines.join('\n');
      }

      // GDPT 2018: Năng lực chung
      const gdptGeneralList: string[] = [];
      if (Array.isArray(generalCompetencies) && generalCompetencies.length > 0) {
        gdptGeneralList.push(...generalCompetencies);
      } else if (Array.isArray(competencies)) {
        const genMatches = competencies.filter((c: string) =>
          ['tự chủ và tự học', 'giao tiếp và hợp tác', 'giải quyết vấn đề và sáng tạo'].includes(c.toLowerCase())
        );
        gdptGeneralList.push(...genMatches);
      }
      if (gdptGeneralList.length === 0) {
        gdptGeneralList.push('Tự chủ và tự học', 'Giao tiếp và hợp tác', 'Giải quyết vấn đề và sáng tạo');
      }

      let gdptGeneralPrompt = "";
      if (aiAutoCompetency) {
        gdptGeneralPrompt = `(BẬT tùy chọn "AI tự đề xuất" Năng lực cần phát triển: Công cụ AI Flash 3 preview BẮT BUỘC dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các năng lực chung phù hợp nhất với hoạt động dạy học của bài học. Không phụ thuộc vào các tùy chọn thủ công đã chọn):
- **Tự chủ và tự học:** [Học sinh tự quan sát các tình huống trong sách giáo khoa, tự đưa ra các ví dụ về ... của bản thân trong cuộc sống.]
- **Giao tiếp và hợp tác:** [Thảo luận nhóm/cặp đôi để phân biệt ..., cùng nhau nhận diện ... trong môi trường xung quanh.]
- **Giải quyết vấn đề và sáng tạo:** [Biết dựa vào thông tin/kiến thức thu nhận được để đưa ra những quyết định/giải pháp hợp lý trong các tình huống thực tế.]`;
      } else {
        const lines: string[] = [];
        lines.push(`(Tích hợp vào mục "2. Năng lực chung" với một trong các tùy chọn đã chọn sau: ${gdptGeneralList.join('; ')}):`);
        if (gdptGeneralList.some(c => c.toLowerCase().includes('tự chủ'))) {
          lines.push(`- **Tự chủ và tự học:** [Học sinh tự quan sát các tình huống trong sách giáo khoa, tự đưa ra các ví dụ về ... của bản thân trong cuộc sống.]`);
        }
        if (gdptGeneralList.some(c => c.toLowerCase().includes('giao tiếp'))) {
          lines.push(`- **Giao tiếp và hợp tác:** [Thảo luận nhóm/cặp đôi để phân biệt ..., cùng nhau nhận diện ... trong môi trường xung quanh.]`);
        }
        if (gdptGeneralList.some(c => c.toLowerCase().includes('giải quyết'))) {
          lines.push(`- **Giải quyết vấn đề và sáng tạo:** [Biết dựa vào thông tin/kiến thức thu nhận được để đưa ra những quyết định/giải pháp hợp lý trong các tình huống thực tế.]`);
        }
        gdptGeneralPrompt = lines.join('\n');
      }

      // GDPT 2018: Phẩm chất
      const gdptQualitiesList: string[] = [];
      if (Array.isArray(qualities) && qualities.length > 0) {
        gdptQualitiesList.push(...qualities);
      } else {
        gdptQualitiesList.push('Chăm chỉ', 'Trách nhiệm', 'Trung thực');
      }

      let gdptQualitiesPrompt = "";
      if (aiAutoCompetency) {
        gdptQualitiesPrompt = `(BẬT tùy chọn "AI tự đề xuất" Năng lực cần phát triển: Công cụ AI Flash 3 preview BẮT BUỘC dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các phẩm chất phù hợp nhất với giáo án của bài học môn ${subject} lớp ${cleanGradeNum}. Không phụ thuộc vào các tùy chọn thủ công đã chọn):
- **Chăm chỉ:** [Học sinh tích cực tham gia các hoạt động học tập, chăm chú quan sát và hoàn thành nhiệm vụ bài học.]
- **Trách nhiệm:** [Có trách nhiệm trong hoạt động nhóm, hoàn thành nhiệm vụ được phân công và giữ gìn đồ dùng học tập.]
- **Trung thực:** [Thật thà, khách quan trong việc chia sẻ ý kiến, báo cáo trung thực kết quả bài làm và đánh giá sản phẩm của bạn.]`;
      } else {
        gdptQualitiesPrompt = `(Tích hợp vào mục "3. Phẩm chất" BẮT BUỘC có ĐẦY ĐỦ 100% CẢ ${gdptQualitiesList.length} phẩm chất đã chọn sau: ${gdptQualitiesList.join('; ')}. TUYỆT ĐỐI KHÔNG ĐƯỢC BỎ BỚT, KHÔNG ĐƯỢC CHỈ XUẤT HIỆN 2/3):
${gdptQualitiesList.map(q => {
  if (q.toLowerCase() === 'chăm chỉ') return `- **Chăm chỉ:** Tích cực tham gia các hoạt động học tập, chăm chú quan sát và hoàn thành nhiệm vụ bài học.`;
  if (q.toLowerCase() === 'trách nhiệm') return `- **Trách nhiệm:** Có trách nhiệm trong hoạt động nhóm, hoàn thành nhiệm vụ được phân công và giữ gìn đồ dùng học tập.`;
  if (q.toLowerCase() === 'trung thực') return `- **Trung thực:** Thật thà, khách quan trong việc chia sẻ ý kiến, báo cáo trung thực kết quả bài làm và đánh giá sản phẩm của bạn.`;
  if (q.toLowerCase() === 'nhân ái') return `- **Nhân ái:** Biết tôn trọng, lắng nghe và sẵn sàng chia sẻ, giúp đỡ bạn bè trong giờ học.`;
  if (q.toLowerCase() === 'yêu nước') return `- **Yêu nước:** Yêu thích việc tìm hiểu kiến thức môn học, có ý thức giữ gìn và phát huy các giá trị tốt đẹp.`;
  return `- **${q}:** [Mô tả biểu hiện cụ thể của học sinh gắn liền với bài học]`;
}).join('\n')}`;
      }

      // GDPT 2018: Đồ dùng dạy học
      const gdptToolsList: string[] = [];
      if (Array.isArray(tools) && tools.length > 0) {
        gdptToolsList.push(...tools);
      } else {
        gdptToolsList.push('Máy chiếu', 'Bài giảng điện tử', 'Máy tính', 'Tranh ảnh');
      }

      const gvItems: string[] = [];
      const hasSGK = gdptToolsList.some(t => t.toLowerCase().includes('sách giáo khoa') || t.toLowerCase().includes('sgk'));
      const hasTranhAnh = gdptToolsList.some(t => t.toLowerCase().includes('tranh ảnh'));

      gdptToolsList.forEach(t => {
        const tLower = t.trim().toLowerCase();
        if (tLower === 'máy chiếu' || tLower.includes('máy chiếu')) {
          if (!gvItems.includes('Máy chiếu')) gvItems.push('Máy chiếu');
        } else if (tLower === 'máy tính' || tLower.includes('máy tính')) {
          if (!gvItems.includes('Máy tính')) gvItems.push('Máy tính');
        } else if (tLower.includes('sách giáo khoa') || tLower.startsWith('sgk')) {
          const sgkText = `Sách giáo khoa ${subject} ${cleanGradeNum}`;
          if (!gvItems.includes(sgkText)) gvItems.push(sgkText);
        } else if (tLower.includes('bài giảng') || tLower === 'bài giảng') {
          if (!gvItems.includes('Bài giảng điện tử')) gvItems.push('Bài giảng điện tử');
        } else if (tLower.includes('tranh ảnh') || tLower === 'tranh ảnh') {
          if (!gvItems.includes('Tranh ảnh SGK Trang *')) gvItems.push('Tranh ảnh SGK Trang *');
        } else {
          if (!gvItems.includes(t)) gvItems.push(t);
        }
      });

      // Default fallback if empty
      if (gvItems.length === 0) {
        gvItems.push('Máy chiếu', 'Bài giảng điện tử', 'Máy tính', 'Tranh ảnh SGK Trang *');
      }

      let gdptToolsPrompt = "";
      const teacherItemsJoined = gvItems.join(', ');

      if (aiAutoTools) {
        gdptToolsPrompt = `(BẬT tùy chọn "AI tự đề xuất": Công cụ AI Flash 3 preview BẮT BUỘC dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các đồ dùng dạy học phù hợp nhất với giáo án của bài học đó. Không phụ thuộc vào các tùy chọn thủ công đã chọn. Chỉ thay đổi với mục giáo viên: Máy chiếu, Bài giảng điện tử, Máy tính, Phòng máy tính, kèm Tranh ảnh SGK Trang * với số trang và hình cụ thể nếu có. TUYỆT ĐỐI KHÔNG thêm ứng dụng số hay trò chơi vào đây):
- Giáo viên: [Công cụ AI Flash 3 preview tự đề xuất đồ dùng dạy học phù hợp nhất cho giáo viên bám sát bài học từ tài liệu đính kèm minh họa hoặc taphuan.nxbgd.vn: Máy chiếu, Bài giảng điện tử, Máy tính, Tranh ảnh SGK Trang *...].
- Học sinh: SGK ${subject} ${cleanGradeNum}, VBT ${subject} ${cleanGradeNum}, vở ghi, dụng cụ học tập.`;
      } else {
        gdptToolsPrompt = `- Giáo viên: ${teacherItemsJoined}.
- Học sinh: SGK ${subject} ${cleanGradeNum}, VBT ${subject} ${cleanGradeNum}, vở ghi, dụng cụ học tập.`;
      }

      let prompt = "";

      if (isGDPT2018) {
        prompt = `Bạn là chuyên gia xây dựng Kế hoạch bài dạy tiểu học theo Chương trình GDPT 2018, có kinh nghiệm thiết kế giáo án theo định hướng phát triển phẩm chất, năng lực học sinh, chuẩn Công văn 2345/BGDĐT-GDTH.
Sử dụng mô hình AI Gemini 3 Flash Preview. Hãy xây dựng một KẾ HOẠCH BÀI DẠY hoàn chỉnh bám sát TUYỆT ĐỐI cấu trúc, văn phong và phương pháp sư phạm chuẩn mực Công văn 2345/BGDĐT-GDTH và tài liệu/bài học tôi cung cấp.
${isGDPT2018Detailed ? `
==================================================
🌟 YÊU CẦU ĐẶC BIỆT DÀNH CHO "GIÁO ÁN GDPT 2018 CHI TIẾT" (PHỤC VỤ DỰ GIỜ, THAO GIẢNG GIÁO VIÊN DẠY GIỎI):
==================================================
Bạn đang biên soạn Kế hoạch bài dạy GDPT 2018 dạng CHI TIẾT, ĐẶC BIỆT DÀNH CHO CÁC TIẾT DỰ GIỜ, HỘI GIẢNG, THAO GIẢNG GIÁO VIÊN DẠY GIỎI CÁC CẤP (TRƯỜNG, QUẬN, TỈNH).
BẮT BUỘC SỬ DỤNG CÔNG CỤ AI FLASH 3 PREVIEW THỰC HIỆN ĐẦY ĐỦ CÁC BƯỚC, PHÂN RÃ KỊCH BẢN CHI TIẾT 2 VAI ĐỐI THOẠI SONG HÀNH GIỮA GIÁO VIÊN & HỌC SINH:
1. ĐẦY ĐỦ CÁC BƯỚC: Ở mọi hoạt động khám phá và luyện tập, BẮT BUỘC thực hiện đầy đủ, tường minh 4 bước tiến hành chuẩn mực Công văn 2345:
   + Bước 1: Giao nhiệm vụ học tập (mô tả rõ thao tác, phương tiện và câu lệnh giao việc của GV).
   + Bước 2: Thực hiện nhiệm vụ học tập (mô tả chi tiết hoạt động tìm tòi, quan sát, thảo luận cặp đôi/nhóm, cách GV hỗ trợ, gợi mở cho học sinh).
   + Bước 3: Báo cáo kết quả và thảo luận (mô tả chi tiết học sinh đứng lên báo cáo, trình bày, chia sẻ trước lớp; các nhóm khác lắng nghe, nhận xét chéo, bổ sung hoặc phản biện lịch sự).
   + Bước 4: Kết luận, nhận định và chuẩn hóa kiến thức (GV nhận xét, chuẩn hóa kiến thức, chốt lại Hộp kiến thức; HS ghi nhớ, khắc sâu và đóng khung Hộp kiến thức vào vở).
2. PHÂN RÃ KỊCH BẢN CHI TIẾT 2 VAI ĐỐI THOẠI SONG HÀNH (ĐẶT LỜI THOẠI TRONG NGOẶC KÉP "..."):
   - Tuyệt đối không được tóm tắt chung chung hay chỉ ghi hành động ngắn ngủi! Toàn bộ tiến trình dạy học phải là một KỊCH BẢN ĐỐI THOẠI 2 VAI SỐNG ĐỘNG, TỈ MỈ:
   - Cột GIÁO VIÊN: Phân rã chi tiết từng lời giảng, lời dẫn dắt, hệ thống câu hỏi gợi mở, lời nhận xét động viên ĐỀU ĐƯỢC ĐẶT TRONG NGOẶC KÉP "..." (Ví dụ: + **Bước 1:** GV mỉm cười, chiếu bức tranh và đặt câu hỏi dẫn dắt: "Các em hãy quan sát kỹ tranh trên màn hình và cho Thầy/Cô biết: ...?", + **Bước 2:** Sử dụng **phương pháp vấn đáp**: GV đặt câu hỏi gợi ý: "...?", + **Bước 3:** GV gọi đại diện: "Thầy mời bạn An đại diện nhóm 1 trình bày kết quả thảo luận của nhóm mình.", + **Bước 4:** GV chốt lại **Hộp kiến thức**: "...").
   - Cột HỌC SINH: Phân rã chi tiết lời đáp trả lời chuẩn mực, lễ phép của học sinh ĐỀU ĐƯỢC ĐẶT TRONG NGOẶC KÉP "..." (Ví dụ: - **Bước 1:** HS chăm chú quan sát tranh, xung phong trả lời: "Thưa Thầy/Cô, con quan sát thấy...", - **Bước 2:** HS suy nghĩ và thảo luận sôi nổi cùng bạn, trả lời: "Thưa Thầy/Cô, theo con thì...", - **Bước 3:** Đại diện HS nhóm 1 tự tin đứng lên báo cáo: "Thưa Thầy/Cô và các bạn, nhóm con đã thảo luận và thống nhất: ...", HS các nhóm khác chú ý theo dõi và nhận xét: "Con đồng ý với ý kiến của nhóm bạn và muốn bổ sung thêm...", - **Bước 4:** HS chú ý quan sát, khắc sâu và ghi/đóng khung **Hộp kiến thức** vào vở).
3. ĐÁP ỨNG TIÊU CHÍ DỰ GIỜ, THAO GIẢNG GIÁO VIÊN DẠY GIỎI:
   - Kịch bản đối thoại toát lên sự chuẩn mực sư phạm xuất sắc (từ 90 điểm trở lên), sự tương tác nhịp nhàng, tự nhiên giữa Thầy và Trò.
   - Thể hiện rõ kỹ năng phân hóa học sinh (khen ngợi học sinh tiếp thu nhanh, nâng đỡ học sinh còn lúng túng).
   - Tích hợp nhuần nhuyễn phương pháp dạy học tích cực, công nghệ số và phát triển phẩm chất năng lực học sinh.
` : ''}

YÊU CẦU CỐT LÕI CỦA GIÁO ÁN CHUẨN CÔNG VĂN 2345:
1. Bám sát tuyệt đối nội dung bài học, sách giáo khoa và tài liệu tôi cung cấp.
2. Không tự ý thay đổi kiến thức cốt lõi của bài; không đưa kiến thức vượt quá chuẩn cấp học.
3. Không sao chép máy móc nội dung SGK; chuyển hóa thành các hoạt động dạy học tích cực, sinh động và có tính khả thi cao trong lớp học thực tế.
4. Thiết kế tiến trình dạy học gồm 2 cột nội dung: HOẠT ĐỘNG CỦA GIÁO VIÊN và HOẠT ĐỘNG CỦA HỌC SINH.
    - TUYỆT ĐỐI KHÔNG dùng ký tự sọc đứng "|" để vẽ bảng Markdown. Cứ một dòng Giáo viên đi kèm một dòng Học sinh tương ứng, hệ thống sẽ tự động chuyển hóa thành bảng 2 cột chuẩn mực Công văn 2345.
5. Ở mỗi bước tiến hành, phân biệt rõ hoạt động của Giáo viên và Học sinh bằng tiền tố đầu dòng duy nhất (KHÔNG lặp lại tiền tố, TUYỆT ĐỐI KHÔNG CÓ DẤU HAI CHẤM SAU GV VÀ HS):
   - ĐỊNH DẠNG BẮT BUỘC CHO "BƯỚC *": Văn bản "Bước *" BẮT BUỘC có định dạng chữ đậm:
     Ví dụ: "+ **Bước 1:** GV ...", "- **Bước 1:** HS ...", "+ **Bước 2:** GV ...", "- **Bước 2:** HS ...", "+ **Bước 3:** GV ...", "- **Bước 3:** HS ...", "+ **Bước 4:** GV ...", "- **Bước 4:** HS ...", "+ **Bước 4 (Tích hợp AI):** GV ...".
   - TÍNH ĐỐI XỨNG TUYỆT ĐỐI: "Hoạt động của Giáo viên" và "Hoạt động của Học sinh" cùng nội dung/vấn đề đó PHẢI ĐỐI XỨNG NHAU. Cứ mỗi dòng hành động của Giáo viên (ví dụ "+ **Bước 1:** GV ...") PHẢI ĐI KÈM NGAY với một dòng hành động tương ứng của Học sinh ("- **Bước 1:** HS ...") trên cùng một nội dung đó.
   - Dòng hành động của Giáo viên: bắt đầu bằng "- GV ..." hoặc "+ **Bước 1:** GV ..." (TUYỆT ĐỐI KHÔNG viết "+ GV:" hay "- GV:". Ví dụ: "- GV tổ chức trò chơi "Làm theo hiệu lệnh".", "+ **Bước 1:** GV yêu cầu...")
   - Dòng hành động của Học sinh: bắt đầu bằng "- HS ..." hoặc "- **Bước 1:** HS ..." (TUYỆT ĐỐI KHÔNG viết "- HS:". Ví dụ: "- HS lắng nghe luật chơi và chuẩn bị tư thế.", "- **Bước 1:** HS mở SGK...")
   - TUYỆT ĐỐI KHÔNG tạo các hàng/dòng dư thừa chỉ có số như "1.", "2.", "1.; 2.;" hoặc các dòng trống, ký tự rác ở giữa Bước 1 và Bước 2.
   - TUYỆT ĐỐI LOẠI BỎ HÀNG THỪA: Ở tất cả các hoạt động (đặc biệt là Hoạt động 4 Vận dụng và Hoạt động 1 Khởi động), TUYỆT ĐỐI KHÔNG để câu hỏi hay dòng bài tập đứng riêng một hàng như '2. "Em hãy cho biết..."'. Mọi câu hỏi của GV phải nằm trong dòng của GV (bắt đầu bằng tiền tố "- GV ..."). Hoạt động 4 và Hoạt động 1 chỉ gồm các cặp dòng đối xứng GV và HS, tuyệt đối không có hàng tiêu đề phụ hay câu hỏi mồ côi nằm giữa bảng.
   - TUYỆT ĐỐI KHÔNG LẶP LẠI BƯỚC 1: Trong cùng một hoạt động dạy học, các bước tiến hành BẮT BUỘC tăng dần tuần tự liên tục: Bước 1, Bước 2, Bước 3, Bước 4. Tuyệt đối không bao giờ xuất hiện Bước 1 lần thứ hai trong cùng một hoạt động.
   - DẪN DẮT VÀO BÀI/PHẦN MỚI: Tự động định dạng in đậm tựa bài hoặc phần theo đúng quy định:
     + Nếu có tựa bài (Ví dụ: "Bài 2: Xử lý thông tin") thì định dạng chữ in đậm: "**Bài 2: Xử lý thông tin**" (Ví dụ: "- GV tuyên dương học sinh và dẫn dắt vào bài học mới **Bài 2: Xử lý thông tin**.").
     + Nếu là phần mới (Ví dụ: "phần 3: Sử dụng máy tính đúng cách") thì định dạng in đậm tên phần: "phần 3: **Sử dụng máy tính đúng cách**".
   - TUYỆT ĐỐI KHÔNG chèn tiêu đề hoạt động con (ví dụ: "Hoạt động 1 (trang 5 SGK)..."), không lặp lại "Mục tiêu:", "Cách tiến hành:" ở giữa các bước (ở giữa Bước 1 và Bước 2). Toàn bộ các bước diễn ra liên tục (+ **Bước 1:** GV... / - **Bước 1:** HS... rồi đến + **Bước 2:** GV... / - **Bước 2:** HS...).
   - TUYỆT ĐỐI KHÔNG lặp lại tiền tố, không viết "- GV: + GV:" hay "+ GV: | - GV:" hay "+ GV: - GV:".
   - TUYỆT ĐỐI KHÔNG để chữ placeholder "<Hoạt động của học sinh>" chung chung, mà AI phải biên soạn chi tiết các hoạt động, câu trả lời, thao tác thực tế của học sinh.
6. Mục I. YÊU CẦU CẦN ĐẠT & Định dạng Năng lực:
   - Mục I và Mục 1 PHẢI NẰM TRÊN HAI DÒNG RIÊNG BIỆT:
     Dòng 1: "## I. YÊU CẦU CẦN ĐẠT:"
     Dòng 2: "### 1. Năng lực đặc thù"
     (TUYỆT ĐỐI KHÔNG viết liền nhau trên cùng một dòng như "I. YÊU CẦU CẦN ĐẠT ### 1. Năng lực đặc thù").
   - Các tiêu đề sau BẮT BUỘC KHÔNG CÓ DẤU HAI CHẤM Ở CUỐI:
     - "### 1. Năng lực đặc thù" (TUYỆT ĐỐI KHÔNG ghi "1. Năng lực đặc thù môn Tin học:" hay "1. Năng lực đặc thù môn học:")
     - "### 2. Năng lực chung"
     - "### 3. Phẩm chất"
     - "## II. ĐỒ DÙNG DẠY HỌC"
     - "## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU"
   - Năng lực đặc thù BẮT BUỘC dựa vào trường dữ liệu "Môn học" (${subject}) để biên soạn các yêu cầu cần đạt đặc thù chuẩn xác theo Chương trình GDPT 2018 của môn học đó.
   - BẮT BUỘC định dạng các dòng năng lực sau:
     ${hasAiOption ? `- **Năng lực AI (${cleanGradeNum}.Mã chủ đề.STT)**: [BẮT BUỘC sử dụng công cụ AI Flash 3 preview tích hợp Năng lực AI theo quy ước mã hóa QĐ 2422/QĐ-BGDĐT: [Lớp].[Mã chủ đề].[Số thứ tự], ví dụ "**Năng lực AI (${cleanGradeNum}.A1.2)**: ...". Trong đó [Lớp] là ${cleanGradeNum}; [Mã chủ đề] gồm chữ in hoa A, B, C, D chỉ mạch nội dung chính kèm chữ số chỉ chủ đề thành phần; [Số thứ tự] là số tự nhiên 1, 2, 3... cho nội dung cốt lõi, hoặc có tiền tố MR trước số thứ tự đối với nội dung mở rộng như ${cleanGradeNum}.A1.MR1. Nêu rõ yêu cầu cần đạt tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số phù hợp nhất với bài học]` : `[LƯU Ý]: Không chọn tùy chọn "Năng lực AI (theo QĐ 3439)", TUYỆT ĐỐI KHÔNG đưa Năng lực AI vào mục "1. Năng lực đặc thù".`}
     ${hasDigitalOption ? `- **Năng lực số ([Miền].[Thành phần].[Mức độ][Chỉ báo])**: [BẮT BUỘC sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên tài liệu đính kèm) để đưa ra năng lực số phù hợp theo quy ước mã hóa Thông tư 02/2025/TT-BGDĐT: [Miền năng lực].[Năng lực thành phần].[Mức độ].[Chỉ báo cụ thể], ví dụ "**Năng lực số (1.1.CB1a)**: ..."]` : `[LƯU Ý]: Không chọn Năng lực số, không đưa dòng Năng lực số vào giáo án.`}
     - **Tự chủ và tự học:** [Nêu biểu hiện cụ thể...]
     - **Giao tiếp và hợp tác:** [Nêu biểu hiện cụ thể...]
     - **Giải quyết vấn đề và sáng tạo:** [Nêu biểu hiện cụ thể...]
   - Ở Mục III (Cách tiến hành): ${hasAiOption ? `BẮT BUỘC sử dụng công cụ AI Flash 3 preview tích hợp Nội dung AI tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số vào hoạt động trong giáo án phù hợp nhất (ví dụ ở hoạt động Khám phá hoặc Luyện tập/Vận dụng, đưa vào "+ **Bước 4 (Tích hợp AI):** GV [nội dung GV tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số]..." đi kèm dòng đối xứng của học sinh "- **Bước 4 (Tích hợp AI):** HS [hành động, nhận biết của HS]...").` : `Không chọn tùy chọn "Năng lực AI (theo QĐ 3439)" thì Nội dung (Tích hợp AI) tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số trong các hoạt động PHẢI MẤT ĐI HOÀN TOÀN; TUYỆT ĐỐI KHÔNG xuất hiện tiền tố "(Tích hợp AI)" và KHÔNG đề cập AI/trí tuệ nhân tạo trong các hoạt động.`}
   - Ở Hoạt động Vận dụng: ${hasAiOption ? `Khuyến khích HS liên hệ thực tế thiết bị số/AI thông minh trong đời sống gia đình hoặc trường học và sử dụng công nghệ số có đạo đức, an toàn.` : `Tiến hành liên hệ thực tế đời sống phù hợp nội dung bài học.`}
7. Đánh số hoạt động rõ ràng:
   - "1. Hoạt động 1: Khởi động (5 phút)"
   - "2. Hoạt động 2: Khám phá - [Tên nội dung] (15 phút)" (có chốt kiến thức bằng sơ đồ hoặc bảng tóm tắt)
   - "3. Hoạt động 3: Khám phá - [Tên nội dung tiếp theo / Vai trò...] (10 phút)" (hoặc nếu không có phần 2 thì Hoạt động 3 là Luyện tập (10 phút))
   - "4. Hoạt động 4: Luyện tập (5 phút)" (hoặc Hoạt động 4: Vận dụng (5 phút))
8. Mỗi hoạt động CHỈ CẦN 2 mục con:
   - Mục tiêu: ...
   - Cách tiến hành: (Cột GV và Cột HS)
   (Không chèn thêm các mục thừa thãi như "Thời lượng:", "Nội dung:", "Sản phẩm:" bên trong hoạt động, giữ nguyên sự tinh gọn chuẩn mực như FileMau.pdf).
9. Mục IV. ĐIỀU CHỈNH SAU BÀI DẠY:
   - Những điều đã thực hiện tốt: [AI tự tích hợp cụ thể dựa trên tiến trình bài dạy]
   - Những điều cần rút kinh nghiệm: [AI tự tích hợp cụ thể hướng điều chỉnh]
10. QUY TẮC BẮT BUỘC ĐỒNG BỘ TOÀN BỘ SỐ TIẾT ĐÃ CHỌN (${parsedDurationNum} TIẾT) - TUYỆT ĐỐI KHÔNG ĐỂ XẢY RA LỖI THIẾU HOẠT ĐỘNG:
   - BẮT BUỘC SỬ DỤNG CÔNG CỤ AI FLASH 3 PREVIEW SOẠN ĐẦY ĐỦ VÀ CHÍNH XÁC TOÀN BỘ ${parsedDurationNum} TIẾT (từ Tiết 1 đến Tiết ${parsedDurationNum}: Tiết 1, Tiết 2${parsedDurationNum >= 3 ? ', Tiết 3' : ''}${parsedDurationNum >= 4 ? ', Tiết 4' : ''}...). TUYỆT ĐỐI KHÔNG dừng lại ở 1 hoặc 2 tiết khi người dùng chọn ${parsedDurationNum} tiết!
   - TUYỆT ĐỐI KHÔNG ĐỂ XẢY RA LỖI "KHÔNG ĐẦY ĐỦ CÁC HOẠT ĐỘNG":
     + Ở TỪNG TIẾT (kể cả Tiết 2, Tiết 3...), Mục "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" BẮT BUỘC PHẢI CÓ ĐẦY ĐỦ CẢ 4 HOẠT ĐỘNG CHUẨN MỰC CÔNG VĂN 2345:
       1. Hoạt động 1: Khởi động (5 phút)
       2. Hoạt động 2: Khám phá - [Tên nội dung trọng tâm Tiết X bám sát SGK/tài liệu đính kèm] (15 phút)
       3. Hoạt động 3: Luyện tập (10 phút)
       4. Hoạt động 4: Vận dụng (5 phút)
     + TUYỆT ĐỐI KHÔNG được tóm tắt, không được cắt giảm hay bỏ sót bất kỳ hoạt động nào ở Tiết 2 hay Tiết 3!
     + TUYỆT ĐỐI KHÔNG đưa nội dung Năng lực, Phẩm chất hay Đồ dùng dạy học xuống nằm dưới Mục III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU!
     + Tiết 2 và Tiết 3 phải có độc lập Mục I (Yêu cầu cần đạt), Mục II (Đồ dùng dạy học), rồi mới đến Mục III (Các hoạt động dạy học chủ yếu gồm 4 hoạt động), rồi đến Mục IV (Điều chỉnh sau bài dạy).
   - ĐỒNG BỘ CẤU TRÚC TIẾT 2, TIẾT 3 (VÀ CÁC TIẾT TIẾP THEO) GIỐNG HỆT TIẾT 1 100%: Mỗi tiết đều có cấu trúc chuẩn mực độc lập:
     + Tiêu đề bài học Tiết X: # KẾ HOẠCH BÀI DẠY ... (TIẾT X)
     + Mục I. YÊU CẦU CẦN ĐẠT (1. Năng lực đặc thù, 2. Năng lực chung, 3. Phẩm chất)
     + Mục II. ĐỒ DÙNG DẠY HỌC (Giáo viên, Học sinh)
     + Mục III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU (Bảng 2 cột Hoạt động của GV & Hoạt động của HS gồm đầy đủ 4 hoạt động: Khởi động, Khám phá, Luyện tập, Vận dụng)
     + Mục IV. ĐIỀU CHỈNH SAU BÀI DẠY (Những điều đã thực hiện tốt, Những điều cần rút kinh nghiệm)
     + Dấu ngắt trang "---" sau khi kết thúc Mục IV của mỗi tiết trước khi bắt đầu tiết mới.
   - BẢNG "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" Ở TIẾT 2 (VÀ CÁC TIẾT TIẾP THEO): Dùng công cụ AI Flash 3 preview kiểm tra và xóa toàn bộ các hàng dư thừa nằm trên hàng hoạt động "1. Hoạt động 1: *". Ngay sau dòng tiêu đề "### TIẾT [SỐ]: [TÊN NỘI DUNG]", BẮT BUỘC BẮT ĐẦU NGAY BẰNG "#### 1. Hoạt động 1: Khởi động (5 phút)". TUYỆT ĐỐI KHÔNG chèn bất kỳ dòng chữ giới thiệu, không vẽ bảng markdown (| Hoạt động của GV | Hoạt động của HS |), không chèn thêm hàng tiêu đề, không chèn bất cứ hàng nào nằm trên hàng "1. Hoạt động 1: *".
   - KÝ HIỆU MŨI TÊN: Tất cả sơ đồ luồng kiến thức, sơ đồ tư duy hoặc mối quan hệ giữa các khái niệm BẮT BUỘC sử dụng ký hiệu mũi tên chuẩn '→' (ví dụ: Thông tin thu được → Suy nghĩ → Quyết định).
11. QUY TẮC TÍCH HỢP KHUNG "ỨNG DỤNG CÔNG NGHỆ SỐ":
   - ${techStatement}
   - BẮT BUỘC: TUYỆT ĐỐI KHÔNG thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC".
   - BẮT BUỘC tích hợp vào các hoạt động dạy học của giáo án, và TÊN ỨNG DỤNG trong bảng "KẾT QUẢ KẾ HOẠCH BÀI DẠY" BẮT BUỘC PHẢI CÓ ĐỊNH DẠNG CHỮ ĐẬM VÀ ĐƯỢC ĐỂ TRONG " " (ví dụ: **"Wordwall"**, **"Kahoot"**, **"Quizizz"**, **"Padlet"**, **"Canva"**, **"GeoGebra"**...).
12. QUY TẮC TÍCH HỢP KHUNG "KẾT HỢP TRÒ CHƠI HỌC TẬP":
   - ${gamesStatement}
   - BẮT BUỘC: TUYỆT ĐỐI KHÔNG thêm hoặc tích hợp vào mục "II. ĐỒ DÙNG DẠY HỌC".
   - BẮT BUỘC tích hợp vào các hoạt động dạy học của giáo án (Khởi động, Luyện tập hoặc Vận dụng), và TÊN TRÒ CHƠI trong bảng "KẾT QUẢ KẾ HOẠCH BÀI DẠY" BẮT BUỘC PHẢI CÓ ĐỊNH DẠNG CHỮ ĐẬM VÀ ĐƯỢC ĐỂ TRONG " " (ví dụ: **"Ai nhanh hơn"**, **"Rung chuông vàng"**, **"Hộp quà bí mật"**, **"Mảnh ghép kì diệu"**...).
13. QUY TẮC TÍCH HỢP KHUNG "🏫 PHƯƠNG PHÁP SƯ PHẠM":
   - ${methodsStatement}
   - NẾU BẬT "AI tự đề xuất": công cụ AI Flash 3 preview sẽ dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để đưa ra các phương pháp sư phạm phù hợp nhất với giáo án của bài học đó (như **phương pháp vấn đáp**, **phương pháp trực quan**, **phương pháp thảo luận nhóm**, **phương pháp giải quyết vấn đề**, **phương pháp thực hành**...).
   - Bất kỳ hoạt động nào có sử dụng phương pháp sư phạm thì BẮT BUỘC định dạng chữ in đậm tên phương pháp đó.
14. QUY TẮC HỘP KIẾN THỨC BẮT BUỘC:
   - Hoạt động nào có "Hộp kiến thức" (nội dung kiến thức cốt lõi, quy tắc, định nghĩa hoặc ghi nhớ đóng khung trong SGK hoặc tài liệu đính kèm) thì BẮT BUỘC phải chốt lại ngay ở hoạt động đó:
     + Ở bước chốt kiến thức (ví dụ Bước 4 của Hoạt động 2 Khám phá hoặc cuối hoạt động), Giáo viên chốt lại Hộp kiến thức ngắn gọn, chuẩn xác vào bảng/vở (ví dụ: '+ **Bước 4:** GV chốt lại **Hộp kiến thức**: [Nội dung cốt lõi của Hộp kiến thức trong SGK]...').
     + Học sinh: chú ý quan sát, ghi nhớ hoặc đóng khung Hộp kiến thức vào vở (ví dụ: '- **Bước 4:** HS khắc sâu và ghi/đóng khung **Hộp kiến thức** vào vở.').
15. QUY TẮC ĐỊNH DẠNG CHỮ ĐẬM TÊN PHƯƠNG PHÁP SƯ PHẠM:
   - Bất kỳ hoạt động nào có sử dụng phương pháp sư phạm thì BẮT BUỘC định dạng chữ in đậm tên phương pháp đó.
     Ví dụ: '**phương pháp trực quan**'; '**phương pháp vấn đáp**'; '**phương pháp thảo luận nhóm**'; '**phương pháp thực hành**'; '**phương pháp giải quyết vấn đề**'; '**phương pháp trò chơi**'; '**phương pháp đóng vai**'.
     (Ví dụ kịch bản GV: '+ **Bước 2:** Sử dụng **phương pháp vấn đáp**: GV đặt câu hỏi gợi mở...').
16. QUY TẮC KHOẢNG TRỐNG TÊN BÀI VÀ TIẾT DẠY (BẮT BUỘC):
   - Tên bài học và số tiết BẮT BUỘC có đúng 01 khoảng trống (dấu cách) ở giữa, ví dụ: '**BÀI 1: THÔNG TIN VÀ QUYẾT ĐỊNH (TIẾT 1)**', '**BÀI 1: THÔNG TIN VÀ QUYẾT ĐỊNH (TIẾT 2)**'. TUYỆT ĐỐI KHÔNG VIẾT DÍNH LIỀN thành '...QUYẾT ĐỊNH(TIẾT 1)' hay '...QUYẾT ĐỊNH(TIẾT 2)'.
17. QUY TẮC ĐỒ DÙNG DẠY HỌC VÀ KHÔNG THÊM TÊN BỘ SÁCH (BẮT BUỘC TUÂN THỦ):
   - Ở Mục "II. ĐỒ DÙNG DẠY HỌC":
     + TUYỆT ĐỐI KHÔNG thêm hoặc tích hợp Ứng dụng công nghệ số hay Trò chơi học tập vào mục "II. ĐỒ DÙNG DẠY HỌC".
     + NẾU BẬT "AI tự đề xuất" ĐỒ DÙNG DẠY HỌC: Công cụ AI Flash 3 preview BẮT BUỘC dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên "Tài liệu đính kèm minh họa" nếu có) để tự động đưa ra các Đồ dùng dạy học (chỉ thay đổi với mục giáo viên) phù hợp nhất với giáo án của bài học đó (như Máy chiếu, Bài giảng điện tử, Máy tính, Phòng máy tính, Tranh ảnh SGK Trang * với số trang và các hình cụ thể). TUYỆT ĐỐI KHÔNG ép buộc chỉ lấy các tùy chọn đã chọn trước đó, mà AI phải tự đề xuất phù hợp nhất với nội dung bài học từ tài liệu đính kèm minh họa hoặc taphuan.nxbgd.vn!
     + NẾU TẮT "AI tự đề xuất" (chọn thủ công): BẮT BUỘC XUẤT HIỆN ĐẦY ĐỦ 100% CÁC ĐỒ DÙNG DẠY HỌC MÀ GIÁO VIÊN ĐÃ CHỌN Ở MỤC "- Giáo viên:" (${teacherItemsJoined}). TUYỆT ĐỐI KHÔNG ĐƯỢC BỎ BỚT bất kỳ tùy chọn nào đã chọn!
     + GIÁO VIÊN: Chỉ đưa "Sách giáo khoa ${subject} ${cleanGradeNum}" vào nếu người dùng CÓ CHỌN tùy chọn "Sách giáo khoa". Nếu KHÔNG CHỌN thì TUYỆT ĐỐI KHÔNG xuất hiện "Sách giáo khoa" ở mục Giáo viên!
     + Khi có "Tranh ảnh": Văn bản hiển thị là "Tranh ảnh SGK Trang *" hoặc nếu có hình ảnh cụ thể thì hiển thị dạng "Tranh ảnh Hình ... SGK Trang *" (Ví dụ: "Tranh ảnh Hình 22, 23, 24, 25 SGK Trang 25" hoặc "Tranh ảnh Hình 26, 27, 28, 29, 30 SGK Trang 22, 23, 24"). TUYỆT ĐỐI KHÔNG dùng từ "tranh ảnh phóng to", TUYỆT ĐỐI KHÔNG viết dạng "Tranh ảnh Hình 26 SGK Trang *, 27, 28, 29, 30 SGK Trang 22, 23, 24" mà BẮT BUỘC đổi thành "Tranh ảnh Hình 26, 27, 28, 29, 30 SGK Trang 22, 23, 24". Và TUYỆT ĐỐI KHÔNG được thêm "trong SGK ${subject} ${cleanGradeNum} (Kết nối tri thức với cuộc sống)" hay tên bộ sách vào.
     + Khi có "Sách giáo khoa": Văn bản hiển thị là "Sách giáo khoa ${subject} ${cleanGradeNum}" (hoặc "SGK ${subject} ${cleanGradeNum}"), TUYỆT ĐỐI KHÔNG thêm tên bộ sách vào.
     + Văn bản "Phòng thực hành máy tính hoạt động tốt" hoặc "Máy tính thực hành" BẮT BUỘC đổi thành "Phòng máy tính".
     + Văn bản "Bài giảng BÀI 4. LÀM VIỆC VỚI MÁY TÍNH (TIẾT 2)," hoặc các dạng "Bài giảng BÀI [X]..." BẮT BUỘC đổi thành "Bài giảng điện tử".
     + HỌC SINH (chỉ thay đổi với mục giáo viên, mục học sinh luôn giữ chuẩn): Cố định là: "- Học sinh: SGK ${subject} ${cleanGradeNum}, VBT ${subject} ${cleanGradeNum}, vở ghi, dụng cụ học tập." TUYỆT ĐỐI KHÔNG thêm tên bộ sách (không ghi "(Kết nối tri thức với cuộc sống)" hay bất kỳ tên bộ sách nào).
18. QUY TẮC MỤC "3. PHẨM CHẤT" VÀ "NĂNG LỰC CẦN PHÁT TRIỂN":
   - NẾU BẬT "AI tự đề xuất" (Khung Năng lực cần phát triển): Công cụ AI Flash 3 preview BẮT BUỘC dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên tài liệu đính kèm nếu có) để tự động đưa ra các năng lực cần phát triển và phẩm chất phù hợp nhất với giáo án bài học. TUYỆT ĐỐI KHÔNG ép buộc chỉ lấy các tùy chọn đã chọn trước đó!
   - NẾU TẮT "AI tự đề xuất" (chọn thủ công): BẮT BUỘC xuất hiện ĐẦY ĐỦ 100% CẢ ${gdptQualitiesList.length} phẩm chất đã chọn sau ở mục "3. Phẩm chất": ${gdptQualitiesList.join('; ')}. TUYỆT ĐỐI KHÔNG ĐƯỢC BỎ BỚT, không được chỉ xuất hiện 2/3 các tùy chọn đã chọn!

==================================================
I. THÔNG TIN BÀI DẠY ĐẦU VÀO
==================================================
- Môn học: ${subject}
- Lớp: ${grade}
- Tên bài: ${title}
- Số tiết: ${duration}
- Bộ sách: ${curriculumBook || 'Kết nối tri thức với cuộc sống'}
- Chủ đề/chương: ${chapter || topic || ''}

Tài liệu nguồn / Nội dung cốt lõi từ SGK:
${attachmentsContext ? attachmentsContext : (lessonContent ? lessonContent : 'Bám sát nội dung SGK và yêu cầu cần đạt của bài học.')}

==================================================
II. KHUNG KẾ HOẠCH BÀI DẠY MẪU CHUẨN (FILEMAU.PDF)
==================================================
Hãy dựng Kế hoạch bài dạy theo đúng cấu trúc mẫu sau:

# KẾ HOẠCH BÀI DẠY
${subject.toUpperCase()} - LỚP ${(grade.replace(/lớp\s*/i, '') || '3').toUpperCase()}
${chapter ? chapter.toUpperCase() : 'CHỦ ĐỀ 1. MÁY TÍNH VÀ EM'}
${displayBaseTitleUpper} ${is1Tiet ? '(1 TIẾT)' : '(TIẾT 1)'}

## I. YÊU CẦU CẦN ĐẠT:

### 1. Năng lực đặc thù
${gdptSpecificPrompt}

### 2. Năng lực chung
${gdptGeneralPrompt}

### 3. Phẩm chất
${gdptQualitiesPrompt}

## II. ĐỒ DÙNG DẠY HỌC
${gdptToolsPrompt}

## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU

### ${is1Tiet ? `${displayBaseTitleUpper} (1 TIẾT)` : `TIẾT 1: [TÊN BÀI HỌC HOẶC TÊN NỘI DUNG CHÍNH CỦA TIẾT 1]`}

#### 1. Hoạt động 1: Khởi động (5 phút)
- Mục tiêu: Tạo hứng thú và dẫn dắt học sinh vào bài học ${aiAutoGames ? 'thông qua trò chơi học tập (công cụ AI Flash 3 preview tự động đề xuất dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn", ưu tiên tài liệu đính kèm nếu có)' : (cleanedGame ? `thông qua trò chơi học tập "${cleanedGame}" bạn đã nhập (dựa vào tài liệu đính kèm hoặc tra cứu taphuan.nxbgd.vn)` : 'thông qua quan sát tình huống/tranh ảnh thực tế trong SGK')}.
- Cách tiến hành:
${(aiAutoGames || cleanedGame) ? `- GV tổ chức trò chơi "${cleanedGame || 'Khởi động vui học'}" (AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn", ưu tiên tài liệu đính kèm để đưa ra luật chơi và câu hỏi khởi động phù hợp).
- HS lắng nghe luật chơi và hướng dẫn của GV, hào hứng tham gia trò chơi.
- GV quy định và điều hành trò chơi, đặt câu hỏi gợi mở kết nối vào bài mới: "[Câu hỏi gợi mở dẫn dắt]?"
- HS tích cực suy nghĩ, tương tác và trả lời: "[Câu trả lời dự kiến của HS]".
- GV tuyên dương học sinh và dẫn dắt vào bài học mới.
- HS lắng nghe GV dẫn dắt, mở SGK và ghi tên bài vào vở.` : `- GV yêu cầu HS quan sát tranh khởi động trong SGK / tài liệu đính kèm.
- HS mở SGK, quan sát tranh và suy nghĩ câu hỏi gợi mở của GV.
- GV đặt câu hỏi: "[Câu hỏi gợi mở dẫn dắt]?"
- HS suy nghĩ và trả lời: "[Câu trả lời dự kiến của HS]".
- GV nhận xét và dẫn dắt vào bài học mới.
- HS lắng nghe GV dẫn dắt, mở SGK và ghi tên bài vào vở.`}

#### 2. Hoạt động 2: Khám phá - [Tên nội dung khám phá Tiết 1] (15 phút)
- Mục tiêu: HS chiếm lĩnh kiến thức cốt lõi của Tiết 1 (nhận biết, giải thích và áp dụng được vào các ví dụ cụ thể bám sát SGK/tài liệu đính kèm).
- Cách tiến hành:
+ **Bước 1:** GV yêu cầu HS đọc/quan sát nội dung Hoạt động trong SGK (hoặc tài liệu đính kèm) về [nội dung bài học Tiết 1].
- **Bước 1:** HS mở SGK, đọc thông tin và quan sát hình ảnh được giao.
+ **Bước 2:** Sử dụng **phương pháp vấn đáp** (hoặc phương pháp sư phạm phù hợp ${aiAutoMethods ? 'do công cụ AI Flash 3 preview dựa vào tài liệu đính kèm / taphuan.nxbgd.vn để tự đề xuất' : `đã chọn: ${methodsStatement}`}): "[Câu hỏi 1]? ([Gợi ý/Ý nghĩa])". "[Câu hỏi 2]?"
- **Bước 2:** HS xung phong trả lời câu hỏi của GV: "[Nội dung câu trả lời của HS]".
+ **Bước 3:** Sử dụng **phương pháp thảo luận nhóm** (hoặc thảo luận cặp đôi): GV trình chiếu bảng ví dụ/phiếu học tập [chi tiết ví dụ]${(aiAutoTech || cleanedTech) ? ` (kết hợp ứng dụng công nghệ số: ${cleanedTech || 'phần mềm/website tương tác phù hợp do AI Flash 3 preview đưa ra'})` : ''}. HS thảo luận để hoàn thành: "[Nhiệm vụ]".
- **Bước 3:** HS thảo luận nhóm tích cực và hoàn thành điền bảng/phiếu học tập.
+ **Bước 4:** GV chốt lại **Hộp kiến thức** (hoặc sơ đồ sử dụng ký hiệu mũi tên chuẩn '→'):
[Nội dung Hộp kiến thức cốt lõi hoặc sơ đồ tóm tắt ngắn gọn của Tiết 1 sử dụng ký hiệu mũi tên '→', ví dụ: Thông tin thu được → Suy nghĩ → Quyết định]
- **Bước 4:** HS quan sát sơ đồ/bảng chốt, khắc sâu quy trình và ghi/đóng khung **Hộp kiến thức** vào vở.

#### 3. Hoạt động 3: Luyện tập (10 phút)
- Mục tiêu: Củng cố kiến thức và rèn luyện kỹ năng thực hành của Tiết 1 theo các bài tập trong SGK / tài liệu đính kèm.
- Cách tiến hành:
+ **Bước 1:** GV giao bài tập trong SGK/tài liệu${(aiAutoTech || cleanedTech) ? ` (kết hợp thực hành trên ${cleanedTech || 'ứng dụng công nghệ số phù hợp'})` : ''}: "[Nêu rõ nội dung bài tập luyện tập của Tiết 1]".
- **Bước 1:** HS nhận nhiệm vụ, mở SGK làm bài tập cá nhân vào vở.
+ **Bước 2:** Sử dụng **phương pháp thực hành** (hoặc **phương pháp thảo luận**): GV quan sát, hướng dẫn HS làm bài và hỗ trợ khi cần thiết.
- **Bước 2:** Đại diện HS tự tin trình bày kết quả bài tập, đối chiếu bài làm cùng bạn.
+ **Bước 3:** GV hướng dẫn nhận xét, chuẩn hóa kiến thức và chốt đáp án đúng.
- **Bước 3:** HS chú ý lắng nghe, tự sửa bài vào vở.
${hasAiOption ? `+ **Bước 4 (Tích hợp AI):** GV giới thiệu thêm tính năng thông minh hoặc liên hệ thực tế phù hợp với bài học (ví dụ: máy tính và robot thông minh (AI) cũng cần thông tin để hoạt động).
- **Bước 4 (Tích hợp AI):** HS hào hứng theo dõi, mở rộng vốn hiểu biết về ứng dụng thực tiễn.` : `+ **Bước 4:** GV hướng dẫn củng cố, liên hệ thực tế bài học.
- **Bước 4:** HS chú ý theo dõi, ghi nhớ bài học.`}

#### 4. Hoạt động 4: Vận dụng (5 phút)
- Mục tiêu: HS biết ứng dụng kiến thức Tiết 1 vào giải quyết các tình huống thực tế đời sống.
- Cách tiến hành:
- GV giao nhiệm vụ thực tế (sử dụng **phương pháp giải quyết vấn đề**): "[Câu hỏi/tình huống thực tế cuộc sống liên quan đến nội dung Tiết 1]?".
- HS suy nghĩ, trao đổi và chia sẻ giải pháp/ý kiến của bản thân.
- GV nhận xét, đánh giá tinh thần học tập của cả lớp và dặn dò chuẩn bị bài học tiếp theo.
- HS tiếp thu nhiệm vụ vận dụng tại gia đình và ghi nhớ dặn dò của GV.

## IV. ĐIỀU CHỈNH SAU BÀI DẠY:
- Những điều đã thực hiện tốt: [AI tự tích hợp dựa trên tiến trình bài dạy]
- Những điều cần rút kinh nghiệm: [AI tự tích hợp dựa trên tiến trình bài dạy]

${parsedDurationNum >= 2 ? (() => {
  const periodTemplates: string[] = [];
  for (let p = 2; p <= parsedDurationNum; p++) {
    const isFinal = (p === parsedDurationNum);
    periodTemplates.push(`
---
# KẾ HOẠCH BÀI DẠY
${subject.toUpperCase()} - LỚP ${(grade.replace(/lớp\s*/i, '') || '3').toUpperCase()}
${chapter ? chapter.toUpperCase() : 'CHỦ ĐỀ 1. MÁY TÍNH VÀ EM'}
${displayBaseTitleUpper} (TIẾT ${p})

## I. YÊU CẦU CẦN ĐẠT:

### 1. Năng lực đặc thù
(Biên soạn các yêu cầu cần đạt trọng tâm của Tiết ${p} dựa vào trường dữ liệu "Môn học" (${subject}) và "Lớp" (${grade}) theo CT GDPT 2018, bám sát nội dung nửa sau bài học trong SGK / tài liệu đính kèm của Tiết ${p})
${aiAutoCompetency ? `(Công cụ AI Flash 3 preview tự động đưa ra các yêu cầu cần đạt trọng tâm của Tiết ${p} dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" - ưu tiên tài liệu đính kèm nếu có)` : `(Tích hợp các năng lực đặc thù đã chọn: ${gdptSpecificList.join('; ')} cho nội dung của Tiết ${p})`}
- [Yêu cầu cần đạt riêng của Tiết ${p} môn ${subject}, bám sát nội dung bài học Tiết ${p} trong SGK / tài liệu đính kèm]
- [Yêu cầu cần đạt cụ thể...]
${hasAiOption ? `- **Năng lực AI (${cleanGradeNum}.Mã chủ đề.STT)**: [Yêu cầu cần đạt tích hợp AI theo chuẩn QĐ 2422/QĐ-BGDĐT cho Tiết ${p}, tự liên hệ thực tế, tư duy máy học và đạo đức số]` : ''}
${hasDigitalOption ? `- **Năng lực số ([Miền].[Thành phần].[Mức độ][Chỉ báo])**: [BẮT BUỘC sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" (ưu tiên tài liệu đính kèm) để đưa ra năng lực số phù hợp theo Thông tư 02/2025/TT-BGDĐT cho Tiết ${p}]` : ''}

### 2. Năng lực chung
(Tập trung vào các hoạt động thực hành, làm việc cặp đôi/nhóm và luyện tập trong Tiết ${p})
${aiAutoCompetency ? `(BẬT tùy chọn "AI tự đề xuất": Công cụ AI Flash 3 preview tự động đưa ra các năng lực chung phù hợp nhất cho Tiết ${p} bám sát hoạt động dạy học của bài học từ tài liệu đính kèm minh họa hoặc taphuan.nxbgd.vn):
- **Tự chủ và tự học:** [Mô tả cụ thể cho Tiết ${p}]
- **Giao tiếp và hợp tác:** [Mô tả cụ thể cho Tiết ${p}]
- **Giải quyết vấn đề và sáng tạo:** [Mô tả cụ thể cho Tiết ${p}]` : `${gdptGeneralList.some(c => c.toLowerCase().includes('tự chủ')) ? `- **Tự chủ và tự học:** [Mô tả cụ thể cho Tiết ${p}]` : ''}
${gdptGeneralList.some(c => c.toLowerCase().includes('giao tiếp')) ? `- **Giao tiếp và hợp tác:** [Mô tả cụ thể cho Tiết ${p}]` : ''}
${gdptGeneralList.some(c => c.toLowerCase().includes('giải quyết')) ? `- **Giải quyết vấn đề và sáng tạo:** [Mô tả cụ thể cho Tiết ${p}]` : ''}`}

### 3. Phẩm chất
(Dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn" - ưu tiên tài liệu đính kèm nếu có - để lựa chọn nội dung phù hợp cho Tiết ${p})
${aiAutoCompetency ? `(BẬT tùy chọn "AI tự đề xuất": Công cụ AI Flash 3 preview tự động đưa ra các phẩm chất phù hợp nhất cho Tiết ${p} bám sát tài liệu đính kèm minh họa hoặc taphuan.nxbgd.vn):
- **Chăm chỉ:** [Biểu hiện cụ thể trong Tiết ${p}]
- **Trách nhiệm:** [Biểu hiện cụ thể trong Tiết ${p}]
- **Trung thực:** [Biểu hiện cụ thể trong Tiết ${p}]` : gdptQualitiesList.map(q => `- ${q}: [Biểu hiện cụ thể trong Tiết ${p}]`).join('\n')}

## II. ĐỒ DÙNG DẠY HỌC
${aiAutoTools ? `(BẬT tùy chọn "AI tự đề xuất": Công cụ AI Flash 3 preview tự động đưa ra đồ dùng dạy học phù hợp nhất cho giáo viên của Tiết ${p} bám sát tài liệu đính kèm minh họa hoặc taphuan.nxbgd.vn):
- Giáo viên: [Công cụ AI Flash 3 preview tự đề xuất đồ dùng phù hợp nhất cho giáo viên Tiết ${p}: Máy chiếu, Bài giảng điện tử, Máy tính, Tranh ảnh SGK Trang *...].` : `- Giáo viên: ${teacherItemsJoined}.`}
- Học sinh: SGK ${subject} ${cleanGradeNum}, VBT ${subject} ${cleanGradeNum}, vở ghi, dụng cụ học tập.

## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU

### TIẾT ${p}: [TÊN NỘI DUNG CỐT LÕI TIẾT ${p} BÁM SÁT TÀI LIỆU ĐÍNH KÈM / SGK MÔN ${subject}]

#### 1. Hoạt động 1: Khởi động (5 phút)
- Mục tiêu: Ôn lại kiến thức tiết ${p - 1} và tạo hứng thú giới thiệu nội dung mới của Tiết ${p} ${aiAutoGames ? '(sử dụng công cụ AI Flash 3 preview dựa vào "Tài liệu đính kèm minh họa" hoặc "Tra cứu trang taphuan.nxbgd.vn", ưu tiên tài liệu đính kèm để đưa ra trò chơi học tập phù hợp)' : (cleanedGame ? `(thông qua trò chơi học tập "${cleanedGame}" bạn đã nhập)` : '(thông qua tình huống/câu hỏi kết nối)')}.
- Cách tiến hành:
${(aiAutoGames || cleanedGame) ? `- GV tổ chức trò chơi "${cleanedGame || `Ôn tập thông thái Tiết ${p}`}" (AI Flash 3 preview dựa vào tài liệu đính kèm minh họa hoặc taphuan.nxbgd.vn để thiết kế luật chơi và câu hỏi ôn tập Tiết ${p - 1}).
- HS hào hứng tham gia trò chơi, tích cực trả lời câu hỏi ôn tập.
- GV nhận xét, khen thưởng và dẫn dắt chuyển tiếp sang nội dung mới của Tiết ${p}.
- HS lắng nghe GV dẫn dắt, mở SGK Tiết ${p} và ghi tên bài vào vở.` : `- GV tổ chức hoạt động/tình huống kết nối kiến thức từ Tiết ${p - 1} sang Tiết ${p}.
- HS hào hứng tham gia hoạt động theo hướng dẫn của GV.
- GV đặt câu hỏi gợi mở kết nối: "[Nêu câu hỏi kết nối kiến thức từ Tiết ${p - 1} sang Tiết ${p}]".
- HS suy nghĩ và trả lời câu hỏi: "[Nội dung câu trả lời của HS]".
- GV nhận xét, tuyên dương và dẫn dắt vào bài học mới Tiết ${p}.
- HS lắng nghe, mở SGK Tiết ${p} và ghi tên bài vào vở.`}

#### 2. Hoạt động 2: ${isFinal && p >= 3 ? `Khám phá mở rộng / Thực hành trọng tâm` : `Khám phá - [Tên nội dung trọng tâm Tiết ${p} bám sát SGK/tài liệu đính kèm]`} (15 phút)
- Mục tiêu: HS chiếm lĩnh kiến thức cốt lõi của Tiết ${p} (nhận biết, giải thích và áp dụng được vào các ví dụ cụ thể bám sát SGK/tài liệu đính kèm).
- Cách tiến hành:
+ **Bước 1:** GV yêu cầu HS quan sát Hình/Tình huống/Đọc thông tin (trong SGK hoặc tài liệu đính kèm) về [nội dung bài học Tiết ${p}].
- **Bước 1:** HS mở SGK, đọc thông tin và quan sát kỹ hình ảnh/nội dung theo hướng dẫn của GV.
+ **Bước 2:** Sử dụng **phương pháp vấn đáp** (hoặc phương pháp sư phạm phù hợp ${aiAutoMethods ? 'do AI Flash 3 preview dựa vào tài liệu đính kèm / taphuan.nxbgd.vn để tự đề xuất' : `đã chọn: ${methodsStatement}`}): "[Câu hỏi 1 bám sát bài học]?". "[Câu hỏi 2]?"
- **Bước 2:** HS xung phong trả lời câu hỏi của GV: "[Nội dung câu trả lời chuẩn xác của HS]".
+ **Bước 3:** Sử dụng **phương pháp thảo luận nhóm** (hoặc thảo luận cặp đôi): GV trình chiếu bảng ví dụ/phiếu học tập [chi tiết ví dụ thực tế trong SGK]${(aiAutoTech || cleanedTech) ? ` (kết hợp ${cleanedTech ? `ứng dụng/trang web: ${cleanedTech}` : 'ứng dụng công nghệ số tương tác phù hợp'})` : ''}. Yêu cầu HS thảo luận để hoàn thành: "[Nhiệm vụ]".
- **Bước 3:** HS thảo luận nhóm tích cực và hoàn thành phiếu học tập/bài tập.
+ **Bước 4:** GV chốt lại **Hộp kiến thức** (hoặc sơ đồ sử dụng ký hiệu mũi tên chuẩn '→'):
[Nội dung Hộp kiến thức cốt lõi hoặc sơ đồ luồng kiến thức tóm tắt ngắn gọn của Tiết ${p} sử dụng ký hiệu mũi tên '→', ví dụ: Thu nhận thông tin → Xử lý → Quyết định]
- **Bước 4:** HS quan sát sơ đồ/bảng chốt, khắc sâu quy trình và ghi/đóng khung **Hộp kiến thức** vào vở.

#### 3. Hoạt động 3: Luyện tập (10 phút)
- Mục tiêu: Củng cố kiến thức và rèn luyện kỹ năng thực hành của Tiết ${p} theo các bài tập trong SGK / tài liệu đính kèm.
- Cách tiến hành:
+ **Bước 1:** GV giao bài tập trong SGK/tài liệu${(aiAutoTech || cleanedTech) ? ` (tổ chức thực hành/luyện tập trên ${cleanedTech || 'ứng dụng công nghệ số phù hợp'})` : ''}: "[Nêu rõ nội dung bài tập luyện tập của Tiết ${p}]".
- **Bước 1:** HS nhận nhiệm vụ, mở SGK làm bài tập cá nhân vào vở.
+ **Bước 2:** Sử dụng **phương pháp thực hành**: GV gọi đại diện học sinh báo cáo kết quả bài tập, đối chiếu bài làm cùng bạn.
- **Bước 2:** Đại diện HS tự tin trình bày kết quả, đối chiếu bài làm cùng bạn.
+ **Bước 3:** GV hướng dẫn nhận xét, chuẩn hóa kiến thức và chốt đáp án đúng.
- **Bước 3:** HS chú ý lắng nghe, tự sửa bài vào vở.
${hasAiOption ? `+ **Bước 4 (Tích hợp AI):** GV giới thiệu thêm tính năng thông minh hoặc liên hệ thực tế phù hợp với bài học.
- **Bước 4 (Tích hợp AI):** HS hào hứng theo dõi, mở rộng vốn hiểu biết về ứng dụng thực tiễn.` : `+ **Bước 4:** GV hướng dẫn củng cố, liên hệ thực tế bài học.
- **Bước 4:** HS chú ý theo dõi, ghi nhớ bài học.`}

#### 4. Hoạt động 4: Vận dụng (5 phút)
- Mục tiêu: HS biết ứng dụng kiến thức Tiết ${p} vào giải quyết các tình huống thực tế đời sống.
- Cách tiến hành:
- GV giao nhiệm vụ thực tế (sử dụng **phương pháp giải quyết vấn đề**): "[Câu hỏi/tình huống thực tế cuộc sống liên quan đến nội dung Tiết ${p}]?".
- HS suy nghĩ, trao đổi và chia sẻ giải pháp/ý kiến của bản thân.
- GV nhận xét, đánh giá tinh thần học tập của cả lớp và dặn dò chuẩn bị bài học tiếp theo.
- HS tiếp thu nhiệm vụ vận dụng tại gia đình và ghi nhớ dặn dò của GV.

## IV. ĐIỀU CHỈNH SAU BÀI DẠY:
- Những điều đã thực hiện tốt: [AI tự tích hợp cụ thể dựa trên tiến trình Tiết ${p}]
- Những điều cần rút kinh nghiệm: [AI tự tích hợp cụ thể hướng điều chỉnh Tiết ${p}]
`);
  }
  return periodTemplates.join('\n');
})() : ''}

Hãy bắt đầu viết trực tiếp giáo án bằng tiếng Việt, tuân thủ chính xác từng phần, từng dòng và phong cách của file mẫu FileMau.pdf trên!
`;
      } else if (isBasic) {
        prompt = `Bạn là chuyên gia xây dựng Kế hoạch bài dạy tiểu học theo Chương trình GDPT 2018, có kinh nghiệm thiết kế giáo án theo định hướng phát triển phẩm chất, năng lực học sinh.
Hãy xây dựng một KẾ HOẠCH BÀI DẠY hoàn chỉnh dựa trên tài liệu/bài học tôi cung cấp.

YÊU CẦU QUAN TRỌNG:
- Bám sát tuyệt đối nội dung bài học, sách giáo khoa và tài liệu tôi cung cấp.
- Không tự ý thay đổi kiến thức cốt lõi của bài.
- Không đưa kiến thức vượt quá yêu cầu của cấp học.
- Không sao chép máy móc nội dung SGK; hãy chuyển hóa thành các hoạt động dạy học phù hợp.
- Thiết kế theo định hướng phát triển phẩm chất và năng lực của CTGDPT 2018.
- Hoạt động phải có tính khả thi trong lớp học thực tế.
- Ưu tiên phương pháp dạy học tích cực: quan sát, vấn đáp, thảo luận cặp đôi, thảo luận nhóm, trò chơi học tập, thực hành, giải quyết vấn đề, vận dụng.
- Mỗi hoạt động phải thể hiện rõ: Mục tiêu → Nội dung → Sản phẩm → Cách tiến hành.
- Phân biệt rõ hoạt động của GIÁO VIÊN và hoạt động của HỌC SINH.
- Không viết chung chung như “GV hướng dẫn, HS thực hiện”; phải mô tả cụ thể GV nói/giao nhiệm vụ gì, HS làm gì, sản phẩm là gì.
- Thời lượng của các hoạt động phải hợp lý và tổng thời gian đúng với số tiết được yêu cầu.

==================================================
I. THÔNG TIN ĐẦU VÀO
==================================================

- Môn học: ${subject}
- Lớp: ${grade}
- Tên bài: ${title}
- Số tiết: ${duration}
- Bộ sách: ${curriculumBook || 'Kết nối tri thức với cuộc sống'}
- Chủ đề/chương: ${chapter || topic || ''}

Tài liệu nguồn / Nội dung cốt lõi:
${attachmentsContext ? attachmentsContext : (lessonContent ? lessonContent : 'Bám sát nội dung SGK và yêu cầu cần đạt của bài học.')}

Hãy đọc kỹ toàn bộ tài liệu trước khi xây dựng giáo án.

==================================================
II. CẤU TRÚC GIÁO ÁN BẮT BUỘC
==================================================

# KẾ HOẠCH BÀI DẠY

${subject.toUpperCase()} - LỚP ${(grade.replace(/lớp\s*/i, '') || '3').toUpperCase()}
${chapter ? chapter.toUpperCase() : 'CHỦ ĐỀ 1. MÁY TÍNH VÀ EM'}

${title.toUpperCase()}
(Tiết 1/${duration.includes('2') || title.toLowerCase().includes('2 tiết') ? '2' : '1'})

## I. YÊU CẦU CẦN ĐẠT

### 1. Năng lực đặc thù:
Xác định các yêu cầu cần đạt cụ thể, có thể quan sát và đánh giá được.
Viết bằng các động từ phù hợp như:
- Nêu được...
- Nhận biết được...
- Trình bày được...
- Phân biệt được...
- Thực hiện được...
- Sử dụng được...
- Vận dụng được...
- Tạo được...
- Giải thích được...
Không viết mục tiêu quá chung chung.
(Dựa trên các năng lực đặc thù đã chọn: ${competencyStatement})
${aiPowerup ? `Nếu bài học có nội dung phù hợp thì bổ sung:
- Năng lực AI (theo QĐ 3439): ${aiCompetencyStatement}
- **Năng lực số:** Nhận biết và sử dụng an toàn, hiệu quả công nghệ số trong học tập.` : ''}

### 2. Năng lực chung
Xác định những năng lực chung thực sự được hình thành qua bài học:
- **Tự chủ và tự học:** HS tự quan sát, suy nghĩ, thực hiện nhiệm vụ cá nhân.
- **Giao tiếp và hợp tác:** HS trao đổi cặp đôi/nhóm, chia sẻ kết quả với bạn.
- **Giải quyết vấn đề và sáng tạo:** HS xử lí tình huống, lựa chọn phương án.
Mỗi năng lực phải gắn với hoạt động cụ thể trong bài.
(Dựa trên các năng lực chung đã chọn: ${generalCompetencyStatement})

### 3. Phẩm chất
Chỉ lựa chọn những phẩm chất có cơ sở từ hoạt động học:
- Chăm chỉ: Tích cực hoàn thành nhiệm vụ học tập.
- Trách nhiệm: Giữ gìn đồ dùng học tập, phối hợp trách nhiệm cùng nhóm.
- Trung thực: Báo cáo trung thực kết quả bài làm/sản phẩm học tập.
Mỗi phẩm chất cần thể hiện được biểu hiện cụ thể của học sinh.
(Dựa trên các phẩm chất đã chọn: ${qualitiesStatement})

## II. ĐỒ DÙNG DẠY HỌC

### 1. Giáo viên
Liệt kê cụ thể:
- Máy tính, máy chiếu/tivi, bài trình chiếu (PowerPoint).
- Video/hình ảnh trực quan theo bài học.
- Phiếu học tập, thẻ từ/thẻ hình minh họa.
(Đồ dùng đã chọn: ${toolsStatement}; Công nghệ: ${techStatement})

### 2. Học sinh
Liệt kê:
- Sách giáo khoa, vở ghi bài, đồ dùng học tập.
- Phiếu học tập, máy tính/thiết bị thực hành (nếu có).

## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU

Phân chia đúng số tiết (${duration}).

Mỗi tiết có cấu trúc:
#### TIẾT 1: [TÊN BÀI HỌC/NỘI DUNG CỐT LÕI CỦA TIẾT 1]

Mỗi hoạt động BẮT BUỘC gồm 4 phần theo mẫu sau:

##### Hoạt động 1: Khởi động - [Nội dung cụ thể từ tài liệu] (5 phút)
- **Mục tiêu:** [Nêu mục tiêu cụ thể của hoạt động khởi động]
- **Nội dung:** [Trò chơi, bài hát, câu đố hoặc tình huống thực tế dẫn vào bài]
- **Sản phẩm:** [Câu trả lời, kết quả tham gia trò chơi hoặc biểu hiện nhận thức của học sinh]
- **Cách tiến hành:**
- GV: + Bước 1 – Giao nhiệm vụ: GV tổ chức trò chơi/tình huống/câu hỏi/hình ảnh... Mô tả chính xác GV làm gì, đặt câu hỏi gì.
- HS: + Bước 2 – Thực hiện nhiệm vụ: Mô tả HS quan sát, suy nghĩ, thực hiện trò chơi hoặc trao đổi nhanh.
- HS: + Bước 3 – Chia sẻ: HS tự tin trả lời câu hỏi, chia sẻ ý kiến trước lớp.
- GV: + Bước 4 – Nhận xét và dẫn nhập: GV nhận xét câu trả lời của HS và khéo léo dẫn dắt vào bài mới.

##### Hoạt động 2: Khám phá - [Nội dung cụ thể từ tài liệu] (18 phút)
- **Mục tiêu:** [Nêu mục tiêu cụ thể của hoạt động khám phá]
- **Nội dung:** [Các nội dung kiến thức mới cần tìm hiểu từ SGK/tài liệu]
- **Sản phẩm:** [Sản phẩm học tập: câu trả lời, phiếu học tập, kết quả quan sát của học sinh]
- **Cách tiến hành:**
Thiết kế theo tiến trình: 1. GV giao nhiệm vụ -> 2. HS thực hiện nhiệm vụ -> 3. HS trao đổi/chia sẻ -> 4. GV tổ chức báo cáo -> 5. GV nhận xét, chuẩn hóa kiến thức -> 6. HS ghi nhớ/chốt kiến thức.
(Nếu có nhiều nội dung kiến thức, chia thành các đề mục rõ ràng như sau:
1. [Tên nội dung 1]:
- GV: ...
- HS: ...
2. [Tên nội dung 2]:
- GV: ...
- HS: ...
Mỗi bước có hoạt động tương ứng giữa - GV: và - HS: theo cặp đối thoại ngắn gọn, đủ ý).
Sau mỗi nội dung quan trọng phải có phần:
=> KIẾN THỨC CẦN GHI NHỚ: [Hộp kiến thức cốt lõi ngắn gọn, chuẩn xác, phù hợp học sinh tiểu học.]

##### Hoạt động 3: Luyện tập - [Nội dung cụ thể bài tập từ tài liệu] (7 phút)
- **Mục tiêu:** Củng cố và rèn luyện kiến thức vừa học.
- **Nội dung:** Thiết kế bài tập từ dễ đến khó (trắc nghiệm, ghép nối, điền từ, bài tập thực hành trên máy...).
- **Sản phẩm:** Kết quả bài làm, phiếu bài tập hoặc thao tác hoàn thành của học sinh.
- **Cách tiến hành:**
- GV: Nêu yêu cầu bài tập, hướng dẫn cách thực hiện và tiêu chí hoàn thành.
- HS: Trực tiếp làm bài, thực hành, điền kết quả vào vở hoặc phiếu học tập.
- GV: Tổ chức chữa bài, đưa ra đáp án, nhận xét đánh giá.
- HS: Báo cáo kết quả, tự đối chiếu đáp án và sửa sai nếu có.

##### Hoạt động 4: Vận dụng - [Nội dung tình huống thực tế] (5 phút)
- **Mục tiêu:** Vận dụng kiến thức bài học vào đời sống thực tế của học sinh.
- **Nội dung:** Thiết kế tình huống gắn với gia đình, nhà trường hoặc cuộc sống xung quanh.
- **Sản phẩm:** Câu trả lời, giải pháp hoặc sản phẩm sáng tạo thực tế của HS.
- **Cách tiến hành:**
- GV: Nêu nhiệm vụ vận dụng, hướng dẫn cách thức thực hiện.
- HS: Suy nghĩ, liên hệ thực tế bản thân để đưa ra giải pháp/câu trả lời.
- GV: Nhận xét, tuyên dương, dặn dò học sinh.
- HS: Lắng nghe, ghi nhận và thực hiện.

#### IV. ĐIỀU CHỈNH SAU BÀI DẠY
- Những điều đã thực hiện tốt: [Nhận xét cụ thể về mức độ tiếp thu của HS ở Tiết 1]
- Những điều cần rút kinh nghiệm: [Nhận xét cụ thể về thời gian hoặc biện pháp hỗ trợ ở Tiết 1]

==================================================
VI. YÊU CẦU KHI CHIA NHIỀU TIẾT
==================================================

${duration.includes('2') || title.toLowerCase().includes('2 tiết') ? `Bài học có 2 tiết. BẮT BUỘC ĐƯA TIẾT 2 SANG TRANG MỚI (chèn '---' hoặc '[SANG TRANG MỚI]') và có đầy đủ cấu trúc:

---
# KẾ HOẠCH BÀI DẠY
${subject.toUpperCase()} - LỚP ${(grade.replace(/lớp\s*/i, '') || '3').toUpperCase()}
${chapter ? chapter.toUpperCase() : 'CHỦ ĐỀ 1. MÁY TÍNH VÀ EM'}
${title.toUpperCase()} (Tiết 2)

## I. YÊU CẦU CẦN ĐẠT (Dành riêng cho Tiết 2)
### 1. Năng lực đặc thù: (Nêu yêu cầu cần đạt trọng tâm của Tiết 2)
### 2. Năng lực chung: (Gắn với hoạt động của Tiết 2)
### 3. Phẩm chất: (Biểu hiện cụ thể trong Tiết 2)

## II. ĐỒ DÙNG DẠY HỌC (Dành riêng cho Tiết 2)
### 1. Giáo viên: (Đồ dùng cụ thể cho Tiết 2)
### 2. Học sinh: (Đồ dùng cụ thể cho Tiết 2)

## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
#### TIẾT 2: [TÊN NỘI DUNG TIẾT 2]
(LƯU Ý ĐẶC BIỆT: Nếu là bài 1 "Thông tin và quyết định" thì Tiết 2 BẮT BUỘC tiêu đề và nội dung là "Ba dạng thông tin thường gặp" gồm dạng chữ, dạng hình ảnh, dạng âm thanh!)

##### Hoạt động 1: Khởi động - [Trò chơi ôn tập kiến thức Tiết 1 hoặc tình huống kết nối] (5 phút)
- **Mục tiêu:** Tái hiện kiến thức Tiết 1, tạo tâm thế hứng khởi cho Tiết 2.
- **Nội dung:** ...
- **Sản phẩm:** ...
- **Cách tiến hành:**
- GV: ...
- HS: ...

##### Hoạt động 2: Khám phá - [Nội dung cốt lõi Tiết 2] (18 phút)
- **Mục tiêu:** ...
- **Nội dung:** ...
- **Sản phẩm:** ...
- **Cách tiến hành:**
(Các mục 1, 2 kèm cặp - GV: và - HS:)
=> KIẾN THỨC CẦN GHI NHỚ: ...

##### Hoạt động 3: Luyện tập - [Bài tập Tiết 2] (7 phút)
- **Mục tiêu:** ...
- **Nội dung:** ...
- **Sản phẩm:** ...
- **Cách tiến hành:**
- GV: ...
- HS: ...

##### Hoạt động 4: Vận dụng - [Vận dụng tổng hợp cuối bài] (5 phút)
- **Mục tiêu:** ...
- **Nội dung:** ...
- **Sản phẩm:** ...
- **Cách tiến hành:**
- GV: ...
- HS: ...

#### IV. ĐIỀU CHỈNH SAU BÀI DẠY
- Những điều đã thực hiện tốt: [Nhận xét Tiết 2]
- Những điều cần rút kinh nghiệm: [Rút kinh nghiệm Tiết 2]
` : ''}

==================================================
VII. TÍCH HỢP AI VÀ NĂNG LỰC SỐ
==================================================
${aiPowerup ? `Khi tích hợp AI vào hoạt động phù hợp, ghi rõ:
[TÍCH HỢP AI]
- Nội dung tích hợp: ...
- GV thực hiện: ...
- HS quan sát/thực hiện: ...
- Ý nghĩa giáo dục: ...` : 'Chỉ tích hợp khi thực sự phù hợp với bài học.'}

==================================================
VIII. YÊU CẦU ĐẦU RA VÀ NGÔN NGỮ
==================================================
- Viết bằng tiếng Việt chuẩn mực, văn phong sư phạm ngắn gọn, rõ ràng, giàu tính hành động.
- Không viết chung chung; thể hiện rõ từng hành động cụ thể của GV và HS.
- Giữ vững cấu trúc cặp "- GV:" và "- HS:" trong mỗi hoạt động để hệ thống hiển thị bảng 2 cột đối xứng hoàn hảo.
- Xuất bản giáo án hoàn chỉnh sẵn sàng sử dụng ngay!`;
      } else {
        prompt = `Bạn là một Giáo viên Sư phạm xuất sắc tại Việt Nam, chuyên biên soạn giáo án bám sát theo chương trình môn học, Khối lớp, bộ sách "Kết nối tri thức với cuộc sống" (NXB Giáo dục Việt Nam). Tư liệu sách giáo khoa chính thức cực kỳ quan trọng và phải được tham khảo trực tiếp tại địa chỉ cổng thông tin tập huấn của Nhà xuất bản Giáo dục Việt Nam: https://taphuan.nxbgd.vn/
Hãy viết một bản "KẾ HOẠCH BÀI DẠY (GIÁO ÁN)" tối ưu đạt chuẩn **Xuất sắc đủ tiêu chuẩn Kết nối tri thức với cuộc sống (KNTT) đạt điểm chất lượng từ 90% trở lên**. Giáo án phải cực kỳ chi tiết, chuyên nghiệp, khoa học, bám sát theo chương trình môn học, bộ sách "Kết nối tri thức với cuộc sống" (https://taphuan.nxbgd.vn/), có văn phong sư phạm truyền cảm hứng sâu sắc, có tư duy sáng tạo giáo án khác biệt và bám sát tuyệt đối mẫu chuẩn quy định tại CÔNG VĂN 2345 / BGDĐT-GDTH của Bộ Giáo dục và Đào tạo Việt Nam.

${pedagogicalRules}

YÊU CẦU CHỦ CHỐT - BÁM SÁT TUYỆT ĐỐI CHƯƠNG TRÌNH SGK "KẾT NỐI TRI THỨC VỚI CUỘC SỐNG" VÀ TÀI LIỆU ĐÍNH KÈM (HOẠT ĐỘNG, TRANH ẢNH, NỘI DUNG CỐT LÕI):
Toàn bộ các hoạt động học tập (từ Khởi động, Khám phá đến Luyện tập, Vận dụng) không được viết chung chung, mà PHẢI bám sát chặt chẽ theo tài liệu đính kèm (nếu có) và nội dung thực tế, tình huống dẫn dắt, các hộp nhận thức cốt lõi, tranh ảnh minh họa đặc thù của bộ sách giáo khoa "Kết nối tri thức với cuộc sống" hiện hành do Nhà xuất bản Giáo dục Việt Nam phát hành:
- ĐẶC BIỆT CHÚ TRỌNG TRANH ẢNH VÀ ĐỒ HỌA TRONG SGK: Trong mỗi hoạt động, bạn PHẢI mô tả chi tiết, rõ ràng các TRANH ẢNH, HÌNH VẼ MINH HỌA trực quan có trong sách giáo khoa / tài liệu đính kèm liên quan đến bài học này (Ví dụ: tranh vẽ các bạn học sinh Minh, An, Khoa kết hợp cùng nhân vật Rô-bốt thông minh của bộ sách Kết nối tri thức; tranh ảnh về các thiết bị phần cứng, phần mềm, các biểu tượng phần mềm vẽ Paint, bàn phím màu sắc rực rỡ, sơ đồ tư duy, bảng biểu, hộp hội thoại...). Chỉ rõ học sinh quan sát bức tranh nào, phân tích hình ảnh gì trong sách giáo khoa để dẫn dắt kiến thức.
- Các hoạt động cụ thể cần biên soạn tỉ mỉ như sau:
  1. Hoạt động 1: Khởi động - Sử dụng đúng tình huống mở đầu, mô tả tranh ảnh khởi động trong tài liệu đính kèm/SGK, câu hỏi gợi mở bối cảnh cụ thể hoặc hoạt động quan sát tranh thực tế được biên soạn riêng trong SGK "Kết nối tri thức với cuộc sống" cho bài học này để kích thích sự tò mò của học sinh dẫn vào chủ đề.
  2. Hoạt động 2: Khám phá, hình thành kiến thức - Chia nhỏ tiến trình thành các mục/hoạt động khám phá khớp đúng với các đề mục lý thuyết và tranh vẽ hướng dẫn của tài liệu đính kèm / bộ sách Kết nối tri thức. Đối với mỗi mục lý thuyết, cần mô tả chi tiết: hoạt động quan sát tranh vẽ/hình họa và đọc sách khám phá; Hộp kiến thức cốt lõi (văn bản đóng khung ghi nhớ chính xác) và câu hỏi kiểm tra nhanh cuối đề mục như kết cấu của bài học gốc. Lồng ghép khéo léo phương pháp và học liệu hỗ trợ.
  3. Hoạt động 3: Luyện tập, thực hành - Sử dụng đúng các yêu cầu thực hành máy tính, câu hỏi trắc nghiệm/tự luận, bài tập củng cố kèm sơ đồ hình ảnh minh họa bài mẫu được in tại phần "Luyện tập" ở cuối bài học của tài liệu đính kèm / SGK để đánh giá và củng cố năng lực.
  4. Hoạt động 4: Vận dụng, trải nghiệm sáng tạo - Sử dụng hoặc phát triển mở rộng từ chính các tình huống thử thách thực tế, bài tập liên hệ cuộc sống, sơ đồ gợi ý tại mục "Vận dụng" ở cuối bài học của tài liệu đính kèm / SGK hướng dẫn học sinh liên kết bài đã học về môi trường sống, gia đình hoặc học tập của riêng các con.

${attachmentsContext}

THÔNG TIN BÀI HỌC CỦA THẦY CÔ CUNG CẤP:
- Cấp học: ${stage === 'tieuhoc' ? 'Tiểu học' : stage === 'thcs' ? 'Trung học cơ sở' : 'Trung học phổ thông'}
- Khối lớp: ${grade}
- Môn học: ${subject}
- Thời lượng: ${duration} (Số tiết dạy)
- Sĩ số lớp lý tưởng: ${studentCount}
- Tên bài dạy: ${title}
- Năng lực cần phát triển: ${competencyStatement}
- Năng lực Trí tuệ nhân tạo (AI): ${aiCompetencyStatement}
- Đồ dùng dạy học: ${toolsStatement}
- Công cụ/Ứng dụng Công nghệ tích hợp: ${techStatement}
- Trò chơi giáo dục đi kèm: ${gamesStatement}
- Phương pháp dạy học chủ đạo: ${methodsStatement}
- NỘI DUNG CỐT LÕI CỦA BÀI HỌC (BÁM SÁT "YÊU CẦU CẦN ĐẠT" TỪ TAPHUAN.NXBGD.VN VÀ TÀI LIỆU ĐÍNH KÈM): ${lessonContent ? `\n[BẮT BUỘC BÁM SÁT 100%]: Thầy Cô đã cung cấp Yêu cầu cần đạt / nội dung cốt lõi từ cổng taphuan.nxbgd.vn:\n"""\n${lessonContent}\n"""\nToàn bộ mục tiêu phẩm chất năng lực, các hoạt động khám phá và bài tập luyện tập trong tất cả các tiết BẮT BUỘC phải bám sát đầy đủ các yêu cầu cần đạt nêu trên!` : 'Hãy bám sát chuẩn Yêu cầu cần đạt của bài học theo SGK "Kết nối tri thức với cuộc sống" từ cổng tập huấn taphuan.nxbgd.vn và tài liệu đính kèm.'}

Layout customizations enabled by teacher:
- Header style: ${layoutOptions?.headerStyle || 'standard'}
- includeQuiz: ${layoutOptions?.includeQuiz ?? true}
- includeHomework: ${layoutOptions?.includeHomework ?? true}
- includeAssessment: ${layoutOptions?.includeAssessment ?? true}
- excludeSubActivities: ${layoutOptions?.excludeSubActivities ?? false}

${layoutOptions?.excludeSubActivities ? `
- YÊU CẦU CỐT LÕI - KHÔNG CHIA HOẠT ĐỘNG NHỎ: Trong mỗi Hoạt động học tập lớn (như Khởi động, Khám phá, Luyện tập, Vận dụng), bạn TUYỆT ĐỐI KHÔNG ĐƯỢC tự ý chia nhỏ cấu trúc hoạt động thành các hoạt động nhỏ phụ thuộc hay viết bất kì tiêu đề phụ dạng Hoạt động 1.1, Hoạt động 1.2, Hoạt động 1a, Hoạt động 1b... Hãy viết kịch bản Cách tiến hành trực tiếp là một chuỗi hành động hoặc đoạn đối thoại GV-HS liên tục, mạch lạc, không chia nhỏ rườm rà.
` : ''}

LƯU Ý ĐẶC BIỆT KHI SOẠN THEO CÔNG VĂN 2345 CHUẨN CỦA BỘ:
${periodPlanInstructions}
- QUY TẮC CHÍNH TẢ HÀNH CHÍNH & SƯ PHẠM VIỆT NAM BẮT BUỘC: Tất cả phần văn bản nằm ngay sau dấu hai chấm (:) ở bất kỳ dòng hay mục nào đều phải luôn viết hoa chữ cái đầu tiên (sau dấu cách). Tuyệt đối không viết chữ thường ngay sau dấu hai chấm (:). Hãy đảm bảo quy tắc này được áp dụng đồng bộ khắp toàn bộ cả bài giáo án. Ví dụ:
  + "- Giáo viên: Máy tính, máy chiếu..." (Chú ý: sau Giáo viên: phải viết hoa chữ Máy tính, không viết chữ thường "máy tính")
  + "- Học sinh: Sách giáo khoa..." (Chú ý: sau Học sinh: phải viết hoa chữ Sách, không viết thường "sách")
  + "- Phẩm chất: Chăm chỉ..."
  + "- Mục tiêu: Học sinh chỉ ra..."
- QUY TẮC ĐỊNH DẠNG NĂNG LỰC BẮT BUỘC:
  + Tiêu đề mục 1 là "1. Năng lực đặc thù:". Năng lực đặc thù dựa vào trường dữ liệu "Bộ môn / Môn học" (${subject}) để biên soạn.
  + Các văn bản sau BẮT BUỘC định dạng chữ đậm: "**- Năng lực số:**", "**- Tự chủ và tự học:**", "**- Giao tiếp và hợp tác:**", "**- Giải quyết vấn đề và sáng tạo:**".
- YÊU CẦU TIÊU ĐỀ TIẾT BẮT BUỘC có tên hoạt động/chủ đề cụ thể đi kèm: Tuyệt đối không bao giờ được ghi '#### TIẾT 1' trống hay không có tên hoạt động của bài học. Hãy luôn ghi cụ thể và chính xác dạng: '#### TIẾT 1: <Tên hoạt động/Nội dung chính>', '#### TIẾT 2: <Tên hoạt động/Nội dung chính>' làm tiêu đề phân chia tiết bên ngoài bảng.
- BỐ CỤC TIẾT 2 BẮT BUỘC ĐỒNG BỘ TIẾT 1: Các hoạt động trong bảng "III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:" ở Tiết 2 phải có bố cục giống Tiết 1. Cách tiến hành ở hoạt động khám phá có các bước (Bước 1, Bước 2, Bước 3, Bước 4) giống Tiết 1.

BẮT BUỘC THIẾT LẬP THÔNG TIN TRA CỨU SÁCH Ở ĐẦU BÀI DẠY:
Ngay dưới tiêu đề bài học chính và trước khi đi vào mục I, bạn BẮT BUỘC phải chèn một khối thông tin tra cứu ngắn gọn sau đây:
* **Bộ sách áp dụng hiện hành:** Kết nối tri thức với cuộc sống (Nhà xuất bản Giáo dục Việt Nam).
* **Nguồn học liệu tra cứu chính thức:** Học liệu tập huấn và sách điện tử tại cổng thông tin [taphuan.nxbgd.vn](https://taphuan.nxbgd.vn/).

BẮT BUỘC THIẾT LẬP CÁC PHẦN THEO TIÊU ĐỀ BỐ CỤC TÙY CHỈNH DƯỚI ĐÂY:

### ${layoutOptions?.customObjectiveName || 'I. YÊU CẦU CẦN ĐẠT'}
1. **${layoutOptions?.customITCompetency || 'Năng lực đặc thù'}:**
   (Dựa vào trường dữ liệu "Bộ môn / Môn học" (${subject}) để biên soạn các yêu cầu cần đạt về năng lực đặc thù)
   - [AI BIÊN SOẠN THEO CÁC MỤC ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN"]:
   ${specificCompetencyStatement}
   - **Năng lực số:** [Nêu biểu hiện sử dụng công nghệ số an toàn, hiệu quả (nếu có)]
   ${aiPowerup ? `- **Năng lực AI (theo QĐ 3439):** tự liên hệ thực tế, lồng ghép tư duy máy học và đạo đức công nghệ số (theo QĐ 3439) (AI biên soạn theo các mục đã chọn tại thẻ 'giáo án cơ bản'). Bước đầu nhận biết vai trò của AI và công nghệ số thông minh trong học tập và đời sống.` : ''}
2. **${layoutOptions?.customGeneralCompetency || 'Năng lực chung'}:**
   - **Tự chủ và tự học:** [Học sinh tự quan sát, chủ động suy nghĩ, thực hiện nhiệm vụ cá nhân]
   - **Giao tiếp và hợp tác:** [Học sinh trao đổi cặp đôi/nhóm, chia sẻ kết quả với bạn]
   - **Giải quyết vấn đề và sáng tạo:** [Học sinh xử lý tình huống, lựa chọn phương án và giải quyết vấn đề]
   ${generalCompetencyStatement}
3. **${layoutOptions?.customQualities || 'Phẩm chất'}:**
   - [AI BIÊN SOẠN THEO CÁC MỤC ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN"]:
   ${qualitiesStatement}

### ${layoutOptions?.customToolsName || 'II. ĐỒ DÙNG DẠY HỌC'}
- [AI BIÊN SOẠN THEO CÁC MỤC ĐÃ CHỌN TẠI THẺ "GIÁO ÁN CƠ BẢN"]:
${toolsStatement}
${techStatement}
(LƯU Ý ĐỊNH DẠNG: Chỉ in đậm cụm từ **- Giáo viên:** và **- Học sinh:**, phần liệt kê phía sau viết chữ thường bình thường, KHÔNG in đậm toàn bộ dòng).

### ${layoutOptions?.customActivitiesName || 'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU'}
YÊU CẦU PHÂN CHIA TIẾT HỌC RÕ RỆT NGOÀI BẢNG:
Ngay dưới tiêu đề "### ${layoutOptions?.customActivitiesName || 'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU'}", bạn phải ghi rõ tiêu đề phụ nằm độc lập ngoài bảng ở định dạng '#### TIẾT X: <Tên hoạt động/Nội dung chính>' (Ví dụ: #### TIẾT 1: THÔNG TIN VÀ QUYẾT ĐỊNH):
- Nếu bài học có 1 tiết: Ghi rõ "#### ${layoutOptions?.customPeriod1 || 'TIẾT 1'}: <Tên hoạt động/Nội dung chính>" nằm độc lập ngoài bảng trước khi đi vào các hoạt động chi tiết.
- Nếu bài học có 2 tiết trở lên: Bạn phải ghi rõ các tiêu đề "#### ${layoutOptions?.customPeriod1 || 'TIẾT 1'}: <Tên hoạt động/Nội dung chính>" và "#### ${layoutOptions?.customPeriod2 || 'TIẾT 2'}: <Tên hoạt động/Nội dung chính>" nằm ngoài bảng trước các nhóm hoạt động tương ứng của tiết học đó. TIẾT 2 PHẢI CÓ CẤU TRÚC VÀ ĐỘ CHI TIẾT TƯƠNG ĐỒNG 100% VỚI TIẾT 1.

${activitiesPrompt}

${layoutOptions?.includeQuiz ? `
### IV. BÀI TẬP TRẮC NGHIỆM ÔN TẬP NHANH (MẪU TÙY CHỈNH)
Hãy soạn thảo 3 câu hỏi trắc nghiệm kiểm tra khách quan ngắn (4 đáp án A, B, C, D) bao quát nội dung cốt lõi của bài học vừa rồi. Chỉ rõ đáp án đúng và chú thích ngắn gọn để giáo viên sử dụng được ngay.
` : ''}

${layoutOptions?.includeHomework ? `
### V. PHIẾU BÀI TẬP VẬN DỤNG & SÁNG TẠO TẠI NHÀ
Thiết kế 1 bài thực hành/thử thách sáng tạo nhỏ liên hệ thực tế cuộc sống để học sinh tự làm tại nhà hoặc thảo luận cùng cha mẹ, có hướng dẫn ngắn gọn cho học sinh tự học hiệu quả.
` : ''}

${layoutOptions?.includeAssessment ? `
### VI. TIÊU CHÍ ĐÁNH GIÁ CHẤT LƯỢNG (BÁM SÁT CÔNG VĂN 2345)
Lập bảng đánh giá mức độ đạt yêu cầu cần đạt của bài học theo 3 mức (Hoàn thành tốt, Hoàn thành, Chưa hoàn thành) tương ứng với từng năng lực tin học và phẩm chất cốt lõi phát triển qua bài học này.
` : ''}

### ${layoutOptions?.customAdjustmentName || 'IV. ĐIỀU CHỈNH SAU BÀI DẠY'}
YÊU CẦU CỰC KỲ QUAN TRỌNG: Bạn hãy tự suy luận và viết 1 - 2 câu nhận xét cụ thể, thiết thực cho bài dạy bài học này. Tuyệt đối không để trống hay dùng những dòng dấu chấm!
- **Những điều đã thực hiện tốt**: [GV tự nhận xét về mức độ tiếp thu và hứng thú của Học sinh đối với các hoạt động trong bài học này]
- **Những điều cần rút kinh nghiệm**: [GV tự nhận xét rút kinh nghiệm về phân bổ thời gian hoặc phương pháp tương tác cho bài học này]

Hãy bắt đầu viết trực tiếp bằng tiếng Việt, trình bày thật khoa học dưới dạng Markdown, có định dạng rõ ràng, bố cục rành mạch và văn phong mô phạm chuẩn mực nhất!`;
      }

      // Structure contents array matching Google GenAI SDK patterns (supports multimodal textbook snapshot analysis)
      const contentsParts: any[] = [];
      if (imageInlineDataParts.length > 0) {
        imageInlineDataParts.forEach((part: any) => {
          contentsParts.push(part);
        });
      }
      contentsParts.push({ text: prompt });

      const gdpt2018SystemInstruction = `Bạn là chuyên gia xây dựng Kế hoạch bài dạy tiểu học theo Chương trình GDPT 2018 (Công văn 2345/BGDĐT-GDTH)${isGDPT2018Detailed ? ' dạng CHI TIẾT đặc biệt phục vụ dự giờ, hội giảng, thao giảng giáo viên dạy giỏi các cấp' : ''}. Sử dụng mô hình AI Gemini Flash 3 Preview chất lượng cao. Hãy xây dựng một KẾ HOẠCH BÀI DẠY hoàn chỉnh bám sát TUYỆT ĐỐI cấu trúc, văn phong và định dạng chuẩn mực Công văn 2345/BGDĐT-GDTH. Bám sát tuyệt đối nội dung bài học SGK và tài liệu đính kèm. ${isGDPT2018Detailed ? 'ĐẶC BIỆT: Thực hiện ĐẦY ĐỦ CÁC BƯỚC (Bước 1, Bước 2, Bước 3, Bước 4), PHÂN RÃ KỊCH BẢN CHI TIẾT 2 VAI ĐỐI THOẠI SONG HÀNH GIỮA GIÁO VIÊN & HỌC SINH có lời thoại trực tiếp trong ngoặc kép ở cả 2 cột GV và HS (GV nói gì, HS thưa gì lễ phép, câu trả lời, nhận xét chéo cụ thể).' : ''} Thiết kế tiến trình dạy học gồm 2 cột nội dung tương ứng: HOẠT ĐỘNG CỦA GIÁO VIÊN (bắt đầu bằng dấu cộng '+ Bước ...: GV ...' hoặc '+ GV ...') và HOẠT ĐỘNG CỦA HỌC SINH (bắt đầu bằng dấu trừ '- Bước ...: HS ...' hoặc '- HS ...'). Tuyệt đối không dùng ký tự '|' vẽ bảng markdown, không viết lặp lại tiền tố '- GV: + GV:' hay '+ GV: | - GV:'. Tuyệt đối không lặp lại 'Bước 1' trong cùng một hoạt động. Tuyệt đối không tạo hàng thừa hay câu hỏi đứng riêng như '2. "Em hãy cho biết..."'. Mọi câu hỏi của GV phải nằm trong dòng của GV (tiền tố '- GV ...'). QUY TẮC KHOẢNG TRỐNG TÊN BÀI VÀ TIẾT DẠY: Tên bài học và số tiết BẮT BUỘC có đúng 01 khoảng trống ở giữa (ví dụ: '**BÀI 1: THÔNG TIN VÀ QUYẾT ĐỊNH (TIẾT 1)**', '**BÀI 1: THÔNG TIN VÀ QUYẾT ĐỊNH (TIẾT 2)**'), tuyệt đối không viết dính liền thành '...QUYẾT ĐỊNH(TIẾT 1)'. Dẫn dắt vào bài hoặc phần mới tự động định dạng in đậm: Nếu là tựa bài thì in đậm toàn bộ (ví dụ: '**Bài 2: Xử lý thông tin**'); nếu là phần mới thì in đậm tên phần (ví dụ: 'phần 3: **Sử dụng máy tính đúng cách**'). QUY TẮC HỘP KIẾN THỨC BẮT BUỘC: Hoạt động nào có 'Hộp kiến thức' (kiến thức cốt lõi, quy tắc, ghi nhớ đóng khung trong SGK hoặc tài liệu đính kèm) thì BẮT BUỘC phải chốt lại ngay ở hoạt động đó (ở bước chốt kiến thức: GV chốt lại Hộp kiến thức ngắn gọn, chuẩn xác vào bảng/vở, HS khắc sâu và ghi/đóng khung Hộp kiến thức vào vở). QUY TẮC ĐỊNH DẠNG CHỮ ĐẬM TÊN PHƯƠNG PHÁP SƯ PHẠM: Hoạt động có sử dụng phương pháp sư phạm nào thì BẮT BUỘC định dạng chữ in đậm tên phương pháp đó (ví dụ: '**phương pháp trực quan**', '**phương pháp vấn đáp**', '**phương pháp thảo luận nhóm**', '**phương pháp thực hành**', '**phương pháp giải quyết vấn đề**', '**phương pháp trò chơi**', '**phương pháp đóng vai**'). Tuyệt đối không dùng placeholder chung chung mà biên soạn cụ thể thao tác của học sinh. Tích hợp năng lực AI (theo QĐ 3439) và năng lực số khi phù hợp. BẮT BUỘC sử dụng ký hiệu mũi tên chuẩn '→' trong các sơ đồ luồng kiến thức, sơ đồ tư duy. BẮT BUỘC sử dụng công cụ AI Flash 3 preview soạn đúng và đầy đủ theo Số tiết dạy được yêu cầu: Nếu người dùng chọn 3 tiết thì BẮT BUỘC soạn đủ cả 3 tiết (Tiết 1, Tiết 2, Tiết 3); tuyệt đối không dừng lại ở 1 hoặc 2 tiết! Cấu trúc và prompt tạo cho Tiết 2, Tiết 3 (và các tiết tiếp theo) BẮT BUỘC phải giống hệt và tương đồng 100% với Tiết 1: mỗi tiết đều có cấu trúc chuẩn mực độc lập (đầy đủ Tiêu đề bài học Tiết X, Mục I Yêu cầu cần đạt, Mục II Đồ dùng dạy học, Mục III Các hoạt động dạy học chủ yếu có bảng 2 cột GV/HS gồm 4 hoạt động chuẩn, Mục IV Điều chỉnh sau bài dạy, và ngăn cách giữa các tiết bằng dấu phân trang '---'). BẮT BUỘC ĐẦY ĐỦ CẢ 4 HOẠT ĐỘNG: Ở từng tiết (kể cả Tiết 2, Tiết 3...), Mục III BẮT BUỘC phải có đầy đủ 4 hoạt động: Hoạt động 1 Khởi động (5 phút), Hoạt động 2 Khám phá (15 phút), Hoạt động 3 Luyện tập (10 phút), Hoạt động 4 Vận dụng (5 phút); tuyệt đối không cắt giảm hay bỏ sót hoạt động nào, và không đưa Năng lực, Phẩm chất hay Đồ dùng dạy học xuống dưới Mục III. Bảng 'Các hoạt động dạy học chủ yếu' ở Tiết 2 và các tiết tiếp theo BẮT BUỘC bắt đầu ngay bằng '1. Hoạt động 1: Khởi động (5 phút)', tuyệt đối không có hàng dư thừa nằm trên hàng hoạt động 1. Mọi nơi nhắc đến Sách giáo khoa BẮT BUỘC ghi rõ tên bộ sách: 'Sách giáo khoa ${subject} ${cleanGradeNum} (bộ sách ${curriculumBook || 'Kết nối tri thức với cuộc sống'})', 'SGK ${subject} ${cleanGradeNum} (${curriculumBook || 'Kết nối tri thức'})'. QUY TẮC CÁC KHUNG CHỨC NĂNG: (1) Khung 'Ứng dụng công nghệ số': BẮT BUỘC TUYỆT ĐỐI KHÔNG thêm hoặc tích hợp vào mục 'II. ĐỒ DÙNG DẠY HỌC'. Tên ứng dụng trong bảng 'KẾT QUẢ KẾ HOẠCH BÀI DẠY' BẮT BUỘC có định dạng chữ đậm và được để trong ' ' (ví dụ: **"Wordwall"**, **"Kahoot"**, **"Quizizz"**, **"Padlet"**, **"Canva"**, **"GeoGebra"**). Sử dụng công cụ AI Flash 3 preview dựa vào 'Tài liệu đính kèm minh họa' hoặc 'Tra cứu trang taphuan.nxbgd.vn' (ưu tiên tài liệu đính kèm nếu có). Nếu có 'Tên ứng dụng hoặc trang web ứng dụng' người dùng nhập thì đưa chính xác ứng dụng/trang web đó vào giáo án bài học; nếu Bật tùy chọn 'AI tự đề xuất' thì dựa vào tài liệu đính kèm hoặc taphuan.nxbgd.vn để đưa ra các ứng dụng công nghệ số phù hợp với giáo án. (2) Khung 'Kết hợp trò chơi học tập': BẮT BUỘC TUYỆT ĐỐI KHÔNG thêm hoặc tích hợp vào mục 'II. ĐỒ DÙNG DẠY HỌC'. Tên trò chơi trong bảng 'KẾT QUẢ KẾ HOẠCH BÀI DẠY' BẮT BUỘC có định dạng chữ đậm và được để trong ' ' (ví dụ: **"Ai nhanh hơn"**, **"Rung chuông vàng"**, **"Hộp quà bí mật"**, **"Mảnh ghép kì diệu"**). Sử dụng công cụ AI Flash 3 preview dựa vào 'Tài liệu đính kèm minh họa' hoặc 'Tra cứu trang taphuan.nxbgd.vn' (ưu tiên tài liệu đính kèm nếu có). Nếu có 'Tên trò chơi hoặc Mô tả trò chơi' người dùng nhập thì đưa chính xác trò chơi đó tích hợp vào giáo án; nếu Bật tùy chọn 'AI tự đề xuất' thì dựa vào tài liệu đính kèm hoặc taphuan.nxbgd.vn để đưa ra các trò chơi học tập phù hợp với giáo án. (3) Khung '🏫 Phương pháp sư phạm': Sử dụng công cụ AI Flash 3 preview. Khi chọn các tùy chọn thì tích hợp các phương pháp sư phạm đó vào các 'Hoạt động dạy học' trong giáo án phù hợp nhất; nếu Bật tùy chọn 'AI tự đề xuất' thì dựa vào 'Tài liệu đính kèm minh họa' hoặc 'Tra cứu trang taphuan.nxbgd.vn' (ưu tiên tài liệu đính kèm nếu có) để đưa ra các phương pháp sư phạm phù hợp nhất với giáo án của bài học. (4) Khung '🎯 Năng lực cần phát triển': Nếu Bật tùy chọn 'AI tự đề xuất' thì công cụ AI Flash 3 preview BẮT BUỘC dựa vào 'Tài liệu đính kèm minh họa' hoặc 'Tra cứu trang taphuan.nxbgd.vn' (ưu tiên tài liệu đính kèm nếu có) để đưa ra các năng lực cần phát triển phù hợp nhất với giáo án bài học đó; tuyệt đối không ép buộc chỉ lấy các tùy chọn đã chọn trước đó. (5) Khung '🛠️ Đồ dùng dạy học': Nếu Bật tùy chọn 'AI tự đề xuất' thì công cụ AI Flash 3 preview BẮT BUỘC dựa vào 'Tài liệu đính kèm minh họa' hoặc 'Tra cứu trang taphuan.nxbgd.vn' (ưu tiên tài liệu đính kèm nếu có) để đưa ra các Đồ dùng dạy học (chỉ thay đổi với mục giáo viên) phù hợp nhất với giáo án bài học đó; tuyệt đối không ép buộc chỉ lấy các tùy chọn đã chọn trước đó.`;
      const basicSystemInstruction = "Bạn là chuyên gia xây dựng Kế hoạch bài dạy tiểu học theo Chương trình GDPT 2018, có kinh nghiệm thiết kế giáo án theo định hướng phát triển phẩm chất, năng lực học sinh. Hãy xây dựng một KẾ HOẠCH BÀI DẠY hoàn chỉnh dựa trên tài liệu/bài học được cung cấp. Bám sát tuyệt đối nội dung bài học, SGK và tài liệu cung cấp. Không tự ý thay đổi kiến thức cốt lõi. Thiết kế theo định hướng phát triển phẩm chất và năng lực của CTGDPT 2018. Hoạt động có tính khả thi trong lớp học thực tế. Phân biệt rõ hoạt động của GIÁO VIÊN và HỌC SINH. Mỗi hoạt động thể hiện rõ: Mục tiêu -> Nội dung -> Sản phẩm -> Cách tiến hành.";
      const detailedSystemInstruction = "Bạn là chuyên gia cố vấn sư phạm và Biên soạn chương trình sách giáo khoa Tiểu học xuất sắc của Bộ Giáo dục Việt Nam. Nhiệm vụ của bạn là dệt nên những giáo án đạt chuẩn xuất sắc (từ 90 điểm trở lên theo khung đánh giá KNTT và Công văn 2345). Bạn luôn luôn cung cấp kịch bản lời thoại vô cùng chi tiết, tinh tế, lời dẫn trực tiếp biểu cảm, giàu tình huống thực tiễn và lôi cuốn cho từng hoạt động dạy học. Bạn luôn bám sát 100% tài liệu đính kèm (ảnh SGK, file pptx, docx) mà giáo viên cung cấp.";

      // Always call Google Gen AI from the server-side with robust high-demand fallback
      const response = await generateContentWithFallback(client, {
        model: "gemini-3-flash-preview",
        contents: contentsParts,
        config: {
          systemInstruction: isGDPT2018 
            ? gdpt2018SystemInstruction 
            : (layoutOptions?.isBasic ? basicSystemInstruction : detailedSystemInstruction),
          temperature: isGDPT2018 ? 0.7 : (layoutOptions?.isBasic ? 0.7 : 0.75),
          maxOutputTokens: 8192
        }
      });

      let generatedPlan = extractGeminiText(response);
      if (!generatedPlan || generatedPlan.trim().length === 0) {
        throw new Error("Không có kết quả trả về từ Gemini sau khi thử tất cả các mô hình.");
      }

      // Ensure "I. YÊU CẦU CẦN ĐẠT ### 1. Năng lực đặc thù" is split into two separate lines
      generatedPlan = generatedPlan.replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*|\s+)?1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, isGDPT2018 ? "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù" : "I. YÊU CẦU CẦN ĐẠT:\n1. Năng lực đặc thù:");
      generatedPlan = generatedPlan.replace(/(?:#{1,6}\s*)?I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT[:\s]*(?:#{1,6}\s*)+/gi, "I. YÊU CẦU CẦN ĐẠT:\n");

      // Normalize space between lesson title and period (e.g. "QUYẾT ĐỊNH(TIẾT 1)" -> "QUYẾT ĐỊNH (TIẾT 1)")
      generatedPlan = generatedPlan.replace(/([^\s\n>])\s*\((TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)\s*(\d*)\)/gi, (_m, p1, p2, p3) => {
        return p3 ? `${p1} (${p2} ${p3})` : `${p1} (${p2})`;
      });
      generatedPlan = generatedPlan.replace(/\((TIẾT|Tiết|tiết)(\d+)\)/gi, "($1 $2)");
      generatedPlan = generatedPlan.replace(/\((\d+)(TIẾT|Tiết|tiết)\)/gi, "($1 $2)");
      generatedPlan = generatedPlan.replace(/([^\s\n>])\s{2,}\((TIẾT|Tiết|tiết|\d+\s*TIẾT|\d+\s*tiết)/gi, "$1 ($2");

      if (isGDPT2018) {
        generatedPlan = generatedPlan.replace(/(?:#{1,6}\s*)?1\.\s*Năng\s*lực\s*đặc\s*thù(?:\s+môn(?:\s+[a-zA-ZÀ-ỹ\s]+)?)?:?/gi, "### 1. Năng lực đặc thù");
        generatedPlan = generatedPlan.replace(/(?:#{1,6}\s*)?2\.\s*Năng\s*lực\s*chung:?/gi, "### 2. Năng lực chung");
        generatedPlan = generatedPlan.replace(/(?:#{1,6}\s*)?3\.\s*Phẩm\s*chất:?/gi, "### 3. Phẩm chất");
        generatedPlan = generatedPlan.replace(/(?:#{1,6}\s*)?II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC:?/gi, "## II. ĐỒ DÙNG DẠY HỌC");
        generatedPlan = generatedPlan.replace(/(?:#{1,6}\s*)?III\.\s*CÁC\s*HOẠT\s*ĐỘNG\s*DẠY\s*HỌC\s*CHỦ\s*YẾU:?/gi, "## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU");

        // Normalize teaching tools phrases
        generatedPlan = generatedPlan.replace(/Phòng\s*thực\s*hành\s*máy\s*tính(?:\s*hoạt\s*động\s*tốt)?/gi, "Phòng máy tính");
        generatedPlan = generatedPlan.replace(/Máy\s*tính\s*thực\s*hành/gi, "Phòng máy tính");
        generatedPlan = generatedPlan.replace(/Bài\s*giảng(?:\s*điện\s*tử)?\s+(?:BÀI|Bài)\s*\d+[\.\:\s][^,;\.\n\r<]*/gi, "Bài giảng điện tử");
        generatedPlan = generatedPlan.replace(/Bài\s*giảng\s+(?:BÀI|Bài)\s*[^,;\.\n\r<]*/gi, "Bài giảng điện tử");
        generatedPlan = generatedPlan.replace(/Tranh\s*ảnh\s*(?:phóng\s*to\s*)?(?:các\s+)?Hình\s*([\d,\s\.\-–và]+)\s*SGK\s*Trang\s*\*,\s*([\d,\s\.\-–và]+)\s*(SGK\s*Trang\s*[\d,\s\.\-–và]+)/gi, 
          (_m, f1, f2, pages) => `Tranh ảnh Hình ${f1.trim().replace(/,\s*$/, "")}, ${f2.trim().replace(/^,\s*/, "")} ${pages.trim()}`
        );

        // Clean Section II: Ensure digital apps and games are NEVER in Section II
        generatedPlan = generatedPlan.replace(/(##\s*II\.\s*ĐỒ\s*DÙNG\s*DẠY\s*HỌC[\s\S]*?)(?=##\s*III|\n---|\n===|$)/gi, (secIIMatch) => {
          let cleaned = secIIMatch;
          cleaned = cleaned.replace(/(- Giáo viên:[^\n]*)/gi, (gvLine) => {
            let l = gvLine;
            l = l.replace(/,?\s*(?:ứng dụng|trang web|phần mềm)?[\s\w\/:]*(?:Kahoot|Quizizz|Padlet|Canva|Wordwall|GeoGebra|Liveworksheets)[^,;\.\n]*/gi, '');
            l = l.replace(/,?\s*Ứng dụng công nghệ số[^,;\.\n]*/gi, '');
            l = l.replace(/,?\s*Trò chơi học tập[^,;\.\n]*/gi, '');
            l = l.replace(/,?\s*(?:trò chơi|Trò chơi)[\s\w\/:]*(?:Ai nhanh hơn|Rung chuông vàng|Hộp quà bí mật|Mảnh ghép kì diệu)[^,;\.\n]*/gi, '');
            l = l.replace(/,\s*,/g, ',').replace(/:\s*,/g, ': ').replace(/,\s*\./g, '.');
            return l;
          });
          return cleaned;
        });

        // Format games and tech apps: Bold and in quotes " " (e.g. **"Wordwall"**, **"Ai nhanh hơn"**)
        const gamesAndTechList = [
          "Ai nhanh hơn", "Rung chuông vàng", "Hộp quà bí mật", "Mảnh ghép kì diệu", "Mảnh ghép kỳ diệu",
          "Hộp quà bí ẩn", "Vòng quay may mắn", "Ong non tìm việc", "Ong tìm mật", "Đố vui",
          "Vượt chướng ngại vật", "Giải cứu đại dương", "Bức tranh bí ẩn", "Hái hoa dân chủ",
          "Truy tìm kho báu", "Nhà thông thái nhí", "Đố bạn", "Đường lên đỉnh Olympia",
          "Ai là triệu phú", "Tiếp sức", "Ai là ai", "Thám tử mạng", "Mặt nạ cảm xúc",
          "Khởi động vui học", "Làm theo hiệu lệnh",
          "Kahoot", "Quizizz", "Padlet", "Canva", "Wordwall", "GeoGebra", "Liveworksheets",
          "PowerPoint", "Google Forms", "Mentimeter", "Blooket", "Nearpod", "Quizlet",
          "ClassDojo", "Edpuzzle", "Scratch", "Plickers", "Gimkit", "Baamboozle"
        ];
        if (cleanedTech) {
          const rawTechs = cleanedTech.split(/[,;\n]+/).map(s => s.trim().replace(/^['"“”]+|['"“”]+$/g, '')).filter(Boolean);
          gamesAndTechList.push(...rawTechs);
        }
        if (cleanedGame) {
          const rawGames = cleanedGame.split(/[,;\n]+/).map(s => s.trim().replace(/^['"“”]+|['"“”]+$/g, '')).filter(Boolean);
          gamesAndTechList.push(...rawGames);
        }
        const uniqueItems = Array.from(new Set(gamesAndTechList)).filter(k => k.length >= 2);
        uniqueItems.sort((a, b) => b.length - a.length);

        uniqueItems.forEach(item => {
          const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          generatedPlan = generatedPlan.replace(new RegExp(`(?:\\*\\*["“”]|["“”]\\*\\*)\\s*(${escaped})\\s*(?:["“”]\\*\\*|\\*\\*["“”])`, 'gi'), `**"${item}"**`);
          generatedPlan = generatedPlan.replace(new RegExp(`(?<!["“”])\\*\\*(${escaped})\\*\\*(?!["“”])`, 'gi'), `**"${item}"**`);
          generatedPlan = generatedPlan.replace(new RegExp(`(?<!\\*\\*)["“”](${escaped})["“”](?!\\*\\*)`, 'gi'), `**"${item}"**`);
          generatedPlan = generatedPlan.replace(new RegExp(`(?<!(?:\\*\\*["“”]|["“”]\\*\\*|\\*\\*|["“”]))\\b(${escaped})\\b(?!(?:["“”]\\*\\*|\\*\\*["“”]|\\*\\*|["“”]))`, 'gi'), `**"${item}"**`);
        });
        generatedPlan = generatedPlan.replace(/\*{4,}/g, '**');
      }

      return res.json({ plan: generatedPlan });

    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      const errInfo = extractErrorInfo(error);
      let detail = "Đã xảy ra lỗi khi kết nối với máy chủ AI.";
      if (errInfo.isQuota) {
        detail = "Dịch vụ AI miễn phí mặc định hiện đã đạt giới hạn cuộc gọi hôm nay (Mã lỗi 429 - Quota Exceeded). Để tiếp tục soạn giáo án không giới hạn, Thầy Cô vui lòng nhập 'Khóa API Gemini cá nhân' (nhận hoàn toàn miễn phí từ Google AI Studio) tại mục 'Hồ sơ Giáo viên' ở trang Tổng quan, hoặc thử lại sau.";
      } else if (errInfo.isOverloaded) {
        detail = "Dịch vụ AI hiện đang quá tải do lượt yêu cầu cao (Mã lỗi 503). Thầy Cô vui lòng bấm thử lại sau 10-30 giây, hoặc cấu hình Khóa API (Gemini Key) cá nhân của mình trong mục Hồ sơ Giáo viên.";
      } else if (errInfo.isPermissionDenied) {
        detail = "Dự án Google Cloud hoặc Khóa API mặc định đang bị từ chối truy cập (Mã lỗi 403: Permission Denied). Để khắc phục và tiếp tục, Thầy Cô hãy nhập 'Khóa API Gemini cá nhân' của mình trong mục 'Hồ sơ Giáo viên' tại trang Tổng quan, hoặc cập nhật lại Google Secrets.";
      } else if (errInfo.isMissingKey) {
        detail = "Hệ thống chưa tìm thấy Khóa API hoặc Khóa API của Thầy Cô không hợp lệ. Vui lòng kiểm tra lại thiết lập Khóa API (Gemini Key) cá nhân tại trang Hồ sơ Giáo viên hoặc liên hệ quản trị viên.";
      } else {
        detail = `Sự cố hệ thống thiết kế bài học AI: ${errInfo.message}`;
      }
      return res.status(500).json({ error: detail });
    }
  });

  // AI-Assisted Exam Problems Generator
  app.post("/api/generate-exam-problems", async (req, res) => {
    try {
      const { 
        topic, 
        grade, 
        subject, 
        curriculumBook, 
        testName, 
        groups, 
        mcCount, 
        essayCount,
        multipleChoiceCount,
        trueFalseCount,
        matchingCount,
        gapFillCount,
        shortEssayCount
      } = req.body;

      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      // Build a professional prompt adhering to specific Vietnamese elementary pedagogy
      const prompt = `Bạn là một chuyên gia khảo thí, kiểm định chất lượng giáo dục tiểu học/trung học tại Việt Nam.
      Hãy soạn một bộ câu hỏi (đề thi mẫu) hoàn chỉnh bám sát theo các thông số trường dữ liệu sau đây:
      - Tên môn học: ${subject || 'Tin học'}
      - Khối lớp: ${grade || 'Lớp 3'} (Tiểu học)
      - Bộ sách giáo khoa chủ đạo: ${curriculumBook || 'Kết nối tri thức với cuộc sống'}
      - Tên bài kiểm tra: ${testName || 'Bài kiểm tra số học kì'}
      - Nội dung trọng tâm bài học yêu cầu: "${topic || 'Trải nghiệm số và khám phá công nghệ'}"

      Dựa trên cấu hình số lượng câu hỏi sau:
      - Số câu trắc nghiệm 4 phương án (type: "multiple_choice"): ${multipleChoiceCount !== undefined ? multipleChoiceCount : (mcCount || 0)} câu.
      - Số câu hỏi Trắc nghiệm Đúng / Sai (type: "true_false"): ${trueFalseCount !== undefined ? trueFalseCount : 0} câu.
      - Số câu hỏi Nối cột / Ghép đôi (type: "matching"): ${matchingCount !== undefined ? matchingCount : 0} câu.
      - Số câu hỏi Điền khuyết (type: "gap_fill"): ${gapFillCount !== undefined ? gapFillCount : 0} câu.
      - Số câu hỏi Tự luận ngắn (type: "essay"): ${shortEssayCount !== undefined ? shortEssayCount : (essayCount || 0)} câu.

      Tìm mọi cách tạo đúng số lượng câu hỏi của từng dạng cấu trúc đã nêu ở trên.
      Các nhóm thông tin cấu hình ma trận đề thi: ${groups ? JSON.stringify(groups) : 'Lựa chọn phân bố đều theo các mức Nhận biết, Thông hiểu, Vận dụng.'}

      BẮT BUỘC biên soạn đề chất lượng cao, từ ngữ chuẩn sư phạm tiểu học, dễ hiểu, tránh viết thuật ngữ quá phức tạp. Mỗi câu hỏi phải có độ dài câu chữ cân đối, đáp án chuẩn xác rõ ràng.

      Yêu cầu chi tiết định dạng kỹ thuật cho từng loại câu hỏi:
      1. Câu hỏi trắc nghiệm khách quan (type: "multiple_choice"):
          - "options" phải là một mảng chứa ĐÚNG 4 chuỗi tương ứng với 4 câu trả lời lựa chọn.
          - "correctAnswer" phải là ĐÚNG một chữ cái viết hoa: "A", "B", "C" hoặc "D".
          - Mức độ difficulty có thể là "Nhận biết", "Thông hiểu", hoặc "Vận dụng" phù hợp với định mức của môn học.

      2. Câu hỏi Đúng / Sai (type: "true_false"):
          - "questionText" là câu hỏi chung đề bài yêu cầu xét các phát biểu.
          - Cần có mảng "statements" chứa đúng 4 phát biểu nhỏ tương ứng với nhãn "A", "B", "C", "D". Mỗi phần tử phải có cấu trúc: {"label": "A", "text": "Nội dung phát biểu...", "answer": "Đúng"} hoặc "Sai".
          - "correctAnswer" là chuỗi tổng hợp đáp án phân tách bằng dấu phẩy cách, ví dụ: "A-Đúng, B-Sai, C-Đúng, D-Sai".
          - "answerGuide" ghi rõ lý giải từng ý phát biểu chi tiết.

      3. Câu hỏi Nối cột / Ghép đôi (type: "matching"):
          - "questionText" là yêu cầu nối cột gần gũi mô tả hai bên cột A và cột B.
          - Phải có mảng "matchingPairs" chứa 2 đến 4 cặp kết nối. Mỗi cặp phải có dạng cấu trúc chính xác: {"id": "1", "left": "Mục ở cột A (Vế bên trái liệt kê kèm số)", "id_match": "b", "right": "Chữ bên phải của cột B được nối tương ứng với vế trái"}.
          - "correctAnswer" dạng: "1-b, 2-a" (cho các cặp khớp nối đúng id và id_match).
          - "answerGuide" lý giải từng ý nối tương thích.

      4. Câu hỏi Điền khuyết / Trống từ (type: "gap_fill"):
          - "questionText" chứa một mệnh đề lý thuyết có dấu khoảng trống gạch dưới (_______).
          - "correctAnswer" lưu trữ từ khóa chuẩn xác cần điền vào chỗ trống gạch dưới.

      BẮT BUỘC đầu ra phải là một mảng JSON thuần túy gồm các đối tượng có thuộc tính "id" tự tăng dạng đại diện ("q-1", "q-2"...), "type" tương ứng, "difficulty", "questionText", "correctAnswer", "answerGuide", và các mảng phụ tùy vào loại câu hỏi. Tuyệt đối không bao gói trong markdown block khác, không viết lời mở hay lời nhắc kết luận bên ngoài JSON.

      Ví dụ cấu trúc đầu ra hợp lệ:
      [
        {
          "id": "q-1",
          "type": "multiple_choice",
          "difficulty": "Nhận biết",
          "questionText": "Những điều giúp ta hiểu biết về sự vật, hiện tượng được gọi là gì?",
          "options": ["Quyết định", "Thông tin", "Hành động", "Suy nghĩ"],
          "correctAnswer": "B",
          "answerGuide": "Thông tin là những điều giúp ta hiểu biết về sự vật xung quanh."
        }
      ]`;

      const response = await generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là một AI sinh đề khảo thí giáo dục chuyên nghiệp tại Việt Nam, chỉ phản hồi một mảng JSON duy nhất chứa danh sách các câu hỏi, không thêm bất kỳ văn bản rườm rà nào khác ngoài cấu trúc JSON mảng hợp lệ.",
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      });

      const rawText = response.text?.trim() || "[]";
      console.log("Gemini Exam raw output:", rawText);
      
      try {
        const parsedQuestions = safeParseJSON(rawText);
        return res.json({ questions: parsedQuestions });
      } catch (jsonErr) {
        console.error("Failed parsing exam problems even with safeParseJSON. Raw text:", rawText);
        throw jsonErr;
      }

    } catch (error: any) {
      console.error("Gemini Exam Generator Error:", error);
      const errInfo = extractErrorInfo(error);
      let detail = "Đã xảy ra lỗi khi tạo đề kiểm tra.";
      if (errInfo.isQuota) {
        detail = "Dịch vụ AI miễn phí mặc định hiện đã đạt giới hạn cuộc gọi hôm nay (Mã lỗi 429 - Quota Exceeded). Để tiếp tục thi công đề thi không giới hạn, Thầy Cô vui lòng thiết lập 'Khóa API Gemini cá nhân' (nhận hoàn toàn miễn phí từ Google AI Studio) tại mục 'Hồ sơ Giáo viên' ở trang Tổng quan, hoặc thử lại sau.";
      } else if (errInfo.isOverloaded) {
        detail = "Dịch vụ mạng tạo bài kiểm tra AI tạm thời quá tải (Mã lỗi 503). Thầy Cô vui lòng thử lại sau vài giây hoặc thiết lập Khóa API riêng biệt trong mục cài đặt Hồ sơ Giáo viên.";
      } else if (errInfo.isPermissionDenied) {
        detail = "Dự án hoặc Khóa API mặc định đang bị từ chối truy cập (Mã lỗi 403: Permission Denied). Thầy Cô hãy cấu hình lại 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên' ở trang Tổng quan để kết nối bằng tài khoản AI riêng của mình.";
      } else if (errInfo.isMissingKey) {
        detail = "Hệ thống chưa thiết lập khóa kết nối AI hoặc khóa không khả dụng. Thầy Cô vui lòng cấu hình Khóa API (Gemini Key) cá nhân của mình trong trang Hồ sơ Giáo viên.";
      } else {
        detail = `Robot thiết lập câu hỏi bị gián đoạn: ${errInfo.message}`;
      }
      return res.status(500).json({ error: detail });
    }
  });

  // AI-Assisted Single-Question Explanation Generator
  app.post("/api/generate-question-explanation", async (req, res) => {
    try {
      const { questionText, type, options, correctAnswer, statements, matchingPairs } = req.body;
      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      let context = `Câu hỏi: "${questionText}"\n`;
      context += `Loại câu hỏi: ${type}\n`;
      if (type === "multiple_choice" && Array.isArray(options)) {
        context += `Các tùy chọn: ${options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join(", ")}\n`;
        context += `Đáp án đúng: ${correctAnswer}\n`;
      } else if (type === "true_false" && Array.isArray(statements)) {
        context += `Phát biểu: ${statements.map(s => `${s.label}. ${s.text} (${s.answer || 'Chưa biết'})`).join(", ")}\n`;
        context += `Đáp án đúng: ${correctAnswer}\n`;
      } else if (type === "matching" && Array.isArray(matchingPairs)) {
        context += `Cặp ghép nối: ${matchingPairs.map((p, i) => `${p.id || i + 1}. ${p.left} nối với ${p.right}`).join(", ")}\n`;
        context += `Đáp án đúng: ${correctAnswer}\n`;
      } else if (type === "gap_fill") {
        context += `Đáp án đúng: ${correctAnswer}\n`;
      }

      const prompt = `Bạn là một giáo viên sư phạm môn tin học tiểu học / trung học tại Việt Nam.
      Dựa trên câu hỏi sau đây, hãy viết một đoạn hướng dẫn làm bài ngắn gọn, súc tích (khoảng 1 đến 3 câu), dễ hiểu và mang tính sư phạm cao để giúp học sinh tự học và hiểu rõ tại sao đáp án đó là chính xác.

      ${context}

      YÊU CẦU: Chỉ trả về trực tiếp đoạn văn hướng dẫn làm bài bằng tiếng Việt (không định dạng markdown, không bao gồm từ dẫn giải như "Đây là hướng dẫn: ...", chỉ trả về chuỗi văn bản thuần túy).`;

      const response = await generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là một AI hỗ trợ soạn giáo án và giải thích câu hỏi học tập, chỉ phản hồi đoạn giải thích ngắn gọn, không định dạng gì thêm.",
          temperature: 0.7,
        }
      });

      const explanation = response.text?.trim() || "Hãy chọn đáp án chính xác nhất dựa theo kiến thức bài học.";
      return res.json({ explanation });

    } catch (error: any) {
      console.error("Gemini Explanation Generator Error:", error);
      return res.status(500).json({ error: error.message || "Không thể khởi tạo hướng dẫn làm bài tự động bằng AI." });
    }
  });

  // AI-Assisted Game Questions Generator
  app.post("/api/generate-game-questions", async (req, res) => {
    try {
      const { topic, grade, subject, numQuestions } = req.body;
      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      const prompt = `Bạn là một chuyên gia giáo dục tiểu học tại Việt Nam, thiết kế trò chơi học tập lý thú cho trẻ em.
      Hãy soạn ${numQuestions || 5} câu hỏi đố vui vui nhộn, bổ ích cho môn ${subject || 'Tin học'}, cấp độ học sinh ${grade || 'Lớp 3'} với chủ đề cụ thể là: "${topic || 'Thiết bị vào ra'}".
      Mỗi câu hỏi đố vui phải có cách đặt câu hỏi hóm hỉnh, cuốn hút trẻ em, đi kèm 4 đáp án và vị trí chính xác của câu trả lời đúng (chỉ số index từ 0 đến 3).

      BẮT BUỘC định dạng đầu ra phải là một mảng JSON thuần tuý hợp lệ có cấu trúc chính xác như sau, không được chứa bất kỳ từ thừa hay đánh dấu markdown nào ngoài đống JSON này.
      [
        {
          "question": "Nội dung câu hỏi đố vui dí dỏm...",
          "options": ["Đáp án A...", "Đáp án B...", "Đáp án C...", "Đáp án D..."],
          "correctAnswer": 0
        }
      ]`;

      const response = await generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là robot sinh câu hỏi trò chơi đố vui học tập, chỉ phản hồi một chuỗi JSON mảng hoàn chỉnh, tuyệt đối không viết một lời dẫn giải hay gõ codeblock markdown khác.",
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      });

      const rawText = response.text?.trim() || "[]";
      try {
        const parsedQuestions = safeParseJSON(rawText);
        return res.json({ questionBank: parsedQuestions });
      } catch (jsonErr) {
        console.error("Failed parsing game questions even with safeParseJSON. Raw text:", rawText);
        throw jsonErr;
      }

    } catch (error: any) {
      console.error("Gemini Game Questions Generator Error:", error);
      const errInfo = extractErrorInfo(error);
      let detail = "Đã xảy ra lỗi khi lập câu hỏi trò chơi.";
      if (errInfo.isQuota) {
        detail = "Dịch vụ AI miễn phí mặc định hiện đã đạt giới hạn cuộc gọi hôm nay (Mã lỗi 429 - Quota Exceeded). Để tạo các gói trò chơi học tập không giới hạn, Thầy Cô vui lòng thiết lập 'Khóa API Gemini cá nhân' (nhận hoàn toàn miễn phí từ Google AI Studio) tại mục 'Hồ sơ Giáo viên' ở trang Tổng quan, hoặc thử lại sau.";
      } else if (errInfo.isOverloaded) {
        detail = "Dịch vụ mạng tạo thẻ trò chơi học tập AI đang bận (Mã lỗi 503). Thầy Cô có thể bấm nút thử lại sau vài giây hoặc tự kích hoạt Khóa API cá nhân tại trang Hồ sơ Giáo viên.";
      } else if (errInfo.isPermissionDenied) {
        detail = "Dự án hoặc Khóa API mặc định đang bị từ chối truy cập (Mã lỗi 403: Permission Denied). Thầy Cô hãy lập 'Khóa API Gemini cá nhân' trong phần 'Hồ sơ Giáo viên' ở trang Tổng quan để khởi chạy kết nối AI bằng khóa riêng của mình.";
      } else if (errInfo.isMissingKey) {
        detail = "Hệ thống chưa cấu hình Khóa API (Gemini Key) kết nối AI. Thầy Cô vui lòng nhập Khóa API cá nhân trong trang cài đặt Hồ sơ Giáo viên.";
      } else {
        detail = `Robot thiết lập trò chơi học tập bị gián đoạn: ${errInfo.message}`;
      }
      return res.status(500).json({ error: detail });
    }
  });

  // AI-Assisted Sáng kiến Kinh nghiệm (SKKN) Generator
  app.post("/api/generate-skkn", async (req, res) => {
    try {
      const { subject, grade, topicTitle, customPrompt } = req.body;

      if (!subject || !grade) {
        return res.status(400).json({ error: "Môn học và Khối lớp là bắt buộc." });
      }

      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      let prompt = "";
      if (customPrompt) {
        // Substitute placeholders if any in the prompt
        prompt = customPrompt
          .replace(/\[môn học\]/g, subject)
          .replace(/\[khối lớp\]/g, grade)
          .replace(/\[Tên đề tài\]/g, topicTitle || "Chủ đề tự chọn");
      } else {
        prompt = `Tôi là giáo viên ${subject} lớp ${grade}. Hãy đóng vai chuyên gia giáo dục có 20 năm kinh nghiệm và hỗ trợ tôi xây dựng hoàn chỉnh một SKKN về chủ đề: "${topicTitle || 'Chủ đề giáo án đổi mới'}". Hãy thực hiện lần lượt các bước: tìm ý tưởng, lập đề cương, viết lý do chọn đề tài, phân tích thực trạng, đề xuất giải pháp, xây dựng minh chứng, đánh giá hiệu quả và hoàn thiện kết luận. Nội dung cần mang tính thực tiễn cực kỳ cao, bám sát các phương pháp sư phạm đổi mới, phù hợp đặc thù hệ thống giáo dục tiểu học/trung học tại Việt Nam hiện nay.`;
      }

      console.log(`[SKKN] Generating SKKN for: subject=${subject}, grade=${grade}, topicTitle=${topicTitle}`);

      const contentsParts = [{ text: prompt }];

      const response = await generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: contentsParts,
        config: {
          systemInstruction: `Bạn là Chuyên gia cố vấn Viết Sáng kiến Kinh nghiệm (SKKN) tiểu học và trung học xuất sắc có hơn 20 năm kinh nghiệm tại Việt Nam. Bạn am hiểu sâu sắc về cấu trúc khoa học giáo dục, văn phong mô phạm chuẩn mực, các biểu bảng số liệu khảo sát thực tế, và giải pháp đổi mới cụ thể theo chuẩn Công văn 2345/GDĐT. Hãy viết bằng tiếng Việt tự nhiên, gãy gọn, có các đề mục rõ ràng, cấu trúc chuyên nghiệp và giàu ví dụ thực tiễn.`,
          temperature: 0.75,
        }
      });

      const generatedResult = extractGeminiText(response);
      if (!generatedResult) {
        throw new Error("Không có kết quả trả về từ Gemini sau khi thử tất cả các mô hình.");
      }
      return res.json({ result: generatedResult });

    } catch (error: any) {
      console.error("Gemini SKKN Generator Error:", error);
      const errInfo = extractErrorInfo(error);
      let detail = "Đã xảy ra lỗi khi tạo sáng kiến kinh nghiệm.";
      if (errInfo.isQuota) {
        detail = "Dịch vụ AI miễn phí mặc định hiện đã đạt giới hạn cuộc gọi hôm nay (Mã lỗi 429 - Quota Exceeded). Để tiếp tục tạo không giới hạn, Thầy Cô vui lòng nhập 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên' ở trang Tổng quan.";
      } else if (errInfo.isOverloaded) {
        detail = "Dịch vụ AI hiện đang quá tải do lượt yêu cầu cao (Mã lỗi 503). Thầy Cô vui lòng thử lại sau 15-30 giây.";
      } else if (errInfo.isPermissionDenied) {
        detail = "Truy cập bị từ chối (Mã lỗi 403: Permission Denied). Vui lòng kiểm tra hoặc nhập 'Khóa API Gemini cá nhân' trong phần 'Hồ sơ Giáo viên'.";
      } else if (errInfo.isMissingKey) {
        detail = "Thiếu khóa API. Vui lòng cấu hình 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên'.";
      } else {
        detail = `Lỗi hệ thống tạo SKKN AI: ${errInfo.message}`;
      }
      return res.status(500).json({ error: detail });
    }
  });

  // AI logical check for Sáng kiến kinh nghiệm (SKKN)
  app.post("/api/audit-skkn", async (req, res) => {
    try {
      const { content, subject, grade, topicTitle } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Nội dung Sáng kiến kinh nghiệm là bắt buộc để kiểm tra." });
      }

      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      const prompt = `Bạn là một Chuyên gia Giáo dục Phản biện xuất sắc và khắt khe có hơn 20 năm kinh nghiệm thẩm định, chấm thi Sáng kiến Kinh nghiệm (SKKN) cấp Sở và Bộ GD&ĐT Việt Nam.
Hãy giúp tôi quét toàn bộ bài viết, phát hiện các lỗi lập luận, mâu thuẫn giữa thực trạng và giải pháp, mâu thuẫn thực nghiệm đồng thời gợi ý cách viết lại cho mạch lạc hơn:

Môn học liên quan: ${subject || "Tự chọn"}
Khối lớp: ${grade || "Tự chọn"}
Tên đề tài SKKN: "${topicTitle || "Không xác định"}"

NỘI DUNG SÁNG KIẾN KINH NGHIỆM ĐỂ KIỂM TRA:
"""
${content}
"""

Hãy soạn một bản Báo cáo thẩm định phản biện logic lập luận vô cùng chi tiết bằng Tiếng Việt theo cấu trúc sau:

## 🔍 BÁO CÁO THẨM ĐỊNH LOGIC SÁNG KIẾN KINH NGHIỆM
*(Bản báo cáo kỹ lưỡng được thực hiện bởi ban cố vấn AI chuyên môn 20 năm kinh nghiệm)*

### 1. ĐÁNH GIÁ CHUNG VỀ SỰ LIÊN KẾT CƠ SỞ KHOA HỌC
- Phân tích xem tiêu đề đề tài, môn học và khối lớp có ăn khớp, nhất quán xuyên suốt bài viết hay không.

### 2. PHÁT HIỆN MÂU THUẪN GIỮA THỰC TRẠNG VÀ GIẢI PHÁP (Trọng tâm)
- Đối chiếu tỉ mỉ xem các "Khó khăn, điểm nghẽn, tồn tại" được liệt kê ở Chương Thực trạng có được xử lý triệt để bằng "Hệ thống các Giải pháp, Biện pháp cải tiến" ở Phần II hay chưa?
- Chỉ ra cụ thể giải pháp nào còn mang tính lý thuyết chung chung, chưa bắt nguồn từ khó khăn thực tế, hoặc khó khăn thực trạng nào nêu ra mà không thấy biện pháp giải quyết.

### 3. THẨM ĐỊNH SỰ ĐỒNG BỘ CỦA SỐ LIỆU ĐỐI CHỨNG THỰC NGHIỆM
- Đánh giá xem bảng số liệu đối chứng trước/sau áp dụng có logic không. Ví dụ: Các tiêu chí khảo sát ở thực trạng đầu học kỳ phải thống nhất hoàn toàn với các tiêu chí so sánh hiệu quả cuối học kỳ.

### 4. GỢI Ý CÁCH VIẾT LẠI MẠCH LẠC & KHUYÊN DÙNG ĐỂ ĐẠT THANG ĐIỂM TỐI ĐA
- Chỉ ra các câu văn hay lập luận bị lặp ý, câu chữ chưa chuẩn mực sư phạm.
- **Quan trọng nhất:** Viết lại mẫu một số đoạn văn, cách chuyển ý hoặc đề xuất bảng số liệu thay thế để bài viết trở nên gãy gọn, sắc sảo, thuyết phục hoàn toàn Hội đồng Giám khảo khó tính nhất.

Hãy viết báo cáo bằng Markdown với văn phong sư phạm khách quan, rành mạch và thực sự có chiều sâu chuyên môn.`;

      const contentsParts = [{ text: prompt }];

      const response = await generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: contentsParts,
        config: {
          systemInstruction: `Bạn là Chuyên gia cố vấn, Trưởng ban phản biện và sửa lỗi cấu trúc logic cho tệp báo cáo Sáng kiến Kinh nghiệm (SKKN) chuẩn Bộ Giáo dục & Đào tạo Việt Nam.`,
          temperature: 0.7,
        }
      });

      const auditResult = extractGeminiText(response);
      if (!auditResult) {
        throw new Error("Không có kết quả trả về từ Gemini sau khi thử tất cả các mô hình.");
      }
      return res.json({ result: auditResult });

    } catch (error: any) {
      console.error("Gemini SKKN Audit Error:", error);
      const errInfo = extractErrorInfo(error);
      let detail = "Đã xảy ra lỗi khi kiểm tra lỗi logic.";
      if (errInfo.isQuota) {
        detail = "Dịch vụ AI miễn phí mặc định hiện đã đạt giới hạn cuộc gọi hôm nay (Mã lỗi 429 - Quota Exceeded). Để tiếp tục phân tích không giới hạn, Thầy Cô vui lòng nhập 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên'.";
      } else if (errInfo.isOverloaded) {
        detail = "Dịch vụ AI hiện đang quá tải (Mã lỗi 503). Thầy Cô vui lòng thử lại sau vài giây.";
      } else if (errInfo.isPermissionDenied) {
        detail = "Truy cập bị từ chối (Mã lỗi 403: Permission Denied). Vui lòng cấu hình 'Khóa API Gemini cá nhân' trong phần 'Hồ sơ Giáo viên'.";
      } else if (errInfo.isMissingKey) {
        detail = "Thiếu khóa API. Vui lòng cấu hình 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên'.";
      } else {
        detail = `Lỗi hệ thống kiểm tra logic bằng AI: ${errInfo.message}`;
      }
      return res.status(500).json({ error: detail });
    }
  });

  // AI Suggest Evidence for SKKN (AI Gợi ý Minh chứng)
  app.post("/api/suggest-evidence", async (req, res) => {
    try {
      const { solution, subject, grade, topicTitle } = req.body;
      if (!solution) {
        return res.status(400).json({ error: "Giải pháp là bắt buộc để gợi ý minh chứng." });
      }

      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      const prompt = `Tôi đang viết Sáng kiến kinh nghiệm (SKKN) tiểu học.
Tên đề tài: "${topicTitle || "Không xác định"}"
Môn học: ${subject || "Tin học"}
Khối lớp: ${grade || "Lớp 3"}

NỘI DUNG GIẢI PHÁP / BIỆN PHÁP ĐÃ NHẬP:
"""
${solution}
"""

Với vai trò là Chuyên gia cố vấn Viết Sáng kiến Kinh nghiệm (SKKN), hãy tự động phân tích giải pháp trên và đề xuất 3-4 loại MINH CHỨNG THỰC TẾ PHÙ HỢP NHẤT (hình ảnh học sinh hoạt động, bảng điểm so sánh kết quả học tập biểu bảng, video clip minh họa bài giảng/thực hành, sản phẩm học tập tự tay học sinh làm ra...) để tôi bổ sung vào SKKN nhằm tăng tính thuyết phục cao nhất.

Mỗi loại minh chứng cần cung cấp chi tiết:
1. **Tên loại minh chứng**: (Ví dụ: Hình ảnh chụp HS hoạt động nhóm, Bảng điểm đối chứng so sánh...)
2. **Nội dung cụ thể cần chụp/quay/ghi nhận**: Gợi ý mô tả chi tiết hình ảnh đó có những gì, bảng biểu hiển thị thông số nào, video quay phân đoạn nào.
3. **Cách bố trí vào SKKN**: Vị trí đặt ảnh/bảng và lời chú thích khuyên dùng bám sát nội dung.

Hãy viết câu văn chuẩn mực sư phạm bằng tiếng Việt, trình bày dưới dạng Markdown dễ nhìn.`;

      console.log(`[SKKN Evidence] Suggesting evidence for solution, length=${solution.length}`);

      const response = await generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: [{ text: prompt }],
        config: {
          systemInstruction: "Bạn là Chuyên gia cố vấn Sáng kiến Kinh nghiệm (SKKN) có 20 năm kinh nghiệm tại Việt Nam. Hãy đề xuất minh chứng thực tế rõ ràng, thiết thực, mang tính khả thi cao nhất.",
          temperature: 0.7,
        }
      });

      const generatedResult = response.text || "Không tìm thấy gợi ý minh chứng.";
      return res.json({ result: generatedResult });

    } catch (error: any) {
      console.error("Gemini Suggest Evidence Error:", error);
      const errInfo = extractErrorInfo(error);
      let detail = "Đã xảy ra lỗi khi tạo gợi ý minh chứng.";
      if (errInfo.isQuota) {
        detail = "Dịch vụ AI miễn phí mặc định hiện đã đạt giới hạn cuộc gọi hôm nay (Mã lỗi 429 - Quota Exceeded). Để tiếp tục phân tích không giới hạn, Thầy Cô vui lòng nhập 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên'.";
      } else if (errInfo.isOverloaded) {
        detail = "Dịch vụ AI hiện đang quá tải (Mã lỗi 503). Thầy Cô vui lòng thử lại sau vài giây.";
      } else if (errInfo.isPermissionDenied) {
        detail = "Truy cập bị từ chối (Mã lỗi 403: Permission Denied). Vui lòng cấu hình 'Khóa API Gemini cá nhân' trong phần 'Hồ sơ Giáo viên'.";
      } else if (errInfo.isMissingKey) {
        detail = "Thiếu khóa API. Vui lòng cấu hình 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên'.";
      } else {
        detail = `Lỗi hệ thống gợi ý minh chứng bằng AI: ${errInfo.message}`;
      }
      return res.status(500).json({ error: detail });
    }
  });

  // AI-Powered Question Generator for Practice Exams
  app.post("/api/generate-ai-questions", async (req, res) => {
    try {
      const { lessonTitle, subject, grade, topicName, quizCount, trueFalseCount, matchingCount, gapFillCount } = req.body;

      if (!lessonTitle) {
        return res.status(400).json({ error: "Lesson title is required." });
      }

      const customKey = req.headers['x-gemini-key'] as string | undefined;
      const client = getGoogleGenAIClient(customKey);

      const qCount = Math.max(0, parseInt(quizCount) || 0);
      const tfCount = Math.max(0, parseInt(trueFalseCount) || 0);
      const mCount = Math.max(0, parseInt(matchingCount) || 0);
      const gfCount = Math.max(0, parseInt(gapFillCount) || 0);
      const totalRequested = qCount + tfCount + mCount + gfCount;

      if (totalRequested === 0) {
        return res.status(400).json({ error: "Tổng số câu hỏi yêu cầu tạo phải lớn hơn 0." });
      }

      const prompt = `Bạn là chuyên gia sư phạm biên soạn đề thi môn ${subject || "Tin học"} Tiểu học lớp ${grade || 3}.
Hãy soạn thảo chính xác đúng ${totalRequested} câu hỏi ôn tập chất lượng cao cho bài học: "${lessonTitle}" (thuộc Chủ đề: "${topicName || "Chung"}").

CƠ CẤU SỐ LƯỢNG CÁC DẠNG CÂU HỎI BẮT BUỘC:
- Tạo đúng ${qCount} câu hỏi Trắc nghiệm (gameType: "quiz")
- Tạo đúng ${tfCount} câu hỏi Đúng/Sai (gameType: "true_false")
- Tạo đúng ${mCount} câu hỏi Nối cột / Ghép câu (gameType: "matching")
- Tạo đúng ${gfCount} câu hỏi Điền khuyết (gameType: "gap_fill")

Mức độ câu hỏi phải phù hợp với học sinh lớp ${grade || 3}.

Mỗi câu hỏi phải tuân thủ nghiêm ngặt cấu trúc dữ liệu JSON dưới đây:

1. Dạng Trắc nghiệm (gameType: "quiz"):
{
  "gameType": "quiz",
  "questionText": "Nội dung câu hỏi trắc nghiệm...",
  "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
  "correctAnswer": "Đáp án đúng chính xác (phải khớp hoàn toàn với một trong bốn đáp án trong 'options')",
  "explanation": "Giải thích chi tiết tại sao đáp án này đúng..."
}

2. Dạng Đúng/Sai (gameType: "true_false"):
{
  "gameType": "true_false",
  "questionText": "Mệnh đề khẳng định rõ ràng về chủ đề...",
  "options": ["Đúng", "Sai"],
  "correctAnswer": "Đúng" hoặc "Sai",
  "explanation": "Giải thích tại sao mệnh đề đó Đúng hoặc Sai..."
}

3. Dạng Nối cột / Ghép câu (gameType: "matching"):
{
  "gameType": "matching",
  "questionText": "Lời chỉ dẫn ghép đôi (Ví dụ: Hãy nối thiết bị ở cột trái với vai trò tương thích ở cột phải:)",
  "options": ["Vế trái 1", "Vế trái 2", "Vế trái 3"],
  "correctAnswer": "Vế trái 1 - Vế phải đúng 1 || Vế trái 2 - Vế phải đúng 2 || Vế trái 3 - Vế phải đúng 3",
  "explanation": "Giải thích việc ghép nối...",
  "matchingPairs": [
    { "id": "1", "left": "Vế trái 1", "right": "Vế phải đúng 1" },
    { "id": "2", "left": "Vế trái 2", "right": "Vế phải đúng 2" },
    { "id": "3", "left": "Vế trái 3", "right": "Vế phải đúng 3" }
  ]
}

4. Dạng Điền khuyết (gameType: "gap_fill"):
{
  "gameType": "gap_fill",
  "questionText": "Câu văn lý thuyết chứa dấu ba chấm '...' để điền từ (Ví dụ: Thiết bị ... dùng để di chuyển con trỏ trên màn hình.)",
  "options": ["từ đúng có dấu", "tu dung khong dau"],
  "correctAnswer": "từ đúng có dấu | tu dung khong dau",
  "explanation": "Giải thích tại sao từ đó đúng..."
}

YÊU CẦU:
- Nội dung mang tính giáo dục sâu sắc, câu chữ trong sáng cho học sinh tiểu học.
- Đảm bảo định dạng JSON hợp lệ. Chỉ trả về một đối tượng JSON duy nhất có thuộc tính "questions" chứa mảng các câu hỏi này.

Trả về kết quả ở định dạng JSON duy nhất:
{
  "questions": [ ... ]
}`;

      console.log(`[AI Generator] Generating ${totalRequested} questions for lesson "${lessonTitle}"...`);

      const response = await generateContentWithFallback(client, {
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8,
        },
      });

      const responseText = response.text || "{}";
      const parsed = safeParseJSON(responseText);
      
      // Ensure the generated questions have correct lessonId and unique ids
      const rawQuestions = Array.isArray(parsed) ? parsed : (parsed?.questions || []);
      const questions = rawQuestions.map((q: any, index: number) => {
        const idSuffix = `${Date.now()}_ai_${index}_${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          ...q,
          id: `q_${q.gameType || 'quiz'}_${idSuffix}`,
          lessonId: req.body.lessonId || "temp-id"
        };
      });

      return res.json({ questions });

    } catch (error: any) {
      console.error("[AI Generator Error] Failed to generate questions:", error);
      const errInfo = extractErrorInfo(error);
      let detail = "";
      if (errInfo.isQuota) {
        detail = "Lượt truy cập AI đang đạt giới hạn. Vui lòng thử lại sau giây lát.";
      } else if (errInfo.isOverloaded) {
        detail = "Máy chủ AI hiện tại đang quá tải. Hãy thử lại sau.";
      } else if (errInfo.isMissingKey) {
        detail = "Thiếu khóa API. Vui lòng cấu hình 'Khóa API Gemini cá nhân' trong mục 'Hồ sơ Giáo viên' hoặc liên hệ quản trị viên.";
      } else {
        detail = `Lỗi hệ thống tạo câu hỏi trắc nghiệm bằng AI: ${errInfo.message}`;
      }
      return res.status(500).json({ error: detail });
    }
  });

  // Serve static files in production or hook Vite development server middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Serve index.html as a fallback for clientside routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Primary school LMS running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("FATAL: Failed to start the LMS application server:", error);
});
