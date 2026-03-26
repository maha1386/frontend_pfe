// hooks/use-roles.ts

import { useState, useEffect, useCallback } from "react";
import { getRoles, deleteRole, Role } from "../../services/role.service";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError(null);
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le rôle "${name}" ?`)) return;
    try {
      await deleteRole(id);
      await fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  return {
    roles,
    loading,
    error,
    fetchRoles,
    handleDelete,
  };
}