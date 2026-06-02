"use client";

import { useMesSuivis } from "@/app/hooks/useMesSuivis";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList, Calendar, MessageSquare,
  ChevronDown, ChevronUp, User, Loader2, ExternalLink, Send, Paperclip, Link,
} from "lucide-react";
import {
  SuiviTask, SuiviComment,
  addSuiviComment, downloadAttachment, updateSuiviTaskStatus,
} from "@/app/services/suivis.service";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:       { label: "En attente",    className: "bg-gray-100 text-gray-600" },
  in_progress:   { label: "En cours",      className: "bg-blue-100 text-blue-700" },
  en_cours:      { label: "En cours",      className: "bg-blue-100 text-blue-700" },
  en_validation: { label: "En validation", className: "bg-yellow-100 text-yellow-700" },
  completed:     { label: "Complété",      className: "bg-green-100 text-green-700" },
  termine:       { label: "Terminé",       className: "bg-green-100 text-green-700" },
  rejected:      { label: "Rejeté",        className: "bg-red-100 text-red-700" },
  rejetee:       { label: "Rejeté",        className: "bg-red-100 text-red-700" },
  en_attente:    { label: "En attente",    className: "bg-gray-100 text-gray-600" },
};

const typeColor: Record<string, string> = {
  formation: "bg-green-500",
  réunion:   "bg-purple-500",
  technique: "bg-orange-500",
  document:  "bg-blue-500",
};

const RESPONSABLE_STATUSES = [
  { value: "en_cours",      label: "En cours"      },
  { value: "en_validation", label: "En validation" },
  { value: "termine",       label: "Terminé"       },
  { value: "rejetee",       label: "Rejeter"       },
];

