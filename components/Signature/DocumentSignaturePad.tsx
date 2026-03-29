"use client";

import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

interface Props {
  onSigned: (file: File) => void;
}

export function DocumentSignaturePad({ onSigned }: Props) {
  const padRef = useRef<SignatureCanvas>(null);
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Détection appareil tactile
  useEffect(() => {
    const touch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touch);

    if (!touch) {
      setMode("upload");
    }
  }, []);

  const handleConfirm = () => {
    if (mode === "draw") {
      if (!isTouchDevice) {
        alert("Veuillez utiliser un appareil tactile pour signer.");
        return;
      }

      if (!padRef.current || padRef.current.isEmpty()) {
        alert("Veuillez dessiner votre signature.");
        return;
      }

      padRef.current.getCanvas().toBlob((blob) => {
        if (!blob) {
          alert("Impossible de récupérer la signature. Réessayez.");
          return;
        }
        const file = new File([blob], "signature.png", {
          type: "image/png",
        });
        onSigned(file);
      }, "image/png");
    } else {
      if (!uploadedFile) {
        alert("Veuillez choisir un fichier à uploader.");
        return;
      }
      onSigned(uploadedFile);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Onglets */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("draw")}
          disabled={!isTouchDevice}
          className={`px-4 py-2 rounded-lg ${
            mode === "draw" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
          } ${!isTouchDevice ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Dessiner
        </button>

        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 rounded-lg ${
            mode === "upload" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          Uploader
        </button>
      </div>

      {/* Message si desktop */}
      {mode === "draw" && !isTouchDevice && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          La signature avec la souris n'est pas autorisée. <br />
          Veuillez utiliser un appareil tactile ou uploader une signature.
        </div>
      )}

      {/* Canvas uniquement tactile */}
      {mode === "draw" && isTouchDevice && (
        <div className="border-2 border-dashed rounded-xl overflow-hidden bg-white">
          <SignatureCanvas
            ref={padRef}
            penColor="#1a1a2e"
            canvasProps={{
              width: 600,
              height: 200,
              className: "w-full touch-none",
            }}
          />
          <div className="flex justify-end p-2 bg-gray-50 border-t">
            <button
              onClick={() => padRef.current?.clear()}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      {mode === "upload" && (
        <div className="border-2 border-dashed rounded-xl p-8 text-center bg-white">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
            className="hidden"
            id="sig-upload"
          />
          <label htmlFor="sig-upload" className="cursor-pointer">
            {uploadedFile ? uploadedFile.name : "Cliquez pour choisir une image"}
          </label>

          {uploadedFile && (
            <img
              src={URL.createObjectURL(uploadedFile)}
              alt="Aperçu"
              className="mt-4 max-h-32 mx-auto object-contain"
            />
          )}
        </div>
      )}

      {/* Bouton confirmer */}
      <button
        onClick={handleConfirm}
        className="w-full py-3 bg-blue-600 text-white rounded-xl"
      >
        Confirmer la signature
      </button>
    </div>
  );
}