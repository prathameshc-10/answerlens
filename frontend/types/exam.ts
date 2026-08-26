export type ExamView = "upload" | "extracting" | "results";

export type ResultsMobileTab = "questions" | "answerSheet";

export type ScoreTone = "success" | "partial" | "fail";

export type SessionStatus =
  | "created"
  | "qp_uploaded"
  | "ans_uploaded"
  | "ready"
  | "processing"
  | "done"
  | "error";

export type ProgressStatus = "processing" | "done" | "error";

export type MappedStatus = "answered" | "unanswered" | "unmatched";

export type GradingVerdict = "correct" | "partially_correct" | "incorrect";

export type PageImageType = "qp" | "ans";

export interface BoundingBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedQuestion {
  id: string;
  number: number;
  part?: string;
  text: string;
  awarded: number;
  max: number;
  feedback: string;
  bbox: BoundingBox | null;
}

export type UploadSlot = "questionPaper" | "answerSheet";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  pageCount: number | null;
  mimeType: string;
  file: File;
}

export interface UploadSlotError {
  slot: UploadSlot;
  message: string;
}

export interface CreateSessionResponse {
  session_id: string;
  status: SessionStatus;
}

export interface UploadFilesPayload {
  sessionId: string;
  files: File[];
}

export interface UploadResponse {
  session_id: string;
  type: PageImageType;
  pages: number;
  image_paths: string[];
  status: SessionStatus;
}

export interface ProcessResponse {
  session_id: string;
  status: SessionStatus;
}

export interface ProgressResponse {
  stage: string;
  percent: number;
  status: ProgressStatus;
  detail?: string | null;
}

export interface Question {
  id: string;
  number: string;
  text: string;
  bbox: BoundingBox;
  page: number;
  max_marks: number | null;
}

export interface Answer {
  id: string;
  matched_question_number: string | null;
  raw_text: string;
  bboxes: BoundingBox[];
  page: number;
  spans_pages: number[];
}

export interface GradingResult {
  score: number;
  max_score: number;
  verdict: GradingVerdict;
  feedback: string;
}

export interface MappedResult {
  question: Question;
  answer: Answer | null;
  status: MappedStatus;
  grading: GradingResult | null;
}

export interface SessionResults {
  session_id: string;
  question_paper_images: string[];
  answer_sheet_images: string[];
  questions: Question[];
  answers: Answer[];
  mapped_results: MappedResult[];
  unmatched_answers: Answer[];
  status: string;
}
