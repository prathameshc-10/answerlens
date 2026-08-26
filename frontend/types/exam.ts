export type ExamView = "upload" | "extracting" | "results";

export type ResultsMobileTab = "questions" | "answerSheet";

export type ScoreTone = "success" | "partial" | "fail";

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
