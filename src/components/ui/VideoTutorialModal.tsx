import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContextInstance";

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Скопируйте ссылку на кейс",
      desc: "Откройте свой проект на Behance (или проект конкурента) и скопируйте прямую ссылку из адресной строки браузера.",
      icon: "🔗",
      highlight: "Подходит любая ссылка вида behance.net/gallery/123456/title",
    },
    {
      title: "2. Робот подтягивает и сканирует теги",
      desc: "BeRanked автоматически извлечет все теги кейса. Вы также можете добавить кастомные нишевые теги для поиска новых точек роста.",
      icon: "🏷️",
      highlight: "Можно вводить до 10-15 целевых ключевых фраз",
    },
    {
      title: "3. Анализ позиций в поиске Behance",
      desc: "Наш робот эмулирует живой поиск Behance и находит точное место вашего проекта среди миллионов работ (ТОП-1, ТОП-10, ТОП-50).",
      icon: "🤖",
      highlight: "Позиции проверяются по реальной выдаче алгоритма Behance",
    },
    {
      title: "4. Рост просмотров и экспорт в кейс",
      desc: "Находите слабые теги, заменяйте их на теги с высоким потенциалом роста и копируйте готовый список прямо в настройки работы на Behance!",
      icon: "🚀",
      highlight: "Дизайнеры повышают охваты на Behance в 2.5–4 раза за 2 недели",
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg animate-in fade-in duration-300">
      <div
        className={`max-w-3xl w-full rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl overflow-hidden flex flex-col transition-all max-h-[90vh] ${
          isDark ? "bg-[#111111] border-white/10 text-white" : "bg-white border-behance-border text-behance-black"
        }`}
      >
        {/* MODAL HEADER */}
        <div className="p-6 md:p-8 border-b border-behance-border dark:border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-behance-blue/10 flex items-center justify-center text-behance-blue text-lg font-black">
              ▶️
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">
                Как работает BeRanked за 1 минуту
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Видео-инструкция и быстрый гид по продвижению кейсов
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* VIDEO / VISUAL DEMO CONTAINER */}
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-black/90 border border-behance-border dark:border-white/10 flex flex-col items-center justify-center text-center p-6 shadow-2xl group">
            {/* Background ambient lighting */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/10 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-lg">
              <div className="w-16 h-16 rounded-full bg-behance-blue/90 text-white flex items-center justify-center text-2xl mx-auto shadow-xl shadow-blue-500/40 group-hover:scale-110 transition-transform cursor-pointer">
                ▶️
              </div>
              <h4 className="text-lg md:text-xl font-black uppercase tracking-tight text-white">
                Интерактивный видео-обзор сервиса
              </h4>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Посмотрите, как находить прибыльные теги и выводить кейс в ТОП поиска Behance за пару кликов.
              </p>
            </div>
          </div>

          {/* STEP BY STEP TIMELINE */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  type="button"
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeStep === idx
                      ? "border-behance-blue bg-behance-blue/10 shadow-md scale-[1.02]"
                      : "border-transparent bg-gray-100/70 dark:bg-white/5 opacity-50 hover:opacity-100"
                  }`}
                >
                  <span className="text-base block mb-1">{s.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider block truncate">
                    Шаг 0{idx + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* ACTIVE STEP CARD */}
            <div
              className={`p-6 rounded-3xl border transition-all ${
                isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-behance-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{steps[activeStep].icon}</span>
                <h4 className="text-sm md:text-base font-black uppercase tracking-tight text-behance-blue">
                  {steps[activeStep].title}
                </h4>
              </div>
              <p className="text-xs md:text-sm opacity-70 leading-relaxed font-medium mb-3">
                {steps[activeStep].desc}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-behance-blue/10 text-behance-blue text-[10px] font-black uppercase tracking-wider">
                <span>💡 Совет:</span>
                <span>{steps[activeStep].highlight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 md:p-8 border-t border-behance-border dark:border-white/5 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-behance-blue text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
          >
            Понятно, хочу попробовать! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
