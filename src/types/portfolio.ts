export interface Project {
  title: string;
  description: string;
  tech: string[];
  impact: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  hero: string;
  about: string;
  skills: string[];
  projects: Project[];
  contact: ContactInfo;
}

export const defaultPortfolioData: PortfolioData = {
  name: "",
  title: "",
  hero: "",
  about: "",
  skills: [],
  projects: [],
  contact: {
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    website: "",
  },
};

export type AppStep = "upload" | "processing" | "edit" | "deploy";

export interface ProcessingStatus {
  stage: "parsing" | "extracting" | "optimizing" | "done" | "error";
  message: string;
  progress: number;
}
