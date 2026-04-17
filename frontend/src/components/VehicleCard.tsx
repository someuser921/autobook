import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Check, X, Gauge } from "lucide-react";
import { vehiclesApi, maintenanceApi, plannedApi } from "../api";
import { useVehicleStore } from "../store/vehicles";
import { CarLogo } from "./ui/CarLogo";
import { differenceInDays, parseISO, format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Vehicle, MaintenanceRecord, PlannedItem } from "../api/types";

function NextServiceBadge({ vehicleId }: { vehicleId: number }) {
  const today = new Date();

  const { data: records = [] } = useQuery<MaintenanceRecord[]>({
    queryKey: ["maintenance", vehicleId],
    queryFn: () => maintenanceApi.list(vehicleId).then((r) => r.data),
  });

  const { data: planned = [] } = useQuery<PlannedItem[]>({
    queryKey: ["planned", vehicleId],
    queryFn: () => plannedApi.list(vehicleId).then((r) => r.data),
  });

  // Collect all upcoming dates
  const upcoming: { title: string; date: Date }[] = [];

  records.forEach((r) => {
    if (r.next_date) {
      upcoming.push({ title: r.title, date: parseISO(r.next_date) });
    }
  });
  planned.forEach((p) => {
    if (p.due_date) {
      upcoming.push({ title: p.title, date: parseISO(p.due_date) });
    }
  });

  // Sort, take nearest future
  const future = upcoming
    .filter((u) => u.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (future.length === 0) return null;

  const next = future[0];
  const days = differenceInDays(next.date, today);
  const dateStr = format(next.date, "d MMM", { locale: ru });

  const color = days <= 7 ? "text-red-500 bg-red-50" : days <= 30 ? "text-amber-600 bg-amber-50" : "text-blue-600 bg-blue-50";

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${color}`}>
      <span>🔧</span>
      <span className="truncate max-w-[120px]">{next.title}</span>
      <span className="shrink-0">— {days === 0 ? "сегодня" : `${dateStr} (${days} дн.)`}</span>
    </div>
  );
}

export function VehicleCard() {
  const { activeVehicleId } = useVehicleStore();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const qc = useQueryClient();

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  });

  const vehicle = vehicles.find((v) => v.id === activeVehicleId);

  const updateMutation = useMutation({
    mutationFn: (odometer: number) =>
      vehiclesApi.update(activeVehicleId!, { current_odometer: odometer }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setEditing(false);
    },
  });

  if (!vehicle) return null;

  const startEdit = () => {
    setInputValue(vehicle.current_odometer > 0 ? vehicle.current_odometer.toString() : "");
    setEditing(true);
  };

  const save = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val) && val >= 0) updateMutation.mutate(val);
  };

  return (
    <div className="card px-4 py-3 mx-4 mt-3 flex flex-col gap-2">
      {/* Top row: logo + name + odometer */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <CarLogo make={vehicle.make} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">
            {vehicle.make} {vehicle.model}
          </div>
          {vehicle.plate && (
            <div className="text-xs text-gray-400">{vehicle.plate}</div>
          )}
        </div>

        {/* Odometer */}
        <div className="flex items-center gap-1.5 shrink-0">
          {editing ? (
            <div className="flex items-center gap-1">
              <Gauge size={14} className="text-gray-400" />
              <input
                autoFocus
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
                className="w-24 px-2 py-1 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                style={{ fontSize: 16 }}
              />
              <span className="text-xs text-gray-500">км</span>
              <button onClick={save} disabled={updateMutation.isPending}
                className="p-1 rounded-lg text-green-600 hover:bg-green-50 transition">
                <Check size={15} />
              </button>
              <button onClick={() => setEditing(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <X size={15} />
              </button>
            </div>
          ) : (
            <button onClick={startEdit}
              className="flex items-center gap-1.5 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-lg transition">
              <Gauge size={14} className="text-gray-400" />
              <span className="font-medium">
                {vehicle.current_odometer > 0
                  ? vehicle.current_odometer.toLocaleString("ru-RU") + " км"
                  : "— км"}
              </span>
              <Pencil size={12} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Next service */}
      <NextServiceBadge vehicleId={vehicle.id} />
    </div>
  );
}
