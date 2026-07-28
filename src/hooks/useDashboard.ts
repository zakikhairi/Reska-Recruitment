"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface DashboardStats {
  stats: {
    totalApplicants: number;
    testCompleted: number;
    passingRate: number;
    activeJobs: number;
    changes: {
      applicants: number;
      testCompleted: number;
      passingRate: number;
      activeJobs: number;
    };
  };
  monthlyTrend: Array<{
    month: string;
    pelamar: number;
    lulus: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
  }>;
  topDivisions: Array<{
    name: string;
    division: string;
    applicants: number;
  }>;
}

export interface Applicant {
  id: string;
  name: string;
  nik: string;
  email: string;
  phone: string;
  position: string;
  division: string;
  appliedDate: string;
  status: string;
  score: number | null;
  education: string;
}

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    "/api/admin/dashboard",
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  return {
    stats: data?.stats,
    monthlyTrend: data?.monthlyTrend,
    statusDistribution: data?.statusDistribution,
    topDivisions: data?.topDivisions,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

export function useApplicants(searchQuery?: string, statusFilter?: string) {
  const params = new URLSearchParams();
  if (searchQuery) params.set("search", searchQuery);
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

  const url = `/api/admin/applicants${params.toString() ? `?${params.toString()}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<Applicant[]>(
    url,
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds for real-time updates
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  return {
    applicants: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
