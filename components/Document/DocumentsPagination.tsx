import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "../../app/types/document.types";

interface DocumentsPaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function DocumentsPagination({
  pagination,
  onPageChange,
}: DocumentsPaginationProps) {
  const { current_page, last_page, total, from, to } = pagination;

  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <span>
        Affichage de{" "}
        <span className="font-semibold text-gray-700">{to}</span> sur{" "}
        <span className="font-semibold text-gray-700">{total}</span> documents
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-4 py-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-700">
          Page {current_page} / {last_page}
        </span>

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}