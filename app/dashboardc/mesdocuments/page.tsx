"use client";

import { useState } from "react";
import { MesDocumentsToolbar } from "../../../components/MesDocuments/MesDocumentsToolbar";
import { MesDocumentsTable } from "../../../components/MesDocuments/MesDocumentsTable";
import { DocumentsPagination } from "../../../components/Document/DocumentsPagination";
import { useMesDocuments } from "../../../app/hook/useMesDocuments";
import { documentService } from "@/app/service/document.service";
import { DocumentsStats } from "../../../components/MesDocuments/DocumentsStats";
import { Document } from "../../../app/types/document.types";

export default function MesDocumentsPage() {
  const { documents: allDocuments, loading, error, filters, setFilters, refresh } = useMesDocuments();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // États pour filtre et tri
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 🔹 Helpers
  function getDocumentStatus(doc: Document) {
    if (!doc.signature_req) return "À lire";
    const allSigned = doc.assignments?.every(a => a.status === "signed");
    if (allSigned) return "Signé";
    return "En cours";
  }

  // 🔹 Filtrer et trier
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

  // 🔹 Handlers
  const handleView = async (doc: Document) => {
    setPdfLoading(true);
    setPdfName(doc.namedoc);
    try {
      const url = await documentService.viewDocument(doc.id);
      setPdfUrl(url);
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
      alert(`Document ${doc.namedoc} signé !`);
      await refresh();
    } catch (err) {
      console.error("Erreur signature document :", err);
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
      {/* 📊 Espacement uniforme avec space-y-8 */}
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

        {/* Conteneur pour tableau + pagination */}
        <div className="space-y-2"> {/* <-- réduit l'espace vertical ici */}
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

      {/*  MODAL PDF */}
      {(pdfUrl || pdfLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-lg truncate">{pdfName}</h2>
              <button
                onClick={handleClosePdf}
                className="text-gray-500 hover:text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Content */}
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
    </div>
  );
}