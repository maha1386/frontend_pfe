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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
}

export function SidebarFinal({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collabTotal, setCollabTotal] = useState<string>("0");

  useEffect(() => {
    setCollabTotal(localStorage.getItem("collaborateurs_total") ?? "0");
  }, []);

  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [
        { icon: Home, label: "Tableau de bord", href: "/dashboard" },
        { icon: Users, label: "Collaborateurs", href: "/dashboard/collaborateur", badge: collabTotal },
        { icon: FolderOpen, label: "Projets", href: "/dashboard/projets", badge: "12" },
      ],
    },
    {
      title: "GESTION",
      items: [
        { icon: Calendar, label: "Calendrier", href: "/dashboard/calendrier" },
        { icon: FileText, label: "Documents", href: "/dashboard/documents" },
        { icon: Mail, label: "Messages", href: "/dashboard/messages", badge: "3" },
        { icon: Users, label: "Ressources Humaines", href: "/dashboard/RH" },
      ],
    },
    {
      title: "SYSTÈME",
      items: [
        { icon: BarChart3, label: "Rapports", href: "/dashboard/rapports" },
        { icon: Settings, label: "Paramètres", href: "/dashboard/parametres" },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bg-white border-r border-gray-200 shadow-sm transition-all duration-300
      ${isOpen ? "w-64" : "w-20"}
      h-[calc(100vh-4rem)]`}
    >
      <nav className="pt-3 pb-3 w-full">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">

            {isOpen && (
              <h3 className="text-xs font-bold text-gray-400 px-4 mb-2 tracking-wider">
                {section.title}
              </h3>
            )}

            <ul className="space-y-1">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={i}>
                <Link
                href={item.href}
                className={`relative flex items-center py-3 rounded-xl transition-all duration-300
                    ${isOpen ? "gap-3 px-4" : "justify-center"}
                    ${isActive
                    ? "bg-gray-300 text-gray-900" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                <Icon className="w-5 h-5 flex-shrink-0" />

                {isOpen && (
                    <>
                    <span className="text-sm font-medium whitespace-nowrap flex-1">
                        {item.label}
                    </span>

                    {item.badge && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white">
                        {item.badge}
                        </span>
                    )}
                    </>
                )}

                {/* Barre orange à droite */}
                {isActive && (
                    <span className="absolute top-0 right-0 h-full w-1 rounded-l-full bg-gradient-to-b from-orange-500 to-red-600"></span>
                )}
                </Link>
                  </li>
                );
              })}
            </ul>

          </div>
        ))}
      </nav>
    </aside>
  );
}