// components/roles/role-modal.tsx
"use client";

import { useEffect } from "react";
import { X, Shield, Loader2, Check } from "lucide-react";
import { useCreateRole } from "../../app/hooks/roles/use-create-role";
import { useModifierRole } from "../../app/hooks/roles/use-modifier-role";
import { Role } from "@/app/services/role.service";

interface RoleModalProps {
  isOpen: boolean;
  roleToEdit?: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SuccessScreen({ onClose, isEdit }: { onClose: () => void; isEdit: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-8 py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? "Rôle modifié !" : "Rôle créé !"}
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            {isEdit ? "Le rôle a été mis à jour avec succès" : "Le rôle a été créé avec succès"}
          </p>
        </div>
        <div className="px-8 py-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoleModal({ isOpen, roleToEdit, onClose, onSuccess }: RoleModalProps) {
  const isEdit = !!roleToEdit;

  // ─── Hook création ────────────────────────────────────────────────────────
  const createHook = useCreateRole(onSuccess);

  // ─── Hook modification ────────────────────────────────────────────────────
  const editHook = useModifierRole(onSuccess);

  // Choisir le bon hook selon le mode
  const hook = isEdit ? editHook : createHook;

  // Pré-remplir si modification
  useEffect(() => {
    if (roleToEdit) {
      editHook.handleChange(roleToEdit.name);
      createHook.reset();
    } else {
      createHook.reset();
      editHook.reset();
    }
  }, [roleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    createHook.reset();
    editHook.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (isEdit && roleToEdit) {
      editHook.handleSubmit(roleToEdit.id);
    } else {
      createHook.handleSubmit();
    }
  };

  if (hook.success) return <SuccessScreen onClose={handleClose} isEdit={isEdit} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)",
            padding: "28px 28px 24px",
          }}
        >
          <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEdit ? "Modifier le rôle" : "Nouveau rôle"}
                </h2>
                <p className="text-blue-300 text-xs mt-0.5">
                  {isEdit ? `Modification de "${roleToEdit?.name}"` : "Créer un nouveau rôle personnalisé"}
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

        {/* Body */}
        <div className="px-7 py-6">
          {hook.apiError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-sm mb-4">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">!</span>
              {hook.apiError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Nom du rôle <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={hook.formData.name}
              onChange={(e) => hook.handleChange(e.target.value)}
              placeholder="ex: comptable, designer..."
              className={[
                "w-full px-3.5 py-2.5 border-[1.5px] rounded-xl text-sm font-medium transition-all focus:outline-none",
                hook.errors.name
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
              ].join(" ")}
            />
            {hook.errors.name && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400 text-white flex items-center justify-center font-bold text-[9px] flex-shrink-0">!</span>
                {hook.errors.name}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Le nom sera automatiquement converti en minuscules.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-7 py-4 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={hook.loading}
            className="flex-1 py-3 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
              boxShadow: "0 4px 15px rgba(59,130,246,0.4)",
            }}
          >
            {hook.loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Modification..." : "Création..."}</>
            ) : (
              <><Shield className="w-4 h-4" />{isEdit ? "Enregistrer les modifications" : "Créer le rôle"}</>
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