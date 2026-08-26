"use client";

import {
  ArrowLeftIcon,
  BellIcon,
  ChevronDownIcon,
  ExamsIcon,
  HelpIcon,
  MenuIcon,
  SparkleIcon,
  UserAvatar,
} from "@/components/icons/AppIcons";

interface HeaderProps {
  onBack?: () => void;
  onOpenMobileNav: () => void;
}

export function Header({ onBack, onOpenMobileNav }: HeaderProps) {
  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-2.5 rounded-b-2xl bg-surface px-3 py-0 lg:rounded-2xl lg:bg-white/75 lg:px-6 lg:pr-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-primary"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <ExamsIcon className="hidden h-5 w-5 text-muted lg:block" />
          <span className="text-lg font-bold tracking-[-0.06em] text-text-primary lg:hidden">
            VedaAI
          </span>
          <span className="hidden text-base font-semibold tracking-[-0.04em] text-muted lg:block">
            Exams
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-header-icon text-text-primary lg:flex"
          aria-label="Help"
        >
          <HelpIcon className="h-6 w-6" />
        </button>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-header-icon text-text-primary"
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-surface text-heading lg:flex"
          aria-label="AI tools"
        >
          <SparkleIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-0 py-1 lg:px-3"
        >
          <UserAvatar className="h-8 w-8 rounded-full" />
          <span className="hidden items-center gap-1 lg:flex">
            <span className="text-base font-semibold tracking-[-0.04em] text-text-primary">
              Madhur Rastogi
            </span>
            <ChevronDownIcon className="h-6 w-6 text-text-primary" />
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex h-9 w-9 items-center justify-center text-text-primary lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
