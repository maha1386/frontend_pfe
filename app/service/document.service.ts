import{ Document, DocumentFilters } from '../types/document.types'
const API_URL = "http://localhost:8000/api"

export const documentService ={
    async getAll(filters?: DocumentFilters): Promise<Document[]> {
        const params =new URLSearchParams()
        if(filters?.namedoc) params.append("namedoc", filters.namedoc)
        const token =localStorage.getItem("token")
        const res = await fetch(`${API_URL}/documents?${params.toString()}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if(!res.ok) {
            throw new Error("Erreur chargement des documents")
        }
        const data = await res.json()
        return data.documents
    },

    async getMesDocuments(filters?: DocumentFilters): Promise<Document[]> {
        const params = new URLSearchParams();
        if (filters?.namedoc) params.append("namedoc", filters.namedoc);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Utilisateur non authentifié");

        const url = `${API_URL}/documents/mes-documents?${params.toString()}`;
        console.log("URL appelée :", url); 

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Lis le body UNE SEULE FOIS en texte brut
        const text = await res.text();

        let data: any = null;
        try {
            data = JSON.parse(text); // parse manuellement
        } catch (err) {
            console.error("Réponse non-JSON reçue :", text);
            throw new Error(`Réponse inattendue du backend : ${res.status}`);
        }

        if (!res.ok) {
            console.error("Erreur API getMesDocuments:", res.status, data);
            throw new Error(data?.message || `Erreur chargement des documents (${res.status})`);
        }

        console.log("Réponse complète :", data); // ← pour vérifier la structure
        return data.documents || [];
    },
    async viewDocument(id: number): Promise<string> {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Utilisateur non authentifié");

        const res = await fetch(`${API_URL}/documents/${id}/view`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Impossible de charger le document");

        const blob = await res.blob();
        return URL.createObjectURL(blob);
    },
    async create(formData: FormData) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Utilisateur non authentifié");

        try {
            const res = await fetch(`${API_URL}/documents`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
            });

            if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(
                errorData?.message || "Erreur lors de la création du document"
            );
            }

            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Erreur create document:", err);
            throw err;
        }
    },
    async update(
        id: number,
        data: {
            namedoc: string;
            signature_req: boolean;
            path?: File;
            user_id?: number;
            status?: string;
        }
        ): Promise<Document> {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Utilisateur non authentifié");

        const formData = new FormData();
        formData.append("_method", "PATCH"); // Laravel accepte le PATCH via POST
        formData.append("namedoc", data.namedoc);
        formData.append("signature_req", data.signature_req ? "1" : "0");

        if (data.user_id) formData.append("user_id", data.user_id.toString());
        if (data.status) formData.append("status", data.status);
        if (data.path) formData.append("path", data.path);

        const res = await fetch(`${API_URL}/documents/${id}`, {
            method: "POST", // POST avec _method = PATCH
            headers: {
            Authorization: `Bearer ${token}`,
            // Ne pas mettre 'Content-Type', FormData gère ça
            },
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.message || "Erreur lors de la mise à jour du document");
        }

        const json = await res.json();
        return json.document;
        },
    async delete(id:number){
        const token= localStorage.getItem("token")
        const res=await fetch(`${API_URL}/documents/${id}`, {
            method:"DELETE",
            headers:{
                Authorization: `Bearer ${token}`,
            },
        })
        if(!res.ok) throw new Error("Erreur lors de la suppression du document")
        return res.json()
    }
}