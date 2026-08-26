import { CloseIcon, PdfIcon } from "@/components/icons/AppIcons";
import { formatFileSize } from "@/lib/files";
import type { UploadedFile } from "@/types/exam";

interface FileCardProps {
  file: UploadedFile;
  onRemove: () => void;
}

export function FileCard({ file, onRemove }: FileCardProps) {
  const meta = [
    formatFileSize(file.size),
    file.pageCount ? `${file.pageCount} ${file.pageCount === 1 ? "Page" : "Pages"}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="relative w-full max-w-[320px] rounded-[20px] bg-surface px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 pr-8">
        <PdfIcon className="h-12 w-10 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[-0.04em] text-text-primary">
            {file.name}
          </p>
          <p className="text-xs tracking-[-0.04em] text-nav-muted">{meta}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }}
        className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#3A3A3A] text-white"
        aria-label={`Remove ${file.name}`}
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
