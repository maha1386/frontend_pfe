import { Edit2, PowerOff, Eye, Loader2 } from "lucide-react";
import { RH } from "../../app/types/rh.types";

interface RhsTableProps {
  rhs: RH[];
  loading: boolean;
  onToggleActive: (id: number, isActive: boolean) => void;
  onModifier: (rh: RH) => void;
  onDetails: (rh: RH) => void;
  sortField?: keyof RH;          
  sortDir?: "asc" | "desc";      
  onSort?: (field: keyof RH) => void; 
}

export function RhsTable({ rhs, loading, onToggleActive, onModifier, onDetails }: RhsTableProps) {
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date d'embauche</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rhs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-500 text-sm">
                  Aucun RH trouvé
                </td>
              </tr>
            ) : (
              rhs.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6 font-semibold text-gray-800">{r.last_name}</td>
                  <td className="px-6 py-6 text-gray-800">{r.first_name}</td>
                  <td className="px-6 py-6 text-gray-800">{r.email}</td>
                  <td className="px-6 py-6 text-gray-800">{r.phone_number}</td>
                  <td className="px-6 py-6 text-gray-800">{new Date(r.date_of_hire).toLocaleDateString("fr-FR")}</td>
                  <td className="px-6 py-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        r.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          r.active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {r.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => onModifier(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Modifier
                    </button>
                    <button
                      onClick={() => onToggleActive(r.id, r.active)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg ${
                        r.active
                          ? "text-red-500 border border-red-200 hover:bg-red-50"
                          : "text-green-600 border border-green-200 hover:bg-green-50"
                      }`}
                    >
                      <PowerOff className="w-3.5 h-3.5" /> {r.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => onDetails(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Détails
                    </button>
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