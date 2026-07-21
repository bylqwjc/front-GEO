"use client"

import { BellIcon, DatabaseIcon, Globe2Icon, KeyRoundIcon, SaveIcon, UserRoundIcon } from "lucide-react"
import { toast } from "sonner"

import { GeoPageHeader } from "@/components/geo-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/i18n"

export default function SettingsPage() {
  const { t } = useLanguage()
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <GeoPageHeader eyebrow={t("工作区设置")} title={t("设置")} description={`Acme Cloud · ${t("配置品牌资料与服务集成")}`} actions={<Button onClick={() => toast.success(t("设置已保存"))}><SaveIcon data-icon="inline-start" />{t("保存更改")}</Button>} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("品牌资料")}</CardTitle><CardDescription>{t("用于检测中的品牌识别和默认地区设置")}</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field icon={<UserRoundIcon />} id="settings-brand" label={t("品牌名称")} value="Acme Cloud" /><div className="grid gap-2"><Label htmlFor="settings-market">{t("默认市场")}</Label><div className="relative"><Globe2Icon className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><select id="settings-market" defaultValue="us" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm"><option value="us">{t("美国市场 · 英语")}</option><option value="uk">{t("英国")} · {t("英语")}</option><option value="sg">{t("新加坡")} · {t("英语")}</option></select></div></div></div><div className="grid gap-2"><Label htmlFor="settings-domain">{t("官网域名")}</Label><Input id="settings-domain" defaultValue="https://acmecloud.example" /></div><div className="grid gap-2"><Label htmlFor="settings-alias">{t("品牌别名")}</Label><Input id="settings-alias" defaultValue="Acme, AcmeCloud" /><p className="text-xs text-muted-foreground">{t("使用英文逗号分隔，用于提高回答中的品牌识别准确率。")}</p></div></CardContent></Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("集成状态")}</CardTitle><CardDescription>{t("真实检测接入前的服务准备情况")}</CardDescription></CardHeader><CardContent className="divide-y"><IntegrationRow icon={<KeyRoundIcon />} title={t("模型密钥")} detail={t("演示模式，尚未配置")} status={t("待配置")} /><IntegrationRow icon={<DatabaseIcon />} title={t("数据存储")} detail={t("本地模拟数据")} status={t("演示")} /><IntegrationRow icon={<BellIcon />} title={t("完成通知")} detail={t("邮件通知已开启")} status={t("正常")} healthy /></CardContent></Card>
      </div>
    </div>
  )
}

function Field({ icon, id, label, value }: { icon: React.ReactNode; id: string; label: string; value: string }) { return <div className="grid gap-2"><Label htmlFor={id}>{label}</Label><div className="relative"><span className="absolute left-3 top-2.5 text-muted-foreground [&_svg]:size-4">{icon}</span><Input id={id} defaultValue={value} className="pl-9" /></div></div> }
function IntegrationRow({ icon, title, detail, status, healthy = false }: { icon: React.ReactNode; title: string; detail: string; status: string; healthy?: boolean }) { return <div className="grid grid-cols-[32px_1fr_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">{icon}</span><div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{detail}</p></div><Badge variant="outline" className={healthy ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{status}</Badge></div> }
