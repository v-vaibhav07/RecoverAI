import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User as UserIcon, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Dropdown from "../common/Dropdown";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, merchant, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const displayName = merchant?.business_name || user?.email || "Merchant";

  return (
    <header className="flex h-16 flex-none items-center justify-between border-b border-bg-border bg-bg-surface/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-text-muted hover:text-text-primary lg:hidden">
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Search…"
            className="w-72 rounded-lg border border-bg-border bg-bg-elevated py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center rounded-lg border border-bg-border bg-bg-surface p-0.5" aria-label="Theme">
          <button
            type="button"
            onClick={() => theme !== "light" && toggleTheme()}
            aria-label="Use light mode"
            aria-pressed={theme === "light"}
            className={`rounded-md p-1.5 transition-colors ${
              theme === "light" ? "bg-bg-elevated text-brand" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Sun size={15} />
          </button>
          <button
            type="button"
            onClick={() => theme !== "dark" && toggleTheme()}
            aria-label="Use dark mode"
            aria-pressed={theme === "dark"}
            className={`rounded-md p-1.5 transition-colors ${
              theme === "dark" ? "bg-bg-elevated text-brand" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Moon size={15} />
          </button>
        </div>
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-bg-elevated">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-dark">
                <UserIcon size={14} />
              </div>
              <span className="hidden text-sm font-medium text-text-primary sm:block">{displayName}</span>
            </button>
          }
          items={[
            {
              label: "Settings",
              onClick: () => navigate("/settings"),
              icon: <UserIcon size={14} />,
            },
            {
              label: "Logout",
              onClick: () => {
                logout();
                navigate("/login");
              },
              danger: true,
              icon: <LogOut size={14} />,
            },
          ]}
        />
      </div>
    </header>
  );
}
