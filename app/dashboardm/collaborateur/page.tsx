"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useCollaborateurs } from "../../hooks/collaborateur/use-collaborateurs";
import { CollaborateursToolbar } from "../../../components/collaborateurs/collaborateurs-toolbar";
import { CollaborateursTable } from "../../../components/collaborateurs/collaborateurs-table";
import { CollaborateursPagination } from "../../../components/collaborateurs/collaborateurs-pagination";
import { Collaborateur } from "../../types/collaborateur.types";
import { useRouter } from "next/navigation";

export default function CollaborateursManagerPage() {
  const {
    filtered, pagination, loading, error,
    search, setSearch, statusFilter, setStatusFilter, roleFilter, setRoleFilter,
    sortField, sortDir, handleSort, handlePageChange,
  } = useCollaborateurs();

  const router = useRouter();

  const handleDetails = (collaborateur: Collaborateur) => {
    router.push(`/dashboard/collaborateur/${collaborateur.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-600">Collaborateurs</h1>
        <p className="text-gray-500 mt-1">Consultez les informations de votre équipe</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Toolbar sans bouton "Nouveau" */}
      <CollaborateursToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onNouveau={undefined}   // ← cache le bouton créer
      />

      {/* Table sans actions modifier/toggle */}
      <CollaborateursTable
        collaborateurs={filtered}
        loading={loading}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onToggleActive={undefined}   // ← désactive toggle
        onModifier={undefined}       // ← désactive modifier
        onDetails={handleDetails}    // ← garde voir détails
      />

      {pagination && (
        <CollaborateursPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}