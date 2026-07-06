import type { Analytics, Job, JobDraft, MatchResult } from "./types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "请求失败，请稍后重试");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  me: () =>
    request<{ user: { id: string; email: string; name: string } }>(
      "/api/auth/me"
    ),
  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string; name: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  jobs: () => request<{ jobs: Job[] }>("/api/jobs"),
  analytics: () => request<{ analytics: Analytics }>("/api/analytics"),
  createJob: (job: JobDraft) =>
    request<{ job: Job }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(job)
    }),
  updateJob: (id: string, job: Partial<JobDraft>) =>
    request<{ job: Job }>(`/api/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(job)
    }),
  deleteJob: (id: string) =>
    request<void>(`/api/jobs/${id}`, { method: "DELETE" }),
  analyze: (resumeText: string, jobDescription: string) =>
    request<{ result: MatchResult }>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ resumeText, jobDescription })
    })
};
