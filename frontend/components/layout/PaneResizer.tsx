"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

interface PaneResizerProps {
  containerRef: RefObject<HTMLElement | null>;
  value: number;
  min?: number;
  max?: number;
  onChange: (percent: number) => void;
}

export function PaneResizer({
  containerRef,
  value,
  min = 30,
  max = 70,
  onChange,
}: PaneResizerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width === 0) {
        return;
      }

      const next = ((clientX - rect.left) / rect.width) * 100;
      onChange(Math.min(max, Math.max(min, next)));
    },
    [containerRef, max, min, onChange],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function onPointerMove(event: PointerEvent) {
      updateFromClientX(event.clientX);
    }

    function onPointerUp() {
      setIsDragging(false);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    document.body.classList.add("is-resizing-panes");

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.classList.remove("is-resizing-panes");
    };
  }, [isDragging, updateFromClientX]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize question list and answer sheet"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      data-active={isDragging ? "true" : "false"}
      className="pane-resizer"
      onPointerDown={(event) => {
        event.preventDefault();
        setIsDragging(true);
        updateFromClientX(event.clientX);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onChange(Math.max(min, value - 2));
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onChange(Math.min(max, value + 2));
        }
      }}
    >
      <span className="pane-resizer-handle" />
    </div>
  );
}
