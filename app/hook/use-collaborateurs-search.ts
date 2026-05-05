// hooks/use-collaborateurs-search.ts
import { useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export interface CollaborateurOption {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
}

export function useCollaborateursSearch() {
  const [results, setResults] = useState<CollaborateurOption[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/collaborateurs?last_name=${encodeURIComponent(query)}&per_page=8`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = data.collaborateurs?.data ?? data.data ?? [];
      setResults(
        list.map((u: any) => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          role: u.role?.name ?? u.role ?? "",
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => setResults([]);

  return { results, loading, search, reset };
}