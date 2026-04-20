"use client";
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Target,
  User,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import { IntegrationPlanResponse, IntegrationPhase, IntegrationTask, PhaseStatus } from "../../app/types/integration.types";

type IntegrationPlanProps = {
  plan: IntegrationPlanResponse;
};

export function IntegrationPlanComponent({ plan }: IntegrationPlanProps) {
  const [integrationPhases, setIntegrationPhases] = useState(plan.phases);
  const totalTasks = integrationPhases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = integrationPhases.reduce(
    (acc, phase) => acc + phase.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  const upcomingMeetings = [
    { id: 1, title: "Point d'avancement manager", date: "05 Avril 2026", time: "14:00", attendees: "Sophie M., Manager RH" },
    { id: 2, title: "Session mentorat", date: "08 Avril 2026", time: "10:00", attendees: "Sophie M., Tuteur" },
    { id: 3, title: "Réunion équipe", date: "10 Avril 2026", time: "09:00", attendees: "Équipe complète" },
  ];
    const toggleTask = (taskId: number) => {
        const updatedPhases = integrationPhases.map((phase) => {
            const updatedTasks = phase.tasks.map((task) =>
            task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            );

            const completedCount = updatedTasks.filter((t) => t.completed).length;
            const progress = Math.round(
            (completedCount / updatedTasks.length) * 100
            );

            let status: PhaseStatus;

            if (progress === 100) status = "completed";
            else if (progress > 0) status = "in-progress";
            else status = "not-started";

            return {
            ...phase,
            tasks: updatedTasks,
            progress,
            status,
            };
        });

        setIntegrationPhases(updatedPhases);
        };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Plan d'intégration</h1>
        <p className="text-slate-600 mt-1">Suivez votre parcours d'intégration sur 30 jours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {integrationPhases.map((phase: IntegrationPhase) => (
            <div key={phase.phase} className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      phase.status === "completed"
                        ? "bg-green-100"
                        : phase.status === "in-progress"
                        ? "bg-blue-100"
                        : "bg-slate-100"
                    }`}
                  >
                    {phase.status === "completed" ? (
                      <CheckCircle2 className="text-green-600" size={24} />
                    ) : phase.status === "in-progress" ? (
                      <Clock className="text-blue-600" size={24} />
                    ) : (
                      <Circle className="text-slate-400" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{phase.phase}</h3>
                    <p className="text-sm text-slate-600 mt-1">{phase.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                      phase.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : phase.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {phase.progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                <div
                  className={`h-2 rounded-full transition-all ${
                    phase.status === "completed"
                      ? "bg-green-600"
                      : phase.status === "in-progress"
                      ? "bg-blue-600"
                      : "bg-slate-300"
                  }`}
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {phase.tasks.map((task: IntegrationTask) => (
                  <div
  key={task.id}
  onClick={() => toggleTask(task.id)}
  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        task.completed
                          ? "bg-green-600 border-green-600"
                          : "border-slate-300"
                      }`}
                    >
                      {task.completed && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <span
                      className={`flex-1 text-sm ${
                        task.completed
                          ? "text-slate-500 line-through"
                          : "text-slate-700"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="bg-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target size={20} />
              <h3 className="font-semibold">Progression globale</h3>
            </div>
            <div className="text-4xl font-bold mb-2">{overallProgress}%</div>
            <p className="text-sm text-blue-100 mb-4">
              {completedTasks} tâches complétées sur {totalTasks}
            </p>
            <div className="w-full bg-blue-500 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: `${overallProgress}%` }}></div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-100">Temps restant</span>
                <span className="font-semibold">18 jours</span>
              </div>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Rendez-vous planifiés</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreHorizontal size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{meeting.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-600">{meeting.date}</span>
                      </div>
                      <p className="text-xs text-blue-600 font-medium mt-1">{meeting.time}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <User size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500">{meeting.attendees}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Action requise</h3>
                <p className="text-sm text-slate-600 mb-3">
                  N'oubliez pas de compléter le quiz de validation avant vendredi.
                </p>
                <button className="text-sm text-orange-600 font-medium hover:text-orange-700">
                  Accéder au quiz →
                </button>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Besoin d'aide ?</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Contacter mon tuteur
              </button>
              <button className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                Service RH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}