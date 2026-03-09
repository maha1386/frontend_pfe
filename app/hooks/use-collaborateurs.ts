// hooks/use-collaborateurs.ts

import { useState, useEffect, useCallback } from "react";
import {
  Collaborateur,
  Pagination,
  SortField,
  SortDir,
  StatusFilter,
} from "../types/collaborateur.types";
import {
  getCollaborateurs,
  toggleCollaborateurActive,
  CollaborateursFilters,
} from "../services/collaborateur.service";

export function useCollaborateurs() {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Filtres ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Tri ──────────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("last_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchCollaborateurs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: CollaborateursFilters = { page: currentPage };

      // Filtre rôle → envoyé au backend
      if (roleFilter !== "all") filters.role = roleFilter;

      // Filtre statut → envoyé au backend
      if (statusFilter === "active") filters.active = true;
      if (statusFilter === "inactive") filters.active = false;

      const res = await getCollaborateurs(filters);
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
  }, [currentPage, roleFilter, statusFilter]); // refetch si l'un change

  useEffect(() => {
    fetchCollaborateurs();
  }, [fetchCollaborateurs]);

  // ─── Filtre search + tri côté client ──────────────────────────────────────
  // (search reste côté client car rapide et ne nécessite pas de refetch)

  const filtered = collaborateurs
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.last_name.toLowerCase().includes(q) ||
        c.first_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const cmp = String(a[sortField] ?? "").localeCompare(
        String(b[sortField] ?? "")
      );
      return sortDir === "asc" ? cmp : -cmp;
    });

  // ─── Actions ──────────────────────────────────────────────────────────────

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
      setError(
        err instanceof Error ? err.message : "Erreur lors de la modification"
      );
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
    roleFilter,
    setRoleFilter,
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