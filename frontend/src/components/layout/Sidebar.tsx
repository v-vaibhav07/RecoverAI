import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  ShieldAlert,
  Megaphone,
  ShoppingCart,
  Receipt,
  RefreshCw,
  CreditCard as CheckoutIcon,
  Bell,
  Layers,
  Settings,
  Activity,
  FileClock,
  Sparkles,
  X,
} from "lucide-react";
import { EASE } from "../../lib/motion";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const nav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={17} /> },
  { label: "Customers", to: "/customers", icon: <Users size={17} /> },
  { label: "Products", to: "/products", icon: <Package size={17} /> },
  { label: "Payments", to: "/payments", icon: <CreditCard size={17} /> },
  { label: "Recovery", to: "/recovery", icon: <ShieldAlert size={17} /> },
  { label: "Campaigns", to: "/campaigns", icon: <Megaphone size={17} /> },
  { label: "Orders", to: "/orders", icon: <ShoppingCart size={17} /> },
  { label: "Transactions", to: "/transactions", icon: <Receipt size={17} /> },
  { label: "Subscriptions", to: "/subscriptions", icon: <RefreshCw size={17} /> },
  { label: "Checkout Sessions", to: "/checkout-sessions", icon: <CheckoutIcon size={17} /> },
  { label: "AI", to: "/ai", icon: <Sparkles size={17} /> },
  { label: "Notifications", to: "/notifications", icon: <Bell size={17} /> },
  { label: "Segments", to: "/customer-segments", icon: <Layers size={17} /> },
  { label: "Events", to: "/events", icon: <Activity size={17} /> },
  { label: "Audit Logs", to: "/audit-logs", icon: <FileClock size={17} /> },
  { label: "Settings", to: "/settings", icon: <Settings size={17} /> },
];

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed z-50 flex h-full w-64 flex-col border-r border-navy-border bg-navy transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
              <Sparkles size={15} />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">RecoverAI</span>
          </div>
          <button onClick={onClose} className="text-navy-muted hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>
        <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-3 pb-4 scrollbar-none">
          {nav.map((item) => {
            const isActive =
              item.to === "/dashboard"
                ? location.pathname === "/dashboard" || location.pathname === "/"
                : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-muted transition-colors hover:text-white"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    transition={{ duration: 0.28, ease: EASE }}
                    className="absolute inset-0 rounded-lg bg-brand/20 ring-1 ring-inset ring-brand/40"
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2.5 ${isActive ? "text-brand-light" : ""}`}>
                  {item.icon}
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
