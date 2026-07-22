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

const inputClassName =
  "h-11 rounded-lg border-[#d7dce4] bg-white px-3 text-sm text-[#161a24] shadow-none placeholder:text-[#8992a1] hover:border-[#b9c0cc] focus-visible:border-[#3641f5] focus-visible:ring-3 focus-visible:ring-[#3641f5]/10"

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading, register } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && user) router.replace("/")
  }, [loading, router, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password"))
    const confirmPassword = String(form.get("confirmPassword"))
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。")
      setSubmitting(false)
      return
    }

    try {
      await register(String(form.get("email")), password, confirmPassword)
      router.replace("/")
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "注册失败，请稍后重试。")
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="创建账户"
      description="建立你的可见 SEEN 工作区。"
      footer={
        <>
          已经有账户？
          <Link href="/login" className="ml-2 font-bold text-[#e32636] hover:underline hover:underline-offset-4">
            返回登录
          </Link>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-semibold text-[#161a24]">邮箱</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@company.com" required disabled={submitting} className={inputClassName} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-semibold text-[#161a24]">密码</Label>
          <PasswordField id="password" name="password" autoComplete="new-password" minLength={8} disabled={submitting} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#161a24]">确认密码</Label>
          <PasswordField id="confirmPassword" name="confirmPassword" autoComplete="new-password" minLength={8} disabled={submitting} />
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
              正在创建
            </>
          ) : (
            "创建账户"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}