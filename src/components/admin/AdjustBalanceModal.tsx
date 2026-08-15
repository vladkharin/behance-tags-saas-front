import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContextInstance";

interface AdjustBalanceModalProps {
  user: { id: string; email: string; tagBalance: number } | null;
  onClose: () => void;
  onSubmit: (userId: string, amount: number, mode: "SET" | "INCREMENT" | "DECREMENT") => Promise<void>;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  user,
  onClose,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<"INCREMENT" | "SET" | "DECREMENT">("INCREMENT");
  const [amount, setAmount] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(user.id, Number(amount), mode);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`max-w-md w-full p-8 rounded-[2.5rem] border shadow-2xl transition-all ${
          isDark ? "bg-[#111111] border-white/10 text-white" : "bg-white border-behance-border text-behance-black"
        }`}
      >
        <h3 className="text-lg font-black uppercase tracking-tight mb-1">
          Корректировка баланса тегов
        </h3>
        <p className="text-xs opacity-50 mb-6 truncate font-medium">
          Пользователь: {user.email} (Текущий баланс: {user.tagBalance})
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* MODE SELECTOR */}
          <div>
            <label className="block text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">
              Действие
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "INCREMENT", label: "Начислить (+)" },
                { id: "SET", label: "Установить (=)" },
                { id: "DECREMENT", label: "Списать (-)" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id as any)}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                    mode === item.id
                      ? "bg-behance-blue text-white shadow-md"
                      : "bg-gray-100 dark:bg-white/5 opacity-50 hover:opacity-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* AMOUNT INPUT */}
          <div>
            <label className="block text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">
              Количество тегов
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className={`w-full rounded-2xl px-5 py-3 text-sm font-black outline-none border transition-all ${
                isDark
                  ? "bg-white/5 border-transparent text-white focus:border-blue-500"
                  : "bg-behance-grayBg border-transparent focus:border-behance-blue text-behance-black"
              }`}
            />
          </div>

          {/* PREVIEW OF NEW BALANCE */}
          <div className="p-3.5 rounded-xl bg-behance-blue/5 border border-behance-blue/10 text-xs font-bold text-behance-blue text-center">
            Новый баланс:{" "}
            <span className="font-black text-sm">
              {mode === "SET"
                ? amount
                : mode === "INCREMENT"
                  ? user.tagBalance + amount
                  : Math.max(0, user.tagBalance - amount)}
            </span>{" "}
            тегов
          </div>

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
              {isSubmitting ? "Сохранение..." : "Применить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
