"use client";

import type { ComponentType } from "react";
import {
  AssignmentsIcon,
  ClassroomIcon,
  DoubleChevronIcon,
  ExamsIcon,
  HomeIcon,
  LibraryIcon,
  SchoolCrest,
  SettingsIcon,
  SidebarToggleIcon,
  SparkleIcon,
  VedaMark,
} from "@/components/icons/AppIcons";

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "classroom", label: "My Classroom", icon: ClassroomIcon },
  { id: "assignments", label: "Assignments", icon: AssignmentsIcon },
  { id: "exams", label: "Exams", icon: ExamsIcon, active: true },
  { id: "library", label: "My Library", icon: LibraryIcon },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  variant?: "desktop" | "drawer";
}

export function Sidebar({ collapsed, onToggle, variant = "desktop" }: SidebarProps) {
  const isCollapsed = variant === "desktop" && collapsed;

  return (
    <aside
      className={`flex h-full flex-col justify-between bg-surface shadow-[0px_16px_48px_rgba(0,0,0,0.12),0px_32px_48px_rgba(0,0,0,0.2)] transition-[width] duration-200 ${
        variant === "drawer"
          ? "w-full rounded-none"
          : `rounded-2xl ${isCollapsed ? "w-[84px] px-3 py-6" : "w-[304px] p-6"}`
      } ${variant === "drawer" ? "p-6" : ""}`}
    >
      <div className={`flex flex-col ${isCollapsed ? "items-center gap-8" : "gap-14"}`}>
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "w-full justify-between"}`}
        >
          <div className="flex items-center gap-2">
            <VedaMark className="h-10 w-10 shrink-0" />
            {!isCollapsed ? (
              <span className="text-[28px] font-bold leading-5 tracking-[-0.06em] text-text-primary">
                VedaAI
              </span>
            ) : null}
          </div>
          {!isCollapsed && variant === "desktop" ? (
            <button
              type="button"
              onClick={onToggle}
              className="text-nav-muted"
              aria-label="Collapse sidebar"
            >
              <SidebarToggleIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className={`flex items-center justify-center gap-2.5 rounded-full bg-[#272727] text-white shadow-[inset_0px_-1px_3.5px_rgba(177,177,177,0.6),inset_0px_0px_34.5px_rgba(255,255,255,0.25),0_0_0_1.5px_#FF5623] ${
            isCollapsed ? "h-11 w-11" : "h-[42px] w-full px-4"
          }`}
        >
          <SparkleIcon className="h-[17px] w-[18px] text-white" />
          {!isCollapsed ? (
            <span className="whitespace-nowrap font-inter text-base font-medium tracking-[-0.04em]">
              AI Teacher&apos;s Toolkit
            </span>
          ) : null}
        </button>

        <nav className={`flex w-full flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`relative flex items-center gap-2 rounded-lg ${
                  isCollapsed ? "h-10 w-10 justify-center p-0" : "h-[38px] w-full px-3 py-2"
                } ${
                  item.active
                    ? "bg-off-white font-medium text-text-primary"
                    : "text-nav-muted"
                }`}
              >
                {item.active && !isCollapsed ? (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
                ) : null}
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed ? (
                  <span className="flex-1 text-left text-base leading-[140%] tracking-[-0.04em]">
                    {item.label}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
        {!isCollapsed ? (
          <button
            type="button"
            className="flex h-[38px] w-full items-center gap-2 rounded-lg px-3 py-2 text-nav-muted"
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="flex-1 text-left text-base leading-[140%] tracking-[-0.04em]">
              Settings
            </span>
          </button>
        ) : null}

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <span className="flex h-10 w-10 overflow-hidden rounded-full">
              <SchoolCrest className="h-10 w-10" />
            </span>
            <button
              type="button"
              onClick={onToggle}
              className="text-nav-muted"
              aria-label="Expand sidebar"
            >
              <DoubleChevronIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center gap-2 rounded-2xl bg-off-white p-3">
            <SchoolCrest className="h-[60px] w-[59px] shrink-0" />
            <div className="flex min-w-0 flex-col">
              <p className="text-base font-bold leading-[140%] tracking-[-0.04em] text-text-primary">
                Delhi Public School
              </p>
              <p className="text-sm font-normal leading-[140%] tracking-[-0.04em] text-text-secondary">
                Bokaro Steel City
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
