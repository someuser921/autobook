import { useForm } from "react-hook-form";
import { CATEGORY_LABELS } from "../../lib/constants";
import { today } from "../../lib/utils";
import type { MaintenanceRecord, MaintenanceCategory } from "../../api/types";

type FormData = {
  date: string;
  odometer: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  location: string;
  cost: string;
  next_date: string;
  next_odometer: string;
  notes: string;
};

interface Props {
  initial?: Partial<MaintenanceRecord>;
  onSubmit: (data: Partial<MaintenanceRecord>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function MaintenanceForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      date: initial?.date || today(),
      odometer: initial?.odometer?.toString() || "",
      category: initial?.category || "oil_fluids",
      title: initial?.title || "",
      description: initial?.description || "",
      location: initial?.location || "",
      cost: initial?.cost?.toString() || "",
      next_date: initial?.next_date || "",
      next_odometer: initial?.next_odometer?.toString() || "",
      notes: initial?.notes || "",
    },
  });

  const submit = (d: FormData) => {
    onSubmit({
      date: d.date,
      odometer: d.odometer !== "" ? parseInt(d.odometer) : null,
      category: d.category,
      title: d.title,
      description: d.description || null,
      location: d.location || null,
      cost: d.cost !== "" ? parseFloat(d.cost) : null,
      next_date: d.next_date || null,
      next_odometer: d.next_odometer !== "" ? parseInt(d.next_odometer) : null,
      notes: d.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Дата *</label>
          <input className="input" type="date" {...register("date", { required: true })} />
        </div>
        <div className="field">
          <label className="label">Пробег (км)</label>
          <input className="input" type="number" placeholder="—" {...register("odometer")} />
        </div>
      </div>
      <div className="field">
        <label className="label">Категория *</label>
        <select className="select" {...register("category", { required: true })}>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label">Название *</label>
        <input className="input" placeholder="Замена масла" {...register("title", { required: true })} />
      </div>
      <div className="field">
        <label className="label">Где сделано</label>
        <input className="input" placeholder="Сервис / сам" {...register("location")} />
      </div>
      <div className="field">
        <label className="label">Стоимость (₽)</label>
        <input className="input" type="number" step="0.01" placeholder="0" {...register("cost")} />
      </div>
      <div className="field">
        <label className="label">Описание</label>
        <textarea className="input resize-none" rows={2} placeholder="Детали..." {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Следующий раз</label>
          <input className="input" type="date" {...register("next_date")} />
        </div>
        <div className="field">
          <label className="label">Или пробег</label>
          <input className="input" type="number" placeholder="км" {...register("next_odometer")} />
        </div>
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
