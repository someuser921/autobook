import { useForm, useWatch } from "react-hook-form";
import { FUEL_TYPE_LABELS } from "../../lib/constants";
import { CAR_MAKES, getModels } from "../../lib/carData";
import type { Vehicle, FuelType } from "../../api/types";

const CUSTOM_MAKE = "Другая марка";
const CUSTOM_MODEL = "Другая";

type FormData = {
  make_select: string;
  make_custom: string;
  model_select: string;
  model_custom: string;
  year: string;
  color: string;
  plate: string;
  vin: string;
  fuel_type: FuelType;
  current_odometer: string;
};

function resolveInitialMake(make?: string) {
  if (!make) return { make_select: "", make_custom: "" };
  const found = CAR_MAKES.find((m) => m.name === make);
  if (found) return { make_select: make, make_custom: "" };
  return { make_select: CUSTOM_MAKE, make_custom: make };
}

function resolveInitialModel(make?: string, model?: string) {
  if (!model) return { model_select: "", model_custom: "" };
  const models = getModels(make ?? "");
  if (models.includes(model)) return { model_select: model, model_custom: "" };
  return { model_select: CUSTOM_MODEL, model_custom: model };
}

interface Props {
  initial?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function VehicleForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { make_select: initMakeSelect, make_custom: initMakeCustom } = resolveInitialMake(initial?.make);
  const { model_select: initModelSelect, model_custom: initModelCustom } = resolveInitialModel(initial?.make, initial?.model);

  const { register, handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      make_select: initMakeSelect,
      make_custom: initMakeCustom,
      model_select: initModelSelect,
      model_custom: initModelCustom,
      year: initial?.year?.toString() || "",
      color: initial?.color || "",
      plate: initial?.plate || "",
      vin: initial?.vin || "",
      fuel_type: initial?.fuel_type || "ai95",
      current_odometer: initial?.current_odometer?.toString() || "0",
    },
  });

  const makeSelect = useWatch({ control, name: "make_select" });
  const modelSelect = useWatch({ control, name: "model_select" });
  const isCustomMake = makeSelect === CUSTOM_MAKE;
  const models = getModels(makeSelect);
  const isCustomModel = modelSelect === CUSTOM_MODEL || models.length === 0;

  const submit = (d: FormData) => {
    const make = isCustomMake ? d.make_custom : d.make_select;
    const model = (models.length === 0 || d.model_select === CUSTOM_MODEL)
      ? d.model_custom
      : d.model_select;
    onSubmit({
      make,
      model,
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
      {/* Make */}
      <div className="field">
        <label className="label">Марка *</label>
        <select className="select" {...register("make_select", { required: true })}>
          <option value="">— Выберите марку —</option>
          {CAR_MAKES.map((m) => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
        {isCustomMake && (
          <input
            className="input mt-2"
            placeholder="Введите марку"
            {...register("make_custom", { required: isCustomMake })}
          />
        )}
      </div>

      {/* Model */}
      <div className="field">
        <label className="label">Модель *</label>
        {models.length > 0 ? (
          <>
            <select className="select" {...register("model_select", { required: true })}>
              <option value="">— Выберите модель —</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {isCustomModel && (
              <input
                className="input mt-2"
                placeholder="Введите модель"
                {...register("model_custom", { required: isCustomModel })}
              />
            )}
          </>
        ) : (
          <input
            className="input"
            placeholder="Введите модель"
            {...register("model_custom", { required: true })}
          />
        )}
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
