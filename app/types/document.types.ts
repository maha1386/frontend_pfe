export interface DocumentAssignment {
  user_id: number;
  user_fullname: string;
  assigned_by: string;
  status: string;
  signed_at: string | null;
  signature_path: string | null;
}

export interface Document {
  id: number;
  namedoc: string;
  path: string;
  signature_req: boolean;
  assigned_to_name?: string;
  
  assignments?: DocumentAssignment[];
}

export interface DocumentFilters {
  namedoc?: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}