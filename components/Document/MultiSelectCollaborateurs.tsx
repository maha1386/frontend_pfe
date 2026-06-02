// components/Document/MultiSelectCollaborateurs.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, Loader2, User } from "lucide-react";
import { useCollaborateursSearch, CollaborateurOption } from "../../app/hooks/use-collaborateurs-search";

interface MultiSelectCollaborateursProps {
  selected: CollaborateurOption[];
  onChange: (selected: CollaborateurOption[]) => void;
  error?: string;
}

function getRoleColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `hsl(${hash % 360}, 65%, 40%)`;
}

function getRoleBg(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `hsl(${hash % 360}, 70%, 93%)`;
}

export function MultiSelectCollaborateurs({
  selected,
  onChange,
  error,
}: MultiSelectCollaborateursProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results, loading, search, reset } = useCollaborateursSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
        setOpen(true);
      } else {
        reset();
        setOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fermer si clic dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (collab: CollaborateurOption) => {
    if (!selected.find((s) => s.id === collab.id)) {
      onChange([...selected, collab]);
    }
    setQuery("");
    reset();
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (id: number) => {
    onChange(selected.filter((s) => s.id !== id));
  };

  // Filtrer les déjà sélectionnés des résultats
  const filtered = results.filter((r) => !selected.find((s) => s.id === r.id));

  return (
    <div ref={containerRef} className="relative">
      {/* Tags sélectionnés */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: getRoleBg(s.role),
                color: getRoleColor(s.role),
              }}
            >
              <User className="w-3 h-3" />
              {s.first_name} {s.last_name}
              <button
                type="button"
                onClick={() => handleRemove(s.id)}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input recherche */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg bg-white ${
          error ? "border-red-400" : "border-gray-200 focus-within:border-orange-400"
        }`}
      >
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un collaborateur..."
          className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
        />
        {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
      </div>

      {/* Dropdown résultats */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              {loading ? "Recherche..." : "Aucun résultat"}
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
              {filtered.map((collab) => (
                <li key={collab.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(collab)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: getRoleBg(collab.role),
                        color: getRoleColor(collab.role),
                      }}
                    >
                      {collab.first_name.charAt(0)}{collab.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {collab.first_name} {collab.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{collab.role}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}