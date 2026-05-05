// src/types/formation.ts

export type FormationCategory = "Obligatoire" | "Recommandée" | "Optionnelle";
export type FormationLevel = "Débutant" | "Intermédiaire" | "Avancé";
export type FormationStatus = "not-started" | "in-progress" | "completed";

export interface Formation {
  id: number;
  title: string;
  category: FormationCategory;
  duration: string;
  progress: number;
  modules: number;
  completedModules: number;
  instructor: string;
  level: FormationLevel;
  status: FormationStatus;
}

// réponse API
export type FormationsResponse = Formation[];