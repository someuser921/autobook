import type { MaintenanceCategory, FuelType } from "../api/types";

export const CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  oil_fluids: "Масло / жидкости",
  tires: "Шины / колёса",
  brakes: "Тормоза",
  filters: "Фильтры",
  suspension: "Подвеска",
  electrical: "Электрика",
  body_interior: "Кузов / салон",
  documents: "Страховка / документы",
  scheduled: "ТО плановое",
  other: "Прочее",
};

export const CATEGORY_ICONS: Record<MaintenanceCategory, string> = {
  oil_fluids: "🛢️",
  tires: "🔄",
  brakes: "🛑",
  filters: "🔧",
  suspension: "⚙️",
  electrical: "⚡",
  body_interior: "🚗",
  documents: "📄",
  scheduled: "📋",
  other: "🔩",
};

export const CATEGORY_COLORS: Record<MaintenanceCategory, string> = {
  oil_fluids: "bg-amber-100 text-amber-800",
  tires: "bg-blue-100 text-blue-800",
  brakes: "bg-red-100 text-red-800",
  filters: "bg-green-100 text-green-800",
  suspension: "bg-purple-100 text-purple-800",
  electrical: "bg-yellow-100 text-yellow-800",
  body_interior: "bg-gray-100 text-gray-800",
  documents: "bg-indigo-100 text-indigo-800",
  scheduled: "bg-teal-100 text-teal-800",
  other: "bg-slate-100 text-slate-800",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  ai92: "АИ-92",
  ai95: "АИ-95",
  ai98: "АИ-98",
  diesel: "Дизель",
  electric: "Электро",
};

export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
