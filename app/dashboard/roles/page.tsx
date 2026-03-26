// app/dashboard/roles/page.tsx
"use client";

import { useState } from "react";
import { AlertCircle, Plus, Shield } from "lucide-react";
import { useRoles } from "../../hooks/roles/use-roles";
import { RolesTable } from "../../../components/roles/roles-table";
import { RoleModal } from "../../../components/roles/role-modal";
import { Role } from "../../services/role.service";

export default function RolesPage() {
  const { roles, loading, error, fetchRoles, handleDelete } = useRoles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const handleModifier = (role: Role) => {
    setRoleToEdit(role);
    setIsModalOpen(true);
  };

  const handleNouveau = () => {
    setRoleToEdit(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setRoleToEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Rôles</h1>
          <p className="text-gray-500 mt-1">Gérez les rôles et permissions de votre équipe</p>
        </div>
        <button
          onClick={handleNouveau}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau rôle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{roles.length}</p>
            <p className="text-xs text-gray-400 font-medium">Total rôles</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="text-xs text-gray-400 font-medium">Rôles protégés</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{Math.max(0, roles.length - 3)}</p>
            <p className="text-xs text-gray-400 font-medium">Rôles personnalisés</p>
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <RolesTable
        roles={roles}
        loading={loading}
        onModifier={handleModifier}
        onDelete={handleDelete}
      />

      {/* Modal créer/modifier */}
      <RoleModal
        isOpen={isModalOpen}
        roleToEdit={roleToEdit}
        onClose={handleClose}
        onSuccess={() => { handleClose(); fetchRoles(); }}
      />
    </div>
  );
}