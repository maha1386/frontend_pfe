"use client";

import { useState } from "react";
import {
  Users, UserCheck, UserX, FileText,
  TrendingUp, Clock, Plus, Upload,
  Loader2, AlertCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useDashboard } from "../hooks/dashboard/use-dashboard";
import { HeaderFinal } from "../../components/Headerfinal";
import { SidebarFinal } from "../../components/Sidebarfinal";
import { useRouter } from "next/navigation";

// ─── Couleurs dynamiques pour pie chart ──────────────────────────────────────
function getRoleColor(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

// ─── Card statistique 
function StatCard({
  icon: Icon, label, value, color, sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Timeline activité ────────────────────────────────────────────────────────
function TimelineItem({ type, message, date }: { type: string; message: string; date: string }) {
  const isCollab = type === "collaborateur";
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isCollab ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
      }`}>
        {isCollab ? <Users className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 font-medium">{message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{date}</p>
      </div>
    </div>
  );
}

// ─── Page principale ─
export default function DashboardPage() {
  const { data, loading, error } = useDashboard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-6 py-6">
        {data && (
          <div className="space-y-6">

            {/* ── Cards statistiques ── */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total collaborateurs"
                value={data.stats.total_collaborateurs}
                color="bg-blue-500"
              />
              <StatCard
                icon={UserCheck}
                label="Collaborateurs actifs"
                value={data.stats.collaborateurs_actifs}
                color="bg-emerald-500"
              />
              <StatCard
                icon={UserX}
                label="Collaborateurs inactifs"
                value={data.stats.collaborateurs_inactifs}
                color="bg-red-400"
              />
              <StatCard
                icon={FileText}
                label="Documents en attente"
                value={data.stats.documents_en_attente}
                color="bg-orange-500"
                sub="Signature requise"
              />
            </div>

            {/* ── Graphiques ── */}
            <div className="grid grid-cols-2 gap-6">

              {/* Bar chart — nouveaux par mois */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-bold text-gray-800">Nouveaux collaborateurs / mois</h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.nouveaux_par_mois}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} name="Collaborateurs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart — répartition rôles */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h2 className="text-base font-bold text-gray-800">Répartition par rôle</h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.repartition_roles}
                      dataKey="total"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ role, percent }) =>
                        `${role} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    >
                      {data.repartition_roles.map((entry, index) => (
                        <Cell key={index} fill={getRoleColor(entry.role)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Activité récente + Actions rapides ── */}
            <div className="grid grid-cols-3 gap-6">

              {/* Activité récente */}
              <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <h2 className="text-base font-bold text-gray-800">Activité récente</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.activite_recente.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Aucune activité récente</p>
                  ) : (
                    data.activite_recente.map((item, index) => (
                      <TimelineItem
                        key={index}
                        type={item.type}
                        message={item.message}
                        date={item.date}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Actions rapides</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/dashboard/collaborateur")}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un collaborateur
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/documents")}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Ajouter un document
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/roles")}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl transition-colors text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    Gérer les rôles
                  </button>
                </div>

                {/* Taux onboarding */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Taux d'onboarding</p>
                    <p className="text-sm font-bold text-orange-500">
                      {data.stats.total_collaborateurs > 0
                        ? Math.round((data.stats.collaborateurs_actifs / data.stats.total_collaborateurs) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${data.stats.total_collaborateurs > 0
                          ? Math.round((data.stats.collaborateurs_actifs / data.stats.total_collaborateurs) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {data.stats.collaborateurs_actifs} actifs sur {data.stats.total_collaborateurs}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}