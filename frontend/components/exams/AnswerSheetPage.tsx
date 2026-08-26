import type { BoundingBox } from "@/types/exam";

interface AnswerSheetPageProps {
  page: number;
  imageUrl: string;
  highlight: BoundingBox | null;
  highlightLabel: string;
}

export function AnswerSheetPage({
  page,
  imageUrl,
  highlight,
  highlightLabel,
}: AnswerSheetPageProps) {
  const showHighlight = highlight && highlight.page === page;

  return (
    <div className="relative w-full overflow-hidden rounded-b-[20px] bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={`Answer sheet page ${page}`}
        className="answer-sheet-image"
      />

      {showHighlight && highlight ? (
        <div
          className="answer-highlight"
          style={{
            left: `${highlight.x * 100}%`,
            top: `${highlight.y * 100}%`,
            width: `${highlight.width * 100}%`,
            height: `${highlight.height * 100}%`,
          }}
        >
          <span className="absolute -top-[30px] left-3.5 flex h-[30px] items-center rounded-t-xl bg-[#34AC15] px-3 text-base font-bold font-sans tracking-[-0.04em] text-white">
            {highlightLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
