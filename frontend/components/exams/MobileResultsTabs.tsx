"use client";

import type { ResultsMobileTab } from "@/types/exam";

interface MobileResultsTabsProps {
  activeTab: ResultsMobileTab;
  onChange: (tab: ResultsMobileTab) => void;
}

export function MobileResultsTabs({ activeTab, onChange }: MobileResultsTabsProps) {
  return (
    <div className="flex w-full rounded-full bg-off-white p-1 lg:hidden">
      <button
        type="button"
        onClick={() => onChange("questions")}
        className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold tracking-[-0.04em] ${
          activeTab === "questions"
            ? "bg-[#181818] text-white"
            : "bg-transparent text-text-primary"
        }`}
      >
        Questions
      </button>
      <button
        type="button"
        onClick={() => onChange("answerSheet")}
        className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold tracking-[-0.04em] ${
          activeTab === "answerSheet"
            ? "bg-[#181818] text-white"
            : "bg-transparent text-text-primary"
        }`}
      >
        Answer Sheet
      </button>
    </div>
  );
}
