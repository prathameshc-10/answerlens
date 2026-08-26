import type { UploadedFile } from "@/types/exam";

export function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes < 10 && megabytes % 1 !== 0 ? megabytes.toFixed(1) : Math.round(megabytes)}MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export async function getPdfPageCount(file: File): Promise<number | null> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return null;
  }

  const buffer = await file.arrayBuffer();
  const text = new TextDecoder("latin1").decode(buffer);
  const catalogCount = text.match(/\/Type\s*\/Pages[\s\S]{0,240}\/Count\s+(\d+)/);

  if (catalogCount) {
    return Number(catalogCount[1]);
  }

  const pageObjects = text.match(/\/Type\s*\/Page(?!s)/g);
  return pageObjects?.length ?? null;
}

export async function toUploadedFile(file: File): Promise<UploadedFile> {
  const pageCount = await getPdfPageCount(file);

  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    size: file.size,
    pageCount,
    mimeType: file.type,
    file,
  };
}
