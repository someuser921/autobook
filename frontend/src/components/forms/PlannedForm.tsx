import { useForm } from "react-hook-form";
import type { PlannedItem } from "../../api/types";

type FormData = {
  title: string;
  notes: string;
  estimated_cost: string;
  due_date: string;
};

interface Props {
  initial?: Partial<PlannedItem>;
  onSubmit: (data: Partial<PlannedItem>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PlannedForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      title: initial?.title || "",
      notes: initial?.notes || "",
      estimated_cost: initial?.estimated_cost?.toString() || "",
      due_date: initial?.due_date || "",
    },
  });

  const submit = (d: FormData) => {
    onSubmit({
      title: d.title,
      notes: d.notes || undefined,
      estimated_cost: d.estimated_cost ? parseFloat(d.estimated_cost) : undefined,
      due_date: d.due_date || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div className="field">
        <label className="label">Что нужно сделать *</label>
        <input
          className="input"
          placeholder="Замена тормозных дисков"
          {...register("title", { required: true })}
        />
      </div>
      <div className="field">
        <label className="label">Примечание / триггер</label>
        <input
          className="input"
          placeholder="При износе колодок / через 10 000 км"
          {...register("notes")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Примерная стоимость</label>
          <input
            className="input"
            type="number"
            placeholder="6000"
            {...register("estimated_cost")}
          />
        </div>
        <div className="field">
          <label className="label">Срок (дата)</label>
          <input className="input" type="date" {...register("due_date")} />
        </div>
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
