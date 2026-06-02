"use client";

import { useState } from "react";
import {
  PlayCircle, BookOpen, Clock, CheckCircle,
  Video, MoreHorizontal, BarChart3, Award,
} from "lucide-react";
import {
  Formation, FormationStats,
  FormationCurrent, FormationCertification,
} from "../../app/types/formation.types";
import { useRouter } from "next/navigation";
type FormationsProps = {
  formations:     Formation[];
  stats:          FormationStats;
  current:        FormationCurrent | null;
  certifications: FormationCertification[];
};

export function Formations({ formations, stats, current, certifications }: FormationsProps) {
  const [filter, setFilter] = useState<"Toutes" | "Obligatoire" | "Recommandée" | "Optionnelle">("Toutes");
  const router = useRouter();

  const filteredFormations =
    filter === "Toutes"
      ? formations
      : formations.filter((f) => f.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Catalogue de formations</h1>
        <p className="text-slate-600 mt-1">Développez vos compétences professionnelles</p>
      </div>

      {/* Stats Cards — dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-50 rounded-lg"><BookOpen className="text-blue-600" size={20} /></div>
            <p className="text-sm font-medium text-slate-600">Total formations</p>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-50 rounded-lg"><CheckCircle className="text-green-600" size={20} /></div>
            <p className="text-sm font-medium text-slate-600">Complétées</p>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.completed}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-orange-50 rounded-lg"><Clock className="text-orange-600" size={20} /></div>
            <p className="text-sm font-medium text-slate-600">En cours</p>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.in_progress}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-50 rounded-lg"><BarChart3 className="text-purple-600" size={20} /></div>
            <p className="text-sm font-medium text-slate-600">Modules complétés</p>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.modules_completed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste formations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 flex-wrap">
            {(["Toutes", "Obligatoire", "Recommandée", "Optionnelle"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filter === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredFormations.length === 0 ? (
            <div className="bg-white p-10 rounded-lg border border-slate-200 text-center text-slate-400">
              Aucune formation disponible
            </div>
          ) : (
            filteredFormations.map((formation) => (
              <div key={formation.id} className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{formation.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        formation.category === "Obligatoire" ? "bg-red-100 text-red-700"
                        : formation.category === "Recommandée" ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                      }`}>
                        {formation.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Formateur : {formation.instructor}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <MoreHorizontal size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" />
                    <span>{formation.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video size={16} className="text-slate-400" />
                    <span>{formation.completedModules}/{formation.modules} modules</span>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{formation.level}</span>
                </div>

                {formation.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">Progression</span>
                      <span className="text-slate-900 font-semibold">{formation.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${formation.status === "completed" ? "bg-green-600" : "bg-blue-600"}`}
                        style={{ width: `${formation.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm ${
                  formation.status === "completed"   ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : formation.status === "in-progress" ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}>
                  <PlayCircle size={18} />
                  {formation.status === "completed" ? "Réviser"
                    : formation.status === "in-progress" ? "Continuer"
                    : "Démarrer"}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar — dynamique */}
        <div className="space-y-6">

          {/* Formation en cours — dynamique */}
          {current ? (
            <div className="bg-blue-600 text-white p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Formation en cours</h3>
              <p className="text-sm text-blue-100 mb-4">{current.title}</p>
              <div className="bg-blue-500 rounded-lg p-4 mb-4">
                <p className="text-sm mb-2 font-medium">
                  Module {current.module} sur {current.total}
                </p>
                <div className="w-full bg-blue-400 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${current.progress}%` }} />
                </div>
                {current.deadline && (
                  <p className="text-xs mt-2 text-blue-100">
                    Échéance : {new Date(current.deadline).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <button className="w-full bg-white text-blue-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-50 text-sm">
                Reprendre la formation
              </button>
            </div>
          ) : (
            <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 text-center text-slate-400 text-sm">
              Aucune formation en cours
            </div>
          )}

          {/* Stats — dynamiques */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-slate-600" size={20} />
              <h3 className="font-semibold text-slate-900">Statistiques</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-medium">Formations complétées</span>
                  <span className="font-semibold text-slate-900">{stats.completed}</span>
                </div>
                <p className="text-xs text-slate-500">Sur {stats.total} au total</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-medium">Modules terminés</span>
                  <span className="font-semibold text-slate-900">{stats.modules_completed}</span>
                </div>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-medium">Taux de complétion</span>
                  <span className={`font-semibold ${stats.completion_rate >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                    {stats.completion_rate}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">Progression globale</p>
              </div>
            </div>
          </div>

          {/* Certifications — dynamiques */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-slate-600" size={20} />
              <h3 className="font-semibold text-slate-900">Certifications obtenues</h3>
            </div>
            <div className="space-y-3">
              {certifications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center">Aucune certification</p>
              ) : (
                certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-3 rounded-lg border ${
                      cert.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-slate-50 border-slate-200 opacity-50'
                    }`}
                  >
                    <p className={`font-medium text-sm ${cert.completed ? 'text-slate-900' : 'text-slate-700'}`}>
                      {cert.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {cert.completed && cert.obtained_at
                        ? `Obtenue le ${cert.obtained_at}`
                        : 'En cours...'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Support */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Besoin d'assistance ?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Contactez le responsable formation pour toute question.
            </p>
            <button
              onClick={() => router.push("/dashboardc/messages")}
              className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-white text-sm font-medium transition-colors"
            >
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}