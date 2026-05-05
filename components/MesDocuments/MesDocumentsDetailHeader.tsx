"use client";

import { FileText, Eye, Check } from "lucide-react";
import { useState } from "react";
import { Document } from "../../app/types/document.types";

interface MesDocumentsDetailHeaderProps {
  document: Document;
  onView: (doc: Document) => void;
  onSign: (doc: Document) => void;
}

export function MesDocumentsDetailHeader({ document, onView, onSign }: MesDocumentsDetailHeaderProps) {
  const [loadingSign, setLoadingSign] = useState(false);
  const isSigned = document.assignments?.some(a => a.status === "signed");

  const handleSign = async () => {
    if (!window.confirm("Voulez-vous vraiment signer ce document ?")) return;
    try {
      setLoadingSign(true);
      await onSign(document);
    } finally {
      setLoadingSign(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-6">
      
      <div className="p-6">
        <div className="flex items-start justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-5">

            {/* ICON */}
            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
              <FileText className="w-7 h-7" />
            </div>

            {/* TEXT */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold text-slate-900">
                  {document.namedoc}
                </h1>

                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  document.signature_req
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {document.signature_req ? "Signature requise" : "Pas de signature"}
                </span>
              </div>

              <p className="text-slate-500 text-sm">{document.path}</p>

                            {/* 📅 Signé le */}
              <p className="text-slate-600 text-sm mt-1">
                Signé le : {
                  !document.signature_req
                    ? "-"
                    : document.assignments?.[0]?.signed_at
                      ? new Date(document.assignments[0].signed_at).toLocaleDateString("fr-FR")
                      : "-"
                }
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => onView(document)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition text-sm"
            >
              <Eye className="w-4 h-4" />
              Voir
            </button>

            {document.signature_req && !isSigned && (
              <button
                onClick={handleSign}
                disabled={loadingSign}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition text-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {loadingSign ? "Signature..." : "Signer"}
              </button>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}