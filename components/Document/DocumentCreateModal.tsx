// components/Document/DocumentCreateModal.tsx
"use client";

import { X, Upload, Save } from "lucide-react";
import React, { useState } from "react";
import { MultiSelectCollaborateurs } from "./MultiSelectCollaborateurs";
import { CollaborateurOption } from "../../app/hooks/use-collaborateurs-search";

interface DocumentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    signatureRequired: boolean;
    file: File | null;
    user_ids: number[];
  }) => Promise<any>;
}

export function DocumentCreateModal({ isOpen, onClose, onCreate }: DocumentCreateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    signatureRequired: false,
    file: null as File | null,
  });
  const [selectedCollabs, setSelectedCollabs] = useState<CollaborateurOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleChange("file", file);
      if (!formData.name.trim()) handleChange("name", file.name.replace(".pdf", ""));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Le nom du document est requis";
    if (!formData.file) newErrors.file = "Le fichier PDF est requis";
    if (selectedCollabs.length === 0) newErrors.collabs = "Assignez au moins une personne";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onCreate({
        name: formData.name,
        signatureRequired: formData.signatureRequired,
        file: formData.file,
        user_ids: selectedCollabs.map((c) => c.id),
      });
      // Reset
      setFormData({ name: "", signatureRequired: false, file: null });
      setSelectedCollabs([]);
      setErrors({});
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur création document");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", signatureRequired: false, file: null });
    setSelectedCollabs([]);
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
          <h2 className="text-lg font-semibold text-gray-900">Ajouter un document</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Upload fichier */}
          <div className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            errors.file ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-orange-500"
          }`}>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Glissez-déposez un fichier ici ou cliquez pour parcourir
            </p>
            <p className="text-xs text-gray-500">PDF (max. 10 MB)</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-lg"
            />
            {formData.file && (
              <p className="mt-2 text-sm text-emerald-600 font-medium">✓ {formData.file.name}</p>
            )}
          </div>
          {errors.file && <p className="text-xs text-red-500 -mt-3">{errors.file}</p>}

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Entrez le nom du document"
              className={inputClass(errors.name)}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Assigné à — multiselect */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigné à *
              {selectedCollabs.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-semibold">
                  {selectedCollabs.length} sélectionné{selectedCollabs.length > 1 ? "s" : ""}
                </span>
              )}
            </label>
            <MultiSelectCollaborateurs
              selected={selectedCollabs}
              onChange={setSelectedCollabs}
              error={errors.collabs}
            />
          </div>

          {/* Signature requise */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Signature requise ?</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-gray-900 font-medium">
                <input
                  type="radio"
                  name="signatureRequired"
                  checked={formData.signatureRequired === true}
                  onChange={() => handleChange("signatureRequired", true)}
                  className="h-4 w-4 text-orange-500"
                />
                Oui
              </label>
              <label className="flex items-center gap-2 text-gray-900 font-medium">
                <input
                  type="radio"
                  name="signatureRequired"
                  checked={formData.signatureRequired === false}
                  onChange={() => handleChange("signatureRequired", false)}
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
              {loading ? "Enregistrement..." : "Ajouter"}
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