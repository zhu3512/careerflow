export const JOB_STATUSES = [
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected"
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

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

export interface JobInput {
  company: string;
  role: string;
  status: JobStatus;
  location?: string;
  workMode?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  source?: string;
  appliedAt?: string | null;
  nextStep?: string;
  nextStepAt?: string | null;
  description?: string;
}
