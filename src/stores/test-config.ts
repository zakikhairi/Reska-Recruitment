import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TestConfig {
  id: string;
  jobTitle: string;
  division: string;
  categories: string[];
  passingGrade: number;
  duration: number;
  questionsPerCategory: number;
  totalQuestions: number;
  active: boolean;
}

// Initial mock data
const initialConfigs: TestConfig[] = [
  { id: "1", jobTitle: "Pramugara / Pramugari Kereta Api", division: "ON_TRAIN_SERVICE", categories: ["AKHLAK", "HOSPITALITY", "TECHNICAL", "APTITUDE"], passingGrade: 65, duration: 90, questionsPerCategory: 10, totalQuestions: 40, active: true },
  { id: "2", jobTitle: "Steward Kereta Api", division: "ON_TRAIN_SERVICE", categories: ["AKHLAK", "HOSPITALITY", "APTITUDE"], passingGrade: 60, duration: 75, questionsPerCategory: 10, totalQuestions: 30, active: true },
  { id: "3", jobTitle: "Staff IT Support", division: "IT_STAFF", categories: ["AKHLAK", "TECHNICAL", "APTITUDE"], passingGrade: 70, duration: 90, questionsPerCategory: 12, totalQuestions: 36, active: true },
  { id: "4", jobTitle: "Teknisi Maintenance Kereta", division: "LOGISTICS", categories: ["AKHLAK", "TECHNICAL"], passingGrade: 65, duration: 60, questionsPerCategory: 15, totalQuestions: 30, active: false },
  { id: "5", jobTitle: "Cleaning Service - ResClean", division: "RES_CLEAN", categories: ["AKHLAK", "HOSPITALITY"], passingGrade: 55, duration: 45, questionsPerCategory: 10, totalQuestions: 20, active: true },
];

interface TestConfigState {
  configs: TestConfig[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addConfig: (config: TestConfig) => void;
  updateConfig: (id: string, data: Partial<TestConfig>) => void;
  deleteConfig: (id: string) => void;
  getConfig: (id: string) => TestConfig | undefined;
}

export const useTestConfigStore = create<TestConfigState>()(
  persist(
    (set, get) => ({
      configs: initialConfigs,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      addConfig: (config) =>
        set((state) => ({
          configs: [...state.configs, config],
        })),
      updateConfig: (id, data) =>
        set((state) => ({
          configs: state.configs.map((config) =>
            config.id === id ? { ...config, ...data } : config
          ),
        })),
      deleteConfig: (id) =>
        set((state) => ({
          configs: state.configs.filter((config) => config.id !== id),
        })),
      getConfig: (id) => get().configs.find((config) => config.id === id),
    }),
    {
      name: "kai-test-configs",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
