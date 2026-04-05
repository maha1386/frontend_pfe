"use client";

import { X, Upload, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Document } from "@/app/types/document.types";
import { documentService } from "@/app/services/document.service";

interface Props {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentEditModal({ document, isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    namedoc: "",
    signature_req: false,
    path: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({
        namedoc: document.namedoc,
        signature_req: document.signature_req,
        path: null,
      });
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleChange("path", file);
      if (!formData.namedoc.trim()) {
        handleChange("namedoc", file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.namedoc.trim()) {
      newErrors.namedoc = "Le nom du document est requis";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await documentService.update(document.id, {
        namedoc: formData.namedoc,
        signature_req: formData.signature_req,
        path: formData.path || undefined,
      });
      setErrors({});
      onSuccess();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur modification document");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ namedoc: "", signature_req: false, path: null });
    setErrors({});
    onClose();
  };

  const inputClass = (error?: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
      error ? "border-red-400 bg-red-50 text-red-800" : "border-gray-200 bg-white text-gray-800"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Modifier un document</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Upload */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Cliquer pour changer le fichier (optionnel)
            </p>
            <p className="text-xs text-gray-500">PDF (max. 10 MB)</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-lg"
            />
            {formData.path ? (
              <p className="mt-2 text-sm text-emerald-600 font-medium">✓ {formData.path.name}</p>
            ) : document.path ? (
              <p className="mt-2 text-sm text-gray-500">
                Fichier actuel : {document.path.split("/").pop()}
              </p>
            ) : null}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              value={formData.namedoc}
              onChange={(e) => handleChange("namedoc", e.target.value)}
              className={inputClass(errors.namedoc)}
            />
            {errors.namedoc && <p className="text-xs text-red-500 mt-1">{errors.namedoc}</p>}
          </div>

          {/* Assigné à */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à</label>
            <div className="flex flex-wrap gap-2">
              {document.assignments && document.assignments.length > 0 ? (
                document.assignments.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                  >
                    {a.user_fullname}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      a.status === "signed"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {a.status === "signed" ? "Signé" : "En attente"}
                    </span>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">Non assigné</p>
              )}
            </div>
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Signature requise ?</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-gray-900 font-medium">
                <input
                  type="radio"
                  checked={formData.signature_req === true}
                  onChange={() => handleChange("signature_req", true)}
                  className="h-4 w-4 text-orange-500"
                />
                Oui
              </label>
              <label className="flex items-center gap-2 text-gray-900 font-medium">
                <input
                  type="radio"
                  checked={formData.signature_req === false}
                  onChange={() => handleChange("signature_req", false)}
                  className="h-4 w-4 text-orange-500"
                />
                Non
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {loading ? "Enregistrement..." : "Modifier"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}