import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { plannedApi } from "../api";
import { Modal } from "./ui/Modal";
import { PlannedForm } from "./forms/PlannedForm";
import { MaintenanceForm } from "./forms/MaintenanceForm";
import { maintenanceApi } from "../api";
import type { PlannedItem, MaintenanceRecord } from "../api/types";
import { format, isPast, differenceInDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface Props {
  vehicleId: number;
}

function urgencyInfo(due_date: string | null): { icon: React.ReactNode; color: string; label: string } | null {
  if (!due_date) return null;
  const d = parseISO(due_date);
  const days = differenceInDays(d, new Date());
  if (isPast(d) && days < 0) {
    return { icon: <AlertCircle size={14} />, color: "text-red-500", label: "Просрочено" };
  }
  if (days <= 14) {
    return { icon: <Clock size={14} />, color: "text-amber-500", label: `Через ${days} дн.` };
  }
  return { icon: <Clock size={14} />, color: "text-gray-400", label: format(d, "d MMM yyyy", { locale: ru }) };
}

export function PlannedSection({ vehicleId }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<PlannedItem | null>(null);
  const [completing, setCompleting] = useState<PlannedItem | null>(null);
  const qc = useQueryClient();

  const { data: items = [] } = useQuery<PlannedItem[]>({
    queryKey: ["planned", vehicleId],
    queryFn: () => plannedApi.list(vehicleId).then((r) => r.data),
    enabled: !!vehicleId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<PlannedItem>) => plannedApi.create(vehicleId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["planned", vehicleId] }); setShowAdd(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PlannedItem> }) => plannedApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["planned", vehicleId] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => plannedApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planned", vehicleId] }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ planned_id, record }: { planned_id: number; record: Partial<MaintenanceRecord> }) =>
      maintenanceApi.create(vehicleId, record).then(async () => {
        await plannedApi.update(planned_id, { is_done: true });
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planned", vehicleId] });
      qc.invalidateQueries({ queryKey: ["maintenance", vehicleId] });
      setCompleting(null);
    },
  });

  if (items.length === 0 && !showAdd) {
    return (
      <div className="card px-4 py-3 flex items-center justify-between gap-2">
        <span className="text-sm text-gray-500">Нет запланированных работ</span>
        <button onClick={() => setShowAdd(true)} className="btn-primary py-1.5 px-3 text-xs">
          <Plus size={13} /> Добавить
        </button>

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Запланировать работу">
          <PlannedForm
            loading={createMutation.isPending}
            onSubmit={(d) => createMutation.mutate(d)}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
          onClick={() => setCollapsed((p) => !p)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Запланировано</span>
            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAdd(true)}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
            >
              <Plus size={16} />
            </button>
            <button onClick={() => setCollapsed((p) => !p)} className="p-1 text-gray-400">
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Items */}
        {!collapsed && (
          <div className="divide-y divide-gray-50">
            {items.map((item) => {
              const urgency = urgencyInfo(item.due_date);
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <button
                    onClick={() => setCompleting(item)}
                    className="mt-0.5 shrink-0 text-gray-300 hover:text-green-500 transition"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{item.title}</div>
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{item.notes}</div>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {item.estimated_cost != null && (
                        <span className="text-xs text-gray-500">
                          ~{item.estimated_cost.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                      {urgency && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${urgency.color}`}>
                          {urgency.icon}
                          {urgency.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditing(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Запланировать работу">
        <PlannedForm
          loading={createMutation.isPending}
          onSubmit={(d) => createMutation.mutate(d)}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Редактировать план">
        {editing && (
          <PlannedForm
            initial={editing}
            loading={updateMutation.isPending}
            onSubmit={(d) => updateMutation.mutate({ id: editing.id, data: d })}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Complete: open maintenance form pre-filled */}
      <Modal open={!!completing} onClose={() => setCompleting(null)} title="Отметить как выполнено">
        {completing && (
          <MaintenanceForm
            initial={{
              title: completing.title,
              cost: completing.estimated_cost ?? undefined,
              date: new Date().toISOString().split("T")[0],
            }}
            loading={completeMutation.isPending}
            onSubmit={(d) =>
              completeMutation.mutate({ planned_id: completing.id, record: d })
            }
            onCancel={() => setCompleting(null)}
          />
        )}
      </Modal>
    </>
  );
}
