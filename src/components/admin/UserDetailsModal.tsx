import React from "react";
import { useTheme } from "../../context/ThemeContextInstance";
import type { AdminUserDetails } from "../../types/admin.types";

interface UserDetailsModalProps {
  user: AdminUserDetails | null;
  loading: boolean;
  onClose: () => void;
  onAdjustBalance: (user: AdminUserDetails) => void;
  onChangePlan: (user: AdminUserDetails) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  loading,
  onClose,
  onAdjustBalance,
  onChangePlan,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!user && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`max-w-3xl w-full max-h-[85vh] flex flex-col rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl overflow-hidden transition-all ${
          isDark ? "bg-[#111111] border-white/10 text-white" : "bg-white border-behance-border text-behance-black"
        }`}
      >
        {/* HEADER */}
        <div className="p-8 border-b border-behance-border dark:border-white/5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black uppercase tracking-tight truncate max-w-md">
                {user?.email || "Пользователь"}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  user?.plan === "PRO_STREAM"
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : user?.plan === "DAILY_FRESH"
                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      : "bg-gray-500/10 text-gray-400"
                }`}
              >
                {user?.plan}
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
              ID: {user?.id} • Зарегистрирован: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {loading ? (
            <div className="py-12 text-center font-black uppercase tracking-widest opacity-40 animate-pulse">
              Загрузка данных пользователя...
            </div>
          ) : user ? (
            <>
              {/* STATS & ACTIONS BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-behance-border dark:border-white/5">
                  <span className="text-[9px] font-black uppercase opacity-40 block">Баланс тегов</span>
                  <span className="text-xl font-black text-behance-blue">{user.tagBalance}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-behance-border dark:border-white/5">
                  <span className="text-[9px] font-black uppercase opacity-40 block">Проектов</span>
                  <span className="text-xl font-black">{user.projects.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-behance-border dark:border-white/5">
                  <span className="text-[9px] font-black uppercase opacity-40 block">Платежей</span>
                  <span className="text-xl font-black text-green-500">{user.payments.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-behance-border dark:border-white/5">
                  <span className="text-[9px] font-black uppercase opacity-40 block">Истекает</span>
                  <span className="text-xs font-bold truncate block mt-1">
                    {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString() : "Бессрочно"}
                  </span>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="flex gap-3">
                <button
                  onClick={() => onAdjustBalance(user)}
                  className="flex-1 py-3 rounded-xl bg-behance-blue/10 text-behance-blue text-xs font-black uppercase tracking-wider hover:bg-behance-blue hover:text-white transition-all"
                >
                  ⚡ Изменить баланс тегов
                </button>
                <button
                  onClick={() => onChangePlan(user)}
                  className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-all"
                >
                  💎 Сменить тариф
                </button>
              </div>

              {/* PROJECTS */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-4 opacity-50">
                  Подключенные проекты Behance ({user.projects.length})
                </h4>
                {user.projects.length === 0 ? (
                  <p className="text-xs opacity-40 font-bold uppercase">Нет добавленных проектов</p>
                ) : (
                  <div className="space-y-4">
                    {user.projects.map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl border border-behance-border dark:border-white/5 bg-gray-50/50 dark:bg-white/5 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-sm font-black uppercase tracking-tight">{p.title}</h5>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-behance-blue hover:underline break-all"
                            >
                              {p.url}
                            </a>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              p.analysisStatus === "PROCESSING"
                                ? "bg-blue-500 text-white animate-pulse"
                                : p.analysisStatus === "PENDING"
                                  ? "bg-amber-500 text-black"
                                  : "bg-green-500/10 text-green-500"
                            }`}
                          >
                            {p.analysisStatus}
                          </span>
                        </div>

                        {/* TAGS OF PROJECT */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-white dark:bg-white/10 border border-behance-border dark:border-transparent flex items-center gap-1.5"
                            >
                              <span>#{t.tag}</span>
                              {t.currentRank ? (
                                <span className="text-green-500 font-black">#{t.currentRank}</span>
                              ) : (
                                <span className="opacity-30">out</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PAYMENTS HISTORY */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-4 opacity-50">
                  История оплат ({user.payments.length})
                </h4>
                {user.payments.length === 0 ? (
                  <p className="text-xs opacity-40 font-bold uppercase">Платежей пока не было</p>
                ) : (
                  <div className="space-y-2">
                    {user.payments.map((pay) => (
                      <div
                        key={pay.id}
                        className="p-3.5 rounded-xl border border-behance-border dark:border-white/5 flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono opacity-50">#{pay.orderNumber}</span>
                          <span className="font-bold uppercase">
                            {pay.type} • {pay.targetName}
                          </span>
                          <span className="text-[10px] opacity-40">({pay.provider})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black">
                            {pay.amount} {pay.currency}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                              pay.status === "SUCCESS"
                                ? "bg-green-500/10 text-green-500"
                                : pay.status === "PENDING"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {pay.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
