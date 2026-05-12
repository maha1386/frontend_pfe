"use client";

// components/messaging/MessageBadge.tsx
// À insérer dans HeaderFinal à côté de votre icône de notification existante

import Link from "next/link";
import { useMessageBadge } from "../../app/hooks/message/useMessaging";

interface MessageBadgeProps {
  /** Chemin vers la page messagerie selon le rôle : '/dashboard/messages' ou '/dashboardc/messages' */
  href: string;
}

export function MessageBadge({ href }: MessageBadgeProps) {
  const { unread } = useMessageBadge();

  return (
    <Link
      href={href}
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
      aria-label={`Messagerie${unread > 0 ? ` — ${unread} non lus` : ""}`}
    >
      {/* Icône mail — même style que votre icône existante */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>

      {/* Badge rouge */}
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}