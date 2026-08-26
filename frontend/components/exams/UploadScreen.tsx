"use client";

import { ArrowRightIcon } from "@/components/icons/AppIcons";
import { HeroIllustration } from "@/components/exams/HeroIllustration";
import { UploadDropzone } from "@/components/exams/UploadDropzone";
import type { UploadedFile, UploadSlot } from "@/types/exam";

interface UploadScreenProps {
  questionPaper: UploadedFile | null;
  answerSheet: UploadedFile | null;
  errors: Partial<Record<UploadSlot, string>>;
  onFileChange: (
    slot: UploadSlot,
    file: UploadedFile | null,
    error?: string,
  ) => void;
  onStartMapping: () => void;
}

export function UploadScreen({
  questionPaper,
  answerSheet,
  errors,
  onFileChange,
  onStartMapping,
}: UploadScreenProps) {
  const canStart = Boolean(questionPaper && answerSheet);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-6 lg:gap-9 lg:px-8">
      <div className="flex w-full max-w-[789px] flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-2">
          <h1 className="flex flex-wrap items-center justify-center gap-2 text-center text-[28px] font-bold leading-[120%] tracking-[-0.04em] text-heading lg:text-[40px]">
            <span>Upload</span>
            <span className="rounded-lg bg-highlight px-2 py-1 text-primary">
              Question Paper & Answer Sheets
            </span>
          </h1>
          <p className="text-center text-base tracking-[-0.04em] text-text-primary lg:text-xl lg:leading-[140%]">
            Upload both files to get started
          </p>
        </div>

        <HeroIllustration />

        <div className="flex w-full flex-col items-center rounded-[24px] bg-white/50 p-3">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
            <UploadDropzone
              slot="questionPaper"
              file={questionPaper}
              error={errors.questionPaper}
              onFileChange={(file, error) =>
                onFileChange("questionPaper", file, error)
              }
            />
            <UploadDropzone
              slot="answerSheet"
              file={answerSheet}
              error={errors.answerSheet}
              onFileChange={(file, error) =>
                onFileChange("answerSheet", file, error)
              }
            />
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-[410px] flex-col items-center gap-3">
        <button
          type="button"
          disabled={!canStart}
          onClick={onStartMapping}
          className="flex h-11 items-center gap-2 rounded-[64px] border-2 border-white/15 bg-text-primary py-3 pl-6 pr-5 text-sm font-medium leading-[140%] tracking-[-0.04em] text-white disabled:cursor-not-allowed disabled:opacity-25"
        >
          Start Mapping
          <ArrowRightIcon className="h-5 w-5" />
        </button>
        <p className="text-center text-sm leading-[22px] tracking-[-0.06em] text-[rgba(94,94,94,0.8)]">
          Once both files are uploaded, you&apos;ll be able to map answers with
          questions.
        </p>
      </div>
    </div>
  );
}
