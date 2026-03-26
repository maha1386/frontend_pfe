// hooks/use-modifier-collaborateur.ts

import { useState, useEffect } from "react";
import {
  updateCollaborateur,
  getRoles,
  CollaborateurDetail,
  UpdateCollaborateurPayload,
  Role,
} from "../../services/collaborateur.service";

interface FormData {
  phone_number: string;
  role: string;
}

interface FormErrors {
  phone_number?: string;
  role?: string;
}

export function useModifierCollaborateur(
  collaborateur: CollaborateurDetail | null,
  onSuccess: () => void
) {
  const [formData, setFormData] = useState<FormData>({
    phone_number: "",
    role: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // ─── Pré-remplir le formulaire avec les données actuelles ────────────────

  useEffect(() => {
    if (!collaborateur) return;
    setFormData({
      phone_number: collaborateur.phone_number ?? "",
      role: collaborateur.role ?? "",
    });
    setErrors({});
    setApiError(null);
    setSuccess(false);
  }, [collaborateur]);

  // ─── Charger les rôles ────────────────────────────────────────────────────

  useEffect(() => {
    setRolesLoading(true);
    getRoles()
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setRolesLoading(false));
  }, []);

  // ─── Validation ───────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Le numéro de téléphone est requis";
    } else if (!/^\+?[0-9\s\-]{8,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Numéro de téléphone invalide";
    }

    if (!formData.role) {
      newErrors.role = "Le rôle est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async () => {
    console.log("handleSubmit appelé");
    console.log("collaborateur:", collaborateur);
    console.log("formData:", formData);
    if (!collaborateur) return;
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload: UpdateCollaborateurPayload = {
        phone_number: formData.phone_number,
        role: formData.role,
      };
      await updateCollaborateur(collaborateur.id, payload);
      setSuccess(true);
      onSuccess();
    } catch (err: unknown) {
      const e = err as Error & { validationErrors?: Record<string, string> };
      if (e.validationErrors) {
        setErrors(e.validationErrors as FormErrors);
      } else {
        setApiError(e.message ?? "Erreur lors de la modification");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (!collaborateur) return;
    setFormData({
      phone_number: collaborateur.phone_number ?? "",
      role: collaborateur.role ?? "",
    });
    setErrors({});
    setApiError(null);
    setSuccess(false);
  };

  return {
    formData,
    errors,
    apiError,
    loading,
    success,
    roles,
    rolesLoading,
    handleChange,
    handleSubmit,
    reset,
  };
}