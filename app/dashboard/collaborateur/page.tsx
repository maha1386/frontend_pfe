"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useCollaborateurs } from "../../hooks/use-collaborateurs";
import { CollaborateursToolbar } from "../../../components/collaborateurs/collaborateurs-toolbar";
import { CollaborateursTable } from "../../../components/collaborateurs/collaborateurs-table";
import { CollaborateursPagination } from "../../../components/collaborateurs/collaborateurs-pagination";
import { CollaborateurCreateModal } from "../../../components/collaborateurs/collaborateur-create-modal";
import { Collaborateur } from "../../types/collaborateur.types";
import { useRouter } from "next/navigation";


export default function CollaborateursPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    filtered, pagination, loading, error,
    search, setSearch, statusFilter, setStatusFilter,
    sortField, sortDir, handleSort, handleToggleActive, handlePageChange,
    fetchCollaborateurs, 
  } = useCollaborateurs();

  const handleModifier = (collaborateur: Collaborateur) => {
    console.log("Modifier", collaborateur);
  };

  const router = useRouter();

  const handleDetails = (collaborateur: Collaborateur) => {
    router.push(`/dashboard/collaborateur/${collaborateur.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-600">Collaborateurs</h1>
        <p className="text-gray-500 mt-1">Gérez votre équipe et leurs informations</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <CollaborateursToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onNouveau={() => setIsModalOpen(true)} 
      />

      <CollaborateursTable
        collaborateurs={filtered}
        loading={loading}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onToggleActive={handleToggleActive}
        onModifier={handleModifier}
        onDetails={handleDetails}
      />

      {pagination && (
        <CollaborateursPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
      <CollaborateurCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCollaborateurs();
        }}
      />
    </div>
  );
}