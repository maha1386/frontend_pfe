"use client";

import { Edit2, Trash2, Download, FileText } from "lucide-react";
import { useState } from "react";
import { Document } from "../../app/types/document.types";

interface DocumentDetailHeaderProps {
  document: Document;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onDownload: (doc: Document) => void;
}

export function DocumentDetailHeader({
  document,
  onEdit,
  onDelete,
  onDownload,
}: DocumentDetailHeaderProps) {
  const [loadingDelete, setLoadingDelete] = useState(false);
    
  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    try {
      setLoadingDelete(true);
      await onDelete(document);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg mb-6">
      <div
        className="relative p-7 pb-6"
        style={{ background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" }}
      >
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
            >
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{document.namedoc}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold`}
                >
                  {document.signature_req ? "Signature requise" : "Pas de signature"}
                </span>
              </div>
              <p className="text-white/70 text-sm">{document.path}</p>
              <p className="text-white/80 text-sm mt-1">
                Assigné à : {document.assigned_to_name || "Non défini"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(document)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              disabled={loadingDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors text-sm border border-white/30"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
            <button
              onClick={() => onDownload(document)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors text-sm border border-white/30"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}