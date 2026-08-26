import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CreateSessionResponse,
  PageImageType,
  ProcessResponse,
  ProgressResponse,
  SessionResults,
  UploadFilesPayload,
  UploadResponse,
} from "@/types/exam";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function getSessionImageUrl(
  sessionId: string,
  type: PageImageType,
  page: number,
): string {
  return `${API_BASE_URL}/api/image/${sessionId}/${type}/${page}`;
}

function toUploadFormData(sessionId: string, files: File[]): FormData {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  files.forEach((file) => {
    formData.append("files", file);
  });
  return formData;
}

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    createSession: builder.mutation<CreateSessionResponse, void>({
      query: () => ({
        url: "/api/session/create",
        method: "POST",
      }),
    }),
    uploadQuestionPaper: builder.mutation<UploadResponse, UploadFilesPayload>({
      query: ({ sessionId, files }) => ({
        url: "/api/upload/question-paper",
        method: "POST",
        body: toUploadFormData(sessionId, files),
      }),
    }),
    uploadAnswerSheet: builder.mutation<UploadResponse, UploadFilesPayload>({
      query: ({ sessionId, files }) => ({
        url: "/api/upload/answer-sheet",
        method: "POST",
        body: toUploadFormData(sessionId, files),
      }),
    }),
    startProcess: builder.mutation<ProcessResponse, string>({
      query: (sessionId) => ({
        url: `/api/process/${sessionId}`,
        method: "POST",
      }),
    }),
    getProgress: builder.query<ProgressResponse, string>({
      query: (sessionId) => `/api/progress/${sessionId}`,
    }),
    getResults: builder.query<SessionResults, string>({
      query: (sessionId) => `/api/results/${sessionId}`,
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useUploadQuestionPaperMutation,
  useUploadAnswerSheetMutation,
  useStartProcessMutation,
  useGetProgressQuery,
  useGetResultsQuery,
} = examApi;
