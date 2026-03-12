"use client";

import {
  X, UserPlus, Loader2, Check,
  User, Mail, Phone, Calendar, ChevronDown,
} from "lucide-react";
import { useRhs } from "../../app/hook/useRhs";
import React from "react"; 

interface RhCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5">
      <span className="w-3.5 h-3.5 rounded-full bg-red-400 text-white flex items-center justify-center font-bold text-[9px] flex-shrink-0">
        !
      </span>
      {message}
    </p>
  );
}

function SectionCard({
  icon: Icon, title, color, children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {title}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      {children}
    </div>
  );
}

function inputClass(hasIcon: boolean, error?: string) {
  return [
    "w-full py-2.5 border-[1.5px] rounded-xl text-sm font-medium transition-all focus:outline-none",
    hasIcon ? "pl-10 pr-3" : "px-3.5",
    error
      ? "border-red-300 bg-red-50 text-red-800 placeholder-red-300"
      : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]",
  ].join(" ");
}


function useCreateRh(onSuccess?: () => void) {
  const { createRH, loading, success, tempPassword, error: apiError } = useRhs();

  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_hire: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {

    const newErrors: Record<string, string> = {};
    if (!formData.first_name) newErrors.first_name = "Le prénom est requis";
    if (!formData.last_name) newErrors.last_name = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.date_of_hire) newErrors.date_of_hire = "La date de recrutement est requise";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await createRH(formData);
    if (success && onSuccess) onSuccess();
  };

  const reset = () => {
    setFormData({ first_name: "", last_name: "", email: "", phone_number: "", date_of_hire: "" });
    setErrors({});
  };

  return { formData, errors, apiError, loading, success, tempPassword, handleChange, handleSubmit, reset };
}


function SuccessScreen({ tempPassword, onClose }: { tempPassword: string | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 px-8 py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">RH créé !</h2>
          <p className="text-rose-100 text-sm mt-1">Le compte a été créé avec succès</p>
        </div>
        <div className="px-8 py-6">
          {tempPassword && (
            <div className="bg-pink-50 border-2 border-rose-100 rounded-2xl p-5 mb-5">
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3">
                Mot de passe temporaire
              </p>
              <p className="text-2xl font-mono font-bold text-rose-800 tracking-widest text-center py-1">
                {tempPassword}
              </p>
              <p className="text-xs text-rose-400 text-center mt-2">
                Communiquez ce mot de passe au RH
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-500/25"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}


export function RhCreateModal({ isOpen, onClose, onSuccess }: RhCreateModalProps) {
  const { formData, errors, apiError, loading, success, tempPassword, handleChange, handleSubmit, reset } = useCreateRh(onSuccess);

  if (!isOpen) return null;

  const handleClose = () => { reset(); onClose(); };

  if (success) return <SuccessScreen tempPassword={tempPassword} onClose={handleClose} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-600 to-rose-600 p-7">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ajouter un RH</h2>
                <p className="text-rose-200 text-xs mt-0.5">Système de création de comptes RH</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-sm">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">!</span>
              {apiError}
            </div>
          )}

          {/* Section Infos RH */}
          <SectionCard icon={User} title="Informations" color="bg-pink-100 text-rose-600">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nom <span className="text-red-400">*</span></label>
                <input type="text" value={formData.last_name} onChange={e => handleChange("last_name", e.target.value)}
                  className={inputClass(false, errors.last_name)} placeholder="Dupont" />
                <FieldError message={errors.last_name} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Prénom <span className="text-red-400">*</span></label>
                <input type="text" value={formData.first_name} onChange={e => handleChange("first_name", e.target.value)}
                  className={inputClass(false, errors.first_name)} placeholder="Marie" />
                <FieldError message={errors.first_name} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Mail} title="Coordonnées" color="bg-pink-50 text-rose-600">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)}
                  className={inputClass(false, errors.email)} placeholder="marie@entreprise.fr" />
                <FieldError message={errors.email} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Téléphone</label>
                <input type="tel" value={formData.phone_number} onChange={e => handleChange("phone_number", e.target.value)}
                  className={inputClass(false, errors.phone_number)} placeholder="+216 XX XXX XXX" />
                <FieldError message={errors.phone_number} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Calendar} title="Informations professionnelles" color="bg-rose-50 text-rose-600">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date de Recrutement <span className="text-red-400">*</span></label>
              <input type="date" value={formData.date_of_hire} onChange={e => handleChange("date_of_hire", e.target.value)}
                className={inputClass(false, errors.date_of_hire)} />
              <FieldError message={errors.date_of_hire} />
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center gap-3 px-7 py-4 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #db2777 0%, #f43f5e 100%)" }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Création...</> : <><UserPlus className="w-4 h-4" />Ajouter le RH</>}
          </button>
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-5 py-3 border-[1.5px] border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}