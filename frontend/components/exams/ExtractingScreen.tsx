const STAGE_LABELS: Record<string, string> = {
  queued: "Preparing your papers",
  extract_questions: "Extracting questions",
  extract_answers: "Extracting answers",
  map_answers: "Mapping answers to questions",
  grading: "Grading answers",
  done: "Finishing up",
};

interface ExtractingScreenProps {
  percent?: number;
  stage?: string;
}

export function ExtractingScreen({ percent, stage }: ExtractingScreenProps) {
  const stageLabel = stage ? STAGE_LABELS[stage] : undefined;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
      <div className="sparkle-float relative mb-2 h-[92px] w-[140px]">
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 140 92"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="extractSparkle" x1="0" y1="0" x2="48" y2="48">
              <stop stopColor="#FB975D" />
              <stop offset="1" stopColor="#FC5E24" />
            </linearGradient>
          </defs>
          <path
            className="sparkle-pulse origin-center"
            d="M24 18 27.8 34.2 44 38 27.8 41.8 24 58 20.2 41.8 4 38 20.2 34.2 24 18Z"
            fill="url(#extractSparkle)"
            opacity="0.75"
          />
          <path
            className="sparkle-pulse origin-center"
            d="M78 2 83.8 22.2 104 28 83.8 33.8 78 54 72.2 33.8 52 28 72.2 22.2 78 2Z"
            fill="url(#extractSparkle)"
          />
          <path
            className="sparkle-pulse origin-center"
            d="M116 28 119.2 40.2 131.5 43.5 119.2 46.8 116 59 112.8 46.8 100.5 43.5 112.8 40.2 116 28Z"
            fill="url(#extractSparkle)"
            opacity="0.9"
          />
          <path
            className="sparkle-pulse origin-center"
            d="M18 52 20.2 60.2 28.5 62.5 20.2 64.8 18 73 15.8 64.8 7.5 62.5 15.8 60.2 18 52Z"
            fill="url(#extractSparkle)"
            opacity="0.7"
          />
          <circle cx="92" cy="68" r="4" fill="#FF5623" />
        </svg>
      </div>
      <h1 className="text-[32px] font-bold leading-[120%] tracking-[-0.04em] text-heading lg:text-[40px]">
        Extracting...
      </h1>
      <p className="text-base tracking-[-0.04em] text-nav-muted lg:text-xl">
        {stageLabel ?? "This may take a while"}
      </p>
      {typeof percent === "number" ? (
        <p className="text-sm tracking-[-0.04em] text-nav-muted">{percent}%</p>
      ) : null}
    </div>
  );
}
