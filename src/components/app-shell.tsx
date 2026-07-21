"use client";

import {
  Activity,
  BarChart3,
  CheckSquare2,
  FileSearch,
  Gauge,
  HelpCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "概览", icon: Gauge },
  { href: "/new", label: "新建检测", icon: FileSearch },
  { href: "/report/demo-report", label: "可见度报告", icon: BarChart3 },
  { href: "/tasks/audit-2026-0719", label: "优化任务", icon: CheckSquare2 },
  { href: "/compare/experiment-001", label: "复测对比", icon: Activity },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="GEO Pulse 首页">
          <span className="brand-mark">GP</span>
          <span>
            <strong>GEO Pulse</strong>
            <small>AI 可见度工作台</small>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="主导航">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
            const Icon = item.icon;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "nav-link active" : "nav-link"}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link className="nav-link" href="/settings">
            <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>设置</span>
          </Link>
          <button className="nav-link nav-button" type="button">
            <HelpCircle aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>帮助中心</span>
          </button>
          <div className="plan-usage">
            <div>
              <span>本月检测额度</span>
              <strong>320 / 500</strong>
            </div>
            <div className="usage-track" aria-label="已使用 64%">
              <span style={{ width: "64%" }} />
            </div>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">GP</span>
            <strong>GEO Pulse</strong>
          </div>
          <button className="workspace-switcher" type="button">
            <span className="avatar avatar-company">A</span>
            <span>
              <small>当前品牌</small>
              <strong>Acme Cloud</strong>
            </span>
          </button>
          <div className="topbar-actions">
            <span className="system-status" role="status">
              <i /> 所有引擎正常
            </span>
            <button className="avatar" title="账户" type="button">
              林
            </button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="移动端主导航">
        {navItems.slice(0, 5).map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
          const Icon = item.icon;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" size={19} />
              <span>{item.label.replace("可见度", "")}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
