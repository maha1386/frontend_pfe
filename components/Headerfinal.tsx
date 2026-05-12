"use client";

import { Menu, Bell, Mail, ChevronDown, LogOut, Loader2, Check, CheckCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "../app/hooks/use-notificatin";
import { useMessageBadge } from "../app/hooks/message/useMessaging";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  role?: string;
}

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen?: boolean;
}

export function HeaderFinal({ onMenuToggle }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [user, setUser]                 = useState<User | null>(null);
  const [loadingUser, setLoadingUser]   = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);
  const router   = useRouter();

  const { unread: unreadMessages } = useMessageBadge();

  const {
    notifications,
    unreadCount: unreadNotifs,
    loading: loadingNotifs,
    handleMarquerLue,
    handleMarquerToutesLues,
    handleSupprimer,
  } = useNotifications();

  // Fermer panel notifs si clic extérieur
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoadingUser(false);
        const res = await fetch("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          // ✅ merge role depuis localStorage si API ne le retourne pas
          if (!data.role) {
            const cached = JSON.parse(localStorage.getItem("user") ?? "{}");
            data.role = cached.role;
          }
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          router.push("/login");
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
    localStorage.removeItem("user");
    document.cookie = "auth_token=; path=/; max-age=0";
    router.push("/login");
  };

  const handleNotifClick = async (notif: { id: number | string; is_read: boolean }) => {
    if (!notif.is_read) await handleMarquerLue(notif.id as number);
  };

  const formatDate = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)    return "À l'instant";
    if (diff < 3600)  return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const typeIcon = (type: string) => {
    if (type === "task_en_validation") return "📋";
    if (type === "task_rejected")      return "❌";
    if (type === "new_message")        return "💬";
    return "🔔";
  };

  // ✅ helper centralisé pour le routage par rôle
  const getMessagesRoute = () => {
    const role = user?.role ?? JSON.parse(localStorage.getItem("user") ?? "{}").role;
    const isRHorManager = role === "rh" || role === "manager";
    return isRHorManager ? "/dashboard/messages" : "/dashboardc/messages";
  };

  const initials = user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() : "?";
  const fullName = user ? `${user.first_name} ${user.last_name}` : "";

  return (
    <header className="h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 flex items-center px-6 gap-6 shadow-lg z-50 relative">

      <button onClick={onMenuToggle} className="p-2 hover:bg-white/10 rounded-lg transition-all">
        <Menu className="w-6 h-6 text-white" />
      </button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-0.5 flex items-center justify-center overflow-hidden">
          <Image src="/images/maisonduweb_logo.jpg" alt="Logo" width={40} height={40} sizes="40px" className="rounded-xl object-cover" />
        </div>
        <h1 className="text-xl font-bold text-white">Maison du Web</h1>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">

        {/* Messages */}
        <button
          onClick={() => router.push(getMessagesRoute())}
          className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group"
        >
          <Mail className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-medium">
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group"
          >
            <Bell className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-br from-orange-500 to-red-600 items-center justify-center text-white text-xs font-medium">
                  {unreadNotifs > 99 ? "99+" : unreadNotifs}
                </span>
              </span>
            )}
          </button>

          {/* Panel notifications */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                 style={{ maxHeight: "480px" }}>

              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                  {unreadNotifs > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadNotifs} non lues
                    </span>
                  )}
                </div>
                {unreadNotifs > 0 && (
                  <button
                    onClick={handleMarquerToutesLues}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout marquer lu
                  </button>
                )}
              </div>

              {/* Liste */}
              <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
                {loadingNotifs ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Bell className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer
                          ${!notif.is_read ? "bg-indigo-50/60 hover:bg-indigo-50" : "hover:bg-gray-50"}`}
                        onClick={() => handleNotifClick({ id: notif.id as unknown as number, is_read: notif.is_read })}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">
                          {typeIcon(notif.type)}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.is_read ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notif.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarquerLue(notif.id); }}
                              className="p-1 text-indigo-400 hover:text-indigo-600 rounded transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSupprimer(notif.id); }}
                            className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-white/20 mx-2" />

        {/* Profil */}
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
            <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
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