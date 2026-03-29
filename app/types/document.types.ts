export interface DocumentAssignment {
  user_id: number;
  user_fullname: string;
  assigned_by: string;
  status: string;
}

export interface Document {
  id: number;
  namedoc: string;
  path: string;
  signature_req: boolean;
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