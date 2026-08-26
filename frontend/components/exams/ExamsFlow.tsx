"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo, useState } from "react";
import { ExtractingScreen } from "@/components/exams/ExtractingScreen";
import { ResultsScreen } from "@/components/exams/ResultsScreen";
import { UploadScreen } from "@/components/exams/UploadScreen";
import { AppShell } from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  useCreateSessionMutation,
  useGetProgressQuery,
  useGetResultsQuery,
  useStartProcessMutation,
  useUploadAnswerSheetMutation,
  useUploadQuestionPaperMutation,
} from "@/store/api/examApi";
import type { ExamView, UploadedFile, UploadSlot } from "@/types/exam";

export function ExamsFlow() {
  const [runActive, setRunActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [questionPaper, setQuestionPaper] = useState<UploadedFile | null>(null);
  const [answerSheet, setAnswerSheet] = useState<UploadedFile | null>(null);
  const [errors, setErrors] = useState<Partial<Record<UploadSlot, string>>>({});
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [createSession] = useCreateSessionMutation();
  const [uploadQuestionPaper] = useUploadQuestionPaperMutation();
  const [uploadAnswerSheet] = useUploadAnswerSheetMutation();
  const [startProcess] = useStartProcessMutation();

  const { currentData: progress } = useGetProgressQuery(
    sessionId && isProcessing ? sessionId : skipToken,
    {
      pollingInterval: isProcessing ? 1500 : 0,
    },
  );

  const pipelineDone = progress?.status === "done" && progress.stage === "done";
  const pipelineError = progress?.status === "error";

  const { currentData: results } = useGetResultsQuery(
    sessionId && pipelineDone ? sessionId : skipToken,
  );

  const view: ExamView = useMemo(() => {
    if (!runActive) {
      return "upload";
    }
    if (pipelineError) {
      return "upload";
    }
    if (pipelineDone && results) {
      return "results";
    }
    return "extracting";
  }, [runActive, pipelineError, pipelineDone, results]);

  const mappingError = pipelineError
    ? progress?.detail || "Extraction failed. Please try again."
    : submitError;

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

    setSubmitError(undefined);
    setErrors((current) => ({
      ...current,
      [slot]: error,
    }));
  }

  async function handleStartMapping() {
    if (!questionPaper || !answerSheet) {
      return;
    }

    setSubmitError(undefined);
    setIsProcessing(false);
    setSidebarCollapsed(true);
    setRunActive(true);

    try {
      const session = await createSession().unwrap();
      setSessionId(session.session_id);

      await uploadQuestionPaper({
        sessionId: session.session_id,
        files: [questionPaper.file],
      }).unwrap();

      await uploadAnswerSheet({
        sessionId: session.session_id,
        files: [answerSheet.file],
      }).unwrap();

      await startProcess(session.session_id).unwrap();
      setIsProcessing(true);
    } catch (error) {
      setIsProcessing(false);
      setRunActive(false);
      setSidebarCollapsed(false);
      setSubmitError(getApiErrorMessage(error));
    }
  }

  function handleBack() {
    if (view === "extracting" || view === "results") {
      setIsProcessing(false);
      setRunActive(false);
      setSidebarCollapsed(false);
    }
  }

  const extractingChrome = view === "extracting";
  const collapsed = view === "upload" ? false : sidebarCollapsed;

  return (
    <AppShell
      collapsed={collapsed}
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
          submitError={mappingError}
          onFileChange={handleFileChange}
          onStartMapping={() => {
            void handleStartMapping();
          }}
        />
      ) : null}
      {view === "extracting" ? (
        <ExtractingScreen percent={progress?.percent} stage={progress?.stage} />
      ) : null}
      {view === "results" && sessionId && results ? (
        <ResultsScreen sessionId={sessionId} results={results} />
      ) : null}
    </AppShell>
  );
}
