import { useForm } from "react-hook-form";
import { FUEL_TYPE_LABELS } from "../../lib/constants";
import type { Vehicle, FuelType } from "../../api/types";

type FormData = {
  make: string;
  model: string;
  year: string;
  color: string;
  plate: string;
  vin: string;
  fuel_type: FuelType;
  current_odometer: string;
};

interface Props {
  initial?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function VehicleForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      make: initial?.make || "",
      model: initial?.model || "",
      year: initial?.year?.toString() || "",
      color: initial?.color || "",
      plate: initial?.plate || "",
      vin: initial?.vin || "",
      fuel_type: initial?.fuel_type || "ai95",
      current_odometer: initial?.current_odometer?.toString() || "0",
    },
  });

  const submit = (d: FormData) => {
    onSubmit({
      make: d.make,
      model: d.model,
      year: d.year ? parseInt(d.year) : undefined,
      color: d.color || undefined,
      plate: d.plate || undefined,
      vin: d.vin || undefined,
      fuel_type: d.fuel_type,
      current_odometer: parseInt(d.current_odometer) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Марка *</label>
          <input className="input" placeholder="Toyota" {...register("make", { required: true })} />
        </div>
        <div className="field">
          <label className="label">Модель *</label>
          <input className="input" placeholder="Camry" {...register("model", { required: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Год</label>
          <input className="input" type="number" placeholder="2020" {...register("year")} />
        </div>
        <div className="field">
          <label className="label">Цвет</label>
          <input className="input" placeholder="Белый" {...register("color")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Госномер</label>
          <input className="input" placeholder="А123БВ77" {...register("plate")} />
        </div>
        <div className="field">
          <label className="label">Пробег (км)</label>
          <input className="input" type="number" placeholder="0" {...register("current_odometer")} />
        </div>
      </div>
      <div className="field">
        <label className="label">Тип топлива</label>
        <select className="select" {...register("fuel_type")}>
          {Object.entries(FUEL_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label">VIN</label>
        <input className="input" placeholder="Необязательно" {...register("vin")} />
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
