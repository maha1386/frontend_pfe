"use client";

import { useState } from "react";
import { AlertCircle, Sidebar } from "lucide-react";
import { useRouter } from "next/navigation";

import { useRhs } from "../../hook/useRhs"; 
import { RhsToolbar } from "../../../components/Rh/RhsToolbar";
import { RhsTable } from "../../../components/Rh/RhsTable";
import { RhsPagination } from "../../../components/Rh/RhsPagination";
import { RhCreateModal } from "../../../components/Rh/RhCreateModal";
import { RhEditModal } from "../../../components/Rh/RhEditModal";

import { SidebarFinal } from "../../../components/Sidebar";
import { HeaderFinal } from "../../../components/HeaderFinal";
import { RH } from "../../types/rh.types";

export default function RhPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingRh, setEditingRh] = useState<RH | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { rhs, loading, error, fetchRhs, toggleActiveRH } = useRhs();
  const router = useRouter();

  const [sortField, setSortField] = useState<keyof RH>("first_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;


  const filtered = rhs.filter((rh) => {
    const matchSearch =
      rh.first_name.toLowerCase().includes(search.toLowerCase()) ||
      rh.last_name.toLowerCase().includes(search.toLowerCase()) ||
      rh.email.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && rh.active) ||
      (statusFilter === "inactive" && !rh.active);

    return matchSearch && matchStatus;
  });


  const sorted = [...filtered].sort((a, b) => {
    const aValue = String(a[sortField] ?? "");
    const bValue = String(b[sortField] ?? "");
    return sortDir === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });


  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);
  const pagination = {
    current_page: currentPage,
    last_page: Math.ceil(sorted.length / perPage),
    total: sorted.length,
    from: (currentPage - 1) * perPage + 1,
    to: Math.min(currentPage * perPage, sorted.length),
  };


  const handleSort = (field: keyof RH) => {
    if (field === sortField) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleModifier = (rh: RH) => {
    setEditingRh(rh);
    setIsEditModalOpen(true);
    };

  const handleDetails = (rh: RH) => {
    router.push(`/dashboard/RH/${rh.id}`);
  };
  
  return (
        <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <HeaderFinal onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      {/* Sidebar en position fixe sous le header */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-md z-50 transition-all duration-300
            ${isSidebarOpen ? "w-64" : "w-16"}`}
        >
        <SidebarFinal isOpen={isSidebarOpen} />
        </div>

      {/* Main content avec marge si sidebar ouvert */}
      <main className={`p-6 transition-all mt-16 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Titre */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-blue-600">Ressources Humaines</h1>
          <p className="text-gray-500 mt-1">Gérez les utilisateurs RH</p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6">
            <RhsToolbar
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onNouveau={() => setIsModalOpen(true)}
            />
        </div>

        {/* Table */}
        <RhsTable
          rhs={paginated}
          loading={loading}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onToggleActive={toggleActiveRH}
          onModifier={handleModifier}
          onDetails={handleDetails}
        />

        {/* Pagination avec espace */}
        <div className="mt-4">
            <RhsPagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </main>

      {/* Modal création */}
      <RhCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchRhs();
        }}
      />
      <RhEditModal
        rh={editingRh}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
            setIsEditModalOpen(false);
            fetchRhs(); 
        }}
        />
    </div>
  );
}