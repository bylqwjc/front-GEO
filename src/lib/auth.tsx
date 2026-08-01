"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { z } from "zod"

import { apiRequest } from "@/lib/api-client"

const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
})

const authResponseSchema = z.object({ user: authUserSchema })

export type AuthUser = z.infer<typeof authUserSchema>

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (email: string, password: string, confirmPassword: string) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const result = await apiRequest("/auth/me", {}, authResponseSchema)
      setUser(result.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      authResponseSchema,
    )
    setUser(result.user)
    return result.user
  }, [])

  const register = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      const result = await apiRequest(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ email, password, confirmPassword }),
        },
        authResponseSchema,
      )
      setUser(result.user)
      return result.user
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>("/auth/logout", { method: "POST" })
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
