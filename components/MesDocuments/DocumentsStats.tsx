"use client";

import { Document } from "../../app/types/document.types";

interface DocumentsStatsProps {
  documents: Document[];
}

export function DocumentsStats({ documents }: DocumentsStatsProps) {
  const total = documents.length;

  // À lire : documents qui ne nécessitent pas de signature
  const toRead = documents.filter(d => !d.signature_req).length;

  // Signés : tous les assignés sont signés
  const signed = documents.filter(d =>
    d.signature_req && d.assignments?.every(a => a.status === "signed")
  ).length;

  // En cours : documents nécessitant une signature mais pas encore signés
  const inProgress = documents.filter(d =>
    d.signature_req && !(d.assignments?.every(a => a.status === "signed"))
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 text-left">
        <p className="text-sm text-slate-600 font-medium">Total documents</p>
        <p className="text-2xl font-semibold text-slate-900">{total}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-slate-200 text-left">
        <p className="text-sm text-slate-600 font-medium">À lire</p>
        <p className="text-2xl font-semibold text-orange-600">{toRead}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-slate-200 text-left">
        <p className="text-sm text-slate-600 font-medium">En cours</p>
        <p className="text-2xl font-semibold text-yellow-600">{inProgress}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-slate-200 text-left">
        <p className="text-sm text-slate-600 font-medium">Signés</p>
        <p className="text-2xl font-semibold text-green-600">{signed}</p>
      </div>
    </div>
  );
}