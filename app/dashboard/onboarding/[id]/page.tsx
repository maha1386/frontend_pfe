"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle,
  ChevronDown, ChevronUp, Pencil, Trash2, Plus
} from "lucide-react";
import { useOnboarding } from "../../../hooks/onboarding/useOnboarding2";
import { Task, TaskStatus, TaskType } from "../../../types/onboarding";

// ── Helpers ───────────────────────────────────────────────
const STATUS_LABEL: Record<TaskStatus, string> = {
  en_attente: "En attente",
  en_cours:   "En cours",
  termine:    "Terminé",
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  en_attente: "bg-gray-100 text-gray-600",
  en_cours:   "bg-blue-100 text-blue-700",
  termine:    "bg-green-100 text-green-700",
};

const TYPE_CLASS: Record<TaskType, string> = {
  technique:      "bg-purple-100 text-purple-700",
  administratif:  "bg-amber-100 text-amber-700",
  humain:         "bg-pink-100 text-pink-700",
};

// ── EditTaskModal ─────────────────────────────────────────
function EditTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (data: Partial<Task>) => Promise<void>;
}) {
  const [title, setTitle]       = useState(task.task_title);
  const [objective, setObj]     = useState(task.objective ?? "");
  const [deadline, setDeadline] = useState(task.deadline);
  const [type, setType]         = useState<TaskType>(task.type);
  const [status, setStatus]     = useState<TaskStatus>(task.status);
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({ task_title: title, objective, deadline, type, status });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Modifier la tâche</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Objectif</label>
            <textarea
              value={objective}
              onChange={(e) => setObj(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technique">Technique</option>
                <option value="administratif">Administratif</option>
                <option value="humain">Humain</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TaskCard ──────────────────────────────────────────────
function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors group">
      <div className="mt-0.5">
        {task.status === "termine" ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : task.status === "en_cours" ? (
          <Clock className="w-4 h-4 text-blue-500" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === "termine" ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.task_title}
        </p>
        {task.objective && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.objective}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_CLASS[task.type]}`}>
            {task.type}
          </span>
          {task.deadline && (
            <span className="text-xs text-gray-400">
              {new Date(task.deadline).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── WeekBlock ─────────────────────────────────────────────
function WeekBlock({
  weekNumber,
  tasks,
  onEdit,
  onDelete,
}: {
  weekNumber: number;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const done = tasks.filter((t) => t.status === "termine").length;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Semaine {weekNumber}
          </span>
          <span className="text-xs text-gray-400">
            {done}/{tasks.length} terminées
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="p-3 space-y-2">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────
export default function OnboardingDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    onboarding, progression, loading, error,
    valider, updateTask, deleteTask,
  } = useOnboarding(Number(id));

  const [editTask, setEditTask]         = useState<Task | null>(null);
  const [validating, setValidating]     = useState(false);
  const [validNotes, setValidNotes]     = useState("");
  const [showValidModal, setShowValidModal] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Chargement du plan...
      </div>
    );
  }

  if (error || !onboarding) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error ?? "Onboarding introuvable"}
      </div>
    );
  }

  // Grouper par mois → semaine
  const grouped = onboarding.tasks.reduce<Record<number, Record<number, Task[]>>>(
    (acc, task) => {
      if (!acc[task.month_number]) acc[task.month_number] = {};
      if (!acc[task.month_number][task.week_number])
        acc[task.month_number][task.week_number] = [];
      acc[task.month_number][task.week_number].push(task);
      return acc;
    },
    {}
  );

  const toggleMonth = (m: number) =>
    setExpandedMonths((prev) => ({ ...prev, [m]: !prev[m] }));

  const handleValider = async () => {
    try {
      setValidating(true);
      await valider(validNotes);
      setShowValidModal(false);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              {onboarding.user.first_name} {onboarding.user.last_name}
            </h1>
            <p className="text-gray-500 mt-1">Plan d'intégration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Statut global */}
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              onboarding.status === "valide"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {onboarding.status === "valide" ? "✓ Validé" : "En attente de validation"}
          </span>

          {/* Bouton valider */}
          {onboarding.status !== "valide" && (
            <button
              onClick={() => setShowValidModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Valider l'onboarding
            </button>
          )}
        </div>
      </div>

      {/* ── Progression ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progression globale</span>
          <span className="text-2xl font-bold text-blue-600">{progression}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progression}%` }}
          />
        </div>
        {onboarding.status === "valide" && onboarding.validatedBy && (
          <p className="text-xs text-gray-400 mt-2">
            Validé par {onboarding.validatedBy.first_name} {onboarding.validatedBy.last_name}
            {onboarding.validated_at && (
              <> le {new Date(onboarding.validated_at).toLocaleDateString("fr-FR")}</>
            )}
          </p>
        )}
      </div>

      {/* ── Timeline mois ── */}
      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([monthStr, weeks]) => {
            const month = Number(monthStr);
            const allTasks = Object.values(weeks).flat();
            const done = allTasks.filter((t) => t.status === "termine").length;
            const isOpen = expandedMonths[month] ?? false;

            return (
              <div key={month} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Header mois */}
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      {month}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Mois {month}</p>
                      <p className="text-xs text-gray-400">
                        {done}/{allTasks.length} tâches terminées
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${allTasks.length ? (done / allTasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Semaines */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-3">
                    {Object.entries(weeks)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([weekStr, tasks]) => (
                        <WeekBlock
                          key={weekStr}
                          weekNumber={Number(weekStr)}
                          tasks={tasks}
                          onEdit={setEditTask}
                          onDelete={(taskId) => deleteTask(taskId)}
                        />
                      ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* ── Modal modifier tâche ── */}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSave={(data) => updateTask(editTask.id, { ...data, objective: data.objective ?? undefined })}
        />
      )}

      {/* ── Modal validation ── */}
      {showValidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Valider l'onboarding
            </h2>
            <p className="text-sm text-gray-500">
              Confirmez-vous la validation du plan d'intégration de{" "}
              <strong>{onboarding.user.first_name} {onboarding.user.last_name}</strong> ?
            </p>
            <div>
              <label className="text-xs font-medium text-gray-500">
                Notes (optionnel)
              </label>
              <textarea
                value={validNotes}
                onChange={(e) => setValidNotes(e.target.value)}
                rows={3}
                placeholder="Commentaires sur le plan..."
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowValidModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleValider}
                disabled={validating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {validating ? "Validation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}