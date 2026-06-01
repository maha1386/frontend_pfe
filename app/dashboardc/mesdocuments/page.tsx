"use client";

import { useState } from "react";
import { MesDocumentsToolbar } from "../../../components/MesDocuments/MesDocumentsToolbar";
import { MesDocumentsTable } from "../../../components/MesDocuments/MesDocumentsTable";
import { DocumentsPagination } from "../../../components/Document/DocumentsPagination";
import { useMesDocuments } from "../../hooks/useMesDocuments";
import { documentService } from "@/app/services/document.service";
import { DocumentsStats } from "../../../components/MesDocuments/DocumentsStats";
import { Document } from "../../../app/types/document.types";

export default function MesDocumentsPage() {
  const { documents: allDocuments, loading, error, filters, setFilters, refresh } = useMesDocuments();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [successModal, setSuccessModal] = useState<{ open: boolean; docName: string }>({ open: false, docName: "" });
  const [errorModal, setErrorModal]     = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  function getDocumentStatus(doc: Document) {
    if (!doc.signature_req) return "À lire";
    const hasSigned = doc.assignments?.some(a => a.status === "signed");
    if (hasSigned) return "Signé";
    return "En cours";
} 

  const filteredAndSortedDocuments = allDocuments
    .filter((doc: Document) => {
      const matchesSearch = doc.namedoc.toLowerCase().includes((filters.namedoc || "").toLowerCase());
      const matchesStatus = !filterStatus || getDocumentStatus(doc) === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a: Document, b: Document) => {
      const dateA = a.assignments?.find(a => a.signed_at)?.signed_at
        ? new Date(a.assignments!.find(a => a.signed_at)!.signed_at!).getTime()
        : 0;
      const dateB = b.assignments?.find(a => a.signed_at)?.signed_at
        ? new Date(b.assignments!.find(a => a.signed_at)!.signed_at!).getTime()
        : 0;
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

  const totalPages = Math.ceil(filteredAndSortedDocuments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

  const handleView = async (doc: Document) => {
    setPdfLoading(true);
    setPdfName(doc.namedoc);
    try {
      const signedPdf = doc.assignments?.find(a => a.status === "signed")?.signed_pdf_path;
      if (signedPdf) {
        setPdfUrl(`http://localhost:8000${signedPdf}`);
      } else {
        const url = await documentService.viewDocument(doc.id);
        setPdfUrl(url);
      }
    } catch (err) {
      alert("Erreur chargement PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleClosePdf = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const handleSign = async (doc: Document) => {
    try {
      await documentService.signerDocument(doc.id);
      setSuccessModal({ open: true, docName: doc.namedoc });
      await refresh();
    } catch (err: any) {
      setErrorModal({ open: true, message: err.message || "Erreur lors de la signature" });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Documents</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ici vous pouvez consulter, filtrer et signer vos documents assignés.
        </p>
      </div>

      <div className="space-y-8">

        <DocumentsStats documents={allDocuments} />

        <MesDocumentsToolbar
          searchTerm={filters.namedoc || ""}
          setSearchTerm={(value) => {
            setFilters({ ...filters, namedoc: value });
            setCurrentPage(1);
          }}
          onFilterStatus={(status) => {
            setFilterStatus(status);
            setCurrentPage(1);
          }}
          onSortBySignedAt={(direction) => {
            setSortDirection(direction);
          }}
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-gray-500 mb-4">Chargement des documents...</p>}

        <div className="space-y-2">
          <MesDocumentsTable
            documents={paginatedDocuments}
            onView={handleView}
            onSign={handleSign}
          />

          <DocumentsPagination
            pagination={{
              current_page: currentPage,
              last_page: totalPages,
              total: filteredAndSortedDocuments.length,
              from: filteredAndSortedDocuments.length === 0 ? 0 : startIndex + 1,
              to: Math.min(endIndex, filteredAndSortedDocuments.length),
            }}
            onPageChange={(page) => {
              if (page >= 1 && page <= totalPages) setCurrentPage(page);
            }}
          />
        </div>

      </div>

      {/* MODAL PDF */}
      {(pdfUrl || pdfLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-lg truncate">{pdfName}</h2>
              <button
                onClick={handleClosePdf}
                className="text-gray-500 hover:text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 w-full">
              {pdfLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Chargement du document...
                </div>
              ) : (
                <iframe
                  src={pdfUrl!}
                  className="w-full h-full"
                  title={pdfName}
                />
              )}
            </div>

          </div>
        </div>
      )}
      {/* Modal succès signature */}
      {successModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold">Document signé !</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-1">Le document</p>
              <p className="text-gray-900 font-semibold text-base mb-4">« {successModal.docName} »</p>
              <p className="text-gray-500 text-sm mb-6">a été signé avec succès. Le RH a été notifié.</p>
              <button
                onClick={() => setSuccessModal({ open: false, docName: "" })}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all"
              >
                Parfait !
              </button>
            </div>
          </div>
        </div>
      )}
      {/*  Modal erreur signature */}
      {errorModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-red-400 to-rose-500 p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold">Erreur</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-700 text-sm mb-6">{errorModal.message}</p>
              <button
                onClick={() => setErrorModal({ open: false, message: "" })}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-2.5 rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}