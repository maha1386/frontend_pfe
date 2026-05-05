"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useColabStatus } from "../../../hooks/onboarding/useColabStatus";

interface Collaborateur {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function GenererPage() {
  const router = useRouter();
  const { online } = useColabStatus();

  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [loadingCollab, setLoadingCollab] = useState(false);
  const [searchCollab, setSearchCollab] = useState("");

  const [selectedUser, setSelectedUser] = useState<Collaborateur | null>(null);
  const [poste, setPoste] = useState("");
  const [description, setDescription] = useState("");
  const [monthsCount, setMonthsCount] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Recherche collaborateurs ──────────────────────────
  const searchCollaborateurs = async (q: string) => {
    setSearchCollab(q);
    if (q.length < 2) { setCollaborateurs([]); return; }

    try {
      setLoadingCollab(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/collaborateurs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      const list: Collaborateur[] = data.collaborateurs?.data ?? [];
      setCollaborateurs(
        list.filter((c) =>
          `${c.first_name} ${c.last_name}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
      );
    } catch {
      setCollaborateurs([]);
    } finally {
      setLoadingCollab(false);
    }
  };

  // ── Soumettre ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedUser) { setError("Sélectionnez un collaborateur."); return; }
    if (!poste.trim()) { setError("Le poste est requis."); return; }
    if (!description.trim()) { setError("La description est requise."); return; }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/user/${selectedUser.id}/generer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            poste,
            description,
            months_count: monthsCount,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? `Erreur ${res.status}`);
      }

      const data = await res.json();
      router.push(`/dashboard/onboarding/${data.onboarding.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Générer un plan</h1>
          <p className="text-gray-500 mt-1">
            L'IA va créer un plan d'intégration personnalisé
          </p>
        </div>
      </div>

      {/* ── Colab offline warning ── */}
      {online === false && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          L'IA Colab est hors ligne. Lancez Colab avant de générer.
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">

        {/* ── Collaborateur ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Collaborateur
          </label>

          {selectedUser ? (
            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                </div>
                <span className="text-sm font-medium text-blue-700">
                  {selectedUser.first_name} {selectedUser.last_name}
                </span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs text-blue-400 hover:text-blue-600"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un collaborateur..."
                value={searchCollab}
                onChange={(e) => searchCollaborateurs(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {loadingCollab && (
                <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-gray-400" />
              )}
              {collaborateurs.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                  {collaborateurs.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedUser(c);
                        setSearchCollab("");
                        setCollaborateurs([]);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-left text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {c.first_name} {c.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Poste ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Poste occupé
          </label>
          <input
            type="text"
            placeholder="Ex: Développeur Full Stack"
            value={poste}
            onChange={(e) => setPoste(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ── Description ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Description du poste
          </label>
          <textarea
            placeholder="Décrivez les responsabilités, les outils utilisés, l'équipe..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* ── Durée ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Durée du plan
            <span className="ml-2 text-blue-600 font-semibold">
              {monthsCount} mois
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={12}
            value={monthsCount}
            onChange={(e) => setMonthsCount(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 mois</span>
            <span>12 mois</span>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={loading || online === false}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération en cours... (peut prendre 1-2 min)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Générer le plan IA
            </>
          )}
        </button>
      </div>
    </div>
  );
}