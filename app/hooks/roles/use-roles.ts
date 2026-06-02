import { useState, useEffect, useCallback } from "react";
import { getRoles, deleteRole, Role } from "../../services/role.service";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ id: number; name: string } | null>(null);

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

  const handleDelete = (id: number, name: string) => {
    setConfirmModal({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    try {
      await deleteRole(confirmModal.id);
      await fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setConfirmModal(null);
    }
  };

  return {
    roles,
    loading,
    error,
    fetchRoles,
    handleDelete,
    confirmModal,
    setConfirmModal,
    handleConfirmDelete,
  };
}