// types/signature.types.ts

export type SignatureStatus = "pending" | "signed";

export interface DocumentSignature {
  id: number;
  document_id: number;
  user_id: number;
  signature_path: string;
  signed_at: string;
  status: SignatureStatus;
  document?: {
    id: number;
    namedoc: string;
  };
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
  };
}

export interface DocumentAssignment {
  id: number;
  document_id: number;
  user_id: number;
  assigned_by: number;
  status: SignatureStatus;
  document: {
    id: number;
    namedoc: string;
    path: string;
    signature_req: boolean;
  };
  collaborateur?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  assignedBy?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  signature?: DocumentSignature;
}

export interface SignDocumentPayload {
  document_id: number;
  signature: File;
}

export interface AssignDocumentPayload {
  user_id: number;
}

export interface SignatureBlockProps {
  name: string;
  title: string;       
  company: string;     
  email?: string;
  phone?: string;      
  signedAt?: string;
  signatureUrl: string;
}