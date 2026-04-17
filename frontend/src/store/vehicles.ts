import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VehicleState {
  activeVehicleId: number | null;
  setActiveVehicle: (id: number) => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      activeVehicleId: null,
      setActiveVehicle: (id) => set({ activeVehicleId: id }),
    }),
    { name: "active-vehicle" }
  )
);
