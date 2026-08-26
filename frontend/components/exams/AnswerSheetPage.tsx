import type { BoundingBox } from "@/types/exam";

interface AnswerSheetPageProps {
  page: number;
  highlight: BoundingBox | null;
  highlightLabel: string;
}

export function AnswerSheetPage({
  page,
  highlight,
  highlightLabel,
}: AnswerSheetPageProps) {
  const showHighlight = highlight && highlight.page === page;

  return (
    <div className="lined-paper relative min-h-[824px] w-full overflow-hidden rounded-b-[20px] px-6 py-8 font-hand text-[#1d4f9c]">
      {page === 1 ? <PageOne /> : null}
      {page === 2 ? <PageTwo /> : null}
      {page === 3 ? <PageThree /> : null}
      {page === 4 ? <PageFour /> : null}

      {showHighlight && highlight ? (
        <div
          className="absolute rounded-2xl border-2 border-[#3DD218] bg-[rgba(94,255,53,0.1)]"
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

function PageOne() {
  return (
    <div className="relative z-[1] flex flex-col gap-5 text-[28px] leading-8">
      <p className="font-semibold">Q1. Artery - carries blood away from the heart</p>
      <p>Photosynthesis is how plants make food using sunlight.</p>
      <div className="mx-auto w-fit rounded-md border border-[#1d4f9c]/40 px-6 py-2 text-[26px]">
        6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>
      </div>
      <div className="flex items-end justify-center gap-8 pt-4">
        <PlantDiagram />
        <div className="flex flex-col gap-2 text-[22px]">
          <p>sunlight →</p>
          <p>CO<sub>2</sub> in</p>
          <p>O<sub>2</sub> out</p>
          <p>water from roots</p>
        </div>
      </div>
      <div className="mt-16 flex flex-col gap-2">
        <p className="font-semibold">Q2. Chloroplast</p>
        <p>The organelle mainly involved in photosynthesis is the chloroplast.</p>
        <p>It contains chlorophyll which traps sunlight for the reaction.</p>
      </div>
    </div>
  );
}

function PageTwo() {
  return (
    <div className="relative z-[1] flex flex-col gap-6 text-[26px] leading-8">
      <p className="font-semibold">Q3. Chloroplasts contain chlorophyll.</p>
      <p>Light-dependent stage happens in the thylakoids.</p>
      <p>Calvin cycle happens in the stroma.</p>
      <p className="mt-8 font-semibold">Q5. Alveolus diagram</p>
      <p>Air space in the centre, capillaries around it, O2 in / CO2 out.</p>
      <p className="mt-8 font-semibold">Q6. Digestive system</p>
      <p>Stomach → small intestine (absorption) → large intestine, liver, pancreas.</p>
    </div>
  );
}

function PageThree() {
  return (
    <div className="relative z-[1] flex flex-col gap-6 text-[26px] leading-8">
      <p className="font-semibold">Q7. Nephron</p>
      <p>Bowman&apos;s capsule, glomerulus, PCT, loop of Henle, DCT, collecting duct.</p>
      <p className="mt-8 font-semibold">Q8. Palisade vs spongy mesophyll</p>
      <p>Palisade cells are packed tightly for light absorption. Spongy has air spaces for gas exchange.</p>
      <p className="mt-8 font-semibold">Q9. Transpiration</p>
      <p>Water evaporates from stomata. Heat and wind increase the rate.</p>
    </div>
  );
}

function PageFour() {
  return (
    <div className="relative z-[1] flex flex-col gap-6 text-[26px] leading-8">
      <p className="font-semibold">Q10. Xylem</p>
      <p>Lignified walls keep the vessel open for water transport.</p>
      <p className="mt-6 font-semibold">Q11a. Plant B is etiolated.</p>
      <p className="font-semibold">Q11b. Move Plant B into brighter light.</p>
      <p className="mt-6 font-semibold">Q12. Minute ventilation = 0.5 × 12 = 6 L/min</p>
      <p className="font-semibold">Q13. Alveolar ventilation = (0.5 − 0.15) × 12 = 4.2 L/min</p>
    </div>
  );
}

function PlantDiagram() {
  return (
    <svg viewBox="0 0 160 180" className="h-40 w-36" aria-hidden>
      <ellipse cx="80" cy="40" rx="28" ry="16" fill="#3f8f3a" />
      <ellipse cx="54" cy="58" rx="24" ry="14" fill="#4aa143" />
      <ellipse cx="108" cy="58" rx="24" ry="14" fill="#4aa143" />
      <rect x="76" y="70" width="8" height="70" fill="#6b8f3a" />
      <path d="M40 150c20-18 60-18 80 0" stroke="#2f6b4f" strokeWidth="3" fill="none" />
      <circle cx="28" cy="28" r="12" fill="#f5c542" />
    </svg>
  );
}
