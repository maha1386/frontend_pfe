"use client";

import { useState } from 'react';
import { HeaderFinal } from '../../components/Headerfinal';
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
        <main className="flex-1 overflow-y-auto p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}