import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContextInstance";
import type { PlanType } from "../../types/analytics.types";

interface ChangePlanModalProps {
  user: { id: string; email: string; plan: PlanType; planExpiresAt?: string | null } | null;
  onClose: () => void;
  onSubmit: (userId: string, plan: PlanType, planExpiresAt?: string) => Promise<void>;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  user,
  onClose,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(user?.plan || "FREE");
  const [daysDuration, setDaysDuration] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    let expiresAtIso: string | undefined = undefined;
    if (selectedPlan !== "FREE" && daysDuration > 0) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + daysDuration);
      expiresAtIso = expDate.toISOString();
    }

    setIsSubmitting(true);
    try {
      await onSubmit(user.id, selectedPlan, expiresAtIso);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans: Array<{ id: PlanType; name: string; desc: string; color: string }> = [
    { id: "FREE", name: "Free", desc: "1 проект, 90 тегов, обновление раз в 7 дней", color: "text-gray-400" },
    { id: "DAILY_FRESH", name: "Daily Fresh", desc: "3 проекта, 1500 тегов, графики, обновление раз в 3 дня", color: "text-blue-500" },
    { id: "PRO_STREAM", name: "Pro Stream", desc: "10 проектов, 6000 тегов, тренды, ежедневное обновление", color: "text-amber-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`max-w-md w-full p-8 rounded-[2.5rem] border shadow-2xl transition-all ${
          isDark ? "bg-[#111111] border-white/10 text-white" : "bg-white border-behance-border text-behance-black"
        }`}
      >
        <h3 className="text-lg font-black uppercase tracking-tight mb-1">
          Ручная смена тарифа
        </h3>
        <p className="text-xs opacity-50 mb-6 truncate font-medium">
          Пользователь: {user.email} (Текущий: {user.plan})
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PLAN CHOICES */}
          <div className="space-y-2.5">
            {plans.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === p.id
                    ? "border-behance-blue bg-behance-blue/10 shadow-md scale-[1.02]"
                    : "border-behance-border dark:border-white/5 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-black uppercase tracking-wider ${p.color}`}>
                    {p.name}
                  </span>
                  {selectedPlan === p.id && <span className="text-behance-blue font-black text-xs">✓ Выбран</span>}
                </div>
                <p className="text-[10px] opacity-60 leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* DURATION (IF NOT FREE) */}
          {selectedPlan !== "FREE" && (
            <div>
              <label className="block text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">
                Срок действия (в днях)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[30, 90, 365].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDaysDuration(days)}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                      daysDuration === days
                        ? "bg-amber-500 text-black shadow-md"
                        : "bg-gray-100 dark:bg-white/5 opacity-50 hover:opacity-100"
                    }`}
                  >
                    {days} дней
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider opacity-50 hover:opacity-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-xl bg-behance-blue text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Сохранение..." : "Назначить тариф"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
