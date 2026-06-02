"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboardings } from "../../hooks/onboarding/useOnboardings";
import { OnboardingListItem } from "../../types/onboarding";

export default function ManagerOnboardingPage() {
  const { onboardings, loading, error } = useOnboardings();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = onboardings.filter((o) =>
    o.collaborateur.toLowerCase().includes(search.toLowerCase())
  );

  const handleDetails = (o: OnboardingListItem) => {
    router.push(`/dashboardm/onboarding/${o.id}`);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-blue-600">Onboarding</h1>
        <p className="text-gray-500 mt-1">
          Consultez les plans d'intégration de vos collaborateurs
        </p>
      </div>

      {/* ── Erreur ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Recherche ── */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher un collaborateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-400">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">Aucun onboarding trouvé</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Collaborateur</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progression</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Validé par</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleDetails(o)}
                >
                  {/* Collaborateur */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        {o.collaborateur.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{o.collaborateur}</span>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      o.status === "valide" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {o.status === "valide" ? "Validé" : "Généré"}
                    </span>
                  </td>

                  {/* Progression */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${o.progression}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{o.progression}%</span>
                    </div>
                  </td>

                  {/* Validé par */}
                  <td className="px-5 py-4 text-gray-500">
                    {o.validated_by ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString("fr-FR")}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDetails(o); }}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Voir →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}