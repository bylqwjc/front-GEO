"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircleIcon } from "lucide-react"

import { AuthShell } from "@/components/auth-shell"
import { PasswordField } from "@/components/password-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

function safeNextPath() {
  const value = new URLSearchParams(window.location.search).get("next")
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/"
}

export default function LoginPage() {
  const router = useRouter()
  const { user, loading, login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && user) router.replace(safeNextPath())
  }, [loading, router, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    const form = new FormData(event.currentTarget)
    try {
      await login(String(form.get("email")), String(form.get("password")))
      router.replace(safeNextPath())
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "登录失败，请稍后重试。")
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="欢迎回来"
      description="登录你的可见 SEEN 工作区。"
      footer={
        <>
          还没有账户？
          <Link href="/register" className="ml-2 font-bold text-[#e32636] hover:underline hover:underline-offset-4">
            立即注册
          </Link>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-semibold text-[#161a24]">
            邮箱
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            required
            disabled={submitting}
            className="h-11 rounded-lg border-[#d7dce4] bg-white px-3 text-sm text-[#161a24] shadow-none placeholder:text-[#8992a1] hover:border-[#b9c0cc] focus-visible:border-[#3641f5] focus-visible:ring-3 focus-visible:ring-[#3641f5]/10"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-semibold text-[#161a24]">
            密码
          </Label>
          <PasswordField id="password" name="password" autoComplete="current-password" disabled={submitting} />
        </div>

        {error ? <p role="alert" className="text-sm font-medium text-[#e32636]">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-lg bg-[#3641f5] text-sm font-semibold text-white shadow-none hover:bg-[#2732dc]"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              正在登录
            </>
          ) : (
            "登录"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}