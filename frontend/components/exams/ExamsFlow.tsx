"use client";

import { useEffect, useState } from "react";
import { ExtractingScreen } from "@/components/exams/ExtractingScreen";
import { ResultsScreen } from "@/components/exams/ResultsScreen";
import { UploadScreen } from "@/components/exams/UploadScreen";
import { AppShell } from "@/components/layout/AppShell";
import type { ExamView, UploadedFile, UploadSlot } from "@/types/exam";

export function ExamsFlow() {
  const [view, setView] = useState<ExamView>("upload");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [questionPaper, setQuestionPaper] = useState<UploadedFile | null>(null);
  const [answerSheet, setAnswerSheet] = useState<UploadedFile | null>(null);
  const [errors, setErrors] = useState<Partial<Record<UploadSlot, string>>>({});

  useEffect(() => {
    if (view !== "extracting") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setView("results");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [view]);

  function handleFileChange(
    slot: UploadSlot,
    file: UploadedFile | null,
    error?: string,
  ) {
    if (slot === "questionPaper") {
      setQuestionPaper(file);
    } else {
      setAnswerSheet(file);
    }

    setErrors((current) => ({
      ...current,
      [slot]: error,
    }));
  }

  function handleStartMapping() {
    if (!questionPaper || !answerSheet) {
      return;
    }

    setSidebarCollapsed(true);
    setView("extracting");
  }

  function handleBack() {
    if (view === "extracting" || view === "results") {
      setView("upload");
      setSidebarCollapsed(false);
    }
  }

  const extractingChrome = view === "extracting";

  return (
    <AppShell
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      mobileNavOpen={mobileNavOpen}
      onMobileNavOpenChange={setMobileNavOpen}
      onBack={handleBack}
      contentClassName={
        extractingChrome
          ? "mx-3 mb-3 rounded-[40px] bg-surface lg:mx-0 lg:mb-0"
          : view === "results"
            ? "overflow-hidden"
            : ""
      }
    >
      {view === "upload" ? (
        <UploadScreen
          questionPaper={questionPaper}
          answerSheet={answerSheet}
          errors={errors}
          onFileChange={handleFileChange}
          onStartMapping={handleStartMapping}
        />
      ) : null}
      {view === "extracting" ? <ExtractingScreen /> : null}
      {view === "results" ? <ResultsScreen /> : null}
    </AppShell>
  );
}
