import { create } from "zustand";
import type {
  PortfolioData,
  AppStep,
  ProcessingStatus,
} from "@/types/portfolio";
import { defaultPortfolioData } from "@/types/portfolio";

interface PortfolioStore {
  // State
  currentStep: AppStep;
  portfolioData: PortfolioData;
  rawText: string;
  processingStatus: ProcessingStatus;
  isEditing: boolean;

  // Actions
  setCurrentStep: (step: AppStep) => void;
  setPortfolioData: (data: PortfolioData) => void;
  updateField: <K extends keyof PortfolioData>(
    key: K,
    value: PortfolioData[K]
  ) => void;
  updateProject: (index: number, field: keyof import("@/types/portfolio").Project, value: string | string[]) => void;
  addProject: () => void;
  removeProject: (index: number) => void;
  updateContact: (field: keyof import("@/types/portfolio").ContactInfo, value: string) => void;
  setRawText: (text: string) => void;
  setProcessingStatus: (status: ProcessingStatus) => void;
  setIsEditing: (editing: boolean) => void;
  resetAll: () => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  // Initial state
  currentStep: "upload",
  portfolioData: { ...defaultPortfolioData },
  rawText: "",
  processingStatus: {
    stage: "parsing",
    message: "",
    progress: 0,
  },
  isEditing: false,

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),

  setPortfolioData: (data) => set({ portfolioData: data }),

  updateField: (key, value) =>
    set((state) => ({
      portfolioData: { ...state.portfolioData, [key]: value },
    })),

  updateProject: (index, field, value) =>
    set((state) => {
      const newProjects = [...state.portfolioData.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return {
        portfolioData: { ...state.portfolioData, projects: newProjects },
      };
    }),

  addProject: () =>
    set((state) => ({
      portfolioData: {
        ...state.portfolioData,
        projects: [
          ...state.portfolioData.projects,
          { title: "", description: "", tech: [], impact: "" },
        ],
      },
    })),

  removeProject: (index) =>
    set((state) => ({
      portfolioData: {
        ...state.portfolioData,
        projects: state.portfolioData.projects.filter((_, i) => i !== index),
      },
    })),

  updateContact: (field, value) =>
    set((state) => ({
      portfolioData: {
        ...state.portfolioData,
        contact: { ...state.portfolioData.contact, [field]: value },
      },
    })),

  setRawText: (text) => set({ rawText: text }),

  setProcessingStatus: (status) => set({ processingStatus: status }),

  setIsEditing: (editing) => set({ isEditing: editing }),

  resetAll: () =>
    set({
      currentStep: "upload",
      portfolioData: { ...defaultPortfolioData },
      rawText: "",
      processingStatus: {
        stage: "parsing",
        message: "",
        progress: 0,
      },
      isEditing: false,
    }),
}));
