import { ProjectAudits } from "@/components/project-audits"

export default async function ProjectAuditsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectAudits projectId={id} />
}
