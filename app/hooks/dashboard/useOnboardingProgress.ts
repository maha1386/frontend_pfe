import { useState, useCallback } from "react";

export interface OnboardingCollabItem {
  id: number;
  name: string;
  role?: string | null;
  date: string;
  onboarding_progress: number;
}

interface PaginatedResponse {
  data: OnboardingCollabItem[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export function useOnboardingProgress() {
  const [items, setItems]             = useState<OnboardingCollabItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]       = useState(1);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/dashboard/onboarding-progress?page=${page}&per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Erreur serveur");

      const json: PaginatedResponse = await res.json();
      setItems(json.data);
      setCurrentPage(json.current_page);
      setLastPage(json.last_page);
      setTotal(json.total);
    } catch (e: any) {
      setError(e.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, currentPage, lastPage, total, loading, error, fetchPage };
}