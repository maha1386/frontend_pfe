"use client";

// components/messaging/MessagingInbox.tsx

import { useRef, KeyboardEvent, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMessaging } from "../../app/hooks/message/useMessaging";
import {
  Conversation,
  Message,
  CollaborateurSearch,
  searchCollaborateurs,
} from "../../app/services/messaging.service";

interface MessagingInboxProps {
  isRH?: boolean;
  defaultCollaborateurId?: number;
}

export function MessagingInbox({ isRH = false, defaultCollaborateurId }: MessagingInboxProps) {
  const {
    conversations,
    activeConversation,
    messages,
    draft,
    setDraft,
    loadingConvs,
    loadingMsgs,
    sending,
    error,
    bottomRef,
    openConversation,
    handleSend,
    startConversation,
    startConversationAsCollaborateur,
  } = useMessaging();

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchParams = useSearchParams();

  const autoOpenDone = useRef(false);

  useEffect(() => {
    if (autoOpenDone.current) return;
    if (conversations.length === 0) return;

    const convId = searchParams.get("conversation");
    if (!convId) return;

    const conv = conversations.find((c) => c.id === Number(convId));
    if (conv) {
      autoOpenDone.current = true;
      openConversation(conv);
    }
  }, [conversations]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getCurrentUserId = (): number => {
    if (typeof window === "undefined") return 0;
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      return user.id ?? 0;
    } catch {
      return 0;
    }
  };

  const myId = getCurrentUserId();

  const initials = (p: { first_name: string; last_name: string }) =>
    ((p.first_name?.[0] ?? "") + (p.last_name?.[0] ?? "")).toUpperCase();

  const relativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)    return "À l'instant";
    if (diff < 3600)  return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const conversationExists = (collabId: number): boolean =>
    conversations.some((c) => c.other.id === collabId);

  const handleSelectCollaborateur = (collab: CollaborateurSearch) => {
    setShowSearchModal(false);
    if (conversationExists(collab.id)) {
      const existing = conversations.find((c) => c.other.id === collab.id);
      if (existing) openConversation(existing);
    } else {
      startConversation(collab.id);
    }
  };

  return (
    <>
      <div className="flex h-full border border-gray-200 rounded-2xl rounded-2xl overflow-hidden bg-white shadow-sm">

        {/* Panneau gauche */}
        <aside className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Messages</h2>
            {isRH && (
              <button
                onClick={() => setShowSearchModal(true)}
                title="Nouvelle conversation"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {!isRH && conversations.length === 0 && (
            <div className="px-4 py-2 border-b border-gray-100">
              <button
                onClick={startConversationAsCollaborateur}
                className="w-full text-xs text-indigo-600 hover:text-indigo-800 font-medium text-left transition-colors"
              >
                + Contacter mon responsable RH
              </button>
            </div>
          )}

          <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingConvs ? (
              <li className="px-4 py-8 text-center text-sm text-gray-400">Chargement…</li>
            ) : conversations.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-gray-400">Aucun message</li>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConversation?.id === conv.id}
                  onOpen={openConversation}
                  initials={initials}
                  relativeTime={relativeTime}
                />
              ))
            )}
          </ul>
        </aside>

        {/* Panneau droit : chat */}
        <main className="flex-1 flex flex-col min-w-0">
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Header conversation */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {initials(activeConversation.other)}
                </div>
                <p className="font-medium text-gray-800 text-sm">
                  {activeConversation.other.first_name} {activeConversation.other.last_name}
                </p>
              </div>
              {/* Zone messages */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 flex flex-col" style={{ gap: "6px" }}>
                {loadingMsgs ? (
                  <p className="text-center text-sm text-gray-400 my-auto">Chargement…</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 my-auto">Aucun message — commencez la conversation !</p>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isMe={msg.sender_id === myId}
                      relativeTime={relativeTime}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {error && <p className="px-5 py-1 text-xs text-red-500 bg-red-50">{error}</p>}

              {/* Zone saisie — textarea limité en hauteur */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-3 flex-shrink-0">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Écrire un message… (Entrée pour envoyer)"
                  disabled={sending}
                  className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition disabled:opacity-50 max-h-24 overflow-y-auto"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sending}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-medium transition flex items-center gap-2"
                >
                  {sending ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                  Envoyer
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {showSearchModal && (
        <SearchCollaborateurModal
          existingConversations={conversations}
          onSelect={handleSelectCollaborateur}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </>
  );
}

// ── Modal recherche collaborateur ─────────────────────────────────────────────

function SearchCollaborateurModal({
  existingConversations,
  onSelect,
  onClose,
}: {
  existingConversations: Conversation[];
  onSelect: (c: CollaborateurSearch) => void;
  onClose: () => void;
}) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<CollaborateurSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchCollaborateurs(query.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasConversation = (id: number) =>
    existingConversations.some((c) => c.other.id === id);

  const initials = (c: CollaborateurSearch) =>
    ((c.first_name?.[0] ?? "") + (c.last_name?.[0] ?? "")).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Nouvelle conversation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un collaborateur…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>
        </div>

        <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <li className="px-5 py-6 text-center text-sm text-gray-400">Recherche…</li>
          ) : query.trim().length < 2 ? (
            <li className="px-5 py-6 text-center text-sm text-gray-400">Tapez au moins 2 caractères</li>
          ) : results.length === 0 ? (
            <li className="px-5 py-6 text-center text-sm text-gray-400">Aucun collaborateur trouvé</li>
          ) : (
            results.map((collab) => {
              const exists = hasConversation(collab.id);
              return (
                <li
                  key={collab.id}
                  onClick={() => onSelect(collab)}
                  className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                    {initials(collab)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{collab.first_name} {collab.last_name}</p>
                    <p className="text-xs text-gray-400 truncate">{collab.email}</p>
                  </div>
                  {exists
                    ? <span className="text-xs text-indigo-500 font-medium flex-shrink-0">Voir conversation</span>
                    : <span className="text-xs text-emerald-500 font-medium flex-shrink-0">+ Démarrer</span>
                  }
                </li>
              );
            })
          )}
        </ul>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Les conversations existantes seront réouvertes</p>
        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function ConversationItem({
  conv, isActive, onOpen, initials, relativeTime,
}: {
  conv: Conversation;
  isActive: boolean;
  onOpen: (c: Conversation) => void;
  initials: (p: { first_name: string; last_name: string }) => string;
  relativeTime: (d: string) => string;
}) {
  return (
    <li
      onClick={() => onOpen(conv)}
      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${isActive ? "bg-indigo-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
          {initials(conv.other)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-medium text-gray-800 truncate">
              {conv.other.first_name} {conv.other.last_name}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {conv.last_message ? relativeTime(conv.last_message.created_at) : ""}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {conv.last_message?.body ?? "Démarrer la conversation"}
          </p>
        </div>
        {conv.unread_count > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-medium">
            {conv.unread_count}
          </span>
        )}
      </div>
    </li>
  );
}

function MessageBubble({
  msg, isMe, relativeTime,
}: {
  msg: Message;
  isMe: boolean;
  relativeTime: (d: string) => string;
}) {
  return (
    <div className={`flex items-end gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[72%] px-3 py-2 text-sm leading-relaxed
          ${isMe
            ? "bg-indigo-600 text-white rounded-2xl rounded-br-[4px]"
            : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-[4px]"
          }
        `}
        style={{ wordBreak: "break-word" }}
      >
        <p className="whitespace-pre-wrap">{msg.body}</p>
        <p className={`text-[10px] mt-0.5 text-right ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
          {relativeTime(msg.created_at)}
          {isMe && msg.read_at && <span className="ml-1">✓✓</span>}
        </p>
      </div>
    </div>
  );
}