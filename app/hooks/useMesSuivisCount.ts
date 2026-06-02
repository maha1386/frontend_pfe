import { useEffect, useState } from "react";
import { getMesSuivis } from "@/app/services/suivis.service";

export function useMesSuivisCount() {
  const [hasTask, setHasTask] = useState(false);

  useEffect(() => {
    getMesSuivis()
      .then((tasks) => setHasTask(tasks.length > 0))
      .catch(() => setHasTask(false));
  }, []);

  return { hasTask };
}