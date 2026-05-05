"use client";

import {
  FileText,
  Home,
  BarChart3,
  Settings,
  CalendarCheck,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  href: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function SidebarCollaborateur({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuCollaborateur: MenuSection[] = [
    {
      title: "PRINCIPAL",
      items: [
        { icon: Home, label: "Tableau de bord", href: "/dashboardc/dashboardcollab" },
        { icon: FileText, label: "Mes documents", href: "/dashboardc/mesdocuments" },
      ],
    },
    {
      title: "SYSTÈME",
      items: [
        { icon: BookOpen, label: "Formations", href: "/dashboardc/formation" },
        { icon: CalendarCheck, label: "Paramètres", href: "/dashboardc/integration" },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 overflow-hidden shadow-sm group/sidebar hover:w-72 ${
        isOpen ? "w-20" : "w-0"
      }`}
    >
      <nav className="p-3 w-72">
        {menuCollaborateur.map((section, sectionIndex) => (
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
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />

                      <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 flex-1">
                        {item.label}
                      </span>

                      {item.badge && item.badge !== "0" && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
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
      </nav>
    </aside>
  );
}