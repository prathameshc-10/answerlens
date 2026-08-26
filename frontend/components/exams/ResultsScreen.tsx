"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnswerSheetViewer } from "@/components/exams/AnswerSheetViewer";
import { MobileResultsTabs } from "@/components/exams/MobileResultsTabs";
import { QuestionsPanel } from "@/components/exams/QuestionsPanel";
import { PaneResizer } from "@/components/layout/PaneResizer";
import { getAnswerSheetPageCount, mapSessionToExtractedQuestions } from "@/lib/mapResults";
import { getSessionImageUrl } from "@/store/api/examApi";
import type { ResultsMobileTab, SessionResults } from "@/types/exam";

const DEFAULT_PANE_WIDTH = 50;

interface ResultsScreenProps {
  sessionId: string;
  results: SessionResults;
}

export function ResultsScreen({ sessionId, results }: ResultsScreenProps) {
  const questions = useMemo(
    () => mapSessionToExtractedQuestions(results),
    [results],
  );
  const pageCount = getAnswerSheetPageCount(results);
  const firstQuestion = questions[0];

  const splitRef = useRef<HTMLDivElement>(null);
  const [mobileTab, setMobileTab] = useState<ResultsMobileTab>("questions");
  const [expandedIds, setExpandedIds] = useState<string[]>(
    firstQuestion ? [firstQuestion.id] : [],
  );
  const [selectedId, setSelectedId] = useState(firstQuestion?.id ?? "");
  const [page, setPage] = useState(firstQuestion?.bbox?.page ?? 1);
  const [zoom, setZoom] = useState(100);
  const [questionsPaneWidth, setQuestionsPaneWidth] = useState(DEFAULT_PANE_WIDTH);

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedId),
    [questions, selectedId],
  );

  const allExpanded = questions.length > 0 && expandedIds.length === questions.length;
  const highlightLabel = selectedQuestion
    ? `Q${selectedQuestion.number}${selectedQuestion.part ? selectedQuestion.part.replace(".", "") : ""}`
    : "";

  function handleToggleQuestion(id: string) {
    const question = questions.find((item) => item.id === id);
    setSelectedId(id);

    if (question?.bbox) {
      setPage(question.bbox.page);
    }

    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function handleToggleExpandAll() {
    if (allExpanded) {
      setExpandedIds([]);
      return;
    }

    setExpandedIds(questions.map((question) => question.id));
  }

  const questionsPanel = (
    <QuestionsPanel
      questions={questions}
      expandedIds={expandedIds}
      selectedId={selectedId}
      allExpanded={allExpanded}
      onToggleQuestion={handleToggleQuestion}
      onToggleExpandAll={handleToggleExpandAll}
    />
  );

  const answerSheet = (
    <AnswerSheetViewer
      page={page}
      pageCount={pageCount}
      zoom={zoom}
      imageUrl={getSessionImageUrl(sessionId, "ans", page)}
      highlight={selectedQuestion?.bbox ?? null}
      highlightLabel={highlightLabel}
      showTitle
      onPageChange={setPage}
      onZoomChange={setZoom}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3 lg:flex-row lg:items-stretch lg:px-0 lg:pb-0">
      <MobileResultsTabs activeTab={mobileTab} onChange={setMobileTab} />

      <div
        ref={splitRef}
        className="results-split hidden min-h-0 min-w-0 flex-1 lg:flex"
        style={{ "--questions-pane-width": `${questionsPaneWidth}%` } as CSSProperties}
      >
        <div className="results-questions min-h-0">{questionsPanel}</div>
        <PaneResizer
          containerRef={splitRef}
          value={questionsPaneWidth}
          onChange={setQuestionsPaneWidth}
        />
        <div className="results-answer min-h-0">{answerSheet}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        {mobileTab === "questions" ? questionsPanel : answerSheet}
      </div>
    </div>
  );
}
