import { useState, useEffect } from 'react';

export function useColabStatus() {
  const [online, setOnline]   = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/onboarding/colab/status`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await res.json();
        setOnline(data.online);
      } catch {
        setOnline(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return { online, loading };
}