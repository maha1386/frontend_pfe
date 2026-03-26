// hooks/use-modifier-role.ts

import { useState } from "react";
import { updateRole } from "../../services/role.service";

interface FormData {
  name: string;
}

interface FormErrors {
  name?: string;
}

export function useModifierRole(onSuccess: () => void) {
  const [formData, setFormData] = useState<FormData>({ name: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Le nom du rôle est requis";
    } else if (formData.name.length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (value: string) => {
    setFormData({ name: value });
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (id: number) => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await updateRole(id, { name: formData.name });
      setSuccess(true);
      onSuccess();
    } catch (err: unknown) {
      const e = err as Error;
      setApiError(e.message ?? "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFormData({ name: "" });
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
    handleChange,
    handleSubmit,
    reset,
  };
}