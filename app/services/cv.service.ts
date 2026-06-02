const API_URL = "http://127.0.0.1:8000/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

export const cvService = {
  // Upload CV et extraction IA
  async uploadCv(file: File) {
    const formData = new FormData();
    formData.append("cv", file);

    const res = await fetch(`${API_URL}/cv/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Accept": "application/json",
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur lors de l'extraction");
    return data;
  },

  // Valider et sauvegarder cv_data
  async validateCv(cvData: object) {
    const res = await fetch(`${API_URL}/cv/validate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ cv_data: cvData }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur lors de la sauvegarde");
    return data;
  },

  // Récupérer cv_data du collaborateur connecté
  async getCvData() {
    const res = await fetch(`${API_URL}/cv`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur");
    return data;
  },
};