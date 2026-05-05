export type TaskStatus = 'en_attente' | 'en_cours' | 'termine';
export type TaskType   = 'technique' | 'administratif' | 'humain';
export type OnboardingStatus = 'genere' | 'valide';

export interface Task {
  id:              number;
  onboarding_id:   number;
  month_number:    number;
  week_number:     number;
  day_name:        string | null;
  task_title:      string;
  objective:       string | null;
  type:            TaskType;
  status:          TaskStatus;
  deadline:        string;
  completion_date: string | null;
}

export interface OnboardingUser {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
}

export interface Onboarding {
  id:               number;
  user_id:          number;
  generated_by:     string;
  status:           OnboardingStatus;
  validated_by:     number | null;
  validated_at:     string | null;
  validation_notes: string | null;
  created_at:       string;
  tasks:            Task[];
  user:             OnboardingUser;
  validatedBy?: {
    first_name: string;
    last_name:  string;
  };
}

export interface OnboardingListItem {
  id:               number;
  collaborateur:    string;
  status:           OnboardingStatus;
  progression:      number;
  validated_by:     string | null;
  validated_at:     string | null;
  validation_notes: string | null;
  created_at:       string;
}

export interface GenererPlanPayload {
  poste:        string;
  description:  string;
  months_count: number;
}

export interface UpdateTaskPayload {
  task_title?: string;
  objective?:  string;
  deadline?:   string;
  type?:       TaskType;
  status?:     TaskStatus;
}

export interface AddTaskPayload {
  task_title:   string;
  objective?:   string;
  deadline:     string;
  type:         TaskType;
  month_number: number;
  week_number:  number;
  day_name?:    string;
}