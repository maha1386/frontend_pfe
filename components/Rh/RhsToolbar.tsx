// components/rh/RhsToolbar.tsx
import { Search, UserPlus } from "lucide-react";

interface RhsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  onNouveau: () => void;
}

export function RhsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onNouveau,
}: RhsToolbarProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="relative flex-1 min-w-[260px] max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou email"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as "all" | "active" | "inactive")}
        className="px-4 py-2.5 border border-gray-200 text-gray-800 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="all">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
      </select>

      <button
        onClick={onNouveau}
        className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Nouveau
      </button>
    </div>
  );
}