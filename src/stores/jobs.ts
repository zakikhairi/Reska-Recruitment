import { create } from "zustand";

export interface Job {
  id: string;
  title: string;
  division: string;
  location: string;
  minEducation: string;
  minHeight?: number;
  minAge?: number;
  maxAge?: number;
  description: string;
  requirements: string;
  deadline: string;
  status: string;
  applicantCount?: number;
  isNew?: boolean;
}

interface JobsState {
  jobs: Job[];
  _hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  setHasHydrated: (state: boolean) => void;
  fetchJobs: () => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => void;
  getJob: (id: string) => Job | undefined;
  addJob: (job: Job) => void;
  deleteJob: (id: string) => void;
}

export const useJobsStore = create<JobsState>()((set, get) => ({
  jobs: [],
  _hasHydrated: true, // Set to true since we're using API
  isLoading: false,
  error: null,
  setHasHydrated: (state) => set({ _hasHydrated: state }),

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/jobs');
      const result = await response.json();

      if (result.success) {
        set({ jobs: result.jobs || [], isLoading: false });
      } else {
        set({ error: result.error || "Failed to fetch jobs", isLoading: false });
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      set({ error: "Failed to fetch jobs", isLoading: false });
    }
  },

  updateJob: (id, data) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, ...data } : job
      ),
    })),

  getJob: (id) => get().jobs.find((job) => job.id === id),

  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
    })),

  deleteJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
    })),
}));
