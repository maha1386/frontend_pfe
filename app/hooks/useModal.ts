import { useState, useCallback } from "react";

type ModalType = "success" | "error" | "warning" | "info";

interface ModalState {
  open: boolean;
  type: ModalType;
  title?: string;
  message: string;
}

export function useModal() {
  const [modal, setModal] = useState<ModalState>({ open: false, type: "info", message: "" });

  const closeModal = useCallback(() => setModal((prev) => ({ ...prev, open: false })), []);

  const success = useCallback((msg: string, title?: string) =>
    setModal({ open: true, type: "success", message: msg, title }), []);
  const error = useCallback((msg: string, title?: string) =>
    setModal({ open: true, type: "error", message: msg, title }), []);
  const warning = useCallback((msg: string, title?: string) =>
    setModal({ open: true, type: "warning", message: msg, title }), []);
  const info = useCallback((msg: string, title?: string) =>
    setModal({ open: true, type: "info", message: msg, title }), []);

  return { modal, closeModal, success, error, warning, info };
}