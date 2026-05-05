"use client";

import { useEffect, useState } from "react";
import { Formation } from "../types/formation.types";
import { getMyFormations } from "../service/formation.service";

export function useFormations() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = await getMyFormations();
        setFormations(data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  return { formations, loading, error };
}