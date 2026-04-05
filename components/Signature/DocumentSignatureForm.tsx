"use client";

import { useState } from "react";
import { DocumentSignaturePad } from "./DocumentSignaturePad";
import { signatureService } from "../../app/services/signature.service"; // ton service
import { SignDocumentPayload } from "../../app/types/signature.types";

interface Props {
  documentId: number; // ID du document à signer
  onSigned?: () => void; // callback après signature réussie
}

export function DocumentSignatureForm({ documentId, onSigned }: Props) {
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSigned = async (file: File) => {
    setSignedFile(file);

    try {
      setLoading(true);

      const payload: SignDocumentPayload = {
        document_id: documentId,
        signature: file,
      };

      // Envoi via le service qui gère token et API
      await signatureService.sign(payload);

      console.log("Signature envoyée avec succès");
      onSigned?.();
    } catch (err) {
      console.error("Erreur lors de l'envoi de la signature :", err);
      alert("Erreur lors de l'envoi de la signature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Composant pour dessiner ou uploader la signature */}
      <DocumentSignaturePad onSigned={handleSigned} />

      {/* Aperçu de la signature */}
      {signedFile && (
        <div className="border rounded-xl p-4 bg-white text-center">
          <p className="text-sm text-gray-500 mb-2">Aperçu de la signature</p>
          <img
            src={URL.createObjectURL(signedFile)}
            alt="Signature"
            className="max-h-32 mx-auto object-contain"
          />
        </div>
      )}

      {/* Indication chargement */}
      {loading && (
        <p className="text-center text-blue-600">Envoi de la signature...</p>
      )}
    </div>
  );
}