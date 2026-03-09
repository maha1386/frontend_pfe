// hooks/use-create-collaborateur.ts

import { useState, useEffect } from "react";
import {
  createCollaborateur,
  getRoles,
  CreateCollaborateurPayload,
  Role,
} from "../services/collaborateur.service";

export interface FormData {
  last_name: string;
  first_name: string;
  email: string;
  phone_number: string;
  role_id: string;
  date_of_hire: string;
}

export interface FormErrors {
  last_name?: string;
  first_name?: string;
  email?: string;
  phone_number?: string;
  role_id?: string;
  date_of_hire?: string;
}

const today = new Date().toISOString().split("T")[0];

const INITIAL_FORM: FormData = {
  last_name: "",
  first_name: "",
  email: "",
  phone_number: "",
  role_id: "",
  date_of_hire: today,
};

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.last_name.trim()) errors.last_name = "Le nom est requis";
  if (!data.first_name.trim()) errors.first_name = "Le prénom est requis";
  if (!data.email.trim()) errors.email = "L'email est requis";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Format email invalide";
  if (data.phone_number && !/^\+?[\d\s\-]{8,15}$/.test(data.phone_number))
    errors.phone_number = "Numéro invalide";
  if (!data.role_id) errors.role_id = "Le rôle est requis";
  if (!data.date_of_hire) errors.date_of_hire = "La date est requise";
  return errors;
}

export function useCreateCollaborateur(onSuccess: () => void) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // ─── Rôles dynamiques ──────────────────────────────────────────────────────
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

useEffect(() => {
  getRoles()
    .then((data) => {
      console.log("Rôles API :", data);   // ✔ bon endroit
      setRoles(data);

      const defaultRole = data.find((r) => r.name === "new_collaborateur");
      if (defaultRole) {
        setFormData((prev) => ({
          ...prev,
          role_id: String(defaultRole.id),
        }));
      }
    })
    .catch((err) => {
      console.error("Erreur roles :", err);
    })
    .finally(() => {
      setRolesLoading(false);
    });
}, []);

  // ─── Changer un champ ──────────────────────────────────────────────────────
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ─── Soumettre ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const selectedRole = roles.find((r) => String(r.id) === formData.role_id);
      const payload: CreateCollaborateurPayload = {
        last_name: formData.last_name,
        first_name: formData.first_name,
        email: formData.email,
        phone_number: formData.phone_number,
        date_of_hire: formData.date_of_hire,
        role: selectedRole?.name ?? "",
      };
      const res = await createCollaborateur(payload);
      setTempPassword(res.user?.password_temporaire ?? null);
      setSuccess(true);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error && "validationErrors" in err) {
        setErrors(
          (err as Error & { validationErrors: FormErrors }).validationErrors
        );
      } else {
        setApiError(err instanceof Error ? err.message : "Erreur serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const reset = () => {
    // Garde le rôle par défaut après reset
    const defaultRole = roles.find((r) => r.name === "new_collaborateur");
    setFormData({
      ...INITIAL_FORM,
      role_id: defaultRole ? String(defaultRole.id) : "",
    });
    setErrors({});
    setApiError(null);
    setSuccess(false);
    setTempPassword(null);
  };

  return {
    formData,
    errors,
    apiError,
    loading,
    success,
    tempPassword,
    roles,
    rolesLoading,
    handleChange,
    handleSubmit,
    reset,
  };
}