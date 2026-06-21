import React, { useState, useEffect } from "react";
import { analyticsService, type DashboardData, type TagAnalytics } from "../services/analyticsService";
import { useAuth } from "../hooks/useAuth";

// Расширим типы прямо здесь или в analyticsService, чтобы учесть историю и позиции
interface ProjectHistoryItem {
  id: string;
  checkedAt: string;
  views: number;
  appreciations: number;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();

  // Функция запроса данных с бэка (матрица тегов)
  const fetchDashboardData = async () => {
    try {
      const result = await analyticsService.getAnalytics();
      setData(result);

      // Если у нас в данных уже есть активный проект, подтянем его историю аналитики
      if (result?.activeProject?.id) {
        // Вызов эндпоинта GET /scraper/:id/history через твой сервис
        const historyData = await analyticsService.getProjectHistory(result.activeProject.id);
        setHistory(historyData || []);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Произошла непредвиденная ошибка";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Лонг-поллинг, если скрапер в процессе работы
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (data?.isScraping) {
      interval = setInterval(fetchDashboardData, 5000);
    }
    return () => clearInterval(interval);
  }, [data?.isScraping]);

  const handleStartParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setActionLoading(true);
    setError("");
    try {
      // Вызываем POST /scraper/import-case.
      // Если авторизация по токену еще не готова на 100%, analyticsService может прокидывать заглушку userId внутри
      const project = await analyticsService.importCase(urlInput, user);

      // Оптимистично ставим статус "в процессе"
      setData((prev) => ({
        ...prev,
        isScraping: true,
        tagsMatrix: prev?.tagsMatrix || [],
      }));

      // Сразу после импорта триггерим анализ позиций: POST /scraper/:id/analyze
      if (project?.id) {
        await analyticsService.analyzeProject(project.id);
      }

      fetchDashboardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Произошла ошибка при импорте кейса";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-behance-grayBg">
        <div className="text-behance-muted animate-pulse font-medium text-sm">Загрузка матрицы тегов кейса...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-behance-grayBg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Шапка */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-behance-border pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-behance-black tracking-tight">Аналитика кейса</h1>
            <p className="text-xs text-behance-muted mt-1">Парсинг тегов, веса в категориях и истории просмотров/лайков работы</p>
          </div>
          {data?.user?.behanceUrl && (
            <div className="mt-4 md:mt-0 text-xs text-behance-muted bg-white px-4 py-2 rounded-full border border-behance-border shadow-sm">
              Активный кейс:{" "}
              <a
                href={data.user.behanceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-behance-blue font-medium hover:underline truncate max-w-[200px] inline-block align-bottom"
              >
                Открыть на Behance
              </a>
            </div>
          )}
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

        {/* СОСТОЯНИЕ 1: Работает Puppeteer */}
        {data?.isScraping && (
          <div className="bg-white rounded-2xl border border-behance-border p-8 text-center shadow-sm mb-8">
            <div className="inline-block w-8 h-8 rounded-full border-2 border-behance-blue border-t-transparent animate-spin mb-4"></div>
            <h3 className="text-base font-bold text-behance-black">Импортируем и анализируем проект...</h3>
            <p className="text-xs text-behance-muted mt-2 max-w-md mx-auto leading-relaxed">
              Робот заходит на страницу работы, считывает установленные теги и сканирует текущие позиции проекта в лентах категорий. Это
              займет около 1 минуты.
            </p>
          </div>
        )}

        {/* СОСТОЯНИЕ 2: Пустой дашборд (Первый запуск) */}
        {!data?.isScraping && (!data?.tagsMatrix || data.tagsMatrix.length === 0) && (
          <div className="bg-white rounded-2xl border border-behance-border p-12 text-center shadow-sm max-w-xl mx-auto mt-12">
            <div className="w-12 h-12 bg-behance-grayBg rounded-full flex items-center justify-center mx-auto mb-4 text-lg">📁</div>
            <h3 className="text-base font-bold text-behance-black">Вставьте ссылку на кейс Behance</h3>
            <p className="text-xs text-behance-muted mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
              Укажите прямую ссылку на конкретный проект. Система вытащит из него все теги и рассчитает их эффективность и вовлеченность.
            </p>
            <form onSubmit={handleStartParse} className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                required
                placeholder="https://www.behance.net/gallery/XXXXXX/Project-Name"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-behance-grayBg border border-behance-border rounded-xl text-behance-black text-xs focus:outline-none focus:border-behance-blue transition-colors"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-behance-blue hover:bg-blue-700 text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {actionLoading ? "Импорт..." : "Анализировать кейс"}
              </button>
            </form>
          </div>
        )}

        {/* СОСТОЯНИЕ 3: Вывод аналитики по кейсу */}
        {data && data.tagsMatrix && data.tagsMatrix.length > 0 && (
          <div className="space-y-6">
            {/* Панель быстрого обновления */}
            {!data.isScraping && data.user?.behanceUrl && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-behance-border shadow-sm gap-4">
                <span className="text-xs text-behance-muted">Проанализировать другой проект или запустить перепроверку текущего:</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="url"
                    placeholder="Новая ссылка на кейс"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="px-3 py-1.5 bg-behance-grayBg border border-behance-border rounded-xl text-xs focus:outline-none focus:border-behance-blue text-behance-black flex-1 sm:w-64"
                  />
                  <button
                    onClick={handleStartParse}
                    disabled={actionLoading}
                    className="text-xs font-semibold text-white bg-behance-blue hover:bg-blue-700 px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap disabled:opacity-50"
                  >
                    🚀 Запуск
                  </button>
                </div>
              </div>
            )}

            {/* Таблица тегов */}
            <div className="bg-white rounded-2xl border border-behance-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-behance-border">
                <h3 className="text-sm font-bold text-behance-black">Матрица тегов проекта</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-behance-grayBg border-b border-behance-border text-[11px] font-bold text-behance-muted uppercase tracking-wider">
                      <th className="px-6 py-4">Тег / Ключевик</th>
                      <th className="px-6 py-4 text-center">Просмотры работы</th>
                      <th className="px-6 py-4 text-center">Лайки работы</th>
                      <th className="px-6 py-4 text-center">Статус позиций</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-behance-border text-xs text-behance-black">
                    {data.tagsMatrix.map((item: TagAnalytics, idx: number) => (
                      <tr key={idx} className="hover:bg-behance-grayBg/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-behance-blue">#{item.tag}</td>
                        <td className="px-6 py-4 text-center font-medium">{item.totalViews.toLocaleString()} 👀</td>
                        <td className="px-6 py-4 text-center text-behance-muted">{item.totalAppreciations.toLocaleString()} ❤️</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-behance-blue border border-blue-100">
                            Проверен в категориях
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Блок истории аналитики (:id/history) */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-behance-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-behance-border">
                  <h3 className="text-sm font-bold text-behance-black">История изменения метрик кейса</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {history.map((hist) => (
                      <div
                        key={hist.id}
                        className="flex justify-between items-center text-xs p-3 bg-behance-grayBg/50 rounded-xl border border-behance-border/60"
                      >
                        <span className="text-behance-muted font-medium">
                          {new Date(hist.checkedAt).toLocaleString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex gap-4">
                          <span className="font-semibold text-behance-black">{hist.views.toLocaleString()} 👀</span>
                          <span className="font-semibold text-behance-muted">{hist.appreciations.toLocaleString()} ❤️</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
