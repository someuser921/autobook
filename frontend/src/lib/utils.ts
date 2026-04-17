export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
}

export function formatOdometer(km: number): string {
  return km.toLocaleString("ru-RU") + " км";
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  // axios error
  const axiosErr = error as { response?: { data?: { detail?: string } } };
  return axiosErr.response?.data?.detail || "Произошла ошибка";
}
