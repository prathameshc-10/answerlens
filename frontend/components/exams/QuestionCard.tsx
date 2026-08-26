"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/icons/AppIcons";
import { formatScore, getScoreTone } from "@/data/extractedQuestions";
import type { ExtractedQuestion } from "@/types/exam";

interface QuestionCardProps {
  question: ExtractedQuestion;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
}

const SCORE_CLASS: Record<string, string> = {
  success: "bg-[rgba(69,181,41,0.1)] text-[#34AC15]",
  partial: "bg-[rgba(255,153,0,0.1)] text-[#E3600F]",
  fail: "bg-[#FFE9E2] text-[#C0350A]",
};

export function QuestionCard({
  question,
  expanded,
  selected,
  onToggle,
}: QuestionCardProps) {
  const tone = getScoreTone(question.awarded, question.max);
  const isActive = expanded || selected;

  return (
    <article
      className={`flex w-full flex-col gap-3 rounded-2xl bg-surface p-3 ${
        isActive ? "border-2 border-[#FF8D36]" : "border-2 border-transparent"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 text-left"
      >
        <span className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/25 text-xl font-extrabold leading-6 text-white ${
              isActive
                ? "bg-primary shadow-[0px_8px_8.8px_rgba(255,121,80,0.1)]"
                : "bg-[rgba(43,43,43,0.8)] shadow-[0px_8px_8.8px_rgba(134,134,134,0.1),0px_4px_16px_rgba(67,67,67,0.1)]"
            }`}
          >
            {question.number}
          </span>
          {question.part ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-header-icon text-base font-bold text-text-primary">
              {question.part}
            </span>
          ) : null}
        </span>

        <p className="min-w-0 text-base font-normal leading-[140%] tracking-[-0.04em] text-text-primary">
          {question.text}
        </p>

        <span className="flex shrink-0 items-center gap-4">
          <span
            className={`flex h-[30px] items-center rounded-full px-3 text-base font-bold leading-[140%] tracking-[-0.04em] ${SCORE_CLASS[tone]}`}
          >
            {formatScore(question.awarded, question.max)}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-header-icon text-[#1E1E1E]">
            {expanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="flex flex-col gap-2.5 rounded-2xl bg-header-icon px-6 py-4">
          <h3 className="text-base font-bold leading-[140%] tracking-[-0.04em] text-text-primary">
            AI Feedback
          </h3>
          <p className="text-sm font-normal leading-[140%] tracking-[-0.04em] text-text-primary">
            {question.feedback}
          </p>
        </div>
      ) : null}
    </article>
  );
}
