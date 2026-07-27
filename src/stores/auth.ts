import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  findUserByEmail,
  findUserById,
  verifyPassword,
  createUser,
  updateUser,
  type User
} from "@/lib/local-db";

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
          // Find user in local database
          const user = findUserByEmail(email);

          if (!user) {
            set({ isLoading: false });
            return { success: false, error: "Email atau password salah" };
          }

          // Verify password
          if (!verifyPassword(user, password)) {
            set({ isLoading: false });
            return { success: false, error: "Email atau password salah" };
          }

          // Build auth user object
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            fullName: user.fullName || user.email.split("@")[0],
            nik: user.nik,
            phone: user.phone,
            education: user.education,
            applicantId: user.role === "APPLICANT" ? user.id : undefined,
            employeeId: user.role !== "APPLICANT" ? user.employeeId : undefined,
            department: user.department,
          };

          set({
            user: authUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: "Terjadi kesalahan" };
        }
      },

      register: async (data) => {
        set({ isLoading: true });

        try {
          // Check if email exists
          const existingUser = findUserByEmail(data.email);
          if (existingUser) {
            set({ isLoading: false });
            return { success: false, error: "Email sudah terdaftar" };
          }

          // Create user in local database
          const newUser = createUser({
            email: data.email,
            password: data.password,
            role: "APPLICANT",
            fullName: data.fullName,
            nik: data.nik,
            phone: data.phone,
          });

          // Build auth user object
          const authUser: AuthUser = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role as UserRole,
            fullName: newUser.fullName || newUser.email.split("@")[0],
            nik: newUser.nik,
            phone: newUser.phone,
            applicantId: newUser.id,
          };

          set({
            user: authUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || "Terjadi kesalahan" };
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) {
          return { success: false, error: "Tidak ada user yang login" };
        }

        try {
          const updated = updateUser(user.id, data);
          if (!updated) {
            return { success: false, error: "Gagal update profil" };
          }

          const authUser: AuthUser = {
            ...user,
            fullName: updated.fullName || user.fullName,
            nik: updated.nik || user.nik,
            phone: updated.phone || user.phone,
            education: updated.education || user.education,
          };

          set({ user: authUser });
          return { success: true };
        } catch (error) {
          return { success: false, error: "Terjadi kesalahan" };
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
