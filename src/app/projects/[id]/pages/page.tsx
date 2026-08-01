import { ProjectPages } from "@/components/project-pages"

export default async function ProjectPagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectPages projectId={id} />
}
