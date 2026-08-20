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
  startDate: string;
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
  fetchJobs: (adminMode?: boolean) => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<{ success: boolean; error?: string }>;
  getJob: (id: string) => Job | undefined;
  addJob: (job: Job) => void;
  deleteJob: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useJobsStore = create<JobsState>()((set, get) => ({
  jobs: [],
  _hasHydrated: true, // Set to true since we're using API
  isLoading: false,
  error: null,
  setHasHydrated: (state) => set({ _hasHydrated: state }),

  fetchJobs: async (adminMode = false) => {
    set({ isLoading: true, error: null });
    try {
      // Use admin API for admin panel (sees all jobs including draft/closed)
      // Use public API for public page (only sees active jobs in registration period)
      const apiUrl = adminMode ? '/api/admin/jobs' : '/api/jobs';
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success || result.jobs) {
        set({ jobs: result.jobs || [], isLoading: false });
      } else {
        set({ error: result.error || "Failed to fetch jobs", isLoading: false });
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      set({ error: "Failed to fetch jobs", isLoading: false });
    }
  },

  updateJob: async (id, data) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...result.job } : job
          ),
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error("Failed to update job:", err);
      return { success: false, error: "Terjadi kesalahan server" };
    }
  },

  getJob: (id) => get().jobs.find((job) => job.id === id),

  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
    })),

  deleteJob: async (id) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error("Failed to delete job:", err);
      return { success: false, error: "Terjadi kesalahan server" };
    }
  },
}));
