import { UserDashboard } from "../../app/types/dashboard.types"
import { FileCheck, Users, TrendingUp, Target, Calendar, MoreHorizontal } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

interface OverviewProps {
  dashboard: UserDashboard
}

export function Overview({ dashboard }: OverviewProps) {
  const { user, documents, formations, overall_progress, days_remaining, recent_activities, upcoming_events } = dashboard

  // Progression hebdomadaire (exemple simple)
  const progressionData = [
    { semaine: "S1", taux: overall_progress * 0.2 },
    { semaine: "S2", taux: overall_progress * 0.4 },
    { semaine: "S3", taux: overall_progress * 0.6 },
    { semaine: "S4", taux: overall_progress * 0.8 },
    { semaine: "S5", taux: overall_progress },
  ]

  // Filtrer les activités des 3 derniers jours
  const today = new Date()
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(today.getDate() - 3)

  const recentActivitiesFiltered = recent_activities.filter(act => {
    const actDate = new Date(act.date)
    return actDate >= threeDaysAgo && actDate <= today
  })

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
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

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Documents */}
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

        {/* Formations */}
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

        {/* Jours restants */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart: Documents vs Formations */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Indicateurs de performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                { label: "Documents", total: documents.total, completed: documents.completed },
                { label: "Formations", total: formations.total, completed: formations.completed },
              ]}
            >
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

        {/* LineChart: Progression */}
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

      {/* Bottom Section: Activités récentes et Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes (3 derniers jours) */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Activités récentes (3 derniers jours)</h3>
          </div>
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
                {recentActivitiesFiltered.map((act, idx) => (
                  // FIX: key doit être sur l'élément racine retourné par map
                  <tr key={`activity-${act.date}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">{act.type}</td>
                    <td className="py-3 px-4">{act.description}</td>
                    <td className="py-3 px-4">{act.date} <span className="text-xs text-slate-400 ml-2">{act.time}</span></td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        act.status === "Complété" || act.status === "signed"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>{act.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agenda / Upcoming Events */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Agenda</h3>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreHorizontal size={20} className="text-slate-400" />
            </button>
          </div>
          <div className="space-y-4">
            {upcoming_events.map((event, idx) => (
              // FIX: key avec fallback sur idx si event.id est undefined
              <div
                key={event.id != null ? `event-${event.id}` : `event-idx-${idx}`}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{event.type}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">{event.date}</span>
                    </div>
                    <p className="text-xs text-blue-600 font-medium mt-1">{event.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm">
            Voir l'agenda complet
          </button>
        </div>
      </div>
    </div>
  )
}