// components/collaborateurs/collaborateur-detail-header.tsx
"use client";

import { Edit2, PowerOff, ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { CollaborateurDetail } from "../../app/services/collaborateur.service";
import { formatDate } from "../../app/lib/utils";
import { getRoleGradient } from "../../app/lib/role-colors"; // ← import partagé

function getRoleLabel(role: string): string {
  switch (role?.toLowerCase()) {
    case "manager":                return "Manager";
    case "rh":                     return "Ressources Humaines";
    case "designer":               return "Designer";
    case "comptable":              return "Comptable";
    case "développeur backend":    return "Développeur Backend";
    case "développeur frontend":   return "Développeur Frontend";
    case "new_collaborateur":      return "Collaborateur";
    default:                       return role;
  }
}

interface CollaborateurDetailHeaderProps {
  collaborateur: CollaborateurDetail;
  onModifier: () => void;
  onToggleActive: () => void;
}

export function CollaborateurDetailHeader({
  collaborateur,
  onModifier,
  onToggleActive,
}: CollaborateurDetailHeaderProps) {
  const router   = useRouter();
  const gradient = getRoleGradient(collaborateur.role); // ← couleur partagée
  const initials = `${collaborateur.first_name.charAt(0)}${collaborateur.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg mb-6">
      {/* Partie colorée */}
      <div className="relative p-7 pb-6" style={{ background: gradient }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-5 bg-white translate-y-1/2 pointer-events-none" />

        <button
          onClick={() => router.back()}
          className="relative flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
              >
                {initials}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                collaborateur.active ? "bg-green-400" : "bg-gray-400"
              }`} />
            </div>

            {/* Infos */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  {collaborateur.first_name} {collaborateur.last_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                  {collaborateur.active ? "Actif" : "Inactif"}
                </span>
              </div>
              <p className="text-white/70 text-sm">{getRoleLabel(collaborateur.role)}</p>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs">
                  <Mail className="w-3 h-3" />
                  {collaborateur.email}
                </span>
                {collaborateur.phone_number && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs">
                    <Phone className="w-3 h-3" />
                    {collaborateur.phone_number}
                  </span>
                )}
                {collaborateur.date_of_hire && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs">
                    <Calendar className="w-3 h-3" />
                    Recruté le {formatDate(collaborateur.date_of_hire)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onModifier}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={onToggleActive}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors text-sm border border-white/30"
            >
              <PowerOff className="w-4 h-4" />
              {collaborateur.active ? "Désactiver" : "Activer"}
            </button>
          </div>
        </div>
      </div>

      {/* Barre infos rapides */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 bg-white border-t border-gray-100">
        {[
          { label: "Poste",       value: "N/A" },
          { label: "Département", value: "N/A" },
          { label: "Contrat",     value: "N/A" },
          { label: "Salaire",     value: "N/A" },
        ].map(({ label, value }) => (
          <div key={label} className="px-6 py-4 text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}