// types/collaborateur.ts

export interface Role {
  id: number;
  name: string;
}

export interface Collaborateur {
  id: number;
  email: string;
  last_name: string;
  first_name: string;
  phone_number: string;
  date_of_hire: string;
  active: boolean;
  role_id: number;
  role: Role;
  password_changed: boolean;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

export type SortField = "last_name" | "first_name" | "email" | "date_of_hire";
export type SortDir = "asc" | "desc";
export type StatusFilter = "all" | "active" | "inactive";