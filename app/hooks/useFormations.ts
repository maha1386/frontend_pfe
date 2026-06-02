import { useState, useEffect } from 'react';
import {
  Formation, FormationApi, FormationApiStatus,
  FormationStats, FormationCurrent, FormationCertification,
  FormationsFullResponse,
} from '../types/formation.types';

function mapStatus(status: FormationApiStatus): Formation['status'] {
  switch (status) {
    case 'termine':       return 'completed';
    case 'en_cours':      return 'in-progress';
    case 'en_validation': return 'in-progress';
    default:              return 'not-started';
  }
}

function mapProgress(status: FormationApiStatus): number {
  switch (status) {
    case 'termine':       return 100;
    case 'en_cours':      return 50;
    case 'en_validation': return 80;
    default:              return 0;
  }
}

function mapToFormation(f: FormationApi): Formation {
  return {
    id:                f.id,
    title:             f.title,
    instructor:        'Non assigné',
    duration:          '—',
    modules:           0,
    completedModules:  0,
    modules_completed: 0,
    level:             'Débutant',
    category:          'Obligatoire',
    status:            mapStatus(f.status),
    progress:          mapProgress(f.status),
  };
}

const emptyStats: FormationStats = {
  total:             0,
  completed:         0,
  in_progress:       0,
  modules_completed: 0,
  completion_rate:   0,
};

export function useFormations() {
  const [formations, setFormations]         = useState<Formation[]>([]);
  const [stats, setStats]                   = useState<FormationStats>(emptyStats);
  const [current, setCurrent]               = useState<FormationCurrent | null>(null);
  const [certifications, setCertifications] = useState<FormationCertification[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/my/formations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const json = await res.json();
      const data: FormationsFullResponse = json.data;

      setFormations((data.formations ?? []).map(mapToFormation));
      setStats(data.stats ?? emptyStats);
      setCurrent(data.current ?? null);
      setCertifications(data.certifications ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  return { formations, stats, current, certifications, loading, error, refetch: fetchFormations };
}