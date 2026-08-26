import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface FastApiErrorBody {
  detail?: unknown;
}

function formatDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter((item): item is string => Boolean(item));

    return messages.length ? messages.join(" ") : null;
  }

  return null;
}

export function getApiErrorMessage(error: unknown): string {
  const fetchError = error as FetchBaseQueryError | undefined;
  if (fetchError && typeof fetchError === "object" && "data" in fetchError) {
    const data = fetchError.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (typeof data === "object" && data !== null) {
      const fromDetail = formatDetail((data as FastApiErrorBody).detail);
      if (fromDetail) {
        return fromDetail;
      }
    }
  }

  const serialized = error as SerializedError | undefined;
  if (serialized?.message) {
    return serialized.message;
  }

  return "Something went wrong. Please try again.";
}
