import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fuelApi, vehiclesApi } from "../api";
import { useVehicleStore } from "../store/vehicles";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { FuelForm } from "../components/forms/FuelForm";
import { FUEL_TYPE_LABELS } from "../lib/constants";
import { formatDate, formatMoney } from "../lib/utils";
import type { FuelRecord } from "../api/types";

export function FuelPage() {
  const { activeVehicleId } = useVehicleStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<FuelRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: vehicle } = useQuery({
    queryKey: ["vehicle", activeVehicleId],
    queryFn: () => vehiclesApi.list().then((r) => r.data.find((v) => v.id === activeVehicleId)),
    enabled: !!activeVehicleId,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["fuel", activeVehicleId],
    queryFn: () => fuelApi.list(activeVehicleId!).then((r) => r.data),
    enabled: !!activeVehicleId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<FuelRecord>) => fuelApi.create(activeVehicleId!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fuel"] }); qc.invalidateQueries({ queryKey: ["vehicles"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FuelRecord> }) => fuelApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fuel"] }); qc.invalidateQueries({ queryKey: ["vehicles"] }); setEditRecord(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fuelApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fuel"] }); setDeleteId(null); },
  });

  if (!activeVehicleId) {
    return <EmptyState icon="🚗" title="Выберите авто" />;
  }

  const totalSpent = records.reduce((s, r) => s + r.total_cost, 0);
  const totalLiters = records.reduce((s, r) => s + r.liters, 0);

  return (
    <div className="flex flex-col">
      {/* Summary bar */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-0 border-b border-gray-100 bg-white">
          <div className="flex flex-col items-center py-3 border-r border-gray-100">
            <span className="text-lg font-bold text-gray-900">{records.length}</span>
            <span className="text-xs text-gray-500">заправок</span>
          </div>
          <div className="flex flex-col items-center py-3 border-r border-gray-100">
            <span className="text-lg font-bold text-gray-900">{totalLiters.toFixed(0)} л</span>
            <span className="text-xs text-gray-500">всего</span>
          </div>
          <div className="flex flex-col items-center py-3">
            <span className="text-lg font-bold text-gray-900">{formatMoney(totalSpent)}</span>
            <span className="text-xs text-gray-500">потрачено</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
        <span className="text-sm text-gray-500 mr-auto">
          Топливо: <span className="font-medium text-gray-700">{vehicle ? FUEL_TYPE_LABELS[vehicle.fuel_type] : "—"}</span>
        </span>
        <button className="btn-primary px-3 py-1.5" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Заправка
        </button>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="w-6 h-6 text-blue-500" /></div>
      ) : records.length === 0 ? (
        <EmptyState
          icon="⛽"
          title="Заправок нет"
          description="Добавьте первую запись о заправке"
          action={<button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Добавить</button>}
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {records.map((r) => {
            const fuelType = r.fuel_type_override || vehicle?.fuel_type;
            return (
              <div key={r.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                <div className="text-2xl mt-0.5">⛽</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                    {fuelType && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {FUEL_TYPE_LABELS[fuelType]}
                      </span>
                    )}
                  </div>
                  {r.station_name && <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">📍 {r.station_name}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-semibold text-gray-800">{formatMoney(r.total_cost)}</span>
                    <span className="text-sm text-gray-600">{r.liters} л</span>
                    <span className="text-xs text-gray-400">{r.price_per_liter} ₽/л</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5">
                  <button className="btn-ghost p-1.5 rounded-lg" onClick={() => setEditRecord(r)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-500" onClick={() => setDeleteId(r.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Новая заправка">
        <FuelForm
          defaultFuelType={vehicle?.fuel_type}
          loading={createMutation.isPending}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={!!editRecord} onClose={() => setEditRecord(null)} title="Редактировать заправку">
        {editRecord && (
          <FuelForm
            initial={editRecord}
            defaultFuelType={vehicle?.fuel_type}
            loading={updateMutation.isPending}
            onSubmit={(data) => updateMutation.mutate({ id: editRecord.id, data })}
            onCancel={() => setEditRecord(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        message="Удалить эту запись о заправке?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
