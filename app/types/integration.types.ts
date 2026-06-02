// app/types/integration.types.ts

export type TaskStatus = "en_attente" | "en_cours" | "en_validation" | "termine" | "rejetee";
export interface TaskComment {
  id: number;
  content: string | null;
  link: string | null;
  has_attachment: boolean;
  attachment_name: string | null;
  attachment_mime: string | null;
  download_url: string | null;
  author: { id: number; name: string } | null;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  status: TaskStatus;
  due_date: string | null;
  day_name: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | null;
  week_number: number | null;
  rejection_reason: string | null;
  comments: TaskComment[];
  responsable_id?: number | null;
  responsable?: {
    id:         number;
    first_name: string;
    last_name:  string;
  } | null;
}

export interface Phase {
  phase: string;
  title: string;
  status: "completed" | "in-progress" | "not-started";
  progress: number;
  start_date: string | null;
  end_date: string | null;
  tasks: Task[];
}

export interface IntegrationPlanResponse {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  jours_left: number;
  progression: number;
  phases: Phase[];
  meetings: any[];
  action_requise: null | {
    description: string;
    link?: string;
    link_label?: string;
  };
}