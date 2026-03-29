"use client";

import {
  Users,
  FolderOpen,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Home,
  Mail,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;

}

export function SidebarFinal({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collabTotal, setCollabTotal] = useState<string>("0");
  const [role, setRole] = useState<"rh" | "manager">("rh");
  
  useEffect(() => {
    const update = () => {
      setCollabTotal(localStorage.getItem("collaborateurs_total") ?? "0");
    };
    update();
    window.addEventListener("collaborateurs_total_updated", update);
    return () => window.removeEventListener("collaborateurs_total_updated", update);
  }, []);

  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { icon: Home, label: 'Tableau de bord', href: '/dashboard/document' },
        { icon: Users, label: 'Collaborateurs', href: '/dashboard/collaborateur', badge: collabTotal },
        { icon: Shield, label: 'Rôles', href: '/dashboard/roles'},
        { icon: FolderOpen, label: 'Projets', href: '/dashboard/projets', badge: '12' },
      ],
    },
    {
      title: 'GESTION',
      items: [
        { icon: Calendar, label: 'Calendrier', href: '/dashboard/calendrier' },
        { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
        { icon: Mail, label: 'Messages', href: '/dashboard/messages', badge: '3' },
      ],
    },
    {
      title: 'SYSTÈME',
      items: [
        { icon: BarChart3, label: 'Rapports', href: '/dashboard/rapports' },
        { icon: Settings, label: 'Paramètres', href: '/dashboard/parametres' },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 overflow-hidden shadow-sm group/sidebar hover:w-72 ${
        isOpen ? 'w-20' : 'w-0'
      }`}
    >
      <nav className="p-3 w-72">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 px-4 mb-2 tracking-wider opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full opacity-0 group-hover/sidebar:opacity-100 transition-opacity" />
                      )}

                      <Icon className="w-5 h-5 flex-shrink-0" />

                      <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 flex-1">
                        {item.label}
                      </span>

                      {item.badge && item.badge !== "0" && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
          <p className="text-xs font-bold text-gray-700 mb-1">Astuce du jour</p>
          <p className="text-xs text-gray-600">Utilisez les filtres rapides pour gagner du temps !</p>
        </div>
      </nav>
    </aside>
  );
}