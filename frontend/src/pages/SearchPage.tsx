import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { searchApi } from "../api";
import { useVehicleStore } from "../store/vehicles";
import { Spinner } from "../components/ui/Spinner";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../lib/constants";
import { formatDate, formatMoney } from "../lib/utils";
import type { MaintenanceCategory } from "../api/types";

export function SearchPage() {
  const { activeVehicleId } = useVehicleStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  };

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", debouncedQuery, activeVehicleId],
    queryFn: () => searchApi.search(debouncedQuery, activeVehicleId || undefined).then((r) => r.data),
    enabled: debouncedQuery.length >= 1,
  });

  return (
    <div className="flex flex-col">
      {/* Search input */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 pr-9"
            placeholder="Поиск по записям..."
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            autoFocus
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner className="w-4 h-4 text-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {query.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <Search size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-500 text-sm">Начните вводить текст для поиска</p>
          <p className="text-gray-400 text-xs mt-1">По названию, описанию, месту, заметкам</p>
        </div>
      ) : results.length === 0 && !isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <p className="text-gray-500 text-sm">Ничего не найдено по запросу «{query}»</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {results.map((r) => (
            <div key={`${r.type}-${r.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition">
              <div className="text-2xl mt-0.5">
                {r.type === "fuel" ? "⛽" : CATEGORY_ICONS[r.category as MaintenanceCategory] || "🔧"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {r.type === "maintenance" && r.category && (
                    <span className="text-xs text-gray-500">{CATEGORY_LABELS[r.category as MaintenanceCategory]}</span>
                  )}
                  {r.type === "fuel" && <span className="text-xs text-gray-500">Заправка</span>}
                  <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                </div>
                <p className="font-medium text-sm text-gray-900 mt-0.5">{r.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{r.vehicle_name}</span>
                  {r.cost != null && (
                    <span className="text-sm font-semibold text-gray-700">{formatMoney(r.cost)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {results.length > 0 && (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">
              {results.length} результатов
            </div>
          )}
        </div>
      )}
    </div>
  );
}
