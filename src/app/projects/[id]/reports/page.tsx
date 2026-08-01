import { ProjectReport } from "@/components/project-report"

export default async function ProjectReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ audit?: string }>
}) {
  const [{ id }, { audit }] = await Promise.all([params, searchParams])
  return <ProjectReport projectId={id} initialAuditId={audit} />
}
