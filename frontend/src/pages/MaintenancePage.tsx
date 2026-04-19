import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Pencil, Trash2 } from "lucide-react";
import { maintenanceApi, getPhotoUrl } from "../api";
import { PhotoLightbox } from "../components/ui/PhotoLightbox";
import { useVehicleStore } from "../store/vehicles";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { MaintenanceForm } from "../components/forms/MaintenanceForm";
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from "../lib/constants";
import { PlannedSection } from "../components/PlannedSection";
import { VehicleCard } from "../components/VehicleCard";
import { formatDate, formatMoney, formatOdometer } from "../lib/utils";
import type { MaintenanceRecord, MaintenanceCategory } from "../api/types";

export function MaintenancePage() {
  const { activeVehicleId } = useVehicleStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<MaintenanceRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<MaintenanceCategory | "">("");
  const [showFilter, setShowFilter] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["maintenance", activeVehicleId, filterCategory],
    queryFn: () =>
      maintenanceApi.list(activeVehicleId!, filterCategory ? { category: filterCategory } : undefined)
        .then((r) => r.data),
    enabled: !!activeVehicleId,
  });

  const { data: allRecords = [] } = useQuery({
    queryKey: ["maintenance", activeVehicleId],
    queryFn: () => maintenanceApi.list(activeVehicleId!).then((r) => r.data),
    enabled: !!activeVehicleId,
  });

  const locationSuggestions = [...new Set(allRecords.map((r) => r.location).filter(Boolean) as string[])];

  const createMutation = useMutation({
    mutationFn: (data: Partial<MaintenanceRecord>) => maintenanceApi.create(activeVehicleId!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["maintenance"] }); qc.invalidateQueries({ queryKey: ["vehicles"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaintenanceRecord> }) =>
      maintenanceApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["maintenance"] }); qc.invalidateQueries({ queryKey: ["vehicles"] }); setEditRecord(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => maintenanceApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["maintenance"] }); setDeleteId(null); },
  });

  if (!activeVehicleId) {
    return <EmptyState icon="🚗" title="Выберите авто" description="Нажмите на кнопку с названием авто вверху" />;
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          className={`btn-ghost px-3 py-1.5 rounded-lg text-sm gap-1.5 ${filterCategory ? "text-blue-600 bg-blue-50" : ""}`}
          onClick={() => setShowFilter(true)}
        >
          <Filter size={15} /> Фильтр{filterCategory ? ` · ${CATEGORY_LABELS[filterCategory]}` : ""}
        </button>
        <span className="ml-auto text-xs text-gray-400">{records.length} записей</span>
        <button className="btn-primary px-3 py-1.5" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Добавить
        </button>
      </div>

      {/* Vehicle card */}
      <VehicleCard />

      {/* Planned section */}
      <div className="px-4 pt-3 pb-1">
        <PlannedSection vehicleId={activeVehicleId} />
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="w-6 h-6 text-blue-500" /></div>
      ) : records.length === 0 ? (
        <EmptyState
          icon="🔧"
          title="Записей нет"
          description="Добавьте первую запись об обслуживании"
          action={<button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Добавить</button>}
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {records.map((r) => (
            <div key={r.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition group">
              <div className="text-2xl mt-0.5 shrink-0">{CATEGORY_ICONS[r.category]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[r.category]}`}>
                    {CATEGORY_LABELS[r.category]}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                </div>
                <p className="font-medium text-sm text-gray-900 mt-0.5 truncate">{r.title}</p>
                {r.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>}
                {r.location && <p className="text-xs text-gray-500 truncate">📍 {r.location}</p>}
                {r.odometer && <p className="text-xs text-gray-400">{formatOdometer(r.odometer)}</p>}
                {r.notes && <p className="text-xs text-gray-400 line-clamp-1 italic">{r.notes}</p>}
                {r.photos?.length > 0 && (
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {r.photos.map((p) => (
                      <img
                        key={p.id}
                        src={getPhotoUrl(p.filename)}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg cursor-pointer"
                        onClick={() => setLightboxSrc(getPhotoUrl(p.filename))}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {r.cost != null && (
                    <span className="text-sm font-semibold text-gray-800">{formatMoney(r.cost)}</span>
                  )}
                  {(r.next_date || (r.next_odometer != null && r.next_odometer > 0)) && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      след.{r.next_date ? ` ${formatDate(r.next_date)}` : ""}{r.next_date && r.next_odometer ? " / " : ""}{r.next_odometer != null && r.next_odometer > 0 ? ` ${r.next_odometer.toLocaleString("ru-RU")} км` : ""}
                    </span>
                  )}
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
          ))}
        </div>
      )}

      {/* Filter modal */}
      <Modal open={showFilter} onClose={() => setShowFilter(false)} title="Фильтр по категории">
        <div className="flex flex-col gap-1">
          <button
            className={`text-left px-3 py-2.5 rounded-xl text-sm transition ${!filterCategory ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"}`}
            onClick={() => { setFilterCategory(""); setShowFilter(false); }}
          >
            Все категории
          </button>
          {(Object.entries(CATEGORY_LABELS) as [MaintenanceCategory, string][]).map(([v, l]) => (
            <button
              key={v}
              className={`text-left px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-2 ${filterCategory === v ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"}`}
              onClick={() => { setFilterCategory(v); setShowFilter(false); }}
            >
              <span>{CATEGORY_ICONS[v]}</span> {l}
            </button>
          ))}
        </div>
      </Modal>

      {/* Add form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Новая запись">
        <MaintenanceForm
          locationSuggestions={locationSuggestions}
          loading={createMutation.isPending}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit form */}
      <Modal open={!!editRecord} onClose={() => setEditRecord(null)} title="Редактировать запись">
        {editRecord && (
          <MaintenanceForm
            initial={editRecord}
            locationSuggestions={locationSuggestions}
            loading={updateMutation.isPending}
            onSubmit={(data) => updateMutation.mutate({ id: editRecord.id, data })}
            onCancel={() => setEditRecord(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        message="Удалить эту запись? Действие необратимо."
        loading={deleteMutation.isPending}
      />

      {lightboxSrc && <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
