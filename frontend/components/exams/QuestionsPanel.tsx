"use client";

import { QuestionCard } from "@/components/exams/QuestionCard";
import type { ExtractedQuestion } from "@/types/exam";

interface QuestionsPanelProps {
  questions: ExtractedQuestion[];
  expandedIds: string[];
  selectedId: string;
  allExpanded: boolean;
  onToggleQuestion: (id: string) => void;
  onToggleExpandAll: () => void;
}

export function QuestionsPanel({
  questions,
  expandedIds,
  selectedId,
  allExpanded,
  onToggleQuestion,
  onToggleExpandAll,
}: QuestionsPanelProps) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden rounded-[20px] bg-white/50 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-bold leading-[140%] tracking-[-0.04em] text-text-primary">
          Extracted Questions (from question paper)
        </h2>
        <button
          type="button"
          onClick={onToggleExpandAll}
          className="hidden h-11 items-center rounded-[64px] bg-surface px-5 py-3 text-sm font-medium leading-[140%] tracking-[-0.04em] text-[#181818] lg:flex"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            expanded={expandedIds.includes(question.id)}
            selected={selectedId === question.id}
            onToggle={() => onToggleQuestion(question.id)}
          />
        ))}
      </div>
    </section>
  );
}
