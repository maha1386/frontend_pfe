import { Search, Upload } from 'lucide-react';

interface ToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onAdd: () => void;
}

export function Toolbar({ searchTerm, setSearchTerm, onAdd }: ToolbarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 flex items-center justify-between gap-4">
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Nouveau document
      </button>
    </div>
  );
}