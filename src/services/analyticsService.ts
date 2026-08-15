import api from "../api/axios";
import type {
  BehanceProject,
  CreatePaymentDto,
  CreatePaymentResponse,
  DashboardData,
  DashboardSummaryResponse,
  HistoryPoint,
  HistoryResponse,
  ProjectDetailsResponse,
  ProjectOverviewItem,
  TagAnalytics,
} from "../types/analytics.types";

export type {
  BehanceProject,
  CreatePaymentDto,
  CreatePaymentResponse,
  DashboardData,
  DashboardSummaryResponse,
  HistoryPoint,
  HistoryResponse,
  ProjectDetailsResponse,
  ProjectOverviewItem,
  TagAnalytics,
};

export const analyticsService = {
  // 1. Получить общую статистику (Матрица тегов + Активный проект)
  getAnalytics: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/scraper/analytics");
    return response.data;
  },

  // 1.1 Получить расширенную сводку дашборда (KPI, распределение рангов, топ теги)
  getDashboardSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await api.get<DashboardSummaryResponse>(
      "/scraper/analytics/summary",
    );
    return response.data;
  },

  // 1.2 Получить расширенный список всех проектов с показателями
  getProjectsOverview: async (): Promise<ProjectOverviewItem[]> => {
    const response = await api.get<ProjectOverviewItem[]>(
      "/scraper/projects/overview",
    );
    return response.data || [];
  },

  // 2. Импорт кейса
  importCase: async (url: string): Promise<BehanceProject> => {
    const response = await api.post<BehanceProject>("/scraper/import-case", {
      url,
    });
    return response.data;
  },

  // 3. Запустить анализ (может принимать кастомные теги)
  analyzeProject: async (
    projectId: string,
    tags?: string[],
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/scraper/${projectId}/analyze`,
      {
        tags,
      },
    );
    return response.data;
  },

  // 4. Получить историю позиций для графиков
  getProjectHistory: async (
    projectId: string,
  ): Promise<Record<string, HistoryPoint[]>> => {
    const response = await api.get<HistoryResponse>(
      `/scraper/${projectId}/history`,
    );
    return response.data.analytics || {};
  },

  // 5. Получить список всех проектов пользователя
  getUserProjects: async (): Promise<BehanceProject[]> => {
    const response = await api.get<BehanceProject[]>("/scraper/projects");
    return response.data || [];
  },

  // 6. Удалить проект
  deleteProject: async (projectId: string): Promise<BehanceProject> => {
    const response = await api.delete<BehanceProject>(
      `/scraper/projects/${projectId}`,
    );
    return response.data;
  },

  // 7. Получить детальную информацию по проекту (матрица, статус, баланс)
  getProjectDetails: async (
    projectId: string,
  ): Promise<ProjectDetailsResponse> => {
    const response = await api.get<ProjectDetailsResponse>(
      `/scraper/project/${projectId}`,
    );
    return response.data;
  },

  // 8. Переключить конкретный тег на графике
  toggleTagOnChart: async (
    projectId: string,
    tagName: string,
    state: boolean,
  ): Promise<void> => {
    await api.patch(`/scraper/${projectId}/tags/chart`, { tagName, state });
  },

  // 9. Массово переключить все теги на графике
  toggleAllTagsOnChart: async (
    projectId: string,
    state: boolean,
  ): Promise<{ count: number }> => {
    const response = await api.patch<{ count: number }>(
      `/scraper/projects/${projectId}/tags/chart/bulk`,
      { state },
    );
    return response.data;
  },

  // 10. Переключить авто-обновление по расписанию (робот)
  toggleAutoUpdate: async (
    projectId: string,
    state: boolean,
  ): Promise<BehanceProject> => {
    const response = await api.patch<BehanceProject>(
      `/scraper/projects/${projectId}/schedule`,
      { isScheduled: state },
    );
    return response.data;
  },

  // 11. Создание ссылки на оплату
  createPayment: async (
    data: CreatePaymentDto,
  ): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>(
      "/billing/create-payment",
      data,
    );
    return response.data;
  },

  // 12. Получить демо-проект
  getDemoProject: async (): Promise<BehanceProject> => {
    const response = await api.get<BehanceProject>("/scraper/demo");
    return response.data;
  },
};