export default function MesSuivisPage() {
  const { tasks, loading, error } = useMesSuivis();

  const [expandedId,      setExpandedId]      = useState<number | null>(null);
  const [search,          setSearch]          = useState("");
  const [filterStatus,    setFilterStatus]    = useState("Tous");
  const [localComments,   setLocalComments]   = useState<Record<number, SuiviComment[]>>({});
  const [newComment,      setNewComment]      = useState<Record<number, string>>({});
  const [newLink,         setNewLink]         = useState<Record<number, string>>({});
  const [newFile,         setNewFile]         = useState<Record<number, File | null>>({});
  const [submitting,      setSubmitting]      = useState<number | null>(null);
  const [submitError,     setSubmitError]     = useState<Record<number, string>>({});
  const [downloading,     setDownloading]     = useState<number | null>(null);
  const [statusUpdating,  setStatusUpdating]  = useState<number | null>(null);
  const [localStatuses,   setLocalStatuses]   = useState<Record<number, string>>({});
  const [pendingReject,   setPendingReject]   = useState<number | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});

  const router   = useRouter();
  const statuses = ["Tous", ...Array.from(new Set(tasks.map(t => t.status)))];

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
      || t.collaborateur.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tous" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const goToTask = (e: React.MouseEvent, task: SuiviTask) => {
    e.stopPropagation();
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      const role = user?.role?.name ?? user?.role ?? "";
      if (role === "manager") {
        router.push(`/dashboardm/onboarding/${task.onboarding_id}?task=${task.id}`);
      } else {
        router.push(`/dashboard/onboarding/${task.onboarding_id}?task=${task.id}`);
      }
    } catch {
      router.push(`/dashboard/onboarding/${task.onboarding_id}?task=${task.id}`);
    }
  };

  const getComments = (task: SuiviTask): SuiviComment[] =>
    localComments[task.id] ?? task.comments;

  const handleStatusChange = async (task: SuiviTask, newStatus: string) => {
    if (newStatus === "rejetee") {
      setPendingReject(task.id);
      return;
    }
    setStatusUpdating(task.id);
    try {
      await updateSuiviTaskStatus(task.id, newStatus);
      setLocalStatuses(prev => ({ ...prev, [task.id]: newStatus }));
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleConfirmReject = async (task: SuiviTask) => {
    const reason = rejectionReasons[task.id]?.trim();
    if (!reason) return;
    setStatusUpdating(task.id);
    try {
      await updateSuiviTaskStatus(task.id, "rejetee", reason);
      setLocalStatuses(prev => ({ ...prev, [task.id]: "rejetee" }));
      setPendingReject(null);
      setRejectionReasons(prev => ({ ...prev, [task.id]: "" }));
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleAddComment = async (task: SuiviTask) => {
    const content = newComment[task.id]?.trim();
    const link    = newLink[task.id]?.trim();
    const file    = newFile[task.id] ?? undefined;

    if (!content && !link && !file) return;

    setSubmitting(task.id);
    setSubmitError(prev => ({ ...prev, [task.id]: "" }));

    try {
      const comment = await addSuiviComment(task.id, content, link, file);
      setLocalComments(prev => ({
        ...prev,
        [task.id]: [...(prev[task.id] ?? task.comments), comment],
      }));
      setNewComment(prev => ({ ...prev, [task.id]: "" }));
      setNewLink(prev    => ({ ...prev, [task.id]: "" }));
      setNewFile(prev    => ({ ...prev, [task.id]: null }));
    } catch (e) {
      setSubmitError(prev => ({
        ...prev,
        [task.id]: e instanceof Error ? e.message : "Erreur lors de l'envoi",
      }));
    } finally {
      setSubmitting(null);
    }
  };

  const handleDownload = async (comment: SuiviComment) => {
    if (!comment.download_url) return;
    setDownloading(comment.id);
    try {
      await downloadAttachment(comment.download_url, comment.attachment_name ?? "fichier");
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-500">{error}</div>
  );

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="bg-white rounded-lg border p-6 flex items-center gap-4">
        <div className="p-3 bg-orange-50 rounded-lg">
          <ClipboardList className="text-orange-500" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes Suivis</h1>
          <p className="text-slate-500 text-sm mt-0.5">Tâches dont vous êtes responsable de suivi</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-semibold text-orange-500">{tasks.length}</p>
          <p className="text-xs text-slate-500">tâche{tasks.length > 1 ? "s" : ""} assignée{tasks.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par titre ou collaborateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? "bg-orange-500 text-white border-orange-500"
                  : "text-slate-600 border-slate-200 hover:border-orange-300"
              }`}
            >
              {s === "Tous" ? "Tous" : statusConfig[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-slate-400">Aucune tâche trouvée</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const isOpen        = expandedId === task.id;
            const currentStatus = localStatuses[task.id] ?? task.status;
            const status        = statusConfig[currentStatus] ?? { label: currentStatus, className: "bg-gray-100 text-gray-600" };
            const dotColor      = typeColor[task.type?.toLowerCase()] ?? "bg-blue-500";
            const comments      = getComments(task);

            return (
              <div key={task.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">

                {/* Row */}
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : task.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User size={11} />{task.collaborateur}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar size={11} />{task.due_date}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{task.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">

                    {/* Select statut */}
                    <select
                      value={pendingReject === task.id ? "rejetee" : currentStatus}
                      disabled={statusUpdating === task.id}
                      onChange={e => handleStatusChange(task, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none disabled:opacity-50 ${status.className}`}
                    >
                      {RESPONSABLE_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    {statusUpdating === task.id && (
                      <Loader2 size={13} className="animate-spin text-orange-400" />
                    )}

                    {/* Champ raison rejet */}
                    {pendingReject === task.id && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          autoFocus
                          placeholder="Raison du rejet..."
                          value={rejectionReasons[task.id] ?? ""}
                          onChange={e => setRejectionReasons(prev => ({ ...prev, [task.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") handleConfirmReject(task); }}
                          className="border border-red-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400 w-40"
                        />
                        <button
                          onClick={() => handleConfirmReject(task)}
                          disabled={!rejectionReasons[task.id]?.trim() || statusUpdating === task.id}
                          className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 rounded-lg"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => {
                            setPendingReject(null);
                            setRejectionReasons(prev => ({ ...prev, [task.id]: "" }));
                          }}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Annuler
                        </button>
                      </div>
                    )}

                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MessageSquare size={13} />{comments.length}
                    </span>

                    <button
                      onClick={e => goToTask(e, task)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <ExternalLink size={11} />Voir
                    </button>

                    {isOpen
                      ? <ChevronUp size={16} className="text-slate-400" />
                      : <ChevronDown size={16} className="text-slate-400" />
                    }
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">

                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Commentaires ({comments.length})
                    </p>

                    {comments.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-2">Aucun commentaire</p>
                    ) : (
                      <div className="space-y-2">
                        {comments.map(c => (
                          <div key={c.id} className="bg-white rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-700">{c.user}</span>
                              <span className="text-xs text-slate-400">
                                {new Date(c.created_at).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            {c.content && (
                              <p className="text-sm text-slate-600">{c.content}</p>
                            )}
                            {c.link && (
                              <a href={c.link} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 mt-1.5 text-xs text-blue-500 hover:underline">
                                <Link size={11} />
                                {c.link.length > 60 ? c.link.slice(0, 60) + "…" : c.link}
                              </a>
                            )}
                            {c.has_attachment && c.download_url && (
                              <button
                                onClick={() => handleDownload(c)}
                                disabled={downloading === c.id}
                                className="flex items-center gap-1 mt-1.5 text-xs text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
                              >
                                {downloading === c.id
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <Paperclip size={11} />
                                }
                                {c.attachment_name ?? "Fichier joint"}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulaire commentaire */}
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        placeholder="Ajouter un commentaire..."
                        value={newComment[task.id] ?? ""}
                        onChange={e => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(task); } }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none bg-white"
                      />
                      <input
                        type="url"
                        placeholder="Lien Git, PR, Notion... (optionnel)"
                        value={newLink[task.id] ?? ""}
                        onChange={e => setNewLink(prev => ({ ...prev, [task.id]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                          <Paperclip size={12} />Joindre un fichier
                          <input type="file" className="hidden"
                            onChange={e => setNewFile(prev => ({ ...prev, [task.id]: e.target.files?.[0] ?? null }))}
                          />
                        </label>
                        {newFile[task.id] && (
                          <>
                            <span className="text-xs text-slate-500 truncate max-w-[150px]">{newFile[task.id]!.name}</span>
                            <button
                              onClick={() => setNewFile(prev => ({ ...prev, [task.id]: null }))}
                              className="text-xs text-red-400 hover:text-red-600"
                            >✕</button>
                          </>
                        )}
                        <button
                          onClick={() => handleAddComment(task)}
                          disabled={
                            submitting === task.id ||
                            (!newComment[task.id]?.trim() && !newLink[task.id]?.trim() && !newFile[task.id])
                          }
                          className="ml-auto px-3 py-1.5 text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-lg transition-colors"
                        >
                          {submitting === task.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                      </div>
                    </div>

                    {submitError[task.id] && (
                      <p className="text-xs text-red-500">{submitError[task.id]}</p>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={e => goToTask(e, task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                      >
                        <ExternalLink size={12} />Ouvrir le plan d'intégration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}