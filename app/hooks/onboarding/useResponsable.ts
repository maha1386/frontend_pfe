// hooks/onboarding/useResponsables.ts
import { useState, useEffect } from 'react';

export interface Responsable {
  id:         number;
  first_name: string;
  last_name:  string;
  role:       string;
}

export function useResponsables() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/onboarding/responsables`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json',
            },
          }
        );
        const data = await res.json();
        setResponsables(data.responsables ?? []);
      } catch {
        setResponsables([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  return { responsables, loading };
}