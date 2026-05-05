"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import { Loader2, AlertCircle, Sidebar } from "lucide-react";
import { RHDetailHeader } from "../../../../components/Rh/RHDetailHeader";
import { RhDetailCards } from "../../../../components/Rh/RhDetailCards";
import { rhService } from "../../../service/rh.service";
import { RH } from "../../../types/rh.types";
import { HeaderFinal } from "../../../../components/HeaderFinal";
import { SidebarFinal } from "../../../../components/Sidebar";
import { RhEditModal } from "../../../../components/Rh/RhEditModal"; 

export default function RhDetailPage() {
  const params = useParams(); 
  const numericId = Number(params?.id); 
  const [rh, setRh] = useState<RH | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!numericId) return;

    const fetchRh = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await rhService.getById(numericId);
        setRh(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchRh();
  }, [numericId]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-32 bg-white min-h-screen ">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );

  if (error || !rh)
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error ?? "RH introuvable"}
      </div>
    );

    
  const handleModifier = () => setIsEditOpen(true);

  const handleToggleActive = async () => {
    if (!rh) return;
    try {
      const updated = await rhService.toggleActive(rh.id);
      setRh(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur toggle active");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      {/* Contenu principal avec marge si sidebar ouvert */}
      <main className={`p-6 transition-all mt-1 ${isSidebarOpen ? "ml-10" : "ml-16"}`}>
        <RHDetailHeader rh={rh} onModifier={handleModifier} onToggleActive={handleToggleActive} />

        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1 w-fit shadow-sm mb-4">
          {["Profil", "Coordonnées", "Professionnel"].map((tab, i) => (
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

        <RhDetailCards rh={rh} />
      </main>
      {/* Modal édition */}
      {rh && (
        <RhEditModal
          rh={rh}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={async () => {
            if (!rh) return;
            const updated = await rhService.getById(rh.id);
            setRh(updated);
            setIsEditOpen(false);
          }}
        />
      )}  
    </div>
  );
}