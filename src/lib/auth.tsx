"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"

export type AuthUser = {
  id: string
  name: string
  email: string
  createdAt: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (email: string, password: string, confirmPassword: string) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
  const payload = (await response.json().catch(() => null)) as ({ error?: string } & T) | null
  if (!response.ok) {
    throw new Error(payload?.error ?? "请求失败，请稍后重试。")
  }
  return payload as T
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const result = await apiRequest<{ user: AuthUser }>("/auth/me")
      setUser(result.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    setUser(result.user)
    return result.user
  }, [])

  const register = useCallback(async (email: string, password: string, confirmPassword: string) => {
    const result = await apiRequest<{ user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, confirmPassword }),
    })
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest<{ success: boolean }>("/auth/logout", { method: "POST" })
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
