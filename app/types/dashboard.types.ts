export interface UserDashboard {
  user: {
    first_name: string;
    last_name: string;
  };
  documents: {
    total: number;
    completed: number;
    progress: number;
    list: DocumentItem[];
  };
  formations: {
    total: number;
    completed: number;
    progress: number;
  };
  overall_progress: number;
  days_remaining: number;
  recent_activities: ActivityItem[];
  upcoming_events: EventItem[];
  
}

export interface DocumentItem {
  name: string;
  status: 'signed' | 'pending';
}

export interface ActivityItem {
  type: 'Document' | 'Formation';
  description: string;
  date: string; // format "d M Y"
  time: string; // format "H:i"
  status: string; // 'signed', 'pending', 'En cours', 'Complété', etc.
}

export interface EventItem {
  id: number | string
  title: string;
  date: string; // format "d M Y"
  time: string; // format "H:i"
  type: string; // Réunion, Formation, Présentation...
}