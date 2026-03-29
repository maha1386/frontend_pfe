import { FileText, Edit2, Trash2, Eye } from 'lucide-react';
import { Document } from "../../app/types/document.types";

interface TableDocumentsProps {
  documents: Document[];
  onEdit: (doc: Document) => void;
  onDelete: (id: number) => void;
  onView: (doc: Document) => void;
}

export function TableDocuments({ documents, onEdit, onDelete, onView }: TableDocumentsProps) {
  const getFileIcon = (path: string) => {
    return <FileText className="w-5 h-5 text-white" />;
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigné à</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signature requise</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {documents.map((document) => (
            <tr key={document.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(document.path)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{document.namedoc}</div>
                  <div className="text-xs text-gray-500">ID: {document.id}</div>
                </div>
              </td>
              {/* Assigné à */}
              <td className="px-6 py-4 text-sm text-gray-600">
                {document.assignments && document.assignments.length > 0
                      ? document.assignments.map((a) => a.user_fullname).join(", ")
                      : "Non assigné"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{document.signature_req ? 'Oui' : 'Non'}</td>
              <td className="px-6 py-4 flex items-center justify-end gap-2">
                <button onClick={() => onEdit(document)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onView(document)}
                  className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                  title="Voir le document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(document.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}