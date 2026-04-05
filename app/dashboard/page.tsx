"use client";

import { useRouter } from "next/navigation";
import {
  Users, UserCheck, UserX, FileText, TrendingUp, Clock,
  Plus, Upload, Bell, ChevronRight, AlertTriangle,
  BarChart2, Zap, Activity, Loader2,
} from "lucide-react";
import { useDashboard } from "../hooks/dashboard/use-dashboard";
import type {
  RepartitionRole,
  NouveauxParMois,
  ActiviteItem,
  AlerteItem,
} from "../hooks/dashboard/use-dashboard";
import { getRoleBadgeClass } from "../lib/role-colors";
import { getRoleHex } from "../lib/role-colors";


// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function todayLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Role pill ────────────────────────────────────────────────────────────────

function RolePill({ role }: { role: string }) {
  const { light, text } = getRoleBadgeClass(role.toLowerCase().trim());
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${light} ${text}`}>
      {role}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, role }: { name: string; role?: string | null }) {
  const r = role?.toLowerCase() ?? "";
  const style =
    r.includes("designer")  ? { bg: "#fce7f3", color: "#9d174d" }
    : r.includes("rh")      ? { bg: "#dbeafe", color: "#1e40af" }
    : r.includes("comptable")? { bg: "#ecfdf5", color: "#065f46" }
    : r.includes("backend") || r.includes("frontend") ? { bg: "#ede9fe", color: "#5b21b6" }
    : { bg: "#fee2e2", color: "#b91c1c" };

  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
      style={{ background: style.bg, color: style.color }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

type BadgeVariant = "blue" | "green" | "red" | "amber" | "gray";

const badgeClasses: Record<BadgeVariant, string> = {
  blue:  "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  red:   "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-800",
  gray:  "bg-slate-100 text-slate-500",
};

function KpiCard({
  icon: Icon, value, label, badge, badgeVariant = "gray",
  fillWidth, fillColor, iconBg, iconColor,
}: {
  icon: React.ElementType; value: number | string; label: string;
  badge: string; badgeVariant?: BadgeVariant;
  fillWidth: number; fillColor: string; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${badgeClasses[badgeVariant]}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-3xl font-semibold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
      <div className="h-1 bg-slate-100 rounded-full">
        <div
          className="h-1 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(Math.max(fillWidth, 0), 100)}%`, backgroundColor: fillColor }}
        />
      </div>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: NouveauxParMois[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const CHART_HEIGHT = 140;
  const ySteps = max <= 4 ? max : 4;

  return (
    <div className="mt-3 flex gap-3">
      {/* Axe Y */}
      <div className="flex flex-col justify-between items-end pb-6" style={{ height: `${CHART_HEIGHT + 24}px` }}>
        {Array.from({ length: ySteps + 1 }, (_, i) => ySteps - i).map((val) => (
          <span key={val} className="text-[10px] text-slate-400">{val}</span>
        ))}
      </div>

      {/* Barres + axe X */}
      <div className="flex-1 flex flex-col gap-0">
        {/* Zone barres avec grille */}
        <div className="relative flex items-end gap-2" style={{ height: `${CHART_HEIGHT}px` }}>
          {/* Lignes de grille horizontales */}
          {Array.from({ length: ySteps + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-dashed border-slate-200"
              style={{ bottom: `${(i / ySteps) * 100}%` }}
            />
          ))}
          {/* Barres */}
          {data.map((d, i) => {
            const barHeight = d.total > 0
              ? Math.round((d.total / max) * CHART_HEIGHT)
              : 0;
            return (
              <div key={i} className="flex-1 flex items-end justify-center relative z-10">
                {barHeight > 0 && (
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${barHeight}px`,
                      background: "#c7d2fe",
                      maxWidth: "48px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Axe X */}
        <div className="flex gap-2 mt-2">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-slate-400 whitespace-nowrap">{d.mois}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ─── Onboarding Progress (calculé depuis activite_recente) ───────────────────

function OnboardingProgress({ collaborateurs }: { collaborateurs: ActiviteItem[] }) {
  if (collaborateurs.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-4">Aucun collaborateur en cours</p>;
  }
  const items = collaborateurs.slice(0, 5).map((c, i) => ({
    ...c,
    pct: Math.max(10, 100 - i * 18),
  }));
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const name = item.message.split(" ").slice(0, 2).join(" ");
        const barColor = item.pct >= 70 ? "#22c55e" : item.pct >= 40 ? "#f59e0b" : "#ef4444";
        return (
          <div key={i} className="flex items-center gap-3">
            <Avatar name={name} role={item.role} />
            <span className="text-xs font-medium text-slate-700 w-28 truncate">{name}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${item.pct}%`, background: barColor }} />
            </div>
            <span className="text-[11px] text-slate-400 w-7 text-right">{item.pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ message, role, date }: ActiviteItem) {
  const name = message.split(" ").slice(0, 2).join(" ");
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <Avatar name={name} role={role} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-800 truncate">{message}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {role && <RolePill role={role} />}
          <span className="text-[10px] text-slate-400">{date}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Alertes dynamiques ───────────────────────────────────────────────────────

const SEVERITY_STYLES = {
  high:   { badge: "bg-red-50 text-red-700",     dot: "#ef4444" },
  medium: { badge: "bg-amber-50 text-amber-700",  dot: "#f59e0b" },
  low:    { badge: "bg-slate-100 text-slate-500", dot: "#94a3b8" },
};

function AlertsCard({ alertes }: { alertes: AlerteItem[] }) {
  const high = alertes.filter(a => a.severity === 'high').length;

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <h3 className="text-xs font-semibold text-slate-800">Alertes onboarding</h3>
        <div className="ml-auto flex gap-1">
          {high > 0 && (
            <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full">
              {high} urgent{high > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            {alertes.length} total
          </span>
        </div>
      </div>

      {alertes.length === 0 ? (
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xs text-slate-400">Aucune alerte</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-50">
          {alertes.map((a, i) => {
            const style = SEVERITY_STYLES[a.severity];
            return (
              <div key={i} className="flex items-start justify-between py-2.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                    style={{ background: style.dot }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{a.user}</p>
                    <p className="text-[10px] text-slate-400 truncate">{a.detail}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${style.badge}`}>
                  {a.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Role Distribution ────────────────────────────────────────────────────────
function RoleDistribution({ data }: { data: RepartitionRole[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  if (data.length === 0) return <p className="text-xs text-slate-400 text-center py-4">Aucune donnée</p>;
  return (
    <div className="flex flex-col gap-2.5 mt-1">
      {data.slice(0, 6).map((d, i) => {
        const hex = getRoleHex(d.role, i);
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: hex }} />
            <span className="text-xs text-slate-600 w-28 truncate">{d.role}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((d.total / max) * 100)}%`,
                  background: hex,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-400 w-4 text-right">{d.total}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────────

function DonutChart({ pct }: { pct: number }) {
  const r = 30, circ = 2 * Math.PI * r;
  const dash = Math.round((pct / 100) * circ);
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="#6366f1" strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="500" fill="#0f172a">{pct}%</text>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">Erreur de chargement</p>
          <p className="text-xs text-slate-400 mt-1">{error ?? "Données indisponibles"}</p>
        </div>
      </div>
    );
  }

  const { stats, repartition_roles, nouveaux_par_mois, activite_recente, alertes_onboarding } = data;

  const tauxOnboarding = stats.total_collaborateurs > 0
    ? Math.round((stats.collaborateurs_actifs / stats.total_collaborateurs) * 100) : 0;

  const tauxInactifs = stats.total_collaborateurs > 0
    ? Math.round((stats.collaborateurs_inactifs / stats.total_collaborateurs) * 100) : 0;

  const rolesFiltered = repartition_roles.filter(r => r.role.toLowerCase() !== "manager");

  const moisLePlusActif = nouveaux_par_mois.length > 0
    ? nouveaux_par_mois.reduce((a, b) => a.total > b.total ? a : b).mois.split(" ")[0]
    : "–";

  const nouveauxCeMois = stats.nouveaux_ce_mois ?? 0;
  const docsEnAttente  = stats.documents_en_attente ?? 0;

  const ACTIONS = [
    { href: "/dashboard/collaborateur", bg: "bg-indigo-600", hoverBorder: "hover:border-indigo-200", hoverBg: "hover:bg-indigo-50/50", icon: Plus,   label: "Ajouter un collaborateur", sub: "Créer un nouveau profil" },
    { href: "/dashboard/documents",     bg: "bg-amber-600",  hoverBorder: "hover:border-amber-200",  hoverBg: "hover:bg-amber-50/50",  icon: Upload, label: "Importer un document",    sub: "PDF, DOCX acceptés"     },
    { href: "/dashboard/roles",         bg: "bg-green-700",  hoverBorder: "hover:border-green-200",  hoverBg: "hover:bg-green-50/50",  icon: Users,  label: "Gérer les rôles",         sub: "Permissions & accès"    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 px-8 py-6 space-y-5">

        {/* Welcome */}
        <div className="bg-indigo-600 rounded-xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Bonjour, bonne journée !</p>
            <p className="text-xs text-indigo-200 mt-0.5">
              {stats.total_collaborateurs} collaborateur{stats.total_collaborateurs > 1 ? "s" : ""} dans votre équipe.
            </p>
          </div>
          <span className="text-xs text-indigo-200 bg-white/10 px-3 py-1.5 rounded-lg">
            {todayLabel()}
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            icon={Users} value={stats.total_collaborateurs} label="Total collaborateurs"
            badge={nouveauxCeMois > 0 ? `+${nouveauxCeMois} ce mois` : "Aucun ce mois"}
            badgeVariant={nouveauxCeMois > 0 ? "blue" : "gray"}
            fillWidth={100} fillColor="#3b82f6" iconBg="bg-blue-50" iconColor="text-blue-500"
          />
          <KpiCard
            icon={UserCheck} value={stats.collaborateurs_actifs} label="Collaborateurs actifs"
            badge={`${tauxOnboarding}% du total`} badgeVariant="green"
            fillWidth={tauxOnboarding} fillColor="#22c55e" iconBg="bg-green-50" iconColor="text-green-500"
          />
          <KpiCard
            icon={UserX} value={stats.collaborateurs_inactifs} label="Collaborateurs inactifs"
            badge={`${tauxInactifs}% du total`}
            badgeVariant={stats.collaborateurs_inactifs > 0 ? "red" : "gray"}
            fillWidth={tauxInactifs} fillColor="#ef4444" iconBg="bg-red-50" iconColor="text-red-400"
          />
          <KpiCard
            icon={FileText} value={docsEnAttente} label="Documents à signer"
            badge={docsEnAttente > 0 ? `${docsEnAttente} en attente` : "À jour"}
            badgeVariant={docsEnAttente > 0 ? "amber" : "green"}
            fillWidth={docsEnAttente > 0 ? Math.min(docsEnAttente * 10, 100) : 0}
            fillColor="#f59e0b" iconBg="bg-amber-50" iconColor="text-amber-500"
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <h3 className="text-xs font-semibold text-slate-800">Nouveaux collaborateurs / mois</h3>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                6 derniers mois
              </span>
            </div>
            <MiniBarChart data={nouveaux_par_mois} />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-semibold text-slate-800">Onboarding en cours</h3>
              <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                {activite_recente.length} collaborateur{activite_recente.length > 1 ? "s" : ""}
              </span>
            </div>
            <OnboardingProgress collaborateurs={activite_recente} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-800">Activité récente</h3>
            </div>
            {activite_recente.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Aucune activité récente</p>
            ) : (
              activite_recente.slice(0, 5).map((item, i) => <ActivityRow key={i} {...item} />)
            )}
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-xs font-semibold text-slate-800">Documents en attente</h3>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                {docsEnAttente} doc.
              </span>
            </div>

            {docsEnAttente === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-slate-400">Tous les documents sont signés</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800">
                      {docsEnAttente} document{docsEnAttente > 1 ? "s" : ""} en attente
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Signature requise</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    En attente
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/dashboard/document")}
              className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Voir tous les documents <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-800">Actions rapides</h3>
            </div>
            <div className="flex flex-col gap-2">
              {ACTIONS.map((a) => (
                <button key={a.href} onClick={() => router.push(a.href)}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-slate-200 ${a.hoverBorder} ${a.hoverBg} transition-all text-left`}
                >
                  <div className={`w-7 h-7 ${a.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <a.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{a.label}</p>
                    <p className="text-[10px] text-slate-400">{a.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-base font-semibold text-slate-800">{rolesFiltered.length}</p>
                <p className="text-[10px] text-slate-400">Rôles actifs</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-base font-semibold text-slate-800">{moisLePlusActif}</p>
                <p className="text-[10px] text-slate-400">Mois le + actif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-3 gap-4 pb-6">
        <AlertsCard alertes={alertes_onboarding ?? []} />

          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
              <h3 className="text-xs font-semibold text-slate-800">Répartition par rôle</h3>
            </div>
            <RoleDistribution data={rolesFiltered} />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <h3 className="text-xs font-semibold text-slate-800">Taux d'onboarding global</h3>
            </div>
            <div className="flex items-center justify-center gap-8 mt-2">
              <DonutChart pct={tauxOnboarding} />
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xl font-semibold text-slate-800">{stats.collaborateurs_actifs}</p>
                  <p className="text-[10px] text-slate-400">Actifs</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-red-500">{stats.collaborateurs_inactifs}</p>
                  <p className="text-[10px] text-slate-400">Inactifs</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800">{stats.total_collaborateurs}</p>
                  <p className="text-[10px] text-slate-400">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}