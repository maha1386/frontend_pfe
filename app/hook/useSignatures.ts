// hooks/useSignatures.ts
import { useState, useEffect } from "react";
import { signatureService } from "../../app/service/signature.service";
import { DocumentSignature } from "../types/signature.types";

export function useSignatures() {
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignatures = async () => {
    setLoading(true);
    try {
      const data = await signatureService.getAll();
      setSignatures(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des signatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  return { signatures, loading, error, refresh: fetchSignatures };
}