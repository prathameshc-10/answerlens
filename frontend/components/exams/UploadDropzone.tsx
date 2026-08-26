"use client";

import { useId, useRef, useState } from "react";
import { FileCard } from "@/components/exams/FileCard";
import { UploadTrayIcon } from "@/components/icons/AppIcons";
import {
  examUploadFormConfig,
  validateExamFile,
} from "@/formConfig/examUpload";
import { toUploadedFile } from "@/lib/files";
import type { UploadedFile, UploadSlot } from "@/types/exam";

interface UploadDropzoneProps {
  slot: UploadSlot;
  file: UploadedFile | null;
  error?: string;
  onFileChange: (file: UploadedFile | null, error?: string) => void;
}

export function UploadDropzone({
  slot,
  file,
  error,
  onFileChange,
}: UploadDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const config = examUploadFormConfig.slots[slot];

  async function handleFiles(fileList: FileList | null) {
    const nextFile = fileList?.[0];
    if (!nextFile) {
      return;
    }

    const validationError = validateExamFile(nextFile);
    if (validationError) {
      onFileChange(null, validationError);
      return;
    }

    const uploaded = await toUploadedFile(nextFile);
    onFileChange(uploaded);
  }

  return (
    <div
      className={`flex min-h-[148px] flex-1 flex-col items-center justify-center rounded-[20px] border-[1.5px] border-dashed bg-surface p-2.5 transition-colors lg:min-h-[181px] ${
        isDragging ? "border-primary bg-highlight" : "border-[#CECECE] hover:border-primary/40"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={examUploadFormConfig.acceptedExtensions.join(",")}
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {file ? (
        <FileCard
          file={file}
          onRemove={() => {
            onFileChange(null);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
        />
      ) : (
        <label
          htmlFor={inputId}
          className="flex h-full min-h-[128px] w-full cursor-pointer flex-col items-center justify-center gap-4"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-icon-bg">
            <UploadTrayIcon className="h-8 w-8 text-text-primary" />
          </span>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-center text-xl font-semibold leading-[22px] tracking-[-0.06em] text-text-primary">
              {config.label}{" "}
              <span className="text-primary">{config.highlight}</span>
            </p>
            <p className="text-sm leading-[22px] tracking-[-0.06em] text-[rgba(94,94,94,0.55)]">
              Max {examUploadFormConfig.maxSizeMB}MB
            </p>
          </div>
        </label>
      )}

      {error ? (
        <p className="mt-3 text-center text-sm text-primary">{error}</p>
      ) : null}
    </div>
  );
}
