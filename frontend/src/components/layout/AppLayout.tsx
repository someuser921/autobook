import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Car, Wrench, Fuel, BarChart2, Search, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth";
import { useVehicleStore } from "../../store/vehicles";
import { vehiclesApi } from "../../api";
import { VehicleSwitcher } from "../VehicleSwitcher";
import { Modal } from "../ui/Modal";
import { VehicleForm } from "../forms/VehicleForm";
import type { Vehicle } from "../../api/types";

export function AppLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { setActiveVehicle } = useVehicleStore();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const qc = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehiclesApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setActiveVehicle(res.data.id);
      setShowAddVehicle(false);
    },
  });

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

  const noVehicles = !isLoading && vehicles.length === 0;

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

      {/* No vehicles — block everything */}
      {noVehicles ? (
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">🚗</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Добавьте первое авто</h2>
            <p className="text-sm text-gray-500 mt-1">Без автомобиля нельзя вести записи</p>
          </div>
          <button className="btn-primary px-6" onClick={() => setShowAddVehicle(true)}>
            <Plus size={16} /> Добавить авто
          </button>

          <Modal open={showAddVehicle} onClose={() => setShowAddVehicle(false)} title="Новое авто">
            <VehicleForm
              loading={createMutation.isPending}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowAddVehicle(false)}
            />
          </Modal>
        </main>
      ) : (
        <>
          <main className="flex-1 pb-nav overflow-x-hidden">
            <Outlet />
          </main>

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
        </>
      )}
    </div>
  );
}
