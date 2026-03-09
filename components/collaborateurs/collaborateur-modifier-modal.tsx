// components/collaborateurs/collaborateur-modifier-modal.tsx
"use client";

import {
  X, Edit2, Loader2, Check,
  User, Mail, Phone, Calendar, Building2, ChevronDown,
} from "lucide-react";
import { CollaborateurDetail } from "../../app/services/collaborateur.service";
import { useModifierCollaborateur } from "@/app/hooks/use-modifier-collaborateur";

interface CollaborateurModifierModalProps {
  isOpen: boolean;
  collaborateur: CollaborateurDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function inputClass(error?: string) {
  return [
    "w-full px-3.5 py-2.5 border-[1.5px] rounded-xl text-sm font-medium transition-all focus:outline-none",
    error
      ? "border-red-300 bg-red-50 text-red-800 placeholder-red-300"
      : "border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:border-orange-400 focus:shadow-[0_0_0_3px_rgba(251,146,60,0.1)]",
  ].join(" ");
}

// ─── Écran succès ─────────────────────────────────────────────────────────────

function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 px-8 py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Modifications enregistrées !</h2>
          <p className="text-orange-100 text-sm mt-1">Le collaborateur a été mis à jour avec succès</p>
        </div>
        <div className="px-8 py-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export function CollaborateurModifierModal({
  isOpen,
  collaborateur,
  onClose,
  onSuccess,
}: CollaborateurModifierModalProps) {
  const {
    formData, errors, apiError, loading, success,
    roles, rolesLoading,
    handleChange, handleSubmit, reset,
  } = useModifierCollaborateur(collaborateur, onSuccess);

  if (!isOpen || !collaborateur) return null;

  const handleClose = () => { reset(); onClose(); };

  if (success) return <SuccessScreen onClose={handleClose} />;

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("fr-FR") : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* ── Header ── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
            padding: "28px 28px 24px",
          }}
        >
          <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 left-5 w-20 h-20 rounded-full bg-white/4 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Modifier un collaborateur</h2>
                <p className="text-orange-200 text-xs mt-0.5">
                  Vous pouvez modifier le rôle et le numéro de téléphone
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">

          {apiError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-sm">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">!</span>
              {apiError}
            </div>
          )}

          {/* Champs lecture seule */}
          <div className="grid grid-cols-2 gap-3">
            <ReadOnlyField icon={User} label="Prénom" value={collaborateur.first_name} />
            <ReadOnlyField icon={User} label="Nom" value={collaborateur.last_name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ReadOnlyField icon={Mail} label="Email" value={collaborateur.email} />
            <ReadOnlyField
              icon={Calendar}
              label="Date d'embauche"
              value={formatDate(collaborateur.date_of_hire)}
            />
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium px-2">Champs modifiables</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Champs modifiables */}
          <div className="grid grid-cols-2 gap-3">

            {/* Téléphone */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Téléphone
                </span>
                <span className="text-orange-500 font-bold text-[10px] uppercase tracking-wide">
                  Modifiable
                </span>
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="+216 XX XXX XXX"
                className={inputClass(errors.phone_number)}
              />
              <FieldError message={errors.phone_number} />
            </div>

            {/* Rôle */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Rôle
                </span>
                <span className="text-orange-500 font-bold text-[10px] uppercase tracking-wide">
                  Modifiable
                </span>
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className={[inputClass(errors.role), "appearance-none pr-9"].join(" ")}
                >
                  <option value="" disabled>
                    {rolesLoading ? "Chargement..." : "Sélectionner un rôle"}
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <FieldError message={errors.role} />
            </div>
          </div>

          {/* Note info */}
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              i
            </div>
            <p className="text-xs text-blue-600">
              <span className="font-bold">Important : </span>
              Seuls les champs marqués comme "Modifiable" peuvent être mis à jour.
              Les autres champs restent intouchables selon vos permissions.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-7 py-4 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={loading || rolesLoading}
            className="flex-1 py-3 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
              boxShadow: "0 4px 15px rgba(234,88,12,0.4)",
            }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>
            ) : (
              <><Edit2 className="w-4 h-4" />Enregistrer les modifications</>
            )}
          </button>
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-5 py-3 border-[1.5px] border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}