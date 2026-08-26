import {
  ClockMiniIcon,
  CloudMiniIcon,
  GearMiniIcon,
  TaskMiniIcon,
} from "@/components/icons/AppIcons";

export function HeroIllustration() {
  return (
    <div className="relative h-[138px] w-[138px]">
      <div className="absolute inset-0 rounded-full bg-[rgba(255,86,35,0.1)]" />
      <div className="absolute left-1/2 top-[15.6px] h-[108px] w-[108px] -translate-x-1/2 rounded-full bg-[rgba(255,86,35,0.26)]" />

      <svg
        className="absolute left-1/2 top-[11px] h-[97px] w-[79px] -translate-x-1/2"
        viewBox="0 0 79 97"
        fill="none"
        aria-hidden
      >
        <ellipse cx="39.5" cy="86" rx="22" ry="8" fill="white" />
        <path
          d="M18 92c2-18 10-28 21.5-28S59 74 61 92"
          fill="#1F1F1F"
        />
        <rect x="24" y="58" width="31" height="22" rx="6" fill="#2B2B2B" />
        <rect x="30" y="62" width="19" height="13" rx="2" fill="#F4F4F4" />
        <circle cx="39.5" cy="38" r="16" fill="#E8B89A" />
        <path
          d="M24 40c1-16 8-24 15.5-24S54 24 55 40c-3-6-8-8-15.5-8S27 34 24 40Z"
          fill="#2A1B12"
        />
        <path d="M23 36c4-3 9-4 16.5-4S56 33 60 36v6H23v-6Z" fill="#2A1B12" />
        <circle cx="34" cy="39" r="1.2" fill="#2B2B2B" />
        <circle cx="45" cy="39" r="1.2" fill="#2B2B2B" />
        <rect x="29.5" y="36.5" width="9" height="5" rx="2.5" stroke="#2B2B2B" strokeWidth="1.2" fill="none" />
        <rect x="40.5" y="36.5" width="9" height="5" rx="2.5" stroke="#2B2B2B" strokeWidth="1.2" fill="none" />
        <path d="M38.5 39h2" stroke="#2B2B2B" strokeWidth="1.2" />
        <path d="M36 45.5c2 1.4 5 1.4 7 0" stroke="#C07A62" strokeWidth="1.1" strokeLinecap="round" />
      </svg>

      <span className="absolute left-0 top-[32px] flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[linear-gradient(121.62deg,#FB975D_30.95%,#FC5E24_69.77%)]">
        <TaskMiniIcon className="h-[7px] w-[7px]" />
      </span>
      <span className="absolute left-[71px] top-0 flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[linear-gradient(121.62deg,#FB975D_30.95%,#FC5E24_69.77%)]">
        <ClockMiniIcon className="h-[7px] w-[7px]" />
      </span>
      <span className="absolute right-0 top-[70px] flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[linear-gradient(121.62deg,#FB975D_30.95%,#FC5E24_69.77%)]">
        <CloudMiniIcon className="h-[7px] w-[7px]" />
      </span>
      <span className="absolute left-[28px] top-[99px] flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[linear-gradient(121.62deg,#FB975D_30.95%,#FC5E24_69.77%)]">
        <GearMiniIcon className="h-[7px] w-[7px]" />
      </span>
    </div>
  );
}
