// hooks/use-create-role.ts

import { useState } from "react";
import { createRole } from "../../services/role.service";

interface FormData {
  name: string;
}

interface FormErrors {
  name?: string;
}

export function useCreateRole(onSuccess: () => void) {
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

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await createRole({ name: formData.name });
      setSuccess(true);
      onSuccess();
    } catch (err: unknown) {
      const e = err as Error & { validationErrors?: Record<string, string> };
      if (e.validationErrors) {
        setErrors(e.validationErrors as FormErrors);
      } else {
        setApiError(e.message ?? "Erreur lors de la création");
      }
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