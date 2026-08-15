import React from "react";
import { useTheme } from "../../context/ThemeContextInstance";
import type { AdminActivityItem } from "../../types/admin.types";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface AdminActivityTabProps {
  activity: AdminActivityItem[];
  loading: boolean;
}

const typeIcons: Record<string, { icon: string; bg: string; text: string }> = {
  USER_REGISTER: { icon: "👤", bg: "bg-blue-500/10", text: "text-blue-500" },
  PROJECT_IMPORT: { icon: "📁", bg: "bg-purple-500/10", text: "text-purple-500" },
  PAYMENT: { icon: "💰", bg: "bg-green-500/10", text: "text-green-500" },
  ANALYSIS: { icon: "🤖", bg: "bg-amber-500/10", text: "text-amber-500" },
};

export const AdminActivityTab: React.FC<AdminActivityTabProps> = ({
  activity,
  loading,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-8 rounded-[2.5rem] md:rounded-[3.5rem] border ${
          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-md"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">
              Живая лента действий на платформе
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
              Регистрации, импорты проектов, оплаты и запуски робота
            </p>
          </div>
          <span className="flex items-center gap-2 text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            В реальном времени
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-bold uppercase opacity-40 animate-pulse">
            Загрузка последних событий...
          </div>
        ) : activity.length === 0 ? (
          <div className="py-16 text-center text-xs font-bold uppercase opacity-40">
            События отсутствуют
          </div>
        ) : (
          <div className="space-y-4">
            {activity.map((event) => {
              const meta = typeIcons[event.type] || { icon: "⚡", bg: "bg-gray-500/10", text: "text-gray-400" };
              const timeAgo = formatDistanceToNow(new Date(event.timestamp), {
                addSuffix: true,
                locale: ru,
              });

              return (
                <div
                  key={event.id}
                  className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    isDark
                      ? "bg-white/5 border-white/5 hover:bg-white/10"
                      : "bg-gray-50/50 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${meta.bg}`}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${meta.text}`}>
                          {event.title}
                        </span>
                        <span className="text-[10px] opacity-30 font-bold">•</span>
                        <span className="text-xs font-bold truncate opacity-90">
                          {event.userEmail}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold opacity-40 shrink-0">
                        {timeAgo}
                      </span>
                    </div>

                    <p className="text-xs font-medium opacity-70 mt-1 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
