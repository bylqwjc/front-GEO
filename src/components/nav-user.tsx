"use client"

import { useRouter } from "next/navigation"
import { BellIcon, CircleUserRoundIcon, CreditCardIcon, EllipsisVerticalIcon, LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { getBilling } from "@/lib/project-api"
import { useLanguage } from "@/lib/i18n"
import { useEffect, useState } from "react"

export function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const { t } = useLanguage()

  useEffect(() => { if (user) void getBilling().then((result) => setBalance(result.data.balance)).catch(() => setBalance(null)) }, [user])

  if (!user) return null

  const initials = user.name.trim().slice(0, 1).toUpperCase() || "U"

  async function handleLogout() {
    try {
      await logout()
    } finally {
      router.replace("/login")
    }
  }

  return (
    <SidebarMenu><SidebarMenuItem><DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}><Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg">{initials}</AvatarFallback></Avatar><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">{user.name}</span><span className="truncate text-xs text-foreground/70">{user.email}</span></div>{balance !== null ? <span className="mr-1 text-xs font-semibold tabular-nums text-emerald-700">{balance} 积分</span> : null}<EllipsisVerticalIcon className="ml-auto size-4" /></DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
        <DropdownMenuGroup><DropdownMenuLabel className="p-0 font-normal"><div className="flex items-center gap-2 px-1 py-1.5"><Avatar className="size-8"><AvatarFallback className="rounded-lg">{initials}</AvatarFallback></Avatar><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">{user.name}</span><span className="truncate text-xs text-muted-foreground">{user.email}</span></div></div><div className="mx-1 mb-1 flex items-center justify-between rounded-md bg-emerald-50 px-2.5 py-2 text-xs"><span className="text-emerald-800">当前积分</span><strong className="tabular-nums text-emerald-700">{balance === null ? "加载中" : balance}</strong></div></DropdownMenuLabel></DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup><DropdownMenuItem><CircleUserRoundIcon />{t("账户资料")}</DropdownMenuItem><DropdownMenuItem><CreditCardIcon />{t("套餐与额度")}</DropdownMenuItem><DropdownMenuItem><BellIcon />{t("通知设置")}</DropdownMenuItem></DropdownMenuGroup>
        <DropdownMenuSeparator /><DropdownMenuItem onClick={() => void handleLogout()}><LogOutIcon />{t("退出登录")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu></SidebarMenuItem></SidebarMenu>
  )
}
