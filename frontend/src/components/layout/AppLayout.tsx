import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Car, Wrench, Fuel, BarChart2, Search } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { VehicleSwitcher } from "../VehicleSwitcher";

export function AppLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", icon: Wrench, label: "Обслуж." },
    { to: "/fuel", icon: Fuel, label: "Заправки" },
    { to: "/stats", icon: BarChart2, label: "Статист." },
    { to: "/search", icon: Search, label: "Поиск" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2 mr-auto min-w-0">
          <Car size={20} className="text-blue-600 shrink-0" />
          <span className="font-bold text-gray-900 text-base">Автотека</span>
        </div>
        <VehicleSwitcher />
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition ml-1 shrink-0">
          Выйти
        </button>
      </header>

      {/* Content — padding-bottom accounts for fixed nav + iPhone home bar */}
      <main className="flex-1 pb-nav overflow-x-hidden">
        <Outlet />
      </main>

      {/* Bottom nav — fixed, always visible, respects iPhone home bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-gray-100 flex z-40 pb-safe">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
