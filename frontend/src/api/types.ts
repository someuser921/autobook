export type FuelType = "ai92" | "ai95" | "ai98" | "diesel" | "electric";

export type MaintenanceCategory =
  | "oil_fluids"
  | "tires"
  | "brakes"
  | "filters"
  | "suspension"
  | "electrical"
  | "body_interior"
  | "documents"
  | "scheduled"
  | "other";

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Vehicle {
  id: number;
  user_id: number;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  plate: string | null;
  vin: string | null;
  fuel_type: FuelType;
  current_odometer: number;
  odometer_updated_at: string | null;
  created_at: string;
}

export interface MaintenanceRecord {
  id: number;
  vehicle_id: number;
  date: string;
  odometer: number | null;
  category: MaintenanceCategory;
  title: string;
  description: string | null;
  location: string | null;
  cost: number | null;
  next_date: string | null;
  next_odometer: number | null;
  notes: string | null;
  created_at: string;
}

export interface FuelRecord {
  id: number;
  vehicle_id: number;
  date: string;
  liters: number;
  total_cost: number;
  price_per_liter: number;
  fuel_type_override: FuelType | null;
  odometer: number | null;
  station_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface CategoryStat {
  category: string;
  total: number;
  count: number;
}

export interface MaintenanceStats {
  total_cost: number;
  total_records: number;
  by_category: CategoryStat[];
}

export interface FuelMonthStat {
  year: number;
  month: number;
  total_cost: number;
  total_liters: number;
  records: number;
  avg_price_per_liter: number;
}

export interface FuelStats {
  total_cost: number;
  total_liters: number;
  total_records: number;
  avg_cost_per_month: number;
  avg_cost_per_week: number;
  avg_price_per_liter: number;
  months: FuelMonthStat[];
}

export interface PlannedItem {
  id: number;
  vehicle_id: number;
  title: string;
  notes: string | null;
  estimated_cost: number | null;
  due_date: string | null;
  is_done: boolean;
  created_at: string;
}

export interface SearchResult {
  type: "maintenance" | "fuel";
  id: number;
  vehicle_id: number;
  vehicle_name: string;
  date: string;
  title: string;
  category: string | null;
  cost: number | null;
  odometer: number | null;
  description: string | null;
  location: string | null;
  notes: string | null;
  next_date: string | null;
  next_odometer: number | null;
  liters: number | null;
  price_per_liter: number | null;
  station_name: string | null;
}
