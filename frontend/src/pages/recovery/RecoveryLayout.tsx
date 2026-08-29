import { NavLink, Outlet } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";

const tabs = [
  { to: "/recovery", label: "Cases", end: true },
  { to: "/recovery/strategies", label: "Strategies" },
  { to: "/recovery/actions", label: "Actions" },
];

export default function RecoveryLayout() {
  return (
    <div>
      <PageHeader title="Recovery" description="Cases, strategies, and actions that make up your recovery pipeline." />
      <div className="mb-6 flex gap-1 border-b border-bg-border">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors ${
                isActive ? "border-brand text-text-primary" : "border-transparent text-text-muted hover:text-text-secondary"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
