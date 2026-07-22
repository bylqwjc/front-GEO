"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PasswordField({
  id,
  name,
  autoComplete,
  minLength,
  disabled,
}: {
  id: string
  name: string
  autoComplete: string
  minLength?: number
  disabled?: boolean
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        disabled={disabled}
        className="h-11 rounded-lg border-[#d7dce4] bg-white px-3 pr-11 text-sm text-[#161a24] shadow-none outline-none placeholder:text-[#8992a1] hover:border-[#b9c0cc] focus-visible:border-[#3641f5] focus-visible:ring-3 focus-visible:ring-[#3641f5]/10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 rounded-md text-[#6f7887] hover:bg-[#3641f5]/5 hover:text-[#3641f5]"
        aria-label={visible ? "隐藏密码" : "显示密码"}
        aria-pressed={visible}
        title={visible ? "隐藏密码" : "显示密码"}
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </Button>
    </div>
  )
}