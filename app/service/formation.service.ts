// src/services/formation.service.ts

import { FormationsResponse } from "../types/formation.types";

const API_URL = "http://localhost:8000/api";

export const getMyFormations = async (): Promise<FormationsResponse> => {
  const res = await fetch(`${API_URL}/my-formations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`, // ou cookie
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des formations");
  }

  return res.json();
};