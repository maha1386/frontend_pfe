"use client";

import { Menu, Bell, Mail, ChevronDown, LogOut, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen?: boolean;
}

export function HeaderFinal({ onMenuToggle }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoadingUser(false);

        const res = await fetch("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Erreur fetch user:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://127.0.0.1:8000/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    localStorage.removeItem("token");
    document.cookie = "auth_token=; path=/; max-age=0";
    router.push("/login");
  };

  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 flex items-center px-6 gap-6 shadow-lg z-50">
      {/* Bouton Menu */}
      <button
        onClick={onMenuToggle}
        className="p-2 hover:bg-white/10 rounded-lg transition-all"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Logo + Titre */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-0.5 flex items-center justify-center overflow-hidden">
          <Image
            src="/images/maisonduweb_logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-xl object-cover"
          />
        </div>
        <h1 className="text-xl font-bold text-white">Maison du Web</h1>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Messages */}
        <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group">
          <Mail className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-full" />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group">
          <Bell className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
          <span className="absolute top-1.5 right-1.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-br from-orange-500 to-red-600 items-center justify-center text-white text-xs font-medium">
              3
            </span>
          </span>
        </button>

        <div className="h-8 w-px bg-white/20 mx-2" />

        {/* Profil + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center ring-2 ring-white/20">
              {loadingUser ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <span className="text-white text-sm font-semibold">{initials}</span>
              )}
            </div>

            <div className="text-left">
              {loadingUser ? (
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
                  <div className="h-2 w-32 bg-white/10 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-white">{fullName}</p>
                  <p className="text-xs text-white/60">{user?.email}</p>
                </>
              )}
            </div>

            <ChevronDown
              className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Connecté en tant que</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}