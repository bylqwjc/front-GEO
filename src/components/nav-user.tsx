"use client"

import { BellIcon, CircleUserRoundIcon, CreditCardIcon, EllipsisVerticalIcon, LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useLanguage } from "@/lib/i18n"

export function NavUser({ user }: { user: { name: string; email: string } }) {
  const { isMobile } = useSidebar()
  const { t } = useLanguage()
  return (
    <SidebarMenu><SidebarMenuItem><DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}><Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg">林</AvatarFallback></Avatar><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">{user.name}</span><span className="truncate text-xs text-foreground/70">{user.email}</span></div><EllipsisVerticalIcon className="ml-auto size-4" /></DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
        <DropdownMenuGroup><DropdownMenuLabel className="p-0 font-normal"><div className="flex items-center gap-2 px-1 py-1.5"><Avatar className="size-8"><AvatarFallback className="rounded-lg">林</AvatarFallback></Avatar><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">{user.name}</span><span className="truncate text-xs text-muted-foreground">{user.email}</span></div></div></DropdownMenuLabel></DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup><DropdownMenuItem><CircleUserRoundIcon />{t("账户资料")}</DropdownMenuItem><DropdownMenuItem><CreditCardIcon />{t("套餐与额度")}</DropdownMenuItem><DropdownMenuItem><BellIcon />{t("通知设置")}</DropdownMenuItem></DropdownMenuGroup>
        <DropdownMenuSeparator /><DropdownMenuItem><LogOutIcon />{t("退出登录")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu></SidebarMenuItem></SidebarMenu>
  )
}
