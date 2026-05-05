"use client";

import { useState } from "react";
import {
  PlayCircle,
  BookOpen,
  Clock,
  CheckCircle,
  Video,
  MoreHorizontal,
  BarChart3,
  Filter,
  Award,
} from "lucide-react";
import { Formation } from "../../app/types/formation.types";

type FormationsProps = {
  formations: Formation[];
};

export function Formations({ formations }: FormationsProps) {
  // Filtre d'affichage
  const [filter, setFilter] = useState<"Toutes" | "Obligatoire" | "Recommandée" | "Optionnelle">(
    "Toutes"
  );

  // Formations filtrées
  const filteredFormations =
    filter === "Toutes"
      ? formations
      : formations.filter((f) => f.category === filter);

  // Stats
  const totalFormations = filteredFormations.length;
  const completedFormations = filteredFormations.filter((f) => f.status === "completed").length;
  const inProgressFormations = filteredFormations.filter((f) => f.status === "in-progress").length;
  const totalModulesCompleted = filteredFormations.reduce(
    (acc, f) => acc + f.completedModules,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Catalogue de formations</h1>
          <p className="text-slate-600 mt-1">Développez vos compétences professionnelles</p>
        </div>

      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="text-blue-600" size={20} />
            </div>
            <p className="text-sm font-medium text-slate-600">Total formations</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{totalFormations}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
            </div>
            <p className="text-sm font-medium text-slate-600">Complétées</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{completedFormations}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="text-orange-600" size={20} />
            </div>
            <p className="text-sm font-medium text-slate-600">En cours</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{inProgressFormations}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="text-purple-600" size={20} />
            </div>
            <p className="text-sm font-medium text-slate-600">Modules complétés</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{totalModulesCompleted}</p>
        </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formations List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Boutons de filtre */}
          <div className="flex gap-2">
            {(["Toutes", "Obligatoire", "Recommandée", "Optionnelle"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filter === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Liste filtrée */}
          {filteredFormations.map((formation) => (
            <div
              key={formation.id}
              className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{formation.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        formation.category === "Obligatoire"
                          ? "bg-red-100 text-red-700"
                          : formation.category === "Recommandée"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {formation.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Formateur : {formation.instructor}</p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreHorizontal size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Infos modules */}
              <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-400" />
                  <span>{formation.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Video size={16} className="text-slate-400" />
                  <span>
                    {formation.completedModules}/{formation.modules} modules
                  </span>
                </div>
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{formation.level}</span>
              </div>

              {/* Progress */}
              {formation.progress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">Progression</span>
                    <span className="text-slate-900 font-semibold">{formation.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        formation.status === "completed" ? "bg-green-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${formation.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                  formation.status === "completed"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : formation.status === "in-progress"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <PlayCircle size={18} />
                {formation.status === "completed"
                  ? "Réviser"
                  : formation.status === "in-progress"
                  ? "Continuer"
                  : "Démarrer"}
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Learning */}
          <div className="bg-blue-600 text-white p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Formation en cours</h3>
            <p className="text-sm text-blue-100 mb-4">Sécurité informatique et RGPD</p>
            <div className="bg-blue-500 rounded-lg p-4 mb-4">
              <p className="text-sm mb-2 font-medium">Module 7 sur 10</p>
              <div className="w-full bg-blue-400 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <p className="text-xs mt-2 text-blue-100">Temps estimé : 1h 15min</p>
            </div>
            <button className="w-full bg-white text-blue-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm">
              Reprendre la formation
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-slate-600" size={20} />
              <h3 className="font-semibold text-slate-900">Statistiques</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-medium">Temps d'étude</span>
                  <span className="font-semibold text-slate-900">8h 45min</span>
                </div>
                <p className="text-xs text-slate-500">Cette semaine</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-medium">Modules terminés</span>
                  <span className="font-semibold text-slate-900">15</span>
                </div>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-medium">Score moyen</span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
                <p className="text-xs text-slate-500">Évaluations</p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-slate-600" size={20} />
              <h3 className="font-semibold text-slate-900">Certifications obtenues</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-slate-900 text-sm">Outils collaboratifs</p>
                <p className="text-xs text-slate-500 mt-1">Obtenue le 25 Mars 2026</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg opacity-50">
                <p className="font-medium text-slate-700 text-sm">Sécurité IT & RGPD</p>
                <p className="text-xs text-slate-500 mt-1">En cours...</p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Besoin d'assistance ?</h3>
            <p className="text-sm text-slate-600 mb-4">Contactez le responsable formation pour toute question.</p>
            <button className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors text-sm font-medium">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Composant Stat */
function Stat({ icon, label, value, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
      <div className={`flex items-center gap-3 mb-3 ${bg} p-3 rounded-lg`}>{icon}</div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}