import { ProjectQueries } from "@/components/project-queries"

export default async function ProjectQueriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectQueries projectId={id} />
}
