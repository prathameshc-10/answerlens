import type { BoundingBox, ExtractedQuestion, ScoreTone } from "@/types/exam";

export const ANSWER_SHEET_PAGE_COUNT = 4;

export const extractedQuestions: ExtractedQuestion[] = [
  {
    id: "q1",
    number: 1,
    text: "Which blood vessel carries blood away from the heart?",
    awarded: 2,
    max: 2,
    feedback: "Correct. Arteries carry blood away from the heart.",
    bbox: { page: 1, x: 0.03, y: 0.06, width: 0.9, height: 0.12 },
  },
  {
    id: "q2",
    number: 2,
    text: "Which of the following organelles is primarily involved in photosynthesis?",
    awarded: 2,
    max: 2,
    feedback:
      "Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!",
    bbox: { page: 1, x: 0.017, y: 0.664, width: 0.944, height: 0.276 },
  },
  {
    id: "q3",
    number: 3,
    text: "Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.",
    awarded: 2,
    max: 2,
    feedback: "Clear explanation of light-dependent and light-independent stages.",
    bbox: { page: 2, x: 0.04, y: 0.08, width: 0.9, height: 0.22 },
  },
  {
    id: "q4",
    number: 4,
    text: "Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.",
    awarded: 0,
    max: 2,
    feedback: "This answer was not found on the sheet. Please review the cardiac cycle pathway.",
    bbox: null,
  },
  {
    id: "q5",
    number: 5,
    text: "Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).",
    awarded: 2,
    max: 2,
    feedback: "Labels and gas-exchange arrows are accurate.",
    bbox: { page: 2, x: 0.05, y: 0.42, width: 0.88, height: 0.28 },
  },
  {
    id: "q6",
    number: 6,
    text: "Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.",
    awarded: 4,
    max: 5,
    feedback: "Most organs are labelled. Mark the small intestine more clearly as the absorption site.",
    bbox: { page: 2, x: 0.05, y: 0.72, width: 0.88, height: 0.2 },
  },
  {
    id: "q7",
    number: 7,
    text: "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).",
    awarded: 5,
    max: 5,
    feedback: "Complete and well-labelled nephron diagram.",
    bbox: { page: 3, x: 0.04, y: 0.08, width: 0.9, height: 0.3 },
  },
  {
    id: "q8",
    number: 8,
    text: "Explain the structural differences between palisade mesophyll and spongy mesophyll and state how each structure aids its function in the leaf.",
    awarded: 3,
    max: 5,
    feedback: "Structure is described, but link each adaptation more clearly to function.",
    bbox: { page: 3, x: 0.04, y: 0.44, width: 0.9, height: 0.22 },
  },
  {
    id: "q9",
    number: 9,
    text: "Describe the process of transpiration in plants in two to three sentences and name two environmental factors that increase its rate.",
    awarded: 5,
    max: 5,
    feedback: "Accurate description. Temperature and wind are valid factors.",
    bbox: { page: 3, x: 0.04, y: 0.7, width: 0.9, height: 0.2 },
  },
  {
    id: "q10",
    number: 10,
    text: "Explain how the structure of xylem vessels facilitates water transport in plants (mention one structural feature and its role).",
    awarded: 4,
    max: 5,
    feedback: "Lignified walls are mentioned. Add how hollow lumen reduces resistance.",
    bbox: { page: 4, x: 0.04, y: 0.08, width: 0.9, height: 0.2 },
  },
  {
    id: "q11a",
    number: 11,
    part: "a.",
    text: "A diagram shows two potted plants — Plant A in bright light with broad green leaves, Plant B kept in dim light with pale, elongated leaves.",
    awarded: 2,
    max: 2,
    feedback: "Correct observation of etiolation in Plant B.",
    bbox: { page: 4, x: 0.04, y: 0.32, width: 0.9, height: 0.2 },
  },
  {
    id: "q11b",
    number: 11,
    part: "b.",
    text: "Suggest one practical measure to help Plant B recover.",
    awarded: 1,
    max: 3,
    feedback: "Moving it to light is right. Explain why chlorophyll recovery needs time.",
    bbox: { page: 4, x: 0.04, y: 0.54, width: 0.9, height: 0.16 },
  },
  {
    id: "q12",
    number: 12,
    text: "A resting person has tidal volume (air per breath) of 0.5 L and breathes 12 times per minute.",
    awarded: 4,
    max: 5,
    feedback: "Minute ventilation is correct. Show units in the working.",
    bbox: { page: 4, x: 0.04, y: 0.72, width: 0.9, height: 0.12 },
  },
  {
    id: "q13",
    number: 13,
    text: "If dead space is 0.15 L per breath, calculate the alveolar ventilation per minute. Show working.",
    awarded: 4,
    max: 5,
    feedback: "Method is correct. Recheck the final arithmetic.",
    bbox: { page: 4, x: 0.04, y: 0.84, width: 0.9, height: 0.1 },
  },
];

export function getScoreTone(awarded: number, max: number): ScoreTone {
  if (awarded <= 0) {
    return "fail";
  }

  if (awarded / max >= 0.8) {
    return "success";
  }

  return "partial";
}

export function formatScore(awarded: number, max: number): string {
  return `${awarded} / ${max}`;
}

export function findQuestionBbox(questionId: string): BoundingBox | null {
  return extractedQuestions.find((question) => question.id === questionId)?.bbox ?? null;
}
