"use client";

import { useState, useEffect } from 'react';
import { HeaderFinal } from '../../components/HeaderFinal';
import { SidebarFinal } from '../../components/SidebarFinal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Lire l'état depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_open");
    if (saved !== null) setIsSidebarOpen(saved === "true");
  }, []);

  // ✅ Sauvegarder à chaque changement
  const handleToggle = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem("sidebar_open", String(next));
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderFinal
        onMenuToggle={handleToggle}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <SidebarFinal isOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}