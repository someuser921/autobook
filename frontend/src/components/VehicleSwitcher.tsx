import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, Pencil } from "lucide-react";
import { vehiclesApi } from "../api";
import { useVehicleStore } from "../store/vehicles";
import { Modal } from "./ui/Modal";
import { VehicleForm } from "./forms/VehicleForm";
import type { Vehicle } from "../api/types";

export function VehicleSwitcher() {
  const { activeVehicleId, setActiveVehicle } = useVehicleStore();
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const qc = useQueryClient();

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  });

  // Auto-select first vehicle if none selected
  useEffect(() => {
    if (vehicles.length > 0 && !activeVehicleId) {
      setActiveVehicle(vehicles[0].id);
    }
  }, [vehicles, activeVehicleId, setActiveVehicle]);

  const active = vehicles.find((v) => v.id === activeVehicleId);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehiclesApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setActiveVehicle(res.data.id);
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Vehicle> }) =>
      vehiclesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setEditingVehicle(null);
    },
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-sm font-medium text-gray-700 max-w-[160px]"
      >
        <span className="truncate">{active ? `${active.make} ${active.model}` : "Авто"}</span>
        <ChevronDown size={14} className="shrink-0" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Выбор авто">
        <div className="flex flex-col gap-1 mb-3">
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center gap-1">
              <button
                onClick={() => { setActiveVehicle(v.id); setOpen(false); }}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition flex-1 min-w-0 ${
                  v.id === activeVehicleId ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-xl">🚗</span>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{v.make} {v.model}</div>
                  <div className="text-xs text-gray-500">
                    {v.year && `${v.year} · `}{v.plate && v.plate}
                  </div>
                </div>
              </button>
              <button
                onClick={() => { setOpen(false); setEditingVehicle(v); }}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition shrink-0"
              >
                <Pencil size={15} />
              </button>
            </div>
          ))}
        </div>
        <button className="btn-primary w-full" onClick={() => { setOpen(false); setShowForm(true); }}>
          <Plus size={16} /> Добавить авто
        </button>
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Новое авто">
        <VehicleForm
          loading={createMutation.isPending}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={!!editingVehicle} onClose={() => setEditingVehicle(null)} title="Редактирование авто">
        {editingVehicle && (
          <VehicleForm
            initial={editingVehicle}
            loading={updateMutation.isPending}
            onSubmit={(data) => updateMutation.mutate({ id: editingVehicle.id, data })}
            onCancel={() => setEditingVehicle(null)}
          />
        )}
      </Modal>
    </>
  );
}
