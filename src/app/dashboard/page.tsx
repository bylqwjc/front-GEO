"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { FolderKanbanIcon, PlusIcon } from "lucide-react"

import { ACTIVE_PROJECT_STORAGE_KEY, ErrorState, LoadingState } from "@/components/project-shared"
import { Button } from "@/components/ui/button"
import { listProjects } from "@/lib/project-api"

export default function DashboardPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isEmpty, setIsEmpty] = useState(false)

  const openActiveProject = useCallback(async () => {
    setError("")
    setIsEmpty(false)

    try {
      const response = await listProjects()
      if (response.data.length === 0) {
        setIsEmpty(true)
        return
      }

      const storedProjectId = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY)
      const activeProject = response.data.find((project) => project.id === storedProjectId) ?? response.data[0]
      window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProject.id)
      router.replace(`/projects/${activeProject.id}`)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "项目概览加载失败。")
    }
  }, [router])

  useEffect(() => {
    const timer = window.setTimeout(() => void openActiveProject(), 0)
    return () => window.clearTimeout(timer)
  }, [openActiveProject])

  if (error) return <ErrorState message={error} retry={() => void openActiveProject()} />

  if (isEmpty) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="flex size-10 items-center justify-center rounded-md bg-muted">
          <FolderKanbanIcon className="size-5" />
        </span>
        <div>
          <h2 className="font-medium">还没有产品项目</h2>
          <p className="mt-1 text-sm text-muted-foreground">创建项目后，概览会自动打开最近使用的项目。</p>
        </div>
        <Button render={<Link href="/projects/new" />}>
          <PlusIcon data-icon="inline-start" />创建第一个项目
        </Button>
      </div>
    )
  }

  return <LoadingState label="正在打开项目概览..." />
}
