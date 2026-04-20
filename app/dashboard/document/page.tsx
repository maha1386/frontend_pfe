"use client";

import { useState, useEffect } from "react";
import { Pagination } from "@/app/types/document.types";
import { Document } from "@/app/types/document.types";
import { Toolbar } from "../../../components/Document/DocumentsToolbar";
import { TableDocuments } from "../../../components/Document/DocumentsTable";
import { DocumentsPagination } from "../../../components/Document/DocumentsPagination";
import { DocumentCreateModal } from "../../../components/Document/DocumentCreateModal";
import { DocumentEditModal } from "../../../components/Document/DocumentEditModal";
import { useDocuments } from "../../hook/useDocuments";
import { documentService } from "@/app/service/document.service";

export default function DocumentsPage() {
  const { documents, loading, error, fetchDocuments, addDocument, updateDocument, deleteDocument } = useDocuments();
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchDocuments({ namedoc: searchTerm });
  }, [searchTerm]);

  const handleCreate = async (doc: {
    name: string;
    signatureRequired: boolean;
    file: File | null;
    user_ids: number[];
  }) => {
    try {
        const formData = new FormData();
        formData.append("namedoc", doc.name);
        formData.append("signature_req", doc.signatureRequired ? "1" : "0");
        if (doc.file) formData.append("path", doc.file);
    
        // Envoyer chaque user_id séparément
        doc.user_ids.forEach((id) => {
          formData.append("user_ids[]", id.toString());
        });
    
        await addDocument(formData);
        setCreateModalOpen(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur création document");
      }
};

  const handleEdit = (doc: Document) => {
    setSelectedDocument(doc);
    setEditModalOpen(true);
  };

  const handleUpdate = async (data: {
    namedoc: string;
    signature_req: boolean;
    path?: File;
  }) => {
    if (!selectedDocument) return;
    try {
      await updateDocument(selectedDocument.id, data);
      setEditModalOpen(false);
      setSelectedDocument(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur modification document");
    }
  };

  const handleDelete = async (id: number) => {
    await deleteDocument(id);
  };

  const handleView = async (doc: Document) => {
    setPdfLoading(true);
    setPdfName(doc.namedoc);
    try {
        const url = await documentService.viewDocument(doc.id); 
        setPdfUrl(url);
    } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur chargement PDF");
    } finally {
        setPdfLoading(false);
    }
};

  const handleClosePdf = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  return (
    <div className="pt-0 px-6 pb-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez vos documents et fichiers</p>
      </div>

      <Toolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAdd={() => setCreateModalOpen(true)}
      />

      <TableDocuments
        documents={documents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <div className="mt-3">
        <DocumentsPagination
          pagination={{ ...pagination, total: documents.length, to: documents.length }}
          onPageChange={() => {}}
        />
      </div>

      <DocumentCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <DocumentEditModal
        document={selectedDocument}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedDocument(null);
        }}
        onSuccess={() => fetchDocuments({ namedoc: searchTerm })}
      />

      {loading && <p className="text-center mt-4 text-gray-500">Chargement...</p>}
      {error && <p className="text-center mt-4 text-red-500">{error}</p>}

      {/* 🆕 Modal PDF */}
      {(pdfUrl || pdfLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-lg truncate">{pdfName}</h2>
              <button
                onClick={handleClosePdf}
                className="text-gray-500 hover:text-red-500 text-2xl font-bold leading-none"
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
    </div>
  );
}