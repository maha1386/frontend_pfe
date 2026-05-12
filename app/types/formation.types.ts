export type FormationCategory  = "Obligatoire" | "Recommandée" | "Optionnelle";
export type FormationLevel     = "Débutant" | "Intermédiaire" | "Avancé";
export type FormationStatus    = "not-started" | "in-progress" | "completed";
export type FormationApiStatus = "en_attente" | "en_cours" | "en_validation" | "rejetee" | "termine";

export interface Formation {
  id:                number;
  title:             string;
  category:          FormationCategory;
  duration:          string;
  progress:          number;
  modules:           number;
  completedModules:  number;
  modules_completed: number;
  instructor:        string;
  level:             FormationLevel;
  status:            FormationStatus;
}

export interface FormationApi {
  id:        number;
  title:     string;
  status:    FormationApiStatus;
  deadline:  string | null;
  month:     number;
  week:      number;
  day:       string | null;
  objective: string | null;
}

export interface FormationStats {
  total:             number;
  completed:         number;
  in_progress:       number;
  modules_completed: number;
  completion_rate:   number;
}

export interface FormationCurrent {
  id:       number;
  title:    string;
  progress: number;
  module:   number;
  total:    number;
  deadline: string | null;
}

export interface FormationCertification {
  id:          number;
  title:       string;
  obtained_at: string | null;
  completed:   boolean;
}

export interface FormationsFullResponse {
  formations:     FormationApi[];
  stats:          FormationStats;
  current:        FormationCurrent | null;
  certifications: FormationCertification[];
}

export type FormationsResponse    = Formation[];
export type FormationsApiResponse = FormationApi[];