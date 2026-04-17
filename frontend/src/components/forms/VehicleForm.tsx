import { useState } from "react";
import { useForm } from "react-hook-form";
import { FUEL_TYPE_LABELS } from "../../lib/constants";
import { getModels, MAKE_NAMES } from "../../lib/carData";
import { SearchableSelect } from "../ui/SearchableSelect";
import type { Vehicle, FuelType } from "../../api/types";

const CUSTOM_MAKE = "Другая марка";
const CUSTOM_MODEL = "Другая";

type FormData = {
  year: string;
  color: string;
  plate: string;
  vin: string;
  fuel_type: FuelType;
  current_odometer: string;
};

function resolveInitialMake(make?: string): { select: string; custom: string } {
  if (!make) return { select: "", custom: "" };
  if (MAKE_NAMES.includes(make)) return { select: make, custom: "" };
  return { select: CUSTOM_MAKE, custom: make };
}

function resolveInitialModel(make?: string, model?: string): { select: string; custom: string } {
  if (!model) return { select: "", custom: "" };
  const models = getModels(make ?? "");
  if (models.includes(model)) return { select: model, custom: "" };
  return { select: CUSTOM_MODEL, custom: model };
}

interface Props {
  initial?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function VehicleForm({ initial, onSubmit, onCancel, loading }: Props) {
  const initMake = resolveInitialMake(initial?.make);
  const initModel = resolveInitialModel(initial?.make, initial?.model);

  const [makeSelect, setMakeSelect] = useState(initMake.select);
  const [makeCustom, setMakeCustom] = useState(initMake.custom);
  const [modelSelect, setModelSelect] = useState(initModel.select);
  const [modelCustom, setModelCustom] = useState(initModel.custom);
  const [errors, setErrors] = useState<{ make?: boolean; model?: boolean }>({});

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      year: initial?.year?.toString() || "",
      color: initial?.color || "",
      plate: initial?.plate || "",
      vin: initial?.vin || "",
      fuel_type: initial?.fuel_type || "ai95",
      current_odometer: initial?.current_odometer?.toString() || "0",
    },
  });

  const isCustomMake = makeSelect === CUSTOM_MAKE;
  const models = getModels(makeSelect);
  const isCustomModel = modelSelect === CUSTOM_MODEL;

  const resolveMake = () => isCustomMake ? makeCustom.trim() : makeSelect;
  const resolveModel = () => {
    if (models.length === 0) return modelCustom.trim();
    if (isCustomModel) return modelCustom.trim();
    return modelSelect;
  };

  const submit = (d: FormData) => {
    const make = resolveMake();
    const model = resolveModel();
    const newErrors: typeof errors = {};
    if (!make) newErrors.make = true;
    if (!model) newErrors.model = true;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

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
        <SearchableSelect
          options={MAKE_NAMES}
          value={makeSelect}
          onChange={(v) => {
            setMakeSelect(v);
            setModelSelect("");
            setModelCustom("");
            setErrors((e) => ({ ...e, make: false }));
          }}
          placeholder="— Выберите марку —"
        />
        {errors.make && <span className="text-xs text-red-500 mt-0.5">Укажите марку</span>}
        {isCustomMake && (
          <input
            className="input mt-2"
            placeholder="Введите марку"
            value={makeCustom}
            onChange={(e) => setMakeCustom(e.target.value)}
          />
        )}
      </div>

      {/* Model */}
      <div className="field">
        <label className="label">Модель *</label>
        {models.length > 0 ? (
          <>
            <SearchableSelect
              options={models}
              value={modelSelect}
              onChange={(v) => {
                setModelSelect(v);
                setErrors((e) => ({ ...e, model: false }));
              }}
              placeholder="— Выберите модель —"
            />
            {isCustomModel && (
              <input
                className="input mt-2"
                placeholder="Введите модель"
                value={modelCustom}
                onChange={(e) => setModelCustom(e.target.value)}
              />
            )}
          </>
        ) : (
          <input
            className="input"
            placeholder="Введите модель"
            value={modelCustom}
            onChange={(e) => {
              setModelCustom(e.target.value);
              setErrors((e2) => ({ ...e2, model: false }));
            }}
          />
        )}
        {errors.model && <span className="text-xs text-red-500 mt-0.5">Укажите модель</span>}
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
