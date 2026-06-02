"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle,
  ChevronDown, ChevronUp, UserCircle2,
} from "lucide-react";
import { useOnboarding } from "../../../hooks/onboarding/useOnboarding2";
import { Task, TaskType } from "../../../types/onboarding";

const STATUS_LABEL: Record<string, string> = {
  en_attente:    "En attente",
  en_cours:      "En cours",
  en_validation: "En validation",
  termine:       "Terminé",
};

const STATUS_CLASS: Record<string, string> = {
  en_attente:    "bg-gray-100 text-gray-600",
  en_cours:      "bg-blue-100 text-blue-700",
  en_validation: "bg-amber-100 text-amber-700",
  termine:       "bg-green-100 text-green-700",
};

const TYPE_CLASS: Record<TaskType, string> = {
  technique:     "bg-purple-100 text-purple-700",
  administratif: "bg-amber-100 text-amber-700",
  humain:        "bg-pink-100 text-pink-700",
  formation:     "bg-indigo-100 text-indigo-700",
};

const TYPE_LABEL: Record<TaskType, string> = {
  technique:     "Technique",
  administratif: "Administratif",
  humain:        "Humain",
  formation:     "Formation",
};

function TaskCard({
  task,
  highlighted,
}: {
  task: Task & { responsable?: { first_name: string; last_name: string } };
  highlighted?: boolean;
}) {
  return (
    <div
      id={`task-${task.id}`}
      className={`flex items-start gap-3 p-4 bg-white border rounded-xl hover:border-gray-200 transition-colors ${
        highlighted ? "border-blue-400 ring-2 ring-blue-300" : "border-gray-100"
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        {task.status === "termine" ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : task.status === "en_cours" ? (
          <Clock className="w-5 h-5 text-blue-500" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {task.day_name && (
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 block">
            {task.day_name.charAt(0).toUpperCase() + task.day_name.slice(1).toLowerCase()}
          </span>
        )}
        <p className={`text-sm font-medium ${task.status === "termine" ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.task_title}
        </p>
        {task.objective && (
          <p className="text-xs text-gray-400 mt-0.5">{task.objective}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[task.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABEL[task.status] ?? task.status}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_CLASS[task.type]}`}>
            {TYPE_LABEL[task.type]}
          </span>
          {task.deadline && (
            <span className="text-xs text-gray-400">
              {new Date(task.deadline).toLocaleDateString("fr-FR")}
            </span>
          )}
          {task.responsable && (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
              <UserCircle2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
              {task.responsable.first_name} {task.responsable.last_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WeekBlock({
  weekNumber,
  tasks,
  highlightedTaskId,
}: {
  weekNumber: number;
  tasks: Task[];
  highlightedTaskId?: number | null;
}) {
  const [open, setOpen] = useState(true);
  const done = tasks.filter((t) => t.status === "termine").length;
  const sorted = [...tasks].sort(
    (a, b) => new Date(a.deadline ?? 0).getTime() - new Date(b.deadline ?? 0).getTime()
  );

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Semaine {weekNumber}</span>
          <span className="text-xs text-gray-400">{done}/{tasks.length} terminées</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="p-3 space-y-2">
          {sorted.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              highlighted={t.id === highlightedTaskId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManagerOnboardingDetailPage() {
  const { id }          = useParams();
  const router          = useRouter();
  const searchParams    = useSearchParams();
  const taskIdParam     = searchParams.get("task");
  const highlightedTaskId = taskIdParam ? Number(taskIdParam) : null;

  const { onboarding, progression, loading, error } = useOnboarding(Number(id));
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  // ✅ Ouvre le bon mois et scrolle vers la tâche
  useEffect(() => {
    if (!highlightedTaskId || !onboarding) return;
    const task = onboarding.tasks.find((t) => t.id === highlightedTaskId);
    if (task) {
      setExpandedMonths((prev) => ({ ...prev, [task.month_number]: true }));
      setTimeout(() => {
        const el = document.getElementById(`task-${highlightedTaskId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightedTaskId, onboarding]);

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

  const grouped = onboarding.tasks.reduce<Record<number, Record<number, Task[]>>>(
    (acc, task) => {
      if (!acc[task.month_number]) acc[task.month_number] = {};
      if (!acc[task.month_number][task.week_number]) acc[task.month_number][task.week_number] = [];
      acc[task.month_number][task.week_number].push(task);
      return acc;
    },
    {}
  );

  const toggleMonth = (m: number) =>
    setExpandedMonths((prev) => ({ ...prev, [m]: !prev[m] }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
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
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            onboarding.status === "valide" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {onboarding.status === "valide" ? "✓ Validé" : "En attente de validation"}
          </span>
        </div>
      </div>

      {/* Progression */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progression globale</span>
          <span className="text-2xl font-bold text-blue-600">{progression}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progression}%` }} />
        </div>
        {onboarding.status === "valide" && onboarding.validatedBy && (
          <p className="text-xs text-gray-400 mt-2">
            Validé par {onboarding.validatedBy.first_name} {onboarding.validatedBy.last_name}
            {onboarding.validated_at && <> le {new Date(onboarding.validated_at).toLocaleDateString("fr-FR")}</>}
          </p>
        )}
      </div>

      {/* Mois → Semaines → Tâches */}
      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([monthStr, weeks]) => {
            const month    = Number(monthStr);
            const allTasks = Object.values(weeks).flat();
            const done     = allTasks.filter((t) => t.status === "termine").length;
            const pct      = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
            const isOpen   = expandedMonths[month] ?? false;

            const dates   = allTasks.map((t) => t.deadline).filter(Boolean) as string[];
            const minDate = dates.length ? new Date(Math.min(...dates.map((d) => new Date(d).getTime()))) : null;
            const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => new Date(d).getTime()))) : null;
            const fmtDate = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

            return (
              <div key={month} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {month}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">Mois {month}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pct === 100 ? "bg-green-100 text-green-700" :
                          pct > 0    ? "bg-blue-100 text-blue-700"   :
                                       "bg-gray-100 text-gray-500"
                        }`}>
                          {pct === 100 ? "Terminé" : pct > 0 ? "En cours" : "Non démarré"}
                        </span>
                      </div>
                      {minDate && maxDate && (
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(minDate)} — {fmtDate(maxDate)}</p>
                      )}
                      <p className="text-xs text-gray-400">{done}/{allTasks.length} tâches terminées</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-600">{pct}%</span>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-3">
                    {Object.entries(weeks)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([weekStr, tasks]) => (
                        <WeekBlock
                          key={weekStr}
                          weekNumber={Number(weekStr)}
                          tasks={tasks}
                          highlightedTaskId={highlightedTaskId}
                        />
                      ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}