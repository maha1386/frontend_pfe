"use client";

import { useState, useEffect, useCallback } from "react";
import { Document, DocumentFilters } from "../types/document.types";
import { documentService } from "../service/document.service";

export function useMesDocuments(initialFilters?: DocumentFilters) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>(initialFilters || {});

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const docs = await documentService.getMesDocuments(filters);
      setDocuments(docs);
    } catch (err: any) {
      console.error("Erreur fetch documents:", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchDocuments, 
  };
}