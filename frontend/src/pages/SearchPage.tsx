import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Pencil, Trash2 } from "lucide-react";
import { searchApi, maintenanceApi, fuelApi, getPhotoUrl } from "../api";
import { useVehicleStore } from "../store/vehicles";
import { Spinner } from "../components/ui/Spinner";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { MaintenanceForm } from "../components/forms/MaintenanceForm";
import { FuelForm } from "../components/forms/FuelForm";
import { PhotoLightbox } from "../components/ui/PhotoLightbox";
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from "../lib/constants";
import { formatDate, formatMoney, formatOdometer } from "../lib/utils";
import type { SearchResult, MaintenanceRecord, FuelRecord } from "../api/types";

export function SearchPage() {
  const { activeVehicleId } = useVehicleStore();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editRecord, setEditRecord] = useState<SearchResult | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<SearchResult | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleInput = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  };

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", debouncedQuery, activeVehicleId],
    queryFn: () => searchApi.search(debouncedQuery, activeVehicleId || undefined).then((r) => r.data),
    enabled: debouncedQuery.length >= 1,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["search"] });
    qc.invalidateQueries({ queryKey: ["maintenance"] });
    qc.invalidateQueries({ queryKey: ["fuel"] });
  };

  const updateMaintenance = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaintenanceRecord> }) => maintenanceApi.update(id, data),
    onSuccess: () => { invalidate(); setEditRecord(null); },
  });

  const updateFuel = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FuelRecord> }) => fuelApi.update(id, data),
    onSuccess: () => { invalidate(); setEditRecord(null); },
  });

  const deleteMaintenance = useMutation({
    mutationFn: (id: number) => maintenanceApi.delete(id),
    onSuccess: () => { invalidate(); setDeleteRecord(null); },
  });

  const deleteFuel = useMutation({
    mutationFn: (id: number) => fuelApi.delete(id),
    onSuccess: () => { invalidate(); setDeleteRecord(null); },
  });

  const isDeleting = deleteMaintenance.isPending || deleteFuel.isPending;

  return (
    <div className="flex flex-col">
      {/* Search input */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 pr-9"
            placeholder="Поиск по записям..."
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            autoFocus
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner className="w-4 h-4 text-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {query.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <Search size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-500 text-sm">Начните вводить текст для поиска</p>
          <p className="text-gray-400 text-xs mt-1">По названию, описанию, месту, заметкам</p>
        </div>
      ) : results.length === 0 && !isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <p className="text-gray-500 text-sm">Ничего не найдено по запросу «{query}»</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {results.map((r) => <SearchCard key={`${r.type}-${r.id}`} r={r} onEdit={setEditRecord} onDelete={setDeleteRecord} onPhotoClick={setLightboxSrc} />)}
          {results.length > 0 && (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">{results.length} результатов</div>
          )}
        </div>
      )}

      {/* Edit maintenance */}
      <Modal open={editRecord?.type === "maintenance"} onClose={() => setEditRecord(null)} title="Редактировать запись">
        {editRecord?.type === "maintenance" && (
          <MaintenanceForm
            initial={editRecord as Partial<MaintenanceRecord>}
            loading={updateMaintenance.isPending}
            onSubmit={(data) => updateMaintenance.mutate({ id: editRecord.id, data })}
            onCancel={() => setEditRecord(null)}
          />
        )}
      </Modal>

      {/* Edit fuel */}
      <Modal open={editRecord?.type === "fuel"} onClose={() => setEditRecord(null)} title="Редактировать заправку">
        {editRecord?.type === "fuel" && (
          <FuelForm
            initial={editRecord as Partial<FuelRecord>}
            loading={updateFuel.isPending}
            onSubmit={(data) => updateFuel.mutate({ id: editRecord.id, data })}
            onCancel={() => setEditRecord(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteRecord !== null}
        onClose={() => setDeleteRecord(null)}
        onConfirm={() => {
          if (!deleteRecord) return;
          if (deleteRecord.type === "maintenance") deleteMaintenance.mutate(deleteRecord.id);
          else deleteFuel.mutate(deleteRecord.id);
        }}
        message="Удалить эту запись? Действие необратимо."
        loading={isDeleting}
      />

      {lightboxSrc && <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}

function SearchCard({ r, onEdit, onDelete, onPhotoClick }: { r: SearchResult; onEdit: (r: SearchResult) => void; onDelete: (r: SearchResult) => void; onPhotoClick: (src: string) => void }) {
  if (r.type === "maintenance") {
    const cat = r.category as keyof typeof CATEGORY_LABELS;
    return (
      <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition group">
        <div className="text-2xl mt-0.5 shrink-0">{CATEGORY_ICONS[cat] || "🔧"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat]}`}>
              {CATEGORY_LABELS[cat]}
            </span>
            <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
            <span className="text-xs text-gray-300">{r.vehicle_name}</span>
          </div>
          <p className="font-medium text-sm text-gray-900 mt-0.5 truncate">{r.title}</p>
          {r.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>}
          {r.location && <p className="text-xs text-gray-500 truncate">📍 {r.location}</p>}
          {r.odometer && r.odometer > 0 && <p className="text-xs text-gray-400">{formatOdometer(r.odometer)}</p>}
          {r.notes && <p className="text-xs text-gray-400 line-clamp-1 italic">{r.notes}</p>}
          {r.photos?.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {r.photos.map((p) => (
                <img
                  key={p.id}
                  src={getPhotoUrl(p.filename)}
                  alt=""
                  className="w-12 h-12 object-cover rounded-lg cursor-pointer"
                  onClick={() => onPhotoClick(getPhotoUrl(p.filename))}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {r.cost != null && <span className="text-sm font-semibold text-gray-800">{formatMoney(r.cost)}</span>}
            {(r.next_date || (r.next_odometer != null && r.next_odometer > 0)) && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                след.{r.next_date ? ` ${formatDate(r.next_date)}` : ""}{r.next_date && r.next_odometer ? " / " : ""}{r.next_odometer != null && r.next_odometer > 0 ? ` ${r.next_odometer.toLocaleString("ru-RU")} км` : ""}
              </span>
            )}
          </div>
        </div>
        <Actions onEdit={() => onEdit(r)} onDelete={() => onDelete(r)} />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition group">
      <div className="text-2xl mt-0.5 shrink-0">⛽</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
          <span className="text-xs text-gray-300">{r.vehicle_name}</span>
        </div>
        {r.station_name && <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">📍 {r.station_name}</p>}
        <div className="flex items-center gap-3 mt-1">
          {r.cost != null && <span className="text-sm font-semibold text-gray-800">{formatMoney(r.cost)}</span>}
          {r.liters != null && <span className="text-sm text-gray-600">{r.liters} л</span>}
          {r.price_per_liter != null && <span className="text-xs text-gray-400">{r.price_per_liter} ₽/л</span>}
        </div>
        {r.odometer && r.odometer > 0 && <p className="text-xs text-gray-400">{formatOdometer(r.odometer)}</p>}
        {r.notes && <p className="text-xs text-gray-400 line-clamp-1 italic">{r.notes}</p>}
      </div>
      <Actions onEdit={() => onEdit(r)} onDelete={() => onDelete(r)} />
    </div>
  );
}

function Actions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5">
      <button className="btn-ghost p-1.5 rounded-lg" onClick={onEdit}><Pencil size={14} /></button>
      <button className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-500" onClick={onDelete}><Trash2 size={14} /></button>
    </div>
  );
}
