// components/roles/roles-table.tsx
"use client";

import { Trash2, Shield, Loader2, Edit2, Lock } from "lucide-react";
import { Role } from "@/app/services/role.service";

const PROTECTED_ROLES = ["rh", "manager", "new_collaborateur"];

interface RolesTableProps {
  roles: Role[];
  loading: boolean;
  onModifier: (role: Role) => void;
  onDelete: (id: number, name: string) => void;
}
 function getRoleColor(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 90%)`;
}

function getRoleTextColor(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 35%)`;
}
function RoleBadge({ name }: { name: string }) {
  const isProtected = PROTECTED_ROLES.includes(name.toLowerCase());
  const bg = getRoleColor(name);
  const color = getRoleTextColor(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: bg, color: color, borderColor: color }}
    >
      {isProtected && <Lock className="w-3 h-3" />}
      {name}
    </span>
  );
}
export function RolesTable({ roles, loading, onModifier, onDelete }: RolesTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Shield className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">Aucun rôle trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
            <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Nom du rôle</th>
            <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
            <th className="text-right px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {roles.map((role) => {
            const isProtected = PROTECTED_ROLES.includes(role.name.toLowerCase());
            return (
              <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400 font-mono">{role.id}</td>
                <td className="px-6 py-4">
                  <RoleBadge name={role.name} />
                </td>
                <td className="px-6 py-4">
                  {isProtected ? (
                    <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                      <Lock className="w-3 h-3" />
                      Protégé
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Personnalisé</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onModifier(role)}
                      disabled={isProtected}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(role.id, role.name)}
                      disabled={isProtected}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}