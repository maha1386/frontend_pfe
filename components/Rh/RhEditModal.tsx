"use client";

import {
  X, Loader2, Check,
  Phone, Calendar,
  Pencil,
  User,
  Mail,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { rhService } from "@/app/services/rh.service";
import { RH } from "../../app/types/rh.types";

interface Props {
  rh: RH | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function inputClass() {
  return "w-full px-3.5 py-2.5 border-[1.5px] rounded-xl text-sm font-medium transition-all focus:outline-none border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]";
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      <div className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-100 rounded-xl text-sm text-slate-400 bg-slate-50 cursor-not-allowed">
        {value || "—"}
      </div>
    </div>
  );
}

export function RhEditModal({ rh, isOpen, onClose, onSuccess }: Props) {
  const [phone, setPhone]         = useState("");
  const [dateOfHire, setDateOfHire] = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (rh) {
      setPhone(rh.phone_number || "");

      // Backend renvoie dd-mm-yyyy → convertir en yyyy-MM-dd pour l'input date
      const raw = rh.date_of_hire || "";
      const parts = raw.split(/[-\/]/);
      if (parts.length === 3 && parts[0].length === 2) {
        setDateOfHire(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        setDateOfHire(raw); // déjà yyyy-MM-dd
      }
    }
  }, [rh]);

  if (!isOpen || !rh) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await rhService.update(rh.id, {
        phone_number: phone,
        date_of_hire: dateOfHire, // yyyy-MM-dd — correct pour Laravel
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-7 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modifier RH</h2>
              <p className="text-rose-200 text-xs mt-0.5">Modifier les informations professionnelles</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-7 py-5 space-y-5">

          {/* Lecture seule */}
          <div className="grid grid-cols-2 gap-3">
            <ReadOnlyField icon={User}     label="Prénom" value={rh.first_name || ""} />
            <ReadOnlyField icon={User}     label="Nom"    value={rh.last_name  || ""} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <ReadOnlyField icon={Mail} label="Email" value={rh.email || ""} />
          </div>

          {/* Champs éditables */}
          <div className="grid grid-cols-2 gap-3">

            {/* Téléphone */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass()}
                placeholder="+216 XX XXX XXX"
              />
            </div>

            {/* Date d'embauche (éditable) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date d'embauche
              </label>
              <input
                type="date"
                value={dateOfHire}
                onChange={(e) => setDateOfHire(e.target.value)}
                className={inputClass()}
              />
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-3 px-7 py-4 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #db2777 0%, #f43f5e 100%)" }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>
            ) : (
              <><Check className="w-4 h-4" />Modifier</>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 border-[1.5px] border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Annuler
          </button>
        </div>

      </div>
    </div>
  );
}