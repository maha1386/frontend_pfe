"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, RotateCcw } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type State = "loading" | "ready" | "success" | "error" | "invalid";

export default function SignaturePage() {
  const { token } = useParams<{ token: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<State>("loading");
  const [userName, setUserName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Vérifier le token ────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/sign/${token}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUserName(`${data.user.first_name} ${data.user.last_name}`);
        setState("ready");
      } catch {
        setState("invalid");
      }
    };
    if (token) check();
  }, [token]);

  // ─── Setup canvas ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "ready") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth   = 3;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
  }, [state]);

  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    setSaving(true);
    try {
      const base64 = canvas.toDataURL("image/png");
      const res = await fetch(`${API_BASE}/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: base64 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Erreur");
      }
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
      setState("error");
    } finally {
      setSaving(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">Lien invalide</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Ce lien de signature est invalide ou a déjà été utilisé.
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800">Signature enregistrée !</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Votre signature a été enregistrée avec succès. Vous pouvez fermer cette page.
          </p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">Erreur</h1>
        <p className="text-gray-500 mt-2 text-sm">{errorMsg}</p>
        <button
          onClick={() => setState("ready")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 px-6 py-5">
        <h1 className="text-white font-bold text-lg">Maison du Web</h1>
        <p className="text-blue-300 text-sm mt-0.5">Signature électronique</p>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-5 max-w-lg mx-auto w-full">

        {/* Info utilisateur */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Signataire</p>
          <p className="text-lg font-bold text-gray-800 mt-0.5">{userName}</p>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Dessinez votre signature dans le cadre ci-dessous avec votre doigt
        </p>

        {/* Canvas */}
        <div
          className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 overflow-hidden"
          style={{ height: "240px" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Effacer
          </button>
          <button
            onClick={handleSave}
            disabled={isEmpty || saving}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>
            ) : (
              <><CheckCircle className="w-4 h-4" />Enregistrer ma signature</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}