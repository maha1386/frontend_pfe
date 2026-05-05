import { useState, useEffect, useCallback } from 'react';
import { Onboarding, UpdateTaskPayload, AddTaskPayload } from '../../types/onboarding';

export function useOnboarding(id: number) {
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [progression, setProgression] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  // ── Fetch détail ─────────────────────────────────────
  const fetchOnboarding = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res  = await fetch(`${apiUrl}/onboarding/${id}`, {
        headers: getHeaders(),
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      setOnboarding(data.onboarding);
      setProgression(data.progression ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  // ── Valider l'onboarding ──────────────────────────────
  const valider = async (notes?: string) => {
    const res = await fetch(`${apiUrl}/onboarding/${id}/valider`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ notes }),
    });

    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    await fetchOnboarding();
  };

  // ── Modifier une tâche ────────────────────────────────
  const updateTask = async (taskId: number, payload: UpdateTaskPayload) => {
    const res = await fetch(`${apiUrl}/onboarding/tasks/${taskId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    await fetchOnboarding();
  };

  // ── Ajouter une tâche ─────────────────────────────────
  const addTask = async (payload: AddTaskPayload) => {
    const res = await fetch(`${apiUrl}/onboarding/${id}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    await fetchOnboarding();
  };

  // ── Supprimer une tâche ───────────────────────────────
  const deleteTask = async (taskId: number) => {
    const res = await fetch(`${apiUrl}/onboarding/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    await fetchOnboarding();
  };

  return {
    onboarding,
    progression,
    loading,
    error,
    refetch: fetchOnboarding,
    valider,
    updateTask,
    addTask,
    deleteTask,
  };
}