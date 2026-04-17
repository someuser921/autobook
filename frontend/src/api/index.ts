import { api } from "./client";
import type {
  User, Vehicle, MaintenanceRecord, FuelRecord,
  MaintenanceStats, FuelStats, SearchResult, MaintenanceCategory,
} from "./types";

// Auth
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<{ access_token: string; user: User }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string; user: User }>("/auth/login", data),
  me: () => api.get<User>("/auth/me"),
};

// Vehicles
export const vehiclesApi = {
  list: () => api.get<Vehicle[]>("/vehicles"),
  create: (data: Partial<Vehicle>) => api.post<Vehicle>("/vehicles", data),
  update: (id: number, data: Partial<Vehicle>) => api.patch<Vehicle>(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

// Maintenance
export const maintenanceApi = {
  list: (vehicleId: number, params?: { category?: MaintenanceCategory; date_from?: string; date_to?: string; sort?: string }) =>
    api.get<MaintenanceRecord[]>(`/vehicles/${vehicleId}/maintenance`, { params }),
  create: (vehicleId: number, data: Partial<MaintenanceRecord>) =>
    api.post<MaintenanceRecord>(`/vehicles/${vehicleId}/maintenance`, data),
  update: (id: number, data: Partial<MaintenanceRecord>) =>
    api.patch<MaintenanceRecord>(`/maintenance/${id}`, data),
  delete: (id: number) => api.delete(`/maintenance/${id}`),
  stats: (vehicleId: number, year?: number) =>
    api.get<MaintenanceStats>(`/vehicles/${vehicleId}/stats/maintenance`, { params: { year } }),
};

// Fuel
export const fuelApi = {
  list: (vehicleId: number, params?: { date_from?: string; date_to?: string }) =>
    api.get<FuelRecord[]>(`/vehicles/${vehicleId}/fuel`, { params }),
  create: (vehicleId: number, data: Partial<FuelRecord>) =>
    api.post<FuelRecord>(`/vehicles/${vehicleId}/fuel`, data),
  update: (id: number, data: Partial<FuelRecord>) =>
    api.patch<FuelRecord>(`/fuel/${id}`, data),
  delete: (id: number) => api.delete(`/fuel/${id}`),
  stats: (vehicleId: number, year?: number) =>
    api.get<FuelStats>(`/vehicles/${vehicleId}/stats/fuel`, { params: { year } }),
};

// Search
export const searchApi = {
  search: (q: string, vehicleId?: number) =>
    api.get<SearchResult[]>("/search", { params: { q, vehicle_id: vehicleId } }),
};

export * from "./types";
