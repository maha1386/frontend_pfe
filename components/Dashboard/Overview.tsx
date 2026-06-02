"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserDashboard } from "../../app/types/dashboard.types"
import { FileCheck, Users, Calendar, MoreHorizontal, X } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from "recharts"

interface OverviewProps {
  dashboard: UserDashboard
}

type FilterType = "Tous" | string

export function Overview({ dashboard }: OverviewProps) {
  const router = useRouter()
  const { user, documents, formations, overall_progress, days_remaining, recent_activities, upcoming_events } = dashboard

  const [filterType, setFilterType]           = useState<FilterType>("Tous")
  const [dropdownOpen, setDropdownOpen]       = useState(false)
  const [agendaModalOpen, setAgendaModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const eventTypes: FilterType[] = [
    "Tous",
    ...Array.from(new Set(upcoming_events.map(e => e.type))).filter(Boolean)
  ]

  const filteredEvents = upcoming_events
    .filter(e => filterType === "Tous" || e.type === filterType)
    .slice(0, 3)

  const allEventsSorted = [...upcoming_events]
    .filter(e => filterType === "Tous" || e.type === filterType)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const progressionData = [
    { semaine: "S1", taux: Math.round(overall_progress * 0.2) },
    { semaine: "S2", taux: Math.round(overall_progress * 0.4) },
    { semaine: "S3", taux: Math.round(overall_progress * 0.6) },
    { semaine: "S4", taux: Math.round(overall_progress * 0.8) },
    { semaine: "S5", taux: overall_progress },
  ]

  const today = new Date()
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(today.getDate() - 3)

  const recentActivitiesFiltered = recent_activities.filter(act => {
    const actDate = new Date(act.date)
    return actDate >= threeDaysAgo && actDate <= today
  })

  function dotColor(type: string): string {
    switch (type?.toLowerCase()) {
      case "formation": return "bg-green-500"
      case "réunion":   return "bg-purple-500"
      case "technique": return "bg-orange-500"
      default:          return "bg-blue-600"
    }
  }

  function statusBadge(status: string) {
    if (status === "Complété" || status === "signed")  return "bg-green-100 text-green-700"
    if (status === "En validation")                    return "bg-yellow-100 text-yellow-700"
    return "bg-blue-100 text-blue-700"
  }

  return (
    <div className="space-y-6">

      {/* ── Welcome ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border p-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bonjour, {user.first_name} {user.last_name}</h1>
          <p className="text-slate-600 mt-1">Bienvenue sur votre espace collaborateur</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 font-medium">Progression d'intégration</p>
          <p className="text-3xl font-semibold text-blue-600 mt-1">{overall_progress}%</p>
        </div>
      </div>

      {/* ── Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600">Documents traités</p>
              <p className="text-2xl font-semibold mt-2">{documents.completed}/{documents.total}</p>
              <span className="text-sm text-green-600 font-medium">{documents.progress}%</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileCheck className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600">Formations suivies</p>
              <p className="text-2xl font-semibold mt-2">{formations.completed}/{formations.total}</p>
              <span className="text-sm text-blue-600 font-medium">{formations.progress}%</span>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600">Jours restants</p>
              <p className="text-2xl font-semibold mt-2">{Math.floor(days_remaining)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Calendar className="text-orange-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Indicateurs de performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[
              { label: "Documents", total: documents.total, completed: documents.completed },
              { label: "Formations", total: formations.total, completed: formations.completed },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="total" fill="#94a3b8" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#3b82f6" name="Complété" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Progression d'intégration</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semaine" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="taux" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} name="Taux de progression" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Activités + Agenda ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activités récentes */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Activités récentes (3 derniers jours)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentActivitiesFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                      Aucune activité ces 3 derniers jours
                    </td>
                  </tr>
                ) : (
                  recentActivitiesFiltered.map((act, idx) => (
                    <tr key={`activity-${act.date}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm">{act.type}</td>
                      <td className="py-3 px-4 text-sm">{act.description}</td>
                      <td className="py-3 px-4 text-sm">
                        {act.date}
                        {act.time && (
                          <span className="text-xs text-slate-400 ml-2">{act.time}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusBadge(act.status)}`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Agenda ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Agenda</h3>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Filtrer par type"
              >
                <MoreHorizontal size={20} className="text-slate-400" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-10 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                  <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Filtrer par type
                  </p>
                  {eventTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => { setFilterType(type); setDropdownOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2
                        ${filterType === type
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {filterType === type && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                      )}
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Badge filtre actif */}
          {filterType !== "Tous" && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                {filterType}
                <button onClick={() => setFilterType("Tous")} className="hover:text-blue-900">
                  <X size={11} />
                </button>
              </span>
            </div>
          )}

          {/* Liste événements — 3 max dans l'aperçu */}
          <div className="space-y-3 flex-1">
            {filteredEvents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                Aucun événement{filterType !== "Tous" ? ` "${filterType}"` : ""}
              </p>
            ) : (
              filteredEvents.map((event, idx) => (
                <div
                  key={event.id != null ? `event-${event.id}` : `event-idx-${idx}`}
                  onClick={() => router.push(`/dashboardc/integration?taskId=${event.id}`)}
                  className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor(event.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate group-hover:text-blue-700 transition-colors">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{event.type}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar size={11} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-600">{event.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setAgendaModalOpen(true)}
            className="w-full mt-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
          >
            Voir l'agenda complet
          </button>
        </div>
      </div>

      {/* ── Modal agenda complet ─────────────────────────────────── */}
      {agendaModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setAgendaModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Agenda complet</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {allEventsSorted.length} événement{allEventsSorted.length > 1 ? "s" : ""} à venir · trié par date
                </p>
              </div>
              <button
                onClick={() => setAgendaModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Filtres pills */}
            <div className="px-6 pt-4 flex gap-2 flex-wrap">
              {eventTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border
                    ${filterType === type
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Liste scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
              {allEventsSorted.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10">Aucun événement</p>
              ) : (
                allEventsSorted.map((event, idx) => (
                  <div
                    key={event.id != null ? `modal-event-${event.id}` : `modal-idx-${idx}`}
                    onClick={() => {
                      setAgendaModalOpen(false)
                      router.push(`/dashboardc/integration?taskId=${event.id}`)
                    }}
                    className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotColor(event.type)}`} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-slate-500">{event.type}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <div className="flex items-center gap-1">
                            <Calendar size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-600">{event.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}