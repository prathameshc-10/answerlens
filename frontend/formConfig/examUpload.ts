import type { UploadSlot } from "@/types/exam";

export interface ExamUploadFormConfig {
  maxSizeMB: number;
  acceptedTypes: string[];
  acceptedExtensions: string[];
  slots: Record<
    UploadSlot,
    {
      label: string;
      highlight: string;
    }
  >;
}

export const examUploadFormConfig: ExamUploadFormConfig = {
  maxSizeMB: 10,
  acceptedTypes: ["application/pdf"],
  acceptedExtensions: [".pdf"],
  slots: {
    questionPaper: {
      label: "Upload",
      highlight: "Question Paper",
    },
    answerSheet: {
      label: "Upload",
      highlight: "Answer Sheet",
    },
  },
};

export function validateExamFile(file: File): string | null {
  const { maxSizeMB, acceptedTypes, acceptedExtensions } = examUploadFormConfig;
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const isAcceptedType =
    acceptedTypes.includes(file.type) || acceptedExtensions.includes(extension);

  if (!isAcceptedType) {
    return "Please upload a PDF file.";
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File must be ${maxSizeMB}MB or less.`;
  }

  return null;
}
