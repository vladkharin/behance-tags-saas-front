import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContextInstance";
import type { AdminPaymentsResponse } from "../../types/admin.types";

interface AdminPaymentsTabProps {
  paymentsData: AdminPaymentsResponse | null;
  loading: boolean;
  search: string;
  statusFilter?: "PENDING" | "SUCCESS" | "FAILED";
  providerFilter?: "ROBOKASSA" | "LAVA";
  page: number;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status?: "PENDING" | "SUCCESS" | "FAILED") => void;
  onProviderFilterChange: (provider?: "ROBOKASSA" | "LAVA") => void;
  onPageChange: (page: number) => void;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({
  paymentsData,
  loading,
  search,
  statusFilter,
  providerFilter,
  page,
  onSearchChange,
  onStatusFilterChange,
  onProviderFilterChange,
  onPageChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const payments = paymentsData?.items || [];
  const totalPages = paymentsData?.totalPages || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* FILTER & SEARCH BAR */}
      <div
        className={`p-6 rounded-[2.5rem] border flex flex-wrap justify-between items-center gap-4 ${
          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 flex-1 max-w-md">
          <input
            className={`w-full rounded-2xl px-5 py-2.5 text-xs font-bold outline-none border transition-all ${
              isDark
                ? "bg-white/5 border-transparent text-white focus:bg-white/10 focus:border-blue-500"
                : "bg-behance-grayBg border-transparent focus:border-behance-blue text-behance-black"
            }`}
            placeholder="Поиск по Email или номеру заказа..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-behance-blue text-white text-[10px] font-black uppercase tracking-wider hover:bg-behance-darkBlue transition-all cursor-pointer shrink-0"
          >
            Найти
          </button>
        </form>

        {/* STATUS & PROVIDER FILTERS */}
        <div className="flex flex-wrap gap-2">
          {/* STATUS */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
            {[
              { id: undefined, label: "Все статусы" },
              { id: "SUCCESS", label: "Успешные" },
              { id: "PENDING", label: "Ожидают" },
              { id: "FAILED", label: "Ошибка" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onStatusFilterChange(item.id as any)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  statusFilter === item.id
                    ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-sm"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* PROVIDER */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
            {[
              { id: undefined, label: "Все провайдеры" },
              { id: "ROBOKASSA", label: "Robokassa" },
              { id: "LAVA", label: "Lava" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onProviderFilterChange(item.id as any)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  providerFilter === item.id
                    ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-sm"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div
        className={`rounded-[2.5rem] border overflow-hidden transition-all ${
          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-md"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-behance-border dark:border-white/5 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 bg-gray-50/50 dark:bg-white/5">
                <th className="px-8 py-4">Заказ</th>
                <th className="px-6 py-4">Покупатель</th>
                <th className="px-6 py-4">Товар</th>
                <th className="px-6 py-4 text-center">Провайдер</th>
                <th className="px-6 py-4 text-center">Сумма</th>
                <th className="px-6 py-4 text-center">Статус</th>
                <th className="px-8 py-4 text-right">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-behance-border dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-xs font-bold uppercase opacity-40 animate-pulse">
                    Загрузка журнала платежей...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-xs font-bold uppercase opacity-40">
                    Транзакции не найдены
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors duration-150 ${
                      isDark ? "hover:bg-white/5 text-white" : "hover:bg-behance-grayBg text-behance-black"
                    }`}
                  >
                    {/* ORDER NUMBER */}
                    <td className="px-8 py-4 font-mono text-xs font-black">
                      #{p.orderNumber}
                    </td>

                    {/* USER */}
                    <td className="px-6 py-4 text-xs font-bold truncate max-w-[200px]">
                      {p.user?.email || "Unknown"}
                    </td>

                    {/* ITEM */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-black uppercase block">
                        {p.targetName}
                      </span>
                      <span className="text-[9px] opacity-40 uppercase tracking-widest block font-bold">
                        {p.type}
                      </span>
                    </td>

                    {/* PROVIDER */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-gray-100 dark:bg-white/5 border border-behance-border dark:border-transparent">
                        {p.provider}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-4 text-center font-black text-sm text-green-500">
                      {p.amount} {p.currency}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          p.status === "SUCCESS"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : p.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-8 py-4 text-right text-[10px] opacity-50 font-bold">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-behance-border dark:border-white/5 flex justify-between items-center text-xs font-bold">
            <span className="opacity-40">
              Страница {page} из {totalPages} ({paymentsData?.total} транзакций)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-1.5 rounded-xl border border-behance-border dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-behance-blue hover:text-white transition-all cursor-pointer"
              >
                ← Назад
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-4 py-1.5 rounded-xl border border-behance-border dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-behance-blue hover:text-white transition-all cursor-pointer"
              >
                Вперед →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
