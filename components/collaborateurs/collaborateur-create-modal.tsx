// components/collaborateurs/collaborateur-create-modal.tsx
"use client";

import {
  X, UserPlus, Loader2, Check,
  User, Mail, Phone, Calendar, Building2, ChevronDown,
} from "lucide-react";
import { useCreateCollaborateur } from "../../app/hooks/collaborateur/use-create-collaborateur";

interface CollaborateurCreateModalProps {
  isOpen: boolean;
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
      : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
  ].join(" ");
}

// ─── Écran succès ─────────────────────────────────────────────────────────────

function SuccessScreen({ tempPassword, onClose }: { tempPassword: string | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-8 py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Collaborateur créé !</h2>
          <p className="text-emerald-100 text-sm mt-1">Le compte a été créé avec succès</p>
        </div>
        <div className="px-8 py-6">
          {tempPassword && (
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 mb-5">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">
                Mot de passe temporaire
              </p>
              <p className="text-2xl font-mono font-bold text-blue-800 tracking-widest text-center py-1">
                {tempPassword}
              </p>
              <p className="text-xs text-blue-400 text-center mt-2">
                Communiquez ce mot de passe au collaborateur
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export function CollaborateurCreateModal({ isOpen, onClose, onSuccess }: CollaborateurCreateModalProps) {
  const {
    formData, errors, apiError, loading, success, tempPassword,
    roles, rolesLoading,
    handleChange, handleSubmit, reset,
  } = useCreateCollaborateur(onSuccess);

  if (!isOpen) return null;

  const handleClose = () => { reset(); onClose(); };

  if (success) return <SuccessScreen tempPassword={tempPassword} onClose={handleClose} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* ── Header ── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)", padding: "28px 28px 24px" }}
        >
          <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 left-5 w-20 h-20 rounded-full bg-white/4 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ajouter un Collaborateur</h2>
                <p className="text-blue-300 text-xs mt-0.5">Système de création de comptes professionnels</p>
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

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">

          {apiError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-sm">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">!</span>
              {apiError}
            </div>
          )}

          {/* Section 1 — Informations */}
          <SectionCard icon={User} title="Informations" color="bg-blue-100 text-blue-600">
            <div className="grid grid-cols-2 gap-3">
              <div key="last-name-field">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  placeholder="Dupont"
                  className={inputClass(false, errors.last_name)}
                />
                <FieldError message={errors.last_name} />
              </div>
              <div key="first-name-field">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Prénom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  placeholder="Jean"
                  className={inputClass(false, errors.first_name)}
                />
                <FieldError message={errors.first_name} />
              </div>
            </div>
          </SectionCard>

          {/* Section 2 — Coordonnées */}
          <SectionCard icon={Mail} title="Coordonnées" color="bg-emerald-100 text-emerald-600">
            <div className="grid grid-cols-2 gap-3">
              <div key="email-field">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Email Professionnel <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="jean@entreprise.fr"
                    className={inputClass(true, errors.email)}
                  />
                </div>
                <FieldError message={errors.email} />
              </div>
              <div key="phone-field">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    placeholder="+216 XX XXX XXX"
                    className={inputClass(true, errors.phone_number)}
                  />
                </div>
                <FieldError message={errors.phone_number} />
              </div>
            </div>
          </SectionCard>

          {/* Section 3 — Informations professionnelles */}
          <SectionCard icon={Building2} title="Informations professionnelles" color="bg-violet-100 text-violet-600">
            <div className="grid grid-cols-2 gap-3">
              <div key="role-field">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Rôle <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.role_id || ""}
                    onChange={(e) => handleChange("role_id", e.target.value)}
                    className={[inputClass(false, errors.role_id), "appearance-none pr-9"].join(" ")}
                  >
                    <option value="" disabled>
                      {rolesLoading ? "Chargement..." : "Sélectionner un rôle"}
                    </option>
                    {Array.isArray(roles) && roles.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <FieldError message={errors.role_id} />
              </div>
              <div key="date-field">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Date de Recrutement <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.date_of_hire}
                    onChange={(e) => handleChange("date_of_hire", e.target.value)}
                    className={
                      errors.date_of_hire
                        ? inputClass(true, errors.date_of_hire)
                        : "w-full pl-10 pr-3 py-2.5 border-[1.5px] border-blue-200 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                    }
                  />
                </div>
                <FieldError message={errors.date_of_hire} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-7 py-4 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={loading || rolesLoading}
            className="flex-1 py-3 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
              boxShadow: "0 4px 15px rgba(59,130,246,0.4)",
            }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Création...</>
            ) : (
              <><UserPlus className="w-4 h-4" />Créer le Collaborateur</>
            )}
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