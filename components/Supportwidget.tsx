"use client";

// components/SupportWidget.tsx
// Widget flottant "Aide & Support" — à insérer une fois dans dashboardc/layout.tsx

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createConversation } from "../app/services/messaging.service";

type Recipient = "rh" | "suivi";

interface Option {
  key: Recipient;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const OPTIONS: Option[] = [
  {
    key: "rh",
    label: "Responsable RH",
    sublabel: "Contrat, documents, questions administratives",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "text-indigo-600",
    bg: "bg-indigo-50 hover:bg-indigo-100",
    border: "border-indigo-200 hover:border-indigo-400",
  },
  {
    key: "suivi",
    label: "Responsable de suivi",
    sublabel: "Plan d'intégration, tâches, formations",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    border: "border-emerald-200 hover:border-emerald-400",
  },
];

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<Recipient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fermer si clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setError(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

const handleContact = async (recipient: Recipient) => {
  setLoading(recipient);
  setError(null);
  try {
    const { conversation_id } = await createConversation();
    setOpen(false);
    // Passe l'id pour ouvrir directement la conversation
    router.push(`/dashboardc/messages?conversation=${conversation_id}`);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Impossible d'ouvrir la conversation.");
  } finally {
    setLoading(null);
  }
};

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }} className="flex flex-col items-end gap-3">
      {/* Panneau */}
      {open && (
        <div
          ref={panelRef}
          className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in"
          style={{ animation: "slideUp 0.2s ease-out" }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Besoin d'aide ?</h3>
              <p className="text-xs text-slate-500 mt-0.5">Choisissez votre interlocuteur</p>
            </div>
            <button
              onClick={() => { setOpen(false); setError(null); }}
              className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Options */}
          <div className="p-3 space-y-2">
            {OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleContact(opt.key)}
                disabled={loading !== null}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border transition-all text-left
                  ${opt.bg} ${opt.border} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {/* Icône */}
                <div className={`flex-shrink-0 mt-0.5 ${opt.color}`}>
                  {loading === opt.key ? (
                    <span className="w-5 h-5 flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                    </span>
                  ) : opt.icon}
                </div>
                {/* Texte */}
                <div>
                  <p className={`text-sm font-semibold ${opt.color}`}>{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.sublabel}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Erreur */}
          {error && (
            <div className="px-4 pb-3">
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              Vous serez redirigé vers la messagerie interne
            </p>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => { setOpen((v) => !v); setError(null); }}
        className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg font-medium text-sm transition-all duration-200
          ${open
            ? "bg-slate-800 text-white pr-5"
            : "bg-indigo-600 hover:bg-indigo-700 text-white pr-5 hover:shadow-indigo-200 hover:shadow-xl"
          }`}
        aria-label="Aide et support"
      >
        {/* Icône */}
        <span className="flex-shrink-0">
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </span>
        <span>{open ? "Fermer" : "Aide & Support"}</span>
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}