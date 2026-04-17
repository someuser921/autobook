import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { maintenanceApi, fuelApi } from "../api";
import { useVehicleStore } from "../store/vehicles";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { CATEGORY_LABELS, CATEGORY_ICONS, MONTH_NAMES } from "../lib/constants";
import { formatMoney } from "../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { MaintenanceCategory } from "../api/types";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

export function StatsPage() {
  const { activeVehicleId } = useVehicleStore();
  const [activeTab, setActiveTab] = useState<"maintenance" | "fuel">("maintenance");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const { data: mStats, isLoading: mLoading } = useQuery({
    queryKey: ["stats-maintenance", activeVehicleId, selectedYear],
    queryFn: () => maintenanceApi.stats(activeVehicleId!, selectedYear).then((r) => r.data),
    enabled: !!activeVehicleId,
  });

  const { data: fStats, isLoading: fLoading } = useQuery({
    queryKey: ["stats-fuel", activeVehicleId],
    queryFn: () => fuelApi.stats(activeVehicleId!).then((r) => r.data),
    enabled: !!activeVehicleId,
  });

  if (!activeVehicleId) return <EmptyState icon="🚗" title="Выберите авто" />;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const selectedMonthData = fStats?.months.find(
    (m) => m.year === selectedYear && m.month === selectedMonth
  );

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 px-4 pt-3 gap-2">
        {(["maintenance", "fuel"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "maintenance" ? "Обслуживание" : "Заправки"}
          </button>
        ))}
      </div>

      {activeTab === "maintenance" && (
        <div className="p-4 flex flex-col gap-4">
          {/* Year selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Год:</label>
            <select className="select w-auto" value={selectedYear} onChange={(e) => setSelectedYear(+e.target.value)}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {mLoading ? (
            <div className="flex justify-center py-8"><Spinner className="w-6 h-6 text-blue-500" /></div>
          ) : !mStats || mStats.by_category.length === 0 ? (
            <EmptyState icon="📊" title="Нет данных" description="Добавьте записи с указанием стоимости" />
          ) : (
            <>
              {/* Total */}
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Всего потрачено</div>
                  <div className="text-2xl font-bold text-gray-900">{formatMoney(mStats.total_cost)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Записей</div>
                  <div className="text-2xl font-bold text-gray-900">{mStats.total_records}</div>
                </div>
              </div>

              {/* Chart */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">По категориям</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={mStats.by_category.map((c, i) => ({
                    name: CATEGORY_ICONS[c.category as MaintenanceCategory],
                    total: c.total,
                    color: CHART_COLORS[i % CHART_COLORS.length],
                  }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 16 }} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => formatMoney(v as number)} labelFormatter={(l) => l} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {mStats.by_category.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category list */}
              <div className="card divide-y divide-gray-50">
                {mStats.by_category
                  .sort((a, b) => b.total - a.total)
                  .map((c) => (
                    <div key={c.category} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-lg">{CATEGORY_ICONS[c.category as MaintenanceCategory]}</span>
                      <span className="text-sm text-gray-700 flex-1">{CATEGORY_LABELS[c.category as MaintenanceCategory]}</span>
                      <span className="text-xs text-gray-400 mr-2">{c.count} раз</span>
                      <span className="text-sm font-semibold text-gray-800">{formatMoney(c.total)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "fuel" && (
        <div className="p-4 flex flex-col gap-4">
          {fLoading ? (
            <div className="flex justify-center py-8"><Spinner className="w-6 h-6 text-blue-500" /></div>
          ) : !fStats || fStats.total_records === 0 ? (
            <EmptyState icon="⛽" title="Нет данных" description="Добавьте записи о заправках" />
          ) : (
            <>
              {/* Overall stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3">
                  <div className="text-xs text-gray-500">Всего потрачено</div>
                  <div className="text-lg font-bold text-gray-900">{formatMoney(fStats.total_cost)}</div>
                </div>
                <div className="card p-3">
                  <div className="text-xs text-gray-500">Всего литров</div>
                  <div className="text-lg font-bold text-gray-900">{fStats.total_liters.toFixed(0)} л</div>
                </div>
                <div className="card p-3">
                  <div className="text-xs text-gray-500">Средняя цена/л</div>
                  <div className="text-lg font-bold text-gray-900">{fStats.avg_price_per_liter} ₽</div>
                </div>
                <div className="card p-3">
                  <div className="text-xs text-gray-500">В среднем/мес</div>
                  <div className="text-lg font-bold text-gray-900">{formatMoney(fStats.avg_cost_per_month)}</div>
                </div>
              </div>

              <div className="card p-3">
                <div className="text-xs text-gray-500">В среднем/неделю</div>
                <div className="text-lg font-bold text-gray-900">{formatMoney(fStats.avg_cost_per_week)}</div>
              </div>

              {/* Month selector */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">По месяцу</h3>
                <div className="flex gap-2 flex-wrap mb-3">
                  {years.slice(0, 3).map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition ${selectedYear === y ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {MONTH_NAMES.map((name, i) => {
                    const monthData = fStats.months.find((m) => m.year === selectedYear && m.month === i + 1);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedMonth(i + 1)}
                        className={`rounded-xl py-2 px-1 text-center transition ${
                          selectedMonth === i + 1 && selectedYear === selectedYear
                            ? "bg-blue-600 text-white"
                            : monthData
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        <div className="text-[10px] font-medium">{name.slice(0, 3)}</div>
                        {monthData && <div className="text-[10px] mt-0.5">{formatMoney(monthData.total_cost)}</div>}
                      </button>
                    );
                  })}
                </div>

                {selectedMonthData && (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Потрачено</div>
                      <div className="text-sm font-bold">{formatMoney(selectedMonthData.total_cost)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Литров</div>
                      <div className="text-sm font-bold">{selectedMonthData.total_liters.toFixed(0)} л</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Ср. цена</div>
                      <div className="text-sm font-bold">{selectedMonthData.avg_price_per_liter} ₽/л</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
