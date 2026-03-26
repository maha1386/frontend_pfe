// app/dashboard/collaborateur/[id]/page.tsx
"use client";

import { use, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCollaborateurDetail } from "../../../hooks/collaborateur/use-collaborateur-detail";
import { CollaborateurDetailHeader } from "../../../../components/collaborateurs/collaborateur-detail-header";
import { CollaborateurDetailCards } from "../../../../components/collaborateurs/collaborateur-detail-cards";
import { CollaborateurModifierModal } from "@/components/collaborateurs/collaborateur-modifier-modal";
import { toggleCollaborateurActive } from "@/app/services/collaborateur.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CollaborateurDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { collaborateur, loading, error, refetch } = useCollaborateurDetail(Number(id));

  // Tous les hooks avant les returns conditionnels
  const [activeTab, setActiveTab] = useState("Profil");
  const [isModifierOpen, setIsModifierOpen] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const handleModifier = () => setIsModifierOpen(true);

  const handleToggleActive = async () => {
    if (!collaborateur) return;
    const label = collaborateur.active ? "désactiver" : "activer";
    if (!confirm(`Voulez-vous vraiment ${label} ce collaborateur ?`)) return;
    try {
      setToggleError(null);
      await toggleCollaborateurActive(collaborateur.id);
      await refetch();
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : "Erreur lors de la modification");
    }
  };

  // ── Returns conditionnels après les hooks ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !collaborateur) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error ?? "Collaborateur introuvable"}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Erreur toggle */}
      {toggleError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {toggleError}
        </div>
      )}

      {/* Header coloré */}
      <CollaborateurDetailHeader
        collaborateur={collaborateur}
        onModifier={handleModifier}
        onToggleActive={handleToggleActive}
      />

      {/* Onglets */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1 w-fit shadow-sm">
        {["Profil", "Professionnel", "Coordonnées", "Rémunération"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenu selon onglet */}
      {activeTab === "Profil" && (
        <CollaborateurDetailCards collaborateur={collaborateur} />
      )}
      {activeTab === "Professionnel" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-400 text-sm">
          Informations professionnelles — à développer
        </div>
      )}
      {activeTab === "Coordonnées" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-400 text-sm">
          Coordonnées — à développer
        </div>
      )}
      {activeTab === "Rémunération" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-400 text-sm">
          Rémunération — à développer
        </div>
      )}

      {/* Modal modifier */}
      <CollaborateurModifierModal
        isOpen={isModifierOpen}
        collaborateur={collaborateur}
        onClose={() => setIsModifierOpen(false)}
        onSuccess={() => { setIsModifierOpen(false); refetch(); }}
      />
    </div>
  );
}