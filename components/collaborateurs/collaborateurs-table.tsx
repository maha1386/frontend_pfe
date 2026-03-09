// components/collaborateurs/CollaborateursTable.tsx

import { ChevronUp, ChevronDown, Edit2, PowerOff, Eye, Loader2 } from "lucide-react";
import { Collaborateur, SortField, SortDir } from "../../app/types/collaborateur.types";

interface CollaborateursTableProps {
  collaborateurs: Collaborateur[];
  loading: boolean;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  onModifier: (collaborateur: Collaborateur) => void;
  onDetails: (collaborateur: Collaborateur) => void;
}

const TABLE_COLUMNS: { label: string; field: SortField | null }[] = [
  { label: "NOM", field: "last_name" },
  { label: "PRÉNOM", field: "first_name" },
  { label: "EMAIL", field: "email" },
  { label: "TÉLÉPHONE", field: null },
  { label: "DATE RECRUTEMENT", field: "date_of_hire" },
  { label: "STATUT", field: null },
  { label: "ACTIONS", field: null },
];

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (sortField !== field)
    return (
      <span className="inline-flex flex-col ml-1 opacity-30">
        <ChevronUp className="w-3 h-3 -mb-1" />
        <ChevronDown className="w-3 h-3" />
      </span>
    );
  return sortDir === "asc" ? (
    <ChevronUp className="inline w-4 h-4 ml-1 text-blue-600" />
  ) : (
    <ChevronDown className="inline w-4 h-4 ml-1 text-blue-600" />
  );
}

export function CollaborateursTable({
  collaborateurs,
  loading,
  sortField,
  sortDir,
  onSort,
  onToggleActive,
  onModifier,
  onDetails,
}: CollaborateursTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {TABLE_COLUMNS.map(({ label, field }) => (
                <th
                  key={label}
                  onClick={() => field && onSort(field)}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                    field ? "cursor-pointer hover:text-gray-800 select-none" : ""
                  }`}
                >
                  {label}
                  {field && (
                    <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {collaborateurs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                  Aucun collaborateur trouvé
                </td>
              </tr>
            ) : (
              collaborateurs.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6 text-base font-semibold text-gray-800">
                    {c.last_name}
                  </td>
                  <td className="px-6 py-6 text-base text-gray-700">{c.first_name}</td>
                  <td className="px-6 py-6 text-base text-gray-600">{c.email}</td>
                  <td className="px-6 py-6 text-base text-gray-600">{c.phone_number}</td>
                  <td className="px-6 py-6 text-base text-gray-700">
                    {formatDate(c.date_of_hire)}
                  </td>
                  <td className="px-6 py-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {c.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onModifier(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                      <button
                        onClick={() => onToggleActive(c.id, c.active)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          c.active
                            ? "text-red-500 border border-red-200 hover:bg-red-50"
                            : "text-green-600 border border-green-200 hover:bg-green-50"
                        }`}
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                        {c.active ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        onClick={() => onDetails(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Détails
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}