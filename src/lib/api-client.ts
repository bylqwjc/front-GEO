import type { ZodType } from "zod"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"

type ErrorPayload = {
  error?: string
  details?: unknown
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  schema?: ZodType<T>,
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers,
  })

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const errorPayload =
      payload && typeof payload === "object" ? (payload as ErrorPayload) : null
    throw new ApiError(
      errorPayload?.error ?? "请求失败，请稍后重试。",
      response.status,
      errorPayload?.details,
    )
  }

  return schema ? schema.parse(payload) : (payload as T)
}
