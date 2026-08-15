import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContextInstance";
import type { AdminUserItem, AdminUsersResponse } from "../../types/admin.types";
import type { PlanType } from "../../types/analytics.types";

interface AdminUsersTabProps {
  usersData: AdminUsersResponse | null;
  loading: boolean;
  search: string;
  planFilter?: PlanType;
  page: number;
  onSearchChange: (search: string) => void;
  onPlanFilterChange: (plan?: PlanType) => void;
  onPageChange: (page: number) => void;
  onSelectUser: (userId: string) => void;
  onAdjustBalance: (user: AdminUserItem) => void;
  onChangePlan: (user: AdminUserItem) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  usersData,
  loading,
  search,
  planFilter,
  page,
  onSearchChange,
  onPlanFilterChange,
  onPageChange,
  onSelectUser,
  onAdjustBalance,
  onChangePlan,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const users = usersData?.items || [];
  const totalPages = usersData?.totalPages || 1;

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
            placeholder="Поиск по Email или ID..."
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

        {/* PLAN FILTERS */}
        <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
          {[
            { id: undefined, label: "Все" },
            { id: "FREE", label: "Free" },
            { id: "DAILY_FRESH", label: "Daily Fresh" },
            { id: "PRO_STREAM", label: "Pro Stream" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onPlanFilterChange(item.id as PlanType | undefined)}
              type="button"
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                planFilter === item.id
                  ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-sm"
                  : "opacity-40 hover:opacity-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* USERS TABLE */}
      <div
        className={`rounded-[2.5rem] border overflow-hidden transition-all ${
          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-md"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-behance-border dark:border-white/5 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 bg-gray-50/50 dark:bg-white/5">
                <th className="px-8 py-4">Пользователь</th>
                <th className="px-6 py-4 text-center">Тариф</th>
                <th className="px-6 py-4 text-center">Баланс тегов</th>
                <th className="px-6 py-4 text-center">Проекты</th>
                <th className="px-6 py-4 text-center">Дата регистрации</th>
                <th className="px-8 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-behance-border dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-xs font-bold uppercase opacity-40 animate-pulse">
                    Загрузка списка пользователей...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-xs font-bold uppercase opacity-40">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors duration-150 ${
                      isDark ? "hover:bg-white/5 text-white" : "hover:bg-behance-grayBg text-behance-black"
                    }`}
                  >
                    {/* USER EMAIL & NAME */}
                    <td className="px-8 py-4">
                      <div>
                        <span className="text-xs font-black uppercase tracking-tight block">
                          {u.email}
                        </span>
                        <span className="text-[9px] font-mono opacity-30 block">
                          {u.id.substring(0, 12)}...
                        </span>
                      </div>
                    </td>

                    {/* PLAN */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          u.plan === "PRO_STREAM"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : u.plan === "DAILY_FRESH"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>

                    {/* TAG BALANCE */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-behance-blue">
                        {u.tagBalance}
                      </span>
                    </td>

                    {/* PROJECTS COUNT */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs font-bold">
                        <span>{u.projectsCount}</span>
                        {u.totalViews > 0 && (
                          <span className="text-[9px] opacity-40 block font-normal">
                            {u.totalViews.toLocaleString()} views
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CREATED AT */}
                    <td className="px-6 py-4 text-center text-[10px] opacity-50 font-bold">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectUser(u.id)}
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-behance-blue/10 text-behance-blue text-[9px] font-black uppercase hover:bg-behance-blue hover:text-white transition-all cursor-pointer"
                        >
                          Детали
                        </button>
                        <button
                          onClick={() => onAdjustBalance(u)}
                          type="button"
                          className="px-2.5 py-1.5 rounded-xl bg-gray-500/10 text-gray-400 hover:text-behance-black dark:hover:text-white text-[9px] font-black uppercase transition-all cursor-pointer"
                        >
                          ⚡ Баланс
                        </button>
                        <button
                          onClick={() => onChangePlan(u)}
                          type="button"
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black text-[9px] font-black uppercase transition-all cursor-pointer"
                        >
                          💎 Тариф
                        </button>
                      </div>
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
              Страница {page} из {totalPages} ({usersData?.total} пользователей)
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
