import { useForm } from "react-hook-form";
import { FUEL_TYPE_LABELS } from "../../lib/constants";
import { today } from "../../lib/utils";
import type { FuelRecord, FuelType } from "../../api/types";

type FormData = {
  date: string;
  liters: string;
  total_cost: string;
  fuel_type_override: string;
  odometer: string;
  station_name: string;
  notes: string;
};

interface Props {
  initial?: Partial<FuelRecord>;
  defaultFuelType?: FuelType;
  onSubmit: (data: Partial<FuelRecord>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function FuelForm({ initial, defaultFuelType = "ai95", onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      date: initial?.date || today(),
      liters: initial?.liters?.toString() || "",
      total_cost: initial?.total_cost?.toString() || "",
      fuel_type_override: initial?.fuel_type_override || "",
      odometer: initial?.odometer?.toString() || "",
      station_name: initial?.station_name || "",
      notes: initial?.notes || "",
    },
  });

  const liters = parseFloat(watch("liters") || "0");
  const cost = parseFloat(watch("total_cost") || "0");
  const pricePerLiter = liters > 0 && cost > 0 ? (cost / liters).toFixed(2) : null;

  const submit = (d: FormData) => {
    onSubmit({
      date: d.date,
      liters: parseFloat(d.liters),
      total_cost: parseFloat(d.total_cost),
      fuel_type_override: (d.fuel_type_override as FuelType) || undefined,
      odometer: d.odometer ? parseInt(d.odometer) : undefined,
      station_name: d.station_name || undefined,
      notes: d.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div className="field">
        <label className="label">Дата *</label>
        <input className="input" type="date" {...register("date", { required: true })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Литры *</label>
          <input className="input" type="number" step="0.01" placeholder="40" {...register("liters", { required: true })} />
        </div>
        <div className="field">
          <label className="label">Сумма (₽) *</label>
          <input className="input" type="number" step="0.01" placeholder="2800" {...register("total_cost", { required: true })} />
        </div>
      </div>

      {pricePerLiter && (
        <div className="bg-blue-50 rounded-xl px-3 py-2 text-sm text-blue-700 text-center">
          {pricePerLiter} ₽/л
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Тип топлива</label>
          <select className="select" {...register("fuel_type_override")}>
            <option value="">По умолч. ({FUEL_TYPE_LABELS[defaultFuelType]})</option>
            {Object.entries(FUEL_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label">Пробег (км)</label>
          <input className="input" type="number" placeholder="—" {...register("odometer")} />
        </div>
      </div>
      <div className="field">
        <label className="label">Заправка</label>
        <input className="input" placeholder="Название / адрес" {...register("station_name")} />
      </div>
      <div className="field">
        <label className="label">Заметки</label>
        <textarea className="input resize-none" rows={2} placeholder="..." {...register("notes")} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>Отмена</button>
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
