import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  change,
  trend = "up",
  detail,
  icon,
  tone = "green",
}: {
  label: string;
  value: string;
  change: string;
  trend?: "up" | "down" | "flat";
  detail: string;
  icon: ReactNode;
  tone?: "green" | "blue" | "amber" | "coral";
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <article className={"metric-card metric-" + tone}>
      <div className="metric-card-top">
        <div className="metric-label">{label}</div>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value-row">
        <strong>{value}</strong>
        <span className={`trend ${trend}`}>
          <TrendIcon aria-hidden="true" size={14} />
          {change}
        </span>
      </div>
      <p>{detail}</p>
    </article>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    completed: "已完成",
    running: "检测中",
    scheduled: "已计划",
    high: "高优先级",
    medium: "中优先级",
  };
  return <span className={`status-badge ${status}`}>{labels[status] ?? status}</span>;
}
