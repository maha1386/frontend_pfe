"use client";

import { Eye, Check, Paperclip, PenTool } from "lucide-react";
import { Document } from "../../app/types/document.types";

interface MesDocumentsTableProps {
  documents: Document[];
  onView: (doc: Document) => void;
  onSign: (doc: Document) => void;
}

export function MesDocumentsTable({
  documents,
  onView,
  onSign,
}: MesDocumentsTableProps) {

    // 🎯 Calcul du status
    const getDocumentStatus = (doc: Document) => {
    // Si le document ne nécessite pas de signature
    if (!doc.signature_req) return "À lire";

    // Si toutes les assignations sont signées
    const allSigned = doc.assignments?.every(a => a.status === "signed");
    if (allSigned) return "Signé";

    // Sinon, si le document nécessite une signature mais n'est pas encore signé
    return "En cours";
    };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* HEADER */}
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Document", "Signature", "Signé le", "Statut", "Actions"].map((th) => (
                <th key={th} className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                  {th}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const status = getDocumentStatus(doc);

              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  {/* 📄 Document */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Paperclip size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.namedoc}</p>
                        <p className="text-xs text-slate-500">ID: {doc.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* ✍️ Signature */}
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.signature_req
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {doc.signature_req ? "Requise" : "Non requise"}
                    </span>
                  </td>
                  {/* 📅 Signé le */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                    {!doc.signature_req
                        ? "-"
                        : (() => {
                            const signedAt = doc.assignments?.find(a => a.signed_at)?.signed_at;
                            return signedAt
                                ? new Date(signedAt).toLocaleDateString("fr-FR")
                                : "-";
                            })()
                    }
                    </td>

                  {/* 🟢 Status */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      status === "Signé"
                        ? "bg-green-100 text-green-700"
                        : status === "En cours"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {status}
                    </span>
                  </td>

                  {/* ⚡ Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-6">
                      {/* 👁️ Voir */}
                      <button
                        onClick={() => onView(doc)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <Eye size={16} className="text-slate-600" />
                      </button>

                      {/* ✍️ Signer */}
                      {doc.signature_req && status !== "Signé" && (
                        <button
                            onClick={() => onSign(doc)}
                           className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                            title="Signer"
                        >
                            <PenTool size={14} />
                            Signer
                        </button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}