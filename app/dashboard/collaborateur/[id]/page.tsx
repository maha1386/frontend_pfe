// app/dashboard/collaborateur/[id]/page.tsx
"use client";

import { use } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCollaborateurDetail } from "../../../hooks/use-collaborateur-detail";
import { CollaborateurDetailHeader } from "../../../../components/collaborateurs/collaborateur-detail-header";
import { CollaborateurDetailCards } from "../../../../components/collaborateurs/collaborateur-detail-cards";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CollaborateurDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { collaborateur, loading, error } = useCollaborateurDetail(Number(id));

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

  const handleModifier = () => {
    console.log("Modifier", collaborateur.id);
  };

  const handleToggleActive = () => {
    console.log("Toggle active", collaborateur.id);
  };

  return (
    <div className="space-y-5">
      {/* Header coloré */}
      <CollaborateurDetailHeader
        collaborateur={collaborateur}
        onModifier={handleModifier}
        onToggleActive={handleToggleActive}
      />

      {/* Onglets */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1 w-fit shadow-sm">
        {["Profil", "Professionnel", "Coordonnées", "Rémunération"].map((tab, i) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              i === 0
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <CollaborateurDetailCards collaborateur={collaborateur} />
    </div>
  );
}