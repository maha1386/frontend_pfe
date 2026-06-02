"use client";

import { useState } from 'react';
import { HeaderFinal } from '../../components/HeaderFinal';
import { SidebarFinal } from '../../components/SidebarFinal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header fixe en haut */}
      <HeaderFinal
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Corps : Sidebar + Contenu */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarFinal isOpen={isSidebarOpen} />

          {/* Zone de contenu principale */}
        <main className="flex-1 overflow-hidden min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>);
}