"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileNavOpen: boolean;
  onMobileNavOpenChange: (open: boolean) => void;
  onBack?: () => void;
  contentClassName?: string;
}

export function AppShell({
  children,
  collapsed,
  onCollapsedChange,
  mobileNavOpen,
  onMobileNavOpenChange,
  onBack,
  contentClassName = "",
}: AppShellProps) {
  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMobileNavOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen, onMobileNavOpenChange]);

  return (
    <div className="relative h-dvh overflow-hidden bg-[linear-gradient(180deg,#F5F5F5_0%,#E9E5E5_100%)]">
      <div className="pointer-events-none absolute left-1/2 top-[70%] h-[428px] w-[1318px] -translate-x-[38%] rounded-full bg-[rgba(23,23,23,0.4)] blur-[200px]" />
      <div className="pointer-events-none absolute left-1/2 top-[90%] h-[428px] w-[1113px] -translate-x-[36%] rounded-full bg-[rgba(76,76,76,0.4)] blur-[200px]" />

      <div className="relative z-10 flex h-dvh gap-3 p-0 lg:p-3">
        <div className="hidden h-full shrink-0 lg:block">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => onCollapsedChange(!collapsed)}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <Header
            onBack={onBack}
            onOpenMobileNav={() => onMobileNavOpenChange(true)}
          />
          <main
            className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${contentClassName}`}
          >
            {children}
          </main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-heading/40"
            aria-label="Close menu"
            onClick={() => onMobileNavOpenChange(false)}
          />
          <div className="relative h-full w-[min(304px,86vw)]">
            <Sidebar
              collapsed={false}
              onToggle={() => onMobileNavOpenChange(false)}
              variant="drawer"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
