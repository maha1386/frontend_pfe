import { useEffect, useState } from "react";
import { getMesSuivis, SuiviTask } from "@/app/services/suivis.service";

export function useMesSuivis() {
  const [tasks, setTasks]     = useState<SuiviTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getMesSuivis()
      .then(setTasks)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { tasks, loading, error };
}