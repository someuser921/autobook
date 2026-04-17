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
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-2 mr-auto">
          <Car size={20} className="text-blue-600" />
          <span className="font-bold text-gray-900 text-base">Автотека</span>
        </div>
        <VehicleSwitcher />
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition ml-1">
          Выйти
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-gray-100 flex z-40 safe-area-bottom">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
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
