import type { BoundingBox, ExtractedQuestion, MappedResult, SessionResults } from "@/types/exam";

const UNANSWERED_FEEDBACK = "This answer was not found on the sheet.";

export function parseQuestionLabel(raw: string): { number: number; part?: string } {
  const cleaned = raw.replace(/^Q\s*/i, "").trim();
  const match = cleaned.match(/^(\d+)\s*(?:\(([^)]+)\)|[.\s]*([a-zA-Z]))?/);

  if (!match) {
    const fallback = Number.parseInt(cleaned, 10);
    return { number: Number.isFinite(fallback) ? fallback : 0 };
  }

  const partRaw = match[2] ?? match[3];
  const part = partRaw
    ? partRaw.endsWith(".")
      ? partRaw
      : `${partRaw}.`
    : undefined;

  return { number: Number(match[1]), part };
}

function firstAnswerBbox(item: MappedResult): BoundingBox | null {
  if (item.status !== "answered" || !item.answer?.bboxes.length) {
    return null;
  }

  return item.answer.bboxes[0] ?? null;
}

export function mapSessionToExtractedQuestions(
  results: SessionResults,
): ExtractedQuestion[] {
  return results.mapped_results
    .filter((item) => item.status !== "unmatched")
    .map((item) => {
      const { number, part } = parseQuestionLabel(item.question.number);
      const grading = item.grading;

      return {
        id: item.question.id,
        number,
        part,
        text: item.question.text,
        awarded: grading?.score ?? 0,
        max: grading?.max_score ?? item.question.max_marks ?? 0,
        feedback:
          grading?.feedback ??
          (item.status === "unanswered" ? UNANSWERED_FEEDBACK : ""),
        bbox: firstAnswerBbox(item),
      };
    });
}

export function getAnswerSheetPageCount(results: SessionResults): number {
  return Math.max(1, results.answer_sheet_images.length);
}
