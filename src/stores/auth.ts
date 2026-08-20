import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "APPLICANT" | "HR_ADMIN" | "SUPER_ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  employeeId?: string;
  department?: string;
  applicantId?: string;
  nik?: string;
  phone?: string;
  education?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    nik?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();

          if (!result.success) {
            set({ isLoading: false });
            return { success: false, error: result.error || "Login gagal" };
          }

          // Build auth user object
          const authUser: AuthUser = {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            fullName: result.user.fullName || result.user.email.split("@")[0],
            employeeId: result.user.employeeId,
            department: result.user.department,
            applicantId: result.user.applicantId,
            nik: result.user.fullProfile?.nik,
            phone: result.user.fullProfile?.phone,
            education: result.user.fullProfile?.education,
          };

          set({
            user: authUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: "Terjadi kesalahan koneksi" };
        }
      },

      register: async (data) => {
        set({ isLoading: true });

        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
              confirmPassword: data.password,
              fullName: data.fullName,
              nik: data.nik || "0000000000000000",
              phone: data.phone || "0000000000000",
            }),
          });

          const result = await response.json();

          if (!result.success) {
            set({ isLoading: false });
            return { success: false, error: result.error || "Registrasi gagal" };
          }

          // Build auth user object from response
          const authUser: AuthUser = {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            fullName: result.user.fullName || data.fullName,
            applicantId: result.user.applicantId,
            nik: data.nik,
            phone: data.phone,
            education: "SMA",
          };

          set({
            user: authUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: "Terjadi kesalahan koneksi" };
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) {
          return { success: false, error: "Tidak ada user yang login" };
        }

        try {
          const response = await fetch("/api/auth/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            return { success: false, error: result.error || "Gagal update profil" };
          }

          set({
            user: {
              ...user,
              ...data,
            },
          });

          return { success: true };
        } catch (error) {
          return { success: false, error: "Terjadi kesalahan koneksi" };
        }
      },

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
