"use client";

import { useEffect, useState } from "react";
import { Document, DocumentFilters } from "../types/document.types";
import { documentService } from "../service/document.service";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (filters?: DocumentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const data = await documentService.getAll(filters);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (formData: FormData) => {
    try {
      await documentService.create(formData);
      await fetchDocuments(); 
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    }
  };


  const updateDocument = async (
    id: number,
    data: { namedoc: string; signature_req: boolean; path?: File }
  ) => {
    try {
      await documentService.update(id, data);
      await fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la modification");
    }
  };
  const deleteDocument = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    try {
      await documentService.delete(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression du document");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}