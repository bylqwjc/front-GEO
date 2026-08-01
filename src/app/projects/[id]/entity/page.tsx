import { ProjectEntity } from "@/components/project-entity"

export default async function ProjectEntityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectEntity projectId={id} />
}
