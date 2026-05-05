import { useState, useEffect } from 'react';
import { OnboardingListItem } from '../../types/onboarding';

export function useOnboardings() {
  const [onboardings, setOnboardings] = useState<OnboardingListItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetchOnboardings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const res   = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      setOnboardings(data.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardings();
  }, []);

  return { onboardings, loading, error, refetch: fetchOnboardings };
}