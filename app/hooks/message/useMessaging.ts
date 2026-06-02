// hooks/message/useMessaging.ts

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  getUnreadCount,
  Conversation,
  Message,
} from "../../services/messaging.service";

export function useMessaging() {
  const [conversations, setConversations]           = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages]                     = useState<Message[]>([]);
  const [totalUnread, setTotalUnread]               = useState(0);
  const [draft, setDraft]                           = useState("");
  const [loadingConvs, setLoadingConvs]             = useState(true);
  const [loadingMsgs, setLoadingMsgs]               = useState(false);
  const [sending, setSending]                       = useState(false);
  const [error, setError]                           = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConversationRef = useRef<Conversation | null>(null);
  activeConversationRef.current = activeConversation;

  const prevMsgCountRef = useRef(0);

  // 1. fetchConversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  // 2. fetchUnreadCount
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setTotalUnread(count);
    } catch {}
  }, []);

  // 3. fetchMessages
    const fetchMessages = useCallback(async (conversationId: number, scrollDown = true) => {
      setLoadingMsgs(true);
      try {
        const data = await getMessages(conversationId, 1);
        // Récupère toutes les pages
        let allMessages = [...(data.data ?? [])];
        for (let page = 2; page <= data.last_page; page++) {
          const more = await getMessages(conversationId, page);
          allMessages = [...allMessages, ...(more.data ?? [])];
        }
        const sorted = allMessages.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sorted);
        prevMsgCountRef.current = sorted.length;
        if (scrollDown) {
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoadingMsgs(false);
      }
    }, []);

  // 4. openConversation
  const openConversation = useCallback(async (conv: Conversation) => {
    setActiveConversation(conv);
    await fetchMessages(conv.id);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
    );
    await fetchUnreadCount();
  }, [fetchMessages, fetchUnreadCount]);

  // 5. Polling — 5s, scroll uniquement si nouveau message
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();

    const interval = setInterval(async () => {
      fetchConversations();
      fetchUnreadCount();

      const current = activeConversationRef.current;
      if (current) {
        try {
          const data = await getMessages(current.id);
          const sorted = [...(data.data ?? [])].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          const hasNew = sorted.length > prevMsgCountRef.current;
          prevMsgCountRef.current = sorted.length;

          setMessages(sorted);

          if (hasNew) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          }
        } catch {}
      }
    }, 5_000);

    return () => clearInterval(interval);
  }, [fetchConversations, fetchUnreadCount]);

  // 6. handleSend
  const handleSend = useCallback(async () => {
    if (!draft.trim() || !activeConversation || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeConversation.id, draft);
      setMessages((prev) => {
        const updated = [...prev, msg];
        prevMsgCountRef.current = updated.length;
        return updated;
      });
      setDraft("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      await fetchConversations();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSending(false);
    }
  }, [draft, activeConversation, sending, fetchConversations]);

  // 7. startConversation (RH → collaborateur)
  const startConversation = useCallback(async (collaborateurId: number) => {
    try {
      const { conversation_id } = await createConversation(collaborateurId);
      const all = await getConversations();
      setConversations(all);
      const conv = all.find((c) => c.id === conversation_id);
      if (conv) await openConversation(conv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }, [openConversation]);

  // 8. startConversationAsCollaborateur
  const startConversationAsCollaborateur = useCallback(async () => {
    try {
      const { conversation_id } = await createConversation();
      const all = await getConversations();
      setConversations(all);
      const conv = all.find((c) => c.id === conversation_id);
      if (conv) await openConversation(conv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }, [openConversation]);

  return {
    conversations,
    activeConversation,
    messages,
    totalUnread,
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
  };
}

// Hook léger pour le badge seul (utilisé dans HeaderFinal)
export function useMessageBadge() {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnread(count);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { unread };
}