"use client";

import { useMesSuivis } from "@/app/hooks/useMesSuivis";
import { useState } from "react";
import {
  ClipboardList, Calendar, MessageSquare,
  ChevronDown, ChevronUp, User, Loader2
} from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:       { label: "En attente",    className: "bg-gray-100 text-gray-600" },
  in_progress:   { label: "En cours",      className: "bg-blue-100 text-blue-700" },
  en_validation: { label: "En validation", className: "bg-yellow-100 text-yellow-700" },
  completed:     { label: "Complété",      className: "bg-green-100 text-green-700" },
  rejected:      { label: "Rejeté",        className: "bg-red-100 text-red-700" },
};

const typeColor: Record<string, string> = {
  formation:  "bg-green-500",
  réunion:    "bg-purple-500",
  technique:  "bg-orange-500",
  document:   "bg-blue-500",
};

export default function MesSuivisPage() {
  const { tasks, loading, error } = useMesSuivis();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");

  const statuses = ["Tous", ...Object.keys(statusConfig)];

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
      || t.collaborateur.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tous" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-500">{error}</div>
  );

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="bg-white rounded-lg border p-6 flex items-center gap-4">
        <div className="p-3 bg-orange-50 rounded-lg">
          <ClipboardList className="text-orange-500" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes Suivis</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tâches dont vous êtes responsable de suivi
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-semibold text-orange-500">{tasks.length}</p>
          <p className="text-xs text-slate-500">tâche{tasks.length > 1 ? "s" : ""} assignée{tasks.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par titre ou collaborateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? "bg-orange-500 text-white border-orange-500"
                  : "text-slate-600 border-slate-200 hover:border-orange-300"
              }`}
            >
              {s === "Tous" ? "Tous" : statusConfig[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-slate-400">
          Aucune tâche trouvée
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const isOpen  = expandedId === task.id;
            const status  = statusConfig[task.status] ?? { label: task.status, className: "bg-gray-100 text-gray-600" };
            const dotColor = typeColor[task.type?.toLowerCase()] ?? "bg-blue-500";

            return (
              <div key={task.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">

                {/* Row */}
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : task.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User size={11} />
                        {task.collaborateur}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar size={11} />
                          {task.due_date}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{task.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MessageSquare size={13} />
                      {task.comments_count}
                    </span>
                    {isOpen
                      ? <ChevronUp size={16} className="text-slate-400" />
                      : <ChevronDown size={16} className="text-slate-400" />
                    }
                  </div>
                </div>

                {/* Commentaires expanded */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                      Commentaires ({task.comments_count})
                    </p>
                    {task.comments.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">Aucun commentaire</p>
                    ) : (
                      <div className="space-y-2">
                        {task.comments.map(c => (
                          <div key={c.id} className="bg-white rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-700">{c.user}</span>
                              <span className="text-xs text-slate-400">
                                {new Date(c.created_at).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}