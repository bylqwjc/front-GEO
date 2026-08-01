import { ProjectOptimizationTasks } from "@/components/project-optimization-tasks"

export default async function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectOptimizationTasks projectId={id} />
}

