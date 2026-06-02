"use client";

import { useState, useRef, useEffect } from "react";
import {
  IntegrationPlanResponse,
  Phase,
  Task,
  TaskComment,
  TaskStatus,
} from "../../app/types/integration.types";
import {
  updateMyTask,
  addTaskComment,
  deleteTaskComment,
} from "../../app/services/integration.service";

// ── Constantes ───────────────────────────────────────────────

const JOURS_ORDER = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "en_attente",    label: "En attente",    color: "#6b7280" },
  { value: "en_cours",      label: "En cours",      color: "#2563eb" },
  { value: "en_validation", label: "En validation", color: "#d97706" },
  { value: "termine",       label: "Terminé",       color: "#16a34a" },
];

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; dot: string }> = {
  en_attente:    { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
  en_cours:      { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  en_validation: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  termine:       { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  rejetee:       { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

// ── Helpers ──────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function dayIndex(day: string | null) {
  if (!day) return 99;
  return JOURS_ORDER.indexOf(day.toLowerCase());
}

function dayLabel(day: string | null) {
  if (!day) return null;
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

function phaseStatusLabel(s: string) {
  if (s === "completed")   return { label: "Terminé",     bg: "#dcfce7", color: "#166534" };
  if (s === "in-progress") return { label: "En cours",    bg: "#dbeafe", color: "#1d4ed8" };
  return                          { label: "Non démarré", bg: "#f3f4f6", color: "#6b7280" };
}

// ── Sous-composant : CommentForm ─────────────────────────────

function CommentForm({ taskId, onAdded }: { taskId: number; onAdded: () => void }) {
  const [content, setContent] = useState("");
  const [link, setLink]       = useState("");
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const fileRef               = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!content.trim() && !link.trim() && !file) {
      setError("Ajoutez un commentaire, un lien ou un fichier.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addTaskComment(taskId, {
        content:    content.trim() || undefined,
        link:       link.trim()    || undefined,
        attachment: file ?? undefined,
      });
      setContent(""); setLink(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onAdded();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12, padding: "12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Ajouter un commentaire</p>
      <textarea
        value={content} onChange={e => setContent(e.target.value)}
        placeholder="Décrivez votre avancement, ajoutez des notes..." rows={3}
        style={{ width: "100%", fontSize: 13, padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
      />
      <input type="url" value={link} onChange={e => setLink(e.target.value)}
        placeholder="Lien Git, PR, Notion... (optionnel)"
        style={{ width: "100%", marginTop: 8, fontSize: 13, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, boxSizing: "border-box" }}
      />
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ fontSize: 12, padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#374151" }}>
          📎 Joindre un fichier
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>
        {file && <span style={{ fontSize: 12, color: "#6b7280", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>}
        {file && <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>✕</button>}
      </div>
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{error}</p>}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={submit} disabled={loading}
          style={{ fontSize: 13, padding: "6px 16px", borderRadius: 6, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}

// ── Sous-composant : CommentList ─────────────────────────────

function CommentList({ comments, onDelete }: { comments: TaskComment[]; onDelete: (id: number) => void }) {
  if (!comments || comments.length === 0) return null;
  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {comments.map(c => (
        <div key={c.id} style={{ padding: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontWeight: 500, color: "#374151" }}>{c.author?.name ?? "Moi"}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(c.created_at.slice(0, 10))}</span>
              <button onClick={() => onDelete(c.id)} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
          </div>
          {c.content && <p style={{ margin: "6px 0 0", color: "#374151", lineHeight: 1.5 }}>{c.content}</p>}
          {c.link && (
            <a href={c.link} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, color: "#2563eb" }}>
              🔗 {c.link.length > 60 ? c.link.slice(0, 60) + "…" : c.link}
            </a>
          )}
          {c.has_attachment && c.download_url && (
            <a href={c.download_url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, color: "#059669" }}>
              📄 {c.attachment_name ?? "Fichier joint"}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Sous-composant : WeekSection ─────────────────────────────

function WeekSection({ weekNum, weekTasks, children }: {
  weekNum:   number;
  weekTasks: Task[];
  children:  React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const done = weekTasks.filter(t => t.completed).length;

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          padding: "8px 14px", background: "#f9fafb",
          borderBottom: open ? "1px solid #f3f4f6" : "none",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Semaine {weekNum}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{done}/{weekTasks.length} terminées</span>
          <span style={{
            fontSize: 12, color: "#9ca3af", display: "inline-block",
            transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</span>
        </div>
      </div>
      {open && (
        <ul style={{ listStyle: "none", margin: 0, padding: "8px", display: "flex", flexDirection: "column", gap: 6 }}>
          {children}
        </ul>
      )}
    </div>
  );
}

// ── Sous-composant : TaskRow ──────────────────────────────────

function TaskRow({
  task, highlight, onStatusChange, onCommentAdded, onCommentDeleted,
}: {
  task:             Task;
  highlight?:       boolean;
  onStatusChange:   (taskId: number, status: TaskStatus) => Promise<void>;
  onCommentAdded:   (taskId: number) => void;
  onCommentDeleted: (taskId: number, commentId: number) => void;
}) {
  const [expanded, setExpanded]           = useState(highlight ?? false);
  const [statusLoading, setStatusLoading] = useState(false);
  const rowRef                            = useRef<HTMLLIElement>(null);
  const dl = dayLabel(task.day_name);
  const s  = STATUS_STYLE[task.status] ?? STATUS_STYLE.en_attente;

  useEffect(() => {
    if (highlight && rowRef.current) {
      setTimeout(() => rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    }
  }, [highlight]);

  const handleStatus = async (newStatus: TaskStatus) => {
    setStatusLoading(true);
    await onStatusChange(task.id, newStatus);
    setStatusLoading(false);
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteTaskComment(commentId);
      onCommentDeleted(task.id, commentId);
    } catch (e) { console.error(e); }
  };

  return (
    <li ref={rowRef} id={`task-${task.id}`} style={{
      border: highlight ? "2px solid #2563eb" : task.rejection_reason ? "1px solid #fecaca" : "1px solid #e5e7eb",
      borderRadius: 8, overflow: "hidden", transition: "box-shadow .3s",
      boxShadow: highlight ? "0 0 0 3px #dbeafe" : "none",
    }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
          background: highlight ? "#eff6ff" : task.status === "termine" ? "#f9fafb" : task.rejection_reason ? "#fff5f5" : "#fff",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Jour */}
        <div style={{ width: 60, flexShrink: 0 }}>
          {dl && (
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "#2563eb" }}>
              {dl}
            </span>
          )}
        </div>

        {/* Titre */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: 14,
            textDecoration: task.status === "termine" ? "line-through" : "none",
            color: task.status === "termine" ? "#9ca3af" : "#111827",
            fontWeight: highlight ? 600 : 400,
          }}>
            {task.title}
            {highlight && <span style={{ marginLeft: 8, fontSize: 11, color: "#2563eb", fontWeight: 500 }}>← depuis l'agenda</span>}
          </span>
          {/* Raison rejet inline sous le titre */}
          {task.rejection_reason && (
            <p style={{ fontSize: 11, color: "#b91c1c", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
              ⚠️ Rejeté : {task.rejection_reason}
            </p>
          )}
        </div>

        {/* Select statut — rejetee masqué du select collaborateur */}
        <div onClick={e => e.stopPropagation()}>
          <select
            disabled={statusLoading}
            value={task.status === "rejetee" ? "en_cours" : task.status}
            onChange={e => handleStatus(e.target.value as TaskStatus)}
            style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.dot}`, cursor: "pointer", appearance: "none" }}
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Date */}
        {task.due_date && (
          <span style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{fmtDate(task.due_date)}</span>
        )}

        {/* Responsable */}
        {task.responsable && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
            background: "#eff6ff", color: "#2563eb",
            border: "1px solid #bfdbfe", borderRadius: 20,
            padding: "2px 8px", flexShrink: 0,
          }}>
            👤 {task.responsable.first_name} {task.responsable.last_name}
          </span>
        )}

        {/* Chevron */}
        <span style={{ fontSize: 12, color: "#9ca3af", transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "none" }}>▼</span>
      </div>

      {expanded && (
        <div style={{ padding: "4px 12px 12px", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>

          {/* Bannière rejet détaillée */}
          {task.rejection_reason && (
            <div style={{
              margin: "8px 0 12px",
              padding: "10px 12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderLeft: "3px solid #ef4444",
              borderRadius: 8,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", margin: "0 0 2px" }}>
                  Tâche rejetée par le responsable
                </p>
                <p style={{ fontSize: 13, color: "#7f1d1d", margin: 0 }}>
                  {task.rejection_reason}
                </p>
              </div>
            </div>
          )}

          <CommentList comments={task.comments ?? []} onDelete={handleDelete} />
          <CommentForm taskId={task.id} onAdded={() => onCommentAdded(task.id)} />
        </div>
      )}
    </li>
  );
}

// ── Composant principal ───────────────────────────────────────

interface Props {
  plan:             IntegrationPlanResponse;
  onRefresh?:       () => void;
  highlightTaskId?: number | null;
  avisSection?:     React.ReactNode;
}

export function IntegrationPlanComponent({ plan, onRefresh, highlightTaskId, avisSection }: Props) {
  const [phases, setPhases] = useState<Phase[]>(plan?.phases ?? []);

  useEffect(() => { setPhases(plan?.phases ?? []); }, [plan]);

  const totalTasks     = phases.flatMap(p => p.tasks).length;
  const completedTasks = phases.flatMap(p => p.tasks).filter(t => t.completed).length;
  const globalProgress = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : (plan?.progression ?? 0);

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    await updateMyTask(taskId, status);
    setPhases(prev =>
      prev
        .map(ph => ({
          ...ph,
          tasks: ph.tasks.map(t =>
            t.id !== taskId ? t : { ...t, status, completed: status === "termine", rejection_reason: null }
          ),
        }))
        .map(ph => {
          const done     = ph.tasks.filter(t => t.completed).length;
          const total    = ph.tasks.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;
          const s        = progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started";
          return { ...ph, progress, status: s };
        })
    );
  };

  const handleCommentAdded = (_taskId: number) => { onRefresh?.(); };

  const handleCommentDeleted = (taskId: number, commentId: number) => {
    setPhases(prev =>
      prev.map(ph => ({
        ...ph,
        tasks: ph.tasks.map(t =>
          t.id === taskId ? { ...t, comments: (t.comments ?? []).filter(c => c.id !== commentId) } : t
        ),
      }))
    );
  };

  return (
    <div style={{ display: "flex", gap: 24, padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "sans-serif", alignItems: "flex-start" }}>

      {/* ══ Colonne principale ══ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* En-tête global */}
        <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>Mon plan d'intégration</h1>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{fmtDate(plan.start_date)} — {fmtDate(plan.end_date)}</p>
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#2563eb" }}>{globalProgress}%</span>
          </div>
          <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${globalProgress}%`, background: "#2563eb", borderRadius: 99, transition: "width .4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: "#6b7280" }}>
            <span><strong style={{ color: "#111827" }}>{completedTasks}</strong> / {totalTasks} tâches complétées</span>
            {plan.jours_left > 0 && <span>{plan.jours_left} jours restants</span>}
          </div>
        </section>

        {/* Phases → Semaines → Tâches */}
        {phases.map(phase => {
          const ps = phaseStatusLabel(phase.status);

          const tasksSorted = [...(phase.tasks ?? [])].sort((a, b) => {
            const wDiff = (a.week_number ?? 0) - (b.week_number ?? 0);
            if (wDiff !== 0) return wDiff;
            return dayIndex(a.day_name) - dayIndex(b.day_name);
          });

          const byWeek = tasksSorted.reduce<Record<number, Task[]>>((acc, task) => {
            const w = task.week_number ?? 0;
            if (!acc[w]) acc[w] = [];
            acc[w].push(task);
            return acc;
          }, {});

          return (
            <section key={phase.phase} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "#6b7280" }}>
                      {phase.phase}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: ps.bg, color: ps.color }}>
                      {ps.label}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 2px" }}>{phase.title}</h2>
                  {(phase.start_date || phase.end_date) && (
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                      {fmtDate(phase.start_date)} — {fmtDate(phase.end_date)}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#2563eb" }}>{phase.progress}%</div>
                  <div style={{ marginTop: 4, width: 80, height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${phase.progress}%`, background: "#2563eb", borderRadius: 99 }} />
                  </div>
                </div>
              </div>

              {Object.entries(byWeek)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([weekStr, weekTasks]) => (
                  <WeekSection key={weekStr} weekNum={Number(weekStr)} weekTasks={weekTasks}>
                    {weekTasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        highlight={task.id === highlightTaskId}
                        onStatusChange={handleStatusChange}
                        onCommentAdded={handleCommentAdded}
                        onCommentDeleted={handleCommentDeleted}
                      />
                    ))}
                  </WeekSection>
                ))
              }
            </section>
          );
        })}
      </main>

      {/* ══ Sidebar droite ══ */}
      <aside style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>Rendez-vous planifiés</h3>
          {plan.meetings && plan.meetings.length > 0
            ? null
            : <p style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", margin: 0 }}>Aucun rendez-vous planifié.</p>
          }
        </section>

        {avisSection && <div>{avisSection}</div>}

        {plan.action_requise && (
          <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderLeft: "3px solid #f59e0b", borderRadius: 12, padding: 20, display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Action requise</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px" }}>{plan.action_requise.description}</p>
              {plan.action_requise.link && (
                <a href={plan.action_requise.link} style={{ fontSize: 13, color: "#d97706" }}>
                  {plan.action_requise.link_label ?? "Accéder"} →
                </a>
              )}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}