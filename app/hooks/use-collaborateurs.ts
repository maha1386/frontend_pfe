// hooks/useCollaborateurs.ts

import { useState, useEffect, useCallback } from "react";
import { Collaborateur, Pagination, SortField, SortDir, StatusFilter } from "../types/collaborateur.types";
import { getCollaborateurs, toggleCollaborateurActive } from "../services/collaborateur.service";

export function useCollaborateurs() {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres et tri
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("last_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCollaborateurs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCollaborateurs(currentPage);
      setCollaborateurs(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
        from: res.from,
        to: res.to,
      });
        localStorage.setItem("collaborateurs_total", String(res.total));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchCollaborateurs();
  }, [fetchCollaborateurs]);

  // ─── Filtre + tri côté client ────────────────────────────────────────────────

  const filtered = collaborateurs
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.last_name.toLowerCase().includes(q) ||
        c.first_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? c.active
          : !c.active;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const cmp = String(a[sortField] ?? "").localeCompare(String(b[sortField] ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    const label = isActive ? "désactiver" : "activer";
    if (!confirm(`Voulez-vous vraiment ${label} ce collaborateur ?`)) return;

    try {
      await toggleCollaborateurActive(id);
      await fetchCollaborateurs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la modification");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    // Data
    filtered,
    pagination,
    loading,
    error,
    // Filtres
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    // Tri
    sortField,
    sortDir,
    handleSort,
    // Actions
    handleToggleActive,
    handlePageChange,
    currentPage,
    fetchCollaborateurs,
  };
}