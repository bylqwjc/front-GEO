import { ProjectModuleEmpty } from "@/components/project-module-empty"

export default async function ProjectComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectModuleEmpty projectId={id} module="compare" />
}

