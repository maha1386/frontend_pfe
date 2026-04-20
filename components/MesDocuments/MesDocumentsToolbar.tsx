"use client";

import { useState } from "react";
import { Filter, Search, SortDesc, SortAsc, ChevronDown, ChevronUp } from "lucide-react";

interface MesDocumentsToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onFilterStatus: (status: string | null) => void; // "À lire", "En cours", "Signé" ou null
  onSortBySignedAt: (direction: "asc" | "desc") => void;
}

export function MesDocumentsToolbar({
  searchTerm,
  setSearchTerm,
  onFilterStatus,
  onSortBySignedAt,
}: MesDocumentsToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleSortDirection = () => {
    const newDir = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDir);
    onSortBySignedAt(newDir);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="flex flex-col md:flex-row gap-3 items-center">

        {/* 🔍 Search */}
        <div className="flex-1 relative md:flex-[0.6]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 🔘 Buttons */}
        <div className="flex gap-2 md:flex-[0.4] justify-end">

          {/* Filtrer par status */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <Filter size={16} />
              Filtrer
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-300 rounded-lg shadow-lg z-50">
                {["À lire", "En cours", "Signé", "Tous"].map((status) => (
                  <button
                    key={status}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm"
                    onClick={() => {
                      onFilterStatus(status === "Tous" ? null : status);
                      setFilterOpen(false);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trier par signed_at */}
          <button
            onClick={toggleSortDirection}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            {sortDirection === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
            Trier
          </button>

        </div>
      </div>
    </div>
  );
}