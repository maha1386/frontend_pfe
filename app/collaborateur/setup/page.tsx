"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Copy, Check, PenLine, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

type Status = "loading" | "ready" | "done" | "error";

export default function CollaborateurSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage au unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Charger user + générer token (une seule fois)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(`${user.first_name || ""} ${user.last_name || ""}`.trim());

    if (user.signature_path) {
      // Signature déjà faite → aller au CV
      router.replace("/collaborateur/cv");
      return;
    }

    genererToken();
  }, []);

  const startPolling = () => {
    if (pollingRef.current) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/signature/status", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();

        if (data.has_signature) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;

          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.signature_path = data.signature_path;
          localStorage.setItem("user", JSON.stringify(user));

          setStatus("done");
          // ✅ Redirection vers upload CV après signature
          setTimeout(() => router.push("/collaborateur/cv"), 2000);
        }
      } catch {}
    }, 3000);

    // Stop polling après 10 minutes
    setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 600000);
  };

  const genererToken = async () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/signature/token", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setSignatureUrl(data.url);
      setStatus("ready");
      startPolling();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Erreur serveur");
      setStatus("error");
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(signatureUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Génération du QR code...</p>
      </div>
    </div>
  );

  if (status === "done") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Signature enregistrée !</h2>
        {/* ✅ Message mis à jour */}
        <p className="text-gray-500 mt-2 text-sm">Redirection vers l'upload de votre CV...</p>
      </div>
    </div>
  );

  if (status === "error") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
        <p className="text-red-500 mb-4">{errorMsg}</p>
        <button onClick={genererToken} className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex items-center gap-3 mb-6">
          <Image src="/images/maisonduweb_logo.jpg" alt="Logo" width={40} height={40} className="rounded-lg object-cover" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Maison du Web</h1>
            <p className="text-xs text-gray-500">Signature électronique</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-emerald-600 font-medium">Mot de passe</span>
          </div>
          <div className="flex-1 h-0.5 bg-blue-300 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <PenLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-blue-600 font-medium">Signature</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-bold">3</span>
            </div>
            <span className="text-sm text-gray-400">CV</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <PenLine className="w-7 h-7 text-white" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Créez votre signature</h2>
            <p className="text-sm text-gray-500 mt-1">
              Bonjour <span className="font-medium text-blue-600">{userName}</span>, scannez le QR code avec votre téléphone pour signer.
            </p>
          </div>

          {signatureUrl && (
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl border-2 border-gray-100 shadow-inner bg-white inline-block">
                <QRCodeSVG value={signatureUrl} size={200} level="H" includeMargin={false} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            En attente de votre signature...
          </div>

          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
            <p className="flex-1 text-xs text-gray-400 font-mono truncate text-left">{signatureUrl}</p>
            <button onClick={copyUrl} className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Ouvrez l'appareil photo et pointez vers le QR code pour accéder au formulaire de signature.
          </p>

          <button onClick={genererToken} className="flex items-center gap-2 mx-auto text-xs text-gray-400 hover:text-blue-600 transition-colors">
            <RefreshCw className="w-3 h-3" /> Regénérer le QR code
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">© 2026 Maison du Web</p>
      </div>
    </div>
  );
}