"use client";

import { AnswerSheetPage } from "@/components/exams/AnswerSheetPage";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
} from "@/components/icons/AppIcons";
import type { BoundingBox } from "@/types/exam";

interface AnswerSheetViewerProps {
  page: number;
  pageCount: number;
  zoom: number;
  imageUrl: string;
  highlight: BoundingBox | null;
  highlightLabel: string;
  showTitle?: boolean;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
}

const ZOOM_STEP = 25;
const MIN_ZOOM = 75;
const MAX_ZOOM = 150;

export function AnswerSheetViewer({
  page,
  pageCount,
  zoom,
  imageUrl,
  highlight,
  highlightLabel,
  showTitle = true,
  onPageChange,
  onZoomChange,
}: AnswerSheetViewerProps) {
  return (
    <section className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-[20px] border-[1.25px] border-black/10 bg-surface">
      <div className="flex h-16 shrink-0 items-center justify-between bg-text-primary px-4 py-3 lg:px-6">
        {showTitle ? (
          <p className="hidden text-base font-bold leading-[140%] tracking-[-0.04em] text-white/80 lg:block">
            Answer Sheet
          </p>
        ) : (
          <span />
        )}

        <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-end">
          <div className="flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <button
              type="button"
              aria-label="Zoom out"
              className="text-white disabled:text-muted"
              disabled={zoom <= MIN_ZOOM}
              onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="min-w-9 text-center text-sm font-bold leading-[140%] text-white">
              {zoom}%
            </span>
            <button
              type="button"
              aria-label="Zoom in"
              className="text-white disabled:text-muted"
              disabled={zoom >= MAX_ZOOM}
              onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <button
              type="button"
              aria-label="Previous page"
              className="text-white disabled:text-muted"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold leading-[140%] text-white">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              className="text-white disabled:text-muted"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#efefe8]">
        <div className="answer-sheet-page" data-zoom={String(zoom)}>
          <AnswerSheetPage
            page={page}
            imageUrl={imageUrl}
            highlight={highlight}
            highlightLabel={highlightLabel}
          />
        </div>
      </div>
    </section>
  );
}
