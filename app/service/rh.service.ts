    import { RH, RHFilters } from "../types/rh.types"

    const API_URL = "http://localhost:8000/api"

    function formatDateForBackend(dateStr: string) {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const [dd, mm, yyyy] = parts
    return `${yyyy}-${mm}-${dd}`
    }

    export const rhService = {

    async getAll(filters?: RHFilters): Promise<RH[]> {
        const params = new URLSearchParams()
        if (filters?.first_name) params.append("first_name", filters.first_name)
        if (filters?.last_name) params.append("last_name", filters.last_name)
        if (filters?.active !== undefined) params.append("active", String(filters.active))

        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant, veuillez vous reconnecter.")

        const res = await fetch(`${API_URL}/staff?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        })

        if (!res.ok) {
        const text = await res.text()
        throw new Error("Erreur lors du chargement des RH: " + text)
        }

        return res.json()
    },

    async getById(id: number): Promise<RH> {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token manquant, veuillez vous reconnecter.");

        const res = await fetch(`${API_URL}/staff/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            let errorMsg: string;
            try {
                const errorData = await res.json();
                errorMsg = errorData.message || JSON.stringify(errorData);
            } catch {
                errorMsg = await res.text();
            }
            throw new Error("Erreur lors du chargement du RH: " + errorMsg);
        }

        const data: RH = await res.json();
        return data;
    },

  async create(data: {
    email: string
    first_name: string
    last_name: string
    phone_number: string
    date_of_hire: string
    }) {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Token manquant")

    const res = await fetch(`${API_URL}/staff`, { 
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error("Erreur création RH: " + text)
    }

    return res.json()
    },

    async update(id: number, data: { phone_number?: string; date_of_hire?: string }) {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant, veuillez vous reconnecter.")

        const payload: any = {}
        if (data.phone_number) payload.phone_number = data.phone_number.trim()
        if (data.date_of_hire) payload.date_of_hire = formatDateForBackend(data.date_of_hire)

        const res = await fetch(`${API_URL}/staff/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        })

        if (!res.ok) {
        const text = await res.text()
        throw new Error("Erreur lors de la modification du RH: " + text)
        }

        return res.json()
    },

    async toggleActive(id: number) {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant, veuillez vous reconnecter.")

        const res = await fetch(`${API_URL}/staff/${id}/toggle-active`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        })

        if (!res.ok) {
        const text = await res.text()
        throw new Error("Erreur lors de l'activation / désactivation: " + text)
        }

        return res.json()
    },
    }