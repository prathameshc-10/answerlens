interface IconProps {
  className?: string;
}

export function VedaMark({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="#303030" />
      <path
        d="M8.5 12.2h7.4L20 27.8 24.1 12.2h7.4L22.6 31H17.4L8.5 12.2Z"
        fill="white"
      />
    </svg>
  );
}

export function SidebarToggleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 4.5h13M3.5 10h13M3.5 15.5h13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5 13.7 9.3 20.5 11 13.7 12.7 12 19.5 10.3 12.7 3.5 11 10.3 9.3 12 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ClassroomIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AssignmentsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3.5h6.2L20 9.3V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 7 20V5A1.5 1.5 0 0 1 8.5 3.5H8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 3.8V9h5.4M10 13h6M10 16.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ExamsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4.5h7l5 5V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5H7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 4.8V10h5.2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function LibraryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.2l2.8 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M17.6 6.2A8 8 0 0 1 20 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.8v1.8M12 18.4v1.8M4.9 7.5l1.5.9M17.6 15.6l1.5.9M4.9 16.5l1.5-.9M17.6 8.4l1.5-.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5.5 8.5 12 15 18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5.5 15.5 12 9 18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoubleChevronIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6.5 13.5 12 8 17.5M13 6.5 18.5 12 13 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.2.9-1.2 1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.2 16.5h11.6l-1.2-2.1V10a4.6 4.6 0 1 0-9.2 0v4.4l-1.2 2.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 18.4a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 9.5 12 14.5 17 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 14.5 12 9.5 17 14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 7h15M4.5 12h15M4.5 17h15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7 17 17M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UploadTrayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M6 20.5v3.2A2.3 2.3 0 0 0 8.3 26h15.4A2.3 2.3 0 0 0 26 23.7v-3.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 6.5v14M11 11.2 16 6.5l5 4.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PdfIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 48" fill="none" aria-hidden>
      <path
        d="M8 2h16l12 12v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z"
        fill="#E24C4B"
      />
      <path d="M24 2v10a2 2 0 0 0 2 2h10" fill="#F19998" />
      <text
        x="20"
        y="34"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

export function TaskMiniIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="2" y="2" width="8" height="8" rx="1.4" stroke="white" strokeWidth="1.1" />
      <path d="M4 6.1 5.3 7.4 8.1 4.6" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function ClockMiniIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="3.6" stroke="white" strokeWidth="1.1" />
      <path d="M6 4.2V6l1.4 1" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function CloudMiniIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3.6 8.4h4.6a1.8 1.8 0 0 0 .2-3.6 2.4 2.4 0 0 0-4.6-.3A1.7 1.7 0 0 0 3.6 8.4Z"
        stroke="white"
        strokeWidth="1.1"
      />
    </svg>
  );
}

export function GearMiniIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="1.5" stroke="white" strokeWidth="1.1" />
      <path
        d="M6 2.4v1.1M6 8.5v1.1M2.4 6h1.1M8.5 6h1.1"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GradientSparkle({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 2 27.8 18.2 44 22 27.8 25.8 24 42 20.2 25.8 4 22 20.2 18.2 24 2Z"
        fill="#FF5623"
      />
    </svg>
  );
}

export function SchoolCrest({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 59 60" fill="none" aria-hidden>
      <rect width="59" height="60" rx="8" fill="#F7E7D0" />
      <circle cx="29.5" cy="28" r="16" fill="#1F4D3A" />
      <path d="M18 28h23L29.5 18 18 28Z" fill="#E8C15A" />
      <path d="M21 30h17v8.5c0 4-8.5 7-8.5 7s-8.5-3-8.5-7V30Z" fill="#2F6B4F" />
      <text
        x="29.5"
        y="36"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        DPS
      </text>
    </svg>
  );
}

export function UserAvatar({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#E8C4A8" />
      <circle cx="16" cy="12.5" r="5.2" fill="#4A3424" />
      <circle cx="16" cy="13.4" r="4.2" fill="#E0B08A" />
      <path d="M6.5 29c1.4-6.4 5.8-9.4 9.5-9.4h0c3.7 0 8.1 3 9.5 9.4" fill="#2B2B2B" />
    </svg>
  );
}
