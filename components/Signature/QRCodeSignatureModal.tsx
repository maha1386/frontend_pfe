"use client";

import { useState, useEffect } from "react";
import { X, QrCode, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { genererToken } from "../../app/service/signature.service";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborateurId: number;
  collaborateurNom: string;
}

export function QRCodeSignatureModal({
  isOpen,
  onClose,
  collaborateurId,
  collaborateurNom,
}: QRCodeModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) generer();
  }, [isOpen]);

  const generer = async () => {
    setLoading(true);
    setError(null);
    setUrl(null);
    try {
      const data = await genererToken();
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // URL vers API QR Code (Google Charts — pas besoin de lib)
  const qrImageUrl = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div
          className="px-6 py-5 text-white"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base">QR Code Signature</h2>
                <p className="text-blue-300 text-xs mt-0.5">{collaborateurNom}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">

          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-500">Génération du QR Code...</p>
            </div>
          )}

          {error && (
            <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {qrImageUrl && !loading && (
            <>
              {/* QR Code */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <img
                  src={qrImageUrl}
                  alt="QR Code Signature"
                  className="w-48 h-48 rounded-xl"
                />
              </div>

              {/* Instructions */}
              <div className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 text-center leading-relaxed">
                  <strong>{collaborateurNom}</strong> doit scanner ce QR Code avec son téléphone
                  pour dessiner et enregistrer sa signature.
                </p>
              </div>

              {/* Lien copiable */}
              <div className="w-full">
                <p className="text-xs text-gray-400 mb-1 text-center">Ou partagez ce lien :</p>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-600 truncate flex-1">{url}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(url!)}
                    className="text-xs text-blue-600 font-medium hover:text-blue-800 flex-shrink-0"
                  >
                    Copier
                  </button>
                </div>
              </div>

              {/* Régénérer */}
              <button
                onClick={generer}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Régénérer un nouveau lien
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}