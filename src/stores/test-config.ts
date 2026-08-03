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
  addConfig: (config: TestConfig) => Promise<void>;
  updateConfig: (id: string, data: Partial<TestConfig>) => void;
  deleteConfig: (id: string) => void;
  getConfig: (id: string) => TestConfig | undefined;
  getConfigByDivision: (division: string) => TestConfig | undefined;
}

// Save config to Prisma database
const saveConfigToDb = async (config: TestConfig) => {
  try {
    // First get jobs to find matching jobId
    const jobsRes = await fetch("/api/jobs");
    const jobsData = await jobsRes.json();
    const jobs = jobsData.jobs || [];
    const matchingJob = jobs.find((j: any) => j.division === config.division);

    if (!matchingJob) {
      console.log("No matching job found for division:", config.division);
      return;
    }

    const jobId = matchingJob.id;
    const categoryCount = config.categories.length;
    const weightPerCategory = Math.round(100 / categoryCount);
    const weights: Record<string, number> = {};
    const passingGrades: Record<string, number> = {};

    config.categories.forEach(cat => {
      weights[cat] = weightPerCategory;
      passingGrades[cat] = config.passingGrade;
    });

    const response = await fetch("/api/admin/test-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        categories: config.categories.join(","),
        categoryWeights: JSON.stringify(weights),
        passingGrades: JSON.stringify(passingGrades),
        overallPassingGrade: config.passingGrade,
        totalDurationMinutes: config.duration,
        questionsPerCategory: config.questionsPerCategory,
        shuffleQuestions: true,
        shuffleAnswers: true,
        allowTabSwitch: false,
        maxTabSwitches: 3,
        isActive: true,
      }),
    });

    const result = await response.json();
    console.log("Test config synced to DB:", result.success ? "OK" : result.error);
  } catch (err) {
    console.error("Error saving test config to DB:", err);
  }
};

export const useTestConfigStore = create<TestConfigState>()(
  persist(
    (set, get) => ({
      configs: initialConfigs,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      addConfig: async (config) => {
        set((state) => ({
          configs: [...state.configs, config],
        }));
        // Sync to database
        await saveConfigToDb(config);
      },
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
      getConfigByDivision: (division) => get().configs.find((config) => config.division === division),
    }),
    {
      name: "kai-test-configs",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
