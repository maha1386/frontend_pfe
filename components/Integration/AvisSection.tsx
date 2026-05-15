"use client";

import { useState } from "react";
import { Star, Brain, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAvis } from "../../app/hooks/onboarding/useAvis";

interface Props {
  onboardingId: number;
}

export function AvisSection({ onboardingId }: Props) {
  const { checking, submitted, loading, error, result, submit } =
    useAvis(onboardingId);

  const [etoiles, setEtoiles]         = useState(0);
  const [hover, setHover]             = useState(0);
  const [commentaire, setCommentaire] = useState("");

  const handleSubmit = () => {
    if (etoiles === 0) return;
    submit(etoiles, commentaire);
  };

  // Chargement vérification initiale
  if (checking) return null;

  // ── Avis déjà soumis ────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-green-800 text-sm">
            Merci pour votre avis !
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Votre retour a bien été enregistré.
          </p>

          {result && (
            <div className="flex items-center gap-4 mt-3">
              {/* Score */}
              <div className="text-center px-3 py-2 bg-white rounded-xl border border-green-200">
                <div className="text-lg font-bold text-green-700">
                  {result.score_sante}
                  <span className="text-xs font-normal">/100</span>
                </div>
                <div className="text-xs text-gray-500">Score santé</div>
              </div>

              {/* Rythme */}
              <div className="text-center px-3 py-2 bg-white rounded-xl border border-green-200">
                <div
                  className={`text-sm font-semibold ${
                    result.rythme === "bon"
                      ? "text-green-700"
                      : result.rythme === "moyen"
                      ? "text-amber-700"
                      : "text-red-600"
                  }`}
                >
                  {result.rythme === "bon"
                    ? "Bon rythme"
                    : result.rythme === "moyen"
                    ? "Rythme moyen"
                    : "Rythme lent"}
                </div>
                <div className="text-xs text-gray-500">Rythme</div>
              </div>

              {/* Badge IA */}
              {result.eligible && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-700 font-medium">
                    Ajouté à la base IA
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Formulaire avis ─────────────────────────────────────────
  const isEligible = etoiles >= 3;
  const activeStars = hover || etoiles;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">

      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Ce plan d'intégration vous a-t-il aidé ?
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Votre avis améliore les futurs plans grâce à l'IA
          </p>
        </div>
        <Brain className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
      </div>

      {/* Étoiles */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Note globale</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setEtoiles(n)}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-9 h-9 transition-colors duration-150 ${
                  n <= activeStars
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 hover:text-amber-200"
                }`}
              />
            </button>
          ))}
        </div>

        {etoiles > 0 && (
          <p className="text-xs mt-2 text-gray-500">
            {["", "Très insatisfait", "Insatisfait", "Satisfait", "Très satisfait", "Excellent !"][etoiles]}
          </p>
        )}
      </div>

      {/* Indicateur éligibilité IA */}
      {etoiles > 0 && (
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
            isEligible
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-400 border-gray-200"
          }`}
        >
          <Brain className="w-3.5 h-3.5 flex-shrink-0" />
          {isEligible
            ? "✓ Ce plan sera intégré à la base IA pour améliorer les futurs onboardings"
            : "Une note ≥ 3 étoiles est nécessaire pour enrichir la base IA"}
        </div>
      )}

      {/* Commentaire */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">
          Commentaire{" "}
          <span className="font-normal text-gray-400">(optionnel)</span>
        </p>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Qu'est-ce qui a bien fonctionné ? Qu'est-ce qui pourrait être amélioré ?"
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 transition"
        />
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Bouton */}
      <button
        onClick={handleSubmit}
        disabled={etoiles === 0 || loading}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
          etoiles === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : loading
            ? "bg-blue-400 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Soumettre mon avis"
        )}
      </button>
    </div>
  );
}