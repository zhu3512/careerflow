export type JobStatus =
  | "wishlist"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  location: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  source: string;
  appliedAt: string | null;
  nextStep: string;
  nextStepAt: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type JobDraft = Omit<Job, "id" | "createdAt" | "updatedAt">;

export interface Analytics {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  interviewRate: number;
  offerRate: number;
}

export interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  summary: string;
}
