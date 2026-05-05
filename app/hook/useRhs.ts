    "use client"

    import { useState, useEffect, useCallback } from "react"
    import { RH } from "../types/rh.types"
    import { rhService } from "../service/rh.service"

    export function useRhs() {
    const [rhs, setRhs] = useState<RH[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tempPassword, setTempPassword] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const fetchRhs = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const data = await rhService.getAll()
        setRhs(data)
        } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur serveur")
        } finally {
        setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRhs()
    }, [fetchRhs])

    const createRH = async (data: {
        email: string
        first_name: string
        last_name: string
        phone_number: string
        date_of_hire: string
    }) => {
        setLoading(true)
        setError(null)
        setSuccess(false)
        try {
        const res = await rhService.create(data)
        setTempPassword(res.user?.password_temporaire ?? null)
        setSuccess(true)
        await fetchRhs() 
        } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur création RH")
        } finally {
        setLoading(false)
        }
    }

    const updateRH = async (
        id: number,
        data: { phone_number?: string; date_of_hire?: string }
    ) => {
        setLoading(true)
        setError(null)
        setSuccess(false)
        try {
        await rhService.update(id, data)
        setSuccess(true)
        await fetchRhs()
        } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur modification RH")
        } finally {
        setLoading(false)
        }
    }

    const toggleActiveRH = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
        await rhService.toggleActive(id)
        await fetchRhs()
        } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur toggle RH")
        } finally {
        setLoading(false)
        }
    }

    return {
        rhs,
        loading,
        error,
        tempPassword,
        success,
        fetchRhs,
        createRH,
        updateRH,
        toggleActiveRH,
    }
    }