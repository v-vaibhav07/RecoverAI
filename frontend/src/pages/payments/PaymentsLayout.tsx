import { NavLink, Outlet } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";

const tabs = [
  { to: "/payments", label: "Payments", end: true },
  { to: "/payments/failures", label: "Failures" },
  { to: "/payments/attempts", label: "Attempts" },
];

export default function PaymentsLayout() {
  return (
    <div>
      <PageHeader title="Payments" description="Payments, failure diagnostics, and retry attempts." />
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
