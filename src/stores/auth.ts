import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "APPLICANT" | "HR_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  employeeId?: string;
  department?: string;
  applicantId?: string;
  fullProfile?: {
    nik: string;
    phone: string;
    education: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "kai-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
