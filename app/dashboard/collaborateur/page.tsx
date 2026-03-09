"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useCollaborateurs } from "../../hooks/use-collaborateurs";
import { CollaborateursToolbar } from "../../../components/collaborateurs/collaborateurs-toolbar";
import { CollaborateursTable } from "../../../components/collaborateurs/collaborateurs-table";
import { CollaborateursPagination } from "../../../components/collaborateurs/collaborateurs-pagination";
import { CollaborateurCreateModal } from "../../../components/collaborateurs/collaborateur-create-modal";
import { CollaborateurModifierModal } from "../../../components/collaborateurs/collaborateur-modifier-modal";
import { Collaborateur } from "../../types/collaborateur.types";
import { CollaborateurDetail } from "@/app/services/collaborateur.service";
import { useRouter } from "next/navigation";

export default function CollaborateursPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collaborateurToModify, setCollaborateurToModify] = useState<CollaborateurDetail | null>(null);

  const {
    filtered, pagination, loading, error,
    search, setSearch, statusFilter, setStatusFilter, roleFilter, setRoleFilter,
    sortField, sortDir, handleSort, handleToggleActive, handlePageChange,
    fetchCollaborateurs,
  } = useCollaborateurs();

  const router = useRouter();

  const handleModifier = (collaborateur: Collaborateur) => {
  setCollaborateurToModify({
    id: collaborateur.id,
    last_name: collaborateur.last_name,
    first_name: collaborateur.first_name,
    email: collaborateur.email,
    phone_number: collaborateur.phone_number,
    date_of_hire: collaborateur.date_of_hire,
    active: collaborateur.active,
    role: collaborateur.role.name,
  });
};

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
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
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
        onSuccess={() => { fetchCollaborateurs(); }}
      />

      <CollaborateurModifierModal
        isOpen={!!collaborateurToModify}
        collaborateur={collaborateurToModify}
        onClose={() => setCollaborateurToModify(null)}
        onSuccess={() => { setCollaborateurToModify(null); fetchCollaborateurs(); }}
      />
    </div>
  );
}