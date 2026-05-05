"use client";

import { Edit2, PowerOff, ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { RH } from "../../app/types/rh.types";
import { formatDate } from "../../app/lib/utils";
import { rhService } from "@/app/service/rh.service";
import { useState } from "react";

interface RHDetailHeaderProps {
  rh: RH;
  onModifier: () => void;
  onToggleActive: (updatedRH: RH) => void;
}

export function RHDetailHeader({ rh, onModifier, onToggleActive }: RHDetailHeaderProps) {
  const router = useRouter();
  const initials = `${rh.first_name.charAt(0)}${rh.last_name.charAt(0)}`.toUpperCase();
  const [loading, setLoading] = useState(false);

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      const updatedRH = await rhService.toggleActive(rh.id); 
      if (onToggleActive) onToggleActive(updatedRH); 
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'activation/désactivation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg mb-6">
      <div
        className="relative p-7 pb-6"
        style={{ background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-5 bg-white translate-y-1/2 pointer-events-none" />

        <button
          onClick={() => router.back()}
          className="relative flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
              >
                {initials}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  rh.active ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{rh.first_name} {rh.last_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                  {rh.active ? "Actif" : "Inactif"}
                </span>
              </div>
              <p className="text-white/70 text-sm">Ressources Humaines</p>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs">
                  <Mail className="w-3 h-3" />
                  {rh.email}
                </span>
                {rh.phone_number && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs">
                    <Phone className="w-3 h-3" />
                    {rh.phone_number}
                  </span>
                )}
                {rh.date_of_hire && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs">
                    <Calendar className="w-3 h-3" />
                    Recruté le {formatDate(rh.date_of_hire)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onModifier}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={handleToggleActive}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors text-sm border border-white/30"
            >
              <PowerOff className="w-4 h-4" />
              {rh.active ? "Désactiver" : "Activer"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x divide-gray-100 bg-white border-t border-gray-100">
        {[
          { label: "Poste", value: "N/A" },
          { label: "Département", value: "N/A" },
          { label: "Contrat", value: "N/A" },
          { label: "Salaire", value: "N/A" },
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