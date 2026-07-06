import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  RefreshCw,
  Settings,
  GraduationCap,
  LogOut,
  ExternalLink,
} from "lucide-react";

const NAV = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Огляд" },
  { to: "/admin/products", icon: BookOpen, label: "Курси" },
  { to: "/admin/customers", icon: Users, label: "Покупці" },
  { to: "/admin/purchases", icon: CreditCard, label: "Продажі" },
  { to: "/admin/sync", icon: RefreshCw, label: "Синхронізація" },
  { to: "/admin/settings", icon: Settings, label: "Налаштування" },
];

export function Layout() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border">
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm">Happy English</div>
              <div className="text-[11px] text-muted-foreground">Адмін-панель</div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-sidebar-border space-y-1">
            <a
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ExternalLink className="w-[18px] h-[18px]" />
              Відкрити сайт
            </a>
            <div className="px-3 pt-2 text-[11px] text-muted-foreground truncate">
              {session?.user.email}
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3" onClick={handleSignOut}>
              <LogOut className="w-[18px] h-[18px]" />
              Вийти
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 md:ml-64 min-w-0">
          {/* Mobile top nav */}
          <div className="md:hidden sticky top-0 z-20 bg-sidebar border-b border-sidebar-border">
            <div className="h-14 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm">Happy English</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
            <nav className="flex gap-1 px-2 pb-2 overflow-x-auto">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <main className="p-4 md:p-8 max-w-6xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
