"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnswerSheetViewer } from "@/components/exams/AnswerSheetViewer";
import { MobileResultsTabs } from "@/components/exams/MobileResultsTabs";
import { QuestionsPanel } from "@/components/exams/QuestionsPanel";
import { PaneResizer } from "@/components/layout/PaneResizer";
import { extractedQuestions } from "@/data/extractedQuestions";
import type { ResultsMobileTab } from "@/types/exam";

const DEFAULT_EXPANDED = "q2";
const DEFAULT_PANE_WIDTH = 50;

export function ResultsScreen() {
  const splitRef = useRef<HTMLDivElement>(null);
  const [mobileTab, setMobileTab] = useState<ResultsMobileTab>("questions");
  const [expandedIds, setExpandedIds] = useState<string[]>([DEFAULT_EXPANDED]);
  const [selectedId, setSelectedId] = useState(DEFAULT_EXPANDED);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [questionsPaneWidth, setQuestionsPaneWidth] = useState(DEFAULT_PANE_WIDTH);

  const selectedQuestion = useMemo(
    () => extractedQuestions.find((question) => question.id === selectedId),
    [selectedId],
  );

  const allExpanded = expandedIds.length === extractedQuestions.length;
  const highlightLabel = selectedQuestion
    ? `Q${selectedQuestion.number}${selectedQuestion.part ? selectedQuestion.part.replace(".", "") : ""}`
    : "";

  function handleToggleQuestion(id: string) {
    const question = extractedQuestions.find((item) => item.id === id);
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

    setExpandedIds(extractedQuestions.map((question) => question.id));
  }

  const questionsPanel = (
    <QuestionsPanel
      questions={extractedQuestions}
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
      zoom={zoom}
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
